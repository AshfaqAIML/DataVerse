"use client";

/**
 * LabsHub — the Learning Laboratories index. Seven disciplines, one
 * consistent lab interface; every entry is a real, working environment and
 * the hub is honest about what each lab runs on.
 */
import { ArrowRight, BarChart3, Brain, FlaskConical, Grid3x3, Shapes, Sigma, Table2, Terminal } from "lucide-react";
import { LAB_DISCIPLINES } from "@/lib/labs/lab-data";
import { Reveal } from "@/components/academy/motion";

const ICONS: Record<string, React.ElementType> = {
  python: Terminal,
  sql: Table2,
  numpy: Grid3x3,
  pandas: FlaskConical,
  statistics: Sigma,
  dataviz: BarChart3,
  ml: Brain,
};

export function LabsHub({ navigate }: { navigate: (hash: string) => void }) {
  return (
    <div className="min-w-0 space-y-7">
      <header className="dv-aurora max-w-2xl">
        <p className="eyebrow">Practice, honestly</p>
        <h1 className="t-page mt-2 text-ink">
          The Learning <span className="dv-gradient-text">Laboratories</span>
        </h1>
        <p className="t-body mt-3">
          Seven disciplines, one lab interface — instructions, editor, run controls, console, test results and
          explanations side by side. Every run executes on a real engine in your browser: no sandboxes pretending, no
          output screenshots. When a course says &ldquo;run it&rdquo;, this is where it runs.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {LAB_DISCIPLINES.map((lab, i) => {
          const Icon = ICONS[lab.icon] ?? Terminal;
          const exercises = lab.exercises.length || lab.sqlExercises?.length || 0;
          return (
            <Reveal key={lab.id} delay={i * 70} className="flex flex-col">
              <button
                type="button"
                onClick={() => navigate(`#/lab/${lab.id}`)}
                className="dv-card-topline dv-lift group flex flex-1 flex-col rounded-2xl border border-border-subtle bg-surface p-5 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `color-mix(in srgb, ${lab.hue} 12%, transparent)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: lab.hue }} />
                  </span>
                  <ArrowRight className="dv-lift h-4 w-4 text-ink-3 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <p className="t-item mt-4 text-ink group-hover:text-primary">{lab.name}</p>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-3">{lab.tagline}</p>
                <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-subtle pt-3 font-mono text-[11px] uppercase tracking-wider text-ink-3">
                  <span className="inline-flex items-center gap-1">
                    <FlaskConical className="h-3.5 w-3.5" />
                    {lab.engine}
                  </span>
                  <span className="ml-auto tabular">{exercises} verified exercises</span>
                </p>
              </button>
            </Reveal>
          );
        })}
      </div>

      <p className="text-center text-[12.5px] text-ink-3">
        Every lab exercise&rsquo;s expected output was captured from the same engine your browser runs — machine-verified,
        never typed by hand.
      </p>

      {/* the visual library — a sibling destination */}
      <button
        type="button"
        onClick={() => navigate("#/visuals")}
        className="dv-card-topline dv-lift group flex w-full items-center gap-4 rounded-2xl border border-border-subtle bg-surface px-5 py-4 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "color-mix(in srgb, var(--dv-viz-4) 12%, transparent)" }}
        >
          <Shapes className="h-5 w-5" style={{ color: "var(--dv-viz-4)" }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="t-item block text-ink group-hover:text-primary">The Visual Library →</span>
          <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-3">
            31 interactive demonstrations — drag vectors, bend distributions, train real classifiers — every one
            computes for real.
          </span>
        </span>
        <ArrowRight className="dv-lift h-4 w-4 shrink-0 text-ink-3 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </button>
    </div>
  );
}
