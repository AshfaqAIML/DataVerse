"use client";

/**
 * NumPy lesson block renderers.
 *
 * Extends the base course block renderer with the two NumPy-specific kinds:
 *
 *   - functionDoc: a complete reference card per function (purpose, syntax,
 *     parameters, returns, verified example, common mistakes, related
 *     functions, practical applications)
 *   - arrayViz: the interactive array visualizations (ArrayViz.tsx)
 *
 * tryIt blocks are rendered here too (not delegated) so they run on the
 * NumPy-enabled playground and record progress in the NumPy store.
 * Everything else delegates to the shared BlockView from the course model.
 */
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookText,
  CheckCircle2,
  ChevronDown,
  Flame,
  Info,
  Link2,
  Terminal,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunctionDocBlock, NumpyBlock } from "@/lib/numpycourse/types";
import { BlockView, InlineText } from "@/components/course/blocks";
import { ArrayViz } from "./ArrayViz";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { useNumpyProgress } from "@/lib/numpycourse/progress";
import { CopyButton } from "@/components/textbook/chrome";

const NUMPY_PLAYGROUND_PROPS = {
  packages: ["numpy"] as string[],
  engineLabel: "NumPy playground",
  firstLoadNote:
    "First run downloads the Python + NumPy engine once (~16 MB, cached afterwards by your browser).",
};

// ---------------------------------------------------------------------------
// tryIt — NumPy playground + NumPy progress store
// ---------------------------------------------------------------------------

function NumpyTryItBlock({ block }: { block: Extract<NumpyBlock, { kind: "tryIt" }> }) {
  const exerciseId = `numpy-tryit:${block.title}`;
  const passed = useNumpyProgress((s) => s.exercisesPassed[exerciseId]);
  const markPassed = useNumpyProgress((s) => s.markExercisePassed);
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
          <Flame className="h-3.5 w-3.5" />
          Try it yourself
        </span>
        {passed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 dark:text-cyan-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> tried successfully
          </span>
        )}
      </div>
      {block.task && (
        <p className="text-[15px] leading-7 text-foreground/90">
          <InlineText text={block.task} />
        </p>
      )}
      <PythonPlayground
        initialCode={block.code}
        compact
        {...NUMPY_PLAYGROUND_PROPS}
        onResult={(r) => {
          if (r.ok) markPassed(exerciseId);
        }}
      />
      {block.hint && (
        <details className="group rounded-lg border bg-muted/30 px-4 py-2.5">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground group-open:text-foreground">
            Need a hint?
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <InlineText text={block.hint} />
          </p>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// functionDoc — the complete reference card
// ---------------------------------------------------------------------------

function VerifiedOutput({ output }: { output: string }) {
  return (
    <div className="rounded-lg border border-l-2 border-l-cyan-500 bg-muted/50 px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-300" />
        Real output — verified by actually running this example
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground">{output}</pre>
    </div>
  );
}

function FunctionDocCard({ block: doc }: { block: FunctionDocBlock }) {
  const [paramsOpen, setParamsOpen] = useState(true);
  const hasExampleError = !!doc.exampleExpectError && !doc.exampleOutput;

  return (
    <section className="overflow-hidden rounded-xl border border-cyan-200 bg-card dark:border-cyan-900/60">
      {/* header */}
      <header className="border-b border-cyan-100 bg-cyan-50/60 px-5 py-4 dark:border-cyan-900/60 dark:bg-cyan-950/30">
        <div className="flex flex-wrap items-center gap-2">
          <BookText className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
            Function reference
          </span>
        </div>
        <h4 className="mt-1.5 font-mono text-lg font-bold text-foreground">{doc.name}</h4>
        <p className="mt-1 text-sm leading-relaxed text-foreground/85">{doc.purpose}</p>
      </header>

      <div className="space-y-5 px-5 py-5">
        {/* syntax */}
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" /> Syntax
          </p>
          <div className="overflow-x-auto rounded-lg border border-editor-border bg-editor-bg px-4 py-3">
            <div className="flex items-start gap-2">
              <pre className="min-w-0 flex-1 font-mono text-[13px] leading-relaxed text-editor-ink">{doc.signature}</pre>
              <CopyButton text={doc.signature} className="shrink-0 text-editor-ink/60 hover:bg-editor-chrome hover:text-editor-ink" />
            </div>
          </div>
        </div>

        {/* purpose detail */}
        {doc.purposeDetail && (
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Purpose</p>
            <p className="text-[15px] leading-7 text-foreground/90">
              <InlineText text={doc.purposeDetail} />
            </p>
          </div>
        )}

        {/* parameters */}
        {doc.params.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setParamsOpen(!paramsOpen)}
              className="mb-1.5 flex w-full items-center gap-2 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !paramsOpen && "-rotate-90")} />
              Parameters ({doc.params.length})
            </button>
            {paramsOpen && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="border-b px-3 py-2 font-semibold">Parameter</th>
                      <th className="border-b px-3 py-2 font-semibold">Type</th>
                      <th className="border-b px-3 py-2 font-semibold">What it does</th>
                      <th className="border-b px-3 py-2 font-semibold">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.params.map((p) => (
                      <tr key={p.name} className="align-top even:bg-muted/20">
                        <td className="border-b border-border/60 px-3 py-2.5 font-mono text-[13px] font-semibold text-cyan-800 dark:text-cyan-300">
                          {p.name}
                          {p.required && (
                            <span className="ml-1.5 rounded bg-cyan-100 px-1.5 py-0.5 text-[11px] font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                              required
                            </span>
                          )}
                        </td>
                        <td className="border-b border-border/60 px-3 py-2.5 font-mono text-xs text-muted-foreground">{p.type}</td>
                        <td className="border-b border-border/60 px-3 py-2.5 leading-relaxed text-foreground/90">
                          <InlineText text={p.description} />
                        </td>
                        <td className="border-b border-border/60 px-3 py-2.5 font-mono text-xs text-muted-foreground">
                          {p.example ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* returns */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Returns</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">{doc.returns.type}</span>{" "}
            — <InlineText text={doc.returns.description} />
          </p>
        </div>

        {/* example */}
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" /> Example
          </p>
          <div className="space-y-2.5">
            <div className="overflow-hidden rounded-lg border border-editor-border bg-editor-bg">
              <div className="flex items-center justify-between border-b border-editor-border bg-editor-chrome px-3 py-1">
                <span className="font-mono text-[11px] uppercase tracking-wide text-editor-ink/60">Example</span>
                <CopyButton text={doc.example} className="text-editor-ink/60 hover:bg-editor-chrome hover:text-editor-ink" />
              </div>
              <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink">{doc.example.trimEnd()}</pre>
            </div>
            {doc.exampleOutput !== undefined && <VerifiedOutput output={doc.exampleOutput} />}
            {hasExampleError && (
              <div className="rounded-lg border border-l-2 border-l-danger-text bg-danger-bg/60 px-4 py-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger-text">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  This example deliberately crashes — the real error is:
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-danger-text">
                  {doc.exampleExpectError}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* common mistakes */}
        {doc.commonMistakes.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-warning-text">
              <AlertTriangle className="h-3.5 w-3.5" /> Common mistakes
            </p>
            <div className="space-y-2.5">
              {doc.commonMistakes.map((m, i) => (
                <div key={i} className="rounded-lg border border-warning-border/70 bg-warning-bg/40 p-3.5">
                  <p className="text-sm font-semibold text-foreground">{m.mistake}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/80">Why: </span>
                    <InlineText text={m.why} />
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                    <span className="font-semibold text-cyan-700 dark:text-cyan-400">Fix: </span>
                    <InlineText text={m.fix} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* related */}
        {doc.related.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" /> Related functions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {doc.related.map((r) => (
                <span
                  key={r.name}
                  title={r.relation}
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 text-xs text-foreground/90"
                >
                  <code className="font-mono font-semibold text-cyan-800 dark:text-cyan-300">{r.name}</code>
                  <span className="text-muted-foreground">— {r.relation}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* applications */}
        {doc.applications.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <ArrowRight className="h-3.5 w-3.5" /> Practical applications
            </p>
            <ul className="space-y-1.5">
              {doc.applications.map((a, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
                  <InlineText text={a} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* notes */}
        {doc.notes && (
          <aside className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 dark:border-blue-900/60 dark:bg-blue-950/30">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm leading-relaxed text-foreground/85">
              <InlineText text={doc.notes} />
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------

export function NumpyBlockView({ block, anchorId }: { block: NumpyBlock; anchorId?: string }) {
  switch (block.kind) {
    case "functionDoc":
      return <FunctionDocCard block={block} />;
    case "arrayViz":
      return <ArrayViz block={block} />;
    case "tryIt":
      return <NumpyTryItBlock block={block} />;
    default:
      return <BlockView block={block} anchorId={anchorId} playgroundProps={NUMPY_PLAYGROUND_PROPS} />;
  }
}

export function NumpyBlocksList({ blocks }: { blocks: NumpyBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <NumpyBlockView key={i} block={block} anchorId={block.kind === "heading" ? `blk-${i}` : undefined} />
      ))}
    </div>
  );
}
