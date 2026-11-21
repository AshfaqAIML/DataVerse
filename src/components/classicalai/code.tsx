"use client";

/**
 * The Classical AI textbook's code presentation — an IDE-inspired block:
 *
 *   - Python syntax highlighting (a small deterministic tokenizer: no
 *     dependency, identical output server and client)
 *   - line numbers
 *   - a copy control
 *   - a clearly separated, verified OUTPUT section (or the deliberate
 *     error line for error-teaching blocks)
 *   - optional walkthrough bullets beneath
 */
import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineText } from "@/components/course/blocks";

/* ------------------------------------------------------------ highlighting */

const KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const BUILTINS = new Set([
  "abs", "all", "any", "bool", "dict", "enumerate", "filter", "float",
  "frozenset", "getattr", "hasattr", "int", "isinstance", "len", "list",
  "map", "max", "min", "next", "print", "range", "reversed", "round", "set",
  "sorted", "str", "sum", "tuple", "type", "zip", "repr", "input", "format",
  "float", "divmod", "id", "super", "staticmethod", "classmethod", "property",
]);

type Tok = { s: string; c: string };

const C = {
  kw: "text-[#8b5cf6] dark:text-[#c4a5fa]", // keywords — violet
  fn: "text-[#2563eb] dark:text-[#7cb0ff]", // def/call names — blue
  st: "text-[#0e7f5c] dark:text-[#7fd8ac]", // strings — green
  nu: "text-[#b45309] dark:text-[#f0b060]", // numbers — amber
  cm: "text-[#94a3b8] dark:text-[#7b8794] italic", // comments — slate
  bi: "text-[#0f766e] dark:text-[#5fd3c4]", // builtins — teal
  op: "text-[#8896ab] dark:text-[#a5b3c7]", // operators — steel
  df: "text-[#c2410c] dark:text-[#f59e0b]", // decorator — orange
  id: "text-[#1f2937] dark:text-[#dbe3ee]", // identifiers
};

/** Tokenize one line of Python into colored spans (best-effort, safe). */
function highlightLine(line: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const push = (s: string, c: string) => toks.push({ s, c });
  while (i < line.length) {
    const rest = line.slice(i);
    // comment
    if (rest.startsWith("#")) {
      push(rest, C.cm);
      break;
    }
    // strings (single, double, triple, f/b/r-prefixed)
    const strM = /^([fFrRbB]{0,2})("""|'''|"|')/.exec(rest);
    if (strM) {
      const quote = strM[2];
      const prefix = strM[1];
      let j = i + prefix.length;
      let body = "";
      // find the closing quote, handling escapes
      for (;;) {
        if (j >= line.length) {
          body = line.slice(i + prefix.length);
          j = line.length;
          break;
        }
        if (line[j] === "\\") {
          body += line.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (line.startsWith(quote, j)) {
          body += quote;
          j += quote.length;
          break;
        }
        body += line[j];
        j += 1;
      }
      push(prefix + body, C.st);
      i = j;
      continue;
    }
    // numbers
    const numM = /^\d[\d_]*(\.\d+)?([eE][+-]?\d+)?/.exec(rest);
    if (numM) {
      push(numM[0], C.nu);
      i += numM[0].length;
      continue;
    }
    // identifiers / keywords / builtins
    const idM = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (idM) {
      const w = idM[0];
      const after = rest.slice(w.length);
      if (KEYWORDS.has(w)) push(w, C.kw);
      else if (BUILTINS.has(w) && !after.startsWith("(")) push(w, C.bi);
      else if (after.startsWith("(")) push(w, C.fn);
      else push(w, C.id);
      i += w.length;
      continue;
    }
    // decorators
    if (rest.startsWith("@")) {
      const dM = /^@[A-Za-z_][A-Za-z0-9_.]*/.exec(rest);
      if (dM) {
        push(dM[0], C.df);
        i += dM[0].length;
        continue;
      }
    }
    // operators / everything else: chunk runs of punctuation
    const opM = /^[^\w\s"']/.exec(rest);
    if (opM) {
      let j = i;
      while (j < line.length && /[^\w\s"']/.test(line[j])) j += 1;
      push(line.slice(i, j), C.op);
      i = j;
      continue;
    }
    // whitespace / other
    const wsM = /^\s+/.exec(rest);
    if (wsM) {
      push(wsM[0], "");
      i += wsM[0].length;
      continue;
    }
    push(line[i], "");
    i += 1;
  }
  return toks;
}

/* ------------------------------------------------------------ code block */

export function CodeBlock({
  code,
  title,
  lang = "python",
  showLineNumbers = true,
  className,
  dense,
}: {
  code: string;
  title?: string;
  lang?: "python" | "text";
  showLineNumbers?: boolean;
  className?: string;
  dense?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className={cn("code-block overflow-hidden rounded-xl border border-border bg-surface-inset shadow-e1", className)}>
      {/* title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface px-3.5 py-2">
        <span className="flex min-w-0 items-center gap-2">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-ink-3" />
          <span className="truncate font-mono text-[11px] font-medium tracking-wide text-ink-2">
            {title ?? (lang === "python" ? "python" : "listing")}
          </span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-2.5 text-[11px] font-medium text-ink-3 transition-colors hover:border-border-strong hover:text-ink"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-success-text" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* the code */}
      <div className={cn("overflow-x-auto", dense ? "px-1 py-2" : "px-1 py-3")}>
        <pre className="min-w-max font-mono text-[12.5px] leading-[1.65]">
          {lines.map((line, i) => (
            <div key={i} className="flex px-2.5">
              {showLineNumbers && (
                <span className="w-8 shrink-0 select-none pr-3 text-right text-[11px] leading-[1.65] text-ink-3/80">
                  {i + 1}
                </span>
              )}
              <code className="flex-1">
                {line.length === 0 ? (
                  <span> </span>
                ) : (
                  highlightLine(line).map((t, j) => (
                    <span key={j} className={t.c || undefined}>
                      {t.s}
                    </span>
                  ))
                )}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- output */

/** The verified-output section of a code block. */
export function OutputBlock({
  output,
  note,
  verified = true,
  error,
}: {
  output?: string;
  note?: string;
  verified?: boolean;
  error?: string;
}) {
  if (!output && !error) return null;
  return (
    <div
      className={cn(
        "code-output rounded-xl border border-l-[3px] px-4 py-3",
        error ? "border-l-danger-border bg-danger-bg/40" : "border-l-success-border bg-surface-inset/60"
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
        {error ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-danger-border" />
            Deliberate error — the exact final line
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-success-text" />
            {verified ? "Output — verified by actually running this code" : "Output"}
          </>
        )}
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-ink">
        {error ?? output}
      </pre>
      {note && (
        <p className="mt-2 border-t border-border-subtle pt-2 text-xs leading-relaxed text-ink-3">
          <InlineText text={note} />
        </p>
      )}
    </div>
  );
}

/** A terminal-style block for bash/text listings (not executed). */
export function TerminalListing({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-inset shadow-e1">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-3.5 py-2">
        <Terminal className="h-3.5 w-3.5 text-ink-3" />
        <span className="font-mono text-[11px] font-medium text-ink-2">{title ?? "terminal"}</span>
        <span className="ml-auto rounded-full border border-border-subtle px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-ink-3">
          not executed
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}
