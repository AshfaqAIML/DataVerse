/**
 * Content compiler — loads the content tree and compiles typed lessons.
 *
 * Layout (see docs/content/AUTHORING_GUIDE.md):
 *
 *   content/
 *   ├── manifest.yaml
 *   ├── glossary/core.yaml
 *   ├── review/lifecycle.yaml
 *   └── subjects/<subject-slug>/m01/c01/01-lesson-slug/
 *       ├── lesson.mdx      (frontmatter + 17 canonical sections)
 *       ├── lesson.yaml     (terminology, exercises, knowledge check, reviews)
 *       └── assets/*        (figures, datasets — referenced relatively)
 *
 * The compiler is the only place files are touched. It produces:
 *   - CompiledLesson[]  — validated, sectionized, registry-joined lessons
 *   - load findings     — file/schema/layout problems (rule ids L-*)
 *   - coverage report   — authored vs registry lessons per subject
 *
 * Adding a lesson = adding a directory. No application code changes.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { parseYaml, YamlParseError, type YamlValue } from "./yaml";
import {
  frontmatterSchema,
  glossarySchema,
  lessonDataSchema,
  manifestSchema,
  type ContentManifest,
  type Glossary,
  type LessonData,
  type LessonFrontmatter,
} from "./schemas";
import { parseLessonMdx, type ParsedLessonFile } from "./sectionize";
import type { RegistryLessonRef } from "../curriculum/data";
import { availableSubjects, registryLessonsFor, subjectBySlug } from "../curriculum/data";

export interface Finding {
  rule: string; // e.g. "L01", "S03", "Q04" — see rules.ts for the catalog
  severity: "error" | "warning" | "info";
  /** Lesson ref, subject slug or file path. */
  path: string;
  line?: number;
  message: string;
}

export interface CompiledLesson {
  /** "subject/m1/c1/3" — the canonical lesson ref. */
  ref: string;
  subjectSlug: string;
  moduleIndex: number;
  chapterIndex: number;
  lessonIndex: number;
  /** Directory slug, e.g. "03-variables-and-data-types". */
  dirName: string;
  dir: string;
  frontmatter: LessonFrontmatter;
  data: LessonData;
  parsed: ParsedLessonFile;
  registry: RegistryLessonRef | null;
}

export interface SubjectCoverage {
  subject: string;
  title: string;
  school: string;
  total: number;
  authored: number;
  published: number;
  lessons: { ref: string; title: string; authored: boolean; status?: LessonFrontmatter["status"] }[];
}

export interface ContentBundle {
  root: string;
  manifest: ContentManifest;
  glossary: Glossary;
  lessons: CompiledLesson[];
  findings: Finding[];
  coverage: SubjectCoverage[];
  /** Subjects with content files but no registry entry (error condition). */
  orphanSubjects: string[];
}

const MODULE_DIR = /^m(\d{2})$/;
const CHAPTER_DIR = /^c(\d{2})$/;
const LESSON_DIR = /^(\d{2})-([a-z0-9-]+)$/;

export function defaultContentRoot(): string {
  // src/lib/content/compile.ts -> repo/content (portable across bun and node)
  const meta = import.meta as ImportMeta & { dir?: string };
  const here = meta.dir ?? process.cwd();
  return resolve(here, "../../../content");
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((e) => statSync(join(dir, e)).isDirectory());
}

function readYaml(path: string, findings: Finding[], rule: string): YamlValue | null {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    findings.push({ rule: "L01", severity: "error", path, message: "file not found or unreadable" });
    return null;
  }
  try {
    return parseYaml(raw);
  } catch (err) {
    if (err instanceof YamlParseError) {
      findings.push({ rule, severity: "error", path, line: err.line, message: err.message });
      return null;
    }
    throw err;
  }
}

function loadManifest(root: string, findings: Finding[]): ContentManifest {
  const p = join(root, "manifest.yaml");
  const raw = readYaml(p, findings, "L02");
  const parsed = manifestSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      findings.push({ rule: "L03", severity: "error", path: p, message: `manifest: ${issue.path.join(".")} ${issue.message}` });
    return manifestSchema.parse({
      version: 1,
      standardsVersion: "1.0",
      exercisePolicy: { minExercisesPerLesson: 3, minKnowledgeCheckPerLesson: 3, maxHints: 3, solutionsRequired: true },
      verification: { runner: "python3", timeoutMs: 10000 },
    });
  }
  return parsed.data;
}

function loadGlossary(root: string, findings: Finding[]): Glossary {
  const p = join(root, "glossary", "core.yaml");
  const raw = readYaml(p, findings, "L04");
  const parsed = glossarySchema.safeParse(raw);
  if (!parsed.success) {
    findings.push({ rule: "L05", severity: "error", path: p, message: "glossary/core.yaml is missing or invalid" });
    return { version: 1, terms: [] };
  }
  return parsed.data;
}

export function compileContent(rootOverride?: string): ContentBundle {
  const root = rootOverride ?? defaultContentRoot();
  const findings: Finding[] = [];
  const manifest = loadManifest(root, findings);
  const glossary = loadGlossary(root, findings);
  const lessons: CompiledLesson[] = [];
  const orphanSubjects: string[] = [];

  if (!existsSync(join(root, "subjects"))) {
    findings.push({ rule: "L06", severity: "error", path: root, message: "content/subjects/ directory missing" });
  }

  for (const subjectDir of listDirs(join(root, "subjects"))) {
    const subjectSlug = subjectDir;
    const subjectDef = subjectBySlug(subjectSlug);
    if (!subjectDef) {
      orphanSubjects.push(subjectSlug);
      findings.push({
        rule: "L07",
        severity: "error",
        path: subjectSlug,
        message: `no registry subject '${subjectSlug}' — content can only exist for registered subjects`,
      });
    }
    const subjectPath = join(root, "subjects", subjectDir);

    for (const moduleDir of listDirs(subjectPath)) {
      const mMatch = moduleDir.match(MODULE_DIR);
      if (!mMatch) {
        findings.push({ rule: "L08", severity: "error", path: `${subjectSlug}/${moduleDir}`, message: "module directory must be m01, m02, ..." });
        continue;
      }
      const moduleIndex = parseInt(mMatch[1], 10);

      for (const chapterDir of listDirs(join(subjectPath, moduleDir))) {
        const cMatch = chapterDir.match(CHAPTER_DIR);
        if (!cMatch) {
          findings.push({ rule: "L09", severity: "error", path: `${subjectSlug}/${moduleDir}/${chapterDir}`, message: "chapter directory must be c01, c02, ..." });
          continue;
        }
        const chapterIndex = parseInt(cMatch[1], 10);

        for (const lessonDir of listDirs(join(subjectPath, moduleDir, chapterDir))) {
          const lMatch = lessonDir.match(LESSON_DIR);
          if (!lMatch) {
            findings.push({ rule: "L10", severity: "error", path: `${subjectSlug}/${moduleDir}/${chapterDir}/${lessonDir}`, message: "lesson directory must be NN-kebab-slug" });
            continue;
          }
          const lessonIndex = parseInt(lMatch[1], 10);
          const ref = `${subjectSlug}/m${moduleIndex}/c${chapterIndex}/${lessonIndex}`;
          const dir = join(subjectPath, moduleDir, chapterDir, lessonDir);

          const mdxPath = join(dir, "lesson.mdx");
          if (!existsSync(mdxPath)) {
            findings.push({ rule: "L11", severity: "error", path: ref, message: "lesson.mdx missing" });
            continue;
          }
          const parsedFile = parseLessonMdx(readFileSync(mdxPath, "utf8"));
          if (!parsedFile.frontmatterSource) {
            findings.push({ rule: "L12", severity: "error", path: ref, message: "lesson.mdx is missing its YAML frontmatter block" });
            continue;
          }

          let fmRaw: YamlValue;
          try {
            fmRaw = parseYaml(parsedFile.frontmatterSource) ?? {};
          } catch (err) {
            if (err instanceof YamlParseError) {
              findings.push({ rule: "L12", severity: "error", path: ref, line: err.line, message: err.message });
              continue;
            }
            throw err;
          }
          const fm = frontmatterSchema.safeParse(fmRaw);
          if (!fm.success) {
            for (const issue of fm.error.issues)
              findings.push({ rule: "L13", severity: "error", path: ref, message: `frontmatter: ${issue.path.join(".")} ${issue.message}` });
            continue;
          }

          const yamlPath = join(dir, "lesson.yaml");
          const dataRaw = readYaml(yamlPath, findings, "L14");
          const data = lessonDataSchema.safeParse(dataRaw ?? {});
          if (!data.success) {
            for (const issue of data.error.issues)
              findings.push({ rule: "L15", severity: "error", path: ref, message: `lesson.yaml: ${issue.path.join(".")} ${issue.message}` });
            continue;
          }

          lessons.push({
            ref,
            subjectSlug,
            moduleIndex,
            chapterIndex,
            lessonIndex,
            dirName: lessonDir,
            dir,
            frontmatter: fm.data,
            data: data.data,
            parsed: parsedFile,
            registry: subjectDef
              ? registryLessonsFor(subjectDef).find(
                  (r) => r.moduleIndex === moduleIndex && r.chapterIndex === chapterIndex && r.lessonIndex === lessonIndex
                ) ?? null
              : null,
          });
        }
      }
    }
  }

  const coverage = buildCoverage(lessons);
  return { root, manifest, glossary, lessons, findings, coverage, orphanSubjects };
}

function buildCoverage(lessons: CompiledLesson[]): SubjectCoverage[] {
  const bySubject = new Map<string, CompiledLesson[]>();
  for (const l of lessons) {
    const arr = bySubject.get(l.subjectSlug) ?? [];
    arr.push(l);
    bySubject.set(l.subjectSlug, arr);
  }
  const out: SubjectCoverage[] = [];
  for (const subject of availableSubjects) {
    const authored = bySubject.get(subject.slug) ?? [];
    const authoredRefs = new Map(authored.map((l) => [l.ref, l]));
    const lessonsCovered = registryLessonsFor(subject).map((r) => {
      const ref = `${r.subject}/m${r.moduleIndex}/c${r.chapterIndex}/${r.lessonIndex}`;
      const hit = authoredRefs.get(ref);
      return { ref, title: r.title, authored: !!hit, status: hit?.frontmatter.status };
    });
    out.push({
      subject: subject.slug,
      title: subject.title,
      school: subject.school,
      total: lessonsCovered.length,
      authored: authored.length,
      published: authored.filter((l) => l.frontmatter.status === "published").length,
      lessons: lessonsCovered,
    });
  }
  return out;
}

/** Prose word count across all sections. */
export function lessonProseWords(l: CompiledLesson): number {
  return l.parsed.sections.reduce((n, s) => n + s.prose.split(/\s+/).filter((w) => /\w/.test(w)).length, 0);
}

/** Relative path helper for diagnostics. */
export function rel(root: string, p: string): string {
  return relative(root, p) || p;
}
