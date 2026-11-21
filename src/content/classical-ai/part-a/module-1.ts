/**
 * MODULE_A_1 — "State Spaces and Problem Formulation" (registry subject J1,
 * module 1). Lesson titles/minutes/summaries match the registry exactly.
 *
 * Chapter "Problems as State Spaces" carries the five-tuple and its
 * dissection: the exemplar formulation lesson (a-01, rebuilt on the
 * Romania map, the eight-puzzle and the crossing problem) and the
 * anatomy lesson that names each component and its properties (a-02).
 * Chapter "Uninformed Search" carries the frontier abstraction: BFS and
 * uniform-cost with the equal-costs counterexample and the Romania UCS
 * run (a-03), then DFS's memory discipline and iterative deepening's
 * regeneration arithmetic (a-04).
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_A_01 } from "./lesson-a-01";
import { LESSON_A_02 } from "./lesson-a-02";
import { LESSON_A_03 } from "./lesson-a-03";
import { LESSON_A_04 } from "./lesson-a-04";

export const MODULE_A_1: ClassicalModule = {
  title: "State Spaces and Problem Formulation",
  summary: "Before any algorithm: what a state is, what an operator does, and what counts as a solution.",
  chapters: [
    {
      title: "Problems as State Spaces",
      focus: "The five-part formalization every search algorithm assumes",
      lessons: [LESSON_A_01, LESSON_A_02],
    },
    {
      title: "Uninformed Search",
      focus: "Searching with no knowledge beyond the problem itself",
      lessons: [LESSON_A_03, LESSON_A_04],
    },
  ],
};
