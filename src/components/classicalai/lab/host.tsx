"use client";

/**
 * The Classical AI Laboratory host — the unified laboratory interface.
 * A left rail (the elegant laboratory navigation) lists the nine labs in
 * four groups; the overview grid is the topic selector when no lab is
 * chosen. Every lab renders inside the same frame: visualization area,
 * parameter controls, algorithm explanation, execution controls, results
 * panel, step-by-step execution, reset, and educational insights — all
 * running genuine algorithm logic (see each lab file).
 */
import {
  ArrowRight,
  FlaskConical,
  Gamepad2,
  GitBranch,
  Gauge,
  Network,
  Puzzle,
  Scale,
  Swords,
  Thermometer,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/academy/motion";
import { SearchLab } from "./lab-search";
import { HeuristicLab } from "./lab-heuristic";
import { GameTreeLab } from "./lab-gametree";
import { CspLab } from "./lab-csp";
import { LogicLab } from "./lab-logic";
import { ExpertLab } from "./lab-expert";
import { PlanningLab } from "./lab-planning";
import { BayesLab } from "./lab-bayes";
import { FuzzyLab } from "./lab-fuzzy";

export const CLASSICAL_LABS = [
  {
    id: "search",
    group: "Search & heuristics",
    name: "Search Algorithm Visualizer",
    short: "Search algorithms",
    desc: "BFS, DFS, uniform-cost, greedy best-first and A* on real weighted maps — Romania, a city grid, a trap, or your own graph.",
    icon: Network,
  },
  {
    id: "heuristic",
    group: "Search & heuristics",
    name: "Heuristic Search Explorer",
    short: "Heuristics",
    desc: "Edit h at every node and watch A* and greedy reorder; the audit computes admissibility and consistency against true costs.",
    icon: Gauge,
  },
  {
    id: "gametree",
    group: "Games & constraints",
    name: "Game Tree Visualizer",
    short: "Minimax & α–β",
    desc: "Minimax and alpha-beta on editable trees: backed-up values, the live α–β window, cuts and the measured pruning dividend.",
    icon: Swords,
  },
  {
    id: "csp",
    group: "Games & constraints",
    name: "Constraint Satisfaction Lab",
    short: "CSPs",
    desc: "N-Queens, Australia colouring and 4×4 Sudoku on one backtracking engine with MRV and forward checking, compared live.",
    icon: Puzzle,
  },
  {
    id: "logic",
    group: "Logic & knowledge",
    name: "Logic Laboratory",
    short: "Logic",
    desc: "A real formula parser builds truth tables; the entailment checker hunts counterexamples; quantifiers run over a blocks world.",
    icon: Scale,
  },
  {
    id: "expert",
    group: "Logic & knowledge",
    name: "Expert System Builder",
    short: "Expert systems",
    desc: "Inspect and extend a rule base; forward chaining with conflict resolution and certainty factors; backward chaining with the WHY trace.",
    icon: Workflow,
  },
  {
    id: "planning",
    group: "Actions & uncertainty",
    name: "Automated Planning Lab",
    short: "Planning",
    desc: "A genuine STRIPS blocks world: preconditions, add/delete effects, progression search — including the Sussman anomaly — and plan playback.",
    icon: Gamepad2,
  },
  {
    id: "bayes",
    group: "Actions & uncertainty",
    name: "Bayesian Network Explorer",
    short: "Bayesian networks",
    desc: "The canonical alarm and sprinkler networks with editable CPTs, evidence by clicking, and inference by genuine enumeration.",
    icon: GitBranch,
  },
  {
    id: "fuzzy",
    group: "Actions & uncertainty",
    name: "Fuzzy Logic Playground",
    short: "Fuzzy logic",
    desc: "Draggable membership functions, rules firing in proportion to belief, clipped sets, aggregation and centroid defuzzification.",
    icon: Thermometer,
  },
] as const;

export type ClassicalLabId = (typeof CLASSICAL_LABS)[number]["id"];

const GROUPS = [...new Set(CLASSICAL_LABS.map((l) => l.group))];

export function isClassicalLabId(id: string): id is ClassicalLabId {
  return CLASSICAL_LABS.some((l) => l.id === id);
}

export function ClassicalAILab({ labId, navigate }: { labId?: string; navigate: (hash: string) => void }) {
  const active = labId && isClassicalLabId(labId) ? labId : null;

  return (
    <div className="min-w-0">
      <div className="dv-band border-b border-border-subtle">
        <div className="dv-container py-8 sm:py-10">
          <p className="eyebrow text-viz-3">School J · the laboratories</p>
          <h1 className="t-display mt-2 text-ink">The Classical AI Laboratory</h1>
          <p className="t-lede mt-3 max-w-3xl">
            Nine interactive environments where the algorithms of the course actually run — every frontier, window,
            domain, rule firing and posterior on screen is computed by the genuine logic, step by step, in your browser.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[218px_minmax(0,1fr)]">
          {/* the rail */}
          <nav aria-label="Laboratory navigation" className="lg:sticky lg:top-20 lg:self-start">
            <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              <button
                type="button"
                onClick={() => navigate("#/classical/lab")}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                  !active ? "bg-viz-3 text-white shadow-e1" : "text-ink-2 hover:bg-surface-subtle hover:text-ink"
                )}
              >
                <FlaskConical className="h-4 w-4 shrink-0" />
                Overview
              </button>
              {GROUPS.map((g) => (
                <div key={g} className="flex min-w-fit flex-col gap-1.5 lg:min-w-0">
                  <p className="mt-2 hidden px-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3 lg:block">
                    {g}
                  </p>
                  {CLASSICAL_LABS.filter((l) => l.group === g).map((l) => {
                    const Icon = l.icon;
                    const on = active === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => navigate(`#/classical/lab/${l.id}`)}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                          on ? "bg-viz-3 text-white shadow-e1" : "text-ink-2 hover:bg-surface-subtle hover:text-ink"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap lg:whitespace-normal">{l.short}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* the lab (or the overview grid) */}
          <div key={active ?? "overview"} className={cn("min-w-0", active && "dv-fade-up")}>
            {active === "search" && <SearchLab />}
            {active === "heuristic" && <HeuristicLab />}
            {active === "gametree" && <GameTreeLab />}
            {active === "csp" && <CspLab />}
            {active === "logic" && <LogicLab />}
            {active === "expert" && <ExpertLab />}
            {active === "planning" && <PlanningLab />}
            {active === "bayes" && <BayesLab />}
            {active === "fuzzy" && <FuzzyLab />}
            {!active && <LabOverview navigate={navigate} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function LabOverview({ navigate }: { navigate: (hash: string) => void }) {
  return (
    <Reveal className="space-y-6">
      <p className="t-body max-w-3xl">
        A research environment simple enough for a first course: pick a bench, adjust the parameters, and step through
        the real execution — pause, rewind, run at speed, reset. Nothing here is a canned animation; every visualization
        is the algorithm&apos;s own trace, and every insight is computed from the run you just watched.
      </p>
      {GROUPS.map((g) => (
        <section key={g}>
          <h2 className="t-section mb-3 text-ink">{g}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {CLASSICAL_LABS.filter((l) => l.group === g).map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => navigate(`#/classical/lab/${l.id}`)}
                  className="group flex flex-col rounded-2xl border border-border-subtle bg-surface p-5 text-left shadow-e1 dv-lift hover:-translate-y-0.5 hover:shadow-e2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]">
                      <Icon className="h-5 w-5 text-viz-3" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-3 opacity-0 dv-lift group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                  <p className="t-item mt-4 text-ink group-hover:text-viz-3">{l.name}</p>
                  <p className="t-caption mt-1.5 flex-1">{l.desc}</p>
                  <p className="mt-4 flex items-center gap-1.5 border-t border-border-subtle pt-3 font-mono text-[11px] uppercase tracking-wider text-ink-3">
                    <FlaskConical className="h-3.5 w-3.5" />
                    genuine algorithm · step-by-step
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </Reveal>
  );
}
