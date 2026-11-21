/**
 * PART A — GETTING STARTED
 *
 * The on-ramp for someone who has never written a line of code.
 * Lesson order: what programming is -> what Python is -> why it is useful
 * -> installing Python -> VS Code -> the interpreter -> first program
 * -> running programs -> understanding errors.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Machine-dependent outputs (versions, install dialogs) use lang "bash"/"text"
 * and are never presented as verified program output.
 */
import type { Part } from "@/lib/course/types";

export const PART_A: Part = {
  letter: "A",
  title: "Getting Started",
  tagline: "From 'I have never coded' to running real Python programs",
  description:
    "Meet programming, meet Python, install a professional setup, run your first programs, and learn to read error messages without fear — the complete foundation for everything that follows.",
  lessons: [
    // ------------------------------------------------------------- a-01
    {
      slug: "a-01",
      title: "What Programming Means",
      minutes: 12,
      summary:
        "What a program actually is, what a computer really does with it, and why writing code is more like writing a recipe than doing math.",
      kind: "concept",
      objectives: [
        "Explain what a program is in your own words",
        "Describe the journey from source code to something happening on screen",
        "Name the three ingredients every program is built from",
        "Tell an interpreter from a compiler in one sentence",
      ],
      why: "Before you type a single line of Python, you deserve a mental model of what you are actually doing. Beginners who skip this step hit a wall weeks later: they can copy code but cannot reason about it. Ten minutes spent understanding what programming is will make every later lesson — variables, loops, functions — click faster, because you will know what the machine is doing with the words you type.",
      blocks: [
        {
          kind: "text",
          text: "You have used programs all your life: a browser, a phone app, a game. A **program** is simply a list of instructions that tells a computer what to do. **Programming** is the craft of writing those lists. Nothing more mystical than that.",
        },
        {
          kind: "heading",
          text: "A kitchen analogy you already understand",
        },
        {
          kind: "text",
          text: "Think of a recipe for making a cup of tea. It is a numbered list of small, unambiguous steps: *boil water, put a tea bag in the cup, pour the water, wait 3 minutes, remove the bag*. A program is a recipe written for a machine that follows instructions with perfect obedience — and zero common sense.",
        },
        {
          kind: "text",
          text: "That last part matters. If your tea recipe said *wait 3 minutes* but never said *remove the bag*, a human still figures it out. A computer would not. It would happily hand you a cup with the bag still in it, then stand there waiting for its next instruction. Programs must be **exact**.",
        },
        {
          kind: "visual",
          title: "From your keyboard to the screen",
          ascii: `  YOU write...           the machine...                 you see...

  +----------------+   +------------------+   +------------------+
  |  print("Hi")   |-->| reads each word  |-->|        Hi        |
  |  (source code) |   | does what it is  |   |  (something real |
  +----------------+   |  told, instantly |   |  happens on disk |
         your words     +------------------+    or on the screen)
       (the recipe)     (the obedient cook)      (the cup of tea)
`,
          caption:
            "Programming in one picture: you write words, the machine obeys them, something real happens.",
        },
        {
          kind: "heading",
          text: "The three ingredients of every program",
        },
        {
          kind: "text",
          text: "Every program ever written — a calculator, Instagram, the software that landed a helicopter on Mars — is built from just three kinds of instruction, combined millions of times:",
        },
        {
          kind: "table",
          title: "Data, sequence, and repetition",
          headers: ["Ingredient", "Plain English", "Kitchen example"],
          rows: [
            ["Data (remembering)", "Store values and give them names", "The cup on the counter where you keep the tea bag"],
            ["Sequence (doing)", "Do steps in order, one at a time", "Boil before you pour, never after"],
            ["Choice and repetition (deciding)", "Do X only if Y; do X again and again", "Stir while the sugar has not dissolved"],
          ],
          caption:
            "In Part B you will meet these as variables, statements, and control flow — the vocabulary of every lesson that follows.",
        },
        {
          kind: "heading",
          text: "What actually happens when you run code",
        },
        {
          kind: "steps",
          title: "The life of one instruction",
          items: [
            "**You write source code** — plain text, saved in a file. This is the part you control.",
            "**A translator reads it** — computers only truly understand numbers, so a translator program converts your words into machine instructions.",
            "**The machine executes** — the processor carries out the instructions, one after another, millions per second.",
            "**Effects appear** — something appears on screen, a file changes, a sound plays. That is your program working.",
          ],
        },
        {
          kind: "text",
          text: "There are two styles of translator, and Python uses the friendlier one:",
        },
        {
          kind: "table",
          title: "Interpreters vs compilers",
          headers: ["", "Interpreter", "Compiler"],
          rows: [
            ["Style", "Reads and runs your code line by line, immediately", "Converts the whole program to machine code first, then runs it"],
            ["Feedback", "Instant — you type, you see results", "Slower loop — translate everything, then run"],
            ["Typical languages", "Python, JavaScript, Ruby", "C, C++, Rust, Go"],
            ["Best for learning", "Yes — perfect for experimenting", "Later — for squeezing out maximum speed"],
          ],
          caption:
            "Python is interpreted: the feedback loop is type a line, see the result. That is exactly what a beginner needs.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "A program is a precise recipe. Python is a language for writing recipes that a machine can obey instantly, step by step. You are learning to write recipes.",
        },
        {
          kind: "heading",
          text: "Programming is not math (really)",
        },
        {
          kind: "text",
          text: "Many people avoid programming because they were told they are *bad at math*. Good news: everyday programming is closer to writing careful instructions than to solving equations. If you can explain to a friend how to get to your house, turn by turn, without skipping a step, you can program. The arithmetic a data analyst needs, Python does for you — you saw a hint of that already:",
        },
        {
          kind: "code",
          title: "A taste of what is coming",
          code: `print(1984 + 8771)
print("Hello, future programmer!")
`,
          output: `10755
Hello, future programmer!`,
          outputNote: "Real output, produced by running this exact code with Python 3.12.",
          explain: [
            "**Line 1** — you typed a tiny math problem; Python answered instantly. This is what an interpreter feels like.",
            "**Line 2** — text in quotes is printed exactly as written. You just read your first two lines of Python.",
            "Notice: no ceremony, no setup, no boilerplate. Two lines in, you already produced output. That is the Python way.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it right now — change the numbers",
          task: "This editor runs real Python in your browser. Change 1984 to your birth year, or replace the message with your name, then press Run.",
          code: `print(1984 + 8771)
print("Hello, future programmer!")
`,
          hint: "Keep the quotes around text, but change the words inside them. Numbers need no quotes.",
        },
      ],
      terms: [
        { term: "Program", definition: "A list of exact instructions that a computer follows to accomplish a task." },
        { term: "Source code", definition: "The human-readable text of a program, written in a programming language like Python." },
        { term: "Interpreter", definition: "A translator that reads source code and executes it line by line, immediately." },
        { term: "Compiler", definition: "A translator that converts an entire program into machine code before any of it runs." },
        { term: "Execute", definition: "To carry out the instructions of a program. When you run code, the computer executes it." },
      ],
      mistakes: [
        {
          mistake: "Believing programming requires advanced mathematics.",
          why: "Fear of math stops beginners before they start, but everyday code is mostly careful step-by-step instructions.",
          fix: "Think of programming as writing precise recipes. Python handles the arithmetic for you.",
        },
        {
          mistake: "Expecting the computer to fill in missing steps with common sense.",
          why: "Computers follow instructions literally — they have zero intuition about what you meant.",
          fix: "Spell out every step, in order, with nothing important left implied.",
        },
      ],
      takeaways: [
        "A program is an exact, ordered list of instructions — a recipe for a machine with no common sense.",
        "Every program is built from three ingredients: remembering data, doing steps in order, and making choices or repetitions.",
        "Python is interpreted: you write a line, it runs immediately. Perfect for learning by experiment.",
        "Programming is closer to writing careful instructions than to solving equations.",
      ],
      quiz: [
        {
          id: "a-01-q1",
          prompt: "In one sentence, what is a program?",
          options: [
            { text: "A list of exact instructions a computer follows to do a task", correct: true, feedback: "Exactly — like a recipe the machine follows with perfect obedience and zero common sense." },
            { text: "A mathematical proof written for computers", correct: false, feedback: "No proof needed — most programs contain no formal math at all, just careful instructions." },
            { text: "The physical chip inside your laptop", correct: false, feedback: "That is the processor — the thing that executes a program, not the program itself." },
          ],
          explanation: "A program is instructions, not hardware and not mathematics: a recipe so exact that a machine can obey it.",
        },
        {
          id: "a-01-q2",
          prompt: "What is the key difference between an interpreter and a compiler?",
          options: [
            { text: "Interpreters translate the whole program at once; compilers work line by line", correct: false, feedback: "Backwards — that describes the compiler translating everything first." },
            { text: "Interpreters read and run code line by line, immediately; compilers translate the whole program before running it", correct: true, feedback: "Correct — and Python is on the friendly, immediate-feedback side." },
            { text: "There is no real difference; the words are synonyms", correct: false, feedback: "They describe genuinely different translation strategies with very different feedback loops." },
          ],
          explanation: "Immediate, line-by-line feedback is why interpreted Python is such a gentle first language.",
        },
        {
          id: "a-01-q3",
          prompt: "Which of these is NOT one of the three ingredients every program is built from?",
          options: [
            { text: "Remembering data (storing values with names)", correct: false, feedback: "That is a core ingredient — you will meet it as variables in Part B." },
            { text: "Doing steps in a specific order", correct: false, feedback: "Sequence is fundamental — order changes meaning." },
            { text: "Choosing and repeating actions based on conditions", correct: false, feedback: "Choice and repetition power everything from menus to games." },
            { text: "Drawing the user interface before writing any logic", correct: true, feedback: "Correct — interfaces are a feature of some programs, not a building block of all of them." },
          ],
          explanation: "Data, sequence, and choice/repetition are universal; interfaces are optional extras.",
        },
      ],
    },

    // ------------------------------------------------------------- a-02
    {
      slug: "a-02",
      title: "What Python Is",
      minutes: 12,
      summary:
        "Where Python came from, what kind of language it is, why its design makes it the most recommended first language in the world, and what real systems run on it.",
      kind: "concept",
      objectives: [
        "Say who created Python and what philosophy guided it",
        "Explain what makes Python easier to read than most languages",
        "List at least three well-known systems built with Python",
        "Distinguish the Python language from the CPython interpreter that runs it",
      ],
      why: "You are about to invest weeks in this language, so you deserve to know its pedigree and its character. Knowing that Python powers Instagram, Netflix recommendations, and NASA missions gives you confidence the skill is worth having; knowing why its syntax looks like plain English tells you what the language optimizes for: your time, not the machine's.",
      blocks: [
        {
          kind: "text",
          text: "**Python** is a programming language: a vocabulary and a grammar for writing instructions a computer can execute. It was created by the Dutch programmer **Guido van Rossum**, who started it as a hobby project over the 1989 winter holidays and released it in 1991. He named it not after the snake, but after the British comedy group *Monty Python* — a hint about how the language feels: playful, readable, humane.",
        },
        {
          kind: "heading",
          text: "Designed around one obsession: readability",
        },
        {
          kind: "text",
          text: "Most languages of that era were built to be easy for *computers* to process. Python was built to be easy for *humans* to read — because code is read far more often than it is written. The result is syntax that often reads like broken English. Compare the same task in two languages:",
        },
        {
          kind: "code",
          title: "Java vs Python — the same program",
          code: `# Python: three lines, no ceremony
total = 10755
if total > 10000:
    print("Large order")
`,
          output: `Large order`,
          explain: [
            "You do not know Python yet, but you can probably already read this: store a value, check it, print a message.",
            "The same logic in Java needs a class definition, a method signature, and braces — roughly five lines of scaffolding before the actual work begins.",
            "Every unnecessary symbol a language removes is one less thing a beginner must memorize.",
          ],
        },
        {
          kind: "text",
          text: "Python removes ceremony everywhere it can. No semicolons at line ends. No braces around blocks — indentation *is* the structure. Fewer symbols means fewer things to type wrong, and code that reads almost like the idea behind it.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "The philosophy, written down",
          text: "Python's design principles are public — type `import this` in any Python session. Two of the most famous lines: *\"Readability counts.\"* and *\"Simple is better than complex.\"*",
        },
        {
          kind: "heading",
          text: "The language vs the engine: a map analogy",
        },
        {
          kind: "text",
          text: "Beginners often hear the words *Python*, *CPython*, and *interpreter* used loosely. Here is the clean model. The **Python language** is the set of rules: what `print` means, what indentation does. The **CPython interpreter** is the engine that actually reads and runs those rules — the default one you download from python.org. Maps help: the language is the rules of the road; CPython is the car. (Other engines exist, like PyPy or MicroPython, but you start with CPython — everyone does.)",
        },
        {
          kind: "visual",
          title: "Your setup, mapped",
          ascii: `   PYTHON LANGUAGE (the rules)
        |
        |  implemented by
        v
   CPYTHON INTERPRETER (the engine you download)
        |
        |  runs
        v
   YOUR FILES ending in .py  ----->  real results
   (your_program.py)
`,
          caption: "You write files in the language; CPython executes them. One language, one default engine.",
        },
        {
          kind: "heading",
          text: "Who runs Python in the real world",
        },
        {
          kind: "table",
          title: "Python in production",
          headers: ["Organization", "What Python does there"],
          rows: [
            ["Instagram", "Serves hundreds of millions of users on a codebase that is overwhelmingly Python (Django)"],
            ["Netflix", "Powers recommendation algorithms, data pipelines, and infrastructure automation"],
            ["NASA / JPL", "Mission analysis and scientific computing for spacecraft projects"],
            ["Spotify", "Data analysis and backend services behind music recommendations"],
            ["OpenAI and the AI industry", "The dominant language of machine learning — the models behind modern AI are trained with Python tooling"],
          ],
          caption:
            "One language spans web apps, science, and AI — which is why learning it opens so many doors.",
        },
        {
          kind: "text",
          text: "Python is consistently among the top languages in the TIOBE and Stack Overflow surveys, and it is the *de facto* standard language of data science and machine learning. If your goal is working with data, Python is not just a good choice — it is the center of gravity of the entire field.",
        },
        {
          kind: "tryIt",
          title: "Try the language's own philosophy",
          task: "Run this tiny program. It prints Python's design principles — the famous Zen of Python.",
          code: `import this
`,
          hint: "It works in the browser playground too. Read a few lines — you already met two of them in this lesson.",
        },
      ],
      terms: [
        { term: "Python", definition: "A high-level programming language designed for readability, created by Guido van Rossum and first released in 1991." },
        { term: "CPython", definition: "The default, reference interpreter that executes Python code; what you download from python.org." },
        { term: "Syntax", definition: "The grammar rules of a language: which words and symbols are allowed, and how they combine." },
        { term: "High-level language", definition: "A language written for human readability, far from the machine's raw numbers. Python is high-level; assembly is low-level." },
        { term: "Zen of Python", definition: "Python's written design philosophy (import this), whose best-known line is 'Readability counts.'" },
      ],
      mistakes: [
        {
          mistake: "Thinking 'Python' and 'CPython' are two different languages.",
          why: "One is the language (the rules), the other is its default engine (the interpreter). Files run the same either way.",
          fix: "Say 'Python' for the language and 'CPython' when you specifically mean the interpreter you downloaded.",
        },
        {
          mistake: "Assuming a readable language must be a weak or slow one.",
          why: "Readability is a design choice about syntax, not a limit on capability — Instagram serves enormous traffic through Python.",
          fix: "Judge by results: Python runs at massive scale in industry, and its speed is rarely the bottleneck for data work.",
        },
      ],
      takeaways: [
        "Python is a language created by Guido van Rossum (1991), named after Monty Python, obsessed with readability.",
        "CPython is the default engine that runs Python code — language is rules, engine is the car.",
        "Instagram, Netflix, NASA, Spotify and the whole AI industry run serious Python in production.",
        "Readable syntax is not a toy feature: it is why you will learn faster and make fewer mistakes.",
      ],
      quiz: [
        {
          id: "a-02-q1",
          prompt: "Python was named after…",
          options: [
            { text: "The python snake, for wrapping around problems", correct: false, feedback: "Tempting, but no — the name predates any snake branding." },
            { text: "Monty Python's Flying Circus, the comedy group", correct: true, feedback: "Correct — Guido van Rossum was reading Monty Python scripts at the time. The language keeps the playfulness." },
            { text: "An acronym for 'PYramid THrOugh Interpreter Notation'", correct: false, feedback: "A convincing-sounding fake — Python is not an acronym at all." },
          ],
          explanation: "The playful name fits the language's character: humane, readable, a little funny.",
        },
        {
          id: "a-02-q2",
          prompt: "What is the difference between Python and CPython?",
          options: [
            { text: "CPython is a faster, separate language derived from Python", correct: false, feedback: "No — CPython runs the same Python language; it is not a different dialect." },
            { text: "Python is the language rules; CPython is the default interpreter (engine) that executes them", correct: true, feedback: "Exactly: rules vs engine, like the rules of the road vs the car you drive." },
            { text: "Nothing — they are exact synonyms in every context", correct: false, feedback: "Close enough in daily speech, but there is a real distinction worth knowing." },
          ],
          explanation: "Language = the rules. CPython = the engine. You write the first and download the second.",
        },
        {
          id: "a-02-q3",
          prompt: "Which design goal guided Python's creator most?",
          options: [
            { text: "Maximum execution speed on 1990s hardware", correct: false, feedback: "That was the goal of languages like C. Python optimizes differently." },
            { text: "Readability and simplicity for the humans reading the code", correct: true, feedback: "Right — 'Readability counts' is a line from the Zen of Python, the language's written philosophy." },
            { text: "Being as similar to English grammar as possible", correct: false, feedback: "Python reads *almost* like English, but that was a consequence of simplicity, not the target itself." },
          ],
          explanation: "Python trades a little machine speed for a lot of human clarity — a trade that pays off when you are learning.",
        },
      ],
    },

    // ------------------------------------------------------------- a-03
    {
      slug: "a-03",
      title: "Why Python Is Useful",
      minutes: 12,
      summary:
        "What Python is genuinely best at, where it is the industry default, what it is bad at, and which careers it opens — so you know where this skill can take you.",
      kind: "concept",
      objectives: [
        "Name the five domains where Python dominates",
        "Explain the two properties that make Python productive for data work",
        "Describe one honest limitation of Python",
        "Match three real job titles to the Python work they actually do",
      ],
      why: "Motivation is fuel, and vague motivation runs out fast. Knowing specifically that data analysts, AI engineers, and automation specialists use Python daily — and what they build with it — turns 'I should learn to code' into 'I am learning the exact tool my next job uses.' Just as important: knowing Python's weak spots now prevents disappointment later and teaches you to choose tools honestly.",
      blocks: [
        {
          kind: "text",
          text: "Languages are tools, and tools have personalities. Python's personality is the **generalist**: good enough at almost everything, and the outright best choice in a few fields that happen to be growing fast. Here is the honest map.",
        },
        {
          kind: "heading",
          text: "Where Python is the industry default",
        },
        {
          kind: "table",
          title: "Python's home turf",
          headers: ["Field", "What people build", "The tools you will meet later"],
          rows: [
            ["Data analysis", "Cleaning data, finding patterns, building reports", "pandas, Jupyter"],
            ["Machine learning / AI", "Training models, from spam filters to chatbots", "scikit-learn, PyTorch"],
            ["Automation & scripting", "Renaming 5,000 files, scraping a website, emailing a daily report", "just Python + the standard library"],
            ["Web backends", "The server side of websites and APIs", "Django, FastAPI"],
            ["Scientific computing", "Simulations, statistics, research pipelines", "NumPy, SciPy"],
          ],
          caption: "Five fields, one language. Switching between them costs you almost nothing.",
        },
        {
          kind: "heading",
          text: "The two properties behind it all",
        },
        {
          kind: "text",
          text: "Why did Python win these fields? Two reasons, and they compound each other:",
        },
        {
          kind: "steps",
          items: [
            "**Low ceremony.** Python gets out of your way. Three lines can read a file and print a result, where other languages need twenty. When your job is *exploring* data — trying ten ideas an hour — nothing matters more than ideas-per-minute.",
            "**A huge ecosystem.** Over half a million free, community-built packages exist on PyPI (the Python Package Index). Need to read an Excel sheet? A package. Train a neural network? A package. Chances are, the hard part is already solved.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "How packages change your job",
          text: "Without packages, reading an Excel file is a week of work. With `pandas` (one of those packages), it is one line: `pd.read_excel('sales.xlsx')`. Later parts of this course teach you the language; the ecosystem multiplies what each line is worth.",
        },
        {
          kind: "heading",
          text: "An honest look at the weak spots",
        },
        {
          kind: "text",
          text: "Trustworthy teachers show you the limits, not just the highlights. Python's main trade-off: **raw speed**. Because it is interpreted and dynamically typed, pure Python runs slower than compiled languages like C++ or Rust — often 10 to 100 times slower for tight number-crunching loops. It also consumes more memory.",
        },
        {
          kind: "text",
          text: "So why does speed rarely matter in practice? Because the heavy lifting in data work is done by packages like NumPy and pandas — which are themselves written in C and Fortran under the hood. Python acts as the friendly steering wheel on a fast engine. When raw speed truly matters (a game engine, an operating system), engineers choose other languages. You will learn to make that call honestly too.",
        },
        {
          kind: "visual",
          title: "Python as the friendly steering wheel",
          ascii: `     YOUR PYTHON CODE          C / C++ / FORTRAN ENGINES
  +-------------------+     +---------------------------+
  |  df.mean()        |---->|  fast math, implemented  |
  |  readable, 1 line |     |  in compiled languages   |
  +-------------------+     +---------------------------+
        |                            |
        v                            v
   you think and type            millions of numbers
   quickly                       crunched at full speed
`,
          caption: "You write readable Python; the libraries do the heavy math in fast compiled code. Best of both worlds.",
        },
        {
          kind: "heading",
          text: "Where this skill can take you",
        },
        {
          kind: "table",
          title: "Jobs and their daily Python",
          headers: ["Job title", "What they actually do with Python"],
          rows: [
            ["Data Analyst", "Pulls data, cleans it, answers business questions, builds dashboards"],
            ["Data Scientist", "Everything an analyst does, plus statistics and machine learning models"],
            ["Machine Learning / AI Engineer", "Builds, trains, and deploys the models behind modern AI products"],
            ["Backend Developer", "Builds the server logic and APIs behind websites and apps"],
            ["Automation / DevOps Engineer", "Writes scripts that eliminate repetitive work and manage infrastructure"],
          ],
          caption: "This course's Part J gives you a real taste of the data path — the most Python-centric career of all.",
        },
        {
          kind: "code",
          title: "A one-line taste of professional Python",
          code: `salaries = [52000, 63500, 71000, 58000, 90500, 66000]
print("Highest:", max(salaries))
print("Average:", sum(salaries) // len(salaries))
`,
          output: `Highest: 90500
Average: 66833`,
          outputNote: "Real output — computed by running this exact code.",
          explain: [
            "Line 1 stores a list of numbers — you will master lists in Part E.",
            "Line 2 asks Python for the maximum — no loop written by you, the work is built in.",
            "Line 3 computes an average using three built-in tools: sum, integer division (//), and len. One readable line does a job that would take a paragraph elsewhere.",
            "This is the productivity promise of Python, witnessed: more done per line you type.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — interrogate the data yourself",
          task: "Add a new salary to the list, then re-run. Watch both numbers change. Try changing // to / and see what happens to the average.",
          code: `salaries = [52000, 63500, 71000, 58000, 90500, 66000]
print("Highest:", max(salaries))
print("Average:", sum(salaries) // len(salaries))
`,
          hint: "Add a number like 120000 inside the square brackets, separated by a comma. With / instead of //, the average becomes a decimal — you will learn why in Part B.",
        },
      ],
      terms: [
        { term: "Package (library)", definition: "A bundle of reusable code someone else wrote and shared. Over half a million are installable from PyPI." },
        { term: "PyPI", definition: "The Python Package Index — the public warehouse where the community publishes packages." },
        { term: "Script", definition: "A small, single-purpose program, often written to automate a repetitive task." },
        { term: "API", definition: "Application Programming Interface — a way for programs (and programmers) to request data or actions from another system." },
        { term: "Dynamically typed", definition: "Python checks types while the program runs, not before — flexible, with speed as the trade-off." },
      ],
      mistakes: [
        {
          mistake: "Choosing Python for every problem forever.",
          why: "Tools have personalities: for a real-time game engine or an operating system kernel, compiled languages beat Python.",
          fix: "Use Python where humans-per-hour matters most (data, automation, AI); reach for Rust/C++ when raw machine speed is the requirement.",
        },
        {
          mistake: "Worrying about 'Python is slow' before writing any Python.",
          why: "For data work, the slow-looking loops usually live inside C-powered libraries like pandas, not in your code.",
          fix: "Write clear code first; optimize later, only if measurements ever say you need to (Part I covers measuring).",
        },
      ],
      takeaways: [
        "Python is the industry default in data analysis, AI, automation, web backends, and scientific computing.",
        "Two compounding strengths: low ceremony (fast ideas-per-hour) and a giant ecosystem of free packages.",
        "Its honest weakness is raw speed — usually irrelevant because the heavy math runs in compiled libraries underneath.",
        "Analyst, data scientist, ML engineer, backend developer, automation engineer: five careers, one language.",
      ],
      quiz: [
        {
          id: "a-03-q1",
          prompt: "Which of these is Python's most honest weakness?",
          options: [
            { text: "It cannot do mathematics", correct: false, feedback: "Quite the opposite — math and statistics are its home turf." },
            { text: "Raw execution speed compared with compiled languages like C++", correct: true, feedback: "Correct — interpreted and dynamic has a cost. It is usually hidden by fast C libraries under the hood." },
            { text: "Too few libraries to do real work", correct: false, feedback: "Python's ecosystem is one of its greatest strengths — hundreds of thousands of packages." },
          ],
          explanation: "Know the trade-off and you can reason about tools like an engineer, not a fan.",
        },
        {
          id: "a-03-q2",
          prompt: "Why does Python's slowness rarely matter for data analysis?",
          options: [
            { text: "Data analysis never needs speed", correct: false, feedback: "It often does — that is exactly why the fast engines exist." },
            { text: "The heavy number-crunching happens in libraries like NumPy, written in fast compiled languages", correct: true, feedback: "Right — Python is the readable steering wheel on a compiled engine." },
            { text: "Analysts always rewrite their Python in C before running it", correct: false, feedback: "Almost nobody does that — the libraries already did it for you." },
          ],
          explanation: "You get human-friendly code on top of machine-speed math. That division of labor is the whole trick.",
        },
        {
          id: "a-03-q3",
          prompt: "Which job title pairs MOST directly with 'cleaning data and answering business questions with Python'?",
          options: [
            { text: "Data Analyst", correct: true, feedback: "Exactly — that is the analyst job description, nearly word for word." },
            { text: "Game engine developer", correct: false, feedback: "That career leans on C++ and raw performance — Python's weak spot." },
            { text: "Mobile app designer", correct: false, feedback: "Design and mobile apps use different toolsets entirely (Swift, Kotlin, design tools)." },
          ],
          explanation: "Matching skills to real job titles turns learning into a career plan.",
        },
      ],
    },

    // ------------------------------------------------------------- a-04
    {
      slug: "a-04",
      title: "Installing Python",
      minutes: 15,
      summary:
        "Download and install the right Python for your system, prove it works, and learn the version rules that stop beginner confusion before it starts.",
      kind: "setup",
      objectives: [
        "Install the latest Python 3 for your operating system",
        "Verify the installation from a terminal with a single command",
        "Explain what Python 3 vs 'Python 2' means and why it matters",
        "Diagnose the two most common install problems",
      ],
      why: "A broken or half-finished install is the number-one reason beginners quit on day one — the error is always some flavor of 'command not found'. Fifteen careful minutes here buys you a smooth ride for the entire course. You will learn to verify the install from a terminal, which also gives you your first taste of the command line that professional developers live in.",
      blocks: [
        {
          kind: "text",
          text: "You need two things on your machine: **Python 3 itself** and (in the next lesson) **VS Code**, the editor. This lesson handles the first. The whole process is three steps: download, install, verify. The verification step is where beginners get burned, so we will do it slowly and carefully.",
        },
        {
          kind: "heading",
          text: "One rule before you start: Python 3, always",
        },
        {
          kind: "text",
          text: "You may hear about 'Python 2'. It reached its official end of life on January 1, 2020, and no new project should use it. All learning material from here on assumes **Python 3** (any version 3.10 or newer works perfectly for this course). When a tutorial says just 'Python', it means Python 3. If you ever see a `print \"hello\"` without parentheses, that is Python 2 syntax — close the tab.",
        },
        {
          kind: "heading",
          text: "Step 1 — Download",
        },
        {
          kind: "steps",
          items: [
            "**Windows** — go to python.org/downloads, click the big yellow button (it offers the latest Python 3), and save the installer.",
            "**macOS** — the same python.org/downloads button offers the macOS installer. (macOS also ships an old system Python; you will install a fresh, current one and use that.)",
            "**Linux** — most distributions already include Python 3. You will verify it in Step 3 and only install if it is missing.",
          ],
        },
        {
          kind: "heading",
          text: "Step 2 — Install",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Windows users: the one checkbox that matters",
          text: "On the very first installer screen, check **'Add python.exe to PATH'** at the bottom before clicking Install. This single checkbox is what makes the `python` command findable everywhere. Skipping it is the most common cause of 'python is not recognized' errors.",
        },
        {
          kind: "text",
          text: "On macOS, run the downloaded .pkg installer and click through; the defaults are correct. On Linux, if verification (Step 3) shows no Python, install it with your distribution's package manager, for example `sudo apt install python3` on Ubuntu.",
        },
        {
          kind: "heading",
          text: "Step 3 — Verify (the step everyone skips)",
        },
        {
          kind: "text",
          text: "Now you prove the install worked. Open your **terminal** — the text window where you type commands to the system:",
        },
        {
          kind: "table",
          title: "Opening a terminal",
          headers: ["System", "How to open it"],
          rows: [
            ["Windows", "Press the Windows key, type 'Command Prompt' (or 'PowerShell'), press Enter"],
            ["macOS", "Press Cmd+Space, type 'Terminal', press Enter"],
            ["Linux", "Press Ctrl+Alt+T (most distributions)"],
          ],
        },
        {
          kind: "text",
          text: "A dark or light window appears with a blinking cursor. This is the terminal — it waits for a command, you press Enter, it answers. Type the verification command for your system and press Enter:",
        },
        {
          kind: "code",
          title: "Verify Python — Windows",
          lang: "bash",
          code: `python --version`,
          output: `Python 3.12.7`,
          outputNote:
            "Your version may be newer (3.13, 3.14...) — any 3.10 or higher is perfect for this course. What matters is that a version appears at all.",
        },
        {
          kind: "code",
          title: "Verify Python — macOS / Linux",
          lang: "bash",
          code: `python3 --version`,
          output: `Python 3.12.6`,
          outputNote:
            "On macOS and Linux the command is python3 by design — the bare name python is often reserved or missing entirely. The 3 is not optional.",
        },
        {
          kind: "text",
          text: "A line like `Python 3.12.x` means **success**: the engine is installed and findable. You have run your first terminal command — that skill alone will pay off for the rest of your career.",
        },
        {
          kind: "heading",
          text: "When something goes wrong",
        },
        {
          kind: "table",
          title: "The two classic failures",
          headers: ["What you see", "What it means", "The fix"],
          rows: [
            ["'python' is not recognized as an internal or external command (Windows)", "The installer's PATH option was skipped, so Windows cannot find Python", "Re-run the installer, choose Modify, and enable 'Add python.exe to PATH' — or reinstall with the checkbox ticked"],
            ["command not found: python3 (macOS/Linux)", "No Python 3 on PATH, or a typo in the command", "Install via python.org (macOS) or your package manager (Linux); retype slowly — python3, all lowercase"],
          ],
          caption: "Every professional has hit both of these. Reading an error calmly is the real skill.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "About the browser playground",
          text: "This course embeds a real Python playground in every lesson, so nothing blocks you from practicing. But install Python locally anyway: the muscle memory of running programs on your own machine is part of what you are learning.",
        },
        {
          kind: "tryIt",
          title: "Practice the verification habit",
          task: "In the browser playground, print the version information Python knows about itself — the same idea as python --version, but from inside the language.",
          code: `import sys
print(sys.version_info.major, sys.version_info.minor)
`,
          hint: "This prints two numbers like 3 12 — the major and minor version. On your own machine, the terminal command python --version does the same job from outside the language.",
        },
      ],
      terms: [
        { term: "Terminal", definition: "The text window where you type commands directly to your operating system (Command Prompt, PowerShell, or the macOS/Linux shell)." },
        { term: "PATH", definition: "The operating system's list of folders it searches when you type a command name. 'Not on PATH' means 'the system cannot find that program'." },
        { term: "Python 3", definition: "The modern, supported generation of Python (3.0 arrived in 2008). Python 2 died in 2020; all new code is Python 3." },
        { term: "Version", definition: "The numbered release of a program, written major.minor.patch — 3.12.7 means Python 3, twelfth minor release, seventh patch." },
      ],
      mistakes: [
        {
          mistake: "Skipping the 'Add to PATH' checkbox on Windows, then hitting 'python is not recognized'.",
          why: "Without PATH, Windows knows Python exists but cannot find it when you type its name.",
          fix: "Re-run the installer, choose Modify, tick 'Add python.exe to PATH'. Restart the terminal afterwards — it only re-reads PATH when reopened.",
        },
        {
          mistake: "Typing Python with a capital P or adding spaces (pyhton, py thon).",
          why: "Commands are case-sensitive and taken literally; the terminal does not guess.",
          fix: "Type python or python3, all lowercase, exactly. Slow and correct beats fast and broken.",
        },
        {
          mistake: "Following a Python 2 tutorial because it was the first search result.",
          why: "Python 2 syntax (print without parentheses) fails on Python 3 and teaches you dead habits.",
          fix: "Check the tutorial's date and version. Everything in this course is Python 3 only.",
        },
      ],
      takeaways: [
        "Install Python 3 (3.10 or newer) from python.org/downloads — Python 2 has been dead since 2020.",
        "Windows: tick 'Add python.exe to PATH' on the first installer screen. This prevents the classic 'not recognized' error.",
        "Verify from the terminal: python --version (Windows) or python3 --version (macOS/Linux).",
        "'Command not found' means a PATH problem, not a broken computer — rerun the installer and reopen the terminal.",
      ],
      quiz: [
        {
          id: "a-04-q1",
          prompt: "Which Python should you install in 2026?",
          options: [
            { text: "Python 2.7, because most tutorials use it", correct: false, feedback: "Python 2 died in January 2020. Any tutorial using it is abandoned." },
            { text: "Python 3 (3.10 or newer)", correct: true, feedback: "Correct — Python 3 is the only supported generation, and 3.10+ covers everything in this course." },
            { text: "The newest Python 4 beta", correct: false, feedback: "There is no Python 4. After 3.9 comes 3.10, then 3.11... the '3' stays." },
          ],
          explanation: "Python 3 with a recent minor version is the only right answer today.",
        },
        {
          id: "a-04-q2",
          prompt: "On Windows you type python --version and see 'python' is not recognized...'. What is the actual problem?",
          options: [
            { text: "Your computer is too old for Python", correct: false, feedback: "Python runs on decade-old hardware without trouble." },
            { text: "Python is installed but not on PATH, so Windows cannot find it", correct: true, feedback: "Exactly — rerun the installer, Modify, tick 'Add python.exe to PATH', reopen the terminal." },
            { text: "You must buy a Python license for terminal use", correct: false, feedback: "Python is free and open source — no license, no cost, ever." },
          ],
          explanation: "'Not recognized' is a PATH problem, not a Python problem. One checkbox fixes it.",
        },
        {
          id: "a-04-q3",
          prompt: "Why does this course use python3 as the command on macOS and Linux?",
          options: [
            { text: "Because python3 is a different, better language", correct: false, feedback: "Same language, same engine — only the command name differs." },
            { text: "Historical convention: bare 'python' can point to nothing or to the old system Python, so the explicit name is safer", correct: true, feedback: "Right — the explicit python3 name always means the modern one." },
            { text: "It is a typo that became standard", correct: false, feedback: "It is deliberate design, not an accident." },
          ],
          explanation: "Explicit python3 avoids ambiguity on systems where 'python' is missing or ancient.",
        },
      ],
    },

    // ------------------------------------------------------------- a-05
    {
      slug: "a-05",
      title: "Setting Up VS Code",
      minutes: 15,
      summary:
        "Install the world's most popular code editor, add the Python extension, learn the three parts of its interface, and run a file from inside it.",
      kind: "setup",
      objectives: [
        "Install VS Code and its Python extension",
        "Identify the editor, file explorer, and terminal panels",
        "Open a folder as a workspace and create a .py file",
        "Run a Python file inside VS Code with one click",
      ],
      why: "You could write Python in Notepad, but professionals do not — for good reason. A real editor highlights syntax so typos jump out, autocompletes so you type less, and runs your file without switching windows. Setting up VS Code now means every future lesson flows through one professional tool, and the habits you build (files in folders, run from the editor) are exactly the habits employers expect.",
      blocks: [
        {
          kind: "text",
          text: "**VS Code** (Visual Studio Code) is a free, open-source editor from Microsoft and the most popular development tool in the world. An *editor* is where you write code; it is not Python itself — think of it as a word processor built for code instead of documents.",
        },
        {
          kind: "heading",
          text: "Why not just any text editor?",
        },
        {
          kind: "table",
          title: "What a code editor adds",
          headers: ["Feature", "What it does for you"],
          rows: [
            ["Syntax highlighting", "Colors code by meaning — strings one color, keywords another — so typos and missing quotes visually jump out"],
            ["Autocomplete", "Suggests names as you type; fewer typos, faster learning of what exists"],
            ["Integrated terminal", "The terminal from last lesson, docked inside the editor — no window switching"],
            ["Run button", "Runs your file in one click and shows the output right below your code"],
            ["Error underlines", "Flags mistakes before you even run the code"],
          ],
          caption: "Every one of these catches beginner mistakes early. That is the whole point.",
        },
        {
          kind: "heading",
          text: "Install in three steps",
        },
        {
          kind: "steps",
          items: [
            "**Download** — visit code.visualstudio.com and download the installer for your system (Windows, macOS, or Linux).",
            "**Install** — run it. Accept the defaults; on Windows also leave 'Add to PATH' options ticked. On macOS, drag VS Code into Applications.",
            "**Add the Python extension** — open VS Code, click the Extensions icon in the left bar (four squares, one flying away), search 'Python', and install the one from Microsoft (tens of millions of installs). This extension is what teaches VS Code to speak Python: highlighting, autocomplete, running, debugging.",
          ],
        },
        {
          kind: "visual",
          title: "The VS Code window — three parts to know",
          ascii: `+-------------------------------------------------------------+
| ACTIVITY BAR |  EXPLORER (your files)  |   EDITOR (your code) |
|  (left rail) |  +------------------+  |  +-----------------+ |
|              |  | pycourse/        |  |  | hello.py        | |
|  [files]     |  |   hello.py       |  |  |                 | |
|  [search]    |  |   ...            |  |  | print("Hi")     | |
|  [run]       |  +------------------+  |  |                 | |
|  [exts]      |                        |  +-----------------+ |
+-------------------------------------------------------------+
|  TERMINAL (type commands, see output)                       |
|  $ python hello.py                                          |
|  Hi                                                         |
+-------------------------------------------------------------+
`,
          caption:
            "Left: files. Middle: your code. Bottom: the terminal where programs run. That is 90% of the interface.",
        },
        {
          kind: "heading",
          text: "Your first workspace",
        },
        {
          kind: "text",
          text: "Programs live in files, and files live in folders. VS Code works best when you open one folder as your **workspace** — a home for everything belonging to one project:",
        },
        {
          kind: "steps",
          items: [
            "Create a folder somewhere sensible, named `pycourse` (no spaces in the name — spaces in paths cause endless beginner pain).",
            "In VS Code: File > Open Folder, choose `pycourse`. Trust the authors if asked (it is your own folder).",
            "In the Explorer panel, click New File, name it `hello.py`. The `.py` ending is what makes it a Python file.",
            "Type the line below, save (Ctrl+S / Cmd+S).",
          ],
        },
        {
          kind: "code",
          title: "hello.py — type exactly this",
          code: `print("Hello from my own computer!")
`,
          output: `Hello from my own computer!`,
          explain: [
            "One line, one job: print the text between the quotes.",
            "Saving with the .py extension + the Python extension installed means VS Code now offers to run it for you.",
          ],
        },
        {
          kind: "steps",
          title: "Run it — two ways, same result",
          items: [
            "**The Run button** — with hello.py open, click the play triangle in the top right. VS Code opens its terminal panel and runs the file.",
            "**The terminal** — click in the terminal panel (View > Terminal if hidden) and type the command yourself: `python hello.py` (Windows) or `python3 hello.py` (macOS/Linux). Press Enter.",
          ],
        },
        {
          kind: "text",
          text: "Either way, the output appears in the terminal panel at the bottom: the exact text you printed. Congratulations — this is the professional loop: **edit, save, run, read output**. You will repeat it thousands of times, and it never changes.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Choose your interpreter (one-time)",
          text: "If VS Code ever asks to select a Python interpreter, pick the Python 3.12.x (or newer) you installed. This tells the extension which engine to use for running and checking your files.",
        },
        {
          kind: "tryIt",
          title: "Practice: print your details",
          task: "Three lines, three prints: your name, your city, and today's day of the week. Do it here first, then repeat the same file on your own machine — the double practice is deliberate.",
          code: `print("Hello from my own computer!")
print("My name is Future Coder")
print("I am learning Python in 2026")
`,
          hint: "Each print goes on its own line. Text needs quotes around it; press Run and read all three outputs.",
        },
      ],
      terms: [
        { term: "VS Code", definition: "Visual Studio Code — a free, open-source code editor from Microsoft; the most popular editor in the world." },
        { term: "Extension", definition: "A plugin that adds a capability to VS Code. The Microsoft Python extension teaches it to highlight, complete, run, and debug Python." },
        { term: "Workspace", definition: "A folder you open in VS Code as the home for one project's files." },
        { term: "Integrated terminal", definition: "A terminal docked inside VS Code, so you can run programs without switching windows." },
        { term: ".py file", definition: "A file whose name ends in .py — by convention, a file containing Python source code." },
      ],
      mistakes: [
        {
          mistake: "Naming files or folders with spaces, like 'my programs/hello world.py'.",
          why: "Spaces in paths break terminal commands and imports in confusing ways.",
          fix: "Use lowercase, no spaces: pycourse/hello.py. Underscores are the professional style: my_programs/.",
        },
        {
          mistake: "Naming a file python.py — or any name a library already uses.",
          why: "Python may import your file instead of the real library, producing deeply confusing errors.",
          fix: "Avoid library names (random.py, json.py...). Beginner-safe names: hello.py, first_program.py, practice_01.py.",
        },
        {
          mistake: "Forgetting to save before running.",
          why: "VS Code runs what is on disk; unsaved edits are invisible to it (it usually saves automatically — usually is not always).",
          fix: "Make Ctrl+S / Cmd+S a reflex after every small change. Cheap habit, zero lost work.",
        },
      ],
      takeaways: [
        "VS Code + the Microsoft Python extension is the professional default setup — free and available on every system.",
        "The interface is three zones: files (left), code (middle), terminal (bottom).",
        "Programs are files in folders: open a pycourse folder as your workspace and keep every exercise in it.",
        "The core loop of development: edit, save, run, read output — unchanged from beginner to senior engineer.",
      ],
      quiz: [
        {
          id: "a-05-q1",
          prompt: "What is the difference between VS Code and Python?",
          options: [
            { text: "VS Code is the editor where you write code; Python is the language (and interpreter) that runs it", correct: true, feedback: "Exactly — the word processor vs the language the document is written in." },
            { text: "They are competing programming languages", correct: false, feedback: "Only Python is a language; VS Code is a tool for writing many languages." },
            { text: "VS Code replaces the Python interpreter", correct: false, feedback: "No — VS Code calls your installed Python to run files. Install both." },
          ],
          explanation: "Editor and interpreter are different tools with different jobs; you need both.",
        },
        {
          id: "a-05-q2",
          prompt: "Why should project folders avoid spaces in their names?",
          options: [
            { text: "Old habit with no real effect today", correct: false, feedback: "It still bites: terminals and imports treat spaces as separators." },
            { text: "Spaces break terminal commands and module imports in confusing ways", correct: true, feedback: "Correct — lowercase-no-spaces (pycourse, my_scripts) is the pain-free convention." },
            { text: "VS Code cannot open folders with spaces", correct: false, feedback: "It can — but the trouble appears later, in terminals and imports." },
          ],
          explanation: "Spaces in paths are legal but cause real friction; professionals avoid them.",
        },
        {
          id: "a-05-q3",
          prompt: "You named your practice file random.py and now strange import errors appear. Why?",
          options: [
            { text: "Python files ending in .py cannot be named randomly", correct: false, feedback: "Any name works — unless it collides with a real library's name." },
            { text: "Your file shadows the real random library: imports of random find YOUR file instead", correct: true, feedback: "Exactly — this is called shadowing, and it produces baffling errors until you rename." },
            { text: "The Python extension does not support that name", correct: false, feedback: "The extension is indifferent; it is the import system that gets confused." },
          ],
          explanation: "Never name files after libraries you (might) import: random.py, json.py, turtle.py are all traps.",
        },
      ],
    },

    // ------------------------------------------------------------- a-06
    {
      slug: "a-06",
      title: "The Python Interpreter",
      minutes: 15,
      summary:
        "Meet the REPL — Python's interactive mode — where you type one line and get one answer instantly. Learn why professionals use it as a pocket calculator, idea sandbox, and documentation reader.",
      kind: "coding",
      objectives: [
        "Start and exit the interactive interpreter (REPL)",
        "Use it as an instant calculator and one-line experiment lab",
        "Read the >>> prompt and continuation lines correctly",
        "Explain when to use the REPL and when to write a file",
      ],
      why: "The REPL is Python's superpower for learners: instant feedback with zero ceremony. Instead of writing a whole file to test one idea, you type one line and see the answer immediately. Professionals use it daily to check 'what does this function return?' or 'is 0.1 + 0.2 really 0.3?' (it is not — you will see). Mastering the REPL early turns every uncertain moment into a five-second experiment.",
      blocks: [
        {
          kind: "text",
          text: "Last lesson you ran a *file* through Python. There is a second mode, and it is even more immediate: the **interactive interpreter**, usually called the **REPL** (Read–Evaluate–Print–Loop). You type one line of Python; it reads it, evaluates it, prints the answer, and loops back for more — a conversation with Python itself.",
        },
        {
          kind: "heading",
          text: "Starting and stopping the REPL",
        },
        {
          kind: "steps",
          items: [
            "Open your terminal (or VS Code's terminal panel).",
            "Type `python` (Windows) or `python3` (macOS/Linux) with **no file name** and press Enter.",
            "You will see version lines, then the prompt: `>>>` — three angle brackets. That is Python waiting for you.",
            "To leave: type `exit()` and press Enter (or press Ctrl+D on macOS/Linux, Ctrl+Z then Enter on Windows).",
          ],
        },
        {
          kind: "code",
          title: "A real REPL session — the prompt in action",
          lang: "repl",
          code: `>>> 1984 + 8771
10755
>>> "py" + "thon"
'python'
>>> 10 ** 100
10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
`,
          outputNote:
            "Each >>> line is what YOU type; the line under it is Python's immediate answer. No print() needed — the REPL shows the value automatically.",
        },
        {
          kind: "text",
          text: "Notice what makes the REPL special: **no print required**. Type any expression, press Enter, and its value appears. It is the fastest Q&A machine in programming.",
        },
        {
          kind: "heading",
          text: "The three questions the REPL answers best",
        },
        {
          kind: "steps",
          items: [
            "**'What does this return?'** — type the expression, see the answer. No file, no saving, no ceremony.",
            "**'Does this idea even work?'** — test one line before committing it to a program. If it fails, you learned in one second.",
            "**'What can this thing do?'** — type a name, a dot, and press Tab (in most terminals) to list everything it offers; or call help() to read the manual without leaving the conversation.",
          ],
        },
        {
          kind: "code",
          title: "help() — the manual, built in",
          lang: "repl",
          code: `>>> help(len)
Help on built-in function len in module builtins:

len(obj, /)
    Return the number of items in a container.`,
          outputNote:
            "The real, complete help text for len — its entry is short. In a live REPL, longer entries fill the screen; press q to return to the >>> prompt. help() works on almost anything.",
          explain: [
            "You asked about len; Python printed its manual entry: what it takes, what it returns.",
            "This is why professionals rarely memorize function lists — the manual is one command away, inside the language itself.",
          ],
        },
        {
          kind: "heading",
          text: "The famous floating-point surprise",
        },
        {
          kind: "text",
          text: "Here is a REPL experiment that shocks every beginner — and teaches a deep truth. Computers store decimals in binary, and some decimal numbers do not translate cleanly. Ask the REPL:",
        },
        {
          kind: "code",
          title: "An honest surprise",
          code: `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
`,
          output: `0.30000000000000004
False`,
          explain: [
            "0.1 + 0.2 really does produce 0.30000000000000004 in Python — this is not a bug, it is binary floating-point arithmetic (IEEE 754), the same behavior in almost every language.",
            "The second line asks 'is this exactly 0.3?' — and the honest answer is False.",
            "Lesson to bank now: never test floating-point numbers for exact equality. This bites real financial and scientific code; you will revisit it in Part B.",
          ],
        },
        {
          kind: "heading",
          text: "REPL or file? A simple rule",
        },
        {
          kind: "table",
          title: "Choosing your mode",
          headers: ["Situation", "Use", "Why"],
          rows: [
            ["Testing one idea or expression", "REPL", "Instant answer, nothing to save"],
            ["Checking how a function behaves", "REPL", "Type the call, see the return"],
            ["Anything you want to keep or run twice", "File", "Files persist and replay; REPL sessions vanish"],
            ["A program of more than ~5 lines", "File", "Conversation is for questions; programs are for files"],
          ],
          caption: "Professionals keep both open at once: the file is the program, the REPL is the scratchpad.",
        },
        {
          kind: "visual",
          title: "The two modes, side by side",
          ascii: `  FILE MODE                        REPL MODE
  python hello.py                  python
  +---------------------+          +---------------------+
  | 1. write hello.py   |          | 1. type one line    |
  | 2. save             |          | 2. press Enter      |
  | 3. run whole file   |          | 3. read the answer  |
  | 4. read all output  |          | 4. repeat forever   |
  +---------------------+          +---------------------+
   for programs                     for questions & tests
   (kept on disk)                   (gone when closed)
`,
          caption: "Same engine, two doors. Programs go through files; questions go through the conversation.",
        },
        {
          kind: "tryIt",
          title: "Try the REPL spirit — one line, one answer",
          task: "This playground behaves like a file run, but practice the REPL mindset: predict each answer BEFORE running. What is 7 * 6? What is 2 ** 8? What is 'ha' * 3? Then run and score yourself.",
          code: `print(7 * 6)
print(2 ** 8)
print("ha" * 3)
`,
          hint: "** is Python's power operator (so 2 ** 8 is 2 to the 8th). Multiplying a string by a number repeats it. Predict first — prediction is where learning happens.",
        },
      ],
      terms: [
        { term: "REPL", definition: "Read–Evaluate–Print–Loop: the interactive Python conversation where each line you type is executed immediately and its value shown." },
        { term: "Prompt (>>>)", definition: "The three-bracket symbol meaning 'the interpreter is waiting for your next line'." },
        { term: "Expression", definition: "Any piece of code that produces a value — 2 + 2, 'py' + 'thon'. The REPL evaluates expressions and prints the result." },
        { term: "help()", definition: "The built-in manual reader: call help(anything) to read its documentation without leaving Python." },
        { term: "Floating-point", definition: "How computers store decimal numbers (binary, per the IEEE 754 standard) — fast, but with tiny precision surprises like 0.1 + 0.2 != 0.3." },
      ],
      mistakes: [
        {
          mistake: "Typing >>> yourself when copying a REPL example into a file.",
          why: ">>> is the prompt Python *shows* you, not something you write. Typing it into a file is a syntax error.",
          fix: "In files, write only what comes AFTER the >>>. In the actual REPL, the prompt is already there — just type your line.",
        },
        {
          mistake: "Writing a whole program inside the REPL, line after line.",
          why: "REPL sessions vanish when closed; long code is hard to edit line-by-line in a terminal.",
          fix: "Use the REPL for questions and one-line tests. The moment code exceeds a few lines or you want to keep it, it belongs in a file.",
        },
        {
          mistake: "Panicking at the ... continuation prompt (three dots).",
          why: "It appears after an incomplete line (like the first line of a loop) and means 'finish the thought' — nothing is broken.",
          fix: "Complete the statement, or press Enter on an empty continuation line to cancel and return to >>>.",
        },
      ],
      takeaways: [
        "The REPL is a conversation: type one line of Python, get the answer instantly — no print() needed.",
        "Start it with python (or python3) and no file; leave with exit().",
        "help(anything) reads the manual without leaving Python — professionals use it constantly.",
        "Rule of thumb: questions go to the REPL, programs go to files. Keep both open.",
        "0.1 + 0.2 == 0.3 is False — floating-point math has tiny precision surprises. Never test decimals for exact equality.",
      ],
      quiz: [
        {
          id: "a-06-q1",
          prompt: "What do the three symbols >>> mean?",
          options: [
            { text: "Python is asking you to type three parameters", correct: false, feedback: "No parameter request — it is simpler than that." },
            { text: "The REPL prompt: the interpreter has read and evaluated your last line and is waiting for the next one", correct: true, feedback: "Exactly — it is the conversation marker between you and Python." },
            { text: "A syntax error indicator", correct: false, feedback: "Errors look very different (tracebacks, red text) — you will meet them properly in lesson a-09." },
          ],
          explanation: ">>> is just the 'your turn' signal in the conversation.",
        },
        {
          id: "a-06-q2",
          prompt: "Why does the REPL sometimes show a value without you calling print()?",
          options: [
            { text: "Because the P in REPL stands for Print — it automatically prints the value of any expression you type", correct: true, feedback: "That is the loop working as designed: Read, Evaluate, PRINT, loop." },
            { text: "It is a bug in interactive mode", correct: false, feedback: "It is the defining feature, not a bug — and it does not happen in files." },
            { text: "Because Python prints everything by default everywhere", correct: false, feedback: "In files nothing prints unless you call print() — the auto-print is REPL-only." },
          ],
          explanation: "REPL auto-prints expression values; files print only what you explicitly print.",
        },
        {
          id: "a-06-q3",
          prompt: "print(0.1 + 0.2 == 0.3) outputs False. The real reason is…",
          options: [
            { text: "Python made a rounding mistake it should have avoided", correct: false, feedback: "It is not a Python slip — it is the universal binary floating-point standard (IEEE 754) at work." },
            { text: "Decimal fractions like 0.1 and 0.2 cannot be stored exactly in binary, so their sum lands microscopically off 0.3", correct: true, feedback: "Correct — the same effect exists in nearly every language; Python is just honest enough to show it." },
            { text: "The == operator is broken for numbers", correct: false, feedback: "== works fine; the values themselves are the tiniest bit different from what you expect." },
          ],
          explanation: "Binary cannot represent 0.1 exactly — like 1/3 has no finite decimal form. Bank the habit: never compare floats for exact equality.",
        },
      ],
    },

    // ------------------------------------------------------------- a-07
    {
      slug: "a-07",
      title: "Your First Python Program",
      minutes: 15,
      summary:
        "Write a complete, meaningful first program — a personal introduction card — and meet comments, string concatenation, f-strings, and multi-line output along the way.",
      kind: "coding",
      objectives: [
        "Write and run a multi-line Python program from scratch",
        "Use print() with text, numbers, and multiple values",
        "Explain what a comment is and write useful ones",
        "Read a program line by line and predict its output",
      ],
      why: "'Hello, world!' alone teaches almost nothing — you print one line and learn zero skills. Your first program should be meaningful enough to feel like YOURS: an introduction card with your name, age, and dreams. By building it you meet five core tools at once: print(), strings, numbers, comments, and f-strings — the exact toolkit every later lesson stands on. Small enough to finish in fifteen minutes, real enough to show a friend.",
      blocks: [
        {
          kind: "text",
          text: "Tradition says your first program prints *Hello, world!*. You already did better than that in the playground. So let us write a program with actual content: **an introduction card** — the kind of thing you would hand someone at a meetup. Here is the finished program; by the end of this lesson you will understand every character in it:",
        },
        {
          kind: "code",
          title: "card.py — your first real program",
          code: `# My very first Python program — an introduction card

name = "Ada"
age = 24
dream_job = "data analyst"

print("=== INTRODUCTION CARD ===")
print("Name:", name)
print("Age:", age)
print("Dream job:", dream_job)
print("Years until 30:", 30 - age)
print("Ada" + " is learning " + "Python")
print(f"{name} wants to become a {dream_job}")
`,
          output: `=== INTRODUCTION CARD ===
Name: Ada
Age: 24
Dream job: data analyst
Years until 30: 6
Ada is learning Python
Ada wants to become a data analyst`,
          outputNote: "Real output of running card.py with Python 3.12 — every line below will be explained one by one.",
        },
        {
          kind: "heading",
          text: "Line by line — every character explained",
        },
        {
          kind: "steps",
          items: [
            "**Line 1 — a comment.** Everything after a `#` is ignored by Python and exists only for humans. Use comments to explain *why*, not *what*.",
            "**Lines 3–5 — variables.** `name = \"Ada\"` creates a box, labels it `name`, and puts the text Ada inside. Variables are how programs remember.",
            "**Line 7 — plain print.** `print(\"=== INTRODUCTION CARD ===\")` prints the text between the quotes exactly.",
            "**Lines 8–10 — print with commas.** `print(\"Name:\", name)` prints several values separated by spaces: the label, then the variable's contents.",
            "**Line 11 — arithmetic inside print.** `30 - age` is computed first (Python does the math), then printed. The result: 6.",
            "**Line 12 — string concatenation.** The `+` operator glues strings together into one. All parts must be text — you will see the error in a moment.",
            "**Line 13 — an f-string.** `f\"...\"` lets you drop variables straight into text inside `{curly braces}` — the modern, readable way to build text.",
          ],
        },
        {
          kind: "heading",
          text: "The three ways to put values on screen",
        },
        {
          kind: "table",
          title: "print() patterns compared",
          headers: ["Pattern", "Example", "Result", "When to use"],
          rows: [
            ["Commas", `print("Age:", age)`, "Age: 24", "Quick display — automatic spaces between values"],
            ["Concatenation (+)", `print("Age: " + str(age))`, "Age: 24", "Building one string; needs str() around numbers"],
            ["f-string", `print(f"Age: {age}")`, "Age: 24", "The modern default — text and values, readable, any type"],
          ],
          caption:
            "All three print the same thing here — but f-strings handle every type without conversion and read the best. You will use them constantly.",
        },
        {
          kind: "code",
          title: "Why concatenation bites — the classic error",
          expectError: "TypeError: can only concatenate str (not \"int\") to str",
          code: `age = 24
print("Age: " + age)
`,
          explain: [
            "Python refuses: you cannot glue text and a number together with +. It tells you exactly what happened — str means string (text), int means integer (whole number).",
            "This is the most common error in all of beginner Python. The fix is one of two options below.",
          ],
        },
        {
          kind: "code",
          title: "The two fixes",
          code: `age = 24
print("Age: " + str(age))      # fix 1: convert the number to text
print(f"Age: {age}")           # fix 2: the f-string (preferred)
`,
          output: `Age: 24
Age: 24`,
          explain: [
            "Fix 1: str(24) becomes the text '24', so + glues text to text. Works, but noisy.",
            "Fix 2: inside an f-string, {age} becomes '24' automatically — no conversion, no ceremony. This is why f-strings are the professional default.",
          ],
        },
        {
          kind: "heading",
          text: "Comments: notes for humans",
        },
        {
          kind: "text",
          text: "A **comment** starts with `#` and runs to the end of the line. Python ignores comments completely; they exist purely for human readers — including future you. Good comments explain *why* something is done, or mark sections. Bad comments repeat what the code already says:",
        },
        {
          kind: "code",
          title: "Good and bad comments",
          code: `age = 24

# Good: explains WHY
# Use f-string because age is a number and + would raise TypeError
print(f"Age: {age}")

# Bad: repeats WHAT the code obviously says
print(f"Age: {age}")  # print the age
`,
          output: `Age: 24
Age: 24`,
          explain: [
            "Both lines print the same thing, but only the first comment would help a reader six months later.",
            "Rule of thumb: comment the why, not the what. You will practice this habit in every exercise from now on.",
          ],
        },
        {
          kind: "visual",
          title: "Anatomy of your first program",
          ascii: `  card.py
  +---------------------------------------------+
  |  # comment      <- for humans only          |
  |  name = "Ada"   <- REMEMBER (variables)     |
  |  print(...)     <- DO (output)              |
  |  30 - age       <- COMPUTE (expressions)    |
  |  f"{name}..."   <- COMBINE (f-strings)      |
  +---------------------------------------------+
   Remember, compute, combine, show — the shape of ALL programs.
`,
          caption: "Every program you will ever write is these four verbs, repeated and nested. You just wrote all four.",
        },
        {
          kind: "tryIt",
          title: "Make the card YOURS",
          task: "Replace Ada's details with your own: your name, your age, and the job you actually want. Then add one new print line: your home city. Run it.",
          code: `# My very first Python program — an introduction card

name = "Ada"
age = 24
dream_job = "data analyst"

print("=== INTRODUCTION CARD ===")
print("Name:", name)
print("Age:", age)
print("Dream job:", dream_job)
print("Years until 30:", 30 - age)
print("Ada" + " is learning " + "Python")
print(f"{name} wants to become a {dream_job}")
`,
          hint: "Change the text between the quotes on lines 3-5, and add a print for your city, e.g. print('City:', 'Lisbon'). Then try changing the === line to your own design.",
        },
      ],
      terms: [
        { term: "Variable", definition: "A named box that stores a value. name = 'Ada' creates a variable called name holding the text Ada." },
        { term: "String (str)", definition: "A sequence of characters — text. Written between quotes: 'hello' or \"hello\"." },
        { term: "Integer (int)", definition: "A whole number: 24, 0, -7. No decimal point." },
        { term: "Concatenation", definition: "Gluing strings together with +: 'py' + 'thon' becomes 'python'." },
        { term: "f-string", definition: "A formatted string (f\"...\" ) where {expressions} are replaced by their values — the modern way to mix text and data." },
        { term: "Comment", definition: "A note for humans starting with # that Python completely ignores." },
      ],
      mistakes: [
        {
          mistake: "Concatenating text and numbers: print('Age: ' + age).",
          why: "+ only glues string to string. A number (int) on either side raises TypeError — the single most common beginner error.",
          fix: "Use an f-string (print(f'Age: {age}')) or convert explicitly with str(age).",
        },
        {
          mistake: "Missing quotes around text: print(Hello).",
          why: "Without quotes, Hello is treated as a variable name — and no variable called Hello exists, so Python raises NameError.",
          fix: "Text always needs quotes: print('Hello'). Variable names never have quotes.",
        },
        {
          mistake: "Forgetting the f before the quotes: print('{name} is learning').",
          why: "Without the f prefix, the braces are just characters — the output literally prints {name}.",
          fix: "The f is what turns it on: print(f'{name} is learning').",
        },
      ],
      takeaways: [
        "Programs are built from four verbs: remember (variables), compute (expressions), combine (f-strings), show (print).",
        "print() with commas prints values separated by spaces; + concatenation needs all-string parts.",
        "f-strings (f\"...{value}...\") are the modern way to mix text and values — no conversion needed.",
        "Comments (#) are ignored by Python and written for humans: comment the why, not the what.",
        "'TypeError: can only concatenate str' means you mixed text and numbers — switch to an f-string.",
      ],
      quiz: [
        {
          id: "a-07-q1",
          prompt: "What does print(\"Age:\", 24) output?",
          options: [
            { text: "Age:24", correct: false, feedback: "Close — but commas in print add a space between values." },
            { text: "Age: 24", correct: true, feedback: "Correct: comma-separated values print with a space between them." },
            { text: "Age: {24}", correct: false, feedback: "Curly braces are f-string syntax — plain quotes print them literally." },
          ],
          explanation: "Commas display values side by side with an automatic space.",
        },
        {
          id: "a-07-q2",
          prompt: "print('Age: ' + 24) crashes. What does Python raise?",
          options: [
            { text: "TypeError: can only concatenate str (not 'int') to str", correct: true, feedback: "Exactly — + refuses to glue text and numbers. It is the most common beginner error." },
            { text: "NameError, because 24 is not defined", correct: false, feedback: "24 is a literal number, not a name — NameError is for unknown names." },
            { text: "Nothing — it prints Age: 24", correct: false, feedback: "It really crashes; commas or f-strings are needed to mix types." },
          ],
          explanation: "The fix: print('Age: ' + str(24)) or better, print(f'Age: {24}').",
        },
        {
          id: "a-07-q3",
          prompt: "print(f\"2 + 3 = {2 + 3}\") outputs…",
          options: [
            { text: "2 + 3 = {2 + 3}", correct: false, feedback: "That would happen WITHOUT the f prefix — braces printed literally." },
            { text: "2 + 3 = 5", correct: true, feedback: "Correct — inside an f-string, {2 + 3} is evaluated and the result 5 is inserted." },
            { text: "5", correct: false, feedback: "The text outside the braces prints too — only the braced part is replaced." },
          ],
          explanation: "f-strings evaluate the expression inside every {pair of braces} and splice in the result.",
        },
      ],
    },

    // ------------------------------------------------------------- a-08
    {
      slug: "a-08",
      title: "Running Programs",
      minutes: 12,
      summary:
        "The three ways to run Python code (run button, terminal, REPL), how Python reads a file from top to bottom, and the edit–save–run loop that powers everything you will ever build.",
      kind: "coding",
      objectives: [
        "Run a .py file from the terminal with an explicit command",
        "Run the same file from VS Code's Run button",
        "Trace execution order: top-to-bottom, one statement at a time",
        "Explain why the order of lines changes the output",
      ],
      why: "Knowing three ways to run code means no situation can trap you: no run button, no GUI, no problem — the terminal always works. Just as important is understanding HOW Python executes a file: top to bottom, one line at a time, no exceptions. Beginners who internalize execution order can read any program like a story; those who do not will be lost the moment code exceeds ten lines. This lesson builds that reading skill early.",
      blocks: [
        {
          kind: "text",
          text: "You have already run programs two ways (the Run button, and the playground). Now let us be complete and precise about it, because 'run the code' will be asked of you a thousand times in this course — in three different ways.",
        },
        {
          kind: "heading",
          text: "Way 1 — The terminal (works everywhere)",
        },
        {
          kind: "text",
          text: "The universal method: open a terminal in the folder containing your file and type the command yourself. The pattern is always `python <filename>` (Windows) or `python3 <filename>` (macOS/Linux):",
        },
        {
          kind: "code",
          title: "Running card.py from the terminal",
          lang: "bash",
          code: `python card.py      # Windows
python3 card.py     # macOS / Linux`,
          output: `=== INTRODUCTION CARD ===
Name: Ada
Age: 24
Dream job: data analyst
Years until 30: 6
Ada is learning Python
Ada wants to become a data analyst`,
          outputNote:
            "The terminal runs the file and prints its output below your command. This is the exact same program from last lesson.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "If you see 'can't open file'",
          text: "The message `can't open file 'card.py': No such file or directory` means the terminal is looking in a folder that does not contain card.py. Fix: in VS Code, right-click the file and choose 'Open in Integrated Terminal' — that terminal starts in the right folder.",
        },
        {
          kind: "heading",
          text: "Way 2 — The VS Code Run button",
        },
        {
          kind: "text",
          text: "With a .py file open, click the play triangle in the top-right corner. Under the hood, VS Code types the exact same terminal command for you and shows the output in the panel below. Convenient — but the terminal command is the universal skill; the button is just a shortcut over it.",
        },
        {
          kind: "heading",
          text: "Way 3 — The REPL (for experiments, not programs)",
        },
        {
          kind: "text",
          text: "The REPL runs code too, but one line at a time interactively — perfect for testing an idea, wrong for running a program, because a closed REPL forgets everything. You learned this rule in lesson a-06: questions to the REPL, programs to files.",
        },
        {
          kind: "heading",
          text: "How Python reads your file — the golden rule",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The golden rule of execution",
          text: "Python reads a file the way you read a page: top line first, then the next, then the next — one statement at a time, never skipping, never going back.",
        },
        {
          kind: "code",
          title: "Watch the order matter",
          code: `print("First line runs")
print("Second line runs")

weather = "sunny"
print("Today it is", weather)

weather = "rainy"
print("Now it is", weather)
`,
          output: `First line runs
Second line runs
Today it is sunny
Now it is rainy`,
          explain: [
            "Lines 1–2: prints run in the order written. Line 4 stores 'sunny'; line 5 prints it.",
            "Then line 7 REPLACES the value: assignment to an existing variable overwrites the old one. Line 8 sees only the new value.",
            "Trace it yourself: cover the code with your hand, predict each line before uncovering it. This 'tracing' skill is how professionals read unfamiliar code.",
          ],
        },
        {
          kind: "code",
          title: "The same lines, reversed — different story",
          code: `weather = "rainy"
print("Today it is", weather)

weather = "sunny"
print("Now it is", weather)
`,
          output: `Today it is rainy
Now it is sunny`,
          explain: [
            "Same five lines of vocabulary, different order, different output — order IS meaning in programming.",
            "When a program confuses you, do not stare at it. Trace it: walk down the lines one at a time, writing the value of each variable after every step. Confusion cannot survive a careful trace.",
          ],
        },
        {
          kind: "visual",
          title: "Execution as a falling dot",
          ascii: `   card.py                execution pointer
  +--------------------+
  | name = "Ada"       |   1. runs first  ----+
  | age = 24           |   2. runs second     |
  | print("Name:", name)|  3. runs third      |  always downward,
  | print("Age:", age) |   4. runs fourth     |  one at a time,
  | ...                |   ...                |  never back up
  +--------------------+                      v
   Output appears line by line as the dot falls through the file.
`,
          caption: "There is no magic: a program is a file, and execution falls through it top to bottom.",
        },
        {
          kind: "heading",
          text: "The loop you will live in",
        },
        {
          kind: "steps",
          title: "Edit → Save → Run → Read — forever",
          items: [
            "**Edit** the file.",
            "**Save** it (Ctrl+S / Cmd+S — make it a reflex).",
            "**Run** it (button or terminal).",
            "**Read the output** — every line, every time. Then edit again.",
          ],
        },
        {
          kind: "text",
          text: "Professional developers run this loop hundreds of times a day. Small steps, run often: a program built in twenty tiny verified runs is finished faster — and with fewer bugs — than one giant run at the end. Adopt the habit now: after every one or two lines you write, run.",
        },
        {
          kind: "tryIt",
          title: "Trace before you run",
          task: "Read this program with your eyes only and predict all four output lines. Write your prediction on paper, then run it and score yourself. This is the single best exercise for building the code-reading brain.",
          code: `print("Start")

x = 5
print("x is", x)

x = x + 10
print("x is now", x)

x = x * 2
print("x ends at", x)

print("End")
`,
          hint: "The tricky line is x = x + 10: it means 'compute x + 10 with the CURRENT x, then replace x with the result.' Trace on paper: 5, then 15, then 30.",
        },
      ],
      terms: [
        { term: "Statement", definition: "One complete instruction to Python — usually one line. Programs are lists of statements." },
        { term: "Execution order", definition: "The rule that statements run top to bottom, one at a time, in the order written." },
        { term: "Assignment overwrites", definition: "Assigning to an existing variable replaces its old value: weather = 'rainy' after weather = 'sunny' keeps only 'rainy'." },
        { term: "Tracing", definition: "Reading code slowly, line by line, tracking every variable's value — the core skill for understanding programs." },
        { term: "Edit-save-run loop", definition: "The development cycle: edit, save, run, read output, repeat. Small steps, run often." },
      ],
      mistakes: [
        {
          mistake: "Running the file from the wrong folder and hitting 'No such file or directory'.",
          why: "The terminal runs files relative to the folder it is currently in.",
          fix: "Right-click the file in VS Code and 'Open in Integrated Terminal' — that terminal starts in the file's folder.",
        },
        {
          mistake: "Editing the code but running before saving, seeing stale output.",
          why: "Python runs the saved file on disk — unsaved editor changes are invisible to it.",
          fix: "Ctrl+S / Cmd+S before every run. Make it automatic; stop trusting 'usually autosaves'.",
        },
        {
          mistake: "Believing later lines can affect earlier output — e.g. expecting print(x) on line 2 to show the value x gets on line 10.",
          why: "Execution is strictly top-to-bottom; when line 2 runs, line 10 has not happened yet.",
          fix: "When confused about a value, trace downward and ask: 'at THIS line, what has already run?'",
        },
      ],
      takeaways: [
        "Three ways to run: terminal command (universal), VS Code Run button (shortcut), REPL (experiments only).",
        "Execution is strictly top-to-bottom, one statement at a time — order is meaning.",
        "Assigning to an existing variable overwrites it; print shows the value at that moment in time.",
        "The professional loop: edit, save, run, read — small steps, run often.",
        "When confused, trace the code line by line on paper. Confusion cannot survive a careful trace.",
      ],
      quiz: [
        {
          id: "a-08-q1",
          prompt: "A terminal shows: can't open file 'card.py': No such file or directory. The most likely cause?",
          options: [
            { text: "Python is not installed", correct: false, feedback: "If Python were missing you would see 'command not found' instead — the message names the FILE." },
            { text: "The terminal's current folder does not contain card.py", correct: true, feedback: "Correct — the terminal looks for the file where it is standing. Open the integrated terminal at the file's folder." },
            { text: "card.py has a syntax error", correct: false, feedback: "A syntax error appears AFTER the file is found and run — this error means the file was never opened." },
          ],
          explanation: "Read errors literally: 'no such file' is about finding the file, not running it.",
        },
        {
          id: "a-08-q2",
          prompt: "What does this program print? x = 2, then x = x * 3, then print(x)",
          options: [
            { text: "2", correct: false, feedback: "The first assignment is overwritten by the second — trace it: 2, then 6." },
            { text: "6", correct: true, feedback: "Correct: x * 3 uses the current x (2), giving 6, which replaces x. Then print shows 6." },
            { text: "An error — a variable cannot be assigned twice", correct: false, feedback: "Reassignment is completely normal; only the latest value survives." },
          ],
          explanation: "x = x * 3 means: compute x * 3 with the current x, then store the result back into x.",
        },
        {
          id: "a-08-q3",
          prompt: "Why does this course insist on small edit-save-run cycles?",
          options: [
            { text: "Because Python files corrupt if edited too long", correct: false, feedback: "Files do not decay — this is about catching errors early." },
            { text: "Because a bug found after 2 lines of change is trivial to locate; the same bug after 50 lines is a hunt", correct: true, feedback: "Exactly — every small run shrinks the search space for mistakes." },
            { text: "Because the interpreter forgets saved files otherwise", correct: false, feedback: "Disk is disk; Python does not forget saved files." },
          ],
          explanation: "Small verified steps are the professional habit: less surface for bugs, faster feedback, quicker learning.",
        },
      ],
    },

    // ------------------------------------------------------------- a-09
    {
      slug: "a-09",
      title: "Understanding Errors",
      minutes: 15,
      summary:
        "Errors are not failures — they are Python talking to you. Learn to read the four-part anatomy of an error message, the three most common beginner errors, and the calm professional debug loop.",
      kind: "coding",
      objectives: [
        "Read an error message calmly: name, location, description",
        "Recognize and fix SyntaxError, NameError, and TypeError",
        "Explain the difference between syntax errors and runtime errors",
        "Apply the 4-step debug loop to any error",
      ],
      why: "Every beginner's heart sinks at red text. This lesson rewires that reflex: an error message is the most useful text you will ever read — it names the problem, points at the line, and usually tells you exactly what to fix. Programmers who read errors calmly debug ten times faster than programmers who panic. Learn the anatomy once, and every future error becomes a puzzle instead of a wall.",
      blocks: [
        {
          kind: "text",
          text: "You have already met two errors in this part (the concatenation TypeError, the missing-quotes NameError). Now let us slow down and learn to read errors the way professionals do — because you will read thousands of them, and the skill compounds for your whole career.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Reframe errors, starting now",
          text: "An error message is not a scolding. It is a colleague tapping your shoulder and saying: 'Something went wrong — here is the line number, here is what I expected, here is what I found instead.' That colleague is on YOUR side.",
        },
        {
          kind: "heading",
          text: "Anatomy of an error message",
        },
        {
          kind: "code",
          title: "A real crash, dissected",
          expectError: "NameError: name 'totaal' is not defined",
          code: `total = 10755
print("The total is", totaal)
`,
          explain: [
            "Running this produces the message below. Read it from the BOTTOM UP — the last line names the problem, the lines above point to the location.",
          ],
        },
        {
          kind: "visual",
          title: "The four parts of every traceback",
          ascii: `Traceback (most recent call last):        <-- 1. "Here is the story"
  File "card.py", line 2, in <module>     <-- 2. WHERE: file + line number
    print("The total is", totaal)         <-- 3. THE LINE, shown to you
                     ^^^^^^               <-- 4. the caret pinpoints the culprit
NameError: name 'totaal' is not defined   <-- 5. WHAT: error name + description
                                         ^^^^^^^^ read THIS line first!
`,
          caption:
            "Bottom line first: NameError (error name), then the description (name 'totaal' is not defined). Then look up for the file and line. The arrow even underlines the exact characters.",
        },
        {
          kind: "heading",
          text: "Read bottom-up: the professional habit",
        },
        {
          kind: "steps",
          items: [
            "**Read the last line first** — it names the error and describes the problem.",
            "**Find the location** — scan up to the first `File \"...\", line N` for file and line number.",
            "**Look at that line** — the traceback shows the actual code, with a caret (^) pointing at the suspect characters.",
            "**Fix, save, re-run** — then read the NEXT error if there is one. Iteration is normal.",
          ],
        },
        {
          kind: "heading",
          text: "The three errors you will meet most this month",
        },
        {
          kind: "table",
          title: "The beginner's big three",
          headers: ["Error", "What it means", "Typical cause", "Fix"],
          rows: [
            ["SyntaxError", "Python cannot even READ the line — the grammar is broken", "Missing colon, missing quote, extra parenthesis", "Look at the caret; check for : \" ' ( ) right there"],
            ["NameError", "You used a name Python does not know", "Typo (totaal vs total), or using a variable before creating it", "Check spelling; make sure the variable is defined BEFORE the line that uses it"],
            ["TypeError", "Right name, wrong TYPE of value for the operation", "Text + number concatenation; calling a number like a function", "Convert types (str(), int()) or use an f-string"],
          ],
          caption: "Notice the pattern: each name tells you the CATEGORY of the problem. The name is half the diagnosis.",
        },
        {
          kind: "heading",
          text: "Two moments when errors strike",
        },
        {
          kind: "text",
          text: "**Syntax errors** are caught before anything runs: Python reads your whole file first, finds broken grammar, and refuses to start. You get no output at all. **Runtime errors** hide until execution reaches them: the program starts fine, then crashes at a specific line. The difference matters for diagnosis:",
        },
        {
          kind: "code",
          title: "Syntax error — nothing runs at all",
          expectError: "SyntaxError: expected ':'",
          code: `print("Step 1")
if 5 > 3
    print("Step 2")
`,
          explain: [
            "The missing colon after `if 5 > 3` breaks the grammar — Python refuses to run ANY line, not even the first print. Syntax errors kill the whole run before it starts. (if-statements arrive properly in Part C.)",
          ],
        },
        {
          kind: "code",
          title: "Runtime error — the crash happens mid-story",
          expectError: "ZeroDivisionError: division by zero",
          code: `print("Step 1: program starts")
print("Step 2: computing...")
print("Step 3:", 100 / 0)
print("Step 4: never reached")
`,
          explain: [
            "Watch the output when this runs: steps 1 and 2 print normally, THEN the crash at line 3 — and step 4 never happens.",
            "A runtime error means: everything before the crashing line already ran. The crash location tells you exactly how far the story got.",
          ],
        },
        {
          kind: "code",
          title: "The actual output of the runtime crash",
          lang: "text",
          code: `Step 1: program starts
Step 2: computing...
Traceback (most recent call last):
  File "crash.py", line 3, in <module>
    print("Step 3:", 100 / 0)
                    ~~~~~^~~
ZeroDivisionError: division by zero`,
          outputNote:
            "Real output text: two successful prints, then the traceback with line 3, then the error name. Step 4 is missing — execution died at line 3.",
        },
        {
          kind: "heading",
          text: "The calm debug loop (use it forever)",
        },
        {
          kind: "steps",
          title: "Four steps, any error",
          items: [
            "**Breathe and read the last line.** Do not touch the code yet — just read what it says, twice.",
            "**Go to the line it names.** Look exactly where the caret points. Half of all bugs are visible in five seconds.",
            "**Ask: what did Python expect, and what did it find?** The message usually states both.",
            "**Fix ONE thing, save, re-run.** Never change five things at once — you will not know which fix worked (or which broke something new).",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Copy the error, do not paraphrase it",
          text: "When searching an error online, paste the exact last line ('NameError: name x is not defined'), not your memory of it. Exact wording finds the answer; paraphrase finds noise.",
        },
        {
          kind: "visual",
          title: "Errors in the learning lifecycle",
          ascii: `   error name            when caught         your first move
  ---------------        --------------      --------------------
   SyntaxError           before running     look at the caret line
   NameError             while running      check spelling/definition order
   TypeError             while running      check the TYPES of the values
   ZeroDivisionError     while running      check the special value (0, '', ...)
  ---------------        --------------      --------------------
   ALL of them: readable messages, not walls. Read bottom-up, fix, re-run.
`,
          caption: "The pattern generalizes: the error NAME is the category, the DESCRIPTION is the detail, the LINE is the location.",
        },
        {
          kind: "tryIt",
          title: "Break it on purpose — read it calmly",
          task: "This program has ONE bug. Run it, read the traceback bottom-up, find the line, fix it, run again until the card prints. You are practicing the exact professional loop.",
          code: `# This program has one bug. Find it, fix it, run again.
name = "Ada"
age = 24
dream_job = "data analyst"

print("=== INTRODUCTION CARD ===")
print("Name:", name)
print("Age:", age)
print("Dream job:", dream_jb)
print(f"{name} wants to become a {dream_job}")
`,
          hint: "The error name will be NameError — check the spelling of every variable on the line it points to, letter by letter, against line 5.",
          expectError: true,
        },
      ],
      terms: [
        { term: "Error (exception)", definition: "A signal that something went wrong while running. Python stops and reports it with a message instead of guessing." },
        { term: "Traceback", definition: "The multi-line error report: which file, which line, which code, and what went wrong. Read it bottom-up." },
        { term: "SyntaxError", definition: "Broken grammar — Python cannot read the line, so nothing runs at all." },
        { term: "NameError", definition: "A name you used does not exist — usually a typo or a variable used before it is defined." },
        { term: "TypeError", definition: "An operation applied to the wrong type of value — like + between text and a number." },
        { term: "Runtime error", definition: "An error that appears while the program runs, at the moment execution reaches the faulty line." },
      ],
      mistakes: [
        {
          mistake: "Seeing red text and immediately changing random lines in panic.",
          why: "Panic edits add NEW bugs on top of the old one, and you lose track of what changed.",
          fix: "The calm loop: read the last line, go to the named line, fix ONE thing, re-run.",
        },
        {
          mistake: "Reading the traceback top-down and drowning in the first technical lines.",
          why: "The top lines are infrastructure noise; the diagnosis lives in the LAST line.",
          fix: "Train the reflex: eyes to the bottom of the traceback first, then walk upward to the location.",
        },
        {
          mistake: "Fixing five things at once, then not knowing which change mattered.",
          why: "Multiple simultaneous edits make cause and effect untraceable.",
          fix: "One change per run. It feels slower; it is dramatically faster.",
        },
      ],
      takeaways: [
        "An error message is a helpful colleague: name, line number, description, caret.",
        "Read tracebacks BOTTOM-UP: the last line names the problem; above it is the location.",
        "SyntaxError = broken grammar, nothing runs. Runtime errors = fine grammar, crash mid-execution.",
        "The big three for beginners: SyntaxError (grammar), NameError (unknown name/typo), TypeError (wrong type).",
        "The calm loop: read, locate, fix ONE thing, save, re-run. Copy error text exactly when searching.",
      ],
      quiz: [
        {
          id: "a-09-q1",
          prompt: "In a long traceback, which line should you read FIRST?",
          options: [
            { text: "The very first line — 'Traceback (most recent call last)'", correct: false, feedback: "That is just the headline. The diagnosis lives elsewhere." },
            { text: "The last line — it names the error type and describes the problem", correct: true, feedback: "Correct — bottom-up reading: last line for WHAT, then up for WHERE." },
            { text: "The middle — where the file name usually appears", correct: false, feedback: "The location helps, but it comes SECOND in the reading order." },
          ],
          explanation: "Last line first: error name + description. Then the File/line info above it. Then the culprit line with its caret.",
        },
        {
          id: "a-09-q2",
          prompt: "Your program prints two lines, then crashes with ZeroDivisionError on line 3. What do you know for certain?",
          options: [
            { text: "Nothing ran at all — syntax errors stop everything", correct: false, feedback: "Two lines DID print, so this was not a syntax error; execution got at least that far." },
            { text: "Lines 1–2 ran successfully; execution died the moment it reached line 3", correct: true, feedback: "Exactly — runtime errors kill the run at the exact line, and everything before it already happened." },
            { text: "Line 3 has a spelling mistake in a variable name", correct: false, feedback: "That would be a NameError — the error name tells you it was a division by zero instead." },
          ],
          explanation: "A runtime traceback is a story: everything above the crash succeeded. That tells you exactly how far the program got.",
        },
        {
          id: "a-09-q3",
          prompt: "NameError: name 'totaal' is not defined. What is the FASTEST path to the fix?",
          options: [
            { text: "Reinstall Python — the interpreter is misbehaving", correct: false, feedback: "The interpreter is fine; it correctly reported an unknown name." },
            { text: "Go to the named line and compare its spelling against where the variable was defined (likely a typo: totaal vs total)", correct: true, feedback: "Exactly — nine times out of ten a NameError is a typo or a use-before-definition." },
            { text: "Wrap the line in quotes so it prints instead of running", correct: false, feedback: "That silences the error by deleting the feature — debugging means fixing, not hiding." },
          ],
          explanation: "NameError = unknown name. Check spelling first, then check that the variable is defined BEFORE the line using it.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART A EXERCISES — 4 beginner, 4 intermediate, 4 advanced
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "a-b1",
      tier: "beginner",
      title: "Print a recipe",
      prompt:
        "Write a program that prints a tea recipe as exactly four lines: a title line 'HOW TO MAKE TEA', then three steps of your choice, one per line. Use print() once per line. Keep each step under 40 characters so the output stays neat.",
      hint: "Four print() calls, each with one text value in quotes. Text between double or single quotes — pick one style and stay consistent.",
      starter: `# Print a title, then three recipe steps

`,
      solution: `print("HOW TO MAKE TEA")
print("1. Boil water")
print("2. Put a tea bag in the cup")
print("3. Wait 3 minutes, then remove the bag")
`,
      expectedOutput: `HOW TO MAKE TEA
1. Boil water
2. Put a tea bag in the cup
3. Wait 3 minutes, then remove the bag`,
      concepts: ["print()", "strings"],
    },
    {
      id: "a-b2",
      tier: "beginner",
      title: "The introduction card, personalized",
      prompt:
        "Copy the introduction-card pattern from lesson a-07 with YOUR OWN details: three variables (name, age, city), then prints using each variable at least once. One print must use commas, one must use an f-string. The program must produce exactly four output lines: a title and three detail lines.",
      hint: "Create the three variables first, then print. Commas: print('Name:', name). f-string: print(f'I live in {city}').",
      starter: `# Your details
name = "Ada"
age = 24
city = "Lisbon"

# Print the card: one title line + three detail lines

`,
      solution: `name = "Ada"
age = 24
city = "Lisbon"

print("=== MY CARD ===")
print("Name:", name)
print(f"Age: {age}")
print("City:", city)
`,
      expectedOutput: `=== MY CARD ===
Name: Ada
Age: 24
City: Lisbon`,
      concepts: ["variables", "print()", "f-strings"],
    },
    {
      id: "a-b3",
      tier: "beginner",
      title: "Calculator warm-up",
      prompt:
        "Store 17 and 5 in two variables, then print exactly these five lines: their sum (+), difference (-), product (*), float division (/), and integer division (//). Each line must show the operation symbol and the result, e.g. 'sum: 22'.",
      hint: "You can compute inside print: print('sum:', a + b). The five operators: + - * / //.",
      starter: `a = 17
b = 5

# Print sum, difference, product, float division, integer division

`,
      solution: `a = 17
b = 5

print("sum:", a + b)
print("difference:", a - b)
print("product:", a * b)
print("float division:", a / b)
print("integer division:", a // b)
`,
      expectedOutput: `sum: 22
difference: 12
product: 85
float division: 3.4
integer division: 3`,
      concepts: ["arithmetic operators", "print()", "variables"],
    },
    {
      id: "a-b4",
      tier: "beginner",
      title: "Comment the why",
      prompt:
        "The program below works but has no comments. Add exactly three comments: one file-header comment at the top saying what the program is, and one comment above each of the two 'surprising' lines (the round() call and the f-string) explaining WHY each is written that way. Do not change any code — comments only. The output must stay identical.",
      hint: "Comments start with # and are ignored by Python. Explain WHY round() gives 2 here (banker's rounding) and why the f-string is safer than + concatenation.",
      starter: `price = 19.99
rounded = round(price)
label = f"Total: {rounded}"

print(label)
`,
      solution: `# Price tag formatter: shows the rounded total price for a display sign

price = 19.99
# round() uses banker's rounding: .5 rounds to the nearest EVEN number,
# which is why 19.99 -> 20 but 20.5 would also stay 20
rounded = round(price)
# f-string mixes text and the number safely — + concatenation would
# raise a TypeError between str and int
label = f"Total: {rounded}"

print(label)
`,
      expectedOutput: `Total: 20`,
      concepts: ["comments", "round()", "f-strings"],
    },

    // ---- intermediate
    {
      id: "a-i1",
      tier: "intermediate",
      title: "Predict-then-verify: variable swap trace",
      prompt:
        "Before running anything, write down on paper what this program prints, line by line. Then add the missing print statements to make the program actually produce those exact four lines. Run it and check yourself: every prediction you got right builds the tracing skill; every miss teaches you something.",
      hint: "Trace in order: x = 2, then y = x + 3 (what is x at that moment?), then x = x * y (what are x and y NOW?), then the swap using a temporary variable t.",
      starter: `# PREDICT FIRST: what do these print?
x = 2
y = x + 3
x = x * y
t = x
x = y
y = t

# Add four prints here:
# print("x is", ...) etc.

`,
      solution: `x = 2
y = x + 3      # y = 5
x = x * y      # x = 10
t = x          # t = 10
x = y          # x = 5
y = t          # y = 10

print("x is", x)
print("y is", y)
print("sum is", x + y)
print("product is", x * y)
`,
      expectedOutput: `x is 5
y is 10
sum is 15
product is 50`,
      concepts: ["execution order", "tracing", "variable reassignment"],
    },
    {
      id: "a-i2",
      tier: "intermediate",
      title: "Fix the five errors",
      prompt:
        "This program has FIVE distinct bugs: two syntax errors, one NameError, one TypeError, and one missing f-prefix. Fix them one at a time — after each fix, run and read the NEXT error before touching anything else. That is the professional loop from lesson a-09, practiced deliberately. The fixed program must print the two output lines shown below.",
      hint: "Fix order matters: syntax first (nothing runs while grammar is broken), then run and chase each runtime error one at a time. The TypeError is the classic text-plus-number concatenation.",
      starter: `# Five bugs. Fix one, run, read the next error, repeat.
visitor = "Grace"
visits = 4

print("Welcome back, " + visitor)
print("You have visited" visits "times")
print("Next visit will be number", visit + 1)
print(f"{visitor} has visited {visits} times")
`,
      solution: `visitor = "Grace"
visits = 4

print("Welcome back, " + visitor)
print("You have visited", visits, "times")
print("Next visit will be number", visits + 1)
print(f"{visitor} has visited {visits} times")
`,
      expectedOutput: `Welcome back, Grace
You have visited 4 times
Next visit will be number 5
Grace has visited 4 times`,
      concepts: ["debugging", "SyntaxError", "NameError", "TypeError", "f-strings"],
    },
    {
      id: "a-i3",
      tier: "intermediate",
      title: "The bill splitter",
      prompt:
        "Write a program that splits a restaurant bill. Store the total (142.50), the number of friends (6), and the tip percent (10) in variables. Compute the tip amount, the grand total, and each person's share (grand total divided by friends). Print exactly the three lines shown below, using an f-string for at least one of them. Use round() to keep the share to 2 decimal places.",
      hint: "tip = total * tip_percent / 100. grand = total + tip. share = round(grand / friends, 2). The f-string with :.2f also formats decimals — round() is fine here.",
      starter: `total = 142.50
friends = 6
tip_percent = 10

# Compute tip, grand total, and per-person share; print three lines

`,
      solution: `total = 142.50
friends = 6
tip_percent = 10

tip = total * tip_percent / 100
grand_total = total + tip
share = round(grand_total / friends, 2)

print(f"Tip: {tip}")
print(f"Grand total: {grand_total}")
print(f"Each person pays: {share}")
`,
      expectedOutput: `Tip: 14.25
Grand total: 156.75
Each person pays: 26.12`,
      concepts: ["arithmetic", "round()", "f-strings", "expressions"],
    },
    {
      id: "a-i4",
      tier: "intermediate",
      title: "REPL detective: the 0.1 + 0.2 mystery",
      prompt:
        "Lesson a-06 showed that 0.1 + 0.2 == 0.3 is False. Investigate like a detective and answer with prints: (1) print the exact value of 0.1 + 0.2. (2) Print the difference between 0.1 + 0.2 and 0.3. (3) Print whether round(0.1 + 0.2, 10) == 0.3. (4) Using what you learned, print one sentence (any wording) explaining the safest way to compare floating-point results.",
      hint: "The difference is 0.30000000000000004 - 0.3 — compute it with subtraction, do not type the digits. round(x, 10) rounds to 10 decimal places, wiping out the microscopic error.",
      starter: `# Detective work on floating-point precision

# 1. The exact value of 0.1 + 0.2

# 2. The difference from 0.3

# 3. Does rounding to 10 places fix the comparison?

# 4. One sentence: the safe way to compare floats

`,
      solution: `print(0.1 + 0.2)
print(0.1 + 0.2 - 0.3)
print(round(0.1 + 0.2, 10) == 0.3)
print("Safe float comparison: round both sides, or compare the difference to a tiny tolerance.")
`,
      expectedOutput: `0.30000000000000004
5.551115123125783e-17
True
Safe float comparison: round both sides, or compare the difference to a tiny tolerance.`,
      concepts: ["floating-point", "round()", "comparison", "print()"],
    },

    // ---- advanced
    {
      id: "a-a1",
      tier: "advanced",
      title: "The receipt formatter",
      prompt:
        "Build a receipt printer with PERFECT alignment. Given the items below (name, price pairs in three variables), print a receipt with: a centered title 'RECEIPT' on a 20-character-wide line of = signs, then each item as 'name' padded to 12 characters followed by the price right-aligned in 8 characters with exactly 2 decimal places, then a dashed separator line of 20 dashes, then 'TOTAL' padded to 12 characters and the total price formatted the same way. Use only string formatting you have met: f-strings with :.2f, :<12, :>8, and string * number repetition. The output must match the expected output EXACTLY.",
      hint: "f'{name:<12}{price:>8.2f}' pads a name to the left and right-aligns a price in an 8-wide field. '=' * 20 makes the title rule; '-' * 20 makes the separator. Total: 12.50 + 48.00 + 3.75.",
      starter: `item1 = "Coffee"
price1 = 12.50
item2 = "Notebook"
price2 = 48.00
item3 = "Pen"
price3 = 3.75

# Print the aligned receipt

`,
      solution: `item1 = "Coffee"
price1 = 12.50
item2 = "Notebook"
price2 = 48.00
item3 = "Pen"
price3 = 3.75

total = price1 + price2 + price3

print("=" * 20)
print("RECEIPT".center(20))
print("=" * 20)
print(f"{item1:<12}{price1:>8.2f}")
print(f"{item2:<12}{price2:>8.2f}")
print(f"{item3:<12}{price3:>8.2f}")
print("-" * 20)
print(f"{'TOTAL':<12}{total:>8.2f}")
`,
      expectedOutput: `====================
      RECEIPT
====================
Coffee         12.50
Notebook       48.00
Pen             3.75
--------------------
TOTAL          64.25`,
      concepts: ["f-strings", "string formatting", "alignment", "str methods"],
    },
    {
      id: "a-a2",
      tier: "advanced",
      title: "The error museum",
      prompt:
        "Build an 'error museum': a program that catches and displays errors as exhibits instead of crashing. You do not know try/except yet (Part G), so do it the structural way: write FIVE separate tiny programs — each one triggers exactly ONE of these errors: SyntaxError (write it, then comment it out and explain why in a comment), NameError, TypeError, ZeroDivisionError, and an f-string missing its f prefix (no error — but wrong output; that is called a logic error). For each of the four runnable exhibits: trigger the error inside a print-safe pattern is impossible — so instead, make each exhibit a separate script and, in THIS exercise, keep each crashing line commented out with a comment quoting its exact error message. The museum's visible output is five exhibit labels, printed cleanly.",
      hint: "The only runnable lines are the print() labels. Every crashing line stays as a comment with its error quoted, like: # print('Age: ' + 24)  # TypeError: can only concatenate str. The missing-f line CAN run — it shows the logic error in its output.",
      starter: `# The Error Museum — five exhibits, one per error type
# Each crashing line is preserved as a comment with its error message.

print("EXHIBIT 1: SyntaxError — the grammar police")

print("EXHIBIT 2: NameError — the unknown name")

print("EXHIBIT 3: TypeError — the wrong type")

print("EXHIBIT 4: ZeroDivisionError — the impossible math")

print("EXHIBIT 5: logic error — no error message, wrong answer")
`,
      solution: `# The Error Museum — five exhibits, one per error type
# Each crashing line is preserved as a comment with its error message.

print("EXHIBIT 1: SyntaxError — the grammar police")
# print("Hello"    # SyntaxError: unterminated string literal
# if 5 > 3        # SyntaxError: expected ':' (colon missing after the condition)

print("EXHIBIT 2: NameError — the unknown name")
# print(totaal)   # NameError: name 'totaal' is not defined

print("EXHIBIT 3: TypeError — the wrong type")
# print("Age: " + 24)   # TypeError: can only concatenate str (not "int") to str

print("EXHIBIT 4: ZeroDivisionError — the impossible math")
# print(100 / 0)  # ZeroDivisionError: division by zero

print("EXHIBIT 5: logic error — no error message, wrong answer")
name = "Ada"
print("{name} is learning Python")   # prints {name} literally — missing f!
print(f"{name} is learning Python")  # the fix
`,
      expectedOutput: `EXHIBIT 1: SyntaxError — the grammar police
EXHIBIT 2: NameError — the unknown name
EXHIBIT 3: TypeError — the wrong type
EXHIBIT 4: ZeroDivisionError — the impossible math
EXHIBIT 5: logic error — no error message, wrong answer
{name} is learning Python
Ada is learning Python`,
      concepts: ["error types", "debugging", "logic errors", "comments"],
    },
    {
      id: "a-a3",
      tier: "advanced",
      title: "Type detective: predict every print",
      prompt:
        "This program prints values that LOOK like text but have different types. First predict every output line on paper. Then write the exact program and run it. Any line you predicted wrong, trace it and write a one-comment explanation next to it. Required: at least two str() conversions, two int() conversions, one float() conversion, and one line proving that text digits and numbers are different types.",
      hint: "int('42') is the NUMBER 42; '42' is TEXT. '4' + '2' is '42' (gluing text), but 4 + 2 is 6 (adding numbers). str(3.5) is the text '3.5'. type() reveals what anything really is — but you may keep to conversions here.",
      starter: `# Predict every line FIRST, then run and explain every miss
text_digits = "42"
number = 42

# 1. print them both — they look identical
print(text_digits)
print(number)

# 2. prove they are different: add them to themselves
print(text_digits + text_digits)
print(number + number)

# 3. convert and re-add

# 4. text to number, number to text, number to float

`,
      solution: `text_digits = "42"
number = 42

# 1. They look identical on screen...
print(text_digits)
print(number)

# 2. ...but + reveals their types: text glues, numbers add
print(text_digits + text_digits)   # '42' + '42' -> '4242' (gluing!)
print(number + number)             # 42 + 42 -> 84 (adding)

# 3. Convert text to number: now + adds
print(int(text_digits) + int(text_digits))   # 84

# 4. Conversions across all three types
print(str(number) + " is the number")   # text + text works
print(int("7") + 3)                     # 10
print(float("3.5") + 0.5)               # 4.0
print(float(number))                    # 42.0 (int -> float, always possible)
`,
      expectedOutput: `42
42
4242
84
84
42 is the number
10
4.0
42.0`,
      concepts: ["type conversion", "str()", "int()", "float()", "types"],
    },
    {
      id: "a-a4",
      tier: "advanced",
      title: "The professional setup checklist",
      prompt:
        "Write a program that verifies a student's setup the way a mentor would, printing a PASS/FAIL report. Given the variables below, print a report with: a header line, then one line per check using the given data — python version OK if version >= 3.10, editor OK if editor is 'VS Code', extension OK if python_extension is True, terminal OK if terminal_command is either 'python' or 'python3'. You have not met if-statements yet — so build each PASS/FAIL label using the ternary-free trick of indexing: ('FAIL', 'PASS')[condition] (Python treats True as 1 and False as 0, so this picks the label — a preview of Part C logic). End with a summary line counting the passes using integer addition of the booleans. Output must match exactly.",
      hint: "label = ('FAIL', 'PASS')[version >= 3.10] picks 'PASS' when the condition is True (True == 1 selects index 1). Booleans add as 1/0, so passed = ok1 + ok2 + ... counts passes.",
      starter: `version = 3.12
editor = "VS Code"
python_extension = True
terminal_command = "python3"

# Print a 6-line report: header, 4 checks, summary

`,
      solution: `version = 3.12
editor = "VS Code"
python_extension = True
terminal_command = "python3"

print("=== SETUP CHECKLIST ===")

ok1 = version >= 3.10
ok2 = editor == "VS Code"
ok3 = python_extension
ok4 = terminal_command == "python" or terminal_command == "python3"

print("Python version:", ("FAIL", "PASS")[ok1])
print("Editor:", ("FAIL", "PASS")[ok2])
print("Python extension:", ("FAIL", "PASS")[ok3])
print("Terminal command:", ("FAIL", "PASS")[ok4])

passed = ok1 + ok2 + ok3 + ok4
print(f"Score: {passed}/4 checks passed")
`,
      expectedOutput: `=== SETUP CHECKLIST ===
Python version: PASS
Editor: PASS
Python extension: PASS
Terminal command: PASS
Score: 4/4 checks passed`,
      concepts: ["comparisons", "booleans", "indexing trick", "f-strings"],
    },
  ],

  // =====================================================================
  // PART A ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "a-as-1",
      prompt: "What is a program, in one sentence?",
      options: [
        { text: "A precise, ordered list of instructions a computer executes literally", correct: true, feedback: "Exactly — ordered, precise, literal. The three properties that make it a recipe and not a suggestion." },
        { text: "A suggestion of goals the computer interprets creatively", correct: false, feedback: "Computers have zero creativity — they follow instructions exactly as written, even wrong ones." },
        { text: "A math proof transcribed into machine form", correct: false, feedback: "Most programs contain no formal math at all." },
      ],
      explanation: "A program is instructions executed exactly, in order, with no common sense filling gaps.",
    },
    {
      id: "a-as-2",
      prompt: "Python is called an 'interpreted' language. The practical consequence for you is…",
      options: [
        { text: "You can run a single line and see its result immediately, which makes learning fast", correct: true, feedback: "Exactly — the REPL and instant file runs exist because interpretation happens line by line." },
        { text: "Python cannot build large software", correct: false, feedback: "Instagram and Netflix run enormous Python systems." },
        { text: "Python programs need no saving to disk", correct: false, feedback: "Files must be saved; only the REPL is conversational." },
      ],
      explanation: "Immediate feedback is the practical gift of interpretation — you will use it in every lesson.",
    },
    {
      id: "a-as-3",
      prompt: "You type python --version (or python3 --version) and see 'command not found'. What is the healthiest first move?",
      options: [
        { text: "Reinstall your operating system", correct: false, feedback: "Drastic and unnecessary — this is a PATH/config problem, not a broken machine." },
        { text: "Re-run the Python installer, ensure 'Add to PATH' is ticked, then reopen the terminal", correct: true, feedback: "Exactly the standard fix: PATH entry + fresh terminal (terminals only read PATH at startup)." },
        { text: "Type PYTHON in capitals", correct: false, feedback: "Commands are case-sensitive; capitals make it worse, not better." },
      ],
      explanation: "'Command not found' = PATH problem = installer checkbox + new terminal.",
    },
    {
      id: "a-as-4",
      prompt: "Which VS Code component teaches it to highlight, complete, and run Python?",
      options: [
        { text: "The Microsoft Python extension from the Extensions marketplace", correct: true, feedback: "Right — the extension is what makes VS Code Python-aware." },
        { text: "Purchasing VS Code Professional", correct: false, feedback: "No paid tier exists — VS Code is free and open source." },
        { text: "Naming your file python.py", correct: false, feedback: "That name is a trap: it can shadow the real Python module system." },
      ],
      explanation: "Editor + Python extension = professional setup. Both free.",
    },
    {
      id: "a-as-5",
      prompt: "In the REPL you type 3 * 3 and press Enter, without typing print(). What appears?",
      options: [
        { text: "Nothing — files print, the REPL does not", correct: false, feedback: "Reversed: it is the REPL that auto-prints expression values." },
        { text: "9", correct: true, feedback: "Correct — the P in REPL is Print: expression values display automatically." },
        { text: "A SyntaxError, because print() is required", correct: false, feedback: "print() is required in FILES; the REPL auto-prints." },
      ],
      explanation: "REPL auto-print is why it is the perfect question-asking machine.",
    },
    {
      id: "a-as-6",
      prompt: "Trace it: x = 4, then y = x + 1, then x = y * 2, then print(x, y). What is the output?",
      options: [
        { text: "10 5", correct: true, feedback: "Correct: y = 5, then x = 10. print with a comma shows both, space-separated." },
        { text: "4 5", correct: false, feedback: "That forgets the third line: x was reassigned to y * 2 = 10." },
        { text: "9 5", correct: false, feedback: "Close — check y * 2 with y = 5: that is 10, not 9." },
      ],
      explanation: "Top-to-bottom execution with reassignment: y = 5, then x = 5 * 2 = 10.",
    },
    {
      id: "a-as-7",
      prompt: "print('Age: ' + 24) raises TypeError. Which fix is the professional default?",
      options: [
        { text: "print(f'Age: {24}') — the f-string", correct: true, feedback: "Yes — f-strings mix any type safely and read best. The modern default." },
        { text: "Remove the number and hard-code 'Age: 24'", correct: false, feedback: "Hard-coding deletes the point of the variable; the fix must keep the value dynamic." },
        { text: "Wrap the number in str(): print('Age: ' + str(24))", correct: false, feedback: "Valid — it works! But str() conversion is the older, noisier style; f-strings mix any type safely and read better, which is why they are the default." },
      ],
      explanation: "f-strings handle every type without conversion — that is why this course reaches for them first.",
    },
    {
      id: "a-as-8",
      prompt: "A traceback's MOST important line — the one to read first — is…",
      options: [
        { text: "The first line: 'Traceback (most recent call last)'", correct: false, feedback: "That is just the header announcing the story." },
        { text: "The LAST line: the error name and its description", correct: true, feedback: "Correct — bottom-up reading: WHAT happened first, then walk up for WHERE." },
        { text: "Whichever line mentions Python itself", correct: false, feedback: "Infrastructure lines are noise for beginners; the diagnosis is the final line." },
      ],
      explanation: "Read bottom-up: last line = what, then up for file and line, then the culprit code with its caret.",
    },
  ],

  // =====================================================================
  // PART A MINI PROJECT
  // =====================================================================
  project: {
    title: "The Personal Introduction Generator",
    brief:
      "You will build a complete, personalized introduction program — the first program in this course that is genuinely yours. It takes a person's details, computes derived facts (like age in days and years to a goal), formats a clean multi-section report to the screen, and ends with a personal motto banner. Everything uses only Part A tools: variables, prints, arithmetic, f-strings, comments, and the edit-save-run loop. When it is done, you will have a program worth showing someone — and proof you can take an idea from empty file to working software.",
    requirements: [
      "A header comment block at the top of the file: what the program is, who wrote it, and the date",
      "At least six variables describing one person: name, age, city, dream_job, years_learning_goal, favorite_number",
      "A derived variable: days_old, computed as age * 365 (comment that it ignores leap years)",
      "A second derived variable: goal_year, computed as 2026 + years_learning_goal",
      "A three-line banner made with string repetition (= * 30 or similar) around a centered title",
      "At least six detail lines, each using a different value, with at least three of them using f-strings",
      "A 'fun facts' section showing favorite_number multiplied, added to itself, and squared",
      "A closing motto line built with concatenation (+) — converted properly, no TypeError",
      "The program prints at least 14 lines in total, in the exact order: banner, details, fun facts, motto",
      "Zero errors, and every output line reads like a finished product (no debug leftovers)",
    ],
    steps: [
      "Step 1 — Create the file: in VS Code, in your pycourse folder, create intro_generator.py. Write the header comment block first, save, and run the empty file — it should simply do nothing. That is a working baseline.",
      "Step 2 — The banner: print a line of = repeated 30 times, then your title centered (use .center(30)), then the = line again. Run and check the alignment before continuing.",
      "Step 3 — The person: add the six variables with YOUR details. Add three detail prints using commas. Run after each one (small steps, remember).",
      "Step 4 — Derived values: add days_old and goal_year with their calculations and comments. Print them in two new f-string lines.",
      "Step 5 — Fun facts: print favorite_number * 2, + itself, and ** 2 (squared), each labeled. Use f-strings with the computation inside the braces.",
      "Step 6 — The motto: build a motto variable (text) and a number (your favorite_number), then print them combined with + — converting the number with str(). Then also print the same line with an f-string, and delete the version you like less.",
      "Step 7 — The review pass: read your program top to bottom like lesson a-08 taught. Fix alignment, wording, and comment quality. Run one final time, read every output line, then show it to someone.",
    ],
    starter: `# ============================================
# Personal Introduction Generator
# Author: (your name)
# Date: (today's date)
# What: prints a full introduction card about me
# ============================================

# --- The banner (Step 2) ---

# --- The person (Step 3) ---

# --- Derived values (Step 4) ---

# --- Fun facts (Step 5) ---

# --- The motto (Step 6) ---

`,
    concepts: ["variables", "print()", "f-strings", "arithmetic", "comments", "string repetition", "edit-save-run loop"],
    extension:
      "Level up: add a 'life in weeks' section — compute your age in weeks (age * 52) and print it in a formatted banner of its own. Then add a second person (a friend or a mentor) as six more variables, and print their card below yours with the same formatting, one blank line between.",
  },
};



