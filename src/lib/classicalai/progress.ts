"use client";

/**
 * Classical AI course progress — persisted to localStorage, separate from
 * the other course stores.
 *
 * Tracks everything the textbook reader needs:
 *   - lessons completed (drives the sidebar completion states)
 *   - quiz answers and exercise attempts
 *   - personal notes per lesson
 *   - bookmarks (flagged lessons)
 *   - last read lesson + scroll position (resume where you left off)
 *   - the reader's content-width preference
 *
 * Nothing leaves the browser.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizAnswer {
  /** option index chosen, 0-based */
  chosen: number;
  correct: boolean;
}

export interface NoteEntry {
  /** The note text, authored by the student. */
  text: string;
  /** ISO timestamp of last edit. */
  updatedAt: string;
}

export type ContentWidth = "compact" | "comfortable" | "wide";

interface ClassicalProgressState {
  lessonsDone: Record<string, true>;
  quizAnswers: Record<string, QuizAnswer>;
  exercisesPassed: Record<string, true>;
  notes: Record<string, NoteEntry>;
  bookmarks: Record<string, true>;
  /** slug of the last opened lesson (resume + recently read). */
  lastLesson: string | null;
  /** reading scroll ratio of that lesson, 0–1. */
  lastScroll: number;
  width: ContentWidth;

  markLesson: (slug: string, done: boolean) => void;
  recordQuizAnswer: (questionId: string, answer: QuizAnswer) => void;
  markExercisePassed: (exerciseId: string) => void;
  saveNote: (slug: string, text: string) => void;
  deleteNote: (slug: string) => void;
  toggleBookmark: (slug: string) => void;
  setReading: (slug: string, scroll: number) => void;
  setWidth: (width: ContentWidth) => void;
  resetAll: () => void;
}

const KEY = "dataverse-classical-course-progress-v1";

export const useClassicalProgress = create<ClassicalProgressState>()(
  persist(
    (set) => ({
      lessonsDone: {},
      quizAnswers: {},
      exercisesPassed: {},
      notes: {},
      bookmarks: {},
      lastLesson: null,
      lastScroll: 0,
      width: "comfortable",

      markLesson: (slug, done) =>
        set((s) => {
          const next = { ...s.lessonsDone };
          if (done) next[slug] = true;
          else delete next[slug];
          return { lessonsDone: next };
        }),

      recordQuizAnswer: (questionId, answer) =>
        set((s) => ({
          quizAnswers: { ...s.quizAnswers, [questionId]: answer },
        })),

      markExercisePassed: (exerciseId) =>
        set((s) => ({
          exercisesPassed: { ...s.exercisesPassed, [exerciseId]: true },
        })),

      saveNote: (slug, text) =>
        set((s) => {
          const next = { ...s.notes };
          if (text.trim().length === 0) delete next[slug];
          else next[slug] = { text, updatedAt: new Date().toISOString() };
          return { notes: next };
        }),

      deleteNote: (slug) =>
        set((s) => {
          const next = { ...s.notes };
          delete next[slug];
          return { notes: next };
        }),

      toggleBookmark: (slug) =>
        set((s) => {
          const next = { ...s.bookmarks };
          if (next[slug]) delete next[slug];
          else next[slug] = true;
          return { bookmarks: next };
        }),

      setReading: (slug, scroll) =>
        set(() => ({ lastLesson: slug, lastScroll: scroll })),

      setWidth: (width) => set(() => ({ width })),

      resetAll: () =>
        set({
          lessonsDone: {},
          quizAnswers: {},
          exercisesPassed: {},
          notes: {},
          bookmarks: {},
          lastLesson: null,
          lastScroll: 0,
        }),
    }),
    { name: KEY }
  )
);
