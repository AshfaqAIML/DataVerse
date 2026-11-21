"use client";

/**
 * The Academy command palette — one search across everything real:
 * authored courses, the ten schools, all 77 registry subjects and every
 * tool destination (playgrounds, labs, placement, tutor, projects…).
 * Opens from the header search trigger or ⌘K / Ctrl-K anywhere.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Command,
  Compass,
  Database,
  Grid3x3,
  GraduationCap,
  LineChart,
  Map,
  MessagesSquare,
  Search,
  Sigma,
  Sparkles,
  Terminal,
  FolderGit2,
} from "lucide-react";
import { curriculum } from "@/lib/curriculum/data";
import { DISPLAY_COURSES } from "@/lib/academy/student";
import { cn } from "@/lib/utils";

export interface SearchDestination {
  group: "Courses" | "Schools" | "Subjects" | "Tools";
  label: string;
  hint: string;
  hash: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Every tool destination on the platform — all real routes. */
const TOOLS: SearchDestination[] = [
  { group: "Tools", label: "Python Playground", hint: "Free coding · runs in your browser", hash: "#/playground", icon: Terminal },
  { group: "Tools", label: "SQL Lab", hint: "Query six real PostgreSQL databases", hash: "#/sql/lab", icon: Database },
  { group: "Tools", label: "NumPy Playground", hint: "Array computing sandbox", hash: "#/numpy/playground", icon: Grid3x3 },
  { group: "Tools", label: "Mathematics Diagnostic", hint: "Find your exact starting level", hash: "#/math/diagnostic", icon: Sigma },
  { group: "Tools", label: "Placement Hub", hint: "Test out of what you already know", hash: "#/placement", icon: LineChart },
  { group: "Tools", label: "Ada, the AI Tutor", hint: "Socratic guidance, lesson-grounded", hash: "#/tutor", icon: MessagesSquare },
  { group: "Tools", label: "Projects", hint: "Every project across the academy", hash: "#/projects", icon: FolderGit2 },
  { group: "Tools", label: "Career Centre", hint: "Portfolio, interviews, graduation", hash: "#/career", icon: Compass },
  { group: "Tools", label: "Learning Paths", hint: "The staged roadmaps", hash: "#/roadmap", icon: Map },
  { group: "Tools", label: "Explore", hint: "The full catalogue", hash: "#/explore", icon: GraduationCap },
];

const COURSE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "#/course": BookOpen,
  "#/sql": Database,
  "#/numpy": Grid3x3,
};

function courseDestinations(): SearchDestination[] {
  return DISPLAY_COURSES.map((c) => ({
    group: "Courses" as const,
    label: c.label,
    hint: `${c.lessons} lessons · interactive`,
    hash: c.href,
    icon: COURSE_ICONS[c.href] ?? BookOpen,
  }));
}

function schoolDestinations(): SearchDestination[] {
  return curriculum.registry.schools.map((s) => ({
    group: "Schools" as const,
    label: `${s.code} · ${s.name}`,
    hint: s.tagline,
    hash: `#/school/${s.slug}`,
    icon: Boxes,
  }));
}

export function SearchPalette({
  open,
  onOpenChange,
  navigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  navigate: (hash: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchDestination[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...courseDestinations(), ...TOOLS];

    const courses = courseDestinations().filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)
    );
    const schools = schoolDestinations().filter(
      (s) => s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q)
    );
    const tools = TOOLS.filter(
      (t) => t.label.toLowerCase().includes(q) || t.hint.toLowerCase().includes(q)
    );
    const subjects: SearchDestination[] = curriculum
      .searchSubjects({ q: query.trim(), pageSize: 6 })
      .items.map((s) => ({
        group: "Subjects" as const,
        label: `${s.code} · ${s.title}`,
        hint: curriculum.subject(s.slug).blurb,
        hash: `#/subject/${s.slug}`,
        icon: Sparkles,
      }));
    return [...courses, ...schools, ...subjects, ...tools];
  }, [query]);

  // Reset palette state when it opens — the render-time adjustment pattern
  // (no effects, no cascading renders).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Global keys: ⌘K / Ctrl-K toggles; Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Keyboard navigation across the flat result list.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) {
        onOpenChange(false);
        navigate(r.hash);
      }
    }
  };

  // Keep the active row in view.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open || typeof document === "undefined") return null;

  let lastGroup = "";

  return createPortal(
    <div className="fixed inset-0 z-(--dv-z-top)" role="dialog" aria-modal="true" aria-label="Search the academy">
      {/* backdrop */}
      <button
        aria-label="Close search"
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px] dark:bg-ink/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl dv-rise">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-e4">
          {/* input row */}
          <div className="flex items-center gap-3 border-b border-border-subtle px-4">
            <Search className="h-4 w-4 shrink-0 text-ink-3" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search courses, schools, subjects, tools…"
              className="h-12 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
              aria-label="Search query"
            />
            <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-ink-3 sm:flex">
              ESC
            </kbd>
          </div>

          {/* results */}
          <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
            {results.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-3">
                Nothing matches “{query.trim()}” — try “pandas”, “joins” or “probability”.
              </p>
            )}
            {results.map((r, i) => {
              const showGroup = r.group !== lastGroup;
              lastGroup = r.group;
              const Icon = r.icon;
              return (
                <div key={`${r.group}-${r.hash}-${r.label}`}>
                  {showGroup && <p className="eyebrow px-3 pb-1 pt-3">{r.group}</p>}
                  <button
                    data-idx={i}
                    onClick={() => {
                      onOpenChange(false);
                      navigate(r.hash);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100",
                      i === active ? "bg-accent" : "bg-transparent"
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-subtle">
                      <Icon className="h-3.5 w-3.5 text-ink-2" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
                      <span className="block truncate text-xs text-ink-3">{r.hint}</span>
                    </span>
                    <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 text-ink-3 transition-opacity", i === active ? "opacity-100" : "opacity-0")} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* footer hints */}
          <div className="flex items-center gap-4 border-t border-border-subtle bg-surface-subtle/60 px-4 py-2 text-[11px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-surface px-1 font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-surface px-1 font-mono">↵</kbd> open
            </span>
            <span className="ml-auto hidden items-center gap-1 sm:flex">
              <Command className="h-3 w-3" />K anywhere
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** The header trigger button — styled as a quiet search field. */
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search the academy (Ctrl K)"
      className="group flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-transparent text-ink-3 transition-colors duration-150 hover:border-border-subtle hover:bg-accent hover:text-ink 2xl:w-64 2xl:justify-start 2xl:border-border-subtle 2xl:bg-surface-subtle/60 2xl:px-3 2xl:text-[13px] 2xl:hover:border-border 2xl:hover:bg-surface"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="hidden 2xl:inline">Search…</span>
      <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-3 2xl:flex">
        ⌘K
      </kbd>
    </button>
  );
}
