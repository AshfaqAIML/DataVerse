"use client";

/**
 * Reader preferences — the shared, device-local settings of the digital
 * textbook readers: content width per course, personal notes per lesson,
 * bookmarks, and the last reading position (resume where you left off).
 *
 * Used by every course reader that does not own a richer progress store
 * (the Classical AI reader keeps its own; the five other course readers
 * share this one). Nothing leaves the browser.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ContentWidth = "compact" | "comfortable" | "wide";

export interface NoteEntry {
  text: string;
  updatedAt: string;
}

export const READER_WIDTHS: Record<ContentWidth, { max: string; label: string; hint: string }> = {
  compact: { max: "42rem", label: "Compact", hint: "narrow measure" },
  comfortable: { max: "52rem", label: "Comfortable", hint: "the default" },
  wide: { max: "62rem", label: "Wide", hint: "more per line" },
};

/** The localStorage key under which one lesson's notes live. */
export function noteKey(courseKey: string, slug: string): string {
  return `${courseKey}::${slug}`;
}

interface ReaderPrefsState {
  /** Reading width per course ("python" | "sql" | "math" | "numpy" | "viz"). */
  widths: Record<string, ContentWidth>;
  /** Personal notes, keyed by noteKey(courseKey, slug). */
  notes: Record<string, NoteEntry>;
  /** Bookmarked lessons, keyed by noteKey(courseKey, slug). */
  bookmarks: Record<string, true>;
  /** Last opened lesson + scroll ratio per course (resume). */
  lastReading: Record<string, { slug: string; scroll: number }>;

  setWidth: (courseKey: string, width: ContentWidth) => void;
  saveNote: (key: string, text: string) => void;
  toggleBookmark: (key: string) => void;
  setReading: (courseKey: string, slug: string, scroll: number) => void;
}

export const useReaderPrefs = create<ReaderPrefsState>()(
  persist(
    (set) => ({
      widths: {},
      notes: {},
      bookmarks: {},
      lastReading: {},

      setWidth: (courseKey, width) =>
        set((s) => ({ widths: { ...s.widths, [courseKey]: width } })),

      saveNote: (key, text) =>
        set((s) => {
          const next = { ...s.notes };
          if (text.trim().length === 0) delete next[key];
          else next[key] = { text, updatedAt: new Date().toISOString() };
          return { notes: next };
        }),

      toggleBookmark: (key) =>
        set((s) => {
          const next = { ...s.bookmarks };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { bookmarks: next };
        }),

      setReading: (courseKey, slug, scroll) =>
        set((s) => ({
          lastReading: { ...s.lastReading, [courseKey]: { slug, scroll } },
        })),
    }),
    { name: "dataverse-reader-prefs-v1", version: 1 }
  )
);
