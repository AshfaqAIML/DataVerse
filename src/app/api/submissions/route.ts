import { withApi } from "@/lib/api/handler";
import { paginated } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";
import { combineWhere, listWithPagination, parsePagination, parseSort } from "@/lib/api/query";

/**
 * GET /api/submissions — own code submissions (staff: all, filterable by
 * exerciseId/status). Includes per-case results for review.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["createdAt", "score", "status"]);
  const sp = ctx.req.nextUrl.searchParams;

  const whereParts: Record<string, unknown>[] = [];
  if (hasPermission(ctx.user, "submission:review")) {
    const userId = sp.get("userId");
    if (userId) whereParts.push({ userId });
  } else {
    whereParts.push({ userId: ctx.user!.id });
  }
  const exerciseId = sp.get("exerciseId");
  if (exerciseId) whereParts.push({ exerciseId });
  const status = sp.get("status");
  if (status) whereParts.push({ status });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { createdAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.submission.findMany({
        where,
        orderBy,
        ...a,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          exercise: {
            select: {
              id: true, title: true, difficulty: true, language: true,
              lesson: { select: { id: true, title: true, chapter: { select: { module: { select: { courseId: true, course: { select: { title: true } } } } } } } },
            },
          },
        },
      }),
    () => db.submission.count({ where }),
    page,
    pageSize
  );
  return paginated(items, meta);
});

