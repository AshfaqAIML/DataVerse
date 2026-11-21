/**
 * Lesson f-07 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_07: ClassicalLesson = {

  slug: "f-07",
  title: "Bayesian Networks",
  minutes: 35,
  summary:
    "A DAG of direct influences: the chain rule factorized, independence read off the graph, CPTs as local knowledge.",
  kind: "concept",
  objectives: [
    "Explain the compactness move: the joint factorized over parents",
    "Read independences off a DAG — including explaining away",
    "Build the canonical alarm network with its CPTs",
    "Compute a posterior by enumeration, every term shown",
  ],
  why: "Full joint distributions are hopeless: thirty binary variables need a billion numbers. Bayesian networks are the insight that rescues probability at scale — each variable talks to a few parents, the joint factorizes into local conditional tables, and the GRAPH tells you which independences you may exploit before computing anything. The burglary-alarm network you will build here is the field's canonical teaching example (every textbook draws it), and enumerating a posterior over it by hand — every row of the arithmetic — is the moment the factorization stops being notation and becomes a way of thinking. This is the machinery that replaced MYCIN's certainty factors and now runs inside diagnostic systems, spam filters and every serious probabilistic model with structure.",
  blocks: [
    {
      kind: "text",
      text: "The chain rule factorizes ANY joint distribution: P(X1, …, Xn) = Π P(Xi | X1, …, Xi−1). The insight is that in most worlds, each variable depends on only a FEW predecessors — its **parents**. Write each conditional on parents only, and a billion-number table becomes thirty small ones.",
    },
    {
      kind: "math",
      title: "The factorization",
      displays: [
        { expr: "P(X_1, \\dots, X_n) = \\prod_{i=1}^{n} P(X_i \\mid X_1, \\dots, X_{i-1})", label: "the chain rule — always true" },
        { expr: "P(X_1, \\dots, X_n) = \\prod_{i=1}^{n} P(X_i \\mid \\text{Parents}(X_i))", label: "the network's semantics" },
        { expr: "n \\cdot 2^{k} \\text{ numbers instead of } 2^{n} \\text{ — for } k \\text{ parents each}", label: "the compactness dividend" },
      ],
      caption:
        "The DAG is not decoration: an edge asserts direct influence, and a MISSING edge asserts conditional independence. The graph is the semantics.",
    },
    {
      kind: "definition",
      term: "Bayesian network",
      informal:
        "A directed acyclic graph whose nodes are variables, each carrying a conditional probability table over its parents — the whole joint, factorized.",
      formal: "G = (V, E), \\quad P(V) = \\prod_{v} P(v \\mid \\text{pa}(v))",
      why: "Structure + local numbers = global distribution. All inference questions become arithmetic over the factorization.",
    },
    { kind: "heading", text: "The canonical network" },
    {
      kind: "bayesNet",
      title: "The burglary-alarm network",
      nodes: [
        { id: "B", label: "Burglary", parents: [], states: ["t", "f"], x: 30, y: 12, showCpt: true },
        { id: "E", label: "Earthquake", parents: [], states: ["t", "f"], x: 70, y: 12, showCpt: true },
        { id: "A", label: "Alarm", parents: ["B", "E"], states: ["t", "f"], x: 50, y: 46, showCpt: true },
        { id: "J", label: "JohnCalls", parents: ["A"], states: ["t", "f"], x: 28, y: 82, showCpt: true },
        { id: "M", label: "MaryCalls", parents: ["A"], states: ["t", "f"], x: 72, y: 82, showCpt: true },
      ],
      cpts: {
        B: [{ given: "—", probs: [0.001, 0.999] }],
        E: [{ given: "—", probs: [0.002, 0.998] }],
        A: [
          { given: "B=t, E=t", probs: [0.95, 0.05] },
          { given: "B=t, E=f", probs: [0.94, 0.06] },
          { given: "B=f, E=t", probs: [0.29, 0.71] },
          { given: "B=f, E=f", probs: [0.001, 0.999] },
        ],
        J: [
          { given: "A=t", probs: [0.90, 0.10] },
          { given: "A=f", probs: [0.05, 0.95] },
        ],
        M: [
          { given: "A=t", probs: [0.70, 0.30] },
          { given: "A=f", probs: [0.01, 0.99] },
        ],
      },
      query: "P(Burglary | JohnCalls = t, MaryCalls = t) = ?",
      answer:
        "≈ 0.284 — computed by enumeration in the next lesson block, every term shown. The alarm's CPT is the heart: burglary and earthquake both push on it, and the neighbors' calls depend only on the alarm.",
      independences: [
        "B ⊥ E (marginally: no path between them)",
        "J ⊥ M given A (the calls are independent given the alarm — the network's most-used independence)",
        "B ⊥ E given A... NOT QUITE: A is a COLLIDER — observing it OPENS the path (explaining away)",
      ],
      caption:
        "The CPT row 'A=t | B=f, E=f = 0.001' is the alarm's false-positive rate; 'B=t, E=f = 0.94' says a burglary alone almost always trips it. Five variables, ten numbers — against a joint table's 31.",
    },
    { kind: "heading", text: "Reading independences off the graph" },
    {
      kind: "propositions",
      title: "The three connection patterns (d-separation, first pass)",
      entries: [
        { formula: "A \\to B \\to C: A \\perp C \\mid B", name: "serial (chain)", reading: "Evidence flows through the chain; conditioning on the middle BLOCKS it. Knowing the alarm rang, the neighbors' calls tell you nothing more about the burglary.", tone: "law" },
        { formula: "A \\leftarrow B \\to C: A \\perp C \\mid B", name: "diverging (common cause)", reading: "The common cause explains both children; fix the cause and the children's correlation vanishes.", tone: "law" },
        { formula: "A \\to B \\leftarrow C: A \\perp C \\text{ marginally, but } \\neg(A \\perp C \\mid B)", name: "converging (collider) — explaining away", reading: "Two independent causes of an OBSERVED effect become dependent: hearing the alarm, an earthquake makes burglary LESS likely — the effect is already explained.", tone: "law" },
      ],
      caption:
        "Every independence a Bayesian network asserts is a path through these three patterns — d-separation is the systematic rule for reading them off any DAG. The figure below shows the three shapes side by side; the caption maps each onto the alarm network.",
    },
    {
      kind: "bayesNet",
      title: "The three patterns, side by side",
      nodes: [
        { id: "sA", label: "A", parents: [], states: ["t", "f"], x: 13, y: 10 },
        { id: "sB", label: "B", parents: ["sA"], states: ["t", "f"], x: 13, y: 50 },
        { id: "sC", label: "C", parents: ["sB"], states: ["t", "f"], x: 13, y: 90 },
        { id: "fB", label: "B", parents: [], states: ["t", "f"], x: 50, y: 10 },
        { id: "fA", label: "A", parents: ["fB"], states: ["t", "f"], x: 35, y: 55 },
        { id: "fC", label: "C", parents: ["fB"], states: ["t", "f"], x: 65, y: 55 },
        { id: "cA", label: "A", parents: [], states: ["t", "f"], x: 76, y: 10 },
        { id: "cC", label: "C", parents: [], states: ["t", "f"], x: 96, y: 10 },
        { id: "cB", label: "B", parents: ["cA", "cC"], states: ["t", "f"], x: 86, y: 55 },
      ],
      independences: [
        "Serial A → B → C: A ⊥ C | B — the chain blocks at the middle node",
        "Diverging A ← B → C: A ⊥ C | B — the common cause screens off its children",
        "Converging A → B ← C: A ⊥ C marginally; given observed B they are DEPENDENT — the collider opens (explaining away)",
      ],
      caption:
        "Three panels, one rule each — and all three appear inside the alarm network. Serial is B → A → J: given the alarm, John's call adds nothing further about the burglary. Diverging is J ← A → M: given the alarm, the neighbors' calls are independent — the workhorse that keeps every CPT local. Converging is B → A ← E: burglary and earthquake, independent until the alarm rings — then each explains the evidence at the other's expense. Explaining away is diagnostic reasoning's daily bread: a confirmed flat tire explains the warning light, and the axle hypothesis loses urgency.",
    },
    { kind: "heading", text: "Inference by enumeration" },
    {
      kind: "math",
      title: "The enumeration formula",
      displays: [
        { expr: "P(Q \\mid e) = \\frac{\\sum_{\\text{hidden}} P(Q, e, \\text{hidden})}{P(e)} \\quad \\text{with } P(\\cdot) \\text{ from the factorization}" },
      ],
      caption:
        "Sum the joint over every complete assignment consistent with the evidence: exact, and exponential in the worst case — the next lesson does it on this network with every term printed.",
    },
    {
      kind: "example",
      title: "The numerator's burglary branch, every term",
      problem: "Compute the B=true part of P(B, J=t, M=t) — the sum over the hidden variables E and A of the factorization with B fixed true.",
      steps: [
        { text: "Enumerate the four (E, A) combinations with B = t.", detail: "(t,t), (t,f), (f,t), (f,f) — the hidden variables' joint rows we must sum." },
        { text: "Row (E=t, A=t): P(B)·P(E)·P(A|B,E)·P(J|A)·P(M|A).", detail: "0.001 × 0.002 × 0.95 × 0.90 × 0.70 = 0.001 × 0.002 = 2e-6; × 0.95 = 1.9e-6; × 0.63 = 1.197e-6. — every factor from a CPT row, exactly as the graph prescribes." },
        { text: "Row (E=t, A=f): 0.001 × 0.002 × 0.05 × 0.05 × 0.01 = 5e-11 — negligible.", detail: "A false with burglary AND earthquake: barely possible, and the neighbors barely call." },
        { text: "Row (E=f, A=t): 0.001 × 0.998 × 0.94 × 0.63 = 5.910e-4.", detail: "The dominant term: burglary, no quake, alarm trips, both neighbors call." },
        { text: "Row (E=f, A=f): 0.001 × 0.998 × 0.06 × 0.0005 ≈ 3e-8 — negligible.", detail: "No alarm and both calling is nearly impossible." },
      ],
      result:
        "P(B=t, J=t, M=t) ≈ 1.197e-6 + 5.910e-4 ≈ 5.922e-4 — one branch done; the ¬B branch (computed in the next lesson with the program) supplies the denominator's other half, and the posterior lands at ≈ 0.284.",
    },
    {
      kind: "pythonImpl",
      title: "The full enumeration, verified",
      intent:
        "Compute P(B | J=t, M=t) by summing both branches with the canonical CPT numbers — the textbook's 0.284 answer, reproduced exactly.",
      code: `# P(Burglary | JohnCalls=t, MaryCalls=t) by enumeration
P_B, P_E = 0.001, 0.002
def P_A(b, e):
    return {True: {True: .95, False: .94},
            False: {True: .29, False: .001}}[b][e]
P_J, P_M = {True: .90, False: .05}, {True: .70, False: .01}

def enum(b):
    total = 0.0
    for e in (True, False):
        for a in (True, False):
            p = (P_B if b else 1 - P_B) * (P_E if e else 1 - P_E)
            p *= P_A(b, e) if a else 1 - P_A(b, e)
            p *= P_J[a] * P_M[a]
            total += p
    return total

num, den = enum(True), enum(True) + enum(False)
print(f"P(B | J, M) = {num:.6f} / {den:.6f} = {num/den:.4f}")`,
      output: `P(B | J, M) = 0.000592 / 0.002084 = 0.2842`,
      walkthrough: [
        "enum(b) sums four rows: both hidden variables (E, A) both ways, each row a product of exactly the CPT factors the graph names.",
        "The B=true branch is the example's 0.000592 (5.922e-4, rounded by the format).",
        "The B=false branch contributes 0.001492 — larger in absolute terms (burglary is rare!), which is precisely why the posterior is under one half.",
        "0.2842: both neighbors called, the alarm logic says burglary — with 28% confidence. Rare priors die hard, even against two witnesses; the program is the lesson of f-06 wearing the network's clothes.",
      ],
      project: "The Diagnostic Advisor's uncertainty upgrade is this computation attached to one rule — the network making the dependencies explicit.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "f-07-e1",
      exerciseKind: "concept-check",
      prompt:
        "You observe Alarm = true (nothing else). Are Burglary and Earthquake now independent, dependent, or does it depend on further observations?",
      options: [
        { text: "Independent — no edge connects them", correct: false, feedback: "The no-edge claim holds MARGINALLY; the observation changes the game." },
        { text: "Dependent: B → A ← E is a collider, and conditioning on the collider OPENS the path — a burglary explains the alarm, discounting the earthquake hypothesis (explaining away)", correct: true, feedback: "Correct — the network's most instructive twist: observation creates dependence between independent causes." },
        { text: "Independent given A — the alarm separates them", correct: false, feedback: "That is the SERIAL pattern's rule; the collider inverts it. Conditioning on a middle node blocks chains but opens colliders." },
        { text: "It depends on whether John also calls", correct: false, feedback: "J is downstream of A; knowing A already, J adds nothing about the B–E relation (d-separation: J is not on any B–E path given A... the collider at A is already open)." },
      ],
      solution: "Colliders open under observation: B and E, marginally independent, become dependent the moment A is known — each explains the evidence at the other's expense.",
      explanation: "Explaining away is d-separation's gift to intuition — and diagnostic reasoning's daily bread.",
      concepts: ["d-separation", "collider", "explaining away"],
    },
    {
      kind: "exercise",
      id: "f-07-e2",
      exerciseKind: "predict-output",
      prompt:
        "In the enumeration program, change P_B to 0.01 (a burglar-prone neighborhood) keeping everything else fixed. What is the new P(B | J, M) to four decimals? Reason or run — then type it.",
      expectedOutput: "0.8002",
      solution: "0.8002",
      explanation:
        "A 10× prior multiplies the B-branch's numerator by 10 (0.00592) while the ¬B branch shrinks slightly (0.99 × old-terms = 0.001478). New posterior = 0.00592/(0.00592 + 0.001478) = 0.8002 — the f-06 lesson again: priors and likelihoods compete multiplicatively, and a 10× prior shift moves the posterior from 28% to 80%. Run the modified program and confirm.",
      concepts: ["enumeration inference", "prior sensitivity"],
    },
    {
      kind: "exercise",
      id: "f-07-e3",
      exerciseKind: "trace",
      prompt:
        "Draw (in words or ASCII) the network you would build for: Rain → {Sprinkler off (a 'blocker'), WetGrass}, WetGrass → {SlipperyPath}, and say which independences the DAG asserts. Then say what observing WetGrass does to Rain and Sprinkler — name the pattern.",
      solution: `Rain ──> WetGrass <── Sprinkler
             (Sprinkler's probability DEPENDS on Rain: the node is P(S | R), which models 'rain makes the sprinkler less likely to run' — or keep them independent; state your choice.)
WetGrass ──> SlipperyPath

Independences asserted: SlipperyPath ⊥ Rain given WetGrass (serial chain blocked at the middle); SlipperyPath ⊥ Sprinkler given WetGrass likewise. Observing WetGrass: Rain → WetGrass ← Sprinkler is a COLLIDER — the causes are marginally independent but become dependent given wet grass: rain explains the wetness and the sprinkler hypothesis is discounted (explaining away). The sprinkler being OFF is not a blocker node but evidence at the collider's parent — if you model 'Sprinkler off' as observed, it changes P(WetGrass | Rain) reasoning upstream only through the CPT, not by opening paths.`,
      explanation:
        "The wet-grass world is the alarm network's pastoral twin: same collider at the observed effect, same explaining-away, one CPT smaller. If you can build this one from prose, you can build any.",
      concepts: ["network authoring", "d-separation", "collider"],
    },
  ],
  terms: [
    {
      term: "conditional probability table (CPT)",
      definition: "Each node's local model: P(node | each parent combination) — the network's only numbers, one small table per variable.",
    },
    {
      term: "d-separation",
      definition: "The graph-reading rule for conditional independence: paths through chains and common causes block under conditioning; paths through colliders OPEN under it.",
    },
    {
      term: "explaining away",
      definition: "The collider's signature: independent causes of an observed effect become negatively correlated — one good explanation discounts the other.",
    },
    {
      term: "enumeration inference",
      definition: "Exact posterior computation by summing the factorized joint over all hidden-variable assignments — exponential in the worst case, exact always.",
    },
  ],
  mistakes: [
    {
      mistake: "Adding edges 'to be safe'.",
      why: "Every edge multiplies a CPT's rows and destroys an independence; a dense graph is not more correct, just more numbers and less structure to exploit.",
      fix: "An edge must earn its place as a claimed DIRECT influence; if the dependence is indirect, let the path carry it.",
    },
    {
      mistake: "Forgetting the collider's inversion.",
      why: "Blocking rules learned on chains fail on colliders: conditioning on the effect CREATES dependence between causes — missing explaining away is missing the model's most human behavior.",
      fix: "Classify every path's middle node first (chain, fork, collider); apply the correct rule — block, block, open.",
    },
  ],
  takeaways: [
    "A Bayesian network is the chain rule factorized over parents: n·2^k local numbers instead of 2^n — structure is the entire saving.",
    "The DAG is semantics: edges assert direct influence, missing edges assert conditional independence.",
    "Three connection patterns (chain, fork, collider) generate every independence claim; colliders invert under observation — explaining away.",
    "Enumeration computes exact posteriors by summing the factorization over hidden assignments; 0.2842 on the canonical network, every term inspectable.",
    "This is the machinery that replaced certainty factors: probabilities with the dependencies explicit, and inference that shows its work.",
  ],
  quiz: [
    {
      id: "f-07-q1",
      prompt: "The compactness of a Bayesian network comes from:",
      options: [
        { text: "Approximating probabilities to fewer decimals", correct: false, feedback: "Enumeration on a network is EXACT — no rounding is involved in the saving." },
        { text: "Each variable conditioning only on its parents, so the joint needs n small CPTs instead of one exponential table", correct: true, feedback: "Correct — structure converts one 2^n table into n tables of 2^k numbers each. The graph IS the compression." },
        { text: "Storing only the most probable worlds", correct: false, feedback: "That is the idea behind some approximate methods (particle filtering) — not Bayesian networks, which represent ALL worlds." },
        { text: "Dropping rare events", correct: false, feedback: "The 0.001 burglary prior is right there in a CPT row — nothing is dropped." },
      ],
      explanation: "Factorization, not truncation: the network stores every world's probability, just written as a product of local terms.",
    },
    {
      id: "f-07-q2",
      prompt: "Which independence does the alarm network assert about the two neighbors?",
      options: [
        { text: "J ⊥ M — marginally independent", correct: false, feedback: "Marginally they are CORRELATED: both call when the alarm rings. Independence holds only given A." },
        { text: "J ⊥ M | A — the calls are independent given the alarm", correct: true, feedback: "Correct — the serial path J ← A → M blocks at the fork... precisely: J and M share the common cause A; conditioning on the cause screens it off. The network's workhorse independence." },
        { text: "J ⊥ M | B — given the burglary", correct: false, feedback: "B does not separate them: the path through A is open (A unobserved)." },
        { text: "No independence between them at all", correct: false, feedback: "There is one, and it is the most-used entry in the network's ledger." },
      ],
      explanation: "Common cause, screened off by conditioning on it — the pattern that makes the CPTs local and the inference tractable.",
    },
    {
      id: "f-07-q3",
      prompt: "Enumeration inference on n binary variables costs, in the worst case:",
      options: [
        { text: "Polynomial in n — the factorization saves us", correct: false, feedback: "The factorization saves NUMBERS stored, not the summation's worst case: with all variables connected through the query, every hidden combination must still be summed." },
        { text: "Exponential in the number of hidden variables — O(2^n) rows in the worst case", correct: true, feedback: "Correct — and that worst case is why variable elimination, junction trees and sampling exist: they exploit the graph's independences to avoid enumerating the full table." },
        { text: "Linear in the CPT sizes", correct: false, feedback: "Each row is cheap; the row COUNT is the adversary." },
        { text: "Undecidable", correct: false, feedback: "Always decidable — exact, even; just potentially expensive." },
      ],
      explanation: "Exact and exponential-worst-case: the trade that structured the field's next forty years of approximate inference work.",
    },
  ],

};
