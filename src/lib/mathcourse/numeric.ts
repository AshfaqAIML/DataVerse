/**
 * Exact-ish arithmetic helpers for the foundations lessons and the
 * FractionStudio / RatioBars labs: gcd, fraction arithmetic with reduction,
 * decimal/percent formatting, and rounding done the way we teach it
 * (not the way parseFloat drifts).
 */

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export interface Frac {
  num: number; // numerator (sign lives here)
  den: number; // positive denominator
}

export function frac(num: number, den: number): Frac {
  if (den === 0) throw new Error("Denominator cannot be zero");
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return frac(a.num * b.den + b.num * a.den, a.den * b.den);
}
export function fracSub(a: Frac, b: Frac): Frac {
  return frac(a.num * b.den - b.num * a.den, a.den * b.den);
}
export function fracMul(a: Frac, b: Frac): Frac {
  return frac(a.num * b.num, a.den * b.den);
}
export function fracDiv(a: Frac, b: Frac): Frac {
  if (b.num === 0) throw new Error("Cannot divide by zero fraction");
  return frac(a.num * b.den, a.den * b.num);
}
export function fracEq(a: Frac, b: Frac): boolean {
  return a.num === b.num && a.den === b.den;
}
export function fracToNumber(f: Frac): number {
  return f.num / f.den;
}
export function fracToString(f: Frac): string {
  if (f.den === 1) return String(f.num);
  return `${f.num}/${f.den}`;
}

/** Decimal expansion of a fraction as a string, marking repeating tails. */
export function decimalExpansion(f: Frac, maxDigits = 12): { text: string; repeats: string | null } {
  const sign = f.num < 0 ? "-" : "";
  const n = Math.abs(f.num);
  const whole = Math.floor(n / f.den);
  let rem = n % f.den;
  if (rem === 0) return { text: `${sign}${whole}`, repeats: null };
  const digits: number[] = [];
  const seenAt = new Map<number, number>();
  let repeatFrom = -1;
  while (rem !== 0 && digits.length < maxDigits) {
    if (seenAt.has(rem)) {
      repeatFrom = seenAt.get(rem)!;
      break;
    }
    seenAt.set(rem, digits.length);
    rem *= 10;
    digits.push(Math.floor(rem / f.den));
    rem %= f.den;
  }
  const ds = digits.map(String).join("");
  if (repeatFrom >= 0) {
    const head = ds.slice(0, repeatFrom);
    const tail = ds.slice(repeatFrom);
    return { text: `${sign}${whole}.${head}(${tail})…`, repeats: tail };
  }
  return { text: `${sign}${whole}.${ds}`, repeats: null };
}

/** Format a probability/proportion as a percentage string. */
export function toPercent(x: number, digits = 1): string {
  const v = x * 100;
  const s = v.toFixed(digits);
  return `${s.endsWith(".0") ? s.slice(0, -2) : s}%`;
}

/** Percentage change from `before` to `after`, as a display string. */
export function percentChange(before: number, after: number, digits = 1): string {
  if (before === 0) return "undefined (from zero)";
  const change = ((after - before) / Math.abs(before)) * 100;
  const s = change.toFixed(digits);
  return `${s.endsWith(".0") ? s.slice(0, -2) : s}%`;
}

/** Pretty-print a number without float dust: 0.30000000000000004 -> "0.3". */
export function cleanNumber(x: number, maxDigits = 10): string {
  if (!Number.isFinite(x)) return String(x);
  if (Number.isInteger(x)) return String(x);
  let s = x.toFixed(maxDigits);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  // toFixed may have rounded away everything meaningful
  if (s === "" || s === "-" || /^-?0$/.test(s) === false && Math.abs(parseFloat(s) - x) > 1e-9) {
    return String(x);
  }
  return s;
}

/** Ratio of two quantities reduced to smallest whole terms, e.g. 24:16 -> "3:2". */
export function reduceRatio(a: number, b: number): string {
  const g = gcd(a, b) || 1;
  return `${a / g}:${b / g}`;
}

/** Split a total into parts proportional to `weights` (proportion problems). */
export function proportionalSplit(total: number, weights: number[]): number[] {
  const sum = weights.reduce((s, w) => s + w, 0);
  if (sum === 0) throw new Error("Weights cannot all be zero");
  return weights.map((w) => (w / sum) * total);
}

/** Scientific notation parts, for the powers lesson: 345600 -> {3.456, 5}. */
export function sciParts(x: number): { mantissa: number; exponent: number } {
  if (x === 0) return { mantissa: 0, exponent: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(x)));
  const mantissa = x / Math.pow(10, exponent);
  // guard against float dust at boundaries like 999999.9999
  const m = Number(mantissa.toFixed(12));
  if (Math.abs(m) >= 10) return { mantissa: m / 10, exponent: exponent + 1 };
  if (m !== 0 && Math.abs(m) < 1) return { mantissa: m * 10, exponent: exponent - 1 };
  return { mantissa: m, exponent };
}

/** Format with thin thousands separators: 1234567.8 -> "1,234,567.8". */
export function groupDigits(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return String(x);
  const [int, dec] = (() => {
    const fixed = Number.isInteger(x) ? String(x) : x.toFixed(digits);
    const [i, d = ""] = fixed.split(".");
    return [i, d];
  })();
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedDec = dec.replace(/0+$/, "");
  return trimmedDec ? `${grouped}.${trimmedDec}` : grouped;
}
