/**
 * PART B — Adversarial Search & Games (registry subject J2).
 *
 * Module 1 "Games and Minimax": the formalization (b-01), the recurrence
 * (b-02), three hand-traced games (b-03) and the implementation with
 * verified node counts (b-04). Module 2 "Cutting the Tree": the alpha-beta
 * window (b-05), measured move ordering (b-06), evaluation functions and
 * the horizon (b-07), chance nodes and hidden information (b-08).
 * Every `output` is the REAL stdout of running the code.
 */
import type { ClassicalPart } from "@/lib/classicalai/types";
import { MODULE_B_1 } from "./module-1";
import { MODULE_B_2 } from "./module-2";
import { PART_B_EXERCISES } from "./exercises";
import { PART_B_ASSESSMENT } from "./assessment";
import { PART_B_PROJECT } from "./project";

export const PART_B: ClassicalPart = {
  letter: "B",
  subjectSlug: "adversarial-search-games",
  title: "Adversarial Search & Games",
  tagline: "Game trees, minimax and alpha-beta — search when someone is searching against you",
  description:
    "Eight lessons, one arc: games formalized as trees with two voices, the minimax recurrence traced by hand and implemented with a node counter, the alpha-beta window and the measured dividends of move ordering, then evaluation functions, horizons and the chance nodes that carry the machinery to backgammon tables and card rooms. The move never changes under pruning — only the work — and that theorem, argued by hand and verified by program, is the part's throughline.",
  modules: [MODULE_B_1, MODULE_B_2],
  exercises: PART_B_EXERCISES,
  assessment: PART_B_ASSESSMENT,
  project: PART_B_PROJECT,
};
