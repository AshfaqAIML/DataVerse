/**
 * Lesson d-06 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_06: ClassicalLesson = {

  slug: "d-06",
  title: "Quantifiers and Unification",
  minutes: 35,
  summary:
    "For all and there exists, with the scope discipline that keeps translations honest — then unification, pattern matching with variables.",
  kind: "coding",
  objectives: [
    "Translate quantified statements between English and first-order logic without scope errors",
    "Apply the quantifier negation equivalences",
    "Compute most general unifiers by hand, including the occurs-check failure",
    "Implement a unifier and verify it on worked pairs",
  ],
  why: "First-order logic buys objects, relations and quantifiers at the price of two new ways to be wrong: scope errors in translation (the 'every student who studies passes' trap that flips a universal into an existence) and unification failures in deduction. Unification — finding the most general substitution that makes two atoms identical — is the single computation underneath resolution, logic programming and type inference; it is first-order logic's inner loop. Getting fluent at both, by hand and in code, is what makes the resolution prover of the next lesson possible rather than magical.",
  blocks: [
    { kind: "heading", text: "Quantifiers, and the discipline of scope" },
    {
      kind: "definition",
      term: "Quantifiers",
      informal:
        "∀ x — 'for every x'; ∃ x — 'there exists an x'. They bind a variable over a FORMULA, and the formula's extent is the scope.",
      formal: "\\forall x\\ \\phi \\quad \\exists x\\ \\phi \\quad \\text{where } x \\text{ is bound in } \\phi",
      why: "Almost every translation error is a scope error: what the quantifier governs, and where the negation sits.",
    },
    {
      kind: "predicateLogic",
      title: "The translation trap, both readings",
      entries: [
        {
          formula: "\\forall x \\ (Student(x) \\rightarrow Studies(x))",
          name: "every student studies",
          reading: "For each thing: IF it is a student THEN it studies. The implication is INSIDE the universal.",
          tone: "law",
        },
        {
          formula: "\\forall x \\ (Student(x) \\wedge Studies(x))",
          name: "everything is a studying student",
          reading: "Same quantifier, connective swapped: this asserts everything in the universe is a student who studies — the classic mistranslation of 'every'.",
          tone: "fallacy",
        },
        {
          formula: "Student(x) \\wedge Studies(x)",
          name: "free variable",
          reading: "No quantifier at all: x is FREE, and the formula's truth depends on what x names — a statement about a specific but unnamed thing.",
        },
      ],
      caption: "'Every' translates as ∀ with an implication; 'some' as ∃ with a conjunction. Mixing the pairs — ∀ with ∧, ∃ with → — is the four-way error that scope discipline prevents.",
    },
    {
      kind: "math",
      title: "Quantifier negation",
      displays: [
        { expr: "\\neg \\forall x\\ \\phi \\equiv \\exists x\\ \\neg \\phi", label: "not all = some don't" },
        { expr: "\\neg \\exists x\\ \\phi \\equiv \\forall x\\ \\neg \\phi", label: "none = all don't" },
      ],
      caption:
        "Negation flips the quantifier as it crosses — de Morgan's law for ∀ and ∃. These two lines are half of every normal-form conversion in first-order logic.",
    },
    { kind: "heading", text: "Unification: matching with variables" },
    {
      kind: "text",
      text: "Deduction needs to match formulas against formulas: does 'everything mortal dies' apply to 'Socrates dies'? **Unification** is the computation that answers such matches: given two expressions, find the most general substitution σ of terms for variables making them syntactically identical. 'Most general' matters — a more specific unifier (say, binding x to a constant when a variable would do) throws away generality that later resolutions could have used.",
    },
    {
      kind: "definition",
      term: "Most general unifier",
      informal:
        "The least-committal substitution making two atoms identical — bind only what must be bound, and only to what it must be bound to.",
      formal: "\\sigma: \\text{Unify}(a, b) = \\sigma \\implies a\\sigma = b\\sigma, \\text{ and } \\sigma \\text{ factors through every other unifier}",
      why: "Resolution's completeness depends on MGUs; ad-hoc matchers that over-commit silently lose proofs.",
    },
    {
      kind: "predicateLogic",
      title: "Unification, worked",
      entries: [
        {
          formula: "P(x, y) \\equiv P(a, z)",
          name: "two variables, two directions",
          reading: "The canonical first example: bind x to the constant a, and y to the variable z.",
        },
      ],
      unification: [
        {
          lhs: "P(x, y)",
          rhs: "P(a, z)",
          result: "{x/a, y/z}",
          steps: [
            "match P = P: same predicate, same arity — proceed",
            "x vs a: x is a variable, a a constant — bind {x/a}",
            "y vs z: both variables, neither bound — bind {y/z}",
          ],
        },
        {
          lhs: "Q(f(x), b)",
          rhs: "Q(y, b)",
          result: "{y/f(x)}",
          steps: [
            "f(x) vs y: y is an unbound variable — bind {y/f(x)}",
            "b vs b: identical constants — nothing to do",
          ],
        },
        {
          lhs: "P(x)",
          rhs: "P(f(x))",
          result: "no unifier — occurs check fails",
          steps: [
            "x vs f(x): x is a variable, but x OCCURS inside f(x)",
            "binding {x/f(x)} would build an infinite term — x = f(x) = f(f(x)) = ⋯",
            "the occurs check rejects it: no finite substitution works",
          ],
        },
      ],
      caption:
        "The third pair is the one naive implementations get wrong: without the occurs check, unification 'succeeds' by building an infinite term, and the prover either loops or lies.",
    },
    {
      kind: "pythonImpl",
      title: "A unifier over term tuples",
      intent:
        "Terms as nested tuples — ('P', 'x', 'y') — with lowercase strings as variables; the unifier returns the MGU dict or None, and the occurs check is explicit.",
      code: `def unify(a, b, s={}):
    """Term tuples like ('P', 'x', ('f','y')). Returns MGU dict or None."""
    if a == b:
        return dict(s)
    if isinstance(a, str) and a.islower():          # variable
        return bind(a, b, s)
    if isinstance(b, str) and b.islower():
        return bind(b, a, s)
    if isinstance(a, tuple) and isinstance(b, tuple) and a[0] == b[0] and len(a) == len(b):
        for x, y in zip(a[1:], b[1:]):
            s2 = unify(x, y, s)
            if s2 is None:
                return None
            s = s2
        return dict(s)
    return None

def bind(var, term, s):
    if var in s:
        return unify(s[var], term, s)
    if occurs(var, term, s):
        return None                                # occurs check
    out = dict(s); out[var] = term
    return out

def occurs(var, term, s):
    if term == var:
        return True
    if isinstance(term, tuple):
        return any(occurs(var, t, s) for t in term[1:])
    if isinstance(term, str) and term in s:
        return occurs(var, s[term], s)
    return False

print(unify(("P", "x", "y"), ("P", "a", "z")))
print(unify(("Q", ("f", "x"), "b"), ("Q", "y", "b")))
print(unify(("P", "x"), ("P", ("f", "x"))))`,
      output: `{'x': 'a', 'y': 'z'}
{'y': ('f', 'x')}
None`,
      walkthrough: [
        "Variables are lowercase strings, constants and function names uppercase — the Prolog convention, compact and readable.",
        "bind() is where substitution composition hides: if the variable is already bound, unify the BINDING with the new term — that is what makes chains like x→y, y→a collapse correctly.",
        "The occurs check is one function and one call; skipping it is the classic bug, and the third print shows the None it should return.",
        "None — not an exception, not a partial dict — is the honest 'no unifier'; the resolution prover treats it as 'this pair cannot resolve'.",
      ],
      project: "This unifier drops into the Part D project's resolution prover unchanged — it is the engine's only nontrivial part.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-06-e1",
      exerciseKind: "predict-output",
      prompt:
        "Extend the program with one more pair: unify(('R', 'x', 'x'), ('R', 'A', 'B')) — uppercase constants, per the walkthrough's convention. What does it print?",
      expectedOutput: "None",
      solution: "None",
      explanation:
        "The first argument binds x to the constant A; the second then requires x (now A) to unify with the constant B — constant against constant, no substitution possible. (Mind the convention: lowercase strings are variables, so 'a' and 'b' would unify rather than clash.) Unification is sequential: earlier bindings constrain later positions, and equal-variables-in-one-atom encode an equality demand.",
      concepts: ["unification", "MGU"],
    },
    {
      kind: "exercise",
      id: "d-06-e2",
      exerciseKind: "trace",
      prompt:
        "Translate, with correct scope: 'Not every bird flies' and 'No bird that flies is a penguin that swims.' Then negate the second and push the negation inward as far as it goes.",
      solution:
        "(1) ¬∀x (Bird(x) → Flies(x)) ≡ ∃x (Bird(x) ∧ ¬Flies(x)) — 'some bird doesn't fly'. (2) ∀x ((Flies(x) ∧ Bird(x)) → ¬(Penguin(x) ∧ Swims(x))) — careful with the reading: no flying bird is a swimming penguin. Negating: ¬∀x(...) ≡ ∃x((Flies(x) ∧ Bird(x)) ∧ (Penguin(x) ∧ Swims(x))) — 'some flying bird is a swimming penguin'. The negation crossed the ∀ (flipping it to ∃), turned the implication into a conjunction (¬(A→B) ≡ A ∧ ¬B), and crossed the inner ¬(P∧S) into ¬P ∨ ¬S before the outer ¬... the final form depends on how deep you push; both one-step and fully-pushed forms are correct answers to different questions — state which you are giving.",
      explanation:
        "Quantifier negation plus the implication law are the whole toolkit: every prenex-form conversion (next lesson's Skolemization pipeline) is these two moves, applied repeatedly and in the right order.",
      concepts: ["quantifier scope", "quantifier negation"],
    },
    {
      kind: "exercise",
      id: "d-06-e3",
      exerciseKind: "concept-check",
      prompt: "Why does resolution NEED most general unifiers, not just any unifier?",
      options: [
        { text: "Speed: MGUs are cheaper to compute", correct: false, feedback: "MGU computation and specific unification cost the same order — the reason is semantic, not performance." },
        { text: "Completeness: over-committed substitutions can block derivations that a general one would find — the empty clause may be reachable only through the general route", correct: true, feedback: "Correct: bind x to a when a variable would do, and every later resolution through that clause is restricted to a-specific facts. Resolution with MGUs is refutation-complete; with arbitrary unifiers it is not." },
        { text: "Soundness: non-general unifiers derive false conclusions", correct: false, feedback: "Any genuine unifier keeps resolution SOUND — the risk is missed proofs (incompleteness), not wrong ones." },
        { text: "It is a convention with no technical consequence", correct: false, feedback: "It is the difference between Prolog working and Prolog silently losing theorems." },
      ],
      solution: "Generality preserves proof paths; over-commitment prunes them. MGU keeps every option the syntax allows.",
      explanation: "Lifted resolution's completeness theorem is stated over MGUs — the same reason type inference keeps metavariables as long as possible.",
      concepts: ["MGU", "refutation completeness"],
    },
  ],
  terms: [
    {
      term: "scope",
      definition: "The formula a quantifier governs — the extent of its binding. Mis-set scope is the root of translation errors.",
    },
    {
      term: "substitution (σ)",
      definition: "A finite map from variables to terms, applied to expressions simultaneously; unifiers are substitutions that make two expressions identical.",
    },
    {
      term: "occurs check",
      definition: "The refusal to bind a variable to a term containing it — preventing infinite terms like x = f(x). The most-skipped, most-regretted line in naive unifiers.",
    },
    {
      term: "lifted inference",
      definition: "Inference with variables — propositional rules applied 'for all instantiations at once' via unification; how resolution generalizes to first-order logic.",
    },
  ],
  mistakes: [
    {
      mistake: "Translating 'every A is B' as ∀x (A(x) ∧ B(x)).",
      why: "The conjunction asserts everything is an A; the implication is the shape that says: IF an A, THEN a B.",
      fix: "'Every' pairs with →; 'some' pairs with ∧. Chant the pairs until they are reflexive.",
    },
    {
      mistake: "Skipping the occurs check for speed.",
      why: "The unifier 'succeeds' on x vs f(x) by building an infinite term; the prover then loops or diverges on inputs the textbook says are unifiable-free.",
      fix: "Keep the check. If a benchmark genuinely needs it off (rare, controlled data), document the invariant that makes it safe.",
    },
  ],
  takeaways: [
    "'Every' is ∀ with an implication; 'some' is ∃ with a conjunction — the four-way pairing that keeps translations honest.",
    "Negation flips quantifiers as it crosses them: ¬∀ ≡ ∃¬, ¬∃ ≡ ∀¬ — de Morgan for the first order.",
    "Unification finds the most general substitution making two atoms identical; generality is what preserves completeness.",
    "The occurs check is one function standing between you and infinite terms.",
    "This lesson's unifier is the entire nontrivial core of the resolution prover — the next lesson just adds clause bookkeeping around it.",
  ],
  quiz: [
    {
      id: "d-06-q1",
      prompt: "∃x (Student(x) → Studies(x)) is best read as:",
      options: [
        { text: "Some student studies", correct: false, feedback: "That would be ∃x (Student(x) ∧ Studies(x)) — the conjunction. With → the formula is nearly vacuous." },
        { text: "There is something which, if a student, studies — a claim trivially true whenever anything is a non-student", correct: true, feedback: "Correct — the ∃-with-→ combination is the classic vacuity: any non-student in the universe satisfies it. Existentials want conjunctions." },
        { text: "Every student studies", correct: false, feedback: "That is the ∀ reading." },
        { text: "No student studies", correct: false, feedback: "That is ¬∃x(Student(x) ∧ Studies(x))." },
      ],
      explanation: "Quantifier–connective pairing is not stylistic: ∃ with → is almost always a translation bug, and this row of the table is why.",
    },
    {
      id: "d-06-q2",
      prompt: "Unify P(x, f(y)) with P(g(z), x). The MGU is:",
      options: [
        { text: "{x/g(z), y/z}... binding x twice", correct: false, feedback: "x appears in both positions — the second occurrence constrains the first: after {x/g(z)}, the second x is g(z), which must unify with f(y) — and g(z) vs f(y) are different function symbols. No unifier at all, in fact: the answer is None." },
        { text: "No unifier: the first binding x↦g(z) forces the second argument to unify g(z) with f(y) — different function heads", correct: true, feedback: "Correct — and well traced. The two occurrences of x create an equality demand that the distinct function symbols cannot meet." },
        { text: "{x/f(y), x/g(z)} — a two-binding substitution", correct: false, feedback: "One variable, one binding: substitutions are functions, not multisets." },
        { text: "{y/g(z)}", correct: false, feedback: "That leaves both x positions unresolved against each other." },
      ],
      explanation: "Repeated variables are the unifier's equality constraints — the detail that separates tracing from guessing.",
    },
  ],

};
