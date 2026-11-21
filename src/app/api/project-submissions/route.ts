import { withApi } from "@/lib/api/handler";
import { ok, paginated } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { hasPermission } from "@/auth/rbac";
import { combineWhere, listWithPagination, parsePagination, parseSort } from "@/lib/api/query";

/**
 * GET /api/project-submissions — capstone submissions across projects.
 * Learners see their own; staff (project:review) see all with filters.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["submittedAt", "status", "score"]);
  const sp = ctx.req.nextUrl.searchParams;

  const whereParts: Record<string, unknown>[] = [];
  if (hasPermission(ctx.user, "project:review")) {
    const userId = sp.get("userId");
    if (userId) whereParts.push({ userId });
  } else {
    whereParts.push({ userId: ctx.user!.id });
  }
  const projectId = sp.get("projectId");
  if (projectId) whereParts.push({ projectId });
  const status = sp.get("status");
  if (status) whereParts.push({ status });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { submittedAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.projectSubmission.findMany({
        where,
        orderBy,
        ...a,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, headline: true } },
          project: { select: { id: true, title: true, difficulty: true, points: true, course: { select: { id: true, slug: true, title: true } } } },
          reviewedBy: { select: { id: true, name: true } },
        },
      }),
    () => db.projectSubmission.count({ where }),
    page,
    pageSize
  );
  return paginated(items, meta);
});
