import { withApi, parseBody } from "@/lib/api/handler";
import { created, conflict, notFound } from "@/lib/api/errors";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/auth/rbac";
import { notify } from "@/lib/services/notifications";

/**
 * POST /api/achievements/[id]/award — manually award an achievement
 * (achievement:award). Automatic criteria-driven awarding happens through
 * the progress engine; this route covers manual/instructor awards.
 */
const awardSchema = z.object({ userId: z.string().min(1) }).strict();

export const POST = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  requirePermission(ctx.user!, "achievement:award");

  const achievement = await db.achievement.findUnique({ where: { id: ctx.params.id } });
  if (!achievement) throw notFound("Achievement not found");

  const { userId } = await parseBody(ctx.req, awardSchema);
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!user) throw notFound("User not found");

  const existing = await db.achievementUnlock.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) throw conflict(`${user.name} already unlocked "${achievement.title}"`);

  const unlock = await db.achievementUnlock.create({
    data: { userId, achievementId: achievement.id },
  });

  await notify(
    userId,
    "ACHIEVEMENT",
    `Achievement unlocked: ${achievement.title}`,
    `${achievement.description} (+${achievement.points} pts) — awarded by ${ctx.user!.name}`,
    "/academy/achievements"
  );

  return created(unlock, { message: `Awarded "${achievement.title}" to ${user.name}` });
});
