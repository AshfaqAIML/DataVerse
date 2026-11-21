/**
 * CurriculumEngine — the learning-path engine.
 *
 * Pure, dependency-free planning logic over the registry:
 *
 *   - dependency queries (closures, dependents, deterministic order)
 *   - readiness: a subject is startable when every hard prerequisite is
 *     mastered (completed) or waived (placement >= 90 / transfer credit)
 *   - personalized path to any goal subject (skips what is already mastered)
 *   - placement planning: which tests to take, most-advanced first, with
 *     supersede chains (passing a subject subsumes its prerequisites)
 *   - placement application: waived / accelerated (start at module 2) /
 *     standard study outcomes per subject
 *   - roadmap planning: staged plans with hours and week estimates
 *   - next actions: resume where you left off, or the next best start
 *   - search / filter / sort / paginate the catalog
 *
 * All student state comes in as plain data (StudentState) — the curriculum
 * service assembles it from the database. No I/O here.
 */
import {
  buildGraph,
  dependentClosure,
  prerequisiteClosure,
  subjectSortKey,
  type DependencyGraph,
} from "./graph";
import {
  EMPTY_STUDENT_STATE,
  PLACEMENT_ACCELERATED_SCORE,
  PLACEMENT_MASTERY_SCORE,
  type CurriculumManifest,
  type CurriculumRegistry,
  type Difficulty,
  type PlacementBank,
  type RoadmapDef,
  type SchoolCode,
  type StudentState,
  type SubjectDef,
  type Track,
} from "./types";
import { subjectAssessments, subjectExercises, subjectHours, subjectLessons } from "./validate";

export type PlacementOutcomeKind = "mastered" | "accelerated" | "standard";

export interface PathStep {
  slug: string;
  code: string;
  title: string;
  hours: number;
  reason: "goal" | "prerequisite";
  ready: boolean; // ready to start right now (given the state)
}

export interface PathPlan {
  goal: string;
  steps: PathStep[];
  totalHours: number;
}

export interface PlacementTest {
  slug: string;
  code: string;
  title: string;
  order: number;
  minutes: number;
  questions: number;
  /** Subjects subsumed when this test is passed at the mastery threshold. */
  supersedeOnPass: string[];
  status: "recommended" | "waived" | "superseded";
}

export interface PlacementPlan {
  goal: string;
  tests: PlacementTest[];
  /** Closure subjects without an authored placement test — study instead. */
  study: string[];
  totalHoursIfStudied: number;
}

export interface PlacementResult {
  waived: string[];
  /** Subjects to start from module 2 (75–89 score). */
  accelerated: string[];
  /** Subjects to study from the beginning. */
  standard: string[];
  skippedBySupersede: string[];
}

export interface RoadmapSubjectPlan {
  slug: string;
  code: string;
  title: string;
  hours: number;
  status: "mastered" | "in-progress" | "ready" | "locked";
  unmetPrerequisites: string[];
}

export interface RoadmapStagePlan {
  index: number;
  title: string;
  focus: string;
  subjects: RoadmapSubjectPlan[];
  hours: number;
  weeks: number;
  weeksFromStart: number;
}

export interface RoadmapPlan {
  slug: string;
  title: string;
  audience: string;
  description: string;
  outcomes: string[];
  stages: RoadmapStagePlan[];
  totalHours: number;
  totalWeeks: number;
  hoursPerWeek: number;
}

export interface NextActions {
  /** Subject with unfinished lessons — resume target. */
  resume: { slug: string; code: string; title: string; lessonsCompleted: number; lessonsTotal: number } | null;
  /** First not-yet-started, ready subject — best fresh start. */
  suggestedStart: { slug: string; code: string; title: string; entryModuleIndex: number } | null;
  /** All subjects ready to start and not yet started. */
  unlocked: { slug: string; code: string; title: string; hours: number }[];
  /** Subjects with unfinished lessons (resume candidates). */
  inProgress: { slug: string; code: string; title: string; lessonsCompleted: number; lessonsTotal: number }[];
}

export interface SubjectSearchFilters {
  q?: string;
  school?: SchoolCode;
  difficulty?: Difficulty;
  track?: Track;
  maxHours?: number;
  sort?: "code" | "hours" | "title" | "difficulty";
  page?: number;
  pageSize?: number;
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export class CurriculumEngine {
  readonly registry: CurriculumRegistry;
  readonly graph: DependencyGraph;

  constructor(registry: CurriculumRegistry) {
    this.registry = registry;
    this.graph = buildGraph(registry.subjects);
  }

  // ------------------------------------------------------------ catalog

  stats(): CurriculumManifest {
    return this.registry.manifest;
  }

  getSubject(slug: string): SubjectDef | null {
    return this.graph.bySlug.get(slug) ?? null;
  }

  subject(slug: string): SubjectDef {
    const s = this.getSubject(slug);
    if (!s) throw new Error(`Unknown subject '${slug}'`);
    return s;
  }

  hours(slug: string): number {
    return subjectHours(this.subject(slug));
  }

  lessonCount(slug: string): number {
    return subjectLessons(this.subject(slug));
  }

  topologicalOrder(): string[] {
    return [...this.graph.order];
  }

  prerequisiteClosure(slug: string): string[] {
    this.subject(slug);
    return prerequisiteClosure(this.graph, slug);
  }

  dependentClosure(slug: string): string[] {
    this.subject(slug);
    return dependentClosure(this.graph, slug);
  }

  directPrerequisites(slug: string): { slug: string; kind: "hard" | "soft"; title: string; code: string }[] {
    const s = this.subject(slug);
    return [
      ...s.prerequisites.map((p) => ({ slug: p, kind: "hard" as const, ...this.titleOf(p) })),
      ...s.softPrerequisites.map((p) => ({ slug: p, kind: "soft" as const, ...this.titleOf(p) })),
    ];
  }

  private titleOf(slug: string) {
    const s = this.subject(slug);
    return { title: s.title, code: s.code };
  }

  getRoadmap(slug: string): RoadmapDef | null {
    return this.registry.roadmaps.find((r) => r.slug === slug) ?? null;
  }

  // -------------------------------------------------- mastery & readiness

  lessonsCompletedOf(state: StudentState, slug: string): number {
    return state.progress[slug]?.lessonsCompleted ?? 0;
  }

  /** Mastered = waived (placement/transfer) OR all lessons completed. */
  isMastered(state: StudentState, slug: string): boolean {
    if (state.waived.includes(slug)) return true;
    if ((state.placement[slug] ?? 0) >= PLACEMENT_MASTERY_SCORE) return true;
    const p = state.progress[slug];
    return !!p && p.lessonsTotal > 0 && p.lessonsCompleted >= p.lessonsTotal;
  }

  isWaived(state: StudentState, slug: string): boolean {
    return state.waived.includes(slug) || (state.placement[slug] ?? 0) >= PLACEMENT_MASTERY_SCORE;
  }

  placementOutcome(state: StudentState, slug: string): PlacementOutcomeKind {
    const score = state.placement[slug];
    if (score === undefined) return "standard";
    if (score >= PLACEMENT_MASTERY_SCORE) return "mastered";
    if (score >= PLACEMENT_ACCELERATED_SCORE) return "accelerated";
    return "standard";
  }

  /** 1-based module index a student should enter at (module 2 when accelerated). */
  entryModuleIndex(state: StudentState, slug: string): number {
    return this.placementOutcome(state, slug) === "accelerated" ? 2 : 1;
  }

  isStarted(state: StudentState, slug: string): boolean {
    return this.lessonsCompletedOf(state, slug) > 0;
  }

  unmetPrerequisites(state: StudentState, slug: string): string[] {
    return this.subject(slug).prerequisites.filter((p) => !this.isMastered(state, p));
  }

  isReadyToStart(state: StudentState, slug: string): boolean {
    return this.unmetPrerequisites(state, slug).length === 0;
  }

  /** Ready, not mastered, not started — what a student can begin right now. */
  unlockedSubjects(state: StudentState): string[] {
    return this.graph.order.filter(
      (slug) => !this.isMastered(state, slug) && !this.isStarted(state, slug) && this.isReadyToStart(state, slug)
    );
  }

  inProgressSubjects(state: StudentState): string[] {
    return this.graph.order.filter((slug) => {
      const p = state.progress[slug];
      return !!p && p.lessonsCompleted > 0 && p.lessonsCompleted < p.lessonsTotal && !this.isMastered(state, slug);
    });
  }

  masteredSubjects(state: StudentState): string[] {
    return this.graph.order.filter((slug) => this.isMastered(state, slug));
  }

  // ------------------------------------------------------ path planning

  /**
   * Personalized dependency-aware path from the student's current state to
   * a goal subject: every unmastered subject in the goal's prerequisite
   * closure, in deterministic topological order, goal last.
   */
  planPathTo(state: StudentState, goal: string): PathPlan {
    const goalSubject = this.subject(goal);
    const closure = this.prerequisiteClosure(goal);
    const needed = [...closure, goal].filter((slug) => !this.isMastered(state, slug));
    const steps: PathStep[] = needed.map((slug) => ({
      slug,
      code: this.subject(slug).code,
      title: this.subject(slug).title,
      hours: this.hours(slug),
      reason: slug === goal ? "goal" : "prerequisite",
      ready: this.isReadyToStart(state, slug) && !this.isStarted(state, slug),
    }));
    return {
      goal: goalSubject.slug,
      steps,
      totalHours: Math.round(steps.reduce((h, s) => h + s.hours, 0) * 2) / 2,
    };
  }

  /**
   * Placement plan for a goal: tests for the goal's unmastered closure,
   * ordered most-dependent-first. Passing a test at the mastery threshold
   * waives the subject AND subsumes its whole prerequisite chain.
   * Closure subjects without placement tests are listed under `study`.
   * Question counts come from the authored banks when provided.
   */
  planPlacement(state: StudentState, goal: string, banks?: PlacementBank): PlacementPlan {
    const closure = this.prerequisiteClosure(goal).filter((slug) => !this.isMastered(state, slug));
    const tests: PlacementTest[] = [];
    const study: string[] = [];
    for (const slug of [...closure].reverse()) {
      const s = this.subject(slug);
      const bank = banks?.[slug];
      if (!bank || bank.length === 0) {
        study.push(slug);
        continue;
      }
      tests.push({
        slug,
        code: s.code,
        title: s.title,
        order: tests.length + 1,
        minutes: Math.max(10, Math.round(bank.length * 1.25)),
        questions: bank.length,
        supersedeOnPass: prerequisiteClosure(this.graph, slug).filter((c) => closure.includes(c)),
        status: this.isWaived(state, slug) ? "waived" : "recommended",
      });
    }
    const totalHoursIfStudied =
      Math.round(closure.reduce((h, slug) => h + this.hours(slug), 0) * 2) / 2;
    return { goal, tests, study, totalHoursIfStudied };
  }

  /**
   * Applies placement scores to a plan: walks tests most-advanced first;
   * >= 90 waives the subject and supersedes its prerequisites,
   * 75–89 grants advanced standing (start at module 2), below 75 = study.
   */
  applyPlacement(plan: PlacementPlan, scores: Record<string, number>): PlacementResult {
    const waived = new Set<string>();
    const superseded = new Set<string>();
    const accelerated: string[] = [];
    const standard: string[] = [];

    for (const test of plan.tests) {
      if (test.status === "waived" || superseded.has(test.slug) || waived.has(test.slug)) {
        superseded.add(test.slug);
        continue;
      }
      const score = scores[test.slug];
      if (score === undefined) continue;
      if (score >= PLACEMENT_MASTERY_SCORE) {
        waived.add(test.slug);
        for (const s of test.supersedeOnPass) if (!waived.has(s)) superseded.add(s);
      } else if (score >= PLACEMENT_ACCELERATED_SCORE) {
        accelerated.push(test.slug);
      } else {
        standard.push(test.slug);
      }
    }

    return {
      waived: [...waived],
      accelerated,
      standard,
      skippedBySupersede: [...superseded].filter((s) => !waived.has(s)),
    };
  }

  // ---------------------------------------------------- roadmap planning

  /**
   * Staged roadmap plan. When a student state is provided, each subject is
   * annotated (mastered / in-progress / ready / locked) and hours/weeks only
   * count the remaining work.
   */
  planRoadmap(slug: string, opts?: { hoursPerWeek?: number; state?: StudentState }): RoadmapPlan {
    const rm = this.getRoadmap(slug);
    if (!rm) throw new Error(`Unknown roadmap '${slug}'`);
    const hoursPerWeek = opts?.hoursPerWeek && opts.hoursPerWeek > 0 ? opts.hoursPerWeek : 8;
    const state = opts?.state ?? EMPTY_STUDENT_STATE;

    let weeksFromStart = 0;
    let totalHours = 0;
    const stages: RoadmapStagePlan[] = rm.stages.map((st, i) => {
      const subjects: RoadmapSubjectPlan[] = st.subjects.map((s) => {
        const subject = this.subject(s);
        const mastered = this.isMastered(state, s);
        const started = this.isStarted(state, s);
        return {
          slug: s,
          code: subject.code,
          title: subject.title,
          hours: subjectHours(subject),
          status: mastered ? "mastered" : started ? "in-progress" : this.isReadyToStart(state, s) ? "ready" : "locked",
          unmetPrerequisites: this.unmetPrerequisites(state, s),
        };
      });
      const hours =
        Math.round(
          subjects.reduce((h, s) => h + (s.status === "mastered" ? 0 : s.hours), 0) * 2
        ) / 2;
      const weeks = Math.ceil(hours / hoursPerWeek);
      weeksFromStart += weeks;
      totalHours += hours;
      return { index: i + 1, title: st.title, focus: st.focus, subjects, hours, weeks, weeksFromStart };
    });

    return {
      slug: rm.slug,
      title: rm.title,
      audience: rm.audience,
      description: rm.description,
      outcomes: rm.outcomes,
      stages,
      totalHours,
      totalWeeks: weeksFromStart,
      hoursPerWeek,
    };
  }

  // ------------------------------------------------------- next actions

  /**
   * "Return to incomplete lessons": picks the most recently touched subject
   * with unfinished lessons; otherwise suggests the best fresh start
   * (roadmap order when given, else deterministic topological order).
   */
  nextActions(state: StudentState, ordering?: string[]): NextActions {
    const ord = ordering && ordering.length > 0 ? [...ordering] : this.graph.order;
    const rank = new Map(ord.map((slug, i) => [slug, i]));

    const inProgress = this.inProgressSubjects(state).sort(
      (a, b) => (rank.get(a) ?? ord.length) - (rank.get(b) ?? ord.length)
    );
    const resumeSlug =
      inProgress.length > 0
        ? [...inProgress].sort((a, b) => (state.progress[b]?.lastAccessedAt ?? 0) - (state.progress[a]?.lastAccessedAt ?? 0))[0]
        : null;

    const unlocked = this.unlockedSubjects(state).sort(
      (a, b) => (rank.get(a) ?? ord.length) - (rank.get(b) ?? ord.length)
    );
    const suggested = unlocked[0] ?? null;

    return {
      resume: resumeSlug
        ? {
            slug: resumeSlug,
            ...this.titleOf(resumeSlug),
            lessonsCompleted: this.lessonsCompletedOf(state, resumeSlug),
            lessonsTotal: this.lessonCount(resumeSlug),
          }
        : null,
      suggestedStart: suggested
        ? {
            slug: suggested,
            ...this.titleOf(suggested),
            entryModuleIndex: this.entryModuleIndex(state, suggested),
          }
        : null,
      unlocked: unlocked.map((slug) => ({ slug, ...this.titleOf(slug), hours: this.hours(slug) })),
      inProgress: inProgress.map((slug) => ({
        slug,
        ...this.titleOf(slug),
        lessonsCompleted: this.lessonsCompletedOf(state, slug),
        lessonsTotal: this.lessonCount(slug),
      })),
    };
  }

  // ------------------------------------------------------------- search

  searchSubjects(filters: SubjectSearchFilters): { items: SubjectDef[]; total: number; page: number; pageSize: number } {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const q = filters.q?.trim().toLowerCase();

    let items = this.registry.subjects.filter((s) => {
      if (filters.school && s.school !== filters.school) return false;
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false;
      if (filters.track && s.track !== filters.track) return false;
      if (filters.maxHours !== undefined && subjectHours(s) > filters.maxHours) return false;
      if (q) {
        const haystack = [
          s.title,
          s.blurb,
          s.code,
          ...s.keywords,
          ...s.modules.flatMap((m) => [m.title, ...m.chapters.map((c) => c.title)]),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sort = filters.sort ?? "code";
    items = [...items].sort((a, b) => {
      switch (sort) {
        case "hours":
          return subjectHours(a) - subjectHours(b) || subjectSortKey(a).localeCompare(subjectSortKey(b));
        case "title":
          return a.title.localeCompare(b.title);
        case "difficulty":
          return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || subjectSortKey(a).localeCompare(subjectSortKey(b));
        default:
          return subjectSortKey(a).localeCompare(subjectSortKey(b));
      }
    });

    const total = items.length;
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
  }

  // --------------------------------------------------------- projections

  /** Authoring status projection: how much of a subject has published content. */
  subjectAssessmentSummary(slug: string) {
    const s = this.subject(slug);
    return {
      checkpoints: s.modules.map((m) => m.checkpoint),
      finalExam: s.finalExam,
      exercises: subjectExercises(s),
      assessments: subjectAssessments(s),
    };
  }
}
