/**
 * PART J — PYTHON FOR DATA SCIENCE
 *
 * The destination of the course: everything from Parts A–I becomes real
 * data work. Lesson order: numerical operations -> CSV and JSON -> APIs
 * (simulated honestly, no network) -> Jupyter -> the full data-processing
 * pipeline, closed by the course capstone mini project.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Machine-dependent or third-party material (pip installs, Jupyter sessions,
 * NumPy and requests syntax) uses lang "bash"/"text" and is shown for
 * orientation only — never presented as executed course code. All executed
 * code is stdlib-only and file I/O uses /tmp, so it runs in the verifier
 * AND in the browser playground.
 */
import type { Part } from "@/lib/course/types";

export const PART_J: Part = {
  letter: "J",
  title: "Python for Data Science",
  tagline: "Your first real data workflow",
  description:
    "Numerical operations, CSV and JSON, APIs, Jupyter, and data processing — where everything you learned becomes real data work.",
  lessons: [
    // ------------------------------------------------------------- j-01
    {
      slug: "j-01",
      title: "Numerical Operations",
      minutes: 16,
      summary:
        "Data work is numbers in lists: the built-in toolkit revisited, the statistics module, the three patterns analysts rebuild weekly, money-safe floats, and an honest first look at NumPy.",
      kind: "concept",
      objectives: [
        "Combine len, sum, min, max and round into derived metrics like range and average",
        "Summarize a list of numbers with the statistics module: mean, median, stdev, mode, quartiles",
        "Build the three daily analyst patterns by hand: normalize, moving average, percent change",
        "Apply the float precision rule to money: round cents at display time, or count integer cents",
        "Explain what NumPy is and why it exists — while keeping your own executed code stdlib-only",
      ],
      why: "Every interesting dataset is, at its core, numbers in a list: daily sales, temperatures, response times, prices. Before you touch any fancy library, you need fluency with the numerical toolkit you already own — the built-ins that summarize, the statistics module that thinks in distributions, and the three list patterns analysts rebuild every single week. This lesson turns tools you met one at a time in Parts A and B into a working analyst's kit, and shows you how to keep money safe from the floating-point surprise you first met in the REPL back in Part A.",
      blocks: [
        {
          kind: "text",
          text: "Nine parts ago you printed `\"Hello, future programmer!\"` and that was a real achievement. Today the lists of numbers are the job itself. Data work has a rhythm: someone hands you a list of numbers, and you ask it the same first questions every single time — *how many? how much in total? what was best? what was worst? what is typical?* In this lesson you will assemble the toolkit that answers all five, then push one level deeper into the questions analysts ask second: *how spread out? how does it compare? how did it change?*",
        },
        {
          kind: "code",
          title: "The first five questions, answered",
          code: `daily_sales = [1420, 1180, 1690, 1330, 1875, 1240, 1610]

print("days        :", len(daily_sales))
print("total units :", sum(daily_sales))
print("best day    :", max(daily_sales))
print("worst day   :", min(daily_sales))
print("range       :", max(daily_sales) - min(daily_sales))
print("average day :", round(sum(daily_sales) / len(daily_sales), 2))
`,
          output: `days        : 7
total units : 10345
best day    : 1875
worst day   : 1180
range       : 695
average day : 1477.86`,
          outputNote: "Real output, produced by running this exact code with Python 3.12.",
          explain: [
            "You met every one of these built-ins in Part B. What is new is the *combination*: range is `max - min`, and the average is `sum / len`, rounded to 2 places so it reads like a number a human wrote.",
            "Check the average by hand: 10345 divided by 7 is 1477.857… — `round(..., 2)` turns it into `1477.86`. Rounding happens only at display time; the underlying value stays exact.",
            "This is the analyst's opening move on any new list: six lines, five questions answered. You will type some version of this block hundreds of times in your data life.",
          ],
        },
        {
          kind: "table",
          title: "The built-in numerical toolkit",
          headers: ["Built-in", "Question it answers", "On our 7 sales days"],
          rows: [
            ["len(numbers)", "How many?", "7"],
            ["sum(numbers)", "How much in total?", "10345"],
            ["max(numbers)", "What was best?", "1875"],
            ["min(numbers)", "What was worst?", "1180"],
            ["round(x, 2)", "How do I show this to a human?", "1477.86"],
          ],
          caption:
            "Five built-ins, zero imports. Together they answer the first five questions of any dataset.",
        },
        {
          kind: "heading",
          text: "The statistics module: questions about spread",
        },
        {
          kind: "text",
          text: "The built-ins answer *typical* with one number: the **mean** (sum divided by count). But the mean has a weakness — it is pulled around by outliers. If a billionaire walks into a bar, the *mean* wealth in the room is suddenly 50 million, but the *median* (the middle value when sorted) barely moves. Data people report the **median** whenever a few extreme values would distort the mean. The statistics module, which you import like any module from Part G, gives you both, plus **standard deviation** (how spread out the numbers are) and **quartiles** (the values at the 25%, 50% and 75% marks).",
        },
        {
          kind: "code",
          title: "Ten days of morning temperatures",
          code: `import statistics

temps = [12, 15, 14, 18, 21, 19, 17, 16, 20, 18]

print("mean     :", statistics.mean(temps))
print("median   :", statistics.median(temps))
print("stdev    :", round(statistics.stdev(temps), 2))
print("mode     :", statistics.mode(temps))
print("quartiles:", statistics.quantiles(temps))
`,
          output: `mean     : 17
median   : 17.5
stdev    : 2.79
mode     : 18
quartiles: [14.75, 17.5, 19.25]`,
          explain: [
            "**mean** — 170 total degrees across 10 days gives 17. The number most people call \"the average\".",
            "**median** — sorted, the list is 12, 14, 15, 16, 17, 18, 18, 19, 20, 21; the two middle values are 17 and 18, so the median is 17.5. Half the days were cooler, half warmer.",
            "**stdev** — about 2.79 degrees. Small stdev means the days cluster near the mean; a stdev of 10 would mean wild swings. Note it needs at least two data points — `statistics.stdev([5])` raises a StatisticsError.",
            "**mode** — 18, the only value that appears twice.",
            "**quartiles** — the boundaries that split the data into four equal bands: a quarter of the days were below 14.75, a quarter between 14.75 and 17.5, and so on up to 19.25.",
          ],
        },
        {
          kind: "heading",
          text: "Three patterns analysts rebuild every week",
        },
        {
          kind: "code",
          title: "Pattern 1 — normalize (stretch values into 0 to 1)",
          code: `scores = [42, 55, 68, 74, 91]

lowest = min(scores)
highest = max(scores)

normalized = [round((s - lowest) / (highest - lowest), 2) for s in scores]

print("raw        :", scores)
print("normalized :", normalized)
`,
          output: `raw        : [42, 55, 68, 74, 91]
normalized : [0.0, 0.27, 0.53, 0.65, 1.0]`,
          explain: [
            "Normalization maps every value onto a 0-to-1 scale: the minimum becomes 0.0, the maximum becomes 1.0, and everything else lands in between proportionally.",
            "The formula is `(value - lowest) / (highest - lowest)` — distance from the bottom, divided by the total span. Check 55: `(55 - 42) / (91 - 42)` is 13/49, about 0.27.",
            "The list comprehension is the one you met in Part G — no loops needed, and each result is rounded to 2 places for a clean report.",
            "Why normalize? So two datasets measured on different scales (say, exam scores 0–100 and salaries 0–100,000) become comparable.",
          ],
        },
        {
          kind: "code",
          title: "Pattern 2 — moving average (smooth out the noise)",
          code: `visitors = [120, 135, 150, 145, 160, 170, 155]

averages = []
for i in range(len(visitors) - 2):
    window = visitors[i : i + 3]
    averages.append(round(sum(window) / 3, 1))

print("daily    :", visitors)
print("3-day MA :", averages)
`,
          output: `daily    : [120, 135, 150, 145, 160, 170, 155]
3-day MA : [135.0, 143.3, 151.7, 158.3, 161.7]`,
          explain: [
            "Daily numbers are noisy; a **moving average** replaces each day with the average of itself and its neighbors, so trends become visible.",
            "The slice `visitors[i : i + 3]` is a 3-day window — slicing from Part B, doing real work. `range(len(visitors) - 2)` stops the window from running off the end: 7 days give 5 windows.",
            "Check the first one: (120 + 135 + 150) / 3 = 135.0 exactly. The daily dip on the last day (155) is softened to 161.7 — the trend survived, the noise did not.",
          ],
        },
        {
          kind: "code",
          title: "Pattern 3 — percent change (compare periods fairly)",
          code: `revenue_2024 = 48000
revenue_2025 = 54000

change = (revenue_2025 - revenue_2024) / revenue_2024 * 100

print(f"revenue 2024 : {revenue_2024:,}")
print(f"revenue 2025 : {revenue_2025:,}")
print(f"change       : {change:+.1f}%")
`,
          output: `revenue 2024 : 48,000
revenue 2025 : 54,000
change       : +12.5%`,
          explain: [
            "\"Revenue grew by 6,000\" means nothing without the base: 6,000 on 48,000 is a fine year; 6,000 on 4.8 million is a rounding error. Percent change = `(new - old) / old * 100`.",
            "Here 6000 / 48000 is exactly 0.125, so the change is +12.5%.",
            "Two f-string tricks worth stealing: `:,` inserts thousands separators, and `:+.1f` forces a plus sign on positive numbers — so growth reads `+12.5%` and decline reads `-3.4%`, both unambiguous.",
          ],
        },
        {
          kind: "heading",
          text: "Money: the float rule from Part A, applied for real",
        },
        {
          kind: "text",
          text: "You met this in the REPL in Part A and it has not gone away: `0.1 + 0.2` is `0.30000000000000004`, because computers store decimals in binary. For a report this is cosmetic; for money it is a liability. The two working rules: **round at display time** with `round(x, 2)` or `f\"{x:.2f}\"`, and for anything that must be exact — invoices, ledgers, totals that get compared — **count cents as integers** and divide by 100 only when displaying.",
        },
        {
          kind: "code",
          title: "The same cart, the two money strategies",
          code: `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)

cart = [4.35, 2.30, 0.05]
print("float total   :", sum(cart))
print("rounded       :", round(sum(cart), 2))

cents = [435, 230, 5]
total_cents = sum(cents)
print("integer cents :", total_cents, "->", f"{total_cents / 100:.2f}")
`,
          output: `0.30000000000000004
False
float total   : 6.699999999999999
rounded       : 6.7
integer cents : 670 -> 6.70`,
          explain: [
            "Line 1 is the Part A ghost again — binary floating-point cannot represent 0.1 exactly, so the sum comes out four quintillionths too big.",
            "The cart shows the real-world version: three innocent prices sum to `6.699999999999999`. A customer should never see that; `round(total, 2)` fixes the display at 6.7.",
            "The cents strategy avoids the problem entirely: 435 + 230 + 5 = 670 exactly — integers never drift. Divide by 100 only at display time and you get `6.70` with two decimals.",
            "Rule of thumb: floats for measurement, integers for money.",
          ],
        },
        {
          kind: "text",
          text: "**NumPy: the professional upgrade.** Every pattern above runs a Python loop over a Python list, which is perfect up to hundreds of thousands of numbers. Real data science sometimes has millions, and that is what **NumPy** is for: its `ndarray` stores numbers in one compact block and applies operations to *the whole array at once* in compiled C code — no Python loop. NumPy is a third-party library you install with `pip`, so in this course it appears only in display blocks like the one below, shown for orientation: it runs wherever NumPy is installed, and the outputs shown were produced on such a machine. The ideas are the ones you just built by hand.",
        },
        {
          kind: "code",
          title: "The same statistics, the NumPy way (shown for orientation — not executed in this course)",
          lang: "text",
          code: `import numpy as np

temps = np.array([12, 15, 14, 18, 21, 19, 17, 16, 20, 18])

print(temps.mean())   # 17.0
print(temps.max())    # 21
print(temps.std())    # 2.65  (population stdev — note: statistics.stdev gave 2.79,
                      #  because it computes the *sample* stdev; know your formula!)

doubled = temps * 2   # no loop, no comprehension — the whole array at once
print(doubled)        # [24 30 28 36 42 38 34 32 40 36]`,
          explain: [
            "`temps * 2` doubling a whole array without a loop is called **vectorization** — the single biggest idea NumPy adds.",
            "The honest fine print: `ndarray.std()` defaults to the population formula while `statistics.stdev` uses the sample formula, so they disagree slightly on the same data. Professionals read the docs before they trust a statistic.",
            "Everything in this course stays stdlib-only so every executed line runs identically in the verifier and in your browser playground. When you install NumPy yourself one day, this block is exactly what your code will look like.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — the weekly-hours summary",
          task: "This block summarizes one person's weekly study hours. Add two more lines: the median (statistics.median) and the standard deviation rounded to 2 places (statistics.stdev). Then change the list to add an 8th week of 60 hours and watch which of the printed statistics moves the most.",
          code: `import statistics

weekly_hours = [36, 41, 38, 44, 40, 37, 42]

print("weeks tracked :", len(weekly_hours))
print("total hours   :", sum(weekly_hours))
print("average       :", round(statistics.mean(weekly_hours), 1))
`,
          hint: "The two new lines look exactly like the mean line, with median and stdev in place of mean. With the 60-hour week added, the mean and stdev jump — the median barely moves.",
        },
      ],
      terms: [
        { term: "Mean", definition: "The arithmetic average: sum of the values divided by how many there are." },
        { term: "Median", definition: "The middle value when the data is sorted; half the values lie below it, half above. Resists outliers." },
        { term: "Standard deviation", definition: "A measure of spread: roughly how far a typical value sits from the mean. Small means clustered, large means scattered." },
        { term: "Quartiles", definition: "The three values that split sorted data into four equal bands, at the 25%, 50% and 75% marks." },
        { term: "Moving average", definition: "A smoothing technique: each point replaced by the average of a fixed-size window of neighboring points." },
      ],
      mistakes: [
        {
          mistake: "Averaging an empty list with sum(items) / len(items).",
          why: "sum([]) is 0 and len([]) is 0, so the division is 0 / 0 and Python raises ZeroDivisionError — a classic crash the moment a filter removes every row.",
          fix: "Check `if items:` first, or call statistics.mean(items) — it raises statistics.StatisticsError: mean requires at least one data point, which names the real problem.",
        },
        {
          mistake: "Comparing money totals with ==, like if total == 6.7.",
          why: "The stored total is 6.699999999999999, not 6.7 — binary floats rarely land exactly on decimal values, so the comparison is False even when the math is right.",
          fix: "Round before comparing, or work in integer cents where == is exact. This is the Part A float rule, now with money on the line.",
        },
        {
          mistake: "Printing raw floats in a report: 'Total: 6.699999999999999'.",
          why: "print shows the full stored value, precision dust and all, which reads as a bug to anyone looking at the report.",
          fix: "Format at display time with f\"{total:.2f}\" — one character pair that turns a liability into a clean 6.70.",
        },
        {
          mistake: "Calling statistics.stdev on a single number.",
          why: "Spread is undefined for one value; Python answers statistics.StatisticsError: stdev requires at least two data points.",
          fix: "Guard with a length check, or treat single-value groups as 'not enough data' in the report.",
        },
      ],
      takeaways: [
        "The first five questions of any dataset — how many, how much, best, worst, typical — are len, sum, max, min and round working together.",
        "Report the median when outliers pull the mean: a billionaire changes the mean of a bar, not its median.",
        "Normalize, moving average and percent change are just loops and arithmetic — you already own every part.",
        "Money: round at display time, or better, count integer cents and divide by 100 only when printing.",
        "NumPy vectorizes the same ideas for millions of numbers — an upgrade you can install later, not a new way of thinking.",
      ],
      quiz: [
        {
          id: "j-01-q1",
          prompt: "A company's 99 employees earn 40k a year and the CEO earns 4 million. Which number best describes a typical salary?",
          options: [
            { text: "The mean — it uses every value", correct: false, feedback: "It does use every value, which is exactly the problem: one 4 million salary drags the mean up to about 79k, describing nobody." },
            { text: "The median — the middle value resists the outlier", correct: true, feedback: "Correct — the middle salary stays around 40k, which is the honest description of typical." },
            { text: "The mode — the most common value", correct: false, feedback: "With 99 near-equal salaries, the mode is fragile and may not exist at all; the median is the standard choice for skewed money data." },
          ],
          explanation: "Outliers own the mean; the median ignores them. For salaries, house prices and response times, report the median.",
        },
        {
          id: "j-01-q2",
          prompt: "Predict the output: print(round(2.675, 2))",
          options: [
            { text: "2.68", correct: false, feedback: "That is what decimal math gives — but 2.675 is stored as 2.67499999… in binary, and Python rounds the value it actually stores." },
            { text: "2.67", correct: true, feedback: "Right — the stored value is a hair under 2.675, so rounding lands on 2.67. The float rule from Part A strikes again." },
            { text: "2.7", correct: false, feedback: "round(x, 2) keeps two decimals, so it can only choose 2.67 or 2.68 — the surprise is which one." },
          ],
          explanation: "round() rounds the binary value, not the decimal you typed: 2.675 is really 2.674999…, so round(2.675, 2) is 2.67.",
        },
        {
          id: "j-01-q3",
          prompt: "Revenue moved from 40,000 to 50,000. Which line computes the percent change correctly?",
          options: [
            { text: "(50000 - 40000) / 50000 * 100", correct: false, feedback: "That divides by the NEW value — 20% — which is the percentage of the new total, not the growth from the old one." },
            { text: "(50000 - 40000) / 40000 * 100", correct: true, feedback: "Correct: difference over the OLD base, times 100 — 10000/40000, a clean +25%." },
            { text: "50000 / 40000 * 100", correct: false, feedback: "That is 125% — the new revenue as a percentage of the old, not the change. Close cousin, different question." },
          ],
          explanation: "Percent change is always (new - old) / old * 100. The base is where you started, not where you arrived.",
        },
      ],
    },

    // ------------------------------------------------------------- j-02
    {
      slug: "j-02",
      title: "Working with CSV and JSON",
      minutes: 16,
      summary:
        "The two formats real data arrives in: read and write CSV with the csv module (DictReader and DictWriter), then parse, navigate, format and persist JSON — all through /tmp files, all verified.",
      kind: "coding",
      objectives: [
        "Choose between CSV and JSON for a given dataset, and say why",
        "Write a CSV file with csv.DictWriter and read it back with csv.DictReader, including fields that contain commas",
        "Parse JSON text with json.loads and navigate nested dict-of-lists-of-dicts structures",
        "Format Python data as JSON text with json.dumps and indent, and persist it to a file with json.dump / json.load",
        "Convert incoming string values to numbers on the way in",
      ],
      why: "Real data does not arrive as Python literals. It arrives as files on disk and as text over the network, and two formats carry nearly all of it: CSV, the language of spreadsheets and database exports, and JSON, the language of APIs and configuration. Every dataset you will ever touch — a bank statement, a weather service, a game's save file — speaks one of these two. This lesson teaches both sides of both formats: writing and reading, saving and loading, so data can round-trip through /tmp files exactly the way it will round-trip through real systems later.",
      blocks: [
        {
          kind: "text",
          text: "In Part G you learned to open, read and write files. Now meet what actually lives inside them. **CSV** (*comma-separated values*) is the spreadsheet format: one table, plain text, one row per line, commas between columns. **JSON** (*JavaScript Object Notation*) is the nested format: dictionaries, lists, strings, numbers, booleans — the exact shapes you have been building since Part E, serialized as text. Between them they carry most of the world's data, and they are good at different jobs.",
        },
        {
          kind: "table",
          title: "CSV vs JSON — which one and when",
          headers: ["", "CSV", "JSON"],
          rows: [
            ["Shape", "One flat table: rows and columns", "Nested: dicts of lists of dicts, any depth"],
            ["Typical source", "Spreadsheet exports, database dumps", "API responses, config files, save files"],
            ["Human reading", "Opens directly in Excel", "Needs indentation to be readable"],
            ["Types", "Everything is text — convert on the way in", "Real types survive: numbers, booleans, null"],
            ["Python module", "csv", "json"],
          ],
          caption:
            "Flat table with numbers? CSV. Nested structure with anything mixed in? JSON. Real pipelines speak both.",
        },
        {
          kind: "heading",
          text: "CSV: why you never parse it by hand",
        },
        {
          kind: "text",
          text: "CSV looks so simple that every beginner tries `line.split(\",\")` — and it works, right up until a field *contains* a comma. A product called `\"Mouse, wireless\"` is one column, but it is written between quotes, and splitting on commas shreds it. This is not a rare edge case; it is why the `csv` module exists. Watch the hand-rolled version break on a perfectly legal CSV line:",
        },
        {
          kind: "code",
          title: "The manual approach meets a quoted comma",
          code: `line = '2025-03-02,"Mouse, wireless",5,24.50'

fields = line.split(",")
print("field count:", len(fields))
for field in fields:
    print(repr(field))
`,
          output: `field count: 5
'2025-03-02'
'"Mouse'
' wireless"'
'5'
'24.50'`,
          explain: [
            "The line has 4 columns, but split counted 5 — the quoted product name was torn into two pieces, quotes and all.",
            "Every downstream step now misaligns: 'units' would be read as ` wireless\"`, and the math would crash with a ValueError.",
            "The quotes are part of the CSV *specification* (RFC 4180): fields containing commas are wrapped in double quotes. Splitting on commas cannot respect that rule — parsing needs to track quote state, which is exactly what the csv module does for you.",
          ],
        },
        {
          kind: "heading",
          text: "The csv module: a round-trip through /tmp",
        },
        {
          kind: "code",
          title: "Write with DictWriter, read back with DictReader",
          code: `import csv

rows = [
    {"date": "2025-03-01", "product": "Laptop", "units": 3, "unit_price": 999.0},
    {"date": "2025-03-02", "product": "Mouse, wireless", "units": 5, "unit_price": 24.5},
    {"date": "2025-03-03", "product": "Keyboard", "units": 2, "unit_price": 79.0},
]

FIELDS = ["date", "product", "units", "unit_price"]

with open("/tmp/sales.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(rows)

with open("/tmp/sales.csv") as f:
    raw = f.read()
print("--- /tmp/sales.csv on disk ---")
print(raw)
print("--- read back with DictReader ---")

with open("/tmp/sales.csv") as f:
    for row in csv.DictReader(f):
        revenue = int(row["units"]) * float(row["unit_price"])
        print(f'{row["date"]}  {row["product"]:<16}{revenue:>9.2f}')
`,
          output: `--- /tmp/sales.csv on disk ---
date,product,units,unit_price
2025-03-01,Laptop,3,999.0
2025-03-02,"Mouse, wireless",5,24.5
2025-03-03,Keyboard,2,79.0

--- read back with DictReader ---
2025-03-01  Laptop            2997.00
2025-03-02  Mouse, wireless    122.50
2025-03-03  Keyboard           158.00`,
          outputNote: "The blank line after the raw dump is real: print(raw) ends with the file's trailing newline, then print adds its own.",
          explain: [
            "**DictWriter** takes dicts and a `fieldnames` list, writes the header row, then `writerows` writes one CSV line per dict. On disk, `\"Mouse, wireless\"` comes out quoted — and that is correct CSV.",
            "`newline=\"\"` in the open call is the csv module's official requirement on write — it stops Windows from doubling the line endings.",
            "**DictReader** reads the first line as column names, then hands you each row as a *dict* keyed by those names — the lists-of-dicts shape from Part E, straight from a file.",
            "The crucial catch: every value arrives as a **string**. `row[\"units\"]` is `\"5\"`, not 5, so the revenue line converts with `int(...)` and `float(...)` before multiplying. Forget that and `\"5\" * 999.0` is a TypeError.",
            "The quoted comma survived the round-trip perfectly — one row, four fields, revenue 122.50 (5 x 24.5).",
          ],
        },
        {
          kind: "heading",
          text: "JSON: your data structures, serialized",
        },
        {
          kind: "text",
          text: "JSON is what Python data looks like when written down as text: `{}` for dicts, `[]` for lists, strings in double quotes, numbers bare. Three small translation rules matter — JSON's `true` and `false` become Python's `True` and `False`, JSON's `null` becomes `None`, and keys are always strings. The block below embeds a JSON string in triple quotes, exactly the way an API response will arrive in the next lesson — then parses it and navigates the nesting, dict of lists of dicts, which is just the Part E structures wearing a new name:",
        },
        {
          kind: "code",
          title: "json.loads: from text to Python data",
          code: `import json

API_TEXT = '''
{
  "store": "DataVerse Mart",
  "open": true,
  "products": [
    {"id": "P1", "name": "Laptop", "price": 999.0, "stock": 12},
    {"id": "P2", "name": "Phone", "price": 699.0, "stock": 30},
    {"id": "P3", "name": "Watch", "price": 299.0, "stock": 45}
  ]
}
'''

data = json.loads(API_TEXT)

print("store  :", data["store"])
print("open   :", data["open"])
print("first  :", data["products"][0]["name"])

total_stock = 0
for product in data["products"]:
    total_stock += product["stock"]

print("items  :", len(data["products"]))
print("stock  :", total_stock)
`,
          output: `store  : DataVerse Mart
open   : True
first  : Laptop
items  : 3
stock  : 87`,
          explain: [
            "**loads = load string**: it takes JSON *text* and returns real Python data — here a dict with three keys, one of which holds a list of dicts.",
            "Note the type translation: `\"open\": true` in JSON became `True` — a genuine Python bool, ready for if-statements.",
            "Navigation is pure Part E: `data[\"products\"]` is the list, `[0]` picks the first product, `[\"name\"]` digs into that dict. The chain reads left to right like a path.",
            "The loop is the accumulation pattern you have used since Part D: total_stock ends at 12 + 30 + 45 = 87.",
          ],
        },
        {
          kind: "code",
          title: "json.dumps: from Python data back to text",
          code: `import json

record = {"city": "Lisbon", "days": 3, "temps": [18.5, 21.0, 19.5]}

compact = json.dumps(record)
pretty = json.dumps(record, indent=2)

print(compact)
print("---")
print(pretty)
`,
          output: `{"city": "Lisbon", "days": 3, "temps": [18.5, 21.0, 19.5]}
---
{
  "city": "Lisbon",
  "days": 3,
  "temps": [
    18.5,
    21.0,
    19.5
  ]
}`,
          explain: [
            "**dumps = dump string**: the mirror image of loads — any dict, list, string, number, bool or None becomes JSON text.",
            "The first version is compact: one line, minimal bytes — this is what machines send each other.",
            "`indent=2` pretty-prints: one key per line, nested lists stepped in by two spaces. This is what you hand to a human, or commit next to code as a config file.",
            "The pair to remember: **loads/dumps work with strings; load/dump work with files** — coming next.",
          ],
        },
        {
          kind: "code",
          title: "Persistence: json.dump and json.load with a real file",
          code: `import json

settings = {"theme": "dark", "fontsize": 12, "autosave": True}

with open("/tmp/settings.json", "w") as f:
    json.dump(settings, f, indent=2)

with open("/tmp/settings.json") as f:
    loaded = json.load(f)

print(loaded)
print("fontsize + 6 =", loaded["fontsize"] + 6)
print("autosave is", type(loaded["autosave"]).__name__)
`,
          output: `{'theme': 'dark', 'fontsize': 12, 'autosave': True}
fontsize + 6 = 18
autosave is bool`,
          explain: [
            "`json.dump(data, f)` writes to an already-open file — the same `with open(...)` discipline from Part G. No trailing `s`, because the destination is a file, not a string.",
            "`json.load(f)` reads it back, and the types survive the trip: fontsize comes back as the integer 12 (so `+ 6` is 18, real arithmetic), and autosave comes back as an actual bool.",
            "Compare with CSV, where everything arrives as text: JSON preserves types. That single difference decides many format choices.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The two gotchas that bite every beginner",
          text: "First: CSV values are always strings — `row[\"units\"]` is `\"5\"`, so convert with int() or float() before doing math, or you will concatenate instead of add. Second: JSON keys are always strings — even if you dump `{1: \"a\"}`, it comes back as `{\"1\": \"a\"}`. Index with `data[\"1\"]`, not `data[1]`, or you get a KeyError.",
        },
        {
          kind: "tryIt",
          title: "Try it — the menu round-trip",
          task: "The block writes a cafe menu to /tmp/menu.csv. Complete it: read the file back with csv.DictReader, print each item with its price (remember: prices arrive as strings — convert with float), and print the average price rounded to 2 places.",
          code: `import csv

menu = [
    {"item": "Espresso", "price": 2.20},
    {"item": "Flat white", "price": 3.50},
    {"item": "Cortado", "price": 2.80},
]

FIELDS = ["item", "price"]

with open("/tmp/menu.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(menu)

print("menu written to /tmp/menu.csv")
print("now read it back with DictReader and print each item")
`,
          hint: "Open with open(\"/tmp/menu.csv\") and loop over csv.DictReader(f). Convert with float(row[\"price\"]). Average = sum of float prices / 3, rounded to 2 places — here 2.83.",
        },
      ],
      terms: [
        { term: "CSV", definition: "Comma-separated values: a plain-text table format with one record per line and commas between fields; the standard spreadsheet export format." },
        { term: "JSON", definition: "JavaScript Object Notation: a text format for nested data — dicts, lists, strings, numbers, booleans and null — used by APIs and config files." },
        { term: "Serialization", definition: "Turning live in-memory data structures into text (or bytes) that can be saved or sent, and later reconstructed. json.dumps serializes; json.loads deserializes." },
        { term: "Delimited field", definition: "A CSV field containing special characters (like a comma), written between double quotes so parsers treat it as one value." },
        { term: "Pretty-printing", definition: "Formatting serialized data with indentation and line breaks so humans can read it — json.dumps(data, indent=2)." },
      ],
      mistakes: [
        {
          mistake: "Parsing CSV with line.split(\",\").",
          why: "Quoted fields may contain commas, so a legal 4-column line splits into 5 pieces and every column after it misaligns — the crash appears far away from the cause.",
          fix: "Always use the csv module. It implements the quoting rules; that is its entire job.",
        },
        {
          mistake: "Doing math on values straight out of a CSV row.",
          why: "DictReader returns every field as a string, so row[\"units\"] * 2 glues text (\"5\" * 2 is \"55\") and row[\"units\"] + 1 raises a TypeError.",
          fix: "Convert on the way in: int(row[\"units\"]), float(row[\"price\"]). One line per field, right after reading.",
        },
        {
          mistake: "Mixing up json.loads and json.load.",
          why: "They differ by one letter and one input: loads takes a string, load takes an open file. Calling loads on a file object raises TypeError.",
          fix: "The s means string — loads/dumps for strings, load/dump for files. Say it out loud once; it sticks.",
        },
        {
          mistake: "Writing JSON with json.dump(...) and reading the file later to find one unreadable line.",
          why: "By default json output has no whitespace at all — compact is correct for machines and miserable for humans.",
          fix: "Add indent=2 whenever a human might open the file. It costs a few bytes and saves an afternoon.",
        },
      ],
      takeaways: [
        "CSV is for flat tables, JSON is for nested data — most real pipelines speak both.",
        "Never parse CSV by hand: quoted commas are why the csv module exists, and DictReader/DictWriter speak dicts directly.",
        "Everything from a CSV row arrives as a string — convert to int or float on the way in.",
        "JSON is your Part E data structures as text: true/false become True/False, null becomes None, and types survive the round-trip.",
        "loads/dumps handle strings; load/dump handle files. The s is for string.",
      ],
      quiz: [
        {
          id: "j-02-q1",
          prompt: "A CSV row is read with DictReader and printed with print(row[\"units\"] * 3). The file contains 4 in that column. What is printed?",
          options: [
            { text: "12", correct: false, feedback: "That would be true if units were the integer 4 — but CSV values arrive as text." },
            { text: "444", correct: true, feedback: "Correct — row[\"units\"] is the string \"4\", and string * 3 repeats it: \"444\". This is the classic CSV gotcha." },
            { text: "A TypeError", correct: false, feedback: "Multiplying a string by an integer is legal Python — it repeats the string. No error, just a wrong-looking answer." },
          ],
          explanation: "CSV has no types: every field is a string, so \"4\" * 3 is \"444\". Convert with int() before doing math.",
        },
        {
          id: "j-02-q2",
          prompt: "After data = json.loads('{\"ok\": true, \"count\": 7}'), what is data[\"ok\"]?",
          options: [
            { text: "The string \"true\"", correct: false, feedback: "JSON's true is not kept as text — json.loads translates it into a Python value." },
            { text: "The boolean True", correct: true, feedback: "Exactly — JSON true/false become Python True/False, ready for if-statements, no comparison to strings needed." },
            { text: "None", correct: false, feedback: "None is the translation of JSON null — a different value entirely." },
          ],
          explanation: "JSON booleans become real Python booleans; null becomes None; numbers become int or float. Types survive the trip.",
        },
        {
          id: "j-02-q3",
          prompt: "Which call writes a Python dict to an already-open file object f?",
          options: [
            { text: "json.dumps(settings, f)", correct: false, feedback: "dumps takes one argument and returns a string — it never touches a file." },
            { text: "json.dump(settings, f, indent=2)", correct: true, feedback: "Correct — dump writes to the file, and indent=2 keeps it human-readable." },
            { text: "json.load(settings, f)", correct: false, feedback: "load is the reader — it loads data FROM a file, not into one." },
          ],
          explanation: "dump writes to files, dumps returns a string. The s is for string, and it is the difference between the two pairs.",
        },
      ],
    },

    // ------------------------------------------------------------- j-03
    {
      slug: "j-03",
      title: "APIs",
      minutes: 16,
      summary:
        "What an API is (the waiter analogy), requests and status codes, JSON as the shared language, API keys kept safe in environment variables — and the complete request-to-report workflow, simulated offline with an embedded response.",
      kind: "concept",
      objectives: [
        "Explain what an API is using the restaurant analogy: request, response, and the menu in between",
        "Read a requests.get() example and describe what every part does (shown, not executed — no network needed)",
        "Interpret the common HTTP status codes and react to them with if/elif before trusting any data",
        "Keep API keys out of your code with environment variables and os.environ.get()",
        "Run the full API workflow — parse, validate, process, report — on an embedded JSON response",
      ],
      why: "Almost every interesting dataset lives behind an API: weather, prices, maps, payments, sports. If you can work with an API response, the whole internet's data becomes your data source. The catch for a course: real requests need a network, and neither this course's verifier nor the browser playground has one. So this lesson teaches the workflow the honest way — with a real API response embedded in the code as a JSON string, exactly as it would arrive from the wire. Every skill you practice here (parsing, checking the status, validating the payload, processing, reporting) transfers one-to-one the day you install the requests library.",
      blocks: [
        {
          kind: "text",
          text: "**API** stands for *Application Programming Interface*, and the standard mental model is a restaurant. You (your program) sit at a table. The kitchen (some server on the internet) holds everything: the weather data, the product catalog, the payment system. You never walk into the kitchen. Instead, the waiter — the API — takes your **request**, carries it to the kitchen, and returns with a **response**. The menu is the API's *documentation*: it lists what you may order (endpoints), how to order it (the request format), and what arrives on the plate (the response format).",
        },
        {
          kind: "visual",
          title: "One round trip",
          ascii: `   YOUR PROGRAM                      THE API (waiter)             THE SERVER (kitchen)

   request  ------->  "GET /v1/forecast?city=Lisbon"  ------->  looks up Lisbon
                                                        <-------  JSON text of the
   response <-------  status 200 OK + JSON body        <-------  forecast data

   your code:          parse the JSON,          the server:   where the data
   asks, waits,        validate it,             actually       actually lives
   receives            process, report          computes
`,
          caption: "Every API call is this loop: request out, response in. The JSON you parse in step two is exactly the format from j-02.",
        },
        {
          kind: "heading",
          text: "Anatomy of a request",
        },
        {
          kind: "text",
          text: "A request is three things: a **method** (what kind of order), a **URL endpoint** (which kitchen station), and optional **data** (your specifics — which city, which page, what search term). The main methods form a small vocabulary that API designers call **REST** thinking: read a resource, create one, change one, delete one.",
        },
        {
          kind: "table",
          title: "The four everyday HTTP methods",
          headers: ["Method", "Kitchen translation", "Data example"],
          rows: [
            ["GET", "I would like to SEE this — reading never changes anything", "GET /v1/forecast?city=Lisbon"],
            ["POST", "I am GIVING you something new to store", "POST /v1/orders with an order in the body"],
            ["PUT", "Replace what I ordered — update this thing", "PUT /v1/orders/42 with corrected data"],
            ["DELETE", "Take this back — remove it", "DELETE /v1/orders/42"],
          ],
          caption: "GET is the one you will use 90% of the time as a data analyst: reading data changes nothing.",
        },
        {
          kind: "text",
          text: "Every response starts with a **status code** — a three-digit number that is the kitchen's first sentence: *here is your food*, *no such dish*, *who are you*, *the kitchen is on fire*. You check it before you parse anything, because parsing the body of a failed request is like eating the error page.",
        },
        {
          kind: "table",
          title: "The status codes worth memorizing",
          headers: ["Code", "Means", "What you do"],
          rows: [
            ["200 OK", "Success — here is your data", "Parse the JSON body"],
            ["201 Created", "Success — your POST made something new", "Read the new resource, often with its id"],
            ["400 Bad Request", "Your request was malformed", "Fix your code, not the server"],
            ["401 Unauthorized", "Missing or bad credentials (API key)", "Check your key / how you send it"],
            ["404 Not Found", "No such endpoint or resource", "Check the URL spelling and the id"],
            ["429 Too Many Requests", "You are asking too fast (rate limit)", "Slow down, wait and retry later"],
            ["500 Internal Server Error", "The kitchen is on fire — their bug", "Nothing to fix on your side; retry later"],
          ],
          caption: "2xx success, 4xx your side of the table, 5xx their side. That one line will orient you in any API error.",
        },
        {
          kind: "heading",
          text: "The requests library, shown honestly",
        },
        {
          kind: "text",
          text: "Python's standard library can make web requests, but nobody uses it directly — the whole ecosystem uses a third-party library called `requests`, installed with `pip install requests`. Like NumPy in j-01, it is not available in this course's verified environment (there is no network here), so it appears in display blocks, shown for orientation — this is exactly what your code will look like where the library is installed:",
        },
        {
          kind: "code",
          title: "A real API call with requests (shown for orientation — not executed in this course)",
          lang: "text",
          code: `import os
import requests

# 1. the endpoint: which kitchen station
url = "https://api.example-weather.com/v1/forecast"

# 2. your specifics: query parameters
params = {"city": "Lisbon", "days": 3}

# 3. who you are: the API key, read from the environment (never the code!)
headers = {"X-API-Key": os.environ.get("WEATHER_API_KEY", "")}

# 4. the request itself
response = requests.get(url, params=params, headers=headers)

# 5. check the status BEFORE trusting the body
if response.status_code == 200:
    data = response.json()          # parses the JSON body (like json.loads)
    print(data["forecast"][0]["high"])
else:
    print("Request failed with status", response.status_code)`,
          explain: [
            "`requests.get(url, params=..., headers=...)` is the whole call: method GET, endpoint, your query parameters, and your credentials.",
            "`params={\"city\": \"Lisbon\"}` becomes the `?city=Lisbon` part of the URL — requests builds the query string for you.",
            "`response.status_code` is the three-digit number from the table above; `response.json()` parses the body — the same json.loads skill from j-02.",
            "The one line that matters most is the order: **status first, body second**. Successful paths parse; failed paths report.",
          ],
        },
        {
          kind: "heading",
          text: "API keys: the security rule, non-negotiable",
        },
        {
          kind: "text",
          text: "Most real APIs need to know *who is asking*, so they issue you an **API key**: a long random string that acts as your ID card. Here is the rule that separates professionals from disaster: **the key never appears in your code**. Code gets copied into chat messages, screenshots, and — worst of all — public git repositories, where bots harvest committed keys within minutes. The professional pattern: the key lives in an **environment variable**, and the code reads it at runtime with `os.environ.get()`:",
        },
        {
          kind: "code",
          title: "Reading a secret the safe way",
          code: `import os

key = os.environ.get("DATAVERSE_DEMO_KEY")
print("key from environment:", key)

if key is None:
    print("no key set -> a real program would stop here")
else:
    print("key found -> use it, never print it")
`,
          output: `key from environment: None
no key set -> a real program would stop here`,
          outputNote: "Real output with no DATAVERSE_DEMO_KEY set in the environment — the normal, safe state on any machine.",
          explain: [
            "`os.environ` is a dict of the environment the program runs in; `.get()` returns the variable's value, or None if it is not set.",
            "On your own machine you would set the variable first — in the terminal: `export WEATHER_API_KEY=\"abc123\"` (macOS/Linux) — then this same code finds it.",
            "Notice the program checks for None and *stops* instead of sending an empty key. Failing fast with a clear message beats a mysterious 401 from the server.",
            "The key is read once at startup and used in the request — it is never printed, logged, or written to a file.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One leaked key story, told in every security training",
          text: "A developer pastes an API key into code to 'test quickly', commits it to a repository, and pushes. Bots scan public repositories for keys continuously — that one is typically used within minutes, and the bill (or the data breach) lands with the key's owner. Rotating the key fixes the leak; the habit of never writing keys in code prevents it. Environment variables, always.",
        },
        {
          kind: "heading",
          text: "The full workflow — simulated, and completely real",
        },
        {
          kind: "steps",
          title: "Every API data task, in six steps",
          items: [
            "**Request** — send the request (here: we already have the response, embedded as a JSON string, exactly as it arrives from the wire).",
            "**Status** — check the status before anything else; error status means stop, report, no parsing.",
            "**Parse** — turn the JSON text into Python data with json.loads.",
            "**Validate** — check the payload's shape: required fields present, values usable; skip and log what is not.",
            "**Process** — compute what you actually care about with the skills from j-01 and j-02.",
            "**Report** — print a clean summary; a number nobody can read did not happen.",
          ],
        },
        {
          kind: "code",
          title: "A weather API response, end to end — no network needed",
          code: `import json

RESPONSE = '''
{
  "status": "ok",
  "request_id": "req-8241",
  "city": "Lisbon",
  "forecast": [
    {"day": "Mon", "high": 28, "low": 17, "condition": "sunny"},
    {"day": "Tue", "high": 26, "low": 16, "condition": "cloudy"},
    {"day": "Wed", "high": 24, "low": 15, "condition": "rain"},
    {"day": "Thu", "low": 15, "condition": "fog"}
  ]
}
'''

# Step 1: parse the response body (it arrives as TEXT) into Python data
data = json.loads(RESPONSE)

# Step 2: validate before trusting - check the status first
if data.get("status") != "ok":
    print("request failed - stop here")
else:
    forecast = data["forecast"]
    usable = []
    for day in forecast:
        if "high" in day and "low" in day:
            usable.append(day)
        else:
            print("incomplete entry skipped:", day.get("day", "??"))

    # Step 3: process - averages from the usable entries
    highs = [day["high"] for day in usable]
    lows = [day["low"] for day in usable]
    avg_high = sum(highs) / len(highs)
    avg_low = sum(lows) / len(lows)

    # Step 4: report
    print("request :", data["request_id"])
    print("city    :", data["city"])
    print("days    :", len(usable), "of", len(forecast))
    print("avg high:", round(avg_high, 1))
    print("avg low :", round(avg_low, 1))
`,
          output: `incomplete entry skipped: Thu
request : req-8241
city    : Lisbon
days    : 3 of 4
avg high: 26.0
avg low : 16.0`,
          explain: [
            "The response is a JSON string in triple quotes — byte for byte the shape a real server sends. Everything after `json.loads` is *exactly* what you will write with the real requests library.",
            "The status check uses `data.get(\"status\")` — .get() returns None instead of raising KeyError if the field is missing, which is precisely what you want when the response itself might be broken.",
            "Real data has holes: Thursday is missing its high. The validation loop skips it *with a message* — silent skipping is how bad data poisons reports silently.",
            "Only after validation does the processing run: averages over the 3 usable days (26.0 and 16.0), and the report states its own honesty — 3 of 4 days.",
            "When you graduate to real requests, only Step 0 changes (response = requests.get(...), data = response.json()). Steps 1–4 are identical.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — the Osaka forecast",
          task: "The embedded response below is a forecast for Osaka, with one day damaged. Complete the program: parse it, skip the incomplete day with a message, then print the city, the number of usable days, and the average high rounded to 1 place.",
          code: `import json

RESPONSE = '''
{
  "status": "ok",
  "city": "Osaka",
  "forecast": [
    {"day": "Mon", "high": 31, "low": 24},
    {"day": "Tue", "high": 33, "low": 25},
    {"day": "Wed", "high": 29, "low": 23},
    {"day": "Thu", "high": 30, "low": null}
  ]
}
'''

data = json.loads(RESPONSE)
print("city:", data["city"])
`,
          hint: "An entry is usable when its high and low are both present and not None — check with `day.get(\"high\") is not None`. The average high of 31, 33 and 29 is 31.0.",
        },
      ],
      terms: [
        { term: "API", definition: "Application Programming Interface: the waiter between your program and a server — you send requests, it returns responses, and the documentation is the menu." },
        { term: "Endpoint", definition: "A specific URL an API exposes for one kind of request, like /v1/forecast — one station in the kitchen." },
        { term: "Status code", definition: "The three-digit first sentence of every HTTP response: 200 OK, 404 Not Found, 401 Unauthorized, 500 server error." },
        { term: "API key", definition: "A secret string identifying you to an API. It lives in environment variables, never in code." },
        { term: "Environment variable", definition: "A named value provided by the system to every program, read in Python with os.environ.get() — the standard hiding place for secrets." },
      ],
      mistakes: [
        {
          mistake: "Pasting the API key directly into the source code.",
          why: "Code is copied, screenshotted, and committed to repositories where bots harvest keys within minutes — the leak is usually invisible until the bill arrives.",
          fix: "Store the key in an environment variable and read it with os.environ.get(\"KEY_NAME\"). The code stays shareable forever.",
        },
        {
          mistake: "Parsing the response body without checking the status code.",
          why: "A failed request often returns HTML or a JSON error object, so data[\"forecast\"] raises KeyError — or worse, silently processes an error message as data.",
          fix: "Check the status first (with requests: response.status_code; in a payload: the status field), and only parse what confirmed success returns.",
        },
        {
          mistake: "Assuming every entry in the payload is complete and well-formed.",
          why: "Real APIs return holes — null fields, missing keys, empty lists — and one bad entry can crash a loop that worked in testing.",
          fix: "Validate each entry (check required fields with in or .get()), skip what fails, and log what was skipped so the report states its own coverage.",
        },
        {
          mistake: "Writing the request URL by hand with query strings glued on.",
          why: "Hand-built URLs break on spaces, special characters, and any change in parameters — string-building query strings is a known source of 400 errors.",
          fix: "Use the library's parameter support (requests' params={...}) or build query strings with proper encoding — never f-string a URL together.",
        },
      ],
      takeaways: [
        "An API is a waiter: you request from the menu (endpoints), the kitchen (server) responds, and JSON is the plate everything arrives on.",
        "The status code is the response's first sentence — 2xx means parse, 4xx means your side broke, 5xx means theirs did.",
        "API keys live in environment variables, read with os.environ.get(), and never in code. Not once, not 'just to test'.",
        "The workflow is always: request, status, parse, validate, process, report — and validation skips bad entries loudly, not silently.",
        "Everything after json.loads is identical whether the response came from the network or from an embedded string — which is why you can practice the whole workflow offline.",
      ],
      quiz: [
        {
          id: "j-03-q1",
          prompt: "Your API call returns status 401. What happened, and where do you look first?",
          options: [
            { text: "The server crashed — their bug, nothing to do", correct: false, feedback: "A server crash is 500. 401 is about you, not them." },
            { text: "Your credentials are missing or invalid — check how your API key is sent", correct: true, feedback: "Correct — 401 Unauthorized means the server did not recognize you: missing key, wrong header, or expired key." },
            { text: "The endpoint does not exist — you misspelled the URL", correct: false, feedback: "That is 404 Not Found — 'no such dish'. 401 is 'who are you'." },
          ],
          explanation: "4xx codes point at your side of the table: 401 is identification, 404 is addressing, 400 is your request's shape.",
        },
        {
          id: "j-03-q2",
          prompt: "Where does a professional keep the API key a program needs?",
          options: [
            { text: "In a constant at the top of the file, so it is easy to find", correct: false, feedback: "Easy for you to find is easy for bots to find — committed keys get harvested within minutes." },
            { text: "In an environment variable, read with os.environ.get()", correct: true, feedback: "Exactly — the secret stays outside the code, and the same code runs safely in any repository." },
            { text: "In a comment next to the request, in case you forget it", correct: false, feedback: "A comment is still in the file — and everything in the file leaks with the file." },
          ],
          explanation: "Environment variables keep secrets out of code: the program reads the key at runtime, and the code remains safe to share, commit and teach.",
        },
        {
          id: "j-03-q3",
          prompt: "The response arrives, and you want tomorrow's forecast. What do you check FIRST?",
          options: [
            { text: "data[\"forecast\"][1][\"high\"] — go straight to the value", correct: false, feedback: "That is trusting the payload before reading its first sentence — if the request failed, there is no forecast to index." },
            { text: "The status — only parse the body after it confirms success", correct: true, feedback: "Correct — status first, parse second. Errors get reported, never parsed." },
            { text: "The request_id — every response must be logged first", correct: false, feedback: "Logging is good practice, but it comes after the safety check — a request_id on a failed request does not give you data." },
          ],
          explanation: "Status, then parse, then validate, then process. The order is the safety system.",
        },
      ],
    },

    // ------------------------------------------------------------- j-04
    {
      slug: "j-04",
      title: "Jupyter",
      minutes: 12,
      summary:
        "What Jupyter notebooks are and why data people live in them: cells, interleaved prose, and last-expression display — plus the decision table for notebooks vs scripts and the hidden-state trap that bites everyone once.",
      kind: "setup",
      objectives: [
        "Explain what a Jupyter notebook is: cells of code and prose running in one live kernel",
        "Describe last-expression display — the notebook feature the REPL hinted at in Part A",
        "Decide between a notebook and a script using a concrete decision table",
        "Install and launch Jupyter from the terminal (shown as terminal sessions)",
        "Recognize hidden state and repair a confused notebook with Restart & Run All",
      ],
      why: "Here is a truth about real data teams: exploration happens in notebooks, and production happens in scripts. If you walk into a data job tomorrow, the first tool your colleagues open is a Jupyter notebook — not a .py file. Notebooks earned that place by matching how analysis actually works: try something, look at it, write a sentence about what you noticed, try the next thing. This lesson shows you notebooks honestly — cells, prompts, the display magic, and the single trap (hidden state) that bites every single beginner exactly once — so the tool holds no surprises when you meet it for real.",
      blocks: [
        {
          kind: "text",
          text: "You met Python's instant-feedback loop in Part A: the REPL, where you type a line and see its answer immediately. A **Jupyter notebook** is that loop, promoted: instead of one line at a time in a terminal, you work in **cells** — small blocks of code you run one at a time, in any order, with the output appearing directly under each cell. Between code cells you write **markdown cells** — prose, headings, even formulas — so your analysis reads like a lab notebook: here is what I loaded, here is what I saw, here is what I tried next, here is the conclusion. That interleaving is why data people live here: the notebook *is* the analysis, narrative and evidence together.",
        },
        {
          kind: "heading",
          text: "What a notebook looks like",
        },
        {
          kind: "text",
          text: "Cells show their history: `In [1]` means 'this cell ran first', `Out[1]` shows what it produced. Below is a real first session, shown for orientation — every output shown is exactly what Python produces for that code (you will run the same logic as a verified script in a moment). The cell marked *markdown* renders as formatted prose, not code:",
        },
        {
          kind: "code",
          title: "A first notebook session (shown for orientation — Jupyter output, not course-verified)",
          lang: "text",
          code: `[markdown]   ## Regional sales — first look
             Loaded three regions. Quick totals, then find the leader.

In [1]: regions = {"North": 12480, "South": 9350, "East": 10810}

In [2]: regions
Out[2]: {'North': 12480, 'South': 9350, 'East': 10810}

In [3]: total = sum(regions.values())

In [4]: total
Out[4]: 32640

In [5]: best_region = None
        best_revenue = 0
        for name, revenue in regions.items():
            if revenue > best_revenue:
                best_region = name
                best_revenue = revenue
        best_region
Out[5]: 'North'

[markdown]   North leads with 12,480 of the 32,640 total (38%).
             Next: check whether that holds week by week.`,
          explain: [
            "In [2] and In [4] contain a bare expression — no print() — yet values appear as Out lines. That is last-expression display, the notebook's signature feature.",
            "In [5] ran a four-line loop, and only the final line (best_region) was displayed — the notebook shows the LAST expression of the cell, nothing else.",
            "The markdown cells hold the story: a human reading top to bottom sees narrative, code, and results woven together — the lab-notebook format that made Jupyter the standard for data exploration.",
          ],
        },
        {
          kind: "heading",
          text: "Last-expression display — and its trap",
        },
        {
          kind: "text",
          text: "The magic has a boundary, and it matters: auto-display happens **only** for the last expression of a notebook cell — and only *in* a notebook. In a script, a bare expression does nothing at all. Run the next block and see nothing; that silence is the lesson:",
        },
        {
          kind: "code",
          title: "A bare expression, run as a script",
          code: `sales = [3, 1, 4, 1, 5]

# In a Jupyter notebook, this cell would DISPLAY the list.
sales
`,
          output: ``,
          outputNote: "Really empty — run it yourself. A bare expression produces no output in a script; only a notebook displays it.",
          explain: [
            "The value exists — sales holds [3, 1, 4, 1, 5] — but a script has no 'display the last expression' feature.",
            "This is why habits built purely in notebooks can quietly break in scripts: code that 'worked' (showed output) prints nothing when moved to a .py file.",
          ],
        },
        {
          kind: "code",
          title: "The same value, printed explicitly",
          code: `sales = [3, 1, 4, 1, 5]

print(sales)
print("total:", sum(sales))
`,
          output: `[3, 1, 4, 1, 5]
total: 14`,
          explain: [
            "print() works everywhere — notebook, script, REPL — which is why this course has used it from the very first program in Part A.",
            "Rule of thumb: use bare expressions for quick looks in a notebook; use print() the moment the output matters or the code might become a script.",
          ],
        },
        {
          kind: "heading",
          text: "Notebooks vs scripts: the decision",
        },
        {
          kind: "table",
          title: "Which tool for which job",
          headers: ["Question", "Notebook", "Script (.py)"],
          rows: [
            ["Am I exploring, looking, trying things?", "Yes — built for exactly this", "Slow fit: edit-save-run the whole file"],
            ["Will this run on a schedule / in production?", "No — notebooks are for humans", "Yes — scripts are for machines"],
            ["Do I want prose, plots and code together?", "Yes — markdown cells", "Only comments"],
            ["Do I need the result to be reproducible top-to-bottom?", "Risky — cells can run out of order", "Yes — one file, one run order"],
            ["Am I building functions for reuse (Part F)?", "Draft them here", "Yes — this is where they live"],
          ],
          caption:
            "The professional rhythm: explore in a notebook, then graduate the working logic into functions in a script. You will do exactly this in the j-05 pipeline.",
        },
        {
          kind: "heading",
          text: "Installing and launching (terminal session, shown not executed)",
        },
        {
          kind: "code",
          title: "From zero to a running notebook",
          lang: "bash",
          code: `# install the classic notebook environment (once per machine)
pip install notebook

# launch it — this opens your browser at a local address
jupyter notebook

# or install the bigger, newer environment (most data teams' choice)
pip install jupyterlab
jupyter lab`,
          explain: [
            "Both commands start a local server and open your browser — the notebook interface is a web page, but everything runs on your machine.",
            "New notebook files get the extension .ipynb (IPython notebook, the historical name). They are actually JSON files inside — open one in an editor and see j-02's format holding your whole notebook.",
          ],
        },
        {
          kind: "text",
          text: "Where do notebooks run? Three answers, all common. **JupyterLab** is the full environment data teams install locally. **VS Code** opens .ipynb files directly — your Part A editor already speaks notebook, with cells runnable the same way. And **Google Colab** runs notebooks in the browser with zero installation, including the NumPy and pandas libraries preinstalled — which makes it the gentlest place to try j-01's NumPy block for real.",
        },
        {
          kind: "heading",
          text: "When notebooks hurt: hidden state",
        },
        {
          kind: "code",
          title: "The confusion every notebook beginner meets (shown for orientation)",
          lang: "text",
          code: `In [1]: bonus = 40
In [2]: total = 100 + bonus
In [3]: total
Out[3]: 140                       # correct: cells ran in order

# ...you change your mind about the bonus, and re-run ONLY cell [1]...
In [1]: bonus = 60
# ...then check the total again:
In [3]: total
Out[3]: 140                       # 140?! You set bonus to 60!

# cell [2] never re-ran, so total still holds the OLD calculation.
# The page looks complete. The state is stale.`,
          explain: [
            "A notebook is one live Python process (the **kernel**) that remembers every variable you ever defined. What a variable equals depends on *execution order*, not page order.",
            "You re-ran cell [1], so bonus is 60 — but total was computed once, in cell [2], and nothing recomputed it. The page still shows a plausible-looking 140.",
            "This is why the decision table said scripts win on reproducibility: a script has exactly one run order — top to bottom — and no stale surprises.",
          ],
        },
        {
          kind: "text",
          text: "The repair is one menu item, and using it is a professional habit: **Restart & Run All** — wipe the kernel's memory and run every cell top to bottom in order. If the notebook still produces the answer after a clean restart, the answer was real; if it breaks, you just found hidden state before your reader did. Senior analysts press it before sharing any notebook, every time.",
        },
        {
          kind: "tryIt",
          title: "Try it — think in cells",
          task: "This block is written notebook-style: three 'cells' separated by comments, runnable top to bottom as one script. Practice the notebook mindset: cover cells 2 and 3, predict their output from cell 1 alone, then run all. Then add a cell 4 that prints the average price (2 decimals).",
          code: `prices = [2.20, 3.50, 2.80, 4.10]

# --- cell 1: the data ---
print("prices :", prices)

# --- cell 2: quick stats ---
print("count  :", len(prices))
print("total  :", round(sum(prices), 2))

# --- cell 3: the extremes ---
print("cheapest:", min(prices))
print("priciest:", max(prices))
`,
          hint: "Cell 4 is one line: print(\"average:\", round(sum(prices) / len(prices), 2)). Predicting cells before running them is exactly how professionals read notebooks.",
        },
      ],
      terms: [
        { term: "Notebook", definition: "A document of interleaved code cells and markdown cells, executed one cell at a time — the standard format for data exploration." },
        { term: "Cell", definition: "One block of a notebook: either code to execute or markdown to render. Cells run individually, in any order." },
        { term: "Kernel", definition: "The live Python process behind a notebook. It remembers every variable from every cell you have run — see hidden state." },
        { term: "Hidden state", definition: "Everything the kernel remembers that the page does not show: variables set by earlier runs, making execution order — not page order — determine results." },
        { term: "Restart & Run All", definition: "The notebook repair move: wipe the kernel and execute every cell top to bottom, proving the page is reproducible." },
      ],
      mistakes: [
        {
          mistake: "Running cells out of order and trusting the results.",
          why: "The kernel keeps every variable ever defined, so cell results depend on execution order — a stale variable from an earlier experiment silently answers a later cell.",
          fix: "When anything looks impossible, Restart & Run All. Make it a reflex before trusting or sharing a notebook.",
        },
        {
          mistake: "Relying on last-expression display for output that matters.",
          why: "Bare expressions display only in notebooks, only for the cell's last line — move the code into a script and it prints nothing.",
          fix: "Use print() the moment output matters or the code might graduate into a .py file.",
        },
        {
          mistake: "Redefining the same variable name across unrelated cells.",
          why: "Every cell shares one kernel: reusing names like data or total means a later cell silently overwrites an earlier one's meaning, even pages apart.",
          fix: "Give cells' variables specific names (sales_data, region_totals), and define the important ones once, near the top.",
        },
        {
          mistake: "Doing production work in notebooks.",
          why: "Notebooks shine for exploration but reproduce poorly (hidden state), run awkwardly on schedules, and review badly in teams.",
          fix: "Explore in the notebook, then graduate the proven logic into functions in a .py script — the Part F discipline, applied to data.",
        },
      ],
      takeaways: [
        "A notebook is cells — code and markdown interleaved — running in one live kernel: a lab notebook that computes.",
        "The last expression of a cell displays automatically in a notebook, and nowhere else — scripts need print().",
        "Notebooks explore; scripts produce. Explore in cells, then graduate the logic into functions.",
        "Hidden state is the trap: execution order beats page order. Restart & Run All is the repair and the proof.",
        "JupyterLab, VS Code and Google Colab all run the same .ipynb files — and Colab has NumPy preinstalled for j-01's next step.",
      ],
      quiz: [
        {
          id: "j-04-q1",
          prompt: "Why do data people prefer notebooks for exploration?",
          options: [
            { text: "Notebooks run Python faster than scripts do", correct: false, feedback: "Same interpreter, same speed — the value is in the workflow, not performance." },
            { text: "Prose, code and results interleave: each cell's output sits under the code, with narrative between", correct: true, feedback: "Exactly — the notebook reads like a lab journal: what I loaded, what I saw, what I concluded." },
            { text: "Notebooks have no bugs, unlike scripts", correct: false, feedback: "Notebooks add a whole bug category scripts lack: hidden state." },
          ],
          explanation: "Notebooks won data work by matching the rhythm of analysis: try, look, write it down, try the next thing.",
        },
        {
          id: "j-04-q2",
          prompt: "In a notebook, you run cell [1], then cell [2] (which uses cell [1]'s variable), then edit cell [1] and re-run only it. What does cell [2]'s variable now equal?",
          options: [
            { text: "The new value — editing cell [1] updates everything downstream", correct: false, feedback: "Editing a cell does nothing until you run it — and running it changes only what that cell computes." },
            { text: "The old value — cell [2] holds its earlier calculation until you re-run it", correct: true, feedback: "Correct — the kernel keeps cell [2]'s old result. Execution order, not page order, decides the state." },
            { text: "It is deleted — re-running a cell clears later cells", correct: false, feedback: "Nothing is cleared; the kernel just accumulates. Later cells keep their stale values." },
          ],
          explanation: "Hidden state in one sentence: a variable equals whatever the last *executed* assignment made it — the page layout is irrelevant.",
        },
        {
          id: "j-04-q3",
          prompt: "A .py script contains the single line: sales = [3, 1, 4, 1, 5] (and nothing else). You run it. What appears on screen?",
          options: [
            { text: "[3, 1, 4, 1, 5]", correct: false, feedback: "That is notebook behavior — last-expression display. Scripts have no such feature." },
            { text: "Nothing — assignments produce no output", correct: true, feedback: "Correct: the variable is created, the script ends, nothing is printed. Even the REPL would stay quiet for an assignment." },
            { text: "An error, because print() is required", correct: false, feedback: "No error — just silence. print() is required for *output*, not for legality." },
          ],
          explanation: "Output needs print() in scripts. Bare expressions display only in notebooks — the boundary you proved in this lesson.",
        },
      ],
    },

    // ------------------------------------------------------------- j-05
    {
      slug: "j-05",
      title: "Data Processing",
      minutes: 20,
      summary:
        "The capstone: a complete analyst pipeline on a realistic, slightly broken dataset — load, validate, transform, aggregate, analyze, and report — built stage by stage from everything in Parts A through I.",
      kind: "coding",
      objectives: [
        "Describe the six-stage analyst pipeline: load, validate, transform, aggregate, analyze, report",
        "Write a validate() function that rejects bad records with a reason instead of crashing",
        "Transform records by deriving month (string slicing) and revenue (units times price) per record",
        "Aggregate revenue per region and per product with dicts — the Part E counting pattern, summing money",
        "Analyze and report: top region, top product, statistics summaries, and an aligned f-string report",
      ],
      why: "This is the lesson the entire course was built for. Every skill you have collected appears in one program: lists and dicts from Part E, functions from Part F, files from Part G, exception handling from Part G, comprehensions from Part G and H, type-hinted clean functions from Part I, and the numbers, formats and modules from this part. You will process a realistic dataset — real-world messy, with two deliberately broken records — the exact shape of professional data work, built entirely from standard-library Python. When people say 'I use Python for data', this pipeline, at larger scale, is what they mean.",
      blocks: [
        {
          kind: "text",
          text: "Time to graduate. Below is a half-year of sales records for three regions and four products — 16 records, and two of them are broken on purpose, because that is what real data looks like: a units field that arrived as text, a region nobody has heard of. The plan is the six stages every analyst pipeline on earth follows, and by the end of this lesson you will have built all of them. One reading note: each block below is a complete, standalone program (that is how the playground here runs code), so each stage re-lists the records it needs at the top. In your own project file you would write the data exactly once, at the top.",
        },
        {
          kind: "visual",
          title: "The pipeline you are about to build",
          ascii: `   RAW DATA                16 records, exactly as received
   (2 of them broken)      someone typed "thirteen"; someone invented "West"
        |
        v
   +-----------+      bad records + reasons
   |  VALIDATE  | --------------------------------> rejection log
   +-----------+
        |  14 good records
        v
   +-----------+
   | TRANSFORM |      add month ("MM") + revenue (units x price) per record
   +-----------+
        |
        v
   +-----------+
   | AGGREGATE |      region -> revenue, product -> revenue   (dicts)
   +-----------+
        |
        v
   +-----------+
   |  ANALYZE  |      top region, top product, mean / median / stdev
   +-----------+
        |
        v
   +-----------+
   |  REPORT   |      aligned f-string tables -> screen (+ /tmp file)
   +-----------+`,
          caption:
            "Six small honest stages. Each one is simple; the discipline is doing them in this order, every time.",
        },
        {
          kind: "code",
          title: "Stage 0 — the dataset",
          code: `RAW = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-05-30", "North", "Phone", "thirteen", 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-11", "West", "Laptop", 5, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

def to_records(rows):
    """Turn raw tuples into the dict records the pipeline expects."""
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

sales = to_records(RAW)

print("records loaded:", len(sales))
print("first record  :", sales[0])
print("last record   :", sales[-1])
`,
          output: `records loaded: 16
first record  : {'date': '2025-01-08', 'region': 'North', 'product': 'Laptop', 'units': 10, 'unit_price': 999.0}
last record   : {'date': '2025-06-24', 'region': 'South', 'product': 'Phone', 'units': 6, 'unit_price': 699.0}`,
          outputNote: "Real output — dicts print with their keys in insertion order, exactly as the comprehension built them.",
          explain: [
            "The raw data lives in tuples — compact, ordered, easy to type — and `to_records` converts them into the dicts the rest of the pipeline speaks. Tuples unpacked in the comprehension: that is Part D and Part G working together.",
            "The records are the lists-of-dicts shape from Part E, with `sales[0]` and `sales[-1]` proving the load worked before any analysis runs — the smallest possible sanity check, and a professional habit.",
            "Look closely at rows 11 and 14: `\"thirteen\"` where units should be, and `\"West\"` where the region should be. The rest of this lesson is about what happens to them.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 1 — validate: decide what gets in",
        },
        {
          kind: "text",
          text: "The rule that separates a pipeline from a crash: **never trust a record**. Validation is a small function with one job — look at a record and answer *is this usable, and if not, why not?* It returns `None` for good records (None meaning 'no complaints') and a reason string for bad ones. This is the Part G exception-handling mindset applied to data: bad input is *expected*, so it gets caught and reported, never allowed to explode the program later.",
        },
        {
          kind: "code",
          title: "validate(): the gatekeeper",
          code: `KNOWN_REGIONS = ("North", "South", "East")

def validate(record):
    """Return None when the record is good, otherwise a reason string."""
    for field in ("date", "region", "product", "units", "unit_price"):
        if field not in record:
            return "missing field: " + field
    if not isinstance(record["units"], int):
        return "units is not an integer: " + repr(record["units"])
    if record["units"] < 0:
        return "units is negative"
    if not isinstance(record["unit_price"], (int, float)):
        return "unit_price is not a number"
    if record["region"] not in KNOWN_REGIONS:
        return "unknown region: " + record["region"]
    return None

RAW = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-05-30", "North", "Phone", "thirteen", 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-11", "West", "Laptop", 5, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

def to_records(rows):
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

sales = to_records(RAW)

good = []
rejected = []
for record in sales:
    reason = validate(record)
    if reason is None:
        good.append(record)
    else:
        rejected.append((record["date"], record["region"], reason))

print("loaded  :", len(sales))
print("kept    :", len(good))
print("rejected:", len(rejected))
for date, region, reason in rejected:
    print(f"  {date} ({region}): {reason}")
`,
          output: `loaded  : 16
kept    : 14
rejected: 2
  2025-05-30 (North): units is not an integer: 'thirteen'
  2025-06-11 (West): unknown region: West`,
          explain: [
            "The checks run cheapest-and-most-likely first: missing fields, then wrong types (`isinstance` from Part B), then impossible values, then unknown categories.",
            "`repr(record[\"units\"])` prints the bad value with its quotes — `'thirteen'` — so the log shows it was a string, which is the whole diagnosis.",
            "The counts must add up: 14 kept + 2 rejected = 16 loaded. Checking that arithmetic is the oldest data-quality trick there is, and it appears in the report itself at the end of this lesson.",
            "Both bad records were rejected *with reasons and dates*. The analyst who receives this log can fix the source data; the pipeline keeps running either way.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 2 — transform: derive what the data should have said",
        },
        {
          kind: "code",
          title: "transform(): month and revenue, per record",
          code: `def transform(record):
    """Add month and revenue to a validated record."""
    month = record["date"][5:7]
    revenue = record["units"] * record["unit_price"]
    return {
        "date": record["date"],
        "region": record["region"],
        "product": record["product"],
        "units": record["units"],
        "unit_price": record["unit_price"],
        "month": month,
        "revenue": revenue,
    }

CLEAN = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

def to_records(rows):
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

sales = [transform(r) for r in to_records(CLEAN)]

for record in sales[:3]:
    print(record["date"], record["region"], record["product"],
          "->", f'{record["revenue"]:.2f}', "(month", record["month"] + ")")
`,
          output: `2025-01-08 North Laptop -> 9990.00 (month 01)
2025-01-21 South Phone -> 10485.00 (month 01)
2025-02-04 East Tablet -> 3592.00 (month 02)`,
          outputNote: "First three transformed records only (sales[:3]) — the full 14 continue in the same shape.",
          explain: [
            "`record[\"date\"][5:7]` is the month, extracted by slicing the string: positions 5 and 6 of \"2025-03-05\" are \"03\". Count the characters — 2, 0, 2, 5, dash, then the month. Off-by-one slicing errors here are so common they are practically a rite of passage.",
            "`revenue = units * unit_price` is the entire business logic of this dataset, and it only runs *after* validation — on records where units is a real integer.",
            "transform returns a *new* dict instead of editing the old one: the original record stays untouched, and every downstream stage gets a uniform shape — date, region, product, units, unit_price, month, revenue.",
            "The block works on the 14 CLEAN records (the survivors of Stage 1) and prints just the first three — `sales[:3]` — as a spot check.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 3 — aggregate: the Part E pattern, summing money",
        },
        {
          kind: "code",
          title: "Two dict accumulators: region and product",
          code: `CLEAN = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

def to_records(rows):
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

def transform(record):
    month = record["date"][5:7]
    revenue = record["units"] * record["unit_price"]
    return {
        "date": record["date"],
        "region": record["region"],
        "product": record["product"],
        "units": record["units"],
        "unit_price": record["unit_price"],
        "month": month,
        "revenue": revenue,
    }

sales = [transform(r) for r in to_records(CLEAN)]

region_revenue = {}
product_revenue = {}
for record in sales:
    region = record["region"]
    product = record["product"]
    region_revenue[region] = region_revenue.get(region, 0) + record["revenue"]
    product_revenue[product] = product_revenue.get(product, 0) + record["revenue"]

print("revenue by region")
for region in sorted(region_revenue):
    print(f"  {region:<7}{region_revenue[region]:>10,.2f}")

print("revenue by product")
for product in sorted(product_revenue):
    print(f"  {product:<7}{product_revenue[product]:>10,.2f}")
`,
          output: `revenue by region
  East    19,966.00
  North   30,702.00
  South   30,348.00
revenue by product
  Laptop  26,973.00
  Phone   31,455.00
  Tablet  12,123.00
  Watch   10,465.00`,
          explain: [
            "This is the counting pattern from Part E with one change: instead of `+ 1`, it adds `record[\"revenue\"]`. Count events, sum money — same dict, same `.get(key, 0)`.",
            "`dict.get(key, 0)` is the whole trick: the first time a region appears it starts from 0, and every later visit adds on top. No if-statements, no KeyError, no pre-initializing keys.",
            "Sanity check the totals: regions 19,966 + 30,702 + 30,348 = 81,016; products 26,973 + 31,455 + 12,123 + 10,465 = 81,016. The two tables must sum to the same number — when they do, the aggregation is consistent.",
            "`sorted(region_revenue)` iterates the keys alphabetically, and `{:>10,.2f}` right-aligns the money so the columns line up — formatting habits from Part A's receipt, now doing daily work.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 4 — analyze: answer the actual questions",
        },
        {
          kind: "code",
          title: "Top region, top product, and the statistics of an order",
          code: `import statistics

CLEAN = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

def to_records(rows):
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

def transform(record):
    month = record["date"][5:7]
    revenue = record["units"] * record["unit_price"]
    return {
        "date": record["date"],
        "region": record["region"],
        "product": record["product"],
        "units": record["units"],
        "unit_price": record["unit_price"],
        "month": month,
        "revenue": revenue,
    }

sales = [transform(r) for r in to_records(CLEAN)]

region_revenue = {}
product_revenue = {}
for record in sales:
    region_revenue[record["region"]] = region_revenue.get(record["region"], 0) + record["revenue"]
    product_revenue[record["product"]] = product_revenue.get(record["product"], 0) + record["revenue"]

top_region = None
top_revenue = 0
for region, revenue in region_revenue.items():
    if revenue > top_revenue:
        top_region = region
        top_revenue = revenue

top_product = None
top_product_revenue = 0
for product, revenue in product_revenue.items():
    if revenue > top_product_revenue:
        top_product = product
        top_product_revenue = revenue

revenues = [record["revenue"] for record in sales]

print("orders      :", len(sales))
print("top region  :", top_region, f"({top_revenue:,.2f})")
print("top product :", top_product, f"({top_product_revenue:,.2f})")
print("mean order  :", f"{statistics.mean(revenues):,.2f}")
print("median order:", f"{statistics.median(revenues):,.2f}")
print("stdev       :", f"{statistics.stdev(revenues):,.2f}")
`,
          output: `orders      : 14
top region  : North (30,702.00)
top product : Phone (31,455.00)
mean order  : 5,786.86
median order: 4,342.00
stdev       : 2,602.06`,
          explain: [
            "Finding the top of a dict is the maximum-finding loop you have written since Part C — run over `dict.items()` instead of a list, tracking the best key *and* its value.",
            "The mean order (5,786.86) is above the median (4,342.00): a few large orders pull the mean up — exactly the mean-versus-median story from j-01, now discovered in your own data.",
            "The stdev of 2,602 says a typical order sits about 2,600 away from the mean: this is not a dataset of identical orders, and the report should say so.",
            "These six lines are the answers a manager actually asks for. The pipeline exists to make them trustworthy.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 5 — report: the receipt, all grown up",
        },
        {
          kind: "text",
          text: "The final stage assembles everything: validation counts, per-region tables with market share, totals, and the rejection log — in one aligned report, printed to the screen. This is the receipt pattern from Part A's very first formatting exercise, scaled up to a business document. Read the code top to bottom: it is every stage you just built, in pipeline order, in one program.",
        },
        {
          kind: "code",
          title: "The assembled pipeline, one program",
          code: `RAW = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
    ("2025-04-02", "North", "Tablet", 9, 449.0),
    ("2025-04-15", "South", "Watch", 14, 299.0),
    ("2025-05-07", "East", "Laptop", 6, 999.0),
    ("2025-05-20", "North", "Phone", 13, 699.0),
    ("2025-05-30", "North", "Phone", "thirteen", 699.0),
    ("2025-06-03", "South", "Tablet", 10, 449.0),
    ("2025-06-10", "North", "Laptop", 4, 999.0),
    ("2025-06-11", "West", "Laptop", 5, 999.0),
    ("2025-06-16", "East", "Watch", 9, 299.0),
    ("2025-06-24", "South", "Phone", 6, 699.0),
]

KNOWN_REGIONS = ("North", "South", "East")

def to_records(rows):
    return [
        {"date": d, "region": r, "product": p, "units": u, "unit_price": c}
        for d, r, p, u, c in rows
    ]

def validate(record):
    """Return None when the record is good, otherwise a reason string."""
    for field in ("date", "region", "product", "units", "unit_price"):
        if field not in record:
            return "missing field: " + field
    if not isinstance(record["units"], int):
        return "units is not an integer: " + repr(record["units"])
    if record["units"] < 0:
        return "units is negative"
    if not isinstance(record["unit_price"], (int, float)):
        return "unit_price is not a number"
    if record["region"] not in KNOWN_REGIONS:
        return "unknown region: " + record["region"]
    return None

def transform(record):
    """Add month and revenue to a validated record."""
    return {
        "date": record["date"],
        "region": record["region"],
        "product": record["product"],
        "units": record["units"],
        "unit_price": record["unit_price"],
        "month": record["date"][5:7],
        "revenue": record["units"] * record["unit_price"],
    }

sales = to_records(RAW)

good = []
dropped = []
for record in sales:
    reason = validate(record)
    if reason is None:
        good.append(transform(record))
    else:
        dropped.append((record["date"], record["region"], reason))

region_stats = {}
for record in good:
    region = record["region"]
    if region not in region_stats:
        region_stats[region] = {"orders": 0, "revenue": 0.0}
    region_stats[region]["orders"] += 1
    region_stats[region]["revenue"] += record["revenue"]

total = 0.0
for stats in region_stats.values():
    total += stats["revenue"]

W = 38
print("=" * W)
print("SALES REPORT - H1 2025".center(W))
print("=" * W)
print(f"{'Region':<8}{'Orders':>8}{'Revenue':>14}{'Share':>8}")
print("-" * W)
for region in sorted(region_stats):
    stats = region_stats[region]
    share = stats["revenue"] / total * 100
    print(f"{region:<8}{stats['orders']:>8}{stats['revenue']:>14,.2f}{share:>7.1f}%")
print("-" * W)
print(f"{'TOTAL':<8}{len(good):>8}{total:>14,.2f}{'100.0':>7}%")
print("=" * W)
print("data quality:", len(sales), "loaded /", len(good), "kept /", len(dropped), "dropped")
for date, region, reason in dropped:
    print("  dropped", date, "(" + region + "):", reason)
`,
          output: `======================================
        SALES REPORT - H1 2025
======================================
Region    Orders       Revenue   Share
--------------------------------------
East           4     19,966.00   24.6%
North          5     30,702.00   37.9%
South          5     30,348.00   37.5%
--------------------------------------
TOTAL         14     81,016.00  100.0%
======================================
data quality: 16 loaded / 14 kept / 2 dropped
  dropped 2025-05-30 (North): units is not an integer: 'thirteen'
  dropped 2025-06-11 (West): unknown region: West`,
          explain: [
            "The structure is now `to_records -> validate -> transform` feeding one loop that aggregates orders *and* revenue per region in nested dicts — `region_stats[\"North\"]` is itself a dict with orders and revenue.",
            "The shares are j-01's percent-change arithmetic in a new role: `stats[\"revenue\"] / total * 100` — and 24.6 + 37.9 + 37.5 adds to 100.0, as shares must.",
            "Every money value prints through `{:,.2f}` — thousands separators, two decimals, right-aligned — and the width W = 38 sizes the banner and the separators to the table. Change W and the whole report resizes.",
            "The report ends by reporting on itself: 16 loaded / 14 kept / 2 dropped, with the reasons. A report that states what it excluded is a report someone can trust.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The graduation map — where every piece was born",
          text: "Look at what you just used, and where you first met it: print and f-strings — Part A's first formatting exercise, now a business report. Lists and dicts — Part E, now carrying a whole dataset. Functions — Part F, now named pipeline stages. with open() — Part G's files, extended by j-02's CSV and JSON. Exception thinking — Part G, now a validation gate. Comprehensions — Parts G and H, now building records. isinstance and slicing — Part B, now the validation checks and the month extractor. Nothing new was needed; that was the plan all along.",
        },
        {
          kind: "tryIt",
          title: "Try it — the monthly pipeline",
          task: "This mini-pipeline runs stages 0 to 3 on six records. Extend it: after the by-month loop, add a by_region aggregation with the same dict.get pattern, printing each region's total revenue right-aligned with two decimals. Then predict which region leads before you run it.",
          code: `CLEAN = [
    ("2025-01-08", "North", "Laptop", 10, 999.0),
    ("2025-01-21", "South", "Phone", 15, 699.0),
    ("2025-02-04", "East", "Tablet", 8, 449.0),
    ("2025-02-17", "North", "Watch", 12, 299.0),
    ("2025-03-05", "South", "Laptop", 7, 999.0),
    ("2025-03-19", "East", "Phone", 11, 699.0),
]

by_month = {}
for date, region, product, units, unit_price in CLEAN:
    month = date[5:7]
    revenue = units * unit_price
    by_month[month] = by_month.get(month, 0) + revenue

for month in sorted(by_month):
    print("month", month, "->", f"{by_month[month]:,.2f}")
`,
          hint: "by_region = {} then the same loop shape: by_region[region] = by_region.get(region, 0) + revenue. North leads: 9990 + 3588 = 13,578.00.",
        },
      ],
      terms: [
        { term: "Data pipeline", definition: "A program built as ordered stages — load, validate, transform, aggregate, analyze, report — where each stage feeds the next." },
        { term: "Validation", definition: "The stage that decides what enters the pipeline: check required fields, types and values, and reject bad records with a reason." },
        { term: "Transformation", definition: "The stage that derives new fields from clean ones — here, month from a date string and revenue from units times price." },
        { term: "Aggregation", definition: "Collapsing many records into grouped totals with dicts — the counting pattern, summing values instead of counting occurrences." },
        { term: "Rejection log", definition: "The record of everything validation excluded, with dates and reasons — the pipeline's statement of what the report does not contain." },
      ],
      mistakes: [
        {
          mistake: "Skipping validation because 'the data looks fine'.",
          why: "One units value of \"thirteen\" survives until the revenue multiplication, where it crashes the whole pipeline — hours after the data was loaded, far from the actual bad record.",
          fix: "Validate at the door: every record checked before it enters, every rejection logged with a reason. Bad records cost one log line; unvalidated ones cost the whole run.",
        },
        {
          mistake: "Slicing the month as date[6:8].",
          why: "\"2025-03-05\" has the month at positions 5 and 6 — date[6:8] is \"3-\", and suddenly months are garbled while the code looks perfectly reasonable.",
          fix: "Count the characters once and test it: date[5:7] gives \"03\". Print the first transformed record before trusting the slice.",
        },
        {
          mistake: "Reading a field that a bad record may not have: record[\"units\"].",
          why: "A missing field raises KeyError, and one malformed record then takes down the entire aggregation loop with it.",
          fix: "Check fields first (validation), or use record.get(\"units\") where None is acceptable. The pipeline decides, not the crash.",
        },
        {
          mistake: "Printing raw floats in the final report: 'TOTAL 81016.0'.",
          why: "Correct number, unreadable presentation — no thousands separators, trailing .0, and floats with precision dust waiting to appear.",
          fix: "Format at the boundary: f\"{total:>14,.2f}\" — aligned, separated, two decimals. The report is the product; format it like one.",
        },
      ],
      takeaways: [
        "A pipeline is six honest stages: load, validate, transform, aggregate, analyze, report — each one simple, in that order, every time.",
        "Validation is a gate, not a crash: return None for good records, a reason for bad ones, and log the rejections with dates.",
        "Transform derives what the data should have said: month from date[5:7], revenue from units times price — and it runs only on validated records.",
        "Aggregation is the Part E counting pattern with + money instead of + 1; check that every grouping sums to the same total.",
        "The report states its own data quality — loaded, kept, dropped, and why — because a report that admits its gaps is the only kind worth trusting.",
      ],
      quiz: [
        {
          id: "j-05-q1",
          prompt: "Predict: what does \"2025-03-05\"[5:7] evaluate to?",
          options: [
            { text: "\"03\" — the month", correct: true, feedback: "Correct: positions 5 and 6 hold the month — 2, 0, 2, 5, dash, 0, 3. Counting from zero pays off again." },
            { text: "\"3-\" — part of the month and the dash", correct: false, feedback: "That is [6:8], the classic off-by-one — always print the slice before trusting it." },
            { text: "\"2025\" — the year", correct: false, feedback: "The year lives at [0:4]. [5:7] starts after the first dash." },
          ],
          explanation: "Slicing dates is character-position arithmetic: [0:4] year, [5:7] month, [8:10] day. Count once, comment it, never guess again.",
        },
        {
          id: "j-05-q2",
          prompt: "In the aggregation loop, what does region_revenue.get(region, 0) return the FIRST time a region appears?",
          options: [
            { text: "KeyError — the key does not exist yet", correct: false, feedback: "Plain indexing region_revenue[region] would raise KeyError; .get() exists precisely to avoid that." },
            { text: "0 — the default value", correct: true, feedback: "Correct — .get(key, default) returns the default when the key is missing, so the first mention starts from 0 and adds its revenue." },
            { text: "None — and then the addition fails", correct: false, feedback: ".get(key) with no second argument returns None, but .get(key, 0) returns 0 — the default is doing the work." },
          ],
          explanation: "The .get(key, 0) accumulator is the one-line heart of aggregation: no pre-initializing, no if-statements, no KeyError.",
        },
        {
          id: "j-05-q3",
          prompt: "validate() returns the string 'unknown region: West' for a record. What happens to that record?",
          options: [
            { text: "The program raises ValueError and stops", correct: false, feedback: "Nothing raises — validation is a function returning a reason, not an exception. Stopping is exactly what validation exists to prevent." },
            { text: "It is skipped, and the date and reason are recorded in the rejection log", correct: true, feedback: "Correct — rejected with evidence. The pipeline continues with the good records and reports what it excluded." },
            { text: "It is kept but its revenue is set to 0", correct: false, feedback: "Silently zeroing bad records corrupts totals while looking innocent — a bad record must be excluded loudly, not hidden." },
          ],
          explanation: "Reject, log, continue: the two bad records cost two log lines instead of the whole pipeline — that is the entire point of the validation stage.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART J EXERCISES — 12 (4 beginner, 4 intermediate, 4 advanced)
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "j-b1",
      tier: "beginner",
      title: "The statistics summary",
      prompt:
        "Below is a list of monthly rainfall in millimeters for one year. Write a program that prints a six-line summary, each line labeled exactly as shown in the expected output: the number of months (len), the total rainfall (sum), the mean (statistics.mean), the median (statistics.median), the minimum (min) and the maximum (max). Use the statistics module for mean and median — everything else is built-ins from j-01. Print the values raw, with no rounding.",
      hint: "Import statistics, then print each statistic on its own labeled line: print(\"months  :\", len(rainfall)) and so on. The mean of these twelve values is 45.25 exactly; the median is the average of the two middle values once sorted.",
      starter: `import statistics

rainfall = [62, 71, 58, 45, 38, 24, 18, 22, 35, 49, 55, 66]

# Print six labeled lines:
# months (len), total (sum), mean, median, minimum, maximum
`,
      solution: `import statistics

rainfall = [62, 71, 58, 45, 38, 24, 18, 22, 35, 49, 55, 66]

print("months  :", len(rainfall))
print("total   :", sum(rainfall))
print("mean    :", statistics.mean(rainfall))
print("median  :", statistics.median(rainfall))
print("minimum :", min(rainfall))
print("maximum :", max(rainfall))
`,
      expectedOutput: `months  : 12
total   : 543
mean    : 45.25
median  : 47.0
minimum : 18
maximum : 71`,
      concepts: ["statistics", "built-ins", "lists"],
    },
    {
      id: "j-b2",
      tier: "beginner",
      title: "Money that adds up",
      prompt:
        "A small order has three prices: 12.99, 9.99 and 0.85. Demonstrate the two money strategies from j-01 on it. First print the raw float sum (yes, with all its digits — that is the point), then the same sum rounded to 2 places. Then treat the prices as integer cents (1299, 999, 85): print the cents total, and print it converted back to dollars formatted with exactly 2 decimals. Four lines, labels exactly as shown in the expected output.",
      hint: "print(sum(prices)) shows the raw truth; round(sum(prices), 2) cleans the display. The cents path is sum(cents) then f\"{total_cents / 100:.2f}\". The float sum is 23.830000000000002 — binary arithmetic, not a bug.",
      starter: `prices = [12.99, 9.99, 0.85]

# 1. Print the raw float sum
# 2. Print the sum rounded to 2 places

cents = [1299, 999, 85]

# 3. Print the integer-cents total
# 4. Print it as dollars with exactly 2 decimals
`,
      solution: `prices = [12.99, 9.99, 0.85]

print("float sum :", sum(prices))
print("rounded   :", round(sum(prices), 2))

cents = [1299, 999, 85]
total_cents = sum(cents)

print("cents sum :", total_cents)
print("as dollars:", f"{total_cents / 100:.2f}")
`,
      expectedOutput: `float sum : 23.830000000000002
rounded   : 23.83
cents sum : 2383
as dollars: 23.83`,
      concepts: ["floating-point", "round()", "money", "f-strings"],
    },
    {
      id: "j-b3",
      tier: "beginner",
      title: "Normalize, then compare",
      prompt:
        "Five exam scores are stored in the list scores. Do two things with them. First, normalize the scores onto a 0-to-1 scale: find the lowest and highest, then build a new list where each value is (score - lowest) / (highest - lowest), rounded to 2 places — use a list comprehension. Print the raw list, then the normalized one. Second, visitors moved from 240 yesterday to 300 today: compute the day-over-day percent change and print it with a sign and exactly one decimal, like +25.0%. Labels exactly as in the expected output.",
      hint: "lowest = min(scores), highest = max(scores), then normalized = [round((s - lowest) / (highest - lowest), 2) for s in scores]. Percent change is (today - yesterday) / yesterday * 100 printed with {change:+.1f}%.",
      starter: `scores = [42, 55, 68, 74, 91]

# 1. Find the lowest and highest scores
# 2. Build the normalized list (comprehension, rounded to 2 places)
# 3. Print both lists with labels

yesterday = 240
today = 300

# 4. Compute the percent change and print it with a sign, one decimal
`,
      solution: `scores = [42, 55, 68, 74, 91]

low = min(scores)
high = max(scores)
normalized = [round((s - low) / (high - low), 2) for s in scores]

print("scores     :", scores)
print("normalized :", normalized)

yesterday = 240
today = 300
change = (today - yesterday) / yesterday * 100
print(f"day-over-day change: {change:+.1f}%")
`,
      expectedOutput: `scores     : [42, 55, 68, 74, 91]
normalized : [0.0, 0.27, 0.53, 0.65, 1.0]
day-over-day change: +25.0%`,
      concepts: ["normalization", "percent change", "comprehensions", "f-strings"],
    },
    {
      id: "j-b4",
      tier: "beginner",
      title: "Reading an API-shaped reply",
      prompt:
        "The string REPLY below holds a JSON object exactly the way an API would send it: a status flag and an item with id, name, price and in_stock. Parse it with json.loads, then print five labeled lines: the request status (data[\"ok\"]), the item's id, name and price, and the 8% tax on the price rounded to 2 places. Notice what happens to JSON's true when it arrives in Python — that translation is the point of this exercise. Labels exactly as in the expected output.",
      hint: "item = data[\"item\"] first, then item[\"id\"], item[\"name\"], item[\"price\"]. The tax is round(item[\"price\"] * 0.08, 2), which is 7.16 for a price of 89.5.",
      starter: `import json

REPLY = '''
{
  "ok": true,
  "item": {
    "id": "A-17",
    "name": "Mechanical keyboard",
    "price": 89.5,
    "in_stock": true
  }
}
'''

data = json.loads(REPLY)

# 1. Print the request status (data["ok"])
# 2. Save data["item"] in a variable named item
# 3. Print the item's id, name and price
# 4. Print the 8% tax, rounded to 2 places
`,
      solution: `import json

REPLY = '''
{
  "ok": true,
  "item": {
    "id": "A-17",
    "name": "Mechanical keyboard",
    "price": 89.5,
    "in_stock": true
  }
}
'''

data = json.loads(REPLY)
item = data["item"]

print("request ok :", data["ok"])
print("item id    :", item["id"])
print("name       :", item["name"])
print("price      :", item["price"])
print("tax (8%)   :", round(item["price"] * 0.08, 2))
`,
      expectedOutput: `request ok : True
item id    : A-17
name       : Mechanical keyboard
price      : 89.5
tax (8%)   : 7.16`,
      concepts: ["json.loads", "dicts", "type translation"],
    },

    // ---- intermediate
    {
      id: "j-i1",
      tier: "intermediate",
      title: "The CSV round-trip",
      prompt:
        "Write a complete round-trip through /tmp. The list books holds three dicts with title, author, pages and price. Write them to /tmp/books.csv using csv.DictWriter (open with \"w\" and newline=\"\", write the header, then writerows). Then read the file back with csv.DictReader and print an aligned table: title left-aligned in 15, author left-aligned in 8, pages right-aligned in 6, price right-aligned in 8 — remember, everything comes back as a string, so the alignment works on the raw text values. Finish with the total pages, converting each row's pages with int(). Output must match exactly.",
      hint: "The table header uses the same format string as the rows: f\"{row['title']:<15}{row['author']:<8}{row['pages']:>6}{row['price']:>8}\". The price column stays as text (29.9, 42.5, 24.0) — that is what csv gives you. Total pages: 245 + 380 + 198.",
      starter: `import csv

books = [
    {"title": "Python Basics", "author": "Meyer", "pages": 245, "price": 29.9},
    {"title": "Deep Learning", "author": "Cortez", "pages": 380, "price": 42.5},
    {"title": "Data Ethics", "author": "Okafor", "pages": 198, "price": 24.0},
]

FIELDS = ["title", "author", "pages", "price"]

# 1. Write the books to /tmp/books.csv (DictWriter, writeheader, writerows)

# 2. Read the file back into a list of rows (DictReader)

# 3. Print the aligned table (header + one line per book)

# 4. Print the total pages (convert with int)
`,
      solution: `import csv

books = [
    {"title": "Python Basics", "author": "Meyer", "pages": 245, "price": 29.9},
    {"title": "Deep Learning", "author": "Cortez", "pages": 380, "price": 42.5},
    {"title": "Data Ethics", "author": "Okafor", "pages": 198, "price": 24.0},
]

FIELDS = ["title", "author", "pages", "price"]

with open("/tmp/books.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(books)

with open("/tmp/books.csv") as f:
    rows = list(csv.DictReader(f))

print(f"{'Title':<15}{'Author':<8}{'Pages':>6}{'Price':>8}")
for row in rows:
    print(f"{row['title']:<15}{row['author']:<8}{row['pages']:>6}{row['price']:>8}")

total_pages = 0
for row in rows:
    total_pages += int(row["pages"])
print("total pages:", total_pages)
`,
      expectedOutput: `Title          Author   Pages   Price
Python Basics  Meyer      245    29.9
Deep Learning  Cortez     380    42.5
Data Ethics    Okafor     198    24.0
total pages: 823`,
      concepts: ["csv", "DictWriter", "DictReader", "file I/O"],
    },
    {
      id: "j-i2",
      tier: "intermediate",
      title: "Navigating nested JSON",
      prompt:
        "The JSON string MENU_TEXT below holds a restaurant menu as a dict of lists of dicts — categories pointing to dishes, each dish with a name and price. Parse it with json.loads, then print the restaurant name. Loop over the categories dict's items() and for each category print one line: the category name left-aligned in 10, the number of dishes, and the cheapest dish price with 2 decimals. Finally print the total cost of every main course together, also with 2 decimals. Output must match exactly.",
      hint: "for category, dishes in menu[\"categories\"].items(): gives each category name and its list of dishes. prices = [dish[\"price\"] for dish in dishes] then min(prices). The mains are menu[\"categories\"][\"mains\"] — three prices: 14.0, 17.5 and 15.0.",
      starter: `import json

MENU_TEXT = '''
{
  "restaurant": "The Nested Fork",
  "categories": {
    "starters": [
      {"name": "Soup", "price": 6.5},
      {"name": "Salad", "price": 8.0}
    ],
    "mains": [
      {"name": "Pasta", "price": 14.0},
      {"name": "Fish", "price": 17.5},
      {"name": "Risotto", "price": 15.0}
    ],
    "desserts": [
      {"name": "Tiramisu", "price": 7.0}
    ]
  }
}
'''

menu = json.loads(MENU_TEXT)

# 1. Print the restaurant name
# 2. For each category: print name (<10), dish count, cheapest price (2 dp)
# 3. Print the total of all mains together (2 dp)
`,
      solution: `import json

MENU_TEXT = '''
{
  "restaurant": "The Nested Fork",
  "categories": {
    "starters": [
      {"name": "Soup", "price": 6.5},
      {"name": "Salad", "price": 8.0}
    ],
    "mains": [
      {"name": "Pasta", "price": 14.0},
      {"name": "Fish", "price": 17.5},
      {"name": "Risotto", "price": 15.0}
    ],
    "desserts": [
      {"name": "Tiramisu", "price": 7.0}
    ]
  }
}
'''

menu = json.loads(MENU_TEXT)

print("restaurant:", menu["restaurant"])

for category, dishes in menu["categories"].items():
    prices = [dish["price"] for dish in dishes]
    print(f"{category:<10} {len(dishes)} dish(es), cheapest {min(prices):.2f}")

mains = menu["categories"]["mains"]
mains_total = 0.0
for dish in mains:
    mains_total += dish["price"]
print(f"all mains together: {mains_total:.2f}")
`,
      expectedOutput: `restaurant: The Nested Fork
starters   2 dish(es), cheapest 6.50
mains      3 dish(es), cheapest 14.00
desserts   1 dish(es), cheapest 7.00
all mains together: 46.50`,
      concepts: ["json", "nested data", "dict navigation", "loops"],
    },
    {
      id: "j-i3",
      tier: "intermediate",
      title: "Months out of dates",
      prompt:
        "Six revenue records each carry an ISO date string like \"2025-01-08\" and a revenue. Group the revenue by month: extract the month from each date with string slicing (the month lives at positions 5 to 7), and accumulate into a dict with the .get(key, 0) pattern from j-05. Then print one line per month, sorted, with the month number and the total revenue right-aligned in 9 characters with 2 decimals — f\"month {month}: {by_month[month]:>9.2f}\". Output must match exactly.",
      hint: "month = record[\"date\"][5:7] gives \"01\", \"02\", \"03\" — count the characters if unsure. by_month[month] = by_month.get(month, 0) + record[\"revenue\"] is the whole accumulator. January: 1240.0 + 980.5.",
      starter: `records = [
    {"date": "2025-01-08", "revenue": 1240.0},
    {"date": "2025-01-22", "revenue": 980.5},
    {"date": "2025-02-03", "revenue": 1420.0},
    {"date": "2025-02-11", "revenue": 1105.25},
    {"date": "2025-03-05", "revenue": 1330.0},
    {"date": "2025-03-19", "revenue": 760.75},
]

by_month = {}

# 1. Loop over the records; slice the month out of each date
# 2. Accumulate revenue per month with by_month.get(month, 0) + ...
# 3. Print one line per month, sorted, revenue right-aligned in 9, 2 decimals
`,
      solution: `records = [
    {"date": "2025-01-08", "revenue": 1240.0},
    {"date": "2025-01-22", "revenue": 980.5},
    {"date": "2025-02-03", "revenue": 1420.0},
    {"date": "2025-02-11", "revenue": 1105.25},
    {"date": "2025-03-05", "revenue": 1330.0},
    {"date": "2025-03-19", "revenue": 760.75},
]

by_month = {}
for record in records:
    month = record["date"][5:7]
    by_month[month] = by_month.get(month, 0) + record["revenue"]

for month in sorted(by_month):
    print(f"month {month}: {by_month[month]:>9.2f}")
`,
      expectedOutput: `month 01:   2220.50
month 02:   2525.25
month 03:   2090.75`,
      concepts: ["string slicing", "dict grouping", "aggregation", "f-strings"],
    },
    {
      id: "j-i4",
      tier: "intermediate",
      title: "Revenue by region",
      prompt:
        "Six sales records carry region, product and revenue. Build a dict named by_region mapping each region to a nested dict with \"orders\" (a count) and \"revenue\" (a sum) — the nested-dict aggregation pattern from j-05. Then print an aligned table: header Region, Orders (right in 8), Revenue (right in 12), one row per region in sorted order with revenue formatted with a thousands separator and 2 decimals. Finish with the top region found by a maximum-finding loop over the dict, printed as: top region: North (22,665.00). Output must match exactly.",
      hint: "if region not in by_region: by_region[region] = {\"orders\": 0, \"revenue\": 0.0} — then += 1 and += sale[\"revenue\"]. For the top: start top_region = None, top_revenue = 0, and loop over by_region.items() tracking the best. North has 3 orders: 9990 + 3588 + 9087.",
      starter: `sales = [
    {"region": "North", "product": "Laptop", "revenue": 9990.0},
    {"region": "South", "product": "Phone", "revenue": 10485.0},
    {"region": "North", "product": "Watch", "revenue": 3588.0},
    {"region": "East", "product": "Tablet", "revenue": 3592.0},
    {"region": "South", "product": "Laptop", "revenue": 6993.0},
    {"region": "North", "product": "Phone", "revenue": 9087.0},
]

by_region = {}

# 1. Aggregate: each region -> {"orders": count, "revenue": sum}
# 2. Print the header: Region, Orders (>8), Revenue (>12)
# 3. Print one row per region (sorted), revenue with , and 2 decimals
# 4. Find the top region with a max-finding loop and print it
`,
      solution: `sales = [
    {"region": "North", "product": "Laptop", "revenue": 9990.0},
    {"region": "South", "product": "Phone", "revenue": 10485.0},
    {"region": "North", "product": "Watch", "revenue": 3588.0},
    {"region": "East", "product": "Tablet", "revenue": 3592.0},
    {"region": "South", "product": "Laptop", "revenue": 6993.0},
    {"region": "North", "product": "Phone", "revenue": 9087.0},
]

by_region = {}
for sale in sales:
    region = sale["region"]
    if region not in by_region:
        by_region[region] = {"orders": 0, "revenue": 0.0}
    by_region[region]["orders"] += 1
    by_region[region]["revenue"] += sale["revenue"]

print(f"{'Region':<8}{'Orders':>8}{'Revenue':>12}")
for region in sorted(by_region):
    stats = by_region[region]
    print(f"{region:<8}{stats['orders']:>8}{stats['revenue']:>12,.2f}")

top_region = None
top_revenue = 0
for region, stats in by_region.items():
    if stats["revenue"] > top_revenue:
        top_region = region
        top_revenue = stats["revenue"]

print("top region:", top_region, f"({top_revenue:,.2f})")
`,
      expectedOutput: `Region    Orders     Revenue
East           1    3,592.00
North          3   22,665.00
South          2   17,478.00
top region: North (22,665.00)`,
      concepts: ["aggregation", "nested dicts", "ranking", "f-strings"],
    },

    // ---- advanced
    {
      id: "j-a1",
      tier: "advanced",
      title: "The offline weather API",
      prompt:
        "Run the full j-03 API workflow on an embedded response, with no network. The JSON string RESPONSE below is a weather API reply for Porto with four forecast days — and Thursday's high is null, which happens in real data all the time. Parse it; check the status (print 'API error - no report' and stop if it is not \"ok\"); skip any day whose high or low is missing or None, printing 'incomplete day skipped: Thu' style messages; then print the city, the count of usable days 'of' the total, the average high rounded to 1 decimal, and the warmest day found with a maximum-finding loop (no max with key=). Output must match exactly.",
      hint: "entry.get(\"high\") is None or entry.get(\"low\") is None catches both missing keys and null values in one check. For the warmest day, keep a reference to the whole entry and compare entry[\"high\"] > warmest[\"high\"]. Highs are 27, 29, 31 — average 29.0, warmest Wednesday.",
      starter: `import json

RESPONSE = '''
{
  "status": "ok",
  "city": "Porto",
  "forecast": [
    {"day": "Mon", "high": 27, "low": 16},
    {"day": "Tue", "high": 29, "low": 17},
    {"day": "Wed", "high": 31, "low": 19},
    {"day": "Thu", "high": null, "low": 18}
  ]
}
'''

data = json.loads(RESPONSE)

# 1. Check data.get("status") - if not "ok", print the error line and stop
# 2. Skip days with missing/None high or low (print which day was skipped)
# 3. Print: city, usable days "of" total, average high (1 decimal)
# 4. Find the warmest day with a loop; print its day and high
`,
      solution: `import json

RESPONSE = '''
{
  "status": "ok",
  "city": "Porto",
  "forecast": [
    {"day": "Mon", "high": 27, "low": 16},
    {"day": "Tue", "high": 29, "low": 17},
    {"day": "Wed", "high": 31, "low": 19},
    {"day": "Thu", "high": null, "low": 18}
  ]
}
'''

data = json.loads(RESPONSE)

if data.get("status") != "ok":
    print("API error - no report")
else:
    valid = []
    for entry in data["forecast"]:
        if entry.get("high") is None or entry.get("low") is None:
            print("incomplete day skipped:", entry["day"])
        else:
            valid.append(entry)

    highs = [entry["high"] for entry in valid]

    warmest = valid[0]
    for entry in valid:
        if entry["high"] > warmest["high"]:
            warmest = entry

    print("city         :", data["city"])
    print("days reported:", len(valid), "of", len(data["forecast"]))
    print("average high :", round(sum(highs) / len(highs), 1))
    print("warmest day  :", warmest["day"], "at", warmest["high"], "degrees")
`,
      expectedOutput: `incomplete day skipped: Thu
city         : Porto
days reported: 3 of 4
average high : 29.0
warmest day  : Wed at 31 degrees`,
      concepts: ["APIs", "JSON", "validation", "workflow"],
    },
    {
      id: "j-a2",
      tier: "advanced",
      title: "The bad records report",
      prompt:
        "Process five survey records with try/except — the Part G discipline applied to data. Each record should have name, age and score, but three are broken: Bilal's age is the string \"twenty-nine\", Cleo's record is missing age entirely, and Dmitri's score is -5, out of the 0-100 range. For each record: try to convert age and score with int(), raise ValueError with the message 'age out of range' or 'score out of range' when the values are impossible, and catch KeyError (missing field), TypeError and ValueError. Accepted records go in one list, rejected in another with their reasons. Print both lists exactly as shown — the accepted with their details, the rejected with name and reason.",
      hint: "try: age = int(record[\"age\"]) — a missing key raises KeyError, a bad string raises ValueError, and record[\"age\"] on a record with age None would raise TypeError, so catch (KeyError,) and (TypeError, ValueError) separately. str(err) on a KeyError prints 'age' with quotes: missing field 'age'.",
      starter: `records = [
    {"name": "Aurora", "age": 34, "score": 88},
    {"name": "Bilal", "age": "twenty-nine", "score": 91},
    {"name": "Cleo", "score": 76},
    {"name": "Dmitri", "age": 41, "score": -5},
    {"name": "Elena", "age": 28, "score": 95},
]

accepted = []
rejected = []

# For each record:
#   try: convert age and score with int(); validate ranges and
#        raise ValueError("age out of range") / ("score out of range")
#   except KeyError -> rejected with "missing field " + str(err)
#   except (TypeError, ValueError) -> rejected with str(err)
#   else: accepted
# Then print both lists exactly as in the expected output.
`,
      solution: `records = [
    {"name": "Aurora", "age": 34, "score": 88},
    {"name": "Bilal", "age": "twenty-nine", "score": 91},
    {"name": "Cleo", "score": 76},
    {"name": "Dmitri", "age": 41, "score": -5},
    {"name": "Elena", "age": 28, "score": 95},
]

accepted = []
rejected = []

for record in records:
    try:
        age = int(record["age"])
        score = int(record["score"])
        if age < 0 or age > 120:
            raise ValueError("age out of range")
        if not 0 <= score <= 100:
            raise ValueError("score out of range")
    except KeyError as err:
        reason = "missing field " + str(err)
        rejected.append((record.get("name", "?"), reason))
    except (TypeError, ValueError) as err:
        rejected.append((record.get("name", "?"), str(err)))
    else:
        accepted.append(record)

print("accepted:", len(accepted))
for record in accepted:
    print(" ", record["name"], "-", record["age"], "years, score", record["score"])

print("rejected:", len(rejected))
for name, reason in rejected:
    print(" ", name, "-", reason)
`,
      expectedOutput: `accepted: 2
  Aurora - 34 years, score 88
  Elena - 28 years, score 95
rejected: 3
  Bilal - invalid literal for int() with base 10: 'twenty-nine'
  Cleo - missing field 'age'
  Dmitri - score out of range`,
      concepts: ["try/except", "validation", "error messages", "raise"],
    },
    {
      id: "j-a3",
      tier: "advanced",
      title: "The quarterly report",
      prompt:
        "Format a product summary report with perfect alignment — the Part A receipt pattern, grown up. The list products holds (name, units, revenue) tuples for four products. Print a 34-character-wide report: a line of = signs, the title PRODUCT SUMMARY centered on it, = signs again, then a header row (Product left in 10, Units right in 8, Revenue right in 14), a line of - signs, one aligned row per product with revenue formatted with thousands separator and 2 decimals, another - line, and a TOTAL row summing both columns the same way. Output must match exactly — every space matters.",
      hint: "W = 34; \"=\" * W and \"-\" * W make the rules; \"PRODUCT SUMMARY\".center(W) centers the title. Row: f\"{name:<10}{units:>8}{revenue:>14,.2f}\". Units total 23+58+27+44; revenue total 88,798.00.",
      starter: `products = [
    ("Laptop", 23, 22977.0),
    ("Phone", 58, 40542.0),
    ("Tablet", 27, 12123.0),
    ("Watch", 44, 13156.0),
]

# Print a 34-wide report:
# = line, centered title, = line, header row, - line,
# one aligned row per product, - line, TOTAL row (both columns summed)
`,
      solution: `products = [
    ("Laptop", 23, 22977.0),
    ("Phone", 58, 40542.0),
    ("Tablet", 27, 12123.0),
    ("Watch", 44, 13156.0),
]

W = 34
print("=" * W)
print("PRODUCT SUMMARY".center(W))
print("=" * W)
print(f"{'Product':<10}{'Units':>8}{'Revenue':>14}")
print("-" * W)

total_units = 0
total_revenue = 0.0
for name, units, revenue in products:
    print(f"{name:<10}{units:>8}{revenue:>14,.2f}")
    total_units += units
    total_revenue += revenue

print("-" * W)
print(f"{'TOTAL':<10}{total_units:>8}{total_revenue:>14,.2f}")
`,
      expectedOutput: `==================================
         PRODUCT SUMMARY
==================================
Product      Units       Revenue
----------------------------------
Laptop          23     22,977.00
Phone           58     40,542.00
Tablet          27     12,123.00
Watch           44     13,156.00
----------------------------------
TOTAL          152     88,798.00`,
      concepts: ["f-strings", "alignment", "reports", "string repetition"],
    },
    {
      id: "j-a4",
      tier: "advanced",
      title: "Fix the broken pipeline",
      prompt:
        "A colleague's sales pipeline is broken three ways, and it crashes before printing anything. The data uses the key \"zone\" (not \"region\"), revenue should be units TIMES unit_price, and the month slice is wrong for ISO dates like \"2025-03-04\". Find all three bugs by reading the traceback first (it names the first crash), then reading the code: the other two bugs are logic errors that only reveal themselves in the numbers. Fix them without changing the data. When it runs, the totals must be: total 27564.0, North 17982.0, month 03 14184.0 — hand-check one record: 10 units at 999.0 is 9990.0.",
      hint: "The traceback says KeyError: 'region' — the data has \"zone\". Then check the month: \"2025-03-04\"[6:8] is \"3-\", not \"03\" — the month lives one position earlier. And revenue needs multiplication: sale[\"units\"] * sale[\"unit_price\"].",
      starter: `sales = [
    {"date": "2025-03-04", "zone": "North", "units": 10, "unit_price": 999.0},
    {"date": "2025-03-18", "zone": "South", "units": 6, "unit_price": 699.0},
    {"date": "2025-04-02", "zone": "North", "units": 8, "unit_price": 999.0},
    {"date": "2025-04-15", "zone": "East", "units": 12, "unit_price": 449.0},
]

# BUG 1: the data key is "zone", the code says "region"
# BUG 2: revenue should be units * unit_price, not +
# BUG 3: the month slice is wrong for "YYYY-MM-DD" dates

total = 0.0
by_region = {}
by_month = {}

for sale in sales:
    revenue = sale["units"] + sale["unit_price"]      # BUG 2
    month = sale["date"][6:8]                          # BUG 3
    region = sale["region"]                            # BUG 1

    by_region[region] = by_region.get(region, 0) + revenue
    by_month[month] = by_month.get(month, 0) + revenue
    total += revenue

print("total revenue:", round(total, 2))
for region in sorted(by_region):
    print(" ", region, "->", round(by_region[region], 2))
for month in sorted(by_month):
    print("  month", month, "->", round(by_month[month], 2))
`,
      starterExpectError: "KeyError: 'region'",
      solution: `sales = [
    {"date": "2025-03-04", "zone": "North", "units": 10, "unit_price": 999.0},
    {"date": "2025-03-18", "zone": "South", "units": 6, "unit_price": 699.0},
    {"date": "2025-04-02", "zone": "North", "units": 8, "unit_price": 999.0},
    {"date": "2025-04-15", "zone": "East", "units": 12, "unit_price": 449.0},
]

total = 0.0
by_region = {}
by_month = {}

for sale in sales:
    revenue = sale["units"] * sale["unit_price"]      # fixed: multiply
    month = sale["date"][5:7]                         # fixed: month at 5:7
    region = sale["zone"]                             # fixed: the data key

    by_region[region] = by_region.get(region, 0) + revenue
    by_month[month] = by_month.get(month, 0) + revenue
    total += revenue

print("total revenue:", round(total, 2))
for region in sorted(by_region):
    print(" ", region, "->", round(by_region[region], 2))
for month in sorted(by_month):
    print("  month", month, "->", round(by_month[month], 2))
`,
      expectedOutput: `total revenue: 27564.0
  East -> 5388.0
  North -> 17982.0
  South -> 4194.0
  month 03 -> 14184.0
  month 04 -> 13380.0`,
      concepts: ["debugging", "KeyError", "string slicing", "logic errors"],
    },
  ],

  // =====================================================================
  // PART J ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "j-as-1",
      prompt: "What does statistics.stdev([5]) do?",
      options: [
        { text: "Raises StatisticsError: stdev requires at least two data points", correct: true, feedback: "Correct — spread needs at least two values to measure; Python refuses to guess." },
        { text: "Returns 0.0 — one value has no spread", correct: false, feedback: "Tempting, but Python raises instead of inventing an answer for an undefined question." },
        { text: "Returns 5 — the value is its own average", correct: false, feedback: "The average IS 5, but stdev is about distance between values, and there is nothing to measure." },
        { text: "Returns nan", correct: false, feedback: "numpy uses nan for missing data; the statistics module speaks up with an exception instead." },
      ],
      explanation: "statistics.stdev needs at least two data points — one lonely value makes spread mathematically undefined, and Python raises a StatisticsError saying exactly that.",
    },
    {
      id: "j-as-2",
      prompt: "A dataset of household incomes has one extreme outlier (a billionaire moved in). What happens to the mean and the median?",
      options: [
        { text: "The mean jumps toward the outlier; the median barely moves", correct: true, feedback: "Exactly — the mean divides the total, so one huge value drags it; the median just counts rank." },
        { text: "Both jump toward the outlier equally", correct: false, feedback: "The median is a position, not a sum — one extreme value shifts its position by almost nothing." },
        { text: "The median jumps but the mean resists", correct: false, feedback: "Reversed: the median is the resistant one; the mean is the one that gets dragged." },
        { text: "Neither can be computed anymore", correct: false, feedback: "Both compute fine — the question is which one still describes typical households honestly." },
      ],
      explanation: "The mean is a balance point (sums inside), so outliers pull it hard. The median only asks: which value sits in the middle? That rank barely changes — the resistant average.",
    },
    {
      id: "j-as-3",
      prompt: "After the header line, what does iterating over csv.DictReader(f) yield for each data row?",
      options: [
        { text: "A dict keyed by the header names — {'date': '2025-03-02', ...}", correct: true, feedback: "Correct — DictReader reads the first line as column names and hands you each row as a dict." },
        { text: "A list of strings in column order", correct: false, feedback: "That is the plain csv.reader; DictReader is the one that keys by header." },
        { text: "One long string with commas still inside", correct: false, feedback: "The csv module's whole job is splitting those apart — DictReader goes further and names the parts." },
        { text: "A tuple of (column name, value) pairs", correct: false, feedback: "Close in spirit, wrong in shape — the names are keys of a dict, not pairs in a tuple." },
      ],
      explanation: "DictReader = header line becomes the keys, every data line becomes a dict value. All values arrive as strings — converting types is your job.",
    },
    {
      id: "j-as-4",
      prompt: "json.loads(text) and json.load(f) — what is the difference?",
      options: [
        { text: "loads parses a string; load reads an already-open file", correct: true, feedback: "Right — the 's' means string. json.load(f) pulls the file's content and parses it in one call." },
        { text: "loads is the safe version; load is deprecated", correct: false, feedback: "Both are current — they just take different inputs." },
        { text: "load is for lists, loads is for strings only", correct: false, feedback: "Both parse any JSON — arrays, objects, numbers — the difference is where the text comes from." },
        { text: "loads works on files; load works on URLs", correct: false, feedback: "Neither fetches anything — you hand both of them text or a file you already opened yourself." },
      ],
      explanation: "loads('...') — s for string. load(open_file) — reads the file for you. Same parser, two front doors.",
    },
    {
      id: "j-as-5",
      prompt: "On the same seven temperatures, temps.std() (NumPy) printed 2.65 but statistics.stdev(temps) printed 2.79. Both are correct — why?",
      options: [
        { text: "They divide differently: NumPy's std uses the population formula (n), statistics.stdev uses the sample formula (n-1)", correct: true, feedback: "Exactly — dividing by n-1 (sample) inflates the result slightly versus dividing by n (population). Both are real statistics with different assumptions." },
        { text: "NumPy rounds up, the statistics module rounds down", correct: false, feedback: "Neither rounds by default — the 0.14 gap is a formula difference, not formatting." },
        { text: "One of them has a bug — report it", correct: false, feedback: "No bug — read the docs before you trust (or distrust) a statistic; the two functions answer different questions." },
        { text: "NumPy sorts the data first and the statistics module does not", correct: false, feedback: "Sorting changes nothing about a mean of squared distances — the difference is in the denominator." },
      ],
      explanation: "Population stdev divides by n; sample stdev divides by n-1 (Bessel's correction). On the same data the sample formula is slightly larger — 2.79 vs 2.65. Professionals check which one a library defaults to.",
    },
    {
      id: "j-as-6",
      prompt: "In a Jupyter notebook, cell A sets x = 5. Cell B prints x. You then edit cell A to x = 10 and run ONLY cell B. What prints?",
      options: [
        { text: "5 — the kernel still holds the old value until cell A is re-run", correct: true, feedback: "Correct — the notebook kernel is one long-running Python process; running a cell updates memory, editing it does not." },
        { text: "10 — the notebook re-executes edited cells automatically", correct: false, feedback: "Notebooks never re-run anything for you; the cell's text changed but its code has not executed since the edit." },
        { text: "NameError — x no longer exists", correct: false, feedback: "x still exists with its old value; nothing deletes variables between runs." },
        { text: "Both 5 and 10 print", correct: false, feedback: "Only cell B runs, and it prints what x actually holds — the stale 5." },
      ],
      explanation: "A notebook is a live interpreter, not a document that runs top to bottom. The cure for stale-state bugs is Restart & Run All — the habit this lesson drills.",
    },
    {
      id: "j-as-7",
      prompt: "Predict the output of this accumulator loop:\n\nfor word in [\"a\", \"b\", \"a\"]:\n    counts[word] = counts.get(word, 0) + 1\nprint(sorted(counts.items()))",
      options: [
        { text: "[('a', 2), ('b', 1)]", correct: true, feedback: "Perfect — .get(word, 0) supplies 0 the first time, then the count grows; sorted() orders the pairs alphabetically." },
        { text: "[('a', 1), ('a', 1), ('b', 1)]", correct: false, feedback: "A dict has ONE key per name — assigning again replaces and increments, it never duplicates entries." },
        { text: "KeyError: 'a'", correct: false, feedback: "Plain counts[word] + 1 would raise exactly that on a first sight of 'a' — the .get(word, 0) default is what prevents it." },
        { text: "[('b', 1), ('a', 2)]", correct: false, feedback: "Right counts, wrong order — sorted() puts 'a' before 'b' every time." },
      ],
      explanation: "The .get(key, default) accumulator is the workhorse pattern of data processing: first sight starts from the default, every later sight adds one. Sorted items make the output deterministic.",
    },
    {
      id: "j-as-8",
      prompt: "You wrote: response = requests.get(url); response.raise_for_status(); data = response.json(). The server answers 404. What does raise_for_status do?",
      options: [
        { text: "Raises requests.HTTPError immediately — so the 404 is caught as an error instead of an error page being parsed as if it were JSON", correct: true, feedback: "Exactly — fail fast at the boundary, the cleanest place to catch a broken request." },
        { text: "Returns False and lets the program continue", correct: false, feedback: "Silent False is the trap this method exists to prevent — a 404 page is not JSON, and .json() would crash anyway, later and more confusingly." },
        { text: "Retries the request up to three times", correct: false, feedback: "raise_for_status never retries — it converts the status into an exception so YOU decide what happens next." },
        { text: "Prints a warning to the console", correct: false, feedback: "Warnings scroll by unnoticed; an exception stops the program at the exact line that failed." },
      ],
      explanation: "raise_for_status() turns 4xx/5xx answers into exceptions. Without it, a 'successful' request quietly hands an error page to .json(), which crashes with a message pointing at the wrong place.",
    },
  ],

  // =====================================================================
  // PART J MINI PROJECT
  // =====================================================================
  project: {
    title: "The Multi-City Weather Report",
    brief:
      "You will build a complete data pipeline with the standard library alone: write a small CSV of daily temperature readings with csv.DictWriter, read it back with csv.DictReader, convert the string columns to real numbers at load time, group the readings per city and per month with the .get(key, default) accumulator pattern, summarize each group with the statistics module, and export the per-city means as one JSON line with json.dumps — the exact shape an API consumer would want. This is the data science workflow of Part J in miniature: file in, clean types, group, summarize, report out — and every number printed must be computed, never hardcoded.",
    requirements: [
      "Write /tmp/weather.csv from the hardcoded ROWS with csv.DictWriter (fieldnames date, city, temp), then read it back with csv.DictReader — the round-trip through a real file is part of the exercise",
      "Every row's temp is converted to float at load time (CSV gives you strings); readings is a list of dicts like {'date': ..., 'city': ..., 'temp': 22.5}",
      "Group temperatures per city into a dict of lists with the .get(city, []) accumulator pattern — and per month (date string slice [5:7]) into another",
      "For each city in sorted order print one line: name, number of readings, mean to 2 decimals, median to 2 decimals — all three numbers from the statistics module",
      "For each month in sorted order print the average temperature to 2 decimals",
      "Print one final line: json.dumps of the per-city means (each rounded to 2 decimals), with sort_keys=True — it must read exactly {\"Lima\": 22.17, \"Oslo\": 4.0}",
      "No hardcoded results anywhere: with the given data your full program prints 'Lima : 3 readings, mean 22.17, median 22.50' and 'Oslo : 3 readings, mean 4.00, median 4.50', the months 03 -> 15.67 and 04 -> 10.50, then the JSON line",
    ],
    steps: [
      "Step 1 — Write the CSV: open /tmp/weather.csv with newline=\"\", use DictWriter with FIELDS, writeheader(), then writerow for each ROW. Immediately read it back with DictReader and print the rows — notice every value arrives as a string. Delete that debug print afterwards.",
      "Step 2 — Load with types: build readings as a list of dicts, converting row[\"temp\"] with float(). Print len(readings) — expect 6 — and keep that check until the end.",
      "Step 3 — Group by city: by_city = {}, then for each reading append the temperature with by_city[city] = by_city.get(city, []) + [temp]. Print by_city once to see {'Lima': [...], 'Oslo': [...]} — then remove the print.",
      "Step 4 — Per-city lines: for city in sorted(by_city), print the count, statistics.mean to 2 decimals with an f-string, and statistics.median the same way. Hand-check Lima: (22.5 + 23.0 + 21.0) / 3 = 22.17.",
      "Step 5 — Group by month with month = reading[\"date\"][5:7] and the same .get pattern; print each sorted month's average to 2 decimals. Hand-check month 03: (22.5 + 1.5 + 23.0) / 3 = 15.67.",
      "Step 6 — Build means = {city: round(statistics.mean(temps), 2) for city, temps in by_city.items()} and print(json.dumps(means, sort_keys=True)). Compare with the exact target line in the requirements.",
      "Step 7 — Compare your full output against the brief, number by number, and trace any mismatch back to the data before touching code.",
      "Step 8 — Final pass: remove every debug print, re-read the grouping lines aloud (defaults? slices?), and run the whole program once from the top.",
    ],
    starter: `# ============================================================
# The Multi-City Weather Report
# CSV in, statistics out, a JSON line for the API people.
# ============================================================
import csv
import json
import statistics

FIELDS = ["date", "city", "temp"]
ROWS = [
    {"date": "2025-03-02", "city": "Lima", "temp": "22.5"},
    {"date": "2025-03-04", "city": "Oslo", "temp": "1.5"},
    {"date": "2025-03-09", "city": "Lima", "temp": "23.0"},
    {"date": "2025-04-01", "city": "Oslo", "temp": "4.5"},
    {"date": "2025-04-06", "city": "Lima", "temp": "21.0"},
    {"date": "2025-04-11", "city": "Oslo", "temp": "6.0"},
]

# --- Step 1: write the CSV, then read it back ---------------------
with open("/tmp/weather.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS)
    writer.writeheader()
    # TODO: writerow every row in ROWS

readings = []
with open("/tmp/weather.csv") as f:
    pass  # TODO: for row in csv.DictReader(f): append {"date": ..., "city": ..., "temp": float(...)}

# --- Steps 2-3: group by city -------------------------------------
by_city = {}
# TODO: accumulate by_city[city] = by_city.get(city, []) + [temp]

print("== per-city summaries ==")
# TODO: for city in sorted(by_city): print name, count, mean (2dp), median (2dp)

# --- Step 4: group by month (ISO date slice) ----------------------
by_month = {}
# TODO: month = reading["date"][5:7], accumulate temps the same way

print("== per-month averages ==")
# TODO: for month in sorted(by_month): print the average (2dp)

# --- Step 5: one JSON line for the API people ---------------------
# TODO: means = {city: round(statistics.mean(temps), 2) for ...}
# TODO: print(json.dumps(means, sort_keys=True))
`,
    concepts: ["csv", "json", "statistics", "grouping", "type conversion", "deterministic reports"],
    extension:
      "Add the hottest day per city: for each city, find the (date, temp) pair with the highest temperature using max(pairs, key=lambda pair: pair[1]) and print 'hottest in Lima: 23.0 on 2025-03-09'. Then print the same means JSON with indent=2 and describe the difference: dumps with no arguments is for programs, indent is for humans.",
  },
};
