import { withApi, parseBody } from "@/lib/api/handler";
import { ok, paginated, badRequest } from "@/lib/api/errors";
import { userUpdateSchema } from "@/lib/domain/schemas";
import { db } from "@/lib/db";
import { requirePermission } from "@/auth/rbac";
import { combineWhere, listWithPagination, parsePagination, parseSearch, parseSort } from "@/lib/api/query";

/**
 * GET /api/users — staff directory (user:read).
 * Paginated, searchable, filterable (filter[role]=STUDENT, filter[status]=ACTIVE),
 * sortable by name/email/createdAt/status.
 */
export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  requirePermission(ctx.user!, "user:read");
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["name", "email", "createdAt", "status"]);
  const search = parseSearch(ctx.req, ["name", "email", "headline"]);
  const sp = ctx.req.nextUrl.searchParams;

  // filters: role (by key) + status
  const whereParts: Record<string, unknown>[] = [];
  const roleKey = sp.get("filter[role]");
  if (roleKey) {
    const role = await db.role.findUnique({ where: { key: roleKey } });
    whereParts.push({ roleId: role ? role.id : "none" });
  }
  const status = sp.get("filter[status]");
  if (status) whereParts.push({ status });
  if (search) whereParts.push({ OR: search.fields.map((f) => ({ [f]: { contains: search.q } })) });

  const where = combineWhere(...whereParts);
  const orderBy = sort.length ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir }))) : { createdAt: "desc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.user.findMany({
        where,
        orderBy,
        ...a,
        select: {
          id: true, email: true, name: true, avatarUrl: true, headline: true, bio: true,
          status: true, createdAt: true,
          role: { select: { id: true, key: true, name: true } },
          _count: { select: { enrollments: true, certificates: true, achievementUnlocks: true, taughtCourses: true } },
        },
      }),
    () => db.user.count({ where }),
    page,
    pageSize
  );

  return paginated(items, meta);
});

/** POST /api/users — not supported: registration happens via /api/auth/register. */
export const POST = withApi({ auth: true, rateLimit: "write" }, async () => {
  throw badRequest("User registration happens via POST /api/auth/register");
});
