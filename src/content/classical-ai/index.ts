/**
 * Classical Artificial Intelligence: The Complete Course (School J).
 *
 * Six parts, one per registry subject — the interactive course stands in
 * for the school's subjects, each part mirroring its registry subject's
 * modules. The registry (src/lib/curriculum/data/schools/j-classical-ai.ts)
 * carries the full 52-lesson public syllabus; this course covers each
 * subject's core lessons with the full textbook treatment — every
 * program output machine-verified, every diagram data-driven.
 */
import type { ClassicalCourse } from "@/lib/classicalai/types";
import { PART_A } from "./part-a";
import { PART_B } from "./part-b";
import { PART_C } from "./part-c";
import { PART_D } from "./part-d";
import { PART_E } from "./part-e";
import { PART_F } from "./part-f";

export const CLASSICAL_AI_COURSE: ClassicalCourse = {
  slug: "classical-ai-complete",
  title: "Classical Artificial Intelligence",
  subtitle: "Search, games, constraints, logic, planning and expert systems — every algorithm implemented by hand",
  description:
    "The symbolic half of artificial intelligence taught as one continuous story: problems become state spaces, search becomes informed, opponents make it adversarial, constraints change the formalism, logic makes knowledge inspectable, actions become operators, and probability completes the arc. Every algorithm in this course is written as pseudocode first, implemented in Python second, and every claimed output is the real output of running it.",
  level: "Intermediate to Advanced",
  audience:
    "Python-literate learners who want the classical foundations — the ideas behind verifiers, planners, schedulers and game engines — implemented by hand, with guarantees argued and measured",
  parts: [PART_A, PART_B, PART_C, PART_D, PART_E, PART_F],
};
