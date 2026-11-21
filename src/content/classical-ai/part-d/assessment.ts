/**
 * PART_D_ASSESSMENT — the part battery, kept verbatim from the original
 * delivery. Six questions in the exam register spanning both modules:
 * connectives (1), quantifiers (2), resolution (3–4), knowledge graphs
 * (5), semi-decidability (6).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_D_ASSESSMENT: QuizQuestion[] = [
  {
    id: "d-as-1",
    prompt: "P → Q is false in exactly one world. Which?",
    options: [
      { text: "P true, Q false", correct: true, feedback: "Correct — promise made, promise broken; the row ¬P ∨ Q also fails on, and the only one." },
      { text: "P false, Q true", correct: false, feedback: "Vacuously true." },
      { text: "P false, Q false", correct: false, feedback: "Vacuously true." },
      { text: "P true, Q true", correct: false, feedback: "True the ordinary way." },
    ],
    explanation: "One failing row is implication's entire personality — every equivalence involving → traces back to it.",
  },
  {
    id: "d-as-2",
    prompt: "¬∀x (Bird(x) → Flies(x)) is equivalent to:",
    options: [
      { text: "∀x (Bird(x) → ¬Flies(x)) — no bird flies", correct: false, feedback: "Too strong: the negation of 'all fly' is 'at least one doesn't', not 'none do'." },
      { text: "∃x (Bird(x) ∧ ¬Flies(x)) — some bird doesn't fly", correct: true, feedback: "Correct — negation crosses ∀ flipping it to ∃, and ¬(A→B) ≡ A∧¬B turns the implication into the conjunction." },
      { text: "∃x (Bird(x) → ¬Flies(x))", correct: false, feedback: "∃-with-→: nearly always vacuity, not the intended reading." },
      { text: "∀x ¬(Bird(x) ∧ Flies(x))", correct: false, feedback: "That says no bird flies at all — stronger than the original's negation." },
    ],
    explanation: "Two laws in one step: quantifier flip plus implication negation — the movement every normal-form conversion rehearses.",
  },
  {
    id: "d-as-3",
    prompt: "The resolution rule, applied to {¬P, Q} and {¬Q, R}, yields:",
    options: [
      { text: "{¬P, R}", correct: true, feedback: "Correct — resolve away the complementary pair Q/¬Q, keeping the remaining literals: the resolvent." },
      { text: "{P, ¬R}", correct: false, feedback: "That is the resolvent of the NEGATED clauses — signs flipped." },
      { text: "{¬P, Q, ¬Q, R}", correct: false, feedback: "Union, not resolution: resolution DELETES the complementary pair." },
      { text: "Nothing — the clauses share no literal", correct: false, feedback: "They share Q — complementary, which is exactly what resolution consumes." },
    ],
    explanation: "Resolve on one complementary pair, keep the rest: the one-rule calculus that powers the next lesson's prover.",
  },
  {
    id: "d-as-4",
    prompt: "Skolemization replaces ∃x P(x, y) under an enclosing ∀y with:",
    options: [
      { text: "A fresh constant c: P(c, y)", correct: false, feedback: "Constants replace existentials with NO enclosing universal — the witness here may depend on y." },
      { text: "A fresh function f: P(f(y), y)", correct: true, feedback: "Correct — the Skolem FUNCTION encodes the dependence: for each y there exists a witness, possibly different per y." },
      { text: "A fresh variable z: P(z, y)", correct: false, feedback: "Variables are what the quantifiers bound; Skolemization removes quantifiers by naming witnesses, not by renaming." },
      { text: "The universal ∀y itself", correct: false, feedback: "The universal stays; the existential is what gets a name." },
    ],
    explanation: "Constant vs function is the exam question: the witness's dependencies decide which, and getting it wrong changes satisfiability.",
  },
  {
    id: "d-as-5",
    prompt: "A knowledge graph query returns no matches for teaches(ada, bilal). The logically careful conclusion:",
    options: [
      { text: "Ada does not teach Bilal", correct: false, feedback: "Only in a closed, validated world; triple stores are open by default." },
      { text: "The graph does not contain that triple — absence of evidence, not evidence of absence", correct: true, feedback: "Correct — the confident-silence principle; conclusions require the schema plus ingestion guarantees, never the store alone." },
      { text: "The ontology rejected it", correct: false, feedback: "Rejection happens at write time and is invisible to a later query — unless the store surfaces audit logs." },
      { text: "Bilal is not a Course", correct: false, feedback: "A range violation would be one REASON for rejection — but the query itself establishes no such thing." },
    ],
    explanation: "Open-world silence is the graph's default semantics; closed-world conclusions are bought with validation pipelines.",
  },
  {
    id: "d-as-6",
    prompt: "Resolution with unification is refutation-complete for first-order logic. The practical caveat:",
    options: [
      { text: "It only works on Horn clauses", correct: false, feedback: "Horn restriction buys efficiency (Prolog); completeness holds for full clausal logic." },
      { text: "Completeness means the empty clause WILL be derived when entailed — but when NOT entailed, the procedure may run forever (semi-decidability)", correct: true, feedback: "Correct — completeness is a one-directional promise; non-theorems saturate or diverge, and telling which apart is undecidable in general." },
      { text: "It requires the occurs check to be disabled", correct: false, feedback: "The reverse: disabling it manufactures bogus unifications." },
      { text: "It only holds for propositional logic", correct: false, feedback: "Lifting with MGUs is exactly what extends completeness to first-order." },
    ],
    explanation: "Complete-if-true, silent-if-false: the prover's asymmetric contract, and the reason the project documents its non-theorems by saturation, not timeout.",
  },
];
