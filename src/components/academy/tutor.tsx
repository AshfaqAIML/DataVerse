"use client";

/**
 * TutorView — Ada, the AI tutor, redesigned as a polished conversational
 * interface over the real conversation API:
 *
 *   GET  /api/ai/conversations          — history sidebar (persisted)
 *   GET  /api/ai/conversations/[id]     — full transcript on switch
 *   POST /api/ai/conversations          — new chat (optionally lesson-grounded)
 *   POST /api/ai/conversations/[id]/stream — SSE streaming reply
 *                                             (falls back to the non-stream
 *                                              messages endpoint on error)
 *
 * Rich rendering: markdown, GFM tables, syntax-highlighted code blocks with
 * copy buttons, and KaTeX math ($inline$ and $$display$$). Suggested
 * questions adapt to the attached lesson context. Sessions require an
 * account — anonymous visitors see an honest gate, no simulated chat.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import {
  BookOpen, Check, Copy, CornerDownLeft, Loader2, MessageSquarePlus, MessagesSquare,
  Paperclip, Send, Sparkles, UserRound, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/academy/auth-dialogs";

/* --------------------------------- types --------------------------------- */

interface ConversationRow {
  id: string;
  title: string | null;
  updatedAt: string;
  _count?: { messages: number };
  contextLesson?: { id: string; title: string } | null;
}

interface Message {
  id: string;
  /** SYSTEM rows (the grounded lesson context) arrive in transcripts and
   *  are filtered out of the visible thread. */
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}

interface LessonOption {
  id: string;
  title: string;
  courseTitle: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(path, { cache: "no-store", ...init });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, data: (body?.data ?? body) ?? null, error: body?.error?.message };
  } catch {
    return { ok: false, data: null, error: "network" };
  }
}

/* ------------------------------ markdown bits ----------------------------- */

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-editor-border">
      <div className="flex items-center justify-between border-b border-editor-border bg-editor-chrome px-3.5 py-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-editor-ink/70">{language || "code"}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-editor-ink/70 transition-colors hover:bg-editor-border/60 hover:text-editor-ink"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "python"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "12px 14px", fontSize: "12.5px", background: "var(--dv-editor-bg)" }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono, ui-monospace, monospace)" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="ada-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const text = String(children ?? "");
            const match = /language-(\w+)/.exec(className ?? "");
            const isBlock = match || text.includes("\n");
            if (isBlock) {
              return <CodeBlock language={match?.[1] ?? ""} code={text.replace(/\n$/, "")} />;
            }
            return (
              <code className="rounded bg-ink/8 px-1 py-0.5 font-mono text-[0.86em]" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>; // CodeBlock handles its own <pre>
          },
          a({ href, children }) {
            return (
              <a href={href} className="font-medium text-primary underline underline-offset-2" target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full border-collapse text-[13px]">{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ------------------------------ the tutor view ----------------------------- */

const GENERAL_SUGGESTIONS = [
  "Explain the difference between loc and iloc in pandas — with a tiny example",
  "Quiz me on SQL joins: give me one question at a time",
  "Walk me through the z-score formula step by step",
  "My KMeans labels changed between runs — what did I forget?",
];

const LESSON_SUGGESTIONS = [
  "Explain the core idea of this lesson in simpler terms",
  "Quiz me on this lesson — one question at a time",
  "What's the most common mistake learners make here?",
  "Give me a practice exercise based on this lesson",
];

export function TutorView() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [contextLesson, setContextLesson] = useState<LessonOption | null>(null);
  const [contextPickerOpen, setContextPickerOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  /* boot: session + history + lesson options */
  useEffect(() => {
    (async () => {
      const session = await api<{ authenticated: boolean }>("/api/auth/session");
      setAuthed(!!session.data?.authenticated);
      if (!session.data?.authenticated) return;
      const convs = await api<ConversationRow[]>("/api/ai/conversations");
      if (convs.ok && Array.isArray(convs.data)) setConversations(convs.data);
      // lesson options from enrolled courses (progress overview carries the tree)
      const enrollments = await api<Array<{ courseId: string; courseTitle: string }>>("/api/enrollments");
      const opts: LessonOption[] = [];
      if (enrollments.ok && Array.isArray(enrollments.data)) {
        for (const e of enrollments.data.slice(0, 4)) {
          const tree = await api<{
            modules: Array<{ lessons: Array<{ id: string; title: string; status: string }> }>;
          }>(`/api/progress/overview?courseId=${e.courseId}`);
          if (tree.ok && tree.data?.modules) {
            for (const m of tree.data.modules) {
              for (const l of m.lessons) {
                opts.push({ id: l.id, title: l.title, courseTitle: (e as { courseTitle?: string }).courseTitle ?? m.lessons[0]?.title ?? "" });
              }
            }
          }
        }
      }
      setLessons(opts.slice(0, 60));
    })();
  }, []);

  useEffect(() => {
    if (endRef.current) scrollIntoViewSafe(endRef.current);
  }, [messages, streamingText, busy]);

  /* load a conversation's transcript */
  const openConversation = useCallback(async (id: string) => {
    setLoadingHistory(true);
    setActiveId(id);
    setStreamingText(null);
    setDegraded(false);
    const convo = await api<{ id: string; messages: Message[]; contextLesson: { id: string; title: string } | null }>(
      `/api/ai/conversations/${id}`
    );
    setLoadingHistory(false);
    if (convo.ok && convo.data) {
      setMessages(convo.data.messages.filter((m) => m.role !== "SYSTEM"));
      setContextLesson(convo.data.contextLesson ? { id: convo.data.contextLesson.id, title: convo.data.contextLesson.title, courseTitle: "" } : null);
    }
  }, []);

  /* ------------------------------- send a message ------------------------------- */
  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || busy || authed !== true) return;
      setBusy(true);
      setDegraded(false);
      setDraft("");

      // ensure a conversation
      let convoId = activeId;
      if (!convoId) {
        const created = await api<{ id: string }>("/api/ai/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: text.slice(0, 60),
            ...(contextLesson ? { contextLessonId: contextLesson.id } : {}),
          }),
        });
        if (!created.ok || !created.data) {
          setBusy(false);
          setDegraded(true);
          return;
        }
        convoId = created.data.id;
        setActiveId(convoId);
        setConversations((prev) => [
          { id: convoId!, title: text.slice(0, 60), updatedAt: new Date().toISOString(), _count: { messages: 0 } },
          ...prev,
        ]);
      }

      setMessages((m) => [...m, { id: `local-user-${Date.now()}`, role: "USER", content: text }]);
      setStreamingText("");

      try {
        const res = await fetch(`/api/ai/conversations/${convoId}/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (!res.ok || !res.body) throw new Error("stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const evt of events) {
            const nameMatch = evt.match(/^event: (.+)$/m);
            const dataMatch = evt.match(/^data: (.+)$/m);
            const name = nameMatch?.[1] ?? "message";
            const payload = dataMatch ? JSON.parse(dataMatch[1]) : null;
            if (name === "delta" && payload?.delta) {
              full += payload.delta;
              setStreamingText(full);
            } else if (name === "done") {
              if (payload?.degraded) setDegraded(true);
              setMessages((m) => [...m, { id: `local-ada-${Date.now()}`, role: "ASSISTANT", content: full }]);
              setStreamingText(null);
            } else if (name === "error") {
              throw new Error(payload?.message ?? "stream error");
            }
          }
        }
        // stream closed without a done event (network drop) — keep what we have
        if (streamingText !== null) {
          setMessages((m) => [...m, { id: `local-ada-${Date.now()}`, role: "ASSISTANT", content: full }]);
          setStreamingText(null);
        }
      } catch {
        // fall back to the non-streaming endpoint
        const fallback = await api<{ assistantMessage: { content: string } }>(`/api/ai/conversations/${convoId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (fallback.ok && fallback.data) {
          setMessages((m) => [...m, { id: `local-ada-${Date.now()}`, role: "ASSISTANT", content: fallback.data!.assistantMessage.content }]);
        } else {
          setDegraded(true);
        }
        setStreamingText(null);
      } finally {
        setBusy(false);
      }
    },
    [activeId, authed, busy, contextLesson, streamingText]
  );

  const suggestions = contextLesson ? LESSON_SUGGESTIONS : GENERAL_SUGGESTIONS;
  const activeConvo = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  /* -------------------------------- render -------------------------------- */

  if (authed === null) {
    return <div className="dv-skel h-96 rounded-2xl border border-border-subtle" aria-hidden="true" />;
  }

  if (authed === false) {
    return (
      <div className="min-w-0 space-y-6">
        <header className="max-w-2xl">
          <p className="eyebrow text-violet-500">The tutor</p>
          <h1 className="t-page mt-2 text-ink">Ada, your AI tutor</h1>
          <p className="t-body mt-3">
            Socratic guidance grounded in the lessons you are reading: Ada explains, quizzes and traces beside you —
            with markdown, code blocks and real math rendering. Conversations are saved to your account.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-subtle/40 px-6 py-8 text-center">
          <MessagesSquare className="mx-auto h-7 w-7 text-violet-500" />
          <p className="mt-3 text-[15px] font-semibold text-ink">Ada talks to accounts, not browsers</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-3">
            Sign in and every conversation, with its lesson context, is kept and searchable. No simulated chat — the
            real tutor is one click away.
          </p>
          <Button className="mt-5" onClick={() => setAuthOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Sign in to meet Ada
          </Button>
        </div>
        <div className="mx-auto max-w-lg space-y-1.5">
          <p className="dv-kicker text-center">What asking Ada will be like</p>
          {GENERAL_SUGGESTIONS.map((s) => (
            <p key={s} className="rounded-lg border border-border-subtle bg-surface px-3.5 py-2 font-mono text-[11.5px] text-ink-2">
              {s}
            </p>
          ))}
        </div>
        <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => window.location.reload()} reason="Ada conversations live on your account." />
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
      {/* ------------------------------- sidebar ------------------------------- */}
      <aside className="space-y-3">
        <Button
          className="w-full"
          variant={activeId ? "outline" : "default"}
          onClick={() => {
            setActiveId(null);
            setMessages([]);
            setStreamingText(null);
            setContextLesson(null);
          }}
        >
          <MessageSquarePlus className="mr-1.5 h-4 w-4" /> New conversation
        </Button>

        {lessons.length > 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface p-2.5">
            <p className="dv-kicker mb-2 px-1">Lesson context</p>
            {contextLesson ? (
              <div className="flex items-start gap-2 rounded-lg bg-primary/8 px-2.5 py-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink">{contextLesson.title}</p>
                  <p className="t-meta">Ada sees this lesson</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContextLesson(null)}
                  className="rounded p-0.5 text-ink-3 hover:text-ink"
                  aria-label="Detach lesson context"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setContextPickerOpen((v) => !v)}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border-strong px-2.5 py-2 text-left text-[12.5px] text-ink-2 transition-colors hover:border-primary/50"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Attach a lesson (grounded answers)
              </button>
            )}
            {contextPickerOpen && (
              <div className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setContextLesson(l);
                      setContextPickerOpen(false);
                      setActiveId(null); // context applies to the next conversation
                      setMessages([]);
                    }}
                    className="block w-full truncate rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-ink-2 transition-colors hover:bg-accent"
                    title={l.title}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <p className="dv-kicker mb-2 px-1">History</p>
          {conversations.length === 0 ? (
            <p className="t-caption px-1">No conversations yet — your first question starts one.</p>
          ) : (
            <div className="max-h-[26rem] space-y-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => void openConversation(c.id)}
                  className={cn(
                    "block w-full rounded-lg px-2.5 py-2 text-left transition-colors",
                    c.id === activeId ? "bg-primary/10 text-ink" : "text-ink-2 hover:bg-accent"
                  )}
                >
                  <p className="truncate text-[12.5px] font-medium">{c.title ?? "Conversation"}</p>
                  <p className="t-meta">
                    {c._count?.messages ?? 0} messages · {new Date(c.updatedAt).toLocaleDateString()}
                    {c.contextLesson ? " · lesson" : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ------------------------------- chat pane ------------------------------- */}
      <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
        {/* header */}
        <div className="flex items-center gap-2.5 border-b border-border-subtle bg-surface-subtle/50 px-5 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-violet-500)_14%,transparent)]">
            <Sparkles className="h-4 w-4 text-violet-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-ink">Ada</p>
            <p className="truncate text-[11px] text-ink-3">
              {contextLesson
                ? `grounded in “${contextLesson.title}”`
                : activeConvo?.contextLesson
                  ? `grounded in a lesson`
                  : "Socratic tutor · data science, code and statistics"}
            </p>
          </div>
          {degraded && (
            <span className="ml-auto rounded-lg bg-warning-text/10 px-2.5 py-1 text-[11.5px] font-medium text-warning-text">
              tutor service busy — message saved
            </span>
          )}
        </div>

        {/* messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && streamingText === null && !busy && (
            <div className="space-y-2.5 py-6">
              <p className="t-caption">Start with one of these — or ask anything:</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="dv-card-hover block w-full rounded-xl border border-border-subtle bg-surface-subtle/60 px-3.5 py-2.5 text-left text-[13px] text-ink-2 hover:border-primary/40 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) =>
            m.role === "USER" ? (
              <div key={m.id} className="dv-msg flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[13.5px] leading-relaxed text-primary-foreground shadow-e1">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="dv-msg flex items-start gap-2.5">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-violet-500)_14%,transparent)]">
                  <Sparkles className="h-3 w-3 text-violet-500" />
                </span>
                <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md border border-border-subtle bg-surface-subtle/50 px-4 py-3 text-[13.5px] leading-relaxed text-ink">
                  <Markdown content={m.content} />
                </div>
              </div>
            )
          )}

          {loadingHistory && (
            <div className="flex items-center gap-2 text-[13px] text-ink-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading transcript…
            </div>
          )}

          {streamingText !== null && (
            <div className="dv-msg flex items-start gap-2.5">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-violet-500)_14%,transparent)]">
                <Sparkles className="h-3 w-3 text-violet-500" />
              </span>
              <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md border border-border-subtle bg-surface-subtle/50 px-4 py-3 text-[13.5px] leading-relaxed text-ink">
                {streamingText ? <Markdown content={streamingText} /> : <AdaThinking />}
              </div>
            </div>
          )}

          {busy && streamingText === null && messages.length > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-violet-500)_14%,transparent)]">
                <Sparkles className="h-3 w-3 text-violet-500" />
              </span>
              <AdaThinking />
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* composer */}
        <form
          className="border-t border-border-subtle px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-border-subtle bg-surface-inset px-3 py-2 transition-colors focus-within:border-primary/40">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              rows={1}
              placeholder="Ask about any lesson, concept, formula or line of code…"
              aria-label="Message to Ada"
              className="max-h-40 min-h-6 flex-1 resize-none bg-transparent py-1 text-[14px] leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
              aria-label="Send message"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 px-1 text-[11px] text-ink-3">
            <CornerDownLeft className="h-3 w-3" /> Enter sends · Shift+Enter adds a line · Ada guides rather than
            reveals answers
          </p>
        </form>
      </section>
    </div>
  );
}

function AdaThinking() {
  return (
    <span className="inline-flex gap-1 rounded-lg px-1 py-2" aria-label="Ada is thinking">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:240ms]" />
    </span>
  );
}
