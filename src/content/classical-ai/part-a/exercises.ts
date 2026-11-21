/**
 * PART_A_EXERCISES — the tiered practice battery for Part A (8 exercises:
 * 3 basic, 3 intermediate, 2 advanced), spanning all three modules:
 * formulation and uninformed search (module 1), heuristic search and A*
 * (module 2), local search (module 3). a-b1, a-i1, a-i2, a-a1 are the
 * original delivery's items (a-b1's starter carried a `parent] = n` typo,
 * fixed here; every other byte kept verbatim); a-b2, a-b3, a-i3, a-a2 were
 * added at full registry depth. Seven of the eight are auto-gradable —
 * every expectedOutput below is the REAL stdout of running the code
 * (verified by scripts/verify-classical-outputs.ts).
 */
import type { Exercise } from "@/lib/course/types";

export const PART_A_EXERCISES: Exercise[] = [
  {
    id: "a-b1",
    tier: "beginner",
    title: "Trace BFS on a small graph",
    prompt:
      "Run the printed program. It performs breadth-first search from A to E on the graph A→{B,C}, B→D, C→{D,E}. Predict its exact output BEFORE running — the path BFS reports, reconstructed through the parent chain.",
    hint: "BFS assigns parents level by level: A first, then B and C, then D and E. E's parent is whichever of C was processed first.",
    starter: `from collections import deque

G = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": [], "E": []}
start, goal = "A", "E"
parent = {start: None}
q = deque([start])
while q:
    n = q.popleft()
    if n == goal:
        break
    for m in G[n]:
        if m not in parent:
            parent[m] = n
            q.append(m)
path = []
while n is not None:
    path.append(n)
    n = parent[n]
print("path:", " -> ".join(reversed(path)))`,
    expectedOutput: "path: A -> C -> E",
    solution: `path: A -> C -> E

# The parent chain: E's parent is C (C processed before D because B and C
# enter the queue in adjacency order, and C's own children D and E follow).
# Level by level: A | B, C | D, E. Reconstruct: E <- C <- A.`,
    concepts: ["breadth-first search", "parent chain"],
  },
  {
    id: "a-b2",
    tier: "beginner",
    title: "Uniform-cost search restores optimality",
    prompt:
      "BFS on this weighted graph returns the 2-edge path S→A→C… no wait — BFS does not even run here honestly: with costs on the edges, shallowest is not cheapest. Implement uniform-cost search from S to G. Your program must print exactly `cost: <total> via <path>` — the check runs your code and compares.",
    hint: "A priority frontier ordered by g, a best-g ledger, and the goal test at the POP (not at generation). The optimum is a sum of five edges; let the search tell you.",
    starter: `import heapq

G = {"S": [("A", 1), ("B", 4)], "A": [("B", 2), ("C", 5)],
     "B": [("C", 1)], "C": [("G", 3)], "G": []}

def ucs(start, goal):
    # TODO: priority frontier ordered by path cost g, best-g ledger,
    # goal test at the pop, parent chain for path reconstruction.
    # Return (cost, path).
    ...

cost, path = ucs("S", "G")
print(f"cost: {cost} via {' -> '.join(path)}")`,
    expectedOutput: "cost: 7 via S -> A -> B -> C -> G",
    solution: `import heapq

G = {"S": [("A", 1), ("B", 4)], "A": [("B", 2), ("C", 5)],
     "B": [("C", 1)], "C": [("G", 3)], "G": []}

def ucs(start, goal):
    pq, best, parent = [(0, start)], {start: 0}, {start: None}
    while pq:
        cost, n = heapq.heappop(pq)
        if n == goal:
            path = []
            while n is not None:
                path.append(n); n = parent[n]
            return cost, path[::-1]
        if cost > best.get(n, 99):
            continue
        for m, w in G[n]:
            c2 = cost + w
            if c2 < best.get(m, 99):
                best[m] = c2; parent[m] = n
                heapq.heappush(pq, (c2, m))

cost, path = ucs("S", "G")
print(f"cost: {cost} via {' -> '.join(path)}")
# cost: 7 via S -> A -> B -> C -> G — the cheapest route buys the
# A->B shortcut (2) instead of the direct S->B (4) or S->A->C (1+5):
# 1 + 2 + 1 + 3 = 7 beats 1 + 5 + 3 = 9 and 4 + 1 + 3 = 8.`,
    concepts: ["uniform-cost search", "priority frontier", "optimality"],
  },
  {
    id: "a-b3",
    tier: "beginner",
    title: "The IDS arithmetic, pass by pass",
    prompt:
      "Without running it: the program below computes iterative deepening's node counts for b = 3, solution at depth d = 2 (worst case: the goal is the last node of the last pass), goal test at generation. Predict all four printed lines BEFORE running — the check compares your code's real stdout.",
    hint: "Pass l regenerates every level up to l: 1, then 1+3, then 1+3+9. The total sums the passes — and the last line compares it against what BFS alone would touch.",
    starter: `b, d = 3, 2        # branching 3, solution at depth 2 (worst case)

def nodes_to(limit):
    total, level = 0, 1
    for _ in range(limit + 1):
        total += level
        level *= b
    return total

for lim in range(d + 1):
    print(f"pass {lim}: {nodes_to(lim)}")
print(f"IDS total: {sum(nodes_to(l) for l in range(d + 1))}  (BFS alone: {nodes_to(d)})")`,
    expectedOutput: `pass 0: 1
pass 1: 4
pass 2: 13
IDS total: 18  (BFS alone: 13)`,
    solution: `pass 0: 1
pass 1: 4
pass 2: 13
IDS total: 18  (BFS alone: 13)

# The same arithmetic that a-04 ran at b=10, d=5 — where six passes
# regenerate shallow levels for a 11.1% premium (123,456 against BFS's
# 111,111). Here the premium is 5/13 = 38%: at tiny branching the
# regenerated levels are a larger share of the total. As b grows the
# deepest level swallows everything and the premium shrinks toward
# b/(b-1) - 1.`,
    concepts: ["iterative deepening", "geometric series", "node counting"],
  },
  {
    id: "a-i1",
    tier: "intermediate",
    title: "Implement A* on a weighted graph",
    prompt:
      "Implement A* over the given graph and heuristic. The graph: S→A(2), S→B(5), A→C(4), A→D(7), B→D(2), C→G(3), D→G(1); heuristic h: S=6, A=4, B=3, C=3, D=1, G=0. Your program must print exactly `cost: <optimal>` — the check runs your code and compares.",
    hint: "A priority frontier ordered by f = g + h, a best-g ledger, and a goal test at the POP. The optimum here is one of 8, 9 or 10 — let the search tell you.",
    starter: `from heapq import heappush, heappop

G = {"S": [("A", 2), ("B", 5)], "A": [("C", 4), ("D", 7)], "B": [("D", 2)],
     "C": [("G", 3)], "D": [("G", 1)], "G": []}
H = {"S": 6, "A": 4, "B": 3, "C": 3, "D": 1, "G": 0}

def a_star(start, goal):
    # TODO: priority frontier ordered by f = g + h,
    # best-g ledger, goal test at the pop.
    # Return the optimal cost.
    ...

print("cost:", a_star("S", "G"))`,
    expectedOutput: "cost: 8",
    solution: `from heapq import heappush, heappop

G = {"S": [("A", 2), ("B", 5)], "A": [("C", 4), ("D", 7)], "B": [("D", 2)],
     "C": [("G", 3)], "D": [("G", 1)], "G": []}
H = {"S": 6, "A": 4, "B": 3, "C": 3, "D": 1, "G": 0}

def a_star(start, goal):
    pq, best = [(H[start], 0, start)], {start: 0}
    while pq:
        f, c, n = heappop(pq)
        if n == goal:
            return c
        for m, w in G[n]:
            c2 = c + w
            if c2 < best.get(m, 99):
                best[m] = c2
                heappush(pq, (c2 + H[m], c2, m))

print("cost:", a_star("S", "G"))
# Optimal path: S -> B -> D -> G = 5 + 2 + 1 = 8, beating the
# plausible-looking S -> A -> C -> G = 2 + 4 + 3 = 9. A*'s h values
# keep the B lane alive long enough to win.`,
    concepts: ["A*", "priority frontier", "admissible heuristic"],
  },
  {
    id: "a-i2",
    tier: "intermediate",
    title: "Audit two heuristics",
    prompt:
      "The eight-puzzle, states described by tile positions. Candidate heuristics: (h1) the number of misplaced tiles; (h2) the sum over tiles of |row-difference| + |column-difference| from its home (Manhattan); (h3) the number of misplaced tiles TIMES THREE. For each of h1, h2, h3: is it admissible? Does it dominate the others? Answer in three bullet points, each ending in a verdict.",
    hint:
      "Admissible = never overestimates. Each tile needs at least its Manhattan distance in moves. Multiplying an admissible heuristic by 3 does what to the bound?",
    solution: `• h1 (misplaced tiles): admissible — every misplaced tile needs at least one move, so h1 ≤ h*.
• h2 (Manhattan): admissible — each tile needs at least its own |Δrow|+|Δcol|, and the sum of independent lower bounds is a lower bound; h2 dominates h1 (a misplaced tile has Manhattan distance ≥ 1).
• h3 (3 × misplaced): NOT admissible in general — tripling overestimates whenever the true remaining moves are fewer than 3 × misplaced (trivially so for one misplaced tile one move from home: h3 = 3 > 1 = h*). It dominates h1 numerically but surrenders A*'s guarantee.`,
    concepts: ["admissibility", "dominance", "relaxation"],
  },
  {
    id: "a-i3",
    tier: "intermediate",
    title: "Watch A* choose: the expansion order",
    prompt:
      "Same graph and heuristic as a-i1. Now instrument A* to print every expansion as `expand <node> f=<value>` (skip stale heap entries — those whose popped g exceeds the ledger's best g), then `goal G: cost <g>` when G is popped. Before running: which node does A* never expand, and why? The check runs your code and compares its stdout.",
    hint:
      "S pops first (f=6), then A (f=6). The B lane's f=8 competes with C and D — trace the heap. The never-expanded node is the one whose f never reaches the top before the goal pops.",
    starter: `from heapq import heappush, heappop

G = {"S": [("A", 2), ("B", 5)], "A": [("C", 4), ("D", 7)], "B": [("D", 2)],
     "C": [("G", 3)], "D": [("G", 1)], "G": []}
H = {"S": 6, "A": 4, "B": 3, "C": 3, "D": 1, "G": 0}

pq, best = [(H["S"], 0, "S")], {"S": 0}
expanded = []
while pq:
    # TODO: pop, skip stale entries, record (node, f),
    # stop at G, relax neighbors by f = g + h.
    ...

for n, f in expanded:
    print(f"expand {n} f={f}")
print(f"goal G: cost {best['G']}")`,
    expectedOutput: `expand S f=6
expand A f=6
expand B f=8
expand D f=8
expand G f=8
goal G: cost 8`,
    solution: `from heapq import heappush, heappop

G = {"S": [("A", 2), ("B", 5)], "A": [("C", 4), ("D", 7)], "B": [("D", 2)],
     "C": [("G", 3)], "D": [("G", 1)], "G": []}
H = {"S": 6, "A": 4, "B": 3, "C": 3, "D": 1, "G": 0}

pq, best = [(H["S"], 0, "S")], {"S": 0}
expanded = []
while pq:
    f, g, n = heappop(pq)
    if g > best.get(n, 99):
        continue                      # stale entry
    expanded.append((n, f))
    if n == "G":
        break
    for m, w in G[n]:
        g2 = g + w
        if g2 < best.get(m, 99):
            best[m] = g2
            heappush(pq, (g2 + H[m], g2, m))

for n, f in expanded:
    print(f"expand {n} f={f}")
print(f"goal G: cost {best['G']}")
# C is never expanded: when B pops (f=8), D improves to f=8, and G pops
# at f=8 before C's f=9 ever reaches the top. A* paid for the knowledge:
# the S->A->C lane looked like the winner after A popped (g=2 is cheap),
# but f = g + h correctly kept it behind the B lane all along.`,
    concepts: ["A*", "expansion order", "stale entries"],
  },
  {
    id: "a-a1",
    tier: "advanced",
    title: "Compute the effective branching factor",
    prompt:
      "Your A* expanded N = 52 nodes to solve an eight-puzzle instance at solution depth d = 5. Compute the effective branching factor b*: the unique b > 1 satisfying 1 + b + b² + … + b^d = N + 1 (nodes generated, counting the root's expansion). Print `b* ~ <value to 3 decimals>` — your program is checked against the real computation.",
    hint: "Solve 1 + b + … + b^d = N + 1 by bisection or Newton; verify by summing the series with your answer.",
    starter: `N, d = 52, 5
# TODO: find b > 1 with 1 + b + ... + b**d == N + 1
# print(f"b* ~ {b:.3f}")`,
    expectedOutput: "b* ~ 1.917\ncheck: 53.0",
    solution: `N, d = 52, 5
lo, hi = 1.0, 3.0
for _ in range(80):
    b = (lo + hi) / 2
    total = sum(b**i for i in range(d + 1))
    if total < N + 1:
        lo = b
    else:
        hi = b
b = (lo + hi) / 2
print(f"b* ~ {b:.3f}")
# check: the series sums back to N+1 = 53 generated nodes
print("check:", round(sum(b**i for i in range(d + 1)), 1))`,
    concepts: ["effective branching factor", "benchmarking", "informedness"],
  },
  {
    id: "a-a2",
    tier: "advanced",
    title: "First-choice hill climbing, measured",
    prompt:
      "a-09's steepest-ascent hill climb solved 13 of 100 seeded 8-queens starts (stuck: 87). Implement FIRST-CHOICE hill climbing — at each state, sample random neighbors (one queen, any row) until one improves the objective, move there immediately — and run it over 100 pinned starts (seed 7), printing the same three lines: solved, stuck, and total neighbor evaluations. Before running: will first-choice beat 13? The check runs your code and compares its stdout.",
    hint:
      "Same landscape, different walk: steepest-ascent surveys all 56 neighbors and commits to the best; first-choice commits to the first improvement it stumbles on. Neither can leave a local optimum — measure what actually happens.",
    starter: `import random

def attacks(board):
    # TODO: count attacking pairs (same row or same diagonal)
    ...

def first_choice(board, rng, max_steps=10_000):
    # TODO: sample random single-queen moves until one improves h,
    # move there; return (board, h, evaluations) when h == 0 or
    # no improving neighbor is found in a full sampling round.
    ...

rng = random.Random(7)
starts = [tuple(rng.randrange(8) for _ in range(8)) for _ in range(100)]
solved = stuck = evals = 0
for s in starts:
    _, h, e = first_choice(s, rng)
    evals += e
    if h == 0:
        solved += 1
    else:
        stuck += 1
print("first-choice hill climbing, 100 seeded starts")
print(f"solved (h = 0): {solved}")
print(f"stuck  (h > 0): {stuck}")
print(f"neighbor evaluations: {evals}")`,
    expectedOutput: `first-choice hill climbing, 100 seeded starts
solved (h = 0): 5
stuck  (h > 0): 95
neighbor evaluations: 7965`,
    solution: `import random

def attacks(board):
    n = len(board)
    h = 0
    for c1 in range(n):
        for c2 in range(c1 + 1, n):
            if board[c1] == board[c2] or abs(board[c1] - board[c2]) == c2 - c1:
                h += 1
    return h

def first_choice(board, rng, max_steps=10_000):
    current = list(board)
    h = attacks(current)
    evaluations = 0
    for _ in range(max_steps):
        if h == 0:
            return current, 0, evaluations
        improved = None
        for _ in range(56):            # try up to 56 random neighbors
            col = rng.randrange(8)
            row = rng.randrange(8)
            if row == current[col]:
                continue
            cand = list(current)
            cand[col] = row
            evaluations += 1
            hc = attacks(cand)
            if hc < h:
                improved = (cand, hc)
                break
        if improved is None:
            return current, h, evaluations
        current, h = improved
    return current, h, evaluations

rng = random.Random(7)
starts = [tuple(rng.randrange(8) for _ in range(8)) for _ in range(100)]
solved = stuck = evals = 0
for s in starts:
    _, h, e = first_choice(s, rng)
    evals += e
    if h == 0:
        solved += 1
    else:
        stuck += 1
print("first-choice hill climbing, 100 seeded starts")
print(f"solved (h = 0): {solved}")
print(f"stuck  (h > 0): {stuck}")
print(f"neighbor evaluations: {evals}")
# 5 solved against steepest-ascent's 13 on the same seed family: first-
# choice takes the FIRST improving neighbor, not the best, so its walks
# wander into poorer local optima more often on these starts. The honest
# lesson (AIMA's too): first-choice changes the walk and the evaluation
# count (7,965 cheap samples), not the trap structure — 95 starts still
# end stuck, which is why a-10 reaches for annealing.`,
    concepts: ["first-choice hill climbing", "local optima", "measurement"],
  },
];
