"use client";

/**
 * LessonStudy — the continue-learning reader: renders a lesson's real
 * sections (markdown + runnable-looking code examples), links its quizzes
 * and coding challenges, and records genuine progress via
 * POST /api/progress (time-on-page measured client-side, completion
 * server-side — the same write path that drives every dashboard number).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Code2, FileCheck2, GraduationCap, Loader2,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/academy/auth-dialogs";
import { Reveal } from "@/components/academy/motion";

/* --------------------------------- types --------------------------------- */

interface Section {
  id: string;
  kind: string;
  title: string | null;
  content: string;
  codeExamples: Array<{ id: string; filename: string | null; language: string; code: string; explanation: string | null }>;
}

interface LessonPayload {
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    estimatedMinutes: number;
    chapterTitle: string;
    moduleTitle: string;
    course: { id: string; title: string; slug: string };
    sections: Section[];
    quizzes: Array<{ id: string; title: string; kind: string; passingScore: number; timeLimitMinutes: number | null; questionCount: number }>;
    exercises: Array<{ id: string; title: string; difficulty: string; language: string }>;
  };
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  position: { index: number; total: number };
  progress: { status: string; quizBestScore: number | null; exerciseBestScore: number | null; timeSpentMinutes: number } | null;
  authenticated: boolean;
}

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(path, { cache: "no-store", ...init });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, data: (body?.data ?? body) ?? null, error: body?.error?.message };
  } catch {
    return { ok: false, data: null, error: "network" };
  }
}

/* ================================= view ================================= */

export function LessonStudy({ lessonId, navigate }: { lessonId: string; navigate: (hash: string) => void }) {
  const [payload, setPayload] = useState<LessonPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const openedAtRef = useRef<number>(Date.now());

  const load = useCallback(async () => {
    const res = await api<LessonPayload>(`/api/lessons/${lessonId}/content`);
    if (!res.ok || !res.data) {
      setError(res.error ?? "Lesson not found");
      return;
    }
    setPayload(res.data);
    setCompleted(res.data.progress?.status === "COMPLETED");
    openedAtRef.current = Date.now();
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const markComplete = useCallback(async () => {
    if (!payload) return;
    if (!payload.authenticated) {
      setAuthOpen(true);
      return;
    }
    setCompleting(true);
    const minutes = Math.max(1, Math.round((Date.now() - openedAtRef.current) / 60000));
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, status: "COMPLETED", timeSpentMinutes: minutes }),
    });
    const body = await res.json().catch(() => null);
    setCompleting(false);
    if (res.ok) {
      setCompleted(true);
      const unlocked: Array<{ title: string }> = (body?.data?.achievementsUnlocked ?? []).map((u: { achievement: { title: string } }) => ({ title: u.achievement.title }));
      setToast(
        unlocked.length > 0
          ? `Lesson complete — achievement unlocked: ${unlocked[0].title}`
          : (body?.meta?.message as string) ?? "Lesson complete"
      );
    } else {
      setToast(body?.error?.message ?? "Could not record progress");
    }
  }, [lessonId, payload]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center">
        <p className="text-[15px] font-semibold text-ink">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("#/dashboard")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to the dashboard
        </Button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <div className="dv-skel h-16 rounded-2xl border border-border-subtle" />
        <div className="dv-skel h-40 rounded-2xl border border-border-subtle" />
        <div className="dv-skel h-64 rounded-2xl border border-border-subtle" />
      </div>
    );
  }

  const { lesson, prev, next, position } = payload;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {/* ---------------------------------- header */}
      <header>
        <button type="button" onClick={() => navigate("#/dashboard")} className="flex items-center gap-1 text-[12px] font-medium text-ink-3 hover:text-ink">
          <ChevronLeft className="h-3.5 w-3.5" /> Dashboard
        </button>
        <p className="eyebrow mt-3">
          {lesson.course.title} · {lesson.moduleTitle} · lesson {position.index} of {position.total}
        </p>
        <h1 className="t-page mt-2 text-ink">{lesson.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.estimatedMinutes} min</span>
          {payload.progress?.quizBestScore != null && (
            <span className="tabular inline-flex items-center gap-1"><FileCheck2 className="h-3.5 w-3.5" />best quiz {Math.round(payload.progress.quizBestScore)}%</span>
          )}
          {completed && (
            <span className="inline-flex items-center gap-1 font-semibold text-success-text">
              <CheckCircle2 className="h-3.5 w-3.5" /> completed
            </span>
          )}
        </div>
        {lesson.summary && <p className="t-lede mt-3">{lesson.summary}</p>}
      </header>

      {/* ---------------------------------- sections */}
      {lesson.sections.map((s) => (
        <Reveal as="section" key={s.id} className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1 sm:p-6">
          {s.title && <h2 className="dv-lesson-h3 text-ink">{s.title}</h2>}
          <div className={cn(s.title && "mt-3")}>
            <div className="ada-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  /* GFM tables scroll inside their own region instead of
                     widening the card on phones (WCAG 1.4.10 reflow). */
                  table: ({ children }) => (
                    <div className="table-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {s.content}
              </ReactMarkdown>
            </div>
          </div>
          {s.codeExamples.map((c) => (
            <div key={c.id} className="mt-4 overflow-hidden rounded-xl border border-editor-border">
              <div className="flex items-center justify-between border-b border-editor-border bg-editor-chrome px-3.5 py-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wide text-editor-ink/70">
                  {c.filename ?? c.language}
                </span>
              </div>
              <pre
                  className="dv-scroll-region overflow-x-auto bg-editor-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-editor-ink"
                  tabIndex={0}
                  role="region"
                  aria-label={`Code example ${c.filename ?? c.language} — scrollable`}
                >
                  {c.code}
                </pre>
              {c.explanation && <p className="border-t border-editor-border bg-editor-chrome/60 px-3.5 py-2 text-[12.5px] leading-relaxed text-editor-ink/80">{c.explanation}</p>}
            </div>
          ))}
        </Reveal>
      ))}

      {/* ------------------------------- assessments attached */}
      {(lesson.quizzes.length > 0 || lesson.exercises.length > 0) && (
        <Reveal as="section" className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-e1">
          <p className="dv-kicker mb-3">Prove it</p>
          <div className="space-y-2">
            {lesson.quizzes.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => navigate(`#/assessment/${q.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-subtle/50 px-4 py-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  {q.kind === "FINAL_EXAM" ? <GraduationCap className="h-4 w-4 text-primary" /> : <FileCheck2 className="h-4 w-4 text-primary" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{q.title}</p>
                  <p className="t-caption">
                    {q.questionCount} questions · {q.passingScore}% to pass
                    {q.timeLimitMinutes ? ` · ${q.timeLimitMinutes} min limit` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
              </button>
            ))}
            {lesson.exercises.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => navigate(`#/challenge/${e.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-subtle/50 px-4 py-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/12">
                  <Code2 className="h-4 w-4 text-indigo-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{e.title}</p>
                  <p className="t-caption capitalize">{e.difficulty.toLowerCase()} coding challenge · {e.language}</p>
                </div>
                <Brain className="h-4 w-4 shrink-0 text-ink-3" />
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* ---------------------------------- complete + nav */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-border-subtle bg-surface/95 p-3 shadow-e3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          {completed ? (
            <p className="flex items-center gap-2 text-[13.5px] font-semibold text-success-text">
              <CheckCircle2 className="h-5 w-5" /> Completed — progress recorded
            </p>
          ) : (
            <Button onClick={() => void markComplete()} disabled={completing}>
              {completing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <BookOpen className="mr-1.5 h-4 w-4" />}
              Mark lesson complete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {prev && (
              <Button variant="outline" size="sm" onClick={() => navigate(`#/study/${prev.id}`)}>
                <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
              </Button>
            )}
            {next && (
              <Button size="sm" onClick={() => navigate(`#/study/${next.id}`)}>
                Next lesson <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div role="status" className="dv-toast fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink shadow-e3">
          {toast}
        </div>
      )}
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => window.location.reload()} reason="Progress, streaks and certificates track to your account." />
    </article>
  );
}
