/**
 * The Visual Library statistics engine.
 *
 * Pure functions only — no React, no DOM. Every number shown by the
 * statistics visualizations is computed here, and known-value checks for
 * the nontrivial pieces (erf, normal/t quantiles, pmfs, OLS) live in
 * tests/unit/visual-library.test.ts.
 */

// ---------------------------------------------------------------------------
// RNG — deterministic, seedable (mulberry32). Every simulation in the
// Visual Library is reproducible: the UI shows the seed.
// ---------------------------------------------------------------------------

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform on [lo, hi). */
export function runif(rng: Rng, lo = 0, hi = 1): number {
  return lo + (hi - lo) * rng();
}

function rnormStd(rng: Rng): number {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Normal via Box–Muller. */
export function rnorm(rng: Rng, mu = 0, sigma = 1): number {
  return mu + rnormStd(rng) * sigma;
}

/** Exponential with rate λ. */
export function rexp(rng: Rng, rate = 1): number {
  return -Math.log(Math.max(rng(), 1e-12)) / rate;
}

/** Random integer, inclusive on both ends. */
export function rint(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Bivariate standard normal via Cholesky: correlation ρ. */
export function rbivariateNormal(rng: Rng, rho: number, n: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  const r = Math.max(-0.999, Math.min(0.999, rho));
  for (let i = 0; i < n; i++) {
    const z1 = rnormStd(rng);
    const z2 = rnormStd(rng);
    out.push({ x: z1, y: r * z1 + Math.sqrt(1 - r * r) * z2 });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Descriptive statistics
// ---------------------------------------------------------------------------

export function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/** Sample variance (ddof = 1). */
export function variance(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return s / (xs.length - 1);
}

export function sd(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

/** Linear-interpolated quantile of a SORTED sample (R type 7). */
export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (pos - lo) * (sorted[hi] - sorted[lo]);
}

export interface FiveNumber {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
  /** Indices into the ORIGINAL (unsorted) array. */
  outlierIdx: number[];
}

export function fiveNumber(xs: number[]): FiveNumber {
  const sorted = [...xs].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outlierIdx: number[] = [];
  xs.forEach((x, i) => {
    if (x < lowerFence || x > upperFence) outlierIdx.push(i);
  });
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    q1,
    median,
    q3,
    iqr,
    lowerFence,
    upperFence,
    outlierIdx,
  };
}

export interface HistBin {
  from: number;
  to: number;
  count: number;
  density: number;
}

export function histogram(xs: number[], bins: number, lo?: number, hi?: number): HistBin[] {
  if (!xs.length || bins < 1) return [];
  let min = lo ?? Math.min(...xs);
  let max = hi ?? Math.max(...xs);
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }
  const w = (max - min) / bins;
  const out: HistBin[] = [];
  for (let i = 0; i < bins; i++) {
    out.push({ from: min + i * w, to: min + (i + 1) * w, count: 0, density: 0 });
  }
  for (const x of xs) {
    let idx = Math.floor((x - min) / w);
    if (idx === bins) idx = bins - 1; // x === max lands in the last bin
    if (idx >= 0 && idx < bins) out[idx].count++;
  }
  for (const b of out) b.density = b.count / (xs.length * w);
  return out;
}

/** Fixed-grid bin counts on [from, to] (score-overlap plots). */
export function binCounts(xs: number[], from: number, to: number, bins: number): number[] {
  const w = (to - from) / bins;
  const counts = new Array(bins).fill(0);
  for (const x of xs) {
    let idx = Math.floor((x - from) / w);
    if (idx === bins) idx = bins - 1;
    if (idx >= 0 && idx < bins) counts[idx]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Special functions
// ---------------------------------------------------------------------------

/** log Γ(x) — Lanczos approximation (g = 7). */
export function lgamma(x: number): number {
  const g = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    // reflection: Γ(x)Γ(1−x) = π / sin(πx)
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  }
  const z = x - 1;
  let a = g[0];
  const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += g[i] / (z + i);
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

function logChoose(n: number, k: number): number {
  return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
}

/** Error function — Abramowitz & Stegun 7.1.26 (|ε| < 1.5e-7). */
export function erfAsg(x: number): number {
  const s = Math.sign(x);
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return s * y;
}

// --- Regularized incomplete gamma P(a, x) — series + continued fraction (NR §6.2)

function gser(a: number, x: number): number {
  const ITMAX = 500;
  const EPS = 3e-16;
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 0; n < ITMAX; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
}

function gcf(a: number, x: number): number {
  const ITMAX = 500;
  const EPS = 3e-16;
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

/** Regularized lower incomplete gamma P(a, x), machine precision. */
export function incGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  return x < a + 1 ? gser(a, x) : 1 - gcf(a, x);
}

/**
 * Error function, machine precision: erf(z) = P(½, z²) for z ≥ 0
 * (the χ²(1) identity), symmetrised for negative arguments.
 */
export function erf(x: number): number {
  if (Number.isNaN(x)) return NaN;
  if (x === 0) return 0;
  const z = Math.abs(x);
  const p = incGammaP(0.5, z * z);
  return x > 0 ? p : -p;
}

/** Φ(z) — normal CDF. */
export function normalCdf(z: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((z - mu) / (sigma * Math.SQRT2)));
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/**
 * Φ⁻¹(p) — bisection on the machine-precision CDF. Robust across the
 * full representable range (handles p as small as 1e-300 honestly).
 */
export function normalQuantile(p: number): number {
  if (Number.isNaN(p)) return NaN;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -40;
  let hi = 40;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// --- Student's t (via the regularized incomplete beta function) -----------

function betacf(x: number, a: number, b: number): number {
  const MAXIT = 300;
  const EPS = 3e-14;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b) — continued fraction (NR §6.4). */
export function incBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnBeta = lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  if (x < (a + 1) / (a + b + 2)) {
    return (Math.exp(lnBeta) * betacf(x, a, b)) / a;
  }
  // symmetry: I_x(a,b) = 1 − I_{1−x}(b,a)
  return 1 - (Math.exp(lnBeta) * betacf(1 - x, b, a)) / b;
}

/** Student's t CDF P(T ≤ t) with df degrees of freedom. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = 0.5 * incBeta(x, df / 2, 0.5);
  return t > 0 ? 1 - p : p;
}

/** Student's t quantile via bisection on the CDF (monotone, robust). */
export function tQuantile(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (Math.abs(p - 0.5) < 1e-12) return 0;
  let lo = -1e3;
  let hi = 1e3;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// Probability mass / density functions
// ---------------------------------------------------------------------------

export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function binomialCdf(k: number, n: number, p: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += binomialPmf(i, n, p);
  return Math.min(1, s);
}

export function poissonPmf(k: number, lambda: number): number {
  if (k < 0 || lambda <= 0) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - lgamma(k + 1));
}

export function poissonCdf(k: number, lambda: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += poissonPmf(i, lambda);
  return Math.min(1, s);
}

/** P(X = k) = (1−p)^k · p — failures before the first success. */
export function geometricPmf(k: number, p: number): number {
  if (k < 0 || p <= 0 || p > 1) return 0;
  return Math.pow(1 - p, k) * p;
}

export function exponentialPdf(x: number, rate: number): number {
  return x < 0 || rate <= 0 ? 0 : rate * Math.exp(-rate * x);
}

export function exponentialCdf(x: number, rate: number): number {
  return x < 0 ? 0 : 1 - Math.exp(-rate * x);
}

export function uniformPdf(x: number, lo: number, hi: number): number {
  return x < lo || x > hi || hi <= lo ? 0 : 1 / (hi - lo);
}

export function uniformCdf(x: number, lo: number, hi: number): number {
  if (x <= lo) return 0;
  if (x >= hi) return 1;
  return (x - lo) / (hi - lo);
}

// ---------------------------------------------------------------------------
// Correlation & regression (ordinary least squares)
// ---------------------------------------------------------------------------

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

export interface OlsFit {
  slope: number;
  intercept: number;
  r2: number;
  rmse: number;
  n: number;
}

export function olsFit(xs: number[], ys: number[]): OlsFit {
  const n = Math.min(xs.length, ys.length);
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) * (xs[i] - mx);
  }
  const slope = sxx === 0 ? NaN : sxy / sxx;
  const intercept = my - slope * mx;
  let sse = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    const e = ys[i] - (intercept + slope * xs[i]);
    sse += e * e;
    sst += (ys[i] - my) * (ys[i] - my);
  }
  return {
    slope,
    intercept,
    r2: sst === 0 ? NaN : 1 - sse / sst,
    rmse: n ? Math.sqrt(sse / n) : NaN,
    n,
  };
}

// ---------------------------------------------------------------------------
// Confidence intervals & hypothesis tests (one-sample mean)
// ---------------------------------------------------------------------------

export interface CiResult {
  estimate: number;
  se: number;
  critical: number;
  moe: number;
  lo: number;
  hi: number;
  pivotal: "z" | "t";
}

/** CI for a mean. sigma === null → one-sample t interval using s. */
export function ciForMean(xbar: number, n: number, sigma: number | null, s: number, level: number): CiResult {
  const pivotal: "z" | "t" = sigma === null ? "t" : "z";
  const spread = pivotal === "z" ? (sigma as number) : s;
  const se = spread / Math.sqrt(n);
  const critical = pivotal === "z" ? normalQuantile(0.5 + level / 2) : tQuantile(0.5 + level / 2, n - 1);
  const moe = critical * se;
  return { estimate: xbar, se, critical, moe, lo: xbar - moe, hi: xbar + moe, pivotal };
}

export interface TestResult {
  statistic: number;
  pValue: number;
  criticalValue: number;
  reject: boolean;
  pivotal: "z" | "t";
  xbar: number;
  se: number;
}

/**
 * One-sample test of H₀: μ = μ₀. sigma === null → one-sample t-test.
 * tails: "left" → P(T ≤ t); "right" → P(T ≥ t); "two" → 2·min(p, 1−p).
 */
export function oneSampleTest(
  xbar: number,
  n: number,
  mu0: number,
  sigma: number | null,
  s: number,
  alpha: number,
  tails: "left" | "right" | "two",
): TestResult {
  const pivotal: "z" | "t" = sigma === null ? "t" : "z";
  const spread = pivotal === "z" ? (sigma as number) : s;
  const se = spread / Math.sqrt(n);
  const statistic = (xbar - mu0) / se;
  const cdf = (t: number) => (pivotal === "z" ? normalCdf(t) : tCdf(t, n - 1));
  const pLower = cdf(statistic);
  let pValue: number;
  if (tails === "left") pValue = pLower;
  else if (tails === "right") pValue = 1 - pLower;
  else pValue = 2 * Math.min(pLower, 1 - pLower);
  pValue = Math.min(1, Math.max(0, pValue));
  // Upper-tail critical value: Φ⁻¹(1 − α/2) for two-sided, Φ⁻¹(1 − α)
  // for one-sided (the lower critical value is its mirror image).
  const tailArea = tails === "two" ? alpha / 2 : alpha;
  const criticalValue =
    pivotal === "z" ? normalQuantile(1 - tailArea) : tQuantile(1 - tailArea, n - 1);
  const reject =
    tails === "two"
      ? Math.abs(statistic) > criticalValue
      : tails === "left"
        ? statistic < -criticalValue
        : statistic > criticalValue;
  return { statistic, pValue, criticalValue, reject, pivotal, xbar, se };
}

// ---------------------------------------------------------------------------
// Teaching populations (sampling simulator)
// ---------------------------------------------------------------------------

export type PopulationShape = "uniform" | "right-skew" | "bimodal" | "normal";

/**
 * Density of each teaching population on a fixed domain [lo, hi] — each
 * curve is the population truncated to the domain and renormalised, so the
 * drawn curve always carries area exactly 1 (the drawn picture is honest).
 * populationMoments reports the sampling truth instead (see its comment).
 */
export function populationPdf(shape: PopulationShape, x: number, lo: number, hi: number): number {
  const raw = (xx: number): number => {
    switch (shape) {
      case "uniform":
        return uniformPdf(xx, lo, hi);
      case "right-skew": {
        const rate = 1 / 12;
        return exponentialPdf(xx - lo, rate);
      }
      case "bimodal": {
        const mid = (lo + hi) / 2;
        const sdB = (hi - lo) / 14;
        return 0.5 * normalPdf(xx, lo + (hi - lo) * 0.3, sdB) + 0.5 * normalPdf(xx, mid + (hi - lo) * 0.2, sdB);
      }
      case "normal":
        return normalPdf(xx, (lo + hi) / 2, (hi - lo) / 6);
    }
  };
  const area = POPULATION_AREAS.get(shape) ?? computePopulationArea(shape, lo, hi);
  return raw(x) / area;
}

const POPULATION_AREAS = new Map<PopulationShape, number>();

function computePopulationArea(shape: PopulationShape, lo: number, hi: number): number {
  const raw = (xx: number): number => {
    switch (shape) {
      case "uniform":
        return uniformPdf(xx, lo, hi);
      case "right-skew":
        return exponentialPdf(xx - lo, 1 / 12);
      case "bimodal": {
        const mid = (lo + hi) / 2;
        const sdB = (hi - lo) / 14;
        return 0.5 * normalPdf(xx, lo + (hi - lo) * 0.3, sdB) + 0.5 * normalPdf(xx, mid + (hi - lo) * 0.2, sdB);
      }
      case "normal":
        return normalPdf(xx, (lo + hi) / 2, (hi - lo) / 6);
    }
  };
  const area = integrate(raw, lo, hi, 2000);
  POPULATION_AREAS.set(shape, area);
  return area;
}

/** Simpson's-rule integral of f over [a, b]. */
export function integrate(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (b <= a) return 0;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Exact μ and σ of each teaching population on [lo, hi]. */
export function populationMoments(shape: PopulationShape, lo: number, hi: number): { mu: number; sigma: number } {
  const mid = (lo + hi) / 2;
  switch (shape) {
    case "uniform":
      return { mu: mid, sigma: (hi - lo) / Math.sqrt(12) };
    case "right-skew": {
      const pdf = (x: number) => populationPdf("right-skew", x, lo, hi);
      const mu = integrate((x) => x * pdf(x), lo, hi);
      const ex2 = integrate((x) => x * x * pdf(x), lo, hi);
      return { mu, sigma: Math.sqrt(Math.max(0, ex2 - mu * mu)) };
    }
    case "bimodal": {
      const sdB = (hi - lo) / 14;
      const m1 = lo + (hi - lo) * 0.3;
      const m2 = mid + (hi - lo) * 0.2;
      const mu = 0.5 * m1 + 0.5 * m2;
      const varr = 0.5 * (sdB * sdB + m1 * m1) + 0.5 * (sdB * sdB + m2 * m2) - mu * mu;
      return { mu, sigma: Math.sqrt(Math.max(0, varr)) };
    }
    case "normal":
      return { mu: mid, sigma: (hi - lo) / 6 };
  }
}

/** Draw one value from a teaching population (rejection where needed). */
export function drawFromPopulation(rng: Rng, shape: PopulationShape, lo: number, hi: number): number {
  switch (shape) {
    case "uniform":
      return runif(rng, lo, hi);
    case "right-skew":
      return Math.min(hi, lo + rexp(rng, 1 / 12));
    case "bimodal": {
      const u = rng();
      const sdB = (hi - lo) / 14;
      const m = u < 0.5 ? lo + (hi - lo) * 0.3 : (lo + hi) / 2 + (hi - lo) * 0.2;
      return m + rnormStd(rng) * sdB;
    }
    case "normal":
      return midOf(lo, hi) + rnormStd(rng) * ((hi - lo) / 6);
  }
}

function midOf(lo: number, hi: number): number {
  return (lo + hi) / 2;
}

// ---------------------------------------------------------------------------
// Contour lines (marching squares) — gradient & optimization labs
// ---------------------------------------------------------------------------

export interface ContourSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  level: number;
}

/**
 * Marching squares over a sampled grid: one linearly-interpolated segment
 * per cell crossing, per level. Levels are drawn lightest-first so darker
 * contours overlay cleanly.
 */
export function contourSegments(
  f: (x: number, y: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  levels: number[],
  nx = 60,
  ny = 48,
): ContourSegment[] {
  const vals = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      vals[j * (nx + 1) + i] = f(xMin + ((xMax - xMin) * i) / nx, yMin + ((yMax - yMin) * j) / ny);
    }
  }
  const out: ContourSegment[] = [];
  const lerp = (v0: number, v1: number, level: number) => (level - v0) / (v1 - v0 || 1e-12);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x0 = xMin + ((xMax - xMin) * i) / nx;
      const x1 = xMin + ((xMax - xMin) * (i + 1)) / nx;
      const y0 = yMin + ((yMax - yMin) * j) / ny;
      const y1 = yMin + ((yMax - yMin) * (j + 1)) / ny;
      const v00 = vals[j * (nx + 1) + i];
      const v10 = vals[j * (nx + 1) + i + 1];
      const v11 = vals[(j + 1) * (nx + 1) + i + 1];
      const v01 = vals[(j + 1) * (nx + 1) + i];
      for (const level of levels) {
        const c =
          (v00 > level ? 1 : 0) | (v10 > level ? 2 : 0) | (v11 > level ? 4 : 0) | (v01 > level ? 8 : 0);
        if (c === 0 || c === 15) continue;
        const top = { x: x0 + (x1 - x0) * lerp(v00, v10, level), y: y0 };
        const right = { x: x1, y: y0 + (y1 - y0) * lerp(v10, v11, level) };
        const bottom = { x: x0 + (x1 - x0) * lerp(v01, v11, level), y: y1 };
        const left = { x: x0, y: y0 + (y1 - y0) * lerp(v00, v01, level) };
        const add = (a: { x: number; y: number }, b: { x: number; y: number }) =>
          out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, level });
        switch (c) {
          case 1: case 14: add(left, top); break;
          case 2: case 13: add(top, right); break;
          case 3: case 12: add(left, right); break;
          case 4: case 11: add(right, bottom); break;
          case 5: case 10: add(left, top); add(right, bottom); break;
          case 6: case 9: add(top, bottom); break;
          case 7: case 8: add(left, bottom); break;
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function fmt(x: number | null | undefined, digits = 2): string {
  if (x === null || x === undefined || Number.isNaN(x) || !Number.isFinite(x)) return "—";
  if (Math.abs(x) >= 1e6 || (Math.abs(x) < 1e-4 && x !== 0)) return x.toExponential(2);
  return String(Number(x.toFixed(digits)));
}

export function pct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}
