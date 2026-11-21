"use client";

/**
 * The platform's interactive programmes — data for the homepage's
 * "featured programmes" section. Every entry is a real, complete
 * interactive course; counts are computed live from the course data.
 */
import { PYTHON_COURSE } from "@/content/python";
import { allLessons } from "@/lib/course/types";
import { SQL_COURSE } from "@/content/sql";
import { allLessons as sqlAllLessons } from "@/lib/sqlcourse/types";
import { NUMPY_COURSE } from "@/content/numpy";
import { allNumpyLessons } from "@/lib/numpycourse/types";
import { MATH_COURSE } from "@/content/math";
import { allMathLessons, mathCourseMinutes } from "@/lib/mathcourse/types";
import { CLASSICAL_AI_COURSE } from "@/content/classical-ai";
import { allClassicalLessons } from "@/lib/classicalai/types";
import { countClassicalExercises } from "@/lib/classicalai/types";

function hoursOf(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

const PYTHON_LESSONS = allLessons(PYTHON_COURSE);
const SQL_LESSONS = sqlAllLessons(SQL_COURSE);
const NUMPY_LESSONS = allNumpyLessons(NUMPY_COURSE);
const MATH_LESSONS = allMathLessons(MATH_COURSE);
const CLASSICAL_LESSONS = allClassicalLessons(CLASSICAL_AI_COURSE);
const MATH_MINUTES = mathCourseMinutes(MATH_COURSE);

export interface Programme {
  slug: string;
  hash: string;
  title: string;
  subtitle: string;
  lessons: number;
  hours: number;
  engine: string;
  /** lucide icon key — rendered by the homepage's PROGRAMME_ICONS map. */
  icon: "code" | "database" | "grid" | "sigma" | "cpu";
  hue: string;
  partProjects: number;
}

export const PROGRAMMES: Programme[] = [
  {
    slug: "python",
    hash: "#/course",
    title: "The Complete Python Programming Course",
    subtitle:
      "From your first print to idiomatic Python — ten parts, verified outputs, tiered exercises and a mini project in every part.",
    lessons: PYTHON_LESSONS.length,
    hours: hoursOf(PYTHON_LESSONS.reduce((n, l) => n + l.lesson.minutes, 0)),
    engine: "browser Python",
    icon: "code",
    hue: "var(--dv-viz-1)",
    partProjects: PYTHON_COURSE.parts.length,
  },
  {
    slug: "sql",
    hash: "#/sql",
    title: "The Complete SQL & PostgreSQL Course",
    subtitle:
      "Queries to schema design on real databases — the SQL Lab runs in your browser, and six case studies apply every part.",
    lessons: SQL_LESSONS.length,
    hours: hoursOf(SQL_LESSONS.reduce((n, l) => n + l.lesson.minutes, 0)),
    engine: "in-browser Postgres",
    icon: "database",
    hue: "var(--dv-viz-7)",
    partProjects: SQL_COURSE.parts.length,
  },
  {
    slug: "numpy",
    hash: "#/numpy",
    title: "NumPy: The Complete Course",
    subtitle:
      "Arrays to linear algebra — every function a reference card, every hard idea an interactive visualization.",
    lessons: NUMPY_LESSONS.length,
    hours: hoursOf(NUMPY_LESSONS.reduce((n, l) => n + l.lesson.minutes, 0)),
    engine: "browser Python + NumPy",
    icon: "grid",
    hue: "var(--dv-viz-5)",
    partProjects: NUMPY_COURSE.parts.length,
  },
  {
    slug: "mathematics",
    hash: "#/math",
    title: "Mathematics for Data Science",
    subtitle:
      "The algebra, functions and calculus underneath the models — with a diagnostic that tells you exactly where to start.",
    lessons: MATH_LESSONS.length,
    hours: hoursOf(MATH_MINUTES),
    engine: "interactive labs",
    icon: "sigma",
    hue: "var(--dv-viz-2)",
    partProjects: MATH_COURSE.parts.length,
  },
  {
    slug: "classical-ai",
    hash: "#/classical",
    title: "Classical Artificial Intelligence",
    subtitle:
      "Search, games, constraints, logic, planning and expert systems — the digital textbook, every algorithm implemented by hand.",
    lessons: CLASSICAL_LESSONS.length,
    hours: hoursOf(CLASSICAL_LESSONS.reduce((n, l) => n + l.lesson.minutes, 0)),
    engine: "browser Python",
    icon: "cpu",
    hue: "var(--dv-viz-3)",
    partProjects: CLASSICAL_AI_COURSE.parts.length,
  },
];

export const PROGRAMME_TOTALS = {
  lessons: PROGRAMMES.reduce((n, p) => n + p.lessons, 0),
  exercises: PYTHON_COURSE.parts.reduce((n, p) => n + p.exercises.length, 0) +
    SQL_COURSE.parts.reduce((n, p) => n + p.exercises.length, 0) +
    NUMPY_COURSE.parts.reduce((n, p) => n + p.exercises.length, 0) +
    countClassicalExercises(CLASSICAL_AI_COURSE),
  partProjects: PROGRAMMES.reduce((n, p) => n + p.partProjects, 0),
};
