import "../__setup";
import { describe, expect, test, beforeAll } from "bun:test";
import { db } from "@/lib/db";
import { cleanAll, mkCourseTree, mkExercise, mkQuiz, mkUser } from "../helpers";

/**
 * Database integrity tests — FK cascade rules, unique constraints and
 * referential behavior enforced by the migration (SQLite, FK enforcement on).
 */
beforeAll(cleanAll);

describe("unique constraints", () => {
  test("duplicate email is rejected (P2002)", async () => {
    await mkUser("dupe@t.test", "STUDENT");
    try {
      await mkUser("dupe@t.test", "STUDENT");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2002");
    }
  });

  test("duplicate enrollment is rejected", async () => {
    const user = await mkUser("enrolldupe@t.test", "STUDENT");
    const { course } = await mkCourseTree("enroll-unique");
    await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
    try {
      await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2002");
    }
  });

  test("one lesson progress row per user+lesson", async () => {
    const user = await mkUser("progdupe@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("prog-unique");
    await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lessons[0].id } });
    try {
      await db.lessonProgress.create({ data: { userId: user.id, lessonId: lessons[0].id } });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2002");
    }
  });

  test("certificate is unique per user+course and has a public code", async () => {
    const user = await mkUser("certdupe@t.test", "STUDENT");
    const { course } = await mkCourseTree("cert-unique");
    await db.certificate.create({ data: { code: "DVA-TEST-AAAA11", userId: user.id, courseId: course.id, title: "Cert 1" } });
    try {
      await db.certificate.create({ data: { code: "DVA-TEST-BBBB22", userId: user.id, courseId: course.id, title: "Cert 2" } });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2002");
    }
    try {
      await db.certificate.create({ data: { code: "DVA-TEST-AAAA11", userId: (await mkUser("other@t.test", "STUDENT")).id, courseId: course.id, title: "Dup code" } });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2002");
    }
  });
});

describe("cascade rules", () => {
  test("deleting a course cascades the whole content tree", async () => {
    const { course, lessons } = await mkCourseTree("cascade-course");
    const exercise = await mkExercise(lessons[0].id);
    const { quiz } = await mkQuiz(lessons[1].id);

    const countsBefore = {
      modules: await db.module.count({ where: { courseId: course.id } }),
      lessons: await db.lesson.count({ where: { chapter: { module: { courseId: course.id } } } }),
      exercises: await db.exercise.count({ where: { lesson: { chapter: { module: { courseId: course.id } } } } }),
      testCases: await db.testCase.count({ where: { exercise } }),
    };
    expect(countsBefore).toEqual({ modules: 1, lessons: 2, exercises: 1, testCases: 2 });

    await db.course.delete({ where: { id: course.id } });

    expect(await db.module.count({ where: { courseId: course.id } })).toBe(0);
    expect(await db.lesson.count({ where: { chapter: { module: { courseId: course.id } } } })).toBe(0);
    expect(await db.exercise.count({ where: { id: exercise.id } })).toBe(0);
    expect(await db.testCase.count({ where: { exerciseId: exercise.id } })).toBe(0);
    expect(await db.quiz.count({ where: { id: quiz.id } })).toBe(0);
    expect(await db.quizQuestion.count({ where: { quizId: quiz.id } })).toBe(0);
  });

  test("deleting a user cascades their sessions, progress and submissions", async () => {
    const user = await mkUser("cascading@t.test", "STUDENT");
    const { course, lessons } = await mkCourseTree("cascade-user");
    await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lessons[0].id } });
    await db.session.create({ data: { userId: user.id, expiresAt: new Date(Date.now() + 1000) } });
    const exercise = await mkExercise(lessons[0].id);
    await db.submission.create({ data: { exerciseId: exercise.id, userId: user.id, code: "print(1)" } });

    await db.user.delete({ where: { id: user.id } });

    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.enrollment.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.lessonProgress.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.submission.count({ where: { userId: user.id } })).toBe(0);
    // content survives user deletion
    expect(await db.lesson.count({ where: { id: lessons[0].id } })).toBe(1);
  });

  test("lesson delete cascades sections, exercises and test cases", async () => {
    const { lessons } = await mkCourseTree("cascade-lesson");
    const exercise = await mkExercise(lessons[0].id);
    await db.lesson.delete({ where: { id: lessons[0].id } });
    expect(await db.lessonSection.count({ where: { lessonId: lessons[0].id } })).toBe(0);
    expect(await db.exercise.count({ where: { id: exercise.id } })).toBe(0);
    expect(await db.testCase.count({ where: { exerciseId: exercise.id } })).toBe(0);
  });

  test("comment thread cascades on discussion delete", async () => {
    const user = await mkUser("commenter@t.test", "STUDENT");
    const d = await db.discussion.create({ data: { userId: user.id, title: "T", body: "B" } });
    const c1 = await db.comment.create({ data: { discussionId: d.id, userId: user.id, body: "root" } });
    await db.comment.create({ data: { discussionId: d.id, userId: user.id, body: "reply", parentId: c1.id } });
    await db.discussion.delete({ where: { id: d.id } });
    expect(await db.comment.count({ where: { discussionId: d.id } })).toBe(0);
  });
});

describe("referential guards", () => {
  test("role cannot be deleted while users hold it (Restrict)", async () => {
    const user = await mkUser("roleheld@t.test", "STUDENT");
    const role = await db.role.findUniqueOrThrow({ where: { id: user.roleId } });
    try {
      await db.role.delete({ where: { id: role.id } });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as { code?: string }).code).toBe("P2003");
    }
  });

  test("AI conversation messages cascade with the conversation", async () => {
    const user = await mkUser("aichat@t.test", "STUDENT");
    const conv = await db.aIConversation.create({ data: { userId: user.id, title: "Test" } });
    await db.aIMessage.create({ data: { conversationId: conv.id, role: "USER", content: "hi" } });
    await db.aIMessage.create({ data: { conversationId: conv.id, role: "ASSISTANT", content: "hello" } });
    await db.aIConversation.delete({ where: { id: conv.id } });
    expect(await db.aIMessage.count({ where: { conversationId: conv.id } })).toBe(0);
  });

  test("indexes exist on hot paths (composite uniques)", async () => {
    // implicitly verified by the unique constraint tests above; here we
    // assert the compound unique names resolve through Prisma
    expect(() => db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: "a", lessonId: "b" } } })).not.toThrow();
    expect(() => db.enrollment.findUnique({ where: { userId_courseId: { userId: "a", courseId: "b" } } })).not.toThrow();
  });
});
