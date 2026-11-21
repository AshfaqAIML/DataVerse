/**
 * Canonical lesson sections and archetype profiles.
 *
 * Every DataVerse lesson is a complete teaching experience built from the
 * same 18-part skeleton (title + 17 body sections), in a fixed order that
 * implements progressive disclosure:
 *
 *   everyday intuition  ->  conceptual explanation  ->  formal definition
 *   (beginner)                (deeper)                   (advanced)
 *
 * Archetypes add the sections their discipline needs:
 *   math        : mathematical notation, step-by-step derivations
 *   programming : syntax, debugging exercise
 *   library     : installation, API reference, comparisons, performance
 *   concept     : the base skeleton alone
 *
 * The order below is the authoring order AND the rendering order. The
 * validator (rules.ts) enforces presence, order and minimum depth per
 * archetype; templates.ts scaffolds exactly this structure.
 */

export type SectionId =
  // ---- base skeleton (all archetypes)
  | "what-you-will-learn"
  | "why-this-topic-matters"
  | "prerequisites"
  | "everyday-explanation"
  | "conceptual-explanation"
  | "formal-definition"
  | "important-terminology"
  | "step-by-step-explanation"
  | "visual-explanation"
  | "worked-examples"
  | "code-demonstration"
  | "common-mistakes"
  | "practical-applications"
  | "key-takeaways"
  | "practice-exercises"
  | "knowledge-check"
  | "further-reading"
  // ---- math extensions
  | "mathematical-notation"
  | "mathematical-derivations"
  // ---- programming extensions
  | "syntax"
  | "debugging-exercise"
  // ---- library extensions
  | "installation-and-setup"
  | "api-reference"
  | "comparisons-with-alternatives"
  | "performance-considerations";

export type Archetype = "math" | "programming" | "library" | "concept";

export interface SectionSpec {
  id: SectionId;
  /** Canonical H2 heading text authors write in lesson.mdx. */
  heading: string;
  /** How the section is introduced in the authoring guide + scaffold. */
  purpose: string;
  /** Minimum prose words (code fences and headings excluded). */
  minWords: number;
  /** Extra machine checks (see rules.ts) beyond presence + order. */
  depth: SectionDepth[];
}

export type SectionDepth =
  | "bullets-3" // at least 3 markdown list items
  | "bullets-3-7"
  | "numbered-3" // at least 3 numbered list items
  | "fence" // at least one fenced block (diagram, table, code)
  | "table"
  | "image"
  | "prose" // continuous prose (no bare list) — checked by minWords
  | "terms-3" // >= 3 lesson.yaml terminology entries surfaced
  | "examples-1" // at least one fully worked example
  | "examples-2"
  | "api-rows-3" // >= 3 backticked signature rows (API reference tables)
  | "mistakes-2" // >= 2 numbered mistakes
  | "expected-actual" // prose contains "Expected:" and "Actual:"
  | "links-2" // >= 2 markdown links with descriptive text
  | "notation" // introduces symbols (table or list with backticked symbols)
  | "derivation" // numbered derivation with justification markers
  | "code-out-2" // >= 2 python fences each followed by an output fence
  | "code-out-1";

const S = (id: SectionId, heading: string, purpose: string, minWords: number, depth: SectionDepth[]): SectionSpec => ({
  id,
  heading,
  purpose,
  minWords,
  depth,
});

// ---------------------------------------------------------------------------
// Base sections — shared by every archetype
// ---------------------------------------------------------------------------

export const BASE: Record<string, SectionSpec> = {
  "what-you-will-learn": S("what-you-will-learn", "What you will learn", "The lesson promise: 3–7 things the learner will be able to DO afterwards.", 25, ["bullets-3-7"]),
  "why-this-topic-matters": S("why-this-topic-matters", "Why this topic matters", "Motivation before mechanics: where this shows up in real data work.", 50, ["prose"]),
  prerequisites: S("prerequisites", "Prerequisites", "What the learner should already know, with links and one-line reasons. First lessons say so explicitly.", 15, ["prose"]),
  "everyday-explanation": S("everyday-explanation", "Everyday-life explanation", "The idea told with a familiar analogy — zero jargon, zero formulas.", 80, ["prose"]),
  "conceptual-explanation": S("conceptual-explanation", "Conceptual explanation", "The underlying idea, still in plain language but now precise.", 150, ["prose"]),
  "formal-definition": S("formal-definition", "Formal definition", "The textbook definition, introduced only after the idea makes sense.", 30, ["prose"]),
  "important-terminology": S("important-terminology", "Important terminology", "Every new term, defined once, with a plain-English gloss.", 20, ["terms-3"]),
  "step-by-step-explanation": S("step-by-step-explanation", "Step-by-step explanation", "How it actually works, as numbered steps the learner can follow.", 120, ["numbered-3"]),
  "visual-explanation": S("visual-explanation", "Visual explanation", "A diagram, table, graph or sketch that makes the structure visible.", 30, ["fence"]),
  "worked-examples": S("worked-examples", "Worked examples", "Complete examples: statement -> steps -> answer -> check.", 120, ["examples-1"]),
  "code-demonstration": S("code-demonstration", "Code demonstration", "Runnable code with line-by-line explanation and real output.", 80, ["code-out-2"]),
  "common-mistakes": S("common-mistakes", "Common mistakes", "The mistakes beginners actually make, each with the fix.", 60, ["mistakes-2"]),
  "practical-applications": S("practical-applications", "Practical applications", "Where this is used on the job: real tools, real decisions.", 50, ["prose"]),
  "key-takeaways": S("key-takeaways", "Key takeaways", "3–7 memorable sentences the learner keeps.", 15, ["bullets-3-7"]),
  "practice-exercises": S("practice-exercises", "Practice exercises", "Hands-on practice (defined in lesson.yaml): hints, solutions, grading.", 20, ["prose"]),
  "knowledge-check": S("knowledge-check", "Knowledge check", "Quick self-test questions (defined in lesson.yaml) with per-option feedback.", 20, ["prose"]),
  "further-reading": S("further-reading", "Further reading", "Two or more real, named sources — official docs first.", 20, ["links-2"]),
};

// ---------------------------------------------------------------------------
// Archetype extensions
// ---------------------------------------------------------------------------

const MATH_NOTATION: SectionSpec = S("mathematical-notation", "Mathematical notation", "The symbols used from here on: what each means and how to read it aloud.", 20, ["notation"]);
const MATH_DERIVATIONS: SectionSpec = S("mathematical-derivations", "Step-by-step derivations", "Formulas are derived, never dropped from the sky: numbered steps, each justified.", 80, ["derivation"]);
const PROG_SYNTAX: SectionSpec = S("syntax", "Syntax", "The exact grammar of the construct, before the semantics deepen.", 25, ["fence"]);
const PROG_DEBUGGING: SectionSpec = S("debugging-exercise", "Debugging exercise", "A real broken program: read the evidence, find the bug, fix it.", 40, ["expected-actual", "fence"]);
const LIB_INSTALL: SectionSpec = S("installation-and-setup", "Installation and setup", "Install the library, verify the version, adopt the conventions.", 30, ["fence"]);
const LIB_API: SectionSpec = S("api-reference", "API reference", "The functions and methods this lesson uses: signature, parameters, returns.", 40, ["api-rows-3"]);
const LIB_COMPARE: SectionSpec = S("comparisons-with-alternatives", "Comparisons with alternatives", "Honest comparison with the tools it compleplements or replaces.", 40, ["prose"]);
const LIB_PERF: SectionSpec = S("performance-considerations", "Performance considerations", "When it is fast, when it is not, and how to measure rather than guess.", 40, ["prose"]);

// ---------------------------------------------------------------------------
// Archetype profiles: the authoritative section ORDER + depth rules
// ---------------------------------------------------------------------------

export interface SectionRequirement extends SectionSpec {
  /** "every" -> required in every lesson; "subject-once" -> at least one lesson in the subject */
  scope: "every" | "subject-once";
}

export const ARCHETYPE_PROFILES: Record<Archetype, SectionRequirement[]> = {
  math: [
    { ...BASE["what-you-will-learn"], scope: "every" },
    { ...BASE["why-this-topic-matters"], scope: "every" },
    { ...BASE.prerequisites, scope: "every" },
    { ...BASE["everyday-explanation"], scope: "every" },
    { ...BASE["conceptual-explanation"], scope: "every" },
    { ...BASE["formal-definition"], scope: "every" },
    { ...MATH_NOTATION, scope: "every" },
    { ...BASE["important-terminology"], scope: "every" },
    { ...BASE["step-by-step-explanation"], scope: "every" },
    { ...MATH_DERIVATIONS, scope: "every" },
    { ...BASE["visual-explanation"], scope: "every" },
    { ...BASE["worked-examples"], scope: "every" },
    { ...BASE["code-demonstration"], scope: "every" },
    { ...BASE["common-mistakes"], scope: "every" },
    { ...BASE["practical-applications"], scope: "every" },
    { ...BASE["key-takeaways"], scope: "every" },
    { ...BASE["practice-exercises"], scope: "every" },
    { ...BASE["knowledge-check"], scope: "every" },
    { ...BASE["further-reading"], scope: "every" },
  ],
  programming: [
    { ...BASE["what-you-will-learn"], scope: "every" },
    { ...BASE["why-this-topic-matters"], scope: "every" },
    { ...BASE.prerequisites, scope: "every" },
    { ...BASE["everyday-explanation"], scope: "every" },
    { ...BASE["conceptual-explanation"], scope: "every" },
    { ...PROG_SYNTAX, scope: "every" },
    { ...BASE["formal-definition"], scope: "every" },
    { ...BASE["important-terminology"], scope: "every" },
    { ...BASE["step-by-step-explanation"], scope: "every" },
    { ...BASE["visual-explanation"], scope: "every" },
    { ...BASE["worked-examples"], scope: "every" },
    { ...BASE["code-demonstration"], scope: "every" },
    { ...BASE["common-mistakes"], scope: "every" },
    { ...PROG_DEBUGGING, scope: "every" },
    { ...BASE["practical-applications"], scope: "every" },
    { ...BASE["key-takeaways"], scope: "every" },
    { ...BASE["practice-exercises"], scope: "every" },
    { ...BASE["knowledge-check"], scope: "every" },
    { ...BASE["further-reading"], scope: "every" },
  ],
  library: [
    { ...BASE["what-you-will-learn"], scope: "every" },
    { ...BASE["why-this-topic-matters"], scope: "every" },
    { ...BASE.prerequisites, scope: "every" },
    { ...LIB_INSTALL, scope: "subject-once" },
    { ...BASE["everyday-explanation"], scope: "every" },
    { ...BASE["conceptual-explanation"], scope: "every" },
    { ...BASE["formal-definition"], scope: "every" },
    { ...BASE["important-terminology"], scope: "every" },
    { ...BASE["step-by-step-explanation"], scope: "every" },
    { ...BASE["visual-explanation"], scope: "every" },
    { ...BASE["worked-examples"], scope: "every" },
    { ...BASE["code-demonstration"], scope: "every" },
    { ...LIB_API, scope: "every" },
    { ...LIB_COMPARE, scope: "every" },
    { ...LIB_PERF, scope: "every" },
    { ...BASE["common-mistakes"], scope: "every" },
    { ...BASE["practical-applications"], scope: "every" },
    { ...BASE["key-takeaways"], scope: "every" },
    { ...BASE["practice-exercises"], scope: "every" },
    { ...BASE["knowledge-check"], scope: "every" },
    { ...BASE["further-reading"], scope: "every" },
  ],
  concept: [
    { ...BASE["what-you-will-learn"], scope: "every" },
    { ...BASE["why-this-topic-matters"], scope: "every" },
    { ...BASE.prerequisites, scope: "every" },
    { ...BASE["everyday-explanation"], scope: "every" },
    { ...BASE["conceptual-explanation"], scope: "every" },
    { ...BASE["formal-definition"], scope: "every" },
    { ...BASE["important-terminology"], scope: "every" },
    { ...BASE["step-by-step-explanation"], scope: "every" },
    { ...BASE["visual-explanation"], scope: "every" },
    { ...BASE["worked-examples"], scope: "every" },
    { ...BASE["common-mistakes"], scope: "every" },
    { ...BASE["practical-applications"], scope: "every" },
    { ...BASE["key-takeaways"], scope: "every" },
    { ...BASE["practice-exercises"], scope: "every" },
    { ...BASE["knowledge-check"], scope: "every" },
    { ...BASE["further-reading"], scope: "every" },
  ],
};

/** Minimum total prose words per archetype — shells fail this first. */
export const MIN_TOTAL_WORDS: Record<Archetype, number> = {
  concept: 800,
  math: 1100,
  programming: 1000,
  library: 1200,
};

/** Heading text -> section id (case/space tolerant, optional "N." prefix). */
export function headingToId(heading: string): SectionId | null {
  const cleaned = heading
    .replace(/^\s*\d+[.)]?\s+/, "")
    .replace(/[:：]\s*$/, "")
    .trim()
    .toLowerCase();
  for (const profile of Object.values(ARCHETYPE_PROFILES)) {
    for (const s of profile) {
      if (s.heading.toLowerCase() === cleaned) return s.id;
    }
  }
  return null;
}

/** All known headings (for unknown-heading diagnostics). */
export const ALL_SECTION_SPECS: Record<SectionId, SectionSpec> = (() => {
  const out = {} as Record<SectionId, SectionSpec>;
  for (const profile of Object.values(ARCHETYPE_PROFILES)) for (const s of profile) out[s.id] = s;
  return out;
})();

/** Sections whose python fences must be executed and output-matched. */
export const VERIFY_SECTIONS: SectionId[] = [
  "code-demonstration",
  "worked-examples",
  "api-reference",
  "debugging-exercise",
  "common-mistakes",
];

/** Sections where python fences are present but NOT output-matched (timings, versions). */
export const NO_VERIFY_SECTIONS: SectionId[] = ["performance-considerations", "installation-and-setup"];

export function profileOf(archetype: Archetype): SectionRequirement[] {
  return ARCHETYPE_PROFILES[archetype];
}
