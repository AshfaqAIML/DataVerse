/**
 * PART A — Search & Problem Solving (registry subject J1).
 *
 * The foundation subject at full registry depth: twelve lessons in three
 * modules. Module 1 formulates problems as state spaces (the five-tuple
 * over the Romania map, the eight-puzzle and the crossing problem) and
 * searches them blind — BFS, uniform-cost with the equal-costs
 * counterexample, DFS and iterative deepening with the 111,111-vs-123,456
 * arithmetic measured both ways. Module 2 buys knowledge: heuristic
 * functions with admissibility argued per relaxation, greedy best-first
 * traced to its 450-vs-418 failure, A* traced and run to the 418
 * optimum, and the proof layer — tree-search optimality from
 * admissibility, the consistency requirement with the stale-g
 * counterexample computed by all three engines (tree 8, no-reopen 9,
 * reopen 8). Module 3 turns to landscapes: steepest-ascent measured at
 * 13-of-100, annealing at 100-of-100 on the same starts, local beam's
 * information sharing, and the nine-algorithm decision framework. Every
 * `output` is the REAL stdout of running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_A_1 } from "./module-1";
import { MODULE_A_2 } from "./module-2";
import { MODULE_A_3 } from "./module-3";
import { PART_A_EXERCISES } from "./exercises";
import { PART_A_ASSESSMENT } from "./assessment";
import { PART_A_PROJECT } from "./project";

export const PART_A: ClassicalPart = {
  letter: "A",
  subjectSlug: "search-problem-solving",
  title: "Search & Problem Solving",
  tagline:
    "State spaces, heuristic search and local search — the foundation every later subject stands on",
  description:
    "The subject that teaches the platform's oldest idea: a problem is a state space, and solving is searching it. Module 1 builds the five-tuple — states, successor function, goal test, cost — on three famous problems, then searches blind: breadth-first and uniform-cost with the guarantees each buys, depth-first with its tiny memory footprint, and iterative deepening restoring optimality for an 11% regeneration premium. Module 2 compresses knowledge into a number: heuristic functions argued honest by relaxation, greedy best-first showing exactly what g-blindness costs on the Romania map, A* combining exact cost-so-far with admissible estimate-to-go to the 418 optimum, and the proof layer separating when admissibility suffices from when graph search needs consistency — with the counterexample run three ways. Module 3 searches the state itself: hill climbing's 87% measured failure rate, annealing's probability calculus walking the same starts to 100%, beam search's shared successor pools, and the closing decision framework that chooses among all nine algorithms with the costs honestly on the table. Every number in every program is real, run and verified.",
  modules: [MODULE_A_1, MODULE_A_2, MODULE_A_3],
  exercises: PART_A_EXERCISES,
  assessment: PART_A_ASSESSMENT,
  project: PART_A_PROJECT,
};
