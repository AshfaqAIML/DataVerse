/**
 * Math engine tests — the quality gate for the expression evaluator,
 * numeric helpers, linear algebra kernel, and the diagnostic/revision
 * engine (the "never calculus before algebra" guarantee).
 */
import "../__setup";
import { describe, expect, test } from "bun:test";
import { evalExpr, sampleFunction, numericDerivative, numericGradient2D, simpsonIntegrate, parseExpr } from "@/lib/mathcourse/expr";
import { frac, fracAdd, fracMul, fracDiv, decimalExpansion, gcd, reduceRatio, proportionalSplit, sciParts, percentChange, groupDigits } from "@/lib/mathcourse/numeric";
import { det, matMul, matInverse, matTranspose, gaussSolve, eigen2, eigenVec2, dot, norm, project, matIdentity } from "@/lib/mathcourse/linalg";
import { numberline, fractionPie, barModel, areaGrid, rightTriangle, balanceScale, coordFigure, flowDiagram } from "@/lib/mathcourse/svgfig";
import type { MathCourse } from "@/lib/mathcourse/types";
import { computeDiagnosticResult, revisionRadar, lessonReady, diagnosticCleared } from "@/lib/mathcourse/diagnostic";

describe("expression evaluator", () => {
  test("arithmetic and precedence", () => {
    expect(evalExpr("1 + 2 * 3", {})).toBe(7);
    expect(evalExpr("(1 + 2) * 3", {})).toBe(9);
    expect(evalExpr("2 ** 3 ** 2", {})).toBe(512); // right-assoc
    expect(evalExpr("-x**2", { x: 3 })).toBe(-9); // matches Python
    expect(evalExpr("2 * -3", {})).toBe(-6);
    expect(evalExpr("7 % 4", {})).toBe(3);
  });

  test("functions and constants", () => {
    expect(evalExpr("sin(pi/2)", {})).toBe(1);
    expect(evalExpr("cos(0)", {})).toBe(1);
    expect(evalExpr("e", {})).toBeCloseTo(Math.E);
    expect(evalExpr("ln(e)", {})).toBeCloseTo(1);
    expect(evalExpr("log10(1000)", {})).toBeCloseTo(3);
    expect(evalExpr("sqrt(16) + abs(-3)", {})).toBe(7);
    expect(evalExpr("min(4, 2, 9)", {})).toBe(2);
    expect(evalExpr("max(4, 2)", {})).toBe(4);
  });

  test("parameters flow through", () => {
    expect(evalExpr("a * x**2 + b * x + c", { a: 1, b: -2, c: 0, x: 2 })).toBe(0);
    expect(evalExpr("a * x**2 + b * x + c", { a: 1, b: -2, c: 0, x: 3 })).toBe(3);
  });

  test("errors are readable, never eval", () => {
    expect(() => evalExpr("1 +", {})).toThrow();
    expect(() => evalExpr("foo(3)", {})).toThrow(/Unknown function/);
    expect(() => evalExpr("x + y", { x: 1 })).toThrow(/Unknown variable/);
    expect(() => evalExpr("import os", {})).toThrow(/Unexpected/);
    expect(() => parseExpr("1 2 3")).toThrow();
  });

  test("sampling splits at asymptotes", () => {
    const segs = sampleFunction("1/x", -5, 5, {}, 400);
    expect(segs.length).toBe(2);
    const mono = sampleFunction("x**2", -5, 5);
    expect(mono.length).toBe(1);
    expect(mono[0].length).toBe(421); // 420 samples -> 421 points
  });

  test("numeric derivatives and integrals are accurate", () => {
    expect(numericDerivative("x**2", 3)).toBeCloseTo(6, 5);
    expect(numericDerivative("sin(x)", 0)).toBeCloseTo(1, 5);
    expect(simpsonIntegrate("x**2", 0, 3)).toBeCloseTo(9, 6);
    expect(simpsonIntegrate("sin(x)", 0, Math.PI)).toBeCloseTo(2, 6);
    const g = numericGradient2D("x**2 + 3*y**2", 2, 1);
    expect(g.gx).toBeCloseTo(4, 4);
    expect(g.gy).toBeCloseTo(6, 4);
  });
});

describe("numeric helpers", () => {
  test("fraction arithmetic reduces", () => {
    expect(fracAdd(frac(1, 6), frac(1, 3))).toEqual(frac(1, 2));
    expect(fracMul(frac(2, 3), frac(3, 4))).toEqual(frac(1, 2));
    expect(fracDiv(frac(1, 2), frac(1, 4))).toEqual(frac(2, 1));
    expect(frac(10, -4)).toEqual(frac(-5, 2));
    expect(() => frac(1, 0)).toThrow();
  });

  test("decimal expansion detects repeats", () => {
    expect(decimalExpansion(frac(1, 2)).text).toBe("0.5");
    expect(decimalExpansion(frac(1, 3)).repeats).toBe("3");
    expect(decimalExpansion(frac(1, 7)).repeats).toBe("142857");
    expect(decimalExpansion(frac(3, 1)).text).toBe("3");
  });

  test("gcd, ratios, splits, scientific notation", () => {
    expect(gcd(24, 16)).toBe(8);
    expect(reduceRatio(24, 16)).toBe("3:2");
    expect(proportionalSplit(90, [2, 3, 4])).toEqual([20, 30, 40]);
    const s = sciParts(345600);
    expect(s.exponent).toBe(5);
    expect(s.mantissa).toBeCloseTo(3.456, 10);
    expect(percentChange(80, 100)).toBe("25%");
    expect(percentChange(50, 40)).toBe("-20%");
    expect(groupDigits(1234567.5)).toBe("1,234,567.5");
  });
});

describe("linear algebra kernel", () => {
  test("matrix multiplication, identity, transpose", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    expect(matMul(A, matIdentity(2))).toEqual(A);
    const prod = matMul(A, matInverse(A)) as number[][];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        expect(prod[i][j]).toBeCloseTo(i === j ? 1 : 0, 8);
      }
    }
    expect(matTranspose(A)).toEqual([
      [1, 3],
      [2, 4],
    ]);
    expect(() => matMul(A, [[1, 2, 3]])).toThrow(/Shape mismatch/); // the shape guard throws on bad shapes
  });

  test("determinants (2x2, 3x3, singular)", () => {
    expect(
      det([
        [1, 2],
        [3, 4],
      ])
    ).toBe(-2);
    expect(
      det([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 4],
      ])
    ).toBe(24);
    expect(
      det([
        [1, 2],
        [2, 4],
      ])
    ).toBe(0);
  });

  test("inverse throws on singular, is exact otherwise", () => {
    expect(() =>
      matInverse([
        [1, 2],
        [2, 4],
      ])
    ).toThrow(/singular/i);
    expect(
      matInverse([
        [4, 7],
        [2, 6],
      ])
    ).toEqual([
      [0.6, -0.7],
      [-0.2, 0.4],
    ]);
  });

  test("gaussSolve solves and narrates steps", () => {
    const { x, steps } = gaussSolve(
      [
        [2, 1],
        [1, -1],
      ],
      [5, 1]
    );
    expect(x).toEqual([2, 1]);
    expect(steps.length).toBeGreaterThan(0);
  });

  test("2x2 eigen machinery", () => {
    const M = [
      [3, 1],
      [0, 2],
    ]; // triangular: eigenvalues 3 and 2
    const e = eigen2(M);
    expect(e.real).toBe(true);
    const vals = [...(e.values ?? [])].sort();
    expect(vals[0]).toBeCloseTo(2, 8);
    expect(vals[1]).toBeCloseTo(3, 8);
    const v = eigenVec2(M, 3);
    // Av = λv
    const av = [M[0][0] * v.x + M[0][1] * v.y, M[1][0] * v.x + M[1][1] * v.y];
    expect(av[0]).toBeCloseTo(3 * v.x, 8);
    expect(av[1]).toBeCloseTo(3 * v.y, 8);
  });

  test("vector ops: dot, norm, projection", () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(norm([3, 4])).toBe(5);
    expect(project([3, 4], [1, 0])).toEqual([3, 0]);
  });
});

describe("svg figure builders", () => {
  test("emit complete, escaped SVG", () => {
    const figs = [
      numberline({ min: -3, max: 3, marks: [{ at: 2, label: "π ≈ 3.14" }] }),
      fractionPie(3, 4),
      barModel([{ value: 3, label: "A" }, { value: 2, label: "B" }]),
      areaGrid(4, 6, 3, 2),
      rightTriangle(),
      balanceScale("2x + 3", "7"),
      coordFigure({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, segments: [{ x1: -4, y1: -2, x2: 4, y2: 2, label: "y = ½x" }] }),
      flowDiagram(["compute", "verify", "ship"]),
    ];
    for (const f of figs) {
      expect(f.startsWith("<svg")).toBe(true);
      expect(f.endsWith("</svg>")).toBe(true);
      expect(f).not.toContain("&amp;#"); // no double-escaping
    }
    // XML escaping of raw ampersands in labels
    expect(rightTriangle({ a: "a & b" })).toContain("&amp;");
  });
});

// ---------------------------------------------------------------------------
// Diagnostic + revision engine — the pedagogy guarantees
// ---------------------------------------------------------------------------

const mkLesson = (slug: string, prerequisites: string[]): import("@/lib/mathcourse/types").MathLesson => ({
  slug,
  title: `Lesson ${slug}`,
  minutes: 30,
  summary: "",
  objectives: [],
  prerequisites,
  analogy: { scene: "", bridge: "" },
  intuition: [""],
  terminology: [],
  visuals: [],
  derivation: { title: "", intro: "", steps: [], result: "" },
  examples: [],
  programming: { intro: "", code: "", output: "", explanation: [] },
  mlConnection: { title: "", body: [], usedBy: [] },
  exercises: [],
  quiz: [
    { id: `${slug}-q1`, prompt: "", options: ["a", "b", "c"], correctIndex: 0, explanation: "" },
    { id: `${slug}-q2`, prompt: "", options: ["a", "b", "c"], correctIndex: 0, explanation: "" },
  ],
  misconceptions: [],
  takeaways: [],
});

const mockCourse: MathCourse = {
  slug: "math",
  title: "Mock",
  subtitle: "",
  description: "",
  parts: [
    {
      letter: "A",
      title: "Foundations",
      tagline: "",
      description: "",
      outcomes: [],
      lessons: [mkLesson("a-01", []), mkLesson("a-02", ["a-01"])],
      assessment: { questions: [] },
      workshop: { title: "", brief: "", requirements: [], steps: [], starter: "", solution: "", expectedOutput: "", concepts: [] },
    },
    {
      letter: "B",
      title: "Algebra",
      tagline: "",
      description: "",
      outcomes: [],
      lessons: [mkLesson("b-01", ["a-02"]), mkLesson("b-02", ["b-01"])],
      assessment: { questions: [] },
      workshop: { title: "", brief: "", requirements: [], steps: [], starter: "", solution: "", expectedOutput: "", concepts: [] },
    },
    {
      letter: "D",
      title: "Calculus",
      tagline: "",
      description: "",
      outcomes: [],
      lessons: [mkLesson("d-01", ["b-02"])],
      assessment: { questions: [] },
      workshop: { title: "", brief: "", requirements: [], steps: [], starter: "", solution: "", expectedOutput: "", concepts: [] },
    },
  ],
  diagnostic: {
    intro: "",
    questions: [
      { id: "diag-01", part: "A", gates: "a-01", prompt: "", options: ["a", "b"], correctIndex: 0, explanation: "" },
      { id: "diag-02", part: "A", gates: "a-02", prompt: "", options: ["a", "b"], correctIndex: 0, explanation: "" },
      { id: "diag-03", part: "B", gates: "b-01", prompt: "", options: ["a", "b"], correctIndex: 0, explanation: "" },
      { id: "diag-04", part: "B", gates: "b-02", prompt: "", options: ["a", "b"], correctIndex: 0, explanation: "" },
      { id: "diag-05", part: "D", gates: "d-01", prompt: "", options: ["a", "b"], correctIndex: 0, explanation: "" },
    ],
  },
};

describe("diagnostic engine", () => {
  test("all correct -> placed at last part, nothing to revise", () => {
    const picks = { "diag-01": 0, "diag-02": 0, "diag-03": 0, "diag-04": 0, "diag-05": 0 };
    const r = computeDiagnosticResult(mockCourse, { picks });
    expect(r.placement.partId).toBe("D");
    expect(r.revisionLessonIds).toEqual([]);
    expect(r.correct).toBe(5);
  });

  test("weak algebra blocks calculus placement even with perfect calculus score", () => {
    const picks = { "diag-01": 0, "diag-02": 0, "diag-03": 1, "diag-04": 1, "diag-05": 0 }; // B wrong
    const r = computeDiagnosticResult(mockCourse, { picks });
    expect(r.placement.partId).toBe("B");
    expect(r.placement.lessonId).toBe("b-01");
    expect(r.placement.note).toMatch(/gaps below/i); // honest "close them first" message
    expect(r.revisionLessonIds).toContain("b-01");
    expect(r.revisionLessonIds).toContain("b-02");
  });

  test("weak foundations anchors placement to part A", () => {
    const picks = { "diag-01": 1, "diag-02": 1, "diag-03": 0, "diag-04": 0, "diag-05": 0 };
    const r = computeDiagnosticResult(mockCourse, { picks });
    expect(r.placement.partId).toBe("A");
    expect(r.placement.lessonId).toBe("a-01");
  });

  test("revision list is prerequisite-closed and dependency-ordered", () => {
    const picks = { "diag-01": 0, "diag-02": 0, "diag-03": 0, "diag-04": 0, "diag-05": 1 }; // only d-01 wrong
    const r = computeDiagnosticResult(mockCourse, { picks });
    // d-01 depends on b-02 -> b-01 -> a-02 -> a-01: all appear, in order
    expect(r.revisionLessonIds).toEqual(["a-01", "a-02", "b-01", "b-02", "d-01"]);
  });

  test("skipped questions count as gaps", () => {
    const r = computeDiagnosticResult(mockCourse, { picks: {} });
    expect(r.correct).toBe(0);
    expect(r.placement.partId).toBe("A");
    expect(r.revisionLessonIds.length).toBe(5);
  });
});

describe("adaptive revision (ongoing)", () => {
  test("revision radar surfaces quiz misses and unmet prerequisites", () => {
    const progress = {
      lessonsDone: { "a-01": true } as Record<string, true>,
      quizAnswers: { "b-01-q1": { chosen: 1, correct: false } } as Record<string, { chosen: number; correct: boolean }>,
    };
    const radar = revisionRadar(mockCourse, "B", progress);
    const ids = radar.map((i) => i.lessonId);
    // a-02 unmet (prereq of b-01), b-01 quiz miss, b-02 unmet prereq
    expect(ids).toContain("b-01");
    expect(ids).toContain("a-02");
    expect(ids.indexOf("a-02")).toBeLessThan(ids.indexOf("b-01"));
  });

  test("lessonReady reports unmet prerequisites", () => {
    const progress = { lessonsDone: {}, quizAnswers: {} };
    const ready = lessonReady(mockCourse, mockCourse.parts[2].lessons[0], progress);
    expect(ready.ready).toBe(false);
    expect(ready.unmet.map((l) => l.slug).sort()).toEqual(["b-02"]);
  });

  test("diagnostic-cleared parts satisfy readiness", () => {
    const progress = { lessonsDone: {}, quizAnswers: {} };
    const cleared = new Set(["A", "B"]);
    const ready = lessonReady(mockCourse, mockCourse.parts[2].lessons[0], progress, cleared);
    expect(ready.ready).toBe(true);
    const diag = { areaScores: { A: { correct: 2, total: 2 }, B: { correct: 2, total: 2 }, D: { correct: 1, total: 1 } } };
    expect(diagnosticCleared(mockCourse, diag)).toEqual(new Set(["A", "B", "D"]));
  });
});
