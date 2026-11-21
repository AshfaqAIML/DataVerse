"use client";

/**
 * math-viz2.tsx — the Mathematics collection, part 2 (calculus):
 *
 *   DerivativeViz        f and f′ together; slope marks; sign analysis
 *   TangentLineViz       tangent + normal at a draggable point; the
 *                        linear-approximation error, quantified
 *   GradientViz          contour map of f(x, y) with the gradient field;
 *                        drag a point, read ∇f and the steepest direction
 *   IntegralViz          Riemann sums (4 methods) → the true integral
 *   OptimizationViz      3D surface + contours + gradient-descent trail
 *
 * All calculus is computed live (numeric derivatives/gradients via the
 * course's expression engine; integrals by Riemann/Simpson quadrature).
 */
import { useMemo, useState } from "react";
import {
  C,
  Legend,
  Plane,
  Readouts,
  ToggleChip,
  VizButton,
  VizCard,
  VizSlider,
  fmtNum,
  fmtSigned,
  pathOf,
  sampleCurve,
  usePlaneDrag,
} from "./core";
import { evalExpr, numericDerivative, numericGradient2D, simpsonIntegrate } from "@/lib/mathcourse/expr";
import { contourSegments } from "@/lib/viz/stats";

// ===========================================================================
// 9. Derivatives
// ===========================================================================

const D_PRESETS: Array<{ expr: string; label: string; dLabel: string }> = [
  { expr: "x**2", label: "f = x²", dLabel: "f′ = 2x" },
  { expr: "x**3 - 3*x", label: "f = x³ − 3x", dLabel: "f′ = 3x² − 3" },
  { expr: "sin(x)", label: "f = sin x", dLabel: "f′ = cos x" },
  { expr: "exp(x/2)", label: "f = e^(x/2)", dLabel: "f′ = ½e^(x/2)" },
  { expr: "ln(x**2 + 1)", label: "f = ln(x²+1)", dLabel: "f′ = 2x/(x²+1)" },
];

export function DerivativeViz() {
  const [idx, setIdx] = useState(1);
  const [x0, setX0] = useState(1.2);
  const [showD, setShowD] = useState(true);
  const [showSlopes, setShowSlopes] = useState(false);
  const preset = D_PRESETS[idx];
  const f = (x: number) => evalExpr(preset.expr, { x });
  const fp = (x: number) => numericDerivative(preset.expr, x);
  const xMin = -4;
  const xMax = 4;
  const yMin = -6;
  const yMax = 8;

  const presetExpr = preset.expr;
  const fSegs = useMemo(
    () => sampleCurve((x) => evalExpr(presetExpr, { x }), xMin, xMax, yMin, yMax, 420),
    [presetExpr],
  );
  const dSegs = useMemo(
    () => sampleCurve((x) => numericDerivative(presetExpr, x), xMin, xMax, yMin, yMax, 420),
    [presetExpr],
  );
  const slopeMarks: Array<{ x: number; m: number; y: number }> = [];
  if (showSlopes) {
    for (let x = -3.5; x <= 3.5; x += 0.5) {
      try {
        slopeMarks.push({ x, m: fp(x), y: f(x) });
      } catch {
        /* skip */
      }
    }
  }

  const fx0 = safe(f, x0);
  const fpx0 = safe(fp, x0);

  return (
    <VizCard
      title="The derivative as a function"
      subtitle="f′ collects the slope of f at every point: where f rises, f′ is positive; where f turns around, f′ crosses zero."
      domain="math"
      explanation={
        <>
          Drag the point (or the x slider). The readouts show f(x₀) and the machine-computed slope f′(x₀). Where the{" "}
          <span style={{ color: C.cyan }}>cyan f′ curve</span> sits above the axis, the{" "}
          <span style={{ color: C.indigo }}>indigo f curve</span> is climbing; where f′ crosses zero, f has a peak or
          valley. Turn on the slope marks to see f&rsquo;s steepness sampled along the curve.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {D_PRESETS.map((p, i) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setIdx(i)}
                className={
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors " +
                  (idx === i ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showD} onClick={() => setShowD((v) => !v)}>Show f′</ToggleChip>
            <ToggleChip active={showSlopes} onClick={() => setShowSlopes((v) => !v)}>Slope marks on f</ToggleChip>
          </div>
          <VizSlider label="point of interest" symbol="x₀" value={x0} min={-3.5} max={3.5} step={0.05} onChange={setX0} format={(v) => fmtNum(v, 2)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "f(x₀)", value: fmtNum(fx0, 3) },
            { label: "f′(x₀) — slope", value: fmtNum(fpx0, 3), tone: "accent" },
            { label: "Behaviour at x₀", value: Number.isFinite(fpx0) ? (fpx0 > 0.02 ? "increasing" : fpx0 < -0.02 ? "decreasing" : "flat / turning") : "—" },
            { label: "Formula", value: preset.dLabel, mono: false },
          ]}
        />
      }
    >
      <Plane xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} xLabel="x" yLabel="y" ariaLabel="Function with its derivative curve and a draggable point">
        {(m) => (
          <>
            {fSegs.map((s, i) => (
              <path key={`f${i}`} d={pathOf(m, s)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
            ))}
            {showD && dSegs.map((s, i) => (
              <path key={`d${i}`} d={pathOf(m, s)} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="7 5" />
            ))}
            {slopeMarks.map((s, i) => {
              const len = 0.22;
              const dx = len / Math.sqrt(1 + s.m * s.m);
              const dy = s.m * dx;
              return (
                <line
                  key={i}
                  x1={m.toX(s.x - dx)}
                  y1={m.toY(s.y - dy)}
                  x2={m.toX(s.x + dx)}
                  y2={m.toY(s.y + dy)}
                  stroke={C.amber}
                  strokeWidth={1.6}
                  opacity={0.85}
                />
              );
            })}
            {Number.isFinite(fx0) && (
              <>
                <circle cx={m.toX(x0)} cy={m.toY(fx0)} r={6} fill={C.rose} stroke="var(--color-canvas, #fff)" strokeWidth={2.4} />
                <text x={m.toX(x0) + 10} y={m.toY(fx0) - 10} className="text-[11.5px] font-bold" fill={C.rose}>
                  x₀ = {fmtNum(x0, 2)}
                </text>
              </>
            )}
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "f" },
          { color: C.cyan, label: "f′ (slope of f)", dashed: true },
          { color: C.amber, label: "sampled slopes on f" },
          { color: C.rose, label: "x₀" },
        ]}
      />
    </VizCard>
  );
}

function safe(f: (x: number) => number, x: number): number {
  try {
    const v = f(x);
    return Number.isFinite(v) ? v : NaN;
  } catch {
    return NaN;
  }
}

// ===========================================================================
// 10. Tangent lines
// ===========================================================================

export function TangentLineViz() {
  const [idx, setIdx] = useState(0);
  const [x0, setX0] = useState(1);
  const [dx, setDx] = useState(1.2);
  const [showNormal, setShowNormal] = useState(false);
  const expr = D_PRESETS[idx].expr;
  const f = (x: number) => evalExpr(expr, { x });
  const fp = (x: number) => numericDerivative(expr, x);
  const xMin = -4;
  const xMax = 4;
  const yMin = -6;
  const yMax = 8;

  const drag = usePlaneDrag((x) => setX0(Math.max(-3.5, Math.min(3.5, x))));
  const fx0 = safe(f, x0);
  const slope = safe(fp, x0);
  const tangent = (x: number) => fx0 + slope * (x - x0);
  const normalSlope = slope !== 0 ? -1 / slope : NaN;
  const normal = (x: number) => fx0 + normalSlope * (x - x0);

  const xNear = x0 + dx;
  const fExact = safe(f, xNear);
  const fApprox = tangent(xNear);
  const error = fExact - fApprox;

  return (
    <VizCard
      title="Tangent lines & linear approximation"
      subtitle="The tangent is the line that hugs the curve at one point — and the best linear guess about the curve nearby."
      domain="math"
      explanation={
        <>
          The tangent&rsquo;s equation is <strong>y = f(x₀) + f′(x₀)(x − x₀)</strong>. Move Δx to compare the true
          value f(x₀ + Δx) with the tangent&rsquo;s prediction; their gap (the error) shrinks quadratically — halving
          Δx divides the error by roughly four. That is what makes the tangent the <em>best</em> linear approximation.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {D_PRESETS.map((p, i) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setIdx(i)}
                className={
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors " +
                  (idx === i ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {p.label}
              </button>
            ))}
            <ToggleChip active={showNormal} onClick={() => setShowNormal((v) => !v)}>Normal line</ToggleChip>
          </div>
          <VizSlider label="point of tangency" symbol="x₀" value={x0} min={-3.5} max={3.5} step={0.05} onChange={setX0} format={(v) => fmtNum(v, 2)} />
          <VizSlider label="step away from x₀" symbol="Δx" value={dx} min={-2.5} max={2.5} step={0.05} onChange={setDx} format={(v) => fmtSigned(v, 2)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Tangent slope f′(x₀)", value: fmtNum(slope, 3), tone: "accent" },
            { label: "True f(x₀+Δx)", value: fmtNum(fExact, 3) },
            { label: "Tangent estimate", value: fmtNum(fApprox, 3) },
            { label: "Error", value: fmtSigned(error, 4), tone: Math.abs(error) < 0.05 ? "good" : "default" },
          ]}
        />
      }
    >
      <Plane xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} xLabel="x" yLabel="y" ariaLabel="Curve with tangent line, draggable point and approximation point">
        {(m) => {
          const segs = sampleCurve(f, xMin, xMax, yMin, yMax, 420);
          return (
            <>
              {segs.map((s, i) => (
                <path key={i} d={pathOf(m, s)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
              ))}
              {Number.isFinite(slope) && (
                <line x1={m.toX(xMin)} y1={m.toY(tangent(xMin))} x2={m.toX(xMax)} y2={m.toY(tangent(xMax))} stroke={C.rose} strokeWidth={2} />
              )}
              {showNormal && Number.isFinite(normalSlope) && (
                <line x1={m.toX(x0 - 1.2)} y1={m.toY(normal(x0 - 1.2))} x2={m.toX(x0 + 1.2)} y2={m.toY(normal(x0 + 1.2))} stroke={C.gold} strokeWidth={1.8} strokeDasharray="6 4" />
              )}
              {Number.isFinite(fExact) && Math.abs(dx) > 0.02 && (
                <>
                  <circle cx={m.toX(xNear)} cy={m.toY(fExact)} r={4.5} fill={C.green} />
                  <circle cx={m.toX(xNear)} cy={m.toY(fApprox)} r={4} fill={C.amber} />
                  <line x1={m.toX(xNear)} y1={m.toY(fExact)} x2={m.toX(xNear)} y2={m.toY(fApprox)} stroke={C.amber} strokeWidth={2.2} />
                </>
              )}
              <g
                className="dv-handle"
                onPointerDown={drag.handleDown}
                onPointerMove={(e) => drag.handleMove(e, m)}
                onPointerUp={drag.handleUp}
                onKeyDown={(e) => drag.handleKeys(e, m, () => ({ x: x0, y: fx0 }))}
                tabIndex={0}
                role="button"
                aria-label={`Tangent point x₀ at ${fmtNum(x0, 2)} — drag, or use the arrow keys to move`}
                style={{ cursor: drag.dragging ? "grabbing" : "grab" }}
              >
                <circle cx={m.toX(x0)} cy={m.toY(fx0)} r={20} fill="transparent" />
                <circle cx={m.toX(x0)} cy={m.toY(fx0)} r={6.5} fill="var(--color-canvas, #fff)" stroke={C.rose} strokeWidth={3} />
                <text x={m.toX(x0) + 10} y={m.toY(fx0) - 11} className="text-[11.5px] font-bold" fill={C.rose}>
                  x₀ = {fmtNum(x0, 2)}
                </text>
              </g>
            </>
          );
        }}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "f" },
          { color: C.rose, label: "tangent at x₀ (drag)" },
          ...(showNormal ? [{ color: C.gold, label: "normal (⊥ tangent)", dashed: true }] : []),
          { color: C.green, label: "true f(x₀+Δx)" },
          { color: C.amber, label: "tangent estimate + error" },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 11. Gradients (2-D fields)
// ===========================================================================

const G_SURFACES: Array<{ id: string; label: string; f: (x: number, y: number) => number; note: string }> = [
  { id: "bowl", label: "Bowl ½(x²+y²)", f: (x, y) => 0.5 * (x * x + y * y), note: "the simplest minimum at (0,0)" },
  { id: "saddle", label: "Saddle x²−y²", f: (x, y) => x * x - y * y, note: "up one axis, down the other — no minimum" },
  { id: "valley", label: "Valley ½(x²+8y²)", f: (x, y) => 0.5 * (x * x + 8 * y * y), note: "an anisotropic valley — zig-zag country" },
  { id: "ripple", label: "Ripple", f: (x, y) => Math.sin(x) * Math.cos(y) * 2 + 0.1 * (x * x + y * y), note: "many local minima" },
];

export function GradientViz() {
  const [surfIdx, setSurfIdx] = useState(0);
  const [p, setP] = useState({ x: 1.8, y: 1.2 });
  const [showField, setShowField] = useState(true);
  const surface = G_SURFACES[surfIdx];
  const xMin = -3;
  const xMax = 3;
  const yMin = -2.4;
  const yMax = 2.4;

  const grad = useMemo(() => numericGradientAt(surface.f, p.x, p.y), [surface.f, p.x, p.y]);
  const contours = useMemo(
    () => contourSegments(surface.f, xMin, xMax, yMin, yMax, levelSet(surface.f, xMin, xMax, yMin, yMax), 56, 44),
    [surface.f],
  );
  const field = useMemo(() => {
    const out: Array<{ x: number; y: number; gx: number; gy: number }> = [];
    for (let x = -2.5; x <= 2.5; x += 0.85) {
      for (let y = -2; y <= 2; y += 0.85) {
        const g = numericGradientAt(surface.f, x, y);
        out.push({ x, y, gx: g[0], gy: g[1] });
      }
    }
    return out;
  }, [surface.f]);

  const drag = usePlaneDrag((x, y) => setP({ x, y }));
  const gMag = Math.hypot(grad[0], grad[1]);
  const descent: [number, number] = [-grad[0], -grad[1]];

  return (
    <VizCard
      title="The gradient ∇f"
      subtitle="Contours are level sets of f; the gradient at each point is the arrow of steepest ascent — always perpendicular to the contour through that point."
      domain="math"
      explanation={
        <>
          ∇f = (∂f/∂x, ∂f/∂y) points <strong>uphill</strong>, with length equal to the climb rate. Follow{" "}
          <strong>−∇f</strong> (the rose arrow) and you walk downhill — one step of gradient descent. Drag the point
          anywhere: the vector re-evaluates instantly. On the saddle, notice the gradient still points uphill — but
          downhill leads to no minimum.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {G_SURFACES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                title={s.note}
                onClick={() => setSurfIdx(i)}
                className={
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors " +
                  (surfIdx === i ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showField} onClick={() => setShowField((v) => !v)}>Gradient field</ToggleChip>
            <VizButton onClick={() => setP({ x: 1.8, y: 1.2 })}>Reset point</VizButton>
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Point", value: `(${fmtNum(p.x, 2)}, ${fmtNum(p.y, 2)})` },
            { label: "∇f (components)", value: `(${fmtNum(grad[0], 2)}, ${fmtNum(grad[1], 2)})`, tone: "accent" },
            { label: "|∇f| steepness", value: fmtNum(gMag, 3) },
            { label: "f(point)", value: fmtNum(surface.f(p.x, p.y), 3) },
          ]}
        />
      }
    >
      <Plane xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} xLabel="x" yLabel="y" aspect={16 / 11} ariaLabel="Contour map with gradient field and a draggable point">
        {(m) => (
          <>
            {contours.map((seg, i) => (
              <line
                key={i}
                x1={m.toX(seg.x1)}
                y1={m.toY(seg.y1)}
                x2={m.toX(seg.x2)}
                y2={m.toY(seg.y2)}
                stroke={C.violet}
                strokeWidth={1}
                opacity={0.4}
              />
            ))}
            {showField &&
              field.map((v, i) => {
                const len = Math.hypot(v.gx, v.gy);
                if (len < 0.02) return null;
                const scale = Math.min(0.42, 0.16 + len * 0.12) / len;
                return (
                  <line
                    key={i}
                    x1={m.toX(v.x)}
                    y1={m.toY(v.y)}
                    x2={m.toX(v.x + v.gx * scale)}
                    y2={m.toY(v.y + v.gy * scale)}
                    stroke={C.cyan}
                    strokeWidth={1.2}
                    opacity={0.5}
                    markerEnd="url(#grad-arrow)"
                  />
                );
              })}
            <defs>
              <marker id="grad-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                <path d="M 0 0 L 7 3.5 L 0 7 Z" fill={C.cyan} />
              </marker>
              <marker id="grad-arrow-rose" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 Z" fill={C.rose} />
              </marker>
            </defs>
            {/* gradient + descent at p */}
            <line x1={m.toX(p.x)} y1={m.toY(p.y)} x2={m.toX(p.x + grad[0] * 0.5)} y2={m.toY(p.y + grad[1] * 0.5)} stroke={C.cyan} strokeWidth={3} markerEnd="url(#grad-arrow)" />
            <line x1={m.toX(p.x)} y1={m.toY(p.y)} x2={m.toX(p.x + descent[0] * 0.5)} y2={m.toY(p.y + descent[1] * 0.5)} stroke={C.rose} strokeWidth={3} markerEnd="url(#grad-arrow-rose)" />
            <g
              className="dv-handle"
              onPointerDown={drag.handleDown}
              onPointerMove={(e) => drag.handleMove(e, m)}
              onPointerUp={drag.handleUp}
              onKeyDown={(e) => drag.handleKeys(e, m, () => p)}
              tabIndex={0}
              role="button"
              aria-label={`Point p at (${fmtNum(p.x, 2)}, ${fmtNum(p.y, 2)}) — drag, or use the arrow keys to move`}
              style={{ cursor: drag.dragging ? "grabbing" : "grab" }}
            >
              <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={22} fill="transparent" />
              <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={6.5} fill="var(--color-canvas, #fff)" stroke={C.indigo} strokeWidth={3} />
            </g>
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.violet, label: "contours of f (level sets)" },
          { color: C.cyan, label: "∇f — steepest ascent" },
          { color: C.rose, label: "−∇f — steepest descent (drag the white point)" },
        ]}
      />
    </VizCard>
  );
}

function numericGradientAt(f: (x: number, y: number) => number, x: number, y: number, h = 1e-5): [number, number] {
  const gx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const gy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  return [gx, gy];
}

function levelSet(f: (x: number, y: number) => number, xMin: number, xMax: number, yMin: number, yMax: number): number[] {
  // sample f, build ~10 nicely spaced levels between the 5th and 95th percentile
  const vals: number[] = [];
  for (let i = 0; i <= 20; i++) {
    for (let j = 0; j <= 16; j++) {
      vals.push(f(xMin + ((xMax - xMin) * i) / 20, yMin + ((yMax - yMin) * j) / 16));
    }
  }
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.05)];
  const hi = vals[Math.floor(vals.length * 0.95)];
  const out: number[] = [];
  for (let k = 1; k <= 10; k++) out.push(lo + ((hi - lo) * k) / 11);
  return out;
}

// ===========================================================================
// 12. Integrals
// ===========================================================================

type Method = "left" | "right" | "mid" | "trap";

export function IntegralViz() {
  const [idx, setIdx] = useState(0);
  const [a, setA] = useState(-2);
  const [b, setB] = useState(2);
  const [n, setN] = useState(8);
  const [method, setMethod] = useState<Method>("mid");
  const expr = D_PRESETS[idx].expr;
  const f = (x: number) => evalExpr(expr, { x });
  const xMin = -4.5;
  const xMax = 4.5;
  const yMin = -4;
  const yMax = 8;

  const presetExpr = D_PRESETS[idx].expr;
  const { sum, bars, trapezoids } = useMemo(() => {
    const fe = (x: number) => {
      try {
        const v = evalExpr(presetExpr, { x });
        return Number.isFinite(v) ? v : NaN;
      } catch {
        return NaN;
      }
    };
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const w = (hi - lo) / n;
    let s = 0;
    const bars: Array<{ x0: number; x1: number; h: number; hRight: number }> = [];
    const trapezoids: Array<{ x0: number; x1: number; h0: number; h1: number }> = [];
    for (let i = 0; i < n; i++) {
      const x0 = lo + i * w;
      const x1 = x0 + w;
      let h: number;
      if (method === "left") h = fe(x0);
      else if (method === "right") h = fe(x1);
      else if (method === "mid") h = fe((x0 + x1) / 2);
      else h = fe(x0);
      s += method === "trap" ? (fe(x0) + fe(x1)) * w * 0.5 : h * w;
      bars.push({ x0, x1, h, hRight: fe(x1) });
      trapezoids.push({ x0, x1, h0: fe(x0), h1: fe(x1) });
    }
    // signed integral: if b < a, negate
    const sign = b >= a ? 1 : -1;
    return { sum: s * sign, bars, trapezoids };
  }, [presetExpr, a, b, n, method]);

  const exact = useMemo(() => {
    try {
      return simpsonIntegrate(presetExpr, Math.min(a, b), Math.max(a, b), {}, 2000) * (b >= a ? 1 : -1);
    } catch {
      return NaN;
    }
  }, [presetExpr, a, b]);
  const error = sum - exact;

  return (
    <VizCard
      title="Integrals: from rectangles to area"
      subtitle="An integral is the signed area under a curve. Riemann rectangles approximate it; more, better-placed rectangles close in on the exact value."
      domain="math"
      explanation={
        <>
          The <strong>exact</strong> value (Simpson quadrature with 2000 panels) sits beside the current
          approximation, so the error readout is the honest gap. Left and right endpoints overshoot or undershoot on
          curved sections; <strong>midpoints</strong> and <strong>trapezoids</strong> converge much faster. Area
          below the x-axis counts as negative — that is the &ldquo;signed&rdquo; in signed area.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {D_PRESETS.map((p, i) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setIdx(i)}
                className={
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors " +
                  (idx === i ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["left", "Left"],
                ["right", "Right"],
                ["mid", "Midpoint"],
                ["trap", "Trapezoid"],
              ] as Array<[Method, string]>
            ).map(([mm, label]) => (
              <button
                key={mm}
                type="button"
                onClick={() => setMethod(mm)}
                className={
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (method === mm ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {label}
              </button>
            ))}
          </div>
          <VizSlider label="lower bound" symbol="a" value={a} min={-4} max={4} step={0.1} onChange={setA} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="upper bound" symbol="b" value={b} min={-4} max={4} step={0.1} onChange={setB} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="rectangles" symbol="n" value={n} min={1} max={80} step={1} onChange={setN} format={(v) => String(v)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: `Approx. (${method})`, value: fmtNum(sum, 4) },
            { label: "Exact (Simpson)", value: fmtNum(exact, 4), tone: "good" },
            { label: "Error", value: fmtSigned(error, 4), tone: Math.abs(error) < 0.05 ? "good" : "default" },
            { label: "Interval", value: `[${fmtNum(a, 1)}, ${fmtNum(b, 1)}]` },
          ]}
        />
      }
    >
      <Plane xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} xLabel="x" yLabel="f(x)" ariaLabel="Curve with Riemann rectangles between bounds a and b">
        {(m) => {
          const segs = sampleCurve(f, xMin, xMax, yMin, yMax, 420);
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          return (
            <>
              {/* approximation geometry */}
              {method === "trap"
                ? trapezoids.map((t, i) => (
                    <polygon
                      key={i}
                      points={`${m.toX(t.x0)},${m.toY(0)} ${m.toX(t.x0)},${m.toY(t.h0)} ${m.toX(t.x1)},${m.toY(t.h1)} ${m.toX(t.x1)},${m.toY(0)}`}
                      fill={C.amber}
                      fillOpacity={0.3}
                      stroke={C.amber}
                      strokeWidth={1}
                    />
                  ))
                : bars.map((r, i) => (
                    <rect
                      key={i}
                      x={m.toX(r.x0)}
                      y={Math.min(m.toY(r.h), m.toY(0))}
                      width={Math.max(0.5, m.toX(r.x1) - m.toX(r.x0) - 0.5)}
                      height={Math.abs(m.toY(r.h) - m.toY(0))}
                      fill={C.amber}
                      fillOpacity={0.3}
                      stroke={C.amber}
                      strokeWidth={1}
                    />
                  ))}
              {segs.map((s, i) => (
                <path key={i} d={pathOf(m, s)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
              ))}
              {/* bounds */}
              <line x1={m.toX(a)} y1={m.toY(yMin)} x2={m.toX(a)} y2={m.toY(yMax)} stroke={C.rose} strokeWidth={1.6} strokeDasharray="5 4" />
              <line x1={m.toX(b)} y1={m.toY(yMin)} x2={m.toX(b)} y2={m.toY(yMax)} stroke={C.rose} strokeWidth={1.6} strokeDasharray="5 4" />
              <text x={m.toX(a)} y={m.toY(yMax) + 13} textAnchor="middle" className="text-[11px] font-bold" fill={C.rose}>a</text>
              <text x={m.toX(b)} y={m.toY(yMax) + 13} textAnchor="middle" className="text-[11px] font-bold" fill={C.rose}>b</text>
              {/* area shading under exact curve */}
              <rect x={m.toX(lo)} y={m.toY(0)} width={m.toX(hi) - m.toX(lo)} height={0} fill="none" />
            </>
          );
        }}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "f" },
          { color: C.amber, label: `${method === "trap" ? "trapezoid" : "rectangle"} approximation` },
          { color: C.rose, label: "bounds a, b", dashed: true },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 13. Optimization surfaces
// ===========================================================================

const O_SURFACES: Array<{
  id: string;
  label: string;
  f: (x: number, y: number) => number;
  start: { x: number; y: number };
  note: string;
}> = [
  { id: "bowl", label: "Round bowl", f: (x, y) => 0.5 * (x * x + y * y), start: { x: -2.4, y: 1.6 }, note: "well-conditioned: the direct route works" },
  { id: "valley", label: "Steep valley", f: (x, y) => 0.5 * (x * x + 10 * y * y), start: { x: -2.4, y: 1.4 }, note: "ill-conditioned: plain GD zig-zags across the valley" },
  { id: "rosen", label: "Rosenbrock banana", f: (x, y) => 0.02 * ((1 - x) ** 2 + 10 * (y - x * x) ** 2), start: { x: -1.6, y: 1.8 }, note: "the classic hard case — a curved narrow valley" },
  { id: "ripple", label: "Ripples", f: (x, y) => Math.sin(x) * Math.cos(y) * 1.4 + 0.12 * (x * x + y * y), start: { x: 2.4, y: 1.6 }, note: "local minima everywhere" },
];

export function OptimizationViz() {
  const [surfIdx, setSurfIdx] = useState(1);
  const [lrExp, setLrExp] = useState(-1); // 10^lrExp
  const [steps, setSteps] = useState(24);
  const [momentum, setMomentum] = useState(0);
  const surface = O_SURFACES[surfIdx];
  const xMin = -3;
  const xMax = 3;
  const yMin = -2.2;
  const yMax = 2.2;
  const lr = Math.pow(10, lrExp);

  const path = useMemo(() => {
    const f = surface.f;
    const pts: Array<{ x: number; y: number; loss: number }> = [{ ...surface.start, loss: f(surface.start.x, surface.start.y) }];
    let x = surface.start.x;
    let y = surface.start.y;
    let vx = 0;
    let vy = 0;
    for (let i = 0; i < steps; i++) {
      const g = numericGradientAt(f, x, y);
      vx = momentum * vx - lr * g[0];
      vy = momentum * vy - lr * g[1];
      x += vx;
      y += vy;
      if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e4 || Math.abs(y) > 1e4) break;
      pts.push({ x, y, loss: f(x, y) });
    }
    return pts;
  }, [surface, lr, steps, momentum]);

  const diverged = path.length === 1 + steps; // full run
  const escaped = path.length < 1 + steps;
  const final = path[path.length - 1];

  // 3D isometric mesh
  const mesh = useMemo(() => {
    const N = 22;
    const cells: Array<{ pts: Array<[number, number, number]>; shade: number }> = [];
    let lo = Infinity;
    let hi = -Infinity;
    const grid: number[][] = [];
    for (let j = 0; j <= N; j++) {
      const row: number[] = [];
      for (let i = 0; i <= N; i++) {
        const v = surface.f(xMin + ((xMax - xMin) * i) / N, yMin + ((yMax - yMin) * j) / N);
        row.push(v);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      grid.push(row);
    }
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        if ((i + j) % 2 === 1) continue; // checkerboard: half the quads, still reads as a surface
        const p = (ii: number, jj: number): [number, number, number] => [
          xMin + ((xMax - xMin) * ii) / N,
          yMin + ((yMax - yMin) * jj) / N,
          grid[jj][ii],
        ];
        cells.push({ pts: [p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)], shade: (grid[j][i] - lo) / (hi - lo || 1) });
      }
    }
    return { cells, lo, hi };
  }, [surface]);

  const contours = useMemo(
    () => contourSegments(surface.f, xMin, xMax, yMin, yMax, levelSet(surface.f, xMin, xMax, yMin, yMax), 56, 44),
    [surface],
  );

  // iso projection: x → right-down, y → right-up, z → up. The height axis
  // is NORMALISED to the mesh range so every surface fits the frame.
  const iso = (x: number, y: number, z: number): [number, number] => {
    const s = 24;
    const cx = 150;
    const cy = 104;
    const zPx = 42; // total height swing in pixels
    const zn = (z - mesh.lo) / (mesh.hi - mesh.lo || 1);
    return [cx + (x - y) * s * 0.9, cy - (x + y) * s * 0.34 - (zn - 0.45) * zPx];
  };

  return (
    <VizCard
      title="Optimization surfaces & gradient descent"
      subtitle="A loss landscape in 3-D and in contours. Choose a learning rate, drop a point, and let gradient descent walk it downhill — or diverge."
      domain="math"
      explanation={
        <>
          Each step computes the true gradient ∇f and moves x ← x − η∇f (with optional momentum: v ← βv − η∇f, x ←
          x + v). A learning rate that is too large overshoots the valley and the loss climbs; too small and nothing
          happens. The <strong>steep valley</strong> shows why plain gradient descent zig-zags: steps are huge along
          the steep axis by the time they are useful along the shallow one.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {O_SURFACES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                title={s.note}
                onClick={() => setSurfIdx(i)}
                className={
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (surfIdx === i ? "border-viz-2/60 bg-viz-2/10 text-viz-2" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <VizSlider label="learning rate η (log scale)" value={lrExp} min={-3} max={-0.3} step={0.05} onChange={setLrExp} format={(v) => fmtNum(Math.pow(10, v), 4)} />
          <VizSlider label="steps taken" value={steps} min={1} max={60} step={1} onChange={setSteps} format={(v) => String(v)} />
          <VizSlider label="momentum β" value={momentum} min={0} max={0.95} step={0.05} onChange={setMomentum} format={(v) => fmtNum(v, 2)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Start loss f(x₀)", value: fmtNum(path[0].loss, 3) },
            { label: `Loss after ${path.length - 1} steps`, value: fmtNum(final.loss, 3), tone: "accent" },
            { label: "Final position", value: `(${fmtNum(final.x, 2)}, ${fmtNum(final.y, 2)})` },
            { label: "Run status", value: escaped ? "escaped frame — diverging?" : diverged ? "completed" : "completed", tone: escaped ? "warn" : "good", mono: false },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 3-D isometric view — height axis normalised so every surface fits */}
        <div className="overflow-hidden rounded-xl border border-border-subtle">
          <svg viewBox="0 0 300 206" role="img" aria-label="Isometric surface mesh with the descent path" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <clipPath id="iso-frame"><rect x="1" y="1" width="298" height="204" rx="10" /></clipPath>
            </defs>
            <g clipPath="url(#iso-frame)">
            {mesh.cells
              .slice()
              .sort((a, b) => isoDepth(b.pts) - isoDepth(a.pts))
              .map((cell, i) => (
                <polygon
                  key={i}
                  points={cell.pts.map(([x, y, z]) => iso(x, y, z).join(",")).join(" ")}
                  fill={heatColor(cell.shade)}
                  stroke={heatColor(cell.shade)}
                  strokeWidth={0.5}
                />
              ))}
            <polyline
              points={path.map((p) => iso(p.x, p.y, p.loss).join(",")).join(" ")}
              fill="none"
              stroke="#111827"
              strokeWidth={2}
              opacity={0.75}
            />
            {path.map((p, i) => (
              <circle key={i} cx={iso(p.x, p.y, p.loss)[0]} cy={iso(p.x, p.y, p.loss)[1]} r={i === 0 ? 4 : 2.2} fill={i === 0 ? C.rose : "#111827"} />
            ))}
            </g>
            <text x={12} y={16} className="fill-current text-[10px] font-bold opacity-60">3-D surface (loss = height, normalised)</text>
          </svg>
        </div>
        {/* 2-D contour with path */}
        <div>
          <Plane xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} aspect={16 / 11} xLabel="θ₁" yLabel="θ₂" ariaLabel="Contour map with gradient descent path">
            {(m) => (
              <>
                {contours.map((seg, i) => (
                  <line key={i} x1={m.toX(seg.x1)} y1={m.toY(seg.y1)} x2={m.toX(seg.x2)} y2={m.toY(seg.y2)} stroke={C.violet} strokeWidth={1} opacity={0.4} />
                ))}
                <polyline
                  points={path.map((p) => `${m.toX(p.x)},${m.toY(p.y)}`).join(" ")}
                  fill="none"
                  stroke={C.rose}
                  strokeWidth={2.2}
                />
                {path.map((p, i) => (
                  <circle key={i} cx={m.toX(p.x)} cy={m.toY(p.y)} r={i === 0 ? 4.5 : 2.4} fill={i === 0 ? C.indigo : C.rose} stroke="var(--color-canvas, #fff)" strokeWidth={i === 0 ? 2 : 0} />
                ))}
                <text x={m.toX(xMin) + 4} y={m.toY(yMax) - 6} className="fill-current text-[10px] font-bold opacity-60">descent path (top view)</text>
              </>
            )}
          </Plane>
        </div>
      </div>
      <Legend
        className="mt-3"
        items={[
          { color: C.violet, label: "contours (equal loss)" },
          { color: C.rose, label: "descent steps" },
          { color: C.indigo, label: "start" },
        ]}
      />
    </VizCard>
  );
}

function isoDepth(pts: Array<[number, number, number]>): number {
  // painter's order: cells with larger x+y (closer to the viewer) draw last
  return pts.reduce((s, p) => s + p[0] + p[1], 0) / pts.length;
}

function heatColor(t: number): string {
  // light→dark violet ramp that reads on both themes
  const stops: Array<[number, number, number]> = [
    [237, 233, 254],
    [196, 181, 253],
    [139, 92, 246],
    [91, 33, 182],
  ];
  const clamped = Math.max(0, Math.min(0.999, t));
  const scaled = clamped * (stops.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * frac));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
