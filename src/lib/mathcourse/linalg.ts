/**
 * Small, dependency-free linear algebra kernel (2x2 / 3x3 / general).
 *
 * Powers the MatrixLab and EigenExplorer components and backs the linear
 * algebra lessons' interactive demos. Determinant and inverse are exact
 * arithmetic paths for 2x2/3x3 (cofactor expansion) and Gaussian elimination
 * for anything larger. Everything returns plain numbers so the UI can show
 * every intermediate step honestly.
 */

export type Mat = number[][];

export function matShape(m: Mat): { rows: number; cols: number } {
  return { rows: m.length, cols: m[0]?.length ?? 0 };
}

export function matZeros(r: number, c: number): Mat {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => 0));
}

export function matIdentity(n: number): Mat {
  const m = matZeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
}

export function matAdd(a: Mat, b: Mat): Mat {
  const s = matShape(a);
  const t = matShape(b);
  if (s.rows !== t.rows || s.cols !== t.cols) {
    throw new Error(`Shape mismatch for addition: ${s.rows}x${s.cols} vs ${t.rows}x${t.cols}`);
  }
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

export function matSub(a: Mat, b: Mat): Mat {
  return matAdd(a, b.map((row) => row.map((v) => -v)));
}

export function matScale(a: Mat, k: number): Mat {
  return a.map((row) => row.map((v) => v * k));
}

export function matTranspose(a: Mat): Mat {
  return a[0].map((_, j) => a.map((row) => row[j]));
}

export function matMul(a: Mat, b: Mat): Mat {
  const s = matShape(a);
  const t = matShape(b);
  if (s.cols !== t.rows) {
    throw new Error(`Shape mismatch for multiplication: ${s.rows}x${s.cols} · ${t.rows}x${t.cols}`);
  }
  const out = matZeros(s.rows, t.cols);
  for (let i = 0; i < s.rows; i++) {
    for (let j = 0; j < t.cols; j++) {
      let sum = 0;
      for (let k = 0; k < s.cols; k++) sum += a[i][k] * b[k][j];
      out[i][j] = sum;
    }
  }
  return out;
}

/** Determinant: cofactor expansion for 2x2/3x3, LU-free recursion beyond. */
export function det(m: Mat): number {
  const { rows, cols } = matShape(m);
  if (rows !== cols) throw new Error("Determinant requires a square matrix");
  if (rows === 1) return m[0][0];
  if (rows === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let sum = 0;
  for (let j = 0; j < cols; j++) {
    if (m[0][j] === 0) continue;
    const minor = m.slice(1).map((row) => row.filter((_, c) => c !== j));
    sum += (j % 2 === 0 ? 1 : -1) * m[0][j] * det(minor);
  }
  return sum;
}

/** Inverse via Gauss-Jordan with partial pivoting. Throws if singular. */
export function matInverse(m: Mat): Mat {
  const n = m.length;
  if (matShape(m).cols !== n) throw new Error("Inverse requires a square matrix");
  const aug = m.map((row, i) => [...row, ...matIdentity(n)[i]]);
  for (let col = 0; col < n; col++) {
    // pivot: largest absolute value in this column
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    }
    if (Math.abs(aug[piv][col]) < 1e-12) {
      throw new Error("Matrix is singular (determinant is zero) — no inverse exists");
    }
    [aug[col], aug[piv]] = [aug[piv], aug[col]];
    const p = aug[col][col];
    aug[col] = aug[col].map((v) => v / p);
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (factor === 0) continue;
      aug[r] = aug[r].map((v, c) => v - factor * aug[col][c]);
    }
  }
  return aug.map((row) => row.slice(n).map(trimNum));
}

/**
 * Gaussian elimination solving A·x = b, recording every row operation as a
 * human-readable step (the systems lesson shows these to the learner).
 */
export function gaussSolve(A: Mat, b: number[]): { x: number[]; steps: string[] } {
  const n = A.length;
  if (matShape(A).cols !== n || b.length !== n) throw new Error("System shape mismatch");
  const m = A.map((row, i) => [...row, b[i]]);
  const steps: string[] = [];
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    }
    if (Math.abs(m[piv][col]) < 1e-12) {
      throw new Error("No unique solution (a pivot column collapses — parallel or dependent equations)");
    }
    if (piv !== col) {
      [m[col], m[piv]] = [m[piv], m[col]];
      steps.push(`Swap row ${col + 1} with row ${piv + 1} to get a nonzero pivot.`);
    }
    for (let r = col + 1; r < n; r++) {
      const factor = m[r][col] / m[col][col];
      if (factor === 0) continue;
      for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c];
      steps.push(`Row ${r + 1} → Row ${r + 1} − ${trim(factor)} × Row ${col + 1}.`);
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r][n];
    for (let c = r + 1; c < n; c++) s -= m[r][c] * x[c];
    x[r] = s / m[r][r];
  }
  return { x: x.map(trimNum), steps };
}

/** Exact 2x2 eigenvalues by the quadratic formula (complex -> null). */
export function eigen2(m: Mat): { real: boolean; values: [number, number] | null } {
  const { rows, cols } = matShape(m);
  if (rows !== 2 || cols !== 2) throw new Error("eigen2 expects a 2x2 matrix");
  const [a, b] = [m[0][0], m[0][1]];
  const [c, d] = [m[1][0], m[1][1]];
  const tr = a + d;
  const disc = tr * tr - 4 * (a * d - b * c);
  if (disc < -1e-12) return { real: false, values: null };
  const s = Math.sqrt(Math.max(disc, 0));
  return { real: true, values: [trimNum((tr - s) / 2), trimNum((tr + s) / 2)] };
}

/** Eigenvector for a given eigenvalue of a 2x2 matrix (unit length). */
export function eigenVec2(m: Mat, lambda: number): { x: number; y: number } {
  // (A − λI)v = 0: rows are (a−λ)x + b y = 0 and c x + (d−λ) y = 0
  const a = m[0][0] - lambda;
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1] - lambda;
  // Pick the row with larger norm to avoid the degenerate all-zero row.
  let vx: number, vy: number;
  if (Math.abs(a) + Math.abs(b) >= Math.abs(c) + Math.abs(d)) {
    // a x + b y = 0 → v = (b, −a) or (−b, a); choose (−b, a) when b ≠ 0
    vx = -b;
    vy = a;
  } else {
    vx = -d;
    vy = c;
  }
  const n = Math.hypot(vx, vy);
  if (n < 1e-12) return { x: 1, y: 0 }; // λI ≈ A: identity-like
  return { x: trimNum(vx / n), y: trimNum(vy / n) };
}

export function dot(u: number[], v: number[]): number {
  if (u.length !== v.length) throw new Error("dot: length mismatch");
  return u.reduce((s, a, i) => s + a * v[i], 0);
}

export function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

export function angleBetween(u: number[], v: number[]): number {
  const c = dot(u, v) / (norm(u) * norm(v));
  return Math.acos(Math.min(1, Math.max(-1, c)));
}

/** The projection of u onto v: proj_v(u) = (u·v / v·v) v. */
export function project(u: number[], v: number[]): number[] {
  const k = dot(u, v) / dot(v, v);
  return v.map((c) => k * c);
}

function trim(x: number): string {
  return String(trimNum(x));
}
function trimNum(x: number): number {
  if (!Number.isFinite(x)) return x;
  const r = Number(x.toFixed(10));
  return Object.is(r, -0) ? 0 : r;
}

/** Format a matrix for display (Markdown-ish plain text, used in labs). */
export function matToString(m: Mat): string {
  return m.map((row) => `[${row.map((v) => trimNum(v)).join("  ")}]`).join("\n");
}
