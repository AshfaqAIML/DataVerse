/**
 * PART A · MODULE 1 · CHAPTER "Uninformed Search" · LESSON a-04 —
 * "Depth-First and Iterative Deepening".
 *
 * Every `output` is the REAL output of running the code with python3
 * (scripts/verify-one-lesson.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_04: ClassicalLesson = {
  slug: "a-04",
  title: "Depth-First and Iterative Deepening",
  minutes: 30,
  summary:
    "DFS's tiny memory footprint, its failure modes, and the iterative trick that restores optimality.",
  kind: "coding",
  objectives: [
    "Explain the LIFO stack discipline and derive its O(b·m) memory bound — the current path plus the unexplored siblings",
    "Demonstrate DFS's two failure modes on the Romania map: a 607-km first goal where 418 exists, and a walk that never terminates",
    "Trace iterative deepening pass by pass with generation counters, and hand-compute the b = 10, d = 5 arithmetic",
    "State both goal-test conventions and their counts — 111,111 vs 1,111,111 for BFS, 123,456 for IDS — and why they differ",
    "Implement depth-limited DFS and IDS in Python, with and without a cycle guard",
  ],
  why: "Memory, not time, is what actually kills exhaustive search. A frontier is a commitment: at branching factor 10, a goal a dozen levels down commits breadth-first search to roughly a trillion generated states, and no machine holds a trillion of anything. Depth-first search survives depths like that on a megabyte, because it remembers only the road behind it — which is why it is the backbone of backtracking solvers, game-tree search and every recursive procedure that must go deep before it goes wide. But its answers cannot be trusted: the first goal it meets may be arbitrarily bad, and on a cyclic map it may meet no goal at all, ever. Iterative deepening is the classical repair — the same trick Richard Korf used in 1985 to build IDA*, which took heuristic search to fifteen-puzzle depths no frontier could hold — and the arithmetic of \"redoing the work\" is so counterintuitive that it deserves a lesson of its own: the entire repair costs about 11%.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Breadth-first search finds the shallowest goal and uniform-cost finds the cheapest, and both pay for the guarantee the same way: the frontier holds every state they have generated but not yet expanded, and that frontier grows like *b^d*. At branching factor 10 with the goal five levels down, that is a hundred-thousand-node frontier held in memory all at once; a dozen levels down it passes a trillion, and the search dies of memory before it dies of time. Depth-first search makes the opposite bet — remember only the path you are walking and the turns you have not yet taken. This lesson measures what that discipline buys (memory that grows with depth, not breadth), what it costs (the first goal found, at any depth — and sometimes no goal found, ever), and the trick that buys optimality back for an 11% premium: run the whole search over and over, one level deeper each time.",
    },

    // ------------------------------------------------------------ the stack discipline
    { kind: "heading", text: "The stack discipline" },
    {
      kind: "math",
      title: "What the stack must hold",
      displays: [
        { expr: "m + (b - 1) \\cdot m = b \\cdot m", label: "DFS in memory" },
        {
          expr: "b = 10, m = 5: \\quad \\text{DFS} \\le 50 \\text{ nodes} \\quad \\text{vs} \\quad \\text{BFS} \\approx 10^5 \\text{ nodes}",
          label: "the same tree",
        },
      ],
      caption:
        "The stack holds the spine — the m nodes of the current path — plus, at each level, the b − 1 siblings not yet taken: a rope with a bookmark at every fork. Add the pieces and the footprint is linear in depth, not exponential in breadth. The comparison line assumes the tree bottoms out at the goal depth (m = d = 5); when paths run deeper than the goal, DFS keeps paying only for the depth it actually walks, while BFS's frontier is fixed by d alone.",
    },
    {
      kind: "definition",
      term: "Depth-first search",
      informal:
        "Expand the deepest node on the frontier first: dive down one path until it dead-ends or generates a goal, back up one fork, dive again. The frontier is a stack — last generated, first expanded.",
      formal: "\\text{pop } n : \\text{depth}(n) = \\max_{k \\in F} \\text{depth}(k)",
      why: "The LIFO discipline is what keeps memory linear: nothing needs remembering except the way back up.",
    },
    {
      kind: "searchTree",
      title: "The first dive decides everything",
      legend:
        "g = km walked so far · the spine is DFS's current path · frontier = still in the stack when Bucharest is declared the goal",
      root: {
        id: "arad",
        label: "Arad",
        cost: 0,
        status: "root",
        children: [
          {
            id: "zerind",
            label: "Zerind",
            cost: 75,
            status: "expanded",
            edge: "75",
            children: [
              {
                id: "oradea",
                label: "Oradea",
                cost: 146,
                status: "expanded",
                edge: "71",
                children: [
                  {
                    id: "sibiu-deep",
                    label: "Sibiu",
                    cost: 297,
                    status: "expanded",
                    edge: "151",
                    children: [
                      {
                        id: "fagaras",
                        label: "Fagaras",
                        cost: 396,
                        status: "expanded",
                        edge: "99",
                        children: [
                          {
                            id: "bucharest",
                            label: "Bucharest",
                            cost: 607,
                            status: "goal",
                            edge: "211",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { id: "arad2", label: "Arad", cost: 150, status: "frontier", edge: "75" },
            ],
          },
          { id: "sibiu", label: "Sibiu", cost: 140, status: "frontier", edge: "140" },
          { id: "timisoara", label: "Timisoara", cost: 118, status: "frontier", edge: "118" },
        ],
      },
      caption:
        "Trace the dive: Arad's first neighbor is Zerind, Zerind's first is Oradea, Oradea's first is Sibiu, Sibiu's first is Fagaras, and Fagaras's first is Bucharest — five roads, 607 km, and the search stops the moment the goal is generated. The 140-km road to Sibiu is still sitting in the stack, never expanded, and it is the first step of both better answers: the three-road route through Fagaras (450 km) and the 418-km optimum through R. Vâlcea and Pitești. Note Arad reappearing as its own grandchild — in tree search, the map's cycles are paid for as duplicate nodes.",
    },
    {
      kind: "text",
      text: "Two things are wrong with the answer above, and neither is a bug you can patch — they are the algorithm. First, **it is not optimal, and cannot be made optimal**: DFS commits to the first dive, so the first goal it generates is whatever that dive happens to meet, at any depth at all. Here the dive returns 607 km where 418 exists; a different successor order or a deeper first branch could make the gap arbitrarily large. Second, **the dive might never end**. Reverse the problem — start at Bucharest, goal Arad — and the map's very first edge, Bucharest → Fagaras, leads straight back to Bucharest: the walk Bucharest → Fagaras → Bucharest → Fagaras → ⋯ repeats forever, and no backtracking ever rescues it, because no level is ever exhausted. The completeness condition, stated precisely: tree-search DFS terminates only when every path it can walk is finite — in practice, when the space has a known maximum depth m, or when you add a visited set and accept graph search. And m deserves its own caution: DFS's time bound O(b^m) is stated in the *maximum* path depth, which on a cyclic space is not a number you have.",
    },

    // ------------------------------------------------------------ the repair
    { kind: "heading", text: "The repair: iterative deepening" },
    {
      kind: "definition",
      term: "Iterative deepening search",
      informal:
        "Run depth-limited DFS with limit 0, then 1, then 2, and so on — each pass from scratch — until a pass finds a goal.",
      formal:
        "\\text{run } \\text{DLS}(s, l) \\text{ for } l = 0, 1, 2, \\dots \\text{ until a pass returns a path}",
      why: "Pass l finds any goal within depth l, so the first successful pass returns a shallowest goal — optimal whenever step costs are equal — while every pass holds only a DFS stack.",
    },
    {
      kind: "pseudocode",
      title: "Iterative deepening search",
      lines: [
        { text: "function IDS(start, goal)" },
        { text: "for limit ← 0, 1, 2, ...", indent: 1, tone: "key", note: "every pass restarts from an empty stack — reuse, never accumulate" },
        { text: "path ← DLS(start, goal, limit)", indent: 2 },
        { text: "if path ≠ CUTOFF then return path", indent: 2 },
        { text: "function DLS(node, goal, limit)" },
        { text: "if node = goal then return the path to node", indent: 1, tone: "key", note: "goal test at generation — the limit never hides a generated goal" },
        { text: "if limit = 0 then return CUTOFF", indent: 1, note: "the limit bites: deeper nodes exist but are not generated this pass" },
        { text: "for each (a, s') in SUCCESSORS(node)", indent: 1 },
        { text: "result ← DLS(s', goal, limit − 1)", indent: 2 },
        { text: "if result ≠ CUTOFF then return result", indent: 2 },
        { text: "return CUTOFF", indent: 1 },
      ],
      note: "Each pass costs O(b^l) time and O(b·l) space; summed over all passes the time is O(b^d) — BFS's exponential — while the space stays linear. The limit is also the cycle cure: no pass can follow a cycle past depth l, so IDS terminates on maps where plain DFS walks forever.",
    },
    {
      kind: "math",
      title: "The bill, both conventions",
      displays: [
        { expr: "\\text{BFS: } 1 + 10 + 10^2 + 10^3 + 10^4 + 10^5 = 111\\,111", label: "b = 10, d = 5" },
        { expr: "\\text{IDS pass } l: 1 + 10 + \\dots + 10^l", label: "per pass" },
        {
          expr: "\\text{IDS total: } 6 \\cdot 1 + 5 \\cdot 10 + 4 \\cdot 100 + 3 \\cdot 1000 + 2 \\cdot 10000 + 1 \\cdot 100000 = 123\\,456",
          label: "six passes",
        },
        {
          expr: "\\frac{123\\,456}{111\\,111} \\approx 1.111 \\text{ — an 11.1% premium for linear memory}",
          label: "the verdict",
        },
      ],
      caption:
        "Convention, stated plainly: a node counts when it is GENERATED, and the goal test happens at generation — both algorithms measured the same way, and the program below prints these numbers. Under the other convention (goal test at expansion), BFS must in the worst case generate one level deeper — 1 + 10 + ⋯ + 10^6 = 1,111,111 — which is the count AIMA rounds to ≈ 1,111,110 by not counting the start node. Depth 5's nodes appear in exactly one IDS pass; every shallower level is regenerated by each later pass — depth 0 six times, depth 1 five times, and so on down to the 100,000 nodes of depth 5, generated once.",
    },
    {
      kind: "pythonImpl",
      title: "DFS, IDS and the arithmetic, with counters",
      intent:
        "Both failure modes shown honestly, then the repair: per-pass generation counters on the Romania map (unit costs for the depth-limited runs), and the b = 10, d = 5 arithmetic computed rather than asserted.",
      code: `ROMANIA = {
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

# --- 1. plain tree-search DFS: LIFO stack, map order, no visited set -------

def dfs(start, goal, cap):
    stack, walked = [(start, [start])], []
    while stack and len(walked) < cap:
        city, path = stack.pop()
        walked.append(city)
        if city == goal:
            return walked, path
        for nxt, _km in reversed(ROMANIA[city]):  # reversed -> map order pops first
            stack.append((nxt, path + [nxt]))
    return walked, None

_, path = dfs("Arad", "Bucharest", cap=100)
km = sum(dict(ROMANIA[a])[b] for a, b in zip(path, path[1:]))
print("DFS from Arad:", " -> ".join(path))
print(f"first goal met: {len(path)-1} roads, {km} km (fewest roads: 3; fewest km: 418)")

walked, _ = dfs("Bucharest", "Arad", cap=10)
print("DFS from Bucharest, first 10 expansions:", " -> ".join(walked))

# --- 2. depth-limited DFS + iterative deepening (unit costs) ---------------
# A node is counted when it is GENERATED; the goal test happens right there.

def dls(city, goal, limit, count):
    count[0] += 1                    # generate this node...
    if city == goal:                 # ...and goal-test it immediately
        return [city]
    if limit == 0:
        return None                  # CUTOFF: the limit bites
    for nxt, _km in ROMANIA[city]:
        found = dls(nxt, goal, limit - 1, count)
        if found is not None:
            return [city] + found
    return None

def ids(start, goal):
    total, limit = 0, 0
    while True:
        count = [0]
        found = dls(start, goal, limit, count)
        total += count[0]
        print(f"limit {limit}: generated {count[0]}")
        if found is not None:
            return found, total
        limit += 1

print()
path, total = ids("Arad", "Bucharest")
print(f"total generated: {total}")
print(f"path ({len(path)-1} roads):", " -> ".join(path))

# --- 3. the b = 10, d = 5 arithmetic ----------------------------------------
# Uniform tree, shallowest goal at depth d; goal test at generation.

b, d = 10, 5
bfs_gen = sum(b**i for i in range(d + 1))            # 1 + 10 + ... + 10^5
ids_gen = sum(sum(b**i for i in range(l + 1)) for l in range(d + 1))
bfs_exp = sum(b**i for i in range(d + 2))            # goal test at expansion
print()
print(f"goal test at generation: BFS {bfs_gen}, IDS {ids_gen}, "
      f"overhead {(ids_gen - bfs_gen) / bfs_gen:.1%}")
print(f"goal test at expansion : BFS {bfs_exp} "
      f"(AIMA's ~{bfs_exp - 1} does not count the root)")`,
      output: `DFS from Arad: Arad -> Zerind -> Oradea -> Sibiu -> Fagaras -> Bucharest
first goal met: 5 roads, 607 km (fewest roads: 3; fewest km: 418)
DFS from Bucharest, first 10 expansions: Bucharest -> Fagaras -> Bucharest -> Fagaras -> Bucharest -> Fagaras -> Bucharest -> Fagaras -> Bucharest -> Fagaras

limit 0: generated 1
limit 1: generated 4
limit 2: generated 12
limit 3: generated 12
total generated: 29
path (3 roads): Arad -> Sibiu -> Fagaras -> Bucharest

goal test at generation: BFS 111111, IDS 123456, overhead 11.1%
goal test at expansion : BFS 1111111 (AIMA's ~1111110 does not count the root)`,
      walkthrough: [
        "`dfs` is deliberately unsafe: no depth limit, no visited set, a plain LIFO stack with `reversed` pushes so successors pop in map order. Its first call is the good-luck case — the first dive happens to reach Bucharest five roads and 607 km deep, and DFS stops at the first goal it generates, the 140-km Sibiu edge still unexpanded in the stack.",
        "Its second call is the bad-luck case, capped at 10 expansions so it terminates for us: from Bucharest the walk alternates Bucharest → Fagaras forever. Sibiu, Pitești and Giurgiu pile up in the stack, never popped — so Arad, reachable only through them, is never even generated.",
        "`dls` counts at GENERATION and goal-tests right there, matching the lesson's convention. Pass 2 generates 12 nodes because tree search pays the cycle tax — Arad is generated three separate times at depth 2 alone.",
        "The passes run 1, 4, 12, 12 — 29 generations for a 3-road path. Unit costs matter: the returned route is optimal in roads (450 km), not in km, where the 418-km optimum needs four. Optimality is always relative to the cost function.",
        "The last two lines compute the uniform-tree arithmetic instead of asserting it — 111,111 vs 123,456, an 11.1% premium — plus the expansion-convention BFS figure 1,111,111, one more than AIMA's ≈ 1,111,110 because AIMA does not count the start node.",
      ],
      project:
        "The stack discipline and the IDS driver here are direct building blocks for the Part A project's uninformed-search implementations.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "IDS looks wasteful but isn't",
      text: "Regenerating levels 0 through l − 1 on every pass feels like throwing most of the work away — until you ask where the nodes actually live. In any branching process the deepest level holds almost all of them: at b = 10, depths 0–4 together hold 11,111 nodes while depth 5 alone holds 100,000. IDS generates the shallow nodes roughly twice over (23,456 generations across all six passes) and the expensive last level exactly once — a premium of 12,345 nodes, or 11.1%. As d grows the ratio settles at b/(b − 1): about 11% at b = 10, 2% at b = 50. If your instinct insists the repetition should hurt more, the geometric series is the habit to build.",
    },
    {
      kind: "complexity",
      title: "The uninformed family, honestly measured",
      reading:
        "Read the space column — it is the whole lesson: DFS and IDS hold a path, BFS and UCS hold a horizon, and the time column barely separates them. (m is the deepest path the search can walk — infinite on a cyclic map without a limit or a visited set; the best-case entries assume the first branch is a beeline to the goal.)",
      rows: [
        { algorithm: "Breadth-first", best: "O(b^d)", average: "O(b^d)", worst: "O(b^d)", space: "O(b^d)", note: "optimal only at equal step costs" },
        { algorithm: "Uniform-cost", best: "O(b^d)", average: "O(b^(1+⌊C*/ε⌋))", worst: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))", note: "optimal at any positive costs" },
        { algorithm: "Depth-first", best: "O(m)", average: "O(b^m)", worst: "O(b^m)", space: "O(bm)", highlight: true, note: "not optimal; can loop forever" },
        { algorithm: "Iterative deepening", best: "O(d^2)", average: "O(b^d)", worst: "O(b^d)", space: "O(bd)", highlight: true, note: "optimal at equal costs; the depth-first memory trick" },
      ],
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-04-e1",
      exerciseKind: "concept-check",
      prompt:
        "The program's IDS run returns Arad → Sibiu → Fagaras → Bucharest — three roads, 450 km — while A*, later in this part, returns the 418-km route through R. Vâlcea and Pitești. A colleague concludes: \"IDS found a worse route, so IDS is not optimal.\" What is the honest correction?",
      options: [
        {
          text: "The colleague is right — IDS is only near-optimal, and the 36 km is the gap",
          correct: false,
          feedback:
            "IDS is exactly optimal in the cost function it was given. This run charged 1 per road, and no route from Arad to Bucharest uses fewer than three roads.",
        },
        {
          text: "IDS ran with unit step costs, so its guarantee is about roads: three is provably fewest. Optimality is always relative to a cost function — in kilometres, the 418-km four-road route wins, and that is the answer UCS or A* would return",
          correct: true,
          feedback:
            "Correct — 450 km is the price of the fewest-roads optimum; 418 km buys the fewest-km optimum. Same map, two honest optima under two cost functions. (This is also the same route greedy best-first will chase later in the part — but IDS earns it: fewest steps, not smallest h.)",
        },
        {
          text: "The depth limit cut the search short before the 418-km route could be generated",
          correct: false,
          feedback:
            "The limit caps how deep each pass dives, not which routes count: the final pass explored every path of three roads or fewer. The 418-km route needs four roads — no unit-cost search that has found a three-road path would ever prefer it.",
        },
        {
          text: "IDS is optimal only when the branching factor is small, and Romania's is too big",
          correct: false,
          feedback:
            "b affects the work, never the guarantee: the first successful pass finds a shallowest goal however wide the tree is.",
        },
      ],
      solution:
        "IDS is optimal — in roads. The run charged unit costs, so its guarantee is 'fewest steps', and no Arad → Bucharest route beats three roads. In kilometres the 418-km four-road route is the optimum, and a km-cost search (UCS, A*) returns it. Optimality is always relative to the cost function.",
      explanation:
        "When someone says 'optimal', the follow-up question is always 'with respect to what?'. IDS at unit costs and A* at kilometre costs are both optimal here — they are simply answering different questions about the same map.",
      concepts: ["iterative deepening", "optimality conditions"],
    },
    {
      kind: "exercise",
      id: "a-04-e2",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: in the lesson's program, how many nodes does the ids(\"Arad\", \"Bucharest\") run generate in its limit-2 pass? (Same conventions as the code: unit costs, goal test at generation, successors in map order, no visited set.)",
      expectedOutput: "12",
      solution: "12",
      explanation:
        "Count by depth. Depth 0: Arad (1). Depth 1: Zerind, Sibiu, Timisoara (3 more — total 4). Depth 2: under Zerind, Oradea and a revisited Arad; under Sibiu, Fagaras, R. Vâlcea, a revisited Arad and a revisited Oradea; under Timisoara, Lugoj and a revisited Arad (8 more). Total 1 + 3 + 8 = 12 — and three of those twelve are Arad regenerating itself: the cycle tax of tree search, paid even at depth 2.",
      concepts: ["depth-limited search", "tree search"],
    },
    {
      kind: "exercise",
      id: "a-04-e3",
      exerciseKind: "write-code",
      prompt:
        "Make IDS graph-aware: modify dls so that a neighbor already on the CURRENT PATH is skipped (pass the path down; do not even generate the skip). Keep the goal test at generation and the map order. Which per-pass counts change, and what total do you get? Careful: a visited list shared across a whole pass is a different, subtly unsafe algorithm — a state marked visited during a deep excursion can hide the shallowest goal. Guard the path only.",
      starter: `# ROMANIA = {...} -- copy the map verbatim from the lesson's program above

def dls(city, goal, limit, path, count):
    count[0] += 1
    if city == goal:
        return path
    if limit == 0:
        return None
    for nxt, _km in ROMANIA[city]:
        # TODO: skip nxt when it already lies on the current path
        found = dls(nxt, goal, limit - 1, path + [nxt], count)
        if found is not None:
            return found
    return None

def ids(start, goal):
    total, limit = 0, 0
    while True:
        count = [0]
        found = dls(start, goal, limit, [start], count)
        total += count[0]
        print(f"limit {limit}: generated {count[0]}")
        if found is not None:
            return found, total
        limit += 1

path, total = ids("Arad", "Bucharest")
print(f"total generated: {total}")
print(f"path ({len(path)-1} roads):", " -> ".join(path))`,
      solution: `ROMANIA = {
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

def dls(city, goal, limit, path, count):
    count[0] += 1
    if city == goal:
        return path
    if limit == 0:
        return None
    for nxt, _km in ROMANIA[city]:
        if nxt in path:              # cycle guard: never leave the current path
            continue
        found = dls(nxt, goal, limit - 1, path + [nxt], count)
        if found is not None:
            return found
    return None

def ids(start, goal):
    total, limit = 0, 0
    while True:
        count = [0]
        found = dls(start, goal, limit, [start], count)
        total += count[0]
        print(f"limit {limit}: generated {count[0]}")
        if found is not None:
            return found, total
        limit += 1

path, total = ids("Arad", "Bucharest")
print(f"total generated: {total}")
print(f"path ({len(path)-1} roads):", " -> ".join(path))`,
      expectedOutput: `limit 0: generated 1
limit 1: generated 4
limit 2: generated 9
limit 3: generated 7
total generated: 21
path (3 roads): Arad -> Sibiu -> Fagaras -> Bucharest`,
      explanation:
        "The counts become 1, 4, 9, 7 — total 21 instead of 29. The guard removes exactly the regenerations of cities already on the path: at limit 2 the three extra Arads vanish (12 → 9); at limit 3 the whole Arad replay under Zerind and the Zerind replay under Oradea vanish (12 → 7). Sibling-branch rediscovery remains — Oradea is still generated under both Zerind and Sibiu — because a path guard forbids cycles, not crossroads. And that is the safe choice: guarding the path keeps each pass a faithful tree search minus cycles, so the shallowest-first guarantee survives; a per-pass global visited list can mark a state via a deep excursion and never notice the shallow route through it.",
      concepts: ["iterative deepening", "cycle detection", "graph search"],
    },
  ],
  terms: [
    {
      term: "space complexity",
      definition:
        "How an algorithm's memory requirement grows with the size of its work — for search, with b, d and m. The uninformed ledger: BFS and UCS are O(b^d) in space; DFS is O(b·m); IDS is O(b·d).",
    },
    {
      term: "depth-limited search",
      definition:
        "DFS with a cap l: nodes at depth l are generated but not expanded. Returns a solution within the cap, or CUTOFF — the component IDS runs over ascending caps.",
    },
    {
      term: "cutoff",
      definition:
        "The value a depth-limited pass returns when the limit bites before any goal is found: \"nothing within depth l\". IDS reads it as the instruction to raise the limit by one.",
    },
    {
      term: "regeneration",
      definition:
        "IDS's habit of re-generating the shallow levels on every pass. Harmless in a geometric series — the deepest level dominates — so the premium tends to b/(b − 1): about 11% at b = 10.",
    },
  ],
  mistakes: [
    {
      mistake: "Running tree-search DFS on a cyclic state space with no depth limit and no visited set.",
      why: "The first dive can cycle forever — Bucharest → Fagaras → Bucharest — and no backtracking rescues it, because no level is ever exhausted.",
      fix: "Cap the depth (a limit bounds every pass) or carry a visited set and accept graph search. IDS gets the first protection for free: its limit is the cycle cure.",
    },
    {
      mistake: "Trusting DFS's first-found path because 'it found a solution'.",
      why: "DFS returns the first goal its first dive generates, at any depth — 607 km on a map whose optimum is 418. The guarantee you did not ask for is the one you did not get.",
      fix: "If path quality matters, switch to BFS, UCS or IDS; keep DFS for when any solution will do, or memory is the binding constraint.",
    },
    {
      mistake: "Dismissing IDS because it 'repeats all its work'.",
      why: "The intuition weighs passes, not nodes: six passes sound like six times the work, but the deepest level — nearly all the nodes — is generated exactly once.",
      fix: "Compute before judging: 1 + 10 + ⋯ + 10^5 = 111,111 for BFS against 123,456 for IDS. The geometric series is the whole defense.",
    },
    {
      mistake: "Comparing node counts taken under different goal-test conventions.",
      why: "Testing at generation or at expansion changes BFS's count by a factor of b — 111,111 versus 1,111,111 — and AIMA's ≈ 1,111,110 additionally skips the start node.",
      fix: "State the convention with the number, as the lesson's program does: every count here is generation-time, start node included.",
    },
  ],
  takeaways: [
    "DFS's frontier is a stack: the current path plus each level's unexplored siblings — O(b·m) memory, linear in depth. That footprint is the reason DFS exists.",
    "DFS returns the first goal its first dive meets, at any depth — 607 km where 418 exists — and on a cyclic map without a limit or a visited set it may never stop walking.",
    "Iterative deepening runs depth-limited DFS with limits 0, 1, 2, ⋯: the first successful pass finds a shallowest goal, so it is optimal whenever step costs are equal — with O(b·d) memory.",
    "The depth limit is also the cycle cure: no IDS pass can follow a cycle past depth l, which is why IDS terminates where plain DFS loops.",
    "Node counts are convention-dependent — 111,111 (generation test) versus 1,111,111 (expansion test) for the same BFS problem. State the convention, or the comparison lies.",
  ],
  quiz: [
    {
      id: "a-04-q1",
      prompt:
        "At b = 10, d = 5 with the goal test at generation, IDS generates 123,456 nodes to BFS's 111,111 — six passes' worth of re-done shallower levels, yet only 11.1% more work. Why so cheap?",
      options: [
        {
          text: "Each pass remembers the frontier of the pass before, so shallow levels are expanded once",
          correct: false,
          feedback:
            "Nothing is remembered between passes — starting each pass from an empty stack is the entire memory saving. Every pass regenerates from the start.",
        },
        {
          text: "The deepest level holds almost all the nodes, and it is generated exactly once",
          correct: true,
          feedback:
            "Correct — depth 5 alone contributes 100,000 of the 123,456 nodes and appears only in the final pass; all the shallow levels together cost 23,456 even regenerated up to six times over.",
        },
        {
          text: "The stack makes each pass cheaper than a queue would be",
          correct: false,
          feedback:
            "Per node, stack and queue cost the same. Pass 5 alone generates 111,111 nodes — exactly BFS's total. The stack saves memory, not generation count.",
        },
        {
          text: "IDS goal-tests at generation while BFS goal-tests at expansion",
          correct: false,
          feedback:
            "Both sides of this comparison use the same convention — that is why 111,111 is the benchmark. Under the expansion test BFS's figure becomes 1,111,111, which would flatter IDS; the honest comparison pins the conventions equal.",
        },
      ],
      explanation:
        "This is the arithmetic of exponentials: in a geometric series the last term dwarfs the sum of all earlier ones, so paying twice for the cheap part and once for the expensive part is nearly free.",
    },
    {
      id: "a-04-q2",
      prompt:
        "Plain tree-search DFS starts at Bucharest with goal Arad on this map, successors in map order, no visited set, no depth limit. What happens?",
      options: [
        {
          text: "It backtracks out of the Bucharest–Fagaras cycle and finds Arad eventually",
          correct: false,
          feedback:
            "Backtracking needs an exhausted level, but every expansion pushes fresh successors — the search never revisits a decision; it re-walks the same two cities forever.",
        },
        {
          text: "It walks Bucharest → Fagaras → Bucharest → Fagaras → ⋯ forever; Arad is never even generated",
          correct: true,
          feedback:
            "Correct — Bucharest's first neighbor is Fagaras and Fagaras's first neighbor is Bucharest. Sibiu, Pitești and Giurgiu pile up in the stack, never popped, and Arad sits behind them, never generated. The program's capped run shows exactly this alternation.",
        },
        {
          text: "It errors out — which is how you notice the cycle",
          correct: false,
          feedback:
            "The lesson's explicit-stack version would walk forever. A recursive version eventually hits the interpreter's recursion limit, but that is an implementation accident, not termination — give it more stack room and the same two cities repeat.",
        },
        {
          text: "It finds Arad by a suboptimal route — DFS's usual sin, nothing worse",
          correct: false,
          feedback:
            "That is the OTHER failure mode (the 607-km first goal from Arad). Non-optimality and non-termination are independent — here the search never gets far enough to be suboptimal.",
        },
      ],
      explanation:
        "DFS's completeness condition, stated precisely: every path it can walk must be finite. On a cyclic space that means a depth limit or a visited set — otherwise the first dive can be infinite.",
    },
    {
      id: "a-04-q3",
      prompt:
        "A puzzle search has b ≈ 3, every move costs 1, the shortest solution is d = 14 moves deep, and your machine can hold about 10,000 search nodes. You need a shortest solution. Which uninformed algorithm do you reach for?",
      options: [
        {
          text: "Breadth-first search — shallowest goal is exactly 'shortest'",
          correct: false,
          feedback:
            "Right idea, wrong memory: BFS's frontier peaks near 3^14 ≈ 4.8 million nodes — nearly 500× the budget. An optimality guarantee that does not fit in RAM returns nothing at all.",
        },
        {
          text: "Depth-first search — its stack fits comfortably",
          correct: false,
          feedback:
            "The O(b·m) stack fits, but DFS returns the first goal its first dive meets, at any depth. 'Shortest' is precisely the guarantee it cannot make.",
        },
        {
          text: "Iterative deepening — optimal at equal step costs, with a stack that peaks near b·d ≈ 42 nodes",
          correct: true,
          feedback:
            "Correct — IDS keeps BFS's shallowest-first guarantee while holding only a path's worth of memory: about 3 × 14 nodes plus siblings, orders of magnitude inside the budget, for roughly 11% extra generation.",
        },
        {
          text: "Uniform-cost search — optimal at any positive costs, so certainly here",
          correct: false,
          feedback:
            "Optimal, yes — but at unit costs UCS explores level by level exactly like BFS, frontier and all. The guarantee is the same, and so is the memory wall.",
        },
      ],
      explanation:
        "When memory binds and costs are equal, IDS is the uninformed default: BFS's guarantee at DFS's price. The same depth-first instinct, upgraded with a heuristic, is how IDA* later answers A*'s memory wall.",
    },
  ],
};
