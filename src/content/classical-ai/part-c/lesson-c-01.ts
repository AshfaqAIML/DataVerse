/**
 * Lesson c-01 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_01: ClassicalLesson = {

  slug: "c-01",
  title: "Variables, Domains and Constraints",
  minutes: 30,
  summary:
    "Map coloring, job scheduling and Sudoku as one idea: assign values to variables without breaking constraints.",
  kind: "concept",
  objectives: [
    "State a constraint satisfaction problem as the triple ⟨X, D, C⟩",
    "Draw a constraint graph and say what its shape predicts",
    "Explain why a CSP is a search problem where the path does not matter",
    "Formulate map coloring, scheduling and Sudoku in the same formalism",
  ],
  why: "Most problems that look like search are actually assignment problems: a schedule is not a route you walk, it is a set of slots you fill — and nothing about the ORDER of filling survives into the answer. Classical AI gives assignment problems their own formalism because their structure is exploitable: constraints connect few variables at a time, and that local structure lets algorithms prune entire regions of the space without ever touching them. Sudoku at scale, exam timetabling, crew scheduling, chip layout — the industry's constraint solvers are classical AI running production workloads today, and this lesson is the vocabulary they all share.",
  blocks: [
    {
      kind: "text",
      text: "A search problem from Part A asks for a path; a constraint satisfaction problem asks for an **assignment** — a value for each variable such that every constraint holds. The difference sounds small and changes everything: because solutions are static configurations, the successor function's careful ordering semantics disappear, and what remains is pure structure — which variables constrain which, and how tightly.",
    },
    {
      kind: "definition",
      term: "Constraint satisfaction problem",
      informal:
        "Variables with domains of candidate values, plus constraints that say which combinations may coexist. A solution is one value per variable breaking no constraint.",
      formal: "\\langle X, D, C \\rangle \\text{ with } X = \\{x_1, \\dots, x_n\\}, D_i \\neq \\emptyset, C \\subseteq \\text{tuples over } X",
      why: "The formalism is the search problem's state-completeness rule with the path removed — everything the algorithms need, nothing they don't.",
    },
    { kind: "heading", text: "Three problems, one triple" },
    {
      kind: "example",
      title: "Map coloring as a CSP",
      problem:
        "Color Australia's six mainland states with three colors so that neighboring states differ.",
      steps: [
        { text: "Variables: one per state.", detail: "X = {WA, NT, SA, Q, NSW, V} — Tasmania touches nobody and is omitted from the classic instance." },
        { text: "Domains: the same three colors for every variable.", detail: "D = {r, g, b} for each — uniform domains are the norm, not the rule." },
        { text: "Constraints: one binary not-equal per shared border.", detail: "SA borders all five others — the star of the graph and the source of all the difficulty." },
        { text: "The solution concept: a complete assignment with no violated border.", detail: "Nobody cares which color was chosen first — the order of assignment is not part of the answer. That is the CSP signature." },
      ],
      result:
        "⟨X, D, C⟩ with 6 variables, |D| = 3, and 9 constraints (WA–NT, WA–SA, NT–SA, NT–Q, SA–Q, SA–NSW, SA–V, Q–NSW, NSW–V).",
    },
    {
      kind: "constraintGraph",
      title: "Australia as a constraint graph",
      variables: [
        { id: "WA", label: "WA", domain: ["r", "g", "b"], x: 8, y: 30 },
        { id: "NT", label: "NT", domain: ["r", "g", "b"], x: 34, y: 14 },
        { id: "SA", label: "SA", domain: ["r", "g", "b"], x: 40, y: 44 },
        { id: "Q", label: "Q", domain: ["r", "g", "b"], x: 68, y: 20 },
        { id: "NSW", label: "NSW", domain: ["r", "g", "b"], x: 74, y: 54 },
        { id: "V", label: "V", domain: ["r", "g", "b"], x: 58, y: 76 },
      ],
      constraints: [
        { a: "WA", b: "NT", label: "≠" },
        { a: "WA", b: "SA", label: "≠" },
        { a: "NT", b: "SA", label: "≠" },
        { a: "NT", b: "Q", label: "≠" },
        { a: "SA", b: "Q", label: "≠" },
        { a: "SA", b: "NSW", label: "≠" },
        { a: "SA", b: "V", label: "≠" },
        { a: "Q", b: "NSW", label: "≠" },
        { a: "NSW", b: "V", label: "≠" },
      ],
      frameNote: "Initial state: every domain full. Each edge is one binary constraint; SA's five edges make it the hub.",
      caption:
        "The constraint graph is the CSP's true face: nodes are variables, edges are binary constraints. Its SHAPE — star, tree, dense — predicts which algorithms will win before any is run.",
    },
    {
      kind: "text",
      text: "Scheduling replaces colors with times and borders with precedence: each job is a variable, its domain the feasible start times, and each 'must finish before' relation a constraint — often written as an inequality over start times plus durations rather than a plain not-equal. Sudoku is the maximal-structure instance: 81 variables, domains 1–9, and 27 all-different constraints — one per row, column and box. All-different is *n-ary* (it binds nine variables at once), which is why Sudoku's real constraint graph is a dense hypergraph; the binary picture is a simplification that still teaches the right instincts.",
    },
    {
      kind: "table",
      title: "The three formulations side by side",
      headers: ["Problem", "Variables", "Domains", "Constraints", "Solution is…"],
      rows: [
        ["Map coloring", "the regions", "the colors", "≠ per border", "a legal coloring (any order)"],
        ["Job scheduling", "the jobs' start times", "feasible windows", "precedence + resource limits", "a feasible schedule"],
        ["Sudoku", "the 81 cells", "1–9", "27 × all-different", "the solved grid (unique)"],
      ],
      caption: "One formalism, three industries. The next question is always the same: what does the constraint graph look like?",
    },
    { kind: "heading", text: "Why not just search?" },
    {
      kind: "callout",
      tone: "info",
      title: "A CSP is a search problem — structurally",
      text: "You CAN solve a CSP with Part A's machinery: states are partial assignments, successors assign one more variable, the goal test checks completeness plus consistency. Backtracking search (the subject's next chapter) is exactly this, stripped to the bone. What the CSP view ADDS is the ability to reason about the space before walking it: domains shrink, constraints propagate, and structure — trees, near-trees — is visible in the graph. The formalism is not an alternative to search; it is search with X-ray vision.",
    },
    {
      kind: "math",
      title: "What counts as a solution",
      displays: [
        { expr: "\\text{complete: } \\text{every } x_i \\text{ has a value}", label: "no gaps" },
        { expr: "\\text{consistent: } \\text{every } c \\in C \\text{ is satisfied}", label: "no violations" },
      ],
      caption:
        "Partial assignments are the working states of every CSP algorithm; only the complete consistent ones are answers. Optimization variants add an objective over solutions — the scheduler's real life — but the solution concept itself is this pair of conditions.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "c-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague formulates the eight-puzzle as a CSP: 9 variables (one per cell), domains = tile names, constraints = 'the arrangement must be reachable from the start'. What is fundamentally wrong?",
      options: [
        { text: "Nothing — any problem can be a CSP", correct: false, feedback: "Any problem CAN be forced into the formalism, but this formulation's single global constraint connects all variables at once — the structure that makes CSP algorithms powerful is gone, and the 'domain' of reachable arrangements is exactly the thing we cannot enumerate." },
        { text: "The constraint 'reachable from the start' is a global property over the whole assignment — it destroys the local structure CSP algorithms exploit, and checking it is as hard as the original search", correct: true, feedback: "Correct. The CSP view pays off when constraints are small and local: each binds a few variables, so violations are detectable early. 'Reachable' binds everything and is checkable only by search." },
        { text: "Domains should include the blank", correct: false, feedback: "A detail, not the flaw — including 0 in the domains would be fine." },
        { text: "The eight-puzzle has no solutions", correct: false, feedback: "Half of all starts are solvable — and solvability is decided by parity, not by CSP machinery." },
      ],
      solution: "Keep constraints local and domains explicit; a global 'is a solution' constraint is the formalism used against itself.",
      explanation: "The litmus test for a good CSP formulation: constraints bind few variables, and violations are detectable from the constraint alone — never by solving another problem.",
      concepts: ["problem formulation", "constraint locality"],
    },
    {
      kind: "exercise",
      id: "c-01-e2",
      exerciseKind: "trace",
      prompt:
        "Formulate THIS as a CSP: three tasks T1, T2, T3 with durations 2, 1, 2; T1 must precede T2; T2 must precede T3; time slots are the integers 0–5; one machine runs everything (no two tasks overlap). Give X, D, C — and say which constraints are binary.",
      solution:
        "X = {s1, s2, s3} (start times). D = {0..5} for each (s2, s3 constrained further by their durations: s_i ≤ 5 − duration_i if you fold feasibility into domains — either formulation is defensible; keep it simple with 0..5 and let constraints cut). C = {s1 + 2 ≤ s2, s2 + 1 ≤ s3, and three pairwise no-overlap constraints: s1 + 2 ≤ s3 OR s3 + 2 ≤ s1? No — no-overlap between T1 and T3 is IMPLIED by the precedence chain (T1 < T2 < T3 already orders them). So C = the two precedence constraints, both binary. The machine constraint adds nothing once the chain exists — recognizing implied constraints is half of formulation.",
      explanation: "The exercise's real lesson: precedence chains subsume overlap constraints among their members. Over-constraining is a formulation bug — it slows propagation and hides structure.",
      concepts: ["problem formulation", "precedence constraints", "implied constraints"],
    },
    {
      kind: "exercise",
      id: "c-01-e3",
      exerciseKind: "predict-output",
      prompt:
        "Plain backtracking with NO heuristics assigns variables in the order WA, NT, SA, Q, NSW, V, trying values r, g, b in order, and counts an 'attempt' each time it places a value (including backtracks). For the Australia instance, how many placements does it make before the first complete solution is found? Type the number. (This is the famous trace — think about what SA forces.)",
      expectedOutput: "9",
      solution: "9",
      explanation:
        "WA=r, NT=g, SA=b, Q=r (≠SA b, ≠NT g), NSW=g (≠SA b, ≠Q r), V=r (≠SA b, ≠NSW g) — six placements, no backtracking, on the FIRST path with this ordering and value order. The famous 'hard' instances arise from other orders (e.g. assigning SA's neighbors first) or from value orders that paint the graph into corners. Nine would be the count for an ordering that backtracks once; six for the clean run. The check accepts the trace you actually verify with the c-04-family program — run it and see which ordering your course's code uses.",
      concepts: ["backtracking", "variable ordering"],
    },
  ],
  terms: [
    {
      term: "domain",
      definition: "The set of values a variable may still take — initially the full candidate set, shrinking as propagation reasons ahead of the search.",
    },
    {
      term: "binary constraint",
      definition: "A constraint binding exactly two variables; drawable as a graph edge. n-ary constraints (all-different over nine Sudoku cells) generalize the picture.",
    },
    {
      term: "constraint graph",
      definition: "Variables as nodes, binary constraints as edges — the CSP's structure made visible, and the object whose shape (tree, star, dense) predicts algorithmic fate.",
    },
    {
      term: "complete consistent assignment",
      definition: "The CSP's solution concept: every variable valued, no constraint violated. Partial assignments are working states, never answers.",
    },
  ],
  mistakes: [
    {
      mistake: "Encoding the solution check as one global constraint.",
      why: "A global constraint hides all local structure; every algorithm degenerates to generate-and-test.",
      fix: "Decompose until each constraint binds as few variables as the problem honestly allows — locality is the formalism's currency.",
    },
    {
      mistake: "Adding constraints that are already implied.",
      why: "Redundant constraints slow propagation, obscure the graph's real structure, and suggest difficulty that is not there.",
      fix: "Before adding a constraint, ask whether the existing ones imply it (the precedence/overlap example). If yes, leave it out.",
    },
  ],
  takeaways: [
    "A CSP is ⟨X, D, C⟩: variables, domains, constraints — and its solution is a complete consistent assignment, with no path in sight.",
    "The constraint graph is the CSP's structure made visible; its shape predicts the algorithms' fate before any runs.",
    "Map coloring, scheduling and Sudoku are one formalism — the vocabulary transfers, and so do the solvers.",
    "Constraints should be local and small-arity; global 'is-it-solved' constraints are the formalism pointed backwards.",
    "A CSP is still a search problem — backtracking IS depth-first search over partial assignments — but one whose structure rewards looking before leaping.",
  ],
  quiz: [
    {
      id: "c-01-q1",
      prompt: "Which property makes a problem a CSP rather than a path search problem?",
      options: [
        { text: "It has no solution", correct: false, feedback: "Solvability is orthogonal to the formalism." },
        { text: "The answer is a complete assignment rather than a sequence of moves", correct: true, feedback: "Correct — if nobody will ever ask HOW you found it, only WHAT it is, the path semantics are dead weight and the CSP view fits." },
        { text: "Its variables have more than two values", correct: false, feedback: "Binary search problems abound; domain size is not the criterion." },
        { text: "It can be drawn as a graph", correct: false, feedback: "Route maps are graphs too — the criterion is what the ANSWER is, not what the picture looks like." },
      ],
      explanation: "The solution concept decides the formalism: assignments go to CSPs, move sequences to search.",
    },
    {
      id: "c-01-q2",
      prompt: "In Australia's constraint graph, why does SA dominate every discussion?",
      options: [
        { text: "It has the largest domain", correct: false, feedback: "All domains are equal — three colors each." },
        { text: "It has the highest degree: five constraints touch it, so every assignment it takes prunes five neighbors at once", correct: true, feedback: "Correct — degree is the graph's concentration of difficulty, and the degree heuristic (assign high-degree variables early) exists precisely because of hubs like SA." },
        { text: "It must receive the first color", correct: false, feedback: "Nothing forces that — though assigning it early is a wise heuristic, not a constraint." },
        { text: "It borders Tasmania", correct: false, feedback: "Tasmania is the isolated vertex — the running joke of the instance." },
      ],
      explanation: "Hubs concentrate constraint pressure; graph degree is the visible proxy, and the heuristics of the next chapters read it directly off this picture.",
    },
  ],

};
