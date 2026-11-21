import { db } from "@/lib/db";
import { AppError, notFound } from "@/lib/api/errors";
import { gradeExerciseSubmission } from "./grading";
import { recordExerciseResult } from "./progress";
import { notify } from "./notifications";

/**
 * Submission service — exercise code submission + grading pipeline.
 *
 *   submitSolution -> persistence gate (enrollment)
 *                  -> CodeRunner execution against TestCases
 *                  -> Submission row (PASSED/FAILED/ERROR + per-case results)
 *                  -> LessonProgress best score + achievements
 *                  -> first-pass notification
 *
 * Hidden test cases are never serialized to the client (route layer).
 */

export async function submitSolution(userId: string, exerciseId: string, code: string, language: string) {
  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: { lesson: { include: { chapter: { include: { module: true } } } } },
  });
  if (!exercise) throw notFound("Exercise not found");

  const courseId = exercise.lesson.chapter.module.courseId;
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || enrollment.status === "DROPPED") {
    throw new AppError("FORBIDDEN", "Enroll in the course before submitting solutions");
  }

  if (code.trim().length === 0) {
    throw new AppError("UNPROCESSABLE", "Submission code cannot be empty");
  }

  const grade = await gradeExerciseSubmission(exerciseId, code, language);

  const submission = await db.submission.create({
    data: {
      exerciseId,
      userId,
      code,
      language,
      status: grade.status,
      score: grade.score,
      results: grade.results as unknown as object,
      runtimeMs: grade.runtimeMs,
    },
  });

  const unlocked = await recordExerciseResult(userId, exercise.lessonId, grade.status === "PASSED", grade.score);

  // celebrate first pass
  if (grade.status === "PASSED") {
    const priorPasses = await db.submission.count({
      where: { exerciseId, userId, status: "PASSED", id: { not: submission.id } },
    });
    if (priorPasses === 0) {
      await notify(
        userId,
        "COURSE",
        `Exercise passed: ${exercise.title}`,
        `All test cases green (${grade.results.length} cases, ${grade.runtimeMs}ms). Nicely done!`,
        "/academy/exercises/" + exerciseId
      );
    }
  }

  // hidden cases are masked before leaving the service layer
  const results = grade.results.map((r) => ({
    testCaseId: r.testCaseId,
    name: r.name,
    passed: r.passed,
    hidden: r.hidden,
    ...(r.hidden ? {} : { expected: r.expected, received: r.received }),
  }));

  return { submission, results, achievementsUnlocked: unlocked };
}

export async function listSubmissionsForUser(userId: string, exerciseId?: string) {
  return db.submission.findMany({
    where: { userId, ...(exerciseId ? { exerciseId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      exercise: { select: { id: true, title: true, difficulty: true, points: true, lesson: { select: { id: true, title: true } } } },
    },
  });
}

export async function getSubmission(userId: string, submissionId: string, isStaff: boolean) {
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      exercise: { select: { id: true, title: true, language: true, testCases: { orderBy: { orderIndex: "asc" } } } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!submission) throw notFound("Submission not found");
  if (submission.userId !== userId && !isStaff) {
    throw new AppError("FORBIDDEN", "This submission belongs to another learner");
  }
  return submission;
}
