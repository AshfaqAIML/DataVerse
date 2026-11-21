/**
 * SCHOOL J — CLASSICAL ARTIFICIAL INTELLIGENCE (J1–J6)
 * Search & problem solving, adversarial search and games, constraint
 * satisfaction, knowledge representation and reasoning, classical
 * planning, and expert systems with reasoning under uncertainty.
 *
 * This school teaches the symbolic half of artificial intelligence the
 * honest way: every problem is formulated before it is solved, every
 * algorithm is first written as pseudocode and then implemented by hand
 * in Python, every guarantee (admissibility, completeness, soundness,
 * tractability) is stated and argued, and every claim of optimality is
 * demonstrated on a problem the learner can trace by hand.
 *
 * The dependency design (mirrored by the school page's curriculum map):
 *
 *                python (School A)
 *                 │            ┌──────────────┐
 *                 ├── J1 Search ──┐            │ (soft)
 *                 │    & Problem  │soft        ▼
 *                 │    Solving    │       J4 Knowledge &
 *                 │    ┌───┴───┐  │        Representation
 *                 ├── J2     J3 ─┘            │        │
 *                 │  Games   CSPs     J1 ──► J5 Plan   J6 Expert
 *                 │                    (hard)  ning    Systems
 *
 * J1 is the school's foundation (state spaces, uninformed and heuristic
 * search, local search). J2 and J3 need only J1. J4's hard gate is
 * Python (logic needs no search machinery) with J1 recommended. J5
 * needs J1 + J4 (planning is search over logical states). J6 needs J4.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolJ: SubjectDef[] = [
  // ------------------------------------------------------------ J1
  {
    slug: "search-problem-solving",
    school: "J",
    code: "J1",
    title: "Search & Problem Solving",
    blurb:
      "The foundation of classical AI: formulating problems as state spaces, searching them with uninformed and heuristic algorithms, and reasoning about optimality, completeness and cost before writing a line of code.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["python"],
    softPrerequisites: [],
    objectives: [
      "Formulate any puzzle, route or scheduling task as a state space: states, operators, path cost and goal test",
      "Trace BFS, uniform-cost, DFS and iterative deepening by hand on graph and tree problems",
      "Design heuristic functions and argue their admissibility and consistency",
      "Implement A* and understand exactly when it is optimal and when it is not",
      "Apply local search (hill climbing, simulated annealing, beam search) to problems with no map",
    ],
    outcomes: [
      "A learner can translate a prose problem description into a formal search problem and say what a solution is",
      "A learner can trace A* by hand with a consistent heuristic and prove the first goal it pops is optimal",
      "A learner can implement BFS, DFS, IDS, uniform-cost, greedy best-first and A* in Python and verify them on test problems",
      "A learner can choose the right search family for a problem and justify the choice with complexity and guarantees",
    ],
    modules: [
      mod(
        "State Spaces and Problem Formulation",
        "Before any algorithm: what a state is, what an operator does, and what counts as a solution.",
        [
          "Translate a problem description into states, operators, path cost and a goal test",
          "Distinguish a state space from its search tree and predict its branching factor and depth",
        ],
        ["concept-check", "predict-output", "write-code", "derive"],
        [
          ch("Problems as State Spaces", "The five-part formalization every search algorithm assumes", [
            L(
              "From Puzzles to State Spaces",
              30,
              ["state space", "problem formulation", "path cost"],
              "The eight-puzzle, route finding and the missionaries-and-cannibals problem, all as one mathematical object: a graph of states.",
              "concept",
              3
            ),
            L(
              "The Anatomy of a Search Problem",
              25,
              ["initial state", "goal test", "branching factor"],
              "States, operators, successor function, path cost and goal test — the five parts every formulation must pin down.",
              "concept",
              2
            ),
          ]),
          ch("Uninformed Search", "Searching with no knowledge beyond the problem itself", [
            L(
              "Breadth-First and Uniform-Cost Search",
              35,
              ["breadth-first search", "uniform-cost search", "completeness"],
              "Two frontier disciplines: expand shallowest first, or cheapest first — and the guarantees each buys.",
              "code",
              3
            ),
            L(
              "Depth-First and Iterative Deepening",
              30,
              ["depth-first search", "iterative deepening", "space complexity"],
              "DFS's tiny memory footprint, its failure modes, and the iterative trick that restores optimality.",
              "code",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Heuristic Search",
        "Knowledge compressed into a number: heuristic functions and the algorithms that trust them.",
        [
          "Evaluate a heuristic's quality with effective branching factor and argue its admissibility",
          "Trace and implement greedy best-first search and A*, and prove A*'s optimality under admissibility",
        ],
        ["concept-check", "derive", "predict-output", "write-code"],
        [
          ch("Heuristics and Greedy Best-First", "Estimating distance-to-goal and acting on the estimate", [
            L(
              "Heuristic Functions",
              30,
              ["heuristic", "admissibility", "misplaced tiles"],
              "What a heuristic may promise and may not: relaxation, admissibility, and the misplaced-tiles and Manhattan heuristics.",
              "concept",
              3
            ),
            L(
              "Greedy Best-First Search",
              25,
              ["greedy best-first", "informedness", "frontier ordering"],
              "Follow the heuristic alone: fast, memory-light, and unapologetically not optimal — with a trace to prove it.",
              "worked-example",
              2
            ),
          ]),
          ch("A* and Its Guarantees", "Cost-so-far plus estimate-to-go: the algorithm route planners still run", [
            L(
              "A* Search",
              35,
              ["A*", "f = g + h", "priority frontier"],
              "Combine exact cost-so-far with an admissible estimate-to-go and expand the most promising frontier node first.",
              "code",
              3
            ),
            L(
              "Admissibility, Consistency and Optimality",
              30,
              ["consistency", "tree search", "graph search"],
              "When A* is merely admissible-optimal (tree search) and when graph search needs consistency — with the proof and a counterexample.",
              "reading",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Local Search and Landscapes",
        "Problems where the path does not matter: search the state itself, not the route to it.",
        [
          "Explain when local search beats tree search and what it gives up (path information)",
          "Implement hill climbing, simulated annealing and local beam search, and diagnose plateaus, ridges and local optima",
        ],
        ["concept-check", "predict-output", "write-code", "interpret-results"],
        [
          ch("Hill Climbing and Its Failures", "Greedy steps on a landscape of values", [
            L(
              "Hill Climbing",
              25,
              ["hill climbing", "objective function", "local optimum"],
              "Move to the best neighbor and stop when nothing improves — n-queens as the classic beneficiary and victim.",
              "code",
              3
            ),
            L(
              "Simulated Annealing",
              30,
              ["simulated annealing", "temperature schedule", "bad moves"],
              "Escape local optima by accepting worse moves with a probability that falls over time — and why it works.",
              "code",
              3
            ),
          ]),
          ch("Comparing Search Families", "Choosing a method and defending the choice", [
            L(
              "Local Beam Search",
              25,
              ["beam search", "parallel exploration", "beam width"],
              "Keep the best k states instead of one — hill climbing's population-minded sibling.",
              "concept",
              2
            ),
            L(
              "Choosing a Search Algorithm",
              30,
              ["completeness", "optimality", "space-time tradeoff"],
              "A decision framework over all nine algorithms: uninformed, informed and local — with the honest costs of each.",
              "review",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Search & Problem Solving — Final Exam", 45, 16),
    projects: [
      proj(
        "The 8-Puzzle Laboratory",
        "Implement the eight-puzzle three ways — uniform-cost search, A* with misplaced tiles, A* with Manhattan distance — on a shared state-space engine, instrument all three with nodes-expanded counters, and explain the measured efficiency gap using effective branching factor.",
        8,
        "guided",
        [
          "A Python module with the puzzle's state space: successors, goal test, and path reconstruction",
          "Three search implementations sharing one frontier interface",
          "A benchmark table over at least ten start states: nodes expanded, solution length, runtime",
          "A short written analysis tying the measured gap to heuristic strength",
        ],
        [
          "State-space code is correct: all benchmarked solutions are provably optimal",
          "A* implementations expand strictly fewer nodes than uniform-cost on every solvable instance",
          "Manhattan-distance A* never expands more nodes than misplaced-tiles A*",
          "Analysis uses effective branching factor correctly",
        ],
        ["python", "heapq", "dataclasses"]
      ),
    ],
    placementEligible: true,
    keywords: ["state space", "A*", "heuristic search", "uninformed search", "local search", "search problem"],
  },

  // ------------------------------------------------------------ J2
  {
    slug: "adversarial-search-games",
    school: "J",
    code: "J2",
    title: "Adversarial Search & Games",
    blurb:
      "Search when someone is searching against you: game trees, minimax with alpha-beta pruning, move ordering, and evaluation functions that let a program hold its own.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["search-problem-solving"],
    softPrerequisites: [],
    objectives: [
      "Formulate zero-sum, perfect-information games as minimax search problems",
      "Trace minimax and alpha-beta pruning by hand, marking exactly which branches are cut",
      "Implement minimax and alpha-beta in Python and measure the pruning dividend",
      "Write evaluation functions and explain the assumptions they smuggle in",
    ],
    outcomes: [
      "A learner can draw a game tree with min/max levels and back up values correctly by hand",
      "A learner can state the alpha-beta pruning rule, apply it deterministically, and prove the pruned value equals the minimax value",
      "A learner can implement alpha-beta with move ordering and demonstrate the ordering's effect on nodes visited",
      "A learner can explain when a game outgrows full search and how evaluation functions and depth limits take over",
    ],
    modules: [
      mod(
        "Games and Minimax",
        "Two players, one tree: backing up values from leaves to the root.",
        [
          "Formulate a game as a tree with alternating max and min levels",
          "Trace the minimax algorithm by hand and implement it in Python",
        ],
        ["concept-check", "predict-output", "write-code", "derive"],
        [
          ch("Games as Search", "Adversarial problems and why vanilla search breaks", [
            L(
              "Games, Opponents and Payoffs",
              25,
              ["zero-sum game", "perfect information", "payoff"],
              "Tic-tac-toe, nim and chess as formal games: players, moves, terminal payoffs — and why A* has nothing to say here.",
              "concept",
              2
            ),
            L(
              "The Minimax Algorithm",
              30,
              ["minimax", "backed-up value", "ply"],
              "Assume the opponent plays perfectly: back values up from leaves, max at your levels, min at theirs.",
              "concept",
              3
            ),
          ]),
          ch("Reading Game Trees", "Hand traces and first implementations", [
            L(
              "Minimax by Hand: Three Worked Games",
              30,
              ["game tree", "trace", "terminal test"],
              "Full traces on tic-tac-toe endgames, nim and a cutoff-depth game — the skill every later topic builds on.",
              "worked-example",
              3
            ),
            L(
              "Implementing Minimax",
              35,
              ["recursion", "utility function", "terminal test"],
              "A clean recursive minimax in Python, first on a toy game, then tic-tac-toe endgames, with a node counter.",
              "code",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Cutting the Tree",
        "Alpha-beta pruning, move ordering, and the practical machinery of game programs.",
        [
          "Apply the alpha-beta rule by hand and count the savings",
          "Explain and measure how move ordering changes pruning, and design evaluation functions with their tradeoffs stated",
        ],
        ["concept-check", "predict-output", "write-code", "interpret-results"],
        [
          ch("Alpha-Beta Pruning", "Never search a branch that cannot change the decision", [
            L(
              "The Alpha-Beta Window",
              35,
              ["alpha-beta pruning", "alpha", "beta"],
              "Carry the best guaranteed values down the tree and cut the moment a branch cannot beat them.",
              "concept",
              3
            ),
            L(
              "Move Ordering and Deep Cuts",
              30,
              ["move ordering", "best-first ordering", "pruning dividend"],
              "Search the strongest moves first and alpha-beta visits O(b^(m/2)) instead of O(b^m) — with measurements.",
              "code",
              3
            ),
          ]),
          ch("Playing Well in Practice", "Depth limits, evaluation and chance", [
            L(
              "Evaluation Functions",
              30,
              ["evaluation function", "cutoff test", "feature weights"],
              "When the tree outruns the clock: evaluate non-terminal positions with weighted features — and know the risks.",
              "concept",
              3
            ),
            L(
              "Games with Chance and Imperfection",
              30,
              ["expectimax", "chance node", "imperfect information"],
              "Dice and hidden cards: chance nodes, expectimax, and why minimax's guarantees dissolve when the opponent errs.",
              "reading",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Adversarial Search — Final Exam", 40, 14),
    projects: [
      proj(
        "The Alpha-Beta Engine",
        "Build a game engine on a fixed two-player game: full minimax, then alpha-beta with randomized move ordering, then alpha-beta with a hand-designed move-ordering heuristic. Instrument all three with node counters, benchmark them across at least twenty positions, and write up the pruning dividend as a function of ordering quality.",
        6,
        "independent",
        [
          "A game module: legal moves, terminal test, utility function",
          "Three engines sharing one interface: minimax, alpha-beta (random order), alpha-beta (heuristic order)",
          "A benchmark harness comparing nodes visited across 20+ positions",
          "A short write-up of the measured pruning dividend",
        ],
        [
          "Alpha-beta with any ordering returns the same move as full minimax on every test position",
          "Heuristic ordering visits strictly fewer nodes than random ordering on average",
          "Benchmark code is reproducible (fixed seeds) and the write-up cites its numbers",
        ],
        ["python", "random", "dataclasses"]
      ),
    ],
    placementEligible: true,
    keywords: ["minimax", "alpha-beta pruning", "game tree", "adversarial search", "evaluation function"],
  },

  // ------------------------------------------------------------ J3
  {
    slug: "constraint-satisfaction",
    school: "J",
    code: "J3",
    title: "Constraint Satisfaction",
    blurb:
      "Problems as networks of variables, domains and constraints: backtracking search, propagation, and the structure theorems that make some CSPs easy.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["search-problem-solving"],
    softPrerequisites: [],
    objectives: [
      "Formulate problems (map coloring, Sudoku, scheduling) as constraint networks",
      "Trace and implement backtracking search with MRV and degree heuristics",
      "Explain and implement forward checking and arc consistency (AC-3)",
      "Exploit constraint-graph structure: trees, almost-trees and decomposition",
    ],
    outcomes: [
      "A learner can state a CSP as variables, domains and constraints, and draw its constraint graph",
      "A learner can trace backtracking with MRV by hand and implement it correctly in Python",
      "A learner can run AC-3 by hand on a small network, including failure detection, and implement it",
      "A learner can recognize tree-structured CSPs and solve them in linear time with the right algorithm",
    ],
    modules: [
      mod(
        "CSPs and Backtracking",
        "Variables, domains, constraints — and the depth-first search that respects them.",
        [
          "Formulate a problem as a constraint network with a well-defined solution concept",
          "Trace and implement backtracking search with informed variable ordering",
        ],
        ["concept-check", "predict-output", "write-code", "case-analysis"],
        [
          ch("Constraint Networks", "The three-part formalization behind schedulers and Sudokus", [
            L(
              "Variables, Domains and Constraints",
              30,
              ["constraint satisfaction problem", "domain", "binary constraint"],
              "Map coloring, job scheduling and Sudoku as one idea: assign values to variables without breaking constraints.",
              "concept",
              3
            ),
            L(
              "Constraint Graphs",
              25,
              ["constraint graph", "variable node", "constraint edge"],
              "Draw the problem: variables as nodes, constraints as edges — and read off its structure before solving anything.",
              "concept",
              2
            ),
          ]),
          ch("Backtracking Search", "Depth-first assignment with nothing wasted", [
            L(
              "Backtracking by Hand",
              30,
              ["backtracking", "partial assignment", "dead end"],
              "Assign, check, retreat: full traces on map coloring and a small scheduling problem, failures included.",
              "worked-example",
              3
            ),
            L(
              "Implementing Backtracking",
              35,
              ["minimum remaining values", "degree heuristic", "value ordering"],
              "A general CSP solver in Python: representation, consistency checks, and the MRV and degree heuristics.",
              "code",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Propagation and Structure",
        "Reasoning ahead of the search, and the graph shapes that make problems easy.",
        [
          "Explain and implement forward checking and AC-3, and measure their effect on backtracking",
          "Analyze constraint-graph structure and apply the right algorithm for it",
        ],
        ["concept-check", "predict-output", "write-code", "interpret-results"],
        [
          ch("Consistency", "Prune the future before it becomes the present", [
            L(
              "Forward Checking",
              25,
              ["forward checking", "domain pruning", "dead-end prediction"],
              "After each assignment, delete now-impossible values from unassigned neighbors — see dead ends before reaching them.",
              "concept",
              2
            ),
            L(
              "Arc Consistency and AC-3",
              35,
              ["arc consistency", "AC-3", "queue of arcs"],
              "Every value must have support across each constraint: the AC-3 fixpoint and what it catches that forward checking misses.",
              "code",
              3
            ),
          ]),
          ch("Exploiting Structure", "Not all constraint graphs are equally hard", [
            L(
              "Variable and Value Ordering",
              30,
              ["fail-first", "succeed-first", "search reduction"],
              "Choose the variable most likely to fail and the value most likely to succeed — the two orderings that tame real instances.",
              "worked-example",
              3
            ),
            L(
              "Tree-Structured CSPs and Decomposition",
              30,
              ["tree-structured CSP", "topological order", "cutset conditioning"],
              "Trees are linear-time; nearly-trees are nearly-linear: the decomposition result and when to pay for it.",
              "reading",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Constraint Satisfaction — Final Exam", 40, 14),
    projects: [
      proj(
        "The Sudoku Solvers",
        "Solve Sudoku three ways on one constraint engine: plain backtracking, backtracking plus MRV and degree ordering, and backtracking plus full AC-3 propagation. Benchmark all three on a fixed ladder of puzzles from easy to hard, count assignments and consistency checks, and write up when each strategy pays for itself.",
        7,
        "independent",
        [
          "A constraint-network representation of Sudoku (27 unit constraints, no hard-coded solving)",
          "Three solvers sharing one engine interface",
          "A benchmark ladder of at least nine puzzles (three easy, three medium, three hard) with fixed seeds or published instances",
          "A written analysis of when propagation beats ordering beats neither",
        ],
        [
          "All three solvers produce valid solutions to every benchmark puzzle",
          "Metrics (assignments, checks) are collected by instrumentation, not estimated",
          "Analysis correctly identifies where each strategy's advantage appears and why",
        ],
        ["python", "dataclasses", "collections.deque"]
      ),
    ],
    placementEligible: true,
    keywords: ["constraint satisfaction", "backtracking", "arc consistency", "AC-3", "constraint graph"],
  },

  // ------------------------------------------------------------ J4
  {
    slug: "knowledge-representation",
    school: "J",
    code: "J4",
    title: "Knowledge Representation & Reasoning",
    blurb:
      "Knowledge as logic: propositions, connectives and truth tables; predicates, quantifiers and unification; resolution as a machine-checkable proof system; and knowledge graphs as engineering.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["python"],
    softPrerequisites: ["search-problem-solving"],
    objectives: [
      "Read and write propositional formulas, judge equivalence with truth tables, and detect tautologies",
      "Translate natural-language statements into first-order logic with correct quantifier scope",
      "Unify literals by hand and apply the resolution rule to prove or refute",
      "Represent knowledge as graphs (ontologies, relations) and say what logic does and does not enforce",
    ],
    outcomes: [
      "A learner can determine satisfiability and validity of propositional formulas with truth tables",
      "A learner can translate between natural language and first-order logic in both directions without scope errors",
      "A learner can unify two atoms by hand, computing the most general unifier, and implement unification in Python",
      "A learner can run a resolution refutation by hand and implement a propositional/first-order resolver",
      "A learner can build a small knowledge graph with typed relations and query it programmatically",
    ],
    modules: [
      mod(
        "Propositional Logic",
        "Facts, connectives, truth — the smallest logic that still means something.",
        [
          "Read and write propositional formulas with the standard connectives",
          "Establish equivalence, validity and satisfiability with truth tables",
        ],
        ["concept-check", "derive", "fill-in", "predict-output"],
        [
          ch("Propositions and Truth", "Symbols, connectives and the laws they satisfy", [
            L(
              "Propositions and Connectives",
              25,
              ["proposition", "conjunction", "implication"],
              "NOT, AND, OR, IMPLIES, IFF: what each connective means, and the reading habits that prevent translation errors.",
              "concept",
              3
            ),
            L(
              "Truth Tables and Equivalence",
              30,
              ["truth table", "logical equivalence", "tautology"],
              "Systematic evaluation: equivalence laws, tautologies and contradictions, including the de Morgan and implication identities.",
              "worked-example",
              3
            ),
          ]),
          ch("Deduction", "From premises to conclusions by rule", [
            L(
              "Natural Deduction and Inference Rules",
              30,
              ["modus ponens", "inference rule", "soundness"],
              "Modus ponens and its cousins: derivations as chains of licensed moves, and what soundness promises.",
              "concept",
              3
            ),
            L(
              "Resolution in the Propositional Calculus",
              35,
              ["conjunctive normal form", "resolution rule", "refutation"],
              "One rule to reason with: convert to CNF, negate the goal, derive the empty clause — by hand and in Python.",
              "code",
              3
            ),
          ]),
        ]
      ),
      mod(
        "First-Order Logic and Knowledge",
        "Objects, relations and quantifiers — and knowledge representation at scale.",
        [
          "Translate quantified statements between language and logic with correct scope",
          "Unify atoms, apply resolution with unification, and build a small knowledge graph",
        ],
        ["concept-check", "derive", "write-code", "case-analysis"],
        [
          ch("Predicates and Quantifiers", "The logic of objects and relations", [
            L(
              "Predicates, Constants and Terms",
              25,
              ["predicate", "term", "atom"],
              "From propositions to predicates: objects, relations, functions — the vocabulary of first-order logic.",
              "concept",
              2
            ),
            L(
              "Quantifiers and Unification",
              35,
              ["universal quantifier", "existential quantifier", "most general unifier"],
              "For all and there exists, with the scope discipline that keeps translations honest — then unification, pattern matching with variables.",
              "code",
              3
            ),
          ]),
          ch("Reasoning at Scale", "Machine proof and engineered knowledge", [
            L(
              "Resolution and Skolemization",
              35,
              ["Skolem normal form", "clausal form", "resolution refutation"],
              "Strip the quantifiers without changing satisfiability, then resolve: a complete proof procedure for first-order logic.",
              "worked-example",
              3
            ),
            L(
              "Knowledge Graphs and Ontologies",
              30,
              ["knowledge graph", "ontology", "triple store"],
              "Logic as engineering: triples, schemas, inheritance and queries — what graph databases enforce and what they quietly don't.",
              "reading",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Knowledge & Reasoning — Final Exam", 40, 14),
    projects: [
      proj(
        "The Resolution Prover",
        "Build a theorem prover for propositional and first-order logic: a parser for a formula language, conversion to clausal form (with Skolemization for the first-order case), and resolution with unification and a fair set-of-support strategy. Prove a battery of classic arguments, include at least two that fail, and document exactly which step blocks each failure.",
        8,
        "capstone",
        [
          "A formula parser (propositional and first-order concrete syntax)",
          "CNF and Skolem conversion with each step inspectable",
          "Resolution engine with unification and a proof trace output",
          "A test battery: at least eight provable arguments and two documented non-theorems",
        ],
        [
          "Every provable battery entry terminates with the empty clause and a valid trace",
          "Unifier computed is the most general unifier on the test cases",
          "Non-theorems are reported honestly (saturated clause set) rather than by timeout alone",
        ],
        ["python", "dataclasses", "typing"]
      ),
    ],
    placementEligible: true,
    keywords: ["propositional logic", "first-order logic", "resolution", "unification", "knowledge graph"],
  },

  // ------------------------------------------------------------ J5
  {
    slug: "classical-planning",
    school: "J",
    code: "J5",
    title: "Classical Planning",
    blurb:
      "Action as logic: STRIPS operators with preconditions and effects, progression and regression through plan space, the planning graph with mutual exclusion, and hierarchical task networks.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["search-problem-solving", "knowledge-representation"],
    softPrerequisites: [],
    objectives: [
      "Define planning domains and problems in STRIPS: states as propositions, actions as operators",
      "Search plan space with progression and regression and know when each is the better direction",
      "Build planning graphs level by level, mark mutex constraints, and extract plans with Graphplan",
      "Explain hierarchical task networks and how classical planning appears inside real schedulers",
    ],
    outcomes: [
      "A learner can write a STRIPS domain (operators with add/delete lists) and a matching problem file",
      "A learner can trace progression search on a blocks-world problem by hand and implement it",
      "A learner can construct a planning graph to the level-off, justify every mutex arc, and explain the extraction pass",
      "A learner can implement a blocks-world planner and verify its plans against the operators' preconditions",
    ],
    modules: [
      mod(
        "The Planning Language",
        "States as propositions, actions as operators: the STRIPS inheritance.",
        [
          "Write STRIPS operators with correct preconditions and add/delete effects",
          "Trace progression and regression search by hand and implement progression",
        ],
        ["concept-check", "predict-output", "write-code", "case-analysis"],
        [
          ch("Actions as Operators", "Preconditions, add lists, delete lists", [
            L(
              "STRIPS: States, Actions and Goals",
              35,
              ["STRIPS", "precondition", "add list"],
              "The blocks world and its famous operators: states as proposition sets, actions that add and delete exactly what they say.",
              "concept",
              3
            ),
            L(
              "Planning Domains and Problems",
              30,
              ["planning domain", "planning problem", "initial state"],
              "Domain versus problem: reusable operator libraries and the instance that points them at a world.",
              "concept",
              2
            ),
          ]),
          ch("Search in Planning Space", "Progression, regression and distance heuristics", [
            L(
              "Progression and Regression",
              35,
              ["progression search", "regression search", "state space"],
              "Search forward from the initial state or backward from the goal — two directions with very different frontiers.",
              "worked-example",
              3
            ),
            L(
              "Heuristics for Planning",
              30,
              ["delete relaxation", "ignore-delete-lists heuristic", "relaxed graph plan"],
              "Relax the problem until it is easy, solve that, and use its cost as a heuristic — the h-add family in one lesson.",
              "reading",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Graphs and Hierarchies",
        "Graphplan's planning graph and the HTN answer to scale.",
        [
          "Build a planning graph with mutex reasoning and extract a valid plan",
          "Explain HTN decompositions and the engineering realities of deployed planners",
        ],
        ["concept-check", "predict-output", "write-code", "interpret-results"],
        [
          ch("The Planning Graph", "A polynomial structure that thinks about all plans at once", [
            L(
              "Graphplan's Planning Graph",
              35,
              ["planning graph", "proposition level", "action level"],
              "Alternate proposition and action levels, growing the graph until it levels off — reachability made explicit.",
              "concept",
              3
            ),
            L(
              "Mutual Exclusion and the Level Off",
              30,
              ["mutex", "level off", "plan extraction"],
              "Mark what cannot coexist at each level, stop when two consecutive levels agree, and extract plans backward.",
              "worked-example",
              3
            ),
          ]),
          ch("Hierarchies", "Abstract tasks, decompositions and the deployed world", [
            L(
              "HTN Planning",
              30,
              ["hierarchical task network", "task decomposition", "method"],
              "Plan by refining abstract tasks with methods instead of searching over states — why real systems love it.",
              "concept",
              3
            ),
            L(
              "Planning in the Wild",
              30,
              ["scheduler", "PDDL", "planning deployment"],
              "From NASA remote agents to factory schedulers: what classical planning actually runs on today, and what replaced it.",
              "reading",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Classical Planning — Final Exam", 45, 14),
    projects: [
      proj(
        "The Blocks-World Planner",
        "Implement a blocks-world planner with two engines on one operator library: progression search with a delete-relaxation heuristic, and a Graphplan-style planning graph with mutex marking and backward extraction. Run both on a fixed suite of problems, verify every emitted plan by replaying its operators, and compare node counts and plan lengths.",
        10,
        "capstone",
        [
          "A blocks-world domain: operators (stack, unstack, move) with exact preconditions and effects",
          "Progression engine with the delete-relaxation heuristic",
          "Planning-graph engine with mutex arcs and backward plan extraction",
          "A plan verifier that replays operator applications against preconditions",
          "A comparison report over the fixed problem suite",
        ],
        [
          "Every plan emitted by either engine passes the replay verifier",
          "Mutex markings are justified: each arc cites interference or competing-needs",
          "The comparison distinguishes node counts from plan length honestly",
        ],
        ["python", "dataclasses", "frozenset"]
      ),
    ],
    placementEligible: true,
    keywords: ["STRIPS", "planning graph", "Graphplan", "HTN", "progression search"],
  },

  // ------------------------------------------------------------ J6
  {
    slug: "expert-systems-uncertainty",
    school: "J",
    code: "J6",
    title: "Expert Systems & Uncertainty",
    blurb:
      "Knowledge as production rules: forward and backward chaining, explanation traces and knowledge engineering — then the honest turn to probability, Bayes' rule and Bayesian networks.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["knowledge-representation"],
    softPrerequisites: [],
    objectives: [
      "Represent domain knowledge as production rules and run forward and backward chaining over it",
      "Explain expert-system behavior from a rule trace — the explanation feature that defined the field",
      "Compute with Bayes' rule and explain why certainty factors were an unsatisfactory shortcut",
      "Read Bayesian networks: factorization, independence, and inference by enumeration",
    ],
    outcomes: [
      "A learner can trace forward and backward chaining by hand over a rule base and implement both",
      "A learner can generate an explanation trace for any conclusion a rule base derives",
      "A learner can solve medical-test style probability problems with Bayes' rule and verify the arithmetic",
      "A learner can read a Bayesian network, list the independences it asserts, and compute a posterior by enumeration",
    ],
    modules: [
      mod(
        "Expert Systems",
        "Rules as knowledge: the architecture that carried AI into industry.",
        [
          "Represent domain expertise as a production rule base",
          "Trace and implement forward and backward chaining with explanation",
        ],
        ["concept-check", "predict-output", "write-code", "case-analysis"],
        [
          ch("Production Systems", "Working memory, rules and the recognize-act cycle", [
            L(
              "Rules as Knowledge",
              30,
              ["production rule", "working memory", "recognize-act cycle"],
              "IF-THEN as a knowledge format: the production-system architecture and the conflict-resolution question.",
              "concept",
              3
            ),
            L(
              "Forward Chaining: Rete and Conflict Resolution",
              35,
              ["forward chaining", "Rete network", "conflict resolution"],
              "Data-driven reasoning: match rules against working memory, decide what fires, repeat — with the Rete speed-up idea.",
              "code",
              3
            ),
          ]),
          ch("Explanation and Engineering", "Why the clinician trusted MYCIN", [
            L(
              "Backward Chaining and Explanation",
              30,
              ["backward chaining", "goal tree", "explanation trace"],
              "Goal-driven reasoning and the WHY/HOW traces that made rule systems auditable — implemented, not just described.",
              "code",
              3
            ),
            L(
              "Knowledge Engineering: MYCIN's Lessons",
              30,
              ["MYCIN", "certainty factor", "knowledge acquisition"],
              "What building MYCIN and XCON taught the field: where rules shine, where certainty factors cheated, and what broke at scale.",
              "reading",
              3
            ),
          ]),
        ]
      ),
      mod(
        "Reasoning Under Uncertainty",
        "From all-or-nothing logic to degrees of belief — and the networks that make them tractable.",
        [
          "Apply probability as an extension of logic to uncertain beliefs",
          "Explain and compute Bayesian-network inference by enumeration",
        ],
        ["concept-check", "calculation", "derive", "interpret-results"],
        [
          ch("Probability as Degrees of Belief", "The calculus that replaced certainty factors", [
            L(
              "From Logic to Probability",
              30,
              ["probability", "sample space", "axioms of probability"],
              "Why logic cannot live with uncertainty, and how the three axioms of probability rebuild inference for a noisy world.",
              "concept",
              3
            ),
            L(
              "Bayes' Rule and Inference",
              35,
              ["Bayes' rule", "prior", "posterior"],
              "Conditioning as belief revision: Bayes' rule, the base-rate lesson every diagnostic example teaches, and its arithmetic.",
              "worked-example",
              3
            ),
          ]),
          ch("Networks", "Independence engineered into a graph", [
            L(
              "Bayesian Networks",
              35,
              ["Bayesian network", "conditional probability table", "factorization"],
              "A DAG of direct influences: the chain rule factorized, independence read off the graph, CPTs as local knowledge.",
              "concept",
              3
            ),
            L(
              "Inference and the Expert-System Legacy",
              30,
              ["enumeration inference", "independence", "expert-system legacy"],
              "Compute a posterior by enumeration on a real network, then trace the line from MYCIN's certainty factors to today's probabilistic expert systems.",
              "reading",
              3
            ),
          ]),
        ]
      ),
    ],
    finalExam: exam("Expert Systems & Uncertainty — Final Exam", 40, 14),
    projects: [
      proj(
        "The Diagnostic Advisor",
        "Build a small rule-based advisor on a domain of your choosing (a triage assistant, a plant-care diagnostician, a network troubleshooter): a rule base of at least fifteen rules, forward chaining with conflict resolution, backward chaining for a chosen goal, and an explanation trace for every conclusion. Then identify one rule whose conclusion should really carry uncertainty, and write the Bayes' rule computation that would replace it.",
        8,
        "independent",
        [
          "A rule base (15+ rules) with no unreachable rules and no contradictions",
          "Forward chaining with an explicit conflict-resolution strategy",
          "Backward chaining to a chosen goal with a WHY/HOW explanation trace",
          "A written uncertainty analysis: one rule, its certainty-factor critique, and the Bayes computation",
        ],
        [
          "Forward and backward chaining agree on every derivable fact",
          "Explanation traces reference the exact rules and facts used",
          "The Bayes computation is arithmetically verified in code or by hand",
        ],
        ["python", "dataclasses", "re"]
      ),
    ],
    placementEligible: true,
    keywords: ["expert system", "forward chaining", "backward chaining", "Bayes' rule", "Bayesian network"],
  },
];
