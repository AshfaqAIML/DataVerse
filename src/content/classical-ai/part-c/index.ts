/**
 * PART C — Constraint Satisfaction (registry subject J3).
 *
 * Module 1 "CSPs and Backtracking": the formalization (c-01), the
 * constraint graph (c-02), the hand-trace discipline with counted
 * failures (c-03) and the general engine that reproduces those counts
 * number for number, then adds MRV and degree (c-04). Module 2
 * "Propagation and Structure": forward checking's one-level lookahead
 * (c-05), arc consistency and AC-3 run to the fixpoint (c-06), the
 * measured ordering heuristics (c-07), and the tree-structure results
 * that collapse the bound (c-08). Every `output` is the REAL stdout of
 * running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_C_1 } from "./module-1";
import { MODULE_C_2 } from "./module-2";
import { PART_C_EXERCISES } from "./exercises";
import { PART_C_ASSESSMENT } from "./assessment";
import { PART_C_PROJECT } from "./project";

export const PART_C: ClassicalPart = {
  letter: "C",
  subjectSlug: "constraint-satisfaction",
  title: "Constraint Satisfaction",
  tagline: "Variables, domains, constraints — problems whose answers are assignments, not paths",
  description:
    "Eight lessons, one discipline: problems formalized as constraint networks and drawn as graphs, searched by backtracking traced by hand and then instrumented in code — every placement, rejection and retreat counted and reconciled between paper and program. Propagation then buys foresight (forward checking, arc consistency, AC-3's fixpoint), the orderings are measured rather than believed, and the graph's shape closes the account: trees solve in linear time, nearly-trees nearly do, and general CSPs stay NP-complete — the honest reason practice runs on heuristics plus propagation.",
  modules: [MODULE_C_1, MODULE_C_2],
  exercises: PART_C_EXERCISES,
  assessment: PART_C_ASSESSMENT,
  project: PART_C_PROJECT,
};
