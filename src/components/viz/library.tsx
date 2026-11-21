"use client";

/**
 * library.tsx — The Visual Library: a browsable home for every interactive
 * demonstration in the platform. One hub (#/visuals) with search + domain
 * filters, and a focused reading view (#/visuals/<id>) with prev/next
 * navigation through the catalogue.
 */
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Search, Shapes } from "lucide-react";
import { Reveal } from "@/components/academy/motion";
import { VIZ_DOMAIN_META, VIZ_LIBRARY, findViz, type VizDomain } from "./registry";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// The hub
// ---------------------------------------------------------------------------

type Filter = "all" | VizDomain;

export function VisualLibrary({ navigate }: { navigate: (hash: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VIZ_LIBRARY.filter((e) => {
      if (filter !== "all" && e.domain !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.blurb.toLowerCase().includes(q) ||
        e.concepts.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  const counts = useMemo(() => {
    const c = { math: 0, stats: 0, ds: 0 } as Record<VizDomain, number>;
    VIZ_LIBRARY.forEach((e) => (c[e.domain] += 1));
    return c;
  }, []);

  return (
    <div className="min-w-0 space-y-7">
      <header className="max-w-2xl">
        <p className="eyebrow">Learn by seeing</p>
        <h1 className="t-page mt-2 text-ink">The Visual Library</h1>
        <p className="t-body mt-3">
          {VIZ_LIBRARY.length} interactive demonstrations of the ideas data science runs on — from the coordinate
          plane to decision boundaries. Every one computes for real: drag, slide and re-run, and the mathematics
          answers. No static pictures, no pretend output.
        </p>
      </header>

      {/* search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — slope, p-value, k-NN…"
            className="w-full rounded-lg border border-border-subtle bg-surface py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-3 focus:border-viz-2/50 focus:outline-none"
            aria-label="Search the visual library"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", `All ${VIZ_LIBRARY.length}`],
              ["math", `Mathematics ${counts.math}`],
              ["stats", `Statistics ${counts.stats}`],
              ["ds", `Data Science ${counts.ds}`],
            ] as Array<[Filter, string]>
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "bg-surface-inset text-ink-2 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <Shapes className="mx-auto h-8 w-8 text-ink-3" />
          <p className="mt-3 text-sm font-medium text-ink">Nothing matches &ldquo;{query}&rdquo;</p>
          <p className="mt-1 text-xs text-ink-3">Try a concept like &ldquo;slope&rdquo;, &ldquo;outlier&rdquo; or &ldquo;threshold&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i * 45, 320)} className="flex flex-col">
              <button
                type="button"
                onClick={() => navigate(`#/visuals/${e.id}`)}
                className="dv-card-topline dv-lift group flex flex-1 flex-col rounded-2xl border border-border-subtle bg-surface p-5 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${VIZ_DOMAIN_META[e.domain].hue} 14%, transparent)`,
                      color: VIZ_DOMAIN_META[e.domain].hue,
                    }}
                  >
                    {VIZ_DOMAIN_META[e.domain].label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="t-item mt-3.5 text-ink group-hover:text-primary">{e.title}</p>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-3">{e.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border-subtle pt-3">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface-inset px-2 py-0.5 text-[10px] font-semibold text-ink-3">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <p className="text-center text-[12.5px] text-ink-3">
        Built on the platform&rsquo;s own expression engine, statistics engine and in-browser models — every number
        you see on a page here is computed when you look at it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The focused view — one visualization, full width, with context
// ---------------------------------------------------------------------------

export function VisualFocus({ id, navigate }: { id: string; navigate: (hash: string) => void }) {
  const entry = findViz(id);
  const idx = VIZ_LIBRARY.findIndex((e) => e.id === id);
  const prev = idx > 0 ? VIZ_LIBRARY[idx - 1] : null;
  const next = idx >= 0 && idx < VIZ_LIBRARY.length - 1 ? VIZ_LIBRARY[idx + 1] : null;
  const related = useMemo(
    () => (entry ? VIZ_LIBRARY.filter((e) => e.domain === entry.domain && e.id !== entry.id).slice(0, 4) : []),
    [id],
  );

  if (!entry) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-lg font-semibold text-ink">No visualization called &ldquo;{id}&rdquo;</p>
        <button
          type="button"
          onClick={() => navigate("#/visuals")}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          ← Back to the Visual Library
        </button>
      </div>
    );
  }

  const Comp = entry.component;
  const meta = VIZ_DOMAIN_META[entry.domain];

  return (
    <div className="min-w-0">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3" aria-label="Breadcrumb">
        <button type="button" onClick={() => navigate("#/visuals")} className="font-medium hover:text-ink">
          Visual Library
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium" style={{ color: meta.hue }}>
          {meta.label}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{entry.title}</span>
        <span className="ml-auto font-mono text-[11px] tabular">
          {idx + 1} / {VIZ_LIBRARY.length}
        </span>
      </nav>

      <div className="mb-5 max-w-3xl">
        <h1 className="t-page text-ink">{entry.title}</h1>
        <p className="t-body mt-2">{entry.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.concepts.slice(0, 6).map((c) => (
            <span key={c} className="rounded-full bg-surface-inset px-2.5 py-0.5 text-[11px] font-medium text-ink-3">
              {c}
            </span>
          ))}
        </div>
      </div>

      <Comp />

      {/* prev / next */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <button
            type="button"
            onClick={() => navigate(`#/visuals/${prev.id}`)}
            className="dv-lift group flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-e1 hover:border-border"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-ink" />
            <span className="min-w-0">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-3">Previous</span>
              <span className="block truncate text-sm font-semibold text-ink">{prev.title}</span>
            </span>
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => navigate(`#/visuals/${next.id}`)}
            className="dv-lift group flex items-center justify-end gap-3 rounded-2xl border border-border-subtle bg-surface p-4 text-right shadow-e1 hover:border-border"
          >
            <span className="min-w-0">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-3">Next</span>
              <span className="block truncate text-sm font-semibold text-ink">{next.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-ink" />
          </button>
        ) : null}
      </div>

      {/* related in the same domain */}
      {related.length > 0 && (
        <div className="mt-8">
          <p className="eyebrow">More in {meta.label.toLowerCase()}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`#/visuals/${r.id}`)}
                className="dv-lift rounded-xl border border-border-subtle bg-surface px-4 py-3 text-left shadow-e1 hover:border-border"
              >
                <p className="truncate text-[13px] font-semibold text-ink">{r.title}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-3">{r.concepts.slice(0, 3).join(" · ")}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
