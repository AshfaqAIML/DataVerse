"use client";

/**
 * MathLessonView — the mathematics course's digital-textbook reader.
 *
 * The lesson's ten pedagogical steps render as ten clearly signposted,
 * anchorable sections, always in the same order, so a math-anxious
 * learner always knows what comes next:
 *
 *   The everyday picture → In plain words → The words mathematicians use →
 *   See it → Where the formula comes from → Worked examples →
 *   Do it in Python → Where machine learning uses it →
 *   Practice → Check yourself
 *
 * Equations are authored as Unicode mathematics and presented in the
 * reading serif via .math-line (globals.css) — readable in both themes,
 * scrolling (never wrapping) on narrow screens.
 */
import { useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Cpu,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  PenLine,
  Sigma,
  Wrench,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MathCourse, Visual } from "@/lib/mathcourse/types";
import { allMathLessons, neighborMathLesson } from "@/lib/mathcourse/types";
import { lessonReady } from "@/lib/mathcourse/diagnostic";
import { useMathProgress } from "@/lib/mathcourse/progress";
import { InlineText } from "@/components/course/blocks";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { noteKey, useReaderPrefs } from "@/components/textbook/prefs";
import { TextbookShell } from "@/components/textbook/shell";
import { OutlineTree, type OutlineNode } from "@/components/textbook/outline";
import { ReaderRail, type RailRelated, type RailTocItem } from "@/components/textbook/rail";
import {
  Breadcrumbs,
  LessonFooterNav,
  MetaChip,
  MetaRow,
  ObjectivesCard,
  SectionHeading,
  TakeawaysSection,
  TitleBlock,
} from "@/components/textbook/chrome";
import { LabHost } from "./LabHost";
import { FunctionGraph } from "./FunctionGraph";
import { MathQuizCard } from "./quiz";

const COURSE_KEY = "math";
const ACCENT = "var(--dv-viz-2)";

/** The numbered heading of one of the lesson's ten steps. */
function StepTitle({
  n,
  icon: Icon,
  id,
  children,
}: {
  n: number;
  icon: typeof Lightbulb;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="dv-lesson-h3 flex scroll-mt-24 items-center gap-2.5 border-t border-border-subtle pt-8 text-ink"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-ink-inverse"
        style={{ backgroundColor: "var(--tb-accent)" }}
      >
        {n}
      </span>
      <Icon className="tb-accent h-5 w-5 shrink-0" />
      <span>{children}</span>
    </h2>
  );
}

/** One serif-styled mathematical line (unicode math, no external renderer).
 *  The line scrolls horizontally on narrow screens (see .math-line), so it
 *  is keyboard-focusable and carries its formula as an accessible name. */
export function MathLine({ children }: { children: string }) {
  return (
    <div className="math-line" role="math" tabIndex={0} aria-label={`Formula: ${children}`}>
      {children}
    </div>
  );
}

function VisualView({ v }: { v: Visual }) {
  if (v.kind === "graph") return <FunctionGraph spec={v.spec} />;
  if (v.kind === "lab") return <LabHost lab={v.lab} title={v.title} />;
  /* The authored svg carries role="img" without a title (svg-img-alt);
     inject its alt text as a <title> so the graphic is self-describing. */
  const svgWithTitle = v.spec.svg.replace(
    /<svg([^>]*)>/,
    (m: string, attrs: string) =>
      `${m}<title>${v.spec.alt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</title>`,
  );
  return (
    <figure className="space-y-2">
      <div
        className="overflow-hidden rounded-xl border border-border-subtle bg-surface p-4 text-foreground"
        role="img"
        aria-label={v.spec.alt}
        dangerouslySetInnerHTML={{ __html: svgWithTitle }}
      />
      {v.spec.caption && (
        <figcaption className="text-center text-xs leading-relaxed text-muted-foreground">{v.spec.caption}</figcaption>
      )}
    </figure>
  );
}

export function MathLessonView({
  course,
  slug,
  navigate,
}: {
  course: MathCourse;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const ref = allMathLessons(course).find((l) => l.lesson.slug === slug);
  const done = useMathProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useMathProgress((s) => s.markLesson);
  const lessonsDone = useMathProgress((s) => s.lessonsDone);
  const quizAnswers = useMathProgress((s) => s.quizAnswers);
  const diagnostic = useMathProgress((s) => s.diagnostic);
  const bookmarks = useReaderPrefs((s) => s.bookmarks);
  const [openSolution, setOpenSolution] = useState<Record<string, boolean>>({});

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-ink">Lesson not found</p>
        <button onClick={() => navigate("#/math")} className="mt-3 text-sm font-medium text-primary hover:underline">
          Back to the math course home
        </button>
      </div>
    );
  }

  const { lesson, part } = ref;
  const flat = allMathLessons(course);
  const prev = neighborMathLesson(course, slug, -1);
  const next = neighborMathLesson(course, slug, 1);
  const lessonNumber = flat.findIndex((l) => l.lesson.slug === slug) + 1;
  const total = flat.length;
  const doneCount = flat.filter((l) => lessonsDone[l.lesson.slug]).length;

  const clearedPartners = diagnostic
    ? new Set(
        course.parts
          .filter((p) => {
            const s = diagnostic.areaScores[p.letter];
            return s && s.total > 0 && s.correct / s.total >= 0.8;
          })
          .map((p) => p.letter)
      )
    : new Set<string>();
  const readiness = lessonReady(course, lesson, { lessonsDone, quizAnswers }, clearedPartners);

  // ---- left rail
  const nodes: OutlineNode[] = course.parts.map((p) => ({
    kind: "group",
    id: p.letter,
    label: p.letter,
    title: p.title,
    children: p.lessons.map((l) => ({
      kind: "lesson" as const,
      slug: l.slug,
      title: l.title,
      minutes: l.minutes,
      href: `#/math/lesson/${l.slug}`,
      done: !!lessonsDone[l.slug],
      current: l.slug === slug,
      bookmarked: !!bookmarks[noteKey(COURSE_KEY, l.slug)],
    })),
  }));

  const bookmarkedLessons = flat
    .filter((l) => bookmarks[noteKey(COURSE_KEY, l.lesson.slug)])
    .map((l) => ({ slug: l.lesson.slug, title: l.lesson.title, href: `#/math/lesson/${l.lesson.slug}` }));

  // ---- right rail: the ten steps are the table of contents
  const toc: RailTocItem[] = [
    { id: "sec-objectives", title: "After this lesson you can" },
    { id: "step-1", title: "The everyday picture" },
    { id: "step-2", title: "In plain words" },
    { id: "step-3", title: "The words mathematicians use" },
    { id: "step-4", title: "See it — move it" },
    { id: "step-5", title: lesson.derivation.title },
    { id: "step-6", title: "Worked examples" },
    { id: "step-7", title: "Do it in Python" },
    { id: "step-8", title: lesson.mlConnection.title },
    { id: "sec-traps", title: "Common traps" },
    { id: "step-9", title: "Practice" },
    { id: "sec-quiz", title: "Check yourself" },
    { id: "sec-takeaways", title: "Keep these sentences" },
  ];

  // ---- related: prerequisites first, then same part, then shared vocabulary
  const prereqSet = new Set(lesson.prerequisites);
  const termSet = new Set(lesson.terminology.map((t) => t.term.toLowerCase()));
  const related: RailRelated[] = flat
    .filter((l) => l.lesson.slug !== slug)
    .map((l) => ({
      l,
      score:
        (prereqSet.has(l.lesson.slug) ? 30 : 0) +
        (l.part.letter === part.letter ? 10 : 0) +
        l.lesson.terminology.filter((t) => termSet.has(t.term.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ l }) => ({
      title: l.lesson.title,
      sub: prereqSet.has(l.lesson.slug)
        ? `prerequisite · ${l.lesson.slug}`
        : `Part ${l.part.letter} · ${l.lesson.slug}`,
      href: `#/math/lesson/${l.lesson.slug}`,
    }));

  const goPrev = prev ? () => navigate(`#/math/lesson/${prev.lesson.slug}`) : undefined;
  const goNext = next
    ? () => {
        markLesson(slug, true);
        navigate(`#/math/lesson/${next.lesson.slug}`);
      }
    : undefined;

  return (
    <TextbookShell
      courseKey={COURSE_KEY}
      slug={slug}
      accent={ACCENT}
      onPrev={goPrev}
      onNext={goNext}
      left={
        <OutlineTree
          key={slug}
          schoolLabel="School B · Mathematics"
          schoolSub={course.title}
          readingLabel={`Part ${part.letter} — ${part.title}`}
          doneCount={doneCount}
          total={total}
          nodes={nodes}
          navigate={navigate}
          bookmarks={bookmarkedLessons}
          onSchool={() => navigate("#/school/mathematics")}
        />
      }
      right={
        <ReaderRail
          key={slug}
          toc={toc}
          concepts={lesson.objectives}
          terms={lesson.terminology.map((t) => ({ term: t.term, symbol: t.symbol, definition: t.plain }))}
          related={related}
          tutorPrompts={[
            `Explain the key idea of "${lesson.title}" in simpler terms`,
            lesson.terminology.length > 0
              ? `Quiz me on: ${lesson.terminology.slice(0, 2).map((t) => t.term).join(", ")}`
              : `Quiz me on "${lesson.title}"`,
            "Walk me through the derivation again, one step at a time",
          ]}
          onOpenTutor={() => navigate("#/tutor")}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "School B · Mathematics", onClick: () => navigate("#/school/mathematics") },
          { label: course.title, onClick: () => navigate("#/math") },
          { label: `Part ${part.letter} — ${part.title}`, onClick: () => navigate(`#/math/part/${part.letter}`) },
          { label: lesson.title },
        ]}
      />

      <MetaRow>
        <MetaChip tone="accent">{lesson.slug.toUpperCase()}</MetaChip>
        <MetaChip icon={Clock}>{lesson.minutes} min</MetaChip>
        <MetaChip>
          Lesson {lessonNumber} of {total}
        </MetaChip>
        {done && (
          <MetaChip tone="success" icon={CheckCircle2}>
            completed
          </MetaChip>
        )}
      </MetaRow>

      <TitleBlock title={lesson.title} summaryNode={<InlineText text={lesson.summary} />} />

      <ObjectivesCard
        id="sec-objectives"
        objectives={lesson.objectives}
        label="After this lesson you will be able to"
        render={(t) => <InlineText text={t} />}
      />

      {!readiness.ready && (
        <div className="mt-6 rounded-xl border border-warning-border bg-warning-bg/70 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning-text">
            <AlertTriangle className="h-4 w-4" /> Before this lesson — you can read on, but these foundations will make
            it easier:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {readiness.unmet.map((l) => (
              <button
                key={l.slug}
                onClick={() => navigate(`#/math/lesson/${l.slug}`)}
                className="rounded-full border border-warning-text/70 bg-background px-3 py-1 text-xs font-medium text-warning-text hover:bg-warning-bg"
              >
                {l.slug.toUpperCase()} · {l.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 1. everyday analogy ---------------- */}
      <section id="step-1" className="tb-panel relative mt-8 overflow-hidden rounded-2xl p-5 sm:p-6">
        <StepTitleInner n={1} label="The everyday picture" icon={Lightbulb} />
        <p className="dv-lesson-text mt-3">{lesson.analogy.scene}</p>
        <p className="mt-2 border-l-2 pl-4 text-[15.5px] font-medium leading-8 text-ink" style={{ borderColor: "color-mix(in srgb, var(--tb-accent) 55%, transparent)" }}>
          {lesson.analogy.bridge}
        </p>
      </section>

      {/* ---------------- 2. intuition ---------------- */}
      <section className="mt-9">
        <StepTitle n={2} icon={BookOpenCheck} id="step-2">In plain words</StepTitle>
        <div className="mt-3 space-y-4">
          {lesson.intuition.map((p, i) => (
            <p key={i} className="dv-lesson-text">
              <InlineText text={p} />
            </p>
          ))}
        </div>
      </section>

      {/* ---------------- 3. terminology ---------------- */}
      <section className="mt-9">
        <StepTitle n={3} icon={GraduationCap} id="step-3">The words mathematicians use</StepTitle>
        <p className="dv-kicker mt-2">You already met the idea — now you can give it its proper name.</p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-left">
                <th className="px-4 py-2.5 font-semibold text-ink">Term</th>
                <th className="px-4 py-2.5 font-semibold text-ink">In plain words</th>
                <th className="px-4 py-2.5 font-semibold text-ink">Precisely</th>
              </tr>
            </thead>
            <tbody>
              {lesson.terminology.map((t) => (
                <tr key={t.term} className="border-b border-border-subtle/70 last:border-0">
                  <td className="px-4 py-3 align-top">
                    <span className="font-semibold text-ink">{t.term}</span>
                    {t.symbol && <div className="math-line text-sm">{t.symbol}</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-ink-3">{t.plain}</td>
                  <td className="px-4 py-3 align-top text-ink-2">{t.formal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 4. visuals ---------------- */}
      <section className="mt-9">
        <StepTitle n={4} icon={FlaskConical} id="step-4">See it — move it</StepTitle>
        <p className="dv-kicker mt-2">Interactive: drag, slide, and watch the numbers follow. Play first, formulas after.</p>
        <div className="mt-3 space-y-5">
          {lesson.visuals.map((v, i) => (
            <VisualView key={i} v={v} />
          ))}
        </div>
      </section>

      {/* ---------------- 5. derivation ---------------- */}
      <section className="mt-9">
        <StepTitle n={5} icon={Wrench} id="step-5">{lesson.derivation.title}</StepTitle>
        <p className="dv-lesson-text mt-2 text-ink-3">{lesson.derivation.intro}</p>
        <ol className="mt-4 space-y-4">
          {lesson.derivation.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-border-subtle bg-surface p-4">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-ink-inverse"
                  style={{ backgroundColor: "color-mix(in srgb, var(--tb-accent) 82%, var(--dv-surface))" }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-ink-2">{s.do}</p>
                  <MathLine>{s.math}</MathLine>
                  {s.why && (
                    <p className="mt-1.5 text-xs italic leading-relaxed text-ink-3">why this is legal: {s.why}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="tb-panel mt-4 rounded-xl border-2 p-4" style={{ borderColor: "color-mix(in srgb, var(--tb-accent) 45%, transparent)" }}>
          <p className="dv-kicker tb-accent">The result we just built</p>
          <MathLine>{lesson.derivation.result}</MathLine>
        </div>
      </section>

      {/* ---------------- 6. worked examples ---------------- */}
      <section className="mt-9">
        <StepTitle n={6} icon={PenLine} id="step-6">Worked examples</StepTitle>
        <div className="mt-3 space-y-5">
          {lesson.examples.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border-subtle bg-surface p-5">
              <h3 className="t-item text-ink">{ex.title}</h3>
              <p className="mt-1.5 rounded-lg bg-surface-subtle px-3.5 py-2.5 text-sm leading-relaxed text-ink-2">
                <span className="font-semibold text-ink-3">Problem. </span>
                <InlineText text={ex.problem} />
              </p>
              <ol className="mt-3 space-y-2.5">
                {ex.steps.map((s, j) => (
                  <li key={j} className="flex flex-col gap-1 rounded-lg border border-border-subtle/60 bg-surface-subtle/40 px-3.5 py-2.5">
                    <p className="text-sm leading-relaxed text-ink-2">{s.do}</p>
                    <MathLine>{s.math}</MathLine>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm font-semibold text-success-text">
                Answer: <span className="font-normal">{ex.answer}</span>
              </p>
              {ex.check && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-ink-3 hover:text-ink">
                    Verify it with Python (real output)
                  </summary>
                  <pre tabIndex={0} role="region" aria-label="Python check — scrollable code" className="mt-2 overflow-x-auto rounded-lg border border-border-subtle bg-surface-subtle/50 p-3 font-mono text-xs leading-relaxed text-ink-2">{ex.check.code}</pre>
                  <pre tabIndex={0} role="region" aria-label="Python check — verified output, scrollable" className="mt-1 overflow-x-auto rounded-lg border border-success-border/50 bg-success-bg/40 p-3 font-mono text-xs leading-relaxed text-success-text">{ex.check.output}</pre>
                  {ex.check.note && <p className="mt-1 text-xs text-ink-3">{ex.check.note}</p>}
                </details>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 7. programming ---------------- */}
      <section className="mt-9">
        <StepTitle n={7} icon={Wrench} id="step-7">Do it in Python</StepTitle>
        <p className="dv-lesson-text mt-2 text-ink-3">{lesson.programming.intro}</p>
        <div className="mt-3 rounded-xl border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-surface-subtle px-4 py-2 text-xs font-semibold text-ink-3">
            program (run it yourself below — the shown output is machine-verified)
          </div>
          <pre tabIndex={0} role="region" aria-label="Program — scrollable code" className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ink">{lesson.programming.code}</pre>
          <div className="border-t border-success-border/40 bg-success-bg/40 px-4 py-2 text-xs font-semibold text-success-text">
            output (produced by actually running it)
          </div>
          <pre tabIndex={0} role="region" aria-label="Program — verified output, scrollable" className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-success-text">{lesson.programming.output}</pre>
        </div>
        {lesson.programming.explanation.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {lesson.programming.explanation.map((e, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-2">
                <span className="tb-dot mt-2 h-1 w-1 shrink-0 rounded-full" />
                <InlineText text={e} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <PythonPlayground initialCode={lesson.programming.code} editorHeight="h-56" compact />
        </div>
      </section>

      {/* ---------------- 8. ML connection ---------------- */}
      <section id="step-8" className="mt-9 rounded-xl border border-danger-border/70 bg-danger-bg/40 p-5 sm:p-6">
        <StepTitle n={8} icon={Cpu}>{lesson.mlConnection.title}</StepTitle>
        <div className="mt-2 space-y-3">
          {lesson.mlConnection.body.map((p, i) => (
            <p key={i} className="dv-lesson-text">
              <InlineText text={p} />
            </p>
          ))}
        </div>
        {lesson.mlConnection.usedBy.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-danger-text">Used by:</span>
            {lesson.mlConnection.usedBy.map((u) => (
              <span key={u} className="rounded-full border border-danger-border/70 bg-background px-2.5 py-0.5 text-xs font-medium text-danger-text">
                {u}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- misconceptions ---------------- */}
      <section id="sec-traps" className="mt-12 scroll-mt-24">
        <SectionHeading icon={AlertTriangle}>Common traps — and the way out</SectionHeading>
        <div className="mt-3 space-y-3">
          {lesson.misconceptions.map((m, i) => (
            <div key={i} className="rounded-xl border border-warning-border/80 bg-warning-bg/40 p-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-warning-text">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> “{m.myth}”
              </p>
              <p className="mt-1.5 pl-6 text-sm leading-relaxed text-ink-3">It feels right because {m.why}.</p>
              <p className="mt-1.5 flex items-start gap-2 pl-6 text-sm leading-relaxed text-ink-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-text" /> {m.reality}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 9/10. exercises with solutions ---------------- */}
      <section className="mt-9">
        <StepTitle n={9} icon={PenLine} id="step-9">Practice — with full solutions</StepTitle>
        <div className="mt-3 space-y-4">
          {lesson.exercises.map((ex, i) => (
            <div key={ex.id} className="rounded-xl border border-border-subtle bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                    ex.tier === "beginner"
                      ? "bg-success-bg text-success-text"
                      : ex.tier === "intermediate"
                        ? "bg-info-bg text-info-text"
                        : "bg-danger-bg text-danger-text"
                  )}
                >
                  {ex.tier}
                </span>
                <h3 className="t-item text-ink">
                  Exercise {i + 1}: {ex.title}
                </h3>
              </div>
              <p className="mt-2.5 dv-lesson-text">
                <InlineText text={ex.prompt} />
              </p>
              {ex.hint && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-ink-3 hover:text-ink">
                    Need a nudge? (hint)
                  </summary>
                  <p className="mt-1.5 rounded-lg bg-surface-subtle px-3.5 py-2 text-sm leading-relaxed text-ink-3">
                    {ex.hint}
                  </p>
                </details>
              )}
              {ex.starter && (
                <div className="mt-3">
                  <PythonPlayground
                    initialCode={ex.starter}
                    expectedOutput={ex.solution.check?.output}
                    editorHeight="h-40"
                    compact
                    onResult={(r) => {
                      if (r.checked?.passed) {
                        useMathProgress.getState().markExercisePassed(ex.id);
                      }
                    }}
                  />
                </div>
              )}
              <div className="mt-3">
                {openSolution[ex.id] ? (
                  <div className="rounded-xl border p-4 tb-panel">
                    <p className="tb-accent text-sm font-semibold">Solution</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                      <span className="font-semibold text-ink">The plan: </span>
                      <InlineText text={ex.solution.approach} />
                    </p>
                    <ol className="mt-2 space-y-2">
                      {ex.solution.steps.map((s, j) => (
                        <li key={j} className="rounded-lg bg-surface px-3.5 py-2">
                          <p className="text-sm leading-relaxed text-ink-2">{s.do}</p>
                          <MathLine>{s.math}</MathLine>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-sm font-semibold text-success-text">
                      Answer: <span className="font-normal">{ex.solution.answer}</span>
                    </p>
                    {ex.solution.check && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-ink-3 hover:text-ink">
                          Python check (verified output)
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded-lg border border-border-subtle bg-surface-subtle/50 p-3 font-mono text-xs text-ink-2">{ex.solution.check.code}</pre>
                        <pre className="mt-1 overflow-x-auto rounded-lg border border-success-border/50 bg-success-bg/40 p-3 font-mono text-xs text-success-text">{ex.solution.check.output}</pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenSolution((s) => ({ ...s, [ex.id]: true }))}
                    className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-subtle/60 tb-border-accent tb-accent"
                  >
                    Try it first — then reveal the worked solution
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- quiz ---------------- */}
      <section id="sec-quiz" className="mt-12 scroll-mt-24">
        <SectionHeading icon={Sigma}>Check yourself</SectionHeading>
        <p className="dv-kicker mt-2">
          Three quick questions. A miss is a gift — it tells the revision radar exactly where to send you.
        </p>
        <div className="mt-4">
          <MathQuizCard lesson={lesson} />
        </div>
      </section>

      {/* ---------------- takeaways ---------------- */}
      <TakeawaysSection
        id="sec-takeaways"
        title="Keep these sentences"
        takeaways={lesson.takeaways}
        render={(t) => <InlineText text={t} />}
      />

      <LessonFooterNav
        complete={{ done, onToggle: () => markLesson(slug, !done) }}
        prev={prev ? { title: prev.lesson.title, onClick: () => navigate(`#/math/lesson/${prev.lesson.slug}`) } : null}
        next={
          next
            ? {
                title: next.lesson.title,
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/math/lesson/${next.lesson.slug}`);
                },
              }
            : {
                title: `Back to Part ${part.letter}`,
                label: "Finish",
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/math/part/${part.letter}`);
                },
              }
        }
        colophon={
          <>
            Lesson {lessonNumber} of {total} · Part {part.letter} — {part.title}
          </>
        }
      />
    </TextbookShell>
  );
}

function StepTitleInner({ n, label, icon: Icon }: { n: number; label: string; icon: typeof Lightbulb }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold text-ink-inverse"
        style={{ backgroundColor: "var(--tb-accent)" }}
      >
        {n}
      </span>
      <Icon className="tb-accent h-5 w-5" />
      <h2 className="dv-lesson-h3 text-ink">{label}</h2>
    </div>
  );
}
