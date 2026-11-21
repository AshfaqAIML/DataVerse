import { withApi, parseBody } from "@/lib/api/handler";
import { created, badRequest, paginated } from "@/lib/api/errors";
import { progressRecordSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { recordLessonProgress } from "@/lib/services/progress";
import { combineWhere, listWithPagination, parsePagination, parseSort } from "@/lib/api/query";

/**
 * POST /api/progress — record a lesson progress event (enrolled learners).
 * Single write path: updates Lesson/Module/Course progress, enrollment
 * completion, certificates and achievements as a side effect.
 *
 * GET /api/progress — own lesson-level progress rows (paginated,
 * filterable via filter[status] / filter[lessonId]).
 */
export const POST = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const user = ctx.user!;
  if (!user.permissions.includes("progress:write")) {
    throw badRequest("Your role cannot record learning progress");
  }
  const body = await parseBody(ctx.req, progressRecordSchema);
  const result = await recordLessonProgress(user.id, body.lessonId, {
    status: body.status,
    timeSpentMinutes: body.timeSpentMinutes,
    lastSectionIndex: body.lastSectionIndex,
  });
  return created(result, {
    message:
      result.courseState && result.courseState.percentage >= 100
        ? "Course complete — certificate issued!"
        : undefined,
  });
});

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["lastAccessedAt", "completedAt", "createdAt"]);
  const sp = ctx.req.nextUrl.searchParams;

  const whereParts: Record<string, unknown>[] = [{ userId: ctx.user!.id }];
  const status = sp.get("filter[status]");
  if (status) whereParts.push({ status });
  const lessonId = sp.get("filter[lessonId]");
  if (lessonId) whereParts.push({ lessonId });
  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { lastAccessedAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.lessonProgress.findMany({
        where,
        orderBy,
        ...a,
        include: { lesson: { select: { id: true, title: true, estimatedMinutes: true, chapter: { select: { title: true, module: { select: { title: true, courseId: true } } } } } } },
      }),
    () => db.lessonProgress.count({ where }),
    page,
    pageSize
  );
  return paginated(items, meta);
});
