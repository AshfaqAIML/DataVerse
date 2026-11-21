/**
 * PART D — Knowledge Representation & Reasoning (registry subject J4).
 *
 * Module 1 "Propositional Logic": the connectives with the Wason
 * evidence (d-01), truth tables and the equivalence laws (d-02), the
 * inference rules with the fallacies refuted by table (d-03), and the
 * resolution calculus implemented with a saturation-honest prover
 * (d-04). Module 2 "First-Order Logic and Knowledge": the FOL
 * vocabulary (d-05), quantifier scope and unification (d-06), the
 * five-step pipeline to clauses and the lifted resolution rule with
 * Skolemization (d-07), and knowledge graphs as engineering (d-08).
 * Every `output` is the REAL stdout of running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_D_1 } from "./module-1";
import { MODULE_D_2 } from "./module-2";
import { PART_D_EXERCISES } from "./exercises";
import { PART_D_ASSESSMENT } from "./assessment";
import { PART_D_PROJECT } from "./project";

export const PART_D: ClassicalPart = {
  letter: "D",
  subjectSlug: "knowledge-representation",
  title: "Knowledge Representation & Reasoning",
  tagline: "Propositions, predicates, unification, resolution — knowledge you can inspect and infer from",
  description:
    "Eight lessons, one climb: propositions and their connectives (with the Wason evidence for how badly intuition tracks material implication), truth tables as the systematic referee, inference rules with the classic fallacies refuted row by row — then resolution, the one-rule calculus, proved by hand and implemented with a prover that saturates honestly on non-theorems. First-order logic follows: predicates and terms, quantifier scope with the translation traps it breeds, unification and the most general unifier, the five-step pipeline from quantified formula to clause set, and the lifted resolution rule that makes automated reasoning complete — with the fairness caveat and the semi-decidability limit stated plainly. Knowledge graphs close the arc: what engineered triples enforce, and what they quietly leave undeduced.",
  modules: [MODULE_D_1, MODULE_D_2],
  exercises: PART_D_EXERCISES,
  assessment: PART_D_ASSESSMENT,
  project: PART_D_PROJECT,
};
