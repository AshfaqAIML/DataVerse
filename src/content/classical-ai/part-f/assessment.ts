/**
 * PART_F_ASSESSMENT — the part checkpoint (10 questions, both modules).
 * f-as-1..6 are the original delivery's questions, kept verbatim;
 * f-as-7..10 were added at full registry depth (module 1: f-01/f-03
 * material; module 2: f-05/f-08 material).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_F_ASSESSMENT: QuizQuestion[] = [
  {
    id: "f-as-1",
    prompt: "The recognize-act cycle's stopping condition (absent a halt rule) is:",
    options: [
      { text: "All rules have fired exactly once", correct: false, feedback: "Rules can legitimately fire multiple times if their conclusions are retracted or new instances match — and non-matching rules never fire at all." },
      { text: "Quiescence: no rule's conditions are satisfiable, so no new conclusions can be derived", correct: true, feedback: "Correct — the fixpoint of the rule base over working memory; the loop's natural, honest end." },
      { text: "Working memory reaches capacity", correct: false, feedback: "An engineering limit, not the formal stopping rule." },
      { text: "The goal rule fires", correct: false, feedback: "Goal-halting is a policy layered on top (and backward chaining's native mode); the cycle itself runs to quiescence." },
    ],
    explanation: "Quiescence is the production system's fixpoint — matched by no rule, changed by nothing.",
  },
  {
    id: "f-as-2",
    prompt: "Conflict resolution by specificity prefers:",
    options: [
      { text: "The rule that has fired least recently", correct: false, feedback: "That is a fairness heuristic, not specificity." },
      { text: "The rule matching the most conditions — the most specific pattern", correct: true, feedback: "Correct — the rule that says the most about the current situation; the standard default because it encodes 'narrower knowledge beats broader knowledge'." },
      { text: "The rule with the most recent facts in its match", correct: false, feedback: "That is recency — a different strategy with different (sometimes opposite) verdicts." },
      { text: "The rule written first by the domain expert", correct: false, feedback: "Priority ordering — legitimate, but it is not specificity." },
    ],
    explanation: "Three strategies, three different orderings of the same conflict set — and the trace (sometimes the conclusions) that follow.",
  },
  {
    id: "f-as-3",
    prompt: "MYCIN's certainty factors were unsatisfactory chiefly because:",
    options: [
      { text: "They were too slow to compute", correct: false, feedback: "CF arithmetic is trivially cheap — the complaint was semantic, not computational." },
      { text: "They lacked probabilistic semantics: combination rules could contradict the probability axioms and silently assumed independence", correct: true, feedback: "Correct — plausible-looking formulas without grounding; order-dependent combination and the implicit independence assumption were the structural flaws that Bayesian networks repaired." },
      { text: "Clinicians could not understand the explanations", correct: false, feedback: "The explanations were MYCIN's celebrated success — the trust problem was elsewhere." },
      { text: "They could not represent negative evidence", correct: false, feedback: "CFs ran from −1 to +1; negative evidence was representable." },
    ],
    explanation: "The certainty-factor era died of semantics, not speed: ad-hoc combination versus the probability axioms — the pivot of this whole module.",
  },
  {
    id: "f-as-4",
    prompt: "P(+|D) = 0.99, P(+|¬D) = 0.05, P(D) = 0.01. The posterior P(D|+) is closest to:",
    options: [
      { text: "0.99 — the test is 99% sensitive", correct: false, feedback: "The transposed conditional — the fallacy this computation exists to correct." },
      { text: "0.95 — the complement of the false-positive rate", correct: false, feedback: "Another transposition: 0.95 is P(¬D|+) territory only if the base rates were even — they are not." },
      { text: "0.17 — the base rates outvote the test's accuracy", correct: true, feedback: "Correct: 0.0099/0.0594 ≈ 0.167. One in six." },
      { text: "0.01 — the prior never moves", correct: false, feedback: "Evidence always revises the prior — the question is by how much, and Bayes is the arithmetic of how much." },
    ],
    explanation: "The number every diagnostic example exists to install: 17% — accurate test, rare condition, honest arithmetic.",
  },
  {
    id: "f-as-5",
    prompt: "In the alarm network, observing Alarm = true makes Burglary and Earthquake:",
    options: [
      { text: "Independent — no edge connects them", correct: false, feedback: "That is their MARGINAL relation; the observation opens the collider." },
      { text: "Dependent — explaining away: each cause's presence discounts the other", correct: true, feedback: "Correct — the collider pattern: B → A ← E opens under conditioning on A, and the causes compete to explain the evidence." },
      { text: "Independent given the alarm — it screens them off", correct: false, feedback: "Screening-off is the chain/fork rule; the collider inverts it." },
      { text: "Dependent only if John also calls", correct: false, feedback: "J's call adds evidence about A, not about the B–E path — the dependence is born at the observation of A itself." },
    ],
    explanation: "B → A ← E observed at A: the pattern d-separation's beginner-rule gets exactly backwards — and the diagnostician's daily tool.",
  },
  {
    id: "f-as-6",
    prompt: "The factorization P(X1,…,Xn) = Π P(Xi|Parents(Xi)) saves numbers because:",
    options: [
      { text: "Each CPT has one row", correct: false, feedback: "Roots have one row; children have one per parent combination — the saving is structural, not per-table." },
      { text: "Each variable conditions on a few parents instead of all predecessors: n·2^k numbers replace 2^n", correct: true, feedback: "Correct — and the DAG asserts exactly the independences this factorization needs: every non-parent is conditionally irrelevant given the parents." },
      { text: "Probabilities are normalized away", correct: false, feedback: "Normalization is bookkeeping at the end of inference; the numbers existed in full either way." },
      { text: "The graph prunes impossible worlds", correct: false, feedback: "Impossible (zero-probability) worlds are a special case, not the mechanism." },
    ],
    explanation: "Structure is compression: the graph says which variables each one needs, and the CPTs obey.",
  },
  {
    id: "f-as-7",
    prompt: "A production rule base differs from an equivalent hand-written if/else program chiefly in that:",
    options: [
      { text: "Rules execute faster than compiled conditionals", correct: false, feedback: "If anything the interpreter adds overhead — performance was never the point." },
      { text: "Rules are declarative knowledge: each one independently auditable by a domain expert, and reusable under different control strategies", correct: true, feedback: "Correct — knowledge separated from control: the rule says WHAT is true, the interpreter decides WHEN and in what order to use it. That separation is what made knowledge acquisition and explanation possible." },
      { text: "Rules can represent uncertainty natively, while if/else cannot", correct: false, feedback: "Plain production rules are all-or-nothing — uncertainty needed the CF patch, which is this module's cautionary tale." },
      { text: "Rule bases cannot loop, while programs can", correct: false, feedback: "Rules can loop (mutually retracting support) — cycle detection is the standard guard." },
    ],
    explanation: "Knowledge versus control: the production system's whole bet — and the property XCON's ten thousand rules lived and died by.",
  },
  {
    id: "f-as-8",
    prompt: "Backward chaining is the better engine when:",
    options: [
      { text: "Data arrives continuously and you want every conclusion the facts support", correct: false, feedback: "That is forward chaining's home ground — monitoring and configuration." },
      { text: "Facts are expensive or risky to collect, and one goal matters — ask only what the goal's derivation needs", correct: true, feedback: "Correct — MYCIN's situation: don't run every test; ask for exactly the evidence the therapy decision's derivation tree requires, then explain it." },
      { text: "The rule base is smaller than ten rules", correct: false, feedback: "Size is not the axis — direction is; tiny bases can still have expensive facts." },
      { text: "No conclusion will ever need explaining", correct: false, feedback: "Backward chaining produces the explanation trace most naturally — the WHY/HOW goal stack is its by-product." },
    ],
    explanation: "Direction is a bet about where the space is thin: forward from cheap data, or backward from the one question that matters.",
  },
  {
    id: "f-as-9",
    prompt: "Which of these is NOT one of the three axioms of probability?",
    options: [
      { text: "Non-negativity: P(A) ≥ 0 for every event", correct: false, feedback: "An axiom — the first one." },
      { text: "Normalization: P(Ω) = 1", correct: false, feedback: "An axiom — the second one." },
      { text: "Additivity: P(A ∪ B) = P(A) + P(B) for disjoint events", correct: false, feedback: "An axiom — the third one (finite additivity in this course's treatment)." },
      { text: "Monotonicity: A ⊆ B implies P(A) ≤ P(B)", correct: true, feedback: "Correct — it is a THEOREM: write B as the disjoint union of A and B∖A, apply additivity, drop the non-negative remainder. Derived, not assumed." },
    ],
    explanation: "Three axioms, everything else licensed: complement, inclusion-exclusion, monotonicity — all consequences, which is why they can be used without ever being assumed.",
  },
  {
    id: "f-as-10",
    prompt: "The line from MYCIN's certainty factors to today's probabilistic expert systems runs through:",
    options: [
      { text: "Larger rule bases — scale fixed what the calculus lacked", correct: false, feedback: "XCON had ten thousand rules and the semantics never improved — scale amplified the problem." },
      { text: "Replacing ad-hoc combination with the probability axioms, and independence made explicit as graph structure", correct: true, feedback: "Correct — Bayes' rule gives belief revision its semantics; the Bayesian network makes the independence assumptions visible, checkable, and cheap to compute with. Two repairs, one formalism." },
      { text: "Replacing rules with learned classifiers", correct: false, feedback: "Machine learning is a different lineage — the expert-system line's own repair was probabilistic, and it kept the explanation trace." },
      { text: "Tuning the CF combination formulas more carefully", correct: false, feedback: "Order dependence and silent independence are structural — no amount of tuning removes them, which is the lesson f-04's example demonstrates with two numbers." },
    ],
    explanation: "Semantics, not scale: the same IF-THEN knowledge, now carrying probabilities that obey the axioms — with the graph wearing the assumptions on its sleeve.",
  },
];
