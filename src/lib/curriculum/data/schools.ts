/**
 * School metadata — all ten DataVerse Academy schools (A–J).
 *
 * A school maps to a Subject row in the database; its subjects (courses)
 * carry the registry SubjectDef slugs. Identity colors are theme-aware
 * categorical tokens (globals.css §viz) referenced as CSS variables so a
 * theme switch flips them with everything else — never raw hexes:
 *
 *   A Programming        viz-1  indigo   — the flagship school wears the brand
 *                                         (Python, its anchor subject, is hue-python)
 *   B Mathematics        viz-2  violet   — matches the math course (hue-math)
 *   C Statistics         viz-9  emerald  — matches the stats course (hue-stats)
 *   D Data Analysis      viz-10 teal     — the designated data-analysis accent (DESIGN_SYSTEM §4.5)
 *   E Python Libraries   viz-5  cyan     — NumPy, foundation of the scientific stack (hue-numpy)
 *   F Machine Learning   viz-4  rose     — matches the ML course (hue-ml)
 *   G Deep Learning & AI viz-7  blue     — deep blue for deep learning
 *   H Data Viz & BI      viz-6  moss
 *   I Career Development viz-8  clay
 *   J Classical AI       viz-3  bronze   — matches hue-ai
 *
 * Contrast validated in both themes by scripts/contrast-schools.py
 * (all pairs ≥ 4.5:1 on their theme canvas).
 */
import type { CurriculumSchool } from "../types";

export const SCHOOLS: CurriculumSchool[] = [
  {
    code: "A",
    slug: "programming",
    name: "Programming",
    tagline: "Python, SQL, Git and Jupyter — the tools every data workflow is built on.",
    description:
      "Write your first line of code, then go all the way to confident, idiomatic programming. The language of data, query engines, version control and computational notebooks — taught from zero.",
    color: "var(--dv-viz-1)",
    icon: "code",
  },
  {
    code: "B",
    slug: "mathematics",
    name: "Mathematics",
    tagline: "The math you skipped in school, rebuilt for data work.",
    description:
      "Arithmetic through calculus, rebuilt around intuition first: every formula is derived, every symbol is explained, every idea is anchored to a question data people actually ask.",
    color: "var(--dv-viz-2)",
    icon: "sigma",
  },
  {
    code: "C",
    slug: "statistics",
    name: "Statistics",
    tagline: "From describing data to reasoning under uncertainty.",
    description:
      "Descriptive statistics, probability, inference and Bayesian thinking — the discipline that turns numbers into defensible conclusions.",
    color: "var(--dv-viz-9)",
    icon: "bar-chart",
  },
  {
    code: "D",
    slug: "data-analysis",
    name: "Data Analysis",
    tagline: "Collect, clean, transform, explore, explain.",
    description:
      "The craft of turning raw, messy reality into clean tables and honest answers — Excel, analytical thinking and end-to-end case studies included.",
    color: "var(--dv-viz-10)",
    icon: "table",
  },
  {
    code: "E",
    slug: "python-libraries",
    name: "Python Libraries",
    tagline: "NumPy, pandas and the scientific stack, hands on keyboards.",
    description:
      "The libraries that make Python a data power tool — arrays, dataframes, statistics, plotting and machine learning utilities, each with real datasets and honest performance guidance.",
    color: "var(--dv-viz-5)",
    icon: "boxes",
  },
  {
    code: "F",
    slug: "machine-learning",
    name: "Machine Learning",
    tagline: "How models learn, evaluate and mislead.",
    description:
      "Supervised and unsupervised learning end to end — always with the math underneath, the evaluation discipline alongside, and the failure modes in plain sight.",
    color: "var(--dv-viz-4)",
    icon: "brain",
  },
  {
    code: "G",
    slug: "deep-learning-ai",
    name: "Deep Learning & AI",
    tagline: "Neural networks, Transformers and shipping models.",
    description:
      "From the first artificial neuron to modern attention architectures and deployment — the engine room of modern AI, taught without magic.",
    color: "var(--dv-viz-7)",
    icon: "network",
  },
  {
    code: "H",
    slug: "data-visualization-bi",
    name: "Data Visualization & BI",
    tagline: "Charts, dashboards and stories that tell the truth.",
    description:
      "Visualization principles, statistical charts, dashboard design, data storytelling and the BI tools the industry pays for.",
    color: "var(--dv-viz-6)",
    icon: "chart-line",
  },
  {
    code: "I",
    slug: "career-development",
    name: "Career Development",
    tagline: "Portfolio, resume, interviews, graduation.",
    description:
      "Turn skills into offers: portfolio projects that prove you can do the work, GitHub presence, interview and resume preparation, and a graduation project.",
    color: "var(--dv-viz-8)",
    icon: "briefcase",
  },
  {
    code: "J",
    slug: "classical-ai",
    name: "Classical Artificial Intelligence",
    tagline: "Search, logic, planning and expert systems — symbolic AI from first principles.",
    description:
      "The symbolic half of artificial intelligence, taught the honest way: state spaces, adversarial search, constraint reasoning, logic and resolution, classical planning and expert systems — every algorithm implemented by hand at least once.",
    color: "var(--dv-viz-3)",
    icon: "cpu",
  },
];
