"use client";

/**
 * NumPy course progress — persisted to localStorage, separate from the
 * Python course store.
 *
 * Tracks: lessons completed, quiz answers, exercise checks (passed),
 * assessment scores, and project completion. Nothing leaves the browser.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizAnswer {
  /** option index chosen, 0-based */
  chosen: number;
  correct: boolean;
}

export interface AssessmentState {
  answers: Record<string, QuizAnswer>;
  score: number;
  total: number;
  completedAt: string;
}

interface NumpyProgressState {
  lessonsDone: Record<string, true>;
  quizAnswers: Record<string, QuizAnswer>;
  exercisesPassed: Record<string, true>;
  assessments: Record<string, AssessmentState>;
  projectsDone: Record<string, true>;

  markLesson: (slug: string, done: boolean) => void;
  recordQuizAnswer: (questionId: string, answer: QuizAnswer) => void;
  markExercisePassed: (exerciseId: string) => void;
  recordAssessment: (partLetter: string, state: AssessmentState) => void;
  markProject: (partLetter: string, done: boolean) => void;
  resetAll: () => void;
}

const KEY = "dataverse-numpy-course-progress-v1";

export const useNumpyProgress = create<NumpyProgressState>()(
  persist(
    (set) => ({
      lessonsDone: {},
      quizAnswers: {},
      exercisesPassed: {},
      assessments: {},
      projectsDone: {},

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

      recordAssessment: (partLetter, state) =>
        set((s) => ({
          assessments: { ...s.assessments, [partLetter]: state },
        })),

      markProject: (partLetter, done) =>
        set((s) => {
          const next = { ...s.projectsDone };
          if (done) next[partLetter] = true;
          else delete next[partLetter];
          return { projectsDone: next };
        }),

      resetAll: () =>
        set({
          lessonsDone: {},
          quizAnswers: {},
          exercisesPassed: {},
          assessments: {},
          projectsDone: {},
        }),
    }),
    { name: KEY }
  )
);
