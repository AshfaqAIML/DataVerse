/**
 * PART A · MODULE 1 · CHAPTER 1 · LESSON a-01 — "From Puzzles to State Spaces"
 *
 * The exemplar lesson of the Classical AI course: every specialized
 * component type is demonstrated here in its authored form. Authors of
 * other lessons follow this file's conventions exactly.
 *
 * Every `output` field is the REAL output of running the code
 * (scripts/verify-classical-outputs.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_01: ClassicalLesson = {
  slug: "a-01",
  title: "From Puzzles to State Spaces",
  minutes: 30,
  summary:
    "The eight-puzzle, route finding and the missionaries-and-cannibals problem, all as one mathematical object: a graph of states.",
  kind: "concept",
  objectives: [
    "Say precisely what a state, an operator and a state space are — and draw one from a prose description",
    "Formulate a problem as the five-tuple: initial state, successor function, goal test, path cost",
    "Explain why the state space is implicit (generated on demand) rather than stored",
    "Estimate the size of a state space from its branching factor and depth",
  ],
  why: "Watch someone solve the eight-puzzle for the first time and you will see the whole of classical AI in miniature: eyes on the tiles, a silent \u201cif I slide this one, then that one opens up\u2026\u201d, a retreat, another try. Nothing about that behavior requires learning, statistics or a nervous system. It requires a space of configurations and a way of moving between them. The founding insight of classical artificial intelligence — Newell, Shaw and Simon's General Problem Solver, 1957 — is that this is not a metaphor for problem solving. It IS problem solving: once a problem is stated as a space, a single family of algorithms can search it. Formulation is where the engineering judgment lives, and this lesson makes that translation deliberate on three problems small enough to hold in your head and famous enough to meet again for the rest of the subject.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Watch someone solve the eight-puzzle for the first time and you will see the whole of classical AI in miniature: eyes on the tiles, a silent *\u201cif I slide this one, then that one opens up\u2026\u201d*, a retreat, another try. Nothing about that behavior requires learning, statistics or a nervous system. It requires a **space of configurations** and a way of moving between them. The founding insight of classical artificial intelligence — Newell, Shaw and Simon's General Problem Solver, 1957 — is that this is not a metaphor for problem solving. It *is* problem solving, and once a problem is stated as a space, a single family of algorithms can search it. This lesson builds the object those algorithms consume: we formulate it once, formally, and then test the formulation on three famous problems — finding a driving route, sliding tiles, and ferrying missionaries and cannibals across a river without anyone being eaten.",
    },

    // ------------------------------------------------------------ the formal object
    { kind: "heading", text: "The search problem, defined" },
    {
      kind: "math",
      title: "The definition tuple",
      displays: [
        { expr: "P = \\langle S, s_0, \\text{Succ}, \\text{Goal}, c \\rangle", label: "problem" },
        { expr: "c(s, a, s') > 0", label: "step cost" },
      ],
      caption:
        "A search problem is a small tuple of pieces — pure specification, no code yet — and every algorithm in the next two modules consumes exactly these five. A solution is a sequence of actions from s\u2080 to a goal state; an optimal solution is one of minimum total cost.",
    },
    {
      kind: "definition",
      term: "State space",
      informal:
        "The set of all configurations a problem can reach, together with the moves that connect them.",
      formal: "S \\text{ closed under } \\text{Succ}: s' \\in S \\text{ whenever } s' \\in \\text{Succ}(s), s \\in S",
      why: "The distinction between \u201call states\u201d and \u201creachable states\u201d is exactly the distinction between a hopeless enumeration and a searchable space.",
    },
    {
      kind: "definition",
      term: "Successor function",
      informal:
        "The generator that, given one state, produces every state one legal move away — paired with the move that produced it.",
      formal: "\\text{Succ}(s) = \\{(a, s') : a \\text{ legal in } s\\}",
      why: "It is the only place a search algorithm learns the rules of the world.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The space is generated, never stored",
      text: "The eight-puzzle has 181,440 reachable positions and chess has more positions than atoms in the observable universe — yet a search program allocates no table of states up front. The successor function *generates* the space on demand, one expansion at a time, and the algorithms of the next module keep only a frontier of the states they have touched. When we say \u201csearch the state space\u201d we mean: walk this implicit graph without ever materializing all of it.",
    },

    // ------------------------------------------------------------ three formulations
    {
      kind: "text",
      text: "Three problems, one object. Route finding is the gentlest instance: the states are cities, the operators are the roads between them, the cost of a move is the distance on that road, and the goal test is `city == \"Bucharest\"` — the map below is the classical specimen. The eight-puzzle compresses the same idea into 3\u00d73: the state is the full board (the blank is just a tile with no face), the operators slide the blank up, down, left or right when the walls allow, and every move costs 1, so an optimal solution is simply a shortest one. Its space is small enough to measure exactly — sliding a tile is an even permutation, so the parity of the board can never change: exactly half of the 9! = 362,880 arrangements are reachable (181,440), which is why the goal test is equality with one solved board, never \u201clooks solved-ish\u201d. Notice throughout what the state *is not*: not a single tile, not a set of tiles, not the sequence of past moves. States are whole configurations; the path between them is where moves live.",
    },
    {
      kind: "stateSpace",
      title: "The Romania route map as a state space",
      graph: {
        nodes: [
          { id: "arad", label: "Arad", x: 8, y: 46, tone: "start" },
          { id: "zeri", label: "Zerind", x: 6, y: 26 },
          { id: "orad", label: "Oradea", x: 20, y: 12 },
          { id: "sibiu", label: "Sibiu", x: 32, y: 34 },
          { id: "timo", label: "Timișoara", x: 8, y: 76 },
          { id: "lugoj", label: "Lugoj", x: 24, y: 74 },
          { id: "meha", label: "Mehadia", x: 34, y: 84 },
          { id: "drob", label: "Drobeta", x: 46, y: 90 },
          { id: "craio", label: "Craiova", x: 62, y: 84 },
          { id: "rvil", label: "R. Vâlcea", x: 56, y: 58 },
          { id: "faga", label: "Făgăraș", x: 54, y: 38 },
          { id: "pitesti", label: "Pitești", x: 74, y: 66 },
          { id: "buch", label: "Bucharest", x: 90, y: 58, tone: "goal" },
          { id: "giur", label: "Giurgiu", x: 84, y: 84 },
        ],
        edges: [
          { from: "arad", to: "zeri", label: "75" },
          { from: "arad", to: "sibiu", label: "140" },
          { from: "arad", to: "timo", label: "118" },
          { from: "zeri", to: "orad", label: "71" },
          { from: "orad", to: "sibiu", label: "151" },
          { from: "timo", to: "lugoj", label: "111" },
          { from: "lugoj", to: "meha", label: "70" },
          { from: "meha", to: "drob", label: "75" },
          { from: "drob", to: "craio", label: "120" },
          { from: "craio", to: "rvil", label: "146" },
          { from: "rvil", to: "sibiu", label: "80" },
          { from: "sibiu", to: "faga", label: "99" },
          { from: "faga", to: "buch", label: "211" },
          { from: "rvil", to: "pitesti", label: "97" },
          { from: "pitesti", to: "buch", label: "101" },
          { from: "buch", to: "giur", label: "90" },
        ],
        legend: [
          ["start", "initial state"],
          ["goal", "goal state"],
          ["edge", "operator + step cost (km)"],
        ],
        caption:
          "States are cities, operators are roads, step cost is road length — a specimen of the very map Hart, Nilsson and Raphael used when they introduced A* in 1968. A solution is any Arad \u2192 Bucharest path; the optimal one (through Sibiu, R. Vâlcea, Pitești) costs 418.",
      },
      solutionNote:
        "A sequence of roads from Arad to Bucharest; the optimal such sequence costs 418 km.",
    },
    {
      kind: "example",
      title: "Formulating missionaries and cannibals",
      problem:
        "Three missionaries and three cannibals must cross a river in a boat that holds at most two. If cannibals ever outnumber missionaries on a bank, the missionaries are eaten. How do we write this as a search problem — before solving it?",
      steps: [
        {
          text: "Choose the state: only what changes.",
          detail:
            "A state is (m, c, b): how many missionaries, cannibals and the boat are on the left bank. The right bank is forced — 3\u2212m missionaries and 3\u2212c cannibals. One triple says everything; a naive formulation that tracks both banks says everything twice.",
        },
        {
          text: "Choose the operators: one crossing template.",
          detail:
            "An action moves 1 or 2 people in the boat's direction: (m + dm, c + dc, flip(b)) with 1 \u2264 dm + dc \u2264 2. Writing \u201crow left\u201d and \u201crow right\u201d as separate operators would be redundant — the boat's position in the state already says which direction is legal.",
        },
        {
          text: "Encode the safety rule as a validity test, not as search.",
          detail:
            "A successor is discarded the moment cannibals outnumber missionaries on either bank. The rule prunes the space; it is not a state component. Keeping knowledge out of states keeps them few.",
        },
        {
          text: "Set the goal test and cost.",
          detail:
            "Goal: (0, 0, R) — everyone across, boat included. Cost: 1 per crossing, so optimal means fewest crossings.",
        },
      ],
      result:
        "P = \u27e8states (m, c, b), start (3, 3, L), crossing operators, goal (0, 0, R), cost 1 per crossing\u27e9 — a space small enough to enumerate completely, which we do in code below.",
    },
    {
      kind: "pseudocode",
      title: "The successor function of the crossing problem",
      lines: [
        { text: "function SUCCESSORS((m, c, boat))", tone: "key" },
        { text: "dir \u2190 \u22121 if boat = L else +1", indent: 1, note: "the boat crosses to the other bank" },
        { text: "for each (dm, dc) in {(0,1), (0,2), (1,0), (1,1), (2,0)}", indent: 1, note: "1 or 2 passengers" },
        { text: "s' \u2190 (m + dir\u00b7dm, c + dir\u00b7dc, other(boat))", indent: 2 },
        { text: "if VALID(s') then yield (crossing(dm, dc), s')", indent: 2, note: "nobody gets eaten: neither bank outnumbers" },
        { text: "function VALID((m, c, b))", tone: "key" },
        { text: "return 0 \u2264 m \u2264 3 and 0 \u2264 c \u2264 3", indent: 1 },
        { text: "and (m = 0 or c \u2264 m)  and  (3 \u2212 m = 0 or 3 \u2212 c \u2264 3 \u2212 m)", indent: 1, note: "left bank safe and right bank safe" },
      ],
      note: "Five operator templates, one validity filter — the whole physics of the river.",
    },
    {
      kind: "pythonImpl",
      title: "Enumerating the crossing space (and solving it)",
      intent:
        "Turn the formulation into a successor function, count the reachable states, and read off the shortest crossing — formulation, space and first solution in one program.",
      code: `from collections import deque

# Missionaries and cannibals: (m_left, c_left, boat) - 3 missionaries,
# 3 cannibals, a two-seat boat. States where cannibals outnumber
# missionaries on either bank are invalid.

def valid(state):
    m, c, _ = state
    if not (0 <= m <= 3 and 0 <= c <= 3):
        return False
    if m > 0 and c > m:
        return False                      # left bank lost
    if 3 - m > 0 and 3 - c > 3 - m:
        return False                      # right bank lost
    return True

def successors(state):
    m, c, boat = state
    dir = -1 if boat == "L" else 1       # boat crosses to the other bank
    for dm in range(3):
        for dc in range(3):
            if 1 <= dm + dc <= 2:        # 1 or 2 passengers
                nxt = (m + dir * dm, c + dir * dc, "R" if boat == "L" else "L")
                if valid(nxt):
                    yield nxt

start, goal = (3, 3, "L"), (0, 0, "R")
seen = {start}
frontier = deque([start])
while frontier:
    s = frontier.popleft()
    for t in successors(s):
        if t not in seen:
            seen.add(t)
            frontier.append(t)

print(f"reachable states: {len(seen)}")

# shortest crossing by BFS over the same space
parent = {start: None}
frontier = deque([start])
while frontier:
    s = frontier.popleft()
    if s == goal:
        break
    for t in successors(s):
        if t not in parent:
            parent[t] = s
            frontier.append(t)

path, node = [], goal
while node is not None:
    path.append(node)
    node = parent[node]
path.reverse()
print("shortest crossing:", " -> ".join(f"{m}M{c}C{b}" for m, c, b in path))
print(f"crossings needed: {len(path) - 1}")`,
      output: `reachable states: 16
shortest crossing: 3M3CL -> 3M1CR -> 3M2CL -> 3M0CR -> 3M1CL -> 1M1CR -> 2M2CL -> 0M2CR -> 0M3CL -> 0M1CR -> 0M2CL -> 0M0CR
crossings needed: 11`,
      walkthrough: [
        "`valid` is the safety rule from the pseudocode — the formulation's knowledge, spelled out in Python exactly once.",
        "`successors` is the successor function: five passenger loads, filtered by validity. Note it *yields* — the space is generated on demand, never stored.",
        "The first loop is deliberately naive: it walks the whole reachable space once just to count it — 16 states out of the 4\u00d75\u00d72 = 40 syntactically possible triples.",
        "The second walk is already a real search: breadth-first over the same space, with `parent` doubling as the visited set and, afterwards, the path-reconstruction chain.",
        "Eleven crossings is provably minimal: BFS explores the space level by level, so the first time it touches the goal, no shorter route exists.",
        "Read the trace against the advice every puzzle book gives — \u201csend a cannibal back, bring two across, send two back\u2026\u201d The program has never read that sentence. It knows only states, operators and a queue — and that is the point of formulating before solving: once the space exists, solving is bookkeeping.",
      ],
      project: "The state-space engine you will reuse for the Part A project's benchmark harness.",
    },

    // ------------------------------------------------------------ scale
    { kind: "heading", text: "Why formulation is an engineering choice" },
    {
      kind: "table",
      title: "Three formulations, three orders of magnitude",
      headers: ["Problem", "State is\u2026", "Reachable states", "Why so few / so many"],
      rows: [
        [
          "Crossing (3+3)",
          "(m, c, boat)",
          "16",
          "A tiny validity rule prunes 40 syntactic triples to 16 reachable ones",
        ],
        [
          "Eight-puzzle",
          "board layout",
          "181,440",
          "Parity is invariant: exactly half of 9! boards are reachable",
        ],
        [
          "Route map",
          "current city",
          "20",
          "Cities are given, not generated — the space is the map itself",
        ],
        ["Chess (positions)", "whole board", "~10\u2074\u2070", "Generated by moves; never enumerated, only searched"],
      ],
      caption:
        "Nothing forces a problem to have exactly one state space — the crossing problem could have tracked both banks explicitly (6 numbers per state, the same configurations) or bundled \u201ctwo cross, one returns\u201d into a single operator (half the depth, harder operators): every formulation trades state size against operator complexity. Behind all of it sits the adversary of the next two modules — a tree of branching factor b and depth d holds b^d paths, moves *considered* rather than states, and every algorithm in this school exists to avoid touching most of it. The right question at formulation time is never \u201chow big is the space?\u201d but \u201chow big is the part a good search will touch?\u201d",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "A student writes the eight-puzzle state as \u201cthe row and column of the blank tile\u201d. What is the most serious consequence?",
      options: [
        {
          text: "The state space becomes larger, so search is slower",
          correct: false,
          feedback:
            "It becomes *smaller* — that is the problem. Only 9 states exist; the other 20,160 configurations of the tiles are invisible to the search.",
        },
        {
          text: "The space loses almost all information: many genuinely different boards collapse into one state, so solutions cannot be represented",
          correct: true,
          feedback:
            "Correct. A state must capture everything the goal test and the operators depend on. The blank's address alone cannot distinguish 20,160 boards, and no sequence of such states can spell out a solution.",
        },
        {
          text: "Nothing changes, because the blank's position determines the rest of the board",
          correct: false,
          feedback: "The reverse: the rest of the board has 9!/2 arrangements for each blank position. The blank constrains nothing by itself.",
        },
        {
          text: "Only the goal test breaks; search proceeds normally",
          correct: false,
          feedback: "Search cannot proceed normally — successor generation needs the tiles around the blank, and those are gone too.",
        },
      ],
      solution:
        "A formulation must carry every fact the goal test and operators read. The blank's position carries one fact out of the nine needed.",
      explanation:
        "This is the state-completeness criterion — the state must be a sufficient statistic for everything that happens next. Writing the state as the blank's position, or as the tiles already placed, changes the problem into a different, easier-looking one that has usually lost its solutions or gained false ones: when a search returns nonsense, the bug is in the formulation more often than in the algorithm. We will re-use this criterion when A*'s closed list assumes one best path per state.",
      concepts: ["problem formulation", "state"],
    },
    {
      kind: "exercise",
      id: "a-01-e2",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: how many successors does the crossing program's `successors` produce from the start state (3, 3, L)?",
      expectedOutput: "3",
      solution: "3",
      explanation:
        "Three loads survive validity from (3, 3, L): one cannibal (leaves 3M3C \u2192 3M2C, safe: no outnumbering), two cannibals (leaves 3M1C, safe), or one missionary + one cannibal (leaves 2M2C, safe). A lone missionary leaves 2M < 3C on the left bank (eaten); two missionaries leaves 1M < 3C (eaten). The program's first expansion therefore emits exactly three successors.",
      concepts: ["successor function", "validity"],
    },
    {
      kind: "exercise",
      id: "a-01-e3",
      exerciseKind: "trace",
      prompt:
        "A water-jug variant: a 4-liter and a 7-liter jug, unlimited water, goal exactly 6 liters in the 7-liter jug. Formulate it — state, operators, goal test — then state the maximum number of successors one state can have, and why.",
      solution:
        "State: (a, b) with 0 \u2264 a \u2264 4, 0 \u2264 b \u2264 7 — the current contents. Operators: fill A, fill B, empty A, empty B, pour A\u2192B, pour B\u2192A — six templates. Goal: b = 6. At most 6 successors (one per template); fewer in practice because a template can be a no-op (filling a full jug, pouring into a full jug) or coincide with the current state, which deduplication removes.",
      explanation:
        "The jug problem shows operator *templates* cleanly: the same six named moves apply at every state, and what changes is only which are non-trivial there. Contrast the crossing problem, where the passenger load made the operators finer-grained.",
      concepts: ["problem formulation", "operators"],
    },
  ],
  terms: [
    {
      term: "state space",
      definition:
        "The set of states of a problem together with the operator relation: a directed graph whose nodes are whole configurations and whose edges are moves, each possibly labeled with a step cost.",
    },
    {
      term: "problem formulation",
      definition:
        "The act of choosing states, operators, goal test and cost function for a prose problem — a modeling decision with several defensible answers, not a translation with one.",
    },
    {
      term: "successor function",
      definition:
        "The generator mapping a state to every (action, state') pair one move away; the single place a search algorithm consults the rules of the world.",
    },
    {
      term: "path cost",
      definition:
        "The additive cost c(s, a, s') > 0 of taking action a in state s; summed along a path it defines which solutions are optimal.",
    },
    {
      term: "branching factor",
      definition:
        "The average number of successors per state, b; with solution depth d it bounds the search tree at b^d paths.",
    },
  ],
  mistakes: [
    {
      mistake: "Defining the state as part of the configuration (the blank's position, one bank of the river).",
      why: "Operators and the goal test read facts the state no longer carries, so the search either invents them or silently solves a different problem.",
      fix: "State-completeness rule: the state must determine everything the goal test and every operator test. Add components until the rule holds, and no further.",
    },
    {
      mistake: "Encoding strategy inside the operators (\u201cmove two cannibals when one is safer\u201d).",
      why: "The successor function is the *physics* of the problem; preferences about how to search belong to the algorithm. Mixing them shrinks the space but can delete optimal solutions.",
      fix: "Operators generate every legal move; pruning by preference is the search algorithm's job — and heuristics in Module 2 will do it with guarantees.",
    },
    {
      mistake: "Measuring the space by 9! or 4\u00d75\u00d72 (syntactic states) instead of reachable states.",
      why: "Invariants (parity, boat position, bank totals) cut spaces dramatically; the syntactic count overstates the work and hides the reason search is feasible at all.",
      fix: "Enumerate or reason out the reachable component from the actual start state — the crossing program above is the pattern.",
    },
  ],
  takeaways: [
    "A search problem is \u27e8S, s\u2080, Succ, Goal, c\u27e9 — states, start, successor function, goal test, step cost. Every algorithm in this school consumes exactly these five pieces.",
    "States are whole configurations; moves are edges. Nothing about the history belongs in the state itself.",
    "The state space is generated on demand by the successor function — enumeration is for counting, never for solving.",
    "Formulation is an engineering choice: state completeness sets the floor, and every component you add multiplies the space.",
    "b^d is the adversary. Reachable-state counts (16, 181,440, \u2026) are the first honest estimate of how hard the search will be.",
  ],
  quiz: [
    {
      id: "a-01-q1",
      prompt: "Which change to the crossing formulation keeps the *same* reachable solutions?",
      options: [
        {
          text: "Tracking both banks explicitly in the state",
          correct: true,
          feedback:
            "Correct — it is redundant (the right bank is 3\u2212m, 3\u2212c) but loses no information and adds none, so solutions are unchanged; it only wastes state space.",
        },
        {
          text: "Letting the boat carry three passengers",
          correct: false,
          feedback: "That changes the operators, hence the space itself — new, shorter solutions appear. A different problem.",
        },
        {
          text: "Making the goal test \u201call missionaries across\u201d (boat may end anywhere)",
          correct: false,
          feedback: "The goal set grows, and some new solutions strand the boat — the problem statement says the boat crosses too.",
        },
        {
          text: "Charging 2 per crossing when two people row and 1 when one rows",
          correct: false,
          feedback: "Costs change which solution is *optimal* (the 11-crossing answer could lose to a longer, cheaper one). Same solutions, different problem — costs are part of the tuple.",
        },
      ],
      explanation:
        "Only the redundant-state change is information-preserving. Operators, goal sets and costs are all load-bearing: touching any of them changes the problem that search solves.",
    },
    {
      id: "a-01-q2",
      prompt: "Why does the crossing program never build a table of all 16 states up front?",
      options: [
        {
          text: "Because 16 is small enough to hard-code instead",
          correct: false,
          feedback: "Hard-coding would work here but misses the point — and breaks at 181,440 states, let alone chess.",
        },
        {
          text: "Because the successor function generates states on demand, and the search keeps only what it has touched",
          correct: true,
          feedback:
            "Exactly the implicit-space discipline: `seen`/`parent` hold only visited states, and the frontier holds the rest of the working set.",
        },
        {
          text: "Because Python generators cannot return lists",
          correct: false,
          feedback: "They can — the choice is architectural, not syntactic.",
        },
        {
          text: "Because states must be immutable",
          correct: false,
          feedback: "Tuples are used for hashability — a visited-set concern, not a statement about when states exist.",
        },
      ],
      explanation:
        "Generated-not-stored is what makes search scale: the algorithms of the next module assume the space is exponentially large and touch only a fraction of it.",
    },
    {
      id: "a-01-q3",
      prompt: "A colleague reports their eight-puzzle solver cannot reach the goal from your start board, ever. First place to look?",
      options: [
        {
          text: "The A* implementation (it must be losing optimality)",
          correct: false,
          feedback: "No algorithm reaches an unreachable goal — and no algorithm has even been picked yet. Look upstream.",
        },
        {
          text: "The formulation: state completeness and the successor function's legality rules",
          correct: true,
          feedback:
            "Correct — a missing operator (the blank never slides up, say) or a broken state silently deletes the goal's whole component of the space. Verify by enumerating reachable states, exactly like the crossing program.",
        },
        {
          text: "The heuristic (it must be inadmissible)",
          correct: false,
          feedback: "Inadmissibility yields suboptimal paths, not unreachability.",
        },
        {
          text: "The goal test (it is probably comparing boards correctly)",
          correct: false,
          feedback: "A wrong goal test produces false positives, not eternal failure — and this option concedes it is correct anyway.",
        },
      ],
      explanation:
        "Unreachability is a property of the space, and the space is the formulation. Enumerate-first is the debugging discipline this lesson's program models.",
    },
  ],
};
