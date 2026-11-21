/**
 * PART A · MODULE 3 · "Local Search and Landscapes" — lesson a-10,
 * "Simulated Annealing".
 *
 * Module 3's repair. Lesson a-09's steepest ascent stranded 87 of the 100
 * pinned seed-7 starts; this lesson prices the escape — the Metropolis rule
 * e^(−ΔE/T), geometric cooling T ← α·T, and an honest account of what the
 * convergence theory does and does not promise.
 *
 * Every `output` / `expectedOutput` is the REAL stdout of running the code
 * with python3 (scripts/verify-one-lesson.ts machine-verifies it). The
 * starts are lesson a-09's, unchanged: random.seed(7), 100 successive
 * 8-tuples generated before any annealing. Measured on this exact setup
 * (T0 = 1.0, α = 0.9995, budget 100,000 steps per run): 100 of 100 solved —
 * median 1,317 steps, worst 4,515; run 0, the board a-09's climb stranded
 * on, solved in 725 steps.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_10: ClassicalLesson = {
  slug: "a-10",
  title: "Simulated Annealing",
  minutes: 30,
  summary:
    "Escape local optima by accepting worse moves with a probability that falls over time — and why it works.",
  kind: "coding",
  objectives: [
    "State the Metropolis acceptance rule and compute acceptance probabilities by hand for given ΔE and T",
    "Explain the two limiting behaviors — high temperature as a random walk, zero temperature as hill climbing — and how cooling steers between them",
    "Implement simulated annealing with geometric cooling on the pinned seed-7 8-queens starts and measure solved versus stuck honestly",
    "Choose T0 and α for a new objective, and state precisely what the classical convergence guarantee does and does not promise",
  ],
  why: "Hill climbing's failure in lesson a-09 was structural, not bad luck: 87 of 100 pinned starts stranded because the climb refuses every downhill step, and no amount of patient climbing repairs a refusal. Simulated annealing is the classical repair, and it earns a permanent place in your toolkit twice over. First, it keeps local search's economy — one state, one score, no frontier, no path — while breaking local optima open with a single exponential: accept worse moves with probability e^(−ΔE/T), and lower T on a schedule. Second, it is the honest gateway into a genuinely deep question: when does an algorithm that deliberately does the wrong thing still converge? The classical answer — only under logarithmically slow schedules that no practical run can afford — is the exact discipline this course keeps preaching: know what your measurement shows, know what your theorem promises, and never confuse the two. You will price bad moves by hand, cool a real schedule step by step, and rerun lesson a-09's hundred boards to watch 87 strandings become a round 100 solutions.",
  blocks: [
    // ------------------------------------------------------------ the opening
    {
      kind: "text",
      text: "Lesson a-09 ended with a wound. On the hundred pinned seed-7 boards, steepest-ascent hill climbing solved 13 and stranded 87, halting with attacking pairs still on the board because none of the 56 neighbors improved its state — and its closing exercise priced one patch: random restarts, roughly 1/p ≈ 8 fresh climbs at p ≈ 0.13 per solution. This lesson builds the other patch, which spends disorder instead of starts: accept WORSE moves, deliberately, with a probability that falls over time. Early in the run, while the *temperature* is high, bad moves pass often and the walk roams the landscape with only mild regard for the objective; late, cooled toward zero, the rule tightens until only improvements survive — which is, looked at closely, the hill climber of lesson a-09 emerging from inside the loop. The name is stolen from metallurgy, the acceptance rule from 1950s statistical mechanics, and the whole algorithm is one loop with one exponential in it.",
    },
    {
      kind: "math",
      title: "The Metropolis rule",
      displays: [
        { expr: "\\Delta E = h(s\\prime) - h(s)", label: "cost of a proposal" },
        { expr: "P(\\text{accept}) = e^{-\\Delta E / T} \\quad (\\Delta E > 0)", label: "the Metropolis rule" },
        { expr: "T \\to \\infty : \\quad e^{-\\Delta E / T} \\to 1", label: "hot limit" },
        { expr: "T \\to 0 : \\quad e^{-\\Delta E / T} \\to 0", label: "cold limit" },
      ],
      caption:
        "We keep lesson a-09's minimization framing — h counts attacking pairs — so ΔE > 0 is a proposal that makes the board WORSE. The rule prices only bad moves: improvements and ties (ΔE ≤ 0) are accepted outright. The two limits are the anchors. As T grows, −ΔE/T collapses toward 0 and nearly every proposal passes — a random walk that barely consults h; as T approaches 0, the exponent dives toward −∞ and worse moves become essentially impossible — improvements and ties only, which is hill climbing again, the behavior that stranded 87 of 100 starts in lesson a-09. Every finite T is a blend of the two regimes, and cooling is the scheduled walk from the first toward the second.",
    },
    {
      kind: "definition",
      term: "Simulated annealing",
      informal:
        "Local search that escapes local optima by accepting worse moves on purpose: a better or equal neighbor is always taken, a worse one with probability e^(−ΔE/T), and the temperature T falls on a fixed schedule as the run proceeds.",
      formal:
        "P(\\text{accept } s\\prime) = \\cases{1, \\Delta E \\le 0; e^{-\\Delta E / T}, \\Delta E > 0}",
      why: "Only the second case is new — the first is hill climbing's rule. The asymmetry is the entire trick: the walk never refuses a better board, and its willingness to take a worse one is a single dial the schedule turns.",
    },
    {
      kind: "example",
      title: "Pricing one bad move at two temperatures",
      problem:
        "An annealing run on 8-queens is offered a move that would add ΔE = 4 attacking pairs — sliding a currently safe queen onto a row where it clashes with four others. Compute the acceptance probability at T = 2.0 (early in the run) and at T = 0.5 (later, after cooling).",
      steps: [
        {
          text: "At T = 2.0, the exponent is −ΔE/T = −4/2.0 = −2.",
          detail:
            "python: math.exp(-2) = 0.1353352832… — call it 0.1353, roughly one accepted bad move in seven offers.",
        },
        {
          text: "At T = 0.5, the exponent is −4/0.5 = −8.",
          detail:
            "python: math.exp(-8) = 0.0003354626… — about one in 3,000. The identical move, roughly 400 times rarer than at T = 2.0.",
        },
        {
          text: "The ratio does the work, not the move: a ΔE = 1 move at T = 0.5 has exponent −1/0.5 = −2 again.",
          detail:
            "Same e^(−2) ≈ 0.1353 odds. Cooling reprices disorder: what those odds bought at T = 2.0 — a four-pair worsening — they can no longer afford at T = 0.5, where they buy a one-pair worsening.",
        },
      ],
      result:
        "The same bad move passes with probability e^(−2) ≈ 0.1353 at T = 2.0 but e^(−8) ≈ 0.000335 at T = 0.5 — 0.1353352832 and 0.0003354626 from python's math.exp, pasted rather than idealized.",
    },
    // ------------------------------------------------------------ the schedule
    { kind: "heading", text: "The temperature schedule" },
    {
      kind: "definition",
      term: "Temperature schedule",
      informal:
        "The fixed plan for how fast T falls. Practical annealing almost always uses geometric cooling: after every step, multiply T by a constant α just below 1, so the temperature decays exponentially but gently.",
      formal: "T_{k+1} = \\alpha T_k, \\quad T_k = T_0 \\alpha^k, \\quad 0 < \\alpha < 1",
      why: "The schedule is the algorithm's only moving part besides the board: park T high forever and you have a random walk, park it near zero and you have lesson a-09's climber — cooling is what carries the walk from the first regime toward the second, and how fast it does so is the whole design decision.",
    },
    {
      kind: "text",
      text: "Choosing T0 and α is matching the schedule to the objective's scale, and the recipe is short. Set T0 near the size of the bad moves you want to afford early: on 8-queens the useful worsenings cost ΔE = 1 or 2, and T0 = 1.0 prices a ΔE = 1 move at e^(−1) ≈ 0.368 — generous, but not chaos. Set α close enough to 1 that the annealing window spans thousands of steps: at α = 0.9995 the temperature is still 0.6065 after 1,000 steps (0.9995^1000) and has fallen to 0.0067 after 10,000 — the walk spends its hot phase exploring and its cold phase exploiting. An α of 0.9, by contrast, multiplies T down to 0.0148 within forty steps (0.9^40), after which a ΔE = 1 move passes with probability e^(−67) ≈ 0: that run is a hill climb wearing a costume.",
    },
    {
      kind: "callout",
      tone: "analogy",
      title: "Why \"annealing\"",
      text: "In metallurgy, annealing is the controlled cooling of a worked metal: at high temperature the atoms jiggle hard enough to rearrange past defects, and slow cooling lets the lattice settle into its low-energy order instead of freezing the defects in. Kirkpatrick, Gelatt and Vecchi (1983) read a cost function as an energy landscape — a local optimum is a defect, fast quenching is hill climbing's freeze, and deliberately accepting worse moves is the heat that lets the system keep rearranging. The acceptance rule itself is older: e^(−ΔE/T) is the Metropolis algorithm, from 1953 statistical mechanics, where it described atoms thermally jumping to higher-energy configurations.",
    },
    // ------------------------------------------------------------ the loop, measured
    { kind: "heading", text: "The loop, measured on the a-09 boards" },
    {
      kind: "pseudocode",
      title: "Simulated annealing with geometric cooling",
      lines: [
        { text: "function SIMULATED-ANNEALING(start)" },
        { text: "current ← start, T ← T_0, steps ← 0", indent: 1 },
        {
          text: "while h(current) > 0 and steps < max_steps do",
          indent: 1,
          note: "early-stop the moment the board is solved — h = 0; the budget is the safety net",
        },
        {
          text: "s' ← RANDOM-NEIGHBOR(current)",
          indent: 2,
          note: "one random column, one random new row — a proposal, not the best of 56",
        },
        { text: "ΔE ← h(s') - h(current)", indent: 2 },
        {
          text: "if ΔE ≤ 0 or RANDOM(0, 1) < e^(-ΔE/T) then",
          indent: 2,
          tone: "key",
          note: "the Metropolis line: better/equal moves are free; worse moves are priced at e^(-ΔE/T)",
        },
        { text: "current ← s'", indent: 3 },
        {
          text: "T ← α·T",
          indent: 2,
          note: "geometric cooling — the schedule, never the score, turns the dial",
        },
        { text: "steps ← steps + 1", indent: 2 },
        { text: "return current", indent: 1 },
      ],
      note: "The schedule is fixed in advance — T depends only on the step count, never on h — and each step costs one proposal plus one objective evaluation (28 pair checks), so a run is O(max_steps) time with no memory beyond the current board: lesson a-09's economy, plus one exponential.",
    },
    {
      kind: "pythonImpl",
      title: "Simulated annealing on the same 100 starts: solved vs stuck",
      intent:
        "Runs the pinned experiment — lesson a-09's exact seed-7 starts, objective and move set, plus the Metropolis line and geometric cooling (T0 = 1.0, α = 0.9995, budget 100,000 steps per run) — and measures how many boards it solves, with run 0 shown in full.",
      code: `import math
import random
import statistics

random.seed(7)                                    # pinned: the same 100 starts as lesson a-09
STARTS = [tuple(random.randrange(8) for _ in range(8)) for _ in range(100)]

def attacking_pairs(s):
    """Lesson a-09's objective: pairs of queens sharing a row or a
    diagonal, over all 28 column pairs. h = 0 means solved."""
    pairs = 0
    for c1 in range(8):
        for c2 in range(c1 + 1, 8):
            if s[c1] == s[c2] or abs(s[c1] - s[c2]) == c2 - c1:
                pairs += 1
    return pairs

def anneal(start, T0=1.0, alpha=0.9995, max_steps=100_000):
    """One annealing run: propose a random single-queen move, accept
    better/equal moves always and worse moves with probability
    e^(-delta/T), cool geometrically, stop at h = 0."""
    current, value, T = list(start), attacking_pairs(start), T0
    steps = 0
    while value > 0 and steps < max_steps:
        steps += 1
        c = random.randrange(8)                   # pick a random column...
        r = random.randrange(8)                   # ...and a random new row
        while r == current[c]:
            r = random.randrange(8)               # resample: a move must change the board
        candidate = list(current)
        candidate[c] = r
        cand_value = attacking_pairs(candidate)
        delta = cand_value - value
        if delta <= 0 or random.random() < math.exp(-delta / T):
            current, value = candidate, cand_value
        T *= alpha                                # geometric cooling
    return tuple(current), value, steps

solved, run0, steps_solved = 0, None, []
for i, start in enumerate(STARTS):
    final, value, steps = anneal(start)
    if value == 0:
        solved += 1
        steps_solved.append(steps)
    if i == 0:
        run0 = (start, final, value, steps)

steps_solved.sort()
print("simulated annealing: T0=1.0 alpha=0.9995, 100 pinned starts (seed 7)")
print("solved (h = 0):", solved)
print("stuck  (h > 0):", 100 - solved)
print("steps to solution: min %d, median %d, max %d"
      % (steps_solved[0], round(statistics.median(steps_solved)), steps_solved[-1]))
print()
print("run 0 -- the board lesson a-09's hill climb stranded on:")
print("  start", run0[0], " h =", attacking_pairs(run0[0]))
print("  final", run0[1], " h =", run0[2], " after", run0[3], "steps")`,
      output: `simulated annealing: T0=1.0 alpha=0.9995, 100 pinned starts (seed 7)
solved (h = 0): 100
stuck  (h > 0): 0
steps to solution: min 23, median 1317, max 4515

run 0 -- the board lesson a-09's hill climb stranded on:
  start (5, 2, 6, 0, 1, 1, 5, 0)  h = 6
  final (3, 7, 4, 2, 0, 6, 1, 5)  h = 0  after 725 steps`,
      walkthrough: [
        "The starts are the pinned ones: `random.seed(7)` then 100 successive 8-tuples, generated BEFORE any annealing so every run sees the same boards lesson a-09 climbed — where steepest ascent solved 13 and stranded 87.",
        "The proposal is first-choice, not steepest: one random column, one random new row (resampled if it leaves the board unchanged). Nobody scans 56 neighbors here — the single exponential does that work instead.",
        "The acceptance line is the Metropolis rule verbatim: `delta <= 0 or random.random() < math.exp(-delta / T)`. Note the short circuit — the roll is drawn only when the move is bad, so the whole experiment is a deterministic function of the seed: rerun the file and the same 100/100, with these very step counts, comes back.",
        "The measurement: 100 of 100 starts solved, median 1,317 steps, worst 4,515 — every run finished far inside its 100,000-step budget. Against hill climbing's 13 of 100 on identical boards, that is the price of one exponential: bad moves accepted early, priced out late.",
        "Run 0 is the callback. Lesson a-09 showcased this very start — its climb walked from h = 6 to a strand at h = 1 with all 56 neighbors evaluated, none improving and two merely tying. Annealing reaches h = 0 in 725 steps, and it does so the only way it can: instrumenting this run (same seed, same first anneal call) counts 82 accepted improvements, 132 accepted ties, 79 accepted WORSE moves — the walk visits boards as bad as h = 10 on the way, worse than where it started.",
      ],
      project:
        "Lesson a-09's harness with a schedule bolted on — keep both files; T0, α and the step budget are the knobs your own experiments turn.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "What is actually guaranteed",
      text: "The honesty this measurement invites us to skip: annealing's convergence theory is real, and it does not cover the schedule we just ran. The classical result — Geman and Geman (1984), sharpened by Hajek (1988) — is that the run converges to a GLOBAL optimum only if the temperature falls no faster than a logarithmic schedule, T proportional to 1/log(k), and such schedules cool so slowly (after a million steps the system has barely cooled at all) that no practical run affords them. Geometric cooling is the pragmatic heuristic: give up the theorem, keep a tractable schedule — it solved 100 of 100 boards here, on this landscape, and that is a measurement, not a guarantee. Note too the bridge back to lesson a-09: pin T at any small constant and the loop degenerates into hill climbing (with a plateau-crossing habit, since ties stay free) — a frozen schedule is not a new algorithm but the old climber, and left frozen it will reproduce the strandings. Slow cooling approaches the global optimum for exactly the reason the theorem is unaffordable: staying hot long enough to escape every basin takes astronomical time.",
    },
    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-10-e1",
      exerciseKind: "predict-output",
      prompt:
        "Without running it, predict the exact stdout of this program — all three lines, exactly as printed. Then answer in one sentence: why do the first and third lines agree?",
      starter: `from math import exp

def p_accept(delta_e, T):
    """Metropolis: probability of accepting a proposal that adds
    delta_e attacking pairs at temperature T."""
    if delta_e <= 0:
        return 1.0
    return exp(-delta_e / T)

print("dE=4, T=2.0 :", round(p_accept(4, 2.0), 4))
print("dE=4, T=0.5 :", round(p_accept(4, 0.5), 4))
print("dE=1, T=0.5 :", round(p_accept(1, 0.5), 4))`,
      expectedOutput: `dE=4, T=2.0 : 0.1353
dE=4, T=0.5 : 0.0003
dE=1, T=0.5 : 0.1353`,
      solution: `dE=4, T=2.0 : 0.1353
dE=4, T=0.5 : 0.0003
dE=1, T=0.5 : 0.1353

The first and third lines agree because the exponent is the RATIO: -4/2.0 = -2
and -1/0.5 = -2, so both bad moves pass with e^(-2) = 0.1353352832... rounded
to 0.1353. The middle line reprices the same delta_e = 4 at half the
temperature: e^(-8) = 0.0003354626... rounds to 0.0003.`,
      explanation:
        "The Metropolis rule prices ΔE/T, never ΔE alone: a four-pair worsening at T = 2.0 and a one-pair worsening at T = 0.5 both ask e^(−2) ≈ 0.1353. The middle line shows the same move repriced by cooling — e^(−8) ≈ 0.0003, roughly 400 times rarer. Same budget of disorder, same odds; what it buys shrinks as T falls.",
      concepts: ["Metropolis acceptance", "acceptance probability", "temperature"],
    },
    {
      kind: "exercise",
      id: "a-10-e2",
      exerciseKind: "trace",
      prompt:
        "Hand-trace the Metropolis rule. An 8-queens annealing run is at temperature T = 2.0. For each proposal below, ΔE is the change in attacking pairs; where a roll is given, u is the value drawn by random.random() for the acceptance test. Write ACCEPT or REJECT for each, showing the threshold whenever one applies. (a) ΔE = −1, no roll needed. (b) ΔE = 0, no roll needed. (c) ΔE = +2, u = 0.30. (d) ΔE = +2, u = 0.50. (e) ΔE = +4, u = 0.30. (f) Now cooled to T = 0.5: ΔE = +1, u = 0.10.",
      solution:
        "(a) ACCEPT — an improvement; the rule's free half, no roll drawn. (b) ACCEPT — a tie (ΔE = 0 ≤ 0) is also free; ties are what let the walk cross plateaus. (c) Threshold e^(−2/2.0) = e^(−1) ≈ 0.3679; u = 0.30 < 0.3679, so ACCEPT. (d) Same threshold 0.3679; u = 0.50 > 0.3679, so REJECT — the identical move, refused because the roll came up higher. (e) Threshold e^(−4/2.0) = e^(−2) ≈ 0.1353; u = 0.30 > 0.1353, so REJECT. (f) Threshold e^(−1/0.5) = e^(−2) ≈ 0.1353 — exactly case (e)'s threshold; u = 0.10 < 0.1353, so ACCEPT.",
      explanation:
        "The comparison is always u < e^(−ΔE/T): improvements and ties skip the roll entirely, and the ratio ΔE/T — never ΔE alone — sets the threshold. Cases (e) and (f) share the threshold e^(−2) because 4/2.0 = 1/0.5: cooling is a currency devaluation. The odds that bought a four-pair worsening at T = 2.0 buy only a one-pair worsening at T = 0.5 — and by the end of the schedule they buy nothing at all.",
      concepts: ["Metropolis acceptance", "bad moves", "temperature"],
    },
    {
      kind: "exercise",
      id: "a-10-e3",
      exerciseKind: "concept-check",
      prompt:
        "Judgment call. Your measured run — geometric cooling, T0 = 1.0, α = 0.9995 — solved 100 of the 100 pinned boards. A colleague writes in the project's README: \"Simulated annealing is PROVEN to converge to the global optimum, so our solver is guaranteed to solve every board it is given.\" What is the honest correction?",
      options: [
        {
          text: "The proof is real but covers a different schedule: convergence to the global optimum is guaranteed only for logarithmically slow cooling — T proportional to 1/log(k) — which cools so slowly no practical run affords it. Geometric cooling is a heuristic that performed perfectly on these 100 boards; that is a measurement, not a guarantee",
          correct: true,
          feedback:
            "Correct — and note what this does NOT say: the algorithm is not junk, and the theorem is not fiction. The theorem (Geman and Geman 1984; Hajek 1988) demands a schedule we cannot afford to run, so practice trades the guarantee for tractability and reports measurements honestly.",
        },
        {
          text: "No correction — the README is accurate as written",
          correct: false,
          feedback:
            "Both halves overclaim. The guarantee attaches to logarithmic schedules, not geometric ones; and a 100-run sample on one landscape cannot confirm a guarantee — that is what a theorem is for.",
        },
        {
          text: "The correction is that the proof applies only to 8-queens; other problems need their own proofs",
          correct: false,
          feedback:
            "The convergence theory is about schedules over landscapes in general — nothing in it is 8-queens-specific. The flaw in the README is the schedule, not the puzzle.",
        },
        {
          text: "The guarantee holds as long as the starting temperature T0 is chosen large enough",
          correct: false,
          feedback:
            "The theorem constrains the DECAY RATE of T, not its starting point. Any geometric schedule — however hot its start — cools exponentially fast and falls outside the guaranteed regime.",
        },
      ],
      solution:
        "The honest correction: the classical convergence result (Geman and Geman 1984; Hajek 1988) guarantees that annealing reaches a global optimum only when the temperature falls no faster than logarithmically — T proportional to 1/log(k) — and such schedules are so slow that no practical run affords them. Geometric cooling, ours, is a pragmatic heuristic: on these 100 pinned boards it solved 100; on another landscape or seed it may strand — and a measurement, however good, is not a theorem. Ship the solver, state the schedule, keep the two claims separate.",
      explanation:
        "Two currencies again, exactly as in lesson a-09's restart arithmetic: measurements tell you what happened on the runs you took; theorems tell you what must happen on every run that meets the hypothesis. The engineering discipline is knowing which one you are holding — the README was holding the wrong one.",
      concepts: ["simulated annealing", "temperature schedule", "convergence guarantee"],
    },
  ],
  terms: [
    {
      term: "simulated annealing",
      definition:
        "Local search that takes worse moves on purpose: improvements and ties are accepted outright, a worse move with probability e^(−ΔE/T), and the temperature T falls on a schedule — hot explores, cold exploits, and the schedule decides when the switch happens.",
    },
    {
      term: "temperature schedule",
      definition:
        "The fixed plan for lowering T over the run — geometrically, T ← α·T per step with α close to 1, in practice; logarithmically, T proportional to 1/log(k), in the theory that carries the convergence guarantee.",
    },
    {
      term: "bad move",
      definition:
        "A proposal that worsens the objective (ΔE > 0) — on 8-queens, one that adds attacking pairs. Every path out of a local optimum begins with a bad move, which is why annealing budgets for them early and prices them out late.",
    },
    {
      term: "Metropolis acceptance rule",
      definition:
        "The 1953 statistical-mechanics rule e^(−ΔE/T): a worse state is accepted with a probability that shrinks as the damage grows and as the temperature falls. Improvements and ties are accepted outright — the rule only ever prices bad moves.",
    },
  ],
  mistakes: [
    {
      mistake: "Cooling far too fast — α like 0.9, or a step budget of a few hundred.",
      why:
        "The temperature collapses almost immediately (0.9^40 ≈ 0.015, after which a ΔE = 1 move passes with probability e^(−67) ≈ 0), worse moves are priced out before the walk has explored anything, and the run is hill climbing with extra steps — lesson a-09's strandings return.",
      fix: "α close to 1 (0.995–0.9995) and a budget of thousands of steps or more, so the hot phase actually happens; when in doubt, log the acceptance rate of bad moves over time and check that it decays smoothly rather than cliff-drops.",
    },
    {
      mistake: "Inverting the exponent — e^(−T/ΔE), or e^(−ΔE·T).",
      why:
        "A ratio slip in the exponent silently inverts the intended behavior: at high T the probability then approaches 0, so the run is strictest at exactly the moment it should be loosest, and nobody notices because the code still runs.",
      fix: "The exponent is −ΔE/T. Sanity-check against the two limits before trusting any run: high T must accept nearly everything, T near 0 nearly nothing.",
    },
    {
      mistake: "Choosing T0 without regard to the objective's scale.",
      why:
        "The probabilities depend on the ratio ΔE/T, so a T0 that is large for one objective is freezing for another: with attacking-pair deltas of 1–4, T0 = 10 starts as a random walk and T0 = 0.01 starts as a climb from step one.",
      fix: "Pick T0 so a typical early bad move (ΔE ≈ 1 or 2 on 8-queens) has an appreciable pass rate — odds between e^(−1/2) and e^(−1) — and let α and the budget do the rest.",
    },
    {
      mistake: "Reporting a budget-exhausted run as a solve.",
      why:
        "The loop can end because the step budget ran out, not because h reached 0; without testing the final board, stranded runs get counted as successes and the measurement flatters the algorithm.",
      fix: "Test the returned h against the goal (h = 0), as the lesson's solved/stuck split does — the same halt-versus-solved discipline lesson a-09's first mistake demanded.",
    },
  ],
  takeaways: [
    "The Metropolis rule: improvements and ties are free; a bad move passes with probability e^(−ΔE/T) — the ratio is everything (e^(−2) ≈ 0.135 buys ΔE = 4 at T = 2.0 but only ΔE = 1 at T = 0.5).",
    "The two limits: high T is a random walk, T → 0 is hill climbing — annealing is the whole continuum between them, and the schedule is the steering.",
    "Geometric cooling T ← α·T with α near 1: measured on the 100 pinned seed-7 boards, 100 of 100 solved (median 1,317 steps, worst 4,515) against hill climbing's 13 of 100 in lesson a-09.",
    "Honesty about the theory: convergence to the global optimum is guaranteed only for logarithmically slow schedules no practical run affords — geometric cooling is a heuristic that works well on many landscapes, and 100/100 is a measurement, not a theorem.",
    "Freeze the schedule (T pinned low) and annealing degenerates into hill climbing with a plateau-crossing habit — the family is one dial, and the dial's position over time is the whole design.",
  ],
  quiz: [
    {
      id: "a-10-q1",
      prompt:
        "An annealing run at temperature T = 0.5 is offered a move that would add one attacking pair (ΔE = +1). Under the Metropolis rule, with what probability is it accepted?",
      options: [
        {
          text: "e^(−2) ≈ 0.135",
          correct: true,
          feedback:
            "Correct — the exponent is −ΔE/T = −1/0.5 = −2, so the move passes about 13.5% of the time: cool enough to sting, hot enough to occasionally escape.",
        },
        {
          text: "e^(−0.5) ≈ 0.607",
          correct: false,
          feedback:
            "That is e^(−ΔE·T): the temperature multiplied instead of divided. Sanity-check with the limits — under that formula higher T would make bad moves RARER, the opposite of annealing's design.",
        },
        {
          text: "e^(−1) ≈ 0.368",
          correct: false,
          feedback:
            "That is e^(−ΔE) with the temperature dropped from the exponent — the answer only at T = 1. The rule is a ratio: ΔE/T, and here 1/0.5 = 2.",
        },
        {
          text: "0 — a worse move is never accepted",
          correct: false,
          feedback:
            "Never is hill climbing's rule, and hill climbing is exactly the T → 0 limit. At any positive temperature the probability is positive, however small.",
        },
      ],
      explanation:
        "One division carries the whole rule: the exponent is −ΔE/T. Everything the schedule does — loose early, strict late — is just moving this ratio.",
    },
    {
      id: "a-10-q2",
      prompt: "Take the annealing loop to its two extremes. Which pairing is correct?",
      options: [
        {
          text: "T very high: a random walk, nearly every proposal accepted; T → 0: hill climbing, only improvements and ties survive",
          correct: true,
          feedback:
            "Correct — e^(−ΔE/T) → 1 as T grows, so the objective barely matters, and → 0 as T → 0, so worse moves are priced out. The cold limit is precisely the climber that stranded 87 of 100 boards in lesson a-09.",
        },
        {
          text: "T very high: hill climbing; T → 0: a random walk",
          correct: false,
          feedback:
            "Swapped. High temperature LOOSENS the rule (the exponent collapses toward 0, so accept); low temperature TIGHTENS it (the exponent dives, so reject).",
        },
        {
          text: "Both extremes behave identically — the acceptance probability does not actually depend on T",
          correct: false,
          feedback:
            "T sits in the denominator of the exponent: ΔE/T. It is the only dial in the rule, and both limits are real and different.",
        },
        {
          text: "T very high: uniform-cost search; T → 0: greedy best-first search",
          correct: false,
          feedback:
            "Wrong family — those are frontier algorithms with paths, costs and bookkeeping. Annealing keeps one state and no path, whatever its temperature.",
        },
      ],
      explanation:
        "Temperature is a dial between disorder and greed, and cooling is the scheduled turn of that dial — which is why a frozen schedule is just lesson a-09 again.",
    },
    {
      id: "a-10-q3",
      prompt:
        "The README claims: \"simulated annealing is PROVEN to converge to the global optimum — our 100/100 run confirms the guarantee.\" Which part is wrong?",
      options: [
        {
          text: "The proof exists but belongs to a different schedule: convergence to the global optimum is guaranteed only for logarithmically slow cooling (T proportional to 1/log(k)), which no practical run affords — and 100/100 is a measurement on one landscape, not a confirmation",
          correct: true,
          feedback:
            "Correct — the theorem (Geman and Geman 1984; Hajek 1988) is real, its hypothesis is logarithmic cooling, and exponential decay does not meet it. Measurement and guarantee are different currencies.",
        },
        {
          text: "Nothing — the statement is accurate as written",
          correct: false,
          feedback:
            "Both halves overclaim: the guarantee is schedule-dependent (logarithmic, not geometric), and a finite experiment cannot confirm a guarantee — that is what theorems are for.",
        },
        {
          text: "The proof only covers 8-queens; other problems need their own proofs",
          correct: false,
          feedback:
            "The convergence theory is about schedules over landscapes in general, not about this puzzle — the flaw in the README is the schedule, not the problem.",
        },
        {
          text: "The guarantee holds provided the START temperature T0 is large enough",
          correct: false,
          feedback:
            "The theorem constrains how fast T FALLS, not where it starts. A huge T0 with geometric decay still cools exponentially fast and exits the guaranteed regime within thousands of steps.",
        },
      ],
      explanation:
        "State both halves plainly: logarithmically slow cooling converges to the global optimum (unaffordably slowly), and geometric cooling works well in practice without carrying that guarantee.",
    },
  ],
};
