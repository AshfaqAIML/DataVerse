import { db } from "@/lib/db";
import { AppError, notFound, unprocessable } from "@/lib/api/errors";

/**
 * Grading service.
 *
 * 1) Quiz grading — deterministic server-side scoring of AssessmentAttempt
 *    answers (MCQ / MULTI_SELECT / TRUE_FALSE / SHORT_ANSWER) against
 *    AnswerOption rows. Answer keys are never sent to the client.
 *
 * 2) Exercise grading — executes submitted code against the exercise's
 *    TestCases through a pluggable CodeRunner. The production topology
 *    (SYSTEM_ARCHITECTURE.md, ADR-005) uses an isolated container sandbox;
 *    the bundled LocalRunner uses `node:vm` (JS) and a hard-timeout
 *    child process (Python) which is adequate for the trusted sandbox
 *    environment and shares the same interface.
 */

export type QuizAnswerInput = {
  questionId: string;
  selectedOptionIds?: string[];
  text?: string;
};

export type GradedAnswer = {
  questionId: string;
  correct: boolean;
  pointsEarned: number;
  pointsPossible: number;
};

export type QuizGrade = {
  score: number; // 0-100 percent
  passed: boolean;
  gradedAnswers: GradedAnswer[];
  correctCount: number;
  totalQuestions: number;
};

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parses "3.14", " 3,14 " (comma decimal), "42", "1.5e3" — or returns null. */
function parseNumber(s: string): number | null {
  const cleaned = s.trim().replace(",", ".").replace(/%$/, "");
  if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Numeric equivalence with a small relative tolerance (rounding-safe). */
function numbersClose(a: number, b: number): boolean {
  const tol = Math.max(1e-6, Math.abs(b) * 1e-4);
  return Math.abs(a - b) <= tol;
}

export async function gradeQuizAttempt(quizId: string, answers: QuizAnswerInput[]): Promise<QuizGrade> {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { orderIndex: "asc" }, include: { answerOptions: true } } },
  });
  if (!quiz) throw notFound("Quiz not found");
  if (quiz.questions.length === 0) throw unprocessable("Quiz has no questions to grade");

  const byQuestion = new Map(answers.map((a) => [a.questionId, a]));

  let earned = 0;
  let possible = 0;
  let correctCount = 0;
  const gradedAnswers: GradedAnswer[] = [];

  for (const q of quiz.questions) {
    const answer = byQuestion.get(q.id);
    const correctIds = new Set(q.answerOptions.filter((o) => o.isCorrect).map((o) => o.id));
    let isCorrect = false;

    if (q.kind === "SHORT_ANSWER" || q.kind === "NUMERICAL") {
      // accepted answers = correct options' text. Text answers match
      // case-insensitively; both text kinds additionally accept numeric
      // equivalence ("3.50" == "3.5") when both sides parse as numbers.
      const acceptedTexts = q.answerOptions.filter((o) => o.isCorrect).map((o) => normalizeText(o.text));
      const acceptedNums = acceptedTexts.map((t) => parseNumber(t));
      const given = normalizeText(answer?.text ?? "");
      const givenNum = parseNumber(given);
      isCorrect =
        given.length > 0 &&
        acceptedTexts.some((a, i) => {
          if (a === given || a.split(",").some((syn) => syn === given)) return true;
          const acceptedNum = acceptedNums[i];
          return acceptedNum !== null && givenNum !== null && numbersClose(givenNum, acceptedNum);
        });
    } else {
      const selected = new Set(answer?.selectedOptionIds ?? []);
      // exact set match required (handles MCQ, MULTI_SELECT and TRUE_FALSE)
      isCorrect =
        selected.size === correctIds.size && [...selected].every((id) => correctIds.has(id));
    }

    possible += q.points;
    if (isCorrect) {
      earned += q.points;
      correctCount += 1;
    }
    gradedAnswers.push({ questionId: q.id, correct: isCorrect, pointsEarned: isCorrect ? q.points : 0, pointsPossible: q.points });
  }

  const score = Math.round((earned / possible) * 1000) / 10;
  return {
    score,
    passed: score >= quiz.passingScore,
    gradedAnswers,
    correctCount,
    totalQuestions: quiz.questions.length,
  };
}

// =====================================================================
// Exercise code grading
// =====================================================================

export type TestResult = {
  testCaseId: string;
  name: string;
  passed: boolean;
  expected: string;
  received: string;
  hidden: boolean;
};

export type ExerciseGrade = {
  status: "PASSED" | "FAILED" | "ERROR";
  score: number; // percent
  results: TestResult[];
  runtimeMs: number;
  error?: string;
};

export interface CodeRunner {
  /** Runs `code`, returns concatenated stdout. Throws on timeout/crash. */
  run(code: string, language: string, stdin?: string): Promise<{ stdout: string; stderr: string }>;
}

// ------------------------------------------------------------- LocalRunner
import vm from "node:vm";
import { spawn } from "node:child_process";

const EXEC_TIMEOUT_MS = 5_000;
const MAX_OUTPUT_CHARS = 10_000;

class LocalRunner implements CodeRunner {
  async run(code: string, language: string, stdin?: string): Promise<{ stdout: string; stderr: string }> {
    if (language === "javascript") return this.runJs(code, stdin);
    if (language === "python") return this.runPython(code, stdin);
    throw new AppError("BAD_REQUEST", `Unsupported exercise language: ${language}`);
  }

  private async runJs(code: string, stdin?: string): Promise<{ stdout: string; stderr: string }> {
    const chunks: string[] = [];
    const sandbox = {
      console: {
        log: (...args: unknown[]) => {
          if (chunks.join("").length < MAX_OUTPUT_CHARS) {
            chunks.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
          }
        },
      },
      Math,
      JSON,
      String,
      Number,
      Array,
      Object,
      Boolean,
      Date,
      Map,
      Set,
      RegExp,
      Error,
      isNaN,
      parseInt,
      parseFloat,
      structuredClone,
    };
    try {
      const script = new vm.Script(code, { filename: "submission.js" });
      const context = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
      script.runInContext(context, { timeout: EXEC_TIMEOUT_MS, displayErrors: true });
      return { stdout: chunks.join("\n"), stderr: "" };
    } catch (err) {
      const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      throw new AppError("UNPROCESSABLE", `Runtime error: ${message}`);
    }
  }

  private runPython(code: string, stdin?: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      // `-I -B`: isolated mode (no site imports, ignores env/user site),
      // no bytecode writes. cwd is a scratch dir; production replaces this
      // with the container sandbox runner (same CodeRunner interface).
      const child = spawn("python3", ["-I", "-B", "-c", code], {
        cwd: "/tmp",
        env: { PATH: "/usr/bin:/bin", PYTHONIOENCODING: "utf-8", HOME: "/tmp" } as unknown as NodeJS.ProcessEnv,
        stdio: ["pipe", "pipe", "pipe"] as const,
      }) as import("node:child_process").ChildProcess;

      let stdout = "";
      let stderr = "";
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          child.kill("SIGKILL");
          reject(new AppError("UNPROCESSABLE", `Execution timed out after ${EXEC_TIMEOUT_MS}ms`));
        }
      }, EXEC_TIMEOUT_MS);

      child.stdout?.on("data", (d: Buffer) => {
        if (stdout.length < MAX_OUTPUT_CHARS) stdout += d.toString("utf8");
      });
      child.stderr?.on("data", (d: Buffer) => {
        if (stderr.length < MAX_OUTPUT_CHARS) stderr += d.toString("utf8");
      });
      child.on("error", (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        reject(new AppError("UNPROCESSABLE", `Failed to run submission: ${err.message}`));
      });
      child.on("close", (exitCode) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (exitCode === 0) resolve({ stdout, stderr });
        else reject(new AppError("UNPROCESSABLE", stderr.trim() || `Process exited with code ${exitCode}`));
      });

      if (stdin) child.stdin?.write(stdin);
      child.stdin?.end();
    });
  }
}

export const localRunner = new LocalRunner();

function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export async function gradeExerciseSubmission(exerciseId: string, code: string, language: string, runner: CodeRunner = localRunner): Promise<ExerciseGrade> {
  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: { testCases: { orderBy: { orderIndex: "asc" } } },
  });
  if (!exercise) throw notFound("Exercise not found");
  if (exercise.testCases.length === 0) throw unprocessable("Exercise has no test cases configured");

  const started = Date.now();
  const results: TestResult[] = [];
  let crashed: string | undefined;

  for (const tc of exercise.testCases) {
    if (crashed) {
      results.push({ testCaseId: tc.id, name: tc.name, passed: false, expected: tc.hidden ? "(hidden)" : tc.expectedOutput, received: "(not run)", hidden: tc.hidden });
      continue;
    }
    try {
      const { stdout } = await runner.run(code, language, tc.input ?? undefined);
      const received = normalizeOutput(stdout);
      const expected = normalizeOutput(tc.expectedOutput);
      const passed = received === expected;
      results.push({
        testCaseId: tc.id,
        name: tc.name,
        passed,
        expected: tc.hidden ? "(hidden)" : expected,
        received: tc.hidden ? "(hidden)" : received,
        hidden: tc.hidden,
      });
    } catch (err) {
      crashed = err instanceof Error ? err.message : String(err);
      results.push({ testCaseId: tc.id, name: tc.name, passed: false, expected: tc.hidden ? "(hidden)" : tc.expectedOutput, received: `error: ${crashed}`, hidden: tc.hidden });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const score = Math.round((passedCount / results.length) * 1000) / 10;
  const status: ExerciseGrade["status"] = crashed ? "ERROR" : passedCount === results.length ? "PASSED" : "FAILED";

  return { status, score, results, runtimeMs: Date.now() - started, error: crashed };
}
