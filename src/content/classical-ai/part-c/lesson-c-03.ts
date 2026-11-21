/**
 * LESSON_C_03 — "Backtracking by Hand" (30 min, coding).
 *
 * The part's hand-trace discipline. Australia walked in the WA-first
 * order (12-node searchTree: 7 placements, 4 rejected values, 0
 * retreats — the lucky order c-04's plain engine reproduces number for
 * number); a three-job schedule walked sink-first (6 placements,
 * 9 rejected, 3 retreats — the failures the summary promises). Every
 * counter is REAL stdout from the audit program: 7/4/0, 6/9/3, and the
 * exercises' 8/6/1 (one-swap), 4/6/5 (two colors, unsolvable — the
 * root-exhaustion certificate), 3/3/0 (sources-first).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_03: ClassicalLesson = {
  slug: "c-03",
  title: "Backtracking by Hand",
  minutes: 30,
  summary:
    "Assign, check, retreat: full traces on map coloring and a small scheduling problem, failures included.",
  kind: "coding",
  objectives: [
    "Trace backtracking by hand on a constraint graph — place, check, recurse, retreat — logging every event",
    "Apply the past-only consistency discipline and defend it: why unassigned variables never vote, and why nothing is missed",
    "Recognize dead ends and follow the retreats that answer them, in both a coloring and a scheduling trace",
    "Count a trace's placements, rejected values and retreats, and reconcile them with a program's output number for number",
  ],
  why: "Backtracking is the first algorithm in this course you will run mostly by hand, on paper — and the hand is where it is easiest to fool yourself. A trace that quietly 'checks the future' is doing forward checking; a trace that undoes two placements at once is doing something that is not backtracking; a trace that never retreats may be a lucky order rather than a correct one. This lesson makes you walk two searches step by step — the Australia coloring c-01 formalized and c-02 drew, then a three-job schedule where a genuinely wrong turn forces a genuine retreat — and count every event, because in the next lesson a program you write yourself must reproduce these counts number for number. The discipline you are practicing is the one every CSP engineer owns: search is a sequence of mechanical moves — assign, check, retreat — and the numbers a run leaves behind (7 placements, 4 rejections, 0 retreats here; 6, 9 and 3 there) are the ground truth against which every fancier method in Part C is measured.",
  blocks: [
    {
      kind: "text",
      text: "Lesson c-02 turned Australia into a constraint graph — seven variables, nine borders, Tasmania an island. This lesson walks that graph. Backtracking is depth-first search over partial assignments: take the variables in a fixed order, try each value until one offends nothing already decided, place it, and dive deeper; when a variable's every value is vetoed, retreat to the previous placement and try its next value. You will trace the algorithm twice and count honestly both times: on Australia, where the chosen order glides to a solution without one retreat, and on a three-job schedule, where the same algorithm walks into a wall, backs out, and pays for every step. The failures are the point — a search you have watched fail by hand is a search you can debug, and reconcile with a program, for the rest of the course.",
    },
    {
      kind: "algorithm",
      name: "Backtracking Search",
      family: "Depth-first search over assignments",
      problem: "Find a complete consistent assignment for a CSP — or prove there is none.",
      idea: "Extend a partial assignment one variable at a time, checking each candidate value only against variables already assigned; on a dead end, undo the most recent placement and continue its value loop.",
      strategy: [
        "Take the next unassigned variable (a fixed order, for now — c-07 makes the order a decision)",
        "Try its values in order; a value consistent with the past is placed and the search recurses",
        "A variable whose every value is vetoed is a dead end — retreat one level",
        "The retreat resumes the previous variable's value loop where it left off, undeciding nothing else",
        "All variables placed: a complete consistent assignment — the answer. The root out of values: no solution exists",
      ],
      guarantees: [
        "Complete: explores the whole assignment space if allowed to run to exhaustion",
        "Sound: every value placed passed the consistency check, so every reported solution is valid",
        "Never claims unsolvable until the root's own value loop exhausts — that exhaustion is the certificate",
      ],
      useWhen: [
        "The instance is small or well-constrained enough that dead ends are rare",
        "You need a baseline every fancier method (propagation, ordering) is measured against",
      ],
    },
    { kind: "heading", text: "The discipline: check the past, only the past" },
    {
      kind: "definition",
      term: "backtracking",
      informal:
        "Depth-first search over partial assignments: extend one variable at a time, checking candidates against the assigned past only; a dead end retreats one placement and resumes the value loop there.",
      formal:
        "v \\text{ is placeable on } X_i \\iff \\forall X_j \\in A: (v, A(X_j)) \\text{ satisfies } C_{ij}",
      why: "The check is cheap because it is narrow — and nothing is missed: any inconsistency with the future will be caught when the future variable's turn comes, as a rejection at its own step.",
    },
    {
      kind: "text",
      text: "Say the discipline out loud before tracing, because it is where hands go wrong. When a candidate value for, say, SA is tried, the check consults ONLY the variables already holding values — WA, NT, whoever is assigned. It never asks whether the value will starve a later variable; that is not its job. This is not laziness but division of labor: an inconsistency with the future cannot be hidden, because when that future variable's turn comes, its own check will reject the offending values one by one. What past-only checking buys is exactness of counting — every rejection you log happened at a specific variable against a specific past assignment, and every retreat undoes exactly one placement, the most recent. Trace with those rules and the counters come out as the program says they must.",
    },
    { kind: "heading", text: "Australia, traced by hand" },
    {
      kind: "searchTree",
      title: "The entire search: order WA, NT, SA, Q, NSW, V, T; values r, g, b",
      root: {
        id: "root",
        label: "∅",
        status: "expanded",
        children: [
          {
            id: "wa-r",
            label: "WA=r",
            status: "expanded",
            edge: "r",
            children: [
              { id: "nt-r", label: "NT=r", status: "pruned", edge: "r ✗ WA=r" },
              {
                id: "nt-g",
                label: "NT=g",
                status: "expanded",
                edge: "g",
                children: [
                  { id: "sa-r", label: "SA=r", status: "pruned", edge: "r ✗ WA=r" },
                  { id: "sa-g", label: "SA=g", status: "pruned", edge: "g ✗ NT=g" },
                  {
                    id: "sa-b",
                    label: "SA=b",
                    status: "expanded",
                    edge: "b",
                    children: [
                      {
                        id: "q-r",
                        label: "Q=r",
                        status: "expanded",
                        edge: "r",
                        children: [
                          { id: "nsw-r", label: "NSW=r", status: "pruned", edge: "r ✗ Q=r" },
                          {
                            id: "nsw-g",
                            label: "NSW=g",
                            status: "expanded",
                            edge: "g",
                            children: [
                              {
                                id: "v-r",
                                label: "V=r",
                                status: "expanded",
                                edge: "r",
                                children: [
                                  { id: "t-r", label: "T=r", status: "goal", edge: "r" },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      legend:
        "Each node is a trial of one value on one variable; ✗ names the past assignment that vetoed it.",
      caption:
        "Twelve nodes, the entire search: one path of seven placements, four values rejected at trial — NT=r, SA=r, SA=g, NSW=r — and no dead end anywhere, so no retreat. The goal node is the complete coloring c-01 and c-02 exhibited: WA=r, NT=g, SA=b, Q=r, NSW=g, V=r, T=r.",
    },
    {
      kind: "text",
      text: "Read the tree as a chronicle of trials. WA=r was placed first — no past to consult, the check vacuous. NT's r died against WA=r; g survived and was placed. SA — the hub of c-02's drawing, five borders — found only two of them assigned, WA and NT, and paid twice: r vetoed by WA=r, g vetoed by NT=g, b placed. Q checked against NT=g and SA=b and took r. NSW lost r to Q=r and took g. V, constrained only by SA and NSW, checked against SA=b and NSW=g and took r. T, the island with no borders, passed a vacuous check — an empty neighbor list vetoes nothing — and kept the first value offered, r. Seven placements, four rejected values, zero retreats: eleven value trials against a space of `3^7 = 2,187` complete assignments. **The honest reading is that this order got lucky.** Nothing in the algorithm promised a retreat-free walk — the check reports whether a value offends the past; it cannot see that a placement might starve a future variable. The schedule below is the counterweight: three variables, and the search retreats three times. And Exercise e2 shows that even this graph punishes a careless swap.",
    },
    {
      kind: "code",
      title: "The audit program — both traces, counted by the machine",
      lang: "python",
      code: `"""Trace audit: the two searches of this lesson, counted.

Counters: placements = assignments attempted (incl. later undone);
rejected = value trials vetoed by the past; retreats = value-loop
exhaustions (a variable runs out of values and the search backs up).
"""

NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
COLORS = ["r", "g", "b"]


def solve_australia(order, colors):
    placements = rejected = retreats = 0
    assignment = {}

    def consistent(var, val):
        return all(assignment.get(n) != val for n in NEIGHBORS.get(var, []))

    def backtrack(i):
        nonlocal placements, rejected, retreats
        if i == len(order):
            return True
        var = order[i]
        for val in colors:
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

    solved = backtrack(0)
    return solved, dict(assignment), placements, rejected, retreats


solved, sol, p, r, t = solve_australia(["WA", "NT", "SA", "Q", "NSW", "V", "T"], COLORS)
print("solution:", " ".join(f"{v}={sol[v]}" for v in ["WA", "NT", "SA", "Q", "NSW", "V", "T"]))
print(f"placements={p} rejected={r} retreats={t}")

# ---- schedule: 3 unit jobs, one machine, slots {1,2,3} ----------------
PREC = {("J1", "J3"), ("J2", "J3")}
SLOTS = [1, 2, 3]


def consistent_job(assignment, job, slot):
    for other, oslot in assignment.items():
        if oslot == slot:                                   # one machine
            return False
        if (job, other) in PREC and not slot + 1 <= oslot:   # job precedes other
            return False
        if (other, job) in PREC and not oslot + 1 <= slot:   # other precedes job
            return False
    return True


def solve_jobs(order):
    placements = rejected = retreats = 0
    assignment = {}

    def backtrack(i):
        nonlocal placements, rejected, retreats
        if i == len(order):
            return True
        job = order[i]
        for slot in SLOTS:
            if consistent_job(assignment, job, slot):
                placements += 1
                assignment[job] = slot
                if backtrack(i + 1):
                    return True
                del assignment[job]
            else:
                rejected += 1
        retreats += 1
        return False

    solved = backtrack(0)
    return solved, dict(assignment), placements, rejected, retreats


solved, sol, p, r, t = solve_jobs(["J3", "J1", "J2"])
print("solution:", " ".join(f"{j}={sol[j]}" for j in ["J1", "J2", "J3"]))
print(f"placements={p} rejected={r} retreats={t}")`,
      output: `solution: WA=r NT=g SA=b Q=r NSW=g V=r T=r
placements=7 rejected=4 retreats=0
solution: J1=1 J2=2 J3=3
placements=6 rejected=9 retreats=3`,
    },
    { kind: "heading", text: "Scheduling: the retreat, live" },
    {
      kind: "example",
      title: "Three jobs, one machine, the sink scheduled first",
      problem:
        "Three jobs, each one slot long, run on a single machine. Start times come from the slots {1, 2, 3}; the machine forbids shared slots; and both J1 and J2 must finish before J3 starts — for unit durations, s(J1) + 1 ≤ s(J3) and s(J2) + 1 ≤ s(J3), the scheduling shape c-01 introduced. The variable order is a plausible carelessness: J3 first, then J1, then J2, as if the jobs were listed with the final assembly on top. Trace the search by hand, every event counted: placements, rejected values, retreats.",
      steps: [
        {
          text: "J3 takes slot 1 (placement 1 — no past to consult).",
          detail: "The order's first cost is already paid: J3 is the CONSEQUENCE of J1 and J2, and scheduling it first decides the future before the present.",
        },
        {
          text: "J1: slots 1, 2 and 3 all rejected by precedence (3 rejections). Dead end.",
          detail: "J1 needs `s(J1) + 1 ≤ s(J3) = 1`, that is, `s(J1) ≤ 0`; every slot fails the inequality. A dead end is a partial assignment the next variable cannot extend — every one of its values failed the check against the past.",
        },
        {
          text: "Retreat: undo J3 = 1 (retreat 1). J3 retries slot 2 — placed (placement 2).",
          detail: "The retreat undoes exactly one placement — the most recent — and the loop over J3's values resumes where it left off. Nothing else is re-checked; the assignment is empty again.",
        },
        {
          text: "J1 takes slot 1 (placement 3). J2: slot 1 rejected (machine — J1 occupies it); slots 2 and 3 rejected (precedence — `s(J2) + 1 ≤ 2` demands `s(J2) ≤ 1`). Dead end again (3 rejections).",
          detail: "J2 is squeezed from both sides: the machine bars slot 1, the precedence bars everything at or after 2. Two constraints, three values, zero survivors.",
        },
        {
          text: "Retreat: undo J1 = 1 (retreat 2). J1 retries slot 2 (rejected, precedence) and slot 3 (rejected, precedence) — exhausted, so the retreat climbs another level: undo J3 = 2 (retreat 3). J3 takes slot 3 (placement 4).",
          detail: "This is the cascade: a dead end at depth three unwinds two levels because the levels between have no values left. Every exhausted loop is its own retreat, counted separately — the machine's 3 matches.",
        },
        {
          text: "J1 takes slot 1 (placement 5). J2: slot 1 rejected (machine), slot 2 placed (placement 6) — `2 + 1 ≤ 3` satisfies the precedence. Complete: J1 = 1, J2 = 2, J3 = 3.",
          detail: "Six placements, nine rejected values, three retreats — the audit program's second block, number for number. Compare the sources-first order of Exercise e3: three placements, three rejections, zero retreats. The algorithm is identical; only the order changed.",
        },
      ],
      result: "J1 = 1, J2 = 2, J3 = 3 — 6 placements, 9 rejected values, 3 retreats (order J3, J1, J2).",
    },
    {
      kind: "text",
      text: "One paragraph on orderings, because the schedule begged for it. The Australia trace never retreated; the schedule retreated three times; the same schedule in a different order (e3) would not retreat at all. The order of variables — and, subtly, the order of values within each variable — is doing quiet work in every trace, and the two orderings have names and measured histories: fail-first (minimum remaining values, with degree as tie-break) and succeed-first (least-constraining value). They are c-07's whole subject; here, take only the observation — the counters you just learned to keep are exactly the instrument that will measure them.",
    },
    {
      kind: "exercise",
      id: "c-03-e1",
      exerciseKind: "concept-check",
      prompt:
        "During the scheduling trace, when J2's three slots were all rejected, the search undid J1 = 1 — not J2's own values (they were exhausted) and not both placements at once. Why exactly one, and why the most recent?",
      options: [
        {
          text: "Because undoing the most recent placement is the only move that can offer NEW values to try — J2's loop is exhausted, so the next place new trials can come from is J1's value loop, which resumes where it left off",
          correct: true,
          feedback: "Correct — the retreat goes to the most recent variable with values left untried. J2 had none; J3 had one (slot 3); J1 had two (slots 2, 3). The search tried them in that order.",
        },
        {
          text: "Because undoing two placements at once would lose the consistency check's memory",
          correct: false,
          feedback: "The check has no memory to lose — it recomputes against whatever holds values. Undeciding two at once is simply a different (non-backtracking) algorithm, and its counters would not match any program here.",
        },
        {
          text: "Because J1 = 1 was the placement that vetoed J2's slot 1",
          correct: false,
          feedback: "True that the machine constraint named J1 — but the retreat's target is about REMAINING TRIALS, not about blame. J3 = 2 was equally guilty (precedence) and was undone one step later.",
        },
        {
          text: "Because the algorithm is breadth-first and undoes the shallowest assignment",
          correct: false,
          feedback: "Backtracking is depth-first; the retreat goes to the DEEPEST variable with untried values — which is what 'most recent' means here.",
        },
      ],
      solution:
        "The retreat targets the most recent variable whose value loop still has untried values — that is the only place new information can enter the search. J2 was exhausted; J1 still had slots 2 and 3; so J1 was undone, and when its remaining values also failed, the retreat climbed to J3.",
      explanation:
        "This is the mechanism behind the counters: every exhausted loop is one retreat, and retreats cascade upward until a variable with untried values is found — or the root exhausts, the unsolvability certificate.",
      concepts: ["backtracking", "retreat", "dead end"],
    },
    {
      kind: "exercise",
      id: "c-03-e2",
      exerciseKind: "trace",
      prompt:
        "Australia again, values r, g, b, but with ONE swap in the variable order: WA, NT, SA, NSW, Q, V, T — NSW now precedes Q. Trace it by hand and report the counters (placements, rejected, retreats) and the solution, then say in one sentence what the swap changed.",
      solution: `The swap delays Q, and Q pays for it. WA=r; NT: r rejected, g placed;
SA: r, g rejected, b placed; NSW: r rejected? No — NSW checks against
SA=b only (Q is UNASSIGNED now), so r is consistent: NSW=r placed. Q
now checks against NT=g, SA=b, NSW=r — all three colors vetoed, dead
end (3 rejections), retreat: undo NSW=r; NSW takes g. After NSW=g:
Q takes r; V takes r; T=r. Counters: placements 8 (WA=r, NT=g, SA=b,
NSW=r, NSW=g, Q=r, V=r, T=r), rejected 6 (NT=r, SA=r, SA=g, Q=r, Q=g,
Q=b), retreats 1. Solution: WA=r NT=g SA=b NSW=g Q=r V=r T=r — the
same coloring as the lesson's trace, one letter permuted in the
reading order. What the swap changed: NSW, assigned before its
neighbor Q, took a color (r) that starved Q — the past-only check
could not see it, and the search paid one retreat to learn it.
(Machine-verified: 8/6/1.)`,
      explanation:
        "The one-swap trace is the lesson's thesis in miniature: order changes the bill (7/4/0 becomes 8/6/1) while the answer's validity never wavers — the same solution, found through one dead end.",
      concepts: ["variable ordering", "dead end", "counters"],
    },
    {
      kind: "exercise",
      id: "c-03-e3",
      exerciseKind: "trace",
      prompt:
        "Two short traces, both machine-verified in the audit program's spirit. (a) The same three-job schedule in the sources-first order J1, J2, J3: count placements, rejected values and retreats. (b) Australia with only two colors, r and g, in the original WA-first order: what are the counters, and what does the search's ending prove?",
      solution: `(a) J1 takes slot 1 (placement 1). J2: slot 1 rejected (machine),
slot 2 placed (placement 2 — no precedence binds J2 to J1). J3: slot 1,
2 rejected (machine), slot 3: the precedence reads s(J3) >= s(J1)+1 = 2
and s(J3) >= s(J2)+1 = 3 — slot 3 satisfies both: placed (placement 3).
Counters: 3 placements, 3 rejected, 0 retreats. The order that lists
preconditions first never meets a dead end — the exact opposite of
the lesson's sink-first trace (6/9/3) on the SAME instance.

(b) Two colors cannot color Australia — the WA-NT-SA triangle of c-02
needs three. The trace: WA=r; NT: r rejected, g placed; SA: r, g both
rejected — dead end, retreat; NT exhausted (no b exists in two-color
domains), retreat; WA takes g; NT takes r; SA: r, g rejected, dead
end... the search exhausts everything: placements 4, rejected 6,
retreats 5 — the last retreat is the ROOT's exhaustion, and that is
the point: when the root itself runs out of values, the algorithm has
PROVEN no solution exists. No timeout, no guess — a counted
certificate. (Machine-verified: 4/6/5.)`,
      explanation:
        "(a) shows order as destiny — 3/3/0 against 6/9/3 on one instance. (b) shows what completeness means in practice: failure is not a shrug but a proof, delivered as the root's counted exhaustion.",
      concepts: ["variable ordering", "completeness", "unsolvability certificate"],
    },
  ],
  terms: [
    {
      term: "backtracking",
      definition: "Depth-first search over partial assignments: place consistent values one variable at a time, and on a dead end undo the most recent placement and resume its value loop.",
    },
    {
      term: "partial assignment",
      definition: "The search's working state: some variables hold values, the rest are unassigned. Every move adds one placement or undoes one.",
    },
    {
      term: "dead end",
      definition: "A partial assignment the next variable cannot extend — every one of its values failed the past-only consistency check. Answered by a retreat; if the ROOT dead-ends, the instance is unsolvable.",
    },
  ],
  mistakes: [
    {
      mistake: "Checking candidate values against the future as well as the past",
      why: "It feels like foresight, but it is a different algorithm — forward checking, c-05's subject — and it changes every counter, so the hand trace no longer reconciles with the plain engine's output.",
      fix: "Keep the check narrow on purpose: past assignments only. Future inconsistencies are not missed — they surface as rejections when the future variable's turn comes.",
    },
    {
      mistake: "Undoing two placements in one retreat",
      why: "Usually a quiet decision to 'restart this branch cleanly' — but backtracking's retreat undoes exactly ONE placement, and the cascade of multiple retreats is a sequence of counted, single-level moves.",
      fix: "Undo one, resume that variable's value loop, and count each exhausted loop as its own retreat. The scheduling trace's 3 retreats are three single undoings, not one triple jump.",
    },
    {
      mistake: "Reading a retreat-free trace as a well-behaved algorithm",
      why: "The Australia trace never retreated because the ORDER was lucky — WA first, hub third — not because backtracking is gentle. The one-swap trace (e2) retreats on the same graph.",
      fix: "Attribute the bill to the order, not the algorithm: the counters measure the interaction of instance, order and check. c-07 turns that observation into heuristics.",
    },
    {
      mistake: "Treating failure as 'the program gave up'",
      why: "A solver that prints no solution after exhausting the root has not given up — it has PROVEN unsolvability, with a counted certificate (e3's two-color Australia: 4 placements, 6 rejections, 5 retreats).",
      fix: "Read the root's exhaustion as the output it is: the strongest negative answer search can give. Complete algorithms fail loudly and provably.",
    },
  ],
  takeaways: [
    "Backtracking = depth-first search over partial assignments: place, check the past, recurse; dead end → undo exactly one placement and resume its value loop.",
    "The consistency check is past-only by design — future inconsistencies surface as rejections at the future variable's own step, so nothing is missed.",
    "Counters are the discipline: placements (including undone), rejected values, retreats (value-loop exhaustions). Australia WA-first: 7/4/0; the sink-first schedule: 6/9/3.",
    "Order is destiny: the same schedule runs 3/3/0 sources-first and 6/9/3 sink-first; the same Australia runs 8/6/1 after one swap — c-07's heuristics are this observation industrialized.",
    "Root exhaustion is a proof of unsolvability — failure delivered as a counted certificate, not a timeout.",
  ],
  quiz: [
    {
      id: "c-03-q1",
      prompt: "In the Australia trace, SA's candidate value r was rejected. Which past assignments did the check consult?",
      options: [
        { text: "All six other variables, assigned or not", correct: false, feedback: "The check consults only variables HOLDING values — at SA's step, that is WA and NT; Q, NSW, V, T have no vote yet." },
        { text: "WA and NT only — the assigned neighbors of SA at that moment", correct: true, feedback: "Correct: r died against WA=r specifically; the veto is named on the tree's edge (r ✗ WA=r)." },
        { text: "SA's five neighbors, because degree-5 hubs check more", correct: false, feedback: "The check consults assigned variables among the neighbors — SA's degree is about the graph, not about who votes at this step. Q, NSW and V were unassigned and silent." },
        { text: "The goal test, applied early", correct: false, feedback: "The goal test runs at completion — it is not part of the per-value consistency check." },
      ],
      explanation: "Past-only, and among the past only the variable's constraint partners: at SA's step, WA=r and NT=g held values, so they were the entire electorate.",
    },
    {
      id: "c-03-q2",
      prompt: "The scheduling trace dead-ended twice and retreated three times. The third retreat (undo J3 = 2) happened because:",
      options: [
        { text: "J2's dead end was J3's fault, so the search undid J3 directly", correct: false, feedback: "The search does not assign blame — it unwinds to the most recent variable with untried values. J1 had untried slots (2, 3) and was tried FIRST; only when those failed did the retreat reach J3." },
        { text: "J1's remaining values (slots 2 and 3) were both rejected by precedence, exhausting J1's loop — so the retreat climbed past J1 to J3, whose slot 3 remained untried", correct: true, feedback: "Correct — the cascade: J2 exhausted, retreat to J1; J1 exhausted, retreat to J3; J3's slot 3 finally succeeds. Three exhausted loops, three counted retreats." },
        { text: "The algorithm restarts from the first variable after every two dead ends", correct: false, feedback: "No restart heuristic exists in plain backtracking — the moves are strictly one-level retreats, in sequence." },
        { text: "Slot 2 was reserved for J2 by the machine constraint", correct: false, feedback: "Slots are not reserved — the machine constraint only forbids SHARING. J2's eventual slot 2 was free all along; the ORDER was what made it unreachable until the third branch." },
      ],
      explanation: "Retreats cascade: each exhausted value loop is one counted retreat, and the search climbs until it finds a variable with untried values — J1 first, then J3.",
    },
    {
      id: "c-03-q3",
      prompt: "Exercise e3's two-color Australia ended with placements=4, rejected=6, retreats=5 and no solution. The honest conclusion?",
      options: [
        { text: "The program has a bug — Australia is always colorable", correct: false, feedback: "Australia is THREE-colorable; with two colors the WA-NT-SA triangle (c-02) is unsatisfiable, and the counters are the proof of it." },
        { text: "Backtracking is incomplete — it can miss solutions that exist", correct: false, feedback: "The opposite: backtracking explores the entire space before giving up. No solution existed to miss." },
        { text: "The root's value loop exhausted — a counted, mechanical PROOF that no two-coloring exists for this graph", correct: true, feedback: "Exactly: the fifth retreat was the root's own exhaustion. Complete search algorithms deliver unsolvability as a certificate, not as an apology." },
        { text: "The search needed forward checking to conclude anything", correct: false, feedback: "Propagation (c-05, c-06) reaches such conclusions CHEAPER — that is its selling point — but plain backtracking reaches them too, eventually and provably." },
      ],
      explanation: "Failure with a certificate: 4 placements, 6 rejections, 5 retreats — every branch counted, every leaf seen. That is what completeness buys.",
    },
  ],
};
