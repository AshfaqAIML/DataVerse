/**
 * MODULE_F_2 — "Reasoning Under Uncertainty" (registry subject J6, module 2).
 *
 * Chapter "Probability as Degrees of Belief" rebuilds inference for a
 * noisy world: the three axioms and their licensed consequences (f-05),
 * then Bayes' rule derived and drilled — the base-rate lesson, the odds
 * form, sequential updating (f-06). Chapter "Networks" engineers
 * independence into a graph: the canonical alarm network with
 * d-separation's three patterns (f-07), then enumeration inference
 * computed to 0.284 on it and the school's closing synthesis (f-08).
 * Lesson titles/minutes/summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_F_05 } from "./lesson-f-05";
import { LESSON_F_06 } from "./lesson-f-06";
import { LESSON_F_07 } from "./lesson-f-07";
import { LESSON_F_08 } from "./lesson-f-08";

export const MODULE_F_2: ClassicalModule = {
  title: "Reasoning Under Uncertainty",
  summary:
    "From all-or-nothing logic to degrees of belief — and the networks that make them tractable.",
  chapters: [
    {
      title: "Probability as Degrees of Belief",
      focus: "The calculus that replaced certainty factors",
      lessons: [LESSON_F_05, LESSON_F_06],
    },
    {
      title: "Networks",
      focus: "Independence engineered into a graph",
      lessons: [LESSON_F_07, LESSON_F_08],
    },
  ],
};
