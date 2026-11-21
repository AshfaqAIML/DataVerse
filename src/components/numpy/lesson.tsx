"use client";

/**
 * NumpyLessonView — the NumPy course's digital-textbook reader.
 *
 * Authored content (objectives, motivation, blocks with function
 * reference cards and array visualizations, terminology, mistakes,
 * takeaways, knowledge check) renders unchanged inside the shared
 * textbook shell.
 */
import { CheckCircle2, ListChecks } from "lucide-react";
import type { NumpyCourse } from "@/lib/numpycourse/types";
import { allNumpyLessons, neighborNumpyLesson } from "@/lib/numpycourse/types";
import { useNumpyProgress } from "@/lib/numpycourse/progress";
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
import { InlineText } from "@/components/course/blocks";
import { NumpyBlocksList } from "./blocks";
import { NumpyQuizCard } from "./quiz";

const COURSE_KEY = "numpy";
const ACCENT = "var(--dv-viz-5)";

export function NumpyLessonView({
  course,
  slug,
  navigate,
}: {
  course: NumpyCourse;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const ref = allNumpyLessons(course).find((l) => l.lesson.slug === slug);
  const done = useNumpyProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useNumpyProgress((s) => s.markLesson);
  const lessonsDone = useNumpyProgress((s) => s.lessonsDone);
  const bookmarks = useReaderPrefs((s) => s.bookmarks);

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-ink">Lesson not found</p>
        <button
          onClick={() => navigate("#/numpy")}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Back to the NumPy course
        </button>
      </div>
    );
  }

  const { lesson, part } = ref;
  const flat = allNumpyLessons(course);
  const prev = neighborNumpyLesson(course, slug, -1);
  const next = neighborNumpyLesson(course, slug, 1);
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
      href: `#/numpy/lesson/${l.slug}`,
      done: !!lessonsDone[l.slug],
      current: l.slug === slug,
      bookmarked: !!bookmarks[noteKey(COURSE_KEY, l.slug)],
    })),
  }));

  const bookmarkedLessons = flat
    .filter((l) => bookmarks[noteKey(COURSE_KEY, l.lesson.slug)])
    .map((l) => ({ slug: l.lesson.slug, title: l.lesson.title, href: `#/numpy/lesson/${l.lesson.slug}` }));

  // ---- right rail
  const toc: RailTocItem[] = [
    { id: "sec-objectives", title: "What you will learn" },
    { id: "sec-why", title: "Why this matters" },
    ...lesson.blocks
      .map((b, i): RailTocItem | null => (b.kind === "heading" ? { id: `blk-${i}`, title: b.text } : null))
      .filter((t): t is RailTocItem => t !== null),
    { id: "sec-terms", title: "Important terminology" },
    { id: "sec-mistakes", title: "Common mistakes" },
    { id: "sec-takeaways", title: "Key takeaways" },
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
      href: `#/numpy/lesson/${l.lesson.slug}`,
    }));

  const goPrev = prev ? () => navigate(`#/numpy/lesson/${prev.lesson.slug}`) : undefined;
  const goNext = next
    ? () => {
        markLesson(slug, true);
        navigate(`#/numpy/lesson/${next.lesson.slug}`);
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
          schoolLabel="School E · Python Libraries"
          schoolSub={course.title}
          readingLabel={`Part ${part.letter} — ${part.title}`}
          doneCount={doneCount}
          total={total}
          nodes={nodes}
          navigate={navigate}
          bookmarks={bookmarkedLessons}
          onSchool={() => navigate("#/school/python-libraries")}
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
            "Show me a NumPy example that uses this lesson's functions",
          ]}
          onOpenTutor={() => navigate("#/tutor")}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "School E · Python Libraries", onClick: () => navigate("#/school/python-libraries") },
          { label: course.title, onClick: () => navigate("#/numpy") },
          { label: `Part ${part.letter} — ${part.title}`, onClick: () => navigate(`#/numpy/part/${part.letter}`) },
          { label: lesson.title },
        ]}
      />

      <MetaRow>
        <MetaChip tone="accent">{lesson.slug.toUpperCase()}</MetaChip>
        <MinutesChip minutes={lesson.minutes} />
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
        label="What you will learn"
        render={(t) => <InlineText text={t} />}
      />

      <WhyPanel id="sec-why">
        <InlineText text={lesson.why} />
      </WhyPanel>

      {/* teaching blocks */}
      <div className="mt-9">
        <NumpyBlocksList blocks={lesson.blocks} />
      </div>

      <TermsSection id="sec-terms" terms={lesson.terms} />

      <MistakesSection id="sec-mistakes" mistakes={lesson.mistakes} render={(t) => <InlineText text={t} />} />

      <TakeawaysSection id="sec-takeaways" takeaways={lesson.takeaways} render={(t) => <InlineText text={t} />} />

      <section id="sec-quiz" className="mt-12 scroll-mt-24">
        <SectionHeading icon={ListChecks}>Knowledge check</SectionHeading>
        <div className="mt-4">
          <NumpyQuizCard questions={lesson.quiz} storagePrefix={lesson.slug} />
        </div>
      </section>

      <LessonFooterNav
        complete={{ done, onToggle: () => markLesson(slug, !done) }}
        prev={
          prev ? { title: prev.lesson.title, onClick: () => navigate(`#/numpy/lesson/${prev.lesson.slug}`) } : null
        }
        next={
          next
            ? {
                title: next.lesson.title,
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/numpy/lesson/${next.lesson.slug}`);
                },
              }
            : {
                title: "Finish the course",
                label: "Finish",
                onClick: () => {
                  markLesson(slug, true);
                  navigate("#/numpy");
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
