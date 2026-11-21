import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { notify } from "./notifications";

/**
 * Achievement service — automatic, criteria-driven awarding.
 *
 * Criteria types (JSON `criteria` on Achievement):
 *   { type: "lesson_completed", threshold: 1 }    — first lesson done
 *   { type: "lesson_completed", threshold: 10 }   — ten lessons done
 *   { type: "quiz_perfect", threshold: 100 }      — any quiz at 100%
 *   { type: "course_completed", threshold: 1 }    — first course done
 *   { type: "streak", threshold: 7 }              — 7-lesson streak
 *   { type: "exercise_passed", threshold: 1 }     — first exercise passed
 */

export type AchievementCriteria = {
  type: "lesson_completed" | "quiz_perfect" | "course_completed" | "streak" | "exercise_passed";
  threshold: number;
};

export type AchievementStats = {
  lessonsCompleted: number;
  coursesCompleted: number;
  bestQuizScore: number;
  exercisesPassed: number;
  longestStreak: number;
};

/** Award any achievements whose criteria are now satisfied. Returns newly unlocked. */
export async function checkAndAwardAchievements(userId: string, stats: AchievementStats) {
  const achievements = await db.achievement.findMany();
  const unlocked = await db.achievementUnlock.findMany({ where: { userId }, select: { achievementId: true } });
  const owned = new Set(unlocked.map((u) => u.achievementId));

  const newlyUnlocked: { code: string; title: string }[] = [];

  for (const a of achievements) {
    if (owned.has(a.id)) continue;
    let criteria: AchievementCriteria | null = null;
    try {
      criteria = (a.criteria as AchievementCriteria) ?? null;
    } catch {
      continue;
    }
    if (!criteria?.type) continue;

    const value =
      criteria.type === "lesson_completed" ? stats.lessonsCompleted
      : criteria.type === "course_completed" ? stats.coursesCompleted
      : criteria.type === "quiz_perfect" ? stats.bestQuizScore
      : criteria.type === "exercise_passed" ? stats.exercisesPassed
      : stats.longestStreak;

    if (value >= criteria.threshold) {
      try {
        await db.achievementUnlock.create({ data: { userId, achievementId: a.id } });
        newlyUnlocked.push({ code: a.code, title: a.title });
        await notify(
          userId,
          "ACHIEVEMENT",
          `Achievement unlocked: ${a.title}`,
          `${a.description} (+${a.points} pts)`,
          "/academy/achievements"
        );
      } catch (err) {
        // unique constraint race — another path just unlocked it; safe to skip
        logger.debug("achievement_race_skipped", { userId, code: a.code });
      }
    }
  }

  return newlyUnlocked;
}
