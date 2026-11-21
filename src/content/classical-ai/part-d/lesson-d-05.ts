/**
 * Lesson d-05 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_05: ClassicalLesson = {

  slug: "d-05",
  title: "Predicates, Constants and Terms",
  minutes: 25,
  summary:
    "From propositions to predicates: objects, relations, functions — the vocabulary of first-order logic.",
  kind: "concept",
  objectives: [
    "Define predicate, term and atom, and label the parts of any first-order formula on sight",
    "Write a domain signature — symbols, kinds, arities, readings — and check formulas against it",
    "Build terms from constants, variables and function symbols, including nested applications such as FatherOf(FatherOf(Bianca))",
    "Translate family-domain sentences into atoms and literals in both directions — English into FOL and back",
    "Argue with counts why a fact-per-person propositional encoding collapses as the domain grows, and what predicates change about it",
  ],
  why: "Every piece of machinery downstream in this part consumes formulas built from exactly these parts: d-06's unifier matches atoms term by term, the part project's resolution prover refutes clauses built from literals, and d-08's knowledge graphs store ground atoms by the million. The vocabulary is small — which is exactly why errors hide in it. A predicate used as a function, a constant written lowercase so the convention reads it as a variable, an arity that drifts between spec and code: none of these slow the machinery down. It computes happily with a different statement than the one you meant, and the bug surfaces three lessons later as a 'prover failure' that is really a naming slip. This lesson installs the discipline at the source — signature before formula, terms that name, atoms that claim, order, case and arity checked on sight — and it settles the 1,000-fact problem propositional logic leaves on the table: one predicate symbol and one variable replace a ledger that grows by two lines per subject forever.",
  blocks: [
    {
      kind: "text",
      text: "A king wants his knowledge base to know one thing: everyone in the kingdom is loyal. Propositional logic can say it — just not gracefully. With 1,000 subjects the claim is a conjunction of 1,000 atomic propositions, `L₁ ∧ L₂ ∧ ⋯ ∧ L₁₀₀₀`, and the moment the king adds 'loyal subjects pay tribute' the scribe owes another 1,000 implications, one per subject. When subject number 1,001 arrives, two more lines are due — a fresh loyalty fact and a fresh tribute rule — and nothing in the logic notices if the scribe forgets; the base is simply, silently wrong about the newcomer. First-order logic says all of it in two lines that no future subject will ever touch, and this lesson builds the vocabulary those lines are written in: predicates, terms, and the atoms they form.",
    },
    {
      kind: "propositions",
      title: "One kingdom, two encodings",
      entries: [
        {
          formula: "L_{1} \\wedge L_{2} \\wedge \\dots \\wedge L_{1000}",
          name: "everyone is loyal — the ledger",
          reading:
            "A thousand atomic propositions, one per subject, and the thousand is the point: each symbol is opaque. Nothing in L₁₇ says it is about loyalty, or about a person, or connects it to L₁₈.",
        },
        {
          formula: "L_{17} \\rightarrow T_{17}",
          name: "loyal subjects pay tribute — one rule of a thousand",
          reading:
            "The king's second request costs a second thousand: one implication per subject, each forever coupled to the atom above it. The 1,001st subject edits both lists.",
        },
        {
          formula: "Loyal(Ada)",
          name: "the unit of fact, restated",
          reading:
            "One predicate of arity 1 applied to one constant: a claim about a named individual. The structure carries the meaning — which relation, about whom — and every subject's fact reuses the same two symbols.",
        },
        {
          formula: "\\forall x \\ (Subject(x) \\rightarrow Loyal(x))",
          name: "everyone is loyal — the law",
          tone: "definition",
          reading:
            "The whole ledger in one line, and it never changes again: a new subject is a new fact, `Subject` of the newcomer, not an edit to a law. What the ∀ reaches — its scope — is d-06's opening subject.",
        },
        {
          formula: "\\forall x \\ ((Subject(x) \\wedge Loyal(x)) \\rightarrow Tribute(x))",
          name: "loyal subjects pay tribute — the law",
          tone: "definition",
          reading:
            "The second thousand rules, likewise, once. Two laws for the whole kingdom, and growth costs one fact per subject — never a rule rewrite.",
        },
      ],
      caption:
        "The connectives did not change; the vocabulary under them did. The ledger hard-codes the population into its formulas; the laws factor it out — people appear only in facts, laws mention only variables. Making that difference precise is the rest of this lesson.",
    },
    {
      kind: "text",
      text: "Notice what carried over untouched: ¬, ∧, ∨, →, ↔ — the whole propositional engine from d-02 still runs. First-order logic keeps the engine and swaps the fuel. Where a propositional formula could only plant an opaque atom, you now write structured ones, and the structure is the lesson: **terms** name objects, **predicates** relate them, **atoms** claim — and, next lesson, **quantifiers** bind. One convention runs through this part, and d-06's unifier will enforce it with a single `islower()` test: uppercase-initial strings are constants and function symbols (Ada, Enzo, FatherOf), lowercase strings are variables (x, y, z). Predicate names are uppercase-initial too — Parent, Loyal, Ancestor — and position keeps the kinds apart: a predicate symbol stands at the head of an atom, terms fill the slots, and neither ever appears where the other belongs. The running domain is a family of six: the couple Ada and Enzo, their children Bianca and Clio, and grandchildren Fiona (Bianca's child) and Dario (Clio's child).",
    },
    { kind: "heading", text: "Predicates and terms" },
    {
      kind: "definition",
      term: "Predicate",
      informal:
        "A relation symbol with a fixed arity — a number of argument slots. Parent has arity 2 ('the first is a parent of the second'), Loyal has arity 1. Applied to exactly that many terms it forms a claim that is true or false; a predicate never returns an object — naming objects is a function symbol's job.",
      formal: "P(t_{1}, \\dots, t_{n}) \\quad \\text{with } P \\text{ a relation symbol of arity } n",
      why: "Arity is part of the symbol's identity: Parent(Ada, Bianca, Clio) is not a false claim but an ill-formed one — a parser rejects it before any reasoning begins.",
    },
    {
      kind: "definition",
      term: "Term",
      informal:
        "The noun phrase of the language — the only thing that can name an object. A constant (Ada) names one object; a variable (x) ranges over objects; a function symbol applied to terms (FatherOf(Bianca) — 'the father of Bianca') builds a new name from old ones, and nests: FatherOf(FatherOf(Bianca)) names the paternal grandfather whether or not anyone has named him with a constant.",
      formal:
        "\\cases{c, \\text{a constant naming one object}; x, \\text{a variable ranging over objects}; f(t_{1}, \\dots, t_{k}), \\text{a function symbol applied to } k \\text{ terms}}",
      why: "Terms are where functions live in logic: FatherOf(Bianca) is a name (of Enzo), not a claim — claims are what atoms make of terms.",
    },
    { kind: "heading", text: "Atoms and literals" },
    {
      kind: "text",
      text: "Apply a predicate to as many terms as its arity and you have an **atom** — the smallest formula that can be true or false. `Parent(Ada, Bianca)` is an atom about two named people. So is `Loyal(x)`, but it is not a fact: with x free it is a *condition*, true of some objects and false of others, until a quantifier binds it or a substitution instantiates it — and that matching is exactly what d-06's unification does. Negate an atom and you have a **literal**: `¬Parent(Clio, Fiona)` is one symbol flip away from its atom, and a different claim. An atom with no variables anywhere is **ground** — `Parent(Ada, Bianca)` is ground, `Parent(x, Bianca)` is not — and ground atoms are what a fact store can hold. d-08's knowledge graphs are this idea at engineering scale: every triple is a two-place predicate applied to two constants, a ground atom by the million.",
    },
    {
      kind: "definition",
      term: "Atom",
      informal:
        "A predicate applied to exactly as many terms as its arity: Parent(Ada, Bianca), Loyal(x), Ancestor(FatherOf(Bianca), Fiona). Atoms are first-order logic's replacements for propositional variables — structured where L₁₇ was opaque, so questions can aim at the structure.",
      formal: "A = P(t_{1}, \\dots, t_{n}) \\quad \\text{where } P \\text{ has arity } n",
      why: "Every first-order formula is atoms all the way down: connectives combine them, quantifiers bind their variables, and the resolution prover you will build in this part's project refutes with their negations.",
    },
    {
      kind: "table",
      title: "The grammar in one table",
      headers: ["Vocabulary", "In the family book", "What it does"],
      rows: [
        ["Constants", "Ada, Enzo, Bianca, Clio, Fiona, Dario", "Name one object each — uppercase-initial by the convention"],
        ["Variables", "x, y, z", "Range over objects — lowercase by the convention, and bindable by quantifiers"],
        ["Function symbols", "FatherOf (arity 1)", "Build terms from terms: FatherOf(Bianca) names Enzo; FatherOf(FatherOf(Bianca)) names his father"],
        ["Predicates", "Parent (2), Sibling (2), Ancestor (2)", "Relation symbols; applied to terms they form atoms — claims, not names"],
        ["Connectives", "¬, ∧, ∨, →, ↔", "Combine formulas — carried over unchanged from propositional logic"],
        ["Quantifiers", "∀x, ∃z", "Bind variables over formulas; how far each reaches is the question d-06 opens with"],
        ["Parentheses", "( )", "Group arguments and formulas; with arity, they make structure unambiguous"],
      ],
      caption:
        "A well-formed first-order formula is built on three levels: terms name (constants, variables, function applications), atoms claim (a predicate applied to arity-many terms), formulas combine (connectives over atoms, quantifiers binding variables). Check the smallest parts first — arity, case, order — and the rest of the formula takes care of itself.",
    },
    { kind: "heading", text: "Translation drills, both directions" },
    {
      kind: "example",
      title: "Into the vocabulary, and back out",
      problem:
        "The family book, in full: Ada and Enzo are the parents of Bianca and Clio; Bianca is Fiona's parent; Clio is Dario's parent; and in this book FatherOf(Bianca) names Enzo. Working by hand: (a) translate 'Ada is an ancestor of Fiona'; (b) translate 'Bianca's father is an ancestor of Bianca'; (c) translate ¬Sibling(Fiona, Dario) back into English, and say whether it holds.",
      steps: [
        {
          text: "(a) Fix the relation, then the order.",
          detail:
            "Ancestor is two-place, ancestor first: Ancestor(Ada, Fiona). The reversed atom is a different claim — Ancestor(Fiona, Ada) says the granddaughter begat the matriarch — so order in a relation is meaning, not formatting.",
        },
        {
          text: "(b) The subject is a term, not a constant.",
          detail:
            "'Bianca's father' names no constant in the book, but the function symbol builds the name: FatherOf(Bianca), which here denotes Enzo. The atom is Ancestor(FatherOf(Bianca), Bianca) — a compound term sitting in an argument slot — and it is true: Enzo is Bianca's parent.",
        },
        {
          text: "(c) Read the shape before the words.",
          detail:
            "A negation on a two-place predicate applied to two constants: a negative literal. 'Fiona and Dario are not siblings.' It holds — Fiona's parent is Bianca, Dario's is Clio; they are cousins.",
        },
      ],
      result:
        "(a) Ancestor(Ada, Fiona) — a ground atom. (b) Ancestor(FatherOf(Bianca), Bianca) — ground, with a machine-readable term inside. (c) 'Fiona and Dario are not siblings' — a negative literal, true in the book.",
    },
    {
      kind: "predicateLogic",
      title: "The family book, two encodings",
      entries: [
        {
          formula: "Parent(Ada, Bianca)",
          name: "one fact, structured",
          reading:
            "Ada stands in the Parent relation to Bianca. The propositional shadow of this fact is a fresh opaque atom — P₁₇, say — one more symbol that knows nothing about Ada, Bianca or parenthood, and cannot be asked 'who are Ada's children?'.",
        },
        {
          formula: "\\forall x \\forall y \\ (Parent(x, y) \\rightarrow Ancestor(x, y))",
          name: "every parent is an ancestor",
          reading:
            "One line for all 36 ordered pairs of the six-person cast. Propositionally the same law is one implication per pair — 36 rules here, 13 more when a seventh person arrives — while this line never changes: people live in facts, laws mention only variables.",
        },
        {
          formula:
            "Ancestor(x, y) \\leftrightarrow (Parent(x, y) \\vee \\exists z \\ (Parent(x, z) \\wedge Ancestor(z, y)))",
          name: "ancestor, defined recursively",
          tone: "definition",
          reading:
            "A parent is an ancestor, and so is the parent of any ancestor — two clauses that generate the whole Ancestor relation from Parent. x and y are free: a schema awaiting its quantifiers, which is precisely the scope discipline d-06 opens with.",
        },
      ],
      caption:
        "Same knowledge, two vocabularies — and the bridge to what follows. Quantifiers (d-06) state the laws once; unification then matches the pattern Parent(x, y) against the ground fact Parent(Ada, Bianca) in a single step — {x/Ada, y/Bianca} — which is how a law becomes every instance a query needs.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-05-e1",
      exerciseKind: "concept-check",
      prompt:
        "Which formula says 'Ada is an ancestor of Fiona' — and is well-formed under the family book's signature (Ancestor takes two arguments) and this course's naming convention?",
      options: [
        {
          text: "Ancestor(Fiona, Ada)",
          correct: false,
          feedback:
            "Well-formed but reversed: it says Fiona is an ancestor of Ada. In a relation, argument order is part of the meaning — position 1 is the ancestor here.",
        },
        {
          text: "Ancestor(Ada, Fiona)",
          correct: true,
          feedback:
            "Correct — the ancestor first, two constants uppercase-initial per the convention, and exactly two terms for a two-place predicate.",
        },
        {
          text: "Ancestor(ada, fiona)",
          correct: false,
          feedback:
            "Lowercase marks variables in this part's convention, so this is a pattern about two unnamed things — true or false depending on what they name — not a fact about the people.",
        },
        {
          text: "Ancestor(Ada, Fiona, Bianca)",
          correct: false,
          feedback:
            "Arity violation: three terms for a two-place predicate. Not false — ill-formed; a parser rejects it before any reasoning starts.",
        },
      ],
      solution:
        "Ancestor(Ada, Fiona) — a two-place predicate applied to two constants, with the ancestor in the first slot.",
      explanation:
        "The three distractors are the three ways atoms fail: reversed order, lowercase constants read as variables, and drifted arity. Checking order, case and arity is the whole review, and it takes seconds.",
      concepts: ["atom", "arity", "naming convention"],
    },
    {
      kind: "exercise",
      id: "d-05-e2",
      exerciseKind: "trace",
      prompt:
        "Translate both directions against the family book (Ada and Enzo are Bianca's and Clio's parents; Bianca is Fiona's parent; Clio is Dario's; FatherOf(Bianca) names Enzo). Into FOL: (a) 'Clio is a parent of Dario.' (b) 'Ada is not a parent of Fiona.' Into English: (c) Ancestor(FatherOf(Bianca), Fiona) — and for each of the three, say whether it holds in the book.",
      solution:
        "(a) Parent(Clio, Dario) — parent first; it holds, Clio is Dario's parent. (b) ¬Parent(Ada, Fiona) — a negative literal; it holds: Fiona's parent is Bianca, and Ada is Fiona's grandparent. (c) 'Bianca's father is an ancestor of Fiona' — the term FatherOf(Bianca) names Enzo without spending a constant, and it holds: Enzo is Bianca's parent, Bianca is Fiona's, and the recursive definition makes him her ancestor.",
      explanation:
        "Each direction runs the same check: find the relation, fix the order, build every argument as a term — constant or function application — and only then reach for negation. Part (c) is why terms earn their keep: the atom never names Enzo, yet says something true about him.",
      concepts: ["terms", "literals", "translation"],
    },
  ],
  terms: [
    {
      term: "predicate",
      definition:
        "A relation symbol with a fixed arity — Parent/2, Loyal/1. Applied to as many terms as its arity it forms an atom: a claim that is true or false, never a value.",
    },
    {
      term: "term",
      definition:
        "The name of an object: a constant (Ada), a variable (x), or a function symbol applied to terms (FatherOf(Bianca)). Terms are the only things that can occupy a predicate's argument slots.",
    },
    {
      term: "atom",
      definition:
        "A predicate applied to exactly as many terms as its arity — Parent(Ada, Bianca). The structured replacement for the propositional variable: it says which relation, about which things.",
    },
    {
      term: "literal",
      definition:
        "An atom or its negation — Parent(Ada, Bianca) or ¬Parent(Ada, Bianca). Literals are the units clauses are built from in this part's resolution prover.",
    },
    {
      term: "ground",
      definition:
        "Variable-free — Parent(Ada, Bianca) is ground, Parent(x, Bianca) is not. Ground atoms are the facts a store can hold; d-08's triples are ground atoms at scale.",
    },
  ],
  mistakes: [
    {
      mistake: "Using a predicate where a function belongs: writing Ancestor(Ada, Fiona) and expecting it to return 'the ancestor', or reading FatherOf(Bianca) as a claim.",
      why: "Predicates hold or fail of tuples — they return truth, not objects. Function symbols build terms — they name objects and assert nothing. Programming habits transfer badly, because f(x) in code does both jobs at once.",
      fix: "Ask of every symbol: does this NAME a thing (function symbol, building a term) or SAY something (predicate, forming an atom)? FatherOf(Bianca) names Enzo; Parent(Enzo, Bianca) says Enzo is Bianca's parent.",
    },
    {
      mistake: "Letting arity drift — Parent(Ada, Bianca, Clio) in one formula and Parent(Ada, Bianca) in the next.",
      why: "Arity is part of the symbol's identity. The three-argument version is not false; it is ill-formed — a strict parser rejects it, while a permissive one silently invents a new three-place Parent and the knowledge base forks.",
      fix: "Write the signature first — symbol, kind, arity, reading — and check every formula against it. The vocabulary table above is the pattern; keep one beside the code for the whole part.",
    },
    {
      mistake: "Writing constants lowercase — Parent(ada, fiona) — because it looks like ordinary code.",
      why: "The convention d-06's unifier implements reads lowercase strings as variables, so the 'fact' becomes a pattern on two variables that matches nothing. The failure is silent: nothing crashes, nothing is found.",
      fix: "Uppercase-initial for constants and function symbols, lowercase for variables, no exceptions — then let the arity check catch whatever slips past the case check.",
    },
  ],
  takeaways: [
    "A predicate is a relation symbol with an arity; applied to terms it forms an atom — the smallest formula that can be true or false.",
    "Terms name objects three ways — constants (Ada), variables (x), function applications (FatherOf(Bianca)) — and nothing else in the language names anything.",
    "One predicate replaces a thousand propositional atoms: growth adds facts to the base, never edits to its laws.",
    "Order, case and arity are the three checks: `Ancestor(Fiona, Ada)` reverses the claim, `Ancestor(Ada, fiona)` makes it a pattern on a variable, `Ancestor(Ada, Fiona, Bianca)` is not a formula at all.",
    "The vocabulary is one step from an engine: d-06 binds these variables with quantifiers and matches `Parent(x, y)` to `Parent(Ada, Bianca)` with {x/Ada, y/Bianca}.",
  ],
  quiz: [
    {
      id: "d-05-q1",
      prompt:
        "The ledger encodes 'everyone is loyal' as 1,000 conjoined atoms L₁ … L₁₀₀₀. What does the predicate encoding buy that the ledger cannot?",
      options: [
        {
          text: "Shorter formulas",
          correct: false,
          feedback:
            "True but shallow — brevity is a symptom. The mechanism is the shared symbol: every loyalty fact, present and future, uses the same predicate, so one rule or one query touches them all.",
        },
        {
          text: "A shared relation symbol: every subject's fact reuses Loyal, so 'who is loyal?' is one query over one relation, and a new subject is a new fact — never a rule edit",
          correct: true,
          feedback:
            "Correct — the predicate factors the population out of the law. That is what queries grip, and what stays stable as the kingdom grows.",
        },
        {
          text: "It is closer to English, so translations are easier to check",
          correct: false,
          feedback:
            "Convenience is real but secondary. English can state the ledger too; what it cannot do is make a thousand separate symbols answer a single question.",
        },
        {
          text: "Propositional logic cannot conjoin a thousand atoms",
          correct: false,
          feedback:
            "It can — the ledger is exactly such a conjunction. One statement was never the problem; a thousand coupled statements that must change in lockstep is.",
        },
      ],
      explanation:
        "The ledger's atoms share nothing; predicate atoms share a symbol. Shared structure is what queries, rules, and d-06's unification can grip.",
    },
    {
      id: "d-05-q2",
      prompt: "Which of these is NOT a term?",
      options: [
        {
          text: "FatherOf(Bianca)",
          correct: false,
          feedback:
            "A term — a function symbol applied to a constant; it names Enzo and claims nothing. Function applications build terms.",
        },
        {
          text: "x",
          correct: false,
          feedback:
            "A term — a variable, ranging over the domain's objects until something binds it.",
        },
        {
          text: "Ada",
          correct: false,
          feedback: "A term — a constant, naming one person.",
        },
        {
          text: "Parent(Ada, x)",
          correct: true,
          feedback:
            "Correct — this is an atom: a predicate applied to terms, the smallest thing that can be true or false. Terms name; atoms claim.",
        },
      ],
      explanation:
        "The term/atom boundary is the function/predicate boundary: FatherOf(Bianca) names a person, Parent(Ada, x) says something — confusing the two is the classic first-order slip.",
    },
    {
      id: "d-05-q3",
      prompt:
        "The kingdom grows from 1,000 subjects to 1,001, and the king tracks loyalty and tribute ('loyal subjects pay tribute'). Count the NEW statements each knowledge base needs:",
      options: [
        {
          text: "Propositional: 2 — the newcomer's loyalty atom and their tribute rule; first-order: 1 — the fact that the newcomer is a subject",
          correct: true,
          feedback:
            "Correct — the ledger needs L₁₀₀₁ and L₁₀₀₁ → T₁₀₀₁; the first-order base needs only Subject(NewName), because both laws were stated once, over variables.",
        },
        {
          text: "Propositional: 1 — first-order: 1",
          correct: false,
          feedback:
            "The propositional base needs the rule as well: without L₁₀₀₁ → T₁₀₀₁, nothing links the newcomer's loyalty to their tribute.",
        },
        {
          text: "Propositional: 2,002 — first-order: 2",
          correct: false,
          feedback:
            "2,002 is the whole ledger after growth (1,001 atoms plus 1,001 rules), but the existing 2,000 statements stand untouched — the question is the delta, and the delta is two lines.",
        },
        {
          text: "Neither needs anything new — the laws are already general",
          correct: false,
          feedback:
            "Half right at best: the first-order laws are general, but the newcomer still needs one fact — Subject(NewName) — or no law ever applies to them. And the ledger needs its two lines.",
        },
      ],
      explanation:
        "Growth cost is the honest measure of an encoding: the ledger pays one fact plus one rule per general law, per subject; the predicate encoding pays one fact, full stop.",
    },
  ],

};
