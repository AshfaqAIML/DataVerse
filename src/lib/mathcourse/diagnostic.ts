/**
 * The diagnostic + adaptive-revision engine — pure functions over the course
 * data, so the placement logic is unit-testable and the same rules run in
 * the UI and the verifier.
 *
 * The core promise ("a student is never expected to understand calculus
 * before learning the algebra needed for calculus") is enforced in three
 * cooperating layers:
 *
 *   1. PLACEMENT can never skip past a part whose diagnostic score is weak,
 *      no matter how well later parts scored. Exposure is not mastery.
 *   2. REVISION lists are closed under prerequisites: a weak lesson always
 *      brings its unmet ancestors along, in dependency order.
 *   3. READINESS: a lesson's prerequisites are checked against completed
 *      lessons (plus diagnostic-cleared lessons) before the UI presents it
 *      as "ready".
 */
import type { MathCourse, MathLesson } from "./types";
import { allMathLessons, prerequisiteClosure } from "./types";

/** A part is "cleared" by the diagnostic at ≥ 80% of its questions. */
export const CLEAR_THRESHOLD = 0.8;

export interface DiagnosticAnswers {
  /** question id -> chosen option index (undefined = skipped). */
  picks: Record<string, number>;
}

export interface PlacementResult {
  areaScores: Record<string, { correct: number; total: number }>;
  placement: { partId: string; lessonId: string; note: string };
  revisionLessonIds: string[];
  correct: number;
  total: number;
}

export function computeDiagnosticResult(course: MathCourse, answers: DiagnosticAnswers): PlacementResult {
  const areaScores: Record<string, { correct: number; total: number }> = {};
  for (const q of course.diagnostic.questions) {
    const a = (areaScores[q.part] ??= { correct: 0, total: 0 });
    a.total += 1;
    const pick = answers.picks[q.id];
    if (pick !== undefined && pick === q.correctIndex) a.correct += 1;
  }

  const total = course.diagnostic.questions.length;
  const correct = course.diagnostic.questions.filter(
    (q) => answers.picks[q.id] !== undefined && answers.picks[q.id] === q.correctIndex
  ).length;

  // ---- placement: walk parts in order; stop at the first weak part. ----
  let placementPart = course.parts[0];
  let note = "";
  const clearedParts = new Set<string>();
  for (const part of course.parts) {
    const s = areaScores[part.letter];
    if (!s || s.total === 0) {
      placementPart = part;
      note = "This part had no diagnostic questions, so it is the safe place to start.";
      break;
    }
    if (s.correct / s.total < CLEAR_THRESHOLD) {
      placementPart = part;
      const firstMiss = part.lessons.find((l) =>
        course.diagnostic.questions.some(
          (q) => q.gates === l.slug && answers.picks[q.id] !== undefined && answers.picks[q.id] !== q.correctIndex
        )
      );
      note =
        s.correct === 0
          ? `Scored ${s.correct}/${s.total} here — starting from the beginning of this part, at your own pace.`
          : `Scored ${s.correct}/${s.total} here. Starting at the first topic the diagnostic flagged${
              firstMiss ? ` (${firstMiss.title})` : ""
            }.`;
      break;
    }
    clearedParts.add(part.letter);
  }
  if (!note) {
    // Everything cleared — placement is the last part, graduate note.
    placementPart = course.parts[course.parts.length - 1];
    note = "You cleared every area the diagnostic probed — jump straight in wherever you like.";
  }

  const firstMissedInPlacement = placementPart.lessons.find((l) =>
    course.diagnostic.questions.some(
      (q) => q.gates === l.slug && answers.picks[q.id] !== undefined && answers.picks[q.id] !== q.correctIndex
    )
  );
  const placementLesson =
    clearedParts.size === course.parts.length
      ? placementPart.lessons[0]
      : (firstMissedInPlacement ?? placementPart.lessons[0]);

  // Honest feedback when later-part scores outrun the placed part.
  const laterStrong = course.parts
    .filter((p) => course.parts.findIndex((x) => x.letter === p.letter) > course.parts.findIndex((x) => x.letter === placementPart.letter))
    .filter((p) => areaScores[p.letter] && areaScores[p.letter].correct / areaScores[p.letter].total >= CLEAR_THRESHOLD)
    .map((p) => `Part ${p.letter} (${p.title})`);
  if (laterStrong.length > 0 && clearedParts.size < course.parts.length) {
    note += ` Your ${laterStrong.join(" and ")} answers look strong — but the gaps below are exactly what makes ${laterStrong.length > 1 ? "those topics" : "that topic"} painful later, so close them first.`;
  }

  // ---- revision list: every wrong/skipped question's gate lesson, ----
  // ---- expanded with unmet prerequisites, in dependency order.      ----
  const revision = revisionListFromDiagnostic(course, answers);

  return { areaScores, placement: { partId: placementPart.letter, lessonId: placementLesson.slug, note }, revisionLessonIds: revision, correct, total };
}

/** Gate lessons for wrong/skipped questions + prerequisite closure. */
export function revisionListFromDiagnostic(course: MathCourse, answers: DiagnosticAnswers): string[] {
  const weak = new Set<string>();
  for (const q of course.diagnostic.questions) {
    const pick = answers.picks[q.id];
    if (pick === undefined || pick !== q.correctIndex) weak.add(q.gates);
  }
  return closeAndOrder(course, weak);
}

/** Expand a set of lesson slugs with their ancestors; order by global position. */
function closeAndOrder(course: MathCourse, slugs: Set<string>): string[] {
  const expanded = new Set<string>();
  for (const slug of slugs) {
    expanded.add(slug);
    for (const anc of prerequisiteClosure(course, slug)) expanded.add(anc);
  }
  const order = new Map(allMathLessons(course).map((l, i) => [l.lesson.slug, i]));
  return [...expanded].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

// ---------------------------------------------------------------------------
// Ongoing adaptive revision (quiz mistakes during the course)
// ---------------------------------------------------------------------------

export interface RevisionItem {
  lessonId: string;
  title: string;
  partId: string;
  reason: string;
}

export interface ProgressSnapshot {
  lessonsDone: Record<string, true>;
  quizAnswers: Record<string, { chosen: number; correct: boolean }>;
}

/**
 * The Revision Radar for one part: lessons inside it that the learner
 * got quiz questions wrong on, plus any unmet prerequisite of the part's
 * lessons. Ordered so prerequisites always come first.
 */
export function revisionRadar(
  course: MathCourse,
  partLetter: string,
  progress: ProgressSnapshot,
): RevisionItem[] {
  const part = course.parts.find((p) => p.letter === partLetter);
  if (!part) return [];

  const byId = new Map<string, MathLesson>(allMathLessons(course).map((l) => [l.lesson.slug, l.lesson]));
  const wrongCounts = new Map<string, number>();
  for (const lesson of part.lessons) {
    const wrong = lesson.quiz.filter((q) => {
      const a = progress.quizAnswers[q.id];
      return a !== undefined && !a.correct;
    }).length;
    if (wrong > 0) wrongCounts.set(lesson.slug, wrong);
  }

  const weak = new Set<string>(wrongCounts.keys());
  // unmet prerequisites of ANY lesson in this part
  for (const lesson of part.lessons) {
    for (const prereq of lesson.prerequisites) {
      if (!progress.lessonsDone[prereq] && byId.has(prereq)) weak.add(prereq);
    }
  }

  const ordered = closeAndOrder(course, weak);
  const out: RevisionItem[] = [];
  for (const slug of ordered) {
    const lesson = byId.get(slug);
    if (!lesson) continue;
    const owningPart = course.parts.find((p) => p.lessons.some((l) => l.slug === slug))!;
    const wrong = wrongCounts.get(slug);
    const unmet = lesson.prerequisites.filter((p) => !progress.lessonsDone[p]).length;
    const reason = wrong
      ? `Missed ${wrong} of ${lesson.quiz.length} quiz question${wrong > 1 ? "s" : ""} here.`
      : unmet
        ? `A prerequisite still uncompleted (${unmet} path${unmet > 1 ? "s" : ""} into it).`
        : `Supports a lesson flagged for revision.`;
    out.push({ lessonId: slug, title: lesson.title, partId: owningPart.letter, reason });
  }
  return out;
}

/** Is a lesson "ready" (all prerequisites completed or diagnostic-cleared)? */
export function lessonReady(
  course: MathCourse,
  lesson: MathLesson,
  progress: ProgressSnapshot,
  diagnosticClearedParts?: Set<string>
): { ready: boolean; unmet: MathLesson[] } {
  const byId = new Map<string, MathLesson>(allMathLessons(course).map((l) => [l.lesson.slug, l.lesson]));
  const unmet: MathLesson[] = [];
  for (const slug of lesson.prerequisites) {
    if (progress.lessonsDone[slug]) continue;
    const owner = byId.get(slug);
    if (!owner) continue;
    const ownerPart = course.parts.find((p) => p.lessons.some((l) => l.slug === slug))!;
    if (diagnosticClearedParts?.has(ownerPart.letter)) continue; // diagnostic vouches for it
    unmet.push(owner);
  }
  return { ready: unmet.length === 0, unmet };
}

/** Parts the diagnostic cleared (for readiness checks + home display). */
export function diagnosticCleared(course: MathCourse, result: { areaScores: Record<string, { correct: number; total: number }> } | null): Set<string> {
  const out = new Set<string>();
  if (!result) return out;
  for (const p of course.parts) {
    const s = result.areaScores[p.letter];
    if (s && s.total > 0 && s.correct / s.total >= CLEAR_THRESHOLD) out.add(p.letter);
  }
  return out;
}
