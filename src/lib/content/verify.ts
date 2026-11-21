/**
 * Output verification — the "no fake output" gate.
 *
 * Every python block in a verified section must be followed by its real
 * output, and the verifier PROVES it: it executes the block with python3
 * and compares actual stdout against the claimed output. Exercise
 * solutions run against every test case the same way the grading sandbox
 * will. A lesson that ships an output it never produced fails validation.
 *
 * Conventions (documented in the authoring guide):
 *   - expected output = a ```text fence directly after the python fence
 *   - intentionally crashing demos carry "<!-- expect-error: ErrorType -->"
 *     on the line above the fence
 *   - sections listed in NO_VERIFY_SECTIONS (performance, installation)
 *     are exempt: timings and versions are machine-dependent by nature
 *   - blocks must be self-contained and deterministic (no input(), no
 *     randomness without a seed, no wall-clock output)
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import type { CompiledLesson, Finding } from "./compile";
import { NO_VERIFY_SECTIONS, VERIFY_SECTIONS, type SectionId } from "./sections";
import { isCodeExercise } from "./schemas";
import type { SectionNode } from "./sectionize";

export interface VerifyOptions {
  runner?: string; // default "python3"
  timeoutMs?: number; // default 10000
  /** Skip exercise-solution verification (unit tests stub it off). */
  skipExercises?: boolean;
}

export interface RunOutcome {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export function runPython(code: string, cwd: string, opts: VerifyOptions = {}): RunOutcome {
  const res = spawnSync(opts.runner ?? "python3", ["-I", "-c", code], {
    cwd,
    input: "",
    encoding: "utf8",
    timeout: opts.timeoutMs ?? 10000,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (res.error) {
    const timedOut = (res.error as NodeJS.ErrnoException).code === "ETIMEDOUT";
    if (timedOut) return { code: null, stdout: "", stderr: "execution timed out", timedOut: true };
    return { code: null, stdout: "", stderr: res.error.message, timedOut: false };
  }
  return { code: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "", timedOut: false };
}

/** Normalize output for comparison: kill trailing whitespace/newline noise. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

/** Wrap user code so SystemExit etc. surface through the exit code. */
const PRELUDE = "import sys\nsys.stderr = sys.stderr\n";

export function verifyLesson(lesson: CompiledLesson, opts: VerifyOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const sectionsById = new Map<string, SectionNode>();
  for (const s of lesson.parsed.sections) if (s.id) sectionsById.set(s.id, s);

  for (const sectionId of VERIFY_SECTIONS as SectionId[]) {
    const section = sectionsById.get(sectionId);
    if (!section) continue; // missing sections are rules.ts's business (S01)

    const blocks = section.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.language !== "python") continue;
      const next = blocks[i + 1];
      const nextIsOutput = next && (next.language === "text" || next.language === "output");

      if (block.expectError) {
        const out = runPython(PRELUDE + block.content, lesson.dir, opts);
        if (out.timedOut) {
          findings.push({ rule: "V01", severity: "error", path: lesson.ref, line: block.startLine, message: `code timed out (> ${opts.timeoutMs ?? 10000} ms)` });
          continue;
        }
        if (out.code === 0) {
          findings.push({ rule: "V02", severity: "error", path: lesson.ref, line: block.startLine, message: `block was annotated expect-error:${block.expectError} but it ran without any error` });
          continue;
        }
        if (!out.stderr.includes(block.expectError)) {
          findings.push({
            rule: "V03",
            severity: "error",
            path: lesson.ref,
            line: block.startLine,
            message: `expected a ${block.expectError} but python raised: ${lastErrorLine(out.stderr)}`,
          });
        }
        continue;
      }

      if (!nextIsOutput) {
        findings.push({
          rule: "V04",
          severity: "error",
          path: lesson.ref,
          line: block.startLine,
          message: `python block in "${section.heading}" must be followed by a \`\`\`text fence with its real output`,
        });
        continue;
      }

      const out = runPython(PRELUDE + block.content, lesson.dir, opts);
      if (out.timedOut) {
        findings.push({ rule: "V01", severity: "error", path: lesson.ref, line: block.startLine, message: "code timed out — lessons must not block on input or long loops" });
        continue;
      }
      if (out.code !== 0) {
        findings.push({ rule: "V05", severity: "error", path: lesson.ref, line: block.startLine, message: `block crashed: ${lastErrorLine(out.stderr)}` });
        continue;
      }
      if (normalizeOutput(out.stdout) !== normalizeOutput(next!.content)) {
        findings.push({
          rule: "V06",
          severity: "error",
          path: lesson.ref,
          line: block.startLine,
          message: `claimed output does not match reality — run it and paste what python actually prints (claimed ${JSON.stringify(truncate(next!.content))}, got ${JSON.stringify(truncate(out.stdout))})`,
        });
      }
    }
  }

  // ---- exercise solutions run against their own test cases
  if (!opts.skipExercises) {
    for (const exercise of lesson.data.exercises) {
      if (!isCodeExercise(exercise)) continue;
      for (const tc of exercise.testCases) {
        const res = spawnSync(opts.runner ?? "python3", ["-I", "-c", exercise.solutionCode], {
          cwd: lesson.dir,
          input: tc.input ?? "",
          encoding: "utf8",
          timeout: opts.timeoutMs ?? 10000,
          env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        });
        if (res.error || (res.status !== 0 && res.status !== null)) {
          findings.push({
            rule: "V07",
            severity: "error",
            path: lesson.ref,
            message: `exercise '${exercise.id}': solution fails on test case '${tc.name}': ${lastErrorLine(res.stderr ?? String(res.error))}`,
          });
          continue;
        }
        if (normalizeOutput(res.stdout ?? "") !== normalizeOutput(tc.expectedOutput)) {
          findings.push({
            rule: "V07",
            severity: "error",
            path: lesson.ref,
            message: `exercise '${exercise.id}': solution output does not match test case '${tc.name}' — a solution that fails its own tests can never ship`,
          });
        }
      }
    }
  }

  return findings;
}

export function lastErrorLine(stderr: string): string {
  const lines = stderr.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] ?? "unknown error";
}

function truncate(s: string, n = 80): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** Sections exempt from execution (imported by rules.ts for cross-checks). */
export { NO_VERIFY_SECTIONS };
