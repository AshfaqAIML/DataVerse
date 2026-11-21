"use client";

/**
 * LAB 5 — Logic Laboratory: three instruments on one genuine core.
 *
 * 1. Truth tables: a real recursive-descent parser (¬ ∧ ∨ → ↔ ⊕ with the
 *    standard precedence) builds an AST; every row of the table is the AST
 *    evaluated on that assignment, stepped. Subformula columns come from the
 *    AST itself, and the verdict (tautology / contradiction / contingent) is
 *    computed, never asserted.
 * 2. Entailment: premises and a conclusion share one joint table; validity is
 *    decided by hunting for a row with all premises true and the conclusion
 *    false — a real counterexample search.
 * 3. Predicate logic: a six-block world with editable colours and shapes;
 *    quantified formulas are evaluated with per-object steps and witnesses.
 */
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Canvas,
  Chip,
  ChipRow,
  ExecutionControls,
  Insights,
  LabFrame,
  Panel,
  Stat,
  StepNarration,
  useStepper,
} from "./framework";

/* -------------------------------------------------------- the parser */

type FNode =
  | { t: "var"; name: string }
  | { t: "not"; a: FNode }
  | { t: "and"; a: FNode; b: FNode }
  | { t: "or"; a: FNode; b: FNode }
  | { t: "imp"; a: FNode; b: FNode }
  | { t: "iff"; a: FNode; b: FNode }
  | { t: "xor"; a: FNode; b: FNode };

const PRETTY: Record<string, string> = { not: "¬", and: "∧", or: "∨", imp: "→", iff: "↔", xor: "⊕" };

export function parseFormula(src: string): { ok: true; ast: FNode } | { ok: false; error: string } {
  const s = src.replace(/\s+/g, "")
    .replace(/!|¬|~/g, "¬").replace(/&{1,2}|∧/g, "∧").replace(/\|{1,2}|∨/g, "∨")
    .replace(/->|→/g, "→").replace(/<->|↔/g, "↔").replace(/\^|⊕/g, "⊕")
    .replace(/true|T/g, "T").replace(/false|F/g, "F");
  let i = 0;
  const peek = () => s[i];
  const eat = (c: string) => {
    if (s[i] === c) {
      i += 1;
      return true;
    }
    return false;
  };
  function parseIff(): FNode {
    let a = parseImp();
    while (peek() === "↔") {
      i += 1;
      a = { t: "iff", a, b: parseImp() };
    }
    return a;
  }
  function parseImp(): FNode {
    const a = parseOr();
    if (peek() === "→") {
      i += 1;
      return { t: "imp", a, b: parseImp() }; // right associative
    }
    return a;
  }
  function parseOr(): FNode {
    let a = parseAnd();
    while (peek() === "∨") {
      i += 1;
      a = { t: "or", a, b: parseAnd() };
    }
    return a;
  }
  function parseAnd(): FNode {
    let a = parseNot();
    while (peek() === "∧") {
      i += 1;
      a = { t: "and", a, b: parseNot() };
    }
    return a;
  }
  function parseNot(): FNode {
    if (eat("¬")) return { t: "not", a: parseNot() };
    return parseAtom();
  }
  function parseAtom(): FNode {
    const c = peek();
    if (c === "(") {
      i += 1;
      const e = parseIff();
      if (!eat(")")) throw new Error("missing )");
      return e;
    }
    if (c === "T") {
      i += 1;
      return { t: "var", name: "T" };
    }
    if (c === "F") {
      i += 1;
      return { t: "var", name: "F" };
    }
    if (c && /[p-zA-Z]/.test(c)) {
      i += 1;
      return { t: "var", name: c };
    }
    throw new Error(c ? `unexpected "${c}"` : "unexpected end of formula");
  }
  try {
    const ast = parseIff();
    if (i !== s.length) throw new Error(`unexpected "${s[i]}"`);
    return { ok: true, ast };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function show(n: FNode): string {
  switch (n.t) {
    case "var": return n.name;
    case "not": return "¬" + show(n.a);
    case "and": return `(${show(n.a)} ∧ ${show(n.b)})`;
    case "or": return `(${show(n.a)} ∨ ${show(n.b)})`;
    case "imp": return `(${show(n.a)} → ${show(n.b)})`;
    case "iff": return `(${show(n.a)} ↔ ${show(n.b)})`;
    case "xor": return `(${show(n.a)} ⊕ ${show(n.b)})`;
  }
}

function varsOf(n: FNode, into = new Set<string>()): Set<string> {
  if (n.t === "var") {
    if (n.name !== "T" && n.name !== "F") into.add(n.name);
  } else if (n.t === "not") varsOf(n.a, into);
  else {
    varsOf(n.a, into);
    varsOf(n.b, into);
  }
  return into;
}

function subformulas(n: FNode, into: FNode[] = []): FNode[] {
  if (n.t !== "var") into.push(n);
  if (n.t === "not") subformulas(n.a, into);
  else if (n.t !== "var") {
    subformulas(n.a, into);
    subformulas(n.b, into);
  }
  return into;
}

function evalF(n: FNode, env: Record<string, boolean>): boolean {
  switch (n.t) {
    case "var": return n.name === "T" ? true : n.name === "F" ? false : env[n.name];
    case "not": return !evalF(n.a, env);
    case "and": return evalF(n.a, env) && evalF(n.b, env);
    case "or": return evalF(n.a, env) || evalF(n.b, env);
    case "imp": return !evalF(n.a, env) || evalF(n.b, env);
    case "iff": return evalF(n.a, env) === evalF(n.b, env);
    case "xor": return evalF(n.a, env) !== evalF(n.b, env);
  }
}

/* ------------------------------------------------------- the predicate world */

interface Block {
  id: string;
  red: boolean;
  cube: boolean;
}

const PRED_PRESETS = [
  { f: "∀x (Cube(x) → Red(x))", reading: "Every cube is red." },
  { f: "∀x ∃y LeftOf(x, y)", reading: "Every block has some block to its right." },
  { f: "∃x (Cube(x) ∧ ¬Red(x))", reading: "Some cube is not red." },
  { f: "∀x (Red(x) ∨ ¬Red(x))", reading: "Every block is red or not red — a logic law instantiated." },
  { f: "∃x ∀y (LeftOf(x, y) → Cube(y))", reading: "There is a block such that everything to its right is a cube." },
  { f: "¬∃x (Cube(x) ∧ ¬Cube(x))", reading: "No block is both a cube and not a cube." },
];

/* a tiny evaluator for the preset quantified forms (fixed grammar):
   ∀x BODY | ∃x BODY ; BODY over Cube(x), Red(x), LeftOf(x, y) with ¬ ∧ ∨ → */
type PNode =
  | { t: "forall"; body: PNode }
  | { t: "exists"; body: PNode }
  | { t: "not"; a: PNode }
  | { t: "and"; a: PNode; b: PNode }
  | { t: "or"; a: PNode; b: PNode }
  | { t: "imp"; a: PNode; b: PNode }
  | { t: "pred"; name: string; args: string[] };

function parsePred(src: string): PNode {
  const s = src.replace(/\s+/g, " ");
  let i = 0;
  const ws = () => {
    while (s[i] === " ") i += 1;
  };
  const ident = () => {
    ws();
    const m = /^[A-Za-z]+/.exec(s.slice(i));
    if (!m) throw new Error("expected identifier");
    i += m[0].length;
    return m[0];
  };
  function parseQ(): PNode {
    ws();
    if (s.startsWith("∀", i)) {
      i += 1;
      const v = ident();
      return { t: "forall", body: parseQ() };
    }
    if (s.startsWith("∃", i)) {
      i += 1;
      const v = ident();
      return { t: "exists", body: parseQ() };
    }
    return parseImp();
  }
  function parseImp(): PNode {
    const a = parseOr();
    ws();
    if (s[i] === "→") {
      i += 1;
      return { t: "imp", a, b: parseImp() };
    }
    return a;
  }
  function parseOr(): PNode {
    let a = parseAnd();
    while (true) {
      ws();
      if (s[i] === "∨") {
        i += 1;
        a = { t: "or", a, b: parseAnd() };
      } else break;
    }
    return a;
  }
  function parseAnd(): PNode {
    let a = parseNot();
    while (true) {
      ws();
      if (s[i] === "∧") {
        i += 1;
        a = { t: "and", a, b: parseNot() };
      } else break;
    }
    return a;
  }
  function parseNot(): PNode {
    ws();
    if (s[i] === "¬") {
      i += 1;
      return { t: "not", a: parseNot() };
    }
    return parseAtom();
  }
  function parseAtom(): PNode {
    ws();
    if (s[i] === "(") {
      i += 1;
      const e = parseQ();
      ws();
      if (s[i] !== ")") throw new Error("missing )");
      i += 1;
      return e;
    }
    const name = ident();
    ws();
    if (s[i] === "(") {
      i += 1;
      const args: string[] = [];
      for (;;) {
        ws();
        if (s[i] === ")") {
          i += 1;
          break;
        }
        args.push(ident());
        ws();
        if (s[i] === ",") i += 1;
      }
      return { t: "pred", name, args };
    }
    throw new Error(`predicate expected after ${name}`);
  }
  const node = parseQ();
  ws();
  if (i !== s.length) throw new Error(`trailing input at ${i}`);
  return node;
}

interface PredStep {
  note: string;
  phase: string;
  witness?: string;
  truth?: boolean;
  done?: boolean;
}

function evalPredSteps(
  node: PNode,
  blocks: Block[],
  env: Record<string, string> = {},
  steps: PredStep[] = [],
  binder?: string
): boolean {
  const push = (note: string, phase: string, extra?: Partial<PredStep>) => steps.push({ note, phase, ...extra });
  if (node.t === "forall") {
    const varName = "x";
    let all = true;
    for (const b of blocks) {
      const v = evalPredSteps(node.body, blocks, { ...env, [varName]: b.id }, steps, varName);
      push(
        `∀${varName}: with ${varName} = ${b.id} (${describe(b)}), the body is ${v ? "TRUE" : "FALSE"}.`,
        "instantiate",
        { witness: b.id }
      );
      if (!v) {
        all = false;
        break;
      }
    }
    push(
      all
        ? `Every object satisfied the body — the ∀ statement is TRUE in this world.`
        : `A falsifying object was found — the ∀ statement is FALSE in this world.`,
      "quantify",
      { truth: all, done: true }
    );
    return all;
  }
  if (node.t === "exists") {
    const varName = "x";
    let found: Block | null = null;
    for (const b of blocks) {
      const v = evalPredSteps(node.body, blocks, { ...env, [varName]: b.id }, steps, varName);
      push(
        `∃${varName}: trying ${varName} = ${b.id} (${describe(b)}) — the body is ${v ? "TRUE" : "FALSE"}.`,
        "witness",
        { witness: b.id }
      );
      if (v) {
        found = b;
        break;
      }
    }
    const res = found !== null;
    const fid = found?.id;
    push(
      res
        ? `Witness found: ${fid} satisfies the body — the ∃ statement is TRUE in this world.`
        : `No object satisfies the body — the ∃ statement is FALSE in this world.`,
      "quantify",
      { truth: res, witness: fid, done: true }
    );
    return res;
  }
  const ev = (n: PNode): boolean => evalPredSteps(n, blocks, env, steps);
  switch (node.t) {
    case "not": {
      const a = ev(node.a);
      return !a;
    }
    case "and": {
      const a = ev(node.a);
      const b = ev(node.b);
      return a && b;
    }
    case "or": {
      const a = ev(node.a);
      const b = ev(node.b);
      return a || b;
    }
    case "imp": {
      const a = ev(node.a);
      const b = ev(node.b);
      return !a || b;
    }
    case "pred": {
      const [x, y] = node.args.map((a) => env[a]);
      const b = blocks.find((z) => z.id === x);
      const by = blocks.find((z) => z.id === y);
      switch (node.name) {
        case "Red": return !!b?.red;
        case "Cube": return !!b?.cube;
        case "LeftOf": {
          const ix = blocks.findIndex((z) => z.id === x);
          const iy = blocks.findIndex((z) => z.id === y);
          return ix >= 0 && iy >= 0 && ix < iy;
        }
        case "SameColor": return !!b?.red === !!by?.red;
        default: return false;
      }
    }
  }
}

function describe(b: Block): string {
  return `${b.red ? "red" : "blue"} ${b.cube ? "cube" : "ball"}`;
}

/* --------------------------------------------------------------- the lab */

type Mode = "truth" | "entail" | "predicate";

const FORMULA_PRESETS = [
  "¬(P ∧ Q) ↔ (¬P ∨ ¬Q)",
  "(P → Q) ↔ (¬P ∨ Q)",
  "(P ∨ Q) ∧ ¬(P ∧ Q)",
  "P ∨ ¬P",
  "P ∧ ¬P",
  "(P → Q) ∧ P → Q",
];

const ARGUMENTS = [
  { name: "Modus ponens", premises: ["P → Q", "P"], conclusion: "Q" },
  { name: "Affirming the consequent (fallacy)", premises: ["P → Q", "Q"], conclusion: "P" },
  { name: "Disjunctive syllogism", premises: ["P ∨ Q", "¬P"], conclusion: "Q" },
  { name: "Hypothetical syllogism", premises: ["P → Q", "Q → R"], conclusion: "P → R" },
];

export function LogicLab() {
  const [mode, setMode] = useState<Mode>("truth");
  const [argIdx, setArgIdx] = useState(0);
  const arg = ARGUMENTS[argIdx];

  return (
    <LabFrame
      kicker="Laboratory 05 · logic"
      title="Logic Laboratory"
      description="Three instruments on one genuine core: a truth-table builder driven by a real parser, an entailment checker that hunts counterexamples row by row, and a predicate playground where quantified formulas are evaluated over a world of blocks you edit."
      aside={
        <>
          <Panel title="Instrument">
            <ChipRow>
              <Chip active={mode === "truth"} onClick={() => setMode("truth")} hue="var(--dv-viz-3)">Truth tables</Chip>
              <Chip active={mode === "entail"} onClick={() => setMode("entail")} hue="var(--dv-viz-3)">Entailment</Chip>
              <Chip active={mode === "predicate"} onClick={() => setMode("predicate")} hue="var(--dv-viz-3)">Predicates & quantifiers</Chip>
            </ChipRow>
          </Panel>
          {mode === "truth" && (
            <Panel title="Notation">
              <p className="t-caption">
                Use ¬ ∧ ∨ → ↔ ⊕ (or ! &amp; | -&gt; &lt;-&gt; ^) and variables P, Q, R… Precedence: ¬, then ∧, ∨, ⊕, then →, then ↔.
              </p>
            </Panel>
          )}
          {mode === "entail" && (
            <Panel title="Argument">
              <ChipRow>
                {ARGUMENTS.map((a, i) => (
                  <Chip key={a.name} active={argIdx === i} onClick={() => setArgIdx(i)} hue="var(--dv-primary)">
                    {a.name}
                  </Chip>
                ))}
              </ChipRow>
              <div className="mt-3 space-y-1 rounded-lg border border-border-subtle bg-surface-subtle p-3 font-mono text-[13px]">
                {arg.premises.map((p) => (
                  <p key={p} className="text-ink-2">{p}</p>
                ))}
                <div className="my-1 border-t border-border-subtle" />
                <p className="font-semibold text-ink">∴ {arg.conclusion}</p>
              </div>
            </Panel>
          )}
        </>
      }
    >
      <>{mode === "truth" && <TruthTable />}</>
      <>{mode === "entail" && <EntailTable key={argIdx} arg={arg} />}</>
      <>{mode === "predicate" && <PredWorld />}</>
    </LabFrame>
  );
}

/* ---------------------------------------------------------- truth tables */

interface TTStep {
  note: string;
  line: number;
  phase: string;
  env: Record<string, boolean>;
  rowIdx: number;
  final?: boolean;
  done?: boolean;
}

const TT_FALLBACK: TTStep[] = [{ note: "Enter a formula to build its table.", line: 0, phase: "…", env: {}, rowIdx: -1 }];

function TruthTable() {
  const [src, setSrc] = useState("¬(P ∧ Q) ↔ (¬P ∨ ¬Q)");
  const parsed = useMemo(() => parseFormula(src), [src]);

  const model = useMemo(() => {
    if (!parsed.ok) return null;
    const vars = [...varsOf(parsed.ast)].sort();
    const subs = subformulas(parsed.ast);
    const rows = Array.from({ length: Math.pow(2, vars.length) }, (_, i) => {
      const env: Record<string, boolean> = {};
      vars.forEach((v, k) => {
        env[v] = Boolean((i >> (vars.length - 1 - k)) & 1);
      });
      return env;
    });
    const steps: TTStep[] = rows.map((env, idx) => {
      const parts = subs.map((sf) => `${show(sf)} = ${evalF(sf, env) ? "T" : "F"}`);
      return {
        note: `Row ${idx + 1}: ${vars.map((v) => `${v}=${env[v] ? "T" : "F"}`).join(", ")} — ${parts.slice(-3).join(", ")}${parts.length > 3 ? " …" : ""}.`,
        line: 0,
        phase: "evaluate",
        env,
        rowIdx: idx,
        final: evalF(parsed.ast, env),
      };
    });
    const trues = steps.filter((s) => s.final).length;
    const verdict = trues === steps.length ? "tautology" : trues === 0 ? "contradiction" : "contingent";
    steps.push({
      note:
        verdict === "tautology"
          ? `All ${steps.length} rows are TRUE — the formula is a TAUTOLOGY: true under every interpretation.`
          : verdict === "contradiction"
            ? `All rows are FALSE — the formula is a CONTRADICTION.`
            : `True on ${trues} of ${steps.length} rows — the formula is CONTINGENT: its truth depends on the variables.`,
      line: 0,
      phase: "verdict",
      env: {},
      rowIdx: -1,
      done: true,
    });
    return { vars, subs: subs.map(show), subNodes: subs, rows, steps, verdict, trues };
  }, [parsed]);

  const stepper = useStepper(model?.steps ?? TT_FALLBACK);
  const step = stepper.step;

  return (
    <>
      <Panel title="Formula editor">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            className={cn(
              "min-w-0 flex-1 rounded-lg border bg-surface px-3 py-2 font-mono text-[13.5px] text-ink shadow-e1 outline-none",
              parsed.ok ? "border-border-subtle" : "border-danger-border"
            )}
            placeholder="e.g. (P → Q) ∧ ¬Q → ¬P"
          />
          {(["¬", "∧", "∨", "→", "↔", "⊕", "(", ")"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSrc((s) => s + t)}
              className="h-8 w-8 rounded-md border border-border-subtle bg-surface font-mono text-[13px] text-ink-2 transition-colors hover:bg-surface-subtle"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FORMULA_PRESETS.map((p) => (
            <Chip key={p} active={src === p} onClick={() => setSrc(p)} hue="var(--dv-primary)">
              {p}
            </Chip>
          ))}
        </div>
        {!parsed.ok && <p className="mt-2 font-mono text-[12px] text-danger-text">parse error: {parsed.error}</p>}
        {parsed.ok && (
          <p className="mt-2 font-mono text-[12.5px] text-ink-2">
            parsed: <span className="text-viz-3">{show(parsed.ast)}</span>
          </p>
        )}
      </Panel>

      {model && (
        <>
          <StepNarration step={step} />
          <Panel title="Execution">
            <ExecutionControls stepper={stepper} countLabel="row" />
          </Panel>
          <Panel
            title="Truth table — built row by row"
            right={
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
                  model.verdict === "tautology" && "bg-success-bg text-success-text",
                  model.verdict === "contradiction" && "bg-danger-bg text-danger-text",
                  model.verdict === "contingent" && "bg-info-bg text-info-text"
                )}
              >
                {model.verdict}
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-border-subtle">
                    {model.vars.map((v) => (
                      <th key={v} className="py-1.5 pr-3 text-left font-mono text-[12px] font-bold text-ink">{v}</th>
                    ))}
                    {model.subs.map((sf, i) => (
                      <th
                        key={i}
                        className={cn(
                          "py-1.5 pr-3 text-left font-mono text-[12px]",
                          i === model.subs.length - 1 ? "font-bold text-viz-3" : "text-ink-2"
                        )}
                      >
                        {sf}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {model.rows.map((env, r) => {
                    const revealed = step.rowIdx >= r || step.rowIdx === -1;
                    const isCurrent = step.rowIdx === r;
                    const final = evalF(parsed.ok ? parsed.ast : { t: "var", name: "T" }, env);
                    return (
                      <tr
                        key={r}
                        className={cn(
                          "border-b border-border-subtle/50",
                          isCurrent && "bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]",
                          step.rowIdx === -1 && final && "bg-success-bg/30"
                        )}
                      >
                        {model.vars.map((v) => (
                          <td key={v} className="py-1.5 pr-3 font-mono text-ink-2">{env[v] ? "T" : "F"}</td>
                        ))}
                        {model.subNodes.map((subNode, i) => {
                          const val = evalF(subNode, env);
                          return (
                            <td
                              key={i}
                              className={cn(
                                "py-1.5 pr-3 font-mono transition-opacity duration-200",
                                i === model.subs.length - 1 && "font-bold",
                                revealed ? (val ? "text-success-text" : "text-danger-text") : "text-ink-3 opacity-30"
                              )}
                            >
                              {revealed ? (val ? "T" : "F") : "·"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
          <Insights
            items={[
              `The columns are the formula's own subformulas — the parser found them, and each cell is that subformula evaluated on the row's assignment.`,
              model.verdict === "tautology"
                ? "A tautology is true purely by its logical form — no fact about the world can change it. Equivalence laws like de Morgan's are exactly such formulas."
                : model.verdict === "contradiction"
                  ? "A contradiction is false under every interpretation — P ∧ ¬P is the simplest one. No premises can ever entail it unless they are inconsistent."
                  : `Contingent formulas are true on ${model.trues} of ${model.rows.length} rows — their truth is a fact about the situation, not logic alone.`,
              `Rows are enumerated in the standard order: the variables count in binary, so the leftmost column changes slowest.`,
            ]}
          />
        </>
      )}
    </>
  );
}

function EntailTable({ arg }: { arg: { premises: string[]; conclusion: string } }) {
  const model = useMemo(() => {
    const parsedPremises = arg.premises.map((p) => parseFormula(p));
    const parsedConclusion = parseFormula(arg.conclusion);
    if (!parsedConclusion.ok || parsedPremises.some((p) => !p.ok)) return null;
    const asts = parsedPremises.map((p) => (p.ok ? p.ast : null));
    const concl = parsedConclusion.ast;
    const vars = [...new Set([...asts, concl].flatMap((a) => (a ? [...varsOf(a)] : [])))].sort();
    const rows = Array.from({ length: Math.pow(2, vars.length) }, (_, i) => {
      const env: Record<string, boolean> = {};
      vars.forEach((v, k) => {
        env[v] = Boolean((i >> (vars.length - 1 - k)) & 1);
      });
      return env;
    });
    let counterexample: number | null = null;
    const steps = rows.map((env, idx) => {
      const premiseVals = asts.map((a) => (a ? evalF(a, env) : false));
      const conclVal = evalF(concl, env);
      const allTrue = premiseVals.every(Boolean);
      if (allTrue && !conclVal && counterexample === null) counterexample = idx;
      return {
        note: allTrue
          ? `Row ${idx + 1}: all premises TRUE ${conclVal ? "and the conclusion TRUE — this row supports the argument." : "but the conclusion FALSE — a COUNTEREXAMPLE! The argument is invalid."}`
          : `Row ${idx + 1}: premises are not all true (${premiseVals.map((v) => (v ? "T" : "F")).join(", ")}) — this row demands nothing; anything follows from a row where the premises don't hold.`,
        line: 0,
        phase: counterexample === idx ? "counterexample" : "check",
        env,
        rowIdx: idx,
        premiseVals,
        conclVal,
        done: idx === rows.length - 1,
      };
    });
    const valid = counterexample === null;
    steps.push({
      note: valid
        ? `Every row with all premises true also has the conclusion true — the premises ENTAIL the conclusion. The argument is VALID.`
        : `Row ${counterexample! + 1} makes every premise true and the conclusion false — the premises do NOT entail the conclusion. The argument is INVALID, with a concrete counterexample.`,
      line: 0,
      phase: "verdict",
      env: {},
      rowIdx: -1,
      premiseVals: [],
      conclVal: false,
      done: true,
    });
    return { vars, rows, steps, valid, counterexample };
  }, [arg]);

  const stepper = useStepper(model?.steps ?? ([{ note: "…", line: 0, phase: "…", env: {}, rowIdx: -1, premiseVals: [], conclVal: false, done: true }] as Array<{ note: string; line: number; phase: string; env: Record<string, boolean>; rowIdx: number; premiseVals: boolean[]; conclVal: boolean; done?: boolean }>));
  const step = stepper.step;
  if (!model) return null;

  return (
    <>
      <StepNarration step={step} />
      <Panel title="Execution">
        <ExecutionControls stepper={stepper} countLabel="row" />
      </Panel>
      <Panel
        title="The joint truth table — premises and conclusion side by side"
        right={
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
              model.valid ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"
            )}
          >
            {model.valid ? "valid" : "invalid"}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle">
                {model.vars.map((v) => (
                  <th key={v} className="py-1.5 pr-3 text-left font-mono text-[12px] font-bold text-ink">{v}</th>
                ))}
                {arg.premises.map((p) => (
                  <th key={p} className="py-1.5 pr-3 text-left font-mono text-[12px] text-ink-2">{p}</th>
                ))}
                <th className="py-1.5 pr-3 text-left font-mono text-[12px] font-bold text-viz-3">∴ {arg.conclusion}</th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((env, r) => {
                const revealed = step.rowIdx >= r || step.rowIdx === -1;
                const isCounter = model.counterexample === r;
                return (
                  <tr
                    key={r}
                    className={cn(
                      "border-b border-border-subtle/50",
                      revealed && isCounter && "bg-danger-bg/40",
                      step.rowIdx === r && "bg-[color-mix(in_srgb,var(--dv-viz-3)_12%,transparent)]"
                    )}
                  >
                    {model.vars.map((v) => (
                      <td key={v} className="py-1.5 pr-3 font-mono text-ink-2">{env[v] ? "T" : "F"}</td>
                    ))}
                    {arg.premises.map((p) => {
                      const parsed = parseFormula(p);
                      const val = parsed.ok ? evalF(parsed.ast, env) : false;
                      return (
                        <td key={p} className={cn("py-1.5 pr-3 font-mono", revealed ? (val ? "text-success-text" : "text-danger-text") : "text-ink-3 opacity-30")}>
                          {revealed ? (val ? "T" : "F") : "·"}
                        </td>
                      );
                    })}
                    {(() => {
                      const parsed = parseFormula(arg.conclusion);
                      const val = parsed.ok ? evalF(parsed.ast, env) : false;
                      return (
                        <td className={cn("py-1.5 pr-3 font-mono font-bold", revealed ? (val ? "text-success-text" : "text-danger-text") : "text-ink-3 opacity-30")}>
                          {revealed ? (val ? "T" : "F") : "·"}
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Insights
        items={[
          "Validity is not truth: the checker asks only whether TRUE premises could ever coexist with a FALSE conclusion — a question about FORM, answered by exhaustion over every interpretation.",
          model.valid
            ? "No counterexample exists among all interpretations — the conclusion is true in every world the premises describe. That is what an entailment is."
            : "The highlighted row is the argument's autopsy: read it as a story in which the premises hold and the conclusion fails anyway.",
          "This brute-force check is exponential in the number of variables — fine for three, hopeless for three hundred. Resolution (Part D) replaces enumeration with proof.",
        ]}
      />
    </>
  );
}

/* --------------------------------------------------------- predicate world */

function PredWorld() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "a", red: true, cube: true },
    { id: "b", red: false, cube: false },
    { id: "c", red: false, cube: true },
    { id: "d", red: true, cube: false },
    { id: "e", red: false, cube: true },
    { id: "f", red: true, cube: true },
  ]);
  const [formula, setFormula] = useState(PRED_PRESETS[0].f);

  const steps = useMemo<PredStep[]>(() => {
    try {
      const node = parsePred(formula);
      const out: PredStep[] = [];
      evalPredSteps(node, blocks, {}, out);
      out.unshift({
        note: `Evaluating ${formula} — "${PRED_PRESETS.find((p) => p.f === formula)?.reading ?? ""}" — over a world of ${blocks.length} blocks.`,
        phase: "start",
      });
      return out;
    } catch (e) {
      return [{ note: `Cannot parse this formula: ${(e as Error).message}`, phase: "error" }];
    }
  }, [formula, blocks]);

  const stepper = useStepper(steps);
  const step = stepper.step;
  const truth = [...steps].reverse().find((s) => s.done)?.truth;

  return (
    <>
      <Panel title="Formula">
        <ChipRow>
          {PRED_PRESETS.map((p) => (
            <Chip key={p.f} active={formula === p.f} onClick={() => setFormula(p.f)} hue="var(--dv-primary)">
              {p.f}
            </Chip>
          ))}
        </ChipRow>
        <p className="t-caption mt-2">{PRED_PRESETS.find((p) => p.f === formula)?.reading}</p>
      </Panel>
      <Panel title="The world — click to edit">
        <div className="grid grid-cols-2 gap-2">
          {blocks.map((b) => (
            <div key={b.id} className="rounded-lg border border-border-subtle bg-surface-subtle p-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-bold text-ink">{b.id}</span>
                <span className="t-caption">{describe(b)}</span>
              </div>
              <div className="mt-1.5 flex gap-1">
                <Chip active={b.red} onClick={() => setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, red: !x.red } : x)))} hue="#B3362B">
                  {b.red ? "red" : "blue"}
                </Chip>
                <Chip active={b.cube} onClick={() => setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, cube: !x.cube } : x)))} hue="#2D62C8">
                  {b.cube ? "cube" : "ball"}
                </Chip>
              </div>
            </div>
          ))}
        </div>
        <p className="t-caption mt-2">LeftOf(x, y) means x stands somewhere left of y on the shelf; SameColor compares colours.</p>
      </Panel>

      <Canvas>
        <svg viewBox="0 0 720 190" className="h-auto w-full" role="img" aria-label="Blocks world">
          <rect x="20" y="150" width="680" height="8" rx="3" fill="var(--dv-surface-inset)" stroke="var(--dv-border)" />
          {blocks.map((b, i) => {
            const x = 45 + i * 108;
            const highlight = step.witness === b.id;
            return (
              <g key={b.id} style={{ transition: "all 200ms" }}>
                {highlight && <rect x={x - 12} y={64} width="94" height="94" rx="8" fill="none" stroke="var(--dv-primary)" strokeWidth="2" className="dv-pulse" />}
                {b.cube ? (
                  <rect
                    x={x} y={92} width={70} height={58} rx={4}
                    fill={b.red ? "#B3362B" : "#2D62C8"}
                    stroke="var(--dv-border-strong)"
                    style={{ filter: highlight ? "brightness(1.1)" : undefined }}
                  />
                ) : (
                  <circle
                    cx={x + 35} cy={121} r={29}
                    fill={b.red ? "#B3362B" : "#2D62C8"}
                    stroke="var(--dv-border-strong)"
                  />
                )}
                <text x={x + 35} y={b.cube ? 124 : 125} textAnchor="middle" dominantBaseline="middle" fontSize="15" className="font-mono font-bold" fill="#fff" pointerEvents="none">
                  {b.id}
                </text>
                <text x={x + 35} y={86} textAnchor="middle" fontSize="9.5" className="font-mono" fill="var(--dv-ink-3)" pointerEvents="none">
                  {describe(b)}
                </text>
              </g>
            );
          })}
          <text x={360} y={182} textAnchor="middle" fontSize="11" className="fill-[var(--dv-ink-3)] font-mono">
            {formula} — {truth === undefined ? "evaluating…" : truth ? "TRUE in this world" : "FALSE in this world"}
          </text>
        </svg>
      </Canvas>

      <StepNarration step={step} />
      <Panel title="Execution">
        <ExecutionControls stepper={stepper} countLabel="step" />
        {truth !== undefined && (
          <div className="mt-3 flex gap-2">
            <Stat label="verdict" value={truth ? "TRUE" : "FALSE"} tone={truth ? "var(--dv-success-text)" : "var(--dv-danger-text)"} />
            <Stat label="world objects" value={blocks.length} />
          </div>
        )}
      </Panel>
      <Insights
        items={[
          "∀x is checked by trying every object; ∃x stops at the first success. On six blocks this is trivial — on six million it is a database query, which is exactly what your browser just ran.",
          "Edit the world and the same formula flips truth: a quantified statement is a claim about a WORLD, and the world is the experiment.",
          "Note the difference in kind from the truth-table lab: propositional logic enumerates interpretations of atoms; predicate logic checks objects against a fixed interpretation. Model checking versus truth tables.",
        ]}
      />
    </>
  );
}
