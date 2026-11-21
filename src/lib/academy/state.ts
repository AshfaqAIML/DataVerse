"use client";

/**
 * Academy student state — persisted to localStorage per browser.
 *
 * Tracks the three levers of the learning-path engine:
 *   - placement scores ("test your existing knowledge" -> skip)
 *   - manual waivers ("mark as known")
 *   - per-lesson study marks for registry subjects ("return to incomplete
 *     lessons"), bridged with the interactive Python course progress.
 *
 * Nothing leaves the browser.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AcademySnapshot {
  /** Best placement-test score per subject slug (0-100). */
  placementScores: Record<string, number>;
  /** Manually waived subjects ("I already know this"). */
  waived: string[];
  /** Subject slug -> lesson key ("m1c2l3") -> done. */
  lessonDone: Record<string, Record<string, true>>;
  /** Subject slug -> epoch ms of last activity. */
  lastAccessedAt: Record<string, number>;
}

interface AcademyState extends AcademySnapshot {
  recordPlacement: (slug: string, score: number) => void;
  toggleWaived: (slug: string) => void;
  toggleLesson: (slug: string, key: string, done: boolean) => void;
  touch: (slug: string) => void;
  resetAll: () => void;
}

const KEY = "dataverse-academy-state-v1";

export const useAcademy = create<AcademyState>()(
  persist(
    (set) => ({
      placementScores: {},
      waived: [],
      lessonDone: {},
      lastAccessedAt: {},

      recordPlacement: (slug, score) =>
        set((s) => ({
          placementScores: {
            ...s.placementScores,
            [slug]: Math.max(s.placementScores[slug] ?? 0, Math.round(score)),
          },
          lastAccessedAt: { ...s.lastAccessedAt, [slug]: Date.now() },
        })),

      toggleWaived: (slug) =>
        set((s) => ({
          waived: s.waived.includes(slug) ? s.waived.filter((x) => x !== slug) : [...s.waived, slug],
          lastAccessedAt: { ...s.lastAccessedAt, [slug]: Date.now() },
        })),

      toggleLesson: (slug, key, done) =>
        set((s) => {
          const lessons = { ...(s.lessonDone[slug] ?? {}) };
          if (done) lessons[key] = true;
          else delete lessons[key];
          return {
            lessonDone: { ...s.lessonDone, [slug]: lessons },
            lastAccessedAt: { ...s.lastAccessedAt, [slug]: Date.now() },
          };
        }),

      touch: (slug) => set((s) => ({ lastAccessedAt: { ...s.lastAccessedAt, [slug]: Date.now() } })),

      resetAll: () => set({ placementScores: {}, waived: [], lessonDone: {}, lastAccessedAt: {} }),
    }),
    { name: KEY }
  )
);

/** Storage key (exported for dev tools / debugging). */
export const ACADEMY_STORAGE_KEY = KEY;
