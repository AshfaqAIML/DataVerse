/**
 * NumPy: The Complete Course.
 *
 * NumPy taught as a complete subject — not a function cheat sheet: Parts A–J
 * take the learner from "what is numerical computing?" through arrays,
 * indexing, broadcasting, vectorization, statistics, randomness, linear
 * algebra, files and performance. Every lesson carries a full function
 * reference card set, interactive array visualizations, tiered exercises,
 * a chapter assessment and a real-world mini project.
 *
 * Every program output in this course is machine-verified against the SAME
 * NumPy build the in-browser playground runs (numpy 2.0.2, Python 3.12) —
 * scripts/verify-numpy-outputs.ts executes every block and compares
 * against the claimed output.
 */
import type { NumpyCourse } from "@/lib/numpycourse/types";
import { PART_A } from "./part-a";
import { PART_B } from "./part-b";
import { PART_C } from "./part-c";
import { PART_D } from "./part-d";
import { PART_E } from "./part-e";
import { PART_F } from "./part-f";
import { PART_G } from "./part-g";
import { PART_H } from "./part-h";
import { PART_I } from "./part-i";
import { PART_J } from "./part-j";

export const NUMPY_COURSE: NumpyCourse = {
  slug: "numpy-complete",
  title: "NumPy: The Complete Course",
  subtitle: "Arrays to linear algebra — every function, every idea, every output verified",
  description:
    "A complete journey through numerical Python: what NumPy is and why it exists, the ndarray and its attributes, every way to create arrays, data types, dimensions and shapes, indexing and slicing, views vs copies, boolean and fancy indexing, sorting and searching, broadcasting, vectorization, mathematical and statistical operations, aggregations, random numbers, linear algebra from dot products to eigenvalues, missing data and NaN handling, file I/O, and performance optimization. Every function gets a complete reference card — purpose, syntax, parameters, return value, verified example, common mistakes, related functions and practical applications — and every hard idea gets an interactive visualization you can click, step and experiment with.",
  level: "Beginner to Advanced",
  audience: "Python learners who want to master the engine underneath data science, ML and scientific computing",
  parts: [PART_A, PART_B, PART_C, PART_D, PART_E, PART_F, PART_G, PART_H, PART_I, PART_J],
};
