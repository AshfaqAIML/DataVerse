"use client";

/**
 * Math course progress — persisted to localStorage.
 *
 * Tracks lesson completion, per-question quiz results (the wrong answers
 * feed the revision radar), exercise solves, assessment scores, workshop
 * completion, and the diagnostic placement result. Nothing leaves the
 * browser. Keyed separately from the Python and SQL course stores.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MathQuizAnswer {
  chosen: number;
  correct: boolean;
}

export interface MathAssessmentState {
  answers: Record<string, MathQuizAnswer>;
  score: number;
  total: number;
  completedAt: string;
}

export interface DiagnosticResult {
  takenAt: string;
  /** part letter -> correct count / total asked */
  areaScores: Record<string, { correct: number; total: number }>;
  /** Recommended entry point. */
  placement: { partId: string; lessonId: string; note: string };
  /** Lesson slugs to revise (already-visited weak spots), dependency-ordered. */
  revisionLessonIds: string[];
  /** How many questions were right, overall. */
  correct: number;
  total: number;
}

interface MathProgressState {
  lessonsDone: Record<string, true>;
  quizAnswers: Record<string, MathQuizAnswer>;
  exercisesPassed: Record<string, true>;
  assessments: Record<string, MathAssessmentState>;
  workshopsDone: Record<string, true>;
  diagnostic: DiagnosticResult | null;

  markLesson: (slug: string, done: boolean) => void;
  recordQuizAnswer: (questionId: string, answer: MathQuizAnswer) => void;
  markExercisePassed: (exerciseId: string) => void;
  recordAssessment: (partLetter: string, state: MathAssessmentState) => void;
  markWorkshop: (partLetter: string, done: boolean) => void;
  recordDiagnostic: (result: DiagnosticResult) => void;
  resetAll: () => void;
}

const KEY = "dataverse-math-course-progress-v1";

export const useMathProgress = create<MathProgressState>()(
  persist(
    (set) => ({
      lessonsDone: {},
      quizAnswers: {},
      exercisesPassed: {},
      assessments: {},
      workshopsDone: {},
      diagnostic: null,

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

      markWorkshop: (partLetter, done) =>
        set((s) => {
          const next = { ...s.workshopsDone };
          if (done) next[partLetter] = true;
          else delete next[partLetter];
          return { workshopsDone: next };
        }),

      recordDiagnostic: (result) => set({ diagnostic: result }),

      resetAll: () =>
        set({
          lessonsDone: {},
          quizAnswers: {},
          exercisesPassed: {},
          assessments: {},
          workshopsDone: {},
          diagnostic: null,
        }),
    }),
    { name: KEY }
  )
);
