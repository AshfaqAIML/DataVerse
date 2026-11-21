/**
 * PART_A_ASSESSMENT — the part checkpoint (12 questions, all three modules).
 * a-as-1..6 are the original delivery's questions, kept verbatim EXCEPT
 * two factual repairs: a-as-2's option A feedback claimed IDS generates
 * FEWER nodes than BFS (it generates ~11% more at b=10 — a-04's pinned
 * arithmetic: 123,456 vs 111,111; its advantage is memory), and a-as-3's
 * option D was incoherent (the sum of two admissible heuristics IS
 * inadmissible — replaced with the clean max-vs-sum contrast).
 * a-as-7..12 were added at full registry depth.
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_A_ASSESSMENT: QuizQuestion[] = [
  {
    id: "a-as-1",
    prompt: "Which component of a search problem must NOT contain history information?",
    options: [
      { text: "The state", correct: true, feedback: "Correct — states are complete snapshots; the path to them lives in the search tree's edges, not in the states themselves." },
      { text: "The goal test", correct: false, feedback: "The goal test reads states; storing history there is not even meaningful." },
      { text: "The path cost function", correct: false, feedback: "Cost is defined over (state, action, state') triples — again not history-bearing." },
      { text: "The successor function", correct: false, feedback: "It maps one state to its neighbors — history-free by construction." },
    ],
    explanation: "History-inflated states multiply the space by the number of histories — the state-completeness rule exists to prevent exactly that.",
  },
  {
    id: "a-as-2",
    prompt: "BFS, DFS and IDS run on a tree with unit costs, b = 4, d = 6, m = 8. Which is FALSE?",
    options: [
      { text: "IDS generates somewhat more nodes than BFS — about 33% more here (7,279 vs 5,461, goal test at generation) — and pays it gladly for O(b·d) memory", correct: false, feedback: "TRUE — regeneration is the whole price of iterative deepening, and it is cheap because the deepest level dominates the count: 11.1% at b = 10 (a-04's pinned arithmetic), 33% at this modest b = 4." },
      { text: "DFS may return a suboptimal goal at depth 8", correct: false, feedback: "TRUE — DFS dives; a depth-8 goal is found before any depth-6 one." },
      { text: "All three are optimal on this instance", correct: true, feedback: "FALSE — only BFS and IDS are optimal with unit costs; DFS has no optimality claim whatsoever." },
      { text: "IDS's memory is linear in d", correct: false, feedback: "TRUE — O(b·d): one path plus unexplored siblings." },
    ],
    explanation: "Unit-cost optimality belongs to BFS and IDS. DFS trades it away entirely for its O(b·m) frontier; IDS buys it back for a modest regeneration premium.",
  },
  {
    id: "a-as-3",
    prompt: "h1 (misplaced tiles) and h2 (Manhattan) for the eight-puzzle. Which is TRUE?",
    options: [
      { text: "h2 dominates h1, so h2-guided A* expands at most as many nodes", correct: true, feedback: "Correct — every misplaced tile contributes ≥ 1 to Manhattan, so h2 ≥ h1 everywhere; dominance provably shrinks (never grows) the expanded set." },
      { text: "h1 dominates h2 because it is faster to compute", correct: false, feedback: "Cheap to compute is not dominance — dominance is pointwise h-value, and h1 ≤ h2 everywhere." },
      { text: "Both are inadmissible on solvable instances", correct: false, feedback: "Both are admissible: each is the exact solution cost of a relaxation." },
      { text: "Their sum h1 + h2 is admissible, since the sum of two lower bounds is again a lower bound", correct: false, feedback: "The sum of two lower bounds on the SAME quantity is not a lower bound: h1 + h2 ≤ 2h* is all you get, and one move from solved the sum is 2 > 1 = h*. The combination that IS admissible is the max — which is exactly why keeping the dominant heuristic suffices." },
    ],
    explanation: "Dominance is the precise notion: h2 ≥ h1 ≥ 0 pointwise, both admissible ⇒ A*(h2) expands a subset of A*(h1)'s nodes. This is the project's measured claim.",
  },
  {
    id: "a-as-4",
    prompt: "Greedy best-first search on the Romania map chose Arad→Sibiu→Făgăraș→Bucharest (450 km) over the optimal 418 km route. The direct cause:",
    options: [
      { text: "Straight-line distance is inadmissible", correct: false, feedback: "It is admissible — the failure is not the heuristic's honesty but greedy's use of it." },
      { text: "Greedy orders the frontier by h alone, so the cheaper-through-Vâlcea route never competed: its intermediate h (193, then 100) always exceeded Făgăraș's 176 until the commitment was irreversible", correct: true, feedback: "Correct — g-blindness in the evaluation function. A* fixes exactly this by adding g to the key." },
      { text: "The frontier was too small", correct: false, feedback: "Frontier capacity was never the issue; the ordering was." },
      { text: "Bucharest's heuristic was wrong", correct: false, feedback: "h(Bucharest) = 0 is definitionally right." },
    ],
    explanation: "Greedy's non-optimality is structural: h alone cannot see money already spent. One added term — f = g + h — is the entire difference.",
  },
  {
    id: "a-as-5",
    prompt: "A consistent heuristic h satisfies which inequality, and what does it buy?",
    options: [
      { text: "h(n) ≤ c(n,n') + h(n') along every edge; it buys graph-search A* optimality without reopening", correct: true, feedback: "Correct — the triangle inequality makes f non-decreasing along paths, so a popped state never needs revisiting with a better g." },
      { text: "h(n) ≥ h*(n); it buys speed", correct: false, feedback: "That is the definition of an OVERestimating (inadmissible) heuristic — it buys nothing but broken guarantees." },
      { text: "h(n) ≤ h*(n); it buys tree-search optimality", correct: false, feedback: "That is admissibility — right inequality, wrong purchase: tree-search optimality, not the no-reopening property." },
      { text: "h(n) = h*(n); it buys O(d) expansion", correct: false, feedback: "Perfect heuristics do exist in textbook problems; consistency is a weaker, cheaper property." },
    ],
    explanation: "Admissibility (≤ h*) licenses tree-search optimality; consistency (the edge triangle inequality) additionally licenses permanent closed lists — the distinction a-08 builds carefully.",
  },
  {
    id: "a-as-6",
    prompt: "Steepest-ascent hill climbing on 8-queens complete-state formulations gets stuck on roughly 86% of random starts (canonical measurements; a-09's own run measured 87 of 100). The mechanism of failure, and the standard first remedy:",
    options: [
      { text: "Local optima with no improving neighbor; the remedy is random restarts — or annealing to accept bad moves", correct: true, feedback: "Correct: the landscape's local optima trap pure improvement; restarts resample the landscape, annealing walks out of traps probabilistically." },
      { text: "Stack overflow; the remedy is iteration", correct: false, feedback: "Hill climbing is not recursive — the failure is landscape, not machinery." },
      { text: "The heuristic is inadmissible; the remedy is Manhattan distance", correct: false, feedback: "Admissibility belongs to path search; local search has no such notion — its object is an objective, not a lower bound." },
      { text: "Plateaus only; the remedy is deeper search", correct: false, feedback: "Plateaus are one failure mode of several — local optima are the dominant one in the 8-queens measurements." },
    ],
    explanation: "Local search's honesty ledger: hill climbing fails on structure (optima, plateaus, ridges); restarts and annealing are the two classical buys-back.",
  },
  {
    id: "a-as-7",
    prompt: "BFS on a weighted graph returns a 3-edge path of cost 30 when a 5-edge path of cost 17 exists. The minimal repair that restores optimality:",
    options: [
      { text: "Add a heuristic to the frontier key as well as the cost", correct: false, feedback: "That is the A* upgrade — it needs a heuristic you may not have; the minimal repair fixes the ordering alone." },
      { text: "Order the frontier by path cost g instead of insertion order — uniform-cost search", correct: true, feedback: "Correct — cheapest-first popping with the goal test at the pop handles varying costs exactly; BFS is simply UCS with all costs equal." },
      { text: "Keep BFS but test the goal when a node is generated", correct: false, feedback: "That repairs neither: BFS still expands level by level, blind to cost — generation-time tests only change the node count." },
      { text: "Run BFS from both endpoints and join the fronts", correct: false, feedback: "Bidirectional search halves the exponent; it still sees no edge weights at all." },
    ],
    explanation: "Cost-blindness lives in the frontier discipline: FIFO treats 'shallowest' as 'cheapest', which only holds when every step costs the same.",
  },
  {
    id: "a-as-8",
    prompt: "A planner must search a b = 10 tree to depth 12, and the machine holds only thousands of states. Why does IDS run where BFS cannot?",
    options: [
      { text: "IDS generates exponentially fewer nodes", correct: false, feedback: "It generates ~11% MORE at b = 10 (123,456 vs 111,111 at d = 5, per a-04's arithmetic) — the win is memory, not node count." },
      { text: "IDS holds one path plus unexplored siblings — O(b·d), about 120 states — while BFS's frontier at depth 11 alone holds 10^11", correct: true, feedback: "Correct — the capped depth-first pass keeps the working set linear in d; that is the entire reason the iteration trick exists." },
      { text: "IDS prunes inadmissible branches first", correct: false, feedback: "No heuristic, no pruning — the capped DFS pass is completely uninformed." },
      { text: "IDS stores visited states on disk", correct: false, feedback: "Nothing is stored anywhere beyond the path and siblings — that is the point." },
    ],
    explanation: "The memory wall (a-12's decision question) is why iterative deepening exists: BFS's frontier grows as b^d while IDS's working set grows as b·d.",
  },
  {
    id: "a-as-9",
    prompt: "True remaining cost h*: h*(A) = 5, h*(B) = 3, h*(C) = 0. Candidates: h1 = (4, 3, 0), h2 = (6, 2, 0), h3 = (5, 4, 0). Which are admissible?",
    options: [
      { text: "Only h1", correct: true, feedback: "Correct — 4 ≤ 5, 3 ≤ 3, 0 ≤ 0: never overestimates. h2's 6 > 5 and h3's 4 > 3 each overestimate somewhere." },
      { text: "h1 and h2", correct: false, feedback: "h2 overestimates at A (6 > 5) — one overestimate anywhere breaks admissibility." },
      { text: "h1 and h3", correct: false, feedback: "h3 overestimates at B (4 > 3); being exact at A does not repair it." },
      { text: "All three, since each stays close to h*", correct: false, feedback: "Admissibility is pointwise, not approximate: 'close' is not a lower bound." },
    ],
    explanation: "The check is mechanical — compare h to h* state by state — and passing it is the license for A*'s tree-search guarantee (a-08's derivation).",
  },
  {
    id: "a-as-10",
    prompt: "Graph-search A* with a closed list and no reopening just returned a suboptimal path. What failed, and what are the two standard repairs?",
    options: [
      { text: "Consistency failed — h(n) > c(n,n') + h(n') on some edge; repair by requiring a consistent h, or reopen closed nodes when a better g arrives", correct: true, feedback: "Correct — this is a-08's counterexample exactly: the stale-g pop. Consistency makes f non-decreasing along paths so closed g values are final; reopening trades the guarantee question for bookkeeping." },
      { text: "Admissibility failed; repair with a better heuristic or weighted A*", correct: false, feedback: "Admissibility failure loses tree-search optimality too — but the closed-list suboptimality is specifically the consistency/reopening question." },
      { text: "The frontier used FIFO ordering; repair with a priority queue", correct: false, feedback: "It is A* — the frontier was priority-ordered; the failure was in what the closed list assumed about g values." },
      { text: "The goal test fired at generation; move it to the pop", correct: false, feedback: "Generation-time goal tests do lose optimality — but this search already tests at the pop." },
    ],
    explanation: "Two properties, two guarantees: admissibility buys tree-search optimality; consistency additionally buys permanent closed lists.",
  },
  {
    id: "a-as-11",
    prompt: "Local beam search with k = 4 keeps the best four states among ALL successors each round. Why can it outperform four independent hill climbs?",
    options: [
      { text: "Because four processors run the walks in parallel", correct: false, feedback: "Parallelism runs the same walks faster; it changes no trajectory." },
      { text: "Because the successor pool is shared: a promising state discovered by one lane is adopted by the whole beam, so lanes inherit each other's luck", correct: true, feedback: "Correct — information sharing is the entire difference; this is a-11's point that beam search is NOT k independent runs." },
      { text: "Because the beam width prunes inadmissible successors", correct: false, feedback: "Local search has no admissibility notion — selection is by objective value, not legality." },
      { text: "Because k = 4 reduces each state's branching factor to b/4", correct: false, feedback: "Every state still generates its full neighborhood; selection happens after generation, not during." },
    ],
    explanation: "Diversity plus selection: the beam is a population, and populations reroute around local optima that trap single walks.",
  },
  {
    id: "a-as-12",
    prompt: "Route planning for a delivery fleet: the path matters, a good admissible heuristic exists (straight-line road distance), and memory is plentiful. Which family, per a-12's decision framework?",
    options: [
      { text: "A* — path matters and a heuristic is available; optimality with the frontier as the only real cost", correct: true, feedback: "Correct — the framework's first two tests route here: path-critical plus informed → A*; memory is not yet the wall." },
      { text: "Simulated annealing — it escapes local optima reliably", correct: false, feedback: "Local search optimizes a final state, not a path; the fleet needs the route itself." },
      { text: "IDS — linear memory makes it the safe default", correct: false, feedback: "IDS when memory is the wall; here the heuristic is available and memory plentiful — ignoring it reverts to blind search." },
      { text: "Greedy best-first — the heuristic alone is faster", correct: false, feedback: "Fast but not optimal — the fleet's costs are real, and g-blindness is exactly what a-06 traced losing 450 to 418." },
    ],
    explanation: "The decision tree's spine, in order: does the path matter → is a heuristic available → is memory the wall.",
  },
];
