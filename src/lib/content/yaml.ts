/**
 * Minimal YAML subset parser for content authoring.
 *
 * Supports the block-style subset used across content/ files and MDX
 * frontmatter (documented in docs/content/AUTHORING_GUIDE.md):
 *
 *   - nested mappings via indentation (2 spaces per level)
 *   - block sequences ("- item"), including sequences of mappings
 *   - plain / single-quoted / double-quoted scalars
 *   - literal block scalars ("|" and "|-")
 *   - comments ("#") outside quoted strings
 *   - scalar typing: true/false, null, integers, floats; everything else string
 *
 * Deliberately NOT supported: flow style ({a: 1}), anchors, tags,
 * multi-document streams, complex keys. Content files stay diff-friendly
 * and unambiguous; the compiler rejects anything outside the subset.
 */

export class YamlParseError extends Error {
  constructor(
    message: string,
    readonly line: number
  ) {
    super(`YAML line ${line}: ${message}`);
    this.name = "YamlParseError";
  }
}

export type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

interface Line {
  text: string; // content without indent
  indent: number;
  number: number; // 1-based source line
  blank: boolean;
}

const SCALAR_PATTERNS: [RegExp, (s: string) => YamlValue][] = [
  [/^(true|True|TRUE)$/, () => true],
  [/^(false|False|FALSE)$/, () => false],
  [/^(null|Null|NULL|~)$/, () => null],
  [/^[-+]?\d+$/, (s) => parseInt(s, 10)],
  [/^[-+]?(\d+\.\d*|\.\d+)([eE][-+]?\d+)?$/, (s) => parseFloat(s)],
];

function indentOf(raw: string): number {
  const m = raw.match(/^[ \t]*/);
  const ws = m ? m[0] : "";
  if (ws.includes("\t")) throw new Error("tabs in indentation");
  return ws.length;
}

/** Strip a trailing unquoted comment: scan respecting single/double quotes. */
function stripComment(raw: string): string {
  let inS = false;
  let inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD) {
      if (i === 0 || raw[i - 1] === " " || raw[i - 1] === "\t") return raw.slice(0, i).trimEnd();
    }
  }
  return raw.trimEnd();
}

/** Parse a scalar in single or double quotes. */
function parseQuoted(s: string, line: number): string {
  const quote = s[0];
  if (quote === "'") {
    if (!s.endsWith("'") || s.length < 2) throw new YamlParseError("unterminated single quote", line);
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (!s.endsWith('"') || s.length < 2) throw new YamlParseError("unterminated double quote", line);
  let out = "";
  for (let i = 1; i < s.length - 1; i++) {
    const c = s[i];
    if (c !== "\\") {
      out += c;
      continue;
    }
    const next = s[i + 1];
    if (next === undefined) throw new YamlParseError("dangling escape", line);
    if (next === "n") out += "\n";
    else if (next === "t") out += "\t";
    else if (next === '"' || next === "\\") out += next;
    else throw new YamlParseError(`unsupported escape \\${next}`, line);
    i++;
  }
  return out;
}

function isQuoted(s: string): boolean {
  return s.length >= 2 && (s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0];
}

function parseScalar(raw: string, line: number): YamlValue {
  const s = raw.trim();
  if (s === "" || s === "~") return null;
  if (s === "[]") return []; // empty list (the only flow style allowed)
  if (s === "{}") return {}; // empty map
  if (isQuoted(s)) return parseQuoted(s, line);
  if (s.startsWith("[") || s.startsWith("{"))
    throw new YamlParseError("flow style [ ] { } is not supported — use block style", line);
  if (s.includes(": ")) throw new YamlParseError(`plain scalar contains ": " — quote the value: ${s}`, line);
  if (s.endsWith(":")) throw new YamlParseError(`plain scalar ends with ":" — quote the value: ${s}`, line);
  for (const [re, conv] of SCALAR_PATTERNS) if (re.test(s)) return conv(s);
  return s;
}

function splitKeyRest(text: string, line: number): [string, string] {
  // find first unquoted ": " (or ":" at end of line)
  let inS = false;
  let inD = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === ":" && !inS && !inD) {
      const isKV = i + 1 === text.length || text[i + 1] === " ";
      if (!isKV) continue;
      const keyRaw = text.slice(0, i).trim();
      const rest = text.slice(i + 1).trim();
      if (keyRaw === "") throw new YamlParseError("empty key", line);
      const key = isQuoted(keyRaw) ? (parseQuoted(keyRaw, line) as string) : keyRaw;
      return [key, rest];
    }
  }
  throw new YamlParseError(`expected "key: value", got: ${text}`, line);
}

interface Block {
  lines: Line[];
}

function shiftToIndent(lines: Line[], line: number): number {
  const first = lines.find((l) => !l.blank);
  if (!first) throw new YamlParseError("empty block", line);
  return first.indent;
}

function trimTrailingBlanks(lines: Line[]): Line[] {
  const out = [...lines];
  while (out.length > 0 && out[out.length - 1].blank) out.pop();
  return out;
}

function isMapItemStart(inline: string): boolean {
  // "- key: value" or "- 'key': value"
  if (/^[^'"\s][^:]*:(\s|$)/.test(inline)) return true;
  return (inline.startsWith("'") || inline.startsWith('"')) && /':(\s|$)/.test(inline);
}

function parseBlock(lines: Line[], indent: number): YamlValue {
  const body = trimTrailingBlanks(lines);
  if (body.length === 0) return null;
  const first = body[0];

  if (first.text.startsWith("- ") || first.text === "-") {
    // ---- sequence
    const items: YamlValue[] = [];
    let i = 0;
    while (i < body.length) {
      const l = body[i];
      if (l.blank) {
        i++;
        continue;
      }
      if (l.indent !== first.indent || !(l.text.startsWith("- ") || l.text === "-"))
        throw new YamlParseError(`bad sequence item indent (expected ${first.indent})`, l.number);
      const inline = l.text === "-" ? "" : l.text.slice(2);
      const itemIndent = l.indent + 2; // content begins right after "- "
      if (inline.trim() === "") {
        // value is a nested block under the dash
        const nested: Line[] = [];
        i++;
        while (i < body.length && (body[i].blank || body[i].indent > l.indent)) {
          nested.push(body[i]);
          i++;
        }
        const nb = trimTrailingBlanks(nested);
        items.push(nb.length === 0 ? null : parseBlock(nb, shiftToIndent(nb, l.number)));
      } else if (isMapItemStart(inline)) {
        // "- key: value" — mapping item; strip the dash and re-parse with the
        // remainder of this item's lines as the item block.
        const rewritten: Line[] = [{ text: inline, indent: itemIndent, number: l.number, blank: false }];
        i++;
        while (i < body.length && (body[i].blank || body[i].indent > l.indent)) {
          rewritten.push(body[i]);
          i++;
        }
        items.push(parseBlock(rewritten, itemIndent));
      } else {
        items.push(parseScalar(inline, l.number));
        i++;
      }
    }
    return items;
  }

  // ---- mapping
  const map: Record<string, YamlValue> = {};
  let i = 0;
  while (i < body.length) {
    const l = body[i];
    if (l.blank) {
      i++;
      continue;
    }
    if (l.indent !== indent) throw new YamlParseError(`bad mapping indent (expected ${indent})`, l.number);
    const [key, rest] = splitKeyRest(l.text, l.number);

    if (rest === "|" || rest === "|-") {
      // literal block scalar
      const contentIndent = indent + 2;
      const raw: Line[] = [];
      i++;
      while (i < body.length && (body[i].blank || body[i].indent >= contentIndent)) {
        raw.push(body[i]);
        i++;
      }
      const nb = trimTrailingBlanks(raw);
      const text = nb
        .map((nl) => {
          if (nl.blank) return "";
          return " ".repeat(Math.max(0, nl.indent - contentIndent)) + nl.text;
        })
        .join("\n");
      map[key] = rest === "|" ? `${text}\n` : text;
      continue;
    }

    if (rest === "") {
      // value is a nested block — or null when nothing deeper follows
      const nested: Line[] = [];
      i++;
      while (i < body.length && (body[i].blank || body[i].indent > l.indent)) {
        nested.push(body[i]);
        i++;
      }
      const nb = trimTrailingBlanks(nested);
      map[key] = nb.length === 0 ? null : parseBlock(nb, shiftToIndent(nb, l.number));
      continue;
    }

    map[key] = parseScalar(rest, l.number);
    i++;
  }
  return map;
}

export function parseYaml(source: string): YamlValue {
  const rawLines = source.replace(/\r\n/g, "\n").split("\n");
  const lines: Line[] = rawLines.map((raw, idx) => {
    const noComment = stripComment(raw);
    const blank = noComment.trim() === "";
    return { text: blank ? "" : noComment.trim(), indent: blank ? -1 : indentOf(noComment), number: idx + 1, blank };
  });
  const body = trimTrailingBlanks(lines);
  if (body.length === 0) return null;
  return parseBlock(body, shiftToIndent(body, 1));
}

export function parseYamlMap(source: string): { [key: string]: YamlValue } {
  const v = parseYaml(source);
  if (v === null) return {};
  if (typeof v !== "object" || Array.isArray(v)) throw new YamlParseError("expected a mapping at top level", 1);
  return v as { [key: string]: YamlValue };
}
