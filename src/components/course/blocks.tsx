"use client";

/**
 * Lesson block renderers.
 *
 * Renders every block kind from the course content model, in reading order,
 * with the progressive-disclosure structure the content was authored in:
 * intuition first, concepts next, code and outputs after, practice last.
 *
 * Code blocks display their REAL output (verified at build time by
 * scripts/verify-course-outputs.ts) in a paired output panel, with the
 * author's line-by-line explanation available directly below.
 */
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Flame,
  Info,
  Lightbulb,
  ListOrdered,
  Sparkles,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/course/types";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { useCourseProgress } from "@/lib/course/progress";
import { CopyButton } from "@/components/textbook/chrome";

/** Props forwarded to the embedded playground (packages, labels, notes). */
export type PlaygroundProps = Partial<
  Pick<React.ComponentProps<typeof PythonPlayground>, "packages" | "engineLabel" | "firstLoadNote">
>;

/** Tiny inline markdown: `code`, **bold**, *italic*. */
export function InlineText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

const CALLOUT_STYLES = {
  tip: {
    icon: Lightbulb,
    wrapper: "border-success-border bg-success-bg/70",
    iconClass: "text-success-text",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-warning-border bg-warning-bg/70",
    iconClass: "text-warning-text",
  },
  info: {
    icon: Info,
    wrapper: "border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  analogy: {
    icon: Sparkles,
    wrapper: "border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/30",
    iconClass: "text-violet-600 dark:text-violet-400",
  },
} as const;

function CodeOutput({ output, note }: { output: string; note?: string }) {
  return (
    <div className="rounded-lg border border-l-2 border-l-success-text bg-muted/50 px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-success-text" />
        Real output — verified by actually running this code
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground">
        {output}
      </pre>
      {note && (
        <p className="mt-2 border-t pt-2 text-xs leading-relaxed text-muted-foreground">
          <InlineText text={note} />
        </p>
      )}
    </div>
  );
}

function ExplainList({ explain }: { explain: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-background">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/40"
        aria-expanded={open}
      >
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
        <span>Explain the output, line by line</span>
      </button>
      {open && (
        <ul className="space-y-2.5 border-t px-4 py-3">
          {explain.map((line, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <InlineText text={line} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TryItBlock({ block, playgroundProps }: { block: Extract<Block, { kind: "tryIt" }> ; playgroundProps?: PlaygroundProps }) {
  const exerciseId = `tryit:${block.title}`;
  const passed = useCourseProgress((s) => s.exercisesPassed[exerciseId]);
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success-text">
          <Flame className="h-3.5 w-3.5" />
          Try it yourself
        </span>
        {passed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-text">
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
        {...playgroundProps}
        onResult={(r) => {
          if (r.ok) useCourseProgress.getState().markExercisePassed(exerciseId);
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

function CalloutBlock({ block }: { block: Extract<Block, { kind: "callout" }> }) {
  const style = CALLOUT_STYLES[block.tone];
  const Icon = style.icon;
  return (
    /* role="note" — a callout is a note, not a complementary landmark;
       a lesson with five callouts must not add five asides to the tree. */
    <aside role="note" className={cn("rounded-lg border px-4 py-3.5", style.wrapper)}>
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClass)} />
        <div>
          {block.title && <p className="mb-1 text-sm font-semibold text-foreground">{block.title}</p>}
          <p className="text-sm leading-relaxed text-foreground/85">
            <InlineText text={block.text} />
          </p>
        </div>
      </div>
    </aside>
  );
}

export function BlockView({
  block,
  playgroundProps,
  anchorId,
}: {
  block: Block;
  playgroundProps?: PlaygroundProps;
  /** DOM id for heading blocks — the right rail's table of contents. */
  anchorId?: string;
}) {
  switch (block.kind) {
    case "text":
      return (
        <p className="dv-lesson-text">
          <InlineText text={block.text} />
        </p>
      );

    case "heading":
      return (
        <h3 id={anchorId} className="dv-lesson-h3 mt-10 flex scroll-mt-24 items-baseline gap-2.5 text-ink">
          <span className="tb-bar self-stretch" aria-hidden />
          <span>{block.text}</span>
        </h3>
      );

    case "code": {
      const isRepl = block.lang === "repl";
      const isBash = block.lang === "bash";
      const label = isRepl
        ? "REPL — lines after >>> are Python's answers"
        : isBash
          ? "Terminal"
          : block.title ?? "Python";
      return (
        <figure className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-editor-border bg-editor-bg shadow-e1">
            <div className="flex items-center gap-2 border-b border-editor-border bg-editor-chrome px-3 py-1">
              <span className="flex gap-1" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-editor-err/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-editor-warn/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-editor-ok/80" />
              </span>
              <span className="truncate font-mono text-[11px] uppercase tracking-wide text-editor-ink/60">
                {label}
              </span>
              <CopyButton text={block.code} className="ml-auto text-editor-ink/60 hover:bg-editor-chrome hover:text-editor-ink" />
            </div>
            <pre
              className="dv-scroll-region overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed text-editor-ink"
              tabIndex={0}
              role="region"
              aria-label={isRepl ? "Interactive session code — scrollable" : `Code block — ${label} — scrollable`}
            >
              {block.code.trimEnd()}
            </pre>
          </div>

          {block.expectError && !block.output && (
            <div className="rounded-lg border border-l-2 border-l-danger-text bg-danger-bg/60 px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger-text">
                <AlertTriangle className="h-3.5 w-3.5" />
                This code deliberately crashes — the real error is:
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-danger-text">
                {block.expectError}
              </pre>
            </div>
          )}

          {block.output !== undefined && <CodeOutput output={block.output} note={block.outputNote} />}
          {block.explain && block.explain.length > 0 && <ExplainList explain={block.explain} />}
        </figure>
      );
    }

    case "tryIt":
      return <TryItBlock block={block} playgroundProps={playgroundProps} />;

    case "visual":
      return (
        <figure className="space-y-2.5">
          <figcaption className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {block.title}
          </figcaption>
          <div
            className="dv-scroll-region overflow-x-auto rounded-lg border bg-muted/40 px-4 py-4"
            tabIndex={0}
            role="region"
            aria-label={`${block.title ?? "Diagram"} — scrollable`}
          >
            <pre className="font-mono text-[12.5px] leading-relaxed text-foreground/90">{block.ascii.trimEnd()}</pre>
          </div>
          {block.caption && (
            <p className="text-xs leading-relaxed text-muted-foreground">{block.caption}</p>
          )}
        </figure>
      );

    case "table":
      return (
        <figure className="space-y-2.5">
          {block.title && (
            <figcaption className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Table2 className="h-3.5 w-3.5" />
              {block.title}
            </figcaption>
          )}
          <div
            className="dv-scroll-region overflow-x-auto rounded-lg border"
            tabIndex={0}
            role="region"
            aria-label={block.title ? `${block.title} — scrollable table` : "Scrollable table"}
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  {block.headers.map((h, i) => (
                    <th key={i} scope="col" className="border-b px-4 py-2.5 text-left font-semibold text-foreground">
                      {/* Authored tables may leave a header cell blank (row-label
                          columns); give screen readers a generic name so the
                          header row is never empty (axe empty-table-header). */}
                      {h.trim() ? <InlineText text={h} /> : <span className="sr-only">Column {i + 1}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? "bg-muted/20" : undefined}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-border/60 px-4 py-2.5 align-top text-foreground/90">
                        <InlineText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <p className="text-xs leading-relaxed text-muted-foreground">{block.caption}</p>
          )}
        </figure>
      );

    case "callout":
      return <CalloutBlock block={block} />;

    case "steps":
      return (
        <div className="space-y-2.5">
          {block.title && (
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListOrdered className="h-4 w-4 text-success-text" />
              {block.title}
            </p>
          )}
          <ol className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-xs font-bold text-success-text">
                  {i + 1}
                </span>
                <p className="text-[15px] leading-7 text-foreground/90">
                  <InlineText text={item} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      );

    default:
      return null;
  }
}

export function BlocksList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} anchorId={block.kind === "heading" ? `blk-${i}` : undefined} />
      ))}
    </div>
  );
}
