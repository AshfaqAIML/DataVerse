/**
 * PART E — Classical Planning (registry subject J5).
 *
 * Module 1 "The Planning Language": the STRIPS formalism with the
 * Sussman anomaly solved in code (e-01), the domain/problem layering
 * made executable over a logistics domain (e-02), progression and
 * regression run head-to-head with honest measurements (e-03), and the
 * delete-relaxation heuristic family computed by hand and program
 * (e-04). Module 2 "Graphs and Hierarchies": the anomaly's own
 * planning graph built three proposition levels deep with monotonicity
 * lemmas and polynomial-size honesty (e-05), complete mutex marking
 * with backward extraction and its instructive failure case (e-06),
 * HTN decomposition as method-based planning (e-07), and the deployed
 * history from SHAKEY to factory schedulers (e-08). Every `output` is
 * the REAL stdout of running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_E_1 } from "./module-1";
import { MODULE_E_2 } from "./module-2";
import { PART_E_EXERCISES } from "./exercises";
import { PART_E_ASSESSMENT } from "./assessment";
import { PART_E_PROJECT } from "./project";

export const PART_E: ClassicalPart = {
  letter: "E",
  subjectSlug: "classical-planning",
  title: "Classical Planning",
  tagline:
    "Operators, two search directions, one polynomial graph — the classical planning stack from STRIPS to the deployed world",
  description:
    "Eight lessons, one arc. States as proposition sets and actions as add/delete operators: the STRIPS inheritance, with the Sussman anomaly — the three-block world where greedy subgoal order walks into the undo loop — solved in code on day one. The domain/problem layering that lets one operator library serve many worlds. Then search in two directions: progression forward through the world and regression backward through pre-images, run head-to-head on the same problem with the measurements stated honestly (240 subgoal-sets against 13 states — direction is a bet about where the space is thin). The h-add family: relax the problem until it is easy, and price the relaxation's guarantees. Then the planning graph — Graphplan's alternating levels, mutexes justified by rule citation, level-off as an unsolvability certificate, and backward extraction whose forced failure encodes the anomaly itself. HTNs close the arc: methods as recipes, procedural expertise as first-class data, and the deployed lineage from SHAKEY and Deep Space 1 to the factory floor. The operator library and the replay verifier built here are the project's two engines' shared foundation.",
  modules: [MODULE_E_1, MODULE_E_2],
  exercises: PART_E_EXERCISES,
  assessment: PART_E_ASSESSMENT,
  project: PART_E_PROJECT,
};
