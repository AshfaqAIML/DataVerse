/**
 * MODULE_E_2 — "Graphs and Hierarchies" (registry subject J5, module 2).
 *
 * Chapter "The Planning Graph" carries the anomaly's own planning graph
 * built three proposition levels deep with monotonicity lemmas and
 * polynomial-size honesty (e-05) and the complete mutex marking with
 * backward extraction including its instructive failure case (e-06);
 * chapter "Hierarchies" carries HTN decomposition as method-based
 * planning (e-07) and the deployment history from SHAKEY to factory
 * schedulers (e-08). Lesson titles/minutes/summaries match the
 * registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_E_05 } from "./lesson-e-05";
import { LESSON_E_06 } from "./lesson-e-06";
import { LESSON_E_07 } from "./lesson-e-07";
import { LESSON_E_08 } from "./lesson-e-08";

export const MODULE_E_2: ClassicalModule = {
  title: "Graphs and Hierarchies",
  summary: "Graphplan's planning graph and the HTN answer to scale.",
  chapters: [
    {
      title: "The Planning Graph",
      focus: "A polynomial structure that thinks about all plans at once",
      lessons: [LESSON_E_05, LESSON_E_06],
    },
    {
      title: "Hierarchies",
      focus: "Abstract tasks, decompositions and the deployed world",
      lessons: [LESSON_E_07, LESSON_E_08],
    },
  ],
};
