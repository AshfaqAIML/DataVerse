/**
 * Shared test fixtures: minimal users, a course tree with exercise+quiz,
 * helper factories. Every test file builds what it needs on the test DB.
 */
import "./__setup";
import { db } from "@/lib/db";
import { hashPassword } from "@/auth/password";
import type { RoleKey } from "@/lib/domain/constants";

export async function ensureRoles() {
  const { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_RANK } = await import("@/lib/domain/constants");
  const permissionIds = new Map<string, string>();
  for (const key of Object.values(ROLE_PERMISSIONS.ADMINISTRATOR)) {
    const existing = await db.permission.findUnique({ where: { key } });
    const p = existing ?? (await db.permission.create({ data: { key, description: `Allows ${key}` } }));
    permissionIds.set(key, p.id);
  }
  const roleIds = new Map<RoleKey, string>();
  for (const key of Object.keys(ROLE_PERMISSIONS) as RoleKey[]) {
    const existing = await db.role.findUnique({ where: { key } });
    const role =
      existing ??
      (await db.role.create({
        data: { key, name: ROLE_LABELS[key], description: `${key} (test)`, rank: ROLE_RANK[key] },
      }));
    roleIds.set(key, role.id);
    const wanted = ROLE_PERMISSIONS[key];
    const have = new Set(
      (await db.rolePermission.findMany({ where: { roleId: role.id } })).map((rp) => rp.permissionId)
    );
    for (const perm of wanted) {
      const pid = permissionIds.get(perm)!;
      if (!have.has(pid)) {
        await db.rolePermission.create({ data: { roleId: role.id, permissionId: pid } });
      }
    }
  }
  return { roleIds, permissionIds };
}

export async function mkUser(email: string, roleKey: "STUDENT" | "ADMINISTRATOR" | "INSTRUCTOR" | "CONTENT_EDITOR", password = "Passw0rd!") {
  const { roleIds } = await ensureRoles();
  return db.user.create({
    data: {
      email,
      name: email.split("@")[0].replace(/[^a-z]/gi, " ") || "Test User",
      passwordHash: await hashPassword(password),
      roleId: roleIds.get(roleKey)!,
    },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
  });
}

/** A course with 1 module / 1 chapter / 2 lessons; lesson1 gets an exercise + a quiz. */
export async function mkCourseTree(slug = "test-course", opts?: { status?: string; lessonCount?: number }) {
  const { roleIds } = await ensureRoles();
  const subject =
    (await db.subject.findFirst()) ??
    (await db.subject.create({
      data: { slug: "test-subject", title: "Test Subject", description: "For tests", ownerId: (await mkUser("owner@t.test", "INSTRUCTOR")).id },
    }));
  const instructor = await mkUser(`instructor-${slug}@t.test`, "INSTRUCTOR");
  const course = await db.course.create({
    data: {
      slug,
      title: `Course ${slug}`,
      subtitle: "Test course",
      description: "A course built by the test suite",
      subjectId: subject.id,
      instructorId: instructor.id,
      level: "BEGINNER",
      status: opts?.status ?? "PUBLISHED",
      estimatedHours: 4,
      publishedAt: new Date(),
    },
  });
  const module_ = await db.module.create({
    data: { courseId: course.id, title: "Module 1", orderIndex: 1, status: "PUBLISHED" },
  });
  const chapter = await db.chapter.create({
    data: { moduleId: module_.id, title: "Chapter 1", orderIndex: 1 },
  });

  const lessons: { id: string; title: string }[] = [];
  for (let i = 1; i <= (opts?.lessonCount ?? 2); i++) {
    const lesson = await db.lesson.create({
      data: { chapterId: chapter.id, title: `Lesson ${i}`, slug: `lesson-${i}`, status: "PUBLISHED", orderIndex: i, estimatedMinutes: 10 },
    });
    await db.lessonSection.create({
      data: { lessonId: lesson.id, kind: "TEXT", title: "Intro", content: "Body", orderIndex: 1 },
    });
    lessons.push({ id: lesson.id, title: lesson.title });
  }

  return { course, module: module_, chapter, lessons, subject, instructor };
}

/** A python exercise with one visible + one hidden test case. */
export async function mkExercise(lessonId: string, expected = "42") {
  const exercise = await db.exercise.create({
    data: {
      lessonId,
      title: "Print the answer",
      prompt: "Print 42",
      starterCode: "# your code",
      solutionCode: "print(42)",
      language: "python",
      difficulty: "EASY",
      points: 10,
      orderIndex: 1,
      status: "PUBLISHED",
    },
  });
  await db.testCase.createMany({
    data: [
      { exerciseId: exercise.id, name: "visible case", expectedOutput: expected, orderIndex: 1 },
      { exerciseId: exercise.id, name: "hidden case", expectedOutput: expected, hidden: true, orderIndex: 2 },
    ],
  });
  return exercise;
}

/** A quiz with 3 MCQ/TF questions, one correct option each. */
export async function mkQuiz(lessonId: string, passingScore = 80) {
  const quiz = await db.quiz.create({
    data: { lessonId, title: "Checkpoint", passingScore, maxAttempts: 3 },
  });
  const questions: { id: string; correctIds: string[]; wrongIds: string[] }[] = [];
  for (let i = 1; i <= 3; i++) {
    const q = await db.quizQuestion.create({
      data: { quizId: quiz.id, prompt: `Question ${i}?`, kind: "MCQ", points: 1, orderIndex: i },
    });
    const correct = await db.answerOption.create({
      data: { questionId: q.id, text: "correct", isCorrect: true, orderIndex: 1 },
    });
    const wrong = await db.answerOption.create({
      data: { questionId: q.id, text: "wrong", isCorrect: false, orderIndex: 2 },
    });
    questions.push({ id: q.id, correctIds: [correct.id], wrongIds: [wrong.id] });
  }
  return { quiz, questions };
}

export async function cleanAll() {
  await ensureRoles(); // roles/permissions persist across the suite (idempotent)
  // children first — mirrors FK cascade order
  await db.aIMessage.deleteMany();
  await db.aIConversation.deleteMany();
  await db.notification.deleteMany();
  await db.comment.deleteMany();
  await db.discussion.deleteMany();
  await db.certificate.deleteMany();
  await db.achievementUnlock.deleteMany();
  await db.achievement.deleteMany();
  await db.courseProgress.deleteMany();
  await db.moduleProgress.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.enrollment.deleteMany();
  await db.projectSubmission.deleteMany();
  await db.project.deleteMany();
  await db.submission.deleteMany();
  await db.assessmentAttempt.deleteMany();
  await db.answerOption.deleteMany();
  await db.quizQuestion.deleteMany();
  await db.quiz.deleteMany();
  await db.testCase.deleteMany();
  await db.exercise.deleteMany();
  await db.codeExample.deleteMany();
  await db.lessonSection.deleteMany();
  await db.lesson.deleteMany();
  await db.chapter.deleteMany();
  await db.module.deleteMany();
  await db.learningPathCourse.deleteMany();
  await db.learningPath.deleteMany();
  await db.course.deleteMany();
  await db.glossaryTerm.deleteMany();
  await db.subject.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
}
