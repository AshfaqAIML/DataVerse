"use client";

/**
 * core.tsx — the shared primitives every Visual Library component builds
 * on. One visual language: one card chrome, one slider, one segmented
 * control, one coordinate plane with axis labels, one tooltip pattern,
 * one colour system.
 *
 * Colour system: fixed brand hues (the dv-viz ramp) tuned to read on both
 * light and dark card surfaces; ink comes from theme tokens via
 * currentColor, so axes, grids and labels follow the active theme.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Palette — consistent across every visualization, both themes.
// ---------------------------------------------------------------------------

export const C = {
  indigo: "#4A4CC2", // primary curve / class A
  violet: "#8B5CF6", // secondary emphasis
  rose: "#C2415B", // class B / danger / residual
  cyan: "#0E8FA8", // secondary curve / accent
  green: "#0F766E", // success / exact value
  amber: "#B45309", // warning / highlight
  slate: "#64748B", // reference / ghost
  gold: "#A16207", // tangent / tertiary
  ink: "currentColor",
} as const;

/** Colour-blind-safe pair for class A / class B regions and points. */
export const CLASS_A = C.indigo;
export const CLASS_B = "#C2415B";

// ---------------------------------------------------------------------------
// VizCard — the figure chrome every visualization sits inside.
// ---------------------------------------------------------------------------

export function VizCard({
  title,
  subtitle,
  domain,
  controls,
  readouts,
  explanation,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  domain?: "math" | "stats" | "ds";
  controls?: ReactNode;
  readouts?: ReactNode;
  explanation?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const badge =
    domain === "math"
      ? { label: "Mathematics", cls: "bg-viz-2/12 text-viz-2" }
      : domain === "stats"
        ? { label: "Statistics", cls: "bg-viz-9/12 text-viz-9" }
        : domain === "ds"
          ? { label: "Data Science", cls: "bg-viz-4/12 text-viz-4" }
          : null;
  return (
    <figure className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-e1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border-subtle px-5 py-3.5">
        {badge && (
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em]", badge.cls)}>
            {badge.label}
          </span>
        )}
        <div className="min-w-0">
          <figcaption className="text-[15px] font-semibold leading-tight text-ink">{title}</figcaption>
          {subtitle && <p className="mt-0.5 text-xs leading-snug text-ink-3">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
        {controls && <div className="mt-4 space-y-3">{controls}</div>}
        {readouts && <div className="mt-4">{readouts}</div>}
        {explanation && (
          <p className="mt-4 rounded-xl bg-surface-inset px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
            {explanation}
          </p>
        )}
      </div>
      {footer}
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export function VizSlider({
  label,
  symbol,
  value,
  min,
  max,
  step,
  onChange,
  format,
  accent = "accent-viz-2",
}: {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  accent?: string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs font-medium text-ink-2">
      <span className="w-32 shrink-0 text-ink-3">
        {symbol ? <span className="mr-1 font-mono text-ink">{symbol}</span> : null}
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-inset", accent)}
      />
      <span className="w-20 shrink-0 text-right font-mono text-xs tabular text-ink">
        {format ? format(value) : String(value)}
      </span>
    </label>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  segLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string; title?: string }>;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  /** Accessible name for the group, e.g. "Function preset" (WCAG 1.3.1). */
  segLabel?: string;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg bg-surface-inset p-1"
      role="group"
      aria-label={segLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
            value === o.value
              ? "bg-surface text-ink shadow-e1"
              : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function VizButton({
  children,
  onClick,
  variant = "ghost",
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        variant === "primary"
          ? "bg-viz-2 text-white hover:bg-viz-2/85"
          : "border border-border-subtle bg-surface text-ink-2 hover:border-border hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
        active
          ? "border-viz-2/50 bg-viz-2/10 text-viz-2"
          : "border-border-subtle bg-surface text-ink-3 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Readouts — live value chips
// ---------------------------------------------------------------------------

export function Readouts({
  items,
  cols = 4,
}: {
  items: { label: string; value: string; tone?: "default" | "good" | "warn" | "bad" | "accent"; mono?: boolean }[];
  cols?: 2 | 3 | 4 | 5;
}) {
  const colCls =
    cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : cols === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-2 gap-2", colCls)}>
      {items.map((it) => (
        <div
          key={it.label}
          className={cn(
            "rounded-lg border px-3 py-2",
            it.tone === "good" && "border-success-border bg-success-bg",
            it.tone === "warn" && "border-warning-border bg-warning-bg",
            it.tone === "bad" && "border-danger-border bg-danger-bg",
            it.tone === "accent" && "border-viz-2/40 bg-viz-2/8",
            !it.tone && "border-border-subtle bg-surface-inset",
          )}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3">{it.label}</div>
          <div
            className={cn(
              "mt-0.5 text-sm tabular",
              it.mono === false ? "font-medium text-ink" : "font-mono text-ink",
            )}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compact legend row. */
export function Legend({
  items,
  className,
}: {
  items: { color: string; label: string; dashed?: boolean; shape?: "line" | "square" | "dot" }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)} aria-hidden="true">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-2">
          {it.shape === "square" ? (
            <span className="h-2.5 w-3.5 rounded-[3px]" style={{ background: it.color, opacity: it.dashed ? 0.5 : 1 }} />
          ) : it.shape === "dot" ? (
            <span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: it.color }} />
          ) : (
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ background: it.dashed ? "transparent" : it.color, borderTop: it.dashed ? `2px dashed ${it.color}` : undefined }}
            />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plane — a labelled coordinate plane (grid, axes, ticks, axis titles)
// ---------------------------------------------------------------------------

export interface Mapping {
  W: number;
  H: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
  fromX: (px: number) => number;
  fromY: (py: number) => number;
}

interface PlaneProps {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  aspect?: number;
  height?: number;
  /** Hide tick numbers (small multiples). */
  ticks?: boolean;
  ariaLabel?: string;
  onPointer?: (e: ReactPointerEvent<SVGSVGElement>, m: Mapping) => void;
  children: (m: Mapping) => ReactNode;
}

export function Plane({
  xMin,
  xMax,
  yMin,
  yMax,
  xLabel,
  yLabel,
  aspect = 4 / 3,
  ticks = true,
  ariaLabel,
  onPointer,
  children,
}: PlaneProps) {
  const W = 640;
  const H = Math.round(W / aspect);
  const padL = yLabel ? 54 : 34;
  const padR = 14;
  const padT = 14;
  const padB = xLabel ? 40 : 30;
  const toX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const toY = (y: number) => H - padB - ((y - yMin) / (yMax - yMin)) * (H - padT - padB);
  const fromX = (px: number) => xMin + ((px - padL) / (W - padL - padR)) * (xMax - xMin);
  const fromY = (py: number) => yMin + ((H - padB - py) / (H - padT - padB)) * (yMax - yMin);
  const m: Mapping = { W, H, xMin, xMax, yMin, yMax, toX, toY, fromX, fromY };

  const xStep = niceStep(xMax - xMin);
  const yStep = niceStep(yMax - yMin);
  const xAxisY = Math.min(Math.max(toY(0), padT + 6), H - padB - 6);
  const yAxisX = Math.min(Math.max(toX(0), padL + 6), W - padR - 6);

  const els: ReactNode[] = [];
  if (ticks) {
    for (let gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax + 1e-9; gx += xStep) {
      const isZero = Math.abs(gx) < xStep * 1e-6;
      els.push(
        <line
          key={`gx${gx.toFixed(6)}`}
          x1={toX(gx)}
          y1={toY(yMin)}
          x2={toX(gx)}
          y2={toY(yMax)}
          stroke="currentColor"
          strokeWidth={isZero ? 1.3 : 0.5}
          opacity={isZero ? 0.5 : 0.13}
        />,
      );
      if (!isZero) {
        els.push(
          <text
            key={`gxt${gx.toFixed(6)}`}
            x={toX(gx)}
            y={xAxisY + 14}
            textAnchor="middle"
            className="fill-current text-[10.5px] tabular opacity-55"
          >
            {fmtTick(gx)}
          </text>,
        );
      }
    }
    for (let gy = Math.ceil(yMin / yStep) * yStep; gy <= yMax + 1e-9; gy += yStep) {
      const isZero = Math.abs(gy) < yStep * 1e-6;
      els.push(
        <line
          key={`gy${gy.toFixed(6)}`}
          x1={toX(xMin)}
          y1={toY(gy)}
          x2={toX(xMax)}
          y2={toY(gy)}
          stroke="currentColor"
          strokeWidth={isZero ? 1.3 : 0.5}
          opacity={isZero ? 0.5 : 0.13}
        />,
      );
      if (!isZero) {
        els.push(
          <text
            key={`gyt${gy.toFixed(6)}`}
            x={yAxisX - 7}
            y={toY(gy) + 3.5}
            textAnchor="end"
            className="fill-current text-[10.5px] tabular opacity-55"
          >
            {fmtTick(gy)}
          </text>,
        );
      }
    }
  }

  return (
    /* The plane owns its mobile viewport: the plot keeps a readable
       minimum width (CSS .dv-chart-scroll) and pans on narrow screens
       instead of shrinking its type below legibility. `relative` keeps
       crosshair tooltips positioned when no PlaneBox wrapper is used. */
    <div className="dv-chart-scroll relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={ariaLabel}
        style={{ width: "100%", height: "auto", display: "block", userSelect: "none", touchAction: "none" }}
        onPointerMove={onPointer ? (e) => onPointer(e, m) : undefined}
        onPointerDown={onPointer ? (e) => onPointer(e, m) : undefined}
        onPointerUp={onPointer ? (e) => onPointer(e, m) : undefined}
        onPointerLeave={onPointer ? (e) => onPointer(e, m) : undefined}
      >
        {els}
        {children(m)}
        {xLabel && (
          <text x={(padL + W - padR) / 2} y={H - 8} textAnchor="middle" className="fill-current text-[11px] font-semibold opacity-70">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={20}
            y={(padT + H - padB) / 2}
            textAnchor="middle"
            transform={`rotate(-90 20 ${(padT + H - padB) / 2})`}
            className="fill-current text-[11px] font-semibold opacity-70"
          >
            {yLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

export function niceStep(range: number): number {
  const raw = range / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return step * mag;
}

function fmtTick(v: number): string {
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(0).replace("e+", "e");
  return String(Number(v.toFixed(3)));
}

/** Convert sampled segments into an SVG path. */
export function pathOf(m: Mapping, pts: Array<{ x: number; y: number }>): string {
  let d = "";
  pts.forEach((p, i) => {
    d += `${i === 0 ? "M" : "L"} ${m.toX(p.x).toFixed(2)} ${m.toY(p.y).toFixed(2)} `;
  });
  return d.trim();
}

/** Break a curve into visible segments when values leave the frame. */
export function sampleCurve(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  n = 400,
): Array<Array<{ x: number; y: number }>> {
  const segs: Array<Array<{ x: number; y: number }>> = [];
  let cur: Array<{ x: number; y: number }> = [];
  let prev: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    let y: number;
    try {
      y = f(x);
    } catch {
      y = NaN;
    }
    const ok = Number.isFinite(y);
    const jump = prev !== null && Math.abs(y - prev) > (yMax - yMin) * 1.2;
    if (ok && !jump) {
      cur.push({ x, y: Math.max(yMin - (yMax - yMin), Math.min(yMax + (yMax - yMin), y)) });
    } else if (cur.length > 1) {
      segs.push(cur);
      cur = [];
    } else {
      cur = [];
    }
    prev = ok ? y : null;
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

// ---------------------------------------------------------------------------
// Drag + hover machinery
// ---------------------------------------------------------------------------

/**
 * Drag handle inside a Plane. Attach the returned handlers to a <g>; the
 * callback receives data coordinates, already clamped to the frame.
 */
export function usePlaneDrag(onMove: (x: number, y: number) => void) {
  const [dragging, setDragging] = useState(false);
  const onMoveRef = useRef(onMove);
  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  const handleDown = useCallback((e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    e.preventDefault();
  }, []);
  const handleMove = useCallback((e: ReactPointerEvent, m: Mapping) => {
    if (!dragging) return;
    const svg = (e.currentTarget as Element).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * m.W;
    const py = ((e.clientY - rect.top) / rect.height) * m.H;
    onMoveRef.current(
      Math.max(m.xMin, Math.min(m.xMax, m.fromX(px))),
      Math.max(m.yMin, Math.min(m.yMax, m.fromY(py))),
    );
  }, [dragging]);
  const handleUp = useCallback(() => setDragging(false), []);
  /** Keyboard equivalent of dragging (WCAG 2.1.1): arrow keys nudge the
   *  handle in data coordinates — Shift makes the step 4× finer. `getPos`
   *  returns the handle's current data-space position. */
  const handleKeys = useCallback(
    (e: ReactKeyboardEvent, m: Mapping, getPos: () => { x: number; y: number }) => {
      const dx = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      const dy = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0;
      if (dx === 0 && dy === 0) return;
      e.preventDefault();
      const stepX = (m.xMax - m.xMin) / (e.shiftKey ? 160 : 40);
      const stepY = (m.yMax - m.yMin) / (e.shiftKey ? 160 : 40);
      const pos = getPos();
      onMoveRef.current(
        Math.max(m.xMin, Math.min(m.xMax, pos.x + dx * stepX)),
        Math.max(m.yMin, Math.min(m.yMax, pos.y + dy * stepY)),
      );
    },
    [],
  );
  return { dragging, handleDown, handleMove, handleUp, handleKeys };
}

/**
 * Hover tracker for a Plane: returns data coords, SVG pixel coords and
 * a callback for the plane's onPointer. Used for crosshair tooltips.
 */
export function usePlaneHover() {
  const [hover, setHover] = useState<{ x: number; y: number; px: number; py: number; inside: boolean }>({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    inside: false,
  });
  const onPointer = useCallback((e: ReactPointerEvent<SVGSVGElement>, m: Mapping) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const type = e.type;
    if (type === "pointerleave" || type === "pointerup") {
      setHover((h) => ({ ...h, inside: false }));
      return;
    }
    const px = ((e.clientX - rect.left) / rect.width) * m.W;
    const py = ((e.clientY - rect.top) / rect.height) * m.H;
    if (px < 0 || px > m.W || py < 0 || py > m.H) {
      setHover((h) => ({ ...h, inside: false }));
      return;
    }
    setHover({ x: m.fromX(px), y: m.fromY(py), px, py, inside: true });
  }, []);
  return { hover, onPointer };
}

/** An HTML tooltip pinned by percentage over the plane (px/py are SVG
 *  viewBox pixels; W/H the viewBox size). */
export function Tip({ px, py, W, H, children }: { px: number; py: number; W: number; H: number; children: ReactNode }) {
  const style: CSSProperties = {
    position: "absolute",
    left: `${(px / W) * 100}%`,
    top: `${(py / H) * 100}%`,
    transform: "translate(-50%, calc(-100% - 12px))",
    pointerEvents: "none",
    zIndex: 10,
  };
  return (
    <div
      style={style}
      className="whitespace-nowrap rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-ink shadow-e2"
    >
      {children}
    </div>
  );
}

/** Wrapper that gives the tooltip a positioning context. Doubles as the
 *  mobile chart viewport: the plane keeps a readable minimum width and
 *  pans horizontally on narrow screens. */
export function PlaneBox({ children }: { children: ReactNode }) {
  return <div className="dv-chart-scroll relative">{children}</div>;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export function fmtNum(x: number | null | undefined, digits = 2): string {
  if (x === null || x === undefined || Number.isNaN(x) || !Number.isFinite(x)) return "—";
  if (Math.abs(x) >= 1e6 || (Math.abs(x) < 1e-4 && x !== 0)) return x.toExponential(2);
  return String(Number(x.toFixed(digits)));
}

/** Pretty signed number for readouts: "+3.2", "−1.5", "0". */
export function fmtSigned(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "—";
  const s = Math.abs(x) < 0.5 * 10 ** -digits ? "0" : Math.abs(x).toFixed(digits);
  return x < 0 ? `−${s}` : `+${s}`;
}
