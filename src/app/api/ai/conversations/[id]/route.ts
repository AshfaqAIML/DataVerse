import { withApi } from "@/lib/api/handler";
import { ok, notFound } from "@/lib/api/errors";
import { getConversation } from "@/lib/services/ai-tutor";
import { db } from "@/lib/db";

/**
 * GET    /api/ai/conversations/[id] — conversation with messages (owner only)
 * DELETE /api/ai/conversations/[id] — archive conversation (owner only)
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const conversation = await getConversation(ctx.user!.id, ctx.params.id);
  return ok(conversation);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const conversation = await db.aIConversation.findFirst({
    where: { id: ctx.params.id, userId: ctx.user!.id },
  });
  if (!conversation) throw notFound("Conversation not found");
  await db.aIConversation.delete({ where: { id: conversation.id } }); // cascades messages
  return ok({ id: conversation.id, deleted: true });
});

