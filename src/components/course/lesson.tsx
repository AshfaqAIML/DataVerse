"use client";

/**
 * LessonView — the Python course's digital-textbook reader.
 *
 * The lesson's authored structure is rendered unchanged — objectives,
 * motivation, teaching blocks, terminology, common mistakes, key
 * takeaways, knowledge check — inside the shared textbook shell:
 * course outline on the left, tools rail on the right, adjustable
 * reading measure, keyboard page-turns, bookmarks and notes.
 */
import { CheckCircle2, ListChecks } from "lucide-react";
import type { Course } from "@/lib/course/types";
import { allLessons, neighborLesson } from "@/lib/course/types";
import { useCourseProgress } from "@/lib/course/progress";
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
import { QuizCard } from "./quiz";

const COURSE_KEY = "python";
const ACCENT = "var(--dv-viz-1)";

export function LessonView({
  course,
  slug,
  navigate,
}: {
  course: Course;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const ref = allLessons(course).find((l) => l.lesson.slug === slug);
  const done = useCourseProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useCourseProgress((s) => s.markLesson);
  const lessonsDone = useCourseProgress((s) => s.lessonsDone);
  const bookmarks = useReaderPrefs((s) => s.bookmarks);

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-ink">Lesson not found</p>
        <button
          onClick={() => navigate("#/course")}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Back to the course home
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

  // ---- left rail: the whole course as a part → lesson tree
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
      href: `#/lesson/${l.slug}`,
      done: !!lessonsDone[l.slug],
      current: l.slug === slug,
      bookmarked: !!bookmarks[noteKey(COURSE_KEY, l.slug)],
    })),
  }));

  const bookmarkedLessons = flat
    .filter((l) => bookmarks[noteKey(COURSE_KEY, l.lesson.slug)])
    .map((l) => ({ slug: l.lesson.slug, title: l.lesson.title, href: `#/lesson/${l.lesson.slug}` }));

  // ---- right rail: the table of contents follows the lesson's real shape
  const toc: RailTocItem[] = [
    { id: "sec-objectives", title: "Learning objectives" },
    { id: "sec-why", title: "Why this matters" },
    ...lesson.blocks
      .map((b, i): RailTocItem | null => (b.kind === "heading" ? { id: `blk-${i}`, title: b.text } : null))
      .filter((t): t is RailTocItem => t !== null),
    { id: "sec-terms", title: "Important terminology" },
    { id: "sec-mistakes", title: "Common mistakes" },
    { id: "sec-takeaways", title: "Key takeaways" },
    { id: "sec-quiz", title: "Knowledge check" },
  ];

  // ---- related lessons: same part first, then shared vocabulary
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
      href: `#/lesson/${l.lesson.slug}`,
    }));

  const goPrev = prev ? () => navigate(`#/lesson/${prev.lesson.slug}`) : undefined;
  const goNext = next
    ? () => {
        markLesson(slug, true);
        navigate(`#/lesson/${next.lesson.slug}`);
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
            "Walk me through this lesson's code, line by line",
          ]}
          onOpenTutor={() => navigate("#/tutor")}
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "School A · Programming", onClick: () => navigate("#/school/programming") },
          { label: course.title, onClick: () => navigate("#/course") },
          { label: `Part ${part.letter} — ${part.title}`, onClick: () => navigate(`#/part/${part.letter}`) },
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

      <TitleBlock
        title={lesson.title}
        summaryNode={<InlineText text={lesson.summary} />}
      />

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
        <BlocksList blocks={lesson.blocks} />
      </div>

      <TermsSection id="sec-terms" terms={lesson.terms} />

      <MistakesSection id="sec-mistakes" mistakes={lesson.mistakes} render={(t) => <InlineText text={t} />} />

      <TakeawaysSection id="sec-takeaways" takeaways={lesson.takeaways} render={(t) => <InlineText text={t} />} />

      <section id="sec-quiz" className="mt-12 scroll-mt-24">
        <SectionHeading icon={ListChecks}>Knowledge check</SectionHeading>
        <div className="mt-4">
          <QuizCard questions={lesson.quiz} storagePrefix={lesson.slug} />
        </div>
      </section>

      <LessonFooterNav
        complete={{ done, onToggle: () => markLesson(slug, !done) }}
        prev={prev ? { title: prev.lesson.title, onClick: () => navigate(`#/lesson/${prev.lesson.slug}`) } : null}
        next={
          next
            ? {
                title: next.lesson.title,
                onClick: () => {
                  markLesson(slug, true);
                  navigate(`#/lesson/${next.lesson.slug}`);
                },
              }
            : {
                title: "Back to the course home",
                label: "Finish",
                onClick: () => {
                  markLesson(slug, true);
                  navigate("#/course");
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
