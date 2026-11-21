/**
 * Lesson d-03 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_03: ClassicalLesson = {

  slug: "d-03",
  title: "Natural Deduction and Inference Rules",
  minutes: 30,
  summary:
    "Modus ponens and its cousins: derivations as chains of licensed moves, and what soundness promises.",
  kind: "concept",
  objectives: [
    "Apply modus ponens, modus tollens, and-elimination and or-introduction by matching sentence shapes",
    "Refute affirming the consequent and denying the antecedent by naming the counterexample row",
    "Distinguish entailment KB ⊨ φ, a semantic claim over every model, from derivability KB ⊢ φ, a syntactic claim about proofs",
    "State what soundness guarantees about a derivation — and what completeness adds on top",
    "Trace a forward-chaining derivation, checking each firing against the rule that licenses it",
  ],
  why: "Somewhere in every system that reasons — a configuration checker, a policy engine, a planner testing preconditions — the same question arrives: given what I know, what am I entitled to conclude? Truth tables answer by enumeration, and the previous lesson showed how fast that wall arrives: thirty variables is already a billion rows. Derivation answers by walking: each step is a rule whose safety was proven once, in advance, for every interpretation, so a thousand-step proof costs a thousand shape-checks, not a thousand worlds. This lesson installs the rulebook behind that trade. You will meet modus ponens and its cousins as shapes that license moves, then the two seductive non-rules that mimic them — refuted, both of them, by a single table row. And you will pin down the property that makes the whole business trustworthy: soundness, the guarantee that a derivation can never outrun the truth of its premises. When the next lesson collapses the entire rulebook into one rule, everything here survives unchanged.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "The previous lesson settled every dispute the same way: build the table, read the verdict, and pay one row per possible world for the privilege. This lesson settles them by walking instead. An **inference rule** is a licensed move — it says that whenever sentences of one *shape* appear, a sentence of another shape may be written down — and because each license was verified valid in every interpretation once and for all, a hundred-step derivation costs a hundred shape-checks, not a hundred worlds. That is the syntactic face of logic: the table is a **semantic** check, exponential in the variables; the derivation is **syntactic**, linear in the proof itself. The rulebook is small and mostly already in your habits — and two famous impostors dress exactly like its members.",
    },

    // ------------------------------------------------------------ rulebook + impostors
    { kind: "heading", text: "The rulebook — and its two impostors" },
    {
      kind: "propositions",
      title: "Four licensed moves",
      entries: [
        { formula: "(P \\rightarrow Q) \\wedge P \\vdash Q", name: "modus ponens", reading: "from a conditional and its antecedent, detach the consequent — the move every forward-chaining system fires first and most.", tone: "law" },
        { formula: "(P \\rightarrow Q) \\wedge \\neg Q \\vdash \\neg P", name: "modus tollens", reading: "from a conditional and a failed consequent, withdraw the antecedent — the refuter's move.", tone: "law" },
        { formula: "P \\wedge Q \\vdash P", name: "and-elimination", reading: "a conjunction licenses each of its conjuncts — unpack what you already jointly know.", tone: "law" },
        { formula: "P \\vdash P \\vee Q", name: "or-introduction", reading: "any fact licenses the weaker claim that at least one of it and anything else holds — sound, but strictly a step away from a sharp goal.", tone: "law" },
      ],
      caption:
        "Read ⊢ as *therefore, by license*: everything left of it is offered as premises, and the right side is the conclusion the rule stamps. Each rule is valid in every interpretation — pick any of the four and check it with the previous lesson's table habit: wherever the premise column is true, the conclusion column is true too.",
    },
    {
      kind: "propositions",
      title: "The impostors: two celebrated non-rules",
      entries: [
        { formula: "(P \\rightarrow Q) \\wedge Q \\vdash P", name: "affirming the consequent", reading: "INVALID — the canonical 'looks like modus ponens but is not': the consequent arrives as evidence, but conditionals do not run backwards; Q may hold for other reasons.", tone: "fallacy" },
        { formula: "(P \\rightarrow Q) \\wedge \\neg P \\vdash \\neg Q", name: "denying the antecedent", reading: "INVALID — the mirror error: P's absence closes one route to Q, not all of them.", tone: "fallacy" },
      ],
      caption:
        "Both wear the rulebook's costume. The tell: the 'extra evidence' premise mentions the WRONG half of the conditional — the consequent where modus ponens needs the antecedent, the antecedent's negation where modus tollens needs the consequent's negation. Both die on the same row of the table below.",
    },
    {
      kind: "truthTable",
      title: "One row, two refutations",
      columns: ["P", "Q", "P \\rightarrow Q", "\\neg P", "((P \\rightarrow Q) \\wedge Q) \\rightarrow P", "((P \\rightarrow Q) \\wedge \\neg P) \\rightarrow \\neg Q"],
      rows: [
        [true, true, true, false, true, true],
        [true, false, false, false, true, true],
        [
          { v: false, highlight: true },
          { v: true, highlight: true },
          { v: true, highlight: true },
          { v: true, highlight: true },
          { v: false, highlight: true },
          { v: false, highlight: true },
        ],
        [false, false, true, true, true, true],
      ],
      verdict: "contingent",
      verdictNote:
        "Both test columns are contingent — each fails on the highlighted row and nowhere else. An argument form is valid exactly when its test column is a tautology; one failing row is a counterexample world, and this single world — P false, Q true — kills affirming the consequent and denying the antecedent together.",
      caption:
        "The test-column trick: an inference is valid exactly when (premises → conclusion) is a tautology. Column 5 tests affirming the consequent, column 6 denying the antecedent; on the highlighted row the conditional holds vacuously, each fallacy's second premise holds, and both conclusions fail — Q is true for reasons P knows nothing about.",
    },

    // ------------------------------------------------------------ resolution preview
    { kind: "heading", text: "One rule to replace them all" },
    {
      kind: "math",
      title: "Resolution, previewed",
      displays: [
        { expr: "\\{\\neg P, Q\\} \\quad \\{\\neg Q, R\\}", label: "parents" },
        { expr: "\\{\\neg P, R\\}", label: "resolvent" },
        { expr: "\\{P\\} \\quad \\{\\neg P, Q\\} \\quad \\rightarrow \\quad \\{Q\\}", label: "modus ponens, in disguise" },
      ],
      caption:
        "The resolution rule, applied to {¬P, Q} and {¬Q, R}, yields {¬P, R} — resolve away the complementary pair, keep the rest. A clause is a set of literals standing for their disjunction; two clauses containing a complementary pair Q, ¬Q resolve to the union of the remainder. Modus ponens is the disguised special case in the third display — resolve {P} with {¬P, Q} on P/¬P and {Q} falls out — and one rule, applied repeatedly, is complete for propositional logic. The next lesson makes it the whole calculus, and every rule in today's rulebook retires.",
    },

    // ------------------------------------------------------------ soundness
    { kind: "heading", text: "What a derivation promises" },
    {
      kind: "definition",
      term: "Entailment",
      informal:
        "The knowledge base entails φ when every world that makes all of the KB's sentences true also makes φ true — the semantic gold standard, defined over models, not proofs.",
      formal: "KB \\models \\phi",
      why: "Entailment consults no procedure: it is a fact about all possible worlds at once, which is why checking it by force — the truth table — costs one row per world.",
    },
    {
      kind: "definition",
      term: "Derivability",
      informal:
        "φ is derivable from the KB when a finite derivation exists: a sequence of lines, each one a KB sentence or the conclusion of a rule applied to earlier lines, ending at φ.",
      formal: "KB \\vdash \\phi",
      why: "Purely syntactic — shape matching all the way down; no truth value is ever consulted, which is exactly what lets a machine (or a grader) check a derivation line by line.",
    },
    {
      kind: "definition",
      term: "Soundness",
      informal:
        "A rule system is sound when every conclusion it derives is entailed by its premises: licensed moves preserve truth, so a derivation from true premises can never end in a falsehood. The converse promise — every entailed conclusion is derivable — is completeness.",
      formal: "KB \\vdash \\phi => KB \\models \\phi",
      why: "Soundness is why you may trust a derivation you never checked against a single table; completeness is why derivation can replace the table rather than trail it. Propositional logic's standard rulebooks have both.",
    },
    {
      kind: "inferenceChain",
      title: "A forward derivation: who is ready for the degree audit",
      direction: "forward",
      facts: [
        "enrolled(mira, cs152)",
        "core(cs152)",
        "enrolled(mira, art110)",
        "elective(art110)",
        "tuition_paid(mira)",
        "no_holds(mira)",
        "enrolled(juno, cs152)",
      ],
      rules: [
        { id: "r1", label: "R1", if: ["enrolled(S, C)", "core(C)"], then: "core_done(S)" },
        { id: "r2", label: "R2", if: ["enrolled(S, C)", "elective(C)"], then: "elective_done(S)" },
        { id: "r3", label: "R3", if: ["core_done(S)", "elective_done(S)"], then: "program_complete(S)" },
        { id: "r4", label: "R4", if: ["tuition_paid(S)", "no_holds(S)"], then: "account_clear(S)" },
        { id: "r5", label: "R5", if: ["program_complete(S)", "account_clear(S)"], then: "audit_ready(S)" },
      ],
      derived: [
        "core_done(mira)",
        "core_done(juno)",
        "elective_done(mira)",
        "program_complete(mira)",
        "account_clear(mira)",
        "audit_ready(mira)",
      ],
      caption:
        "One pass over the rulebook — rules in order, facts scanned in listed order, conclusions visible immediately — produces all six firings; S and C are placeholders, instantiated per firing. Note the honest stall: Juno never reaches audit_ready (no elective, no tuition record), and the KB does not pretend otherwise. Deriving only what the rules license is soundness in miniature; each arrow above is a shape-check you can perform yourself against the rulebook. This derivation discipline is what becomes machine-checkable end to end in the next lesson, when one rule — resolution — replaces the whole rulebook.",
    },

    // ------------------------------------------------------------ practice
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-03-e1",
      exerciseKind: "concept-check",
      prompt:
        "The deployment runbook states: 'If the build breaks, the tests fail.' This morning's log shows the tests failed. Your teammate concludes the build broke. What does the rulebook say?",
      options: [
        {
          text: "Licensed — modus ponens with the conditional and its antecedent",
          correct: false,
          feedback:
            "Modus ponens needs the antecedent — 'the build broke' — as a premise. Here the antecedent is exactly what is missing: what we hold is the consequent. The shape is affirming the consequent, not modus ponens.",
        },
        {
          text: "Not licensed — the tests can fail for other reasons; the world 'build fine, tests fail anyway' satisfies both premises and falsifies the conclusion",
          correct: true,
          feedback:
            "Exactly — that world is the highlighted row of the refutation table: P false, Q true. No rule of the rulebook takes P → Q and Q to P.",
        },
        {
          text: "Licensed by modus tollens, since the failing tests match the conditional's consequent",
          correct: false,
          feedback:
            "Modus tollens fires from the consequent's NEGATION — 'the tests did not fail' — and concludes the antecedent's negation. A different shape entirely.",
        },
        {
          text: "Not licensed, because the runbook's conditional is presumably false",
          correct: false,
          feedback:
            "The conditional is a granted premise; its actual truth is not in question. The failure is formal: no rule licenses the step, whatever the conditional says.",
        },
      ],
      solution:
        "The conclusion is not licensed: the argument is affirming the consequent — the canonical 'looks like modus ponens but is not' — refuted by the world where the build is fine and the tests fail for their own reasons (a flaky runner, a network timeout).",
      explanation:
        "The pull is causal: if a broken build would fail the tests, failed tests feel like evidence of a broken build. Material implication makes no causal claim — Q has other routes to truth — which is precisely what the highlighted row of the table exhibits.",
      concepts: ["affirming the consequent", "modus ponens", "validity"],
    },
    {
      kind: "exercise",
      id: "d-03-e2",
      exerciseKind: "predict-output",
      prompt:
        "A one-rule derivation engine fires modus ponens to fixpoint over a KB of atoms and implications. Without running it, predict the two printed lines.",
      starter: `# A one-rule derivation engine: modus ponens, fired to fixpoint.
# The KB is a set of strings: atoms ("P") and implications ("P -> Q").

kb = {"P", "P -> Q", "Q -> R", "R -> S", "X -> Y"}

def split_kb(kb):
    atoms = sorted(s for s in kb if "->" not in s)
    implications = sorted(tuple(s.split(" -> ")) for s in kb if " -> " in s)
    return atoms, implications

derived = []
while True:
    atoms, implications = split_kb(kb)
    fresh = [b for a, b in implications if a in atoms and b not in kb]
    if not fresh:
        break
    for b in fresh:
        kb.add(b)
        derived.append(b)

print("derived:", " ".join(derived))
print("final atoms:", " ".join(sorted(s for s in kb if "->" not in s)))
`,
      expectedOutput: "derived: Q R S\nfinal atoms: P Q R S",
      solution:
        "Three firings, in dependency order: P + P → Q yields Q; then Q + Q → R yields R; then R + R → S yields S. The implication X → Y never fires — X never enters the KB — so Y is never derived. The engine prints:\nderived: Q R S\nfinal atoms: P Q R S",
      explanation:
        "Each pass scans the implications in sorted order and fires those whose antecedent has arrived; conclusions become available for the next pass, so Q unlocks Q → R, and R unlocks R → S. The stall on X → Y is soundness in miniature: a rule whose premise never arrives fires never, and nothing unlicensed is reported. Rules as data plus a fixpoint loop is the next lesson's resolution engine in embryo.",
      concepts: ["modus ponens", "forward chaining", "soundness"],
    },
    {
      kind: "exercise",
      id: "d-03-e3",
      exerciseKind: "trace",
      prompt:
        "Derive `E ∨ F` from the KB {A ∧ B, A → C, B → D, C → E}: one line at a time, naming the rule that licenses each line. Then say why no sound rule could ever deliver F alone.",
      solution:
        "1. A — and-elimination on A ∧ B\n2. B — and-elimination on A ∧ B\n3. C — modus ponens on line 1 and A → C\n4. D — modus ponens on line 2 and B → D\n5. E — modus ponens on line 3 and C → E\n6. E ∨ F — or-introduction on line 5\nF alone is out of reach: the KB never mentions F, so worlds satisfying the KB exist with F false — F is not entailed, and a sound rule cannot derive what is not entailed. The only rule that ever writes F is or-introduction, and it writes F strictly as a hedged disjunct. (Line 4 is licensed but idle — derivations may carry lines the goal never uses; the next lesson's search strategies exist partly to prune such baggage.)",
      explanation:
        "The trace is the lesson in miniature: every line is a premise or a licensed move on earlier lines, and order matters — C must exist before modus ponens can fire on C → E. The F question separates soundness from wishful thinking: derivation reaches exactly what the rules license, and no further.",
      concepts: ["modus ponens", "and-elimination", "or-introduction", "derivation"],
    },
  ],
  terms: [
    {
      term: "modus ponens",
      definition:
        "The detachment rule — from P and P → Q, conclude Q; the inference rule every forward-chaining system fires first and most.",
    },
    {
      term: "inference rule",
      definition:
        "A schematic, meaning-preserving move from premises to a conclusion, licensed by shape alone because it is valid in every interpretation.",
    },
    {
      term: "modus tollens",
      definition:
        "The refuter's rule — from P → Q and ¬Q, conclude ¬P; the shape behind withdrawing a claim when its consequences fail.",
    },
    {
      term: "soundness",
      definition:
        "The property of a rule system that everything it derives from a KB is entailed by that KB — licensed moves preserve truth, so derivations cannot manufacture falsehood.",
    },
  ],
  mistakes: [
    {
      mistake: "Affirming the consequent: treating P → Q and Q as if they licensed P.",
      why: "The shape sits one swap away from modus ponens — the consequent in the premise slot instead of the conclusion slot — and causal intuition ('Q happened; P would have caused Q') papers over the swap.",
      fix: "Name the conditional's parts before concluding: which sentence is the antecedent? If the antecedent is what you WANT rather than what you HAVE, no rule fires. In doubt, four rows settle it.",
    },
    {
      mistake: "Confusing soundness with completeness — 'it derived the conclusion, so the conclusion is entailed' and 'it is entailed, so the system can derive it' used interchangeably.",
      why: "The two properties point in opposite directions along the ⊢/⊨ bridge and are proven separately; an unsound system manufactures falsehoods, an incomplete one merely misses truths.",
      fix: "Direction check: soundness runs ⊢ ⇒ ⊨ (derivations never lie), completeness runs ⊨ ⇒ ⊢ (no truth is unreachable). Decide which one your argument needs before invoking either.",
    },
    {
      mistake: "Reporting a disjunct after proving the disjunction — deriving P ∨ Q by or-introduction, then acting on P.",
      why: "Or-introduction is sound but strictly weakens the claim; the disjunct does not follow from the disjunction.",
      fix: "Treat or-introduction as a one-way door: it adds alternatives and can never isolate one. If the goal is P, a ∨-step is a step away.",
    },
    {
      mistake: "Expecting derivation to be easy because each step is trivial.",
      why: "Checking a proof is cheap — every firing is a shape match — but FINDING one is search, and propositional entailment is the NP-complete problem the previous lesson met; the rulebook licenses moves, it does not say which move to make.",
      fix: "Keep the two costs apart: verification is linear in the proof, discovery can be exponential in the KB. The next lesson's strategies exist to discipline the search, not the checking.",
    },
  ],
  takeaways: [
    "An inference rule is a licensed move, valid in every interpretation — shape matching can never carry you from true premises to a false conclusion.",
    "Modus ponens, modus tollens, and-elimination and or-introduction are the four shapes that license conclusions; affirming the consequent and denying the antecedent license nothing.",
    "One row kills an argument form: the world P false, Q true refutes both classic fallacies at once.",
    "⊨ is semantic (every model), ⊢ is syntactic (a derivation exists); soundness runs ⊢ ⇒ ⊨ and completeness runs ⊨ ⇒ ⊢ — together they let derivation stand in for the table.",
    "Resolution — one rule, complete for propositional logic — retires the whole rulebook; the next lesson builds the machine-checkable calculus from it.",
  ],
  quiz: [
    {
      id: "d-03-q1",
      prompt:
        "The runbook says: 'If the disk is full, the job aborts.' A check shows the disk is not full. Your teammate concludes the job did not abort. Verdict?",
      options: [
        {
          text: "Valid — with the disk fine, nothing forced the abort",
          correct: false,
          feedback:
            "That is denying the antecedent: the conditional names one route to an abort, not the only one. In the world 'disk fine, job aborted anyway' — a bug, a timeout — both premises hold and the conclusion fails.",
        },
        {
          text: "Invalid — the conditional stays true and the abort may still have happened; nothing in the premises rules it out",
          correct: true,
          feedback:
            "Correct: from P → Q and ¬P, no rule of the rulebook concludes anything about Q. The counterexample row is P false, Q true — the same world that kills affirming the consequent.",
        },
        {
          text: "Valid, by modus tollens",
          correct: false,
          feedback:
            "Modus tollens needs the consequent negated — 'the job did not abort' — to conclude ¬P. Here the negation sits on the antecedent instead: the mirror-image fallacy.",
        },
        {
          text: "Invalid, because the conditional is evidently unreliable",
          correct: false,
          feedback:
            "The conditional is granted as a premise; the failure is one of form, not fact. Even a perfectly true conditional plus ¬P licenses nothing about Q.",
        },
      ],
      explanation:
        "Denying the antecedent is affirming the consequent's mirror: each offers the wrong half of the conditional as evidence. One row — antecedent false, consequent true — kills both.",
    },
    {
      id: "d-03-q2",
      prompt:
        "A derivation system is sound. You derive φ from the KB in twenty licensed steps. What do you now know?",
      options: [
        {
          text: "KB ⊨ φ — every model of the KB satisfies φ; soundness rules out every other outcome",
          correct: true,
          feedback:
            "Correct — soundness is the bridge ⊢ ⇒ ⊨: each licensed move preserves truth, so twenty steps or two hundred, the conclusion is entailed.",
        },
        {
          text: "Little — without completeness, a derivation carries no guarantee",
          correct: false,
          feedback:
            "Completeness is the converse direction: entailed conclusions are derivable. Its absence would mean missing proofs, not untrustworthy ones.",
        },
        {
          text: "φ is a tautology",
          correct: false,
          feedback:
            "Soundness preserves the premises' truth, not validity: from KB = {P} you may soundly derive P ∨ Q — no tautology, merely entailed.",
        },
        {
          text: "The KB is consistent",
          correct: false,
          feedback:
            "Soundness is a property of the rule system, not of your premises; it says derivations preserve truth, not that the premises were consistent to begin with.",
        },
      ],
      explanation:
        "Soundness transfers truth from premises to conclusion through every rule application — which is why a derivation may stand in for the exponentially large table you declined to build.",
    },
    {
      id: "d-03-q3",
      prompt: "KB = {P → Q, ¬Q}. Which single licensed move follows?",
      options: [
        {
          text: "Modus tollens: derive ¬P",
          correct: true,
          feedback: "Correct — the failed consequent withdraws the antecedent: (P → Q) ∧ ¬Q ⊢ ¬P.",
        },
        {
          text: "Modus ponens: derive Q",
          correct: false,
          feedback:
            "Modus ponens needs P itself as a premise; ¬Q is not P — if anything, it is pressure in the opposite direction.",
        },
        {
          text: "Or-introduction: derive Q ∨ R",
          correct: false,
          feedback:
            "Or-introduction fires on a fact you already hold — here ¬Q, yielding ¬Q ∨ R, say. Q itself is nowhere in the KB, so Q ∨ R is not licensed in one move (nor at all: the lone model of the KB has Q false).",
        },
        {
          text: "And-elimination: derive P",
          correct: false,
          feedback: "There is no conjunction in the KB to eliminate — and-elimination has nothing to fire on.",
        },
      ],
      explanation:
        "One premise set, one firing shape: the negated consequent is modus tollens's trigger. Note what did not fire — or-introduction could still add ¬Q ∨ R, soundly but uselessly, taking you further from the sharp fact.",
    },
  ],

};
