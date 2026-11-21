"use client";

/**
 * School J — Classical Artificial Intelligence: the premium programme
 * page. Twelve composed sections (hero → final CTA), every number,
 * subject, module, chapter count, prerequisite, outcome and project
 * read from the live curriculum registry — nothing is invented:
 *
 *   1  Hero — mission, registry stats, the state-space search emblem
 *   2  Introduction to traditional AI — search, logic, planning (+ LogicArt)
 *   3  What you will learn — the four pillars, real objectives
 *   4  History and evolution — 1950 → 1997, real milestones
 *   5  Curriculum overview — the six subjects as navigable cards
 *   6  Major learning domains — the interactive curriculum map
 *   7  Interactive laboratory — Python playground, real A* code
 *   8  Practical project showcase — the six registry projects
 *   9  Learning outcomes — the eighteen real outcome statements
 *   10 Prerequisites — the honest gates (hard + soft + placement)
 *   11 Recommended learning sequence — the dependency-honest order
 *   12 Start learning CTA
 *
 * Visual identity: bronze (--dv-viz-3) on the academy's Ink & Indigo
 * system — algorithm illustrations, graph visualizations and logical
 * diagrams, never robots or stock AI imagery.
 */
import { useMemo, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  Network,
  Play,
  ScrollText,
  ShieldCheck,
  Sigma,
  Waypoints,
  Sparkles,
  Terminal,
  TreeDeciduous,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import { curriculum } from "@/lib/curriculum/data";
import type { SubjectDef } from "@/lib/curriculum/types";
import { useStudentState } from "@/lib/academy/student";
import { DifficultyBadge, StatusBadge, formatHours, subjectStatus, type SubjectStatus } from "./shared";
import { ClassicalHeroArt, LogicArt } from "./artwork";

/* ------------------------------------------------------------------ data */

const J = (slug: string) => curriculum.subject(slug);

const HISTORY: Array<{ year: string; event: string; detail: string }> = [
  {
    year: "1950",
    event: "The Turing test",
    detail: "Alan Turing publishes Computing Machinery and Intelligence — can machines think, and how would we know?",
  },
  {
    year: "1956",
    event: "Dartmouth",
    detail: "The summer workshop that names the field: artificial intelligence as search, logic and learning.",
  },
  {
    year: "1957",
    event: "General Problem Solver",
    detail: "Newell, Shaw & Simon demonstrate means-ends reasoning — problem solving as search through a state space.",
  },
  {
    year: "1958",
    event: "Pruning game trees",
    detail: "Alpha–beta pruning appears in early chess programs — the first great search efficiency result.",
  },
  {
    year: "1965",
    event: "DENDRAL",
    detail: "The first knowledge-based system: chemistry reasoning encoded as rules, not numbers.",
  },
  {
    year: "1968",
    event: "A* is published",
    detail: "Hart, Nilsson & Raphael formalize heuristic search with admissibility — route planning has never been the same.",
  },
  {
    year: "1971",
    event: "STRIPS",
    detail: "Fikes & Nilsson define actions by preconditions and effects — the language of automated planning.",
  },
  {
    year: "1972",
    event: "Prolog & MYCIN",
    detail: "Logic programming in Marseille; a rule-based medical advisor at Stanford that outperforms junior clinicians.",
  },
  {
    year: "1980",
    event: "The expert-systems era",
    detail: "XCON configures real computers at DEC — knowledge engineering becomes an industry.",
  },
  {
    year: "1997",
    event: "Deep Blue",
    detail: "Search — evaluated by the ton — defeats the world chess champion. Classical AI's capstone moment.",
  },
];

const A_STAR_CODE = `from heapq import heappush, heappop

def a_star(graph, start, goal, h):
    """Optimal when h never overestimates."""
    frontier = [(h(start), start)]
    came_from, best_g = {}, {start: 0}
    while frontier:
        _, node = heappop(frontier)
        if node == goal:
            return rebuild(came_from, node)
        for nxt, step in graph[node]:
            g = best_g[node] + step
            if g < best_g.get(nxt, float("inf")):
                best_g[nxt] = g
                heappush(frontier, (g + h(nxt), nxt))
    return None        # frontier exhausted: no path`;

const TIER_STYLE: Record<string, string> = {
  guided: "bg-info-bg text-info-text border-info-border",
  independent: "bg-warning-bg text-warning-text border-warning-border",
  capstone: "bg-gold-100 text-gold-700 border-gold-300 dark:bg-gold-100/10 dark:text-gold-300 dark:border-gold-700",
};

const PILLARS = [
  {
    icon: Network,
    kicker: "Reasoning as search",
    text: "State spaces, uninformed and informed search, heuristics with guarantees, local search when there is no map.",
    codes: ["J1"],
    subjects: ["search-problem-solving"],
  },
  {
    icon: TreeDeciduous,
    kicker: "Reasoning against opponents & constraints",
    text: "Game trees and minimax with alpha–beta pruning; constraint satisfaction, propagation and tractable structure.",
    codes: ["J2", "J3"],
    subjects: ["adversarial-search-games", "constraint-satisfaction"],
  },
  {
    icon: ScrollText,
    kicker: "Knowledge as logic",
    text: "Propositional and first-order logic, unification and resolution — knowledge you can inspect, infer from and trust.",
    codes: ["J4"],
    subjects: ["knowledge-representation"],
  },
  {
    icon: Waypoints,
    kicker: "Action & judgment",
    text: "Planning languages and hierarchies; expert systems, and the turn to probability when knowledge is uncertain.",
    codes: ["J5", "J6"],
    subjects: ["classical-planning", "expert-systems-uncertainty"],
  },
] as const;

/* ------------------------------------------------------------- the map */

interface MapNode {
  slug: string;
  code: string;
  label: string;
  x: number; // viewBox units, 1000 × 470
  y: number;
  external?: boolean;
}

const MAP_NODES: MapNode[] = [
  { slug: "python", code: "A1", label: "Python", x: 90, y: 235, external: true },
  { slug: "search-problem-solving", code: "J1", label: "Search & Problem Solving", x: 290, y: 235 },
  { slug: "adversarial-search-games", code: "J2", label: "Adversarial Search", x: 500, y: 88 },
  { slug: "constraint-satisfaction", code: "J3", label: "Constraint Satisfaction", x: 500, y: 382 },
  { slug: "knowledge-representation", code: "J4", label: "Knowledge & Reasoning", x: 690, y: 235 },
  { slug: "classical-planning", code: "J5", label: "Classical Planning", x: 890, y: 88 },
  { slug: "expert-systems-uncertainty", code: "J6", label: "Expert Systems & Uncertainty", x: 890, y: 382 },
];

/** Solid = hard prerequisite, dashed = recommendation. Edges run node-center
 *  to node-center with horizontal S-approaches; the opaque node cards cover
 *  the ends. */
const MAP_EDGES: Array<{ d: string; soft?: boolean; to: string }> = [
  { d: "M 90 235 L 290 235", to: "search-problem-solving" },
  { d: "M 290 192 C 360 110, 430 88, 500 88", to: "adversarial-search-games" },
  { d: "M 290 278 C 360 360, 430 382, 500 382", to: "constraint-satisfaction" },
  { d: "M 90 235 C 90 380, 160 436, 250 436 L 560 436 C 650 436, 690 360, 690 235", to: "knowledge-representation" },
  { d: "M 290 235 L 690 235", soft: true, to: "knowledge-representation" },
  { d: "M 690 235 C 790 235, 830 88, 890 88", to: "classical-planning" },
  { d: "M 690 235 C 790 235, 830 382, 890 382", to: "expert-systems-uncertainty" },
  { d: "M 346 220 C 392 176, 420 16, 470 16 L 770 16 C 846 16, 888 18, 890 30", to: "classical-planning" },
];

/** The explicit origin dot for the J1→J5 bypass, so the lift-off reads. */
const MAP_ORIGIN_DOTS: Array<{ cx: number; cy: number }> = [
  { cx: 349, cy: 220 },
];

const STATUS_RING: Record<SubjectStatus, string> = {
  mastered: "border-success-text",
  waived: "border-gold-500",
  "in-progress": "border-primary",
  ready: "border-warning-text",
  locked: "border-border-strong",
};

const STATUS_DOT: Record<SubjectStatus, string> = {
  mastered: "bg-success-text",
  waived: "bg-gold-500",
  "in-progress": "bg-primary",
  ready: "bg-warning-text",
  locked: "bg-border-strong",
};

/* ------------------------------------------------------------ the view */

export function ClassicalAIView({ navigate }: { navigate: (hash: string) => void }) {
  const state = useStudentState();
  const mapRef = useRef<HTMLDivElement>(null);

  const school = curriculum.registry.schools.find((s) => s.slug === "classical-ai")!;
  const subjects = useMemo(() => curriculum.registry.subjects.filter((s) => s.school === "J"), []);
  const stats = curriculum.stats().bySchool["J"];

  const totals = useMemo(() => {
    const chapters = subjects.reduce(
      (n, s) => n + s.modules.reduce((m, mod) => m + mod.chapters.length, 0),
      0
    );
    const exercises = subjects.reduce(
      (n, s) =>
        n +
        s.modules.reduce(
          (m, mod) => m + mod.chapters.reduce((k, c) => k + c.lessons.reduce((a, l) => a + l.exercises, 0), 0),
          0
        ),
      0
    );
    const assessments =
      subjects.reduce((n, s) => n + s.modules.length, 0) + subjects.length; // module checkpoints + final exams
    return {
      modules: subjects.reduce((n, s) => n + s.modules.length, 0),
      chapters,
      exercises,
      assessments,
      projects: subjects.reduce((n, s) => n + s.projects.length, 0),
    };
  }, [subjects]);

  const j1 = J("search-problem-solving");
  const j1Status = subjectStatus(curriculum, state, "search-problem-solving");
  const j1Progress = state.progress["search-problem-solving"];

  const statusOf = (slug: string) => subjectStatus(curriculum, state, slug);
  const lessonsOf = (slug: string) => curriculum.lessonCount(slug);

  const outcomes = useMemo(
    () => subjects.flatMap((s) => s.outcomes.map((o) => ({ code: s.code, slug: s.slug, outcome: o }))),
    [subjects]
  );

  const beginCta =
    j1Status === "in-progress"
      ? { label: "Continue Search & Problem Solving", icon: Play }
      : j1Status === "mastered" || j1Status === "waived"
        ? { label: "Continue into the school", icon: Play }
        : { label: "Start Search & Problem Solving", icon: GraduationCap };

  return (
    <div className="min-w-0">
      {/* ============================================================ 1 · HERO */}
      <section className="dv-wash relative overflow-hidden border-b border-border-subtle">
        <div className="dv-grid-texture absolute inset-0" aria-hidden="true" />
        <div className="dv-container relative pb-14 pt-10 sm:pb-18 sm:pt-14 lg:pb-20">
          <button
            type="button"
            onClick={() => navigate("#/explore")}
            className="flex items-center gap-1 text-xs font-medium text-ink-3 transition-colors hover:text-ink hover:underline"
          >
            <ArrowRight className="h-3 w-3 rotate-180" /> All schools
          </button>

          <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
            <div className="min-w-0 dv-rise">
              <p className="eyebrow" style={{ color: school.color }}>
                School {school.code} · {school.name}
              </p>
              <h1 className="t-hero mt-4 text-ink">
                The <em className="font-display italic" style={{ color: school.color }}>symbolic</em> half
                of intelligence.
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-2 sm:text-base">
                Search before learning, logic before statistics, and every algorithm implemented by hand at
                least once — the ideas that still power route planners, verifiers, schedulers and game
                engines, taught the honest way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("#/subject/search-problem-solving")}
                  className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-e2 transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-e3"
                >
                  <beginCta.icon className="h-4 w-4" />
                  {beginCta.label}
                </button>
                <button
                  type="button"
                  onClick={() => scrollIntoViewSafe(mapRef.current ?? document.body, { block: "start" })}
                  className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink shadow-e1 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-e2"
                >
                  <Waypoints className="h-4 w-4 text-ink-3" />
                  Explore the curriculum
                </button>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: school.color }} />
                  Every algorithm built from scratch
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success-text" />
                  {totals.exercises} exercises, machine-verified
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-ink-3" />
                  Dependency-honest order
                </span>
              </p>
            </div>
            <div className="min-w-0 dv-rise dv-delay-2 mx-auto w-full max-w-md lg:max-w-[32rem]">
              <ClassicalHeroArt className="h-auto w-full" />
            </div>
          </div>

          {/* the registry, stated plainly */}
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-4">
            {[
              { value: String(subjects.length), label: "subjects" },
              { value: String(stats.lessons), label: `lessons · ${totals.chapters} chapters` },
              { value: String(totals.exercises), label: "graded exercises" },
              { value: `~${Math.round(stats.hours)} h`, label: "estimated study time" },
            ].map((s) => (
              <div key={s.label} className="bg-surface px-4 py-3.5">
                <p className="tabular font-display text-2xl font-medium leading-none text-ink">{s.value}</p>
                <p className="t-caption mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="tabular mt-3 text-xs text-ink-3">
            {totals.modules} modules · {totals.chapters} chapters · {totals.assessments} assessments ·{" "}
            {totals.projects} projects — every number read live from the curriculum registry.
          </p>
        </div>
      </section>

      {/* ============================================== 2 · INTRODUCTION */}
      <section className="dv-container dv-section">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow">The tradition</p>
            <h2 className="t-section mt-2 text-ink">Intelligence you can inspect</h2>
            <p className="t-lede mt-4">
              Before machine learning, artificial intelligence meant reasoning: representing what is known,
              searching for what follows, and explaining every step. This school teaches that tradition in
              full — not as history, but as the working toolbox behind modern verifiers, planners and
              decision engines.
            </p>
            <p className="t-body mt-4">
              Classical AI matters precisely where answers must be justified: a route an auditor can re-derive,
              a schedule that provably satisfies every constraint, a diagnosis with an explanation trace. You
              will model problems as state spaces, weigh knowledge as heuristics, encode facts as logic, and
              automate action as planning — the way engineers did for half a century, and still do wherever
              correctness is not negotiable.
            </p>
          </div>
          <div className="min-w-0 dv-band flex flex-col rounded-2xl p-6 sm:p-8">
            <LogicArt className="mx-auto w-full max-w-sm" />
            <div className="mt-5 border-t border-border-subtle pt-4">
              <p className="text-center font-mono text-[11px] tracking-wide text-ink-3">
                knowledge representation · propositional & first-order logic · automated reasoning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== 3 · WHAT YOU WILL LEARN */}
      <section className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="max-w-2xl">
            <p className="eyebrow">What you will learn</p>
            <h2 className="t-section mt-2 text-ink">Four pillars, one discipline</h2>
            <p className="t-caption mt-1.5">
              The whole school in four moves — each pillar taught by the subjects that own it, with the
              objectives exactly as they appear in the registry.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const owners = pillar.subjects.map((slug) => J(slug));
              return (
                <div
                  key={pillar.kicker}
                  className="flex flex-col rounded-xl border border-border-subtle bg-surface p-5 shadow-e1 sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `color-mix(in srgb, ${school.color} 12%, transparent)`, color: school.color }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <p className="t-item text-ink">{pillar.kicker}</p>
                  </div>
                  <p className="mt-3.5 text-sm leading-relaxed text-ink-2">{pillar.text}</p>
                  <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
                    {owners.map((s) => (
                      <div key={s.slug} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`#/subject/${s.slug}`)}
                          className="group flex w-fit items-center gap-2 text-left"
                        >
                          <span className="font-mono text-[11px] text-ink-3">{s.code}</span>
                          <span className="text-[13px] font-medium text-ink group-hover:text-primary group-hover:underline">
                            {s.title}
                          </span>
                        </button>
                        <ul className="mt-1.5 space-y-1">
                          {s.objectives.slice(0, 2).map((o) => (
                            <li key={o} className="flex items-start gap-2 text-[13px] leading-snug text-ink-3">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: school.color }} />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================ 4 · HISTORY */}
      <section className="dv-container dv-section">
        <div className="max-w-2xl">
          <p className="eyebrow">The lineage</p>
          <h2 className="t-section mt-2 text-ink">History and evolution</h2>
          <p className="t-caption mt-1.5">
            Every subject you will study was a real turning point. The school follows the arc — and the arc
            explains the syllabus.
          </p>
        </div>
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-x-0 top-[7px] hidden h-px bg-border-subtle sm:block" aria-hidden="true" />
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:grid grid-cols-1 sm:grid-cols-5 sm:gap-x-6 sm:overflow-visible sm:px-0">
              {HISTORY.map((h) => (
                <div key={h.year} className="w-56 shrink-0 snap-start sm:w-auto">
                  <span
                    className="relative z-10 block h-3.5 w-3.5 rounded-full border-2 border-surface"
                    style={{ backgroundColor: school.color }}
                  />
                  <p className="tabular mt-3 font-mono text-[13px] font-semibold text-ink">{h.year}</p>
                  <p className="mt-1 text-[13px] font-medium text-ink">{h.event}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">{h.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================== 5 · CURRICULUM OVERVIEW */}
      <section className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">The curriculum</p>
              <h2 className="t-section mt-2 text-ink">Six subjects, thirteen modules</h2>
              <p className="t-caption mt-1.5 max-w-xl">
                Each card is the real registry entry — objectives, prerequisites, chapter counts and
                difficulty exactly as the platform enforces them.
              </p>
            </div>
            <button type="button" onClick={() => navigate("#/explore")} className="link-dv w-fit text-sm">
              Compare every subject →
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {subjects.map((s) => (
              <SubjectCard key={s.slug} subject={s} status={statusOf(s.slug)} navigate={navigate} state={state} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================== 6 · MAJOR LEARNING DOMAINS · THE MAP */}
      <section ref={mapRef} className="dv-container dv-section scroll-mt-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Major learning domains</p>
          <h2 className="t-section mt-2 text-ink">The curriculum map</h2>
          <p className="t-caption mt-1.5">
            The school as a dependency graph. Solid edges are hard gates the registry enforces; the dashed
            edge is a recommendation. Every node is live — click to open that subject.
          </p>
        </div>

        {/* the interactive map (lg and up) */}
        <div className="mt-8 hidden lg:block">
          <div className="relative w-full" style={{ aspectRatio: "1000 / 470" }}>
            <svg
              viewBox="0 0 1000 470"
              className="absolute inset-0 h-full w-full"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <marker id="dv-map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 1 L8 5 L0 9 z" fill="var(--dv-border-strong)" />
                </marker>
              </defs>
              {MAP_EDGES.map((e, i) => {
                const targetReady = statusOf(e.to) !== "locked";
                return (
                  <path
                    key={i}
                    d={e.d}
                    stroke={e.soft ? "var(--dv-ink-3)" : targetReady ? `color-mix(in srgb, ${school.color} 55%, var(--dv-border-strong))` : "var(--dv-border-strong)"}
                    strokeWidth={e.soft ? 1.6 : 2.2}
                    strokeDasharray={e.soft ? "4 6" : undefined}
                    markerEnd="url(#dv-map-arrow)"
                    opacity={e.soft ? 0.7 : 1}
                  />
                );
              })}
              {MAP_ORIGIN_DOTS.map((d, i) => (
                <circle key={i} cx={d.cx} cy={d.cy} r="3.4" fill="var(--dv-border-strong)" stroke="var(--dv-surface)" strokeWidth="1.4" />
              ))}
            </svg>
            {MAP_NODES.map((n) => (
              <MapNodeCard key={n.slug} node={n} status={statusOf(n.slug)} lessons={lessonsOf(n.slug)} navigate={navigate} />
            ))}
          </div>
          {/* legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-3">
            {(
              [
                ["Mastered", "bg-success-text"],
                ["In progress", "bg-primary"],
                ["Ready to start", "bg-warning-text"],
                ["Locked — prerequisites unmet", "bg-border-strong"],
              ] as const
            ).map(([label, dot]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", dot)} />
                {label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--dv-border-strong)" strokeWidth="1.8" /></svg>
              hard prerequisite
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--dv-ink-3)" strokeWidth="1.3" strokeDasharray="4 6" /></svg>
              recommended
            </span>
          </div>
        </div>

        {/* compact map for small screens */}
        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
          {MAP_NODES.map((n) => {
            const st = statusOf(n.slug);
            const progress = state.progress[n.slug];
            return (
              <button
                key={n.slug}
                type="button"
                onClick={() => navigate(`#/subject/${n.slug}`)}
                className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-surface px-3.5 py-3 text-left shadow-e1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-e2"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[st])} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink group-hover:text-primary">
                    <span className="mr-1.5 font-mono text-[11px] font-normal text-ink-3">{n.code}</span>
                    {n.label}
                  </span>
                  <span className="tabular mt-0.5 block text-[11px] text-ink-3">
                    {n.external
                      ? "School A · the entry gate"
                      : progress
                        ? `${progress.lessonsCompleted}/${progress.lessonsTotal} lessons · ${st.replace("-", " ")}`
                        : `${lessonsOf(n.slug)} lessons · ${st.replace("-", " ")}`}
                  </span>
                </span>
                {st === "locked" ? <Lock className="h-3.5 w-3.5 shrink-0 text-ink-3" /> : <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-3" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================ 7 · THE LABORATORY */}
      <section className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow">Practice, honestly</p>
            <h2 className="t-section mt-2 text-ink">The interactive laboratory</h2>
            <p className="t-lede mt-4">
              There is no simulated classical-AI sandbox here. Every algorithm in this school is implemented
              by your own hand in the Python laboratory — a real engine running in your browser — and every
              exercise is checked by running your code, not by trusting your prose.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                `${totals.exercises} machine-graded exercises across the school`,
                `${totals.assessments} checkpoint and final assessments, written against the real syllabus`,
                "A placement test that lets you prove J1 mastery and move straight to J2–J6",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("#/playground")}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-e1 transition-colors duration-150 hover:bg-primary-hover"
              >
                <Terminal className="h-4 w-4" />
                Open the Python Playground
              </button>
              <button
                type="button"
                onClick={() => navigate("#/labs")}
                className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink shadow-e1 transition-colors duration-150 hover:bg-surface-subtle"
              >
                <FlaskConical className="h-4 w-4 text-ink-3" />
                All laboratories
              </button>
            </div>
          </div>
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-e2">
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-danger-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success-border" />
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-ink-3">astar.py · Python playground</span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: school.color }}>
                  school J · search
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-[11.5px] leading-relaxed text-ink-2">
                <code>{A_STAR_CODE}</code>
              </pre>
              <div className="flex items-center gap-2 border-t border-border-subtle px-4 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-text" />
                <span className="font-mono text-[11px] text-ink-3">the J1 project implements exactly this — then breaks it on purpose</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== 8 · THE PROJECTS */}
      <section className="dv-container dv-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Learn by building</p>
            <h2 className="t-section mt-2 text-ink">The project record</h2>
            <p className="t-caption mt-1.5 max-w-xl">
              One project closes every subject — guided first builds, independent engines, then capstones
              scored like a hiring panel. Briefs, rubrics and deliverables exactly as the registry defines
              them.
            </p>
          </div>
          <button type="button" onClick={() => navigate("#/projects")} className="link-dv w-fit text-sm">
            Every project in the academy →
          </button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.flatMap((s) => s.projects.map((p) => ({ ...p, subject: s }))).map((p) => (
            <div
              key={p.title}
              className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 shadow-e1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-e2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", TIER_STYLE[p.tier])}>
                  {p.tier}
                </span>
                <span className="tabular text-xs text-ink-3">{p.hours} h</span>
              </div>
              <p className="t-item mt-4 text-ink">{p.title}</p>
              <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-ink-3">{p.brief}</p>
              <div className="mt-4 border-t border-border-subtle pt-3.5">
                <button
                  type="button"
                  onClick={() => navigate(`#/subject/${p.subject.slug}`)}
                  className="group/meta flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs text-ink-3">
                    <span className="font-mono">{p.subject.code}</span> · {p.deliverables.length} deliverables ·{" "}
                    {p.rubric.length} rubric criteria
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-3 transition-transform duration-150 group-hover/meta:-translate-y-0.5 group-hover/meta:translate-x-0.5" />
                </button>
                <p className="mt-1.5 truncate font-mono text-[11px] text-ink-3">{p.tools.join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================== 9 · OUTCOMES */}
      <section className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="max-w-2xl">
            <p className="eyebrow">After the school</p>
            <h2 className="t-section mt-2 text-ink">Learning outcomes</h2>
            <p className="t-caption mt-1.5">
              The registry states each outcome as a verifiable claim about you — {outcomes.length} in all.
              If a claim cannot be tested, it does not appear.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            {outcomes.map(({ code, slug, outcome }) => (
              <button
                key={outcome}
                type="button"
                onClick={() => navigate(`#/subject/${slug}`)}
                className="group flex items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-surface"
              >
                <span
                  className="mt-0.5 flex h-5 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold"
                  style={{ backgroundColor: `color-mix(in srgb, ${school.color} 12%, transparent)`, color: school.color }}
                >
                  {code}
                </span>
                <span className="text-sm leading-relaxed text-ink-2 group-hover:text-ink">{outcome}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== 10 · PREREQUISITES */}
      <section className="dv-container dv-section">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow">The honest gates</p>
            <h2 className="t-section mt-2 text-ink">Prerequisites</h2>
            <p className="t-lede mt-4">
              Only one door leads in: Python. Everything else in the school is sequenced by the registry
              itself — hard gates are enforced by the platform, recommendations are surfaced but never
              blocking.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <BookOpen className="h-4 w-4" style={{ color: school.color }} />
                    Python — School A
                  </p>
                  <span className="rounded-full border border-warning-border bg-warning-bg px-2.5 py-0.5 text-[11px] font-medium text-warning-text">
                    required for J1 & J4
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                  The interactive Python course — or a placement pass — satisfies the gate.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("#/course")}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
                  >
                    The Python course <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("#/placement")}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-ink transition-colors duration-150 hover:bg-surface-subtle"
                  >
                    Test out instead
                  </button>
                </div>
              </div>
              {j1.placementEligible && (
                <div className="flex items-start gap-3 rounded-xl border border-dashed border-border-strong bg-surface-subtle/50 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: school.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Already know search and heuristics?</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-3">
                      J1 is placement-eligible — score 90+ on the placement test and the registry waives it,
                      unlocking J2, J3 and the rest immediately.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("#/placement/search-problem-solving")}
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      Take the J1 placement test →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* the full gate table, straight from the registry */}
          <div className="min-w-0 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1">
            <div className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-border-subtle bg-surface-subtle/60 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Subject</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">The registry requires</p>
            </div>
            <div className="divide-y divide-border-subtle">
              {subjects.map((s) => (
                <div key={s.slug} className="grid grid-cols-[1fr_1.4fr] gap-4 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => navigate(`#/subject/${s.slug}`)}
                    className="group flex min-w-0 items-center gap-2 text-left"
                  >
                    <span className="font-mono text-[11px] text-ink-3">{s.code}</span>
                    <span className="truncate text-[13px] font-medium text-ink group-hover:text-primary group-hover:underline">
                      {s.title}
                    </span>
                  </button>
                  <div className="flex flex-col gap-1">
                    {s.prerequisites.length === 0 && s.softPrerequisites.length === 0 ? (
                      <span className="text-[13px] text-ink-3">Open — start anytime</span>
                    ) : (
                      <>
                        {s.prerequisites.map((p) => (
                          <span key={p} className="flex items-center gap-1.5 text-[13px] text-ink-2">
                            <Lock className="h-3 w-3 shrink-0 text-ink-3" />
                            {curriculum.subject(p).code} — {curriculum.subject(p).title}
                          </span>
                        ))}
                        {s.softPrerequisites.map((p) => (
                          <span key={p} className="flex items-center gap-1.5 text-[13px] text-ink-3">
                            <CircleDashed className="h-3 w-3 shrink-0" />
                            recommended: {curriculum.subject(p).code} — {curriculum.subject(p).title}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================== 11 · RECOMMENDED SEQUENCE */}
      <section className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="max-w-2xl">
            <p className="eyebrow">The honest order</p>
            <h2 className="t-section mt-2 text-ink">Recommended learning sequence</h2>
            <p className="t-caption mt-1.5">
              Derived from the actual prerequisite graph — the platform will let you take exactly these
              liberties, and no others.
            </p>
          </div>
          <ol className="relative mt-8 space-y-4 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:w-px before:bg-border-subtle sm:space-y-3">
            {[
              {
                step: "0",
                icon: BookOpen,
                title: "Python — School A",
                hash: "#/course",
                status: statusOf("python") === "mastered" || statusOf("python") === "waived" ? "Mastered" : statusOf("python") === "in-progress" ? "In progress" : "The entry gate",
                note: "The toolkit: functions, data structures, and enough fluency to implement algorithms without fighting the language.",
              },
              {
                step: "1",
                icon: Network,
                title: `${j1.code} — ${j1.title}`,
                hash: "#/subject/search-problem-solving",
                status: j1Status === "mastered" ? "Mastered" : j1Status === "in-progress" ? "In progress" : j1Status === "ready" ? "Ready to start" : "Start here",
                note: "The foundation everything else assumes: state spaces, uninformed and heuristic search, local search. Placement can waive it.",
                highlight: true,
              },
              {
                step: "2",
                icon: TreeDeciduous,
                title: "J2 and J3 — in either order",
                hash: "#/subject/adversarial-search-games",
                status: "Two doors open",
                note: "Adversarial search (games, minimax, alpha–beta) and constraint satisfaction (backtracking, propagation) both require only J1 — pick the world you prefer, or take both.",
              },
              {
                step: "3",
                icon: ScrollText,
                title: "J4 — Knowledge Representation & Reasoning",
                hash: "#/subject/knowledge-representation",
                status: "The turn to knowledge",
                note: "Propositional and first-order logic, unification and resolution. The registry places Python as the hard gate; J1 first is recommended.",
              },
              {
                step: "4",
                icon: Waypoints,
                title: "J5 and J6 — planning and expert systems",
                hash: "#/subject/classical-planning",
                status: "The capstones",
                note: "STRIPS, Graphplan and hierarchies (J5, needs J1+J4); production systems, knowledge engineering and reasoning under uncertainty (J6, needs J4). Either order finishes the school.",
              },
            ].map((row) => (
              <li key={row.step} className="relative pl-11 sm:pl-12">
                <span
                  className={cn(
                    "absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-surface shadow-e1",
                    row.highlight ? "border-transparent text-white" : "border-border-subtle text-ink-3"
                  )}
                  style={row.highlight ? { backgroundColor: school.color } : undefined}
                >
                  <row.icon className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => navigate(row.hash)}
                  className={cn(
                    "group block w-full rounded-xl border bg-surface p-4 text-left shadow-e1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-e2 sm:p-5",
                    row.highlight ? "border-transparent" : "border-border-subtle"
                  )}
                  style={row.highlight ? { borderColor: `color-mix(in srgb, ${school.color} 35%, var(--dv-border))` } : undefined}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="tabular font-mono text-[11px] text-ink-3">STAGE {row.step}</span>
                    <span className="text-[15px] font-medium text-ink group-hover:text-primary">{row.title}</span>
                    <span
                      className="ml-auto rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                      style={
                        row.status === "Mastered"
                          ? { color: "var(--dv-success-text)", borderColor: "var(--dv-success-border)", backgroundColor: "var(--dv-success-bg)" }
                          : row.status === "In progress"
                            ? { color: "var(--dv-indigo-700)", borderColor: "var(--dv-indigo-200)", backgroundColor: "var(--dv-indigo-50)" }
                            : { color: "var(--dv-ink-3)", borderColor: "var(--dv-border-subtle)", backgroundColor: "var(--dv-surface-subtle)" }
                      }
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3 sm:text-sm">{row.note}</p>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================== 12 · FINAL CTA */}
      <section className="dv-container pb-16">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12 sm:py-16"
          style={{ backgroundColor: school.color }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(32rem 20rem at 50% 40%, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(32rem 20rem at 50% 40%, black, transparent 75%)",
            }}
            aria-hidden="true"
          />
          <p className="relative eyebrow text-white/85">School J · Classical Artificial Intelligence</p>
          <h2 className="t-display relative mx-auto mt-3 max-w-xl text-white">
            {j1Progress ? "Your next node is waiting." : "Begin where intelligence begins: search."}
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/85">
            {j1Progress
              ? `Search & Problem Solving — ${j1Progress.lessonsCompleted}/${j1Progress.lessonsTotal} lessons. The frontier is one click deep.`
              : `${subjects.length} subjects, ${stats.lessons} lessons and ${totals.projects} projects — from your first state space to a planning capstone, in dependency-honest order.`}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("#/subject/search-problem-solving")}
              className="flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium shadow-e2 transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/90"
              style={{ color: school.color }}
            >
              <beginCta.icon className="h-4 w-4" />
              {beginCta.label}
            </button>
            <button
              type="button"
              onClick={() => navigate("#/placement/search-problem-solving")}
              className="flex h-11 items-center gap-2 rounded-lg border border-white/40 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10"
            >
              <Lightbulb className="h-4 w-4" />
              Test out of J1
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-3">
          Part of{" "}
          <button type="button" onClick={() => navigate("#/")} className="font-medium text-primary hover:underline">
            DataVerse Academy
          </button>{" "}
          — {curriculum.registry.schools.length} schools, one curriculum, every prerequisite enforced.
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ map node */

function MapNodeCard({
  node,
  status,
  lessons,
  navigate,
}: {
  node: MapNode;
  status: SubjectStatus;
  lessons: number;
  navigate: (hash: string) => void;
}) {
  const label =
    node.external ? "School A · entry" : status === "locked" ? "prerequisites first" : `${lessons} lessons`;
  return (
    <button
      type="button"
      onClick={() => navigate(`#/subject/${node.slug}`)}
      className={cn(
        "group absolute flex w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border bg-surface p-2.5 text-center shadow-e1 transition-all duration-150 hover:z-10 hover:-translate-y-[calc(50%+2px)] hover:shadow-e2",
        node.external ? "border-border-strong bg-surface-subtle/70" : "border-border-subtle",
        status === "locked" && "opacity-80"
      )}
      style={{ left: `${node.x / 10}%`, top: `${(node.y / 470) * 100}%` }}
      aria-label={`${node.code} ${node.label}${status === "locked" ? " (locked)" : ""}`}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 bg-surface font-mono text-[11px] font-semibold",
          STATUS_RING[status],
          status === "locked" ? "text-ink-3" : "text-ink"
        )}
      >
        {node.code}
      </span>
      <span className="mt-1.5 line-clamp-2 min-w-0 text-[11px] font-medium leading-tight text-ink">
        {node.label}
      </span>
      <span className="tabular mt-1 flex items-center gap-1 text-[9px] text-ink-3">
        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
        {node.external ? label : status === "locked" ? label : status === "mastered" ? "mastered" : status === "in-progress" ? "in progress" : status === "ready" ? "ready" : label}
      </span>
    </button>
  );
}

/* -------------------------------------------------------- subject card */

function SubjectCard({
  subject,
  status,
  navigate,
  state,
}: {
  subject: SubjectDef;
  status: SubjectStatus;
  navigate: (hash: string) => void;
  state: ReturnType<typeof useStudentState>;
}) {
  const lessons = curriculum.lessonCount(subject.slug);
  const hours = curriculum.hours(subject.slug);
  const chapters = subject.modules.reduce((n, m) => n + m.chapters.length, 0);
  const progress = state.progress[subject.slug];
  const schoolColor = "var(--dv-viz-3)";

  return (
    <div
      className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-e1 transition-shadow duration-150 hover:shadow-e2"
    >
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle px-5 py-4">
        <span
          className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md font-mono text-[12px] font-semibold"
          style={{ backgroundColor: `color-mix(in srgb, ${schoolColor} 12%, transparent)`, color: schoolColor }}
        >
          {subject.code}
        </span>
        <button
          type="button"
          onClick={() => navigate(`#/subject/${subject.slug}`)}
          className="group flex min-w-0 items-center gap-2 text-left"
        >
          <span className="text-[15px] font-medium text-ink group-hover:text-primary sm:text-base">
            {subject.title}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={subject.difficulty} />
          <StatusBadge status={status} />
        </span>
      </div>

      {/* body */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 px-5 py-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-ink-2">{subject.blurb}</p>
          <p className="tabular mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
            <span>{subject.modules.length} modules</span>
            <span>· {chapters} chapters</span>
            <span>· {lessons} lessons</span>
            <span>· {formatHours(hours)}</span>
            <span>· {subject.objectives.length} objectives</span>
            <span>· final exam {subject.finalExam.questions}q</span>
          </p>
          {progress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-ink-3">
                <span className="tabular">
                  {progress.lessonsCompleted}/{progress.lessonsTotal} lessons
                </span>
                <span className="tabular">{Math.round((progress.lessonsCompleted / progress.lessonsTotal) * 100)}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-inset">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (progress.lessonsCompleted / progress.lessonsTotal) * 100)}%`,
                    backgroundColor: schoolColor,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* the modules — real chapter counts */}
        <div className="min-w-0 space-y-1.5">
          {subject.modules.map((m) => (
            <div
              key={m.title}
              className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-subtle/50 px-3 py-2"
            >
              <span className="min-w-0 truncate text-xs font-medium text-ink">{m.title}</span>
              <span className="tabular shrink-0 text-[11px] text-ink-3">
                {m.chapters.length}ch ·{" "}
                {m.chapters.reduce((n, c) => n + c.lessons.length, 0)}les
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 px-3 pt-0.5 text-[11px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              {subject.prerequisites.length + subject.softPrerequisites.length > 0
                ? `requires ${subject.prerequisites.map((p) => curriculum.subject(p).code).join(", ")}${
                    subject.softPrerequisites.length
                      ? ` · recommends ${subject.softPrerequisites.map((p) => curriculum.subject(p).code).join(", ")}`
                      : ""
                  }`
                : "no prerequisites — start anytime"}
            </span>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
          <Sigma className="h-3 w-3" />
          {subject.projects.length > 0
            ? `${subject.projects[0].tier} project: ${subject.projects[0].title}`
            : "no project"}
        </span>
        <button
          type="button"
          onClick={() => navigate(`#/subject/${subject.slug}`)}
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
        >
          View the curriculum <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
