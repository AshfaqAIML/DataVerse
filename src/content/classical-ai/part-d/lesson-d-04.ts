/**
 * Lesson d-04 — authored unit for Part D (see
 * agent-ctx/CLASSICAL-AUTHORING.md). Every `output` below is the REAL
 * output of running the code with python3 (scripts/verify-one-lesson.ts
 * machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_04: ClassicalLesson = {

  slug: "d-04",
  title: "Resolution in the Propositional Calculus",
  minutes: 35,
  summary:
    "One rule to reason with: convert to CNF, negate the goal, derive the empty clause — by hand and in Python.",
  kind: "coding",
  objectives: [
    "Convert a propositional formula to CNF, naming the law behind each rewrite and dropping tautologous clauses",
    "Apply the resolution rule in formula form and in set form, and derive the empty clause by hand",
    "Carry out a resolution refutation from scratch: premises to clauses, negate the goal, saturate to □",
    "Implement a propositional resolution prover and state precisely what □ and saturation do and do not certify",
  ],
  why: "Why settle for one inference rule when d-03 just handed you a whole zoo? Because a zoo has to be managed: a forward chainer must choose which rule to fire next, and a poor choice wastes work or wanders forever. Resolution is the great consolidation — every sound inference step of the propositional calculus collapses into a single rule over a single data shape, the clause. That uniformity is why real theorem provers, Prolog, and the SAT engines inside hardware verification are all built on this skeleton: one rule to implement, one saturation loop to debug, one completeness theorem to lean on. The price is preparation — formulas must be converted to conjunctive normal form first — and discipline: you must know exactly what the machine's □ certifies, and what its silence (saturation) means. This lesson runs the whole pipeline by hand once, then builds the twenty-line prover, so that when d-07 lifts the same architecture to first-order logic, only one genuinely new idea — unification — arrives.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Lesson d-03 handed you a zoo of inference rules — modus ponens, modus tollens, disjunctive syllogism — and a warning that goes with it: a forward chainer must *choose* which rule to fire next, and a poor choice wastes work or wanders. This lesson consolidates the zoo into **one rule**. *Resolution* consumes a single data shape, the clause, and asks exactly one question of any pair of them: do you contain complementary literals? Delete the pair, keep the rest, repeat. That is the entire deductive machinery of the propositional calculus, and it is enough to prove any valid argument by contradiction — mechanically, in about twenty lines of Python. The price of uniformity is preparation: formulas must first be pressed into conjunctive normal form.",
    },

    // ------------------------------------------------------------ CNF
    { kind: "heading", text: "From formulas to clauses" },
    {
      kind: "definition",
      term: "conjunctive normal form",
      informal:
        "A formula written as an AND of ORs: a conjunction of clauses, each clause a disjunction of literals. In this course's convention each clause is a SET of literals, and tautologous clauses are dropped — they are true in every world and constrain nothing.",
      formal:
        "C_1 \\wedge C_2 \\wedge \\dots \\wedge C_m \\quad \\text{where each } C_i = L_1 \\lor \\dots \\lor L_k",
      why: "CNF is the interchange format of automated reasoning: with negations pressed onto atoms and disjunctions gathered inside conjunctions, a formula becomes a set of clauses — the one shape on which the resolution rule applies uniformly, with no case analysis.",
    },
    {
      kind: "math",
      title: "A conversion, law by law",
      derivation: {
        title: "¬(P → Q) ∨ (R ∧ Q), from formula to clause set",
        steps: [
          { expr: "\\neg(P \\rightarrow Q) \\vee (R \\wedge Q)" },
          { expr: "\\neg(\\neg P \\vee Q) \\vee (R \\wedge Q)", reason: "implication law: P → Q ≡ ¬P ∨ Q" },
          { expr: "(P \\wedge \\neg Q) \\vee (R \\wedge Q)", reason: "de Morgan + double negation: ¬(¬P ∨ Q) ≡ P ∧ ¬Q" },
          {
            expr: "(P \\vee R) \\wedge (\\neg Q \\vee R) \\wedge (P \\vee Q) \\wedge (\\neg Q \\vee Q)",
            reason: "distribute ∨ over ∧, twice",
          },
          {
            expr: "(P \\vee R) \\wedge (\\neg Q \\vee R) \\wedge (P \\vee Q)",
            reason: "drop the tautologous clause ¬Q ∨ Q",
          },
        ],
      },
      caption:
        "Final clause set: {P, R}, {¬Q, R}, {P, Q} — three sets of literals, each an ∨-clause. Every rewrite is an equivalence from d-02's law list, so the clause set is true in exactly the worlds the original formula is; {¬Q, Q} left because it is satisfied in every world.",
    },
    {
      kind: "pseudocode",
      title: "TO-CNF — the conversion pipeline",
      lines: [
        { text: "FUNCTION TO-CNF(φ)" },
        {
          text: "replace every subformula A → B by ¬A ∨ B",
          indent: 1,
          note: "implication law — every arrow goes",
        },
        { text: "WHILE some ¬ sits on a compound subformula", indent: 1 },
        {
          text: "¬(A ∧ B) ↦ ¬A ∨ ¬B,   ¬(A ∨ B) ↦ ¬A ∧ ¬B",
          indent: 2,
          note: "de Morgan, pushing negations inward",
        },
        { text: "¬¬A ↦ A", indent: 2, note: "double negation" },
        { text: "WHILE some ∨ sits immediately above a ∧", indent: 1, tone: "key" },
        {
          text: "(A ∧ B) ∨ C ↦ (A ∨ C) ∧ (B ∨ C)",
          indent: 2,
          note: "distribute ∨ over ∧ — the rewrite that can duplicate literals; the set representation absorbs them",
        },
        { text: "read off the clauses C1, …, Cm as sets of literals", indent: 1 },
        {
          text: "DELETE every clause containing both L and ¬L",
          indent: 1,
          note: "tautologies: true in every world, they constrain nothing",
        },
        { text: "RETURN {C1, …, Cm}", indent: 1 },
      ],
      note: "Why CNF exists: negations on atoms, ∧ outside, ∨ inside — a formula becomes a set of sets of literals, the one data shape on which the resolution rule is uniform. Distribution can multiply clauses (exponentially in the worst case); provers pay that price for the single rule.",
    },

    // ------------------------------------------------------------ the rule
    { kind: "heading", text: "One rule instead of a zoo" },
    {
      kind: "math",
      title: "The resolution rule",
      displays: [
        { expr: "\\frac{P \\lor Q, \\; \\neg P \\lor R}{Q \\lor R}", label: "resolution" },
        { expr: "\\frac{A \\lor L, \\; B \\lor \\neg L}{A \\lor B}", label: "in general" },
        { expr: "\\{\\neg P, Q\\} + \\{\\neg Q, R\\} => \\{\\neg P, R\\}", label: "set form" },
        { expr: "KB \\wedge \\neg \\phi \\models \\bot \\iff KB \\models \\phi", label: "the refutation principle" },
      ],
      caption:
        "The set form is the operational reading — find one complementary pair (Q and ¬Q above), delete it, keep every other literal: ¬P survives from the first clause, R from the second. The pair must exhaust BOTH clauses for □, so only complementary unit clauses clash all the way — {Q} with {¬Q} — and a refutation's job is to resolve bigger clauses DOWN to units. The last display is the whole method: proving KB ⊨ φ becomes refuting KB ∧ ¬φ, with □ as the witness.",
    },

    // ------------------------------------------------------------ refutation
    { kind: "heading", text: "Refutation: aim at the empty clause" },
    {
      kind: "algorithm",
      name: "Resolution Refutation",
      family: "Saturation-based inference",
      problem: "Decide whether a propositional knowledge base entails a formula φ — by machine, with a single inference rule.",
      idea: "Add the NEGATED goal to the premises' clauses and close the set under the resolution rule. The empty clause □ appears exactly when premises and negated goal contradict each other — which is precisely entailment.",
      strategy: [
        "Convert every premise to CNF and collect the clauses.",
        "Negate the goal, convert that, and add its clauses — the refutation setup.",
        "Resolve every pair of clauses on every complementary pair of literals: delete the pair, keep the rest.",
        "Drop tautologous resolvents; add genuinely new clauses to the set.",
        "Stop when □ appears (entailed) or when a full round derives nothing new (saturated: not entailed).",
      ],
      guarantees: [
        "Sound: every derived clause is entailed by the premises, so □ can appear only when KB ∧ ¬φ is genuinely unsatisfiable.",
        "Refutation-complete for propositional logic: whenever KB ⊨ φ, some sequence of resolutions reaches □ — the blind resolve-everything loop cannot miss a proof.",
        "Terminating for propositional logic: over n atoms at most 3^n distinct clauses exist (each atom contributes its positive literal, its negative literal, or neither), so rounds of fresh clauses must stop.",
        "Honest caveat: a non-theorem ends in saturation — a certified 'not entailed', but with no countermodel on display; and in first-order logic even that 'no' is not guaranteed (semi-decidability, d-07's subject).",
      ],
      useWhen: [
        "One inference engine must answer many queries — the rule is uniform over clauses, so nothing about the query's shape is special-cased.",
        "The deliverable is a machine-checkable proof — a refutation is a derivation every step of which is the same rule.",
        "Not when you need the counterexample itself: a truth table (d-02) or a SAT solver exhibits the failing assignment directly.",
      ],
      pitfalls: [
        "Negating the goal wrongly (or not at all) — a valid argument then saturates and looks invalid.",
        "Resolving multiple complementary pairs in one step — the rule deletes exactly one pair per application.",
      ],
    },
    {
      kind: "pseudocode",
      title: "REFUTE — the refutation procedure",
      lines: [
        { text: "FUNCTION REFUTE(KB, φ)" },
        {
          text: "S ← clauses(TO-CNF(KB)) ∪ clauses(TO-CNF(¬φ))",
          indent: 1,
          note: "negate the goal — the refutation setup",
        },
        { text: "REPEAT", indent: 1 },
        { text: "FOR each unordered pair (C, D) of clauses in S", indent: 2 },
        { text: "FOR each literal L ∈ C with ¬L ∈ D", indent: 3, note: "the complementary pair" },
        { text: "R ← (C ∪ D) − {L, ¬L}", indent: 4, note: "delete the pair, keep the rest" },
        {
          text: "IF R = ∅ THEN RETURN proved — KB ⊨ φ",
          indent: 4,
          tone: "key",
          note: "□ — nothing survives the clash",
        },
        { text: "ELSE IF R is tautologous THEN discard R", indent: 4 },
        { text: "ELSE add R to S if new", indent: 4 },
        { text: "UNTIL a full round added no new clause", indent: 1 },
        { text: "RETURN saturated — KB ⊭ φ", indent: 1, note: "the honest 'no': see the guarantees" },
      ],
      note: "Invariant: S only ever grows with clauses entailed by the premises (soundness), and it grows strictly or the loop stops — at most 3^n clauses exist over n atoms, so propositional refutation always terminates. Saturation certifies non-entailment but exhibits no countermodel; d-07's first-order version loses even the termination guarantee.",
    },
    {
      kind: "example",
      title: "Modus ponens, refuted",
      problem:
        "Prove {P → Q, P} ⊨ Q by resolution refutation — d-03's hand rule, now derived by the machinery instead of chosen by a rule-picker.",
      steps: [
        {
          text: "Convert the premises to clauses.",
          detail: "P → Q is ¬P ∨ Q by the implication law — the clause {¬P, Q}. P is already the unit clause {P}.",
        },
        {
          text: "Negate the goal and convert.",
          detail: "The goal is Q, so ¬Q — already a clause: {¬Q}. The working set is {¬P, Q}, {P}, {¬Q}: three clauses, two of them units.",
        },
        {
          text: "Resolve {¬P, Q} with {P} on the pair P/¬P.",
          detail: "Delete P and ¬P; what survives is {Q}. Note what just happened: the machine performed modus ponens without knowing the rule's name — it is one resolution.",
        },
        {
          text: "Resolve {Q} with {¬Q} on Q/¬Q.",
          detail: "Delete the pair and nothing remains: the empty clause □.",
        },
        {
          text: "Read the verdict.",
          detail: "□ says {P → Q, P, ¬Q} is unsatisfiable — no world satisfies the premises and falsifies Q, which is exactly the definition of {P → Q, P} ⊨ Q.",
        },
      ],
      result: "□ in two resolutions — modus ponens falls out of the single rule; no rule-selection intelligence was spent.",
    },
    {
      kind: "pythonImpl",
      title: "A propositional resolution prover",
      intent:
        "Clauses as sets of literal strings, one resolve-every-pair loop, one saturation check — sound, refutation-complete, and honest about non-theorems.",
      code: `# A propositional resolution prover.
# Convention: a clause is a frozenset of literal strings; a literal is
# "P" or "¬P" (the lesson's notation). The empty clause is frozenset(),
# printed □. To prove KB ⊨ φ: saturate clauses(KB) + clauses(¬φ) until
# □ appears (entailed) or no new clause is derivable (not entailed).

from itertools import combinations


def negate(lit):
    return lit[1:] if lit.startswith("¬") else "¬" + lit


def lit_key(lit):
    return (lit.lstrip("¬"), lit.startswith("¬"))     # P sorts before ¬P


def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(sorted(clause, key=lit_key)) + "}"


def is_tautology(clause):
    return any(negate(l) in clause for l in clause)


def resolvents(c1, c2):
    # The whole inference engine: union the pair, delete ONE
    # complementary literal pair, keep the rest.
    return [(c1 | c2) - {l, negate(l)}
            for l in sorted(c1, key=lit_key) if negate(l) in c2]


def saturate(clauses):
    # Resolve every pair until □ (proved) or a round adds nothing.
    known = set(clauses)
    trace = []
    while True:
        ordered = sorted(known, key=lambda c: sorted(lit_key(l) for l in c))
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for r in resolvents(c1, c2):
                if is_tautology(r) or r in known or r in fresh:
                    continue            # tautologies dropped, duplicates skipped
                fresh.append(r)
                trace.append((c1, c2, r))
                if not r:               # □ — the refutation is complete
                    return True, known | set(fresh), trace
        if not fresh:
            return False, known, trace  # fixpoint reached: saturated
        known.update(fresh)


def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, known, trace = saturate(clauses)
    for c1, c2, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)}  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(known)} clauses, nothing new) — NOT ENTAILED")
    print()


# Case 1 - modus ponens, d-03's hand rule:  P→Q is {¬P, Q};  P is {P};
# the negated goal ¬Q is {¬Q}.
prove("1. modus ponens   {P→Q, P} ⊨ Q",
      [["¬P", "Q"], ["P"]],
      [["¬Q"]])

# Case 2 - affirming the consequent, d-03's fallacy:  P→Q is {¬P, Q};
# Q is {Q};  the negated goal ¬P is {¬P}.
prove("2. affirming the consequent   {P→Q, Q} ⊭ P",
      [["¬P", "Q"], ["Q"]],
      [["¬P"]])

# Case 3 - a chained syllogism:  P→Q is {¬P, Q};  Q→R is {¬Q, R};
# P is {P};  the negated goal ¬R is {¬R}.
prove("3. hypothetical syllogism   {P→Q, Q→R, P} ⊨ R",
      [["¬P", "Q"], ["¬Q", "R"], ["P"]],
      [["¬R"]])

# Case 4 - the resolution rule proving itself:  P∨Q is {P, Q};
# ¬P∨R is {¬P, R};  ¬(Q∨R) de Morgans into {¬Q} and {¬R}.
prove("4. the rule itself   {P∨Q, ¬P∨R} ⊨ Q∨R",
      [["P", "Q"], ["¬P", "R"]],
      [["¬Q"], ["¬R"]])`,
      output: `1. modus ponens   {P→Q, P} ⊨ Q
  clauses: {¬P, Q}   {P}   {¬Q}
  resolve {P} with {¬P, Q}  ->  {Q}
  resolve {¬P, Q} with {¬Q}  ->  {¬P}
  resolve {P} with {¬P}  ->  □
  □ derived after 3 resolutions — ENTAILED

2. affirming the consequent   {P→Q, Q} ⊭ P
  clauses: {¬P, Q}   {Q}   {¬P}
  saturated after 0 resolutions (3 clauses, nothing new) — NOT ENTAILED

3. hypothetical syllogism   {P→Q, Q→R, P} ⊨ R
  clauses: {¬P, Q}   {¬Q, R}   {P}   {¬R}
  resolve {P} with {¬P, Q}  ->  {Q}
  resolve {¬P, Q} with {¬Q, R}  ->  {¬P, R}
  resolve {¬Q, R} with {¬R}  ->  {¬Q}
  resolve {P} with {¬P, R}  ->  {R}
  resolve {¬P, Q} with {¬Q}  ->  {¬P}
  resolve {Q} with {¬Q}  ->  □
  □ derived after 6 resolutions — ENTAILED

4. the rule itself   {P∨Q, ¬P∨R} ⊨ Q∨R
  clauses: {P, Q}   {¬P, R}   {¬Q}   {¬R}
  resolve {P, Q} with {¬P, R}  ->  {Q, R}
  resolve {P, Q} with {¬Q}  ->  {P}
  resolve {¬P, R} with {¬R}  ->  {¬P}
  resolve {P} with {¬P}  ->  □
  □ derived after 4 resolutions — ENTAILED`,
      walkthrough: [
        "**Clause representation** — frozensets of literal strings (`\"P\"`, `\"¬P\"`), with `negate` the only place the syntax of negation lives. Everything downstream treats clauses as opaque sets; d-07 swaps in first-order literals and only this seam changes.",
        "**The engine** — `resolvents` is the entire inference rule: union the pair, delete one complementary pair, keep the rest. Everything else in the file is bookkeeping.",
        "**The loop** — `saturate` enumerates clause pairs in canonical (sorted) order, so traces are deterministic, and stops the instant □ appears; a round that derives nothing new is the fixpoint.",
        "Tautologous resolvents are dropped — resolution stays complete without them, and the clause set stays small.",
        "Case 2 saturates with *zero* resolutions fired — no complementary pair exists anywhere in {¬P, Q}, {Q}, {¬P} — the machine's way of refusing to commit d-03's affirming-the-consequent fallacy. In case 1 it also finds its own refutation (¬Q with ¬P ∨ Q gives ¬P, which clashes with P — a modus-tollens flavored route), a different but equally valid path to □ than the by-hand example.",
        "**The architecture is three separable pieces** — clause representation, the resolve loop, the saturation check — because d-07 lifts exactly this design to first-order logic: it swaps the pair test for d-06's `unify`, adds substitution bookkeeping, and the loop and the check survive unchanged.",
      ],
      project:
        "The clause engine and the saturation loop drop into the Part D project's resolution prover unchanged.",
    },
    {
      kind: "text",
      text: "What is guaranteed, stated precisely. The prover is **sound** — every clause it derives is entailed, so □ can appear only when premises and negated goal genuinely clash. It is **refutation-complete** for the propositional calculus — whenever KB ⊨ φ, some sequence of resolutions reaches □, so the blind loop cannot miss a proof. And it **terminates** — over n atoms at most 3^n clauses exist, so rounds of fresh derivations must end. On a non-theorem, that end is saturation: a certified *not entailed*. But notice what you did not get — the countermodel. d-02's truth table would show you the witnessing row (for the affirming-the-consequent case: P false, Q true); resolution simply runs out of moves. In first-order logic even the 'no' evaporates: with infinitely many clauses possible, a non-theorem's saturation may never arrive — the procedure may run forever. That is the **semi-decidability** of first-order entailment, and managing it is d-07's problem. Next come d-05's predicates and d-06's unification — the tools that lift this exact architecture to first order.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "d-04-e1",
      exerciseKind: "write-code",
      prompt:
        "Wire one more argument into the prover: disjunctive syllogism, {P ∨ Q, ¬P} ⊨ Q. Fill in the final prove(...) call — premise clauses first, then the clauses of the NEGATED goal. Literals are the strings \"P\", \"Q\", \"¬P\", \"¬Q\"; the engine is the lesson's, unchanged.",
      starter: `from itertools import combinations


def negate(lit):
    return lit[1:] if lit.startswith("¬") else "¬" + lit


def lit_key(lit):
    return (lit.lstrip("¬"), lit.startswith("¬"))     # P sorts before ¬P


def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(sorted(clause, key=lit_key)) + "}"


def is_tautology(clause):
    return any(negate(l) in clause for l in clause)


def resolvents(c1, c2):
    return [(c1 | c2) - {l, negate(l)}
            for l in sorted(c1, key=lit_key) if negate(l) in c2]


def saturate(clauses):
    known = set(clauses)
    trace = []
    while True:
        ordered = sorted(known, key=lambda c: sorted(lit_key(l) for l in c))
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for r in resolvents(c1, c2):
                if is_tautology(r) or r in known or r in fresh:
                    continue
                fresh.append(r)
                trace.append((c1, c2, r))
                if not r:
                    return True, known | set(fresh), trace
        if not fresh:
            return False, known, trace
        known.update(fresh)


def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, known, trace = saturate(clauses)
    for c1, c2, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)}  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(known)} clauses, nothing new) — NOT ENTAILED")
    print()


# TODO: prove disjunctive syllogism  {P∨Q, ¬P} ⊨ Q.
#   P ∨ Q is the clause {P, Q};  ¬P is {¬P};  ¬(goal) = ¬Q is {¬Q}.
# prove("disjunctive syllogism   {P∨Q, ¬P} ⊨ Q", ...premise clauses..., ...negated goal clauses...)`,
      solution: `from itertools import combinations


def negate(lit):
    return lit[1:] if lit.startswith("¬") else "¬" + lit


def lit_key(lit):
    return (lit.lstrip("¬"), lit.startswith("¬"))     # P sorts before ¬P


def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(sorted(clause, key=lit_key)) + "}"


def is_tautology(clause):
    return any(negate(l) in clause for l in clause)


def resolvents(c1, c2):
    return [(c1 | c2) - {l, negate(l)}
            for l in sorted(c1, key=lit_key) if negate(l) in c2]


def saturate(clauses):
    known = set(clauses)
    trace = []
    while True:
        ordered = sorted(known, key=lambda c: sorted(lit_key(l) for l in c))
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for r in resolvents(c1, c2):
                if is_tautology(r) or r in known or r in fresh:
                    continue
                fresh.append(r)
                trace.append((c1, c2, r))
                if not r:
                    return True, known | set(fresh), trace
        if not fresh:
            return False, known, trace
        known.update(fresh)


def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, known, trace = saturate(clauses)
    for c1, c2, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)}  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(known)} clauses, nothing new) — NOT ENTAILED")
    print()


# Disjunctive syllogism:  P∨Q is {P, Q};  ¬P is {¬P};
# the negated goal ¬Q is {¬Q}.
prove("disjunctive syllogism   {P∨Q, ¬P} ⊨ Q",
      [["P", "Q"], ["¬P"]],
      [["¬Q"]])`,
      expectedOutput: `disjunctive syllogism   {P∨Q, ¬P} ⊨ Q
  clauses: {P, Q}   {¬P}   {¬Q}
  resolve {P, Q} with {¬P}  ->  {Q}
  resolve {P, Q} with {¬Q}  ->  {P}
  resolve {P} with {¬P}  ->  □
  □ derived after 3 resolutions — ENTAILED`,
      explanation:
        "The setup is the whole exercise: premises to clauses ({P, Q} and {¬P}), goal negated and converted ({¬Q}). The machine does the rest — {P, Q} resolves with {¬P} on P/¬P to {Q}, and {Q} with {¬Q} clashes all the way to □. Disjunctive syllogism, like modus ponens before it, is one application of the single rule.",
      concepts: ["refutation setup", "clauses as sets", "resolution rule"],
    },
    {
      kind: "exercise",
      id: "d-04-e2",
      exerciseKind: "trace",
      prompt:
        "By hand: refute {P ∨ Q, P → R, Q → R} ⊨ R — proof by cases, resolution-style. Write the full clause set (premises plus the negated goal), then a resolution derivation of □. Remember: a clause is a SET of literals, so repeated literals collapse.",
      solution:
        "Clause set: P ∨ Q is {P, Q}; P → R is {¬P, R}; Q → R is {¬Q, R}; the negated goal ¬R is the unit clause {¬R}. Derivation: (1) resolve {P, Q} with {¬P, R} on P/¬P — delete the pair, keep the rest: {Q, R}. (2) resolve {Q, R} with {¬Q, R} on Q/¬Q — the union minus the pair leaves {R}: the two copies of R collapse into one, because a clause is a set of literals. (3) resolve {R} with {¬R} on R/¬R — nothing survives: □. Whichever of P, Q holds, R follows; ¬R is impossible.",
      explanation:
        "Step (2) is where the set convention earns its keep: the resolvent of Q ∨ R with ¬Q ∨ R is R ∨ R, and R ∨ R ≡ R. Every step deletes exactly one complementary pair, and □ appears only when nothing is left — the machine's own run of this argument takes a longer route to the same clash.",
      concepts: ["resolution rule", "refutation", "clauses as sets"],
    },
    {
      kind: "exercise",
      id: "d-04-e3",
      exerciseKind: "concept-check",
      prompt:
        "The prover saturates on {P→Q, Q} with goal P — three clauses, no new resolvent, run over. What may you correctly conclude?",
      options: [
        {
          text: "P is not entailed — and in the propositional calculus that verdict is guaranteed, because the finite saturated closure plus refutation completeness turns 'no refutation exists' into a proof of non-entailment",
          correct: true,
          feedback:
            "Correct — and note the two things saturation does NOT hand you: a countermodel, and any explanation of the failure. It is a certified 'no', not a shown 'why'.",
        },
        {
          text: "Nothing — saturation is inconclusive; the argument might still be valid",
          correct: false,
          feedback:
            "That is the first-order situation, where saturation may never arrive at all. Propositionally the closure is finite and the method refutation-complete, so running out of moves is a verdict.",
        },
        {
          text: "The prover found a countermodel: an assignment with the premises true and P false",
          correct: false,
          feedback:
            "No model is ever constructed — the countermodel here is P false, Q true, but resolution never exhibits it. Exhibiting rows is d-02's truth table's job.",
        },
        {
          text: "The prover is buggy: a correct prover always reaches □",
          correct: false,
          feedback:
            "A prover that always reached □ would be unsound — □ means premises plus the NEGATED goal contradict, which happens exactly when the goal is entailed. On a fallacy, □ had better not appear.",
        },
      ],
      solution:
        "Saturation, propositional case: a certified 'not entailed' — no countermodel on display, and no such guarantee in first-order logic.",
      explanation:
        "This is the boundary of the method: resolution answers 'does it follow?' with perfect reliability in the propositional calculus, but it is a refutation engine — when the answer is no, it stays silent about the world that witnesses the no.",
      concepts: ["saturation", "refutation completeness", "semi-decidability"],
    },
  ],
  terms: [
    {
      term: "conjunctive normal form",
      definition:
        "A conjunction of clauses, each clause a disjunction of literals — in this course, a set of sets of literals with tautologous clauses dropped. The interchange format the resolution rule consumes.",
    },
    {
      term: "resolution rule",
      definition:
        "From A ∨ L and B ∨ ¬L infer A ∨ B: delete one complementary pair of literals from the union of two clauses and keep the rest. In set form, {¬P, Q} with {¬Q, R} gives {¬P, R}.",
    },
    {
      term: "refutation",
      definition:
        "Proof organized as contradiction: KB ⊨ φ is established by deriving the empty clause from KB ∧ ¬φ. Sound and refutation-complete — the standard shape of machine proof.",
    },
    {
      term: "empty clause",
      definition:
        "The clause with no literals (□), derived when a resolution deletes a complementary pair and nothing survives; the clause-level face of ⊥ and the target of every refutation.",
    },
    {
      term: "saturation",
      definition:
        "The fixpoint of the resolve-every-pair loop: no new clause is derivable. In propositional logic it always arrives (at most 3^n clauses over n atoms) and certifies non-entailment — but exhibits no countermodel.",
    },
  ],
  mistakes: [
    {
      mistake: "Resolving two clauses by merging them without deleting the complementary pair.",
      why: "The plain union keeps both Q and ¬Q, making the result a tautology — true in every world, so the 'inference' carries no information at all.",
      fix: "Say the rule in set form every time: delete the pair, keep the rest. The resolvent of {¬P, Q} and {¬Q, R} is {¬P, R} — nothing else.",
    },
    {
      mistake: "Reading a tautologous clause like ¬Q ∨ Q as a contradiction and counting it as □.",
      why: "A clause is a DISJUNCTION: Q ∨ ¬Q is true in every world. Contradictions are conjunctions of opposites; the empty clause arises only when a resolution deletes a pair and nothing survives.",
      fix: "Test the clause in one world, then another: Q true makes it true, Q false makes it true. Always true means tautology means dropped.",
    },
    {
      mistake: "Feeding the prover the goal itself instead of its negation.",
      why: "The refutation method needs KB ∧ ¬φ; with φ added instead, the set is usually satisfiable, the loop saturates, and a perfectly valid argument looks unprovable.",
      fix: "The setup checklist is always: premises to clauses, NEGATE the goal, convert that, target □. If a known-valid argument saturates, check the negation first.",
    },
    {
      mistake: "Expecting saturation to hand you the counterexample.",
      why: "Saturation certifies non-entailment (propositional case) but constructs no model — the witnessing assignment is something a truth table shows directly.",
      fix: "When you need WHY the entailment fails, run d-02's table — or search the saturated clauses yourself: they are equivalent to premises-plus-negated-goal, so any model of them is a countermodel.",
    },
  ],
  takeaways: [
    "CNF is the interchange format: implication out, negations onto atoms, ∨ distributed over ∧ — clauses as sets of literals, tautologies dropped.",
    "Resolution is one rule — delete a complementary pair, keep the rest: {¬P, Q} with {¬Q, R} gives {¬P, R}.",
    "Proof by refutation: KB ⊨ φ exactly when KB ∧ ¬φ derives □ — sound and refutation-complete for propositional logic.",
    "Saturation is the honest 'no': over n atoms at most 3^n clauses exist, so the loop always stops — and its fixpoint certifies non-entailment, though it shows no countermodel.",
    "Clause representation, resolve loop, saturation check — the prover's three pieces are exactly what d-07 lifts to first-order logic by plugging in unification.",
  ],
  quiz: [
    {
      id: "d-04-q1",
      prompt: "Resolve {¬P, Q} with {¬Q, R}:",
      options: [
        {
          text: "{¬P, R}",
          correct: true,
          feedback:
            "Correct — delete the complementary pair Q/¬Q and keep every other literal: ¬P survives from the first clause, R from the second.",
        },
        {
          text: "{¬P, Q, ¬Q, R}",
          correct: false,
          feedback:
            "That is the plain union — it contains both Q and ¬Q, so it is a tautology, true in every world. Resolution must DELETE the pair to say anything.",
        },
        {
          text: "□",
          correct: false,
          feedback:
            "□ requires the pair to exhaust both clauses — {Q} with {¬Q}. Here ¬P and R are left over, and they survive into the resolvent.",
        },
        {
          text: "{P, ¬R}",
          correct: false,
          feedback:
            "Nothing is negated in resolution — the complementary pair leaves by deletion, and the survivors keep their signs: ¬P stays ¬P, R stays R.",
        },
      ],
      explanation:
        "The set form is the safe form: find one complementary pair, delete it, keep the rest. Every distractor above is a way of doing something else with the union.",
    },
    {
      id: "d-04-q2",
      prompt: "Mid-conversion you meet the clause (¬Q ∨ Q). The pipeline says:",
      options: [
        {
          text: "Drop it — it is a tautology, true under every assignment, so it constrains nothing",
          correct: true,
          feedback:
            "Correct: a clause holding L and ¬L is satisfied in every world; deleting it preserves equivalence and keeps the clause set minimal, and resolution stays complete without tautologies.",
        },
        {
          text: "Keep it — it will later resolve to □",
          correct: false,
          feedback:
            "A tautologous clause never helps reach □: it is entailed by everything and resolves only into more tautologies. Provers drop it on sight.",
        },
        {
          text: "The conversion failed — CNF forbids a variable appearing twice in a clause",
          correct: false,
          feedback:
            "CNF forbids no such thing; it is just that L ∨ ¬L ≡ ⊤ makes this particular clause dead weight.",
        },
        {
          text: "Drop every clause mentioning Q as well",
          correct: false,
          feedback:
            "Only the tautologous clause goes — {¬Q, R} and {P, Q} from the same conversion carry real content.",
        },
      ],
      explanation:
        "Tautology-dropping is a convention with a guarantee behind it: the remaining clause set is equivalent to the original formula, and resolution on it remains refutation-complete.",
    },
    {
      id: "d-04-q3",
      prompt: "The prover reports □ from clauses({P→Q, P}) plus clauses(¬Q). What is proved?",
      options: [
        {
          text: "{P→Q, P} ⊨ Q — premises plus ¬Q are jointly unsatisfiable, which is the definition of entailment",
          correct: true,
          feedback:
            "Correct: □ is the clause-level face of ⊥ — KB ∧ ¬φ ⊨ ⊥, equivalent to KB ⊨ φ.",
        },
        {
          text: "The premises are inconsistent",
          correct: false,
          feedback:
            "The premises alone are perfectly consistent (P true, Q true satisfies both) — the contradiction needs the negated goal in the set. That is the whole refutation trick.",
        },
        {
          text: "Q is unsatisfiable",
          correct: false,
          feedback:
            "□ says the WHOLE set — premises plus negated goal — cannot all be true; Q on its own is satisfiable, and so is ¬Q.",
        },
        {
          text: "The prover found a model of the premises",
          correct: false,
          feedback:
            "Refutations produce no models at all — which is exactly what saturation also fails to give you on a non-theorem.",
        },
      ],
      explanation:
        "□ certifies unsatisfiability of premises AND negated goal — manufactured by the negation, on purpose. The premises by themselves stay consistent.",
    },
  ],

};
