import { withApi, parseBody } from "@/lib/api/handler";
import { created } from "@/lib/api/errors";
import { aiMessageSendSchema } from "@/lib/domain/schemas";
import { requirePermission } from "@/auth/rbac";
import { sendTutorMessage } from "@/lib/services/ai-tutor";

/**
 * POST /api/ai/conversations/[id]/messages — send a message to Ada.
 * Server-side LLM call (z-ai-web-dev-sdk, backend-only) with the Socratic
 * system prompt + lesson-grounded context; the reply is persisted with the
 * conversation. If the provider is unreachable the message is still saved
 * and a degraded notice is returned (never a silent failure).
 */
export const POST = withApi({ auth: true, rateLimit: "ai", bucket: "ai-send" }, async (ctx) => {
  requirePermission(ctx.user!, "ai:use");
  const { content } = await parseBody(ctx.req, aiMessageSendSchema);
  const result = await sendTutorMessage(ctx.user!.id, ctx.params.id, content);
  return created(result, {
    message: result.degraded ? "The tutor service is busy — your message was saved, try again shortly" : undefined,
    degraded: result.degraded,
  });
});
