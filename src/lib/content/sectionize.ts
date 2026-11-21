/**
 * MDX frontmatter parsing + fence-aware sectionizing.
 *
 * A lesson.mdx file is:
 *
 *   ---
 *   <yaml frontmatter>
 *   ---
 *   <body: 17 canonical "## Heading" sections>
 *
 * The sectionizer walks the body line by line, tracking fenced code blocks
 * so "## " inside code is never treated as a heading, and records for each
 * section: its canonical id, its heading line, its prose (fences removed)
 * and its fenced blocks in order. Everything downstream (rules, verify,
 * rendering, seeding) consumes this structure.
 */
import { headingToId, type SectionId } from "./sections";

export interface FencedBlock {
  language: string; // "python", "text", "console", "" ...
  content: string;
  startLine: number; // 1-based line of the opening fence
  /** Annotation found on the line directly above the fence. */
  expectError?: string; // error class name when "<!-- expect-error: X -->"
}

export interface SectionNode {
  id: SectionId | null; // null = unrecognized heading
  heading: string;
  startLine: number;
  prose: string; // body without fenced blocks
  raw: string; // full section markdown, fences included (seeding + rendering)
  blocks: FencedBlock[];
}

export interface ParsedLessonFile {
  frontmatterSource: string | null; // raw yaml between the --- markers
  body: string;
  sections: SectionNode[];
  blocks: FencedBlock[]; // all blocks in body order
  images: { alt: string; url: string; line: number }[];
  /** Full prose (no fences, no headings) — word counts and filler checks. */
  allProse: string;
}

const FM_RE = /^---\s*$/;

export function splitFrontmatter(source: string): { frontmatter: string | null; body: string; bodyStartLine: number } {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (!FM_RE.test(lines[0] ?? "")) return { frontmatter: null, body: source, bodyStartLine: 1 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (FM_RE.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end === -1) return { frontmatter: null, body: source, bodyStartLine: 1 };
  return {
    frontmatter: lines.slice(1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
    bodyStartLine: end + 2,
  };
}

const FENCE_RE = /^(```+|~~~+)\s*([^`]*)$/;
const EXPECT_ERROR_RE = /<!--\s*expect-error:\s*([A-Za-z]+)\s*-->/;
const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g;

export function sectionize(body: string, bodyStartLine = 1): Omit<ParsedLessonFile, "frontmatterSource"> {
  const lines = body.split("\n");
  const sections: SectionNode[] = [];
  const allBlocks: FencedBlock[] = [];
  const images: { alt: string; url: string; line: number }[] = [];

  let current: SectionNode | null = null;
  let fence: { marker: string; language: string; startLine: number; lines: string[] } | null = null;
  /** 1-based line number of the last non-blank line outside any fence. */
  let lastProseLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();
    const lineNumber = bodyStartLine + i;

    const fm = fence === null ? trimmed.match(FENCE_RE) : null;
    if (fm) {
      if (current) current.raw += (current.raw ? "\n" : "") + raw;
      fence = { marker: fm[1], language: fm[2].trim().toLowerCase(), startLine: lineNumber, lines: [] };
      continue;
    }
    if (fence !== null) {
      if (trimmed.startsWith(fence.marker)) {
        const block: FencedBlock = {
          language: fence.language,
          content: fence.lines.join("\n"),
          startLine: fence.startLine,
        };
        // look back for an expect-error annotation directly above the fence
        if (lastProseLine === block.startLine - 1) {
          const prev = lines[lastProseLine - bodyStartLine] ?? "";
          const m = prev.match(EXPECT_ERROR_RE);
          if (m) block.expectError = m[1];
        }
        if (current) {
          current.blocks.push(block);
          current.raw += (current.raw ? "\n" : "") + trimmed;
        }
        allBlocks.push(block);
        fence = null;
        continue;
      }
      if (current) current.raw += (current.raw ? "\n" : "") + raw;
      fence.lines.push(raw);
      continue;
    }

    if (trimmed !== "") lastProseLine = lineNumber;

    // "## " heading (level 2 exactly)
    if (/^## /.test(raw)) {
      const heading = raw.replace(/^##\s+/, "").trim();
      current = { id: headingToId(heading), heading, startLine: lineNumber, prose: "", raw: "", blocks: [] };
      sections.push(current);
      continue;
    }

    // image references (outside fences)
    for (const m of raw.matchAll(IMAGE_RE)) images.push({ alt: m[1], url: m[2], line: lineNumber });

    if (current) {
      current.prose += (current.prose ? "\n" : "") + raw;
      current.raw += (current.raw ? "\n" : "") + raw;
    }
  }

  const allProse = sections.map((s) => s.prose).join("\n");
  return { body, sections, blocks: allBlocks, images, allProse };
}

export function parseLessonMdx(source: string): ParsedLessonFile {
  const { frontmatter, body, bodyStartLine } = splitFrontmatter(source);
  const parsed = sectionize(body, bodyStartLine);
  return { frontmatterSource: frontmatter, ...parsed };
}

/** Count prose words (headings excluded, fences excluded). */
export function wordCount(prose: string): number {
  return prose
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;
}

/** Numbered list items ("1. ..." or "1) ..."). */
export function numberedItems(prose: string): string[] {
  return prose.split("\n").filter((l) => /^\s*\d+[.)]\s+\S/.test(l));
}

/** Markdown bullet items ("- " or "* "). */
export function bulletItems(prose: string): string[] {
  return prose.split("\n").filter((l) => /^\s*[-*]\s+\S/.test(l));
}

/** Markdown links with descriptive text: [label](url). */
export function linksOf(prose: string): { text: string; url: string }[] {
  const out: { text: string; url: string }[] = [];
  for (const m of prose.matchAll(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g)) {
    out.push({ text: m[1], url: m[2] });
  }
  return out;
}
