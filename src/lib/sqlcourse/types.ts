/**
 * SQL & PostgreSQL course content model — the contract for all authored parts.
 *
 * Design goals (DataVerse Academy content standards, same discipline as the
 * Python course):
 *   1. DATABASES BEFORE SYNTAX — Part A teaches what data, databases,
 *      tables, keys and relationships ARE (with pictures) before any SQL.
 *   2. NO FAKE OUTPUT — every `sql` block carries the result produced by
 *      actually executing it against the named sample database (PGlite, real
 *      PostgreSQL 18 in WASM). scripts/verify-sql-outputs.ts proves it.
 *   3. Progressive disclosure — blocks go intuition -> concept -> mechanics
 *      -> practice. Every lesson has objectives, motivation ("why"), real
 *      outputs with explanations, terminology, common mistakes, takeaways
 *      and a knowledge check.
 *   4. Practice everywhere — lessons embed interactive Lab blocks (real SQL,
 *      real results), parts add 12 tiered exercises auto-validated against
 *      the reference solution, an 8-question assessment and a mini project.
 *   5. Real-world grounding — six realistic sample databases (e-commerce,
 *      hospital, university, banking, retail, HR) and a case-study track.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** What kind of lesson this is — drives validation strictness. */
export type LessonKind = "concept" | "coding" | "setup";

/** The six realistic sample databases every query runs against. */
export type DatasetId = "ecommerce" | "hospital" | "university" | "banking" | "retail" | "hr";

/**
 * Development scaffold flag: a part file may be a stub while the course
 * is being authored. The verifier FAILS on stubs unless --allow-stubs is
 * passed, and the UI renders stub parts as "coming soon". A stub must
 * NEVER ship in a final delivery.
 */
export interface Part {
  /** "A" .. "J". */
  letter: string;
  title: string;
  tagline: string;
  description: string;
  /** true while this part is still being authored (dev scaffold). */
  stub?: boolean;
  lessons: Lesson[];
  exercises: SqlExercise[];
  assessment: QuizQuestion[];
  project: MiniProject;
}

/**
 * sql:  executed by the verifier against the lesson's dataset (or a fresh
 *       empty schema when no dataset is given). Result must match exactly.
 * psql: a terminal session transcript (shown as-is, not executed).
 * text: non-executable illustration.
 */
export type SqlLanguage = "sql" | "psql" | "text";

/** A single cell of a verified result, already canonicalised to text. */
export type SqlCell = string | null;

/** The verified result of one executed SQL block. */
export interface SqlResult {
  /** Output column names, in order. Empty for pure command results. */
  columns: string[];
  /** Rows of canonical text cells (dates ISO-truncated, NULL stays null). */
  rows: SqlCell[][];
  /** PostgreSQL command tag, e.g. "CREATE", "INSERT", "UPDATE", "SELECT". */
  command?: string;
  /**
   * Render note for the UI, e.g. how long the query took or where the
   * output comes from. Optional.
   */
  note?: string;
}

/** Execution-shape of a block used by the verifier/UI. */
export interface ExpectShape {
  columns: string[];
  rows: SqlCell[][];
  /** true when the block is a pure command (no rows): result omitted then. */
  command?: string;
}

/**
 * Inline text supports a tiny subset of markdown:
 * `code`, **bold**, *italic*.
 */
export type Block =
  | { kind: "text"; text: string }
  | { kind: "heading"; text: string }
  | {
      /** Executed SQL with a machine-verified result. */
      kind: "sql";
      /** Short label shown above the block, e.g. "Listing the tables". */
      title?: string;
      /** Which sample database this runs against; omit for a fresh empty schema. */
      dataset?: DatasetId;
      /** The SQL shown and executed. */
      code: string;
      /** The REAL result (verified by script). Present unless expectError. */
      result?: SqlResult;
      /** "Output explanation": bullets walking through what happened. */
      explain?: string[];
      /**
       * For error-teaching blocks: the code deliberately fails. Value is the
       * exact final error line, e.g. `ERROR:  column "nope" does not exist`.
       */
      expectError?: string;
      /** psql/text languages render code only (not executed). */
      lang?: SqlLanguage;
    }
  | {
      /** Interactive mini SQL editor right inside the lesson. */
      kind: "lab";
      title: string;
      /** What the learner should try / change. */
      task?: string;
      /** Complete, runnable starter SQL (executes cleanly on the dataset). */
      code: string;
      /** Sample database the mini-lab is connected to. */
      dataset?: DatasetId;
      hint?: string;
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
  /** Why PostgreSQL reacts the way it does. */
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
  /** Unique within the part, e.g. "c-03-q1" / "c-as-3". */
  id: string;
  prompt: string;
  /** 3-4 options, exactly one correct. */
  options: QuizOption[];
  /** The takeaway after answering, regardless of choice. */
  explanation: string;
}

export interface Lesson {
  /** "${letter}-${nn}" e.g. "a-01", "j-08". */
  slug: string;
  title: string;
  minutes: number;
  /** 1-2 sentence summary for lesson lists. */
  summary: string;
  kind: LessonKind;
  /** Default sample database for the lesson's sql/lab blocks. */
  dataset?: DatasetId;
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

/** One answer option of a concept-mode exercise (quiz-style grading). */
export interface ConceptChoice {
  text: string;
  correct: boolean;
  /** Why this option is right or wrong — shown after answering. */
  feedback: string;
}

/** An exercise that is auto-validated against a reference solution. */
export interface SqlExercise {
  /** "${letter}-${tier initial}${n}" e.g. "c-b1", "g-a4". */
  id: string;
  tier: Difficulty;
  /**
   * "sql": the learner writes SQL, auto-graded against the reference
   *        solution (Parts B-J default).
   * "concept": the learner inspects sample tables / schema and answers a
   *        multiple-choice question — auto-graded on selection. Used by
   *        Part A, which teaches databases before SQL syntax.
   */
  mode: "sql" | "concept";
  title: string;
  /** The problem statement — precise, self-contained, >= 200 characters.
   *  SQL-mode prompts MUST state the expected column names and order. */
  prompt: string;
  /** Sample database the exercise runs on (or inspects). */
  dataset: DatasetId;
  /** Tables from the dataset shown as context (schema + preview). */
  sampleTables: string[];
  /** Nudge without giving the answer away. */
  hint?: string;
  /** Starter SQL placed in the editor (sql mode). */
  starter?: string;
  /** Reference solution — executed by the verifier against a fresh copy
   *  (required in sql mode). */
  solution?: string;
  /** true when the grader compares row order strictly (sql mode). */
  ordered?: boolean;
  /** The expected result of the SOLUTION (required in sql mode). */
  expected?: ExpectShape;
  /** Explanation of the solution / correct answer — how it works, step by
   *  step. Required in both modes. */
  explanation: string;
  /** Concepts practiced — shown as badges. */
  concepts: string[];
  /** The answer options (required in concept mode). 3-4, one correct. */
  choices?: ConceptChoice[];
}

export interface MiniProject {
  title: string;
  /** What the learner builds and why it matters, >= 200 characters. */
  brief: string;
  /** 5-8 concrete requirements the finished SQL must meet. */
  requirements: string[];
  /** 5-8 guided steps from empty editor to finished queries. */
  steps: string[];
  /** Starter SQL with TODO markers. */
  starter: string;
  /** Concepts applied. */
  concepts: string[];
  /** Optional stretch goal. */
  extension?: string;
}

export interface SqlCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  audience: string;
  parts: Part[];
}

/* ------------------------------------------------------------------ */
/* Case studies — real-world SQL, one per sample database.            */
/* ------------------------------------------------------------------ */

export interface CaseQuestion {
  /** "${caseId}-q${n}" e.g. "ecommerce-q1". */
  id: string;
  title: string;
  /** The business question, with any precise output requirements. */
  problem: string;
  hint?: string;
  starter?: string;
  /** Reference solution — verified against a fresh dataset copy. */
  solution: string;
  ordered: boolean;
  expected: ExpectShape;
  /** Explanation of the solution — how a professional would reason. */
  explanation: string;
}

export interface CaseStudy {
  /** Matches a DatasetId — the case study runs on that database. */
  id: DatasetId;
  title: string;
  /** Short domain label, e.g. "E-commerce analytics". */
  domain: string;
  /** Who you are in this case study and what the business needs. */
  scenario: string;
  /** Business rules and dataset quirks worth knowing before querying. */
  context: string[];
  /** 3-5 progressive questions, easiest first. */
  questions: CaseQuestion[];
  /** What this case teaches beyond syntax. */
  takeaways: string[];
}

/* ------------------------------------------------------------------ */
/* Navigation helpers (mirrors the Python course model).              */
/* ------------------------------------------------------------------ */

export interface LessonRef {
  part: Part;
  lesson: Lesson;
  index: number;
}

export function findLesson(course: SqlCourse, slug: string): LessonRef | null {
  for (const part of course.parts) {
    const index = part.lessons.findIndex((l) => l.slug === slug);
    if (index !== -1) return { part, lesson: part.lessons[index], index };
  }
  return null;
}

export function partOfLesson(course: SqlCourse, slug: string): Part | null {
  return findLesson(course, slug)?.part ?? null;
}

export function allLessons(course: SqlCourse): LessonRef[] {
  const out: LessonRef[] = [];
  for ( const part of course.parts) {
    part.lessons.forEach((lesson, index) => out.push({ part, lesson, index }));
  }
  return out;
}

export function neighborLesson(course: SqlCourse, slug: string, dir: 1 | -1): LessonRef | null {
  const flat = allLessons(course);
  const at = flat.findIndex((l) => l.lesson.slug === slug);
  if (at === -1) return null;
  return flat[at + dir] ?? null;
}

export function totalMinutes(course: SqlCourse): number {
  return allLessons(course).reduce((sum, l) => sum + l.lesson.minutes, 0);
}

export function countLessons(course: SqlCourse): number {
  return allLessons(course).length;
}

export function countExercises(course: SqlCourse): number {
  return course.parts.reduce((sum, p) => sum + p.exercises.length, 0);
}

export function countAssessmentQuestions(course: SqlCourse): number {
  return course.parts.reduce((sum, p) => sum + p.assessment.length, 0);
}

export function countQuizzes(course: SqlCourse): number {
  return allLessons(course).reduce((sum, l) => sum + l.lesson.quiz.length, 0);
}

export function countCaseQuestions(cases: CaseStudy[]): number {
  return cases.reduce((sum, c) => sum + c.questions.length, 0);
}
