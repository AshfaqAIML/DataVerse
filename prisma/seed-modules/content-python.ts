/**
 * Seed content — Python Foundations for Data Science (flagship course).
 */
import type { CourseSpec } from "./lib";

export const PYTHON_FOUNDATIONS: CourseSpec = {
  slug: "python-foundations",
  title: "Python Foundations for Data Science",
  subtitle: "From zero to writing your first data scripts",
  description:
    "Your first step into data work. Learn Python the way analysts actually use it: variables, collections, control flow, functions and files — every concept drilled with runnable code, exercises with real test cases and checkpoint quizzes. No prior programming experience needed.",
  subjectSlug: "python-programming",
  instructorEmail: "maya@dataverse.academy",
  level: "BEGINNER",
  status: "PUBLISHED",
  estimatedHours: 18,
  modules: [
    {
      title: "Python Basics",
      summary: "Syntax, variables, types and your first programs.",
      chapters: [
        {
          title: "Getting Started",
          lessons: [
            {
              title: "Why Python for Data Work",
              slug: "why-python",
              summary: "What Python is, who uses it, and why it dominates data work.",
              minutes: 10,
              previewFree: true,
              sections: [
                {
                  kind: "TEXT",
                  title: "The language of data",
                  content:
                    "Python reads almost like English, which makes it the gentlest on-ramp into programming — and one of the most powerful tools in industry. Netflix, Spotify, NASA and virtually every data team run Python in production. For you, that means every hour you invest learning it pays off twice: it is beginner-friendly **and** employers actually hire for it.",
                },
                {
                  kind: "CALLOUT",
                  title: "How this course works",
                  content:
                    "Every lesson follows the same loop: read a little, run code, pass an exercise, prove it in a checkpoint quiz. You cannot break anything — the code runner is sandboxed, so experiment freely.",
                },
                {
                  kind: "TEXT",
                  title: "What you will build",
                  content:
                    "By the end of this course you will read a sales CSV file, compute totals and averages with functions you wrote yourself, and print a small report. That is a real, portfolio-worthy script — not a toy.",
                },
              ],
            },
            {
              title: "Your First Program: print()",
              slug: "first-program",
              summary: "Run your first lines of Python and learn how output works.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "Talking to the console",
                  content:
                    "The `print()` function takes whatever you put between its parentheses and shows it to the user. It is the simplest way to check what your program is thinking — you will use it constantly while learning, and even senior data scientists still reach for `print()` when debugging a pipeline.",
                },
                {
                  kind: "CODE",
                  title: "Hello, DataVerse",
                  content: "Text in quotes is a *string* — a sequence of characters. The quotes tell Python: this is data, not code.",
                  code: [
                    {
                      filename: "hello.py",
                      language: "python",
                      code: 'print("Hello, DataVerse!")\nprint("My name is Ada and I analyze data.")',
                      explanation:
                        "Each line runs top to bottom, in order. Two print calls → two lines of output.",
                    },
                  ],
                },
                {
                  kind: "INTERACTIVE",
                  title: "Try it yourself",
                  content:
                    "In the coding lab below, change the text inside the quotes and run the cell. Notice how the output changes instantly — that feedback loop is how you will learn fastest.",
                },
              ],
              exercises: [
                {
                  title: "Greet the learner",
                  prompt:
                    'Print exactly this line so the grader can match it:\n\nHello, DataVerse!\n\nRemember: quotes around the text, parentheses around everything.',
                  starterCode: "# Print the greeting below\n",
                  solutionCode: 'print("Hello, DataVerse!")',
                  language: "python",
                  difficulty: "EASY",
                  points: 10,
                  testCases: [
                    { name: "prints the greeting", expectedOutput: "Hello, DataVerse!" },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: "Variables & Types",
          lessons: [
            {
              title: "Variables and Assignment",
              slug: "variables",
              summary: "Store values in named boxes you can reuse.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "Names that remember",
                  content:
                    "A variable is a label for a value. Write `revenue = 4200` and Python remembers it. From then on, `revenue` *is* 4200 wherever you use it. Good variable names (`monthly_revenue`, not `x`) are the cheapest documentation you will ever write.",
                },
                {
                  kind: "CODE",
                  title: "Assign, use, reassign",
                  content: "Assignment uses a single `=`. Double `==` means *compare*, which you will meet soon.",
                  code: [
                    {
                      filename: "variables.py",
                      language: "python",
                      code: 'store = "Lisbon"\nrevenue = 4200\nprint(store, "earned", revenue)\n\nrevenue = revenue + 800  # quarterly update\nprint("updated:", revenue)',
                      explanation: "Variables can be updated using their own current value — read right side first, then store.",
                    },
                  ],
                },
              ],
            },
            {
              title: "Numbers and Strings",
              slug: "numbers-strings",
              summary: "The two types you will meet most: numbers and text.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Two workhorse types",
                  content:
                    "`int` is a whole number (`42`), `float` carries decimals (`3.14`), and `str` is text (`\"hello\"`). Python picks the type from how you write the value — quotes mean string, a decimal point means float. `type(x)` reveals what you have.",
                },
                {
                  kind: "CODE",
                  title: "Types in action",
                  content: "Division always produces a float in Python 3 — even `6 / 3` is `2.0`.",
                  code: [
                    {
                      filename: "types.py",
                      language: "python",
                      code: 'units = 30          # int\nprice = 2.5         # float\nlabel = "matcha"    # str\n\ntotal = units * price\nprint(type(units), type(price), type(label))\nprint(f"{label}: {units} units x {price:.2f} = {total:.2f}")',
                      explanation: "f-strings (f\"...\") inject variables straight into text — the standard way analysts build reports.",
                    },
                  ],
                },
                {
                  kind: "CALLOUT",
                  title: "Common trap",
                  content:
                    '`"5" + 5` raises a `TypeError`: Python refuses to add text to a number. Convert first with `int("5")` or `str(5)`. Errors like this are Python protecting you, not punishing you.',
                },
              ],
              quiz: {
                title: "Checkpoint: Variables & Types",
                description: "Three quick questions before moving on.",
                passingScore: 80,
                questions: [
                  {
                    prompt: "What type does 7 / 2 produce in Python 3?",
                    kind: "MCQ",
                    options: [{ text: "int" }, { text: "float", correct: true }, { text: "str" }, { text: "bool" }],
                    explanation: "Division (/) always returns a float — 7/2 is 3.5.",
                  },
                  {
                    prompt: 'Which expression converts "42" into the number 42?',
                    kind: "MCQ",
                    options: [{ text: 'int("42")', correct: true }, { text: 'str("42")' }, { text: 'float(42)' }, { text: "42 + \"\"" }],
                    explanation: 'int() parses a string of digits into an integer.',
                  },
                  {
                    prompt: 'True or false: "5" + 5 raises a TypeError in Python.',
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "You cannot add a string to an int — convert one of them first.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Control Flow & Collections",
      summary: "Make decisions and work with lists and dictionaries.",
      chapters: [
        {
          title: "Making Decisions",
          lessons: [
            {
              title: "Booleans & Comparisons",
              slug: "booleans",
              summary: "True, False and the operators that produce them.",
              minutes: 15,
              sections: [
                {
                  kind: "TEXT",
                  title: "The atoms of logic",
                  content:
                    "Every decision in code reduces to a boolean: `True` or `False`. Comparisons (`>`, `==`, `!=`, `in`) produce booleans, and `and` / `or` / `not` combine them. Data analysis is full of questions like *is this row from March?* — booleans are how you ask them.",
                },
                {
                  kind: "CODE",
                  title: "Comparisons",
                  content: "Note the capital letters: Python booleans are True and False.",
                  code: [
                    {
                      filename: "booleans.py",
                      language: "python",
                      code: 'print(10 > 3)\nprint(2 == 2)\nprint(5 != 5)\n\nis_weekend = False\nhas_data = True\nprint(is_weekend and has_data)\nprint(is_weekend or has_data)',
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Comparison practice",
                  prompt:
                    "Print three booleans, one per line, in exactly this order:\n\n- the result of 10 > 3\n- the result of 2 == 2\n- the result of 5 != 5",
                  starterCode: "# print the three comparisons\n",
                  solutionCode: "print(10 > 3)\nprint(2 == 2)\nprint(5 != 5)",
                  language: "python",
                  difficulty: "EASY",
                  points: 10,
                  testCases: [
                    { name: "three booleans", expectedOutput: "True\nTrue\nFalse" },
                  ],
                },
              ],
            },
            {
              title: "if / elif / else",
              slug: "conditionals",
              summary: "Branch your program on conditions.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Choosing a path",
                  content:
                    "`if` runs its block only when the condition is `True`; `elif` checks another condition when the first failed; `else` catches everything left. Indentation (4 spaces) defines which lines belong to which branch — in Python, layout *is* logic.",
                },
                {
                  kind: "CODE",
                  title: "Grading a metric",
                  content: "The first matching branch wins; the rest are skipped.",
                  code: [
                    {
                      filename: "grade.py",
                      language: "python",
                      code: 'conversion = 0.07\n\nif conversion >= 0.10:\n    print("excellent")\nelif conversion >= 0.05:\n    print("solid")\nelse:\n    print("needs work")',
                      explanation: "0.07 fails the first test but passes the second, so 'solid' prints.",
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: Conditionals",
                passingScore: 80,
                questions: [
                  {
                    prompt: "What does `elif` mean?",
                    kind: "MCQ",
                    options: [
                      { text: "Another condition to test when the previous ones failed", correct: true },
                      { text: "A loop that runs forever" },
                      { text: "A function definition" },
                      { text: "An error handler" },
                    ],
                    explanation: "elif = 'else if': the next condition in the chain.",
                  },
                  {
                    prompt: "With x = 10, what prints?\n\nif x > 5: print(\"big\")\nelif x > 8: print(\"huge\")\nelse: print(\"small\")",
                    kind: "MCQ",
                    options: [
                      { text: "big", correct: true },
                      { text: "huge" },
                      { text: "small" },
                      { text: "big then huge" },
                    ],
                    explanation: "The first branch that matches runs — later branches are skipped.",
                  },
                  {
                    prompt: "True or false: an if block can be left empty (no statements) without an error.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True" }, { text: "False", correct: true }],
                    explanation: "Empty blocks are a syntax error; use `pass` as a placeholder.",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Collections",
          lessons: [
            {
              title: "Lists",
              slug: "lists",
              summary: "Ordered collections — the workhorse of data work.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Many values, one name",
                  content:
                    "A list holds an ordered sequence: `sales = [120, 85, 200]`. Indexing starts at **0**, so `sales[0]` is 120. Negative indexes count from the end (`sales[-1]` is the latest value). Slicing — `sales[1:4]` — grabs a range, which is exactly how you split a year into quarters.",
                },
                {
                  kind: "CODE",
                  title: "Indexing and slicing",
                  content: "Slices include the start index but exclude the end.",
                  code: [
                    {
                      filename: "lists.py",
                      language: "python",
                      code: 'sales = [120, 85, 200, 95, 150]\nprint(sales[0])\nprint(sales[-1])\nprint(sales[1:4])\nprint(len(sales))\nsales.append(210)\nprint(sum(sales))',
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Slice the quarter",
                  prompt:
                    "Given `sales = [120, 85, 200, 95, 150]`, print the slice with indexes 1 to 3 (the values 85, 200 and 95) using slicing notation.",
                  starterCode: "sales = [120, 85, 200, 95, 150]\n# print the slice below\n",
                  solutionCode: "sales = [120, 85, 200, 95, 150]\nprint(sales[1:4])",
                  language: "python",
                  difficulty: "EASY",
                  points: 10,
                  testCases: [
                    { name: "slice 1:4", expectedOutput: "[85, 200, 95]" },
                    { name: "hidden: type is list", expectedOutput: "[85, 200, 95]", hidden: true },
                  ],
                },
              ],
            },
            {
              title: "Dictionaries",
              slug: "dictionaries",
              summary: "Key-value pairs — label your data.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Look things up by name",
                  content:
                    'Lists use positions; dictionaries use keys. `{"city": "Lisbon", "rain_mm": 12}` maps each label to a value. Dictionaries mirror how a data row works (column name → cell value) and how JSON works — which is why APIs and config files love them.',
                },
                {
                  kind: "CODE",
                  title: "CRUD with dicts",
                  content: "Duplicate keys are not allowed — the last assignment wins.",
                  code: [
                    {
                      filename: "dicts.py",
                      language: "python",
                      code: 'prices = {"apple": 1.2, "banana": 0.5}\nprint(prices["banana"])\nprices["cherry"] = 3.0\nprint(sorted(prices))\nprint(prices.get("kiwi", 0))',
                      explanation: "get() returns a default instead of crashing on a missing key — very handy for messy data.",
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: Dictionaries",
                passingScore: 75,
                questions: [
                  {
                    prompt: "Which expression creates an empty dictionary?",
                    kind: "MCQ",
                    options: [{ text: "{}", correct: true }, { text: "[]" }, { text: "()" }, { text: '""' }],
                    explanation: "Curly braces create dicts; square braces create lists.",
                  },
                  {
                    prompt: "What happens when you assign to the same key twice?",
                    kind: "MCQ",
                    options: [
                      { text: "The last value overwrites the earlier one", correct: true },
                      { text: "Both values are kept in a list" },
                      { text: "An error is raised" },
                      { text: "A new key is auto-generated" },
                    ],
                    explanation: "Keys are unique — later assignment wins.",
                  },
                  {
                    prompt: 'What does d.get("missing", 0) return when the key is absent?',
                    kind: "MCQ",
                    options: [{ text: "0", correct: true }, { text: "None" }, { text: "KeyError" }, { text: '"missing"' }],
                    explanation: "The second argument is the default.",
                  },
                  {
                    prompt: "Which of these can NOT be used as a dictionary key?",
                    kind: "MCQ",
                    options: [{ text: "a list", correct: true }, { text: "a string" }, { text: "an integer" }, { text: "a tuple" }],
                    explanation: "Keys must be immutable (hashable); lists can change, so they are banned.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Functions & Files",
      summary: "Package logic into reusable functions and read real data files.",
      chapters: [
        {
          title: "Reusable Code",
          lessons: [
            {
              title: "Defining Functions",
              slug: "functions",
              summary: "Name a block of logic so you can reuse it.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "Write once, use everywhere",
                  content:
                    "A function packages logic under a name: inputs (parameters) go in, a `return` value comes out. Functions are how analysts avoid copy-pasting the same ten lines into every report — and how you test logic in isolation.",
                },
                {
                  kind: "CODE",
                  title: "A function of your own",
                  content: "The body is indented; return sends the result back to the caller.",
                  code: [
                    {
                      filename: "functions.py",
                      language: "python",
                      code: 'def total(a, b):\n    """Return the sum of a and b."""\n    return a + b\n\ndef average(values):\n    return sum(values) / len(values)\n\nprint(total(7, 5))\nprint(average([2, 4, 6]))',
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Write your first function",
                  prompt:
                    "Define a function `total(a, b)` that returns the sum, then print `total(7, 5)`. Expected output: 12",
                  starterCode: "def total(a, b):\n    # your code here\n    pass\n\nprint(total(7, 5))\n",
                  solutionCode: "def total(a, b):\n    return a + b\n\nprint(total(7, 5))",
                  language: "python",
                  difficulty: "MEDIUM",
                  points: 20,
                  testCases: [
                    { name: "prints 12", expectedOutput: "12" },
                    { name: "hidden: works with floats", expectedOutput: "12" },
                  ],
                },
              ],
            },
            {
              title: "Loops",
              slug: "loops",
              summary: "Repeat work across collections without copy-paste.",
              minutes: 20,
              sections: [
                {
                  kind: "TEXT",
                  title: "for and while",
                  content:
                    "A `for` loop visits each item of a collection in order — the pattern behind 'for each row in the dataset'. `while` repeats as long as a condition holds. `break` exits early, `continue` skips to the next item.",
                },
                {
                  kind: "CODE",
                  title: "Looping a report",
                  content: "range(3) produces 0, 1, 2 — the stop value is excluded, exactly like slicing.",
                  code: [
                    {
                      filename: "loops.py",
                      language: "python",
                      code: 'stores = ["Lisbon", "Pune", "Nairobi"]\nfor store in stores:\n    print("report:", store)\n\nfor i in range(3):\n    print("day", i)',
                    },
                  ],
                },
              ],
              quiz: {
                title: "Checkpoint: Loops",
                passingScore: 80,
                questions: [
                  {
                    prompt: "How many times does `for i in range(3):` run its body?",
                    kind: "MCQ",
                    options: [
                      { text: "3", correct: true },
                      { text: "2" },
                      { text: "4" },
                      { text: "Infinite" },
                    ],
                    explanation: "range(3) yields 0, 1, 2 — three iterations.",
                  },
                  {
                    prompt: "Which statement skips the rest of the current iteration and continues with the next?",
                    kind: "MCQ",
                    options: [
                      { text: "continue", correct: true },
                      { text: "break" },
                      { text: "pass" },
                      { text: "return" },
                    ],
                    explanation: "continue jumps to the next iteration; break leaves the loop entirely.",
                  },
                  {
                    prompt: "True or false: `while True:` without a break runs forever.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "The condition never becomes False — you need break (or an error) to stop it.",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Working with Data Files",
          lessons: [
            {
              title: "Reading CSV Files",
              slug: "reading-csv",
              summary: "Load your first real dataset — the analyst's hello-world.",
              minutes: 25,
              sections: [
                {
                  kind: "TEXT",
                  title: "CSV: the lingua franca of data",
                  content:
                    "CSV (comma-separated values) is everywhere: exports, banks, sensors, spreadsheets. Python's `csv` module turns each line into a list of strings. In the pandas course you will meet `read_csv()` — a superpowered version of exactly this.",
                },
                {
                  kind: "CODE",
                  title: "Count the rows",
                  content: "The first row is usually the header — that's why we subtract 1.",
                  code: [
                    {
                      filename: "read_csv.py",
                      language: "python",
                      code: 'import csv\n\n# imagine stdin/file contains:\n# name,sales\n# A,10\n# B,20\nrows = [["name", "sales"], ["A", "10"], ["B", "20"]]\nprint(len(rows) - 1)',
                      explanation: "In the exercise the grader pipes a real CSV into your program on stdin.",
                    },
                  ],
                },
              ],
              exercises: [
                {
                  title: "Count CSV data rows",
                  prompt:
                    "A CSV arrives on standard input. The first line is a header; the rest are data rows. Read it with the csv module and print ONLY the number of data rows (an integer).",
                  starterCode: "import sys\nimport csv\n\n# your code here\n",
                  solutionCode:
                    'import sys\nimport csv\n\nrows = list(csv.reader(sys.stdin))\nprint(len(rows) - 1)',
                  language: "python",
                  difficulty: "MEDIUM",
                  points: 20,
                  testCases: [
                    {
                      name: "three data rows",
                      input: "name,sales\nA,10\nB,20\nC,30",
                      expectedOutput: "3",
                    },
                    {
                      name: "hidden: single data row",
                      input: "name,sales\nZ,5",
                      expectedOutput: "1",
                      hidden: true,
                    },
                  ],
                },
              ],
            },
            {
              title: "Mini-project: Sales Summary",
              slug: "sales-summary",
              summary: "Combine everything: read, compute, report.",
              minutes: 30,
              sections: [
                {
                  kind: "TEXT",
                  title: "Your first pipeline",
                  content:
                    "You now have every piece: read rows, convert types, loop, branch, aggregate, format with f-strings. This lesson walks through a complete sales summary script — then the capstone project asks you to build one yourself.",
                },
                {
                  kind: "CODE",
                  title: "The whole loop",
                  content: "This is the shape of almost every analysis script you will ever write.",
                  code: [
                    {
                      filename: "summary.py",
                      language: "python",
                      code: 'rows = [("Lisbon", 120), ("Pune", 85), ("Nairobi", 200)]\n\ndef report(rows):\n    total = sum(v for _, v in rows)\n    best = max(rows, key=lambda r: r[1])\n    print(f"total: {total}")\n    print(f"best: {best[0]} ({best[1]})")\n\nreport(rows)',
                    },
                  ],
                },
                {
                  kind: "CALLOUT",
                  title: "Ready for the capstone",
                  content:
                    "Finish the quiz below, then open the Capstone project from the course page. Everything you submit is reviewed against a rubric — a great first portfolio piece.",
                },
              ],
              quiz: {
                title: "Checkpoint: Files & Capstone Prep",
                passingScore: 80,
                questions: [
                  {
                    prompt: "What does csv.reader produce for each line?",
                    kind: "MCQ",
                    options: [
                      { text: "A list of strings, one per field", correct: true },
                      { text: "A dictionary per line" },
                      { text: "One big string" },
                      { text: "A tuple of integers" },
                    ],
                    explanation: "reader splits each line on the delimiter; all values start as strings.",
                  },
                  {
                    prompt: "Why prefer `with open(...) as f:` over open()/close()?",
                    kind: "MCQ",
                    options: [
                      { text: "The file is always closed, even if an error happens", correct: true },
                      { text: "It reads files faster" },
                      { text: "It converts CSV to JSON" },
                      { text: "It is the only way to read a file" },
                    ],
                    explanation: "The context manager guarantees cleanup — a core habit for reliable pipelines.",
                  },
                  {
                    prompt: "True or false: sum() works on a list of numbers.",
                    kind: "TRUE_FALSE",
                    options: [{ text: "True", correct: true }, { text: "False" }],
                    explanation: "sum(), min(), max() all take iterables of numbers.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  project: {
    title: "Capstone: Sales Data Summary Report",
    brief:
      "Read the provided sales CSV (store, product, units, unit_price), compute per-store totals, the overall average order value and the best-selling product, and print a clean text report. Submit your code through the project workspace.",
    requirements: [
      "Parse the CSV defensively (skip malformed rows)",
      "Compute per-store revenue and overall AOV",
      "Identify the top product by units sold",
      "Format the report with f-strings",
      "Explain one data-quality decision you made in the notes",
    ],
    difficulty: "BEGINNER",
    points: 100,
  },
};
