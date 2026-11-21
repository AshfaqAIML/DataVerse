import { db } from "@/lib/db";
import { AppError, notFound } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { ROLE_PERMISSIONS } from "@/lib/domain/constants";

/**
 * AI tutor service — "Ada".
 *
 * Design contract (PRODUCT_REQUIREMENTS.md FR-14, SYSTEM_ARCHITECTURE.md
 * ADR-007):
 *   - Deterministic-first: the model receives a strict Socratic system
 *     prompt; it must never reveal quiz answers or exercise solutions.
 *   - Grounded (RAG-lite): when the conversation is attached to a lesson,
 *     the lesson's sections + relevant glossary terms are injected as
 *     context so answers stay on-syllabus.
 *   - The LLM call runs server-side only (z-ai-web-dev-sdk is backend-only
 *     per the platform rules); the client never sees provider details.
 */

export const ADA_SYSTEM_PROMPT = `You are Ada, the AI tutor of DataVerse Academy.
Your teaching contract:
- Guide with questions. Never give the final answer to a quiz question or exercise solution directly.
- If a learner is stuck, break the problem into a smaller step and ask a guiding question about that step.
- Use the provided lesson context and glossary definitions as the source of truth. If the answer is outside the syllabus, say so and relate it back to what the learner already knows.
- Keep responses under 180 words, friendly and encouraging, aimed at absolute beginners.
- End every response with exactly one concrete next step or question for the learner.
- Never claim to have graded work or issued certificates.`;

const MAX_CONTEXT_CHARS = 6_000;
const MAX_HISTORY_MESSAGES = 12;

function truncate(s: string, max = MAX_CONTEXT_CHARS): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/** Builds grounded context for a lesson-attached conversation. */
async function buildLessonContext(lessonId: string): Promise<string> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: { include: { module: { include: { course: { select: { title: true } } } } } },
      sections: { orderBy: { orderIndex: "asc" } },
      quizzes: { include: { questions: { select: { prompt: true } } } },
      exercises: { select: { title: true, prompt: true } },
    },
  });
  if (!lesson) throw notFound("Lesson not found");

  const glossary = await db.glossaryTerm.findMany({
    take: 30,
    orderBy: { term: "asc" },
    select: { term: true, definition: true },
  });

  const parts = [
    `Course: ${lesson.chapter.module.course.title}`,
    `Module: ${lesson.chapter.module.title} → Chapter: ${lesson.chapter.title}`,
    `Lesson: ${lesson.title}`,
    "",
    "Lesson content (learner is studying this):",
    ...lesson.sections.map(
      (s) => `[${s.kind}] ${s.title ?? ""}\n${truncate(s.content, 1_200)}`
    ),
  ];

  if (lesson.quizzes.length > 0) {
    parts.push("", "Quiz question topics in this lesson (do NOT reveal answers):");
    lesson.quizzes.forEach((q) => q.questions.forEach((qq) => parts.push(`- ${truncate(qq.prompt, 200)}`)));
  }
  if (lesson.exercises.length > 0) {
    parts.push("", "Exercises in this lesson (do NOT reveal solutions):");
    lesson.exercises.forEach((e) => parts.push(`- ${e.title}: ${truncate(e.prompt, 200)}`));
  }
  parts.push("", "Glossary reference:", ...glossary.map((g) => `- ${g.term}: ${truncate(g.definition, 300)}`));

  return truncate(parts.join("\n"), MAX_CONTEXT_CHARS);
}

export async function createConversation(userId: string, title?: string, contextLessonId?: string) {
  if (contextLessonId) {
    const lesson = await db.lesson.findUnique({ where: { id: contextLessonId } });
    if (!lesson) throw notFound("Lesson not found");
  }
  return db.aIConversation.create({
    data: { userId, title: title ?? "Conversation with Ada", contextLessonId },
    include: { messages: true },
  });
}

export async function listConversations(userId: string) {
  return db.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } }, contextLesson: { select: { id: true, title: true } } },
  });
}

export async function getConversation(userId: string, conversationId: string) {
  const conversation = await db.aIConversation.findFirst({
    where: { id: conversationId, userId }, // ownership scoping at query level
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      contextLesson: { select: { id: true, title: true } },
    },
  });
  if (!conversation) throw notFound("Conversation not found");
  return conversation;
}

export async function sendTutorMessage(userId: string, conversationId: string, content: string) {
  const { messages } = await buildTutorMessages(userId, conversationId, content);

  let replyText: string;
  let degraded = false;
  try {
    // Backend-only SDK call — never exposed to the client.
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });
    replyText =
      response?.choices?.[0]?.message?.content ??
      (typeof response === "string" ? response : "");
    if (!replyText) throw new Error("Empty completion");
  } catch (err) {
    logger.error("ai_tutor_failed", {
      conversationId,
      err: err instanceof Error ? err.message : String(err),
    });
    degraded = true;
    replyText =
      "I could not reach the tutor service just now. Please try again in a moment — your message was saved and we can continue right where you left off.";
  }

  const { userMessage, assistantMessage } = await persistExchange(conversationId, content, replyText);
  return { userMessage, assistantMessage, degraded };
}

/**
 * Streaming variant — same grounding and persistence contract as
 * sendTutorMessage, but the LLM call runs with stream: true and deltas are
 * yielded to the caller (the SSE route) as they arrive. The full reply is
 * persisted once the stream closes, so conversation history stays complete.
 *
 * Chunk-shape tolerance: depending on transport, the SDK may yield (a)
 * standard completion chunks ({choices:[{delta:{content}}]}), (b) plain
 * string deltas, or (c) the raw SSE body (as a string or a boxed String
 * object — String(chunk) recovers it) whose "data: …" lines each carry a
 * JSON chunk. The parser below handles all three, including SSE lines
 * split across yields.
 */
export async function* streamTutorMessage(
  userId: string,
  conversationId: string,
  content: string
): AsyncGenerator<{ delta?: string; done?: boolean; degraded?: boolean; userMessageId?: string; assistantMessageId?: string; error?: string }> {
  const { messages, conversation } = await buildTutorMessages(userId, conversationId, content);

  let replyText = "";
  let degraded = false;
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages,
      stream: true,
      thinking: { type: "disabled" },
    });

    let sseBuffer = ""; // holds a possibly-partial trailing SSE line between yields

    const yieldSseLine = function* (line: string): Generator<{ delta: string }> {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) return;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
        };
        const delta = parsed?.choices?.[0]?.delta?.content ?? parsed?.choices?.[0]?.message?.content ?? "";
        if (delta) yield { delta };
      } catch {
        // not JSON — some transports stream plain text framed as data: lines
        if (payload) yield { delta: payload };
      }
    };

    if (response && typeof (response as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function") {
      for await (const chunk of response) {
        // (a) standard completion chunk
        const std =
          (chunk as { choices?: Array<{ delta?: { content?: string } }> } | null)?.choices?.[0]?.delta?.content ??
          (chunk as { delta?: string } | null)?.delta;
        if (typeof std === "string" && std) {
          replyText += std;
          yield { delta: std };
          continue;
        }
        // (b)/(c) text carrying the SSE body: string primitive, boxed String
        // object, or — as the transport actually delivers — a Uint8Array of
        // UTF-8 bytes (String() on that yields "100,97,…", so decode instead)
        const text =
          typeof chunk === "string"
            ? chunk
            : chunk instanceof Uint8Array
              ? new TextDecoder().decode(chunk)
              : Array.isArray(chunk)
                ? new TextDecoder().decode(Uint8Array.from(chunk))
                : chunk && typeof chunk === "object" && String(chunk) !== "[object Object]"
                  ? String(chunk)
                  : null;
        if (!text) continue;
        if (!text.includes("data:")) {
          // plain text delta
          replyText += text;
          yield { delta: text };
          continue;
        }
        // SSE body — parse line by line, keeping a partial trailing line buffered
        sseBuffer += text;
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";
        for (const line of lines) {
          for (const { delta } of yieldSseLine(line)) {
            replyText += delta;
            yield { delta };
          }
        }
      }
      // flush any buffered partial line
      for (const { delta } of yieldSseLine(sseBuffer)) {
        replyText += delta;
        yield { delta };
      }
    } else {
      // provider returned a full response despite stream: true
      replyText =
        (response as { choices?: Array<{ message?: { content?: string } }> } | null)?.choices?.[0]?.message?.content ??
        (typeof response === "string" ? response : "");
      if (replyText) yield { delta: replyText };
    }
    if (!replyText) throw new Error("Empty completion");
  } catch (err) {
    logger.error("ai_tutor_stream_failed", {
      conversationId,
      err: err instanceof Error ? err.message : String(err),
    });
    degraded = true;
    const fallback =
      "I could not reach the tutor service just now. Please try again in a moment — your message was saved and we can continue right where you left off.";
    replyText = fallback;
    yield { delta: fallback, degraded: true };
  }

  const { userMessage, assistantMessage } = await persistExchange(conversationId, content, replyText);
  yield { done: true, degraded, userMessageId: userMessage.id, assistantMessageId: assistantMessage.id };
}

/* ------------------------------------------------------------- shared core */

async function buildTutorMessages(userId: string, conversationId: string, content: string) {
  const conversation = await db.aIConversation.findFirst({
    where: { id: conversationId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) throw notFound("Conversation not found");

  let contextBlock = "";
  if (conversation.contextLessonId) {
    try {
      contextBlock = await buildLessonContext(conversation.contextLessonId);
    } catch {
      contextBlock = ""; // lesson may have been deleted (SetNull handles FK; ignore content)
    }
  }

  const history = conversation.messages
    .filter((m) => m.role !== "SYSTEM")
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const messages = [
    {
      role: "system" as const,
      content: contextBlock
        ? `${ADA_SYSTEM_PROMPT}\n\n--- LESSON CONTEXT ---\n${contextBlock}`
        : `${ADA_SYSTEM_PROMPT}\n\n(No lesson attached — answer generally about data science, AI, statistics and programming for beginners.)`,
    },
    ...history,
    { role: "user" as const, content },
  ];
  return { messages, conversation };
}

async function persistExchange(conversationId: string, content: string, replyText: string) {
  // persist the learner message first (source of truth), then the reply
  const userMessage = await db.aIMessage.create({
    data: { conversationId, role: "USER", content },
  });
  const assistantMessage = await db.aIMessage.create({
    data: { conversationId, role: "ASSISTANT", content: replyText },
  });
  const convo = await db.aIConversation.findUnique({ where: { id: conversationId }, select: { title: true } });
  await db.aIConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date(), ...(convo && !convo.title ? { title: content.slice(0, 60) } : {}) },
  }).catch(() => null);
  return { userMessage, assistantMessage };
}

/** Static mirror exposure for the console RBAC panel. */
export { ROLE_PERMISSIONS };
