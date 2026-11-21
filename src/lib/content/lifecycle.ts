/**
 * Editorial lifecycle — the review workflow state machine.
 *
 * A lesson moves through six states, and every promotion is earned with
 * review records (lesson.yaml → reviews[]). The machine enforces:
 *
 *   draft -> self-review -> peer-review -> technical-review -> approved -> published
 *
 *   self-review        author's own pass against the checklist
 *   peer-review         another author reads it as a learner would
 *   technical-review    a domain expert checks every number and API claim
 *   approved            pedagogy sign-off (instructional designer)
 *   published           visible to learners (subject-level: only when ALL
 *                       lessons of the subject are published)
 *
 * Config: content/review/lifecycle.yaml. Records: lesson.yaml → reviews[].
 * Roles map to platform roles: author + peer-reviewer ≈ INSTRUCTOR /
 * CONTENT_EDITOR, technical-reviewer ≈ INSTRUCTOR (domain lead),
 * instructional-designer + editor ≈ CONTENT_EDITOR, publisher ≈ ADMINISTRATOR.
 */
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { parseYaml, YamlParseError } from "./yaml";
import type { CompiledLesson, Finding } from "./compile";

export const LIFECYCLE_STATES = ["draft", "self-review", "peer-review", "technical-review", "approved", "published"] as const;
export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const REVIEW_ROLES = [
  "author",
  "peer-reviewer",
  "technical-reviewer",
  "instructional-designer",
  "editor",
] as const;
export type ReviewRole = (typeof REVIEW_ROLES)[number];

/** Approvals required to be IN each state (cumulative along the path). */
export const REQUIRED_APPROVERS: Record<LifecycleState, ReviewRole[]> = {
  draft: [],
  "self-review": [],
  "peer-review": ["peer-reviewer"],
  "technical-review": ["peer-reviewer", "technical-reviewer"],
  approved: ["peer-reviewer", "technical-reviewer", "instructional-designer"],
  published: ["peer-reviewer", "technical-reviewer", "instructional-designer", "editor"],
};

export function stateRank(state: LifecycleState): number {
  return LIFECYCLE_STATES.indexOf(state);
}

export function lifecycleFindings(lesson: CompiledLesson): Finding[] {
  const findings: Finding[] = [];
  const status = lesson.frontmatter.status;
  const required = REQUIRED_APPROVERS[status];

  // the latest record per role must be an approval, and reviewers must not
  // sign off on the same day they authored changes (review cannot be a
  // rubber stamp recorded by the author alone)
  const latestByRole = new Map<ReviewRole, (typeof lesson.data.reviews)[number]>();
  for (const rec of lesson.data.reviews) {
    const prev = latestByRole.get(rec.role);
    if (!prev || prev.date <= rec.date) latestByRole.set(rec.role, rec);
  }

  for (const role of required) {
    const rec = latestByRole.get(role);
    if (!rec) {
      findings.push({
        rule: "E01",
        severity: "error",
        path: lesson.ref,
        message: `status '${status}' requires an approval from a ${role} — add the review record in lesson.yaml`,
      });
      continue;
    }
    if (rec.verdict !== "approve") {
      findings.push({
        rule: "E01",
        severity: "error",
        path: lesson.ref,
        message: `the latest ${role} review verdict is '${rec.verdict}' — resolve the feedback before promoting`,
      });
    }
  }

  if (stateRank(status) >= stateRank("approved")) {
    const v = lesson.data.verification;
    if (!v || !v.verifiedAt) {
      findings.push({
        rule: "E02",
        severity: "error",
        path: lesson.ref,
        message: "approved lessons must record verification (python version, libraries, verifiedAt) in lesson.yaml",
      });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const rec of lesson.data.reviews) {
    if (rec.date > today) {
      findings.push({ rule: "E03", severity: "error", path: lesson.ref, message: `review record dated ${rec.date} is in the future` });
    }
  }

  return findings;
}

/** Publish gate: is this lesson allowed to be learner-visible? */
export function canPublish(lesson: CompiledLesson): boolean {
  return lesson.frontmatter.status === "published" && lifecycleFindings(lesson).length === 0;
}

/** A subject is learner-visible only when every registry lesson is published. */
export interface PublishDecision {
  subject: string;
  publishable: boolean;
  authored: number;
  total: number;
  blockers: string[];
}

export function subjectPublishDecision(coverage: { subject: string; total: number; authored: number; published: number; lessons: { ref: string; title: string; authored: boolean; status?: string }[] }): PublishDecision {
  const blockers: string[] = [];
  for (const l of coverage.lessons) {
    if (!l.authored) blockers.push(`${l.ref} (${l.title}) has no content`);
    else if (l.status !== "published") blockers.push(`${l.ref} is '${l.status ?? "missing"}', not published`);
  }
  return {
    subject: coverage.subject,
    publishable: blockers.length === 0 && coverage.total > 0,
    authored: coverage.authored,
    total: coverage.total,
    blockers,
  };
}

// ---------------------------------------------------------------------------
// lifecycle.yaml (human-facing checklists) — validated on load
// ---------------------------------------------------------------------------

export interface LifecycleConfig {
  version: number;
  states: string[];
  requiredApprovers: Record<string, string[]>;
  checklists: Record<string, string[]>;
}

const CHECKLIST_KEYS = ["authoring", "technical", "pedagogy", "style", "integrity"];

export function loadLifecycleConfig(root: string): LifecycleConfig | null {
  const p = join(root, "review", "lifecycle.yaml");
  if (!existsSync(p)) return null;
  try {
    const raw = parseYaml(readFileSync(p, "utf8")) as Record<string, unknown> | null;
    if (!raw) return null;
    const states = raw.states;
    const checklists = raw.checklists as Record<string, string[]> | undefined;
    if (!Array.isArray(states)) throw new YamlParseError("states must be a list", 1);
    for (const key of CHECKLIST_KEYS) {
      if (!checklists || !Array.isArray(checklists[key]) || checklists[key].length < 3)
        throw new YamlParseError(`checklists.${key} must be a list of at least 3 items`, 1);
    }
    return {
      version: typeof raw.version === "number" ? raw.version : 1,
      states: states as string[],
      requiredApprovers: Object.fromEntries(
        LIFECYCLE_STATES.map((s) => [s, REQUIRED_APPROVERS[s]])
      ),
      checklists: checklists as Record<string, string[]>,
    };
  } catch (err) {
    if (err instanceof YamlParseError) {
      // surface as a finding at the call site
      throw err;
    }
    return null;
  }
}
