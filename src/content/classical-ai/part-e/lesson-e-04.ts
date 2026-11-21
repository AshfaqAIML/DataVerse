/**
 * Lesson e-04 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_04: ClassicalLesson = {

  slug: "e-04",
  title: "Heuristics for Planning",
  minutes: 30,
  summary:
    "Relax the problem until it is easy, solve that, and use its cost as a heuristic — the h-add family in one lesson.",
  kind: "concept",
  objectives: [
    "Build a delete-relaxed copy of a STRIPS task and explain why its optimal plan length h+ never overestimates h*",
    "Compute h-max and h-add by hand on a small state — every fact's value, then the goal value — verifying each number",
    "Implement the forward Bellman propagation that computes both heuristics to a fixpoint",
    "State precisely which of h+, h-max and h-add are admissible, which are computable, and why those two properties pull apart",
  ],
  why: "e-01's breadth-first solver expanded thirteen states for a three-block world; at fifteen-puzzle scale — 10^13 states — that approach is dead on arrival, and Part A already named the cure: a heuristic that never overestimates. But where do honest numbers come from when states are sets of propositions and moves are operators with preconditions, add lists and delete lists? Hand-crafted counts are hopeless — every domain would need its own genius. The answer is the single most productive idea in modern planning: stop inventing heuristics and DERIVE them. Take the problem, remove the constraint that makes it hard — the delete lists — and price the easy version exactly; Part A's misplaced-tiles count was secretly this all along. This lesson makes the construction explicit (the delete relaxation h+), proves its admissibility in four lines (real plans survive the relaxation), faces its price (h+ is NP-hard to compute exactly), and builds the two computable shadows that relaxed planners evaluate at every node — h-max and h-add — with every number verified by hand and by program on the Sussman anomaly, where they read 2 and 3 against a true optimum of 3.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Part A used the trick without naming it: the eight-puzzle's **misplaced-tiles** heuristic was never a lucky guess — it is the EXACT optimal solution length of a *relaxed* puzzle, one where a tile may be lifted off the board and set anywhere, passing straight through its neighbors, every trip counting one move. One move per misplaced tile; the count is that easier puzzle's optimum. Manhattan distance is the same construction one notch tighter — tiles slide, but through each other. There is the general recipe for heuristics, and it is the only reliable one: **remove the constraint that makes the problem hard, solve what remains exactly, and use that cost as the estimate**. Planning's instance of the recipe is the most profitable single move in the field's history: keep every precondition and every add list, and **drop the delete lists**. What remains — the delete relaxation — is easy enough to price and honest enough to trust, and everything in this lesson grows out of it: the exact cost h+, its admissibility, its NP-hardness, and the two computable shadows h-max and h-add that planners actually run.",
    },
    // ------------------------------------------------------------ the relaxation
    { kind: "heading", text: "Drop the deletes: the relaxation h+" },
    {
      kind: "definition",
      term: "delete relaxation (h+)",
      informal:
        "The same planning task with every delete list emptied: actions still check their licenses, but nothing they add ever becomes false. h+(s) — the ignore-delete-lists heuristic — is the length of the optimal plan in that easier world.",
      formal:
        "h^+(s) = \\min_{\\pi} |\\pi| \\text{ over delete-free plans } \\pi \\text{ from } s \\text{ covering } G",
      why: "One edit to the operator table buys a lower bound on the real cost — the planning descendant of 'let the tiles pass through each other'.",
    },
    {
      kind: "math",
      title: "Why h+ never overestimates",
      derivation: {
        title: "Plan survival, four lines",
        steps: [
          { expr: "s_i \\subseteq s_i^{+}", reason: "notation: s_i is the real state after i steps of a plan, s_i^+ the relaxed state after the same steps — adds are kept, deletes do not exist, so the inclusion survives step by step (induction on i)" },
          { expr: "\\text{pre}(a_{i+1}) \\subseteq s_i \\implies \\text{pre}(a_{i+1}) \\subseteq s_i^{+}", reason: "a license held in the real world still holds where nothing is ever made false" },
          { expr: "h^+(s) \\le n \\text{ for every real plan of length } n", reason: "every real plan survives the relaxation step by step — it IS a relaxed plan" },
          { expr: "h^+(s) \\le h^*(s)", reason: "h* is the shortest real plan's length, and the relaxed minimum ranges over a set that includes every real plan" },
        ],
      },
      caption:
        "No deletes means nothing ever needs undoing: the relaxed world is monotone, and monotone worlds cannot charge a surviving plan extra. One inclusion — real plans ⊆ relaxed plans — is the entire admissibility proof.",
    },
    // ------------------------------------------------------------ h-max and h-add
    { kind: "heading", text: "Two computable shadows: h-max and h-add" },
    {
      kind: "math",
      title: "The two recursions",
      displays: [
        { expr: "h_{max}(p) = \\min_{a : p \\in \\text{add}(a)} (1 + \\max_{q \\in \\text{pre}(a)} h_{max}(q))", label: "h-max of a fact" },
        { expr: "h_{add}(p) = \\min_{a : p \\in \\text{add}(a)} (1 + \\sum_{q \\in \\text{pre}(a)} h_{add}(q))", label: "h-add: the sum replaces the max" },
        { expr: "h_{max}(s, G) = \\max_{p \\in G} h_{max}(p), h_{add}(s, G) = \\sum_{p \\in G} h_{add}(p)", label: "goal aggregation" },
        { expr: "h_{max}(p) = h_{add}(p) = 0 \\text{ for } p \\in s", label: "base case" },
      ],
      caption:
        "Both recursions price a fact by its cheapest SUPPORTER — min over the actions that add it — and differ only in the toll: h-max pays the most expensive precondition, h-add pays for all of them; the same choice repeats at the goal, hardest conjunct versus all conjuncts. Each display is a fixpoint equation, and the program below solves both by sweeping until nothing improves.",
    },
    {
      kind: "example",
      title: "h-max and h-add by hand, on the Sussman start",
      problem:
        "From START = {on(C,A), on(A,Table), on(B,Table), clear(C), clear(B), clear(Table)} and GOAL = {on(A,B), on(B,C)}, propagate both recursions over the relaxed operators to a fixpoint, then read off h-max(GOAL) and h-add(GOAL). Every number gets a reason.",
      steps: [
        {
          text: "Initialize: both tables give 0 to the six START facts, ∞ to everything else.",
          detail: "The base case — a fact already true costs nothing. 'Everything else' is the other seven facts of this world's thirteen-fact vocabulary (e-05's S2 lists them all).",
        },
        {
          text: "Round 1 — the three licensed operators fire (e-01's count: move(C,A,Table), move(C,A,B), move(B,Table,C)); every precondition is a 0, so each add costs 1 + 0 = 1.",
          detail: "on(C,Table) = 1, clear(A) = 1, on(C,B) = 1, on(B,C) = 1. Both producers of clear(A) agree — move(C,A,Table) and move(C,A,B) each charge 1 + (0 + 0 + 0). And move(B,Table,C)'s second add, clear(Table), is already 0: improvements only, never regressions.",
        },
        {
          text: "Round 2 — clear(A)'s arrival licenses the A-moves and move(B,Table,A); now the two tolls have real work to do.",
          detail: "on(A,B) via move(A,Table,B): h-add charges 1 + h(on(A,Table)) + h(clear(A)) + h(clear(B)) = 1 + 0 + 1 + 0 = 2; h-max charges 1 + max(0, 1, 0) = 2. Same shape elsewhere: on(A,C) = 2 via move(A,Table,C), on(B,A) = 2 via move(B,Table,A) (1 + 0 + 0 + 1). The round-1 facts also license restackings of C and B — move(C,B,Table), move(C,Table,B), move(B,C,Table) and friends — but every add they produce is already priced at or below the charge: no improvement.",
        },
        {
          text: "Round 3 — nothing improves: the fixpoint.",
          detail: "The round-2 facts license only restackings of the new stacks — e.g. move(B,C,A) would charge 1 + 1 + 0 + 1 = 3 for on(B,A), which already sells for 2. Two improving rounds, then silence.",
        },
        {
          text: "Read the goal: h-add(GOAL) = h-add(on(A,B)) + h-add(on(B,C)) = 2 + 1 = 3; h-max(GOAL) = max(2, 1) = 2.",
          detail: "Notice what the tables say: h-max and h-add AGREE on all thirteen facts — every cheapest supporter has at most one nonzero precondition, so max = sum inside its braces. The heuristics part ways only when combining the two goal facts: hardest conjunct 2, or 1 + 2 = 3.",
        },
      ],
      result:
        "h-max(GOAL) = 2, h-add(GOAL) = 3 — against the battery's h+ = 3 and e-01's h* = 3: the admissible estimate underestimates, the informative one is exact here.",
    },
    {
      kind: "pythonImpl",
      title: "Relaxed Bellman propagation: h-max and h-add to a fixpoint",
      intent:
        "Sweep e-01's 36 operators with the delete lists ignored until both cost tables stop changing, then read the goal values the hand trace predicted: 2 and 3.",
      code: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

SURFACES = ["A", "B", "C", "Table"]
OPS = [make_move(x, y, z)
       for x in ["A", "B", "C"] for y in SURFACES for z in SURFACES
       if z != x and z != y]

START = {"on(C,A)", "on(A,Table)", "on(B,Table)",
         "clear(C)", "clear(B)", "clear(Table)"}
GOAL = {"on(A,B)", "on(B,C)"}
INF = float("inf")

def relaxed_propagate(start):
    """Bellman fixpoint of h-max and h-add over delete-free operators."""
    hmax = {p: 0 for p in start}
    hadd = {p: 0 for p in start}
    sweeps = 0
    changed = True
    while changed:
        changed = False
        sweeps += 1
        for name, pre, add, _del in OPS:      # _del ignored: the relaxation
            if any(hmax.get(q, INF) == INF for q in pre):
                continue                      # not relaxed-reachable yet
            c_max = 1 + max(hmax[q] for q in pre)
            c_add = 1 + sum(hadd[q] for q in pre)
            for p in add:
                if c_max < hmax.get(p, INF):
                    hmax[p], changed = c_max, True
                if c_add < hadd.get(p, INF):
                    hadd[p], changed = c_add, True
    return hmax, hadd, sweeps

hmax, hadd, sweeps = relaxed_propagate(START)
print(f"relaxed fixpoint after {sweeps} sweeps")
print(f"{'fact':<16}{'h-max':>6}{'h-add':>7}")
for p in sorted(hmax, key=lambda q: (hadd[q], hmax[q], q)):
    print(f"{p:<16}{hmax[p]:>6}{hadd[p]:>7}")
print()
print("h-max(GOAL) =", max(hmax[p] for p in GOAL))
print("h-add(GOAL) =", sum(hadd[p] for p in GOAL))`,
      output: `relaxed fixpoint after 3 sweeps
fact             h-max  h-add
clear(B)             0      0
clear(C)             0      0
clear(Table)         0      0
on(A,Table)          0      0
on(B,Table)          0      0
on(C,A)              0      0
clear(A)             1      1
on(B,C)              1      1
on(C,B)              1      1
on(C,Table)          1      1
on(A,B)              2      2
on(A,C)              2      2
on(B,A)              2      2

h-max(GOAL) = 2
h-add(GOAL) = 3`,
      walkthrough: [
        "make_move is e-01's, untouched — 36 operators, delete lists and all. The relaxation lives in one place: the unpacking `for name, pre, add, _del in OPS`, where the delete list is bound to a name nothing ever reads.",
        "Both tables start at 0 for exactly the START facts. An operator becomes usable the moment all its preconditions have finite value — a weaker license than pre ⊆ s, because values arrive before any real state would hold the facts.",
        "The sweep loop is Bellman relaxation: keep firing improving operators until a full sweep changes nothing. The update rule IS the definition — the fixpoint equations of the math block, solved by iteration.",
        "Three sweeps: two that improve, one that proves nothing changes — that last sweep is the fixpoint certificate. And the table confirms the hand trace exactly: identical h-max and h-add columns on all thirteen facts, goal values 2 and 3.",
        "Cross-checks: thirteen facts is this world's ENTIRE vocabulary (e-05's S2), and 2 + 1 = 3 with h-max(GOAL) = max(2, 1) = 2 — the example block's arithmetic, machine-verified.",
      ],
      project:
        "The Part E project's A* engine evaluates exactly this kind of relaxed propagation at every expanded node — and the extension benchmark pits h-max against h-add on the problem suite.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The relaxed graph plan, in one paragraph",
      text: "Grow a planning graph on the RELAXED operators — e-05's alternating proposition and action levels with persistence no-ops, but no mutexes at all — and the levels become a reachability ladder: S0 ⊆ S1 ⊆ S2 ⊆ …. A fact's first-appearance level IS its h-max (on(B,C) at S1, on(A,B) at S2 — read them off e-05's Sussman graph), and h-add values read off backward from the goal through its supporters. This is relaxed Graphplan: the delete-relaxation heuristic computed by graph growth instead of table sweeping — and the planning graph of e-05, built on relaxed operators, IS this computation scaled up, with mutexes added back as the price of honesty about deletes.",
    },
    // ------------------------------------------------------------ honesty
    {
      kind: "table",
      title: "Four numbers, one start state",
      headers: ["Estimate", "Value", "Admissible?", "Where it comes from"],
      rows: [
        ["h-max(GOAL)", "2", "yes", "hardest conjunct: on(A,B) at 2 — assumes the goal's work can be shared"],
        ["h-add(GOAL)", "3", "no (in general)", "sum of conjuncts: 2 + 1 — assumes none can be shared; exact here because no relaxed move adds both goal facts"],
        ["h+(s)", "3", "yes", "the battery's h+ = 3 (advanced exercise e-a1): the optimal relaxed plan is the real one — nothing destructive to exploit"],
        ["h*(s)", "3", "—", "e-01's BFS: move(C,A,Table), move(B,Table,C), move(A,Table,B) — 13 states expanded"],
      ],
      caption:
        "The sandwich on display: h-max ≤ h+ ≤ h-add reads 2 ≤ 3 ≤ 3, wrapped around an h* of 3 — the admissible estimate misses the accumulation, the informative one lands exactly by luck. 'Admissible?' is a verdict about the heuristic on ALL states, not about its value on this one.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The honesty clause, stated precisely",
      text: "Exact h+ is NP-hard to compute — even deciding whether a delete-free task has a plan of length at most k is NP-complete (Bylander, 1994) — so no planner evaluates h+ at every node; they evaluate shadows. h-max IS admissible but weak: max pretends the whole goal costs only its hardest conjunct, and accumulation is invisible to it (2 against 3 here). h-add is informative but NOT admissible in general: the sum pretends no two goal facts ever share work, and when one action would serve two of them, h-add charges it twice and can pass h* — voiding A*'s optimality guarantee without a warning. On the Sussman start h-add = h* = 3 happens to be exact: luck, not law. The three are ordered on every instance — h-max ≤ h+ ≤ h-add — because h-max reads earliest relaxed levels, h+ is the true relaxed optimum, and h-add prices a serialized relaxed plan. Pick the one whose defect your contract tolerates.",
    },
    // ------------------------------------------------------------ practice
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-04-e1",
      exerciseKind: "concept-check",
      prompt:
        "You must ship an A* progression planner whose plans are guaranteed OPTIMAL, and you may pick exactly one of the four numbers in this lesson's table as the heuristic. Which do you pick, and why?",
      options: [
        { text: "h-max — admissible (never overestimates h*) and computable in polynomial time; the only candidate that is both", correct: true, feedback: "Correct — h-max = 2 < h* here, so A* keeps its optimality guarantee; the price is the weakness you saw: max is blind to the goal's accumulation." },
        { text: "h-add — it equals h* = 3 on the Sussman start, so it is admissible there", correct: false, feedback: "Equality on ONE instance is not admissibility — that is a for-all-states property, and h-add's sum overestimates wherever goal facts can share work. On those states A* silently returns suboptimal plans." },
        { text: "h+ — admissible, and as informative as h-add on this instance", correct: false, feedback: "True but unusable: computing h+ exactly is NP-hard, and a number you cannot compute at every node is not a heuristic. Its computable shadows exist precisely for this reason." },
        { text: "h* — the most accurate number of all", correct: false, feedback: "h* is the unknown you are estimating: computing it IS the original problem. A heuristic is a trade of accuracy for computability; h* refuses the trade." },
      ],
      solution:
        "h-max: admissibility is a contract (h ≤ h* on every state the search visits), and among the table's admissible entries only h-max is polynomial to compute.",
      explanation:
        "The honesty clause as an engineering decision: optimal ⇒ admissible, and admissible-and-computable ⇒ h-max or a tighter admissible bound; speed at any price ⇒ h-add.",
      concepts: ["admissibility", "h-max", "A*"],
    },
    {
      kind: "exercise",
      id: "e-04-e2",
      exerciseKind: "trace",
      prompt:
        "The per-fact tables of h-max and h-add agree on every one of the thirteen Sussman facts, yet h-max(GOAL) = 2 while h-add(GOAL) = 3. (a) Verify h(on(A,B)) = 2 in BOTH recursions via move(A,Table,B). (b) Explain precisely why the tables agree fact-wise on this instance. (c) State in one sentence each what h-max and h-add assume about achieving the two goal facts together.",
      solution:
        "(a) move(A,Table,B) has pre {on(A,Table), clear(A), clear(B)}: h-add charges 1 + 0 + 1 + 0 = 2 (sum the preconditions), h-max charges 1 + max(0, 1, 0) = 2 — identical because exactly one summand is nonzero. (b) max = sum whenever at most one summand is nonzero, and on this instance every fact's cheapest supporter has that shape: the only expensive fact feeding the depth-2 facts is clear(A) at cost 1, one per supporter — so the two recursions never disagree on a fact. (c) They diverge exactly at the conjunction: h-max assumes the two goal facts' work can be fully SHARED — the pair costs its hardest member, max(2, 1) = 2; h-add assumes NO sharing — each fact pays for its own support, 2 + 1 = 3. Here no sharing was in fact available (no relaxed move adds both on(A,B) and on(B,C)), so h-add is exact and h-max underestimates by the whole cost of the second conjunct.",
      explanation:
        "The two heuristics are not two relaxations — they are the same per-fact recursion with two different combining rules, and the Sussman goal is where the rules separate: a conjunction of two facts that each carry cost.",
      concepts: ["h-max", "h-add", "goal aggregation"],
    },
    {
      kind: "exercise",
      id: "e-04-e3",
      exerciseKind: "predict-output",
      prompt:
        "Replace the program's START with the flat world — every block on the table: START = {on(A,Table), on(B,Table), on(C,Table), clear(A), clear(B), clear(C), clear(Table)} — and keep GOAL = {on(A,B), on(B,C)}. Re-run the propagation to its fixpoint. What are h-max(GOAL) and h-add(GOAL)? Type the two numbers separated by a single space, h-max first.",
      expectedOutput: "1 2",
      solution:
        "From the flat world every stacking move is one step from the start: move(A,Table,B) needs on(A,Table), clear(A), clear(B) — all START facts, all 0 — so h-add(on(A,B)) = h-max(on(A,B)) = 1 + 0 = 1; likewise on(B,C) = 1 via move(B,Table,C). Goal aggregation: h-max(GOAL) = max(1, 1) = 1, h-add(GOAL) = 1 + 1 = 2. The re-run program prints exactly 'h-max(GOAL) = 1' and 'h-add(GOAL) = 2' (verified by running it). The true optimum is also 2 — move(B,Table,C), then move(A,Table,B) — so the pattern repeats: h-max underestimates (the second conjunct is invisible to max), and h-add is exact again.",
      explanation:
        "One changed start, the same shape: h-max = 1 < h* = 2 = h-add. In the flat world no fact ever costs more than 1, so the fact tables agree everywhere once more — the entire divergence lives, again, in the goal's conjunction.",
      concepts: ["h-max", "h-add", "delete relaxation"],
    },
  ],
  terms: [
    {
      term: "delete relaxation (h+)",
      definition:
        "The planning task with every delete list emptied: licenses still checked, adds kept forever. h+(s) — the optimal relaxed plan length from s — is an admissible heuristic for the real task because every real plan survives the relaxation.",
    },
    {
      term: "h-max",
      definition:
        "The weakest computable shadow of h+: a fact costs 1 plus its most expensive precondition; a goal costs its hardest conjunct. Admissible — and exactly a fact's first appearance level in the relaxed planning graph.",
    },
    {
      term: "h-add",
      definition:
        "The informative shadow: 1 plus the SUM of precondition costs, goals summed. Not admissible in general — the sum assumes goal facts never share work — but rarely far wrong, and the workhorse of relaxed planners.",
    },
    {
      term: "relaxed planning graph",
      definition:
        "The delete-free planning graph — e-05's proposition and action levels without mutexes: a polynomial reachability ladder whose first-appearance levels are h-max values, read backward for h-add.",
    },
  ],
  mistakes: [
    {
      mistake: "Trusting h-add because it is computed on the relaxation.",
      why: "The relaxation licenses h+ — the EXACT relaxed optimum — not every quantity derived from the relaxed task. h-add's sum prices each goal fact's support separately, so work that could be shared is paid for twice; the total can pass h*, and A* with an inadmissible heuristic returns suboptimal plans without any warning at all.",
      fix: "Keep the ledger straight: h-max ≤ h+ ≤ h-add on every instance. Optimal planning wants the left of the sandwich (h-max, or a tighter admissible bound); satisficing and greedy engines take the right (h-add) and accept the risk knowingly.",
    },
    {
      mistake: "Trying to make the heuristic 'more accurate' by keeping the delete lists in the propagation.",
      why: "A cost table indexed by single facts cannot express interactions: whether an action helps depends on what else holds, and deletes make that depend on history. With destructive operators the recursions lose the fixpoint property that defines them — and recovering exactness means re-searching, which is the original problem, not a heuristic.",
      fix: "Accept the relaxation as the price of a computable number: copy the operator table with del(a) = ∅ (the program's `_del` binding is the entire trick) and let the OUTER search — over the real operators — pay for the optimism. Too weak? Tighten with better relaxations or landmarks, never by sneaking deletes back in.",
    },
    {
      mistake: "Reading h-max(GOAL) = 2 as 'the goal is two steps away'.",
      why: "h-max prices the hardest CONJUNCT and assumes the rest of the goal comes along free; conjunctions are exactly where relaxed reasoning is weakest. The Sussman goal's true distance is 3 — and even the RELAXED optimum is 3, so 2 is not the length of any plan in either world.",
      fix: "Read h-max as what it is: each goal fact's earliest relaxed level, combined by max — a lower bound. The 'together' question needs mutex reasoning (e-05, e-06) or the search itself.",
    },
  ],
  takeaways: [
    "Heuristics are derived, not invented: remove the constraint that makes the problem hard and price what remains exactly — misplaced tiles then, dropped delete lists now.",
    "h+ ≤ h* because every real plan survives the relaxation: relaxed states only accumulate facts, so no step's license is ever lost and nothing ever needs undoing.",
    "h-max pays the hardest precondition and the hardest conjunct — admissible but blind to accumulation; h-add pays for everything — informative, but the sum can overshoot h*.",
    "h-max ≤ h+ ≤ h-add on every instance; on the Sussman start they read 2 ≤ 3 ≤ 3 against an h* of 3 — the exact-looking one lands by luck, not law.",
    "Exact h+ is NP-hard, so planners propagate h-max or h-add to a fixpoint — the same relaxed propagation that Lesson e-05's planning graph scales up.",
  ],
  quiz: [
    {
      id: "e-04-q1",
      prompt: "On the Sussman start, h-max and h-add produce identical values for every single fact, yet the goal values differ: 2 versus 3. The divergence happens:",
      options: [
        { text: "In the goal aggregation: h-max takes the max over goal facts (their work can be shared), h-add the sum (none can) — and the two goal facts genuinely need separate moves", correct: true, feedback: "Correct — on(A,B) costs 2 and on(B,C) costs 1 in both tables; only the combining rule differs, and no relaxed move adds both facts at once, so the sum is honest here." },
        { text: "In the propagation: h-max's tables stop one round early", correct: false, feedback: "Both recursions took the same two improving sweeps — the program's table shows identical columns, fact by fact, all the way to the fixpoint." },
        { text: "Because h-add counts move(A,Table,B) twice", correct: false, feedback: "No move is counted twice: the sum runs over goal FACTS (2 + 1), not actions. h-add's risk is the mirror image — it refuses to SHARE an action between two goal facts." },
        { text: "Because h-max cannot represent on(B,C)", correct: false, feedback: "It can and does: on(B,C) sits in both tables at 1 — h-max simply ignores it at the goal because 1 < 2." },
      ],
      explanation: "Same tables, different combination: max assumes sharing, sum assumes none. The Sussman goal is a conjunction of two individually-priced facts — precisely where the assumption shows.",
    },
    {
      id: "e-04-q2",
      prompt: "Which statement about the three heuristics is exactly right?",
      options: [
        { text: "h-max is admissible but weak; h-add is informative but can overestimate; h+ is admissible but NP-hard to compute exactly", correct: true, feedback: "Correct — the full honesty clause: each entry trades informativeness against admissibility or computability, and you choose per contract." },
        { text: "h-add is admissible because it is computed on the relaxed operators", correct: false, feedback: "The relaxation licenses h+, the EXACT relaxed optimum — not everything computed on the relaxed task. h-add's sum sits at or above h+ and can pass h*." },
        { text: "h+ is the only admissible one of the three", correct: false, feedback: "h-max is admissible too — it lower-bounds even the relaxed optimum, since it reads each goal fact's earliest relaxed level." },
        { text: "h-max and h-add are both admissible, since both relax the problem", correct: false, feedback: "Computability on a relaxation does not confer admissibility: h-max is admissible for a reason (max ≤ relaxed cost), h-add is not (sum ≥ relaxed cost, sometimes ≥ h*)." },
      ],
      explanation: "Three heuristics, three different defects — weak, unsound, uncomputable — and the engineer's job is choosing which defect the contract tolerates.",
    },
    {
      id: "e-04-q3",
      prompt: "In the relaxed planning graph (delete-free, no mutexes), on(B,C) first appears at proposition level S1 and on(A,B) at S2. What does that say about h-max?",
      options: [
        { text: "h-max(on(B,C)) = 1 and h-max(on(A,B)) = 2 — a fact's h-max IS its first-appearance level, and the goal value is max(2, 1) = 2", correct: true, feedback: "Correct — the level sets of the relaxed graph are exactly the h-max layers, which is the bridge to e-05: its graph, without the mutex marks, is this lesson's computation scaled up." },
        { text: "h-max(GOAL) = 2 because the whole goal is achievable at level 2", correct: false, feedback: "Presence at a level is PER-FACT: the relaxed S2 contains both facts, but no 2-step relaxed plan achieves them together — the battery's h+ = 3 is the relaxed optimum, and e-05's mutex-marked graph first allows the pair together at S3, the real h*." },
        { text: "Nothing — h-max is defined only through the min-max recursion, not through levels", correct: false, feedback: "The recursion's fixpoint layers ARE the levels, by induction: a fact first appears at level k exactly when its cheapest supporter's preconditions have all appeared by k − 1." },
        { text: "h-max(on(A,B)) = 3, since the real plan needs three steps", correct: false, feedback: "That confuses h-max with h*: the relaxed world never needs the full three — with no deletes, the unstacking prefix is never forced." },
      ],
      explanation: "First-appearance levels are h-max values — the fact that makes relaxed Graphplan and this lesson's propagation the same computation in two costumes.",
    },
  ],

};
