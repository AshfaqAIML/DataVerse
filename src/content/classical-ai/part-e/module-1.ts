/**
 * MODULE_E_1 — "The Planning Language" (registry subject J5, module 1).
 *
 * Chapter "Actions as Operators" carries the STRIPS formalism with the
 * Sussman anomaly solved in code (e-01) and the domain/problem layering
 * made executable (e-02); chapter "Search in Planning Space" carries
 * progression and regression run head-to-head with honest measurements
 * (e-03) and the delete-relaxation heuristic family computed by hand
 * and program (e-04). Lesson titles/minutes/summaries match the
 * registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_E_01 } from "./lesson-e-01";
import { LESSON_E_02 } from "./lesson-e-02";
import { LESSON_E_03 } from "./lesson-e-03";
import { LESSON_E_04 } from "./lesson-e-04";

export const MODULE_E_1: ClassicalModule = {
  title: "The Planning Language",
  summary: "States as propositions, actions as operators: the STRIPS inheritance.",
  chapters: [
    {
      title: "Actions as Operators",
      focus: "Preconditions, add lists, delete lists",
      lessons: [LESSON_E_01, LESSON_E_02],
    },
    {
      title: "Search in Planning Space",
      focus: "Progression, regression and distance heuristics",
      lessons: [LESSON_E_03, LESSON_E_04],
    },
  ],
};
