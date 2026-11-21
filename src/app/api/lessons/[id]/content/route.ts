import { withApi } from "@/lib/api/handler";
import { ok, notFound } from "@/lib/api/errors";
import { db } from "@/lib/db";

/**
 * GET /api/lessons/[id]/content — the study view payload: full sections with
 * code examples, attached quizzes/exercises (ids only — no answer material),
 * the neighbouring lessons for prev/next navigation, and the viewer's own
 * progress row. Public read for PUBLISHED lessons in PUBLISHED courses.
 */
export const GET = withApi({ auth: false, rateLimit: "read", bucket: "lesson-content" }, async (ctx) => {
  const lesson = await db.lesson.findUnique({
    where: { id: ctx.params.id },
    include: {
      chapter: { include: { module: { include: { course: { select: { id: true, title: true, slug: true } } } } } },
      sections: {
        orderBy: { orderIndex: "asc" },
        include: { codeExamples: { orderBy: { orderIndex: "asc" } } },
      },
      quizzes: { select: { id: true, title: true, kind: true, passingScore: true, timeLimitMinutes: true, _count: { select: { questions: true } } } },
      exercises: { where: { status: "PUBLISHED" }, select: { id: true, title: true, difficulty: true, language: true } },
    },
  });
  if (!lesson) throw notFound("Lesson not found");
  if (lesson.status !== "PUBLISHED" || lesson.chapter.module.course === null) {
    // draft lessons are staff-only; learners get a 404-shaped answer
    throw notFound("Lesson not found");
  }

  // siblings in course order (for prev/next)
  const courseModules = await db.module.findMany({
    where: { courseId: lesson.chapter.module.courseId },
    select: { id: true },
    orderBy: { orderIndex: "asc" },
  });
  const siblings = await db.lesson.findMany({
    where: {
      status: "PUBLISHED",
      chapter: { moduleId: { in: courseModules.map((m) => m.id) } },
    },
    orderBy: [{ chapter: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: { id: true, title: true },
  });
  const idx = siblings.findIndex((s) => s.id === lesson.id);

  // viewer progress
  const progress = ctx.user
    ? await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: ctx.user.id, lessonId: lesson.id } },
        select: { status: true, quizBestScore: true, exerciseBestScore: true, timeSpentMinutes: true },
      })
    : null;

  return ok({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      estimatedMinutes: lesson.estimatedMinutes,
      chapterTitle: lesson.chapter.title,
      moduleTitle: lesson.chapter.module.title,
      course: lesson.chapter.module.course,
      sections: lesson.sections.map((s) => ({
        id: s.id,
        kind: s.kind,
        title: s.title,
        content: s.content,
        orderIndex: s.orderIndex,
        codeExamples: s.codeExamples.map((c) => ({ id: c.id, filename: c.filename, language: c.language, code: c.code, explanation: c.explanation })),
      })),
      quizzes: lesson.quizzes.map((q) => ({
        id: q.id, title: q.title, kind: q.kind, passingScore: q.passingScore,
        timeLimitMinutes: q.timeLimitMinutes, questionCount: q._count.questions,
      })),
      exercises: lesson.exercises,
    },
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
    position: { index: idx + 1, total: siblings.length },
    progress,
    authenticated: !!ctx.user,
  });
});
