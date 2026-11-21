import { withApi } from "@/lib/api/handler";
import { paginated } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";
import { combineWhere, listWithPagination, parsePagination, parseSort } from "@/lib/api/query";

/**
 * GET /api/assessment-attempts — own graded attempts (staff: all).
 * Attempt lifecycle: start at POST /api/quizzes/[id]/attempts, submit at
 * POST /api/assessment-attempts/[id]/submit, detail at GET /api/assessment-attempts/[id].
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["createdAt", "score", "submittedAt"]);
  const sp = ctx.req.nextUrl.searchParams;

  const whereParts: Record<string, unknown>[] = [];
  if (hasPermission(ctx.user, "analytics:read-all")) {
    const userId = sp.get("userId");
    if (userId) whereParts.push({ userId });
  } else {
    whereParts.push({ userId: ctx.user!.id });
  }
  const quizId = sp.get("quizId");
  if (quizId) whereParts.push({ quizId });
  const status = sp.get("status");
  if (status) whereParts.push({ status });
  const passed = sp.get("passed");
  if (passed === "true" || passed === "false") whereParts.push({ passed: passed === "true" });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { createdAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.assessmentAttempt.findMany({
        where,
        orderBy,
        ...a,
        include: {
          user: { select: { id: true, name: true } },
          quiz: { select: { id: true, title: true, lesson: { select: { id: true, title: true } } } },
        },
      }),
    () => db.assessmentAttempt.count({ where }),
    page,
    pageSize
  );
  return paginated(items, meta);
});
