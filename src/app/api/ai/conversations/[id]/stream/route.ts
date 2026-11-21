import { withApi, parseBody } from "@/lib/api/handler";
import { NextResponse } from "next/server";
import { aiMessageSendSchema } from "@/lib/domain/schemas";
import { requirePermission } from "@/auth/rbac";
import { streamTutorMessage } from "@/lib/services/ai-tutor";

export const runtime = "nodejs";

/**
 * POST /api/ai/conversations/[id]/stream — send a message to Ada and stream
 * the reply over Server-Sent Events.
 *
 * Event protocol (text/event-stream):
 *   event: delta  data: {"delta": "..."}   — a token chunk of the reply
 *   event: done   data: {done, degraded, messageIds}
 *   event: error  data: {message}
 *
 * Same grounding/persistence contract as the non-streaming messages route:
 * the user message and the complete reply are persisted to the conversation
 * (so history stays intact) and answer keys are never revealed. The client
 * may fall back to POST .../messages if the stream drops.
 */
export const POST = withApi({ auth: true, rateLimit: "ai", bucket: "ai-send" }, async (ctx) => {
  requirePermission(ctx.user!, "ai:use");
  const { content } = await parseBody(ctx.req, aiMessageSendSchema);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        for await (const part of streamTutorMessage(ctx.user!.id, ctx.params.id, content)) {
          if (part.delta !== undefined) send("delta", { delta: part.delta });
          else if (part.done) send("done", part);
          else if (part.error) send("error", { message: part.error });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "The tutor stream failed.";
        try {
          send("error", { message });
        } catch {
          // controller already closed by client disconnect — nothing to do
        }
        controller.close();
        return;
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});
