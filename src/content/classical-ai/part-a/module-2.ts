/**
 * MODULE_A_2 — "Heuristic Search" (registry subject J1, module 2).
 *
 * Chapter "Heuristics and Greedy Best-First" carries what a heuristic
 * may promise — admissibility, consistency, relaxation, dominance, the
 * effective branching factor (a-05) — and the algorithm that trusts the
 * estimate alone, traced to its 450-vs-418 failure on Romania (a-06).
 * Chapter "A* and Its Guarantees" carries A* itself: f = g + h traced
 * and run on Romania with the 418 optimum (a-07), then the proof layer —
 * tree-search optimality from admissibility, the consistency requirement
 * for no-reopen graph search, and the stale-g counterexample (a-08).
 */
import type { ClassicalModule } from "@/lib/classicalai/types";
import { LESSON_A_05 } from "./lesson-a-05";
import { LESSON_A_06 } from "./lesson-a-06";
import { LESSON_A_07 } from "./lesson-a-07";
import { LESSON_A_08 } from "./lesson-a-08";

export const MODULE_A_2: ClassicalModule = {
  title: "Heuristic Search",
  summary: "Knowledge compressed into a number: heuristic functions and the algorithms that trust them.",
  chapters: [
    {
      title: "Heuristics and Greedy Best-First",
      focus: "Estimating distance-to-goal and acting on the estimate",
      lessons: [LESSON_A_05, LESSON_A_06],
    },
    {
      title: "A* and Its Guarantees",
      focus: "Cost-so-far plus estimate-to-go: the algorithm route planners still run",
      lessons: [LESSON_A_07, LESSON_A_08],
    },
  ],
};
