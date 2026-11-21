/**
 * Content pipeline seed — projects the compiled content tree into the
 * database, exactly as the curriculum registry defines it.
 *
 *   content/subjects/<slug>/m01/c01/NN-slug/lesson.mdx
 *     -> Course -> Module -> Chapter -> Lesson
 *     -> LessonSection (full markdown per canonical section)
 *     -> CodeExample (runnable python fences)
 *     -> Exercise + TestCase (code exercises with machine-verified solutions)
 *     -> Quiz + QuizQuestion + AnswerOption(feedback) (knowledge checks;
 *        prose exercises land here as SHORT_ANSWER self-check questions)
 *     -> GlossaryTerm (shared glossary + lesson terminology, upserted)
 *
 * Anti-inflation guarantees baked in:
 *   - no Course row exists for a subject until at least one lesson has
 *     authored content;
 *   - a registry course stays status DRAFT (invisible to learners) until
 *     EVERY registry lesson is authored — learner-visible counts are never
 *     inflated;
 *   - lessons with content seed as PUBLISHED rows but live under a DRAFT
 *     course, so editors preview and learners cannot see half-built work.
 *
 * Adding content = adding directories under content/subjects/. No code
 * changes anywhere in this file.
 */
import { db } from "../../src/lib/db";
import { compileContent, defaultContentRoot, isCodeExercise } from "../../src/lib/content";
import type { CompiledLesson } from "../../src/lib/content";
import { SCHOOLS, availableSubjects, subjectBySlug } from "../../src/lib/curriculum/data";
import { subjectHours } from "../../src/lib/curriculum/validate";

const LEVEL_BY_DIFFICULTY: Record<string, string> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

const POINTS_BY_DIFFICULTY: Record<string, number> = { EASY: 10, MEDIUM: 20, HARD: 30 };

const LESSON_STATUS_BY_LIFECYCLE: Record<string, string> = {
  draft: "DRAFT",
  "self-review": "DRAFT",
  "peer-review": "IN_REVIEW",
  "technical-review": "IN_REVIEW",
  approved: "PUBLISHED",
  published: "PUBLISHED",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface SeedPipelineDeps {
  adminId: string;
  editorId: string;
  instructorBySchool: Record<string, string>; // school code -> user id
}

export async function seedRegistryContent(deps: SeedPipelineDeps) {
  const bundle = compileContent(defaultContentRoot());
  const stats = {
    schools: 0,
    courses: 0,
    lessonsAuthored: 0,
    lessonsPlanned: 0,
    sections: 0,
    exercises: 0,
    testCases: 0,
    quizzes: 0,
    questions: 0,
    glossaryTerms: 0,
  };

  // ---------------------------------------------------------------- 1) schools
  const schoolSubjectIds = new Map<string, string>();
  for (const [i, school] of SCHOOLS.entries()) {
    const existing = await db.subject.findUnique({ where: { slug: school.slug } });
    const subject = existing
      ? await db.subject.update({
          where: { id: existing.id },
          data: { title: school.name, description: school.description, color: school.color, icon: school.icon },
        })
      : await db.subject.create({
          data: {
            slug: school.slug,
            title: school.name,
            description: school.description,
            color: school.color,
            icon: school.icon,
            ownerId: deps.adminId,
            orderIndex: 10 + i,
          },
        });
    schoolSubjectIds.set(school.slug, subject.id);
    stats.schools += 1;
  }

  const authoredByRef = new Map<string, CompiledLesson>();
  for (const lesson of bundle.lessons) authoredByRef.set(lesson.ref, lesson);

  // ------------------------------------------------------- 2) subjects/courses
  for (const subject of availableSubjects) {
    const authored = bundle.lessons.filter((l) => l.subjectSlug === subject.slug);
    if (authored.length === 0) continue; // no content yet -> no course row (anti-inflation)
    const coverage = bundle.coverage.find((c) => c.subject === subject.slug);
    const complete = !!coverage && coverage.authored === coverage.total;
    const school = SCHOOLS.find((s) => s.code === subject.school)!;
    const subjectId = schoolSubjectIds.get(school.slug)!;

    const course = await db.course.create({
      data: {
        slug: subject.slug,
        title: subject.title,
        subtitle: subject.blurb,
        description: subject.blurb,
        subjectId,
        instructorId: deps.instructorBySchool[subject.school] ?? deps.adminId,
        level: LEVEL_BY_DIFFICULTY[subject.difficulty],
        status: complete ? "PUBLISHED" : "DRAFT",
        estimatedHours: subjectHours(subject),
        publishedAt: complete ? new Date() : null,
        completionCriteria: { minQuizScore: 80, requiredProject: true },
      },
    });
    stats.courses += 1;

    for (const [mi, moduleDef] of subject.modules.entries()) {
      const module_ = await db.module.create({
        data: {
          courseId: course.id,
          title: moduleDef.title,
          summary: moduleDef.summary,
          orderIndex: mi + 1,
          status: "DRAFT",
        },
      });

      for (const [ci, chapterDef] of moduleDef.chapters.entries()) {
        const chapter = await db.chapter.create({
          data: { moduleId: module_.id, title: chapterDef.title, orderIndex: ci + 1 },
        });

        for (const [li, lessonDef] of chapterDef.lessons.entries()) {
          const ref = `${subject.slug}/m${mi + 1}/c${ci + 1}/${li + 1}`;
          const compiled = authoredByRef.get(ref);
          const lesson = await db.lesson.create({
            data: {
              chapterId: chapter.id,
              title: lessonDef.title,
              slug: compiled ? compiled.dirName.replace(/^\d+-/, "") : slugify(lessonDef.title),
              summary: lessonDef.summary,
              estimatedMinutes: lessonDef.minutes,
              status: compiled
                ? LESSON_STATUS_BY_LIFECYCLE[compiled.frontmatter.status] ?? "DRAFT"
                : "DRAFT",
              orderIndex: li + 1,
              isPreviewFree: mi === 0 && ci === 0 && li === 0,
            },
          });
          if (compiled) stats.lessonsAuthored += 1;
          else stats.lessonsPlanned += 1;

          if (!compiled) continue;
          await seedLessonBody(compiled, lesson.id, stats);
        }
      }
    }
  }

  // ------------------------------------------------------------- 3) glossary
  const termBySlug = new Map<string, { term: string; definition: string; plainEnglish: string }>();
  for (const t of bundle.glossary.terms) termBySlug.set(slugify(t.term), { term: t.term, definition: t.definition, plainEnglish: t.plainEnglish });
  for (const lesson of bundle.lessons) {
    const subject = subjectBySlug(lesson.subjectSlug);
    const school = subject ? SCHOOLS.find((s) => s.code === subject.school) : undefined;
    for (const t of lesson.data.terminology) {
      const slug = slugify(t.term);
      const existing = termBySlug.get(slug);
      // lesson terminology refines the shared glossary when a term repeats
      termBySlug.set(slug, {
        term: existing?.term ?? t.term,
        definition: t.definition,
        plainEnglish: t.plainEnglish,
      });
      await db.glossaryTerm
        .upsert({
          where: { slug },
          create: {
            slug,
            term: existing?.term ?? t.term,
            definition: `${t.definition} — in plain English: ${t.plainEnglish}`,
            subjectId: school ? schoolSubjectIds.get(school.slug) : null,
            createdById: deps.editorId,
          },
          update: {
            definition: `${t.definition} — in plain English: ${t.plainEnglish}`,
            subjectId: school ? schoolSubjectIds.get(school.slug) : null,
          },
        })
        .catch(() => undefined); // slug collisions with hand-seeded demo terms are non-fatal
    }
  }
  for (const [slug, entry] of termBySlug) {
    await db.glossaryTerm
      .upsert({
        where: { slug },
        create: {
          slug,
          term: entry.term,
          definition: `${entry.definition} — in plain English: ${entry.plainEnglish}`,
          createdById: deps.editorId,
        },
        update: { definition: `${entry.definition} — in plain English: ${entry.plainEnglish}` },
      })
      .catch(() => undefined);
  }
  stats.glossaryTerms = termBySlug.size;

  return stats;
}

async function seedLessonBody(lesson: CompiledLesson, lessonId: string, stats: ReturnType<typeof emptyStats>) {
  for (const [si, section] of lesson.parsed.sections.entries()) {
    const hasPython = section.blocks.some((b) => b.language === "python");
    const kind =
      section.id === "visual-explanation" ? "VISUAL"
      : section.id === "key-takeaways" || section.id === "everyday-explanation" ? "CALLOUT"
      : hasPython ? "CODE"
      : "TEXT";
    const sectionRow = await db.lessonSection.create({
      data: {
        lessonId,
        kind,
        title: section.heading,
        content: section.raw || section.prose,
        orderIndex: si + 1,
      },
    });
    stats.sections += 1;

    let codeOrder = 0;
    for (const block of section.blocks) {
      if (block.language !== "python" || !block.content.trim()) continue;
      codeOrder += 1;
      await db.codeExample.create({
        data: {
          lessonSectionId: sectionRow.id,
          language: "python",
          code: block.content,
          orderIndex: codeOrder,
        },
      });
    }
  }

  // code exercises -> Exercise rows with machine-verified solutions
  let exerciseOrder = 0;
  for (const ex of lesson.data.exercises) {
    if (!isCodeExercise(ex)) continue;
    exerciseOrder += 1;
    const exercise = await db.exercise.create({
      data: {
        lessonId,
        title: ex.title,
        prompt: ex.prompt,
        starterCode: ex.starterCode,
        solutionCode: ex.solutionCode,
        language: "python",
        difficulty: ex.difficulty,
        points: POINTS_BY_DIFFICULTY[ex.difficulty] ?? 10,
        orderIndex: exerciseOrder,
        status: "PUBLISHED",
      },
    });
    stats.exercises += 1;
    for (const [ti, tc] of ex.testCases.entries()) {
      await db.testCase.create({
        data: {
          exerciseId: exercise.id,
          name: tc.name,
          input: tc.input ?? undefined,
          expectedOutput: tc.expectedOutput,
          hidden: tc.hidden ?? false,
          orderIndex: ti + 1,
        },
      });
      stats.testCases += 1;
    }
  }

  // knowledge checks + prose exercises -> one quiz per lesson
  const quiz = await db.quiz.create({
    data: {
      lessonId,
      title: `Knowledge check — ${lesson.frontmatter.title}`,
      description: "Self-test for this lesson. Every option explains why it is right or wrong.",
      kind: "CHECKPOINT",
      passingScore: 80,
      maxAttempts: null,
    },
  });
  stats.quizzes += 1;

  let questionOrder = 0;
  for (const kc of lesson.data.knowledgeCheck) {
    questionOrder += 1;
    const question = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        prompt: kc.prompt,
        kind: kc.kind,
        explanation: kc.explanation,
        points: 1,
        orderIndex: questionOrder,
      },
    });
    stats.questions += 1;
    for (const [oi, option] of kc.options.entries()) {
      await db.answerOption.create({
        data: {
          questionId: question.id,
          text: option.text,
          isCorrect: option.correct,
          feedback: option.feedback,
          orderIndex: oi + 1,
        },
      });
    }
  }
  for (const ex of lesson.data.exercises) {
    if (isCodeExercise(ex)) continue;
    questionOrder += 1;
    const explanation = [
      `Hints: ${ex.hints.join("; ")}.`,
      `Worked solution: ${ex.solutionSteps.join(" ")}`,
      `Answer: ${ex.answer}`,
    ].join(" ");
    const question = await db.quizQuestion.create({
      data: {
        quizId: quiz.id,
        prompt: `${ex.title} — ${ex.prompt}`,
        kind: "SHORT_ANSWER",
        explanation,
        points: 2,
        orderIndex: questionOrder,
      },
    });
    stats.questions += 1;
    await db.answerOption.create({
      data: {
        questionId: question.id,
        text: "I checked my answer against the worked solution",
        isCorrect: true,
        feedback: "Self-graded: compare your reasoning with the worked solution in the explanation.",
        orderIndex: 1,
      },
    });
  }
}

function emptyStats() {
  return {
    schools: 0,
    courses: 0,
    lessonsAuthored: 0,
    lessonsPlanned: 0,
    sections: 0,
    exercises: 0,
    testCases: 0,
    quizzes: 0,
    questions: 0,
    glossaryTerms: 0,
  };
}
