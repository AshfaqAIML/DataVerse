import { withApi, parseBody } from "@/lib/api/handler";
import { created, ok, notFound } from "@/lib/api/errors";
import { commentCreateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";

/**
 * POST /api/discussions/[id]/comments — reply to a discussion (auth).
 * GET  /api/discussions/[id]/comments — thread (public, paginated).
 */
export const POST = withApi({ auth: true, rateLimit: "write", bucket: "comment-create" }, async (ctx) => {
  const discussion = await db.discussion.findUnique({ where: { id: ctx.params.id }, select: { id: true, status: true, userId: true, title: true } });
  if (!discussion) throw notFound("Discussion not found");
  if (discussion.status === "ARCHIVED") throw notFound("This discussion is archived");

  const data = await parseBody(ctx.req, commentCreateSchema);
  if (data.parentId) {
    const parent = await db.comment.findUnique({ where: { id: data.parentId }, select: { id: true, discussionId: true } });
    if (!parent || parent.discussionId !== discussion.id) {
      throw notFound("Parent comment not found in this discussion");
    }
  }

  const comment = await db.comment.create({
    data: {
      discussionId: discussion.id,
      userId: ctx.user!.id,
      body: data.body,
      parentId: data.parentId,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      parent: { select: { id: true, userId: true } },
    },
  });

  // notify the thread starter (never self-notify)
  if (discussion.userId !== ctx.user!.id) {
    await db.notification.create({
      data: {
        userId: discussion.userId,
        kind: "SOCIAL",
        title: "New reply to your discussion",
        body: `${ctx.user!.name} replied to "${discussion.title}".`,
        link: "/academy/discussions/" + discussion.id,
      },
    }).catch(() => undefined);
  }

  return created(comment);
});

export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const discussion = await db.discussion.findUnique({ where: { id: ctx.params.id }, select: { id: true } });
  if (!discussion) throw notFound("Discussion not found");

  const comments = await db.comment.findMany({
    where: { discussionId: discussion.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      replies: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });
  return ok(comments);
});
