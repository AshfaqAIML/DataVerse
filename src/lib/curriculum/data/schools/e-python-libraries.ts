/**
 * SCHOOL E — PYTHON LIBRARIES (E1–E9)
 *
 * The scientific Python stack as teachable courses: NumPy, pandas, Polars,
 * SciPy, statsmodels, matplotlib, seaborn, plotly and scikit-learn —
 * each from first object to capstone, current APIs only, honest performance
 * guidance, real datasets and real briefs.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolE: SubjectDef[] = [
  {
    slug: "numpy",
    school: "E",
    code: "E1",
    title: "NumPy: Arrays from the Ground Up",
    blurb: "The array library underneath all of data science — what it is, why it is fast, and how to think in axes.",
    difficulty: "intermediate",
    track: "foundation",
    prerequisites: ["python"],
    softPrerequisites: ["descriptive-statistics"],
    objectives: [
      "Create NumPy arrays from lists, files and generator functions",
      "Read and manipulate shape, dtype and axes with confidence",
      "Replace slow Python loops with vectorized operations",
      "Filter and aggregate arrays with boolean masks and axis arguments",
      "Judge when NumPy is — and is not — the right tool",
    ],
    outcomes: [
      "A learner can convert a data task into array operations without a single explicit loop",
      "A learner can predict the shape of an operation's result before running it",
      "A learner can measure and explain a NumPy speedup over pure Python",
    ],
    modules: [
      mod(
        "From Lists to Arrays",
        "What an array is, why it exists, and how to build your own.",
        ["Create arrays from lists and files", "Inspect and control dtype and shape"],
        ["write-code", "predict-output", "concept-check", "debug"],
        [
          ch("Why NumPy Exists", "The problem arrays solve", [
            L("Why NumPy Exists", 35, ["ndarray", "vectorization", "homogeneous"], "What arrays are, why they beat lists for numeric work, and how to make your first one."),
            L("Creating Arrays", 30, ["np.array", "np.arange", "np.zeros"], "From lists, ranges and constant shapes — the constructors you will use daily."),
            L("Array Data Types", 30, ["dtype", "upcasting", "float64"], "Why every element must share a type, and what happens when they don't."),
          ]),
          ch("Array Anatomy", "Shape, dimensions and memory order", [
            L("Shape and Dimensions", 30, ["shape", "ndim", "axis"], "1-D, 2-D, n-D — what shape really encodes."),
            L("Indexing and Slicing Arrays", 35, ["indexing", "slicing", "view"], "Reaching into arrays — and the copy-versus-view trap."),
            L("Reshaping and Stacking", 30, ["reshape", "concatenate", "stack"], "Same data, different shape: reshape, ravel and stack."),
          ]),
        ]
      ),
      mod(
        "Computing with Arrays",
        "Arithmetic without loops: the heart of NumPy.",
        ["Apply elementwise operations and ufuncs", "Aggregate along axes with masks"],
        ["write-code", "predict-output", "dataset-task", "debug"],
        [
          ch("Array Arithmetic", "Math that used to need a for loop", [
            L("Elementwise Operations", 30, ["elementwise", "arithmetic", "vectorization"], "Add, multiply, compare whole arrays in one expression."),
            L("Universal Functions", 30, ["ufunc", "np.sqrt", "np.exp"], "The math functions that map over arrays at C speed."),
            L("Broadcasting", 35, ["broadcasting", "scalar", "shape rule"], "The rule that lets a scalar meet a matrix — and where it bites."),
          ]),
          ch("Aggregation", "Summaries along an axis", [
            L("Summaries: sum, mean, std", 30, ["np.sum", "np.mean", "np.std"], "The descriptive-statistics workhorses, one call each."),
            L("Axis: Computing by Row and Column", 35, ["axis", "keepdims", "reduction"], "axis=0 or axis=1 — the question every NumPy user learns to answer slowly, then instantly."),
            L("Boolean Masks and Filtering", 35, ["mask", "filtering", "np.where"], "Select with conditions instead of loops."),
          ]),
        ]
      ),
      mod(
        "Arrays in Practice",
        "Real datasets, real comparisons, real decisions.",
        ["Load real data into arrays and summarize it", "Decide between lists, arrays and dataframes with reasons"],
        ["dataset-task", "write-code", "case-analysis", "interpret-results"],
        [
          ch("Data In, Insights Out", "From CSV to summary", [
            L("Loading Data into Arrays", 30, ["np.genfromtxt", "delimiter", "missing values"], "Text to arrays: parsing, delimiters and the masked-value problem."),
            L("Case Study: Iris Measurements", 35, ["iris", "sepal", "petal"], "A 150-row botanical classic, summarized in ten lines of NumPy."),
            L("Comparing NumPy to Lists and pandas", 30, ["list", "dataframe", "when to switch"], "The honest comparison: memory, speed, readability and the next tool up."),
          ]),
          ch("Performance", "Why it is fast — and when it is not", [
            L("Why NumPy Is Fast", 30, ["contiguous memory", "vectorized C loop", "cache"], "The three reasons: types, memory layout and one C loop instead of many."),
            L("When NumPy Is Not the Right Tool", 30, ["overhead", "small arrays", "dictionaries"], "Small inputs, object data, growing lists — where arrays lose."),
          ]),
        ]
      ),
      mod(
        "NumPy in the Data Workflow",
        "Randomness, persistence and a capstone.",
        ["Generate reproducible random data", "Save and reload arrays reliably"],
        ["write-code", "dataset-task", "case-analysis", "concept-check"],
        [
          ch("Randomness and Persistence", "Two everyday tools", [
            L("Random Numbers and Simulation", 35, ["np.random", "seed", "simulation"], "Reproducible randomness: seeds, generators and a bootstrap in ten lines."),
            L("Saving and Sharing Arrays", 30, ["np.save", "np.load", "npy"], ".npy files: the fastest way to move numeric data between sessions."),
          ]),
          ch("Capstone", "Everything at once", [
            L("Capstone: Analyzing Sensor Data", 45, ["timeseries", "mask", "rolling window"], "A week of temperature readings: load, clean, filter, summarize, chart."),
            L("Capstone Debrief: Defending the Numbers", 25, ["interpretation", "robustness check", "reporting"], "Review the sensor analysis step by step and practice defending each choice — the habit that turns code into conclusions.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("NumPy Final", 45, 20),
    projects: [
      proj(
        "Array Composer",
        "Build a small utility module: functions that accept arrays, document dtype and shape contracts, and avoid explicit loops. Include a benchmark comparing one function against its pure-Python twin.",
        8,
        "independent",
        ["A module with at least four documented array functions", "A benchmark script with measured timings", "A short written explanation of each speedup"],
        ["No explicit loops in the array logic", "Shape/dtype contracts documented per function", "Benchmark numbers are real, measured and reproducible"],
        ["Python", "NumPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["numpy", "array", "vectorization", "broadcasting", "dtype", "shape"],
  },
  {
    slug: "pandas",
    school: "E",
    code: "E2",
    title: "Pandas: DataFrames from the Ground Up",
    blurb: "The dataframe is where data work happens — build yours from Series up and make selecting, grouping and merging feel like reflexes.",
    difficulty: "intermediate",
    track: "foundation",
    prerequisites: ["numpy"],
    softPrerequisites: [],
    objectives: [
      "Build Series and DataFrames from lists, dicts, arrays and files",
      "Select exactly the rows and columns you mean with loc, iloc and boolean masks",
      "Summarize tables with groupby, sort, rank and value_counts",
      "Join tables with merge and know which rows survive and why",
      "Read messy CSVs, choose a missing-data policy, and keep pipelines readable and fast",
    ],
    outcomes: [
      "A learner can load a real CSV, clean it, and answer a grouped, merged question in one chained pipeline",
      "A learner can predict exactly which rows a loc, iloc or boolean selection returns before running it",
      "A learner can diagnose an object-dtype column and fix it with the dtype that fits memory and speed",
      "A learner can defend a missing-data policy and show it changed no conclusion",
    ],
    modules: [
      mod(
        "Anatomy: Series and DataFrames",
        "The two objects every pandas user lives in — built by hand and inspected honestly.",
        ["Construct Series and DataFrames from Python data", "Inspect an unfamiliar table within a minute of loading it"],
        ["write-code", "predict-output", "concept-check"],
        [
          ch("Series: One Column with an Index", "The atom of pandas — typed values carrying labels", [
            L("The Series: Values Plus an Index", 25, ["Series", "index", "values"], "A Series is a typed column with labels — meet the values and the index separately before combining them."),
            L("Building Series from Lists, Dicts and Arrays", 30, ["pd.Series", "from dict", "Series name"], "Construct a Series four ways — lists, dicts, scalars, arrays — and know when each reads best.", "code"),
          ]),
          ch("The DataFrame, Built and Inspected", "From a dict of columns to head, info, describe — your first minute with any table", [
            L("DataFrames from Scratch", 30, ["pd.DataFrame", "columns", "from records"], "Build small tables from dicts and records and see how a dataframe stores columns.", "code"),
            L("head, info, describe: The First-Minute Trio", 25, ["head", "info", "describe"], "Three calls tell you shape, dtypes, missingness and spread before you touch anything else.", "guided-practice"),
            L("Dtypes and the Object-Dtype Trap", 35, ["object dtype", "category", "string dtype"], "Why one stray string turns a whole column into object — and what that costs in memory and speed.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Selecting on Purpose",
        "Getting exactly the rows and columns you mean — labels, positions, conditions, no accidental brackets.",
        ["Select by label, by position and by condition", "Add, drop and rename columns without chained indexing"],
        ["predict-output", "write-code", "debug"],
        [
          ch("loc vs iloc: The Two Doors", "Label-based and position-based selection, taught as one rule", [
            L("loc: The Door Marked by Label", 30, ["loc", "label indexing", "inclusive slice"], "Select rows and columns by index label — where loc slices include the endpoint.", "code", 3),
            L("iloc: The Door Marked by Number", 30, ["iloc", "position indexing", "half-open slice"], "Select by integer position with Python's usual exclusive-end slicing.", "code", 3),
            L("Slices That Surprise: The Boundary Gotchas", 25, ["slice boundary", "off-by-one", "at and iat"], "Predict what each slice returns before running it — the fastest way to harden your instincts.", "worked-example", 3),
          ]),
          ch("Masks, Filters and New Columns", "Conditions that select rows — and the columns you add afterwards", [
            L("Boolean Masks: Conditions as Coordinates", 30, ["boolean mask", "compound condition", "& and |"], "One condition, several conditions — and why & and | always wear parentheses here.", "code", 3),
            L("isin, between and the query Method", 30, ["isin", "between", "query"], "Membership, ranges and a near-English syntax for long chains of conditions.", "code", 3),
            L("Adding, Dropping and Renaming Columns", 30, ["assign", "drop", "rename"], "Create derived columns with assign and tidy the schema with rename and drop.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Grouping and Combining",
        "Answers live across rows and across tables — split-apply-combine, then joins that lose nothing.",
        ["Aggregate with groupby and name the results", "Join tables and prove no rows were lost or duplicated"],
        ["write-code", "dataset-task", "interpret-results", "debug"],
        [
          ch("groupby: Split, Apply, Combine", "The pattern behind every summary table you will ever build", [
            L("The Mechanics of groupby", 30, ["groupby", "split-apply-combine", "group keys"], "What groupby builds, why nothing runs until you aggregate, and where the group keys end up.", "concept", 3),
            L("agg and transform: Two Ways Out of a Group", 30, ["agg", "named aggregation", "transform"], "Collapse every group to one row — or broadcast group facts back to every row.", "code", 3),
            L("sort_values, rank and value_counts", 25, ["sort_values", "rank", "value_counts"], "The everyday trio that turns any table into ranked, counted, share-of-total summaries.", "code", 3),
          ]),
          ch("Merging: Two Tables, One Answer", "Joins, concatenation, and diagnostics that catch silent row loss", [
            L("merge: how, on, and What Survives", 30, ["merge", "how", "left_on"], "Inner, outer, left and right joins on tables small enough to count every row by hand.", "code", 3),
            L("concat: Stacking Tables End to End", 25, ["concat", "axis", "ignore_index"], "Stack rows or columns while keeping the index honest.", "code"),
            L("validate and indicator: Join Diagnostics", 30, ["validate", "indicator", "row-count reconciliation"], "Two merge arguments that catch duplicated and silently dropped rows before they reach a report.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Real Data, Real Habits",
        "read_csv against reality, a defensible NaN policy, readable chains — and the habits that keep dataframes fast.",
        ["Read messy CSVs into correct dtypes", "Choose and defend a missing-data policy"],
        ["dataset-task", "write-code", "case-analysis", "concept-check"],
        [
          ch("Missing Data and Messy Files", "NaN policy first, then parsing arguments that survive real files", [
            L("Finding and Judging Missing Data", 25, ["isna", "notna", "missingness pattern"], "Count, locate and judge missing values before deciding what to do about them.", "guided-practice", 3),
            L("fillna, dropna and the Policy Behind Them", 30, ["fillna", "dropna", "ffill"], "Fill, drop or interpolate — and what each choice quietly does to your conclusions.", "concept", 3),
            L("read_csv Against Reality", 35, ["read_csv", "na_values", "parse_dates"], "Delimiters, encodings, bad lines, thousand separators — the arguments that fix real files.", "code", 3),
          ]),
          ch("Chains, Copies and Speed", "Readable pipelines, the famous warning decoded, and memory that stays flat", [
            L("Method Chaining: assign, query, sort_values", 30, ["assign", "query", "pipe"], "Compose whole analyses left-to-right without intermediate names.", "code", 3),
            L("The SettingWithCopyWarning, Decoded", 30, ["chained indexing", "SettingWithCopyWarning", "loc assignment"], "Why df[mask][col] = x is a bug and the loc form that fixes it — mechanics, not folklore.", "worked-example", 3),
            L("Dtypes for Memory and Speed", 30, ["category", "int32", "memory_usage"], "object columns are expensive — category, narrower ints and datetime pay for themselves.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Pandas Final", 50, 22),
    projects: [
      proj(
        "The Five-Question Notebook",
        "One notebook, one real dataset, five questions that force a filter, a groupby, a merge, a missing-data decision and a ranked summary — each answered by one readable chained pipeline.",
        6,
        "guided",
        ["A notebook that runs top to bottom on a fresh kernel", "One short prose answer per question backed by computed numbers", "A markdown section defending your missing-data policy"],
        ["Each question is answered with the right tool, not a workaround", "No chained assignment, no silent row loss, no unexplained NaNs", "Pipelines are readable chains rather than ten intermediate names"],
        ["pandas", "jupyter"]
      ),
      proj(
        "The Messy CSV Autopsy",
        "You receive a deliberately broken CSV: thousands separators glued to numbers, dates in three formats, duplicate rows and two half-empty columns. Autopsy it, fix the dtypes, document every decision, and deliver a tidy table plus a three-table summary report.",
        8,
        "independent",
        ["A tidy output CSV with correct dtypes and zero silent row drops", "A decision log: every fix you made and why, one line each", "A report section with three groupby tables and one merge"],
        ["Every dtype fix has a stated reason, not a shrug", "Row counts reconcile between raw, cleaned and reported stages", "The report tables answer stated business questions"],
        ["pandas", "jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["pandas", "dataframe", "groupby", "merge", "loc", "iloc", "missing data"],
  },
  {
    slug: "polars",
    school: "E",
    code: "E3",
    title: "Polars: DataFrames at Speed",
    blurb: "The dataframe engine built for parallel machines — expressions, lazy queries and an optimizer that reads less data than you asked for.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["pandas"],
    softPrerequisites: [],
    objectives: [
      "Explain what Polars changes and why it was built",
      "Write and compose expressions with pl.col instead of row-wise applies",
      "Choose between eager and lazy frames and know what the optimizer does to a lazy plan",
      "Process files larger than RAM with the streaming engine",
      "Move results between Polars, pandas and NumPy without surprises",
    ],
    outcomes: [
      "A learner can translate a pandas pipeline into an equivalent expression-based Polars query",
      "A learner can read an explain() plan and state which optimizations the optimizer applied",
      "A learner can decide, with reasons, when Polars is the better tool and when it is not",
    ],
    modules: [
      mod(
        "Why Polars, and the Expression Habit",
        "The case for a new dataframe engine — and the expression API that makes it tick.",
        ["Say what Polars optimizes for and why", "Write and compose expressions with pl.col"],
        ["concept-check", "predict-output", "write-code"],
        [
          ch("The Case for Polars", "Multithreading, Arrow memory and the end of the index", [
            L("Why Polars Exists", 30, ["multithreading", "Apache Arrow", "GIL"], "One core or twenty — Polars was designed for the machines pandas grew beyond.", "concept"),
            L("No Index, No Surprises", 25, ["index", "join keys", "explicit alignment"], "Polars drops pandas' index; every join and alignment happens on named columns, explicitly.", "concept"),
            L("DataFrames and Series in Eager Mode", 30, ["pl.DataFrame", "pl.Series", "read_csv"], "Your first frames: build, inspect and read a CSV eagerly, exactly as you would in pandas.", "code"),
          ]),
          ch("The Expression API", "pl.col is the atom of every Polars query", [
            L("pl.col: The Atom of Polars", 30, ["pl.col", "expression", "context"], "Expressions describe transformations; contexts like select and with_columns decide how they run.", "concept", 3),
            L("Composing Expressions", 30, ["alias", "expression arithmetic", "cast"], "Arithmetic, casts, string methods and aliases — all without leaving the expression world.", "code", 3),
            L("when, then, otherwise", 30, ["pl.when", "conditional expression", "otherwise"], "Conditional logic as one expression instead of a row-by-row apply.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Eager, Lazy and the Optimizer",
        "Two execution modes, one optimizer — and why lazy wins whenever the data is real.",
        ["Choose eager or lazy with reasons", "Read an optimized plan and explain what changed"],
        ["write-code", "predict-output", "concept-check", "interpret-results"],
        [
          ch("Eager First", "DataFrames you can poke at — filter, select, with_columns", [
            L("filter, select and with_columns", 30, ["filter", "select", "with_columns"], "The three verbs of eager Polars and the distinct question each one answers.", "code", 3),
            L("group_by and join, Eagerly", 30, ["group_by", "agg", "join"], "Split-apply-combine and joins with the same expression habits you already have.", "code", 3),
          ]),
          ch("The Lazy Path", "scan_csv, collect and the optimizer's plan", [
            L("scan_csv: Your Data, Unread Until Needed", 30, ["scan_csv", "LazyFrame", "collect"], "LazyFrames defer work; nothing touches disk until collect() says go.", "concept", 3),
            L("explain: Reading the Optimized Plan", 30, ["explain", "logical plan", "optimization"], "The plan is a sentence — learn to read it and watch the optimizer rewrite it.", "guided-practice", 3),
            L("Pushdown: Read Only What You Need", 30, ["predicate pushdown", "projection pushdown", "I/O reduction"], "Filters pushed into the scan and columns never read — the two optimizations that matter most.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Scale, Interop and Judgment",
        "Bigger-than-RAM data, round trips to pandas and NumPy, and an honest polars-versus-pandas verdict.",
        ["Process files larger than RAM with the streaming engine", "Argue honestly when Polars beats pandas and when it does not"],
        ["dataset-task", "case-analysis", "interpret-results", "write-code"],
        [
          ch("Bigger than RAM", "Streaming scans and aggregates on files that do not fit in memory", [
            L("Streaming Through Large Files", 30, ["streaming engine", "scan_csv", "memory budget"], "When a 40 GB file meets an 8 GB laptop: the engine that processes in chunks instead of loading.", "concept", 3),
            L("Case Study: A Log File Too Big to Load", 40, ["scan_csv", "filter pushdown", "group_by"], "One month of logs, one aggregate question, and a plan you can explain line by line.", "worked-example", 3),
          ]),
          ch("Interop and the Honest Comparison", "Round-tripping to pandas and NumPy, and choosing your engine with reasons", [
            L("to_pandas, from_pandas, to_numpy", 25, ["to_pandas", "pl.from_pandas", "to_numpy"], "Bridges to the rest of the ecosystem — what converts cleanly and what to watch at the boundary.", "code"),
            L("Polars versus pandas, Honestly", 30, ["ecosystem", "parallelism", "familiarity"], "Speed, memory, ecosystem, hiring and habits — the trade-offs stated without tribalism.", "reading", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Polars Final", 50, 20),
    projects: [
      proj(
        "One Query, Two Engines",
        "Take one real tabular dataset, implement the identical cleaning-plus-groupby-plus-merge question in pandas and in lazy Polars, measure wall time and memory on your own machine, and defend which engine you would use for this workload — with your numbers, not internet benchmarks.",
        8,
        "independent",
        [
          "A notebook implementing the identical question in both libraries",
          "Measured wall-time and memory numbers for both engines on your machine",
          "A written verdict arguing which engine fits this workload and why",
        ],
        [
          "Both implementations produce identical results for the same question",
          "The lazy query uses scan_csv and its explain() plan is shown and annotated",
          "The verdict cites your measurements and includes one caveat about your hardware",
        ],
        ["polars", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["polars", "expressions", "lazyframe", "pushdown", "streaming", "arrow"],
  },
  {
    slug: "scipy",
    school: "E",
    code: "E4",
    title: "SciPy: The Scientific Toolbox",
    blurb: "The toolbox that picks up where NumPy stops — distributions, tests, optimizers, interpolation and signals, each when you actually need them.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["numpy"],
    softPrerequisites: ["descriptive-statistics", "probability-distributions"],
    objectives: [
      "Navigate the scipy subpackages and pick the right one for a task",
      "Answer probability questions with scipy.stats distributions",
      "Run classic hypothesis tests and interpret their results without overclaiming",
      "Fit curves to data and minimize functions with scipy.optimize",
      "Interpolate values and smooth signals with scipy.interpolate and scipy.signal",
      "Explain what scipy.sparse stores and when sparse earns its keep",
    ],
    outcomes: [
      "A learner can choose between pdf, cdf and ppf to answer a stated probability question",
      "A learner can run a t-test or chi-square test and state exactly what the p-value licenses",
      "A learner can fit a parametric curve with curve_fit and report parameter uncertainty from pcov",
      "A learner can smooth a noisy signal and detect its peaks in a few lines",
    ],
    modules: [
      mod(
        "The Lay of the Land",
        "How scipy is organized, and the distributions subpackage you will reach for most.",
        ["Navigate the subpackages by name and purpose", "Answer probability questions with a frozen distribution"],
        ["concept-check", "calculation", "write-code"],
        [
          ch("One Library, Many Toolboxes", "The subpackage map and the numpy division of labor", [
            L("How scipy Is Organized", 25, ["subpackages", "stats", "optimize"], "cluster, integrate, interpolate, optimize, signal, sparse, stats — one sentence each, before you import anything.", "concept"),
            L("SciPy and NumPy: The Division of Labor", 25, ["numpy arrays", "algorithms", "specialization"], "SciPy is NumPy arrays plus algorithms — what stays in NumPy and what graduates to scipy.", "concept"),
          ]),
          ch("scipy.stats: Distributions as Objects", "Frozen distributions and the pdf–cdf–ppf triangle", [
            L("Continuous Distributions: pdf, cdf, ppf", 35, ["norm", "pdf", "cdf"], "Heights, areas and inverse areas — the three questions every distribution can answer.", "code", 3),
            L("Sampling: rvs and random_state", 25, ["rvs", "random_state", "reproducibility"], "Draw from a distribution with a seed you can defend — scipy's modern seeding interface.", "code"),
            L("describe and the Shape of a Sample", 25, ["describe", "skewness", "kurtosis"], "Moments and shape statistics in one call — the fastest honest summary of a sample.", "code", 2),
          ]),
        ]
      ),
      mod(
        "Testing Hypotheses",
        "The classic tests in scipy.stats — run them, then interpret them without overclaiming.",
        ["Run t-tests, chi-square and rank-based tests correctly", "Choose a test by data type and question, not habit"],
        ["write-code", "interpret-results", "concept-check", "case-analysis"],
        [
          ch("The Classic Tests", "t-tests for means, chi-square for tables, ranks for awkward distributions", [
            L("t-tests: One Sample, Two Samples, Paired", 35, ["ttest_1samp", "ttest_ind", "ttest_rel"], "A mean against a claim, two groups, or the same units twice — and what the p-value licenses.", "code", 3),
            L("Chi-Square for Categorical Tables", 30, ["chi2_contingency", "contingency table", "expected counts"], "Do these two categorical variables talk to each other? The test behind every A/B crosstab.", "code", 3),
            L("When Distributions Misbehave: Rank Tests", 30, ["mannwhitneyu", "wilcoxon", "normality assumption"], "Skewed or ordinal data — the nonparametric escape hatch that drops the normality assumption.", "concept", 3),
          ]),
          ch("Correlation and Test Choice", "Association between variables, then a repeatable procedure for choosing tests", [
            L("pearsonr and spearmanr", 30, ["pearsonr", "spearmanr", "correlation"], "Straight-line and monotone association — each returning a coefficient and a p-value.", "code", 3),
            L("Choosing the Right Test: A Field Guide", 25, ["test selection", "assumptions", "decision procedure"], "Data type, sample size, distribution, question — a four-step procedure you can defend.", "reading", 2),
          ]),
        ]
      ),
      mod(
        "Optimization and Fitting",
        "scipy.optimize and scipy.interpolate — turning 'find the best' and 'fill the gap' into function calls.",
        ["Minimize an objective and fit a parametric curve", "Interpolate between points and know when to fit instead"],
        ["write-code", "dataset-task", "interpret-results", "debug"],
        [
          ch("scipy.optimize", "minimize for objectives, curve_fit for data", [
            L("minimize: The General Optimizer", 35, ["minimize", "objective function", "starting point"], "Hand scipy any function of a vector and it walks downhill — method and starting point are yours to choose.", "concept", 3),
            L("curve_fit: Fitting Models to Data", 35, ["curve_fit", "popt", "pcov"], "Fit an exponential or any parametric curve, read the covariance, and report uncertainty honestly.", "code", 3),
          ]),
          ch("scipy.interpolate", "Curves between known points — and the honest limits of interpolation", [
            L("Splines: make_interp_spline", 30, ["make_interp_spline", "interpolation", "np.interp"], "Smooth curves through every point — and why np.interp still wins for the simple jobs.", "code", 3),
            L("Interpolation versus Fitting", 25, ["interpolation", "fitting", "noise"], "Interpolants pass through every point, noise included; fits do not — when each is the honest choice.", "concept", 2),
          ]),
        ]
      ),
      mod(
        "Signals, Sparse Data and Judgment",
        "An intro to scipy.signal, the idea of sparse storage, and the habit of reaching for the right toolbox.",
        ["Smooth a noisy series and detect its peaks", "Decide when sparse matrices and scipy are the right tools"],
        ["write-code", "concept-check", "case-analysis", "interpret-results"],
        [
          ch("scipy.signal, Gently", "Smoothing, peaks and windows on real sensor-like data", [
            L("Smoothing: savgol_filter", 30, ["savgol_filter", "window length", "polynomial order"], "Keep the shape, lose the noise — the filter that fits local polynomials instead of blurring.", "code", 3),
            L("find_peaks: Detecting Events", 30, ["find_peaks", "prominence", "distance"], "Heartbeats in an ECG, spikes in a log — turn a wiggly line into a list of events.", "code", 3),
          ]),
          ch("Sparse and the Bigger Picture", "Mostly-zero data, and choosing tools like a scientist", [
            L("scipy.sparse: Storing the Mostly-Nothing", 30, ["csr_matrix", "sparsity", "dense vs sparse"], "A million-by-thousand matrix that is 99% zeros — store what exists, skip what does not.", "concept", 3),
            L("The Toolbox Habit: A Review", 25, ["subpackage selection", "workflow", "review"], "One workflow, five candidate subpackages — choosing becomes a reflex when you rehearse it.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("SciPy Final", 50, 20),
    projects: [
      proj(
        "Fit and Forecast a Cooling Curve",
        "You are handed noisy temperature readings of a cooling object. Derive the model, fit it with curve_fit, report the fitted parameters with confidence intervals from pcov, and state — with numbers — how confident you are in the asymptote.",
        4,
        "guided",
        [
          "A notebook fitting an exponential-decay model to the readings",
          "Parameter estimates with standard errors derived from pcov",
          "A plot showing data, fitted curve and residuals",
        ],
        [
          "The model function is written down and explained before fitting",
          "Uncertainty is reported, not hidden — pcov is actually used",
          "Residuals are plotted and discussed: is the model adequate?",
        ],
        ["scipy", "numpy", "matplotlib"]
      ),
      proj(
        "The Test Selection Gauntlet",
        "Six mini-datasets, six questions: means, medians, tables, correlations, distributions. For each, choose a scipy.stats tool, justify the choice in two sentences, run it, and interpret the result correctly.",
        6,
        "independent",
        [
          "One section per dataset: question, test choice, justification, code, interpretation",
          "At least three different tests used across the six questions",
          "A closing table mapping each question to the test chosen and why",
        ],
        [
          "Every choice names the assumption it depends on",
          "Interpretations say what the p-value does and does not license",
          "No test is used on data that visibly violates its assumptions",
        ],
        ["scipy", "numpy"]
      ),
    ],
    placementEligible: true,
    keywords: ["scipy", "distributions", "hypothesis test", "curve fitting", "interpolation", "signal", "sparse"],
  },
  {
    slug: "statsmodels",
    school: "E",
    code: "E5",
    title: "Statsmodels: Statistics in Python",
    blurb: "Statistics with actual coefficients — regression, GLMs and time series, with summary tables you learn to read like a statistician.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["pandas", "hypothesis-testing"],
    softPrerequisites: ["regression"],
    objectives: [
      "Fit models through the formula API and the array API interchangeably",
      "Read an OLS summary table and extract every number that matters",
      "Diagnose model assumptions with residual plots and formal tests",
      "Extend regression to binary outcomes through the GLM framework",
      "Fit and forecast basic AR and ARIMA time series",
    ],
    outcomes: [
      "A learner can fit an OLS model and explain each coefficient with its confidence interval",
      "A learner can diagnose heteroskedasticity and non-normal residuals and name the consequence for inference",
      "A learner can fit a logistic regression and interpret coefficients as log-odds and odds ratios",
      "A learner can fit an ARIMA model, forecast with it, and check whether its residuals are white noise",
    ],
    modules: [
      mod(
        "The Formula API and First OLS",
        "y ~ x — the formula language, and your first ordinary least squares fit.",
        ["Write model specs in the formula language", "Fit OLS and locate every headline number in the summary"],
        ["write-code", "interpret-results", "concept-check"],
        [
          ch("Formulas First", "The R-style formula language meets pandas DataFrames", [
            L("y ~ x: The Formula Language", 30, ["formula", "patsy", "design matrix"], "How a string becomes a design matrix — intercepts, main effects and the '- 1' escape.", "concept", 3),
            L("smf versus sm: Two Ways to Fit", 30, ["statsmodels.formula.api", "add_constant", "OLS"], "The formula front door and the NumPy-array back door — the same model through different plumbing.", "code", 3),
          ]),
          ch("Your First Regression", "Fit, predict, and read the summary table top to bottom", [
            L("Fitting OLS and Calling .summary()", 35, ["OLS", "fit", "summary table"], "One fit, one summary — a guided tour of every line from R-squared down to the confidence intervals.", "guided-practice", 3),
            L("Coefficients, t-Values and p-Values", 30, ["params", "tvalues", "pvalues"], "What each coefficient means in plain words, and what its t-test is really asking.", "code", 3),
            L("R², Adjusted R² and Their Limits", 25, ["rsquared", "adjusted R-squared", "model comparison"], "How much variation the model explained — and why the adjusted number punishes padding.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Interrogating the Fit",
        "Assumptions checked, not assumed — residuals, influence and the formal diagnostics.",
        ["Inspect residuals graphically and formally", "Spot the violations that change your conclusions"],
        ["interpret-results", "write-code", "debug", "case-analysis"],
        [
          ch("Residuals Tell the Story", "The plots every regression owes you", [
            L("Residuals and Fitted Values", 30, ["resid", "fittedvalues", "linearity check"], "What is left over after the fit — and the patterns that betray a misspecified model.", "code", 3),
            L("QQ Plots and Normality", 25, ["qqplot", "normality of errors", "heavy tails"], "Are the errors normal enough? A plot you will read for the rest of your career.", "guided-practice", 3),
            L("Outliers and Leverage", 30, ["get_influence", "leverage", "Cook's distance idea"], "One wild point can steer the whole fit — find it, measure it, and decide honestly what to do.", "code", 3),
          ]),
          ch("Formal Diagnostics", "Named tests for the assumptions your eyes suspect", [
            L("Heteroskedasticity and het_breuschpagan", 30, ["heteroskedasticity", "het_breuschpagan", "robust standard errors"], "Funnel-shaped residuals meet the test that confirms them — and the fix: robust standard errors.", "code", 3),
            L("Correlated Errors: Durbin-Watson", 25, ["Durbin-Watson", "autocorrelation", "time order"], "When errors inherit time, standard errors mislead — the first symptom of a time series problem.", "concept", 2),
          ]),
        ]
      ),
      mod(
        "Beyond the Straight Line",
        "Binary outcomes through GLM and logistic regression, plus your first ARIMA.",
        ["Fit logistic regressions and interpret odds ratios", "Fit AR and ARIMA models and forecast honestly"],
        ["write-code", "interpret-results", "dataset-task", "debug"],
        [
          ch("GLM and Logistic Regression", "One framework, many families — and binary outcomes done right", [
            L("The GLM Idea: Family plus Link", 30, ["GLM", "family", "link function"], "Normal with identity link, binomial with logit — one framework that covers half of applied statistics.", "concept", 3),
            L("Logistic Regression with smf.logit", 35, ["logit", "predict", "log-odds"], "Fit it, predict probabilities, and read coefficients as log-odds without flinching.", "code", 3),
            L("Odds Ratios and Confidence Intervals", 30, ["odds ratio", "exp(params)", "conf_int"], "exp(β) is the odds ratio — the interpretation your stakeholders actually want.", "worked-example", 3),
          ]),
          ch("Time Series Essentials", "AR to ARIMA with statsmodels' current API", [
            L("AutoReg: Regressing on Yesterday", 30, ["AutoReg", "autocorrelation", "lag order"], "Today's value as a function of the last p days — the gateway to every time series model.", "code", 3),
            L("ARIMA and the order=(p, d, q) Triple", 35, ["ARIMA", "differencing", "order"], "Autoregression, differencing and moving averages in one model — what each letter buys you.", "code", 3),
            L("Forecasting and Auditing the Residuals", 30, ["forecast", "prediction interval", "Ljung-Box idea"], "Forecast into the future, then hold the model to account — the residual checks that decide whether to trust it.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Statistics in Practice",
        "Tests through statsmodels, a case study end to end, and the review that makes it stick.",
        ["Run and read the library's statistical tests", "Deliver a full modeling write-up from spec to defense"],
        ["case-analysis", "interpret-results", "dataset-task", "concept-check"],
        [
          ch("Tests and Model Comparison", "Proportions and the formal comparison of nested regressions", [
            L("Proportions and z-Tests", 30, ["proportions_ztest", "success counts", "z-test"], "Did the new version really move the conversion rate? A one-liner with a careful setup.", "code", 3),
            L("Comparing Nested Models with anova_lm", 30, ["anova_lm", "nested models", "F-test"], "Does the extra variable earn its keep? The formal comparison of two regressions.", "code", 3),
          ]),
          ch("The Full Workflow", "One dataset, spec to defense", [
            L("Case Study: From Spec to Defended Conclusion", 40, ["case study", "model spec", "write-up"], "One small dataset from first scatterplot to defended conclusion — the whole workflow in one sitting.", "worked-example", 3),
            L("The Modeling Checklist", 25, ["specification", "diagnostics", "communication"], "Spec, fit, diagnose, interpret, defend — five moves, drilled until they are reflexes.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Statsmodels Final", 55, 22),
    projects: [
      proj(
        "The Summary Table, Annotated",
        "Fit one OLS model on a real dataset, print its full summary, and annotate every single number in the table — what it measures, whether it is good news here, and why.",
        4,
        "guided",
        [
          "An annotated summary covering at least 12 distinct numbers",
          "A one-paragraph verdict on the model's assumptions using at least two named diagnostics",
          "The exact code that reproduces the fit",
        ],
        [
          "Every annotation states what the number measures, not just good or bad",
          "Diagnostics are named and their actual results cited",
          "The verdict separates statistical significance from practical importance",
        ],
        ["statsmodels", "pandas"]
      ),
      proj(
        "Forecast a Real Series",
        "Pick a real monthly or quarterly series — energy, weather, economics — fit ARIMA and AutoReg candidates, forecast the next eight periods, and defend your chosen model with residual diagnostics and honest prediction intervals.",
        10,
        "independent",
        [
          "A notebook with at least two candidate models fitted and compared",
          "A forecast plot with prediction intervals for the next eight periods",
          "A written defense citing residual checks and accuracy on a held-out window",
        ],
        [
          "Model choice justified by diagnostics, not just fit statistics",
          "Forecasts evaluated on data the model never saw",
          "Prediction intervals are shown and interpreted, not swept aside",
        ],
        ["statsmodels", "pandas", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["statsmodels", "ols", "glm", "logistic regression", "arima", "summary table", "diagnostics"],
  },
  {
    slug: "matplotlib",
    school: "E",
    code: "E6",
    title: "Matplotlib: Plots You Can Control",
    blurb: "Every chart you have ever admired in Python starts here — take command of figures, axes and every last label.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["numpy"],
    softPrerequisites: ["visualization-principles"],
    objectives: [
      "Explain the Figure-Axes-Artist hierarchy and navigate it in code",
      "Plot lines, scatters, bars and histograms with the object-oriented interface",
      "Label, annotate and style charts so they read at a glance",
      "Arrange multi-panel figures with subplots and layout engines",
      "Save publication-quality files and make styling reproducible with rcParams",
      "Use colormaps and colorbars deliberately instead of by accident",
    ],
    outcomes: [
      "A learner can build any standard chart from scratch on an Axes without copying boilerplate",
      "A learner can arrange multiple panels with subplots and make every label, legend and tick deliberate",
      "A learner can export a figure at publication quality and defend each export setting",
    ],
    modules: [
      mod(
        "Figure, Axes, Artist",
        "The anatomy of every plot — the object hierarchy that makes matplotlib click.",
        ["Create figures and axes deliberately", "Choose the object-oriented interface and explain why"],
        ["write-code", "predict-output", "concept-check"],
        [
          ch("The Two Interfaces", "pyplot's state machine versus the object-oriented way", [
            L("Figure, Axes, Artist: The Hierarchy", 30, ["Figure", "Axes", "Artist"], "The canvas, the panel, the ink — matplotlib is three objects deep, and this map makes everything navigable.", "concept"),
            L("pyplot versus Object-Oriented", 25, ["pyplot", "state machine", "OO interface"], "The quick plt.plot() habit and the ax.plot() discipline — what each costs you as figures grow.", "reading", 2),
            L("fig, ax = plt.subplots(): The Canonical Start", 30, ["subplots", "ax", "object-oriented interface"], "The one line every matplotlib script should begin with — and what it hands back to you.", "code", 3),
          ]),
          ch("First Charts on Axes", "The four fundamental chart calls, one panel at a time", [
            L("Line Charts with ax.plot", 30, ["plot", "linestyle", "marker"], "Trends along an axis — markers, line styles, and when a line chart misleads.", "code", 3),
            L("Scatter Plots with ax.scatter", 30, ["scatter", "marker size", "color channel"], "Points with size and color channels — the honest way to show raw observations.", "code", 3),
            L("Bars and Histograms: bar versus hist", 35, ["bar", "hist", "bins"], "Counts by category versus the distribution of a variable — two charts that beginners swap.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Labels, Legends and Looks",
        "The grammar of a readable chart: titles, ticks, legends, and styling you can trust.",
        ["Label and annotate charts completely", "Apply styles and themes without pixel-fiddling"],
        ["write-code", "concept-check", "design-review"],
        [
          ch("Making It Readable", "Titles, axis labels, tick formatting and legends that earn their space", [
            L("set_title, set_xlabel, set_ylabel", 25, ["set_title", "set_xlabel", "font size"], "Three methods, ninety percent of chart readability — plus the font sizes that survive projection.", "code", 3),
            L("Legends Done Right", 30, ["legend", "label", "loc"], "label= feeds legend(); loc, frame and order decide whether it helps or hides your data.", "code", 3),
            L("Annotations and Callouts", 30, ["annotate", "arrow", "text"], "Point at the spike, label the kink — annotations turn a chart into an argument.", "code", 3),
          ]),
          ch("Styling Without Tears", "rcParams, style sheets and restrained defaults", [
            L("rcParams: Your Session's Defaults", 30, ["rcParams", "figure.figsize", "font.size"], "Set it once per session — figure size, fonts, dpi — instead of repeating yourself in every cell.", "code", 3),
            L("Colors, Colormaps and Colorbars", 35, ["colormap", "colorbar", "viridis"], "Sequential, diverging, qualitative — pick colormaps for the data, add colorbars for scales.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Composition",
        "One figure, many panels — subplots, shared axes and layouts that don't collide.",
        ["Arrange grids of panels with subplots", "Control layout so nothing overlaps or clips"],
        ["write-code", "predict-output", "debug"],
        [
          ch("Subplots and Layout", "Grids of axes, shared labels, and the layout engines", [
            L("subplots: Rows, Columns, sharex, sharey", 30, ["subplots", "sharex", "axes array"], "Build the grid once and index it cleanly — and when sharex makes eight panels read as one story.", "code", 3),
            L("tight_layout and constrained_layout", 25, ["tight_layout", "constrained_layout", "clipping"], "Why your y-labels get cut off — and the layout engines that fix it before you export.", "code", 2),
          ]),
          ch("Axes Beyond the Defaults", "Log scales and datetime axes for real-world data", [
            L("Log Scales and symlog", 25, ["log scale", "semilogx", "symlog"], "Orders of magnitude demand logs — and symlog for the zero sitting in your data.", "code", 2),
            L("Datetime Axes", 25, ["datetime axis", "date formatter", "AutoDateLocator"], "Plot a year of readings without unreadable ticks — locators and formatters for time.", "code", 2),
          ]),
        ]
      ),
      mod(
        "Publication and Practice",
        "Charts that leave the notebook: files at the right size, and a case study that strings it all together.",
        ["Export figures at publication quality", "Plan a multi-panel figure from a blank page"],
        ["dataset-task", "write-code", "case-analysis", "design-review"],
        [
          ch("Saving and Sharing", "savefig, dpi and vector formats — files that survive print", [
            L("savefig: dpi, Formats and bbox_inches", 30, ["savefig", "dpi", "bbox_inches"], "PNG for slides, PDF and SVG for print — resolution and cropping chosen deliberately.", "code", 3),
            L("Sizing Charts for Their Destination", 25, ["figsize", "dpi", "aspect"], "A chart for a tweet and a chart for a paper have different figsize — design backwards from the destination.", "concept", 2),
          ]),
          ch("The Full Arc", "From data to defended figure — the workflow, end to end", [
            L("Case Study: One Dataset, Four Charts", 40, ["case study", "figure planning", "panel design"], "Take a real dataset from blank page to a four-panel figure, deciding every element on purpose.", "worked-example", 3),
            L("The Figure Review Checklist", 25, ["review", "data-ink", "colorblind safety"], "Titles, labels, contrast, colorblind safety — the checklist you run before anyone else sees your chart.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Matplotlib Final", 45, 20),
    projects: [
      proj(
        "Four Panels, One Story",
        "Build a single publication-ready figure with at least four panels — line, scatter, bar or histogram — that tell one story about a real dataset of your choice, every element decided on purpose.",
        5,
        "guided",
        [
          "One saved PDF or PNG at 300 dpi with four labeled panels",
          "A half-page design memo defending each styling choice",
          "Reproducible script or notebook cells",
        ],
        [
          "Every axis labeled with units; a legend only where it helps",
          "No clipped or overlapping elements anywhere in the figure",
          "The four panels read as one narrative, not four accidents",
        ],
        ["matplotlib", "numpy", "pandas"]
      ),
      proj(
        "Anscombe, Rebuilt from Scratch",
        "Recreate Anscombe's quartet as a 2x2 figure: four datasets with near-identical summary statistics but visibly different shapes — plus a one-paragraph lesson on why fitting without looking is dangerous.",
        3,
        "guided",
        [
          "A 2x2 figure showing each dataset's points and its fitted line",
          "Printed summary statistics demonstrating how closely the four sets match",
          "A short write-up on what the figure teaches about regression",
        ],
        [
          "Fitted line and raw points are both visible in every panel",
          "Matching statistics are demonstrated by computation, not asserted",
          "Axis ranges are comparable across panels so the shapes stay honest",
        ],
        ["matplotlib", "numpy"]
      ),
    ],
    placementEligible: true,
    keywords: ["matplotlib", "figure", "axes", "subplot", "legend", "rcparams", "colormap", "savefig"],
  },
  {
    slug: "seaborn",
    school: "E",
    code: "E7",
    title: "Seaborn: Statistical Plots, Fast",
    blurb: "Statistical charts in one line — seaborn's grammar of relationships, distributions and categories on top of matplotlib.",
    difficulty: "beginner",
    track: "core",
    prerequisites: ["matplotlib"],
    softPrerequisites: ["statistical-charts"],
    objectives: [
      "Map DataFrame columns to visual channels with hue, size and style",
      "Choose between the relational, distribution and categorical plot families",
      "Facet comparisons across panels with figure-level functions",
      "Add built-in statistical aggregation and regression fits to plots",
      "Theme charts consistently and drop back to matplotlib when defaults end",
    ],
    outcomes: [
      "A learner can pick the right seaborn family for a question and justify the choice",
      "A learner can facet a chart by one or two variables and style it with themes and palettes",
      "A learner can explain the bootstrapped confidence bars seaborn draws and adjust them",
    ],
    modules: [
      mod(
        "Seaborn's Grammar",
        "One import, one theme, one way of thinking: columns become visual channels.",
        ["Pass a DataFrame and map columns to channels", "Distinguish axes-level from figure-level functions"],
        ["write-code", "predict-output", "concept-check"],
        [
          ch("First Contact", "DataFrames in, statistically informed plots out", [
            L("scatterplot and lineplot: Relational Basics", 30, ["scatterplot", "lineplot", "aggregation"], "Your first two calls — and the default aggregation hiding inside lineplot.", "code", 3),
            L("hue, size, style: Three More Channels", 30, ["hue", "style", "visual channels"], "Color, marker, size — encode more variables in the same scatter without more code.", "code", 3),
            L("Axes-Level versus Figure-Level", 30, ["axes-level", "figure-level", "FacetGrid"], "scatterplot returns an Axes; relplot returns a FacetGrid — knowing which you hold changes everything downstream.", "concept", 3),
          ]),
          ch("The Three Families", "Relational, distribution and categorical — the whole map", [
            L("Distributions: histplot, kdeplot, ecdfplot", 30, ["histplot", "kdeplot", "ecdf"], "Histograms, smooth densities and empirical CDFs — three views of how a variable is spread.", "code", 3),
            L("Categorical: stripplot, boxplot, violinplot", 30, ["boxplot", "violinplot", "stripplot"], "Comparing groups — raw dots, boxes and violins, with the honesty trade-offs of each.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Faceting and Aggregation",
        "Small multiples and built-in statistics — the two features that make seaborn feel unfair.",
        ["Facet comparisons across columns and rows", "Read and adjust built-in aggregation and error bars"],
        ["write-code", "interpret-results", "dataset-task"],
        [
          ch("Faceting: One Chart, Many Panels", "col, row, displot and catplot — small multiples by argument", [
            L("Faceting with col and row", 30, ["facet", "col", "col_wrap"], "One argument splits your plot into a grid of panels — the cleanest comparison tool in Python.", "code", 3),
            L("displot and catplot: The Figure-Level Doors", 30, ["displot", "catplot", "kind"], "One function, many kinds — the figure-level family that keeps faceting orthogonal to chart type.", "code", 3),
          ]),
          ch("Statistical Aggregation, Built In", "Means, bootstraps and regression bands without manual computation", [
            L("barplot's Hidden Statistics and Error Bars", 30, ["barplot", "estimator", "errorbar"], "Heights are aggregates and the whiskers are uncertainty — what seaborn computed before you asked.", "code", 3),
            L("regplot and lmplot: Regression On Sight", 30, ["regplot", "lmplot", "confidence band"], "Scatter plus fitted line plus confidence band — the statistics drawn, not just computed.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Matrices, Themes and the Boundary",
        "Pairplots, heatmaps, themes and palettes — and the line where seaborn hands you back to matplotlib.",
        ["Explore a whole dataframe with pairplot and heatmap", "Theme charts consistently and customize beyond the defaults"],
        ["write-code", "dataset-task", "design-review", "concept-check"],
        [
          ch("All the Variables at Once", "Pairwise grids and correlation matrices", [
            L("pairplot: The First-Look Matrix", 30, ["pairplot", "pairwise", "corner"], "Every numeric variable against every other — the five-minute tour of any new dataset.", "code", 3),
            L("heatmap and clustermap", 30, ["heatmap", "annot", "clustermap"], "Correlations and confusion matrices with values printed in the cells — plus clustering when order matters.", "code", 3),
          ]),
          ch("Themes, Palettes and the Boundary", "set_theme, deliberate palettes, and dropping down to matplotlib", [
            L("set_theme and the Context Knob", 25, ["set_theme", "style", "context"], "One call to a coherent look — plus the context preset that scales everything for talks or papers.", "code", 2),
            L("Choosing Palettes by Data Type", 30, ["color_palette", "qualitative", "sequential"], "Categorical hues that survive colorblindness, sequential ramps for magnitudes — chosen by data type.", "code", 3),
            L("When to Drop to Matplotlib", 25, ["axes-level return", "customization boundary", "two-library workflow"], "Every seaborn chart is a matplotlib chart — reach for ax methods the moment defaults stop fitting.", "concept", 2),
          ]),
        ]
      ),
      mod(
        "Real Datasets, Real Judgment",
        "Exploratory workflows on real data — from first pairplot to a presentation-ready figure.",
        ["Run a repeatable EDA plotting sequence", "Choose chart types by question and audience"],
        ["dataset-task", "case-analysis", "interpret-results", "design-review"],
        [
          ch("The EDA Sequence", "A plotting routine you can run on any new dataset", [
            L("A First-Look Routine for Any Dataset", 30, ["EDA routine", "pairplot", "grouped views"], "Distributions, relationships, groups — the three-plot sequence you run before you trust a dataset.", "guided-practice", 3),
            L("Comparing Chart Families on One Question", 30, ["chart choice", "bar vs box vs violin", "audience"], "Ask one question three ways — then argue which chart answers it with the least ink and the least lying.", "worked-example", 3),
          ]),
          ch("Capstone", "Everything at once — and a defense of every choice", [
            L("Capstone: One Dataset, Explained in Charts", 40, ["case study", "facet", "regression"], "Take a real dataset from raw CSV to five charts answering five questions — seaborn first, matplotlib polish last.", "worked-example", 3),
            L("Capstone Debrief: Defending Every Choice", 25, ["chart defense", "design review", "checklist"], "Walk your figure and defend each choice — the review habit that separates analysts from chart-makers.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Seaborn Final", 40, 18),
    projects: [
      proj(
        "The EDA Gallery",
        "Pick a real dataset with at least one categorical and two numeric columns and produce an eight-chart exploratory gallery — relational, distribution, categorical and faceted — each chart answering a question you state in advance.",
        5,
        "guided",
        [
          "A notebook with eight charts, each preceded by its question in markdown",
          "At least one faceted figure and one chart showing bootstrapped error bars",
          "A closing summary of three findings the gallery made obvious",
        ],
        [
          "Every chart answers a stated question, not a template",
          "Channel choices (hue, size, style) match the variable types",
          "Themes and palettes are consistent across all eight charts",
        ],
        ["seaborn", "pandas", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["seaborn", "faceting", "hue", "distribution plots", "categorical plots", "pairplot", "heatmap"],
  },
  {
    slug: "plotly",
    school: "E",
    code: "E8",
    title: "Plotly: Interactive Visualization",
    blurb: "Charts that answer back — hover, zoom, facet and animate with plotly.express, then ship them as self-contained HTML.",
    difficulty: "intermediate",
    track: "specialization",
    prerequisites: ["matplotlib"],
    softPrerequisites: [],
    objectives: [
      "Build the core chart types with plotly.express straight from a DataFrame",
      "Control hover tooltips, colors and faceting precisely",
      "Animate a chart over a time or sequence variable",
      "Customize layouts and compose multi-trace figures",
      "Export and embed interactive figures where they will actually be used",
    ],
    outcomes: [
      "A learner can build an interactive figure from a DataFrame in a few lines and customize its hover data",
      "A learner can decide when interactivity earns its weight and when a static matplotlib chart is the better call",
      "A learner can export a self-contained HTML file and embed it in a page",
    ],
    modules: [
      mod(
        "plotly.express from Zero",
        "The high-level API that does in one line what matplotlib does in five — and stays inspectable.",
        ["Build scatter, line, bar and histogram figures from DataFrames", "Map columns to color, symbol and size channels"],
        ["write-code", "predict-output", "concept-check"],
        [
          ch("First Figures", "px.scatter, px.line, px.bar — DataFrames in, Figures out", [
            L("scatter and line: The Workhorses", 30, ["px.scatter", "px.line", "Figure object"], "Your first interactive figures — plus what a Figure object actually holds inside.", "code", 3),
            L("Bars, Areas and Histograms", 30, ["px.bar", "px.area", "px.histogram"], "Category totals, compositions and distributions — with the defaults worth keeping.", "code", 3),
            L("color, symbol, size: The Semantic Channels", 30, ["color", "symbol", "size"], "Encode more variables — and the difference between color names and color sequences.", "code", 3),
          ]),
          ch("Hover: The Point of Interactivity", "Tooltips that answer the reader's next question", [
            L("hover_name, hover_data, custom_data", 30, ["hover_name", "hover_data", "tooltip"], "The tooltip is a second chart — control what appears, and in what order.", "code", 3),
            L("Maps: scatter_geo and choropleth", 30, ["scatter_geo", "choropleth", "locations"], "Points on a map and regions shaded by a value — geography, two ways.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Faceting and Motion",
        "Small multiples and animations — comparisons across categories and across time.",
        ["Facet charts by column variables", "Animate a chart over a frame variable with play controls"],
        ["write-code", "dataset-task", "interpret-results"],
        [
          ch("Faceting", "facet_col, facet_row and wrapping grids", [
            L("Faceting with facet_col and facet_row", 30, ["facet_col", "facet_row", "facet_col_wrap"], "One argument per dimension — grids of panels that compare at a glance.", "code", 3),
            L("Making Facet Grids Read as One", 25, ["shared axes", "facet titles", "alignment"], "Titles, tick labels and alignment that make a grid of panels read as a single figure.", "guided-practice", 2),
          ]),
          ch("Animation", "animation_frame, motion and the Gapminder trick", [
            L("animation_frame: Charts That Move", 30, ["animation_frame", "animation_group", "play button"], "The famous bubble-chart walk through time — how frames, groups and sliders fit together.", "code", 3),
            L("Animation Pitfalls: Scales and Stories", 25, ["fixed ranges", "pacing", "honest animation"], "Fix the axis ranges or the story lies — keeping animated charts honest as frames roll by.", "concept", 2),
          ]),
        ]
      ),
      mod(
        "Layout, Export and Judgment",
        "Figures under the hood: layout objects, subplots, HTML export — and when interactivity is overkill.",
        ["Customize titles, axes and legends through the layout", "Export and embed figures where they will be used"],
        ["write-code", "case-analysis", "interpret-results", "design-review"],
        [
          ch("Under the Hood", "Figure, update_layout, add_trace and make_subplots", [
            L("update_layout: Titles, Axes and Legends", 30, ["update_layout", "update_xaxes", "nested layout"], "One method to restyle everything — and the nested-dict mental model behind it.", "code", 3),
            L("add_trace and make_subplots", 30, ["add_trace", "make_subplots", "secondary_y"], "Combining chart types and building custom grids — the express ceiling, lifted.", "code", 3),
          ]),
          ch("Shipping and Deciding", "write_html, embedding, and the static-versus-interactive call", [
            L("write_html: A Figure Anyone Can Open", 30, ["write_html", "self-contained file", "embedding"], "A single file with the chart and the code to run it — sharing without servers.", "code", 3),
            L("When Interactivity Earns Its Weight", 25, ["exploration vs presentation", "data volume", "audience"], "Hover for ten thousand points, static for print — a decision rule for choosing plotly or matplotlib.", "reading", 2),
            L("Capstone: One Dataset, Animated", 40, ["animation", "facet", "case study"], "From CSV to an animated, faceted figure with a defensible static fallback — the whole plotly arc in one artifact.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Plotly Final", 45, 18),
    projects: [
      proj(
        "The Interactive Explainer",
        "Turn a real dataset with at least a time or category dimension into one interactive HTML explainer: a faceted main chart, hover data that answers follow-up questions, and an animation if the data supports it — plus a paragraph on when the static version would serve readers better.",
        6,
        "independent",
        [
          "A single self-contained HTML file that opens in any browser",
          "Hover tooltips customized with at least three data fields",
          "A written note defending where interactivity helped and where it was gratuitous",
        ],
        [
          "The main question is answerable within five seconds of opening the file",
          "Facets and channels encode meaningful variables, not decoration",
          "Animation (if used) keeps fixed axis ranges so no frame misleads",
        ],
        ["plotly", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["plotly", "plotly express", "hover", "facet", "animation", "html export", "interactive charts"],
  },
  {
    slug: "scikit-learn",
    school: "E",
    code: "E9",
    title: "Scikit-learn: The ML Workbench",
    blurb: "The workbench where models get made — fit, predict, pipelines and preprocessing, learned as one disciplined workflow.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["pandas"],
    softPrerequisites: ["ml-fundamentals", "descriptive-statistics", "linear-algebra"],
    objectives: [
      "Apply the fit/predict estimator API uniformly across model families",
      "Preprocess features with scaling, encoding and imputation — without leakage",
      "Compose preprocessing and models into pipelines and ColumnTransformers",
      "Select models with train/test splits and cross-validation",
      "Score models with metrics that match the question",
      "Persist fitted models with joblib and reason about their lifecycle",
    ],
    outcomes: [
      "A learner can take a raw dataframe to a scored model without leaking test information anywhere",
      "A learner can swap model families inside one pipeline and compare them fairly with cross-validation",
      "A learner can choose a metric that matches the question and explain why accuracy misleads on imbalanced data",
    ],
    modules: [
      mod(
        "The Estimator Discipline",
        "One API to learn: every model — from linear regression to forests — speaks fit, predict and transform.",
        ["Use fit, predict and transform on any estimator", "Separate transformers from predictors conceptually"],
        ["write-code", "predict-output", "concept-check"],
        [
          ch("fit, predict, transform", "The three methods that make up the whole library", [
            L("Estimators: fit and predict", 30, ["estimator", "fit", "predict"], "Learn the contract once and use it for every model in the library — that is the whole trick.", "concept", 3),
            L("Transformers: fit and transform", 30, ["transformer", "fit_transform", "StandardScaler"], "Preprocessing is the same API with transform instead of predict — one mental model, whole library.", "code", 3),
            L("The Model Zoo: Five Families at a Glance", 30, ["linear models", "trees and ensembles", "neighbors and naive Bayes"], "Linear, tree, ensemble, neighbor, naive Bayes — what each family assumes and when it shines.", "concept"),
          ]),
          ch("Your First Model End to End", "From dataframe to predictions to an honest score", [
            L("train_test_split and Why Order Matters", 30, ["train_test_split", "random_state", "test set discipline"], "Hold data back before you touch it — the split that keeps your evaluation honest.", "code", 3),
            L("A Linear Model in Five Lines", 30, ["LinearRegression", "fit", "score"], "Your first fit — and what .score does and does not tell you.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Preprocessing Without Leaks",
        "Scaling, encoding, imputation and the one rule that governs them all: fit on train, transform everything.",
        ["Scale, encode and impute every feature type", "Prove why fitting a scaler on all data is a leak"],
        ["write-code", "debug", "dataset-task", "concept-check"],
        [
          ch("The Preprocessing Kit", "StandardScaler, OneHotEncoder, SimpleImputer — what each one assumes", [
            L("Scaling: StandardScaler and Its Siblings", 30, ["StandardScaler", "MinMaxScaler", "feature scale"], "Distance and gradient methods care about scale — center, spread, and when scaling changes nothing.", "code", 3),
            L("Encoding: OneHotEncoder and OrdinalEncoder", 30, ["OneHotEncoder", "OrdinalEncoder", "unknown categories"], "Categories to numbers without inventing fake order — and the handle_unknown problem.", "code", 3),
            L("Imputation: SimpleImputer's Honest Defaults", 30, ["SimpleImputer", "strategy", "missing values"], "Mean, median, most frequent — filling gaps without pretending they were never there.", "code", 3),
          ]),
          ch("Leakage and Composition", "ColumnTransformer and Pipeline: composition that prevents leaks by design", [
            L("Data Leakage: The Silent Score Inflator", 30, ["leakage", "fit on test", "inflated scores"], "Fit the scaler on all rows and your cross-validation lies — the mistake that survives code review.", "worked-example", 3),
            L("ColumnTransformer: Different Steps, Different Columns", 30, ["ColumnTransformer", "numeric pipeline", "categorical pipeline"], "Numeric and categorical columns get different treatment — composed into one transformer.", "code", 3),
            L("Pipeline: One Object, Every Step", 30, ["Pipeline", "named steps", "single fit call"], "Chain preprocessing and model into one fit call — and see why it makes leakage harder to write.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Model Selection and Evaluation",
        "Split, score, cross-validate — comparing models with math instead of vibes.",
        ["Cross-validate a pipeline and read the fold scores", "Pick metrics that match the question"],
        ["write-code", "interpret-results", "dataset-task", "debug"],
        [
          ch("Honest Comparison", "cross_val_score and the test set you touch exactly once", [
            L("cross_val_score and Its Fold Array", 30, ["cross_val_score", "cv", "fold scores"], "Five fits, five scores, one mean and one spread — variation is information, not noise.", "code", 3),
            L("Metrics for Regression", 30, ["mean_squared_error", "R² score", "mean_absolute_error"], "Squared error, absolute error, R² — and the outliers that choose your metric for you.", "code", 3),
            L("Metrics for Classification and the Accuracy Trap", 35, ["precision", "recall", "confusion matrix"], "99% accurate on a 99%-imbalanced problem means nothing — precision, recall, F1 and the matrix that explains them.", "code", 3),
          ]),
          ch("The Families, Compared Fairly", "Same pipeline, several estimators — how little code fairness takes", [
            L("Four Families on the Same Problem", 35, ["RandomForestClassifier", "KNeighborsClassifier", "GaussianNB"], "One ColumnTransformer, four estimators, one comparison table — model choice as an experiment.", "guided-practice", 3),
            L("Overfitting, Seen in Scores", 30, ["train vs test score", "overfitting", "generalization"], "Train 1.0, test 0.6 — the signature you will learn to spot in every family.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "The Workflow, End to End",
        "From raw CSV to a saved model — plus the habits that keep the workflow reproducible.",
        ["Deliver a fitted, persisted model artifact", "Reason about reproducibility and random_state"],
        ["case-analysis", "dataset-task", "write-code", "interpret-results"],
        [
          ch("Persistence and Reproducibility", "joblib, random_state and the lifecycle of a fitted model", [
            L("joblib.dump and joblib.load", 30, ["joblib", "model persistence", "version pinning"], "Fitted models are files too — save them, load them, and pin the versions that made them.", "code", 3),
            L("random_state and Reproducibility", 25, ["random_state", "seed", "reproducibility"], "Same seed, same split, same forest — why 'works on my machine' should work on every machine.", "concept", 2),
          ]),
          ch("Capstone Workflow", "One dataset, the full discipline — question to artifact", [
            L("Capstone: Raw Table to Model Artifact", 45, ["end-to-end workflow", "ColumnTransformer", "evaluation"], "One last end-to-end run: load, split, preprocess, compare two models, score honestly, save.", "guided-practice", 3),
            L("The sklearn Checklist", 25, ["leakage check", "baseline", "metric choice"], "The questions you answer before shipping any model — leakage, metric, baseline, seed.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Scikit-learn Final", 50, 22),
    projects: [
      proj(
        "The No-Leakage Pipeline",
        "Build one Pipeline with a ColumnTransformer that handles numeric and categorical columns, compare at least three model families with cross-validation, and end with one clearly defended metric — then prove, in writing, that no test information ever touched training.",
        8,
        "independent",
        [
          "A notebook using a single Pipeline for every model comparison",
          "A cross-validation table covering at least three estimators",
          "A written defense of the chosen metric and a walkthrough of your leakage checklist",
        ],
        [
          "All scaling, encoding and imputation happen inside the pipeline, never outside it",
          "The final test score comes from a test set split before any fitting",
          "The metric choice references class balance and the underlying question",
        ],
        ["scikit-learn", "pandas", "joblib"]
      ),
      proj(
        "Model to Go",
        "Refit your best pipeline on the training data, persist it with joblib, and write a small predict script that loads the artifact and scores new data without refitting — then verify the saved model returns identical predictions to the in-memory one.",
        4,
        "guided",
        [
          "A saved model artifact loadable in a fresh process",
          "A predict script that takes new data and returns predictions",
          "A README documenting expected input columns and library versions",
        ],
        [
          "The loaded model's predictions match the in-memory model exactly",
          "The script never refits and never needs the training data",
          "Input column expectations are documented and validated on entry",
        ],
        ["scikit-learn", "joblib", "pandas"]
      ),
    ],
    placementEligible: true,
    keywords: ["scikit-learn", "pipeline", "fit and predict", "cross-validation", "columntransformer", "joblib", "metrics"],
  },
];
