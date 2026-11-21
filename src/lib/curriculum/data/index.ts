/**
 * Curriculum registry — the assembly point of the whole academy.
 *
 * THE REGISTRY RULE: adding subjects or lessons means adding DATA here —
 * a new subject is an entry in a school file, a new school is one file in
 * data/schools/ plus one line below. No application code changes anywhere.
 *
 * Everything downstream (engine, graph, academy UI, placement, roadmaps,
 * search) is generic over this registry.
 *
 * Quality gates:
 *   - scripts/verify-school.ts <letter>  — per-school authoring gate
 *   - scripts/verify-registry.ts         — the full-registry gate:
 *     validateRegistry (no empty shells, DAG integrity, roadmap invariants)
 *     + placement bank coverage for every subject.
 */
import { buildGraph, waveLayering } from "../graph";
import { CurriculumEngine } from "../engine";
import {
  subjectAssessments,
  subjectExercises,
  subjectHours,
  subjectLessons,
} from "../validate";
import type {
  CurriculumManifest,
  CurriculumRegistry,
  PlacementBank,
  SchoolCode,
  SubjectDef,
} from "../types";
import { SCHOOLS } from "./schools";
import { schoolA } from "./schools/a-programming";
import { schoolB } from "./schools/b-mathematics";
import { schoolC } from "./schools/c-statistics";
import { schoolD } from "./schools/d-data-analysis";
import { schoolE } from "./schools/e-python-libraries";
import { schoolF } from "./schools/f-machine-learning";
import { schoolG } from "./schools/g-deep-learning-ai";
import { schoolH } from "./schools/h-visualization-bi";
import { schoolI } from "./schools/i-career-development";
import { schoolJ } from "./schools/j-classical-ai";
import { schoolAPlacement } from "./placement/a-programming";
import { schoolBPlacement } from "./placement/b-mathematics";
import { schoolCPlacement } from "./placement/c-statistics";
import { schoolDPlacement } from "./placement/d-data-analysis";
import { schoolEPlacement } from "./placement/e-python-libraries";
import { schoolFPlacement } from "./placement/f-machine-learning";
import { schoolGPlacement } from "./placement/g-deep-learning-ai";
import { schoolHPlacement } from "./placement/h-visualization-bi";
import { schoolIPlacement } from "./placement/i-career-development";
import { schoolJPlacement } from "./placement/j-classical-ai";
import { DATA_SCIENTIST_ROADMAP } from "./roadmaps";

export { SCHOOLS };

// ---------------------------------------------------------------- subjects

/** All 83 subjects, in deterministic school/code order. */
export const availableSubjects: SubjectDef[] = [
  ...schoolA,
  ...schoolB,
  ...schoolC,
  ...schoolD,
  ...schoolE,
  ...schoolF,
  ...schoolG,
  ...schoolH,
  ...schoolI,
  ...schoolJ,
];

export function subjectBySlug(slug: string): SubjectDef | null {
  return availableSubjects.find((s) => s.slug === slug) ?? null;
}

// --------------------------------------------------------------- placement

/** Every authored placement bank, keyed by subject slug. */
export const PLACEMENT_BANKS: PlacementBank = {
  ...schoolAPlacement,
  ...schoolBPlacement,
  ...schoolCPlacement,
  ...schoolDPlacement,
  ...schoolEPlacement,
  ...schoolFPlacement,
  ...schoolGPlacement,
  ...schoolHPlacement,
  ...schoolIPlacement,
  ...schoolJPlacement,
};

// ----------------------------------------------------------------- manifest

const bySchool: Record<SchoolCode, { subjects: number; lessons: number; hours: number }> = {
  A: { subjects: 0, lessons: 0, hours: 0 },
  B: { subjects: 0, lessons: 0, hours: 0 },
  C: { subjects: 0, lessons: 0, hours: 0 },
  D: { subjects: 0, lessons: 0, hours: 0 },
  E: { subjects: 0, lessons: 0, hours: 0 },
  F: { subjects: 0, lessons: 0, hours: 0 },
  G: { subjects: 0, lessons: 0, hours: 0 },
  H: { subjects: 0, lessons: 0, hours: 0 },
  I: { subjects: 0, lessons: 0, hours: 0 },
  J: { subjects: 0, lessons: 0, hours: 0 },
};

let modules = 0;
let chapters = 0;
let lessons = 0;
let exercises = 0;
let assessments = 0;
let projects = 0;
let totalHours = 0;
let placementEligible = 0;

for (const s of availableSubjects) {
  modules += s.modules.length;
  for (const m of s.modules) {
    chapters += m.chapters.length;
    for (const c of m.chapters) lessons += c.lessons.length;
  }
  exercises += subjectExercises(s);
  assessments += subjectAssessments(s);
  projects += s.projects.length;
  const hours = subjectHours(s);
  totalHours += hours;
  if (s.placementEligible) placementEligible += 1;
  const bucket = bySchool[s.school];
  bucket.subjects += 1;
  bucket.lessons += subjectLessons(s);
  bucket.hours += hours;
}

const manifest: CurriculumManifest = {
  subjects: availableSubjects.length,
  modules,
  chapters,
  lessons,
  exercises,
  assessments,
  projects,
  totalHours: Math.round(totalHours * 2) / 2,
  placementEligible,
  bySchool,
};

// ---------------------------------------------------------------- roadmaps

/**
 * "Full Academy" — every subject, staged by dependency depth: each wave
 * contains every subject whose prerequisites are fully covered by earlier
 * waves. Generated from the graph, so it stays complete automatically.
 */
function fullAcademyRoadmap(): CurriculumRegistry["roadmaps"][number] {
  const graph = buildGraph(availableSubjects);
  const waves = waveLayering(graph);
  const waveTitles = [
    "Entry Points",
    "First Steps",
    "Building the Core",
    "Going Deeper",
    "Specializing",
    "Advanced Work",
    "Expert Territory",
    "The Frontier",
  ];
  const stages = waves.map((subjects, i) => ({
    title: waveTitles[i] ?? `Depth ${i + 1}`,
    focus:
      i === 0
        ? "Subjects with no prerequisites — anyone can start here"
        : "Subjects whose prerequisites are fully covered by earlier waves",
    subjects,
  }));
  return {
    slug: "full-academy",
    title: "The Full Academy Tour",
    audience: "Learners who want every subject, in an order that never breaks dependencies",
    description:
      "Every subject in DataVerse Academy, automatically staged by the prerequisite graph: each wave unlocks exactly when the wave below it is mastered. Generated from the registry — it grows as new subjects are added.",
    outcomes: [
      "Complete coverage of all nine schools with no dependency violations",
      "A self-paced master plan that adapts when the registry grows",
    ],
    stages,
  };
}

export const ROADMAPS = [DATA_SCIENTIST_ROADMAP, fullAcademyRoadmap()];

// ---------------------------------------------------------------- registry

/**
 * The complete curriculum registry — the single source of truth for the
 * engine, the API surface and the academy UI.
 */
export const REGISTRY: CurriculumRegistry = {
  version: 1,
  contentVersion: "2026.11",
  schools: SCHOOLS,
  subjects: availableSubjects,
  roadmaps: ROADMAPS,
  manifest,
};

/** A ready-to-use engine over the full registry. */
export const curriculum = new CurriculumEngine(REGISTRY);

// --------------------------------------------------- legacy lesson helpers

/** One flattened registry lesson, positioned within its subject. */
export interface RegistryLessonRef {
  subject: string;
  moduleIndex: number; // 1-based
  chapterIndex: number; // 1-based, within module
  lessonIndex: number; // 1-based, within chapter
  title: string;
  minutes: number;
  concepts: string[];
  summary: string;
  /** Curated exercises declared by the registry for this lesson. */
  exercises: number;
}

export function registryLessonsFor(subject: SubjectDef): RegistryLessonRef[] {
  const out: RegistryLessonRef[] = [];
  subject.modules.forEach((m, mi) =>
    m.chapters.forEach((c, ci) =>
      c.lessons.forEach((l, li) => {
        out.push({
          subject: subject.slug,
          moduleIndex: mi + 1,
          chapterIndex: ci + 1,
          lessonIndex: li + 1,
          title: l.title,
          minutes: l.minutes,
          concepts: l.concepts,
          summary: l.summary,
          exercises: l.exercises,
        });
      })
    )
  );
  return out;
}

export function findRegistryLesson(
  subjectSlug: string,
  moduleIndex: number,
  chapterIndex: number,
  lessonIndex: number
): RegistryLessonRef | null {
  const subject = subjectBySlug(subjectSlug);
  if (!subject) return null;
  return (
    registryLessonsFor(subject).find(
      (r) => r.moduleIndex === moduleIndex && r.chapterIndex === chapterIndex && r.lessonIndex === lessonIndex
    ) ?? null
  );
}

/** Lesson ref string: "<subject>/m<M>/c<C>/<I>". */
export function lessonRef(r: RegistryLessonRef): string {
  return `${r.subject}/m${r.moduleIndex}/c${r.chapterIndex}/${r.lessonIndex}`;
}
