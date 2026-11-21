"use client";

/**
 * StudentDashboard — the personalized learning home.
 *
 * Every number on this page is fetched live from the platform's real
 * endpoints for the signed-in learner:
 *   GET /api/me                       — profile + overview (XP, minutes, scores)
 *   GET /api/analytics/dashboard      — weekly series, today, streak, skills,
 *                                       revision, continue-learning, activity
 *   GET /api/achievements?unlocked=mine — the achievement shelf
 *   GET /api/learning-paths           — the roadmap the enrollments map onto
 *   POST /api/enrollments             — enroll right from the course shelf
 * Nothing is mocked; an account with no history renders honest empty states.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, Award, BookOpen, Brain, CalendarCheck, CheckCircle2,
  ChevronRight, Clock, Flame, GraduationCap, LayoutDashboard, Loader2, Medal, Play,
  RefreshCw, Rocket, Sigma, Sparkles, Star, Target, TrendingUp, Trophy, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/academy/motion";
import { AuthDialog } from "@/components/academy/auth-dialogs";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* ------------------------------- payload types ------------------------------ */

interface Overview {
  xp: number;
  lessonsCompleted: number;
  hoursLearned: number;
  learningMinutes: number;
  quizzesTaken: number;
  quizAvgScore: number | null;
  exercisesPassed: number;
  exercisesTotal: number;
  achievementsUnlocked: number;
  certificates: number;
  longestStreak: number;
  enrollments: Array<{
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    level: string;
    subject: { title: string; color: string } | null;
    status: string;
    percentage: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    enrolledAt: string;
  }>;
}

interface DashboardData {
  weeklyActivity: Array<{ date: string; label: string; lessons: number; exercises: number; quizzes: number }>;
  today: { lessons: number; exercises: number; quizzes: number; total: number };
  dayStreak: number;
  skills: Array<{ subject: string; color: string; courseTitle: string; lessonPct: number; quizAvg: number | null; exerciseRate: number | null; score: number }>;
  revision: Array<{ lessonId: string; lessonTitle: string; courseId: string; courseTitle: string; reason: string; score: number | null }>;
  continueLearning: Array<{ courseId: string; courseTitle: string; subject: { title: string; color: string } | null; percentage: number; lessonId: string; lessonTitle: string; isResume: boolean; lastTouchedAt: string | null }>;
  activity: Array<{ id: string; kind: string; title: string; detail: string; at: string }>;
}

interface AchievementRow {
  id: string;
  code: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  unlocked?: boolean;
}

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience?: string | null;
  courses: Array<{
    orderIndex: number;
    stageIndex: number;
    stageTitle?: string | null;
    course: { id: string; slug: string; title: string; subject: { title: string; color: string } };
  }>;
}

interface Me {
  user: { id: string; name: string; email: string; headline?: string | null; role: { key: string } };
  overview: Overview | null;
}

/* --------------------------------- helpers -------------------------------- */

const DAILY_GOAL_KEY = "dv-daily-goal-v1";

function readDailyGoal(): number {
  if (typeof window === "undefined") return 2;
  const raw = window.localStorage.getItem(DAILY_GOAL_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 12 ? Math.round(n) : 2;
}

function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Defensive week padding — the API already returns all 7 days, but the chart
 *  must never render as a lone bar: merge by label and fill any missing day
 *  with zeros so every weekday keeps its slot on the axis. */
function padWeek(rows: Array<{ date: string; label: string; lessons: number; exercises: number; quizzes: number }>) {
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byLabel = new Map(rows.map((r) => [r.label, r]));
  return order.map((label, i) => {
    const found = byLabel.get(label);
    if (found) return found;
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), label, lessons: 0, exercises: 0, quizzes: 0 };
  });
}

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

/* ============================== sub-panels ================================ */

function StatTile({ icon: Icon, label, value, sub, hue = "var(--dv-primary)" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; hue?: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-e1">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `color-mix(in srgb, ${hue} 13%, transparent)` }}>
          <Icon className="h-4 w-4" style={{ color: hue }} />
        </span>
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{label}</p>
      </div>
      <p className="tabular mt-2.5 text-[26px] font-semibold leading-none tracking-tight text-ink">{value}</p>
      {sub && <p className="t-caption mt-1.5">{sub}</p>}
    </div>
  );
}

function SectionHead({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
        <Icon className="h-4 w-4 text-ink-3" />
        {title}
      </h2>
      {action}
    </div>
  );
}

function Ring({ value, size = 84, stroke = 8, hue = "var(--dv-primary)" }: { value: number; size?: number; stroke?: number; hue?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(pct)} percent`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--dv-ink) 8%, transparent)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={hue} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="dv-ring-arc"
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="tabular" fontSize={size / 4.4} fontWeight={700} fill="var(--dv-ink)">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ============================== the dashboard ============================== */

export function StudentDashboard({ navigate }: { navigate: (hash: string) => void }) {
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "signed-in">("checking");
  const [me, setMe] = useState<Me | null>(null);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [achievements, setAchievements] = useState<AchievementRow[] | null>(null);
  const [paths, setPaths] = useState<LearningPath[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(2);
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const session = await api<{ authenticated: boolean }>("/api/auth/session");
    if (!session?.authenticated) {
      setAuthState("signed-out");
      setLoading(false);
      return;
    }
    setAuthState("signed-in");
    const [meRes, dashRes, achRes, pathRes] = await Promise.all([
      api<Me>("/api/me"),
      api<DashboardData>("/api/analytics/dashboard"),
      // api() already unwraps the envelope; paginated lists arrive as bare arrays
      api<AchievementRow[] | { items?: AchievementRow[] }>("/api/achievements?unlocked=mine&pageSize=50"),
      api<LearningPath[] | { items?: LearningPath[] }>("/api/learning-paths?pageSize=20"),
    ]);
    setMe(meRes);
    setDash(dashRes);
    setAchievements(Array.isArray(achRes) ? achRes : (achRes as { items?: AchievementRow[] })?.items ?? null);
    setPaths(Array.isArray(pathRes) ? pathRes : (pathRes as { items?: LearningPath[] })?.items ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // localStorage + fetch are external systems — sync them off the
    // synchronous effect path
    queueMicrotask(() => setDailyGoal(readDailyGoal()));
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const overview = me?.overview ?? null;

  const enrolledCourseIds = useMemo(
    () => new Set((overview?.enrollments ?? []).map((e) => e.courseId)),
    [overview]
  );

  const roadmap = useMemo(() => {
    if (!paths || !overview) return null;
    // pick the path that shares the most courses with the learner's enrollments
    let best: { path: LearningPath; shared: number } | null = null;
    for (const p of paths) {
      const shared = p.courses.filter((c) => enrolledCourseIds.has(c.course.id)).length;
      if (!best || shared > best.shared) best = { path: p, shared };
    }
    if (!best || best.shared === 0) return paths.length > 0 ? { path: paths[0], shared: 0 } : null;
    return best;
  }, [paths, overview, enrolledCourseIds]);

  const enroll = useCallback(async (courseId: string) => {
    setEnrollingCourse(courseId);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const body = await res.json().catch(() => null);
    setEnrollingCourse(null);
    if (res.ok) {
      setToast(body?.meta?.message ?? "Enrolled — your first lesson is waiting");
      void load();
    } else {
      setToast(body?.error?.message ?? "Could not enroll right now");
    }
  }, [load]);

  /* ------------------------------- states -------------------------------- */

  if (authState === "checking" || (authState === "signed-in" && loading && !overview)) {
    return (
      <div className="mx-auto max-w-6xl space-y-6" aria-busy="true">
        <div className="dv-skel h-36 rounded-2xl border border-border-subtle" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dv-skel h-28 rounded-2xl border border-border-subtle" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="dv-skel h-64 rounded-2xl border border-border-subtle lg:col-span-2" />
          <div className="dv-skel h-64 rounded-2xl border border-border-subtle" />
        </div>
      </div>
    );
  }

  if (authState === "signed-out") {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-8 text-center shadow-e2 sm:p-12">
          <div
            className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--dv-primary) 22%, transparent), transparent)" }}
            aria-hidden="true"
          />
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "color-mix(in srgb, var(--dv-primary) 13%, transparent)" }}>
            <LayoutDashboard className="h-7 w-7 text-primary" />
          </span>
          <h1 className="t-display mt-5 text-ink">Your learning dashboard</h1>
          <p className="t-lede mx-auto mt-3 max-w-xl">
            One place for your progress, goals, streaks and skills — computed live from every lesson you finish,
            exercise you pass and quiz you take. It belongs to an account, so sign in or create one (it takes
            twenty seconds).
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => setAuthOpen(true)} className="h-11 px-6">
              <Sparkles className="mr-2 h-4 w-4" />
              Sign in / create account
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" onClick={() => navigate("#/explore")}>
              Browse the catalog first <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <p className="t-caption mt-5">
            Guest progress from the interactive courses stays in this browser — nothing is lost.
          </p>
        </section>
        <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => window.location.reload()} reason="The dashboard is personalized — it needs your account." />
      </div>
    );
  }

  const firstName = (me?.user.name ?? "learner").split(" ")[0];
  const goalPct = Math.min(100, (dash?.today.total ?? 0) / dailyGoal * 100);
  const unlockedAch = (achievements ?? []).filter((a) => a.unlocked);
  const nextAch = (achievements ?? []).filter((a) => !a.unlocked).slice(0, 3);
  const continueItem = dash?.continueLearning?.[0] ?? null;
  const otherCourses = (dash?.continueLearning ?? []).slice(1);
  const publishedCourses = roadmap?.path.courses.map((c) => c.course) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ============================ 1 · welcome ============================ */}
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-6 shadow-e2 sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-56 opacity-50 blur-2xl"
          style={{ background: "radial-gradient(60% 80% at 30% 0%, color-mix(in srgb, var(--dv-primary) 20%, transparent), transparent)" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-primary">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="t-display mt-2 text-ink">
              {greeting()}, <span className="dv-gradient-text">{firstName}</span>
            </h1>
            <p className="t-lede mt-2 max-w-xl">
              {me?.user.headline || "Every run, quiz and lesson — tracked honestly. Here is where you stand."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-text/30 bg-warning-text/10 px-3 py-1 text-[12.5px] font-semibold text-warning-text">
                <Flame className="h-3.5 w-3.5" />
                {dash?.dayStreak ?? 0}-day streak
              </span>
              <span className="tabular inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-subtle px-3 py-1 text-[12.5px] font-semibold text-ink-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {overview?.xp ?? 0} XP
              </span>
              {(overview?.certificates ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success-text/30 bg-success-text/10 px-3 py-1 text-[12.5px] font-semibold text-success-text">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {overview?.certificates} certificate{overview?.certificates === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>

          {/* ========================= 2 · continue learning ==================== */}
          {continueItem ? (
            <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-subtle/60 p-5">
              <p className="dv-kicker mb-3 flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5" /> Continue learning
              </p>
              <p className="text-[15px] font-semibold text-ink">{continueItem.lessonTitle}</p>
              <p className="t-caption mt-0.5">
                {continueItem.courseTitle} · {continueItem.isResume ? "picking up where you left off" : "up next"}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={continueItem.percentage} className="h-1.5 flex-1" />
                <span className="tabular text-[12px] font-semibold text-ink-2">{Math.round(continueItem.percentage)}%</span>
              </div>
              <Button className="mt-4 w-full" onClick={() => navigate(`#/study/${continueItem.lessonId}`)}>
                {continueItem.isResume ? "Resume lesson" : "Start lesson"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-2xl border border-dashed border-border-strong bg-surface-subtle/40 p-5">
              <p className="dv-kicker mb-2">Continue learning</p>
              <p className="t-body">You are not enrolled in a course yet — pick one below and this panel comes alive.</p>
            </div>
          )}
        </div>
      </section>

      {/* ====================== 3 · study activity tiles ====================== */}
      <Reveal as="section" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={BookOpen} label="Lessons completed" value={String(overview?.lessonsCompleted ?? 0)} sub={`${overview?.hoursLearned ?? 0}h of study recorded`} />
        <StatTile icon={Trophy} label="Quiz average" value={overview?.quizAvgScore != null ? `${overview.quizAvgScore}%` : "—"} sub={`${overview?.quizzesTaken ?? 0} graded attempts`} hue="var(--dv-viz-2)" />
        <StatTile icon={Brain} label="Exercises passed" value={String(overview?.exercisesPassed ?? 0)} sub={`${overview?.exercisesTotal ?? 0} submissions in total`} hue="var(--dv-viz-5)" />
        <StatTile icon={Medal} label="Achievements" value={String(overview?.achievementsUnlocked ?? 0)} sub={`${unlockedAch.reduce((s, a) => s + a.points, 0)} XP from achievements`} hue="var(--dv-violet-500)" />
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ==================== 4 · weekly learning progress =================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 lg:col-span-2">
          <SectionHead
            icon={TrendingUp}
            title="This week's learning"
            action={<span className="t-meta tabular">{(dash?.weeklyActivity ?? []).reduce((s, d) => s + d.lessons + d.exercises + d.quizzes, 0)} activities</span>}
          />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              {/* Pad to the full week so the chart never renders as a lone bar —
                  days with zero activity still show a baseline tick. */}
              <BarChart data={padWeek(dash?.weeklyActivity ?? [])} margin={{ top: 8, right: 4, bottom: 0, left: -22 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in srgb, var(--dv-ink) 8%, transparent)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--dv-ink-3)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--dv-ink-3)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "color-mix(in srgb, var(--dv-ink) 5%, transparent)" }}
                  contentStyle={{
                    borderRadius: 12, border: "1px solid var(--dv-border-subtle)", background: "var(--dv-surface)",
                    fontSize: 12.5, boxShadow: "var(--dv-e2)",
                  }}
                  formatter={(value: number | string, name: string) => {
                    if (name === "baseline") return null as unknown as [string, string];
                    return [value, name === "lessons" ? "Lessons" : name === "exercises" ? "Exercises" : "Quizzes"];
                  }}
                />
                {/* Baseline slot inside the same stack — empty days keep a
                    faint rounded tick; active days render it at 0 height. */}
                <Bar
                  dataKey={(d) => { const r = d as { lessons: number; exercises: number; quizzes: number }; return r.lessons + r.exercises + r.quizzes > 0 ? 0 : 0.9; }}
                  stackId="a"
                  fill="color-mix(in srgb, var(--dv-ink) 6%, transparent)"
                  isAnimationActive={false}
                  radius={[4, 4, 0, 0]}
                  name="baseline"
                />
                <Bar dataKey="lessons" stackId="a" fill="var(--dv-primary)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="exercises" stackId="a" fill="var(--dv-viz-5)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="quizzes" stackId="a" fill="var(--dv-viz-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {[
              ["Lessons", "var(--dv-primary)"],
              ["Exercises", "var(--dv-viz-5)"],
              ["Quizzes", "var(--dv-viz-2)"],
            ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* ============================ 5 · daily goal =========================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <SectionHead icon={Target} title="Today's goal" />
          <div className="flex items-center gap-5">
            <Ring value={goalPct} hue={goalPct >= 100 ? "#10b981" : "var(--dv-primary)"} />
            <div className="min-w-0">
              <p className="tabular text-[15px] font-semibold text-ink">
                {goalPct >= 100 ? (
                  <>
                    Goal reached
                    <span className="ml-1.5 font-normal text-ink-3">
                      · {dash?.today.total ?? 0} activities today
                    </span>
                  </>
                ) : (
                  <>
                    {dash?.today.total ?? 0} <span className="font-normal text-ink-3">of {dailyGoal}</span>
                  </>
                )}
              </p>
              <p className="t-caption mt-0.5">learning activities today</p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-3">
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>
                  {dash?.today.lessons ?? 0} lessons · {dash?.today.exercises ?? 0} exercises · {dash?.today.quizzes ?? 0} quizzes
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border-subtle pt-3">
            <span className="t-meta">Daily target</span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline" size="sm" className="h-7 w-7 p-0"
                onClick={() => {
                  const next = Math.max(1, dailyGoal - 1);
                  setDailyGoal(next);
                  localStorage.setItem(DAILY_GOAL_KEY, String(next));
                }}
                aria-label="Decrease daily goal"
              >
                −
              </Button>
              <span className="tabular w-8 text-center text-[13px] font-semibold text-ink">{dailyGoal}</span>
              <Button
                variant="outline" size="sm" className="h-7 w-7 p-0"
                onClick={() => {
                  const next = Math.min(12, dailyGoal + 1);
                  setDailyGoal(next);
                  localStorage.setItem(DAILY_GOAL_KEY, String(next));
                }}
                aria-label="Increase daily goal"
              >
                +
              </Button>
            </div>
          </div>
          {goalPct >= 100 && (
            <p className="mt-3 rounded-lg bg-success-text/10 px-3 py-2 text-[12.5px] font-medium text-success-text">
              <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
              Goal reached today — every extra activity is a bonus.
            </p>
          )}
        </section>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ========================= 6 · current courses ======================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 lg:col-span-2">
          <SectionHead
            icon={BookOpen}
            title="Current courses"
            action={
              <button type="button" onClick={() => navigate("#/assessments")} className="flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline">
                Assessments <ChevronRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          {(overview?.enrollments ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle/40 p-6 text-center">
              <p className="t-body">No enrollments yet. The Data Analyst path starts here:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(publishedCourses ?? []).slice(0, 4).map((c) => (
                  <Button key={c.id} size="sm" variant="outline" disabled={enrollingCourse === c.id} onClick={() => void enroll(c.id)}>
                    {enrollingCourse === c.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Rocket className="mr-1.5 h-3.5 w-3.5" />}
                    {c.title}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overview!.enrollments.map((e) => {
                const resume = (dash?.continueLearning ?? []).find((c) => c.courseId === e.courseId);
                return (
                  <div key={e.courseId} className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-subtle/40 px-4 py-3 transition-colors hover:border-border-strong">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${e.subject?.color ?? "var(--dv-primary)"} 14%, transparent)`,
                        color: e.subject?.color ?? "var(--dv-primary)",
                      }}
                    >
                      {e.courseTitle.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-[14px] font-semibold text-ink">{e.courseTitle}</p>
                        <span className="tabular shrink-0 text-[12px] font-semibold text-ink-2">
                          {e.lessonsCompleted}/{e.lessonsTotal}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <Progress value={e.percentage} className="h-1.5" />
                        <span className="tabular w-10 text-right text-[11.5px] text-ink-3">{Math.round(e.percentage)}%</span>
                      </div>
                    </div>
                    <Button
                      size="sm" variant="outline" className="h-8 shrink-0"
                      onClick={() => resume && navigate(`#/study/${resume.lessonId}`)}
                    >
                      {e.percentage >= 100 ? "Review" : "Open"}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              {otherCourses.length > 0 && (
                <p className="t-meta pt-1">+ {otherCourses.length} more in progress · {overview!.enrollments.filter((e) => e.percentage >= 100).length} completed</p>
              )}
            </div>
          )}
        </section>

        {/* ========================= 7 · skill development ======================= */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <SectionHead icon={Sigma} title="Skill development" />
          {(dash?.skills ?? []).length === 0 ? (
            <p className="t-body">Skills crystallize from your quiz scores, exercise pass rates and course coverage — take a checkpoint and watch them appear.</p>
          ) : (
            <div className="space-y-4">
              {dash!.skills.slice(0, 5).map((s) => (
                <div key={s.courseTitle}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-ink">{s.subject}</p>
                    <span className="tabular text-[12px] font-semibold text-ink-2">{s.score}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-inset">
                    <div
                      className="dv-meter h-full rounded-full"
                      style={{ width: `${s.score}%`, background: s.color }}
                      role="progressbar"
                      aria-valuenow={s.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${s.subject} skill`}
                    />
                  </div>
                  <p className="t-meta mt-1">
                    coverage {s.lessonPct}%{s.quizAvg != null ? ` · quizzes ${Math.round(s.quizAvg)}%` : ""}{s.exerciseRate != null ? ` · exercises ${s.exerciseRate}%` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* =========================== 8 · learning roadmap ===================== */}
        {roadmap && (
          <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 lg:col-span-2">
            <SectionHead
              icon={Star}
              title="Learning roadmap"
              action={<span className="t-meta">{roadmap.path.title}</span>}
            />
            <div className="space-y-2">
              {roadmap.path.courses.map((slot, i) => {
                const enrolled = enrolledCourseIds.has(slot.course.id);
                const pct = overview?.enrollments.find((e) => e.courseId === slot.course.id)?.percentage ?? 0;
                return (
                  <div key={slot.course.id} className="flex items-center gap-3.5 rounded-xl border border-border-subtle bg-surface-subtle/40 px-4 py-3">
                    <span
                      className={cn(
                        "tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                        pct >= 100
                          ? "bg-success-solid text-white"
                          : enrolled
                            ? "bg-primary text-primary-foreground"
                            : "border border-border-strong bg-surface text-ink-3"
                      )}
                    >
                      {pct >= 100 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-ink">{slot.course.title}</p>
                      <p className="t-meta truncate">{slot.course.subject.title}{enrolled ? ` · ${Math.round(pct)}% complete` : " · not enrolled yet"}</p>
                    </div>
                    {pct >= 100 ? (
                      <Trophy className="h-4 w-4 shrink-0 text-success-text" aria-label="Completed" />
                    ) : enrolled ? (
                      <span className="tabular shrink-0 text-[12px] font-semibold text-ink-2">{Math.round(pct)}%</span>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 shrink-0 text-[12px]" disabled={enrollingCourse === slot.course.id} onClick={() => void enroll(slot.course.id)}>
                        {enrollingCourse === slot.course.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enroll"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================= 9 · recommended revision ====================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <SectionHead icon={Activity} title="Recommended revision" />
          {(dash?.revision ?? []).length === 0 ? (
            <p className="t-body">
              Nothing flagged for revision — weak quiz scores and failed exercises land here automatically.
            </p>
          ) : (
            <div className="space-y-2">
              {dash!.revision.map((r) => (
                <button
                  key={r.lessonId}
                  type="button"
                  onClick={() => navigate(`#/study/${r.lessonId}`)}
                  className="dv-card-hover w-full rounded-xl border border-warning-text/25 bg-warning-text/5 px-3.5 py-2.5 text-left hover:border-warning-text/50"
                >
                  <p className="truncate text-[13px] font-semibold text-ink">{r.lessonTitle}</p>
                  <p className="t-caption mt-0.5">{r.reason}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ============================ 10 · achievements ======================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 lg:col-span-1">
          <SectionHead icon={Award} title="Achievements" action={<span className="tabular t-meta">{unlockedAch.length}/{achievements?.length ?? 0}</span>} />
          <div className="flex flex-wrap gap-2">
            {(unlockedAch.length > 0 ? unlockedAch.slice(-8) : []).map((a) => (
              <span
                key={a.id}
                title={`${a.title} — ${a.description} (+${a.points} XP)`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-warning-text/30 bg-warning-text/10"
              >
                <Star className="h-4.5 w-4.5 text-warning-text" />
              </span>
            ))}
            {unlockedAch.length === 0 && (
              <p className="t-body">Your first achievement (“First Steps”) unlocks with your first completed lesson.</p>
            )}
          </div>
          {nextAch.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-border-subtle pt-3">
              <p className="t-meta">Next up</p>
              {nextAch.map((a) => (
                <p key={a.id} className="flex items-center gap-2 text-[12.5px] text-ink-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-border-subtle bg-surface-subtle">
                    <Star className="h-3 w-3 text-ink-3" />
                  </span>
                  <span className="truncate">{a.title}</span>
                  <span className="t-meta ml-auto shrink-0">+{a.points}</span>
                </p>
              ))}
            </div>
          )}
        </section>

        {/* =========================== 11 · recent activity ====================== */}
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 lg:col-span-2">
          <SectionHead
            icon={Clock}
            title="Recent activity"
            action={
              <button type="button" onClick={() => void load()} className="flex items-center gap-1 text-[12px] font-medium text-ink-3 transition-colors hover:text-ink">
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                Refresh
              </button>
            }
          />
          {(dash?.activity ?? []).length === 0 ? (
            <p className="t-body">Nothing yet — complete a lesson, pass an exercise or take a quiz and it appears here within seconds.</p>
          ) : (
            <ol className="relative space-y-0">
              {dash!.activity.slice(0, 10).map((a, i) => (
                <li key={a.id} className="relative flex gap-3.5 pb-4">
                  {i < 9 && <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border-subtle" aria-hidden="true" />}
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      a.kind === "lesson" && "bg-success-text/12 text-success-text",
                      a.kind === "exercise" && "bg-indigo-400/12 text-indigo-600 dark:text-indigo-300",
                      a.kind === "quiz" && "bg-violet-400/12 text-violet-600 dark:text-violet-300",
                      a.kind === "achievement" && "bg-warning-text/12 text-warning-text"
                    )}
                  >
                    {a.kind === "lesson" && <BookOpen className="h-4 w-4" />}
                    {a.kind === "exercise" && <Brain className="h-4 w-4" />}
                    {a.kind === "quiz" && <Trophy className="h-4 w-4" />}
                    {a.kind === "achievement" && <Star className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13.5px] font-medium text-ink">{a.title}</p>
                    <p className="t-caption truncate">{a.detail}</p>
                  </div>
                  <span className="t-meta ml-auto shrink-0 pt-1">{relTime(a.at)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </Reveal>

      {/* toast */}
      {toast && (
        <div role="status" className="dv-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-e3">
          {toast}
        </div>
      )}
    </div>
  );
}
