/**
 * Quality rules — the editorial gate that makes "every lesson is a
 * complete teaching experience" a machine-checkable statement.
 *
 * Rule families:
 *   S* structural  — sections present, ordered, deep enough, no shells
 *   Q* quality     — placeholders, jargon, unexplained code, filler,
 *                    solutions, knowledge-check integrity, honest links
 *   R* registry    — content joined 1:1 with the curriculum registry:
 *                    titles, positions, prerequisites, concept coverage
 *   V* verification— (verify.ts) executed code and real outputs
 *   E* editorial   — (lifecycle.ts) review records behind every promotion
 *   L* load        — (compile.ts) file/schema/layout integrity
 *
 * Severity: "error" blocks publishing (validator exit 1); "warning" must
 * be fixed before technical-review promotion but does not fail the run.
 */
import { join } from "node:path";
import { existsSync } from "node:fs";
import { wordCount, bulletItems, numberedItems, linksOf, type SectionNode } from "./sectionize";
import type { CompiledLesson, ContentBundle, Finding } from "./compile";
import { compileContent, lessonProseWords } from "./compile";
import { MIN_TOTAL_WORDS, profileOf, type Archetype, type SectionId } from "./sections";
import { isCodeExercise, type LessonFrontmatter } from "./schemas";
import { verifyLesson, type VerifyOptions } from "./verify";
import { lifecycleFindings } from "./lifecycle";
import { availableSubjects, registryLessonsFor, subjectBySlug } from "../curriculum/data";

// ---------------------------------------------------------------------------
// Context shared by all rules
// ---------------------------------------------------------------------------

export interface RuleContext {
  bundle: ContentBundle;
  /** lowercased term / abbr -> glossary or lesson terminology entry */
  definedTerms: Set<string>;
  /** every registry lesson ref, e.g. "python/m1/c1/3" */
  registryRefs: Set<string>;
}

export function buildContext(bundle: ContentBundle): RuleContext {
  const definedTerms = new Set<string>();
  for (const t of bundle.glossary.terms) {
    definedTerms.add(t.term.toLowerCase());
    if (t.abbr) definedTerms.add(t.abbr.toUpperCase());
  }
  for (const lesson of bundle.lessons) {
    for (const t of lesson.data.terminology) {
      definedTerms.add(t.term.toLowerCase());
      if (t.abbr) definedTerms.add(t.abbr.toUpperCase());
    }
  }
  const registryRefs = new Set<string>();
  for (const subject of availableSubjects) {
    for (const r of registryLessonsFor(subject))
      registryRefs.add(`${r.subject}/m${r.moduleIndex}/c${r.chapterIndex}/${r.lessonIndex}`);
  }
  return { bundle, definedTerms, registryRefs };
}

function sectionOf(lesson: CompiledLesson, id: SectionId): SectionNode | null {
  return lesson.parsed.sections.find((s) => s.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// S-structural
// ---------------------------------------------------------------------------

function structuralFindings(lesson: CompiledLesson): Finding[] {
  const findings: Finding[] = [];
  const archetype: Archetype = lesson.frontmatter.archetype;
  const profile = profileOf(archetype);
  const omitCodeDemo = lesson.frontmatter.codeDemo?.include === false;
  const required = profile.filter((s) => s.scope === "every" && !(omitCodeDemo && s.id === "code-demonstration"));
  if (omitCodeDemo && !lesson.frontmatter.codeDemo?.reason) {
    findings.push({ rule: "S01", severity: "error", path: lesson.ref, message: "codeDemo.include=false requires a reason so reviewers can challenge it" });
  }

  const knownIds = new Set(profile.map((s) => s.id));
  const actual: SectionId[] = [];
  for (const s of lesson.parsed.sections) {
    if (s.id === null) {
      findings.push({
        rule: "S02",
        severity: "warning",
        path: lesson.ref,
        line: s.startLine,
        message: `unrecognized section heading "${s.heading}" — sections outside the ${archetype} profile are removed or renamed`,
      });
      continue;
    }
    if (!knownIds.has(s.id)) {
      findings.push({ rule: "S02", severity: "error", path: lesson.ref, line: s.startLine, message: `section "${s.heading}" does not belong to the ${archetype} archetype` });
      continue;
    }
    if (actual.includes(s.id)) {
      findings.push({ rule: "S02", severity: "error", path: lesson.ref, line: s.startLine, message: `duplicate section "${s.heading}"` });
      continue;
    }
    actual.push(s.id);
  }

  for (const req of required) {
    if (!actual.includes(req.id)) {
      findings.push({ rule: "S01", severity: "error", path: lesson.ref, message: `missing section "${req.heading}" (required for ${archetype} lessons)` });
    }
  }

  // order: actual ids must appear in profile order
  const profileOrder = new Map(profile.map((s, i) => [s.id, i] as const));
  let lastIdx = -1;
  for (const id of actual) {
    const idx = profileOrder.get(id)!;
    if (idx < lastIdx) {
      findings.push({ rule: "S03", severity: "error", path: lesson.ref, message: `section "${id}" is out of order — the ${archetype} skeleton fixes the teaching order (see the authoring guide)` });
    }
    lastIdx = Math.max(lastIdx, idx);
  }

  // depth per section
  for (const spec of profile) {
    const node = sectionOf(lesson, spec.id);
    if (!node) continue;
    if (spec.id === "code-demonstration" && omitCodeDemo) continue;
    const words = wordCount(node.prose);
    if (words < spec.minWords) {
      findings.push({
        rule: "S03",
        severity: "error",
        path: lesson.ref,
        line: node.startLine,
        message: `section "${spec.heading}" has ${words} words of prose — needs at least ${spec.minWords} (no superficial chapters)`,
      });
    }
    for (const depth of spec.depth) {
      const msg = checkDepth(lesson, node, depth, archetype);
      if (msg) findings.push({ rule: "S03", severity: "error", path: lesson.ref, line: node.startLine, message: `section "${spec.heading}": ${msg}` });
    }
  }

  const total = lessonProseWords(lesson);
  if (total < MIN_TOTAL_WORDS[archetype]) {
    findings.push({
      rule: "S05",
      severity: "error",
      path: lesson.ref,
      message: `lesson has ${total} prose words — ${archetype} lessons need at least ${MIN_TOTAL_WORDS[archetype]} (no inflated shells)`,
    });
  }

  return findings;
}

function checkDepth(lesson: CompiledLesson, node: SectionNode, depth: string, archetype: Archetype): string | null {
  const prose = node.prose;
  switch (depth) {
    case "bullets-3":
      return bulletItems(prose).length < 3 ? "needs at least 3 bullet items" : null;
    case "bullets-3-7": {
      const n = bulletItems(prose).length;
      return n < 3 ? "needs at least 3 bullet items" : n > 7 ? `has ${n} bullets — split or trim to 3–7` : null;
    }
    case "numbered-3":
      return numberedItems(prose).length < 3 ? "needs at least 3 numbered steps" : null;
    case "fence":
      return node.blocks.length === 0 && !/^\s*\|/m.test(prose) ? "needs a fenced diagram, table or code block" : null;
    case "prose":
      return null; // covered by minWords
    case "terms-3": {
      const sectionText = prose.toLowerCase();
      let surfaced = 0;
      for (const t of lesson.data.terminology) if (sectionText.includes(t.term.toLowerCase())) surfaced += 1;
      if (surfaced < 3) return "must surface at least 3 of the lesson's terminology entries in its prose";
      return null;
    }
    case "examples-1":
    case "examples-2": {
      const need = depth === "examples-2" ? 2 : 1;
      const h3 = (prose.match(/^###\s+(example|worked example)/gim) ?? []).length;
      const numbered = numberedItems(prose).length >= 3 ? 1 : 0;
      if (h3 + numbered < need) return `needs at least ${need} complete worked example(s) (statement → steps → answer → check)`;
      return null;
    }
    case "api-rows-3": {
      const rows = (prose.match(/^[|`]/gm) ?? []).length;
      return rows < 3 ? "needs at least 3 signature rows (backticked, one per function/method)" : null;
    }
    case "mistakes-2":
      return numberedItems(prose).length < 2 ? "needs at least 2 numbered mistakes, each with its fix" : null;
    case "expected-actual":
      return !/expected/i.test(prose) || !/actual/i.test(prose)
        ? 'must show "Expected:" and "Actual:" so the learner sees the evidence'
        : null;
    case "links-2": {
      const links = linksOf(prose);
      if (links.length < 2) return "needs at least 2 real further-reading links with descriptive text";
      return null;
    }
    case "notation": {
      const symbols = (prose.match(/`[^`]+`/g) ?? []).length;
      return symbols < 3 ? "needs the symbols introduced — at least 3 backticked notation items" : null;
    }
    case "derivation": {
      const steps = numberedItems(prose).length;
      const justifications = (prose.match(/\b(since|because|by definition|recall|therefore|which means|substituting)\b/gi) ?? []).length;
      if (steps < 3) return "derivations need at least 3 numbered steps";
      if (justifications < 2) return "each derivation must justify its steps — add 'because/since/therefore' reasoning";
      return null;
    }
    case "code-out-1":
    case "code-out-2": {
      const need = depth === "code-out-2" ? 2 : 1;
      let pairs = 0;
      for (let i = 0; i < node.blocks.length; i++) {
        const b = node.blocks[i];
        if (b.language !== "python") continue;
        const next = node.blocks[i + 1];
        if (next && (next.language === "text" || next.language === "output")) pairs += 1;
      }
      return pairs < need ? `needs at least ${need} runnable python example(s) each followed by its real output fence` : null;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Q-quality
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS: [RegExp, string][] = [
  [/\b(TODO|TBD|FIXME|XXX)\b/, "TODO/TBD marker"],
  [/lorem ipsum/i, "lorem ipsum"],
  [/coming soon/i, "'coming soon'"],
  [/\bplaceholder\b/i, "'placeholder'"],
  [/fill in (the|your) /i, "'fill in the …'"],
  [/YOUR CODE HERE/i, "'YOUR CODE HERE'"],
];

const OBJECTIVE_VERBS = [
  "define", "derive", "compute", "explain", "write", "choose", "identify", "apply", "interpret",
  "predict", "read", "create", "build", "spot", "justify", "describe", "recognize", "use",
  "convert", "select", "measure", "summarize", "compare", "design", "debug", "analyze",
  "state", "produce", "construct", "evaluate", "run", "install", "load", "edit", "fix",
  "re-assign", "reassign", "distinguish", "tell", "recall", "scan", "decide", "replace", "verify", "check",
];

function sentencesOf(prose: string): string[] {
  return prose
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().toLowerCase())
    .map((s) => s.replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " "))
    .filter((s) => s.split(" ").length >= 10);
}

function qualityFindings(lesson: CompiledLesson, ctx: RuleContext): Finding[] {
  const findings: Finding[] = [];
  const isDraft = lesson.frontmatter.status === "draft";

  // Q01 — placeholder text
  const haystack = lesson.parsed.allProse + "\n" + lesson.parsed.blocks.map((b) => b.content).join("\n");
  for (const [re, label] of PLACEHOLDER_PATTERNS) {
    const m = haystack.match(re);
    if (m) {
      findings.push({
        rule: "Q01",
        severity: isDraft ? "warning" : "error",
        path: lesson.ref,
        message: `placeholder text (${label}) — lessons may not ship with holes`,
      });
    }
  }
  for (const b of lesson.parsed.blocks) {
    if (b.language === "python" && /^\s*\.\.\.\s*$/m.test(b.content) && b.content.trim().length < 30) {
      findings.push({
        rule: "Q01",
        severity: isDraft ? "warning" : "error",
        path: lesson.ref,
        line: b.startLine,
        message: "python block contains a bare '...' — write the real code or delete the block",
      });
    }
  }

  // Q02 — no unexplained acronyms
  const acronyms = new Set<string>();
  for (const m of lesson.parsed.allProse.matchAll(/\b([A-Z][A-Z0-9]{1,})\b/g)) acronyms.add(m[1]);
  for (const acronym of acronyms) {
    if (!ctx.definedTerms.has(acronym.toLowerCase()) && !ctx.definedTerms.has(acronym)) {
      findings.push({
        rule: "Q02",
        severity: "error",
        path: lesson.ref,
        message: `acronym "${acronym}" is used but never defined — add it to lesson.yaml terminology (term + plainEnglish) or the shared glossary`,
      });
    }
  }

  // Q03 — no unexplained code
  const verifySectionIds = new Set(["code-demonstration", "worked-examples", "api-reference", "debugging-exercise"]);
  for (const node of lesson.parsed.sections) {
    if (!node.id || !verifySectionIds.has(node.id)) continue;
    for (let i = 0; i < node.blocks.length; i++) {
      const b = node.blocks[i];
      if (b.language !== "python") continue;
      const comments = (b.content.match(/^\s*#/gm) ?? []).length;
      const sectionWords = wordCount(node.prose);
      const discussed = comments >= 2 || sectionWords >= Math.max(60, b.content.split("\n").length * 4);
      if (!discussed) {
        findings.push({
          rule: "Q03",
          severity: "error",
          path: lesson.ref,
          line: b.startLine,
          message: "python block is not explained — add line-by-line comments or discussing prose after it (no unexplained code)",
        });
      }
    }
  }

  // Q05 — math derivations (math archetype handled by depth rule; here: the
  // worked examples of a math lesson must contain numbers, not just symbols)
  if (lesson.frontmatter.archetype === "math") {
    const worked = sectionOf(lesson, "worked-examples");
    if (worked && !/\d/.test(worked.prose.replace(/`[^`]*`/g, ""))) {
      findings.push({ rule: "Q05", severity: "error", path: lesson.ref, message: "worked examples must contain solved numerical problems — actual numbers, computed to an answer" });
    }
  }

  // Q06 — repetitive filler (duplicates within the lesson)
  const counts = new Map<string, number>();
  for (const s of sentencesOf(lesson.parsed.allProse)) counts.set(s, (counts.get(s) ?? 0) + 1);
  for (const [sentence, n] of counts) {
    if (n > 1) {
      findings.push({
        rule: "Q06",
        severity: "error",
        path: lesson.ref,
        message: `repeated sentence (${n}×): "${sentence.slice(0, 70)}…" — repetitive filler is not teaching`,
      });
    }
  }

  // Q07 — exercise policy from the manifest
  const policy = ctx.bundle.manifest.exercisePolicy;
  if (lesson.data.exercises.length < policy.minExercisesPerLesson) {
    findings.push({ rule: "Q07", severity: "error", path: lesson.ref, message: `needs at least ${policy.minExercisesPerLesson} practice exercises` });
  }
  for (const ex of lesson.data.exercises) {
    if (ex.hints.length === 0) {
      findings.push({ rule: "Q07", severity: "error", path: lesson.ref, message: `exercise '${ex.id}' needs at least one hint (progressive hints, max ${policy.maxHints})` });
    }
    if (isCodeExercise(ex) && ex.testCases.every((tc) => tc.hidden)) {
      findings.push({ rule: "Q07", severity: "error", path: lesson.ref, message: `exercise '${ex.id}' needs at least one visible test case the learner can run` });
    }
  }

  // Q08 — knowledge-check integrity
  if (lesson.data.knowledgeCheck.length < policy.minKnowledgeCheckPerLesson) {
    findings.push({ rule: "Q08", severity: "error", path: lesson.ref, message: `needs at least ${policy.minKnowledgeCheckPerLesson} knowledge-check questions` });
  }
  for (const kc of lesson.data.knowledgeCheck) {
    const correct = kc.options.filter((o) => o.correct).length;
    if (kc.kind === "MCQ" && correct !== 1)
      findings.push({ rule: "Q08", severity: "error", path: lesson.ref, message: `question '${kc.id}' (MCQ) must have exactly one correct option — found ${correct}` });
    if (kc.kind === "TRUE_FALSE" && (kc.options.length !== 2 || correct !== 1))
      findings.push({ rule: "Q08", severity: "error", path: lesson.ref, message: `question '${kc.id}' (TRUE_FALSE) must have exactly two options, one correct` });
    if (kc.kind === "MULTI_SELECT" && correct < 2)
      findings.push({ rule: "Q08", severity: "error", path: lesson.ref, message: `question '${kc.id}' (MULTI_SELECT) must have at least two correct options` });
  }

  // Q09 — registry concept coverage
  if (lesson.registry) {
    const corpus = (
      lesson.parsed.allProse +
      "\n" +
      lesson.parsed.blocks.map((b) => b.content).join("\n") +
      "\n" +
      lesson.data.terminology.map((t) => `${t.term} ${t.definition} ${t.plainEnglish}`).join("\n")
    ).toLowerCase();
    for (const concept of lesson.registry.concepts) {
      const re = new RegExp(`\\b${concept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (!re.test(corpus)) {
        findings.push({
          rule: "Q09",
          severity: "error",
          path: lesson.ref,
          message: `registry concept "${concept}" is never taught in this lesson — every registered concept must be covered`,
        });
      }
    }
  }

  // Q11 — images resolve and have alt text
  for (const img of lesson.parsed.images) {
    if (/^https?:\/\//.test(img.url)) continue;
    const target = join(lesson.dir, img.url);
    if (!existsSync(target)) {
      findings.push({ rule: "Q11", severity: "error", path: lesson.ref, line: img.line, message: `image not found: ${img.url}` });
    }
    if (!img.alt || img.alt.trim().length < 5) {
      findings.push({ rule: "Q11", severity: "error", path: lesson.ref, line: img.line, message: `image "${img.url}" needs descriptive alt text (accessibility)` });
    }
  }

  // Q12 — further-reading links are real
  const further = sectionOf(lesson, "further-reading");
  if (further) {
    for (const link of linksOf(further.prose)) {
      if (!/^https?:\/\//.test(link.url)) {
        findings.push({ rule: "Q12", severity: "error", path: lesson.ref, message: `further-reading link must be absolute: ${link.url}` });
      } else if (/example\.com|localhost|yourlibrary/i.test(link.url)) {
        findings.push({ rule: "Q12", severity: "error", path: lesson.ref, message: `further-reading link is a placeholder URL: ${link.url}` });
      } else if (link.text.trim().length < 4) {
        findings.push({ rule: "Q12", severity: "error", path: lesson.ref, message: `further-reading link needs descriptive text (no bare URLs): ${link.url}` });
      }
    }
  }

  // Q14 — verification record matches what the lesson uses
  const usesNumpy = lesson.parsed.blocks.some((b) => b.language === "python" && /^\s*import numpy|^\s*from numpy/m.test(b.content));
  const usesPandas = lesson.parsed.blocks.some((b) => b.language === "python" && /^\s*import pandas|^\s*from pandas/m.test(b.content));
  const v = lesson.data.verification;
  if (usesNumpy && (!v || !("numpy" in v.libraries))) {
    findings.push({ rule: "Q14", severity: "error", path: lesson.ref, message: "lesson imports numpy — record the tested numpy version in lesson.yaml verification.libraries" });
  }
  if (usesPandas && (!v || !("pandas" in v.libraries))) {
    findings.push({ rule: "Q14", severity: "error", path: lesson.ref, message: "lesson imports pandas — record the tested pandas version in lesson.yaml verification.libraries" });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// R-registry
// ---------------------------------------------------------------------------

function registryFindings(lesson: CompiledLesson, ctx: RuleContext): Finding[] {
  const findings: Finding[] = [];

  // R01 — the lesson IS a registry lesson
  if (!lesson.registry) {
    const subject = subjectBySlug(lesson.subjectSlug);
    if (!subject) {
      findings.push({ rule: "R01", severity: "error", path: lesson.ref, message: `subject '${lesson.subjectSlug}' is not registered in the curriculum` });
    } else {
      findings.push({
        rule: "R01",
        severity: "error",
        path: lesson.ref,
        message: `no registry lesson at ${lesson.ref} — content and curriculum must agree 1:1 (no invented lessons)`,
      });
    }
  } else if (lesson.frontmatter.title !== lesson.registry.title) {
    findings.push({
      rule: "R01",
      severity: "error",
      path: lesson.ref,
      message: `frontmatter title "${lesson.frontmatter.title}" does not match the registry lesson title "${lesson.registry.title}"`,
    });
  }

  // R02 — lesson prerequisites resolve
  for (const prereq of lesson.frontmatter.prerequisites) {
    if (!ctx.registryRefs.has(prereq.ref)) {
      findings.push({
        rule: "R02",
        severity: "error",
        path: lesson.ref,
        message: `prerequisite '${prereq.ref}' does not resolve to a registry lesson (format: subject/m1/c1/3)`,
      });
    }
  }

  // R03 — objectives are actionable
  lesson.frontmatter.objectives.forEach((obj, i) => {
    const first = obj.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    if (!OBJECTIVE_VERBS.includes(first)) {
      findings.push({
        rule: "R03",
        severity: "warning",
        path: lesson.ref,
        message: `objective ${i + 1} should start with an action verb the learner can demonstrate ("${obj.slice(0, 50)}…")`,
      });
    }
  });

  return findings;
}

// ---------------------------------------------------------------------------
// bundle-level rules
// ---------------------------------------------------------------------------

function bundleFindings(ctx: RuleContext): Finding[] {
  const findings: Finding[] = [];

  // S04 — subject-once sections (installation for library subjects)
  const bySubject = new Map<string, CompiledLesson[]>();
  for (const l of ctx.bundle.lessons) {
    const arr = bySubject.get(l.subjectSlug) ?? [];
    arr.push(l);
    bySubject.set(l.subjectSlug, arr);
  }
  for (const [subjectSlug, lessons] of bySubject) {
    const subject = subjectBySlug(subjectSlug);
    if (!subject) continue;
    const hasInstall = lessons.some((l) => l.parsed.sections.some((s) => s.id === "installation-and-setup"));
    const anyLibrary = lessons.some((l) => l.frontmatter.archetype === "library");
    if (anyLibrary && !hasInstall) {
      findings.push({
        rule: "S04",
        severity: "error",
        path: subjectSlug,
        message: `library subject '${subjectSlug}' must teach installation-and-setup in at least one lesson`,
      });
    }
  }

  // Q06-cross — duplicated paragraphs across lessons
  const paraIndex = new Map<string, { ref: string; title: string }[]>();
  for (const lesson of ctx.bundle.lessons) {
    for (const para of lesson.parsed.allProse.split(/\n\s*\n/)) {
      const norm = para.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      if (norm.split(" ").length < 40) continue;
      const hits = paraIndex.get(norm) ?? [];
      hits.push({ ref: lesson.ref, title: lesson.frontmatter.title });
      paraIndex.set(norm, hits);
    }
  }
  for (const [, hits] of paraIndex) {
    if (hits.length > 1) {
      findings.push({
        rule: "Q06",
        severity: "warning",
        path: hits.map((h) => h.ref).join(", "),
        message: `the same long paragraph appears in ${hits.length} lessons — extract it into one shared lesson or rewrite`,
      });
    }
  }

  // E04 — coverage honesty: no lesson may claim published status while its
  // subject is incomplete (subject-level publication is the only path)
  for (const lesson of ctx.bundle.lessons) {
    if (lesson.frontmatter.status === "published") {
      const cov = ctx.bundle.coverage.find((c) => c.subject === lesson.subjectSlug);
      if (cov && cov.authored < cov.total) {
        findings.push({
          rule: "E04",
          severity: "error",
          path: lesson.ref,
          message: `lesson is 'published' but only ${cov.authored}/${cov.total} lessons of '${lesson.subjectSlug}' have content — learners see subjects whole or not at all (no inflated counts)`,
        });
      }
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// orchestration
// ---------------------------------------------------------------------------

export interface ValidationReport {
  ok: boolean;
  errorCount: number;
  warningCount: number;
  findings: Finding[];
  coverage: ContentBundle["coverage"];
  lessons: number;
}

export function validateLessonsIn(bundle: ContentBundle, opts?: { verify?: VerifyOptions | null }): Finding[] {
  const ctx = buildContext(bundle);
  const findings: Finding[] = [...bundle.findings];
  for (const lesson of bundle.lessons) {
    findings.push(...structuralFindings(lesson));
    findings.push(...qualityFindings(lesson, ctx));
    findings.push(...registryFindings(lesson, ctx));
    if (opts?.verify !== null) findings.push(...verifyLesson(lesson, opts?.verify ?? {}));
    findings.push(...lifecycleFindings(lesson));
  }
  findings.push(...bundleFindings(ctx));
  return findings;
}

export function reportOf(findings: Finding[], bundle: ContentBundle): ValidationReport {
  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  return {
    ok: errorCount === 0,
    errorCount,
    warningCount,
    findings: findings.sort((a, b) => a.path.localeCompare(b.path) || (a.line ?? 0) - (b.line ?? 0)),
    coverage: bundle.coverage,
    lessons: bundle.lessons.length,
  };
}

/** Full validation: compile -> rules -> verification -> lifecycle. */
export function validateContent(root?: string, opts?: { verify?: VerifyOptions | null }): ValidationReport {
  const bundle = compileContent(root);
  const findings = validateLessonsIn(bundle, { verify: opts?.verify });
  return reportOf(findings, bundle);
}
