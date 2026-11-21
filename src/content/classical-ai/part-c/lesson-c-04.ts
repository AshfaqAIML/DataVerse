/**
 * LESSON_C_04 — "Implementing Backtracking" (35 min, coding).
 *
 * The coded counterpart of c-03's hand traces: one GENERAL engine — a
 * CSP arrives as four pieces of data (variables, domains, a neighbors
 * map, a constraint predicate) and the variable order as a policy
 * parameter — instrumented with the three counters c-03 fixed. Plain
 * WA-first Australia reproduces 7/4/0 number for number; the sink-first
 * schedule reproduces 6/9/3; MRV + degree from the empty assignment
 * picks SA first (the seven-way tie at 3, broken by degree 5) and pays
 * 7/8/0 — the honest small print on an easy instance, measured and
 * owned. Every output below is REAL stdout: 7/4/0, 6/9/3, picks
 * SA NT Q NSW WA V T with 7/8/0, and the exercises' one-swap 8/6/1
 * (c-03's e2, re-measured by this engine).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_04: ClassicalLesson = {
  slug: "c-04",
  title: "Implementing Backtracking",
  minutes: 35,
  summary:
    "A general CSP solver in Python: representation, consistency checks, and the MRV and degree heuristics.",
  kind: "coding",
  objectives: [
    "Represent any CSP as four pieces of data — variables, domains, a neighbors map, a binary constraint predicate — and defend the separation: the engine interprets none of them",
    "Implement recursive backtracking with the three counters — placements (including later undone), rejected values, retreats — and reconcile its stdout with c-03's hand traces number for number",
    "Implement MRV with the degree tie-break as an order policy on the same engine, and compute by hand why the empty assignment's first pick is SA",
    "Read the O(d^n) worst case against the measured counters and say what the gap consists of — the past-only check, the order, and the instance's ease",
  ],
  why: "c-03 left you keeping counters by hand — honest work, but once a trace passes a dozen moves the hand is the least reliable instrument in the room, and every number in the rest of Part C is about to depend on these. This lesson you write the program that keeps them, and the program is deliberately general: a CSP arrives as four pieces of data — variables, domains, a neighbors map, a constraint predicate — and the variable order arrives as a parameter, so the engine that colors Australia also schedules jobs without changing a line. That architecture is not elegance for its own sake; it is the load-bearing plan for the whole part: c-05 bolts propagation onto the placement, c-06 runs it to a fixpoint, and c-07 swaps the order policy on this very engine, measuring MRV and least-constraining value with the same three counters you instrument today. And because this course refuses to quote folklore, the lesson also shows the small print: on Australia, MRV plus degree buys nothing — 7/8/0 against the lucky order's 7/4/0 — because the instance has no dead ends for fail-first to find early. The dividend is real but it lives on harder instances, and you will see it measured, not asserted.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Lesson c-03 ended with two hand traces and a promise — that a program would reproduce them number for number: seven placements, four rejections, zero retreats on Australia; six, nine and three on the schedule. This lesson is that program, and it is deliberately more than a script that prints two answers. You will build a *general* solver — one that receives a constraint network as four pieces of data and a variable order as a parameter, and that knows nothing about maps, machines or jobs. That ignorance is the engineering: write the engine once, instrument it honestly, and every improvement in the rest of Part C becomes a swap — c-05 changes what happens after a placement, c-06 changes the domains between placements, and c-07 replaces this lesson's order policy on this very engine, counters and all. The counters themselves are the course's measurement system, so their definitions are fixed here once and never move again: **placements** counts assignments attempted, *including the ones later undone*; **rejected** counts value trials the past has vetoed; **retreats** counts value-loop exhaustions. Run the engine, and watch c-03's hand work come back as stdout, digit for digit.",
    },

    // ------------------------------------------------------------ representation
    { kind: "heading", text: "A solver that knows nothing about maps" },
    {
      kind: "text",
      text: "A CSP reaches this engine as data, never as code — four pieces, and the engine interprets none of them. A list of **variables**. A **domains** map, one value list per variable. A **neighbors** map naming each variable's constraint partners — a variable with no entry constrains nothing, which is how Tasmania, the island of c-02's drawing, is represented. And a **constraint predicate**: a function `constraint(x, vx, y, vy)` that says whether value `vx` for `x` agrees with value `vy` for `y`. Australia is seven names, `{r, g, b}` apiece, the nine borders, and the one-line predicate `vx != vy`. The three-job schedule is three names, the slots `{1, 2, 3}`, a neighbors map in which every pair is partnered — the machine's no-shared-slot rule binds all pairs — and a predicate that checks the machine plus both precedence directions, `sx + 1 <= sy` for unit jobs. One asymmetry is worth naming before you meet it in code: the neighbors relation is symmetric (partnership), but the constraint it carries may be directional — the predicate sorts out direction itself, so the engine's check keeps one shape. Everything the solver will ever know about a problem lives in these four pieces plus the order policy; everything else is search.",
    },
    {
      kind: "table",
      title: "Two problems, one representation",
      headers: ["Piece of data", "Australia (map coloring)", "Three-job schedule"],
      rows: [
        ["variables", "WA, NT, SA, Q, NSW, V, T", "J1, J2, J3"],
        ["domains", "{r, g, b} for each", "{1, 2, 3} for each"],
        ["neighbors", "the nine borders; T has no entry — the island", "all three pairs — one machine forbids shared slots"],
        ["constraint(x, vx, y, vy)", "vx ≠ vy", "vx ≠ vy (machine); vx + 1 ≤ vy when x ≺ y"],
      ],
      caption:
        "The engine's complete knowledge of either world. Point it at Sudoku, timetabling or circuit layout and you supply four new pieces — the solver never notices the change of universe.",
    },

    // ------------------------------------------------------------ algorithm + policy
    { kind: "heading", text: "Backtracking, written once" },
    {
      kind: "pseudocode",
      title: "BACKTRACK — the whole engine, policy included",
      lines: [
        {
          text: "PROCEDURE BACKTRACK(csp, assignment A, select)",
          indent: 0,
          note: "select is the order policy, passed in — the one hook c-07's heuristics grab",
        },
        { text: "IF every variable in csp is assigned: RETURN A", indent: 1 },
        {
          text: "var ← select(unassigned variables, A)",
          indent: 1,
          note: "c-03's fixed orders and MRV + degree both arrive here, as functions",
        },
        {
          text: "FOR each value v in D[var]:",
          indent: 1,
          note: "domain order is the second, quieter policy — c-07's least-constraining value revisits it",
        },
        {
          text: "IF CONSISTENT(var, v, A):",
          indent: 2,
          tone: "key",
          note: "past-only: assigned neighbors vote, the future is silent — c-03's discipline as one predicate call",
        },
        {
          text: "place var = v in A",
          indent: 3,
          note: "a placement, counted now — even if a later retreat undoes it",
        },
        { text: "IF BACKTRACK(csp, A, select) succeeds: RETURN its result", indent: 3 },
        {
          text: "remove var from A",
          indent: 3,
          note: "the retreat: exactly one placement undone, this value loop resumes",
        },
        { text: "ELSE count v as rejected", indent: 2 },
        {
          text: "RETURN failure",
          indent: 1,
          note: "value loop exhausted — one retreat; at the root, the counted proof that no solution exists",
        },
      ],
      note: "Invariant: A is past-consistent at every moment — every variable holding a value earned it through the check — so any returned A is a solution. Cost: at most O(d^n) value trials (n variables, d values each) before the root exhausts; the recursion needs only O(n) space.",
    },
    {
      kind: "definition",
      term: "minimum remaining values (MRV)",
      informal:
        "The fail-first order policy: assign next the unassigned variable with the fewest domain values still consistent with the past — the variable closest to a dead end. Ties break by the degree heuristic: the most constraints to still-unassigned neighbors, then a fixed order.",
      formal:
        "X_{next} = X_i \\text{ with } \\min |\\{v \\in D_i : v \\text{ consistent with } A\\}| \\text{ over unassigned } X_i",
      why: "A variable with k consistent values cannot fund more than k branches below this node, so failing there first caps the waste — and degree is what decides the opening move, when every count is still d and MRV is silent.",
    },

    // ------------------------------------------------------------ implementation
    { kind: "heading", text: "The engine, run three times" },
    {
      kind: "pythonImpl",
      title: "One engine, two policies, three runs",
      intent:
        "Turn c-03's hand discipline into a general, honestly instrumented engine — then reconcile its stdout with the hand traces and watch MRV + degree choose.",
      code: `"""One general engine, three runs, three counters.

Counter definitions (c-03's, reused by every later lesson):
placements = assignments attempted (INCLUDING later undone);
rejected   = value trials vetoed by the past;
retreats   = value-loop exhaustions (a variable ran out of values).
"""


class CSP:
    """A constraint network as data: the engine interprets none of it."""

    def __init__(self, variables, domains, neighbors, constraint):
        self.variables = variables            # list of names
        self.domains = domains                # name -> list of values
        self.neighbors = neighbors            # name -> constraint partners
        self.constraint = constraint          # (x, vx, y, vy) -> bool

    def consistent(self, var, val, assignment):
        """Past-only check: assigned neighbors vote, the future is silent."""
        return all(
            self.constraint(var, val, n, assignment[n])
            for n in self.neighbors.get(var, [])
            if n in assignment
        )


def solve(csp, select):
    """Depth-first backtracking; select(unassigned, assignment) is the
    order policy. Returns (solution, counters, picks)."""
    counters = {"placements": 0, "rejected": 0, "retreats": 0}
    assignment = {}
    picks = []

    def backtrack():
        unassigned = [v for v in csp.variables if v not in assignment]
        if not unassigned:
            return True
        var = select(unassigned, assignment)
        picks.append(var)
        for val in csp.domains[var]:
            if csp.consistent(var, val, assignment):
                counters["placements"] += 1
                assignment[var] = val
                if backtrack():
                    return True
                del assignment[var]          # the retreat: one placement
            else:
                counters["rejected"] += 1
        counters["retreats"] += 1            # the value loop exhausted
        return False

    solved = backtrack()
    return (dict(assignment) if solved else None, counters, picks)


def in_order(order):
    """The static policy: next unassigned variable in the given order."""
    def select(unassigned, assignment):
        for v in order:
            if v in unassigned:
                return v
    return select


def mrv_with_degree(csp):
    """Fail-first: fewest consistent values, then most unassigned
    neighbors, then listing order — the tie-breaks are part of the spec."""
    def remaining(var, assignment):
        return sum(1 for val in csp.domains[var]
                   if csp.consistent(var, val, assignment))

    def degree(var, assignment):
        return sum(1 for n in csp.neighbors.get(var, [])
                   if n not in assignment)

    def select(unassigned, assignment):
        return min(unassigned,
                   key=lambda v: (remaining(v, assignment),
                                  -degree(v, assignment),
                                  csp.variables.index(v)))
    return select


# ---- instance 1: Australia, exactly as c-03's audit program ----
NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
australia = CSP(
    ["WA", "NT", "SA", "Q", "NSW", "V", "T"],
    {v: ["r", "g", "b"] for v in ["WA", "NT", "SA", "Q", "NSW", "V", "T"]},
    NEIGHBORS,
    lambda x, vx, y, vy: vx != vy,
)

# ---- instance 2: three unit jobs, one machine, J1 < J3 and J2 < J3 ----
PREC = {("J1", "J3"), ("J2", "J3")}
SLOTS = [1, 2, 3]


def jobs_ok(x, sx, y, sy):
    if sx == sy:                            # one machine: no shared slot
        return False
    if (x, y) in PREC and not sx + 1 <= sy:  # unit jobs: x ends before y starts
        return False
    if (y, x) in PREC and not sy + 1 <= sx:
        return False
    return True


schedule = CSP(
    ["J1", "J2", "J3"],
    {j: list(SLOTS) for j in ["J1", "J2", "J3"]},
    {"J1": ["J2", "J3"], "J2": ["J1", "J3"], "J3": ["J1", "J2"]},
    jobs_ok,
)


def report(label, csp, select, show_picks=False):
    solution, counters, picks = solve(csp, select)
    print(f"== {label} ==")
    if show_picks:
        print("picks:", " ".join(picks))
    print("solution:", " ".join(f"{v}={solution[v]}" for v in csp.variables))
    print("placements={placements} rejected={rejected} retreats={retreats}"
          .format(**counters))


report("plain, Australia, order WA NT SA Q NSW V T",
       australia, in_order(["WA", "NT", "SA", "Q", "NSW", "V", "T"]))
report("plain, schedule, order J3 J1 J2",
       schedule, in_order(["J3", "J1", "J2"]))
report("MRV + degree, Australia, empty assignment",
       australia, mrv_with_degree(australia), show_picks=True)`,
      output: `== plain, Australia, order WA NT SA Q NSW V T ==
solution: WA=r NT=g SA=b Q=r NSW=g V=r T=r
placements=7 rejected=4 retreats=0
== plain, schedule, order J3 J1 J2 ==
solution: J1=1 J2=2 J3=3
placements=6 rejected=9 retreats=3
== MRV + degree, Australia, empty assignment ==
picks: SA NT Q NSW WA V T
solution: WA=b NT=g SA=r Q=b NSW=g V=b T=r
placements=7 rejected=8 retreats=0`,
      walkthrough: [
        "`CSP` is four fields and one method, and the method is the engine's entire window onto world knowledge: one predicate call per assigned neighbor. Both instances below are just different constructor arguments — the class never learns what a name means.",
        "`solve` is the pseudocode with the counters wired to the moves: a placement counts the moment a value is tried-and-consistent, kept or later undone; a past-veto counts as rejected; an exhausted value loop counts as a retreat — the root's exhaustion included, which is how c-03's two-color run could end at five.",
        "The order policy is a function argument. `in_order` reproduces c-03's fixed orders; `mrv_with_degree` computes the fail-first pick. Nothing inside `backtrack` knows which is attached — that seam is what c-05, c-06 and c-07 bolt onto.",
        "`remaining` is c-07's rows_left — the count of values consistent with the past — and `degree` counts still-unassigned neighbors. The `min` key (remaining, −degree, listing order) is the whole policy, with its tie-breaks written down as specification, not accident.",
        "Runs (a) and (b) print c-03's hand traces number for number — 7/4/0, then 6/9/3. Run (c) prints its picks so the policy is visible: SA first — the seven-way tie at 3, broken by degree 5 — then the counts pull apart as placements tighten the domains.",
      ],
      project:
        "The engine the Part C project's Sudoku ladder builds on: plain backtracking, MRV + degree and AC-3 run as policies on one solver.",
    },
    {
      kind: "text",
      text: "Reconcile first, interpret second. Run (a) prints `placements=7 rejected=4 retreats=0` — c-03's hand trace, digit for digit — and run (b) prints the schedule's `6/9/3`, retreats and all: the machine agrees with the hand about where every dead end fell and what each one cost. Run (c) is the new instrument. From the empty assignment all seven variables tie at 3 remaining values, so MRV is silent and the degree tie-break decides: SA constrains five still-unassigned neighbors — the hub of c-02's drawing — against NT, Q and NSW at three, WA and V at two, T at zero (the island has no entry). The picks line then shows the policy working: `SA NT Q NSW WA V T`, the counts pulling apart as the assignment tightens — after SA=r and NT=g, Q is one step from dead, and fail-first grabs it immediately. And the counters refuse to flatter the cleverness: **7 placements, 8 rejections, 0 retreats** against the lucky order's 7/4/0 — the same seven placements, no dead ends to avoid, and *twice* the rejections. The honest reading: the hub-first order concentrates assignments so tightly that each late variable's domain is nearly exhausted when its turn comes, and the past-only check re-discovers, one rejected trial at a time, what MRV's count already knew. Australia simply has no doom for fail-first to find early — the dividend lives on harder instances, and c-07 measures it there, not here (at n = 8 queens, MRV cuts the bill to 75 placements against static order's 113). Note also that the two runs landed on different valid colorings — an order changes the path and the first answer found, never the answer's validity. Seven placements against a worst case of 3^7 = 2,187 complete assignments: the honest question is what exactly lives in that gap, and the answer names the rest of Part C.",
    },
    {
      kind: "complexity",
      title: "What the search costs",
      rows: [
        {
          algorithm: "Enumerate-and-test",
          best: "O(n·d^n)",
          average: "O(n·d^n)",
          worst: "O(n·d^n)",
          space: "O(n)",
          note: "build each of the d^n complete assignments and check it whole — the baseline backtracking never pays",
        },
        {
          algorithm: "Backtracking (past-only check)",
          best: "O(n)",
          average: "—",
          worst: "O(d^n)",
          space: "O(n)",
          note: "d = domain size, n = variables. The best case is a first path that walks home — WA-first Australia's seven placements; the worst case pays for the whole tree",
          highlight: true,
        },
      ],
      reading:
        "Two gaps to notice. Between the rows: backtracking never builds an assignment the past has already doomed — the check is what separates O(n·d^n) from a bill the instance, not the space, dictates. Inside the highlighted row: O(n) best against O(d^n) worst, with no distribution-free average in between — the same seven variables priced at 7/4/0 and, under c-03's one-swap order, 8/6/1. That dependence on instance and order is the entire reason the rest of Part C exists.",
    },
    {
      kind: "math",
      title: "The bound, counted",
      displays: [
        { expr: "\\prod_{i=1}^{n} |D_i| \\le d^n", label: "complete assignments" },
        { expr: "O(d^n)", label: "backtracking, worst case" },
        { expr: "3^7 = 2187", label: "Australia, d = 3, n = 7" },
        { expr: "3^3 = 27", label: "the schedule, d = 3, n = 3" },
        { expr: "7 + 4 = 11", label: "value trials, measured (WA-first)" },
      ],
      caption:
        "The product is the honest count — one factor per variable, at most d each — and the tree of partial assignments it seeds holds O(d^n) nodes, so the bound is the same. The measured WA-first run made eleven trials (seven placements, four rejections) where the full tree holds 2,187 leaves; the schedule's sink-first run made fifteen (6 + 9) against 27, and needed three retreats to learn what a better order would have sidestepped. The check's refusal — never extend an inconsistent partial assignment — is what buys the gap; what it cannot refuse is a subtree doomed only by the future, and that is precisely what c-05 prunes, c-06 propagates away and c-07 steps around, each measured against these same counters.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The instrument, assembled once",
      text: "The three counters you just watched print are Part C's measurement system, and their definitions never move again: placements = assignments attempted, including later undone; rejected = value trials vetoed by the past; retreats = value-loop exhaustions (c-07 calls them backtracks — the same event, counted the same way). Forward checking (c-05) adds two currencies to this ledger — prunes and wipe-outs — and trades rejections for them; arc consistency (c-06) runs propagation between placements; the ordering lesson (c-07) swaps the `select` policy on this very engine and measures MRV and least-constraining value with these same three counters. When a later lesson claims an improvement, the claim is settled exactly the way this one was: same engine, same counters, different policy — and the numbers, not the folklore, decide.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "c-04-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague must now run this engine on a new problem: five exams, rooms as values, no student in two exams at once. What has to change?",
      options: [
        {
          text: "Nothing in the engine: supply four new pieces of data — variables, domains, a neighbors map, a constraint predicate — and, if wanted, a new select policy. backtrack() itself is untouched",
          correct: true,
          feedback:
            "Correct — that is the whole architecture. The engine reads names, lists and one predicate call; it never knew it was coloring a map, so it cannot notice it is now timetabling. c-05's propagation and c-07's orderings bolt onto the same seam.",
        },
        {
          text: "The consistency check inside backtrack must be rewritten to understand exams and rooms",
          correct: false,
          feedback:
            "The check never understood maps either — it forwards to the predicate you supply. Instance knowledge lives in data; rewriting the engine per world is exactly the habit this design removes.",
        },
        {
          text: "The counters need new definitions before the engine can measure a timetabling run",
          correct: false,
          feedback:
            "The counters count moves of the search, not facts of the world — placements, past-vetoes and loop exhaustions mean the same thing for any CSP. That is why c-05 through c-07 reuse these definitions unchanged.",
        },
        {
          text: "The recursion must be converted to an explicit stack before the engine can handle five variables",
          correct: false,
          feedback:
            "Recursion depth equals the number of variables — five frames is nothing, and the conversion would change no counter and no answer. Save that rewrite for when a profiler, not a feeling, asks for it.",
        },
      ],
      solution:
        "Only the data changes: five exam variables, room domains, a neighbors map pairing every two exams that share a student, and a predicate that vetoes shared time slots. The engine — solve, the counters, the policies — is untouched.",
      explanation:
        "Representation-first engineering: problems arrive as data, the instrumented engine stays — and every later lesson in the part upgrades the engine precisely because it stayed general.",
      concepts: ["CSP representation", "order policy"],
    },
    {
      kind: "exercise",
      id: "c-04-e2",
      exerciseKind: "write-code",
      prompt:
        "The third run opened with SA, and the degree tie-break made that call — on the empty assignment every variable ties with 3 consistent colors, so MRV is silent. Write the tie-break itself: compute each variable's degree (its count of still-unassigned neighbors) and print the variable with the highest degree, ties broken by listing order: WA, NT, SA, Q, NSW, V, T.",
      starter: `NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
VARS = ["WA", "NT", "SA", "Q", "NSW", "V", "T"]
ASSIGNED = set()                    # the empty assignment


def degree(var):
    # TODO: count var's neighbors that are still unassigned
    ...


def pick():
    # TODO: the variable with the highest degree,
    # ties broken by listing order (earliest wins)
    ...


print(pick())`,
      expectedOutput: `SA`,
      solution: `NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
VARS = ["WA", "NT", "SA", "Q", "NSW", "V", "T"]
ASSIGNED = set()                    # the empty assignment


def degree(var):
    return sum(1 for n in NEIGHBORS.get(var, []) if n not in ASSIGNED)


def pick():
    return max(VARS, key=lambda v: (degree(v), -VARS.index(v)))


print(pick())  # SA — degree 5, the hub; every variable tied at 3 colors first`,
      explanation:
        "SA constrains five still-unassigned neighbors — WA, NT, Q, NSW and V — against NT's, Q's and NSW's three, WA's and V's two, and T's zero (the island has no entry, so it constrains nothing). The engine's own pick used the same count as one component of a longer sort key; here, with MRV silent, it is the whole decision.",
      concepts: ["degree heuristic", "MRV", "tie-breaking"],
    },
    {
      kind: "exercise",
      id: "c-04-e3",
      exerciseKind: "predict-output",
      prompt:
        "c-03's exercise e2 traced ONE swap of the variable order by hand — WA, NT, SA, NSW, Q, V, T, with NSW moved ahead of Q — and counted 8 placements, 6 rejections, 1 retreat. Below is this lesson's plain engine pointed at that order (T still last, values r, g, b). Without running it, write down the exact two lines it will print; then run it and reconcile. This is the order c-05's forward-checking audit re-measures, so the numbers are worth owning precisely.",
      starter: `NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
COLORS = ["r", "g", "b"]
ORDER = ["WA", "NT", "SA", "NSW", "Q", "V", "T"]   # the one swap: NSW before Q

placements = rejected = retreats = 0
assignment = {}


def consistent(var, val):
    return all(assignment.get(n) != val for n in NEIGHBORS.get(var, []))


def backtrack(i):
    global placements, rejected, retreats
    if i == len(ORDER):
        return True
    var = ORDER[i]
    for val in COLORS:
        if consistent(var, val):
            placements += 1
            assignment[var] = val
            if backtrack(i + 1):
                return True
            del assignment[var]
        else:
            rejected += 1
    retreats += 1
    return False


backtrack(0)
print("solution:", " ".join(f"{v}={assignment[v]}" for v in ORDER))
print(f"placements={placements} rejected={rejected} retreats={retreats}")`,
      expectedOutput: `solution: WA=r NT=g SA=b NSW=g Q=r V=r T=r
placements=8 rejected=6 retreats=1`,
      solution: `solution: WA=r NT=g SA=b NSW=g Q=r V=r T=r
placements=8 rejected=6 retreats=1

The walk: WA=r; NT=r rejected, NT=g placed; SA=r and SA=g rejected,
SA=b placed; NSW, checked against SA only (Q is unassigned now), takes
r — placement 4. Q then faces NT=g, SA=b and NSW=r: all three values
vetoed — rejections 4, 5, 6 — dead end, retreat 1. NSW retries g
(placement 5), Q takes r (6), V takes r (7), T=r (8). The eight
placements include NSW placed twice — placements count attempts,
including the undone, the definition c-03 fixed. And the coloring is
the same one the WA-first order found; only the bill changed.`,
      explanation:
        "Engine and hand trace agree number for number — 8/6/1, machine-verified. The swap let NSW take a color (r) that starved Q, the past-only check could not see it, and one retreat bought the knowledge. Same graph, same algorithm, different order: 7/4/0 becomes 8/6/1 — order is destiny, and c-07 turns that observation into heuristics.",
      concepts: ["variable ordering", "counters", "retreat"],
    },
  ],
  terms: [
    {
      term: "minimum remaining values (MRV)",
      definition:
        "The fail-first variable-ordering policy: assign next the unassigned variable with the fewest domain values consistent with the past assignment — the one closest to a dead end.",
    },
    {
      term: "degree heuristic",
      definition:
        "The MRV tie-break: among variables with equal remaining values, choose the one constraining the most still-unassigned variables — on Australia's empty assignment, the hub SA with five.",
    },
    {
      term: "value ordering",
      definition:
        "The policy that orders the chosen variable's values — plain domain order here, least-constraining value in c-07; it changes which solution is found first, never whether one is found.",
    },
    {
      term: "order policy",
      definition:
        "The select function a backtracking engine consults for its next variable — passed in as a parameter, so the engine's code never changes when the policy does.",
    },
  ],
  mistakes: [
    {
      mistake: "Hard-coding the instance into the solver (an if for the map, a special case for the hub)",
      why: "The solver stops being general the moment it knows a variable's name — and every later upgrade (c-05's propagation, c-07's orderings) must be re-fit to a bespoke program instead of bolted onto the one engine.",
      fix: "All world knowledge lives in the four data pieces; the engine manipulates names it cannot interpret. If you find yourself typing a variable's name inside backtrack(), stop — it belongs in the predicate or the policy.",
    },
    {
      mistake: "Counting only the placements that survive to the solution",
      why: "The definition — fixed in c-03 and reused by every later lesson — counts assignments attempted, including later undone; the one-swap trace's 8 placements include NSW placed twice. Undercounting breaks reconciliation with the published numbers (7/4/0, 8/6/1).",
      fix: "Increment on every placement and decrement nothing on undo. The undo is a retreat's move, not an un-placement.",
    },
    {
      mistake: "Letting the consistency check consult unassigned variables (or their domains)",
      why: "It feels like foresight, but it is a different algorithm — forward checking, c-05's subject — and it changes every counter, so the engine no longer reproduces c-03's traces.",
      fix: "Keep the check past-only: one predicate call per assigned neighbor. Future inconsistencies surface as rejections when the future variable's turn arrives.",
    },
    {
      mistake: "Sorting by MRV without a written tie-break",
      why: "At the start of every search all domains are full and MRV ties everywhere; without an explicit rule the pick is an accident of iteration order — unreproducible across representations.",
      fix: "Spell out the full sort key — remaining values, then degree, then a fixed order — exactly as the engine's min() does; c-07's measured tables depend on the tie-break being a specification.",
    },
  ],
  takeaways: [
    "A CSP reaches the engine as four pieces of data — variables, domains, a neighbors map, a binary constraint predicate — and the order policy is a parameter; the solver never learns what the names mean.",
    "The three counters are the course's instrument: placements (including undone), rejected (past-vetoed trials), retreats (value-loop exhaustions) — the engine reproduced c-03's 7/4/0 and 6/9/3 number for number.",
    "MRV + degree is one sort key: fewest consistent values, then most unassigned neighbors, then a fixed order — from the empty assignment the tie at 3 hands the decision to degree, and SA's five neighbors win it.",
    "Australia is too easy to reward the cleverness: 7/8/0 against the lucky order's 7/4/0 — same placements, twice the rejections, no dead ends either way. The dividend is measured where it grows (c-07), not assumed.",
    "The worst case is O(d^n) time with O(n) space — depth-first pays nothing in memory; the gap between 2,187 and eleven trials is what the check, the order and (soon) propagation negotiate.",
  ],
  quiz: [
    {
      id: "c-04-q1",
      prompt: "The MRV + degree run opened with SA, not WA. What decided the first pick?",
      options: [
        {
          text: "The degree tie-break: every variable tied at 3 remaining values on the empty assignment, and SA constrains five still-unassigned neighbors — the most in the graph",
          correct: true,
          feedback:
            "Correct — MRV's count cannot separate anyone at the start (all domains full), so the tie-break decides: SA's degree is 5, against NT's, Q's and NSW's 3, WA's and V's 2, and T's 0.",
        },
        {
          text: "MRV itself: SA had the fewest remaining colors",
          correct: false,
          feedback:
            "On the empty assignment every variable has all three colors consistent with the past — nobody has fewer. MRV ties seven ways here, which is exactly why the tie-break exists.",
        },
        {
          text: "SA comes first in the engine's listing order",
          correct: false,
          feedback:
            "The listing order starts WA, and the final tie-break never fired — degree settled the pick before it was reached. Listing order is the last resort, not the decider, on the empty assignment.",
        },
        {
          text: "SA has the largest domain",
          correct: false,
          feedback:
            "All seven domains are {r, g, b}; domain size never varies in this instance. The varying quantity — after placements begin — is how many of those values the past has vetoed.",
        },
      ],
      explanation:
        "The start-of-search tie is the general case: MRV earns its keep after placements begin and the counts pull apart, while degree decides the opening move — and the hub wins it.",
    },
    {
      id: "c-04-q2",
      prompt:
        "You must now schedule five exams with this engine — rooms as values, no student in two exams at once. What changes?",
      options: [
        {
          text: "Only the four data pieces (and optionally the select policy): variables, domains, neighbors, constraint predicate — the engine's code is untouched",
          correct: true,
          feedback:
            "That is the architecture's whole point: the solver knows names, lists and a predicate call, never maps or exams. The same solve() runs the new world, counters included.",
        },
        {
          text: "The consistency check inside backtrack must be rewritten for exams",
          correct: false,
          feedback:
            "The check never understood maps either — it calls the predicate you supply. Instance knowledge lives in data, which is what lets c-05's and c-07's upgrades bolt on cleanly.",
        },
        {
          text: "The counters need new definitions before the engine can measure a timetabling run",
          correct: false,
          feedback:
            "The counters count moves of the search, not facts of the world: placements, past-vetoes, loop exhaustions mean the same thing for any CSP — which is why later lessons reuse these exact definitions.",
        },
        {
          text: "The recursion must be converted to an explicit stack, since five exams may need it",
          correct: false,
          feedback:
            "Recursion depth equals the number of variables — five frames is trivial. The conversion would change no counter and no answer.",
        },
      ],
      explanation:
        "Representation-first engineering: problems come and go as data; the engine, instrumented once, stays — and everything Part C builds later builds on exactly that stability.",
    },
    {
      id: "c-04-q3",
      prompt:
        "The measured WA-first run: 7 placements, 4 rejections, 0 retreats. The worst-case bound: O(d^n) = 3^7 = 2,187. Which reading is honest?",
      options: [
        {
          text: "The bound is loose bookkeeping — backtracking is really linear on maps",
          correct: false,
          feedback:
            "c-03's one-swap order paid 8/6/1 on the same map, and its two-color run exhausted the entire tree (4/6/5). The exponential is real; easy instances simply never bill for it.",
        },
        {
          text: "The gap is the past-only check plus a lucky order: the search never extends an inconsistent partial assignment, and this order walked home on the first path — eleven trials against a tree with 2,187 leaves",
          correct: true,
          feedback:
            "Both causes, correctly separated: pruning (the check's refusal at trial time) and fortune (the order). The one-swap trace shows the order's share — same graph, same algorithm, 8/6/1.",
        },
        {
          text: "The bound applies only when the instance is unsolvable",
          correct: false,
          feedback:
            "Unsolvable instances do force the full tree, but hard SOLVABLE instances can too — a bad enough order starves variables the solution needs. c-07's n = 8 queens pay heavily while solvable.",
        },
        {
          text: "MRV removed the exponential — that is why the third run also finished in seven placements",
          correct: false,
          feedback:
            "Ordering changes the path, never the bound: c-07's table shows MRV cutting the bill to 75 placements at n = 8 — a third off, not the exponential gone. And on Australia it could not even do that (7/8/0).",
        },
      ],
      explanation:
        "d^n is the price of the tree the search could be forced to touch; the counters measure the tree it actually touched. The difference is what pruning, propagation and ordering negotiate — the subject of the rest of Part C.",
    },
  ],
};
