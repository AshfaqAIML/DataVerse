/**
 * Curriculum registry types — the data contract of DataVerse Academy.
 *
 * The registry is the single source of truth for curriculum STRUCTURE:
 * schools, subjects (courses), modules, chapters, lessons, assessments,
 * projects, prerequisite dependencies and staged roadmaps.
 *
 * It is pure data: adding subjects or lessons means adding data entries
 * (src/lib/curriculum/data/**) — no application code changes. The engine,
 * services and API routes are generic over this registry.
 *
 * Projection into the database (seed):
 *   School       -> Subject row          (9 schools A–I)
 *   SubjectDef   -> Course row           (77 subjects)
 *   ModuleDef    -> Module row
 *   ChapterDef   -> Chapter row
 *   LessonDef    -> Lesson row (DRAFT — content pipeline fills sections)
 *   ProjectDef   -> Project row
 *   prerequisites-> CoursePrerequisite rows
 *   RoadmapDef   -> LearningPath + LearningPathCourse rows (staged)
 */

export type SchoolCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

/** Maps to Course.level in the database. */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Curriculum track — used for filtering and roadmap balance. */
export type Track = "foundation" | "core" | "specialization" | "career";

export type LessonType =
  | "concept"
  | "code"
  | "worked-example"
  | "guided-practice"
  | "reading"
  | "review";

export type ExerciseKind =
  | "concept-check"
  | "multiple-choice"
  | "fill-in"
  | "parsons"
  | "predict-output"
  | "write-code"
  | "debug"
  | "calculation"
  | "derive"
  | "interpret-results"
  | "dataset-task"
  | "case-analysis"
  | "mock-interview"
  | "design-review";

export type ProjectTier = "guided" | "independent" | "capstone";

export interface CurriculumSchool {
  code: SchoolCode;
  slug: string; // DB Subject.slug
  name: string;
  tagline: string;
  description: string;
  /** Identity color — a theme-aware categorical token reference (`var(--dv-viz-N)`); never a raw hex. */
  color: string;
  icon: string; // lucide icon name
}

export interface LessonDef {
  title: string;
  minutes: number;
  type: LessonType;
  /** One-sentence promise of the lesson. */
  summary: string;
  /** Key terms introduced — glossary seeds and search hooks. */
  concepts: string[];
  /** Embedded practice check-ins inside the lesson. */
  exercises: number;
}

export interface ChapterDef {
  title: string;
  /** What this chapter builds, in one line. */
  focus: string;
  lessons: LessonDef[];
  /** Chapter practice-set size; defaults to sum(lesson exercises) + 2. */
  exerciseCount?: number;
}

export interface ModuleDef {
  title: string;
  summary: string;
  /** 2–4 measurable module outcomes. */
  outcomes: string[];
  /** Practice mix for the module's exercise sets. */
  exerciseKinds: ExerciseKind[];
  chapters: ChapterDef[];
  /** End-of-module checkpoint quiz. */
  checkpoint: { minutes: number; questions: number; passingScore: number };
}

export interface FinalExamDef {
  title: string;
  minutes: number;
  questions: number;
  passingScore: number;
}

export interface ProjectDef {
  title: string;
  brief: string;
  hours: number;
  tier: ProjectTier;
  deliverables: string[];
  /** Rubric criteria reviewers score against. */
  rubric: string[];
  tools: string[];
}

export interface SubjectDef {
  /** Stable identifier — becomes Course.slug in the database. */
  slug: string;
  school: SchoolCode;
  /** Human code, e.g. "A1", "F5" — display + deterministic ordering. */
  code: string;
  title: string;
  blurb: string;
  difficulty: Difficulty;
  track: Track;
  /** Hard gates — every one must be mastered before starting. */
  prerequisites: string[];
  /** Recommended preparation — surfaced but never blocking. */
  softPrerequisites: string[];
  /** Learning objectives for the whole subject. */
  objectives: string[];
  /** Measurable "a learner can ..." statements. */
  outcomes: string[];
  modules: ModuleDef[];
  finalExam: FinalExamDef;
  projects: ProjectDef[];
  /** Whether a placement test can be authored for this subject. */
  placementEligible: boolean;
  keywords: string[];
}

export interface RoadmapStageDef {
  title: string;
  focus: string;
  subjects: string[]; // subject slugs, in teaching order
}

export interface RoadmapDef {
  slug: string;
  title: string;
  audience: string;
  description: string;
  outcomes: string[];
  stages: RoadmapStageDef[];
}

export interface SchoolStats {
  subjects: number;
  lessons: number;
  hours: number;
}

export interface CurriculumManifest {
  subjects: number;
  modules: number;
  chapters: number;
  lessons: number;
  exercises: number;
  assessments: number;
  projects: number;
  totalHours: number;
  placementEligible: number;
  bySchool: Record<SchoolCode, SchoolStats>;
}

export interface CurriculumRegistry {
  version: number; // registry contract version
  contentVersion: string; // curriculum content release
  schools: CurriculumSchool[];
  subjects: SubjectDef[];
  roadmaps: RoadmapDef[];
  manifest: CurriculumManifest;
}

// ------------------------------------------------------------------
// Student state (assembled from DB progress by the curriculum service)
// ------------------------------------------------------------------

export interface SubjectProgressState {
  lessonsCompleted: number;
  lessonsTotal: number;
  /** epoch ms of last activity — drives "return to where you left off". */
  lastAccessedAt?: number;
  completedAt?: number | null;
}

export interface StudentState {
  /** Keyed by subject slug. */
  progress: Record<string, SubjectProgressState>;
  /** Best placement-test score per subject slug (0–100). */
  placement: Record<string, number>;
  /** Manually waived subjects (admin credit, transfers). */
  waived: string[];
}

export const EMPTY_STUDENT_STATE: StudentState = { progress: {}, placement: {}, waived: [] };

// ------------------------------------------------------------------
// Placement tests — "test your existing knowledge" question banks
// ------------------------------------------------------------------

/** One multiple-choice question of a subject's placement test. */
export interface PlacementQuestion {
  /** Unique within the subject bank, e.g. "python-p1". */
  id: string;
  prompt: string;
  /** 3-5 answer options; exactly the one at `answer` is correct. */
  options: string[];
  /** 0-based index of the correct option. */
  answer: number;
  /** Shown after the question is answered. */
  explanation: string;
}

/** Placement bank: subject slug -> its questions (one bank per subject). */
export type PlacementBank = Record<string, PlacementQuestion[]>;

// ------------------------------------------------------------------
// Placement rules (documented in CURRICULUM_REGISTRY.md)
// ------------------------------------------------------------------

export const PLACEMENT_MASTERY_SCORE = 90; // >= 90 → subject waived, dependents unlock
export const PLACEMENT_ACCELERATED_SCORE = 75; // 75–89 → advanced standing, start at module 2
export const EXAM_PASS_SCORE = 80; // checkpoint/final-exam pass threshold
