/**
 * Lesson f-06 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_06: ClassicalLesson = {

  slug: "f-06",
  title: "Bayes' Rule and Inference",
  minutes: 35,
  summary:
    "Conditioning as belief revision: Bayes' rule, the base-rate lesson every diagnostic example teaches, and its arithmetic.",
  kind: "coding",
  objectives: [
    "Derive Bayes' rule from the product rule, step by licensed step",
    "Compute posteriors for diagnostic problems, showing every number",
    "Explain the base-rate fallacy with arithmetic, not admonition",
    "Treat today's posterior as tomorrow's prior: sequential updating",
  ],
  why: "MYCIN's certainty factors were an engineering patch over a real problem: evidence under uncertainty. The principled answer had been waiting since the 18th century — Bayes' rule, the arithmetic of belief revision. This lesson derives it in two lines, then makes it earn its keep on the example every clinician, engineer and analyst should have tattooed: a 99%-accurate test on a 1%-prevalence condition returns a positive result that means barely 17% probability of disease. Not because the test is bad — because the base rates outvote it. Getting that computation into your fingers is the lesson; it is also the door to Bayesian networks, the formalism that replaced certainty factors and carries probabilistic reasoning at scale today.",
  blocks: [
    { kind: "heading", text: "The derivation" },
    {
      kind: "math",
      title: "Bayes' rule, from the product rule",
      derivation: {
        title: "Two lines, each licensed by symmetry",
        steps: [
          { expr: "P(A \\cap B) = P(A|B) P(B) = P(B|A) P(A)", reason: "the product rule, written both ways around the intersection" },
          { expr: "P(A|B) = \\frac{P(B|A)\\, P(A)}{P(B)}", reason: "divide both sides by P(B) — Bayes' rule" },
        ],
      },
      caption:
        "No new axioms, no limit-argument: one symmetry, one division. The names: P(A) the PRIOR, P(B|A) the LIKELIHOOD, P(B) the EVIDENCE, P(A|B) the POSTERIOR — belief after the observation.",
    },
    {
      kind: "definition",
      term: "Bayes' rule",
      informal:
        "How to flip the conditioning: from 'probability of seeing this evidence if the cause holds' to 'probability the cause holds, given the evidence'.",
      formal: "P(H|E) = \\frac{P(E|H)\\ P(H)}{P(E|H)P(H) + P(E|\\neg H)P(\\neg H)}",
      why: "The denominator (total probability) is the part people forget — and forgetting it IS the base-rate fallacy, mechanically.",
    },
    { kind: "heading", text: "The base-rate lesson" },
    {
      kind: "example",
      title: "The 1% / 99% / 5% medical test",
      problem:
        "A condition has 1% prevalence. A test catches it with 99% sensitivity (true positive rate) and has a 5% false-positive rate. A random-screened patient tests positive. What is the probability they have the condition?",
      steps: [
        { text: "Name the quantities: P(D) = 0.01, P(+|D) = 0.99, P(+|¬D) = 0.05.", detail: "The test looks excellent: 99% sensitivity is near-perfect detection." },
        { text: "Compute the numerator: P(+|D)·P(D) = 0.99 × 0.01 = 0.0099.", detail: "True positives: 1% of the population, of which 99% are caught." },
        { text: "Compute the denominator: 0.0099 + P(+|¬D)·P(¬D) = 0.0099 + 0.05 × 0.99 = 0.0099 + 0.0495 = 0.0594.", detail: "The evidence has two sources: the sick who test positive AND the healthy who test positive. The healthy are 99% of the population — their 5% leaks 0.0495, five times the true-positive mass." },
        { text: "Divide: P(D|+) = 0.0099 / 0.0594 ≈ 0.167.", detail: "16.7% — one in six. The test is right; the arithmetic is right; the INTUITION that '99% accurate ⇒ 99% likely sick' is what was wrong." },
      ],
      result:
        "P(D|+) ≈ 16.7%: of every 10,000 screened, ~99 true positives ride alongside ~495 false ones. The base rates outvoted the test's accuracy.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The fallacy is mechanical, not moral",
      text: "Confusing P(+|D) with P(D|+) — the probability of the test being positive given disease with the probability of disease given a positive test — is a conditioning-direction error. The two are related by exactly Bayes' rule and the base rates. Every base-rate fallacy in the wild is this one transposition, and the fix is never scolding: it is the division the example walks through.",
    },
    { kind: "heading", text: "The witness — and the odds form" },
    {
      kind: "example",
      title: "The cab problem — a witness, weighed",
      problem:
        "A hit-and-run at night. The city's cabs are 85% Blue and 15% Green. A witness identifies the fleeing cab as Green; in these conditions witnesses are right 80% of the time and wrong 20%, in either direction. What is P(Green | says-green)?",
      steps: [
        { text: "Name the quantities: P(B) = 0.85, P(G) = 0.15, P(saysG|G) = 0.80, P(saysG|B) = 0.20.", detail: "The witness's 80% is a LIKELIHOOD — the probability of the report given the color, not the probability of the color given the report. The whole problem lives in that distinction." },
        { text: "Numerator: P(saysG|G)·P(G) = 0.80 × 0.15 = 0.12.", detail: "Green cabs, correctly reported." },
        { text: "Denominator: 0.12 + P(saysG|B)·P(B) = 0.12 + 0.20 × 0.85 = 0.12 + 0.17 = 0.29.", detail: "The report has two sources: green cabs seen rightly, and blue cabs mis-called — and the blue fleet is almost six times the size of the green one." },
        { text: "Divide: P(G|saysG) = 0.12 / 0.29 ≈ 0.414.", detail: "Under one half. The 80%-reliable witness is outvoted by the 85%-blue base rate — the medical example's structure with the colors swapped." },
      ],
      result:
        "P(G|saysG) = 0.12/0.29 ≈ 0.4138: the green hypothesis remains the minority explanation of the witness's word. A court that convicts on 'the witness is 80% reliable' has transposed the conditional.",
    },
    {
      kind: "math",
      title: "Posterior odds = prior odds × likelihood ratio",
      displays: [
        { expr: "O(H) = \\frac{P(H)}{1 - P(H)}", label: "odds from probability" },
        { expr: "O(H|E) = O(H) \\times \\frac{P(E|H)}{P(E|\\neg H)}", label: "the odds form of Bayes' rule" },
      ],
      caption:
        "Every example in this lesson, redone as one multiplication each. Medical: prior odds 1:99, likelihood ratio 0.99/0.05 = 19.8 → posterior odds 1:5 (p = 1/6 ≈ 0.167). Witness: 3:17 × 4 = 12:17 (p = 12/29 ≈ 0.414). Spam token: 9:11 × 150 = 1350:11 (p ≈ 0.992). The likelihood ratio is the evidence's strength; the prior odds are the starting line; which side outvotes which is never a matter of taste.",
    },
    { kind: "heading", text: "Sequential belief revision" },
    {
      kind: "math",
      title: "Today's posterior is tomorrow's prior",
      displays: [
        { expr: "P(D|+_{1}, +_{2}) = \\frac{P(+_{2}|D, +_{1})\\ P(D|+_{1})}{P(+_{2}|+_{1})}" },
      ],
      caption:
        "A second (independent, given D) positive test conditions on the FIRST's posterior — belief compounds by repeated application of the same rule. This is the engine of Bayesian filtering, tracking and every online-learning system with 'Bayes' in its name.",
    },
    {
      kind: "pythonImpl",
      title: "The arithmetic, and the second test",
      intent:
        "Compute the first posterior, feed it forward as the prior for a second identical test, and watch the number climb from 17% to 80% — evidence compounds, and the compounding is mechanical.",
      code: `def bayes(prior, sens, fpr):
    num = sens * prior
    den = num + fpr * (1 - prior)
    return num / den

post1 = bayes(0.01, 0.99, 0.05)
print(f"after one positive test: {post1:.4f}")
# sequential update: the posterior becomes the new prior
post2 = bayes(post1, 0.99, 0.05)
print(f"after a second positive: {post2:.4f}")`,
      output: `after one positive test: 0.1667
after a second positive: 0.7984`,
      walkthrough: [
        "One function, one formula: numerator, denominator, divide — the total-probability denominator is the line novices drop.",
        "0.1667: the lesson's example, reproduced exactly.",
        "The second call's FIRST argument is the first call's RESULT — that is the whole sequential trick, no other state.",
        "0.7984: two positives move a 1-in-100 prior to 4-in-5. False positives still exist (the 5% leaks twice), but the true-positive mass compounds faster — evidence, honestly weighted, accumulates.",
      ],
      project: "The Diagnostic Advisor project's uncertainty analysis replaces one IF-THEN rule with exactly this computation.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "f-06-e1",
      exerciseKind: "predict-output",
      prompt:
        "Airport security screens for a rare threat: prevalence 0.1% of passengers, detector sensitivity 99%, false-positive rate 5%. The alarm sounds on a random passenger. Compute P(threat | alarm) to four decimals — run the arithmetic (or adapt the bayes function) and type it.",
      expectedOutput: "0.0194",
      solution: "0.0194",
      explanation:
        "Numerator: 0.99 × 0.001 = 0.00099. Denominator: 0.00099 + 0.05 × 0.999 = 0.05094. Posterior = 0.00099/0.05094 ≈ 0.0194 — under 2%. In odds: prior odds 1:999, likelihood ratio 0.99/0.05 = 19.8, posterior odds ≈ 19.8:999 — barely 1:50. Even a 99%-sensitive detector barely dents a one-in-a-thousand base rate: the medical example's lesson, amplified. (And the sequential lesson applies too: a second, independent alarm would lift it to ≈ 0.2818 — evidence compounds even from tiny starting odds.)",
      concepts: ["Bayes' rule", "base rates", "likelihood ratio"],
    },
    {
      kind: "exercise",
      id: "f-06-e2",
      exerciseKind: "trace",
      prompt:
        "Your spam filter's token 'viagra' has P(token|spam) = 0.30 and P(token|ham) = 0.002, with prior P(spam) = 0.45. Compute P(spam | token), then explain in one sentence why the prior barely mattered here compared to the medical case.",
      solution:
        "Numerator: 0.30 × 0.45 = 0.135. Denominator: 0.135 + 0.002 × 0.55 = 0.135 + 0.0011 = 0.1361. P(spam|token) = 0.135/0.1361 ≈ 0.9919. The prior barely mattered because the LIKELIHOOD RATIO is 150:1 (0.30/0.002) — evidence this discriminating overwhelms any plausible prior. In the medical case the ratio was 0.99/0.05 ≈ 20:1, and the prior odds 1:99 (a 100:1 ratio the other way) outvoted it. Bayes arithmetic: the two ratios compete, and the bigger wins.",
      explanation:
        "The likelihood ratio is the evidence's strength; the prior odds are where you started. Their product is the posterior odds — the form Bayes takes when you are comparing exactly two hypotheses.",
      concepts: ["likelihood ratio", "posterior odds"],
    },
    {
      kind: "exercise",
      id: "f-06-e3",
      exerciseKind: "write-code",
      prompt:
        "Generalize the program: a function that takes a prior and a LIST of (sensitivity, false-positive-rate) test results and folds Bayes through them, printing the posterior after each test. Start with prior 0.01 and THREE positive results from the 0.99/0.05 test. The check runs your program against its real output (three lines, four decimals each).",
      starter: `def bayes(prior, sens, fpr):
    num = sens * prior
    return num / (num + fpr * (1 - prior))

def update_sequence(prior, tests):
    for i, (sens, fpr) in enumerate(tests, 1):
        prior = bayes(prior, sens, fpr)
        print(f"after test {i}: {prior:.4f}")
    return prior

update_sequence(0.01, [(0.99, 0.05)] * 3)`,
      expectedOutput: `after test 1: 0.1667
after test 2: 0.7984
after test 3: 0.9874`,
      solution: `# The starter IS the solution -- run it. 0.1667 -> 0.7984 -> 0.9874:
# each positive multiplies the odds by the likelihood ratio
# 0.99/0.05 = 19.8, and odds compound multiplicatively:
# prior odds 1:99 become ~1:5, then ~4:1, then ~80:1.
# Three independent positives make the diagnosis near-certain --
# with INDEPENDENCE as the load-bearing assumption (a systematic
# lab error would violate it, and the third test adds nothing).`,
      explanation:
        "Sequential Bayes is odds multiplication — and the independence assumption is where real-world sequences (same lab, same instrument, same morning) quietly break the model.",
      concepts: ["sequential updating", "independence", "posterior odds"],
    },
  ],
  terms: [
    {
      term: "prior / posterior",
      definition: "Belief before the evidence (P(H)) and after it (P(H|E)); Bayesian reasoning is the discipline of moving between them by arithmetic, never by intuition.",
    },
    {
      term: "likelihood",
      definition: "P(E|H): how expected the evidence is under the hypothesis — the data's vote, before base rates are counted.",
    },
    {
      term: "base rate",
      definition: "The prior probability of the condition in the population under test; low base rates make even accurate tests produce mostly false positives.",
    },
    {
      term: "likelihood ratio",
      definition: "P(E|H) / P(E|¬H): the evidence's strength — how many times more expected the evidence is under the hypothesis than under its negation.",
    },
    {
      term: "posterior odds",
      definition: "Prior odds times likelihood ratio — Bayes' rule in competitive form, and the arithmetic behind sequential updating.",
    },
  ],
  mistakes: [
    {
      mistake: "Reading P(E|H) as P(H|E).",
      why: "The transposed conditional ignores base rates entirely — the 99%-accurate test 'proving' 99% likelihood of disease.",
      fix: "Name every probability in conditioning order before computing: 'the probability of POSITIVE given DISEASE is 0.99' — then let Bayes do the flip.",
    },
    {
      mistake: "Forgetting the denominator's second term.",
      why: "P(E) is the evidence's TOTAL probability, from every hypothesis that could produce it — dropping the false-positive mass inflates the posterior.",
      fix: "Always write both terms of total probability before dividing; the medical example's 0.0594 is mostly the term people omit.",
    },
    {
      mistake: "Sequencing dependent tests as independent.",
      why: "Same-instrument, same-day repeats share failure modes; multiplying their likelihood ratios double-counts one piece of evidence and marches to false certainty.",
      fix: "Condition on what the tests share — the next lesson's networks exist precisely to make such dependencies explicit and computable.",
    },
  ],
  takeaways: [
    "Bayes' rule is two lines of algebra from the product rule — and the entire calculus of belief revision.",
    "The base-rate fallacy is a mechanical transposition, cured by the division: P(D|+) = 0.0099/0.0594 ≈ 17%.",
    "Evidence strength is the likelihood ratio; the prior is the starting line; the posterior odds are their product.",
    "Sequential updating is one function applied repeatedly — today's posterior is tomorrow's prior, with independence as the load-bearing assumption.",
    "Certainty factors were the field's patch over this arithmetic; Bayesian networks (next lesson) are the principled repair.",
  ],
  quiz: [
    {
      id: "f-06-q1",
      prompt: "The medical example's posterior was ~17% despite 99% sensitivity because:",
      options: [
        { text: "The test is unreliable", correct: false, feedback: "99% sensitivity is excellent detection; the issue was never the test's quality." },
        { text: "The false-positive mass over the 99%-healthy population (0.05 × 0.99 ≈ 0.0495) dwarfs the true-positive mass (0.0099)", correct: true, feedback: "Correct — five times the mass, from a 5% leak over a huge population. The denominator is a popularity contest between error sources." },
        { text: "Bayes' rule penalizes rare diseases by definition", correct: false, feedback: "Bayes is neutral bookkeeping; the arithmetic reflects the world's actual numbers, not a bias against rarity." },
        { text: "The prevalence should have been 50%", correct: false, feedback: "With 50% prevalence the posterior would be 0.495/0.520 ≈ 95% — the base rate is the whole story, which is the lesson." },
      ],
      explanation: "One divided number, understood: 0.0099/0.0594. Every base-rate surprise decomposes the same way.",
    },
    {
      id: "f-06-q2",
      prompt: "Sequential updating treats the second test's prior as:",
      options: [
        { text: "The original population prevalence — each test starts fresh", correct: false, feedback: "That discards the first test's information entirely; the two-positive calculation would come out identical to one positive." },
        { text: "The first test's posterior — evidence compounds by feeding forward", correct: true, feedback: "Correct — 0.01 → 0.1667 → 0.7984: each application of Bayes revises the running belief." },
        { text: "The average of prior and posterior", correct: false, feedback: "Averaging dilutes evidence; Bayesian revision multiplies odds, it never averages." },
        { text: "Zero until all tests are in", correct: false, feedback: "Batch and sequential paths AGREE on the final number under independence — but the running belief is always the current posterior." },
      ],
      explanation: "Feed-forward is the whole trick: belief is a stream, and Bayes is the update rule at each arrival.",
    },
  ],

};
