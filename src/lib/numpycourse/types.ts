/**
 * NumPy course content model — the contract for "NumPy: The Complete Course".
 *
 * Builds on the proven course content model (src/lib/course/types.ts) and
 * extends it with two NumPy-specific block kinds:
 *
 *   1. `functionDoc` — a complete reference card for ONE function:
 *      purpose, syntax, parameters, return value, a runnable example with
 *      its verified output, common mistakes, related functions and
 *      practical applications. Every card in the course is machine-checked
 *      by scripts/verify-numpy-outputs.ts.
 *   2. `arrayViz` — an embedded interactive array visualization (grid
 *      explorer, slice explorer, reshape lab, axis lab, broadcasting lab),
 *      rendered by src/components/numpy/ArrayViz.tsx.
 *
 * Everything else (text, code, tryIt, visual, table, callout, steps) is
 * reused from the base model, so lessons keep the same teaching rhythm as
 * the Python course.
 */
import type {
  Block,
  CodeLanguage,
  Course,
  Difficulty,
  Exercise,
  Lesson,
  LessonKind,
  MiniProject,
  MistakeEntry,
  Part,
  QuizOption,
  QuizQuestion,
  TermEntry,
} from "@/lib/course/types";

export type {
  Block,
  CodeLanguage,
  Course,
  Difficulty,
  Exercise,
  Lesson,
  LessonKind,
  MiniProject,
  MistakeEntry,
  Part,
  QuizOption,
  QuizQuestion,
  TermEntry,
};

// ---------------------------------------------------------------------------
// functionDoc — the per-function reference card
// ---------------------------------------------------------------------------

export interface FunctionParam {
  /** Parameter name as it appears in the signature. */
  name: string;
  /** The kind of value it accepts, e.g. "array_like", "int", "dtype". */
  type: string;
  /** true if positional/required (authors mark required params). */
  required?: boolean;
  /** What it does, in plain English (inline markdown allowed). */
  description: string;
  /** An example literal the reader can picture, e.g. "3" or "dtype=float64". */
  example?: string;
}

export interface FunctionMistake {
  mistake: string;
  why: string;
  fix: string;
}

export interface RelatedFunction {
  /** e.g. "np.asarray" */
  name: string;
  /** One line: how it differs / when to prefer it. */
  relation: string;
}

export interface FunctionDocBlock {
  kind: "functionDoc";
  /** Full call name, e.g. "np.array", "np.linspace", "a.reshape". */
  name: string;
  /** One-sentence plain-English purpose (shown under the title). */
  purpose: string;
  /** The syntax line, e.g. "np.array(object, dtype=None, *, copy=True)". */
  signature: string;
  /** The longer "why this function exists" paragraph. */
  purposeDetail?: string;
  /** Parameters, in signature order. */
  params: FunctionParam[];
  /** What comes back. */
  returns: { type: string; description: string };
  /** A runnable example (lang is python; imports included when needed). */
  example: string;
  /** REAL output of running the example (verified by the build script). */
  exampleOutput?: string;
  /** If the example deliberately crashes: the exact final error line. */
  exampleExpectError?: string;
  /** 1-3 common beginner mistakes specific to this function. */
  commonMistakes: FunctionMistake[];
  /** Related functions and when to prefer them. */
  related: RelatedFunction[];
  /** Where this shows up in real data work. */
  applications: string[];
  /** Optional footnote (version differences, history, performance notes). */
  notes?: string;
}

// ---------------------------------------------------------------------------
// arrayViz — interactive array visualizations
// ---------------------------------------------------------------------------

/** 1D data is a flat list; 2D data is row-major nested lists. */
export type VizData = number[] | number[][];

export interface SliceSelection {
  /** The expression the learner reads, e.g. "a[1, :2]" or "a[:, -1]". */
  expr: string;
  /** Selected [row, col] cells (for 1D data, [0, col]). */
  cells: number[][];
  /** One line explaining what this selects. */
  note?: string;
}

export type AxisOp = "sum" | "mean" | "max" | "min" | "prod";

export type ArrayVizMode = "explore" | "slice" | "reshape" | "axis" | "broadcast";

export interface ArrayVizBlock {
  kind: "arrayViz";
  title: string;
  caption?: string;
  mode: ArrayVizMode;
  /** explore / slice / reshape / axis: the array to show. */
  data?: VizData;
  /** Variable name used in labels (default "a"). */
  name?: string;
  /** explore mode: semantic row/column labels (e.g. city names). */
  labels?: { rows?: string[]; cols?: string[] };
  /** explore mode: the dtype to state in the info panel, e.g. "int64". */
  dtype?: string;
  /** slice mode: ordered selections to walk through. */
  selections?: SliceSelection[];
  /** reshape mode: target shapes to switch between, e.g. [[12], [3, 4], [4, 3], [2, 2, 3]]. */
  targets?: number[][];
  /** axis mode: offered operations (default sum). */
  ops?: AxisOp[];
  /** broadcast mode: preset operand pairs with real values. */
  presets?: Array<{
    label: string;
    a: number[][];
    b: number[][];
    note?: string;
  }>;
}

export type NumpyBlock = Block | FunctionDocBlock | ArrayVizBlock;

// ---------------------------------------------------------------------------
// Course shapes with NumPy blocks swapped in
// ---------------------------------------------------------------------------

export interface NumpyLesson extends Omit<Lesson, "blocks"> {
  blocks: NumpyBlock[];
}

export interface NumpyPart extends Omit<Part, "lessons"> {
  lessons: NumpyLesson[];
}

export interface NumpyCourse extends Omit<Course, "parts"> {
  parts: NumpyPart[];
}

/** A located lesson: which part it lives in + position. */
export interface NumpyLessonRef {
  part: NumpyPart;
  lesson: NumpyLesson;
  index: number;
}

export function findNumpyLesson(course: NumpyCourse, slug: string): NumpyLessonRef | null {
  for (const part of course.parts) {
    const index = part.lessons.findIndex((l) => l.slug === slug);
    if (index !== -1) return { part, lesson: part.lessons[index], index };
  }
  return null;
}

/** Ordered walk over every lesson in the course. */
export function allNumpyLessons(course: NumpyCourse): NumpyLessonRef[] {
  const out: NumpyLessonRef[] = [];
  for (const part of course.parts) {
    part.lessons.forEach((lesson, index) => out.push({ part, lesson, index }));
  }
  return out;
}

/** Next/previous lesson across part boundaries. */
export function neighborNumpyLesson(course: NumpyCourse, slug: string, dir: 1 | -1): NumpyLessonRef | null {
  const flat = allNumpyLessons(course);
  const at = flat.findIndex((l) => l.lesson.slug === slug);
  if (at === -1) return null;
  return flat[at + dir] ?? null;
}

export function totalNumpyMinutes(course: NumpyCourse): number {
  return allNumpyLessons(course).reduce((sum, l) => sum + l.lesson.minutes, 0);
}

export function countNumpyLessons(course: NumpyCourse): number {
  return allNumpyLessons(course).length;
}

export function countNumpyExercises(course: NumpyCourse): number {
  return course.parts.reduce((sum, p) => sum + p.exercises.length, 0);
}

export function countNumpyAssessmentQuestions(course: NumpyCourse): number {
  return course.parts.reduce((sum, p) => sum + p.assessment.length, 0);
}

export function countNumpyQuizzes(course: NumpyCourse): number {
  return allNumpyLessons(course).reduce((sum, l) => sum + l.lesson.quiz.length, 0);
}

/** Count of complete function reference cards in the course. */
export function countFunctionDocs(course: NumpyCourse): number {
  let n = 0;
  for (const part of course.parts) {
    for (const lesson of part.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind === "functionDoc") n++;
      }
    }
  }
  return n;
}

/** Count of embedded interactive visualizations. */
export function countVisualizations(course: NumpyCourse): number {
  let n = 0;
  for (const part of course.parts) {
    for (const lesson of part.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind === "arrayViz") n++;
      }
    }
  }
  return n;
}
