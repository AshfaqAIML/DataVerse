import { withApi } from "@/lib/api/handler";
import { paginated } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { listWithPagination, parsePagination, parseSearch, parseSort } from "@/lib/api/query";

/**
 * GET /api/achievements — achievement catalogue (public).
 * Authenticated users also get their own unlock state via ?unlocked=mine.
 */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const { page, pageSize } = parsePagination(ctx.req);
  const sort = parseSort(ctx.req, ["title", "points", "createdAt"]);
  const search = parseSearch(ctx.req, ["title", "description", "code"]);
  const sp = ctx.req.nextUrl.searchParams;

  const where = search ? { OR: search.fields.map((f) => ({ [f]: { contains: search.q } })) } : {};
  const orderBy = sort.length
    ? Object.assign({}, ...sort.map((s) => ({ [s.field]: s.dir })))
    : { points: "asc" };

  const [items, meta] = await listWithPagination(
    (a) => db.achievement.findMany({ where, orderBy, ...a }),
    () => db.achievement.count({ where }),
    page,
    pageSize
  );

  // decorate with the viewer's unlock state when requested
  const mine = sp.get("unlocked") === "mine" && ctx.user;
  let unlockedIds: Set<string> | null = null;
  if (mine) {
    const unlocks = await db.achievementUnlock.findMany({
      where: { userId: ctx.user!.id },
      select: { achievementId: true, unlockedAt: true },
    });
    unlockedIds = new Set(unlocks.map((u) => u.achievementId));
  }

  const decorated = await Promise.all(
    items.map(async (a) => {
      const unlocks = await db.achievementUnlock.count({ where: { achievementId: a.id } });
      return {
        ...a,
        totalUnlocks: unlocks,
        ...(unlockedIds
          ? { unlocked: unlockedIds.has(a.id) }
          : {}),
      };
    })
  );

  return paginated(decorated, meta);
});

