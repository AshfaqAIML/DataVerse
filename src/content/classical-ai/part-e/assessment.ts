/**
 * PART_E_ASSESSMENT — exam-register quiz for Part E "Classical Planning"
 * (J5), both modules: language and search (e-01..e-04) plus graphs,
 * hierarchies and deployment (e-05..e-08).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_E_ASSESSMENT: QuizQuestion[] = [
  {
    id: "e-as-1",
    prompt: "STRIPS preconditions are:",
    options: [
      { text: "A disjunction: at least one must hold", correct: false, feedback: "Conjunctive — all must hold. Disjunctive preconditions are a later extension (ADL) with a nastier search space." },
      { text: "A conjunction: pre(a) ⊆ s, every fact required", correct: true, feedback: "Correct — the subset test is the whole applicability question, and what makes Next(s,a) easy to compute." },
      { text: "Probabilistic: each holds with some probability", correct: false, feedback: "That is probabilistic planning's world — an assumption-dropping era away." },
      { text: "Optional documentation", correct: false, feedback: "They are the license; without them actions fire whenever and the formalism means nothing." },
    ],
    explanation: "Conjunctive preconditions keep states and successors simple — the entire classical edifice leans on that subset test.",
  },
  {
    id: "e-as-2",
    prompt: "The Sussman anomaly's three-step solution begins by moving C to the table. The alternative first move — C onto B — is worse because:",
    options: [
      { text: "It is not licensed", correct: false, feedback: "It IS licensed: C is clear, B is clear. Licensing is not the issue — consequences are." },
      { text: "It achieves nothing toward the goals", correct: false, feedback: "It clears A, which A-on-B eventually needs — not nothing. But it BLOCKS B: B must sit on C, so C-on-B must be undone later — the undo loop again." },
      { text: "C on B blocks B's required move onto C — every plan through C-on-B must tear it down, adding steps the table-first route avoids", correct: true, feedback: "Correct — the anomaly's cruelty in one sentence: an intuitive first move that must be undone. The planner's value is seeing the undo before making it." },
      { text: "The table is always the correct destination", correct: false, feedback: "Table-first happens to win here; it is no general rule." },
    ],
    explanation: "Subgoal interactions again: the choice's cost appears only two moves later, which is exactly the horizon greedy reasoning lacks.",
  },
  {
    id: "e-as-3",
    prompt: "The planning graph levels off when:",
    options: [
      { text: "The goals are reached", correct: false, feedback: "Reaching goals ENDS a successful extraction, not the graph's growth — and unmet goals keep the graph building." },
      { text: "Two consecutive levels have identical propositions and identical mutexes", correct: true, feedback: "Correct — both monotone quantities have hit their fixpoint: nothing new is reachable and no constraint will loosen. Further levels are copies." },
      { text: "The action set is exhausted", correct: false, feedback: "Actions are re-instantiable every level (with new preconditions met); exhaustion is not the mechanism." },
      { text: "The extraction pass succeeds", correct: false, feedback: "Extraction runs on the already-built graph; level-off is about GROWTH stopping." },
    ],
    explanation: "Level-off is a two-part fixpoint — facts and mutexes — and its test doubles as the unsolvability certificate.",
  },
  {
    id: "e-as-4",
    prompt: "h+ (the delete-relaxation heuristic) is admissible because:",
    options: [
      { text: "Relaxed plans are never longer than real ones: every real plan survives the relaxation step-for-step, so the relaxed optimum is a lower bound, h+ ≤ h*", correct: true, feedback: "Correct — one inclusion carries the whole argument: deletes are REMOVED constraints, so nothing that worked stops working, and the minimum can only shrink." },
      { text: "Delete lists are always empty in practice", correct: false, feedback: "They are empty in the RELAXATION, by construction — that is the model, not a fact about the world." },
      { text: "It is computed on the planning graph", correct: false, feedback: "Graph-relaxations (h-max, h-add) are graph-based approximations of h+; the admissibility argument is the monotonicity one, not the representation." },
      { text: "A* requires it to be", correct: false, feedback: "A* requires admissibility OF whatever h it uses; it cannot confer the property." },
    ],
    explanation: "Admissibility is one inclusion: every real plan survives the relaxation, so the relaxed minimum is a lower bound.",
  },
  {
    id: "e-as-5",
    prompt: "Graphplan's extraction searches:",
    options: [
      { text: "Forward from S0, greedily choosing cheapest actions", correct: false, feedback: "Backward from the goals — extraction works from what must hold, asking which actions produce it." },
      { text: "Backward from the goal level, choosing non-mutex action sets whose preconditions are non-mutex a level below", correct: true, feedback: "Correct — and the mutex marks are what keep that backward walk from drowning in consistent-but-conflicting choices." },
      { text: "Over partial plans, resolving threats like Tweak", correct: false, feedback: "That is partial-order planning — a different, elegant school; Graphplan is level-structured." },
      { text: "By integer programming over action variables", correct: false, feedback: "A real encoding (used in some modern optimal planners!), but not Graphplan's mechanism." },
    ],
    explanation: "Backward extraction through the mutex-annotated graph: the graph pruned the exponential world so extraction's search fits inside it.",
  },
  {
    id: "e-as-6",
    prompt: "Classical planning drops which assumption FIRST in most real deployments?",
    options: [
      { text: "Determinism — factories are noisy", correct: false, feedback: "A strong candidate in robotics, but industry's first relaxation was usually TIME." },
      { text: "Instantaneous actions — durations and resources enter as temporal planning, the extension with the deepest industrial uptake (schedulers)", correct: true, feedback: "Correct — factory scheduling is classical planning plus time and resources, and it is the deployed tip of the field." },
      { text: "Single agency", correct: false, feedback: "Multiagent planning remains mostly research-flavored." },
      { text: "Finite propositions", correct: false, feedback: "Finiteness survives surprisingly well — numbers are the harder fight (and later work addressed it)." },
    ],
    explanation: "The assumption eras, in deployment order: duration first, then uncertainty, then agency — the lesson's map of the field's growth.",
  },
  {
    id: "e-as-7",
    prompt: "Your logistics domain — the three load/unload/drive templates — now runs a new problem with five packages, two trucks, four locations. Between the two runs, what changed?",
    options: [
      { text: "The problem only: new object constants, initial state and goal — the operator library is untouched, because ground operators are instantiated from templates over whatever objects the problem supplies", correct: true, feedback: "Correct — the domain/problem layering is the portability contract: e-02's grounder would emit 5×2×4-scaled instances of the same three templates, and the engine never knows." },
      { text: "The domain must be extended with new operators per package", correct: false, feedback: "Nothing about load/unload/drive mentions WHICH package — the variables do that work at grounding time." },
      { text: "The engine must be rewritten per problem", correct: false, feedback: "The opposite is the point: engines are problem-agnostic; that is why planners swap domains without rewrites." },
      { text: "Nothing can change — a planner is hard-wired to one problem", correct: false, feedback: "That describes a script, not a planner; the layering exists precisely to prevent this." },
    ],
    explanation: "Domain = the reusable library; problem = the instance pointing it at a world. The separation is what made PDDL-era benchmark sharing possible at all.",
  },
  {
    id: "e-as-8",
    prompt: "Regression tends to beat progression when:",
    options: [
      { text: "The goal is small and the reachable state space is vast — the pre-image chain stays narrow while forward search drowns (delivery at city scale)", correct: true, feedback: "Correct — and the honesty cuts both ways: on the three-block anomaly regression expanded 240 subgoal-sets against progression's 13 states, because relevance barely filtered anything there." },
      { text: "The goal is large and heavily conjunctive", correct: false, feedback: "Conjunctive goals make regression's subgoal sets BIGGER — each pre-image drags in every precondition of every achieving action." },
      { text: "Always — backward search is strictly cheaper", correct: false, feedback: "Measured folklore, not fact: direction is a bet about where the space is thin, and the anomaly's measurement says the bet can invert." },
      { text: "Operators have no delete lists", correct: false, feedback: "Delete-free problems are the relaxed ones (e-04) — monotone, where forward greedy search already thrives." },
    ],
    explanation: "Small goal, vast space: regression's promise. Tiny world, goal-adjacent operators everywhere: regression's invoice. Measure, then choose.",
  },
  {
    id: "e-as-9",
    prompt: "Which of the pair (h-max, h-add) is admissible?",
    options: [
      { text: "h-max only: a max cannot exceed the true cost of achieving the hardest goal fact, but h-add's sums can overestimate — its guarantee is informativeness, not admissibility", correct: true, feedback: "Correct — on the tower goal (lesson battery e-i2): h-max 2, h-add 3, true cost 3 — h-add happened to be exact there, but on other instances the sum overshoots and A* with an inadmissible h can return suboptimal plans." },
      { text: "Both — they are both relaxations of h+", correct: false, feedback: "Both APPROXIMATE h+, but only from opposite sides: h-max stays under (sometimes far under), h-add can go over. Approximating a lower bound does not inherit the bound." },
      { text: "h-add only — it is more accurate", correct: false, feedback: "Accuracy and admissibility are different claims; h-add is the more INFORMATIVE one, and precisely the one without the guarantee." },
      { text: "Neither — only h+ itself is admissible", correct: false, feedback: "h+ is admissible, and so is h-max: max(pre-costs) + 1 never exceeds the true cost of the hardest fact it summarizes." },
    ],
    explanation: "The chain runs h-max ≤ h+ ≤ h* with h-add floating free above: two approximations of the same ideal, one safe, one sharp.",
  },
  {
    id: "e-as-10",
    prompt: "Deployed planners (O-Plan, SHOP2, factory schedulers) favor HTNs chiefly because:",
    options: [
      { text: "Methods let domain authors encode procedural expertise directly — the bakery writes its own recipes as decompositions, knowledge a state-based goal cannot express", correct: true, feedback: "Correct — that is the engineering argument: HTNs say HOW, not just WHAT, and the how is where industrial expertise lives. (The price: strictly more expressive, with undecidability edging closer.)" },
      { text: "HTN search is always faster than state-space search", correct: false, feedback: "No always: the methods steer, but a poorly authored method set can force more search than a good heuristic would." },
      { text: "HTNs drop the determinism assumption, handling noisy factories", correct: false, feedback: "HTNs inherit classical planning's assumptions; noise is the MDP era's problem, not the hierarchy's." },
      { text: "STRIPS operators cannot represent blocks worlds", correct: false, feedback: "Backwards — blocks worlds are STRIPS' birthplace; the argument for HTNs is expressiveness about PROCEDURES, not raw representability." },
    ],
    explanation: "Encode the recipe, not just the goal: procedural knowledge as first-class data — the reason the deployed world runs hierarchies.",
  },
];
