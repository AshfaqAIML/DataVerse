import { withApi } from "@/lib/api/handler";
import { paginated } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { listWithPagination, parsePagination, parseSearch, parseSort } from "@/lib/api/query";

/**
 * GET /api/roles — the role catalogue with permission lists.
 * Public: powers registration UI hints and the console RBAC panel.
 */
export const GET = withApi({ rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["rank", "name", "createdAt"]);
  const search = parseSearch(ctx.req, ["key", "name", "description"]);

  const where = search ? { OR: search.fields.map((f) => ({ [f]: { contains: search.q } })) } : {};
  const orderBy = sort.length ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir }))) : { rank: "asc" };

  const [items, meta] = await listWithPagination(
    (a) =>
      db.role.findMany({
        where,
        orderBy,
        ...a,
        include: {
          rolePermissions: { include: { permission: { select: { key: true, description: true } } } },
          _count: { select: { users: true } },
        },
      }),
    () => db.role.count({ where }),
    page,
    pageSize
  );

  return paginated(
    items.map((r) => ({
      id: r.id,
      key: r.key,
      name: r.name,
      description: r.description,
      rank: r.rank,
      permissions: r.rolePermissions.map((rp) => rp.permission),
      userCount: r._count.users,
    })),
    meta
  );
});

