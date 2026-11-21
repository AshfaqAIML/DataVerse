/**
 * Deterministic pseudo-random helpers for the Project Academy datasets.
 *
 * Every project's dataset is generated from a seed derived from its id, so
 * the "same" dataset greets every learner on every visit — reproducible,
 * shareable, and safe to discuss. Quality defects are injected on purpose
 * (each project's instructor reference documents exactly what was planted).
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Pick one element. */
  pick<T>(arr: readonly T[]): T;
  /** Weighted pick: weights align with arr. */
  pickWeighted<T>(arr: readonly T[], weights: readonly number[]): T;
  /** True with probability p. */
  chance(p: number): boolean;
  /** Normal draw (Box–Muller). */
  norm(mu: number, sd: number): number;
  /** Log-normal-ish positive draw. */
  posNorm(mu: number, sd: number): number;
  /** Uniform float rounded to dp decimals. */
  float(min: number, max: number, dp?: number): number;
  /** A date string (YYYY-MM-DD) within `days` days after `start`. */
  date(start: Date, days: number): string;
  /** A datetime string (YYYY-MM-DD HH:MM) in range. */
  datetime(start: Date, days: number, fromHour: number, toHour: number): string;
  /** Sample without replacement (k ≤ arr.length). */
  sample<T>(arr: readonly T[], k: number): T[];
  /** Round to dp decimals. */
  round(x: number, dp: number): number;
}

/** string → 32-bit seed (FNV-1a). */
export function seedFromString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG wrapped in the Rng helper interface. */
export function makeRng(seed: number | string): Rng {
  let a = typeof seed === "string" ? seedFromString(seed) : seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const round = (x: number, dp: number) => {
    const f = 10 ** dp;
    return Math.round(x * f) / f;
  };
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const rng: Rng = {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    pickWeighted: (arr, weights) => {
      const total = weights.reduce((a, b) => a + b, 0);
      let t = next() * total;
      for (let i = 0; i < arr.length; i++) {
        t -= weights[i];
        if (t <= 0) return arr[i];
      }
      return arr[arr.length - 1];
    },
    chance: (p) => next() < p,
    norm: (mu, sd) => {
      const u1 = Math.max(next(), 1e-9);
      const u2 = next();
      return mu + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    posNorm: (mu, sd) => Math.max(0.01, rng.norm(mu, sd)),
    float: (min, max, dp = 2) => round(min + next() * (max - min), dp),
    date: (start, days) => {
      const d = new Date(start.getTime() + Math.floor(next() * days) * 86400000);
      return iso(d);
    },
    datetime: (start, days, fromHour, toHour) => {
      const d = new Date(start.getTime() + Math.floor(next() * days) * 86400000);
      const mins = rng.int(fromHour * 60, toHour * 60);
      d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
      return `${iso(d)} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    },
    sample: (arr, k) => {
      const pool = [...arr];
      const out: (typeof arr)[number][] = [];
      for (let i = 0; i < k && pool.length; i++) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return out;
    },
    round,
  };
  return rng;
}

/** A missing cell renders as an empty CSV field (pandas reads NaN). */
export const MISSING = "";

/** Render a currency as a messy string variant (e.g. "$1,234.50") — an injected format defect. */
export function messyCurrency(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
