/**
 * Lesson scaffolds — reusable templates that make the quality bar the path
 * of least resistance.
 *
 * A scaffold is born in "draft" status with TODO guidance markers. The
 * validator treats placeholders as warnings in draft and errors from
 * self-review onward, so a scaffold can NEVER ship as a shell: it either
 * becomes a real lesson or it stays invisible to learners.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { profileOf, type Archetype } from "./sections";
import { findRegistryLesson } from "../curriculum/data";
import type { SectionRequirement } from "./sections";

export interface ScaffoldOptions {
  subject: string;
  moduleIndex: number;
  chapterIndex: number;
  lessonIndex: number;
  archetype?: Archetype;
  outRoot: string; // content root
  author: string;
}

const GUIDANCE: Record<string, string> = {
  "what-you-will-learn": "3–7 bullets, each starting with an action verb (\"Compute…\", \"Explain…\").",
  "why-this-topic-matters": "Where does this show up in real data work? One concrete scenario beats three vague ones.",
  prerequisites: "List the prerequisite lessons with a one-line reason each. A first lesson says: \"None — this is where you start.\"",
  "everyday-explanation": "Explain the idea with an everyday analogy. Zero jargon, zero formulas, zero code.",
  "conceptual-explanation": "Now the underlying idea, still plain-language but precise. This is the heart of the lesson.",
  syntax: "The exact grammar of the construct in a fenced block, then one plain-English reading of it.",
  "formal-definition": "The textbook definition — introduced only now that the idea makes sense.",
  "mathematical-notation": "A table of every symbol this lesson uses, what it means, and how to say it aloud.",
  "important-terminology": "Introduce each new term from lesson.yaml terminology here, with its plain-English gloss.",
  "step-by-step-explanation": "How it works as numbered steps the learner can follow with pencil or keyboard.",
  "mathematical-derivations": "Derive — never drop formulas from the sky. Numbered steps, each justified (because/since/therefore).",
  "visual-explanation": "A diagram, table, graph or ASCII sketch that makes the structure visible. Label everything.",
  "worked-examples": "Complete examples: statement, steps, answer, and a check that the answer is sane.",
  "code-demonstration": "Runnable python blocks, each followed by a ```text fence with the REAL output (the validator runs them).",
  "api-reference": "One row per function/method: signature, parameters, returns — then a tiny example.",
  "comparisons-with-alternatives": "Compare honestly with at least one alternative tool/approach; say when each wins.",
  "performance-considerations": "When is it fast, when not, how to measure. Numbers only if you measured them.",
  "installation-and-setup": "Install commands in a fenced block and how to verify it worked.",
  "common-mistakes": "The mistakes beginners actually make, numbered, each with the fix.",
  "debugging-exercise": "A real broken program: the code, what it should do (Expected), what it does (Actual).",
  "practical-applications": "Where this appears in the job: tools, decisions, artifacts.",
  "key-takeaways": "3–7 sentences the learner keeps after forgetting everything else.",
  "practice-exercises": "Point to the exercises in lesson.yaml and say how to practice with them.",
  "knowledge-check": "Introduce the self-test; the questions live in lesson.yaml.",
  "further-reading": "2+ real sources, official documentation first, descriptive link text.",
};

export function lessonMdxTemplate(opts: ScaffoldOptions): string {
  const registry = findRegistryLesson(opts.subject, opts.moduleIndex, opts.chapterIndex, opts.lessonIndex);
  if (!registry) throw new Error(`no registry lesson at ${opts.subject}/m${opts.moduleIndex}/c${opts.chapterIndex}/${opts.lessonIndex}`);
  const archetype = opts.archetype ?? "concept";
  const profile = profileOf(archetype);

  const fm: string[] = [
    "---",
    `title: "${registry.title}"`,
    `archetype: ${archetype}`,
    "status: draft",
    `author: ${opts.author}`,
    "objectives:",
    `  - TODO objective 1 for ${registry.title} (action verb first)`,
    `  - TODO objective 2`,
    `  - TODO objective 3`,
    "prerequisites: []",
    "codeDemo:",
    "  include: true",
    "---",
    "",
  ];

  const body: string[] = [];
  for (const s of profile) {
    if (s.scope === "subject-once") continue; // only in the lessons that need it
    body.push(`## ${s.heading}`);
    body.push("");
    body.push(`<!-- ${GUIDANCE[s.id] ?? "Write this section."} Minimum prose: ${s.minWords} words. -->`);
    body.push("");
    body.push("TODO: write this section, then delete this line.");
    body.push("");
  }

  return [...fm, ...body].join("\n");
}

export function lessonYamlTemplate(opts: ScaffoldOptions): string {
  const registry = findRegistryLesson(opts.subject, opts.moduleIndex, opts.chapterIndex, opts.lessonIndex);
  if (!registry) throw new Error("registry lesson missing");
  const term = registry.concepts[0] ?? "term";
  return [
    "terminology:",
    `  - term: ${term}`,
    `    definition: "TODO: define ${term} precisely."`,
    `    plainEnglish: "TODO: define ${term} with an everyday image."`,
    "  - term: TODO-term-2",
    `    definition: "TODO definition (at least 15 characters)."`,
    `    plainEnglish: "TODO plain English (at least 10 characters)."`,
    "  - term: TODO-term-3",
    `    definition: "TODO definition."`,
    `    plainEnglish: "TODO plain English."`,
    "exercises:",
    "  - id: ex-1",
    "    kind: concept-check",
    "    difficulty: EASY",
    `    title: "TODO exercise title"`,
    `    prompt: "TODO: at least 20 characters describing the task."`,
    "    hints:",
    `      - "TODO hint 1"`,
    "    solutionSteps:",
    `      - "TODO worked solution step 1 (10+ characters)"`,
    `      - "TODO worked solution step 2"`,
    `    answer: "TODO final answer"`,
    "  - id: ex-2",
    "    kind: concept-check",
    "    difficulty: MEDIUM",
    `    title: "TODO exercise title"`,
    `    prompt: "TODO prompt."`,
    "    hints:",
    `      - "TODO hint"`,
    "    solutionSteps:",
    `      - "TODO step 1"`,
    `      - "TODO step 2"`,
    `    answer: "TODO answer"`,
    "  - id: ex-3",
    "    kind: concept-check",
    "    difficulty: HARD",
    `    title: "TODO exercise title"`,
    `    prompt: "TODO prompt."`,
    "    hints:",
    `      - "TODO hint"`,
    "    solutionSteps:",
    `      - "TODO step 1"`,
    `      - "TODO step 2"`,
    `    answer: "TODO answer"`,
    "knowledgeCheck:",
    "  - id: kc-1",
    `    prompt: "TODO question?"`,
    "    kind: MCQ",
    `    explanation: "TODO: why the right answer is right (15+ characters)."`,
    "    options:",
    `      - text: "TODO option"`,
    "        correct: true",
    `        feedback: "TODO why this is right (10+ characters)."`,
    `      - text: "TODO distractor"`,
    "        correct: false",
    `        feedback: "TODO why this is wrong."`,
    "  - id: kc-2",
    `    prompt: "TODO question?"`,
    "    kind: TRUE_FALSE",
    `    explanation: "TODO explanation."`,
    "    options:",
    `      - text: "True"`,
    "        correct: false",
    `        feedback: "TODO feedback."`,
    `      - text: "False"`,
    "        correct: true",
    `        feedback: "TODO feedback."`,
    "  - id: kc-3",
    `    prompt: "TODO question?"`,
    "    kind: MCQ",
    `    explanation: "TODO explanation."`,
    "    options:",
    `      - text: "TODO option"`,
    "        correct: false",
    `        feedback: "TODO feedback."`,
    `      - text: "TODO option"`,
    "        correct: true",
    `        feedback: "TODO feedback."`,
    "reviews: []",
    "changes: []",
    "",
  ].join("\n");
}

/** Write the scaffold into the content tree; returns the lesson directory. */
export function scaffoldLesson(opts: ScaffoldOptions): string {
  const registry = findRegistryLesson(opts.subject, opts.moduleIndex, opts.chapterIndex, opts.lessonIndex);
  if (!registry) throw new Error(`no registry lesson at ${opts.subject}/m${opts.moduleIndex}/c${opts.chapterIndex}/${opts.lessonIndex}`);
  const slug = registry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const dir = join(
    opts.outRoot,
    "subjects",
    opts.subject,
    `m${String(opts.moduleIndex).padStart(2, "0")}`,
    `c${String(opts.chapterIndex).padStart(2, "0")}`,
    `${String(opts.lessonIndex).padStart(2, "0")}-${slug}`
  );
  if (existsSync(join(dir, "lesson.mdx"))) throw new Error(`lesson already exists at ${dir}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "lesson.mdx"), lessonMdxTemplate(opts), "utf8");
  writeFileSync(join(dir, "lesson.yaml"), lessonYamlTemplate(opts), "utf8");
  return dir;
}

/** Sections marked subject-once (only printed as scaffold guidance). */
export function subjectOnceSections(archetype: Archetype): SectionRequirement[] {
  return profileOf(archetype).filter((s) => s.scope === "subject-once");
}
