/**
 * Authoring DSL — terse, type-checked helpers for curriculum data files.
 *
 * Keep the data files compact while the validator (validate.ts) enforces
 * completeness: nothing authored through these helpers can become an
 * empty course shell without failing `bun test`.
 */
import type {
  ChapterDef,
  ExerciseKind,
  FinalExamDef,
  LessonDef,
  LessonType,
  ModuleDef,
  ProjectDef,
  ProjectTier,
} from "./types";

/** A lesson. `type` defaults to "concept"; `exercises` defaults to 2. */
export const L = (
  title: string,
  minutes: number,
  concepts: string[],
  summary: string,
  type: LessonType = "concept",
  exercises = 2
): LessonDef => ({ title, minutes, type, summary, concepts, exercises });

/** A chapter: focused objective + at least two lessons. */
export const ch = (title: string, focus: string, lessons: LessonDef[], exerciseCount?: number): ChapterDef => ({
  title,
  focus,
  lessons,
  ...(exerciseCount !== undefined ? { exerciseCount } : {}),
});

/** A module with checkpoint quiz (20 min / 12 questions / 80% by default). */
export const mod = (
  title: string,
  summary: string,
  outcomes: string[],
  exerciseKinds: ExerciseKind[],
  chapters: ChapterDef[],
  checkpoint?: Partial<ModuleDef["checkpoint"]>
): ModuleDef => ({
  title,
  summary,
  outcomes,
  exerciseKinds,
  chapters,
  checkpoint: { minutes: 20, questions: 12, passingScore: 80, ...checkpoint },
});

/** The subject's final exam. */
export const exam = (title: string, minutes: number, questions: number, passingScore = 80): FinalExamDef => ({
  title,
  minutes,
  questions,
  passingScore,
});

/** A subject project. */
export const proj = (
  title: string,
  brief: string,
  hours: number,
  tier: ProjectTier,
  deliverables: string[],
  rubric: string[],
  tools: string[]
): ProjectDef => ({ title, brief, hours, tier, deliverables, rubric, tools });
