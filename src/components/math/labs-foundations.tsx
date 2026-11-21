"use client";

/**
 * Foundations labs — number sense made touchable:
 *   NumberLineLab   zoom from whole numbers to hundredths; compare two values
 *   FractionStudio  pie + reduced fraction + decimal (repeat detection) + percent
 *   RatioBars       bar models, unit value, proportional scaling
 *   LogScaleLab     the same value on a linear and a logarithmic axis
 *   SequenceLab     arithmetic / geometric / Fibonacci term plots
 */
import { useMemo, useState } from "react";
import { LabShell, LabSlider, Readout } from "./plotframe";
import { frac, fracToString, decimalExpansion, toPercent, gcd, cleanNumber } from "@/lib/mathcourse/numeric";

// ---------------------------------------------------------------------------

export function NumberLineLab() {
  const [zoom, setZoom] = useState(0); // 0 units, 1 tenths, 2 hundredths
  const [a, setA] = useState(-1.3);
  const [b, setB] = useState(2.45);

  const span = zoom === 0 ? 10 : zoom === 1 ? 1 : 0.1;
  const center = zoom === 0 ? 0 : a;
  const xMin = center - span * 1.6;
  const xMax = center + span * 1.6;
  const step = zoom === 0 ? 1 : zoom === 1 ? 0.1 : 0.01;

  const W = 640;
  const H = 150;
  const pad = 42;
  const toX = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (W - 2 * pad);
  const ticks: number[] = [];
  for (let t = Math.ceil(xMin / step) * step; t <= xMax + 1e-9; t += step) ticks.push(Number(t.toFixed(4)));

  const cmp = a < b ? "a is LEFT of b (a < b)" : a > b ? "a is RIGHT of b (a > b)" : "a equals b";
  const distance = cleanNumber(Math.abs(b - a));

  return (
    <LabShell
      title="Number line explorer"
      hint="Drag the sliders, then zoom in: between any two numbers there are always more numbers — that is what decimals live on."
      onReset={() => { setZoom(0); setA(-1.3); setB(2.45); }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Number line with two draggable values">
        <line x1={pad - 20} y1={80} x2={W - pad + 20} y2={80} stroke="currentColor" strokeWidth={1.8} />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={74} x2={toX(t)} y2={86} stroke="currentColor" strokeWidth={1.2} opacity={0.8} />
            <text x={toX(t)} y={106} textAnchor="middle" fontSize={10.5} className="fill-current opacity-70">
              {zoom === 0 ? t : t.toFixed(zoom === 1 ? 1 : 2)}
            </text>
          </g>
        ))}
        <line x1={toX(a)} y1={38} x2={toX(a)} y2={80} stroke="#7c3aed" strokeWidth={1.6} strokeDasharray="3 3" />
        <circle cx={toX(a)} cy={80} r={6} fill="#7c3aed" />
        <text x={toX(a)} y={30} textAnchor="middle" fontSize={13} fontWeight={700} fill="#7c3aed">a = {a.toFixed(zoom === 0 ? 1 : 2)}</text>
        <line x1={toX(b)} y1={38} x2={toX(b)} y2={80} stroke="#0ea5e9" strokeWidth={1.6} strokeDasharray="3 3" />
        <circle cx={toX(b)} cy={80} r={6} fill="#0ea5e9" />
        <text x={toX(b)} y={30} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0ea5e9">b = {b.toFixed(zoom === 0 ? 1 : 2)}</text>
        <line x1={toX(a)} y1={126} x2={toX(b)} y2={126} stroke="#059669" strokeWidth={3} />
        <text x={(toX(a) + toX(b)) / 2} y={121} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="#059669">distance = |b − a| = {distance}</text>
      </svg>
      <div className="mt-4 space-y-2.5">
        <LabSlider label="a" min={xMin} max={xMax} step={step} value={a} onChange={setA} format={(v) => v.toFixed(zoom === 0 ? 1 : 2)} />
        <LabSlider label="b" min={xMin} max={xMax} step={step} value={b} onChange={setB} format={(v) => v.toFixed(zoom === 0 ? 1 : 2)} />
        <div className="flex gap-2 pt-1">
          {["Whole numbers", "Tenths", "Hundredths"].map((z, i) => (
            <button key={z} type="button" onClick={() => setZoom(i)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (zoom === i ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>
              {z}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Readout items={[{ label: "Order", value: cmp }, { label: "Distance", value: distance }, { label: "Midpoint", value: cleanNumber((a + b) / 2) }]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

export function FractionStudio() {
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(4);
  const safeDen = Math.max(1, den);
  const f = frac(num, safeDen);
  const dec = decimalExpansion(f);
  const value = num / safeDen;

  const cx = 150, cy = 130, r = 100;
  const start = -Math.PI / 2;
  let slices = "";
  for (let i = 0; i < Math.min(num, safeDen); i++) {
    const a0 = start + (i / safeDen) * 2 * Math.PI;
    const a1 = start + ((i + 1) / safeDen) * 2 * Math.PI;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    slices += `<path d="M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="rgba(124,58,237,0.55)" stroke="#7c3aed" stroke-width="1.4"/>`;
  }
  let spokes = "";
  for (let i = 0; i < safeDen; i++) {
    const a = start + (i / safeDen) * 2 * Math.PI;
    spokes += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="currentColor" stroke-width="1" opacity="0.5"/>`;
  }

  return (
    <LabShell
      title="Fraction studio"
      hint="Same amount, four costumes: a fraction, a division, a decimal, a percentage. Change the slices and watch all four agree."
      onReset={() => { setNum(3); setDen(4); }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[300px_1fr]">
        <svg viewBox="0 0 300 268" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Fraction pie with ${num} of ${safeDen} slices shaded`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={1.8} />
          {spokes}
          {slices}
          <text x={cx} y={cy + r + 36} textAnchor="middle" fontSize={15} fontWeight={600} className="fill-current">
            {num} of {safeDen} equal parts
          </text>
        </svg>
        <div className="space-y-2.5">
          <LabSlider label="Numerator" min={0} max={12} step={1} value={num} onChange={setNum} />
          <LabSlider label="Denominator" min={1} max={12} step={1} value={safeDen} onChange={setDen} />
          <div className="pt-1">
            <Readout items={[
              { label: "Fraction", value: `${num}/${safeDen}` },
              { label: "Reduced", value: fracToString(f), tone: "good" },
              { label: "As division", value: `${num} ÷ ${safeDen}` },
              { label: "Decimal", value: dec.text },
              { label: "Percent", value: toPercent(value), tone: "good" },
              { label: "Of 100", value: `${cleanNumber(value * 100)} out of 100` },
            ]} />
          </div>
        </div>
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

export function RatioBars() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [total, setTotal] = useState(50);
  const g = gcd(a, b) || 1;
  const parts = a + b;
  const shareA = (a / parts) * total;
  const shareB = (b / parts) * total;

  return (
    <LabShell
      title="Ratio bars"
      hint="A ratio is a recipe for shares. Keep the ratio, change the total — every share scales together."
      onReset={() => { setA(3); setB(2); setTotal(50); }}
    >
      <svg viewBox="0 0 620 210" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Bar model of a ratio">
        {[
          { label: `Share A (${a} parts)`, w: a / parts, color: "#7c3aed", text: cleanNumber(shareA) },
          { label: `Share B (${b} parts)`, w: b / parts, color: "#0ea5e9", text: cleanNumber(shareB) },
          { label: "Total", w: 1, color: "#059669", text: cleanNumber(total) },
        ].map((row, i) => {
          const y = 26 + i * 62;
          const full = 420;
          return (
            <g key={row.label}>
              <text x="140" y={y + 28} textAnchor="end" fontSize={13} fontWeight={600} className="fill-current">{row.label}</text>
              <rect x="150" y={y} width={full} height={40} rx="7" fill="rgba(127,127,127,0.12)" />
              <rect x="150" y={y} width={full * row.w} height={40} rx="7" fill={row.color} opacity="0.82" />
              <text x={160 + full * row.w - (row.w === 1 ? 60 : 10)} y={y + 25} fontSize={14} fontWeight={700} fill="white">{row.text}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-4 space-y-2.5">
        <LabSlider label="A parts" min={1} max={10} step={1} value={a} onChange={setA} />
        <LabSlider label="B parts" min={1} max={10} step={1} value={b} onChange={setB} />
        <LabSlider label="Total to split" min={5} max={500} step={5} value={total} onChange={setTotal} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Ratio", value: `${a}:${b}`, tone: "good" },
          { label: "Simplest form", value: `${a / g}:${b / g}` },
          { label: "One part worth", value: cleanNumber(total / parts) },
          { label: "Share A", value: cleanNumber(shareA) },
          { label: "Share B", value: cleanNumber(shareB) },
          { label: "A as %", value: toPercent(a / parts) },
        ]} />
      </div>
    </LabShell>
  );
}

// ---------------------------------------------------------------------------

export function LogScaleLab() {
  const [exponent, setExponent] = useState(3);
  const value = Math.pow(10, exponent);
  const W = 640, H = 190;
  const linMin = 0, linMax = 1_000_000;
  const linX = (v: number) => 50 + (v / linMax) * (W - 90);
  const logX = (e: number) => 50 + ((e + 1) / 7) * (W - 90); // e from -1..6

  return (
    <LabShell
      title="Linear vs logarithmic scale"
      hint="Where does 1,000 sit? On the linear ruler it is far right of 100,000's shadow; on the log ruler every ×10 step gets the same room. Multiplication becomes addition."
      onReset={() => setExponent(3)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Linear and logarithmic number lines compared">
        <text x="50" y="24" fontSize={12.5} fontWeight={700} className="fill-current opacity-80">Linear ruler (0 to 1,000,000)</text>
        <line x1="50" y1="40" x2={W - 40} y2="40" stroke="currentColor" strokeWidth={1.6} />
        {[0, 250_000, 500_000, 750_000, 1_000_000].map((t) => (
          <g key={t}>
            <line x1={linX(t)} y1="34" x2={linX(t)} y2="46" stroke="currentColor" strokeWidth={1.2} />
            <text x={linX(t)} y="60" textAnchor="middle" fontSize={10} className="fill-current opacity-60">{t === 0 ? "0" : t / 1000 + "k"}</text>
          </g>
        ))}
        <circle cx={Math.min(linX(value), W - 40)} cy="40" r="6" fill="#7c3aed" />
        <text x={Math.min(linX(value), W - 120)} y="28" fontSize="12" fontWeight={700} fill="#7c3aed">10^{exponent} = {value >= 1000 ? value.toLocaleString("en-US") : value}</text>

        <text x="50" y="106" fontSize={12.5} fontWeight={700} className="fill-current opacity-80">Logarithmic ruler (every step is ×10)</text>
        <line x1="50" y1="122" x2={W - 40} y2="122" stroke="currentColor" strokeWidth={1.6} />
        {[-1, 0, 1, 2, 3, 4, 5, 6].map((e) => (
          <g key={e}>
            <line x1={logX(e)} y1="116" x2={logX(e)} y2="128" stroke="currentColor" strokeWidth={1.2} />
            <text x={logX(e)} y="144" textAnchor="middle" fontSize={10.5} className="fill-current opacity-70">10{sup(e)}</text>
          </g>
        ))}
        <circle cx={logX(exponent)} cy="122" r="6" fill="#7c3aed" />
        <text x={logX(exponent)} y="168" textAnchor="middle" fontSize="12" fontWeight={700} fill="#7c3aed">same number, same room as its neighbours</text>
      </svg>
      <div className="mt-4">
        <LabSlider label="Exponent" min={-1} max={6} step={1} value={exponent} onChange={setExponent}
          format={(v) => `10^${v} = ${Math.pow(10, v).toLocaleString("en-US")}`} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Value", value: Math.pow(10, exponent).toLocaleString("en-US") },
          { label: "log₁₀(value)", value: String(exponent), tone: "good" },
          { label: "Digits", value: String(String(Math.floor(Math.pow(10, Math.max(exponent, 0)))).length) },
        ]} />
      </div>
    </LabShell>
  );
}

function sup(e: number): string {
  const map: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" };
  return String(e).split("").map((c) => map[c] ?? c).join("");
}

// ---------------------------------------------------------------------------

export function SequenceLab() {
  const [kind, setKind] = useState<"arithmetic" | "geometric" | "fibonacci">("arithmetic");
  const [a1, setA1] = useState(2);
  const [d, setD] = useState(3);
  const [n, setN] = useState(8);

  const terms = useMemo(() => {
    const out: number[] = [];
    if (kind === "arithmetic") {
      for (let i = 0; i < n; i++) out.push(a1 + i * d);
    } else if (kind === "geometric") {
      for (let i = 0; i < n; i++) out.push(a1 * Math.pow(d, i));
    } else {
      let p = 0, q = 1;
      for (let i = 0; i < n; i++) {
        out.push(q);
        [p, q] = [q, p + q];
      }
    }
    return out;
  }, [kind, a1, d, n]);

  const maxAbs = Math.max(...terms.map(Math.abs), 1);
  const W = 640, H = 240;
  const barW = (W - 60) / n;

  return (
    <LabShell
      title="Sequence explorer"
      hint="An arithmetic sequence adds the same step each time (a straight line of values); a geometric one multiplies (that is where exponential growth begins)."
      onReset={() => { setKind("arithmetic"); setA1(2); setD(3); setN(8); }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Sequence term plot">
        <line x1="30" y1={H - 30} x2={W - 10} y2={H - 30} stroke="currentColor" strokeWidth={1.4} />
        {terms.map((t, i) => {
          const h = (Math.abs(t) / maxAbs) * (H - 70);
          const x = 36 + i * barW;
          const positive = t >= 0;
          return (
            <g key={i}>
              <rect x={x} y={positive ? H - 30 - h : H - 30} width={Math.max(barW - 8, 6)} height={Math.max(h, 1)} rx="3"
                fill={positive ? "#7c3aed" : "#dc2626"} opacity="0.85" />
              <text x={x + (barW - 8) / 2} y={H - 12} textAnchor="middle" fontSize={10.5} className="fill-current opacity-60">n={i + 1}</text>
              <text x={x + (barW - 8) / 2} y={(positive ? H - 34 - h : H - 30 + h) - 4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={positive ? "#7c3aed" : "#dc2626"}>
                {cleanNumber(t, 4)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-4 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {(["arithmetic", "geometric", "fibonacci"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)}
              className={
                "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors " +
                (kind === k ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300" : "border-border text-muted-foreground hover:text-foreground")
              }>
              {k}
            </button>
          ))}
        </div>
        {kind !== "fibonacci" && (
          <>
            <LabSlider label={kind === "arithmetic" ? "First term a₁" : "First term a₁"} min={-10} max={10} step={1} value={a1} onChange={setA1} />
            <LabSlider label={kind === "arithmetic" ? "Step d (add)" : "Ratio r (multiply)"} min={-4} max={4} step={0.5} value={d} onChange={setD} format={(v) => String(v)} />
          </>
        )}
        <LabSlider label="Terms shown" min={4} max={12} step={1} value={n} onChange={setN} />
      </div>
      <div className="mt-4">
        <Readout items={[
          { label: "Rule", value: kind === "arithmetic" ? `aₙ = ${a1} + (n−1)·${d}` : kind === "geometric" ? `aₙ = ${a1} · ${d}ⁿ⁻¹` : "aₙ = aₙ₋₁ + aₙ₋₂", tone: "good" },
          { label: "Next term", value: cleanNumber(kind === "arithmetic" ? terms[terms.length - 1] + d : kind === "geometric" ? terms[terms.length - 1] * d : terms[terms.length - 1] + terms[terms.length - 2], 4) },
          { label: "Sum so far", value: cleanNumber(terms.reduce((s, t) => s + t, 0), 4) },
        ]} />
      </div>
    </LabShell>
  );
}
