"use client";

/**
 * The bridge between persisted academy state and the CurriculumEngine's
 * plain-data StudentState — including the python, sql, numpy and
 * classical-ai subjects, whose progress is derived from the interactive
 * course stores (src/lib/course/progress, src/lib/sqlcourse/progress,
 * src/lib/numpycourse/progress, src/lib/classicalai/progress).
 *
 * The Classical AI school's six registry subjects are bridged onto the
 * Classical AI course (one part per subject), so each subject's page
 * shows "Start the interactive course" with its part's live lesson count.
 * School H's six subjects are bridged onto the Data Visualization course
 * the same way (each subject mapped to the part that most advances it).
 */
import { useMemo } from "react";
import { PYTHON_COURSE } from "@/content/python";
import { allLessons, countLessons } from "@/lib/course/types";
import { SQL_COURSE } from "@/content/sql";
import { allLessons as sqlAllLessons, countLessons as sqlCountLessons } from "@/lib/sqlcourse/types";
import { NUMPY_COURSE } from "@/content/numpy";
import { allNumpyLessons, countNumpyLessons } from "@/lib/numpycourse/types";
import { CLASSICAL_AI_COURSE } from "@/content/classical-ai";
import { allClassicalLessons, countClassicalLessons } from "@/lib/classicalai/types";
import { DATA_VIZ_COURSE } from "@/content/dataviz";
import { allDataVizLessons } from "@/lib/dataviz/types";
import { curriculum } from "@/lib/curriculum/data";
import type { StudentState } from "@/lib/curriculum/types";
import { useCourseProgress } from "@/lib/course/progress";
import { useNumpyProgress } from "@/lib/numpycourse/progress";
import { useClassicalProgress } from "@/lib/classicalai/progress";
import { useAcademy, type AcademySnapshot } from "./state";

/** Per-subject bridging data for the Classical AI course (one part per subject). */
function classicalSubjectBridge(): Record<string, { href: string; label: string; lessons: number; minutes: number }> {
  const out: Record<string, { href: string; label: string; lessons: number; minutes: number }> = {};
  for (const part of CLASSICAL_AI_COURSE.parts) {
    const subject = curriculum.getSubject(part.subjectSlug);
    if (!subject) continue;
    const lessons = allClassicalLessons({
      ...CLASSICAL_AI_COURSE,
      parts: [part],
    });
    out[part.subjectSlug] = {
      href: `#/classical/part/${part.letter}`,
      label: `${CLASSICAL_AI_COURSE.title} — Part ${part.letter}: ${part.title}`,
      lessons: lessons.length,
      minutes: lessons.reduce((n, l) => n + l.lesson.minutes, 0),
    };
  }
  return out;
}

/** Subjects with fully-authored interactive courses (registry-driven data). */
export const AUTHORED_COURSES: Record<string, { href: string; label: string; lessons: number; minutes: number }> = {
  python: {
    href: "#/course",
    label: "The Complete Python Programming Course",
    lessons: countLessons(PYTHON_COURSE),
    minutes: allLessons(PYTHON_COURSE).reduce((n, l) => n + l.lesson.minutes, 0),
  },
  sql: {
    href: "#/sql",
    label: "The Complete SQL & PostgreSQL Course",
    lessons: sqlCountLessons(SQL_COURSE),
    minutes: sqlAllLessons(SQL_COURSE).reduce((n, l) => n + l.lesson.minutes, 0),
  },
  numpy: {
    href: "#/numpy",
    label: "NumPy: The Complete Course",
    lessons: countNumpyLessons(NUMPY_COURSE),
    minutes: allNumpyLessons(NUMPY_COURSE).reduce((n, l) => n + l.lesson.minutes, 0),
  },
  ...classicalSubjectBridge(),
  ...vizSubjectBridge(),
};

/** Per-subject bridging data for the Data Visualization course (subjects mapped to the part that most advances them). */
function vizSubjectBridge(): Record<string, { href: string; label: string; lessons: number; minutes: number }> {
  const partFor: Record<string, string> = {
    "visualization-principles": "A", // Foundations
    "statistical-charts": "B", // Matplotlib — the foundational charting tool
    "dashboard-design": "E", // the BI decision layer (Dash delivery lives in D)
    "data-storytelling": "E",
    "power-bi": "E",
    "tableau": "E",
  };
  const out: Record<string, { href: string; label: string; lessons: number; minutes: number }> = {};
  for (const [slug, letter] of Object.entries(partFor)) {
    const part = DATA_VIZ_COURSE.parts.find((p) => p.letter === letter);
    const subject = curriculum.getSubject(slug);
    if (!part || !subject) continue;
    const lessons = allDataVizLessons({ ...DATA_VIZ_COURSE, parts: [part] });
    out[slug] = {
      href: `#/viz/part/${part.letter}`,
      label: `${DATA_VIZ_COURSE.title} — Part ${part.letter}: ${part.title}`,
      lessons: lessons.length,
      minutes: lessons.reduce((n, l) => n + l.lesson.minutes, 0),
    };
  }
  return out;
}

const PYTHON_COURSE_LESSONS = countLessons(PYTHON_COURSE);
const NUMPY_COURSE_LESSONS = countNumpyLessons(NUMPY_COURSE);

/**
 * The deduplicated course list for navigation surfaces (footer, mobile
 * sheet, search palette). AUTHORED_COURSES itself keeps one entry per
 * bridged subject — that is what powers per-subject progress — but
 * rendering it raw would print the Classical AI and Data Visualization
 * courses six times each in a menu.
 */
export const DISPLAY_COURSES: Array<{ href: string; label: string; lessons: number; minutes: number }> = (() => {
  const seen = new Map<string, { href: string; label: string; lessons: number; minutes: number }>();
  for (const entry of Object.values(AUTHORED_COURSES)) {
    const first = entry.href.split("/").slice(0, 3).join("/");
    if (!seen.has(first)) seen.set(first, entry);
  }
  // per-part entries (classical, viz) collapse to their course home with
  // the whole course's counters, so menus list the course once
  const out: Array<{ href: string; label: string; lessons: number; minutes: number }> = [];
  for (const e of seen.values()) {
    if (e.href.startsWith("#/classical/part/")) {
      out.push({
        ...e,
        href: "#/classical",
        label: CLASSICAL_AI_COURSE.title,
        lessons: countClassicalLessons(CLASSICAL_AI_COURSE),
        minutes: allClassicalLessons(CLASSICAL_AI_COURSE).reduce((n, l) => n + l.lesson.minutes, 0),
      });
    } else if (e.href.startsWith("#/viz/part/")) {
      out.push({
        ...e,
        href: "#/viz",
        label: DATA_VIZ_COURSE.title,
        lessons: allDataVizLessons(DATA_VIZ_COURSE).length,
        minutes: allDataVizLessons(DATA_VIZ_COURSE).reduce((n, r) => n + r.lesson.minutes, 0),
      });
    } else {
      out.push(e);
    }
  }
  return out;
})();

/** Pure assembly of the engine's StudentState from the persisted stores. */
export function studentState(
  academy: AcademySnapshot,
  courseLessonsDone: Record<string, true>,
  numpyLessonsDone: Record<string, true> = {},
  classicalLessonsDone: Record<string, true> = {},
): StudentState {
  const progress: StudentState["progress"] = {};

  for (const [slug, lessons] of Object.entries(academy.lessonDone)) {
    if (!curriculum.getSubject(slug)) continue; // stale keys after registry edits
    const done = Object.values(lessons).filter(Boolean).length;
    if (done <= 0) continue;
    const total = curriculum.lessonCount(slug);
    progress[slug] = {
      lessonsCompleted: Math.min(done, total),
      lessonsTotal: total,
      lastAccessedAt: academy.lastAccessedAt[slug],
      completedAt: done >= total ? (academy.lastAccessedAt[slug] ?? null) : null,
    };
  }

  // The python subject is mastered through its fully-authored course.
  const courseDone = allLessons(PYTHON_COURSE).filter((l) => courseLessonsDone[l.lesson.slug]).length;
  if (courseDone > 0 && !progress.python) {
    progress.python = {
      lessonsCompleted: courseDone,
      lessonsTotal: PYTHON_COURSE_LESSONS,
      lastAccessedAt: academy.lastAccessedAt.python,
      completedAt: courseDone >= PYTHON_COURSE_LESSONS ? (academy.lastAccessedAt.python ?? null) : null,
    };
  }

  // The numpy subject is mastered through its fully-authored course.
  const numpyDone = allNumpyLessons(NUMPY_COURSE).filter((l) => numpyLessonsDone[l.lesson.slug]).length;
  if (numpyDone > 0 && !progress.numpy) {
    progress.numpy = {
      lessonsCompleted: numpyDone,
      lessonsTotal: NUMPY_COURSE_LESSONS,
      lastAccessedAt: academy.lastAccessedAt.numpy,
      completedAt: numpyDone >= NUMPY_COURSE_LESSONS ? (academy.lastAccessedAt.numpy ?? null) : null,
    };
  }

  // The Classical AI school's six subjects, through the school's course.
  // Course parts stand in for their registry subjects: progress is the
  // course lessons completed, measured against the registry syllabus
  // total (the interactive course covers the subject's core lessons).
  for (const part of CLASSICAL_AI_COURSE.parts) {
    const partLessons = allClassicalLessons({ ...CLASSICAL_AI_COURSE, parts: [part] });
    const done = partLessons.filter((l) => classicalLessonsDone[l.lesson.slug]).length;
    if (done > 0) {
      const total = curriculum.lessonCount(part.subjectSlug);
      progress[part.subjectSlug] = {
        lessonsCompleted: Math.min(done, total),
        lessonsTotal: total,
        lastAccessedAt: academy.lastAccessedAt[part.subjectSlug],
        completedAt: done >= total ? (academy.lastAccessedAt[part.subjectSlug] ?? null) : null,
      };
    }
  }

  return { progress, placement: academy.placementScores, waived: academy.waived };
}

/** React hook: the live StudentState fed to the engine. */
export function useStudentState(): StudentState {
  const academy = useAcademy();
  const courseLessonsDone = useCourseProgress((s) => s.lessonsDone);
  const numpyLessonsDone = useNumpyProgress((s) => s.lessonsDone);
  const classicalLessonsDone = useClassicalProgress((s) => s.lessonsDone);
  return useMemo(
    () => studentState(academy, courseLessonsDone, numpyLessonsDone, classicalLessonsDone),
    [academy, courseLessonsDone, numpyLessonsDone, classicalLessonsDone],
  );
}
