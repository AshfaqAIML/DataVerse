/**
 * The Complete Python Programming Course.
 *
 * From absolute beginner ("never written a line of code") to advanced Python:
 * Parts A–J, each with complete lessons, tiered exercises, a chapter
 * assessment and a mini project. Every program output in this course is
 * machine-verified (scripts/verify-course-outputs.ts executes every block
 * with CPython and compares against the claimed output).
 */
import type { Course } from "@/lib/course/types";
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

export const PYTHON_COURSE: Course = {
  slug: "python-programming",
  title: "The Complete Python Programming Course",
  subtitle: "From absolute beginner to advanced Python — every step verified",
  description:
    "A complete journey from your very first line of code to advanced professional Python: fundamentals, control flow, data structures, functions, modules, object-oriented programming, type hints, concurrency, testing, performance, packaging, and a real taste of Python for data science. Every lesson teaches with plain-English explanations, visual diagrams, runnable code with real verified outputs, tiered exercises, a chapter assessment, and a mini project — plus an in-browser Python playground for practicing every example hands-on.",
  level: "Beginner to Advanced",
  audience: "Someone who has never written a line of code",
  parts: [PART_A, PART_B, PART_C, PART_D, PART_E, PART_F, PART_G, PART_H, PART_I, PART_J],
};
