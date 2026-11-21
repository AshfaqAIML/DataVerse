import "../__setup";
import { describe, expect, test, beforeAll } from "bun:test";
import { db } from "@/lib/db";
import { cleanAll, mkCourseTree, mkExercise, mkQuiz, mkUser } from "../helpers";
import { enrollUser } from "@/lib/services/enrollment";
import { recordLessonProgress } from "@/lib/services/progress";
import { startAttempt, submitAttempt } from "@/lib/services/assessment";
import { submitSolution } from "@/lib/services/submissions";
import { gradeQuizAttempt } from "@/lib/services/grading";

/**
 * Progress engine integration tests — the full rollup chain:
 *   LessonProgress -> ModuleProgress -> CourseProgress -> Enrollment
 *   -> Certificate + Achievements, plus quiz & exercise grading.
 */
beforeAll(cleanAll);

describe("enrollment service", () => {
  test("self-enroll creates enrollment + eager course progress", async () => {
    const student = await mkUser("enroll1@t.test", "STUDENT");
    const { course } = await mkCourseTree("enroll-service");
    const enrollment = await enrollUser(student.id, course.id);
    expect(enrollment.status).toBe("ACTIVE");

    const progress = await db.courseProgress.findUnique({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
    });
    expect(progress).not.toBeNull();
    expect(progress!.lessonsTotal).toBe(2);
    expect(progress!.enrollmentId).toBe(enrollment.id);
  });

  test("re-enroll after drop reactivates and keeps progress", async () => {
    const student = await mkUser("enroll2@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("enroll-drop");
    await enrollUser(student.id, course.id);
    await recordLessonProgress(student.id, lessons[0].id, { status: "COMPLETED" });
    await db.enrollment.update({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
      data: { status: "DROPPED" },
    });

    const re = await enrollUser(student.id, course.id);
    expect(re.status).toBe("ACTIVE");
    const completed = await db.lessonProgress.count({
      where: { userId: student.id, status: "COMPLETED" },
    });
    expect(completed).toBe(1);
  });

  test("progress on a non-enrolled course is rejected", async () => {
    const student = await mkUser("enroll3@t.test", "STUDENT");
    const { lessons } = await mkCourseTree("enroll-gate");
    try {
      await recordLessonProgress(student.id, lessons[0].id, { status: "COMPLETED" });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { status?: number }).status).toBe(403);
    }
  });
});

describe("progress rollup engine", () => {
  test("lesson completion rolls up module + course progress", async () => {
    const student = await mkUser("rollup@t.test", "STUDENT");
    const { course, module: mod, lessons } = await mkCourseTree("rollup-1", { lessonCount: 3 });
    await enrollUser(student.id, course.id);

    const r1 = await recordLessonProgress(student.id, lessons[0].id, { status: "COMPLETED", timeSpentMinutes: 10 });
    expect(r1.courseState).toMatchObject({ total: 3, completed: 1, percentage: 33.3 });

    const mp = await db.moduleProgress.findUniqueOrThrow({
      where: { userId_moduleId: { userId: student.id, moduleId: mod.id } },
    });
    expect(mp.lessonsCompleted).toBe(1);
    expect(mp.lessonsTotal).toBe(3);

    await recordLessonProgress(student.id, lessons[1].id, { status: "IN_PROGRESS", timeSpentMinutes: 4 });
    // IN_PROGRESS does not advance the rollup
    const mp2 = await db.moduleProgress.findUniqueOrThrow({
      where: { userId_moduleId: { userId: student.id, moduleId: mod.id } },
    });
    expect(mp2.lessonsCompleted).toBe(1);

    await recordLessonProgress(student.id, lessons[1].id, { status: "COMPLETED", timeSpentMinutes: 6 });
    await recordLessonProgress(student.id, lessons[2].id, { status: "COMPLETED" });

    const cp = await db.courseProgress.findUniqueOrThrow({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
    });
    expect(cp.percentage).toBe(100);
    expect(cp.lessonsCompleted).toBe(3);
    expect(cp.completedLessonsStreak).toBe(3);

    const enrollment = await db.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
    });
    expect(enrollment.status).toBe("COMPLETED");
    expect(enrollment.completedAt).not.toBeNull();

    // certificate auto-issued, exactly once
    const certs = await db.certificate.findMany({ where: { userId: student.id, courseId: course.id } });
    expect(certs.length).toBe(1);
    expect(certs[0].code).toMatch(/^DVA-\d{4}-[A-Z2-9]{8}$/);

    // time spent accumulates across visits
    const lp = await db.lessonProgress.findUniqueOrThrow({
      where: { userId_lessonId: { userId: student.id, lessonId: lessons[1].id } },
    });
    expect(lp.timeSpentMinutes).toBe(10);
  });

  test("achievements unlock at thresholds", async () => {
    await db.achievement.createMany({
      data: [
        { code: "t_first_lesson", title: "First", description: "d", points: 10, criteria: { type: "lesson_completed", threshold: 1 } },
        { code: "t_quiz_ace", title: "Ace", description: "d", points: 25, criteria: { type: "quiz_perfect", threshold: 100 } },
        { code: "t_streak_3", title: "Streak", description: "d", points: 15, criteria: { type: "streak", threshold: 3 } },
        { code: "t_never", title: "Never", description: "d", points: 100, criteria: { type: "course_completed", threshold: 5 } },
      ],
    });

    const student = await mkUser("achv@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("achv-1", { lessonCount: 3 });
    await enrollUser(student.id, course.id);

    await recordLessonProgress(student.id, lessons[0].id, { status: "COMPLETED" });
    let unlocks = await db.achievementUnlock.findMany({
      where: { userId: student.id },
      include: { achievement: true },
    });
    expect(unlocks.map((u) => u.achievement.code).sort()).toEqual(["t_first_lesson"]);

    // completing the rest triggers streak(3) — not t_never
    await recordLessonProgress(student.id, lessons[1].id, { status: "COMPLETED" });
    await recordLessonProgress(student.id, lessons[2].id, { status: "COMPLETED" });
    unlocks = await db.achievementUnlock.findMany({
      where: { userId: student.id },
      include: { achievement: true },
    });
    const codes = unlocks.map((u) => u.achievement.code).sort();
    expect(codes).toContain("t_streak_3");
    expect(codes).not.toContain("t_never");

    // achievements are awarded exactly once (unique constraint)
    const dupes = await db.achievementUnlock.groupBy({
      by: ["achievementId"],
      where: { userId: student.id },
      _count: true,
    });
    for (const g of dupes) expect(g._count).toBe(1);
  });
});

describe("quiz grading", () => {
  test("deterministic MCQ scoring + pass threshold + best score tracking", async () => {
    const student = await mkUser("quiz@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("quiz-1");
    const { quiz, questions } = await mkQuiz(lessons[0].id, 80);
    await enrollUser(student.id, course.id);

    // 2/3 correct = 66.7% -> below 80
    const attempt1 = await startAttempt(student.id, quiz.id);
    const r1 = await submitAttempt(student.id, attempt1.id, [
      { questionId: questions[0].id, selectedOptionIds: questions[0].correctIds },
      { questionId: questions[1].id, selectedOptionIds: questions[1].correctIds },
      { questionId: questions[2].id, selectedOptionIds: questions[2].wrongIds },
    ]);
    expect(r1.grade.score).toBeCloseTo(66.7, 1);
    expect(r1.grade.passed).toBe(false);
    expect(r1.grade.correctCount).toBe(2);

    // perfect retake
    const attempt2 = await startAttempt(student.id, quiz.id);
    const r2 = await submitAttempt(student.id, attempt2.id, questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: q.correctIds,
    })));
    expect(r2.grade.score).toBe(100);
    expect(r2.grade.passed).toBe(true);

    // best score persisted on lesson progress
    const lp = await db.lessonProgress.findUniqueOrThrow({
      where: { userId_lessonId: { userId: student.id, lessonId: lessons[0].id } },
    });
    expect(lp.quizBestScore).toBe(100);

    // maxAttempts enforced
    const attempt3 = await startAttempt(student.id, quiz.id);
    await submitAttempt(student.id, attempt3.id, questions.map((q) => ({ questionId: q.id, selectedOptionIds: q.wrongIds })));
    try {
      await startAttempt(student.id, quiz.id);
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { status?: number }).status).toBe(409);
    }
  });

  test("grading requires exact option-set match (no partial credit)", async () => {
    const student = await mkUser("quiz2@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("quiz-2");
    // multi-select: two correct options
    const quiz = await db.quiz.create({ data: { lessonId: lessons[0].id, title: "MS", passingScore: 50 } });
    const q = await db.quizQuestion.create({ data: { quizId: quiz.id, prompt: "Pick both", kind: "MULTI_SELECT", points: 1 } });
    const c1 = await db.answerOption.create({ data: { questionId: q.id, text: "a", isCorrect: true } });
    const c2 = await db.answerOption.create({ data: { questionId: q.id, text: "b", isCorrect: true } });
    const w1 = await db.answerOption.create({ data: { questionId: q.id, text: "c", isCorrect: false } });
    await enrollUser(student.id, course.id);

    // only one of two correct -> wrong
    const g1 = await gradeQuizAttempt(quiz.id, [{ questionId: q.id, selectedOptionIds: [c1.id] }]);
    expect(g1.gradedAnswers[0].correct).toBe(false);

    // both correct -> right; extra wrong option -> wrong
    const g2 = await gradeQuizAttempt(quiz.id, [{ questionId: q.id, selectedOptionIds: [c1.id, c2.id] }]);
    expect(g2.gradedAnswers[0].correct).toBe(true);
    const g3 = await gradeQuizAttempt(quiz.id, [{ questionId: q.id, selectedOptionIds: [c1.id, c2.id, w1.id] }]);
    expect(g3.gradedAnswers[0].correct).toBe(false);
  });
});

describe("exercise submission grading (python runner)", () => {
  test("pass, fail and hidden-case masking through the service", async () => {
    const student = await mkUser("ex@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("exercise-1");
    const exercise = await mkExercise(lessons[0].id, "42");
    await enrollUser(student.id, course.id);

    const bad = await submitSolution(student.id, exercise.id, "print(41)", "python");
    expect(bad.submission.status).toBe("FAILED");
    expect(bad.submission.score).toBe(0);
    expect(bad.results.every((r) => !r.passed)).toBe(true);

    const good = await submitSolution(student.id, exercise.id, "print(42)", "python");
    expect(good.submission.status).toBe("PASSED");
    expect(good.submission.score).toBe(100);
    expect(good.results.length).toBe(2);

    // hidden cases never expose expected/received
    const hidden = good.results.find((r) => r.hidden);
    expect(hidden).toBeDefined();
    expect(hidden!.expected).toBeUndefined();
    expect(hidden!.received).toBeUndefined();
    const visible = good.results.find((r) => !r.hidden)!;
    expect(visible.expected).toBe("42");
    expect(visible.received).toBe("42");

    // best score on lesson progress
    const lp = await db.lessonProgress.findUniqueOrThrow({
      where: { userId_lessonId: { userId: student.id, lessonId: lessons[0].id } },
    });
    expect(lp.exerciseBestScore).toBe(100);

    // submissions history kept
    const history = await db.submission.count({ where: { userId: student.id, exerciseId: exercise.id } });
    expect(history).toBe(2);
  });

  test("runtime errors and timeouts are captured, never crash the API", async () => {
    const student = await mkUser("ex2@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("exercise-2");
    const exercise = await mkExercise(lessons[0].id, "1");
    await enrollUser(student.id, course.id);

    const crash = await submitSolution(student.id, exercise.id, "raise ValueError('boom')", "python");
    expect(crash.submission.status).toBe("ERROR");
    expect(crash.results.every((r) => !r.passed)).toBe(true);

    const timeout = await submitSolution(student.id, exercise.id, "while True:\n    pass", "python");
    expect(timeout.submission.status).toBe("ERROR");
    expect(JSON.stringify(timeout.submission.results).toLowerCase()).toContain("timed out");
  }, 15000);

  test("submission requires enrollment", async () => {
    const outsider = await mkUser("ex3@t.test", "STUDENT");
    const { lessons } = await mkCourseTree("exercise-3");
    const exercise = await mkExercise(lessons[0].id, "7");
    try {
      await submitSolution(outsider.id, exercise.id, "print(7)", "python");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { status?: number }).status).toBe(403);
    }
  });
});

describe("javascript runner", () => {
  test("js submissions run in a restricted vm with timeout", async () => {
    const student = await mkUser("js@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("js-1");
    const exercise = await db.exercise.create({
      data: { lessonId: lessons[0].id, title: "JS", prompt: "p", language: "javascript", solutionCode: "console.log(6*7)", status: "PUBLISHED", difficulty: "EASY", points: 10 },
    });
    await db.testCase.createMany({
      data: [
        { exerciseId: exercise.id, name: "42", expectedOutput: "42", orderIndex: 1 },
        { exerciseId: exercise.id, name: "hidden", expectedOutput: "42", hidden: true, orderIndex: 2 },
      ],
    });
    await enrollUser(student.id, course.id);

    const result = await submitSolution(student.id, exercise.id, "console.log(6*7)", "javascript");
    expect(result.submission.status).toBe("PASSED");
    expect(result.submission.score).toBe(100);
  });
});
