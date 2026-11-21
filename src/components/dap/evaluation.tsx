"use client";

/**
 * EvaluationView — submission and instructor review.
 *
 * Learners attach evidence (a public GitHub link fetched server-side,
 * and/or uploaded files read client-side, and/or written notes), tick
 * deliverables, self-assess on the six-dimension rubric, and request
 * a review. The deterministic feedback engine (src/lib/dap/feedback.ts)
 * analyses the actual code and generates the instructor-grade report,
 * which is persisted locally alongside submission metadata.
 */
import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, CheckCircle2, FileCode2, Github, Loader2, Paperclip, Send,
  Sparkles, Trash2, Upload, X,
} from "lucide-react";
import type { DapProject, RubricDimension } from "@/lib/dap/types";
import { RUBRIC_DIMENSIONS, RUBRIC_META } from "@/lib/dap/types";
import { analyzeFiles, buildReview, type SubmissionFile } from "@/lib/dap/feedback";
import { countStepsDone, useDapProgress, type StoredSubmission } from "@/lib/dap/progress";
import { SectionCard } from "./bits";
import { cn } from "@/lib/utils";

const SCORE_ANCHORS = [
  { v: 1, label: "1 — missing" },
  { v: 2, label: "2 — weak" },
  { v: 3, label: "3 — adequate" },
  { v: 4, label: "4 — strong" },
  { v: 5, label: "5 — excellent" },
];

const MAX_FILES = 10;
const MAX_BYTES = 2_000_000;

export function EvaluationView({ project }: { project: DapProject }) {
  const { modes, stepsDone, submissions, addSubmission } = useDapProgress();
  const mode = modes[project.id] ?? "guided";
  const stepsDoneCount = countStepsDone(stepsDone, project.id);

  const [githubUrl, setGithubUrl] = useState("");
  const [githubState, setGithubState] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const [githubMsg, setGithubMsg] = useState("");
  const [githubFiles, setGithubFiles] = useState<SubmissionFile[]>([]);
  const [uploaded, setUploaded] = useState<SubmissionFile[]>([]);
  const [notes, setNotes] = useState("");
  const [deliverables, setDeliverables] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(RUBRIC_DIMENSIONS.map((d) => [d, 3])) as Record<string, number>
  );
  const [reviewBusy, setReviewBusy] = useState(false);
  const [review, setReview] = useState<StoredSubmission["review"] | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const files = useMemo(() => [...githubFiles, ...uploaded], [githubFiles, uploaded]);
  const history = submissions[project.id] ?? [];

  async function fetchGithub() {
    const url = githubUrl.trim();
    if (!url) return;
    setGithubState("loading");
    setGithubMsg("");
    setGithubFiles([]);
    try {
      const res = await fetch("/api/dap/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGithubState("error");
        setGithubMsg(data?.error ?? "Could not fetch the repository.");
        return;
      }
      setGithubState("ok");
      setGithubMsg(`Read ${data.files.length} file(s) from ${data.repo}@${data.branch}${data.skipped ? ` (${data.skipped} skipped)` : ""}.`);
      setGithubFiles(data.files as SubmissionFile[]);
    } catch {
      setGithubState("error");
      setGithubMsg("Network error contacting GitHub — upload your files directly instead.");
    }
  }

  function onFilesChosen(list: FileList | null) {
    if (!list) return;
    const accepted: SubmissionFile[] = [];
    for (const f of Array.from(list).slice(0, MAX_FILES)) {
      if (f.size > MAX_BYTES) continue;
      const reader = new FileReader();
      reader.onload = () => {
        accepted.push({
          name: f.name,
          ext: f.name.split(".").pop()?.toLowerCase() ?? "txt",
          content: String(reader.result ?? ""),
        });
        if (accepted.length) setUploaded((prev) => [...prev, ...accepted].slice(0, MAX_FILES));
      };
      reader.readAsText(f);
    }
  }

  function requestReview() {
    setError("");
    setReviewBusy(true);
    // Yield a frame so the spinner renders before the synchronous analysis.
    setTimeout(() => {
      try {
        const result = buildReview({
          project,
          githubUrl: githubUrl.trim() || undefined,
          files,
          notes,
          deliverablesDone: [...deliverables],
          selfScores: scores as Record<RubricDimension, number>,
          guidedStepsDone: stepsDoneCount,
          guidedStepsTotal: project.guidedSteps.length,
          mode,
        });
        const stored: StoredSubmission = {
          id: `${project.id}-${Date.now()}`,
          projectId: project.id,
          createdAt: new Date().toISOString(),
          githubUrl: githubUrl.trim() || undefined,
          fileNames: files.map((f) => f.name),
          notes,
          deliverables: [...deliverables],
          selfScores: { ...scores },
          mode,
          guidedStepsDone: stepsDoneCount,
          review: {
            score: result.score,
            band: result.bandLabel,
            headline: result.headline,
            summary: result.summary,
            strengths: result.strengths,
            developments: result.developments,
            nextStep: result.nextStep,
            dimensionComments: result.dimensionComments.map((d) => ({
              dimension: d.dimension, label: d.label, score: d.score, comment: d.comment, evidence: d.evidence,
            })),
            evidenceChips: result.evidenceChips,
          },
        };
        addSubmission(stored);
        setReview(stored.review);
      } catch (e) {
        setError("Something went wrong generating the review. Check your inputs and try again.");
      } finally {
        setReviewBusy(false);
      }
    }, 40);
  }

  const hasEvidence = files.length > 0 || notes.trim().length > 40 || githubUrl.trim().length > 10;

  return (
    <div className="space-y-5">
      {/* -------------------------------------------------------- evidence */}
      <SectionCard title="1 · Attach your work" step="">
        <div className="space-y-4">
          {/* GitHub */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink" htmlFor="gh-url">
              <Github className="h-4 w-4" /> GitHub repository link
            </label>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Public repositories only — the review reads your actual notebooks and scripts (up to 10 files).
            </p>
            <div className="mt-1.5 flex gap-2">
              <input
                id="gh-url"
                value={githubUrl}
                onChange={(e) => { setGithubUrl(e.target.value); setGithubState("idle"); }}
                placeholder="https://github.com/username/project-analysis"
                className="h-10 flex-1 rounded-lg border border-border-subtle bg-card px-3 text-sm text-ink placeholder:text-ink-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                onClick={fetchGithub}
                disabled={!githubUrl.trim() || githubState === "loading"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-card px-3.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-accent disabled:opacity-40"
              >
                {githubState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                Fetch files
              </button>
            </div>
            {githubMsg ? (
              <p className={cn("mt-1.5 text-[12.5px]", githubState === "error" ? "text-danger-text" : "text-viz-10")}>{githubMsg}</p>
            ) : null}
          </div>

          {/* Files */}
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <Paperclip className="h-4 w-4" /> Project files
            </p>
            <p className="mt-0.5 text-[12px] text-ink-3">
              .ipynb / .py / .sql / .r / .md — read in your browser, analysed for evidence. Nothing is uploaded to a server.
            </p>
            <button
              onClick={() => fileInput.current?.click()}
              className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-dashed border-border-strong bg-card px-4 py-2.5 text-[13px] font-semibold text-ink-2 transition-colors hover:border-viz-10/60 hover:text-viz-10"
            >
              <Upload className="h-4 w-4" /> Choose files
            </button>
            <input ref={fileInput} type="file" multiple accept=".ipynb,.py,.sql,.r,.md,.txt,.csv" className="hidden" onChange={(e) => onFilesChosen(e.target.files)} />
            {uploaded.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {uploaded.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-border-subtle bg-card px-3 py-1.5">
                    <span className="flex items-center gap-2 font-mono text-[12px] text-ink-2">
                      <FileCode2 className="h-3.5 w-3.5 text-viz-10" /> {f.name}
                    </span>
                    <button onClick={() => setUploaded((prev) => prev.filter((_, j) => j !== i))} className="text-ink-3 hover:text-danger-text" aria-label={`Remove ${f.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink" htmlFor="ev-notes">
              Written notes / key findings
            </label>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Paste your executive summary or the findings you&apos;d defend — the interpretation dimensions read this.
            </p>
            <textarea
              id="ev-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. We found churn concentrated in the first 90 days (23% vs 9% overall), driven by low usage hours in month 1…"
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-card px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Deliverables */}
          <div>
            <p className="text-[13px] font-semibold text-ink">Deliverables completed</p>
            <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {project.independentBrief.deliverables.map((d) => {
                const on = deliverables.has(d);
                return (
                  <button
                    key={d}
                    onClick={() => setDeliverables((prev) => { const n = new Set(prev); if (n.has(d)) n.delete(d); else n.add(d); return n; })}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-[12.5px] leading-snug transition-colors",
                      on ? "border-viz-10/50 bg-viz-10/10 text-ink" : "border-border-subtle bg-card text-ink-2 hover:border-viz-10/50"
                    )}
                  >
                    {on ? <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" /> : <span className="mr-1.5 inline-block h-3.5 w-3.5 rounded border border-border-strong align-middle" />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ---------------------------------------------------- self-assessment */}
      <SectionCard title="2 · Self-assess against the rubric" step="">
        <p className="text-[12.5px] text-ink-3">
          Honest scores get better feedback — the review adjusts your self-assessment with evidence from your files
          (e.g., chart calls, quality checks, statistics detected).
        </p>
        <div className="mt-3 space-y-3">
          {RUBRIC_DIMENSIONS.map((d) => (
            <div key={d} className="rounded-lg border border-border-subtle bg-card p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-[13.5px] font-semibold text-ink">{RUBRIC_META[d].label}</span>
                  <span className="ml-2 font-mono text-[11px] text-ink-3">{Math.round(RUBRIC_META[d].weight * 100)}% of grade</span>
                </div>
                <span className="font-mono text-[13px] font-bold text-viz-10">{scores[d]}/5</span>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-3">{RUBRIC_META[d].blurb}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {SCORE_ANCHORS.map((a) => (
                  <button
                    key={a.v}
                    onClick={() => setScores((s) => ({ ...s, [d]: a.v }))}
                    aria-pressed={scores[d] === a.v}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                      scores[d] === a.v
                        ? "border-viz-10 bg-viz-10 text-ink-inverse"
                        : "border-border-subtle bg-surface text-ink-2 hover:border-viz-10/60"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ----------------------------------------------------------- request */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-card p-5">
        <div>
          <p className="font-serif text-[15px] font-semibold text-ink">Request instructor review</p>
          <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-ink-3">
            {hasEvidence
              ? "Evidence attached — the review will analyse your files and notes against the six dimensions."
              : "Attach a GitHub link, upload files or write your key findings first: the review's depth depends on the evidence it can read."}
          </p>
          {error ? <p className="mt-1 text-[12.5px] text-danger-text">{error}</p> : null}
        </div>
        <button
          onClick={requestReview}
          disabled={reviewBusy || !hasEvidence}
          className="inline-flex items-center gap-2 rounded-full bg-viz-10 px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-e1 transition-colors hover:bg-viz-10/85 disabled:opacity-50"
        >
          {reviewBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {reviewBusy ? "Reviewing…" : "Request review"}
        </button>
      </div>

      {/* ------------------------------------------------------------ review */}
      {review ? <ReviewReport review={review} /> : null}

      {/* ----------------------------------------------------------- history */}
      {history.length > 0 ? (
        <SectionCard title="Submission history" step="">
          <ul className="space-y-2">
            {[...history].reverse().map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-card px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">
                    {h.review.score.toFixed(1)}/100 · {h.review.band}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-3">
                    {new Date(h.createdAt).toLocaleString()} · {h.mode} mode · {h.fileNames.length} file(s)
                    {h.githubUrl ? " · GitHub" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReview(h.review)}
                    className="rounded-lg border border-border-subtle px-3 py-1.5 text-[12px] font-semibold text-ink-2 transition-colors hover:bg-accent"
                  >
                    View review
                  </button>
                  <button
                    onClick={() => setReview(null)}
                    aria-label="Clear shown review"
                    className="text-ink-3 hover:text-danger-text"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------- review report */

const BAND_TONE: Record<string, string> = {
  Distinction: "border-viz-10/50 bg-viz-10/10",
  Merit: "border-success-border bg-success-bg/70",
  Pass: "border-warning-border bg-warning-bg/70",
};

function ReviewReport({ review }: { review: StoredSubmission["review"] }) {
  const tone = BAND_TONE[review.band.split(" —")[0]] ?? "border-border bg-surface-subtle";
  return (
    <section className={cn("rounded-xl border p-5", tone)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="eyebrow">Instructor review</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{review.headline}</h3>
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl font-bold leading-none text-ink">{review.score.toFixed(1)}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">out of 100</p>
        </div>
      </div>

      {review.evidenceChips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.evidenceChips.map((c, i) => (
            <span key={i} className="rounded-full border border-border-subtle bg-card px-2.5 py-0.5 text-[11.5px] font-medium text-ink-2">
              {c}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2.5">
        {review.summary.map((p, i) => (
          <p key={i} className="text-[13.5px] leading-relaxed text-ink-2">{p}</p>
        ))}
      </div>

      {/* dimensions */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {review.dimensionComments.map((d) => (
          <div key={d.dimension} className="rounded-lg border border-border-subtle bg-card p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-ink">{d.label}</span>
              <span className="font-mono text-[12px] font-bold text-viz-10">
                {d.score}/5{d.score !== d.score ? "" : ""}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{d.comment}</p>
            {d.evidence.length > 0 ? (
              <ul className="mt-2 space-y-0.5 border-t border-border-subtle pt-2">
                {d.evidence.slice(0, 3).map((e, i) => (
                  <li key={i} className="font-mono text-[11px] text-ink-3">· {e}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>

      {/* strengths / developments */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-success-border bg-card p-4">
          <p className="text-[12px] font-bold uppercase tracking-wide text-success-text">Strengths</p>
          <ul className="mt-1.5 space-y-1.5">
            {review.strengths.map((s, i) => (
              <li key={i} className="text-[12.5px] leading-relaxed text-ink-2">✓ {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-warning-border bg-card p-4">
          <p className="text-[12px] font-bold uppercase tracking-wide text-warning-text">Development actions</p>
          <ul className="mt-1.5 space-y-1.5">
            {review.developments.map((d, i) => (
              <li key={i} className="text-[12.5px] leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">{d.area}:</span> {d.action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-inset px-3.5 py-2.5 text-[13px] font-medium text-ink">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-viz-10" />
        {review.nextStep}
      </p>
    </section>
  );
}
