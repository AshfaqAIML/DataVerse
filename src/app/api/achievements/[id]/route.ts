import { withApi } from "@/lib/api/handler";
import { ok, notFound } from "@/lib/api/errors";
import { db } from "@/lib/db";

/** GET /api/achievements/[id] — achievement detail + unlock stats (public). */
export const GET = withApi({ auth: false, rateLimit: "read" }, async (ctx) => {
  const achievement = await db.achievement.findUnique({
    where: { id: ctx.params.id },
    include: {
      _count: { select: { unlocks: true } },
    },
  });
  if (!achievement) throw notFound("Achievement not found");

  const recent = await db.achievementUnlock.findMany({
    where: { achievementId: achievement.id },
    orderBy: { unlockedAt: "desc" },
    take: 5,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return ok({
    ...achievement,
    recentUnlocks: recent.map((r) => ({ user: r.user, unlockedAt: r.unlockedAt })),
  });
});
