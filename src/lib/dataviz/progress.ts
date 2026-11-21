"use client";

/**
 * Data Visualization course progress — persisted to localStorage.
 *
 * A minimal companion to the textbook reader: lesson completion (which
 * drives the outline's completion indicators). Quiz and exercise state
 * live inside the lesson components themselves.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VizProgressState {
  lessonsDone: Record<string, true>;
  markLesson: (slug: string, done: boolean) => void;
}

export const useVizProgress = create<VizProgressState>()(
  persist(
    (set) => ({
      lessonsDone: {},
      markLesson: (slug, done) =>
        set((s) => {
          const next = { ...s.lessonsDone };
          if (done) next[slug] = true;
          else delete next[slug];
          return { lessonsDone: next };
        }),
    }),
    { name: "dataverse-viz-course-progress-v1" }
  )
);
