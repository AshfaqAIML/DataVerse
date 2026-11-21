"use client";

/**
 * LabHost — maps a lesson's lab declaration to its interactive component.
 * One place to keep the dispatch, so content files stay pure data.
 */
import type { LabKind } from "@/lib/mathcourse/types";
import { NumberLineLab, FractionStudio, RatioBars, LogScaleLab, SequenceLab } from "./labs-foundations";
import { VectorBoard, MatrixLab, LinearSystemLab, EigenExplorer } from "./labs-algebra";
import { TangentExplorer, RiemannExplorer, NewtonLab, GradientDescentLab } from "./labs-calculus";
import { UnitCircleLab } from "./labs-geometry";

export function LabHost({ lab, title }: { lab: LabKind; title?: string }) {
  switch (lab) {
    case "number-line":
      return <NumberLineLab />;
    case "fraction-studio":
      return <FractionStudio />;
    case "ratio-bars":
      return <RatioBars />;
    case "log-scale":
      return <LogScaleLab />;
    case "sequence-terms":
      return <SequenceLab />;
    case "vector-board":
      return <VectorBoard />;
    case "matrix-lab":
      return <MatrixLab />;
    case "linear-system":
      return <LinearSystemLab />;
    case "eigen":
      return <EigenExplorer />;
    case "tangent":
      return <TangentExplorer />;
    case "riemann":
      return <RiemannExplorer />;
    case "newton-step":
      return <NewtonLab />;
    case "gradient-descent":
      return <GradientDescentLab />;
    case "unit-circle":
      return <UnitCircleLab />;
    default:
      return (
        <div className="rounded-xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-text">
          Unknown lab: {lab}
        </div>
      );
  }
}
