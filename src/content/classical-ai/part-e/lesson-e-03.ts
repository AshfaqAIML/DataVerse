/**
 * Lesson e-03 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_03: ClassicalLesson = {

  slug: "e-03",
  title: "Progression and Regression",
  minutes: 35,
  summary:
    "Search forward from the initial state or backward from the goal — two directions with very different frontiers.",
  kind: "coding",
  objectives: [
    "Trace a progression BFS by hand, level by level, with frontier sizes",
    "Define regression search with its relevance and consistency conditions, and justify each",
    "Implement both directions from one operator library and read plans off the parent chains",
    "Choose a search direction with measurements, not folklore",
  ],
  why: "Lesson e-01 ended with a program that solved the Sussman anomaly and quietly begged a question: it searched forward from the start, but nothing in the formalism requires that direction. This lesson names both choices and runs them on the same problem. Progression is Part A's BFS wearing logic-colored clothes — same frontier, same visited set, longer state labels. Regression is stranger and more seductive: search backward from the goal, asking not 'what can I do now?' but 'what could just have happened?' — and only through actions that are relevant (they achieve something still needed) and consistent (they destroy nothing kept). The theory says regression wins when goals are small and worlds are vast; the measurement on our three-block world says the opposite — 240 subgoal-sets against 13 states — and that tension is the lesson's real payload: a search direction is a bet about where the space is thin, and bets should be measured, not recited.",
  blocks: [
    {
      kind: "text",
      text: "One operator library, two directions. **Progression** starts at the initial state and asks the forward question — given what IS, what can I make true next? **Regression** starts at the goal and asks the backward question — given what MUST HOLD, what could have just happened? Both are breadth-first searches at heart; what differs is what sits in the frontier, which actions are worth considering, and where the space is thin enough to win.",
    },
    { kind: "heading", text: "Progression: forward through the world" },
    {
      kind: "text",
      text: "Progression search is Part A's BFS with one upgrade: states are sets of ground propositions, actions are licensed by a subset test, and the goal test is another subset test. e-01's program already ran one — anonymously. Naming it matters because the whole Part A toolkit carries over unchanged: A* with an admissible heuristic (e-04 supplies one), iterative deepening, bidirectional search — every forward-search refinement you own applies to progression the moment you recognize it as search.",
    },
    {
      kind: "pseudocode",
      title: "Progression BFS",
      lines: [
        { text: "PROGRESSION-BFS(START, GOAL, OPS)" },
        { text: "frontier ← FIFO queue containing START;  parent[START] ← nil", indent: 1 },
        { text: "while frontier not empty:", indent: 1 },
        { text: "s ← pop(frontier)", indent: 2 },
        { text: "if GOAL ⊆ s: return plan by walking parent from s", indent: 2, tone: "key", note: "subset test — the only new part" },
        { text: "for each operator a with pre(a) ⊆ s:", indent: 2 },
        { text: "s' ← (s − del(a)) ∪ add(a)", indent: 3 },
        { text: "if s' unseen: parent[s'] ← (s, a);  push(frontier, s')", indent: 3 },
      ],
      note: "Part A's BFS verbatim, with the state type swapped for a proposition set.",
    },
    { kind: "heading", text: "Regression: backward from the goal" },
    {
      kind: "math",
      title: "The regression rule and its two conditions",
      displays: [
        { expr: "g' = (g - \\text{add}(a)) \\cup \\text{pre}(a)", label: "the pre-image" },
        { expr: "\\text{add}(a) \\cap g \\ne \\emptyset", label: "relevance" },
        { expr: "\\text{del}(a) \\cap (g - \\text{add}(a)) = \\emptyset", label: "consistency" },
      ],
      caption:
        "Regress the subgoal set g through action a: drop what a achieves (it will be re-achieved by a itself) and demand a's preconditions instead. Relevance keeps the frontier narrow — an action that achieves nothing still needed cannot be the step you are unwinding. Consistency keeps regressions honest — an action that deletes a kept subgoal promises a pre-image from which the goal is unreachable by that step.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why consistency is the Sussman trap, re-entering through the back door",
      text: "Suppose regression, unwinding {on(A,B), on(B,C)}, considered move(A,B,Table) — perfectly legal, perfectly destructive. It does not pass relevance here (it adds neither goal fact), but in a bigger set the danger is real: an action that deletes a subgoal the set still needs produces a pre-image g' such that NO forward execution of a from a g'-satisfying state reaches g. Plans built through inconsistent regressions look fine on paper and replay broken — the project's replay verifier exists to catch exactly this class of lie. Relevance prunes; consistency refuses to lie.",
    },
    {
      kind: "pseudocode",
      title: "Regression BFS",
      lines: [
        { text: "REGRESSION-BFS(GOAL, START, OPS)" },
        { text: "frontier ← FIFO queue containing GOAL;  parent[GOAL] ← nil", indent: 1 },
        { text: "while frontier not empty:", indent: 1 },
        { text: "g ← pop(frontier)", indent: 2 },
        { text: "if g ⊆ START: return plan — walk parent from g toward GOAL", indent: 2, tone: "key", note: "every subgoal already true — the chain has bottomed out" },
        { text: "for each operator a:", indent: 2 },
        { text: "if add(a) ∩ g ≠ ∅ and del(a) ∩ (g − add(a)) = ∅:", indent: 3, tone: "key", note: "relevance, then consistency" },
        { text: "g' ← (g − add(a)) ∪ pre(a)", indent: 4 },
        { text: "if g' unseen: parent[g'] ← (g, a);  push(frontier, g')", indent: 4 },
      ],
      note: "The frontier holds sets of facts that must hold — states by other means.",
    },
    {
      kind: "example",
      title: "Progression by hand, level by level, on the anomaly",
      problem:
        "Run progression BFS from the Sussman start to the goal {on(A,B), on(B,C)} — every depth accounted: frontier sizes, the licensed operators, and where the goal finally pops.",
      steps: [
        {
          text: "Depth 0 — one state, three licensed operators.",
          detail:
            "S0 = {on(C,A), on(A,Table), on(B,Table), clear(C), clear(B), clear(Table)} — the anomaly's start. The licensed set is e-01's counted three: move(C,A,Table), move(C,A,B), move(B,Table,C). Expanded so far: 1.",
        },
        {
          text: "Depth 1 — three successors; the frontier triples.",
          detail:
            "s1a (C to table) = the flat world {on(A,Table), on(B,Table), on(C,Table), clear(A), clear(B), clear(C), clear(Table)} · s1b (C onto B) = {on(C,B), on(A,Table), on(B,Table), clear(A), clear(C), clear(Table)} · s1c (B onto C) = the tower A–C–B: {on(A,Table), on(C,A), on(B,C), clear(B), clear(Table)}. Expanded: 3 more (running total 4).",
        },
        {
          text: "Depth 2 — five new states; branching bites unevenly.",
          detail:
            "From the flat s1a, six stacking moves are licensed: four produce new states (including the goal route s2 = B-on-C with A, C on table, and the greedy trap A-on-B with B, C on table), while move(C,Table,B) lands on s1b and move(C,Table,A) lands on START — both already seen. From s1b only one move yields something new (the tower B–C–A); from the tower s1c, the single licensed move (move(B,C,Table)) walks back to START. Frontier at depth 2: 5 states. Running total expanded: 9.",
        },
        {
          text: "Depth 3 — the goal pops; the accounting closes.",
          detail:
            "The depth-3 frontier holds 4 states; among them, reached by move(A,Table,B) from s2, the goal state {on(A,B), on(B,C), on(C,Table), clear(A), clear(Table)} — B on C, A on B, C on the table. Total expanded: 1 + 3 + 5 + 4 = 13. The plan, read off the parent chain: move(C,A,Table) → move(B,Table,C) → move(A,Table,B).",
        },
        {
          text: "The punchline: 13 is not a coincidence.",
          detail:
            "Run the same BFS with the early stop removed and it confirms the reachable world from this start is EXACTLY 13 states. The 13th pop didn't just find the goal — it had seen the entire space. On this problem, progression is an exhaustive census.",
        },
      ],
      result:
        "Plan (depth 3): move(C,A,Table) → move(B,Table,C) → move(A,Table,B) — through the FLAT world. Frontier sizes 1 · 3 · 5 · 4; thirteen states expanded; the reachable space is thirteen.",
    },
    {
      kind: "stateSpace",
      title: "The explored region's critical slice",
      graph: {
        nodes: [
          { id: "start", label: "S0: C on A", sub: "A, B on table", x: 8, y: 50, tone: "start" },
          { id: "s1a", label: "flat world", sub: "all clear", x: 34, y: 10 },
          { id: "s1b", label: "C on B", sub: "A, B on table", x: 34, y: 90 },
          { id: "s1c", label: "tower A-C-B", sub: "B on C on A", x: 34, y: 50 },
          { id: "s2", label: "B on C", sub: "A, C on table", x: 64, y: 10 },
          { id: "s2b", label: "A on B (trap)", sub: "B, C on table", x: 64, y: 90 },
          { id: "goal", label: "G: A on B on C", sub: "C on table", x: 90, y: 50, tone: "goal" },
        ],
        edges: [
          { from: "start", to: "s1a", label: "move(C,A,Table)", highlighted: true },
          { from: "start", to: "s1b", label: "move(C,A,B)" },
          { from: "start", to: "s1c", label: "move(B,Table,C)" },
          { from: "s1a", to: "s2", label: "move(B,Table,C)", highlighted: true },
          { from: "s1a", to: "s2b", label: "move(A,Table,B)", dashed: true },
          { from: "s2", to: "goal", label: "move(A,Table,B)", highlighted: true },
        ],
        legend: [
          ["start", "initial state"],
          ["goal", "goal state"],
          ["edge", "operator"],
        ],
        caption:
          "The goal route runs S0 → flat world → B-on-C → goal (highlighted): flatten C first, then stack — the interleave from e-01. The dashed edge is the greedy trap: A-on-B achieved at depth 2, but the goal needs B under A, and every continuation from there must first undo it. Frontier sizes across depths: 1 · 3 · 5 · 4; thirteen states expanded in total.",
      },
      solutionNote:
        "A plan is any operator path from S0 to a state containing both goal facts; the shortest such path has length 3.",
    },
    {
      kind: "pythonImpl",
      title: "Both directions, one library, real counts",
      intent:
        "Run progression and regression BFS on the Sussman anomaly from the same 36-operator library and compare what each frontier costs — the honest way to choose a direction.",
      code: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

SURFACES = ["A", "B", "C", "Table"]
OPS = {}
for x in ["A", "B", "C"]:
    for y in SURFACES:
        for z in SURFACES:
            if z != x and z != y:
                o = make_move(x, y, z)
                OPS[o[0]] = o

START = {"on(C,A)", "on(A,Table)", "on(B,Table)",
         "clear(C)", "clear(B)", "clear(Table)"}
GOAL = {"on(A,B)", "on(B,C)"}

from collections import deque

# ---- progression: BFS forward from START (e-01's engine) ----
parent = {frozenset(START): None}
q = deque([frozenset(START)])
plan, expanded = None, 0
while q and plan is None:
    s = q.popleft()
    expanded += 1
    if GOAL <= s:
        seq = []
        while parent[s] is not None:
            s, act = parent[s]
            seq.append(act)
        plan = list(reversed(seq))
        break
    for name, op in OPS.items():
        if op[1] <= s:
            t = frozenset((s - op[3]) | op[2])
            if t not in parent:
                parent[t] = (s, name)
                q.append(t)
print("progression:", " -> ".join(plan))
print("  length", len(plan), "- states expanded", expanded)

# ---- regression: BFS backward from GOAL over subgoal SETS ----
def usable(g, op):
    _, pre, add, delete = op
    return bool(add & g) and not (delete & (g - add))  # relevant + consistent

rparent = {frozenset(GOAL): None}
rq = deque([frozenset(GOAL)])
rplan, rexpanded = None, 0
while rq and rplan is None:
    g = rq.popleft()
    rexpanded += 1
    if g <= START:
        landed = ", ".join(sorted(g))      # save before the walk reassigns g
        seq = []
        while rparent[g] is not None:
            g, act = rparent[g]
            seq.append(act)
        rplan = seq                        # START->GOAL walk = forward order
        print("regression :", " -> ".join(rplan))
        print("  length", len(rplan), "- subgoal-sets expanded", rexpanded)
        print("  landed on:", landed)
        break
    for name, op in OPS.items():
        if usable(g, op):
            g2 = frozenset((g - op[2]) | op[1])
            if g2 not in rparent:
                rparent[g2] = (g, name)
                rq.append(g2)`,
      output: `progression: move(C,A,Table) -> move(B,Table,C) -> move(A,Table,B)
  length 3 - states expanded 13
regression : move(C,A,Table) -> move(B,Table,C) -> move(A,Table,B)
  length 3 - subgoal-sets expanded 240
  landed on: clear(B), clear(C), clear(Table), on(A,Table), on(B,Table), on(C,A)`,
      walkthrough: [
        "The progression half is e-01's program, verbatim: 13 states expanded, the same three-step plan — reproduction, not coincidence.",
        "usable() is the two-condition gate in one line: relevance (add & g) then consistency (delete ∩ (g − add) empty). 34 of 36 operators fail relevance at the goal itself.",
        "The regression frontier holds frozensets of FACTS — subgoal sets, not states. The visited check is set equality on those.",
        "The landing test g ⊆ START fires when every regressed subgoal is already true; the parent walk from there toward GOAL comes out in forward plan order — no reversal (reversing it is the classic bug; see mistakes).",
        "The honest measurement: 240 subgoal-sets expanded against 13 states — regression loses eighteen-fold on this world. Both engines return the identical optimal plan, length 3, and the regression chain lands on exactly the start state.",
      ],
      project:
        "The project's progression engine is this program's first half, parameterized; the replay verifier is what makes the regression side trustworthy.",
    },
    {
      kind: "table",
      title: "Two directions, one library",
      headers: ["", "Progression", "Regression"],
      rows: [
        ["Searches", "forward: states reachable from the start", "backward: pre-images of the goal"],
        ["Frontier holds", "states — facts that ARE", "subgoal sets — facts that MUST HOLD"],
        ["Actions considered", "all licensed: pre(a) ⊆ s", "only relevant and consistent ones"],
        ["Goal test", "GOAL ⊆ s", "g ⊆ START"],
        ["Measured here", "13 states expanded", "240 subgoal-sets expanded"],
        ["Wins when", "reachable space small, goal deep in it", "goal small, reachable space vast (delivery at city scale)"],
      ],
      caption:
        "The last two rows are the lesson in miniature. On the anomaly, regression's promise inverts: relevance is a weak filter when nearly every operator adds something goal-adjacent, and subgoal sets recombine faster than states accumulate — 240 against 13, generating 949 distinct sets along the way. In a delivery world with millions of reachable states and a two-fact goal, the same bet pays handsomely. Direction is a bet about the SHAPE of the space; measure it before you commit.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-03-e1",
      exerciseKind: "predict-output",
      prompt:
        "In the hand-traced run above, how many states wait in the frontier when the search reaches depth 2? Type the number.",
      expectedOutput: "5",
      solution: "5",
      explanation:
        "Frontier sizes run 1 (depth 0), 3 (depth 1 — the three licensed successors), 5 (depth 2 — four new states from the flat world plus one tower from s1b), 4 (depth 3). Branching is uneven: the tower state s1c licenses exactly one move and it walks back to START, contributing nothing new at depth 2.",
      concepts: ["progression search", "frontier"],
    },
    {
      kind: "exercise",
      id: "e-03-e2",
      exerciseKind: "trace",
      prompt:
        "Regress the Sussman goal g = {on(A,B), on(B,C)} by one step, by hand: list every operator that is BOTH relevant and consistent, and write the two subgoal sets those operators produce.",
      solution:
        "Relevance first — operators whose add list meets g: only move(A,Table,B) (adds on(A,B)) and move(B,Table,C) (adds on(B,C)); 34 of the 36 fail this test. Consistency second: move(A,Table,B) deletes {on(A,Table), clear(B)}, and g − add = {on(B,C)} — disjoint, consistent. move(B,Table,C) deletes {on(B,Table), clear(C)}, and g − add = {on(A,B)} — disjoint, consistent. Pre-images: g1 = (g − {on(A,B)}) ∪ {on(A,Table), clear(A), clear(B)} = {on(B,C), on(A,Table), clear(A), clear(B)}; g2 = (g − {on(B,C)}) ∪ {on(B,Table), clear(B), clear(C)} = {on(A,B), on(B,Table), clear(B), clear(C)}. Neither is a subset of START — the search continues, and both routes eventually converge on the same three-step plan.",
      explanation:
        "Relevance is the wide filter, consistency the honest one; together they cut 36 operators to 2 at the first step. And note what the frontier holds after this step: subgoal SETS — {on(B,C), on(A,Table), clear(A), clear(B)} is not a state any action sequence need ever realize in one piece.",
      concepts: ["regression search", "relevance", "consistency"],
    },
    {
      kind: "exercise",
      id: "e-03-e3",
      exerciseKind: "concept-check",
      prompt:
        "The measurement: progression expanded 13 states, regression expanded 240 subgoal-sets on the same problem, and both found the same optimal plan. What does this actually establish?",
      options: [
        { text: "Regression is the wrong idea — delete it from the toolbox", correct: false, feedback: "Overreach. Regression's pre-images are exactly right when goals are small and reachable spaces vast; one counter-example kills a universal claim, not the direction." },
        { text: "Direction is a bet about where the space is thin: here relevance passes for many of the 36 operators, so subgoal sets proliferate faster than states — in a delivery-scale world the same bet pays", correct: true, feedback: "Correct — the honest reading. 240 vs 13 is structural for THIS problem shape: a tiny world whose goal facts nearly every operator touches." },
        { text: "The numbers are meaningless — they depend on enumeration order", correct: false, feedback: "They do depend on operator enumeration order (both engines iterate OPS in insertion order), but the eighteen-fold gap is structural, not an artifact." },
        { text: "Progression is optimal and regression is not", correct: false, feedback: "Both are BFS over their respective spaces and both returned length-3 plans — optimality is not the difference; frontier growth is." },
      ],
      solution: "Direction is a bet; measure it.",
      explanation:
        "The table's last two rows: on the anomaly the bet inverts, and the reason is the shape of the space — almost every operator adds something goal-adjacent, so relevance barely prunes and sets recombine endlessly.",
      concepts: ["progression search", "regression search", "state space"],
    },
  ],
  terms: [
    {
      term: "progression search",
      definition: "Forward search from the initial state through Next(s,a) — Part A's BFS or A* over a logically described space, with a subset goal test.",
    },
    {
      term: "regression search",
      definition: "Backward search from the goal through pre-images g' = (g − add(a)) ∪ pre(a), restricted to relevant and consistent actions.",
    },
    {
      term: "relevant action",
      definition: "An action whose add list intersects the current subgoal set — it achieves something the set still needs, so it could be the step being unwound.",
    },
    {
      term: "consistent regression",
      definition: "A regression step whose action deletes nothing the subgoal set keeps (del(a) ∩ (g − add(a)) = ∅) — the pre-image makes no promise the step cannot keep.",
    },
    {
      term: "subgoal set",
      definition: "A set of facts that must all hold in some earlier state; regression's frontier holds these sets, not states — they need never be realized all at once.",
    },
  ],
  mistakes: [
    {
      mistake: "Forgetting the consistency condition.",
      why: "Relevance alone lets regression walk through actions that demolish kept subgoals; the pre-image then promises a waypoint the forward execution never visits, and plans replay broken.",
      fix: "Run both tests before regressing: if the delete list so much as grazes g − add(a), refuse the step. The project's replay verifier is the safety net that catches this class of lie at runtime.",
    },
    {
      mistake: "Assuming backward is automatically cheaper.",
      why: "The folklore says small goal, small frontier; the anomaly says otherwise — 240 subgoal-sets against 13 states, because nearly every operator adds something goal-adjacent and the sets recombine endlessly.",
      fix: "Measure both directions on a sample before committing. A direction is a bet about where the space is thin, and the bet should be priced, not recited.",
    },
    {
      mistake: "Reading the regression parent chain backward.",
      why: "The chain runs from the landing set (⊆ START) up to the goal; walking it in that direction already yields FORWARD plan order — reversing it garbles the plan. (This lesson's own development tripped on exactly this bug.)",
      fix: "Walk from the landing set toward the goal and read the actions in walk order — no reversal, no cleverness.",
    },
  ],
  takeaways: [
    "Progression is Part A's BFS with a subset goal test — the formalism changed the labels, not the engine.",
    "Regression searches pre-images: g' = (g − add(a)) ∪ pre(a), through relevant and consistent actions only.",
    "Both directions found the anomaly's optimal plan — move(C,A,Table) → move(B,Table,C) → move(A,Table,B), length 3.",
    "Measured on the anomaly: 13 states forward against 240 subgoal-sets backward — direction is a measured bet, not a law.",
    "The reachable world from the anomaly's start is exactly 13 states; the forward search's last pop closed the whole space.",
  ],
  quiz: [
    {
      id: "e-03-q1",
      prompt: "The consistency condition del(a) ∩ (g − add(a)) = ∅ exists to stop regression from:",
      options: [
        { text: "Choosing an action that achieves nothing the set needs", correct: false, feedback: "That is what RELEVANCE refuses; consistency is about destruction, not idleness." },
        { text: "Revisiting a subgoal set it has already expanded", correct: false, feedback: "That is the visited set's job — a memory device, not a soundness condition." },
        { text: "Choosing an action that destroys a subgoal the set still keeps — promising a pre-image from which the goal is unreachable by that step", correct: true, feedback: "Correct — consistency is the soundness condition: regressions that pass it compose into plans that replay; regressions that fail it compose into fiction." },
        { text: "Expanding sets before states", correct: false, feedback: "Category confusion — regression's frontier holds only sets; there is no ordering between kinds to violate." },
      ],
      explanation: "Relevance prunes; consistency refuses to lie. The two conditions together make the backward chain trustworthy.",
    },
    {
      id: "e-03-q2",
      prompt: "Why did regression expand 240 subgoal-sets where progression expanded 13 states?",
      options: [
        { text: "Relevance passes for many of the 36 operators and the resulting sets keep recombining — the subgoal-set space dwarfs the 13-state reachable world", correct: true, feedback: "Correct — 949 distinct sets were generated before the landing set popped; the tiny world's goal facts touch nearly every operator, so the filter barely bites." },
        { text: "The regression implementation is buggy — backward search should always be faster", correct: false, feedback: "No bug: both engines return the identical optimal plan. The gap is the space's shape, not a defect." },
        { text: "Progression got lucky with operator tie-breaking", correct: false, feedback: "Thirteen is not luck — it is the ENTIRE reachable space; every tie-break would exhaust it too." },
        { text: "The goal was regressed from the wrong end", correct: false, feedback: "The landing set is exactly the start state and the plan replays — the chain ran the right way." },
      ],
      explanation: "The honest measurement inverts the folklore on this problem shape — the lesson's central caution about direction-as-bet.",
    },
    {
      id: "e-03-q3",
      prompt: "Regression's goal test is g ⊆ START. When it fires:",
      options: [
        { text: "Every regressed subgoal is already true initially — the pre-image chain has bottomed out, and walking the parent chain from g toward GOAL yields the plan in forward order", correct: true, feedback: "Correct — subset, not equality (the run here happens to land exactly on START, but only ⊆ is required); the walk direction IS the plan direction." },
        { text: "The goal state has been reached by forward execution", correct: false, feedback: "That is progression's test; regression never executes anything — it composes promises backward." },
        { text: "The search can stop without a plan", correct: false, feedback: "The opposite: this IS the success condition — the plan is one parent-walk away." },
        { text: "g must equal START exactly, or the plan is invalid", correct: false, feedback: "Equality is sufficient but not required; any subset of initially-true facts closes the chain honestly." },
      ],
      explanation: "Bottoming out is success: the kept subgoals are already true, and the walked chain is the plan.",
    },
  ],

};
