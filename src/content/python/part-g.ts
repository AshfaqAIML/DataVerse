/**
 * PART G — INTERMEDIATE PYTHON
 *
 * The bridge from "I can write functions" to "I can write real programs":
 * modules and packages, file handling, exception handling, comprehensions,
 * iterators, generators, and decorators.
 *
 * Lesson order: import and the standard library -> packages, pip and
 * virtual environments -> files -> exceptions -> comprehensions ->
 * iterators -> generators -> decorators.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Machine-dependent content (pip sessions, virtual-environment setup) uses
 * lang "bash"/"text" and is never presented as verified program output.
 * Executed file code writes only to /tmp paths, which work both in the
 * verifier's python3 and in the browser playground's virtual filesystem.
 */
import type { Part } from "@/lib/course/types";

export const PART_G: Part = {
  letter: "G",
  title: "Intermediate Python",
  tagline: "Modules, files, errors, and the modern-Python toolkit",
  description:
    "Modules, packages, file handling, exception handling, comprehensions, iterators, generators, and decorators.",

  lessons: [
    // ------------------------------------------------------------- g-01
    {
      slug: "g-01",
      title: "Modules",
      minutes: 14,
      summary:
        "How import gives you Python's battery box: the math, random, datetime, and statistics modules, the from-import shortcut, and why the standard library means you rarely write from scratch.",
      kind: "concept",
      objectives: [
        "Import a module and call its functions with the dot",
        "Choose between import, from-import, and as-aliases deliberately",
        "Produce reproducible randomness with random.seed()",
        "Do date arithmetic on fixed dates with the datetime module",
        "Replace hand-rolled averaging with the statistics module",
      ],
      why: "So far every function you used was either built-in (len, print, sum) or written by you. Professional Python is mostly neither: it is thousands of ready-made, tested, documented functions that arrive in the box with Python — the standard library. A data analyst who does not know that statistics.mean or math.sqrt already exist will waste hours rewriting them, badly. This lesson turns 'I must build everything' into 'I must find the right tool and import it'.",
      blocks: [
        {
          kind: "text",
          text: "You have actually used a module since lesson a-02: `import this` printed the Zen of Python. An **import** loads a *module* — a ready-made file of Python code — and gives you access to everything inside it. Modules are the reason Python earned its famous description: *batteries included*. Picture a workshop: instead of throwing every tool into one pile, you keep a **math** drawer, a **random** drawer, a **datetime** drawer. To use a tool you open the drawer, then pick the thing by name: `math.sqrt` is *the sqrt tool from the math drawer*. The dot is the 'belongs to' operator. Python guarantees there is no confusion: a function named `sqrt` in math cannot collide with your own variable `sqrt`, because you must always say which drawer it comes from.",
        },
        {
          kind: "code",
          title: "Opening the math drawer",
          code: `import math

print(math.sqrt(144))
print(math.pi)
print(math.ceil(7.2))
print(math.floor(7.8))
print(math.factorial(5))
`,
          output: `12.0
3.141592653589793
8
7
120`,
          outputNote: "Real output from CPython 3.12 — every value computed by the imported functions.",
          explain: [
            "One import line, and five professional tools are yours: square root, the constant pi, rounding up and down, and factorials.",
            "Notice `math.sqrt(144)` gives `12.0` — square roots come back as floats, because sqrt could return an irrational number like `1.414...` at any moment.",
            "`math.pi` is not a function — it is a *value* the module ships. No parentheses; you just read it.",
          ],
        },
        {
          kind: "text",
          text: "Why do modules exist at all? Two reasons. **Organization**: Python's own developers keep thousands of functions in separate named drawers, so nothing collides. **Choice**: the datetime machinery does not load every time you run a hello-world — you pay for the drawers you open.",
        },
        {
          kind: "heading",
          text: "from-import: unpack a few tools",
        },
        {
          kind: "code",
          title: "Three import styles in one program",
          code: `from math import sqrt, pi
from statistics import mean as average

scores = [82, 90, 76, 94]

print("mean:", average(scores))
print("circle area:", round(pi * 3 ** 2, 2))
print("diagonal of 3x4:", sqrt(3 ** 2 + 4 ** 2))
`,
          output: `mean: 85.5
circle area: 28.27
diagonal of 3x4: 5.0`,
          explain: [
            "`from math import sqrt, pi` unpacks two names directly — no `math.` prefix needed. Handy when you use one or two tools heavily.",
            "`from statistics import mean as average` imports `mean` **and renames** it to `average` in your file. The `as` alias is common for shortening long names.",
            "The trade-off: the drawer label disappears, so someone reading your file cannot tell *where* `sqrt` came from. That is why many teams prefer plain `import math` except for tiny scripts.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Which import style should you use?",
          text: "Rule of thumb: `import math` when you use several things (readers see the source, no collisions); `from math import sqrt` for one or two heavily-used tools; `as` for renaming. One style to refuse: `from math import *` (the star) dumps every name into your file, silently overwriting same-named variables — never use it.",
        },
        {
          kind: "heading",
          text: "A quick tour of the standard library",
        },
        {
          kind: "table",
          title: "Drawers you will actually open in this course",
          headers: ["Module", "What it gives you", "Typical call"],
          rows: [
            ["math", "Constants and mathematical functions", "math.sqrt(2), math.pi, math.factorial(5)"],
            ["random", "Pseudo-random numbers and choices", "random.randint(1, 6), random.choice(list)"],
            ["datetime", "Dates, times, and date arithmetic", "datetime(2026, 11, 14)"],
            ["statistics", "mean, median, mode, stdev and friends", "statistics.mean(scores)"],
            ["collections", "Smarter containers, e.g. Counter", "Counter(text).most_common(3)"],
            ["itertools", "Infinite and lazy sequence tools", "islice(count(10, 3), 5)"],
          ],
          caption:
            "Over 200 modules ship with Python — no download, no install. You will meet collections in g-05 and itertools in g-06.",
        },
        {
          kind: "text",
          text: "Randomness creates a problem for a course like this: if every run prints different numbers, how do you know your program is right? The fix is `random.seed()`. A seed picks the *starting point* of the pseudo-random sequence, so the same seed always produces the same numbers. Same seed, same sequence — on your machine, on ours, everywhere.",
        },
        {
          kind: "code",
          title: "Seeded random: run it a hundred times, same answer",
          code: `import random

random.seed(42)
print(random.randint(1, 6))
print(random.randint(1, 6))
print(random.randint(1, 6))
print(round(random.random(), 3))
print(random.choice(["Hearts", "Diamonds", "Spades", "Clubs"]))
`,
          output: `6
1
1
0.742
Diamonds`,
          explain: [
            "`random.randint(1, 6)` throws a die: any whole number from 1 to 6, both ends included.",
            "`random.random()` gives a float between 0 and 1 — here 0.742 (we rounded to keep the output tidy).",
            "`random.choice(list)` picks one element — a card suit.",
            "Seed 42, then this exact sequence. Run it yourself — that is the whole point. In real projects you seed when you need *reproducibility* (tests, bug reports) and let Python pick its own seed otherwise.",
          ],
        },
        {
          kind: "text",
          text: "Dates look simple but are full of traps: months have different lengths, leap years exist, weekdays shift. The `datetime` module handles all of it. We will always construct **fixed** dates — never 'now' — so every program in this course prints the same thing on every machine, on every day.",
        },
        {
          kind: "code",
          title: "Fixed dates and real arithmetic",
          code: `from datetime import datetime

launch = datetime(2026, 11, 14)
review = datetime(2026, 12, 25, 18, 30)

print("launch:", launch)
print("review:", review)
print("days between:", (review - launch).days)
print("launch weekday:", launch.strftime("%A"))
`,
          output: `launch: 2026-11-14 00:00:00
review: 2026-12-25 18:30:00
days between: 41
launch weekday: Saturday`,
          explain: [
            "`datetime(2026, 11, 14)` builds November 14, 2026 at midnight; adding `18, 30` sets 6:30 pm. You write year, month, day, hour, minute.",
            "Subtracting two datetimes gives a **timedelta**, and `.days` reads off the difference: 41 days.",
            "`strftime` (string-format time) renders parts of the date: `%A` is the full weekday name. November 14, 2026 is a Saturday — Python knows so you never count on your fingers again.",
          ],
        },
        {
          kind: "text",
          text: "In your Part F project you computed a class average with your own function — probably `sum(scores) / len(scores)`. It worked, and building it yourself was the right way to *learn*. Now meet the drawer where that tool (and its siblings) already live:",
        },
        {
          kind: "code",
          title: "The statistics drawer",
          code: `import statistics

scores = [82, 90, 76, 94, 88]

print("mean:", statistics.mean(scores))
print("median:", statistics.median(scores))
print("stdev:", round(statistics.stdev(scores), 3))
print("best score above mean:", round(max(scores) - statistics.mean(scores), 2))
`,
          output: `mean: 86
median: 88
stdev: 7.071
best score above mean: 8`,
          explain: [
            "`statistics.mean` replaces your hand-rolled average — one call, tested by millions of users.",
            "`median` is the middle value when sorted: 88 sits between 82, 90 above it... exactly two scores above and two below.",
            "`stdev` (standard deviation) measures spread — you may not need it yet, but when you do, it is one import away.",
            "Notice `mean` prints `86`, not `86.0`: with integer inputs the mean comes back as an integer when it is exact.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Finding your own tools",
          text: "Python's built-in manual is one call away: `help(statistics)` lists everything in the drawer, and `dir(math)` shows every name in a module. You saw `help(len)` in lesson a-06 — the same works for modules. Professionals do not memorize the library; they remember that *a tool probably exists* and go looking.",
        },
        {
          kind: "tryIt",
          title: "Try it — the module explorer",
          task: "This playground runs real Python. Use the math and statistics modules to compute: (1) the area of a circle with radius 2 (pi times radius squared, rounded to 2 places), (2) the mean quiz score, and (3) 6 factorial. Then add one line of your own that uses any math tool.",
          code: `import math
import statistics

# 1) area of a circle with radius 2 (use math.pi)
print("circle area:", round(math.pi * 2 ** 2, 2))

# 2) average of these quiz scores
scores = [7, 9, 8, 6, 10]
print("quiz mean:", statistics.mean(scores))

# 3) factorial of 6
print("6! =", math.factorial(6))
`,
          hint: "Everything is reached through the drawer: math.pi, math.factorial(6), statistics.mean(scores). Add your own line like print(math.gcd(12, 18)) or print(math.log(2.718281828459045)).",
        },
      ],
      terms: [
        { term: "Module", definition: "A ready-made Python file whose functions and constants you can load with import." },
        { term: "Standard library", definition: "The 200+ modules that ship with Python itself — no install needed: math, random, datetime, statistics, and more." },
        { term: "from-import", definition: "An import style that unpacks specific names, e.g. from math import sqrt, so you can call sqrt(2) with no prefix." },
        { term: "Alias", definition: "A local rename created with as, e.g. from statistics import mean as average." },
        { term: "Seed", definition: "The starting point of a pseudo-random sequence; random.seed(42) makes 'random' results reproducible." },
      ],
      mistakes: [
        {
          mistake: "Calling a module function without importing the module.",
          why: "`sqrt(16)` with no import raises NameError — Python does not guess which sqrt you meant; it does not even know the name exists.",
          fix: "Add `import math` at the top and call `math.sqrt(16)`, or use `from math import sqrt`.",
        },
        {
          mistake: "Using from math import * to save typing.",
          why: "The star dumps hundreds of names into your file; any of them can silently shadow your own variables (or be shadowed by them), creating bugs that only appear later.",
          fix: "Import the module, or the specific names you need. The star is banned in most professional codebases.",
        },
        {
          mistake: "Testing random code without seeding first.",
          why: "Unseeded randomness prints different numbers on every run, so a bug can hide one run and reappear the next — and a grader (or you, next week) cannot reproduce anything.",
          fix: "Call `random.seed(42)` once, before any random use, whenever you want reproducible behavior.",
        },
      ],
      takeaways: [
        "A module is a labeled toolbox; import opens the drawer and the dot picks the tool.",
        "import module for clarity, from module import name for convenience, as for renaming — never the star.",
        "The standard library ships with Python: math, random, datetime, statistics and 200 more drawers.",
        "random.seed(42) turns unpredictable randomness into a reproducible sequence.",
        "Before writing a function that sounds like math, check the math and statistics drawers first.",
      ],
      quiz: [
        {
          id: "g-01-q1",
          prompt: "What does the dot in math.sqrt(144) mean?",
          options: [
            { text: "It separates a module from the thing inside it — sqrt from the math drawer", correct: true, feedback: "Exactly — the dot says 'the sqrt that lives in math', which is also why names from different drawers never collide." },
            { text: "It is decimal notation applied to functions", correct: false, feedback: "Decimal points belong to numbers like 3.14. Between two names, the dot is the membership operator." },
            { text: "It links a function to its return value", correct: false, feedback: "The link happens when you call with parentheses; the dot just selects sqrt from math." },
          ],
          explanation: "module.thing is how you reach anything inside an imported module — function, constant, or class.",
        },
        {
          id: "g-01-q2",
          prompt: "Why does this course call random.seed(42) before using random numbers in executed code?",
          options: [
            { text: "It makes the numbers truly random", correct: false, feedback: "Opposite — seeding makes the sequence repeatable, not more random." },
            { text: "It fixes the starting point of the pseudo-random sequence, so the same seed always yields the same numbers", correct: true, feedback: "Correct — seed 42 then randint(1, 6) gives 6, 1, 1 on every machine, every run. That makes outputs checkable." },
            { text: "It limits how many random numbers you may draw", correct: false, feedback: "No limit involved — you can draw as many as you like after seeding." },
          ],
          explanation: "Seeding trades surprise for reproducibility — exactly what programs, tests, and grading need.",
        },
        {
          id: "g-01-q3",
          prompt: "Your Part F project computed an average with sum(scores) / len(scores). What changes now?",
          options: [
            { text: "Nothing — sum and len are the only correct way", correct: false, feedback: "They are correct, but no longer the shortest or most readable way." },
            { text: "statistics.mean(scores) does it in one tested call — and its siblings (median, stdev) are in the same drawer", correct: true, feedback: "Right — building it yourself taught you what mean IS; importing it is what professionals DO." },
            { text: "You must install statistics with pip first", correct: false, feedback: "No install — statistics ships with Python; that is the whole 'batteries included' idea." },
          ],
          explanation: "Hand-roll once to learn, import forever to work — the standard library is your first coworker.",
        },
      ],
    },

    // ------------------------------------------------------------- g-02
    {
      slug: "g-02",
      title: "Packages",
      minutes: 13,
      summary:
        "How modules grow into packages, how pip installs from PyPI, why every real project lives in a virtual environment, and the __name__ test that makes your files both importable and runnable.",
      kind: "setup",
      objectives: [
        "Explain the difference between a module and a package",
        "Read a project's import lines given its folder structure",
        "Install a package with pip and record it in requirements.txt",
        "Say what a virtual environment is for, in one sentence",
        "Use the __name__ == '__main__' idiom to separate self-tests from imports",
      ],
      why: "So far all your code has lived in a single file, but every real project you will ever join is a folder of files that import each other — plus dozens of installed packages from PyPI, the Python Package Index with over half a million projects. Understanding packages, pip, and virtual environments is the difference between 'I wrote a script once' and 'I can open any Python repository and know what I am looking at'. This lesson is your map of that world.",
      blocks: [
        {
          kind: "text",
          text: "One file per project works until it does not. Around a few hundred lines, you start hunting for a function you know you wrote. The fix is as old as workshops: more drawers, and a drawer for the drawers. A **module** is one `.py` file. A **package** is simply a folder of modules. Suppose your note-taking project grows: you split it into modules — one for formatting, one for storage — and keep the main program in its own file. Dots in an import walk into folders:",
        },
        {
          kind: "visual",
          title: "A package on disk",
          ascii: `  notes_project/
  |
  |-- main.py              <- the program you RUN
  |-- formatting.py        <- a module: to_tag(), to_title()
  |-- storage.py           <- a module: save_note(), load_notes()
  +-- helpers/             <- a package: a FOLDER of modules
      |-- __init__.py      <- marks the folder as a package
      |-- dates.py         <- helpers.dates in imports

  # inside main.py you would write:
  #   import formatting            -> use formatting.to_tag(...)
  #   import helpers.dates          -> use helpers.dates.today_label()`,
          caption:
            "A module is a file; a package is a folder of modules. The dots in an import literally walk down the folder tree.",
        },
        {
          kind: "text",
          text: "Notice `__init__.py` inside the helpers folder. Its presence tells Python 'this folder is a package, not just a pile of files'. Modern Python can work without it, but you will still see it in almost every real project — sometimes empty, sometimes with setup code.",
        },
        {
          kind: "heading",
          text: "The __name__ trick: a file that knows why it is running",
        },
        {
          kind: "text",
          text: "Here is a question every module author faces: the same file should *behave differently* when run directly versus when imported. Run directly, it should demo itself; imported, it should stay quiet. Python solves this with a special variable. When a file is **executed directly**, its `__name__` variable is set to `\"__main__\"`. When the file is **imported** by another file, `__name__` is set to the module's own name instead.",
        },
        {
          kind: "code",
          title: "Proof: __name__ in a directly-run file",
          code: `print("This file's __name__ is:", __name__)

if __name__ == "__main__":
    print("So the main block runs.")
`,
          output: `This file's __name__ is: __main__
So the main block runs.`,
          explain: [
            "You ran this file yourself, so Python set `__name__` to `\"__main__\"` before executing it.",
            "If another file did `import this_file`, the same print would show the module's name instead, and the `if` would be False.",
            "That single comparison is the most famous idiom in Python: 'this block runs only for the person who ran me directly'.",
          ],
        },
        {
          kind: "code",
          title: "The idiom in a real module shape",
          code: `# vault.py — a module in the making

def to_tag(label, value):
    """Return a display line like 'name: Ada' from two parts."""
    return f"{label}: {value}"

if __name__ == "__main__":
    # runs only when this file is executed directly,
    # never when another file imports vault
    print("Running vault's own self-test")
    print(to_tag("name", "Ada"))
    print(to_tag("score", 98))
`,
          output: `Running vault's own self-test
name: Ada
score: 98`,
          outputNote: "Run python3 vault.py and you see this. If another file says import vault, the self-test block stays silent — only to_tag is available.",
          explain: [
            "The function is the module's product; the `if` block is its test bench.",
            "Importers get the function without the test noise. The author gets a one-command way to check the file still works.",
            "This is exactly how every standard-library module is organized: importable tools, plus self-tests that never fire on import.",
          ],
        },
        {
          kind: "heading",
          text: "Beyond the standard library: pip and PyPI",
        },
        {
          kind: "text",
          text: "The standard library is 200 drawers. **PyPI** — the Python Package Index — is a public warehouse with over half a million more, published by anyone: requests for talking to websites, pandas for data analysis, pygame for games. The tool that fetches and installs them is **pip**, and it comes with Python.",
        },
        {
          kind: "code",
          title: "Installing a package from PyPI (a real terminal session)",
          lang: "bash",
          code: `# installs the latest version from PyPI (needs internet, runs in YOUR terminal)
python3 -m pip install requests

# pip downloads, unpacks, and registers the package for this Python.
# from now on, "import requests" just works:

python3 -c "import requests; print('requests installed:', requests.__name__)"
# requests installed: requests`,
          outputNote:
            "Display-only: pip output varies by machine, version, and network, so it is never presented as verified program output. The last line is what your own terminal would show after a successful install.",
        },
        {
          kind: "text",
          text: "One warning before you install anything: installed packages land in *one shared pile* unless you do something about it. Project A needs requests 2.28, project B needs 2.32, and a version conflict breaks one of them. This is why every professional Python project works inside a **virtual environment** — a private copy of Python plus a private pile of packages, one folder per project. Conflicts become impossible because nothing is shared.",
        },
        {
          kind: "code",
          title: "Creating and entering a virtual environment",
          lang: "bash",
          code: `# one-time setup, inside your project folder
python3 -m venv .venv

# entering it (macOS / Linux)
source .venv/bin/activate

# entering it (Windows PowerShell)
.venv\\Scripts\\Activate.ps1

# while active, installs go into .venv — NOT the shared pile:
pip install requests

# leaving it
deactivate`,
          outputNote:
            "Display-only: the activate command differs by operating system. While active, your terminal prompt shows (.venv) — the signal that installs are private to this project.",
          explain: [
            "`python3 -m venv .venv` creates a folder named `.venv` containing a private Python interpreter.",
            "`activate` points your terminal at that private copy — from then on, `python3` and `pip` mean the private ones.",
            "`deactivate` steps back out to the shared Python. Nothing is deleted; you just switch which pile you install into.",
          ],
        },
        {
          kind: "text",
          text: "A project is not just code — it is code *plus the list of packages it needs*. That list lives in a file named **requirements.txt**, one package per line, and it is how teammates and servers rebuild the exact same environment in one command.",
        },
        {
          kind: "code",
          title: "requirements.txt and the one-line rebuild",
          lang: "text",
          code: `# requirements.txt — the project's shopping list
requests==2.32.3
matplotlib==3.9.2

# Anyone can clone the project and rebuild the same setup with:
#   python3 -m venv .venv
#   source .venv/bin/activate
#   pip install -r requirements.txt

# Pinning versions (the == part) means "this exact version, please" —
# your project stops breaking because a package updated overnight.`,
          outputNote:
            "Display-only. The == pins keep every teammate on the identical versions you tested with.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The professional loop, in four commands",
          text: "Clone a project: `python3 -m venv .venv` -> `source .venv/bin/activate` -> `pip install -r requirements.txt` -> `python3 main.py`. Every serious Python repository on earth starts with some version of this loop, and every README repeats it.",
        },
        {
          kind: "tryIt",
          title: "Try it — watch __name__ decide",
          task: "Run this playground program as-is and read its output. Then imagine a second file importing it: which lines would NOT run? Add one more line inside the if-block (for example, printing a second self-test) and run again.",
          code: `print("Right here, __name__ is:", __name__)

def welcome():
    """A tiny function this module would export."""
    return "welcome to the package tour"

if __name__ == "__main__":
    print(welcome())
`,
          hint: "Imported, only the first line's logic changes — __name__ would be the module's name, the welcome() function would still exist, but the if-block would be skipped entirely.",
        },
      ],
      terms: [
        { term: "Package", definition: "A folder of Python modules that imports address with dots, e.g. helpers.dates." },
        { term: "PyPI", definition: "The Python Package Index — the public warehouse of over half a million installable packages." },
        { term: "pip", definition: "The installer that fetches packages from PyPI and registers them for your Python (python3 -m pip install name)." },
        { term: "Virtual environment", definition: "A private copy of Python plus a private pile of packages for one project, created with python3 -m venv .venv." },
        { term: "requirements.txt", definition: "The shopping list of exact package versions a project needs; pip install -r requirements.txt rebuilds the setup." },
      ],
      mistakes: [
        {
          mistake: "Naming your own file math.py or random.py.",
          why: "Python searches the current folder first, so your file shadows the real standard-library module — then `import math` imports YOUR file and everything inside it goes missing in strange ways.",
          fix: "Give files distinctive names (my_math_practice.py). Never reuse a stdlib module's name for your own files.",
        },
        {
          mistake: "Installing packages into the shared system Python.",
          why: "Shared pile = shared conflicts: two projects that need different versions of the same package fight, and you upgrade a package for one project and break another.",
          fix: "Create and activate a virtual environment per project, and install into it. Keep it out of the project requirements by never committing the .venv folder.",
        },
        {
          mistake: "Sending teammates a list of packages in a chat message instead of requirements.txt.",
          why: "Unversioned, unorderable, and unrunnable — the chat is not a package manager, and 'it works on my machine' begins here.",
          fix: "Freeze the exact list with `pip freeze > requirements.txt` and let `pip install -r requirements.txt` do the rebuilding.",
        },
      ],
      takeaways: [
        "A module is a file; a package is a folder of modules; import dots walk the folders.",
        "__name__ is '__main__' only when a file is run directly — that is how self-tests stay silent on import.",
        "pip installs from PyPI into whichever Python is active — create a venv first so the pile is private.",
        "requirements.txt plus a virtual environment makes any project reproducible on any machine in two commands.",
      ],
      quiz: [
        {
          id: "g-02-q1",
          prompt: "A teammate's project folder contains the folder helpers with the file dates.py inside. How do you import it?",
          options: [
            { text: "import helpers.dates", correct: true, feedback: "Exactly — each dot steps one level down the folder tree: package, then module." },
            { text: "import dates from helpers", correct: false, feedback: "Not Python syntax — from X import Y exists, but folders are addressed with dots: helpers.dates." },
            { text: "import helpers/dates.py", correct: false, feedback: "Slashes are for the filesystem, not imports. Python uses dots." },
          ],
          explanation: "import helpers.dates loads the dates module from the helpers package — the dot mirrors the folder structure.",
        },
        {
          id: "g-02-q2",
          prompt: "Why does a virtual environment exist?",
          options: [
            { text: "To make Python run faster in isolation", correct: false, feedback: "Same interpreter speed — privacy of packages, not performance, is the point." },
            { text: "To give each project its own Python and package pile, so versions of different projects never conflict", correct: true, feedback: "Exactly — one project, one private pile. Conflicts between projects become impossible by construction." },
            { text: "To protect your code from viruses", correct: false, feedback: "A venv is a folder of interpreter plus packages — it is isolation, not security software." },
          ],
          explanation: "Virtual environments end 'works on my machine' by giving every project a private, reproducible setup.",
        },
        {
          id: "g-02-q3",
          prompt: "In a file you run directly, what is __name__ set to — and what would it be if another file imported it?",
          options: [
            { text: "'__main__' when run directly; the module's own name when imported", correct: true, feedback: "Correct — and that is exactly why if __name__ == '__main__': separates self-tests from importable behavior." },
            { text: "The file's name when run directly; '__main__' when imported", correct: false, feedback: "Reversed — running directly is the '__main__' case." },
            { text: "'__main__' in both cases", correct: false, feedback: "If that were true, imported self-tests would fire everywhere and imports would be noisy." },
          ],
          explanation: "The value of __name__ is how a file knows whether it was run as the program or loaded as a module.",
        },
      ],
    },
    // ------------------------------------------------------------- g-03
    {
      slug: "g-03",
      title: "File Handling",
      minutes: 15,
      summary:
        "Programs that remember: writing and reading files with open(), why with open() is the only right way, the four file modes, and reading line by line without drowning.",
      kind: "coding",
      objectives: [
        "Write text to a file and read it back with open()",
        "Use with open(...) so files close themselves, even on errors",
        "Choose deliberately between the r, w, and a modes",
        "Process a file line by line without loading it all into memory",
        "Explain the forgetting-to-close bug and its one-line fix",
      ],
      why: "Every program you have written so far forgot everything the moment it ended. The programs that matter — a notes app, a data pipeline, a game with save files — survive between runs because they write to files. Files are also where real data lives: logs, exports, CSVs, notes. This lesson gives you the read/write reflexes every later project needs, and the with-statement habit that separates beginners who lose data from professionals whose programs clean up after themselves.",
      blocks: [
        {
          kind: "text",
          text: "A **file** is your program's long-term memory. Write results to a file and they survive a reboot; read them back and your program continues where it left off. Python does file work with one function — `open()` — plus a small set of habits that this lesson drills until they are reflexes.",
        },
        {
          kind: "heading",
          text: "The three steps: open, work, close",
        },
        {
          kind: "text",
          text: "`open(path, mode)` hands you a **file object** — your handle to a file on disk. You write through it, you read through it, and when you are done you must `close()` it. Closing is not decoration: it tells the operating system you are finished and flushes your last writes from the in-memory **buffer** onto the actual disk. Here is the manual version, spelled out:",
        },
        {
          kind: "code",
          title: "The manual way (it works, but you must remember close)",
          code: `f = open("/tmp/manual.txt", "w")
f.write("The manual way works")
f.write(" only if you remember close().\\n")
f.close()

with open("/tmp/manual.txt", "r") as f:
    print(f.read(), end="")
`,
          output: `The manual way works only if you remember close().`,
          explain: [
            "`\"w\"` means write mode — the file is created fresh (or an existing one is emptied!).",
            "Two `write()` calls land back-to-back: write does not add spaces or newlines for you, which is why the first string ends with the escape `\\n`.",
            "`close()` flushes the buffer to disk. Until it runs (or Python exits), your text may exist only in memory.",
          ],
        },
        {
          kind: "code",
          title: "The anti-pattern you will meet in old code",
          lang: "text",
          code: `# What NOT to write — shown as text, deliberately not executed:
f = open("/tmp/report.txt", "w")   # 1. opened...
f.write("quarterly figures")        # 2. written...
print("done, on with the next task")
# 3. close() never happens

# If the program keeps running, the file object stays open and
# the "quarterly figures" may still be sitting in the buffer,
# not on disk. Open files also leak: the OS allows only so many,
# so a program that forgets to close eventually cannot open
# anything at all.`,
          outputNote:
            "Display-only. This is the shape of code that loses data — the next block shows the fix.",
        },
        {
          kind: "heading",
          text: "with open(): the file that closes itself",
        },
        {
          kind: "text",
          text: "Python has a construct that closes the file for you, always — even if an error interrupts the program halfway: the **with statement**. Read it as *'with this file open, do this work'*: inside the block the file is open; at the block's end — however the block ends — Python closes it. This is the only style professionals use, and the only style this course uses from now on.",
        },
        {
          kind: "code",
          title: "Write, then read back, the with way",
          code: `with open("/tmp/planets.txt", "w") as f:
    f.write("Mercury\\n")
    f.write("Venus\\n")
    f.write("Earth\\n")

with open("/tmp/planets.txt", "r") as f:
    contents = f.read()

print(contents, end="")
print("---")
print("characters stored:", len(contents))
`,
          output: `Mercury
Venus
Earth
---
characters stored: 20`,
          explain: [
            "Two separate with-blocks: one opens the file for writing, one re-opens it for reading. Mode `\"r\"` is the default, but writing it out makes the intent obvious.",
            "`f.read()` slurps the whole file into one string — including the newline characters, so `len()` counts 20: 8 for Mercury plus newline, 6 for Venus plus newline, 6 for Earth plus newline.",
            "`print(contents, end=\"\")` avoids an extra blank line: the text already ends with a newline of its own.",
            "No `close()` anywhere — and yet the files are safely shut the instant each block ends.",
          ],
        },
        {
          kind: "heading",
          text: "Three ways to read: whole, all lines, one at a time",
        },
        {
          kind: "code",
          title: "readlines() and the line loop",
          code: `with open("/tmp/planets.txt", "w") as f:
    f.write("Mercury\\nVenus\\nEarth\\n")

with open("/tmp/planets.txt", "r") as f:
    lines = f.readlines()
print("readlines gives:", lines)

with open("/tmp/planets.txt", "r") as f:
    for i, line in enumerate(f, start=1):
        print(f"line {i}: {line.strip()}")
`,
          output: `readlines gives: ['Mercury\\n', 'Venus\\n', 'Earth\\n']
line 1: Mercury
line 2: Venus
line 3: Earth`,
          explain: [
            "`readlines()` returns a list — one string per line, **newlines still attached**. That is why the print shows `'Mercury\\n'` — the backslash-n is visible because the list is printed as code, not as text.",
            "Looping over the file object reads it **one line at a time**: the with-block hands `for` the next line on each pass. For a giant log file this is the difference between using a trickle of memory and loading gigabytes.",
            "`line.strip()` removes the trailing newline (and any spaces) before printing. `enumerate(f, start=1)` gives you a counter alongside each line, as you met in Part D.",
          ],
        },
        {
          kind: "table",
          title: "The file modes you need 95% of the time",
          headers: ["Mode", "Meaning", "If the file exists", "If it does not"],
          rows: [
            ["\"r\"", "Read only", "Opens it", "FileNotFoundError"],
            ["\"w\"", "Write from scratch", "ERASES all its contents first", "Creates it"],
            ["\"a\"", "Append to the end", "Adds after the last line", "Creates it"],
            ["\"r+\"", "Read and write", "Opens it", "FileNotFoundError"],
          ],
          caption:
            "There are binary twins too — \"rb\", \"wb\" for images, PDFs, and anything that is not human-readable text. Text (notes, CSV, JSON) covers almost everything this course touches.",
        },
        {
          kind: "heading",
          text: "Append mode: the mode beginners forget",
        },
        {
          kind: "code",
          title: "'a' adds; 'w' erases — watch closely",
          code: `with open("/tmp/planets.txt", "w") as f:
    f.write("Mercury\\nVenus\\nEarth\\n")

with open("/tmp/planets.txt", "a") as f:
    f.write("Mars\\n")

with open("/tmp/planets.txt", "r") as f:
    print(f.read(), end="")

with open("/tmp/planets.txt", "w") as f:
    f.write("Pluto\\n")

with open("/tmp/planets.txt", "r") as f:
    print(f.read(), end="")
`,
          output: `Mercury
Venus
Earth
Mars
Pluto`,
          explain: [
            "Append mode added Mars under the three existing lines — nothing was touched.",
            "Then write mode opened the same file and it instantly contained only Pluto. `\"w\"` does not warn you; it empties the file the moment it opens it.",
            "A program that 'loses' data after every run is almost always opening with `\"w\"` where it meant `\"a\"`. Decide before you type: *starting over, or adding to?*",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Paths in this course: /tmp only",
          text: "Executed code in this course and the browser playground writes only to `/tmp` paths like `/tmp/notes.txt` — a scratch area both real Python and the in-browser sandbox share. On your own machine, prefer paths next to your script (`\"notes.txt\"`) so your files are easy to find — and never write to system folders.",
        },
        {
          kind: "tryIt",
          title: "Try it — the shopping list round-trip",
          task: "Write three items to /tmp/shopping.txt, append a fourth, then read the file back and print each item numbered 1..4. Run it, then run it a second time — why does the output not double? (Hint: which mode starts the file fresh?)",
          code: `# 1) Write three items to a shopping list file
with open("/tmp/shopping.txt", "w") as f:
    f.write("oat milk\\n")
    f.write("coffee beans\\n")
    f.write("bananas\\n")

# 2) Append one more item below
with open("/tmp/shopping.txt", "a") as f:
    f.write("dark chocolate\\n")

# 3) Read everything back, numbered
with open("/tmp/shopping.txt", "r") as f:
    for number, item in enumerate(f, start=1):
        print(number, item.strip())

print("list saved at /tmp/shopping.txt")
`,
          hint: "The second run starts with mode 'w', which empties the file before writing the same three lines again — so the list never grows past four items.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The newline reflex",
          text: "When a line looks double-spaced in your output, your string already ended with `\\n` and `print()` added another. Reach for `line.strip()` when reading, and `print(text, end=\"\")` when printing text that carries its own newlines.",
        },
      ],
      terms: [
        { term: "File object", definition: "The handle open() returns; you read and write through it and close it when done." },
        { term: "with statement", definition: "A block that opens a resource and guarantees it is closed at the end, even on errors: with open(path) as f:" },
        { term: "File mode", definition: "The second argument to open(): 'r' read, 'w' write-from-scratch, 'a' append, 'r+' read-and-write." },
        { term: "Buffer", definition: "A small holding area in memory where writes wait until close() flushes them to disk." },
        { term: "Path", definition: "The address of a file, e.g. /tmp/notes.txt — in this course's executed code, always a /tmp path." },
      ],
      mistakes: [
        {
          mistake: "Opening a file with 'w' when you meant 'a'.",
          why: "'w' empties the file the instant it opens it, so every run silently erases yesterday's work — the classic 'my notes vanish' bug.",
          fix: "Ask before typing: starting fresh or adding to the end? Fresh → 'w'; adding → 'a'.",
        },
        {
          mistake: "Calling f.read() and then f.read() again on the same open file.",
          why: "The file object remembers its position; the second read() starts where the first stopped — at the end — and returns an empty string.",
          fix: "Read once and keep the string, or close and reopen the file. Inside a with-block, a fresh open() gives you a fresh position.",
        },
        {
          mistake: "Forgetting that lines keep their trailing newline.",
          why: "readlines() and line loops hand you 'Mercury\\n', not 'Mercury' — printing it inside another string produces stray blank-looking lines.",
          fix: "Call .strip() on each line as you consume it: line.strip() is a habit worth forming now.",
        },
        {
          mistake: "Using a file object after its with-block ended.",
          why: "The block closes the file on exit; a write through the closed handle raises ValueError: I/O operation on closed file.",
          fix: "Keep all work with a file inside its with-block — and use two separate blocks for two separate visits.",
        },
      ],
      takeaways: [
        "open() gives a file object; write or read through it; close it — or better, let with close it for you.",
        "with open(...) as f: is the professional form: the file closes even when an error interrupts the block.",
        "'w' erases on open, 'a' appends, 'r' reads — choose before you type, because 'w' does not warn.",
        "Loop over the open file to read line by line — memory stays small even for huge files.",
        "strip() each line as you read it; the newline is part of the data otherwise.",
      ],
      quiz: [
        {
          id: "g-03-q1",
          prompt: "Why is with open(path, 'w') as f: better than f = open(path, 'w')?",
          options: [
            { text: "It is shorter to type", correct: false, feedback: "Barely — and brevity is not the reason it exists." },
            { text: "The file is closed automatically when the block ends, even if an error interrupts the program", correct: true, feedback: "Exactly — the with-statement is a cleanup guarantee, which is why it is the only style professionals use." },
            { text: "It makes the file write faster", correct: false, feedback: "Same speed — the difference is correctness: guaranteed closing, no leaked handles, no lost buffers." },
          ],
          explanation: "with turns 'remember to close' into 'impossible to forget' — the same idea whether the block ends normally or with an error.",
        },
        {
          id: "g-03-q2",
          prompt: "A program must add today's line to an existing /tmp/log.txt without touching earlier lines. Which mode?",
          options: [
            { text: "'a' — append mode", correct: true, feedback: "Right: 'a' adds after the last line and creates the file if it is missing — exactly what logs need." },
            { text: "'w' — write mode", correct: false, feedback: "Danger: 'w' empties the file the moment it opens it. Every earlier line would be destroyed." },
            { text: "'r+' — read-and-write mode", correct: false, feedback: "Possible with careful positioning, but 'a' is the direct, purpose-built tool for adding lines." },
          ],
          explanation: "Append mode exists precisely for 'keep what is there, add to the end' — logs, notes, journals.",
        },
        {
          id: "g-03-q3",
          prompt: "You loop over an open file: for line in f: — what is each line's value?",
          options: [
            { text: "The line's text with a trailing newline character still attached", correct: true, feedback: "Correct — 'Mercury\\n', newline included. That is why line.strip() is such a common companion." },
            { text: "The line's text, already stripped of the newline", correct: false, feedback: "Python hands you the raw line, newline included — stripping is your job, with .strip()." },
            { text: "A list of all lines", correct: false, feedback: "The loop hands one line at a time — a list is what readlines() returns, and that loads everything at once." },
          ],
          explanation: "Raw lines keep their newline; loop line-by-line for memory, strip for cleanliness.",
        },
      ],
    },

    // ------------------------------------------------------------- g-04
    {
      slug: "g-04",
      title: "Exception Handling",
      minutes: 16,
      summary:
        "try/except: catching the errors you expected, ordering specific handlers first, else and finally, raising your own errors, and why a bare except is a bug in disguise.",
      kind: "concept",
      objectives: [
        "Catch a specific exception with try/except and recover instead of crashing",
        "Order multiple except branches so the specific ones run first",
        "Use else for the success path and finally for cleanup that always runs",
        "Raise a ValueError deliberately to reject bad input",
        "Explain why bare except and 'catch everything' are dangerous",
      ],
      why: "You learned to read tracebacks in Part A; now you learn to write programs that survive them. Real inputs are hostile: users type 'twelve', files vanish, divisors are zero. A program without exception handling dies at the first surprise; a program with it answers 'that was not a number, try again' and keeps working. This lesson is also where debugging gets surgical: knowing exactly which exception to catch — and what to deliberately not catch — is the difference between hiding bugs and handling problems.",
      blocks: [
        {
          kind: "text",
          text: "An **exception** is Python's way of saying *stop — something happened that breaks the rules*. Lesson a-09 taught you to read the resulting traceback. Today you take the next step: *anticipating* the errors your program can meet and deciding, in advance, what to do about them.",
        },
        {
          kind: "text",
          text: "Converting text to a number is the classic surprise: `int()` works on `\"42\"` but has no idea what to do with `\"12 tacos\"`. Unhandled, the exception kills the program:",
        },
        {
          kind: "code",
          title: "The crash, uncaught",
          code: `text = "12 tacos"
number = int(text)
print("parsed:", number)
`,
          expectError: "ValueError: invalid literal for int() with base 10: '12 tacos'",
          explain: [
            "`int(\"12 tacos\")` cannot work: the text has words glued to the number, so no clean integer is hiding inside.",
            "Python raises a **ValueError** — the exception for 'the type is fine, the value is nonsense'.",
            "Nothing catches it, so the program stops dead and the final print never runs. Next: we catch it.",
          ],
        },
        {
          kind: "text",
          text: "The crash above is what Python does with no plan B. The plan B is three lines:",
        },
        {
          kind: "code",
          title: "The same crash, caught and survived",
          code: `text = "12 tacos"
try:
    number = int(text)
    print("parsed:", number)
except ValueError:
    print("I cannot read", repr(text), "as a whole number")
`,
          output: `I cannot read '12 tacos' as a whole number`,
          explain: [
            "`try:` wraps the risky operation. If no exception happens, its lines run normally.",
            "`except ValueError:` is the rescue plan: runs *only* if that specific exception was raised inside the try block.",
            "The program continues after the except block — no traceback, no crash, just a clear message.",
            "Note the print still produced the readable value: `repr(text)` shows the quotes so the user sees exactly what was rejected.",
          ],
        },
        {
          kind: "text",
          text: "One try can be followed by several except branches. Python checks them **top to bottom** and runs the first matching one — so the specific exceptions must come first. This is the shape of most real-world handling:",
        },
        {
          kind: "code",
          title: "Three inputs, three different failures, one function",
          code: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "cannot divide by zero"
    except TypeError:
        return "numbers only, please"

print(safe_divide(10, 4))
print(safe_divide(10, 0))
print(safe_divide(10, "two"))
`,
          output: `2.5
cannot divide by zero
numbers only, please`,
          explain: [
            "The clean case returns 2.5 — the try block succeeded, no except branch ran.",
            "Dividing by zero raises ZeroDivisionError; the first branch answers with a useful sentence.",
            "Dividing by a string raises TypeError; the second branch handles it.",
            "Return values instead of prints make the function testable — the caller decides what to do with the message.",
          ],
        },
        {
          kind: "code",
          title: "The file-flavored exception: FileNotFoundError",
          code: `try:
    with open("/tmp/vault_that_is_not_there.txt", "r") as f:
        print(f.read())
except FileNotFoundError:
    print("No vault file found - starting a fresh one instead.")
`,
          output: `No vault file found - starting a fresh one instead.`,
          explain: [
            "Opening a missing file for reading raises FileNotFoundError — you met it in the modes table in g-03.",
            "This handler chooses a *recovery*: say something friendly and let the program go on to create the file later.",
            "The with-statement still does its closing job during the failure — one more reason the combination is the professional form.",
          ],
        },
        {
          kind: "text",
          text: "Two optional clauses complete the pattern: `else` runs when **no** exception happened, and `finally` runs **always** — success or failure — which is what cleanup (closing, saving, resetting) demands. Watch the full order, traced:",
        },
        {
          kind: "code",
          title: "A full trace of the four paths",
          code: `def parse_rating(text):
    """Turn text into a rating, with a full trace of the flow."""
    print(f"parsing {text!r}")
    try:
        value = int(text)
    except ValueError:
        print("  except branch: conversion failed")
        return None
    else:
        print("  else branch: conversion succeeded")
        return value
    finally:
        print("  finally: cleanup, always runs")

print("result:", parse_rating("4"))
print("result:", parse_rating("four"))
`,
          output: `parsing '4'
  else branch: conversion succeeded
  finally: cleanup, always runs
result: 4
parsing 'four'
  except branch: conversion failed
  finally: cleanup, always runs
result: None`,
          explain: [
            "For '4': conversion succeeds, so the else branch runs — then finally, then the value 4 returns.",
            "For 'four': conversion fails, so the except branch runs — then finally still runs, then None returns.",
            "Read the trace again and notice: `finally` fired both times, *before* the function actually returned. That is exactly its guarantee — cleanup happens no matter which exit you take.",
            "Keep the success path in else rather than in try: code in try is 'might fail'; code in else is 'only if all of that worked'.",
          ],
        },
        {
          kind: "text",
          text: "Catching is half the toolkit; the other half is **raising** — creating the exception on purpose when your own function receives nonsense. Functions that validate their inputs this way fail loudly at the source instead of computing garbage quietly downstream. This demo raises and deliberately does *not* catch, so you can see both sides:",
        },
        {
          kind: "code",
          title: "A guard that raises (and nobody catches it)",
          code: `def check_temperature(celsius):
    if celsius > 100:
        raise ValueError(f"{celsius} C would boil water")
    print(f"{celsius} C is a fine temperature")

check_temperature(21)
check_temperature(105)   # nothing catches this - the program stops here
print("this line never runs")
`,
          expectError: "ValueError: 105 C would boil water",
          explain: [
            "The first call passes the guard and prints normally.",
            "The second call breaks the rule, so the function raises ValueError with a message you wrote.",
            "Because nothing catches it here, the exception propagates: the program stops, and the final print never runs. Wrap the *caller* in try/except and the same raise becomes a handled situation instead of a crash.",
            "Message craft matters: put the offending value in the message so the traceback tells the story.",
          ],
        },
        {
          kind: "text",
          text: "The one rule that separates handling from hiding: **catch an exception only if the code that catches it can actually do something about it.** If your recovery is real — use a default, ask again, skip the line, start fresh — catch it. If your 'recovery' is shrugging, let the exception fly. That brings us to the forbidden form:",
        },
        {
          kind: "code",
          title: "Bare except: the bug that looks like a feature",
          lang: "text",
          code: `# What NOT to write — deliberately not executed:
try:
    do_important_things()
except:                      # catches EVERYTHING, even things
    pass                     # you have never heard of... and does nothing

# This catches ZeroDivisionError, FileNotFoundError, ValueError -
# and also the KeyboardInterrupt you press to STOP a runaway
# program, and any typo that raises NameError inside the try.
# It turns every failure, including your own bugs, into silence.
# Bugs in this code do not crash loudly; they vanish without a trace.

# The professional rule:
#   1. except SomeSpecificError:  - always
#   2. never a bare except:
#   3. never 'pass' as the whole handler`,
          outputNote:
            "Display-only. If you must catch broadly, use 'except Exception' and log the problem — but specific is always better.",
        },
        {
          kind: "table",
          title: "The exceptions worth knowing by name",
          headers: ["Exception", "Raised when", "Typical recovery"],
          rows: [
            ["ValueError", "Right type, impossible value: int('12 tacos')", "Show a friendly message; ask again"],
            ["ZeroDivisionError", "Dividing (or modding) by zero", "Skip the row; require a nonzero divisor"],
            ["FileNotFoundError", "open() for reading a path that does not exist", "Create the file; start fresh; report the path"],
            ["TypeError", "Operation on the wrong type: 10 / 'two'", "Validate/convert inputs before computing"],
            ["KeyError", "Dictionary lookup with a missing key", "Use a default: prices.get(key, 0)"],
          ],
          caption:
            "You met these names in Part A's error reading; now you catch them by name. The traceback's last line is exactly the text after 'except'.",
        },
        {
          kind: "tryIt",
          title: "Try it — the tolerant sum",
          task: "Run this: the loop adds up every entry that converts cleanly and reports the ones it skips. Then make it stricter: change the except to also catch TypeError, and add a 'total, skipped' summary line with an f-string. Watch that no run ever crashes.",
          code: `entries = ["7", "oops", "42", "", "13"]
total = 0
skipped = 0

for entry in entries:
    try:
        total += int(entry)
    except ValueError:
        print("skipping:", repr(entry))
        skipped += 1

print("sum:", total, "| skipped:", skipped)
`,
          hint: "The empty string '' raises ValueError too — a favorite exam surprise. The recovery (skip, count, continue) is real, so catching here is legitimate.",
        },
      ],
      terms: [
        { term: "Exception", definition: "An error object Python raises when something breaks the rules: ValueError, ZeroDivisionError, FileNotFoundError, and friends." },
        { term: "try/except", definition: "The handling pair: code that might fail goes in try; the rescue for one specific exception goes in except." },
        { term: "raise", definition: "To create an exception on purpose, e.g. raise ValueError('why') — how functions reject bad inputs loudly." },
        { term: "finally clause", definition: "A block after try/except that runs on every path — success, handled failure, even unhandled ones. Where cleanup lives." },
        { term: "Bare except", definition: "except: with no exception named — catches everything including your own bugs. Banned in professional code." },
      ],
      mistakes: [
        {
          mistake: "Putting the general handler above the specific one.",
          why: "Python runs the first except whose type matches, so except Exception first swallows every failure and your specific branches become dead code.",
          fix: "Order most-specific to most-general: ValueError before Exception, never the other way around.",
        },
        {
          mistake: "Using except: with pass to 'make it stop crashing'.",
          why: "It does stop crashing — by hiding every problem, including typos (NameError), user interrupts, and real bugs. Silent wrong answers are worse than loud crashes.",
          fix: "Catch the one exception you expect, and make the recovery real: a default, a message, a skipped line, a re-ask.",
        },
        {
          mistake: "Catching an exception you cannot actually handle.",
          why: "If your handler cannot fix the situation, it just moves the failure somewhere more confusing — often with a misleading message attached.",
          fix: "Let it propagate. Catch only where a genuine recovery exists; everything else should crash loudly and honestly.",
        },
        {
          mistake: "Forgetting that FileNotFoundError is the exception for missing files.",
          why: "Beginners wrap file opens in generic except Exception or, worse, check os.path.exists first — a race condition where the file can vanish between the check and the open.",
          fix: "Just open it and catch FileNotFoundError: the check and the failure are the same event.",
        },
      ],
      takeaways: [
        "try wraps the risky code; except names the exact failure and supplies the plan B.",
        "Order handlers most-specific first — the first matching branch wins.",
        "else is the success path, finally is the always path: cleanup goes there.",
        "raise ValueError('message with the bad value') is how your functions reject nonsense loudly.",
        "Catch what you can handle; a bare except does not fix bugs, it buries them.",
      ],
      quiz: [
        {
          id: "g-04-q1",
          prompt: "int('twelve') fails inside a try. Which except line catches it?",
          options: [
            { text: "except ValueError:", correct: true, feedback: "Right — 'twelve' is a string (type fine), but its value cannot become an integer: ValueError by definition." },
            { text: "except TypeError:", correct: false, feedback: "TypeError is for the wrong TYPE, like 10 / 'two'. Here the type (str) is accepted; the content is the problem." },
            { text: "except intError:", correct: false, feedback: "No such exception exists — the name is ValueError, exactly what the traceback would print." },
          ],
          explanation: "Type fits, value does not: ValueError. Reading the traceback's last line gives you the exact name to catch.",
        },
        {
          id: "g-04-q2",
          prompt: "What does finally guarantee?",
          options: [
            { text: "It runs only when an exception was raised", correct: false, feedback: "No — that is almost the opposite: finally runs on the success path too." },
            { text: "It runs on every exit path of the try: success, handled exception, even an error nobody caught", correct: true, feedback: "Exactly — 'always' is its entire job, which is why cleanup code lives there." },
            { text: "It prevents the exception from propagating", correct: false, feedback: "It runs regardless, but after it the error continues on its way unless you catch it." },
          ],
          explanation: "finally = 'no matter how this ends, do this first' — closing files, saving state, resetting counters.",
        },
        {
          id: "g-04-q3",
          prompt: "Why is 'except:' with 'pass' banned in professional code?",
          options: [
            { text: "It is a syntax error", correct: false, feedback: "It runs — that is the problem. Python accepts it silently." },
            { text: "It catches everything, including your own bugs and user interrupts, and turns them all into silence", correct: true, feedback: "Correct — a handler that does nothing converts loud, fixable failures into quiet, unfixable ones." },
            { text: "It slows the program down", correct: false, feedback: "Speed is irrelevant here; the issue is that hiding failures makes debugging impossible." },
          ],
          explanation: "Every real handler answers the question 'what is the recovery?' — pass is the admission there is none, so do not catch.",
        },
      ],
    },
    // ------------------------------------------------------------- g-05
    {
      slug: "g-05",
      title: "Comprehensions",
      minutes: 14,
      summary:
        "The Part D loop-and-append pattern compressed into one readable line: list comprehensions, filters, dict and set comprehensions, nested loops for matrices, and where the readability line is.",
      kind: "coding",
      objectives: [
        "Rewrite a build-a-list loop as a list comprehension",
        "Filter and transform in one expression, and say which happens first",
        "Build dicts and sets with comprehensions",
        "Unpack a nested comprehension for a matrix, reading inside-out",
        "Judge when a comprehension hurts readability and a loop wins",
      ],
      why: "You have written the same five-line pattern dozens of times since Part D: create an empty list, loop, transform, append. Python noticed — comprehensions express that whole pattern in one line that reads like the sentence describing the result. They are everywhere in real code: a data pipeline is comprehensions stacked on comprehensions. Learning them is not optional decoration; it is the moment your Python starts to look like the Python you see in books, documentation, and other people's projects.",
      blocks: [
        {
          kind: "text",
          text: "Here is a pattern you have written since Part D and probably written fifty times: empty list, loop, compute, append. Comprehensions are Python's shortcut for exactly that shape — same result, one readable line.",
        },
        {
          kind: "code",
          title: "The same program, before and after",
          code: `temps = [21, 25, 19, 30, 28]

# Part D style: loop and append
f_from_loop = []
for c in temps:
    f_from_loop.append(c * 9 / 5 + 32)

# Part G style: the same idea in one expression
f_from_comp = [c * 9 / 5 + 32 for c in temps]

print(f_from_loop)
print(f_from_comp)
`,
          output: `[69.8, 77.0, 66.2, 86.0, 82.4]
[69.8, 77.0, 66.2, 86.0, 82.4]`,
          explain: [
            "The loop takes four lines plus the empty list; the comprehension takes one.",
            "Read the comprehension left to right as a sentence: *the list of c times 9 over 5 plus 32, for every c in temps*.",
            "Identical output — but the comprehension also signals intent at a glance: this line's whole purpose is to build this list.",
          ],
        },
        {
          kind: "visual",
          title: "Anatomy of a comprehension",
          ascii: `        [  c * 9 / 5 + 32   for c in temps  if c >= 20  ]
           ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^ ^^^^^^^^^^^^^
           |                |              |
      what EACH element    |           the FILTER: keep only
      becomes (transform)  |           elements passing the test
                           |
              the SOURCE: where elements come from

   order of operations: take c -> filter it in or out -> transform it
`,
          caption:
            "The output expression sits FIRST (unlike the loop, where it came last). The for clause names the source; the optional if filters.",
        },
        {
          kind: "text",
          text: "If you did lesson f-08's map and filter exercises, this looks familiar — comprehensions do the same job as `map` (transform) and `filter` (keep) with names you do not have to import or define. Most Python teams prefer comprehensions for exactly that readability:",
        },
        {
          kind: "code",
          title: "map/filter and comprehension: two spellings, one meaning",
          code: `def to_fahrenheit(c):
    return c * 9 / 5 + 32

def is_hot(c):
    return c >= 25

temps = [21, 25, 19, 30, 28]

# f-08 style: map + filter + list
hot_f_map = list(map(to_fahrenheit, filter(is_hot, temps)))
# comprehension style: reads like the sentence
hot_f_comp = [to_fahrenheit(c) for c in temps if is_hot(c)]

print(hot_f_map)
print(hot_f_comp)
`,
          output: `[77.0, 86.0, 82.4]
[77.0, 86.0, 82.4]`,
          explain: [
            "Both keep the hot readings (25 and up) and convert them — 25 to 77, 30 to 86, 28 to 82.4.",
            "The comprehension puts the source first and reads naturally; the map/filter form reads inside-out from the innermost call.",
            "Keep the map/filter idea in your head — it is how many other languages do it — but write the comprehension.",
          ],
        },
        {
          kind: "code",
          title: "Three questions, three comprehensions",
          code: `scores = [88, 45, 92, 61, 73, 55]

passed = [s for s in scores if s >= 60]
curved = [min(s + 5, 100) for s in scores]
passed_and_curved = [min(s + 5, 100) for s in scores if s >= 60]

print(passed)
print(curved)
print(passed_and_curved)
`,
          output: `[88, 92, 61, 73]
[93, 50, 97, 66, 78, 60]
[93, 97, 66, 78]`,
          explain: [
            "Filter only: keep the passing scores — 45 and 55 drop out.",
            "Transform only: everyone gets +5, capped at 100 by `min(s + 5, 100)` so nobody scores above 100.",
            "Both: the if runs first (decide membership), then the transform applies to survivors. 61 + 5 is 66; 73 + 5 is 78 — only the four survivors got curved.",
          ],
        },
        {
          kind: "heading",
          text: "Dict and set comprehensions",
        },
        {
          kind: "text",
          text: "Swap the square brackets for braces and the same pattern builds the other two containers you met in Part E. For a **dict comprehension** you write `key: value` as the expression; for a **set comprehension** any single expression, and duplicates vanish automatically.",
        },
        {
          kind: "code",
          title: "Building dicts and sets from one line",
          code: `names = ["ada", "grace", "alan"]
badge_length = {name.upper(): len(name) for name in names}
print(badge_length)

prices = {"coffee": 4.5, "tea": 2.75, "mocha": 5.25}
raised = {item: round(price * 1.1, 2) for item, price in prices.items()}
print(raised)
`,
          output: `{'ADA': 3, 'GRACE': 5, 'ALAN': 4}
{'coffee': 4.95, 'tea': 3.03, 'mocha': 5.78}`,
          explain: [
            "First: for each name, the key is `name.upper()` and the value is `len(name)` — a lookup table built in one line.",
            "Second: `prices.items()` yields key-value pairs (Part E), the comprehension rebuilds the dict with each price raised 10% and rounded to cents.",
            "Note 2.75 * 1.1 rounds to 3.03 and 5.25 * 1.1 to 5.78 — `round()` at 2 places keeps money tidy.",
          ],
        },
        {
          kind: "code",
          title: "Set comprehension plus the Counter cousin",
          code: `words = ["python", "loop", "PYTHON", "Loop", "python", "LOOP"]
unique = {w.lower() for w in words}
print(sorted(unique))

from collections import Counter
counts = Counter("abracadabra")
print(counts.most_common(3))
`,
          output: `['loop', 'python']
[('a', 5), ('b', 2), ('r', 2)]`,
          explain: [
            "The set comprehension lowercases everything; the set's no-duplicates rule shrinks six words to two. `sorted()` turns the set back into a tidy list.",
            "`Counter` (from the collections drawer of g-01's tour) is a dict-shaped counting machine: feed it any iterable and it counts elements.",
            "`most_common(3)` returns the top three as (element, count) pairs — a: 5 times, b: 2, r: 2, in first-seen order for ties.",
            "A counting loop you write by hand is a `Counter` one-liner waiting to happen.",
          ],
        },
        {
          kind: "text",
          text: "A comprehension's source can itself be a comprehension — that is how you process nested lists. Read nested comprehensions **inside-out**: the inner one builds each piece; the outer one assembles them.",
        },
        {
          kind: "code",
          title: "Row sums and a transposed matrix",
          code: `matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

row_sums = [sum(row) for row in matrix]
transposed = [[row[i] for row in matrix] for i in range(3)]

print(row_sums)
print(transposed)
`,
          output: `[6, 15, 24]
[[1, 4, 7], [2, 5, 8], [3, 6, 9]]`,
          explain: [
            "`row_sums` is a plain comprehension: each element is a row, so `sum(row)` gives 6, 15, 24.",
            "`transposed` reads outside-in first: a list of *something*, one per i in 0..2. The something is the inner comprehension `[row[i] for row in matrix]` — column i top to bottom.",
            "So i = 0 collects the first column [1, 4, 7], i = 1 the middle column, and the matrix comes out rotated.",
            "If you have to read a nested comprehension twice to see what it does — that is the signal for the next block.",
          ],
        },
        {
          kind: "text",
          text: "Comprehensions are not a goal; **readability is the goal**. The moment a comprehension needs a comment to be understood, the loop it replaced was better. Here is the test case — same logic, both ways:",
        },
        {
          kind: "code",
          title: "When the plain loop wins",
          code: `sales = [1200, 850, 2400, 990, 1750, 620]

# The comprehension version of this logic is a wall of code:
# totals = [round(s * 1.08, 2) for s in sales
#           if s > 900 and s * 1.08 < 2000]
# (it also multiplies twice - a real bug magnet)

# The loop says the same thing in plain, debuggable steps:
totals = []
for s in sales:
    with_tax = s * 1.08
    if s > 900 and with_tax < 2000:
        totals.append(round(with_tax, 2))

print(totals)
`,
          output: `[1296.0, 1069.2, 1890.0]`,
          explain: [
            "The loop gets a named variable `with_tax`, computes the tax **once**, and lets you put a print inside any step while debugging.",
            "Three surviving sales: 1200 (1296.0 with tax), 990 (1069.2), and 1750 (1890.0). The others fail the filter: too small or, with tax, over 2000.",
            "House rule: one comprehension, one transform, at most one condition, no nesting you cannot read aloud.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "One line, one idea",
          text: "A comprehension should answer a single question: *'the list of x-transformed items from source that pass the test'*. The moment your line answers two questions, or needs the reader to hold three things in their head, write the loop instead. Future-you is the most important reader.",
        },
        {
          kind: "tryIt",
          title: "Try it — comprehension practice",
          task: "Three drills on one scores list: (1) a list comprehension keeping only passing scores (>= 70); (2) a comprehension transforming those survivors: +5 bonus points, capped at 100 with min(); (3) a dict comprehension mapping each score to its square. Then predict each output BEFORE running.",
          code: `scores = [72, 95, 48, 83, 61, 99, 55]

passing = [s for s in scores if s >= 70]
print("passing:", passing)

bumped = [min(s + 5, 100) for s in passing]
print("bumped:", bumped)

squares = {s: s * s for s in scores}
print("score squares:", squares)
`,
          hint: "passing keeps 72, 95, 83, 99. bumped: min(77,100), min(100,100)... watch 95 become 100. The dict has one entry per score, keys are the scores themselves.",
        },
      ],
      terms: [
        { term: "List comprehension", definition: "A one-line builder for lists: [transform(item) for item in source if condition]." },
        { term: "Condition clause", definition: "The optional 'if' part of a comprehension that filters elements before they are transformed." },
        { term: "Dict comprehension", definition: "A comprehension in braces that builds a dictionary: {key_expr: value_expr for item in source}." },
        { term: "Set comprehension", definition: "A comprehension in braces building a set, automatically discarding duplicates: {expr for item in source}." },
        { term: "Nested comprehension", definition: "A comprehension whose source or expression contains another comprehension, e.g. building a matrix's columns." },
      ],
      mistakes: [
        {
          mistake: "Putting the filter condition in the wrong place: [x if x > 0 for x in nums].",
          why: "That is a SyntaxError — the if-filter must come AFTER the for clause: [x for x in nums if x > 0].",
          fix: "Remember the order: transform, for, then filter. (The 'value if condition else value' ternary inside the transform is a different, legitimate construct.)",
        },
        {
          mistake: "Assuming the transform runs before the filter.",
          why: "Readers expect loop order (take, test, transform), but either way comprehension applies the filter first — mismatched expectations produce off-by-filter bugs.",
          fix: "Read the clauses aloud: 'FOR each s IN scores, IF it passes, THEN transform it.' Filter decides membership; transform touches only survivors.",
        },
        {
          mistake: "Comprehending everything, including three-line ideas.",
          why: "Nested comprehensions with multiple conditions hide bugs (like computing an expression twice) and cannot be debugged line by line.",
          fix: "Apply the one-idea rule: one transform, at most one filter, no unread nesting. Otherwise, keep the loop — readability counts.",
        },
      ],
      takeaways: [
        "[expr for x in source if cond] replaces the empty-list-loop-append pattern in one readable line.",
        "Filter first, transform second — the if decides membership before the expression touches a survivor.",
        "Braces build dicts {key: value for ...} and sets {value for ...}; duplicates vanish in sets by design.",
        "Counter counts anything in one call — a hand-rolled counting loop is a missing import.",
        "One comprehension = one idea; when a loop reads better, write the loop.",
      ],
      quiz: [
        {
          id: "g-05-q1",
          prompt: "Predict: [n * 2 for n in [1, 2, 3, 4] if n != 2] evaluates to...",
          options: [
            { text: "[2, 4, 8]", correct: false, feedback: "Close — but check the filter: n != 2 removes 2, so 2 is not doubled at all." },
            { text: "[2, 6, 8]", correct: true, feedback: "Correct: 2 stays out (n != 2 is False for it), then survivors double: 1 to 2, 3 to 6, 4 to 8." },
            { text: "[1, 3, 4]", correct: false, feedback: "That is the filtered source before the transform — do not forget the n * 2." },
          ],
          explanation: "Filter first (drop 2), then transform (double the survivors): [2, 6, 8].",
        },
        {
          id: "g-05-q2",
          prompt: "In [min(s + 5, 100) for s in scores if s >= 60], which runs first for a score of 45?",
          options: [
            { text: "min(45 + 5, 100) is computed, then the result is checked against the condition", correct: false, feedback: "Backwards — and it would waste the work: the filter runs first." },
            { text: "The if runs first; 45 fails it, so the transform never touches 45 at all", correct: true, feedback: "Exactly — membership is decided before transformation. 45 never gets its +5." },
            { text: "They run in parallel", correct: false, feedback: "Nothing in a comprehension runs in parallel; the order is take, test, transform." },
          ],
          explanation: "The condition clause is a gate: only survivors reach the transform expression.",
        },
        {
          id: "g-05-q3",
          prompt: "You need to loop over some sales, apply a 10% tax ONCE, and print a per-item breakdown while debugging. What do you write?",
          options: [
            { text: "A comprehension with the tax computed in both the condition and the expression", correct: false, feedback: "That duplicates the tax math — a bug magnet (change one, forget the other) and impossible to print inside." },
            { text: "The plain for loop, with a named with_tax variable you can inspect and print", correct: true, feedback: "Right — the loop names each step, computes once, and welcomes debug prints. Readability is the goal, not line count." },
            { text: "A nested comprehension inside a set comprehension", correct: false, feedback: "Extra machinery, zero added clarity — this is exactly the wall of code the readability line warns about." },
          ],
          explanation: "Choose the form you can read aloud and debug; comprehensions are for simple build-a-list ideas.",
        },
      ],
    },

    // ------------------------------------------------------------- g-06
    {
      slug: "g-06",
      title: "Iterators",
      minutes: 14,
      summary:
        "What 'for x in xs' has been doing all along: the iter/next protocol, StopIteration, why the same list can be looped twice but an exhausted iterator cannot, and a first taste of itertools.",
      kind: "concept",
      objectives: [
        "Turn an iterable into an iterator with iter() and pull values with next()",
        "Explain StopIteration as the 'no more items' signal rather than a failure",
        "Describe how a for loop consumes an iterator under the hood",
        "Distinguish an iterable from an iterator, including for file objects",
        "Slice an infinite itertools.count() safely with islice()",
      ],
      why: "You have written 'for item in items' hundreds of times — this lesson opens the hood and shows the two functions underneath. Why bother? Because the iterator protocol is the common language of EVERYTHING that can be looped: lists, strings, dicts, files, and the generators coming in the next lesson. Data work is loop work, and once you see 'loopable' as a contract any object can fulfill, reading a file line by line without loading it, chaining infinite sequences, and writing lazy pipelines all stop being tricks and become obvious consequences of one small mechanism.",
      blocks: [
        {
          kind: "text",
          text: "Every `for` loop you have written — over lists, strings, dictionaries, even over an open file in g-03 — runs on the same two-function engine underneath. This lesson is about that engine. Understanding it turns `for` from magic into machinery, and it is the direct foundation for the generators in g-07.",
        },
        {
          kind: "text",
          text: "Think of a long book and a bookmark. The book itself sits still — it does not tell you the next page; the bookmark does. In Python, `iter(books)` hands you the bookmark (an **iterator**), and `next(bookmark)` moves it forward and tells you what you landed on. You can drive a loop by hand with nothing else:",
        },
        {
          kind: "code",
          title: "Pulling values by hand",
          code: `letters = ["a", "b", "c"]
it = iter(letters)

print(next(it))
print(next(it))
print(next(it))
`,
          output: `a
b
c`,
          explain: [
            "`iter(letters)` creates the iterator — the bookmark placed before the first element.",
            "Each `next(it)` advances the bookmark and returns the element it passed.",
            "The list `letters` was never touched or consumed — the iterator simply remembered a position inside it.",
          ],
        },
        {
          kind: "text",
          text: "So what happens when the bookmark runs off the end? The iterator cannot return 'nothing' — functions always return *something*. Python's answer is to raise an exception: **StopIteration**, the signal for *there are no more items*. Watch it fire:",
        },
        {
          kind: "code",
          title: "The end of the line",
          code: `it = iter(["a", "b"])
print(next(it))
print(next(it))
print(next(it))
`,
          expectError: "StopIteration",
          explain: [
            "Two elements, so the first two next() calls print a and b.",
            "The third call has nothing left to hand you, so it raises StopIteration.",
            "An uncaught StopIteration looks scary — but you have been catching it all along without knowing, because... (next block)",
          ],
        },
        {
          kind: "text",
          text: "Every `for item in things` is Python secretly doing this: call `iter()` once, then `next()` repeatedly, and when StopIteration fires, catch it quietly and end the loop. You can prove it by writing the machine yourself:",
        },
        {
          kind: "code",
          title: "A for loop, spelled out",
          code: `letters = ["a", "b", "c"]

# what 'for letter in letters' really does:
it = iter(letters)
while True:
    try:
        letter = next(it)
    except StopIteration:
        break
    print("processing", letter)

print("loop finished")
`,
          output: `processing a
processing b
processing c
loop finished`,
          explain: [
            "`iter()` is called exactly once per loop; `next()` is called once per element plus once more — that final call is the one that raises.",
            "The `except StopIteration: break` is the loop's exit — that is why a for loop never shows you StopIteration, and why exhausting an iterator inside a loop feels so natural.",
            "This is the **iteration protocol**: any object that supports `iter()` can be looped by anything that speaks `for` — lists, strings, dicts, files, and (next lesson) your own generators.",
          ],
        },
        {
          kind: "visual",
          title: "The machinery, in motion",
          ascii: `   for letter in letters:
        print(letter)

   letters  --iter()-->  [bookmark]  --next()--> 'a'  -> body
                          |    ^                        |
   body ends              |    |______next()___________|
   (go pull again)        |
                          v  next() on empty -> StopIteration
                          v  (caught -> loop ends quietly)

   THE LIST   produces AN ITERATOR   which produces VALUES
   (iterable)      (once)           (until exhausted)`,
          caption:
            "Iterable, iterator, values: three different roles. The for loop coordinates them; StopIteration is the curtain call.",
        },
        {
          kind: "heading",
          text: "Iterables vs iterators: a distinction with a difference",
        },
        {
          kind: "table",
          title: "Two roles in the protocol",
          headers: ["", "Iterable", "Iterator"],
          rows: [
            ["Definition", "Anything that can produce an iterator: list, str, dict, file, range", "The bookmark itself: produced by iter(), driven by next()"],
            ["How to use", "Put it after 'for x in ...'", "next(it) pulls values one at a time"],
            ["Loop it twice?", "Yes — a fresh iterator each time", "No — after exhaustion it stays empty forever"],
            ["Consume directly?", "Only after iter() (Python does it for you)", "It is the consumption itself"],
          ],
          caption:
            "A list is an iterable. A file object is BOTH: it can be looped, and it tracks its own position — which is why looping the same open file a second time yields nothing.",
        },
        {
          kind: "text",
          text: "That last line in the caption explains a g-03 mystery: a file object keeps its own position, so `for line in f:` twice on the same open file gives you lines the first time and silence the second. The file's bookmark is at the end. Close and reopen — a fresh iterator — and the lines return.",
        },
        {
          kind: "code",
          title: "A file is an iterator: the memory-friendly read",
          code: `with open("/tmp/haiku.txt", "w") as f:
    f.write("old pond\\n")
    f.write("frog leaps in\\n")
    f.write("sound of water\\n")

with open("/tmp/haiku.txt", "r") as f:
    for number, line in enumerate(f, start=1):
        print(f"line {number}: {line.strip()}")
`,
          output: `line 1: old pond
line 2: frog leaps in
line 3: sound of water`,
          explain: [
            "`for line in f` does not read the file first and loop over a list — it pulls one line per next(), on demand.",
            "A 10-gigabyte log file processed this way never needs more than one line in memory at a time.",
            "The enumerate + strip combination from g-03 now has its why: the loop is consuming an iterator, not a list.",
          ],
        },
        {
          kind: "text",
          text: "The standard library has a whole drawer for this world: **itertools**, where the famous building block is `count()` — an *infinite* counter that starts anywhere and never stops. You cannot loop it directly (the loop would never end), so the drawer ships the safety scissors too: `islice()` takes exactly the first n items from any iterator, then stops asking.",
        },
        {
          kind: "code",
          title: "Infinite supply, bounded demand",
          code: `from itertools import count, islice

first_five = list(islice(count(10, 3), 5))
print(first_five)

# without the islice fence, this would run forever:
# for value in count(10, 3):    # 10, 13, 16, 19, ... no end
#     print(value)
`,
          output: `[10, 13, 16, 19, 22]`,
          explain: [
            "`count(10, 3)` is an infinite iterator: 10, 13, 16, 19, 22, 25... it would happily count until your machine dies.",
            "`islice(..., 5)` acts like a fence: it pulls exactly five values through and then raises StopIteration to the loop — the polite end you now know about.",
            "`list()` collects the five values into a list so we can print them in one go. This infinite-and-slice pattern is real: numbering lines, batching records, generating test data.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — bookmarks and fresh starts",
          task: "Predict the output BEFORE running. Watch how the two next() calls consume the first two items — and notice that the for loop that follows starts from the BEGINNING. Why? Then check the final islice line: which two numbers does an infinite odd counter give up?",
          code: `transport = ["walk", "bike", "bus", "train"]

it = iter(transport)
print(next(it))
print(next(it))

for mode in transport:
    print(mode)

from itertools import count, islice
two_odds = list(islice(count(1, 2), 2))
print("first two odd numbers:", two_odds)
`,
          hint: "The for loop calls iter(transport) again — a FRESH bookmark on the same list. Iterables can be re-iterated; that is what makes them iterable. count(1, 2) yields 1, then 3.",
        },
      ],
      terms: [
        { term: "Iterator", definition: "An object with a position inside a sequence; next(it) returns the next value and advances the position." },
        { term: "Iterable", definition: "Anything that can produce an iterator via iter() — lists, strings, dicts, ranges, files, generators." },
        { term: "Iteration protocol", definition: "The iter()/next() contract that for loops run on: one iter(), repeated next(), StopIteration ends it." },
        { term: "StopIteration", definition: "The exception an exhausted iterator raises — the 'no more items' signal, caught silently by every for loop." },
        { term: "itertools", definition: "The standard-library drawer of iterator tools, including infinite count() and the bounding islice()." },
      ],
      mistakes: [
        {
          mistake: "Calling next() directly on a list: next([1, 2, 3]).",
          why: "A list is an iterable, not an iterator — it has no position, so next() raises TypeError. Only the bookmark knows where it is.",
          fix: "Create the iterator first: next(iter([1, 2, 3])) — or in practice, it = iter(my_list) once, then next(it).",
        },
        {
          mistake: "Reusing an exhausted iterator and expecting the old values again.",
          why: "An iterator is a position, and the position is now 'past the end'; next() raises StopIteration forever after that.",
          fix: "Keep the source iterable and call iter() again for each pass — or reopen the file, rebuild the range, regenerate.",
        },
        {
          mistake: "Looping an infinite iterator directly (for x in count()).",
          why: "count() never raises StopIteration, so the loop never sees the end — your program freezes until you kill it (Ctrl+C).",
          fix: "Wrap it in islice(count(), 5) — take exactly what you need and let the fence raise StopIteration for you.",
        },
        {
          mistake: "Forgetting why the second for over the same open file prints nothing.",
          why: "The file object is its own iterator: the first loop drove its bookmark to the end, so the second loop starts at the end and immediately gets StopIteration.",
          fix: "Reopen the file for each pass (with open... twice), or read once into a list and loop that.",
        },
      ],
      takeaways: [
        "iter() makes an iterator (bookmark); next() pulls the next value; StopIteration means 'done'.",
        "Every for loop is this protocol wearing friendlier clothes.",
        "Iterable = can be looped repeatedly (fresh iterator each time); iterator = single-use position.",
        "File objects are iterators, so looping reads them lazily — huge files, tiny memory.",
        "itertools.count() is infinite on purpose; islice() is how you take only the first n.",
      ],
      quiz: [
        {
          id: "g-06-q1",
          prompt: "it = iter([10, 20, 30]); after three next(it) calls, what does a fourth next(it) do?",
          options: [
            { text: "Returns None to say there is nothing left", correct: false, feedback: "Tempting, but None is a value — iterators say 'done' by exception, not by value." },
            { text: "Raises StopIteration", correct: true, feedback: "Correct — and if a for loop is driving, it catches that quietly and ends, which is how loops have always stopped." },
            { text: "Starts over from the beginning", correct: false, feedback: "Iterators are one-way, single-use bookmarks — reset only by making a new iterator from the iterable." },
          ],
          explanation: "StopIteration is the protocol's 'end of data' signal — not an error in the bug sense, just the curtain call.",
        },
        {
          id: "g-06-q2",
          prompt: "Which statement about iterables and iterators is TRUE?",
          options: [
            { text: "A list is an iterator because you can loop it", correct: false, feedback: "Loops work because Python calls iter() on the list FIRST — the list is the iterable, the thing it returns is the iterator." },
            { text: "An iterable can produce fresh iterators; an iterator tracks a single one-way position", correct: true, feedback: "Exactly — that is why you can loop the same list twice but never reuse an exhausted iterator." },
            { text: "Every iterator is also a file", correct: false, feedback: "Backwards relationship: files happen to BE iterators; most iterators are not files." },
          ],
          explanation: "Iterable: the book. Iterator: the bookmark. One book, many bookmarks — but each bookmark only moves forward.",
        },
        {
          id: "g-06-q3",
          prompt: "Why is looping over an open 10 GB log file line by line safe?",
          options: [
            { text: "Python secretly loads only the first megabyte", correct: false, feedback: "No hidden chunking — the mechanism is simpler and better than that." },
            { text: "The file is an iterator, so each next() pulls exactly one line, on demand — memory stays tiny no matter the size", correct: true, feedback: "Correct — lazy, one-line-at-a-time consumption is the whole point of the protocol for files." },
            { text: "readlines() is called automatically for you", correct: false, feedback: "readlines() would load ALL lines into memory at once — the opposite of safe for huge files." },
          ],
          explanation: "Iterating a file reads on demand: the loop asks for a line, the file gives a line. Size of file: irrelevant. Size of memory: one line.",
        },
      ],
    },
    // ------------------------------------------------------------- g-07
    {
      slug: "g-07",
      title: "Generators",
      minutes: 14,
      summary:
        "yield: functions that produce values one at a time and pause in between. Lazy evaluation, generator expressions feeding sum() and max(), and why a million numbers need only 200 bytes.",
      kind: "coding",
      objectives: [
        "Write a generator function with yield and consume it with next()",
        "Explain lazy evaluation: nothing runs until a value is demanded",
        "Use a generator expression with sum(), max(), and for loops",
        "Say why generators make memory problems disappear",
        "Trace how generators power for loops via StopIteration",
      ],
      why: "g-06 taught you to consume iterators; this lesson teaches you to CREATE them — with a single keyword. Generators are functions that produce a value, freeze, and resume on demand, which means a program can handle enormous or even infinite streams of data using almost no memory. Every real data pipeline you will ever read — log processors, feed readers, pandas internals — is built from this idea. It is also the natural completion of the functions story from Part F: return hands back one value and ends the function; yield hands back value after value and keeps the function alive.",
      blocks: [
        {
          kind: "text",
          text: "Part F gave you functions that `return` one value and end. g-06 gave you iterators that hand out values one at a time. A **generator** is what you get when you put those two ideas together: a function that hands out values one at a time — and *pauses between them* until someone asks for the next.",
        },
        {
          kind: "text",
          text: "The keyword is `yield`. Where `return` means *'here is the answer, goodbye'*, `yield` means *'here is the NEXT value, and I am pausing right here until you want another'*. The moment a function contains one yield, calling it does not run the function at all — it hands you a **generator object**, ready to produce values on demand:",
        },
        {
          kind: "code",
          title: "Three lines before any code runs",
          code: `def countdown(start):
    """Yield numbers from start down to 1, one at a time."""
    n = start
    while n > 0:
        yield n
        n = n - 1

rocket = countdown(3)
print("generator created - no code has run yet")
print("first next():", next(rocket))
print("second next():", next(rocket))
print("third next():", next(rocket))
`,
          output: `generator created - no code has run yet
first next(): 3
second next(): 2
third next(): 1`,
          explain: [
            "After `rocket = countdown(3)`, NOTHING has executed — no line of the function's body has run. The print proves it: we created the generator first, then asked for values.",
            "The first `next()` runs the function from the top until it hits `yield n` — hands over 3, and freezes right there.",
            "The second `next()` thaws the function exactly where it paused (n = n - 1, loop back, yield again): 2. The third gives 1.",
            "This is **lazy evaluation**: values are produced on demand, never in advance. A countdown from one billion would cost nothing until someone actually asks for its numbers.",
          ],
        },
        {
          kind: "visual",
          title: "Produced on demand, not in advance",
          ascii: `   NORMAL FUNCTION                 GENERATOR

   countdown(3)                     rocket = countdown(3)
   |                                |   (nothing runs yet)
   v                                v   next()  --------+
   builds ALL results:             |   runs until yield 3   |
   [3, 2, 1]                       |   freezes at yield     |
   returns them at once             |<-------+              |
   function is done                 |   next()  --------+   |
                                   |   resumes: 2 ...      |
                                   |   next()  ------->  1  |
                                   v   next()  -------> StopIteration
   eager: make everything          lazy: make each thing
   before anyone asks              the moment it is asked for`,
          caption:
            "A generator is a paused function with a bookmark in it — the same iterator protocol from g-06, driven by next().",
        },
        {
          kind: "text",
          text: "What happens after the last yield? The function simply reaches its end — and Python raises the familiar signal automatically: StopIteration, exactly like any exhausted iterator. Here is the whole life cycle, deliberately left uncaught so you can see the ending:",
        },
        {
          kind: "code",
          title: "A generator's one and only value",
          code: `def one_time():
    yield "only value"

g = one_time()
print(next(g))
print(next(g))
`,
          expectError: "StopIteration",
          explain: [
            "`one_time` yields a single value, then its body ends.",
            "The first next() gets 'only value'. The second next() tries to resume — but the function already finished, so Python raises StopIteration.",
            "No exception was raised by hand; ending the function IS the raise. That is why generators slot into for loops with zero ceremony.",
          ],
        },
        {
          kind: "text",
          text: "Now g-06's machinery pays off: a for loop over a generator calls `next()` for you and catches the StopIteration quietly. You write the producer; the loop is the consumer:",
        },
        {
          kind: "code",
          title: "The producer-consumer pair",
          code: `def countdown(start):
    n = start
    while n > 0:
        yield n
        n = n - 1

for t in countdown(5):
    print("T-minus", t)
print("LIFTOFF")
`,
          output: `T-minus 5
T-minus 4
T-minus 3
T-minus 2
T-minus 1
LIFTOFF`,
          explain: [
            "The loop pulled five values, one at a time, exactly when each was needed.",
            "When the generator ran out, the loop ended silently and LIFTOFF printed.",
            "The while loop inside countdown is the real engine — the for loop outside just pumps it.",
          ],
        },
        {
          kind: "text",
          text: "Remember g-05's comprehensions? Replace the square brackets with parentheses and you get a **generator expression** — the same recipe, but lazy: it computes nothing until consumed. When you feed one straight to a function like `sum()`, you can skip even the parentheses.",
        },
        {
          kind: "code",
          title: "Same recipe, two kinds of packaging",
          code: `squares_list = [x * x for x in range(1, 6)]
squares_gen = (x * x for x in range(1, 6))

print("list:", squares_list)
print("sum without a list:", sum(x * x for x in range(1, 6)))
print("biggest square:", max(x * x for x in range(1, 6)))

gen = (x * x for x in range(1, 6))
print("first next:", next(gen))
print("second next:", next(gen))
`,
          output: `list: [1, 4, 9, 16, 25]
sum without a list: 55
biggest square: 25
first next: 1
second next: 4`,
          explain: [
            "The list comprehension built all five squares immediately. The generator expression built nothing — `squares_gen` is a recipe waiting to be read.",
            "`sum(x * x for x in range(1, 6))` streams the five squares straight into sum: 1 + 4 + 9 + 16 + 25 = 55, with no intermediate list ever existing.",
            "The next() calls confirm the laziness: the recipe produced 1, then 4, on demand.",
            "Style rule: when a for-consuming function (sum, max, min, any, all) is the ONLY consumer, use the generator expression.",
          ],
        },
        {
          kind: "text",
          text: "Here is the demonstration that wins arguments. Build the numbers 0 to 999,999 twice — once eagerly as a list, once lazily as a generator — and measure both with `sys.getsizeof()`, which reports an object's memory footprint in bytes:",
        },
        {
          kind: "code",
          title: "Eight million bytes vs two hundred",
          code: `import sys

big_list = [x for x in range(1_000_000)]
big_gen = (x for x in range(1_000_000))

print("list of a million:", sys.getsizeof(big_list), "bytes")
print("generator:", sys.getsizeof(big_gen), "bytes")
print("list first three:", big_list[:3])
print("gen first three:", next(big_gen), next(big_gen), next(big_gen))
`,
          output: `list of a million: 8448728 bytes
generator: 192 bytes
list first three: [0, 1, 2]
gen first three: 0 1 2`,
          explain: [
            "The eager list holds a million pointers in memory: about 8.4 MB — before even counting the numbers they point to.",
            "The generator is the same *recipe* and costs 192 bytes, because it stores only the current position and the code, not the values.",
            "Yet both yield the same values on demand: 0, 1, 2... as the last two lines show.",
            "Multiply by real data — millions of rows, huge log files — and laziness stops being an optimization and becomes the only way the program fits in memory.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why 192 bytes and not 8 million?",
          text: "A generator does not *contain* values; it contains the *method for making them plus a bookmark* — the same mechanism as the file objects from g-06 that never load the whole file. Memory cost is fixed; the sequence it can produce is effectively unlimited. (The byte counts vary slightly across Python versions and machines; the 44,000-to-1 ratio is the point.)",
        },
        {
          kind: "text",
          text: "This completes a circle started in g-03: files are iterators, iterators are consumable lazily, and generators let you WRITE lazy streams yourself. The classic pipeline reads a huge file lazily, filters it with a generator, and feeds it to sum — the whole dataset never exists in memory at once.",
        },
        {
          kind: "tryIt",
          title: "Try it — write and consume a generator",
          task: "First predict, then run. The generator yields even numbers up to the limit; the for loop prints each as it is produced. Then check the final line: the generator expression inside sum() computes 4 + 16 + 36 for the evens up to 6 — verify 56, and try changing 6 to 10 for 220.",
          code: `def evens_up_to(limit):
    """Yield the even numbers 2, 4, 6... up to limit."""
    n = 2
    while n <= limit:
        yield n
        n = n + 2

for number in evens_up_to(10):
    print("even:", number)

total = sum(x * x for x in evens_up_to(6))
print("sum of squares of evens up to 6:", total)
`,
          hint: "The for loop calls next() until StopIteration — you never see the exception. For the sum: 2 squared is 4, 4 squared is 16, 6 squared is 36; total 56.",
        },
      ],
      terms: [
        { term: "Generator", definition: "A function containing yield; calling it returns a lazy iterator that resumes the function on each next()." },
        { term: "yield", definition: "The keyword that hands out one value and pauses the function at that exact spot until the next request." },
        { term: "Lazy evaluation", definition: "Computing values only at the moment they are demanded — generators do nothing in advance." },
        { term: "Generator expression", definition: "A comprehension in parentheses, (expr for x in source), producing values lazily instead of building a list." },
        { term: "Eager vs lazy", definition: "Eager code builds everything up front (a list); lazy code produces on demand (a generator). Laziness trades a little speed for huge memory savings." },
      ],
      mistakes: [
        {
          mistake: "Writing return where you meant yield (or vice versa).",
          why: "return ends the function after one value — your 'generator' produces a single result and stops. yield pauses and keeps the function alive for the next request.",
          fix: "Ask: does this function give ONE answer (return) or a STREAM of answers (yield)? A stream means yield.",
        },
        {
          mistake: "Expecting the generator body to run when you call the function.",
          why: "Calling a generator function only creates the object — the first line of the body has not executed. Beginners print it and see something like <generator object ...> and think it is broken.",
          fix: "Consume it: next() it, loop it, or feed it to sum()/list(). The body runs only as values are demanded.",
        },
        {
          mistake: "Trying to loop the same generator a second time.",
          why: "A generator is a single-use iterator (g-06): once exhausted, it raises StopIteration forever — the second for loop over it simply does nothing.",
          fix: "If you need the values twice, either call the generator function again (a fresh generator), or materialize once with list() and loop that.",
        },
        {
          mistake: "Building a list inside sum() out of habit: sum([x * x for x in ...]).",
          why: "The list comprehension builds the entire list first, then sums — for big inputs that is a large memory spike for zero benefit.",
          fix: "Drop the brackets: sum(x * x for x in ...) streams the values straight into the sum, one at a time.",
        },
      ],
      takeaways: [
        "yield turns a function into a value factory: produce, pause, resume on demand.",
        "Calling a generator function runs nothing; next() runs it piece by piece.",
        "Generator loops end the same way all loops end: StopIteration, caught quietly by for.",
        "Parentheses make a comprehension lazy: (x * x for x in ...) — perfect food for sum(), max(), min().",
        "Generators hold a recipe and a bookmark, not the data — million-value sequences in ~200 bytes.",
      ],
      quiz: [
        {
          id: "g-07-q1",
          prompt: "Right after rocket = countdown(3) runs, how much of countdown's body has executed?",
          options: [
            { text: "All of it — the values are computed at creation", correct: false, feedback: "That would be eager behavior; generators are the opposite." },
            { text: "None of it — the generator is a paused recipe until the first next()", correct: true, feedback: "Correct — creation is free; the first next() runs the body up to the first yield." },
            { text: "Only the first yield line, which pre-computes the first value", correct: false, feedback: "Even the first value waits: nothing at all runs until demanded." },
          ],
          explanation: "Lazy means lazy: no code, no value, no cost — until something asks.",
        },
        {
          id: "g-07-q2",
          prompt: "Predict: what does this print? def g(): yield 1; yield 2 — then print(sum(g()))",
          options: [
            { text: "3", correct: true, feedback: "Correct — sum() pulls 1, pulls 2, gets StopIteration, adds them: 3. No list was ever built." },
            { text: "1", correct: false, feedback: "sum does not stop at the first value — it consumes the whole stream." },
            { text: "A TypeError, because sum cannot take a generator", correct: false, feedback: "sum happily eats any iterable — that is one of its main jobs." },
          ],
          explanation: "Consuming functions (sum, max, min, list) drive generators with the exact protocol from g-06.",
        },
        {
          id: "g-07-q3",
          prompt: "Why is sum(x * x for x in range(1_000_000)) often better than sum([x * x for x in range(1_000_000)])?",
          options: [
            { text: "It is easier to type", correct: false, feedback: "Typing is not the issue — memory is." },
            { text: "The generator version streams one square at a time; the list version builds a million-item list before summing even starts", correct: true, feedback: "Exactly — same result, but the lazy version needs a handful of bytes instead of a huge intermediate list." },
            { text: "The generator version rounds more accurately", correct: false, feedback: "The arithmetic is identical; only when and where values exist changes." },
          ],
          explanation: "When the only consumer is the function call itself, skip the list and stream.",
        },
      ],
    },

    // ------------------------------------------------------------- g-08
    {
      slug: "g-08",
      title: "Decorators",
      minutes: 16,
      summary:
        "Functions are objects, so functions can take and return functions — and that is exactly what a decorator is. Build one step by step, learn the @ sugar, stack decorators, and see why web frameworks run on this idea.",
      kind: "coding",
      objectives: [
        "Explain the three powers that make decorators possible",
        "Write a wrapper-producing function by hand and use it",
        "Rewrite manual decoration as a single @ line",
        "Write a decorator that accepts any arguments with *args",
        "Predict the run order of stacked decorators",
      ],
      why: "Lesson f-08 showed you functions traveling as values — passed as arguments to map and filter. Decorators are where that power becomes a professional tool: a way to add behavior (logging, timing, access checks, retries) to a function WITHOUT touching the function itself. Every Python web framework is built on decorators — in Flask, a line like @app.route('/home') is a decorator deciding which function answers which URL. This lesson builds the idea from zero, so that when you meet decorators 'in the wild', you can read them as what they are: plain functions doing a very specific job.",
      blocks: [
        {
          kind: "text",
          text: "In Python, a function is not a spell locked into syntax — it is an **object**, just like a number or a list. f-08 used that fact to pass functions *into* other functions (your callbacks in `map`). Decorators use all three powers that follow from it: you can **assign** a function to a new name, **pass** it as an argument, and — the new one today — **return** it from another function.",
        },
        {
          kind: "table",
          title: "The three powers that make decorators possible",
          headers: ["Power", "What it looks like", "Where you already met it"],
          rows: [
            ["Assign a function to a name", "speak = shout", "This lesson, code block 1"],
            ["Pass a function as an argument", "announce(shout, message)", "Lesson f-08: map and filter took your functions"],
            ["Return a function from a function", "return wrapper", "This lesson's function factory — the decorator itself"],
          ],
          caption:
            "A function is an object, so it travels like one. Decorators are simply all three powers used together in one pattern.",
        },
        {
          kind: "code",
          title: "Power 1: a function can travel under another name",
          code: `def shout(text):
    """Return text uppercased with a bang."""
    return text.upper() + "!"

def whisper(text):
    """Return text lowercased in parentheses."""
    return f"({text.lower()})"

print(shout("dinner time"))
print(whisper("dinner time"))

speak = shout          # a new name for the SAME function object
print(speak("dinner time"))
print("same object:", speak is shout)
`,
          output: `DINNER TIME!
(dinner time)
DINNER TIME!
same object: True`,
          explain: [
            "`speak = shout` copies no code — it makes the name speak point at the very same function object.",
            "Calling speak() is calling shout(); the identity check `is` confirms they are one object with two labels.",
            "The parentheses matter: `speak = shout` moves the function itself; `speak = shout()` would CALL it and move only its return value.",
          ],
        },
        {
          kind: "code",
          title: "Power 2: passing functions as arguments",
          code: `def shout(text):
    return text.upper() + "!"

def whisper(text):
    return f"({text.lower()})"

def announce(style, message):
    """Apply any text style function to a message."""
    return style(message)

print(announce(shout, "the train leaves at nine"))
print(announce(whisper, "the train leaves at nine"))
`,
          output: `THE TRAIN LEAVES AT NINE!
(the train leaves at nine)`,
          explain: [
            "`announce` receives a function in the parameter `style` — no quotes, no call, just the object itself.",
            "Inside, `style(message)` calls whatever function arrived. Same message, two completely different behaviors.",
            "This is the exact mechanism you used in f-08 with map and filter; decorators are built on top of it.",
          ],
        },
        {
          kind: "text",
          text: "The last power feels strange until you see it: a function can *build and return* a new function. That returned function is usually a **wrapper** — a thin layer around some original function, adding a behavior before or after it.",
        },
        {
          kind: "code",
          title: "A tiny function factory",
          code: `def make_tagged(func):
    """Return a new function that wraps func's result in [brackets]."""
    def wrapper():
        return "[" + func() + "]"
    return wrapper

def plain():
    return "hello"

tagged = make_tagged(plain)
print(plain())
print(tagged())
`,
          output: `hello
[hello]`,
          explain: [
            "`make_tagged` never calls `func` — it *defines* a new function `wrapper` that will call func later, and returns the wrapper.",
            "`plain` is untouched: it still returns hello. `tagged` is a NEW function, built while `plain` was passed in, that wraps plain's result in brackets.",
            "The anatomy to memorize: decorator takes func, defines wrapper, returns wrapper. Every decorator you ever read is this shape, with more or less body.",
          ],
        },
        {
          kind: "text",
          text: "Now assemble all three powers into the real thing. A **decorator** is a function that takes a function and returns a wrapper that adds behavior. This one logs every call — pure print statements, so the evidence is right there in the output:",
        },
        {
          kind: "code",
          title: "Manual decoration: wrap the function yourself",
          code: `def log_call(func):
    """Return a wrapper that prints a trace around func's call."""
    def wrapper():
        print("[log] entering", func.__name__)
        result = func()
        print("[log]", func.__name__, "returned", repr(result))
        return result
    return wrapper

def greet():
    return "hey there"

# step 1: the manual way - decorate by hand
greet_logged = log_call(greet)
print(greet_logged())
`,
          output: `[log] entering greet
[log] greet returned 'hey there'
hey there`,
          explain: [
            "`log_call(greet)` runs the factory: it defines wrapper (closing over the real greet) and returns it.",
            "Calling `greet_logged()` runs the wrapper: log line, then the real greet(), then the second log line, then the result comes back.",
            "`func.__name__` is the function's own name attribute — the wrapper found 'greet' inside it. The trace lines are printed evidence that the wrapper ran around the original.",
            "Nothing about greet changed. Its behavior was *augmented* from the outside.",
          ],
        },
        {
          kind: "text",
          text: "That manual dance — `new_name = decorator(old_function)` — is exactly what the famous `@` line does for you. `@log_call` above a def is a pure convenience: Python performs the pass-and-reassign for you.",
        },
        {
          kind: "code",
          title: "The @ line is sugar",
          code: `def log_call(func):
    def wrapper():
        print("[log] entering", func.__name__)
        result = func()
        print("[log]", func.__name__, "returned", repr(result))
        return result
    return wrapper

@log_call              # means exactly: greet = log_call(greet)
def greet():
    return "hey there"

print(greet())
`,
          output: `[log] entering greet
[log] greet returned 'hey there'
hey there`,
          explain: [
            "The @ line rebinds the name greet to the wrapper that log_call built. Calling greet() now logs.",
            "Same three output lines as the manual version — the @ bought no new behavior, only readability: *'this function comes wrapped'* is announced right where the function is defined.",
            "Read @ as: 'decorate the function below with...' — the decorator line is a label, not a call.",
          ],
        },
        {
          kind: "text",
          text: "greet took no arguments, but real functions do. The standard solution is the `*args` pattern from Part F: the wrapper accepts *args (a tuple of whatever arguments arrived) and passes them along. Quick refresher: `def wrapper(*args)` collects any positional arguments into a tuple named args; `func(*args)` unpacks that tuple back into separate arguments.",
        },
        {
          kind: "code",
          title: "An args-reporting decorator",
          code: `def report_args(func):
    """Wrap func so every call prints its arguments and result."""
    def wrapper(*args):
        print(f"[trace] {func.__name__} called with {args}")
        result = func(*args)
        print(f"[trace] {func.__name__} -> {result}")
        return result
    return wrapper

@report_args
def add(a, b):
    return a + b

@report_args
def repeat(word, times):
    return word * times

print(add(3, 4))
print(repeat("na", 5))
`,
          output: `[trace] add called with (3, 4)
[trace] add -> 7
7
[trace] repeat called with ('na', 5)
[trace] repeat -> nanananana
nanananana`,
          explain: [
            "One decorator, two different function shapes: two numbers, or a string and a count. `*args` absorbed both.",
            "The trace shows the args tuple as it arrived — `(3, 4)`, then `('na', 5)` — which is what makes this pattern so useful for debugging real calls.",
            "After the wrapper's lines, the caller still receives the result: 7, then nanananana ('na' glued to itself five times). The decoration is transparent to the return value.",
          ],
        },
        {
          kind: "text",
          text: "Functions can wear more than one decoration — stack the @ lines, and each wraps everything below it. The rule to memorize: **the decorator closest to the def is applied first; the one on top is applied last (and so is outermost at call time)**.",
        },
        {
          kind: "code",
          title: "Two layers, one predictable order",
          code: `def first(func):
    def wrapper():
        print("first: before")
        result = func()
        print("first: after")
        return result
    return wrapper

def second(func):
    def wrapper():
        print("second: before")
        result = func()
        print("second: after")
        return result
    return wrapper

@first      # applied second (outermost)
@second     # applied first (innermost)
def core():
    print("core: doing the real work")
    return "done"

print(core())
`,
          output: `first: before
second: before
core: doing the real work
second: after
first: after
done`,
          explain: [
            "Decoration order: `second` wraps core first; then `first` wraps the *already-wrapped* function. That is why first is the outside layer.",
            "Call order reads like nested boxes: first before -> second before -> core -> second after -> first after -> result.",
            "This onion model predicts every stacked decorator you will ever read — decorators listed bottom-up wrap inside-out.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where you will meet decorators in the wild",
          text: "Web frameworks are the celebrity example: in Flask, `@app.route(\"/hello\")` registers your function as the handler for that URL. You will also meet `@functools.wraps` (a decorator applied to wrappers so they keep the original's name and docstring) and library decorators like `@staticmethod`. Reading them is the skill; now you know they are just functions taking functions.",
        },
        {
          kind: "tryIt",
          title: "Try it — decorate by hand, then with @",
          task: "Predict the output before running. First, welcome is decorated BY HAND: what does logged_welcome('Ada') print, in what order? Then farewell gets the @ line and is called directly. Add your own third function decorated with @log_call and call it — the trace should name YOUR function.",
          code: `def log_call(func):
    """Return a wrapper that prints a trace, then calls func."""
    def wrapper(*args):
        print("[log] calling", func.__name__, "with", args)
        result = func(*args)
        print("[log] result:", result)
        return result
    return wrapper

# 1) decorate by hand and call it
def welcome(name):
    return f"welcome, {name}"

logged_welcome = log_call(welcome)
print(logged_welcome("Ada"))

# 2) now with the @ line - same behavior
@log_call
def farewell(name):
    return f"goodbye, {name}"

print(farewell("Ada"))
`,
          hint: "The wrapper prints BEFORE calling the real function, then the result line, then returns the value which the outer print displays. Both calls produce three lines, differing only in the function name inside the trace.",
        },
      ],
      terms: [
        { term: "Higher-order function", definition: "A function that takes a function as an argument or returns one — announce(), make_tagged(), every decorator." },
        { term: "Wrapper", definition: "The new function a decorator builds around the original: it adds behavior, calls the original, and returns the result." },
        { term: "Decorator", definition: "A function that takes a function and returns a wrapped version of it: def deco(func): def wrapper... return wrapper." },
        { term: "The @ line", definition: "Syntactic sugar: @deco above a def means exactly func = deco(func). It decorates, it does not call." },
        { term: "Stacking", definition: "Multiple @ lines on one function; the closest to the def applies first, the top one is outermost at call time." },
      ],
      mistakes: [
        {
          mistake: "Forgetting to return the wrapper: the decorator ends with return func instead of return wrapper.",
          why: "The decorator hands back the original unchanged, so the @ line does nothing — or if it returns nothing at all, every call becomes TypeError: 'NoneType' object is not callable.",
          fix: "Every decorator's last line is return wrapper. If your decorated function 'is not callable', hunt for a missing return.",
        },
        {
          mistake: "Calling the decorator instead of applying it: @log_call(greet).",
          why: "The @ line already receives the function below it; adding (greet) calls log_call with greet at definition time and tries to decorate whatever came back.",
          fix: "Write @log_call — bare. The parentheses belong on calls, not on decoration.",
        },
        {
          mistake: "Confusing where the wrapper runs: assuming @ runs the wrapper at definition time.",
          why: "Decoration happens once (at def); the wrapper runs on every CALL of the decorated function. A print inside the wrapper fires each time the function is used, not when the file loads.",
          fix: "Trace it: def-time builds the wrapper; call-time runs it. The printed evidence in this lesson's demos shows exactly this.",
        },
        {
          mistake: "Forgetting *args in the wrapper for a function that takes arguments.",
          why: "A zero-argument wrapper cannot accept what the caller sends: add(3, 4) raises TypeError: wrapper() takes 0 positional arguments but 2 were given.",
          fix: "Make the wrapper shape-flexible: def wrapper(*args) ... func(*args) — it then passes through any arguments.",
        },
      ],
      takeaways: [
        "Functions are objects: they can be assigned, passed, and returned — that trio makes decorators possible.",
        "A decorator takes a function, defines a wrapper that closes over it, and returns the wrapper.",
        "@deco above a def means exactly func = deco(func) — decoration, not a call.",
        "*args in the wrapper lets one decorator fit functions of any shape.",
        "Stacked decorators wrap bottom-up: the @ closest to the def is innermost at call time.",
      ],
      quiz: [
        {
          id: "g-08-q1",
          prompt: "What does the @ line above a def actually do?",
          options: [
            { text: "Calls the decorator with the function and uses its result as the new function", correct: true, feedback: "Exactly — @log_call on greet means greet = log_call(greet). One line of sugar for a pass-and-reassign." },
            { text: "Copies the decorator's code into the function", correct: false, feedback: "No code is copied or inlined — the original function is wrapped by a new one." },
            { text: "Runs the decorator every time the function is called", correct: false, feedback: "Decoration happens once, at definition time; only the wrapper runs on each call." },
          ],
          explanation: "Read @ as 'wrap the function below with...' — applied once, at def time.",
        },
        {
          id: "g-08-q2",
          prompt: "A decorator's body ends with 'return func' instead of 'return wrapper'. What happens?",
          options: [
            { text: "Everything works, but without the added behavior — the caller gets the original function back", correct: true, feedback: "Correct — the factory ran, built a wrapper, and then threw it away by returning the original. The @ line does nothing visible." },
            { text: "A SyntaxError at the def line", correct: false, feedback: "It is valid code; the failure is silent, which is what makes this mistake nasty." },
            { text: "The decorated function crashes when called", correct: false, feedback: "It runs fine — as the plain, unwrapped original. The bug is that nothing is decorated." },
          ],
          explanation: "A decorator must return the wrapper, or the wrapping never reaches the caller.",
        },
        {
          id: "g-08-q3",
          prompt: "Predict the order: @first @second def core() — then core() is called. What prints?",
          options: [
            { text: "first: before, second: before, core, second: after, first: after", correct: true, feedback: "Exactly — second wrapped core first, then first wrapped that: first is outermost, so its 'before' prints first and its 'after' prints last." },
            { text: "second: before, first: before, core, first: after, second: after", correct: false, feedback: "That would make second outermost — but the decorator nearest the def is applied first, so second is INNERMOST." },
            { text: "core, then first: before, second: before, and so on", correct: false, feedback: "core is the innermost layer — it cannot run before the wrappers that surround it." },
          ],
          explanation: "Stacked decorators are an onion: the bottom @ is the innermost layer; the top @ is the outer shell.",
        },
      ],
    },
  ],

  exercises: [
    // ---- beginner
    {
      id: "g-b1",
      tier: "beginner",
      title: "Geometry with the math module",
      prompt:
        "Import the math module and use it to compute three classic formulas: the area of a circle with radius 2.5 (pi times radius squared), the volume of a sphere with the same radius (four thirds times pi times radius cubed), and the diagonal of a square with side 3.0 (side times the square root of 2). Print each result formatted to exactly 2 decimal places with an f-string, labeled exactly as in the expected output.",
      hint: "math.pi is the constant; math.sqrt(2) is the square root. Volume: 4 / 3 * math.pi * radius ** 3. Format with {value:.2f} inside the f-string.",
      starter: `import math

radius = 2.5
side = 3.0

# TODO: circle area = pi * radius squared
# TODO: sphere volume = 4/3 * pi * radius cubed
# TODO: square diagonal = side * sqrt(2)

# TODO: print all three, each formatted to 2 decimal places
`,
      solution: `import math

radius = 2.5
side = 3.0

circle_area = math.pi * radius ** 2
sphere_volume = 4 / 3 * math.pi * radius ** 3
diagonal = side * math.sqrt(2)

print(f"circle area: {circle_area:.2f}")
print(f"sphere volume: {sphere_volume:.2f}")
print(f"square diagonal: {diagonal:.2f}")
`,
      expectedOutput: `circle area: 19.63
sphere volume: 65.45
square diagonal: 4.24`,
      concepts: ["import", "math module", "f-string formatting"],
    },
    {
      id: "g-b2",
      tier: "beginner",
      title: "Seeded dice statistics",
      prompt:
        "Simulate rolling a six-sided die ten times, then report statistics on the rolls. First call random.seed(42) so your rolls match everyone else's, then use random.randint(1, 6) in a loop (not a comprehension — keep it beginner-shaped) to collect ten rolls in a list. Finally use the statistics module to print the mean and median, and print the highest roll with max(). Match the expected output exactly — the seed makes it checkable.",
      hint: "random.seed(42) must run BEFORE any randint. Build the list with an empty list plus .append in a for loop, exactly like Part D. statistics.mean(rolls) and statistics.median(rolls) do the math.",
      starter: `import random
import statistics

random.seed(42)

rolls = []
# TODO: roll the die 10 times with random.randint(1, 6)

# TODO: print the roll list, then mean, median, and highest roll
`,
      solution: `import random
import statistics

random.seed(42)

rolls = []
for _ in range(10):
    rolls.append(random.randint(1, 6))

print("rolls:", rolls)
print("mean:", statistics.mean(rolls))
print("median:", statistics.median(rolls))
print("highest roll:", max(rolls))
`,
      expectedOutput: `rolls: [6, 1, 1, 6, 3, 2, 2, 2, 6, 1]
mean: 3
median: 2.0
highest roll: 6`,
      concepts: ["random.seed", "statistics module", "loops"],
    },
    {
      id: "g-b3",
      tier: "beginner",
      title: "The todo round-trip",
      prompt:
        "Practice the with-open pattern end to end: write three todo lines ('learn modules', 'practice files', 'rest') to /tmp/todo.txt with open() and mode 'w', then reopen the file and read it back with a for loop over the file object, printing each line numbered with enumerate (1., 2., 3. — strip the newline first). Finish by printing 'saved to /tmp/todo.txt'. Every file interaction must use the with statement.",
      hint: "Two separate with-blocks: one for writing, one for reading. In the reading block: for number, line in enumerate(f, start=1): then print(number, line.strip()) — or an f-string with {number}.",
      starter: `path = "/tmp/todo.txt"

# TODO: write the three todos to path with 'w' mode inside a with-block

# TODO: read the file back inside another with-block,
# numbering lines with enumerate and stripping newlines

# TODO: print "saved to /tmp/todo.txt"
`,
      solution: `path = "/tmp/todo.txt"

with open(path, "w") as f:
    f.write("learn modules\\n")
    f.write("practice files\\n")
    f.write("rest\\n")

with open(path, "r") as f:
    for number, line in enumerate(f, start=1):
        print(f"{number}. {line.strip()}")

print("saved to /tmp/todo.txt")
`,
      expectedOutput: `1. learn modules
2. practice files
3. rest
saved to /tmp/todo.txt`,
      concepts: ["with open", "file modes", "enumerate"],
    },
    {
      id: "g-b4",
      tier: "beginner",
      title: "The tolerant sum",
      prompt:
        "Wrap int() in try/except so a program survives hostile input. Loop over the list [\"7\", \"oops\", \"42\", \"\", \"13\"] and add every entry that converts cleanly to a running total; when int() raises ValueError, print 'skipping ...' with the repr of the bad entry and count it as skipped. At the end print the sum of the valid numbers and the skipped count, exactly as shown. The program must not crash on any entry — including the empty string.",
      hint: "try: total += int(entry) / except ValueError: print(...) — the empty string raises the same ValueError as 'oops'. Use repr(entry) to show the quotes: print(f\"skipping {entry!r}: not a whole number\").",
      starter: `entries = ["7", "oops", "42", "", "13"]
total = 0
skipped = 0

# TODO: loop over entries; try to convert each with int()
# TODO: on success add to total; on ValueError print and count it

# TODO: print the two summary lines
`,
      solution: `entries = ["7", "oops", "42", "", "13"]
total = 0
skipped = 0

for entry in entries:
    try:
        total += int(entry)
    except ValueError:
        print(f"skipping {entry!r}: not a whole number")
        skipped += 1

print("sum of valid:", total)
print("skipped:", skipped)
`,
      expectedOutput: `skipping 'oops': not a whole number
skipping '': not a whole number
sum of valid: 62
skipped: 2`,
      concepts: ["try/except", "ValueError", "loops"],
    },

    // ---- intermediate
    {
      id: "g-i1",
      tier: "intermediate",
      title: "Rewrite the loop as a comprehension",
      prompt:
        "The starter builds a result list with a loop, the Part D way. Rewrite it as ONE list comprehension that lowercases each word but keeps only words longer than 2 characters, then print the result. Keep the loop version commented out for comparison. With the given words, the comprehension must produce exactly ['data', 'science', 'team', 'sport'] — 'is' and 'a' are too short, and 'TEAM' must come out lowercase.",
      hint: "Pattern: [w.lower() for w in words if len(w) > 2] — transform first, for clause, then the filter clause.",
      starter: `words = ["Data", "science", "is", "a", "TEAM", "sport"]

# The loop version (for reference):
result = []
for w in words:
    if len(w) > 2:
        result.append(w.lower())

# TODO: replace the loop above with one list comprehension
# result = ...

print(result)
`,
      solution: `words = ["Data", "science", "is", "a", "TEAM", "sport"]

# The loop version (for reference):
# result = []
# for w in words:
#     if len(w) > 2:
#         result.append(w.lower())

result = [w.lower() for w in words if len(w) > 2]

print(result)
`,
      expectedOutput: `['data', 'science', 'team', 'sport']`,
      concepts: ["list comprehension", "filtering", "str methods"],
    },
    {
      id: "g-i2",
      tier: "intermediate",
      title: "Word count with Counter",
      prompt:
        "Use collections.Counter to analyze the sentence 'to be or not to be that is the question'. Split it into words, build a Counter, and print: (1) the total word count using sum(counts.values()), (2) the top three most common words with counts.most_common(3), (3) how many times the word 'to' appears by indexing the Counter directly, and (4) how many times the nonexistent word 'zzz' appears — Counter's friendly answer for missing keys, no exception raised.",
      hint: "from collections import Counter; counts = Counter(text.split()). Indexing a Counter never raises KeyError — a missing key counts as 0. most_common(3) returns (word, count) pairs, printed as a list.",
      starter: `from collections import Counter

text = "to be or not to be that is the question"

# TODO: split into words and build a Counter

# TODO: print the total word count, the top three words,
# the count of 'to', and the count of 'zzz'
`,
      solution: `from collections import Counter

text = "to be or not to be that is the question"
words = text.split()
counts = Counter(words)

print("word count:", sum(counts.values()))
print("top three:", counts.most_common(3))
print("'to' appears", counts["to"], "times")
print("'zzz' appears", counts["zzz"], "times")
`,
      expectedOutput: `word count: 10
top three: [('to', 2), ('be', 2), ('or', 1)]
'to' appears 2 times
'zzz' appears 0 times`,
      concepts: ["collections.Counter", "dict methods", "split"],
    },
    {
      id: "g-i3",
      tier: "intermediate",
      title: "First-N squares as a generator",
      prompt:
        "Write a generator function squares(n) with a docstring that yields the first n square numbers (1, 4, 9, ...) one at a time using yield — no lists inside. Then demonstrate it both ways: materialize the first five with list(squares(5)) to print them, and compute the sum of the first ten squares as sum(squares(10)) WITHOUT ever building a list. Also verify with a third line that a lazy generator expression sum(x * x for x in range(1, 11)) gives the same total.",
      hint: "def squares(n): for i in range(1, n + 1): yield i * i. sum() consumes the generator one value at a time — the sum of the first ten squares is 385.",
      starter: `def squares(n):
    """Yield the first n square numbers, one at a time."""
    # TODO: loop and yield each square
    pass

# TODO: print the first five squares as a list
# TODO: print the sum of the first ten squares
# TODO: print the same total computed with a generator expression
`,
      solution: `def squares(n):
    """Yield the first n square numbers, one at a time."""
    for i in range(1, n + 1):
        yield i * i

first_five = list(squares(5))
total = sum(squares(10))
lazy_total = sum(x * x for x in range(1, 11))

print("first five squares:", first_five)
print("sum of first 10 squares:", total)
print("same total, lazily:", lazy_total)
`,
      expectedOutput: `first five squares: [1, 4, 9, 16, 25]
sum of first 10 squares: 385
same total, lazily: 385`,
      concepts: ["yield", "generator expressions", "sum"],
    },
    {
      id: "g-i4",
      tier: "intermediate",
      title: "The fixed-date planner",
      prompt:
        "Build a deadline planner with the datetime module, using only FIXED dates (never now()). Set start = datetime(2026, 11, 14) and, for each of three milestones — (label, days) pairs ('first check-in', 7), ('first month', 30), ('quarter mark', 90) — compute the due date with timedelta and print 'label: YYYY-MM-DD (Weekday)' using strftime with %Y-%m-%d and %A. Finish with the total days planned (7 + 30 + 90). Every run must print the same output forever.",
      hint: "from datetime import datetime, timedelta. due = start + timedelta(days=days), and due.strftime('%Y-%m-%d (%A)') renders the date and weekday name in one go.",
      starter: `from datetime import datetime, timedelta

start = datetime(2026, 11, 14)
milestones = [("first check-in", 7), ("first month", 30), ("quarter mark", 90)]

# TODO: loop over the milestones, add a timedelta to start,
# and print each due date as 'label: YYYY-MM-DD (Weekday)'

# TODO: print the total days planned
`,
      solution: `from datetime import datetime, timedelta

start = datetime(2026, 11, 14)
milestones = [("first check-in", 7), ("first month", 30), ("quarter mark", 90)]

for label, days in milestones:
    due = start + timedelta(days=days)
    print(f"{label}: {due.strftime('%Y-%m-%d (%A)')}")

print("total days planned:", 7 + 30 + 90)
`,
      expectedOutput: `first check-in: 2026-11-21 (Saturday)
first month: 2026-12-14 (Monday)
quarter mark: 2027-02-12 (Friday)
total days planned: 127`,
      concepts: ["datetime", "timedelta", "strftime"],
    },

    // ---- advanced
    {
      id: "g-a1",
      tier: "advanced",
      title: "Fix the exception handling",
      prompt:
        "DEBUGGING PRACTICE. The starter is a broken average-from-file function: a bare except hides the missing-file error with a vague message, the file is opened without with (never closed on error), and the function then crashes anyway with ZeroDivisionError when count is 0. Fix it: use with open(), catch FileNotFoundError and ValueError SPECIFICALLY (returning None with a clear message), handle the empty-file case, and let the demo create /tmp/scores.txt with 88, 92, 79, 95 before asking for its average. The fixed program prints the three lines shown below.",
      hint: "The structure: try: with open(...) as f: values = [int(line) for line in f] / except FileNotFoundError: ... return None / except ValueError: ... return None. Then guard the empty list before dividing: if not values: return None.",
      starter: `def average_from_file(path):
    total = 0
    count = 0
    try:
        f = open(path, "r")
        for line in f:
            total = total + int(line)
            count = count + 1
        f.close()
    except:
        print("something went wrong somewhere, giving up")
    return total / count

print("average:", average_from_file("/tmp/does_not_exist_g.txt"))
`,
      starterExpectError: "ZeroDivisionError: division by zero",
      solution: `def average_from_file(path):
    """Return the average of one integer per line, or None if unreadable."""
    try:
        with open(path, "r") as f:
            values = [int(line) for line in f]
    except FileNotFoundError:
        print(f"no file at {path} - nothing to average")
        return None
    except ValueError:
        print("bad data in file - not all lines are whole numbers")
        return None
    if not values:
        print("file exists but is empty")
        return None
    return sum(values) / len(values)

with open("/tmp/scores.txt", "w") as f:
    f.write("88\\n92\\n79\\n95\\n")

print("average:", average_from_file("/tmp/scores.txt"))
print("missing:", average_from_file("/tmp/does_not_exist_g.txt"))
`,
      expectedOutput: `average: 88.5
no file at /tmp/does_not_exist_g.txt - nothing to average
missing: None`,
      concepts: ["debugging", "specific exceptions", "with open", "FileNotFoundError"],
    },
    {
      id: "g-a2",
      tier: "advanced",
      title: "Write a decorator",
      prompt:
        "Write a decorator shout(func) that returns a wrapper accepting *args; the wrapper calls the original function and returns its result uppercased with '!' appended (never printing inside the wrapper). Decorate two functions with the @ line: greet(name) returning 'hello {name}' and status(level, points) returning 'level {level}, {points} points'. Both decorated functions must work with their normal arguments and print the shouting versions shown below — proving one decorator fits functions of different shapes.",
      hint: "def shout(func): def wrapper(*args): result = func(*args); return result.upper() + \"!\" ; return wrapper. Then @shout above each def.",
      starter: `# TODO: define shout(func) that returns a wrapper(*args)
# The wrapper calls func(*args) and returns the result
# uppercased with a "!" appended.

# TODO: decorate greet with @shout
def greet(name):
    return f"hello {name}"

# TODO: decorate status with @shout
def status(level, points):
    return f"level {level}, {points} points"

# TODO: call both and print
`,
      solution: `def shout(func):
    """Return a wrapper whose result is uppercased with a bang."""
    def wrapper(*args):
        result = func(*args)
        return result.upper() + "!"
    return wrapper

@shout
def greet(name):
    return f"hello {name}"

@shout
def status(level, points):
    return f"level {level}, {points} points"

print(greet("ada"))
print(status(3, 750))
`,
      expectedOutput: `HELLO ADA!
LEVEL 3, 750 POINTS!`,
      concepts: ["decorators", "*args", "higher-order functions"],
    },
    {
      id: "g-a3",
      tier: "advanced",
      title: "The sensor pipeline",
      prompt:
        "Build a small data pipeline that combines this part's tools. First write five sensor readings (name,value pairs like 'sensor-a,21.5', one per line) to /tmp/readings.txt. Then read the file back line by line, strip each line, split it on the comma, and collect (name, float(value)) tuples. With comprehensions: a list of just the sensor-a values, and a sorted set of every sensor name seen. Finish with a generator expression feeding sum() for the total of ALL readings, and print the four results exactly as shown (use statistics.mean for the sensor-a average).",
      hint: "Parsing: name, value = line.strip().split(\",\") then rows.append((name, float(value))). The comprehension filters with unpacking: [v for name, v in rows if name == \"sensor-a\"]. Set comprehension for names: {name for name, _ in rows}, then sorted(...) for printing.",
      starter: `import statistics

# 1) write the five readings to /tmp/readings.txt
with open("/tmp/readings.txt", "w") as f:
    f.write("sensor-a,21.5\\n")
    f.write("sensor-b,19.0\\n")
    f.write("sensor-a,22.5\\n")
    f.write("sensor-c,25.0\\n")
    f.write("sensor-b,20.5\\n")

# TODO: 2) read the file back and parse into (name, float) tuples

# TODO: 3) comprehension: only sensor-a values
# TODO: 4) set comprehension + sorted: every sensor name
# TODO: 5) generator expression: total of all readings

# TODO: print the four result lines (mean, sensors, total...)
`,
      solution: `import statistics

with open("/tmp/readings.txt", "w") as f:
    f.write("sensor-a,21.5\\n")
    f.write("sensor-b,19.0\\n")
    f.write("sensor-a,22.5\\n")
    f.write("sensor-c,25.0\\n")
    f.write("sensor-b,20.5\\n")

with open("/tmp/readings.txt", "r") as f:
    rows = []
    for line in f:
        name, value = line.strip().split(",")
        rows.append((name, float(value)))

a_values = [v for name, v in rows if name == "sensor-a"]
print("sensor-a readings:", a_values)
print("sensor-a mean:", statistics.mean(a_values))

sensors = sorted({name for name, _ in rows})
print("sensors seen:", sensors)

total = sum(v for _, v in rows)
print("all readings total:", total)
`,
      expectedOutput: `sensor-a readings: [21.5, 22.5]
sensor-a mean: 22.0
sensors seen: ['sensor-a', 'sensor-b', 'sensor-c']
all readings total: 108.5`,
      concepts: ["files", "list comprehension", "set comprehension", "generator expressions"],
    },
    {
      id: "g-a4",
      tier: "advanced",
      title: "The matrix lab",
      prompt:
        "Given a 3x3 matrix, produce four results with comprehensions only (no plain loops): (1) row_sums — a list of each row's sum with one comprehension; (2) transposed — the matrix rotated, using a nested comprehension where the inner one collects column i top to bottom; (3) evens_per_row — a nested comprehension keeping only the even numbers of each row; (4) grand_total — the sum of every number, computed with a TWO-clause generator expression (for row in matrix for x in row) fed straight into sum(). Print all four results exactly as shown.",
      hint: "transposed = [[row[i] for row in matrix] for i in range(3)] — read it inside-out. evens: [[x for x in row if x % 2 == 0] for row in matrix]. Grand total: sum(x for row in matrix for x in row).",
      starter: `matrix = [
    [3, 1, 4],
    [1, 5, 9],
    [2, 6, 5],
]

# TODO: row_sums with one comprehension
# TODO: transposed with a nested comprehension
# TODO: evens_per_row with a nested comprehension (evens only)
# TODO: grand_total with a two-clause generator expression + sum

# TODO: print all four results
`,
      solution: `matrix = [
    [3, 1, 4],
    [1, 5, 9],
    [2, 6, 5],
]

row_sums = [sum(row) for row in matrix]
transposed = [[row[i] for row in matrix] for i in range(3)]
evens_per_row = [[x for x in row if x % 2 == 0] for row in matrix]
grand_total = sum(x for row in matrix for x in row)

print("row sums:", row_sums)
print("transposed:", transposed)
print("evens per row:", evens_per_row)
print("grand total:", grand_total)
`,
      expectedOutput: `row sums: [8, 15, 13]
transposed: [[3, 1, 2], [1, 5, 6], [4, 9, 5]]
evens per row: [[4], [], [2, 6]]
grand total: 36`,
      concepts: ["nested comprehension", "generator expressions", "matrices"],
    },
  ],

  // =====================================================================
  // PART G ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "g-as-1",
      prompt: "A module cool.py defines MAGIC = 7. Which import line lets YOUR file use MAGIC directly — writing MAGIC, not cool.MAGIC?",
      options: [
        { text: "from cool import MAGIC", correct: true, feedback: "Exactly — from-import unpacks the name itself, so MAGIC (the 7) is directly in your file." },
        { text: "import cool", correct: false, feedback: "Valid import, but it keeps the drawer label: you must still write cool.MAGIC." },
        { text: "import MAGIC from cool", correct: false, feedback: "That is not Python's syntax — the order is from cool import MAGIC." },
      ],
      explanation: "from module import name: the module on the right, the unpacked name on the left. Direct access, and the cost is that the name's origin is no longer visible.",
    },
    {
      id: "g-as-2",
      prompt: "You must keep everything already in /tmp/journal.txt and add one new line at the end. Which open() call do you write?",
      options: [
        { text: "open(\"/tmp/journal.txt\", \"w\")", correct: false, feedback: "Disaster in three characters: 'w' empties the file the instant it opens it — every earlier line is gone." },
        { text: "open(\"/tmp/journal.txt\", \"a\")", correct: true, feedback: "Correct — 'a' is append mode: keeps all existing lines, adds after the last one, creates the file if it is missing." },
        { text: "open(\"/tmp/journal.txt\", \"r+\")", correct: false, feedback: "r+ opens for read-and-write at the START of the file — appending requires you to manage the position yourself; 'a' does it natively." },
      ],
      explanation: "The three modes are a contract: 'r' reads, 'w' starts from scratch, 'a' adds to the end. Journals and logs live in 'a'.",
    },
    {
      id: "g-as-3",
      prompt: "Predict the exact output: def demo(text): try: value = int(text) / except ValueError: print('handled'); return 'failed' / else: print('ok'); return 'success' / finally: print('bye') — then print(demo('4')).",
      options: [
        { text: "ok, then bye, then success", correct: true, feedback: "Exactly: int('4') succeeds, so else runs; finally fires before the return actually lands; then the outer print shows success." },
        { text: "ok, then success, then bye", correct: false, feedback: "So close — but finally's guarantee is 'before any exit': it prints before the value leaves the function." },
        { text: "bye, then ok, then success", correct: false, feedback: "finally runs LAST in importance but not first in order — it waits for the try/else (or except) to finish their work." },
      ],
      explanation: "Trace rule: try -> (else OR except) -> finally -> then the caller receives the return value. Verified by running it.",
    },
    {
      id: "g-as-4",
      prompt: "Predict the output: nums = [1, 2, 3, 4, 5, 6] then result = [n * n for n in nums if n % 2 == 0], then print(result) and print(sum(result)).",
      options: [
        { text: "[4, 16, 36] and 56", correct: true, feedback: "Correct: the filter keeps 2, 4, 6; the transform squares them into 4, 16, 36; and 4 + 16 + 36 is 56." },
        { text: "[1, 4, 9, 16, 25, 36] and 91", correct: false, feedback: "That squares ALL six numbers — the if n % 2 == 0 filter was skipped (only even n survive it)." },
        { text: "[2, 4, 6] and 12", correct: false, feedback: "That is the filtered source — but the n * n transform must then square each survivor." },
      ],
      explanation: "Filter first, transform second: [n * n for n in nums if n % 2 == 0] gives the squares of the evens only.",
    },
    {
      id: "g-as-5",
      prompt: "Predict the output: def gen(): print('start'); yield 1; print('middle'); yield 2; print('end') — then g = gen(), print(next(g)), print(next(g)).",
      options: [
        { text: "start, 1, middle, 2", correct: true, feedback: "Exactly — the first next() runs up to the first yield (printing start, yielding 1); the second resumes and prints middle, yields 2. The generator then sits paused; 'end' has not run." },
        { text: "start, 1, middle, 2, end", correct: false, feedback: "'end' would need a THIRD next() (or a loop that exhausts the generator) — the generator is paused at the second yield." },
        { text: "Nothing — generators run only inside for loops", correct: false, feedback: "for loops drive generators with next(); calling next() yourself works the same way, any time." },
      ],
      explanation: "A generator is a paused function: each next() runs it to the NEXT yield, and no further. 'end' waits for a call that never comes.",
    },
    {
      id: "g-as-6",
      prompt: "Predict the output: it = iter([10, 20, 30]); print(next(it)); then: for x in it: print(x * 2).",
      options: [
        { text: "10, then 20 and 30", correct: false, feedback: "The loop multiplies by 2 — 20 and 30 would print as 40 and 60. And careful: it does not start from the beginning." },
        { text: "10, then 40, 60", correct: true, feedback: "Exactly: next() consumed 10; the for loop continues the SAME iterator — 20 becomes 40, 30 becomes 60. Loops never restart an iterator they are handed." },
        { text: "10, then 20, 40, 60", correct: false, feedback: "The for loop does NOT begin again from the start — the iterator already moved past 10, and only 20 and 30 remain." },
      ],
      explanation: "An iterator is a position: next() moved it once, and the for loop picks up exactly where that left off — never from the top.",
    },
    {
      id: "g-as-7",
      prompt: "@log_call sits above def greet(): ... What single line is @log_call exactly equivalent to?",
      options: [
        { text: "greet = log_call(greet)", correct: true, feedback: "Exactly — the @ line passes the freshly defined function to the decorator and binds the result back to the same name. One line of sugar." },
        { text: "log_call(greet()) — it calls greet through the decorator on every use", correct: false, feedback: "No call happens at definition time — decoration is a wrapping, and no parentheses are involved." },
        { text: "It copies log_call's body into greet", correct: false, feedback: "Nothing is copied — greet is wrapped by a NEW function that the decorator builds and returns." },
      ],
      explanation: "@deco means exactly func = deco(func): pass the function in, bind the wrapped version back, once, at def time.",
    },
    {
      id: "g-as-8",
      prompt: "A colleague wraps a file-reading loop in 'except: pass' 'to be safe'. What is the best professional advice?",
      options: [
        { text: "Keep it — catching everything means nothing can go wrong", correct: false, feedback: "Everything can go wrong — you just will never SEE it. The failures still happen; they happen silently." },
        { text: "Catch FileNotFoundError by name with a real recovery (a friendly message, a fresh start), and let every other error crash loudly", correct: true, feedback: "Exactly the philosophy: catch what you can HANDLE. Missing files are expected and recoverable; bugs and surprises belong in the traceback where you can read them." },
        { text: "Replace pass with a second bare except around the first one", correct: false, feedback: "A bare except inside a bare except is the same silence, nested — the problem compounds instead of changing." },
      ],
      explanation: "except: pass does not remove failures; it removes EVIDENCE. Name the exception you expect, provide the recovery you planned, and let the rest speak up.",
    },
  ],

  // =====================================================================
  // PART G MINI PROJECT
  // =====================================================================
  project: {
    title: "The Notes Vault",
    brief:
      "You will build a program that remembers: a vault of notes stored in /tmp/notes_vault.txt that survives between runs. The vault adds new notes with timestamps, lists everything stored, and searches by keyword — all with the three habits this part drilled: with open() for every file operation, try/except FileNotFoundError for the missing-vault case (a friendly message and a fresh start instead of a crash), and one small docstring'd function per operation. A menu-free linear script demonstrates every operation top to bottom and ends with a formatted session report. This is the first program in the course whose output you can see again tomorrow — the whole point of files.",
    requirements: [
      "A NOTES_PATH constant set to '/tmp/notes_vault.txt', used for every file operation (works in the browser playground and on your own machine)",
      "Five functions, each with a docstring: load_notes(), save_notes(), add_note(), list_notes(), search_notes()",
      "Every file read and write inside with open(...) — no open() without a with anywhere",
      "load_notes() wraps its read in try/except FileNotFoundError: a friendly 'no vault yet' message and an empty list (a fresh start), never a crash; no bare except in the program",
      "add_note() takes (notes, timestamp, title, body) and appends one readable line, timestamp first; the demo adds three notes with FIXED timestamps like '2026-11-14 09:00' — never datetime.now()",
      "list_notes() numbers the notes with enumerate and ends with a count line; search_notes() is case-insensitive and prints a clear 'no matches' line when nothing matches",
      "A menu-free linear demo under if __name__ == '__main__': banner, load (first run shows the friendly missing-file message), three adds, save, list, then one search that hits and one that misses",
      "A formatted session report at the end: a banner made with string repetition ('=' * 30 or similar) plus at least three summary lines (notes stored, vault path, closing line)",
    ],
    steps: [
      "Step 1 — Create the file: start vault.py (or the playground editor) with the header comment block and the NOTES_PATH constant. Run it — an empty program is a working baseline.",
      "Step 2 — The loader: write load_notes() with try/except FileNotFoundError. Return the list of lines from the file, or [] after printing a friendly 'no vault found' message. Test by printing len(load_notes()).",
      "Step 3 — Add and save: write add_note() and save_notes(). Add one demo note with a fixed timestamp, save, then load again and print what came back — proof the round-trip works before you build anything else.",
      "Step 4 — The listing: write list_notes() with enumerate and a count line. Run it on your one-note list and check the numbering and the empty-newline stripping (line.strip() is your friend).",
      "Step 5 — The search: write search_notes() using a lowercased keyword test inside a comprehension (matches = [n for n in notes if keyword.lower() in n.lower()]). Try a keyword that matches and one that does not; both paths must print something sensible.",
      "Step 6 — The demo script: under if __name__ == '__main__', lay out the session in order: banner, load, add the three demo notes, save, list, search 'coffee' (hit) and 'vacation' (miss). Run it twice: the second run should list the vault's accumulated notes without crashing.",
      "Step 7 — The session report: close with a formatted report — a string-repetition banner, then at least three summary lines (note count, vault path, a closing line).",
      "Step 8 — The review pass: reread every function's docstring, delete the debug prints, and confirm the two run-scripts (first-ever run with no vault, and a repeat run with a vault) both behave gracefully.",
    ],
    starter: `# ============================================
# The Notes Vault — notes that survive runs
# Storage: /tmp/notes_vault.txt (playground-safe)
# ============================================

NOTES_PATH = "/tmp/notes_vault.txt"


def load_notes():
    """Return the list of note lines, or [] after a friendly message if the vault file does not exist yet."""
    # TODO: try to open NOTES_PATH for reading inside a with-block
    # TODO: return [line for line in f]  (the lines keep their \\n for now)
    # TODO: except FileNotFoundError: print a friendly message and return []


def save_notes(notes):
    """Write every note line to the vault file."""
    # TODO: with open(NOTES_PATH, "w") as f: write each line


def add_note(notes, timestamp, title, body):
    """Append one readable note line (timestamp first) to the note list."""
    # TODO: notes.append(f"{timestamp} | {title}: {body}\\n") and return notes


def list_notes(notes):
    """Print every note numbered with enumerate, then a count line."""
    # TODO: handle the empty case ("The vault is empty.")
    # TODO: number with enumerate(notes, start=1) and print each note.strip()
    # TODO: finish with a count line


def search_notes(notes, keyword):
    """Print every note containing the keyword (case-insensitive), or a clear no-matches line."""
    # TODO: matches = [n for n in notes if keyword.lower() in n.lower()]
    # TODO: print each match and a total, or the no-matches line


if __name__ == "__main__":
    print("=" * 30)
    print("THE NOTES VAULT - session demo")
    print("=" * 30)

    # TODO: load the vault (first run prints the friendly message)
    # TODO: add three notes with FIXED timestamps, then save
    # TODO: list every note
    # TODO: search a keyword that hits, and one that misses

    # TODO: session report: repetition banner + summary lines
`,
    concepts: ["with open", "try/except FileNotFoundError", "functions with docstrings", "linear programs", "fixed timestamps"],
    extension:
      "Level up: store each note as a STRUCTURED line 'timestamp|title|body' and write parse_line(line) that splits it back into its three parts with line.strip().split('|', 2). Then upgrade list_notes() to print each note beautifully: the timestamp small, the title on its own line, the body indented below — and upgrade search_notes() to search the title and body separately, reporting WHICH part matched. The vault file stays human-readable, and your program now parses its own storage format.",
  },
};
