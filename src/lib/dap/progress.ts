"use client";

/**
 * DAP progress — persisted to localStorage per browser.
 *
 * Tracks: chosen mode per project, guided steps completed, hint levels
 * revealed, submissions (GitHub links, uploaded-file metadata, notes,
 * self-assessment) and the instructor reviews generated from them.
 * Nothing leaves the browser; file CONTENTS are analysed at
 * submission time and only metadata + feedback persist.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StoredSubmission {
  id: string;
  projectId: string;
  createdAt: string;
  githubUrl?: string;
  fileNames: string[];
  notes: string;
  deliverables: string[];
  selfScores: Record<string, number>;
  mode: "guided" | "independent";
  guidedStepsDone: number;
  review: StoredReview;
}

export interface StoredReview {
  score: number;
  band: string;
  headline: string;
  summary: string[];
  strengths: string[];
  developments: { area: string; action: string }[];
  nextStep: string;
  dimensionComments: { dimension: string; label: string; score: number; comment: string; evidence: string[] }[];
  evidenceChips: string[];
}

interface DapProgressState {
  modes: Record<string, "guided" | "independent">;
  stepsDone: Record<string, true>;
  hintsRevealed: Record<string, number>;
  solutionRevealed: Record<string, true>;
  submissions: Record<string, StoredSubmission[]>;

  setMode: (projectId: string, mode: "guided" | "independent") => void;
  toggleStep: (stepKey: string, done: boolean) => void;
  revealHint: (stepKey: string, level: number) => void;
  revealSolution: (projectId: string) => void;
  addSubmission: (submission: StoredSubmission) => void;
  resetProject: (projectId: string) => void;
}

const KEY = "dataverse-dap-progress-v1";

function stepKey(projectId: string, index: number): string {
  return `${projectId}:${index}`;
}

export const dapStepKey = stepKey;

export const useDapProgress = create<DapProgressState>()(
  persist(
    (set) => ({
      modes: {},
      stepsDone: {},
      hintsRevealed: {},
      solutionRevealed: {},
      submissions: {},

      setMode: (projectId, mode) =>
        set((s) => ({ modes: { ...s.modes, [projectId]: mode } })),

      toggleStep: (key, done) =>
        set((s) => {
          const next = { ...s.stepsDone };
          if (done) next[key] = true;
          else delete next[key];
          return { stepsDone: next };
        }),

      revealHint: (key, level) =>
        set((s) => ({
          hintsRevealed: { ...s.hintsRevealed, [key]: Math.max(s.hintsRevealed[key] ?? 0, level) },
        })),

      revealSolution: (projectId) =>
        set((s) => ({ solutionRevealed: { ...s.solutionRevealed, [projectId]: true } })),

      addSubmission: (submission) =>
        set((s) => ({
          submissions: {
            ...s.submissions,
            [submission.projectId]: [
              ...(s.submissions[submission.projectId] ?? []),
              submission,
            ].slice(-8),
          },
        })),

      resetProject: (projectId) =>
        set((s) => {
          const modes = { ...s.modes };
          delete modes[projectId];
          const stepsNext = { ...s.stepsDone };
          for (const k of Object.keys(stepsNext)) {
            if (k.startsWith(`${projectId}:`)) delete stepsNext[k];
          }
          const hints = { ...s.hintsRevealed };
          for (const k of Object.keys(hints)) {
            if (k.startsWith(`${projectId}:`)) delete hints[k];
          }
          const sols = { ...s.solutionRevealed };
          delete sols[projectId];
          return { modes, stepsDone: stepsNext, hintsRevealed: hints, solutionRevealed: sols };
        }),
    }),
    { name: KEY }
  )
);

/** How many guided steps of a project are done. */
export function countStepsDone(stepsDone: Record<string, true>, projectId: string): number {
  let n = 0;
  for (const key of Object.keys(stepsDone)) {
    if (key.startsWith(`${projectId}:`)) n++;
  }
  return n;
}
