/**
 * Seed library — shared types, wipe and content-tree factory.
 *
 * The entry point is prisma/seed.ts; content specs live in
 * seed-modules/content-*.ts and the learner-journey simulation in
 * seed-modules/simulation.ts.
 */
import { db } from "../../src/lib/db";

// ------------------------------------------------------------------ types

export type CodeSpec = { language: string; code: string; explanation?: string; filename?: string };
export type SectionSpec = { kind: string; title?: string; content: string; code?: CodeSpec[] };
export type TestCaseSpec = { name: string; input?: string; expectedOutput: string; hidden?: boolean };
export type ExerciseSpec = {
  title: string; prompt: string; starterCode: string; solutionCode: string;
  language: string; difficulty: string; points: number; testCases: TestCaseSpec[];
};
export type QuestionSpec = {
  prompt: string; kind: string; points?: number; explanation?: string;
  options: { text: string; correct?: boolean }[];
};
export type QuizSpec = {
  title: string; description?: string; passingScore?: number; maxAttempts?: number | null;
  questions: QuestionSpec[];
};
export type LessonSpec = {
  title: string; slug: string; summary?: string; minutes?: number; previewFree?: boolean;
  sections: SectionSpec[]; exercises?: ExerciseSpec[]; quiz?: QuizSpec;
};
export type ChapterSpec = { title: string; lessons: LessonSpec[] };
export type ModuleSpec = { title: string; summary?: string; chapters: ChapterSpec[] };
export type ProjectSpec = { title: string; brief: string; requirements: string[]; difficulty: string; points: number };
export type CourseSpec = {
  slug: string; title: string; subtitle: string; description: string;
  subjectSlug: string; instructorEmail: string; level: string; status: string;
  estimatedHours: number; modules: ModuleSpec[]; project?: ProjectSpec;
};

// ------------------------------------------------------------------- wipe

export async function wipe() {
  // children first (FK-safe order)
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
  await db.user.deleteMany(); // before roles: User.roleId is ON DELETE RESTRICT
  await db.rolePermission.deleteMany();
  await db.role.deleteMany();
  await db.permission.deleteMany();
}

// ------------------------------------------------------------ tree factory

/** Lesson registry filled while creating content — read by the simulation. */
export const lessonIndex = new Map<
  string, // lesson slug (globally unique in seed content)
  { id: string; title: string; courseSlug: string; quizIds: string[]; exercises: { id: string; solutionCode: string; language: string }[] }
>();

export async function createCourse(spec: CourseSpec) {
  const subject = await db.subject.findUniqueOrThrow({ where: { slug: spec.subjectSlug } });
  const instructor = spec.instructorEmail
    ? await db.user.findUniqueOrThrow({ where: { email: spec.instructorEmail } })
    : null;

  const course = await db.course.create({
    data: {
      slug: spec.slug,
      title: spec.title,
      subtitle: spec.subtitle,
      description: spec.description,
      subjectId: subject.id,
      instructorId: instructor?.id,
      level: spec.level,
      status: spec.status,
      estimatedHours: spec.estimatedHours,
      publishedAt: spec.status === "PUBLISHED" ? new Date(Date.now() - 90 * 24 * 3600 * 1000) : null,
      completionCriteria: { minQuizScore: 80, requiredProject: !!spec.project },
    },
  });

  let mOrder = 0;
  for (const m of spec.modules) {
    mOrder += 1;
    const module_ = await db.module.create({
      data: {
        courseId: course.id,
        title: m.title,
        summary: m.summary,
        orderIndex: mOrder,
        status: spec.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      },
    });

    let cOrder = 0;
    for (const c of m.chapters) {
      cOrder += 1;
      const chapter = await db.chapter.create({
        data: { moduleId: module_.id, title: c.title, orderIndex: cOrder },
      });

      let lOrder = 0;
      for (const l of c.lessons) {
        lOrder += 1;
        const lessonStatus = spec.status === "PUBLISHED" ? "PUBLISHED" : spec.status === "IN_REVIEW" ? "IN_REVIEW" : "DRAFT";
        const lesson = await db.lesson.create({
          data: {
            chapterId: chapter.id,
            title: l.title,
            slug: l.slug,
            summary: l.summary,
            estimatedMinutes: l.minutes ?? 15,
            status: lessonStatus,
            orderIndex: lOrder,
            isPreviewFree: l.previewFree ?? false,
          },
        });

        let sOrder = 0;
        for (const s of l.sections) {
          sOrder += 1;
          const section = await db.lessonSection.create({
            data: {
              lessonId: lesson.id,
              kind: s.kind,
              title: s.title,
              content: s.content,
              orderIndex: sOrder,
            },
          });
          let eOrder = 0;
          for (const code of s.code ?? []) {
            eOrder += 1;
            await db.codeExample.create({
              data: {
                lessonSectionId: section.id,
                filename: code.filename,
                language: code.language,
                code: code.code,
                explanation: code.explanation,
                orderIndex: eOrder,
              },
            });
          }
        }

        const quizIds: string[] = [];
        const exercises: { id: string; solutionCode: string; language: string }[] = [];

        let xOrder = 0;
        for (const ex of l.exercises ?? []) {
          xOrder += 1;
          const exercise = await db.exercise.create({
            data: {
              lessonId: lesson.id,
              title: ex.title,
              prompt: ex.prompt,
              starterCode: ex.starterCode,
              solutionCode: ex.solutionCode,
              language: ex.language,
              difficulty: ex.difficulty,
              points: ex.points,
              orderIndex: xOrder,
              status: "PUBLISHED",
            },
          });
          let tOrder = 0;
          for (const tc of ex.testCases) {
            tOrder += 1;
            await db.testCase.create({
              data: {
                exerciseId: exercise.id,
                name: tc.name,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                hidden: tc.hidden ?? false,
                orderIndex: tOrder,
              },
            });
          }
          exercises.push({ id: exercise.id, solutionCode: ex.solutionCode, language: ex.language });
        }

        if (l.quiz) {
          const quiz = await db.quiz.create({
            data: {
              lessonId: lesson.id,
              title: l.quiz.title,
              description: l.quiz.description,
              passingScore: l.quiz.passingScore ?? 80,
              maxAttempts: l.quiz.maxAttempts ?? null,
            },
          });
          let qOrder = 0;
          for (const q of l.quiz.questions) {
            qOrder += 1;
            const question = await db.quizQuestion.create({
              data: {
                quizId: quiz.id,
                prompt: q.prompt,
                kind: q.kind,
                points: q.points ?? 1,
                explanation: q.explanation,
                orderIndex: qOrder,
              },
            });
            let oOrder = 0;
            for (const o of q.options) {
              oOrder += 1;
              await db.answerOption.create({
                data: { questionId: question.id, text: o.text, isCorrect: !!o.correct, orderIndex: oOrder },
              });
            }
          }
          quizIds.push(quiz.id);
        }

        lessonIndex.set(l.slug, { id: lesson.id, title: l.title, courseSlug: spec.slug, quizIds, exercises });
      }
    }
  }

  if (spec.project) {
    await db.project.create({
      data: {
        courseId: course.id,
        title: spec.project.title,
        brief: spec.project.brief,
        requirements: spec.project.requirements,
        difficulty: spec.project.difficulty,
        points: spec.project.points,
        status: "PUBLISHED",
      },
    });
  }

  return course;
}

// The lesson registry is read by the simulation phase in seed.ts.
