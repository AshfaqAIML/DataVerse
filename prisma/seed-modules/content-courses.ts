/**
 * Seed content — remaining courses: pandas, SQL, statistics, ML, career.
 */
import type { CourseSpec } from "./lib";

export const DATA_ANALYSIS_PANDAS: CourseSpec = {
  slug: "data-analysis-pandas",
  title: "Data Analysis with pandas",
  subtitle: "Turn messy tables into insights with Python's #1 analysis library",
  description:
    "pandas is the tool data analysts reach for first. Load tables into DataFrames, clean real-world mess (nulls, wrong types, duplicates), group and aggregate, and summarize — the exact workflow used daily in analytics jobs. Build on your Python Foundations skills.",
  subjectSlug: "data-analysis",
  instructorEmail: "maya@dataverse.academy",
  level: "INTERMEDIATE",
  status: "PUBLISHED",
  estimatedHours: 14,
  modules: [
    {
      title: "DataFrames: Your New Best Friend",
      summary: "Load, inspect and select data.",
      chapters: [
        {
          title: "Getting Data In",
          lessons: [
            {
              title: "Meet the DataFrame",
              slug: "meet-the-dataframe",
              summary: "The table object that powers modern analytics.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "A spreadsheet, but programmable",
                  content:
                    "A DataFrame is a table: rows indexed 0..n, columns with names. Unlike a spreadsheet, everything you do is *code* — repeatable, reviewable, versionable. A Series is a single column. Together they cover 90% of tabular analysis work.",
                },
                {
                  kind: "CODE",
                  title: "First steps",
                  content: "shape is (rows, columns); head() previews the first rows.",
                  code: [
                    {
                      filename: "first_steps.py",
                      language: "python",
                      code: 'import pandas as pd\n\ncities = pd.DataFrame({\n    "city": ["Pune", "Lisbon", "Nairobi"],\n    "rain_mm": [12.0, 0.0, 45.0],\n})\nprint(cities.shape)\nprint(cities["rain_mm"].mean())',
                      explanation: "One line computes the average rainfall across all rows — imagine doing that in a loop by hand.",
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Build your first DataFrame",
                  prompt:
                    'Create a DataFrame with columns "city" (["Pune", "Lisbon"]) and "rain_mm" ([12, 0]). Print the number of rows only (an integer).',
                  starterCode: "import pandas as pd\n\n# build the DataFrame and print the row count\n",
                  solutionCode:
                    'import pandas as pd\n\ndf = pd.DataFrame({"city": ["Pune", "Lisbon"], "rain_mm": [12, 0]})\nprint(df.shape[0])',
                  language: "python",
                  difficulty: "EASY",
                  points: 15,
                  testCases: [
                    { name: "two rows", expectedOutput: "2" },
                    { name: "hidden: sums rain", expectedOutput: "2", hidden: true },
                  ],
                },
              ],
            },
            {
              title: "Selecting Columns & Rows",
              slug: "selecting-data",
              summary: "Slice tables precisely: loc, iloc and boolean masks.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "Three ways to slice",
                  content:
                    'Square brackets pick columns: `df[["city", "rain_mm"]]`. `loc` selects by *label*, `iloc` by *position*. The superpower is the boolean mask: `df[df["rain_mm"] > 10]` keeps only rows where the condition is True — this is how every "filter" in analytics actually works.',
                },
                {
                  kind: "CODE",
                  title: "Boolean filtering",
                  content: "A comparison on a column returns a Series of booleans; df[mask] keeps the True rows.",
                  code: [
                    {
                      filename: "filter.py",
                      language: "python",
                      code: 'rainy = cities[cities["rain_mm"] > 10]\nprint(rainy["city"].tolist())\nprint(cities.loc[0, "city"])\nprint(cities.iloc[-1])',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: "Real-World Data",
          lessons: [
            {
              title: "Missing Data & Cleaning",
              slug: "missing-data",
              summary: "Nulls, drops and fills — the unglamorous 80% of the job.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "Nothing is ever clean",
                  content:
                    'Real datasets arrive with missing values (`NaN`), duplicated rows and string-typed numbers. `isna().sum()` counts nulls per column, `dropna()` removes them, `fillna()` replaces them (a common choice: fill with the median). Deciding *which* is a judgment call you must document — that is analysis, not just code.',
                },
                {
                  kind: "CODE",
                  title: "Null triage",
                  content: "Always count before you drop — losing half your rows silently is a classic rookie mistake.",
                  code: [
                    {
                      filename: "cleaning.py",
                      language: "python",
                      code: 'import pandas as pd\n\ndf = pd.DataFrame({"city": ["Pune", "Lisbon", "Nairobi", None], "rain_mm": [12.0, None, 45.0, 3.0]})\nprint(df.isna().sum().tolist())\nprint(df.dropna(subset=["rain_mm"]).shape[0])\nprint(df["rain_mm"].fillna(0).sum())',
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: DataFrames & Cleaning",
                passingScore: 80,
                questions: [
                  {
                    prompt: "When you build a DataFrame from a dict of lists, what do the keys become?",
                    kind: "MCQ",
                    options: [
                      { text: "Column names", correct: true },
                      { text: "Row indexes" },
                      { text: "Data types" },
                      { text: "Values" },
                    ],
                    explanation: "Each key becomes a column; the lists become the column values.",
                  },
                  {
                    prompt: "What does df.shape return?",
                    kind: "MCQ",
                    options: [
                      { text: "(rows, columns)", correct: true },
                      { text: "(columns, rows)" },
                      { text: "Only row count" },
                      { text: "Total cell count" },
                    ],
                    explanation: "shape is a tuple: rows first, then columns.",
                  },
                  {
                    prompt: "True or false: df[df['rain_mm'] > 10] keeps rows where the condition is True.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "The boolean mask selects exactly the True rows.",
                  },
                ],
              },
            },
            {
              title: "Group & Aggregate",
              slug: "groupby",
              summary: "Split-apply-combine: the analyst's core move.",
              minutes: 30,
              sections: [
                {
                  kind: "TEXT",
                  title: "PivotTable, in code",
                  content:
                    '`groupby("city")["sales"].sum()` answers "how much did each city sell?" — it splits rows by city, sums sales in each group, and combines the results. Chain `.agg(["mean", "max"])` for several statistics at once. This one pattern powers most reporting you will ever write.',
                },
                {
                  kind: "CODE",
                  title: "Revenue by city",
                  content: "groupby returns a lazy GroupBy object — the aggregation is what triggers the computation.",
                  code: [
                    {
                      filename: "groupby.py",
                      language: "python",
                      code: 'import pandas as pd\n\nsales = pd.DataFrame({\n    "city": ["Pune", "Pune", "Lisbon", "Lisbon"],\n    "product": ["tea", "coffee", "tea", "coffee"],\n    "revenue": [100, 150, 120, 90],\n})\nprint(sales.groupby("city")["revenue"].sum().to_dict())\nprint(sales.groupby("city")["revenue"].agg(["mean", "max"]))',
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Group revenue by city",
                  prompt:
                    'Given sales = pd.DataFrame({"city": ["A", "A", "B"], "revenue": [10, 20, 40]}), group by "city", sum revenue, and print the result for city "A" (a single integer).',
                  starterCode: "import pandas as pd\n\nsales = pd.DataFrame({\"city\": [\"A\", \"A\", \"B\"], \"revenue\": [10, 20, 40]})\n# group, sum, print revenue for city A\n",
                  solutionCode:
                    'import pandas as pd\n\nsales = pd.DataFrame({"city": ["A", "A", "B"], "revenue": [10, 20, 40]})\nprint(sales.groupby("city")["revenue"].sum()["A"])',
                  language: "python",
                  difficulty: "MEDIUM",
                  points: 20,
                  testCases: [
                    { name: "city A sums to 30", expectedOutput: "30" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "From Tables to Insights",
      summary: "Combine tables, visualize and tell the story.",
      chapters: [
        {
          title: "Reshaping",
          lessons: [
            {
              title: "Sorting & Ranking",
              slug: "sorting-ranking",
              summary: "Find top performers and worst offenders.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "Who's on top?",
                  content:
                    '`sort_values("revenue", ascending=False)` orders rows; `nlargest(3, "revenue")` is a shortcut for the top 3. Ranking questions ("top 5 products", "worst 10 stores") are business questions in disguise — sorting is how you answer them.',
                },
                {
                  kind: "CODE",
                  title: "Top of the table",
                  content: "rank() adds a position column without reordering the frame.",
                  code: [
                    {
                      filename: "top.py",
                      language: "python",
                      code: 'print(sales.sort_values("revenue", ascending=False).head(2))\nprint(sales["revenue"].rank(ascending=False).tolist())',
                    },
                  ],
                },
              ],
            },
            {
              title: "Joining Tables",
              slug: "joining-tables",
              summary: "merge(): SQL-style joins in pandas.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "Venn diagrams, at last",
                  content:
                    '`merge()` combines two DataFrames on a shared key: `how="inner"` keeps matches, `"left"` keeps all rows from the left table, `"outer"` keeps everything. Exactly like SQL joins — same mental model, same use cases: attach product details to sales rows, or users to events.',
                },
                {
                  kind: "CODE",
                  title: "Left join in practice",
                  content: "Unmatched right-side rows become NaN after a left join — check for them before aggregating.",
                  code: [
                    {
                      filename: "merge.py",
                      language: "python",
                      code: 'products = pd.DataFrame({"product": ["tea", "coffee", "juice"], "margin": [0.8, 0.6, 0.7]})\nmerged = sales.merge(products, on="product", how="left")\nprint(merged[["city", "product", "margin"]].to_string(index=False))',
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: Aggregation & Joins",
                passingScore: 80,
                questions: [
                  {
                    prompt: 'What does groupby("city")["revenue"].sum() produce?',
                    kind: "MCQ",
                    options: [
                      { text: "Total revenue per city", correct: true },
                      { text: "The single overall total" },
                      { text: "Revenue per product" },
                      { text: "A boolean mask" },
                    ],
                    explanation: "Split by city, sum revenue within each group.",
                  },
                  {
                    prompt: 'Which merge keeps only rows that match in both tables?',
                    kind: "MCQ",
                    options: [
                      { text: 'how="inner"', correct: true },
                      { text: 'how="left"' },
                      { text: 'how="outer"' },
                      { text: 'how="cross"' },
                    ],
                    explanation: "Inner join = intersection of keys.",
                  },
                  {
                    prompt: "True or false: groupby returns a fully computed DataFrame immediately.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True" }, { text: "False", correct: true }],
                    explanation: "It returns a lazy GroupBy object; an aggregation triggers the work.",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Telling the Story",
          lessons: [
            {
              title: "Summarizing a Dataset",
              slug: "summarizing",
              summary: "describe(), value_counts() and the analyst's first look.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "The first five minutes with any dataset",
                  content:
                    "`describe()` gives count/mean/std/quartiles for every numeric column in one call; `value_counts()` shows category frequencies. Run these two before anything else — they surface outliers, impossible values and typos early, when fixing them is still cheap.",
                },
                {
                  kind: "CODE",
                  title: "First contact",
                  content: "describe() on a small frame: the fastest reality check there is.",
                  code: [
                    {
                      filename: "describe.py",
                      language: "python",
                      code: 'print(sales["revenue"].describe())\nprint(sales["city"].value_counts().to_dict())',
                    },
                  ],
                },
              ],
            },
            {
              title: "Capstone Walkthrough: Taxi Trips",
              slug: "pandas-capstone",
              summary: "A full analysis, end to end.",
              minutes: 30,
              sections: [
                {
                  kind: "TEXT",
                  title: "The shape of a real analysis",
                  content:
                    "Load → check quality → clean → aggregate → rank → summarize. The capstone project asks you to run this full loop on a taxi-trip dataset: which zones generate the most trips, how trip length varies by hour, and one data-quality finding of your own.",
                },
                {
                  kind: "CALLOUT",
                  title: "You are ready",
                  content:
                    "Everything in the project uses only what you learned in this course. Open the Capstone from the course page when you finish the quiz.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  project: {
    title: "Capstone: Exploratory Analysis of City Taxi Trips",
    brief:
      "Using the provided trips dataset (pickup zone, hour, distance, fare), clean the data, compute trips and average fare per zone, describe how trip distance varies by hour of day, and write a 5-line executive summary of findings.",
    requirements: [
      "Document every cleaning decision (nulls, outliers, duplicates)",
      "Trips and average fare aggregated per zone",
      "Distance-by-hour analysis with describe()",
      "One chart or table as evidence per finding",
      "5-line executive summary written for a non-technical reader",
    ],
    difficulty: "INTERMEDIATE",
    points: 150,
  },
};

export const SQL_FOUNDATIONS: CourseSpec = {
  slug: "sql-foundations",
  title: "SQL Foundations for Analysts",
  subtitle: "Ask databases questions and get trustworthy answers",
  description:
    "SQL is the single most-requested skill in data job postings. Query tables with SELECT, filter with WHERE, join related tables, and aggregate with GROUP BY — the complete toolkit for pulling answers out of a database. No database experience needed.",
  subjectSlug: "sql-databases",
  instructorEmail: "alex@dataverse.academy",
  level: "BEGINNER",
  status: "PUBLISHED",
  estimatedHours: 12,
  modules: [
    {
      title: "Querying One Table",
      summary: "SELECT, WHERE, ORDER BY, LIMIT.",
      chapters: [
        {
          title: "Your First Queries",
          lessons: [
            {
              title: "SELECT: Reading a Table",
              slug: "select-basics",
              summary: "Choose columns, alias them, limit rows.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "Declarative by design",
                  content:
                    'You describe *what* you want, the database figures out *how*: `SELECT name, price FROM products` returns those columns for every row. SQL reads almost like an English request — which is why product managers can often read it too.',
                },
                {
                  kind: "CODE",
                  title: "First query",
                  content: "AS renames a column for display; LIMIT caps the row count.",
                  code: [
                    {
                      filename: "first_query.sql",
                      language: "sql",
                      code: "SELECT name AS product_name, price\nFROM products\nORDER BY price DESC\nLIMIT 5;",
                      explanation: "The five most expensive products — a top-N query, the analyst's bread and butter.",
                    },
                  ],
                },
              ],
            },
            {
              title: "WHERE: Filtering Rows",
              slug: "where-filtering",
              summary: "AND, OR, IN, BETWEEN, LIKE, IS NULL.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Precision filtering",
                  content:
                    '`WHERE price BETWEEN 10 AND 50` keeps a range; `category IN (\'tea\', \'coffee\')` matches a list; `name LIKE \'%matcha%\'` matches text patterns. Watch the classic trap: **NULL is not a value**, so `category != \'tea\'` silently drops NULL rows — use `IS NULL` explicitly.',
                },
                {
                  kind: "CODE",
                  title: "Compound conditions",
                  content: "Parentheses control precedence, just like in Python.",
                  code: [
                    {
                      filename: "where.sql",
                      language: "sql",
                      code: "SELECT name, price\nFROM products\nWHERE (category = 'tea' AND price < 20)\n   OR name LIKE '%matcha%'\nORDER BY price;",
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Query SQLite from Python",
                  prompt:
                    "Create an in-memory SQLite table t(id, name), insert (1, 'ada') and (2, 'grace'), then SELECT the names ordered by id and print them joined with commas — exactly: ada,grace",
                  starterCode: "import sqlite3\n\n# create table, insert rows, query, print\n",
                  solutionCode:
                    'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE t (id INTEGER, name TEXT)")\nconn.executemany("INSERT INTO t VALUES (?, ?)", [(1, "ada"), (2, "grace")])\nrows = conn.execute("SELECT name FROM t ORDER BY id").fetchall()\nprint(",".join(r[0] for r in rows))',
                  language: "python",
                  difficulty: "MEDIUM",
                  points: 25,
                  testCases: [
                    { name: "ordered names", expectedOutput: "ada,grace" },
                    { name: "hidden: count check", expectedOutput: "ada,grace", hidden: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: "Aggregating",
          lessons: [
            {
              title: "GROUP BY & Aggregates",
              slug: "groupby-sql",
              summary: "COUNT, SUM, AVG with HAVING.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "Rows to summaries",
                  content:
                    "`SELECT category, COUNT(*), AVG(price) FROM products GROUP BY category` collapses rows into one summary row per category. `HAVING` filters *after* aggregation (WHERE filters before). Same split-apply-combine idea as pandas groupby — different syntax, identical concept.",
                },
                {
                  kind: "CODE",
                  title: "Category report",
                  content: "WHERE filters rows; HAVING filters groups.",
                  code: [
                    {
                      filename: "groupby.sql",
                      language: "sql",
                      code: "SELECT category, COUNT(*) AS n, AVG(price) AS avg_price\nFROM products\nGROUP BY category\nHAVING COUNT(*) >= 2\nORDER BY avg_price DESC;",
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: SELECT to GROUP BY",
                passingScore: 80,
                questions: [
                  {
                    prompt: "Which clause filters rows BEFORE aggregation?",
                    kind: "MCQ",
                    options: [
                      { text: "WHERE", correct: true },
                      { text: "HAVING" },
                      { text: "ORDER BY" },
                      { text: "LIMIT" },
                    ],
                    explanation: "WHERE filters rows; HAVING filters aggregated groups.",
                  },
                  {
                    prompt: "What does ORDER BY do?",
                    kind: "MCQ",
                    options: [
                      { text: "Sorts the result rows", correct: true },
                      { text: "Filters rows" },
                      { text: "Joins tables" },
                      { text: "Names columns" },
                    ],
                    explanation: "ORDER BY sorts; combine with LIMIT for top-N.",
                  },
                  {
                    prompt: "True or false: SELECT * returns every column of the table.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "The asterisk means all columns.",
                  },
                ],
              },
            },
            {
              title: "JOINs: Combining Tables",
              slug: "sql-joins",
              summary: "INNER, LEFT, RIGHT and when to use each.",
              minutes: 30,
              sections: [
                {
                  kind: "TEXT",
                  title: "Tables that know each other",
                  content:
                    "Real databases split data across tables linked by keys. `JOIN ... ON products.id = sales.product_id` stitches them back together for analysis. INNER JOIN keeps matches; LEFT JOIN keeps every left row even without a match (unmatched right columns become NULL) — the safest default for reporting.",
                },
                {
                  kind: "CODE",
                  title: "Join with aggregate",
                  content: "Join first, then group — the standard reporting pattern.",
                  code: [
                    {
                      filename: "join.sql",
                      language: "sql",
                      code: "SELECT p.category, SUM(s.revenue) AS revenue\nFROM sales s\nJOIN products p ON p.id = s.product_id\nGROUP BY p.category\nORDER BY revenue DESC;",
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: JOINs",
                passingScore: 80,
                questions: [
                  {
                    prompt: "Which JOIN keeps only rows with a match in both tables?",
                    kind: "MCQ",
                    options: [
                      { text: "INNER JOIN", correct: true },
                      { text: "LEFT JOIN" },
                      { text: "RIGHT JOIN" },
                      { text: "FULL OUTER JOIN" },
                    ],
                    explanation: "Inner = intersection of the two key sets.",
                  },
                  {
                    prompt: "What does the ON clause of a JOIN specify?",
                    kind: "MCQ",
                    options: [
                      { text: "How rows from the two tables are matched", correct: true },
                      { text: "Which columns to select" },
                      { text: "The sort order" },
                      { text: "The row limit" },
                    ],
                    explanation: "ON defines the join condition (the matching keys).",
                  },
                  {
                    prompt: "True or false: a table can be joined to itself.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "Self-joins compare rows of one table (e.g. employees to managers).",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Analyst Habits",
      summary: "Design-aware querying and safety.",
      chapters: [
        {
          title: "Reading a Schema",
          lessons: [
            {
              title: "Keys & Schema Design",
              slug: "keys-schema",
              summary: "Primary keys, foreign keys and why they matter to you.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "The map of a database",
                  content:
                    "A primary key uniquely identifies a row; a foreign key points at another table's primary key. Reading an entity-relationship diagram is how you find the join path from users to payments. As an analyst you rarely design schemas, but you must read them fluently.",
                },
              ],
            },
            {
              title: "Writing Safe Queries",
              slug: "safe-queries",
              summary: "LIMIT early, COUNT before DELETE, transaction basics.",
              minutes: 15,
              sections: [
                {
                  kind: "CALLOUT",
                  title: "Professional habits",
                  content:
                    "1) LIMIT while exploring. 2) COUNT(*) before any write to confirm scope. 3) Read the WHERE twice. 4) Wrap risky changes in a transaction so you can ROLLBACK. These four habits will save your career one day.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const STATISTICS_ESSENTIALS: CourseSpec = {
  slug: "statistics-essentials",
  title: "Statistics Essentials for Data Science",
  subtitle: "Describe data honestly and reason about uncertainty",
  description:
    "The statistics every data professional actually uses: descriptive measures, distributions, sampling and the vocabulary of statistical thinking. Taught with plain language and tiny datasets — no proofs, no formulas without a story.",
  subjectSlug: "statistics-math",
  instructorEmail: "alex@dataverse.academy",
  level: "BEGINNER",
  status: "IN_REVIEW",
  estimatedHours: 10,
  modules: [
    {
      title: "Describing Data",
      summary: "Centers, spread and shapes.",
      chapters: [
        {
          title: "Center & Spread",
          lessons: [
            {
              title: "Mean, Median, Mode",
              slug: "mean-median-mode",
              summary: "Three kinds of 'typical', and when each lies.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "The outlier problem",
                  content:
                    "Mean = balance point; median = middle value. One billionaire walks into a bar and the *mean* income soars, but the median barely moves. Income, house prices, response times — all heavily skewed, so analysts report medians. Knowing which to report (and why) is a credibility signal.",
                },
                {
                  kind: "CODE",
                  title: "Feel the difference",
                  content: "Add one extreme value and compare.",
                  code: [
                    {
                      filename: "center.py",
                      language: "python",
                      code: 'import statistics as st\n\nsalaries = [40, 42, 45, 41, 250]\nprint(st.mean(salaries))\nprint(st.median(salaries))',
                    },
                  ],
                },
              ],
            },
            {
              title: "Spread & Standard Deviation",
              slug: "spread",
              summary: "How variable is the data? Variance, std, IQR.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Averages are not enough",
                  content:
                    "Two teams can both average 50 sales/week while one is perfectly steady and the other swings wildly. Standard deviation measures that swing in the same units as the data; the IQR (quartile 3 minus quartile 1) is its outlier-resistant cousin. Always report a center *and* a spread.",
                },
              ],
            },
          ],
        },
        {
          title: "Thinking Statistically",
          lessons: [
            {
              title: "Distributions & the Normal Curve",
              slug: "distributions",
              summary: "Why the bell curve keeps appearing.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "The shape of randomness",
                  content:
                    "Histogram heights describe how values are distributed. Many natural measurements (heights, measurement errors) pile into the symmetric bell shape; business data (money, waiting times) usually skews right. The 68-95-99.7 rule says how much of normal data sits within 1, 2 and 3 standard deviations.",
                },
              ],
              quiz: {
                title: "Checkpoint: Descriptive Statistics",
                passingScore: 80,
                questions: [
                  {
                    prompt: "Which measure of center is most robust to outliers?",
                    kind: "MCQ",
                    options: [
                      { text: "Median", correct: true },
                      { text: "Mean" },
                      { text: "Mode" },
                      { text: "Range" },
                    ],
                    explanation: "The median ignores the magnitude of extreme values.",
                  },
                  {
                    prompt: "What does standard deviation measure?",
                    kind: "MCQ",
                    options: [
                      { text: "How spread out values are around the mean", correct: true },
                      { text: "The middle value" },
                      { text: "The most common value" },
                      { text: "The total of all values" },
                    ],
                    explanation: "It is the typical distance from the mean.",
                  },
                  {
                    prompt: "True or false: a larger sample gives a more stable estimate of the population mean.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "Sampling variability shrinks as sample size grows.",
                  },
                ],
              },
            },
            {
              title: "Sampling & Bias",
              slug: "sampling-bias",
              summary: "Why your sample can lie to you.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "Garbage in, insights out",
                  content:
                    "Every insight generalizes only as far as the sample allows. Survivorship bias (studying only what survived), selection bias (surveying only your engaged users) and convenience samples quietly corrupt conclusions. The fix is rarely more math — it is asking *who is missing from this data?*",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const INTRO_ML: CourseSpec = {
  slug: "intro-machine-learning",
  title: "Introduction to Machine Learning",
  subtitle: "What models are, what they learn, and how they fail",
  description:
    "A concepts-first tour of machine learning: what training means, the difference between supervised and unsupervised learning, why models overfit, and how to evaluate them honestly. Code-light, ideas-heavy — the map before the territory.",
  subjectSlug: "machine-learning-ai",
  instructorEmail: "alex@dataverse.academy",
  level: "INTERMEDIATE",
  status: "DRAFT",
  estimatedHours: 8,
  modules: [
    {
      title: "The Landscape",
      summary: "What ML is and is not.",
      chapters: [
        {
          title: "Foundations",
          lessons: [
            {
              title: "What 'Learning' Means",
              slug: "what-is-learning",
              summary: "Patterns from data instead of rules from experts.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Rules out, patterns in",
                  content:
                    "Traditional software is rules written by humans; machine learning is patterns inferred from examples. Show it enough labeled spam and ham emails and it learns a rule you could never have written by hand. The catch: the model is only as good as the examples — bias in, bias out.",
                },
              ],
            },
            {
              title: "Supervised vs Unsupervised",
              slug: "supervised-vs-unsupervised",
              summary: "Predicting labels vs discovering structure.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Two families",
                  content:
                    "Supervised learning trains on labeled examples (this email is spam; this house sold for $430k) to predict labels for new cases. Unsupervised learning finds structure without labels — customer segments, topic clusters. Most business value today comes from the supervised family.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const CAREER_DATA_ANALYST: CourseSpec = {
  slug: "career-data-analyst",
  title: "Career Track: Launch Your Data Analyst Role",
  subtitle: "From finished courses to a hired analyst",
  description:
    "The non-technical half of getting hired: assembling a portfolio from your capstones, writing a results-first resume, surviving SQL case interviews, and building the habit of continuous learning that keeps you employed.",
  subjectSlug: "career",
  instructorEmail: "maya@dataverse.academy",
  level: "BEGINNER",
  status: "PUBLISHED",
  estimatedHours: 6,
  modules: [
    {
      title: "Getting Job-Ready",
      summary: "Portfolio, resume, interviews.",
      chapters: [
        {
          title: "Proof of Work",
          lessons: [
            {
              title: "Building a Portfolio from Capstones",
              slug: "portfolio",
              summary: "Three projects beat thirty certificates.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Show, don't tell",
                  content:
                    "Hiring managers spend ~90 seconds on your resume. A portfolio with three well-told projects (problem → approach → decision → result) beats any list of courses. Your DataVerse capstones are designed to become exactly these projects: publish the notebook, write a 200-word README for a non-technical reader.",
                },
                {
                  kind: "CALLOUT",
                  title: "The README formula",
                  content:
                    "1) The business question in one sentence. 2) What you decided and why. 3) One chart that proves it. 4) A limitation you found. Recruiters and hiring managers alike reward this structure.",
                },
              ],
            },
            {
              title: "The Results-First Resume",
              slug: "resume",
              summary: "Turn coursework into measurable achievements.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Verbs, numbers, tools",
                  content:
                    '"Completed a pandas course" is invisible. "Cleaned a 50k-row rides dataset and identified a 12% revenue-overreporting bug (pandas, SQL)" is an interview. Every bullet: action verb + scale + tool. It is fine that the scale is a course dataset — the *craft* is what transfers.',
                },
              ],
            },
          ],
        },
        {
          title: "Interviews & Beyond",
          lessons: [
            {
              title: "Surviving the SQL Case Interview",
              slug: "sql-interview",
              summary: "Think aloud, structure first.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "It is a thinking test",
                  content:
                    "SQL interviews test whether you can turn a fuzzy business question into a precise query. The winning pattern: restate the question, list needed tables and join keys, write the query in stages (SELECT → WHERE → GROUP BY → HAVING), and narrate every decision. Silence is the only wrong answer.",
                },
              ],
            },
            {
              title: "The Learning Habit",
              slug: "learning-habit",
              summary: "Staying sharp after the certificate.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "Compounding, not cramming",
                  content:
                    "The tools change; the fundamentals compound. A simple system: one dataset a month, one technique per dataset, one write-up per analysis. In a year that is twelve portfolio pieces and a genuine skill stack — this is how careers in data are actually built.",
                },
              ],
              quiz: {
                title: "Checkpoint: Job Readiness",
                passingScore: 50,
                questions: [
                  {
                    prompt: "What makes the strongest portfolio item?",
                    kind: "MCQ",
                    options: [
                      { text: "A project with a clear question, decision and result", correct: true },
                      { text: "The longest notebook" },
                      { text: "The most advanced model" },
                      { text: "A certificate scan" },
                    ],
                    explanation: "Hiring managers hire judgment — the story proves it.",
                  },
                  {
                    prompt: "In a SQL case interview, what matters most?",
                    kind: "MCQ",
                    options: [
                      { text: "Thinking aloud and structuring the problem", correct: true },
                      { text: "Typing silently and fast" },
                      { text: "Memorizing syntax" },
                      { text: "Using the newest SQL features" },
                    ],
                    explanation: "They hire problem decomposition, not recall.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
