/**
 * Mathematics for Data Science — course assembly.
 *
 * Content lives in typed data files, one per part (mirroring the Python and
 * SQL courses). Every Python output in every part is machine-verified by
 * scripts/verify-math-outputs.ts; every lesson carries all ten pedagogical
 * steps, enforced by the same script.
 */
import type { MathCourse } from "@/lib/mathcourse/types";
import { partA } from "./part-a";
import { MATH_DIAGNOSTIC } from "./diagnostic";

export { MATH_DIAGNOSTIC };

export const MATH_COURSE: MathCourse = {
  slug: "math",
  title: "Mathematics for Data Science",
  subtitle: "From school foundations to gradients and eigenvectors — for people who never trusted math",
  description:
    "The complete mathematics of data science, rebuilt for the math-anxious: every topic starts with an everyday " +
    "scene, then plain words, then the proper names, then pictures you can move, then derivations with no leaps, " +
    "worked numbers, real Python, and the exact place machine learning uses it. A prerequisite diagnostic places " +
    "you honestly, and an adaptive revision radar walks you back through anything shaky — always in dependency order.",
  parts: [
    partA,
    // partB, partC, partD, partE — assembled as parts land (authoring in flight)
  ],
  diagnostic: MATH_DIAGNOSTIC,
};
