"use client";

/**
 * stats-viz.tsx — the Statistics collection:
 *
 *   HistogramViz            bins, count/density, mean & median markers
 *   BoxPlotViz              five-number summary; points you add and drag
 *   DistributionViz         pmf/pdf + cdf of six named distributions
 *   NormalViz               μ, σ, shaded probability, the 68–95–99.7 rule
 *   SamplingViz             population → sample means; the CLT, live
 *   ConfidenceViz           many intervals; coverage vs the nominal level
 *   HypothesisViz           z/t test built from its parts; p-value logic
 *   CorrelationViz          Pearson r on points you can drag away
 *   RegressionViz           OLS line, residuals, literal squared residuals
 *   ProbabilityViz          coin/die/urn experiments; empirical → theory
 *
 * Every number comes from src/lib/viz/stats.ts (machine-checked).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  C,
  Legend,
  Plane,
  Readouts,
  Seg,
  ToggleChip,
  VizButton,
  VizCard,
  VizSlider,
  fmtNum,
  fmtSigned,
  usePlaneDrag,
} from "./core";
import {
  binomialCdf,
  binomialPmf,
  ciForMean,
  drawFromPopulation,
  exponentialCdf,
  exponentialPdf,
  fiveNumber,
  geometricPmf,
  histogram,
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
  rint,
  rbivariateNormal,
  rnorm,
  sd,
  tQuantile,
  uniformCdf,
  uniformPdf,
  type PopulationShape,
  type Rng,
} from "@/lib/viz/stats";

// ---------------------------------------------------------------------------
// Shared datasets for the descriptive plots
// ---------------------------------------------------------------------------

const TEACH_SETS: Array<{ id: string; label: string; unit: string; data: number[]; blurb: string }> = [
  {
    id: "exam",
    label: "Exam scores (n = 60)",
    unit: "points",
    blurb: "Two humps: one group prepared, one did not.",
    data: [
      42, 45, 47, 48, 51, 52, 53, 54, 55, 55, 56, 57, 58, 58, 59, 60, 60, 61, 62, 62, 63, 63, 64, 64, 65,
      71, 72, 73, 74, 74, 75, 75, 76, 76, 77, 77, 78, 78, 79, 79, 80, 80, 81, 81, 82, 82, 83, 84, 84, 85,
      85, 86, 87, 88, 88, 89, 90, 91, 92, 94,
    ],
  },
  {
    id: "rent",
    label: "Monthly rents (n = 48)",
    unit: "currency",
    blurb: "Right-skewed: a long tail of expensive flats pulls the mean above the median.",
    data: [
      420, 445, 460, 470, 480, 490, 495, 505, 510, 515, 520, 525, 530, 535, 540, 545, 550, 555, 560, 565,
      570, 575, 580, 585, 590, 600, 610, 620, 630, 645, 660, 680, 700, 720, 750, 790, 830, 890, 950, 1030,
      1120, 1240, 1380, 1550, 1750, 1980, 2240, 2600,
    ],
  },
  {
    id: "height",
    label: "Student heights (n = 40)",
    unit: "cm",
    blurb: "Roughly symmetric — the classic bell.",
    data: [
      152, 155, 157, 158, 159, 160, 161, 162, 162, 163, 164, 164, 165, 165, 166, 166, 167, 167, 168, 168,
      169, 169, 170, 170, 171, 171, 172, 172, 173, 174, 175, 175, 176, 177, 178, 179, 180, 182, 184, 187,
    ],
  },
  {
    id: "commute",
    label: "Commute times (n = 36)",
    unit: "min",
    blurb: "Unimodal with a light right tail.",
    data: [
      8, 10, 11, 12, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22,
      23, 23, 24, 25, 26, 28, 30, 33, 37, 42, 51,
    ],
  },
];

// ===========================================================================
// 14. Histogram
// ===========================================================================

export function HistogramViz() {
  const [dsId, setDsId] = useState(TEACH_SETS[0].id);
  const [bins, setBins] = useState(10);
  const [density, setDensity] = useState(false);
  const ds = TEACH_SETS.find((d) => d.id === dsId) ?? TEACH_SETS[0];
  const data = ds.data;
  const hist = useMemo(() => histogram(data, bins), [data, bins]);
  const mu = mean(data);
  const med = quantile([...data].sort((a, b) => a - b), 0.5);
  const s = sd(data);
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const pad = (hi - lo) * 0.06;
  const [hoverBin, setHoverBin] = useState<number | null>(null);
  const maxBar = Math.max(...hist.map((b) => (density ? b.density : b.count)), 1);

  return (
    <VizCard
      title="Histograms"
      subtitle="Bin the data, choose count or density, and see how the mean and median react to shape."
      domain="stats"
      explanation={
        <>
          Every observation lands in exactly one bin — the bars must therefore have equal widths and the vertical
          axis starts at zero. In a <strong>right-skewed</strong> distribution (try the rents) the mean sits above the
          median: the expensive tail drags it. Bin count is a real choice: too few bins hide structure, too many
          turn signal into noise.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {TEACH_SETS.map((d) => (
              <button
                key={d.id}
                type="button"
                title={d.blurb}
                onClick={() => setDsId(d.id)}
                className={
                  "rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (dsId === d.id ? "border-viz-9/60 bg-viz-9/10 text-viz-9" : "border-border-subtle text-ink-3 hover:text-ink")
                }
              >
                {d.label}
              </button>
            ))}
          </div>
          <VizSlider label="bins" value={bins} min={4} max={24} step={1} onChange={setBins} format={(v) => String(v)} accent="accent-viz-9" />
          <ToggleChip active={density} onClick={() => setDensity((v) => !v)}>
            {density ? "Density scale" : "Count scale"}
          </ToggleChip>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "n", value: String(data.length) },
            { label: "Mean x̄", value: fmtNum(mu, 1), tone: "accent" },
            { label: "Median", value: fmtNum(med, 1) },
            { label: "Sample sd s", value: fmtNum(s, 1) },
          ]}
        />
      }
    >
      <Plane
        xMin={lo - pad}
        xMax={hi + pad}
        yMin={0}
        yMax={maxBar * 1.18}
        xLabel={ds.unit}
        yLabel={density ? "density" : "count"}
        ariaLabel={`Histogram of ${ds.label} with ${bins} bins`}
      >
        {(m) => (
          <>
            {hist.map((b, i) => {
              const h = density ? b.density : b.count;
              const x0 = m.toX(b.from);
              const x1 = m.toX(b.to);
              const yTop = m.toY(h);
              const y0 = m.toY(0);
              return (
                <g key={i} onMouseEnter={() => setHoverBin(i)} onMouseLeave={() => setHoverBin(null)}>
                  <rect
                    x={x0 + 0.6}
                    y={yTop}
                    width={Math.max(0.8, x1 - x0 - 1.2)}
                    height={y0 - yTop}
                    fill={hoverBin === i ? C.cyan : C.indigo}
                    fillOpacity={hoverBin === i ? 0.85 : 0.62}
                    stroke={C.indigo}
                    strokeWidth={1}
                  />
                  <rect x={x0} y={Math.max(0, yTop - 300)} width={x1 - x0} height={600} fill="transparent" />
                </g>
              );
            })}
            {/* mean & median markers */}
            <line x1={m.toX(mu)} y1={m.toY(0)} x2={m.toX(mu)} y2={m.toY(maxBar * 1.1)} stroke={C.rose} strokeWidth={2.2} />
            <text x={m.toX(mu) + 5} y={m.toY(maxBar * 1.1) + 4} className="text-[10.5px] font-bold" fill={C.rose}>mean {fmtNum(mu, 1)}</text>
            <line x1={m.toX(med)} y1={m.toY(0)} x2={m.toX(med)} y2={m.toY(maxBar * 1.02)} stroke={C.green} strokeWidth={2.2} strokeDasharray="5 3" />
            <text x={m.toX(med) - 5} y={m.toY(maxBar * 1.02) - 6} textAnchor="end" className="text-[10.5px] font-bold" fill={C.green}>median {fmtNum(med, 1)}</text>
            {hoverBin !== null && (
              <text x={m.toX((hist[hoverBin].from + hist[hoverBin].to) / 2)} y={m.toY(maxBar * 1.16)} textAnchor="middle" className="text-[10.5px] font-mono font-bold" fill={C.cyan}>
                [{fmtNum(hist[hoverBin].from, 0)}, {fmtNum(hist[hoverBin].to, 0)}) → {hist[hoverBin].count}
              </text>
            )}
          </>
        )}
      </Plane>
      <Legend
        className="mt-3"
        items={[
          { color: C.indigo, label: "bin (hover for range & count)" },
          { color: C.rose, label: "mean" },
          { color: C.green, label: "median", dashed: true },
        ]}
      />
    </VizCard>
  );
}

// ===========================================================================
// 15. Box plot — with points you add and drag
// ===========================================================================

export function BoxPlotViz() {
  const [points, setPoints] = useState<number[]>([12, 14, 15, 15, 16, 17, 18, 18, 19, 21, 24, 28]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const fn = fiveNumber(points);
  const lo = Math.min(...points) - 2;
  const hi = Math.max(...points) + 2;
  const drag = usePlaneDrag((x) => {
    if (dragIdx !== null) {
      setPoints((ps) => ps.map((v, i) => (i === dragIdx ? Math.max(lo, Math.min(hi, x)) : v)));
    }
  });

  const boxTopY = 0.78;
  const boxBotY = 0.22;
  const toX = (v: number, m: { toX: (x: number) => number }) => m.toX(v);
  const yPix = (frac: number, m: { H: number }) => m.H * frac;

  // whisker ends: most extreme points inside the fences
  const inside = points.filter((v) => v >= fn.lowerFence && v <= fn.upperFence);
  const wLo = inside.length ? Math.min(...inside) : fn.median;
  const wHi = inside.length ? Math.max(...inside) : fn.median;

  return (
    <VizCard
      title="Box plots & the five-number summary"
      subtitle="Drag points along the line (or click empty space to add one). The box, whiskers and outliers recompute instantly."
      domain="stats"
      explanation={
        <>
          The box spans the <strong>interquartile range</strong> Q1→Q3 (the middle 50% of the data) with the median
          marked inside. Whiskers stretch to the furthest point within <strong>1.5 × IQR</strong> of the box — the
          fences. Anything beyond is drawn as an individual outlier dot. Drag a point far right and watch it detach.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <VizButton onClick={() => setPoints([12, 14, 15, 15, 16, 17, 18, 18, 19, 21, 24, 28])}>Reset points</VizButton>
          <span className="text-[11px] text-ink-3">
            {hoverIdx !== null ? `point ${hoverIdx + 1}: ${fmtNum(points[hoverIdx], 1)}` : "click the line to add a point · drag any point"}
          </span>
        </div>
      }
      readouts={
        <Readouts
          items={[
            { label: "Min", value: fmtNum(fn.min, 1) },
            { label: "Q1", value: fmtNum(fn.q1, 1) },
            { label: "Median", value: fmtNum(fn.median, 1), tone: "accent" },
            { label: "Q3", value: fmtNum(fn.q3, 1) },
            { label: "Max", value: fmtNum(fn.max, 1) },
          ]}
        />
      }
      footer={
        <div className="border-t border-border-subtle bg-surface-inset px-5 py-3 font-mono text-[12px] text-ink-2">
          IQR = Q3 − Q1 = {fmtNum(fn.iqr, 2)} · fences at Q1 − 1.5·IQR = {fmtNum(fn.lowerFence, 2)} and Q3 + 1.5·IQR ={" "}
          {fmtNum(fn.upperFence, 2)} · outliers: {fn.outlierIdx.length ? fn.outlierIdx.map((i) => fmtNum(points[i], 1)).join(", ") : "none"}
        </div>
      }
    >
      <Plane
        xMin={lo}
        xMax={hi}
        yMin={-0.55}
        yMax={1.55}
        aspect={16 / 6}
        xLabel="value"
        ariaLabel="Box plot with draggable data points"
      >
        {(m) => (
          <>
            {/* box */}
            <rect
              x={toX(fn.q1, m)}
              y={yPix(boxTopY, m)}
              width={Math.max(0, toX(fn.q3, m) - toX(fn.q1, m))}
              height={yPix(boxTopY, m) - yPix(boxBotY, m)}
              fill={C.indigo}
              fillOpacity={0.2}
              stroke={C.indigo}
              strokeWidth={2}
            />
            {/* median */}
            <line x1={toX(fn.median, m)} y1={yPix(boxTopY, m)} x2={toX(fn.median, m)} y2={yPix(boxBotY, m)} stroke={C.rose} strokeWidth={3.4} />
            {/* whiskers */}
            <line x1={toX(wLo, m)} y1={yPix(0.5, m)} x2={toX(fn.q1, m)} y2={yPix(0.5, m)} stroke={C.indigo} strokeWidth={2} />
            <line x1={toX(fn.q3, m)} y1={yPix(0.5, m)} x2={toX(wHi, m)} y2={yPix(0.5, m)} stroke={C.indigo} strokeWidth={2} />
            <line x1={toX(wLo, m)} y1={yPix(0.42, m)} x2={toX(wLo, m)} y2={yPix(0.58, m)} stroke={C.indigo} strokeWidth={2} />
            <line x1={toX(wHi, m)} y1={yPix(0.42, m)} x2={toX(wHi, m)} y2={yPix(0.58, m)} stroke={C.indigo} strokeWidth={2} />
            {/* fences */}
            <line x1={toX(fn.lowerFence, m)} y1={yPix(0.3, m)} x2={toX(fn.lowerFence, m)} y2={yPix(0.7, m)} stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
            <line x1={toX(fn.upperFence, m)} y1={yPix(0.3, m)} x2={toX(fn.upperFence, m)} y2={yPix(0.7, m)} stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
            <text x={toX(fn.lowerFence, m)} y={yPix(0.74, m) + 12} textAnchor="middle" className="text-[9.5px] font-bold" fill={C.amber}>fence</text>
            <text x={toX(fn.upperFence, m)} y={yPix(0.74, m) + 12} textAnchor="middle" className="text-[9.5px] font-bold" fill={C.amber}>fence</text>
            {/* points (draggable) */}
            {points.map((v, i) => {
              const out = fn.outlierIdx.includes(i);
              const isDragging = dragIdx === i;
              return (
                <g
                  key={i}
                  className="dv-handle"
                  onPointerDown={(e) => {
                    setDragIdx(i);
                    drag.handleDown(e);
                  }}
                  onPointerMove={(e) => {
                    setHoverIdx(i);
                    drag.handleMove(e, m);
                  }}
                  onPointerUp={() => {
                    setDragIdx(null);
                    drag.handleUp();
                  }}
                  onFocus={() => setDragIdx(i)}
                  onKeyDown={(e) => drag.handleKeys(e, m, () => ({ x: v, y: 0 }))}
                  tabIndex={0}
                  role="button"
                  aria-label={`Data point ${i + 1}, value ${fmtNum(v, 1)} — drag, or use the arrow keys to move`}
                  onPointerLeave={() => setHoverIdx(null)}
                  style={{ cursor: "grab" }}
                >
                  <circle cx={toX(v, m)} cy={yPix(1.28, m)} r={16} fill="transparent" />
                  <circle
                    cx={toX(v, m)}
                    cy={yPix(1.28, m)}
                    r={isDragging ? 8 : 6}
                    fill={out ? C.amber : C.cyan}
                    fillOpacity={out ? 1 : 0.85}
                    stroke="var(--color-canvas, #fff)"
                    strokeWidth={1.6}
                  />
                </g>
              );
            })}
            {/* click-to-add strip */}
            <rect
              x={0}
              y={yPix(1.28, m) - 26}
              width={m.W}
              height={52}
              fill="transparent"
              style={{ cursor: "copy" }}
              onPointerDown={(e) => {
                if (dragIdx !== null) return;
                const svg = (e.currentTarget as Element).closest("svg");
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * m.W;
                setPoints((ps) => [...ps, m.fromX(px)]);
              }}
            />
            <text x={m.W - 8} y={yPix(1.28, m) - 34} textAnchor="end" className="text-[9.5px] font-semibold opacity-50">← data points (drag) · amber = outlier</text>
          </>
        )}
      </Plane>
    </VizCard>
  );
}

// ===========================================================================
// 16. Probability distributions
// ===========================================================================

type DistId = "uniform" | "bernoulli" | "binomial" | "geometric" | "poisson" | "exponential";

interface DistState {
  uniform: { lo: number; hi: number };
  binomial: { n: number; p: number };
  geometric: { p: number };
  poisson: { lambda: number };
  exponential: { rate: number };
}

export function DistributionViz() {
  const [dist, setDist] = useState<DistId>("binomial");
  const [st, setSt] = useState<DistState>({
    uniform: { lo: 0, hi: 10 },
    binomial: { n: 12, p: 0.4 },
    geometric: { p: 0.3 },
    poisson: { lambda: 3 },
    exponential: { rate: 1 },
  });
  const [hoverK, setHoverK] = useState<number | null>(null);

  const discrete = dist === "bernoulli" || dist === "binomial" || dist === "geometric" || dist === "poisson";

  const model = useMemo(() => {
    switch (dist) {
      case "uniform": {
        const { lo, hi } = st.uniform;
        return {
          kind: "cont" as const,
          xMin: lo - 1,
          xMax: hi + 1,
          pdf: (x: number) => uniformPdf(x, lo, hi),
          cdf: (x: number) => uniformCdf(x, lo, hi),
          mean: (lo + hi) / 2,
          variance: ((hi - lo) ** 2) / 12,
          xLabel: "x",
        };
      }
      case "bernoulli":
        return {
          kind: "disc" as const,
          ks: [0, 1],
          pmf: (k: number) => (k === 1 ? st.binomial.p : 1 - st.binomial.p),
          cdf: (k: number) => (k >= 1 ? 1 : k === 0 ? 1 - st.binomial.p : 0),
          mean: st.binomial.p,
          variance: st.binomial.p * (1 - st.binomial.p),
          xLabel: "outcome (0/1)",
          barLabels: ["failure (0)", "success (1)"],
        };
      case "binomial": {
        const { n, p } = st.binomial;
        return {
          kind: "disc" as const,
          ks: Array.from({ length: n + 1 }, (_, i) => i),
          pmf: (k: number) => binomialPmf(k, n, p),
          cdf: (k: number) => binomialCdf(k, n, p),
          mean: n * p,
          variance: n * p * (1 - p),
          xLabel: `successes out of n = ${n}`,
          barLabels: null,
        };
      }
      case "geometric": {
        const { p } = st.geometric;
        const ks = Array.from({ length: 15 }, (_, i) => i);
        return {
          kind: "disc" as const,
          ks,
          pmf: (k: number) => geometricPmf(k, p),
          cdf: (k: number) => ks.filter((kk) => kk <= k).reduce((s, kk) => s + geometricPmf(kk, p), 0),
          mean: (1 - p) / p,
          variance: (1 - p) / (p * p),
          xLabel: "failures before first success",
          barLabels: null,
        };
      }
      case "poisson": {
        const { lambda } = st.poisson;
        const ks = Array.from({ length: Math.max(12, Math.ceil(lambda * 2.5) + 4) }, (_, i) => i);
        return {
          kind: "disc" as const,
          ks,
          pmf: (k: number) => poissonPmf(k, lambda),
          cdf: (k: number) => poissonCdf(k, lambda),
          mean: lambda,
          variance: lambda,
          xLabel: "events per interval, k",
          barLabels: null,
        };
      }
      case "exponential": {
        const { rate } = st.exponential;
        return {
          kind: "cont" as const,
          xMin: 0,
          xMax: Math.min(12, 6 / rate),
          pdf: (x: number) => exponentialPdf(x, rate),
          cdf: (x: number) => exponentialCdf(x, rate),
          mean: 1 / rate,
          variance: 1 / (rate * rate),
          xLabel: "waiting time",
        };
      }
    }
  }, [dist, st]);

  const maxPdf = Math.max(
    ...(model.kind === "disc" ? model.ks.map((k) => model.pmf(k)) : samplePdf(model.pdf, model.xMin, model.xMax)),
    0.0001,
  );
  const meanLabel = model.kind === "disc" ? "E[X] = Σ k·P(k)" : "E[X] = ∫ x·f(x) dx";

  return (
    <VizCard
      title="Probability distributions"
      subtitle="Pick a family, bend its parameters, and read the mass or density — plus the mean and variance it implies."
      domain="stats"
      explanation={
        <>
          Discrete families (bars) assign probability to exact values — <strong>P(X = k)</strong> — and their bars sum
          to 1. Continuous families (curves) assign probability to <em>intervals</em>: the density f(x) can exceed 1,
          but the area under it is always 1. The dashed vertical line marks E[X]; the variance governs the spread
          around it.
        </>
      }
      controls={
        <>
          <Seg
            value={dist}
            onChange={(v) => setDist(v)}
            options={[
              { value: "binomial", label: "Binomial" },
              { value: "poisson", label: "Poisson" },
              { value: "geometric", label: "Geometric" },
              { value: "bernoulli", label: "Bernoulli" },
              { value: "uniform", label: "Uniform" },
              { value: "exponential", label: "Exponential" },
            ]}
          />
          {dist === "binomial" && (
            <>
              <VizSlider label="trials n" symbol="n" value={st.binomial.n} min={2} max={30} step={1} onChange={(n) => setSt((s) => ({ ...s, binomial: { ...s.binomial, n } }))} format={(v) => String(v)} />
              <VizSlider label="success probability" symbol="p" value={st.binomial.p} min={0.05} max={0.95} step={0.05} onChange={(p) => setSt((s) => ({ ...s, binomial: { ...s.binomial, p } }))} format={(v) => v.toFixed(2)} />
            </>
          )}
          {dist === "poisson" && (
            <VizSlider label="rate λ (mean events)" symbol="λ" value={st.poisson.lambda} min={0.5} max={12} step={0.5} onChange={(lambda) => setSt((s) => ({ ...s, poisson: { ...s.poisson, lambda } }))} format={(v) => fmtNum(v, 1)} />
          )}
          {dist === "geometric" && (
            <VizSlider label="success probability" symbol="p" value={st.geometric.p} min={0.05} max={0.9} step={0.05} onChange={(p) => setSt((s) => ({ ...s, geometric: { ...s.geometric, p } }))} format={(v) => v.toFixed(2)} />
          )}
          {dist === "bernoulli" && (
            <VizSlider label="success probability" symbol="p" value={st.binomial.p} min={0.05} max={0.95} step={0.05} onChange={(p) => setSt((s) => ({ ...s, binomial: { ...s.binomial, p } }))} format={(v) => v.toFixed(2)} />
          )}
          {dist === "uniform" && (
            <>
              <VizSlider label="lower bound" symbol="a" value={st.uniform.lo} min={-8} max={8} step={0.5} onChange={(lo) => setSt((s) => ({ ...s, uniform: { ...s.uniform, lo } }))} format={(v) => fmtNum(v, 1)} />
              <VizSlider label="upper bound" symbol="b" value={st.uniform.hi} min={-8} max={16} step={0.5} onChange={(hi) => setSt((s) => ({ ...s, uniform: { ...s.uniform, hi } }))} format={(v) => fmtNum(v, 1)} />
            </>
          )}
          {dist === "exponential" && (
            <VizSlider label="rate λ (events/time)" symbol="λ" value={st.exponential.rate} min={0.2} max={4} step={0.1} onChange={(rate) => setSt((s) => ({ ...s, exponential: { ...s.exponential, rate } }))} format={(v) => v.toFixed(1)} />
          )}
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Mean E[X]", value: fmtNum(model.mean, 3), tone: "accent" },
            { label: "Variance Var[X]", value: fmtNum(model.variance, 3) },
            { label: "sd σ", value: fmtNum(Math.sqrt(model.variance), 3) },
            { label: "Type", value: discrete ? "discrete (pmf)" : "continuous (pdf)", mono: false },
          ]}
        />
      }
      footer={
        <div className="border-t border-border-subtle bg-surface-inset px-5 py-3 text-[12px] leading-relaxed text-ink-2">
          {meanLabel}. {hoverK !== null && model.kind === "disc" && (
            <span className="font-mono">
              {" "}P(X = {hoverK}) = {fmtNum(model.pmf(hoverK), 4)} · P(X ≤ {hoverK}) = {fmtNum(model.cdf(hoverK), 4)}
            </span>
          )}
          {hoverK !== null && model.kind === "cont" && (
            <span className="font-mono">
              {" "}f({fmtNum(hoverK, 2)}) = {fmtNum(model.pdf(hoverK), 4)} · P(X ≤ {fmtNum(hoverK, 2)}) = {fmtNum(model.cdf(hoverK), 4)}
            </span>
          )}
          {hoverK === null && <span className="text-ink-3"> Hover the plot to read point probabilities and cumulative values.</span>}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* pmf/pdf */}
        <Plane
          xMin={model.kind === "disc" ? -0.7 : model.xMin}
          xMax={model.kind === "disc" ? Math.max(...model.ks) + 0.7 : model.xMax}
          yMin={0}
          yMax={maxPdf * 1.15}
          xLabel={model.xLabel}
          yLabel={discrete ? "P(X = k)" : "density f(x)"}
          ariaLabel="Probability mass or density function"
        >
          {(m) => (
            <>
              {model.kind === "disc"
                ? model.ks.map((k) => {
                    const p = model.pmf(k);
                    const x0 = m.toX(k - 0.38);
                    const x1 = m.toX(k + 0.38);
                    return (
                      <g key={k} onPointerEnter={() => setHoverK(k)} onPointerLeave={() => setHoverK(null)}>
                        <rect
                          x={x0}
                          y={m.toY(p)}
                          width={Math.max(1, x1 - x0)}
                          height={m.toY(0) - m.toY(p)}
                          fill={hoverK === k ? C.cyan : C.indigo}
                          fillOpacity={hoverK === k ? 0.9 : 0.68}
                          stroke={C.indigo}
                        />
                        <rect x={x0 - 4} y={m.toY(maxPdf * 1.15)} width={x1 - x0 + 8} height={m.toY(0) - m.toY(maxPdf * 1.15)} fill="transparent" />
                      </g>
                    );
                  })
                : samplePoints(model.pdf, model.xMin, model.xMax, 300).map((seg, i) => (
                    <path key={i} d={segToPath(m, seg)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
                  ))}
              <line x1={m.toX(model.mean)} y1={m.toY(0)} x2={m.toX(model.mean)} y2={m.toY(maxPdf * 1.08)} stroke={C.rose} strokeWidth={2} strokeDasharray="6 4" />
              <text x={m.toX(model.mean) + 6} y={m.toY(maxPdf * 1.08) - 4} className="text-[10.5px] font-bold" fill={C.rose}>E[X]</text>
            </>
          )}
        </Plane>
        {/* cdf */}
        <Plane
          xMin={model.kind === "disc" ? -0.7 : model.xMin}
          xMax={model.kind === "disc" ? Math.max(...model.ks) + 0.7 : model.xMax}
          yMin={0}
          yMax={1.08}
          xLabel={model.xLabel}
          yLabel="P(X ≤ x)"
          ariaLabel="Cumulative distribution function"
        >
          {(m) =>
            model.kind === "disc" ? (
              <>
                {model.ks.map((k) => {
                  const nextK = model.ks.includes(k + 1) ? k + 1 : k + 1;
                  return (
                    <g key={k}>
                      <line x1={m.toX(k)} y1={m.toY(model.cdf(k))} x2={m.toX(nextK)} y2={m.toY(model.cdf(k))} stroke={C.green} strokeWidth={2.4} />
                      <circle cx={m.toX(k)} cy={m.toY(model.cdf(k))} r={3} fill={C.green} />
                    </g>
                  );
                })}
                <line x1={m.toX(model.mean)} y1={m.toY(0)} x2={m.toX(model.mean)} y2={m.toY(1.02)} stroke={C.rose} strokeWidth={1.6} strokeDasharray="6 4" />
              </>
            ) : (
              <>
                <path d={segToPath(m, samplePoints(model.cdf, model.xMin, model.xMax, 300)[0] ?? [])} fill="none" stroke={C.green} strokeWidth={2.6} />
                <line x1={m.toX(model.mean)} y1={m.toY(0)} x2={m.toX(model.mean)} y2={m.toY(1.02)} stroke={C.rose} strokeWidth={1.6} strokeDasharray="6 4" />
              </>
            )
          }
        </Plane>
      </div>
      <Legend className="mt-3" items={[{ color: C.indigo, label: "pmf / pdf" }, { color: C.green, label: "cdf (right)" }, { color: C.rose, label: "mean", dashed: true }]} />
    </VizCard>
  );
}

function samplePdf(f: (x: number) => number, a: number, b: number, n = 200): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(f(a + ((b - a) * i) / n));
  return out;
}

function samplePoints(f: (x: number) => number, a: number, b: number, n: number): Array<Array<{ x: number; y: number }>> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = f(x);
    if (Number.isFinite(y)) pts.push({ x, y });
  }
  return [pts];
}

function segToPath(m: { toX: (x: number) => number; toY: (y: number) => number }, seg: Array<{ x: number; y: number }>): string {
  return seg.map((p, i) => `${i === 0 ? "M" : "L"} ${m.toX(p.x).toFixed(2)} ${m.toY(p.y).toFixed(2)}`).join(" ");
}

// ===========================================================================
// 17. Normal distribution
// ===========================================================================

export function NormalViz() {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [a, setA] = useState(-1.96);
  const [b, setB] = useState(1.96);
  const [showRule, setShowRule] = useState(false);
  const xMin = Math.min(mu - 4 * sigma, -8);
  const xMax = Math.max(mu + 4 * sigma, 8);
  const peak = normalPdf(mu, mu, sigma);
  const yMax = peak * 1.22;
  const prob = normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma);
  const zA = (a - mu) / sigma;
  const zB = (b - mu) / sigma;

  const shade = (m: { toX: (x: number) => number; toY: (y: number) => number }) => {
    const steps = 120;
    const pts: string[] = [`M ${m.toX(a)} ${m.toY(0)}`];
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      pts.push(`L ${m.toX(x)} ${m.toY(normalPdf(x, mu, sigma))}`);
    }
    pts.push(`L ${m.toX(b)} ${m.toY(0)} Z`);
    return pts.join(" ");
  };

  return (
    <VizCard
      title="The normal distribution"
      subtitle="Slide μ to move the bell, σ to widen it, and drag the bounds to measure any probability under the curve."
      domain="stats"
      explanation={
        <>
          P(a &lt; X &lt; b) is the <strong>area</strong> under the density between the bounds — computed here with the
          error function, to four decimals. The z-scores re-express the bounds in standard deviations from the mean:
          z = (x − μ)/σ. Toggle the empirical rule to see the famous 68–95–99.7 split.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showRule} onClick={() => setShowRule((v) => !v)}>68–95–99.7 rule</ToggleChip>
          </div>
          <VizSlider label="mean (centre)" symbol="μ" value={mu} min={-4} max={4} step={0.1} onChange={setMu} format={(v) => fmtSigned(v, 1)} />
          <VizSlider label="standard deviation (width)" symbol="σ" value={sigma} min={0.4} max={3} step={0.05} onChange={setSigma} format={(v) => fmtNum(v, 2)} />
          <VizSlider label="lower bound" symbol="a" value={a} min={-9} max={9} step={0.02} onChange={setA} format={(v) => fmtNum(v, 2)} />
          <VizSlider label="upper bound" symbol="b" value={b} min={-9} max={9} step={0.02} onChange={setB} format={(v) => fmtNum(v, 2)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "P(a < X < b)", value: prob.toFixed(4), tone: "accent" },
            { label: "z-score of a", value: fmtNum(zA, 3) },
            { label: "z-score of b", value: fmtNum(zB, 3) },
            { label: "peak height f(μ)", value: fmtNum(peak, 4) },
          ]}
        />
      }
    >
      <Plane xMin={xMin} xMax={xMax} yMin={0} yMax={yMax} xLabel="x (second row: z)" yLabel="density f(x)" ariaLabel="Normal density curve with shaded probability region">
        {(m) => {
          const curve = samplePoints((x) => normalPdf(x, mu, sigma), xMin, xMax, 300)[0] ?? [];
          return (
            <>
              {/* empirical rule bands */}
              {showRule &&
                [
                  { k: 1, op: 0.10, lbl: "68.3%" },
                  { k: 2, op: 0.06, lbl: "95.4%" },
                  { k: 3, op: 0.035, lbl: "99.7%" },
                ].map((band) => (
                  <rect
                    key={band.k}
                    x={m.toX(mu - band.k * sigma)}
                    y={m.toY(peak * (1.05 + 0.13 * band.k))}
                    width={m.toX(mu + band.k * sigma) - m.toX(mu - band.k * sigma)}
                    height={Math.max(2, m.toY(0) - m.toY(peak * (1.05 + 0.13 * band.k)))}
                    fill={C.green}
                    fillOpacity={band.op}
                    stroke={C.green}
                    strokeOpacity={0.35}
                  />
                ))}
              {/* shaded probability */}
              <path d={shade(m)} fill={C.cyan} fillOpacity={0.4} stroke="none" />
              <path d={segToPath(m, curve)} fill="none" stroke={C.indigo} strokeWidth={2.8} />
              <line x1={m.toX(a)} y1={m.toY(0)} x2={m.toX(a)} y2={m.toY(peak * 1.02)} stroke={C.rose} strokeWidth={1.8} strokeDasharray="4 3" />
              <line x1={m.toX(b)} y1={m.toY(0)} x2={m.toX(b)} y2={m.toY(peak * 1.02)} stroke={C.rose} strokeWidth={1.8} strokeDasharray="4 3" />
              <text x={m.toX((a + b) / 2)} y={m.toY(peak * 0.45)} textAnchor="middle" className="text-[11.5px] font-bold" fill={C.cyan}>
                {prob.toFixed(4)}
              </text>
              {/* mu marker */}
              <line x1={m.toX(mu)} y1={m.toY(0)} x2={m.toX(mu)} y2={m.toY(peak)} stroke={C.slate} strokeWidth={1.2} strokeDasharray="2 3" />
              {/* z-axis second row */}
              {[-3, -2, -1, 0, 1, 2, 3].map((z) => {
                const x = mu + z * sigma;
                if (x < xMin || x > xMax) return null;
                return (
                  <text key={z} x={m.toX(x)} y={m.toY(0) + 26} textAnchor="middle" className="fill-current text-[9.5px] font-mono opacity-50">
                    {z > 0 ? `+${z}σ` : z === 0 ? "0" : `${z}σ`}
                  </text>
                );
              })}
            </>
          );
        }}
      </Plane>
      <Legend className="mt-3" items={[{ color: C.indigo, label: `N(μ = ${fmtNum(mu, 1)}, σ = ${fmtNum(sigma, 2)}) density` }, { color: C.cyan, label: "P(a < X < b) — the area" }, { color: C.rose, label: "bounds a, b", dashed: true }, ...(showRule ? [{ color: C.green, label: "±1σ · ±2σ · ±3σ bands" }] : [])]} />
    </VizCard>
  );
}

// ===========================================================================
// 18. Sampling distribution / CLT
// ===========================================================================

export function SamplingViz() {
  const [shape, setShape] = useState<PopulationShape>("right-skew");
  const [n, setN] = useState(20);
  const [means, setMeans] = useState<number[]>([]);
  const [seed, setSeed] = useState(42);
  const rngRef = useRef<Rng>(mulberry32(42));
  const batchRef = useRef<number | null>(null);

  const LO = 0;
  const HI = 24;
  const moments = populationMoments(shape, LO, HI);
  const se = moments.sigma / Math.sqrt(n);

  /** Reset the run: new rng from the seed, empty mean pile. Called by every
   * control that changes the sampling setup. */
  const resetRun = useCallback(
    (nextSeed: number) => {
      rngRef.current = mulberry32(nextSeed);
      setMeans([]);
    },
    [],
  );

  const drawBatch = useCallback(
    (count: number) => {
      setMeans((prev) => {
        const rng = rngRef.current;
        const next = [...prev];
        for (let i = 0; i < count && next.length < 20000; i++) {
          let s = 0;
          for (let j = 0; j < n; j++) s += drawFromPopulation(rng, shape, LO, HI);
          next.push(s / n);
        }
        return next;
      });
    },
    [shape, n],
  );

  // cancel any pending batch on unmount / param change
  useEffect(() => () => { if (batchRef.current !== null) cancelAnimationFrame(batchRef.current); }, []);

  const drawMany = (total: number) => {
    const chunk = 200;
    let done = 0;
    const step = () => {
      drawBatch(Math.min(chunk, total - done));
      done += chunk;
      if (done < total) batchRef.current = requestAnimationFrame(step);
      else batchRef.current = null;
    };
    step();
  };

  const meansMean = means.length ? mean(means) : NaN;
  const meansSd = means.length > 1 ? sd(means) : NaN;
  const popCurve = samplePoints((x) => populationPdf(shape, x, LO, HI), LO, HI, 240)[0] ?? [];
  const popMax = Math.max(...popCurve.map((p) => p.y), 0.001);
  const sampHist = useMemo(() => histogram(means, 34), [means]);
  const sampMax = Math.max(...sampHist.map((h) => h.density), 0.001);

  return (
    <VizCard
      title="Sampling distributions & the Central Limit Theorem"
      subtitle="Draw samples from a lopsided population, average each one, and watch the pile of averages turn normal — regardless of the population's shape."
      domain="stats"
      explanation={
        <>
          Each click of <strong>Draw</strong> takes a random sample of size n, computes its mean, and drops it in the
          lower histogram. Two facts emerge: the means centre on the population μ, and their spread shrinks like
          σ/√n — the <strong>standard error</strong>. Even a skewed parent produces a symmetric bell of means once n
          is big enough. That is the CLT, the theorem that makes confidence intervals possible.
        </>
      }
      controls={
        <>
          <Seg
            value={shape}
            onChange={(v) => {
              setShape(v);
              resetRun(seed);
            }}
            options={[
              { value: "right-skew" as PopulationShape, label: "Right-skew" },
              { value: "bimodal" as PopulationShape, label: "Bimodal" },
              { value: "uniform" as PopulationShape, label: "Uniform" },
              { value: "normal" as PopulationShape, label: "Normal" },
            ]}
          />
          <VizSlider
            label="sample size n"
            symbol="n"
            value={n}
            min={1}
            max={100}
            step={1}
            onChange={(v) => {
              setN(v);
              setMeans([]);
            }}
            format={(v) => String(v)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <VizButton onClick={() => drawBatch(1)}>Draw 1</VizButton>
            <VizButton onClick={() => drawMany(100)}>Draw 100</VizButton>
            <VizButton onClick={() => drawMany(2000)}>Draw 2000</VizButton>
            <VizButton onClick={() => setMeans([])}>Clear</VizButton>
            <VizButton
              onClick={() => {
                const next = seed + 1;
                setSeed(next);
                resetRun(next);
              }}
            >
              Reseed
            </VizButton>
            <span className="text-[11px] text-ink-3">seed {seed}</span>
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Population μ", value: fmtNum(moments.mu, 3) },
            { label: "Mean of sample means", value: fmtNum(meansMean, 3), tone: "accent" },
            { label: "Predicted SE = σ/√n", value: fmtNum(se, 3) },
            { label: "Actual sd of means", value: fmtNum(meansSd, 3), tone: means.length > 30 ? "good" : "default" },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">Population (skewed is fine)</p>
          <Plane xMin={LO} xMax={HI} yMin={0} yMax={popMax * 1.15} xLabel="value" yLabel="density" aspect={16 / 10} ariaLabel="Population density curve">
            {(m) => (
              <>
                <path d={`${segToPath(m, popCurve)} L ${m.toX(HI)} ${m.toY(0)} L ${m.toX(LO)} ${m.toY(0)} Z`} fill={C.slate} fillOpacity={0.22} />
                <path d={segToPath(m, popCurve)} fill="none" stroke={C.slate} strokeWidth={2.4} />
                <line x1={m.toX(moments.mu)} y1={m.toY(0)} x2={m.toX(moments.mu)} y2={m.toY(popMax)} stroke={C.rose} strokeWidth={2} strokeDasharray="6 4" />
                <text x={m.toX(moments.mu) + 5} y={m.toY(popMax) + 12} className="text-[10.5px] font-bold" fill={C.rose}>μ = {fmtNum(moments.mu, 2)}</text>
              </>
            )}
          </Plane>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">Sample means ({means.length} drawn, n = {n})</p>
          <Plane xMin={LO} xMax={HI} yMin={0} yMax={sampMax * 1.3} xLabel="sample mean x̄" yLabel="density" aspect={16 / 10} ariaLabel="Histogram of sample means">
            {(m) => (
              <>
                {sampHist.map((h, i) => {
                  const x0 = m.toX(h.from);
                  const x1 = m.toX(h.to);
                  return (
                    <rect key={i} x={x0 + 0.4} y={m.toY(h.density)} width={Math.max(0.6, x1 - x0 - 0.8)} height={m.toY(0) - m.toY(h.density)} fill={C.cyan} fillOpacity={0.72} stroke={C.cyan} />
                  );
                })}
                {/* theoretical normal of the mean */}
                {means.length > 30 &&
                  (() => {
                    const pts = samplePoints((x) => normalPdf(x, moments.mu, se), Math.max(LO, moments.mu - 4 * se), Math.min(HI, moments.mu + 4 * se), 200)[0] ?? [];
                    return <path d={segToPath(m, pts)} fill="none" stroke={C.rose} strokeWidth={2} strokeDasharray="6 4" />;
                  })()}
                <text x={m.toX(HI) - 4} y={m.toY(sampMax * 1.2)} textAnchor="end" className="text-[9.5px] font-semibold opacity-50">
                  {means.length > 30 ? "dashed: normal(μ, σ/√n) prediction" : "draw more to reveal the prediction"}
                </text>
              </>
            )}
          </Plane>
        </div>
      </div>
    </VizCard>
  );
}

/** Stable-callback helper (avoids re-creating closures that reset refs). */

// ===========================================================================
// 19. Confidence intervals
// ===========================================================================

export function ConfidenceViz() {
  const [n, setN] = useState(20);
  const [level, setLevel] = useState(0.95);
  const [useT, setUseT] = useState(true);
  const [draws, setDraws] = useState<Array<{ lo: number; hi: number; xbar: number; covers: boolean }>>([]);
  const [seed, setSeed] = useState(11);
  const rngRef = useRef<Rng>(mulberry32(11));

  const resetDraws = useCallback((nextSeed: number) => {
    rngRef.current = mulberry32(nextSeed);
    setDraws([]);
  }, []);

  const TRUE_MU = 50;
  const TRUE_SIGMA = 10;

  const draw = useCallback(
    (count: number) => {
      setDraws((prev) => {
        const rng = rngRef.current;
        const next = [...prev];
        for (let i = 0; i < count && next.length < 100; i++) {
          const sample: number[] = [];
          for (let j = 0; j < n; j++) sample.push(rnorm(rng, TRUE_MU, TRUE_SIGMA));
          const xbar = mean(sample);
          const s = sd(sample);
          const ci = ciForMean(xbar, n, useT ? null : TRUE_SIGMA, s, level);
          next.push({ lo: ci.lo, hi: ci.hi, xbar, covers: ci.lo <= TRUE_MU && TRUE_MU <= ci.hi });
        }
        return next;
      });
    },
    [n, level, useT],
  );

  const coverage = draws.length ? draws.filter((d) => d.covers).length / draws.length : NaN;
  const critical = useT ? tQuantile(0.5 + level / 2, n - 1) : normalQuantile(0.5 + level / 2);
  const lastDraw = draws[draws.length - 1];

  return (
    <VizCard
      title="Confidence intervals, face to face with chance"
      subtitle="Every draw takes a fresh sample and builds its interval. In the long run, the hit rate equals the confidence level — not for each interval, but across them."
      domain="stats"
      explanation={
        <>
          Each line is one 95%-style interval: x̄ ± critical · s/√n. The vertical line is the true μ = 50. Any single
          interval either captures it or misses — no probabilities attach to one interval. The guarantee is
          long-run: with t and the sample s (σ unknown), expect the nominal {Math.round(level * 100)}% coverage. With
          n small, t&rsquo;s critical value beats z because s is a noisy estimate of σ.
        </>
      }
      controls={
        <>
          <Seg
            value={String(level)}
            onChange={(v) => {
              setLevel(Number(v));
              setDraws([]);
            }}
            options={[
              { value: "0.8", label: "80%" },
              { value: "0.9", label: "90%" },
              { value: "0.95", label: "95%" },
              { value: "0.99", label: "99%" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip
              active={useT}
              onClick={() => {
                setUseT((v) => !v);
                setDraws([]);
              }}
            >
              {useT ? "t interval (σ unknown, uses s)" : "z interval (σ known)"}
            </ToggleChip>
          </div>
          <VizSlider
            label="sample size n"
            symbol="n"
            value={n}
            min={5}
            max={60}
            step={1}
            onChange={(v) => {
              setN(v);
              setDraws([]);
            }}
            format={(v) => String(v)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <VizButton onClick={() => draw(1)}>Draw 1</VizButton>
            <VizButton onClick={() => draw(25)}>Draw 25</VizButton>
            <VizButton onClick={() => draw(70)}>Draw to 100</VizButton>
            <VizButton onClick={() => setDraws([])}>Clear</VizButton>
            <VizButton
              onClick={() => {
                const next = seed + 1;
                setSeed(next);
                resetDraws(next);
              }}
            >
              Reseed
            </VizButton>
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Nominal level", value: `${Math.round(level * 100)}%` },
            { label: "Critical value", value: `${useT ? "t" : "z"} = ${fmtNum(critical, 3)}` },
            { label: "Observed coverage", value: draws.length ? `${(coverage * 100).toFixed(1)}% (${draws.filter((d) => d.covers).length}/${draws.length})` : "—", tone: "accent" },
            { label: "Last interval", value: lastDraw ? `[${fmtNum(lastDraw.lo, 2)}, ${fmtNum(lastDraw.hi, 2)}]` : "—" },
          ]}
        />
      }
    >
      <Plane xMin={40} xMax={60} yMin={0} yMax={1} xLabel="interval for μ (true μ = 50)" yLabel="" aspect={16 / 9} ticks={false} ariaLabel="Stacked confidence intervals against the true mean">
        {(m) => (
          <>
            <line x1={m.toX(TRUE_MU)} y1={m.toY(1)} x2={m.toX(TRUE_MU)} y2={m.toY(0)} stroke={C.rose} strokeWidth={2.4} />
            <text x={m.toX(TRUE_MU) - 6} y={m.toY(1) - 4} textAnchor="end" className="text-[10.5px] font-bold" fill={C.rose}>true μ = 50</text>
            {draws.map((d, i) => {
              const y = 1 - (i + 0.6) / (Math.max(draws.length, 12) + 1);
              const covers = d.covers;
              return (
                <g key={i}>
                  <line x1={m.toX(d.lo)} y1={m.toY(y)} x2={m.toX(d.hi)} y2={m.toY(y)} stroke={covers ? C.green : C.rose} strokeWidth={3} opacity={0.85} />
                  <circle cx={m.toX(d.xbar)} cy={m.toY(y)} r={3.2} fill={covers ? C.green : C.rose} />
                  {!covers && (
                    <circle cx={m.toX(d.xbar)} cy={m.toY(y)} r={5.5} fill="none" stroke={C.rose} strokeWidth={1.2} />
                  )}
                </g>
              );
            })}
            {draws.length === 0 && (
              <text x={(m.toX(40) + m.toX(60)) / 2} y={m.toY(0.5)} textAnchor="middle" className="fill-current text-[12px] font-medium opacity-50">
                draw some intervals ↑
              </text>
            )}
          </>
        )}
      </Plane>
      <Legend className="mt-3" items={[{ color: C.green, label: "interval covers μ" }, { color: C.rose, label: "interval misses μ" }, { color: C.rose, label: "true μ", dashed: true }]} />
    </VizCard>
  );
}

// ===========================================================================
// 20. Hypothesis testing
// ===========================================================================

export function HypothesisViz() {
  const [mu0, setMu0] = useState(50);
  const [trueMu, setTrueMu] = useState(53);
  const [n, setN] = useState(25);
  const [sigma, setSigma] = useState(10);
  const [alpha, setAlpha] = useState(0.05);
  const [tails, setTails] = useState<"left" | "right" | "two">("two");
  const [useT, setUseT] = useState(true);
  const [seed, setSeed] = useState(7);
  const [drawn, setDrawn] = useState<{ xbar: number; s: number } | null>(null);
  const rngRef = useRef<Rng>(mulberry32(7));

  const drawSample = useCallback(() => {
    const rng = rngRef.current;
    const sample: number[] = [];
    for (let j = 0; j < n; j++) sample.push(rnorm(rng, trueMu, sigma));
    setDrawn({ xbar: mean(sample), s: sd(sample) });
  }, [n, sigma, trueMu]);

  const result = drawn
    ? oneSampleTest(drawn.xbar, n, mu0, useT ? null : sigma, drawn.s, alpha, tails)
    : null;
  const seNull = sigma / Math.sqrt(n);
  const nullCurve = samplePoints((x) => normalPdf(x, mu0, seNull), mu0 - 4.2 * seNull, mu0 + 4.2 * seNull, 260)[0] ?? [];
  const peak = normalPdf(mu0, mu0, seNull);

  // rejection regions under H0
  const crit = useT && drawn ? result!.criticalValue : (tails === "two" ? normalQuantile(1 - alpha / 2) : normalQuantile(1 - alpha));
  const rejRegions: Array<[number, number]> =
    tails === "two"
      ? [[mu0 - 4.5 * seNull, mu0 - crit * seNull], [mu0 + crit * seNull, mu0 + 4.5 * seNull]]
      : tails === "left"
        ? [[mu0 - 4.5 * seNull, mu0 - crit * seNull]]
        : [[mu0 + crit * seNull, mu0 + 4.5 * seNull]];

  const shadingPath = (m: { toX: (x: number) => number; toY: (y: number) => number }, from: number, to: number) => {
    const steps = 60;
    const pts = [`M ${m.toX(from)} ${m.toY(0)}`];
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      pts.push(`L ${m.toX(x)} ${m.toY(normalPdf(x, mu0, seNull))}`);
    }
    pts.push(`L ${m.toX(to)} ${m.toY(0)} Z`);
    return pts.join(" ");
  };

  return (
    <VizCard
      title="Hypothesis testing, built from parts"
      subtitle="Set the truth and the claim, draw a real sample, and watch the statistic, the rejection region and the p-value assemble the decision."
      domain="stats"
      explanation={
        <>
          The curve is the sampling distribution of x̄ <em>if H₀ were true</em> (μ = μ₀). Shaded tails hold
          probability α — that is the rejection region. The test statistic measures how far the drawn x̄ sits from
          μ₀ in standard errors. If it lands in a shaded tail, reject H₀. The <strong>p-value</strong> is the
          probability of a result at least this extreme <em>under H₀</em> — not the probability H₀ is true. When the
          truth differs from μ₀ and you still fail to reject, that is a Type II error.
        </>
      }
      controls={
        <>
          <Seg
            value={tails}
            onChange={(v) => setTails(v)}
            options={[
              { value: "left" as const, label: "Left-tailed" },
              { value: "two" as const, label: "Two-tailed" },
              { value: "right" as const, label: "Right-tailed" },
            ]}
          />
          <Seg
            value={String(alpha)}
            onChange={(v) => setAlpha(Number(v))}
            options={[
              { value: "0.01", label: "α = 0.01" },
              { value: "0.05", label: "α = 0.05" },
              { value: "0.1", label: "α = 0.10" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={useT} onClick={() => { setUseT((v) => !v); setDrawn(null); }}>{useT ? "t-test (σ unknown)" : "z-test (σ known)"}</ToggleChip>
            <VizButton onClick={drawSample}>Draw a sample</VizButton>
            <VizButton
              onClick={() => {
                setSeed((s) => s + 1);
                rngRef.current = mulberry32(seed + 1);
                setDrawn(null);
              }}
            >
              Reseed
            </VizButton>
          </div>
          <VizSlider label="hypothesized mean μ₀ (H₀)" symbol="μ₀" value={mu0} min={44} max={56} step={0.5} onChange={(v) => { setMu0(v); setDrawn(null); }} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="TRUE mean (reality)" symbol="μ" value={trueMu} min={44} max={56} step={0.5} onChange={(v) => { setTrueMu(v); setDrawn(null); }} format={(v) => fmtNum(v, 1)} />
          <VizSlider label="sample size" symbol="n" value={n} min={5} max={80} step={1} onChange={(v) => { setN(v); setDrawn(null); }} format={(v) => String(v)} />
          <VizSlider label="population σ" symbol="σ" value={sigma} min={2} max={20} step={0.5} onChange={(v) => { setSigma(v); setDrawn(null); }} format={(v) => fmtNum(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Drawn x̄", value: drawn ? fmtNum(drawn.xbar, 2) : "— draw a sample" },
            { label: "Sample sd s", value: drawn ? fmtNum(drawn.s, 2) : "—" },
            { label: "Standard error", value: drawn ? fmtNum(result!.se, 3) : fmtNum(seNull, 3) },
            { label: drawn ? `Statistic (${result!.pivotal})` : "Statistic", value: result ? fmtNum(result.statistic, 3) : "—", tone: "accent" },
            { label: "p-value", value: result ? (result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4)) : "—", tone: result ? (result.reject ? "bad" : "good") : "default" },
            { label: "Decision", value: result ? (result.reject ? "Reject H₀" : "Fail to reject H₀") : "—", mono: false, tone: result ? (result.reject ? "bad" : "good") : "default" },
          ]}
        />
      }
      footer={
        result && (
          <div className="border-t border-border-subtle bg-surface-inset px-5 py-3 text-[12px] leading-relaxed text-ink-2">
            {result.reject ? (
              <>
                <strong className="text-ink">Reject H₀.</strong> The drawn mean {fmtNum(result.xbar, 2)} lies {fmtNum(Math.abs(result.statistic), 2)} standard errors from μ₀ — beyond the critical value{" "}
                {fmtNum(result.criticalValue, 3)} (p = {result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4)} &lt; α = {alpha}).{" "}
                {Math.abs(trueMu - mu0) < 0.01
                  ? "H₀ happens to be true here — this is a Type I error (the α-risk realised)."
                  : "H₀ is indeed false — a correct rejection."}
              </>
            ) : (
              <>
                <strong className="text-ink">Fail to reject H₀.</strong> The evidence is not extreme enough at α = {alpha} (p ={" "}
                {result.pValue < 0.0001 ? "< 0.0001" : result.pValue.toFixed(4)}).{" "}
                {Math.abs(trueMu - mu0) < 0.01
                  ? "H₀ is true here — the correct call."
                  : "But the true mean is not μ₀ — this is a Type II error (missed detection)."}
              </>
            )}
          </div>
        )
      }
    >
      <Plane
        xMin={mu0 - 4.5 * seNull}
        xMax={mu0 + 4.5 * seNull}
        yMin={0}
        yMax={peak * 1.2}
        xLabel="sample mean x̄ if H₀ true"
        yLabel="density"
        ariaLabel="Null distribution of the sample mean with rejection regions and the drawn mean"
      >
        {(m) => (
          <>
            {rejRegions.map(([from, to], i) => (
              <path key={i} d={shadingPath(m, from, to)} fill={C.rose} fillOpacity={0.3} />
            ))}
            <path d={segToPath(m, nullCurve)} fill="none" stroke={C.indigo} strokeWidth={2.6} />
            <line x1={m.toX(mu0)} y1={m.toY(0)} x2={m.toX(mu0)} y2={m.toY(peak)} stroke={C.slate} strokeWidth={1.2} strokeDasharray="2 3" />
            <text x={m.toX(mu0) + 5} y={m.toY(peak) + 12} className="text-[10.5px] font-bold" fill={C.slate}>μ₀ = {fmtNum(mu0, 1)}</text>
            {result && (
              <>
                <line x1={m.toX(result.xbar)} y1={m.toY(0)} x2={m.toX(result.xbar)} y2={m.toY(peak * 1.06)} stroke={result.reject ? C.rose : C.green} strokeWidth={2.4} />
                <text
                  x={m.toX(result.xbar)}
                  y={m.toY(peak * 1.06) - 6}
                  textAnchor={result.xbar > mu0 ? "end" : "start"}
                  className="text-[11px] font-bold"
                  fill={result.reject ? C.rose : C.green}
                >
                  x̄ = {fmtNum(result.xbar, 2)} {result.reject ? "→ reject" : "→ keep H₀"}
                </text>
              </>
            )}
          </>
        )}
      </Plane>
      <Legend className="mt-3" items={[{ color: C.indigo, label: "distribution of x̄ under H₀" }, { color: C.rose, label: `rejection region (α = ${alpha})` }, { color: C.green, label: "drawn x̄ (non-rejecting)" }]} />
    </VizCard>
  );
}

// ===========================================================================
// 21. Correlation
// ===========================================================================

export function CorrelationViz() {
  const [rho, setRho] = useState(0.7);
  const [n, setN] = useState(40);
  const [noiseSeed, setNoiseSeed] = useState(5);
  const [showMeans, setShowMeans] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [override, setOverride] = useState<Record<number, { x: number; y: number }>>({});

  const base = useMemo(() => rbivariateNormal(mulberry32(noiseSeed), rho, n), [rho, n, noiseSeed]);
  const pts = base.map((p, i) => override[i] ?? p);
  const r = pearson(pts.map((p) => p.x), pts.map((p) => p.y));
  const mx = mean(pts.map((p) => p.x));
  const my = mean(pts.map((p) => p.y));

  const drag = usePlaneDrag((x, y) => {
    if (sel !== null) setOverride((o) => ({ ...o, [sel]: { x, y } }));
  });

  return (
    <VizCard
      title="Correlation: Pearson&rsquo;s r, felt by hand"
      subtitle="Generate a cloud with any target correlation, then drag a single point to see how much one observation can bend r."
      domain="stats"
      explanation={
        <>
          r ∈ [−1, 1] measures <em>linear</em> association: +1 is a perfect rising line, 0 no linear pattern. Drag a
          point into a corner — a single outlier can drag r dramatically, which is why r alone never earns trust
          without the scatterplot. The mean crosshairs split the cloud into quadrants: r sums the products of
          standardised deviations, so points in the (+,+) and (−,−) quadrants push it up, the others pull it down.
        </>
      }
      controls={
        <>
          <VizSlider label="target correlation ρ" symbol="ρ" value={rho} min={-0.95} max={0.95} step={0.05} onChange={setRho} format={(v) => fmtSigned(v, 2)} />
          <VizSlider label="points" symbol="n" value={n} min={10} max={120} step={5} onChange={setN} format={(v) => String(v)} />
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showMeans} onClick={() => setShowMeans((v) => !v)}>Mean crosshairs</ToggleChip>
            <VizButton onClick={() => setOverride({})}>Restore moved points</VizButton>
            <VizButton onClick={() => setNoiseSeed((s) => s + 1)}>Regenerate</VizButton>
            {sel !== null && <span className="text-[11px] text-ink-3">point {sel + 1} selected — drag it</span>}
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Pearson r (sample)", value: fmtNum(r, 3), tone: "accent" },
            { label: "r² (shared variance)", value: fmtNum(r * r, 3) },
            { label: "Interpretation", value: interpretR(r), mono: false },
            { label: "Moved points", value: `${Object.keys(override).length} of ${n}` },
          ]}
        />
      }
    >
      <Plane xMin={-3.4} xMax={3.4} yMin={-3.4} yMax={3.4} xLabel="x" yLabel="y" aspect={1} ariaLabel="Scatterplot with draggable points">
        {(m) => (
          <>
            {showMeans && (
              <>
                <line x1={m.toX(mx)} y1={m.toY(-3.4)} x2={m.toX(mx)} y2={m.toY(3.4)} stroke={C.slate} strokeWidth={1} strokeDasharray="4 4" />
                <line x1={m.toX(-3.4)} y1={m.toY(my)} x2={m.toX(3.4)} y2={m.toY(my)} stroke={C.slate} strokeWidth={1} strokeDasharray="4 4" />
              </>
            )}
            {pts.map((p, i) => {
              const isSel = sel === i;
              const moved = override[i] !== undefined;
              return (
                <g
                  key={i}
                  className="dv-handle"
                  onPointerDown={(e) => {
                    setSel(i);
                    drag.handleDown(e);
                  }}
                  onPointerMove={(e) => drag.handleMove(e, m)}
                  onPointerUp={drag.handleUp}
                  onFocus={() => setSel(i)}
                  onKeyDown={(e) => drag.handleKeys(e, m, () => p)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Point ${i + 1} at (${fmtNum(p.x, 1)}, ${fmtNum(p.y, 1)}) — drag, or use the arrow keys to move`}
                  style={{ cursor: "grab" }}
                >
                  <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={12} fill="transparent" />
                  <circle
                    cx={m.toX(p.x)}
                    cy={m.toY(p.y)}
                    r={isSel ? 7.5 : 5}
                    fill={moved ? C.amber : C.indigo}
                    fillOpacity={isSel ? 1 : 0.75}
                    stroke={isSel ? "var(--color-canvas, #fff)" : "none"}
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </>
        )}
      </Plane>
      <Legend className="mt-3" items={[{ color: C.indigo, label: "data point (click + drag)" }, { color: C.amber, label: "moved point" }]} />
    </VizCard>
  );
}

function interpretR(r: number): string {
  const a = Math.abs(r);
  if (Number.isNaN(r)) return "—";
  if (a < 0.2) return "negligible linear association";
  if (a < 0.4) return "weak";
  if (a < 0.6) return "moderate";
  if (a < 0.8) return "strong";
  return "very strong";
}

// ===========================================================================
// 22. Regression
// ===========================================================================

export function RegressionViz() {
  const [pts, setPts] = useState<Array<{ x: number; y: number }>>([
    { x: 1, y: 2.1 }, { x: 1.6, y: 2.9 }, { x: 2.2, y: 3.2 }, { x: 2.9, y: 4.0 },
    { x: 3.5, y: 4.6 }, { x: 4.1, y: 4.4 }, { x: 4.8, y: 5.7 }, { x: 5.4, y: 6.1 },
    { x: 6.0, y: 6.4 }, { x: 6.6, y: 7.4 }, { x: 7.2, y: 7.1 }, { x: 7.9, y: 8.2 },
  ]);
  const [sel, setSel] = useState<number | null>(null);
  const [showResiduals, setShowResiduals] = useState(false);
  const [showSquares, setShowSquares] = useState(false);
  const [xPred, setXPred] = useState(5);

  const fit = olsFit(pts.map((p) => p.x), pts.map((p) => p.y));
  const drag = usePlaneDrag((x, y) => {
    if (sel !== null) setPts((ps) => ps.map((p, i) => (i === sel ? { x: clamp(x, 0.2, 9.8), y: clamp(y, 0.2, 9.8) } : p)));
  });

  const yHat = (x: number) => fit.intercept + fit.slope * x;

  return (
    <VizCard
      title="Least-squares regression"
      subtitle="Drag points, add new ones by clicking, and watch the line re-fit. Toggle the residuals — then the literal squares that OLS minimises."
      domain="stats"
      explanation={
        <>
          OLS finds the line minimising the sum of <em>squared</em> residuals — the amber boxes. Squaring punishes
          big misses super-linearly, so the line chases outliers. The slope means &ldquo;change in ŷ per unit of x&rdquo;;
          r² is the share of y&rsquo;s variance the line explains. Prediction at x = {fmtNum(xPred, 1)}:{" "}
          <strong>ŷ = {fmtNum(yHat(xPred), 3)}</strong>.
        </>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip active={showResiduals} onClick={() => setShowResiduals((v) => !v)}>Residuals</ToggleChip>
            <ToggleChip active={showSquares} onClick={() => setShowSquares((v) => !v)}>Squared errors</ToggleChip>
            <VizButton onClick={() => setPts((ps) => ps.filter((_, i) => i !== sel))} >Remove selected</VizButton>
            <VizButton onClick={() => setPts([
              { x: 1, y: 2.1 }, { x: 1.6, y: 2.9 }, { x: 2.2, y: 3.2 }, { x: 2.9, y: 4.0 },
              { x: 3.5, y: 4.6 }, { x: 4.1, y: 4.4 }, { x: 4.8, y: 5.7 }, { x: 5.4, y: 6.1 },
              { x: 6.0, y: 6.4 }, { x: 6.6, y: 7.4 }, { x: 7.2, y: 7.1 }, { x: 7.9, y: 8.2 },
            ])}>Reset</VizButton>
            <span className="text-[11px] text-ink-3">{sel !== null ? `point ${sel + 1} selected — drag to move` : "click empty space to add a point"}</span>
          </div>
          <VizSlider label="predict at x =" value={xPred} min={0.5} max={9.5} step={0.1} onChange={setXPred} format={(v) => fmtNum(v, 1)} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Slope b₁", value: fmtNum(fit.slope, 3), tone: "accent" },
            { label: "Intercept b₀", value: fmtNum(fit.intercept, 3) },
            { label: "r² (variance explained)", value: fmtNum(fit.r2, 3) },
            { label: "RMSE", value: fmtNum(fit.rmse, 3) },
            { label: "Prediction ŷ", value: fmtNum(yHat(xPred), 3), tone: "good" },
            { label: "n", value: String(fit.n) },
          ]}
        />
      }
      footer={
        <div className="border-t border-border-subtle bg-surface-inset px-5 py-3 font-mono text-[12.5px] text-ink-2">
          ŷ = {fmtNum(fit.intercept, 2)} {fit.slope >= 0 ? "+" : "−"} {fmtNum(Math.abs(fit.slope), 3)}·x
          <span className="ml-3 text-ink-3">
            (slope: each extra unit of x adds {fmtNum(fit.slope, 2)} to the prediction)
          </span>
        </div>
      }
    >
      <Plane xMin={0} xMax={10} yMin={0} yMax={10} xLabel="x" yLabel="y" aspect={1} ariaLabel="Scatterplot with least-squares regression line and draggable points">
        {(m) => (
          <>
            {/* squared-error boxes */}
            {showSquares &&
              pts.map((p, i) => {
                const yh = yHat(p.x);
                const e = p.y - yh;
                const x0 = m.toX(p.x);
                const side = Math.abs(m.toY(p.y) - m.toY(yh));
                return (
                  <rect
                    key={`sq${i}`}
                    x={e > 0 ? x0 : x0 - side}
                    y={Math.min(m.toY(p.y), m.toY(yh))}
                    width={side}
                    height={side}
                    fill={C.amber}
                    fillOpacity={0.22}
                    stroke={C.amber}
                    strokeWidth={1}
                  />
                );
              })}
            {/* the fitted line */}
            <line x1={m.toX(0)} y1={m.toY(yHat(0))} x2={m.toX(10)} y2={m.toY(yHat(10))} stroke={C.indigo} strokeWidth={2.6} />
            {/* residuals */}
            {showResiduals &&
              pts.map((p, i) => (
                <line key={`re${i}`} x1={m.toX(p.x)} y1={m.toY(p.y)} x2={m.toX(p.x)} y2={m.toY(yHat(p.x))} stroke={C.rose} strokeWidth={1.6} opacity={0.85} />
              ))}
            {/* prediction point */}
            <circle cx={m.toX(xPred)} cy={m.toY(yHat(xPred))} r={5.5} fill={C.green} stroke="var(--color-canvas, #fff)" strokeWidth={2} />
            <line x1={m.toX(xPred)} y1={m.toY(0)} x2={m.toX(xPred)} y2={m.toY(yHat(xPred))} stroke={C.green} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            {/* points */}
            {pts.map((p, i) => (
              <g
                key={i}
                className="dv-handle"
                onPointerDown={(e) => {
                  setSel(i);
                  drag.handleDown(e);
                }}
                onPointerMove={(e) => drag.handleMove(e, m)}
                onPointerUp={drag.handleUp}
                onFocus={() => setSel(i)}
                onKeyDown={(e) => drag.handleKeys(e, m, () => p)}
                tabIndex={0}
                role="button"
                aria-label={`Data point ${i + 1} at (${fmtNum(p.x, 1)}, ${fmtNum(p.y, 1)}) — drag, or use the arrow keys to move`}
                style={{ cursor: "grab" }}
              >
                <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={13} fill="transparent" />
                <circle
                  cx={m.toX(p.x)}
                  cy={m.toY(p.y)}
                  r={sel === i ? 7 : 5}
                  fill={C.violet}
                  fillOpacity={sel === i ? 1 : 0.8}
                  stroke={sel === i ? "var(--color-canvas, #fff)" : "none"}
                  strokeWidth={2}
                />
              </g>
            ))}
            {/* click to add */}
            <rect
              x={0}
              y={0}
              width={m.W}
              height={m.H}
              fill="transparent"
              style={{ cursor: "copy" }}
              onPointerDown={(e) => {
                if (sel !== null) return;
                const svg = (e.currentTarget as Element).closest("svg");
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * m.W;
                const py = ((e.clientY - rect.top) / rect.height) * m.H;
                const x = clamp(m.fromX(px), 0.2, 9.8);
                const y = clamp(m.fromY(py), 0.2, 9.8);
                setPts([...pts, { x, y }]);
                setSel(pts.length);
              }}
            />
          </>
        )}
      </Plane>
      <Legend className="mt-3" items={[{ color: C.indigo, label: "OLS line ŷ = b₀ + b₁x" }, { color: C.violet, label: "data (drag / click to add)" }, { color: C.rose, label: "residuals" }, { color: C.amber, label: "squared errors (minimised)", shape: "square" }, { color: C.green, label: "prediction at x" }]} />
    </VizCard>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ===========================================================================
// 23. Probability experiments
// ===========================================================================

type ExpId = "coin" | "biased" | "die" | "dice2" | "urn";

export function ProbabilityViz() {
  const [exp, setExp] = useState<ExpId>("dice2");
  const [pBiased, setPBiased] = useState(0.3);
  const [redBalls, setRedBalls] = useState(3);
  const [blueBalls, setBlueBalls] = useState(2);
  const [trials, setTrials] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [seed, setSeed] = useState(2024);
  const rngRef = useRef<Rng>(mulberry32(2024));
  const [progress, setProgress] = useState<Array<{ n: number; freq: number }>>([]);
  const [watch, setWatch] = useState<string | null>(null);

  const spec = useMemo(() => {
    switch (exp) {
      case "coin":
        return { outcomes: ["Heads", "Tails"], theory: [0.5, 0.5], draw: (rng: Rng) => (rng() < 0.5 ? "Heads" : "Tails"), watchDefault: "Heads", xLabel: "result" };
      case "biased":
        return { outcomes: ["Heads", "Tails"], theory: [pBiased, 1 - pBiased], draw: (rng: Rng) => (rng() < pBiased ? "Heads" : "Tails"), watchDefault: "Heads", xLabel: "result" };
      case "die":
        return { outcomes: ["1", "2", "3", "4", "5", "6"], theory: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6], draw: (rng: Rng) => String(rint(rng, 1, 6)), watchDefault: "6", xLabel: "face" };
      case "dice2": {
        const outcomes = Array.from({ length: 11 }, (_, i) => String(i + 2));
        const theory = outcomes.map((_, k) => (6 - Math.abs(k - 5)) / 36);
        return {
          outcomes,
          theory,
          draw: (rng: Rng) => String(rint(rng, 1, 6) + rint(rng, 1, 6)),
          watchDefault: "7",
          xLabel: "sum of two dice",
        };
      }
      case "urn": {
        const total = redBalls + blueBalls;
        if (total === 0) return { outcomes: ["—"], theory: [1], draw: () => "—", watchDefault: "—", xLabel: "colour" };
        return {
          outcomes: ["Red", "Blue"],
          theory: [redBalls / total, blueBalls / total],
          draw: (rng: Rng) => (rng() < redBalls / total ? "Red" : "Blue"),
          watchDefault: "Red",
          xLabel: "drawn colour",
        };
      }
    }
  }, [exp, pBiased, redBalls, blueBalls]);

  const resetRun = useCallback(
    (nextSeed: number, watchDefault: string) => {
      rngRef.current = mulberry32(nextSeed);
      setTrials(0);
      setCounts({});
      setProgress([]);
      setWatch(watchDefault);
    },
    [],
  );

  const runTrials = useCallback(
    (count: number) => {
      const rng = rngRef.current;
      const next = { ...counts };
      const key = watch ?? spec.watchDefault;
      const marks: Array<{ n: number; freq: number }> = [];
      const markEvery = Math.max(1, Math.ceil(count / 240));
      let n = trials;
      for (let i = 0; i < count; i++) {
        const out = spec.draw(rng);
        next[out] = (next[out] ?? 0) + 1;
        n++;
        if (i % markEvery === 0 || i === count - 1) {
          marks.push({ n, freq: (next[key] ?? 0) / n });
        }
      }
      setCounts(next);
      setTrials(n);
      setProgress((pp) => [...pp, ...marks].slice(-1400));
    },
    [counts, trials, watch, spec],
  );

  const maxCount = Math.max(...spec.outcomes.map((o) => counts[o] ?? 0), 1);
  const theoryMax = Math.max(...spec.theory, 0.001);
  const watchFreq = watch && trials > 0 ? (counts[watch] ?? 0) / trials : NaN;
  const watchTheory = watch ? spec.theory[spec.outcomes.indexOf(watch)] : NaN;

  return (
    <VizCard
      title="Probability experiments: empirical → theoretical"
      subtitle="Run a coin, a die, two dice or an urn. The bars record what actually happened; the hollow markers show what theory promises."
      domain="stats"
      explanation={
        <>
          Probability theory makes a promise about the long run, not about any single trial. The lower chart tracks
          the running frequency of one outcome — the wobble that settles toward the theoretical line is the{" "}
          <strong>law of large numbers</strong>, live. Every draw uses a seeded generator, so you can reproduce any
          run exactly.
        </>
      }
      controls={
        <>
          <Seg
            value={exp}
            onChange={(v) => {
              setExp(v);
              resetRun(seed, v === "coin" || v === "biased" ? "Heads" : v === "die" ? "6" : v === "dice2" ? "7" : "Red");
            }}
            options={[
              { value: "coin" as ExpId, label: "Fair coin" },
              { value: "biased" as ExpId, label: "Biased coin" },
              { value: "die" as ExpId, label: "One die" },
              { value: "dice2" as ExpId, label: "Two dice" },
              { value: "urn" as ExpId, label: "Urn draw" },
            ]}
          />
          {exp === "biased" && (
            <VizSlider
              label="P(Heads) — the bias"
              symbol="p"
              value={pBiased}
              min={0.05}
              max={0.95}
              step={0.05}
              onChange={(v) => {
                setPBiased(v);
                resetRun(seed, "Heads");
              }}
              format={(v) => v.toFixed(2)}
            />
          )}
          {exp === "urn" && (
            <div className="flex flex-wrap gap-4">
              <VizSlider
                label="red balls"
                value={redBalls}
                min={0}
                max={9}
                step={1}
                onChange={(v) => {
                  setRedBalls(v);
                  resetRun(seed, "Red");
                }}
                format={(v) => String(v)}
              />
              <VizSlider
                label="blue balls"
                value={blueBalls}
                min={0}
                max={9}
                step={1}
                onChange={(v) => {
                  setBlueBalls(v);
                  resetRun(seed, "Red");
                }}
                format={(v) => String(v)}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <VizButton onClick={() => runTrials(1)}>Run 1</VizButton>
            <VizButton onClick={() => runTrials(100)}>Run 100</VizButton>
            <VizButton onClick={() => runTrials(2000)}>Run 2000</VizButton>
            <VizButton onClick={() => { setCounts({}); setTrials(0); setProgress([]); }}>Clear</VizButton>
            <VizButton
              onClick={() => {
                const next = seed + 1;
                setSeed(next);
                resetRun(next, watch ?? spec.watchDefault);
              }}
            >
              Reseed
            </VizButton>
            <span className="text-[11px] text-ink-3">trials: {trials.toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
            <span>watch outcome:</span>
            <Seg size="sm" value={watch ?? spec.watchDefault} onChange={(v) => { setWatch(v); setProgress([]); }} options={spec.outcomes.map((o) => ({ value: o, label: o }))} />
          </div>
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: `Empirical P(${watch ?? "—"})`, value: Number.isFinite(watchFreq) ? watchFreq.toFixed(4) : "—", tone: "accent" },
            { label: "Theoretical", value: fmtNum(watchTheory, 4), tone: "good" },
            { label: "Gap", value: Number.isFinite(watchFreq) ? fmtSigned(watchFreq - watchTheory, 4) : "—" },
            { label: "Trials", value: trials.toLocaleString() },
          ]}
        />
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">Outcome counts vs theory</p>
          <Plane xMin={-0.5} xMax={spec.outcomes.length - 0.5} yMin={0} yMax={Math.max(maxCount, theoryMax * trials, 1) * 1.15} xLabel={spec.xLabel} yLabel="count" aspect={16 / 10} ariaLabel="Bar chart of outcome counts with theoretical probabilities">
            {(m) => (
              <>
                {spec.outcomes.map((o, i) => {
                  const c = counts[o] ?? 0;
                  const x0 = m.toX(i - 0.36);
                  const x1 = m.toX(i + 0.36);
                  return (
                    <g key={o} onPointerEnter={() => setWatch(o)}>
                      <rect x={x0} y={m.toY(c)} width={Math.max(1.5, x1 - x0)} height={m.toY(0) - m.toY(c)} fill={C.indigo} fillOpacity={0.68} stroke={C.indigo} />
                      <rect x={x0} y={m.toY(0)} width={x1 - x0} height={m.toY(0) - m.toY(maxCount * 1.15)} fill="transparent" />
                      {c > 0 && <text x={(x0 + x1) / 2} y={m.toY(c) - 5} textAnchor="middle" className="fill-current text-[10px] font-mono font-bold opacity-70">{c}</text>}
                    </g>
                  );
                })}
                {/* theory markers — expected counts at the current n */}
                {trials > 0 &&
                  spec.outcomes.map((o, i) => {
                    const t = spec.theory[i] * trials;
                    const y = m.toY(t);
                    return (
                      <g key={`t${o}`}>
                        <line x1={m.toX(i - 0.42)} y1={y} x2={m.toX(i + 0.42)} y2={y} stroke={C.green} strokeWidth={2.6} />
                        <line x1={m.toX(i)} y1={y - 5} x2={m.toX(i)} y2={y + 5} stroke={C.green} strokeWidth={2.6} />
                      </g>
                    );
                  })}
              </>
            )}
          </Plane>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-3">Running frequency of &ldquo;{watch}&rdquo;</p>
          <Plane xMin={0} xMax={Math.max(10, trials)} yMin={0} yMax={Math.max(0.15, Math.max(theoryMax * 2, 0.2))} xLabel="trials n" yLabel="frequency" aspect={16 / 10} ariaLabel="Running frequency converging to the theoretical probability">
            {(m) => (
              <>
                <line x1={m.toX(0)} y1={m.toY(watchTheory)} x2={m.toX(Math.max(10, trials))} y2={m.toY(watchTheory)} stroke={C.green} strokeWidth={2} strokeDasharray="6 4" />
                {progress.length > 1 && (
                  <polyline
                    points={progress.map((p) => `${m.toX(p.n)},${m.toY(p.freq)}`).join(" ")}
                    fill="none"
                    stroke={C.rose}
                    strokeWidth={1.8}
                  />
                )}
                {trials === 0 && (
                  <text x={(m.W) / 2} y={m.toY(0.5 * Math.max(theoryMax * 2, 0.2))} textAnchor="middle" className="fill-current text-[12px] opacity-50">
                    run some trials ↑
                  </text>
                )}
              </>
            )}
          </Plane>
        </div>
      </div>
      <Legend className="mt-3" items={[{ color: C.indigo, label: "observed counts" }, { color: C.green, label: `expected count at n = ${trials.toLocaleString()}` }, { color: C.rose, label: `running frequency of ${watch}` }]} />
    </VizCard>
  );
}
