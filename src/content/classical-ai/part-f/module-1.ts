/**
 * MODULE_F_1 — "Expert Systems" (registry subject J6, module 1).
 *
 * Chapter "Production Systems" carries the architecture — rules as a
 * knowledge format, the recognize-act interpreter, and the
 * conflict-resolution question (f-01) — then answers it in code over a
 * ten-rule triage base, with the Rete idea priced (f-02). Chapter
 * "Explanation and Engineering" carries goal-driven reasoning with the
 * WHY/HOW trace implemented over the same rule base (f-03), and the
 * documented MYCIN/XCON history with the certainty-factor post-mortem
 * (f-04). Lesson titles/minutes/summaries match the registry exactly.
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_F_01 } from "./lesson-f-01";
import { LESSON_F_02 } from "./lesson-f-02";
import { LESSON_F_03 } from "./lesson-f-03";
import { LESSON_F_04 } from "./lesson-f-04";

export const MODULE_F_1: ClassicalModule = {
  title: "Expert Systems",
  summary: "Rules as knowledge: the architecture that carried AI into industry.",
  chapters: [
    {
      title: "Production Systems",
      focus: "Working memory, rules and the recognize-act cycle",
      lessons: [LESSON_F_01, LESSON_F_02],
    },
    {
      title: "Explanation and Engineering",
      focus: "Why the clinician trusted MYCIN",
      lessons: [LESSON_F_03, LESSON_F_04],
    },
  ],
};
