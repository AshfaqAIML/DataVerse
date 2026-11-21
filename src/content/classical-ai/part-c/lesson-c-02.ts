/**
 * LESSON_C_02 — "Constraint Graphs" (25 min, concept).
 *
 * The constraint graph of the CSP triple c-01 formalized: variables as
 * nodes, binary constraints as edges, n-ary constraints as hyperedges.
 * Australia drawn and audited (7 vars, 9 edges, SA the degree-5 hub);
 * Sudoku's 27 all-different units counted (810 distinct pairwise edges,
 * average degree 20.0 vs Australia's 2.57); the shape forecast (trees
 * easy, dense hard — c-08's theorem); the Four Color theorem stated as
 * the upper bound it is. The audit program's output below is REAL
 * stdout (scripts run, not imagined).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_02: ClassicalLesson = {
  slug: "c-02",
  title: "Constraint Graphs",
  minutes: 25,
  summary:
    "Draw the problem: variables as nodes, constraints as edges — and read off its structure before solving anything.",
  kind: "concept",
  objectives: [
    "Translate a binary CSP into its constraint graph and back — variables as nodes, constraints as edges, nothing else on the paper",
    "Draw n-ary constraints honestly as hyperedges, and state what binarizing one costs (36 edges per nine-variable all-different unit)",
    "Read a constraint graph's shape — hubs, cycles, density, isolation — and say what it predicts about the cost of solving",
    "State the Four Color theorem precisely as an upper bound on planar maps, and separate it from what a particular map needs",
  ],
  why: "Solvers see variables and loops; you will see the picture underneath. The constraint graph is the cheapest diagnostic instrument in this subject: before any search runs, it tells you where the conflicts concentrate (the hubs), which variables stand alone (Tasmania), whether the instance is a near-tree that linear-time algorithms will dismantle (c-08's theorem) or a dense web where backtracking earns its keep. It also keeps you honest about arity — Sudoku's 27 all-different units are n-ary constraints, and drawing them as plain edges multiplies the picture by 36 per unit, a mistake with a measured cost. The habit this lesson builds — draw first, read the shape, then choose the algorithm — is the one practitioners actually use on scheduling, timetabling and configuration problems, where the difference between a tree-shaped instance and a dense one is the difference between milliseconds and a weekend.",
  blocks: [
    {
      kind: "text",
      text: "c-01 left you with a triple — variables, domains, constraints — and a promise that the triple's shape matters. This lesson draws it. For binary constraints the picture is a graph: one node per variable, one edge per constraint, and suddenly the problem is visible — you can point at the hub every conflict routes through, at the variable connected to nothing, at the triangles that force a third color. The drawing is not decoration; it is a forecasting tool. You will draw Australia, audit the drawing with a program, then watch Sudoku's all-different units refuse to fit the plain-edge picture — and learn to read hyperedges honestly. By the end, the graph's shape will tell you things an algorithm cannot yet have discovered, because the shape is visible before the search starts.",
    },
    {
      kind: "definition",
      term: "constraint graph",
      informal:
        "A drawing of a CSP: one node per variable, one edge per binary constraint. The edge exists exactly when the two variables must coordinate their values.",
      formal:
        "G = \\langle X, E \\rangle \\quad \\text{where } \\{X_i, X_j\\} \\in E \\iff C_{ij} \\in C",
      why: "The graph throws away domains and values entirely — it keeps only WHO constrains WHOM, which is the structure that survives every assignment.",
    },
    { kind: "heading", text: "Australia, drawn" },
    {
      kind: "constraintGraph",
      title: "Australia as a constraint graph",
      variables: [
        { id: "WA", label: "WA", domain: ["r", "g", "b"], x: 16, y: 52 },
        { id: "NT", label: "NT", domain: ["r", "g", "b"], x: 42, y: 24 },
        { id: "SA", label: "SA", domain: ["r", "g", "b"], x: 46, y: 60, tone: "highlight" },
        { id: "Q", label: "Q", domain: ["r", "g", "b"], x: 70, y: 32 },
        { id: "NSW", label: "NSW", domain: ["r", "g", "b"], x: 74, y: 60 },
        { id: "V", label: "V", domain: ["r", "g", "b"], x: 84, y: 80 },
        { id: "T", label: "T", domain: ["r", "g", "b"], x: 60, y: 90 },
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
      frameNote: "Before any assignment: full domains everywhere, all nine borders present.",
      caption:
        "Seven variables, nine binary not-equal constraints — the land borders of the continent, drawn as the conflicts they are. SA, highlighted, touches five of the six others; T touches nothing.",
    },
    {
      kind: "text",
      text: "Read the drawing the way a practitioner does. **Edges are conflicts-in-waiting** — WA≠NT says nothing until both hold values, but it names the pair that will have to coordinate. **Hubs concentrate the risk** — SA has degree 5: five constraints route through it, so SA's color choice will veto five neighbors' options at once (c-05's forward checking makes that veto explicit). **Isolation is free** — T, degree 0, can take any value at any moment; it contributes nothing to the difficulty. **Cycles are the color-forcing structure** — WA, NT, SA close a triangle, and a triangle is why Australia cannot be 2-colored: three pairwise-adjacent regions demand three distinct values. Every one of these readings comes from the graph alone — no search has run, no domain has been touched.",
    },
    { kind: "heading", text: "When a constraint binds more than two" },
    {
      kind: "text",
      text: "The map-coloring constraints were all binary — each border involves exactly two regions, so each became one edge. Sudoku is not so obliging. c-01 formalized its units as all-different over nine cells: ONE constraint binding NINE variables at once. An edge cannot express that — an edge has exactly two endpoints. The honest drawing is a **hyperedge**: a closed curve or bundle encircling the nine variables the constraint binds, because that is the arity the constraint actually has. You could refuse — you could replace each all-different unit with a not-equal edge for every pair inside it — and the next block's program will price that refusal: **36 edges per unit, 972 pair-slots for the 27 units, collapsing to 810 distinct edges** because two cells can share a row and a box at once. The hyperedge is not just tidier; it is the truth the binarization approximates at measurable cost — and modern solvers implement all-different directly for exactly this reason.",
    },
    {
      kind: "constraintGraph",
      title: "One Sudoku unit as a hyperedge",
      variables: [
        { id: "c1", label: "r1c1", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 10, y: 50 },
        { id: "c2", label: "r1c2", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 20, y: 50 },
        { id: "c3", label: "r1c3", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 30, y: 50 },
        { id: "c4", label: "r1c4", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 40, y: 50 },
        { id: "c5", label: "r1c5", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 50, y: 50 },
        { id: "c6", label: "r1c6", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 60, y: 50 },
        { id: "c7", label: "r1c7", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 70, y: 50 },
        { id: "c8", label: "r1c8", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 80, y: 50 },
        { id: "c9", label: "r1c9", domain: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], x: 90, y: 50 },
      ],
      constraints: [],
      groups: [{ label: "all-different (row 1)", vars: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"] }],
      frameNote: "One of Sudoku's 27 units, drawn at its true arity: a single n-ary constraint over nine variables.",
      caption:
        "No pairwise edges — one hyperedge. The binarized version of this single unit would need C(9,2) = 36 edges to say the same thing.",
    },
    { kind: "heading", text: "What the shape predicts" },
    {
      kind: "text",
      text: "The graph is a forecast, and its predictions are the subject of c-08 — but the headlines belong here, next to the drawings. **Trees are easy**: if the constraint graph has no cycles, the problem solves in time linear in the variables (times a factor for domain sizes) — c-08 proves it and shows the algorithm. **Density is hardness**: Australia's average degree is about 2.6; Sudoku's pairwise picture has average degree 20, and the difference is not cosmetic — the number of potential conflicts a single assignment must consider grows with degree, and the search tree feels it. **Hubs are leverage**: the degree heuristic of c-04 assigns high-degree variables early precisely because the hub's color vetoes the most futures. None of this is a theorem about YOUR instance — shape predicts cost the way terrain predicts a hike, reliably in aggregate, never per step. The program below puts numbers on both drawings, and its output is worth reading as closely as the prose.",
    },
    {
      kind: "code",
      title: "Auditing both drawings",
      lang: "python",
      code: `from itertools import combinations

# ---- Australia: variables and the nine land borders -----------------
AU = ["WA", "NT", "SA", "Q", "NSW", "V", "T"]
BORDERS = [("WA", "NT"), ("WA", "SA"), ("NT", "SA"), ("NT", "Q"), ("SA", "Q"),
           ("SA", "NSW"), ("SA", "V"), ("Q", "NSW"), ("NSW", "V")]
deg = {v: 0 for v in AU}
for a, b in BORDERS:
    deg[a] += 1
    deg[b] += 1
print("australia:", len(AU), "vars /", len(BORDERS), "edges")
print("degrees:", " ".join(f"{v}={deg[v]}" for v in AU))
print("degree sum:", sum(deg.values()), "average:", round(sum(deg.values()) / len(AU), 2))

# ---- Sudoku: 27 all-different units, counted as pairwise edges ------
def units():
    u = []
    for r in range(9):
        u.append([(r, c) for c in range(9)])          # rows
    for c in range(9):
        u.append([(r, c) for r in range(9)])          # columns
    for br in range(3):
        for bc in range(3):
            u.append([(br * 3 + i, bc * 3 + j)        # boxes
                      for i in range(3) for j in range(3)])
    return u

U = units()
per_unit = len(list(combinations(U[0], 2)))
edges = set()
for unit in U:
    for p, q in combinations(unit, 2):
        edges.add(tuple(sorted((p, q))))
print("sudoku:", len(U), "units /", per_unit, "pairs per unit /",
      len(edges), "distinct edges")
print("pair-slots if binarized naively:", len(U) * per_unit)
print("average degree:", round(2 * len(edges) / 81, 1))`,
      output: `australia: 7 vars / 9 edges
degrees: WA=2 NT=3 SA=5 Q=3 NSW=3 V=2 T=0
degree sum: 18 average: 2.57
sudoku: 27 units / 36 pairs per unit / 810 distinct edges
pair-slots if binarized naively: 972
average degree: 20.0`,
    },
    {
      kind: "text",
      text: "The audit agrees with the drawings, and one number deserves a second look: **810, not 972**. Naive binarization writes 36 edges for each of 27 units — 972 pair-slots — but two cells can sit in the same row AND the same box, so some pair-slots name the same pair twice. Distinct pairs: 810, which is exactly `81 × 20 / 2` — each cell has 20 peers (8 in its row, 8 in its column, 4 in its box), and an edge counts for both endpoints. And the two average degrees — 2.57 against 20.0 — are the density forecast made numeric: every Sudoku assignment must check against twenty futures where an Australian assignment checks against two or three. The lesson is not the arithmetic; it is that the drawing's cost is computable, and computing it caught an overlap the naive sketch would have silently carried.",
    },
    {
      kind: "math",
      title: "Chromatic numbers, honestly stated",
      displays: [
        { expr: "\\chi(G) \\le 4 \\quad \\text{for every planar graph } G", label: "Four Color theorem" },
        { expr: "\\chi(G_{\\text{Australia}}) = 3", label: "Australia" },
        { expr: "\\chi(K_4) = 4", label: "a genuine four" },
        { expr: "\\chi(K_5) = 5 \\quad \\text{and } K_5 \\text{ is not planar}", label: "the boundary" },
      ],
      caption:
        "The Four Color theorem (Appel and Haken, 1976 — the first major computer-assisted proof) bounds what a planar map MIGHT need; it does not say any map needs four.",
    },
    {
      kind: "text",
      text: "Map coloring invites exactly one famous over-claim, so pin the theorem down. It says every planar graph — every honest map, regions contiguous, borders as edges — is 4-colorABLE: four colors always SUFFICE. It does not say four are needed. Australia needs three (the WA–NT–SA triangle forces it; c-01's solution supplies it). A map that genuinely needs four: Belgium, France, Germany and Luxembourg are pairwise adjacent — a K4 hiding in Europe. And the theorem's boundary: K5, five regions all touching, would need five colors but cannot be drawn planar — the assumption 'planar' is doing real work. When you meet the claim again, in a pub argument or a problem set, the discipline is the same as c-01's: separate the upper bound (there exists a coloring with ≤ 4) from the lower bound (this subgraph forces ≥ k) — they are different statements with different proofs.",
    },
    {
      kind: "exercise",
      id: "c-02-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague bins Sudoku's 27 all-different units into plain pairwise edges 'so the graph stays a graph', and reports the constraint graph has 972 edges. What is the honest correction?",
      options: [
        {
          text: "No correction needed — 972 is the right count",
          correct: false,
          feedback: "It is the right count of pair-SLOTS, but not of edges: pairs sharing a row and a box were counted twice. The distinct count is 810.",
        },
        {
          text: "The drawing should use hyperedges for the units — arity is a fact about the constraint — and if you insist on edges, the distinct count is 810, not 972",
          correct: true,
          feedback: "Both halves matter: the honest picture keeps the n-ary constraint as it is, and even the binarized approximation must deduplicate the 162 overlapping pairs.",
        },
        {
          text: "The units should become 27 nodes in the graph instead",
          correct: false,
          feedback: "That changes what the graph is about — nodes are variables (the things assigned), not constraints. Constraint nodes are a different (bipartite) picture, not a fix for arity.",
        },
        {
          text: "Sudoku has no constraint graph because it is not binary",
          correct: false,
          feedback: "It has one — the hypergraph. Refusing the general picture because the simplest one fails is the mistake this lesson retires.",
        },
      ],
      solution:
        "The honest correction is both: keep the all-different units as hyperedges (a nine-variable constraint is a fact, not a formatting inconvenience), and if a pairwise picture is genuinely wanted, count distinct pairs — 810, because two cells can share a row and a box, so 972 pair-slots collapse.",
      explanation:
        "The audit program printed all three numbers — 27 units, 36 pairs per unit, 810 distinct — and the collapse from 972 to 810 is the measurable cost of forgetting that overlap.",
      concepts: ["constraint graph", "hyperedge", "arity"],
    },
    {
      kind: "exercise",
      id: "c-02-e2",
      exerciseKind: "trace",
      prompt:
        "Draw the constraint graph for this exam-timetabling CSP: variables E1..E5 (exams), domains {s1, s2, s3} (slots), and these conflicts — E1 with E2, E2 with E3, E3 with E4, E4 with E5, and E1 with E3. Then answer from the drawing alone: (a) which variables form a triangle, (b) which variable has the highest degree, (c) is the graph a tree, and (d) what is the smallest number of slots the triangle forces?",
      solution: `Edges: E1–E2, E2–E3, E3–E4, E4–E5, E1–E3 — five edges on five nodes.
(a) E1, E2, E3 close a triangle (E1–E2, E2–E3, E1–E3 all present).
(b) E3 is the hub: it touches E1, E2 and E4 (degree 3); E1 and E2 have
degree 2; E4 has 2; E5 has 1. (c) Not a tree: the triangle is a cycle,
and a tree on 5 nodes would have exactly 4 edges; this graph has 5.
(d) A triangle is an odd cycle — three pairwise-conflicting exams cannot
share two slots, so at least 3 slots. Check: E1=s1, E2=s2, E3=s3 satisfies
the triangle; E4 (≠E3) can take s1, E5 (≠E4) can take s2. Three slots
suffice for the whole instance — the triangle forced exactly the floor.`,
      explanation:
        "This is the reading skill of the lesson: triangle spotted, hub identified (E3, degree 3), cycle disqualifying the tree (and with it c-08's free lunch), and the odd cycle as a lower bound on colors — read entirely before assigning a single value.",
      concepts: ["constraint graph", "triangle", "degree"],
    },
  ],
  terms: [
    {
      term: "constraint graph",
      definition: "The drawing of a binary CSP: one node per variable, one edge per binary constraint. It keeps who-constrains-whom and discards everything else.",
    },
    {
      term: "variable node",
      definition: "A node of the constraint graph, standing for one variable of the CSP — the thing to be assigned, not a value and not a state.",
    },
    {
      term: "constraint edge",
      definition: "An edge between two variable nodes, standing for one binary constraint — a conflict-in-waiting that fires only when both endpoints hold values.",
    },
    {
      term: "hyperedge",
      definition: "The honest drawing of an n-ary constraint: one bundle joining all the variables it binds, because an edge's two endpoints cannot express arity above two.",
    },
    {
      term: "degree",
      definition: "The number of edges touching a node. High degree marks a hub — a variable whose assignment constrains many others at once.",
    },
  ],
  mistakes: [
    {
      mistake: "Drawing an edge for a unary constraint",
      why: "A constraint on one variable (cell already given in Sudoku, a pre-shrunk domain) has no second endpoint, so it cannot be an edge.",
      fix: "Unary constraints live inside the variable's domain — shrink the domain, draw nothing. The graph's edges are exactly the constraints of arity two.",
    },
    {
      mistake: "Binarizing an all-different unit and forgetting the overlap",
      why: "Replacing a nine-variable all-different with pairwise not-equals writes 36 edges per unit, and pairs sharing a row and a box get written twice.",
      fix: "Either keep the hyperedge, or deduplicate: 27 units × 36 pairs = 972 slots collapse to 810 distinct edges. Count what you draw.",
    },
    {
      mistake: "Quoting the Four Color theorem as 'maps need four colors'",
      why: "The theorem is an upper bound — four colors always SUFFICE for planar maps. Many maps need fewer; Australia needs three.",
      fix: "State bounds separately: the theorem gives the ceiling (≤ 4); a subgraph — a triangle, a K4 — gives the floor. 'Needs k' is a lower-bound claim with its own proof.",
    },
    {
      mistake: "Confusing the constraint graph with the state-space graph of Part A",
      why: "Both are graphs over the same problem, which is exactly the trap: states versus variables, operators versus constraints, paths versus assignments.",
      fix: "Ask what a node IS. Part A's nodes are world states and edges are moves; here nodes are variables and edges are conflicts. A CSP's answer is an assignment — there is no path to speak of.",
    },
  ],
  takeaways: [
    "The constraint graph keeps who-constrains-whom and nothing else — variables as nodes, binary constraints as edges.",
    "N-ary constraints demand hyperedges; the binarized approximation costs 36 edges per nine-variable all-different unit, and overlaps must be deduplicated (972 slots, 810 edges).",
    "Read the shape before solving: hubs concentrate conflicts, triangles force values, isolation is free, cycles kill the tree's free lunch.",
    "Average degree measures density — Australia's 2.57 against Sudoku's 20.0 — and density is the honest forecast of search cost.",
    "The Four Color theorem is a ceiling (planar ⇒ 4-colorable), never a floor; lower bounds come from subgraphs you can point at.",
  ],
  quiz: [
    {
      id: "c-02-q1",
      prompt: "In the constraint graph of Australia, what does the edge WA–NT stand for?",
      options: [
        { text: "Western Australia can be reached from the Northern Territory by an operator", correct: false, feedback: "That is state-space thinking — Part A's graphs have moves as edges. Here there are no operators and no path." },
        { text: "The binary constraint WA ≠ NT: the two variables must take different values", correct: true, feedback: "Exactly — an edge is a conflict-in-waiting between two variables, silent until both hold values." },
        { text: "WA's domain is the neighbors of NT", correct: false, feedback: "Domains live inside nodes; edges carry no values at all." },
        { text: "The pair must be assigned before any other pair", correct: false, feedback: "The graph imposes no order — ordering is c-03's and c-07's business, built on top of the drawing." },
      ],
      explanation: "Node = variable, edge = binary constraint. Every reading of the graph — hub, triangle, loner — is a reading of this one convention.",
    },
    {
      id: "c-02-q2",
      prompt: "Why is Sudoku's constraint graph honestly a hypergraph rather than a plain graph?",
      options: [
        { text: "Because Sudoku's domains are large", correct: false, feedback: "Domain size says nothing about arity — a nine-value binary constraint is still binary." },
        { text: "Because its 27 units are all-different constraints binding nine variables each — arity 9 cannot ride on a two-endpoint edge", correct: true, feedback: "Correct — and the 36-edges-per-unit cost of pretending otherwise is the measured argument for native all-different." },
        { text: "Because the cells are arranged in a grid", correct: false, feedback: "Geometry is not arity. A grid of pairwise constraints would still be a plain graph." },
        { text: "Because some constraints are unary", correct: false, feedback: "The givens are unary, true — but unary constraints shrink domains; they are not why the graph needs hyperedges." },
      ],
      explanation: "Arity is a fact about how many variables a constraint binds; the drawing must match it or pay in edges (36 per unit) and in honesty.",
    },
    {
      id: "c-02-q3",
      prompt: "You must choose a search strategy for two CSPs. One's constraint graph is a tree; the other's is dense with triangles. What does the shape tell you BEFORE any search?",
      options: [
        { text: "Nothing — the graph is just a picture; only running the algorithms tells you anything", correct: false, feedback: "The picture is a forecast: it cannot decide your instance, but it reliably ranks difficulty, and one of these readings is a theorem." },
        { text: "The tree solves in time linear in the variables (c-08's result); the dense instance should expect backtracking, and its hubs deserve early assignment", correct: true, feedback: "Both halves are the lesson's payoff: a structural guarantee for the tree, a heuristic direction (degree-first) for the web." },
        { text: "Both are NP-complete in general, so their costs are identical", correct: false, feedback: "General CSP is NP-complete, true — but structure carves exceptions, and the tree IS the exception c-08 exploits." },
        { text: "The tree needs more colors than the dense graph", correct: false, feedback: "Trees are 2-colorable — the fewest; this inverts the truth." },
      ],
      explanation: "Draw first, read the shape, then choose: trees get the linear-time algorithm, dense graphs get the heuristics of c-03 through c-07 — and c-08 names the theorem behind the split.",
    },
  ],
};
