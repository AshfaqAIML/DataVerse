import { withApi } from "@/lib/api/handler";
import { created, notFound, forbidden } from "@/lib/api/errors";
import { db } from "@/lib/db";
import { startAttempt } from "@/lib/services/assessment";
import { hasPermission } from "@/auth/rbac";
import { ok } from "@/lib/api/errors";

/**
 * POST /api/quizzes/[id]/attempts — start a new attempt (enrolled learners).
 * GET  /api/quizzes/[id]/attempts — own attempts (staff: all, for review).
 */
export const POST = withApi({ auth: true, rateLimit: "write" }, async (ctx) => {
  const quiz = await db.quiz.findUnique({ where: { id: ctx.params.id } });
  if (!quiz) throw notFound("Quiz not found");
  const attempt = await startAttempt(ctx.user!.id, quiz.id);
  return created(attempt, { message: "Attempt started — answers are graded when you submit" });
});

export const GET = withApi({ auth: true, rateLimit: "read" }, async (ctx) => {
  const quiz = await db.quiz.findUnique({ where: { id: ctx.params.id } });
  if (!quiz) throw notFound("Quiz not found");

  const staff = hasPermission(ctx.user, "analytics:read-all");
  const where = staff
    ? { quizId: quiz.id }
    : { quizId: quiz.id, userId: ctx.user!.id };
  if (!staff) {
    // students must be enrolled to even list attempts
    const lesson = await db.lesson.findUnique({
      where: { id: quiz.lessonId },
      include: { chapter: { include: { module: true } } },
    });
    if (lesson) {
      const enrolled = await db.enrollment.findUnique({
        where: { userId_courseId: { userId: ctx.user!.id, courseId: lesson.chapter.module.courseId } },
      });
      if (!enrolled) throw forbidden("Enroll in the course to view attempts");
    }
  }

  const attempts = await db.assessmentAttempt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { id: true, name: true } } },
  });
  return ok(attempts);
});
