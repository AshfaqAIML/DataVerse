/**
 * PART A · MODULE 3 · "Local Search and Landscapes" — lesson a-09, "Hill Climbing".
 *
 * Module 3's opening move: local search works on the state ITSELF — whole-
 * state neighborhoods, no path, no frontier — with 8-queens as the classic
 * beneficiary (16.8M states made searchable) and victim (87 of 100 seeded
 * climbs strand; the canonical literature figure is ~86%).
 *
 * Every `output` / `expectedOutput` is the REAL stdout of running the code
 * with python3 (scripts/verify-one-lesson.ts machine-verifies it). The
 * pinned starts — random.seed(7), 100 successive 8-tuples — are reused by
 * lesson a-10's variants; do not change them.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_09: ClassicalLesson = {
  slug: "a-09",
  title: "Hill Climbing",
  minutes: 25,
  summary:
    "Move to the best neighbor and stop when nothing improves — n-queens as the classic beneficiary and victim.",
  kind: "coding",
  objectives: [
    "Formulate 8-queens for local search: complete states, whole-state neighborhoods, an objective to minimize",
    "Count attacking pairs by hand with the row and diagonal tests, over every pair of columns",
    "Trace steepest-ascent hill climbing on a one-dimensional landscape and say exactly why it halts",
    "Implement steepest ascent in Python and measure stuck versus solved over 100 seeded starts",
  ],
  why: "Hill climbing is the first algorithm in this course that can find an eight-queens solution after looking at a few hundred states — and the first that will confidently halt at a board that still has an attacking pair on it. Both facts flow from one design choice: it works on the state itself, a complete candidate solution improved in place, with no frontier, no expanded set and no path to remember. That is exactly why it scales to spaces like the 16,777,216 complete 8-queens boards, where the tree searches of Modules 1–2 drown — and exactly why it strands on local optima. This lesson makes you measure both sides yourself: you will verify a 4-queens solution pair by pair, walk a one-dimensional landscape into its traps, and run one hundred seeded climbs that stick 87 times — then reason about why practitioners ship it anyway. Random restarts, simulated annealing and the other patches of Module 3 are all engineered against the failure you quantify today.",
  blocks: [
    // ------------------------------------------------------------ the opening
    {
      kind: "text",
      text: "Modules 1 and 2 were searches for a PATH: a sequence of actions from a start state to a goal, paid for with a frontier that grew and an expanded set that never shrank. Local search — the subject of this module — changes what is being searched. There is one *current state*, a complete candidate solution with all eight queens already on the board, and the algorithm improves it in place by moving to a better neighboring state; no frontier, no expanded set, no path, and the search's entire memory is the current state plus its score. The question shifts from \"which sequence of moves reaches a goal?\" to \"which single state is good enough — and can I walk there?\" Hill climbing is this family's simplest member, and 8-queens is simultaneously its classic showcase and its classic embarrassment: a climb that solves costs a few hundred state evaluations out of 16.8 million, and most climbs never arrive — they halt at a local optimum, attacking pairs still on the board.",
    },
    { kind: "heading", text: "The complete-state formulation" },
    {
      kind: "text",
      text: "The formulation keeps the rules of the puzzle but changes what a state *is*. A state is no longer a partially filled board — it is a **complete assignment**: one queen per column, written as the tuple of the eight rows, like `(5, 2, 6, 0, 1, 1, 5, 0)`. Because each column holds exactly one queen, no two queens can ever share a column — that attack is structurally impossible, and the space shrinks to 8^8 = 16,777,216 complete states, 92 of which are solutions. A move slides one queen to a different row *within its own column*: 8 columns × 7 alternative rows = 56 neighbors, every one of them a complete board — a **whole-state neighborhood**, not a successor-by-successor expansion. The objective — the number that defines \"better\" — is the count of attacking pairs of queens, to be minimized; `h = 0` means solved.",
    },
    {
      kind: "math",
      title: "State, attack test, objective, neighborhood",
      displays: [
        { expr: "s = (r_0, \\ldots, r_7), \\quad r_c \\in \\{0, \\ldots, 7\\}", label: "state" },
        { expr: "r_{c_1} = r_{c_2} \\text{ or } |r_{c_1} - r_{c_2}| = |c_1 - c_2|", label: "attack test" },
        { expr: "h(s) = \\text{number of attacking pairs}, \\quad 0 \\le h(s) \\le \\frac{8 \\times 7}{2} = 28", label: "objective" },
        { expr: "|N(s)| = 8 \\times 7 = 56 \\text{ moves}, \\quad |S| = 8^8 = 16\\,777\\,216 \\text{ states}", label: "neighborhood" },
      ],
      caption:
        "The attack test runs over every pair of columns c_1 < c_2 — C(8,2) = 28 checks per board, each involving exactly two queens. Equal rows attack; equal rise and run (|Δrow| = |Δcol|) is a shared diagonal and attacks; columns can never attack, because the state keeps exactly one queen per column.",
    },
    {
      kind: "definition",
      term: "Objective function",
      informal:
        "The single number that defines 'better'. For 8-queens it is the count of attacking pairs; the entire job of local search is to drive this number down — or, on a maximizing problem such as height or profit, up.",
      formal: "h : S -> R",
      why: "The objective is the ONLY thing a climb can see: two states are compared through their h values, never through their structure. Whatever h ignores — nearness to a solution in moves, elegance, anything else — the search cannot pursue.",
    },
    {
      kind: "example",
      title: "Checking a 4-queens solution, pair by pair",
      problem:
        "Is the 4-queens state s = (2, 0, 3, 1) a solution? With one queen per column there are C(4,2) = 6 pairs, and s is a solution exactly when h(s) = 0 — every pair must fail both the row test and the diagonal test.",
      steps: [
        { text: "Columns 0 and 1: rows 2 and 0.", detail: "|Δrow| = 2, |Δcol| = 1 — rows differ, and 2 ≠ 1 is not a diagonal. No attack." },
        { text: "Columns 0 and 2: rows 2 and 3.", detail: "|Δrow| = 1, |Δcol| = 2. No attack." },
        { text: "Columns 0 and 3: rows 2 and 1.", detail: "|Δrow| = 1, |Δcol| = 3. No attack." },
        { text: "Columns 1 and 2: rows 0 and 3.", detail: "|Δrow| = 3, |Δcol| = 1. No attack." },
        { text: "Columns 1 and 3: rows 0 and 1.", detail: "|Δrow| = 1, |Δcol| = 2. No attack." },
        { text: "Columns 2 and 3: rows 3 and 1.", detail: "|Δrow| = 2, |Δcol| = 1. No attack." },
      ],
      result:
        "h(s) = 0 — all six pairs fail both tests, so (2, 0, 3, 1) places four mutually safe queens: a solution. Hill climbing would halt here, because no neighbor can strictly improve on zero.",
    },
    // ------------------------------------------------------------ the landscape
    { kind: "heading", text: "The landscape and its three traps" },
    {
      kind: "table",
      title: "The landscape vocabulary",
      headers: ["Terrain", "The neighborhood at that spot", "What steepest ascent does"],
      rows: [
        [
          "Local optimum",
          "Every neighbor is equal or worse — the state is the peak of its own small basin",
          "Halts, contentedly, even when a far better state sits one valley away",
        ],
        [
          "Plateau",
          "A flat stretch: one or more neighbors merely tie the current value",
          "Halts under the strict-improvement rule; sideways-move variants can cross it, at the price of wandering",
        ],
        [
          "Ridge",
          "The improving direction runs diagonally, requiring several coordinates to change together",
          "Blind to it: each single-coordinate move looks flat or downhill, so the climb stalls or slides off",
        ],
      ],
      caption:
        "All three traps share one root cause: the next improvement is not inside the one-move neighborhood. The objective is fine; the moves are too small to express it. Pictured as terrain — objective value as height — the state space becomes a landscape, and the climb becomes a walk.",
    },
    {
      kind: "stateSpace",
      title: "A one-dimensional landscape: two peaks, one rule",
      graph: {
        nodes: [
          { id: "s0", label: "s0", sub: "h = 0", x: 6, y: 90, tone: "start" },
          { id: "s1", label: "s1", sub: "h = 2", x: 21, y: 72 },
          { id: "s2", label: "s2", sub: "h = 4", x: 36, y: 54, tone: "highlight" },
          { id: "s3", label: "s3", sub: "h = 3", x: 51, y: 63 },
          { id: "s4", label: "s4", sub: "h = 7", x: 66, y: 27, tone: "goal" },
          { id: "s5", label: "s5", sub: "h = 5", x: 81, y: 45 },
          { id: "s6", label: "s6", sub: "h = 1", x: 96, y: 81 },
        ],
        edges: [
          { from: "s0", to: "s1", label: "±1", directed: false },
          { from: "s1", to: "s2", label: "±1", directed: false },
          { from: "s2", to: "s3", label: "±1", directed: false },
          { from: "s3", to: "s4", label: "±1", directed: false },
          { from: "s4", to: "s5", label: "±1", directed: false },
          { from: "s5", to: "s6", label: "±1", directed: false },
        ],
        legend: [
          ["start", "a start state (s0)"],
          ["highlight", "local optimum (s2, h = 4)"],
          ["goal", "global optimum (s4, h = 7)"],
          ["edge", "a ±1 move — the whole neighborhood of an interior state"],
        ],
        caption:
          "Height is the objective, and this landscape maximizes (8-queens minimizes — same algorithm, sign flipped). Each edge is a ±1 move, so an interior state's ENTIRE neighborhood is two states. From s0 the climb is 0 → 2 → 4, then stuck: s3 (h = 3) is downhill from s2, and the peak at s4 is invisible. From s6 it is 1 → 5 → 7 — the same rule finds the global optimum when the start lies on its side of the valley.",
      },
      solutionNote:
        "A solution is the global optimum s4 (h = 7). Starts s3, s4, s5 and s6 lie in its basin and reach it by improving moves alone; starts s0, s1 and s2 strand on the local optimum s2 (h = 4) — no improving move crosses the valley at s3, whatever the start.",
    },
    {
      kind: "definition",
      term: "Local optimum",
      informal:
        "A state whose neighbors are all equal or worse — a peak of its own little basin. Steepest ascent halts here by definition, whether the state is excellent or terrible.",
      formal:
        "h(s) \\le h(s') \\text{ for every } s' \\in N(s) \\quad \\text{(minimize; flip the sign to maximize)}",
      why: "The definition is entirely LOCAL — it compares s only with its neighbors, so a local optimum can be perfect (h = 0) or hopeless (h = 17). Global optimality is a statement about every state in S, and nothing in the halt rule knows about it.",
    },
    // ------------------------------------------------------------ the algorithm, measured
    { kind: "heading", text: "Steepest ascent, measured honestly" },
    {
      kind: "algorithm",
      name: "Steepest-Ascent Hill Climbing",
      family: "Local search",
      problem:
        "Find a state with a good objective value in a space too large to search systematically, when only the final state — not the path to it — matters.",
      idea: "Keep one complete candidate state and repeatedly replace it with the best state in its neighborhood, halting when no neighbor is strictly better. No frontier, no bookkeeping, no path: the search's entire memory is the current state and its score.",
      strategy: [
        "Score the current state with the objective h.",
        "Generate the whole-state neighborhood — every state one move away (56 boards for 8-queens).",
        "Adopt the best neighbor if it is strictly better; first-found wins ties.",
        "Repeat from the new state; halt when no neighbor improves.",
        "Return the final state and its h — the path of moves is discarded.",
      ],
      guarantees: [
        "Terminates on any finite state space: with strict improvement, h strictly falls each move, so no state can repeat — at most 28 moves on 8-queens",
        "Not complete: it halts at local optima regardless of goals — 87 of our 100 seeded 8-queens starts halted unsolved",
        "Not optimal: the first state with no improving neighbor is returned, however it compares with the rest of S",
        "Produces a state, never a path — the wrong tool whenever the route itself is the deliverable",
      ],
      useWhen: [
        "The path is irrelevant and only the final state matters — layout, scheduling, timetabling",
        "The space is enormous but states are cheap to score (16,777,216 boards, 28 pair checks each)",
        "A good answer fast beats a perfect answer eventually",
        "You can afford restarts — the cure for local optima is more starts, not better steps (the next lesson's subject)",
      ],
      pitfalls: [
        "Local optima: halts while far from any solution — the measured 87%",
        "Plateaus: the strict-improvement rule stalls on flat neighborhoods",
        "Ridges: the uphill direction needs a coordinated multi-queen move that the 56-neighbor set cannot express",
      ],
    },
    {
      kind: "pythonImpl",
      title: "Steepest-ascent 8-queens: 100 seeded climbs, stuck vs solved",
      intent:
        "Runs the algorithm exactly as specified — pinned starts (random.seed(7)), the 56-neighbor move set, strict steepest ascent — and measures how often it solves versus strands, with one stranded board shown in full.",
      code: `import random

random.seed(7)                                    # pinned: later lessons reuse these starts
STARTS = [tuple(random.randrange(8) for _ in range(8)) for _ in range(100)]

def attacking_pairs(s):
    """Pairs of queens sharing a row or a diagonal. Columns never clash:
    the state holds exactly one queen per column."""
    pairs = 0
    for c1 in range(len(s)):
        for c2 in range(c1 + 1, len(s)):
            if s[c1] == s[c2] or abs(s[c1] - s[c2]) == c2 - c1:
                pairs += 1
    return pairs

def neighbors(s):
    """All 8 x 7 = 56 complete boards one move away: slide one queen
    to a different row within its own column."""
    for c in range(len(s)):
        for r in range(8):
            if r != s[c]:
                board = list(s)
                board[c] = r
                yield tuple(board)

def hill_climb(start):
    """Steepest ascent: evaluate every neighbor, move to the best one
    (first found wins ties), halt when nothing strictly improves."""
    current, value, evaluated = start, attacking_pairs(start), 1
    while True:
        best, best_value = None, value
        for board in neighbors(current):
            evaluated += 1
            v = attacking_pairs(board)
            if v < best_value:                    # strict improvement only
                best, best_value = board, v
        if best is None:                          # local optimum: halt
            return current, value, evaluated
        current, value = best, best_value

solved = stuck = evaluated_total = 0
first_stuck = None
for start in STARTS:
    final, value, evaluated = hill_climb(start)
    evaluated_total += evaluated
    if value == 0:
        solved += 1
    else:
        stuck += 1
        if first_stuck is None:
            first_stuck = (start, final, value)

print("steepest-ascent hill climbing, 100 seeded starts")
print("solved (h = 0):", solved)
print("stuck  (h > 0):", stuck)
print("neighbor evaluations:", evaluated_total,
      "of 8^8 =", 8**8, "complete states")
start, final, value = first_stuck
print()
print("a representative stuck run:")
print("  start", start, " h =", attacking_pairs(start))
print("  final", final, " h =", value)`,
      output: `steepest-ascent hill climbing, 100 seeded starts
solved (h = 0): 13
stuck  (h > 0): 87
neighbor evaluations: 24292 of 8^8 = 16777216 complete states

a representative stuck run:
  start (5, 2, 6, 0, 1, 1, 5, 0)  h = 6
  final (4, 2, 6, 3, 1, 7, 5, 0)  h = 1`,
      walkthrough: [
        "`attacking_pairs` is the lesson's math block as code: 28 column pairs, each tested for equal rows or equal rise-and-run. Columns never attack — the state keeps exactly one queen per column.",
        "`neighbors` yields 56 complete boards: 8 columns × 7 alternative rows. There is no frontier because there is never more than one live state — the whole-state neighborhood replaces the successor expansion of Modules 1–2.",
        "The strict `<` does double duty: it defines the halt (no neighbor improves) and it guarantees termination — h strictly falls from a start value of at most 28, so a climb is bounded by 28 moves and in practice runs about four 56-neighbor sweeps, the last of which finds nothing.",
        "The measurement: 13 solved, 87 stuck. The canonical literature figure for steepest-ascent 8-queens is ≈ 86% stuck (AIMA); our seeded run measures 87/100 — one sample around that same underlying rate, reported exactly as measured.",
        "The representative stuck run is the lesson's thesis in miniature: the final board is ONE pair short — the queens in columns 0 and 2 (rows 4 and 6) attack along a diagonal — and all 56 neighbors were evaluated: none improves it, two merely tie. The fix needs two queens to move at once, and the neighborhood cannot express that.",
        "The economics: 24,292 evaluations across the whole experiment — 0.145% of the 16,777,216-state space — bought 13 solutions. Exercise a-09-e3 asks what that ratio is worth.",
      ],
      project:
        "The pinned starts (seed 7) and this objective/neighborhood pair are the exact harness the next lesson's restarts and annealing rerun — keep the file.",
    },
    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-09-e1",
      exerciseKind: "trace",
      prompt:
        "A one-dimensional landscape has heights h = [1, 3, 3, 5, 8, 6, 4, 0] for states s0 through s7 — maximize, moves are ±1, and only strict improvements are taken. Trace steepest-ascent hill climbing twice: from s0 and from s6. For each trace, list the states visited with their heights, and say where the climb halts and why — including what the rule does when a neighbor merely TIES the current value.",
      solution:
        "From s0: s0 (h = 1) → s1 (h = 3), because 3 > 1. At s1 the neighbors are s0 (1) and s2 (3): s2 only ties, and a tie is not a strict improvement, so the climb halts at s1 — stranded on the edge of a plateau two states wide, with the global optimum s4 (h = 8) three moves away. From s6: s6 (h = 4) → s5 (h = 6) → s4 (h = 8), halting at the global optimum: from s5 the neighbor s4 improves, and at s4 both s3 (5) and s5 (6) are worse. Same rule, same landscape, opposite fates — everything depends on where the climb starts.",
      explanation:
        "The halt at s1 is the strict-improvement rule biting on a plateau: a variant that allows sideways moves (usually capped — AIMA allows up to 100 consecutive) could step s1 → s2, then see s3 (5) improve on 3 and climb on to s4 — at the price of wandering on genuinely flat stretches.",
      concepts: ["hill climbing", "local optimum", "plateau"],
    },
    {
      kind: "exercise",
      id: "a-09-e2",
      exerciseKind: "predict-output",
      prompt:
        "Without running it, predict the exact stdout of this program — both lines, exactly as printed. Then say in one sentence each why the two climbs end at different kinds of halt.",
      starter: `HEIGHTS = [1, 4, 3, 6, 2]        # states s0..s4, maximize, moves are +-1

def neighbors(i):
    out = []
    if i > 0:
        out.append(i - 1)
    if i < len(HEIGHTS) - 1:
        out.append(i + 1)
    return out

def climb(start):
    path, i = [start], start
    while True:
        best = max(neighbors(i), key=lambda j: HEIGHTS[j])
        if HEIGHTS[best] <= HEIGHTS[i]:
            return path          # no strictly better neighbor: halt
        path.append(best)
        i = best

for start in (0, 4):
    print("start s%d:" % start,
          " -> ".join("s%d(h=%d)" % (i, HEIGHTS[i]) for i in climb(start)))`,
      expectedOutput: `start s0: s0(h=1) -> s1(h=4)
start s4: s4(h=2) -> s3(h=6)`,
      solution: `start s0: s0(h=1) -> s1(h=4)
start s4: s4(h=2) -> s3(h=6)`,
      explanation:
        "The first climb halts at s1 (h = 4): its best neighbor is s2 with h = 3 — worse, not better — so this is a LOCAL optimum, and the global optimum s3 (h = 6) sits one valley away. The second halts at s3 because both neighbors (s2 with 3, s4 with 2) are worse — the same halt rule, but this time at the global optimum. Note the code's halt test is HEIGHTS[best] <= HEIGHTS[i]: 'not strictly better' covers both 'worse' and 'equal', and note that max() keeps the FIRST maximum it sees — the first-found tie-break, matching the lesson's specification.",
      concepts: ["hill climbing", "halt condition", "local vs global optimum"],
    },
    {
      kind: "exercise",
      id: "a-09-e3",
      exerciseKind: "concept-check",
      prompt:
        "Judgment call. Your measured run: steepest-ascent hill climbing solved 13 of 100 seeded 8-queens starts, stuck on 87, and touched 24,292 states in total. Brute force would examine up to 8^8 = 16,777,216 complete states but always finds a solution. In what honest sense does hill climbing still win?",
      options: [
        {
          text: "Cost per solution: at roughly a 13% success rate per independent start, the expected number of starts to a solution is about 1/0.13 ≈ 8, each climb a few hundred evaluations — thousands of state evaluations per solution, not millions",
          correct: true,
          feedback:
            "Correct — this is the random-restart argument. Each climb costs about 243 evaluations on average, so even a cautious fixed budget wins big: 30 restarts succeed with probability 1 − 0.87^30 ≈ 98% at roughly 7,300 evaluations, still three orders of magnitude under enumeration. Making restarts a first-class algorithm is the next lesson's job.",
        },
        {
          text: "It does not win — 87% stuck means brute force is the better engineering choice for 8-queens",
          correct: false,
          feedback:
            "Watch the units: '87% stuck' counts RUNS, '16.8 million' counts STATES. A stuck run still costs only ~243 evaluations; brute force pays millions on every single attempt. The comparison that matters is evaluations per solution.",
        },
        {
          text: "Hill climbing is guaranteed to find a solution if it is allowed to keep climbing long enough",
          correct: false,
          feedback:
            "No — a single climb halts structurally at a local optimum; more TIME does not help, only more STARTS (or bigger, wilder moves) do. That is exactly the fix the next lesson builds.",
        },
        {
          text: "The stuck runs end near-solutions, so they are 87% of the way there and cheap to finish",
          correct: false,
          feedback:
            "Our representative stuck run finished one pair short — but with NO improving move left: 'close in h' is not 'close in moves'. Plenty of stuck runs end several pairs short, and local optima are precisely where closeness stops helping.",
        },
      ],
      solution:
        "The honest defense is cost-per-solution under restarts. With success probability p ≈ 0.13 per independent random start, the expected number of starts to a solution is 1/p ≈ 8, each costing on the order of 243 state evaluations — a few thousand evaluations per solution, against 16,777,216 for systematic enumeration. A fixed budget is even more convincing: 30 restarts succeed with probability 1 − 0.87^30 ≈ 98%, at roughly 7,300 evaluations total. Random restarts turn an unreliable climber into a reliable solver; making that precise is the next lesson's job.",
      explanation:
        "Per-run unreliability and per-budget reliability are different currencies: convert both to evaluations per solution before deciding. That conversion — p per start, 1/p expected starts — is the bridge to random-restart hill climbing in lesson a-10.",
      concepts: ["hill climbing", "random restarts", "cost per solution"],
    },
  ],
  terms: [
    {
      term: "hill climbing",
      definition:
        "The simplest local search: repeatedly replace the current state with the best neighboring state (steepest ascent) and halt when no neighbor is strictly better. The answer is a final state, not a path.",
    },
    {
      term: "objective function",
      definition:
        "The number that defines 'better' for a local search — attacking pairs for n-queens. Everything the climb knows about a state, it knows through this value.",
    },
    {
      term: "neighborhood",
      definition:
        "The set N(s) of states one move away from s — for 8-queens, the 56 boards obtained by sliding a single queen within its column. The neighborhood defines everything the climb can see.",
    },
    {
      term: "local optimum",
      definition:
        "A state no neighbor improves on: the climb's guaranteed resting place, and the reason it is not a complete algorithm. Its opposite is the global optimum — the best state in the entire space.",
    },
    {
      term: "global optimum",
      definition:
        "The best state in the whole space by the objective — for 8-queens, any of the 92 zero-pair boards. Hill climbing finds it only when its basin happens to contain the start.",
    },
  ],
  mistakes: [
    {
      mistake: "Reporting 'success' when the algorithm halts.",
      why: "The halt condition is local — 'no neighbor improves' — and says nothing about the goal; 87 of our 100 seeded runs halted without solving.",
      fix: "Test h(s) against the goal (h = 0 for n-queens), not against the neighborhood. A halted climb is stuck, not solved.",
    },
    {
      mistake: "Writing the diagonal test without abs(): r1 - r2 == c1 - c2.",
      why: "The sign of the row difference flips with column order, so half the diagonals slip past the test — the climb then happily 'optimizes' toward boards that still hold attacks.",
      fix: "Compare absolute values: abs(r1 - r2) == abs(c1 - c2) — or iterate pairs with c1 < c2 and test abs(s[c1] - s[c2]) == c2 - c1, as the lesson's code does.",
    },
    {
      mistake: "Accepting equal-value moves (best_value <= value instead of <).",
      why: "On a plateau the walk can slide between equal-value states forever — strict improvement is the termination argument, since h strictly falls and no state can repeat.",
      fix: "Move only on strict improvement; if you must cross plateaus, allow sideways moves with an explicit cap — that is a named variant, not a bug fix.",
    },
  ],
  takeaways: [
    "Local search optimizes one complete state in place — no frontier, no path, no memory beyond the current state and its score.",
    "8-queens as a complete-state problem: 8^8 = 16,777,216 boards, 56 neighbors each, objective = attacking pairs, h = 0 solved.",
    "Steepest ascent halts at the first local optimum it meets — measured honestly, 87 stuck of 100 seeded starts, against the canonical ≈ 86%.",
    "Local optimum, plateau and ridge are three names for one fact: the next improvement is not inside the one-move neighborhood.",
    "Unreliable per run can be reliable per budget — expected restarts ≈ 1/p ≈ 8 at p ≈ 0.13 — which is the bridge to random restarts in the next lesson.",
  ],
  quiz: [
    {
      id: "a-09-q1",
      prompt: "Steepest-ascent hill climbing on 8-queens halts at a state s. The halt means precisely that —",
      options: [
        {
          text: "no neighbor of s has a strictly smaller attacking-pair count",
          correct: true,
          feedback:
            "Correct — the halt condition is LOCAL: it compares s only with the 56 states one move away, and is silent about everything else. That is why a halt is not a success: 87 of our 100 runs halted unsolved.",
        },
        {
          text: "no state anywhere in the 16.8-million-state space is better",
          correct: false,
          feedback:
            "That is the definition of the GLOBAL optimum — if halting meant this, hill climbing would be an optimal algorithm. It is not, and the 87 stuck runs are the proof.",
        },
        {
          text: "the attacking-pair count has reached zero",
          correct: false,
          feedback:
            "h = 0 does stop a climb — but only because zero cannot be improved on. The same halt rule also fires at h ≥ 1: 87 times in our run.",
        },
        {
          text: "the evaluation budget is exhausted",
          correct: false,
          feedback:
            "There is no budget. On a finite landscape with strict improvement the walk simply runs out of improving moves — the halt is structural, not fiscal.",
        },
      ],
      explanation:
        "The halt is a statement about the neighborhood N(s), not about the space S — and the gap between the two is the entire failure mode this lesson measures.",
    },
    {
      id: "a-09-q2",
      prompt: "In the 4-queens state (2, 0, 3, 1), consider the queens in columns 1 and 3. Do they attack?",
      options: [
        {
          text: "No — |Δrow| = 1 and |Δcol| = 2, so the rows differ and it is not a diagonal",
          correct: true,
          feedback:
            "Correct — rows 0 and 1 differ (no row attack), and 1 ≠ 2 (no shared diagonal). The pair is safe, like all six pairs of this state.",
        },
        {
          text: "Yes — their rows are adjacent, and adjacent rows always attack",
          correct: false,
          feedback:
            "Adjacency means nothing here: an attack requires the SAME row, or |Δrow| = |Δcol| (a shared diagonal). Adjacent rows two columns apart are safe.",
        },
        {
          text: "Yes — they share a diagonal",
          correct: false,
          feedback:
            "A shared diagonal needs equal rise and run: |Δrow| = |Δcol|. Here 1 ≠ 2, so the pair is safe.",
        },
        {
          text: "You cannot know without checking the other queens",
          correct: false,
          feedback:
            "You can — the attack test is strictly pairwise. Whether columns 1 and 3 attack depends only on their two rows, which is why h decomposes into 28 independent checks on 8-queens.",
        },
      ],
      explanation:
        "Pairwise decomposability is what makes the objective cheap — C(8,2) = 28 independent checks per board. It is also why the landscape misleads: each check involves two queens, while a fix may require moving several at once.",
    },
    {
      id: "a-09-q3",
      prompt:
        "Our run measured 87% stuck; the canonical literature reports ≈ 86% for steepest-ascent 8-queens. What is the honest reading of the difference?",
      options: [
        {
          text: "Sampling variation: both numbers estimate the same underlying success rate (≈ 14%); one seed's 100 runs land at 13 solved, another seed lands elsewhere",
          correct: true,
          feedback:
            "Correct — with 100 runs, the estimator's standard error is about √(0.14 × 0.86 / 100) ≈ 3.5 percentage points, so 87 versus 86 is noise. The discipline is to report your own measurement and name the canon alongside it.",
        },
        {
          text: "Our neighborhood must be smaller than the canonical 56-move one",
          correct: false,
          feedback:
            "It is exactly the standard formulation: move a single queen to another row in its column — 8 × 7 = 56 neighbors, 28 pair checks per board. The setup matches the literature.",
        },
        {
          text: "The canonical number includes sideways moves",
          correct: false,
          feedback:
            "Backwards — ALLOWING sideways moves is the variant that drops the stuck rate dramatically (AIMA measures ≈ 6% stuck for it). Plain steepest ascent is the ≈ 86% algorithm.",
        },
        {
          text: "Our first-found tie-break loses solutions the canonical tie-break finds",
          correct: false,
          feedback:
            "Ties never move the climb either way: only STRICT improvement is taken, so which equal neighbor might have been picked is irrelevant to where the climb halts.",
        },
      ],
      explanation:
        "One measurement is one sample. Report what your seed produced, say what the canon reports, and let both stand — 87/100 and ≈ 86% are the same story told twice.",
    },
  ],
};
