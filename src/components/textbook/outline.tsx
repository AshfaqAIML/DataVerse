"use client";

/**
 * OutlineTree — the left sidebar of the textbook reader: the school →
 * course identity card, then the whole course as an expand/collapse tree
 * (part → [module → chapter →] lesson) with completion indicators,
 * the current lesson highlighted, and bookmarked lessons flagged.
 *
 * The tree is data-driven: every course reader flattens its own content
 * model into OutlineNode[] and hands it over. Mount it with key={slug}
 * so navigating between lessons re-opens the tree around the new lesson.
 */
import { useState } from "react";
import { Bookmark, CheckCircle2, ChevronRight, Circle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- the model */

export interface OutlineLessonLink {
  kind: "lesson";
  slug: string;
  title: string;
  minutes: number;
  href: string;
  done?: boolean;
  current?: boolean;
  bookmarked?: boolean;
}

export interface OutlineGroup {
  kind: "group";
  id: string;
  /** Short badge, e.g. the part letter "A". */
  label?: string;
  title: string;
  /** Nested groups (modules / chapters), then lessons. */
  children: OutlineNode[];
}

export type OutlineNode = OutlineGroup | OutlineLessonLink;

export interface OutlineTreeProps {
  /** Where the school's catalogue lives (the identity card links there). */
  onSchool?: () => void;
  /** e.g. "School A · Programming" */
  schoolLabel: string;
  /** e.g. "The Complete Python Programming Course" */
  schoolSub: string;
  /** What is being read right now, e.g. the part title. */
  readingLabel: string;
  doneCount: number;
  total: number;
  nodes: OutlineNode[];
  navigate: (hash: string) => void;
  bookmarks?: { slug: string; title: string; href: string }[];
}

/* ------------------------------------------------------------------ helpers */

function lessonsOf(node: OutlineNode): OutlineLessonLink[] {
  if (node.kind === "lesson") return [node];
  return node.children.flatMap(lessonsOf);
}

function containsCurrent(node: OutlineNode): boolean {
  if (node.kind === "lesson") return !!node.current;
  return node.children.some(containsCurrent);
}

/* -------------------------------------------------------------- the sidebar */

export function OutlineTree({
  onSchool,
  schoolLabel,
  schoolSub,
  readingLabel,
  doneCount,
  total,
  nodes,
  navigate,
  bookmarks = [],
}: OutlineTreeProps) {
  return (
    <nav aria-label="Course contents" className="flex h-full min-h-0 flex-col">
      {/* school + course identity */}
      <div className="border-b border-border-subtle px-4 pb-3.5 pt-1">
        <button
          type="button"
          onClick={onSchool}
          className="group flex w-full items-center gap-2.5 text-left"
        >
          <span className="tb-chip flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-semibold leading-tight text-ink group-hover:text-(--tb-accent)">
              {schoolLabel}
            </span>
            <span className="block truncate text-[11px] leading-tight text-ink-3" title={schoolSub}>{schoolSub}</span>
          </span>
        </button>
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface-subtle/50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Reading now</p>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-ink-2">{readingLabel}</p>
          <p className="tabular mt-1 flex items-center gap-1.5 font-mono text-[11px] text-ink-3">
            {doneCount}/{total} lessons complete
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-inset">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${total > 0 ? (doneCount / total) * 100 : 0}%`,
                background: "var(--tb-accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* the tree */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {nodes.map((node) => (
          <Group key={node.kind === "group" ? node.id : node.slug} node={node} navigate={navigate} />
        ))}
      </div>

      {/* bookmarks */}
      {bookmarks.length > 0 && <BookmarkStrip items={bookmarks} navigate={navigate} />}
    </nav>
  );
}

/* ------------------------------------------------------------------- groups */

function Group({ node, navigate }: { node: OutlineNode; navigate: (hash: string) => void }) {
  if (node.kind === "lesson") {
    return <LessonRow lesson={node} navigate={navigate} />;
  }

  const lessons = lessonsOf(node);
  const done = lessons.filter((l) => l.done).length;
  const complete = lessons.length > 0 && done === lessons.length;

  return (
    <CollapsibleGroup
      node={node}
      done={done}
      total={lessons.length}
      complete={complete}
      navigate={navigate}
    />
  );
}

function CollapsibleGroup({
  node,
  done,
  total,
  complete,
  navigate,
}: {
  node: OutlineGroup;
  done: number;
  total: number;
  complete: boolean;
  navigate: (hash: string) => void;
}) {
  const [open, setOpen] = useState(() => containsCurrent(node));
  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-subtle/70"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn("h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform", open && "rotate-90")}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-semibold leading-snug text-ink">
            {node.label && <span className="tb-accent mr-1.5 font-mono text-[11px] font-bold">{node.label}</span>}
            {node.title}
          </span>
          <span className="tabular block text-[11px] text-ink-3">
            {done}/{total} lessons
          </span>
        </span>
        {complete && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-text" />}
      </button>
      {open && (
        <div className="dv-expand ml-[13px] border-l border-border-subtle pl-2">
          {node.children.map((child) => (
            <Group
              key={child.kind === "group" ? child.id : child.slug}
              node={child}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ lessons */

function LessonRow({ lesson, navigate }: { lesson: OutlineLessonLink; navigate: (hash: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => navigate(lesson.href)}
      className={cn(
        "group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
        lesson.current ? "tb-tint" : "hover:bg-surface-subtle/70"
      )}
      aria-current={lesson.current ? "page" : undefined}
    >
      {lesson.done ? (
        <CheckCircle2 className="tb-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-border-strong" />
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[11.5px] leading-snug",
            lesson.current ? "font-semibold text-ink" : "text-ink-2 group-hover:text-ink"
          )}
        >
          {lesson.title}
        </span>
        <span className="tabular block font-mono text-[10px] text-ink-3">
          {lesson.slug} · {lesson.minutes} min
        </span>
      </span>
      {lesson.bookmarked && <Bookmark className="tb-accent h-3 w-3 shrink-0" />}
    </button>
  );
}

/* --------------------------------------------------------------- bookmarks */

function BookmarkStrip({
  items,
  navigate,
}: {
  items: { slug: string; title: string; href: string }[];
  navigate: (hash: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="border-t border-border-subtle px-2 py-2">
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
        aria-expanded={show}
      >
        <Bookmark className="tb-accent h-3.5 w-3.5" />
        <span className="text-[11.5px] font-medium text-ink-2">Bookmarks</span>
        <span className="tabular ml-auto font-mono text-[11px] text-ink-3">{items.length}</span>
        <ChevronRight className={cn("h-3 w-3 text-ink-3 transition-transform", show && "rotate-90")} />
      </button>
      {show && (
        <div className="dv-expand mt-1 space-y-0.5 border-l border-border-subtle pl-2">
          {items.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => navigate(b.href)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-subtle/70"
            >
              <Bookmark className="tb-accent h-3 w-3 shrink-0" />
              <span className="min-w-0 truncate text-[11px] text-ink-2" title={b.title}>{b.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
