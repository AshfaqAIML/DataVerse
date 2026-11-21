/**
 * The prerequisite diagnostic — 24 questions, one per foundational idea,
 * each mapped to the lesson that teaches it.
 *
 * Rules (enforced by scripts/verify-math-outputs.ts):
 *   - 6 questions on Part A, 6 on B, 5 on C, 4 on D, 3 on E.
 *   - Every `gates` slug must exist and belong to the question's part.
 *   - Exactly one correct option; distractors encode real misconceptions
 *     (sign slips, add-tops-and-bottoms, unflipped inequalities,
 *     percentage-of-nothing, order-of-multiplication confusion).
 *   - Tone: calm, no trick questions, school-level first.
 */
import type { DiagnosticSpec } from "@/lib/mathcourse/types";

export const MATH_DIAGNOSTIC: DiagnosticSpec = {
  intro:
    "This is not an exam. It is a compass. Twenty-four short questions — from " +
    "school arithmetic to the first taste of calculus — that find where your foundations " +
    "stand, so the course can start you exactly where you belong: never bored, never drowned. " +
    "You can skip anything, retake any time, and nothing is graded.",
  questions: [
    // ---------------- Part A: Foundations (6) ----------------
    {
      id: "diag-01",
      part: "A",
      gates: "a-01",
      prompt: "The temperature was 3°C at noon, then dropped 8 degrees. What is the temperature now?",
      options: ["5°C", "−5°C", "11°C", "−11°C"],
      correctIndex: 1,
      explanation:
        "Dropping 8 from 3 means 3 − 8. On the number line you start at 3 and walk 8 steps left, past 0: you land at −5. Answering 5 is the classic 'forgot the direction' slip.",
    },
    {
      id: "diag-02",
      part: "A",
      gates: "a-02",
      prompt: "What is 1/2 + 1/3?",
      options: ["2/5", "2/6", "5/6", "1/5"],
      correctIndex: 2,
      explanation:
        "Fractions only add once they count the same-sized pieces: 1/2 = 3/6 and 1/3 = 2/6, so the sum is 5/6. Adding tops and bottoms (2/5) is the most common fraction mistake there is.",
    },
    {
      id: "diag-03",
      part: "A",
      gates: "a-03",
      prompt: "What is 0.3 × 0.2?",
      options: ["0.6", "0.06", "0.02", "6"],
      correctIndex: 1,
      explanation:
        "3 × 2 = 6, and the two numbers carry one decimal place each, so the product carries two: 0.06. Answering 0.6 forgets that multiplying by a number smaller than 1 makes things smaller.",
    },
    {
      id: "diag-04",
      part: "A",
      gates: "a-04",
      prompt: "A price of 80 rises by 25%, then the new price falls by 25%. What is the final price?",
      options: ["80", "75", "100", "82.5"],
      correctIndex: 1,
      explanation:
        "25% up on 80 adds 20 → 100. But 25% down on 100 removes 25 → 75. Percentages always act on their own starting amount, which is why up-then-down by the same percent never returns to the start.",
    },
    {
      id: "diag-05",
      part: "A",
      gates: "a-05",
      prompt: "A recipe keeps flour to sugar in the ratio 3:2. If you use 12 cups of flour, how much sugar?",
      options: ["6 cups", "8 cups", "9 cups", "18 cups"],
      correctIndex: 1,
      explanation:
        "12 cups is 4 lots of the 3-cup flour share, so the sugar needs 4 lots of its 2-cup share: 8 cups. Ratios scale together — that is the whole idea.",
    },
    {
      id: "diag-06",
      part: "A",
      gates: "a-09",
      prompt: "What is log₁₀(1000)?",
      options: ["3", "10", "100", "0.001"],
      correctIndex: 0,
      explanation:
        "A logarithm answers 'ten to what power gives this?' — and 10³ = 1000, so the answer is 3. It counts tens by multiplying, exactly like counting digits.",
    },
    // ---------------- Part B: Algebra (6) ----------------
    {
      id: "diag-07",
      part: "B",
      gates: "b-01",
      prompt: "If x = −2, what is x² − 3x?",
      options: ["10", "−10", "2", "4"],
      correctIndex: 0,
      explanation:
        "Substitute carefully: (−2)² = 4 and −3 · (−2) = +6, so 4 + 6 = 10. Most wrong answers here come from computing −3x as −6 instead of +6.",
    },
    {
      id: "diag-08",
      part: "B",
      gates: "b-03",
      prompt: "Solve for x: 3x + 4 = 19.",
      options: ["x = 5", "x = 7/3", "x = 23/3", "x = −5"],
      correctIndex: 0,
      explanation:
        "Undo in reverse order: subtract 4 (3x = 15), then divide by 3 (x = 5). An equation is a balance — whatever you do to one side you do to the other.",
    },
    {
      id: "diag-09",
      part: "B",
      gates: "b-04",
      prompt: "Solve: −2x > 6. Which answer is correct?",
      options: ["x > −3", "x < −3", "x > 3", "x < 3"],
      correctIndex: 1,
      explanation:
        "Divide both sides by −2 to get x < −3. Multiplying or dividing an inequality by a negative number flips the direction of the sign — the single most-tested inequality rule.",
    },
    {
      id: "diag-10",
      part: "B",
      gates: "b-05",
      prompt: "Where does the line y = 3x − 2 cross the y-axis?",
      options: ["At 3", "At −2", "At 2", "At 0"],
      correctIndex: 1,
      explanation:
        "The y-axis is every point with x = 0; substituting gives y = −2. The constant term of a line is always its height at x = 0.",
    },
    {
      id: "diag-11",
      part: "B",
      gates: "b-06",
      prompt: "The equation x² − 5x + 6 = 0 has which solutions?",
      options: ["x = 1 and x = 6", "x = 2 and x = 3", "x = −2 and x = −3", "x = 5 and x = 6"],
      correctIndex: 1,
      explanation:
        "Look for two numbers that multiply to 6 and add to 5: that is 2 and 3. Check: 2×3 = 6 and 2+3 = 5. Both 2² − 10 + 6 = 0 and 9 − 15 + 6 = 0 hold.",
    },
    {
      id: "diag-12",
      part: "B",
      gates: "b-08",
      prompt: "On a graph, the point where a smooth curve stops falling and starts rising is called:",
      options: ["the intercept", "a minimum", "a root", "an asymptote"],
      correctIndex: 1,
      explanation:
        "That turning point at the bottom of a valley is a minimum — and it is exactly where the tangent line is flat, which is the idea calculus will formalize later.",
    },
    // ---------------- Part C: Linear algebra (5) ----------------
    {
      id: "diag-13",
      part: "C",
      gates: "c-01",
      prompt: "If u = (3, 1) and v = (1, 2), what is u + v?",
      options: ["(4, 3)", "(2, −1)", "(3, 2)", "(4, 2)"],
      correctIndex: 0,
      explanation:
        "Vectors add coordinate by coordinate: (3+1, 1+2) = (4, 3). Geometrically it is head-to-tail travel: do both trips and see where you land.",
    },
    {
      id: "diag-14",
      part: "C",
      gates: "c-03",
      prompt: "If u = (3, 0) and v = (0, 5), what is u · v (the dot product)?",
      options: ["15", "8", "0", "(3, 5)"],
      correctIndex: 2,
      explanation:
        "Multiply matching coordinates and add: 3·0 + 0·5 = 0. A zero dot product means the vectors are perpendicular — this 'agreement meter' idea powers projections and correlation.",
    },
    {
      id: "diag-15",
      part: "C",
      gates: "c-06",
      prompt: "A is a 2×3 matrix and B is a 3×4 matrix. What shape is A·B?",
      options: ["2×4", "3×3", "4×2", "A·B is undefined"],
      correctIndex: 0,
      explanation:
        "Matrix multiplication requires the inner dimensions to match (3 = 3 here); the result takes the outer ones: 2×4. The rule feels arbitrary until you see it as composing two transformations.",
    },
    {
      id: "diag-16",
      part: "C",
      gates: "c-08",
      prompt: "A square matrix has determinant 0. What does that mean?",
      options: ["It has a zero row", "It squashes space flat — no inverse exists", "It is symmetric", "It is the identity matrix"],
      correctIndex: 1,
      explanation:
        "Determinant zero means the matrix collapses the plane (or space) into a lower dimension, so information is lost and no matrix can undo it. Singular = un-invertible.",
    },
    {
      id: "diag-17",
      part: "C",
      gates: "c-11",
      prompt: "An eigenvector of a matrix A is best described as a vector that:",
      options: ["has length exactly 1", "A stretches or shrinks without turning", "A sends to the zero vector", "is perpendicular to every row of A"],
      correctIndex: 1,
      explanation:
        "Most vectors get turned when A acts; eigenvectors are the special directions that only get stretched (A·v = λ·v). They are the 'natural axes' hiding inside the transformation.",
    },
    // ---------------- Part D: Calculus (4) ----------------
    {
      id: "diag-18",
      part: "D",
      gates: "d-02",
      prompt: "As x gets closer and closer to 2, the value of (x² − 4)/(x − 2) approaches:",
      options: ["0", "2", "4", "It is undefined"],
      correctIndex: 2,
      explanation:
        "At x = 2 exactly, the fraction is 0/0 — undefined. But nearby, factor and cancel: (x−2)(x+2)/(x−2) = x + 2, which approaches 4. A limit asks where values head, not what happens at the point itself.",
    },
    {
      id: "diag-19",
      part: "D",
      gates: "d-04",
      prompt: "If f(x) = x², what is f′(3) — the slope of the tangent at x = 3?",
      options: ["3", "6", "9", "0"],
      correctIndex: 1,
      explanation:
        "The derivative of x² is 2x, so f′(3) = 6. Geometrically: zoom in on the curve at (3, 9) and it looks like a straight line climbing 6 units for every 1 across.",
    },
    {
      id: "diag-20",
      part: "D",
      gates: "d-06",
      prompt: "What is the derivative of sin(x²)?",
      options: ["cos(x²)", "2x · cos(x²)", "−2x · sin(x²)", "cos(2x)"],
      correctIndex: 1,
      explanation:
        "Chain rule: outer function sin(·) gives cos(inner); inner function x² gives 2x; multiply them: 2x·cos(x²). Derivative of a chain = (outer at inner) × (derivative of inner).",
    },
    {
      id: "diag-21",
      part: "D",
      gates: "d-11",
      prompt: "In gradient descent, if the learning rate is far too large, the updates will:",
      options: ["converge much faster", "overshoot the minimum and may bounce apart", "stop moving immediately", "move uphill on purpose"],
      correctIndex: 1,
      explanation:
        "The learning rate is a step size: too small and you crawl; too large and each step leaps across the valley, overshooting higher than you started — divergence instead of descent.",
    },
    // ---------------- Part E: Additional topics (3) ----------------
    {
      id: "diag-22",
      part: "E",
      gates: "e-01",
      prompt: "What is sin(30°)?",
      options: ["1/2", "√3/2", "1", "√2/2"],
      correctIndex: 0,
      explanation:
        "At 30° on the unit circle, the vertical shadow is exactly half the radius: sin(30°) = 1/2. The 30-60-90 triangle hides in half of an equilateral one.",
    },
    {
      id: "diag-23",
      part: "E",
      gates: "e-02",
      prompt: "What is the distance between the points (0, 0) and (3, 4)?",
      options: ["7", "5", "12", "25"],
      correctIndex: 1,
      explanation:
        "The distance formula is Pythagoras in disguise: √(3² + 4²) = √25 = 5. Answering 7 adds the legs; answering 25 forgets the square root.",
    },
    {
      id: "diag-24",
      part: "E",
      gates: "e-04",
      prompt: "The bisection method finds a root of a function by:",
      options: ["guessing randomly until lucky", "repeatedly halving an interval whose two ends have opposite signs", "following the tangent line downhill", "averaging all the data points"],
      correctIndex: 1,
      explanation:
        "If a continuous function is positive at one end of an interval and negative at the other, it must cross zero somewhere inside; halving keeps the half that still traps the crossing. (Following the tangent line is Newton's method — a different, faster, more fragile beast.)",
    },
  ],
};
