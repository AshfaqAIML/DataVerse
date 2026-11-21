"use client";

/**
 * math-viz.tsx — the Mathematics collection, part 1 (algebra & geometry):
 *
 *   CoordinatePlaneViz   drag a point; quadrants, projections, distance
 *   FunctionGrapherViz   expression + parameter sliders + hover trace
 *   LineViz              y = mx + b: slope triangle, intercepts, angle
 *   ParabolaViz          y = ax²+bx+c: vertex, roots, focus & directrix
 *   VectorViz            two draggable vectors: sum, difference, dot, angle
 *   MatrixViz            editable 2×2: det, inverse, transformed grid
 *   MatrixMultiplyViz    A×B with the dot-product anatomy per cell
 *   TransformationViz    rotation/scale/shear/translate composite matrix
 *
 * All values are computed live — nothing here is a static picture.
 */
import { useMemo, useState } from "react";
import {
  C,
  Legend,
  Plane,
  PlaneBox,
  Readouts,
  Seg,
  Tip,
  ToggleChip,
  VizButton,
  VizCard,
  VizSlider,
  fmtNum,
  fmtSigned,
  pathOf,
  sampleCurve,
  usePlaneDrag,
  usePlaneHover,
} from "./core";
import { evalExpr, sampleFunction } from "@/lib/mathcourse/expr";
import { det, matInverse, matMul, matTranspose } from "@/lib/mathcourse/linalg";
import { cn } from "@/lib/utils";

// ===========================================================================
// 1. Coordinate plane
// ===========================================================================

export function CoordinatePlaneViz() {
  const [p, setP] = useState({ x: 3, y: 2 });
  const [showProj, setShowProj] = useState(true);
  const drag = usePlaneDrag((x, y) => setP({ x: snap(x, 0.5), y: snap(y, 0.5) }));
  const { hover, onPointer } = usePlaneHover();
  const r = Math.hypot(p.x, p.y);
  const quadrant =
    p.x === 0 || p.y === 0 ? "on an axis" : p.x > 0 ? (p.y > 0 ? "I" : "IV") : p.y > 0 ? "II" : "III";

  return (
    <VizCard
      title="The coordinate plane"
      subtitle="Every point is an address: (x, y). Drag the point and watch its coordinates, quadrant and distance from the origin respond."
      domain="math"
      explanation={
        <>
          The <strong>distance to the origin</strong> is Pythagoras in disguise: r = √(x² + y²) — the hypotenuse of
          the right triangle the dashed projections draw. The x-coordinate says how far <em>right</em> (negative =
          left); the y-coordinate how far <em>up</em> (negative = down).
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showProj} onClick={() => setShowProj((v) => !v)}>
              Projections
            </ToggleChip>
            <VizButton onClick={() => setP({ x: 3, y: 2 })}>Reset point</VizButton>
          </div>
          <VizSlider label="x (rightward)" symbol="x" value={p.x} min={-6} max={6} step={0.5} onChange={(x) => setP((q) => ({ ...q, x }))} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="y (upward)" symbol="y" value={p.y} min={-5} max={5} step={0.5} onChange={(y) => setP((q) => ({ ...q, y }))} format={(v) => fmtSigned(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Point (x, y)", value: `(${fmtNum(p.x, 1)}, ${fmtNum(p.y, 1)})`, tone: "accent" },
            { label: "Quadrant", value: quadrant },
            { label: "Distance r = √(x²+y²)", value: fmtNum(r, 3) },
            { label: "Distance to x-axis", value: fmtNum(Math.abs(p.y), 1) },
          ]}
        />
      }
    >
      <PlaneBox>
        <Plane
          xMin={-6}
          xMax={6}
          yMin={-5}
          yMax={5}
          xLabel="x →"
          yLabel="y ↑"
          ariaLabel="Coordinate plane with a draggable point"
          onPointer={onPointer}
        >
          {(m) => (
            <>
              {/* quadrant numerals */}
              <text x={m.toX(4.6)} y={m.toY(3.6)} textAnchor="middle" className="fill-current text-[13px] font-bold opacity-20">I</text>
              <text x={m.toX(-4.6)} y={m.toY(3.6)} textAnchor="middle" className="fill-current text-[13px] font-bold opacity-20">II</text>
              <text x={m.toX(-4.6)} y={m.toY(-3.7)} textAnchor="middle" className="fill-current text-[13px] font-bold opacity-20">III</text>
              <text x={m.toX(4.6)} y={m.toY(-3.7)} textAnchor="middle" className="fill-current text-[13px] font-bold opacity-20">IV</text>

              {showProj && (
                <>
                  <path d={`M ${m.toX(p.x)} ${m.toY(p.y)} L ${m.toX(p.x)} ${m.toY(0)} L ${m.toX(0)} ${m.toY(0)}`} fill="none" stroke={C.slate} strokeWidth={1.6} strokeDasharray="5 4" />
                  <path d={`M ${m.toX(p.x)} ${m.toY(p.y)} L ${m.toX(0)} ${m.toY(p.y)} L ${m.toX(0)} ${m.toY(0)}`} fill="none" stroke={C.slate} strokeWidth={1.6} strokeDasharray="5 4" />
                  <text x={m.toX(p.x / 2)} y={m.toY(p.y) - 7} textAnchor="middle" className="fill-current text-[11px] font-medium opacity-60">x = {fmtNum(p.x, 1)}</text>
                  <text x={m.toX(p.x) + 8} y={m.toY(p.y / 2) + 4} className="fill-current text-[11px] font-medium opacity-60">y = {fmtNum(p.y, 1)}</text>
                </>
              )}

              {/* radius vector */}
              <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(p.x)} y2={m.toY(p.y)} stroke={C.cyan} strokeWidth={2.4} />
              <text
                x={m.toX(p.x / 2) + (p.x >= 0 ? 10 : -10)}
                y={m.toY(p.y / 2) - 8}
                textAnchor={p.x >= 0 ? "start" : "end"}
                className="fill-current text-[11px] font-semibold"
                fill={C.cyan}
              >
                r = {fmtNum(r, 2)}
              </text>

              {/* the point */}
              <g
                className="dv-handle"
                onPointerDown={drag.handleDown}
                onPointerMove={(e) => drag.handleMove(e, m)}
                onPointerUp={drag.handleUp}
                onKeyDown={(e) => drag.handleKeys(e, m, () => p)}
                tabIndex={0}
                role="button"
                aria-label={`Point p at (${fmtNum(p.x, 1)}, ${fmtNum(p.y, 1)}) — drag, or use the arrow keys to move`}
                style={{ cursor: drag.dragging ? "grabbing" : "grab" }}
              >
                <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={22} fill="transparent" />
                <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={7} fill={C.indigo} stroke="var(--color-canvas, #fff)" strokeWidth={2.5} />
                <text x={m.toX(p.x) + 11} y={m.toY(p.y) - 11} className="fill-current text-[12px] font-bold" fill={C.indigo}>
                  ({fmtNum(p.x, 1)}, {fmtNum(p.y, 1)})
                </text>
              </g>
            </>
          )}
        </Plane>
        {hover.inside && (
          <Tip px={hover.px} py={hover.py} W={640} H={480}>
            ({fmtNum(hover.x, 1)}, {fmtNum(hover.y, 1)})
          </Tip>
        )}
      </PlaneBox>
    </VizCard>
  );
}

function snap(v: number, step: number): number {
  return Math.round(v / step) * step;
}

// ===========================================================================
// 2. Function grapher
// ===========================================================================

const FN_PRESETS: Array<{ expr: string; label: string }> = [
  { expr: "a * x**2 + b * x + c", label: "a·x² + b·x + c" },
  { expr: "a * sin(b * x) + c", label: "a·sin(bx) + c" },
  { expr: "a * exp(-((x - b)**2) / 4)", label: "Gaussian bell" },
  { expr: "a * x**3 + b * x", label: "a·x³ + b·x" },
  { expr: "a * ln(abs(x - b)) + c", label: "a·ln|x−b| + c" },
  { expr: "a / x + b", label: "a/x + b" },
];

export function FunctionGrapherViz() {
  const [expr, setExpr] = useState(FN_PRESETS[0].expr);
  const [params, setParams] = useState({ a: 1, b: 0, c: 0 });
  const { hover, onPointer } = usePlaneHover();
  const { a: pa, b: pb, c: pc } = params;
  const f = (x: number) => evalExpr(expr, { a: pa, b: pb, c: pc, x });

  const xMin = -6;
  const xMax = 6;
  // auto-fit y range with headroom (robust against blow-ups)
  const yRange = useMemo(() => {
    const env = { a: pa, b: pb, c: pc };
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 400; i++) {
      const x = xMin + ((xMax - xMin) * i) / 400;
      let y: number;
      try {
        y = evalExpr(expr, { ...env, x });
      } catch {
        continue;
      }
      if (Number.isFinite(y)) {
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { yMin: -5, yMax: 5 };
    const pad = Math.max(1, (hi - lo) * 0.12);
    lo = Math.max(-50, lo - pad);
    hi = Math.min(50, hi + pad);
    if (hi - lo < 1e-6) return { yMin: lo - 2, yMax: hi + 2 };
    return { yMin: lo, yMax: hi };
  }, [expr, pa, pb, pc]);

  const segments = useMemo(
    () => sampleFunction(expr, xMin, xMax, { a: pa, b: pb, c: pc }, 420).filter((s) => s.length > 1),
    [expr, pa, pb, pc],
  );

  const hoverY = hover.inside ? safeEval(f, hover.x) : NaN;

  return (
    <VizCard
      title="Function grapher"
      subtitle="Type any expression in x (with parameters a, b, c) — the curve, its values and the trace respond instantly."
      domain="math"
      explanation={
        <>
          Hover the plane to trace the curve: the crosshair reads <strong>x</strong> and the machine-evaluated{" "}
          <strong>f(x)</strong> at that exact position. The parser understands + − × ÷ ^ (as <code>*</code>,{" "}
          <code>**</code>), parentheses, and the usual functions: <code>sin cos tan exp ln log2 sqrt abs</code>.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {FN_PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setExpr(p.expr)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  expr === p.expr ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            className="w-full rounded-lg border border-border-subtle bg-surface-inset px-3 py-2 font-mono text-[13px] text-ink focus:border-viz-2/60 focus:outline-none"
            aria-label="Function expression in x"
          />
          <VizSlider label="parameter a" symbol="a" value={params.a} min={-3} max={3} step={0.1} onChange={(a) => setParams((q) => ({ ...q, a }))} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="parameter b" symbol="b" value={params.b} min={-4} max={4} step={0.1} onChange={(b) => setParams((q) => ({ ...q, b }))} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="parameter c" symbol="c" value={params.c} min={-5} max={5} step={0.1} onChange={(c) => setParams((q) => ({ ...q, c }))} format={(v) => fmtSigned(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "f(0)", value: fmtNum(safeEval(f, 0), 3) },
            { label: "f(1)", value: fmtNum(safeEval(f, 1), 3) },
            { label: "f(−1)", value: fmtNum(safeEval(f, -1), 3) },
            { label: "f(2)", value: fmtNum(safeEval(f, 2), 3) },
          ]}
        />
      }
    >
      <PlaneBox>
        <Plane xMin={xMin} xMax={xMax} yMin={yRange.yMin} yMax={yRange.yMax} xLabel="x" yLabel="f(x)" ariaLabel="Graph of the function" onPointer={onPointer}>
          {(m) => (
            <>
              {segments.map((seg, i) => (
                <path key={i} d={pathOf(m, seg)} fill="none" stroke={C.indigo} strokeWidth={2.6} strokeLinecap="round" />
              ))}
              {hover.inside && Number.isFinite(hoverY) && (
                <>
                  <line x1={m.toX(hover.x)} y1={m.toY(yRange.yMin)} x2={m.toX(hover.x)} y2={m.toY(yRange.yMax)} stroke={C.slate} strokeWidth={0.8} strokeDasharray="4 4" />
                  <circle cx={m.toX(hover.x)} cy={m.toY(hoverY)} r={4.5} fill={C.rose} stroke="var(--color-canvas, #fff)" strokeWidth={1.5} />
                </>
              )}
            </>
          )}
        </Plane>
        {hover.inside && (
          <Tip px={hover.px} py={hover.py} W={640} H={480}>
            x = {fmtNum(hover.x, 2)}
            <br />
            f(x) = {fmtNum(hoverY, 3)}
          </Tip>
        )}
      </PlaneBox>
    </VizCard>
  );
}

function safeEval(f: (x: number) => number, x: number): number {
  try {
    const v = f(x);
    return Number.isFinite(v) ? v : NaN;
  } catch {
    return NaN;
  }
}

// ===========================================================================
// 3. Straight lines
// ===========================================================================

export function LineViz() {
  const [mSlope, setM] = useState(1.5);
  const [b, setB] = useState(-2);
  const f = (x: number) => mSlope * x + b;
  const xIntercept = mSlope !== 0 ? -b / mSlope : NaN;
  const angle = (Math.atan(mSlope) * 180) / Math.PI;

  // slope triangle on x ∈ [1, 2]
  const x1 = 1;
  const x2 = 2;
  const y1 = f(x1);
  const y2 = f(x2);

  return (
    <VizCard
      title="Straight lines: y = mx + b"
      subtitle="Two numbers place every line: the slope m (steepness) and the intercept b (where it crosses the y-axis)."
      domain="math"
      explanation={
        <>
          The <strong>slope triangle</strong> makes m concrete: over a run of exactly 1, the line rises by m. Positive
          m climbs to the right, negative m falls. The line crosses the x-axis where y = 0, at x = −b/m (when m ≠ 0).
          The inclination angle is arctan(m).
        </>
      }
      controls={
        <>
          <VizSlider label="slope (rise per 1 run)" symbol="m" value={mSlope} min={-4} max={4} step={0.1} onChange={setM} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="y-intercept" symbol="b" value={b} min={-5} max={5} step={0.5} onChange={setB} format={(v) => fmtSigned(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Equation", value: `y = ${fmtNum(mSlope, 1)}x ${b >= 0 ? "+" : "−"} ${fmtNum(Math.abs(b), 1)}`, tone: "accent", mono: false },
            { label: "y-intercept (0, b)", value: `(0, ${fmtNum(b, 1)})` },
            { label: "x-intercept (−b/m)", value: mSlope === 0 ? (b === 0 ? "every x (y≡0)" : "none") : `(${fmtNum(xIntercept, 2)}, 0)` },
            { label: "Inclination arctan(m)", value: `${fmtNum(angle, 1)}°` },
          ]}
        />
      }
    >
      <Plane xMin={-6} xMax={6} yMin={-6} yMax={6} xLabel="x" yLabel="y" ariaLabel="Line with slope triangle">
        {(mm) => (
          <>
            {/* slope triangle */}
            <path
              d={`M ${mm.toX(x1)} ${mm.toY(y1)} L ${mm.toX(x2)} ${mm.toY(y1)} L ${mm.toX(x2)} ${mm.toY(y2)}`}
              fill="none"
              stroke={C.amber}
              strokeWidth={2}
              strokeDasharray="none"
            />
            <text x={mm.toX((x1 + x2) / 2)} y={mm.toY(y1) + (mSlope >= 0 ? 15 : -8)} textAnchor="middle" className="text-[11px] font-bold" fill={C.amber}>
              run = 1
            </text>
            <text x={mm.toX(x2) + 7} y={mm.toY((y1 + y2) / 2) + 4} className="text-[11px] font-bold" fill={C.amber}>
              rise = {fmtSigned(mSlope, 1)}
            </text>

            <line x1={mm.toX(-6)} y1={mm.toY(f(-6))} x2={mm.toX(6)} y2={mm.toY(f(6))} stroke={C.indigo} strokeWidth={2.8} />
            <circle cx={mm.toX(0)} cy={mm.toY(b)} r={5} fill={C.rose} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
            {Number.isFinite(xIntercept) && xIntercept > -6 && xIntercept < 6 && (
              <circle cx={mm.toX(xIntercept)} cy={mm.toY(0)} r={5} fill={C.green} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
            )}
            <text x={mm.toX(0) + 10} y={mm.toY(b) + (b > 5.4 ? 14 : -10)} className="text-[11.5px] font-bold" fill={C.rose}>
              b = {fmtNum(b, 1)}
            </text>
            {Number.isFinite(xIntercept) && xIntercept > -6 && xIntercept < 6 && (
              <text x={mm.toX(xIntercept)} y={mm.toY(0) - 10} textAnchor="middle" className="text-[11.5px] font-bold" fill={C.green}>
                x₀ = {fmtNum(xIntercept, 2)}
              </text>
            )}
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "the line y = mx + b" },
          { color: C.rose, label: "y-intercept" },
          { color: C.green, label: "x-intercept" },
          { color: C.amber, label: "slope triangle" },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 4. Parabolas
// ===========================================================================

export function ParabolaViz() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-2);
  const [showFocus, setShowFocus] = useState(false);
  const f = (x: number) => a * x * x + b * x + c;
  const h = a !== 0 ? -b / (2 * a) : NaN;
  const k = a !== 0 ? f(h) : NaN;
  const disc = b * b - 4 * a * c;
  const roots =
    a === 0
      ? []
      : disc > 0
        ? [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)].sort((u, v) => u - v)
        : disc === 0
          ? [-b / (2 * a)]
          : [];
  const focusY = k + 1 / (4 * a);
  const directrixY = k - 1 / (4 * a);

  return (
    <VizCard
      title="Parabolas: y = ax² + bx + c"
      subtitle="One coefficient (a) sets the opening, the vertex formula locates the turning point, the discriminant decides the roots."
      domain="math"
      explanation={
        <>
          The <strong>vertex</strong> sits at x = −b/2a, y = f(−b/2a). The <strong>discriminant</strong> Δ = b² − 4ac
          counts the x-axis crossings: Δ &gt; 0 two roots, Δ = 0 one (the vertex touches), Δ &lt; 0 none — the parabola
          floats clear. Every non-degenerate parabola is also the set of points equidistant from its{" "}
          <strong>focus</strong> and <strong>directrix</strong> (toggle them on).
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showFocus} onClick={() => setShowFocus((v) => !v)}>Focus &amp; directrix</ToggleChip>
            <span className="text-[11px] text-ink-3">a = 0 flattens the parabola into a line.</span>
          </div>
          <VizSlider label="curvature (opens up if > 0)" symbol="a" value={a} min={-2} max={2} step={0.1} onChange={setA} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="linear coefficient" symbol="b" value={b} min={-5} max={5} step={0.1} onChange={setB} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="constant (y-intercept)" symbol="c" value={c} min={-6} max={6} step={0.5} onChange={setC} format={(v) => fmtSigned(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Vertex (−b/2a, f(h))", value: a === 0 ? "— (a = 0)" : `(${fmtNum(h, 2)}, ${fmtNum(k, 2)})`, tone: "accent" },
            { label: "Discriminant b²−4ac", value: fmtNum(disc, 2), tone: disc < 0 ? "warn" : "default" },
            { label: "Real roots", value: roots.length === 0 ? "none" : roots.map((r) => fmtNum(r, 2)).join(" , ") },
            { label: "Opens", value: a === 0 ? "— (linear)" : a > 0 ? "upward (min)" : "downward (max)" },
          ]}
        />
      }
    >
      <Plane xMin={-6} xMax={6} yMin={-8} yMax={10} xLabel="x" yLabel="y" ariaLabel="Parabola with vertex and roots">
        {(m) => {
          const segs = sampleCurve(f, -6, 6, -8, 10, 420);
          return (
            <>
              {segs.map((s, i) => (
                <path key={i} d={pathOf(m, s)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
              ))}
              {/* axis of symmetry */}
              {a !== 0 && <line x1={m.toX(h)} y1={m.toY(-8)} x2={m.toX(h)} y2={m.toY(10)} stroke={C.slate} strokeWidth={1} strokeDasharray="6 5" />}
              {/* vertex */}
              {a !== 0 && (
                <>
                  <circle cx={m.toX(h)} cy={m.toY(k)} r={5.5} fill={C.violet} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
                  <text x={m.toX(h) + 9} y={m.toY(k) + (a > 0 ? 16 : -10)} className="text-[11.5px] font-bold" fill={C.violet}>
                    vertex ({fmtNum(h, 2)}, {fmtNum(k, 2)})
                  </text>
                </>
              )}
              {/* roots */}
              {roots.map((r, i) => (
                <circle key={i} cx={m.toX(r)} cy={m.toY(0)} r={5} fill={C.green} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
              ))}
              {/* y-intercept */}
              <circle cx={m.toX(0)} cy={m.toY(c)} r={4.5} fill={C.rose} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
              {showFocus && a !== 0 && (
                <>
                  <line x1={m.toX(-6)} y1={m.toY(directrixY)} x2={m.toX(6)} y2={m.toY(directrixY)} stroke={C.gold} strokeWidth={1.4} strokeDasharray="7 5" />
                  <circle cx={m.toX(h)} cy={m.toY(focusY)} r={4} fill={C.gold} />
                  <text x={m.toX(h) + 8} y={m.toY(focusY) - 7} className="text-[11px] font-bold" fill={C.gold}>focus</text>
                  <text x={m.toX(5.7)} y={m.toY(directrixY) - 7} textAnchor="end" className="text-[11px] font-bold" fill={C.gold}>directrix</text>
                </>
              )}
            </>
          );
        }}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "y = ax² + bx + c" },
          { color: C.violet, label: "vertex" },
          { color: C.green, label: "roots" },
          { color: C.rose, label: "y-intercept" },
          ...(showFocus && a !== 0 ? [{ color: C.gold, label: "focus & directrix", dashed: true } as const] : []),
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 5. Vectors
// ===========================================================================

interface Vec {
  x: number;
  y: number;
}

export function VectorViz() {
  const [u, setU] = useState<Vec>({ x: 4, y: 1 });
  const [v, setV] = useState<Vec>({ x: 1, y: 3 });
  const [show, setShow] = useState({ sum: true, diff: false, angle: true });

  const dragU = usePlaneDrag((x, y) => setU({ x: snap(x, 0.5), y: snap(y, 0.5) }));
  const dragV = usePlaneDrag((x, y) => setV({ x: snap(x, 0.5), y: snap(y, 0.5) }));

  const magU = Math.hypot(u.x, u.y);
  const magV = Math.hypot(v.x, v.y);
  const dot = u.x * v.x + u.y * v.y;
  const cosTheta = magU && magV ? Math.max(-1, Math.min(1, dot / (magU * magV))) : NaN;
  const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;
  const sum: Vec = { x: u.x + v.x, y: u.y + v.y };
  const diff: Vec = { x: u.x - v.x, y: u.y - v.y };

  const arrow = (m: { toX: (x: number) => number; toY: (y: number) => number }, vec: Vec, color: string, label: string, width = 2.6) => {
    const x2 = m.toX(vec.x);
    const y2 = m.toY(vec.y);
    const x1 = m.toX(0);
    const y1 = m.toY(0);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = 10;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
        <path
          d={`M ${x2} ${y2} L ${x2 - head * Math.cos(ang - 0.42)} ${y2 - head * Math.sin(ang - 0.42)} L ${x2 - head * Math.cos(ang + 0.42)} ${y2 - head * Math.sin(ang + 0.42)} Z`}
          fill={color}
        />
        <text x={x2 + Math.cos(ang) * 13} y={y2 + Math.sin(ang) * 13 + 4} textAnchor="middle" className="text-[11.5px] font-bold" fill={color}>
          {label}
        </text>
      </g>
    );
  };

  return (
    <VizCard
      title="Vectors: magnitude, direction, dot product"
      subtitle="Drag either arrowhead. Head-to-tail addition builds u + v; the dot product measures agreement."
      domain="math"
      explanation={
        <>
          <strong>u + v</strong> walks u then v (the dashed parallelogram completes the picture).{" "}
          <strong>u · v = |u||v| cos θ</strong> — positive when the vectors point roughly the same way, zero at
          right angles, negative when opposed. |u| is the vector&rsquo;s length by Pythagoras.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <ToggleChip active={show.sum} onClick={() => setShow((s) => ({ ...s, sum: !s.sum }))}>u + v</ToggleChip>
          <ToggleChip active={show.diff} onClick={() => setShow((s) => ({ ...s, diff: !s.diff }))}>u − v</ToggleChip>
          <ToggleChip active={show.angle} onClick={() => setShow((s) => ({ ...s, angle: !s.angle }))}>Angle arc</ToggleChip>
          <VizButton onClick={() => { setU({ x: 4, y: 1 }); setV({ x: 1, y: 3 }); }}>Reset</VizButton>
        </div>
      }
      readouts={
        <Readouts
          cols={5}
          items={[
            { label: "u", value: `(${fmtNum(u.x, 1)}, ${fmtNum(u.y, 1)})` },
            { label: "v", value: `(${fmtNum(v.x, 1)}, ${fmtNum(v.y, 1)})` },
            { label: "|u| , |v|", value: `${fmtNum(magU, 2)} , ${fmtNum(magV, 2)}` },
            { label: "u · v", value: fmtNum(dot, 2), tone: "accent" },
            { label: "Angle θ", value: Number.isFinite(thetaDeg) ? `${fmtNum(thetaDeg, 1)}°` : "—" },
          ]}
        />
      }
    >
      <Plane xMin={-6} xMax={7} yMin={-5} yMax={6} xLabel="x" yLabel="y" ariaLabel="Two draggable vectors, their sum, difference and angle">
        {(m) => (
          <>
            {/* parallelogram construction */}
            {show.sum && (
              <>
                <line x1={m.toX(u.x)} y1={m.toY(u.y)} x2={m.toX(sum.x)} y2={m.toY(sum.y)} stroke={C.slate} strokeWidth={1.4} strokeDasharray="5 4" />
                <line x1={m.toX(v.x)} y1={m.toY(v.y)} x2={m.toX(sum.x)} y2={m.toY(sum.y)} stroke={C.slate} strokeWidth={1.4} strokeDasharray="5 4" />
              </>
            )}
            {arrow(m, u, C.indigo, "u")}
            {arrow(m, v, C.cyan, "v")}
            {show.sum && arrow(m, sum, C.green, "u+v")}
            {show.diff && arrow(m, diff, C.rose, "u−v")}

            {/* angle arc */}
            {show.angle && Number.isFinite(thetaDeg) && magU > 0.4 && magV > 0.4 && (
              <path
                d={describeArc(m, Math.atan2(u.y, u.x), Math.atan2(v.y, v.x), 1.6)}
                fill="none"
                stroke={C.amber}
                strokeWidth={1.8}
              />
            )}
            {show.angle && Number.isFinite(thetaDeg) && (
              <text
                x={m.toX(2.2 * Math.cos((Math.atan2(u.y, u.x) + Math.atan2(v.y, v.x)) / 2))}
                y={m.toY(2.2 * Math.sin((Math.atan2(u.y, u.x) + Math.atan2(v.y, v.x)) / 2)) + 4}
                textAnchor="middle"
                className="text-[11.5px] font-bold"
                fill={C.amber}
              >
                θ = {fmtNum(thetaDeg, 0)}°
              </text>
            )}

            {/* draggable heads */}
            <g
              className="dv-handle"
              onPointerDown={dragU.handleDown}
              onPointerMove={(e) => dragU.handleMove(e, m)}
              onPointerUp={dragU.handleUp}
              onKeyDown={(e) => dragU.handleKeys(e, m, () => u)}
              tabIndex={0}
              role="button"
              aria-label={`Head of vector u at (${fmtNum(u.x, 1)}, ${fmtNum(u.y, 1)}) — drag, or use the arrow keys to move`}
              style={{ cursor: dragU.dragging ? "grabbing" : "grab" }}
            >
              <circle cx={m.toX(u.x)} cy={m.toY(u.y)} r={18} fill="transparent" />
              <circle cx={m.toX(u.x)} cy={m.toY(u.y)} r={8} fill={C.indigo} stroke="var(--color-canvas, #fff)" strokeWidth={2.5} />
            </g>
            <g
              className="dv-handle"
              onPointerDown={dragV.handleDown}
              onPointerMove={(e) => dragV.handleMove(e, m)}
              onPointerUp={dragV.handleUp}
              onKeyDown={(e) => dragV.handleKeys(e, m, () => v)}
              tabIndex={0}
              role="button"
              aria-label={`Head of vector v at (${fmtNum(v.x, 1)}, ${fmtNum(v.y, 1)}) — drag, or use the arrow keys to move`}
              style={{ cursor: dragV.dragging ? "grabbing" : "grab" }}
            >
              <circle cx={m.toX(v.x)} cy={m.toY(v.y)} r={18} fill="transparent" />
              <circle cx={m.toX(v.x)} cy={m.toY(v.y)} r={8} fill={C.cyan} stroke="var(--color-canvas, #fff)" strokeWidth={2.5} />
            </g>
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "u (drag)" },
          { color: C.cyan, label: "v (drag)" },
          ...(show.sum ? [{ color: C.green, label: "u + v" }] : []),
          ...(show.diff ? [{ color: C.rose, label: "u − v" }] : []),
          ...(show.angle ? [{ color: C.amber, label: "angle θ" }] : []),
        ]}
      />
    </VizCard>
  );
}

function describeArc(
  m: { toX: (x: number) => number; toY: (y: number) => number },
  a1: number,
  a2: number,
  r: number,
): string {
  // arc from angle a1 to a2 (radians), radius r in data units
  let start = a1;
  let end = a2;
  let sweep = end - start;
  while (sweep <= -Math.PI) sweep += 2 * Math.PI;
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  const x1 = m.toX(r * Math.cos(start));
  const y1 = m.toY(r * Math.sin(start));
  const x2 = m.toX(r * Math.cos(start + sweep));
  const y2 = m.toY(r * Math.sin(start + sweep));
  return `M ${x1} ${y1} A ${Math.abs(m.toX(r) - m.toX(0))} ${Math.abs(m.toY(0) - m.toY(r))} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${sweep > 0 ? 1 : 0} ${x2} ${y2}`;
}

// ===========================================================================
// 6. Matrix playground (2×2 transform)
// ===========================================================================

const MATRIX_PRESETS: Array<{ label: string; m: number[][]; note: string }> = [
  { label: "Identity", m: [[1, 0], [0, 1]], note: "does nothing" },
  { label: "Rotate 45°", m: [[Math.SQRT1_2, -Math.SQRT1_2], [Math.SQRT1_2, Math.SQRT1_2]], note: "rotation by 45°" },
  { label: "Scale ×1.5, ×0.75", m: [[1.5, 0], [0, 0.75]], note: "anisotropic stretch" },
  { label: "Shear", m: [[1, 1], [0, 1]], note: "x-tilt shear" },
  { label: "Reflect in y-axis", m: [[-1, 0], [0, 1]], note: "mirror" },
  { label: "Project to x-axis", m: [[1, 0], [0, 0]], note: "squashes the plane flat" },
];

export function MatrixViz() {
  const [a, setA] = useState<number[][]>([[1.2, -0.6], [0.4, 1.1]]);
  const detA = det(a);
  const inv = Math.abs(detA) > 1e-9 ? matInverse(a) : null;
  const trans = matTranspose(a);
  const set = (i: number, j: number, value: number) =>
    setA((prev) => prev.map((row, ri) => row.map((v, ci) => (ri === i && ci === j ? value : v))));
  const apply = (x: number, y: number): Vec => ({ x: a[0][0] * x + a[0][1] * y, y: a[1][0] * x + a[1][1] * y });

  const unitSquare = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].map(([x, y]) => apply(x, y));
  const sq = (m: { toX: (x: number) => number; toY: (y: number) => number }) =>
    `${m.toX(unitSquare[0].x)},${m.toY(unitSquare[0].y)} ${m.toX(unitSquare[1].x)},${m.toY(unitSquare[1].y)} ${m.toX(unitSquare[2].x)},${m.toY(unitSquare[2].y)} ${m.toX(unitSquare[3].x)},${m.toY(unitSquare[3].y)}`;

  const ib = apply(1, 0);
  const jb = apply(0, 1);

  return (
    <VizCard
      title="Matrices as transformations"
      subtitle="Edit the 2×2 matrix and watch where it sends the unit square, the grid, and the basis vectors î and ĵ."
      domain="math"
      explanation={
        <>
          The <strong>determinant</strong> is the area scale factor: |det A| tells how the unit square&rsquo;s area
          grows or shrinks, and its <em>sign</em> says whether the plane flips orientation. det = 0 collapses
          everything onto a line — no inverse exists, and the readout shows it. Columns of A are the images of the
          basis vectors: the first column is where î lands, the second where ĵ lands.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">A =</span>
            {a.map((row, i) =>
              row.map((v, j) => (
                <input
                  key={`${i}${j}`}
                  type="number"
                  step={0.1}
                  value={v}
                  onChange={(e) => set(i, j, Number(e.target.value) || 0)}
                  className="w-16 rounded-md border border-border-subtle bg-surface-inset px-2 py-1 text-center font-mono text-xs tabular text-ink focus:border-viz-2/60 focus:outline-none"
                  aria-label={`matrix entry row ${i + 1} column ${j + 1}`}
                />
              )),
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MATRIX_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                title={p.note}
                onClick={() => setA(p.m.map((r) => [...r]))}
                className="rounded-md border border-border-subtle px-2.5 py-1 text-[11px] font-medium text-ink-3 transition-colors hover:border-border hover:text-ink"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "det A (area factor)", value: fmtNum(detA, 3), tone: Math.abs(detA) < 1e-9 ? "bad" : "accent" },
            { label: "î ↦ (first column)", value: `(${fmtNum(a[0][0], 2)}, ${fmtNum(a[1][0], 2)})` },
            { label: "ĵ ↦ (second column)", value: `(${fmtNum(a[0][1], 2)}, ${fmtNum(a[1][1], 2)})` },
            { label: "A⁻¹", value: inv ? `[[${inv.map((r) => r.map((v) => fmtNum(v, 2)).join(", ")).join("], [")}]]` : "singular — none", tone: inv ? "default" : "warn" },
          ]}
        />
      }
    >
      <Plane xMin={-4} xMax={4} yMin={-3} yMax={4} xLabel="x" yLabel="y" ariaLabel="Unit square and grid transformed by the matrix">
        {(m) => (
          <>
            {/* transformed grid lines */}
            {[-3, -2, -1, 1, 2, 3].map((t) => (
              <g key={t} opacity={0.42}>
                <line x1={m.toX(apply(t, -4).x)} y1={m.toY(apply(t, -4).y)} x2={m.toX(apply(t, 4).x)} y2={m.toY(apply(t, 4).y)} stroke={C.violet} strokeWidth={0.7} />
                <line x1={m.toX(apply(-4, t).x)} y1={m.toY(apply(-4, t).y)} x2={m.toX(apply(4, t).x)} y2={m.toY(apply(4, t).y)} stroke={C.violet} strokeWidth={0.7} />
              </g>
            ))}
            {/* ghost unit square */}
            <polygon
              points={`${m.toX(0)},${m.toY(0)} ${m.toX(1)},${m.toY(0)} ${m.toX(1)},${m.toY(1)} ${m.toX(0)},${m.toY(1)}`}
              fill={C.slate}
              fillOpacity={0.12}
              stroke={C.slate}
              strokeWidth={1.3}
              strokeDasharray="4 3"
            />
            {/* transformed unit square */}
            <polygon points={sq(m)} fill={C.indigo} fillOpacity={0.22} stroke={C.indigo} strokeWidth={2.2} />
            {/* basis vectors */}
            <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(ib.x)} y2={m.toY(ib.y)} stroke={C.cyan} strokeWidth={2.8} />
            <circle cx={m.toX(ib.x)} cy={m.toY(ib.y)} r={4.5} fill={C.cyan} />
            <text x={m.toX(ib.x) + 8} y={m.toY(ib.y) - 8} className="text-[11px] font-bold" fill={C.cyan}>î ↦ col 1</text>
            <line x1={m.toX(0)} y1={m.toY(0)} x2={m.toX(jb.x)} y2={m.toY(jb.y)} stroke={C.rose} strokeWidth={2.8} />
            <circle cx={m.toX(jb.x)} cy={m.toY(jb.y)} r={4.5} fill={C.rose} />
            <text x={m.toX(jb.x) + 8} y={m.toY(jb.y) - 8} className="text-[11px] font-bold" fill={C.rose}>ĵ ↦ col 2</text>
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "transformed unit square (area × |det A|)" },
          { color: C.slate, label: "original unit square", dashed: true },
          { color: C.cyan, label: "image of î" },
          { color: C.rose, label: "image of ĵ" },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 7. Matrix multiplication
// ===========================================================================

function MatrixGrid({
  which,
  M,
  hiRow,
  hiCol,
  label,
  onEntry,
  onHoverCell,
}: {
  which?: "A" | "B";
  M: number[][];
  hiRow?: number | null;
  hiCol?: number | null;
  label: string;
  onEntry?: (which: "A" | "B", i: number, j: number, value: number) => void;
  onHoverCell?: (cell: { i: number; j: number }) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</p>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${M[0].length}, minmax(2.6rem, 1fr))` }}>
        {M.map((row, i) =>
          row.map((v, j) => {
            const inRow = hiRow === i;
            const inCol = hiCol === j;
            const hot = inRow || inCol;
            return which ? (
              <input
                key={`${i}${j}`}
                type="number"
                step={1}
                value={v}
                onChange={(e) => onEntry?.(which, i, j, Number(e.target.value) || 0)}
                className={cn(
                  "w-[2.8rem] rounded-md border px-1 py-1 text-center font-mono text-xs tabular focus:outline-none",
                  hot ? "border-viz-3/70 bg-viz-3/10 text-ink" : "border-border-subtle bg-surface-inset text-ink focus:border-viz-2/50",
                )}
                aria-label={`${label} row ${i + 1} column ${j + 1}`}
              />
            ) : (
              <div
                key={`${i}${j}`}
                className={cn(
                  "w-[3.2rem] cursor-pointer rounded-md border px-1 py-1 text-center font-mono text-xs font-bold tabular transition-colors",
                  inRow && inCol
                    ? "border-viz-3 bg-viz-3/20 text-ink"
                    : hot
                      ? "border-viz-3/50 bg-viz-3/8 text-ink"
                      : "border-border-subtle bg-surface-inset text-ink hover:border-viz-2/50",
                )}
                onMouseEnter={() => onHoverCell?.({ i, j })}
              >
                {fmtNum(v, 1)}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function MatrixMultiplyViz() {
  const [A, setA] = useState<number[][]>([[-2, 5, 1], [3, 0, -4]]);
  const [B, setB] = useState<number[][]>([[1, -2], [4, 3], [5, -1]]);
  const [cell, setCell] = useState<{ i: number; j: number } | null>(null);
  const Cmat = useMemo(() => matMul(A, B), [A, B]);
  const rows = A.length;
  const inner = B.length;
  const cols = B[0].length;

  const setEntry = (
    which: "A" | "B",
    i: number,
    j: number,
    value: number,
  ) => {
    if (which === "A") setA((p) => p.map((r, ri) => r.map((v, ci) => (ri === i && ci === j ? value : v))));
    else setB((p) => p.map((r, ri) => r.map((v, ci) => (ri === i && ci === j ? value : v))));
  };

  const highlight = cell !== null;
  const dotExpr =
    highlight && cell.i < rows && cell.j < cols
      ? {
          terms: Array.from({ length: inner }, (_, k) => A[cell.i][k] * B[k][cell.j]),
          result: Cmat[cell.i][cell.j],
        }
      : null;

  return (
    <VizCard
      title="Matrix multiplication, cell by cell"
      subtitle="Edit A and B, then hover any cell of C: its row of A and column of B light up — the cell is their dot product."
      domain="math"
      explanation={
        <>
          c<sub>ij</sub> = (row i of A) · (column j of B) = Σ<sub>k</sub> a<sub>ik</sub>b<sub>kj</sub>. Multiplying a{" "}
          {rows}×{inner} by a {inner}×{cols} matrix costs {rows}·{inner}·{cols} = {rows * inner * cols} scalar
          multiplications. The inner dimensions must match — that is the whole compatibility rule.
        </>
      }
      controls={
        <div className="flex flex-wrap gap-1.5">
          <VizButton onClick={() => { setA([[-2, 5, 1], [3, 0, -4]]); setB([[1, -2], [4, 3], [5, -1]]); setCell(null); }}>Reset</VizButton>
          <span className="self-center text-[11px] text-ink-3">Shapes are fixed at 2×3 · 3×2 — every number is editable.</span>
        </div>
      }
      readouts={
        <Readouts
          items={[
            { label: "Shape of A", value: `${rows}×${inner}` },
            { label: "Shape of B", value: `${inner}×${cols}` },
            { label: "Shape of C = AB", value: `${rows}×${cols}`, tone: "accent" },
            { label: "Scalar multiplies", value: String(rows * inner * cols) },
          ]}
        />
      }
      footer={
        dotExpr && (
          <div className="border-t border-border-subtle bg-surface-inset px-5 py-3.5">
            <p className="font-mono text-[12.5px] leading-relaxed text-ink">
              <span className="font-bold text-viz-3">
                c<sub>{cell!.i + 1}{cell!.j + 1}</sub>
              </span>{" "}
              = {dotExpr.terms.map((t, k) => `${fmtNum(A[cell!.i][k], 0)}·${fmtNum(B[k][cell!.j], 0)}`).join(" + ")} ={" "}
              {dotExpr.terms.map((t) => fmtNum(t, 1)).join(" + ")} ={" "}
              <span className="font-bold">{fmtNum(dotExpr.result, 1)}</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-3">
              Row {cell!.i + 1} of A dotted with column {cell!.j + 1} of B — the k-th term pairs a<sub>{cell!.i + 1}k</sub> with b<sub>k{cell!.j + 1}</sub>.
            </p>
          </div>
        )
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:gap-x-6">
        <MatrixGrid which="A" M={A} hiRow={highlight ? cell!.i : null} label={`A (${rows}×${inner})`} onEntry={setEntry} />
        <span className="mt-5 text-lg font-light text-ink-3">×</span>
        <MatrixGrid which="B" M={B} hiCol={highlight ? cell!.j : null} label={`B (${inner}×${cols})`} onEntry={setEntry} />
        <span className="mt-5 text-lg font-light text-ink-3">=</span>
        <MatrixGrid M={Cmat} hiRow={highlight ? cell!.i : null} hiCol={highlight ? cell!.j : null} label={`C (${rows}×${cols})`} onHoverCell={setCell} />
      </div>
    </VizCard>
  );
}

// ===========================================================================
// 8. Geometric transformations
// ===========================================================================

const F_SHAPE: Array<[number, number]> = [
  [0, 0], [0.6, 0], [0.6, 0.22], [0.22, 0.22], [0.22, 0.45], [0.5, 0.45],
  [0.5, 0.68], [0.22, 0.68], [0.22, 1], [0, 1],
];

export function TransformationViz() {
  const [t, setT] = useState({ theta: 30, sx: 1.2, sy: 0.9, kx: 0.3, ky: 0, tx: 0.4, ty: 0.2 });
  const [showGrid, setShowGrid] = useState(true);

  const rad = (t.theta * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Composite: T · Sh · S · R  (rotate, then scale, then shear, then translate)
  // affine as 2×3
  const M = useMemo(() => {
    const R = [[cos, -sin], [sin, cos]];
    const S = [[t.sx, 0], [0, t.sy]];
    const Sh = [[1, t.kx], [t.ky, 1]];
    const mul = (a: number[][], b: number[][]) => matMul(a, b);
    const L = mul(mul(Sh, S), R); // linear part
    return { L, tx: t.tx, ty: t.ty };
  }, [cos, sin, t.sx, t.sy, t.kx, t.ky, t.tx, t.ty]);

  const apply = (p: [number, number]): [number, number] => [
    M.L[0][0] * p[0] + M.L[0][1] * p[1] + M.tx,
    M.L[1][0] * p[0] + M.L[1][1] * p[1] + M.ty,
  ];
  const detL = det(M.L);

  return (
    <VizCard
      title="Geometric transformations"
      subtitle="Rotate, scale, shear and translate the letter F — the composite affine matrix updates live."
      domain="math"
      explanation={
        <>
          Order matters: this composition applies <strong>rotation → scaling → shear → translation</strong> (write it
          as T·Sh·S·R acting on column vectors — rightmost acts first). The 2×2 linear part has determinant{" "}
          <strong>{fmtNum(detL, 3)}</strong>: its magnitude is the area factor, its sign records a flip. The last
          column (t<sub>x</sub>, t<sub>y</sub>) is pure translation — matrices of this size cannot represent it, which
          is why graphics code uses 3×3 homogeneous coordinates.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showGrid} onClick={() => setShowGrid((v) => !v)}>Transformed grid</ToggleChip>
            <VizButton onClick={() => setT({ theta: 30, sx: 1.2, sy: 0.9, kx: 0.3, ky: 0, tx: 0.4, ty: 0.2 })}>Reset</VizButton>
          </div>
          <VizSlider label="rotation θ (degrees)" value={t.theta} min={-180} max={180} step={5} onChange={(theta) => setT((q) => ({ ...q, theta }))} format={(v) => `${v}°`} />
          <VizSlider label="scale x" symbol="sx" value={t.sx} min={0.2} max={2.4} step={0.1} onChange={(sx) => setT((q) => ({ ...q, sx }))} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="scale y" symbol="sy" value={t.sy} min={0.2} max={2.4} step={0.1} onChange={(sy) => setT((q) => ({ ...q, sy }))} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="shear x by y" symbol="kx" value={t.kx} min={-1} max={1} step={0.05} onChange={(kx) => setT((q) => ({ ...q, kx }))} format={(v) => fmtSigned(v, 2)} />
          <VizSlider label="shear y by x" symbol="ky" value={t.ky} min={-1} max={1} step={0.05} onChange={(ky) => setT((q) => ({ ...q, ky }))} format={(v) => fmtSigned(v, 2)} />
          <VizSlider label="translate x" symbol="tx" value={t.tx} min={-2.5} max={2.5} step={0.1} onChange={(tx) => setT((q) => ({ ...q, tx }))} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="translate y" symbol="ty" value={t.ty} min={-2.5} max={2.5} step={0.1} onChange={(ty) => setT((q) => ({ ...q, ty }))} format={(v) => fmtSigned(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "det (area factor)", value: fmtNum(detL, 3), tone: "accent" },
            { label: "Rotation", value: `${fmtNum(t.theta, 0)}°` },
            { label: "Scale (sx , sy)", value: `${fmtNum(t.sx, 1)} , ${fmtNum(t.sy, 1)}` },
            { label: "Translate (tx , ty)", value: `${fmtNum(t.tx, 1)} , ${fmtNum(t.ty, 1)}` },
          ]}
        />
      }
      footer={
        <div className="overflow-x-auto border-t border-border-subtle px-5 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Composite affine matrix (2×3)</p>
          <p className="mt-1.5 whitespace-nowrap font-mono text-[13px] leading-relaxed text-ink">
            [[{M.L[0][0].toFixed(3)}, {M.L[0][1].toFixed(3)}, {M.tx.toFixed(2)}], [{M.L[1][0].toFixed(3)}, {M.L[1][1].toFixed(3)}, {M.ty.toFixed(2)}]]
          </p>
        </div>
      }
    >
      <Plane xMin={-3.4} xMax={3.4} yMin={-2.2} yMax={3} xLabel="x" yLabel="y" aspect={16 / 10} ariaLabel="Letter F transformed by rotation, scale, shear and translation">
        {(m) => {
          const ghost = F_SHAPE.map(([x, y]) => `${m.toX(x)},${m.toY(y)}`).join(" ");
          const moved = F_SHAPE.map(([x, y]) => apply([x, y]));
          const poly = moved.map(([x, y]) => `${m.toX(x)},${m.toY(y)}`).join(" ");
          return (
            <>
              {showGrid &&
                [-2, -1, 1, 2].map((g) => (
                  <g key={g} opacity={0.35}>
                    <path d={gridLinePath(m, [g, -3], [g, 3])} stroke={C.violet} strokeWidth={0.7} />
                    <path d={gridLinePath(m, [-3, g], [3, g])} stroke={C.violet} strokeWidth={0.7} />
                  </g>
                ))}
              <polygon points={ghost} fill={C.slate} fillOpacity={0.12} stroke={C.slate} strokeWidth={1.3} strokeDasharray="4 3" />
              <polygon points={poly} fill={C.indigo} fillOpacity={0.25} stroke={C.indigo} strokeWidth={2.4} />
              {/* corner markers to read the rotation */}
              <circle cx={m.toX(moved[1][0])} cy={m.toY(moved[1][1])} r={3.6} fill={C.rose} />
              <circle cx={m.toX(moved[8][0])} cy={m.toY(moved[8][1])} r={3.6} fill={C.green} />
              <text x={m.toX(moved[8][0]) + 8} y={m.toY(moved[8][1]) + 4} className="text-[10.5px] font-bold" fill={C.green}>(0,1) corner</text>
            </>
          );
        }}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "transformed F" },
          { color: C.slate, label: "original F", dashed: true },
          { color: C.violet, label: "transformed grid" },
        ]}
      />
    </VizCard>
  );
}

function gridLinePath(
  m: { toX: (x: number) => number; toY: (y: number) => number },
  p1: [number, number],
  p2: [number, number],
): string {
  return `M ${m.toX(p1[0])} ${m.toY(p1[1])} L ${m.toX(p2[0])} ${m.toY(p2[1])}`;
}

// Re-export Seg for use by sibling files
export { Seg };
