/**
 * MODULE_A_3 — "Local Search and Landscapes" (registry subject J1,
 * module 3). Lesson titles/minutes/summaries match the registry exactly.
 *
 * Chapter "Hill Climbing and Its Failures" carries whole-state search:
 * steepest-ascent on 8-queens measured at 13-of-100 solved (a-09) and
 * simulated annealing walking the same starts to 100-of-100 (a-10).
 * Chapter "Comparing Search Families" carries the population version —
 * local beam and its information sharing (a-11) — and the capstone
 * decision framework across all nine algorithms with the complexity
 * ledger on the table (a-12).
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_A_09 } from "./lesson-a-09";
import { LESSON_A_10 } from "./lesson-a-10";
import { LESSON_A_11 } from "./lesson-a-11";
import { LESSON_A_12 } from "./lesson-a-12";

export const MODULE_A_3: ClassicalModule = {
  title: "Local Search and Landscapes",
  summary: "Problems where the path does not matter: search the state itself, not the route to it.",
  chapters: [
    {
      title: "Hill Climbing and Its Failures",
      focus: "Greedy steps on a landscape of values",
      lessons: [LESSON_A_09, LESSON_A_10],
    },
    {
      title: "Comparing Search Families",
      focus: "Choosing a method and defending the choice",
      lessons: [LESSON_A_11, LESSON_A_12],
    },
  ],
};
