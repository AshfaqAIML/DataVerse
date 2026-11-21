/**
 * Lesson e-01 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_01: ClassicalLesson = {

  slug: "e-01",
  title: "STRIPS: States, Actions and Goals",
  minutes: 35,
  summary:
    "The blocks world and its famous operators: states as proposition sets, actions that add and delete exactly what they say.",
  kind: "concept",
  objectives: [
    "Read a STRIPS operator: name, preconditions, add list, delete list",
    "Compute Next(s, a) — the successor state — by hand",
    "Explain classical planning's five assumptions and their limits",
    "Recognize the Sussman anomaly and why greedy subgoal pursuit fails",
  ],
  why: "Planning is where the school's two halves meet: search (Part A) over states described by logic (Part D). STRIPS — named for the 1971 Stanford Research Institute system that introduced it — makes the marriage concrete: a state is a set of propositions, an action is a triple of preconditions and effects, and planning is search through the space such triples generate. The blocks world is its demonstration ground, small enough to draw and deep enough to hide the Sussman anomaly — the three-block instance where achieving each subgoal in order makes the others impossible. That anomaly, and the planner's response to it, is the intellectual center of the subject.",
  blocks: [
    {
      kind: "text",
      text: "A planner's world is described in facts: on(A, B), clear(C), holding(X). A **state** is the set of facts currently true; an **action** is a machine that checks a license and edits the world. Everything else in classical planning — the search spaces of Lesson e-03, the heuristics of e-04, the graphs of e-05 — is machinery over this one data structure.",
    },
    {
      kind: "definition",
      term: "STRIPS operator",
      informal:
        "An action template: the facts that must hold (preconditions), the facts it makes true (add list), and the facts it removes (delete list).",
      formal:
        "\\text{Next}(s, a) = (s - \\text{del}(a)) \\cup \\text{add}(a) \\quad \\text{when } \\text{pre}(a) \\subseteq s",
      why: "The triple is planning's ABI — every planner, solver and benchmark language of fifty years speaks it.",
    },
    {
      kind: "table",
      title: "The blocks world, four operators",
      headers: ["Operator", "Preconditions", "Add", "Delete"],
      rows: [
        ["move(x, y, Table)", "on(x,y), clear(x)", "on(x,Table), clear(y)", "on(x,y)"],
        ["move(x, y, z)", "on(x,y), clear(x), clear(z)", "on(x,z), clear(y)", "on(x,y), clear(z)"],
        ["move(x, Table, z)", "on(x,Table), clear(x), clear(z)", "on(x,z)", "on(x,Table), clear(z)"],
        ["(persist)", "p", "p", "—"],
      ],
      caption:
        "The Table never needs clearing and never stops being 'a place' — the conventions that keep the operator set small. The persist row is the no-op that lets facts survive, essential once the planning graph arrives in e-05.",
    },
    { kind: "heading", text: "The five assumptions" },
    {
      kind: "definition",
      term: "Classical planning assumptions",
      informal:
        "Deterministic, instantaneous, fully observable, single-agent, finite — the world the classical formalism prices.",
      formal:
        "\\text{deterministic, instantaneous, fully observable, single agent, finite}",
      why: "Every extension era — temporal, probabilistic, multiagent — is named for the assumption it drops; knowing the baseline tells you which textbook chapter your problem lives in.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why propositions instead of full first-order logic?",
      text: "A STRIPS state is a SET of GROUND propositions — no variables, no quantifiers, no disjunction. The logic of Part D would let states mean 'there exists some block under A'; STRIPS states say exactly which one. That restriction buys decidability and a clean successor function; the FOL structure survives one level up, in the OPERATORS' variables (move(x, y, z) with x, y, z standing for every consistent instantiation). Power where it reasons, groundness where it acts.",
    },
    { kind: "heading", text: "The anomaly that named a problem" },
    {
      kind: "example",
      title: "Computing a successor, by hand",
      problem:
        "State s = {on(C,A), on(A,Table), on(B,Table), clear(C), clear(B), clear(Table)}. Apply move(C, A, Table).",
      steps: [
        { text: "Check the license: pre = {on(C,A), clear(C)} — both in s. Licensed.", detail: "Preconditions are CONJUNCTIVE: all must hold, and nothing else is consulted." },
        { text: "Compute the next state: (s − del) ∪ add.", detail: "del = {on(C,A)}; add = {on(C,Table), clear(A)}. Note what the delete list does NOT contain: clear(C) survives — C is still clear on the table." },
        { text: "Read the result.", detail: "s' = {on(A,Table), on(B,Table), on(C,Table), clear(A), clear(B), clear(C), clear(Table)} — the flat world, three towers of one." },
      ],
      result:
        "One application of Next(s, a): mechanical, order-insensitive within the step, and — this matters — never partial. STRIPS actions are atomic edits.",
    },
    {
      kind: "stateSpace",
      title: "The Sussman anomaly's critical region",
      graph: {
        nodes: [
          { id: "start", label: "S: C on A", sub: "A,B on table", x: 12, y: 50, tone: "start" },
          { id: "mid", label: "B on C", sub: "A, C on table", x: 50, y: 22 },
          { id: "mid2", label: "C on A → off", sub: "all on table", x: 50, y: 78 },
          { id: "goal", label: "G: A on B, B on C", x: 88, y: 50, tone: "goal" },
        ],
        edges: [
          { from: "start", to: "mid2", label: "move(C,A,Table)" },
          { from: "mid2", to: "mid", label: "move(B,Table,C)" },
          { from: "mid", to: "goal", label: "move(A,Table,B)", highlighted: true },
          { from: "start", to: "mid", label: "blocked: C sits on A", dashed: true },
        ],
        legend: [
          ["start", "initial state"],
          ["goal", "goal state"],
          ["edge", "operator"],
        ],
        caption:
          "The critical region: the goal G is reachable only through the highlighted three-operator route — achieve B-on-C first, then A-on-B. The dashed edge is the tempting shortcut (stack B straight onto C): blocked, because C carries A and must be cleared first. Greedy subgoal order walks into the undo loop; the search finds the interleave.",
      },
      solutionNote:
        "A plan is a sequence of operators from S to any state containing both goal propositions; the shortest such sequence has length 3.",
    },
    {
      kind: "pythonImpl",
      title: "A STRIPS simulator, and the anomaly solved by breadth-first progression",
      intent:
        "Implement the operator triple, generate the state space with plain BFS (progression search — the Part A tool, upgraded), and watch it find the three-step plan that subgoal-greedy reasoning cannot.",
      code: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

def apply(state, op):
    name, pre, add, delete = op
    return (state - delete) | add if pre <= state else None

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
parent = {frozenset(START): None}
q = deque([frozenset(START)])
plan, expanded = None, 0
while q and plan is None:
    s = q.popleft()
    expanded += 1
    if GOAL <= s:
        seq, cur = [], s
        while parent[cur] is not None:
            cur, act = parent[cur]
            seq.append(act)
        plan = list(reversed(seq))
        break
    for name, op in OPS.items():
        t = apply(s, op)
        if t is not None and frozenset(t) not in parent:
            parent[frozenset(t)] = (s, name)
            q.append(frozenset(t))
print("plan:", " -> ".join(plan) if plan else "no plan found")
print("length:", len(plan) if plan else 0, "· states expanded:", expanded)`,
      output: `plan: move(C,A,Table) -> move(B,Table,C) -> move(A,Table,B)
length: 3 · states expanded: 13`,
      walkthrough: [
        "make_move builds the operator table: 36 instantiations for three blocks and four surfaces — the FOL-style template expanded to ground operators.",
        "apply IS the definition from this lesson: subset check, set arithmetic, and None for unlicensed actions (the search skips those).",
        "The BFS is Part A's, unmodified: frontier, parent chain, first-goal-wins. Planning-as-search is literal here.",
        "The plan flattens C first — the counter-intuitive move that greedy subgoal ordering cannot see — then builds B-on-C, then A-on-B. Thirteen states expanded for a three-block world; the fifteen-puzzle's 10^13 looms as the motivation for everything after e-03.",
      ],
      project: "The Part E project's operator library and replay verifier are exactly these two functions, hardened.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-01-e1",
      exerciseKind: "predict-output",
      prompt:
        "In the Sussman start state, how many of the 36 operators are licensed (preconditions ⊆ s)? Count them — or run a one-line check on the program's OPS and START. Type the number.",
      expectedOutput: "3",
      solution: "3",
      explanation:
        "Only move(C,A,Table), move(B,Table,A)... careful — verify: clear blocks are C and B; on-towers are C-on-A, A-on-Table, B-on-Table. Licensed: move(C,A,Table) [on(C,A), clear(C)], move(C,A,B) [clear(C), clear(B)], move(B,Table,A) [on(B,Table), clear(B), clear(A)? A is NOT clear — C sits on it: fails], move(B,Table,C) [clear(B), clear(C): licensed!]. So: move(C,A,Table), move(C,A,B), move(B,Table,C) — three operators, and the program's BFS tries them all in the first expansion.",
      concepts: ["STRIPS", "applicability"],
    },
    {
      kind: "exercise",
      id: "e-01-e2",
      exerciseKind: "trace",
      prompt:
        "Explain the Sussman failure precisely: why does achieving 'A on B' FIRST (the first subgoal in the goal's natural reading) doom the plan to extra steps?",
      solution:
        "In the start state, A-on-B requires moving A onto B: but A carries C, so first move(C,A,Table) (or onto B), then move(A,Table,B). Suppose we do move(C,A,B) then move(A,Table,B): now A-on-B holds — but the second subgoal B-on-C demands B move, and B is under A: B cannot move while A sits on it. Achieving B-on-C now requires tearing down A-on-B (move(A,B,Table) at least), undoing the achieved subgoal. The dependency is inverted: the subgoal achieved first (A-on-B) is the one that must be achieved LAST. Greedy 'do the first listed subgoal first' cannot see the inversion; interleaved search — or regression from the goal — can.",
      explanation:
        "The anomaly is why planners plan: any procedure that treats the goal as a checklist of independent errands walks into the undo loop. Subgoal interactions are the cost of decomposition — and the reason the planning-graph lesson exists.",
      concepts: ["Sussman anomaly", "subgoal interactions"],
    },
    {
      kind: "exercise",
      id: "e-01-e3",
      exerciseKind: "concept-check",
      prompt:
        "Which assumption does a robot with slippery grippers break first — and what does the classical formalism do about it?",
      options: [
        { text: "Full observability — the gripper's state is hidden", correct: false, feedback: "Slipperiness is about OUTCOMES, not sensing: you may see everything and still not control what happens next." },
        { text: "Determinism: the same action in the same state can produce different next states — the classical successor function no longer exists", correct: true, feedback: "Correct — nondeterminism breaks Next(s,a) as a function, and the formalism's honest extensions are MDPs and contingency planning (probabilities and branches), both outside classical planning's five assumptions." },
        { text: "The single-agent assumption — the table is an agent", correct: false, feedback: "Whimsical, but physics-as-adversary is nondeterminism again, not multi-agency." },
        { text: "Finiteness — gripper states are continuous", correct: false, feedback: "That is a modeling choice made before STRIPS even enters; the sharper break is the outcome function." },
      ],
      solution: "Determinism first: when outcomes vary, the plan's meaning changes from 'a sequence that works' to 'a policy that copes'.",
      explanation: "Each dropped assumption names a field: nondeterminism → MDPs, duration → temporal planning, hidden state → POMDPs. The five-assumption line is the map of the extension eras.",
      concepts: ["classical planning assumptions", "determinism"],
    },
  ],
  terms: [
    {
      term: "preconditions",
      definition: "The facts that must ALL hold for an operator to be applicable in a state — the action's license.",
    },
    {
      term: "add / delete lists",
      definition: "The facts an action makes true and false: the world edit, stated exhaustively and without side conditions.",
    },
    {
      term: "ground proposition",
      definition: "A fact with no variables — on(A, B), not on(x, y). STRIPS states contain only ground facts; operators carry the variables.",
    },
    {
      term: "Sussman anomaly",
      definition: "The three-block instance where achieving goal subgoals in the natural order forces undoing them — the canonical proof that subgoal interactions defeat naive decomposition.",
    },
  ],
  mistakes: [
    {
      mistake: "Forgetting an add or delete in an operator.",
      why: "The lists are the world's entire dynamics: a missing add leaves stale facts, a missing delete leaves contradictory ones — and the search happily reasons through the fiction.",
      fix: "For each operator, write the frame sentence aloud: 'moving x from y to z makes y clear, un-cleares z, and moves x.' Then diff against the lists.",
    },
    {
      mistake: "Making the Table a first-class surface with clear(Table) bookkeeping.",
      why: "The table is always clear and always a place; modeling it as a block that can be blocked creates impossible states and dead operators.",
      fix: "Conventions in the operator table (as in the program: subtract 'clear(Table)' from every list) — the human handles the physics once, and the formalism never sees the fiction.",
    },
  ],
  takeaways: [
    "A STRIPS state is a set of ground propositions; an operator is (pre, add, del); Next(s,a) = (s − del) ∪ add when licensed — the whole formalism in one line.",
    "Classical planning's five assumptions are a contract; every extension era is named for the clause it drops.",
    "The Sussman anomaly shows subgoals interacting: the natural order of achievement can be exactly backwards.",
    "Planning-as-search is literal: the BFS that solved the anomaly is Part A's, run over a logically-described space.",
    "Operator errors are world-model errors: the lists are exhaustively the dynamics, and the search believes them absolutely.",
  ],
  quiz: [
    {
      id: "e-01-q1",
      prompt: "In state s = {on(A,B), on(B,Table), clear(A)}, which operator is licensed?",
      options: [
        { text: "move(A, B, Table) — pre: on(A,B), clear(A)", correct: true, feedback: "Correct — both preconditions hold; the edit yields {on(A,Table), clear(B), on(B,Table)}." },
        { text: "move(B, Table, A) — pre: on(B,Table), clear(B), clear(A)", correct: false, feedback: "clear(B) fails: A sits on B. The license is missing one conjunct, and conjunctive means conjunctive." },
        { text: "move(A, B, C)", correct: false, feedback: "There is no C in the state's vocabulary — but even granting a block C, clear(C) is unverifiable from s." },
        { text: "All of the above", correct: false, feedback: "Only the first checks out — one missing conjunct is enough to refuse." },
      ],
      explanation: "Applicability is a subset test: pre(a) ⊆ s, all conjuncts, no partial credit.",
    },
    {
      id: "e-01-q2",
      prompt: "The Sussman anomaly's lesson, compressed:",
      options: [
        { text: "Some problems are unsolvable", correct: false, feedback: "The anomaly is solvable in three steps — the lesson is about HOW, not whether." },
        { text: "Goal decomposition into independent subgoals fails when subgoals interact: the achieving order matters and can be inverted from the listing order", correct: true, feedback: "Correct — A-on-B listed first must be achieved LAST. Planners exist to find such interleavings, which checklists cannot." },
        { text: "Breadth-first search is the best planner", correct: false, feedback: "It found the three-step plan because the world is three blocks; the fifteen-puzzle-scale spaces are exactly what BFS cannot touch — hence e-03 and e-05." },
        { text: "Blocks cannot be moved", correct: false, feedback: "Physics is not the obstacle; goal structure is." },
      ],
      explanation: "Interacting subgoals are planning's signature difficulty — and the reason the planning graph reasons about ALL plans at once.",
    },
  ],

};
