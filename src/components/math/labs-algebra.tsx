"use client";

/**
 * Algebra + linear algebra labs:
 *   VectorBoard      drag two vectors; see addition, scaling, dot product, angle
 *   MatrixLab        editable matrices; transpose / determinant / inverse /
 *                    multiplication / Gaussian solve with narrated steps
 *   LinearSystemLab  two lines with live coefficients; unique / none / infinite
 *   EigenExplorer    a 2x2 matrix warps the unit circle; eigendirections stand out
 */
import { useMemo, useState } from "react";
import { LabShell, LabSlider, Readout, PlotFrame, useDrag } from "./plotframe";
import { det, matInverse, matMul, matTranspose, gaussSolve, eigen2, eigenVec2, dot, norm, angleBetween } from "@/lib/mathcourse/linalg";
import { cleanNumber } from "@/lib/mathcourse/numeric";

// ---------------------------------------------------------------------------

export function VectorBoard() {
  const [u, setU] = useState({ x: 4, y: 2 });
  const [v, setV] = useState({ x: 1, y: 3 });
  const [k, setK] = useState(1.5);
  const [mode, setMode] = useState<"add" | "sub" | "dot">("add");

  const dragU = useDrag((x, y) => setU({ x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 }));
  const dragV = useDrag((x, y) => setV({ x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 }));

  const sum = { x: u.x + v.x, y: u.y + v.y };
  const diff = { x: u.x - v.x, y: u.y - v.y };
  const d = dot([u.x, u.y], [v.x, v.y]);
  const ang = (angleBetween([u.x, u.y], [v.x, v.y]) * 180) / Math.PI;
  const nu = norm([u.x, u.y]);
  const nv = norm([v.x, v.y]);
  const third = mode === "add" ? sum : diff;

  return (
    <LabShell
      title="Vector board"
      hint="Drag the arrowheads. Head-to-tail: slide v so its tail sits on u's head — the combined trip is u + v. Perpendicular vectors have dot product 0, no matter how long they are."
      onReset={() => { setU({ x: 4, y: 2 }); setV({ x: 1, y: 3 }); setK(1.5); setMode("add"); }}
    >
      <PlotFrame xMin={-7} xMax={7} yMin={-5} yMax={5} ariaLabel="Two draggable vectors on a grid">
        {(m) => (
          <>
            {/* grid-light parallelogram for addition */}
            {mode === "add" && (
              <polygon points={`${m.toX(0)},${m.toY(0)} ${m.toX(u.x)},${m.toY(u.y)} ${m.toX(sum.x)},${m.toY(sum.y)} ${m.toX(v.x)},${m.toY(v.y)}`}
                fill="rgba(5,150,105,0.10)" stroke="none" />
            )}
            {/* head-to-tail ghost of v translated to u's tip */}
            {mode !== "dot" && (
              <line x1={m.toX(u.x)} y1={m.toY(u.y)} x2={m.toX(u.x + v.x)} y2={m.toY(u.y + v.y)}
                stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" opacity={0.75} />
            )}
            {/* scaled u */}
            <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(u.x * k)} y2={m.toY(u.y * k)}
              stroke="#7c3aed" strokeWidth={1.6} strokeDasharray="3 4" opacity={0.6} />
            {/* result vector */}
            {mode !== "dot" && (
              <g>
                <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(third.x)} y2={m.toY(third.y)} stroke="#059669" strokeWidth={2.8} />
                <circle cx={m.toX(third.x)} cy={m.toY(third.y)} r={4.5} fill="#059669" />
                <text x={m.toX(third.x) + 8} y={m.toY(third.y) - 8} fontSize={12.5} fontWeight={700} fill="#059669">
                  {mode === "add" ? "u+v" : "u−v"} = ({cleanNumber(third.x)}, {cleanNumber(third.y)})
                </text>
              </g>
            )}
            {/* u */}
            <g onPointerDown={dragU.handleDown} onPointerMove={(e) => dragU.handleMove(e, m)} onPointerUp={dragU.handleUp}
              style={{ cursor: "grab" }}>
              <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(u.x)} y2={m.toY(u.y)} stroke="#7c3aed" strokeWidth={2.8} />
              <circle cx={m.toX(u.x)} cy={m.toY(u.y)} r={8} fill="#7c3aed" stroke="white" strokeWidth={2} />
              <text x={m.toX(u.x) + 8} y={m.toY(u.y) + 16} fontSize={12.5} fontWeight={700} fill="#7c3aed">u</text>
            </g>
            {/* v */}
            <g onPointerDown={dragV.handleDown} onPointerMove={(e) => dragV.handleMove(e, m)} onPointerUp={dragV.handleUp}
              style={{ cursor: "grab" }}>
              <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(v.x)} y2={m.toY(v.y)} stroke="#0ea5e9" strokeWidth={2.8} />
              <circle cx={m.toX(v.x)} cy={m.toY(v.y)} r={8} fill="#0ea5e9" stroke="white" strokeWidth={2} />
              <text x={m.toX(v.x) + 8} y={m.toY(v.y) + 16} fontSize={12.5} fontWeight={700} fill="#0ea5e9">v</text>
            </g>
          </>
        )}
      </PlotFrame>
      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {([["add", "u + v"], ["sub", "u − v"], ["dot", "dot product & angle"]] as const).map(([mk, lbl]) => (
            <button key={mk} type="button" onClick={() => setMode(mk)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (mode === mk ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>{lbl}</button>
          ))}
        </div>
        <LabSlider label="Scale u by k" min={-2} max={3} step={0.25} value={k} onChange={setK} format={(x) => `k·u = (${cleanNumber(u.x * x)}, ${cleanNumber(u.y * x)})`} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "u", value: `(${cleanNumber(u.x)}, ${cleanNumber(u.y)})`, tone: "good" },
          { label: "v", value: `(${cleanNumber(v.x)}, ${cleanNumber(v.y)})` },
          { label: "‖u‖ (length)", value: cleanNumber(nu) },
          { label: "‖v‖ (length)", value: cleanNumber(nv) },
          { label: "u · v", value: cleanNumber(d), tone: d === 0 ? "good" : "default" },
          { label: "Angle", value: `${cleanNumber(ang)}°${Math.abs(d) < 1e-9 ? " (perpendicular!)" : ""}` },
        ]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

type Mop = "none" | "transpose" | "det" | "inverse" | "mul" | "solve";

function MatrixInput({ m, name, onCell }: { m: number[][]; name: "A" | "B"; onCell: (i: number, j: number, v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold text-muted-foreground">Matrix {name}</div>
      <div
        className="inline-grid gap-1 rounded-lg border border-violet-300/60 bg-violet-50/40 p-1.5 dark:border-violet-800/60 dark:bg-violet-950/20"
        style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(44px, 1fr))` }}
      >
        {m.map((row, i) =>
          row.map((c, j) => (
            <input key={`${i}-${j}`} type="number" value={c} aria-label={`${name}[${i + 1}][${j + 1}]`}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) onCell(i, j, v);
              }}
              className="h-8 w-full rounded border border-border bg-background px-1 text-center font-mono text-sm text-foreground focus:border-violet-500 focus:outline-none" />
          ))
        )}
      </div>
    </div>
  );
}

export function MatrixLab() {
  const [A, setA] = useState<number[][]>([[4, 7], [2, 6]]);
  const [B, setB] = useState<number[][]>([[1, 0], [0, 1]]);
  const [op, setOp] = useState<Mop>("none");

  const { result, error } = useMemo<{ result: { text: string; note: string } | null; error: string | null }>(() => {
    try {
      switch (op) {
        case "transpose": return { result: { text: matToString(matTranspose(A)), note: "Aᵀ — rows and columns exchanged." }, error: null };
        case "det": return {
          result: { text: `det(A) = ${cleanNumber(det(A))}`, note: det(A) === 0 ? "Zero: the matrix flattens space — no inverse exists." : "Non-zero: space is preserved and A⁻¹ exists." },
          error: null,
        };
        case "inverse": return { result: { text: matToString(matInverse(A)), note: "A⁻¹ — the matrix that undoes A (A·A⁻¹ = I)." }, error: null };
        case "mul": return { result: { text: matToString(matMul(A, B)), note: "A·B — apply B first, then A (order matters!)." }, error: null };
        case "solve": {
          const { x, steps } = gaussSolve(A, B.map((col) => col[0]));
          return { result: { text: `x = ${x.map((v) => cleanNumber(v)).join(", ")}`, note: steps.join("  ") }, error: null };
        }
        default: return { result: null, error: null };
      }
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [A, B, op]);

  const setCell = (which: "A" | "B", i: number, j: number, value: string) => {
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    const setter = which === "A" ? setA : setB;
    setter((m) => m.map((row, ri) => row.map((c, ci) => (ri === i && ci === j ? v : c))));
  };

  return (
    <LabShell
      title="Matrix lab"
      hint="Type any 2×2 numbers, then press an operation. Determinant 0 means the matrix collapses the plane flat — that single number decides almost everything."
      onReset={() => { setA([[4, 7], [2, 6]]); setB([[1, 0], [0, 1]]); setOp("none"); }}
    >
      <div className="flex flex-wrap items-start gap-5">
        <MatrixInput m={A} name="A" onCell={(i, j, v) => setCell("A", i, j, String(v))} />
        <MatrixInput m={B} name="B" onCell={(i, j, v) => setCell("B", i, j, String(v))} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {([
          ["transpose", "Aᵀ"], ["det", "det(A)"], ["inverse", "A⁻¹"], ["mul", "A·B"], ["solve", "solve Ax=b"],
        ] as const).map(([o, lbl]) => (
          <button key={o} type="button" onClick={() => setOp(o)}
            className={
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
              (op === o ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
            }>{lbl}</button>
        ))}
      </div>
      {result && (
        <div className="mt-4 rounded-lg border border-success-border/70 bg-success-bg/50 p-3">
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm text-foreground">{result.text}</pre>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.note}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-warning-text/70 bg-warning-bg/60 p-3 text-sm text-warning-text">
          {error}
        </div>
      )}
      <div className="mt-4">
        <Readout items={[
          { label: "det(A)", value: cleanNumber(det(A)), tone: det(A) === 0 ? "warn" : "good" },
          { label: "A·A⁻¹", value: (() => { try { const p = matMul(A, matInverse(A)); return p.every((r, i) => r.every((c, j) => Math.abs(c - (i === j ? 1 : 0)) < 1e-9)) ? "identity ✓" : "not identity"; } catch { return "no inverse"; } })() },
          { label: "A·B det", value: cleanNumber(det(matMul(A, B))) },
        ]} />
      </div>
    </LabShell>
  );
}

function matToString(m: number[][]): string {
  return m.map((row) => `[ ${row.map((v) => cleanNumber(v, 6)).join("   ")} ]`).join("\n");
}

// ---------------------------------------------------------------------------

export function LinearSystemLab() {
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(-1);
  const [c1v, setC1] = useState(1);
  const [a2, setA2] = useState(2);
  const [b2, setB2] = useState(1);
  const [c2v, setC2] = useState(5);

  // Lines: a1 x + b1 y = c1  ->  y = (c1 - a1 x) / b1
  const f1 = (x: number) => (c1v - a1 * x) / b1;
  const f2 = (x: number) => (c2v - a2 * x) / b2;

  const status = useMemo(() => {
    const D = a1 * b2 - a2 * b1;
    if (Math.abs(D) < 1e-12) {
      // parallel or identical
      const same = Math.abs(a1 * c2v - a2 * c1v) < 1e-9 && Math.abs(b1 * c2v - b2 * c1v) < 1e-9;
      return { kind: same ? "infinite" : "none", x: NaN, y: NaN };
    }
    const x = (c1v * b2 - c2v * b1) / D;
    const y = (a1 * c2v - a2 * c1v) / D;
    return { kind: "unique", x, y };
  }, [a1, b1, c1v, a2, b2, c2v]);

  const dom = 8;

  return (
    <LabShell
      title="Two lines, one meeting point"
      hint="Each equation is a line of (x, y) pairs that balance it. The solution is where both balances hold at once. Make the slopes equal and watch the meeting point run away."
      onReset={() => { setA1(1); setB1(-1); setC1(1); setA2(2); setB2(1); setC2(5); }}
    >
      <PlotFrame xMin={-dom} xMax={dom} yMin={-dom} yMax={dom} ariaLabel="Two lines and their intersection">
        {(m) => {
          const seg = (f: (x: number) => number, color: string, w = 2.6) => {
            const xs = [m.xMin, m.xMax];
            const pts = xs.map((x) => ({ x, y: f(x) })).filter((p) => Number.isFinite(p.y));
            if (pts.length < 2) return null;
            return <line x1={m.toX(pts[0].x)} y1={m.toY(pts[0].y)} x2={m.toX(pts[1].x)} y2={m.toY(pts[1].y)} stroke={color} strokeWidth={w} />;
          };
          return (
            <>
              {seg(f1, "#7c3aed")}
              {seg(f2, "#0ea5e9")}
              {status.kind === "unique" && (
                <g>
                  <circle cx={m.toX(status.x)} cy={m.toY(status.y)} r={6.5} fill="#dc2626" stroke="white" strokeWidth={2} />
                  <text x={m.toX(status.x) + 10} y={m.toY(status.y) - 10} fontSize={13} fontWeight={700} fill="#dc2626">
                    ({cleanNumber(status.x, 3)}, {cleanNumber(status.y, 3)})
                  </text>
                  <line x1={m.toX(status.x)} y1={m.toY(status.y)} x2={m.toX(status.x)} y2={m.toY(0)} stroke="#dc2626" strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
                  <line x1={m.toX(status.x)} y1={m.toY(status.y)} x2={m.toX(0)} y2={m.toY(status.y)} stroke="#dc2626" strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
                </g>
              )}
            </>
          );
        }}
      </PlotFrame>
      <div className="mt-4 space-y-2.5">
        <LabSlider label="a₁" min={-4} max={4} step={0.5} value={a1} onChange={setA1} />
        <LabSlider label="b₁" min={-4} max={4} step={0.5} value={b1} onChange={setB1} />
        <LabSlider label="c₁" min={-8} max={8} step={0.5} value={c1v} onChange={setC1} />
        <div className="h-2" />
        <LabSlider label="a₂" min={-4} max={4} step={0.5} value={a2} onChange={setA2} />
        <LabSlider label="b₂" min={-4} max={4} step={0.5} value={b2} onChange={setB2} />
        <LabSlider label="c₂" min={-8} max={8} step={0.5} value={c2v} onChange={setC2} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Line 1", value: `${a1}x + ${b1}y = ${c1v}`, tone: "good" },
          { label: "Line 2", value: `${a2}x + ${b2}y = ${c2v}` },
          {
            label: "System",
            value: status.kind === "unique" ? "one solution" : status.kind === "none" ? "no solution (parallel)" : "infinitely many (same line)",
            tone: status.kind === "unique" ? "good" : "warn",
          },
          { label: "x", value: status.kind === "unique" ? cleanNumber(status.x, 3) : "—" },
          { label: "y", value: status.kind === "unique" ? cleanNumber(status.y, 3) : "—" },
          { label: "a₁b₂ − a₂b₁", value: cleanNumber(a1 * b2 - a2 * b1, 3) },
        ]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

export function EigenExplorer() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);
  const [d, setD] = useState(3);

  const M = [[a, b], [c, d]];
  const eig = useMemo(() => {
    try { return eigen2(M); } catch { return { real: false, values: null }; }
  }, [a, b, c, d]);

  const vecs = useMemo(() => {
    if (!eig.real || !eig.values) return [];
    return eig.values.map((lam) => ({ lam, v: eigenVec2(M, lam) }));
  }, [eig, M]);

  return (
    <LabShell
      title="Eigenvector explorer"
      hint="The violet circle is every direction leaving the origin. The matrix stretches the plane into the dashed ellipse. Most arrows get rotated — but eigen-directions keep pointing exactly where they pointed (only stretched)."
      onReset={() => { setA(2); setB(1); setC(0); setD(3); }}
    >
      <PlotFrame xMin={-5.5} xMax={5.5} yMin={-5} yMax={5} ariaLabel="Unit circle transformed by a matrix, eigenvectors highlighted">
        {(m) => {
          const circlePts: string[] = [];
          const ellipsePts: string[] = [];
          for (let i = 0; i <= 72; i++) {
            const t = (i / 72) * Math.PI * 2;
            const x = Math.cos(t), y = Math.sin(t);
            circlePts.push(`${i === 0 ? "M" : "L"} ${m.toX(x * 2.2).toFixed(1)} ${m.toY(y * 2.2).toFixed(1)}`);
            const tx = a * x * 2.2 + b * y * 2.2;
            const ty = c * x * 2.2 + d * y * 2.2;
            ellipsePts.push(`${i === 0 ? "M" : "L"} ${m.toX(tx).toFixed(1)} ${m.toY(ty).toFixed(1)}`);
          }
          return (
            <>
              <path d={circlePts.join(" ")} fill="rgba(124,58,237,0.10)" stroke="#7c3aed" strokeWidth={2} />
              <path d={ellipsePts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth={2} strokeDasharray="6 5" opacity={0.85} />
              {vecs.map(({ lam, v }, i) => {
                const L = 4.4;
                const color = i === 0 ? "#059669" : "#d97706";
                return (
                  <g key={lam}>
                    <line x1={m.toX(-v.x * L)} y1={m.toY(-v.y * L)} x2={m.toX(v.x * L)} y2={m.toY(v.y * L)} stroke={color} strokeWidth={2.4} />
                    <circle cx={m.toX(v.x * L)} cy={m.toY(v.y * L)} r={5} fill={color} />
                    <text x={m.toX(v.x * L) + 6} y={m.toY(v.y * L) - 6} fontSize={12} fontWeight={700} fill={color}>
                      v{i + 1}, λ = {cleanNumber(lam, 4)}
                    </text>
                  </g>
                );
              })}
            </>
          );
        }}
      </PlotFrame>
      <div className="mt-4 space-y-2.5">
        <LabSlider label="a" min={-4} max={4} step={0.25} value={a} onChange={setA} />
        <LabSlider label="b" min={-4} max={4} step={0.25} value={b} onChange={setB} />
        <LabSlider label="c" min={-4} max={4} step={0.25} value={c} onChange={setC} />
        <LabSlider label="d" min={-4} max={4} step={0.25} value={d} onChange={setD} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Matrix", value: `[[${a}, ${b}], [${c}, ${d}]]` },
          { label: "trace", value: cleanNumber(a + d) },
          { label: "det", value: cleanNumber(det(M)) },
          eig.real && eig.values
            ? { label: "Eigenvalues", value: eig.values.map((v) => cleanNumber(v, 4)).join(" , "), tone: "good" }
            : { label: "Eigenvalues", value: "complex (rotation dominates)", tone: "warn" },
        ]} />
      </div>
    </LabShell>
  );
}
