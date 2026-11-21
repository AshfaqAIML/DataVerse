/**
 * Lesson b-06 "Move Ordering and Deep Cuts" — the measurement lesson. All
 * numbers below are the real stdout of scripts/b06-ordering.py (seeded,
 * deterministic): minimax 238 visits vs alpha-beta 54 (heuristic ordering) /
 * 78.2 mean (random, seeds 11-15) on the same 5-empty tic-tac-toe position;
 * effective branching factor 2.99 -> 2.22 against the perfect-ordering ideal
 * of sqrt(3) ~ 1.73. The 6-vs-8 trace tree in e2 is verified by hand.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_06: ClassicalLesson = {
  slug: "b-06",
  title: "Move Ordering and Deep Cuts",
  minutes: 30,
  summary:
    "Search the strongest moves first and alpha-beta visits O(b^(m/2)) instead of O(b^m) — with measurements.",
  kind: "coding",
  objectives: [
    "Explain why the FIRST child of every node carries the window for its siblings — and why ordering controls everything alpha-beta saves",
    "Derive the perfect-ordering bound O(b^(m/2)) and read it as doubling the searchable depth",
    "Measure a pruning dividend honestly: baseline minimax, random ordering across seeds, and a heuristic ordering, on one position",
    "Use the effective branching factor to compare searches that visit different numbers of nodes",
  ],
  why: "Lesson b-05 ended with a promise and a tease: alpha-beta with perfect ordering visits the square root of the tree, and 'move ordering is where real engines spend their ingenuity.' This lesson cashes that cheque. The mechanism is simple once you see it — a cut fires when a window closes, and the window closes earliest when the strongest moves are searched first — but the consequences are the whole history of game programming: Deep Blue searched millions of positions per second, and none of it would have mattered if its move ordering had been poor, because the exponent, not the clock, is the wall. You will not take that on faith. You will run one position through three solvers — plain minimax, alpha-beta with random ordering, alpha-beta with a heuristic ordering — with fixed seeds and a node counter, and watch 238 visits fall to 54. Then you will learn the standard instrument for reporting such results, the effective branching factor, and the engine trick (iterative deepening) that turns yesterday's search into today's ordering.",
  blocks: [
    {
      kind: "text",
      text: "Here is the entire lesson in one observation: a cut fires when the window closes, and the window closes from the left. At the root, α starts at −∞; the first child you search sets α, and every later sibling is judged against it. Search a strong child first and α leaps up — later siblings only have to *touch* that bar to be cut. Search a weak child first and α stays low — every later sibling gets searched in full before the bar rises. The tree is the same, the value is the same (that is b-05's theorem); only the order in which children present themselves decides how much of the tree you pay for. Ordering is not an optimization bolted onto alpha-beta. Ordering IS the algorithm's performance.",
    },
    { kind: "heading", text: "Why the first child is special" },
    {
      kind: "text",
      text: "Walk the b-05 trace once more with ordering eyes. Node a1 was searched first, in full, with an empty window (α = −∞, β = +∞) — **no cut is ever possible inside the first child of the root**, because there is no bar to cross yet. It was a1's value, 3, that armed every later cut: a2 dipped to 2 and died; a3 settled at 2 and died. Had the tree presented a2 first, the story inverts: a2's full value (2) sets a low bar, a1's MIN node then sees its first leaf return 3 or more — β never falls to 2 or below — and the whole of a1 runs to completion before the root learns what it always learns: the answer is 3, move a1. Same answer. Different bill. That bill is what you are about to control.",
    },
    {
      kind: "math",
      title: "The perfect-ordering dividend",
      derivation: {
        title: "Why b^(m/2) is the floor",
        steps: [
          {
            expr: "b^m \\text{ leaves: what minimax pays}",
            reason: "plain minimax touches every leaf of the whole tree, always",
          },
          {
            expr: "\\text{at the root all } b \\text{ children must be searched}",
            reason: "the window starts empty — the first child of every node runs to completion, and the root has nothing to compare yet",
          },
          {
            expr: "\\text{under each child, the first grandchild settles } \\beta \\text{ against } \\alpha",
            reason: "with best-first ordering, the opponent's strongest reply comes first, so the window closes almost immediately one level down",
          },
          {
            expr: "\\approx 2 \\cdot b^{m/2} \\text{ leaves instead of } b^m",
            reason: "the tree thins to alternating full levels and single-child levels — a depth-m search carrying roughly the leaf count of depth m/2",
          },
          {
            expr: "m -> 2m",
            reason: "for a fixed node budget, perfect ordering doubles the depth you can afford: this is the result that makes deep game trees searchable at all",
          },
        ],
      },
      caption:
        "The classic bound (Knuth & Moore, 1975): with every node's children ordered best-first, alpha-beta examines O(b^(m/2)) leaves — the square root of minimax's bill. Random ordering sits between the extremes at roughly O(b^(3m/4)).",
    },
    { kind: "heading", text: "Measure, don't argue" },
    {
      kind: "text",
      text: "One position, three solvers, one counter convention (every call counts, terminals included). The position: X to move, five cells open — a genuine midgame with a forced win hiding in it. The ordering heuristic is the oldest piece of tic-tac-toe wisdom there is: try the centre first, then corners, then edges. Random ordering is seeded, so every number below is reproducible. Predict before you read the output: how much should ordering matter on a tree this small?",
    },
    {
      kind: "pythonImpl",
      title: "Minimax vs alpha-beta: random vs heuristic ordering",
      intent:
        "Solve one 5-empty tic-tac-toe position three ways — plain minimax, seeded-random-order alpha-beta, centre-corners-edges-order alpha-beta — printing values, visit counts, the seed spread, and effective branching factors.",
      code: `import random

LINES = [
    ((0, 0), (0, 1), (0, 2)), ((1, 0), (1, 1), (1, 2)), ((2, 0), (2, 1), (2, 2)),
    ((0, 0), (1, 0), (2, 0)), ((0, 1), (1, 1), (2, 1)), ((0, 2), (1, 2), (2, 2)),
    ((0, 0), (1, 1), (2, 2)), ((0, 2), (1, 1), (2, 0)),
]
# heuristic preference: centre, corners, edges (classic tic-tac-toe wisdom)
PREF = {(1, 1): 0, (0, 0): 1, (0, 2): 2, (2, 0): 3, (2, 2): 4,
        (0, 1): 5, (1, 0): 6, (1, 2): 7, (2, 1): 8}

visits = 0


def fresh():
    return [["X", ".", "."], ["O", "X", "."], [".", ".", "O"]]


def winner(board):
    for a, b, c in LINES:
        if board[a[0]][a[1]] != "." and board[a[0]][a[1]] == board[b[0]][b[1]] == board[c[0]][c[1]]:
            return board[a[0]][a[1]]
    return None


def utility(board):
    w = winner(board)
    if w == "X":
        return 1
    if w == "O":
        return -1
    if all("." not in row for row in board):
        return 0
    return None


def empties(board, order):
    cells = [(r, c) for r in range(3) for c in range(3) if board[r][c] == "."]
    if order == "static":
        cells.sort(key=lambda rc: PREF[rc])
    elif order == "random":
        random.shuffle(cells)
    return cells


def minimax(board, x_to_move, order):
    global visits
    visits += 1
    u = utility(board)
    if u is not None:
        return u
    scores = []
    for r, c in empties(board, order):
        board[r][c] = "X" if x_to_move else "O"
        scores.append(minimax(board, not x_to_move, order))
        board[r][c] = "."
    return max(scores) if x_to_move else min(scores)


def alphabeta(board, x_to_move, alpha, beta, order):
    global visits
    visits += 1
    u = utility(board)
    if u is not None:
        return u
    if x_to_move:
        value = -2
        for r, c in empties(board, order):
            board[r][c] = "X"
            value = max(value, alphabeta(board, False, alpha, beta, order))
            board[r][c] = "."
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return value
    value = 2
    for r, c in empties(board, order):
        board[r][c] = "O"
        value = min(value, alphabeta(board, True, alpha, beta, order))
        board[r][c] = "."
        beta = min(beta, value)
        if alpha >= beta:
            break
    return value


print("position: X to move, 5 empties")
print()

visits = 0
v = minimax(fresh(), True, "static")
mm_visits = visits
print("plain minimax        : value %+.0f  visits %d" % (v, mm_visits))

random.seed(11)
visits = 0
v = alphabeta(fresh(), True, -2, 2, "random")
print("alpha-beta random    : value %+.0f  visits %d  (seed 11)" % (v, visits))

visits = 0
v = alphabeta(fresh(), True, -2, 2, "static")
ab_visits = visits
print("alpha-beta heuristic : value %+.0f  visits %d  (centre > corners > edges)" % (v, ab_visits))

plies = 5
print()
print("effective branching factor over %d plies:" % plies)
print("  minimax   : %.2f" % mm_visits ** (1.0 / plies))
print("  heuristic : %.2f" % ab_visits ** (1.0 / plies))

print()
print("random ordering, seeds 11..15:")
counts = []
for seed in range(11, 16):
    random.seed(seed)
    visits = 0
    alphabeta(fresh(), True, -2, 2, "random")
    counts.append(visits)
    print("  seed %d: visits %d" % (seed, visits))
print("mean visits:", sum(counts) / len(counts))`,
      output: `position: X to move, 5 empties

plain minimax        : value +1  visits 238
alpha-beta random    : value +1  visits 83  (seed 11)
alpha-beta heuristic : value +1  visits 54  (centre > corners > edges)

effective branching factor over 5 plies:
  minimax   : 2.99
  heuristic : 2.22

random ordering, seeds 11..15:
  seed 11: visits 83
  seed 12: visits 64
  seed 13: visits 56
  seed 14: visits 86
  seed 15: visits 102
mean visits: 78.2`,
      walkthrough: [
        "Three solvers, one answer: +1, a forced win for X — b-05's invariance, holding under every ordering. What varies is the bill: 238 visits (minimax) → 78.2 on average (random) → 54 (heuristic).",
        "Why the heuristic wins big here: its first candidate among the open cells is the corner (0,2) — one of the position's two winning moves (the other is (0,1); the remaining three moves only draw). The best move first sends α straight to +1, and every later sibling must beat a maximal bar: they die almost instantly.",
        "Random ordering pays for its luck: seed 13 landed near the heuristic (56), seed 15 paid nearly double (102). One seed is an anecdote — hence the table; the mean, 78.2, is the honest random-ordering price.",
        "The effective branching factor converts visits into a depth-independent number: 238 visits over 5 plies means branching 238^(1/5) ≈ 2.99 (the raw b, as expected — minimax leaves nothing on the table), while the heuristic's 54^(1/5) ≈ 2.22. The perfect-ordering ideal is √3 ≈ 1.73; 2.22 says the centre-corners-edges heuristic is useful but far from omniscient.",
        "Same trick, bigger trees: at b = 35 (chess), the ideal ordering would make the effective branching ≈ 6 — which is the difference between searching 4 plies and 8 on the same hardware. That factor-of-two in depth is the entire rationale for investing in ordering.",
      ],
    },
    {
      kind: "complexity",
      title: "Alpha-beta's cost, as a function of ordering",
      rows: [
        {
          algorithm: "Minimax",
          best: "O(b^m)",
          average: "O(b^m)",
          worst: "O(b^m)",
          space: "O(m)",
          note: "every leaf, whatever the order — the baseline",
        },
        {
          algorithm: "Alpha-beta, worst ordering",
          best: "O(b^m)",
          average: "O(b^m)",
          worst: "O(b^m)",
          space: "O(m)",
          note: "an adversary who knows your order suppresses every cut; the value is still exact",
        },
        {
          algorithm: "Alpha-beta, random ordering",
          best: "O(b^(3m/4))",
          average: "O(b^(3m/4))",
          worst: "O(b^m)",
          space: "O(m)",
          note: "the expected case under random child order (the measured 78.2-vs-54 gap is this effect at small scale)",
        },
        {
          algorithm: "Alpha-beta, perfect ordering",
          best: "O(b^(m/2))",
          average: "O(b^(m/2))",
          worst: "O(b^(m/2))",
          space: "O(m)",
          note: "equivalent branching √b: double depth for the same budget — the floor every ordering heuristic chases",
          highlight: true,
        },
      ],
      reading:
        "The four rows are the same algorithm with different information. Ordering never touches correctness — it buys depth. That is why engines ship ordering heuristics, not bigger clocks.",
    },
    { kind: "heading", text: "Where orderings come from" },
    {
      kind: "text",
      text: "The centre-corners-edges table is a toy — real games have no such fixed wisdom worth trusting. Deployed engines order moves with machinery that earns its keep: **iterative deepening** searches to depth d−1 first, then uses that search's best moves (the *principal variation*) to order the depth-d search — yesterday's answer becomes today's ordering; **killer moves** remember which replies caused cuts at the same depth in sibling branches and try them first; the **history heuristic** accumulates statistics over the whole run about which moves have historically cut; chess programs put captures and checks before quiet moves. None of these knows the true best move — if they did, you would not need the search. They are guesses, and the entire art is that *cheap, mostly-right guesses* capture most of the square-root dividend.",
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Iterative deepening, in one paragraph",
      text: "Search depth 1 fully. Then depth 2, trying at every node the moves that were best at depth 1 first. Then depth 3, ordered by depth 2's findings. Repeat until the time budget dies, and report the last COMPLETED search's move. The re-searching looks wasteful — you solve the shallow tree over and over — but the arithmetic is forgiving: the deepest iteration dominates the bill (a geometric series costs about its largest term), and the ordering it inherits typically saves far more than the repetition costs. It also gives you a time-controlled engine for free: stop wherever the budget ends, and you still have a move. This one idea is why tournament programs are called 'iterative-deepening alpha-beta engines'.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-06-e1",
      exerciseKind: "concept-check",
      prompt:
        "Your teammate notices that random seed 13 visited 56 nodes — nearly matching the heuristic's 54 — and concludes that random ordering is 'basically as good as heuristic ordering.' What is wrong with the reasoning?",
      options: [
        {
          text: "A single seed is an anecdote: random ordering's cost is a distribution (56-102 across five seeds here), and comparing one lucky draw to a consistent method says nothing about the average or the variance",
          correct: true,
          feedback: "Correct. The mean over seeds (78.2) is the honest price of randomness, and the heuristic's virtue is that it is both cheaper on average AND stable — 54 every time, no seed roulette. Benchmarks of stochastic searchers need seeds, tables, and means — never one run.",
        },
        {
          text: "Nothing is wrong — 56 < 54 is impossible, so the seed-13 run must have had a bug",
          correct: false,
          feedback: "56 is more than 54, not less; and it is entirely possible: a lucky shuffle can place strong moves early, mimicking a good heuristic for one tree.",
        },
        {
          text: "The comparison is fine, but the conclusion should be that the heuristic is bad",
          correct: false,
          feedback: "The heuristic beat the random MEAN by 31% and never varies — on a five-empty toy. Generalizing either way from one seed is the flaw, and the fix is measurement discipline.",
        },
        {
          text: "Random ordering is actually better because it avoids systematic bias",
          correct: false,
          feedback: "Systematic 'bias' toward strong moves is exactly what you want — the window is not a statistician, it wants the best child first. Bias toward good play IS the heuristic.",
        },
      ],
      solution:
        "Judging a randomized algorithm by one draw mistakes a distribution for a constant. Report seeds and means: random cost 56-102 visits (mean 78.2) versus the heuristic's stable 54 — cheaper on average and reproducible.",
      explanation:
        "Every ordering claim in this part should be held to the same standard the program models: fixed seeds, a table of runs, the mean. One number is a story; the distribution is the evidence.",
      concepts: ["pruning dividend", "measurement"],
    },
    {
      kind: "exercise",
      id: "b-06-e2",
      exerciseKind: "trace",
      prompt:
        "A MAX root has two MIN children. B's leaves are 5 and 3; C's leaves are 4, 6 and 2 (left to right as listed). Run alpha-beta twice: (a) every MIN's leaves in ASCENDING order (B: 3, 5 — C: 2, 4, 6); (b) DESCENDING (B: 5, 3 — C: 6, 4, 2). Count visits (every call, root included; cut nodes stop the moment the window closes) and give both totals and the root value each time.",
      solution:
        "(a) Root (1 visit) calls B first: empty window, both leaves visited — B = min(3, 5) = 3, so B costs 3 visits. Root's α = 3. C runs with α = 3: first leaf 2 → v = 2, β = 2 ≤ α = 3, cut — C costs 2 visits (itself and one leaf). Total: 1 + 3 + 2 = 6 visits, root value 3 via B. (b) B again costs 3 (first child of the root can never be cut — the window is empty): leaves 5 then 3, value 3. C with α = 3: leaf 6 → β = 6, live; leaf 4 → β = 4, still live; leaf 2 → value settles at 2, all three leaves paid — C costs 4. Total: 1 + 3 + 4 = 8 visits, root value 3 via B. Ordering changed the bill by a third; the answer did not move.",
      explanation:
        "Two morals in one tree: the first child of the root is ordering-proof (empty window), and the MIN sibling's fate is decided by how early its smallest leaf appears. Ascending order at MIN nodes is perfect ordering from MAX's point of view — the cut arrives after one leaf.",
      concepts: ["move ordering", "alpha-beta pruning", "trace"],
    },
    {
      kind: "exercise",
      id: "b-06-e3",
      exerciseKind: "predict-output",
      prompt: `Perfect ordering makes the effective branching factor the square root of the raw one. For a game with branching factor b = 3 and depth m = 5, compute both sides of that claim by running:

\`\`\`
print(round(243 ** (1 / 5), 1))
print(round(3 ** 0.5, 2))
\`\`\`

(243 = 3^5 is the leaf count of a full b = 3, m = 5 tree.) Type the two printed lines.`,
      expectedOutput: `3.0
1.73`,
      solution: `243 ** (1/5) is 3 — the raw branching factor recovered from the full tree's leaf count (the measured minimax run agreed: 2.99). 3 ** 0.5 is 1.73: the perfect-ordering target for b = 3. The measured heuristic landed at 2.22 — between the extremes, closer to the floor than to the ceiling.`,
      explanation:
        "The effective branching factor is the instrument for dividends: take visits^(1/plies), compare against raw b (the ceiling, no cuts) and √b (the floor, perfect ordering). Position every ordering claim on that line.",
      concepts: ["effective branching factor", "best-first ordering"],
    },
  ],
  terms: [
    {
      term: "move ordering",
      definition: "The sequence in which a node's children are searched; it cannot change alpha-beta's answer, only how much of the tree must be paid for.",
    },
    {
      term: "best-first ordering",
      definition: "Searching each node's true best child first — unattainable in general (that is the answer you are computing), approximated by heuristics; yields the O(b^(m/2)) bound.",
    },
    {
      term: "pruning dividend",
      definition: "The node savings alpha-beta returns, expressed against the minimax baseline; a pure function of ordering quality from 0% (worst order) to roughly a square root (perfect order).",
    },
    {
      term: "effective branching factor",
      definition: "visits^(1/plies) — the per-ply cost of a search expressed as the branching of an equivalent uniform tree, making searches of different depths and orderings comparable.",
    },
  ],
  mistakes: [
    {
      mistake: "Judging an ordering heuristic from a single run (or a single seed).",
      why: "Random variation swamps small differences — seed 13 looked heuristic-grade (56 visits) while seed 15 paid 102. One number cannot tell skill from luck.",
      fix: "Fixed seeds, a table of runs, the mean — the discipline the lesson's program models. Then compare means and note stability as its own virtue.",
    },
    {
      mistake: "Assuming the first child of the root should be pruned, or 'fixing' the engine when it is not.",
      why: "The first child always runs with an empty window — there is nothing to cut against. Beginners see it searched in full and suspect the cut logic is broken.",
      fix: "Cuts are only ever possible for a node whose parent's window is already armed by an earlier sibling. Expect the first child to run to completion, always.",
    },
    {
      mistake: "Ordering moves by human aesthetics and never measuring.",
      why: "A plausible-looking order that is wrong about which moves are strong silently costs most of the dividend — you pay for the sort AND the visits.",
      fix: "Measure effective branching factor against raw b and √b. If your pet ordering does not move the number, drop it; if it moves the VALUE, you have a window bug (b-05's invariance is a free fuzz test).",
    },
  ],
  takeaways: [
    "The window closes from the left: the first child searched sets the bar all its siblings are cut against — order the strong moves first and the tree thins itself.",
    "Perfect ordering bounds alpha-beta at O(b^(m/2)) leaves — double the depth on the same budget; random ordering pays about O(b^(3m/4)).",
    "Measured on one position: 238 visits (minimax) → 78.2 mean (random) → 54 (centre-corners-edges) — same value +1 every time; ordering bought a 4.4x cut in work over baseline.",
    "Effective branching factor — visits^(1/plies) — is the honest currency: 2.99 raw, 2.22 achieved, 1.73 the √3 ideal.",
    "Real engines manufacture orderings with iterative deepening (yesterday's search orders today's), killer moves and history — cheap guesses capturing most of the square root.",
  ],
  quiz: [
    {
      id: "b-06-q1",
      prompt:
        "Why can no cut ever occur inside the FIRST child of the root, no matter how the moves are ordered?",
      options: [
        {
          text: "The first child is searched with the empty window α = −∞, β = +∞ — there is no bar for any value to cross, so its subtree runs to completion and its value arms the window for the siblings",
          correct: true,
          feedback: "Correct — the first child is the price of information: its full value is what makes every later cut possible. Ordering helps everywhere EXCEPT inside it.",
        },
        {
          text: "Because the first child is always the best move",
          correct: false,
          feedback: "Best-first ordering makes it LIKELY the strongest, but 'always' is wrong — and even a weak first child still runs to completion on an empty window.",
        },
        {
          text: "Because cuts are only implemented for MIN nodes",
          correct: false,
          feedback: "Both node kinds cut (β-cut at MAX levels, α-cut at MIN levels, in this lesson's naming from b-05) — but only when the inherited window is already narrowed.",
        },
        {
          text: "The root's first child IS sometimes cut — that is what seed 15's extra cost shows",
          correct: false,
          feedback: "Seed 15 paid 102 because ordering was bad DEEPER in the tree, not because the first child got cut — that cannot happen.",
        },
      ],
      explanation:
        "Empty window, no cuts: the first child of every node pays full price, and its returned value is precisely what arms the cuts for its siblings. Ordering is the art of choosing who goes first.",
    },
    {
      id: "b-06-q2",
      prompt:
        "The heuristic run visited 54 nodes over 5 plies. What does the effective branching factor 54^(1/5) ≈ 2.22 actually tell you?",
      options: [
        {
          text: "That this search costs the same as searching a uniform tree of depth 5 with branching 2.22 — a depth-independent way to compare it against the raw 3.0 and the perfect-ordering ideal 1.73",
          correct: true,
          feedback: "Correct — ebf converts visits into a per-ply price, so you can say 'ordering moved us from b = 3.0 to b = 2.22, target 1.73' without re-deriving anything about this particular tree.",
        },
        {
          text: "That the engine examined 2.22 moves at each node on average",
          correct: false,
          feedback: "Close in spirit but wrong in detail: ebf is the branching of an EQUIVALENT uniform tree, not an average over nodes — some nodes ran to completion, others cut after one child.",
        },
        {
          text: "That the heuristic ordering is within 22% of perfect",
          correct: false,
          feedback: "The distance from 2.22 to 1.73 is not 22%, and ebf is not a linear quality scale — compare costs, not ratios of ebf.",
        },
        {
          text: "Nothing — ebf is only meaningful for minimax, not alpha-beta",
          correct: false,
          feedback: "The whole point of ebf is comparing pruned searches; minimax's ebf is just the raw b (2.99 here — the measurement confirms it).",
        },
      ],
      explanation:
        "Effective branching factor is the field's standard scoreboard: raw b is the ceiling, √b the perfect-ordering floor, and every ordering heuristic lands somewhere between — 2.22 in this run.",
    },
    {
      id: "b-06-q3",
      prompt: "Iterative deepening orders the depth-d search using the results of the depth-(d−1) search. Why does this not just waste the re-searching?",
      options: [
        {
          text: "The shallower searches are a geometric series dominated by the deepest iteration, while the inherited ordering cuts the deepest iteration's cost dramatically — the savings routinely exceed the repetition",
          correct: true,
          feedback: "Correct — re-solving depth 1..d−1 costs roughly the same as ONE extra branching factor's worth of the final iteration, and a good ordering saves far more than that. Plus: a time-controlled engine for free.",
        },
        {
          text: "It does waste work — that is why strong engines search each depth exactly once",
          correct: false,
          feedback: "Tournament engines are literally called iterative-deepening alpha-beta engines. The repetition is the cheapest price ever paid for a good ordering.",
        },
        {
          text: "The re-searching is free because shallower trees fit in cache",
          correct: false,
          feedback: "Caching helps the constant, not the argument — the case rests on the geometric series and the ordering dividend, not on hardware.",
        },
        {
          text: "Iterative deepening is only for time control, not ordering",
          correct: false,
          feedback: "It does deliver graceful time control, but its economic engine is the ordering: the previous iteration's principal variation is the best cheap guess of the next iteration's best moves.",
        },
      ],
      explanation:
        "Repeat shallow, order deep: the deepest iteration dominates the bill, and the ordering it inherits from d−1 is what turns that bill into a fraction of its unordered size.",
    },
  ],
};
