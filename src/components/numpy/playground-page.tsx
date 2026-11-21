"use client";

/**
 * Standalone NumPy playground page — a full-size NumPy-enabled editor for
 * free practice. Same engine as the lesson playgrounds: real CPython +
 * NumPy via WebAssembly, entirely in the browser.
 */
import { Grid3x3, Lightbulb } from "lucide-react";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { Reveal } from "@/components/academy/motion";

const SAMPLE = `# Welcome to the NumPy playground — real NumPy, running in your browser.
# Press Run (or Ctrl/Cmd + Enter). Change anything you like.

import numpy as np

a = np.array([[1, 2, 3],
              [4, 5, 6]])

print("a =", a, sep="\\n")
print("shape:", a.shape, "dtype:", a.dtype)

print("row means:", a.mean(axis=1))
print("doubled + 100:", (a * 2 + 100).tolist())
`;

export function NumpyPlaygroundView() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Grid3x3 className="h-6 w-6 text-cyan-700 dark:text-cyan-300" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">NumPy playground</h1>
        </div>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Real CPython + NumPy (via WebAssembly) running entirely in your browser — no installation, nothing sent
          anywhere. Use it for any exercise in the course, or just to experiment. The first run downloads the
          engine once (~16 MB); your browser caches it after that.
        </p>
      </header>

      <PythonPlayground
        initialCode={SAMPLE}
        editorHeight="h-[420px]"
        packages={["numpy"]}
        engineLabel="NumPy playground"
        firstLoadNote="First run downloads the Python + NumPy engine once (~16 MB, cached afterwards by your browser)."
      />

      <Reveal as="section" className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          Playground notes
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground/85">
          <li>
            NumPy is available as <span className="font-mono">np</span> after{" "}
            <span className="font-mono">import numpy as np</span> (the starter code already does this).
          </li>
          <li>Ctrl/Cmd + Enter runs the code. Tab inserts 4 spaces. Enter auto-indents after a colon.</li>
          <li>
            <span className="font-mono">input()</span> is not available in the browser sandbox, and file functions
            (<span className="font-mono">np.loadtxt</span> and friends) have no real filesystem to read — the course
            covers them with terminal examples.
          </li>
          <li>A program that runs longer than 60 seconds is stopped automatically (infinite-loop protection).</li>
        </ul>
      </Reveal>
    </div>
  );
}
