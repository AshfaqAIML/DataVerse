import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { commentUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";

/**
 * GET    /api/comments/[id] — comment detail (public)
 * PATCH  /api/comments/[id] — edit body (owner)
 * DELETE /api/comments/[id] — delete (owner or moderator; cascades replies)
 */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const comment = await db.comment.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      discussion: { select: { id: true, title: true, status: true } },
      replies: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });
  if (!comment) throw notFound("Comment not found");
  return ok(comment);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const comment = await db.comment.findUnique({ where: { id: ctx.params.id } });
  if (!comment) throw notFound("Comment not found");
  if (comment.userId !== ctx.user!.id) throw forbidden("You can only edit your own comments");

  const data = await parseBody(ctx.req, commentUpdateSchema);
  const updated = await db.comment.update({
    where: { id: comment.id },
    data,
    include: { user: { select: { id: true, name: true } } },
  });
  return ok(updated);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const comment = await db.comment.findUnique({ where: { id: ctx.params.id } });
  if (!comment) throw notFound("Comment not found");
  const isOwner = comment.userId === ctx.user!.id;
  const isModerator = hasPermission(ctx.user, "discussion:moderate");
  if (!isOwner && !isModerator) throw forbidden("You can only delete your own comments");

  await db.comment.delete({ where: { id: comment.id } }); // cascades replies
  return ok({ id: comment.id, deleted: true });
});
