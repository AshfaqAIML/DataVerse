"use client";

/**
 * DataVizHome — the Data Visualization Academy's front door: course
 * hero, the five parts at a glance, and the two laboratory doors
 * (Chart Playground + interpretation drills).
 */
import { BookOpen, ChartPie, FlaskConical, Hammer } from "lucide-react";
import { Reveal } from "@/components/academy/motion";
import type { DataVizCourse } from "@/lib/dataviz/types";
import { allDataVizLessons } from "@/lib/dataviz/types";
import { cn } from "@/lib/utils";

const PART_ACCENTS: Record<string, string> = {
  A: "bg-viz-10",
  B: "bg-gold-600",
  C: "bg-viz-2",
  D: "bg-viz-5",
  E: "bg-viz-9",
};

export function DataVizHome({
  course,
  navigate,
}: {
  course: DataVizCourse;
  navigate: (hash: string) => void;
}) {
  const lessons = allDataVizLessons(course);
  const totalMinutes = lessons.reduce((a, r) => a + r.lesson.minutes, 0);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-viz-10">
          School H · Data Visualization & BI
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-ink">
          The <span className="dv-gradient-text">Data Visualization</span> Academy
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          {course.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("#/viz")}
            className="inline-flex items-center gap-2 rounded-full bg-viz-10 px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-e1 dv-lift hover:-translate-y-0.5 hover:bg-viz-10/85"
          >
            <BookOpen className="h-4 w-4" />
            Start Part A
          </button>
          <button
            onClick={() => navigate("#/viz/playground")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 dv-lift hover:-translate-y-0.5 hover:border-viz-10 hover:text-viz-10"
          >
            <FlaskConical className="h-4 w-4" />
            Open the Chart Playground
          </button>
        </div>
        <p className="mt-4 text-xs font-medium text-ink-3">
          {course.parts.length} parts · {lessons.length} lessons · ~{Math.round(totalMinutes / 60)} hours · every chart rendered live from data
        </p>
      </header>

      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {course.parts.map((part) => {
          const n = part.modules.reduce(
            (a, m) => a + m.chapters.reduce((x, c) => x + c.lessons.length, 0),
            0,
          );
          return (
            <button
              key={part.letter}
              onClick={() => navigate(`#/viz/part/${part.letter}`)}
              className="group rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-lift hover:-translate-y-0.5 hover:border-viz-10/60 hover:shadow-e2"
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg font-serif text-lg font-bold text-white",
                    PART_ACCENTS[part.letter] ?? "bg-ink-3",
                  )}
                >
                  {part.letter}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                  {n} lessons
                </span>
              </div>
              <h2 className="mt-3 font-serif text-xl font-semibold text-ink group-hover:text-viz-10">
                {part.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{part.tagline}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-viz-10">
                Explore part →
              </p>
            </button>
          );
        })}
      </Reveal>

      <Reveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-viz-10/40 bg-viz-10/10 p-5">
          <ChartPie className="h-5 w-5 text-viz-10" />
          <h3 className="mt-2 font-serif text-lg font-semibold text-ink">Interpretation exercises</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            Every part asks you to read charts, not just draw them: what does this chart say, what does
            it hide, and would a different chart say it better?
          </p>
        </div>
        <div className="rounded-xl border border-warning-border bg-warning-bg/60 p-5">
          <Hammer className="h-5 w-5 text-gold-600" />
          <h3 className="mt-2 font-serif text-lg font-semibold text-ink">The practical arc</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            Foundations, then Matplotlib, Seaborn, Plotly, and the BI studios — each tool lesson pairs
            the chart it teaches with the exact code that draws it.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
