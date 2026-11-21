/**
 * Lesson d-02 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_02: ClassicalLesson = {

  slug: "d-02",
  title: "Truth Tables and Equivalence",
  minutes: 30,
  summary:
    "Systematic evaluation: equivalence laws, tautologies and contradictions, including the de Morgan and implication identities.",
  kind: "coding",
  objectives: [
    "Build truth tables systematically, column by subexpression",
    "Classify formulas as tautologies, contradictions or contingencies",
    "Verify the de Morgan and implication identities by complete evaluation",
    "Say what satisfiability means — and why it is computationally hard in general",
  ],
  why: "Truth tables are logic's calculator: a mechanical, complete procedure for settling any question about a propositional formula — equivalence, validity, satisfiability — by checking every possible world at once. For small formulas the table IS the argument; for large ones it is the exponential adversary that motivates everything else in the subject: equivalence laws for rewriting, resolution for refuting, and the whole apparatus of Parts E and F. Learning to read a table fluently — and to distrust an intuition that a four-row check could have corrected — is the discipline this lesson installs.",
  blocks: [
    {
      kind: "text",
      text: "A truth table is brute force made honest: one row per possible assignment to the variables, one column per subexpression, filled in mechanically. Two formulas are **equivalent** when their columns match on every row; a formula is a **tautology** when its column is all T; a **contradiction** when all F. Nothing smarter is required — only care with the order of evaluation.",
    },
    {
      kind: "definition",
      term: "Logical equivalence",
      informal: "Two formulas that are true in exactly the same worlds — interchangeable everywhere without changing meaning.",
      formal: "\\alpha \\equiv \\beta \\iff \\alpha \\models \\beta \\text{ and } \\beta \\models \\alpha",
      why: "Equivalence licenses substitution: rewriting any subformula by its equivalent leaves the whole formula's meaning untouched — the basis of every simplification and every conversion to normal form.",
    },
    { kind: "heading", text: "Two identities worth owning" },
    {
      kind: "truthTable",
      title: "Material implication, rewritten",
      columns: ["P", "Q", "P \\rightarrow Q", "\\neg P", "\\neg P \\vee Q"],
      rows: [
        [true, true, true, false, true],
        [true, false, { v: false, highlight: true }, false, { v: false, highlight: true }],
        [false, true, true, true, true],
        [false, false, true, true, true],
      ],
      verdict: "equivalent",
      verdictNote:
        "P → Q and ¬P ∨ Q agree on all four rows — including the two that surprise beginners: implication is VACUOUSLY true whenever P is false.",
      caption:
        "The highlighted row is the one intuition gets wrong: P true, Q false — the only row where implication fails. Every other combination holds.",
    },
    {
      kind: "truthTable",
      title: "de Morgan: negation crosses the connective",
      columns: ["P", "Q", "\\neg(P \\wedge Q)", "\\neg P", "\\neg P \\vee \\neg Q"],
      rows: [
        [true, true, false, false, false],
        [true, false, true, false, true],
        [false, true, true, true, true],
        [false, false, true, true, true],
      ],
      verdict: "equivalent",
      verdictNote: "¬(P ∧ Q) ≡ ¬P ∨ ¬Q — negation flips AND to OR. Its dual, ¬(P ∨ Q) ≡ ¬P ∧ ¬Q, is the same table with ∧ and ∨ swapped.",
      caption:
        "De Morgan is the workhorse of normal-form conversion: push negations inward until they sit on variables, flipping connectives as they pass.",
    },
    {
      kind: "propositions",
      title: "The equivalence laws",
      entries: [
        { formula: "P \\rightarrow Q \\equiv \\neg P \\vee Q", name: "implication", reading: "the rewrite that removes → in favor of ¬ and ∨ — the first step of every CNF conversion.", tone: "law" },
        { formula: "\\neg(P \\wedge Q) \\equiv \\neg P \\vee \\neg Q", name: "de Morgan", reading: "negation inverts the connective it crosses; dually for ∨.", tone: "law" },
        { formula: "P \\rightarrow Q \\equiv \\neg Q \\rightarrow \\neg P", name: "contraposition", reading: "the contrapositive is the safest rewrite for proving implications.", tone: "law" },
        { formula: "(P \\rightarrow Q) \\wedge (P \\wedge \\neg Q) \\equiv \\text{F}", name: "contradiction with the evidence", reading: "an implication plus its violated consequent is unsatisfiable — the shape behind modus tollens and every refutation.", tone: "law" },
        { formula: "P \\rightarrow Q \\equiv Q \\rightarrow P", name: "the converse error", reading: "FALSE in general — the swap changes meaning; row P=F, Q=T is the counterexample.", tone: "fallacy" },
      ],
      caption: "Five identities, four true and one seductive. The fifth — confusing a conditional with its converse — is the most common reasoning error in informal argument.",
    },
    { kind: "heading", text: "Reading the verdict" },
    {
      kind: "math",
      title: "The three classifications",
      displays: [
        { expr: "\\models \\alpha \\quad \\text{(all rows T: tautology / valid)}" },
        { expr: "\\models \\neg \\alpha \\quad \\text{(all rows F: contradiction / unsatisfiable)}" },
        { expr: "\\text{some T, some F: contingent — the ordinary case}" },
      ],
      caption:
        "Satisfiability — at least one T — is the computational pivot: deciding it for arbitrary propositional formulas is NP-complete, which is why a 2^n table is not a loophole but a warning.",
    },
    {
      kind: "example",
      title: "Settling the converse dispute in four rows",
      problem: "A colleague insists: 'If the sensor fires, the valve opened' licenses 'the valve opened, therefore the sensor fired.' Settle it with a table.",
      steps: [
        { text: "Formalize both directions.", detail: "F → V (the claim) and V → F (the colleague's converse)." },
        { text: "List the four worlds: (F,V) = (T,T), (T,F), (F,T), (F,F).", detail: "Sensors and valves are independent in the table — that is the point of exhaustive evaluation." },
        { text: "Evaluate F → V: fails only in (T,F) — sensor fired, valve stuck.", detail: "True in (F,T): a quiet sensor with an open valve (manual override, say) violates nothing." },
        { text: "Evaluate V → F: fails in (F,T) — exactly the world the original claim allows.", detail: "The two conditionals disagree in (F,T); neither entails the other." },
      ],
      result: "The converse is not equivalent: the world (sensor quiet, valve open) satisfies the claim and falsifies the colleague's reading. Four rows, dispute closed.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-02-e1",
      exerciseKind: "predict-output",
      prompt:
        "A tiny evaluator walks all assignments of P, Q and counts rows where (P ∧ Q) → ¬P is true. How many of the 4 rows are T? Type the count.",
      expectedOutput: "3",
      solution: "3",
      explanation:
        "Rows: (T,T): P∧Q = T, ¬P = F → F. (T,F): antecedent F → T. (F,T): antecedent F → T. (F,F): antecedent F → T. Three of four — the formula is contingent, and its one failing row is the classic 'evidence contradicts the claim' world.",
      concepts: ["truth tables", "implication"],
    },
    {
      kind: "exercise",
      id: "d-02-e2",
      exerciseKind: "trace",
      prompt:
        "Prove or refute by complete table: (P → Q) → R ≡ P → (Q → R). If not equivalent, name the witnessing row.",
      solution:
        "Eight rows (three variables). The critical divergence: (P, Q, R) = (T, F, F). Left: P→Q is F, so (P→Q)→R is T (vacuously — false antecedent). Right: Q→R is T (vacuously), P→(T) is T. Both T here, keep scanning... the actual witness is (F, T, F): Left: P→Q = T, T→R = F. Right: Q→R = F, P→(F) = T (vacuous). Left F, Right T — NOT equivalent, witnessed by P false, Q true, R false. The asymmetry: the left formula's antecedent is about P and Q, the right's consequent is about Q and R; vacuous truth fires on different sides.",
      explanation:
        "The exercise trains the eye: when tables disagree, name the ROW — the counterexample world — not just the verdict. That habit is exactly what resolution refutations automate.",
      concepts: ["truth tables", "equivalence", "counterexample"],
    },
    {
      kind: "exercise",
      id: "d-02-e3",
      exerciseKind: "concept-check",
      prompt:
        "SAT solvers decide satisfiability for a living. Why doesn't the truth table make them trivial to build?",
      options: [
        { text: "It does — 2^n rows is fine because n is always small", correct: false, feedback: "n is routinely in the hundreds of thousands; 2^n rows exceeds the atom count of the universe before n reaches 400." },
        { text: "The table is exponential in the number of variables, so it only settles toy formulas; real solvers search the space of assignments cleverly, exploiting structure the table ignores", correct: true, feedback: "Correct — and the same tension powers the whole subject: complete-and-exponential (tables, resolution) versus incomplete-and-fast (local search over assignments)." },
        { text: "Truth tables cannot handle negation", correct: false, feedback: "Negation is a column like any other." },
        { text: "SAT is undecidable", correct: false, feedback: "Propositional SAT is decidable — NP-complete, which is hard but decisively decidable. Undecidability waits for first-order logic's entailment." },
      ],
      solution: "2^n rows is the wall; SAT solvers exist because the space has exploitable structure — unit clauses, propagation, learned conflicts.",
      explanation: "Every complete procedure for propositional logic pays exponentially in the worst case (unless P = NP): tables pay it row-wise, resolution clause-wise. Engineering lives in the average case.",
      concepts: ["satisfiability", "NP-completeness", "exponential blowup"],
    },
  ],
  terms: [
    {
      term: "tautology",
      definition: "A formula true under every assignment — valid by form alone, like P ∨ ¬P. Its column is all T.",
    },
    {
      term: "contingency",
      definition: "A formula true in some worlds and false in others — the ordinary case; meaning depends on the facts.",
    },
    {
      term: "satisfiability",
      definition: "The property of having at least one satisfying assignment; deciding it for propositional formulas is NP-complete, the parent problem of a thousand others.",
    },
    {
      term: "vacuous truth",
      definition: "An implication with a false antecedent is true — the row convention that makes P → Q equivalent to ¬P ∨ Q and powers the contrapositive.",
    },
  ],
  mistakes: [
    {
      mistake: "Reading P → Q as 'P causes Q' or as the converse Q → P.",
      why: "Material implication is a truth-function, not a causal or biconditional claim; the (F, T) row is true, and the converse is a different formula.",
      fix: "When in doubt, write the four rows. Two minutes of table settles what an hour of intuition argues about.",
    },
    {
      mistake: "Negating a conjunction by negating its parts: ¬(P ∧ Q) becomes ¬P ∧ ¬Q.",
      why: "de Morgan flips the connective too; the 'broken mirror' version fails whenever exactly one conjunct is true.",
      fix: "Negation crossing ∧ becomes ∨, and vice versa. Say the law aloud while rewriting: 'not both' is 'either not or not'.",
    },
  ],
  takeaways: [
    "Truth tables are complete and mechanical: equivalence, validity and satisfiability all fall to exhaustive evaluation — at exponential cost.",
    "P → Q ≡ ¬P ∨ Q and the de Morgan laws are the rewriting engine behind normal forms and every later algorithm in this subject.",
    "Verdicts come in three kinds: tautology, contradiction, contingency — and only the third depends on the world.",
    "Name the counterexample row when formulas disagree; the habit is the human version of what resolution does automatically.",
    "SAT's NP-completeness is why the table cannot scale — and why the subject's smarter procedures exist at all.",
  ],
  quiz: [
    {
      id: "d-02-q1",
      prompt: "The single row where P → Q is false:",
      options: [
        { text: "P true, Q false", correct: true, feedback: "Correct — the only failing world for an implication: the promise made and broken." },
        { text: "P false, Q true", correct: false, feedback: "That row is vacuously TRUE — the antecedent never fired." },
        { text: "P false, Q false", correct: false, feedback: "Also vacuously true." },
        { text: "P true, Q true", correct: false, feedback: "The happy path — true, of course." },
      ],
      explanation: "One failing row out of four: implication is the weakest connective that still forbids that row — which is exactly what ¬P ∨ Q encodes.",
    },
    {
      id: "d-02-q2",
      prompt: "¬(P ∨ Q) is equivalent to:",
      options: [
        { text: "¬P ∨ ¬Q", correct: false, feedback: "That is the mirror-error: fails whenever exactly one of P, Q is true." },
        { text: "¬P ∧ ¬Q", correct: true, feedback: "Correct — de Morgan's dual: 'not either' is 'neither'. Check the table: both are false unless P and Q are both false." },
        { text: "P ∧ Q", correct: false, feedback: "The negation of a disjunction is not the conjunction — that would make P ∨ Q ≡ ¬(P ∧ Q), a different (and false) claim." },
        { text: "¬P → ¬Q", correct: false, feedback: "Expanding: ¬¬P ∨ ¬Q = P ∨ ¬Q — true in rows where ¬(P∨Q) is false. Not equivalent." },
      ],
      explanation: "De Morgan comes in duals; internalize both and negation-pushing becomes reflexive.",
    },
  ],

};
