"use client";

/**
 * DataVerse Academy — the complete learning platform shell.
 *
 * A single-page experience (the only user-visible route), hash-routed:
 *   #/                     academy home — the institutional front door
 *   #/dashboard            the personalized student dashboard (auth-gated)
 *   #/assessments          the Assessment Center
 *   #/assessment/<id>      a quiz runner (MCQ/numerical/short, timed, finals)
 *   #/challenge/<id>       a server-graded coding challenge
 *   #/study/<lessonId>     the lesson reader with real progress posting
 *   #/explore              the full catalogue (programmes, schools, subjects)
 *   #/projects             the practical-project hub
 *   #/career               the Career Centre
 *   #/tutor                Ada, the AI personal tutor (auth-gated)
 *   #/school/<slug>        one school's subject catalog
 *   #/subject/<slug>       a subject's full curriculum + prerequisite state
 *   #/roadmap              staged roadmaps with pace control
 *   #/labs                 the Learning Laboratories hub
 *   #/lab/<discipline>     one of the seven lab workspaces
 *   #/placement            placement hub (test out of what you know)
 *   #/placement/<slug>     a subject's placement test
 *   #/course               The Complete Python Programming Course
 *   #/part/<A..J>          one course part (lessons/exercises/assessment/project)
 *   #/lesson/<a-01>        the Python course lesson reader
 *   #/playground           the in-browser Python playground
 *   #/classical            Classical Artificial Intelligence (School J's course)
 *   #/classical/part/<A-F> one part of the Classical AI course
 *   #/classical/lesson/<a-01>  the Classical AI digital-textbook reader
 *   #/sql…                 the SQL course, lab, case studies
 *   #/math…                the Mathematics course + diagnostic
 *   #/numpy…               the NumPy course + playground
 *
 * All curriculum structure is typed registry data — adding subjects or
 * lessons means adding data, never application code. Guest course progress
 * persists to localStorage per browser; account progress (dashboard,
 * assessments, tutor) lives on the server. Global chrome (header/footer/brand)
 * lives in src/components/academy/shell.tsx.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { PYTHON_COURSE } from "@/content/python";
import { SQL_COURSE } from "@/content/sql";
import { SQL_CASE_STUDIES } from "@/content/sql/case-studies";
import { MATH_COURSE } from "@/content/math";
import { NUMPY_COURSE } from "@/content/numpy";
import { CLASSICAL_AI_COURSE } from "@/content/classical-ai";
import { AcademyHome } from "@/components/academy/home";
import { ExploreView } from "@/components/academy/explore";
import { ProjectsView } from "@/components/academy/projects";
import { CareerView } from "@/components/academy/career";
import { TutorView } from "@/components/academy/tutor";
import { SchoolView } from "@/components/academy/school";
import { ClassicalAIView } from "@/components/academy/classical-ai";
import { SubjectView } from "@/components/academy/subject";
import { RoadmapView } from "@/components/academy/roadmap";
import { PlacementHub, PlacementTest } from "@/components/academy/placement";
import { SiteHeader, SiteFooter, type ShellRoute } from "@/components/academy/shell";
import { PlatformGuide, TermsOfUse, PrivacyNotice } from "@/components/academy/institution";
import { LabsHub } from "@/components/labs/LabsHub";
import { LabWorkspace } from "@/components/labs/LabWorkspace";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AssessmentCenter } from "@/components/assessments/AssessmentCenter";
import { AssessmentRunner } from "@/components/assessments/AssessmentRunner";
import { CodingChallenge } from "@/components/assessments/CodingChallenge";
import { LessonStudy } from "@/components/study/LessonStudy";
import { HomeView } from "@/components/course/home";
import { PartView } from "@/components/course/part";
import { LessonView } from "@/components/course/lesson";
import { PlaygroundView } from "@/components/course/playground-page";
import { SqlHomeView } from "@/components/sqlcourse/home";
import { SqlPartView } from "@/components/sqlcourse/part";
import { SqlLessonView } from "@/components/sqlcourse/lesson";
import { SqlCaseStudiesHub, SqlCaseView } from "@/components/sqlcourse/case";
import { SqlLab } from "@/components/sql-lab/SqlLab";
import { MathHomeView } from "@/components/math/home";
import { MathPartView } from "@/components/math/part";
import { MathLessonView } from "@/components/math/lesson";
import { DiagnosticView } from "@/components/math/diagnostic";
import { NumpyHomeView } from "@/components/numpy/home";
import { NumpyPartView } from "@/components/numpy/part";
import { NumpyLessonView } from "@/components/numpy/lesson";
import { NumpyPlaygroundView } from "@/components/numpy/playground-page";
import { ClassicalCourseHome } from "@/components/classicalai/home";
import { ClassicalPartView } from "@/components/classicalai/part";
import { ClassicalLessonView } from "@/components/classicalai/lesson";
import { ClassicalAILab } from "@/components/classicalai/lab/host";
import { DATA_VIZ_COURSE } from "@/content/dataviz";
import { DataVizHome } from "@/components/dataviz/home";
import { DataVizPartView } from "@/components/dataviz/part";
import { DataVizLessonView } from "@/components/dataviz/lesson";
import { VizPlayground } from "@/components/dataviz/Playground";
import { VisualLibrary, VisualFocus } from "@/components/viz/library";
import { DapHome } from "@/components/dap/home";
import { DapWorkspace } from "@/components/dap/workspace";

type Route =
  | { view: "academy" }
  | { view: "dashboard" }
  | { view: "assessments" }
  | { view: "assessment"; id: string }
  | { view: "challenge"; id: string }
  | { view: "study"; lessonId: string }
  | { view: "lab"; discipline: string; exercise?: number }
  | { view: "explore" }
  | { view: "projects" }
  | { view: "career" }
  | { view: "tutor" }
  | { view: "course" }
  | { view: "school"; slug: string }
  | { view: "subject"; slug: string }
  | { view: "roadmap"; roadmap?: string }
  | { view: "labs" }
  | { view: "placement-hub"; goal?: string }
  | { view: "placement-test"; slug: string }
  | { view: "part"; letter: string }
  | { view: "lesson"; slug: string }
  | { view: "playground" }
  | { view: "classical-home" }
  | { view: "classical-part"; letter: string }
  | { view: "classical-lesson"; slug: string }
  | { view: "classical-lab"; lab?: string }
  | { view: "sql-home" }
  | { view: "sql-part"; letter: string }
  | { view: "sql-lesson"; slug: string }
  | { view: "sql-lab"; db?: string }
  | { view: "sql-cases" }
  | { view: "sql-case"; id: string }
  | { view: "math-home" }
  | { view: "math-part"; letter: string }
  | { view: "math-lesson"; slug: string }
  | { view: "math-diagnostic" }
  | { view: "numpy-home" }
  | { view: "numpy-part"; letter: string }
  | { view: "numpy-lesson"; slug: string }
  | { view: "numpy-playground" }
  | { view: "viz-home" }
  | { view: "viz-part"; letter: string }
  | { view: "viz-lesson"; slug: string }
  | { view: "viz-playground" }
  | { view: "visuals" }
  | { view: "visual"; id: string }
  | { view: "dap-home" }
  | { view: "dap-project"; id: string }
  | { view: "docs" }
  | { view: "terms" }
  | { view: "privacy" };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = clean.split("?");
  const params = new URLSearchParams(queryPart ?? "");
  const [head, arg] = pathPart.split("/");
  if (head === "numpy") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    switch (sub) {
      case undefined:
      case "":
        return { view: "numpy-home" };
      case "playground":
        return { view: "numpy-playground" };
      case "part":
        return subArg ? { view: "numpy-part", letter: subArg.toUpperCase() } : { view: "numpy-home" };
      case "lesson":
        return subArg ? { view: "numpy-lesson", slug: subArg.toLowerCase() } : { view: "numpy-home" };
      default:
        return { view: "numpy-home" };
    }
  }
  if (head === "math") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    switch (sub) {
      case undefined:
      case "":
        return { view: "math-home" };
      case "diagnostic":
        return { view: "math-diagnostic" };
      case "part":
        return subArg ? { view: "math-part", letter: subArg.toUpperCase() } : { view: "math-home" };
      case "lesson":
        return subArg ? { view: "math-lesson", slug: subArg.toLowerCase() } : { view: "math-home" };
      default:
        return { view: "math-home" };
    }
  }
  if (head === "sql") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    switch (sub) {
      case undefined:
      case "":
        return { view: "sql-home" };
      case "part":
        return subArg ? { view: "sql-part", letter: subArg.toUpperCase() } : { view: "sql-home" };
      case "lesson":
        return subArg ? { view: "sql-lesson", slug: subArg.toLowerCase() } : { view: "sql-home" };
      case "lab":
        return { view: "sql-lab", db: params.get("db") ?? undefined };
      case "cases":
        return { view: "sql-cases" };
      case "case":
        return subArg ? { view: "sql-case", id: subArg.toLowerCase() } : { view: "sql-cases" };
      default:
        return { view: "sql-home" };
    }
  }
  if (head === "classical") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    switch (sub) {
      case undefined:
      case "":
        return { view: "classical-home" };
      case "lab":
        return { view: "classical-lab", lab: subArg };
      case "part":
        return subArg ? { view: "classical-part", letter: subArg.toUpperCase() } : { view: "classical-home" };
      case "lesson":
        return subArg ? { view: "classical-lesson", slug: subArg.toLowerCase() } : { view: "classical-home" };
      default:
        return { view: "classical-home" };
    }
  }
  if (head === "viz") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    switch (sub) {
      case undefined:
      case "":
        return { view: "viz-home" };
      case "playground":
        return { view: "viz-playground" };
      case "part":
        return subArg ? { view: "viz-part", letter: subArg.toUpperCase() } : { view: "viz-home" };
      case "lesson":
        return subArg ? { view: "viz-lesson", slug: subArg.toLowerCase() } : { view: "viz-home" };
      default:
        return { view: "viz-home" };
    }
  }
  if (head === "dap") {
    const [sub, subArg] = pathPart.split("/").slice(1) as string[];
    if (sub === "project" && subArg) return { view: "dap-project", id: subArg.toLowerCase() };
    return { view: "dap-home" };
  }
  switch (head) {
    case "":
      return { view: "academy" };
    case "dashboard":
      return { view: "dashboard" };
    case "assessments":
      return { view: "assessments" };
    case "assessment":
      return arg ? { view: "assessment", id: decodeURIComponent(arg) } : { view: "assessments" };
    case "challenge":
      return arg ? { view: "challenge", id: decodeURIComponent(arg) } : { view: "assessments" };
    case "study":
      return arg ? { view: "study", lessonId: decodeURIComponent(arg) } : { view: "dashboard" };
    case "lab": {
      const [sub] = pathPart.split("/").slice(1) as string[];
      if (!sub) return { view: "labs" };
      const ex = params.get("ex");
      return {
        view: "lab",
        discipline: sub,
        exercise: ex !== null && /^\d+$/.test(ex) ? Number(ex) : undefined,
      };
    }
    case "explore":
      return { view: "explore" };
    case "projects":
      return { view: "projects" };
    case "career":
      return { view: "career" };
    case "tutor":
      return { view: "tutor" };
    case "course":
      return { view: "course" };
    case "school":
      return arg ? { view: "school", slug: decodeURIComponent(arg) } : { view: "academy" };
    case "subject":
      return arg ? { view: "subject", slug: decodeURIComponent(arg) } : { view: "academy" };
    case "roadmap":
      return { view: "roadmap", roadmap: params.get("roadmap") ?? undefined };
    case "labs":
      return { view: "labs" };
    case "visuals":
    case "visual":
    case "demos":
      return arg ? { view: "visual", id: arg } : { view: "visuals" };
    case "placement":
      return arg
        ? { view: "placement-test", slug: decodeURIComponent(arg) }
        : { view: "placement-hub", goal: params.get("goal") ?? undefined };
    case "part":
      return arg ? { view: "part", letter: decodeURIComponent(arg).toUpperCase() } : { view: "course" };
    case "lesson":
      return arg ? { view: "lesson", slug: decodeURIComponent(arg).toLowerCase() } : { view: "course" };
    case "playground":
      return { view: "playground" };
    case "docs":
    case "guide":
      return { view: "docs" };
    case "terms":
      return { view: "terms" };
    case "privacy":
      return { view: "privacy" };
    default:
      return { view: "academy" };
  }
}

function useHashRoute() {
  // SSR renders the home view; after mount we read the real hash. This keeps
  // server/client markup identical (no hydration mismatch) while still
  // supporting direct links like #/subject/pandas.
  const [route, setRoute] = useState<Route>({ view: "academy" });

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    sync();

    // The Next.js App Router runs a one-time history.replaceState after
    // hydration to reconcile the URL with its router state. That correction
    // strips a fragment that changed between first paint and hydration
    // (a hash pasted mid-load, extension or assistive-tech navigation).
    // In-app navigation only ever moves between "#/…" fragments, so a
    // hashchange that empties the fragment is always this bootstrap
    // correction — remember the intended fragment and re-assert it.
    let intended = window.location.hash;
    const onHashChange = () => {
      if (!window.location.hash && intended) {
        window.location.hash = intended; // fires hashchange again → syncs
        return;
      }
      intended = window.location.hash;
      sync();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}

export default function Page() {
  const { route, navigate } = useHashRoute();

  // A content-derived route key: identical when the view and its argument are
  // unchanged, different the moment either changes. It remounts the view
  // wrapper below so the page-enter transition plays exactly once per real
  // navigation (and deep links like #/lab/python?ex=3 mount the right state).
  const viewKey = useMemo(() => JSON.stringify(route), [route]);

  // A fresh route is a fresh page — reset scroll. The instant override
  // matters: the canvas scrolls smoothly by default, and the page-enter
  // animation must never compete with a smooth scroll ride.
  useEffect(() => {
    const root = document.documentElement;
    const saved = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = saved;
  }, [viewKey]);
  const part = route.view === "part" ? PYTHON_COURSE.parts.find((p) => p.letter === route.letter) : undefined;
  const sqlPart = route.view === "sql-part" ? SQL_COURSE.parts.find((p) => p.letter === route.letter) : undefined;
  const sqlCase = route.view === "sql-case" ? SQL_CASE_STUDIES.find((c) => c.id === route.id) : undefined;
  const mathPart = route.view === "math-part" ? MATH_COURSE.parts.find((p) => p.letter === route.letter) : undefined;
  const numpyPart = route.view === "numpy-part" ? NUMPY_COURSE.parts.find((p) => p.letter === route.letter) : undefined;
  const classicalPart =
    route.view === "classical-part" ? CLASSICAL_AI_COURSE.parts.find((p) => p.letter === route.letter) : undefined;
  const vizPart =
    route.view === "viz-part" ? DATA_VIZ_COURSE.parts.find((p) => p.letter === route.letter) : undefined;

  // Map the parsed route to the shell's coarse navigation state.
  const shellRoute: ShellRoute =
    route.view.startsWith("sql")
      ? route.view === "sql-lab" ? "sql-lab" : "sql"
      : route.view.startsWith("math") ? "math"
      : route.view.startsWith("numpy") ? "numpy"
      : route.view.startsWith("classical")
        ? route.view === "classical-home" ? "course" : route.view === "classical-part" ? "part" : route.view === "classical-lab" ? "playground" : "lesson"
      : route.view.startsWith("viz")
        ? route.view === "viz-home" ? "course" : route.view === "viz-part" ? "part" : route.view === "viz-playground" ? "playground" : "lesson"
      : route.view.startsWith("dap")
        ? "projects"
      : route.view === "academy" || route.view === "school" || route.view === "subject"
        || route.view === "placement-hub" || route.view === "placement-test" ? "academy"
      : route.view === "dashboard" ? "dashboard"
      : route.view === "assessments" || route.view === "assessment" || route.view === "challenge" ? "assessments"
      : route.view === "study" ? "lesson"
      : route.view === "lab" ? "playground"
      : route.view === "visuals" || route.view === "visual" ? "visuals"
      : route.view === "explore" ? "explore"
      : route.view === "projects" ? "projects"
      : route.view === "career" ? "career"
      : route.view === "tutor" ? "tutor"
      : route.view === "roadmap" ? "roadmap"
      : route.view === "labs" ? "labs"
      : route.view === "playground" ? "playground"
      : route.view === "docs" || route.view === "terms" || route.view === "privacy" ? "platform"
      : route.view === "course" || route.view === "part" || route.view === "lesson" ? "course"
      : "academy";

  const notFound = (title: string, back: string, hash: string, tone: string) => (
    <div className="rounded-xl border bg-card p-8 text-center">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <button onClick={() => navigate(hash)} className={`mt-3 text-sm font-medium hover:underline ${tone}`}>
        {back}
      </button>
    </div>
  );

  return (
    /* overflow-x-clip — a one-line document guard: no descendant (decorative
       bleeds, wide tables, overscrolled code) may ever create horizontal
       page scroll. Per CSS Overflow 3, `clip` on one axis leaves the other
       axis `visible`, so vertical scrolling is untouched and no scroll
       container is created (position: sticky keeps working). */
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      {/* Skip to content — the first tab stop (WCAG 2.4.1). A button, not
          an anchor: the app is hash-routed, so an #main link would be
          parsed as a route. */}
      <button
        type="button"
        className="dv-skip-link"
        onClick={() => {
          const main = document.querySelector("main");
          if (main instanceof HTMLElement) {
            main.setAttribute("tabindex", "-1");
            main.focus({ preventScroll: false });
          }
        }}
      >
        Skip to content
      </button>
      <SiteHeader route={shellRoute} navigate={navigate} />

      {/* The academy home and the textbook readers compose their own
          full-bleed layouts; every other view lives inside the standard
          content column. */}
      {route.view === "academy" ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            <AcademyHome navigate={navigate} />
          </div>
        </main>
      ) : route.view === "school" && route.slug === "classical-ai" ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            <ClassicalAIView navigate={navigate} />
          </div>
        </main>
      ) : route.view === "classical-lesson" ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            <ClassicalLessonView course={CLASSICAL_AI_COURSE} slug={route.slug} navigate={navigate} />
          </div>
        </main>
      ) : route.view === "classical-lab" ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            <ClassicalAILab labId={route.lab} navigate={navigate} />
          </div>
        </main>
      ) : route.view === "viz-lesson" ? (
        /* The five textbook readers compose their own full-bleed,
           three-pane layouts. */
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            <DataVizLessonView course={DATA_VIZ_COURSE} slug={route.slug} navigate={navigate} />
          </div>
        </main>
      ) : route.view.startsWith("viz") ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
          {route.view === "viz-home" && <DataVizHome course={DATA_VIZ_COURSE} navigate={navigate} />}
          {route.view === "viz-playground" && <VizPlayground />}
          {route.view === "viz-part" &&
            (vizPart ? (
              <DataVizPartView course={DATA_VIZ_COURSE} part={vizPart} navigate={navigate} />
            ) : (
              <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                <p className="text-sm text-ink-3">Part {route.letter} of the Data Visualization course is not published yet.</p>
                <button onClick={() => navigate("#/viz")} className="mt-3 text-sm font-semibold text-viz-10">
                  ← Back to the course
                </button>
              </div>
            ))}
          </div>
        </main>
      ) : route.view === "lesson" || route.view === "sql-lesson" || route.view === "math-lesson" || route.view === "numpy-lesson" ? (
        <main className="flex-1">
          <div key={viewKey} className="dv-page">
            {route.view === "lesson" && <LessonView course={PYTHON_COURSE} slug={route.slug} navigate={navigate} />}
            {route.view === "sql-lesson" && <SqlLessonView course={SQL_COURSE} slug={route.slug} navigate={navigate} />}
            {route.view === "math-lesson" && <MathLessonView course={MATH_COURSE} slug={route.slug} navigate={navigate} />}
            {route.view === "numpy-lesson" && <NumpyLessonView course={NUMPY_COURSE} slug={route.slug} navigate={navigate} />}
          </div>
        </main>
      ) : (
        <main
          className={
            route.view === "dashboard" || route.view === "lab" || route.view === "assessments" || route.view === "assessment" || route.view === "challenge" || route.view === "study" || route.view === "visuals" || route.view === "visual"
              ? "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
              : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
          }
        >
          <div key={viewKey} className="dv-page">
          {route.view === "dashboard" && <StudentDashboard navigate={navigate} />}

          {route.view === "assessments" && <AssessmentCenter navigate={navigate} />}

          {route.view === "assessment" && <AssessmentRunner quizId={route.id} navigate={navigate} />}

          {route.view === "challenge" && <CodingChallenge exerciseId={route.id} navigate={navigate} />}

          {route.view === "study" && <LessonStudy lessonId={route.lessonId} navigate={navigate} />}

          {route.view === "lab" && <LabWorkspace disciplineId={route.discipline} initialExercise={route.exercise} navigate={navigate} />}

          {route.view === "dap-home" && <DapHome navigate={navigate} />}

          {route.view === "dap-project" && <DapWorkspace projectId={route.id} navigate={navigate} />}

          {route.view === "docs" && <PlatformGuide navigate={navigate} />}

          {route.view === "terms" && <TermsOfUse navigate={navigate} />}

          {route.view === "privacy" && <PrivacyNotice navigate={navigate} />}

          {route.view === "explore" && <ExploreView navigate={navigate} />}

          {route.view === "projects" && <ProjectsView navigate={navigate} />}

          {route.view === "career" && <CareerView navigate={navigate} />}

          {route.view === "tutor" && <TutorView />}

          {route.view === "school" && <SchoolView slug={route.slug} navigate={navigate} />}

          {route.view === "subject" && <SubjectView slug={route.slug} navigate={navigate} />}

          {route.view === "roadmap" && <RoadmapView navigate={navigate} initialRoadmap={route.roadmap} />}

          {route.view === "labs" && <LabsHub navigate={navigate} />}

          {route.view === "visuals" && <VisualLibrary navigate={navigate} />}

          {route.view === "visual" && <VisualFocus id={route.id} navigate={navigate} />}

          {route.view === "placement-hub" && <PlacementHub navigate={navigate} initialGoal={route.goal} />}

          {route.view === "placement-test" && <PlacementTest slug={route.slug} navigate={navigate} />}

          {route.view === "course" && <HomeView course={PYTHON_COURSE} navigate={navigate} />}

          {route.view === "part" &&
            (part ? (
              <PartView course={PYTHON_COURSE} part={part} navigate={navigate} />
            ) : (
              notFound(`Part ${route.letter} not found`, "Back to the course home", "#/course", "text-primary")
            ))}

          {route.view === "playground" && <PlaygroundView />}

          {route.view === "classical-home" && (
            <ClassicalCourseHome course={CLASSICAL_AI_COURSE} navigate={navigate} />
          )}

          {route.view === "classical-part" &&
            (classicalPart ? (
              <ClassicalPartView course={CLASSICAL_AI_COURSE} part={classicalPart} navigate={navigate} />
            ) : (
              notFound(
                `Part ${route.letter} not found`,
                "Back to the course home",
                "#/classical",
                "text-viz3"
              )
            ))}

          {route.view === "math-home" && <MathHomeView course={MATH_COURSE} navigate={navigate} />}

          {route.view === "math-diagnostic" && <DiagnosticView course={MATH_COURSE} navigate={navigate} />}

          {route.view === "math-part" &&
            (mathPart ? (
              <MathPartView course={MATH_COURSE} part={mathPart} navigate={navigate} />
            ) : (
              notFound(`Part ${route.letter} not found`, "Back to the math course home", "#/math", "text-hue-math")
            ))}

          {route.view === "numpy-home" && <NumpyHomeView course={NUMPY_COURSE} navigate={navigate} />}

          {route.view === "numpy-playground" && <NumpyPlaygroundView />}

          {route.view === "numpy-part" &&
            (numpyPart ? (
              <NumpyPartView course={NUMPY_COURSE} part={numpyPart} navigate={navigate} />
            ) : (
              notFound(`Part ${route.letter} not found`, "Back to the NumPy course home", "#/numpy", "text-hue-numpy")
            ))}

          {route.view === "sql-home" && <SqlHomeView course={SQL_COURSE} cases={SQL_CASE_STUDIES} navigate={navigate} />}

          {route.view === "sql-part" &&
            (sqlPart ? (
              <SqlPartView course={SQL_COURSE} part={sqlPart} navigate={navigate} />
            ) : (
              notFound(`Part ${route.letter} not found`, "Back to the SQL course home", "#/sql", "text-hue-sql")
            ))}

          {route.view === "sql-lab" && <SqlLab initialDataset={route.db as "ecommerce" | undefined} />}

          {route.view === "sql-cases" && <SqlCaseStudiesHub cases={SQL_CASE_STUDIES} navigate={navigate} />}

          {route.view === "sql-case" &&
            (sqlCase ? (
              <SqlCaseView study={sqlCase} navigate={navigate} />
            ) : (
              notFound(`Case study not found: ${route.id}`, "All case studies", "#/sql/cases", "text-hue-sql")
            ))}
          </div>
        </main>
      )}

      <SiteFooter navigate={navigate} />
    </div>
  );
}
