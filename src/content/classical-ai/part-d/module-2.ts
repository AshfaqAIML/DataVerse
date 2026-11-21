/**
 * MODULE_D_2 — "First-Order Logic and Knowledge" (registry subject J4, module 2).
 *
 * Chapter "Predicates and Quantifiers" carries the FOL vocabulary (d-05)
 * and quantifier scope with unification (d-06); chapter "Reasoning at
 * Scale" carries the lifted resolution calculus with Skolemization (d-07)
 * and knowledge graphs as engineering (d-08). Lesson titles/minutes/
 * summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_D_05 } from "./lesson-d-05";
import { LESSON_D_06 } from "./lesson-d-06";
import { LESSON_D_07 } from "./lesson-d-07";
import { LESSON_D_08 } from "./lesson-d-08";

export const MODULE_D_2: ClassicalModule = {
  title: "First-Order Logic and Knowledge",
  summary: "Objects, relations and quantifiers — and knowledge representation at scale.",
  chapters: [
    {
      title: "Predicates and Quantifiers",
      focus: "The logic of objects and relations",
      lessons: [LESSON_D_05, LESSON_D_06],
    },
    {
      title: "Reasoning at Scale",
      focus: "Machine proof and engineered knowledge",
      lessons: [LESSON_D_07, LESSON_D_08],
    },
  ],
};
