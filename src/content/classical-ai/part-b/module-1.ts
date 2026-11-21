/**
 * MODULE_B_1 — "Games and Minimax" (registry subject J2, module 1).
 *
 * Chapter "Games as Search" carries the formalization (b-01) and the
 * minimax recurrence (b-02); chapter "Reading Game Trees" carries the
 * hand-trace discipline (b-03) and the implementation with verified node
 * counts (b-04). Lesson titles/minutes/summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_B_01 } from "./lesson-b-01";
import { LESSON_B_02 } from "./lesson-b-02";
import { LESSON_B_03 } from "./lesson-b-03";
import { LESSON_B_04 } from "./lesson-b-04";

export const MODULE_B_1: ClassicalModule = {
  title: "Games and Minimax",
  summary: "Two players, one tree: backing up values from leaves to the root.",
  chapters: [
    {
      title: "Games as Search",
      focus: "Adversarial problems and why vanilla search breaks",
      lessons: [LESSON_B_01, LESSON_B_02],
    },
    {
      title: "Reading Game Trees",
      focus: "Hand traces and first implementations",
      lessons: [LESSON_B_03, LESSON_B_04],
    },
  ],
};
