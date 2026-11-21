/**
 * Lab data — the seven disciplines of the Learning Laboratories.
 *
 * AUTHORING GUARANTEE: every `expectedOutput` below was captured by running
 * the reference solution through the EXACT engine the browser lab uses
 * (scripts/pyodide-node.ts against public/vendor/pyodide — Python 3.12.7,
 * numpy 2.0.2, pandas 2.2.3, scipy 1.14.1, scikit-learn 1.6.1, matplotlib
 * 3.8.4) — see scripts/lab-solutions.py. SQL expected tables were captured
 * through PGlite against public/sql-lab/datasets/ecommerce.sql
 * (scripts/sql-lab-node.ts). Nothing here is typed by hand.
 */

export type LabDiscipline = "python" | "sql" | "numpy" | "pandas" | "statistics" | "dataviz" | "ml";

export interface LabExercise {
  id: string;
  title: string;
  /** The instruction panel body. */
  prompt: string;
  concepts: string[];
  starter: string;
  /** Engine-verified stdout of the reference solution. */
  expectedOutput: string;
  solution: string;
  hint: string;
  /** Teaching note revealed after a run, pass or fail. */
  explanation: string;
  difficulty: "warmup" | "core" | "stretch";
}

export interface SqlExercise extends Omit<LabExercise, "expectedOutput"> {
  expected: { columns: string[]; rows: (string | number | null)[][]; rowCount: number };
}

export interface LabDisciplineMeta {
  id: LabDiscipline;
  name: string;
  tagline: string;
  /** Honest engine line shown in the lab header. */
  engine: string;
  /** Packages the Pyodide worker installs on first run ("sql" = PGlite). */
  packages: string[];
  kind: "python" | "sql";
  icon: "python" | "sql" | "numpy" | "pandas" | "statistics" | "dataviz" | "ml";
  hue: string;
  firstLoadNote: string;
  scratchStarter: string;
  exercises: LabExercise[];
  sqlExercises?: SqlExercise[];
}

import { PYTHON_EXERCISES, NUMPY_EXERCISES, PANDAS_EXERCISES, STATS_EXERCISES, ML_EXERCISES, DATAVIZ_EXERCISES, SQL_CHALLENGES } from "./exercise-sets";

export const LAB_DISCIPLINES: LabDisciplineMeta[] = [
  {
    id: "python",
    name: "Python Laboratory",
    tagline: "Pure Python — variables to loops, in the same engine the courses run on.",
    engine: "Python 3.12 · WebAssembly (Pyodide)",
    packages: [],
    kind: "python",
    icon: "python",
    hue: "var(--dv-viz-1)",
    firstLoadNote: "First run downloads the Python engine once (~13 MB, cached by your browser afterwards).",
    scratchStarter: `# The Python Laboratory — scratch pad.
# Write anything; Run executes it in your browser.

names = ["Ada", "Grace", "Katherine"]
for i, name in enumerate(names, start=1):
    print(f"{i}. {name}")
`,
    exercises: PYTHON_EXERCISES,
  },
  {
    id: "sql",
    name: "SQL Laboratory",
    tagline: "Real PostgreSQL in your browser — queries run against the ShopSphere e-commerce database.",
    engine: "PostgreSQL 16 · PGlite (WebAssembly)",
    packages: [],
    kind: "sql",
    icon: "sql",
    hue: "var(--dv-viz-7)",
    firstLoadNote: "First run boots PostgreSQL in your browser and seeds the ShopSphere dataset (~5 MB).",
    scratchStarter: `-- The SQL Laboratory — scratch pad, on the ShopSphere database.
-- The schema browser on the right lists every table.

SELECT * FROM products LIMIT 5;
`,
    exercises: [],
    sqlExercises: SQL_CHALLENGES,
  },
  {
    id: "numpy",
    name: "NumPy Laboratory",
    tagline: "Vectorized thinking — arrays, broadcasting, slicing and aggregation.",
    engine: "Python 3.12 + NumPy 2.0.2 · WebAssembly",
    packages: ["numpy"],
    kind: "python",
    icon: "numpy",
    hue: "var(--dv-viz-5)",
    firstLoadNote: "First run downloads the Python engine plus the NumPy wheel (~19 MB total, cached afterwards).",
    scratchStarter: `import numpy as np

# The NumPy Laboratory — scratch pad.

a = np.arange(12).reshape(3, 4)
print(a)
print("column means:", a.mean(axis=0))
`,
    exercises: NUMPY_EXERCISES,
  },
  {
    id: "pandas",
    name: "pandas Laboratory",
    tagline: "The analyst's toolkit — DataFrames, filtering, cleaning, grouping and merging.",
    engine: "Python 3.12 + pandas 2.2.3 · WebAssembly",
    packages: ["pandas"],
    kind: "python",
    icon: "pandas",
    hue: "var(--dv-viz-10)",
    firstLoadNote: "First run downloads the Python engine plus pandas and its dependencies (~25 MB, cached afterwards).",
    scratchStarter: `import pandas as pd

# The pandas Laboratory — scratch pad.

df = pd.DataFrame({"city": ["Paris", "Lyon"], "revenue": [120.0, 80.5]})
print(df.describe())
`,
    exercises: PANDAS_EXERCISES,
  },
  {
    id: "statistics",
    name: "Statistics Laboratory",
    tagline: "From descriptive stats to hypothesis tests — stdlib statistics plus scipy.stats.",
    engine: "Python 3.12 + SciPy 1.14.1 · WebAssembly",
    packages: ["numpy", "scipy"],
    kind: "python",
    icon: "statistics",
    hue: "var(--dv-viz-2)",
    firstLoadNote: "First run downloads the Python engine plus SciPy (~45 MB total, cached afterwards).",
    scratchStarter: `import numpy as np
from scipy import stats

# The Statistics Laboratory — scratch pad.

sample = np.array([4, 8, 15, 16, 23, 42])
print("mean:", sample.mean(), "std:", round(sample.std(), 3))
print("95% t-interval:", stats.t.interval(0.95, df=len(sample) - 1,
      loc=sample.mean(), scale=stats.sem(sample)))
`,
    exercises: STATS_EXERCISES,
  },
  {
    id: "dataviz",
    name: "Data Visualization Laboratory",
    tagline: "Matplotlib in the browser — every figure you draw renders right in the results panel.",
    engine: "Python 3.12 + matplotlib 3.8.4 · WebAssembly",
    packages: ["matplotlib"],
    kind: "python",
    icon: "dataviz",
    hue: "var(--dv-viz-3)",
    firstLoadNote: "First run downloads the Python engine plus matplotlib (~35 MB total, cached afterwards).",
    scratchStarter: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

# The Visualization Laboratory — figures render in the results panel.

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.plot([1, 2, 3, 4], [1, 4, 9, 16], marker="o")
ax.set_title("Squares")
print("figure ready")
`,
    exercises: DATAVIZ_EXERCISES,
  },
  {
    id: "ml",
    name: "Machine Learning Laboratory",
    tagline: "scikit-learn end to end — regression, clustering, splitting and honest metrics.",
    engine: "Python 3.12 + scikit-learn 1.6.1 · WebAssembly",
    packages: ["numpy", "scipy", "scikit-learn"],
    kind: "python",
    icon: "ml",
    hue: "var(--dv-viz-4)",
    firstLoadNote: "First run downloads the Python engine plus scikit-learn and SciPy (~70 MB total, cached afterwards).",
    scratchStarter: `import numpy as np
from sklearn.linear_model import LinearRegression

# The Machine Learning Laboratory — scratch pad.

X = np.array([[1], [2], [3], [4]])
y = np.array([2, 4, 6, 8])
model = LinearRegression().fit(X, y)
print("slope:", model.coef_[0], "intercept:", model.intercept_)
`,
    exercises: ML_EXERCISES,
  },
];

export function labDiscipline(id: string): LabDisciplineMeta | undefined {
  return LAB_DISCIPLINES.find((d) => d.id === id);
}
