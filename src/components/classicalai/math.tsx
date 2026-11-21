"use client";

/**
 * The Classical AI textbook's mathematical presentation.
 *
 * MathExpr strings (see lib/classicalai/mathexpr.ts) are parsed into
 * MathNode trees and rendered with HTML/CSS + the Newsreader text face:
 * fractions, square roots, big operators with limits, sub/superscripts,
 * matrices, cases and derivations — each step annotated with the reason
 * it is licensed. No external math dependency; every glyph comes from
 * the platform's fonts or the Unicode math ranges.
 */
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { parseMath, type MathNode } from "@/lib/classicalai/mathexpr";

/* ------------------------------------------------------------- primitives */

function Node({ node, depth = 0 }: { node: MathNode; depth?: number }): React.ReactElement {
  switch (node.t) {
    case "sym":
      return <i className="math-it">{node.s}</i>;
    case "num":
      return <span className="math-up">{node.s}</span>;
    case "op":
      return (
        <span className={cn("math-op", node.rel && "math-rel")} aria-hidden={node.s === "\u2002" || node.s === "\u2009" || node.s === "\u2005" || node.s === "\u2003"}>
          {node.s}
        </span>
      );
    case "text":
      return <span className="math-up">{node.s}</span>;
    case "row":
      return (
        <>
          {node.items.map((n, i) => (
            <Node key={i} node={n} depth={depth + 1} />
          ))}
        </>
      );
    case "sub":
      return (
        <span className="inline-flex items-baseline">
          <NodeList nodes={node.base} depth={depth + 1} />
          <sub className="math-sub">
            <NodeList nodes={node.sub} depth={depth + 1} />
          </sub>
        </span>
      );
    case "sup":
      return (
        <span className="inline-flex items-baseline">
          <NodeList nodes={node.base} depth={depth + 1} />
          <sup className="math-sup">
            <NodeList nodes={node.sup} depth={depth + 1} />
          </sup>
        </span>
      );
    case "frac":
      return (
        <span className="math-frac">
          <span className="math-frac-row">
            <span className="math-frac-num">
              <NodeList nodes={node.num} depth={depth + 1} />
            </span>
            <span className="math-frac-den">
              <NodeList nodes={node.den} depth={depth + 1} />
            </span>
          </span>
        </span>
      );
    case "sqrt":
      return (
        <span className="inline-flex items-start">
          <span className="math-sqrt-sign" aria-hidden="true">
            √
          </span>
          <span className="math-sqrt-body">
            <NodeList nodes={node.inner} depth={depth + 1} />
          </span>
        </span>
      );
    case "bigop": {
      return (
        <span className="math-bigop">
          <span className="math-bigop-stack">
            {node.upper && (
              <span className="math-bigop-upper">
                <NodeList nodes={node.upper} depth={depth + 1} />
              </span>
            )}
            <span className="math-bigop-glyph" aria-hidden="true">
              {node.op}
            </span>
            {node.lower && (
              <span className="math-bigop-lower">
                <NodeList nodes={node.lower} depth={depth + 1} />
              </span>
            )}
          </span>
          <span className="math-bigop-body">
            <NodeList nodes={node.body} depth={depth + 1} />
          </span>
        </span>
      );
    }
    case "paren":
      return (
        <span className="inline-flex items-baseline">
          <span className="math-delim" aria-hidden="true">
            {node.l}
          </span>
          <NodeList nodes={node.inner} depth={depth + 1} />
          <span className="math-delim" aria-hidden="true">
            {node.r}
          </span>
        </span>
      );
    case "mat":
      return (
        <span className="inline-flex items-baseline">
          <span className="math-delim" aria-hidden="true">
            {node.l}
          </span>
          <span className="math-mat">
            {node.rows.map((row, i) => (
              <span key={i} className="math-mat-row">
                <NodeList nodes={row} depth={depth + 1} />
              </span>
            ))}
          </span>
          <span className="math-delim" aria-hidden="true">
            {node.r}
          </span>
        </span>
      );
    case "cases":
      return (
        <span className="inline-flex items-baseline">
          <span className="math-cases-brace" aria-hidden="true">
            {"{"}
          </span>
          <span className="math-mat">
            {node.rows.map((row, i) => (
              <span key={i} className="math-mat-row">
                <NodeList nodes={row.expr} depth={depth + 1} />
                {row.label && (
                  <span className="math-cases-label">
                    <NodeList nodes={row.label} depth={depth + 1} />
                  </span>
                )}
              </span>
            ))}
          </span>
        </span>
      );
    default:
      return <></>;
  }
}

function NodeList({ nodes, depth }: { nodes: MathNode[]; depth: number }) {
  return (
    <>
      {nodes.map((n, i) => (
        <Node key={i} node={n} depth={depth + 1} />
      ))}
    </>
  );
}

/* --------------------------------------------------------- display blocks */

/** One centered display equation, with an optional side label. */
export function MathDisplayLine({ expr, label }: { expr: string; label?: string }) {
  const nodes = useMemo(() => {
    try {
      return parseMath(expr);
    } catch {
      return null;
    }
  }, [expr]);

  if (!nodes) {
    // Authoring error surfaced honestly, never silently dropped.
    return (
      <div className="math-error" role="alert">
        ⚠ unparseable math expression: <code>{expr}</code>
      </div>
    );
  }
  return (
    <div className="math-display-row">
      <span className="math-display-eq">
        <NodeList nodes={nodes} depth={0} />
      </span>
      {label && <span className="math-display-label">{label}</span>}
    </div>
  );
}

/** Inline math inside prose: `<MathInline expr="f(n) \in O(2^n)" />`. */
export function MathInline({ expr }: { expr: string }) {
  const nodes = useMemo(() => {
    try {
      return parseMath(expr);
    } catch {
      return null;
    }
  }, [expr]);
  if (!nodes) return <code className="math-error-inline">{expr}</code>;
  return (
    <span className="math-inline">
      <NodeList nodes={nodes} depth={0} />
    </span>
  );
}

