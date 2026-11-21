/**
 * PART_D_EXERCISES — the part battery, kept verbatim from the original
 * delivery (machine-verified then, unchanged now). Four exercises
 * spanning the part: table verdicts (b1), CNF by law (i1), MGU
 * judgments (i2), an end-to-end FOL refutation (a1).
 */
import type { Exercise } from "@/lib/course/types";

export const PART_D_EXERCISES: Exercise[] = [
  {
    id: "d-b1",
    tier: "beginner",
    title: "The verdict, by table",
    prompt:
      "Classify (P → Q) ∧ (Q → P) ↔ (P ↔ Q): tautology, contradiction or contingency? Answer by building the table (P, Q, both implications, the biconditional, the outer ↔). Then state the verdict in one sentence.",
    hint: "P ↔ Q is true exactly when P and Q agree; check whether the two sides ever disagree.",
    solution: `Rows (P,Q): (T,T) both sides T. (T,F): implications F and T, conjunction F; biconditional F; F↔F is T. (F,T): symmetric — T. (F,F): both sides T. All four rows T: TAUTOLOGY — 'implies both ways' IS the biconditional, which is exactly why ↔ is defined as the conjunction of the two implications.`,
    concepts: ["truth tables", "biconditional"],
  },
  {
    id: "d-i1",
    tier: "intermediate",
    title: "Convert to CNF by law, not by table",
    prompt:
      "Convert ¬(P → Q) ∨ (R ∧ Q) to conjunctive normal form using the equivalence laws step by step — name each law as you apply it. Finish with clauses as sets of literals.",
    hint: "implication law first, then de Morgan inward, then distribute ∨ over ∧.",
    solution: `¬(P→Q) ∨ (R∧Q)
  = ¬(¬P ∨ Q) ∨ (R ∧ Q)        [implication]
  = (P ∧ ¬Q) ∨ (R ∧ Q)          [de Morgan ×2]
  = ((P ∧ ¬Q) ∨ R) ∧ ((P ∧ ¬Q) ∨ Q)   [distribute ∨ over ∧]
  = (P ∨ R) ∧ (¬Q ∨ R) ∧ (P ∨ Q) ∧ (¬Q ∨ Q)   [distribute each]
  = (P ∨ R) ∧ (¬Q ∨ R) ∧ (P ∨ Q)       [tautology ¬Q ∨ Q removed]
Clauses: {P, R}, {¬Q, R}, {P, Q} — three clauses over three literals' worth of vocabulary, ready for resolution.`,
    concepts: ["CNF", "equivalence laws"],
  },
  {
    id: "d-i2",
    tier: "intermediate",
    title: "MGU or no MGU",
    prompt:
      "For each pair, give the MGU or the failing step: (a) knows(x, milan) with knows(maria, y); (b) p(f(a), g(x)) with p(y, y); (c) q(x, x) with q(a, f(a)). Type three lines, one per part, like `a: {...}`.",
    hint: "(b) asks whether f(a) can equal g(x) — different function symbols never unify. (c) has the repeated-variable trap.",
    solution: `a: {x/maria, y/milan} — crosswise bindings of two unbound variables.
b: no unifier — after {y/f(a)} (or {y/g(x)}), the other argument demands f(a) = g(x): distinct function heads.
c: no unifier — first argument binds x/a; the second then needs a = f(a): occurs-check failure on the constant side... precisely: unify x with a gives {x/a}; then x (now a) vs f(a) is constant vs compound — fails. The occurs check proper fires when the VARIABLE reappears inside; here it fails as head mismatch after the binding. Either way: None.`,
    concepts: ["unification", "MGU", "occurs check"],
  },
  {
    id: "d-a1",
    tier: "advanced",
    title: "A resolution refutation, end to end",
    prompt:
      "Prove by resolution refutation: {∀x (Dog(x) → Barks(x)), Dog(rena)} ⊨ Barks(rena). List every step: clausal form of the premise, the negated goal, each resolution with its unifier, and the empty clause. Then answer: which single unifier did all the work?",
    hint: "Two premise clauses, one negated-goal clause — the refutation is two resolutions long.",
    solution: `Clausal form: Dog(x) → Barks(x) becomes {¬Dog(x), Barks(x)}; Dog(rena) stays {Dog(rena)}. Negate the goal: {¬Barks(rena)}.
1. Resolve {¬Dog(x), Barks(x)} with {Dog(rena)} on Dog: unifier {x/rena} → {Barks(rena)}.
2. Resolve {Barks(rena)} with {¬Barks(rena)} on Barks: unifier {} (identical atoms) → □ (empty clause).
The workhorse is {x/rena}: one MGU instantiates the universal for the individual in question — universal instantiation hiding inside resolution, exactly as the lesson promised.`,
    concepts: ["resolution", "unification", "refutation"],
  },
];
