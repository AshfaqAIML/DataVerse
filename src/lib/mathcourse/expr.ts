/**
 * Safe math expression parser + evaluator.
 *
 * Powers every interactive graph in the math course: parses strings like
 * "a * x**2 + b * x + c" or "sin(x) + exp(-x/4)" into an AST and evaluates
 * against a variable/parameter environment. No eval, no Function — content
 * is authored data, but the parser still refuses anything it does not
 * recognize, and rejects non-finite results defensively at the call site.
 *
 * Grammar (precedence low -> high):
 *   expr    := term (("+" | "-") term)*
 *   term    := unary (("*" | "/" | "%") unary)*
 *   unary   := ("-" | "+") unary | power
 *   power   := atom ("**" unary)?            // right-assoc, binds tighter than unary
 *   atom    := number | ident | ident "(" args ")" | "(" expr ")"
 *
 * Note: "-x**2" parses as -(x**2), matching Python and every math text.
 */

export type Env = Record<string, number>;

interface Token {
  kind: "num" | "ident" | "op" | "lparen" | "rparen" | "comma";
  text: string;
  pos: number;
}

type Node =
  | { t: "num"; v: number }
  | { t: "var"; name: string }
  | { t: "call"; name: string; args: Node[] }
  | { t: "bin"; op: string; a: Node; b: Node }
  | { t: "neg"; a: Node };

const FUNCS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log, // natural log — math convention; log10/log2 explicit
  log10: Math.log10,
  log2: Math.log2,
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
};

const CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}
function isIdentStart(c: string): boolean {
  return /[a-zA-Z_]/.test(c);
}
function isIdentChar(c: string): boolean {
  return /[a-zA-Z0-9_]/.test(c);
}

function tokenize(src: string): Token[] {
  const toks: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n") {
      i++;
      continue;
    }
    if (isDigit(c) || (c === "." && i + 1 < src.length && isDigit(src[i + 1]))) {
      let j = i;
      while (j < src.length && (isDigit(src[j]) || src[j] === ".")) j++;
      toks.push({ kind: "num", text: src.slice(i, j), pos: i });
      i = j;
      continue;
    }
    if (isIdentStart(c)) {
      let j = i;
      while (j < src.length && isIdentChar(src[j])) j++;
      toks.push({ kind: "ident", text: src.slice(i, j), pos: i });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === "**") {
      toks.push({ kind: "op", text: "**", pos: i });
      i += 2;
      continue;
    }
    if ("+-*/%^".includes(c)) {
      toks.push({ kind: "op", text: c, pos: i });
      i++;
      continue;
    }
    if (c === "(") {
      toks.push({ kind: "lparen", text: c, pos: i });
      i++;
      continue;
    }
    if (c === ")") {
      toks.push({ kind: "rparen", text: c, pos: i });
      i++;
      continue;
    }
    if (c === ",") {
      toks.push({ kind: "comma", text: c, pos: i });
      i++;
      continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i} in expression: ${src}`);
  }
  return toks;
}

class Parser {
  private toks: Token[];
  private at = 0;
  private src: string;

  constructor(src: string) {
    this.src = src;
    this.toks = tokenize(src);
  }

  private peek(): Token | undefined {
    return this.toks[this.at];
  }
  private next(): Token | undefined {
    return this.toks[this.at++];
  }
  private expectOp(op: string): void {
    const t = this.next();
    if (!t || t.kind !== "op" || t.text !== op) {
      throw new Error(`Expected '${op}' but found '${t?.text ?? "end"}' in: ${this.src}`);
    }
  }

  parse(): Node {
    const n = this.expr();
    if (this.at < this.toks.length) {
      throw new Error(`Unexpected '${this.toks[this.at].text}' after expression in: ${this.src}`);
    }
    return n;
  }

  private expr(): Node {
    let a = this.term();
    for (;;) {
      const t = this.peek();
      if (t && t.kind === "op" && (t.text === "+" || t.text === "-")) {
        this.next();
        const b = this.term();
        a = { t: "bin", op: t.text, a, b };
      } else return a;
    }
  }

  private term(): Node {
    let a = this.unary();
    for (;;) {
      const t = this.peek();
      if (t && t.kind === "op" && (t.text === "*" || t.text === "/" || t.text === "%")) {
        this.next();
        const b = this.unary();
        a = { t: "bin", op: t.text, a, b };
      } else return a;
    }
  }

  private unary(): Node {
    const t = this.peek();
    if (t && t.kind === "op" && (t.text === "-" || t.text === "+")) {
      this.next();
      const a = this.unary();
      return t.text === "-" ? { t: "neg", a } : a;
    }
    return this.power();
  }

  private power(): Node {
    const base = this.atom();
    const t = this.peek();
    if (t && t.kind === "op" && t.text === "**") {
      this.next();
      const exp = this.unary(); // right-associative: 2**3**2 = 2**(3**2)
      return { t: "bin", op: "**", a: base, b: exp };
    }
    return base;
  }

  private atom(): Node {
    const t = this.next();
    if (!t) throw new Error(`Expression ended early: ${this.src}`);
    if (t.kind === "num") {
      const v = Number(t.text);
      if (Number.isNaN(v)) throw new Error(`Bad number '${t.text}' in: ${this.src}`);
      return { t: "num", v };
    }
    if (t.kind === "lparen") {
      const inner = this.expr();
      const close = this.next();
      if (!close || close.kind !== "rparen") {
        throw new Error(`Missing ')' in: ${this.src}`);
      }
      return inner;
    }
    if (t.kind === "ident") {
      const after = this.peek();
      if (after && after.kind === "lparen") {
        this.next(); // consume (
        const args: Node[] = [];
        if (this.peek()?.kind !== "rparen") {
          args.push(this.expr());
          while (this.peek()?.kind === "comma") {
            this.next();
            args.push(this.expr());
          }
        }
        const close = this.next();
        if (!close || close.kind !== "rparen") {
          throw new Error(`Missing ')' after ${t.text}(…) in: ${this.src}`);
        }
        const fn = FUNCS[t.text];
        if (!fn) throw new Error(`Unknown function '${t.text}' in: ${this.src}`);
        if (fn.length !== args.length && fn.length !== 0) {
          // Math.min/Math.max accept any count; FUNCS arity otherwise enforced here
          const variadic = t.text === "min" || t.text === "max" || t.text === "atan2" || t.text === "pow";
          if (!variadic || args.length === 0) {
            throw new Error(`${t.text} expects ${fn.length} argument(s), got ${args.length} in: ${this.src}`);
          }
        }
        return { t: "call", name: t.text, args };
      }
      return { t: "var", name: t.text };
    }
    throw new Error(`Unexpected token '${t.text}' in: ${this.src}`);
  }
}

function evaluateNode(n: Node, env: Env): number {
  switch (n.t) {
    case "num":
      return n.v;
    case "var": {
      if (n.name in env) return env[n.name];
      if (n.name in CONSTS) return CONSTS[n.name];
      throw new Error(`Unknown variable '${n.name}' (known: ${Object.keys(env).join(", ") || "none"})`);
    }
    case "neg":
      return -evaluateNode(n.a, env);
    case "bin": {
      const a = evaluateNode(n.a, env);
      const b = evaluateNode(n.b, env);
      switch (n.op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;
        case "%": return a % b;
        case "**": return Math.pow(a, b);
        default: throw new Error(`Unknown operator ${n.op}`);
      }
    }
    case "call":
      return FUNCS[n.name](...n.args.map((a) => evaluateNode(a, env)));
  }
}

const astCache = new Map<string, Node>();

/** Parse + cache an expression. Throws with a readable message on bad input. */
export function parseExpr(src: string): Node {
  const cached = astCache.get(src);
  if (cached) return cached;
  const ast = new Parser(src).parse();
  if (astCache.size > 500) astCache.clear();
  astCache.set(src, ast);
  return ast;
}

/** Evaluate an expression string against a variable environment. */
export function evalExpr(src: string, env: Env): number {
  return evaluateNode(parseExpr(src), env);
}

/**
 * Sample a function of one variable over [xMin, xMax] into polyline points,
 * splitting at discontinuities/NaN so renderers draw separate segments.
 */
export function sampleFunction(
  expr: string,
  xMin: number,
  xMax: number,
  env: Env = {},
  samples = 420,
): Array<Array<{ x: number; y: number }>> {
  const pts: Array<{ x: number; y: number }> = [];
  const segments: Array<Array<{ x: number; y: number }>> = [];
  const dx = (xMax - xMin) / samples;
  for (let i = 0; i <= samples; i++) {
    const x = xMin + i * dx;
    let y: number;
    try {
      y = evalExpr(expr, { ...env, x });
    } catch {
      y = NaN;
    }
    const finite = Number.isFinite(y);
    const jump =
      finite &&
      pts.length > 0 &&
      Math.abs(y - pts[pts.length - 1].y) > 1e6; // vertical asymptote blow-up
    if (jump) {
      if (pts.length > 1) segments.push(pts.splice(0));
      pts.length = 0;
    }
    if (finite) pts.push({ x, y });
    else if (pts.length > 1) segments.push(pts.splice(0));
    else pts.length = 0;
  }
  if (pts.length > 1) segments.push(pts);
  return segments;
}

/** Numeric derivative via central difference (used by the tangent lab). */
export function numericDerivative(expr: string, x: number, env: Env = {}, h = 1e-5): number {
  const f = (t: number) => evalExpr(expr, { ...env, x: t });
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Numeric partial derivative with respect to a named variable. */
export function numericPartial(
  expr: string,
  varName: string,
  point: Env,
  h = 1e-5,
): number {
  const f = (t: number) => evalExpr(expr, { ...point, [varName]: t });
  return (f(point[varName] + h) - f(point[varName] - h)) / (2 * h);
}

/** Numeric gradient of f(x, y) at a point (used by the descent lab). */
export function numericGradient2D(expr: string, x: number, y: number, h = 1e-5): { gx: number; gy: number } {
  return {
    gx: numericPartial(expr, "x", { x, y }, h),
    gy: numericPartial(expr, "y", { x, y }, h),
  };
}

/** Simpson's rule for definite integrals (used by the Riemann lab). */
export function simpsonIntegrate(expr: string, a: number, b: number, env: Env = {}, n = 1000): number {
  if (n % 2 === 1) n += 1;
  const f = (t: number) => evalExpr(expr, { ...env, x: t });
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (h / 3) * sum;
}
