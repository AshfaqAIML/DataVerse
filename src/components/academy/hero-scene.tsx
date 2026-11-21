"use client";

/**
 * HeroScene — the homepage's interactive hero visual.
 *
 * A composed "ascent of a learner" scene:
 *   - an SVG backdrop: the brand's open arc sweeping upward through four
 *     milestone nodes (foundations → code → data → intelligence), drafting
 *     grid marks and a fine orbit ring
 *   - three floating HTML cards, each showing something REAL:
 *       · a terminal that types actual course snippets and their verified
 *         outputs (cycling, reduced-motion aware)
 *       · a mathematics card set in the platform's math CSS layer
 *       · a registry card with live curriculum numbers and dot leaders
 *   - a gentle pointer parallax (transform-only, rAF-throttled, disabled
 *     under prefers-reduced-motion)
 *
 * Every number on screen comes from the curriculum registry at runtime.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { curriculum } from "@/lib/curriculum/data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ typed terminal */

interface Snippet {
  file: string;
  lang: "python" | "sql";
  code: string;
  out: string;
}

/** Real, deterministic snippets — the third one counts the live registry. */
function buildSnippets(): Snippet[] {
  const manifest = curriculum.stats();
  return [
    {
      file: "lesson-01.py",
      lang: "python",
      code: 'print("Hello, DataVerse!")',
      out: "Hello, DataVerse!",
    },
    {
      file: "describing.py",
      lang: "python",
      code: "sum([62, 71, 88, 95]) / 4",
      out: "79.0",
    },
    {
      file: "registry.sql",
      lang: "sql",
      code: "SELECT COUNT(*) FROM lessons;",
      out: `${manifest.lessons.toLocaleString()} rows`,
    },
  ];
}

type TermPhase = "typing" | "ran" | "verified";

interface TermState {
  idx: number;
  chars: number;
  phase: TermPhase;
}

/**
 * Cycles code → output → verified, snippet by snippet. Reduced-motion users
 * get a complete, static first snippet (no cycling, no caret).
 */
function useTerminal(snippets: Snippet[]) {
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [{ idx, chars, phase }, setT] = useState<TermState>({
    idx: 0,
    chars: 0,
    phase: "typing",
  });

  useEffect(() => {
    if (reduce) {
      // Reduced motion: one deliberate sync to a complete, static snippet —
      // no cycling, no caret. (setState here is the whole point of effect.)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setT({ idx: 0, chars: snippets[0].code.length, phase: "verified" });
      return;
    }
    const snippet = snippets[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (chars < snippet.code.length) {
        timer = setTimeout(() => setT((t) => ({ ...t, chars: t.chars + 1 })), 34 + Math.random() * 30);
      } else {
        timer = setTimeout(() => setT((t) => ({ ...t, phase: "ran" })), 420);
      }
    } else if (phase === "ran") {
      timer = setTimeout(() => setT((t) => ({ ...t, phase: "verified" })), 620);
    } else {
      timer = setTimeout(
        () => setT({ idx: (idx + 1) % snippets.length, chars: 0, phase: "typing" }),
        2100
      );
    }
    return () => clearTimeout(timer);
  }, [chars, phase, idx, snippets, reduce]);

  return { idx, chars, phase, reduce };
}

function TerminalCard() {
  const snippets = useMemo(() => buildSnippets(), []);
  const { idx, chars, phase, reduce } = useTerminal(snippets);
  const snippet = snippets[idx];
  const shown = snippet.code.slice(0, chars);
  const done = phase !== "typing";

  return (
    <div className="w-full overflow-hidden rounded-xl border border-editor-border bg-editor-bg shadow-e3">
      {/* chrome */}
      <div className="flex items-center gap-2 border-b border-editor-border bg-editor-chrome px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-editor-dot" />
          <span className="h-2 w-2 rounded-full bg-editor-dot" />
          <span className="h-2 w-2 rounded-full bg-editor-dot" />
        </span>
        <span className="font-mono text-[11px] text-editor-ink/80">{snippet.file}</span>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-editor-ink/80">
          {snippet.lang === "sql" ? "postgres · wasm" : "python · wasm"}
        </span>
      </div>
      {/* code + output */}
      <div className="space-y-1.5 px-3.5 py-3 font-mono text-[12px] leading-relaxed">
        <p className="whitespace-pre text-editor-ink">
          <span className="select-none text-editor-gutter">› </span>
          {shown}
          {!reduce && phase === "typing" && (
            <span className="dv-blink ml-px inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-editor-ok/90" />
          )}
        </p>
        <p
          className={cn(
            "whitespace-pre text-editor-ink/85 transition-opacity duration-300",
            done ? "opacity-100" : "opacity-0"
          )}
        >
          {snippet.out}
        </p>
        <p
          className={cn(
            "flex items-center gap-1.5 text-[10.5px] text-editor-ok transition-opacity duration-300",
            phase === "verified" ? "opacity-100" : "opacity-0"
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          machine-verified
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- formula card */

function FormulaCard() {
  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3.5 shadow-e2 dark:border-border dark:bg-surface-raised">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">School B · Foundations</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[17px] text-ink">
        <span className="math-it">x̄</span>
        <span className="math-rel">=</span>
        <span className="math-frac">
          <span className="math-frac-row">
            <span className="math-frac-num math-it">1</span>
            <span className="math-frac-den math-it">n</span>
          </span>
        </span>
        <span className="math-bigop">
          <span className="math-bigop-stack">
            <span className="math-bigop-upper math-it">n</span>
            <span className="math-bigop-glyph">Σ</span>
            <span className="math-bigop-lower math-it">i=1</span>
          </span>
          <span className="math-bigop-body math-it">
            x<sub className="math-sub">i</sub>
          </span>
        </span>
      </p>
      <p className="mt-2 text-center text-[11px] text-ink-3">derived by hand before any library</p>
    </div>
  );
}

/* ------------------------------------------------------------ registry card */

function RegistryCard() {
  const manifest = useMemo(() => curriculum.stats(), []);
  const rows = [
    { label: "Subjects", value: manifest.subjects.toLocaleString() },
    { label: "Lessons", value: manifest.lessons.toLocaleString() },
    { label: "Study hours", value: `${Math.round(manifest.totalHours).toLocaleString()} h` },
    { label: "Projects", value: manifest.projects.toLocaleString() },
  ];
  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3.5 shadow-e2 dark:border-border dark:bg-surface-raised">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success-text opacity-60 dv-pulse" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-text" />
        </span>
        the registry · live
      </p>
      <dl className="mt-2.5 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline gap-2 text-[13px]">
            <dt className="text-ink-2">{r.label}</dt>
            <span aria-hidden="true" className="min-w-3 flex-1 translate-y-[-3px] border-b border-dotted border-border-strong/60" />
            <dd className="tabular font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------- the backdrop */

/**
 * The ascent — brand arc + milestone nodes + drafting marks. Pure SVG on
 * --dv-* tokens, so a theme switch repaints it with zero JS.
 */
function SceneBackdrop() {
  return (
    <svg
      viewBox="0 0 560 440"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      role="presentation"
    >
      <defs>
        <linearGradient id="dv-scene-arc" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--dv-blue-400)" />
          <stop offset="55%" stopColor="var(--dv-indigo-500)" />
          <stop offset="100%" stopColor="var(--dv-violet-500)" />
        </linearGradient>
        <radialGradient id="dv-scene-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--dv-indigo-300)" stopOpacity="0.3" className="dark:[stop-color:var(--dv-indigo-500)] dark:[stop-opacity:0.26]" />
          <stop offset="100%" stopColor="var(--dv-indigo-300)" stopOpacity="0" className="dark:[stop-color:var(--dv-indigo-500)]" />
        </radialGradient>
      </defs>

      {/* ambient glow behind the upper arc */}
      <ellipse cx="372" cy="118" rx="205" ry="150" fill="url(#dv-scene-glow)" className="dv-pulse" />

      {/* fine orbit rings — the scholar's orbit */}
      <ellipse
        cx="368" cy="150" rx="186" ry="168"
        stroke="var(--dv-border-subtle)"
        strokeWidth="1.2"
        strokeDasharray="2 7"
        className="dark:[stroke:var(--dv-ink-3)] dark:[stroke-opacity:0.42]"
      />
      <ellipse
        cx="368" cy="150" rx="132" ry="118"
        stroke="var(--dv-border-subtle)"
        strokeWidth="1"
        strokeDasharray="1 6"
        className="dark:[stroke:var(--dv-ink-3)] dark:[stroke-opacity:0.3]"
      />

      {/* the ascent path — the brand arc, drawn in on load. It flows up
          behind the terminal card — practice is where the climb lives. */}
      <path
        d="M52 392 C 150 384, 236 330, 292 258 C 344 190, 372 130, 448 96"
        stroke="url(#dv-scene-arc)"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="dv-draw"
        style={{ ["--dv-dash" as string]: 620 }}
      />
      {/* the dashed continuation — beyond the terminal, to intelligence */}
      <path
        d="M448 96 C 486 78, 514 70, 550 58"
        stroke="var(--dv-indigo-300)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="1 8"
        opacity="0.85"
      />

      {/* drafting marks */}
      <g stroke="var(--dv-border-strong)" strokeWidth="1.1" opacity="0.5" className="dark:opacity-80">
        <path d="M84 108 h10 M89 103 v10" />
        <path d="M492 306 h10 M497 301 v10" />
        <path d="M124 236 h8 M128 232 v8" />
      </g>
      <g fill="var(--dv-indigo-400)" opacity="0.65" className="dark:opacity-90">
        <circle cx="150" cy="322" r="1.6" />
        <circle cx="238" cy="262" r="1.6" />
        <circle cx="180" cy="150" r="1.6" />
        <circle cx="520" cy="196" r="1.6" />
      </g>

      {/* milestone nodes along the ascent */}
      {[
        { cx: 92, cy: 388, r: 13, label: "Σ", fill: "var(--dv-viz-2)", delay: "0.9s" },
        { cx: 330, cy: 236, r: 15, label: "{ }", fill: "var(--dv-viz-1)", delay: "1.2s" },
        { cx: 396, cy: 152, r: 15, label: "▣", fill: "var(--dv-viz-7)", delay: "1.5s" },
        { cx: 536, cy: 58, r: 12, label: "◎", fill: "var(--dv-violet-500)", delay: "1.8s" },
      ].map((n) => (
        <g key={n.label} className="dv-rise" style={{ animationDelay: n.delay }}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 7} fill={n.fill} opacity="0.12" className="dv-pulse dark:[opacity:0.2]" />
          <circle
            cx={n.cx} cy={n.cy} r={n.r}
            fill="var(--dv-surface)"
            stroke={n.fill}
            strokeWidth="1.8"
            className="dark:[fill:var(--dv-surface-raised)]"
          />
          <text
            x={n.cx} y={n.cy + 4.5}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="13"
            fill={n.fill}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------- scene */

/**
 * Pointer parallax — one rAF-throttled listener writes two CSS custom
 * properties; every layer translates against them at its own depth.
 * Skipped entirely for reduced-motion users and on touch devices.
 */
export function HeroScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: PointerEvent) => {
      if (raf.current !== null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--dv-px", px.toFixed(3));
        el.style.setProperty("--dv-py", py.toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--dv-px", "0");
      el.style.setProperty("--dv-py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const layer = "transition-transform duration-300 ease-out will-change-transform";
  return (
    <div
      ref={ref}
      className={cn(
        "relative min-h-[21rem] select-none sm:min-h-[27rem] lg:min-h-[30rem] xl:min-h-[32rem]",
        className
      )}
      style={{ ["--dv-px" as string]: 0, ["--dv-py" as string]: 0 }}
      aria-label="An interactive scene: a learning path rising from foundations to intelligence, a live coding terminal, and the curriculum registry"
      role="img"
    >
      {/* depth 0 — the drafted scene */}
      <div
        className={cn(layer, "absolute inset-0 hidden [transform:translate3d(calc(var(--dv-px)*-6px),calc(var(--dv-py)*-5px),0)] sm:block")}
      >
        <SceneBackdrop />
      </div>

      {/* depth 1 — the floating cards */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 py-8 sm:py-0">
        <div
          className={cn(
            layer,
            "mx-auto w-full max-w-[19.5rem] sm:absolute sm:right-[9%] sm:top-[8%] sm:max-w-[17.5rem] lg:right-[11%] lg:top-[7%] lg:max-w-[19rem]",
            "dv-rise dv-delay-1 [transform:translate3d(calc(var(--dv-px)*10px),calc(var(--dv-py)*5px),0)]"
          )}
        >
          <div className="dv-float">
            <TerminalCard />
          </div>
        </div>

        <div
          className={cn(
            layer,
            "mx-auto w-full max-w-[16rem] sm:absolute sm:left-[3%] sm:top-[38%] sm:max-w-[14.5rem] lg:left-[6%] lg:max-w-[15.5rem]",
            "hidden dv-rise dv-delay-2 [transform:translate3d(calc(var(--dv-px)*-11px),calc(var(--dv-py)*-8px),0)] sm:block"
          )}
        >
          <div className="dv-float" style={{ animationDelay: "1.4s" }}>
            <FormulaCard />
          </div>
        </div>

        <div
          className={cn(
            layer,
            "mx-auto w-full max-w-[17rem] sm:absolute sm:bottom-[4%] sm:right-[16%] sm:max-w-[15.5rem] lg:right-[20%] lg:max-w-[16.5rem]",
            "dv-rise dv-delay-3 [transform:translate3d(calc(var(--dv-px)*7px),calc(var(--dv-py)*-9px),0)]"
          )}
        >
          <div className="dv-float" style={{ animationDelay: "2.6s" }}>
            <RegistryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
