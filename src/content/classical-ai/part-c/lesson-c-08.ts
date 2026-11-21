/**
 * LESSON_C_08 — "Tree-Structured CSPs and Decomposition" (30 min, concept).
 *
 * The structural dividend: tree CSPs solve in O(n·d²) by one backward
 * consistency pass and a failure-free forward walk (worked on a five-
 * exam path instance, every deletion and assignment hand-verified);
 * nearly-trees pay a factor of d per cutset variable (Australia's cutset
 * is {SA} — the c-02 hub — leaving a path plus Tasmania); tree
 * decomposition generalizes the result to treewidth w at O(n·d^(w+1)).
 * General CSPs stay NP-complete — the honest close: heuristics plus
 * propagation is what practice runs.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_08: ClassicalLesson = {
  slug: "c-08",
  title: "Tree-Structured CSPs and Decomposition",
  minutes: 30,
  summary:
    "Trees are linear-time; nearly-trees are nearly-linear: the decomposition result and when to pay for it.",
  kind: "concept",
  objectives: [
    "State the tree-CSP theorem precisely — O(n·d²) by one backward consistency pass plus a failure-free forward walk — and sketch why the walk cannot fail",
    "Run the algorithm by hand on a tree instance: topological order, backward pruning parent-against-child, forward greedy assignment",
    "Compute the cutset-conditioning bound for a nearly-tree — O(d^c · (n−c) · d²) — and identify Australia's smallest cycle cutset ({SA}) from the constraint graph",
    "Place tree decomposition in the hierarchy honestly: treewidth w at O(n·d^(w+1)), general CSPs NP-complete — and say what practitioners actually run",
  ],
  why: "Every lesson in this module so far has treated hardness as a fact of life: backtracking's worst case is O(d^n), heuristics reshape the tree but not the bound, propagation buys earlier dead ends at per-node cost. This lesson is the counterpoint — the one place where the bound itself collapses. When a constraint graph has no cycles, the problem you spent c-03 and c-04 searching is solvable by a single linear-time sweep: no backtracking, no frontier, no dead ends, one pass of pruning and a walk downhill. And the result stretches: break a nearly-tree's few cycles by fixing a handful of variables by brute force, and each remaining tree costs the same linear sweep — the price is d per cutset variable, a trade you can price from the drawing before running anything. Knowing WHEN structure buys linear time is the difference between a scheduler that scales and one that melts — and knowing that general CSPs are NP-complete keeps the honesty intact: structure is an opportunity some instances offer, never a promise the formalism makes.",
  blocks: [
    {
      kind: "text",
      text: "Look back at c-02's two drawings. Australia — a hub, two triangles, average degree 2.6 — needed a search: c-03 traced it, c-04 instrumented it, and even the lucky order paid seven placements and four rejections. Sudoku — average degree 20 — needs a search no order makes kind. But between those drawings sits a shape this module has not yet exploited: the tree, no cycles at all. For trees, everything you have built — frontiers, retreats, heuristic orderings — is unnecessary. One backward pass of pruning, one forward walk, done, in time linear in the variables. This lesson proves that, runs it by hand, and then does the engineering move that makes it useful on real instances: if the graph is ALMOST a tree, fix the few cycle-forming variables by brute force and buy the linear sweep for the rest. The whole module's honest close lives here too: general CSPs are NP-complete, trees are the carved-out exception, and practice runs on heuristics plus propagation precisely because most instances sit in between.",
    },
    {
      kind: "definition",
      term: "tree-structured CSP",
      informal:
        "A binary CSP whose constraint graph has no cycles — n variables, n−1 constraints, exactly one path between any two variables.",
      formal:
        "G = \\langle X, E \\rangle \\text{ is a tree} \\iff |E| = |X| - 1 \\text{ and connected}",
      why: "Acyclicity is what makes one backward pass sufficient: with no cycles, information cannot loop, so each edge needs to be reasoned over exactly once.",
    },
    { kind: "heading", text: "The theorem and its one-pass engine" },
    {
      kind: "text",
      text: "The claim, stated precisely: **any CSP whose constraint graph is a tree can be solved — or proven unsolvable — in O(n·d²) time**, where n is the number of variables and d the largest domain size. The engine has no search in it at all. Choose any variable as the root; order the rest so every variable comes after its parent (a topological order — on a tree this is just reading it root to leaves). Then two sweeps. **Backward sweep, leaves to root**: for each variable (last to first), prune its PARENT's domain, deleting every parent value with no support in the child's current domain — the same arc-consistency step c-06 builds its queue from, applied once per edge in a fixed order. If any domain empties, stop: unsolvable, proven. **Forward sweep, root to leaves**: assign each variable any value consistent with its already-assigned parent. The claim that sounds too good to check: the forward walk cannot fail. The proof sketch is two sentences. When the backward sweep prunes a parent against a child, the child's domain is already final (its own children were processed earlier — leaves first), so the pruning uses complete information. Therefore every value that survives in a parent's domain has support in every child's final domain, and the forward walk's greedy choice — pick any value consistent with the parent — always has a witness waiting one level down.",
    },
    {
      kind: "pseudocode",
      title: "TREE-CSP-SOLVER — one backward pass, one forward walk",
      lines: [
        { text: "PROCEDURE TREE-CSP-SOLVER(csp)", indent: 0 },
        { text: "root ← any variable", indent: 1 },
        { text: "X ← topological order of the tree, root first", indent: 1, note: "each variable after its parent" },
        { text: "FOR j = n DOWN TO 2:", indent: 1 },
        { text: "MAKE-ARC-CONSISTENT(PARENT(X_j), X_j)", indent: 2, tone: "key", note: "delete parent values with no support in the child's final domain" },
        { text: "IF some domain is empty: RETURN failure", indent: 2, note: "unsolvability, proven without search" },
        { text: "FOR i = 1 TO n:", indent: 1 },
        { text: "assign X_i any value consistent with PARENT(X_i)", indent: 2, tone: "key", note: "cannot fail: every surviving parent value has support below" },
        { text: "RETURN the assignment", indent: 1 },
      ],
      note: "n−1 edges × O(d²) per arc-consistency step = O(n·d²) total. No frontier, no retreats, no revisits — the tree's acyclicity pays the whole bill.",
    },
    {
      kind: "example",
      title: "Five exams, one corridor: the algorithm by hand",
      problem:
        "Five exams in a corridor — each adjacent pair shares a hall, so consecutive exams need different slots. Variables E1–E5 in a path (E1–E2, E2–E3, E3–E4, E4–E5), domains {s1, s2, s3}, not-equal along the path — except the registrar has already fixed two: E2 must be s2 (the hall is booked otherwise) and E5 must be s3 (a recording crew). So D(E1) = {s1, s2, s3}, D(E2) = {s2}, D(E3) = {s1, s2, s3}, D(E4) = {s1, s2, s3}, D(E5) = {s3}. Solve it with the two sweeps.",
      steps: [
        {
          text: "Root the tree at E1; the topological order is E1, E2, E3, E4, E5 — each variable after its parent.",
          detail: "On a path there is nothing to decide: root at one end and read.",
        },
        {
          text: "Backward sweep, j = 5: MAKE-ARC-CONSISTENT(E4, E5). E5's domain is {s3}, so E4's value s3 needs some E5 value different from it — none exists. Delete s3 from E4: D(E4) = {s1, s2}.",
          detail: "The singleton child is the engine's teeth: a one-value domain forces its parent to differ from exactly that value.",
        },
        {
          text: "j = 4: MAKE-ARC-CONSISTENT(E3, E4). E4 = {s1, s2}: E3's s1 is supported (E4 has s2), s2 supported (s1), s3 supported (both). No deletion. j = 3: MAKE-ARC-CONSISTENT(E2, E3): E2 = {s2} is supported by E3's s1 and s3. No deletion.",
          detail: "Two-value children never prune a not-equal parent — support needs only one differing witness.",
        },
        {
          text: "j = 2: MAKE-ARC-CONSISTENT(E1, E2). E2 = {s2}, so E1's s2 has no support. Delete it: D(E1) = {s1, s3}. No domain is empty — the instance is solvable, and we have not assigned anything yet.",
          detail: "Two deletions in the whole backward sweep (E4 loses s3, E1 loses s2) — the registrar's two fixed exams each propagated exactly one edge, and stopped: trees do not let information loop.",
        },
        {
          text: "Forward sweep: E1 takes s1 (first consistent value). E2 takes s2 (forced, and ≠ s1). E3 takes s1 (≠ s2). E4 takes s2 (≠ s1). E5 takes s3 (≠ s2, forced). Complete — five assignments, zero failures, zero retreats.",
          detail: "Every step had a witness guaranteed by the backward sweep: when E4 needed a value differing from E3's s1, s2 was sitting in D(E4) — the sweep had already removed s3, which would have left E4 cornered by E3's choice.",
        },
      ],
      result: "E1 = s1, E2 = s2, E3 = s1, E4 = s2, E5 = s3 — found by two linear sweeps; backtracking on the same instance would have needed luck to match this.",
    },
    { kind: "heading", text: "The two drawings, side by side" },
    {
      kind: "constraintGraph",
      title: "A tree instance: the exam corridor",
      variables: [
        { id: "e1", label: "E1", domain: ["s1", "s3"], x: 10, y: 50 },
        { id: "e2", label: "E2", domain: ["s2"], x: 30, y: 50, tone: "assigned" },
        { id: "e3", label: "E3", domain: ["s1", "s2", "s3"], x: 50, y: 50 },
        { id: "e4", label: "E4", domain: ["s1", "s2"], x: 70, y: 50 },
        { id: "e5", label: "E5", domain: ["s3"], x: 90, y: 50, tone: "assigned" },
      ],
      constraints: [
        { a: "e1", b: "e2", label: "≠" },
        { a: "e2", b: "e3", label: "≠" },
        { a: "e3", b: "e4", label: "≠" },
        { a: "e4", b: "e5", label: "≠" },
      ],
      frameNote: "After the backward sweep: four edges, no cycles — the deletions (E4 lost s3, E1 lost s2) already visible in the domains.",
      caption:
        "Five variables, four constraints: n−1 edges, connected — a tree by the count and by the picture. Linear time lives here.",
    },
    {
      kind: "constraintGraph",
      title: "Australia with its cycle cutset marked",
      variables: [
        { id: "WA", label: "WA", domain: ["r", "g", "b"], x: 16, y: 52 },
        { id: "NT", label: "NT", domain: ["r", "g", "b"], x: 42, y: 24 },
        { id: "SA", label: "SA", domain: ["r", "g", "b"], x: 46, y: 62, tone: "highlight" },
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
      frameNote: "Delete SA (highlighted) — with it go its five constraints — and what remains is WA–NT–Q–NSW–V: a path, plus isolated T. A tree.",
      caption:
        "The cycle cutset is {SA}: every cycle in Australia's graph routes through the hub. One variable, brute-forced, buys the linear sweep for the other six.",
    },
    {
      kind: "text",
      text: "**Cutset conditioning** is the engineering move, and the drawing prices it before anything runs. Pick a set of variables whose removal (with all their constraints) breaks every cycle — a cycle cutset, of size c. Enumerate all d^c assignments of those variables by brute force; for each, the remaining graph is a tree, solved — or refuted — by the two sweeps in O((n−c)·d²). Total: **O(d^c · (n−c) · d²)**. For Australia, c = 1 (SA, the hub — every cycle passes through it) and the bound is 3 · 6 · 9 against backtracking's worst case 3^7; for a scheduling problem with two or three crossing constraints, c = 2 or 3 still prices in the hundreds against d^n in the millions. The trade is honest in both directions: cutset size grows with cycle density, and a dense graph (Sudoku, c-02's average degree 20) has a cutset so large the method quietly becomes brute force — the drawing tells you which world you are in before you pay.",
    },
    {
      kind: "math",
      title: "The decomposition hierarchy, priced",
      displays: [
        { expr: "T_{tree} = O(n \\cdot d^2)", label: "tree (c = 0)" },
        { expr: "T_{cutset} = O(d^c \\cdot (n - c) \\cdot d^2)", label: "cutset conditioning" },
        { expr: "T_{decomp} = O(n \\cdot d^{w + 1}) \\quad \\text{for treewidth } w", label: "tree decomposition" },
      ],
      caption:
        "Three bounds, one idea: pay exponentially in a MEASURED quantity of the graph (cutset size c, treewidth w), linearly in everything else.",
    },
    {
      kind: "text",
      text: "The ladder has a third rung, worth naming without climbing. Cutset conditioning is the special case of **tree decomposition**: cluster the variables into bags so each constraint's variables share a bag and the bags form a tree; the largest bag minus one is the treewidth w, and any CSP of treewidth w solves in O(n·d^(w+1)) — cutset conditioning is the bag pattern one-wide, a path of pairs. Finding the minimal treewidth is itself NP-hard (the honesty never stops), but a good decomposition can be read off many real instances — schedules with local shift constraints, circuits with local gates. And above the ladder, the ceiling: **general CSPs are NP-complete** — the satisfiability problem lives inside them, and no ordering, propagation or decomposition removes that. So the honest close of the module is also the honest close of the subject's classical core: in practice, solvers run heuristics (c-07's orderings) with propagation (c-05's lookahead, c-06's arc consistency) inside backtracking (c-03, c-04), and reach for structure (this lesson) when the drawing says it is there. The drawing is where you look first — which is where this module began.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "c-08-e1",
      exerciseKind: "concept-check",
      prompt:
        "In the backward sweep, MAKE-ARC-CONSISTENT(PARENT(X_j), X_j) prunes the parent against the child. Why does the sweep visit variables leaves-first — what would break if it ran root-first?",
      options: [
        {
          text: "Nothing would break — arc consistency is symmetric, so the direction of the sweep is a convention",
          correct: false,
          feedback: "It is not symmetric here: the step prunes the PARENT only. Direction is the algorithm, not a style choice.",
        },
        {
          text: "Leaves-first guarantees each child's domain is FINAL when its parent is pruned against it — root-first would prune a parent against a domain that later shrinks, restoring exactly the support the sweep claimed to guarantee",
          correct: true,
          feedback: "Correct — the forward walk's no-fail guarantee rests on pruning against final domains; processing leaves-first is what makes them final (a variable's children are processed before it).",
        },
        {
          text: "Root-first would loop forever on trees with more than two levels",
          correct: false,
          feedback: "Each edge is visited exactly once in either direction — no loop. The failure is correctness (the guarantee), not termination.",
        },
        {
          text: "The topological order forbids root-first traversal",
          correct: false,
          feedback: "A topological order is a labeling, not a one-way gate — you may traverse any direction. The choice of leaves-first is about WHAT the pruning may claim.",
        },
      ],
      solution:
        "The guarantee — every surviving parent value has support in the child's final domain — requires the child's domain to be final at pruning time. A variable's domain is final only after all its own children have been processed; leaves-first processes them first. Root-first would prune E1 against E2's domain before E2's own children had pruned E2, and the forward walk's witness could vanish.",
      explanation:
        "Directionality is the whole trick: on a tree, one ordered pass simulates the fixpoint that a cyclic graph (c-06's AC-3) needs a queue and a loop to reach.",
      concepts: ["directional arc consistency", "topological order", "tree-CSP theorem"],
    },
    {
      kind: "exercise",
      id: "c-08-e2",
      exerciseKind: "trace",
      prompt:
        "Run cutset conditioning on Australia by hand, cutset {SA}. (a) After fixing SA = r, write down the tree that remains (WA, NT, Q, NSW, V, T with the surviving constraints) and run the two sweeps on it — report the solution or the failure, with every deletion. (b) The full algorithm tries SA = g and SA = b if needed. Given the c-03 solution (WA=r, NT=g, SA=b, Q=r, NSW=g, V=r, T=r), which SA value finishes first, and how many tree-solves does the whole run use?",
      solution: `(a) SA = r fixes the hub — its five constraints still bind, so the
conditioning prunes r from every neighbor: WA = {g, b}, NT = {g, b},
Q = {g, b}, NSW = {g, b}, V = {g, b}; T = {r, g, b} untouched. The
remaining constraint graph (SA's edges aside, SA assigned): WA–NT,
NT–Q, Q–NSW, NSW–V — a path, plus isolated T.
Backward sweep (root WA): every remaining domain has two values, and
not-equal never prunes a parent whose child has at least two values —
the sweep deletes NOTHING. Forward walk: WA = g, NT = b (≠ g), Q = g,
NSW = b, V = g, T = r. Check against SA = r: every neighbor differs
from r ✓. SOLVED — one tree-solve, zero deletions, zero failures.

(b) SA = r succeeds immediately — the first tree-solve returns a
complete solution (a different one from c-03's, and that is fine: any
complete consistent assignment is an answer). Total tree-solves: 1.
(Had SA = r failed — it cannot here, but the algorithm does not know
that — SA = g and SA = b would follow, worst case 3 = d^c tree-solves.)`,
      explanation:
        "The conditioning step is where the bookkeeping lives: fixing SA = r prunes r from all five neighbors BEFORE the sweeps run. With two-value domains and not-equal, the backward pass finds nothing left to do — the path was already consistent — and the forward walk glides. The d^c multiplier is the price of not knowing which SA value works.",
      concepts: ["cutset conditioning", "tree sweep", "conditioning"],
    },
    {
      kind: "exercise",
      id: "c-08-e3",
      exerciseKind: "concept-check",
      prompt:
        "You must choose a cycle cutset for Australia and a colleague proposes {NT, Q} instead of {SA}. Both are honest cutsets (removing either set also breaks every cycle). Why is {SA} still the better choice, and what general principle does the comparison state?",
      options: [
        {
          text: "{SA} is better because SA has the largest domain — removing big-domain variables first is always cheaper",
          correct: false,
          feedback: "All seven domains are {r, g, b} — the same size. The principle is about the cutset's CARDINALITY, not domain sizes (which matter only through d^c).",
        },
        {
          text: "{SA} has size 1 against {NT, Q}'s size 2: the cost multiplier is d^c, so 3 tree-solves against 9 — and the principle is: minimize the cutset's size, because each cutset variable costs a full factor of d",
          correct: true,
          feedback: "Exactly — d^c is the whole story: c = 1 beats c = 2 by a factor of d, whatever the variables' names. (Finding the MINIMUM cutset is itself NP-hard — the honesty of this lesson's last text block.)",
        },
        {
          text: "{NT, Q} is actually better because removing two variables leaves a smaller tree to solve",
          correct: false,
          feedback: "The tree shrinks by (n−c)·d² — linear relief — while the multiplier grows by a factor of d — exponential cost. The trade always favors smaller c.",
        },
        {
          text: "It does not matter — both cutsets give the same O(n·d²) bound",
          correct: false,
          feedback: "The bound is O(d^c · (n−c) · d²), and c differs: 1 against 2. The exponent is exactly where the difference lives.",
        },
      ],
      solution:
        "The cost is d^c · (n−c) · d²: cutset size enters as an EXPONENT, tree size as a factor. {SA}: c = 1, cost ≈ 3 · 6 · 9. {NT, Q}: c = 2, cost ≈ 9 · 5 · 9. The smaller cutset wins by nearly a factor of d — the principle: minimize c, because each cutset variable multiplies the whole linear sweep by d.",
      explanation:
        "Exponential-versus-linear is this lesson's recurring arithmetic: structure pays linearly, ignorance pays exponentially — and the cutset is where you choose how much of each to buy.",
      concepts: ["cutset size", "complexity trade", "d^c multiplier"],
    },
  ],
  terms: [
    {
      term: "tree-structured CSP",
      definition: "A binary CSP whose constraint graph is acyclic — solvable in O(n·d²) by one backward consistency pass and a failure-free forward walk.",
    },
    {
      term: "topological order",
      definition: "An ordering of a rooted tree's variables in which every variable appears after its parent — the stage direction for the two sweeps.",
    },
    {
      term: "cutset conditioning",
      definition: "Break a nearly-tree's cycles by fixing c variables (the cycle cutset) by brute force; solve each remaining tree in linear time. Total cost O(d^c · (n−c) · d²).",
    },
    {
      term: "tree decomposition",
      definition: "The generalization: cluster variables into tree-arranged bags of width w; any CSP of treewidth w solves in O(n·d^(w+1)). Cutset conditioning is the width-1 pattern.",
    },
  ],
  mistakes: [
    {
      mistake: "Running the backward sweep root-first",
      why: "A parent pruned against a child's not-yet-final domain earns a guarantee the child can later break — the forward walk can then fail, and the algorithm quietly becomes backtracking.",
      fix: "Sweep leaves-to-root: by the time a parent is pruned against a child, every one of the child's own children has already fired, so its domain is final.",
    },
    {
      mistake: "Confusing 'a spanning tree of the graph' with 'the graph is a tree'",
      why: "Every connected graph CONTAINS a spanning tree; the theorem needs the constraint graph itself to have no extra edges, because each extra edge is a constraint the sweeps would never revisit.",
      fix: "Count: a tree on n nodes has exactly n−1 edges. Australia has 9 edges on 7 nodes — not a tree, whatever spanning tree you can draw inside it.",
    },
    {
      mistake: "Treating cutset size as a minor implementation detail",
      why: "c enters the bound as an exponent — c = 1 and c = 2 differ by a factor of d, and c = 5 on a d = 9 problem is already 59,049 tree-solves.",
      fix: "Choose the cutset from the drawing (the hub that routes the cycles), count c, and price the run — O(d^c · (n−c) · d²) — before committing.",
    },
    {
      mistake: "Concluding 'CSPs are solved' from the tree result",
      why: "The theorem carves out trees; general CSPs remain NP-complete, and Sudoku — average degree 20 — sits firmly in the hard world.",
      fix: "State the hierarchy honestly: trees linear, treewidth-w at O(n·d^(w+1)), general NP-complete — and in practice heuristics plus propagation carry the instances in between.",
    },
  ],
  takeaways: [
    "A tree CSP solves in O(n·d²): one backward pass of parent-against-child pruning (leaves first), then a forward walk that cannot fail.",
    "The no-fail guarantee is directional: prune only against final domains — leaves-first is what makes domains final.",
    "Nearly-trees: fix a cycle cutset of size c by brute force, d^c tree-solves follow at O((n−c)·d²) each — Australia's cutset is its hub, {SA}.",
    "Tree decomposition generalizes the ladder: treewidth w costs O(n·d^(w+1)); general CSPs stay NP-complete above it.",
    "Structure is an opportunity, not a promise: read the drawing (c-02), then decide — search, propagation, or the linear sweep the shape happens to allow.",
  ],
  quiz: [
    {
      id: "c-08-q1",
      prompt: "Where does the O(n·d²) tree bound's d² come from?",
      options: [
        { text: "Each variable's domain has d values, and each value must be checked against the goal test — d × d", correct: false, feedback: "The goal test is one completeness check, not a per-value cost. The d² lives in the arc-consistency step." },
        { text: "Each of the n−1 edges gets one MAKE-ARC-CONSISTENT call, and each call may compare every parent value against every child value — d × d per edge", correct: true, feedback: "Exactly: (n−1) edges × d² comparisons = O(n·d²). The tree's contribution is that each edge is touched EXACTLY once — no queue, no revisits." },
        { text: "The forward walk tries up to d values for each of n variables, and fails up to d times before succeeding", correct: false, feedback: "The forward walk cannot fail — that is the theorem's point. And each assignment picks the first consistent value, not d of them." },
        { text: "It is the depth of the tree times the branching factor, as in Part A's b^m bound", correct: false, feedback: "There is no search tree here — the constraint graph IS a tree, and the algorithm never branches. Category error worth catching." },
      ],
      explanation: "One pass, one arc-consistency step per edge, d² per step: linear in edges, quadratic in domain size — and nothing else.",
    },
    {
      id: "c-08-q2",
      prompt: "Australia's cycle cutset is {SA}, size 1. Sudoku's pairwise graph (810 edges, average degree 20) — what does cutset conditioning honestly offer there?",
      options: [
        { text: "Nothing — Sudoku has no cycles", correct: false, feedback: "810 edges on 81 nodes is almost nothing BUT cycles. The question is not whether cycles exist but how many variables must go to break them all." },
        { text: "A cutset small enough to beat backtracking — the method always pays when the graph is dense", correct: false, feedback: "Inverted: density INFLATES the cutset. d^c with c large is brute force wearing a theorem's clothes." },
        { text: "A cutset so large that d^c swamps the savings — the method quietly degenerates into enumerating a large fraction of the space, which is exactly what the drawing warned about", correct: true, feedback: "Correct — c-02's average degree 20 is the forecast: nearly every variable sits on many cycles, so the cutset grows until conditioning is enumeration. The honest close: run heuristics plus propagation instead." },
        { text: "Sudoku is n-ary, so cutset conditioning does not apply to it in principle", correct: false, feedback: "It applies to the pairwise view (810 binary edges) or via hypergraph generalizations — the obstacle is the cutset's SIZE, not the arity." },
      ],
      explanation: "The method's price tag d^c is honest arithmetic: on near-trees it is a bargain, on dense graphs it is the exponential coming back. The drawing (c-02) tells you which before you pay.",
    },
    {
      id: "c-08-q3",
      prompt: "The forward walk assigns E1 = s1, E2 = s2 (forced), E3 = s1, E4 = s2, E5 = s3 on the corridor instance. Why could E4's step not fail, given E3 chose s1?",
      options: [
        { text: "Because E4's domain had three values and only one was excluded", correct: false, feedback: "E4's domain was {s1, s2} after the sweep — two values, one excluded by E3's s1, one survivor. The margin was exactly one, and that is the general case worth understanding." },
        { text: "Because E5 = {s3} had already forced E4 ≠ s3 in the backward sweep — so s2 was sitting in D(E4) precisely so that a choice like E3 = s1 would still have a witness", correct: true, feedback: "Exactly: the sweep deleted E4's s3 against E5's singleton, and that deletion is what left s2 available. The walk's safety was manufactured one sweep earlier." },
        { text: "Because the algorithm backtracks if a step fails, so failure is impossible by definition", correct: false, feedback: "There is no backtracking in TREE-CSP-SOLVER — that is its entire selling point. If a step COULD fail, the algorithm would be wrong, not self-healing." },
        { text: "Because not-equal constraints can never cause failures on paths", correct: false, feedback: "Plain backtracking on paths fails plenty (c-03's schedule was a path!). It is the SWEEP that prevents failure, not the graph's shape alone." },
      ],
      explanation: "Every safe step of the forward walk was paid for in the backward sweep: E4 = s2 was the witness whose availability the earlier deletion guaranteed.",
    },
  ],
};
