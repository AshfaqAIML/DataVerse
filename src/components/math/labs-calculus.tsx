"use client";

/**
 * Calculus labs:
 *   TangentExplorer      secant -> tangent at a draggable point; f and f' together
 *   RiemannExplorer      n rectangles under a curve; the sum marches to the area
 *   NewtonLab            Newton's method root-finding, one tangent step at a time
 *   GradientDescentLab   a bowl in 2D, a learning rate, and the trail downhill
 */
import { useMemo, useState } from "react";
import { LabShell, LabSlider, Readout, PlotFrame, useDrag, curvePaths } from "./plotframe";
import { sampleFunction, evalExpr, numericDerivative, simpsonIntegrate, numericGradient2D } from "@/lib/mathcourse/expr";
import { cleanNumber } from "@/lib/mathcourse/numeric";

// ---------------------------------------------------------------------------

export function TangentExplorer() {
  const [expr, setExpr] = useState("x**2");
  const [x0, setX0] = useState(1);
  const [h, setH] = useState(1.5);
  const [showDeriv, setShowDeriv] = useState(false);

  const xMin = -4, xMax = 4;
  const f = (x: number) => evalExpr(expr, { x });
  const fx0 = f(x0);
  const slope = numericDerivative(expr, x0);
  const secantSlope = h === 0 ? slope : (f(x0 + h) - f(x0)) / h;
  const dragX = useDrag((x) => setX0(Math.max(xMin + 0.1, Math.min(xMax - 0.1, x))));

  const tangSeg = (m: { toX: (x: number) => number; toY: (y: number) => number }, s: number, color: string, dash?: string) => {
    const y1 = fx0 + s * (xMin - x0);
    const y2 = fx0 + s * (xMax - x0);
    return <line x1={m.toX(xMin)} y1={m.toY(y1)} x2={m.toX(xMax)} y2={m.toY(y2)} stroke={color} strokeWidth={1.9} strokeDasharray={dash} opacity={0.9} />;
  };

  return (
    <LabShell
      title="Secant → tangent explorer"
      hint="Drag the violet point. The amber line joins two points a distance h apart (a secant). Shrink h toward 0 and watch its slope settle onto one number — that number is the derivative."
      onReset={() => { setExpr("x**2"); setX0(1); setH(1.5); setShowDeriv(false); }}
    >
      <PlotFrame xMin={xMin} xMax={xMax} yMin={-4} yMax={10} height={340} ariaLabel="A curve with a draggable point, its secant and tangent lines">
        {(m) => (
          <>
            {curvePaths(m, sampleFunction(expr, xMin, xMax, {}, 480)).map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#7c3aed" strokeWidth={2.7} />
            ))}
            {showDeriv &&
              curvePaths(m, sampleNumericDerivative(expr, xMin, xMax)).map((d, i) => (
                <path key={`d${i}`} d={d} fill="none" stroke="#059669" strokeWidth={2} strokeDasharray="6 5" />
              ))}
            {/* secant through x0 and x0+h */}
            {h !== 0 && (
              <>
                <circle cx={m.toX(x0 + h)} cy={m.toY(f(x0 + h))} r={4.5} fill="#d97706" />
                <line x1={m.toX(x0)} y1={m.toY(fx0)} x2={m.toX(x0 + h)} y2={m.toY(f(x0 + h))} stroke="#d97706" strokeWidth={3.4} opacity={0.5} />
                {tangSeg(m, secantSlope, "#d97706", "6 5")}
              </>
            )}
            {tangSeg(m, slope, "#dc2626")}
            {/* draggable point */}
            <g
              onPointerDown={dragX.handleDown}
              onPointerMove={(e) => dragX.handleMove(e, m)}
              onPointerUp={dragX.handleUp}
              style={{ cursor: "grab" }}
            >
              <circle cx={m.toX(x0)} cy={m.toY(fx0)} r={9} fill="white" stroke="#7c3aed" strokeWidth={3} />
              <text x={m.toX(x0) + 10} y={m.toY(fx0) - 12} fontSize={12.5} fontWeight={700} fill="#7c3aed">
                x₀ = {cleanNumber(x0, 3)}
              </text>
            </g>
          </>
        )}
      </PlotFrame>
      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {[
            ["x**2", "x²"], ["x**3 - 3*x", "x³ − 3x"], ["sin(x)", "sin x"], ["exp(x/2)", "e^(x/2)"],
          ].map(([e, lbl]) => (
            <button key={e} type="button" onClick={() => setExpr(e)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (expr === e ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>{lbl}</button>
          ))}
          <button type="button" onClick={() => setShowDeriv((v) => !v)}
            className={
              "ml-auto rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
              (showDeriv ? "border-success-text bg-success-bg text-success-text" : "border-border text-muted-foreground hover:text-foreground")
            }>
            {showDeriv ? "Hide f′ curve" : "Show f′ curve"}
          </button>
        </div>
        <LabSlider label="h (secant gap)" min={-2} max={2} step={0.05} value={h} onChange={setH} format={(v) => v.toFixed(2)} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "f(x₀)", value: cleanNumber(fx0, 4) },
          { label: "Secant slope", value: cleanNumber(secantSlope, 4) },
          { label: "Tangent slope f′(x₀)", value: cleanNumber(slope, 4), tone: "good" },
          { label: "Difference", value: cleanNumber(Math.abs(secantSlope - slope), 4) },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-muted/50 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
        The limit definition at work: f′(x₀) = lim<sub>h→0</sub> (f(x₀+h) − f(x₀)) / h. As h → 0 the secant slope and the
        tangent slope agree to more and more decimal places.
      </p>
    </LabShell>
  );
}

function sampleNumericDerivative(expr: string, xMin: number, xMax: number): Array<Array<{ x: number; y: number }>> {
  const pts: Array<{ x: number; y: number }> = [];
  const n = 220;
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    try {
      pts.push({ x, y: numericDerivative(expr, x) });
    } catch {
      // skip
    }
  }
  return [pts];
}

// ---------------------------------------------------------------------------

export function RiemannExplorer() {
  const [expr, setExpr] = useState("x**2");
  const [n, setN] = useState(6);
  const [rule, setRule] = useState<"left" | "right" | "mid">("left");
  const [aBound, setABound] = useState(0);
  const [bBound, setBBound] = useState(3);

  const f = (x: number) => evalExpr(expr, { x });
  const dx = (bBound - aBound) / n;
  const sum = useMemo(() => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const xl = aBound + i * dx;
      const sample = rule === "left" ? xl : rule === "right" ? xl + dx : xl + dx / 2;
      s += Math.abs(f(sample)) * dx;
    }
    return s;
  }, [expr, n, rule, aBound, bBound, dx]);
  const exact = simpsonIntegrate(expr, aBound, bBound);

  const xMin = -1, xMax = 5, yMin = -1, yMax = 10;

  return (
    <LabShell
      title="Riemann sum explorer"
      hint="Slice the area into n rectangles and add them up. More, thinner rectangles -> the staircase hugs the curve and the sum locks onto the exact area."
      onReset={() => { setExpr("x**2"); setN(6); setRule("left"); setABound(0); setBBound(3); }}
    >
      <PlotFrame xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} height={340} ariaLabel="Rectangles approximating the area under a curve">
        {(m) => (
          <>
            {Array.from({ length: n }, (_, i) => {
              const xl = aBound + i * dx;
              const sample = rule === "left" ? xl : rule === "right" ? xl + dx : xl + dx / 2;
              const y = f(sample);
              return (
                <rect key={i} x={m.toX(xl)} y={m.toY(Math.max(y, 0))} width={Math.max(m.toX(xl + dx) - m.toX(xl), 0.5)}
                  height={Math.abs(m.toY(0) - m.toY(y))}
                  fill="rgba(124,58,237,0.28)" stroke="#7c3aed" strokeWidth={1} />
              );
            })}
            {curvePaths(m, sampleFunction(expr, xMin, xMax, {}, 480)).map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#7c3aed" strokeWidth={2.7} />
            ))}
            <line x1={m.toX(aBound)} y1={m.toY(yMin)} x2={m.toX(aBound)} y2={m.toY(yMax)} stroke="#059669" strokeWidth={1.6} strokeDasharray="5 4" />
            <line x1={m.toX(bBound)} y1={m.toY(yMin)} x2={m.toX(bBound)} y2={m.toY(yMax)} stroke="#059669" strokeWidth={1.6} strokeDasharray="5 4" />
          </>
        )}
      </PlotFrame>
      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {[["x**2", "x²"], ["sin(x) + 2", "sin x + 2"], ["exp(x/2)", "e^(x/2)"], ["sqrt(x) + 1", "√x + 1"]].map(([e, lbl]) => (
            <button key={e} type="button" onClick={() => setExpr(e)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (expr === e ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>{lbl}</button>
          ))}
          <span className="mx-1 w-px bg-border" />
          {(["left", "right", "mid"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRule(r)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors " +
                (rule === r ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>{r} rule</button>
          ))}
        </div>
        <LabSlider label="n rectangles" min={1} max={80} step={1} value={n} onChange={setN} />
        <LabSlider label="from a" min={0} max={2} step={0.25} value={aBound} onChange={setABound} />
        <LabSlider label="to b" min={2} max={5} step={0.25} value={bBound} onChange={setBBound} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Rectangle sum", value: cleanNumber(sum, 5) },
          { label: "Exact area (Simpson)", value: cleanNumber(exact, 5), tone: "good" },
          { label: "Gap", value: cleanNumber(Math.abs(sum - exact), 5) },
          { label: "Width each", value: cleanNumber(dx, 5) },
        ]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

export function NewtonLab() {
  const [expr, setExpr] = useState("x**2 - 4");
  const [xs, setXs] = useState<number[]>([5]);

  const xMin = -1, xMax = 6, yMin = -6, yMax = 10;
  const current = xs[xs.length - 1];
  const f = (x: number) => evalExpr(expr, { x });
  const fp = (x: number) => numericDerivative(expr, x);
  const next = (x: number) => x - f(x) / fp(x);
  const canStep = Number.isFinite(f(current)) && Math.abs(fp(current)) > 1e-9;

  return (
    <LabShell
      title="Newton's method, one step at a time"
      hint="Each step: slide down the tangent line to where it crosses zero, and repeat. Where calculus meets computing — this is how equation solvers actually work."
      onReset={() => { setExpr("x**2 - 4"); setXs([5]); }}
    >
      <PlotFrame xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} height={340} ariaLabel="Newton's method tangent steps converging to a root">
        {(m) => (
          <>
            {curvePaths(m, sampleFunction(expr, xMin, xMax, {}, 480)).map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#7c3aed" strokeWidth={2.6} />
            ))}
            {xs.map((x, i) => {
              const s = fp(x);
              if (!Number.isFinite(s) || s === 0) return null;
              const y1 = f(x) + s * (xMin - x);
              const y2 = f(x) + s * (xMax - x);
              return (
                <g key={i}>
                  <line x1={m.toX(xMin)} y1={m.toY(y1)} x2={m.toX(xMax)} y2={m.toY(y2)} stroke="#d97706" strokeWidth={1.6} strokeDasharray="6 5" opacity={0.85 - i * 0.08} />
                  <circle cx={m.toX(x)} cy={m.toY(f(x))} r={4.5} fill="#d97706" opacity={0.5 + i * 0.08} />
                  {i > 0 && <line x1={m.toX(xs[i - 1])} y1={m.toY(0)} x2={m.toX(x)} y2={m.toY(f(x))} stroke="#059669" strokeWidth={1.4} opacity={0.7} />}
                </g>
              );
            })}
            <circle cx={m.toX(current)} cy={m.toY(f(current))} r={7} fill="white" stroke="#dc2626" strokeWidth={3} />
          </>
        )}
      </PlotFrame>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[["x**2 - 4", "x² − 4"], ["cos(x) - x", "cos x − x"], ["x**3 - x - 2", "x³ − x − 2"]].map(([e, lbl]) => (
          <button key={e} type="button" onClick={() => { setExpr(e); setXs([5]); }}
            className={
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
              (expr === e ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
            }>{lbl}</button>
        ))}
        <button type="button" disabled={!canStep} onClick={() => setXs((s) => [...s, next(s[s.length - 1])])}
          className={
            "ml-auto rounded-md px-4 py-1.5 text-xs font-bold text-white transition-colors " +
            (canStep ? "bg-violet-600 hover:bg-violet-700" : "cursor-not-allowed bg-muted text-muted-foreground")
          }>
          Take a step (x ← x − f/f′)
        </button>
        <button type="button" onClick={() => setXs([xs[0]])}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          Start over
        </button>
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Current x", value: cleanNumber(current, 6), tone: "good" },
          { label: "f(x)", value: cleanNumber(f(current), 6) },
          { label: "f′(x)", value: cleanNumber(fp(current), 6) },
          { label: "Steps taken", value: String(xs.length - 1) },
          { label: "Next x", value: canStep ? cleanNumber(next(current), 6) : "—" },
        ]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

const BOWLS: Record<string, { expr: string; label: string; note: string }> = {
  bowl: { expr: "(x - 1)**2 + (y + 1)**2 + 4", label: "Round bowl", note: "A quadratic bowl — every ML loss you will ever meet is locally shaped like this." },
  ravine: { expr: "0.2*(x - 1)**2 + 3*(y + 1)**2 + 2", label: "Narrow ravine", note: "Steep one way, gentle the other — gradients zig-zag here. Real neural networks look like this." },
  saddleish: { expr: "0.5*(x**2 - y)**2 + 0.05*(x - 1)**2 + 0.1*y**2 + 3", label: "Curved valley", note: "A non-quadratic valley: the trail curves as the local slope changes." },
};

export function GradientDescentLab() {
  const [bowlKey, setBowlKey] = useState<keyof typeof BOWLS>("bowl");
  const [lr, setLr] = useState(0.12);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([{ x: -3.4, y: 2.6 }]);
  const [running, setRunning] = useState(false);

  const bowl = BOWLS[bowlKey];
  const f = (x: number, y: number) => evalExpr(bowl.expr, { x, y });
  const cur = trail[trail.length - 1];
  const g = numericGradient2D(bowl.expr, cur.x, cur.y);
  const gn = Math.hypot(g.gx, g.gy);

  const step = () => {
    setTrail((t) => {
      const p = t[t.length - 1];
      const gg = numericGradient2D(bowl.expr, p.x, p.y);
      const nx = p.x - lr * gg.gx;
      const ny = p.y - lr * gg.gy;
      if (!Number.isFinite(nx) || !Number.isFinite(ny) || Math.abs(nx) > 50 || Math.abs(ny) > 50) return t;
      return [...t, { x: nx, y: ny }].slice(-200);
    });
  };

  // animate
  useMemo(() => {
    if (!running) return;
    const id = setInterval(() => {
      step();
    }, 260);
    const stop = () => {
      clearInterval(id);
      setRunning(false);
    };
    const t = setTimeout(stop, 30000);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [running, lr, bowlKey]);

  const dom = 4.5;
  const CELLS = 46;

  return (
    <LabShell
      title="Gradient descent playground"
      hint={bowl.note + " Pick a learning rate, then Step or Run. Too small: crawling. Too large: overshooting and bouncing out. Just right: a smooth roll to the bottom."}
      onReset={() => { setTrail([{ x: -3.4, y: 2.6 }]); setRunning(false); setLr(0.12); }}
    >
      <svg viewBox="0 0 460 400" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Contour heatmap with a gradient descent trail">
        {Array.from({ length: CELLS }, (_, i) =>
          Array.from({ length: CELLS }, (_, j) => {
            const x = -dom + ((2 * dom) / (CELLS - 1)) * i;
            const y = dom - ((2 * dom) / (CELLS - 1)) * j;
            let v: number;
            try {
              v = f(x, y);
            } catch {
              v = NaN;
            }
            if (!Number.isFinite(v)) return null;
            return <rect key={`${i}-${j}`} x={(i * 460) / CELLS} y={(j * 400) / CELLS} width={460 / CELLS + 0.5} height={400 / CELLS + 0.5} fill={heatColor(v, bowlKey)} />;
          })
        )}
        {/* axes */}
        <line x1="0" y1="200" x2="460" y2="200" stroke="white" strokeWidth="0.6" opacity="0.4" />
        <line x1="230" y1="0" x2="230" y2="400" stroke="white" strokeWidth="0.6" opacity="0.4" />
        {/* gradient arrow at current point */}
        {(() => {
          const px = ((cur.x + dom) / (2 * dom)) * 460;
          const py = ((dom - cur.y) / (2 * dom)) * 400;
          const scale = 26 / Math.max(gn, 1e-9);
          return (
            <g>
              <line x1={px} y1={py} x2={px - g.gx * scale} y2={py + g.gy * scale} stroke="white" strokeWidth={2.6} markerEnd="url(#gd-arrow)" />
              <text x={px - g.gx * scale + 6} y={py + g.gy * scale - 6} fontSize="12" fontWeight={700} fill="white">−∇f</text>
              <defs>
                <marker id="gd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="white" />
                </marker>
              </defs>
            </g>
          );
        })()}
        {/* trail */}
        {trail.map((p, i) => {
          const px = ((p.x + dom) / (2 * dom)) * 460;
          const py = ((dom - p.y) / (2 * dom)) * 400;
          const prev = i > 0 ? trail[i - 1] : null;
          const ppx = prev ? ((prev.x + dom) / (2 * dom)) * 460 : px;
          const ppy = prev ? ((dom - prev.y) / (2 * dom)) * 400 : py;
          return (
            <g key={i}>
              {prev && <line x1={ppx} y1={ppy} x2={px} y2={py} stroke="white" strokeWidth={i === trail.length - 1 ? 2 : 1} opacity={i === trail.length - 1 ? 1 : 0.55} strokeDasharray={i === trail.length - 1 ? undefined : "3 3"} />}
              {i === 0 && <circle cx={px} cy={py} r={5} fill="white" stroke="#dc2626" strokeWidth={2.5} />}
            </g>
          );
        })}
        {(() => {
          const px = ((cur.x + dom) / (2 * dom)) * 460;
          const py = ((dom - cur.y) / (2 * dom)) * 400;
          return <circle cx={px} cy={py} r={6.5} fill="#dc2626" stroke="white" strokeWidth={2.5} />;
        })()}
      </svg>
      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(BOWLS) as Array<keyof typeof BOWLS>).map((k) => (
            <button key={k} type="button" onClick={() => { setBowlKey(k); setTrail([{ x: -3.4, y: 2.6 }]); setRunning(false); }}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (bowlKey === k ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>{BOWLS[k].label}</button>
          ))}
          <button type="button" onClick={step}
            className="ml-auto rounded-md bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700">
            Step
          </button>
          <button type="button" onClick={() => setRunning((r) => !r)}
            className={
              "rounded-md px-4 py-1.5 text-xs font-bold text-white transition-colors " +
              (running ? "bg-danger-solid hover:bg-danger-solid" : "bg-success-solid hover:bg-success-solid")
            }>
            {running ? "Stop" : "Run"}
          </button>
        </div>
        <LabSlider label="Learning rate" min={0.01} max={0.9} step={0.01} value={lr} onChange={setLr} format={(v) => v.toFixed(2)} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Position (x, y)", value: `(${cleanNumber(cur.x, 3)}, ${cleanNumber(cur.y, 3)})`, tone: "good" },
          { label: "f(x, y)", value: cleanNumber(f(cur.x, cur.y), 4) },
          { label: "Gradient ∇f", value: `(${cleanNumber(g.gx, 3)}, ${cleanNumber(g.gy, 3)})` },
          { label: "‖∇f‖ (steepness)", value: cleanNumber(gn, 4) },
          { label: "Steps", value: String(trail.length - 1) },
        ]} />
      </div>
    </LabShell>
  );
}

function heatColor(v: number, bowlKey: string): string {
  // per-bowl value range normalization for stable color maps
  const ranges: Record<string, [number, number]> = {
    bowl: [4, 42],
    ravine: [2, 40],
    saddleish: [3, 40],
  };
  const [lo, hi] = ranges[bowlKey] ?? [0, 30];
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  // violet (low) -> magenta (mid) -> amber (high) — readable on both themes
  const stops: Array<[number, number[]]> = [
    [0.0, [109, 40, 217]],
    [0.45, [190, 24, 139]],
    [0.75, [217, 119, 6]],
    [1.0, [253, 224, 71]],
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b[0] - a[0] || 1;
  const k = (t - a[0]) / span;
  const c = a[1].map((x, i) => Math.round(x + k * (b[1][i] - x)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
