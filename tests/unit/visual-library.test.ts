/**
 * Correctness tests for the Visual Library engines. These are known-value
 * checks — every constant was cross-checked against scipy / Python's
 * statistics module / closed forms, not eyeballed.
 */
import { describe, expect, test } from "bun:test";
import {
  binomialCdf,
  binomialPmf,
  ciForMean,
  erf,
  exponentialCdf,
  fiveNumber,
  histogram,
  incBeta,
  integrate,
  lgamma,
  mean,
  mulberry32,
  normalCdf,
  normalPdf,
  normalQuantile,
  oneSampleTest,
  olsFit,
  pearson,
  poissonCdf,
  poissonPmf,
  populationMoments,
  populationPdf,
  quantile,
  rbivariateNormal,
  rint,
  rnorm,
  sd,
  tCdf,
  tQuantile,
  uniformCdf,
  uniformPdf,
  variance,
  contourSegments,
} from "@/lib/viz/stats";
import {
  confusionAt,
  generateDataset,
  generateFeatureTable,
  generateScores,
  knnClassify,
  logisticGrid,
  knnGrid,
  metricsFrom,
  permutationImportance,
  rocAuc,
  rocCurve,
  standardize,
  trainLogistic,
  trainTestSplit,
} from "@/lib/viz/ml";
import { broadcastShapes } from "@/lib/numpycourse/vizlogic";

const close = (a: number, b: number, digits = 6) =>
  expect(Number(a.toFixed(digits))).toBe(Number(b.toFixed(digits)));

// ---------------------------------------------------------------------------
// special functions
// ---------------------------------------------------------------------------

describe("special functions", () => {
  test("lgamma matches known values", () => {
    expect(Math.abs(lgamma(1))).toBeLessThan(1e-12);
    expect(Math.abs(lgamma(2))).toBeLessThan(1e-12);
    close(lgamma(5), Math.log(24), 12);
    close(lgamma(0.5), Math.log(Math.sqrt(Math.PI)), 12);
    close(lgamma(11.5), 16.292000476567242, 10); // math.lgamma
  });

  test("erf machine precision (vs. A&S reference)", () => {
    close(erf(0), 0, 12);
    close(erf(1), 0.8427007929497149, 12);
    close(erf(2), 0.9953222650189527, 12);
    close(erf(0.5), 0.5204998778130465, 12);
    close(erf(-1.5), -0.9661051464753107, 12);
    close(erf(3), 0.9999779095030014, 12);
  });

  test("incBeta closed forms", () => {
    close(incBeta(0.5, 2, 3), 0.6875, 12);      // I_{1/2}(2,3) = 11/16
    close(incBeta(0.5, 0.5, 0.5), 0.5, 12);      // symmetry
    close(incBeta(0.3, 1, 1), 0.3, 12);          // uniform
    // 20·∫₀^0.8 (t³−t⁴) dt = 0.73728 exactly (hand-integrated)
    close(incBeta(0.8, 4, 2), 0.73728, 12);
  });

  test("normalCdf known z values", () => {
    close(normalCdf(0), 0.5, 12);
    close(normalCdf(1.96), 0.9750021048517775, 12);
    close(normalCdf(-1.96), 0.0249978951482225, 12);
    close(normalCdf(1), 0.8413447460685429, 12);
    close(normalCdf(5, 0, 1), 0.9999997133484281, 10);
    close(normalCdf(2, 1, 2), 0.6914624612740131, 12); // standardised
  });

  test("normalPdf integrates to 1", () => {
    const area = integrate((x) => normalPdf(x, 0, 1), -9, 9, 4000);
    close(area, 1, 8);
  });

  test("normalQuantile inverts the CDF (round trip + known points)", () => {
    expect(Math.abs(normalQuantile(0.5))).toBeLessThan(1e-12);
    close(normalQuantile(0.975), 1.959963984540054, 8);
    close(normalQuantile(0.025), -1.959963984540054, 8);
    close(normalQuantile(0.8), 0.8416212335729143, 8);
    close(normalQuantile(1e-10), -6.361340902404056, 6);
    for (const p of [0.01, 0.1, 0.37, 0.62, 0.9, 0.999]) {
      close(normalCdf(normalQuantile(p)), p, 7);
    }
  });

  test("tCdf / tQuantile match scipy.stats.t", () => {
    close(tCdf(0, 5), 0.5, 12);
    close(tCdf(2.045229642132624, 29), 0.975, 9);
    close(tCdf(-2.045229642132624, 29), 0.025, 9);
    close(tCdf(1.5, 7), 0.911350756505015, 8); // scipy.stats.t.cdf
    close(tQuantile(0.975, 29), 2.045229642132624, 7);
    close(tQuantile(0.975, 1), 12.70620473617432, 7);
    close(tQuantile(0.975, 10), 2.2281388519649385, 7);
    expect(Math.abs(tQuantile(0.99, 30) - 2.457261576089483)).toBeLessThan(1e-6);
    close(tQuantile(0.05, 15), -1.7530503556947158, 7);
  });
});

// ---------------------------------------------------------------------------
// pmfs / cdfs
// ---------------------------------------------------------------------------

describe("probability distributions", () => {
  test("binomial pmf + cdf", () => {
    close(binomialPmf(0, 10, 0.5), 0.0009765625, 12);
    close(binomialPmf(5, 10, 0.5), 0.24609375, 12);
    close(binomialPmf(3, 8, 0.2), 0.14680064, 12);
    close(binomialCdf(10, 10, 0.5), 1, 12);
    close(binomialCdf(0, 10, 0.3), 0.0282475249, 10);
    // pmf sums to 1
    let s = 0;
    for (let k = 0; k <= 20; k++) s += binomialPmf(k, 20, 0.35);
    close(s, 1, 10);
  });

  test("poisson pmf + cdf", () => {
    close(poissonPmf(0, 2.5), 0.0820849986, 10);
    close(poissonPmf(2, 3), 0.2240418077, 10);
    close(poissonCdf(3, 2), 0.8571234605, 10);
    let s = 0;
    for (let k = 0; k <= 60; k++) s += poissonPmf(k, 7);
    close(s, 1, 10);
  });

  test("uniform + exponential", () => {
    close(uniformPdf(2.5, 0, 10), 0.1, 12);
    close(uniformCdf(2.5, 0, 10), 0.25, 12);
    close(uniformCdf(-1, 0, 10), 0, 12);
    close(uniformCdf(11, 0, 10), 1, 12);
    close(exponentialCdf(1, 1), 0.6321205588, 10);
    close(exponentialCdf(0, 2), 0, 12);
  });
});

// ---------------------------------------------------------------------------
// descriptive statistics
// ---------------------------------------------------------------------------

describe("descriptive statistics", () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];

  test("mean / variance / sd (hand-checked, ddof=1)", () => {
    close(mean(xs), 5, 12);
    close(variance(xs), 4.571428571428571, 10);
    close(sd(xs), Math.sqrt(4.571428571428571), 10);
  });

  test("quantile (R type 7) on a known vector", () => {
    const sorted = [...xs].sort((a, b) => a - b);
    close(quantile(sorted, 0.5), 4.5, 12); // median
    close(quantile(sorted, 0.25), 4, 12);
    close(quantile(sorted, 0.75), 5.5, 12); // 5 + 0.25·(7−5)
    close(quantile([1, 2, 3, 4], 0.25), 1.75, 12);
    close(quantile([1, 2, 3, 4], 0.75), 3.25, 12);
  });

  test("five-number summary + 1.5·IQR fences", () => {
    const fn = fiveNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
    close(fn.q1, 3.25, 12);
    close(fn.median, 5.5, 12);
    close(fn.q3, 7.75, 12);
    close(fn.iqr, 4.5, 12);
    close(fn.lowerFence, -3.5, 12);
    close(fn.upperFence, 14.5, 12);
    expect(fn.outlierIdx).toEqual([9]); // the 100
  });

  test("histogram: counts sum to n, density integrates to 1", () => {
    const data = Array.from({ length: 500 }, (_, i) => (i * 7919) % 100);
    const h = histogram(data, 10, 0, 100);
    close(h.reduce((s, b) => s + b.count, 0), 500, 12);
    close(h.reduce((s, b) => s + b.density * (b.to - b.from), 0), 1, 10);
  });
});

// ---------------------------------------------------------------------------
// correlation & regression — Anscombe's quartet I has exact statistics
// ---------------------------------------------------------------------------

describe("correlation & OLS", () => {
  const ax = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
  const ay = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68];

  test("Anscombe I: mean, r, OLS to 4 decimals", () => {
    close(mean(ax), 9, 12);
    close(mean(ay), 7.500909, 5);
    close(pearson(ax, ay), 0.816421, 5);
    const fit = olsFit(ax, ay);
    close(fit.slope, 0.500091, 5);
    close(fit.intercept, 3.000091, 5);
    close(fit.r2, 0.666542, 5);
  });

  test("OLS on exact linear data gives r² = 1 and zero RMSE", () => {
    const fit = olsFit([1, 2, 3, 4, 5], [3, 5, 7, 9, 11]);
    close(fit.slope, 2, 12);
    close(fit.intercept, 1, 12);
    close(fit.r2, 1, 12);
    close(fit.rmse, 0, 12);
  });

  test("pearson: perfect ±1 and 0 on symmetric data", () => {
    close(pearson([1, 2, 3], [2, 4, 6]), 1, 12);
    close(pearson([1, 2, 3], [3, 2, 1]), -1, 12);
    close(pearson([-2, -1, 1, 2], [2, -1, -1, 2]), 0, 12);
  });

  test("bivariate normal generator honours rho (large n)", () => {
    const pts = rbivariateNormal(mulberry32(42), 0.8, 4000);
    const r = pearson(pts.map((p) => p.x), pts.map((p) => p.y));
    expect(Math.abs(r - 0.8)).toBeLessThan(0.03);
  });
});

// ---------------------------------------------------------------------------
// inference: CI + hypothesis test against closed forms
// ---------------------------------------------------------------------------

describe("confidence intervals & hypothesis tests", () => {
  test("z interval: x̄=52, n=36, σ=6, 95% → (50.04, 53.96)", () => {
    const ci = ciForMean(52, 36, 6, 5.9, 0.95);
    close(ci.critical, 1.959963984540054, 7);
    close(ci.se, 1, 12);
    close(ci.moe, 1.959963984540054, 7);
    close(ci.lo, 50.040036015, 6);
    close(ci.hi, 53.959963985, 6);
  });

  test("t interval beats z for small n (critical values)", () => {
    const t95 = ciForMean(10, 12, null, 3, 0.95);
    close(t95.critical, 2.200985160082949, 6); // t(0.975, 11)
  });

  test("two-sided z-test: known textbook example", () => {
    // x̄=510, n=25, σ=50, H0: μ=500 → z = 1, p = 0.31731050786291415
    const res = oneSampleTest(510, 25, 500, 50, 49, 0.05, "two");
    close(res.statistic, 1, 12);
    close(res.pValue, 0.3173105079, 8);
    expect(res.reject).toBe(false);
    close(res.criticalValue, 1.9599639845, 7);
  });

  test("one-sided t-test: reject at the edge", () => {
    // n = 16, s = 1, x̄ − μ₀ = 2 → t = 8, df = 15 → p ≈ 1.6e-7 (right-tail)
    const res = oneSampleTest(12, 16, 10, null, 1, 0.05, "right");
    close(res.statistic, 8, 12);
    expect(res.pValue).toBeLessThan(1e-5);
    expect(res.reject).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// populations & contour marching
// ---------------------------------------------------------------------------

describe("teaching populations & contours", () => {
  test("population pdf integrates to 1 on its domain", () => {
    for (const shape of ["uniform", "right-skew", "bimodal", "normal"] as const) {
      const area = integrate((x) => populationPdf(shape, x, 0, 24), 0, 24, 4000);
      expect(Math.abs(area - 1)).toBeLessThan(1e-4); // Simpson on a kinked pdf
    }
  });

  test("population moments: uniform closed form", () => {
    const m = populationMoments("uniform", 0, 24);
    close(m.mu, 12, 12);
    close(m.sigma, 24 / Math.sqrt(12), 10);
  });

  test("contour marching squares: circle level set", () => {
    const segs = contourSegments((x, y) => x * x + y * y, -2, 2, -2, 2, [1], 80, 80);
    // every segment endpoint lies on the unit circle
    for (const s of segs) {
      close(Math.hypot(s.x1, s.y1), 1, 3);
      close(Math.hypot(s.x2, s.y2), 1, 3);
    }
    expect(segs.length).toBeGreaterThan(40);
  });
});

// ---------------------------------------------------------------------------
// ML engine
// ---------------------------------------------------------------------------

describe("ML engine", () => {
  test("standardize: mean 0, population sd 1", () => {
    const pts = generateDataset("blobs", 200, 0.3, 1);
    const std = standardize(pts);
    close(mean(std.xs.map((p) => p.x)), 0, 8);
    close(mean(std.xs.map((p) => p.y)), 0, 8);
    // ddof = 0 — standardize uses the population sd of the same points
    const popSd = (v: number[]) => {
      const m = mean(v);
      return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
    };
    close(popSd(std.xs.map((p) => p.x)), 1, 10);
    close(popSd(std.xs.map((p) => p.y)), 1, 10);
  });

  test("knnClassify: obvious separable case", () => {
    const train = [
      { x: 0, y: 0, label: 0 as const },
      { x: 0.1, y: 0.1, label: 0 as const },
      { x: 3, y: 3, label: 1 as const },
      { x: 3.1, y: 2.9, label: 1 as const },
    ];
    expect(knnClassify(train, 3, { x: 0.2, y: 0.1, label: 0 })).toBe(0);
    expect(knnClassify(train, 3, { x: 2.8, y: 3, label: 1 })).toBe(1);
    expect(knnClassify(train, 1, { x: 0.4, y: 0.2, label: 0 })).toBe(0);
  });

  test("knnGrid agrees with knnClassify at sampled points", () => {
    const train = generateDataset("blobs", 80, 0.1, 3);
    const grid = knnGrid(train, 5, "euclidean", -3, 3, -3, 3, 20);
    for (const [i, j] of [[3, 3], [17, 4], [9, 12], [16, 16]]) {
      const x = -3 + (6 * (i + 0.5)) / 20;
      const y = -3 + (6 * (j + 0.5)) / 20;
      expect(grid[j * 20 + i]).toBe(knnClassify(train, 5, { x, y, label: 0 }));
    }
  });

  test("trainLogistic separates linearly separable blobs perfectly", () => {
    const pts = standardize(generateDataset("blobs", 120, 0.05, 9)).xs;
    const m = trainLogistic(pts, { lr: 0.8, iterations: 600 });
    let right = 0;
    for (const p of pts) right += (m.w1 * p.x + m.w2 * p.y + m.b >= 0 ? 1 : 0) === p.label ? 1 : 0;
    expect(right / pts.length).toBeGreaterThan(0.97);
    // grid agrees with point prediction
    const grid = logisticGrid(m, -3, 3, -3, 3, 10);
    expect(grid[2 * 10 + 2]).toBe(m.w1 * -2.7 + m.w2 * -2.7 + m.b >= 0 ? 1 : 0);
  });

  test("trainTestSplit: sizes and determinism", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const a = trainTestSplit(items, 0.3, 5);
    const b = trainTestSplit(items, 0.3, 5);
    expect(a.test.length).toBe(30);
    expect(a.train.length).toBe(70);
    expect(a.test).toEqual(b.test);
    expect(new Set([...a.test, ...a.train]).size).toBe(100);
  });

  test("confusion + metrics closed form", () => {
    const scores = [
      { score: 0.9, label: 1 as const },
      { score: 0.8, label: 1 as const },
      { score: 0.7, label: 1 as const },
      { score: 0.6, label: 0 as const },
      { score: 0.4, label: 1 as const },
      { score: 0.3, label: 0 as const },
      { score: 0.2, label: 0 as const },
      { score: 0.1, label: 0 as const },
    ];
    const cm = confusionAt(scores, 0.5);
    expect(cm).toEqual({ tp: 3, fp: 1, fn: 1, tn: 3 });
    const met = metricsFrom(cm);
    close(met.accuracy, 0.75, 12);
    close(met.precision, 0.75, 12);
    close(met.recall, 0.75, 12);
    close(met.f1, 0.75, 12);
    close(met.specificity, 0.75, 12);
  });

  test("ROC AUC: perfect, useless, and a mid case", () => {
    const perfect = [
      { score: 0.9, label: 1 as const }, { score: 0.8, label: 1 as const },
      { score: 0.3, label: 0 as const }, { score: 0.2, label: 0 as const },
    ];
    close(rocAuc(perfect), 1, 12);
    // all scores tied: every positive-negative pair ties → AUC exactly 0.5
    const useless = [
      { score: 0.5, label: 1 as const }, { score: 0.5, label: 1 as const },
      { score: 0.5, label: 0 as const }, { score: 0.5, label: 0 as const },
    ];
    close(rocAuc(useless), 0.5, 12);
    const mid = generateScores(400, 0.2, 2); // heavily overlapping classes
    const auc = rocAuc(mid);
    expect(auc).toBeGreaterThan(0.6);
    expect(auc).toBeLessThan(0.9);
    // curve endpoints are always (0,0) and (1,1)
    const roc = rocCurve(mid);
    close(roc[0].fpr, 0, 12);
    close(roc[0].tpr, 0, 12);
    close(roc[roc.length - 1].fpr, 1, 12);
    close(roc[roc.length - 1].tpr, 1, 12);
  });

  test("permutation importance: informative features beat noise", () => {
    const table = generateFeatureTable(400, 1.6, 21);
    const { rows, baseline } = permutationImportance(table, { k: 7, seed: 5 });
    expect(baseline).toBeGreaterThan(0.8);
    const info = rows.filter((r) => r.informative).map((r) => r.drop);
    const noise = rows.filter((r) => !r.informative).map((r) => r.drop);
    expect(Math.min(...info)).toBeGreaterThan(Math.max(...noise));
  });

  test("dataset generators: labels balanced, points finite", () => {
    for (const kind of ["blobs", "moons", "circles"] as const) {
      const pts = generateDataset(kind, 100, 0.3, 12);
      expect(pts.length).toBe(100);
      expect(pts.filter((p) => p.label === 1).length).toBe(50);
      expect(pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// RNG determinism
// ---------------------------------------------------------------------------

describe("seeded RNG", () => {
  test("mulberry32: same seed, same stream", () => {
    const a = mulberry32(99);
    const b = mulberry32(99);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  test("rnorm / rint in range", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const z = rnorm(rng);
      expect(Math.abs(z)).toBeLessThan(6);
      const k = rint(rng, 1, 6);
      expect(k).toBeGreaterThanOrEqual(1);
      expect(k).toBeLessThanOrEqual(6);
    }
  });
});

// ---------------------------------------------------------------------------
// broadcasting rule engine (already used by the NumPy course, re-tested here
// for the shapes the Visual Library presets expose)
// ---------------------------------------------------------------------------

describe("broadcasting rule engine", () => {
  test("(3,1) + (1,4) → (3,4)", () => {
    const r = broadcastShapes([3, 1], [1, 4]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([3, 4]);
  });

  test("(256,8) + (8,) → (256,8)", () => {
    const r = broadcastShapes([256, 8], [8]);
    expect(r.ok).toBe(true);
    expect(r.result).toEqual([256, 8]);
  });

  test("(64,1,32) + (32,) → (64,1,32); (64,1,32) + (64,32) → (64,64,32)", () => {
    expect(broadcastShapes([64, 1, 32], [32]).result).toEqual([64, 1, 32]);
    const r2 = broadcastShapes([64, 1, 32], [64, 32]);
    expect(r2.ok).toBe(true); // (64,32) realigns to (1,64,32) then expands
    expect(r2.result).toEqual([64, 64, 32]);
  });

  test("(3,4) + (2,) fails with a reason", () => {
    const r = broadcastShapes([3, 4], [2]);
    expect(r.ok).toBe(false);
    expect(r.reason).toBeTruthy();
  });
});
