/**
 * MODULE_C_1 — "CSPs and Backtracking" (registry subject J3, module 1).
 *
 * Chapter "Constraint Networks" carries the formalization (c-01) and the
 * constraint graph (c-02); chapter "Backtracking Search" carries the
 * hand-trace discipline (c-03) and the implementation whose plain engine
 * reproduces c-03's counters number for number (c-04). Lesson
 * titles/minutes/summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_C_01 } from "./lesson-c-01";
import { LESSON_C_02 } from "./lesson-c-02";
import { LESSON_C_03 } from "./lesson-c-03";
import { LESSON_C_04 } from "./lesson-c-04";

export const MODULE_C_1: ClassicalModule = {
  title: "CSPs and Backtracking",
  summary: "Variables, domains, constraints — and the depth-first search that respects them.",
  chapters: [
    {
      title: "Constraint Networks",
      focus: "The three-part formalization behind schedulers and Sudokus",
      lessons: [LESSON_C_01, LESSON_C_02],
    },
    {
      title: "Backtracking Search",
      focus: "Depth-first assignment with nothing wasted",
      lessons: [LESSON_C_03, LESSON_C_04],
    },
  ],
};
