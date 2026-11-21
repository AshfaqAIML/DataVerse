/**
 * Content schemas — the machine contract for every lesson.
 *
 * Zod v4. Parsed sources:
 *   - lesson.mdx frontmatter  -> LessonFrontmatter
 *   - lesson.yaml             -> LessonData (terminology, exercises, knowledge
 *                                 check, verification, reviews)
 *   - glossary/core.yaml      -> Glossary
 *   - manifest.yaml           -> ContentManifest
 *   - review/lifecycle.yaml   -> LifecycleConfig (lifecycle.ts)
 *
 * These schemas ARE the quality bar: anything a validator can check
 * structurally is checked here first; prose-level rules live in rules.ts.
 */
import { z } from "zod";
import type { Archetype } from "./sections";

export const ARCHETYPES = ["math", "programming", "library", "concept"] as const;

export const LESSON_STATUSES = [
  "draft",
  "self-review",
  "peer-review",
  "technical-review",
  "approved",
  "published",
] as const;

/** Lesson reference: "<subject>/m<module>/c<chapter>/<lesson-index>" e.g. "python/m1/c1/3". */
export const LESSON_REF = /^([a-z0-9-]+)\/m(\d+)\/c(\d+)\/(\d+)$/;

export const frontmatterSchema = z.object({
  title: z.string().min(3),
  archetype: z.enum(ARCHETYPES),
  status: z.enum(LESSON_STATUSES),
  author: z.string().min(3),
  objectives: z.array(z.string().min(10)).min(3).max(7),
  prerequisites: z
    .array(
      z.object({
        ref: z.string().regex(LESSON_REF, "lesson ref must look like subject/m1/c1/3"),
        reason: z.string().min(10),
      })
    )
    .default([]),
  codeDemo: z
    .object({ include: z.boolean().default(true), reason: z.string().optional() })
    .default({ include: true }),
});

export type LessonFrontmatter = z.infer<typeof frontmatterSchema>;

export const terminologyEntrySchema = z.object({
  term: z.string().min(2),
  abbr: z.string().optional(),
  definition: z.string().min(15),
  plainEnglish: z.string().min(10),
});

export type TerminologyEntry = z.infer<typeof terminologyEntrySchema>;

export const testCaseSchema = z.object({
  name: z.string().min(2),
  input: z.string().optional(),
  expectedOutput: z.string().min(1),
  hidden: z.boolean().optional(),
});

export const CODE_EXERCISE_KINDS = [
  "write-code",
  "debug",
  "parsons",
  "dataset-task",
] as const;
export const PROSE_EXERCISE_KINDS = [
  "concept-check",
  "multiple-choice",
  "fill-in",
  "predict-output",
  "calculation",
  "derive",
  "interpret-results",
  "case-analysis",
  "mock-interview",
  "design-review",
] as const;
export const EXERCISE_KINDS = [...CODE_EXERCISE_KINDS, ...PROSE_EXERCISE_KINDS] as const;

const exerciseCommon = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case id"),
  kind: z.enum(EXERCISE_KINDS),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  title: z.string().min(3),
  prompt: z.string().min(20),
  hints: z.array(z.string().min(5)).max(3),
};

/** Code exercises carry runnable solutions graded by the sandboxed runner. */
const codeExerciseSchema = z.object({
  ...exerciseCommon,
  kind: z.enum(CODE_EXERCISE_KINDS),
  starterCode: z.string().default(""),
  solutionCode: z.string().min(1, "code exercises need a working solution"),
  explanation: z.string().min(15),
  testCases: z.array(testCaseSchema).min(1),
});

/** Prose exercises carry worked solutions a human can grade against. */
const proseExerciseSchema = z.object({
  ...exerciseCommon,
  kind: z.enum(PROSE_EXERCISE_KINDS),
  solutionSteps: z.array(z.string().min(10)).min(2, "worked solutions need the steps"),
  answer: z.string().min(3),
});

export const exerciseSchema = z.union([codeExerciseSchema, proseExerciseSchema]);
export type Exercise = z.infer<typeof exerciseSchema>;
export type CodeExercise = z.infer<typeof codeExerciseSchema>;
export type ProseExercise = z.infer<typeof proseExerciseSchema>;

export function isCodeExercise(ex: Exercise): ex is CodeExercise {
  return (CODE_EXERCISE_KINDS as readonly string[]).includes(ex.kind);
}

export const knowledgeCheckItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  prompt: z.string().min(10),
  kind: z.enum(["MCQ", "MULTI_SELECT", "TRUE_FALSE"]),
  explanation: z.string().min(15),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        correct: z.boolean(),
        feedback: z.string().min(10, "every option explains why it is right or wrong"),
      })
    )
    .min(2),
});
export type KnowledgeCheckItem = z.infer<typeof knowledgeCheckItemSchema>;

export const reviewRecordSchema = z.object({
  role: z.enum(["author", "peer-reviewer", "technical-reviewer", "instructional-designer", "editor"]),
  reviewer: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verdict: z.enum(["approve", "request-changes"]),
  notes: z.string().min(10),
});

export const verificationSchema = z.object({
  python: z.string().min(3),
  libraries: z.record(z.string(), z.string()).default({}),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  how: z.string().default("bun run content:validate"),
});

export const lessonDataSchema = z.object({
  terminology: z.array(terminologyEntrySchema).min(3, "at least 3 new terms per lesson"),
  exercises: z.array(exerciseSchema).min(3, "at least 3 practice exercises per lesson"),
  knowledgeCheck: z
    .array(knowledgeCheckItemSchema)
    .min(3, "at least 3 knowledge-check questions per lesson"),
  verification: verificationSchema.optional(),
  reviews: z.array(reviewRecordSchema).default([]),
  changes: z
    .array(z.object({ date: z.string(), note: z.string().min(5) }))
    .default([]),
});

export type LessonData = z.infer<typeof lessonDataSchema>;

export const glossaryEntrySchema = z.object({
  term: z.string().min(2),
  abbr: z.string().optional(),
  definition: z.string().min(15),
  plainEnglish: z.string().min(10),
});
export const glossarySchema = z.object({
  version: z.number().int().min(1),
  terms: z.array(glossaryEntrySchema).min(1),
});
export type Glossary = z.infer<typeof glossarySchema>;

export const manifestSchema = z.object({
  version: z.number().int().min(1),
  standardsVersion: z.string().min(1),
  exercisePolicy: z.object({
    minExercisesPerLesson: z.number().int().min(1),
    minKnowledgeCheckPerLesson: z.number().int().min(1),
    maxHints: z.number().int().min(1),
    solutionsRequired: z.boolean(),
  }),
  verification: z.object({
    runner: z.string().min(2),
    timeoutMs: z.number().int().min(1000),
  }),
  contentRoot: z.string().default("content"),
});

export type ContentManifest = z.infer<typeof manifestSchema>;

/** Default archetype suggested for a school's subjects (scaffold hint). */
export const SCHOOL_ARCHETYPE: Record<string, Archetype> = {
  A: "programming",
  B: "math",
  C: "math",
  D: "concept",
  E: "library",
  F: "math",
  G: "programming",
  H: "concept",
  I: "concept",
};
