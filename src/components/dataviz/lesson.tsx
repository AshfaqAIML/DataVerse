"use client";

/**
 * DataVizLessonView — the Data Visualization course's digital-textbook
 * reader. Renders every block kind, with REAL charts (shared engine),
 * interactive interpretation exercises and knowledge-check quizzes,
 * then takeaways and prev/next — inside the shared textbook shell.
 */
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  ChartSpec,
  DataVizBlock,
  DataVizCourse,
  QuizItem,
  QuizOption,
} from "@/lib/dataviz/types";
import { allDataVizLessons, neighborDataVizLesson } from "@/lib/dataviz/types";
import { useVizProgress } from "@/lib/dataviz/progress";
import { ChartRenderer } from "./charts";
import { cn } from "@/lib/utils";
import { noteKey, useReaderPrefs } from "@/components/textbook/prefs";
import { TextbookShell } from "@/components/textbook/shell";
import { OutlineTree, type OutlineNode } from "@/components/textbook/outline";
import { ReaderRail, type RailRelated, type RailTocItem } from "@/components/textbook/rail";
import {
  Breadcrumbs,
  CopyButton,
  LessonFooterNav,
  MetaChip,
  MetaRow,
  MinutesChip,
  ObjectivesCard,
  SectionHeading,
  TakeawaysSection,
  TermsSection,
  TitleBlock,
  WhyPanel,
} from "@/components/textbook/chrome";

const COURSE_KEY = "viz";
const ACCENT = "var(--dv-viz-10)";

/* ------------------------------------------------------------ inline text */

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
          return <em key={i}>{p.slice(1, -1)}</em>;
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="rounded bg-surface-inset px-1 py-0.5 font-mono text-[0.85em] text-viz-10">
              {p.slice(1, -1)}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ------------------------------------------------- interactive MCQ panels */

function McqPanel({
  prompt,
  options,
  explanation,
  accent,
  icon,
}: {
  prompt: string;
  options: QuizOption[];
  explanation: string;
  accent: "teal" | "orange";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const Icon = icon;
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent === "teal" ? "border-viz-10/40 bg-viz-10/10" : "border-warning-border bg-warning-bg/50",
      )}
    >
      <p className="flex items-start gap-2 text-sm font-semibold text-ink">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", accent === "teal" ? "text-viz-10" : "text-gold-600")} />
        <Inline text={prompt} />
      </p>
      <div className="mt-3 space-y-1.5">
        {options.map((o) => {
          const reveal = picked !== null;
          const isPicked = picked === o.text;
          return (
            <button
              key={o.text}
              disabled={reveal}
              onClick={() => setPicked(o.text)}
              className={cn(
                "w-full rounded-lg border px-3.5 py-2 text-left text-sm transition-colors",
                !reveal && "border-border-subtle bg-surface text-ink-2 hover:border-viz-10/60 hover:bg-surface",
                reveal && o.correct && "border-success-text bg-success-bg text-success-text",
                reveal && !o.correct && isPicked && "border-danger-text bg-danger-bg text-danger-text",
                reveal && !o.correct && !isPicked && "border-border-subtle bg-surface opacity-55",
              )}
            >
              <Inline text={o.text} />
              {reveal && isPicked ? (
                <span className="mt-1 block text-xs leading-relaxed text-ink-2">{o.feedback}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {picked ? (
        <p className="mt-3 rounded-lg bg-surface/80 px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
          <strong>Why: </strong>
          <Inline text={explanation} />
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ blocks */

function CodeBlock({
  title,
  code,
  note,
  produces,
}: {
  title: string;
  code: string;
  note?: string;
  produces?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-editor-border bg-editor-bg shadow-e2">
      <div className="flex items-center gap-2 border-b border-editor-border bg-editor-chrome px-4 py-1">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-editor-err/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-editor-warn/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-editor-ok/80" />
        </span>
        <span className="truncate font-mono text-[11px] uppercase tracking-wide text-editor-ink/70">{title}</span>
        <CopyButton text={code} className="ml-auto text-editor-ink/60 hover:bg-editor-chrome hover:text-editor-ink" />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed text-editor-ink">
        <code className="font-mono">{code}</code>
      </pre>
      {note || produces ? (
        <div className="border-t border-editor-border bg-editor-chrome/60 px-4 py-2.5 text-xs leading-relaxed text-editor-ink/70">
          {produces ? (
            <p>
              <span className="font-semibold text-editor-ok">Produces: </span>
              {produces}
            </p>
          ) : null}
          {note ? (
            <p className={produces ? "mt-1" : ""}>
              <span className="font-semibold text-editor-warn">Notice: </span>
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}

function BlockView({ block, anchorId }: { block: DataVizBlock; anchorId?: string }) {
  switch (block.kind) {
    case "text":
      return (
        <p className="dv-lesson-text">
          <Inline text={block.text} />
        </p>
      );
    case "heading":
      return (
        <h3 id={anchorId} className="dv-lesson-h3 mt-10 flex scroll-mt-24 items-baseline gap-2.5 text-ink">
          <span className="tb-bar self-stretch" aria-hidden />
          <span>{block.text}</span>
        </h3>
      );
    case "chart": {
      const c: ChartSpec = block.chart;
      return (
        <figure className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
          <ChartRenderer spec={c} />
          {block.why ? (
            <figcaption className="mt-2 flex gap-2 rounded-lg bg-surface-subtle px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-text" />
              <span>
                <strong>Why this design: </strong>
                <Inline text={block.why} />
              </span>
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "code":
      return <CodeBlock title={block.title} code={block.code} note={block.note} produces={block.produces} />;
    case "definition":
      return (
        <div className="tb-panel rounded-xl border-l-4 px-4 py-3" style={{ borderLeftColor: "var(--tb-accent)" }}>
          <p className="tb-accent font-serif text-base font-semibold">{block.term}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            <Inline text={block.informal} />
          </p>
          {block.why ? (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
              <Inline text={block.why} />
            </p>
          ) : null}
        </div>
      );
    case "callout": {
      const tones = {
        info: { icon: Info, cls: "border-blue-200 bg-blue-50/70 text-blue-800" },
        warning: { icon: AlertTriangle, cls: "border-danger-border bg-danger-bg/70 text-danger-text" },
        success: { icon: CheckCircle2, cls: "border-success-border bg-success-bg/70 text-success-text" },
      } as const;
      const t = tones[block.tone];
      const Icon = t.icon;
      return (
        <div className={cn("flex gap-3 rounded-xl border px-4 py-3.5", t.cls)}>
          <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">{block.title}</p>
            <p className="mt-1 text-sm leading-relaxed opacity-90">
              <Inline text={block.text} />
            </p>
          </div>
        </div>
      );
    }
    case "table":
      return (
        <figure className="overflow-x-auto rounded-xl border border-border-subtle bg-surface shadow-e1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle">
                {block.headers.map((h, i) => (
                  <th key={i} scope="col" className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-3">
                    {h.trim() ? h : <span className="sr-only">Column {i + 1}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-b-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3.5 py-2 text-ink-2">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption ? (
            <figcaption className="border-t border-border-subtle px-3.5 py-2 text-xs leading-relaxed text-ink-3">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "interpretation":
      return (
        <div className="space-y-3">
          <figure className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
            <ChartRenderer spec={block.chart} />
          </figure>
          <McqPanel
            prompt={block.prompt}
            options={block.options}
            explanation={block.explanation}
            accent="orange"
            icon={Sparkles}
          />
        </div>
      );
    case "exercise":
      return (
        <div className="space-y-3">
          {block.chart ? (
            <figure className="rounded-xl border border-border-subtle bg-surface p-4 shadow-e1">
              <ChartRenderer spec={block.chart} />
            </figure>
          ) : null}
          <McqPanel
            prompt={block.prompt}
            options={block.options}
            explanation={block.explanation}
            accent="teal"
            icon={Target}
          />
        </div>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------- quiz */

function LessonQuiz({ quiz }: { quiz: QuizItem[] }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const q = quiz[idx];
  if (!q) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-subtle/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <ListChecks className="h-4 w-4 text-viz-10" />
          Knowledge check
        </p>
        <p className="text-xs font-semibold text-ink-3">
          {idx + 1} / {quiz.length} · {right} correct
        </p>
      </div>
      <p className="text-sm font-semibold text-ink">
        <Inline text={q.prompt} />
      </p>
      <div className="mt-3 space-y-1.5">
        {q.options.map((o) => {
          const reveal = picked !== null;
          const isPicked = picked === o.text;
          return (
            <button
              key={o.text}
              disabled={reveal}
              onClick={() => {
                setPicked(o.text);
                if (o.correct) setRight((r) => r + 1);
              }}
              className={cn(
                "w-full rounded-lg border px-3.5 py-2 text-left text-sm transition-colors",
                !reveal && "border-border-subtle bg-surface text-ink-2 hover:border-viz-10/60",
                reveal && o.correct && "border-success-text bg-success-bg text-success-text",
                reveal && !o.correct && isPicked && "border-danger-text bg-danger-bg text-danger-text",
                reveal && !o.correct && !isPicked && "border-border-subtle bg-surface opacity-55",
              )}
            >
              <Inline text={o.text} />
              {reveal && isPicked ? (
                <span className="mt-1 block text-xs leading-relaxed text-ink-2">{o.feedback}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {picked ? (
        <div className="mt-3">
          <p className="rounded-lg bg-surface px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
            <strong>Why: </strong>
            <Inline text={q.explanation} />
          </p>
          <button
            onClick={() => {
              setIdx((i) => (i + 1) % quiz.length);
              setPicked(null);
            }}
            className="mt-2.5 rounded-full bg-viz-10 px-4 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-viz-10/85"
          >
            {idx + 1 < quiz.length ? "Next question →" : "Back to start ↺"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ reader */

export function DataVizLessonView({
  course,
  slug,
  navigate,
}: {
  course: DataVizCourse;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const all = allDataVizLessons(course);
  const ref = all.find((r) => r.lesson.slug === slug);
  const done = useVizProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useVizProgress((s) => s.markLesson);
  const lessonsDone = useVizProgress((s) => s.lessonsDone);
  const bookmarks = useReaderPrefs((s) => s.bookmarks);

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <p className="text-sm text-ink-3">Lesson {slug} not found.</p>
        <button onClick={() => navigate("#/viz")} className="mt-3 text-sm font-semibold text-viz-10">
          ← Back to the course
        </button>
      </div>
    );
  }
  const { lesson } = ref;
  const { prev, next } = neighborDataVizLesson(course, slug);
  const lessonNumber = all.findIndex((r) => r.lesson.slug === slug) + 1;
  const doneCount = all.filter((r) => lessonsDone[r.lesson.slug]).length;

  // ---- left rail: part → module → chapter → lesson (the richest tree)
  const nodes: OutlineNode[] = course.parts.map((p) => ({
    kind: "group",
    id: p.letter,
    label: p.letter,
    title: p.title,
    children: p.modules.map((m) => ({
      kind: "group" as const,
      id: `${p.letter}-${m.title}`,
      title: m.title,
      children: m.chapters.map((ch) => ({
        kind: "group" as const,
        id: `${p.letter}-${m.title}-${ch.title}`,
        title: ch.title,
        children: ch.lessons.map((l) => ({
          kind: "lesson" as const,
          slug: l.slug,
          title: l.title,
          minutes: l.minutes,
          href: `#/viz/lesson/${l.slug}`,
          done: !!lessonsDone[l.slug],
          current: l.slug === slug,
          bookmarked: !!bookmarks[noteKey(COURSE_KEY, l.slug)],
        })),
      })),
    })),
  }));

  const bookmarkedLessons = all
    .filter((r) => bookmarks[noteKey(COURSE_KEY, r.lesson.slug)])
    .map((r) => ({ slug: r.lesson.slug, title: r.lesson.title, href: `#/viz/lesson/${r.lesson.slug}` }));

  // ---- right rail
  const toc: RailTocItem[] = [
    { id: "sec-objectives", title: "By the end of this lesson" },
    { id: "sec-why", title: "Why this matters" },
    ...lesson.blocks
      .map((b, i): RailTocItem | null => (b.kind === "heading" ? { id: `blk-${i}`, title: b.text } : null))
      .filter((t): t is RailTocItem => t !== null),
    ...(lesson.terms && lesson.terms.length > 0 ? [{ id: "sec-terms", title: "Important terminology" }] : []),
    { id: "sec-takeaways", title: "Carry these forward" },
    { id: "sec-quiz", title: "Knowledge check" },
  ];

  // related: same part first, then same tool, then shared terms
  const related: RailRelated[] = all
    .filter((r) => r.lesson.slug !== slug)
    .map((r) => ({
      r,
      score:
        (r.partLetter === ref.partLetter ? 10 : 0) +
        (lesson.tool && r.lesson.tool === lesson.tool ? 5 : 0) +
        (lesson.terms ?? []).filter((t) =>
          (r.lesson.terms ?? []).some((rt) => rt.term.toLowerCase() === t.term.toLowerCase()),
        ).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ r }) => ({
      title: r.lesson.title,
      sub: `${r.partLetter} · ${r.chapterTitle}`,
      href: `#/viz/lesson/${r.lesson.slug}`,
    }));

  const goPrev = prev ? () => navigate(`#/viz/lesson/${prev.lesson.slug}`) : undefined;
  const goNext = next ? () => navigate(`#/viz/lesson/${next.lesson.slug}`) : undefined;

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
          schoolLabel="School H · Data Viz & BI"
          schoolSub={course.title}
          readingLabel={`${ref.partTitle} — ${ref.moduleTitle}`}
          doneCount={doneCount}
          total={all.length}
          nodes={nodes}
          navigate={navigate}
          bookmarks={bookmarkedLessons}
          onSchool={() => navigate("#/school/data-visualization-bi")}
        />
      }
      right={
        <ReaderRail
          key={slug}
          toc={toc}
          concepts={lesson.objectives}
          terms={lesson.terms}
          related={related}
          tutorPrompts={[
            `Explain the key idea of "${lesson.title}" in simpler terms`,
            "Critique my chart: what would you change and why?",
            "Quiz me on choosing the right chart type",
          ]}
          onOpenTutor={() => navigate("#/tutor")}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "School H · Data Viz & BI", onClick: () => navigate("#/school/data-visualization-bi") },
          { label: course.title, onClick: () => navigate("#/viz") },
          { label: `Part ${ref.partLetter} · ${ref.partTitle}`, onClick: () => navigate(`#/viz/part/${ref.partLetter}`) },
          { label: lesson.title },
        ]}
      />

      <MetaRow>
        <MetaChip tone="accent">{lesson.slug.toUpperCase()}</MetaChip>
        {lesson.tool ? <MetaChip>{lesson.tool}</MetaChip> : null}
        <MinutesChip minutes={lesson.minutes} />
        <MetaChip>
          Lesson {lessonNumber} of {all.length}
        </MetaChip>
        {done && (
          <MetaChip tone="success" icon={CheckCircle2}>
            completed
          </MetaChip>
        )}
      </MetaRow>

      <TitleBlock title={lesson.title} summaryNode={<Inline text={lesson.summary} />} />

      <ObjectivesCard
        id="sec-objectives"
        objectives={lesson.objectives}
        label="By the end of this lesson you can"
        render={(t) => <Inline text={t} />}
      />

      <WhyPanel id="sec-why">
        <Inline text={lesson.why} />
      </WhyPanel>

      {/* teaching blocks */}
      <div className="mt-9 space-y-6">
        {lesson.blocks.map((b, i) => (
          <BlockView key={i} block={b} anchorId={b.kind === "heading" ? `blk-${i}` : undefined} />
        ))}
      </div>

      {lesson.terms && lesson.terms.length > 0 ? (
        <TermsSection id="sec-terms" terms={lesson.terms} />
      ) : null}

      <TakeawaysSection
        id="sec-takeaways"
        title="Carry these forward"
        takeaways={lesson.takeaways}
        render={(t) => <Inline text={t} />}
      />

      {lesson.quiz.length ? (
        <section id="sec-quiz" className="mt-12 scroll-mt-24">
          <SectionHeading icon={ListChecks}>Knowledge check</SectionHeading>
          <div className="mt-4">
            <LessonQuiz quiz={lesson.quiz} />
          </div>
        </section>
      ) : null}

      <LessonFooterNav
        complete={{ done, onToggle: () => markLesson(slug, !done) }}
        prev={prev ? { title: prev.lesson.title, onClick: () => navigate(`#/viz/lesson/${prev.lesson.slug}`) } : null}
        next={
          next
            ? {
                title: next.lesson.title,
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/viz/lesson/${next.lesson.slug}`);
                },
              }
            : {
                title: "To the Playground",
                label: "Finish",
                onClick: () => {
                  markLesson(slug, true);
                  navigate("#/viz/playground");
                },
              }
        }
        colophon={
          <>
            Lesson {lessonNumber} of {all.length} · {ref.partTitle} — {ref.moduleTitle}
          </>
        }
      />
    </TextbookShell>
  );
}
