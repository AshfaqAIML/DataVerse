/**
 * PART A · MODULE 2 · "Heuristic Search" — lesson a-05, "Heuristic Functions".
 *
 * The lesson that precedes A*: what a heuristic may promise (admissibility,
 * consistency), how honest ones are manufactured (relaxation), and how their
 * worth is measured (dominance, effective branching factor).
 *
 * Every `output` is the REAL output of running the code
 * (scripts/verify-classical-outputs.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_05: ClassicalLesson = {
  slug: "a-05",
  title: "Heuristic Functions",
  minutes: 30,
  summary:
    "What a heuristic may promise and may not: relaxation, admissibility, and the misplaced-tiles and Manhattan heuristics.",
  kind: "concept",
  objectives: [
    "State the admissibility inequality precisely and explain why it is the license — not the engine — of optimal informed search",
    "Distinguish consistency from admissibility and carry out the telescoping proof that consistency implies admissibility",
    "Derive the misplaced-tiles and Manhattan heuristics as exact optima of relaxed 8-puzzles, and compute both on a concrete board",
    "Apply the dominance order to compare admissible heuristics, including why Manhattan dominates misplaced tiles",
    "Compute and interpret the effective branching factor, and run a seeded experiment measuring three engines on real instances",
  ],
  why: "An informed search is only as honest as the number you feed it. Uniform-cost search will find the cheapest answer — after expanding every state cheaper than it; on this lesson's own benchmark board that costs 48,390 expansions for a solution 20 moves deep, and no map app can afford it. The way out is domain knowledge compressed into one number per state — but a heuristic that ever overestimates silently voids the optimality guarantee: no exception is thrown, the answers just get worse. This lesson is the audit and the factory: what a heuristic may promise (admissibility, consistency), how to manufacture provably honest ones at scale (relaxation — how the 8-puzzle's two classic heuristics are derived rather than quoted), and how to measure what a heuristic is worth (dominance and the effective branching factor). These are the skills that make the A* lesson's guarantees real — and the ones an interviewer probes with \"is this heuristic admissible?\"",
  blocks: [
    // ------------------------------------------------------------ the promise
    {
      kind: "text",
      text: "Uniform-cost search is honest but indifferent: it expands every state cheaper than the answer, and on this lesson's benchmark board that costs 48,390 expansions for a solution 20 moves deep. The cure is not a cleverer algorithm — it is a number. A **heuristic** *h(n)* estimates the cost still to go from state *n* to the goal, and it is the single place where knowledge about the world enters the otherwise knowledge-free machinery of search. But not any number will do: feed an informed search an estimate that ever overshoots the truth and its optimality guarantee evaporates — no warning, just worse answers. This lesson is about what a heuristic may promise (never overestimate — *admissibility*), what it should additionally promise (never fall faster than the step cost — *consistency*), how to manufacture such numbers on purpose (*relaxation*), and how to measure what they are worth (dominance and the effective branching factor).",
    },
    { kind: "heading", text: "The promise: never overestimate" },
    {
      kind: "definition",
      term: "Heuristic function",
      informal:
        "A function h(n) ≥ 0 estimating the cost of the cheapest path from state n to a goal — knowledge about the problem compressed into one number per state, for a search to order its effort by.",
      formal: "h(n) \\ge 0 \\text{ estimates } h^*(n)",
      why: "h*(n) — the true remaining cost — is exactly what the search is trying to find out. A heuristic is the affordable stand-in, and everything in informed search is priced by how close it stays to the truth without crossing above it.",
    },
    {
      kind: "math",
      title: "The two promises: admissibility and consistency",
      displays: [
        { expr: "h(n) \\le h^*(n) \\quad \\text{for every state } n", label: "admissibility" },
        { expr: "h(n) \\le c(n, n') + h(n')", label: "consistency" },
      ],
      derivation: {
        title: "Consistency implies admissibility",
        steps: [
          {
            expr: "h(n_i) \\le c(n_i, n_{i+1}) + h(n_{i+1})",
            reason: "consistency applied along an optimal path n₀, n₁, …, n_k from n₀ to a goal n_k",
          },
          {
            expr: "h(n_0) \\le \\sum_{i=0}^{k-1} c(n_i, n_{i+1}) + h(n_k)",
            reason: "chain the k inequalities: each intermediate h(nᵢ) appears on both sides and cancels — a telescoping sum",
          },
          {
            expr: "h(n_0) \\le \\sum_{i=0}^{k-1} c(n_i, n_{i+1})",
            reason: "n_k is a goal state: nothing remains to pay, so h(n_k) = 0",
          },
          {
            expr: "h(n_0) \\le h^*(n_0)",
            reason: "the path was optimal, so its total cost is exactly the true remaining cost from n₀ — h is admissible",
          },
        ],
      },
      caption:
        "Admissibility is the global promise: a certified lower bound on the cost still to go, at every state, no exceptions. That bound is the license optimal informed search runs on — the next two lessons build the engines that cash it — but it is not the engine, and it says nothing about accuracy: h ≡ 0 is admissible. Consistency is the local, edge-by-edge version — the estimate never falls by more than the edge paid, a triangle inequality — and it implies admissibility by the telescoping sum above. The converse fails: an admissible h need not be consistent, and lesson a-08 builds that counterexample, together with the trouble it causes a permanent closed list.",
    },
    // ------------------------------------------------------------ the factory
    { kind: "heading", text: "The heuristic factory: relaxations" },
    {
      kind: "text",
      text: "Admissibility is a proof obligation: *h(n) ≤ h\\*(n)* must hold for every one of the 181,440 boards, and no amount of spot-checking can discharge it. **Relaxation** converts the obligation into a derivation. Take the problem, remove a constraint, and solve the easier version exactly; the relaxed problem's optimal cost is an admissible heuristic for the original, because every original solution survives in the relaxed world and can only get cheaper there. The prototype is geographic: relax \"travel along roads\" to \"travel as the crow flies\", and the relaxed optimum from any city is simply the straight-line distance to the goal — the *h* the A* lesson's Romania trace runs with. The eight-puzzle earns its status as the canonical specimen because it admits a ladder of relaxations: drop more rules and the bound gets looser; drop fewer and it gets tighter.",
    },
    {
      kind: "definition",
      term: "Misplaced tiles (h₁)",
      informal:
        "Count the tiles that are not on their goal square, ignoring the blank. This is the exact optimal cost of the relaxed puzzle in which a tile may fly to any square — teleportation instead of sliding.",
      formal: "h_1(n) = \\sum_{t=1}^{8} [\\text{pos}(t) \\ne \\text{home}(t)]",
      why: "Each bracket is worth 1 when its tile is misplaced, 0 otherwise. Admissible by construction: a misplaced tile must move at least once, a move relocates exactly one numbered tile, so no solution is shorter than the count.",
    },
    {
      kind: "math",
      title: "Manhattan distance (h₂): relax less, bound tighter",
      displays: [
        { expr: "h_2(n) = \\sum_{t=1}^{8} (|\\Delta r(t)| + |\\Delta c(t)|)", label: "h₂, tile by tile" },
      ],
      caption:
        "Drop only the blocking: tiles still slide one square at a time but may pass through one another — no blank to negotiate. Tile t then needs exactly |Δr(t)| + |Δc(t)| moves home, no tile delays another, and the sum is the relaxed problem's exact optimum — like every relaxation's optimum, a lower bound on h*(n). Because the slide-through world keeps more of the original rules than the teleport world, h₂ ≥ h₁ on every board: relaxing less bounds tighter.",
    },
    {
      kind: "example",
      title: "Both heuristics on one board, tile by tile",
      problem:
        "Take the board 7 2 4 / 5 _ 6 / 8 3 1 (the blank shown as _), with goal 1 2 3 / 4 5 6 / 7 8 _. Compute h₁ (misplaced tiles) and h₂ (Manhattan distance), number by number.",
      steps: [
        {
          text: "Fix each tile's address and home.",
          detail:
            "Rows and columns are 0-indexed; tile t's home is row ⌊(t−1)/3⌋, column (t−1) mod 3. Tile 7 lives at (0, 0) but belongs at (2, 0); tile 2 sits at (0, 1) — already home; tile 6 sits at (1, 2) — already home.",
        },
        {
          text: "h₁ — count the exiles.",
          detail:
            "Misplaced: tile 1 (at (2, 2), home (0, 0)), tile 3 (at (2, 1), home (0, 2)), tile 4 (at (0, 2), home (1, 0)), tile 5 (at (1, 0), home (1, 1)), tile 7 (at (0, 0), home (2, 0)), tile 8 (at (2, 0), home (2, 1)). Six tiles — h₁(n) = 6.",
        },
        {
          text: "h₂ — sum the walking distances.",
          detail:
            "Tile 1: |2−0| + |2−0| = 4. Tile 3: |2−0| + |1−2| = 3. Tile 4: |0−1| + |2−0| = 3. Tile 5: |1−1| + |0−1| = 1. Tile 7: |0−2| + |0−0| = 2. Tile 8: |2−2| + |0−1| = 1. Tiles 2 and 6 contribute 0. Sum: 4 + 3 + 3 + 1 + 2 + 1 = 14 — h₂(n) = 14.",
        },
        {
          text: "Audit the promise.",
          detail:
            "Both are lower bounds on the truth, and Manhattan is the tighter one: 6 ≤ 14 ≤ h*(n). The program below certifies h*(n) = 20 — A* with Manhattan proves that optimum in 283 expansions, where h = 0 needs 48,390.",
        },
      ],
      result: "h₁(n) = 6, h₂(n) = 14, h*(n) = 20 — both admissible on this board, Manhattan dominant.",
    },
    // ------------------------------------------------------------ measurement
    { kind: "heading", text: "Dominance and the effective branching factor" },
    {
      kind: "math",
      title: "Two ways to compare heuristics",
      displays: [
        { expr: "h_2(n) \\ge h_1(n) \\quad \\forall n \\implies N(h_2) \\le N(h_1)", label: "dominance" },
        { expr: "0 \\le h_1(n) \\le h_2(n) \\le h^*(n)", label: "the 8-puzzle ladder" },
        { expr: "1 + b^{*} + (b^{*})^2 + \\dots + (b^{*})^d = N + 1", label: "effective branching factor" },
      ],
      caption:
        "N(h) is the count of expansions A* — the consumer of heuristics, two lessons ahead — makes with heuristic h on instances whose optimal solutions sit at depth d. Dominance is the standard comparison theorem: between two admissible heuristics, the pointwise-larger one never costs more expansions, because its lower bounds close in on the optimum sooner. The effective branching factor b* turns a raw expansion count into intuition: the branching factor a uniform tree of depth d would need to hold the N + 1 nodes the search touched.",
    },
    {
      kind: "example",
      title: "A worked effective branching factor",
      problem:
        "An optimal search run expands N = 39 nodes and finds its goal at depth d = 8. What uniform tree does this run \"feel like\"?",
      steps: [
        {
          text: "Write the defining equation.",
          detail:
            "1 + b* + (b*)² + … + (b*)⁸ = 40 — a depth-8 tree with branching factor b* holds exactly the 40 nodes the run touched (39 expansions plus the goal).",
        },
        {
          text: "Bracket the root.",
          detail:
            "b* = 1.3 holds 32.01 nodes — too few. b* = 1.4 holds 49.15 — too many. The root lies between.",
        },
        {
          text: "Squeeze.",
          detail:
            "b* = 1.35 gives 39.70, a shade under 40; b* = 1.36 gives 41.43, just over. Bisection closes on b* ≈ 1.352, whose tree holds 40.04 ≈ 40 nodes.",
        },
        {
          text: "Read it back.",
          detail:
            "A raw 8-puzzle node offers up to four successors (about 2.67 on average), so uninformed growth at depth 8 would brush 2.67⁸ ≈ 2,583 paths. The heuristic bought the search down to a tree that feels 1.35-ary — each expansion leaves, on average, barely a third of a live branch behind.",
        },
      ],
      result: "b* ≈ 1.352 — the 39 expansions behaved like a uniform tree of branching factor 1.35, not the puzzle's raw 2.67.",
    },
    {
      kind: "pythonImpl",
      title: "Three engines, ten random instances, one measurement",
      intent:
        "Put the lesson's claims — both heuristics admissible, Manhattan dominant, and the dominance worth measuring — through a seeded experiment on real random 8-puzzle instances.",
      code: `import random
from heapq import heappush, heappop

GOAL = (1, 2, 3, 4, 5, 6, 7, 8, 0)      # row-major; 0 is the blank

def neighbors(b):
    i = b.index(0)
    r, c = divmod(i, 3)
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        rr, cc = r + dr, c + dc
        if 0 <= rr < 3 and 0 <= cc < 3:
            j = rr * 3 + cc
            nb = list(b)
            nb[i], nb[j] = nb[j], nb[i]
            yield tuple(nb)

def h_zero(b):      return 0                     # UCS's "heuristic"
def misplaced(b):   return sum(1 for i, t in enumerate(b) if t != 0 and i != t - 1)
def manhattan(b):
    return sum(abs(i // 3 - (t - 1) // 3) + abs(i % 3 - (t - 1) % 3)
               for i, t in enumerate(b) if t != 0)

def astar(start, h):
    "graph-search A*, unit costs: pop min f, skip stale entries"
    frontier, best = [(h(start), 0, start)], {start: 0}
    expansions = 0
    while frontier:
        f, g, b = heappop(frontier)
        if g > best.get(b, -1):                  # a cheaper path was found later
            continue
        expansions += 1
        if b == GOAL:
            return g, expansions
        for nb in neighbors(b):
            g2 = g + 1
            if g2 < best.get(nb, 1 << 30):
                best[nb] = g2
                heappush(frontier, (g2 + h(nb), g2, nb))

ENGINES = [("UCS", h_zero), ("misplaced", misplaced), ("manhattan", manhattan)]

# 0) the lesson's board, audited: h1 = 6, h2 = 14, h* = 20
BOARD = (7, 2, 4, 5, 0, 6, 8, 3, 1)
print("lesson board:", "  ".join(f"{n}={astar(BOARD, h)[1]}" for n, h in ENGINES),
      " h* =", astar(BOARD, manhattan)[0])

# 1) ten instances: seeded random walks of 6..14 moves from the goal,
#    never undoing the previous move (rerunnable byte for byte)
random.seed(42)
walks = [random.randint(6, 14) for _ in range(10)]
totals, depths = {n: 0 for n, _ in ENGINES}, []
print("  #  walk  d*    UCS  misplaced  manhattan")
for k, L in enumerate(walks, 1):
    b, prev = GOAL, None
    for _ in range(L):
        step = random.choice([nb for nb in neighbors(b) if nb != prev])
        prev, b = b, step
    exps, ds = [], set()
    for n, h in ENGINES:
        d, e = astar(b, h)
        exps.append(e); totals[n] += e; ds.add(d)
    assert len(ds) == 1                    # all three engines prove one optimum
    depths.append(ds.pop())
    print(f" {k:2d}   {L:2d}   {depths[-1]:2d}   {exps[0]:5d}     {exps[1]:5d}     {exps[2]:5d}")
print("totals:", "  ".join(f"{n}={totals[n]}" for n, _ in ENGINES))

# 2) effective branching factor per engine: the b* for which a FOREST of
#    ten trees (one per instance, each at its own solution depth) holds
#    N + 10 nodes -- solved by bisection
def forest(b):
    return sum(sum(b ** i for i in range(d + 1)) for d in depths)
for n, _ in ENGINES:
    lo, hi = 1.0, 3.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if forest(mid) < totals[n] + len(depths):
            lo = mid
        else:
            hi = mid
    print(f"ebf {n:9s}= {(lo + hi) / 2:.3f}")`,
      output: `lesson board: UCS=48390  misplaced=3667  manhattan=283  h* = 20
  #  walk  d*    UCS  misplaced  manhattan
  1    7    7     127         8         8
  2    6    6      88        12         8
  3   10   10     619        38        17
  4    9    9     331        30        21
  5    9    9     335        29        14
  6    8    8     188        15         9
  7    7    7     119        12        10
  8   14   10     612        66        36
  9    7    7     127        19        13
 10   12   12    1260       108        48
totals: UCS=3806  misplaced=337  manhattan=184
ebf UCS      = 1.718
ebf misplaced= 1.265
ebf manhattan= 1.151`,
      walkthrough: [
        "One engine, three dials: setting h = h_zero recovers uniform-cost search — the control condition that isolates what the heuristic alone buys. The stale-entry skip and the relaxation test are the same two lines the A* lesson defends in detail.",
        "Instances are seeded random walks from the goal (lengths 6–14, never undoing the previous move), so the run is reproducible byte for byte. d* is measured, not assumed — walk 8 wanders 14 moves but lands at depth 10, and the table says so.",
        "The assert is the admissibility story in miniature: all three engines prove the same optimum on every instance — different amounts of work, identical answers.",
        "Dominance, observed: the manhattan column never exceeds misplaced's, which never exceeds UCS's — 184 ≤ 337 ≤ 3,806 in total, and row by row in the table.",
        "The ebf lines solve the forest equation — ten trees, one per instance at its own depth, holding N + 10 nodes — so totals across different depths stay comparable: UCS feels like a 1.72-ary tree, Manhattan a 1.15-ary one.",
        "Scope, honestly: ten shallow instances (d* = 6–12), one seed, one implementation. AIMA's classic measurement (Figure 3.29, 3rd edition; 100 random instances) reports the same ordering — Manhattan's effective branching factor well below misplaced-tiles' at every solution depth — but the only numbers this lesson claims are the ones above, measured here.",
      ],
      project: "The engines × instances × counters harness here is the core of the Part A project, The 8-Puzzle Laboratory.",
    },
    // ------------------------------------------------------------ practice
    {
      kind: "exercise",
      id: "a-05-e1",
      exerciseKind: "trace",
      prompt:
        "Derive, don't guess. For the Romania route problem (goal: Bucharest; operators: drive a road; cost: its length in km), relax \"you must follow roads\" to \"you may fly straight between any two cities, paying the straight-line distance\". (a) What is the exact optimal cost of the relaxed problem from a city n? (b) Why is that cost a lower bound on the true road distance — argue from the relaxation, not from the triangle inequality alone. (c) Name the heuristic you have just derived, and where this course runs it.",
      solution:
        "(a) The relaxed optimum from n is the straight-line distance SLD(n, Bucharest): flying directly is legal in the relaxed world, and no sequence of flights can cost less than the single straight one. (b) Any real road route n → c₁ → … → Bucharest is mirrored in the relaxed world flight for flight, each leg no dearer than the road it replaces (SLD(cᵢ, cᵢ₊₁) ≤ road(cᵢ, cᵢ₊₁)); since the direct flight is the cheapest relaxed plan of all, SLD(n, Bucharest) is at most the cost of any road route — that is, at most h*(n). (c) The straight-line-distance heuristic — exactly the h in the A* lesson's Romania trace, where it steers the search through Sibiu and R. Vâlcea to the 418 km optimum.",
      explanation:
        "The pattern generalizes: pick the constraint whose removal leaves a problem you can solve exactly, in closed form. Removing \"stay on the road network\" leaves a one-line geometry problem; removing \"tiles block each other\" leaves eight independent one-tile problems.",
      concepts: ["relaxation", "admissibility", "straight-line distance"],
    },
    {
      kind: "exercise",
      id: "a-05-e2",
      exerciseKind: "concept-check",
      prompt:
        "Four candidate heuristics for the eight-puzzle (goal 1 2 3 / 4 5 6 / 7 8 _, every move costs 1). Exactly one is INADMISSIBLE — which?",
      options: [
        {
          text: "h(n) = the number of tiles not on their goal square",
          correct: false,
          feedback:
            "Admissible — the teleport relaxation. Every misplaced tile must move at least once, and a move relocates exactly one numbered tile, so the count never exceeds the true remaining moves.",
        },
        {
          text: "h(n) = the sum over the eight tiles of |Δrow| + |Δcol|",
          correct: false,
          feedback:
            "Admissible — the slide-through relaxation; the lesson computed it as 14 against a true h* of 20 on the benchmark board.",
        },
        {
          text: "h(n) = 3 × the sum of Manhattan distances",
          correct: true,
          feedback:
            "Correct — the inadmissible one. Take the board one move from the goal with tile 8 displaced by a single square: h* = 1 but 3 × 1 = 3. One overestimating board is enough to break the inequality, and scaling multiplies the overshoot exactly where h* is small.",
        },
        {
          text: "h(n) = 0 for every board",
          correct: false,
          feedback:
            "Admissible, if useless: 0 ≤ h*(n) always. This is uniform-cost search's \"heuristic\" — the control condition in the lesson's experiment.",
        },
      ],
      solution:
        "3 × Manhattan. Admissibility is a promise made to every single state, and the near-goal boards are where a scaled heuristic breaks it: almost nothing remains to pay, so any inflation overshoots.",
      explanation:
        "Multiplying an admissible h by any factor above 1 destroys admissibility. Weighted variants deliberately make this trade — optimality for speed — but that is a later lesson's informed choice, never an accident.",
      concepts: ["admissibility", "Manhattan distance", "misplaced tiles"],
    },
    {
      kind: "exercise",
      id: "a-05-e3",
      exerciseKind: "predict-output",
      prompt:
        "By hand: an optimal search expands N = 14 nodes and finds the goal at depth d = 3. The effective branching factor b* is the branching factor of the uniform depth-3 tree holding N + 1 = 15 nodes. Compute b* exactly, and type the number.",
      expectedOutput: "2",
      solution:
        "Solve 1 + b* + (b*)² + (b*)³ = 15. Try b* = 2: 1 + 2 + 4 + 8 = 15 — exact. So b* = 2.",
      explanation:
        "At depth 3 the equation closes by inspection. Resist the pull of N/d = 4.67: the nodes sit on a geometric, not a linear, schedule — which is why the depth-8 case in the lesson needed bisection.",
      concepts: ["effective branching factor"],
    },
  ],
  terms: [
    {
      term: "admissibility",
      definition:
        "The property h(n) ≤ h*(n) for every state: a heuristic never overestimates the true remaining cost. It is the license optimal informed search runs on — a lower bound, not an algorithm.",
    },
    {
      term: "relaxation",
      definition:
        "A version of a problem with constraints removed. Every original solution survives in the relaxed world, so the relaxed problem's exact optimal cost is an admissible heuristic for the original.",
    },
    {
      term: "Manhattan distance",
      definition:
        "The sum over tiles of |Δrow| + |Δcol| — the exact optimum of the 8-puzzle where tiles slide but pass through one another. It dominates misplaced tiles everywhere.",
    },
    {
      term: "dominance",
      definition:
        "The order on admissible heuristics given by pointwise comparison: h₂ dominates h₁ when h₂(n) ≥ h₁(n) everywhere, and the dominant heuristic never costs the search more expansions.",
    },
    {
      term: "effective branching factor",
      definition:
        "The b* for which a uniform tree of depth d holds N + 1 nodes, where N is the expansions a search made at solution depth d — the standard one-number measure of a heuristic's worth.",
    },
  ],
  mistakes: [
    {
      mistake: "Declaring a heuristic admissible after checking a handful of boards.",
      why: "Admissibility is quantified over every state — 181,440 of them in the eight-puzzle. Spot-checks can refute (one overestimate kills the guarantee) but can never confirm, and the dangerous boards are the near-goal ones, where h* is small and an inflated h most easily crosses above it.",
      fix: "Derive, don't sample: build h as the exact optimum of a relaxation, which carries a proof with it. If you must test, test adversarially — boards one and two moves from solved are where overestimation shows first.",
    },
    {
      mistake: "Scaling a heuristic to make it \"sharper\" — say, 2 × or 3 × Manhattan.",
      why: "Multiplying feels like strengthening, but admissibility is an upper fence, not a volume to fill: the scaled value crosses above h* precisely where h* is small, and the optimality guarantee goes with it.",
      fix: "Win dominance honestly — drop fewer constraints in the relaxation, or add a safe term (a misplaced tile contributes at least 1 to any valid h). If speed matters more than optimality, scale deliberately and say so.",
    },
    {
      mistake: "Counting the blank — in the misplaced count or in the Manhattan sum.",
      why: "The blank is bookkeeping, not cargo: every move shifts one numbered tile (and the blank with it), so the blank's walking distance is the same moves counted from the other side. Adding it double-counts.",
      fix: "Sum over numbered tiles only. The near-goal sanity check is cheap: one move from solved, an admissible h must return 0 or 1 — never 2.",
    },
    {
      mistake: "Reading the effective branching factor as N/d.",
      why: "The definition is a geometric equation — a uniform tree of depth d with N + 1 nodes — not a ratio. N/d ignores compounding and badly overestimates: 14 expansions at depth 3 give b* = 2, not 4.67.",
      fix: "Solve 1 + b* + … + b*^d = N + 1: by trial at small depths, by bisection otherwise, as the worked example and the experiment both do.",
    },
  ],
  takeaways: [
    "Admissibility is one universally quantified inequality — h(n) ≤ h*(n), a certified lower bound on the cost still to go. It is the license of optimal informed search, not the engine.",
    "Consistency — h(n) ≤ c(n, n') + h(n'), the triangle inequality — is the stronger local promise: it implies admissibility by telescoping, but not conversely (a-08 has the counterexample).",
    "Relaxation is the heuristic factory: drop a constraint, solve the easier problem exactly, and its optimal cost is admissible by construction — crow-flies for maps, teleport for misplaced tiles, slide-through for Manhattan.",
    "Between admissible heuristics, dominance is free: the pointwise-larger one never costs more expansions — Manhattan dominates misplaced on every board.",
    "The effective branching factor restates an expansion count as the tree the search \"felt like\": 39 nodes at depth 8 is b* ≈ 1.35, far under the puzzle's raw 2.67.",
  ],
  quiz: [
    {
      id: "a-05-q1",
      prompt: "Which sentence states admissibility precisely?",
      options: [
        {
          text: "h(n) never overestimates the cheapest remaining cost from n — h(n) ≤ h*(n) — for every state n",
          correct: true,
          feedback:
            "Exactly: a per-state promise about the future, with no exceptions and no averaging. Near-goal boards bind just as hard as distant ones.",
        },
        {
          text: "h(n) equals the true remaining cost for most states",
          correct: false,
          feedback:
            "Admissibility is an inequality for every state, not approximate equality for a majority — h ≡ 0 is admissible and accurate nowhere.",
        },
        {
          text: "h(n) never decreases along a path",
          correct: false,
          feedback:
            "That is g's job — money paid only accumulates. Estimates to go normally shrink toward the goal; the allowed speed of the shrink is consistency's concern, not admissibility's.",
        },
        {
          text: "h(n) is cheap to compute",
          correct: false,
          feedback:
            "Admissibility says nothing about the cost of computing h — only about the number it returns. (Though in practice, per-node cost is a real engineering concern: the misplaced count is cheaper than the Manhattan sum.)",
        },
      ],
      explanation:
        "Admissibility is one inequality, universally quantified: every state, no exceptions. Accuracy, monotone behavior and cheapness are separate virtues — useful, but never substitutes.",
    },
    {
      id: "a-05-q2",
      prompt:
        "Drop from the eight-puzzle only the rule that a tile slides into the adjacent blank: tiles may now move to any adjacent square, passing through one another. What is the exact optimal cost of the relaxed problem?",
      options: [
        {
          text: "The number of misplaced tiles",
          correct: false,
          feedback:
            "That is the further relaxation — teleportation, where even adjacency is dropped. Here tiles must still walk square by square.",
        },
        {
          text: "The sum of Manhattan distances",
          correct: true,
          feedback:
            "Right: each tile independently needs exactly its |Δrow| + |Δcol| moves and no tile delays another, so the relaxed optimum is the sum — and a lower bound on the real h*.",
        },
        {
          text: "The true cost h*(n) — dropping a constraint cannot change the optimum",
          correct: false,
          feedback:
            "It can only lower it: every original solution survives in the relaxed world, and new cheaper ones appear. That gap is exactly what makes relaxation useful.",
        },
        {
          text: "The misplaced-tile count plus the blank's Manhattan distance",
          correct: false,
          feedback:
            "The blank is bookkeeping, not cargo — no tile pays to move it. Counting it overshoots on boards one move from the goal, where the true cost is 1.",
        },
      ],
      explanation:
        "How much you relax sets how tight the bound is: teleport (drop adjacency too) gives misplaced tiles; slide-through (keep adjacency, drop the blank) gives Manhattan — the strictly tighter of the two.",
    },
    {
      id: "a-05-q3",
      prompt:
        "Manhattan dominates misplaced tiles — h₂(n) ≥ h₁(n) on every board, both admissible. What follows?",
      options: [
        {
          text: "A* with h₂ never needs more expansions than A* with h₁",
          correct: true,
          feedback:
            "The standard dominance result: pointwise-larger admissible bounds let the search dismiss alternatives sooner, never later. The experiment's table shows it row by row — 184 versus 337 in total.",
        },
        {
          text: "A* with h₂ finds strictly cheaper solutions",
          correct: false,
          feedback:
            "Both are optimal — admissibility already fixed the answer's quality. Dominance buys fewer expansions, not better paths.",
        },
        {
          text: "h₂ must be consistent because h₁ is",
          correct: false,
          feedback:
            "Consistency is a per-edge property, independent of the dominance order — a pointwise-larger heuristic can still violate the triangle inequality somewhere.",
        },
        {
          text: "Misplaced tiles is useless and should be discarded",
          correct: false,
          feedback:
            "It remains admissible and cheaper per node to compute; when the Manhattan sum's bookkeeping is too slow per expansion, the \"weaker\" heuristic can be the better engineering trade.",
        },
      ],
      explanation:
        "Dominance is a partial order over admissible heuristics, and it pays out in exactly one currency: expansions. Quality was already guaranteed; work is what varies.",
    },
  ],
};
