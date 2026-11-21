/**
 * MODULE_B_2 — "Cutting the Tree" (registry subject J2, module 2).
 *
 * Chapter "Alpha-Beta Pruning": the window (b-05) and measured move
 * ordering (b-06). Chapter "Playing Well in Practice": evaluation
 * functions and the horizon (b-07), chance and hidden information (b-08).
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_B_05 } from "./lesson-b-05";
import { LESSON_B_06 } from "./lesson-b-06";
import { LESSON_B_07 } from "./lesson-b-07";
import { LESSON_B_08 } from "./lesson-b-08";

export const MODULE_B_2: ClassicalModule = {
  title: "Cutting the Tree",
  summary: "Alpha-beta pruning, move ordering, and the practical machinery of game programs.",
  chapters: [
    {
      title: "Alpha-Beta Pruning",
      focus: "Never search a branch that cannot change the decision",
      lessons: [LESSON_B_05, LESSON_B_06],
    },
    {
      title: "Playing Well in Practice",
      focus: "Depth limits, evaluation and chance",
      lessons: [LESSON_B_07, LESSON_B_08],
    },
  ],
};
