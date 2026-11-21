/**
 * SCHOOL J — PLACEMENT BANKS (CLASSICAL ARTIFICIAL INTELLIGENCE)
 * Ten questions per subject (6 subjects, 60 questions), keyed by slug,
 * ids "<slug>-p1" ... "<slug>-p10".
 *
 * Bank design per subject: 3 recall / 4 applied / 3 judgment, spanning
 * every module. A working classical-AI or CS-AI professional should
 * score 9–10; a newcomer should land 0–3. Distractors are the classic
 * conceptual traps (A* with inadmissible heuristics, minimax vs
 * expectimax, forward vs backward chaining, probability vs logic).
 */
import type { PlacementBank } from "../../types";

export const schoolJPlacement: PlacementBank = {
  "search-problem-solving": [
    {
      id: "search-problem-solving-p1",
      prompt: "Which five components define a search problem?",
      options: [
        "Initial state, successor function, goal test, path cost — plus a heuristic function",
        "Initial state, successor function, goal test, path cost — plus the state space itself",
        "Start node, edge weights, admissible heuristic, closed list and goal node",
        "Variables, domains, constraints and a solution concept",
      ],
      answer: 1,
      explanation:
        "A search problem is (initial state, successor function, goal test, path cost); the state space is the graph these generate. A heuristic is knowledge ADDED to a formulation — never part of the problem definition itself.",
    },
    {
      id: "search-problem-solving-p2",
      prompt: "Breadth-first search is optimal under which condition?",
      options: [
        "Always, on any graph",
        "When all step costs are equal",
        "Only when a heuristic is consistent",
        "When the branching factor is less than 2",
      ],
      answer: 1,
      explanation:
        "BFS expands shallowest-first, so it finds the fewest-EDGE path. That equals the cheapest path only when every edge costs the same. With varying costs you need uniform-cost search; with heuristics, A*.",
    },
    {
      id: "search-problem-solving-p3",
      prompt: "A state space is a finite tree with branching factor b and solution depth d (deepest goal shallow). Which uninformed algorithm has the smallest asymptotic memory footprint?",
      options: [
        "Breadth-first search",
        "Uniform-cost search",
        "Depth-first search",
        "Iterative deepening search",
      ],
      answer: 2,
      explanation:
        "DFS stores a single path plus siblings: O(b·m) for depth m — far less than BFS's O(b^d). Iterative deepening keeps DFS's small frontier per pass; uniform-cost and BFS both hold O(b^d) nodes.",
    },
    {
      id: "search-problem-solving-p4",
      prompt: "A colleague's A* implementation returns suboptimal paths on a weighted graph. They use an admissible (but inconsistent) heuristic WITH a closed list, reopening nothing. What is the most likely cause?",
      options: [
        "A* is only optimal with inadmissible heuristics",
        "Graph search with an inconsistent heuristic can settle a node too early; they must reopen nodes or use a stricter heuristic",
        "The priority queue must break ties alphabetically",
        "A* cannot run on weighted graphs",
      ],
      answer: 1,
      explanation:
        "Tree-search A* is optimal with any admissible h. GRAPH-search A* needs consistency (or node reopening); with an inconsistent h and a permanent closed list, the first pop of a node need not have its best g-value — suboptimal paths follow.",
    },
    {
      id: "search-problem-solving-p5",
      prompt: "The Manhattan-distance heuristic for the eight-puzzle is admissible because:",
      options: [
        "It never disagrees with the misplaced-tiles heuristic",
        "A tile needs at least its Manhattan distance in moves to reach home, so true cost is at least the estimate",
        "It is computed on the relaxed puzzle where tiles can teleport",
        "It always equals the true solution length",
      ],
      answer: 1,
      explanation:
        "Admissible = never overestimates. Each tile physically requires at least |dx|+|dy| moves, so the sum of Manhattan distances is a lower bound on moves. It is the exact solution length of the relaxation where tiles may slide through each other — which is exactly why it dominates misplaced tiles.",
    },
    {
      id: "search-problem-solving-p6",
      prompt: "Route finding with h = straight-line distance / max speed (lower bound on true travel time) and uniform edge costs in hours. Running A* with this h on a graph where the optimal path is 10 hours, which statement is TRUE?",
      options: [
        "A* may pop a 10-hour goal after an 11-hour path is fully expanded",
        "A* is guaranteed to return an 11-hour path if one looks shorter to h",
        "The first goal node popped from the frontier is on an optimal path",
        "A* will miss the goal entirely unless h is integer",
      ],
      answer: 2,
      explanation:
        "With an admissible h, when a goal with cost C* is at the frontier top, every other frontier node has f = g+h ≥ C*, so no worse path can be found first. Popping the goal ends the search with an optimal path in hand.",
    },
    {
      id: "search-problem-solving-p7",
      prompt: "Which property do hill climbing and simulated annealing SHARE?",
      options: [
        "Both maintain a priority frontier ordered by f = g + h",
        "Both keep the path from the start to the current state",
        "Neither keeps the path — they search over states, not paths",
        "Both are complete on finite landscapes",
      ],
      answer: 2,
      explanation:
        "Local search works on whole-state neighbors (e.g., a full n-queens configuration) and reports a final state, not a route to it. That is the defining trade: path information is discarded in exchange for tiny memory (O(1)–O(b)) per step.",
    },
    {
      id: "search-problem-solving-p8",
      prompt: "Simulated annealing accepts a worse neighbor with probability e^(ΔE/T). As T → 0 with a slow enough cooling schedule, the algorithm's guarantee approaches:",
      options: [
        "Finding the global optimum with probability approaching 1",
        "Finding only local optima, as always",
        "Behaving exactly like greedy best-first search",
        "Terminating without evaluating any neighbor",
      ],
      answer: 0,
      explanation:
        "With logarithmically slow cooling the stationary distribution concentrates on global optima — probability of ending at the global optimum approaches 1. Fast schedules lose the guarantee (that is the art: practical schedules are faster and merely good).",
    },
    {
      id: "search-problem-solving-p9",
      prompt: "A problem needs the cheapest ACTION SEQUENCE, and states revisited along the way must be reported in order. Which family fits?",
      options: [
        "Local search — it optimizes the whole state directly",
        "Tree/graph search (uniform-cost or A*) — solutions are paths by construction",
        "Constraint propagation — it assigns all variables at once",
        "Hill climbing with random restarts",
      ],
      answer: 1,
      explanation:
        "If the PATH is the answer, you need path-producing search: uniform-cost or A*. Local search returns a final state and cannot tell you how it got there — its histories are exploration noise, not solutions.",
    },
    {
      id: "search-problem-solving-p10",
      prompt: "You measure two admissible heuristics on the same benchmark set: h1 expands 5,000 nodes on average, h2 expands 20,000. The most defensible conclusion?",
      options: [
        "h2 must be inconsistent",
        "h1 dominates h2 (is at least as informed) on those instances, or at least behaves as if it does on average",
        "h1 must have a smaller branching factor",
        "h2 must be inadmissible",
      ],
      answer: 1,
      explanation:
        "Fewer expansions with optimality preserved means h1 is effectively more informed — typically dominating h2 pointwise (h1(s) ≥ h2(s)). Node counts measure informedness via the effective branching factor; both heuristics remain admissible.",
    },
  ],

  "adversarial-search-games": [
    {
      id: "adversarial-search-games-p1",
      prompt: "Minimax assumes the opponent does what?",
      options: [
        "Plays uniformly at random",
        "Always plays a move that minimizes your value (plays perfectly)",
        "Plays the move that ends the game fastest",
        "Chooses to maximize the total payoff for both players",
      ],
      answer: 1,
      explanation:
        "Minimax is the pessimistic equilibrium: at MIN levels the opponent picks the branch with your smallest backed-up value. Random or fallible opponents call for expectimax instead — minimax's guarantee is only against perfect play.",
    },
    {
      id: "adversarial-search-games-p2",
      prompt: "Alpha-beta pruning changes which property of the search?",
      options: [
        "The move chosen at the root — it can differ from minimax when ordering is poor",
        "The value returned — it always equals minimax's value, only nodes visited change",
        "The terminal utility function",
        "Nothing; it is a caching optimization that can return stale values",
      ],
      answer: 1,
      explanation:
        "Alpha-beta prunes only branches that provably cannot influence the root decision, so the returned move equals minimax's. What changes is work: with perfect ordering the effective branching factor drops to its square root.",
    },
    {
      id: "adversarial-search-games-p3",
      prompt: "At a MAX node, alpha = 5 after the first child, and the second child is a MIN node whose first grandchild returns 3. What happens?",
      options: [
        "The MIN node continues; the value 5 is final",
        "The MIN node can be cut off: its value is at most 3, below alpha, so MAX will never choose it",
        "Beta becomes 3 and the whole tree restarts",
        "The grandchild value must be recomputed with a deeper cutoff",
      ],
      answer: 1,
      explanation:
        "The MIN node's value will only DECREASE from 3 as more children are examined — already below alpha=5, so MAX prefers the first child regardless. Beta-cut: stop expanding the MIN node. This is the pruning rule in action.",
    },
    {
      id: "adversarial-search-games-p4",
      prompt: "Why does move ordering matter so much for alpha-beta?",
      options: [
        "It changes the minimax value of the game",
        "Good ordering produces cuts earlier; perfect ordering visits about b^(m/2) instead of b^m nodes",
        "It reduces the game's branching factor permanently",
        "It makes the evaluation function linear",
      ],
      answer: 1,
      explanation:
        "Pruning depends on tight alpha-beta windows, which only appear when strong moves are searched first. Ordering never changes the answer — only the exponent: b^(m/2) effective branching means a fixed time budget searches twice as deep.",
    },
    {
      id: "adversarial-search-games-p5",
      prompt: "An evaluation function returns +material for MAX minus material for MIN, evaluated at a fixed depth cutoff with quiescence ignored. What classical failure do you expect?",
      options: [
        "The engine resigns in won positions",
        "The horizon effect: it walks into discovered tactics just past the cutoff because static scores look calm",
        "Minimax values become non-deterministic",
        "Alpha-beta pruning stops working entirely",
      ],
      answer: 1,
      explanation:
        "Static evaluation at an arbitrary cutoff sees 'calm' positions that are one ply from catastrophe (or opportunity) — the horizon effect. Quiescence search extends tactical (noisy) positions past the nominal depth to fight exactly this.",
    },
    {
      id: "adversarial-search-games-p6",
      prompt: "Backgammon adds dice. To model it correctly you insert which node type between MAX and MIN levels?",
      options: [
        "A chance node whose value is the expectation over die rolls",
        "A second MAX node",
        "A terminal node with utility 0",
        "A constraint node",
      ],
      answer: 0,
      explanation:
        "Chance nodes take the probability-weighted average of their children — expectimax. Values become expected utilities rather than guaranteed minimax values, and alpha-beta pruning must be far more conservative (bounds on utility ranges).",
    },
    {
      id: "adversarial-search-games-p7",
      prompt: "In the game tree traced in class: root MAX has children A (MIN=3), B (MIN=5), C (MIN=2) — all fully evaluated. What does MAX play, and with what value?",
      options: [
        "B with value 5",
        "A with value 3",
        "C with value 2",
        "Indeterminate without the leaf values",
      ],
      answer: 0,
      explanation:
        "MAX picks the largest backed-up value: max(3, 5, 2) = 5, so B. The backed-up values ARE the summary of every leaf below — no further information is needed once MIN levels have resolved.",
    },
    {
      id: "adversarial-search-games-p8",
      prompt: "Your opponent is known to blunder 30% of the time (random move). Strict minimax play will:",
      options: [
        "Exploit the blunders optimally",
        "Overprepare for perfect defense, leaving value on the table that expectimax would capture",
        "Immediately lose every game",
        "Convert the game into a CSP",
      ],
      answer: 1,
      explanation:
        "Minimax prices every opponent reply as if perfect — a pessimistic model. Against fallible opponents, modeling the errors (expectimax or opponent modeling) captures traps and complications that minimax judges pointless.",
    },
    {
      id: "adversarial-search-games-p9",
      prompt: "Which statement about terminal-test depth in game programs is TRUE?",
      options: [
        "Games like chess are searched to terminal states routinely",
        "Non-terminal positions at the depth limit are scored by an evaluation function — the tree is far larger than any budget",
        "Depth limits exist only to manage memory, never time",
        "The evaluation function replaces the utility function at terminals as well",
      ],
      answer: 1,
      explanation:
        "Game trees (b≈35, m≈80 for chess) are astronomically beyond complete search, so real engines cut off and evaluate. Utility still governs true terminals; the evaluation function estimates what utility those positions are heading toward.",
    },
    {
      id: "adversarial-search-games-p10",
      prompt: "Alpha-beta with random move ordering is benchmarked against plain minimax on the same 20 midgame positions, same depth. What result do you expect?",
      options: [
        "Identical move choices, with alpha-beta visiting noticeably fewer nodes on average",
        "Alpha-beta picks different, safer moves",
        "Minimax is faster because it skips the alpha/beta bookkeeping",
        "Node counts will be identical; only code complexity differs",
      ],
      answer: 0,
      explanation:
        "Even random ordering prunes (expected effective branching b^(3m/4)); the answer never changes. The measured dividend grows as ordering improves toward b^(m/2) — exactly the relationship the engine project quantifies.",
    },
  ],

  "constraint-satisfaction": [
    {
      id: "constraint-satisfaction-p1",
      prompt: "A constraint satisfaction problem is defined by which triple?",
      options: [
        "States, operators, goal test",
        "Variables, domains, constraints",
        "Nodes, edges, weights",
        "Facts, rules, conflict set",
      ],
      answer: 1,
      explanation:
        "CSPs are (X, D, C): variables with domains and constraints relating them. A solution is a complete assignment satisfying every constraint — a very special, checkable kind of search problem where path cost is irrelevant.",
    },
    {
      id: "constraint-satisfaction-p2",
      prompt: "In the constraint graph of a binary CSP, what does an edge mean?",
      options: [
        "A value flow between variables",
        "A constraint relating exactly its two endpoint variables",
        "A preference for smaller domain values",
        "An inheritance relationship",
      ],
      answer: 1,
      explanation:
        "Nodes are variables; each edge is one binary constraint (or the aggregation of several) between its endpoints. The graph's SHAPE — tree, nearly-tree, dense — then predicts which algorithms will succeed cheaply.",
    },
    {
      id: "constraint-satisfaction-p3",
      prompt: "Australia map coloring (7 regions, 3 colors) after assigning WA=red and NT=green, plain backtracking with no propagation. Which region should MRV assign next?",
      options: [
        "Tasmania (isolated, domain still 3)",
        "South Australia (neighbors WA, NT — domain reduced to 1)",
        "Western Australia (already assigned)",
        "Whichever is first alphabetically",
      ],
      answer: 1,
      explanation:
        "MRV (minimum remaining values) picks the most constrained variable: SA has one legal color left, so assigning it either succeeds immediately or fails now — cheaply — instead of after building a doomed partial assignment.",
    },
    {
      id: "constraint-satisfaction-p4",
      prompt: "Forward checking after an assignment does what?",
      options: [
        "Reorders the constraint graph",
        "Removes values from unassigned neighbors' domains that conflict with the assignment",
        "Checks every constraint in the whole problem",
        "Assigns the variable with the largest domain next",
      ],
      answer: 1,
      explanation:
        "One step of lookahead: neighbors lose impossible values immediately. The payoff is early dead-end detection — a wiped-out domain announces failure at the assignment that caused it, not after further search.",
    },
    {
      id: "constraint-satisfaction-p5",
      prompt: "Arc consistency (on arc X→Y) requires that:",
      options: [
        "X and Y have equal domain sizes",
        "Every value in X's domain has some consistent partner in Y's domain",
        "At least one value of Y equals a value of X",
        "The constraint between X and Y is a function",
      ],
      answer: 1,
      explanation:
        "Each x must have SUPPORT — a y consistent with it. AC-3 enforces this for every arc, deleting unsupported values, propagating deletions to neighboring arcs via a queue until fixpoint or a domain wipes out (failure).",
    },
    {
      id: "constraint-satisfaction-p6",
      prompt: "What does AC-3 catch that forward checking does not?",
      options: [
        "The assignment order of variables",
        "Dead ends two or more levels ahead: propagation cascades across constraints between UNASSIGNED variables",
        "Non-binary constraints",
        "The optimal solution's cost",
      ],
      answer: 1,
      explanation:
        "Forward checking only prunes domains of neighbors of the JUST-assigned variable. AC-3 re-examines arcs between unassigned variables too, so inconsistencies among future choices surface before any assignment reaches them.",
    },
    {
      id: "constraint-satisfaction-p7",
      prompt: "Backtracking counts: 45,000 assignments without propagation; 3,200 with MRV alone; 210 with MRV + forward checking. The most defensible interpretation?",
      options: [
        "Propagation changed the solution found",
        "Early failure detection pays: each technique prunes doomed subtrees earlier, and their effects multiply",
        "MRV made the problem tree-structured",
        "The problem was unsolvable without forward checking",
      ],
      answer: 1,
      explanation:
        "All three runs find the same solutions (they differ only in order and pruning). Ordering heuristics fail fast; propagation predicts failure — combining them compounds the savings. This is the Sudoku-project measurement.",
    },
    {
      id: "constraint-satisfaction-p8",
      prompt: "A constraint graph is a TREE (no cycles). With n variables and domain size d, the right complexity claim is:",
      options: [
        "Still exponential in n in the worst case",
        "Solvable (or proven unsatisfiable) in O(n·d²) by enforcing arc consistency along a topological order",
        "Requires backtracking with restarts",
        "NP-hard regardless of structure",
      ],
      answer: 1,
      explanation:
        "Tree-structured CSPs surrender to directional arc consistency: process variables leaves-to-root, then assign root-to-leaves with every choice already supported. Linear time — the structural result decomposition generalizes.",
    },
    {
      id: "constraint-satisfaction-p9",
      prompt: "Sudoku modeled as a CSP: 81 variables, domains 1–9, 27 all-different constraints. Which statement is TRUE?",
      options: [
        "Sudoku's constraints are binary, so its constraint graph is a plain graph with 81 nodes",
        "All-different is naturally n-ary; a binary encoding explodes the graph, but modern encodings keep it tractable",
        "Sudoku cannot be solved by backtracking because of the all-different constraints",
        "The 27 constraints are soft preferences",
      ],
      answer: 1,
      explanation:
        "Rows, columns and boxes are ALL-DIFFERENT over 9 variables each. Naively binarizing yields 36 binary 'not-equal' edges per unit (972 total); clever encodings or direct n-ary propagation handle it without the blow-up.",
    },
    {
      id: "constraint-satisfaction-p10",
      prompt: "Which problem is BEST suited to CSP techniques rather than path search?",
      options: [
        "Finding the fastest route between two cities",
        "Timetabling exams so no student has two exams at once",
        "Finding the shortest sequence of robot actions to rearrange blocks",
        "Choosing the next move in chess",
      ],
      answer: 1,
      explanation:
        "Timetabling wants a complete consistent ASSIGNMENT — order irrelevant, path meaningless. Routes and block rearrangements are path problems; chess is adversarial. Matching the paradigm to the problem is half the engineering.",
    },
  ],

  "knowledge-representation": [
    {
      id: "knowledge-representation-p1",
      prompt: "Which formula is logically equivalent to ¬(P ∧ Q)?",
      options: [
        "¬P ∧ ¬Q",
        "¬P ∨ ¬Q",
        "P → ¬Q",
        "¬P → ¬Q",
      ],
      answer: 1,
      explanation:
        "De Morgan: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q. The distractor ¬P ∧ ¬Q is the dual error (that equals ¬(P ∨ Q)). P → ¬Q is only equivalent on the row where P is true — not equivalent, a one-row trap.",
    },
    {
      id: "knowledge-representation-p2",
      prompt: "Modus ponens licenses which inference?",
      options: [
        "From P → Q and ¬P, conclude ¬Q (denying the antecedent)",
        "From P → Q and Q, conclude P (affirming the consequent)",
        "From P → Q and P, conclude Q",
        "From P ∨ Q and P, conclude Q",
      ],
      answer: 2,
      explanation:
        "Modus ponens: given the implication and its antecedent, detach the consequent. Options 1 and 2 are the two CLASSIC formal fallacies — seductive, invalid patterns that truth tables refute with a single row.",
    },
    {
      id: "knowledge-representation-p3",
      prompt: "A formula is true under EVERY truth assignment. It is called:",
      options: [
        "Satisfiable",
        "A tautology (valid)",
        "A contradiction",
        "Contingent",
      ],
      answer: 1,
      explanation:
        "Valid/tautology: all rows true. Satisfiable: at least one row true (every tautology is satisfiable; not vice versa). Contradiction: no rows. Contingent: some rows each way — the ordinary case.",
    },
    {
      id: "knowledge-representation-p4",
      prompt: "Resolution refutation proves a conclusion C from premises Γ by showing:",
      options: [
        "C follows by modus ponens repeatedly",
        "Γ ∪ {¬C} is unsatisfiable — resolving clauses until the empty clause □ appears",
        "C is true in the intended model",
        "Γ and C have no shared propositional symbols",
      ],
      answer: 1,
      explanation:
        "Negate the goal, convert everything to CNF, resolve. Deriving □ (the empty clause) means the premises plus ¬C cannot all hold — so Γ ⊨ C. Refutation, not direct proof, is the machine-friendly direction.",
    },
    {
      id: "knowledge-representation-p5",
      prompt: "The most general unifier of P(x, y) and P(a, z) is:",
      options: [
        "{x/a, y/z}",
        "{x/a, z/y}",
        "{x/a, y/b, z/b} for a fresh constant b",
        "They do not unify",
      ],
      answer: 1,
      explanation:
        "x must become a; then y and z must agree — bind one to the other ({z/y}) rather than inventing constants. The result P(a, y) ≡ P(a, z) under the substitution is the MOST GENERAL unifier; {y/b, z/b} is a valid but more special unifier.",
    },
    {
      id: "knowledge-representation-p6",
      prompt: "'Every student who studies passes' — which FOL formula has the correct quantifier scope?",
      options: [
        "∀x Student(x) ∧ Studies(x) → Passes(x)",
        "∀x ((Student(x) ∧ Studies(x)) → Passes(x))",
        "∃x ((Student(x) ∧ Studies(x)) → Passes(x))",
        "∀x (Student(x) ∧ (Studies(x) → Passes(x)))",
      ],
      answer: 1,
      explanation:
        "The implication must be INSIDE the universal: ∀x ((S(x) ∧ St(x)) → P(x)). Option 1 parses as (∀x S(x)) ∧ ... — 'everything is a student' — the classic scope bug. Option 4 says every student studies and everything studying passes.",
    },
    {
      id: "knowledge-representation-p7",
      prompt: "Skolemization removes an existential quantifier ∃x P(x) under a surrounding ∀y by:",
      options: [
        "Deleting the quantifier and replacing x with a fresh constant",
        "Replacing x with a fresh function symbol f(y)",
        "Converting ∀y to ∃y",
        "Negating the matrix",
      ],
      answer: 1,
      explanation:
        "The witness may DEPEND on y (∀y ∃x ...), so x becomes f(y) — a Skolem function. Only a top-level ∃x (no enclosing ∀) becomes a constant. Skolemization preserves satisfiability, which is all resolution needs.",
    },
    {
      id: "knowledge-representation-p8",
      prompt: "A knowledge base entails a query (KB ⊨ Q) when:",
      options: [
        "Q is derivable from KB by some proof procedure",
        "Q is true in every model in which all of KB is true",
        "Q is true in the intended interpretation",
        "KB and Q are both satisfiable",
      ],
      answer: 1,
      explanation:
        "Entailment is semantic: every model of KB models Q. Derivability (syntactic) only matters because sound+complete calculi — like resolution — make it COINCIDE with entailment. 'True in the intended model' is the knowledge-engineering trap.",
    },
    {
      id: "knowledge-representation-p9",
      prompt: "What does a knowledge graph's schema (ontology) enforce that bare triples do not?",
      options: [
        "Storage efficiency",
        "Domain and range constraints on relations, and class membership — machine-checkable structure",
        "Faster regular-expression search",
        "Nothing; schemas are documentation only",
      ],
      answer: 1,
      explanation:
        "RDF alone allows any triple; an ontology (e.g., RDFS/OWL) states that :worksFor connects :Person to :Organization, that :Professor ⊑ :Person — violations become detectable. What logic the schema uses (and what it still cannot express) is the engineering judgment.",
    },
    {
      id: "knowledge-representation-p10",
      prompt: "Resolution with a fair strategy (e.g., set-of-support) on first-order clauses is:",
      options: [
        "Complete: if Γ ⊨ Q, the empty clause will eventually be derived",
        "Sound but incomplete — some valid arguments need human help",
        "Complete only for propositional logic",
        "Neither sound nor complete in general",
      ],
      answer: 0,
      explanation:
        "First-order resolution with unification and a fair parent-selection strategy is refutation-complete — the theoretical heart of Prolog. In practice termination is not guaranteed when Γ ⊭ Q (semi-decidability), which is why non-theorems saturate or run on.",
    },
  ],

  "classical-planning": [
    {
      id: "classical-planning-p1",
      prompt: "In STRIPS, an action's delete list contains:",
      options: [
        "Preconditions that failed",
        "Propositions removed from the state when the action executes",
        "Actions that become unavailable afterward",
        "Undesirable side effects the planner should avoid",
      ],
      answer: 1,
      explanation:
        "An operator is (preconditions, add list, delete list). Execution in state s: if preconditions ⊆ s, next state = (s − delete) ∪ add. Deletes are how the world changes — e.g., moving a block deletes On(A,Table).",
    },
    {
      id: "classical-planning-p2",
      prompt: "Progression search searches:",
      options: [
        "Backward from the goal through relevant actions",
        "Forward from the initial state by applying applicable operators",
        "Level by level through a planning graph",
        "Over partial plans, refining open conditions",
      ],
      answer: 1,
      explanation:
        "Progression = forward state-space search with operators. Regression (backward from goal) often wins when the goal mentions few propositions; both live inside the same state-space view of planning.",
    },
    {
      id: "classical-planning-p3",
      prompt: "The ignore-delete-lists heuristic (delete relaxation) is admissible because:",
      options: [
        "Deleting propositions can only make plans longer",
        "Ignoring deletes removes restrictions, so relaxed plans are never longer than real ones",
        "It is computed on the planning graph exactly",
        "Add lists are always subsets of goals",
      ],
      answer: 1,
      explanation:
        "Without deletes, nothing achieved ever un-achieves — the relaxed problem is easier (any relaxed plan maps to a real plan of ≤ length). A lower bound on real cost is exactly what an admissible heuristic must be.",
    },
    {
      id: "classical-planning-p4",
      prompt: "In a planning graph, proposition level S_{i+1} contains:",
      options: [
        "Only the goal propositions reachable by level i",
        "Every proposition in S_i plus everything added by actions whose preconditions held in S_i (plus no-ops)",
        "The states on any single solution path",
        "Propositions that are pairwise mutex",
      ],
      answer: 1,
      explanation:
        "Levels accumulate reachability: S_{i+1} = S_i ∪ adds of applicable-in-S_i actions (persistence included). The graph GROWS monotonically — which is what makes the level-off condition meaningful.",
    },
    {
      id: "classical-planning-p5",
      prompt: "Two actions at level A_i are mutex by 'interference' when:",
      options: [
        "Their preconditions are mutex at S_i",
        "One deletes a precondition or effect of the other",
        "They have different durations",
        "Both add the same proposition",
      ],
      answer: 1,
      explanation:
        "Interference mutex: a deletes what b needs or produces. The other rule — competing needs — marks actions whose PRECONDITIONS are mutex at the previous level. Both feed the mutex propagation up the graph.",
    },
    {
      id: "classical-planning-p6",
      prompt: "Graphplan stops expanding the planning graph when:",
      options: [
        "The goal propositions all appear at some level",
        "Two consecutive levels are identical (level off) with goals present but still mutex — or goals achieved non-mutex earlier",
        "Every action has been used once",
        "The mutex set becomes empty",
      ],
      answer: 1,
      explanation:
        "Levels grow monotonically and mutexes shrink monotonically, so if two consecutive levels are EQUAL the fixpoint is reached: no new reachability, no new independence. Goals present-but-mutex at level-off ⇒ unsolvable.",
    },
    {
      id: "classical-planning-p7",
      prompt: "Plan extraction in Graphplan works:",
      options: [
        "Forward from S_0, greedily taking cheapest actions",
        "Backward from the goal level, selecting non-mutex action sets whose preconditions are non-mutex at the level below",
        "By resolving the goal against all operators",
        "By random restarts until a plan fits",
      ],
      answer: 1,
      explanation:
        "Extraction runs backward: at each level pick a non-mutex action set covering current subgoals, recurse on their preconditions. Mutex markings make the search informed — that is the entire Graphplan idea.",
    },
    {
      id: "classical-planning-p8",
      prompt: "HTN planning differs from state-space planning because it searches over:",
      options: [
        "States, with better heuristics",
        "Task networks: abstract tasks decomposed by methods into subtasks and primitive actions",
        "Constraint graphs",
        "Game trees",
      ],
      answer: 1,
      explanation:
        "In HTNs the domain author supplies METHODS — recipes for refining abstract tasks. Planning becomes choosing decompositions, which encodes procedural expertise directly instead of rediscovering it through search.",
    },
    {
      id: "classical-planning-p9",
      prompt: "STRIPS-style classical planning makes ALL of these assumptions EXCEPT:",
      options: [
        "Actions are instantaneous and deterministic",
        "The world is fully observable",
        "A single agent acts",
        "Actions have continuous, real-valued durations",
      ],
      answer: 3,
      explanation:
        "Classical planning: deterministic, instantaneous, fully observable, single-agent, finite propositions. Continuous time/duration belongs to temporal planning; uncertainty to MDPs; multiple agents to game theory.",
    },
    {
      id: "classical-planning-p10",
      prompt: "A blocks-world planner emits: unstack(A,B), stack(A,C) — but B is under A and C is clear. Verifying this plan means:",
      options: [
        "Checking each action's preconditions hold in the state produced by the previous actions",
        "Trusting the planner's output — verification is redundant",
        "Comparing plan length against h+",
        "Re-running the planner with a different seed",
      ],
      answer: 0,
      explanation:
        "Replay verification: simulate the operators. Any plan — from any engine — is checked mechanically against preconditions/effects, which is why the blocks-world project ships a verifier alongside both engines.",
    },
  ],

  "expert-systems-uncertainty": [
    {
      id: "expert-systems-uncertainty-p1",
      prompt: "The recognize-act cycle of a production system does what?",
      options: [
        "Matches rules against working memory, selects one from the conflict set, fires it, repeats",
        "Backward chains from a goal to supporting facts",
        "Propagates probabilities through a network",
        "Searches the state space of rule orderings",
      ],
      answer: 0,
      explanation:
        "Forward execution in one loop: match (which rules' IF parts hold?), resolve (which of the conflict set fires?), act (update working memory), repeat until quiescence or a goal state. Inference order is the system's heartbeat.",
    },
    {
      id: "expert-systems-uncertainty-p2",
      prompt: "Conflict resolution strategies (specificity, recency, priority) exist to:",
      options: [
        "Prevent contradictions between rules from mattering by choosing deterministically among fireable rules",
        "Speed up pattern matching",
        "Order facts in working memory",
        "Choose backward over forward chaining",
      ],
      answer: 0,
      explanation:
        "When several rules match, SOMETHING must choose: specificity (most conditions matched), recency (newest facts), priority (author-ranked). The strategy encodes intent — and changes what the system concludes.",
    },
    {
      id: "expert-systems-uncertainty-p3",
      prompt: "MYCIN's explanation facility answered which two questions?",
      options: [
        "WHY (why is this fact needed?) and HOW (how was this conclusion reached?)",
        "WHO and WHEN",
        "WHAT IF and WHAT ELSE",
        "HOW MUCH and HOW OFTEN",
      ],
      answer: 0,
      explanation:
        "WHY exposes the goal stack (what the system is trying to establish); HOW prints the rule trace behind a derived fact. Auditable reasoning — not raw accuracy — is what earned clinician trust in the era.",
    },
    {
      id: "expert-systems-uncertainty-p4",
      prompt: "Backward chaining is the better strategy when:",
      options: [
        "You want every derivable fact, and inputs arrive incrementally",
        "A specific diagnosis is in question and most rules are irrelevant to it",
        "The rule base contains cycles",
        "Working memory is very small",
      ],
      answer: 1,
      explanation:
        "Backward chaining searches goal-directed: only rules concluding the goal (transitively) are consulted. When the user asks 'does the patient have condition X?', that focus beats forward chaining's derive-everything habit.",
    },
    {
      id: "expert-systems-uncertainty-p5",
      prompt: "Certainty factors (MYCIN's CF) were problematic primarily because:",
      options: [
        "They were too slow to compute",
        "They were not grounded in probability theory — combination rules could contradict the axioms, and independence was assumed silently",
        "They required Bayesian priors for every rule",
        "They could not represent negative evidence",
      ],
      answer: 1,
      explanation:
        "CFs were an engineering shortcut: plausible-looking combination rules with no probabilistic semantics — the same evidence combined in different orders could yield different certainties. Bayesian networks arose as the principled replacement.",
    },
    {
      id: "expert-systems-uncertainty-p6",
      prompt: "A test for a disease with 1% prevalence: sensitivity 99%, false positive rate 5%. A positive result means the probability of disease is closest to:",
      options: [
        "99%",
        "95%",
        "17%",
        "1%",
      ],
      answer: 2,
      explanation:
        "Bayes: P(D|+) = (0.99 × 0.01) / (0.99 × 0.01 + 0.05 × 0.99) ≈ 0.0099 / 0.0594 ≈ 16.7%. The false-positive mass of the 99% healthy population swamps the true positives — the base-rate lesson in one number.",
    },
    {
      id: "expert-systems-uncertainty-p7",
      prompt: "In a Bayesian network, an edge A → B asserts:",
      options: [
        "A causes B in the physical sense",
        "A is a direct influence: B's CPT is conditioned on A, and A is not independent of B",
        "B always follows A",
        "A and B are marginally independent",
      ],
      answer: 1,
      explanation:
        "The DAG encodes the factorization P(X1..Xn) = Π P(Xi | parents(Xi)). Edges are direct influences (often causal, but the semantics is probabilistic dependence), and missing edges assert (conditional) independences.",
    },
    {
      id: "expert-systems-uncertainty-p8",
      prompt: "Chain A → B → C (A influences B influences C). Which independence does the graph assert?",
      options: [
        "A ⊥ C (marginally independent)",
        "A ⊥ C given B (blocking the chain)",
        "B ⊥ C given A",
        "No independences at all",
      ],
      answer: 1,
      explanation:
        "Serial connection: conditioning on the middle node B blocks the path — A and C are independent GIVEN B. Marginally they are dependent (information flows through the unobserved chain). This is d-separation's first pattern.",
    },
    {
      id: "expert-systems-uncertainty-p9",
      prompt: "Enumeration inference on a Bayesian network computes a posterior by:",
      options: [
        "Sampling the joint distribution until estimates stabilize",
        "Summing joint probabilities over all consistent complete assignments, using the CPT factorization",
        " propagating intervals along edges",
        "Chaining certainty factors from evidence to query",
      ],
      answer: 1,
      explanation:
        "P(Q | e) = Σ_hidden P(Q, e, hidden) / P(e), each term a product of CPT entries — exact but exponential in the worst case. Variable elimination and sampling exist to tame exactly that blow-up.",
    },
    {
      id: "expert-systems-uncertainty-p10",
      prompt: "The knowledge-acquisition bottleneck refers to:",
      options: [
        "Compiling rule bases for speed",
        "Extracting correct, consistent rules from human experts — the slow, expensive core of expert-system engineering",
        "Storing working memory on disk",
        "Choosing a probability distribution's parameters",
      ],
      answer: 1,
      explanation:
        "Experts know more than they can state, state more than is consistent, and cannot estimate the numbers (probabilities, weights) the formalism needs. Feigenbaum named the cost: knowledge acquisition dominated every project's budget.",
    },
  ],
};
