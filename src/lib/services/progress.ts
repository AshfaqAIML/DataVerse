import { db } from "@/lib/db";
import { AppError, notFound } from "@/lib/api/errors";
import type { Prisma } from "@prisma/client";
import { checkAndAwardAchievements, type AchievementStats } from "./achievements";
import { issueCertificate } from "./certificates";
import { logger } from "@/lib/logger";

/**
 * Progress service — the rollup engine.
 *
 * A single write path (recordLessonProgress) keeps three denormalized
 * aggregates consistent with the LessonProgress rows:
 *
 *   LessonProgress (source of truth)
 *     -> ModuleProgress  (per module: completed/total)
 *     -> CourseProgress  (per course: percentage, streak, last lesson)
 *     -> Enrollment      (COMPLETED when 100%, then certificate issue)
 *
 * Achievements are re-checked after every progress event.
 */

export type LessonProgressInput = {
  status?: "IN_PROGRESS" | "COMPLETED";
  timeSpentMinutes?: number;
  lastSectionIndex?: number;
};

// ---------------------------------------------------------------- helpers

async function moduleLessonCounts(moduleId: string) {
  const total = await db.lesson.count({ where: { chapter: { moduleId } } });
  const completed = await db.lessonProgress.count({
    where: { status: "COMPLETED", lesson: { chapter: { moduleId } } },
  });
  return { total, completed };
}

async function courseLessonCounts(courseId: string, userId: string) {
  const total = await db.lesson.count({ where: { chapter: { module: { courseId } } } });
  const completed = await db.lessonProgress.count({
    where: { userId, status: "COMPLETED", lesson: { chapter: { module: { courseId } } } },
  });
  return { total, completed };
}

async function upsertModuleProgress(userId: string, moduleId: string) {
  const { total, completed } = await moduleLessonCounts(moduleId);
  const data = {
    lessonsTotal: total,
    lessonsCompleted: completed,
    completedAt: total > 0 && completed >= total ? new Date() : null,
  };
  await db.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: { userId, moduleId, ...data, completedAt: data.completedAt },
    update: data,
  });
  return data;
}

async function upsertCourseProgress(userId: string, courseId: string, incrementStreak: boolean, lastLessonId: string) {
  const { total, completed } = await courseLessonCounts(courseId, userId);
  const percentage = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

  const existing = await db.courseProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  const streak = (existing?.completedLessonsStreak ?? 0) + (incrementStreak ? 1 : 0);

  const data = {
    lessonsTotal: total,
    lessonsCompleted: completed,
    percentage,
    completedLessonsStreak: streak,
    lastLessonId,
    updatedAt: new Date(),
  };
  await db.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, ...data },
    update: data,
  });

  return { total, completed, percentage };
}

export async function computeAchievementStats(userId: string): Promise<AchievementStats> {
  const [lessonsCompleted, coursesCompleted, bestQuiz, exercisesPassed, streaks] = await Promise.all([
    db.lessonProgress.count({ where: { userId, status: "COMPLETED" } }),
    db.enrollment.count({ where: { userId, status: "COMPLETED" } }),
    db.lessonProgress.aggregate({ where: { userId }, _max: { quizBestScore: true } }),
    db.submission.count({ where: { userId, status: "PASSED" } }),
    db.courseProgress.findMany({ where: { userId }, select: { completedLessonsStreak: true } }),
  ]);
  return {
    lessonsCompleted,
    coursesCompleted,
    bestQuizScore: bestQuiz._max.quizBestScore ?? 0,
    exercisesPassed,
    longestStreak: streaks.reduce((m, s) => Math.max(m, s.completedLessonsStreak), 0),
  };
}

// ------------------------------------------------------------ main write path

export async function recordLessonProgress(userId: string, lessonId: string, input: LessonProgressInput) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { module: true } } },
  });
  if (!lesson) throw notFound("Lesson not found");
  const { module: module_ } = lesson.chapter;

  // enrollment gate: progress requires active/completed enrollment
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: module_.courseId } },
  });
  if (!enrollment) {
    throw new AppError("FORBIDDEN", "Enroll in the course before tracking progress");
  }
  if (enrollment.status === "DROPPED") {
    throw new AppError("CONFLICT", "Enrollment was dropped — re-enroll to continue");
  }

  const now = new Date();
  const before = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const alreadyCompleted = before?.status === "COMPLETED";
  const becomingCompleted = (input.status ?? "IN_PROGRESS") === "COMPLETED";

  // 1) source-of-truth row
  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      status: input.status ?? "IN_PROGRESS",
      timeSpentMinutes: input.timeSpentMinutes ?? 0,
      lastSectionIndex: input.lastSectionIndex ?? 0,
      completedAt: becomingCompleted ? now : null,
      lastAccessedAt: now,
    },
    update: {
      status: input.status ?? before?.status ?? "IN_PROGRESS",
      timeSpentMinutes: (before?.timeSpentMinutes ?? 0) + (input.timeSpentMinutes ?? 0),
      lastSectionIndex: input.lastSectionIndex ?? before?.lastSectionIndex ?? 0,
      completedAt: becomingCompleted ? (before?.completedAt ?? now) : before?.completedAt ?? null,
      lastAccessedAt: now,
    },
  });

  // 2) rollups only fire on a completion transition
  let courseState: { total: number; completed: number; percentage: number } | null = null;
  if (becomingCompleted && !alreadyCompleted) {
    await upsertModuleProgress(userId, module_.id);
    courseState = await upsertCourseProgress(userId, module_.courseId, true, lessonId);

    // course finished?
    if (courseState.total > 0 && courseState.completed >= courseState.total) {
      await db.enrollment.updateMany({
        where: { userId, courseId: module_.courseId, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED", completedAt: now },
      });
      try {
        await issueCertificate(userId, module_.courseId);
      } catch (err) {
        logger.warn("certificate_issue_failed", {
          userId,
          courseId: module_.courseId,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // 3) achievements
  const stats = await computeAchievementStats(userId);
  const unlocked = await checkAndAwardAchievements(userId, stats);

  return { progress, courseState, achievementsUnlocked: unlocked };
}

// ---------------------------------------------------- quiz/exercise feedback

export async function recordQuizResult(userId: string, lessonId: string, score: number) {
  // attempting a quiz is learning activity: ensure the lesson row exists
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, quizBestScore: score },
    update: {},
  });
  await db.lessonProgress.updateMany({
    where: { userId, lessonId, OR: [{ quizBestScore: null }, { quizBestScore: { lt: score } }] },
    data: { quizBestScore: score },
  });
  const stats = await computeAchievementStats(userId);
  return checkAndAwardAchievements(userId, stats);
}

export async function recordExerciseResult(userId: string, lessonId: string, passed: boolean, score: number) {
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, exerciseBestScore: score },
    update: {},
  });
  await db.lessonProgress.updateMany({
    where: { userId, lessonId, OR: [{ exerciseBestScore: null }, { exerciseBestScore: { lt: score } }] },
    data: { exerciseBestScore: score },
  });
  if (!passed) return [];
  const stats = await computeAchievementStats(userId);
  return checkAndAwardAchievements(userId, stats);
}

// ------------------------------------------------------------------ queries

export async function getCourseProgressOverview(userId: string, courseId: string) {
  const [enrollment, course, courseProgress, moduleRows] = await Promise.all([
    db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            chapters: {
              orderBy: { orderIndex: "asc" },
              include: {
                lessons: {
                  orderBy: { orderIndex: "asc" },
                  include: {
                    lessonProgress: { where: { userId } },
                    _count: { select: { exercises: true, quizzes: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.courseProgress.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    db.moduleProgress.findMany({ where: { userId, module: { courseId } } }),
  ]);

  if (!course) throw notFound("Course not found");
  if (!enrollment) throw new AppError("FORBIDDEN", "You are not enrolled in this course");

  const modules = course.modules.map((m) => {
    const mp = moduleRows.find((r) => r.moduleId === m.id);
    const lessons = m.chapters.flatMap((c) =>
      c.lessons.map((l) => {
        const lp = l.lessonProgress[0];
        return {
          id: l.id,
          title: l.title,
          orderIndex: l.orderIndex,
          chapterTitle: c.title,
          status: lp?.status ?? "NOT_STARTED",
          completedAt: lp?.completedAt ?? null,
          timeSpentMinutes: lp?.timeSpentMinutes ?? 0,
          quizBestScore: lp?.quizBestScore ?? null,
          exerciseBestScore: lp?.exerciseBestScore ?? null,
          exercises: l._count.exercises,
          quizzes: l._count.quizzes,
        };
      })
    );
    const completed = lessons.filter((l) => l.status === "COMPLETED").length;
    return {
      id: m.id,
      title: m.title,
      orderIndex: m.orderIndex,
      lessonsCompleted: mp?.lessonsCompleted ?? completed,
      lessonsTotal: mp?.lessonsTotal ?? lessons.length,
      percentage: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
      lessons,
    };
  });

  return {
    courseId: course.id,
    courseTitle: course.title,
    enrollmentStatus: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    percentage: courseProgress?.percentage ?? 0,
    lessonsCompleted: courseProgress?.lessonsCompleted ?? 0,
    lessonsTotal: courseProgress?.lessonsTotal ?? 0,
    streak: courseProgress?.completedLessonsStreak ?? 0,
    lastLessonId: courseProgress?.lastLessonId ?? null,
    modules,
  };
}
