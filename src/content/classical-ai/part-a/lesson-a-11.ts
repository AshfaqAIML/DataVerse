/**
 * PART A · MODULE 3 · "Local Search and Landscapes" — lesson a-11,
 * "Local Beam Search".
 *
 * The population-minded sibling of a-09's hill climbing: keep the best k
 * states of ONE shared pool — the states compete for the k slots, which is
 * information sharing, not k independent climbs. The worked example's
 * two-basin landscape (S/A/B/A1/A2/C/D/E/X/Y, k = 2) is hand-verified and
 * was cross-checked with an independent python beam-trace; the 1 − 0.87^k
 * figures extend a-09's measured p ≈ 0.13 (13 of 100) and stay consistent
 * with a-12's ledger row (Local beam (k), space O(kb), "diversity is the
 * failure mode").
 *
 * No pythonImpl by design — this is a concept lesson; the worked example
 * and the math block carry it. Every number stated here was verified by
 * running python3 (probabilities) or by hand next to a machine cross-check.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_11: ClassicalLesson = {
  slug: "a-11",
  title: "Local Beam Search",
  minutes: 25,
  summary:
    "Keep the best k states instead of one — hill climbing's population-minded sibling.",
  kind: "concept",
  objectives: [
    "State local beam search precisely: pool all successors of all k states each step and keep the best k of the pool",
    "Explain why a beam is not k independent hill climbs, and what the pool's competition for slots buys that independent climbs cannot",
    "Trace a k = 2 beam by hand through a small landscape — pool, ranking, survivors, cull — and compare it with a hill climb from the same start",
    "Tune the beam width dial: k = 1 recovers hill climbing, unbounded k recovers breadth-first search, and each step costs O(kb)",
    "Diagnose diversity collapse and apply the practitioner fixes: beam restarts, distance penalties, stochastic selection",
  ],
  why: "Every local-search failure you have measured so far has one root: a single state can only be in one basin. Hill climbing's 87-of-100 stranded climbs in lesson a-09 were one climber's greed; random restarts fix that only by the luck of fresh draws. Local beam search is the first algorithm in this course that lets candidate solutions LEARN FROM EACH OTHER: a state whose successors expose a dead basin hands its slot to a line that is going somewhere. That one mechanism — a shared pool and k competing slots — is why beam search runs inside machine-translation decoders, speech recognizers and circuit-layout tools, where the state space is astronomical and only the final configuration matters. It is also your first population method: relax the deterministic top-k into a quality-weighted sample and you are one step from genetic algorithms. The price of the population is a new failure mode — diversity collapse — that you will learn to trace, measure and defend against, because a-12's ledger will hold you to it.",
  blocks: [
    // ------------------------------------------------------------ the opening
    {
      kind: "text",
      text: "Lesson a-09 ended with a stubborn number: of 100 seeded climbs, steepest-ascent hill climbing solved 13 and stranded 87 — because one climber lives in one basin, and greed commits it to that basin's peak. Random restarts (lesson a-10) answer that failure with volume: more starts, more basins, hoping the draws differ. This lesson changes the unit of the search itself. Local beam search carries not one state but a population of `k` states through the landscape, and at every step all of their successors go into one shared pool where they compete for the `k` slots. It looks like hill climbing drawn k times wider. It is not: the states are not k independent searches, and what the pool knows reshapes what every state gets to explore next — which is the entire point.",
    },
    // ------------------------------------------------------------ the mechanism
    { kind: "heading", text: "One pool, k slots" },
    {
      kind: "text",
      text: "The step is hill climbing's step, applied to a population. A hill climb generates the neighborhood N(s) of its one current state and moves to the best member. A beam holds a set B of `k` states and generates **all successors of all of them**: the pool is the union of the k neighborhoods — as many as `k · b` states when each state has `b` successors. If the pool contains a goal (on 8-queens, `h = 0`), the search stops with it. Otherwise the beam keeps the best `k` of the pool and discards the rest, and the step repeats. That pool is the whole memory story: the beam plus its successors is `O(kb)` states — the row a-12's ledger carries for local beam search — where the tree searches of Modules 1–2 paid `O(b^d)` for a frontier. No path, no expanded set, no route back: like every local search, the beam returns a state, not how it got there.",
    },
    {
      kind: "definition",
      term: "Local beam search",
      informal:
        "A local search that keeps k states instead of one. Each step generates all successors of all k states, pools them, and keeps the best k of the pool — the states compete for the slots. The answer is the best state generated, never a path.",
      formal:
        "B_{t+1} = \\text{best-}k( N(s_1) \\cup \\ldots \\cup N(s_k) ), \\quad B_t = \\{s_1, \\ldots, s_k\\}",
      why: "The pool — not any single state — is the unit of selection: slots are reallocated between basins every step, and that reallocation is exactly the move a lone hill climb cannot make.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Read this twice: a beam is not k hill climbs",
      text: "The tempting misreading of beam search is 'hill climbing run k times in parallel.' It is not, and the difference is the point of this lesson. Independent climbs never communicate: each improves its own state against its own neighborhood, and none can learn that another's basin is better. A beam's states share one pool, and the pool's ranking decides survival: a state whose successors look weak loses its slot to another state's children — a line can be culled mid-run because of what **other** states found. That is information sharing across the population. And the misreading is costly, not just wrong: from one start, k independent climbs are clones — each makes the same greedy move and each strands on the same local optimum, k identical copies of one climb at k times the price. The beam keeps the second-best hypothesis alive; in the landscape below, that is precisely what finds the global optimum.",
    },
    // ------------------------------------------------------------ the landscape
    { kind: "heading", text: "A landscape that needs a population" },
    {
      kind: "stateSpace",
      title: "A two-basin landscape: ten states, one trap",
      graph: {
        nodes: [
          { id: "S", label: "S", sub: "h = 2", x: 50, y: 78, tone: "start" },
          { id: "A", label: "A", sub: "h = 5", x: 20, y: 42, tone: "highlight" },
          { id: "B", label: "B", sub: "h = 4", x: 68, y: 54 },
          { id: "A1", label: "A1", sub: "h = 3", x: 9, y: 66, tone: "muted" },
          { id: "A2", label: "A2", sub: "h = 2", x: 33, y: 78, tone: "muted" },
          { id: "C", label: "C", sub: "h = 6", x: 58, y: 30 },
          { id: "D", label: "D", sub: "h = 5", x: 84, y: 42 },
          { id: "E", label: "E", sub: "h = 7", x: 66, y: 18, tone: "goal" },
          { id: "X", label: "X", sub: "h = 4", x: 44, y: 54, tone: "muted" },
          { id: "Y", label: "Y", sub: "h = 6", x: 94, y: 30 },
        ],
        edges: [
          { from: "S", to: "A" },
          { from: "S", to: "B", highlighted: true },
          { from: "A", to: "A1", dashed: true },
          { from: "A", to: "A2", dashed: true },
          { from: "B", to: "C", highlighted: true },
          { from: "B", to: "D" },
          { from: "C", to: "E", highlighted: true },
          { from: "C", to: "X", dashed: true },
          { from: "D", to: "Y" },
        ],
        legend: [
          ["start", "the start state S (h = 2)"],
          ["highlight", "A — the local optimum where a single climb strands"],
          ["goal", "E — the global optimum (h = 7)"],
          ["muted", "states the k = 2 beam culls: A1, A2 and X"],
          ["edge", "a successor — pools are built from these"],
        ],
        caption:
          "Height is the objective — higher on the page, larger h (this landscape maximizes, like a-09's ridge walk). S has two successors: A (h = 5), the taller, is a local optimum whose own children fall back to 3 and 2; B (h = 4) is one point shorter, but its children climb to 6 and 5. The highlighted path S → B → C → E is the line the beam will keep; the dashed edges lead to the states it culls. A single climb from S must choose A and never sees E.",
      },
      solutionNote:
        "A solution is the global optimum E (h = 7): a search succeeds the moment it generates E. Every other state is a waypoint — this is optimization, not a goal test.",
    },
    {
      kind: "example",
      title: "Beam search with k = 2, walked by hand",
      problem:
        "Run local beam search with k = 2 on the landscape above, starting the beam as the singleton {S} (a deployed beam seeds k random states; seeding from S makes the comparison against a single climb exact). At each step: pool all successors of all beam states, stop at once if E enters the pool, otherwise keep the best 2. Then run steepest-ascent hill climbing from the same S and compare.",
      steps: [
        {
          text: "Step 1 — expand S into the first pool.",
          detail:
            "Pool 1 = N(S) = {A: 5, B: 4}. Two states for two slots: nothing is culled, and the beam becomes {A, B}. Hill climbing from S does the same expansion and keeps only the best ONE — A, since 5 > 4 — committing then and there; the beam keeps both hypotheses alive.",
        },
        {
          text: "Step 2 — pool the successors of BOTH states.",
          detail:
            "Pool 2 = N(A) ∪ N(B) = {A1: 3, A2: 2} ∪ {C: 6, D: 5}: four states. Ranked: C (6) > D (5) > A1 (3) > A2 (2) — no goal among them, so the beam keeps the best 2: {C, D}. This is the population effect in one line: BOTH of B's children survive, BOTH of A's children are culled, and A's whole line dies one step after A itself (5) outscored B (4). The beam judged each state by its successors' prospects — information the states shared by being pooled.",
        },
        {
          text: "Step 3 — expand the survivors.",
          detail:
            "Pool 3 = N(C) ∪ N(D) = {E: 7, X: 4} ∪ {Y: 6}: three states. Ranked: E (7) > Y (6) > X (4). E is the global optimum and it has entered a pool — the search stops and reports E. Total work: 2 + 4 + 3 = 9 successor evaluations across three pools.",
        },
        {
          text: "The comparison — hill climbing from the same S.",
          detail:
            "The climb goes S (2) → A (5), then halts: A's neighborhood {A1: 3, A2: 2} (with S: 2 behind it) offers nothing better than 5. It never generates C, D, E or Y — and neither would k non-communicating climbs from S, which would all make the same greedy move to A and strand together.",
        },
      ],
      result:
        "Beam (k = 2): E, h = 7, found in three pools and 9 successor evaluations. Hill climb from S: A, h = 5, stuck after one move — blind to a global optimum three levels down. The difference was not luck: B survived step 1 on the beam's budget, and A's line was culled at step 2 by competition.",
    },
    // ------------------------------------------------------------ the dial
    { kind: "heading", text: "The dial: beam width" },
    {
      kind: "table",
      title: "What each beam width buys, and what it costs",
      headers: ["Beam width k", "What it recovers", "Per-step cost", "What fails first"],
      rows: [
        [
          "k = 1",
          "Hill climbing exactly — one state, one greedy move: a-09's algorithm, stranded climbs and all",
          "b successors",
          "Local optima: the one state's basin is the whole world",
        ],
        [
          "k = 2 to 10",
          "The practical regime — a few basins alive at once, slots reallocated every step",
          "up to k · b successors, O(kb) pool",
          "Diversity collapse: the k states drift into one basin",
        ],
        [
          "k growing toward the frontier",
          "Breadth-first-like coverage; completeness and optimality return only when k reaches the full frontier",
          "k · b successors, O(kb) pool",
          "The memory bill: O(kb) with k climbing toward b^d",
        ],
        [
          "k unbounded",
          "Breadth-first search — every successor kept, nothing culled (you have re-derived Module 1)",
          "b^d per level",
          "Nothing fails — and nothing is affordable",
        ],
      ],
      caption:
        "One dial, three regimes — and both ends are algorithms you already know: k = 1 is this module's opener, unbounded k is Module 1's breadth-first search with its exponential frontier. Deployed beams live in the middle rows: small k, chosen so the O(kb) pool fits in memory while the states stay spread across basins — that O(kb) is a-12's ledger row for 'Local beam (k)', whose warning, 'diversity is the failure mode', the rest of this lesson earns. (For precision: at k = 1 with the pool streamed rather than stored, the beam's memory is exactly the climb's O(1) — O(kb) counts the pool the analysis materializes.)",
    },
    {
      kind: "math",
      title: "What k tries are worth — and what a beam actually gets",
      displays: [
        { expr: "P_k = 1 - (1 - p)^k", label: "k independent tries" },
        { expr: "1 - 0.87^1 = 0.13, \\quad 1 - 0.87^2 = 0.2431, \\quad 1 - 0.87^4 \\approx 0.4271", label: "at p = 0.13 (a-09's 13 of 100)" },
        { expr: "P_{\\text{beam}} \\approx p \\quad \\text{when all } k \\text{ states share one basin}", label: "the collapse floor" },
      ],
      caption:
        "Display (1) is what k NON-communicating tries buy, and lesson a-10's random restarts chase exactly this curve — at a-09's measured p ≈ 0.13, two tries give 0.2431, four give ≈ 0.4271, and thirty give ≈ 0.98, the figure a-09 quoted for restart budgets. A beam is not those tries, and it deviates in BOTH directions. Above the curve: when the k states are as spread as independent draws, the shared pool ranking adds something restarts cannot do — a state whose successors expose a dead basin hands its slot to a live line mid-run, exactly the step-2 cull of the worked example. Below the curve: the beam's states are picked by the same greedy rule each step, and greedy selection correlates them — when all k drift into one basin, the beam degenerates into a single climb at k times the per-step cost and its success probability collapses toward p, display (3). Which deviation you get is a property of the landscape and of k — which is why practitioners measure.",
    },
    // ------------------------------------------------------------ the failure mode
    { kind: "heading", text: "Diversity is the failure mode" },
    {
      kind: "text",
      text: "Nothing in the beam's rule keeps the k states apart — the top-k cull is greed applied to populations, and greed loves company. Each step's survivors are the pool's best; they tend to sit in the best basin; their successors crowd the next pool; and after a few steps all k states can be neighbors on the same slope. When that happens, the beam is k copies of hill climbing's mistake: every pool is one basin's successors, every cull is internal, and the success probability falls from the 1 − (1−p)^k the budget implied toward plain p. Practitioners defend diversity three ways. **Re-seed**: when the beam stalls or its states converge, restart it from fresh random states — restarts of the beam, not of a climb. **Penalize closeness**: add a distance term that punishes states too similar to the ones already kept, so top-k prefers spread over company. **Sample instead of select** — the idea the next paragraph turns into an algorithm.",
    },
    {
      kind: "text",
      text: "Stochastic beam search softens the cull: rather than deterministically keeping the best k of the pool, sample k successors with probability proportional to their quality — strong lines are likely to keep their slots, but dark-horse states keep a fighting chance, and a briefly-ugly basin is never culled on one bad step. Look at what the population has become: states with varying fitness, kept with probability proportional to that fitness. That is one generation of a genetic algorithm with the crossover removed — and if you then build children from PAIRS of states, recombining their parts, the population is a genetic algorithm in full. The bridge from local search to evolutionary methods is exactly this paragraph.",
    },
    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-11-e1",
      exerciseKind: "trace",
      prompt:
        "A second landscape — built to break a beam. States (height to maximize) and successors: P (h = 5) → P1 (h = 6) and P2 (h = 4); R (h = 4) → P1 (h = 6); P1 (h = 6) → p1 (h = 2); P2 (h = 4) → p2 (h = 3); Q (h = 3) → Q1 (h = 9). The states p1, p2 and Q1 have no successors, and Q1 is the global optimum. A beam with k = 2 is seeded with the random pair {P, R} — both in the P basin. Trace it: give each pool with its values, the ranking, the surviving beam, and where and why the search halts. Then explain in one sentence why Q1 was never generated — and trace the first step of the same beam seeded with {P, Q} instead.",
      solution:
        "Step 1: pool = N(P) ∪ N(R) = {P1: 6, P2: 4} ∪ {P1: 6} = {P1, P2} — the pool is a set, so P1's double generation (from P and from R) still takes one slot. Ranked P1 (6) > P2 (4); beam = {P1, P2}. Step 2: pool = N(P1) ∪ N(P2) = {p1: 2} ∪ {p2: 3} = {p1, p2}; ranked p2 (3) > p1 (2); both kept, beam = {p1, p2} — the beam has walked its two states downhill into a dead end, because every state in every pool lived in the P basin. Step 3: pool = ∅ — neither p1 nor p2 has successors — so the beam halts, reporting the best state it ever generated: P1, h = 6. Q1 was never generated because no pool ever contained a state with an edge into the Q basin: a beam cannot invent states, and with both seeds in one basin, k = 2 was one climb at double cost. With the seed {P, Q}: pool = N(P) ∪ N(Q) = {P1: 6, P2: 4, Q1: 9} — Q1 is generated at step 1 and is the global optimum: immediate success.",
      explanation:
        "This is a-12's ledger note — 'diversity is the failure mode' — made traceable. The beam amplifies whatever its seeds explore: diverse seeds give the pool real choices (the {P, Q} trace succeeds instantly), correlated seeds give it k copies of one basin. Same algorithm, same k, same landscape — seed diversity was the entire difference.",
      concepts: ["beam width", "diversity collapse", "pool"],
    },
    {
      kind: "exercise",
      id: "a-11-e2",
      exerciseKind: "concept-check",
      prompt:
        "Judgment with numbers. On the 8-queens landscape of lesson a-09, one seeded climb succeeds with p ≈ 0.13 (13 of 100). Two systems are measured over many attempts: four INDEPENDENT random-restart climbs per attempt solve 43% of attempts — consistent with 1 − 0.87^4 ≈ 0.427 — while a local beam with k = 4 solves only 30%. Your colleague declares beam search broken and restarts the winner. The correct assessment:",
      options: [
        {
          text: "The restarts are behaving exactly as independent tries should (43% ≈ 0.427 — the ceiling for four uncorrelated shots), while the beam's 30% says its four states are correlated: clustered in shared basins, getting fewer than four effective tries. Diagnose diversity and fix it — re-seed stalled beams, penalize near-duplicates, or select stochastically — before concluding anything about beam search itself",
          correct: true,
          feedback:
            "Correct — the 1 − (1−p)^k curve is a measuring instrument: systems at it are independent, systems under it are correlated, and correlation is a property of the setup, not a verdict on the algorithm. And note what a fixed beam keeps that restarts never had: mid-run, a state whose successors expose a dead basin can hand its slot to a live line.",
        },
        {
          text: "Restarts are simply the better algorithm — the beam's pool sharing can never help",
          correct: false,
          feedback:
            "Too strong, and backwards for the case that matters: the worked example's step 2 culled a doomed line mid-run, something no independent climb can do. With diversity restored, a beam matches parallel tries and adds slot reallocation on top; the 30% measured the setup, not the ceiling.",
        },
        {
          text: "Raise k — with k = 10 the beam will clear 43%",
          correct: false,
          feedback:
            "Raising k multiplies the per-step pool (O(kb)) and the correlation together: ten clustered states are still one basin's climb at ten times the cost. The measured gap is a diversity problem; capacity was never the issue.",
        },
        {
          text: "The colleague's arithmetic is off anyway — four climbs should give 4 × 13% = 52%",
          correct: false,
          feedback:
            "Probabilities of a union do not add: four independent tries give 1 − (1 − 0.13)^4 ≈ 42.7%, not 52%. The naive sum double-counts every attempt in which more than one climb succeeds — exactly the overlap the independent formula exists to remove.",
        },
      ],
      solution:
        "Diagnose, then fix. The restarts' 43% ≈ 1 − 0.87^4 = 0.4271 confirms four independent tries; the beam's 30% sits well under the independent curve, which means its states' outcomes are positively correlated — the diversity collapse this lesson's second half is about. Restore spread across basins (beam restarts, distance penalties, stochastic selection) and re-measure: the beam's slot-reallocation edge can only appear on a diverse population.",
      explanation:
        "Use the 1 − (1−p)^k curve as an instrument: at the curve means independent, below it means correlated, and the fix for correlation is diversity — not a bigger k, and not abandonment.",
      concepts: ["parallel exploration", "beam width", "diversity collapse"],
    },
  ],
  terms: [
    {
      term: "parallel exploration",
      definition:
        "Carrying several candidate states through the landscape at once so their prospects — not just their current scores — compete each step. The beam's alternative to committing a single greedy climber; contrast with lesson a-10's restarts, which are parallel tries that never communicate.",
    },
    {
      term: "beam width",
      definition:
        "The k in local beam search: how many states the beam carries. The dial between hill climbing (k = 1) and breadth-first search (unbounded k); per-step cost and pool memory both grow as O(kb).",
    },
    {
      term: "pool",
      definition:
        "The combined successor set of all k beam states, rebuilt every step; the best k of the pool form the next beam. The pool is where the population's information is shared — and where losing lines are culled.",
    },
    {
      term: "stochastic beam search",
      definition:
        "The variant that samples the k next states with probability proportional to quality instead of keeping the best k deterministically — a safeguard against diversity collapse, and one generation of a genetic algorithm with no crossover.",
    },
    {
      term: "diversity collapse",
      definition:
        "The beam's characteristic failure: all k states drift into one basin, every pool becomes that basin's successors, and the search degenerates into a single hill climb at k times the per-step cost.",
    },
  ],
  mistakes: [
    {
      mistake: "Implementing beam search as k independent hill climbs.",
      why: "It reads 'parallel' and sounds equivalent, but independent climbs never share information: none can learn that another's basin is better, and from similar starts they repeat one another's mistakes — k copies of the same stranded climb.",
      fix: "Pool ALL successors of ALL k states each step and keep the global best k of that pool. The competition for slots — the culling — is not an optimization of the algorithm; it IS the algorithm.",
    },
    {
      mistake: "Reading the beam's k as k independent chances (success probability 1 − (1−p)^k).",
      why: "That formula assumes uncorrelated tries; a beam's states share every pool ranking, and the greedy top-k actively correlates them — the true rate can land well under the formula when diversity collapses, and above it when sharing pays.",
      fix: "Treat 1 − (1−p)^k as a baseline to measure against, the way a-09 measured 13 of 100 rather than assuming the literature's ≈ 14%: systems at the curve are independent, under it correlated, over it sharing well.",
    },
    {
      mistake: "Turning k up to 'be safe' on every problem.",
      why: "k multiplies the per-step pool (O(kb) successors scored each step) and buys nothing when the states are clustered — more copies of the same basin at a higher price, the capacity fix applied to a diversity problem.",
      fix: "Spend the budget on spread instead: re-seed stalled beams with random states, or add a distance penalty so top-k prefers states far from the ones already kept.",
    },
  ],
  takeaways: [
    "Local beam search keeps the best k states of one shared pool — lines compete for slots, doomed branches are culled mid-run and live ones inherit the budget: information sharing, not k parallel climbs.",
    "The beam width k is a dial with known ends: k = 1 recovers hill climbing, unbounded k recovers breadth-first search — the practical regime is small k with diverse states, at O(kb) per step.",
    "k independent tries succeed with probability 1 − (1−p)^k — at a-09's p = 0.13: 0.13, 0.2431, ≈ 0.4271 for k = 1, 2, 4 — and the beam deviates both ways: above when sharing steers slots, down toward p when diversity collapses.",
    "Diversity is the failure mode: k states in one basin are k copies of hill climbing's mistake — defended against with beam restarts, distance penalties, or stochastic selection.",
    "Stochastic beam search — sampling the next k by quality — is one generation of a genetic algorithm with no crossover: local search's bridge to the evolutionary family.",
  ],
  quiz: [
    {
      id: "a-11-q1",
      prompt: "Local beam search keeps k states. Which sentence states the step exactly?",
      options: [
        {
          text: "All successors of all k states enter one pool; if no goal appears, the best k of the pool become the beam — states compete for slots, so a line can be culled because of what OTHER states found",
          correct: true,
          feedback:
            "Exactly — one pool, one ranking, k slots. The cull is the algorithm: it is how a beam abandons a basin mid-run, the move neither a hill climb nor k non-communicating climbs can make.",
        },
        {
          text: "Each of the k states runs its own hill climb against its own neighborhood, and the best final state wins",
          correct: false,
          feedback:
            "That is k independent climbs — no pool, no competition, no sharing. From one start they make the same greedy move and strand together; the worked example's step-2 cull is precisely what they cannot do.",
        },
        {
          text: "The k best states ever seen are carried forward as the beam",
          correct: false,
          feedback:
            "The beam holds the best k of the CURRENT pool only — a state is dropped the moment its successors lose, even if it was the previous step's pride: A (h = 5) outlived exactly one pool in the worked example.",
        },
        {
          text: "k fresh random states are generated each step and replace the beam",
          correct: false,
          feedback:
            "Random replacement each step throws away the search's progress — it is neither beam search nor restarts. The beam's new states are SELECTED successors of the states it chose to keep.",
        },
      ],
      explanation:
        "The pool is the algorithm's single shared resource: generating everyone's successors together, then ranking them together, is what makes the beam a population method rather than k climbs.",
    },
    {
      id: "a-11-q2",
      prompt: "You raise the beam width from k = 1 to k = 10 on a problem with branching factor b. What exactly changes?",
      options: [
        {
          text: "Each step now generates and scores up to 10b successors instead of b, pool memory grows to O(kb), and up to ten basins can be alive at once — but no completeness or optimality returns at any finite k",
          correct: true,
          feedback:
            "Correct on all three counts: cost and coverage scale with k, and the guarantees do not — a deep optimum behind a wide cull stays invisible until k reaches the full frontier, at which point you have breadth-first search and its memory bill.",
        },
        {
          text: "The search becomes complete, because the beam now keeps ten states",
          correct: false,
          feedback:
            "Completeness returns only in the unbounded limit — k at the full frontier is exactly breadth-first search. At k = 10 the beam is still a local search: it culls live branches, and culled branches never come back.",
        },
        {
          text: "Each state improves ten times faster, since ten states share the work",
          correct: false,
          feedback:
            "The states do not speed up — there are simply more of them, and each step costs MORE (10b successors scored, not b). Sharing in a beam reallocates slots; it does not parallelize any single state's climb.",
        },
        {
          text: "Memory falls, because the beam prunes the space more aggressively",
          correct: false,
          feedback:
            "Backwards: the pool cap grows with k (up to kb successors in play, against b for one climb). The beam saves memory only against breadth-first's b^d — never against the k = 1 climb it started as.",
        },
      ],
      explanation:
        "k buys coverage and pays in pool size, proportionally: O(kb) successors per step, O(kb) memory, and the same absence of guarantees until the dial reaches the full frontier — a-12's ledger row in one sentence.",
    },
    {
      id: "a-11-q3",
      prompt: "A k = 8 beam halts with all eight states clustered in one basin, each a local optimum near h = 5. The most precise diagnosis:",
      options: [
        {
          text: "Diversity collapse: the greedy top-k cull correlated the states into one basin, so the beam performed a single hill climb at up to eight times the per-step cost — its success probability fell toward p, not toward 1 − (1−p)^8",
          correct: true,
          feedback:
            "Correct — the failure is measurable and named: eight clustered states deliver roughly one climb's chances while paying for eight. And the lesson's two honest fixes apply directly: re-seed the beam from fresh random states, or make selection prefer spread.",
        },
        {
          text: "k = 8 was too small; k = 50 would have found the optimum",
          correct: false,
          feedback:
            "Any k collapses if seeds and selection herd the states into one basin — fifty clustered states are still one climb, at fifty times the pool. The cure is diversity, not capacity.",
        },
        {
          text: "The beam should have carried the parent states forward too",
          correct: false,
          feedback:
            "Elitism can protect good states from bad luck, but here the parents ARE the clustered states — carrying them forward preserves the collapse. The beam's best-ever bookkeeping already remembers h ≈ 5; the problem is that nothing ever generated better.",
        },
        {
          text: "Nothing went wrong — beam search is simply incomplete",
          correct: false,
          feedback:
            "True and empty: 'incomplete' names a guarantee the beam never promised. The measurable event — eight states bought, one basin explored — is diversity collapse, and it has named, testable fixes.",
        },
      ],
      explanation:
        "Below the 1 − (1−p)^k curve means correlated: diversity collapse is the beam's own local optimum, a failure of the population rather than of any single state — and the one a-12's ledger warns about in a single line.",
    },
  ],
};
