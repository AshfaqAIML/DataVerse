/**
 * MathExpr — a small LaTeX-flavored mini-language for the Classical AI
 * textbook's mathematical presentation, parsed into MathNode trees and
 * rendered by src/components/classicalai/math.tsx.
 *
 * Supported syntax (deterministic, no external dependency):
 *
 *   \frac{num}{den}            fractions
 *   \sqrt{x}                   square roots
 *   \sum_{i=1}^{n} body        summation with limits
 *   \prod_{i=1}^{n} body       product with limits
 *   \text{...}                 upright roman text (word labels)
 *   \mat{a, b; c, d}           bracketed matrix (rows split on ";")
 *   \cases{expr, label; ...}   case analysis with a left brace
 *   x_2  x^2  x_{ij}  f^{(k)}  sub- and superscripts (single atom or brace group)
 *   \alpha \beta \theta ...    Greek letters (lower + capitals)
 *   ->  =>  <->  <=>  <-       arrows and implications
 *   <=  >=  !=  ==  ~=         comparisons
 *   and or not                 logic words -> ∧ ∨ ¬
 *   forall exists              quantifiers -> ∀ ∃
 *   \models \vdash \in \subseteq \cup \cap \emptyset \times \cdot
 *   \approx \infty \partial \square \bot \top \therefore
 *   ( ) [ ]                    delimiters (auto-sized by the renderer)
 *   + - = < > | , ;            passed through with math spacing
 *
 * Letters are variables (rendered in Newsreader italic); digits, known
 * function names (min, max, log, ...) and operators are upright.
 */

// ---------------------------------------------------------------- node types

export type MathNode =
  | { t: "sym"; s: string }
  | { t: "num"; s: string }
  | { t: "op"; s: string; rel?: boolean }
  | { t: "text"; s: string }
  | { t: "row"; items: MathNode[] }
  | { t: "sub"; base: MathNode[]; sub: MathNode[] }
  | { t: "sup"; base: MathNode[]; sup: MathNode[] }
  | { t: "frac"; num: MathNode[]; den: MathNode[] }
  | { t: "sqrt"; inner: MathNode[] }
  | { t: "bigop"; op: "∑" | "∏"; lower?: MathNode[]; upper?: MathNode[]; body: MathNode[] }
  | { t: "paren"; l: string; r: string; inner: MathNode[] }
  | { t: "mat"; rows: MathNode[][]; l: string; r: string }
  | { t: "cases"; rows: Array<{ expr: MathNode[]; label?: MathNode[] }> };

// ---------------------------------------------------------------- token defs

type Tok =
  | { k: "cmd"; s: string }
  | { k: "word"; s: string }
  | { k: "num"; s: string }
  | { k: "ch"; s: string }
  | { k: "arrow"; s: string }
  | { k: "text"; s: string };

const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", zeta: "ζ",
  eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ",
  nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ", tau: "τ", upsilon: "υ",
  phi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π",
  Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const CMD_SYMBOLS: Record<string, string> = {
  models: "⊨", vdash: "⊢", in: "∈", notin: "∉", subseteq: "⊆", subset: "⊂",
  cup: "∪", cap: "∩", emptyset: "∅", times: "×", cdot: "·", div: "÷",
  approx: "≈", infty: "∞", partial: "∂", nabla: "∇", square: "□",
  bot: "⊥", top: "⊤", therefore: "∴", because: "∵", dots: "…", ldots: "…",
  prime: "′", deg: "°",
  // common LaTeX aliases (accepted alongside the ASCII forms)
  neg: "¬", lnot: "¬", land: "∧", wedge: "∧", lor: "∨", vee: "∨",
  forall: "∀", exists: "∃",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠",
  equiv: "≡", sim: "∼", propto: "∝", gg: "≫", ll: "≪", ell: "ℓ",
  leftarrow: "←", rightarrow: "→", to: "→", implies: "⇒",
  leftrightarrow: "↔", iff: "↔", Leftrightarrow: "⇔", mapsto: "↦",
  mid: "∣", parallel: "∥", perp: "⊥", ast: "∗", star: "⋆",
  supset: "⊃", supseteq: "⊇", nsupseteq: "⊉", nsubseteq: "⊈",
  langle: "⟨", rangle: "⟩", uparrow: "↑", downarrow: "↓",
 oplus: "⊕", otimes: "⊗", subsetneq: "⊊",
  quad: "\u2003", qquad: "\u2003\u2003", ",": "\u2009", ";": "\u2005", ":": "\u2005",
};

const WORD_OPS: Record<string, string> = {
  and: "∧", or: "∨", not: "¬", forall: "∀", exists: "∃",
};

const FUNC_NAMES = new Set([
  "min", "max", "log", "ln", "exp", "argmax", "argmin", "mean", "var",
  "abs", "len", "gcd", "lcm", "det", "tr", "rank", "sup", "inf", "mod",
]);

const RELATIONS = new Set(["=", "<", ">", "≤", "≥", "≠", "≈", "→", "⇒", "↔", "⇔", "←", "↦", "∈", "∉", "⊆", "⊂", "∪", "∩", "∝", "≡", "⊨", "⊢", "∴", "∵", "≺", "≻"]);

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "\\") {
      const m = /^[A-Za-z]+/.exec(src.slice(i + 1));
      if (!m) {
        // \\{ \\} \\_ \\| — escaped literal characters
        if (i + 1 < n) {
          toks.push({ k: "ch", s: src[i + 1] });
          i += 2;
          continue;
        }
        throw new MathExprError(`Dangling backslash at ${i}`);
      }
      const name = m[0];
      if (name === "text" || name === "mathrm" || name === "operatorname") {
        // \text{...} is captured raw (spaces preserved) as one token.
        let j = i + 1 + name.length;
        while (j < n && /\s/.test(src[j])) j += 1;
        if (src[j] !== "{") throw new MathExprError(`\\${name} expects {...}`);
        let depth = 1;
        let k = j + 1;
        while (k < n && depth > 0) {
          if (src[k] === "{") depth += 1;
          else if (src[k] === "}") depth -= 1;
          if (depth === 0) break;
          k += 1;
        }
        if (depth !== 0) throw new MathExprError(`Unbalanced braces in \\${name}`);
        toks.push({ k: "text", s: src.slice(j + 1, k) });
        i = k + 1;
        continue;
      }
      toks.push({ k: "cmd", s: name });
      i += 1 + name.length;
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      const m = /^[A-Za-z]+/.exec(src.slice(i))!;
      toks.push({ k: "word", s: m[0] });
      i += m[0].length;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i))!;
      toks.push({ k: "num", s: m[0] });
      i += m[0].length;
      continue;
    }
    if (c === "-" && src.slice(i, i + 1) === "-" && src.slice(i, i + 2) === "--") {
      toks.push({ k: "ch", s: "--" }); i += 2; continue;
    }
    // multi-char arrows / comparisons before single chars
    let matchedArrow = false;
    for (const pair of ["<->", "<=>", "->", "=>", "<-", "|->", "<=", ">=", "!=", "==", "~="]) {
      if (src.startsWith(pair, i)) {
        toks.push({ k: "arrow", s: pair });
        i += pair.length;
        matchedArrow = true;
        break;
      }
    }
    // Only skip the fallthrough when THIS iteration consumed an arrow pair.
    // (Inspecting the last pushed token instead loops forever on the first
    // non-arrow character after an arrow — e.g. the space in "A -> B".)
    if (matchedArrow) continue;
    if (/[A-Za-z0-9.\\]/.test(c)) continue; // consumed above
    toks.push({ k: "ch", s: c });
    i += 1;
  }
  return toks;
}

export class MathExprError extends Error {}

// ---------------------------------------------------------------- parser

class Parser {
  private toks: Tok[];
  private pos = 0;

  constructor(src: string) {
    this.toks = tokenize(src);
  }

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  private next(): Tok {
    const t = this.toks[this.pos];
    if (!t) throw new MathExprError("Unexpected end of expression");
    this.pos += 1;
    return t;
  }

  private matchCh(s: string): boolean {
    const t = this.peek();
    if (t && t.k === "ch" && t.s === s) {
      this.pos += 1;
      return true;
    }
    return false;
  }

  /** Parse a brace group `{...}` (or a single atom as a fallback). */
  private group(): MathNode[] {
    if (this.matchCh("{")) {
      const inner = this.exprUntil("}");
      if (!this.matchCh("}")) throw new MathExprError("Expected }");
      return inner;
    }
    const atom = this.atom();
    if (atom === null) throw new MathExprError("Expected an expression");
    return [atom];
  }

  parse(): MathNode[] {
    const out = this.exprUntil(null);
    if (this.pos < this.toks.length) throw new MathExprError(`Unexpected token near position ${this.pos}`);
    return out;
  }

  /** Parse atoms and juxtapositions until a stopper (or EOF). */
  private exprUntil(stopper: string | null): MathNode[] {
    return this.exprUntil2(stopper === null ? null : [stopper]);
  }

  private exprUntil2(stoppers: string[] | null): MathNode[] {
    const items: MathNode[] = [];
    while (this.pos < this.toks.length) {
      const t = this.peek()!;
      if (stoppers && t.k === "ch" && stoppers.includes(t.s)) break;
      if (stoppers === null && t.k === "ch" && (t.s === "}" || t.s === ";")) {
        throw new MathExprError(`Unexpected '${t.s}'`);
      }
      if (stoppers && t.k === "ch" && (t.s === "}" || t.s === "&") && stoppers.includes(";") && !stoppers.includes("}")) {
        throw new MathExprError(`Unexpected '${t.s}'`);
      }
      const node = this.postfixed();
      if (node) items.push(node);
    }
    return items;
  }

  /** One atom with any trailing _/^ postfixes. */
  private postfixed(): MathNode {
    const base = this.atom();
    if (!base) return { t: "sym", s: "?" };
    let node: MathNode = base;
    for (;;) {
      const t = this.peek();
      if (t && t.k === "ch" && t.s === "_") {
        this.pos += 1;
        const sub = this.group();
        node = { t: "sub", base: [node], sub };
      } else if (t && t.k === "ch" && t.s === "^") {
        this.pos += 1;
        const sup = this.group();
        node = { t: "sup", base: [node], sup };
      } else if (t && t.k === "ch" && t.s === "'") {
        this.pos += 1;
        node = { t: "sup", base: [node], sup: [{ t: "sym", s: "′" }] };
      } else break;
    }
    return node;
  }

  private atom(): MathNode | null {
    const t = this.peek();
    if (!t) return null;

    if (t.k === "text") {
      this.pos += 1;
      return { t: "text", s: t.s };
    }

    if (t.k === "cmd") {
      this.pos += 1;
      switch (t.s) {
        case "frac": {
          const num = this.group();
          const den = this.group();
          return { t: "frac", num, den };
        }
        case "sqrt": {
          const inner = this.group();
          return { t: "sqrt", inner };
        }
        case "text": {
          // handled by the tokenizer as a raw text token
          throw new MathExprError("unreachable \\text");
        }
        case "mat": {
          if (!this.matchCh("{")) throw new MathExprError("\\mat expects {rows}");
          const rows: MathNode[][] = [];
          let current: MathNode[] = [];
          for (;;) {
            current = current.concat(this.exprUntil2([";", "&", "}"]));
            const nxt = this.next();
            if (nxt.k === "ch" && nxt.s === "&") {
              current.push({ t: "op", s: "\u2002" }); // column gap
              continue;
            }
            if (nxt.k === "ch" && nxt.s === ";") {
              rows.push(current);
              current = [];
              continue;
            }
            if (nxt.k === "ch" && nxt.s === "}") {
              rows.push(current);
              break;
            }
            throw new MathExprError("Expected ; or } in \\mat");
          }
          return { t: "mat", rows, l: "[", r: "]" };
        }
        case "cases": {
          if (!this.matchCh("{")) throw new MathExprError("\\cases expects {rows}");
          const rows: Array<{ expr: MathNode[]; label?: MathNode[] }> = [];
          for (;;) {
            const expr = this.exprUntil2([",", ";", "}"]);
            let label: MathNode[] | undefined;
            if (this.matchCh(",")) label = this.exprUntil2([";", "}"]);
            rows.push({ expr, label });
            const nxt = this.next();
            if (nxt.k === "ch" && nxt.s === ";") continue;
            if (nxt.k === "ch" && nxt.s === "}") break;
            throw new MathExprError("Expected ; or } in \\cases");
          }
          return { t: "cases", rows };
        }
        case "sum":
        case "prod": {
          let lower: MathNode[] | undefined;
          let upper: MathNode[] | undefined;
          if (this.matchCh("_")) lower = this.group();
          if (this.matchCh("^")) upper = this.group();
          const body = this.postfixed();
          return { t: "bigop", op: t.s === "sum" ? "∑" : "∏", lower, upper, body: [body] };
        }
        default: {
          if (t.s in GREEK) return { t: "sym", s: GREEK[t.s] };
          if (FUNC_NAMES.has(t.s)) return { t: "text", s: t.s };
          if (t.s in CMD_SYMBOLS) return { t: "op", s: CMD_SYMBOLS[t.s], rel: RELATIONS.has(CMD_SYMBOLS[t.s]) };
          throw new MathExprError(`Unknown command \\${t.s}`);
        }
      }
    }

    if (t.k === "word") {
      this.pos += 1;
      if (t.s in WORD_OPS) return { t: "op", s: WORD_OPS[t.s], rel: true };
      if (t.s in GREEK) return { t: "sym", s: GREEK[t.s] };
      if (FUNC_NAMES.has(t.s)) return { t: "text", s: t.s };
      if (t.s.length === 1) return { t: "sym", s: t.s };
      // multi-letter identifier: keep as a single unit, italic
      return { t: "sym", s: t.s };
    }

    if (t.k === "num") {
      this.pos += 1;
      return { t: "num", s: t.s };
    }

    if (t.k === "arrow") {
      this.pos += 1;
      const map: Record<string, string> = {
        "->": "→", "=>": "⇒", "<->": "↔", "<=>": "⇔", "<-": "←", "|->": "↦",
      };
      return { t: "op", s: map[t.s] ?? t.s, rel: true };
    }

    if (t.k === "ch") {
      this.pos += 1;
      const map: Record<string, string> = {
        "<=": "≤", ">=": "≥", "!=": "≠", "==": "≡", "~=": "≅", "*": "·",
      };
      const s = map[t.s] ?? t.s;
      if (s === "(" || s === "[" || s === "{" || s === "|") {
        const close: Record<string, string> = { "(": ")", "[": "]", "{": "}", "|": "|" };
        // | x | is ambiguous — treat | as a plain operator
        if (s === "|") return { t: "op", s: "∣", rel: false };
        const closer = close[s];
        const inner = this.exprUntil(closer === "}" ? "}" : closer);
        const nxt = this.next();
        if (!(nxt.k === "ch" && nxt.s === closer)) throw new MathExprError(`Expected '${closer}'`);
        return { t: "paren", l: s, r: closer, inner };
      }
      if (s === "+" || s === "-" || s === "=" || s === "<" || s === ">" || s === "/") {
        return { t: "op", s, rel: s === "=" || s === "<" || s === ">" };
      }
      if (s === ",") return { t: "op", s: ",", rel: false };
      if (s === ";") return { t: "op", s: ";", rel: false };
      if (s === "!") return { t: "op", s: "!", rel: false };
      if (s === ".") return { t: "op", s: "·", rel: false };
      // any other pass-through character
      return { t: "op", s, rel: RELATIONS.has(s) };
    }

    return null;
  }

  /** Read a raw `{...}` group whose content is plain text. */
  private braceRaw(): string {
    if (!this.matchCh("{")) {
      // single token fallback
      const t = this.next();
      return t.k === "word" || t.k === "cmd" ? t.s : t.k === "num" ? t.s : " ";
    }
    const parts: string[] = [];
    let depth = 1;
    while (this.pos < this.toks.length) {
      const t = this.toks[this.pos];
      if (t.k === "ch" && t.s === "{") depth += 1;
      if (t.k === "ch" && t.s === "}") {
        depth -= 1;
        if (depth === 0) {
          this.pos += 1;
          break;
        }
      }
      parts.push(t.k === "ch" ? t.s : t.s);
      this.pos += 1;
    }
    return parts.join("");
  }
}

/** Parse a MathExpr string. Throws MathExprError on bad syntax. */
export function parseMath(src: string): MathNode[] {
  const trimmed = src.trim();
  if (!trimmed) return [];
  return new Parser(trimmed).parse();
}

/** Safe parse for authoring-time validation: returns errors as strings. */
export function checkMath(src: string): string | null {
  try {
    parseMath(src);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}
