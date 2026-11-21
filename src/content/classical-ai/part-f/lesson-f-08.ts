/**
 * Lesson f-08 — "Inference and the Expert-System Legacy" (Part F, module 2,
 * chapter "Networks"). The FINAL lesson of Part F and of School J's whole
 * specialization arc: the enumeration computation f-07 left half-finished,
 * the complexity honesty, and the school's closing synthesis.
 *
 * Every `output` field is the REAL output of running the code with python3
 * (verified by scripts/verify-one-lesson.ts). Numbers cross-checked against
 * lesson-f-07: same CPTs, same branch rows, same posterior 0.2842.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_08: ClassicalLesson = {

  slug: "f-08",
  title: "Inference and the Expert-System Legacy",
  minutes: 30,
  summary:
    "Compute a posterior by enumeration on a real network, then trace the line from MYCIN's certainty factors to today's probabilistic expert systems.",
  kind: "concept",
  objectives: [
    "State the enumeration formula and say what each part commits you to: which variables are summed, where each factor comes from, why the constant disappears into ∝",
    "Compute P(Burglary | JohnCalls = t, MaryCalls = t) row by row — both branches, all eight products, the normalization — and verify it with a program",
    "Explain the worst-case cost of exact enumeration and name the field's two escape routes",
    "Trace the expert-system legacy from MYCIN's certainty factors to Bayesian expert systems, and match each of the school's four formalisms to the world-shape it fits",
  ],
  why: "This is the lesson where the school pays its debts. F-07 built the alarm network, stated the enumeration formula, and computed exactly one branch of one posterior — the burglary branch, 5.922e-4 — leaving the rest as a promise. Here the promise is kept in full: eight products, two branch totals, one normalization, and the field's canonical answer, 0.2842, on your desk with every term visible. That matters because a posterior you have computed row by row is a different possession from one you have merely been told: you know exactly which CPT number carries which weight, so when the world changes — a burglar-prone neighborhood, a better alarm — you can say by how much the belief should move. The second debt is historical. MYCIN's certainty factors were the expert-system era's answer to noise, and understanding what they lacked, and what the probabilistic repair kept, is how this school ends: search, logic, planning and probability as four formalisms for one discipline, each earned by your own hands.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "It is the middle of the night, and both phones are ringing: John heard the alarm, and so did Mary. The previous lesson left you holding half the answer — the burglary branch of P(Burglary | JohnCalls = t, MaryCalls = t), summed to 5.922e-4 with the ¬B branch deferred to this lesson. That debt is repaid first below: the full computation, all eight rows of both branches, normalized to the canonical 0.2842. Then the lesson widens to what the number means — why two reliable witnesses still leave you under 30% sure, what such a computation costs when networks grow, and how the machinery you just exercised is the direct heir of MYCIN's rules. This is the last lesson of the school, and it closes the whole arc.",
    },
    { kind: "heading", text: "Inference by enumeration" },
    {
      kind: "math",
      title: "The enumeration formula",
      displays: [
        { expr: "P(X \\mid e) \\propto \\sum_{h} \\prod_{v} P(v \\mid \\text{Parents}(v))", label: "enumeration inference" },
        { expr: "P(X = x \\mid e) = \\frac{\\sum_{h} P(x, e, h)}{\\sum_{y} \\sum_{h} P(y, e, h)}", label: "the same, normalized — y ranges over X's values" },
        { expr: "P(B \\mid j, m) = \\frac{P(B, j, m)}{P(B, j, m) + P(\\neg B, j, m)}", label: "the binary query on the alarm network" },
      ],
      caption:
        "Read it as a recipe. Fix the evidence e and a value x of the query; for every complete assignment h of the HIDDEN variables — those neither queried nor observed — multiply one CPT row per node; sum the products; repeat for each of X's values and normalize, which is what the ∝ hides. Nothing here is new mathematics: it is f-07's factorization with f-06's total-probability denominator, arranged so a machine can do the multiplying. Throughout, j and m abbreviate the evidence JohnCalls = t, MaryCalls = t.",
    },
    {
      kind: "definition",
      term: "enumeration inference",
      informal:
        "Exact posterior computation: freeze the evidence, walk every assignment of the hidden variables, price each assignment as a product of CPT rows, add them up, normalize.",
      formal: "P(X \\mid e) = \\alpha \\sum_{h} \\prod_{v} P(v \\mid \\text{pa}(v))",
      why: "Every step is inspectable — the audit trail MYCIN's clinicians wanted, now over numbers that mean what the probability axioms say they mean.",
    },

    // ------------------------------------------------------------ the computation
    {
      kind: "example",
      title: "P(Burglary | JohnCalls = t, MaryCalls = t), every term",
      problem:
        "On the f-07 alarm network with its canonical CPTs — P(B) = 0.001, P(E) = 0.002, P(A | B,E) = 0.95 / 0.94 / 0.29 / 0.001, P(J | A) = 0.90 / 0.05, P(M | A) = 0.70 / 0.01 — both neighbors call. Compute P(B = t | j, m) by enumeration: both branches, all eight rows, then normalize.",
      steps: [
        {
          text: "Fix the roles: B is the query, J = t and M = t the evidence, E and A the hidden variables.",
          detail:
            "Each row is one product of five factors — P(b)·P(e)·P(A|b,e)·P(J|A)·P(M|A) — each factor read off a CPT row exactly as the graph prescribes. The independence J ⊥ M | A is what licenses the last two factors to multiply: with A = t they enter every row as 0.90 · 0.70 = 0.63.",
        },
        {
          text: "B branch, row (E=t, A=t): 0.001 × 0.002 × 0.95 × 0.90 × 0.70 = 1.197e-6.",
          detail:
            "The f-07 lesson's first row, restated: burglary and quake, alarm trips, both call. 0.001 · 0.002 = 2e-6; × 0.95 = 1.9e-6; × 0.63 = 1.197e-6.",
        },
        {
          text: "B branch, row (E=t, A=f): 0.001 × 0.002 × 0.05 × 0.05 × 0.01 = 5.000e-11 — negligible.",
          detail:
            "Burglary and quake, yet the alarm fails (0.05) and both neighbors call anyway (0.05 · 0.01): a five-in-a-hundred-billion world.",
        },
        {
          text: "B branch, row (E=f, A=t): 0.001 × 0.998 × 0.94 × 0.90 × 0.70 = 5.910e-4.",
          detail:
            "The branch's dominant row by four orders of magnitude: burglary, no quake, alarm trips (0.94), both call (0.63). 0.001 · 0.998 = 9.98e-4; × 0.94 = 9.3812e-4; × 0.63 = 5.910e-4.",
        },
        {
          text: "B branch, row (E=f, A=f): 0.001 × 0.998 × 0.06 × 0.05 × 0.01 = 2.994e-8 — negligible.",
          detail:
            "Burglary, no quake, no alarm, both call anyway. Branch total: 1.197e-6 + 5.000e-11 + 5.910e-4 + 2.994e-8 = 5.922e-4. Compact form: 0.001 · [0.002 · 0.95 + 0.998 · 0.94] · 0.63 = 5.922e-4 — the two A=t rows with the 0.63 pulled OUT of the hidden sum; the A=f rows' tail (0.05 · 0.01 = 0.0005 per row) is invisible at this precision.",
        },
        {
          text: "¬B branch, row (E=t, A=t): 0.999 × 0.002 × 0.29 × 0.90 × 0.70 = 3.650e-4.",
          detail:
            "No burglary — but an earthquake, which trips the alarm 29% of the time. 0.999 · 0.002 = 1.998e-3; × 0.29 = 5.7942e-4; × 0.63 = 3.650e-4. This is f-07's explaining away made quantitative: the quake is a rival explanation of the very same calls.",
        },
        {
          text: "¬B branch, row (E=t, A=f): 0.999 × 0.002 × 0.71 × 0.05 × 0.01 = 7.093e-7 — small.",
          detail: "Quake, alarm somehow silent, both call anyway.",
        },
        {
          text: "¬B branch, row (E=f, A=t): 0.999 × 0.998 × 0.001 × 0.90 × 0.70 = 6.281e-4.",
          detail:
            "The alarm's false-positive row: nothing happened, yet its 0.001 spontaneous trip rate fires it, and the neighbors call. 0.999 · 0.998 = 0.997002; × 0.001 = 9.97002e-4; × 0.63 = 6.281e-4. Notice: this row — not any burglary row — is the single largest row of the entire enumeration. The computation of 'how likely is a burglary?' is dominated, term by term, by the world where nothing happened and the alarm went off anyway.",
        },
        {
          text: "¬B branch, row (E=f, A=f): 0.999 × 0.998 × 0.999 × 0.05 × 0.01 = 4.980e-4.",
          detail:
            "Nothing happened, no alarm — and both neighbors call anyway: 0.05 · 0.01 = 5e-4 of pure noise riding on a near-certain prior. A THIRD of the branch. Branch total: 3.650e-4 + 7.093e-7 + 6.281e-4 + 4.980e-4 = 1.492e-3. Compact form: 0.999 · [0.002 · 0.29 + 0.998 · 0.001] · 0.63 + 0.999 · [0.002 · 0.71 + 0.998 · 0.999] · 0.0005 = 9.931e-4 + 4.987e-4 = 1.492e-3.",
        },
        {
          text: "Normalize: P(B | j, m) = 5.922e-4 / (5.922e-4 + 1.492e-3) = 0.000592 / 0.002084 = 0.2842.",
          detail:
            "The denominator 0.002084 is P(J=t, M=t) — the evidence's total mass, from every cause. In f-06's odds form: the likelihood ratio P(j,m | B=t) / P(j,m | B=f) = 0.5922 / 0.001493 ≈ 397, so the calls are close to decisive evidence — but the prior odds were 1:999, and 397:999 gives posterior odds ≈ 0.40, i.e. P ≈ 0.284. Both witnesses together buy a 284-fold rise (0.001 → 0.284) and no more.",
        },
      ],
      result:
        "P(Burglary | JohnCalls = t, MaryCalls = t) ≈ 0.284 — two witnesses believed, the base rate respected, and the alarm's false-positive mass honestly counted.",
    },
    {
      kind: "pythonImpl",
      title: "The full enumeration, row by row",
      intent:
        "Print every row of both branches of P(Burglary | JohnCalls = t, MaryCalls = t) and normalize — the example's arithmetic, executed and verified.",
      code: `# P(Burglary | JohnCalls=t, MaryCalls=t) by enumeration -- row by row.
# CPTs: the canonical alarm-network numbers from f-07.
P_B = {True: 0.001, False: 0.999}
P_E = {True: 0.002, False: 0.998}
CPT_A = {(True,  True):  {True: 0.95, False: 0.05},
         (True,  False): {True: 0.94, False: 0.06},
         (False, True):  {True: 0.29, False: 0.71},
         (False, False): {True: 0.001, False: 0.999}}
P_J = {True: 0.90, False: 0.05}   # P(JohnCalls = t | Alarm)
P_M = {True: 0.70, False: 0.01}   # P(MaryCalls = t | Alarm)

def row(b, e, a):
    """One joint row: P(B=b, E=e, A=a, J=t, M=t) -- five CPT factors."""
    return P_B[b] * P_E[e] * CPT_A[(b, e)][a] * P_J[a] * P_M[a]

def t(v):
    return "t" if v else "f"

totals = {}
for b in (True, False):
    print(f"B={t(b)} branch   P(B={t(b)}) = {P_B[b]}:")
    total = 0.0
    for e in (True, False):
        for a in (True, False):
            p = row(b, e, a)
            total += p
            print(f"  E={t(e)}, A={t(a)}: {P_B[b]} * {P_E[e]} * {CPT_A[(b, e)][a]}"
                  f" * {P_J[a]:.2f} * {P_M[a]:.2f} = {p:.3e}")
    totals[b] = total
    print(f"  branch total = {total:.3e}")

num = totals[True]
den = totals[True] + totals[False]
print()
print(f"P(B | J=t, M=t) = {num:.6f} / {den:.6f} = {num / den:.4f}")`,
      output: `B=t branch   P(B=t) = 0.001:
  E=t, A=t: 0.001 * 0.002 * 0.95 * 0.90 * 0.70 = 1.197e-06
  E=t, A=f: 0.001 * 0.002 * 0.05 * 0.05 * 0.01 = 5.000e-11
  E=f, A=t: 0.001 * 0.998 * 0.94 * 0.90 * 0.70 = 5.910e-04
  E=f, A=f: 0.001 * 0.998 * 0.06 * 0.05 * 0.01 = 2.994e-08
  branch total = 5.922e-04
B=f branch   P(B=f) = 0.999:
  E=t, A=t: 0.999 * 0.002 * 0.29 * 0.90 * 0.70 = 3.650e-04
  E=t, A=f: 0.999 * 0.002 * 0.71 * 0.05 * 0.01 = 7.093e-07
  E=f, A=t: 0.999 * 0.998 * 0.001 * 0.90 * 0.70 = 6.281e-04
  E=f, A=f: 0.999 * 0.998 * 0.999 * 0.05 * 0.01 = 4.980e-04
  branch total = 1.492e-03

P(B | J=t, M=t) = 0.000592 / 0.002084 = 0.2842`,
      walkthrough: [
        "`row(b, e, a)` is one assignment's product — five factors, each looked up from the CPT the graph names; nothing is ever computed, only read.",
        "The loops make the hidden variables explicit: E and A both ways, under each branch of the query — eight rows, the whole of P(J=t, M=t), on the table.",
        "The ¬B branch's biggest row is (E=f, A=t) — the alarm's 0.001 spontaneous trip — and its (E=f, A=f) row (both neighbors calling with no alarm at all) is a third of the branch: 'negligible' is a verdict the arithmetic renders, not one you grant in advance.",
        "Normalization is the last line: the two branch totals are joint masses P(B, j, m) and P(¬B, j, m); dividing by their sum is what turns them into a posterior.",
        "0.2842 — the same number f-07's compact program printed, now with every term inspectable: change one CPT entry and you can trace exactly which rows move.",
      ],
      project:
        "The Diagnostic Advisor's extension asks for exactly this computation attached to one rule's conclusion — the network answering WHY in numbers.",
    },
    {
      kind: "bayesNet",
      title: "The alarm network, query highlighted",
      nodes: [
        { id: "B", label: "Burglary", parents: [], states: ["t", "f"], x: 25, y: 15, showCpt: true },
        { id: "E", label: "Earthquake", parents: [], states: ["t", "f"], x: 75, y: 15, showCpt: true },
        { id: "A", label: "Alarm", parents: ["B", "E"], states: ["t", "f"], x: 50, y: 50, showCpt: true },
        { id: "J", label: "JohnCalls", parents: ["A"], states: ["t", "f"], x: 22, y: 86, showCpt: true },
        { id: "M", label: "MaryCalls", parents: ["A"], states: ["t", "f"], x: 78, y: 86, showCpt: true },
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
      query: "P(Burglary | JohnCalls = t, MaryCalls = t)",
      answer: "≈ 0.284 — every term shown above: the eight rows are exactly this graph's CPTs, evaluated and summed.",
      independences: [
        "B ⊥ E marginally — the two priors multiply independently into every row",
        "J ⊥ M given A — the calls enter every A=t row as the single factor 0.90 · 0.70 = 0.63",
        "B and E become dependent once A (or its children) are observed — explaining away: the two branches are literally competing for the same evidence mass",
      ],
      caption:
        "Query: B, asked. Evidence: J = t and M = t, observed. Hidden: E and A, summed out — the enumeration walks this exact graph, one product per assignment. Split the evidence mass by world instead of by branch and the posterior map reads: burglary 28.4%, earthquake 17.6%, neither 54.0% — exercise f-08-e2 does that split by hand.",
    },
    {
      kind: "complexity",
      title: "The cost of exactness",
      rows: [
        {
          algorithm: "Enumeration inference",
          best: "O(n) — when every hidden variable is d-separated from the query, the sum collapses to one product",
          average: "problem-dependent — independence collapses sums unpredictably",
          worst: "O(n · 2^h) — h hidden binary variables: 2^h rows, each a product of n CPT lookups",
          space: "O(n) — one row at a time",
          note: "exact, always; the row count is the adversary — 30 hidden binary variables means a billion rows",
          highlight: true,
        },
        {
          algorithm: "Variable elimination",
          best: "O(n) on chains and trees",
          average: "polynomial for networks of bounded tree width",
          worst: "exponential in the tree width — the largest intermediate factor",
          space: "exponential in tree width (the cached factors)",
          note: "sums out one hidden variable at a time and reuses the work — the 0.63 pulled out of the branch sums above was this move in miniature",
        },
        {
          algorithm: "Likelihood weighting (sampling)",
          best: "O(n) per sample",
          average: "O(n · N) for N samples — error shrinks like 1/√N",
          worst: "O(n · N) with N huge when evidence is rare (most samples carry almost no weight)",
          space: "O(n)",
          note: "approximate by design: exactness traded for tractability; Gibbs sampling and MCMC are its cousins",
        },
      ],
      reading:
        "Enumeration is the honest baseline — exact, inspectable, exponential. The field's escape routes are named here, not taught: variable elimination (still exact; exploits the same independences smarter by summing one variable out at a time) and the sampling family — likelihood weighting, Gibbs sampling — (approximate; scales where exact methods drown). When a deployed system shows you a posterior, one of the three produced it, and which one determines the guarantee you are owed.",
    },

    // ------------------------------------------------------------ the legacy
    { kind: "heading", text: "From certainty factors to probabilistic expert systems" },
    {
      kind: "text",
      text: "Stanford, early 1970s: MYCIN, a rule-based advisor for therapy of bacteremia — blood infection — built from a few hundred production rules (counts in the literature run roughly 450 to 600 as the system grew). Everything you studied in this part's first module is in it: working memory, IF–THEN rules fired by the recognize-act cycle, backward chaining toward therapy goals, and the WHY/HOW explanation that let a clinician interrogate every conclusion. But bacteremia is noisy: the same culture findings support several organisms, evidence arrives in degrees, and an all-or-nothing rule cannot say *probably*. MYCIN's answer was the certainty factor — each conclusion tagged with a number between −1 and +1, combined by plausible rules of thumb. As engineering it was pragmatic shorthand that captured how experts talked; as mathematics it was ungrounded: the combination rules could contradict the probability axioms, conclusions could shift with the order rules fired, and independence was silently assumed wherever the formulas multiplied. Those are not aesthetic complaints. A number that can mean anything means nothing — and the whole point of advising a clinician is that the number means something.",
    },
    {
      kind: "text",
      text: "The repair is exactly the last three lessons. The probability axioms (f-05) give degrees of belief their arithmetic; Bayes' rule (f-06) makes evidence revise them honestly — the base-rate computation that certainty factors could only gesture at; the Bayesian network (f-07) drags the independence assumption into the open, as a DAG whose missing edges are claims you can argue with. Read the alarm network as a repaired expert system: where a rule would have concluded burglary outright — or attached a certainty factor with no semantics — the CPT states the alarm's behavior row by row, and eight products compete to explain the evidence. The posterior 0.2842 is what a certainty factor wanted to be: a degree of belief that means exactly what the axioms say it means. And the part of MYCIN that needed no repair is the part to notice: the explanation trace. The enumeration prints every row; d-separation tells you which variables the answer ignores and why. That demand — a conclusion must show its work — ran through the medical expert systems as they turned probabilistic, and it runs through every diagnostic, filtering and tracking system with Bayes in its name today. The formalism changed; the audit trail survived. That survival is the expert-system legacy.",
    },

    // ------------------------------------------------------------ the synthesis
    { kind: "heading", text: "One discipline, four formalisms" },
    {
      kind: "table",
      title: "The school in one table",
      headers: ["Arc", "Formalism", "What you built", "The world it fits"],
      rows: [
        [
          "J1–J3 · search, games, constraints",
          "State spaces, heuristics, adversarial trees, constraint networks",
          "A* proving 418 on the Romania map; minimax with α-β, where pruning never changes the move, only the work; the Australia map colored by backtracking, placements / rejections / retreats counted",
          "Combinatorial — too many configurations to enumerate, one optimal answer to find",
        ],
        [
          "J4 · logic",
          "Propositions, predicates, resolution",
          "Truth tables refuting the classic fallacies; a resolution prover that saturates honestly on non-theorems; unification and its most general unifier",
          "Exact — facts hold or do not, and answers must be proved",
        ],
        [
          "J5 · planning",
          "STRIPS operators, searched forward and back",
          "The three-step plan through the Sussman anomaly (C from A to the table, B onto C, A onto B); planning-graph mutexes guiding extraction",
          "Sequential — actions order, interfere, and must compose",
        ],
        [
          "J6 · probability",
          "Degrees of belief, factorized over a DAG",
          "The base-rate computation (17%, not 99%); the alarm network's 0.2842 by enumeration, every row printed",
          "Noisy — evidence misleads by measurable, weighable amounts",
        ],
      ],
      caption:
        "One discipline — knowledge stated formally, then processed by algorithms whose guarantees are argued and measured — in four formalisms. The world decides which you reach for: combinatorial worlds yield to search, exact worlds to proof, sequential worlds to planning, noisy worlds to conditioning. And one spine held all six parts: every conclusion shows its work — the A* trace's f-values, the prover's resolvents, the planner's mutex citations, the chainer's fired rules, the enumeration's eight rows. The three exercises below close the account: two computations and one judgment.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "f-08-e1",
      exerciseKind: "predict-output",
      prompt:
        "This lesson's enumeration with the query swapped: B and E exchange roles, so the program sums over the hidden Burglary and Alarm while the Earthquake is the query — P(Earthquake | JohnCalls = t, MaryCalls = t). Predict its exact final line before running it. Hint: the E branch's dominant row is (B=f, A=t): 0.999 × 0.002 × 0.29 × 0.63 ≈ 3.650e-4, and the denominator is the same 0.002084 you computed for P(B | j, m) — the evidence's total mass does not care which variable you asked about.",
      starter: `# The same enumeration, query swapped: P(Earthquake | J=t, M=t).
P_B = {True: 0.001, False: 0.999}
P_E = {True: 0.002, False: 0.998}
CPT_A = {(True,  True):  {True: 0.95, False: 0.05},
         (True,  False): {True: 0.94, False: 0.06},
         (False, True):  {True: 0.29, False: 0.71},
         (False, False): {True: 0.001, False: 0.999}}
P_J = {True: 0.90, False: 0.05}
P_M = {True: 0.70, False: 0.01}

def row(b, e, a):
    return P_B[b] * P_E[e] * CPT_A[(b, e)][a] * P_J[a] * P_M[a]

def branch(e):
    return sum(row(b, e, a) for b in (True, False) for a in (True, False))

num = branch(True)
den = branch(True) + branch(False)
print(f"P(E | J=t, M=t) = {num:.6f} / {den:.6f} = {num / den:.4f}")`,
      expectedOutput: `P(E | J=t, M=t) = 0.000367 / 0.002084 = 0.1761`,
      solution:
        "E branch: 1.197e-6 (B=t, A=t) + 5.000e-11 (B=t, A=f) + 3.650e-4 (B=f, A=t) + 7.093e-7 (B=f, A=f) = 3.669e-4 → printed as 0.000367. ¬E branch: 5.910e-4 + 2.994e-8 + 6.281e-4 + 4.980e-4 = 1.717e-3. Posterior = 0.000367 / 0.002084 = 0.1761.",
      explanation:
        "The same eight rows, regrouped: the posterior over E divides by the identical denominator P(j, m) = 0.002084, because normalization sums over the query's values — it is a property of the evidence, not of the question. The quake's belief rises 0.002 → 0.176, an 88-fold jump: the calls are evidence for the earthquake too. But the two causes compete — P(B | j,m) + P(E | j,m) = 0.284 + 0.176 = 0.460, well under 1, and the world where BOTH are true holds about 0.06% of the mass. That is explaining away in numbers: each cause individually soaks up the evidence; jointly they cannot. The collider at A, priced.",
      concepts: ["enumeration inference", "normalization", "explaining away"],
    },
    {
      kind: "exercise",
      id: "f-08-e2",
      exerciseKind: "trace",
      prompt:
        "Take the eight rows of the main computation and re-group them by (Burglary, Earthquake) world instead of by branch: each world's mass is its two rows summed (A=t plus A=f). Compute the four world probabilities by dividing by 0.002084, check that they sum to 1, then answer: which world most likely produced both calls, and which single row carries the larger share of that world's mass?",
      solution:
        "(B=t, E=f): 5.910e-4 + 2.994e-8 ≈ 5.910e-4 → 5.910e-4 / 0.002084 = 0.2836 (28.4%). (B=f, E=t): 3.650e-4 + 7.093e-7 = 3.657e-4 → 0.1755 (17.6%). (B=f, E=f): 6.281e-4 + 4.980e-4 = 1.126e-3 → 0.5403 (54.0%). (B=t, E=t): 1.197e-6 + 5.000e-11 ≈ 1.197e-6 → 0.0006 (0.06%). Sum: 0.2836 + 0.1755 + 0.5403 + 0.0006 = 1.0000 ✓. The most likely world behind both phone calls is NOTHING: no burglary, no earthquake — 54.0%, split between the alarm's spontaneous 0.001 trip (6.281e-4, the larger share) and both neighbors calling with no alarm at all (4.980e-4). Burglary is second at 28.4%; the quake explains 17.6%; both together, 0.06%.",
      explanation:
        "The posterior over B (0.284) plus the posterior over E (0.176) never needed to sum to 1 — they are margins of this joint four-way map, and the neither-world owns the remainder. 'The most probable explanation of both calls is that nothing happened' is the base-rate lesson wearing the network's clothes — and it is the number a certainty factor could never have produced, because computing it requires the two causes to compete.",
      concepts: ["enumeration inference", "base rates", "explaining away"],
    },
    {
      kind: "exercise",
      id: "f-08-e3",
      exerciseKind: "concept-check",
      prompt:
        "A hospital wants a ward advisory system. Symptoms are noisy indicators — the same pattern fits several conditions with different frequencies — and the clinical governance board insists every conclusion ship with a full audit of how it was reached. Which formalism from this school fits best, and why?",
      options: [
        {
          text: "STRIPS-style planning — diagnosis is a sequence of tests and treatments, and operators capture that",
          correct: false,
          feedback:
            "Test sequencing is indeed a planning problem, but it sits downstream: first you must decide what to BELIEVE, and planning has no numbers for noisy evidence — an operator's preconditions either hold or do not.",
        },
        {
          text: "A Bayesian network — degrees of belief revised by conditioning, independence explicit in the DAG, every posterior computable row by row: exactly the audit the board demands",
          correct: true,
          feedback:
            "Correct — and you have already built the prototype: the alarm network IS a ward advisor in miniature, with the 0.2842 computation as its audit trail. This is the expert-system legacy's endpoint.",
        },
        {
          text: "Resolution theorem proving — symptoms entail diseases, and a proof is the strongest audit there is",
          correct: false,
          feedback:
            "Entailment is all-or-nothing: under noise, the strongest true statement is usually 'this disease makes these symptoms 70% likely', which no clause can express. The prover's audit is genuine — for a world that is exact (J4).",
        },
        {
          text: "Constraint satisfaction — conditions as variables with domains, exclusion constraints between them",
          correct: false,
          feedback:
            "A CSP answers feasible or infeasible — it cannot say 28%, and 28% was precisely the honest answer to the alarm question. Constraint reasoning is the right tool when the world is combinatorial but noiseless.",
        },
      ],
      solution:
        "The noisy world is probability's world — but the decisive phrase in the problem is the audit requirement: that demand is MYCIN's lasting contribution, and the Bayesian network is the formalism that kept it while giving its numbers semantics.",
      explanation:
        "Formalism choice is the school's real final exam: match the formalism to the world's shape — combinatorial, exact, sequential, noisy — and, when humans must trust the output, demand the trace.",
      concepts: ["expert-system legacy", "formalism choice", "independence"],
    },
  ],
  terms: [
    {
      term: "enumeration inference",
      definition:
        "Exact posterior computation: fix the evidence, multiply CPT factors for every complete assignment of the hidden variables, sum, normalize — O(n · 2^h) in the worst case, inspectable always.",
    },
    {
      term: "independence",
      definition:
        "The license to multiply and to ignore: two variables are independent when learning one moves belief about the other not at all; conditional independence (J ⊥ M | A) is what keeps CPTs small and hidden sums collapsible.",
    },
    {
      term: "variable elimination",
      definition:
        "The exact upgrade over enumeration: sum out one hidden variable at a time and cache the intermediate factors — exponential only in the network's tree width. Named here; learned next.",
    },
    {
      term: "expert-system legacy",
      definition:
        "The arc from MYCIN's rules and certainty factors to today's probabilistic expert systems: semantics for degrees of belief, independence made explicit — and the explanation trace that survived the formalism change.",
    },
  ],
  mistakes: [
    {
      mistake: "Reporting a branch total as the answer.",
      why: "F-07 deliberately computed only the B branch (5.922e-4) and stopped; a posterior needs BOTH branches and the division — 5.922e-4 is a joint mass, not a belief, and it is not even normalized.",
      fix: "Write the normalization line before any multiplication — P(B | j,m) = P(B, j,m) / [P(B, j,m) + P(¬B, j,m)] — then compute both branches.",
    },
    {
      mistake: "Pruning 'negligible' rows by intuition.",
      why: "In the B branch the A=f rows are noise (5.000e-11, 2.994e-8); in the ¬B branch the A=f row (4.980e-4) is a THIRD of the mass — negligibility depends on the prior a row rides on, not on the row's raw size.",
      fix: "Let the arithmetic decide: drop rows only with a stated bound (say, below 1% of the branch total), and check the bound after summing.",
    },
    {
      mistake: "Treating the example's speed as enumeration's speed.",
      why: "Eight rows is a toy; the count is 2^h, so 30 hidden binary variables means a billion rows. The factorization saves stored numbers, not the worst-case summation.",
      fix: "Count the hidden assignments before promising an answer; at scale, reach for variable elimination or sampling — named in this lesson, learned next.",
    },
    {
      mistake: "Reading 0.284 as 'unlikely — ignore the burglary'.",
      why: "A posterior is a degree of belief, not a verdict: 0.284 against a prior of 0.001 is a 284-fold rise — overwhelming evidence that still falls short of near-certainty because the prior odds were 1:999.",
      fix: "Report posterior against prior (or the likelihood ratio against the alternative); what to DO with 0.284 is a decision problem — the cost of a missed burglary against the cost of a false one — that the number alone cannot settle.",
    },
  ],
  takeaways: [
    "Enumeration inference: P(X | e) ∝ Σ_hidden Π P(node | parents) — exact, every term inspectable; on the alarm network, 0.000592 / 0.002084 = 0.2842.",
    "The compact branch forms pull the calls' 0.63 out of the hidden sum — variable elimination in miniature, and the field's escape from 2^h.",
    "Enumeration is exponential in the hidden variables in the worst case; variable elimination and the sampling methods are the named next steps.",
    "The expert-system legacy: certainty factors were pragmatic shorthand without semantics; the repair — probability axioms, Bayes' rule, explicit independence — kept the explanation trace.",
    "One discipline, four formalisms: search for combinatorial worlds, logic for exact ones, planning for sequential ones, probability for noisy ones — every conclusion showing its work.",
  ],
  quiz: [
    {
      id: "f-08-q1",
      prompt: "Both neighbors called, yet P(Burglary | j, m) ≈ 0.284 — under one half. Why?",
      options: [
        {
          text: "The network doubts the neighbors' reliability",
          correct: false,
          feedback:
            "It does not: 0.90 and 0.70 are strong likelihoods, honored at full weight in every row. The witnesses are believed completely.",
        },
        {
          text: "Priors compete multiplicatively with likelihoods: the burglary branch masses 5.922e-4, while the ¬B branch — the alarm's 0.001 false trip plus the neighbors' 0.05·0.01 noise on a 0.999 prior — totals 1.492e-3, the larger share",
          correct: true,
          feedback:
            "Correct — in odds form: likelihood ratio ≈ 397 (near-decisive evidence) against prior odds 1:999, leaving posterior odds ≈ 0.40. Both witnesses bought a 284-fold rise and no more.",
        },
        {
          text: "Enumeration approximates, and 0.284 reflects the approximation error",
          correct: false,
          feedback:
            "Enumeration is exact — the eight rows are the whole computation, and the program reproduces 0.2842 to the digit.",
        },
        {
          text: "The earthquake explains the calls instead",
          correct: false,
          feedback:
            "The quake's own posterior is 0.176 — smaller than burglary's 0.284 — and the largest single world is NEITHER cause, at 54% (exercise f-08-e2). No rival wins outright; the no-cause rows collectively outweigh the burglary rows.",
        },
      ],
      explanation:
        "Strong evidence, stronger prior — f-06's lesson at the network's scale: the likelihood ratio ≈ 397 meets prior odds 1:999, and the posterior is their honest product, 0.284.",
    },
    {
      id: "f-08-q2",
      prompt: "Enumeration on a network with h hidden binary variables costs, in the worst case:",
      options: [
        {
          text: "Time exponential in h — O(n · 2^h) rows in the worst case; variable elimination and sampling exist to escape it",
          correct: true,
          feedback:
            "Correct — exact and exponential-worst-case: the trade that motivated the field's next forty years of inference work (both escape routes named in this lesson, taught later).",
        },
        {
          text: "Polynomial — the factorization saves the summation too",
          correct: false,
          feedback:
            "The factorization saves stored NUMBERS (n · 2^k instead of 2^n); when the hidden variables all bear on the query, every assignment still gets summed.",
        },
        {
          text: "Linear in the CPT sizes",
          correct: false,
          feedback:
            "Each row is cheap to price; the row COUNT is the adversary.",
        },
        {
          text: "Undecidable in general",
          correct: false,
          feedback:
            "Always decidable and exact — just potentially expensive. Decidability is logic's limit (J4), not probability's.",
        },
      ],
      explanation:
        "O(n · 2^h) worst case, exact always: the honest baseline that variable elimination (exact, tree-width-bounded) and sampling (approximate, scalable) improve on.",
    },
    {
      id: "f-08-q3",
      prompt: "What did the probabilistic repair give the expert-system idea that certainty factors lacked?",
      options: [
        {
          text: "Faster inference on large rule bases",
          correct: false,
          feedback:
            "Speed was never the complaint: certainty-factor arithmetic is trivially cheap. The complaint was semantic — the numbers did not mean anything in particular.",
        },
        {
          text: "Degrees of belief grounded in the probability axioms, revised by Bayes' rule, with independence made explicit and inspectable in the DAG",
          correct: true,
          feedback:
            "Correct — three lessons in one sentence: f-05's axioms, f-06's conditioning, f-07's graph. The alarm network's 0.2842 is a certainty factor that finally means something.",
        },
        {
          text: "Freedom from knowledge engineering — no more interviewing experts",
          correct: false,
          feedback:
            "The knowledge acquisition bottleneck survived the formalism change: CPT numbers are still elicited from domain experts, one small table at a time.",
        },
        {
          text: "The explanation trace — conclusions you can interrogate",
          correct: false,
          feedback:
            "MYCIN already had that; it is the part that needed no repair and SURVIVED the formalism change — the legacy's gift, not the repair's.",
        },
      ],
      explanation:
        "Semantics, conditioning, explicit structure — and the trace carried over. Knowing which property was the repair and which was the survivor is the whole legacy lesson.",
    },
  ],

};
