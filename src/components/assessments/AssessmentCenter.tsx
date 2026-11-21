"use client";

/**
 * AssessmentCenter — every assessment on the platform, professionally
 * organized: chapter checkpoints, timed quizzes, final examinations,
 * coding challenges (server-graded) and the SQL challenge set (run in the
 * SQL Laboratory on real PostgreSQL).
 *
 * Data comes from GET /api/assessments/catalog (live attempt/submission
 * stats for the viewer) and the engine-verified SQL challenge registry.
 * Nothing is mocked; starting an assessment opens the real runner.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Brain, CheckCircle2, Clock, Code2, Database, FileCheck2,
  GraduationCap, Loader2, Lock, Play, Star, Target, Timer, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/academy/motion";
import { SQL_CHALLENGES } from "@/lib/labs/exercise-sets";

/* --------------------------------- types --------------------------------- */

interface CatalogAssessment {
  id: string;
  title: string;
  description?: string | null;
  kind: string; // CHECKPOINT | FINAL_EXAM | PLACEMENT
  passingScore: number;
  maxAttempts: number | null;
  timeLimitMinutes?: number | null;
  questionCount: number;
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  stats: { attempts: number; best: number | null; passed: boolean };
}

interface CatalogChallenge {
  id: string;
  title: string;
  difficulty: string;
  language: string;
  points: number;
  visibleTests: number;
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  stats: { attempts: number; best: number | null; bestStatus: string | null };
}

interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  level: string;
  subject: { title: string; color: string };
  assessments: CatalogAssessment[];
  codingChallenges: CatalogChallenge[];
}

interface Catalog {
  courses: CatalogCourse[];
  authenticated: boolean;
}

interface EnrollmentRow {
  id: string;
  courseId: string;
  status: string;
}

/* -------------------------------- helpers -------------------------------- */

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, { cache: "no-store", ...init });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    return null;
  }
}

function KindBadge({ kind, timed }: { kind: string; timed: boolean }) {
  const isFinal = kind === "FINAL_EXAM";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide",
        isFinal
          ? "bg-violet-500/12 text-violet-600 dark:text-violet-300"
          : "bg-primary/10 text-primary"
      )}
    >
      {isFinal ? <GraduationCap className="h-3 w-3" /> : <FileCheck2 className="h-3 w-3" />}
      {isFinal ? "Final exam" : kind === "PLACEMENT" ? "Placement" : "Checkpoint"}
      {timed && <Timer className="ml-0.5 h-3 w-3" />}
    </span>
  );
}

/* =============================== the center =============================== */

export function AssessmentCenter({ navigate }: { navigate: (hash: string) => void }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [cat, session] = await Promise.all([
      api<Catalog>("/api/assessments/catalog"),
      api<{ authenticated: boolean }>("/api/auth/session"),
    ]);
    setCatalog(cat);
    setAuthed(!!session?.authenticated);
    if (session?.authenticated) {
      const rows = await api<EnrollmentRow[]>("/api/enrollments");
      setEnrollments(rows ?? []);
    } else {
      setEnrollments([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const enroll = useCallback(
    async (courseId: string) => {
      setEnrolling(courseId);
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const body = await res.json().catch(() => null);
      setEnrolling(null);
      if (res.ok) {
        setToast(body?.meta?.message ?? "Enrolled — assessments unlocked");
        void load();
      } else {
        setToast(body?.error?.message ?? "Could not enroll right now");
      }
    },
    [load]
  );

  if (!catalog) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="dv-skel h-20 rounded-2xl border border-border-subtle" />
        {[0, 1].map((i) => (
          <div key={i} className="dv-skel h-48 rounded-2xl border border-border-subtle" />
        ))}
      </div>
    );
  }

  const enrolledIds = new Set((enrollments ?? []).map((e) => e.courseId));

  return (
    <div className="min-w-0 space-y-7">
      {/* ------------------------------------------- header */}
      <header>
        <p className="eyebrow">Prove what you know</p>
        <h1 className="t-page mt-2 text-ink">The Assessment Center</h1>
        <p className="t-body mt-3 max-w-3xl">
          Chapter checkpoints, timed quizzes, final examinations and coding challenges — every attempt is graded
          server-side, every score below is yours. SQL challenges run on real PostgreSQL in the SQL Laboratory.
        </p>
        {authed === false && (
          <p className="mt-3 rounded-xl border border-border-subtle bg-surface-subtle/50 px-4 py-2.5 text-[13px] text-ink-2">
            Sign in (top right) to attempt assessments — attempts and best scores live on your account.
          </p>
        )}
      </header>

      {/* ---------------------------------- quiz + coding catalog by course */}
      {catalog.courses.map((course) => {
        const enrolled = enrolledIds.has(course.id);
        return (
          <Reveal as="section" key={course.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-bold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${course.subject.color} 13%, transparent)`,
                    color: course.subject.color,
                  }}
                >
                  {course.title.slice(0, 1)}
                </span>
                <div>
                  <h2 className="text-[16px] font-semibold text-ink">{course.title}</h2>
                  <p className="t-caption">{course.subject.title} · {course.level.toLowerCase()}</p>
                </div>
              </div>
              {!enrolled && authed && (
                <Button size="sm" variant="outline" disabled={enrolling === course.id} onClick={() => void enroll(course.id)}>
                  {enrolling === course.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Lock className="mr-1.5 h-3.5 w-3.5" />}
                  Enroll to attempt
                </Button>
              )}
              {!authed && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                  <Lock className="h-3.5 w-3.5" /> sign in to attempt
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {course.assessments.map((a) => {
                const attemptsLeft = a.maxAttempts === null ? null : a.maxAttempts - a.stats.attempts;
                const locked = authed && enrolled && attemptsLeft !== null && attemptsLeft <= 0;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => navigate(`#/assessment/${a.id}`)}
                    className={cn(
                      "dv-card-topline dv-lift group flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2",
                      locked && "opacity-70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <KindBadge kind={a.kind} timed={!!a.timeLimitMinutes} />
                      <span className="t-meta truncate">{a.moduleTitle}</span>
                    </div>
                    <p className="mt-2.5 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary">
                      {a.title}
                    </p>
                    {a.description && <p className="t-caption mt-1 line-clamp-2">{a.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-subtle pt-2.5 text-[12px] text-ink-3">
                      <span className="tabular inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" />{a.passingScore}% to pass</span>
                      <span className="tabular inline-flex items-center gap-1"><FileCheck2 className="h-3.5 w-3.5" />{a.questionCount} questions</span>
                      {a.timeLimitMinutes && <span className="tabular inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{a.timeLimitMinutes} min</span>}
                      {a.maxAttempts && <span className="tabular inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.maxAttempts} attempts</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {a.stats.attempts > 0 ? (
                        <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-semibold", a.stats.passed ? "text-success-text" : "text-warning-text")}>
                          {a.stats.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                          best {Math.round(a.stats.best ?? 0)}%{a.stats.passed ? " · passed" : ""}
                        </span>
                      ) : (
                        <span className="t-meta">not attempted yet</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        {locked ? "Limit reached" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}

              {course.codingChallenges.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`#/challenge/${c.id}`)}
                  className="dv-card-topline dv-lift group flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/12 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                      <Code2 className="h-3 w-3" /> Coding challenge
                    </span>
                    <span className="t-meta truncate">{c.moduleTitle}</span>
                  </div>
                  <p className="mt-2.5 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary">
                    {c.title}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-subtle pt-2.5 text-[12px] text-ink-3">
                    <span className="tabular capitalize">{c.difficulty.toLowerCase()}</span>
                    <span className="tabular inline-flex items-center gap-1"><Brain className="h-3.5 w-3.5" />{c.visibleTests} visible tests</span>
                    <span className="tabular inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />{c.points} pts</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {c.stats.attempts > 0 ? (
                      <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-semibold", c.stats.bestStatus === "PASSED" ? "text-success-text" : "text-warning-text")}>
                        {c.stats.bestStatus === "PASSED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                        {c.stats.bestStatus === "PASSED" ? "all tests green" : `best ${Math.round(c.stats.best ?? 0)}%`}
                      </span>
                    ) : (
                      <span className="t-meta">not attempted yet</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Reveal>
        );
      })}

      {/* ------------------------------------------ SQL challenge set */}
      <Reveal as="section" className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--dv-viz-7) 13%, transparent)" }}>
            <Database className="h-4.5 w-4.5 text-[color:var(--dv-viz-7)]" />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold text-ink">SQL challenges · ShopSphere</h2>
            <p className="t-caption">Six graded investigations on real PostgreSQL — executed and compared in the SQL Laboratory</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SQL_CHALLENGES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`#/lab/sql?ex=${i}`)}
              className="dv-card-topline dv-lift group flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 text-left shadow-e1 hover:-translate-y-0.5 hover:shadow-e2"
            >
              <span className="inline-flex w-fit items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--dv-viz-7)_12%,transparent)] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-[color:var(--dv-viz-7)]">
                <Database className="h-3 w-3" /> SQL challenge
              </span>
              <p className="mt-2.5 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-primary">{c.title}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5">
                <span className="t-meta capitalize">{c.difficulty}</span>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  Solve in the lab <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </Reveal>

      {toast && (
        <div role="status" className="dv-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-e3">
          {toast}
        </div>
      )}
    </div>
  );
}
