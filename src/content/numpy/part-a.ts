/**
 * PART A — NUMPY FUNDAMENTALS: WHERE ARRAYS COME FROM
 *
 * The on-ramp: what NumPy is and why numerical computing matters ->
 * Python lists vs NumPy arrays (the speed and memory story) -> installing
 * NumPy and building your first arrays -> the ndarray's anatomy (data
 * buffer, dtype, shape, strides, axes) -> the full attribute passport.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 * Machine-dependent outputs (install dialogs, timings) use lang "bash"/"text"
 * and are never presented as verified program output.
 *
 * Authoring conventions:
 *   - code blocks use the AUTOFILL placeholder for their output field; the
 *     verifier fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_A: NumpyPart = {
  letter: "A",
  title: "NumPy Fundamentals: Where Arrays Come From",
  tagline: "What NumPy is, why it exists, and how to hold numbers the way it does",
  description:
    "Meet the engine underneath all of data science: what NumPy actually is, why doing math with Python lists is like carrying water in a sieve, how to install NumPy and build your first arrays, and how to read an array's anatomy — its data buffer, dtype, shape, strides and axes — until a NumPy array stops being a mystery and becomes a machine you can reason about.",
  lessons: [
    // ------------------------------------------------------------- a-01
    {
      slug: "a-01",
      title: "What NumPy Is, and Why Numerical Computing Matters",
      minutes: 14,
      summary:
        "NumPy in one honest picture: a Python library that stores numbers in packed, typed grids and does math on whole grids at once — and why that one idea powers everything from spreadsheets to neural networks.",
      kind: "concept",
      objectives: [
        "Explain what NumPy is in your own words, without jargon",
        "Say what 'numerical computing' means and name three fields that depend on it",
        "Describe NumPy's place in the Python data stack (pandas, SciPy, scikit-learn, PyTorch all stand on it)",
        "Explain the one-sentence reason NumPy is fast: whole-array operations in compiled code",
      ],
      why: "Every tool you will meet in data work — pandas DataFrames, SciPy, scikit-learn, matplotlib, PyTorch — assumes you can think in NumPy arrays. Skipping this foundation is like learning Excel formulas without knowing what a cell is. Ten minutes understanding what NumPy is and why it exists will make every later topic — broadcasting, vectorization, linear algebra — feel like a natural consequence instead of a rule to memorize. And the core idea is genuinely simple: pack numbers tightly, describe their layout once, and operate on the whole grid at once.",
      blocks: [
        {
          kind: "text",
          text: "You already know what data looks like: a column of prices, a grid of pixels, a table of measurements. **NumPy** (from *Numerical Python*) is a Python library built around one idea: hold those numbers in a **packed, typed grid** — and do math on the **whole grid at once**, with the heavy lifting done by fast compiled code instead of a Python loop.",
        },
        {
          kind: "heading",
          text: "A picture you already understand: the spreadsheet",
        },
        {
          kind: "text",
          text: "Think of a spreadsheet column of 1000 temperatures. If you wanted *each value doubled*, you would not double cell A1, then A2, then A3 by hand — you would write one formula and fill it down. NumPy gives Python that same superpower, plus more: grids with 2, 3, or N dimensions, a type system for numbers, and thousands of math operations that run over entire grids in one step.",
        },
        {
          kind: "visual",
          title: "One operation, applied to a whole grid",
          ascii: `  a Python loop (slow, one cell at a time)      NumPy (one step, whole grid)

  doubled = []                                  doubled = a * 2
  for x in a:                                        +---------+
      doubled.append(x * 2)                   a -->|  a * 2  |--> [[ 2, 4],
                                                       +---------+     [ 6, 8]]
   [1,2] -> 2, 3 -> 6, ...
   (Python talks to each number,                (fast compiled code walks
    one interpreted step at a time)              the packed grid once)
`,
          caption:
            "Both sides compute the same thing. The right side is one line, runs tens of times faster, and is easier to read once you are fluent.",
        },
        {
          kind: "heading",
          text: "What 'numerical computing' actually means",
        },
        {
          kind: "text",
          text: "**Numerical computing** is computing with *numbers arranged in grids*: measuring, transforming, summarizing and combining them. It is the craft behind every heat map, forecast, medical scan, and recommendation feed. Three examples you have met in daily life:",
        },
        {
          kind: "table",
          title: "Numerical computing in the wild",
          headers: ["Field", "What the numbers are", "A question the math answers"],
          rows: [
            ["Photo editing", "A grid of brightness values per pixel", "Can we sharpen this edge? Remove this noise?"],
            ["Finance", "Long columns of prices over time", "How risky is this portfolio? What is the trend?"],
            ["Machine learning", "Thousands of columns of features per row", "Which customers look like this one?"],
          ],
          caption:
            "In every case the data is the same shape of problem: many numbers, arranged regularly, that need the same treatment. That shape of problem is exactly what NumPy was built for.",
        },
        {
          kind: "heading",
          text: "Where NumPy sits: the foundation of the Python data world",
        },
        {
          kind: "text",
          text: "NumPy is not one tool among many — it is the **foundation layer**. pandas stores its tables as NumPy arrays under the hood. SciPy's algorithms are built on it. scikit-learn takes NumPy arrays as input and returns NumPy arrays as predictions. matplotlib plots them. PyTorch and TensorFlow copy NumPy's design on purpose (they even call their grids *tensors* and reuse the same broadcasting rules you will learn in Part G). Learn NumPy once and you have learned the shared vocabulary of the entire ecosystem.",
        },
        {
          kind: "visual",
          title: "The Python data stack stands on NumPy",
          ascii: `        pandas     SciPy   scikit-learn  matplotlib   PyTorch
            |          |          |            |           |
            +----------+----------+------------+-----------+
                                (they all pass NumPy arrays to each other)
                                             |
                                         +---------+
                                         |  NumPy  |   <-- you are here
                                         +---------+
                                             |
                       +---------------------+---------------------+
                       | fast packed grids of numbers + math on    |
                       | the whole grid at once, in compiled code   |
                       +--------------------------------------------+
`,
          caption:
            "Every layer above NumPy assumes its arrays. This is why 'learn NumPy properly' is the best first investment a data career can make.",
        },
        {
          kind: "heading",
          text: "Why it is fast, in one sentence",
        },
        {
          kind: "text",
          text: "A Python list is a bag of pointers to scattered objects; a NumPy array is **one solid block of same-type numbers** laid out exactly like the CPU likes, so a single compiled instruction stream can walk it — no Python interpreter tagging along, no type checks per element, no objects. You will see the evidence in the next lesson; here is a taste you can run right now:",
        },
        {
          kind: "code",
          title: "Your first NumPy moment (run it in the page below)",
          code: `import numpy as np

temperatures = np.array([21.0, 22.5, 19.0, 23.5, 20.0])
doubled = temperatures * 2          # ONE line, whole array, no loop

print("temperatures:", temperatures)
print("doubled     :", doubled)
print("average     :", temperatures.mean())
`,
          output: `temperatures: [21.  22.5 19.  23.5 20. ]
doubled     : [42. 45. 38. 47. 40.]
average     : 21.2`,
          outputNote: "Real output, produced by running this exact code with NumPy 2.0.2 on Python 3.12 — the same build the playground below uses.",
          explain: [
            "`import numpy as np` — the ecosystem-wide convention; every tutorial and codebase you will ever read uses exactly this alias.",
            "`temperatures * 2` — multiplication applied to **every element at once**. No loop, no append. This is called a *vectorized* operation (Part F makes it a full toolbox).",
            "`temperatures.mean()` — arrays know how to summarize themselves. Real statistics arrive in Part H; today it is proof that the array is a smart container, not a dumb list.",
          ],
        },
        {
          kind: "tryIt",
          title: "Run your first NumPy code",
          task: "The editor below runs real NumPy in your browser. Change the temperatures to numbers from your own week (add or remove values as you like) and press Run. Then try multiplying by 10 instead of 2.",
          code: `import numpy as np

temperatures = np.array([21.0, 22.5, 19.0, 23.5, 20.0])
print("temperatures:", temperatures)
print("doubled     :", temperatures * 2)
print("average     :", temperatures.mean())
`,
          hint: "Keep the numbers separated by commas inside the square brackets. NumPy handles as many or as few as you give it.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "NumPy = packed, typed number grids + math on the whole grid at once. Everything else in the course is exploring what that one idea makes possible.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "A 30-second history (worth knowing)",
          text: "NumPy was released in 2006 (as the merge of two older libraries, Numeric and numarray) by Travis Oliphant, to end the community's civil war over array libraries. Its `ndarray` design was so good that Python became the language of science — and every successor (PyTorch tensors, JAX arrays, CuPy) deliberately copies its interface. When you learn NumPy you are learning the *lingua franca* of array computing, not one library's quirks.",
        },
        {
          kind: "heading",
          text: "What NumPy is NOT (equally important)",
        },
        {
          kind: "steps",
          title: "Three honest boundaries",
          items: [
            "**Not a database** — NumPy holds numbers in memory, in one running program. Persistence (saving to disk) comes in Part J, and it is deliberately simple.",
            "**Not a spreadsheet UI** — no menus, no cells to click. The payoff is that every step is code you can rerun, version, and automate.",
            "**Not magic** — it is fast because of boring, brilliant engineering: packed memory, one data type per array, and compiled loops. You will learn to use all three deliberately, not accidentally.",
          ],
        },
      ],
      terms: [
        { term: "NumPy", definition: "The foundational Python library for numerical computing: packed, typed, N-dimensional grids of numbers plus fast whole-grid math." },
        { term: "Numerical computing", definition: "Computing over grids of numbers — measuring, transforming and summarizing them — as opposed to text processing or general-purpose scripting." },
        { term: "Vectorized operation", definition: "An operation applied to an entire array in one expression, executed by fast compiled code instead of a Python loop." },
        { term: "ndarray", definition: "NumPy's array type (N-dimensional array): a block of same-type numbers plus a description of its shape. The subject of Part A and the atom of the whole course." },
        { term: "Data stack", definition: "The layered ecosystem built on NumPy: pandas, SciPy, scikit-learn, matplotlib, PyTorch — all of which exchange NumPy arrays." },
      ],
      mistakes: [
        {
          mistake: "Believing NumPy is 'just a library of math functions' like math.",
          why: "The math module computes one value at a time with Python numbers. NumPy's power is the *container* — packed grids of one type — which makes whole-dataset math natural and fast.",
          fix: "Think of NumPy as a new way of holding numbers first, and a toolbox second. The container is the revolution; the functions are consequences.",
        },
        {
          mistake: "Postponing NumPy because 'I will learn it inside pandas later'.",
          why: "pandas makes sense precisely when you understand the arrays underneath. Without that, groupby, broadcasting and dtypes feel like arbitrary rituals.",
          fix: "Learn the ndarray now (this course, Parts A–D). pandas then becomes an easy week instead of a wall.",
        },
        {
          mistake: "Expecting NumPy to speed up any Python code.",
          why: "NumPy accelerates *whole-array math over packed numbers*. String processing, complex object graphs, and single-scalar arithmetic gain nothing (and object arrays can be slower).",
          fix: "Ask 'can I express this as operations on grids of numbers?' If yes, NumPy. If no, ordinary Python is fine.",
        },
      ],
      takeaways: [
        "NumPy holds numbers in packed, typed grids and does math on the whole grid at once — that one idea is the whole course.",
        "It is the foundation layer: pandas, SciPy, scikit-learn, matplotlib, PyTorch all speak NumPy arrays.",
        "It is fast for boring reasons: one solid block of same-type numbers, walked by compiled code — no Python loop, no per-element type checks.",
        "Numerical computing is grids of numbers needing the same treatment — spreadsheets, images, signals, and ML features are all the same shape of problem.",
      ],
      quiz: [
        {
          id: "a-01-q1",
          prompt: "Which sentence best describes what NumPy is?",
          options: [
            { text: "A library that stores numbers in packed, typed grids and does math on whole grids at once", correct: true, feedback: "Exactly — the container plus whole-grid operations is the entire idea." },
            { text: "A faster version of Python's math module, with more functions", correct: false, feedback: "Close but off: the math module computes one value at a time. NumPy's revolution is the array container, not a bigger function list." },
            { text: "A database for storing large datasets on disk", correct: false, feedback: "No — NumPy arrays live in memory. (Saving them is a small add-on covered in Part J.)" },
            { text: "A plotting library for scientific charts", correct: false, feedback: "That is matplotlib, which is built to plot NumPy arrays — one of many tools standing on NumPy." },
          ],
          explanation: "NumPy = the ndarray container (packed, typed, N-dimensional) plus vectorized math over it.",
        },
        {
          id: "a-01-q2",
          prompt: "Why do pandas, scikit-learn and PyTorch all 'speak NumPy'?",
          options: [
            { text: "They were all written by the NumPy team", correct: false, feedback: "They have separate authors and histories — the shared interface is a design decision, not shared ownership." },
            { text: "They all use NumPy arrays as their core data structure or copy its design on purpose", correct: true, feedback: "Right — pandas stores tables as NumPy arrays, scikit-learn takes and returns them, and PyTorch deliberately mirrors NumPy's API (and even its broadcasting rules)." },
            { text: "Python has no other way to store numbers", correct: false, feedback: "Python has lists — but they are scattered objects with per-element overhead, unusable for fast whole-grid math." },
            { text: "It is required by Python's license", correct: false, feedback: "No licensing forces this; the ecosystem converged on NumPy because the ndarray design is that good." },
          ],
          explanation: "The ndarray became the shared currency of the Python data world; learning it once pays off in every tool above it.",
        },
        {
          id: "a-01-q3",
          prompt: "The core reason a NumPy operation like `a * 2` beats a Python loop over a list is:",
          options: [
            { text: "NumPy uses multiple computers in the cloud", correct: false, feedback: "No — everything happens in one process on your machine (and in this course, inside your browser tab)." },
            { text: "The numbers are packed as one block of a single type, so compiled code can walk them without Python's per-object overhead", correct: true, feedback: "That is the whole secret: packed memory, one type, compiled loops. Lesson a-02 measures it." },
            { text: "Python loops are intentionally slowed down", correct: false, feedback: "Loops are not sabotaged; they are just honest interpreted work — object lookups, type checks — per element." },
            { text: "NumPy rounds the numbers off, making them easier to compute", correct: false, feedback: "NumPy never changes your numbers' precision silently — exactness is part of the contract (Part B covers dtypes)." },
          ],
          explanation: "Speed comes from layout + types + compiled code: one solid block, one type, one fast walk.",
        },
      ],
    },

    // ------------------------------------------------------------- a-02
    {
      slug: "a-02",
      title: "Python Lists vs NumPy Arrays: The Honest Comparison",
      minutes: 16,
      summary:
        "Lists are flexible bags of anything; arrays are strict blocks of one number type. See exactly what that trade buys you — speed you can measure, memory you can count, and math that reads like math.",
      kind: "concept",
      objectives: [
        "State the two structural differences between a list and an ndarray (scattered objects vs packed block; mixed types vs one dtype)",
        "Run and interpret a fair speed comparison between a list loop and a vectorized array operation",
        "Compute how much memory an array will use, by hand, from itemsize",
        "Decide correctly between a list and an array for a given task",
      ],
      why: "The single most common beginner stumble in numerical Python is treating NumPy arrays like slightly-faster lists — indexing with tuples, expecting mixed types, appending in a loop. The cure is to see the two containers side by side, honestly: what a list really is in memory, what an array really is, and what the strictness of arrays purchases. Once you have measured the speed gap yourself and counted the bytes yourself, you will never confuse the two again — and every later topic (broadcasting, views, vectorization) will slot into place, because all of them are consequences of this one design difference.",
      blocks: [
        {
          kind: "text",
          text: "Python lists are wonderful — and wonderfully general. A single list can hold an integer, a string, another list, and a function, because a list does not really *contain* its items: it contains **pointers to objects scattered around memory**, each carrying its own type tag and reference count. That flexibility is exactly what makes lists slow for math: to add two 'lists of numbers', Python must chase every pointer, check every type, and allocate a new result object — per element.",
        },
        {
          kind: "heading",
          text: "What each one really is, in memory",
        },
        {
          kind: "visual",
          title: "The same five numbers, stored two ways",
          ascii: `  Python list  [1, 2, 3, 4, 5]          NumPy array  array([1, 2, 3, 4, 5])

  list object                              array object
  +---------------+                        +-----------------------------+
  | ptr | ptr | ...|                        | data block: 1 2 3 4 5      |
  +---+---+---+---+                        | (one solid run of int64)   |
      |   |   |                            +-----------------------------+
      v   v   v                              + shape (5,)   + dtype int64
  +------+ +------+ +------+                 + strides ...  (a tiny header)
  | int 1| | int 2| | int 3| ...             the numbers live shoulder
  | tag  | | tag  | | tag  |                 to shoulder, same size,
  | refs | | refs | | refs |                 ready for compiled code
  +------+ +------+ +------+
  each number is a full object,        one block, one type, zero
  somewhere else in memory             per-element bookkeeping
`,
          caption:
            "This one picture explains the entire course: the array's header (shape, dtype, strides) is a few dozen bytes; the data block is as compact as C. Everything NumPy does is ways of exploiting this layout.",
        },
        {
          kind: "heading",
          text: "Difference 1: one type per array",
        },
        {
          kind: "code",
          title: "Lists mix freely; arrays commit to one dtype",
          code: `# A list can mix anything -- sometimes that is exactly what you need
mixed = [42, "hello", 3.14, [1, 2, 3]]
print("list :", mixed)

import numpy as np

# An array must commit to ONE type for all its elements
same = np.array([42, 3.14, 2])
print("array:", same, "dtype:", same.dtype)
`,
          output: `list : [42, 'hello', 3.14, [1, 2, 3]]
array: [42.    3.14  2.  ] dtype: float64`,
          outputNote: "Notice the array converted everything to one type: 42 and 2 became floats. NumPy picked the one dtype that could hold all the values.",
          explain: [
            "The list keeps every element exactly as inserted — an int stays an int, a string stays a string.",
            "The array **promoted** the integers to floats so the whole block fits one type. It never silently mixes: one array, one dtype (the full dtype system arrives in Part B).",
            "This is the trade: lists are flexible containers of *things*; arrays are efficient containers of *numbers*.",
          ],
        },
        {
          kind: "heading",
          text: "Difference 2: math means 'on every element'",
        },
        {
          kind: "code",
          title: "The + operator, in two worlds",
          code: `list_a = [1, 2, 3]
list_b = [10, 20, 30]
print("lists + :", list_a + list_b)      # concatenation!

import numpy as np

arr_a = np.array([1, 2, 3])
arr_b = np.array([10, 20, 30])
print("arrays +:", arr_a + arr_b)        # element-wise addition

print("lists * 3 :", list_a * 3)          # repetition!
print("arrays * 3:", arr_a * 3)           # element-wise multiplication
`,
          output: `lists + : [1, 2, 3, 10, 20, 30]
arrays +: [11 22 33]
lists * 3 : [1, 2, 3, 1, 2, 3, 1, 2, 3]
arrays * 3: [3 6 9]`,
          outputNote: "Same operators, two very different meanings. On lists, + and * are sequence operations; on arrays they are math.",
          explain: [
            "`[1, 2, 3] + [10, 20, 30]` **glues** the lists (length 6). If you wanted pairwise sums, you would need a loop — and that loop is the slow path.",
            "`array + array` adds **pairwise** (element by element) — this is the default behavior you actually want in data work.",
            "`list * 3` repeats the list; `array * 3` multiplies every element. The array semantics are the ones that scale to a million rows.",
          ],
        },
        {
          kind: "heading",
          text: "The speed gap, measured honestly",
        },
        {
          kind: "text",
          text: "Let us race them: one million numbers, each doubled. The list version is an honest Python loop with append; the array version is one vectorized expression. Because raw milliseconds differ from machine to machine, the verified version below prints stable facts instead of timings — then the playground lets you print your own raw numbers:",
        },
        {
          kind: "code",
          title: "One million doubles: loop vs one expression",
          code: `import numpy as np
import time

n = 1_000_000
big_list = list(range(n))
big_array = np.arange(n)

def best_of(task, reps=3):
    """Real benchmarkers never trust one measurement: keep the fastest."""
    times = []
    for _ in range(reps):
        start = time.perf_counter()
        result = task()
        times.append(time.perf_counter() - start)
    return min(times), result

def list_way():
    out = []
    for x in big_list:
        out.append(x * 2)
    return out

def array_way():
    return big_array * 2

list_seconds, doubled = best_of(list_way)
array_seconds, doubled2 = best_of(array_way)

print("both give the same answers:", doubled == list(doubled2))
print("array was at least 5x faster here:", array_seconds * 5 < list_seconds)
print("elements raced:", f"{n:,}")
`,
          output: `both give the same answers: True
array was at least 5x faster here: True
elements raced: 1,000,000`,
          outputNote:
            "Both facts are stable: the two methods agree, and at a million elements the array wins by far more than the conservative 5x threshold (best-of-3 timing removes one-off noise). Print your own raw milliseconds with the playground below.",
          explain: [
            "`best_of` takes the fastest of three runs — the professional habit. The first call of any code pays warm-up costs; the minimum is the honest 'how fast can this go' number.",
            "The loop version pays Python's full price per element: fetch the object, check the type, multiply, allocate a new int object, append a pointer.",
            "The array version hands the whole block to compiled code: one pass, no objects, no per-element decisions.",
            "`doubled == list(doubled2)` checks the *answers* agree — a benchmark without a correctness check is a rumor.",
            "The 5x threshold is deliberately conservative: at one million elements the honest ratio is usually tens to over a hundred. On tiny arrays (try n = 10 in the playground) the loop can even win — NumPy's per-call overhead dominates when data is small.",
          ],
        },
        {
          kind: "tryIt",
          title: "Run the race yourself",
          task: "Press Run to run the race on your machine (the first run also downloads NumPy into your browser, about 16 MB, cached afterwards). Then try n = 5_000_000 and watch both sides grow — which one grows more slowly?",
          code: `import numpy as np
import time

n = 1_000_000
big_list = list(range(n))
big_array = np.arange(n)

start = time.perf_counter()
doubled = []
for x in big_list:
    doubled.append(x * 2)
list_seconds = time.perf_counter() - start

start = time.perf_counter()
doubled2 = big_array * 2
array_seconds = time.perf_counter() - start

print(f"list loop : {list_seconds * 1000:7.1f} ms")
print(f"array * 2 : {array_seconds * 1000:7.1f} ms")
print(f"same results: {doubled == list(doubled2)}")
`,
          hint: "On tiny arrays (say n = 10) the loop can even win — NumPy's per-call overhead dominates when data is small. The gap opens as n grows.",
        },
        {
          kind: "heading",
          text: "Memory you can count by hand",
        },
        {
          kind: "text",
          text: "Because every element of an array is the same fixed size, you can compute an array's memory use with primary-school arithmetic: **elements x bytes-per-element**. The bytes per element is the array's `itemsize`, and NumPy tells you the total with `nbytes`:",
        },
        {
          kind: "code",
          title: "Counting bytes: 1,000,000 numbers",
          code: `import numpy as np

n = 1_000_000
int64_array = np.arange(n)             # 64-bit integers by default
int16_array = np.arange(n, dtype=np.int16)   # 16-bit integers, chosen on purpose

print("int64: itemsize", int64_array.itemsize, "bytes ->", int64_array.nbytes / 1e6, "MB")
print("int16: itemsize", int16_array.itemsize, "bytes ->", int16_array.nbytes / 1e6, "MB")
`,
          output: `int64: itemsize 8 bytes -> 8.0 MB
int16: itemsize 2 bytes -> 2.0 MB`,
          outputNote: "One million 64-bit integers = 8 MB; choosing 16-bit drops it to 2 MB. Choosing dtypes deliberately is a Part B skill — today, see that the math is simple.",
          explain: [
            "`itemsize` is how many bytes ONE element takes (8 for int64, 2 for int16).",
            "`nbytes` is the whole data block: 1,000,000 x 8 = 8,000,000 bytes for int64.",
            "A Python list of a million ints would use *tens* of MB — every entry is a full object plus a pointer — and it cannot tell you its own size, because it does not have one fixed type.",
          ],
        },
        {
          kind: "heading",
          text: "So which one should you use?",
        },
        {
          kind: "table",
          title: "The decision, in four rows",
          headers: ["Your data is...", "Use", "Because"],
          rows: [
            ["Numbers in a grid (measurements, pixels, features), all one type, and you will do math", "NumPy array", "Speed, memory, and whole-grid operations (the entire rest of this course)"],
            ["A handful of values, or mixed types, or growing/shrinking as you go", "Python list", "Lists are cheaper to build bit-by-bit and hold anything; math is not their job"],
            ["Rows of mixed columns (numbers + text + dates) like a table", "pandas (built on NumPy)", "That is literally what pandas is: NumPy columns with labels — Part J shows the bridge"],
            ["Deep-learning tensors needing GPU", "PyTorch / JAX", "Same ideas (dtypes, broadcasting), different hardware — your NumPy skills transfer directly"],
          ],
          caption: "Rule of thumb: reach for an array the moment the words 'all of these numbers' meet the words 'each' or 'every'.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The phrase that unlocks the whole course",
          text: "Learn to hear your own problem as a sentence like *'double every price'*, *'compare each score to the average'* or *'combine each row with the weights'*. Every such sentence is ONE NumPy expression. Converting loop-thinking into whole-grid-thinking is what Part F calls vectorization — and it is the single highest-leverage habit in numerical Python.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One trap to flag early: arrays are not lists, so append() is not the tool",
          text: "Lists grow one append at a time; arrays are fixed-size blocks by design. Growing an array with np.append in a loop rebuilds the block every time — O(n squared) pain that silently ruins 'fast' code. The NumPy way is to build a list (or a generator) of results and convert once, or better: precompute the whole array. This returns as a performance rule in Part J.",
        },
      ],
      terms: [
        { term: "Packed (contiguous) memory", definition: "Numbers stored shoulder-to-shoulder in one solid block, so compiled code can walk them without chasing pointers." },
        { term: "dtype", definition: "The single data type an array commits to for ALL its elements (int64, float64, ...). One array, one dtype — the source of both speed and discipline." },
        { term: "itemsize", definition: "How many bytes one element of an array occupies — 8 for int64/float64, 4 for int32/float32, and so on." },
        { term: "nbytes", definition: "The size of the whole data block in bytes: size x itemsize. You can compute it before building the array." },
        { term: "Element-wise (vectorized) operation", definition: "An operator or function applied pairwise across arrays — a + b adds every matching pair in one compiled pass." },
      ],
      mistakes: [
        {
          mistake: "Expecting [1, 2] + [10, 20] to add the numbers.",
          why: "On lists, + is concatenation — sequence glue, not math. Beginners get length-4 results and think NumPy is 'buggy'.",
          fix: "Convert to arrays first: np.array([1, 2]) + np.array([10, 20]) is [11, 22]. On arrays, + IS math.",
        },
        {
          mistake: "Putting mixed types in an array and expecting them preserved.",
          why: "An array has one dtype for its whole block; NumPy promotes or coerces (ints become floats; with strings everything becomes text) — the mixed original types are gone.",
          fix: "Mixed data belongs in a list, a dict, or pandas. If you need one numeric type for math, convert explicitly with np.array(data, dtype=...).",
        },
        {
          mistake: "Growing an array with np.append inside a loop.",
          why: "Each append copies the entire block into a new one — a thousand appends on a million elements is a thousand rebuilds, silently quadratic.",
          fix: "Build with a list comprehension and convert once: np.array([f(x) for x in data]), or better, compute the whole result with one vectorized expression.",
        },
        {
          mistake: "Benchmarking with tiny arrays and concluding 'NumPy is slower'.",
          why: "Every NumPy call has fixed overhead (dispatch, checks). On 10 elements the loop can win; on a million it loses by 100x.",
          fix: "Benchmark at realistic sizes and check correctness, not just speed. The project at the end of this part builds exactly that habit.",
        },
      ],
      takeaways: [
        "A list is a bag of pointers to scattered objects; an array is one solid block of one number type plus a small header (shape, dtype, strides).",
        "On lists, + and * are sequence operations (glue, repeat). On arrays, they are element-wise math. Same symbols, different worlds.",
        "Memory arithmetic is easy on arrays: elements x itemsize = nbytes — no object overhead.",
        "Use lists for flexible collections of things; arrays for grids of numbers you will do math on; pandas for mixed-column tables.",
        "Hearing 'every number' in your problem statement is the signal to stop looping and write one array expression.",
      ],
      quiz: [
        {
          id: "a-02-q1",
          prompt: "What does `[1, 2, 3] * 3` evaluate to, and what would the array equivalent mean instead?",
          options: [
            { text: "[3, 6, 9] in both worlds", correct: false, feedback: "That is the array meaning. The list meaning is different — reread the operator table." },
            { text: "[1, 2, 3, 1, 2, 3, 1, 2, 3] for the list; [3, 6, 9] for np.array([1, 2, 3]) * 3", correct: true, feedback: "Right: on lists * repeats the sequence; on arrays it multiplies every element." },
            { text: "An error: you cannot multiply sequences", correct: false, feedback: "You can — Python defines * on sequences as repetition. It just is not math." },
            { text: "[1, 2, 3] unchanged; arrays also unchanged", correct: false, feedback: "Neither is unchanged — both operators do something; they just do different things." },
          ],
          explanation: "Sequence operators (glue/repeat) vs element-wise math is the first practical difference between the two containers.",
        },
        {
          id: "a-02-q2",
          prompt: "An array of 500,000 float32 values will use how much memory for its data block?",
          options: [
            { text: "About 2 MB (500,000 x 4 bytes)", correct: true, feedback: "Correct — float32 has itemsize 4, and 500,000 x 4 = 2,000,000 bytes." },
            { text: "About 4 MB (500,000 x 8 bytes)", correct: false, feedback: "That would be float64 (itemsize 8). float32 is half that." },
            { text: "Impossible to know without running it", correct: false, feedback: "That is the list's problem — arrays can be counted by hand: size x itemsize." },
            { text: "Zero: arrays are compressed automatically", correct: false, feedback: "No compression — packed plain numbers, which is exactly why the math is predictable." },
          ],
          explanation: "nbytes = size x itemsize. float32 -> 4 bytes each -> 500,000 x 4 = 2 MB.",
        },
        {
          id: "a-02-q3",
          prompt: "Your data is 50,000 sensor readings and you need 'each reading minus its calibration offset'. The idiomatic NumPy shape of the solution is:",
          options: [
            { text: "A for-loop with append, run on a Python list for safety", correct: false, feedback: "That works but is the slow path — and it fights the tool built for exactly this sentence." },
            { text: "One expression: readings - offset, with readings an array", correct: true, feedback: "'Each minus one value' is one vectorized expression. (How one number meets a whole array is Part G's broadcasting — you just used it.)" },
            { text: "A while-loop over the array indexes", correct: false, feedback: "Index-walking an array reintroduces every cost the array was built to remove." },
            { text: "Convert to a spreadsheet and fill down", correct: false, feedback: "Fill-down IS the right idea — that is what readings - offset does, in one reproducible line of code." },
          ],
          explanation: "'Every element, same treatment' = one array expression. That reframe is the course's core habit.",
        },
      ],
    },

    // ------------------------------------------------------------- a-03
    {
      slug: "a-03",
      title: "Installing NumPy and Building Your First Arrays",
      minutes: 13,
      summary:
        "Get NumPy onto your machine (or skip installing entirely and use the in-browser playground), learn the import convention everyone uses, and build arrays with np.array — plus the first complete function reference card of the course.",
      kind: "setup",
      objectives: [
        "Install NumPy with pip (or conda), and verify the installation from Python",
        "Use the universal `import numpy as np` convention and know why the whole ecosystem follows it",
        "Build arrays from Python lists and nested lists with np.array, choosing the dtype deliberately",
        "Read a complete NumPy function reference card (purpose, syntax, parameters, returns, example, mistakes, related functions, applications)",
      ],
      why: "Installation is the first place learners quit: permission errors, wrong interpreter, a Python 2 that should not exist anymore. This lesson walks the two-minute happy path (pip install numpy), shows the check that proves it worked, and then gets you writing array code immediately — either on your machine or in the zero-install playground built into this page. Along the way you meet np.array, the front door of the whole library, and the course's reference-card format: every function you learn from here on arrives with its purpose, syntax, parameters, return value, verified example, common mistakes, related functions and real applications.",
      blocks: [
        {
          kind: "text",
          text: "Two honest ways to follow this course: **install NumPy on your own machine** (five minutes, once — the real-world setup), or **use the NumPy playground built into every page of this course** (zero setup — real NumPy 2 running in your browser via WebAssembly). This lesson covers both, then teaches the front-door function: `np.array`.",
        },
        {
          kind: "heading",
          text: "Path 1: install on your machine",
        },
        {
          kind: "steps",
          title: "The two-minute happy path",
          items: [
            "**Open a terminal** — the same place you run `python` (Command Prompt or PowerShell on Windows, Terminal on macOS, any shell on Linux).",
            "**Install for your user**: `python -m pip install numpy` (use `python3 -m pip install numpy` on macOS/Linux if `python` is absent). The `-m pip` form guarantees the pip belongs to the python you will actually run.",
            "**Prove it worked** from a terminal — see the check below. If this prints a version like `2.x.y`, you are done: every example in this course will run on your machine.",
            "(Optional, later) **The data-science bundle**: if you already know you want pandas and matplotlib too, `python -m pip install numpy pandas matplotlib` or a conda environment `conda install numpy` does it in one step.",
          ],
        },
        {
          kind: "code",
          title: "The installation check, two ways",
          code: `# From your terminal -- either of these proves NumPy is importable:
#   python -c "import numpy; print(numpy.__version__)"
#   python --version && python -m pip show numpy | head -2
`,
          lang: "text",
          outputNote: "",
          explain: [],
        },
        {
          kind: "code",
          title: "And from inside Python (anywhere)",
          code: `import numpy as np

print(np.__version__)
`,
          output: `2.0.2`,
          outputNote:
            "This is the same check the browser playground runs — any 2.x version is fine for this course. The printed version here (2.0.2) is the exact build every output in this course was verified against.",
          explain: [
            "`np.__version__` — the double underscore version attribute is a Python convention for library versions.",
            "If this line prints anything starting with 2, every lesson of this course works on your machine as written.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "If the install goes wrong (it sometimes does)",
          text: "The three classics: (1) `pip` installs into a different Python than the one you run — fix: always `python -m pip install ...` with the SAME `python`. (2) `ModuleNotFoundError: No module named 'numpy'` in an IDE — the IDE is pointing at another interpreter; pick the right one in its settings. (3) Old Python — NumPy 2 needs Python 3.9+; upgrade Python. None of these are NumPy problems; all are interpreter-routing problems.",
        },
        {
          kind: "heading",
          text: "Path 2: the zero-install playground",
        },
        {
          kind: "text",
          text: "Every 'Try it yourself' block in this course is a **real NumPy interpreter** running locally in your browser tab (CPython 3.12 + NumPy 2, compiled to WebAssembly — nothing is uploaded, nothing is installed). The first press of Run downloads the engine once (about 16 MB, then cached by your browser). You also have a full-size playground under **NumPy playground** in the top navigation. Everything this course verifies on its build server matches that same NumPy version — what you see is what you run.",
        },
        {
          kind: "heading",
          text: "The import convention (and why everyone obeys it)",
        },
        {
          kind: "code",
          title: "One line you will type ten thousand times",
          code: `import numpy as np

# The whole ecosystem -- tutorials, pandas docs, scikit-learn examples,
# Stack Overflow answers, your future colleagues -- uses exactly this alias.
a = np.array([1, 2, 3])
print(a)
`,
          output: `[1 2 3]`,
          outputNote: "From here on, every code block in the course assumes this import has been made.",
          explain: [
            "The alias `np` is not required — but it is universal. Fighting it means every snippet you copy will need editing.",
            "Notice the array prints with `array(...)` and **no commas** between items: `[1 2 3]`. That is NumPy's repr, quietly telling you 'this is not a list'.",
          ],
        },
        {
          kind: "heading",
          text: "The front door: np.array",
        },
        {
          kind: "text",
          text: "Every journey into NumPy starts by **converting something you already have** — a list, a tuple, a range — into an array. That is `np.array`'s whole job, and it is the first function to earn a complete reference card. Read it like documentation, because it is: every card in this course is machine-verified against the exact same NumPy build running in your playground.",
        },
        {
          kind: "functionDoc",
          name: "np.array",
          purpose: "Turn something you already have (a list, tuple, nested sequence, or another array) into a proper NumPy array, choosing its dtype.",
          signature: "np.array(object, dtype=None, *, copy=True, order=\"K\", subok=False, ndmin=0)",
          purposeDetail:
            "`np.array` is the constructor you reach for when the data already exists in Python form. It inspects what you gave it, picks one dtype that fits every element (or the one you demand), and copies the values into a fresh packed block. It is the bridge from Python-land into array-land. For blank slates (zeros, ones, ranges) the part B creation functions are better tools; `np.array` is for *material you already have*.",
          params: [
            {
              name: "object",
              type: "array_like",
              required: true,
              description: "The data to convert: a list, tuple, nested lists (one nesting level per dimension), an iterator, a scalar, or another array.",
              example: "[1, 2, 3] or [[1, 2], [3, 4]]",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Force the array's element type. When omitted, NumPy infers the single type that fits ALL elements (ints stay ints; mixing int + float promotes everything to float64).",
              example: "dtype=np.float64",
            },
            {
              name: "copy",
              type: "bool",
              description: "When True (default) the data is copied into a new block you fully own. Copying from an existing array without copy is possible but has sharp edges (views, Part D).",
              example: "copy=True",
            },
            {
              name: "ndmin",
              type: "int",
              description: "Guarantee a minimum number of dimensions, prepending length-1 axes as needed. Rare, but handy to make a bare vector unambiguously 2-D.",
              example: "ndmin=2",
            },
            {
              name: "order",
              type: "\"K\", \"A\", \"C\", or \"F\"",
              description: "Memory layout for the copy: row-major (C) or column-major (F) — advanced; the default \"K\" keeps the source's layout. Part J returns to this.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array holding the converted values, with one dtype for the whole block and a shape that mirrors the nesting of the input.",
          },
          example: `import numpy as np

# 1-D from a list, dtype inferred (all ints -> int64)
prices = np.array([19, 23, 21, 25])
print(prices, prices.dtype)

# Force the dtype deliberately (euros need decimals)
prices_f = np.array([19, 23, 21, 25], dtype=np.float64)
print(prices_f, prices_f.dtype)

# 2-D from nested lists: outer list = rows, inner lists = columns
grid = np.array([[1, 2, 3],
                 [4, 5, 6]])
print(grid, grid.shape)
`,
          exampleOutput: `[19 23 21 25] int64
[19. 23. 21. 25.] float64
[[1 2 3]
 [4 5 6]] (2, 3)`,
          commonMistakes: [
            {
              mistake: "Passing ragged nested lists (rows of different lengths).",
              why: "An array's grid must be rectangular. NumPy 2 refuses to guess and raises ValueError. (Older NumPy versions silently created a 1-D object array of lists — worse.)",
              fix: "Make every row the same length, or store ragged data in a list / pandas DataFrame instead.",
            },
            {
              mistake: "Mixing ints and floats and being surprised everything became float64.",
              why: "One array, one dtype: the only type that holds both 3 and 3.5 losslessly is float64, so NumPy promotes the ints.",
              fix: "That promotion is usually right. When it is not, say what you want: np.array(data, dtype=np.int64) — accepting that 3.5 would be truncated.",
            },
            {
              mistake: "Using np.array inside a loop to grow data (or expecting .append to exist).",
              why: "np.array always builds a fresh array from scratch; arrays are fixed-size blocks with no append method.",
              fix: "Build the full list (or generator) first, convert ONCE at the end.",
            },
          ],
          related: [
            { name: "np.asarray", relation: "Same conversion, but avoids a copy when the input is already a matching array — use it inside functions you call repeatedly." },
            { name: "np.zeros / np.ones / np.full", relation: "Create new blocks by SHAPE instead of from existing data (Part B)." },
            { name: "np.arange / np.linspace", relation: "Create ranges of numbers directly, without building a Python list first (Part B)." },
            { name: "np.array.tolist", relation: "The trip home: array -> plain nested Python lists (used when handing data back to non-NumPy code)." },
          ],
          applications: [
            "Converting loaded data (a CSV column parsed as a list) into an array for vectorized math",
            "Small constant tables you write by hand (a 3x3 camera matrix, a 7-day schedule) — readable as nested lists, fast as arrays",
            "Test fixtures: quick hand-written arrays to verify a formula before feeding it real data",
          ],
          notes:
            "np.array is for data that already exists. Part B introduces the 'build from a description' family (zeros, ones, arange, linspace) which is both shorter and faster for generated data.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why your playground might say int32",
          text: "NumPy's DEFAULT integer dtype follows the platform's native integer width: a 64-bit native install gives **int64** (8 bytes per element — what this course's verified outputs show), while the browser playground (NumPy compiled to WebAssembly, a 32-bit platform) gives **int32** (4 bytes). Neither is wrong — and on both platforms `np.zeros(3)` is still float64, because the default FLOAT is 64-bit everywhere. The professional habit that removes the surprise: pin the dtype explicitly (`np.array(data, dtype=np.int64)` or `dtype=np.float32`) whenever your code reads a dtype, an itemsize, a nbytes or a strides value — exactly what this course's auto-checked exercises do.",
        },
        {
          kind: "code",
          title: "Three shapes from three nests",
          code: `import numpy as np

flat = np.array([1, 2, 3, 4])            # one list      -> 1-D, shape (4,)
table = np.array([[1, 2], [3, 4], [5, 6]])  # list of rows -> 2-D, shape (3, 2)
cube = np.array([[[1], [2]], [[3], [4]]])   # three levels  -> 3-D, shape (2, 2, 1)

for a in (flat, table, cube):
    print("shape", a.shape, "ndim", a.ndim)
`,
          output: `shape (4,) ndim 1
shape (3, 2) ndim 2
shape (2, 2, 1) ndim 3`,
          outputNote: "The nesting depth of the input becomes the array's number of dimensions. One list per row, rows per table, tables per cube.",
          explain: [
            "`[1, 2, 3, 4]` — one level of nesting gives one axis: a 1-D vector of shape (4,).",
            "`[[1, 2], [3, 4], [5, 6]]` — a list of 3 equal rows gives a 3x2 grid.",
            "Shape is a tuple: (rows, cols) for 2-D. Reading shapes fluently is Lesson a-05's job — and the interactive grid in the next lesson makes it visual.",
          ],
        },
        {
          kind: "tryIt",
          title: "Build your own arrays",
          task: "Press Run, then experiment: (1) add a third row to `table`; (2) change the dtype of `flat` to np.float32 and watch the repr; (3) try building an array from a tuple like (9, 8, 7) — tuples convert too.",
          code: `import numpy as np

flat = np.array([1, 2, 3, 4])
table = np.array([[1, 2],
                  [3, 4],
                  [5, 6]])

print("flat :", flat, flat.shape)
print("table:", table, table.shape)
print("from tuple:", np.array((9, 8, 7)))
`,
          hint: "A ragged row (different length) is the one mistake NumPy 2 will refuse loudly — try it on purpose once so you recognize the error.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Install once with `python -m pip install numpy` (or never install and use the playground), always `import numpy as np`, and walk through the front door: `np.array(your_list)`.",
        },
      ],
      terms: [
        { term: "pip / -m pip", definition: "Python's installer. Calling it as `python -m pip` guarantees the packages land in the interpreter you actually run." },
        { term: "import alias", definition: "`import numpy as np` binds the library to the two-letter name the entire ecosystem uses by convention." },
        { term: "array_like", definition: "NumPy-speak for 'anything np.array can convert': lists, tuples, nested sequences, scalars, other arrays." },
        { term: "Dtype inference / promotion", definition: "NumPy choosing the single element type for a new array — the narrowest type that holds every element you supplied." },
        { term: "Ragged input", definition: "Nested lists whose rows differ in length. Not convertible to a rectangular array; NumPy 2 raises ValueError." },
      ],
      mistakes: [
        {
          mistake: "Running `pip install numpy` directly (not `python -m pip install numpy`).",
          why: "The bare `pip` command can belong to a different Python installation — the classic 'it installed but won't import' mystery.",
          fix: "Always route through the interpreter: `python -m pip install numpy`. The interpreter, its pip, and your code all agree by construction.",
        },
        {
          mistake: "Testing the install with `import numpy` in a fresh terminal but coding in an IDE with a different interpreter.",
          why: "IDEs pick their own environments (venvs, conda envs, system Python). Your install may be in interpreter A while the IDE runs interpreter B.",
          fix: "In the IDE's interpreter/settings panel, select the same environment where NumPy was installed — or install again from inside the IDE's terminal.",
        },
        {
          mistake: "Writing `import numpy` without the alias, or inventing a different alias like `import numpy as nmp`.",
          why: "It works, but every snippet, docs page, and colleague in the NumPy world assumes `np`.",
          fix: "Type the four extra characters: `import numpy as np`. Your future copy-pastes will thank you.",
        },
      ],
      takeaways: [
        "`python -m pip install numpy` installs into the interpreter you run; `np.__version__` proves it (any 2.x fits this course).",
        "No installation is needed to follow along — every playground in this course runs real NumPy 2 in your browser.",
        "`import numpy as np` is a law of nature: obey it and every snippet on earth works verbatim.",
        "`np.array(list)` converts existing data; nesting depth becomes dimensions; one dtype fits all elements (or the one you force).",
        "Ragged rows are refused loudly — the grid must be rectangular. Real mixed-shape data belongs in lists or pandas.",
      ],
      quiz: [
        {
          id: "a-03-q1",
          prompt: "The safest way to install NumPy from your terminal is:",
          options: [
            { text: "pip install numpy", correct: false, feedback: "Works when the pip on PATH matches your python — but that is exactly the assumption that breaks." },
            { text: "python -m pip install numpy", correct: true, feedback: "Correct — `-m pip` uses the pip belonging to THAT python, so the package lands where your code runs." },
            { text: "import numpy then click install", correct: false, feedback: "Importing does not install anything; you get ModuleNotFoundError if it is missing." },
            { text: "Copy numpy.py next to your script", correct: false, feedback: "NumPy is a compiled extension package, not a file you copy. The installer exists for a reason." },
          ],
          explanation: "python -m pip ties the install to the interpreter you run — the one-line fix for the most common installation failure.",
        },
        {
          id: "a-03-q2",
          prompt: "`np.array([[1, 2, 3], [4, 5]])` raises an error. Why?",
          options: [
            { text: "Nested lists are not allowed at all", correct: false, feedback: "Nested lists are exactly HOW you make 2-D arrays — when they are rectangular." },
            { text: "The rows have different lengths, and an array's grid must be rectangular", correct: true, feedback: "Right: shape (2, 3) and shape (2, 1) cannot share one block, so NumPy 2 refuses with ValueError." },
            { text: "The numbers are too small", correct: false, feedback: "Size is irrelevant — raggedness is the crime." },
            { text: "You must pass dtype for nested input", correct: false, feedback: "dtype is optional for any input; it changes the element type, not the geometry rules." },
          ],
          explanation: "Arrays are rectangular grids. Ragged sequences stay in lists (or pandas, which handles per-column shapes).",
        },
        {
          id: "a-03-q3",
          prompt: "`np.array([1, 2, 3.5])` produces which dtype?",
          options: [
            { text: "int64 — the first two elements win", correct: false, feedback: "Nothing about 'first' matters; the type must hold EVERY element." },
            { text: "float64 — the one type that holds 1, 2 and 3.5 exactly", correct: true, feedback: "Correct: one dtype per array, so the ints are promoted to float64." },
            { text: "object — a mixed bag like a list", correct: false, feedback: "NumPy can make object arrays, but never silently as a promotion fallback — this input becomes float64." },
            { text: "An error — types may not be mixed", correct: false, feedback: "Mixing numbers is fine: NumPy promotes to the common type. Strings + numbers is where surprises start." },
          ],
          explanation: "Promotion picks the narrowest single type that holds all elements: int + float -> float64.",
        },
      ],
    },

    // ------------------------------------------------------------- a-04
    {
      slug: "a-04",
      title: "The ndarray: Anatomy of NumPy's Container",
      minutes: 16,
      summary:
        "Open up an array and meet its three organs — a solid data block, one dtype, and a small header of shape + strides — then click around a living 2-D array until rows, columns, indexes and shape feel like home.",
      kind: "concept",
      objectives: [
        "Name the three parts of every ndarray: the data buffer, the dtype, and the metadata (shape, strides)",
        "Read and write [row, col] indexes, including from the end with negative indexes",
        "Explain what strides are and why the same data block can be viewed as different shapes",
        "Use the interactive array explorer: click elements, watch row/column highlighting, and read the shape panel",
      ],
      why: "Everything that follows — slicing, reshaping, views, broadcasting — is only surprising if an array remains a black box. But an ndarray is a radically simple machine: one solid block of numbers, one dtype, and a tiny header describing how to walk that block as a grid. When you see that a 2-D array is just a 1-D block plus a rule for stepping, four mysteries dissolve at once: why shape is a tuple, why indexing is [row, col], why reshaping is free, and why some operations share memory. This lesson makes that anatomy clickable, literally.",
      blocks: [
        {
          kind: "text",
          text: "Meet the **ndarray** (N-dimensional array) — the type behind every `np.` result. Strip away the conveniences and every array is exactly three things: a **data buffer** (one solid block of raw numbers), a **dtype** (what those raw bytes mean), and a **header** (shape and strides: how to walk the block as a grid). That is the whole animal.",
        },
        {
          kind: "visual",
          title: "The ndarray, dissected",
          ascii: `  a = np.array([[10, 11, 12, 13],
                 [20, 21, 22, 23],
                 [30, 31, 32, 33]])

  header (a few dozen bytes)             data buffer (one solid block)
  +---------------------------+          +----------------------------+
  | shape    = (3, 4)         |   means  | 10 11 12 13 20 21 22 23   |
  | dtype    = int64          |   how to | 30 31 32 33               |
  | strides  = (32, 8) bytes  |   walk   +----------------------------+
  +---------------------------+          12 numbers, shoulder to shoulder,
                                         no commas, no objects, no gaps
  the GRID you see is the block
  walked 4-at-a-time (a row),
  4 steps per row (strides!)
`,
          caption:
            "The grid is a viewpoint, not a place: rows and columns live in the header's walking rule, while the numbers live in one flat run. This is why reshaping is nearly free — you change the walking rule, not the data.",
        },
        {
          kind: "heading",
          text: "Axes: the dimensions, numbered",
        },
        {
          kind: "text",
          text: "Each dimension of an array is an **axis**, numbered from zero. For a 2-D array: **axis 0 runs down the rows**, **axis 1 runs across the columns**. (A 1-D array has only axis 0; a 3-D array adds axis 2 for its 'layers'.) Shape entries and axes pair up exactly: shape (3, 4) means 3 positions along axis 0 and 4 along axis 1.",
        },
        {
          kind: "arrayViz",
          title: "The array explorer — click anything",
          mode: "explore",
          name: "sales",
          caption:
            "A real 3x4 sales grid. Click cells: the inspector shows the [row, col] index, the flat position in the data block, the whole row and column, and the array's shape/ndim/size. Try 'Show flat indexes' to see the block underneath the grid, and notice the row you picked is tinted (axis 0), the column too (axis 1).",
          data: [
            [120, 135, 150, 165],
            [210, 190, 205, 230],
            [300, 310, 295, 320],
          ],
          labels: {
            rows: ["Q1", "Q2", "Q3"],
            cols: ["Jan", "Feb", "Mar", "Apr"],
          },
          dtype: "int64",
        },
        {
          kind: "heading",
          text: "Indexing: one number per axis",
        },
        {
          kind: "text",
          text: "To fetch one element you give **one index per axis**, in axis order: `a[row, col]`. That is why 2-D indexing uses ONE bracket with a comma — `a[1, 2]` — not chained brackets. Negative indexes count from the end of their axis (last row is -1, the one before is -2), on any axis.",
        },
        {
          kind: "code",
          title: "Reading single elements (and the flat truth underneath)",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[1, 2]  =", a[1, 2])     # row 1, column 2
print("a[0, 0]  =", a[0, 0])     # first element
print("a[-1, -1] =", a[-1, -1])  # last row, last column
print("a[2, 0]  =", a[2, 0])     # last row, first column
print()
print("flat block underneath:", a.ravel()[:6], "...")
`,
          output: `a[1, 2]  = 22
a[0, 0]  = 10
a[-1, -1] = 33
a[2, 0]  = 30

flat block underneath: [10 11 12 13 20 21] ...`,
          outputNote: "a[1, 2] is 22 — row 1 (second row), column 2 (third column). The ravel() peek shows the same numbers as one flat run: the block is real, the grid is the walking rule.",
          explain: [
            "`a[1, 2]` — first index selects along axis 0 (rows), second along axis 1 (columns). Row-first is the convention to internalize now.",
            "`a[-1, -1]` — negative indexes count from each axis's end; -1 is the last position of that axis.",
            "`a.ravel()[:6]` — a preview of flattening (Lesson c-03): 10, 11, 12, 13 then 20, 21 ... exactly the block order from the dissection diagram.",
          ],
        },
        {
          kind: "heading",
          text: "Strides: how the grid walks the block",
        },
        {
          kind: "text",
          text: "The header stores, for each axis, **how many bytes to jump to reach the next element along that axis** — the strides. For our 3x4 int64 array: moving one column right jumps 8 bytes (one int64); moving one row down jumps 32 bytes (four int64s — a whole row). NumPy never 'moves' anything when it reshapes or transposes: it re-derives strides and keeps the block untouched. Feel it:",
        },
        {
          kind: "code",
          title: "Strides in the wild",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a         strides:", a.strides)        # (32, 8): 32 bytes per row, 8 per column
print("a.T       strides:", a.T.strides)      # transposed: same block, swapped steps
print("a.ravel() strides:", a.ravel().strides)  # flat: one 8-byte step

b = a.reshape(4, 3)
print("reshaped (4,3) strides:", b.strides)   # same 24 numbers, new walking rule
print("a is unchanged:", a.shape, "->", b.shape, "same data:", np.array_equal(a.ravel(), b.ravel()))
`,
          output: `a         strides: (32, 8)
a.T       strides: (8, 32)
a.ravel() strides: (8,)
reshaped (4,3) strides: (24, 8)
a is unchanged: (3, 4) -> (4, 3) same data: True`,
          outputNote: "Same numbers, three walking rules. Transpose just swaps strides; reshape re-derives them. The block never moved.",
          explain: [
            "`a.strides` is (32, 8): one row down = 4 int64s = 32 bytes; one column right = 8 bytes.",
            "`a.T` (transpose) has strides (8, 32) — swapped. Zero data was copied; the header lied a different truthful lie.",
            "`a.reshape(4, 3)` — the same 12 numbers regrouped. Whether reshape must copy or not is Part C's story; today, see that the header is doing all the work.",
          ],
        },
        {
          kind: "tryIt",
          title: "Break open an array yourself",
          task: "Run this, then: (1) change the grid to 2 rows x 5 columns and predict the strides BEFORE rerunning; (2) print a.T.strides and explain it in one sentence; (3) fetch the corner elements a[0, 0], a[0, -1], a[-1, 0], a[-1, -1].",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("shape  :", a.shape)
print("strides:", a.strides)
print("element [2, 1]:", a[2, 1])
print("flat first 6  :", a.ravel()[:6])
`,
          hint: "Predicting strides: bytes per element (8 for int64) x how many elements you skip. A row-down skips ALL the columns of one row.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "An ndarray is a flat block of same-type numbers plus a walking rule. Shape says how many steps per axis; strides say how big each step is, in bytes. Indexing picks one position per axis: a[row, col].",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Why this anatomy matters tomorrow",
          text: "Slicing reuses strides to view sub-blocks without copying (Part D's views). Reshaping swaps the walking rule, free (Part C). Broadcasting aligns shapes axis-by-axis, from the right (Part G). Every 'magic' later is the header being clever about the same flat block.",
        },
      ],
      terms: [
        { term: "ndarray", definition: "NumPy's N-dimensional array: a solid data block + one dtype + a header (shape, strides) describing how to walk the block as a grid." },
        { term: "Axis", definition: "One dimension of an array, numbered from 0. In 2-D: axis 0 = down the rows, axis 1 = across the columns." },
        { term: "Data buffer", definition: "The single contiguous run of raw numbers underneath an array — no commas, no objects, no gaps." },
        { term: "Strides", definition: "Bytes-to-jump per axis to reach the next element. Reshape and transpose change strides; the buffer stays put." },
        { term: "Negative index", definition: "An index counted from the end of its axis: -1 is the last position, -2 second-to-last, on any axis." },
      ],
      mistakes: [
        {
          mistake: "Indexing 2-D arrays with chained brackets: a[1][2] instead of a[1, 2].",
          why: "Chained brackets WORK but each bracket is a separate full indexing operation — slower, and it breaks down for anything beyond basic indexing (fancy indexing needs the tuple form).",
          fix: "One bracket, comma-separated, one index per axis: a[1, 2]. Make it muscle memory now.",
        },
        {
          mistake: "Thinking shape (3, 4) means 3 columns and 4 rows.",
          why: "Shape reads axis by axis, and axis 0 is rows — so (3, 4) is 3 rows by 4 columns. Half of all beginner shape-bugs are this swap.",
          fix: "Say it out loud: 'rows, then columns' — a hundred times if needed. The interactive grid above exists precisely to cement this.",
        },
        {
          mistake: "Imagining that reshape or transpose physically moves numbers.",
          why: "It feels like work, so we assume work happened. In reality the data buffer stays byte-for-byte identical; only the header's shape/strides change.",
          fix: "Remember the dissection: the grid is a viewpoint (walking rule), not a place. When a copy is genuinely needed, NumPy tells you — or you call .copy() yourself (Part D).",
        },
        {
          mistake: "Confusing the flat block order with column-major order.",
          why: "If you expect the buffer to run column-by-column (Fortran order), every flat peek looks scrambled.",
          fix: "NumPy's default is row-major (C order): the last axis changes fastest. Row 0 entirely, then row 1, and so on. The 'Show flat indexes' toggle above shows exactly this.",
        },
      ],
      takeaways: [
        "Every ndarray = data buffer (one solid block) + dtype + header (shape, strides). The grid is a walking rule over the block.",
        "Axes are numbered from 0: in 2-D, axis 0 runs down rows, axis 1 across columns; shape pairs with axes exactly.",
        "Indexing gives one index per axis: a[row, col], negatives count from each axis's end.",
        "Strides are byte-jumps per axis (row jump skips a whole row); reshape and transpose merely re-derive them — the buffer never moves.",
        "The buffer is stored row-major (C order): last axis changes fastest.",
      ],
      quiz: [
        {
          id: "a-04-q1",
          prompt: "For `a = np.array([[10, 11, 12, 13], [20, 21, 22, 23], [30, 31, 32, 33]])`, what is `a[-2, -3]`?",
          options: [
            { text: "21", correct: true, feedback: "Correct: -2 selects the second-to-last row (index 1: [20, 21, 22, 23]) and -3 selects the third-from-last column (index 1), giving a[1, 1] = 21." },
            { text: "11", correct: false, feedback: "11 is at [0, 1] — that would be a[-3, -3] (first row, same column position)." },
            { text: "12", correct: false, feedback: "12 sits at [0, 2] — that is row -3, column -2, the mirror of this question." },
            { text: "22", correct: false, feedback: "22 is at [1, 2] — that is [-2, -2], both indexes second-from-the-end." },
          ],
          explanation: "Negative indexes count from the end of their own axis: -2 -> row 1, -3 -> column 1, so a[-2, -3] = a[1, 1] = 21.",
        },
        {
          id: "a-04-q2",
          prompt: "An int64 array has shape (5, 8). What are its strides?",
          options: [
            { text: "(64, 8) — a row-down skips 8 elements x 8 bytes; a column-right skips one element", correct: true, feedback: "Correct: 8 columns x 8 bytes = 64 bytes per row step, 8 bytes per column step." },
            { text: "(8, 64) — columns first", correct: false, feedback: "That would walk column-major (Fortran-style). NumPy's default order is row-major (C)." },
            { text: "(5, 8) — strides equal the shape", correct: false, feedback: "Coincidence of numbers, wrong meaning: strides are BYTE jumps, not element counts." },
            { text: "(40, 40) — one block of 40 elements", correct: false, feedback: "Strides are per-axis steps within the block, not totals." },
          ],
          explanation: "strides = (bytes per full row, bytes per single element) = (8 cols x 8 bytes, 8 bytes) = (64, 8).",
        },
        {
          id: "a-04-q3",
          prompt: "Transposing an array (a.T) ...",
          options: [
            { text: "copies all the numbers into a new mirrored block", correct: false, feedback: "No copy happens — that is exactly the elegant trick." },
            { text: "only swaps the shape tuple and the strides in the header; the data buffer is untouched", correct: true, feedback: "Correct — and this is why transpose is effectively free, and why mutating a.T mutates a (same buffer)." },
            { text: "sorts the rows and columns", correct: false, feedback: "Transpose is geometry (mirror along the diagonal), not ordering — sorting is Part E." },
            { text: "is only allowed for square arrays", correct: false, feedback: "Any shape transposes: an (m, n) array becomes (n, m)." },
          ],
          explanation: "Views like transpose are header tricks over one buffer — the theme that returns in Part D (copies vs views).",
        },
      ],
    },

    // ------------------------------------------------------------- a-05
    {
      slug: "a-05",
      title: "Array Attributes: The Array's Passport",
      minutes: 14,
      summary:
        "Every array carries a small passport — shape, ndim, size, dtype, itemsize, nbytes, strides, T, flags. Learn to read it at a glance and you can predict an array's behavior before running a single operation.",
      kind: "concept",
      objectives: [
        "Read all nine core attributes from any array and say what each means",
        "Predict shape, size, ndim and nbytes for an array you have not built yet",
        "Use .T correctly and know why it is a view, not a copy",
        "Sanity-check data before an analysis using only attributes (a real professional habit)",
      ],
      why: "Professionals read an array's attributes the way pilots read instruments — before doing anything. When a machine-learning model rejects your input, when a merge produces a mysterious extra row, when memory dies at scale: the first five seconds are always shape, dtype, size. This lesson turns attribute-reading into reflex, with a complete worked 'passport inspection' of a realistic dataset and a size-prediction drill you can do in your head. It also closes Part A: after this, you hold arrays confidently enough to take them apart (Part B: every way to create them; Part C: reshaping; Part D: slicing).",
      blocks: [
        {
          kind: "text",
          text: "You can tell everything important about an array without computing anything, because every array carries its own **passport**: a handful of attributes describing its geometry, its type, and its memory. Reading them takes seconds and prevents entire categories of bugs. Meet all nine in one pass:",
        },
        {
          kind: "table",
          title: "The passport, complete",
          headers: ["Attribute", "Meaning", "Example (2x3 int array)"],
          rows: [
            ["`a.shape`", "Size along each axis, as a tuple — rows, then columns, then deeper axes", "`(2, 3)`"],
            ["`a.ndim`", "Number of axes (dimensions): 1 for a vector, 2 for a table, 3 for a cube", "`2`"],
            ["`a.size`", "Total number of elements — the product of the shape tuple", "`6`"],
            ["`a.dtype`", "The single element type of the WHOLE array", "`int64`"],
            ["`a.itemsize`", "Bytes per element (from the dtype)", "`8`"],
            ["`a.nbytes`", "Bytes of the whole data block: size x itemsize", "`48`"],
            ["`a.strides`", "Byte-jumps per axis: how to walk the block (Lesson a-04)", "`(24, 8)`"],
            ["`a.T`", "The transpose — same buffer, mirrored geometry (a view!)", "shape `(3, 2)`"],
            ["`a.flags`", "Memory-layout facts: contiguity, writeability, ownership", "`C_CONTIGUOUS : True`"],
          ],
          caption: "Nine attributes, one glance, zero surprises. Everything else on an array is either data or methods (functions attached to it).",
        },
        {
          kind: "heading",
          text: "A passport inspection, performed live",
        },
        {
          kind: "text",
          text: "Here is a realistic moment: a file of daily sensor readings arrives — 4 sensors, 7 days, values with decimals. Before any analysis, inspect the passport:",
        },
        {
          kind: "code",
          title: "Inspecting data the professional way",
          code: `import numpy as np

# 4 sensors x 7 days of temperature readings (deg C)
readings = np.array([
    [21.0, 21.2, 20.8, 21.5, 22.0, 21.8, 21.1],   # sensor 0
    [18.4, 18.5, 18.2, 18.6, 18.9, 18.7, 18.3],   # sensor 1
    [25.1, 25.3, 24.9, 25.6, 26.0, 25.8, 25.2],   # sensor 2
    [19.7, 19.8, 19.5, 19.9, 20.1, 20.0, 19.6],   # sensor 3
])

print("shape    :", readings.shape, "  <- 4 sensors (rows), 7 days (columns)")
print("ndim     :", readings.ndim, "     <- a table: two axes")
print("size     :", readings.size, "    <- 4 x 7 readings")
print("dtype    :", readings.dtype, " <- decimals stored as 64-bit floats")
print("itemsize :", readings.itemsize, "bytes each")
print("nbytes   :", readings.nbytes, "bytes total")
print("strides  :", readings.strides)
`,
          output: `shape    : (4, 7)   <- 4 sensors (rows), 7 days (columns)
ndim     : 2      <- a table: two axes
size     : 28     <- 4 x 7 readings
dtype    : float64  <- decimals stored as 64-bit floats
itemsize : 8 bytes each
nbytes   : 224 bytes total
strides  : (56, 8)`,
          outputNote: "Every line is predictable before running: 4x7=28 elements, floats -> 8 bytes each -> 224 bytes total. Attributes let you audit data with arithmetic.",
          explain: [
            "shape (4, 7) — axis 0 has 4 positions (the sensors), axis 1 has 7 (the days). Reading it as 'rows then columns' is now automatic.",
            "size 28 — the product of shape entries. If a file 'should' have 28 readings and size says 29 or 27, stop and investigate before any math.",
            "nbytes 224 — 28 x 8. For a billion-element dataset, this same arithmetic tells you whether it fits in RAM BEFORE you try to load it.",
          ],
        },
        {
          kind: "heading",
          text: "The arithmetic drill you can do in your head",
        },
        {
          kind: "steps",
          title: "Predicting an array from its description",
          items: [
            "Hear the description: *'a float32 image, 512 by 512 pixels'*.",
            "Shape: (512, 512). ndim: 2. size: 512 x 512 = 262,144.",
            "Memory: 262,144 x 4 bytes = 1,048,576 bytes = exactly 1 MB. float32 was chosen precisely so this image fits in a megabyte.",
            "Same image in float64 would be 2 MB — the dtype decision IS the memory decision. You just did the analysis every data engineer does at a whiteboard.",
          ],
        },
        {
          kind: "heading",
          text: ".T — the transpose, and its one sharp edge",
        },
        {
          kind: "code",
          title: "Transposing the sensor table",
          code: `import numpy as np

readings = np.array([
    [21.0, 21.2, 20.8],
    [18.4, 18.5, 18.2],
])

days_view = readings.T          # 3 days x 2 sensors -- NO copy happened

print("readings.shape:", readings.shape)
print("days_view.shape:", days_view.shape)

days_view[0, 0] = 99.0          # write through the view...
print("readings[0, 0] :", readings[0, 0], " <-- the ORIGINAL changed too")
`,
          output: `readings.shape: (2, 3)
days_view.shape: (3, 2)
readings[0, 0] : 99.0  <-- the ORIGINAL changed too`,
          outputNote: "The transpose shares its buffer with the original — writing through it writes the original. Sharp edge flagged; the full view/copy story is Part D.",
          explain: [
            "`.T` returns a **view**: same data block, swapped strides (from Lesson a-04). Free to take, but writes flow through.",
            "Why that is GOOD: transposing a 10 GB array costs zero bytes and zero copies.",
            "Why you must know: mutating through a view mutates the source. Part D gives you the full toolkit (base, np.shares_memory, .copy()).",
          ],
        },
        {
          kind: "heading",
          text: "flags: the fine print",
        },
        {
          kind: "text",
          text: "`a.flags` reports memory-layout facts you will need in Part J (performance): is the block contiguous (C_CONTIGUOUS / F_CONTIGUOUS), is the array writable (WRITEABLE), does it own its data (OWNDATA). You will not use flags daily — but recognizing them keeps them from ever being mysterious:",
        },
        {
          kind: "code",
          title: "Reading the fine print",
          code: `import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.flags)
`,
          output: `C_CONTIGUOUS : True
  F_CONTIGUOUS : False
  OWNDATA : True
  WRITEABLE : True
  ALIGNED : True
  WRITEBACKIFCOPY : False`,
          outputNote: "A fresh array: C-contiguous (row-major block), writable, owning its data. Slices and transposes change exactly these flags — Part D and J pick the thread up.",
          explain: [
            "C_CONTIGUOUS: True — the block is one unbroken run in row-major order (the normal case).",
            "OWNDATA: True — this array owns its buffer. A transpose or a slice will say False: it borrows someone else's.",
            "WRITEABLE: True — you may assign into it. Locked arrays (like broadcasted constants later) say False.",
          ],
        },
        {
          kind: "tryIt",
          title: "Inspect an array you build",
          task: "Build the array described in the drill — a 512x512 float32 image with np.zeros((512, 512), dtype=np.float32) — and inspect its passport. Then change dtype to float64 and re-run: which two attributes change, and by how much?",
          code: `import numpy as np

image = np.zeros((512, 512), dtype=np.float32)
print("shape   :", image.shape)
print("size    :", image.size)
print("dtype   :", image.dtype)
print("nbytes  :", image.nbytes, "bytes =", image.nbytes / 1024 / 1024, "MB")
print(image.flags['C_CONTIGUOUS'] and image.flags['OWNDATA'])
`,
          hint: "np.zeros(shape, dtype) builds a block of zeros — the creation toolbox arrives in full in Part B; today it is a measuring instrument.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The professional reflex, starting today",
          text: "After every load, conversion, or reshape, print shape and dtype before anything else. Not someday — every dataset, every time. The five seconds this costs repays itself the first time size is off by one and you catch it BEFORE the wrong numbers propagate.",
        },
      ],
      terms: [
        { term: "shape", definition: "Tuple of sizes along each axis. For 2-D: (rows, columns). Paired one-to-one with axes." },
        { term: "ndim", definition: "Number of axes — the length of the shape tuple. Vector: 1, table: 2, cube: 3." },
        { term: "size", definition: "Total element count: the product of all shape entries." },
        { term: "nbytes", definition: "Total bytes of the data block: size x itemsize. Computable before building the array." },
        { term: "flags", definition: "Memory-layout report: contiguity (C/F), writeability, data ownership (OWNDATA)." },
        { term: "View", definition: "An array that borrows another's data buffer (like .T). Free to create, but writes flow through to the source." },
      ],
      mistakes: [
        {
          mistake: "Treating shape as two loose numbers instead of a paired tuple.",
          why: "shape is a tuple aligned with axes — code that hard-codes 'rows = shape[1]' is subtly wrong half the time (shape[0] is rows).",
          fix: "Unpack it meaningfully: n_sensors, n_days = readings.shape. The tuple order IS the axis order, always.",
        },
        {
          mistake: "Expecting a.size to be the byte size of the array.",
          why: "size counts ELEMENTS; bytes are nbytes. Mixing them makes memory estimates wrong by a factor of 8.",
          fix: "size = how many numbers; nbytes = how many bytes (size x itemsize). Say both out loud once — it sticks.",
        },
        {
          mistake: "Mutating a transpose (or a slice) and being surprised the original changed.",
          why: ".T and slicing return views that share the data buffer. Two names, one block of memory.",
          fix: "Know which operations view (Part D has the full map) — or make it explicit: fresh = a.T.copy() when you want independence.",
        },
        {
          mistake: "Skipping the passport inspection and debugging operations instead.",
          why: "Most 'wrong result' bugs are wrong-shaped inputs: a (7, 4) where code expected (4, 7) computes 'successfully' and silently lies.",
          fix: "Print shape + dtype after every load or reshape. Make it a reflex, not a debugging step.",
        },
      ],
      takeaways: [
        "Nine attributes, one glance: shape, ndim, size, dtype, itemsize, nbytes, strides, T, flags.",
        "The arithmetic chain: shape entries multiply to size; size x itemsize = nbytes. You can predict memory before building.",
        ".T is a free view over the same buffer — writes through it change the original.",
        "flags reports the fine print: contiguity, writeability, ownership — the levers Part J pulls for performance.",
        "Inspect shape and dtype after every load or reshape. This reflex catches more bugs than any other habit in this course.",
      ],
      quiz: [
        {
          id: "a-05-q1",
          prompt: "An int32 array has shape (1000, 500). Its size and nbytes are:",
          options: [
            { text: "size 500,000 and nbytes 500,000", correct: false, feedback: "size is right, but nbytes is bytes — each int32 element takes 4 of them." },
            { text: "size 500,000 and nbytes 2,000,000", correct: true, feedback: "Correct: 1000 x 500 = 500,000 elements; int32 = 4 bytes each; 500,000 x 4 = 2,000,000 bytes = 2 MB." },
            { text: "size 1500 and nbytes 6000", correct: false, feedback: "That adds the shape entries — size is the PRODUCT of shape entries, not the sum." },
            { text: "Cannot be known without running the code", correct: false, feedback: "It can be computed by hand in five seconds — that is exactly the skill this lesson drills." },
          ],
          explanation: "size = product of shape (500,000); nbytes = size x itemsize (4 bytes for int32) = 2,000,000.",
        },
        {
          id: "a-05-q2",
          prompt: "Which attribute pair would IMMEDIATELY reveal that a 'daily readings' array arrived transposed (days as rows instead of sensors as rows)?",
          options: [
            { text: "dtype and itemsize", correct: false, feedback: "Those describe the element type, not the geometry — a transpose keeps both identical." },
            { text: "shape (and reading it against what you expected)", correct: true, feedback: "Exactly: you expected (n_sensors, n_days) and shape says (n_days, n_sensors). One glance, bug caught before any math." },
            { text: "strides and flags", correct: false, feedback: "They are memory-layout facts — informative later (Part J), useless for 'which axis is which'." },
            { text: "nbytes", correct: false, feedback: "A transpose keeps the same element count and bytes — nbytes cannot see it." },
          ],
          explanation: "shape is the geometry readout; comparing it against the expected layout is the fastest data sanity check that exists.",
        },
        {
          id: "a-05-q3",
          prompt: "`b = a.T; b[0, 0] = 5` — what happened to a?",
          options: [
            { text: "Nothing: b is an independent copy", correct: false, feedback: "Copies do happen for some operations, but transpose is not one of them." },
            { text: "a's element at the mirrored position is now 5 too", correct: true, feedback: "Right — .T is a view sharing the data buffer; writing through b writes a. Element [0,0] maps to [0,0] here." },
            { text: "An error: transposed arrays are read-only", correct: false, feedback: "Transposes are writable views (flags.WRITABLE is True) — that is exactly the sharp edge." },
            { text: "a becomes transposed as well", correct: false, feedback: "a's own shape never changes; only the shared data block changed." },
          ],
          explanation: "Views share one buffer: writes through any view (transpose included) are visible through the original.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part A exercises (tiered: 4 beginner, 4 intermediate, 4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "a-b1",
      tier: "beginner",
      title: "Your first conversion",
      prompt:
        "Convert the Python list `readings = [18.5, 19.0, 21.2, 20.8]` into a NumPy array, print the array, and print its dtype. Expected output has three lines: the list itself, the array, and the dtype.",
      hint: "import numpy as np first, then np.array(readings). Print the dtype with a.dtype.",
      starter: `import numpy as np

readings = [18.5, 19.0, 21.2, 20.8]

# TODO: convert to an array and print array + dtype
`,
      solution: `import numpy as np

readings = [18.5, 19.0, 21.2, 20.8]
arr = np.array(readings)
print(readings)
print(arr)
print(arr.dtype)
`,
      expectedOutput: `[18.5, 19.0, 21.2, 20.8]
[18.5 19.  21.2 20.8]
float64`,
      concepts: ["np.array", "dtype"],
    },
    {
      id: "a-b2",
      tier: "beginner",
      title: "Read the passport",
      prompt:
        "The array `a = np.array([[3, 7, 1], [9, 4, 6]])` is given. Print exactly three lines: its shape, its number of dimensions, and its total size. Compare with the (2, 3) grid: rows first, then columns.",
      hint: "The three attributes are a.shape, a.ndim, a.size.",
      starter: `import numpy as np

a = np.array([[3, 7, 1],
              [9, 4, 6]])

# TODO: print shape, ndim and size (one per line)
`,
      solution: `import numpy as np

a = np.array([[3, 7, 1],
              [9, 4, 6]])
print(a.shape)
print(a.ndim)
print(a.size)
`,
      expectedOutput: `(2, 3)
2
6`,
      concepts: ["shape", "ndim", "size"],
    },
    {
      id: "a-b3",
      tier: "beginner",
      title: "One element, two ways",
      prompt:
        "Using the array `a = np.array([[5, 10, 15], [20, 25, 30], [35, 40, 45]])`, print the center element 25 with a POSITIVE index, then again with NEGATIVE indexes only. Two lines, both showing 25.",
      hint: "Positive: a[1, 1]. For negatives, count both axes from the end.",
      starter: `import numpy as np

a = np.array([[5, 10, 15],
              [20, 25, 30],
              [35, 40, 45]])

# TODO: print the center element with positive, then negative indexes
`,
      solution: `import numpy as np

a = np.array([[5, 10, 15],
              [20, 25, 30],
              [35, 40, 45]])
print(a[1, 1])
print(a[-2, -2])
`,
      expectedOutput: `25
25`,
      concepts: ["indexing", "negative indexes"],
    },
    {
      id: "a-b4",
      tier: "beginner",
      title: "Count the bytes",
      prompt:
        "Build a float64 array of shape (10, 20) filled with zeros (np.zeros((10, 20)) — it defaults to float64). Print its itemsize and its nbytes. Verify mentally: 200 elements x 8 bytes should equal nbytes.",
      hint: "The attributes are itemsize and nbytes — no computation needed, NumPy already knows.",
      starter: `import numpy as np

a = np.zeros((10, 20))

# TODO: print itemsize and nbytes
`,
      solution: `import numpy as np

a = np.zeros((10, 20))
print(a.itemsize)
print(a.nbytes)
`,
      expectedOutput: `8
1600`,
      concepts: ["itemsize", "nbytes", "np.zeros"],
    },
    {
      id: "a-i1",
      tier: "intermediate",
      title: "The stride predictor",
      prompt:
        "Build `a = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], dtype=np.int64)` — the explicit dtype pins 8-byte elements on every machine (native installs and this course's browser playground alike). On the first line print its strides; on the second line print the strides of its transpose a.T. Predict both BEFORE running: int64 means each element is 8 bytes.",
      hint: "Row-major: a row-step skips 4 elements (4 x 8 = 32 bytes); a column-step skips 1 (8 bytes). Transpose swaps the two.",
      starter: `import numpy as np

a = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]], dtype=np.int64)

# TODO: print a.strides, then a.T.strides
`,
      solution: `import numpy as np

a = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]], dtype=np.int64)
print(a.strides)
print(a.T.strides)
`,
      expectedOutput: `(32, 8)
(8, 32)`,
      concepts: ["strides", "transpose", "row-major order"],
    },
    {
      id: "a-i2",
      tier: "intermediate",
      title: "Choose your dtype",
      prompt:
        "From the SAME list `data = [1, 2, 3, 4]`, build two arrays: one forced to np.int64 and one forced to np.float32. Print each array's dtype and nbytes. int64 spends 8 bytes per element; float32 spends 4 — half the memory for the same four numbers. Pinning dtypes explicitly is the professional habit: it makes results identical on every machine, including this course's browser playground, where the DEFAULT integer width differs from a native install.",
      hint: "np.array(data, dtype=np.int64) and np.array(data, dtype=np.float32). nbytes = itemsize x 4 elements.",
      starter: `import numpy as np

data = [1, 2, 3, 4]

# TODO: int64 array and float32 array; print dtype and nbytes of each
`,
      solution: `import numpy as np

data = [1, 2, 3, 4]

int64_arr = np.array(data, dtype=np.int64)
small_arr = np.array(data, dtype=np.float32)

print(int64_arr.dtype, int64_arr.nbytes)
print(small_arr.dtype, small_arr.nbytes)
`,
      expectedOutput: `int64 32
float32 16`,
      concepts: ["dtype", "dtype inference", "memory"],
    },
    {
      id: "a-i3",
      tier: "intermediate",
      title: "Rows, columns, and one shared buffer",
      prompt:
        "Given `a = np.array([[1, 2, 3], [4, 5, 6]])`, print four lines: its shape, then the shape of a.T, then a.T[0, 1] (reading through the transpose), and finally a[-1, -1]. Expected values: (2, 3), then (3, 2), then 4 — because a.T[0, 1] is the original's a[1, 0], read through the shared buffer with zero copying — and finally 6.",
      hint: "The transpose's [r, c] is the original's [c, r]. So a.T[0, 1] = a[1, 0] = 4.",
      starter: `import numpy as np

a = np.array([[1, 2, 3],
              [4, 5, 6]])

# TODO: print a.shape, a.T.shape, a.T[0, 1], a[-1, -1]
`,
      solution: `import numpy as np

a = np.array([[1, 2, 3],
              [4, 5, 6]])
print(a.shape)
print(a.T.shape)
print(a.T[0, 1])
print(a[-1, -1])
`,
      expectedOutput: `(2, 3)
(3, 2)
4
6`,
      concepts: ["transpose", "shape", "views"],
    },
    {
      id: "a-i4",
      tier: "intermediate",
      title: "Fix the crash (read the error!)",
      prompt:
        "This code crashes with a ValueError about ragged input. Fix it so it builds a proper 2x3 array and prints its shape. Keep the fix minimal — do not delete any rows of data; instead complete the missing value so every row has three numbers (the missing reading for sensor 1 was 19.4).",
      hint: "Read the error message: it mentions 'inhomogeneous shape' — the second row has 2 values where the others have 3. Make all rows the same length.",
      starter: `import numpy as np

data = [[18.1, 18.5, 18.3],
        [19.2, 19.8],          # <-- this row is short one reading
        [17.9, 18.0, 18.2]]

a = np.array(data)
print(a.shape)
`,
      solution: `import numpy as np

data = [[18.1, 18.5, 18.3],
        [19.2, 19.8, 19.4],
        [17.9, 18.0, 18.2]]

a = np.array(data)
print(a.shape)
`,
      expectedOutput: `(3, 3)`,
      starterExpectError: "ValueError: setting an array element with a sequence. The requested array has an inhomogeneous shape after 1 dimensions. The detected shape was (3,) + inhomogeneous part.",
      concepts: ["np.array", "ragged input", "error reading"],
    },
    {
      id: "a-a1",
      tier: "advanced",
      title: "The memory budget",
      prompt:
        "You must store 60 grayscale video frames of 1920x1080 pixels. Compute (with real NumPy arrays of the right dtype but ZERO wasted memory — use np.zeros with the right shape and dtype, do not build 60 real frames of data beyond what is asked): (1) the nbytes of one float32 frame; (2) the nbytes of the full stack as float32, expressed in MB (divide by 1024**2); (3) the same stack in uint8, in MB. Print three numbers only. Structure: build the 3-D stack arrays with np.zeros((60, 1920, 1080), dtype=...) and read .nbytes from them — the point is the arithmetic, verified by NumPy itself.",
      hint: "One frame = 1920 x 1080 x 4 bytes. Full float32 stack: 60 x that. uint8 halves nothing — it QUARTERS float32's 4 bytes to 1.",
      starter: `import numpy as np

# TODO: one float32 frame's nbytes
# TODO: float32 stack nbytes in MB
# TODO: uint8 stack nbytes in MB
print(frame_bytes)
print(stack_f32_mb)
print(stack_u8_mb)
`,
      solution: `import numpy as np

frame_bytes = np.zeros((1920, 1080), dtype=np.float32).nbytes
stack_f32_mb = np.zeros((60, 1920, 1080), dtype=np.float32).nbytes / 1024**2
stack_u8_mb = np.zeros((60, 1920, 1080), dtype=np.uint8).nbytes / 1024**2

print(frame_bytes)
print(stack_f32_mb)
print(stack_u8_mb)
`,
      expectedOutput: `8294400
474.609375
118.65234375`,
      concepts: ["memory budgeting", "dtype choice", "3-D arrays"],
    },
    {
      id: "a-a2",
      tier: "advanced",
      title: "The dtype detective",
      prompt:
        "Predict, then verify. For each of these inputs, what dtype does np.array infer? (1) [True, False] (2) [1, 2.0] (3) [1, 2, 99999999999999999999] (4) ['a', 1]. Print the dtype of results 1-3 and the ARRAY ITSELF for result 4, one per line, with a label. The booleans become bool; the mixed int/float promotes to float64; the huge integer needs more than int64 can hold, so NumPy gives you an object array (a warning may appear — that is the honest behavior, and the dtype tells the story); and in the last one the string wins over the int (it converts 1 to '1' — we print the values, not the dtype, because the U-length numpy sizes for that int DEPENDS on the platform's default integer width).",
      hint: "Print with labels: print('1:', np.array([True, False]).dtype), print('4:', np.array(['a', 1])). Do not convert — just observe what NumPy chooses.",
      starter: `import numpy as np

# TODO: print the inferred dtype of inputs 1-3, and the values of input 4
`,
      solution: `import numpy as np

print('1:', np.array([True, False]).dtype)
print('2:', np.array([1, 2.0]).dtype)
print('3:', np.array([1, 2, 99999999999999999999]).dtype)
print('4:', np.array(['a', 1]))
`,
      expectedOutput: `1: bool
2: float64
3: object
4: ['a' '1']`,
      concepts: ["dtype inference", "promotion", "object arrays"],
    },
    {
      id: "a-a3",
      tier: "advanced",
      title: "Same block, three views",
      prompt:
        "Build `a = np.arange(12).reshape(3, 4)` (arange makes 0..11, reshape folds it into 3x4 — a preview of Part B and C you can already use). In four lines print: a's shape, a.T's shape, a.reshape(4, 3)'s shape, and a.ravel() (the flat block). Then one final line: np.shares_memory(a, a.T) — is the transpose the same memory? (It should print True.). Five lines total.",
      hint: "arange(12) -> [0 1 ... 11]; reshape(3, 4) -> 3 rows x 4 cols; .T swaps; .ravel() flattens (a view here). shares_memory answers the buffer question directly.",
      starter: `import numpy as np

a = np.arange(12).reshape(3, 4)

# TODO: print a.shape, a.T.shape, a.reshape(4, 3).shape, a.ravel(), shares_memory(a, a.T)
`,
      solution: `import numpy as np

a = np.arange(12).reshape(3, 4)
print(a.shape)
print(a.T.shape)
print(a.reshape(4, 3).shape)
print(a.ravel())
print(np.shares_memory(a, a.T))
`,
      expectedOutput: `(3, 4)
(4, 3)
(4, 3)
[ 0  1  2  3  4  5  6  7  8  9 10 11]
True`,
      concepts: ["views", "reshape", "transpose", "shares_memory"],
    },
    {
      id: "a-a4",
      tier: "advanced",
      title: "The honest micro-benchmark",
      prompt:
        "Write a benchmark that times adding 1 to every element of a Python list of 200,000 zeros (loop + append) versus a NumPy array of 200,000 zeros (arr + 1), using time.perf_counter. Print the list time in ms, the array time in ms, and the speedup ratio rounded to 1 decimal (list_ms / array_ms). Timings differ per machine — that is expected; your code must simply run cleanly and print the three lines. (The auto-check is disabled for this one: outputs are machine-dependent. Run it, read YOUR ratio.)",
      hint: "time.perf_counter() twice around each block. Multiply the difference by 1000 for ms. Guard against dividing by zero with max(array_ms, 1e-6).",
      starter: `import numpy as np
import time

n = 200_000
big_list = [0] * n
big_array = np.zeros(n)

# TODO: time the loop version
# TODO: time the array version
# TODO: print both in ms and the ratio
`,
      solution: `import numpy as np
import time

n = 200_000
big_list = [0] * n
big_array = np.zeros(n)

start = time.perf_counter()
out = []
for x in big_list:
    out.append(x + 1)
list_ms = (time.perf_counter() - start) * 1000

start = time.perf_counter()
out2 = big_array + 1
array_ms = (time.perf_counter() - start) * 1000

print(f"list loop : {list_ms:.1f} ms")
print(f"array + 1 : {array_ms:.1f} ms")
print(f"speedup   : {list_ms / max(array_ms, 1e-6):.1f}x")
`,
      concepts: ["benchmarking", "vectorization", "perf_counter"],
    },
  ],

  // ------------------------------------------------------------------
  // Part A assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "a-as-1",
      prompt: "In one sentence: what does NumPy give Python that lists cannot?",
      options: [
        { text: "Packed, typed N-dimensional grids plus fast whole-grid (vectorized) operations on them", correct: true, feedback: "The container and the operations together are the offer; speed is the consequence." },
        { text: "The ability to store more than one value in a variable", correct: false, feedback: "Lists already do that — the difference is layout (packed, one type) and whole-grid math." },
        { text: "A way to avoid learning loops", correct: false, feedback: "You still think in loops — you just express them as one array operation the machine runs for you." },
        { text: "Automatic saving of data to disk", correct: false, feedback: "Persistence is a small add-on (Part J), not the core idea." },
      ],
      explanation: "NumPy = the ndarray (packed, typed, N-D) + vectorized math. Everything else follows.",
    },
    {
      id: "a-as-2",
      prompt: "Which statement about lists vs arrays is TRUE?",
      options: [
        { text: "Arrays can hold mixed types per element, just like lists", correct: false, feedback: "One array, one dtype — that strictness is what buys the speed." },
        { text: "On lists, + concatenates; on arrays, + adds element-wise", correct: true, feedback: "Same symbol, two worlds — the single most practically important difference day to day." },
        { text: "Lists store numbers in one solid block, arrays store pointers", correct: false, feedback: "Exactly backwards — reread the memory diagram in Lesson a-02." },
        { text: "Arrays are always faster, for any task and any size", correct: false, feedback: "On tiny arrays or non-numeric work, plain Python can win; the gap opens with size and numeric grids." },
      ],
      explanation: "Sequence operators (glue/repeat) belong to lists; arrays define the same operators as element-wise math.",
    },
    {
      id: "a-as-3",
      prompt: "The universal import line for this ecosystem is:",
      options: [
        { text: "from numpy import everything", correct: false, feedback: "Not a real statement — and the ecosystem convention is the two-letter alias." },
        { text: "import numpy as np", correct: true, feedback: "Four characters that make every tutorial, docs page and colleague's snippet run verbatim." },
        { text: "include numpy", correct: false, feedback: "That is C/other languages' syntax; Python uses import." },
        { text: "import numpy quickly", correct: false, feedback: "Creative, but not a thing. (Though it IS fast.)" },
      ],
      explanation: "import numpy as np — the one convention the entire data world obeys.",
    },
    {
      id: "a-as-4",
      prompt: "`np.array([[1, 2, 3], [4, 5]])` fails. The deep reason is:",
      options: [
        { text: "Arrays may not contain single digits", correct: false, feedback: "Digits are fine; geometry is the problem." },
        { text: "An array's grid must be rectangular — same length along an axis for every position of the outer axes", correct: true, feedback: "The block layout demands a consistent shape; ragged data must stay in lists/pandas." },
        { text: "Nested lists require the subok parameter", correct: false, feedback: "subok concerns subclass passing-through, nothing to do with raggedness." },
        { text: "You must specify ndmin=2", correct: false, feedback: "ndmin sets a MINIMUM dimensionality; it cannot repair uneven rows." },
      ],
      explanation: "One dtype, one solid block, one rectangular shape — that is the contract np.array enforces.",
    },
    {
      id: "a-as-5",
      prompt: "For a shape (4, 9) int64 array, which trio is correct?",
      options: [
        { text: "size 36, strides (72, 8), nbytes 288", correct: true, feedback: "4x9=36 elements; row-step 9x8=72 bytes, col-step 8 bytes; 36x8=288 bytes. Full marks." },
        { text: "size 13, strides (4, 9), nbytes 104", correct: false, feedback: "size is the product (36), not the sum (13); strides are bytes, not shape entries." },
        { text: "size 36, strides (9, 4), nbytes 36", correct: false, feedback: "Close on size, wrong everywhere else: strides are (bytes per row-step, bytes per element) = (72, 8); nbytes = 288." },
        { text: "size 9, strides (72, 8), nbytes 72", correct: false, feedback: "That counts only one row: size counts ALL elements (36)." },
      ],
      explanation: "size = product of shape; strides = (cols x itemsize, itemsize) in C order; nbytes = size x itemsize.",
    },
    {
      id: "a-as-6",
      prompt: "In a 2-D array, axis 0 and axis 1 run:",
      options: [
        { text: "axis 0 across columns, axis 1 down rows", correct: false, feedback: "Swapped — this is the classic mix-up. Rows come FIRST because axis 0 comes first." },
        { text: "axis 0 down the rows, axis 1 across the columns", correct: true, feedback: "Correct — and shape pairs with axes exactly: shape (rows, cols)." },
        { text: "both along the same direction, different speeds", correct: false, feedback: "Each axis is an independent direction of the grid." },
        { text: "it depends on the dtype", correct: false, feedback: "Geometry (axes, shape) is independent of the element type." },
      ],
      explanation: "Axis 0 = rows (down), axis 1 = columns (across). Shape (r, c) pairs one-to-one with axes.",
    },
    {
      id: "a-as-7",
      prompt: "After `v = a.T`, which is TRUE?",
      options: [
        { text: "v is a fresh copy; changing v leaves a alone", correct: false, feedback: "No copy occurs — transpose is a header trick (swapped strides) over the same buffer." },
        { text: "v shares a's data buffer; writes through v change a", correct: true, feedback: "One buffer, two walking rules. Freedom and danger in a single design." },
        { text: "v shares a's dtype only", correct: false, feedback: "It shares dtype AND buffer; only the header (shape/strides) differs." },
        { text: "a's own shape becomes transposed", correct: false, feedback: "a never changes; only the new view v has the swapped shape." },
      ],
      explanation: ".T is a view: same block, swapped strides. Writes through it write the original.",
    },
    {
      id: "a-as-8",
      prompt: "The smartest first line(s) after loading or building any array are:",
      options: [
        { text: "print(a.shape, a.dtype) — verify geometry and type before any math", correct: true, feedback: "The professional reflex: wrong-shaped or wrong-typed inputs cause every silent disaster downstream." },
        { text: "a = a + 1 to warm the array up", correct: false, feedback: "No warm-up needed (and you just modified your data!)." },
        { text: "len(a) — that is all you ever need", correct: false, feedback: "len only gives the FIRST axis; shape gives every axis, plus dtype tells you what the numbers are." },
        { text: "Nothing: inspecting is for beginners", correct: false, feedback: "Inspecting is for PROFESSIONALS — it is the cheapest bug-prevention in existence." },
      ],
      explanation: "shape + dtype first, every time. This course will keep asking you to prove the habit stuck.",
    },
  ],

  // ------------------------------------------------------------------
  // Part A mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Speed Lab: Lists vs Arrays, Measured Honestly",
    brief:
      "Build a small, fair benchmark lab that measures what Part A claimed: that packed arrays beat Python loops on whole-grid math. You will write a function that times both implementations across a range of sizes, verify that both compute the SAME answers (a benchmark without a correctness check is a rumor), and print a compact report showing where the crossover happens. This is the exact experiment every team runs before believing a library's speed promises — and after it, the array-vs-list decision is yours to make from evidence, not from doctrine.",
    requirements: [
      "A function time_list(n) that builds a Python list of n zeros, adds 1 to every element with a loop + append, and returns the elapsed seconds (use time.perf_counter)",
      "A function time_array(n) that builds np.zeros(n), computes arr + 1, and returns elapsed seconds the same way",
      "A correctness check: for n = 1000, the two methods produce equal results (compare the list result to array_result.tolist()) — print 'results match: True' before the timings",
      "Run both functions for n = 10_000, 100_000, and 1_000_000 and print a four-column report line per size: n, list ms, array ms, speedup (1 decimal)",
      "All timings printed with one decimal place; speedup as e.g. 47.3x",
      "No random numbers, no machine-dependent claims in the code itself — only measured numbers printed as measured",
    ],
    steps: [
      "Write time_list(n): build the list, time the loop, return the seconds. Test it alone at n = 10_000 by printing the result once.",
      "Write time_array(n) as its mirror image (np.zeros, one vectorized +1, same timing pattern).",
      "Add the correctness gate: compute both results at n = 1000 and assert/compare with tolist(); print the match line. This is the most important line of the lab — do not skip it.",
      "Loop over the three sizes; for each, call both timers and print n, list ms, array ms, and the ratio (guard division by zero with max(array_s, 1e-9)).",
      "Run it. Read your own table: where does the array start winning, and by how much at a million? Write one sentence in a comment noting the smallest size where the array is clearly faster on YOUR machine.",
      "Stretch (optional): add a float32 array column and see whether dtype changes the picture at n = 1_000_000.",
    ],
    starter: `import numpy as np
import time

def time_list(n):
    """Build a list of n zeros, add 1 to each with a loop, return seconds."""
    data = [0] * n
    # TODO: time a loop + append that adds 1 to every element
    return 0.0  # TODO: return the measured seconds

def time_array(n):
    """Build an array of n zeros, add 1 with one vectorized op, return seconds."""
    data = np.zeros(n)
    # TODO: time data + 1
    return 0.0  # TODO: return the measured seconds

# --- correctness gate: both methods must agree ---
n_check = 1_000
list_result = [x + 1 for x in [0] * n_check]
array_result = (np.zeros(n_check) + 1).tolist()
print("results match:", list_result == array_result)

# --- the report ---
print(f"{'n':>10} | {'list ms':>9} | {'array ms':>9} | speedup")
for n in (10_000, 100_000, 1_000_000):
    # TODO: call both timers, print n, list ms, array ms, ratio
    pass
`,
    concepts: ["benchmarking", "vectorization", "tolist", "perf_counter", "honest measurement"],
    extension:
      "Add a memory column: estimate each implementation's memory with sys.getsizeof (list) and nbytes (array) at n = 1_000_000, and report the byte ratio alongside the time ratio. Which gap is bigger — time or memory?",
  },
};
