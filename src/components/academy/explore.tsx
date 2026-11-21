"use client";

/**
 * ExploreView — the full catalogue: every school and subject in the
 * registry, filterable and searchable, all data live from the registry.
 */
import { useMemo, useState } from "react";
import { ArrowUpRight, GraduationCap, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { curriculum } from "@/lib/curriculum/data";
import type { SchoolCode } from "@/lib/curriculum/types";
import { useStudentState, AUTHORED_COURSES } from "@/lib/academy/student";
import { DifficultyBadge, StatusBadge, formatHours, subjectStatus } from "./shared";
import { SchoolIcon } from "./shared";
import { Reveal } from "./motion";

export function ExploreView({ navigate }: { navigate: (hash: string) => void }) {
  const state = useStudentState();
  const [school, setSchool] = useState<SchoolCode | "all">("all");
  const [q, setQ] = useState("");

  const subjects = useMemo(() => {
    const all = curriculum.registry.subjects;
    return all.filter((s) => {
      if (school !== "all" && s.school !== school) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      return (
        s.title.toLowerCase().includes(needle) ||
        s.blurb.toLowerCase().includes(needle) ||
        s.keywords.some((k) => k.toLowerCase().includes(needle)) ||
        s.code.toLowerCase() === needle
      );
    });
  }, [school, q]);

  return (
    <div className="min-w-0 space-y-7">
      <header className="max-w-2xl">
        <p className="eyebrow">The catalogue</p>
        <h1 className="t-page mt-2 text-ink">
          Explore the <span className="dv-gradient-text">curriculum</span>
        </h1>
        <p className="t-body mt-3">
          Every subject across the academy&apos;s ten schools — {curriculum.registry.manifest.subjects} subjects,{" "}
          {curriculum.registry.manifest.lessons.toLocaleString()} lessons, every prerequisite enforced. Numbers and
          gates come live from the registry.
        </p>
      </header>

      {/* search + school filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subjects, keywords, codes…"
            className="h-11 w-full rounded-xl border border-border-subtle bg-surface pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-3 shadow-e1 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSchool("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
              school === "all" ? "border-transparent bg-ink text-canvas" : "border-border-subtle bg-surface text-ink-2 hover:border-border-strong"
            )}
          >
            All schools
          </button>
          {curriculum.registry.schools.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => setSchool(s.code)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                school === s.code ? "border-transparent bg-ink text-canvas" : "border-border-subtle bg-surface text-ink-2 hover:border-border-strong"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* the subject list */}
      <p className="tabular font-mono text-[11px] uppercase tracking-wider text-ink-3">
        {subjects.length} subject{subjects.length === 1 ? "" : "s"}
        {school !== "all" && ` · school ${school}`}
      </p>
      <Reveal className="grid grid-cols-1 gap-3">
        {subjects.map((s) => {
          const status = subjectStatus(curriculum, state, s.slug);
          const authored = AUTHORED_COURSES[s.slug];
          const schoolMeta = curriculum.registry.schools.find((x) => x.code === s.school)!;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() =>
                s.school === "J" ? navigate("#/school/classical-ai") : navigate(`#/subject/${s.slug}`)
              }
              className="group flex min-w-0 flex-col rounded-xl border border-border-subtle bg-surface p-4 text-left shadow-e1 dv-card-hover sm:flex-row sm:items-center sm:gap-4"
            >
              <span
                className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-bold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${schoolMeta.color} 12%, transparent)`,
                  color: schoolMeta.color,
                }}
              >
                {s.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="text-[15px] font-medium text-ink group-hover:text-primary">{s.title}</span>
                  <span className="text-[11px] text-ink-3">{schoolMeta.name}</span>
                </span>
                <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-ink-3">{s.blurb}</span>
                <span className="tabular mt-1.5 flex flex-wrap gap-x-3 text-[11.5px] text-ink-3">
                  <span>{curriculum.lessonCount(s.slug)} lessons</span>
                  <span>· {formatHours(curriculum.hours(s.slug))}</span>
                  {authored && <span className="font-medium text-primary">· interactive course ready</span>}
                </span>
              </span>
              <span className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
                <DifficultyBadge difficulty={s.difficulty} />
                <StatusBadge status={status} />
                <ArrowUpRight className="h-4 w-4 text-ink-3 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </Reveal>

      {subjects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle/50 p-8 text-center">
          <GraduationCap className="mx-auto h-6 w-6 text-ink-3" />
          <p className="mt-2 text-[14px] font-medium text-ink">No subject matches “{q}”</p>
          <p className="mt-1 text-[12.5px] text-ink-3">Try a keyword like “search”, “logic” or “probability”.</p>
        </div>
      )}
    </div>
  );
}
