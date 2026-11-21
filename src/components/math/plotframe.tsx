"use client";

/**
 * PlotFrame — the shared SVG plotting primitive every math visualization
 * builds on: a responsive plot area with grid, axes, tick labels and a
 * math->pixel mapping, plus a drag-helper used by the interactive labs.
 */
import { useCallback, useRef, useState, type ReactNode } from "react";

export interface PlotMapping {
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

interface PlotFrameProps {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  height?: number;
  aspect?: number; // W / H
  children: (m: PlotMapping) => ReactNode;
  ariaLabel?: string;
}

export function PlotFrame({ xMin, xMax, yMin, yMax, height = 300, aspect = 4 / 3, children, ariaLabel }: PlotFrameProps) {
  const W = 640;
  const H = Math.round(W / aspect);
  const padL = 8;
  const padR = 8;
  const padT = 8;
  const padB = 8;
  const toX = useCallback((x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR), [xMin, xMax, W]);
  const toY = useCallback((y: number) => H - padB - ((y - yMin) / (yMax - yMin)) * (H - padT - padB), [yMin, yMax, H]);
  const fromX = useCallback((px: number) => xMin + ((px - padL) / (W - padL - padR)) * (xMax - xMin), [xMin, xMax, W]);
  const fromY = useCallback((py: number) => yMin + ((H - padB - py) / (H - padT - padB)) * (yMax - yMin), [yMin, yMax, H]);

  const m: PlotMapping = { W, H, xMin, xMax, yMin, yMax, toX, toY, fromX, fromY };

  const xStep = niceStep(xMax - xMin);
  const yStep = niceStep(yMax - yMin);

  const gridLines: ReactNode[] = [];
  for (let gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax + 1e-9; gx += xStep) {
    const isZero = Math.abs(gx) < xStep * 1e-6;
    gridLines.push(
      <line key={`gx${gx.toFixed(6)}`} x1={toX(gx)} y1={toY(yMin)} x2={toX(gx)} y2={toY(yMax)}
        className="text-foreground" stroke="currentColor" strokeWidth={isZero ? 1.4 : 0.5} opacity={isZero ? 0.55 : 0.14} />
    );
    if (!isZero) {
      gridLines.push(
        <text key={`gxt${gx.toFixed(6)}`} x={toX(gx)} y={toY(Math.max(0, yMin)) + 14} textAnchor="middle"
          className="fill-current text-[11px] opacity-60" >{fmtTick(gx)}</text>
      );
    }
  }
  for (let gy = Math.ceil(yMin / yStep) * yStep; gy <= yMax + 1e-9; gy += yStep) {
    const isZero = Math.abs(gy) < yStep * 1e-6;
    gridLines.push(
      <line key={`gy${gy.toFixed(6)}`} x1={toX(xMin)} y1={toY(gy)} x2={toX(xMax)} y2={toY(gy)}
        className="text-foreground" stroke="currentColor" strokeWidth={isZero ? 1.4 : 0.5} opacity={isZero ? 0.55 : 0.14} />
    );
    if (!isZero) {
      gridLines.push(
        <text key={`gyt${gy.toFixed(6)}`} x={toX(Math.min(0, xMin)) - 6} y={toY(gy) + 4} textAnchor="end"
          className="fill-current text-[11px] opacity-60">{fmtTick(gy)}</text>
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}
      style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}>
      {gridLines}
      {children(m)}
    </svg>
  );
}

function niceStep(range: number): number {
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

/** Convert sampled segments into SVG polylines. */
export function curvePaths(
  m: PlotMapping,
  segments: Array<Array<{ x: number; y: number }>>,
): string[] {
  return segments.map((seg) =>
    seg.map((p, i) => `${i === 0 ? "M" : "L"} ${m.toX(p.x).toFixed(2)} ${m.toY(p.y).toFixed(2)}`).join(" ")
  );
}

/** A draggable handle inside a PlotFrame (pointer events, clamp to bounds). */
export function useDrag(onMove: (x: number, y: number) => void) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<SVGGElement | null>(null);

  const handleDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    e.preventDefault();
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent, m: PlotMapping) => {
      if (!dragging) return;
      const svg = (e.currentTarget as Element).closest("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scale = m.W / rect.width;
      const px = (e.clientX - rect.left) * scale;
      const py = (e.clientY - rect.top) * scale;
      onMove(m.fromX(px), m.fromY(py));
    },
    [dragging, onMove]
  );

  const handleUp = useCallback(() => setDragging(false), []);

  return { dragging, ref, handleDown, handleMove, handleUp };
}

/** Consistent lab chrome: card wrapper with title, controls area, readouts. */
export function LabShell({
  title,
  hint,
  onReset,
  children,
  controls,
  readouts,
}: {
  title: string;
  hint?: string;
  onReset?: () => void;
  children: ReactNode;
  controls?: ReactNode;
  readouts?: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-violet-200/70 bg-card dark:border-violet-900/50">
      <figcaption className="flex items-center gap-2 border-b border-violet-200/60 bg-violet-50/60 px-4 py-2.5 dark:border-violet-900/50 dark:bg-violet-950/30">
        <span className="inline-flex h-5 items-center rounded bg-violet-600 px-1.5 text-[11px] font-bold tracking-wide text-white">LAB</span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {onReset && (
          <button type="button" onClick={onReset}
            className="ml-auto rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Reset
          </button>
        )}
      </figcaption>
      <div className="p-4">
        {children}
        {controls && <div className="mt-4 space-y-3">{controls}</div>}
        {readouts && <div className="mt-4">{readouts}</div>}
        {hint && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
    </figure>
  );
}

/** Styled range slider (violet accent), with label + live value. */
export function LabSlider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="w-28 shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-violet-600"
      />
      <span className="w-20 shrink-0 text-right font-mono text-xs text-foreground">
        {format ? format(value) : String(value)}
      </span>
    </label>
  );
}

/** A grid of live value chips. */
export function Readout({ items }: { items: { label: string; value: string; tone?: "default" | "good" | "warn" }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label}
          className={
            "rounded-lg border px-3 py-2 " +
            (it.tone === "good"
              ? "border-success-border bg-success-bg"
              : it.tone === "warn"
                ? "border-warning-border bg-warning-bg"
                : "border-border bg-muted/40")
          }>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{it.label}</div>
          <div className="mt-0.5 font-mono text-sm text-foreground">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
