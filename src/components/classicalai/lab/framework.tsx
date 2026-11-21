"use client";

/**
 * The Classical AI Laboratory framework — the shared engine under all nine
 * labs. Every lab runs GENUINE algorithm logic as a pure step-generator
 * (run to completion up front, deterministically); this file turns those
 * step lists into the interaction: play / pause / step / reset / speed,
 * the narration strip, the execution controls, pseudocode highlighting and
 * the panel chrome. No canned animations anywhere — the step data IS the
 * algorithm's execution trace.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- the engine */

/** Every lab's steps carry at least a narration note; most also tag a
 *  pseudocode line and a phase for the badge. */
export interface LabStep {
  note: string;
  /** Index into the lab's pseudocode lines, when the lab shows one. */
  line?: number;
  /** Short phase label, e.g. "expand", "propagate", "backtrack". */
  phase?: string;
}

export interface Stepper<T extends LabStep> {
  step: T;
  index: number;
  total: number;
  atEnd: boolean;
  playing: boolean;
  speed: number;
  setSpeed: (s: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  seek: (i: number) => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export function useStepper<T extends LabStep>(steps: T[]): Stepper<T> {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const total = steps.length;

  // new run → rewind and stop (the timeout keeps the reset out of the
  // render/effect synchronous path; 0ms is imperceptible and cancellable)
  useEffect(() => {
    const t = setTimeout(() => {
      setIndex(0);
      setPlaying(false);
    }, 0);
    return () => clearTimeout(t);
  }, [steps]);

  const clamped = Math.min(index, total - 1);
  const atEnd = clamped >= total - 1;
  const live = playing && !atEnd;

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => setIndex((x) => Math.min(x + 1, total - 1)), 850 / speed);
    return () => clearTimeout(t);
  }, [live, total, speed]);

  const seek = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, total - 1))), [total]);

  return {
    step: steps[clamped],
    index: clamped,
    total,
    atEnd,
    playing: live,
    speed,
    setSpeed,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => {
      if (atEnd) {
        setIndex(0);
        setPlaying(true);
      } else {
        setPlaying((p) => !p);
      }
    },
    next: () => {
      setPlaying(false);
      seek(clamped + 1);
    },
    prev: () => {
      setPlaying(false);
      seek(clamped - 1);
    },
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
    seek,
  };
}

/* --------------------------------------------------------- execution UI */

export function ExecutionControls({ stepper, countLabel }: { stepper: Stepper<LabStep>; countLabel?: string }) {
  const { playing, toggle, next, prev, reset, index, total, speed, setSpeed, seek } = stepper;
  // keyboard: space toggles, arrows step
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, next, prev]);

  return (
    <div className="select-none">
      <div className="flex items-center gap-1.5">
        <IconBtn label="Reset" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Step back" onClick={prev} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4" />
        </IconBtn>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold shadow-e1 dv-lift",
            playing
              ? "bg-surface-inset text-ink hover:bg-surface-subtle"
              : "bg-primary text-primary-foreground hover:bg-primary-hover"
          )}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pause" : stepper.atEnd ? "Replay" : "Run"}
        </button>
        <IconBtn label="Step forward" onClick={next} disabled={stepper.atEnd}>
          <ChevronRight className="h-4 w-4" />
        </IconBtn>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-md px-1.5 py-1 font-mono text-[11px] transition-colors",
                speed === s ? "bg-surface text-ink shadow-e1" : "text-ink-3 hover:text-ink"
              )}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
      {/* the progress rail doubles as a scrubber */}
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="tabular shrink-0 font-mono text-[11px] text-ink-3">
          {countLabel ?? "step"} {index + 1}/{total}
        </span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-viz-3 transition-[width] duration-200"
            style={{ width: `${total <= 1 ? 100 : ((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      {total > 3 && (
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={total - 1}
          value={index}
          onChange={(e) => seek(Number(e.target.value))}
          className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-ink-2 transition-colors hover:bg-surface-subtle hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------- narration strip */

export function StepNarration({ step }: { step: LabStep }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 shadow-e1">
      {step.phase && (
        <span className="mt-0.5 shrink-0 rounded-md bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-viz-3">
          {step.phase}
        </span>
      )}
      <p key={step.note} className="dv-rise min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink-2">
        {step.note}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- panel kit */

export function Panel({
  title,
  right,
  children,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border-subtle bg-surface shadow-e1", className)}>
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
        <h3 className="dv-kicker">{title}</h3>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function ChipRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-1.5", className)}>{children}</div>;
}

export function Chip({
  active,
  onClick,
  children,
  hue,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  hue?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-[12px] font-medium dv-lift",
        active
          ? "border-transparent text-white shadow-e1"
          : "border-border-subtle bg-surface text-ink-2 hover:border-border-strong hover:text-ink"
      )}
      style={active ? { backgroundColor: hue ?? "var(--dv-primary)" } : undefined}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-2">
      <p className="font-mono text-[9.5px] uppercase tracking-wider text-ink-3">{label}</p>
      <p className="tabular mt-0.5 font-mono text-[14px] font-semibold" style={tone ? { color: tone } : undefined}>
        {value}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- pseudocode */

export interface PseudoLine {
  text: string;
  indent?: number;
  tone?: "default" | "key";
}

export function Pseudocode({ lines, active }: { lines: PseudoLine[]; active?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-editor-border bg-editor-bg p-0 shadow-e1">
      <div className="min-w-[280px] font-mono text-[12px] leading-[1.75]">
        {lines.map((l, i) => {
          const on = active === i;
          return (
            <div
              key={i}
              className={cn(
                "flex items-baseline gap-3 px-3 transition-colors duration-150",
                on && "bg-[color-mix(in_srgb,var(--dv-viz-3)_22%,transparent)]"
              )}
            >
              <span className={cn("w-4 shrink-0 select-none text-right text-editor-gutter", on && "text-editor-ink")}>
                {i + 1}
              </span>
              <span
                className={cn("whitespace-pre", l.tone === "key" ? "font-semibold text-editor-ink" : "text-editor-ink")}
                style={{ opacity: l.tone === "key" ? 1 : on ? 1 : 0.82 }}
              >
                {"  ".repeat(l.indent ?? 0)}
                {l.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ lab frame */

export function LabFrame({
  title,
  kicker,
  description,
  children,
  aside,
}: {
  title: string;
  kicker: string;
  description: string;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <header className="max-w-3xl">
        <p className="eyebrow text-viz-3">{kicker}</p>
        <h2 className="t-title mt-1.5 text-ink">{title}</h2>
        <p className="t-body mt-2">{description}</p>
      </header>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">{children}</div>
        <div className="min-w-0 space-y-4">{aside}</div>
      </div>
    </div>
  );
}

/** The canvas well labs draw inside (SVG etc.). */
export function Canvas({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("figure-well overflow-hidden p-2 shadow-e1 sm:p-3", className)}>{children}</div>;
}

/** Educational insight items — computed by each lab from REAL results. */
export function Insights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Panel title="What to notice">
      <ul className="space-y-2.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
            <span className="tabular mt-0.5 shrink-0 font-mono text-[11px] font-bold text-viz-3">{String(i + 1).padStart(2, "0")}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Simple controlled number slider row used across labs. */
export function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-ink-2">{label}</span>
        <span className="tabular font-mono text-[12px] text-viz-3">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-subtle accent-[var(--dv-viz-3)]"
      />
    </label>
  );
}

/** Hook: stable SVG point transform from a 0–100 author grid. */
export function useGraphGeometry(width: number, height: number, pad = 8) {
  return useMemo(() => {
    const x0 = pad;
    const y0 = pad;
    const w = width - 2 * pad;
    const h = height - 2 * pad;
    return {
      px: (x: number) => x0 + (x / 100) * w,
      py: (y: number) => y0 + (y / 100) * h,
    };
  }, [width, height, pad]);
}

/** Drag interaction over an SVG (returns handler props for a node element). */
export function useSvgDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onMove: (dx: number, dy: number, e: PointerEvent) => void
) {
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, []);
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = (svgRef.current.viewBox.baseVal.width || rect.width) / rect.width;
      const scaleY = (svgRef.current.viewBox.baseVal.height || rect.height) / rect.height;
      const dx = (e.clientX - dragging.current.x) * scaleX;
      const dy = (e.clientY - dragging.current.y) * scaleY;
      dragging.current = { x: e.clientX, y: e.clientY };
      onMove(dx, dy, e.nativeEvent);
    },
    [svgRef, onMove]
  );
  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);
  return { onPointerDown, onPointerMove, onPointerUp };
}
