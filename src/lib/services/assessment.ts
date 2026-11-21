import { db } from "@/lib/db";
import { AppError, conflict, notFound } from "@/lib/api/errors";
import { gradeQuizAttempt, type QuizAnswerInput } from "./grading";
import { recordQuizResult } from "./progress";

/**
 * Assessment service — attempt lifecycle for quizzes.
 *
 *   POST start   -> IN_PROGRESS attempt (enrollment + max-attempts gated)
 *   POST submit  -> deterministic server-side grading, best-score tracked
 *                   on LessonProgress, achievements re-checked
 *
 * Answer keys (AnswerOption.isCorrect) are never returned to the client:
 * serialization at the route layer hides isCorrect while an attempt is live.
 */

export async function startAttempt(userId: string, quizId: string) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { chapter: { include: { module: true } } } } },
  });
  if (!quiz) throw notFound("Quiz not found");

  const courseId = quiz.lesson.chapter.module.courseId;
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || enrollment.status === "DROPPED") {
    throw new AppError("FORBIDDEN", "Enroll in the course before attempting this quiz");
  }

  const gradedCount = await db.assessmentAttempt.count({
    where: { userId, quizId, status: "GRADED" },
  });
  if (quiz.maxAttempts !== null && gradedCount >= quiz.maxAttempts) {
    throw conflict(`Attempt limit reached (${quiz.maxAttempts}) for this quiz`);
  }

  return db.assessmentAttempt.create({
    data: { userId, quizId, status: "IN_PROGRESS", answers: [] },
  });
}

export async function submitAttempt(userId: string, attemptId: string, answers: QuizAnswerInput[]) {
  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { lesson: true } } },
  });
  if (!attempt) throw notFound("Attempt not found");
  if (attempt.userId !== userId) throw new AppError("FORBIDDEN", "This attempt belongs to another learner");
  if (attempt.status !== "IN_PROGRESS") {
    throw conflict(`Attempt already ${attempt.status.toLowerCase()} — start a new attempt`);
  }

  const grade = await gradeQuizAttempt(attempt.quizId, answers);
  const now = new Date();

  const [updated] = await db.$transaction([
    db.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "GRADED",
        score: grade.score,
        passed: grade.passed,
        answers: answers as unknown as object[],
        submittedAt: now,
        gradedAt: now,
      },
    }),
  ]);

  // best score on the lesson + achievement re-check
  const unlocked = await recordQuizResult(userId, attempt.quiz.lessonId, grade.score);

  return { attempt: updated, grade, achievementsUnlocked: unlocked };
}

export async function getAttempt(userId: string, attemptId: string, isStaff: boolean) {
  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          lesson: { select: { id: true, title: true, chapter: { select: { title: true, module: { select: { title: true, courseId: true } } } } } },
          questions: { orderBy: { orderIndex: "asc" }, include: { answerOptions: { orderBy: { orderIndex: "asc" } } } },
        },
      },
    },
  });
  if (!attempt) throw notFound("Attempt not found");
  if (attempt.userId !== userId && !isStaff) {
    throw new AppError("FORBIDDEN", "This attempt belongs to another learner");
  }

  // hide answer keys until graded; after grading expose correctness summary
  const questions = attempt.quiz.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    kind: q.kind,
    points: q.points,
    options: q.answerOptions.map((o) => {
      const graded = attempt.status === "GRADED";
      return graded
        ? { id: o.id, text: o.text, isCorrect: o.isCorrect, feedback: o.feedback }
        : { id: o.id, text: o.text };
    }),
    // teaching explanations are answer material — released with the key
    explanation: attempt.status === "GRADED" ? q.explanation : undefined,
  }));

  return { attempt, questions };
}
