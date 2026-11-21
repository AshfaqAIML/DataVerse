"use client";

/**
 * LAB 9 — Fuzzy Logic Playground: a genuine Mamdani controller. Input
 * membership functions (trapezoid/triangle) are editable by dragging their
 * breakpoints directly on the graph; rules map fuzzy input sets to output
 * sets; the trace runs fuzzification → per-rule clipping → aggregation →
 * centroid defuzzification, with every number computed live from the
 * functions — nothing is canned.
 */
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Canvas,
  Chip,
  ChipRow,
  ExecutionControls,
  Insights,
  LabFrame,
  Panel,
  Pseudocode,
  Stat,
  StepNarration,
  useStepper,
} from "./framework";

/* ------------------------------------------------- membership functions */

type MF = { id: string; label: string; pts: [number, number, number, number]; kind: "trap" | "tri" };

function mu(mf: MF, x: number): number {
  const [a, b, c, d] = mf.pts;
  if (mf.kind === "tri") {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    return x < b ? (x - a) / (b - a) : (c - x) / (c - b);
  }
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
}

interface Rule {
  id: string;
  antecedent: string; // input MF id
  consequent: string; // output MF id
  on: boolean;
}

const DEFAULT_INPUT_MFS: MF[] = [
  { id: "cold", label: "cold", pts: [0, 0, 12, 20], kind: "trap" },
  { id: "comfy", label: "comfortable", pts: [12, 22, 32, 32], kind: "tri" },
  { id: "hot", label: "hot", pts: [20, 28, 40, 40], kind: "trap" },
];

const DEFAULT_OUTPUT_MFS: MF[] = [
  { id: "off", label: "off", pts: [0, 0, 8, 18], kind: "trap" },
  { id: "slow", label: "slow", pts: [10, 25, 40, 40], kind: "tri" },
  { id: "medium", label: "medium", pts: [30, 50, 70, 70], kind: "tri" },
  { id: "fast", label: "fast", pts: [62, 80, 100, 100], kind: "trap" },
];

const DEFAULT_RULES: Rule[] = [
  { id: "R1", antecedent: "cold", consequent: "off", on: true },
  { id: "R2", antecedent: "comfy", consequent: "medium", on: true },
  { id: "R3", antecedent: "hot", consequent: "fast", on: true },
  { id: "R4", antecedent: "cold", consequent: "slow", on: false },
];

/* -------------------------------------------------------- the pipeline */

interface FuzzyStep {
  note: string;
  line: number;
  phase: string;
  stage: "fuzzify" | "activate" | "aggregate" | "defuzzify";
  activeRule?: string;
  done?: boolean;
}

function centroidOf(aggregate: (x: number) => number, lo: number, hi: number, samples = 400): number {
  let num = 0;
  let den = 0;
  for (let i = 0; i <= samples; i++) {
    const x = lo + ((hi - lo) * i) / samples;
    const m = aggregate(x);
    num += m * x;
    den += m;
  }
  return den === 0 ? (lo + hi) / 2 : num / den;
}

/* --------------------------------------------------------------- the lab */

const IN_MAX = 40;

export function FuzzyLab() {
  const [temp, setTemp] = useState(23);
  const [inMfs, setInMfs] = useState<MF[]>(DEFAULT_INPUT_MFS.map((m) => ({ ...m })));
  const [outMfs] = useState<MF[]>(DEFAULT_OUTPUT_MFS.map((m) => ({ ...m })));
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES.map((r) => ({ ...r })));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ mf: string; idx: number; x0: number; v0: number } | null>(null);

  const fuzzified = useMemo(() => {
    const out: Record<string, number> = {};
    for (const m of inMfs) out[m.id] = mu(m, temp);
    return out;
  }, [inMfs, temp]);

  const activeRules = useMemo(() => rules.filter((r) => r.on && fuzzified[r.antecedent] > 0.001), [rules, fuzzified]);

  const aggregate = useMemo(() => {
    return (x: number): number => {
      let m = 0;
      for (const r of activeRules) {
        const om = outMfs.find((o) => o.id === r.consequent)!;
        m = Math.max(m, Math.min(mu(om, x), fuzzified[r.antecedent]));
      }
      return m;
    };
  }, [activeRules, outMfs, fuzzified]);

  const centroid = useMemo(() => centroidOf(aggregate, 0, 100), [aggregate]);

  const steps = useMemo<FuzzyStep[]>(() => {
    const out: FuzzyStep[] = [];
    out.push({
      note: `Input: temperature = ${temp.toFixed(1)}°C. Fuzzification reads the three membership functions at this point: ${inMfs
        .map((m) => `μ_${m.label} = ${fuzzified[m.id].toFixed(2)}`)
        .join(", ")}.`,
      line: 0,
      phase: "fuzzify",
      stage: "fuzzify",
    });
    if (activeRules.length === 0) {
      out.push({
        note: `No rule's antecedent has any membership at ${temp.toFixed(1)}°C — the aggregate is empty and the fan defaults to its mid-range fallback. Drag the membership functions so some set covers this temperature.`,
        line: 1,
        phase: "idle",
        stage: "defuzzify",
        done: true,
      });
      return out;
    }
    for (const r of activeRules) {
      out.push({
        note: `Rule ${r.id} fires at strength ${fuzzified[r.antecedent].toFixed(2)}: IF temperature IS ${inMfs.find((m) => m.id === r.antecedent)?.label} THEN fan IS ${r.consequent}. The '${r.consequent}' output set is clipped at that height.`,
        line: 2,
        phase: `fire ${r.id}`,
        stage: "activate",
        activeRule: r.id,
      });
    }
    out.push({
      note: `Aggregation takes the union (max) of the ${activeRules.length} clipped set${activeRules.length > 1 ? "s" : ""} — the fan's possible speeds, each capped by the evidence for it.`,
      line: 3,
      phase: "aggregate",
      stage: "aggregate",
    });
    out.push({
      note: `Defuzzification: the centroid of the aggregated area — Σ μ(x)·x / Σ μ(x) over 0..100 — lands at ${centroid.toFixed(1)}% fan speed.`,
      line: 4,
      phase: "centroid",
      stage: "defuzzify",
      done: true,
    });
    return out;
  }, [temp, inMfs, fuzzified, activeRules, centroid]);

  const stepper = useStepper(steps);
  const step = stepper.step;

  const revealed =
    step.stage === "fuzzify"
      ? { fuzz: true, rules: [] as string[], agg: false, centroid: false }
      : step.stage === "activate"
        ? { fuzz: true, rules: activeRules.slice(0, activeRules.findIndex((r) => r.id === step.activeRule) + 1).map((r) => r.id), agg: false, centroid: false }
        : step.stage === "aggregate"
          ? { fuzz: true, rules: activeRules.map((r) => r.id), agg: true, centroid: false }
          : { fuzz: true, rules: activeRules.map((r) => r.id), agg: true, centroid: true };

  /* dragging breakpoints on the input graph */
  const onPointerDown = (e: React.PointerEvent, mf: MF, idx: number) => {
    dragRef.current = { mf: mf.id, idx, x0: e.clientX, v0: mf.pts[idx] };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = 100 / rect.width; // viewBox 0..100 per axis? we use 0..IN_MAX mapped to width
    const dv = ((e.clientX - d.x0) / rect.width) * 60; // input domain
    void scale;
    setInMfs((ms) =>
      ms.map((m) => {
        if (m.id !== d.mf) return m;
        const pts: [number, number, number, number] = [...m.pts] as [number, number, number, number];
        let v = Math.max(0, Math.min(IN_MAX, d.v0 + dv));
        // keep breakpoints ordered (and handle the "shoulder at 0/40" anchors)
        if (d.idx === 0) v = 0;
        if (d.idx === 3 && m.kind === "trap" && m.pts[3] >= IN_MAX) v = IN_MAX;
        if (d.idx === 2 && m.kind === "tri" && m.pts[2] >= IN_MAX) v = IN_MAX;
        pts[d.idx] = v;
        // enforce monotonicity
        for (let i = 1; i < 4; i++) if (pts[i] < pts[i - 1]) pts[i] = pts[i - 1];
        return { ...m, pts };
      })
    );
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const insights = useMemo(() => {
    const items: string[] = [];
    items.push(
      `At ${temp.toFixed(1)}°C the input is a member of ${Object.values(fuzzified).filter((v) => v > 0.001).length} set${Object.values(fuzzified).filter((v) => v > 0.001).length === 1 ? "" : "s"} at once (degrees ${inMfs.map((m) => fuzzified[m.id].toFixed(2)).join(" / ")}) — the core difference from crisp logic: contradiction is replaced by degree.`
    );
    if (activeRules.length > 1) {
      items.push(
        `${activeRules.length} rules fire together and their clipped sets are MAX-merged: the controller interpolates between behaviours instead of choosing one — the aggregation IS the smooth control surface.`
      );
    }
    items.push(
      `The centroid (${centroid.toFixed(1)}%) is the balance point of the aggregated area — run the input slider slowly and watch it glide: a rule-based system with no equations of motion produces a continuous controller.`
    );
    items.push(
      "Enable R4 (cold → slow) and watch the cold region's output blend: two rules with the same antecedent both contribute, exactly as multiple experts' advice would combine."
    );
    return items;
  }, [temp, fuzzified, inMfs, activeRules, centroid]);

  return (
    <LabFrame
      kicker="Laboratory 09 · fuzzy logic"
      title="Fuzzy Logic Playground"
      description="A complete fuzzy controller in the Mamdani style: temperature fuzzified over editable membership functions, rules firing in proportion to belief, output sets clipped and merged, and the fan speed read off as the centroid. Drag the shapes, slide the temperature, toggle rules — every number recomputes."
      aside={
        <>
          <Panel title="Input — temperature">
            <label className="block">
              <span className="flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-ink-2">temperature</span>
                <span className="tabular font-mono text-[13px] text-viz-3">{temp.toFixed(1)}°C</span>
              </span>
              <input
                type="range"
                min={0}
                max={40}
                step={0.5}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
              />
            </label>
            <div className="mt-3 space-y-1.5">
              {inMfs.map((m) => (
                <div key={m.id} className="flex items-baseline justify-between">
                  <span className="font-mono text-[11.5px] text-ink-2">μ_{m.label}({temp.toFixed(0)})</span>
                  <span className="tabular font-mono text-[12px] font-semibold" style={{ color: fuzzified[m.id] > 0.001 ? "var(--dv-viz-3)" : "var(--dv-ink-3)" }}>
                    {fuzzified[m.id].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Rules — toggle and rewire">
            <div className="space-y-1.5">
              {rules.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1.5">
                  <Chip active={r.on} onClick={() => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))} hue="var(--dv-success-text)">
                    {r.id} {r.on ? "on" : "off"}
                  </Chip>
                  <span className="font-mono text-[11px] text-ink-2">
                    IF temp IS {inMfs.find((m) => m.id === r.antecedent)?.label} THEN fan IS {r.consequent}
                  </span>
                  <select
                    value={r.consequent}
                    onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, consequent: e.target.value } : x)))}
                    className="ml-auto rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {outMfs.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Results">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="rules firing" value={activeRules.length} />
              <Stat label="fan speed (centroid)" value={`${centroid.toFixed(1)}%`} tone="var(--dv-success-text)" />
            </div>
          </Panel>
        </>
      }
    >
      <Canvas>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* input MFs */}
          <div>
            <p className="dv-kicker mb-1.5">Input membership — drag the dots</p>
            <svg
              ref={svgRef}
              viewBox="0 0 400 190"
              className="h-auto w-full touch-none"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              role="img"
              aria-label="Input membership functions"
            >
              {/* axes */}
              <line x1="30" y1="160" x2="390" y2="160" stroke="var(--dv-border-strong)" strokeWidth="1.2" />
              <line x1="30" y1="160" x2="30" y2="18" stroke="var(--dv-border-strong)" strokeWidth="1.2" />
              {[0, 10, 20, 30, 40].map((t) => (
                <text key={t} x={30 + (t / 40) * 355} y={176} textAnchor="middle" fontSize="9.5" className="fill-[var(--dv-ink-3)] font-mono">
                  {t}°
                </text>
              ))}
              <text x={12} y={24} fontSize="9.5" className="fill-[var(--dv-ink-3)] font-mono">1.0</text>
              <text x={12} y={162} fontSize="9.5" className="fill-[var(--dv-ink-3)] font-mono">0</text>
              {/* the input line */}
              {revealed.fuzz && (
                <line
                  x1={30 + (temp / 40) * 355}
                  y1="18"
                  x2={30 + (temp / 40) * 355}
                  y2="160"
                  stroke="var(--dv-ink-3)"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
              )}
              {/* MF shapes */}
              {inMfs.map((m, mi) => {
                const colors = ["var(--dv-viz-3)", "var(--dv-primary)", "var(--dv-violet-500)"];
                const color = colors[mi % colors.length];
                const X = (v: number) => 30 + (v / 40) * 355;
                const Y = (v: number) => 160 - v * 138;
                const pts =
                  m.kind === "tri"
                ? [
                    { x: X(m.pts[0]), y: Y(0) },
                    { x: X(m.pts[1]), y: Y(1) },
                    { x: X(m.pts[2]), y: Y(0) },
                  ]
                : [
                    { x: X(m.pts[0]), y: Y(0) },
                    { x: X(m.pts[1]), y: Y(1) },
                    { x: X(m.pts[2]), y: Y(1) },
                    { x: X(m.pts[3]), y: Y(0) },
                  ];
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                return (
                  <g key={m.id}>
                    <path d={d} fill={`color-mix(in srgb, ${color} 10%, transparent)`} stroke={color} strokeWidth="2" />
                    {m.pts.map((v, idx) => {
                      const skip = (idx === 0 && v === 0) || ((idx === 3 || (m.kind === "tri" && idx === 2)) && v >= IN_MAX);
                      if (skip) return null;
                      const py = idx === 1 || (m.kind === "trap" && idx === 2) ? Y(1) : Y(0);
                      return (
                        <circle
                          key={idx}
                          cx={X(v)}
                          cy={py}
                          r="5.5"
                          fill="var(--dv-surface)"
                          stroke={color}
                          strokeWidth="2"
                          className="cursor-ew-resize"
                          onPointerDown={(e) => onPointerDown(e, m, idx)}
                        />
                      );
                    })}
                    <text x={X(m.pts[1]) + 4} y={Y(1) - 6} fontSize="10" className="font-mono" fill={color}>
                      {m.label}
                    </text>
                    {revealed.fuzz && fuzzified[m.id] > 0.001 && (
                      <circle cx={30 + (temp / 40) * 355} cy={Y(fuzzified[m.id])} r="4.5" fill={color} stroke="var(--dv-surface)" strokeWidth="1.5" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* output MFs + aggregate */}
          <div>
            <p className="dv-kicker mb-1.5">Output — clipped sets, aggregate and centroid</p>
            <svg viewBox="0 0 400 190" className="h-auto w-full" role="img" aria-label="Output membership functions">
              <line x1="30" y1="160" x2="390" y2="160" stroke="var(--dv-border-strong)" strokeWidth="1.2" />
              <line x1="30" y1="160" x2="30" y2="18" stroke="var(--dv-border-strong)" strokeWidth="1.2" />
              {[0, 25, 50, 75, 100].map((t) => (
                <text key={t} x={30 + (t / 100) * 355} y={176} textAnchor="middle" fontSize="9.5" className="fill-[var(--dv-ink-3)] font-mono">
                  {t}%
                </text>
              ))}
              {/* faint full output sets */}
              {outMfs.map((m) => {
                const X = (v: number) => 30 + (v / 100) * 355;
                const Y = (v: number) => 160 - v * 138;
                const pts =
                  m.kind === "tri"
                    ? [{ x: X(m.pts[0]), y: Y(0) }, { x: X(m.pts[1]), y: Y(1) }, { x: X(m.pts[2]), y: Y(0) }]
                    : [{ x: X(m.pts[0]), y: Y(0) }, { x: X(m.pts[1]), y: Y(1) }, { x: X(m.pts[2]), y: Y(1) }, { x: X(m.pts[3]), y: Y(0) }];
                return (
                  <path
                    key={m.id}
                    d={pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="var(--dv-border)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                );
              })}
              {/* revealed clipped sets */}
              {revealed.rules.map((rid) => {
                const r = rules.find((x) => x.id === rid)!;
                const m = outMfs.find((o) => o.id === r.consequent)!;
                const h = fuzzified[r.antecedent];
                const colors: Record<string, string> = { R1: "var(--dv-viz-3)", R2: "var(--dv-primary)", R3: "var(--dv-violet-500)", R4: "var(--dv-success-text)" };
                const color = colors[rid] ?? "var(--dv-primary)";
                const X = (v: number) => 30 + (v / 100) * 355;
                const Y = (v: number) => 160 - Math.min(v, h) * 138;
                const pts =
                  m.kind === "tri"
                    ? [{ x: X(m.pts[0]), y: Y(0) }, { x: X(m.pts[1]), y: Y(1) }, { x: X(m.pts[2]), y: Y(0) }]
                    : [{ x: X(m.pts[0]), y: Y(0) }, { x: X(m.pts[1]), y: Y(1) }, { x: X(m.pts[2]), y: Y(1) }, { x: X(m.pts[3]), y: Y(0) }];
                return (
                  <path
                    key={rid}
                    d={pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")}
                    fill={`color-mix(in srgb, ${color} 12%, transparent)`}
                    stroke={color}
                    strokeWidth="2"
                  />
                );
              })}
              {/* aggregate + centroid */}
              {revealed.centroid && (
                <>
                  <path
                    d={Array.from({ length: 101 }, (_, i) => {
                      const x = 30 + (i / 100) * 355;
                      const y = 160 - aggregate(i) * 138;
                      return `${i === 0 ? "M" : "L"}${x},${y}`;
                    }).join(" ") + " L390,160 L30,160 Z"}
                    fill="color-mix(in srgb, var(--dv-ink) 8%, transparent)"
                    stroke="var(--dv-ink-2)"
                    strokeWidth="1.6"
                  />
                  <line
                    x1={30 + (centroid / 100) * 355}
                    y1="18"
                    x2={30 + (centroid / 100) * 355}
                    y2="160"
                    stroke="var(--dv-danger-text)"
                    strokeWidth="2"
                  />
                  <circle cx={30 + (centroid / 100) * 355} cy="160" r="4" fill="var(--dv-danger-text)" />
                  <text
                    x={Math.min(360, 30 + (centroid / 100) * 355 + 6)}
                    y="30"
                    fontSize="11"
                    className="fill-[var(--dv-danger-text)] font-mono font-bold"
                  >
                    {centroid.toFixed(1)}%
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      </Canvas>

      <StepNarration step={step} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Execution — the Mamdani pipeline">
          <ExecutionControls stepper={stepper} countLabel="stage" />
        </Panel>
        <Panel title="The pipeline, line by line">
          <Pseudocode
            lines={[
              { text: "FUZZIFY: μ_A(x) for each input set A", indent: 0, tone: "key" },
              { text: "ACTIVATE each rule R: A → B", indent: 0 },
              { text: "B' = B clipped at height μ_A(x)   // min", indent: 1, tone: "key" },
              { text: "AGGREGATE: union of all clipped sets // max", indent: 0 },
              { text: "DEFUZZIFY: centroid = Σ μ(x)·x / Σ μ(x)", indent: 0, tone: "key" },
            ]}
            active={step.line}
          />
        </Panel>
      </div>

      <Insights items={insights} />
    </LabFrame>
  );
}
