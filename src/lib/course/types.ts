/**
 * Course content model — the contract for every authored course.
 *
 * Design goals (DataVerse Academy content standards):
 *   1. CONTENT QUALITY — the model makes shallow lessons impossible:
 *      every lesson carries objectives, motivation, explanation blocks,
 *      runnable code with REAL outputs, terminology, common mistakes,
 *      key takeaways and a knowledge check.
 *   2. Progressive disclosure — author blocks in the order
 *      everyday intuition -> conceptual explanation -> deeper details.
 *   3. No fake output — every `code` block carries the output produced by
 *      actually running it (scripts/verify-python-outputs.ts proves it).
 *   4. Practice everywhere — lessons embed "try it" playgrounds, parts add
 *      tiered exercises, a chapter assessment and a mini project.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** What kind of lesson this is — drives validation strictness. */
export type LessonKind = "concept" | "coding" | "setup";

/**
 * python: executed and output-verified (or expectError-verified).
 * repl:   a REPL transcript (">>> " prompts); statements are executed and
 *         their echoed results verified by the verifier.
 * bash:   terminal session, shown as-is (not executed).
 * text:   non-executable illustration.
 */
export type CodeLanguage = "python" | "repl" | "bash" | "text";

/**
 * Inline text supports a tiny subset of markdown:
 * `code`, **bold**, *italic*.
 */
export type Block =
  | { kind: "text"; text: string }
  | { kind: "heading"; text: string }
  | {
      kind: "code";
      /** Short label shown above the block, e.g. "Checking your install". */
      title?: string;
      code: string;
      /** REAL output of running the code (verified by script). */
      output?: string;
      /** One line explaining where this output comes from / how to read it. */
      outputNote?: string;
      /** "Output explanation": bullets walking through what happened. */
      explain?: string[];
      lang?: CodeLanguage;
      /**
       * For error-teaching blocks: the code deliberately crashes. Value is the
       * exact final error line, e.g. "NameError: name 'x' is not defined".
       * The verifier runs the code and checks stderr contains this.
       */
      expectError?: string;
    }
  | {
      kind: "tryIt";
      title: string;
      /** What the learner should try/change in the embedded editor. */
      task?: string;
      /** Complete, runnable starter code (must execute without error). */
      code: string;
      hint?: string;
      /** true for debugging exercises: the starter raises an error on purpose. */
      expectError?: boolean;
    }
  | { kind: "visual"; title: string; ascii: string; caption?: string }
  | { kind: "table"; title?: string; headers: string[]; rows: string[][]; caption?: string }
  | { kind: "callout"; tone: "tip" | "warning" | "info" | "analogy"; title?: string; text: string }
  | { kind: "steps"; title?: string; items: string[] };

export interface TermEntry {
  term: string;
  definition: string;
}

export interface MistakeEntry {
  /** The mistake, as a beginner would make it. */
  mistake: string;
  /** Why Python reacts the way it does. */
  why: string;
  /** The fix. */
  fix: string;
}

export interface QuizOption {
  text: string;
  correct: boolean;
  /** Why this option is right or wrong — shown after answering. */
  feedback: string;
}

export interface QuizQuestion {
  /** Unique within the part, e.g. "a-01-q1" / "a-as-3". */
  id: string;
  prompt: string;
  /** 3-4 options, exactly one correct. */
  options: QuizOption[];
  /** The takeaway after answering, regardless of choice. */
  explanation: string;
}

export interface Lesson {
  /** "${letter}-${nn}" e.g. "a-01". */
  slug: string;
  title: string;
  minutes: number;
  /** 1-2 sentence summary for lesson lists. */
  summary: string;
  kind: LessonKind;
  /** 3-5 things the learner will be able to DO afterwards. */
  objectives: string[];
  /** Why this topic matters — concrete motivation, >= 200 characters. */
  why: string;
  /** Teaching content; author in progressive-disclosure order. */
  blocks: Block[];
  /** 3-5 new terms introduced in this lesson. */
  terms: TermEntry[];
  /** 2-4 common beginner mistakes with the fix. */
  mistakes: MistakeEntry[];
  /** 3-5 memorable sentences to keep. */
  takeaways: string[];
  /** 2-3 knowledge-check questions. */
  quiz: QuizQuestion[];
}

export interface Exercise {
  /** "${letter}-${tier initial}${n}" e.g. "a-b1", "a-i2", "a-a3". */
  id: string;
  tier: Difficulty;
  title: string;
  /** The task statement — precise, self-contained, >= 120 characters. */
  prompt: string;
  hint?: string;
  /** Starter code placed in the editor. */
  starter?: string;
  /** Worked solution (revealed on request after an attempt). */
  solution?: string;
  /** If the starter deliberately crashes: the expected error line. */
  starterExpectError?: string;
  /**
   * Expected stdout for auto-grading (normalized comparison). When present
   * the exercise gets a "Check" button that runs the learner's code in the
   * browser playground and compares output.
   */
  expectedOutput?: string;
  /** Concepts practiced — shown as badges. */
  concepts: string[];
}

export interface MiniProject {
  title: string;
  /** What the learner builds and why it matters, >= 200 characters. */
  brief: string;
  /** 5-8 concrete requirements the finished program must meet. */
  requirements: string[];
  /** 5-8 guided steps from empty file to finished program. */
  steps: string[];
  /** Starter code with TODO markers. */
  starter: string;
  /** Concepts applied. */
  concepts: string[];
  /** Optional stretch goal. */
  extension?: string;
}

export interface Part {
  /** "A" .. "J". */
  letter: string;
  title: string;
  tagline: string;
  description: string;
  lessons: Lesson[];
  exercises: Exercise[];
  assessment: QuizQuestion[];
  project: MiniProject;
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  audience: string;
  parts: Part[];
}

/** A located lesson: which part it lives in + position. */
export interface LessonRef {
  part: Part;
  lesson: Lesson;
  index: number;
}

export function findLesson(course: Course, slug: string): LessonRef | null {
  for (const part of course.parts) {
    const index = part.lessons.findIndex((l) => l.slug === slug);
    if (index !== -1) return { part, lesson: part.lessons[index], index };
  }
  return null;
}

export function partOfLesson(course: Course, slug: string): Part | null {
  return findLesson(course, slug)?.part ?? null;
}

/** Ordered walk over every lesson in the course. */
export function allLessons(course: Course): LessonRef[] {
  const out: LessonRef[] = [];
  for (const part of course.parts) {
    part.lessons.forEach((lesson, index) => out.push({ part, lesson, index }));
  }
  return out;
}

/** Next/previous lesson across part boundaries. */
export function neighborLesson(course: Course, slug: string, dir: 1 | -1): LessonRef | null {
  const flat = allLessons(course);
  const at = flat.findIndex((l) => l.lesson.slug === slug);
  if (at === -1) return null;
  return flat[at + dir] ?? null;
}

export function totalMinutes(course: Course): number {
  return allLessons(course).reduce((sum, l) => sum + l.lesson.minutes, 0);
}

export function countLessons(course: Course): number {
  return allLessons(course).length;
}

export function countExercises(course: Course): number {
  return course.parts.reduce((sum, p) => sum + p.exercises.length, 0);
}

export function countAssessmentQuestions(course: Course): number {
  return course.parts.reduce((sum, p) => sum + p.assessment.length, 0);
}

export function countQuizzes(course: Course): number {
  return allLessons(course).reduce((sum, l) => sum + l.lesson.quiz.length, 0);
}
