/**
 * PART A — FOUNDATIONS: Numbers and How They Behave
 *
 * Nine lessons, zero assumptions: numbers, fractions, decimals, percentages,
 * ratios, proportions, powers, roots, logarithms. The part everything else
 * in data science quietly stands on.
 *
 * Authoring rules (mirrored in scripts/verify-math-outputs.ts):
 *   - Every Python output is computed, never hand-written (COMPUTE + --fix).
 *   - Every lesson walks all ten pedagogical steps.
 *   - Prerequisites: each lesson includes the previous one (the spine).
 */
import type { MathPart } from "@/lib/mathcourse/types";
import { numberline, flowDiagram } from "@/lib/mathcourse/svgfig";

export const partA: MathPart = {
  letter: "A",
  title: "Foundations: Numbers and How They Behave",
  tagline: "The number sense data work quietly assumes — rebuilt from zero",
  description:
    "Fractions you last met at age twelve. Percentages that always felt like traps. Logarithms you " +
    "have been pretending to understand. This part takes all of it back to the number line, where every " +
    "rule becomes something you can see and touch — and shows where each one hides inside data work.",
  outcomes: [
    "Move around the number line with confidence — negatives, fractions, decimals, all of it",
    "Compute percentages, ratios and proportional splits without the classic traps",
    "See powers, roots and logarithms as one single family of ideas",
    "Verify every arithmetic claim in Python instead of trusting anyone's mental math",
  ],
  lessons: [
    // =========================================================================
    // a-01 — NUMBERS
    // =========================================================================
    {
      slug: "a-01",
      title: "Numbers: The Line You Already Know How to Walk",
      minutes: 30,
      summary:
        "The number line — the one picture that makes negatives, order, and distance obvious — and the families of numbers data work actually uses.",
      objectives: [
        "Place any number — negative, fraction, or decimal — on the number line",
        "Add and subtract signed numbers by walking, not by memorizing sign rules",
        "Use absolute value as distance, not as 'chop off the minus'",
        "Name the number families (integers, rationals, irrationals) and say why data people care",
      ],
      prerequisites: [],

      analogy: {
        scene:
          "You are in a hotel. The lobby is floor 0. You ride up to floor 3 to visit a friend, then discover the gym is in the basement, three floors below the lobby. The elevator never asks whether '3' is a scary number — it just counts floors up from the lobby, and floors below the lobby get a minus sign. Nobody in that elevator is bad at math. Everybody in that elevator reads floor −2 without blinking, because the building gave them a picture: a vertical line of floors with the lobby in the middle.",
        bridge:
          "Mathematicians use exactly that picture — rotated to horizontal — for all numbers. It is called the number line, and once you see every number as a position on it, subtraction, negatives, and distance stop being rules to memorize and start being walks you already know how to take.",
      },

      intuition: [
        "Draw a horizontal line, pick any point on it, and call that point zero. Pick a direction (right) and a step size, and mark off 1, 2, 3… going right. The same marks going left get minus signs: −1, −2, −3. That is the whole machine. Every number is just a place on this line, and 'bigger' always means 'further right' — which settles every ordering argument instantly: −7 is smaller than −2 for the same reason floor −7 is lower than floor −2. Nothing about seven being 'bigger' than two matters; position beats size.",
        "Addition is walking. To compute 3 + (−8), stand at 3 and walk 8 steps in the direction the second number points — left, because it is negative. You pass 0 and land at −5. Subtraction is the same walk in reverse: 3 − 8 means stand at 3, then walk 8 steps against the direction of 8 — against right means left — so you also land at −5. This is why every 'two negatives make a plus' rule is really just a statement about walking directions, and why −(−5) is 5: reversing a reversal points you back the original way.",
        "Distance is the last gift of the line. The distance between two numbers does not care which is bigger, so we measure it with absolute value: |a − b| is 'how far apart', always zero or positive. |−4| = 4 because −4 lives four steps from 0. Data science leans on this constantly: an error of −4 and an error of +4 are equally wrong, and 'how wrong' is a distance. The families of numbers — counting numbers, integers, fractions, and the endless-decimal numbers like π that no fraction can ever capture — are just progressively larger guest lists for who gets to stand on the line.",
      ],

      terminology: [
        {
          term: "Number line",
          symbol: "ℝ",
          plain: "The infinite ruler every number lives on; right means bigger.",
          formal: "A straight line in which every real number corresponds to exactly one point, ordered by position.",
        },
        {
          term: "Integer",
          symbol: "ℤ",
          plain: "Whole numbers and their negatives: … −2, −1, 0, 1, 2 …",
          formal: "The set {…, −2, −1, 0, 1, 2, …}; counts with direction, no fractions in between.",
        },
        {
          term: "Negative number",
          plain: "A position left of zero; a quantity owed or a direction reversed.",
          formal: "A real number x with x < 0; on the line, every point left of 0.",
        },
        {
          term: "Absolute value",
          symbol: "|x|",
          plain: "How far a number is from zero, ignoring direction.",
          formal: "|x| = x if x ≥ 0, and −x if x < 0; the distance from x to 0.",
        },
        {
          term: "Rational number",
          symbol: "ℚ",
          plain: "Any number you can write as a fraction of two integers.",
          formal: "Any p/q with p, q integers and q ≠ 0; its decimal expansion repeats or terminates.",
        },
        {
          term: "Irrational number",
          plain: "Numbers no fraction can ever pin down — decimals that run forever without repeating.",
          formal: "A real number that is not rational, e.g. √2 or π; its decimal expansion is infinite and non-repeating.",
        },
      ],

      visuals: [
        {
          kind: "lab",
          lab: "number-line",
          title: "Drag two numbers, then zoom in",
        },
        {
          kind: "figure",
          spec: {
            svg: numberline({
              min: -8,
              max: 8,
              marks: [
                { at: -5, label: "−5", color: "#dc2626" },
                { at: 0, label: "0 (the lobby)", color: "#059669" },
                { at: 3, label: "3", color: "#0ea5e9" },
              ],
              shade: { from: -5, to: 3 },
            }),
            caption: "From −5 to 3: the shaded walk is 8 steps — that is |3 − (−5)|, the distance between them.",
            alt: "A number line from minus eight to eight with the points minus five, zero and three marked and the interval between minus five and three shaded.",
          },
        },
        {
          kind: "figure",
          spec: {
            svg: flowDiagram(["Counting 1, 2, 3…", "…plus zero & negatives: ℤ", "…plus all fractions: ℚ", "…plus √2, π and friends: ℝ"]),
            caption: "Each number family is the previous one plus more residents — every new member still gets a spot on the same line.",
            alt: "A flow diagram showing nested number families from counting numbers through integers and rationals to the reals.",
          },
        },
      ],

      derivation: {
        title: "Where the formula comes from: subtracting by walking backwards",
        intro:
          "School teaches 'minus minus makes plus' as a law from the sky. The line shows it is just walking directions — in three honest steps.",
        steps: [
          {
            do: "Say what subtraction means: from the first number, walk in the direction opposite to the second number.",
            math: "3 − 5   means: start at 3, walk 5 steps LEFT (against 5's direction)",
            why: "Subtracting a number undoes adding it — an anti-walk.",
          },
          {
            do: "Now subtract a negative: 3 − (−5). The second number points LEFT, so walking against it means walking RIGHT.",
            math: "3 − (−5)   means: start at 3, walk 5 steps RIGHT",
            why: "The opposite of the opposite is the original direction.",
          },
          {
            do: "But 'walk 5 steps right' is exactly what adding +5 does. So removing a debt of 5 lands you where a gift of 5 would.",
            math: "3 − (−5) = 3 + 5 = 8",
          },
          {
            do: "Run the same logic on double negatives: −(−5) is 'the opposite of the opposite of 5', which points right again.",
            math: "−(−5) = +5      and in general   a − b = a + (−b)",
          },
        ],
        result: "Subtracting is adding the opposite: a − b = a + (−b), and −(−b) = b. Every sign rule is a walking direction.",
      },

      examples: [
        {
          title: "Example 1 — The cold front",
          problem: "At 9 a.m. the temperature is 4°C. Over six hours it drops 11 degrees, then rises 3. What is the final temperature?",
          steps: [
            { do: "Start at 4 on the line.", math: "position = 4" },
            { do: "A drop of 11 is a walk of −11: pass 0, keep going 7 more steps left.", math: "4 + (−11) = −7" },
            { do: "A rise of 3 walks right from −7.", math: "−7 + 3 = −4" },
          ],
          answer: "−4°C (four below zero).",
          check: {
            code: "temp = 4\nfor change in (-11, 3):\n    temp = temp + change\nprint(temp)\nprint(abs(temp), 'degrees from zero')",
            output: "-4\n4 degrees from zero",
            note: "Python's abs() is exactly our |·|: distance from zero.",
          },
        },
        {
          title: "Example 2 — Who is closer?",
          problem: "Two predictions miss a target of 0: model A lands at −4.2, model B at +3.9. Which prediction is closer to the truth, and by how much?",
          steps: [
            { do: "Closeness to 0 is distance: absolute value.", math: "|−4.2| = 4.2      |3.9| = 3.9" },
            { do: "Compare distances: 3.9 < 4.2, so model B sits nearer zero.", math: "3.9 − 3.9 = 0? no — compare: 4.2 − 3.9 = 0.3" },
            { do: "Model B wins by 0.3 units of error.", math: "|−4.2| − |3.9| = 0.3" },
          ],
          answer: "Model B is closer to the target by 0.3 — and notice the sign of each error told us direction (too low vs too high), while the absolute value told us how wrong.",
        },
      ],

      programming: {
        intro:
          "The number line is a mental model; Python is where you stop doing it in your head. Signed arithmetic, ordering, and distance all have direct built-ins, and sorting a mixed list of positives and negatives is the number line doing your bidding.",
        code: "readings = [-2.5, 3, 0, -7.25, 1.5, -0.5]\n\nprint('sorted (left to right on the line):', sorted(readings))\nprint('smallest:', min(readings), ' largest:', max(readings))\nprint('range they span:', max(readings) - min(readings))\n\nfor r in readings:\n    print(f'{r:+.2f} is {abs(r):.2f} from zero')",
        output: "sorted (left to right on the line): [-7.25, -2.5, -0.5, 0, 1.5, 3]\nsmallest: -7.25  largest: 3\nrange they span: 10.25\n-2.50 is 2.50 from zero\n+3.00 is 3.00 from zero\n+0.00 is 0.00 from zero\n-7.25 is 7.25 from zero\n+1.50 is 1.50 from zero\n-0.50 is 0.50 from zero",
        explanation: [
          "`sorted()` lays the values left to right on the number line — no sign rules needed, position decides.",
          "`min` and `max` are the two ends of the walk; their difference is the span, exactly the |max − min| distance.",
          "The `f'{r:+.2f}'` format forces the sign to appear (even +), which makes direction explicit in reports.",
          "`abs()` is the absolute value: the distance reading that treats −7.25 and +7.25 as equally far from the truth.",
        ],
      },

      mlConnection: {
        title: "Where machine learning feels this lesson",
        body: [
          "Every dataset is a table of numbers, and before any model sees them, someone asks: where is zero, and what does one step mean? Feature scaling — moving and stretching columns so they sit in comparable ranges — is literally arithmetic on number-line positions: subtract the mean (slide the line so the center is 0) and divide by the spread (choose the step size). A model comparing 'salary: 0 to 200,000' with 'age: 0 to 90' is comparing walks measured with wildly different rulers, and it gets dizzy in exactly the way you would.",
          "Signed numbers also carry direction in every error signal. A prediction of −4 versus +4 points tells a regression model which way to push its next guess, while the absolute value |error| tells it how much to care. When you later meet gradient descent, you will find it is nothing but this: read the sign, feel the distance, take a step.",
        ],
        usedBy: ["feature standardization", "error metrics (MAE)", "gradient directions", "temperature/offset features"],
      },

      exercises: [
        {
          id: "a-01-e1",
          tier: "beginner",
          title: "Ordering and walking",
          prompt:
            "A diver starts at depth 2 metres below the surface (position −2 on a vertical line, where 0 is the surface). She descends 5 more metres, then rises 8 metres, then descends 1 metre. (a) Where does she end up? (b) How far is that from the surface? (c) What single number describes her total descent below the start?",
          hint: "Track position as a running total; 'descends 5' means add −5.",
          solution: {
            approach:
              "Keep one running position, updating it with a signed step for each move; then read distances off the line with absolute value.",
            steps: [
              { do: "Start at −2 and descend 5 (add −5).", math: "−2 + (−5) = −7" },
              { do: "Rise 8 (add +8).", math: "−7 + 8 = +1" },
              { do: "Descend 1 (add −1).", math: "1 + (−1) = 0" },
              { do: "Distance from surface (position 0):", math: "|0 − 0| = 0 — she ends exactly at the surface." },
              { do: "Total descent below the START (−2) is measured by how far the lowest point, −7, sat below −2:", math: "|−7 − (−2)| = 5 metres at the deepest." },
            ],
            answer: "Ends at 0 (the surface); distance to surface 0 m; deepest point 5 m below her start.",
            check: {
              code: "pos = -2\nfor step in (-5, 8, -1):\n    pos += step\nprint('final position:', pos)\nprint('distance from surface:', abs(pos - 0))",
              output: "final position: 0\ndistance from surface: 0",
            },
          },
        },
        {
          id: "a-01-e2",
          tier: "intermediate",
          title: "Errors as signed distances",
          prompt:
            "Five temperature forecasts (in °C) are compared against the actual value, 2.0. The predictions are: 5.5, −1.0, 2.0, −4.5, 3.5. For each, compute the signed error (prediction minus actual) and the absolute error. Which forecast was best? What is the mean signed error, and why is it smaller in size than the mean absolute error?",
          hint: "Signed error = prediction − actual (keeps direction); absolute error = |signed error| (keeps only size).",
          solution: {
            approach:
              "Compute each error as a signed number, then take absolute values for the 'how wrong' column; average both columns and compare what each average means.",
            steps: [
              { do: "Signed errors (prediction − 2.0):", math: "+3.5,  −3.0,  0.0,  −6.5,  +1.5" },
              { do: "Absolute errors:", math: "3.5,  3.0,  0.0,  6.5,  1.5" },
              { do: "Best forecast: smallest absolute error — the third one (exactly right).", math: "min |error| = 0.0" },
              { do: "Mean signed error (bias — does the forecaster run hot or cold?):", math: "(3.5 − 3.0 + 0.0 − 6.5 + 1.5) / 5 = −4.5/5 = −0.9" },
              { do: "Mean absolute error (typical miss size):", math: "(3.5 + 3.0 + 0.0 + 6.5 + 1.5) / 5 = 14.5/5 = 2.9" },
              { do: "The bias is smaller because opposite signs cancel; the MAE has nowhere to hide.", math: "|−0.9| < 2.9" },
            ],
            answer: "Best: the 2.0 forecast (zero error). Mean signed error −0.9°C (runs slightly cold on average); mean absolute error 2.9°C. Signed errors cancel; distances don't — that's why we track both.",
            check: {
              code: "actual = 2.0\npreds = [5.5, -1.0, 2.0, -4.5, 3.5]\nerrs = [p - actual for p in preds]\nprint('signed:', [round(e, 2) for e in errs])\nprint('absolute:', [abs(e) for e in errs])\nprint('bias:', sum(errs) / len(errs))\nprint('MAE:', sum(abs(e) for e in errs) / len(errs))",
              output: "signed: [3.5, -3.0, 0.0, -6.5, 1.5]\nabsolute: [3.5, 3.0, 0.0, 6.5, 1.5]\nbias: -0.9\nMAE: 2.9",
            },
          },
        },
        {
          id: "a-01-e3",
          tier: "advanced",
          title: "The number line as a data story",
          prompt:
            "A small store's daily profit (in hundreds) over a week is [−3, −1, 2, −2, 5, 4, −5]. Compute: (a) the total for the week; (b) the number of profitable days (position > 0); (c) the biggest single-day swing between consecutive days; (d) the day index (0-based) of the worst day. Verify each answer in Python with the exact numbers above.",
          hint: "Consecutive swings are differences between neighbours: swing_i = day[i+1] − day[i]; the biggest swing is the max absolute value of those.",
          solution: {
            approach:
              "Translate each question into one number-line operation: total = sum (a walk), profitable days = count of positives, swings = consecutive differences, worst day = position of the minimum.",
            steps: [
              { do: "Total: add all seven signed numbers.", math: "−3 −1 +2 −2 +5 +4 −5 = 0 — the week breaks even." },
              { do: "Profitable days: count positions right of 0.", math: "days > 0: 2, 5, 4 → 3 days" },
              { do: "Consecutive swings: differences between neighbours.", math: "swings: +2, +3, −4, +7, −1, −9" },
              { do: "Biggest swing by absolute value:", math: "|−9| = 9 (from +4 on day 5 down to −5 on day 6)" },
              { do: "Worst day: minimum position.", math: "min = −5 at index 6" },
            ],
            answer: "Week total 0 (break-even); 3 profitable days; biggest swing 9 (hundreds) between Friday's +4 and Saturday's −5; worst day is index 6 (−500).",
            check: {
              code: "week = [-3, -1, 2, -2, 5, 4, -5]\nprint('total:', sum(week))\nprint('profitable days:', sum(1 for d in week if d > 0))\nswings = [week[i+1] - week[i] for i in range(len(week) - 1)]\nprint('swings:', swings)\nprint('biggest swing:', max(abs(s) for s in swings))\nprint('worst day index:', week.index(min(week)), 'with', min(week))",
              output: "total: 0\nprofitable days: 3\nswings: [2, 3, -4, 7, -1, -9]\nbiggest swing: 9\nworst day index: 6 with -5",
            },
          },
        },
      ],

      quiz: [
        {
          id: "a-01-q1",
          prompt: "Which list is in order from smallest to largest?",
          options: ["−3, −7, 0, 2", "−7, −3, 0, 2", "0, −3, −7, 2", "2, 0, −3, −7"],
          correctIndex: 1,
          explanation:
            "On the line, 'smaller' means further left: −7 < −3 < 0 < 2. The common error is ranking by 'size with the minus ignored' (−3 before −7), which is exactly backwards for negatives.",
        },
        {
          id: "a-01-q2",
          prompt: "What is 5 − 12?",
          options: ["7", "−7", "17", "−17"],
          correctIndex: 1,
          explanation: "Stand at 5 and walk 12 left — you cross 0 after 5 steps and continue 7 more: −7. Or see it as 5 + (−12) = −7.",
        },
        {
          id: "a-01-q3",
          prompt: "The distance between −5 and 3 on the number line is:",
          options: ["2", "8", "−8", "15"],
          correctIndex: 1,
          explanation: "Distance is |3 − (−5)| = |3 + 5| = 8. It can never be negative, and it counts the whole walk from one point to the other — 5 steps to reach 0, then 3 more.",
        },
      ],

      misconceptions: [
        {
          myth: "−7 is bigger than −2 because 7 is bigger than 2.",
          why: "We learn 'bigger number wins' before we ever meet negatives, and the habit sticks.",
          reality: "On the line, bigger always means further RIGHT. −7 sits left of −2, so −7 < −2 — floor −7 is lower than floor −2.",
        },
        {
          myth: "Absolute value means 'delete the minus sign'.",
          why: "That is literally what it looks like it does, most of the time.",
          reality: "It measures distance from zero. |x| = 4 asks 'which numbers live exactly 4 steps from 0?' and has TWO answers: 4 and −4. Deleting minus signs is a side effect, not the meaning.",
        },
        {
          myth: "Subtracting makes things smaller.",
          why: "With two positive numbers it always did, all through childhood.",
          reality: "Subtracting a negative ADDS: 3 − (−5) = 8. What shrinks a number is subtracting something to its right; direction is what matters, not the operation's name.",
        },
      ],

      takeaways: [
        "Every number is a position; 'bigger' means 'further right' — position beats habit.",
        "Addition is a walk, subtraction is the anti-walk; a − b = a + (−b) explains every sign rule at once.",
        "|a − b| is the distance between a and b — the birthplace of every 'how wrong were we?' metric.",
        "Integers, rationals and irrationals are guest lists on the same line; data brings all of them.",
      ],
    },
    // __APPEND_A__ (lessons a-02 … a-09 are authored into this slot)
  ],

  // =========================================================================
  // PART A ASSESSMENT
  // =========================================================================
  assessment: {
    questions: [
      {
        id: "a-as-1",
        prompt: "At sunrise the temperature is −3°C. It warms by 9 degrees by noon, then cools by 14 degrees after sunset. What is the final temperature?",
        options: ["−8°C", "8°C", "−20°C", "−2°C"],
        correctIndex: 0,
        explanation: "Walk it: −3 + 9 = +6, then 6 − 14 = −8. Keep one running position and let each signed step move it.",
      },
      {
        id: "a-as-2",
        prompt: "What is 3/4 − 1/6?",
        options: ["7/12", "2/3", "1/2", "2/12"],
        correctIndex: 0,
        explanation: "Fractions subtract only when they count the same-sized pieces: 3/4 = 9/12 and 1/6 = 2/12, so 9/12 − 2/12 = 7/12. Answering 2/6 (or 2/12) is the subtract-tops-and-bottoms trap; answering 2/3 forgets the smaller piece entirely.",
      },
      {
        id: "a-as-3",
        prompt: "Round 2.648 to one decimal place.",
        options: ["2.6", "2.7", "2.65", "2.5"],
        correctIndex: 1,
        explanation: "One decimal place means keep tenths: look at the hundredths digit (4) — under 5, so round down: 2.6. Rounding is choosing the nearest allowed position on a coarser number line.",
      },
      {
        id: "a-as-4",
        prompt: "A dataset of 400 rows grows by 25%, then shrinks by 25%. The final size is:",
        options: ["400", "375", "425", "390.625"],
        correctIndex: 1,
        explanation: "25% of 400 is +100 → 500; 25% of 500 is −125 → 375. Each percentage acts on its own starting amount.",
      },
      {
        id: "a-as-5",
        prompt: "Server A handles 9 requests for every 4 that server B handles. Together they served 650 requests. How many did B handle?",
        options: ["130", "200", "260", "450"],
        correctIndex: 1,
        explanation: "The ratio 9:4 splits the total into 9 + 4 = 13 parts; one part is 650/13 = 50, so B handled 4 × 50 = 200.",
      },
      {
        id: "a-as-6",
        prompt: "If log₁₀(x) = −2, what is x?",
        options: ["−100", "0.01", "100", "−20"],
        correctIndex: 1,
        explanation: "A logarithm counts tens: 10⁻² = 1/100 = 0.01. Negative logarithms are not negative numbers — they are small ones.",
      },
    ],
  },

  // =========================================================================
  // PART A WORKSHOP
  // =========================================================================
  workshop: {
    title: "Workshop A — The Change Report: percentages, ratios and honest arithmetic",
    brief:
      "You are handed a tiny sales ledger (hard-coded, deterministic) and must produce a human-readable change report: " +
      "percentage growth per product, share-of-total as a ratio and as a percentage, and a flag for any product whose " +
      "sign of change disagrees with the sign of the previous period. It is the first time all of Part A works as one " +
      "program — and the output you produce will be checked automatically against the machine-verified expected output.",
    requirements: [
      "Compute last-quarter and this-quarter percentage change per product: (new − old) / old × 100",
      "Compute each product's share of total this-quarter revenue, both as a ratio string 'a:b' against the top product and as a percentage",
      "Report the mean absolute percentage change across products",
      "Flag products whose change direction (sign) flipped versus the previous period's change",
      "Match the expected output EXACTLY (line for line) — use f-strings with one decimal place as shown in the starter's example line",
    ],
    steps: [
      "Write a function pct_change(old, new) that returns the percentage change as a float; guard against old == 0 by returning None and printing 'n/a (no base)'",
      "Write ratio(a, b) that reduces two integers to their simplest 'a:b' form (a gcd helper is three lines)",
      "Loop over the LEDGER rows, printing each product's report line: name, old → new, pct change, share %",
      "Compute shares as percentages of the total, and the mean absolute change across all products",
      "Finally print the flip-flag lines, then check your output against the expected output with the Check button",
    ],
    starter:
      "from math import gcd\n\nLEDGER = [\n    # name, last_qtr, this_qtr, prev_change_sign\n    ('Espresso', 1200, 1560, +1),\n    ('Latte', 2400, 2280, +1),\n    ('Mocha', 800, 940, -1),\n    ('Filter', 500, 500, -1),\n]\n\ndef pct_change(old, new):\n    # TODO: return (new - old) / old * 100, or None if old == 0\n    ...\n\ndef ratio(a, b):\n    # TODO: reduce a and b by gcd and return 'a:b'\n    ...\n\n# TODO: print header 'Product         old    new   change%  share%'\n# TODO: for each row print name, old, new, pct_change (one decimal), share of total (one decimal)\n# TODO: track abs changes to print 'Mean absolute change: X.X%'\n# TODO: print 'FLIP: <name>' when sign of pct_change != prev_change_sign\n",
    solution:
      "from math import gcd\n\nLEDGER = [\n    ('Espresso', 1200, 1560, +1),\n    ('Latte', 2400, 2280, +1),\n    ('Mocha', 800, 940, -1),\n    ('Filter', 500, 500, -1),\n]\n\ndef pct_change(old, new):\n    if old == 0:\n        return None\n    return (new - old) / old * 100\n\ndef ratio(a, b):\n    g = gcd(int(a), int(b))\n    return f'{a // g}:{b // g}'\n\ntotal = sum(row[2] for row in LEDGER)\nabs_changes = []\nprint('Product         old    new   change%  share%')\nfor name, old, new, prev_sign in LEDGER:\n    change = pct_change(old, new)\n    share = new / total * 100\n    abs_changes.append(abs(change))\n    print(f'{name:<10} {old:>6} {new:>6} {change:>8.1f} {share:>6.1f}')\nprint(f'Mean absolute change: {sum(abs_changes) / len(abs_changes):.1f}%')\nbest = max(LEDGER, key=lambda r: r[2])\nfor name, old, new, prev_sign in LEDGER:\n    change = pct_change(old, new)\n    if change is not None and (change > 0) - (change < 0) != prev_sign:\n        print(f'FLIP: {name} ({ratio(new, best[2])} vs top product)')\n",
    expectedOutput: "Product         old    new   change%  share%\nEspresso     1200   1560     30.0   29.5\nLatte        2400   2280     -5.0   43.2\nMocha         800    940     17.5   17.8\nFilter        500    500      0.0    9.5\nMean absolute change: 13.1%\nFLIP: Latte (1:1 vs top product)\nFLIP: Mocha (47:114 vs top product)\nFLIP: Filter (25:114 vs top product)",
    concepts: ["signed numbers", "percentage change", "ratios and shares", "absolute value"],
  },
};
