"use client";

/**
 * Academy home — the entrance to a serious international learning
 * institution. Ten composed sections (hero → footer):
 *
 *   1  Hero — mission, CTAs and the interactive HeroScene over a brand wash
 *   2  The institution — what the academy is, honestly (live registry numbers)
 *   3  Learning schools — the ten schools as a card grid
 *   4  Career learning paths — the staged roadmap as a connected stepper
 *   5  Featured programmes — the interactive courses
 *   6  Interactive learning laboratories — the engines in the browser
 *   7  Ada — the AI personal tutor, shown the way she actually teaches
 *   8  Practical projects — three real registry projects + the record
 *   9  The learning experience — study, practice, build, prove
 *   10 Final call to action
 *
 * Typography carries the hierarchy; color is restrained; every number,
 * subject, project and destination is real registry data.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Database,
  FlaskConical,
  FolderGit2,
  GraduationCap,
  Grid3x3,
  LineChart,
  Map,
  MessagesSquare,
  Play,
  Sigma,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { curriculum } from "@/lib/curriculum/data";
import type { ProjectDef, SubjectDef } from "@/lib/curriculum/types";
import { useStudentState } from "@/lib/academy/student";
import { SchoolIcon, formatHours } from "./shared";
import { PROGRAMMES } from "./programmes";
import { HeroScene } from "./hero-scene";
import { useSession } from "./account";

const PROGRAMME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  database: Database,
  sigma: Sigma,
  grid: Grid3x3,
  chart: LineChart,
  cpu: Compass,
  code: Terminal,
};

const TIER_STYLE: Record<string, string> = {
  guided: "bg-success-bg text-success-text border-success-border",
  independent: "bg-warning-bg text-warning-text border-warning-border",
  capstone: "bg-gold-100 text-gold-700 border-gold-300 dark:bg-gold-100/10 dark:text-gold-300 dark:border-gold-700",
};

/** Three flagship registry projects, found by title so the data stays real. */
const SHOWCASE_TITLES = [
  "The 8-Puzzle Laboratory",
  "The Honest A/B Test Report",
  "The Model Selection Dossier",
];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** One server-side resume candidate — the dashboard's continueLearning item. */
interface ServerResume {
  courseId: string;
  courseTitle: string;
  percentage: number;
  lessonId: string;
  lessonTitle: string;
  isResume: boolean;
}

export function AcademyHome({ navigate }: { navigate: (hash: string) => void }) {
  const state = useStudentState();
  const session = useSession();
  const [serverResume, setServerResume] = useState<ServerResume | null>(null);
  const manifest = curriculum.stats();

  // Signed in? The server knows the real last lesson — ask the dashboard.
  useEffect(() => {
    if (!session?.authenticated) return;
    let cancelled = false;
    fetch("/api/analytics/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const dash = j?.data ?? j;
        const item = dash?.continueLearning?.[0] ?? null;
        if (!cancelled && item) setServerResume(item);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [session?.authenticated]);

  const actions = useMemo(() => curriculum.nextActions(state, []), [state]);
  const registryProjectCount = useMemo(
    () => curriculum.registry.subjects.reduce((n, s) => n + s.projects.length, 0),
    []
  );
  const showcase = useMemo(() => {
    const out: Array<{ project: ProjectDef; subject: SubjectDef }> = [];
    for (const title of SHOWCASE_TITLES) {
      for (const subject of curriculum.registry.subjects) {
        const project = subject.projects.find((p) => p.title === title);
        if (project) {
          out.push({ project, subject });
          break;
        }
      }
    }
    return out;
  }, []);
  const plan = useMemo(() => curriculum.planRoadmap("data-scientist"), []);
  const roadmapSubjects = plan.stages.reduce((n, s) => n + s.subjects.length, 0);

  // The server's last-lesson wins; guest progress from this browser fills in.
  const resumeTarget = serverResume
    ? {
        label: serverResume.courseTitle,
        detail: `${Math.round(serverResume.percentage)}% complete · ${serverResume.lessonTitle}`,
        hash: `#/study/${serverResume.lessonId}`,
      }
    : actions.resume
      ? {
          label: curriculum.subject(actions.resume.slug).title,
          detail: `${actions.resume.lessonsCompleted}/${actions.resume.lessonsTotal} lessons`,
          hash: `#/subject/${actions.resume.slug}`,
        }
      : null;

  const primaryCta = resumeTarget
    ? { label: "Continue learning", hash: resumeTarget.hash }
    : { label: "Start learning", hash: "#/course" };

  return (
    <div className="min-w-0">
      {/* ============================================================ 1 · HERO */}
      <section className="dv-wash relative overflow-hidden border-b border-border-subtle">
        <div className="dv-grid-texture absolute inset-0" aria-hidden="true" />
        <div className="dv-container relative pb-14 pt-12 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
            <div className="min-w-0 dv-rise">
              <p className="eyebrow flex items-center gap-2 text-primary">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                The data-science institution
              </p>
              <h1 className="t-hero mt-4 text-ink">
                From <em className="font-display italic">first principles</em>
                <br />
                to <span className="dv-gradient-text font-display italic">data scientist.</span>
              </h1>
              <p className="t-lede mt-6 max-w-xl">
                A complete, dependency-honest curriculum — ten schools, interactive programmes with
                machine-verified outputs, and real engines running privately in your browser, from
                your first line of code to a portfolio that survives the interview.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(primaryCta.hash)}
                  className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-e2 dv-lift hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-e3"
                >
                  {resumeTarget ? <Play className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                  {primaryCta.label}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("#/explore")}
                  className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink shadow-e1 dv-lift hover:-translate-y-0.5 hover:border-border-strong hover:shadow-e2"
                >
                  <Compass className="h-4 w-4 text-ink-3" />
                  Explore courses
                </button>
              </div>
              <p className="mt-6 grid grid-cols-1 gap-x-5 gap-y-1.5 text-xs text-ink-3 sm:grid-cols-3">
                <span className="flex items-start gap-1.5 leading-snug">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-text" />
                  Every output machine-verified
                </span>
                <span className="flex items-start gap-1.5 leading-snug">
                  <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Real engines, in your browser
                </span>
                <span className="flex items-start gap-1.5 leading-snug">
                  <Map className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
                  Placement tests for what you know
                </span>
              </p>
            </div>
            <div className="min-w-0 dv-rise dv-delay-2">
              <HeroScene className="mx-auto w-full max-w-[34rem]" />
            </div>
          </div>

          {/* returning learners: the honest next step, right where the eye lands */}
          {resumeTarget && (
            <div className="relative mt-10">
              <button
                type="button"
                onClick={() => navigate(resumeTarget.hash)}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-surface/80 px-5 py-3.5 text-left shadow-e1 backdrop-blur-sm dv-lift hover:shadow-e2 dark:border-indigo-800 dark:bg-surface/70"
              >
                <div className="min-w-0">
                  <p className="eyebrow text-primary">Pick up where you left off</p>
                  <p className="mt-1 truncate text-[15px] font-medium text-ink">
                    {resumeTarget.label}
                    <span className="ml-2 truncate text-sm font-normal text-ink-3">{resumeTarget.detail}</span>
                  </p>
                </div>
                <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-e1 transition-colors duration-150 group-hover:bg-primary-hover">
                  <Play className="h-3.5 w-3.5" /> Resume
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================================================ 2 · THE INSTITUTION */}
      <Reveal as="section" className="dv-container dv-section">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow">The institution</p>
            <h2 className="t-section mt-2 text-ink">An academy built the honest way</h2>
            <p className="t-lede mt-4">
              DataVerse Academy is a complete, dependency-honest curriculum: mathematics always
              arrives before the machine learning that needs it, and nothing unlocks before you
              are ready for it.
            </p>
            <p className="t-body mt-4">
              Every program output you will ever see on this platform was executed by a real engine
              and verified before it reached the page. The engines themselves — Python, PostgreSQL,
              NumPy — run locally in your browser, so practice is safe, instant and private. And if
              you already know a subject, a placement test lets you prove it and move on.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("#/docs")}
                className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink shadow-e1 transition-colors duration-150 hover:bg-surface-subtle"
              >
                <BookOpen className="h-4 w-4 text-ink-3" />
                How the platform works
              </button>
              <button
                type="button"
                onClick={() => navigate("#/explore")}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-e1 transition-colors duration-150 hover:bg-primary-hover"
              >
                Explore the catalogue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* the registry, in numbers — live from the data */}
          <div className="min-w-0 self-center">
            {[
              { value: String(curriculum.registry.schools.length), label: "Learning schools" },
              { value: manifest.subjects.toLocaleString(), label: "Prerequisite-mapped subjects" },
              { value: manifest.lessons.toLocaleString(), label: "Lessons in the registry" },
              { value: `${Math.round(manifest.totalHours).toLocaleString()} h`, label: "Estimated study time" },
            ].map((s, i, rows) => (
              <div
                key={s.label}
                className={cn(
                  "flex items-baseline justify-between gap-6 py-5",
                  i === 0 && "border-t border-border-subtle",
                  i < rows.length - 1 ? "border-b border-border-subtle" : "border-b"
                )}
              >
                <p className="tabular font-display text-[2.35rem] font-medium leading-none text-ink">
                  {s.value}
                </p>
                <p className="t-caption max-w-[12rem] text-right">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============================================== 3 · LEARNING SCHOOLS */}
      <Reveal as="section" className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">The curriculum</p>
              <h2 className="t-section mt-2 text-ink">Ten learning schools</h2>
              <p className="t-caption mt-1.5 max-w-xl">
                From first tools to classical AI — each school is a coherent discipline, and the
                dependency graph between subjects keeps the order honest.
              </p>
            </div>
            <button type="button" onClick={() => navigate("#/explore")} className="link-dv w-fit text-sm">
              Browse every subject →
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {curriculum.registry.schools.map((school) => {
              const stats = manifest.bySchool[school.code];
              return (
                <button
                  key={school.code}
                  type="button"
                  onClick={() => navigate(`#/school/${school.slug}`)}
                  className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-4 text-left shadow-e1 dv-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${school.color} 12%, transparent)`,
                        color: school.color,
                      }}
                    >
                      <SchoolIcon name={school.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="font-mono text-[11px] text-ink-3">{school.code}</span>
                  </div>
                  <p className="mt-3.5 text-[15px] font-medium leading-tight text-ink group-hover:text-primary">
                    {school.name}
                  </p>
                  <p className="t-caption mt-1.5 line-clamp-2 flex-1">{school.tagline}</p>
                  <p className="tabular mt-3 border-t border-border-subtle pt-2.5 text-[11.5px] text-ink-3">
                    {stats.subjects} subjects · {stats.lessons} lessons
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* ========================================== 4 · CAREER LEARNING PATHS */}
      <Reveal as="section" className="dv-container dv-section">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow">Guided journeys</p>
            <h2 className="t-section mt-2 text-ink">Career learning paths</h2>
            <p className="t-lede mt-4">
              The recommended Data Scientist path sequences {roadmapSubjects} subjects into ten
              dependency-honest stages — you always arrive prepared, never ahead of yourself.
            </p>

            {/* the stepper — ten stages, one connected climb */}
            <ol className="mt-8 space-y-0">
              {plan.stages.map((st, i) => (
                <li key={st.title} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < plan.stages.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[15px] top-8 h-full w-px bg-border" />
                  )}
                  <span className="tabular relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[12px] font-semibold text-ink-2 shadow-e1">
                    {st.index}
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-[14.5px] font-medium text-ink">{st.title}</span>
                      <span className="tabular text-[11.5px] text-ink-3">
                        {st.subjects.length} subjects · {formatHours(st.hours)}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("#/roadmap")}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-e1 transition-colors duration-150 hover:bg-primary-hover"
              >
                <Map className="h-4 w-4" />
                Open the roadmaps
              </button>
              <button
                type="button"
                onClick={() => navigate("#/placement")}
                className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink shadow-e1 transition-colors duration-150 hover:bg-surface-subtle"
              >
                <LineChart className="h-4 w-4 text-ink-3" />
                Test out of what you know
              </button>
            </div>
          </div>

          {/* the plan at a glance + the registry's two roadmaps */}
          <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <div className="dv-panel-indigo rounded-2xl p-6 sm:p-7">
              <p className="eyebrow text-white/55">The plan at a glance</p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { value: Math.round(plan.totalHours).toLocaleString(), label: "hours of study" },
                  { value: String(plan.totalWeeks), label: "weeks at 8 h/week" },
                  { value: String(roadmapSubjects), label: "staged subjects" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="tabular font-display text-[1.05rem] font-medium leading-none sm:text-[1.65rem]">{s.value}</p>
                    <p className="mt-1.5 text-[10px] leading-snug text-white/75 sm:text-[11px]">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-white/15 pt-3.5 text-[12.5px] leading-relaxed text-white/75">
                Pace is yours — the roadmap recomputes the calendar around your hours per week, and
                placement tests shorten the road honestly.
              </p>
            </div>
            {curriculum.registry.roadmaps.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => navigate("#/roadmap")}
                className="group flex w-full flex-col rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
              >
                <p className="t-item text-ink group-hover:text-primary">{r.title}</p>
                <p className="t-caption mt-1.5 line-clamp-2">{r.audience}</p>
                <p className="tabular mt-3 flex items-center gap-1.5 text-xs text-ink-3">
                  {r.stages.length} stages · {r.stages.flatMap((s) => s.subjects).length} subjects
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ============================================ 5 · FEATURED PROGRAMMES */}
      <Reveal as="section" className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow">The programmes</p>
              <h2 className="t-section mt-2 text-ink">{PROGRAMMES.length} interactive programmes</h2>
              <p className="t-caption mt-1.5 max-w-xl">
                Authored end to end — lessons, tiered exercises, chapter assessments and a project
                in every part. Every claimed output verified on the real engine.
              </p>
            </div>
            <button type="button" onClick={() => navigate("#/explore")} className="link-dv w-fit text-sm">
              Explore the full catalogue →
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMMES.map((p, i) => {
              const Icon = PROGRAMME_ICONS[p.icon] ?? BookOpen;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => navigate(p.hash)}
                  className={cn(
                    "group dv-card-topline relative flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover",
                    i === 0 && "sm:col-span-2 lg:col-span-1"
                  )}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-0.5"
                    style={{ background: `linear-gradient(to right, ${p.hue}, transparent 72%)` }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `color-mix(in srgb, ${p.hue} 12%, transparent)`, color: p.hue }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {p.slug === "mathematics" ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-subtle px-2.5 py-1 text-[10.5px] font-medium text-ink-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning-text dv-pulse" />
                        authoring in flight
                      </span>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-ink-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    )}
                  </div>
                  <p className="t-item mt-4 text-ink group-hover:text-primary">{p.title}</p>
                  <p className="t-caption mt-1.5 line-clamp-2 flex-1">{p.subtitle}</p>
                  <p className="tabular mt-4 flex flex-wrap gap-x-2 text-xs text-ink-3">
                    <span>{plural(p.lessons, "lesson")}</span>
                    <span>· {Number.isInteger(p.hours) ? p.hours : p.hours.toFixed(1)} h</span>
                    <span>· {plural(p.partProjects, "part-project")}</span>
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] text-ink-3">{p.engine}</p>
                </button>
              );
            })}
            {/* the catalogue tile — a real destination, completing the grid */}
            <button
              type="button"
              onClick={() => navigate("#/explore")}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-subtle/50 p-5 text-left dv-card-hover hover:border-primary/60 hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-e1">
                  <Compass className="h-5 w-5 text-primary" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-3 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <p className="t-item mt-4 text-ink group-hover:text-primary">Explore the full catalogue</p>
              <p className="t-caption mt-1.5 line-clamp-2 flex-1">
                Ten schools and every subject in the registry, with placement tests to test out of
                what you already know.
              </p>
              <p className="tabular mt-4 flex flex-wrap gap-x-2 text-xs text-ink-3">
                <span>{manifest.subjects} subjects</span>
                <span>· {manifest.projects} projects</span>
                <span>· placement ready</span>
              </p>
            </button>
          </div>
        </div>
      </Reveal>

      {/* ============================== 6 · INTERACTIVE LEARNING LABORATORIES */}
      <Reveal as="section" className="dv-container dv-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Practice, safely</p>
            <h2 className="t-section mt-2 text-ink">Interactive learning laboratories</h2>
            <p className="t-caption mt-1.5 max-w-xl">
              Real engines, compiled to WebAssembly and running locally — nothing you write here can
              touch a production system, and nothing is simulated.
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              hash: "#/playground",
              title: "Python Playground",
              desc: "A complete CPython build — write, run and experiment instantly.",
              engine: "CPython · WebAssembly",
              icon: Terminal,
              hue: "var(--dv-viz-1)",
            },
            {
              hash: "#/sql/lab",
              title: "SQL Laboratory",
              desc: "Free-form queries against six realistic PostgreSQL databases.",
              engine: "PostgreSQL · PGlite",
              icon: Database,
              hue: "var(--dv-viz-7)",
            },
            {
              hash: "#/numpy/playground",
              title: "NumPy Playground",
              desc: "The array sandbox with every course example, editable.",
              engine: "Python + NumPy · WebAssembly",
              icon: Grid3x3,
              hue: "var(--dv-viz-5)",
            },
            {
              hash: "#/math/diagnostic",
              title: "Mathematics Diagnostic",
              desc: "A placement diagnostic that finds your exact starting level.",
              engine: "Interactive · in-browser",
              icon: Sigma,
              hue: "var(--dv-viz-2)",
            },
          ].map((lab) => {
            const Icon = lab.icon;
            return (
              <button
                key={lab.hash}
                type="button"
                onClick={() => navigate(lab.hash)}
                className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${lab.hue} 12%, transparent)`, color: lab.hue }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="t-item mt-4 text-ink group-hover:text-primary">{lab.title}</p>
                <p className="t-caption mt-1.5 flex-1">{lab.desc}</p>
                <p className="mt-3 font-mono text-[11px] text-ink-3">{lab.engine}</p>
              </button>
            );
          })}
          {/* the laboratory hub — the wide tile that completes the band */}
          <button
            type="button"
            onClick={() => navigate("#/labs")}
            className="group flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover sm:col-span-2 lg:col-span-2 lg:flex-row lg:items-center"
          >
            <span className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <FlaskConical className="h-5 w-5" />
              </span>
              <span>
                <span className="t-item block text-ink group-hover:text-primary">
                  The Learning Laboratories
                </span>
                <span className="t-caption mt-1 block max-w-md">
                  Seven disciplines — Python, SQL, NumPy, pandas, statistics, visualization and ML —
                  one lab interface: instructions, editor, run controls, console and test results.
                </span>
              </span>
            </span>
            <span className="flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border px-4 text-sm font-medium text-ink transition-colors group-hover:border-primary/50 group-hover:text-primary lg:self-center">
              Enter the labs
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </Reveal>

      {/* ================================================== 7 · ADA, AI TUTOR */}
      <Reveal as="section" className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* how Ada actually teaches — a composed preview of the real tutor */}
          <div className="order-2 min-w-0 lg:order-1">
            <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e2 sm:p-6">
              <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  A
                </span>
                <p className="text-sm font-medium text-ink">Ada</p>
                <p className="font-mono text-[10.5px] uppercase tracking-wide text-ink-3">your tutor</p>
              </div>
              <div className="mt-4 space-y-3">
                <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-surface-inset px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2">
                  I don&apos;t understand when to use <span className="font-mono text-[12px]">GROUP BY</span>.
                </p>
                <div className="w-fit max-w-[92%] rounded-xl rounded-bl-sm border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2 dark:border-violet-800 dark:bg-violet-950/60 dark:text-ink-2">
                  Good question — let&apos;s build up to it. You already know{" "}
                  <span className="font-mono text-[12px]">WHERE</span> filters rows. After the filter,
                  what does the flights table look like — one row per what?
                </div>
                <p className="mt-5 flex items-center gap-2 text-[11.5px] text-ink-3">
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  Next step — review <em>Aggregations</em>, then try exercise 2.
                </p>
              </div>
              <p className="mt-4 border-t border-border-subtle pt-3 text-[11px] text-ink-3">
                How Ada teaches: grounded in your lesson, never the raw answer, always one next step.
              </p>
            </div>
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <p className="eyebrow">Personal guidance</p>
            <h2 className="t-section mt-2 text-ink">Ada, the AI personal tutor</h2>
            <p className="t-lede mt-4">
              Ada is your patient, lesson-grounded tutor. Her teaching contract is Socratic: she
              guides with questions, breaks problems into smaller steps, and never hands over a
              quiz answer or an exercise solution.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                "Answers stay on-syllabus — grounded in the lesson you are studying",
                "Replies end with exactly one concrete next step",
                "Conversations are saved to your academy account",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("#/tutor")}
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-e1 transition-colors duration-150 hover:bg-primary-hover"
              >
                <MessagesSquare className="h-4 w-4" />
                Meet Ada
              </button>
              <p className="text-xs text-ink-3">Free with every account.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ============================================ 8 · PRACTICAL PROJECTS */}
      <Reveal as="section" className="dv-container dv-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Learn by building</p>
            <h2 className="t-section mt-2 text-ink">Practical projects, from first build to capstone</h2>
            <p className="t-caption mt-1.5 max-w-xl">
              Knowledge becomes a skill the first time you build something that runs. Every part of
              every programme closes with a project; the registry defines {registryProjectCount} more.
            </p>
          </div>
          <button type="button" onClick={() => navigate("#/projects")} className="link-dv w-fit text-sm">
            The project record →
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map(({ project, subject }) => (
            <button
              key={`${subject.slug}-${project.title}`}
              type="button"
              onClick={() => navigate(`#/subject/${subject.slug}`)}
              className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize", TIER_STYLE[project.tier])}>
                  {project.tier}
                </span>
                <span className="tabular text-[11.5px] text-ink-3">
                  {project.hours} h · {subject.code}
                </span>
              </div>
              <p className="t-item mt-3.5 text-ink group-hover:text-primary">{project.title}</p>
              <p className="t-caption mt-1.5 line-clamp-3 flex-1">{project.brief}</p>
              <p className="mt-3.5 truncate border-t border-border-subtle pt-3 font-mono text-[11px] text-ink-3">
                {project.tools.slice(0, 3).join(" · ")}
              </p>
            </button>
          ))}
        </div>

        {/* the Data Analyst Project Academy — the record's flagship */}
        <button
          type="button"
          onClick={() => navigate("#/dap")}
          className="group mt-4 flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-dashed border-viz-10/50 bg-viz-10/10 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-viz-10 hover:bg-viz-10/15 hover:shadow-e2"
        >
          <span className="min-w-0">
            <span className="eyebrow text-viz-10">Flagship · full engagements</span>
            <span className="mt-1 block font-display text-lg font-semibold text-ink">
              The Data Analyst Project Academy
            </span>
            <span className="mt-1 block max-w-2xl text-[13px] leading-relaxed text-ink-2">
              36 end-to-end analytics projects across 12 industries — realistic datasets with seeded
              quality defects, guided or independent modes, and instructor-grade evaluation on six
              dimensions.
            </span>
          </span>
          <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-viz-10 px-4 text-sm font-semibold text-ink-inverse shadow-e1 transition-transform duration-200 group-hover:-translate-y-0.5">
            Open the academy
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </Reveal>

      {/* ======================================= 9 · THE LEARNING EXPERIENCE */}
      <Reveal as="section" className="dv-band border-y border-border-subtle dv-section">
        <div className="dv-container">
          <div className="max-w-2xl">
            <p className="eyebrow">Your academy</p>
            <h2 className="t-section mt-2 text-ink">A learning experience measured like a craft</h2>
            <p className="t-caption mt-1.5">
              Four honest steps, repeated until they are skills — with a progress record that
              follows you from first visit to graduation.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Study",
                desc: "Digital-textbook lessons with worked examples, interactive figures and reading progress that posts as you go.",
                hash: "#/explore",
                cta: "Open a lesson",
              },
              {
                step: "02",
                icon: FlaskConical,
                title: "Practice",
                desc: "Every idea lands in a real engine — laboratories, playgrounds and tiered exercises, graded with feedback.",
                hash: "#/labs",
                cta: "Enter the labs",
              },
              {
                step: "03",
                icon: FolderGit2,
                title: "Build",
                desc: "Projects close every part and every subject — briefs, deliverables and rubrics scored the way a hiring panel reads.",
                hash: "#/projects",
                cta: "See the projects",
              },
              {
                step: "04",
                icon: ClipboardCheck,
                title: "Prove",
                desc: "Checkpoints, timed quizzes, final exams and server-graded coding challenges — mastery you can point to.",
                hash: "#/assessments",
                cta: "Visit the center",
              },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => navigate(s.hash)}
                className="group flex flex-col rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="tabular font-mono text-[11px] text-ink-3">{s.step}</span>
                  <s.icon className="h-[18px] w-[18px] text-ink-3" />
                </div>
                <p className="t-item mt-4 text-ink group-hover:text-primary">{s.title}</p>
                <p className="t-caption mt-1.5 flex-1">{s.desc}</p>
                <p className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                  {s.cta}
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </button>
            ))}
          </div>

          {/* progress + placement — the two honest accelerators */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("#/dashboard")}
              className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <LineChart className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="t-item block text-ink group-hover:text-primary">
                  Progress that follows you
                </span>
                <span className="t-caption mt-1 block">
                  Learn as a guest and progress lives in your browser; sign in and it syncs —
                  streaks, skills and next actions on a personal dashboard.
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("#/placement")}
              className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-card-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="t-item block text-ink group-hover:text-primary">
                  Test out of what you know
                </span>
                <span className="t-caption mt-1 block">
                  A placement test for every subject in the registry — prove it once and the
                  dependency graph lets you skip ahead, honestly.
                </span>
              </span>
            </button>
          </div>
        </div>
      </Reveal>

      {/* ================================================== 10 · FINAL CTA */}
      <Reveal as="section" className="dv-container dv-section">
        <div className="dv-panel-indigo relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(32rem 20rem at 50% 40%, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(32rem 20rem at 50% 40%, black, transparent 75%)",
            }}
            aria-hidden="true"
          />
          <p className="relative eyebrow text-white/60">The first step</p>
          <h2 className="t-display relative mx-auto mt-3 max-w-xl">
            {resumeTarget ? "Your next lesson is waiting." : "Begin with the first lesson."}
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {resumeTarget
              ? "Pick up exactly where you left off — the path remembers your place and your prerequisites."
              : "Ten schools, five interactive programmes and a staged path from your first line of code to shipped data-science work."}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(primaryCta.hash)}
              className="flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-indigo-950 shadow-e2 dv-lift hover:-translate-y-0.5 hover:bg-white/90"
            >
              {resumeTarget ? <Play className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
              {primaryCta.label}
            </button>
            <button
              type="button"
              onClick={() => navigate("#/explore")}
              className="flex h-11 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10"
            >
              <Compass className="h-4 w-4" />
              Explore courses
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
