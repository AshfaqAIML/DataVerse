/**
 * Content system tests — the CI quality gate.
 *
 * These tests ARE the promise that the platform never displays placeholder
 * lessons: the real content tree must pass every rule, and a deliberately
 * broken fixture must be caught by each rule it violates.
 */
import "../__setup";
import { describe, expect, test } from "bun:test";
import { parseYaml, YamlParseError } from "@/lib/content/yaml";
import { parseLessonMdx } from "@/lib/content/sectionize";
import { compileContent, defaultContentRoot } from "@/lib/content/compile";
import { validateLessonsIn, reportOf } from "@/lib/content/rules";
import { verifyLesson, runPython, normalizeOutput } from "@/lib/content/verify";
import { lifecycleFindings, REQUIRED_APPROVERS, subjectPublishDecision } from "@/lib/content/lifecycle";
import type { CompiledLesson } from "@/lib/content/compile";

const FIXTURE_ROOT = "/home/z/my-project/tests/fixtures/content";

// ---------------------------------------------------------------- yaml parser

describe("yaml subset parser", () => {
  test("parses scalars with typing", () => {
    const doc = parseYaml(`a: 1\nb: 1.5\nc: true\nd: null\ne: hello\nf: "quoted: yes"\n`) as Record<string, unknown>;
    expect(doc.a).toBe(1);
    expect(doc.b).toBe(1.5);
    expect(doc.c).toBe(true);
    expect(doc.d).toBe(null);
    expect(doc.e).toBe("hello");
    expect(doc.f).toBe("quoted: yes");
  });

  test("parses nested maps and sequences of maps", () => {
    const doc = parseYaml([
      "people:",
      "  - name: Ada",
      "    age: 36",
      "  - name: Bo",
      "    age: 4",
      "count: 2",
    ].join("\n")) as Record<string, unknown>;
    const people = doc.people as { name: string; age: number }[];
    expect(people).toHaveLength(2);
    expect(people[0]).toEqual({ name: "Ada", age: 36 });
    expect(people[1]).toEqual({ name: "Bo", age: 4 });
    expect(doc.count).toBe(2);
  });

  test("parses literal block scalars", () => {
    const doc = parseYaml("code: |\n  a = 1\n  print(a)\n") as Record<string, string>;
    expect(doc.code).toBe("a = 1\nprint(a)\n");
  });

  test("rejects flow style with a helpful error", () => {
    expect(() => parseYaml("bad: [1, 2]")).toThrow(YamlParseError);
    expect(() => parseYaml("bad: [1, 2]")).toThrow(/use block style/);
  });

  test("strips comments outside quotes", () => {
    const doc = parseYaml('# top\nname: "Ada # not a comment"\nvalue: 42 # trailing\n') as Record<string, unknown>;
    expect(doc.name).toBe("Ada # not a comment");
    expect(doc.value).toBe(42);
  });
});

// ---------------------------------------------------------------- sectionizer

describe("sectionizer", () => {
  test("is fence-aware: ## inside code is not a heading", () => {
    const parsed = parseLessonMdx("---\ntitle: x\n---\n\n## One\n\n```python\n## this is a comment, not a section\nprint(1)\n```\n\n## Two\n\nprose\n");
    expect(parsed.sections.map((s) => s.heading)).toEqual(["One", "Two"]);
  });

  test("captures raw markdown, blocks and expected-output pairs", () => {
    const body = "## Code demonstration\n\nbefore\n\n```python\nprint(2)\n```\n\n```text\n2\n```\n\nafter\n";
    const parsed = parseLessonMdx(`---\ntitle: x\n---\n\n${body}`);
    const section = parsed.sections[0];
    expect(section.blocks).toHaveLength(2);
    expect(section.blocks[0].language).toBe("python");
    expect(section.blocks[1].language).toBe("text");
    expect(section.raw).toContain("```python");
    expect(section.raw).toContain("after");
    expect(section.prose).not.toContain("```");
  });

  test("detects expect-error annotations", () => {
    const body = "## Common mistakes\n\n<!-- expect-error: NameError -->\n```python\nnope\n```\n";
    const parsed = parseLessonMdx(`---\ntitle: x\n---\n\n${body}`);
    expect(parsed.blocks[0].expectError).toBe("NameError");
  });
});

// ------------------------------------------------------- real content tree

const bundle = compileContent(defaultContentRoot());

describe("compiled content tree", () => {
  test("compiles all three exemplar lessons with registry joins", () => {
    expect(bundle.lessons.map((l) => l.ref).sort()).toEqual([
      "descriptive-statistics/m1/c1/1",
      "numpy/m1/c1/1",
      "python/m1/c1/3",
    ]);
    for (const lesson of bundle.lessons) {
      expect(lesson.registry).not.toBeNull();
      expect(lesson.frontmatter.title).toBe(lesson.registry!.title);
    }
  });

  test("coverage is honest: authored lessons count, planned lessons do not", () => {
    const python = bundle.coverage.find((c) => c.subject === "python")!;
    expect(python.total).toBeGreaterThan(30);
    expect(python.authored).toBe(1);
    const decision = subjectPublishDecision(python);
    expect(decision.publishable).toBe(false);
    // every unauthored lesson blocks, plus the authored one (approved, not yet published)
    expect(decision.blockers.length).toBeGreaterThanOrEqual(python.total - python.authored);
  });
});

describe("the quality gate on the real content tree", () => {
  test(
    "every exemplar lesson passes every rule with executed outputs",
    () => {
      const findings = validateLessonsIn(bundle, { verify: {} });
      const report = reportOf(findings, bundle);
      if (!report.ok) {
        console.error(
          findings
            .filter((f) => f.severity === "error")
            .map((f) => `${f.rule} ${f.path}: ${f.message}`)
            .join("\n")
        );
      }
      expect(report.errorCount).toBe(0);
      expect(report.warningCount).toBe(0);
    },
    60000
  );

  test("python verifier compares against reality", () => {
    expect(runPython("print(1 + 1)", "/tmp").stdout.trim()).toBe("2");
    expect(normalizeOutput(" 2 \n")).toBe("2");
  });
});

// ------------------------------------------------------------ negative fixtures

const fixtureBundle = compileContent(FIXTURE_ROOT);

describe("the quality gate catches broken lessons", () => {
  const findings = validateLessonsIn(fixtureBundle, { verify: {} });
  const report = reportOf(findings, fixtureBundle);
  const rulesFired = new Set(findings.map((f) => f.rule));

  test("the fixture lesson compiles (valid schema) so rules can judge it", () => {
    expect(fixtureBundle.lessons).toHaveLength(1);
    expect(fixtureBundle.findings).toHaveLength(0);
  });

  test("missing sections are structural errors (S01)", () => {
    expect(rulesFired.has("S01")).toBe(true);
  });

  test("thin sections fail the depth rule (S03)", () => {
    expect(rulesFired.has("S03")).toBe(true);
  });

  test("undefined acronyms fail the jargon rule (Q02)", () => {
    expect(rulesFired.has("Q02")).toBe(true);
  });

  test("title drift from the registry fails the join rule (R01)", () => {
    expect(rulesFired.has("R01")).toBe(true);
  });

  test("registry concepts left untaught fail coverage (Q09)", () => {
    expect(rulesFired.has("Q09")).toBe(true);
  });

  test("claimed output that python never printed fails verification (V06)", () => {
    expect(rulesFired.has("V06")).toBe(true);
  });

  test("solutions failing their own tests can never ship (V07)", () => {
    expect(rulesFired.has("V07")).toBe(true);
  });

  test("MCQ with two correct options fails integrity (Q08)", () => {
    expect(rulesFired.has("Q08")).toBe(true);
  });

  test("placeholders in drafts warn (Q01) instead of erroring", () => {
    const q01 = findings.find((f) => f.rule === "Q01");
    expect(q01).toBeDefined();
    expect(q01!.severity).toBe("warning");
  });

  test("the broken lesson fails the overall report", () => {
    expect(report.ok).toBe(false);
    expect(report.errorCount).toBeGreaterThan(5);
  });
});

// --------------------------------------------------------------- lifecycle

describe("editorial lifecycle", () => {
  const base = {
    ref: "test/m1/c1/1",
    subjectSlug: "test",
    moduleIndex: 1,
    chapterIndex: 1,
    lessonIndex: 1,
    dirName: "01-test",
    dir: "/tmp",
    parsed: parseLessonMdx("---\ntitle: x\n---\n\n## One\n\nprose\n"),
  };

  test("approved status demands three recorded approvals (E01)", () => {
    const lesson = {
      ...base,
      frontmatter: { title: "x", archetype: "concept", status: "approved", author: "a@b.c", objectives: ["o one here"], prerequisites: [], codeDemo: { include: true } },
      data: {
        terminology: [],
        exercises: [],
        knowledgeCheck: [],
        reviews: [],
        changes: [],
      },
    } as unknown as CompiledLesson;
    const findings = lifecycleFindings(lesson);
    expect(findings.some((f) => f.rule === "E01")).toBe(true);
    expect(findings.some((f) => f.rule === "E02")).toBe(true); // approved needs verification record
  });

  test("approved status passes with the required approvers and verification", () => {
    const lesson = {
      ...base,
      frontmatter: { title: "x", archetype: "concept", status: "approved", author: "a@b.c", objectives: ["o one here"], prerequisites: [], codeDemo: { include: true } },
      data: {
        terminology: [],
        exercises: [],
        knowledgeCheck: [],
        changes: [],
        reviews: REQUIRED_APPROVERS.approved.map((role, i) => ({
          role,
          reviewer: `rev${i}@dataverse.academy`,
          date: "2026-11-01",
          verdict: "approve",
          notes: "test review record with enough words",
        })),
        verification: { python: "3.12", libraries: {}, verifiedAt: "2026-11-01", how: "test" },
      },
    } as unknown as CompiledLesson;
    const findings = lifecycleFindings(lesson);
    expect(findings).toHaveLength(0);
  });

  test("a request-changes verdict blocks promotion", () => {
    const lesson = {
      ...base,
      frontmatter: { title: "x", archetype: "concept", status: "technical-review", author: "a@b.c", objectives: ["o one here"], prerequisites: [], codeDemo: { include: true } },
      data: {
        terminology: [],
        exercises: [],
        knowledgeCheck: [],
        changes: [],
        reviews: [
          { role: "peer-reviewer", reviewer: "r@b.c", date: "2026-11-01", verdict: "approve", notes: "fine" },
          { role: "technical-reviewer", reviewer: "t@b.c", date: "2026-11-02", verdict: "request-changes", notes: "derivation step 3 is unjustified" },
        ],
      },
    } as unknown as CompiledLesson;
    const findings = lifecycleFindings(lesson);
    expect(findings.some((f) => f.rule === "E01")).toBe(true);
  });

  test("published lessons inside incomplete subjects violate E04", () => {
    const lesson = {
      ...base,
      ref: "python/m9/c9/9",
      subjectSlug: "python",
      frontmatter: { title: "x", archetype: "concept", status: "published", author: "a@b.c", objectives: ["o one here"], prerequisites: [], codeDemo: { include: true } },
      data: {
        terminology: [],
        exercises: [],
        knowledgeCheck: [],
        changes: [],
        reviews: [],
      },
    } as unknown as CompiledLesson;
    const bundleWithPublished = {
      ...bundle,
      lessons: [...bundle.lessons, lesson],
    };
    const findings = validateLessonsIn(bundleWithPublished, { verify: null });
    expect(findings.some((f) => f.rule === "E04" && f.path.includes("python/m9/c9/9"))).toBe(true);
  });
});

// ----------------------------------------------------- verifier direct checks

describe("exercise solutions run against their own tests", () => {
  test("a failing solution produces V07", () => {
    const lesson = {
      ref: "test/m1/c1/1",
      subjectSlug: "test",
      moduleIndex: 1,
      chapterIndex: 1,
      lessonIndex: 1,
      dirName: "01-test",
      dir: "/tmp",
      parsed: parseLessonMdx("---\ntitle: x\n---\n\n## One\n\nprose\n"),
      frontmatter: { title: "x", archetype: "concept", status: "draft", author: "a@b.c", objectives: ["o one here"], prerequisites: [], codeDemo: { include: true } },
      data: {
        terminology: [],
        knowledgeCheck: [],
        changes: [],
        reviews: [],
        exercises: [
          {
            id: "ex-broken",
            kind: "write-code",
            difficulty: "EASY",
            title: "t",
            prompt: "prompt long enough for validation rules",
            hints: ["h"],
            starterCode: "",
            solutionCode: "print(4)",
            explanation: "explanation long enough",
            testCases: [{ name: "wrong", expectedOutput: "5" }],
          },
        ],
      },
    } as unknown as CompiledLesson;
    const findings = verifyLesson(lesson);
    expect(findings.some((f) => f.rule === "V07")).toBe(true);
  });
});
