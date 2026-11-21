"use client";

/**
 * Standalone playground page — a full-size Python editor for free practice.
 */
import { Lightbulb, Terminal } from "lucide-react";
import { PythonPlayground } from "@/components/playground/PythonPlayground";
import { Reveal } from "@/components/academy/motion";

const SAMPLE = `# Welcome to the Python playground — real Python, running in your browser.
# Press Run (or Ctrl/Cmd + Enter). Change anything you like.

print("Hello, Python!")
print("Watch me compute:", 1984 + 8771)
print("And repeat text:", "ha" * 3)

for number in [3, 1, 4, 1, 5]:
    print("digit:", number)
`;

export function PlaygroundView() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-6 w-6 text-success-text" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Python playground</h1>
        </div>
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Real CPython (via WebAssembly) running entirely in your browser — no setup, nothing installed, nothing
          sent anywhere. Use it for any exercise in this course, or just to experiment. The first run downloads the
          Python engine once; your browser caches it after that.
        </p>
      </header>

      <PythonPlayground initialCode={SAMPLE} editorHeight="h-[420px]" />

      <Reveal as="section" className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          Playground notes
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground/85">
          <li>Ctrl/Cmd + Enter runs the code. Tab inserts 4 spaces. Enter auto-indents after a colon.</li>
          <li>Everything from the course works here: loops, functions, classes, comprehensions, exceptions.</li>
          <li>
            <span className="font-mono">input()</span> is not available in the browser sandbox — it returns an empty
            string with an explanation. Run input-based programs on your own computer.
          </li>
          <li>A program that runs longer than 20 seconds is stopped automatically (infinite-loop protection).</li>
        </ul>
      </Reveal>
    </div>
  );
}
