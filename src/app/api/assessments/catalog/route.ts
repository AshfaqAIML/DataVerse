import { withApi } from "@/lib/api/handler";
import { ok } from "@/lib/api/errors";
import { db } from "@/lib/db";

/**
 * GET /api/assessments/catalog — the Assessment Center payload.
 *
 * Quizzes visible to learners (PUBLISHED lesson inside a PUBLISHED course)
 * grouped by course with module context, plus the viewer's attempt stats
 * (attempts used, best score, last passed) per quiz, plus the course's
 * coding exercises (server-graded, hidden test cases never serialized)
 * with the viewer's submission stats. Answer keys are never returned —
 * grading happens server-side on submit.
 */
export const GET = withApi({ auth: false, rateLimit: "read", bucket: "assessments-catalog" }, async (ctx) => {
  const viewerId = ctx.user?.id ?? null;

  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, slug: true, title: true, subtitle: true, level: true,
      subject: { select: { title: true, color: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true, title: true, orderIndex: true,
          chapters: {
            orderBy: { orderIndex: "asc" },
            select: {
              lessons: {
                where: { status: "PUBLISHED" },
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true, title: true, orderIndex: true,
                  quizzes: {
                    select: {
                      id: true, title: true, description: true, kind: true,
                      passingScore: true, maxAttempts: true, timeLimitMinutes: true,
                      _count: { select: { questions: true } },
                    },
                  },
                  exercises: {
                    where: { status: "PUBLISHED" },
                    select: {
                      id: true, title: true, difficulty: true, language: true, points: true,
                      _count: { select: { testCases: { where: { hidden: false } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // viewer attempt + submission stats, mapped by quiz / exercise id
  const attemptStats = new Map<string, { attempts: number; best: number | null; passed: boolean }>();
  const submissionStats = new Map<string, { attempts: number; best: number | null; bestStatus: string | null }>();
  if (viewerId) {
    const [attempts, submissions] = await Promise.all([
      db.assessmentAttempt.findMany({
        where: { userId: viewerId, status: "GRADED" },
        select: { quizId: true, score: true, passed: true },
      }),
      db.submission.findMany({
        where: { userId: viewerId },
        select: { exerciseId: true, score: true, status: true },
      }),
    ]);
    for (const a of attempts) {
      const cur = attemptStats.get(a.quizId) ?? { attempts: 0, best: null, passed: false };
      cur.attempts += 1;
      cur.best = Math.max(cur.best ?? 0, a.score ?? 0);
      cur.passed = cur.passed || !!a.passed;
      attemptStats.set(a.quizId, cur);
    }
    for (const s of submissions) {
      const cur = submissionStats.get(s.exerciseId) ?? { attempts: 0, best: null, bestStatus: null };
      cur.attempts += 1;
      if ((s.score ?? 0) >= (cur.best ?? 0)) {
        cur.best = s.score ?? 0;
        cur.bestStatus = s.status;
      }
      submissionStats.set(s.exerciseId, cur);
    }
  }

  const payload = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    level: course.level,
    subject: course.subject,
    assessments: course.modules.flatMap((m) =>
      m.chapters.flatMap((c) =>
        c.lessons.flatMap((l) =>
          l.quizzes.map((q) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            kind: q.kind,
            passingScore: q.passingScore,
            maxAttempts: q.maxAttempts,
            timeLimitMinutes: q.timeLimitMinutes,
            questionCount: q._count.questions,
            lessonId: l.id,
            lessonTitle: l.title,
            moduleId: m.id,
            moduleTitle: m.title,
            stats: attemptStats.get(q.id) ?? { attempts: 0, best: null, passed: false },
          }))
        )
      )
    ),
    codingChallenges: course.modules.flatMap((m) =>
      m.chapters.flatMap((c) =>
        c.lessons.flatMap((l) =>
          l.exercises.map((e) => ({
            id: e.id,
            title: e.title,
            difficulty: e.difficulty,
            language: e.language,
            points: e.points,
            visibleTests: e._count.testCases,
            lessonId: l.id,
            lessonTitle: l.title,
            moduleId: m.id,
            moduleTitle: m.title,
            stats: submissionStats.get(e.id) ?? { attempts: 0, best: null, bestStatus: null },
          }))
        )
      )
    ),
  }));

  return ok({ courses: payload, authenticated: !!viewerId });
});
