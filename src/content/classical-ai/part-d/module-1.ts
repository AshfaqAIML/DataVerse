/**
 * MODULE_D_1 — "Propositional Logic" (registry subject J4, module 1).
 *
 * Chapter "Propositions and Truth" carries the connectives and the
 * translation discipline (d-01) and the truth-table machinery of
 * equivalence (d-02); chapter "Deduction" carries the inference rules
 * with the classic fallacies refuted (d-03) and the resolution calculus
 * implemented (d-04). Lesson titles/minutes/summaries match the
 * registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_D_01 } from "./lesson-d-01";
import { LESSON_D_02 } from "./lesson-d-02";
import { LESSON_D_03 } from "./lesson-d-03";
import { LESSON_D_04 } from "./lesson-d-04";

export const MODULE_D_1: ClassicalModule = {
  title: "Propositional Logic",
  summary: "Facts, connectives, truth — the smallest logic that still means something.",
  chapters: [
    {
      title: "Propositions and Truth",
      focus: "Symbols, connectives and the laws they satisfy",
      lessons: [LESSON_D_01, LESSON_D_02],
    },
    {
      title: "Deduction",
      focus: "From premises to conclusions by rule",
      lessons: [LESSON_D_03, LESSON_D_04],
    },
  ],
};
