/**
 * MODULE_C_2 — "Propagation and Structure" (registry subject J3, module 2).
 *
 * Chapter "Consistency" carries forward checking's one-level lookahead
 * (c-05) and arc consistency's fixpoint, AC-3 (c-06); chapter "Exploiting
 * Structure" carries the measured ordering heuristics on the c-04 engine
 * (c-07) and the tree/decomposition results that collapse the bound (c-08).
 * Lesson titles/minutes/summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_C_05 } from "./lesson-c-05";
import { LESSON_C_06 } from "./lesson-c-06";
import { LESSON_C_07 } from "./lesson-c-07";
import { LESSON_C_08 } from "./lesson-c-08";

export const MODULE_C_2: ClassicalModule = {
  title: "Propagation and Structure",
  summary: "Reasoning ahead of the search, and the graph shapes that make problems easy.",
  chapters: [
    {
      title: "Consistency",
      focus: "Prune the future before it becomes the present",
      lessons: [LESSON_C_05, LESSON_C_06],
    },
    {
      title: "Exploiting Structure",
      focus: "Not all constraint graphs are equally hard",
      lessons: [LESSON_C_07, LESSON_C_08],
    },
  ],
};
