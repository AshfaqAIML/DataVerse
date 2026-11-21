/**
 * Registry validator — the "no empty course shells" gate.
 *
 * Runs in unit tests (and can run in CI) against the whole registry.
 * Errors fail the build; warnings are advisory.
 */
import { buildGraph, CurriculumGraphError } from "./graph";
import type { CurriculumRegistry, SubjectDef } from "./types";

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function subjectHours(s: SubjectDef): number {
  let minutes = s.finalExam.minutes;
  for (const m of s.modules) {
    minutes += m.checkpoint.minutes;
    for (const c of m.chapters) for (const l of c.lessons) minutes += l.minutes;
  }
  for (const p of s.projects) minutes += p.hours * 60;
  return Math.round((minutes / 60) * 2) / 2;
}

export function subjectLessons(s: SubjectDef): number {
  return s.modules.reduce((n, m) => n + m.chapters.reduce((k, c) => k + c.lessons.length, 0), 0);
}

export function subjectExercises(s: SubjectDef): number {
  let n = 0;
  for (const m of s.modules)
    for (const c of m.chapters) n += c.exerciseCount ?? c.lessons.reduce((k, l) => k + l.exercises, 0) + 2;
  return n;
}

export function subjectAssessments(s: SubjectDef): number {
  // module checkpoints + final exam (+ placement test when eligible)
  return s.modules.length + 1 + (s.placementEligible ? 1 : 0);
}

export function validateRegistry(registry: CurriculumRegistry): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const E = (code: string, path: string, message: string) => errors.push({ code, path, message });
  const W = (code: string, path: string, message: string) => warnings.push({ code, path, message });

  const schoolCodes = new Set(registry.schools.map((s) => s.code));
  const slugs = new Set<string>();
  const codes = new Set<string>();

  if (registry.schools.length !== 10) E("SCHOOLS", "schools", `Expected 10 schools, found ${registry.schools.length}`);

  for (const subject of registry.subjects) {
    const p = subject.slug;

    if (slugs.has(p)) E("DUP_SLUG", p, `Duplicate subject slug '${p}'`);
    slugs.add(p);
    if (codes.has(subject.code)) E("DUP_CODE", p, `Duplicate subject code '${subject.code}'`);
    codes.add(subject.code);
    if (!schoolCodes.has(subject.school)) E("SCHOOL", p, `Unknown school '${subject.school}'`);
    if (subject.title.length < 3) E("TITLE", p, "Subject title too short");
    if (subject.blurb.length < 20) E("BLURB", p, "Subject blurb too short — describe the promise of the subject");
    if (subject.objectives.length < 3) E("OBJECTIVES", p, "At least 3 learning objectives required");
    if (subject.outcomes.length < 3) E("OUTCOMES", p, "At least 3 learning outcomes required");
    if (subject.modules.length < 2) E("MODULES", p, "At least 2 modules required — no single-module subjects");
    if (subject.projects.length < 1) E("PROJECTS", p, "Every subject needs at least one project");
    if (subject.keywords.length < 2) E("KEYWORDS", p, "At least 2 keywords for search");
    if (subject.finalExam.questions < 8) E("EXAM", p, "Final exam needs at least 8 questions");
    if (subject.difficulty !== "beginner" && subject.prerequisites.length === 0)
      W("NO_PREREQ", p, `${subject.difficulty} subject with no hard prerequisites`);

    const lessonTitles = new Set<string>();
    let lessonCount = 0;
    subject.modules.forEach((m, mi) => {
      const mp = `${p}.m${mi + 1}`;
      if (m.chapters.length < 2) E("MODULE_CHAPTERS", mp, `'${m.title}' needs at least 2 chapters`);
      if (m.outcomes.length < 2) E("MODULE_OUTCOMES", mp, "At least 2 module outcomes");
      if (m.exerciseKinds.length < 2) E("MODULE_EXERCISE_KINDS", mp, "At least 2 exercise kinds in the practice mix");
      if (m.summary.length < 10) E("MODULE_SUMMARY", mp, "Module summary too short");
      if (m.checkpoint.questions < 8) E("CHECKPOINT", mp, "Checkpoint needs at least 8 questions");
      if (m.chapters.length > 5) W("MODULE_CHAPTERS", mp, "More than 5 chapters — consider splitting the module");

      m.chapters.forEach((c, ci) => {
        const cp = `${mp}.c${ci + 1}`;
        if (c.lessons.length < 2) E("CHAPTER_LESSONS", cp, `'${c.title}' needs at least 2 lessons`);
        if (!c.focus || c.focus.length < 8) E("CHAPTER_FOCUS", cp, "Chapter focus missing or too short");
        c.lessons.forEach((l, li) => {
          const lp = `${cp}.l${li + 1}`;
          lessonCount += 1;
          if (l.title.length < 3) E("LESSON_TITLE", lp, "Lesson title too short");
          if (lessonTitles.has(`${mi + 1}/${l.title}`))
            E("LESSON_TITLE_DUP", lp, `Duplicate lesson title '${l.title}' in module`);
          lessonTitles.add(`${mi + 1}/${l.title}`);
          if (l.summary.length < 15) E("LESSON_SUMMARY", lp, "Lesson summary too short");
          if (l.concepts.length < 2) E("LESSON_CONCEPTS", lp, "At least 2 key concepts per lesson");
          if (l.exercises < 1) E("LESSON_EXERCISES", lp, "At least 1 embedded exercise per lesson");
          if (l.minutes < 10 || l.minutes > 60) E("LESSON_MINUTES", lp, `Lesson minutes ${l.minutes} outside 10–60`);
          if (l.minutes < 15) W("LESSON_MINUTES", lp, "Lesson under 15 minutes");
        });
      });
    });

    if (lessonCount < 8) E("LESSON_COUNT", p, `Only ${lessonCount} lessons — subjects must be fully built out`);

    subject.projects.forEach((pr, pi) => {
      const pp = `${p}.p${pi + 1}`;
      if (pr.brief.length < 20) E("PROJECT_BRIEF", pp, "Project brief too short");
      if (pr.deliverables.length < 2) E("PROJECT_DELIVERABLES", pp, "At least 2 deliverables");
      if (pr.rubric.length < 2) E("PROJECT_RUBRIC", pp, "At least 2 rubric criteria");
      if (pr.tools.length < 1) E("PROJECT_TOOLS", pp, "At least 1 tool");
      if (pr.hours < 1 || pr.hours > 40) E("PROJECT_HOURS", pp, `Project hours ${pr.hours} outside 1–40`);
    });
  }

  // ---- references + cycles
  try {
    buildGraph(registry.subjects);
  } catch (err) {
    if (err instanceof CurriculumGraphError) E("GRAPH", "graph", err.message);
    else throw err;
  }
  for (const subject of registry.subjects) {
    for (const sp of subject.softPrerequisites) {
      if (!slugs.has(sp)) E("SOFT_PREREQ", subject.slug, `Unknown soft prerequisite '${sp}'`);
    }
  }

  // ---- roadmaps
  const roadmapSlugs = new Set<string>();
  for (const rm of registry.roadmaps) {
    const rp = `roadmap:${rm.slug}`;
    if (roadmapSlugs.has(rm.slug)) E("DUP_ROADMAP", rp, "Duplicate roadmap slug");
    roadmapSlugs.add(rm.slug);
    if (rm.stages.length < 2) E("ROADMAP_STAGES", rp, "At least 2 stages");
    const staged = new Map<string, number>(); // slug -> stage index (1-based)
    const seen = new Set<string>();
    rm.stages.forEach((st, si) => {
      const sp = `${rp}.s${si + 1}`;
      if (st.subjects.length === 0) E("EMPTY_STAGE", sp, "Stage has no subjects");
      if (!st.title || !st.focus) E("STAGE_META", sp, "Stage needs title and focus");
      for (const s of st.subjects) {
        if (!slugs.has(s)) {
          E("ROADMAP_REF", sp, `Unknown subject '${s}'`);
          continue;
        }
        if (seen.has(s)) E("ROADMAP_DUP", sp, `Subject '${s}' appears twice in roadmap`);
        seen.add(s);
        staged.set(s, si + 1);
      }
    });
    for (const [slug, stage] of staged) {
      const subject = registry.subjects.find((s) => s.slug === slug)!;
      for (const prereq of subject.prerequisites) {
        const prereqStage = staged.get(prereq);
        if (prereqStage === undefined) {
          E("ROADMAP_PREREQ_MISSING", `${rp}:${slug}`, `Hard prerequisite '${prereq}' is not part of this roadmap`);
        } else if (prereqStage > stage) {
          E("ROADMAP_PREREQ_ORDER", `${rp}:${slug}`, `Prerequisite '${prereq}' is staged later (s${prereqStage}) than the subject (s${stage})`);
        }
      }
    }
  }

  const full = registry.roadmaps.find((r) => r.slug === "full-academy");
  if (full) {
    const covered = new Set(full.stages.flatMap((s) => s.subjects));
    const missing = registry.subjects.map((s) => s.slug).filter((s) => !covered.has(s));
    if (missing.length > 0) E("FULL_ACADEMY_COVERAGE", "roadmap:full-academy", `Missing subjects: ${missing.join(", ")}`);
  }

  return { ok: errors.length === 0, errors, warnings };
}
