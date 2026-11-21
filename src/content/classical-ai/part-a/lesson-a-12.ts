/**
 * PART A · MODULE 3 · "Comparing Search Families" — lesson a-12,
 * "Choosing a Search Algorithm" (the part's capstone review).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_12: ClassicalLesson = {
  slug: "a-12",
  title: "Choosing a Search Algorithm",
  minutes: 30,
  summary:
    "A decision framework over all nine algorithms: uninformed, informed and local — with the honest costs of each.",
  kind: "concept",
  objectives: [
    "Place all nine algorithms of the subject on one table: completeness, optimality, time, space",
    "Walk the decision framework from problem properties to a defensible algorithm choice",
    "Explain why real systems abandon optimal search — and what they trade away",
  ],
  why: "Knowing nine algorithms is trivia; choosing among them is engineering. Every choice in this subject has been quietly making one trade: guaranteed optimality for reachability under constraints — memory, time, or knowledge. This closing lesson makes the ledger explicit, then turns it into a decision procedure you can defend to a colleague, a reviewer, or an interviewer. The framework also maps the rest of the school: when an opponent appears you extend to minimax (Part B), when constraints appear you switch formalism entirely (Part C), and when actions have preconditions and effects you graduate to planning (Part E).",
  blocks: [
    {
      kind: "text",
      text: "Nine algorithms, one ledger. Three honest columns of cost, and two columns of promise — because a guarantee you cannot afford is not a guarantee you have. The `b` is the branching factor, `d` the shallowest solution depth, `m` the maximum path length, and ε the least step cost.",
    },
    {
      kind: "complexity",
      title: "Search algorithms, complete and honest",
      reading:
        "Read the table as a menu of trades: optimality buys exhaustive frontiers (BFS, UCS, A*); memory buys optimality back (IDS); knowledge buys node count (A*, greedy); abandoning the path buys constant memory (local search).",
      rows: [
        { algorithm: "Breadth-first", best: "O(1)", average: "O(b^d)", worst: "O(b^d)", space: "O(b^d)", note: "optimal only at equal step costs" },
        { algorithm: "Uniform-cost", best: "O(b^d)", average: "O(b^(1+⌊C*/ε⌋))", worst: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))", note: "optimal at any positive costs" },
        { algorithm: "Depth-first", best: "O(bm)", average: "O(b^m)", worst: "∞ (infinite paths)", space: "O(bm)", note: "not optimal; can loop forever" },
        { algorithm: "Iterative deepening", best: "O(b^d)", average: "O(b^d)", worst: "O(b^d)", space: "O(bd)", note: "optimal at equal costs; the depth-first memory trick" },
        { algorithm: "Greedy best-first", best: "O(d)", average: "O(b^m)", worst: "O(b^m)", space: "O(b^m)", note: "fast, not optimal, not complete on graphs" },
        { algorithm: "A* (admissible h)", best: "O(d)", average: "≤ UCS", worst: "O(b^(1+⌊C*/ε⌋))", space: "O(b^(1+⌊C*/ε⌋))", note: "optimal; heuristic shrinks the effective b", highlight: true },
        { algorithm: "Hill climbing", best: "O(d)", average: "—", worst: "O(∞ restarts)", space: "O(1)", note: "not complete; 86%-ish stuck rates on 8-queens" },
        { algorithm: "Simulated annealing", best: "O(d)", average: "—", worst: "—", space: "O(1)", note: "complete in the limit (log cooling); no optimality" },
        { algorithm: "Local beam (k)", best: "—", average: "—", worst: "—", space: "O(kb)", note: "k parallel states; diversity is the failure mode" },
      ],
    },
    { kind: "heading", text: "The decision framework" },
    {
      kind: "text",
      text: "The table answers 'what does each cost?' — the framework answers 'which do you owe?'. Walk it top to bottom; every question is a property of the *problem*, not of the algorithms:",
    },
    {
      kind: "decisionTree",
      title: "From problem properties to algorithm family",
      trace:
        "A delivery router (path matters, heuristic exists, small map) lands at A*; an 8-queens satisfier (path irrelevant) lands at local search; a puzzle with no distance measure lands at IDS.",
      root: {
        test: "Does the path matter, or only the final state?",
        children: [
          {
            label: "only the state",
            child: {
              test: "Is a landscape/objective defined over whole states?",
              children: [
                { label: "yes", child: { class: "Local search", note: "hill climbing → annealing → beam" } },
                { label: "no — it is an assignment problem", child: { class: "CSP search (Part C)", note: "backtracking + propagation" } },
              ],
            },
          },
          {
            label: "the path is the answer",
            child: {
              test: "Is an admissible heuristic available?",
              children: [
                {
                  label: "yes",
                  child: {
                    test: "Does the frontier fit in memory?",
                    children: [
                      { label: "yes", child: { class: "A*", note: "optimal, informed" } },
                      { label: "no", child: { class: "IDA* / bounded search", note: "optimal, memory-lean" } },
                    ],
                  },
                },
                {
                  label: "no",
                  child: {
                    test: "Are step costs equal?",
                    children: [
                      { label: "yes, and b^d fits memory", child: { class: "BFS / IDS", note: "IDS when memory is tight" } },
                      { label: "no (weighted edges)", child: { class: "Uniform-cost search", note: "or Dijkstra — the same idea" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      caption:
        "Every leaf is a promise you can defend; every internal test is a fact about the problem you can check before writing code. Note where the school continues: opponents replace the goal test (Part B), and operator preconditions replace plain successors (Part E).",
    },
    { kind: "heading", text: "Why real systems cheat" },
    {
      kind: "text",
      text: "The honest secret of deployed systems is that almost none of them run an optimal algorithm on the hard instances. Route planners run A* on road graphs because b is tiny and the map fits in a datacenter — the exception, not the rule. Game programs abandoned full minimax for alpha-beta and evaluation cutoffs the moment trees outgrew hardware (Part B). Factory schedulers satisfice with constraint propagation (Part C) rather than prove optimality. And when Deep Blue beat Kasparov in 1997, it did so with search, evaluated by the ton — extensions, pruning and evaluation everywhere, optimality nowhere in sight.",
    },
    {
      kind: "callout",
      tone: "analogy",
      title: "The map is not the guarantee",
      text: "Think of the decision framework as a contract negotiation. Completeness and optimality are clauses you buy with memory and time. The engineer's question is never 'which algorithm is best?' but 'which guarantees can this problem afford — and which am I fooling myself about?' An A* with a bogus heuristic and a beam search sold as exhaustive are the same sin: a promise the implementation cannot keep.",
    },
    { kind: "heading", text: "Three choices, defended" },
    {
      kind: "example",
      title: "Choosing for three real tasks",
      problem:
        "Apply the framework to: (1) a courier routing 40 stops in a city, (2) laying out 500 circuit components with no path semantics, (3) the eight-puzzle for a tutor app.",
      steps: [
        {
          text: "Courier routing: path matters, distances known ⇒ A*.",
          detail:
            "Road segments give exact costs; straight-line distance is a textbook admissible heuristic; the city graph is small. If the stop ORDER is also free, the problem becomes the traveling salesperson — a different beast, and the moment to notice the framework only covers the sub-problem.",
        },
        {
          text: "Circuit layout: only the final state matters ⇒ local search.",
          detail:
            "No path to speak of, a clear objective (wirelength), huge state space. Simulated annealing's willingness to take bad moves is the classical answer to layout plateaus; beam variants run in industry EDA tools.",
        },
        {
          text: "Eight-puzzle tutor: path matters, heuristics exist, space is bounded ⇒ A* — or IDS if memory-bound.",
          detail:
            "Manhattan distance is the canonical h. On 181,440 states the frontier fits anywhere; on the fifteen-puzzle (10^13 states) it does not, and IDA* takes over — the same trade at the next scale.",
        },
      ],
      result:
        "Three defensible choices, each traceable to problem properties through the framework — the exact reasoning the Part A project's written analysis asks you to perform.",
    },
    { kind: "heading", text: "The subject in one sentence each" },
    {
      kind: "table",
      title: "Part A, compressed",
      headers: ["Idea", "The one sentence"],
      rows: [
        ["Formulation", "States, operators, goal test, cost — get the five-tuple right and the rest is bookkeeping."],
        ["Uninformed search", "BFS/UCS buy optimality with an exponential frontier; DFS/IDS buy memory with repetition."],
        ["Heuristics", "h is knowledge; admissibility is its license; relaxation is its factory."],
        ["A*", "Order by g + h and the first goal popped is optimal — the best-informed optimal search there is."],
        ["Local search", "Drop the path, keep the state: O(1) memory and the honesty to say 'good, not best'."],
      ],
      caption: "Everything downstream in School J assumes one of these five sentences.",
    },
    { kind: "heading", text: "Before the checkpoint" },
    {
      kind: "exercise",
      id: "a-12-e1",
      exerciseKind: "concept-check",
      prompt:
        "A startup must schedule 200 jobs on 20 machines. Jobs have durations and precedence; machines are interchangeable. Solutions just need to be feasible and good by Monday — optimality is explicitly 'nice to have'. The team proposes A*. Your review says:",
      options: [
        { text: "Good choice — A* is always the best search algorithm", correct: false, feedback: "There is no such thing, and this is the exact hubris the lesson warns about. What is the heuristic? Where is the guarantee worth its memory?" },
        { text: "Wrong formalism: this is a constraint problem — model it as a CSP (Part C) and let propagation do the work; A* over job orderings is fighting the structure", correct: true, feedback: "Correct. The state space of orderings is factorial; constraints are exactly the structure CSP reasoning exploits. The decision tree's 'only the state matters' branch was pointing here from the start." },
        { text: "Fine, provided they use Manhattan distance", correct: false, feedback: "Manhattan distance is the eight-puzzle's relaxation — importing a heuristic from an unrelated problem is how admissibility dies." },
        { text: "Use DFS — it is memory-cheap", correct: false, feedback: "Memory was never the binding constraint here; structure was. DFS over orderings is still factorial." },
      ],
      solution: "Match the formalism to the problem's structure: constraints and assignments → CSP; paths and costs → search; whole-state quality → local search.",
      explanation: "The deepest lesson of the framework: before choosing an algorithm, check whether the problem is even a path problem. Scheduling is not — and Part C exists precisely for that case.",
      concepts: ["algorithm selection", "constraint satisfaction"],
    },
    {
      kind: "exercise",
      id: "a-12-e2",
      exerciseKind: "trace",
      prompt:
        "Walk the decision tree for THE problem you will solve in the Part A project: the eight-puzzle benchmarked under three search regimes. State each internal test's answer and the leaf you land on for each of the three engines (uniform-cost, misplaced-tiles A*, Manhattan A*).",
      solution:
        "Path matters (solutions are move sequences) ⇒ right branch. Heuristic available? For UCS: treat h ≡ 0 ⇒ no ⇒ costs equal (all moves cost 1) and the space fits memory ⇒ BFS/UCS leaf. For the two A* engines: yes, relaxations (teleport ⇒ misplaced tiles; slide-through ⇒ Manhattan) ⇒ frontier fits (181,440 states) ⇒ A* leaf. Three engines, one tree, three defensible leaves.",
      explanation: "The project asks you to explain the measured efficiency gap with effective branching factor — which is exactly quantifying how far each heuristic moved the search down the informedness scale.",
      concepts: ["algorithm selection", "eight-puzzle", "effective branching factor"],
    },
    {
      kind: "exercise",
      id: "a-12-e3",
      exerciseKind: "concept-check",
      prompt:
        "Which pair of table rows differs ONLY in the space column, at equal optimality (for unit costs)?",
      options: [
        { text: "BFS and IDS", correct: true, feedback: "Correct — both complete and optimal for unit costs, both O(b^d) time in the worst case, but BFS holds O(b^d) nodes while IDS holds O(bd). The entire difference is the repetition IDS pays for memory." },
        { text: "DFS and IDS", correct: false, feedback: "DFS is neither complete (infinite paths) nor optimal — two columns differ, not one." },
        { text: "Greedy and A*", correct: false, feedback: "They differ in optimality, completeness and typical node counts — nearly everything but the algorithm shape." },
        { text: "UCS and A*", correct: false, feedback: "Same optimality and same worst-case space, but A* differs precisely in node count — time, not space, is where h pays." },
      ],
      solution: "BFS and IDS: the iterative-deepening trick buys the exponential frontier down to a linear one at a bounded time premium.",
      explanation: "Isolated single-column trades are the cleanest way to remember the table: BFS↔IDS is the space trade; UCS↔A* is the time trade; hill↔annealing is the completeness trade.",
      concepts: ["iterative deepening", "space-time tradeoff"],
    },
  ],
  terms: [
    {
      term: "completeness",
      definition: "The guarantee that the algorithm finds a solution whenever one exists — the first question the framework asks, and the one DFS fails on infinite paths.",
    },
    {
      term: "satisficing",
      definition: "Accepting a good-enough solution without proof of optimality — the explicit design stance of local search and of most deployed systems.",
    },
    {
      term: "problem structure",
      definition: "The shape of the state space and its constraints: paths versus assignments versus whole-state quality. Structure, not size, decides the formalism.",
    },
  ],
  mistakes: [
    {
      mistake: "Choosing an algorithm before formulating the problem.",
      why: "The framework's first fork — path versus state — is a formulation fact; skipping it lands greedy optimists on factorial search spaces.",
      fix: "Walk the decision tree top-down, answering questions about the PROBLEM. The leaf names the family; only then compare within the family.",
    },
    {
      mistake: "Treating optimality as non-negotiable by default.",
      why: "Optimality is purchased with an exponential frontier; on most real instances the budget runs out before the proof does.",
      fix: "Decide explicitly which guarantees the deployment can afford, and document the trade. A satisficing search labeled as such beats an optimal search that never returns.",
    },
  ],
  takeaways: [
    "Nine algorithms, one menu of trades: optimality buys frontiers, memory buys repetition, knowledge buys node counts, and dropping the path buys O(1) space.",
    "The decision framework runs on problem properties: path or state, heuristic or none, memory or not — each answer is checkable before code is written.",
    "Real systems satisfice: alpha-beta, constraint propagation and EDA annealers all abandoned optimality for reachability, and said so.",
    "Structure decides the formalism: path problems search, constraint problems propagate (Part C), adversarial problems game (Part B), action problems plan (Part E).",
    "The Part A project's benchmark is this lesson in code: three engines, one space, and effective branching factor as the measure of what knowledge bought.",
  ],
  quiz: [
    {
      id: "a-12-q1",
      prompt: "Which problem lands on the 'only the final state matters' branch of the decision tree?",
      options: [
        { text: "Finding the cheapest flight itinerary", correct: false, feedback: "The sequence of flights IS the answer — the path branch." },
        { text: "Scheduling exams with no student clashes", correct: true, feedback: "Correct — any complete consistent assignment is a solution; nobody cares in what order you found it. That branch leads to Part C." },
        { text: "Planning robot moves to rearrange blocks", correct: false, feedback: "The move sequence is the deliverable — and Part E's operators make it explicit." },
        { text: "Choosing the next chess move", correct: false, feedback: "Adversarial, but the move (and its backing path of analysis) is the answer — Part B extends the path branch." },
      ],
      explanation: "The state-branch's signature: solutions are complete configurations, not routes. Scheduling, coloring, layout — all Part C territory.",
    },
    {
      id: "a-12-q2",
      prompt: "A colleague ships a beam search with k = 5 for a problem demanding the provably best solution. The review meeting's correct framing:",
      options: [
        { text: "Beam search is fine if the heuristic is admissible", correct: false, feedback: "Beam search discards live branches regardless of h's honesty — admissibility cannot cross a hard cull." },
        { text: "The system is satisficing while the spec demands optimality — either relax the spec in writing or change the algorithm", correct: true, feedback: "Exactly the lesson's contract language: the gap is not technical but promissory, and it must be resolved on purpose, not by accident of implementation." },
        { text: "Raise k until it is optimal", correct: false, feedback: "k = ∞ recovers breadth-first at exponential memory — technically 'fixed', practically a different algorithm, and the wrong way to discover BFS." },
        { text: "Beam search is optimal for k ≥ 2", correct: false, feedback: "No k short of the full frontier restores the guarantee." },
      ],
      explanation: "Guarantees are chosen, not defaulted. Naming the trade — satisficing versus optimal — is what separates engineering from hope.",
    },
  ],
};
