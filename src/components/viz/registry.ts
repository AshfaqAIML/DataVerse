/**
 * registry.ts — the Visual Library catalogue. Every entry pairs a reusable
 * interactive component with the metadata the library page needs (domain,
 * blurb, concepts for search, related lessons pointers). The component
 * references make the library a real catalogue of working objects, not
 * descriptions.
 */
import type { ComponentType } from "react";
import {
  CoordinatePlaneViz,
  FunctionGrapherViz,
  LineViz,
  ParabolaViz,
  VectorViz,
  MatrixViz,
  MatrixMultiplyViz,
  TransformationViz,
} from "./math-viz";
import { DerivativeViz, TangentLineViz, GradientViz, IntegralViz, OptimizationViz } from "./math-viz2";
import {
  HistogramViz,
  BoxPlotViz,
  DistributionViz,
  NormalViz,
  SamplingViz,
  ConfidenceViz,
  HypothesisViz,
  CorrelationViz,
  RegressionViz,
  ProbabilityViz,
} from "./stats-viz";
import {
  DataTableViz,
  DataFrameViz,
  ArrayViz,
  BroadcastingViz,
  AlgorithmViz,
  DecisionBoundaryViz,
  ConfusionMatrixViz,
  FeatureImportanceViz,
} from "./ds-viz";

export type VizDomain = "math" | "stats" | "ds";

export interface VizEntry {
  id: string;
  domain: VizDomain;
  title: string;
  blurb: string;
  /** Searchable keywords — concepts the visualization teaches. */
  concepts: string[];
  component: ComponentType;
  /** Rough interaction affordances, shown as chips. */
  tags: string[];
}

export const VIZ_LIBRARY: VizEntry[] = [
  // ------------------------------------------------------------- mathematics
  {
    id: "coordinate-plane",
    domain: "math",
    title: "Coordinate plane",
    blurb: "Drag a point and watch its address, quadrant, projections and distance from the origin respond.",
    concepts: ["coordinates", "quadrants", "Pythagoras", "distance", "axes", "ordered pair"],
    component: CoordinatePlaneViz,
    tags: ["drag", "readouts"],
  },
  {
    id: "function-grapher",
    domain: "math",
    title: "Function grapher",
    blurb: "Type any expression in x with live parameters; hover-trace the machine-evaluated curve.",
    concepts: ["function", "graph", "expression", "parameters", "trace", "plot"],
    component: FunctionGrapherViz,
    tags: ["expression", "sliders", "hover trace"],
  },
  {
    id: "straight-line",
    domain: "math",
    title: "Straight lines",
    blurb: "y = mx + b made tangible: slope triangle, intercepts and inclination angle, live.",
    concepts: ["slope", "intercept", "linear", "equation of a line", "rise over run"],
    component: LineViz,
    tags: ["sliders"],
  },
  {
    id: "parabola",
    domain: "math",
    title: "Parabolas",
    blurb: "Vertex, axis, roots, discriminant — and the focus & directrix definition — on one draggable curve.",
    concepts: ["quadratic", "vertex", "discriminant", "roots", "focus", "directrix"],
    component: ParabolaViz,
    tags: ["sliders", "toggles"],
  },
  {
    id: "vectors",
    domain: "math",
    title: "Vectors",
    blurb: "Two draggable arrows: head-to-tail addition, difference, dot product and the angle between them.",
    concepts: ["vector", "magnitude", "direction", "dot product", "addition", "angle"],
    component: VectorViz,
    tags: ["drag", "toggles"],
  },
  {
    id: "matrix-transform",
    domain: "math",
    title: "Matrices as transformations",
    blurb: "Edit a 2×2 matrix and watch the unit square, the grid and the basis vectors move; det and inverse live.",
    concepts: ["matrix", "determinant", "inverse", "linear map", "basis vectors", "area factor"],
    component: MatrixViz,
    tags: ["editable matrix", "presets"],
  },
  {
    id: "matrix-multiply",
    domain: "math",
    title: "Matrix multiplication",
    blurb: "Hover any cell of C to light up its row of A and column of B — the dot product, spelled out.",
    concepts: ["matrix product", "dot product", "dimensions", "row times column"],
    component: MatrixMultiplyViz,
    tags: ["hover anatomy", "editable matrix"],
  },
  {
    id: "transformations",
    domain: "math",
    title: "Geometric transformations",
    blurb: "Rotate, scale, shear and translate a shape; the composite affine matrix updates as you move.",
    concepts: ["rotation", "scaling", "shear", "translation", "affine", "composite matrix"],
    component: TransformationViz,
    tags: ["sliders", "composite matrix"],
  },
  {
    id: "derivatives",
    domain: "math",
    title: "Derivatives",
    blurb: "f and f′ on one plane: where the derivative is positive, zero, negative — and what that means for f.",
    concepts: ["derivative", "slope", "rate of change", "increasing", "turning point"],
    component: DerivativeViz,
    tags: ["drag point", "presets"],
  },
  {
    id: "tangent-line",
    domain: "math",
    title: "Tangent lines",
    blurb: "The tangent at a draggable point, its equation — and the linear-approximation error, quantified.",
    concepts: ["tangent", "linear approximation", "point-slope", "normal line", "error"],
    component: TangentLineViz,
    tags: ["drag point", "sliders"],
  },
  {
    id: "gradient",
    domain: "math",
    title: "Gradients",
    blurb: "A contour map with the gradient field: drag a point, read ∇f, and face the steepest uphill direction.",
    concepts: ["gradient", "partial derivatives", "contour", "level set", "steepest ascent"],
    component: GradientViz,
    tags: ["drag point", "contours"],
  },
  {
    id: "integrals",
    domain: "math",
    title: "Integrals",
    blurb: "Riemann rectangles and trapezoids under a curve, marching toward the exact signed area.",
    concepts: ["integral", "area", "Riemann sum", "trapezoid", "signed area", "quadrature"],
    component: IntegralViz,
    tags: ["sliders", "four methods"],
  },
  {
    id: "optimization",
    domain: "math",
    title: "Optimization surfaces",
    blurb: "A 3-D loss landscape and its contours; run gradient descent with your learning rate — watch it converge or diverge.",
    concepts: ["gradient descent", "learning rate", "loss surface", "momentum", "convergence", "local minimum"],
    component: OptimizationViz,
    tags: ["3-D + contours", "sliders"],
  },
  // ------------------------------------------------------------- statistics
  {
    id: "histogram",
    domain: "stats",
    title: "Histograms",
    blurb: "Bins, counts vs density, and the mean–median gap that exposes skew — on four real-shaped datasets.",
    concepts: ["histogram", "bins", "distribution shape", "skew", "mean", "median", "density"],
    component: HistogramViz,
    tags: ["bin slider", "hover bins"],
  },
  {
    id: "box-plot",
    domain: "stats",
    title: "Box plots",
    blurb: "The five-number summary as a picture. Add and drag data points; fences and outliers recompute live.",
    concepts: ["box plot", "quartiles", "median", "IQR", "outlier", "fence", "five-number summary"],
    component: BoxPlotViz,
    tags: ["add & drag points"],
  },
  {
    id: "probability-distributions",
    domain: "stats",
    title: "Probability distributions",
    blurb: "Binomial, Poisson, geometric, Bernoulli, uniform, exponential — pmf and cdf side by side, parameters live.",
    concepts: ["pmf", "pdf", "cdf", "binomial", "Poisson", "geometric", "uniform", "exponential", "expected value", "variance"],
    component: DistributionViz,
    tags: ["six families", "hover values"],
  },
  {
    id: "normal-distribution",
    domain: "stats",
    title: "Normal distribution",
    blurb: "μ and σ sliders, draggable probability bounds with exact areas, z-scores and the 68–95–99.7 rule.",
    concepts: ["normal", "bell curve", "z-score", "empirical rule", "probability as area", "standard deviation"],
    component: NormalViz,
    tags: ["shaded area", "rule toggle"],
  },
  {
    id: "sampling",
    domain: "stats",
    title: "Sampling & the CLT",
    blurb: "Draw samples from a skewed population; the pile of sample means turns normal — the Central Limit Theorem, live.",
    concepts: ["sampling distribution", "Central Limit Theorem", "standard error", "sample mean", "population"],
    component: SamplingViz,
    tags: ["simulation", "seeded"],
  },
  {
    id: "confidence-intervals",
    domain: "stats",
    title: "Confidence intervals",
    blurb: "Build 100 intervals from fresh samples and count the hits — coverage meets its promise in the long run.",
    concepts: ["confidence interval", "margin of error", "t distribution", "coverage", "z vs t"],
    component: ConfidenceViz,
    tags: ["simulation", "z/t toggle"],
  },
  {
    id: "hypothesis-testing",
    domain: "stats",
    title: "Hypothesis testing",
    blurb: "Set the truth and the claim, draw a real sample, and watch the statistic, rejection region and p-value decide.",
    concepts: ["hypothesis test", "p-value", "significance", "rejection region", "Type I", "Type II", "t-test", "z-test"],
    component: HypothesisViz,
    tags: ["draw samples", "full anatomy"],
  },
  {
    id: "correlation",
    domain: "stats",
    title: "Correlation",
    blurb: "Generate a cloud with any target r, then drag single points to feel how much one outlier can bend it.",
    concepts: ["correlation", "Pearson r", "scatterplot", "outlier", "r squared", "linear association"],
    component: CorrelationViz,
    tags: ["drag points", "outlier demo"],
  },
  {
    id: "regression",
    domain: "stats",
    title: "Regression lines",
    blurb: "OLS re-fits as you drag, add or remove points — with residuals, literal squared errors and predictions.",
    concepts: ["regression", "least squares", "residual", "slope", "intercept", "r squared", "RMSE", "prediction"],
    component: RegressionViz,
    tags: ["drag & add points", "squares"],
  },
  {
    id: "probability-experiments",
    domain: "stats",
    title: "Probability experiments",
    blurb: "Coins, dice and urn draws: empirical bars race the theoretical markers; the running frequency settles.",
    concepts: ["law of large numbers", "empirical probability", "theoretical probability", "simulation", "randomness"],
    component: ProbabilityViz,
    tags: ["simulation", "seeded"],
  },
  // ----------------------------------------------------------- data science
  {
    id: "data-table",
    domain: "ds",
    title: "Data tables",
    blurb: "Sort, filter and profile real records: per-column type, stats and missing values, computed live.",
    concepts: ["data table", "sort", "filter", "column profile", "missing values", "types"],
    component: DataTableViz,
    tags: ["sortable", "filterable"],
  },
  {
    id: "dataframe",
    domain: "ds",
    title: "DataFrame preview",
    blurb: "The pandas mental model: shape, dtypes, head/tail and describe() — rendered exactly as a notebook would.",
    concepts: ["DataFrame", "pandas", "dtype", "describe", "head", "tail", "NaN"],
    component: DataFrameViz,
    tags: ["pandas style", "three panels"],
  },
  {
    id: "arrays",
    domain: "ds",
    title: "Arrays & indexing",
    blurb: "NumPy arrays from 1-D to 3-D: pick an index, watch the flat buffer arithmetic; slice with real views.",
    concepts: ["ndarray", "shape", "indexing", "slicing", "row-major", "view", "NumPy"],
    component: ArrayViz,
    tags: ["shape steppers", "slice demos"],
  },
  {
    id: "broadcasting",
    domain: "ds",
    title: "Broadcasting",
    blurb: "NumPy's shape rule, dimension by dimension — including the incompatible case and its exact error.",
    concepts: ["broadcasting", "shape rules", "NumPy", "dimensions", "error message"],
    component: BroadcastingViz,
    tags: ["rule engine", "presets"],
  },
  {
    id: "algorithms",
    domain: "ds",
    title: "Algorithm diagrams",
    blurb: "Five sorting algorithms as real execution traces: play, step, scrub — with compares, writes and pseudocode.",
    concepts: ["sorting", "bubble sort", "insertion sort", "selection sort", "merge sort", "quick sort", "complexity"],
    component: AlgorithmViz,
    tags: ["play & scrub", "counters"],
  },
  {
    id: "decision-boundaries",
    domain: "ds",
    title: "Decision boundaries",
    blurb: "k-NN and logistic regression actually trained in your browser, painting their regions on three datasets.",
    concepts: ["classification", "k-NN", "logistic regression", "decision boundary", "overfitting", "train test split"],
    component: DecisionBoundaryViz,
    tags: ["real training", "two models"],
  },
  {
    id: "confusion-matrix",
    domain: "ds",
    title: "Confusion matrix",
    blurb: "One threshold slider moves the 2×2 counts, precision/recall/F1 and the point on the ROC curve together.",
    concepts: ["confusion matrix", "precision", "recall", "F1", "ROC", "AUC", "threshold", "specificity"],
    component: ConfusionMatrixViz,
    tags: ["threshold sweep", "ROC"],
  },
  {
    id: "feature-importance",
    domain: "ds",
    title: "Feature importance",
    blurb: "Permutation importance, honestly computed: shuffle a column, re-test the model, read the accuracy drop.",
    concepts: ["feature importance", "permutation", "k-NN", "noise features", "signal", "accuracy drop"],
    component: FeatureImportanceViz,
    tags: ["real re-trains", "seeded"],
  },
];

export const VIZ_DOMAIN_META: Record<VizDomain, { label: string; blurb: string; hue: string; emoji: string }> = {
  math: { label: "Mathematics", blurb: "Coordinate planes to optimization surfaces", hue: "var(--dv-viz-2)", emoji: "∑" },
  stats: { label: "Statistics", blurb: "Histograms to hypothesis testing", hue: "var(--dv-viz-9)", emoji: "σ" },
  ds: { label: "Data Science", blurb: "Arrays to decision boundaries", hue: "var(--dv-viz-4)", emoji: "⌗" },
};

export function findViz(id: string): VizEntry | undefined {
  return VIZ_LIBRARY.find((v) => v.id === id);
}
