/**
 * PART F — Expert Systems & Uncertainty (registry subject J6).
 *
 * Module 1 "Expert Systems": the production-system architecture with the
 * conflict-resolution question raised (f-01), the forward loop measured
 * over a ten-rule triage base with the Rete idea priced (f-02), backward
 * chaining with the WHY/HOW explanation trace over the same base (f-03),
 * and the MYCIN/XCON history with the certainty-factor post-mortem that
 * pivots the module (f-04). Module 2 "Reasoning Under Uncertainty": the
 * probability axioms with every consequence licensed (f-05), Bayes' rule
 * derived, drilled and compounded — 17%, the cab's 41%, odds, sequential
 * updating (f-06), the canonical alarm network with d-separation's three
 * patterns (f-07), and enumeration inference computed to 0.284 with the
 * school's closing synthesis (f-08). Every `output` is the REAL stdout of
 * running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_F_1 } from "./module-1";
import { MODULE_F_2 } from "./module-2";
import { PART_F_EXERCISES } from "./exercises";
import { PART_F_ASSESSMENT } from "./assessment";
import { PART_F_PROJECT } from "./project";

export const PART_F: ClassicalPart = {
  letter: "F",
  subjectSlug: "expert-systems-uncertainty",
  title: "Expert Systems & Uncertainty",
  tagline:
    "Rules, traces, and the honest turn to probability — the expert-system arc end to end",
  description:
    "Eight lessons, one arc. The production system: IF-THEN as a knowledge format, the recognize-act interpreter, and the conflict-resolution strategies that make firing order a design decision — measured over a ten-rule triage base, with the Rete idea priced as the speed-up that carried rule engines to industry scale. Then the explanation contract: backward chaining whose WHY/HOW traces are the feature that made clinicians trust MYCIN, and the knowledge-engineering history — XCON's ten thousand rules, the maintenance crisis, and certainty factors' three structural flaws — that pivots the course from all-or-nothing logic to degrees of belief. The rebuild: the probability axioms with every consequence licensed, Bayes' rule derived in two lines and drilled on the examples every analyst should have in their fingers (the 17% posterior, the cab witness, the odds form, sequential updating), and Bayesian networks — the canonical alarm network, d-separation's three patterns, and a posterior computed by enumeration to 0.284 with every term shown. The rule trace and the probability table share one spine: every conclusion shows its work.",
  modules: [MODULE_F_1, MODULE_F_2],
  exercises: PART_F_EXERCISES,
  assessment: PART_F_ASSESSMENT,
  project: PART_F_PROJECT,
};
