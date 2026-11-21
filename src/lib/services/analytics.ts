import { db } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/api/errors";
import type { SessionUser } from "@/auth/session";

/**
 * Analytics service.
 *
 * - studentOverview: the learner dashboard payload
 *   (enrollments, XP, streak, time spent, quiz/exercise stats, activity).
 * - courseAnalytics: per-course funnel for instructors/staff.
 * - platformOverview: admin KPI panel (counts, 14-day trend, top courses).
 *
 * Read scope is enforced at the route layer via analytics:read-own /
 * analytics:read-all; this module only aggregates.
 */

export async function studentOverview(userId: string) {
  const [
    enrollments,
    lessonProgressAgg,
    timeSpentAgg,
    quizAgg,
    exerciseStats,
    unlockedCount,
    certificates,
    recentActivity,
    upcoming,
  ] = await Promise.all([
    db.enrollment.findMany({
      where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        course: { select: { id: true, slug: true, title: true, level: true, heroImage: true, subject: { select: { title: true, color: true } } } },
        courseProgress: true,
      },
      orderBy: { enrolledAt: "desc" },
    }),
    db.lessonProgress.aggregate({ where: { userId, status: "COMPLETED" }, _count: true }),
    db.lessonProgress.aggregate({ where: { userId }, _sum: { timeSpentMinutes: true } }),
    db.assessmentAttempt.aggregate({ where: { userId, status: "GRADED" }, _avg: { score: true }, _count: true }),
    db.submission.groupBy({ by: ["status"], where: { userId }, _count: true }),
    db.achievementUnlock.count({ where: { userId } }),
    db.certificate.count({ where: { userId } }),
    db.lessonProgress.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { lesson: { select: { id: true, title: true, estimatedMinutes: true, chapter: { select: { title: true, module: { select: { title: true, courseId: true } } } } } } },
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);

  // total achievement points via join-safe path
  const unlocked = await db.achievementUnlock.findMany({ where: { userId }, include: { achievement: { select: { points: true } } } });
  const points = unlocked.reduce((s, u) => s + u.achievement.points, 0);

  const streaks = await db.courseProgress.findMany({ where: { userId }, select: { completedLessonsStreak: true } });

  const lessonsCompleted = lessonProgressAgg._count;
  const totalMinutes = timeSpentAgg._sum.timeSpentMinutes ?? 0;
  const exercisesPassed = exerciseStats.find((s) => s.status === "PASSED")?._count ?? 0;
  const exerciseTotal = exerciseStats.reduce((s, g) => s + g._count, 0);

  return {
    xp: points + lessonsCompleted * 10,
    lessonsCompleted,
    learningMinutes: totalMinutes,
    hoursLearned: Math.round((totalMinutes / 60) * 10) / 10,
    quizzesTaken: quizAgg._count,
    quizAvgScore: quizAgg._avg.score ? Math.round(quizAgg._avg.score * 10) / 10 : null,
    exercisesPassed,
    exercisesTotal: exerciseTotal,
    achievementsUnlocked: unlockedCount,
    certificates,
    longestStreak: streaks.reduce((m, s) => Math.max(m, s.completedLessonsStreak), 0),
    unreadNotifications: upcoming,
    enrollments: enrollments.map((e) => ({
      courseId: e.course.id,
      courseSlug: e.course.slug,
      courseTitle: e.course.title,
      level: e.course.level,
      subject: e.course.subject,
      status: e.status,
      percentage: e.courseProgress?.percentage ?? 0,
      lessonsCompleted: e.courseProgress?.lessonsCompleted ?? 0,
      lessonsTotal: e.courseProgress?.lessonsTotal ?? 0,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    })),
    recentActivity: recentActivity.map((r) => ({
      lessonId: r.lesson.id,
      lessonTitle: r.lesson.title,
      moduleTitle: r.lesson.chapter.module.title,
      courseId: r.lesson.chapter.module.courseId,
      completedAt: r.completedAt,
      minutes: r.timeSpentMinutes,
    })),
  };
}

/* =====================================================================
 * Dashboard extensions — additive, computed from the same source tables.
 * Everything the personalized student dashboard renders above the fold:
 * weekly activity series, today's goal progress, the day streak, skills,
 * revision recommendations, continue-learning pointers and a unified
 * cross-source activity feed.
 * ===================================================================== */

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date): string {
  // local-time YYYY-MM-DD (dashboard groups by calendar day, not UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type WeeklyActivityDay = {
  date: string; // YYYY-MM-DD
  label: string; // Mon, Tue, …
  lessons: number;
  exercises: number;
  quizzes: number;
};

export type DashboardSkills = {
  subject: string;
  color: string;
  courseTitle: string;
  lessonPct: number; // course progress percent
  quizAvg: number | null; // avg graded attempt score on this course's quizzes
  exerciseRate: number | null; // passed / total submissions on this course's exercises
  score: number; // 0-100 composite of the three (nulls excluded)
};

export type RevisionItem = {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  reason: string;
  score: number | null;
};

export type ContinueLearningItem = {
  courseId: string;
  courseTitle: string;
  subject: { title: string; color: string } | null;
  percentage: number;
  lessonId: string;
  lessonTitle: string;
  isResume: boolean; // true = picking up mid-course; false = starting fresh
  lastTouchedAt: Date | null;
};

export type UnifiedActivity = {
  id: string;
  kind: "lesson" | "exercise" | "quiz" | "achievement";
  title: string;
  detail: string;
  at: Date;
  linkCourseId?: string;
  linkLessonId?: string;
  tone?: string;
};

export async function studentDashboard(userId: string) {
  const since7 = new Date(Date.now() - 6 * DAY_MS);
  since7.setHours(0, 0, 0, 0);

  const [
    lessonsDone7,
    submissions7,
    attempts7,
    submissionsAll,
    attemptsAll,
    lessonsAll,
    progressRows,
    unlockRows,
    enrollments,
  ] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId, status: "COMPLETED", completedAt: { gte: since7 } },
      select: { completedAt: true },
    }),
    db.submission.findMany({
      where: { userId, createdAt: { gte: since7 } },
      select: { createdAt: true, status: true },
    }),
    db.assessmentAttempt.findMany({
      where: { userId, status: "GRADED", gradedAt: { gte: since7 } },
      select: { gradedAt: true },
    }),
    db.submission.findMany({
      where: { userId },
      select: { createdAt: true, status: true, exerciseId: true, score: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    db.assessmentAttempt.findMany({
      where: { userId, status: "GRADED" },
      select: { gradedAt: true, score: true, passed: true, quizId: true },
      orderBy: { gradedAt: "desc" },
      take: 40,
    }),
    db.lessonProgress.findMany({
      where: { userId },
      select: {
        lessonId: true, status: true, quizBestScore: true, exerciseBestScore: true,
        completedAt: true, lastAccessedAt: true,
        lesson: { select: { id: true, title: true, chapter: { select: { module: { select: { courseId: true, course: { select: { title: true } } } } } } } },
      },
    }),
    db.courseProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { courseId: true, percentage: true, lessonsCompleted: true, lessonsTotal: true, lastLessonId: true, updatedAt: true },
    }),
    db.achievementUnlock.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      take: 6,
      include: { achievement: { select: { title: true, points: true, icon: true } } },
    }),
    db.enrollment.findMany({
      where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        course: { select: { id: true, title: true, subject: { select: { title: true, color: true } }, modules: { orderBy: { orderIndex: "asc" }, select: { chapters: { orderBy: { orderIndex: "asc" }, select: { lessons: { orderBy: { orderIndex: "asc" }, select: { id: true, title: true } } } } } } } },
        courseProgress: true,
      },
      orderBy: { enrolledAt: "desc" },
    }),
  ]);

  // ------------------------------------------------------------ weekly series
  const byDay = new Map<string, WeeklyActivityDay>();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    byDay.set(dayKey(d), { date: dayKey(d), label: labels[d.getDay()], lessons: 0, exercises: 0, quizzes: 0 });
  }
  for (const r of lessonsDone7) if (r.completedAt) byDay.get(dayKey(r.completedAt))!.lessons += 1;
  for (const s of submissions7) byDay.get(dayKey(s.createdAt))!.exercises += 1;
  for (const a of attempts7) if (a.gradedAt) byDay.get(dayKey(a.gradedAt))!.quizzes += 1;
  const weeklyActivity = [...byDay.values()];

  // ------------------------------------------------------- today + day streak
  const todayKey = dayKey(new Date());
  const today = (() => {
    const row = byDay.get(todayKey)!;
    return { lessons: row.lessons, exercises: row.exercises, quizzes: row.quizzes, total: row.lessons + row.exercises + row.quizzes };
  })();

  const activeDays = new Set<string>();
  for (const l of lessonsAll) if (l.completedAt) activeDays.add(dayKey(l.completedAt));
  for (const s of submissionsAll) activeDays.add(dayKey(s.createdAt));
  for (const a of attemptsAll) if (a.gradedAt) activeDays.add(dayKey(a.gradedAt));
  let dayStreak = 0;
  {
    let cursor = new Date();
    if (!activeDays.has(todayKey)) {
      // today not yet active: streak may still be alive through yesterday
      cursor = new Date(Date.now() - DAY_MS);
      if (!activeDays.has(dayKey(cursor))) cursor = null as unknown as Date;
    }
    while (cursor && activeDays.has(dayKey(cursor))) {
      dayStreak += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }

  // ------------------------------------------------------------------- skills
  // map quiz attempts to their course once (attempt -> quiz -> lesson -> course)
  const quizIdToCourse = new Map<string, string>();
  {
    const quizIds = [...new Set(attemptsAll.map((a) => a.quizId))];
    const quizRows = await db.quiz.findMany({
      where: { id: { in: quizIds } },
      select: { id: true, lesson: { select: { chapter: { select: { module: { select: { courseId: true } } } } } } },
    });
    for (const q of quizRows) quizIdToCourse.set(q.id, q.lesson.chapter.module.courseId);
  }
  const courseIds = [...new Set(lessonsAll.map((l) => l.lesson.chapter.module.courseId))];
  const skills: DashboardSkills[] = [];
  for (const courseId of courseIds) {
    const enrollment = enrollments.find((e) => e.course.id === courseId);
    if (!enrollment) continue;
    const courseQuizAttempts = attemptsAll.filter((a) => quizIdToCourse.get(a.quizId) === courseId);
    const cp = progressRows.find((p) => p.courseId === courseId);
    const lessonPct = cp && cp.lessonsTotal > 0 ? Math.round((cp.lessonsCompleted / cp.lessonsTotal) * 100) : 0;
    const quizAvg = courseQuizAttempts.length > 0
      ? Math.round((courseQuizAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / courseQuizAttempts.length) * 10) / 10
      : null;
    // exercise pass rate for this course (submission -> exercise -> lesson -> course)
    const exerciseIds = await db.exercise.findMany({
      where: { lesson: { chapter: { module: { courseId } } } },
      select: { id: true },
    });
    const exIdSet = new Set(exerciseIds.map((e) => e.id));
    const courseExSubs = submissionsAll.filter((s) => exIdSet.has(s.exerciseId));
    const passedCount = courseExSubs.filter((s) => s.status === "PASSED").length;
    const exerciseRate = courseExSubs.length > 0 ? Math.round((passedCount / courseExSubs.length) * 100) : null;

    const parts: number[] = [lessonPct]; // course coverage always counts
    if (quizAvg !== null) parts.push(quizAvg);
    if (exerciseRate !== null) parts.push(exerciseRate);
    const score = Math.round(parts.reduce((s, x) => s + x, 0) / parts.length);

    skills.push({
      subject: enrollment.course.subject?.title ?? "General",
      color: enrollment.course.subject?.color ?? "#6366f1",
      courseTitle: enrollment.course.title,
      lessonPct,
      quizAvg,
      exerciseRate,
      score,
    });
  }

  // --------------------------------------------------------------- revision
  const revision: RevisionItem[] = [];
  for (const l of lessonsAll) {
    if (revision.length >= 5) break;
    const weakQuiz = l.quizBestScore !== null && l.quizBestScore < 75;
    const weakExercise = l.exerciseBestScore !== null && l.exerciseBestScore < 60;
    if (weakQuiz || weakExercise) {
      const courseTitle = enrollments.find((e) => e.course.id === l.lesson.chapter.module.courseId)?.course.title ?? "Course";
      revision.push({
        lessonId: l.lesson.id,
        lessonTitle: l.lesson.title,
        courseId: l.lesson.chapter.module.courseId,
        courseTitle,
        reason: weakQuiz
          ? `Checkpoint best score ${Math.round(l.quizBestScore!)}% — below the 75% comfort line`
          : `Exercise best score ${Math.round(l.exerciseBestScore!)}% — the tests want another pass`,
        score: weakQuiz ? Math.round(l.quizBestScore!) : Math.round(l.exerciseBestScore!),
      });
    }
  }

  // --------------------------------------------------------- continue learning
  const continueLearning: ContinueLearningItem[] = [];
  for (const e of enrollments) {
    if (e.status !== "ACTIVE") continue;
    const flatLessons = e.course.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons));
    if (flatLessons.length === 0) continue;
    const lastId = e.courseProgress?.lastLessonId ?? null;
    const doneSet = new Set(lessonsAll.filter((l) => l.status === "COMPLETED").map((l) => l.lessonId));
    const nextLesson = flatLessons.find((l) => !doneSet.has(l.id)) ?? flatLessons[flatLessons.length - 1];
    const resume = lastId !== null && lastId !== nextLesson.id;
    const target = resume ? flatLessons.find((l) => l.id === lastId) ?? nextLesson : nextLesson;
    continueLearning.push({
      courseId: e.course.id,
      courseTitle: e.course.title,
      subject: e.course.subject,
      percentage: e.courseProgress?.percentage ?? 0,
      lessonId: target.id,
      lessonTitle: target.title,
      isResume: resume,
      lastTouchedAt: e.courseProgress?.updatedAt ?? null,
    });
  }

  // ------------------------------------------------------ unified activity feed
  const feed: UnifiedActivity[] = [];
  for (const l of lessonsAll) {
    if (!l.completedAt) continue;
    feed.push({
      id: `lesson-${l.lessonId}`,
      kind: "lesson",
      title: "Completed a lesson",
      detail: l.lesson.title,
      at: l.completedAt,
      linkCourseId: l.lesson.chapter.module.courseId,
      linkLessonId: l.lessonId,
      tone: "emerald",
    });
  }
  const submissionMeta = await db.submission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true, createdAt: true, status: true,
      exercise: { select: { title: true, lesson: { select: { chapter: { select: { module: { select: { courseId: true } } } } } } } },
    },
  });
  for (const s of submissionMeta) {
    feed.push({
      id: `exercise-${s.id}`,
      kind: "exercise",
      title: s.status === "PASSED" ? "Passed a coding exercise" : s.status === "ERROR" ? "A submission errored" : "Attempted a coding exercise",
      detail: s.exercise.title,
      at: s.createdAt,
      linkCourseId: s.exercise.lesson.chapter.module.courseId,
      tone: s.status === "PASSED" ? "emerald" : "amber",
    });
  }
  const attemptMeta = await db.assessmentAttempt.findMany({
    where: { userId, status: "GRADED" },
    orderBy: { gradedAt: "desc" },
    take: 20,
    select: {
      id: true, gradedAt: true, score: true, passed: true,
      quiz: { select: { title: true, kind: true, lesson: { select: { chapter: { select: { module: { select: { courseId: true } } } } } } } },
    },
  });
  for (const a of attemptMeta) {
    if (!a.gradedAt) continue;
    feed.push({
      id: `quiz-${a.id}`,
      kind: "quiz",
      title: a.passed ? `Passed an assessment — ${Math.round(a.score ?? 0)}%` : `Assessment attempt — ${Math.round(a.score ?? 0)}%`,
      detail: a.quiz.title,
      at: a.gradedAt,
      linkCourseId: a.quiz.lesson.chapter.module.courseId,
      tone: a.passed ? "emerald" : "rose",
    });
  }
  for (const u of unlockRows) {
    feed.push({
      id: `achievement-${u.id}`,
      kind: "achievement",
      title: "Achievement unlocked",
      detail: `${u.achievement.title} (+${u.achievement.points} XP)`,
      at: u.unlockedAt,
      tone: "violet",
    });
  }
  feed.sort((a, b) => b.at.getTime() - a.at.getTime());
  const activity = feed.slice(0, 14);

  return {
    weeklyActivity,
    today,
    dayStreak,
    skills,
    revision,
    continueLearning,
    activity,
  };
}

export async function courseAnalytics(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      _count: { select: { enrollments: true, modules: true, certificates: true } },
    },
  });
  if (!course) throw notFound("Course not found");

  const [lessonsTotal, progressRows, quizAgg, submissionsAgg, topLearners] = await Promise.all([
    db.lesson.count({ where: { chapter: { module: { courseId } } } }),
    db.courseProgress.findMany({ where: { courseId }, select: { percentage: true, lessonsCompleted: true, userId: true } }),
    db.assessmentAttempt.groupBy({
      by: ["passed"],
      where: { quiz: { lesson: { chapter: { module: { courseId } } } }, status: "GRADED" },
      _count: true,
      _avg: { score: true },
    }),
    db.submission.groupBy({
      by: ["status"],
      where: { exercise: { lesson: { chapter: { module: { courseId } } } } },
      _count: true,
    }),
    db.courseProgress.findMany({
      where: { courseId },
      orderBy: { percentage: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
  ]);

  const active = progressRows.filter((p) => p.percentage > 0 && p.percentage < 100).length;
  const completed = progressRows.filter((p) => p.percentage >= 100).length;
  const notStarted = progressRows.length - active - completed;
  const avgProgress = progressRows.length > 0
    ? Math.round((progressRows.reduce((s, p) => s + p.percentage, 0) / progressRows.length) * 10) / 10
    : 0;

  const quizAttempts = quizAgg.reduce((s, g) => s + g._count, 0);
  const quizPassed = quizAgg.find((g) => g.passed === true)?._count ?? 0;
  const quizAvgScore = (() => {
    const w = quizAgg.map((g) => ({ avg: g._avg.score ?? 0, n: g._count })).filter((x) => x.n > 0);
    const n = w.reduce((s, x) => s + x.n, 0);
    return n > 0 ? Math.round((w.reduce((s, x) => s + x.avg * x.n, 0) / n) * 10) / 10 : null;
  })();

  return {
    courseId: course.id,
    courseTitle: course.title,
    status: course.status,
    lessonsTotal,
    modulesTotal: course._count.modules,
    enrolledTotal: course._count.enrollments,
    certificatesIssued: course._count.certificates,
    funnel: { notStarted, active, completed },
    avgProgress,
    quiz: { attempts: quizAttempts, passed: quizPassed, avgScore: quizAvgScore },
    exercises: {
      byStatus: Object.fromEntries(submissionsAgg.map((g) => [g.status, g._count])),
      total: submissionsAgg.reduce((s, g) => s + g._count, 0),
    },
    topLearners: topLearners.map((p) => ({
      user: p.user,
      percentage: p.percentage,
      lessonsCompleted: p.lessonsCompleted,
    })),
  };
}

export async function platformOverview() {
  const now = new Date();
  const since = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);

  const [
    users, courses, lessons, exercises, quizzes, glossaryTerms,
    publishedCourses, enrollments, completions, certificates,
    activeLearners, submissions, gradedAttempts, discussions,
  ] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.lesson.count(),
    db.exercise.count(),
    db.quiz.count(),
    db.glossaryTerm.count(),
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.enrollment.count(),
    db.enrollment.count({ where: { status: "COMPLETED" } }),
    db.certificate.count(),
    db.enrollment.count({ where: { status: "ACTIVE" } }),
    db.submission.count(),
    db.assessmentAttempt.count({ where: { status: "GRADED" } }),
    db.discussion.count(),
  ]);

  // 14-day enrollment trend
  const trendRows = await db.enrollment.findMany({
    where: { enrolledAt: { gte: since } },
    select: { enrolledAt: true },
  });
  const trend: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: trendRows.filter((r) => r.enrolledAt.toISOString().slice(0, 10) === key).length });
  }

  const topCourses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    include: { _count: { select: { enrollments: true } }, subject: { select: { title: true, color: true } } },
    orderBy: { enrollments: { _count: "desc" } },
    take: 5,
  });

  const roleBreakdown = await db.user.groupBy({ by: ["roleId"], _count: true });
  const roles = await db.role.findMany({ select: { id: true, key: true, name: true } });

  return {
    totals: {
      users, courses, publishedCourses, lessons, exercises, quizzes,
      glossaryTerms, enrollments, activeLearners, completions,
      certificates, submissions, gradedAttempts, discussions,
    },
    completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 1000) / 10 : 0,
    enrollmentTrend14d: trend,
    topCourses: topCourses.map((c) => ({
      id: c.id, slug: c.slug, title: c.title, level: c.level,
      subject: c.subject, enrollments: c._count.enrollments,
    })),
    usersByRole: roleBreakdown.map((r) => ({
      role: roles.find((x) => x.id === r.roleId)?.key ?? r.roleId,
      count: r._count,
    })),
  };
}

/** Guard: analytics:read-all or (own analytics for analytics:read-own). */
export function assertAnalyticsScope(actor: SessionUser, targetUserId?: string) {
  if (actor.permissions.includes("analytics:read-all")) return;
  if (targetUserId && actor.id === targetUserId && actor.permissions.includes("analytics:read-own")) return;
  throw forbidden("You can only read your own analytics");
}
