/**
 * PART A · MODULE 2 · "A* and Its Guarantees" — lesson a-07, "A* Search".
 *
 * Every `output` is the REAL output of running the code
 * (scripts/verify-classical-outputs.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_07: ClassicalLesson = {
  slug: "a-07",
  title: "A* Search",
  minutes: 35,
  summary:
    "Combine exact cost-so-far with an admissible estimate-to-go and expand the most promising frontier node first.",
  kind: "coding",
  objectives: [
    "Explain why f(n) = g(n) + h(n) is the right thing to order the frontier by",
    "Trace A* by hand on the Romania map with straight-line distances",
    "Implement A* in Python with a priority frontier and a stale-entry guard",
    "State precisely when the first goal popped is guaranteed optimal",
  ],
  why: "Uniform-cost search wastes itself expanding every city that is closer than the destination; greedy best-first sprint down one road and sometimes delivers you 32 km late. A* is the correction both deserve: keep the exact bookkeeping of the first and the sense of direction of the second. Published by Hart, Nilsson and Raphael in 1968 for robot route planning, it remains the reference point of informed search — the algorithm your phone's map quietly descends from, and the baseline every planner in Part E measures itself against. Getting it right means getting its guarantee right, and that guarantee is the work of this lesson.",
  blocks: [
    {
      kind: "text",
      text: "Greedy best-first search had the right instinct and the wrong bookkeeping: it ordered the frontier by *h(n)* alone, treating a state's estimated distance to the goal as if it were its total trip cost, and paid for the confusion with a 450 km answer to a 418 km question. Uniform-cost search had the right bookkeeping and no instincts at all: it ordered by *g(n)*, the exact cost so far, and would cheerfully expand every suburb of Arad before considering the long road east. A* Search orders the frontier by the sum of both — the cost already paid plus the cost still estimated:",
    },
    {
      kind: "math",
      title: "The evaluation function",
      displays: [
        { expr: "f(n) = g(n) + h(n)", label: "A*'s key" },
        { expr: "g(n) = \\text{exact path cost so far}, \\quad h(n) \\le h^*(n) \\text{ admissible}", label: "the two halves" },
      ],
      caption:
        "f(n) is a lower bound on the best total cost of any solution that passes through n — provided h never overestimates. A* expands the frontier node whose bound is tightest.",
    },
    {
      kind: "definition",
      term: "A* Search",
      informal:
        "Best-first search over the frontier ordered by f = g + h: the cost already incurred plus an admissible estimate of the cost still to go.",
      formal: "\\text{pop } n : f(n) = \\min_{m \\in F} [g(m) + h(m)]",
      why: "Every other algorithm in this module is a special case: h = 0 gives uniform-cost search; ignoring g gives greedy best-first.",
    },
    {
      kind: "algorithm",
      name: "A* Search",
      family: "Informed search",
      problem: "Find a minimum-cost path from a start state to a goal in a weighted graph, given an admissible heuristic.",
      idea:
        "Run uniform-cost search, but add the heuristic to the priority: the frontier is ordered by the best total cost any solution through that node could possibly have. Because that bound only tightens as h sharpens, A* expands exactly the nodes whose bounds beat the optimal cost — and no others, when h is informative.",
      strategy: [
        "Put the start on a priority frontier with priority f(s) = h(s).",
        "Pop the frontier node with the smallest f; skip stale entries.",
        "If it is a goal, stop — the path cost g is optimal (the guarantee below).",
        "For each successor, relax if the new g beats the best seen; push with priority g + h.",
      ],
      guarantees: [
        "Complete whenever the branching factor is finite and step costs are positive",
        "Optimal in tree search when h is admissible (never overestimates)",
        "Optimal in graph search — without reopening — when h is consistent (h(n) ≤ c(n,n') + h(n'))",
        "Never expands more nodes than any other optimal algorithm using the same h — h is doing all the work",
      ],
      useWhen: [
        "You need the provably cheapest path, not a good one",
        "You can build an admissible heuristic (relaxations are the standard recipe)",
        "The state space is small enough to hold the frontier in memory — A* is memory-hungry",
      ],
      pitfalls: [
        "An inadmissible h silently breaks optimality — the guarantee is only as honest as the heuristic",
        "Exponential space: the frontier holds every promising node, and 'promising' multiplies",
      ],
    },
    { kind: "heading", text: "The trace, by hand" },
    {
      kind: "searchTree",
      title: "A* from Arad, the decisive first steps",
      legend: "g = road cost so far · h = straight line to Bucharest · f = g + h",
      root: {
        id: "arad",
        label: "Arad",
        cost: 0,
        heuristic: 366,
        status: "root",
        children: [
          {
            id: "zerind",
            label: "Zerind",
            cost: 75,
            heuristic: 374,
            status: "muted",
            edge: "75",
            children: [{ id: "oradea", label: "Oradea", cost: 146, heuristic: 380, status: "muted", edge: "71" }],
          },
          {
            id: "sibiu",
            label: "Sibiu",
            cost: 140,
            heuristic: 253,
            status: "expanded",
            edge: "140",
            children: [
              {
                id: "rvilcea",
                label: "R.Vilcea",
                cost: 220,
                heuristic: 193,
                status: "frontier",
                edge: "80",
              },
              { id: "fagaras", label: "Fagaras", cost: 239, heuristic: 176, status: "frontier", edge: "99" },
              { id: "oradea2", label: "Oradea", cost: 291, heuristic: 380, status: "muted", edge: "151" },
            ],
          },
          { id: "timisoara", label: "Timisoara", cost: 118, heuristic: 329, status: "muted", edge: "118" },
        ],
      },
      caption:
        "Here is the Romania map from the first lesson, each city annotated by its straight-line distance to Bucharest — the admissible heuristic, because no road ever built is shorter than a ruler. After expanding Arad (f = 366) the frontier holds Zerind (f = 449), Timișoara (f = 447) and Sibiu (f = 393). A* takes Sibiu — cheapest bound — and its children become the new competition: R. Vâlcea (f = 413) and Făgăraș (f = 415) now outrank everything else on the map.",
    },
    {
      kind: "text",
      text: "From here the race is between the two routes south: through R. Vâlcea and Pitești (f climbing 413 → 417 → 418) and through Făgăraș directly to Bucharest (f = 415 → but arriving at g = 450). Greedy search committed to the Făgăraș road the moment it saw h = 176. A* holds both open, because their *bounds* — 413 versus 415 — are nearly tied, and it is still possible the R. Vâlcea road hides a cost. It does not; the frontier finally pops Bucharest itself at f = 418, and the search can stop:",
    },
    {
      kind: "math",
      title: "Why stopping at the pop is licensed",
      displays: [
        { expr: "f(n) = g(n) + h(n) \\ge g(n) \\ge g^*(n) \\ge C^* - h^*(n) \\ge C^* - h(n)" },
      ],
      caption:
        "For any frontier node n on an optimal path: h admissible means h(n) ≤ h*(n) ≤ C* − g*(n) ≤ C* − g(n). Rearranged: f(n) ≥ C*. Every open alternative bounds the optimal cost from below — so when a goal reaches the top of the frontier at C*, nothing left behind can beat it.",
    },
    {
      kind: "pseudocode",
      title: "A* with a lazy-deletion priority frontier",
      lines: [
        { text: "function A*(start, goal)", tone: "key" },
        { text: "frontier ← priority queue with (h(start), 0, start)", indent: 1 },
        { text: "came, best_g ← {}, {start: 0}", indent: 1 },
        { text: "while frontier not empty", indent: 1 },
        { text: "f, g, n ← POP-MIN(frontier)", indent: 2 },
        { text: "if n already expanded then continue", indent: 2, note: "stale queue entry — a better n was popped earlier" },
        { text: "mark n expanded with cost g", indent: 2 },
        { text: "if n = goal then return path, g", indent: 2, tone: "key", note: "first goal popped is optimal under admissible h" },
        { text: "for each (n', step) in SUCCESSORS(n)", indent: 2 },
        { text: "g' ← g + step", indent: 3 },
        { text: "if g' < best_g[n'] then", indent: 3 },
        { text: "best_g[n'] ← g'; PUSH(frontier, (g' + h(n'), g', n'))", indent: 4, note: "relaxation: found a cheaper way to n'" },
      ],
      note: "Time O(b^d) in the worst case like UCS — but a sharp h shrinks the effective branching factor toward 1. Space is the wall: the frontier is exponential.",
    },
    {
      kind: "pythonImpl",
      title: "A* on the Romania map, with the expansion order printed",
      intent:
        "The full algorithm on the map we have traced twice: watch the expansion order agree with the hand trace, and the cost come out at the optimum 418.",
      code: `from heapq import heappush, heappop

ROMANIA = {
    "Arad": [("Zerind", 75), ("Sibiu", 140), ("Timisoara", 118)],
    "Zerind": [("Oradea", 71), ("Arad", 75)],
    "Oradea": [("Sibiu", 151), ("Zerind", 71)],
    "Sibiu": [("Fagaras", 99), ("R.Vilcea", 80), ("Arad", 140), ("Oradea", 151)],
    "Timisoara": [("Lugoj", 111), ("Arad", 118)],
    "Lugoj": [("Mehadia", 70), ("Timisoara", 111)],
    "Mehadia": [("Drobeta", 75), ("Lugoj", 70)],
    "Drobeta": [("Craiova", 120), ("Mehadia", 75)],
    "Craiova": [("R.Vilcea", 146), ("Drobeta", 120)],
    "R.Vilcea": [("Sibiu", 80), ("Craiova", 146), ("Pitesti", 97)],
    "Fagaras": [("Bucharest", 211), ("Sibiu", 99)],
    "Pitesti": [("R.Vilcea", 97), ("Craiova", 138), ("Bucharest", 101)],
    "Bucharest": [("Fagaras", 211), ("Pitesti", 101), ("Giurgiu", 90)],
    "Giurgiu": [("Bucharest", 90)],
}
# straight-line distance to Bucharest (the admissible heuristic)
SLD = {"Arad": 366, "Zerind": 374, "Oradea": 380, "Sibiu": 253, "Timisoara": 329,
       "Lugoj": 244, "Mehadia": 241, "Drobeta": 242, "Craiova": 160, "R.Vilcea": 193,
       "Fagaras": 176, "Pitesti": 100, "Bucharest": 0, "Giurgiu": 77}

def a_star(start, goal):
    frontier = [(SLD[start], 0, start)]          # (f, g, city)
    came, best_g, expanded = {}, {start: 0}, []
    while frontier:
        f, g, city = heappop(frontier)
        if city in came:                          # stale queue entry
            continue
        came[city] = g
        expanded.append(city)
        if city == goal:
            return expanded, g
        for nxt, step in ROMANIA[city]:
            g2 = g + step
            if g2 < best_g.get(nxt, float("inf")):
                best_g[nxt] = g2
                heappush(frontier, (g2 + SLD[nxt], g2, nxt))
    return expanded, None

expanded, cost = a_star("Arad", "Bucharest")
print("expansion order:", " -> ".join(expanded))
print("optimal cost:", cost)`,
      output: `expansion order: Arad -> Sibiu -> R.Vilcea -> Fagaras -> Pitesti -> Bucharest
optimal cost: 418`,
      walkthrough: [
        "The frontier holds `(f, g, city)` triples — Python's heap orders by f first, so the tie-broken pop is exactly `argmin f`.",
        "`best_g` is the relaxation ledger: a city re-enters the frontier only when a cheaper way to reach it is found. This is what makes it graph search, not tree search.",
        "The `city in came` check is lazy deletion: heaps cannot decrease-key, so stale entries are skipped when they surface. Without it, a city could be expanded twice with an old g.",
        "Six expansions — versus uniform-cost search, which must expand every city with g < 418 (twelve of them on this map) before touching Bucharest. That gap is the heuristic's entire value.",
        "Bucharest pops at f = 418 = g: the estimate was exactly zero at the goal, and the optimality guarantee cashes out.",
      ],
      project: "The frontier interface here is the one the Part A project's three search implementations share.",
    },
    { kind: "heading", text: "What A* costs" },
    {
      kind: "complexity",
      title: "The informed family, honestly measured",
      reading: "Notice the pattern: sharper heuristics move work from 'worst' toward 'best' — A* with a perfect h expands only the optimal path.",
      rows: [
        { algorithm: "Uniform-cost", best: "O(b^d)", average: "O(b^(1+⌊C*/ε⌋))", worst: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))", note: "h = 0: blind, exhaustive within the cost bound" },
        { algorithm: "Greedy best-first", best: "O(b^m)", average: "O(b^m)", worst: "O(b^m)", space: "O(b^m)", note: "not optimal; often dramatically fewer expansions" },
        { algorithm: "A* (admissible h)", best: "O(d)", average: "between", worst: "O(b^(d − ⌈log_b δ⌉))", space: "O(b^d)", highlight: true, note: "δ = h's maximum pruning advantage; space is the practical wall" },
        { algorithm: "A* (perfect h = h*)", best: "O(d)", average: "O(d)", worst: "O(d)", space: "O(d)", note: "the unreachable ideal — expands only the optimal path" },
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Tree search, graph search — and the fine print",
      text: "The optimality argument above is for TREE-search A*: with an admissible h, the first goal popped is optimal. GRAPH-search A* — one expansion per state, the version everyone implements — additionally needs h to be CONSISTENT (h(n) ≤ c(n,n') + h(n')), or it must be willing to reopen expanded nodes when a cheaper g arrives. Straight-line distance is consistent, so the program above is safe; the next lesson builds the counterexample where a merely-admissible h and a permanent closed list conspire to return a suboptimal path.",
    },
    {
      kind: "exercise",
      id: "a-07-e1",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: in the program above, which city is the FOURTH to be expanded (after Arad, Sibiu and R. Vâlcea)? Type the city name exactly as the program spells it.",
      expectedOutput: "Fagaras",
      solution: "Fagaras",
      explanation:
        "After R. Vâlcea (f = 413) the frontier holds Făgăraș (f = 415), Pitești (g = 317, f = 417), Timișoara (f = 447), Zerind (f = 449) and Craiova (g = 366, f = 526). The race is Pitești (417) versus Făgăraș (415): Făgăraș pops first — the fourth expansion — and adds Bucharest at g = 450 (f = 450); only then does Pitești (417) open the cheaper road, and Bucharest finally pops at 418.",
      concepts: ["A*", "frontier ordering"],
    },
    {
      kind: "exercise",
      id: "a-07-e2",
      exerciseKind: "trace",
      prompt:
        "A colleague sets h ≡ 0 in the program. What exactly changes in the expansion order, and which algorithm have they recovered? Trace the first three pops.",
      solution:
        "With h ≡ 0 the frontier is ordered by g alone: Arad (0) pops, then Zerind (75), then Timișoara (118) — Sibiu (140) waits its turn. The order becomes the uniform-cost order (Zerind and Timișoara before Sibiu), Craiova and every other city under the cost bound gets expanded, and Bucharest still pops at 418 — later, with more work. They have recovered uniform-cost search: h = 0 is A*'s degenerate heuristic.",
      explanation:
        "A* with h ≡ 0 is UCS — the evaluation function reduces to g. This is worth internalizing: heuristic strength is a dial, and the dial's zero point is exhaustive cheapest-first search.",
      concepts: ["A*", "uniform-cost search"],
    },
    {
      kind: "exercise",
      id: "a-07-e3",
      exerciseKind: "write-code",
      prompt:
        "Make A* lazy: modify the program so that instead of `best_g` bookkeeping it pushes every successor unconditionally. Run it on the map — does the answer change? Does the expansion list change? Explain the difference in a comment.",
      starter: `from heapq import heappush, heappop
from math import inf

# The map and SLD tables are as in the lesson. Push every successor;
# skip only already-expanded cities. What changes?

# 1. copy the ROMANIA and SLD tables here from the lesson
# 2. drop the best_g relaxation test -- push unconditionally
# 3. print the expansion order and cost
# 4. compare with the lesson's output in a comment: which cities appear
#    more than once in the queue? is the final cost still 418?
`,
      solution: `# Answer outline: without best_g the queue accumulates stale entries
# (e.g. Sibiu reachable via Oradea at g=291 after being reached at g=140),
# but the "already expanded" check skips them at pop time. The expansion
# order and the final cost (418) are unchanged; only the queue grows.
# The relaxation test is an optimization, not a correctness device --
# WITH the expanded-check present. Remove the expanded-check too and
# the algorithm degenerates into tree search over a graph: still optimal
# here (SLD is consistent), but cities expand repeatedly.`,
      explanation:
        "Lazy deletion plus the expanded-check makes relaxation redundant for correctness — but without relaxation the queue can hold exponentially many stale entries, so real implementations keep both. The exercise builds the engineering intuition for why the pseudocode carries both lines.",
      concepts: ["A*", "priority frontier", "relaxation"],
    },
  ],
  terms: [
    {
      term: "evaluation function",
      definition: "The function f(n) = g(n) + h(n) A* orders its frontier by: exact cost-so-far plus admissible estimate-to-go — a lower bound on any solution through n.",
    },
    {
      term: "admissible heuristic",
      definition: "A heuristic h with h(n) ≤ h*(n) for every state: it never overestimates the true remaining cost. The license for A*'s optimality.",
    },
    {
      term: "relaxation (of a search problem)",
      definition: "A version of the problem with constraints removed; its exact solution cost is an admissible heuristic for the original. Straight-line distance is the solution cost of 'travel as the crow flies'.",
    },
    {
      term: "effective branching factor",
      definition: "The b* satisfying N + 1 = 1 + b* + ... + b*^d for the N nodes A* expanded at solution depth d — how informed the heuristic made the search feel.",
    },
  ],
  mistakes: [
    {
      mistake: "Ordering the frontier by h(n) instead of g(n) + h(n).",
      why: "The estimate ignores money already spent; the search happily commits to a path that started expensively, which is exactly greedy search's failure.",
      fix: "The priority must be the SUM. If you can hold the whole story in one number, it is f — never h alone.",
    },
    {
      mistake: "Returning the goal when it is GENERATED rather than when it is POPPED.",
      why: "At generation, other frontier nodes may still beat the goal's cost through tighter bounds; A*'s guarantee attaches to the pop, not the push.",
      fix: "Goal-test at expansion time (after the pop) — line 8 of the pseudocode — never at generation.",
    },
    {
      mistake: "Using a permanent closed list with an inconsistent heuristic.",
      why: "An inconsistent h can pop a state with a stale g; if the closed list refuses reopening, the recorded path through that state stays suboptimal forever.",
      fix: "Either prove consistency (the next lesson's toolkit) or reopen closed nodes when a cheaper g arrives — the engineering choice, stated honestly.",
    },
  ],
  takeaways: [
    "A* orders the frontier by f = g + h — exact bookkeeping plus admissible instinct. UCS and greedy best-first are its two degenerate dials (h = 0 and g ignored).",
    "The goal test happens at the POP. When a goal tops the f-ordered frontier, every alternative bounds the optimum from below — stopping is licensed.",
    "Relaxation is the heuristic factory: drop a constraint, solve exactly, use that cost as h. It is admissible by construction.",
    "Optimality of graph-search A* needs consistency, not just admissibility — or a willingness to reopen states.",
    "Space, not time, is A*'s practical wall: the frontier is exponential, which is exactly the pressure that later produced IDA* and the planners of Part E.",
  ],
  quiz: [
    {
      id: "a-07-q1",
      prompt: "A* and uniform-cost search are given the same problem. Which statement is TRUE?",
      options: [
        { text: "A* always expands fewer nodes than UCS", correct: false, feedback: "Not always — with h ≡ 0 they expand identically. Strictly fewer requires h to actually discriminate somewhere." },
        { text: "A* never expands a node whose f exceeds the optimal cost C*", correct: true, feedback: "Correct — any node popped has f ≤ C* (or it would not beat the eventual goal at the top), and with consistent h every expansion satisfies this. UCS by contrast expands everything with g < C*." },
        { text: "UCS finds better paths when step costs vary", correct: false, feedback: "Both are optimal — h's admissibility preserves exactly that. A* simply gets there with less work." },
        { text: "A*'s frontier is smaller than UCS's", correct: false, feedback: "The frontier can be larger — A* holds promising-but-unexplored branches UCS would already have abandoned as too costly so far." },
      ],
      explanation: "The f ≤ C* invariant is the whole story of A*'s efficiency: it expands only nodes whose lower bound still competes with the optimum.",
    },
    {
      id: "a-07-q2",
      prompt: "In the traced run, Făgăraș (f = 415) was expanded before Pitești (f = 417), even though the Pitești road is the optimal one. Why is that not a mistake?",
      options: [
        { text: "Because ties are broken alphabetically", correct: false, feedback: "No tie — 415 < 417 strictly. Order was by f, correctly." },
        { text: "Because f is a lower bound, not a prediction: A* must expand every node whose bound beats the eventual answer, and 415 < 418", correct: true, feedback: "Exactly. A* cannot know in advance that the Făgăraș branch bottoms out at 450; while its bound (415) is live, the branch might still win. Certainty arrives only at the pop." },
        { text: "Because Făgăraș has a smaller h", correct: false, feedback: "It does (176 < 193 at their parents' generation) — but the ordering is by f, and the question is about justification, not arithmetic." },
        { text: "It IS a mistake — a better implementation would skip it", correct: false, feedback: "Skipping nodes with f < C* is exactly what an optimal algorithm cannot do — that node might have been on the true optimum." },
      ],
      explanation: "Optimal search pays for certainty with breadth: every live bound below the final answer must be explored. Sharper heuristics shrink the set of live bounds.",
    },
    {
      id: "a-07-q3",
      prompt: "A student's A* returns a 450-cost route on this map. The most likely bug, given the lesson's trace?",
      options: [
        { text: "They used the wrong tie-breaking rule", correct: false, feedback: "Ties cannot change the returned cost when the guarantee holds — both 418 candidates would be found." },
        { text: "They goal-tested at generation (push) time — Bucharest entered via Făgăraș at g = 450 and was declared done before Pitești's cheaper road surfaced", correct: true, feedback: "Correct — that is precisely how the 450 route wins a buggy race: it is FOUND first, and a generation-time test declares victory early." },
        { text: "Their heap is not a min-heap", correct: false, feedback: "Then the expansion order would be nonsense, not specifically 450." },
        { text: "Straight-line distance is inadmissible", correct: false, feedback: "It is admissible (and consistent) — the shortest possible road can't beat the ruler." },
      ],
      explanation: "Generation-time goal testing is the classic A* bug: the guarantee belongs to the pop, and the fix is one moved `if`.",
    },
  ],
};
