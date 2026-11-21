/**
 * PART A · MODULE 1 · CHAPTER 1 "Problems as State Spaces" — lesson a-02,
 * "The Anatomy of a Search Problem".
 *
 * Every `output` is the REAL output of running the code
 * (scripts/verify-classical-outputs.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_02: ClassicalLesson = {
  slug: "a-02",
  title: "The Anatomy of a Search Problem",
  minutes: 25,
  summary:
    "States, operators, successor function, path cost and goal test — the five parts every formulation must pin down.",
  kind: "concept",
  objectives: [
    "Name the five slots of a search problem and say what question each slot answers",
    "Choose between an explicit-set goal test and a predicate goal test, and justify the choice by what each costs",
    "State the two promises path cost must keep — additivity and positivity — and explain how a zero-cost cycle breaks cheapest-first search",
    "Estimate the size of a search from the branching factor b and the solution depth d, and compare that tree estimate with the reachable-state count",
    "Implement the five-tuple as a generic Problem class and instantiate it on a concrete problem",
  ],
  why: "Lesson a-01 could formulate three famous problems in one sitting because it swallowed the five-tuple whole. Real work is crueler: the tuple is where projects die. A goal test that reads the route instead of the state ships a planner that reports “no solution” to solvable problems; a zero-cost operator ships one that never terminates at all; a formulation priced by its state count instead of its b^d ships a demo that collapses the week real instances arrive. Every algorithm from the next lesson onward consumes exactly these five slots and nothing else — which makes now, before a single search is written, the last moment a formulation can be fixed cheaply. This lesson takes the tuple apart slot by slot: the question each piece must answer, the two shapes a goal test can take, the two promises a path cost must keep, and the two numbers — b and d — that price a formulation's hardness before any algorithm is trusted with it.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Lesson a-01 wrote a search problem as a single object — P = ⟨S, s₀, Succ, Goal, c⟩ — and used it three times before slowing down to ask what each piece was for. This is the slow-down. A formulation is a contract with every algorithm that will ever consume it: five blanks to fill, and the searcher reads nothing else. Fill one blank carelessly and the failure arrives wearing the algorithm's clothes — a solver that *finds no solution* to a solvable problem is usually a goal test asking the wrong object, and a solver that hangs is usually a cost function that stopped being positive. We take the tuple apart one slot at a time, then learn to price a formulation's difficulty — with the branching factor *b* and the solution depth *d* — before trusting any algorithm with it.",
    },

    // ------------------------------------------------------------ the contract
    { kind: "heading", text: "The contract, slot by slot" },
    {
      kind: "math",
      title: "What each slot answers",
      displays: [
        { expr: "P = \\langle S, s_0, \\text{Succ}, \\text{Goal}, c \\rangle", label: "the contract" },
        { expr: "\\pi = (s_0, a_1, s_1, \\dots, a_n, s_n), \\quad s_n \\in \\text{Goal}", label: "a solution" },
      ],
      caption:
        "The same tuple a-01 introduced, read now as a contract: S is the stage — generated on demand, never stored; s₀ is where you start; Succ is what you may do; Goal is whether you are done; c is what it costs. A solution π is a path from s₀ into the goal set, and its quality is measured by c. Lesson a-01 already dissected the successor function and the space it generates; this lesson takes the remaining slots in turn — s₀, Goal, c — and then adds the two numbers, b and d, that price the whole construction.",
    },
    {
      kind: "definition",
      term: "Initial state",
      informal:
        "The one given fact about the world: the state the search starts from. Everything else the search will ever see is generated from s₀ by the operators, so the reachable space — and with it solvability — is a property of the start, not only of the rules.",
      formal: "\\text{solvable} \\iff \\text{Goal} \\cap \\text{Reach}(s_0) \\ne \\emptyset",
      why: "The eight-puzzle's parity split (a-01) is the canonical witness: the rules are the same for everyone, but a start on the wrong half of the 362,880 boards can never reach the solved one — no algorithm fixes a bad s₀.",
    },
    {
      kind: "definition",
      term: "Goal test",
      informal:
        "The slot that decides when a state counts as finished — a search's only notion of “done”. It comes in two shapes: membership in an explicit goal set G, or a predicate evaluated on the state.",
      formal: "s \\in G \\quad \\text{or} \\quad P(s)",
      why: "Whichever shape, the test may read the state and nothing else: a goal test that needs the path taken is asking for an object it will never be handed — exercise 1 catches a colleague doing exactly that.",
    },
    {
      kind: "table",
      title: "Two shapes of goal test",
      headers: ["", "Explicit set — “is s in G?”", "Predicate — “does s satisfy P?”"],
      rows: [
        [
          "The question asked",
          "Identity against a stored, enumerable list of target states",
          "A condition run over the state's components, on demand",
        ],
        [
          "Cost per test",
          "One lookup — but G must be known and stored before the search starts",
          "Whatever the condition costs: one comparison (a destination) or a full pairwise scan (queens)",
        ],
        [
          "When it fits",
          "Goals are few and nameable in advance",
          "Goals are many, scattered, or unknowable without solving the problem first",
        ],
        [
          "Examples",
          "a-01's route: G = {Bucharest}, one city in 20; the eight-puzzle: G = {the one solved board} in 181,440 states",
          "Delivery: “manifest empty” — every end location qualifies; 8-queens: “no two queens attack” — 92 goal boards nobody could list before searching",
        ],
        [
          "The classic trap",
          "Naming one goal state when many count as solved — silently harder, possibly unsolvable",
          "Leaking the path into the predicate — the test asks what the state cannot answer",
        ],
      ],
      caption:
        "Both shapes are legal Goal slots, and one problem often admits either: the crossing problem's goal (0, 0, R) is a one-element set, but “everyone is on the right bank” is an equivalent predicate. The choice is engineering, not mathematics — pick the shape whose cost you can afford and whose content you can actually write down.",
    },

    // ------------------------------------------------------------ path cost
    { kind: "heading", text: "Path cost: two promises" },
    {
      kind: "math",
      title: "What cost must promise",
      displays: [
        { expr: "\\text{cost}(\\pi) = \\sum_{i=1}^{n} c(s_{i-1}, a_i, s_i)", label: "additivity" },
        { expr: "c(s, a, s') > 0 \\text{ for every step}", label: "positivity" },
      ],
      caption:
        "Additivity: the cost of a path is the sum of its step costs — this is what lets a search accumulate cost-so-far one edge at a time, without ever storing the route. Positivity: every step costs more than nothing — this is what lets accumulated cost stand for progress. a-01's two working cost functions (1 per slide, kilometres per road) keep both promises so quietly that nobody stops to notice they are promises.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Why zero-cost cycles are fatal",
      text: "Cheapest-first search — uniform-cost search and A*, the subjects of a-03 and a-07 — pops the frontier in nondecreasing order of cost-so-far. Add a free move that closes a cycle, a zero-cost conveyor between two aisles, and cost-so-far stops advancing along that cycle: every pop at cost g generates a successor at the same cost g, which re-enters the frontier, which pops, forever. A search without duplicate detection never terminates — it is not slow, it is stuck. The textbooks' fine print is explicit: the completeness and optimality theorems assume every step costs at least ε > 0, because that is what guarantees only finitely many paths cost less than any given bound. Negative steps are worse still — a negative cycle makes “cheapest path” ill-defined, exactly as it does in shortest-path algorithms. The fix is one line: charge every operator a symbolic penny.",
    },

    // ------------------------------------------------------------ pricing hardness
    { kind: "heading", text: "Pricing hardness before you search" },
    {
      kind: "definition",
      term: "Branching factor",
      informal:
        "The average number of successors a state generates — the width of the search tree. It is a property of the formulation (which operators you chose), measurable before any search runs: sample states, count legal moves, average.",
      formal: "b = \\frac{1}{|S|} \\sum_{s \\in S} |\\text{Succ}(s)|",
      why: "Paired with the solution depth d — the length of the shortest path from s₀ to any goal — it prices the tree a blind search must consider; the worked example below turns the two numbers into a verdict.",
    },
    {
      kind: "math",
      title: "The size of the search tree",
      displays: [
        { expr: "1 + b + b^2 + \\dots + b^d = \\frac{b^{d+1} - 1}{b - 1} \\approx b^d", label: "tree nodes" },
        { expr: "b^d \\text{ paths} \\quad \\text{vs} \\quad |\\text{Reach}(s_0)| \\text{ states}", label: "two ceilings" },
      ],
      caption:
        "The geometric sum counts tree nodes to depth d, and the last level dominates — so b^d is the number people quote. But a-01 was careful, and so are we: b^d counts PATHS, moves considered, while |Reach(s₀)| counts STATES — and a search that deduplicates can never touch more states than exist. Which ceiling you approach is decided by the algorithm's duplicate discipline, not by the problem; pricing a formulation means computing both.",
    },
    {
      kind: "example",
      title: "Pricing an eight-puzzle instance before writing any solver",
      problem:
        "A colleague hands you an eight-puzzle instance whose optimal solution is 20 moves, and asks — before anyone writes a line of solver code — whether plain blind search can handle it. Price the work from b and d.",
      steps: [
        {
          text: "Get b from the formulation, not the instance.",
          detail:
            "The blank sits at a corner in 4 of 9 positions (2 legal slides), at an edge in 4 (3 slides), at the center in 1 (4 slides): (4·2 + 4·3 + 1·4)/9 = 24/9 ≈ 2.67 — a-01's figure, arrived at in one line.",
        },
        {
          text: "Price the tree: b^d.",
          detail:
            "2.67²⁰ ≈ 3.39×10⁸ — some 340 million depth-20 paths that a search without duplicate detection might have to consider. (The full node count 1 + b + ⋯ + b²⁰ is within a factor of 1.6 of this; the last level dominates.) Deeper instances make it absurd: at d = 31, the worst case a-01 pinned, the estimate is ≈ 1.7×10¹³.",
        },
        {
          text: "Price the graph: the reachable states.",
          detail:
            "Parity pins the whole space at 9!/2 = 181,440 states (a-01) — the hard ceiling on what a deduplicating search can ever expand. The depth-20 tree estimate overshoots it by a factor of about 1,870.",
        },
        {
          text: "Read the verdict.",
          detail:
            "Blind search is feasible on this instance only as graph search: 181,440 states fit in memory; 340 million tree nodes do not (at a modest 100 bytes a node, that is ≈ 34 GB). The answer was available before the algorithm was even chosen — two lines of arithmetic, zero solver code.",
        },
      ],
      result:
        "Estimate ≈ 3.4×10⁸ tree paths against 181,440 states: the instance is comfortably searchable, but only by an algorithm that deduplicates — a verdict delivered before any solver existed.",
    },
    {
      kind: "pythonImpl",
      title: "The five-tuple as a class — measured against its own estimate",
      intent:
        "Wrap the contract in a generic Problem class, instantiate it on the four-queens single-column formulation, then measure b, d and real expansions the way the eight-puzzle example was priced by hand.",
      code: `from collections import deque


class Problem:
    """The five-tuple P = <S, s0, Succ, Goal, c> as a class. A search
    algorithm reads ONLY these slots -- nothing else exists to it."""

    def __init__(self, initial):
        self.initial = initial                      # s_0

    def successors(self, state):                    # Succ: operators
        raise NotImplementedError

    def goal_test(self, state):                     # Goal: set or predicate
        raise NotImplementedError

    def path_cost(self, c, state, action, nxt):     # c: additive, positive
        return c + 1

    def breadth_first(self):
        """The a-01 measuring loop, reading only the slots above."""
        came = {self.initial: None}
        frontier = deque([self.initial])
        expanded = 0
        while frontier:
            s = frontier.popleft()
            expanded += 1
            if self.goal_test(s):
                path = []
                while s is not None:
                    path.append(s)
                    s = came[s]
                return path[::-1], expanded
            for _action, t in self.successors(s):
                if t not in came:
                    came[t] = s
                    frontier.append(t)
        return None, expanded


class FourQueensSingleColumn(Problem):
    """One queen per column; an operator moves a single queen to any
    other row within its own column. The goal test is a predicate --
    'no two queens attack' -- because enumerating the goal boards
    would mean solving the problem first."""

    def __init__(self):
        super().__init__((0, 0, 0, 0))              # all queens on row 0
        self.n = 4

    def successors(self, state):
        for col in range(self.n):
            for row in range(self.n):
                if row != state[col]:
                    board = list(state)
                    board[col] = row
                    yield (f"col {col} -> row {row}", tuple(board))

    def goal_test(self, state):
        for i in range(self.n):
            for j in range(i + 1, self.n):
                if state[i] == state[j]:            # same row
                    return False
                if abs(state[i] - state[j]) == j - i:   # same diagonal
                    return False
        return True


problem = FourQueensSingleColumn()

# 1. measure the whole space before solving anything
seen = {problem.initial}
frontier = deque([problem.initial])
succ_count = 0
while frontier:
    s = frontier.popleft()
    for _a, t in problem.successors(s):
        succ_count += 1
        if t not in seen:
            seen.add(t)
            frontier.append(t)
b = succ_count / len(seen)
print(f"reachable states: {len(seen)}")
print(f"measured branching factor b: {b:.2f}")

# 2. solve, and count what a deduplicating search actually expands
path, expansions = problem.breadth_first()
d = len(path) - 1
print(f"solution depth d: {d}")
print(f"b^d tree estimate: {b ** d:.0f}")
print(f"BFS expansions (dedup on): {expansions}")

# 3. replay the solution through path_cost -- additivity in action
cost, cur = 0, path[0]
for nxt in path[1:]:
    action = next(a for a, t in problem.successors(cur) if t == nxt)
    cost = problem.path_cost(cost, cur, action, nxt)
    cur = nxt
print(f"path cost of solution: {cost}")
print("solution:", " -> ".join(str(s) for s in path))`,
      output: `reachable states: 256
measured branching factor b: 12.00
solution depth d: 3
b^d tree estimate: 1728
BFS expansions (dedup on): 84
path cost of solution: 3
solution: (0, 0, 0, 0) -> (1, 0, 0, 0) -> (1, 3, 0, 0) -> (1, 3, 0, 2)`,
      walkthrough: [
        "The class IS the contract: `initial`, `successors`, `goal_test`, `path_cost` are the four problem-specific slots — S never appears, because the space is generated, never stored (a-01's discipline).",
        "`FourQueensSingleColumn` fills the slots: move one queen within its column (4 × 3 = 12 operator instances per state), and a predicate goal test — the property shape from the table — because listing the goal boards would mean solving the problem first.",
        "The measuring walk enumerates the whole space once: 256 reachable states, every one with exactly 12 successors, so b = 12.00 — measured, not asserted.",
        "Then the a-01 BFS loop solves through the class's slots alone: depth 3, 84 expansions. The tree estimate b^d = 1,728 overshoots the measured 84 by a factor of 21 — and overshoots the entire 256-state space by nearly 7 — the dedup factor from the worked example, watched happening.",
        "`path_cost` replays the found path edge by edge: 3 steps × 1 — additivity is what makes the running sum a legal stand-in for the route's total.",
      ],
      project:
        "This Problem class is the interface the Part A project's benchmark harness plugs every search algorithm into.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-02-e1",
      exerciseKind: "concept-check",
      prompt:
        "A courier must deliver five packages, in any order. A colleague formulates it: state = (current intersection, set of undelivered packages); operators: drive one road segment, or deliver the package at the current address; goal test: “all packages delivered, and delivered in the order they appear on the manifest”; path cost: 1 per road segment. Exactly one piece is broken. Which, and why?",
      options: [
        {
          text: "The goal test — “delivered in manifest order” is a fact about the path, not the state: two routes ending at the same (intersection, empty set) are indistinguishable, so the test asks the state a question it cannot answer",
          correct: true,
          feedback:
            "Correct — this is the state-completeness rule biting on the goal side. The state cannot witness order; the test must either narrow to “manifest empty” or the state must grow a component that tracks order — with the space multiplying to pay for it.",
        },
        {
          text: "The state — it forgets each package's destination address",
          correct: false,
          feedback:
            "Addresses are static facts of the map, read by the operators (deliver at the current address) — domain knowledge, not per-state information. a-01's crossing state did not store the other bank either; it was derivable. The state is sufficient as written.",
        },
        {
          text: "The operators — driving and delivering must be merged into one operator per stop",
          correct: false,
          feedback:
            "Granularity is a design choice with a depth-versus-complexity trade (a-01 discussed it for the crossing problem), not a defect; both versions are legal formulations of this problem.",
        },
        {
          text: "The path cost — it should charge per delivered package, not per road segment",
          correct: false,
          feedback:
            "Both are additive, positive step costs — legal c slots that simply optimize different things (distance versus effort per stop). Nothing here violates either of cost's two promises.",
        },
      ],
      solution:
        "The goal test leaks path information. “In manifest order” cannot be evaluated on (intersection, undelivered set): an in-order history and an out-of-order one can end at the identical state, and the search's loops only ever hand the goal test a state.",
      explanation:
        "The Goal slot must be a function of the state alone — set membership or predicate, but state-only. When a requirement is genuinely historical, the honest fix is to grow the state a component that witnesses it (here, one integer: “first k manifest entries delivered in order”) and pay the space multiplier knowingly; the dishonest fix is a test that quietly reads what is not there. Since the problem says any order counts, the right formulation simply drops the second conjunct.",
      concepts: ["goal test", "problem formulation"],
    },
    {
      kind: "exercise",
      id: "a-02-e2",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: how many (action, state) pairs does the program's `successors` yield from the start state (0, 0, 0, 0)? Type the number.",
      expectedOutput: "12",
      solution: "12",
      explanation:
        "Four queens, each movable to any of the 3 other rows within its own column: 4 × 3 = 12 — and since the count is the same at every board, the measured branching factor is exactly b = 12. The same formula prices the full 8-queens formulation at 8 × 7 = 56 successors per state — the one-line measurement the worked example did by hand for the eight-puzzle.",
      concepts: ["successor function", "branching factor"],
    },
  ],
  terms: [
    {
      term: "initial state",
      definition:
        "The state s₀ the search starts from; together with the successor function it determines the reachable component of the space — and hence whether the problem is solvable at all.",
    },
    {
      term: "goal test",
      definition:
        "The slot that decides a state counts as a solution — either membership in an explicit goal set G or a predicate evaluated on the state; never a function of the path taken.",
    },
    {
      term: "branching factor",
      definition:
        "The average number of successors per state, b; combined with the solution depth d it prices the search tree at roughly b^d paths, measurable before any search runs.",
    },
    {
      term: "solution depth",
      definition:
        "The length d of the shortest path from the initial state to any goal state — the second number, with b, that a pre-search size estimate needs.",
    },
    {
      term: "zero-cost cycle",
      definition:
        "A loop of operators whose step costs sum to zero; it lets cheapest-first search generate infinitely many equal-cost paths, which is why the classical guarantees assume every step costs at least ε > 0.",
    },
  ],
  mistakes: [
    {
      mistake: "Writing a goal test that reads the path, not the state (“delivered in manifest order”).",
      why: "Search loops only ever hand the goal test a state; history lives in bookkeeping the test never sees, so the test's answer is either arbitrary or a silent “no solution” to a solvable problem.",
      fix: "Test only what the state carries. If the requirement is genuinely historical, add a state component that witnesses it — knowingly paying the space multiplier — or drop the requirement.",
    },
    {
      mistake: "Allowing zero-cost steps because “the move is free”.",
      why: "Zero-cost cycles spawn infinitely many equal-cost paths; a cheapest-first search without duplicate detection never drains its frontier — it loops, not slows.",
      fix: "Charge every operator at least a symbolic ε > 0, or guarantee duplicate detection; the completeness and optimality theorems' fine print requires it.",
    },
    {
      mistake: "Pricing a formulation by its state count alone.",
      why: "The state count bounds only a deduplicating graph search; a tree search touches paths, up to about b^d of them — the eight-puzzle's 181,440 states sit against roughly 2.67^d paths.",
      fix: "Estimate both b^d and the reachable-state count, and know which ceiling your algorithm is heading for before committing.",
    },
    {
      mistake: "Defining a non-additive path cost (the route's longest leg, a “style” score, cost per plan rather than per step).",
      why: "Cheapest-first bookkeeping sums step costs as it goes; if the true objective is not the sum of its steps, the accumulated cost-so-far is a number that lies.",
      fix: "Make cost additive by construction — one price per step — or accept that cheapest-first machinery does not apply and optimize differently.",
    },
  ],
  takeaways: [
    "A search problem is a five-slot contract, P = ⟨S, s₀, Succ, Goal, c⟩ — every algorithm from a-03 onward reads exactly these pieces and nothing else.",
    "A goal test asks one of two questions — “is this state in the goal set?” or “does this state satisfy the property?” — and it must be a function of the state alone, never of the path.",
    "Path cost must be additive (a path's cost is the sum of its steps) and positive (every step > 0); a zero-cost cycle mints infinitely many equal-cost paths and cheapest-first search never finishes.",
    "b and d price a search before it runs: about b^d paths for tree search against |Reach(s₀)| states for deduplicating search — know which ceiling your algorithm is heading for.",
    "Measure, don't argue: a toy-scale enumeration of your own formulation — like the four-queens program — reads off b, d and real expansions in under a second.",
  ],
  quiz: [
    {
      id: "a-02-q1",
      prompt:
        "Which of these goal tests is a PREDICATE — a property evaluated on the state — rather than membership in a stored goal set?",
      options: [
        {
          text: "a-01's route problem: the goal set is {Bucharest}",
          correct: false,
          feedback:
            "One named city — the smallest possible explicit set. The test is the comparison `city == 'Bucharest'`, a single lookup.",
        },
        {
          text: "The eight-puzzle: the goal is the one solved board",
          correct: false,
          feedback:
            "Equality with a single known board — set membership with a one-element G, even though the surrounding space holds 181,440 states.",
        },
        {
          text: "A delivery round: “every package on the manifest has been delivered”",
          correct: true,
          feedback:
            "Correct — every end location with an empty manifest qualifies, so the goal set is huge and shapeless; but the condition is one line. That asymmetry — unlistable set, testable property — is exactly when a predicate earns its keep.",
        },
        {
          text: "The crossing problem: the goal is (0, 0, R)",
          correct: false,
          feedback:
            "A single goal state out of 16 — membership again; a-01's program tested it with `s == goal`.",
        },
      ],
      explanation:
        "The deciding question is not “how many goals?” but “could you write the set down before searching?” Named destinations and solved boards, yes; every delivered-everywhere configuration, no — that set exists only as the property defining it.",
    },
    {
      id: "a-02-q2",
      prompt:
        "A warehouse robot may ride a free conveyor between two adjacent aisles (step cost 0); every other move costs 1. What exactly does this break?",
      options: [
        {
          text: "Each pop at cost g can generate a successor at the same cost g, so without duplicate detection the frontier never drains — cheapest-first search loops on the cycle forever",
          correct: true,
          feedback:
            "Correct — cost-so-far stops standing for progress, and a search that enumerates paths rather than states finds infinitely many of them at the same price. The guarantees are priced at ε > 0 precisely to forbid this.",
        },
        {
          text: "Nothing — zero is non-negative, and only negative costs cause trouble",
          correct: false,
          feedback:
            "Non-negativity does keep a deduplicating graph search terminating, but the classical cheapest-first guarantees assume every step costs at least ε > 0, and the tree-search version never terminates. “Legal for Dijkstra” is not the same as “safe for a path-enumerating search”.",
        },
        {
          text: "Total path costs stop being finite",
          correct: false,
          feedback:
            "Zero is not negative — totals still sum the positive steps and stay finite; they merely stop growing along the cycle.",
        },
        {
          text: "The goal test can no longer recognize goal states",
          correct: false,
          feedback:
            "Goal testing reads the state and never consults costs; positivity protects the frontier's progress, not the test.",
        },
      ],
      explanation:
        "Positivity is what makes “only finitely many paths cost less than any given bound” true, and that finiteness drives cheapest-first search's completeness and optimality theorems. A zero-cost cycle mints infinitely many equal-cost paths — charge ε and the problem vanishes.",
    },
    {
      id: "a-02-q3",
      prompt:
        "The eight-puzzle has 181,440 reachable states and b ≈ 2.67. A colleague promises their new solver “never expands more than 181,440 nodes on any instance.” What is the promise worth?",
      options: [
        {
          text: "It holds only for a search that detects duplicates — without that discipline a search can expand the same state once per path that reaches it, up to about b^d times",
          correct: true,
          feedback:
            "Exactly — 181,440 bounds GRAPH search; tree search is bounded by path counts, and b^d outruns the state count nearly 1,900-fold at d = 20, this lesson's own arithmetic.",
        },
        {
          text: "Nothing — b^d always exceeds 181,440",
          correct: false,
          feedback:
            "For shallow instances b^d is tiny: at d = 5, 2.67^5 ≈ 136. The state count is a ceiling, not a floor; the issue is the missing condition, not the arithmetic.",
        },
        {
          text: "It is exactly right — no search can expand a state twice",
          correct: false,
          feedback:
            "Only a search with a visited set cannot; tree search re-expands freely, and even graph searches keep stale entries in their queues — skipped at pop time, never expanded, but present.",
        },
        {
          text: "The number itself is wrong — 181,440 is the count of syntactic boards",
          correct: false,
          feedback:
            "Backwards: 9! = 362,880 is the syntactic count; parity halves it to exactly 181,440 REACHABLE boards (a-01's figure). The number is right; the unconditional promise is not.",
        },
      ],
      explanation:
        "State counts bound deduplicating search; path counts (about b^d) bound everything else. Which ceiling applies is a property of the algorithm's duplicate discipline — which is why pricing a formulation means computing both numbers, not one.",
    },
  ],
};
