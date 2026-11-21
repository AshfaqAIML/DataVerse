/**
 * The Visual Library machine-learning engine — small, real, in-browser
 * models. Everything here actually trains or classifies: k-NN over the
 * full point set, logistic regression by batch gradient descent, decision
 * regions by classifying a grid, permutation importance by really
 * shuffling columns and measuring the accuracy drop.
 *
 * Pure functions; correctness checks live in
 * tests/unit/visual-library.test.ts.
 */
import { mulberry32, rnorm, type Rng } from "./stats";

// ---------------------------------------------------------------------------
// Point sets & generators
// ---------------------------------------------------------------------------

export interface Pt {
  x: number;
  y: number;
  label: 0 | 1;
}

export type DatasetKind = "blobs" | "moons" | "circles";

export function generateDataset(kind: DatasetKind, n: number, noise: number, seed: number): Pt[] {
  const rng = mulberry32(seed);
  const pts: Pt[] = [];
  const half = Math.floor(n / 2);
  const jitter = (scale: number) => (rng() * 2 - 1) * scale * noise;
  switch (kind) {
    case "blobs":
      for (let i = 0; i < n; i++) {
        const label: 0 | 1 = i < half ? 0 : 1;
        const cx = label === 0 ? -1.4 : 1.4;
        const cy = label === 0 ? -1.0 : 1.0;
        pts.push({ x: cx + rnorm(rng, 0, 0.55) + jitter(0.3), y: cy + rnorm(rng, 0, 0.55) + jitter(0.3), label });
      }
      break;
    case "moons":
      for (let i = 0; i < n; i++) {
        const label: 0 | 1 = i < half ? 0 : 1;
        const t = rng() * Math.PI;
        if (label === 0) {
          pts.push({ x: Math.cos(t) * 1.6 - 0.6 + jitter(0.5), y: Math.sin(t) * 1.3 - 0.35 + jitter(0.5), label });
        } else {
          pts.push({ x: 1.0 - Math.cos(t) * 1.6 + 0.3 + jitter(0.5), y: 0.35 - Math.sin(t) * 1.3 + jitter(0.5), label });
        }
      }
      break;
    case "circles":
      for (let i = 0; i < n; i++) {
        const label: 0 | 1 = i < half ? 0 : 1;
        const t = rng() * Math.PI * 2;
        const r = label === 0 ? 0.8 + jitter(0.35) : 2.1 + jitter(0.35);
        pts.push({ x: Math.cos(t) * r + jitter(0.25), y: Math.sin(t) * r + jitter(0.25), label });
      }
      break;
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Standardisation
// ---------------------------------------------------------------------------

export function standardize(pts: Pt[]): { xs: Pt[]; meanX: number; meanY: number; sdX: number; sdY: number } {
  const n = pts.length;
  const meanX = pts.reduce((s, p) => s + p.x, 0) / n;
  const meanY = pts.reduce((s, p) => s + p.y, 0) / n;
  const sdX = Math.sqrt(pts.reduce((s, p) => s + (p.x - meanX) ** 2, 0) / n) || 1;
  const sdY = Math.sqrt(pts.reduce((s, p) => s + (p.y - meanY) ** 2, 0) / n) || 1;
  return {
    xs: pts.map((p) => ({ x: (p.x - meanX) / sdX, y: (p.y - meanY) / sdY, label: p.label })),
    meanX,
    meanY,
    sdX,
    sdY,
  };
}

// ---------------------------------------------------------------------------
// k-nearest neighbours
// ---------------------------------------------------------------------------

export type Metric = "euclidean" | "manhattan";

export function distance(a: Pt, b: Pt, metric: Metric): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return metric === "euclidean" ? Math.sqrt(dx * dx + dy * dy) : Math.abs(dx) + Math.abs(dy);
}

/** Majority vote of the k nearest training points (ties → smaller label). */
export function knnClassify(train: Pt[], k: number, p: Pt, metric: Metric = "euclidean"): 0 | 1 {
  const scored = train
    .map((t) => ({ d: distance(t, p, metric), label: t.label }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(1, k));
  let ones = 0;
  for (const s of scored) ones += s.label;
  return ones > scored.length / 2 ? 1 : 0;
}

/** Classify every point of a regular grid (decision regions). */
export function knnGrid(
  train: Pt[],
  k: number,
  metric: Metric,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  cells = 44,
): Uint8Array {
  const out = new Uint8Array(cells * cells);
  for (let j = 0; j < cells; j++) {
    const y = yMin + ((yMax - yMin) * (j + 0.5)) / cells;
    for (let i = 0; i < cells; i++) {
      const x = xMin + ((xMax - xMin) * (i + 0.5)) / cells;
      out[j * cells + i] = knnClassify(train, k, { x, y, label: 0 }, metric);
    }
  }
  return out;
}

export function accuracyOf(pts: Pt[], predict: (p: Pt) => 0 | 1): number {
  if (!pts.length) return NaN;
  let right = 0;
  for (const p of pts) if (predict(p) === p.label) right++;
  return right / pts.length;
}

// ---------------------------------------------------------------------------
// Logistic regression — batch gradient descent (real training)
// ---------------------------------------------------------------------------

export interface LogisticModel {
  w1: number;
  w2: number;
  b: number;
  /** Loss (mean cross-entropy) at the end of training. */
  loss: number;
  iterations: number;
}

export function sigmoid(z: number): number {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const e = Math.exp(z);
  return e / (1 + e);
}

/** Deterministic full-batch gradient descent on standardised features. */
export function trainLogistic(
  pts: Pt[],
  opts: { lr?: number; iterations?: number; l2?: number } = {},
): LogisticModel {
  const lr = opts.lr ?? 0.5;
  const iterations = opts.iterations ?? 400;
  const l2 = opts.l2 ?? 0;
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  const n = pts.length;
  let loss = NaN;
  for (let it = 0; it < iterations; it++) {
    let g1 = 0;
    let g2 = 0;
    let gb = 0;
    let l = 0;
    for (const p of pts) {
      const z = w1 * p.x + w2 * p.y + b;
      const ph = sigmoid(z);
      const err = ph - p.label;
      g1 += err * p.x;
      g2 += err * p.y;
      gb += err;
      l += -(p.label * Math.log(ph + 1e-12) + (1 - p.label) * Math.log(1 - ph + 1e-12));
    }
    loss = l / n;
    w1 -= (lr * g1) / n + lr * l2 * w1;
    w2 -= (lr * g2) / n + lr * l2 * w2;
    b -= (lr * gb) / n;
  }
  return { w1, w2, b, loss, iterations };
}

export function logisticPredict(m: LogisticModel, p: Pt): 0 | 1 {
  return sigmoid(m.w1 * p.x + m.w2 * p.y + m.b) >= 0.5 ? 1 : 0;
}

export function logisticGrid(
  m: LogisticModel,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  cells = 44,
): Uint8Array {
  const out = new Uint8Array(cells * cells);
  for (let j = 0; j < cells; j++) {
    const y = yMin + ((yMax - yMin) * (j + 0.5)) / cells;
    for (let i = 0; i < cells; i++) {
      const x = xMin + ((xMax - xMin) * (i + 0.5)) / cells;
      out[j * cells + i] = sigmoid(m.w1 * x + m.w2 * y + m.b) >= 0.5 ? 1 : 0;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Train / test split (deterministic shuffle)
// ---------------------------------------------------------------------------

export function trainTestSplit<T>(items: T[], testFrac: number, seed: number): { train: T[]; test: T[] } {
  const rng = mulberry32(seed);
  const idx = items.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const cut = Math.round(idx.length * testFrac);
  return {
    test: idx.slice(0, cut).map((i) => items[i]),
    train: idx.slice(cut).map((i) => items[i]),
  };
}

// ---------------------------------------------------------------------------
// Confusion matrix, metrics, ROC
// ---------------------------------------------------------------------------

export interface Confusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export function confusionAt(scores: Array<{ score: number; label: 0 | 1 }>, threshold: number): Confusion {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const s of scores) {
    const pred: 0 | 1 = s.score >= threshold ? 1 : 0;
    if (pred === 1 && s.label === 1) tp++;
    else if (pred === 1 && s.label === 0) fp++;
    else if (pred === 0 && s.label === 1) fn++;
    else tn++;
  }
  return { tp, fp, fn, tn };
}

export interface ClassifierMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  specificity: number;
  f1: number;
}

export function metricsFrom(c: Confusion): ClassifierMetrics {
  const { tp, fp, fn, tn } = c;
  const total = tp + fp + fn + tn;
  return {
    accuracy: total ? (tp + tn) / total : NaN,
    precision: tp + fp ? tp / (tp + fp) : NaN,
    recall: tp + fn ? tp / (tp + fn) : NaN,
    specificity: tn + fp ? tn / (tn + fp) : NaN,
    f1: tp + fn + fp ? (2 * tp) / (2 * tp + fn + fp) : NaN,
  };
}

export interface RocPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

/** ROC curve over every distinct score as a threshold (descending). */
export function rocCurve(scores: Array<{ score: number; label: 0 | 1 }>): RocPoint[] {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const pos = sorted.filter((s) => s.label === 1).length;
  const neg = sorted.length - pos;
  if (!pos || !neg) return [];
  const pts: RocPoint[] = [{ fpr: 0, tpr: 0, threshold: Infinity }];
  let tp = 0;
  let fp = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].label === 1) tp++;
    else fp++;
    const tpr = tp / pos;
    const fpr = fp / neg;
    if (i === sorted.length - 1 || sorted[i + 1].score !== sorted[i].score) {
      pts.push({ fpr, tpr, threshold: sorted[i].score });
    }
  }
  return pts;
}

/** Area under the ROC curve (trapezoid over the stepped curve). */
export function rocAuc(scores: Array<{ score: number; label: 0 | 1 }>): number {
  const roc = rocCurve(scores);
  if (roc.length < 2) return NaN;
  let auc = 0;
  for (let i = 1; i < roc.length; i++) {
    auc += ((roc[i].fpr - roc[i - 1].fpr) * (roc[i].tpr + roc[i - 1].tpr)) / 2;
  }
  return auc;
}

/**
 * Two-class scores whose overlap the student controls — used by the
 * confusion-matrix lab. Class 1 scores Beta(a, b) shaped around high
 * values; separability moves the class-1 mean.
 */
export function generateScores(n: number, separation: number, seed: number): Array<{ score: number; label: 0 | 1 }> {
  const rng = mulberry32(seed);
  const out: Array<{ score: number; label: 0 | 1 }> = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i < half ? 0 : 1;
    const mu = label === 0 ? 0.5 - separation / 2 : 0.5 + separation / 2;
    const s = clamp01(mu + rnorm(rng, 0, 0.13));
    out.push({ score: s, label });
  }
  return out;
}

function clamp01(v: number): number {
  return Math.max(0.001, Math.min(0.999, v));
}

// ---------------------------------------------------------------------------
// Permutation importance (model-agnostic, computed for real)
// ---------------------------------------------------------------------------

export interface ImportanceRow {
  feature: string;
  /** Accuracy drop when this column is shuffled (negative = noise). */
  drop: number;
  informative: boolean;
}

/**
 * k-NN permutation importance on a named-feature table: baseline test
 * accuracy minus accuracy after shuffling each feature column (seeded,
 * so the demonstration is reproducible).
 */
export function permutationImportance(
  table: { features: number[][]; labels: (0 | 1)[]; names: string[]; informative: boolean[] },
  opts: { k?: number; testFrac?: number; seed?: number } = {},
): { rows: ImportanceRow[]; baseline: number } {
  const k = opts.k ?? 5;
  const testFrac = opts.testFrac ?? 0.3;
  const seed = opts.seed ?? 7;
  const { features, labels, names, informative } = table;
  const rowsAll = features.map((x, i) => ({ x, y: labels[i] }));
  const { train, test } = trainTestSplit(rowsAll, testFrac, seed);
  const dims = names.length;

  // Column-wise standardisation fitted on the TRAIN split only (an honest
  // pipeline), then full-vector k-NN: importance must see every feature.
  const colMean = new Array(dims).fill(0);
  const colSd = new Array(dims).fill(1);
  for (let d = 0; d < dims; d++) {
    const vals = train.map((r) => r.x[d]);
    colMean[d] = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
    colSd[d] =
      Math.sqrt(vals.reduce((s, v) => s + (v - colMean[d]) ** 2, 0) / (vals.length || 1)) || 1;
  }
  const vecDist = (a: number[], b: number[]) => {
    let s = 0;
    for (let d = 0; d < a.length; d++) s += (a[d] - b[d]) ** 2;
    return Math.sqrt(s);
  };
  const trainVecs = train.map((r) => ({ v: r.x.map((v, d) => (v - colMean[d]) / colSd[d]), y: r.y }));
  const testVecs = test.map((r) => ({ v: r.x.map((v, d) => (v - colMean[d]) / colSd[d]), y: r.y }));
  const knnVec = (trainSet: Array<{ v: number[]; y: 0 | 1 }>, v: number[]): 0 | 1 => {
    const scored = trainSet
      .map((t) => ({ d: vecDist(t.v, v), y: t.y }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    let ones = 0;
    for (const s of scored) ones += s.y;
    return ones > scored.length / 2 ? 1 : 0;
  };
  const accuracyOfVec = (
    testSet: Array<{ v: number[]; y: 0 | 1 }>,
    predict: (v: number[]) => 0 | 1,
  ): number => {
    if (!testSet.length) return NaN;
    let right = 0;
    for (const t of testSet) if (predict(t.v) === t.y) right++;
    return right / testSet.length;
  };
  const baseline = accuracyOfVec(testVecs, (v) => knnVec(trainVecs, v));
  const rng = mulberry32(seed + 101);
  const rows: ImportanceRow[] = names.map((name, d) => {
    const shuffled = trainVecs.map((t) => ({ ...t, v: [...t.v] }));
    const order = shuffled.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((src, dst) => (shuffled[dst].v[d] = trainVecs[src].v[d]));
    const acc = accuracyOfVec(testVecs, (v) => knnVec(shuffled, v));
    return { feature: name, drop: baseline - acc, informative: informative[d] };
  });
  return { rows, baseline };
}

/**
 * A tabular dataset with named informative and noise features: y depends
 * (nonlinearly) on x1, x2, x3 only; x4..x6 are pure noise.
 */
export function generateFeatureTable(
  n: number,
  signal: number,
  seed: number,
): { features: number[][]; labels: (0 | 1)[]; names: string[]; informative: boolean[] } {
  const rng = mulberry32(seed);
  const features: number[][] = [];
  const labels: (0 | 1)[] = [];
  for (let i = 0; i < n; i++) {
    const x1 = rnorm(rng);
    const x2 = rnorm(rng);
    const x3 = rnorm(rng);
    const x4 = rnorm(rng);
    const x5 = rnorm(rng);
    const x6 = rnorm(rng);
    // Decision boundary: signal·(x1 + x2·0.8 − x3·0.6) crosses 0.6·noise-free offset
    const logit = signal * (x1 + 0.8 * x2 - 0.6 * x3) - 0.4;
    features.push([x1, x2, x3, x4, x5, x6]);
    labels.push(logit > 0 ? 1 : 0);
  }
  return {
    features,
    labels,
    names: ["x1 (signal)", "x2 (signal)", "x3 (signal)", "x4 (noise)", "x5 (noise)", "x6 (noise)"],
    informative: [true, true, true, false, false, false],
  };
}

/** Convenience for reusing one rng across draws. */
export function newRng(seed: number): Rng {
  return mulberry32(seed);
}
