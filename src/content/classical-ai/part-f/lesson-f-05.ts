/**
 * PART F · MODULE 2 · CHAPTER "Probability as Degrees of Belief" · LESSON f-05
 * — "From Logic to Probability"
 *
 * The bridge out of Module 1: logic's all-or-nothing wall, probability as
 * graded belief, sample spaces, Kolmogorov's three axioms, the rules they
 * license (complement, inclusion-exclusion), conditioning as belief
 * revision — ending at the product rule, exactly where f-06 (Bayes' rule)
 * opens with "the product rule, written both ways around the intersection".
 *
 * Every fraction stated is machine-verified (see scripts/verify-one-lesson.ts):
 * die+coin: 1/12 each, P(A)=1/2, P(B)=1/2, P(A∩B)=1/4, P(A∪B)=3/4 (two routes),
 * P(A|B)=1/2 (two readings), product rule 1/2·1/2=1/4.
 * Two dice: 5/36, 11/36, 2/36=1/18, 2/11, 2/5, 2/11·11/36=1/18.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_05: ClassicalLesson = {
  slug: "f-05",
  title: "From Logic to Probability",
  minutes: 30,
  summary:
    "Why logic cannot live with uncertainty, and how the three axioms of probability rebuild inference for a noisy world.",
  kind: "concept",
  objectives: [
    "State the three axioms of probability and say exactly which combinations of events each licenses",
    "Derive the complement rule and inclusion-exclusion from the axioms, naming the license for every step",
    "Compute probabilities, unions, intersections and conditionals over an explicit sample space, verifying every fraction",
    "Read P(A | B) as belief revision: the reduced sample space B as the new universe",
    "Establish the product rule P(A ∩ B) = P(A | B)·P(B) and say why the next lesson begins there",
  ],
  why: "Module 1 left a bill unpaid. MYCIN graded its conclusions — 0.7, −0.3, 0.9 — but the certainty factors carrying those numbers had no semantics: nothing said what a 0.7 measured, no operation combined two of them lawfully, and the whole scheme sat on an independence assumption nobody had written down. The diagnosis runs deeper than MYCIN. Classical logic — the machinery you sharpened in Part D — proves or refutes, and between those verdicts it is silent; a clinic that says 'probably measles', a sensor that misfires two percent of the time, and a rule base whose premises are half-guessed are all invisible to it. Probability theory is the mathematics that fills the silence: a way to grade belief between refuted and proved, with bookkeeping exact enough to be audited. This lesson builds it from zero — the sample space, Kolmogorov's three axioms, and the rules they license: complement, inclusion-exclusion, conditioning, the product rule — on a die-and-coin table small enough that you can check every fraction by counting cells. The payoff is immediate: the next lesson turns the product rule into Bayes' rule, and the two after that scale it into the networks that actually replaced certainty factors.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Module 1 ended with an unpaid bill. MYCIN could attach a number to a conclusion — *meningitis (0.7)* — but the certainty factor 0.7 was a number without a calculus: nothing said what it measured, how two of them combined, or when a combination had outrun its evidence. This lesson pays the bill. The mathematics of graded belief is probability theory — worked out in the Pascal–Fermat correspondence of 1654, axiomatized by Kolmogorov in 1933 — and its price of admission is astonishingly small: three postulates, from which every rule a reasoning system needs under uncertainty can be derived. We build those rules on one die, one coin and a twelve-cell table, and we stop at exactly the right place: the product rule, the stepping-off point for Bayes' rule in the next lesson.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Logic's all-or-nothing wall",
      text: "A deductive system proves a conclusion, refutes it, or stays silent — there is no state in which a formula is *probably* true. The resolution prover you built in Part D inherits this exactly: a clause set either entails a goal or it does not, and when a premise is missing or a sensor is noisy, the machinery returns nothing rather than something graded. The best-known repair that stays inside the wall is **non-monotonic logic** — default rules whose conclusions can be retracted when new facts arrive — which addresses brittleness honestly but still cannot grade a conclusion 0.7. What a diagnostic system needs is not better all-or-nothing inference; it is a calculus of *partial* belief, and that is what the rest of this module builds.",
    },

    // -------------------------------------------- probability as belief
    { kind: "heading", text: "Probability as degree of belief" },
    {
      kind: "definition",
      term: "probability (degree of belief)",
      informal:
        "A number P(A) between 0 (impossible) and 1 (certain) that grades how strongly the evidence supports event A — the graded replacement for logic's true/false, and the thing MYCIN's certainty factors were groping for.",
      formal: "0 \\leq P(A) \\leq 1 \\text{ for every event } A \\subseteq \\Omega",
      why: "The grade is the point. 'Fever and rash, therefore measles' becomes a number that can be checked against recorded frequencies, combined by exact rules, and revised when a lab result arrives — the three moves all-or-nothing logic cannot make.",
    },
    {
      kind: "table",
      title: "Two readings of the same number",
      headers: ["Question", "Frequency reading", "Belief reading (Bayesian)"],
      rows: [
        [
          "What P(measles) = 0.6 asserts",
          "In the long run, 60% of cases presenting this way are measles",
          "Given everything known, belief in measles for THIS case stands at 0.6",
        ],
        [
          "Where the number comes from",
          "Counting an ensemble: records, trials, populations",
          "A prior, updated by evidence through the rules of this module",
        ],
        [
          "A one-off event (this patient, this intrusion attempt)",
          "Awkward — there is no ensemble to count",
          "Native — each case is a hypothesis to be graded",
        ],
        [
          "A repeatable process (dice, quality control)",
          "Native — that is what the reading means",
          "A special case: repeatable trials make beliefs track frequencies",
        ],
        [
          "The calculus obeyed",
          "The same three axioms — every formula in this course is reading-independent",
          "Identical — the disagreement is philosophical, not arithmetical",
        ],
      ],
      caption:
        "The two readings disagree about what a probability IS, not about how probabilities COMPUTE. Part F speaks the belief reading — an expert system advises on this patient, not on a population — but nothing in the arithmetic below depends on that choice.",
    },

    // ------------------------------------- sample spaces and the axioms
    { kind: "heading", text: "Sample spaces and the three axioms" },
    {
      kind: "definition",
      term: "sample space",
      informal:
        "The set Ω of everything that can happen in one run of an experiment, stated at a grain fine enough that exactly one outcome occurs. Roll a fair die and flip a fair coin: Ω is the twelve pairs (1,H), (1,T), …, (6,T). An EVENT is any subset of Ω — 'the die shows even' is the six-member subset {(2,H), (2,T), (4,H), (4,T), (6,H), (6,T)}.",
      formal: "\\Omega = \\{(1, H), (2, H), \\dots, (6, T)\\}, \\quad A \\subseteq \\Omega \\text{ events}",
      why: "Because events are sets, the connectives of Part D become set operations — or/and/not map to union/intersection/complement — and probability inherits the whole of set algebra for free.",
    },
    {
      kind: "math",
      title: "The axioms of probability (Kolmogorov, 1933)",
      displays: [
        { expr: "P(A) \\geq 0 \\text{ for every event } A", label: "non-negativity" },
        { expr: "P(\\Omega) = 1", label: "normalization" },
        { expr: "P(A \\cup B) = P(A) + P(B) \\text{ whenever } A \\cap B = \\emptyset", label: "finite additivity — disjoint events only" },
      ],
      caption:
        "Three postulates, and nothing else is assumed. Normalization fixes the scale (certainty is 1), non-negativity the direction, additivity the price of combining alternatives — and its condition is load-bearing: it is licensed only when A and B share no outcome. Notice what the axioms do NOT say: nothing about P(A ∪ B) when A and B overlap, nothing about P(A ∩ B), nothing about 'A given B'. Those must be earned — the next block earns two of them.",
    },
    {
      kind: "math",
      title: "Immediate consequences",
      derivation: {
        title: "The complement rule and inclusion-exclusion",
        steps: [
          { expr: "A \\cap \\neg A = \\emptyset \\quad \\text{and} \\quad A \\cup \\neg A = \\Omega", reason: "excluded middle and non-contradiction, in set form — every outcome lies in exactly one of A, ¬A" },
          { expr: "P(A) + P(\\neg A) = P(A \\cup \\neg A) = P(\\Omega) = 1", reason: "additivity over the disjoint pair from step 1, then normalization on the union" },
          { expr: "P(\\neg A) = 1 - P(A)", reason: "solve step 2 for the complement — the complement rule" },
          { expr: "A \\cup B = (A \\cap \\neg B) \\cup (\\neg A \\cap B) \\cup (A \\cap B)", reason: "split the union into three pieces: only-A, only-B, both" },
          { expr: "P(A \\cup B) = P(A \\cap \\neg B) + P(\\neg A \\cap B) + P(A \\cap B)", reason: "the three pieces of step 4 are pairwise disjoint, so additivity applies" },
          { expr: "P(A) = P(A \\cap \\neg B) + P(A \\cap B)", reason: "A splits the same way into two disjoint pieces — only-A and both — so additivity applies again" },
          { expr: "P(B) = P(\\neg A \\cap B) + P(A \\cap B)", reason: "likewise B: only-B and both" },
          { expr: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)", reason: "substitute steps 6 and 7 into step 5: the overlap was counted twice, so subtract it once — inclusion-exclusion" },
        ],
      },
      caption:
        "Every step is an axiom, a set identity, or algebra on the line above it — the house style for this whole module: no rule is used that the axioms did not license. The next lesson derives Bayes' rule the same way, in two lines.",
    },

    // -------------------------------------- conditioning and product rule
    { kind: "heading", text: "Conditioning: belief revision and the product rule" },
    {
      kind: "math",
      title: "Conditional probability — belief revision",
      displays: [
        { expr: "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}", label: "definition — for P(B) > 0" },
        { expr: "\\sum_{\\omega \\in B} P(\\omega \\mid B) = 1", label: "the axioms hold again inside B" },
      ],
      caption:
        "Read the definition as a change of universe. Evidence B arrives; every outcome outside B becomes impossible, and B becomes the new Ω — the conditional renormalizes belief over the shrunken world so that probabilities there sum to one again (display 2: normalization, re-established inside B). This is belief revision in miniature: the evidence shrinks the universe, and every question is re-asked inside it. In the table below, 'the coin shows heads' collapses twelve cells to six.",
    },
    {
      kind: "math",
      title: "The product rule — the bridge to Bayes",
      displays: [
        { expr: "P(A \\cap B) = P(A \\mid B) \\cdot P(B)", label: "the product rule" },
        { expr: "P(A \\cap B \\cap C) = P(A) \\cdot P(B \\mid A) \\cdot P(C \\mid A \\cap B)", label: "the chain rule, one line further" },
      ],
      caption:
        "Multiply the conditional definition through by P(B) and the intersection acquires a price tag: the probability of A-and-B is the probability of B times the probability of A once B is known. Iterated, it factors any joint distribution into a chain of conditionals (display 2) — the crack that Bayesian networks, two lessons ahead, pry open. This is where the lesson stops on purpose: the next lesson writes the product rule a second time, the other way around the intersection, and sets the two expressions equal.",
    },

    // ------------------------------------------------------------ worked example
    {
      kind: "example",
      title: "One die, one coin — the whole calculus on a table",
      problem:
        "Roll one fair six-sided die and flip one fair coin. Let A = 'the die shows an even number' and B = 'the coin shows heads'. Enumerate the sample space, compute P(A), P(B), P(A ∩ B) and P(A ∪ B) by two different rules, then P(A | B) — and verify the product rule on the intersection.",
      steps: [
        {
          text: "Enumerate the universe: twelve equally likely outcomes.",
          detail:
            "Ω = {(1,H), (2,H), (3,H), (4,H), (5,H), (6,H), (1,T), (2,T), (3,T), (4,T), (5,T), (6,T)} — six die faces times two coin faces. By symmetry each pair carries probability 1/12, and the twelve cells sum to 1: normalization, checked.",
        },
        {
          text: "Read the events off as subsets.",
          detail:
            "A (die even) = {(2,H), (2,T), (4,H), (4,T), (6,H), (6,T)} — six outcomes, so P(A) = 6/12 = 1/2. B (heads) = {(1,H), …, (6,H)} — six outcomes, so P(B) = 1/2. The intersection A ∩ B = {(2,H), (4,H), (6,H)} — three outcomes, so P(A ∩ B) = 3/12 = 1/4.",
        },
        {
          text: "Take the union by two rules — they must agree.",
          detail:
            "Inclusion-exclusion: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = 1/2 + 1/2 − 1/4 = 3/4. Complement: A ∪ B fails only when the die is odd AND the coin shows tails — the three outcomes {(1,T), (3,T), (5,T)} — so P(A ∪ B) = 1 − 3/12 = 1 − 1/4 = 3/4. Two licensed routes, one number.",
        },
        {
          text: "Condition on heads: the universe shrinks to six cells.",
          detail:
            "P(A | B) = P(A ∩ B) / P(B) = (1/4)/(1/2) = 1/2. The reduced-sample-space reading gives it instantly: given B, the world is {(1,H), …, (6,H)}, and three of those six cells show an even die — 3/6 = 1/2. The answer equals P(A): the coin told us nothing about the die. When conditioning changes nothing, the events are independent — the property the networks of f-07 are built from.",
        },
        {
          text: "Verify the product rule.",
          detail:
            "P(A | B) · P(B) = 1/2 · 1/2 = 1/4 = P(A ∩ B) — the same 1/4 counted straight from the table. No mystery: the rule relabels the count 3/12 as (3/6) × (6/12), even-among-heads times heads.",
        },
      ],
      result:
        "P(A) = 1/2, P(B) = 1/2, P(A ∩ B) = 1/4, P(A ∪ B) = 3/4 (both routes), P(A | B) = 1/2 — and the product rule closes the loop: 1/2 · 1/2 = 1/4.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "f-05-e1",
      exerciseKind: "concept-check",
      prompt:
        "A weather module assigns P(rain tomorrow) = 0.7 and P(cloudy all day) = 0.8, then reports P(rain or cloudy tomorrow) = 1.5. Which diagnosis is correct?",
      options: [
        {
          text: "Nothing is wrong — probabilities of two events always add",
          correct: false,
          feedback:
            "The third axiom licenses addition only for DISJOINT events. As a general claim, this is precisely the error the axiom's condition exists to block.",
        },
        {
          text: "The inputs are illegal — 0.7 and 0.8 cannot both hold in one distribution",
          correct: false,
          feedback:
            "Each is individually legal: both lie in [0, 1], and rain and heavy cloud are perfectly coherent marginal beliefs. The error is downstream, in the combination step.",
        },
        {
          text: "Rain and cloud can co-occur, so additivity does not apply — the union needs inclusion-exclusion: P(rain ∪ cloudy) = 0.7 + 0.8 − P(rain ∩ cloudy)",
          correct: true,
          feedback:
            "Correct. The axioms even bound the repair: the overlap is at least 0.7 + 0.8 − 1 = 0.5, so the corrected union is at most 1. Check the disjointness condition before every addition.",
        },
        {
          text: "Normalization was violated, so the axiom system must be rescaled",
          correct: false,
          feedback:
            "1.5 > 1 is indeed impossible — but it is the symptom, not the cause. Keep the axioms; fix the step that ignored their condition.",
        },
      ],
      solution:
        "Rain and cloud overlap, so the union is 0.7 + 0.8 − P(rain ∩ cloudy), and since the overlap is at least 0.7 + 0.8 − 1 = 0.5, the result is at most 1.0 — the axioms repair their own misuse.",
      explanation:
        "This is the working error the third axiom's condition guards against. The guard is a question you ask before every addition: can both events happen at once?",
      concepts: ["axioms of probability", "inclusion-exclusion"],
    },
    {
      kind: "exercise",
      id: "f-05-e2",
      exerciseKind: "trace",
      prompt:
        "Roll two fair six-sided dice. Let S = 'the sum is 8' and E = 'at least one die shows a 6'. Compute P(S), P(E), P(S ∩ E) and P(S | E) as fractions, showing the outcome counts behind each — then check the product rule: does P(S | E) · P(E) equal P(S ∩ E)?",
      solution:
        "Ω has 36 equally likely ordered pairs. S = {(2,6), (3,5), (4,4), (5,3), (6,2)} — 5 outcomes, so P(S) = 5/36. E = pairs with a 6 in either slot — 6 + 6 − 1 = 11 outcomes (the (6,6) would be counted twice), so P(E) = 11/36. S ∩ E = {(2,6), (6,2)} — the other sum-8 pairs contain no 6 — so P(S ∩ E) = 2/36 = 1/18. Conditioning: P(S | E) = (2/36)/(11/36) = 2/11 — note that (6,6) sits in E but sums to 12, not 8. Product rule: 2/11 × 11/36 = 2/36 = 1/18, as required.",
      explanation:
        "Every number is a count over an explicit Ω — the discipline this lesson teaches. The reduced-sample-space reading of 2/11 is worth fixing in memory: condition on E and the world is eleven cells; re-ask 'sum 8?' inside it.",
      concepts: ["sample space", "conditional probability", "product rule"],
    },
    {
      kind: "exercise",
      id: "f-05-e3",
      exerciseKind: "concept-check",
      prompt:
        "Exercise f-05-e2 found P(S | E) = 2/11 — the probability the sum is 8 given that at least one die shows a 6. A classmate flips the conditioning and claims P(E | S) — at least one 6, given the sum is 8 — must equal 2/11 as well. What is P(E | S), and why do the two numbers differ?",
      options: [
        {
          text: "P(E | S) = 2/5 — among the five sum-8 outcomes exactly two contain a 6; the two conditionals divide the same intersection by different universes",
          correct: true,
          feedback:
            "Correct: P(E | S) = P(E ∩ S)/P(S) = (2/36)/(5/36) = 2/5. Conditioning shrinks the world — to eleven cells in one direction, five in the other — and the divisor is what changed.",
        },
        {
          text: "P(E | S) = 2/11 — conditioning is symmetric, so the two directions agree",
          correct: false,
          feedback:
            "They agree only by coincidence (the die-and-coin example's 1/2 did). Here the divisors differ — eleven cells against five — and the numbers differ with them: 2/11 against 2/5.",
        },
        {
          text: "P(E | S) = 1 — if the sum is 8, a 6 is guaranteed",
          correct: false,
          feedback:
            "Three of the five sum-8 pairs — (3,5), (4,4), (5,3) — show no 6 at all. 'Guaranteed' would mean S ⊆ E, which the enumeration refutes.",
        },
        {
          text: "P(E | S) is undefined, because S and E overlap",
          correct: false,
          feedback:
            "Overlap is no obstacle: the definition divides by P(S) = 5/36 > 0, which is all it requires. Only conditioning on an event of probability zero breaks the division.",
        },
      ],
      solution:
        "P(E | S) = P(E ∩ S)/P(S) = (2/36)/(5/36) = 2/5: the sum-8 universe holds five outcomes, two of which contain a 6. It is not 2/11.",
      explanation:
        "P(A | B) and P(B | A) are different numbers in general — each divides the shared intersection by a different margin. Confusing the two directions is the transposition error, and it is exactly what the next lesson's base-rate fallacy is made of.",
      concepts: ["conditional probability", "sample space"],
    },
  ],
  terms: [
    {
      term: "sample space",
      definition:
        "The set Ω of all possible outcomes of an experiment, exactly one of which occurs; every event, probability and conditional in the experiment is defined over it.",
    },
    {
      term: "event",
      definition:
        "A subset of the sample space — a claim true of some outcomes and false of the rest. And/or/not map to union/intersection/complement, so events inherit set algebra.",
    },
    {
      term: "axioms of probability",
      definition:
        "Kolmogorov's three postulates — non-negativity (P(A) ≥ 0), normalization (P(Ω) = 1), and finite additivity for disjoint events — from which every other rule in the calculus is derived.",
    },
    {
      term: "conditional probability",
      definition:
        "P(A | B) = P(A ∩ B)/P(B) for P(B) > 0: the probability of A once B is known — belief renormalized over the reduced sample space B.",
    },
    {
      term: "product rule",
      definition:
        "P(A ∩ B) = P(A | B)·P(B): the probability of an intersection as a conditional times the condition's probability — the seed from which Bayes' rule grows.",
    },
  ],
  mistakes: [
    {
      mistake: "Adding P(A) + P(B) for events that can co-occur.",
      why:
        "The third axiom is licensed only for disjoint events; applying it to overlapping ones counts the intersection twice and can push a union past 1.",
      fix:
        "Before adding, ask 'can both happen at once?' If yes — subtract the intersection (inclusion-exclusion), or split the union into disjoint pieces first.",
    },
    {
      mistake: "Reading P(A | B) as P(B | A).",
      why:
        "The two conditionals divide the same intersection by different universes — 2/11 against 2/5 in the two-dice exercise — and swapping them silently swaps the question being answered.",
      fix:
        "Say the conditioning aloud in given-form — 'the probability of SUM 8 GIVEN a six' — and put the given event's probability on the bottom of the fraction.",
    },
    {
      mistake: "Leaving the sample space implicit.",
      why:
        "Without an explicit Ω at the right grain, event membership is guesswork and 'equally likely' is an uncheckable hope; most wrong fractions are membership errors in disguise.",
      fix:
        "Write Ω down (the die-and-coin twelve, the two-dice thirty-six), mark which cells each event contains, and only then compute.",
    },
    {
      mistake: "Conditioning on evidence of probability zero.",
      why:
        "The definition divides by P(B); when P(B) = 0 the conditional is not small but undefined — 0/0 carries no information.",
      fix:
        "Check P(B) > 0 before dividing. In the finite spaces of this course any event with cells qualifies; the habit matters once distributions grow continuous.",
    },
  ],
  takeaways: [
    "Logic proves or refutes; probability grades — and three axioms (non-negativity, normalization, additivity for disjoint events) are the whole price of admission.",
    "Nothing else is assumed and everything else is earned: the complement rule and inclusion-exclusion fall out of the axioms by splitting sets into disjoint pieces.",
    "A probability is a degree of belief on a scale calibrated by frequencies — the two readings share the calculus, and Part F speaks belief.",
    "Conditioning is a change of universe: P(A | B) renormalizes belief over the reduced sample space B, which is why evidence revises belief instead of merely accumulating beside it.",
    "The product rule P(A ∩ B) = P(A | B)·P(B) is where this lesson stops and the next begins — Bayes' rule is two lines away.",
  ],
  quiz: [
    {
      id: "f-05-q1",
      prompt:
        "The third axiom states P(A ∪ B) = P(A) + P(B) only when A ∩ B = ∅. Why is the disjointness condition load-bearing?",
      options: [
        {
          text: "Without it, outcomes in A ∩ B are counted twice — inclusion-exclusion exists precisely to subtract that double count back out",
          correct: true,
          feedback:
            "Exactly. Additivity is a statement about combining non-overlapping mass; overlap must go through the derived rule, never through the axiom directly.",
        },
        {
          text: "Because probabilities must never exceed 1",
          correct: false,
          feedback:
            "Staying within [0, 1] is a consequence of correct bookkeeping, not the axiom's license — once the intersection is subtracted, overlapping unions obey the bound too.",
        },
        {
          text: "Because Ω must be finite for the axiom to type-check",
          correct: false,
          feedback:
            "This lesson states finite additivity for simplicity, but finiteness is not what disjointness protects; infinite spaces add over disjoint families too, with more care.",
        },
        {
          text: "Because A and B must be independent for addition to be legal",
          correct: false,
          feedback:
            "Independence is a claim about information, not about overlap — two disjoint events are never independent unless one of them is impossible.",
        },
      ],
      explanation:
        "Every misuse of additivity is a double count, and the cure is always the same: split into disjoint pieces first, or subtract the intersection after.",
    },
    {
      id: "f-05-q2",
      prompt:
        "You learn that the coin shows heads (event B). What does computing P(A | B) — with A = 'the die shows an even number' — actually do?",
      options: [
        {
          text: "Shrinks the universe to B's six cells and renormalizes: mass outside B goes to 0, the rest rescales to sum to 1, and 'is the die even?' is re-asked inside the new universe — 3/6 = 1/2",
          correct: true,
          feedback:
            "The reduced-sample-space reading. The division by P(B) is exactly the renormalization — which is why probabilities inside B obey the same three axioms again.",
        },
        {
          text: "Adds P(B) to P(A), because evidence accumulates",
          correct: false,
          feedback:
            "Evidence does not add to beliefs — it conditions them. Addition is the formula for OR, not for learning.",
        },
        {
          text: "Shrinks the universe to B but keeps the old 1/12 weights, leaving total mass 1/2 inside B",
          correct: false,
          feedback:
            "The shrunken world must again sum to 1 — normalization is not optional inside B. Keeping the 1/12 weights is precisely the slip the division by P(B) repairs.",
        },
        {
          text: "Nothing at all, because a coin and a die are independent",
          correct: false,
          feedback:
            "The ANSWER happens to be unchanged (P(A | B) = P(A) = 1/2 here), but the operation is real. Independence is the name for conditioning that happens to change nothing — the subject two lessons ahead.",
        },
      ],
      explanation:
        "Conditioning is renormalization over a reduced sample space: the evidence shrinks the universe, and the division by P(B) restores the scale so the axioms hold again inside it.",
    },
    {
      id: "f-05-q3",
      prompt: "The product rule P(A ∩ B) = P(A | B)·P(B) is the last rule this lesson establishes. Why does it come last?",
      options: [
        {
          text: "It is the bridge out: written again the other way around the intersection — P(A | B)·P(B) = P(B | A)·P(A) — it becomes Bayes' rule one division later, which is where the next lesson opens",
          correct: true,
          feedback:
            "The bridge is real and deliberately built: this lesson stops the instant the product rule stands, so the next can start from it.",
        },
        {
          text: "Because it is the strongest of the three axioms",
          correct: false,
          feedback:
            "It is not an axiom at all — one multiplication applied to the conditional definition. The axioms remain three.",
        },
        {
          text: "Because it holds only for independent events",
          correct: false,
          feedback:
            "It holds whenever P(B) > 0. Independence is the special case P(A | B) = P(A), which simplifies the product but is never required by it.",
        },
        {
          text: "Because intersections cannot be computed any other way",
          correct: false,
          feedback:
            "In a uniform space you can count intersection cells directly — the worked example did. The product rule's value is not the arithmetic but the factorization: joints assembled from conditionals.",
        },
      ],
      explanation:
        "Order is pedagogy in a derivation course: the product rule closes this lesson because it opens the next one.",
    },
  ],
};
