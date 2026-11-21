import { withApi, parseBody } from "@/lib/api/handler";
import { ok, notFound, forbidden } from "@/lib/api/errors";
import { discussionUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";

/**
 * GET    /api/discussions/[id] — discussion with comment thread (public)
 * PATCH  /api/discussions/[id] — edit (owner) / moderate: pin, resolve,
 *         archive (discussion:moderate)
 * DELETE /api/discussions/[id] — delete (owner or moderator)
 */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const discussion = await db.discussion.findUnique({
    where: { id: ctx.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      lesson: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
          replies: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        },
      },
    },
  });
  if (!discussion) throw notFound("Discussion not found");

  // increment views (fire and forget — not critical)
  await db.discussion.update({ where: { id: discussion.id }, data: { views: { increment: 1 } } }).catch(() => undefined);

  return ok(discussion);
});

export const PATCH = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const discussion = await db.discussion.findUnique({ where: { id: ctx.params.id } });
  if (!discussion) throw notFound("Discussion not found");

  const isOwner = discussion.userId === ctx.user!.id;
  const isModerator = hasPermission(ctx.user, "discussion:moderate");
  if (!isOwner && !isModerator) throw forbidden("You can only edit your own discussions");

  const data = await parseBody(ctx.req, discussionUpdateSchema);
  // pinning/archive are moderation powers
  if (data.pinned !== undefined && !isModerator) delete data.pinned;
  if (data.status !== undefined && !isModerator) delete (data as Record<string, unknown>).status;

  const updated = await db.discussion.update({
    where: { id: discussion.id },
    data,
    include: { user: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
  });
  return ok(updated);
});

export const DELETE = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const discussion = await db.discussion.findUnique({ where: { id: ctx.params.id } });
  if (!discussion) throw notFound("Discussion not found");
  const isOwner = discussion.userId === ctx.user!.id;
  const isModerator = hasPermission(ctx.user, "discussion:moderate");
  if (!isOwner && !isModerator) throw forbidden("You can only delete your own discussions");

  await db.discussion.delete({ where: { id: discussion.id } }); // cascades comments
  return ok({ id: discussion.id, deleted: true });
});
