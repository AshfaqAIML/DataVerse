"use client";

/**
 * FunctionGraph — the interactive function plotter.
 *
 * Renders any set of curves (expressions in x, with optional parameter
 * sliders a…d) over a domain, with marked points and vertical guide lines.
 * Used directly as a lesson visual and embedded by several labs.
 */
import { useMemo, useState } from "react";
import type { GraphSpec } from "@/lib/mathcourse/types";
import { sampleFunction, evalExpr } from "@/lib/mathcourse/expr";
import { PlotFrame, curvePaths, LabShell, LabSlider } from "./plotframe";

const RAMP = ["#7c3aed", "#0ea5e9", "#059669", "#d97706", "#dc2626"];

export function FunctionGraph({ spec }: { spec: GraphSpec }) {
  const params = useMemo(() => {
    const env: Record<string, number> = {};
    for (const p of spec.params ?? []) env[p.name] = p.initial;
    return env;
  }, [spec.params]);
  const [env, setEnv] = useState<Record<string, number>>(params);

  const resolved = useMemo(() => {
    const yVals: number[] = [];
    const segmentsPerCurve = spec.curves.map((c) => {
      try {
        return sampleFunction(c.expr, spec.xMin, spec.xMax, env, 500);
      } catch {
        return [];
      }
    });
    for (const segs of segmentsPerCurve) {
      for (const seg of segs) for (const p of seg) yVals.push(p.y);
    }
    return { segmentsPerCurve, yVals };
  }, [spec, env]);

  const yMin = spec.yMin ?? (resolved.yVals.length ? Math.min(...resolved.yVals) - 1 : -5);
  const yMax = spec.yMax ?? (resolved.yVals.length ? Math.max(...resolved.yVals) + 1 : 5);

  return (
    <LabShell title={spec.caption ?? "Interactive graph"} hint={spec.caption}>
      <PlotFrame xMin={spec.xMin} xMax={spec.xMax} yMin={yMin} yMax={yMax} ariaLabel={spec.caption ?? "Function graph"}>
        {(m) => (
          <>
            {(spec.vLines ?? []).map((v, i) => (
              <g key={`v${i}`}>
                <line x1={m.toX(v.x)} y1={m.toY(yMin)} x2={m.toX(v.x)} y2={m.toY(yMax)}
                  stroke="#d97706" strokeWidth={1.5} strokeDasharray={v.dashed === false ? undefined : "6 5"} opacity={0.85} />
                {v.label && (
                  <text x={m.toX(v.x) + 5} y={m.toY(yMax) + 14} fontSize={11.5} fill="#d97706">{v.label}</text>
                )}
              </g>
            ))}
            {resolved.segmentsPerCurve.map((segs, ci) => {
              const color = spec.curves[ci].color ?? RAMP[ci % RAMP.length];
              return curvePaths(m, segs).map((d, si) => (
                <path key={`c${ci}-${si}`} d={d} fill="none" stroke={color}
                  strokeWidth={ci === 0 ? 2.6 : 2.1} strokeDasharray={spec.curves[ci].dashed ? "7 5" : undefined}
                  strokeLinecap="round" />
              ));
            })}
            {(spec.points ?? []).map((p, i) => (
              <g key={`p${i}`}>
                <circle cx={m.toX(p.x)} cy={m.toY(p.y)} r={5} fill="#dc2626" stroke="white" strokeWidth={1.4} />
                {p.label && (
                  <text x={m.toX(p.x) + 8} y={m.toY(p.y) - 8} fontSize={12} fill="#dc2626" fontWeight={600}>{p.label}</text>
                )}
              </g>
            ))}
          </>
        )}
      </PlotFrame>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {spec.curves.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke={c.color ?? RAMP[i % RAMP.length]} strokeWidth="2.6" strokeDasharray={c.dashed ? "5 4" : undefined} /></svg>
            {c.label}
          </span>
        ))}
      </div>

      {(spec.params ?? []).length > 0 && (
        <div className="mt-3 space-y-2.5">
          {(spec.params ?? []).map((p) => (
            <LabSlider key={p.name} label={p.label} min={p.min} max={p.max} step={p.step}
              value={env[p.name] ?? p.initial}
              onChange={(v) => setEnv((e) => ({ ...e, [p.name]: v }))} />
          ))}
        </div>
      )}

      <div className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
        {spec.curves.map((c, i) => {
          let val = "";
          const mid = (spec.xMin + spec.xMax) / 2;
          try {
            val = `f(${fmt(mid)}) = ${fmt(evalExpr(c.expr, { ...env, x: mid }))}`;
          } catch {
            val = "(cannot evaluate here)";
          }
          return (
            <div key={i}>
              <span className="font-semibold" style={{ color: c.color ?? RAMP[i % RAMP.length] }}>{c.label}:</span> {c.expr} — at the middle of the view, {val}
            </div>
          );
        })}
      </div>
    </LabShell>
  );
}

function fmt(v: number): string {
  if (!Number.isFinite(v)) return String(v);
  return String(Number(v.toFixed(4)));
}
