"use client";

/**
 * SqlLessonView — the SQL course's digital-textbook reader.
 *
 * Authored content (objectives, motivation, blocks, terminology,
 * mistakes, takeaways, knowledge check) renders unchanged inside the
 * shared textbook shell, with the course's database-explorer link kept
 * as a first-class chip in the meta row.
 */
import { CheckCircle2, Database, ListChecks } from "lucide-react";
import type { SqlCourse, LessonRef } from "@/lib/sqlcourse/types";
import { allLessons, findLesson, neighborLesson } from "@/lib/sqlcourse/types";
import { useSqlProgress } from "@/lib/sqlcourse/progress";
import { datasetName } from "@/content/sql/datasets";
import { noteKey, useReaderPrefs } from "@/components/textbook/prefs";
import { TextbookShell } from "@/components/textbook/shell";
import { OutlineTree, type OutlineNode } from "@/components/textbook/outline";
import { ReaderRail, type RailRelated, type RailTocItem } from "@/components/textbook/rail";
import {
  Breadcrumbs,
  LessonFooterNav,
  MetaChip,
  MetaRow,
  MinutesChip,
  MistakesSection,
  ObjectivesCard,
  SectionHeading,
  TakeawaysSection,
  TermsSection,
  TitleBlock,
  WhyPanel,
} from "@/components/textbook/chrome";
import { BlocksList, InlineText } from "./blocks";
import { SqlQuizCard } from "./quiz";

const COURSE_KEY = "sql";
const ACCENT = "var(--dv-viz-7)";

export function SqlLessonView({
  course,
  slug,
  navigate,
}: {
  course: SqlCourse;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const done = useSqlProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useSqlProgress((s) => s.markLesson);
  const lessonsDone = useSqlProgress((s) => s.lessonsDone);
  const bookmarks = useReaderPrefs((s) => s.bookmarks);

  let ref: LessonRef | null = findLesson(course, slug);

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-ink">Lesson not found</p>
        <button
          onClick={() => navigate("#/sql")}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Back to the SQL course
        </button>
      </div>
    );
  }

  const { lesson, part } = ref;
  const flat = allLessons(course);
  const prev = neighborLesson(course, slug, -1);
  const next = neighborLesson(course, slug, 1);
  const lessonNumber = flat.findIndex((l) => l.lesson.slug === slug) + 1;
  const total = flat.length;
  const doneCount = flat.filter((l) => lessonsDone[l.lesson.slug]).length;

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
      href: `#/sql/lesson/${l.slug}`,
      done: !!lessonsDone[l.slug],
      current: l.slug === slug,
      bookmarked: !!bookmarks[noteKey(COURSE_KEY, l.slug)],
    })),
  }));

  const bookmarkedLessons = flat
    .filter((l) => bookmarks[noteKey(COURSE_KEY, l.lesson.slug)])
    .map((l) => ({ slug: l.lesson.slug, title: l.lesson.title, href: `#/sql/lesson/${l.lesson.slug}` }));

  // ---- right rail
  const toc: RailTocItem[] = [
    { id: "sec-objectives", title: "By the end you can" },
    { id: "sec-why", title: "Why this matters" },
    ...lesson.blocks
      .map((b, i): RailTocItem | null => (b.kind === "heading" ? { id: `blk-${i}`, title: b.text } : null))
      .filter((t): t is RailTocItem => t !== null),
    { id: "sec-terms", title: "Terms introduced here" },
    { id: "sec-mistakes", title: "Common beginner mistakes" },
    { id: "sec-takeaways", title: "Takeaways" },
    { id: "sec-quiz", title: "Knowledge check" },
  ];

  const termSet = new Set(lesson.terms.map((t) => t.term.toLowerCase()));
  const related: RailRelated[] = flat
    .filter((l) => l.lesson.slug !== slug)
    .map((l) => ({
      l,
      score:
        (l.part.letter === part.letter ? 10 : 0) +
        l.lesson.terms.filter((t) => termSet.has(t.term.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ l }) => ({
      title: l.lesson.title,
      sub: `Part ${l.part.letter} · ${l.lesson.slug}`,
      href: `#/sql/lesson/${l.lesson.slug}`,
    }));

  const goPrev = prev ? () => navigate(`#/sql/lesson/${prev.lesson.slug}`) : undefined;
  const goNext = next
    ? () => {
        markLesson(slug, true);
        navigate(`#/sql/lesson/${next.lesson.slug}`);
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
          schoolLabel="School A · Programming"
          schoolSub={course.title}
          readingLabel={`Part ${part.letter} — ${part.title}`}
          doneCount={doneCount}
          total={total}
          nodes={nodes}
          navigate={navigate}
          bookmarks={bookmarkedLessons}
          onSchool={() => navigate("#/school/programming")}
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
            lesson.terms.length > 0
              ? `Quiz me on: ${lesson.terms.slice(0, 2).map((t) => t.term).join(", ")}`
              : `Quiz me on "${lesson.title}"`,
            "Help me write this lesson's query, step by step",
          ]}
          onOpenTutor={() => navigate("#/tutor")}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "School A · Programming", onClick: () => navigate("#/school/programming") },
          { label: course.title, onClick: () => navigate("#/sql") },
          { label: `Part ${part.letter} — ${part.title}`, onClick: () => navigate(`#/sql/part/${part.letter}`) },
          { label: lesson.title },
        ]}
      />

      <MetaRow>
        <MetaChip tone="accent">{lesson.slug.toUpperCase()}</MetaChip>
        <MinutesChip minutes={lesson.minutes} />
        <MetaChip>
          Lesson {lessonNumber} of {total}
        </MetaChip>
        {lesson.dataset && (
          <button
            type="button"
            onClick={() => navigate(`#/sql/lab?db=${lesson.dataset}`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-0.5 text-[11px] font-medium text-ink-3 transition-colors hover:text-ink"
          >
            <Database className="h-3 w-3" />
            explore the {datasetName(lesson.dataset)} database
          </button>
        )}
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
        label="By the end you can"
        render={(t) => <InlineText text={t} />}
      />

      <WhyPanel id="sec-why">
        <InlineText text={lesson.why} />
      </WhyPanel>

      {/* teaching blocks */}
      <div className="mt-9">
        <BlocksList blocks={lesson.blocks} />
      </div>

      <TermsSection id="sec-terms" terms={lesson.terms} />

      <MistakesSection
        id="sec-mistakes"
        title="Common beginner mistakes"
        mistakes={lesson.mistakes}
        render={(t) => <InlineText text={t} />}
      />

      <TakeawaysSection id="sec-takeaways" title="Takeaways" takeaways={lesson.takeaways} render={(t) => <InlineText text={t} />} />

      <section id="sec-quiz" className="mt-12 scroll-mt-24">
        <SectionHeading icon={ListChecks}>Knowledge check</SectionHeading>
        <div className="mt-4">
          <SqlQuizCard questions={lesson.quiz} storagePrefix={lesson.slug} />
        </div>
      </section>

      <LessonFooterNav
        complete={{ done, onToggle: () => markLesson(slug, !done) }}
        prev={prev ? { title: prev.lesson.title, onClick: () => navigate(`#/sql/lesson/${prev.lesson.slug}`) } : null}
        next={
          next
            ? {
                title: next.lesson.title,
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/sql/lesson/${next.lesson.slug}`);
                },
              }
            : {
                title: `Finish Part ${part.letter}`,
                label: "Finish",
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/sql/part/${part.letter}`);
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
