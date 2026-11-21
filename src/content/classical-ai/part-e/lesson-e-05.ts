/**
 * Lesson e-05 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_05: ClassicalLesson = {

  slug: "e-05",
  title: "Graphplan's Planning Graph",
  minutes: 35,
  summary:
    "Alternate proposition and action levels, growing the graph until it levels off — reachability made explicit.",
  kind: "concept",
  objectives: [
    "Build a planning graph level by level from a STRIPS description",
    "State the two monotonicity lemmas and why they license the level-off test",
    "Read mutex propositions and justify them by rule",
    "Say what the graph polynomially decides, and what it leaves to extraction",
  ],
  why: "Progression search treats the future one state at a time; the planning graph thinks about ALL reachable futures simultaneously. Graphplan's insight — alternate layers of propositions and actions, growing monotonically until the structure repeats — turns 'what is achievable, and how soon' into a polynomial-size object you can read like a map. The graph does not contain the plan; it contains the plan's reachability skeleton plus mutex marks that say which things cannot coexist. Extraction walks backward through that skeleton — and the level-off condition gives the whole procedure a stopping rule that doubles as an unsolvability certificate. It is the most elegant data structure in classical AI.",
  blocks: [
    {
      kind: "text",
      text: "A planning graph starts at level S0 — the initial state's propositions — and grows in alternating layers: an **action level** A0 containing every operator applicable in S0 (plus a persistence no-op for every fact), then a **proposition level** S1 containing everything in S0 plus everything A0 adds. Then A1, S2, and so on. Two lemmas make this growth meaningful rather than sprawling:",
    },
    {
      kind: "math",
      title: "The two monotonicity lemmas",
      displays: [
        { expr: "S_i \\subseteq S_{i+1}", label: "propositions never disappear" },
        { expr: "\\text{mutex}(S_i) \\supseteq \\text{mutex}(S_{i+1})", label: "mutexes never appear" },
      ],
      caption:
        "Persistence no-ops make the first lemma true by construction; deletes are invisible to the GRAPH (they re-enter via mutexes). The second lemma is deeper: constraints only loosen as levels grow. Together they mean consecutive levels eventually agree — the level-off.",
    },
    {
      kind: "planningGraph",
      title: "The Sussman anomaly's planning graph, built three proposition levels deep",
      levels: [
        {
          propositions: ["on(C,A)", "on(A,Table)", "on(B,Table)", "clear(C)", "clear(B)", "clear(Table)"],
          actions: [
            { name: "move(C,A,Table)", pre: ["on(C,A)", "clear(C)", "clear(Table)"], add: ["on(C,Table)", "clear(A)"], mutexWith: ["move(C,A,B)", "move(B,Table,C)"] },
            { name: "move(C,A,B)", pre: ["on(C,A)", "clear(C)", "clear(B)"], add: ["on(C,B)", "clear(A)"], mutexWith: ["move(C,A,Table)", "move(B,Table,C)"] },
            { name: "move(B,Table,C)", pre: ["on(B,Table)", "clear(B)", "clear(C)"], add: ["on(B,C)"], mutexWith: ["move(C,A,Table)", "move(C,A,B)"] },
          ],
        },
        {
          propositions: ["on(C,A)", "on(A,Table)", "on(B,Table)", "clear(C)", "clear(B)", "clear(Table)", "on(C,Table)", "clear(A)", "on(C,B)", "on(B,C)"],
          actions: [
            { name: "move(B,Table,A)", pre: ["on(B,Table)", "clear(B)", "clear(A)"], add: ["on(B,A)"] },
            { name: "move(A,Table,B)", pre: ["on(A,Table)", "clear(A)", "clear(B)"], add: ["on(A,B)"] },
            { name: "move(A,Table,C)", pre: ["on(A,Table)", "clear(A)", "clear(C)"], add: ["on(A,C)"] },
            { name: "move(C,Table,A)", pre: ["on(C,Table)", "clear(C)", "clear(A)"], add: ["on(C,A)"] },
            { name: "move(C,Table,B)", pre: ["on(C,Table)", "clear(C)", "clear(B)"], add: ["on(C,B)"] },
            { name: "move(C,B,Table)", pre: ["on(C,B)", "clear(C)", "clear(B)"], add: ["on(C,Table)", "clear(B)"] },
            { name: "move(C,B,A)", pre: ["on(C,B)", "clear(C)", "clear(A)"], add: ["on(C,A)", "clear(B)"] },
            { name: "move(B,C,Table)", pre: ["on(B,C)", "clear(B)", "clear(Table)"], add: ["on(B,Table)", "clear(C)"] },
            { name: "move(B,C,A)", pre: ["on(B,C)", "clear(B)", "clear(A)"], add: ["on(B,A)", "clear(C)"] },
          ],
        },
        {
          propositions: ["on(C,A)", "on(A,Table)", "on(B,Table)", "clear(C)", "clear(B)", "clear(Table)", "on(C,Table)", "clear(A)", "on(C,B)", "on(B,C)", "on(B,A)", "on(A,B)", "on(A,C)"],
          actions: [],
        },
      ],
      mutexProps: [
        { level: 1, a: "on(C,A)", b: "on(C,Table)", reason: "inconsistent support: move(C,A,Table), the only producer of on(C,Table), deletes on(C,A)" },
        { level: 1, a: "on(C,A)", b: "on(C,B)", reason: "inconsistent support: move(C,A,B) deletes on(C,A)" },
        { level: 1, a: "on(C,A)", b: "clear(A)", reason: "inconsistent support: both producers of clear(A) delete on(C,A)" },
        { level: 1, a: "on(C,Table)", b: "on(C,B)", reason: "competing producers: their moves are mutex — each deletes the on(C,A) the other needs" },
        { level: 1, a: "on(C,Table)", b: "on(B,C)", reason: "competing producers: move(B,Table,C) deletes clear(C), which move(C,A,Table) needs" },
        { level: 1, a: "on(C,B)", b: "on(B,C)", reason: "competing producers: move(C,A,B) and move(B,Table,C) are mutex — the latter deletes clear(C)" },
        { level: 1, a: "on(C,B)", b: "clear(B)", reason: "inconsistent support: move(C,A,B) deletes clear(B), the very fact its co-producer would keep" },
        { level: 1, a: "clear(A)", b: "on(B,C)", reason: "competing producers: every producer of clear(A) is mutex with the only producer of on(B,C)" },
        { level: 1, a: "on(B,C)", b: "on(B,Table)", reason: "inconsistent support: move(B,Table,C) deletes on(B,Table)" },
        { level: 1, a: "on(B,C)", b: "clear(C)", reason: "inconsistent support: move(B,Table,C) deletes clear(C) — B on C means C is no longer clear" },
      ],
      leveledOff: false,
      reading:
        "S0 is the anomaly's start (C on A, six facts). A0: exactly three moves are licensed — the three from Lesson e-01's count — and ALL THREE PAIRS are mutex, each by interference. S1: ten facts (four new: on(C,Table), clear(A), on(C,B), on(B,C)). A1: the three A0 moves remain licensed and nine restacking moves join as the new facts appear — the twelve real operators are listed, plus one persistence no-op per fact (omitted from the listing). S2: thirteen facts — on(B,A), on(A,B), on(A,C) join — which is this world's ENTIRE vocabulary: proposition growth ends here. (A2 would license six restacking moves for the new stacks — move(A,B,Table), move(A,B,C), move(A,C,Table), move(A,C,B), move(B,A,Table), move(B,A,C) — none adding a new fact; the listing stops.)",
      caption:
        "Ten proposition mutexes are marked at S1, each with its citation. Notice what the marks say about the anomaly: clear(A) and on(B,C) cannot coexist after one step — A's becoming free and B's landing on C fight over C's clearness. Extraction must therefore wait, and interleave — which is Lesson e-06's story.",
    },
    {
      kind: "math",
      title: "Why the graph stays polynomial",
      displays: [
        { expr: "\text{nodes} \le (n + a) \cdot L", label: "n facts + a actions, per level, L levels" },
        { expr: "L \le n + \frac{n(n-1)}{2} + 1", label: "levels before the fixpoint (loose)" },
        { expr: "\frac{n(n-1)}{2}", label: "proposition pairs to test per level" },
      ],
      caption:
        "Propositions only grow (at most n additions before they stop) and mutexes only shrink (at most n(n-1)/2 of them, each level removing at least one or declaring the fixpoint) — so the level count L is polynomially bounded and the whole structure is a polynomial object, against the search tree's exponential branch-out. Building it is bookkeeping; the exponential hides in extraction.",
    },
    { kind: "heading", text: "Reading the mutexes" },
    {
      kind: "definition",
      term: "Mutual exclusion (mutex), planning-graph flavor",
      informal:
        "Two actions are mutex at some level if they fight — one deletes what the other needs or produces — or if their preconditions are already mutex one level down. Two propositions are mutex if every way of producing one fights every way of producing the other.",
      formal:
        "\\text{mutex}(a, b) \\iff \\text{interference}(a, b) \\vee \\text{competing-needs}(a, b)",
      why: "Mutexes are the graph's only negative information — the delete lists, smuggled in as pairwise impossibilities — and they are what makes extraction a search with leverage.",
    },
    {
      kind: "example",
      title: "Justifying a mutex by rule",
      problem: "In the graph above, why is clear(A) mutex with on(B,C) at S1 — and why is that NOT true of on(C,A) with on(B,C)?",
      steps: [
        { text: "List the producers of each fact at A0.", detail: "clear(A) has two: move(C,A,Table) and move(C,A,B) (both move C off A). on(B,C) has one: move(B,Table,C) — plus no persistence no-op, since on(B,C) is not in S0." },
        { text: "Test every producer pair for mutex.", detail: "move(B,Table,C) deletes clear(C); both of clear(A)'s producers REQUIRE clear(C). Each of the two pairs is mutex by interference — so ALL producer pairs fight, and the propositions are mutex: A cannot become clear in the same step that B lands on C. Both events need C clear, and one of them consumes it." },
        { text: "Now the contrast: on(C,A) with on(B,C).", detail: "on(C,A)'s only producer at A0 is its persistence no-op — and move(B,Table,C) deletes neither on(C,A) nor anything the no-op needs. No interference, and no competing needs (S0 has no mutexes at all). The pair is free — correctly: the tower A–C–B (C on A, B on C) is a perfectly legal state." },
      ],
      result: "Mutex by all-pairs-producer fighting; freedom by one surviving non-mutex producer pair. Every proposition mutex in every planning graph is one of these two citations away — and the citations are checkable, which is what makes the graph a certificate rather than an opinion.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "What the graph decides, and what it leaves",
      text: "The planning graph is a REACHABILITY certificate: goal propositions appearing at level k means some state with those facts is reachable in k steps — polynomial to check. Mutex-at-all-levels means they never coexist — and if the graph levels off with the goals still mutex, the problem is UNSOLVABLE, certified without any search. What the graph does NOT give is the plan itself: extraction (Lesson e-06's second half) searches backward through the graph for a consistent action choice per level — guided, crucially, by the mutex marks.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-05-e1",
      exerciseKind: "concept-check",
      prompt:
        "Why must every level include persistence no-ops ('action' p with pre {p}, add {p})?",
      options: [
        { text: "Efficiency — they cache repeated facts", correct: false, feedback: "They are not a cache; they are the mechanism for a lemma the whole method depends on." },
        { text: "Without them propositions could DISAPPEAR at the next level — breaking S_i ⊆ S_{i+1}, the monotonicity the level-off test stands on", correct: true, feedback: "Correct: a fact nobody's action re-asserts would vanish from the graph even though it remains true in the world; persistence keeps the graph's growth honest." },
        { text: "The extraction pass needs something to select for unachieved goals", correct: false, feedback: "True in effect (selecting a no-op IS how extraction leaves a fact alone), but the load-bearing reason is the monotonicity lemma." },
        { text: "They represent waiting actions for temporal planning", correct: false, feedback: "Temporal semantics is a later era's extension; here they are pure bookkeeping." },
      ],
      solution: "Persistence preserves monotonicity; monotonicity licenses level-off; level-off licenses termination and the unsolvability certificate.",
      explanation: "One humble no-op row underwrites the graph's two structural theorems — the quiet load-bearer of the whole representation.",
      concepts: ["planning graph", "persistence", "monotonicity"],
    },
    {
      kind: "exercise",
      id: "e-05-e2",
      exerciseKind: "trace",
      prompt:
        "In the graph above, list the ten propositions of S1, then verify two of the marked mutexes against your own reasoning: on(C,B) with clear(B), and clear(A) with on(B,C). State the rule citation for each.",
      solution:
        "S1 = the six S0 facts plus four new ones — on(C,Table), clear(A), on(C,B), on(B,C) — ten propositions. Mutex 1 (on(C,B) vs clear(B)): on(C,B)'s only producer at A0 is move(C,A,B), whose DELETE list contains clear(B); clear(B)'s only producer is its persistence no-op, asserting the very fact that move deletes — interference between the producers, so no consistent one-step world has both: C sitting on B means B is not clear. Mutex 2 (clear(A) vs on(B,C)): clear(A)'s producers are move(C,A,Table) and move(C,A,B); on(B,C)'s only producer is move(B,Table,C) (no persistence — it is not in S0). move(B,Table,C) deletes clear(C), a precondition of BOTH of clear(A)'s producers: every producer pair is mutex, hence the propositions are mutex — A becoming free and B landing on C both need C clear, and B's landing consumes it.",
      explanation:
        "Mutex justification is rule citation, not intuition: name the deleted precondition, name the mutex preconditions. The exercise rehearses exactly the discipline the project's mutex marks require.",
      concepts: ["mutex", "inference rules", "planning graph"],
    },
    {
      kind: "exercise",
      id: "e-05-e3",
      exerciseKind: "predict-output",
      prompt:
        "The Sussman goal is {on(A,B), on(B,C)}. In the fully-built planning graph from the anomaly's start (C on A), at which level do both goal facts first appear TOGETHER and non-mutex? Type the level number (S-level index).",
      expectedOutput: "3",
      solution: "3",
      explanation:
        "Trace honestly. on(B,C) is early: move(B,Table,C) is licensed from the start (one of e-01's three licensed operators), so on(B,C) enters at S1. on(A,B) needs clear(A), which only the C-off-A moves create, so it first appears at S2 (move(A,Table,B) at A1). But PRESENT is not TOGETHER: at S2 the pair is still marked mutex — clear(A) is mutex with on(B,C) at S1 (every producer of clear(A) fights move(B,Table,C) over C's clearness), so move(A,Table,B) has competing needs with on(B,C)'s persistence, and with move(B,Table,C) itself by interference (it deletes the clear(B) the stacking needs). At S2 the clear(A)/on(B,C) mark finally loosens — persist(clear(A)) no longer fights move(B,Table,C) — so at A2 the two supporters can be chosen together, and both goals hold non-mutex at S3. e-01's program agrees: the shortest plan is three steps (length 3, 13 states expanded), and level 3 is exactly where it lands.",
      concepts: ["planning graph", "level index", "shortest plan"],
    },
  ],
  terms: [
    {
      term: "proposition level (S_k)",
      definition: "The k-th layer of facts in a planning graph: everything reachable in ≤ k steps, plus persistence — a growing superset of every k-step-reachable state's facts.",
    },
    {
      term: "persistence no-op",
      definition: "The pseudo-action 'keep fact p true' (pre {p}, add {p}) — the bookkeeping that makes proposition levels monotone.",
    },
    {
      term: "level-off",
      definition: "Two consecutive levels with identical propositions AND identical mutexes — the graph's fixpoint, and the unsolvability test: goals mutex at level-off ⇒ no plan exists.",
    },
    {
      term: "extraction",
      definition: "The backward search through a built graph: select non-mutex actions covering the goals, recurse on their preconditions — where the plan itself is finally found.",
    },
  ],
  mistakes: [
    {
      mistake: "Reading a planning graph as a plan.",
      why: "The graph says on(B,C) is reachable by level 2 — it does NOT say a state at level 2 contains all your goals simultaneously. Reachability is per-fact; plans are per-STATE.",
      fix: "Always ask the mutex question after the reachability question: facts present and pairwise non-mutex at level k ⇒ a state at depth k plausibly holds them all — then extraction confirms.",
    },
    {
      mistake: "Forgetting mutexes shrink across levels.",
      why: "Treating level-1 mutexes as permanent over-prunes extraction: what fights at A0 may coexist at A1 via interleaving.",
      fix: "Mutexes are LEVEL-INDEXED — recompute per level, and expect the set to monotonically shrink toward the fixpoint.",
    },
  ],
  takeaways: [
    "The planning graph alternates proposition and action levels, growing monotonically to a polynomial-size fixpoint — reachability made explicit.",
    "Two lemmas carry everything: propositions never disappear (persistence), mutexes never reappear — hence the level-off.",
    "Mutexes encode delete lists as pairwise impossibilities, justified by exactly two rules: interference and competing needs.",
    "The graph certifies reachability and unsolvability in polynomial time; the plan itself waits for backward extraction.",
    "Level-off with mutex goals is an unsolvability certificate — the planning sibling of AC-3's domain wipe-out.",
  ],
  quiz: [
    {
      id: "e-05-q1",
      prompt: "The planning graph's size, for n propositions and a operators, is:",
      options: [
        { text: "Exponential in the plan length — like the search tree", correct: false, feedback: "That is precisely what it avoids: the graph shares structure across states." },
        { text: "Polynomial: O((n + a) × levels), with levels bounded before level-off", correct: true, feedback: "Correct — each level adds at most n + a nodes, and monotonicity bounds the number of levels. The exponential hides in EXTRACTION, not the graph." },
        { text: "Linear in the number of goals", correct: false, feedback: "Goals affect where you stop reading, not the graph's extent." },
        { text: "Unbounded — persistence no-ops add a node per fact per level forever", correct: false, feedback: "Until level-off, which monotonicity guarantees arrives: at most n distinct proposition sets and n² mutex statuses can change." },
      ],
      explanation: "Polynomial skeleton, exponential search deferred to extraction — the division of labor that made Graphplan a landmark.",
    },
    {
      id: "e-05-q2",
      prompt: "Goals present at some level but MUTEX there. What does Graphplan do?",
      options: [
        { text: "Extract anyway — mutexes are advisory", correct: false, feedback: "Extraction selects non-mutex actions; mutex goals have no consistent supporting set to select." },
        { text: "Grow the graph another level: mutexes shrink as levels deepen, so facts that fight now may coexist one level later", correct: true, feedback: "Correct — the loop is 'build a level, test goals-and-mutex, else repeat' until success or level-off." },
        { text: "Report unsolvable immediately", correct: false, feedback: "Only at LEVEL-OFF does mutex-goals become unsolvability; earlier levels are just too shallow." },
        { text: "Switch to progression search", correct: false, feedback: "Graphplan stays Graphplan: the graph is its whole world, and the level-off test is its exit." },
      ],
      explanation: "Grow-then-test: mutexes monotonically shrink, so the right response to 'present but mutex' is always one more level — until the fixpoint says stop.",
    },
  ],

};
