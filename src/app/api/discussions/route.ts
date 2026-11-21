import { withApi, parseBody } from "@/lib/api/handler";
import { created, forbidden } from "@/lib/api/errors";
import { discussionCreateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { makeListHandler } from "@/lib/api/crud";
import { discussionsCrud } from "@/lib/api/crud-configs";

/**
 * GET  /api/discussions — public forum (search/filter/sort/paginate)
 * POST /api/discussions — any authenticated user may open a discussion
 *        (content authors set `pinned`)
 */
export const GET = makeListHandler(discussionsCrud);

export const POST = withApi({ auth: true, rateLimit: "write", bucket: "discussion-create" }, async (ctx) => {
  const data = await parseBody(ctx.req, discussionCreateSchema);

  // validate attachment
  if (data.lessonId) {
    const lesson = await db.lesson.findUnique({ where: { id: data.lessonId }, select: { id: true } });
    if (!lesson) throw forbidden("Referenced lesson does not exist");
  }
  if (data.courseId) {
    const course = await db.course.findUnique({ where: { id: data.courseId }, select: { id: true } });
    if (!course) throw forbidden("Referenced course does not exist");
  }

  const discussion = await db.discussion.create({
    data: {
      userId: ctx.user!.id,
      title: data.title,
      body: data.body,
      lessonId: data.lessonId,
      courseId: data.courseId,
      pinned: ctx.user!.permissions.includes("discussion:moderate") ? data.pinned ?? false : false,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
      lesson: { select: { id: true, title: true } },
      course: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
  });
  return created(discussion);
});

