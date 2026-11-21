"use client";

/**
 * DAP shared UI bits — icon registry, badges, code blocks and section
 * cards used across the Project Academy's views.
 */
import { useState } from "react";
import {
  BarChart3, Building2, Check, ChevronDown, Copy, GraduationCap, HeartPulse,
  IdCard, Landmark, Megaphone, ShoppingCart, ShoppingBag, TrendingUp, Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/dap/types";

/* ------------------------------------------------------------ icon registry */

const CATEGORY_ICONS: Record<string, typeof ShoppingBag> = {
  ShoppingBag, ShoppingCart, TrendingUp, Users, Megaphone, Landmark,
  HeartPulse, GraduationCap, IdCard, Trophy, Building2, BarChart3,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? BarChart3;
  return <Icon className={className} aria-hidden="true" />;
}

/* ----------------------------------------------------------------- badges */

const DIFF_STYLE: Record<Difficulty, string> = {
  beginner: "bg-success-bg text-success-text border-success-border",
  intermediate: "bg-warning-bg text-warning-text border-warning-border",
  advanced: "bg-danger-bg text-danger-text border-danger-border",
};

const DIFF_LABEL: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        DIFF_STYLE[level],
        className
      )}
    >
      {DIFF_LABEL[level]}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-ink-2", className)}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- code block */

export function CodeBlock({
  label,
  language,
  source,
}: {
  label?: string;
  language?: string;
  source: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <figure className="overflow-hidden rounded-lg border border-border-subtle bg-surface-inset">
      <figcaption className="flex items-center justify-between border-b border-border-subtle bg-surface px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium text-ink-3">
          {label ?? "reference"}
          {language ? <span className="ml-2 rounded bg-surface-subtle px-1.5 py-0.5">{language}</span> : null}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(source).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-3 transition-colors hover:bg-accent hover:text-ink"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="max-h-[26rem] overflow-auto p-3 text-[12.5px] leading-relaxed">
        <code className="font-mono text-ink-2">{source}</code>
      </pre>
    </figure>
  );
}

/* ------------------------------------------------------------ section card */

export function SectionCard({
  title,
  step,
  children,
  tone = "default",
}: {
  title: string;
  step?: string;
  children: React.ReactNode;
  tone?: "default" | "quiet";
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-5",
        tone === "quiet" ? "border-border-subtle bg-surface-subtle/40" : "border-border-subtle bg-card"
      )}
    >
      <h3 className="flex items-baseline gap-2 font-serif text-lg font-semibold text-ink">
        {step ? <span className="font-mono text-xs font-bold text-ink-3">{step}</span> : null}
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* --------------------------------------------------------- collapsible */

export function Collapse({
  summary,
  children,
  defaultOpen = false,
  tone = "default",
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tone?: "default" | "warning";
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border",
        tone === "warning" ? "border-warning-border bg-warning-bg/50" : "border-border-subtle bg-surface-subtle/50"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-ink transition-colors hover:bg-accent"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">{summary}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-border-subtle px-3.5 py-3 text-[13.5px] leading-relaxed text-ink-2">{children}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------- bullets */

export function Bullets({ items, marker = "•" }: { items: string[]; marker?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-ink-3">{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
