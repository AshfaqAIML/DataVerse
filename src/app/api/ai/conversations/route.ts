import { withApi, parseBody } from "@/lib/api/handler";
import { ok, created } from "@/lib/api/errors";
import { aiConversationCreateSchema } from "@/lib/domain/schemas";
import { requirePermission } from "@/auth/rbac";
import { createConversation, listConversations } from "@/lib/services/ai-tutor";

/**
 * GET  /api/ai/conversations — own Ada conversations (most recent first)
 * POST /api/ai/conversations — start a conversation (ai:use), optionally
 *       attached to a lesson for grounded context
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const conversations = await listConversations(ctx.user!.id);
  return ok(conversations);
});

export const POST = withApi({ auth: true, rateLimit: "ai", bucket: "ai-create" }, async (ctx) => {
  requirePermission(ctx.user!, "ai:use");
  const data = await parseBody(ctx.req, aiConversationCreateSchema);
  const conversation = await createConversation(ctx.user!.id, data.title, data.contextLessonId);
  return created(conversation, { message: "Ada is ready — ask a question about the lesson" });
});
