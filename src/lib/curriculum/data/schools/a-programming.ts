/**
 * SCHOOL A — PROGRAMMING (A1–A5)
 * Python from zero to advanced, SQL from zero to advanced, Git & GitHub,
 * Jupyter Notebook, and programming fundamentals.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolA: SubjectDef[] = [
  {
    slug: "python",
    school: "A",
    code: "A1",
    title: "Python from Zero to Advanced",
    blurb: "From your very first line of code to confident, idiomatic Python — the language of data.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Write, run, and debug Python programs from scratch",
      "Choose the right data structure for a task and manipulate it fluently",
      "Structure programs with functions, modules, and classes",
      "Handle errors gracefully and work with files and data",
      "Apply intermediate Python idioms used daily in data work",
    ],
    outcomes: [
      "A learner can build a complete command-line program using functions, modules, and error handling",
      "A learner can select and manipulate lists, dictionaries, sets, and tuples correctly",
      "A learner can read and write text and CSV files with robust parsing",
      "A learner can explain and use classes, generators, and comprehensions in real code",
    ],
    modules: [
      mod(
        "Python Foundations",
        "Values, variables, decisions, and repetition — the grammar of every program you will ever write.",
        ["Write and run simple Python programs unaided", "Control program flow with conditions and loops"],
        ["concept-check", "predict-output", "write-code"],
        [
          ch("Getting Started", "Your first lines of Python and how the interpreter turns them into action", [
            L("How Python Runs Your Code", 25, ["interpreter", "REPL", "script"], "See how the interpreter reads, translates, and executes your text."),
            L("Your First Programs", 30, ["print", "comment", "syntax error"], "Write, save, and run a first script and meet your first syntax errors.", "code"),
            L("Variables and Data Types", 35, ["variable", "int", "float", "str"], "Store values in variables and inspect what type they are.", "code", 3),
            L("Numbers and Arithmetic", 30, ["operator", "expression", "order of operations"], "Compute with numbers and control the order of operations.", "code"),
          ]),
          ch("Making Decisions", "Booleans, comparisons, and if/elif/else branches", [
            L("Booleans and Comparisons", 30, ["bool", "comparison operator", "truthiness"], "Produce True and False from comparisons and combine them with and, or, not.", "code"),
            L("if, elif, else", 35, ["conditional", "branch", "indentation"], "Branch your program with conditionals and understand Python's indentation rules.", "code", 3),
            L("Debugging Logic Errors", 30, ["logic error", "trace", "print debugging"], "Find and fix programs that run but decide wrongly.", "guided-practice"),
          ]),
          ch("Repetition", "Loops: doing the same work without copying code", [
            L("for Loops and range", 30, ["for loop", "range", "iteration"], "Repeat work over numbers and collections with for loops.", "code"),
            L("while Loops", 30, ["while loop", "condition", "infinite loop"], "Repeat until a condition changes — and escape infinite loops safely.", "code", 3),
            L("Loop Control: break and continue", 25, ["break", "continue", "accumulator"], "Steer loops mid-flight with break and continue, and build accumulator patterns.", "code"),
            L("Nested Loops and Patterns", 35, ["nested loop", "grid", "pattern"], "Combine loops inside loops to walk grids and draw text patterns.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Core Data Structures",
        "Lists, tuples, dictionaries, and sets — the containers every data workflow is built on.",
        ["Choose the right container for a task", "Slice, sort, and transform collections with confidence"],
        ["concept-check", "predict-output", "write-code", "debug"],
        [
          ch("Lists", "Ordered, changeable collections — the workhorse of Python", [
            L("Creating and Indexing Lists", 30, ["list", "index", "zero-based"], "Build lists and reach any element by index.", "code"),
            L("Slicing Lists", 30, ["slice", "start", "stop", "step"], "Copy ranges and strides of a list with slice syntax.", "code", 3),
            L("List Methods and Sorting", 35, ["append", "sort", "sorted"], "Grow, shrink, and sort lists with the right method for the job.", "code", 3),
          ]),
          ch("Tuples and Sets", "Immutable sequences and mathematical uniqueness", [
            L("Tuples and Immutability", 25, ["tuple", "immutability", "unpacking"], "Use tuples for fixed records and unpack them into variables.", "code"),
            L("Sets and Membership", 30, ["set", "membership", "union", "intersection"], "Deduplicate data and answer membership questions in constant time.", "code", 3),
          ]),
          ch("Dictionaries", "Key-value pairs — how Python maps, counts, and groups", [
            L("Dictionary Basics", 30, ["dict", "key", "value"], "Store and look up data by meaningful keys.", "code"),
            L("Iterating Dictionaries", 30, ["items", "keys", "values"], "Walk dictionaries and format their contents neatly.", "code", 3),
            L("Counting and Grouping Patterns", 35, ["counter", "grouping", "defaultdict idea"], "Count words, votes, and events with the classic dictionary patterns.", "worked-example", 3),
          ]),
          ch("Comprehensions", "Build collections in one readable line", [
            L("List Comprehensions", 30, ["comprehension", "mapping", "filtering"], "Transform and filter lists in a single expression.", "code", 3),
            L("Dict and Set Comprehensions", 30, ["dict comprehension", "set comprehension"], "Build dictionaries and sets the same concise way.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Functions, Errors, and Files",
        "Reusable logic, graceful failure, and reading real data from disk.",
        ["Decompose problems into small, testable functions", "Survive bad input and missing files without crashing"],
        ["write-code", "debug", "parsons", "predict-output"],
        [
          ch("Functions", "Name, reuse, and compose your logic", [
            L("Defining and Calling Functions", 30, ["def", "call", "parameter", "argument"], "Package logic into functions that take inputs and return results.", "code"),
            L("Default and Keyword Arguments", 30, ["default argument", "keyword argument"], "Design flexible function signatures with sensible defaults.", "code", 3),
            L("Return Values and Scope", 35, ["return", "local variable", "scope"], "Return results, avoid global state, and understand where names live.", "code", 3),
            L("Functions as Values", 30, ["first-class function", "higher-order function"], "Pass functions around like any other value.", "concept"),
          ]),
          ch("Modules and Imports", "Organize code across files", [
            L("Importing from the Standard Library", 30, ["import", "module", "standard library"], "Reuse Python's built-in toolbox: math, random, datetime, and more.", "code"),
            L("Writing Your Own Modules", 30, ["module file", "namespace", "__main__"], "Split programs into files and write runnable scripts.", "code"),
          ]),
          ch("Errors and Exceptions", "Programs that fail politely", [
            L("Reading Tracebacks", 25, ["traceback", "exception", "error type"], "Decode a crash report line by line to find the real cause.", "concept"),
            L("try/except and Raising", 35, ["try", "except", "raise"], "Catch expected failures and raise clear errors of your own.", "code", 3),
            L("Validating Input", 30, ["validation", "guard clause", "loop until valid"], "Ask again until the user gives usable input.", "guided-practice", 3),
          ]),
          ch("Files and Data", "Reading and writing real data", [
            L("Reading Text Files", 30, ["open", "read", "context manager"], "Read files safely with with-blocks and process lines one by one.", "code"),
            L("Writing Files", 25, ["write", "append", "newline"], "Persist results to text files without losing data.", "code"),
            L("Parsing CSV Files", 35, ["csv", "delimiter", "header row"], "Parse spreadsheets-in-the-raw with the csv module.", "code", 4),
          ]),
        ]
      ),
      mod(
        "Objects and Advanced Python",
        "Classes, generators, and the idioms that mark a confident Pythonista.",
        ["Model data with classes and use them in real programs", "Use generators and modern idioms to process data lazily and cleanly"],
        ["write-code", "concept-check", "predict-output", "debug"],
        [
          ch("Classes and Objects", "Your own types, with data and behavior bundled together", [
            L("Defining Classes", 35, ["class", "instance", "__init__"], "Design your own types with constructors and attributes.", "code", 3),
            L("Methods and self", 30, ["method", "self", "instance state"], "Give objects behavior that reads and updates their own data.", "code", 3),
            L("Inheritance and Composition", 35, ["inheritance", "composition", "override"], "Reuse code the two ways OOP offers — and know when to pick which.", "concept", 3),
          ]),
          ch("Functional Tools", "Lambda, map, filter, and sorted keys", [
            L("Lambda Functions", 25, ["lambda", "expression", "key function"], "Write tiny throwaway functions for sorting and mapping.", "code", 3),
            L("map, filter, and sorted", 30, ["map", "filter", "sorted"], "Process collections functionally and sort by custom keys.", "code", 3),
          ]),
          ch("Iterators and Generators", "Lazy sequences for large data", [
            L("How Iteration Works", 30, ["iterator protocol", "iterable", "next"], "Understand what a for loop really asks of an object.", "concept"),
            L("Generator Functions and yield", 35, ["generator", "yield", "lazy evaluation"], "Produce values one at a time and process data bigger than memory.", "code", 3),
          ]),
          ch("The Python Workflow", "Virtual environments, typing, and tests", [
            L("Virtual Environments and pip", 30, ["virtualenv", "pip", "requirements.txt"], "Isolate project dependencies and install packages safely.", "code"),
            L("Type Hints Basics", 30, ["type hint", "annotation", "mypy idea"], "Annotate functions so tools and teammates can check your code.", "code"),
            L("First Tests with pytest", 35, ["test", "assert", "pytest"], "Turn examples into automated tests that guard your logic.", "code", 4),
          ]),
        ]
      ),
    ],
    finalExam: exam("Python End-of-Subject Assessment", 45, 30),
    projects: [
      proj(
        "Personal Expense Tracker",
        "A command-line expense tracker: add expenses with categories, store them in a CSV file, and print monthly summaries.",
        6,
        "guided",
        [
          "Working CLI menu loop with input validation",
          "Expenses persisted to expenses.csv across restarts",
          "Monthly summary report grouped by category",
        ],
        ["Correct file handling and error recovery", "Clean function decomposition (no God-functions)", "Summary output matches the sample transcript"],
        ["python", "csv"]
      ),
      proj(
        "Text File Analyzer",
        "Analyze any text file: word counts, top keywords, sentence lengths, and reading-time estimates — exported as a report.",
        8,
        "independent",
        ["Analyzer module importable and tested", "Report file generated for a given input text", "README with usage examples"],
        ["Handles missing and malformed files gracefully", "Top-keyword logic ignores stop words", "At least five pytest tests pass"],
        ["python", "pytest"]
      ),
    ],
    placementEligible: true,
    keywords: ["python", "programming", "syntax", "scripting"],
  },
  {
    slug: "sql",
    school: "A",
    code: "A2",
    title: "SQL from Zero to Advanced",
    blurb: "Ask any question of any relational database — from first SELECT to window functions.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Query relational databases with confidence and precision",
      "Aggregate, join, and reshape data across multiple tables",
      "Define schema and modify data safely with constraints and transactions",
      "Write analytical SQL: window functions, CTEs, and performance-aware queries",
    ],
    outcomes: [
      "A learner can answer multi-table business questions with a single query",
      "A learner can design normalized tables with keys and constraints",
      "A learner can compute running totals and rankings with window functions",
      "A learner can read a query plan and add indexes that actually help",
    ],
    modules: [
      mod(
        "Query Foundations",
        "Tables, rows, and the SELECT statement — asking your first questions of a database.",
        ["Retrieve exactly the rows and columns you need", "Sort and limit results deliberately"],
        ["concept-check", "fill-in", "predict-output"],
        [
          ch("Relational Thinking", "Tables, rows, columns, and keys — the mental model of relational data", [
            L("What a Database Really Is", 25, ["database", "table", "row", "column"], "See how data lives in tables and why that shape wins."),
            L("Primary and Foreign Keys", 30, ["primary key", "foreign key", "relationship"], "Connect tables with keys and avoid duplicated data.", "concept"),
            L("Your First SELECT", 30, ["SELECT", "FROM", "query"], "Write your first query and read its result grid.", "code", 3),
          ]),
          ch("Filtering with WHERE", "Choosing rows by condition", [
            L("Comparisons and Logic", 30, ["WHERE", "AND", "OR", "NOT"], "Combine conditions to slice a table precisely.", "code", 3),
            L("NULL, IN, BETWEEN, LIKE", 30, ["NULL", "IN", "BETWEEN", "LIKE"], "Handle missing values and match ranges and patterns.", "code", 3),
            L("Sorting and Limiting", 25, ["ORDER BY", "LIMIT", "OFFSET"], "Sort results meaningfully and page through large outputs.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Aggregating and Combining",
        "GROUP BY, JOIN, and subqueries — where SQL earns its salary.",
        ["Summarize thousands of rows into answers", "Combine tables without losing or duplicating rows"],
        ["predict-output", "write-code", "debug"],
        [
          ch("Aggregates and GROUP BY", "Collapse rows into answers", [
            L("COUNT, SUM, AVG, MIN, MAX", 30, ["aggregate", "COUNT", "SUM"], "Summarize columns with the five essential aggregates.", "code", 3),
            L("GROUP BY and HAVING", 35, ["GROUP BY", "HAVING", "grouping"], "Summarize per category and filter the groups themselves.", "code", 4),
            L("Common Grouping Mistakes", 30, ["grouping error", "NULL groups", "precision"], "Diagnose the classic GROUP BY bugs every beginner hits.", "worked-example"),
            L("CASE Inside Aggregates", 30, ["CASE", "conditional aggregate", "pivot idea"], "Build conditional counts and hand-rolled pivots with CASE.", "code", 3),
          ]),
          ch("Joins", "Assembling answers from multiple tables", [
            L("INNER JOIN", 35, ["JOIN", "ON", "match"], "Combine rows from two tables on a shared key.", "code", 4),
            L("LEFT, RIGHT, and FULL Joins", 35, ["LEFT JOIN", "outer join", "unmatched rows"], "Keep rows that have no match — and know why they matter.", "code", 4),
            L("Multi-Table Joins", 35, ["multiple joins", "alias", "join order"], "Chain joins across three or more tables without losing track.", "code", 4),
            L("Self Joins and Anti-Joins", 30, ["self join", "anti-join", "NOT EXISTS"], "Compare a table to itself and find rows that lack matches.", "code", 3),
          ]),
          ch("Subqueries and CTEs", "Queries inside queries, organized", [
            L("Scalar and List Subqueries", 30, ["subquery", "scalar", "IN subquery"], "Feed one query's result into another.", "code", 3),
            L("Correlated Subqueries", 30, ["correlated subquery", "EXISTS", "outer reference"], "Reference the outer row inside your subquery.", "code", 3),
            L("Common Table Expressions", 30, ["CTE", "WITH", "readability"], "Name each step of your logic and build queries that read top to bottom.", "code", 3),
          ]),
          ch("Set Operations", "Union, intersect, and except", [
            L("UNION and UNION ALL", 25, ["UNION", "UNION ALL", "deduplicate"], "Stack results from different queries.", "code", 3),
            L("INTERSECT and EXCEPT", 25, ["INTERSECT", "EXCEPT", "set difference"], "Find shared and missing rows between result sets.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Defining and Changing Data",
        "Schema, inserts, updates, and the transaction guarantee.",
        ["Create well-constrained tables", "Modify data safely inside transactions"],
        ["write-code", "concept-check", "debug"],
        [
          ch("Types and Tables", "DDL: describing your data precisely", [
            L("CREATE TABLE and Data Types", 30, ["CREATE TABLE", "TEXT", "INTEGER", "DECIMAL"], "Choose honest types for every column.", "code", 3),
            L("Constraints", 30, ["NOT NULL", "UNIQUE", "CHECK"], "Let the database refuse bad data for you.", "code", 3),
          ]),
          ch("Modifying Data", "INSERT, UPDATE, DELETE — with care", [
            L("INSERT and Bulk Loading", 30, ["INSERT", "bulk insert", "import"], "Add rows one at a time or by the thousand.", "code", 3),
            L("UPDATE and DELETE Safely", 30, ["UPDATE", "DELETE", "WHERE discipline"], "Change and remove rows without disaster stories.", "code", 3),
          ]),
          ch("Transactions", "All-or-nothing work", [
            L("BEGIN, COMMIT, ROLLBACK", 30, ["transaction", "commit", "rollback"], "Group changes so they either all happen or none do.", "concept", 3),
            L("ACID in Practice", 25, ["ACID", "atomicity", "isolation"], "Understand the guarantees databases give you."),
          ]),
        ]
      ),
      mod(
        "Analytical SQL",
        "Window functions, indexes, and views — the analyst's power tools.",
        ["Compute running totals, rankings, and period comparisons", "Diagnose slow queries and fix them with indexes"],
        ["dataset-task", "write-code", "interpret-results"],
        [
          ch("Window Functions", "Aggregation without collapsing rows", [
            L("OVER and PARTITION BY", 35, ["OVER", "PARTITION BY", "window"], "Compute per-group values while keeping every row.", "code", 4),
            L("Running Totals and Moving Averages", 35, ["running total", "moving average", "frame"], "Track cumulative and rolling metrics over time.", "code", 4),
            L("Ranking: ROW_NUMBER, RANK, DENSE_RANK", 30, ["ROW_NUMBER", "RANK", "NTILE"], "Rank rows, break ties deliberately, and pick top-N per group.", "code", 4),
            L("LAG and LEAD", 30, ["LAG", "LEAD", "period comparison"], "Compare each row to its neighbors — growth rates and deltas.", "code", 4),
          ]),
          ch("Indexes and Performance", "Making queries fast on purpose", [
            L("How Indexes Work", 30, ["index", "B-tree idea", "seek vs scan"], "Understand the data structure behind every fast query."),
            L("Reading a Query Plan", 30, ["EXPLAIN", "query plan", "scan"], "Ask the database how it will run your query — and spot the waste.", "code", 3),
          ]),
          ch("Views and Analytics Patterns", "Reusable, readable analysis", [
            L("Creating Views", 25, ["VIEW", "virtual table", "reuse"], "Save a query as a queryable object for the whole team.", "code", 3),
            L("The Analyst's Query Patterns", 35, ["funnel query", "cohort query", "top-N"], "Assemble funnel, cohort, and top-N queries from what you know.", "worked-example", 4),
          ]),
        ]
      ),
    ],
    finalExam: exam("SQL End-of-Subject Assessment", 45, 28),
    projects: [
      proj(
        "Music Store Analytics",
        "Answer ten business questions about a music store database: top genres, best customers, sales by country, and more.",
        5,
        "guided",
        ["A queries.sql file with one clearly commented query per question", "Every query returns the expected result on the sample database", "A short write-up of one insight you found surprising"],
        ["Correct joins (no duplicated or lost rows)", "Aggregations used where set-based logic beats loops", "Readable, indented SQL with CTEs where they help"],
        ["sql", "sqlite"]
      ),
      proj(
        "Retail Churn Query Pack",
        "Build a reusable pack of churn and retention queries over an orders database — weekly cohorts, lapsed customers, first-repeat gaps.",
        6,
        "independent",
        ["Six named queries in views or a documented SQL file", "Cohort table computed with window functions", "Index recommendations with reasoning for two hot queries"],
        ["Window functions used correctly (no self-joins where a window is cleaner)", "Cohort logic verified against a hand-computed example", "Query pack runs top-to-bottom without errors"],
        ["sql", "sqlite"]
      ),
    ],
    placementEligible: true,
    keywords: ["sql", "database", "queries", "joins", "window functions"],
  },
  {
    slug: "git-github",
    school: "A",
    code: "A3",
    title: "Git and GitHub",
    blurb: "Version control, branching, and collaboration — never lose work again, and work like a team from day one.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Track every change to a project with commits",
      "Branch, merge, and resolve conflicts without fear",
      "Share work on GitHub through remotes and pull requests",
      "Follow a professional team workflow on real repositories",
    ],
    outcomes: [
      "A learner can initialize a repo, commit changes, and restore any previous version",
      "A learner can create branches, merge them, and resolve a textual conflict",
      "A learner can push to GitHub and open a reviewed pull request",
      "A learner can write commit messages and PR descriptions teammates can act on",
    ],
    modules: [
      mod(
        "Local Version Control",
        "Commits, history, and undo — the time machine every project needs.",
        ["Track and inspect changes precisely", "Undo mistakes at three different scales"],
        ["concept-check", "fill-in", "debug"],
        [
          ch("Why Version Control", "The problem Git solves", [
            L("Life Without Version Control", 20, ["version control", "backup", "history"], "Feel the pain Git eliminates: final_v2_FINAL.zip and friends."),
            L("Repositories and the Staging Area", 30, ["repository", "staging area", "commit"], "Understand working directory, staging, and history as three zones.", "code", 3),
            L("Your First Commits", 30, ["git init", "git add", "git commit"], "Create a repository and record changes deliberately.", "code", 3),
          ]),
          ch("History and Undo", "Reading the past, rewriting the recent past", [
            L("log, diff, and show", 30, ["git log", "git diff", "git show"], "Inspect who changed what, when, and why.", "code", 3),
            L("Amend and Restore", 30, ["amend", "restore", "staging undo"], "Fix the last commit and unstage or revert files safely.", "code", 3),
            L("Reverting vs Resetting", 30, ["revert", "reset", "history rewrite"], "Undo changes in public-safe and local-only ways.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Branching and GitHub",
        "Parallel work, remotes, and the pull request workflow used by every modern team.",
        ["Develop features on branches", "Collaborate through pull requests and reviews"],
        ["concept-check", "case-analysis", "debug"],
        [
          ch("Branches and Merging", "Parallel lines of development", [
            L("Creating and Switching Branches", 30, ["branch", "checkout", "switch"], "Isolate feature work from the main line.", "code", 3),
            L("Merging Branches", 30, ["merge", "fast-forward", "merge commit"], "Bring finished work back together cleanly.", "code", 3),
            L("Resolving Conflicts", 35, ["conflict", "merge conflict", "resolution"], "Walk into a conflict calmly, understand both sides, and resolve it.", "guided-practice", 4),
          ]),
          ch("Remotes and Pull Requests", "Working with GitHub", [
            L("clone, push, pull", 30, ["remote", "clone", "push", "pull"], "Move work between your machine and GitHub.", "code", 3),
            L("Forks and Branch Conventions", 25, ["fork", "naming", "branching model"], "Contribute to projects you don't own and name branches like a pro."),
            L("Pull Requests and Reviews", 30, ["pull request", "review", "approval"], "Propose changes, respond to review comments, and merge responsibly.", "concept", 3),
            L("Issues and Project Workflow", 30, ["issue", "milestone", "workflow"], "Tie commits to issues and keep a team board honest."),
          ]),
        ]
      ),
    ],
    finalExam: exam("Git & GitHub End-of-Subject Assessment", 30, 20),
    projects: [
      proj(
        "Your Learning Journal Repository",
        "Create a public GitHub repository that documents your Academy journey: notes per subject, a profile README, and at least ten meaningful commits on feature branches.",
        3,
        "guided",
        ["Public repository with a clear profile README", "Notes organized by subject in folders", "History shows branches and merged pull requests"],
        ["Commit messages follow the imperative convention", "At least one merge conflict resolved and documented", "Repository structure is navigable by a stranger"],
        ["git", "github"]
      ),
    ],
    placementEligible: true,
    keywords: ["git", "github", "version control", "collaboration"],
  },
  {
    slug: "jupyter-notebook",
    school: "A",
    code: "A4",
    title: "Jupyter Notebook",
    blurb: "The data scientist's laboratory: mix code, results, and narrative in one reproducible document.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["python"],
    softPrerequisites: [],
    objectives: [
      "Run and organize code in notebook cells with a live kernel",
      "Document analysis with markdown, math, and rich output",
      "Keep notebooks reproducible and shareable",
    ],
    outcomes: [
      "A learner can build a notebook that reads data, computes results, and explains each step",
      "A learner can restart-and-run-all a notebook to a clean, correct final state",
      "A learner can export and share a notebook as HTML or a committed repo file",
    ],
    modules: [
      mod(
        "The Notebook Environment",
        "Cells, kernels, and the run-order discipline that keeps you sane.",
        ["Execute code cell by cell with a live kernel", "Explain results with markdown documentation"],
        ["concept-check", "predict-output", "debug"],
        [
          ch("Cells and Kernels", "How a notebook breathes", [
            L("Code Cells and Output", 25, ["cell", "kernel", "execution count"], "Run code cell by cell and read execution counts as a history."),
            L("The Kernel Lifecycle", 30, ["kernel", "restart", "state"], "Understand what lives in memory, why state leaks, and how to reset cleanly.", "code", 3),
            L("Run Order Discipline", 30, ["execution order", "hidden state", "reproducibility"], "Avoid the classic trap: cells that only work in one secret order.", "guided-practice"),
          ]),
          ch("Markdown and Documentation", "Notebooks that explain themselves", [
            L("Markdown Cells", 25, ["markdown", "heading", "list"], "Write headings, lists, links, and emphasis to narrate your work.", "code"),
            L("Images, Tables, and Math", 25, ["image", "table", "LaTeX"], "Embed figures, tables, and equations alongside your code."),
          ]),
        ]
      ),
      mod(
        "Notebook Workflows",
        "Real data work: files, plots, and sharing finished analysis.",
        ["Move data in and out of notebooks", "Share reproducible results with others"],
        ["dataset-task", "concept-check", "design-review"],
        [
          ch("Data in Notebooks", "Getting real work done", [
            L("Reading Files and Inspecting Data", 30, ["read file", "inspect", "head"], "Load a CSV with pure Python and take a first honest look.", "code", 3),
            L("Plotting Inline", 30, ["inline plot", "matplotlib teaser", "output"], "Render charts directly under the cells that make them.", "code", 3),
          ]),
          ch("Sharing and Reproducibility", "Finished analysis, ready for readers", [
            L("Exporting to HTML and PDF", 25, ["export", "nbconvert", "share"], "Turn a notebook into a document anyone can open."),
            L("Best Practices Checklist", 30, ["restart-and-run-all", "naming", "cleanup"], "Apply the checklist that separates reproducible notebooks from nightmares.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Jupyter End-of-Subject Assessment", 25, 16),
    projects: [
      proj(
        "Your Data Lab Notebook",
        "Build a small analysis notebook on a dataset of your choice: load it, compute three summary statistics, chart one of them, and narrate every step in markdown.",
        2,
        "guided",
        ["Notebook runs top-to-bottom after Restart & Run All", "At least one inline chart with labeled axes", "Markdown narration between every code cell"],
        ["No hidden-state dependencies between cells", "Conclusions reference the actual computed numbers", "Clean file and folder naming"],
        ["jupyter", "python"]
      ),
    ],
    placementEligible: true,
    keywords: ["jupyter", "notebook", "reproducibility", "kernel"],
  },
  {
    slug: "programming-fundamentals",
    school: "A",
    code: "A5",
    title: "Programming Fundamentals",
    blurb: "The computer-science ideas under every language: memory, complexity, algorithms, and clean abstraction.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["python"],
    softPrerequisites: ["jupyter-notebook"],
    objectives: [
      "Explain how programs use memory and names at a mechanical level",
      "Reason about algorithm cost with Big-O intuition",
      "Implement and recognize core data structures and algorithms",
      "Design modular, testable code with clear abstractions",
    ],
    outcomes: [
      "A learner can predict how references and mutation affect a program",
      "A learner can estimate and compare the running time of two solutions",
      "A learner can implement searching, sorting, and recursion from scratch",
      "A learner can decompose a problem into functions and classes with single responsibilities",
    ],
    modules: [
      mod(
        "How Programs Work",
        "Values, memory, and the execution model — what the machine really does.",
        ["Explain where values live and how names point at them", "Trace program execution precisely"],
        ["concept-check", "predict-output", "debug"],
        [
          ch("Values and Memory", "Boxes, labels, and references", [
            L("Names Bind to Objects", 30, ["name binding", "object", "reference"], "See why two names can be one object — and how that causes surprise mutations.", "worked-example", 3),
            L("Mutability and Copies", 30, ["mutability", "shallow copy", "aliasing"], "Distinguish changing a thing from rebinding a name.", "code", 3),
          ]),
          ch("The Execution Model", "Call stacks and control flow, mechanically", [
            L("The Call Stack", 30, ["call stack", "frame", "return"], "Watch function calls stack up and unwind, frame by frame.", "worked-example"),
            L("Tracing Programs by Hand", 30, ["trace", "state table", "dry run"], "Execute code on paper to build unshakeable mental models.", "guided-practice", 4),
          ]),
        ]
      ),
      mod(
        "Data Structures",
        "Arrays, stacks, queues, and hash tables — plus the cost vocabulary to compare them.",
        ["Choose structures by their strengths and costs", "Explain growth rates in Big-O terms"],
        ["concept-check", "predict-output", "calculation"],
        [
          ch("Arrays and Lists", "Contiguous memory and indexed access", [
            L("Arrays Under the Hood", 30, ["array", "index", "contiguous memory"], "Understand why index access is instant and insertion is not."),
            L("Dynamic Lists", 30, ["dynamic array", "amortized growth", "append"], "See how Python lists grow — and what append really costs.", "concept"),
          ]),
          ch("Stacks and Queues", "Order discipline as a data structure", [
            L("Stacks: LIFO", 30, ["stack", "push", "pop", "LIFO"], "Build a stack and meet its classic uses: undo, parsing, backtracking.", "code", 3),
            L("Queues: FIFO", 30, ["queue", "enqueue", "dequeue", "FIFO"], "Build a queue and see task scheduling and buffering everywhere.", "code", 3),
          ]),
          ch("Hash Tables", "Dictionaries, demystified", [
            L("Hashing and Buckets", 30, ["hash function", "bucket", "collision"], "Understand the trick behind O(1) lookup — and its fine print."),
            L("Collisions and Load Factor", 30, ["collision", "chaining", "resize"], "Handle the messy reality every hash table must plan for.", "concept", 3),
          ]),
          ch("Big-O Thinking", "A vocabulary for cost", [
            L("Counting Operations", 30, ["operation count", "growth", "input size"], "Count steps as input grows and drop the constants.", "worked-example", 3),
            L("The Common Complexity Classes", 30, ["O(1)", "O(n)", "O(n log n)", "O(n^2)"], "Recognize the big five shapes on sight — from code and from plots.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Algorithms",
        "Searching, sorting, and recursion — the classics, implemented by you.",
        ["Implement and explain the canonical algorithms", "Break problems down recursively"],
        ["write-code", "parsons", "predict-output"],
        [
          ch("Searching", "Finding things, fast and slow", [
            L("Linear Search", 25, ["linear search", "scan", "best case"], "Implement the obvious solution and know exactly what it costs.", "code", 3),
            L("Binary Search", 35, ["binary search", "sorted input", "halving"], "Halve the problem every step — and handle the off-by-one demons.", "code", 4),
          ]),
          ch("Sorting", "Order out of chaos", [
            L("Selection and Insertion Sort", 35, ["selection sort", "insertion sort", "in-place"], "Build two simple sorts and feel their quadratic cost.", "code", 4),
            L("Merge Sort", 35, ["merge sort", "divide and conquer", "recursion"], "Meet divide-and-conquer and the n log n breakthrough.", "code", 4),
            L("Quicksort and Built-ins", 30, ["quicksort", "partition", "Timsort idea"], "Understand quicksort's gamble and why you'll use the built-in sort.", "worked-example"),
            L("Sorting in Practice", 25, ["key functions", "stability", "multi-criteria sort"], "Sort real records by multiple criteria with stable sorts.", "code", 3),
          ]),
          ch("Recursion", "Problems that contain themselves", [
            L("Recursive Functions", 30, ["recursion", "base case", "recursive case"], "Write functions that call themselves and always terminate.", "code", 4),
            L("Recursion on Data", 30, ["tree", "nested structure", "recursion depth"], "Walk nested data — the shape recursion was born for.", "code", 3),
            L("Recursion vs Iteration", 30, ["iteration", "call stack cost", "conversion"], "Convert between recursive and iterative forms deliberately.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Abstraction and Design",
        "From working code to well-designed code.",
        ["Design functions as contracts", "Organize programs into cohesive modules"],
        ["design-review", "write-code", "case-analysis"],
        [
          ch("Functions as Contracts", "Signatures, preconditions, and single responsibility", [
            L("Designing Good Signatures", 30, ["signature", "precondition", "postcondition"], "Design inputs and outputs a caller can trust at a glance.", "concept", 3),
            L("Single Responsibility", 30, ["single responsibility", "decomposition", "smell"], "Spot functions that do too much and split them honestly.", "guided-practice", 3),
          ]),
          ch("Structure and Style", "Programs a teammate can read", [
            L("Cohesion and Coupling", 30, ["cohesion", "coupling", "module design"], "Group what changes together and separate what doesn't."),
            L("Readable Code Checklist", 30, ["naming", "comments", "style guide"], "Apply the naming and layout conventions professionals expect.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Programming Fundamentals Assessment", 45, 28),
    projects: [
      proj(
        "Complexity Benchmark Lab",
        "Implement linear search, binary search, and two sorts — then measure real running times across input sizes and plot the growth curves.",
        4,
        "guided",
        ["All four algorithms implemented and tested", "Benchmark harness timing each across at least five input sizes", "One chart comparing measured growth to Big-O predictions"],
        ["Correct results (verified against sorted built-ins)", "Fair benchmarking (same inputs, repeated runs)", "Written conclusion mapping measurements to theory"],
        ["python", "matplotlib"]
      ),
      proj(
        "Build a Data Structure Library",
        "Implement Stack, Queue, and a HashTable from scratch with a clean API, docstrings, and a test suite.",
        6,
        "independent",
        ["Three classes with documented public methods", "Test suite covering normal, edge, and error cases", "Usage examples in the README"],
        ["Behavior matches Python's built-in equivalents where applicable", "Hash table handles collisions correctly", "API is consistent across the three structures"],
        ["python", "pytest"]
      ),
    ],
    placementEligible: true,
    keywords: ["computer science", "algorithms", "data structures", "complexity"],
  },
];
