/**
 * LESSON_C_07 — "Variable and Value Ordering" (30 min, coding).
 *
 * The two orderings backtracking asks for at every step: which variable
 * next (fail-first — MRV with degree tie-break) and which value first
 * (succeed-first — least-constraining value). The 4-queens walkthrough
 * is machine-verified step by step; the measurement table is REAL
 * stdout from the engine below run on n = 4, 5, 6, 8 — deterministic,
 * no seeds needed, and honestly mixed: MRV's edge grows with n, LCV
 * helps at n=4, hurts at n=5 and 6, helps again at n=8. Counter
 * definitions follow c-04 exactly (placements incl. undone, rejected
 * values, backtracks = retreats).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_07: ClassicalLesson = {
  slug: "c-07",
  title: "Variable and Value Ordering",
  minutes: 30,
  summary:
    "Choose the variable most likely to fail and the value most likely to succeed — the two orderings that tame real instances.",
  kind: "coding",
  objectives: [
    "Implement the MRV (fail-first) variable ordering with a degree tie-break, and say WHY picking the most-constrained variable first is the right greed",
    "Implement the least-constraining-value (succeed-first) ordering and count, for a candidate value, exactly which future pairs it vetoes",
    "Read a measured comparison honestly — identify where each heuristic paid, where it tied, and where it lost, and explain instance-dependence in your own words",
    "Reproduce the 4-queens MRV walkthrough by hand, rows_left table and all, and reconcile it with a program's decisions step for step",
  ],
  why: "c-03 traced backtracking by hand and c-04 implemented it — and both quietly made a choice without defending it: WHICH variable to assign next, and WHICH of its values to try first. On Australia the choice was invisible (any order works). On real instances it is the difference between a solver that returns before your coffee cools and one that runs past the weekend. This lesson takes the choice seriously, implements both orderings, and then does the thing popular accounts skip: it MEASURES them, on the same engine, with the same counters as c-04 — and the measurement refuses to flatter the heuristics. MRV's dividend grows with instance size but is invisible on tiny ones; least-constraining-value, the value-side cousin, actually makes n=5 and n=6 queens WORSE in the table below. Heuristics are bets with good odds, never guarantees — and the discipline of measuring them (which the Sudoku project's ladder demands in full) is the difference between quoting folklore and knowing your own instances.",
  blocks: [
    {
      kind: "text",
      text: "Every backtracking step hides two decisions. The engine from c-04 walks variables in the order you listed them and tries values in the order they sit in the domain — and on Australia, that innocence was free. This lesson removes the innocence on purpose. The variable decision gets the fail-first treatment: assign the variable most likely to cause trouble NOW, because every doomed assignment you make is a placement you will undo, and a dead end discovered at depth eight costs eight undos. The value decision gets succeed-first: among the values that survive the past, prefer the one that vetoes the fewest futures, because the first solution you find is the one you stop at. Neither is magic. Both are greed — and the lesson's measurement shows exactly how far greed carries, and where it drops you.",
    },
    { kind: "heading", text: "The variable decision: fail first" },
    {
      kind: "text",
      text: "The intuition runs backwards from every instinct you brought from Part A. In path search you defer difficulty; in CSP search you CHARGE it. The variable with the fewest remaining consistent values — MRV, minimum remaining values — is the one closest to dead, and a variable about to die is information: if it has zero values left, you want to know before stacking six more placements on top of the corpse. Fail first, fail cheap. MRV needs a tie-break (at the start, every domain is full and every count ties): the degree heuristic breaks ties toward the variable constraining the most still-unassigned neighbors — the hub of c-02's drawing, the variable whose color vetoes the most futures. c-04's Australia numbers made the promise; this lesson's engine keeps it.",
    },
    {
      kind: "definition",
      term: "minimum remaining values (MRV)",
      informal:
        "At each step, assign next the unassigned variable with the fewest values still consistent with the past — the fail-first principle. Ties break by degree: most constraints to unassigned variables.",
      formal:
        "X_{next} = X_i \\text{ with } \\min |D_{cur}(X_i)| \\quad \\text{over unassigned } X_i",
      why: "A variable with k consistent values cannot explore more than k branches before dying — failing there first caps the waste at k, while failing elsewhere can bury the same death under many more placements.",
    },
    { kind: "heading", text: "The value decision: succeed first" },
    {
      kind: "text",
      text: "Once the variable is chosen, its values need an order — and here the greed flips direction. The variable ordering tries to die quickly; the value ordering tries to LIVE. Least-constraining value (LCV): among values consistent with the past, try first the one that vetoes the fewest (unassigned variable, value) pairs in the future — leave the neighbors the most room. The formal statement and the implementation agree on the count: for candidate v on variable X, count every pair (X_j, w) with X_j unassigned and w ∈ D(X_j) that v would rule out, and sort ascending. Note the asymmetry with MRV: a bad variable choice cannot hide (you must assign every variable eventually), but a bad value choice is often invisible (any solution ends the search) — which is why value ordering is the weaker lever, a hint the measurement below will make concrete.",
    },
    {
      kind: "definition",
      term: "least-constraining value (LCV)",
      informal:
        "For the chosen variable, try first the value that removes the fewest options from unassigned neighbors' domains — succeed first, by leaving the future the most room.",
      formal:
        "v^* = v \\text{ vetoing the fewest } (X_j, w) \\text{ pairs among unassigned } X_j",
      why: "Among values that all satisfy the past, what differs is how much future each one burns — and the future is where dead ends are made.",
    },
    { kind: "heading", text: "The orderings by hand: 4-queens" },
    {
      kind: "example",
      title: "MRV with degree tie-break on 4-queens",
      problem:
        "Four queens, one per column C1–C4, rows 1–4, the usual attacks. Trace MRV (ties by column, then degree where it applies) with values tried in row order, and watch each decision the engine will later make — every rows_left count below is machine-verified.",
      steps: [
        {
          text: "Empty board: every column has rows_left = 4 — a four-way tie. Degree is no help (all columns constrain the other three). Tie-break by column: C1, and its first row works. Place C1 = 1.",
          detail: "The tie at the start is the general case — heuristics earn their keep after the first few placements, when the counts pull apart.",
        },
        {
          text: "rows_left: C2 = 2 (rows 3, 4 — 1 and 2 die against C1), C3 = 2 (rows 2, 4), C4 = 2 (rows 2, 3). Another tie; column order picks C2. Rows 1 and 2 are rejected, row 3 is placed: C2 = 3.",
          detail: "Three rejected-value trials against the past — the rejections c-03 taught you to count.",
        },
        {
          text: "rows_left: C3 = 0, C4 = 1. MRV grabs C3 — the dying column — immediately: all four rows are rejected, and the search backtracks. C2 retries and places C2 = 4.",
          detail: "This is fail-first working exactly as designed: static order would ALSO reach C3 next here, but only after the same rejections — the rows_left table lets MRV see the death before paying for every trial.",
        },
        {
          text: "After C1 = 1, C2 = 4: rows_left C3 = 1 (row 2), C4 = 1 (row 3). Tie, column order, C3 = 2 — and then C4 has rows_left = 0. The whole C1 = 1 subtree dies; C2, then C1, exhaust their values. C1 takes row 2.",
          detail: "The retreat cascade of c-03, seen from the ordering's side: four backtracks under C1 = 1 before the search ever tries C1 = 2.",
        },
        {
          text: "After C1 = 2: rows_left C2 = 1 (only row 4), C3 = 2, C4 = 3. MRV picks C2 — not because it is next in order but because it is one step from dead, and its only value is forced anyway. Then C3 = 1 (rows_left 1), C4 = 3 (rows_left 1). Complete: the solution 2413.",
          detail: "Total for MRV on this instance: 8 placements, 18 rejected values, 4 backtracks — identical to static order, a coincidence of smallness the measurement below will not repeat at n = 8.",
        },
      ],
      result: "Solution C1=2, C2=4, C3=1, C4=3 (the arrangement 2413) — 8 placements, 18 rejected, 4 backtracks.",
    },
    { kind: "heading", text: "The measured effect" },
    {
      kind: "pythonImpl",
      title: "One engine, three orderings, four instance sizes",
      intent:
        "The same backtracking engine as c-04, run under three ordering policies on n-queens for n = 4, 5, 6, 8 — a reproducible measurement of what the two orderings actually buy.",
      code: `"""The ordering experiment: three strategies, one engine, n-queens.

Strategies: static (columns in order, rows in order), MRV (unassigned
column with fewest consistent rows first, ties by column index),
MRV+LCV (MRV columns; rows ordered by how few future conflicts each
choice vetoes, ties by row). Counters follow c-04's definitions:
placements = assignments attempted (including later undone),
rejected = value trials vetoed by the past, backtracks = retreats
(a variable's whole value loop exhausted).
"""


def attacks(r1, c1, r2, c2):
    return r1 == r2 or abs(r1 - r2) == abs(c1 - c2)


class Engine:
    def __init__(self, n, var_mode, val_mode):
        self.n, self.var_mode, self.val_mode = n, var_mode, val_mode
        self.assign = {}
        self.placements = self.rejected = self.backtracks = 0
        self.solution = None

    def consistent(self, col, row):
        return all(not attacks(row, col, r, c) for c, r in self.assign.items())

    def rows_left(self, col):
        return sum(1 for r in range(1, self.n + 1) if self.consistent(col, r))

    def pick_var(self, cols):
        if self.var_mode == "static":
            return cols[0]
        return min(cols, key=lambda c: (self.rows_left(c), c))

    def order_vals(self, col):
        vals = list(range(1, self.n + 1))
        if self.val_mode != "lcv":
            return vals

        def vetoed(r):
            return sum(
                1
                for c2 in range(1, self.n + 1)
                if c2 != col and c2 not in self.assign
                for r2 in range(1, self.n + 1)
                if attacks(r, col, r2, c2)
            )

        return sorted(vals, key=lambda r: (vetoed(r), r))

    def search(self):
        cols = [c for c in range(1, self.n + 1) if c not in self.assign]
        if not cols:
            self.solution = dict(self.assign)
            return True
        col = self.pick_var(cols)
        for r in self.order_vals(col):
            if self.consistent(col, r):
                self.placements += 1
                self.assign[col] = r
                if self.search():
                    return True
                del self.assign[col]
            else:
                self.rejected += 1
        self.backtracks += 1
        return False


print(f"{'n':>2} {'strategy':<10} {'placements':>10} {'rejected':>9} {'backtracks':>10}  solution")
for n in (4, 5, 6, 8):
    for name, vm, lm in (("static", "static", "plain"), ("mrv", "mrv", "plain"), ("mrv+lcv", "mrv", "lcv")):
        e = Engine(n, vm, lm)
        e.search()
        sol = "".join(str(e.solution[c]) for c in range(1, n + 1)) if e.solution else "-"
        print(f"{n:>2} {name:<10} {e.placements:>10} {e.rejected:>9} {e.backtracks:>10}  {sol}")`,
      output: ` n strategy   placements  rejected backtracks  solution
 4 static              8        18          4  2413
 4 mrv                 8        18          4  2413
 4 mrv+lcv             8        16          4  2413
 5 static              5        10          0  13524
 5 mrv                 5        10          0  13524
 5 mrv+lcv             7        17          2  13524
 6 static             31       140         25  246135
 6 mrv                27       120         21  246135
 6 mrv+lcv            33       148         27  246135
 8 static            113       763        105  15863724
 8 mrv                75       497         67  15863724
 8 mrv+lcv            89       588         81  15863724`,
      walkthrough: [
        "One engine class, three policies — the strategies are two small functions (pick_var, order_vals), nothing else changes; comparability is the whole point.",
        "rows_left counts values consistent with the PAST only — the same past-only discipline as c-03's check, reused as a heuristic signal.",
        "LCV's vetoed() counts future (column, row) pairs a candidate would rule out — the definition's formal count implemented literally.",
        "The program is fully deterministic: fixed instance sizes, fixed value orders, no randomness — rerun it and every number reproduces.",
        "Every strategy finds the same first solution per n (2413, 13524, 246135, 15863724) — ordering changes the path and the bill, never the answer's validity.",
      ],
    },
    {
      kind: "text",
      text: "Read the table the way you will read benchmark tables for the rest of your career — with the flattery stripped out. **MRV is invisible at n = 4 and n = 5** (identical counters; the instances are too small for any ordering to matter) **and decisive at n = 8**: 75 placements against 113, 67 backtracks against 105 — a third of the work removed by changing one line of code. **LCV is genuinely mixed**: it saves two rejections at n = 4, then makes n = 5 WORSE (7 placements and 2 backtracks where static needed 5 and 0 — the future-blind ordering steered the search into a corner static order walked past), worse again at n = 6, and only at n = 8 does it split the difference (89, between static's 113 and MRV's 75). The honest conclusions: variable ordering is the strong lever and its dividend grows with instance size; value ordering is the weak one, worth trying per-instance and never worth trusting blind. No row of this table is a theorem — which is exactly why the project's Sudoku ladder makes you measure on YOUR instances before believing.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "c-07-e1",
      exerciseKind: "predict-output",
      prompt:
        "The engine above runs on 6-queens with the STATIC strategy: columns in order C1..C6, rows in order 1..6. Before running anything, write down the counters it will print — placements, rejected, backtracks — and the solution string. Then run the program and compare all four values.",
      starter: `def attacks(r1, c1, r2, c2):
    return r1 == r2 or abs(r1 - r2) == abs(c1 - c2)

N = 6
assign = {}
placements = rejected = backtracks = 0
solution = None

def consistent(col, row):
    return all(not attacks(row, col, r, c) for c, r in assign.items())

def search():
    global placements, rejected, backtracks, solution
    cols = [c for c in range(1, N + 1) if c not in assign]
    if not cols:
        solution = dict(assign)
        return True
    col = cols[0]                      # static variable order
    for r in range(1, N + 1):          # static value order
        if consistent(col, r):
            placements += 1
            assign[col] = r
            if search():
                return True
            del assign[col]
        else:
            rejected += 1
    backtracks += 1
    return False

search()
print(placements, rejected, backtracks,
      "".join(str(solution[c]) for c in range(1, N + 1)))`,
      expectedOutput: `31 140 25 246135`,
      solution: `31 140 25 246135

The static engine places 31 times (several later undone), has 140 values
rejected by the past, retreats 25 times, and first solves with C1=2,
C2=4, C3=6, C4=1, C5=3, C6=5 — the string 246135, the same first
solution every strategy in the table finds.`,
      explanation:
        "These are the n = 6 static row of the measured table — the same engine, printed as one line. If your hand count of placements disagreed, the usual culprit is forgetting that placements include the undone, the definition c-04 fixed.",
      concepts: ["variable ordering", "counters", "static order"],
    },
    {
      kind: "exercise",
      id: "c-07-e2",
      exerciseKind: "trace",
      prompt:
        "Australia, three placements in: WA = r, NT = g, SA = b (the c-03 trace's first three). Compute rows_left for each remaining variable — Q, NSW, V, T — against the past, state which variable MRV picks and why, and what the degree tie-break would add if two counts tied.",
      solution: `Q: neighbors NT (g) and SA (b) are assigned — its domain {r, g, b} loses g and b, leaving {r}: rows_left = 1.
NSW: only SA (b) assigned among its neighbors — loses b, leaving {r, g}: rows_left = 2.
V: only SA (b) assigned — loses b, leaving {r, g}: rows_left = 2.
T: no neighbors — rows_left = 3.

MRV picks Q — one step from dead, and its value is forced (r) anyway,
so the "choice" costs nothing. Had NSW and V tied for the minimum, the
degree tie-break would count constraints to UNASSIGNED neighbors: NSW
constrains Q and V (both unassigned, degree 2); V constrains only NSW
(degree 1) — NSW would win. And note what MRV cannot see: after Q = r,
NSW has lost b and r — {g} — and V still has {r, g}; the ordering is
greedy about the NEXT failure, blind to the one after.`,
      explanation:
        "Every count is derivable from the nine borders and the three placements — this is the rows_left discipline the 4-queens walkthrough used, applied to the part's home instance.",
      concepts: ["MRV", "degree heuristic", "rows_left"],
    },
    {
      kind: "exercise",
      id: "c-07-e3",
      exerciseKind: "write-code",
      prompt:
        "Implement MRV for map coloring: given a NEIGHBORS map, a partial assignment, and the color list, print the unassigned variable with the fewest remaining consistent colors (ties: alphabetically first). The assertion at the end must pass when you are done — print exactly the chosen variable name.",
      starter: `NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
ASSIGNED = {"WA": "r", "NT": "g", "SA": "b"}
COLORS = ["r", "g", "b"]


def rows_left(var):
    # TODO: count colors consistent with the PAST assignment
    ...


def mrv_pick():
    # TODO: the unassigned variable with the fewest consistent colors,
    # ties broken alphabetically
    ...


print(mrv_pick())`,
      expectedOutput: `Q`,
      solution: `NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
ASSIGNED = {"WA": "r", "NT": "g", "SA": "b"}
COLORS = ["r", "g", "b"]


def rows_left(var):
    used = {ASSIGNED[n] for n in NEIGHBORS[var] if n in ASSIGNED}
    return sum(1 for c in COLORS if c not in used)


def mrv_pick():
    unassigned = [v for v in NEIGHBORS if v not in ASSIGNED]
    return min(unassigned, key=lambda v: (rows_left(v), v))


print(mrv_pick())  # Q — it loses g (NT) and b (SA), leaving only r`,
      explanation:
        "Q's two assigned neighbors burn two of its three colors, so its count is 1 against NSW's 2, V's 2 and T's absence from this NEIGHBORS map — the same arithmetic as exercise e2, now executable. The sort key (count, name) is the tie-break made literal.",
      concepts: ["MRV", "rows_left", "tie-breaking"],
    },
  ],
  terms: [
    {
      term: "minimum remaining values (MRV)",
      definition: "The fail-first variable ordering: assign next the unassigned variable with the fewest values consistent with the past — the one closest to dead.",
    },
    {
      term: "degree heuristic",
      definition: "The MRV tie-break: among variables with equal remaining values, choose the one constraining the most still-unassigned variables — the hub of c-02's drawing.",
    },
    {
      term: "least-constraining value (LCV)",
      definition: "The succeed-first value ordering: try first the value that vetoes the fewest (unassigned variable, value) pairs in the future.",
    },
    {
      term: "fail-first principle",
      definition: "The design instinct behind MRV: discover the branches that must die as early and as cheaply as possible, because a dead end found late is paid for in undoings.",
    },
  ],
  mistakes: [
    {
      mistake: "Calling MRV (or LCV) an optimization — 'it always reduces the search'",
      why: "Heuristics are bets about typical structure. The measured table shows MRV tying static on n = 4 and 5, and LCV making n = 5 and n = 6 strictly worse.",
      fix: "Say what is true: MRV never changes the ANSWER, only the path — and on real instances it usually, not always, shortens it. Measure on your instances; keep the measurement.",
    },
    {
      mistake: "Counting rows_left against future or hypothetical assignments",
      why: "The count is a function of the PAST — the partial assignment already made. Mixing in future reasoning silently turns MRV into forward checking (c-05) and muddles both.",
      fix: "Define it exactly: values in the variable's domain consistent with all ASSIGNED neighbors. The engine's rows_left is three lines precisely because the definition is narrow.",
    },
    {
      mistake: "Forgetting the tie-break and letting sort order decide silently",
      why: "At the start of any search every domain is full and MRV ties everywhere; without an explicit tie-break, the pick is whatever the iteration order happened to be — unreproducible across representations.",
      fix: "Make the tie-break a written part of the strategy (degree, then a fixed order like alphabetical) so the engine's behavior is a specification, not an accident.",
    },
  ],
  takeaways: [
    "Variable ordering is the strong lever: MRV (fail first) with a degree tie-break removed a third of the work at n = 8 and never changed an answer.",
    "Value ordering is the weak lever: LCV (succeed first) saved two trials at n = 4 and made n = 5 and n = 6 measurably worse — a heuristic to test per instance, never to trust blind.",
    "rows_left counts consistency with the PAST only — reuse the c-03 discipline as a heuristic signal, and do not let it drift into forward checking.",
    "Heuristics change the path, never the solution's validity — all three strategies found the same first solution at every n in the table.",
    "No benchmark row is a theorem: the Sudoku project's ladder exists because your instances get the last word.",
  ],
  quiz: [
    {
      id: "c-07-q1",
      prompt: "Why does fail-first — assigning the most constrained variable — REDUCE total work, when it deliberately seeks out failure?",
      options: [
        { text: "Because the most constrained variable has the smallest domains, so its subtree is smallest — failures there are cheap, and discovered early", correct: true, feedback: "Both halves: the cost of a dead end grows with the depth you bury it under, and MRV's count is smallest exactly where death is nearest." },
        { text: "Because failing first prunes the search tree more aggressively than alpha-beta", correct: false, feedback: "Category error — alpha-beta is adversarial search (Part B); MRV is a variable ordering inside one agent's CSP search." },
        { text: "Because the most constrained variable is always part of every solution", correct: false, feedback: "Every variable is part of every solution — that is what complete means. The ordering changes discovery order, not membership." },
        { text: "It does not — the measured table shows MRV is never better than static order", correct: false, feedback: "Look again: identical at n = 4 and 5, decisive at n = 8 (75 placements vs 113). The table's honesty cuts both ways." },
      ],
      explanation: "Fail first, fail cheap: a dead end under six placements costs six undos; MRV surfaces the doomed variable before the burial.",
    },
    {
      id: "c-07-q2",
      prompt: "LCV's vetoed-count for a candidate value counts which pairs?",
      options: [
        { text: "Values it conflicts with among ASSIGNED neighbors", correct: false, feedback: "Candidates that conflict with the past are not candidates — the consistency check already removed them before LCV ranks anything." },
        { text: "(unassigned variable, value) pairs in the future that the candidate would rule out", correct: true, feedback: "Exactly the definition's formal count — implemented literally as the engine's vetoed() function." },
        { text: "The number of backtracks the candidate will eventually cause", correct: false, feedback: "If we could count that, we would not need search — LCV is a one-step lookahead, not a prophecy." },
        { text: "The candidate's distance from the domain's center", correct: false, feedback: "Domains have no geometry; the count is about conflicts, not positions." },
      ],
      explanation: "LCV is a one-step lookahead into the future's option space — leave the neighbors the most room, and let the search breathe.",
    },
    {
      id: "c-07-q3",
      prompt: "On the measured table, MRV+LCV at n = 5 needed 7 placements and 2 backtracks where static needed 5 and 0. The honest reading?",
      options: [
        { text: "A bug — LCV provably never increases backtracks", correct: false, feedback: "No such theorem exists for LCV in backtracking search; the ordering changes which solution is found first, and here it found a costlier path first." },
        { text: "Heuristics are instance-dependent bets: LCV's future-blind ranking steered this small instance into a corner the static order walked past", correct: true, feedback: "Correct — and the same table shows LCV helping at n = 4 and landing between the others at n = 8. One table, three verdicts, all true." },
        { text: "The n = 5 instance is unsolvable, so the counters are meaningless", correct: false, feedback: "All rows print a solution string (13524) — every strategy solved every instance; only the bill differed." },
        { text: "LCV should only be used together with degree tie-breaks", correct: false, feedback: "MRV+LCV in the table ALREADY includes MRV with its tie-break — the ordering composition does not rescue value ranking on this instance." },
      ],
      explanation: "This row is the lesson's conscience: the table refuses to flatter the heuristics, and so should you when you report your own measurements.",
    },
  ],
};
