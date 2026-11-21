/**
 * PART_F_EXERCISES — the tiered practice battery for Part F (8 exercises:
 * 3 basic, 3 intermediate, 2 advanced), spanning both modules: production
 * rules and chaining (module 1), probability and networks (module 2).
 * f-b1, f-i1, f-a1 are the original delivery's items, kept verbatim;
 * f-b2, f-b3, f-i2, f-i3, f-a2 were added at full registry depth.
 * Every expectedOutput below is the REAL stdout of running the code.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_F_EXERCISES: Exercise[] = [
  {
    id: "f-b1",
    tier: "beginner",
    title: "The recognize-act cycle, by hand",
    prompt:
      "Facts: {a, b}; rules: R1: a ∧ b → c; R2: c → d; R3: b ∧ d → e. Trace the forward chain with FIFO firing order (oldest matched rule first, ties by rule id). List the firings in order and the final working memory.",
    hint: "Cycle 1 matches only R1. Then the cascade begins.",
    solution: `Cycle 1: conflict {R1} → fire R1, add c.
Cycle 2: conflict {R2, R3? — R3 needs d, not yet} → {R2} → add d.
Cycle 3: conflict {R3} → add e.
Cycle 4: nothing new matches — quiescence.
Firings: R1, R2, R3. Final memory: {a, b, c, d, e}. The cascade shape — each firing licensing the next — is the archetypal forward chain.`,
    concepts: ["recognize-act cycle", "quiescence"],
  },
  {
    id: "f-b2",
    tier: "beginner",
    title: "Recency flips the firing order",
    prompt:
      "Below is the f-02 forward chainer on a minimal rule base: facts {a, b}; R1: b → x; R2: a → y; R3: x → z. The strategy is specificity, then recency (newest condition), then rule order — and all initial facts tie at arrival 0. BEFORE running it, predict the full firing order; then run the starter and check yourself against its real stdout. Why is the order not R1, R2, R3?",
    hint: "Once R1 fires, x is one cycle old while a has been sitting there since the start. What does the recency tiebreak do with that difference?",
    starter: `RULES = [
    ("R1", ["b"], "x"),
    ("R2", ["a"], "y"),
    ("R3", ["x"], "z"),
]
FACTS = ["a", "b"]

wm = dict.fromkeys(FACTS, 0)          # fact -> arrival index
fired = set()
while True:
    matches = [(rid, conds) for rid, conds, _ in RULES
               if all(c in wm for c in conds) and rid not in fired]
    if not matches:
        break
    rid, conds = max(matches, key=lambda m: (len(m[1]), max(wm[c] for c in m[1])))
    _, _, conclusion = next(r for r in RULES if r[0] == rid)
    print(f"fire {rid} => {conclusion}")
    wm[conclusion] = len(wm)
    fired.add(rid)
print("quiescence")`,
    expectedOutput: `fire R1 => x
fire R3 => z
fire R2 => y
quiescence`,
    solution: `R1, R3, R2 — not rule order. Cycle 1: {R1, R2}, both one condition, both recency 0 — rule order fires R1, deriving x (arrival 2). Cycle 2: {R2 (recency 0), R3 (its condition x has arrival 2)} — specificity ties at one condition, and RECENCY promotes R3: the freshly derived fact outranks the stale one. Cycle 3: R2 finally fires; cycle 4: quiescence. The lesson: recency makes the trace data-flow-shaped — conclusions about fresh news beat conclusions about old news, whatever their rule numbers say.`,
    concepts: ["recency", "conflict resolution", "quiescence"],
  },
  {
    id: "f-b3",
    tier: "beginner",
    title: "A posterior, predicted then run",
    prompt:
      "A condition has 4% prevalence in the screened population. A test catches it with 90% sensitivity and has a 10% false-positive rate. A random-screened patient tests positive. BEFORE running the starter, predict the three printed numbers (numerator, denominator, posterior to four decimals); then run it. Then explain in one sentence why the posterior is so much lower than the sensitivity.",
    hint: "The denominator has two terms. The second one is the false-positive mass over the 96% healthy majority.",
    starter: `prior, sens, fpr = 0.04, 0.90, 0.10
num = sens * prior
den = num + fpr * (1 - prior)
print(f"{num:.3f} / {den:.3f} = {num/den:.4f}")`,
    expectedOutput: "0.036 / 0.132 = 0.2727",
    solution: `0.036 / 0.132 = 0.2727. Numerator: 0.90 × 0.04 = 0.036 (true positives). Denominator: 0.036 + 0.10 × 0.96 = 0.036 + 0.096 = 0.132 — the false-positive mass over the healthy 96% is 2.7 times the true-positive mass. Posterior ≈ 27%: the f-06 medical example's structure (0.0099/0.0594 ≈ 17%) with friendlier numbers, same lesson — the base rates outvote the test's accuracy, and P(+|D) = 0.90 was never the probability of D given +.`,
    concepts: ["Bayes' rule", "base rates", "posterior"],
  },
  {
    id: "f-i1",
    tier: "intermediate",
    title: "Two strategies, two verdicts",
    prompt:
      "Facts: {p, q, r, s}; rules: R1: p ∧ q → t; R2: r → t; R3: t ∧ s → u; R4: p ∧ r → v (and v CONFLICTS with u — say a monitoring rule that halts on v). Trace with (a) specificity-then-rule-order and (b) recency-then-rule-order (all initial facts tie at arrival 0). Which strategy halts the system, and why is the difference semantic, not stylistic?",
    hint: "Both R1 and R2 produce t. Specificity prefers R1 (2 conditions over 1); recency ties at 0, so rule order picks R1 (listed first). The divergence is downstream — check what fires before what around R4.",
    solution: `(a) Specificity: cycle 1 conflict {R1 (2 conds), R2 (1), R4 (2)} — R1 and R4 tie on 2; rule order fires R1, add t. Cycle 2: conflict {R3 (2), R4 (2), R2 (1)} → R3, add u. Cycle 3: {R4} → add v. v arrives after u: the halt rule (if it fires on v present) finds u already derived — the system concluded AND flagged.
(b) Recency (all initial facts tie at 0, so rule order decides): cycle 1 {R1, R2, R4} → R1 (first), add t. Cycle 2: {R2 (r is initial, 0), R3 (t is recent!), R4} — recency: R3's newest condition t (arrival 1) beats R2 and R4's 0 → R3, add u. Cycle 3: R4, add v. Same endpoint here — BUT if the halt rule were 'on v, STOP (never fire R3)', strategy (a)'s early R4 (possible if R4 outranked R3 in tie-break priority) would suppress u. The general point: strategies order the conflict set, and ordering changes which conclusions exist when halting conditions fire. THAT is semantics: the strategy decides what the system concluded, not just how fast.`,
    concepts: ["conflict resolution", "strategy semantics"],
  },
  {
    id: "f-i2",
    tier: "intermediate",
    title: "A backward chainer, with the WHY trace",
    prompt:
      "Implement backward chaining with a WHY-style trace. Rule base: R1: a ∧ b → c; R2: c → d; R3: d → e. Facts: {a, b}. The goal is e. Your prove(goal, depth) must print, indented two spaces per depth: 'goal G: try R (needs ...)' when it recurses through rule R, and 'goal G: fact' at a fact leaf — then the driver prints 'PROVEN e' (or 'NOT PROVEN e'). The starter has the signature and the print contract; your solution must produce exactly the expected output. Then answer: which single line of your recursion is the unprovable-leaf base case's twin — the one that would print if no rule concludes the goal?",
    hint: "Two base cases: goal in FACTS (success) and no rule concludes the goal (failure). The failure print belongs after the loop over rules, at the same depth as the goal it could not prove.",
    starter: `RULES = [
    ("R1", ["a", "b"], "c"),
    ("R2", ["c"], "d"),
    ("R3", ["d"], "e"),
]
FACTS = {"a", "b"}

def prove(goal, depth=0):
    pad = "  " * depth
    # TODO: if goal is a fact -> print f"{pad}goal {goal}: fact"; return True
    # TODO: for each rule concluding goal: print f"{pad}goal {goal}: try {rid} (needs {', '.join(conds)})"
    #       and recurse on every condition; if all succeed, return True
    # TODO: no rule worked -> print f"{pad}goal {goal}: unprovable"; return False
    ...

print("PROVEN e" if prove("e") else "NOT PROVEN e")`,
    expectedOutput: `goal e: try R3 (needs d)
  goal d: try R2 (needs c)
    goal c: try R1 (needs a, b)
      goal a: fact
      goal b: fact
PROVEN e`,
    solution: `RULES = [
    ("R1", ["a", "b"], "c"),
    ("R2", ["c"], "d"),
    ("R3", ["d"], "e"),
]
FACTS = {"a", "b"}

def prove(goal, depth=0):
    pad = "  " * depth
    if goal in FACTS:
        print(f"{pad}goal {goal}: fact")
        return True
    for rid, conds, conc in RULES:
        if conc == goal:
            print(f"{pad}goal {goal}: try {rid} (needs {', '.join(conds)})")
            if all(prove(c, depth + 1) for c in conds):
                return True
    print(f"{pad}goal {goal}: unprovable")
    return False

print("PROVEN e" if prove("e") else "NOT PROVEN e")

# The twin of the fact base case is the 'goal G: unprovable' line after the
# rule loop — the failure leaf. Ask for f (no rule concludes it, not a fact)
# and the trace prints one line and returns False: 'goal f: unprovable'. That
# is the goal-driven counterpart of f-02's data-flow gate: no strategy of the
# forward engine can derive what nothing licenses, and no recursion of this
# one can prove what nothing concludes. The depth-keyed indentation IS the
# goal stack — MYCIN's WHY display, in miniature.`,
    concepts: ["backward chaining", "goal tree", "explanation trace"],
  },
  {
    id: "f-i3",
    tier: "intermediate",
    title: "Reading independence off a diamond",
    prompt:
      "A network with four binary variables: A → B, A → C, B → D, C → D (a diamond). (a) List every independence the DAG asserts, with the pattern (chain / common cause / collider) that licenses each. (b) What does observing D = true do to B and C — marginally and given A? (c) A colleague proposes adding an edge B → C 'to be safe'. Argue them out of it in two sentences.",
    hint: "Paths between B and C: B ← A → C (common cause) and B → D ← C (collider). One is blocked by A; the other is blocked until D is observed.",
    solution: `(a) B ⊥ C | A — the path B ← A → C is a common cause, blocked by conditioning on A (there is no other open path between them, since B → D ← C is a collider, blocked while D is unobserved). D ⊥ A | {B, C} — both chains A → B → D and A → C → D are blocked by conditioning on their middles. And each of B, C is independent of the other's non-descendants given its parents, trivially. (b) Marginally B and C are DEPENDENT (common cause A) — but given A they are independent. Observing D = true OPENS the collider B → D ← C: given D, B and C become dependent again even with A known — explaining away (one good explanation of D discounts the other). (c) The proposed edge destroys the very independence the network runs on — B ⊥ C | A is what lets the CPTs of B and C be small and separately elicited — and it buys nothing: the dependence that appears when D is observed is already carried by the collider path. Edges must earn their place as claimed DIRECT influence; 'safety' edges are how a 10-number network becomes a 30-number one with the same semantics.`,
    concepts: ["d-separation", "independence", "collider"],
  },
  {
    id: "f-a1",
    tier: "advanced",
    title: "Enumeration on a two-node network",
    prompt:
      "Network: S → W. P(S=t) = 0.1; P(W=t|S=t) = 0.8, P(W=t|S=f) = 0.3. Compute P(S=t | W=t) by enumeration — write the two products, the denominator, and the posterior. Then state one independence the graph asserts and one it does NOT.",
    hint: "The numerator is P(S=t)·P(W=t|S=t); the denominator adds P(S=f)·P(W=t|S=f).",
    starter: `P_S = 0.1
P_W = {True: 0.8, False: 0.3}
num = P_S * P_W[True]
den = num + (1 - P_S) * P_W[False]
print(f"{num:.3f} / {den:.3f} = {num/den:.4f}")`,
    expectedOutput: "0.080 / 0.350 = 0.2286",
    solution: `num = 0.1 × 0.8 = 0.080. den = 0.080 + 0.9 × 0.3 = 0.080 + 0.270 = 0.350. Posterior = 0.080/0.350 ≈ 0.2286 — about 23%: even a strong likelihood ratio (0.8/0.3 ≈ 2.67) lifts a 10% prior only to 23%, because the prior odds (1:9) outweigh the evidence. Posterior odds = prior odds × likelihood ratio ≈ 0.30 — roughly one chance in four (the f-06 odds arithmetic at work).
Independence asserted: none between S and W — they are directly connected (a CPT row is a dependence). What the graph DOES license: with only two nodes, nothing is hidden, so the only independence claims are trivial. Add a second child of S (say L, a 'lights' node) and the network would assert L ⊥ W | S. The lesson: independence claims live on the MISSING edges.`,
    concepts: ["enumeration inference", "independence"],
  },
  {
    id: "f-a2",
    tier: "advanced",
    title: "Enumeration with two children — evidence compounds",
    prompt:
      "Network: A → B and A → C (a diverging pattern). P(A=t) = 0.2; P(B=t|A=t) = 0.9, P(B=t|A=f) = 0.2; P(C=t|A=t) = 0.7, P(C=t|A=f) = 0.1. Both children are observed true. Compute P(A=t | B=t, C=t) by enumeration with a program that prints the numerator, denominator and posterior in the exact format given by the starter's contract; your solution's stdout must match the expected output. Then verify the answer a second way — by odds: prior odds × the product of the two likelihood ratios — and state what the diverging pattern guarantees about B and C when A is known.",
    hint: "Numerator 0.2 × 0.9 × 0.7. The denominator adds 0.8 × 0.2 × 0.1. For the odds check: LR_B = 0.9/0.2, LR_C = 0.7/0.1.",
    starter: `P_A = 0.2
P_B = {True: 0.9, False: 0.2}   # P(B=t | A)
P_C = {True: 0.7, False: 0.1}   # P(C=t | A)

# TODO: compute by enumeration over A = t, f:
#   num = P(A=t) * P(B=t|A=t) * P(C=t|A=t)
#   den = num + P(A=f) * P(B=t|A=f) * P(C=t|A=f)
# then print in EXACTLY this format:
#   print(f"P(A=t | B=t, C=t) = {num:.6f} / {den:.6f} = {num/den:.4f}")
...`,
    expectedOutput: "P(A=t | B=t, C=t) = 0.126000 / 0.142000 = 0.8873",
    solution: `P_A = 0.2
P_B = {True: 0.9, False: 0.2}
P_C = {True: 0.7, False: 0.1}
num = P_A * P_B[True] * P_C[True]
den = num + (1 - P_A) * P_B[False] * P_C[False]
print(f"P(A=t | B=t, C=t) = {num:.6f} / {den:.6f} = {num/den:.4f}")

# 0.126 / 0.142 = 0.8873. The odds check agrees: prior odds 0.2:0.8 = 1:4;
# LR_B = 0.9/0.2 = 4.5; LR_C = 0.7/0.1 = 7; posterior odds = (1/4) x 4.5 x 7
# = 7.875:1, so p = 7.875/8.875 ~ 0.8873. Two weak-ish witnesses (4.5:1 and
# 7:1) compound to near-certainty — 31.5:1 — because the diverging pattern
# guarantees B independent of C given A: given the hypothesis, the children's
# evidences are independent, so their likelihood ratios legitimately multiply.
# That independence is exactly what f-04's certainty factors assumed silently
# and never earned; here it is a visible, checkable fact about the graph.`,
    concepts: ["enumeration inference", "diverging pattern", "likelihood ratio"],
  },
];
