/**
 * PART A · MODULE 1 · "Uninformed Search" — lesson a-03, "Breadth-First and
 * Uniform-Cost Search".
 *
 * Every `output` is the REAL output of running the code
 * (scripts/verify-classical-outputs.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_03: ClassicalLesson = {
  slug: "a-03",
  title: "Breadth-First and Uniform-Cost Search",
  minutes: 35,
  summary:
    "Two frontier disciplines: expand shallowest first, or cheapest first — and the guarantees each buys.",
  kind: "coding",
  objectives: [
    "Explain the frontier abstraction — why BFS and UCS are one search engine wearing two queueing disciplines",
    "Trace breadth-first search on the Romania map level by level, and say exactly when and why it stops",
    "Use the map's 450-versus-418 arithmetic to state precisely when BFS's optimality holds and when it fails",
    "Implement uniform-cost search with heapq, a relaxation ledger and lazy deletion",
    "State the completeness and optimality conditions of both algorithms, and the complexity each pays",
  ],
  why: "Both lessons and whole industries run on this trade: breadth-first search commits to shallowest-first and uniform-cost search to cheapest-first, and everything else about them is one shared loop. The disciplines look almost too simple to matter — a queue versus a priority queue — and the difference is not: on this course's own Romania map, the shallowest Arad-to-Bucharest route costs 450 km while the cheapest costs 418, and only one of the two algorithms can tell them apart. These are the honest baselines every smarter method gets judged against — A* in Module 2 is literally uniform-cost search plus one honest number — and their guarantee conditions (equal costs, positive costs, finite branching) are the first place a real system's search silently goes wrong.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Strip a search algorithm down to its loop and one object survives: a **frontier** of generated-but-unexpanded states, waiting to be picked. The very first lesson's crossing solver already ran this loop with a plain queue — it just never drew attention to the queue itself. Which state the loop picks next is the entire algorithm; everything else is bookkeeping. This lesson studies the two most disciplined answers available when you know nothing about where the goal is: always pick the shallowest state first (breadth-first search), or always pick the cheapest state first (uniform-cost search). The first discipline runs on a FIFO queue and never reads the map's kilometres; the second runs on a priority queue and reads nothing else. The Romania map from the first lesson will hand both algorithms the same question — Arad to Bucharest — and then hand one of them a counterexample it cannot answer.",
    },
    {
      kind: "definition",
      term: "Breadth-first search",
      informal:
        "The frontier is a FIFO queue: always expand the shallowest state generated so far, sweeping the space level by level — every state one step from the start, then every state two steps away, and so on.",
      formal: "\\text{pop } n : \\text{depth}(n) = \\min_{m \\in F} \\text{depth}(m)",
      why: "The queue IS the algorithm: states leave in the order they entered, and that order is exactly non-decreasing depth — nothing else about BFS differs from any other search.",
    },
    // ------------------------------------------------------------ the map, both ways
    { kind: "heading", text: "Two disciplines, one map" },
    {
      kind: "searchTree",
      title: "Breadth-first from Arad: levels 0–2",
      legend: "edge labels are road km — BFS carries them but treats every edge as cost 1",
      root: {
        id: "arad",
        label: "Arad",
        status: "root",
        children: [
          {
            id: "zerind",
            label: "Zerind",
            status: "expanded",
            edge: "75",
            children: [{ id: "oradea", label: "Oradea", status: "frontier", edge: "71" }],
          },
          {
            id: "sibiu",
            label: "Sibiu",
            status: "expanded",
            edge: "140",
            children: [
              { id: "fagaras", label: "Fagaras", status: "frontier", edge: "99" },
              { id: "rvilcea", label: "R.Vilcea", status: "frontier", edge: "80" },
            ],
          },
          {
            id: "timisoara",
            label: "Timisoara",
            status: "expanded",
            edge: "118",
            children: [{ id: "lugoj", label: "Lugoj", status: "frontier", edge: "111" }],
          },
        ],
      },
      caption:
        "Each city appears once, as a child of the city that generated it first, with the generating road's km as the edge label — carried, never read, because BFS behaves as if every road cost exactly 1. Arad's successors enter the queue in the map's listed order — Zerind, Sibiu, Timișoara — and a FIFO hands them back in exactly that order: Arad at level 0, then all of level 1, then all of level 2. The frame captures the moment level 1 has finished expanding: Oradea, Făgăraș, R. Vâlcea and Lugoj sit on the frontier in generation order, and they will leave it in that same order — Oradea first (nothing new), then Făgăraș, whose expansion generates Bucharest at level 3, then R. Vâlcea (Craiova and Pitești queue behind) and Lugoj. Only when Bucharest works its way to the head of the queue does the search stop — with the three-edge path Arad → Sibiu → Făgăraș → Bucharest, provably the shallowest route on the map.",
    },
    {
      kind: "math",
      title: "The counterexample this map hands you",
      displays: [
        { expr: "450 = 140 + 99 + 211", label: "BFS: Arad → Sibiu → Făgăraș → Bucharest — 3 edges" },
        {
          expr: "418 = 140 + 80 + 97 + 101",
          label: "cheapest: Arad → Sibiu → R. Vâlcea → Pitești → Bucharest — 4 edges",
        },
      ],
      caption:
        "BFS stopped at the shallowest goal and returned a route 32 km more expensive than the best the map offers — not because the queue misbehaved, but because nothing in *shallowest first* ever reads a cost. BFS is optimal in edges, not in kilometres: the guarantee holds exactly when all step costs are equal, the one setting where fewest edges and least cost are the same question. This map's roads cost between 70 and 211 km, so the condition fails — and the honest fix is to make the frontier read the bill. That is the second discipline.",
    },
    {
      kind: "definition",
      term: "Uniform-cost search",
      informal:
        "The frontier is a priority queue ordered by g(n), the exact cost of the cheapest path found to n so far: always expand the cheapest state generated so far, so goals surface in non-decreasing cost order.",
      formal: "\\text{pop } n : g(n) = \\min_{m \\in F} g(m)",
      why: "With every step cost set to 1 this IS breadth-first search — BFS is the unit-cost special case, which is exactly why only UCS's optimality survives unequal costs.",
    },
    {
      kind: "algorithm",
      name: "Uniform-Cost Search",
      family: "Uninformed search",
      problem: "Find a minimum-cost path from a start state to a goal in a weighted graph, knowing nothing beyond the problem itself.",
      idea: "Expand the frontier state with the smallest path cost g. Because every step adds positive cost, pops happen in non-decreasing order of g — so the first time the goal reaches the head of the queue, no cheaper route to it can still be hiding behind a cheaper intermediate state.",
      strategy: [
        "Put the start on the frontier with priority g = 0.",
        "Pop the cheapest frontier state; skip stale entries left behind by cheaper rediscoveries.",
        "If it is the goal, stop — its g is the optimal cost.",
        "For each successor, relax: if the new path to it is cheaper than the best known, record it, re-point its parent, and push it with the new g.",
      ],
      guarantees: [
        "Complete when branching is finite and every step costs at least ε > 0",
        "Optimal at any positive step costs — no equal-cost assumption anywhere",
        "Expands every state cheaper than the optimum C*, and nothing costlier — exhaustive inside the cost bound",
        "Degenerates gracefully: set every step cost to 1 and it becomes breadth-first search — same levels, same guarantees",
      ],
      useWhen: [
        "Step costs vary and the cheapest path is the point — route planning, scheduling, anything with a bill",
        "You have no heuristic and costs vary: UCS is the uninformed cost-optimal baseline",
        "The frontier fits in memory — like BFS, it is exponential in space",
      ],
      pitfalls: [
        "A zero-cost cycle breaks completeness: 'cheapest' never rises, and the search descends forever",
        "Goal-testing at generation silently returns suboptimal paths — the test belongs to the pop",
      ],
    },
    {
      kind: "pseudocode",
      title: "Uniform-cost search with a lazy-deletion heap",
      lines: [
        { text: "function UCS(start, goal)", tone: "key" },
        { text: "frontier ← priority queue with (0, start)", indent: 1 },
        { text: "best_g ← {start: 0}, parent ← {start: NIL}", indent: 1 },
        { text: "while frontier not empty", indent: 1 },
        { text: "g, n ← POP-MIN(frontier)", indent: 2 },
        { text: "if n already expanded then continue", indent: 2, note: "stale entry — a cheaper g for n was popped earlier" },
        { text: "mark n expanded with cost g", indent: 2 },
        { text: "if n = goal then return path, g", indent: 2, tone: "key", note: "first goal popped is optimal at any positive step costs" },
        { text: "for each (n', step) in SUCCESSORS(n)", indent: 2 },
        { text: "if g + step < best_g[n'] then", indent: 3 },
        { text: "best_g[n'] ← g + step; PUSH(frontier, (g + step, n'))", indent: 4, note: "relaxation — a cheaper way to reach n' was found" },
      ],
      note: "Every pop happens in non-decreasing order of g — the invariant behind the guarantee: when the goal surfaces, nothing cheaper remains anywhere. Time and space O(b^(1+⌊C*/ε⌋)), because every state cheaper than C* must be expanded first.",
    },
    {
      kind: "pythonImpl",
      title: "Uniform-cost search on the Romania map, with the expansion order printed",
      intent:
        "The full algorithm on the map the lesson just traced by hand: watch the expansion order obey g, the path dodge the Făgăraș road, and the cost land on the 418 the counterexample promised.",
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
    "Craiova": [("R.Vilcea", 146), ("Drobeta", 120), ("Pitesti", 138)],
    "R.Vilcea": [("Sibiu", 80), ("Craiova", 146), ("Pitesti", 97)],
    "Fagaras": [("Bucharest", 211), ("Sibiu", 99)],
    "Pitesti": [("R.Vilcea", 97), ("Craiova", 138), ("Bucharest", 101)],
    "Bucharest": [("Fagaras", 211), ("Pitesti", 101), ("Giurgiu", 90)],
    "Giurgiu": [("Bucharest", 90)],
}

def ucs(start, goal):
    frontier = [(0, start)]              # (g, city) - heap ties break on the name
    best_g = {start: 0}                  # cheapest known cost per city
    parent = {start: None}               # predecessor on that cheapest path
    came, order = set(), []              # cities already expanded
    while frontier:
        g, city = heappop(frontier)
        if city in came:                 # stale entry: a cheaper g was popped first
            continue
        came.add(city)
        order.append(city)
        if city == goal:                 # goal test at the POP, never the push
            path = []
            while city is not None:
                path.append(city)
                city = parent[city]
            return order, path[::-1], g
        for nxt, step in ROMANIA[city]:
            g2 = g + step
            if g2 < best_g.get(nxt, float("inf")):   # relaxation
                best_g[nxt] = g2
                parent[nxt] = city
                heappush(frontier, (g2, nxt))
    return order, None, None

expanded, path, cost = ucs("Arad", "Bucharest")
print("expansion order:", " -> ".join(expanded))
print("path:", " -> ".join(path))
print("optimal cost:", cost)`,
      output: `expansion order: Arad -> Zerind -> Timisoara -> Sibiu -> Oradea -> R.Vilcea -> Lugoj -> Fagaras -> Mehadia -> Pitesti -> Craiova -> Drobeta -> Bucharest
path: Arad -> Sibiu -> R.Vilcea -> Pitesti -> Bucharest
optimal cost: 418`,
      walkthrough: [
        "The frontier holds `(g, city)` pairs — Python's heap pops the smallest tuple, so equal costs tie-break alphabetically on the city name and the run is deterministic.",
        "`best_g` is the relaxation ledger: a city re-enters the frontier only when a strictly cheaper way to reach it is found. This is the line that re-opens Bucharest at 418 once Pitești discovers the cheap road — the 450 entry from Făgăraș becomes stale.",
        "The `came` set is lazy deletion: heaps cannot decrease-key, so outdated entries are simply skipped when they surface. Without it, a city could be expanded twice with an old g.",
        "Thirteen cities expand — every city with g < 418 — against breadth-first's nine. Reading costs means exhausting everything cheaper than the answer before returning it: that is the price the complexity table below prices in.",
        "Bucharest pops at g = 418 with nothing cheaper left anywhere on the frontier: the optimality guarantee cashing out on the exact route the counterexample said BFS had missed.",
      ],
      project:
        "The pop / stale-check / goal-test / relax loop here is the skeleton the Part A project's route planner reuses for all three of its search implementations.",
    },
    // ------------------------------------------------------------ guarantees
    { kind: "heading", text: "Guarantees, honestly priced" },
    {
      kind: "complexity",
      title: "The two disciplines, measured",
      reading:
        "UCS's exponent hides a warning: ε is the smallest step cost, so C*/ε bounds how many steps a path can take while staying under the optimum — tiny costs let 'cheapest first' chase near-free detours very deep. At equal costs the two bounds coincide, as they must: breadth-first search is uniform-cost search with every cost set to 1.",
      rows: [
        { algorithm: "Breadth-first", best: "O(1)", average: "O(b^d)", worst: "O(b^d)", space: "O(b^d)", note: "optimal only at equal step costs" },
        { algorithm: "Uniform-cost", best: "O(b^d)", average: "O(b^(1+⌊C*/ε⌋))", worst: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))", note: "optimal at any positive costs", highlight: true },
      ],
    },
    {
      kind: "table",
      title: "One engine, two frontier disciplines",
      headers: ["", "Breadth-first (FIFO queue)", "Uniform-cost (priority queue)"],
      rows: [
        ["Orders the frontier by", "depth — shallowest generated state first", "g — cheapest generated state first"],
        ["Reads step costs?", "no — every edge behaves as cost 1", "yes — g accumulates them exactly"],
        ["Optimal when", "all step costs are equal (450 ≠ 418 on this map)", "step costs are any positive numbers"],
        ["Complete when", "branching factor is finite", "branching finite and every cost ≥ ε > 0"],
        ["Worst-case time and space", "O(b^d)", "O(b^(1+⌊C*/ε⌋))"],
        ["Frontier in Python", "collections.deque — popleft()", "heapq — ordered by (g, city)"],
      ],
      caption:
        "Swap the queue for a heap and one number — g — enters the loop: that single substitution is the entire difference between the two algorithms, and the entire difference between a 450 km answer and a 418 km one.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Completeness: the fine print behind 'it will find something'",
      text: "Breadth-first search is complete whenever the branching factor b is finite — it sweeps level by level, never expands a state twice, and must eventually reach any goal at finite depth. Uniform-cost search inherits that guarantee only when step costs are bounded below by some ε > 0: a zero-cost cycle (a road that costs nothing in both directions) generates infinitely many states at the same g, and the search descends forever without surfacing the goal. And both algorithms pay for completeness with memory — the frontier holds every generated-but-unexpanded state, which is exactly what the O(b^d) and O(b^(1+⌊C*/ε⌋)) space bounds are saying. That wall is where the next lesson begins: depth-first search throws away optimality to buy a linear-memory frontier.",
    },
    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-03-e1",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: BFS expanded Sibiu second — it stands second in Arad's adjacency list, and a FIFO preserves the listed order. UCS expands a different city second, because it reads a number the queue never sees. Type the name of UCS's SECOND expansion, exactly as the program prints it.",
      expectedOutput: "Zerind",
      solution: "Zerind",
      explanation:
        "After Arad, the frontier holds Zerind at g = 75, Timișoara at g = 118 and Sibiu at g = 140 — cheapest-first pops Zerind, where the FIFO discipline popped Sibiu. Sibiu waits until fourth in UCS's order (after Timișoara), and Bucharest still pops at 418: the disciplines differ in which states they visit and when, not in what they ultimately prove.",
      concepts: ["uniform-cost search", "frontier ordering"],
    },
    {
      kind: "exercise",
      id: "a-03-e2",
      exerciseKind: "trace",
      prompt:
        "When Fagaras is expanded, UCS pushes Bucharest onto the frontier at g = 450 — the goal itself, sitting right there on the queue. Explain why the search does not return 450 at that moment, and trace every expansion between that push and the program's answer.",
      solution:
        "The goal test runs at the pop, never at the push. When Bucharest enters at 450, the frontier still holds Mehadia (299), Pitești (317) and Craiova (366) — every one cheaper than 450, and any of them might open a cheaper road to Bucharest. One does: Mehadia (299) expands and queues Drobeta (374); Pitești (317) expands and relaxes Bucharest from 450 down to 418, re-pushing it with the cheaper g and re-pointing its parent; Craiova (366) and Drobeta (374) expand without improving anything; only then does Bucharest reach the head of the heap at 418 — returned, optimal, with the stale 450 entry still sitting uselessly beneath it.",
      explanation:
        "Generation-time goal testing would have answered 450 to a 418 question — exactly BFS's counterexample, arrived at by bug rather than by discipline. The frontier's whole job is to hold open the possibility of a cheaper route until nothing cheaper remains.",
      concepts: ["uniform-cost search", "goal test", "relaxation"],
    },
    {
      kind: "exercise",
      id: "a-03-e3",
      exerciseKind: "write-code",
      prompt:
        "Close the loop: implement breadth-first search on the same map — FIFO discipline, goal test at the pop, successors in the map's listed order — and print the expansion order, the path, its edge count and its total kilometres. Your own run should confirm the counterexample: fewest edges, 450 km.",
      starter: `from collections import deque

# 1. copy the ROMANIA map from the lesson, unchanged

# 2. implement the FIFO discipline:
#    - frontier is a deque; pop from the LEFT (that is the whole algorithm)
#    - goal test at the POP, exactly like UCS -- never at the push
#    - push unseen successors to the RIGHT, in the map's listed order
#    - parent[nxt] = city, recorded once, doubles as the visited set
def bfs(start, goal):
    frontier = deque([start])
    parent = {start: None}
    order = []
    # TODO: loop -- pop, goal-test, expand, push unseen successors
    ...

# 3. print four lines: expansion order, path, edge count, total km
#    (sum the km along the returned path, reading them from the map)`,
      solution: `from collections import deque

ROMANIA = {
    "Arad": [("Zerind", 75), ("Sibiu", 140), ("Timisoara", 118)],
    "Zerind": [("Oradea", 71), ("Arad", 75)],
    "Oradea": [("Sibiu", 151), ("Zerind", 71)],
    "Sibiu": [("Fagaras", 99), ("R.Vilcea", 80), ("Arad", 140), ("Oradea", 151)],
    "Timisoara": [("Lugoj", 111), ("Arad", 118)],
    "Lugoj": [("Mehadia", 70), ("Timisoara", 111)],
    "Mehadia": [("Drobeta", 75), ("Lugoj", 70)],
    "Drobeta": [("Craiova", 120), ("Mehadia", 75)],
    "Craiova": [("R.Vilcea", 146), ("Drobeta", 120), ("Pitesti", 138)],
    "R.Vilcea": [("Sibiu", 80), ("Craiova", 146), ("Pitesti", 97)],
    "Fagaras": [("Bucharest", 211), ("Sibiu", 99)],
    "Pitesti": [("R.Vilcea", 97), ("Craiova", 138), ("Bucharest", 101)],
    "Bucharest": [("Fagaras", 211), ("Pitesti", 101), ("Giurgiu", 90)],
    "Giurgiu": [("Bucharest", 90)],
}

def bfs(start, goal):
    frontier = deque([start])            # FIFO: the shallowest-first discipline
    parent = {start: None}               # doubles as the visited set
    order = []
    while frontier:
        city = frontier.popleft()        # the LEFT end: first in, first out
        order.append(city)
        if city == goal:                 # goal test at the pop, like UCS
            path = []
            while city is not None:
                path.append(city)
                city = parent[city]
            return order, path[::-1]
        for nxt, km in ROMANIA[city]:    # the km are carried, never read
            if nxt not in parent:
                parent[nxt] = city
                frontier.append(nxt)
    return order, None

expanded, path = bfs("Arad", "Bucharest")
total = sum(dict(ROMANIA[a])[b] for a, b in zip(path, path[1:]))
print("expansion order:", " -> ".join(expanded))
print("path:", " -> ".join(path))
print("edges:", len(path) - 1)
print("total km:", total)`,
      expectedOutput: `expansion order: Arad -> Zerind -> Sibiu -> Timisoara -> Oradea -> Fagaras -> R.Vilcea -> Lugoj -> Bucharest
path: Arad -> Sibiu -> Fagaras -> Bucharest
edges: 3
total km: 450`,
      explanation:
        "Nine expansions, level by level: Arad alone at level 0; Zerind, Sibiu, Timișoara at level 1; Oradea, Făgăraș, R. Vâlcea and Lugoj at level 2 — in the order they were generated — and then Bucharest, the first level-3 state to reach the head of the queue. The path is the three-edge route, and the final line is the counterexample in your own handwriting: 450 km where uniform-cost search found 418. Same map, same loop, same pop-time goal test — only the queue discipline and the one number g differ.",
      concepts: ["breadth-first search", "frontier discipline", "path cost"],
    },
  ],
  terms: [
    {
      term: "completeness",
      definition:
        "An algorithm's guarantee that it will find a solution whenever one exists. BFS needs only a finite branching factor; UCS additionally needs step costs bounded below by some ε > 0, or a zero-cost cycle can trap it in an infinite descent at constant g.",
    },
    {
      term: "frontier",
      definition:
        "The set of generated-but-unexpanded states — the one structure that distinguishes uninformed algorithms from each other. A FIFO ordering of it gives breadth-first search; an ordering by path cost g gives uniform-cost search.",
    },
    {
      term: "path cost g(n)",
      definition:
        "The sum of step costs along the best path found so far from the start to n. Uniform-cost search orders its entire frontier by this number, and relaxes it downward whenever a cheaper route to n appears.",
    },
    {
      term: "relaxation",
      definition:
        "Recording a cheaper path to an already-generated state — lowering its best g, re-pointing its parent and re-entering it on the frontier. The mechanism that keeps cheap routes open until the pop decides.",
    },
  ],
  mistakes: [
    {
      mistake: "Expecting breadth-first search to find the cheapest route on a weighted map.",
      why: "BFS's optimality proof counts edges, not cost: it returns a shortest path, and 'shortest' means least cost only when every step costs the same. On the Romania map the three-edge route costs 450 km and the four-edge route costs 418.",
      fix: "Decide what 'best' means before choosing a discipline: fewest steps at equal costs — BFS; least cost when costs differ — UCS. The fix is one sentence of requirements analysis, not a line of code.",
    },
    {
      mistake: "Goal-testing at generation (the push) in a cheapest-first search.",
      why: "At the push, cheaper routes to the goal may still hide behind cheaper frontier nodes: Bucharest enters the frontier at g = 450 while Pitești, at g = 317, is about to relax it to 418. The guarantee attaches to the pop.",
      fix: "Test the goal right after the pop, before expanding. If your UCS ever returns 450 on this map, a moved `if` is the first suspect.",
    },
    {
      mistake: "Running UCS on a graph with zero- or negative-cost steps.",
      why: "Completeness and optimality both assume every step costs at least some ε > 0. A zero-cost cycle generates infinitely many states at the same g and the search never surfaces the goal; a negative step breaks the non-decreasing-pop invariant outright.",
      fix: "Validate the cost function at the door: every step cost at least ε > 0 — or accept that you need a different algorithm with different guarantees.",
    },
  ],
  takeaways: [
    "Every uninformed algorithm is one loop — pop, goal-test, expand, push — and the frontier's ordering rule is the entire algorithm: FIFO for breadth-first, smallest-g for uniform-cost.",
    "BFS is optimal in edges: fewest steps, guaranteed — and that equals cheapest only when every step costs the same. The map's 450-versus-418 is the standing counterexample.",
    "UCS orders the frontier by exact cost-so-far, relaxes cheaper routes in, and goal-tests at the pop: the first goal to surface is optimal at any positive step costs.",
    "The goal test belongs to the pop, never the push — frontier time is exactly when a cheaper route can still appear.",
    "Both disciplines buy guarantees with memory: O(b^d) for BFS, O(b^(1+⌊C*/ε⌋)) for UCS — the wall that depth-first search, next lesson, is invented to dodge.",
  ],
  quiz: [
    {
      id: "a-03-q1",
      prompt: "Breadth-first and uniform-cost search both run on the Romania map, Arad to Bucharest. Which statement is TRUE?",
      options: [
        {
          text: "UCS expands a subset of the cities BFS expands",
          correct: false,
          feedback:
            "The reverse, and it is worth counting: UCS expands thirteen cities to BFS's nine — reading costs means exhausting every city cheaper than the 418 optimum, including Craiova, Drobeta and Mehadia, which BFS never touches.",
        },
        {
          text: "BFS finds the same path as UCS, only slower",
          correct: false,
          feedback:
            "Different answers, not different speeds: BFS returns the three-edge route through Făgăraș at 450 km; UCS returns the four-edge route through R. Vâlcea and Pitești at 418. Only at equal step costs do the two coincide.",
        },
        {
          text: "Both searches are complete on this map, but only UCS's answer is optimal",
          correct: true,
          feedback:
            "Correct. Branching is finite, so both eventually find a route; the map's costs (70 to 211 km) break BFS's equal-cost condition, while UCS's optimality needs only positive costs — which every road here has.",
        },
        {
          text: "Neither algorithm guarantees anything without a heuristic",
          correct: false,
          feedback:
            "Heuristics buy efficiency, not guarantees. BFS and UCS are precisely the uninformed algorithms that come with completeness proofs — and, for UCS, optimality at any positive cost.",
        },
      ],
      explanation:
        "Guarantees are conditional, not heuristic-dependent: BFS's optimality demands equal step costs, UCS's demands only positive ones — and this map's costs are positive but far from equal.",
    },
    {
      id: "a-03-q2",
      prompt: "What exactly went wrong for BFS in the 450-versus-418 counterexample?",
      options: [
        {
          text: "Its queue was not truly FIFO",
          correct: false,
          feedback: "It was — and a perfect FIFO is exactly what confines BFS to three-edge routes. No implementation detail failed.",
        },
        {
          text: "A different ordering of level 2 would have found the 418 route",
          correct: false,
          feedback:
            "No ordering of levels can reach it: the cheap route has four edges, and BFS stops at the first goal on the shallowest goal-bearing level. The failure is structural, not a matter of order.",
        },
        {
          text: "Nothing 'went wrong': BFS optimizes edge count, and edge count stops matching cost the moment step costs differ",
          correct: true,
          feedback:
            "Exactly. 140 + 99 + 211 = 450 wins on edges (3 < 4) and loses on kilometres. BFS answered the question it was built for, on a map asking a different one.",
        },
        {
          text: "BFS stopped too early — continuing past Bucharest would have found 418",
          correct: false,
          feedback:
            "Continuing cannot change which route is shallowest, and BFS returns the shallowest goal it finds. The cure is a different frontier discipline, not more patience.",
        },
      ],
      explanation:
        "The best counterexamples are structural: BFS is optimal exactly where 'fewest steps' and 'least cost' are the same question — equal step costs — and this map never asked the first question.",
    },
    {
      id: "a-03-q3",
      prompt: "UCS's complexity is written O(b^(1+⌊C*/ε⌋)). What is the exponent really saying?",
      options: [
        {
          text: "The search may expand every state reachable within cost C*, and C*/ε bounds how long such a path can get",
          correct: true,
          feedback:
            "Correct — ε is the smallest step cost, so a path can take up to about C*/ε steps before its total cost reaches the optimum; the extra level is those states' successors. Small ε means near-free detours get chased very deep.",
        },
        {
          text: "Each expansion costs C*/ε heap operations",
          correct: false,
          feedback:
            "The exponent is about how many STATES the search can reach, not per-node work — an expansion is still a handful of heap pushes, each logarithmic in the frontier's size.",
        },
        {
          text: "It is the number of states UCS expanded on the Romania trace — thirteen",
          correct: false,
          feedback:
            "Thirteen is one run's count on one tiny map; the formula is the general worst-case shape in branching factor, optimum cost and cost floor.",
        },
        {
          text: "ε is the heuristic's error, as in A*",
          correct: false,
          feedback:
            "No heuristic appears in UCS — it is the h ≡ 0 case of A*. Here ε is the floor on step costs, the price of admission for UCS's completeness: costs bounded below by a positive constant.",
        },
      ],
      explanation:
        "The bound is the cost discipline's shadow: 'cheapest first' is only as deep as the cheapest paths, and C*/ε measures exactly how deep that can be.",
    },
  ],
};
