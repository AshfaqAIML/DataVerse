/**
 * Dependency graph over the curriculum registry.
 *
 * Subjects are nodes, `prerequisites` are directed edges
 * (prerequisite -> subject). The graph must be a DAG — cycles are a
 * hard registry error. All orderings are deterministic: ties break by
 * school order (A..I), then subject code (A1, A2, B1...).
 */
import type { SubjectDef } from "./types";

export class CurriculumGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurriculumGraphError";
  }
}

export interface DependencyGraph {
  /** Deterministic topological order of subject slugs. */
  order: string[];
  bySlug: Map<string, SubjectDef>;
  /** Direct hard prerequisites per subject. */
  prereqs: Map<string, string[]>;
  /** Direct dependents (subjects that list it as a hard prerequisite). */
  dependents: Map<string, string[]>;
  /** Longest prerequisite chain below each subject (0 for entry subjects). */
  depth: Map<string, number>;
}

const SCHOOL_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export function subjectSortKey(s: SubjectDef): string {
  return `${SCHOOL_ORDER.indexOf(s.school).toString().padStart(2, "0")}-${s.code}`;
}

/**
 * Builds the graph and performs a Kahn topological sort.
 * Throws CurriculumGraphError on unknown prerequisite references or cycles.
 */
export function buildGraph(subjects: SubjectDef[]): DependencyGraph {
  const bySlug = new Map<string, SubjectDef>();
  for (const s of subjects) {
    if (bySlug.has(s.slug)) throw new CurriculumGraphError(`Duplicate subject slug '${s.slug}'`);
    bySlug.set(s.slug, s);
  }

  const prereqs = new Map<string, string[]>();
  const dependents = new Map<string, string[]>();
  for (const s of subjects) {
    const hard: string[] = [];
    for (const p of s.prerequisites) {
      const target = bySlug.get(p);
      if (!target) throw new CurriculumGraphError(`Subject '${s.slug}' requires unknown prerequisite '${p}'`);
      if (p === s.slug) throw new CurriculumGraphError(`Subject '${s.slug}' lists itself as a prerequisite`);
      if (hard.includes(p)) continue;
      hard.push(p);
      if (!dependents.has(p)) dependents.set(p, []);
      dependents.get(p)!.push(s.slug);
    }
    prereqs.set(s.slug, hard);
  }

  // Kahn's algorithm with deterministic tie-breaking.
  const indegree = new Map<string, number>();
  for (const s of subjects) indegree.set(s.slug, prereqs.get(s.slug)!.length);
  const ready = subjects
    .filter((s) => indegree.get(s.slug) === 0)
    .sort((a, b) => subjectSortKey(a).localeCompare(subjectSortKey(b)))
    .map((s) => s.slug);
  const order: string[] = [];
  while (ready.length > 0) {
    const slug = ready.shift()!;
    order.push(slug);
    for (const dep of dependents.get(slug) ?? []) {
      const d = indegree.get(dep)! - 1;
      indegree.set(dep, d);
      if (d === 0) {
        ready.push(dep);
        ready.sort((a, b) => subjectSortKey(bySlug.get(a)!).localeCompare(subjectSortKey(bySlug.get(b)!)));
      }
    }
  }
  if (order.length !== subjects.length) {
    const cyclic = subjects.map((s) => s.slug).filter((slug) => !order.includes(slug));
    throw new CurriculumGraphError(`Prerequisite cycle detected among: ${cyclic.join(", ")}`);
  }

  // Longest chain depth (memoized over the topological order).
  const depth = new Map<string, number>();
  for (const slug of order) {
    const hard = prereqs.get(slug)!;
    depth.set(slug, hard.length === 0 ? 0 : 1 + Math.max(...hard.map((p) => depth.get(p)!)));
  }

  return { order, bySlug, prereqs, dependents, depth };
}

/** All transitive hard prerequisites of a subject (not including itself). */
export function prerequisiteClosure(graph: DependencyGraph, slug: string): string[] {
  const seen = new Set<string>();
  const stack = [...(graph.prereqs.get(slug) ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...(graph.prereqs.get(cur) ?? []));
  }
  return graph.order.filter((s) => seen.has(s));
}

/** All subjects that (transitively) depend on the given subject. */
export function dependentClosure(graph: DependencyGraph, slug: string): string[] {
  const seen = new Set<string>();
  const stack = [...(graph.dependents.get(slug) ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    stack.push(...(graph.dependents.get(cur) ?? []));
  }
  return graph.order.filter((s) => seen.has(s));
}

/**
 * Wave layering: groups subjects into stages where stage N contains every
 * subject whose longest prerequisite chain is N-1. Used to generate the
 * complete "Full Academy" roadmap — dependency-valid by construction.
 */
export function waveLayering(graph: DependencyGraph): string[][] {
  const waves = new Map<number, string[]>();
  for (const slug of graph.order) {
    const d = graph.depth.get(slug)!;
    if (!waves.has(d)) waves.set(d, []);
    waves.get(d)!.push(slug);
  }
  return [...waves.keys()].sort((a, b) => a - b).map((d) => waves.get(d)!);
}
