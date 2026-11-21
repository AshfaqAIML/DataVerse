/**
 * Curated roadmaps — dependency-honest staged journeys.
 *
 * validate.ts enforces the two roadmap invariants:
 *   1. every hard prerequisite of a roadmap subject is itself in the
 *      roadmap (ROADMAP_PREREQ_MISSING), and
 *   2. never staged AFTER the subject that needs it (ROADMAP_PREREQ_ORDER).
 *
 * The "full-academy" roadmap is generated from the dependency graph
 * (see data/index.ts) so it stays complete as subjects are added.
 */
import type { RoadmapDef } from "../types";

/**
 * The recommended Data Scientist roadmap — the academy's flagship path.
 * 68 subjects across 10 stages; mathematics and statistics always arrive
 * before the machine learning that depends on them.
 */
export const DATA_SCIENTIST_ROADMAP: RoadmapDef = {
  slug: "data-scientist",
  title: "The Data Scientist Roadmap",
  audience: "Career changers and students who want a complete, dependency-honest path from zero to data scientist",
  description:
    "The complete recommended journey through DataVerse Academy: programming first, then the mathematics and statistics every analyst needs, the Python data stack, honest exploration and inference, applied machine learning on top of the math, deep learning, and finally the career school that turns it into offers. Every stage unlocks exactly when its prerequisites are mastered — placement tests can waive any subject you already know.",
  outcomes: [
    "Write confident Python and build complete data analyses in pandas",
    "Reason with the statistics and mathematics that models are built on",
    "Train, evaluate, and interpret machine learning models honestly",
    "Ship a portfolio and interview for data roles with a defensible record",
  ],
  stages: [
    {
      title: "First Tools",
      focus: "Programming, version control and notebooks — the daily instruments of data work",
      subjects: ["python", "programming-fundamentals", "git-github", "jupyter-notebook"],
    },
    {
      title: "Mathematical Foundations",
      focus: "The school-day math you actually need, rebuilt for data work",
      subjects: [
        "arithmetic-foundations",
        "fractions-percentages",
        "algebra-fundamentals",
        "equations-inequalities",
        "functions-graphs",
        "exponents-logarithms",
      ],
    },
    {
      title: "Data Bootstrapping",
      focus: "Arrays, DataFrames, and the analyst's workflow from raw files to analysis-ready tables",
      subjects: [
        "numpy",
        "pandas",
        "data-analytics-fundamentals",
        "data-collection",
        "data-cleaning",
        "data-transformation",
      ],
    },
    {
      title: "Describing and Exploring",
      focus: "Summaries, shape, charts and questions — seeing what the data actually says",
      subjects: [
        "descriptive-statistics",
        "exploratory-data-analysis",
        "visualization-principles",
        "statistical-charts",
        "matplotlib",
        "seaborn",
      ],
    },
    {
      title: "Probability and Inference",
      focus: "From randomness to defensible conclusions — the statistics that gate the modeling core",
      subjects: [
        "statistics-thinking",
        "probability",
        "probability-distributions",
        "sampling",
        "confidence-intervals",
        "hypothesis-testing",
        "correlation",
        "regression",
        "statistical-inference",
      ],
    },
    {
      title: "Analysis in Practice",
      focus: "Business framing, analytical thinking and full case studies — doing the work end to end",
      subjects: [
        "business-analytics",
        "analytical-thinking",
        "case-studies",
        "dashboard-design",
        "data-storytelling",
        "power-bi",
      ],
    },
    {
      title: "The Modeling Core",
      focus: "Linear algebra, calculus and optimization — then machine learning built on top of them",
      subjects: [
        "vectors-matrices",
        "linear-algebra",
        "calculus",
        "optimization",
        "ml-fundamentals",
        "supervised-learning",
        "unsupervised-learning",
      ],
    },
    {
      title: "Applied Machine Learning",
      focus: "The scikit-learn workbench, honest evaluation, and the craft choices around models",
      subjects: [
        "scikit-learn",
        "feature-engineering",
        "ml-regression",
        "classification",
        "clustering",
        "ensemble-learning",
        "model-evaluation",
        "model-selection",
        "hyperparameter-tuning",
        "model-interpretation",
      ],
    },
    {
      title: "Deep Learning and AI",
      focus: "Neural networks from the first neuron to Transformers, and shipping what you train",
      subjects: [
        "neural-networks",
        "backpropagation",
        "deep-learning-optimization",
        "pytorch",
        "computer-vision",
        "nlp",
        "transformers",
        "model-deployment",
      ],
    },
    {
      title: "Career Launch",
      focus: "Portfolio, GitHub, resume, interviews and the graduation capstone",
      subjects: [
        "portfolio-projects",
        "github-portfolio",
        "interview-preparation",
        "resume-preparation",
        "practical-assessments",
        "capstone-projects",
      ],
    },
  ],
};
