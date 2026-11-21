"use client";

/**
 * ClassicalLessonView — the three-pane digital-textbook reader.
 *
 *   ┌────────────┬──────────────────────────────┬────────────┐
 *   │ LEFT       │ CENTER                       │ RIGHT      │
 *   │ school     │ breadcrumbs                  │ contents   │
 *   │ course     │ title · objectives           │ progress   │
 *   │ parts ▾    │ the lesson's blocks          │ concepts   │
 *   │  modules ▾ │ terms · mistakes             │ related    │
 *   │   chapters │ takeaways · knowledge check  │ notes      │
 *   │    lessons │ prev / next                  │ AI tutor   │
 *   └────────────┴──────────────────────────────┴────────────┘
 *
 * Reading experience: adjustable content width, book marks, personal
 * notes, scroll-linked reading progress, active-section table of
 * contents, and responsive drawers for both sidebars on small screens.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  GraduationCap,
  Lightbulb,
  ListTree,
  MessagesSquare,
  NotebookPen,
  PanelLeft,
  PanelRight,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollIntoViewSafe } from "@/lib/focus-trap";
import type { ClassicalCourse, ClassicalLessonRef } from "@/lib/classicalai/types";
import {
  allClassicalLessons,
  neighborClassicalLesson,
} from "@/lib/classicalai/types";
import { useClassicalProgress, type ContentWidth } from "@/lib/classicalai/progress";
import { InlineText } from "@/components/course/blocks";
import { ClassicalBlocksList, lessonSections } from "./blocks";
import { ClassicalQuiz } from "./quiz";

/* ------------------------------------------------------------ left sidebar */

function LeftSidebar({
  course,
  currentSlug,
  navigate,
  onNavigate,
  bookmarks,
}: {
  course: ClassicalCourse;
  currentSlug: string;
  navigate: (hash: string) => void;
  onNavigate?: () => void;
  bookmarks: Record<string, true>;
}) {
  const lessonsDone = useClassicalProgress((s) => s.lessonsDone);
  const flat = useMemo(() => allClassicalLessons(course), [course]);
  const doneSet = lessonsDone;

  // auto-expand the current part/module/chapter; everything else collapsed
  const current = flat.find((l) => l.lesson.slug === currentSlug);
  // Initialized from the current lesson (the component is keyed by slug at
  // both usage sites, so navigation remounts it with the right tree open).
  const [openPart, setOpenPart] = useState<string | null>(current?.part.letter ?? null);
  const [openModule, setOpenModule] = useState<string | null>(current?.module.title ?? null);
  const [openChapter, setOpenChapter] = useState<string | null>(current?.chapter.title ?? null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const bookmarked = flat.filter((l) => bookmarks[l.lesson.slug]);

  const go = (slug: string) => {
    navigate(`#/classical/lesson/${slug}`);
    onNavigate?.();
  };

  return (
    <nav aria-label="Course contents" className="flex h-full min-h-0 flex-col">
      {/* school + course identity */}
      <div className="border-b border-border-subtle px-4 pb-3.5 pt-1">
        <button
          type="button"
          onClick={() => navigate("#/school/classical-ai")}
          className="group flex w-full items-center gap-2.5 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)]">
            <GraduationCap className="h-4 w-4 text-viz-3" />
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-semibold leading-tight text-ink group-hover:text-primary">
              School J · Classical AI
            </span>
            <span className="block text-[11px] leading-tight text-ink-3">Classical Artificial Intelligence</span>
          </span>
        </button>
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface-subtle/50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Reading now</p>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-ink-2">{current?.part.title}</p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-ink-3">
            <span className="tabular">
              {flat.filter((l) => doneSet[l.lesson.slug]).length}/{flat.length} lessons complete
            </span>
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-inset">
            <div
              className="h-full rounded-full bg-viz-3 transition-all duration-500"
              style={{ width: `${(flat.filter((l) => doneSet[l.lesson.slug]).length / flat.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* the tree */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {course.parts.map((part) => {
          const partLessons = part.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons));
          const partDone = partLessons.filter((l) => doneSet[l.slug]).length;
          const partOpen = openPart === part.letter;
          return (
            <div key={part.letter} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenPart(partOpen ? null : part.letter)}
                className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-subtle/70"
                aria-expanded={partOpen}
              >
                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform", partOpen && "rotate-90")} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold text-ink">
                    <span className="mr-1.5 font-mono text-[11px] font-bold text-viz-3">{part.letter}</span>
                    {part.title}
                  </span>
                  <span className="tabular block text-[11px] text-ink-3">
                    {partDone}/{partLessons.length} lessons
                  </span>
                </span>
                {partDone === partLessons.length && partLessons.length > 0 && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-text" />
                )}
              </button>
              {partOpen && (
                <div className="ml-[13px] border-l border-border-subtle pl-2">
                  {part.modules.map((mod) => {
                    const modLessons = mod.chapters.flatMap((c) => c.lessons);
                    const modDone = modLessons.filter((l) => doneSet[l.slug]).length;
                    const modOpen = openModule === mod.title;
                    return (
                      <div key={mod.title} className="mb-0.5">
                        <button
                          type="button"
                          onClick={() => setOpenModule(modOpen ? null : mod.title)}
                          className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-subtle/70"
                          aria-expanded={modOpen}
                        >
                          <ChevronRight className={cn("h-3 w-3 shrink-0 text-ink-3 transition-transform", modOpen && "rotate-90")} />
                          <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink-2">{mod.title}</span>
                          <span className="tabular shrink-0 font-mono text-[9.5px] text-ink-3">
                            {modDone}/{modLessons.length}
                          </span>
                        </button>
                        {modOpen && (
                          <div className="ml-[11px] border-l border-border-subtle pl-2">
                            {mod.chapters.map((ch) => {
                              const chDone = ch.lessons.filter((l) => doneSet[l.slug]).length;
                              const chOpen = openChapter === ch.title;
                              const chCurrent = current?.chapter.title === ch.title;
                              return (
                                <div key={ch.title} className="mb-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setOpenChapter(chOpen ? null : ch.title)}
                                    className={cn(
                                      "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-subtle/70",
                                      chCurrent && "bg-surface-subtle"
                                    )}
                                    aria-expanded={chOpen}
                                  >
                                    <ChevronRight className={cn("h-3 w-3 shrink-0 text-ink-3 transition-transform", chOpen && "rotate-90")} />
                                    <span className="min-w-0 flex-1 truncate text-[11px] text-ink-2">{ch.title}</span>
                                    <span className="tabular shrink-0 font-mono text-[9px] text-ink-3">
                                      {chDone}/{ch.lessons.length}
                                    </span>
                                  </button>
                                  {chOpen && (
                                    <div className="ml-[11px] border-l border-border-subtle pl-1.5">
                                      {ch.lessons.map((lesson) => {
                                        const done = !!doneSet[lesson.slug];
                                        const active = lesson.slug === currentSlug;
                                        return (
                                          <button
                                            key={lesson.slug}
                                            type="button"
                                            onClick={() => go(lesson.slug)}
                                            className={cn(
                                              "group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                                              active ? "bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]" : "hover:bg-surface-subtle/70"
                                            )}
                                          >
                                            {done ? (
                                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-text" />
                                            ) : (
                                              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-border-strong" />
                                            )}
                                            <span className="min-w-0 flex-1">
                                              <span
                                                className={cn(
                                                  "block text-[11.5px] leading-snug",
                                                  active ? "font-semibold text-ink" : "text-ink-2 group-hover:text-ink"
                                                )}
                                              >
                                                {lesson.title}
                                              </span>
                                              <span className="tabular block font-mono text-[9px] text-ink-3">
                                                {lesson.slug} · {lesson.minutes} min
                                              </span>
                                            </span>
                                            {bookmarks[lesson.slug] && <Bookmark className="h-3 w-3 shrink-0 text-viz-3" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* bookmarks */}
      {bookmarked.length > 0 && (
        <div className="border-t border-border-subtle px-2 py-2">
          <button
            type="button"
            onClick={() => setShowBookmarks((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
          >
            <Bookmark className="h-3.5 w-3.5 text-viz-3" />
            <span className="text-[11.5px] font-medium text-ink-2">Bookmarks</span>
            <span className="tabular ml-auto font-mono text-[11px] text-ink-3">{bookmarked.length}</span>
            <ChevronDown className={cn("h-3 w-3 text-ink-3 transition-transform", showBookmarks && "rotate-180")} />
          </button>
          {showBookmarks && (
            <div className="mt-1 space-y-0.5 border-l border-border-subtle pl-2">
              {bookmarked.map((l) => (
                <button
                  key={l.lesson.slug}
                  type="button"
                  onClick={() => go(l.lesson.slug)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
                >
                  <Bookmark className="h-3 w-3 shrink-0 text-viz-3" />
                  <span className="min-w-0 truncate text-[11px] text-ink-2">{l.lesson.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ----------------------------------------------------------- right sidebar */

function RightSidebar({
  ref_,
  course,
  progressRatio,
  navigate,
}: {
  ref_: ClassicalLessonRef;
  course: ClassicalCourse;
  progressRatio: number;
  navigate: (hash: string) => void;
}) {
  const { lesson } = ref_;
  const sections = useMemo(() => lessonSections(lesson.blocks), [lesson]);
  const note = useClassicalProgress((s) => s.notes[lesson.slug]);
  const saveNote = useClassicalProgress((s) => s.saveNote);
  const [noteDraft, setNoteDraft] = useState(note?.text ?? "");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // noteDraft resets on lesson change via the key={...} on the sidebar instance

  // active-section tracking
  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // related lessons: same part first, then shared terms across parts
  const related = useMemo(() => {
    const flat = allClassicalLessons(course).filter((l) => l.lesson.slug !== lesson.slug);
    const terms = new Set(lesson.terms.map((t) => t.term.toLowerCase()));
    const score = (l: (typeof flat)[number]) => {
      const shared = l.lesson.terms.filter((t) => terms.has(t.term.toLowerCase())).length;
      return (l.part.letter === ref_.part.letter ? 10 : 0) + shared;
    };
    return flat
      .map((l) => ({ l, s: score(l) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map(({ l }) => l);
  }, [course, lesson, ref_.part.letter]);

  const onNoteChange = (v: string) => {
    setNoteDraft(v);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveNote(lesson.slug, v);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }, 600);
  };

  return (
    <aside aria-label="Lesson tools" className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto px-5 py-4">
      {/* on this page */}
      {sections.length > 0 && (
        <div>
          <p className="dv-kicker mb-2 flex items-center gap-1.5">
            <ListTree className="h-3.5 w-3.5 text-viz-3" /> On this page
          </p>
          <ul className="space-y-0.5 border-l border-border-subtle">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(s.id);
                    if (el) scrollIntoViewSafe(el, { block: "start" });
                  }}
                  className={cn(
                    "-ml-px block border-l-2 py-1 pl-3 text-[12px] leading-snug transition-colors",
                    activeSection === s.id
                      ? "border-viz-3 font-medium text-ink"
                      : "border-transparent text-ink-3 hover:text-ink"
                  )}
                >
                  {s.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* reading progress */}
      <div>
        <p className="dv-kicker mb-2">This lesson · reading progress</p>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
            <div className="h-full rounded-full bg-viz-3 transition-[width] duration-300" style={{ width: `${Math.round(progressRatio * 100)}%` }} />
          </div>
          <span className="tabular font-mono text-[11px] text-ink-3">{Math.round(progressRatio * 100)}%</span>
        </div>
      </div>

      {/* concepts + terminology */}
      <div>
        <p className="dv-kicker mb-2 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-viz-3" /> Terminology
        </p>
        <dl className="space-y-2.5">
          {lesson.terms.map((t) => (
            <div key={t.term} className="rounded-lg border border-border-subtle bg-surface px-3 py-2">
              <dt className="font-mono text-[11.5px] font-semibold text-viz-3">{t.term}</dt>
              <dd className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{t.definition}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* related lessons */}
      {related.length > 0 && (
        <div>
          <p className="dv-kicker mb-2">Related lessons</p>
          <ul className="space-y-1">
            {related.map((l) => (
              <li key={l.lesson.slug}>
                <button
                  type="button"
                  onClick={() => navigate(`#/classical/lesson/${l.lesson.slug}`)}
                  className="group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
                >
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium leading-snug text-ink-2 group-hover:text-primary">
                      {l.lesson.title}
                    </span>
                    <span className="block font-mono text-[9.5px] text-ink-3">{l.part.letter} · {l.chapter.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* personal notes */}
      <div>
        <p className="dv-kicker mb-2 flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5 text-viz-3" /> My notes
          {saved && <span className="font-mono text-[9px] font-normal text-success-text">saved ✓</span>}
        </p>
        <textarea
          value={noteDraft}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Write what you want to remember — notes stay on this device, attached to this lesson."
          className="min-h-[110px] w-full resize-y rounded-lg border border-border-subtle bg-surface-inset px-3 py-2.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-viz-3/50 focus:outline-none"
        />
      </div>

      {/* AI tutor */}
      <div className="rounded-xl border border-viz-3/25 bg-[color-mix(in_srgb,var(--dv-viz-3)_6%,var(--dv-surface))] px-3.5 py-3">
        <p className="dv-kicker flex items-center gap-1.5 text-viz-3">
          <MessagesSquare className="h-3.5 w-3.5" /> Ada, your AI tutor
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
          Stuck on this lesson? Ada can walk you through it, Socratically.
        </p>
        <ul className="mt-2 space-y-1">
          {[
            `Explain the key idea of "${lesson.title}" in simpler terms`,
            `Quiz me on: ${lesson.terms.slice(0, 2).map((t) => t.term).join(", ")}`,
            "I think I found a mistake in my trace — help me check it",
          ].map((p, i) => (
            <li key={i} className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 font-mono text-[11px] leading-snug text-ink-2">
              {p}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => navigate("#/tutor")}
          className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Open Ada <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------- the reader */

const WIDTHS: Record<ContentWidth, { max: string; label: string }> = {
  compact: { max: "44rem", label: "Compact" },
  comfortable: { max: "52rem", label: "Comfortable" },
  wide: { max: "62rem", label: "Wide" },
};

export function ClassicalLessonView({
  course,
  slug,
  navigate,
}: {
  course: ClassicalCourse;
  slug: string;
  navigate: (hash: string) => void;
}) {
  const ref = useMemo(() => {
    const flat = allClassicalLessons(course);
    return flat.find((l) => l.lesson.slug === slug) ?? null;
  }, [course, slug]);

  const done = useClassicalProgress((s) => !!s.lessonsDone[slug]);
  const markLesson = useClassicalProgress((s) => s.markLesson);
  const bookmarked = !!useClassicalProgress((s) => s.bookmarks[slug]);
  const toggleBookmark = useClassicalProgress((s) => s.toggleBookmark);
  const width = useClassicalProgress((s) => s.width);
  const setWidth = useClassicalProgress((s) => s.setWidth);
  const setReading = useClassicalProgress((s) => s.setReading);

  const [ratio, setRatio] = useState(0);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [widthMenu, setWidthMenu] = useState(false);

  // scroll: reading progress + persist position
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const r = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      setRatio(r);
      setReading(slug, r);
    };
    const initial = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, [slug, setReading]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!ref) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Lesson not found</p>
        <button onClick={() => navigate("#/classical")} className="mt-3 text-sm font-medium text-primary hover:underline">
          Back to the course
        </button>
      </div>
    );
  }

  const { lesson, part, module: mod, chapter } = ref;
  const prev = neighborClassicalLesson(course, slug, -1);
  const next = neighborClassicalLesson(course, slug, 1);
  const flat = allClassicalLessons(course);
  const number = flat.findIndex((l) => l.lesson.slug === slug) + 1;

  return (
    <div className="dv-reader relative min-h-[calc(100vh-4rem)]">
      {/* reading progress hairline */}
      <div className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent">
        <div className="h-full bg-viz-3 transition-[width] duration-150" style={{ width: `${ratio * 100}%` }} />
      </div>

      <div className="mx-auto flex w-full max-w-[1680px] gap-0 px-0 xl:px-6">
        {/* ------------------------------------------------ left rail */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[286px] shrink-0 border-r border-border-subtle bg-surface/60 lg:block">
          <LeftSidebar key={slug} course={course} currentSlug={slug} navigate={navigate} bookmarks={useClassicalProgress.getState().bookmarks} />
        </aside>

        {/* ------------------------------------------------ center column */}
        <article className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 xl:py-10">
          {/* mobile toolbar */}
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setLeftOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 text-[12.5px] font-medium text-ink-2 shadow-e1"
            >
              <PanelLeft className="h-4 w-4" /> Contents
            </button>
            <button
              type="button"
              onClick={() => setRightOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 text-[12.5px] font-medium text-ink-2 shadow-e1"
            >
              <PanelRight className="h-4 w-4" /> Tools
            </button>
            <span className="tabular ml-auto font-mono text-[11px] text-ink-3">{Math.round(ratio * 100)}%</span>
          </div>

          <div className="mx-auto" style={{ maxWidth: WIDTHS[width].max }}>
            {/* breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium text-ink-3">
              <button onClick={() => navigate("#/school/classical-ai")} className="hover:text-ink hover:underline">Classical AI</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => navigate("#/classical")} className="hover:text-ink hover:underline">The course</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => navigate(`#/classical/part/${part.letter}`)} className="hover:text-ink hover:underline">
                Part {part.letter} · {part.title}
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink-2">{chapter.title}</span>
            </nav>

            {/* title block */}
            <header className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[color-mix(in_srgb,var(--dv-viz-3)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] font-bold text-viz-3">
                  {lesson.slug.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-border-subtle px-2.5 py-0.5 font-mono text-[11px] text-ink-3">
                  <Clock className="h-3 w-3" /> {lesson.minutes} min
                </span>
                <span className="rounded-full border border-border-subtle px-2.5 py-0.5 font-mono text-[11px] text-ink-3">
                  Lesson {number} of {flat.length}
                </span>
                {done && (
                  <span className="flex items-center gap-1 rounded-full border border-success-border bg-success-bg/50 px-2.5 py-0.5 text-[11px] font-semibold text-success-text">
                    <CheckCircle2 className="h-3 w-3" /> completed
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(slug)}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors",
                      bookmarked
                        ? "border-viz-3/50 bg-[color-mix(in_srgb,var(--dv-viz-3)_10%,transparent)] text-viz-3"
                        : "border-border-subtle bg-surface text-ink-3 hover:text-ink"
                    )}
                    aria-pressed={bookmarked}
                  >
                    {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {bookmarked ? "Bookmarked" : "Bookmark"}
                  </button>
                  {/* width control */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setWidthMenu((v) => !v)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-ink"
                      aria-label="Adjust content width"
                    >
                      <PanelRight className="h-4 w-4" />
                      <span className="hidden sm:inline">{WIDTHS[width].label}</span>
                    </button>
                    {widthMenu && (
                      <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-e3">
                        {(Object.keys(WIDTHS) as ContentWidth[]).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              setWidth(w);
                              setWidthMenu(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                              w === width ? "bg-surface-subtle font-semibold text-ink" : "text-ink-2 hover:bg-surface-subtle/70"
                            )}
                          >
                            {WIDTHS[w].label}
                            {w === width && <CheckCircle2 className="h-3.5 w-3.5 text-viz-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </span>
              </div>

              <h1 className="dv-lesson-title mt-4 text-ink">{lesson.title}</h1>
              <p className="dv-lesson-summary mt-3">{lesson.summary}</p>
            </header>

            {/* objectives */}
            <section className="mt-7 rounded-2xl border border-viz-3/25 bg-[color-mix(in_srgb,var(--dv-viz-3)_6%,var(--dv-surface))] px-5 py-4">
              <h2 className="dv-kicker flex items-center gap-1.5 text-viz-3">
                <Target className="h-4 w-4" /> Learning objectives
              </h2>
              <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {lesson.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-viz-3" />
                    <span><InlineText text={o} /></span>
                  </li>
                ))}
              </ul>
            </section>

            {/* why this matters */}
            <section className="dv-why mt-6 border-l-2 border-viz-3/50 pl-5">
              <p className="dv-kicker">Why this topic matters</p>
              <p className="dv-lesson-text mt-1.5 text-[15.5px] italic leading-[1.85]">
                <InlineText text={lesson.why} />
              </p>
            </section>

            {/* the lesson body */}
            <div className="mt-9">
              <ClassicalBlocksList blocks={lesson.blocks} />
            </div>

            {/* common mistakes */}
            <section className="mt-12">
              <h2 className="dv-lesson-h3 text-ink">
                <AlertTriangle className="h-5 w-5 text-warning-text" /> Common mistakes — and how to fix them
              </h2>
              <div className="mt-4 space-y-2.5">
                {lesson.mistakes.map((m, i) => (
                  <div key={i} className="rounded-xl border border-warning-border/40 bg-warning-bg/25 px-4 py-3.5">
                    <p className="flex items-start gap-2.5 text-[14px] font-semibold text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning-bg font-mono text-[11px] font-bold text-warning-text ring-1 ring-warning-border/50">
                        {i + 1}
                      </span>
                      <InlineText text={m.mistake} />
                    </p>
                    <p className="mt-2 pl-8 text-[13.5px] leading-relaxed text-ink-3">
                      <span className="font-semibold text-ink-2">Why it happens: </span>
                      <InlineText text={m.why} />
                    </p>
                    <p className="mt-1 pl-8 text-[13.5px] leading-relaxed text-ink-2">
                      <span className="font-semibold text-viz-3">The fix: </span>
                      <InlineText text={m.fix} />
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* key takeaways */}
            <section className="mt-12">
              <h2 className="dv-lesson-h3 text-ink">
                <Lightbulb className="h-5 w-5 text-viz-3" /> Key takeaways
              </h2>
              <ul className="mt-4 space-y-2 rounded-2xl border border-border-subtle bg-surface px-5 py-4">
                {lesson.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-viz-3" />
                    <span><InlineText text={t} /></span>
                  </li>
                ))}
              </ul>
            </section>

            {/* knowledge check */}
            <div className="mt-10">
              <ClassicalQuiz questions={lesson.quiz} storagePrefix={lesson.slug} />
            </div>

            {/* footer nav */}
            <footer className="mt-12 border-t border-border-subtle pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => markLesson(slug, !done)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
                    done
                      ? "border border-success-border bg-success-bg/40 text-success-text hover:bg-success-bg/70"
                      : "bg-primary text-primary-foreground shadow-e1 hover:bg-primary-hover"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {done ? "Completed — click to undo" : "Mark this lesson complete"}
                </button>
                <div className="flex gap-2">
                  {prev && (
                    <button
                      type="button"
                      onClick={() => navigate(`#/classical/lesson/${prev.lesson.slug}`)}
                      className="flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2.5 text-sm text-ink-2 shadow-e1 transition-colors hover:text-ink"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-ink-3">Previous</span>
                        <span className="block max-w-[11rem] truncate font-medium">{prev.lesson.title}</span>
                      </span>
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => {
                        markLesson(slug, true);
                        navigate(`#/classical/lesson/${next.lesson.slug}`);
                      }}
                      className="flex min-w-0 items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2.5 text-sm shadow-e1 transition-colors hover:border-viz-3/40"
                    >
                      <span className="min-w-0 text-right">
                        <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-ink-3">Up next</span>
                        <span className="block max-w-[11rem] truncate font-medium text-ink">{next.lesson.title}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-viz-3" />
                    </button>
                  )}
                </div>
              </div>
              {!next && (
                <p className="mt-5 text-center text-[13px] text-ink-3">
                  That is the last lesson of the course — the part checkpoint and project live on the{" "}
                  <button type="button" onClick={() => navigate(`#/classical/part/${part.letter}`)} className="font-semibold text-primary hover:underline">
                    Part {part.letter} page
                  </button>
                  .
                </p>
              )}
              <p className="tabular mt-4 text-center font-mono text-[11px] text-ink-3">
                {part.title} · {mod.title} · {chapter.title}
              </p>
            </footer>
          </div>
        </article>

        {/* ------------------------------------------------ right rail */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[320px] shrink-0 border-l border-border-subtle bg-surface/60 xl:block">
          <RightSidebar ref_={ref} course={course} progressRatio={ratio} navigate={navigate} />
        </aside>
      </div>

      {/* ------------------------------------------------ mobile drawers */}
      {leftOpen && (
        <div className="fixed inset-0 z-(--dv-z-modal) lg:hidden" role="dialog" aria-modal="true" aria-label="Course contents">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => setLeftOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] border-r border-border-subtle bg-surface shadow-e3">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Course contents</p>
              <button type="button" onClick={() => setLeftOpen(false)} className="rounded-md p-1 text-ink-3 hover:bg-surface-subtle" aria-label="Close">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <LeftSidebar key={`drawer-${slug}`} course={course} currentSlug={slug} navigate={navigate} onNavigate={() => setLeftOpen(false)} bookmarks={useClassicalProgress.getState().bookmarks} />
            </div>
          </div>
        </div>
      )}
      {rightOpen && (
        <div className="fixed inset-0 z-(--dv-z-modal) xl:hidden" role="dialog" aria-modal="true" aria-label="Lesson tools">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => setRightOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[320px] max-w-[90vw] border-l border-border-subtle bg-surface shadow-e3">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Lesson tools</p>
              <button type="button" onClick={() => setRightOpen(false)} className="rounded-md p-1 text-ink-3 hover:bg-surface-subtle" aria-label="Close">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <RightSidebar ref_={ref} course={course} progressRatio={ratio} navigate={navigate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
