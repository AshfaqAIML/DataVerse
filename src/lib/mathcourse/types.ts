/**
 * Math course content model — the contract for "Mathematics for Data Science".
 *
 * Design goals (the pedagogy contract):
 *
 *   The course exists for students who are afraid of mathematics. Every
 *   lesson therefore MUST walk the same ten steps, in order, and the type
 *   system enforces that none of them is missing:
 *
 *     1. everydayAnalogy  — start from an everyday scene, then bridge it
 *     2. intuition        — explain the idea with zero mathematical jargon
 *     3. terminology      — now (and only now) introduce the proper words
 *     4. visuals          — show it: interactive graph / lab / figure
 *     5. derivation       — derive the formula step by step, no leaps
 *     6. examples         — solve concrete numerical examples
 *     7. programming      — do it in Python (output machine-verified)
 *     8. mlConnection     — where machine learning actually uses it
 *     9. exercises        — practice, tiered by difficulty
 *    10. solutions        — detailed worked solutions (inside exercises)
 *
 *   Prerequisites are first-class: every lesson declares the lessons it
 *   builds on, the verifier proves the graph is acyclic and forward-only,
 *   and the UI surfaces gaps. A student is never expected to meet calculus
 *   before the algebra it rests on — the diagnostic and the revision radar
 *   enforce the same order.
 *
 * No fake output: every Python `output` shown was produced by actually
 * running the code (scripts/verify-math-outputs.ts proves it).
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Interactive laboratory kinds (rendered by src/components/math/labs). */
export type LabKind =
  | "number-line" // place/order numbers, integer vs decimal zoom
  | "fraction-studio" // pie + reduced fraction + decimal + percent
  | "ratio-bars" // bar models for ratios and proportional scaling
  | "log-scale" // linear vs logarithmic number line, side by side
  | "tangent" // draggable point: secant -> tangent, f and f' side by side
  | "riemann" // rectangles under a curve, n slider, sum -> integral
  | "unit-circle" // draggable angle: sin/cos/tan live, degrees + radians
  | "vector-board" // drag vectors: head-to-tail addition, scaling, dot product
  | "matrix-lab" // editable matrix: transpose, determinant, inverse, multiply
  | "linear-system" // two lines with sliders, intersection / parallel / same line
  | "eigen" // 2x2 matrix transforms the plane; eigendirections highlighted
  | "gradient-descent" // bowl surface, learning-rate slider, animated descent
  | "sequence-terms" // sequence term plot: arithmetic, geometric, Fibonacci
  | "newton-step"; // Newton's method: tangent root-steps animated

/** One function curve plotted by the FunctionGraph component. */
export interface GraphCurve {
  /**
   * Expression in `x` (and the parameters declared in `params`), e.g.
   * "a * x**2 + b * x + c" or "sin(x)". Parsed by src/lib/mathcourse/expr.
   */
  expr: string;
  label: string;
  /** CSS color; defaults to the theme's violet ramp. */
  color?: string;
  dashed?: boolean;
}

/** A parameter slider attached to a graph. */
export interface GraphParam {
  name: string; // "a" | "b" | "c" | "d" | "k" ...
  label: string; // "a (curvature)"
  min: number;
  max: number;
  step: number;
  initial: number;
}

/** Interactive function plot spec (the workhorse visual). */
export interface GraphSpec {
  xMin: number;
  xMax: number;
  yMin?: number;
  yMax?: number;
  curves: GraphCurve[];
  params?: GraphParam[];
  /** Static marked points, e.g. the vertex or a hole. */
  points?: { x: number; y: number; label?: string }[];
  /** Vertical guide lines, e.g. an asymptote or a limit point. */
  vLines?: { x: number; label?: string; dashed?: boolean }[];
  caption?: string;
}

/** A static SVG figure built with src/lib/mathcourse/svgfig at author time. */
export interface FigureSpec {
  /** A complete `<svg …>…</svg>` document string (theme-aware). */
  svg: string;
  caption?: string;
  /** Alt text for accessibility. */
  alt: string;
}

/** Step 4 — the visual representations of a lesson (at least one). */
export type Visual =
  | { kind: "graph"; spec: GraphSpec }
  | { kind: "lab"; lab: LabKind; title?: string }
  | { kind: "figure"; spec: FigureSpec };

/** Step 3 — terminology: plain words first, formal words second. */
export interface TermDef {
  term: string;
  /** The symbol mathematicians write, e.g. "x²", "det(A)", "∇f". */
  symbol?: string;
  /** The same idea said with everyday words. */
  plain: string;
  /** The precise definition (short, honest, no circularity). */
  formal: string;
}

/** One step of a derivation: what we do, the line we write, what it yields. */
export interface DerivationStep {
  /** What this step does, in one friendly sentence. */
  do: string;
  /** The mathematical line written at this step (unicode math). */
  math: string;
  /** Optional short note on why this move is legal. */
  why?: string;
}

/** Step 5 — where the formula comes from. */
export interface Derivation {
  title: string;
  /** One or two sentences on what we are about to build. */
  intro: string;
  steps: DerivationStep[]; // 3-8 steps, each a small honest move
  /** The boxed conclusion of the derivation. */
  result: string;
}

/** One step of a worked example. */
export interface ExampleStep {
  do: string;
  math: string;
}

/** Step 6 — a fully worked numerical example. */
export interface WorkedExample {
  title: string;
  problem: string;
  steps: ExampleStep[]; // 2-6 steps
  answer: string;
  /** Optional machine-verified Python check of the same numbers. */
  check?: { code: string; output: string; note?: string };
}

/** Step 7 — the same idea done in Python. */
export interface ProgrammingApp {
  intro: string;
  /** Complete runnable program (CPython-verified output). */
  code: string;
  /** REAL output of running the code — never hand-written. */
  output: string;
  /** How to read the output, line by line where useful. */
  explanation: string[];
}

/** Step 8 — where machine learning uses this. */
export interface MlConnection {
  title: string;
  /** Concrete, honest ML use (2-4 paragraphs-worth of text). */
  body: string[];
  /** Named models/algorithms that lean on this idea, e.g. ["PCA", "PageRank"]. */
  usedBy: string[];
}

/** Step 9 + 10 — practice with a detailed worked solution. */
export interface MathExercise {
  /** "a-01-e1" style: unique across the course. */
  id: string;
  tier: Difficulty;
  title: string;
  /** The task, self-contained and precise. */
  prompt: string;
  hint?: string;
  /** Optional starter code for programming-flavoured exercises. */
  starter?: string;
  solution: {
    /** The plan, in words, before any symbols. */
    approach: string;
    steps: ExampleStep[];
    answer: string;
    /** Optional machine-verified Python check. */
    check?: { code: string; output: string };
  };
}

/** Lesson knowledge-check question (also feeds the revision radar). */
export interface MathQuizQuestion {
  id: string; // "a-01-q1"
  prompt: string;
  options: string[]; // 3-4, exactly one correct
  correctIndex: number;
  explanation: string;
}

/** Step 1 — the everyday analogy every lesson opens with. */
export interface Analogy {
  /** A concrete everyday scene (no math words at all). */
  scene: string;
  /** The sentence that bridges the scene to today's idea. */
  bridge: string;
}

/** A misconception a frightened learner actually holds. */
export interface Misconception {
  /** The myth, in the learner's own words. */
  myth: string;
  /** Why it feels true. */
  why: string;
  /** The correction. */
  reality: string;
}

/** THE lesson contract. Every field below is required and verified. */
export interface MathLesson {
  /** "${letter}-${nn}", e.g. "a-03". */
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  objectives: string[]; // 3-5
  /** Lesson slugs this one builds on. Forward-only, acyclic (verifier-enforced). */
  prerequisites: string[];

  analogy: Analogy; // 1. everyday analogy
  intuition: string[]; // 2. jargon-free explanation (2-4 paragraphs)
  terminology: TermDef[]; // 3. 3-6 terms
  visuals: Visual[]; // 4. 1-3 visual representations
  derivation: Derivation; // 5. step-by-step formula derivation
  examples: WorkedExample[]; // 6. 1-2 worked numerical examples
  programming: ProgrammingApp; // 7. Python application (verified output)
  mlConnection: MlConnection; // 8. machine-learning application
  exercises: MathExercise[]; // 9. 3 practice exercises, tiered
  quiz: MathQuizQuestion[]; // 3 knowledge-check questions

  misconceptions: Misconception[]; // 2-4 "common traps"
  takeaways: string[]; // 3-5 memorable sentences
}

/** Part-level assessment (the checkpoint after a part's lessons). */
export interface MathAssessment {
  questions: MathQuizQuestion[]; // 6 per part
}

/** Part-level workshop: a programming project that uses the part's math. */
export interface MathWorkshop {
  title: string;
  brief: string;
  requirements: string[]; // 4-6
  steps: string[]; // 4-6 guided steps
  starter: string;
  /** Reference solution (machine-verified output). */
  solution: string;
  expectedOutput: string;
  concepts: string[];
}

export interface MathPart {
  /** "A" .. "E". */
  letter: string;
  title: string;
  tagline: string;
  description: string;
  /** What you can do after this part (3-5 bullets, plain words). */
  outcomes: string[];
  lessons: MathLesson[];
  assessment: MathAssessment;
  workshop: MathWorkshop;
}

/** The prerequisite diagnostic that opens the course. */
export interface DiagnosticQuestion {
  id: string; // "diag-01"
  /** The part this question probes: "A" .. "E". */
  part: string;
  /** The lesson that teaches this question's idea — wrong answers send the
   *  learner here. Must exist and belong to `part`. */
  gates: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DiagnosticSpec {
  intro: string;
  /** 22-26 questions: 6 on A, 6 on B, 5 on C, 4 on D, 3 on E (pinned by the verifier). */
  questions: DiagnosticQuestion[];
}

export interface MathCourse {
  slug: "math";
  title: string;
  subtitle: string;
  description: string;
  parts: MathPart[];
  diagnostic: DiagnosticSpec;
}

// ---------------------------------------------------------------------------
// Navigation helpers (mirror the Python/SQL course contracts)
// ---------------------------------------------------------------------------

export interface MathLessonRef {
  part: MathPart;
  lesson: MathLesson;
  index: number;
}

export function findMathLesson(course: MathCourse, slug: string): MathLessonRef | null {
  for (const part of course.parts) {
    const index = part.lessons.findIndex((l) => l.slug === slug);
    if (index !== -1) return { part, lesson: part.lessons[index], index };
  }
  return null;
}

export function allMathLessons(course: MathCourse): MathLessonRef[] {
  const out: MathLessonRef[] = [];
  for (const part of course.parts) {
    part.lessons.forEach((lesson, index) => out.push({ part, lesson, index }));
  }
  return out;
}

export function neighborMathLesson(course: MathCourse, slug: string, dir: 1 | -1): MathLessonRef | null {
  const flat = allMathLessons(course);
  const at = flat.findIndex((l) => l.lesson.slug === slug);
  if (at === -1) return null;
  return flat[at + dir] ?? null;
}

export function countMathLessons(course: MathCourse): number {
  return allMathLessons(course).length;
}

export function mathCourseMinutes(course: MathCourse): number {
  return allMathLessons(course).reduce((n, l) => n + l.lesson.minutes, 0);
}

/** Global order of a lesson slug (parts in order, lessons in order). */
export function lessonOrderIndex(course: MathCourse, slug: string): number {
  return allMathLessons(course).findIndex((l) => l.lesson.slug === slug);
}

/** All lessons a slug transitively depends on (its ancestor set). */
export function prerequisiteClosure(course: MathCourse, slug: string): Set<string> {
  const bySlug = new Map(allMathLessons(course).map((l) => [l.lesson.slug, l.lesson]));
  const seen = new Set<string>();
  const stack = [...(bySlug.get(slug)?.prerequisites ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const lesson = bySlug.get(cur);
    if (lesson) stack.push(...lesson.prerequisites);
  }
  return seen;
}
