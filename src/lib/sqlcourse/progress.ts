"use client";

/**
 * SQL course progress — persisted to localStorage.
 *
 * Tracks: lessons completed, quiz answers, exercise checks (passed),
 * assessment scores, project completion and case-study questions solved.
 * Nothing leaves the browser. Keyed separately from the Python course.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SqlQuizAnswer {
  /** option index chosen, 0-based */
  chosen: number;
  correct: boolean;
}

export interface SqlAssessmentState {
  answers: Record<string, SqlQuizAnswer>;
  score: number;
  total: number;
  completedAt: string;
}

interface SqlProgressState {
  lessonsDone: Record<string, true>;
  quizAnswers: Record<string, SqlQuizAnswer>;
  exercisesPassed: Record<string, true>;
  assessments: Record<string, SqlAssessmentState>;
  projectsDone: Record<string, true>;
  caseQuestionsPassed: Record<string, true>;

  markLesson: (slug: string, done: boolean) => void;
  recordQuizAnswer: (questionId: string, answer: SqlQuizAnswer) => void;
  markExercisePassed: (exerciseId: string) => void;
  recordAssessment: (partLetter: string, state: SqlAssessmentState) => void;
  markProject: (partLetter: string, done: boolean) => void;
  markCaseQuestionPassed: (questionId: string) => void;
  resetAll: () => void;
}

const KEY = "dataverse-sql-course-progress-v1";

export const useSqlProgress = create<SqlProgressState>()(
  persist(
    (set) => ({
      lessonsDone: {},
      quizAnswers: {},
      exercisesPassed: {},
      assessments: {},
      projectsDone: {},
      caseQuestionsPassed: {},

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

      markCaseQuestionPassed: (questionId) =>
        set((s) => ({
          caseQuestionsPassed: { ...s.caseQuestionsPassed, [questionId]: true },
        })),

      resetAll: () =>
        set({
          lessonsDone: {},
          quizAnswers: {},
          exercisesPassed: {},
          assessments: {},
          projectsDone: {},
          caseQuestionsPassed: {},
        }),
    }),
    { name: KEY }
  )
);
