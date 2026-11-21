/**
 * PART B — CREATING ARRAYS: EVERY WAY TO BUILD A BLOCK
 *
 * The construction kit: zeros/ones/full/empty and the _like family ->
 * ranges (arange, linspace, logspace, geomspace) and the reshape preview ->
 * special matrices (eye, diag, meshgrid, triangles, a taste of vander) ->
 * converters (asarray, fromiter, fromfunction, frombuffer, copy) -> the
 * complete dtype system (sizes, limits, iinfo/finfo, silent overflow) ->
 * casting and type promotion (astype, promote_types, result_type, and
 * NumPy 2's weak-scalar rule).
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

export const PART_B: NumpyPart = {
  letter: "B",
  title: "Creating Arrays: Every Way to Build a Block",
  tagline: "Zeros, ones, ranges, grids and dtypes — the full construction kit",
  description:
    "Part A taught you the front door: np.array converts data you already have. This part hands you the whole construction kit. Describe a shape and get a blank slate (zeros, ones, full, empty — and their _like cousins). Generate ranges without typing a single number (arange, linspace, logspace, geomspace). Build the famous grids — identities, diagonals, coordinate meshes, triangles. Convert anything array-ish into an array without wasting copies (asarray, fromiter, fromfunction). Then master the system underneath it all: every dtype on the menu, its size and its limits (including the one cliff every NumPy user must know — silent integer wraparound), and the casting and promotion rules that decide what type comes out of every mix you will ever write.",
  lessons: [
    // ------------------------------------------------------------- b-01
    {
      slug: "b-01",
      title: "Zeros, Ones, and Blank Slates",
      minutes: 16,
      summary:
        "Most arrays in real work are not converted from lists — they are ordered by shape and filled in later. Learn the describe-the-shape family (zeros, ones, full, empty), the _like cousins that copy an existing array's outfit, and the one honest surprise: np.empty hands you uninitialized memory.",
      kind: "concept",
      objectives: [
        "Create arrays by describing their shape: np.zeros, np.ones, np.full",
        "Explain why describe-the-shape beats list-every-value for generated data",
        "Use np.empty correctly: allocate first, fill immediately, never trust its initial contents",
        "Use the _like family (zeros_like, ones_like, full_like, empty_like) to match an existing array's shape and dtype",
        "Choose a sensible dtype at creation time instead of fixing it later",
      ],
      why: "A 4K grayscale frame is 8.3 million numbers. Nobody types 8.3 million values into a list — they say 'give me a 2160x3840 block of zeros, I will paint into it.' Science code works this way constantly: allocate a results grid, fill it in a loop or a vectorized expression; create a mask of all-True and flip selected entries; reserve scratch space and overwrite every cell. If the only array you can build is np.array([...]) then every generated dataset starts with a wasteful Python list. The describe-the-shape family is how professionals create arrays — and np.empty, misread by every beginner at least once, is the lesson's one trap worth meeting on purpose.",
      blocks: [
        {
          kind: "text",
          text: "Part A taught you the front door: `np.array` takes data you already have and packs it into a block. But most arrays in the wild are not converted from anything — they are **ordered by shape** and filled in later. Think of a notebook manufacturer: they do not photocopy a filled notebook; they bind 200 blank pages because you asked for 200 pages. NumPy has a whole shelf of blank-slate makers, and they all share one idea: **you describe the shape, NumPy builds the block.**",
        },
        {
          kind: "heading",
          text: "Describe the shape, don't list the values",
        },
        {
          kind: "text",
          text: "`np.zeros((3, 4))` reads as a sentence: *three rows, four columns, all zeros*. You never wrote a single 0, yet you get a full float64 block — and the same call scales unchanged to `np.zeros((2160, 3840))` for a 4K image. That is the first win. The second is subtler: **a shape description cannot be wrong by one element.** A hand-typed list of 1001 values where you meant 1000 is a bug nobody can see; `(1000,)` is either right or visibly wrong.",
        },
        {
          kind: "code",
          title: "The two most-ordered slates",
          code: `import numpy as np

# Shape is a TUPLE: (rows, columns). One number may be bare: np.zeros(5)
zeros = np.zeros((3, 4))
ones = np.ones(5, dtype=np.int32)      # dtype chosen at the counter, not later

print(zeros, zeros.dtype)
print(ones, ones.dtype)
`,
          output: `[[0. 0. 0. 0.]
 [0. 0. 0. 0.]
 [0. 0. 0. 0.]] float64
[1 1 1 1 1] int32`,
          outputNote: "Default dtype is float64 for all blank-slate makers — say dtype= when you want integers, booleans, or a narrower type.",
          explain: [
            "`np.zeros((3, 4))` — note the double parentheses: the shape is one tuple argument, not two numbers (that trap gets its own warning below).",
            "`np.ones(5, dtype=np.int32)` — a bare integer shape is fine for 1-D; and the dtype you ask for at creation is the dtype you keep.",
            "Both functions also accept a shape *list* like [3, 4], but tuples are the ecosystem's habit — use them.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.zeros",
          purpose: "Build a new array of a given shape where every element is 0.0 (or the zero of the dtype you ask for).",
          signature: "np.zeros(shape, dtype=float, order=\"C\", *, like=None)",
          purposeDetail:
            "np.zeros is the most-created array in numerical computing, because 'a block of zeros I will write into' is the natural starting point for results buffers, accumulators, images, masks and simulations. Describing the shape costs three arguments and zero data movement from Python-land — the block is carved, zeroed, and handed back without a Python loop ever touching an element. It is also your measuring instrument: np.zeros with a shape and dtype tells you the nbytes of a dataset before you have any data (Lesson a-05 used it exactly that way).",
          params: [
            {
              name: "shape",
              type: "int or tuple of ints",
              required: true,
              description: "The shape of the new block. One integer gives a 1-D array; a tuple gives any number of dimensions.",
              example: "(3, 4) or 5",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "Element type of the block. Default is float64; pass np.int64, np.uint8, bool, ... to order a different zero (integer zeros, False entries for bool).",
              example: "dtype=np.float32",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              description: "Memory layout: row-major (C, the default) or column-major (F). Leave it alone until Part J.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A fresh array of the requested shape and dtype, every element set to zero.",
          },
          example: `import numpy as np

# a results buffer for 100 experiments x 4 metrics
results = np.zeros((100, 4))
print(results.shape, results.dtype)

# a 1-D integer counter rack (zeros as integers, not floats)
counts = np.zeros(10, dtype=np.int64)
print(counts)

# a boolean mask that starts all-False -- booleans have a zero too
mask = np.zeros(4, dtype=bool)
print(mask)
`,
          exampleOutput: `(100, 4) float64
[0 0 0 0 0 0 0 0 0 0]
[False False False False]`,
          commonMistakes: [
            {
              mistake: "Passing dimensions as separate arguments: np.zeros(3, 4).",
              why: "NumPy reads the second positional argument as the dtype and chokes: TypeError: Cannot interpret '4' as a data type. The shape must arrive as ONE tuple.",
              fix: "np.zeros((3, 4)) — parentheses around the shape, parentheses around the whole call. Two layers, always.",
            },
            {
              mistake: "Building a list of zeros first, then np.array-ing it.",
              why: "[0] * 1000000 followed by np.array works but walks a million Python objects to fill a block np.zeros fills directly.",
              fix: "If you know the shape and the fill value, order the block directly: np.zeros(shape) or np.full(shape, value).",
            },
            {
              mistake: "Forgetting that the default dtype is float64 when integers were intended.",
              why: "0. prints differently from 0, comparisons like arr == 0 still work, but the block carries 8-byte floats where 1- or 4-byte ints were the honest choice.",
              fix: "Say it when you order it: np.zeros(n, dtype=np.int64). The dtype decision IS the memory decision (Lesson b-05).",
            },
          ],
          related: [
            { name: "np.ones", relation: "Same shape-by-description, filled with 1.0 — the natural start for counters and all-ones factors." },
            { name: "np.full", relation: "Same idea when the fill value is anything other than 0 or 1." },
            { name: "np.empty", relation: "Skips the zero-fill for speed — contents are uninitialized until you write them." },
            { name: "np.zeros_like", relation: "Copies the shape AND dtype of an existing array instead of you restating them." },
          ],
          applications: [
            "Results buffers: allocate zeros((n_trials, n_metrics)) and fill one row per experiment",
            "Image and signal canvases: a black 512x512 frame is np.zeros((512, 512), dtype=np.uint8)",
            "Boolean masks that start all-False and get switched on cell by cell (Part E leans on this)",
          ],
          notes:
            "np.zeros touches every byte (it must zero them), so it is a hair slower than np.empty — but the difference only matters in tight loops. Correct first, fast where it counts (Part J).",
        },
        {
          kind: "functionDoc",
          name: "np.ones",
          purpose: "Build a new array of a given shape where every element is 1.0 (or the one of the dtype you ask for).",
          signature: "np.ones(shape, dtype=float, order=\"C\", *, like=None)",
          purposeDetail:
            "Arrays of ones are the seed of proportion: a vector of ones is the neutral element for sums (averaging = dot with ones / count), the starting point for counters you will increment, and the default 'everything included' mask when True is spelled 1. Like np.zeros it builds the block directly from a shape description — no Python list, no loop, and the same three-argument grammar.",
          params: [
            {
              name: "shape",
              type: "int or tuple of ints",
              required: true,
              description: "The shape of the new block; a bare int gives 1-D, a tuple gives more.",
              example: "(2, 3) or 8",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "Element type. Default float64; np.ones(5, dtype=bool) gives a compact all-True mask.",
              example: "dtype=bool",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              description: "Row-major (default) or column-major memory layout — a Part J concern.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A fresh array of the requested shape and dtype, every element set to one.",
          },
          example: `import numpy as np

# every element counts once: ones are the neutral weight vector
weights = np.ones(5)
total = (weights * np.array([2.0, 4.0, 6.0, 8.0, 10.0])).sum()
print("sum   :", total)

# an all-True mask in one call
keep_all = np.ones(4, dtype=bool)
print("mask  :", keep_all)

# integer ones: a counter rack ready to be incremented
hits = np.ones(3, dtype=np.int64)
hits[1] += 41
print("hits  :", hits)
`,
          exampleOutput: `sum   : 30.0
mask  : [ True  True  True  True]
hits  : [ 1 42  1]`,
          commonMistakes: [
            {
              mistake: "Writing np.ones(3, 4) and expecting a 3x4 grid of ones.",
              why: "Same tuple trap as np.zeros: the 4 is read as a dtype argument and the call dies with TypeError.",
              fix: "np.ones((3, 4)) — the shape is one tuple.",
            },
            {
              mistake: "Using ones + arithmetic where full was the honest tool.",
              why: "7 * np.ones((2, 2)) gets you a grid of 7.0, but the reader has to do the multiplication in their head.",
              fix: "np.full((2, 2), 7.0) says the fill value out loud.",
            },
          ],
          related: [
            { name: "np.zeros", relation: "The zero-filled sibling — the more common starting point for buffers." },
            { name: "np.full", relation: "Generalizes both: any fill value, any shape, one call." },
            { name: "np.ones_like", relation: "Ones in the exact shape and dtype of an array you already hold." },
          ],
          applications: [
            "Neutral weight/counting vectors: average = (data * ones).sum() / n",
            "All-True or all-1 masks that start permissive and get narrowed down",
            "Denominators and scaling grids built to be broadcast against data (Part G)",
          ],
          notes:
            "Every trick np.zeros knows (shape tuples, dtype at creation, _like variants) applies unchanged to np.ones — learn the grammar once, use it four times.",
        },
        {
          kind: "heading",
          text: "np.full: any fill value, stated out loud",
        },
        {
          kind: "text",
          text: "Zero and one are so common they got their own functions. Every other constant — a background gray of 128, a sentinel of -999.0, a start temperature of 20 degrees — is a job for `np.full(shape, value)`. One rule worth internalizing now: **the fill value drives the dtype** unless you overrule it. `np.full((2, 2), 7)` fills with the *integer* 7, so the block is int64; `np.full((2, 2), 7.5)` needs floats; and `np.full((2, 2), 255, dtype=np.uint8)` is the honest way to say 'pixel white'.",
        },
        {
          kind: "code",
          title: "One function, three dtypes, zero loops",
          code: `import numpy as np

background = np.full((2, 3), 128)               # int fill -> int64 block
ph_setting = np.full((2, 2), 7.5)              # float fill -> float64 block
white      = np.full((2, 2), 255, dtype=np.uint8)  # dtype wins over the int literal

print(background, background.dtype)
print(ph_setting, ph_setting.dtype)
print(white, white.dtype, white.nbytes, "bytes")
`,
          output: `[[128 128 128]
 [128 128 128]] int64
[[7.5 7.5]
 [7.5 7.5]] float64
[[255 255]
 [255 255]] uint8 4 bytes`,
          outputNote: "The dtype follows the fill value's type unless you pass dtype= explicitly — np.full is where 'choosing the dtype at the counter' becomes a habit.",
          explain: [
            "`np.full((2, 3), 128)` — an integer fill value produces an integer block (int64). Same shape, different dtype than a 7.5 fill.",
            "`dtype=np.uint8` — the explicit dtype overrules the literal: 255 stored in one byte. Four elements, 4 bytes total.",
            "Compare with `128 * np.ones((2, 3))` — it works, but it multiplies after building; np.full writes the value directly.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.full",
          purpose: "Build a new array of a given shape with every element set to a value you choose.",
          signature: "np.full(shape, fill_value, dtype=None, order=\"C\", *, like=None)",
          purposeDetail:
            "Constants are everywhere in data work: a background level, a sentinel for missing readings, an initial temperature for a simulation, a neutral score. np.full states the fill value in the call itself, so the reader sees the constant once — not once per row in a printed array. It also settles the dtype question honestly: without dtype= the block takes the fill value's own type, so a float sentinel and an int sentinel come out in their natural widths.",
          params: [
            {
              name: "shape",
              type: "int or tuple of ints",
              required: true,
              description: "The shape of the new block.",
              example: "(3, 3)",
            },
            {
              name: "fill_value",
              type: "scalar",
              required: true,
              description: "The value written into every cell. Its Python type (int, float, bool) picks the dtype when dtype is not given.",
              example: "-999.0",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Overrules the fill value's natural type — e.g. force uint8 for pixel constants.",
              example: "dtype=np.uint8",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              description: "Memory layout, Part J territory.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A fresh array of the given shape, every element equal to fill_value.",
          },
          example: `import numpy as np

# a sentinel block for 'sensor offline'
offline = np.full((2, 3), -999.0)
print(offline)

# pixel constants: force the honest image dtype
gray = np.full((3, 3), 128, dtype=np.uint8)
print(gray, gray.dtype)

# a starting temperature field for a simulation
field = np.full((2, 2), 20.5)
print(field, field.dtype)
`,
          exampleOutput: `[[-999. -999. -999.]
 [-999. -999. -999.]]
[[128 128 128]
 [128 128 128]
 [128 128 128]] uint8
[[20.5 20.5]
 [20.5 20.5]] float64`,
          commonMistakes: [
            {
              mistake: "Expecting np.full((2, 2), 7) to be float64.",
              why: "The int literal 7 makes an int64 block; only a float literal (7.0) or dtype= makes floats.",
              fix: "Match the literal to the meaning: 7.0 for measurements, dtype=np.uint8 for pixel bytes. The dtype is the fill value's shadow.",
            },
            {
              mistake: "Swapping the arguments: np.full(7, (2, 2)).",
              why: "The signature is (shape, fill_value); reversed, NumPy tries to interpret the tuple as the fill and the 7 as a shape — an error or a bizarre result.",
              fix: "Read it as English: 'full, shape (2, 2), with 7' — shape first, value second.",
            },
            {
              mistake: "Using a list as fill_value and expecting element-wise filling.",
              why: "fill_value must be one scalar broadcast to every cell; a list either errors (shape mismatch) or becomes an object scalar.",
              fix: "To fill rows or regions with different values, create the block first and assign into slices (Part D) or use broadcasting (Part G).",
            },
          ],
          related: [
            { name: "np.zeros / np.ones", relation: "The two constants common enough to get their own faster-to-type functions." },
            { name: "np.full_like", relation: "Same fill, but shape and dtype inherited from an existing array." },
            { name: "ndarray.fill", relation: "Fills an EXISTING array in place (a.fill(3)) — no new block, and it cannot change the dtype." },
          ],
          applications: [
            "Sentinel grids for missing data (-999.0, NaN) before real readings arrive",
            "Constant color or gray-level images in image pipelines",
            "Initial conditions for simulations and initial guesses for iterative algorithms",
          ],
          notes:
            "np.full with 0 or 1 does exactly what np.zeros / np.ones do — use the named functions for those two, since readers recognize them instantly.",
        },
        {
          kind: "arrayViz",
          title: "A shape described, not typed",
          mode: "explore",
          name: "grid",
          caption:
            "This 3x4 grid was ordered, not typed: np.zeros((3, 4)) — three sensors (rows) x four hours (columns), float64. Click around: the inspector reads out indexes, flat positions, shape and size, and every one of the 12 zeros arrived from a nine-character description. This is what 'describe the shape' buys you — the same call builds a (300, 400) grid without changing a character.",
          data: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          labels: {
            rows: ["sensor 0", "sensor 1", "sensor 2"],
            cols: ["00:00", "06:00", "12:00", "18:00"],
          },
          dtype: "float64",
        },
        {
          kind: "heading",
          text: "np.empty: fast, blank, and full of surprises",
        },
        {
          kind: "text",
          text: "The last blank-slate maker is the one that surprises everyone. `np.empty(shape)` allocates the block and **does not initialize it** — whatever bytes were already in that memory are now 'your values'. This is not a bug; it is a deliberate speed trade: if you are about to overwrite every cell anyway, zeroing them first is wasted work. The contract is simple: **empty means uninitialized. Allocate, then fill, and never read before you write.** We will not claim what its contents are — they are not even the same from run to run — so the verified example below checks only the facts that are guaranteed (shape, dtype, size) and then fills every cell before printing a single value.",
        },
        {
          kind: "code",
          title: "Using np.empty the honest way",
          code: `import numpy as np

# Reserve a scratch block. Its VALUES are uninitialized -- do not print them.
scratch = np.empty((2, 3), dtype=np.float64)

# The only facts guaranteed at this moment:
print("shape:", scratch.shape, " dtype:", scratch.dtype, " size:", scratch.size)

# Fill every cell BEFORE reading anything
scratch[:] = -1.0
print("after filling:")
print(scratch)
`,
          output: `shape: (2, 3)  dtype: float64  size: 6
after filling:
[[-1. -1. -1.]
 [-1. -1. -1.]]`,
          outputNote: "The first print shows the passport facts that np.empty guarantees from the moment it returns; the values only become defined once we write them. Notice the fill uses [:] = value — assigning to every element at once.",
          explain: [
            "`scratch[:] = -1.0` — the slice `:` on every axis means 'all cells', so one assignment fills the whole block. Part D makes this syntax fully precise.",
            "If we had printed scratch before filling, we might have seen zeros, old data, or garbage — nothing is promised, which is exactly why this block never prints it.",
            "`np.empty` exists for the moment you know you will overwrite everything — it skips the zeroing pass np.zeros pays for.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The np.empty rule, in one line",
          text: "Never read a cell of an np.empty array before writing it. If you need guaranteed values at creation, you wanted np.zeros, np.ones, or np.full.",
        },
        {
          kind: "functionDoc",
          name: "np.empty",
          purpose: "Allocate a new array of a given shape without initializing its contents — the fastest way to reserve a block you are about to overwrite completely.",
          signature: "np.empty(shape, dtype=float, order=\"C\", *, like=None)",
          purposeDetail:
            "np.zeros must touch every byte to zero them. np.empty skips that pass entirely: it carves the block out of memory and returns it with whatever bytes happened to be there. That is a real speed win when every cell is about to be overwritten — the textbook use is a temporary buffer inside a function that fully populates it before returning. The price is the one rule that gives the function its name: the contents are NOT zero, NOT random-on-purpose, NOT anything — they are undefined until you write them.",
          params: [
            {
              name: "shape",
              type: "int or tuple of ints",
              required: true,
              description: "The shape of the block to reserve.",
              example: "(1000, 1000)",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "Element type of the reserved block (default float64). The bytes are interpreted as this type once written.",
              example: "dtype=np.float32",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              description: "Row-major (default) or column-major layout — see Part J.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A fresh array with the requested shape and dtype; element values are uninitialized until you assign them.",
          },
          example: `import numpy as np

# reserve a results buffer, then overwrite every cell before reading it
buffer = np.empty(4, dtype=np.float64)
print("reserved:", buffer.shape, buffer.dtype, buffer.size)

for i in range(4):
    buffer[i] = (i + 1) ** 2

print("filled  :", buffer)
`,
          exampleOutput: `reserved: (4,) float64 4
filled  : [ 1.  4.  9. 16.]`,
          commonMistakes: [
            {
              mistake: "Assuming np.empty gives zeros.",
              why: "Beginners read 'empty' as 'emptied of values', i.e. zero. It means 'empty of promises': the memory is handed over as-is.",
              fix: "Want zeros? np.zeros. Want a fast scratch block you will fully overwrite? np.empty. There is no third meaning.",
            },
            {
              mistake: "Printing or saving an np.empty array before filling it.",
              why: "You will see plausible-looking numbers (old memory) and be tempted to reason about them. They are meaningless — and worse, they differ between runs, so a 'result' built on them is not reproducible.",
              fix: "Fill first (buf[:] = value or a loop that writes every cell), then read. If you catch yourself debugging uninitialized values, that is the bug.",
            },
            {
              mistake: "Choosing np.empty for speed in code that only partially fills the block.",
              why: "The speedup only pays when EVERY cell is overwritten. Half-filled empty buffers ship uninitialized values into your analysis — silently.",
              fix: "Default to np.zeros; switch to np.empty only with a comment saying why, when profiling justifies it (Part J).",
            },
          ],
          related: [
            { name: "np.zeros", relation: "The safe default: same allocation, plus a guaranteed zero-fill." },
            { name: "np.empty_like", relation: "Reserves an uninitialized block in the shape and dtype of an existing array." },
            { name: "np.full", relation: "When the 'uninitialized' phase would just be 'set every cell to one constant' anyway." },
          ],
          applications: [
            "Scratch buffers inside functions that overwrite every element before returning",
            "Preallocating output arrays for loops that fill them completely (measure first — Part J)",
            "Testing dtype/shape plumbing without paying for initialization",
          ],
          notes:
            "This card's example deliberately never prints the buffer before filling it — that is the usage rule in executable form. On freshly allocated memory np.empty often LOOKS like zeros, which is precisely why the mistake survives contact with beginners.",
        },
        {
          kind: "heading",
          text: "The _like family: copy my outfit",
        },
        {
          kind: "text",
          text: "Shapes change as code evolves. If you write `np.zeros((3, 4), dtype=np.float32)` next to an array that later becomes (3, 5), the two drift apart silently. The **_like family** fixes that: `np.zeros_like(a)`, `np.ones_like(a)`, `np.empty_like(a)`, and `np.full_like(a, value)` each build a new block **in the exact shape and dtype of `a`** — self-maintaining by construction. `full_like` also shows a fourth habit: it **inherits the dtype** unless you say otherwise, so `np.full_like(int_block, 2.5)` gives you integer 2s unless you pass a dtype. (One caveat: they copy shape and dtype, never the *values*.)",
        },
        {
          kind: "code",
          title: "Like this array, but blank",
          code: `import numpy as np

readings = np.full((2, 3), 21.5, dtype=np.float32)   # the template

zeros  = np.zeros_like(readings)      # same shape, same dtype, all 0.0
ones   = np.ones_like(readings)       # same shape, same dtype, all 1.0
sentinel = np.full_like(readings, -999.0)   # dtype inherited: -999 truncated? no --
                                          # float32 fill stays float32

print("template:", readings.shape, readings.dtype)
print("zeros   :", zeros.shape, zeros.dtype)
print("ones    :", ones.shape, ones.dtype)
print("sentinel:", sentinel, sentinel.dtype)

# Override the dtype when the mission differs:
ints = np.zeros_like(readings, dtype=np.int64)
print("ints    :", ints.shape, ints.dtype)
`,
          output: `template: (2, 3) float32
zeros   : (2, 3) float32
ones    : (2, 3) float32
sentinel: [[-999. -999. -999.]
 [-999. -999. -999.]] float32
ints    : (2, 3) int64`,
          outputNote: "Every _like result matches the template's shape (2, 3) and dtype (float32) — including full_like, whose fill value lands in the inherited float32. The dtype= override switches only the new block.",
          explain: [
            "`np.full_like(readings, -999.0)` — the fill is stored as float32 because the TEMPLATE is float32; that inheritance is the whole point of the family.",
            "`np.zeros_like(readings, dtype=np.int64)` — when the new block genuinely needs a different type, say so explicitly; the rest of the outfit is still copied.",
            "empty_like exists too, with np.empty's rule unchanged: reserve, fill, then read.",
          ],
        },
        {
          kind: "tryIt",
          title: "Order your own blank slates",
          task: "Run this, then: (1) predict the printout BEFORE running each line; (2) change the template to dtype=np.uint8 and watch every _like result follow; (3) build an all-True mask with np.ones_like; (4) break it on purpose once — np.zeros(3, 4) — and read the TypeError.",
          code: `import numpy as np

template = np.zeros((3, 5), dtype=np.int64)

zeros = np.zeros_like(template)
mask = np.ones_like(template, dtype=bool)
sentinel = np.full_like(template, -1)

print("zeros  :", zeros.shape, zeros.dtype)
print("mask   :", mask.shape, mask.dtype)
print("first  :", mask[:1], sentinel[:1])
`,
          hint: "The dtype= override on ones_like is how you turn an integer template into a boolean mask without restating the shape.",
        },
        {
          kind: "table",
          title: "Which blank slate, when",
          headers: ["You want", "Call", "Guaranteed contents"],
          rows: [
            ["A buffer starting at zero (the default instinct)", "`np.zeros(shape)`", "All zeros"],
            ["A counter or all-included mask", "`np.ones(shape, dtype=...)`", "All ones (or True)"],
            ["Any constant, stated in the call", "`np.full(shape, value)`", "All value"],
            ["Scratch you will fully overwrite", "`np.empty(shape)`", "NOTHING — uninitialized"],
            ["Any of the above, matching an array you hold", "`np.<maker>_like(a)`", "Same as the maker"],
          ],
          caption: "Five makers, one grammar: shape (or template) first, dtype at the counter, contents guaranteed — except empty, whose contents are guaranteed to be nobody's business.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Describe the shape, get the block: zeros and ones for the famous constants, full for any constant, empty for nothing-at-all (until you write). The _like cousins copy shape and dtype from a template array so your blocks can never drift out of sync.",
        },
      ],
      terms: [
        { term: "Shape-by-description", definition: "Creating an array by stating its shape tuple (and optional fill/dtype) instead of listing every value — the professional default for generated data." },
        { term: "Blank slate / buffer", definition: "An allocated array whose values will be written later; usually zeros, ones, or a sentinel at creation time." },
        { term: "Uninitialized memory (np.empty)", definition: "A freshly allocated block whose bytes are handed over as-is — undefined, not zero, not reproducible — until you write every cell." },
        { term: "_like family", definition: "zeros_like, ones_like, empty_like, full_like: blank slates that inherit the shape AND dtype of a template array." },
        { term: "Sentinel value", definition: "A constant written into a grid to mark a special state (e.g. -999.0 for 'sensor offline') until real data replaces it." },
      ],
      mistakes: [
        {
          mistake: "Calling np.zeros(3, 4) — shape as two arguments.",
          why: "NumPy reads positional arguments as (shape, dtype): the 4 is treated as a dtype and the call dies with TypeError: Cannot interpret '4' as a data type.",
          fix: "The shape is one tuple: np.zeros((3, 4)). Whenever you see that TypeError, you almost certainly forgot the inner parentheses.",
        },
        {
          mistake: "Trusting np.empty to contain zeros (or anything).",
          why: "'Empty' sounds like 'cleared'. It means the opposite: no initialization happened, so the values are whatever the memory last held — often zeros on a fresh interpreter, which is exactly what makes the bug survive testing.",
          fix: "np.zeros when you need defined values; np.empty only when every cell is written before any read, with a comment saying so.",
        },
        {
          mistake: "Being surprised by np.full's dtype: full((2, 2), 7) is int64.",
          why: "Without dtype=, the block takes the fill value's own type — the integer 7 makes an integer array, and 7.5 makes a float array.",
          fix: "Choose the literal to match the mission (7.0 for measurements) or pass dtype= explicitly. Same rule governs np.array inference from Part A.",
        },
      ],
      takeaways: [
        "Generated data starts with a shape description, not a typed list: np.zeros, np.ones, np.full — and the shape is always a tuple.",
        "The dtype you order at creation is the dtype you keep: say dtype= when integers, booleans or narrow types are the honest choice.",
        "np.empty is uninitialized, not zeroed: fill every cell before reading anything, or use np.zeros.",
        "The _like family inherits shape AND dtype from a template array, so related blocks cannot drift apart as code evolves.",
        "Default dtype for all blank-slate makers is float64 — every call site that wants something else should say so.",
      ],
      quiz: [
        {
          id: "b-01-q1",
          prompt: "`np.zeros((3, 4))` returns an array with dtype:",
          options: [
            { text: "int64 — zeros are whole numbers", correct: false, feedback: "Tempting, but zeros arrive as floats by default: the whole blank-slate family defaults to float64." },
            { text: "float64 — the default element type of every blank-slate maker", correct: true, feedback: "Correct: describe the shape, get float64 zeros; pass dtype=np.int64 (or anything else) to order differently." },
            { text: "bool — zeros read as False", correct: false, feedback: "A boolean zero-block exists (np.zeros(n, dtype=bool)) but it is something you must ask for, never the default." },
            { text: "It depends on available memory", correct: false, feedback: "Dtypes never depend on the machine's mood — the default is pinned by the library: float64." },
          ],
          explanation: "All describe-the-shape makers default to float64; the dtype is yours to choose at the counter.",
        },
        {
          id: "b-01-q2",
          prompt: "A teammate's function returns `np.empty(100)` and their code prints its sum before writing to it. What is the honest review comment?",
          options: [
            { text: "'Works fine — empty arrays are all zeros, so the sum is 0'", correct: false, feedback: "This is the classic misreading: empty means UNINITIALIZED. It often looks like zeros on a fresh interpreter — until the day it isn't." },
            { text: "'Bug: the array is uninitialized; sum it only after every element is written'", correct: true, feedback: "Exactly. Reading uninitialized memory is undefined behavior wearing a number's clothes." },
            { text: "'Bug: np.empty needs a dtype argument'", correct: false, feedback: "dtype is optional (default float64) — the problem here is reading before writing, not the signature." },
            { text: "'Just switch the sum to np.nansum'", correct: false, feedback: "NaN-handling sums are for missing data (Part H) — uninitialized memory is not NaN, it is undefined bytes." },
          ],
          explanation: "np.empty's contract: allocate, then fill, then read. Any read before the fill is a bug even when it happens to print 0.0.",
        },
        {
          id: "b-01-q3",
          prompt: "You hold `tpl = np.zeros((6, 10), dtype=np.uint8)` and need a float32 scratch grid of the same shape. The clearest call is:",
          options: [
            { text: "np.zeros_like(tpl)", correct: false, feedback: "That inherits uint8 along with the shape — the scratch grid would be one byte per element when you asked for float32." },
            { text: "np.zeros_like(tpl, dtype=np.float32)", correct: true, feedback: "Correct: the _like family copies the outfit, and dtype= swaps exactly the part you need different." },
            { text: "np.zeros((6, 10))", correct: false, feedback: "This works today and drifts tomorrow: if tpl ever changes shape, this line silently disagrees. It also needs the shape restated by hand." },
            { text: "np.empty(tpl)", correct: false, feedback: "Two problems: empty takes a shape, not an array; and it would be uninitialized besides." },
          ],
          explanation: "_like + dtype= is the self-maintaining form: shape inherited, dtype deliberately chosen, no shape literals to keep in sync.",
        },
      ],
    },

    // ------------------------------------------------------------- b-02
    {
      slug: "b-02",
      title: "Ranges: arange, linspace and Friends",
      minutes: 18,
      summary:
        "Counting numbers without typing them: np.arange for integer steps (and its float-step pitfall), np.linspace when you know HOW MANY values you want, logspace and geomspace for scales that multiply. Plus the reshape preview: one flat block, many grids.",
      kind: "concept",
      objectives: [
        "Build ranges with np.arange using one, two, or three arguments, including negative steps",
        "Explain the float-step pitfall and switch to np.linspace whenever the step is not an integer",
        "Use np.linspace with endpoint and retstep, and pick between arange/linspace by whether you know the step or the count",
        "Use np.logspace and np.geomspace for logarithmic and geometric scales",
        "Predict how a flat range refills row-major into 2-D shapes (the reshape preview)",
      ],
      why: "Half of all arrays in science are ranges: time axes, frequency sweeps, pixel coordinates, grid points for plots, epoch numbers for training loops. If your only tool is a typed list, every one of these is a chore and a typo risk; with the range family each is one call. But the family has a hidden cliff — np.arange with a float step produces a length that depends on accumulated floating-point error, and that bug appears in real dashboards as a graph that is one point short. Knowing when to say 'I know the step' (arange) versus 'I know how many' (linspace) is a permanent, load-bearing distinction, and the reshape preview at the end of this lesson is your first hands-on feel for the row-major fill order that Part C will make exact.",
      blocks: [
        {
          kind: "text",
          text: "Time steps. Frequencies. Pixel coordinates. Epoch numbers. Grid points for a plot. An enormous share of arrays in real work are *evenly spaced runs of numbers*, and typing them by hand is both miserable and typo-prone. NumPy gives you two machines for this, built around the two ways you can describe an even run: **name the gaps** (`np.arange`: start, stop, step — like Python's `range`, but returning an array) or **name the posts** (`np.linspace`: start, stop, and HOW MANY values, endpoints guaranteed).",
        },
        {
          kind: "heading",
          text: "np.arange: the counting machine",
        },
        {
          kind: "text",
          text: "`np.arange` takes one, two, or three numbers. One argument is the stop; two adds a start; three adds a step. The interval is **half-open** — start included, stop excluded — exactly like `range` and like every slice you will meet in Part D. That single convention explains most off-by-one surprises before they happen: `arange(5)` counts 0 through 4, and there is no 5 in it.",
        },
        {
          kind: "code",
          title: "One, two, three arguments (and going backwards)",
          code: `import numpy as np

print(np.arange(5))            # stop only: 0..4  (stop excluded)
print(np.arange(2, 10))        # start, stop
print(np.arange(2, 10, 3))     # start, stop, step
print(np.arange(10, 0, -3))    # negative step: counts DOWN toward 0
print(np.arange(1, 5, dtype=np.float32))  # dtype at the counter
`,
          output: `[0 1 2 3 4]
[2 3 4 5 6 7 8 9]
[2 5 8]
[10  7  4  1]
[1. 2. 3. 4.]`,
          outputNote: "Stop is never included. With step -3 the run counts down and stops before hitting 0 — same half-open rule, walking backwards.",
          explain: [
            "`np.arange(5)` — the default start is 0 and the default step is 1, exactly like range(5), but you get a real array.",
            "`np.arange(10, 0, -3)` — a negative step walks down; the run includes 10, 7, 4, 1 and stops before 0.",
            "`dtype=np.float32` — as with the blank-slate makers, the dtype can be ordered at the counter instead of converted later.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.arange",
          purpose: "Build an array of evenly spaced values from start (included) up to stop (excluded), moving by step.",
          signature: "np.arange([start, ]stop, [step, ]dtype=None, *, like=None)",
          purposeDetail:
            "np.arange is 'give me the integers 0 to n-1' and its cousins — the most-ordered range in computing, feeding array indexes, epoch counters, tick positions and coordinate axes. It mirrors Python's range but returns a packed array, and it accepts floats (with a warning you will meet below). The interval is half-open like every NumPy interval: start in, stop out. With an integer step the length is exactly (stop - start) / step rounded up — predictable. With a float step, the length can wobble by one element because of accumulated floating-point error; that is not a bug in your code, it is the reason np.linspace exists.",
          params: [
            {
              name: "start",
              type: "int or float",
              description: "First value of the run (included). Defaults to 0 when omitted.",
              example: "2",
            },
            {
              name: "stop",
              type: "int or float",
              required: true,
              description: "End of the half-open interval — NEVER included (except in rare float-step flukes, the pitfall below).",
              example: "10",
            },
            {
              name: "step",
              type: "int or float",
              description: "Spacing between values (default 1). May be negative to count down; the run then walks from start toward stop from above.",
              example: "3 or -0.5",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Element type. Inferred from the arguments when omitted (all ints -> int64; any float -> float64).",
              example: "dtype=np.float32",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A 1-D array of evenly spaced values, length ceil((stop - start) / step) — empty when start is unreachable from start toward stop.",
          },
          example: `import numpy as np

# the workhorse: index runs
print(np.arange(5))

# a countdown with a negative step
print(np.arange(10, 0, -3))

# when start is unreachable, you get an EMPTY array -- not an error
hopeless = np.arange(5, 1)        # stepping UP from 5 toward 1
print(hopeless, hopeless.size)
`,
          exampleOutput: `[0 1 2 3 4]
[10  7  4  1]
[] 0`,
          commonMistakes: [
            {
              mistake: "Expecting the stop value to appear (arange(0, 10) 'should' end at 10).",
              why: "The interval is half-open on purpose — it matches slicing (Part D) and makes lengths exact: arange(0, n) has exactly n elements.",
              fix: "Want the endpoint too? Pass stop + step for integer steps, or better: switch to np.linspace(0, 10, 11), where endpoints are guaranteed.",
            },
            {
              mistake: "Using a float step and trusting the length: np.arange(0, 1.1, 0.3).",
              why: "The length becomes ceil of a float division polluted by representation error (0.3 is not exactly 0.3 in binary). Sometimes you get the element you expected, sometimes you don't — a nondeterminism-shaped bug in deterministic clothing.",
              fix: "Float step -> np.linspace, always. arange is for integer steps.",
            },
            {
              mistake: "Writing np.arange(5, 1) or np.arange(0, 10, -1) and expecting an error.",
              why: "When stop lies in the wrong direction, arange returns an EMPTY array silently. Code downstream then computes on zero elements and produces empty results — the classic 'my plot vanished' bug.",
              fix: "Check .size when a range's emptiness is possible, and read negative-step code twice: the step sign must point from start toward stop.",
            },
          ],
          related: [
            { name: "np.linspace", relation: "The count-based machine: you say how many values, endpoints guaranteed — the right tool for float steps." },
            { name: "range", relation: "Python's built-in counterpart: lazy, integers only, no dtype control; np.arange is its array-returning sibling." },
            { name: "np.arange.reshape", relation: "The classic pairing: arange makes the values, reshape folds them into a grid (see the lab below)." },
          ],
          applications: [
            "Index runs and epoch counters: for epoch in np.arange(1, 21)",
            "Integer tick marks and category positions for plots",
            "The raw material for grids: np.arange(12).reshape(3, 4) (Part C makes reshaping a full subject)",
          ],
          notes:
            "The NumPy documentation itself says it: when the step is not an integer, linspace is usually what you actually want. Treat 'float step in arange' as a code smell to refactor on sight.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The float-step pitfall (see it once, recognize it forever)",
          text: "`np.arange(0, 1.1, 0.3)` LOOKS like it should end near 1.0 — but 0.3 cannot be stored exactly in binary, so the accumulated sum drifts, and the last element you 'obviously' expected may or may not survive the cutoff. The run below comes out four elements long; nudge the numbers slightly and you get a different length with no warning at all. The rule is absolute in this course: **integer steps -> arange; anything else -> linspace.**",
        },
        {
          kind: "code",
          title: "The pitfall and the empty surprise, verified",
          code: `import numpy as np

wobbly = np.arange(0, 1.1, 0.3)     # float step: length depends on
print("float-step run:", wobbly)    # accumulated binary error

# the honest fix: count the posts, not the gaps
posts = np.linspace(0, 1.2, 5)
print("linspace run  :", posts)

# and the silent emptiness: stop in the wrong direction
backwards = np.arange(0, 10, -1)
print("empty arange  :", backwards, " size:", backwards.size)
`,
          output: `float-step run: [0.  0.3 0.6 0.9]
linspace run  : [0.  0.3 0.6 0.9 1.2]
empty arange  : []  size: 0`,
          outputNote: "The float-step run stopped at 0.9 — the element near 1.2 that a decimal human expects is gone, eaten by representation error. The misdirected arange returns an empty array with size 0, not an error.",
          explain: [
            "0.3 in binary is 0.299999... — after three additions the running value sits just past 0.9, and the cutoff rule drops anything that would reach 1.1 or beyond.",
            "`np.linspace(0, 1.2, 5)` — when you want exactly 5 values from 0 to 1.2 inclusive, SAY that, and float error is not invited to the meeting.",
            "`np.arange(0, 10, -1)` — start 0, walking down, can never reach 10: the result is empty, and only .size tells you so.",
          ],
        },
        {
          kind: "heading",
          text: "np.linspace: count the fence posts, not the gaps",
        },
        {
          kind: "text",
          text: "Here is the mental picture that makes the choice automatic. A fence from your house to the lake: **arange describes the gaps** ('a post every 0.3 meters') and the number of posts is whatever falls out; **linspace describes the posts** ('exactly 50 posts, house to lake, both ends included') and the gap is whatever falls out. Scientific code knows the *count* far more often than the *gap* — 100 samples per second for 2 seconds, 256 frequency bins, 20 grid lines — so linspace is the range you will reach for most.",
        },
        {
          kind: "code",
          title: "linspace: endpoints guaranteed, step derivable",
          code: `import numpy as np

t = np.linspace(0.0, 1.0, 5)          # 5 posts from 0 to 1, BOTH included
print("posts      :", t)

# retstep=True returns (array, step) -- let linspace do the division
t2, step = np.linspace(0.0, 1.0, 5, retstep=True)
print("spacing    :", step)

# endpoint=False: n intervals instead of n posts (sample windows!)
left_edges = np.linspace(0.0, 1.0, 5, endpoint=False)
print("left edges :", left_edges)
`,
          output: `posts      : [0.   0.25 0.5  0.75 1.  ]
spacing    : 0.25
left edges : [0.  0.2 0.4 0.6 0.8]`,
          outputNote: "Five posts from 0 to 1 inclusive means a spacing of exactly 0.25 — which retstep hands back alongside the array. With endpoint=False the same call produces five interval STARTS: 0, 0.2, 0.4, ...",
          explain: [
            "`num=5` includes BOTH endpoints, so the gaps are (1 - 0) / (5 - 1) = 0.25 — count the gaps between posts, one fewer than the posts.",
            "`retstep=True` changes the return to a (array, step) pair — handy when downstream code needs the spacing but you want linspace to compute it.",
            "`endpoint=False` is the 'n intervals' flavor: perfect for bin left-edges and window starts, and the antidote when someone adds a phantom 1.0 to a time axis.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linspace",
          purpose: "Build an array of exactly num evenly spaced values from start to stop, with both endpoints included by default.",
          signature: "np.linspace(start, stop, num=50, endpoint=True, retstep=False, dtype=None, axis=0)",
          purposeDetail:
            "linspace is the range machine for floats, and the reason is arithmetic honesty: it computes each value from its position (start + i * (stop - start) / (num - 1)) rather than by repeated addition, so representation error cannot accumulate and the endpoints arrive EXACTLY as ordered. You specify the count — which is what scientific code almost always knows (samples per second, bins, grid lines) — and both endpoints are guaranteed. It is the default choice for time axes, parameter sweeps and any float run; arange stays king for integer steps.",
          params: [
            {
              name: "start",
              type: "array_like (scalar)",
              required: true,
              description: "The first value of the run (included).",
              example: "0.0",
            },
            {
              name: "stop",
              type: "array_like (scalar)",
              required: true,
              description: "The last value of the run — included unless endpoint=False.",
              example: "1.0",
            },
            {
              name: "num",
              type: "int",
              description: "How many values to generate (default 50). For n intervals with endpoints, ask for n + 1 posts.",
              example: "num=5",
            },
            {
              name: "endpoint",
              type: "bool",
              description: "When False, stop is excluded and the run becomes num evenly spaced interval starts — the bin-edges flavor.",
              example: "endpoint=False",
            },
            {
              name: "retstep",
              type: "bool",
              description: "When True, returns (values, step) so the spacing comes along for free.",
              example: "retstep=True",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Cast the result to this type after computing in float64 — computing first, casting second keeps the endpoints honest.",
              example: "dtype=np.float32",
            },
          ],
          returns: {
            type: "ndarray (or tuple with retstep=True)",
            description: "A 1-D array of num evenly spaced values from start to stop; with retstep=True, a (values, step) tuple.",
          },
          example: `import numpy as np

# a 2-second recording sampled 5 times: endpoints included
t = np.linspace(0.0, 2.0, 5)
print("time axis:", t)

# retstep: the spacing, computed by the machine that made the run
t2, dt = np.linspace(0.0, 2.0, 5, retstep=True)
print("spacing  :", dt)

# 5 interval starts instead of 5 posts
starts = np.linspace(0.0, 2.0, 5, endpoint=False)
print("starts   :", starts)
`,
          exampleOutput: `time axis: [0.  0.5 1.  1.5 2. ]
spacing  : 0.5
starts   : [0.  0.4 0.8 1.2 1.6]`,
          commonMistakes: [
            {
              mistake: "Forgetting the endpoints are INCLUDED and building n bins with num=n.",
              why: "5 posts from 0 to 1 span only 4 gaps; if you wanted 5 intervals of 0.2 each, the posts must be 6 — or use endpoint=False.",
              fix: "Say it in fence language before typing: posts or intervals? intervals -> endpoint=False, posts -> num = intervals + 1.",
            },
            {
              mistake: "Computing the step yourself and feeding it to arange instead.",
              why: "hand-computed 0.25 as an arange step re-introduces the float-accumulation problem linspace was designed to avoid.",
              fix: "Let retstep=True give you the spacing, or np.diff(t)[0] — but generate the values with linspace.",
            },
            {
              mistake: "Expecting an error from num=0 or num=1.",
              why: "num=0 gives an empty array; num=1 gives just the start value (there is no span to divide). Both are silent.",
              fix: "Sanity-check num when it is computed rather than typed — an off-by-one in a loop bound becomes an axis with one point.",
            },
          ],
          related: [
            { name: "np.arange", relation: "The step-based sibling: use it for integer steps, linspace for everything else." },
            { name: "np.logspace / np.geomspace", relation: "The same count-based grammar on multiplicative scales (below)." },
            { name: "np.diff", relation: "Recovers the step from an existing run: diff(t) gives every gap between neighbors." },
          ],
          applications: [
            "Time axes: np.linspace(0, duration, n_samples) for evenly sampled recordings",
            "Parameter sweeps: 100 settings of a threshold from 0.0 to 1.0, endpoints guaranteed",
            "Plot grids: x = np.linspace(-5, 5, 200) before y = f(x) — the bread and butter of every figure ever plotted",
          ],
          notes:
            "linspace computes in full precision and casts at the end, so even dtype=np.float32 keeps its endpoints as close as float32 allows — another reason it beats hand-rolled arange loops.",
        },
        {
          kind: "heading",
          text: "logspace and geomspace: when steps multiply",
        },
        {
          kind: "text",
          text: "Some scales do not add — they multiply. Octaves double. Decibels step by factors. A learning-rate sweep tries 0.1, 0.01, 0.001. For those, two siblings extend the linspace grammar: **`np.logspace(first, last, num)`** spaces the *exponents* evenly (it takes POWERS of 10: logspace(1, 3, 3) gives 10, 100, 1000), and **`np.geomspace(start, stop, num)`** spaces actual *values* evenly on a multiplicative ruler (geomspace(1, 256, 9) gives the eight octaves: 1, 2, 4, ... 256). Use logspace when you think in exponents; geomspace when you think in values.",
        },
        {
          kind: "code",
          title: "Rulers that multiply",
          code: `import numpy as np

print("logspace  :", np.logspace(1, 3, 3))      # exponents 1..3: 10, 100, 1000
print("octaves   :", np.geomspace(1, 256, 9))   # 8 doublings, 9 posts
print("learning  :", np.geomspace(1e-3, 1e-1, 3))  # 0.001, 0.01, 0.1
`,
          output: `logspace  : [  10.  100. 1000.]
octaves   : [  1.   2.   4.   8.  16.  32.  64. 128. 256.]
learning  : [0.001 0.01  0.1  ]`,
          outputNote: "logspace's arguments are EXPONENTS — 1 to 3 means ten to ten-cubed. geomspace takes real values and spaces them by a constant ratio: each number here is double the previous one.",
          explain: [
            "`np.logspace(1, 3, 3)` — three posts where the EXPONENTS 1, 2, 3 are evenly spaced: 10^1, 10^2, 10^3.",
            "`np.geomspace(1, 256, 9)` — nine posts from 1 to 256 with a constant ratio of 2: the piano of octaves.",
            "For sweeps like 0.001 to 0.1, geomspace reads naturally; logspace(-3, -1, 3) gives the same three values but asks you to think in exponents.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.geomspace",
          purpose: "Build an array of exactly num values from start to stop where each value is the previous times a constant ratio.",
          signature: "np.geomspace(start, stop, num=50, endpoint=True, dtype=None, axis=0)",
          purposeDetail:
            "geomspace is linspace for multiplicative scales. Equal ratios instead of equal differences: 1, 2, 4, 8 is 'evenly spaced' to a musician, a frequency sweep, or a learning-rate search. You state real start and stop values (not exponents), and it guarantees both endpoints while making every step the same factor. It is the least surprising of the two logarithmic range makers — you read start and stop directly — and it handles the sign edge cases (both negative, or crossing zero) that hand-rolled pow(ratio, i) loops get wrong.",
          params: [
            {
              name: "start",
              type: "array_like (scalar)",
              required: true,
              description: "The first value (included). Its sign pairs with stop's: both positive, both negative, or either may be zero with special handling.",
              example: "1.0",
            },
            {
              name: "stop",
              type: "array_like (scalar)",
              required: true,
              description: "The last value (included unless endpoint=False).",
              example: "256.0",
            },
            {
              name: "num",
              type: "int",
              description: "How many values to generate (default 50).",
              example: "num=9",
            },
            {
              name: "endpoint",
              type: "bool",
              description: "When False, stop is excluded and the run becomes num interval starts on the multiplicative ruler.",
              example: "endpoint=False",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Element type of the result (computed in float precision, cast at the end).",
              example: "dtype=np.float64",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A 1-D array of num values with a constant ratio between neighbors, from start to stop.",
          },
          example: `import numpy as np

# eight octaves of a frequency sweep
octaves = np.geomspace(1, 256, 9)
print(octaves)

# a learning-rate ladder: 0.001 -> 0.1 in constant factors
lrs = np.geomspace(1e-3, 1e-1, 3)
print(lrs)
`,
          exampleOutput: `[  1.   2.   4.   8.  16.  32.  64. 128. 256.]
[0.001 0.01  0.1  ]`,
          commonMistakes: [
            {
              mistake: "Reaching for linspace on a multiplicative scale.",
              why: "np.linspace(1, 256, 9) gives 1, 32.9, 64.75, ... — arithmetic steps that are 'even' to nobody who thinks in octaves or factors.",
              fix: "Ask 'is the NEXT value the previous PLUS something, or TIMES something?' Times -> geomspace (or logspace).",
            },
            {
              mistake: "Passing exponents to geomspace (the logspace habit).",
              why: "geomspace(1, 3, 3) politely gives 1.0, 1.73, 3.0 — the values between 1 and 3 — not 10, 100, 1000.",
              fix: "geomspace takes values; logspace takes exponents. If you catch yourself typing powers, you wanted logspace.",
            },
            {
              mistake: "geomspace across zero: np.geomspace(-1, 1, 5).",
              why: "A constant ratio cannot walk through zero, and mixing signs has no continuous geometric path; NumPy returns NaN values in the run.",
              fix: "Build the two sides separately (negative side, positive side) and concatenate (np.concatenate, Part C), or re-express the sweep additively.",
            },
          ],
          related: [
            { name: "np.logspace", relation: "The exponent-flavored sibling: you specify powers of a base — natural when your field speaks in decades or dB." },
            { name: "np.linspace", relation: "The additive ruler: constant differences instead of constant ratios." },
            { name: "np.geomspace endpoint=False", relation: "The interval-starts flavor, same as linspace's — for log-spaced bin edges." },
          ],
          applications: [
            "Frequency and audio sweeps (octaves), wavelength ladders, filter cutoff candidates",
            "Hyperparameter searches: learning rates, regularization strengths over orders of magnitude",
            "Log-scale plot ticks and histogram edges for long-tailed data (Part H uses them for binning)",
          ],
          notes:
            "np.logspace(start_exp, stop_exp, num) = 10 ** np.linspace(start_exp, stop_exp, num) with the same endpoint guarantees; geomspace is equivalent when you express start and stop as matching powers of your ratio.",
        },
        {
          kind: "heading",
          text: "Preview: one flat run, many grids",
        },
        {
          kind: "text",
          text: "Ranges arrive flat, but the world is rectangular. The bridge is `reshape` — Part C's full subject, previewed here because `arange` + `reshape` is the single most idiomatic way to make a numbered grid. The one fact you need today: **NumPy refills row-major** — across the first row left to right, then the next row — the same last-axis-fastest order you met in Lesson a-04's flat block. The lab below hands you `np.arange(12)` and four shapes; watch which number lands where.",
        },
        {
          kind: "arrayViz",
          title: "The reshape lab — same numbers, four grids",
          mode: "reshape",
          name: "a",
          caption:
            "np.arange(12) refilled as [12], [3, 4], [4, 3] and [2, 6]. Switch shapes and trace the fill order: values pour in row by row (last axis fastest), so flat position 4 is always the number 4 no matter which cell it lands in. Reshape moves NO data — it changes the walking rule over the same block (Lesson a-04).",
          data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          targets: [[12], [3, 4], [4, 3], [2, 6]],
        },
        {
          kind: "code",
          title: "arange + reshape: the idiomatic pair",
          code: `import numpy as np

run = np.arange(12)            # the flat material: 0..11

grid_a = run.reshape(3, 4)     # 3 rows x 4 cols
grid_b = run.reshape(4, 3)     # same numbers, different walking rule
grid_c = run.reshape(2, 6)

print(grid_a)
print(grid_b)
print("same data underneath:", np.array_equal(grid_a.ravel(), grid_b.ravel()))
`,
          output: `[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
[[ 0  1  2]
 [ 3  4  5]
 [ 6  7  8]
 [ 9 10 11]]
same data underneath: True`,
          outputNote: "All three grids hold the identical twelve numbers in the identical row-major order — only the shape (the walking rule) differs, which is why the raveled comparison is True.",
          explain: [
            "`run.reshape(3, 4)` — the values refill row by row: 0, 1, 2, 3 across the first row, then 4, 5, 6, 7.",
            "`run.reshape(4, 3)` — the same block walked three-at-a-time: the 3 that ended row 0 now starts row 1.",
            "The shapes must multiply to the run's length — 12 elements fold into (3, 4), (4, 3), (2, 6), (12,), and Part C adds -1 for 'you figure out this axis'.",
          ],
        },
        {
          kind: "table",
          title: "Which range machine, when",
          headers: ["You know the...", "Call", "Endpoints", "Watch out for"],
          rows: [
            ["Integer step (indexes, epochs)", "`np.arange(start, stop, step)`", "stop excluded", "Silent EMPTY array when the step points the wrong way"],
            ["Count, additive scale (time axes, sweeps)", "`np.linspace(start, stop, num)`", "both included (default)", "Posts vs intervals: n intervals needs num = n + 1, or endpoint=False"],
            ["Count, in exponents (decades, dB)", "`np.logspace(e1, e2, num)`", "both included", "Arguments are EXPONENTS, not values"],
            ["Count, in values that multiply (octaves, lrs)", "`np.geomspace(a, b, num)`", "both included", "Cannot cross zero — constant ratios don't pass through it"],
          ],
          caption: "One question picks the tool: do you know the gaps (arange, integers only) or the count (linspace and its logarithmic cousins)?",
        },
        {
          kind: "tryIt",
          title: "Run your own ranges",
          task: "Press Run, then: (1) predict each line before you see it; (2) change the linspace to 7 posts and say the new spacing out loud BEFORE rerunning; (3) make an empty arange on purpose (start 10, stop 0, step 1) and print its size; (4) reshape the countdown np.arange(12, 0, -1) to (3, 4) and check the fill order.",
          code: `import numpy as np

print(np.arange(0, 30, 5))
print(np.linspace(0, 1, 5))
print(np.geomspace(10, 1000, 3))

run = np.arange(12, 0, -1)
print(run.reshape(3, 4))
`,
          hint: "Fence language: arange names the gaps (5), linspace names the posts (5 of them, 0 to 1 inclusive, so 0.25 apart).",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Name the gaps for integers (arange, stop excluded, beware float steps and silent empties); name the posts for everything else (linspace, endpoints guaranteed; logspace/geomspace when the ruler multiplies). Fold any flat run into a grid with reshape — row-major, no data moved.",
        },
      ],
      terms: [
        { term: "Half-open interval", definition: "A run that includes its start and excludes its stop — arange(0, 10) gives ten values ending at 9. The convention behind ranges and slices alike." },
        { term: "Float-step pitfall", definition: "np.arange with a non-integer step produces a length that depends on accumulated binary representation error — refactor to linspace on sight." },
        { term: "Posts vs intervals (endpoint/retstep)", definition: "linspace counts posts with both ends included; endpoint=False counts interval starts instead; retstep=True also returns the computed spacing." },
        { term: "Geometric progression", definition: "A run where each value is the previous times a constant ratio — geomspace's specialty (octaves, learning-rate ladders)." },
        { term: "Row-major fill order", definition: "The refill order of reshape: across the first row, then the next — the last axis changes fastest, matching the flat block underneath." },
      ],
      mistakes: [
        {
          mistake: "Using np.arange with a float step (0.1, 0.25, 0.3) and trusting the element count.",
          why: "Floats cannot represent most decimal steps exactly; the accumulated sum drifts and the cutoff swallows (or admits) a final element unpredictably.",
          fix: "The absolute rule: integer steps -> arange; any other step -> linspace with num. You know the count anyway.",
        },
        {
          mistake: "Expecting np.arange(5, 1) to raise an error.",
          why: "When stop lies in the wrong direction for the step, arange returns an EMPTY array. Downstream code then happily computes sums and means of nothing, producing empty or NaN results instead of crashing.",
          fix: "Treat .size == 0 as a checked condition wherever a range's inputs are computed rather than typed — and double-check the sign of negative steps.",
        },
        {
          mistake: "Building n bins with np.linspace(a, b, n) and getting intervals that don't match.",
          why: "n posts span n - 1 intervals. The sweep 'looks right' but every edge is off by a fraction of a bin.",
          fix: "Fence language first: posts -> num = intervals + 1; interval starts -> endpoint=False. Both appear in the verified example above.",
        },
      ],
      takeaways: [
        "arange mirrors range: half-open, integer steps, stop excluded — and returns an array, not a lazy iterator.",
        "A float step in arange is a bug with a delay: switch to linspace, where you name the count and both endpoints are exact.",
        "linspace is the scientist's default: time axes, sweeps, plot grids; endpoint=False for interval starts, retstep=True for the spacing.",
        "Multiplicative scales get logspace (think in exponents) or geomspace (think in values) — never a hand-typed list of round numbers.",
        "arange + reshape builds numbered grids idiomatically: values refill row-major, and the flat block underneath never changes.",
      ],
      quiz: [
        {
          id: "b-02-q1",
          prompt: "You need exactly 101 values from 0.0 to 1.0 inclusive (a fine plot axis). The professional call is:",
          options: [
            { text: "np.arange(0, 1, 0.01)", correct: false, feedback: "The float-step pitfall: 0.01 is not exact in binary, so the length wobbles — and this run stops short of 1.0 even on a good day." },
            { text: "np.linspace(0.0, 1.0, 101)", correct: true, feedback: "Correct: name the count, get both endpoints exactly — 101 posts spanning 100 intervals of 0.01." },
            { text: "np.linspace(0.0, 1.0, 100)", correct: false, feedback: "100 posts span only 99 intervals — a hundredth of a bin off everywhere. The off-by-one here is the lesson." },
            { text: "np.arange(0, 1.01, 0.01)", correct: false, feedback: "Closer, but still the float-step trap: whether 1.0 survives the cutoff depends on accumulated error, not on your intent." },
          ],
          explanation: "Counts and endpoints are what you know — linspace is the machine built for exactly that contract.",
        },
        {
          id: "b-02-q2",
          prompt: "What does `np.arange(10, 0, -3)` return?",
          options: [
            { text: "An error: you cannot count down with arange", correct: false, feedback: "Negative steps are fully supported — they walk from start toward stop from above." },
            { text: "[10, 7, 4, 1] — half-open, walking down", correct: true, feedback: "Right: start 10 included, step -3, stop 0 excluded — the run halts at 1, the last value above 0." },
            { text: "[10, 7, 4, 1, -2] — it continues past the stop", correct: false, feedback: "The half-open rule holds in both directions: nothing at or beyond the stop survives." },
            { text: "[] — an empty array, since 10 is greater than 0", correct: false, feedback: "Emptiness happens when the step points AWAY from stop. Here step -3 points from 10 toward 0, so the run is well-formed." },
          ],
          explanation: "arange(10, 0, -3) counts down by threes and stops before reaching 0: 10, 7, 4, 1.",
        },
        {
          id: "b-02-q3",
          prompt: "A sweep of learning rates '0.001 to 0.1, five steps, each a constant factor apart' should be built with:",
          options: [
            { text: "np.linspace(0.001, 0.1, 5)", correct: false, feedback: "That spaces ADDITIVELY: 0.001, 0.026, 0.051, ... — even to nobody shopping for learning rates." },
            { text: "np.geomspace(0.001, 0.1, 5)", correct: true, feedback: "Correct: constant ratio between neighbors, endpoints exact — the multiplicative ruler." },
            { text: "np.arange(0.001, 0.1, 0.025)", correct: false, feedback: "Float step (pitfall), additive spacing (wrong ruler), and a step that ignores the 'constant factor' requirement entirely." },
            { text: "np.logspace(0.001, 0.1, 5)", correct: false, feedback: "logspace takes EXPONENTS — this would produce values around 10**0.001, roughly 1.0, not anything near 0.001." },
          ],
          explanation: "'Each a constant factor apart' is the signature of a geometric progression — geomspace's whole job.",
        },
      ],
    },

    // ------------------------------------------------------------- b-03
    {
      slug: "b-03",
      title: "Special Matrices and Grids",
      minutes: 14,
      summary:
        "Some grids are so famous they have one-call recipes: identities (np.eye), diagonals (np.diag — which builds AND extracts), coordinate meshes (np.meshgrid, the reason ML can evaluate functions over whole planes), triangles, and a taste of Vandermonde.",
      kind: "concept",
      objectives: [
        "Build identity and shifted-diagonal matrices with np.eye (and know when np.identity spells it shorter)",
        "Use np.diag in both directions: build a matrix from a vector, extract a diagonal from a matrix",
        "Explain what np.meshgrid returns and why evaluating f(x, y) over a plane needs it",
        "Zero the upper or lower triangle of a matrix with np.triu / np.tril (and build masks with np.tri)",
        "Recognize a Vandermonde matrix as polynomial features when you see one",
      ],
      why: "Linear algebra classes hand you identity matrices and diagonal matrices as if they were exotic; in array code they are Tuesday. Inverting a system needs an identity to aim at (Part K territory), shifted identities shift a signal by one position in one call — the entire basis of time-series lag features — and triangular masks keep only one half of a symmetric table (think correlation or distance matrices, where the other half is a mirror). And np.meshgrid is quietly underneath a large share of machine learning: to evaluate a model's error over a plane of parameter settings, or a function over a 2-D region, you need every (x, y) combination as full coordinate grids. These one-call recipes replace loops that beginners write by hand — badly — every day.",
      blocks: [
        {
          kind: "text",
          text: "A handful of grids are so famous that NumPy builds them in one call. You met `np.array` (your data), the blank slates (your buffers), and the ranges (your axes). This lesson adds the **named shapes of linear algebra**: the identity, the diagonal, the triangle — plus the one grid-maker that is less about algebra and more about *combinations*: `np.meshgrid`, the coordinate machine that lets you evaluate a function over an entire plane at once.",
        },
        {
          kind: "heading",
          text: "eye and identity: ones on the diagonal",
        },
        {
          kind: "text",
          text: "`np.eye(N)` is the N x N **identity matrix** — ones down the main diagonal, zeros everywhere, the multiplicative neutral element of matrices (A @ I is A). Two dials make it more than a statue: `M` makes it rectangular (N x M), and `k` slides the diagonal band up (positive) or down (negative). That shifted band is secretly a *shift operator*: `np.eye(4, k=1)` has exactly the geometry of 'move every element one step along' — the trick behind building lag features from a series. `np.identity(n)` is simply `eye(n)` with no dials — the plain square version, spelled for readability.",
        },
        {
          kind: "code",
          title: "Identity, shifted and rectangular",
          code: `import numpy as np

print(np.eye(3), "\\n")               # the classic: 3x3 identity, float64
print(np.eye(3, k=1), "\\n")          # band slid UP one: the shift matrix
print(np.eye(2, 4, k=-1))            # rectangular, band slid DOWN one
`,
          output: `[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]

[[0. 1. 0.]
 [0. 0. 1.]
 [0. 0. 0.]]

[[0. 0. 0. 0.]
 [1. 0. 0. 0.]]`,
          outputNote: "The double \\n in the prints just separates the matrices with a blank line. Note the dtype: eye defaults to float64 — pass dtype=np.int64 when you want integer ones.",
          explain: [
            "`np.eye(3)` — ones where row index equals column index: the do-nothing matrix of multiplication.",
            "`np.eye(3, k=1)` — the ones moved to the superdiagonal; matrix-multiplying a series by this shifts it by one position (Part H shows the @ in anger).",
            "`np.eye(2, 4, k=-1)` — shape first (2 rows, 4 columns), then the shift: the band enters one row below the main diagonal.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.eye",
          purpose: "Build a 2-D matrix with ones on a diagonal band (the main diagonal by default) and zeros everywhere else.",
          signature: "np.eye(N, M=None, k=0, dtype=float, order=\"C\", *, like=None)",
          purposeDetail:
            "np.eye is the identity matrix with two extra dials, and both dials matter in practice. M makes it rectangular — an N x M band you can lay inside a bigger structure. k slides the band off the main diagonal, and a shifted band is a shift operator: multiplying by eye(N, k=1) moves every element one position along — the one-line recipe behind lagged features in time-series work. With k=0 and a square shape it is the identity, the matrix that leaves others unchanged under multiplication.",
          params: [
            {
              name: "N",
              type: "int",
              required: true,
              description: "Number of rows.",
              example: "3",
            },
            {
              name: "M",
              type: "int or None",
              description: "Number of columns; defaults to N for a square matrix.",
              example: "4",
            },
            {
              name: "k",
              type: "int",
              description: "Diagonal offset: 0 is the main diagonal, positive k slides the band up, negative k slides it down.",
              example: "k=1",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "Element type; default float64. Pass np.int64 or bool when the ones must be integers or True values.",
              example: "dtype=np.int64",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A shape (N, M) array of zeros with ones along the k-th diagonal.",
          },
          example: `import numpy as np

I3 = np.eye(3)
print(I3, I3.dtype)

# a boolean mask with True on the diagonal -- handy for "keep self" logic
self_mask = np.eye(4, dtype=bool)
print(self_mask)

# the shift matrix: ones one step above the main diagonal
shift = np.eye(4, k=1, dtype=np.int64)
print(shift)
`,
          exampleOutput: `[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]] float64
[[ True False False False]
 [False  True False False]
 [False False  True False]
 [False False False  True]]
[[0 1 0 0]
 [0 0 1 0]
 [0 0 0 1]
 [0 0 0 0]]`,
          commonMistakes: [
            {
              mistake: "Forgetting eye's default dtype is float64 and comparing with == against integer arrays.",
              why: "1.0 == 1 is True in Python, so equality survives — but memory doubles and downstream integer arithmetic (Part F) will promote to float without warning.",
              fix: "State the dtype when the ones mean integers or booleans: np.eye(3, dtype=bool) for masks, np.int64 for integer algebra.",
            },
            {
              mistake: "Reading the k shift backwards: expecting k=1 to move the band DOWN.",
              why: "The convention mirrors indexing: k is the column offset, so positive k lands one column to the RIGHT — visually up.",
              fix: "Say it as 'k=1: ones at [i, i+1]' — row i, column i plus k. One index expression beats two mental pictures.",
            },
            {
              mistake: "Using np.identity when you needed the dials (or vice versa).",
              why: "np.identity(n) has NO M or k parameters — it is only ever the plain square identity.",
              fix: "Plain identity for readability, np.eye the moment you need rectangular or shifted.",
            },
          ],
          related: [
            { name: "np.identity", relation: "The no-dials spelling of eye(n): plain square identity, maximum readability." },
            { name: "np.diag", relation: "Builds a matrix from an arbitrary diagonal VECTOR (not just ones) — and extracts diagonals too." },
            { name: "np.tri / np.triu / np.tril", relation: "The triangle family: ones/zeros below or above the diagonal instead of a thin band." },
          ],
          applications: [
            "The identity target in matrix inversion and solving (A @ inv(A) should approach I)",
            "Shift operators: multiplying by eye(N, k=1) lags a series by one step",
            "Boolean self-masks: eye(n, dtype=bool) marks 'the diagonal cells' — e.g. excluding self-pairs from nearest-neighbor logic",
          ],
          notes:
            "eye vs identity is purely readability: np.identity(n) == np.eye(n) value-for-value. The eye form is what you will see in most real code because the dials are usually wanted sooner or later.",
        },
        {
          kind: "heading",
          text: "diag: the two-way door",
        },
        {
          kind: "text",
          text: "`np.diag` is the only function in this lesson that runs in **both directions**. Hand it a 1-D vector and it *builds* a square matrix with that vector on the diagonal. Hand it a 2-D matrix and it *extracts* the diagonal back out as a 1-D vector. Same name, opposite jobs — NumPy picks the direction from your input's number of dimensions, and `k` slides which diagonal in either direction. If that feels reckless, it is at least symmetrical: `np.diag(np.diag(m))` keeps exactly the diagonal of m and zeros the rest.",
        },
        {
          kind: "code",
          title: "Build it, extract it, shift it",
          code: `import numpy as np

m = np.diag([1, 2, 3])          # 1-D in  -> matrix built on the diagonal
print(m, "\\n")

d = np.diag(m)                  # 2-D in  -> diagonal extracted back out
print("extracted:", d)

print("offset k=1 :", np.diag(m, k=1))    # the band ABOVE the diagonal

print("round trip :", np.diag(d).tolist() == m.tolist())
`,
          output: `[[1 0 0]
 [0 2 0]
 [0 0 3]]

extracted: [1 2 3]
offset k=1 : [0 0]
round trip : True`,
          outputNote: "Direction follows dimensionality: 1-D input builds up, 2-D input extracts. The k=1 extraction of diag([1,2,3]) is empty-of-ones — the superdiagonal of this matrix is all zeros.",
          explain: [
            "`np.diag([1, 2, 3])` — the vector becomes the main diagonal; every other cell is 0 (int64 here, following the input's type).",
            "`np.diag(m)` — passing the matrix back extracts [1, 2, 3]. The two-way door in one breath.",
            "`np.diag(m, k=1)` — extracts the superdiagonal instead: the zeros sitting above [1, 2, 3].",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.diag",
          purpose: "Two-way diagonal tool: build a square matrix with a vector on its diagonal, or extract a diagonal from a matrix.",
          signature: "np.diag(v, k=0)",
          purposeDetail:
            "Diagonals are where square matrices keep their most interesting numbers — eigenvalues live there in triangular form, scale factors live there in pure scaling matrices, and 'keep only the diagonal' (a model's per-feature variances, a graph's self-connections) is a daily operation. np.diag covers both directions of the street: vector in, matrix out; matrix in, vector out. The k argument slides which diagonal, with the same sign convention as np.eye. The composition np.diag(np.diag(m)) is a readable recipe for 'm with everything off-diagonal zeroed'.",
          params: [
            {
              name: "v",
              type: "array_like",
              required: true,
              description: "A 1-D array (build direction: it becomes the k-th diagonal of a new square matrix) OR a 2-D array (extract direction: its k-th diagonal is returned).",
              example: "[1, 2, 3] or matrix",
            },
            {
              name: "k",
              type: "int",
              description: "Which diagonal: 0 main, positive above (superdiagonal), negative below (subdiagonal). Same sign convention as np.eye's k.",
              example: "k=-1",
            },
          ],
          returns: {
            type: "ndarray",
            description: "Build direction: a 2-D square matrix. Extract direction: a 1-D array of the diagonal's values.",
          },
          example: `import numpy as np

# BUILD: a per-axis scaling matrix (diag of scale factors)
scales = np.diag([2.0, 3.0, 4.0])
print(scales, "\\n")

# EXTRACT: pull the diagonal back out of a data matrix
readings = np.array([[9.1, 8.7, 7.2],
                     [1.0, 5.5, 3.3],
                     [4.4, 2.2, 6.6]])
print("main diagonal :", np.diag(readings))
print("superdiagonal :", np.diag(readings, k=1))
`,
          exampleOutput: `[[2. 0. 0.]
 [0. 3. 0.]
 [0. 0. 4.]]

main diagonal : [9.1 5.5 6.6]
superdiagonal : [8.7 3.3]`,
          commonMistakes: [
            {
              mistake: "Expecting diag to EXTRACT when you passed a vector (or vice versa).",
              why: "The direction is decided by the input's dimensionality, silently. np.diag(v) where v was meant as 'the matrix' builds a surprising new matrix instead.",
              fix: "Read the call aloud with the input's shape: 'diag of a vector builds; diag of a matrix extracts.' If both directions are possible in your code, assert v.ndim first.",
            },
            {
              mistake: "Assuming np.diag zeroes a matrix's off-diagonal in place.",
              why: "np.diag(np.diag(m)) builds a NEW matrix; m itself is untouched. Functions here return; they do not edit your inputs.",
              fix: "Assign the result: m = np.diag(np.diag(m)) — or better, name it: diagonal_only = np.diag(np.diag(m)).",
            },
            {
              mistake: "Reading np.diag(m, k=1) as 'the diagonal, then shifted by one element'.",
              why: "k picks a DIFFERENT diagonal band of the same matrix — the cells at [i, i+1] — not a shifted slice of the main one.",
              fix: "Say the index rule: k-th diagonal = cells [i, i + k]. Positive k looks up-and-right.",
            },
          ],
          related: [
            { name: "np.eye", relation: "The special case where the diagonal vector is all ones — with dials for size and shift." },
            { name: "ndarray.diagonal", relation: "The method form of extraction (m.diagonal(k=1)); the function and method agree." },
            { name: "np.trace", relation: "The sum of the diagonal — what you reach for when the diagonal was only a means to a total." },
          ],
          applications: [
            "Per-feature scale or variance matrices: diag of a vector turns per-axis numbers into a linear-algebra object",
            "Pulling self-pairs out of pairwise tables (distance, similarity): the diagonal of a distance matrix is the zeros of self-distance",
            "Keeping only the diagonal of a computed matrix (e.g. per-class variances from a covariance-like intermediate)",
          ],
          notes:
            "For large square matrices, np.diag(m) is a view-like extraction — cheap. The build direction always allocates the full square block, so a diagonal matrix with millions of rows takes memory proportional to N squared; scipy sparse is the real tool at that scale.",
        },
        {
          kind: "heading",
          text: "meshgrid: the coordinate machine",
        },
        {
          kind: "text",
          text: "Here is a question that hides in a remarkable amount of ML: *'evaluate this function at every combination of these x values and these y values.'* A heat map over a parameter plane. A model's prediction surface. A physics field over a region. The combinations form a grid — but your axes arrive as two flat lists. `np.meshgrid(x, y)` expands them into two full coordinate grids: `X` holds every point's x-coordinate, `Y` holds every point's y-coordinate, aligned cell for cell. Feed both into any element-wise formula (Part F's vectorized expressions) and you have evaluated it over the whole plane, no loops. That is why ML loves meshgrid: **gradients over parameter planes, decision boundaries over feature planes, anything-over-anything — one call, then arithmetic.**",
        },
        {
          kind: "code",
          title: "Every combination, evaluated at once",
          code: `import numpy as np

xs = np.array([0.0, 1.0, 2.0])     # 3 x-positions
ys = np.array([3.0, 4.0])          # 2 y-positions

X, Y = np.meshgrid(xs, ys)         # the coordinate grids

print("X =", X, "\\n")              # each point's x-coordinate
print("Y =", Y, "\\n")              # each point's y-coordinate

# any element-wise formula now runs over the whole plane:
Z = X + Y
print("Z =", Z)
`,
          output: `X = [[0. 1. 2.]
 [0. 1. 2.]]

Y = [[3. 3. 3.]
 [4. 4. 4.]]

Z = [[3. 4. 5.]
 [4. 5. 6.]]`,
          outputNote: "X repeats xs down its rows and Y repeats ys across its columns; aligned cell for cell, they enumerate all 3 x 2 = 6 combinations. Z = X + Y evaluated everywhere without a single loop.",
          explain: [
            "X is (2, 3): one row per y value, one column per x value — every cell knows its x.",
            "Y is the partner: every cell knows its y. Neither grid alone is enough; together they name every point of the plane.",
            "`Z = X + Y` — element-wise addition (Part F's bread and butter) turns two coordinate grids into function values over the plane. Swap in X**2 + Y**2 or any model and the picture is a heat map.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.meshgrid",
          purpose: "Expand flat coordinate axes into full coordinate grids, so element-wise formulas can run over every combination at once.",
          signature: "np.meshgrid(*xi, copy=True, sparse=False, indexing=\"xy\")",
          purposeDetail:
            "meshgrid is the bridge between 'I have axes' and 'I have a plane'. Given 1-D arrays of x values and y values, it returns 2-D grids holding every point's coordinates, aligned cell for cell — the raw material for evaluating functions, models and errors over entire regions. It is the standard first line of heat maps, contour plots, decision-boundary visualizations and parameter sweeps. With more input arrays it generalizes to 3-D and beyond. The indexing mode matters: the default 'xy' gives Cartesian (matrix-style) shapes; 'ij' gives tensor-style shapes where the FIRST input varies along axis 0 — when in doubt, print the shapes.",
          params: [
            {
              name: "xi",
              type: "array_like (1-D)",
              required: true,
              description: "One 1-D array per dimension: the coordinate axes to expand into grids.",
              example: "xs, ys",
            },
            {
              name: "indexing",
              type: "\"xy\" or \"ij\"",
              description: "'xy' (default): Cartesian orientation, first input varies along columns. 'ij': first input varies along rows — use it when matching matrix (row, col) conventions or older ml code.",
              example: 'indexing="ij"',
            },
            {
              name: "sparse",
              type: "bool",
              description: "When True, grids hold only one full row/column and rely on broadcasting (Part G) — memory savings for big planes.",
              example: "sparse=True",
            },
            {
              name: "copy",
              type: "bool",
              description: "Return fresh grids (default). False lets the result share memory with the inputs in the 1-D / 2-input case.",
              example: "copy=True",
            },
          ],
          returns: {
            type: "list of ndarrays",
            description: "One grid per input axis, each holding that coordinate at every combination point (length equals the number of inputs).",
          },
          example: `import numpy as np

xs = np.linspace(0.0, 2.0, 3)
ys = np.array([10.0, 20.0])

X, Y = np.meshgrid(xs, ys)
print("X:", X)
print("Y:", Y)

# the whole point: a formula over the plane, no loops
Z = X * Y
print("Z:", Z)
`,
          exampleOutput: `X: [[0. 1. 2.]
 [0. 1. 2.]]
Y: [[10. 10. 10.]
 [20. 20. 20.]]
Z: [[ 0. 10. 20.]
 [ 0. 20. 40.]]`,
          commonMistakes: [
            {
              mistake: "Assuming the FIRST input varies along the rows of the output.",
              why: "With the default indexing='xy' the output is Cartesian: rows follow the SECOND input (ys), columns follow the first (xs) — the opposite of matrix instinct.",
              fix: "Print X.shape right after calling, or pass indexing='ij' when you think in (row, col) = (first, second). Both are fine; silent surprise is not.",
            },
            {
              mistake: "Computing with xs and ys directly (Z = xs * ys) and getting a much smaller result.",
              why: "Flat axes multiply element-wise only up to their common length — 3 x-values times 2 y-values either die with a shape error or (worse, after Part G) broadcast into a tiny grid. The combinations never happen.",
              fix: "meshgrid first, formula second: the grids are what 'every combination' looks like as arrays.",
            },
            {
              mistake: "Calling meshgrid with the same array twice for a square plane and passing only one output.",
              why: "X, Y = np.meshgrid(p, p) returns TWO grids; binding only one (or binding both to one name via a comma slip) loses the other half of the coordinates.",
              fix: "Unpack both: X, Y = np.meshgrid(p, p). Even when the values coincide, the two grids are distinct objects.",
            },
          ],
          related: [
            { name: "np.fromfunction", relation: "Builds the coordinate grids AND applies the formula in one call — meshgrid + arithmetic rolled together." },
            { name: "broadcasting (Part G)", relation: "The memory-free way to get the same combined arithmetic: sparse=True leans on it explicitly." },
            { name: "np.mgrid / np.ogrid", relation: "Shorthand cousins: mgrid builds dense grids from a slice expression; ogrid the sparse (broadcastable) ones." },
          ],
          applications: [
            "Heat maps and contour plots: evaluate Z = f(X, Y) over a plane, then hand Z to your plotter",
            "Model surfaces and decision boundaries: predictions over a mesh of feature values",
            "Parameter sweeps: error landscapes over grids of (learning rate, regularization) candidates",
          ],
          notes:
            "For big planes, sparse=True (or np.ogrid) plus broadcasting does the same arithmetic with far less memory — a Part G-flavored optimization worth reaching for once broadcasting is second nature.",
        },
        {
          kind: "heading",
          text: "vander: a taste of polynomial features",
        },
        {
          kind: "text",
          text: "One more named grid, briefly. `np.vander(vector)` builds the **Vandermonde matrix**: each element raised to a whole ladder of powers, one column per power. If that sounds abstract, translate it: *polynomial features*. Fitting a curve y = a + b*x + c*x^2 to data means building exactly this powers-of-x table and solving for coefficients (Part H and linear-algebra practice make that journey). `increasing=True` orders the columns from x^0 up instead of the default high-power-first, which reads better when the columns are features.",
        },
        {
          kind: "code",
          title: "Powers of your vector, as columns",
          code: `import numpy as np

x = np.array([1, 2, 3, 4])

print(np.vander(x, increasing=True), "\\n")   # columns x^0 .. x^3
print(np.vander(x))                           # default: powers descend
`,
          output: `[[ 1  1  1  1]
 [ 1  2  4  8]
 [ 1  3  9 27]
 [ 1  4 16 64]]

[[ 1  1  1  1]
 [ 8  4  2  1]
 [27  9  3  1]
 [64 16  4  1]]`,
          outputNote: "With increasing=True the columns read left to right as 1, x, x^2, x^3 — the feature table for a cubic fit. The default order (highest power first) matches the coefficient convention of polynomial libraries.",
          explain: [
            "Row i holds the powers of x[i]: 1, 2, 4, 8 for x=2 — a geometric mini-run per row (b-02's geomspace makes an appearance inside a matrix builder).",
            "The number of columns defaults to the vector's length; pass N=x.length or an explicit N argument to control the polynomial degree.",
          ],
        },
        {
          kind: "heading",
          text: "triangles: tri, triu, tril",
        },
        {
          kind: "text",
          text: "The last family answers a quietly common question: *'keep only one half of this matrix.'* Symmetric tables — distances, correlations, similarities — carry their information twice; heat maps look better and computations run cheaper when you zero one triangle. `np.triu(m)` keeps the **upper** triangle (diagonal included), `np.tril(m)` keeps the **lower**, and both take the same `k` shift as eye and diag to include or exclude the diagonal band. `np.tri(n)` builds the mask itself: ones at and below the diagonal, zeros above — and with `dtype=bool` it becomes a ready-made boolean triangle mask.",
        },
        {
          kind: "code",
          title: "Halving a symmetric world",
          code: `import numpy as np

m = np.arange(9).reshape(3, 3)

print(np.triu(m), "\\n")          # upper triangle kept (diagonal in)
print(np.tril(m, k=1), "\\n")     # lower side, diagonal band EXCLUDED
print(np.tri(3, dtype=bool))      # the mask itself, as booleans
`,
          output: `[[0 1 2]
 [0 4 5]
 [0 0 8]]

[[0 1 0]
 [3 4 5]
 [6 7 8]]

[[ True False False]
 [ True  True False]
 [ True  True  True]]`,
          outputNote: "k=1 moves the cutoff: tril(m, k=1) keeps one extra band above the diagonal, so the strict lower triangle without the diagonal is k=-1 instead. tri returns floats by default — dtype=bool makes it a mask.",
          explain: [
            "`np.triu(m)` — zeros below the diagonal, values kept at and above it.",
            "`np.tril(m, k=1)` — the k shift applies to both functions identically: k=1 adds the first superdiagonal to the kept region.",
            "`np.tri(3, dtype=bool)` — the pure shape, ready to AND with other masks (Part E) or to index with.",
          ],
        },
        {
          kind: "tryIt",
          title: "Build the named shapes",
          task: "Run this, then: (1) change the shift matrix to k=-1 and predict the result before rerunning; (2) extract the diagonal of the triangle mask with np.diag; (3) zero the strict lower triangle of grid (diagonal excluded) by choosing the right k for triu; (4) build X, Y over xs = [0, 1] and ys = [0, 1, 2] and compute X * Y.",
          code: `import numpy as np

shift = np.eye(3, k=1, dtype=np.int64)
print(shift)

mask = np.tri(3, dtype=bool)
print(mask, np.diag(mask))

grid = np.arange(9).reshape(3, 3)
print(np.triu(grid))

X, Y = np.meshgrid([0, 1], [0, 1, 2])
print(X * Y)
`,
          hint: "k in triu/tril has the same meaning everywhere in NumPy: positive looks up-and-right. The strict upper triangle (diagonal out) is triu(m, k=1).",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "eye builds the identity (and, shifted, a lag operator); diag is the two-way diagonal door; meshgrid turns flat axes into full coordinate planes so formulas can run over every combination; vander turns a vector into polynomial features; triu/tril halve a symmetric world.",
        },
      ],
      terms: [
        { term: "Identity matrix", definition: "A square matrix of zeros with ones on the main diagonal — the multiplicative neutral element: A @ I equals A. np.eye builds it, with size and shift dials." },
        { term: "Shift operator", definition: "A shifted identity (np.eye(N, k=1)) whose matrix product moves every element one position along — the one-call recipe for lagging a series." },
        { term: "Two-way function (np.diag)", definition: "A function whose input's dimensionality picks the job: 1-D in builds a diagonal matrix; 2-D in extracts the diagonal." },
        { term: "Coordinate grid (meshgrid)", definition: "A pair of same-shape arrays holding every combination point's x- and y-coordinates — the substrate for evaluating formulas over a plane." },
        { term: "Vandermonde matrix", definition: "The powers-of-your-vector table (one column per power) — polynomial features in matrix form, built by np.vander." },
      ],
      mistakes: [
        {
          mistake: "Reading np.eye's k shift in the wrong direction.",
          why: "Positive k moves the ones band up-and-right (cells [i, i+k]), which is 'up' visually and 'to a higher column index' concretely. Expecting 'down' reverses every shifted identity you write.",
          fix: "Memorize the index rule, not the picture: k-th diagonal = cells [i, i + k]. The same rule then covers diag and triu/tril for free — one convention, four functions.",
        },
        {
          mistake: "Using diag's build direction when you meant extraction (or the reverse).",
          why: "The direction is chosen silently from the input's dimensions: passing a vector BUILDs a matrix when you expected a diagonal vector back.",
          fix: "Read the call aloud with the input shape ('diag of a vector builds') and print .shape on the result when the input's dimensionality is not obvious at the call site.",
        },
        {
          mistake: "Computing formulas directly on meshgrid's flat inputs instead of the returned grids.",
          why: "xs * ys multiplies two flat arrays element-wise (or broadcasts into a surprise, after Part G) — the full set of combinations never happens, and the result is silently the wrong shape.",
          fix: "The pattern is fixed: X, Y = np.meshgrid(xs, ys) FIRST, then any formula on X and Y. Axes in, grids out, arithmetic on grids.",
        },
      ],
      takeaways: [
        "np.eye(N) is the identity; M makes it rectangular and k slides the band — a shifted identity is a shift (lag) operator in matrix clothing.",
        "np.diag is a two-way door: vector in builds a diagonal matrix; matrix in extracts the diagonal. k picks which band, with one sign convention shared across eye, diag, triu and tril.",
        "np.meshgrid expands flat axes into full coordinate grids — the standard opening move for evaluating any formula over a plane, from heat maps to decision boundaries.",
        "np.vander turns a vector into a table of its powers — polynomial features in one call (increasing=True reads best as features).",
        "np.triu and np.tril keep one half of a matrix (k adjusts the diagonal); np.tri builds the triangle mask itself — dtype=bool for indexing.",
      ],
      quiz: [
        {
          id: "b-03-q1",
          prompt: "You want a 4x4 matrix that shifts a series one step when matrix-multiplied with it (a lag operator). The call is:",
          options: [
            { text: "np.eye(4, k=1)", correct: true, feedback: "Correct: ones on the superdiagonal — cells [i, i+1] — which slide positions by one under matrix multiplication." },
            { text: "np.eye(4, k=-1)", correct: false, feedback: "The band slides down-and-left instead: a shift in the opposite direction (lag vs lead, if you like)." },
            { text: "np.diag([1, 1, 1, 1])", correct: false, feedback: "That is the identity — it changes nothing under multiplication. No shift, no lag." },
            { text: "np.tri(4)", correct: false, feedback: "That is a lower-triangle of ones (not even square-of-ones on the diagonal alone) — a mask, not a shift operator." },
          ],
          explanation: "A shifted identity IS a shift operator: np.eye(N, k=1) moves every element one position along when multiplied with a series.",
        },
        {
          id: "b-03-q2",
          prompt: "Given `m = np.array([[5, 1, 9], [2, 6, 3], [7, 4, 8]])`, what is `np.diag(m, k=1)`?",
          options: [
            { text: "[5, 6, 8] — the main diagonal", correct: false, feedback: "That is np.diag(m) with k=0. The k=1 band sits one column to the right." },
            { text: "[1, 3] — the superdiagonal", correct: true, feedback: "Correct: cells [0, 1] and [1, 2] — one diagonal up-and-right of the main one." },
            { text: "[2, 4] — the subdiagonal", correct: false, feedback: "One diagonal DOWN is negative k: np.diag(m, k=-1). Same rule, other direction." },
            { text: "[1, 3, 0] — padded with a zero", correct: false, feedback: "Diagonals do not get padded: the k=1 band of a 3x3 holds exactly two cells." },
          ],
          explanation: "The k-th diagonal is cells [i, i+k]: for k=1 in a 3x3 that is [0, 1] and [1, 2] — values 1 and 3.",
        },
        {
          id: "b-03-q3",
          prompt: "You are about to compute Z = X**2 + Y**2 over a plane of xs (5 values) and ys (7 values). With the default indexing='xy', X and Y come back with shape:",
          options: [
            { text: "(5, 7) — first input first, like a matrix", correct: false, feedback: "That is the indexing='ij' answer (tensor convention). The default 'xy' is Cartesian." },
            { text: "(7, 5) — rows follow ys, columns follow xs", correct: true, feedback: "Correct: meshgrid's default is Cartesian — 7 rows (one per y) by 5 columns (one per x). Both grids share this shape." },
            { text: "(5, 5) and (7, 7) — each input its own square grid", correct: false, feedback: "The grids must ALIGN cell for cell, so they share one common shape — the combination shape." },
            { text: "(35,) — flattened combinations", correct: false, feedback: "Combinations are arranged as a grid, not a flat run; flattening is a separate (reshape) decision." },
          ],
          explanation: "indexing='xy' returns grids shaped (len(ys), len(xs)) — the Cartesian convention; 'ij' returns (len(xs), len(ys)). When the shape matters, print it.",
        },
      ],
    },

    // ------------------------------------------------------------- b-04
    {
      slug: "b-04",
      title: "From Anything to Array",
      minutes: 13,
      summary:
        "Data arrives in many forms — lists, generators, formulas, raw bytes. Meet the converters: np.asarray (the no-copy-if-possible twin of np.array), np.fromiter for lazy streams, np.fromfunction for index formulas, a brief honest look at frombuffer/fromstring, and np.copy for the explicit duplicate.",
      kind: "concept",
      objectives: [
        "Explain the difference between np.array and np.asarray: when each copies and when it does not",
        "Write functions that accept both lists and arrays gracefully by converting with np.asarray at the boundary",
        "Build arrays from generators with np.fromiter, including its count argument",
        "Build arrays from index formulas with np.fromfunction, knowing the surprise that the function receives index ARRAYS",
        "Know what np.frombuffer and np.fromstring are honestly for, and duplicate an array deliberately with np.copy",
      ],
      why: "Part A taught np.array: it always builds a block you own, which is exactly right at the edge of your program. But inside a library, that always-copy behavior becomes waste: if a caller hands your function an array that is already perfect, re-copying it doubles the memory of every call. The converters in this lesson are the professional boundary tools — asarray converts only when needed, fromiter streams generators into blocks without a staging list, fromfunction turns an index formula directly into a grid, and frombuffer interprets raw bytes from files, sockets and other systems. This is also the lesson where the view-versus-copy question first matters (b = a does NOT copy; np.asarray(a) does not either), a thread Part D pulls into a full subject when slicing enters the picture.",
      blocks: [
        {
          kind: "text",
          text: "Part A's `np.array` has one unshakeable habit: **it always builds a fresh block you fully own.** Perfect for converting data at the edge of your program — but inside a function called a thousand times, 'fresh block you fully own' becomes 'wasteful copy the caller never asked for.' NumPy's answer is a family of converters with different copy policies, and the flagship is a two-line idea: **convert only if needed.**",
        },
        {
          kind: "heading",
          text: "asarray vs array: the copy question",
        },
        {
          kind: "text",
          text: "`np.asarray(x)` behaves exactly like `np.array(x)` — *unless* x is already an array with the dtype you want, in which case it hands your own array straight back to you. No copy, no new memory, the very same object. One test makes the difference concrete: Python's `is` asks 'are these two names the same object?'",
        },
        {
          kind: "code",
          title: "The identity experiment",
          code: `import numpy as np

a = np.array([1, 2, 3])        # a block we own

fresh = np.array(a)            # np.array: ALWAYS copies
alias = np.asarray(a)          # asarray: no copy needed -- same object

print("np.array   is a:", fresh is a)
print("np.asarray is a:", alias is a)

# from a list, both must build -- there is nothing to reuse
from_list = np.asarray([1, 2, 3])
print("type now   :", type(from_list).__name__)

# a DIFFERENT dtype cannot share the block: conversion forces a copy
as_float = np.asarray(a, dtype=np.float64)
print("dtype change is a:", as_float is a, as_float.dtype)
`,
          output: `np.array   is a: False
np.asarray is a: True
type now   : ndarray
dtype change is a: False float64`,
          outputNote: "np.array(a) is a different object (a real copy lives underneath); np.asarray(a) is the SAME object. From a list there is nothing to reuse, so asarray builds. A dtype change can never alias — conversion must happen somewhere.",
          explain: [
            "`fresh is a` -> False: np.array copied the block, so mutating fresh would leave a untouched.",
            "`alias is a` -> True: asarray saw an array with the matching dtype and returned it unchanged — zero bytes spent.",
            "`as_float is a` -> False: asking for float64 while holding int64 forces conversion, which forces a copy. asarray avoids COPIES, not WORK you ordered.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.asarray",
          purpose: "Convert input to an ndarray, copying only when the input is not already a suitable array.",
          signature: "np.asarray(a, dtype=None, order=None, *, like=None)",
          purposeDetail:
            "asarray is the boundary function of the NumPy world: it guarantees 'an ndarray out' for whatever array-like comes in — list, tuple, scalar, another array — while skipping the copy whenever the input already qualifies. That makes it the standard first line of reusable functions: convert once at the boundary, then operate, never paying for a copy the caller did not need. The copy-avoidance has a consequence you must know: when the input IS an array, you get that same array back — so writing into your result writes into the caller's array too (the view-versus-copy story Part D makes complete).",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The input to convert: list, tuple, nested sequence, scalar, generator-fed iterator, or an existing array.",
              example: "[1, 2, 3] or arr",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "The element type the result must have. When the input already has this dtype it is returned as-is; any other dtype forces a converting copy.",
              example: "dtype=np.float64",
            },
            {
              name: "order",
              type: "\"K\", \"A\", \"C\", or \"F\"",
              description: "Memory layout preference for copies ('K' keeps the input's layout). A Part J refinement.",
              example: 'order="C"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "The input as an ndarray: the same object when no conversion was needed, a fresh array otherwise. Never None, never a copy in disguise when it could avoid one.",
          },
          example: `import numpy as np

# the boundary pattern: accept list OR array, normalize once
def to_celsius(values):
    v = np.asarray(values, dtype=np.float64)
    return (v - 32.0) * 5.0 / 9.0

print(to_celsius([32, 212]))            # a list converts
print(to_celsius(np.array([98.6])))     # an array passes through

# same object in, same object out (when dtype already matches)
a = np.arange(3)
print(np.asarray(a) is a)
`,
          exampleOutput: `[  0. 100.]
[37.]
True`,
          commonMistakes: [
            {
              mistake: "Mutating the result of np.asarray and assuming the caller's data is safe.",
              why: "When the input was already a matching array, you received THE CALLER'S ARRAY — writes flow both ways. asarray avoids the copy, which means it also avoids the isolation.",
              fix: "If your function needs to modify its input freely, copy deliberately at the boundary: np.array(a) or a.copy(). Reserve asarray for read-only use of the data.",
            },
            {
              mistake: "Using np.asarray(a, dtype=different) and expecting the original to change dtype.",
              why: "A different dtype cannot share the block, so a NEW converted array comes back; the original keeps its dtype.",
              fix: "Assign the result: converted = np.asarray(a, dtype=np.int64). Conversion is a return value, never an in-place edit.",
            },
            {
              mistake: "Calling np.asarray on a generator and expecting the elements.",
              why: "Generators are not array-like in the asarray sense: you get a 0-D object array wrapping the generator itself, not its values.",
              fix: "np.fromiter(gen, dtype) is the generator specialist — it walks the iterator and packs the values.",
            },
          ],
          related: [
            { name: "np.array", relation: "The always-copy sibling: right at program edges where you want ownership, wrong inside hot functions." },
            { name: "np.fromiter", relation: "The iterator specialist: walks a generator element by element and packs the values." },
            { name: "np.copy / ndarray.copy", relation: "The explicit duplicate: for the moments you need isolation from an array you already hold." },
          ],
          applications: [
            "Function boundaries: one line at the top of every reusable function makes it accept lists, tuples and arrays alike",
            "Library-friendly internals: avoiding a copy on every call keeps hot loops fast and memory flat",
            "Dtype normalization: asarray(x, dtype=np.float64) converts only the callers who arrived in the wrong type",
          ],
          notes:
            "The functional difference from np.array is ONLY the copy policy (and the absence of ndmin/copy keyword dials): same inference rules, same ragged-input errors, same dtype handling.",
        },
        {
          kind: "heading",
          text: "fromiter: the lazy stream collector",
        },
        {
          kind: "text",
          text: "Generators hand you one value at a time and refuse to say how many are coming. `np.fromiter(iterable, dtype)` walks the stream and packs every value into a block — no staging list, no len() required — and its `count` argument will stop after a fixed number of elements even if the stream could continue. The dtype is **required** here (not inferred): fromiter cannot peek ahead at values it has not consumed.",
        },
        {
          kind: "code",
          title: "Packing a stream",
          code: `import numpy as np

squares = (x * x for x in range(5))     # a generator: lazy, unmeasured

first3 = np.fromiter(squares, dtype=np.int64, count=3)   # take only 3
print("first 3:", first3)

# the generator continues where the first reading stopped:
rest = np.fromiter(squares, dtype=np.int64)
print("rest   :", rest)
`,
          output: `first 3: [0 1 4]
rest   : [ 9 16]`,
          outputNote: "count=3 consumed exactly three values; the second call collected what remained of the SAME generator. Streams remember their position — fromiter just reads from where the iterator is.",
          explain: [
            "`(x * x for x in range(5))` — a generator expression: values are computed only as demanded, which is why nothing was inferred in advance.",
            "`count=3` — reads a fixed prefix; leaving count at its default (-1) drains the whole stream.",
            "The dtype is mandatory: fromiter cannot look ahead to guess types from values it has not yet seen.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.fromiter",
          purpose: "Build an array by pulling values one at a time from an iterator or generator.",
          signature: "np.fromiter(iter, dtype, count=-1, *, like=None)",
          purposeDetail:
            "Some data arrives as a stream, not a list: a generator parsing a huge file line by line, a sensor reading on demand, an infinite mathematical sequence you want a prefix of. fromiter is the direct pipe from any iterable to a packed block — no intermediate Python list, no requirement that the source know its own length. count lets you read exactly k elements and leave the rest of the stream unconsumed. The price of streaming is that YOU declare the dtype: the function sees one value at a time and cannot infer a type it has not met yet.",
          params: [
            {
              name: "iter",
              type: "iterable",
              required: true,
              description: "The source iterator or generator; it is consumed as the array is built (from wherever it currently stands).",
              example: "(x * x for x in range(10))",
            },
            {
              name: "dtype",
              type: "dtype",
              required: true,
              description: "The element type of the result — mandatory, because a stream cannot be type-inferred from values not yet seen.",
              example: "dtype=np.float64",
            },
            {
              name: "count",
              type: "int",
              description: "Read at most this many elements (-1 reads until the stream ends). A positive count may leave the iterator with values remaining.",
              example: "count=100",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A 1-D array of the values pulled from the iterator, in order.",
          },
          example: `import numpy as np

# a running average, generated lazily, collected into a block
averages = (n / (n + 1) for n in range(6))
a = np.fromiter(averages, dtype=np.float64)
print(a)

# take only a prefix; the rest of the stream stays unread
fib = (x for x in [1, 1, 2, 3, 5, 8, 13])
prefix = np.fromiter(fib, dtype=np.int64, count=4)
print(prefix)
`,
          exampleOutput: `[0.         0.5        0.66666667 0.75       0.8        0.83333333]
[1 1 2 3]`,
          commonMistakes: [
            {
              mistake: "Omitting the dtype (np.fromiter(gen)) and expecting inference.",
              why: "Unlike np.array, fromiter must allocate before it can look at values; with no length and no preview, only YOU can declare the type.",
              fix: "State the dtype every time: np.fromiter(gen, dtype=np.int64). It reads as documentation of the stream's contents, which is a bonus.",
            },
            {
              mistake: "Calling fromiter twice on the same generator and expecting the same array.",
              why: "Iterators are consumed: the second call continues from wherever the first stopped (the verified example above shows a stream split across two arrays).",
              fix: "Re-create the generator for a second pass, or collect once and reuse the array you got.",
            },
            {
              mistake: "Feeding fromiter a list and calling it an optimization.",
              why: "For a list you already hold, np.array or np.asarray is simpler and just as fast; fromiter's niche is sources with no length and no indexing.",
              fix: "Use the right collector for the shape of the source: lists -> np.array, streams -> np.fromiter.",
            },
          ],
          related: [
            { name: "np.asarray", relation: "The list-and-array converter; fromiter is its counterpart for sources that have no length to read." },
            { name: "list comprehension + np.array", relation: "The two-step alternative: materialize the stream into a list first, then convert — costs the staging list fromiter avoids." },
            { name: "np.fromfunction", relation: "The other 'build without a list' tool: values come from an index FORMULA instead of a stream." },
          ],
          applications: [
            "Reading values out of parsers and producers that naturally yield one item at a time",
            "Taking fixed-size prefixes of long or infinite sequences (count=...)",
            "Collecting simulation outputs or sensor readings without pre-counting them",
          ],
          notes:
            "If the stream's total length is known up front, np.empty(n) plus a fill loop can be slightly faster; fromiter wins on clarity and handles the unknown-length case gracefully.",
        },
        {
          kind: "heading",
          text: "fromfunction: the formula factory",
        },
        {
          kind: "text",
          text: "`np.fromfunction(f, shape)` builds an array whose values come from *calling your function with the coordinates*. The one surprise worth meeting here, in Part B, is that **f does not receive scalar indexes** — it receives one index ARRAY per dimension (the coordinate grids of the previous lesson, built behind the curtain). Your function must therefore work with arrays — which is exactly what element-wise expressions (Part F) do naturally.",
        },
        {
          kind: "code",
          title: "A grid from a rule, not from values",
          code: `import numpy as np

# i and j arrive as full coordinate grids, not as scalars:
addition_table = np.fromfunction(lambda i, j: i + j, (3, 4), dtype=np.int64)
print(addition_table)

row_of_ones = np.fromfunction(lambda i, j: 1 * (i == 0), (3, 4), dtype=np.int64)
print(row_of_ones)
`,
          output: `[[0 1 2 3]
 [1 2 3 4]
 [2 3 4 5]]
[[1 1 1 1]
 [0 0 0 0]
 [0 0 0 0]]`,
          outputNote: "Cell [i, j] of the first table is simply i + j — the function ran once on the whole coordinate grids, not once per cell. The second table shows a comparison producing 1 where i is 0 (True) and 0 elsewhere.",
          explain: [
            "`lambda i, j: i + j` — with (3, 4), NumPy calls this once with i and j as (3, 4) coordinate grids (meshgrid in disguise); the addition evaluates everywhere at once.",
            "`1 * (i == 0)` — a comparison grid times one: True becomes 1, False becomes 0. A first tiny taste of boolean-to-integer arithmetic (Part E's main course).",
            "`dtype=np.int64` — without it the results come back float64, the same default as everywhere else in this part.",
          ],
        },
        {
          kind: "heading",
          text: "frombuffer and fromstring: honest and brief",
        },
        {
          kind: "text",
          text: "Two converters exist for data that is not even *numbers* yet — it is raw **bytes** (from a file, a socket, another library). `np.frombuffer(buffer, dtype)` reinterprets an existing bytes object as a block of the given dtype with **zero copying** — the array is a *view of the bytes* — which is fast and sharp-edged: the result is read-only when the buffer is immutable, and the byte count must divide evenly by the dtype's itemsize. `np.fromstring(text, sep=\" \")` parses whitespace- or comma-separated numbers from a string — handy for quick pasted data. (Its ancient binary mode is long gone; text with an explicit `sep` is the only supported use.) For serious file loading, Part J's np.load/np.save and np.loadtxt are the real tools; these two are the interop door.",
        },
        {
          kind: "code",
          title: "Bytes to numbers, and back",
          code: `import numpy as np

# frombuffer: reinterpret existing bytes -- no copy, so read-only
raw = np.array([10, 20, 30], dtype=np.int32).tobytes()
view = np.frombuffer(raw, dtype=np.int32)
print("frombuffer:", view)

try:
    view[0] = 99                    # immutable bytes -> read-only view
except ValueError as err:
    print("read-only  :", err)

# fromstring (text mode): parse separated numbers out of a string
parsed = np.fromstring("1.5 2.5 3.5", dtype=np.float64, sep=" ")
print("fromstring:", parsed)
`,
          output: `frombuffer: [10 20 30]
read-only  : assignment destination is read-only
fromstring: [1.5 2.5 3.5]`,
          outputNote: "The frombuffer result shows the same three int32 values the bytes carried — a view, not a copy, which is why NumPy refuses the write. fromstring with an explicit sep parses the text into fresh float64 values.",
          explain: [
            "`tobytes()` then `frombuffer` round-trips a block into raw bytes and back — the shape is lost (1-D view) but the values and dtype survive.",
            "The ValueError is the zero-copy design: immutable bytes cannot be written through, so the view is read-only. Copy it (`view.copy()`) to gain a writable block.",
            "`sep=\" \"` is required for fromstring's text mode — without a separator NumPy assumes you wanted the removed binary mode and says so.",
          ],
        },
        {
          kind: "heading",
          text: "np.copy: the deliberate duplicate",
        },
        {
          kind: "text",
          text: "One converter is not about converting at all — it is about **isolation**. `b = a` does not copy (two names, one block); `np.asarray(a)` does not copy; but `b = np.copy(a)` (or the method form `a.copy()`) builds a true duplicate. You reach for it at the exact moment you plan to modify while the original must stay intact — Part D turns this into a full map of which operations view and which copy.",
        },
        {
          kind: "code",
          title: "Three assignments, one difference",
          code: `import numpy as np

original = np.array([1, 2, 3])

alias = original                # a NAME, not a copy: same block
duplicate = np.copy(original)   # a true second block

alias[0] = 99
print("original:", original, " <- the alias write went THROUGH")

duplicate[0] = 42               # isolated write
print("original:", original, " <- untouched by the copy's write")
print("copy    :", duplicate)
print("memory shared with copy:", np.shares_memory(original, duplicate))
`,
          output: `original: [99  2  3]  <- the alias write went THROUGH
original: [99  2  3]  <- untouched by the copy's write
copy    : [42  2  3]
memory shared with copy: False`,
          outputNote: "alias and original are one block wearing two names; duplicate is separate memory, proven both by the untouched original and by shares_memory's False.",
          explain: [
            "`alias = original` — Python assignment never copies; the write through alias is a write to original.",
            "`np.copy(original)` — new block, same values; writes stay home.",
            "`np.shares_memory` — the direct question 'do these two arrays overlap?' — your tool of record until Part D formalizes the full view/copy map.",
          ],
        },
        {
          kind: "tryIt",
          title: "Write an asarray boundary function",
          task: "This rescale function must accept a plain list, a tuple, or an array, and must never modify its input. Run it, then: (1) call it with a list and confirm the list survived; (2) call it with an array and check that the input array is unchanged after the call; (3) explain why the internal write to normalized (normalized -= lo) does not touch the caller's data.",
          code: `import numpy as np

def rescale(values):
    # boundary: convert list OR array, then WORK ON A COPY we own
    v = np.asarray(values, dtype=np.float64).copy()
    lo, hi = v.min(), v.max()
    if hi > lo:
        normalized = (v - lo) / (hi - lo)
        v[:] = normalized
    return v

data = [3, 7, 11]
print(rescale(data))
print("input intact:", data)

arr = np.array([2.0, 4.0, 6.0])
print(rescale(arr))
print("input intact:", arr.tolist())
`,
          hint: "asarray normalizes the input types; the .copy() right after buys isolation. Together they are the standard 'friendly and safe' boundary pattern.",
        },
        {
          kind: "table",
          title: "Which converter, when",
          headers: ["Your input is...", "Call", "Copies?"],
          rows: [
            ["Data you own and want to own outright (program edge)", "`np.array(x)`", "Always"],
            ["List or array at a function boundary (read-only use)", "`np.asarray(x)`", "Only if needed"],
            ["A generator / iterator with no length", "`np.fromiter(it, dtype)`", "Builds fresh"],
            ["A coordinate formula (cell = f(i, j))", "`np.fromfunction(f, shape)`", "Builds fresh"],
            ["Raw bytes from a file, socket or another library", "`np.frombuffer(buf, dtype)`", "No — a view"],
            ["An array you plan to modify while the original survives", "`np.copy(a)`", "Deliberately"],
          ],
          caption: "One question picks the row: what does the data arrive AS, and who must own the block afterwards?",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "np.array always copies; np.asarray copies only when it must (and hands back the caller's own array when it must not — do not write through it). fromiter collects streams, fromfunction builds from coordinate formulas, frombuffer reinterprets bytes (read-only views), and np.copy is your deliberate, isolating duplicate.",
        },
      ],
      terms: [
        { term: "Copy semantics", definition: "The policy a converter follows about duplicating memory: np.array always copies; np.asarray copies only when conversion is required; assignment never copies." },
        { term: "Boundary conversion", definition: "The pattern of converting whatever arrives (list, tuple, array) into an ndarray once, at the top of a function, with np.asarray." },
        { term: "Zero-copy view (frombuffer)", definition: "An array that interprets existing bytes as numbers without copying them — fast, but read-only when the underlying buffer is immutable." },
        { term: "Stream collection (fromiter)", definition: "Pulling values one at a time from an iterator into a packed block, with no staging list and no length requirement." },
        { term: "Identity test (is)", definition: "Python's 'same object?' check — the direct experiment for whether a converter handed you your own array back or a new block." },
      ],
      mistakes: [
        {
          mistake: "Writing through the result of np.asarray and corrupting the caller's array.",
          why: "When the input already matched, asarray returned THE INPUT — the same block, now being modified from inside your function. The caller's data changes without any assignment they can see.",
          fix: "Read through asarray freely; when you need to modify, copy deliberately: np.asarray(x).copy() — or np.array(x) straight away.",
        },
        {
          mistake: "Expecting np.fromfunction's function to receive scalar indexes (i, j as numbers).",
          why: "The function is called ONCE with full coordinate grids (index arrays), so scalar-only code either crashes on array operations or returns a single value broadcast everywhere.",
          fix: "Write the function with element-wise expressions (i + j, i * j, comparisons) that work on arrays — the same vocabulary Part F formalizes.",
        },
        {
          mistake: "Treating b = a as a copy because it 'looks like assignment of a value'.",
          why: "Python assignment binds a NAME to the existing object; arrays are no exception. One block, two names — writes through either are visible through both.",
          fix: "When isolation is needed, say it: b = np.copy(a). np.shares_memory(a, b) answers the doubt directly.",
        },
      ],
      takeaways: [
        "np.array always builds a block you own; np.asarray returns your own array unchanged when it already qualifies — the function-boundary converter.",
        "asarray with a different dtype forces a converting copy; with the same dtype it aliases. Writes through an alias reach the caller.",
        "np.fromiter packs streams (dtype required, count optional, iterator consumed); np.fromfunction evaluates a coordinate formula once over index grids.",
        "np.frombuffer reinterprets raw bytes as a read-only view — the interop door; np.fromstring parses separated text; Part J owns real file I/O.",
        "np.copy is the deliberate duplicate; np.shares_memory is the direct 'do these overlap?' check until Part D completes the map.",
      ],
      quiz: [
        {
          id: "b-04-q1",
          prompt: "Inside a helper function you receive `x`, which callers pass as lists or as arrays, and you only READ it. The professional boundary line is:",
          options: [
            { text: "x = np.array(x)", correct: false, feedback: "Correct but wasteful: every call pays for a fresh copy even when the caller handed you a perfect array." },
            { text: "x = np.asarray(x)", correct: true, feedback: "Exactly the boundary pattern: lists convert, matching arrays pass through untouched, and read-only use makes the aliasing harmless." },
            { text: "x = np.copy(x)", correct: false, feedback: "Same waste as np.array with extra steps — copying is what you are trying to avoid at a read-only boundary." },
            { text: "Nothing — just index x directly", correct: false, feedback: "Lists have no vectorized math, no dtype, no .shape: the function's body would need two code paths forever." },
          ],
          explanation: "asarray at the boundary: one line, every caller's input shape welcome, zero copies when none are needed.",
        },
        {
          id: "b-04-q2",
          prompt: "`a = np.arange(5)`; `b = np.asarray(a, dtype=np.float64)`. Which is TRUE?",
          options: [
            { text: "b is a — asarray never copies", correct: false, feedback: "asarray avoids copies only when the dtype already matches; a conversion must materialize somewhere." },
            { text: "b is a fresh array; a keeps its int64 dtype untouched", correct: true, feedback: "Right: the float64 request forces a converting copy. The original never changes type — conversion is a return value." },
            { text: "a becomes float64 too — conversion is in place", correct: false, feedback: "Dtypes are fixed at block creation; an existing array never morphs its element type in place (that is astype's job, and even astype returns a new array — Lesson b-06)." },
            { text: "It raises an error — int64 cannot convert to float64", correct: false, feedback: "The conversion itself is perfectly legal (every int64 value survives as float64) — it just cannot be done without a copy." },
          ],
          explanation: "Different dtype means different bytes per element: no aliasing possible, so asarray converts — into a new block, leaving the original alone.",
        },
        {
          id: "b-04-q3",
          prompt: "`gen = (k * 10 for k in range(1000))` — an infinite-seeming generator you want the first 6 values of, as an array. The correct call is:",
          options: [
            { text: "np.array(gen)[:6]", correct: false, feedback: "np.array on a generator yields a 0-D object array wrapping the generator itself — the values never materialize. (This is the classic surprise.)" },
            { text: "np.fromiter(gen, dtype=np.int64, count=6)", correct: true, feedback: "Correct: the stream specialist, a declared dtype, and a count that reads exactly six values and leaves the rest unread." },
            { text: "np.asarray(gen, count=6)", correct: false, feedback: "asarray has no count argument — and it shares np.array's generator blindness besides." },
            { text: "np.frombuffer(gen, dtype=np.int64)", correct: false, feedback: "frombuffer reinterprets BYTES; a generator is not a buffer. Its niche is raw byte strings from files and sockets." },
          ],
          explanation: "Streams have no length and no preview: fromiter with a dtype and a count is the one tool built for exactly that contract.",
        },
      ],
    },
    // ------------------------------------------------------------- b-05
    {
      slug: "b-05",
      title: "The dtype Menu: Every Type, Every Limit",
      minutes: 20,
      summary:
        "The complete dtype system promised in this part's header: the bool/int/float/complex menu and its byte ladder, the limit readers np.iinfo and np.finfo, the one cliff every NumPy user must know — silent integer wraparound — float16 precision loss, when float32 is the right call, and the second-class citizens (strings, object arrays) plus a first look at datetime64.",
      kind: "concept",
      objectives: [
        "Name the four dtype families on NumPy's menu and the byte width of every integer and float type",
        "Read a dtype's exact limits with np.iinfo and np.finfo instead of guessing or memorizing them",
        "Prove and explain silent integer wraparound, and write the iinfo pre-flight check that prevents it",
        "Show float16 precision loss concretely and choose between float16/float32/float64 for a dataset",
        "Recognize <U strings, object arrays and datetime64/timedelta64, and know when data belongs in another tool",
      ],
      why: "Every byte you save or waste, every silent wrong number, and a remarkable share of confusing NumPy errors trace back to one decision: which dtype. A camera pipeline chooses uint8 because 255 brightness levels is the sensor's reality and one byte per pixel is the budget. A ledger never chooses int8, because amounts overflow it at 127 — and NumPy will not warn you when they do; the numbers simply wrap. This lesson puts the whole menu on the table, teaches you to read the limits stamped on each type with np.iinfo and np.finfo, and walks you to the edge of the one cliff in this course that has corrupted real data in every numerical field: silent integer overflow. After it, 'which dtype?' stops being a guess and becomes a measurement.",
      blocks: [
        {
          kind: "text",
          text: "Every number you will ever store in NumPy is a pattern of bits, and the **dtype** is the deal you signed about those bits: how many there are, and how to read them. The same byte can be the integer 25, a fragment of a float, or the low-order corner of a date. Lesson a-04 introduced dtype as one line of the passport; Lessons b-01 through b-04 had you *choosing* dtypes at the counter. This lesson is the moment promised in this part's header: the whole menu on the table — every family, every width, every limit.",
        },
        {
          kind: "heading",
          text: "One menu, four families",
        },
        {
          kind: "text",
          text: "NumPy's numeric menu has four families. **bool** holds exactly two values, False and True, one byte each. The **integers** come in four widths — 8, 16, 32, 64 bits — each in a signed flavor (int8, int16, int32, int64) and an unsigned one (uint8, uint16, uint32, uint64) that trades negatives for double the ceiling. The **floats** come in three widths — float16, float32, float64 — trading precision for memory. And **complex** numbers pair two floats (complex64 is two float32s, complex128 is two float64s) for the waves and spectra of signal work. The names are self-describing once you read them as widths: an int8 is 8 bits wide. And the width *is* the memory decision: 10 million int64 values cost 80 MB; the same values as int16 cost 20 MB.",
        },
        {
          kind: "code",
          title: "The size ladder, measured",
          code: `import numpy as np

for name in ("bool", "int8", "int16", "int32", "int64",
             "float16", "float32", "float64", "complex64", "complex128"):
    dt = np.dtype(name)
    print(f"{dt.name:10s} {dt.itemsize} byte(s)  kind={dt.kind}")
`,
          output: `bool       1 byte(s)  kind=b
int8       1 byte(s)  kind=i
int16      2 byte(s)  kind=i
int32      4 byte(s)  kind=i
int64      8 byte(s)  kind=i
float16    2 byte(s)  kind=f
float32    4 byte(s)  kind=f
float64    8 byte(s)  kind=f
complex64  8 byte(s)  kind=c
complex128 16 byte(s)  kind=c`,
          outputNote: "Every name states its width in bits; itemsize converts to bytes. complex types hold two floats each, so complex128 is 16 bytes. bool spends a full byte per element — one bit of payload, seven of padding.",
          explain: [
            "`np.dtype(name)` builds the dtype object for any name on the menu; `.itemsize` reports its width in bytes — the number your memory arithmetic multiplies by.",
            "`kind` is the family letter: b for bool, i and u for signed/unsigned integers, f for floats, c for complex — the same letters that appear in dtype codes like '<i4' a few blocks below.",
            "The Lesson a-05 chain applies to every row: size x itemsize = nbytes, so you can price a dataset in bytes before a single value exists.",
          ],
        },
        {
          kind: "table",
          title: "The menu at a glance",
          headers: ["dtype", "bytes", "holds", "its natural job"],
          rows: [
            ["`bool`", "1", "False / True", "masks, flags, conditions — Part E's raw material"],
            ["`uint8`", "1", "0 .. 255", "images, sensor levels, anything countable and never negative"],
            ["`int8`", "1", "-128 .. 127", "rare in Python-land; packed binary formats from other systems"],
            ["`uint16` / `int16`", "2", "0 .. 65535 / -32768 .. 32767", "audio samples, moderate-range counters"],
            ["`uint32` / `int32`", "4", "0 .. 4.3e9 / ±2.1e9", "IDs, pixel coordinates, C-library interop"],
            ["`uint64` / `int64`", "8", "0 .. 1.8e19 / ±9.2e18", "the default integer: counts, Unix times, big sums"],
            ["`float16`", "2", "±65500, ~3 significant digits", "ML weights, where memory matters more than digits"],
            ["`float32`", "4", "±3.4e38, ~7 significant digits", "measured data at scale; the GPU-native float"],
            ["`float64`", "8", "±1.8e308, ~16 significant digits", "the default float: science, statistics, headroom"],
            ["`complex64` / `complex128`", "8 / 16", "float pairs (real, imag)", "signal processing: waves, spectra, FFTs"],
          ],
          caption: "Two facts per row decide your choice: how many bytes, and how much of reality the type can hold. The next two tools read those facts off the label for you.",
        },
        {
          kind: "arrayViz",
          title: "An int8 block: one byte per cell",
          mode: "explore",
          name: "g",
          caption:
            "A 2x4 int8 grid: every cell holds a value between -128 and 127, and every cell costs exactly one byte — the whole block is 8 bytes of memory. The values hug the edges on purpose (127 is int8's ceiling, -128 its floor). Click cells to read out [row, col] indexes, flat row-major positions, and the shape/size/dtype facts — the same passport inspection as Lesson a-04, now on the narrowest integer type on the menu.",
          data: [
            [127, 120, 0, -120],
            [-128, -5, 55, 127],
          ],
          labels: {
            rows: ["row 0", "row 1"],
            cols: ["col 0", "col 1", "col 2", "col 3"],
          },
          dtype: "int8",
        },
        {
          kind: "heading",
          text: "Reading the label: np.iinfo and np.finfo",
        },
        {
          kind: "text",
          text: "How do you know, without memorizing anything, that uint8 stops at 255 — or whether a pressure reading of 103,200 pascals fits in a uint16? You read the label. `np.iinfo(dtype)` returns an information object for any *integer* type: its `.min`, its `.max`, its `.bits`. Floats get `np.finfo(dtype)`: `.max`, `.eps`, `.smallest_normal` and friends. These are not trivia — they are the measuring tape you hold against your data before choosing a container. The professional workflow: compute the sample's min and max, walk the width ladder, stop at the first dtype whose label says the values fit.",
        },
        {
          kind: "code",
          title: "Every integer limit, read off the label",
          code: `import numpy as np

for name in ("int8", "uint8", "int16", "uint16", "int32", "uint32"):
    info = np.iinfo(name)
    print(f"{info.dtype.name:7s} {np.dtype(name).itemsize}B  {info.min:>12} .. {info.max}")
`,
          output: `int8    1B          -128 .. 127
uint8   1B             0 .. 255
int16   2B        -32768 .. 32767
uint16  2B             0 .. 65535
int32   4B   -2147483648 .. 2147483647
uint32  4B             0 .. 4294967295`,
          outputNote: "Each pair of rows is one width: unsigned doubles the ceiling but floors at zero. int64 (the default) spans ±9223372036854775807 — effectively unbounded for counting — and uint64 reaches 18446744073709551615.",
          explain: [
            "The unsigned trick: uint8 spends its 256 bit-patterns on 0..255, int8 spends them on -128..127 — same byte, different map.",
            "Every limit here is a fact about the CONTAINER, not about your data. 103,200 pascals does not fit uint16 (max 65535) and does fit uint32 — the label said so before the data existed.",
            "Print the object itself in a notebook (print(np.iinfo(np.int16))) and NumPy renders a formatted card with every limit at once.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.iinfo",
          purpose: "Report the limits of an integer dtype: its width in bits, its minimum and its maximum.",
          signature: "np.iinfo(int_type)",
          purposeDetail:
            "iinfo is the label on the tin. Every integer dtype on NumPy's menu has fixed, knowable limits — int8 spans -128 to 127, uint16 spans 0 to 65535 — and memorizing them is exactly the wrong instinct when the library will read them out for you. The professional habit is a pre-flight check: hold your data's observed min and max against iinfo's .min and .max for the dtype you were considering, and step up the width ladder until the values fit. It is also your defense against this lesson's cliff — silent wraparound — because the values that wrap are precisely the ones that do not fit the label.",
          params: [
            {
              name: "int_type",
              type: "dtype, name string, or integer type",
              required: true,
              description: "The integer type to inspect: a NumPy type like np.uint8, a name like \"int16\", or any integer dtype object.",
              example: "np.uint8 or \"int16\"",
            },
          ],
          returns: {
            type: "iinfo instance",
            description: "An object with .min, .max, .bits, .dtype and .key; printing it renders a formatted card of every limit at once.",
          },
          example: `import numpy as np

info = np.iinfo(np.int8)
print(info.dtype, ":", info.min, "to", info.max)

# the practical question: do these sensor ids fit in uint8?
ids = np.array([0, 77, 250])
u8 = np.iinfo(np.uint8)
print("ids fit in uint8:", (ids >= u8.min).all() and (ids <= u8.max).all())
`,
          exampleOutput: `int8 : -128 to 127
ids fit in uint8: True`,
          commonMistakes: [
            {
              mistake: "Calling iinfo on a float dtype.",
              why: "Floats have no integer min/max — their walls are eps and the largest finite value — so NumPy refuses with ValueError: Invalid integer data type 'f'.",
              fix: "Integers -> np.iinfo, floats -> np.finfo. The two are a matched pair, never interchangeable.",
            },
            {
              mistake: "Checking only the maximum ('my values never exceed 250, uint8 is fine').",
              why: "Negative readings are equally fatal: uint8's minimum is 0, and values below it are exactly as wrong as values above 255 — creation refuses in NumPy 2, and arithmetic wraps silently.",
              fix: "Check BOTH ends: values.min() >= info.min and values.max() <= info.max. Two comparisons, zero wraparound surprises.",
            },
            {
              mistake: "Using the sample's limits to pick a dtype with no headroom.",
              why: "iinfo describes the container, not your data's future; tomorrow's sensor spike does not consult yesterday's sample.",
              fix: "Budget deliberately: if the observed maximum is within a factor of two of the limit, step up one width. The ladder is cheap; the cliff is not.",
            },
          ],
          related: [
            { name: "np.finfo", relation: "The float twin: reports eps, max and smallest_normal for float types." },
            { name: "np.dtype", relation: "The dtype object itself — .itemsize is the width that iinfo's limits live inside." },
            { name: "np.can_cast", relation: "Asks the related question 'may I convert?' — Lesson b-06's legality checker." },
          ],
          applications: [
            "Pre-flight range checks before downcasting columns to narrow dtypes (this part's mini project)",
            "Choosing storage types for binary file formats and database columns (Part J)",
            "Diagnosing a mysteriously wrong number by testing whether wraparound occurred",
          ],
          notes: "iinfo accepts NumPy integer types (np.uint8), their string names (\"uint8\"), and dtype objects interchangeably. There is one iinfo instance per integer type — iinfo(np.int16) is iinfo(np.int16) is True.",
        },
        {
          kind: "text",
          text: "Integer limits are walls — you hit them, you wrap. Floats have softer but sneakier limits: a **largest finite value** (past it waits `inf`), a **smallest normal**, and — the one that matters daily — **eps**, the gap between 1.0 and the next representable float. Any change smaller than eps relative to the value's size simply vanishes into rounding. A float64's eps is about 2.22e-16 — sixteen honest digits. A float32's is about 1.19e-07 — roughly seven. A float16's eps is 0.000977 — barely three digits past the decimal point.",
        },
        {
          kind: "code",
          title: "The float facts, read off the label",
          code: `import numpy as np

for name in ("float16", "float32", "float64"):
    fi = np.finfo(name)
    print(fi.dtype.name, ":", fi.bits, "bits")
    print("  eps :", fi.eps)
    print("  max :", fi.max)
`,
          output: `float16 : 16 bits
  eps : 0.000977
  max : 65500.0
float32 : 32 bits
  eps : 1.1920929e-07
  max : 3.4028235e+38
float64 : 64 bits
  eps : 2.220446049250313e-16
  max : 1.7976931348623157e+308`,
          outputNote: "eps is the resolution near 1.0 — the smallest relative change a float can register. max is the largest FINITE value; the next stop is inf, and getting there raises a warning rather than an error.",
          explain: [
            "Read the eps column as 'honest digits': 16 for float64, about 7 for float32, about 3 for float16.",
            "max is enormous for every width (65500 for float16 is the smallest of them) — range is almost never the reason a narrow float fails you; resolution is.",
            "np.finfo also knows .smallest_normal (about 1.18e-38 for float32) — the smallest number with full precision. Numbers below it exist (subnormals) but lose precision from the bottom.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.finfo",
          purpose: "Report the limits of a floating-point dtype: eps, the largest and smallest values, and the precision in digits.",
          signature: "np.finfo(dtype)",
          purposeDetail:
            "finfo is iinfo's twin for floats, but the facts it reports are stranger because float limits are stranger. .eps is the gap between 1.0 and the next representable float — the resolution of your arithmetic at that magnitude. .max is the largest finite value. .smallest_normal is where numbers stop being normal-sized. These numbers decide whether float32 suffices for your data (about 7 honest digits) or whether you need float64's 16 — a memory-versus-precision decision this part's mini project makes for a ten-million-row table, and one that Part F will meet again when accumulated error makes 0.1 + 0.2 disagree with 0.3.",
          params: [
            {
              name: "dtype",
              type: "dtype, name string, or float type",
              required: true,
              description: "The floating type to inspect: a NumPy type like np.float32, a name like \"float16\", or a float dtype object. Complex types are accepted; their float part is reported.",
              example: "np.float32",
            },
          ],
          returns: {
            type: "finfo instance",
            description: "An object with .eps, .max, .min, .bits, .precision, .smallest_normal and more; printing it renders a full parameter card.",
          },
          example: `import numpy as np

fi = np.finfo(np.float32)
print(fi.dtype.name)
print("max :", fi.max)
print("eps :", fi.eps)
print("smallest normal:", fi.smallest_normal)
print("1 + eps != 1    :", np.float32(1.0) + fi.eps != np.float32(1.0))
`,
          exampleOutput: `float32
max : 3.4028235e+38
eps : 1.1920929e-07
smallest normal: 1.1754944e-38
1 + eps != 1    : True`,
          commonMistakes: [
            {
              mistake: "Reading eps as 'the smallest number floats can hold'.",
              why: "eps is a RELATIVE gap near 1.0 (about 1.19e-07 for float32); the smallest normal float is a different quantity entirely (about 1.18e-38), and subnormals go smaller still.",
              fix: "eps answers 'are these two values distinguishable?'; smallest_normal answers 'how small can a full-precision number be?'. Different questions, different attributes.",
            },
            {
              mistake: "Calling finfo on an integer dtype.",
              why: "Integers are exact — they have no eps — so NumPy refuses with ValueError: data type <class 'numpy.int32'> not inexact.",
              fix: "Integers -> np.iinfo, floats -> np.finfo. The error message is telling you exactly which twin you want.",
            },
            {
              mistake: "Choosing float16 for measured data because its range (±65500) 'is enough'.",
              why: "Range is not resolution: above 1024, float16's spacing is 2, so odd integers stop existing (2049 becomes 2048); above 2048, only multiples of 4 survive.",
              fix: "Match eps to the precision your data actually claims: ~3 digits -> float16, ~7 -> float32, ~16 -> float64.",
            },
          ],
          related: [
            { name: "np.iinfo", relation: "The integer twin: min/max/bits for every integer dtype." },
            { name: "np.spacing", relation: "Returns the gap to the next float AT a given value — eps generalized to any magnitude." },
            { name: "np.nextafter", relation: "Answers 'what IS the next representable float after this one?' directly." },
          ],
          applications: [
            "Deciding float32 vs float64 for large measured datasets before allocating memory",
            "Setting tolerances: is this difference real signal or floating-point noise?",
            "Explaining precision surprises like 0.1 + 0.2 != 0.3 before Part F formalizes them",
          ],
          notes: "In NumPy 2, .tiny was renamed .smallest_normal (the old name still works as an alias). Printing the finfo object renders every parameter in one formatted card — handy in a notebook.",
        },
        {
          kind: "text",
          text: "You have been writing dtype *names* your whole Part B career; it is time to meet the object itself. `np.dtype(\"int32\")` builds one; `np.dtype(np.int32)` builds the same one (compare with `==`, not `is`). Every dtype carries a small passport: `.name` for humans (`\"int32\"`), `.itemsize` for memory planners (4), `.kind` for the one-letter family (`\"i\"`), and `.str` for byte-level work (`\"<i4\"` — little-endian, integer, 4 bytes). That last code is the passport Lesson b-06's `.view()` and Part J's binary files will stamp constantly.",
        },
        {
          kind: "functionDoc",
          name: "np.dtype",
          purpose: "Create or inspect a dtype object — the machine-readable description of one element type.",
          signature: "np.dtype(dtype, align=False, copy=False)",
          purposeDetail:
            "Every array carries a dtype object, and np.dtype is how one is built from a name, a type, or a code. The object is the label read by the whole ecosystem: .name for humans ('float32'), .itemsize for memory planners (4), .kind for the one-letter family ('f'), .str for byte-level work ('<f4' — little-endian, float, 4 bytes). You rarely need to build one by hand — dtype=... accepts names and types directly — but reading one fluently turns 'what is this array, really?' from a guess into an inspection. The .str codes are also the working vocabulary of Lesson b-06's .view() and Part J's binary files, where bytes meet interpretations head-on.",
          params: [
            {
              name: "dtype",
              type: "dtype, name string, type, or dict",
              required: true,
              description: "What to build the dtype from: a name like \"int32\", a NumPy type like np.uint8, a short code like \"f8\", or (advanced) a field description for structured records.",
              example: "\"float32\" or np.int16",
            },
            {
              name: "align",
              type: "bool",
              description: "For structured dtypes only: pad fields to memory alignment. Part J territory.",
              example: "align=False",
            },
            {
              name: "copy",
              type: "bool",
              description: "Force a duplicate when handed an existing dtype object instead of reusing it.",
              example: "copy=False",
            },
          ],
          returns: {
            type: "dtype",
            description: "The dtype object: .name, .itemsize, .kind, .char, .str, .byteorder; compare with ==.",
          },
          example: `import numpy as np

dt = np.dtype("int32")
print(dt.name, dt.itemsize, "bytes, kind", dt.kind, "code", dt.str)
print("equal to np.dtype(np.int32):", dt == np.dtype(np.int32))
print(np.dtype("f8"), np.dtype("U10"), np.dtype("?"))
`,
          exampleOutput: `int32 4 bytes, kind i code <i4
equal to np.dtype(np.int32): True
float64 <U10 bool`,
          commonMistakes: [
            {
              mistake: "Comparing dtypes with is instead of ==.",
              why: "dtype objects are not guaranteed singletons: two separately built int32 dtypes describe the same type but need not be the same object.",
              fix: "Use == — it compares the type description, which is what you mean. (values.dtype == np.dtype(\"int64\") is the boundary check to write.)",
            },
            {
              mistake: "Reading '<U5' as 'five BYTES of string'.",
              why: "The 5 counts CHARACTERS, and each <U character costs 4 bytes of memory — np.array([\"abcde\"]).nbytes is 20, not 5.",
              fix: "Budget string memory as characters x 4 — one more reason strings are second-class citizens in arrays (below).",
            },
            {
              mistake: "Assuming np.dtype(\"int\") means 8 bytes everywhere and always.",
              why: "On Windows under NumPy 1.x the default integer was int32 (a C long), and code that assumed 64-bit ints broke silently across platforms.",
              fix: "NumPy 2 made the default int64 on every platform — but when a width matters, say the width: np.int64, never the ambiguous \"int\".",
            },
          ],
          related: [
            { name: "ndarray.dtype", relation: "Every array's attribute — the instance this constructor builds." },
            { name: "np.iinfo / np.finfo", relation: "Read the LIMITS of the type a dtype object describes." },
            { name: "np.result_type", relation: "Predicts which dtype an operation's results get (Lesson b-06)." },
          ],
          applications: [
            "Memory budgeting: rows x np.dtype(name).itemsize before the data exists",
            "Binary interop: .str codes like '<i4' describe bytes on disk (Part J)",
            "API boundaries: assert values.dtype == np.dtype(\"float64\") at the door",
          ],
          notes: "In NumPy 2, dtype objects have specific classes — type(np.dtype(\"int32\")).__name__ is Int32DType — instead of one shared class. Nothing changes for == comparisons; only type() checks would notice.",
        },
        {
          kind: "heading",
          text: "The cliff: silent integer wraparound",
        },
        {
          kind: "text",
          text: "Here is the cliff this lesson exists for. CPUs add fixed-width integers by adding all the bits and **dropping the carry that does not fit**. There is no error, no warning, and no clamping to the maximum — the number wraps around like a car odometer rolling past 999,999. For int8 the odometer has 256 positions: the true answer 100 + 100 is 200, and 200 does not exist on the dial, so the hardware hands you 200 - 256 = -56. Every integer overflow in NumPy is this one sentence.",
        },
        {
          kind: "code",
          title: "The cliff, proven",
          code: `import numpy as np

a = np.array([127], dtype=np.int8)        # the ceiling of int8
print("127 + 1  =", a + 1)                # wraps to the FLOOR: -128

b = np.array([250], dtype=np.uint8)       # unsigned: the wall is at 256
print("250 + 10 =", b + 10)               # 260 does not exist; 260 - 256 does

c = np.array([100, 100, 100], dtype=np.int8)
print("100+100+100 =", c + c + c)         # 300 wraps the same way: 300 - 256
`,
          output: `127 + 1  = [-128]
250 + 10 = [4]
100+100+100 = [44 44 44]`,
          outputNote: "No warnings were printed. The results are not errors, not inf, and not clamped at the limits — they are the true answers modulo 256, wearing the dtype's sign convention.",
          explain: [
            "127 + 1 wraps to -128: int8's positions form a circle, and stepping past the ceiling lands on the floor.",
            "250 + 10 = 4 in uint8: the same modular arithmetic with a floor of 0 instead of -128.",
            "c + c + c proves it is not a one-element curiosity — whole arrays wrap together, silently, which is what makes this bug so expensive in the wild.",
          ],
        },
        {
          kind: "code",
          title: "NumPy 2 refuses at the door — but only at the door",
          code: `import numpy as np

# Building from PYTHON integers checks every value against the label:
# 200 does not fit int8, so creation itself refuses.
np.array([200], dtype=np.int8)
`,
          expectError: "OverflowError: Python integer 200 out of bounds for int8",
          outputNote: "This is the asymmetry to internalize: converting Python ints into a narrow dtype validates bounds; arithmetic between NumPy values does not. The next block's pre-flight check is how you close that gap.",
        },
        {
          kind: "text",
          text: "Read that asymmetry twice, because it is where real bugs live. **Creating** a narrow array from Python integers validates every value (NumPy 2 behavior — in NumPy 1.x it wrapped here too, with at most a warning). But **arithmetic** on existing arrays never checks: the result dtype was decided before the first byte was added, and the hardware simply drops the carry. The defense is a two-line pre-flight check with iinfo — hold your data against the label before you commit to the narrow type.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The pre-flight check",
          text: "Before committing a column to a narrow integer dtype: lo = values.min(); hi = values.max(); info = np.iinfo(candidate); if lo >= info.min and hi <= info.max, the dtype is safe for the values you have seen — and leave headroom for the values you have not. If it does not fit, step up the ladder (int8 -> int16 -> int32). The check costs two comparisons; the cliff costs a silently wrong dataset.",
        },
        {
          kind: "heading",
          text: "float16 and float32: precision is a budget too",
        },
        {
          kind: "text",
          text: "Floats never wrap — they have a different failure mode: **precision loss**, gradual and silent. Within a float, spacing grows with magnitude: near 1.0 a float16 steps by 0.000977, but above 1024 it steps by 2, so odd integers simply stop existing; above 2048 only multiples of 4 survive. This is why 'the range is enough' is never the whole question for floats — **resolution at your values' magnitude** is the question. When is float32 the right call? When the data is *measured* (sensors, audio, images rarely carry 7 honest digits), when it is big (half the bytes of float64, twice the memory bandwidth), and when the hardware is native to it — every GPU on earth speaks float32. float64 stays the default because headroom is cheap when your data is small.",
        },
        {
          kind: "code",
          title: "Precision loss, made visible",
          code: `import numpy as np

h = np.array([0.1, 1/3], dtype=np.float16)
print(h)
print("exact values:", [float(x) for x in h])
print("odd number 2049 becomes:", np.float16(2049.0))
print("float32 keeps 2049 exactly :", np.float32(2049.0))
`,
          output: `[0.1    0.3333]
exact values: [0.0999755859375, 0.333251953125]
odd number 2049 becomes: 2048.0
float32 keeps 2049 exactly : 2049.0`,
          outputNote: "float16(0.1) is really 0.0999755859375 — three honest digits, no more. And 2049 is unrepresentable: the nearest float16 is 2048.0, with no error and no warning. float32 keeps 2049 exact by a wide margin (its integers are exact up to 16,777,216).",
          explain: [
            "Printing shows [0.1 0.3333] because NumPy prints the shortest string that round-trips — the exact stored values are the second line.",
            "2049 -> 2048.0 is precision loss, not overflow: float16's max is 65500, far above 2049. The spacing at that magnitude is 2.",
            "float32's integers are exact up to 2^24 (16,777,216) — one of several reasons it is the workhorse float of data science.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Which float, honestly",
          text: "float64 by default — when in doubt and when data is small, take the 16 digits. float32 when the data is measured, large, or GPU-bound — 7 digits almost always covers what the sensor actually measured. float16 almost only for ML weight storage and experimentation, where memory pressure beats precision. And never choose a float when the values must be exact integers — that is what the integer menu is for.",
        },
        {
          kind: "heading",
          text: "bool: the one-byte flag",
        },
        {
          kind: "text",
          text: "**bool** is a full first-class dtype whose two values are stored as 0 and 1 — one full byte per element, not one bit (NumPy does not bit-pack; `np.packbits` exists for when you truly need packing). Bools convert to integers exactly the way you would hope — False is 0, True is 1 — and arithmetic on them promotes to integers. Their real job arrives in Part E: masks that select, filter and gate other arrays. For now, know them as the smallest honest member of the menu.",
        },
        {
          kind: "code",
          title: "bools are numeric zeros and ones",
          code: `import numpy as np

m = np.array([True, False, True])
print(m.dtype, "-", m.itemsize, "byte per flag")
print("as integers:", m.astype(np.int64))
print("count of True:", m.sum())
`,
          output: `bool - 1 byte per flag
as integers: [1 0 1]
count of True: 2`,
          outputNote: "One byte per flag, values 0 and 1 underneath, and .sum() counts Trues — the trick behind every 'how many rows match?' question in Part E.",
          explain: [
            "astype(np.int64) shows the numeric identity: [1 0 1]. Comparisons produce exactly this dtype (Part E's foundation).",
            "m.sum() promotes to integers and counts: sum of a bool array is its number of True values.",
          ],
        },
        {
          kind: "heading",
          text: "Second-class citizens: strings and object arrays",
        },
        {
          kind: "text",
          text: "The menu has two more types, and honesty requires calling them second-class. `<U` **strings** are fixed-width: `np.array([\"hi\", \"world\"])` becomes dtype `<U5` — five UCS4 characters per element, four bytes each, with shorter strings padded. Fine for labels; hostile to text processing (no variable length, every operation slower than the numeric ones). **object** arrays store Python pointers instead of packed values — they can hold anything, and they give up everything an array is FOR: the speed, the memory density, most vectorized operations. NumPy 2 even has a surprise in store: hand it a mixed bag of int, str and float and it *stringifies everything* rather than building an object array. Heterogeneous data belongs in a list or a DataFrame, and there is no shame in that — the packed numeric grid is where arrays win.",
        },
        {
          kind: "code",
          title: "The grab-bag behavior, verified",
          code: `import numpy as np

s = np.array(["hi", "world"])
print(s, s.dtype)

grab_bag = np.array([1, "two", 3.0])
print(grab_bag, grab_bag.dtype)

as_object = np.array([1, "two", 3.0], dtype=object)
print(as_object, as_object.dtype)
`,
          output: `['hi' 'world'] <U5
['1' 'two' '3.0'] <U32
[1 'two' 3.0] object`,
          outputNote: "The string width is set by the LONGEST element (<U5, <U2 in the examples from Lesson b-04). The mixed list became a <U32 string array — NumPy 2 prefers stringifying over object arrays. The explicit dtype=object escape hatch still exists when you truly need it.",
          explain: [
            "np.array([\"hi\", \"w\"]) is <U2 — the width is set by the LONGEST string (\"hi\"), and every shorter string is padded to it, which is why appending a longer string later forces a whole new array.",
            "The grab-bag line is the surprise: [1, 'two', 3.0] becomes ['1' 'two' '3.0'] — the numbers were rendered as TEXT, and every one of them is now a string.",
            "dtype=object keeps the original Python objects — and gives up vectorized speed: object arrays run Python-speed loops, not compiled ones.",
          ],
        },
        {
          kind: "heading",
          text: "A peek at datetime64 and timedelta64",
        },
        {
          kind: "text",
          text: "One more family deserves a look, because it is first-class where it counts. **datetime64** stores dates and times as integers with a unit — `\"2024-06-01\"` as datetime64[D] is the integer number of days since the epoch. Subtract two datetimes and you get a **timedelta64** — a duration, also unit-tagged. Ranges work: `np.arange` steps through dates like through any integers. Time-series data (Part H leans on it) gets real compression and real vectorized date arithmetic instead of Python datetime objects in a list.",
        },
        {
          kind: "code",
          title: "Dates as first-class array citizens (deterministic)",
          code: `import numpy as np

launch = np.datetime64("2024-01-01")
arrival = np.datetime64("2024-06-01")
print("days between:", arrival - launch)

months = np.arange("2024-01", "2024-07", dtype="datetime64[M]")
print(months)
print(months.dtype)
`,
          output: `days between: 152 days
['2024-01' '2024-02' '2024-03' '2024-04' '2024-05' '2024-06']
datetime64[M]`,
          outputNote: "The subtraction produced a timedelta64 in days (152 of them). arange stepped whole months with the same half-open rule as every NumPy range: the stop 2024-07 is excluded, so January through June is six values.",
          explain: [
            "datetime64 values carry their unit in brackets: [D] for days, [M] for months, [s] for seconds, [ms] for milliseconds.",
            "arrival - launch is a timedelta64[D] holding 152 — integer arithmetic underneath, human-readable formatting on top.",
            "Dates built from explicit strings are as deterministic as integers. 'Now' and 'today' are not — see the display block below.",
          ],
        },
        {
          kind: "code",
          title: "What now-today code looks like (display only)",
          lang: "text",
          code: `# These depend on the moment you run them, so they are never shown
# as verified output anywhere in this course:
np.datetime64("now")      # the current moment, in microsecond units
np.datetime64("today")    # today's date, in day units

# Build explicit dates instead whenever you need reproducibility:
np.arange("2024-01-15", "2024-01-20", dtype="datetime64[D]")
# -> array(['2024-01-15', '2024-01-16', '2024-01-17',
#           '2024-01-18', '2024-01-19'], dtype='datetime64[D]')
`,
          outputNote: "now and today change on every run and every machine — machine-dependent output is illustrated, never claimed. The date-string arange below them IS deterministic and runs in the block above.",
        },
        {
          kind: "tryIt",
          title: "The limits playground",
          task: "Press Run, then: (1) predict sensor + 1 before you see it; (2) change the sensor value to -128 and subtract 1 in a new print — what number appears, and why that one?; (3) change the dtype to uint8, set the value to 250, and add 10; (4) use np.iinfo to find the first integer dtype on the ladder whose limits hold -40 through 320, and print its name.",
          code: `import numpy as np

print("int8 :", np.iinfo(np.int8).min, "to", np.iinfo(np.int8).max)
print("uint8:", np.iinfo(np.uint8).min, "to", np.iinfo(np.uint8).max)

sensor = np.array([127], dtype=np.int8)
print("sensor + 1:", sensor + 1)
`,
          hint: "int8's dial runs -128..127 and uint8's runs 0..255; stepping past either end lands you on the opposite side minus what you carried. For (4): check int16's label — -40 already rules out every unsigned type, and 320 rules out int8.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Four families: bool (1 byte, yes/no), integers (1-8 bytes, exact, walls at iinfo's min and max), floats (2-8 bytes, approximate, eps is the resolution), complex (two floats per element). Integer values that walk past their wall wrap silently — the pre-flight iinfo check is the only guard. Strings and object arrays exist but are second-class; datetime64 is the first-class citizen for time.",
        },
      ],
      terms: [
        { term: "itemsize", definition: "The width of one element in bytes — the number every memory budget multiplies by. size x itemsize = nbytes." },
        { term: "Silent wraparound", definition: "Integer overflow in fixed-width arithmetic: the carry that does not fit is dropped, so the result is the true answer modulo 2^bits (256 for 8-bit types), with no error and no warning." },
        { term: "Machine epsilon (eps)", definition: "The gap between 1.0 and the next representable float in a given dtype — the resolution of float arithmetic near 1.0. float64 ~2.22e-16, float32 ~1.19e-07, float16 ~0.000977." },
        { term: "dtype kind", definition: "The one-letter family code on every dtype: b (bool), i (signed int), u (unsigned int), f (float), c (complex), plus U (string), m/M (timedelta/datetime), O (object)." },
        { term: "datetime64 / timedelta64", definition: "First-class NumPy dtypes for dates/times and durations: integers with a unit tag ([D], [M], [s]...), giving packed storage and vectorized date arithmetic." },
      ],
      mistakes: [
        {
          mistake: "Choosing uint8 for sensor readings because 'they are small', without checking for negatives.",
          why: "uint8's floor is 0. A reading of -1 cannot exist there: creating from Python ints refuses in NumPy 2, but arithmetic wraps — np.array([1], dtype=np.uint8) - 2 is 255, a huge positive spike invented out of a small negative dip.",
          fix: "Any column that can go negative needs a signed type (int8, int16, ...). The pre-flight check tests both ends: values.min() >= info.min AND values.max() <= info.max.",
        },
        {
          mistake: "Expecting NumPy to raise (or at least warn) on integer overflow the way floats warn on division by zero.",
          why: "Integer wraparound is the hardware's normal behavior and NumPy passes it through silently. Only CREATION from Python integers validates bounds (NumPy 2); arithmetic never does.",
          fix: "Assume wraparound is possible whenever a narrow dtype meets unbounded math. Check with iinfo before the operation, or detect after (results that jump to the opposite sign were wrapped).",
        },
        {
          mistake: "Assuming the printed array shows the exact stored values (0.1 is 'in' the float16 array).",
          why: "NumPy prints the shortest string that round-trips to the stored value, so 0.0999755859375 displays as 0.1. The value you see and the bits you have are different things.",
          fix: "When precision matters, look underneath: float(x), x.item(), or x.view(...) (Lesson b-06) show what is really stored.",
        },
      ],
      takeaways: [
        "The menu is four families: bool, integers (signed/unsigned x 4 widths), floats (3 widths), complex (2 widths). The name states the width in bits; itemsize is its bytes.",
        "np.iinfo and np.finfo read the label: min/max/bits for integers, eps/max/smallest_normal for floats. Never guess a limit the library will read out.",
        "The cliff: integer arithmetic past the dtype's wall wraps silently (200 becomes -56 in int8). Creation from Python ints validates; arithmetic does not.",
        "Floats do not wrap — they blur. eps is the resolution; float16 loses odd integers above 1024; float32 keeps integers exact to 16,777,216 and is the measured-data workhorse.",
        "Strings (<U, fixed width, 4 bytes per character) and object arrays (Python pointers, Python speed) are second-class citizens; datetime64/timedelta64 are first-class citizens for time.",
      ],
      quiz: [
        {
          id: "b-05-q1",
          prompt: "`np.array([100], dtype=np.int8) + 100` produces:",
          options: [
            { text: "[-56] — the true answer 200 does not fit int8, so it wraps: 200 - 256 = -56", correct: true, feedback: "Exactly the cliff: fixed-width integer arithmetic drops the carry, silently. 200 lives at position -56 on int8's 256-position dial." },
            { text: "[200] — NumPy widens to int16 to keep the value", correct: false, feedback: "That is what OLD NumPy did with value-based scalar promotion (Lesson b-06 tells that history). NumPy 2 keeps the array's dtype — and wraps." },
            { text: "[127] — int8 saturates at its ceiling", correct: false, feedback: "Saturating arithmetic exists in some DSP hardware, but not here: NumPy integers wrap, they do not clamp." },
            { text: "OverflowError: the result does not fit int8", correct: false, feedback: "Only CREATING from Python integers validates bounds. Arithmetic between existing arrays never checks." },
          ],
          explanation: "Integer overflow in NumPy is silent modular arithmetic — 100 + 100 is -56 in int8, and no warning is printed.",
        },
        {
          id: "b-05-q2",
          prompt: "A column of integer counts has observed values from -40 to 320. The smallest-memory integer dtype that safely holds it is:",
          options: [
            { text: "int8", correct: false, feedback: "320 is past int8's ceiling of 127 — those counts would wrap." },
            { text: "uint8", correct: false, feedback: "Doubly wrong: -40 is below the floor of 0, and 320 is past the ceiling of 255." },
            { text: "int16", correct: true, feedback: "Right: -32768 <= -40 and 320 <= 32767, at 2 bytes per value — one step up the ladder covers both ends." },
            { text: "float64, because floats hold big ranges", correct: false, feedback: "It would hold the values — at 8 bytes, 4x the necessary cost, and counts deserve exact integers, not approximations." },
          ],
          explanation: "Check both ends against np.iinfo's label and climb the width ladder until both fit: -40 kills the unsigned types, 320 kills int8, int16 is the first survivor.",
        },
        {
          id: "b-05-q3",
          prompt: "`np.float16(2049.0)` comes back as 2048.0. The honest explanation is:",
          options: [
            { text: "2049 exceeds float16's maximum, so it rounds down to the largest safe value", correct: false, feedback: "float16's max is 65500 — 2049 is nowhere near the ceiling. Range is not the issue." },
            { text: "Above 1024, float16's values are spaced 2 apart — odd integers simply do not exist there", correct: true, feedback: "Correct: eps grows with magnitude, and at 2049 the representable neighbors are 2048 and 2050. 2049 was never available to store." },
            { text: "It rounds to the nearest even number", correct: false, feedback: "Banker's rounding is a np.round behavior; this is representability — no 16-bit float pattern equals 2049." },
            { text: "A bug in NumPy 2's float16 support", correct: false, feedback: "It is IEEE 754 half-precision working exactly as specified — the same physics applies to float32 and float64 at larger magnitudes." },
          ],
          explanation: "Float precision is a spacing budget: 11 bits of mantissa give float16 exact integers only up to 2048, so 2049 must land on a neighbor.",
        },
      ],
    },


    // ------------------------------------------------------------- b-06
    {
      slug: "b-06",
      title: "Casting and Promotion: Who Decides the Type",
      minutes: 22,
      summary:
        "The system underneath every mixed-dtype expression: astype's always-a-copy conversions (and its truncation trap), the five-rung casting safety ladder, .view's zero-copy reinterpretation of the same bytes, the promotion rulebook (promote_types, result_type, can_cast), and NumPy 2's weak-scalar rule — ending with the most famous error in NumPy: adding a float to an integer array in place.",
      kind: "concept",
      objectives: [
        "Convert arrays with a.astype and prove with np.shares_memory that the result is always a fresh copy, even when the dtype does not change",
        "Explain why float-to-int astype truncates toward zero instead of rounding, and build the np.round two-step recipe when rounding is wanted",
        "Reinterpret bytes in place with .view(dtype), pairing int16 cells into int32 values, and predict the endianness surprise",
        "Predict the dtype of any mix in advance with np.promote_types, np.result_type and np.can_cast",
        "State NumPy 2's weak-scalar promotion rule (NEP 50) and recognize the errors that guard it, including the in-place casting error",
      ],
      why: "Real pipelines mix dtypes at every seam: a uint8 image meets a float32 filter, an int32 counter meets a Python constant, a float32 sensor array meets a float64 threshold — and at every mix, someone must decide the type of the result. Get that decision wrong and you either lose data silently (a 300 that becomes 44) or crash loudly (the in-place error nearly every NumPy user meets in their first month). This lesson hands you the entire decision system: astype for deliberate conversion, view for byte-level reinterpretation, promote_types and result_type for predicting any mix before running it, and NumPy 2's weak-scalar rule — the biggest behavior change in NumPy's history, and the reason every output in this course is reproducible.",
      blocks: [
        {
          kind: "text",
          text: "You now hold the whole dtype menu from Lesson b-05. But data never stays politely in one type. A uint8 image needs float math; an int32 counter meets the Python constant 3; a float32 sensor array meets a float64 threshold. Every one of those meetings asks the same question: **who decides the type of the result?** This lesson is the answer key. NumPy 2.0 ships the cleanest version of that answer in the library's history (a ruleset called NEP 50), and once you can read it, three mysteries dissolve at once: why some conversions silently destroy values, why one famous error exists, and what dtype any expression will produce — before you run it.",
        },
        {
          kind: "heading",
          text: "astype: conversion, always in a fresh block",
        },
        {
          kind: "text",
          text: "`a.astype(dtype)` is the deliberate conversion: it reads every value of `a` and writes its numeric meaning into a **new array** of the requested type. Two guarantees, both worth memorizing. First, astype **always allocates a new block** — even when you 'convert' to the dtype the array already has. Second, the conversion is about *values*, not bytes: the number 300 stays 300 when it moves from int64 to int32, provided it fits. Both guarantees are the exact opposite of what `.view()` does later in this lesson — keep that contrast in mind the whole way through.",
        },
        {
          kind: "code",
          title: "astype always builds a new block",
          code: `import numpy as np

a = np.array([1, 2, 3], dtype=np.int64)
b = a.astype(np.int32)      # the conversion everyone writes
c = a.astype(np.int64)      # even to the SAME dtype

print("b shares a's memory:", np.shares_memory(a, b))
print("c shares a's memory:", np.shares_memory(a, c))

b[0] = 99                   # writes land in b's own block
print("after b[0] = 99, a is untouched:", a)
`,
          output: `b shares a's memory: False
c shares a's memory: False
after b[0] = 99, a is untouched: [1 2 3]`,
          outputNote: "Both checks print False: astype never shares memory with its input, even for a same-to-same 'conversion'. And because b owns its own block, writing through b cannot reach a — that is what 'always a copy' buys you.",
          explain: [
            "np.shares_memory(a, b) is the definitive copy-or-view test: True means the two arrays can see at least one byte of the same block.",
            "c = a.astype(np.int64) looks like a no-op but still copies — handy when you need a defensive copy to hand to code that might mutate its input.",
            "This is the mirror image of Lesson b-04's np.asarray, which copies only when it must. astype is deliberately wasteful because real conversion work is expensive anyway.",
          ],
        },
        {
          kind: "text",
          text: "One conversion surprises every newcomer: **float to int does not round — it truncates toward zero.** The fraction is simply dropped: 2.99 becomes 2, 3.50 becomes 3, and -1.70 becomes -1 (toward zero, not toward negative infinity). If you want rounding you must ask for it explicitly, with `np.round` first — and even then know what you are getting: NumPy rounds halves to the *even* neighbor, so 2.5 rounds to 2 and 3.5 to 4.",
        },
        {
          kind: "code",
          title: "Truncation, not rounding",
          code: `import numpy as np

prices = np.array([2.99, 3.50, -1.70, 4.00])
print("astype(int64):", prices.astype(np.int64))   # drops fractions
print("np.round    :", np.round(prices).astype(np.int64))
`,
          output: `astype(int64): [ 2  3 -1  4]
np.round    : [ 3  4 -2  4]`,
          outputNote: "Line one truncates toward zero: [2 3 -1 4]. Line two is the two-step rounding recipe: [3 4 -2 4]. The 3.50 is the tell — truncated it becomes 3, rounded it becomes 4.",
          explain: [
            "astype(np.int64) drops every fraction toward zero: 2.99 -> 2, 3.50 -> 3, -1.70 -> -1, 4.00 -> 4.",
            "np.round(prices).astype(np.int64) is the recipe when rounding is wanted: round while still a float, THEN convert.",
            "np.round rounds halves to the nearest EVEN integer (2.5 -> 2, 3.5 -> 4) — the IEEE default, chosen because it does not drift statistically over millions of operations.",
          ],
        },
        {
          kind: "functionDoc",
          name: "a.astype",
          purpose: "Convert an array to a different dtype, always producing a new array (a copy) — never a view.",
          signature: "a.astype(dtype, order='K', casting='unsafe', subok=True, copy=True)",
          purposeDetail:
            "The dtype chosen at creation time does not have to be the dtype the data lives in forever: uint8 pixels need float math, int32 counts outgrow their rung, external libraries demand float64. astype is the deliberate re-containering — and its two guarantees are its personality. It converts VALUES (300 stays 300 wherever it fits), and it ALWAYS copies, even when the target dtype is the one the array already has, which makes it doubles as a defensive-copy tool. The parameter to respect is casting: the default is 'unsafe', meaning astype will perform value-destroying conversions (float-to-int truncation, out-of-range integer wraparound) without a word of warning. Passing casting='safe' makes NumPy refuse exactly those conversions instead.",
          params: [
            {
              name: "dtype",
              type: "dtype or dtype specifier",
              required: true,
              description: "The target type: a NumPy type like np.float32, a name like \"int16\", or a dtype object.",
              example: "np.float32",
            },
            {
              name: "order",
              type: "'K', 'A', 'C', or 'F'",
              description: "Memory layout of the result: keep the input's layout ('K'), require C or Fortran order. Layouts are Part C's subject.",
              example: "order='K'",
            },
            {
              name: "casting",
              type: "'no', 'equiv', 'safe', 'same_kind', or 'unsafe'",
              description: "Which conversions are legal. The default is 'unsafe' — astype will happily destroy values. 'safe' refuses any conversion that could lose information.",
              example: "casting='safe'",
            },
            {
              name: "subok",
              type: "bool",
              description: "Pass subclass types through instead of converting to a plain ndarray (rare; matters for arrays like masked arrays).",
              example: "subok=True",
            },
            {
              name: "copy",
              type: "bool",
              description: "New in NumPy 2. With copy=False, astype returns the input itself when no conversion is needed, and raises if a copy is unavoidable.",
              example: "copy=True",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array with the requested dtype. It never shares memory with the input (verify any time with np.shares_memory).",
          },
          example: `import numpy as np

prices = np.array([2.99, 3.50, -1.70])
cents = prices.astype(np.int64)             # truncates toward zero
print(cents, cents.dtype)
print("shares memory:", np.shares_memory(prices, cents))

same = prices.astype(np.float64)            # same dtype: STILL a copy
print("same-dtype copy shares memory:", np.shares_memory(prices, same))
`,
          exampleOutput: `[ 2  3 -1] int64
shares memory: False
same-dtype copy shares memory: False`,
          commonMistakes: [
            {
              mistake: "Expecting float-to-int astype to round.",
              why: "astype truncates toward zero: 2.99 becomes 2 and 3.50 becomes 3. The fraction is dropped, not considered.",
              fix: "Round first, convert second: np.round(x).astype(np.int64) — and remember halves go to the even neighbor.",
            },
            {
              mistake: "Expecting astype to check values against the target's limits.",
              why: "astype's default casting rule is 'unsafe': np.array([300], dtype=np.int64).astype(np.uint8) wraps to 44 silently, exactly like arithmetic overflow in Lesson b-05. Only CREATION from Python integers validates bounds.",
              fix: "Pre-flight with np.iinfo (does the range fit?) or pass casting='safe' so NumPy refuses the whole conversion with a TypeError.",
            },
            {
              mistake: "Using astype to save memory on a view you never write to.",
              why: "astype always allocates a new block, so narrowing to save memory doubles peak memory during the call.",
              fix: "That is usually the right trade anyway (convert, then drop the original). But if you only want the SAME bytes read differently — no conversion at all — that is .view's job, not astype's.",
            },
          ],
          related: [
            { name: "a.view", relation: "Re-reads the same bytes as another dtype with zero copying — the opposite operation." },
            { name: "np.can_cast", relation: "Asks 'is this conversion legal under this rule?' before you run it." },
            { name: "np.asarray", relation: "Converts Python data to an array but never changes dtype — no copy when the input already qualifies." },
          ],
          applications: [
            "Downcasting columns to narrow dtypes before storage (this part's mini project)",
            "Handing a defensive copy to external code that might mutate its input",
            "Moving integer data into float arithmetic before division (Part D's territory)",
          ],
          notes: "The copy parameter is new in NumPy 2: astype(x, copy=False) returns x itself when the dtype already matches, and raises if a copy cannot be avoided. The casting default ('unsafe') is unchanged history: astype has always been the 'do it, I know what I am doing' converter.",
        },
        {
          kind: "heading",
          text: "The safety ladder: when is a cast legal?",
        },
        {
          kind: "text",
          text: "Some conversions are lossless by construction — every int32 value survives a move to int64. Others can destroy information — an int64 might overflow an int32; a float64's fraction dies on the way to an int. NumPy grades every conversion on a five-rung ladder, and every cast in the library — astype, in-place operators, the inner loops of ufuncs — names the rung it requires. Here is the part nobody expects: **astype's default rung is 'unsafe', the bottom of the ladder.** The casting parameter exists to make astype stricter, not looser.",
        },
        {
          kind: "table",
          title: "The five casting rules, strictest to loosest",
          headers: ["rule", "what it allows", "example allowed", "example refused"],
          rows: [
            ["`'no'`", "identical dtypes only", "int32 -> int32", "int32 -> int64"],
            ["`'equiv'`", "byte-order changes only", "big-endian int32 -> native int32", "int32 -> int64"],
            ["`'safe'`", "every value of the source type survives", "int32 -> int64, int32 -> float64", "int64 -> int32, float64 -> int64"],
            ["`'same_kind'`", "safe casts, plus within the same family", "float64 -> float32", "float64 -> int64"],
            ["`'unsafe'`", "anything at all; values may die", "float64 -> int8", "nothing is refused"],
          ],
          caption: "The ladder from strictest to loosest. Note the disagreement: astype defaults to 'unsafe' while np.can_cast (below) defaults to 'safe' — the two defaults tell you what each tool is FOR.",
        },
        {
          kind: "code",
          title: "The astype cliff: 300 becomes 44",
          code: `import numpy as np

big = np.array([300], dtype=np.int64)
print("stored as uint8:", big.astype(np.uint8))
`,
          output: `stored as uint8: [44]`,
          outputNote: "300 does not fit uint8's 0..255 label, and astype — defaulting to 'unsafe' — wraps it exactly like the arithmetic cliff in Lesson b-05: 300 - 256 = 44. No warning is printed.",
          explain: [
            "astype never checks VALUES against the target's iinfo label; under 'unsafe' it converts and lets the overflow fall where the hardware drops it.",
            "This is the astype cliff: a narrowing conversion whose values do not fit wraps silently — the same modular arithmetic as b-05's sensor spike, now in conversion form.",
          ],
        },
        {
          kind: "code",
          title: "The door still checks values",
          code: `import numpy as np

# The DOOR (Lesson b-05) validates values: creating from Python
# integers checks every value against the dtype's label and refuses.
np.array([300], dtype=np.uint8)
`,
          expectError: "OverflowError: Python integer 300 out of bounds for uint8",
          outputNote: "Same number, same target dtype, opposite outcome: the door refuses (OverflowError), while the astype corridor wraps to 44. NumPy 2 checks values at creation; conversion never checks.",
        },
        {
          kind: "text",
          text: "When you want the door's strictness from astype, ask for it: pass `casting=\"safe\"` and NumPy refuses any conversion that could lose information — with a TypeError that names both dtypes and the rule that was violated.",
        },
        {
          kind: "code",
          title: "Moving astype up the ladder",
          code: `import numpy as np

np.array([300], dtype=np.int64).astype(np.uint8, casting="safe")
`,
          expectError: "TypeError: Cannot cast array data from dtype('int64') to dtype('uint8') according to the rule 'safe'",
          outputNote: "Under the 'safe' rule, int64 -> uint8 is illegal no matter what the values are — the rule judges TYPES, not this array's particular numbers. That is the honest way to refuse.",
        },
        {
          kind: "text",
          text: "Before converting at scale, you can ask the ladder directly. `np.can_cast(from, to)` answers whether a conversion is legal under a given rule — by default the 'safe' rule, the strict one. It is the cheapest possible insurance: two dtype names in, one boolean out, no data touched.",
        },
        {
          kind: "code",
          title: "Asking the ladder: can_cast",
          code: `import numpy as np

pairs = [(np.int16, np.int32), (np.int32, np.int16),
         (np.int64, np.float64), (np.int64, np.float32),
         (np.uint8, np.int16)]
for frm, to in pairs:
    print(f"{np.dtype(frm).name:8s} -> {np.dtype(to).name:8s} {np.can_cast(frm, to)}")
`,
          output: `int16    -> int32    True
int32    -> int16    False
int64    -> float64  True
int64    -> float32  False
uint8    -> int16    True`,
          outputNote: "Under the 'safe' rule: widening survives, narrowing does not, and int64 -> float32 is refused — not because of range (float32's max is 3.4e38) but because float32's 24-bit mantissa cannot represent every int64 exactly.",
          explain: [
            "int16 -> int32 is True: every int16 value survives the move — the definition of 'safe'.",
            "int64 -> float32 is False for the subtle reason: large int64 values would silently lose their last digits. Float range is almost never the issue; resolution is (Lesson b-05's eps).",
            "uint8 -> int16 is True: unsigned values up to 255 all fit — the ladder judges type ranges, not signs.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.can_cast",
          purpose: "Report whether NumPy allows converting from one dtype to another under a given casting rule.",
          signature: "np.can_cast(from_, to, casting='safe')",
          purposeDetail:
            "can_cast is the legality checker for the ladder above. astype will silently perform value-destroying conversions by default, so the professional pattern is to ask first: can_cast(small, large, rule) answers yes or no without touching a single value. Its default rule is 'safe' — 'could ANY value of the source type survive?' — which is deliberately stricter than astype's default. One NumPy 2 change to internalize: can_cast no longer accepts Python scalars at all, because under old NumPy the answer depended on the VALUE (300 fit uint8, 301 did not...) — that value-based logic is exactly what NEP 50 removed.",
          params: [
            {
              name: "from_",
              type: "dtype, dtype specifier, NumPy scalar, or array",
              required: true,
              description: "The type (or array whose type) you are converting from. Python ints and floats are rejected with a TypeError.",
              example: "np.int64 or \"float32\"",
            },
            {
              name: "to",
              type: "dtype or dtype specifier",
              required: true,
              description: "The type you are converting to.",
              example: "np.uint8",
            },
            {
              name: "casting",
              type: "'no', 'equiv', 'safe', 'same_kind', or 'unsafe'",
              description: "Which rung of the ladder to judge against. Default 'safe'; 'unsafe' answers True for every pair (which is occasionally the useful question too).",
              example: "casting='safe'",
            },
          ],
          returns: {
            type: "bool",
            description: "True if the conversion is legal under the chosen rule.",
          },
          example: `import numpy as np

print(np.can_cast(np.int32, np.int64))                    # widening
print(np.can_cast(np.int64, np.int32))                    # narrowing
print(np.can_cast(np.int64, np.float64))                  # exact enough
print(np.can_cast(np.int64, np.float32))                  # mantissa too small
print(np.can_cast(np.int64, np.int32, casting="unsafe"))  # rules off
`,
          exampleOutput: `True
False
True
False
True`,
          commonMistakes: [
            {
              mistake: "Passing Python scalars and expecting a value-based answer.",
              why: "np.can_cast(300, np.uint8) raises a TypeError in NumPy 2: the function is about dtypes, and peeking at values is the retired value-based behavior.",
              fix: "Check VALUES against np.iinfo yourself (values.min() >= info.min and values.max() <= info.max), and ask can_cast only about TYPES.",
            },
            {
              mistake: "Being surprised that can_cast says False for a conversion astype performs happily.",
              why: "The two tools default to different rungs: can_cast defaults to 'safe', astype to 'unsafe'. A False from can_cast means 'this conversion can lose data' — which is exactly when astype's silence becomes dangerous.",
              fix: "Read the pair as a workflow: ask can_cast('safe'); if it says False and you still want the conversion, you have consciously chosen the 'unsafe' rung.",
            },
            {
              mistake: "Treating can_cast as a converter.",
              why: "It returns a boolean and touches no data — the conversion itself is still astype's job.",
              fix: "Use can_cast to decide, astype to do.",
            },
          ],
          related: [
            { name: "np.promote_types", relation: "Answers 'what single type covers BOTH?' — the type mixing will produce." },
            { name: "np.result_type", relation: "The full oracle: predicts the dtype of any expression, scalars included." },
            { name: "a.astype", relation: "The converter this function gives clearance to." },
          ],
          applications: [
            "Validating a downcast plan before committing a dataset to narrow dtypes",
            "Explaining an in-place error: those operators run on the 'same_kind' rung, and can_cast shows why they refused",
            "API boundaries: assert the incoming dtype is safely castable to the one your math needs",
          ],
          notes: "NumPy 2.0 removed Python-scalar support and all value-based logic from can_cast (NEP 50). In NumPy 1.x, np.can_cast(300, np.uint8) returned True — the answer depended on the value, which is precisely the behavior the new ruleset retired.",
        },
        {
          kind: "heading",
          text: "view: the same bytes, new glasses",
        },
        {
          kind: "text",
          text: "astype *translates* values into a new block. `.view(dtype)` does something completely different: it keeps the block untouched and **re-reads the same bytes under a new type.** No values are converted — the bytes are simply grouped differently. Two int16 cells (2 bytes each) become one int32 cell (4 bytes). What that int32 *means* depends entirely on how the bytes were laid out — which is where both the power and the surprises live.",
        },
        {
          kind: "code",
          title: "Re-reading int16 pairs as int32",
          code: `import numpy as np

h = np.array([1, 0, 2, 0], dtype=np.int16)
w = h.view(np.int32)

print("h:", h, h.dtype)
print("w:", w, w.dtype)
print("shares memory:", np.shares_memory(h, w))

w[0] = 7                    # write through the view
print("h after writing w[0] = 7:", h)
`,
          output: `h: [1 0 2 0] int16
w: [1 2] int32
shares memory: True
h after writing w[0] = 7: [7 0 2 0]`,
          outputNote: "h's four int16 values [1 0 2 0] became TWO int32 values [1 2]: each pair of int16 cells was fused into one 32-bit pattern. shares_memory is True — w is literally h's buffer wearing a different header, so writing w[0] = 7 rewrote h's first two cells together.",
          explain: [
            "The pair [1, 0] fuses little-endian: the 1 lands in the LOW half of the int32 and the 0 in the high half — value 1. The pair [2, 0] likewise — value 2.",
            "w[0] = 7 wrote a full int32 over h's first two cells: the low cell became 7 and the high cell stayed 0.",
            "shares_memory(h, w) is True because view NEVER copies — the exact opposite of astype, which ALWAYS copies.",
          ],
        },
        {
          kind: "visual",
          title: "astype translates; view re-reads",
          ascii: `      the int16 block  [ 1  0  2  0 ]

   cells:  |  1  |  0  |  2  |  0  |     each cell = 2 bytes
   bytes:    01 00  00 00  02 00  00 00   (little-endian)

   a.astype(np.int32)         a.view(np.int32)
   -------------------        -------------------
   NEW block, values          SAME block, each PAIR
   translated one by one:     of cells re-read as one
                              32-bit pattern:
       [ 1  0  2  0 ]
   dtype int32                [ 1  2 ]
   (16 bytes of fresh         dtype int32
   memory)                    (the same 8 bytes)
                              shares_memory True
   shares_memory False`,
          caption: "The two operations on the same input, side by side. astype preserves values and doubles the memory; view preserves memory and halves the element count. Neither is 'safer' — they answer different questions.",
        },
        {
          kind: "arrayViz",
          title: "The pairing map: two int16 cells per int32",
          mode: "explore",
          name: "h",
          caption:
            "h is the 2x2 int16 array behind the view experiment above: h.view(np.int32) fuses each ROW into one little-endian int32. Row 0's cells [1, 0] become int32 1 — the 1 sits in the low half, the 0 in the high half. Click cells and read their flat row-major positions: the HIGH half of int32 #0 is flat position 1. Put a 1 there instead and the int32 jumps by 65,536 — the high half of a 32-bit pattern is worth 2 to the 16th power.",
          data: [
            [1, 0],
            [2, 0],
          ],
          labels: {
            rows: ["int32 #0", "int32 #1"],
            cols: ["low half", "high half"],
          },
          dtype: "int16",
        },
        {
          kind: "text",
          text: "Now the surprise the brief promised: the result of a view depends on **byte order** — endianness. Your machine (and the browser playground) is little-endian: the least significant byte comes first. But data from other systems — file formats, network protocols, instruments — often arrives big-endian, and NumPy will happily store it that way (`\">i2\"` is a 2-byte signed big-endian integer). Re-reading big-endian bytes with a native little-endian mindset gives numbers that look wrong but are perfectly honest.",
        },
        {
          kind: "code",
          title: "The endianness surprise",
          code: `import numpy as np

le = np.array([1, 0, 2, 0], dtype=np.int16)   # native little-endian
be = np.array([1, 0, 2, 0], dtype=">i2")      # forced big-endian

print("little-endian pairs:", le.view(np.int32))
print("big-endian pairs   :", be.view(np.int32))
`,
          output: `little-endian pairs: [1 2]
big-endian pairs   : [256 512]`,
          outputNote: "Same values, same widths — different byte order, different int32. A big-endian 1 is stored as [00 01], so fusing pairs and reading little-endian yields [00 01 00 00] = 256. The bytes never changed; only the reading convention did.",
          explain: [
            "view returned [256 512]: 256 is 1 shifted left one byte (1 x 256), and 512 is 2 x 256. The 'surprise' is positional notation in base 256.",
            "This is why the dtype codes from Lesson b-05 carry a prefix: '<i4' little-endian, '>i4' big-endian, '|i1' one byte so order does not apply.",
            "When binary data from another system reads as absurdly large numbers, endianness is the first suspect — and .view is the lens that reveals it.",
          ],
        },
        {
          kind: "code",
          title: "A float's bit fingerprint",
          code: `import numpy as np

f = np.array([1.5, 2.0])
print("as float64          :", f)
print("same bytes as int64 :", f.view(np.int64))
`,
          output: `as float64          : [1.5 2. ]
same bytes as int64 : [4609434218613702656 4611686018427387904]`,
          outputNote: "Nothing changed in memory — only the reading. The bit pattern of float64 1.5, counted as an integer, is 4609434218613702656. Every float has such an integer fingerprint, and this is how you look at it.",
          explain: [
            "view never converts values: 1.5 did not become 1 — its bytes were COUNTED as an integer instead.",
            "The trick works in reverse: np.array([4609434218613702656], dtype=np.int64).view(np.float64) hands back 1.5.",
            "This is a diagnostic tool, not an everyday one — Part F uses it to dissect what 0.1 really looks like inside a float64.",
          ],
        },
        {
          kind: "code",
          title: "view has a shape demand",
          code: `import numpy as np

np.array([1, 0, 2], dtype=np.int16).view(np.int32)
`,
          expectError: "ValueError: When changing to a larger dtype, its size must be a divisor of the total size in bytes of the last axis of the array.",
          outputNote: "Six bytes of int16 cannot split evenly into 4-byte int32 cells: one pair would be missing its second half. Viewing to a wider type demands that the last axis's byte size divide evenly — the same divisibility instinct as reshape, which Part C formalizes.",
        },
        {
          kind: "functionDoc",
          name: "np.shares_memory",
          purpose: "Determine whether two arrays can see any byte of the same memory — the definitive copy-or-view test.",
          signature: "np.shares_memory(a, b, /, max_work=None)",
          purposeDetail:
            "Views versus copies is the hidden axis of half of NumPy's surprises: a view is a new header walking the same buffer, a copy is a fresh buffer. np.shares_memory(a, b) settles the question in one call — True means at least one byte is visible to both, so writes through one can reach the other. This lesson uses it to prove astype always copies and view never does; Part C leans on it constantly to show that slicing returns views. It checks memory, not values: two arrays can hold equal numbers and share nothing, or hold different-shaped views and share everything.",
          params: [
            {
              name: "a, b",
              type: "ndarray",
              required: true,
              description: "The two arrays to compare. Any shapes and dtypes.",
              example: "np.shares_memory(a, a.T)",
            },
            {
              name: "max_work",
              type: "int or None",
              description: "Effort budget for the exact overlap check. The default is fine for virtually all real arrays; the docs describe extreme crafted cases.",
              example: "max_work=None",
            },
          ],
          returns: {
            type: "bool",
            description: "True if the two arrays overlap in memory by at least one byte.",
          },
          example: `import numpy as np

a = np.arange(6)
v = a[::2]                # a strided view of a
c = a + 0                 # arithmetic: always a new block
b = a.astype(np.int32)    # conversion: always a new block

print(np.shares_memory(a, v))
print(np.shares_memory(a, c))
print(np.shares_memory(a, b))
`,
          exampleOutput: `True
False
False`,
          commonMistakes: [
            {
              mistake: "Reading False as 'the arrays hold different values'.",
              why: "shares_memory is about BUFFERS, not contents: two copies of the same numbers share nothing, and two differently-shaped views of one buffer share everything.",
              fix: "Ask it only the question it answers: 'can a write through one reach the other?'",
            },
            {
              mistake: "Confusing it with np.may_share_memory.",
              why: "may_share_memory is a fast conservative check that can say True for arrays that do not actually overlap (it compares address ranges).",
              fix: "shares_memory gives the exact answer for real code; may_share_memory is for hot loops where even the check must be cheap.",
            },
            {
              mistake: "Using it to decide whether an array is a view of ANYTHING (rather than of a specific array).",
              why: "It compares two known arrays; it cannot tell you where an array came from.",
              fix: "For provenance questions, look at a.base (None for blocks that own their memory) — or just test against the specific source you suspect.",
            },
          ],
          related: [
            { name: "np.may_share_memory", relation: "The cheap conservative cousin — may say True when there is no real overlap." },
            { name: "a.view", relation: "The zero-copy reinterpretation this lesson proves with shares_memory." },
            { name: "a.astype", relation: "The always-copy conversion — its results never share memory with the source." },
          ],
          applications: [
            "Proving conversion and arithmetic produce fresh blocks (this lesson)",
            "Detecting view relationships after slicing and reshaping (Part C's daily bread)",
            "Guarding functions that must not mutate their caller's data",
          ],
          notes: "For 1-D arrays of the same dtype the exact check is trivial; the general case solves an overlap problem that can be expensive only for deliberately crafted strides. There is also a.base: for a view v of a, v.base is a — another quick provenance clue.",
        },
        {
          kind: "heading",
          text: "Promotion: who decides the result type",
        },
        {
          kind: "text",
          text: "Casting is what you do ON PURPOSE. **Promotion** is what NumPy does AUTOMATICALLY whenever two different dtypes meet in one expression: `int_array + float_array`, `uint8_pixels * 2`, an int32 column joined with an int64 one. The result dtype is not a compromise and not a vote — it follows a fixed rulebook, and the rulebook's cleanest statement is: **the result type is the smallest type that every operand can safely cast into.** `np.promote_types` is that rulebook for a pair of dtypes; you can read the answer without running any data through it.",
        },
        {
          kind: "code",
          title: "The rulebook for pairs",
          code: `import numpy as np

print(np.promote_types(np.int16, np.uint16))    # signed + unsigned
print(np.promote_types(np.int32, np.float32))   # int + float32
print(np.promote_types(np.float16, np.float32)) # float + float
print(np.promote_types(np.uint8, np.uint8))     # identical types
`,
          output: `int32
float64
float32
uint8`,
          outputNote: "Two famous results live here. Signed meets unsigned at the same width, and both step UP to the next signed width: int32. And any integer meets float32 at float64 — because int32's 2.1e9 needs 31 bits of precision and float32's mantissa has 24.",
          explain: [
            "int16 + uint16 -> int32: uint16 cannot hold int16's negatives and int16 cannot hold uint16's 65,535, so the smallest type covering BOTH is int32 — and NumPy's promoted result is always signed.",
            "int32 + float32 -> float64, not float32: safe promotion must guarantee that every possible int32 value survives, and float32 only represents integers exactly up to 16,777,216 (Lesson b-05).",
            "Identical types promote to themselves; promotion only ever widens.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.promote_types",
          purpose: "Return the smallest dtype that both input dtypes can safely cast into — the result type for array-with-array operations.",
          signature: "np.promote_types(type1, type2)",
          purposeDetail:
            "When two arrays of different dtypes meet in +, *, or any ufunc, the result dtype is decided before a single value is touched: it is promote_types of the two operand dtypes. This function lets you read that decision in advance, which is how you choose storage dtypes that will not explode later, document the output type of a pipeline, or debug 'where did float64 come from?'. Two results surprise everyone exactly once: same-width signed + unsigned climbs to the next SIGNED width (int16 + uint16 -> int32), and integer + float32 lands at float64 because float32's 24-bit mantissa cannot guarantee every int32 survives.",
          params: [
            {
              name: "type1",
              type: "dtype or dtype specifier",
              required: true,
              description: "The first type: a NumPy type, a name string like \"int16\", or a dtype object.",
              example: "np.int16",
            },
            {
              name: "type2",
              type: "dtype or dtype specifier",
              required: true,
              description: "The second type, same forms as type1.",
              example: "np.uint16",
            },
          ],
          returns: {
            type: "dtype",
            description: "The promoted dtype: the smallest (in size, then in kind) type both inputs safely cast into. Always native byte order.",
          },
          example: `import numpy as np

print(np.promote_types(np.int16, np.uint16))    # signed + unsigned
print(np.promote_types(np.int32, np.float32))   # int + float32
print(np.promote_types(np.float16, np.float32)) # widest float wins
print(np.promote_types(np.uint8, np.int8))      # unsigned + narrower signed
`,
          exampleOutput: `int32
float64
float32
int16`,
          commonMistakes: [
            {
              mistake: "Expecting the unsigned type to win when mixing signed and unsigned.",
              why: "The promoted type is always signed: uint16 cannot hold int16's negatives, int16 cannot hold uint16's 65,535, so both step up to int32.",
              fix: "Plan on the next signed width when mixing signs at the same width — or normalize columns to one sign before combining.",
            },
            {
              mistake: "Expecting int32 + float32 to stay float32.",
              why: "Safe promotion must carry every possible int32 value, and float32's integers stop being exact at 16,777,216 — so the safe landing spot is float64.",
              fix: "If you need the result in float32, do the math and then astype(np.float32) deliberately — knowing you accepted the precision decision.",
            },
            {
              mistake: "Passing Python scalars.",
              why: "np.promote_types(3, np.int32) raises TypeError: Cannot interpret '3' as a data type — this function speaks dtypes only, and Python numbers are not dtypes.",
              fix: "For expressions that mix in Python or NumPy scalars, use np.result_type, which understands the weak/strong distinction.",
            },
          ],
          related: [
            { name: "np.result_type", relation: "The full oracle: also handles arrays and the weak/strong scalar rules of NumPy 2." },
            { name: "np.can_cast", relation: "Asks the yes/no legality question about one conversion; promote_types finds the common landing spot." },
            { name: "np.min_scalar_type", relation: "The smallest dtype that holds one specific value — the engine behind old value-based casting." },
          ],
          applications: [
            "Predicting the output dtype of a mixed-dtype computation before running it",
            "Choosing a storage dtype that survives future joins and arithmetic without surprise promotions",
            "Explaining surprise float64 columns in a pipeline (somewhere, an int met a float32)",
          ],
          notes: "The function is symmetric but rarely associative, and it always returns the canonical native-byte-order dtype. For anything involving scalars, result_type is the more truthful mirror of what operators actually do.",
        },
        {
          kind: "text",
          text: "promote_types only knows dtypes — but real expressions mix arrays and *scalars*, and (as the next section shows) NumPy 2 treats Python scalars and NumPy scalars very differently. `np.result_type` is the full oracle: hand it the exact operands of any expression and it returns the dtype that expression will produce. It is the same engine the operators themselves use, which makes it the honest predictor — one call, no data, no guessing.",
        },
        {
          kind: "code",
          title: "The oracle, consulted",
          code: `import numpy as np

a = np.arange(5, dtype=np.int32)
print(np.result_type(a, a))             # array + array
print(np.result_type(a, 1))             # + Python int
print(np.result_type(a, 1.5))           # + Python float
print(np.result_type(a, np.int64(1)))   # + NumPy scalar
`,
          output: `int32
int32
float64
int64`,
          outputNote: "Four questions, four answers — and the middle two differ only in where the scalar came from: Python or NumPy. That distinction is the entire subject of the next section.",
          explain: [
            "a + a is pure array promotion: promote_types(int32, int32) = int32.",
            "a + 1 stays int32 while a + np.int64(1) becomes int64 — the Python number yields, the NumPy number demands.",
            "a + 1.5 must float: an int32 cannot hold the .5, and the smallest float every int32 safely promotes to is float64.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.result_type",
          purpose: "Return the dtype that results from applying NumPy's promotion rules to a mix of arrays, dtypes and scalars.",
          signature: "np.result_type(*arrays_and_dtypes)",
          purposeDetail:
            "promote_types answers the textbook question (two dtypes); result_type answers the real one (the exact operands of your expression). It applies the full NumPy 2 ruleset: arrays and NumPy scalars are strong — their dtypes participate in promotion like arrays — while Python scalars are weak and yield when the array can hold them, with Python floats pulling integer arrays to float64. Because it runs the same rules the operators run, a result_type call is a prediction you can trust: what it says is what the expression produces. Use it to pick accumulator dtypes before big reductions, to document a pipeline's output type, or to settle an argument about where a float64 came from.",
          params: [
            {
              name: "arrays_and_dtypes",
              type: "arrays, dtypes, and scalars",
              required: true,
              description: "The operands of the expression you are predicting, in any number. Python numbers participate as weak scalars; NumPy scalars as strong ones.",
              example: "np.result_type(a, 1.5)",
            },
          ],
          returns: {
            type: "dtype",
            description: "The dtype the corresponding operation would produce.",
          },
          example: `import numpy as np

a = np.arange(5, dtype=np.int32)
print(np.result_type(a, a))             # array + array
print(np.result_type(a, 1))             # Python int: weak
print(np.result_type(a, 1.5))           # Python float: floats up
print(np.result_type(a, np.int64(1)))   # NumPy scalar: strong
`,
          exampleOutput: `int32
int32
float64
int64`,
          commonMistakes: [
            {
              mistake: "Assuming Python scalars and NumPy scalars promote the same way.",
              why: "They are different citizens under NEP 50: a + 1 stays int32 (the Python int is weak), while a + np.int64(1) becomes int64 (the NumPy scalar is strong).",
              fix: "When predicting, pass result_type the EXACT operand kinds your expression uses — 1 and np.int64(1) give different answers on purpose.",
            },
            {
              mistake: "Expecting result_type to consider the VALUE of a Python scalar.",
              why: "NumPy 2 removed value-based logic: whether 1 or 2**40, a Python int is just 'weak integer' — if it cannot fit the array's dtype, the OPERATION raises OverflowError rather than silently widening.",
              fix: "Range questions belong to np.iinfo checks on your data, not to dtype-level predictors.",
            },
            {
              mistake: "Thinking result_type runs the operation.",
              why: "It only computes the TYPE — nothing is evaluated, no arrays are touched, and no overflow happens inside it.",
              fix: "Use it for planning; then run the real expression (which is when weak scalars must actually fit).",
            },
          ],
          related: [
            { name: "np.promote_types", relation: "The pure two-dtype core of the rulebook, without scalar handling." },
            { name: "np.can_cast", relation: "The legality check for one conversion; result_type finds where an operation lands." },
            { name: "ndarray.dtype", relation: "What the predicted result type is compared against in practice." },
          ],
          applications: [
            "Choosing accumulator dtypes before summing or averaging (Part F's error stories start here)",
            "Documenting and asserting the output dtype of a data pipeline at its boundary",
            "Teaching and debugging promotion — a REPL for the type system",
          ],
          notes: "In NumPy 1.x, result_type peeked at scalar VALUES (value-based casting); NumPy 2 replaced that with the weak/strong category rules described here (NEP 50). The docstring's old algorithm description lags behind the behavior — trust the verified outputs in this lesson.",
        },
        {
          kind: "heading",
          text: "NumPy 2's weak scalars (NEP 50)",
        },
        {
          kind: "text",
          text: "Here is the rule that changed in NumPy 2.0 and that this course follows everywhere: **Python scalars are weak, NumPy scalars are strong.** A weak Python int or bool yields to the array it meets — the array keeps its dtype, provided the value fits. A strong NumPy scalar (like `np.int64(1)`) behaves like a tiny array and demands full promotion. A Python float can never squeeze into an integer array, so integer arrays meeting one float up in the result to float64 — but a *float* array keeps its own dtype when the value is representable there. Under the hood this ruleset is NEP 50, and it retired twenty years of 'value-based casting': the old logic that peeked at a scalar's VALUE to guess the result type.",
        },
        {
          kind: "code",
          title: "The weak/strong rule, verified",
          code: `import numpy as np

a = np.arange(4, dtype=np.int32)
f = np.ones(3, dtype=np.float32)

print("(a + 1).dtype          :", (a + 1).dtype)             # Python int: weak
print("(a + 1.5).dtype        :", (a + 1.5).dtype)           # Python float: floats up
print("(a + np.int64(1)).dtype:", (a + np.int64(1)).dtype)   # NumPy scalar: strong
print("(f + 1.5).dtype        :", (f + 1.5).dtype)           # weak float fits float32
`,
          output: `(a + 1).dtype          : int32
(a + 1.5).dtype        : float64
(a + np.int64(1)).dtype: int64
(f + 1.5).dtype        : float32`,
          outputNote: "The int32 array swallowed the Python int and stayed int32; the Python float pulled it to float64; the NumPy int64 scalar forced full promotion to int64. And the float32 array kept a representable Python float — four rules, one output.",
          explain: [
            "a + 1 stays int32 — NEP 50's headline behavior. NumPy 1.x often gave the same answer, but by peeking at the value 1; the new rule is about categories, not values.",
            "a + 1.5 becomes float64: int32 cannot hold the .5, so the result must be a float, and the smallest float every int32 safely promotes to is float64.",
            "a + np.int64(1) becomes int64: NumPy scalars are strong. If you want the weak behavior, use plain Python numbers.",
            "f + 1.5 stays float32: 1.5 is representable in float32, so the weak scalar is converted to the array's dtype. This single rule is why float32 pipelines stay float32 in NumPy 2.",
          ],
        },
        {
          kind: "text",
          text: "Two honest footnotes to that output. First, weak does not mean unbounded: the Python scalar must *fit* the array's dtype, or NumPy refuses — loudly, as the next block shows. Second, when a Python float's magnitude is too large for a float array's dtype, NumPy 2 does not raise at all: it writes `inf` and prints a RuntimeWarning ('overflow encountered in cast'). Weak integer scalars that do not fit raise; weak float scalars that do not fit saturate — integers are exact, floats are approximate, and even their failures follow that nature.",
        },
        {
          kind: "code",
          title: "Weak scalars must fit",
          code: `import numpy as np

a = np.arange(4, dtype=np.int32)
a + 2**40
`,
          expectError: "OverflowError: Python integer 1099511627776 out of bounds for int32",
          outputNote: "The weak scalar is not silently widened to rescue you. NumPy 1.x peeked at 2**40, quietly promoted the result to a 64-bit integer, and printed the right answer; NumPy 2 refuses, loudly. If the result truly needs to be bigger, widen the ARRAY on purpose: a.astype(np.int64) + 2**40.",
        },
        {
          kind: "code",
          title: "Value-based casting is gone",
          code: `import numpy as np

np.can_cast(300, np.uint8)
`,
          expectError: `TypeError: can_cast() does not support Python ints, floats, and complex because the result used to depend on the value.
This change was part of adopting NEP 50, we may explicitly allow them again in the future.`,
          outputNote: "The error says it outright: in NumPy 1.x this call answered True, because 300 happened to fit uint8 (and 301 would have answered... differently). Questions that depend on a VALUE now belong to you and np.iinfo; dtype-level tools answer dtype-level questions only.",
        },
        {
          kind: "table",
          title: "The promotion world before and after NEP 50",
          headers: ["expression", "NumPy 1.x (value-based)", "NumPy 2 (NEP 50)"],
          rows: [
            ["`int32_array + 1`", "int32 — the value 1 was seen to fit", "int32 — weak scalars yield to arrays"],
            ["`int32_array + 2**40`", "silently widened to a larger integer dtype", "OverflowError — loud by design"],
            ["`int32_array + 1.5`", "float64", "float64"],
            ["`float32_array + 1.5`", "float32 — the value 1.5 was seen to fit", "float32 — 1.5 is representable"],
            ["`np.can_cast(300, np.uint8)`", "True — it peeked at the value", "TypeError — values are not dtypes"],
          ],
          caption: "Reconstructed from the NEP 50 migration notes: this course runs 2.0.2, where the old behavior no longer exists to verify. Every claim in the NumPy 2 column is proven in the blocks above. The theme of the change: results stopped depending on values, so one expression now means the same thing on every dataset.",
        },
        {
          kind: "text",
          text: "One more place the promotion rules bite, and it is the error this lesson promised. In-place operators — `+=`, `-=`, `*=` — must keep the array's dtype, because they write back into the existing block. So when the right-hand side promotes to float64 and the block is int64, NumPy faces a conversion it is not allowed to make — and unlike astype, in-place operators run on the strict 'same_kind' rung of the ladder. They refuse.",
        },
        {
          kind: "code",
          title: "The famous in-place error",
          code: `import numpy as np

counts = np.array([10, 20, 30], dtype=np.int64)
counts += 1.5
`,
          expectError: "numpy._core._exceptions._UFuncOutputCastingError: Cannot cast ufunc 'add' output from dtype('float64') to dtype('int64') with casting rule 'same_kind'",
          outputNote: "Read the line slowly — it names the operation (add), the result type it computed (float64), the block it could not write into (int64), and the rule that forbade the cast (same_kind). The most-Googled NumPy error of the decade is actually a well-written message.",
          explain: [
            "The addition itself ran fine and produced float64 values — it is the write-BACK that cannot happen: an int64 block cannot hold the .5 without lying about it.",
            "The fix is one character of reassignment: counts = counts + 1.5 builds a NEW float64 array out-of-place, leaving the original untouched.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The upgrade pattern",
          text: "To move an integer array into float arithmetic, do it deliberately: `out = a + 1.5` when you want a new result and the original left alone, or `a = a.astype(np.float64)` once, up front, when everything downstream is float anyway. What you cannot do is ask an integer block to hold a fraction in place — the error above is NumPy keeping your data honest.",
        },
        {
          kind: "steps",
          title: "Predicting a result dtype, in order",
          items: [
            "List the ARRAY operands. Their promote_types is the floor — arrays are strong, and arrays never yield to scalars.",
            "Add the scalars: a Python int or bool yields to the floor if it fits; a Python float raises an integer floor to float64 but leaves a float floor alone when the value is representable; a NumPy scalar counts as an array.",
            "Check in-place: if the result must write back into an existing block, that block's dtype wins or the operation raises.",
            "Verify with one call: np.result_type(...) — the same engine the operators use, no data required.",
          ],
        },
        {
          kind: "tryIt",
          title: "The casting playground",
          task: "Press Run only after predicting all four dtypes and the converted values. Then push on: (1) change g.astype(np.int64) to np.round(g).astype(np.int64) and compare line by line; (2) add a line a += 1.5 and read the error slowly — it is this lesson's signature error; (3) call np.can_cast(300, np.uint8) and meet the NEP 50 refusal; (4) build v = np.array([5, 0, 6, 0], dtype=np.int16).view(np.int32), predict v, then print it.",
          hint: "Weak scalars: a Python int yields to int32, a Python float pulls an int array to float64, but a float32 array keeps a representable Python float. Truncation drops the fraction toward zero; rounding is np.round's job. And int16 pairs fuse little-endian into int32 values.",
          code: `import numpy as np

a = np.arange(4, dtype=np.int32)
f = np.ones(3, dtype=np.float32)

print("(a + 1).dtype  :", (a + 1).dtype)
print("(a + 1.5).dtype:", (a + 1.5).dtype)
print("(f + 1.5).dtype:", (f + 1.5).dtype)

g = np.array([2.99, 3.5, -1.7])
print("astype(int64)  :", g.astype(np.int64))
`,
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "astype translates values into a fresh block — always a copy, truncating floats toward zero, and by default willing to destroy values silently. view re-reads the same bytes under a new type — never a copy, results dictated by byte order. promote_types is the array-meets-array rulebook, result_type is the full oracle (Python scalars weak, NumPy scalars strong, Python floats always float), and can_cast is the legality check. In-place operators keep the block's dtype and raise rather than lie. This is NEP 50: same expression, same dtype, every dataset, every run.",
        },
      ],
      terms: [
        { term: "casting", definition: "Converting values from one dtype to another, governed by five safety rules ('no', 'equiv', 'safe', 'same_kind', 'unsafe') that grade how much information a conversion may lose." },
        { term: "type promotion", definition: "The automatic choice of a result dtype when operands of different dtypes meet: the smallest type that every operand can safely cast into. Arrays are strong; Python scalars are weak (NEP 50)." },
        { term: "weak scalar", definition: "A Python int, float, bool or complex in an expression: it yields to the array's dtype when the value fits, instead of forcing a promotion. NumPy scalars (np.int64(1)) are strong and promote like arrays." },
        { term: "view (of another dtype)", definition: "A zero-copy re-reading of the same bytes under a new dtype — for example four int16 cells pairing into two int32 values. The results depend on byte order, not on the original values." },
        { term: "endianness", definition: "The byte order of multi-byte numbers: little-endian puts the least significant byte first (native on x86 and ARM), big-endian the most significant. The '<' and '>' prefixes on dtype codes record it." },
      ],
      mistakes: [
        {
          mistake: "Expecting astype to round when converting floats to integers.",
          why: "astype truncates toward zero: 2.99 becomes 2, -1.7 becomes -1. The fraction is dropped without ever being weighed against the halfway point.",
          fix: "Round first, convert second: np.round(x).astype(np.int64). And remember halves round to the EVEN neighbor — banker's rounding, the IEEE default.",
        },
        {
          mistake: "Writing a += 1.5 on an integer array and expecting the fractions to be stored (or silently dropped).",
          why: "In-place operators write back into the existing block and must keep its dtype; the add produces float64, which 'same_kind' cannot stuff into int64 — so NumPy raises UFuncOutputCastingError instead of lying.",
          fix: "Go out-of-place when floats are involved: a = a + 1.5 gives a new float64 array, or convert the array once with a = a.astype(np.float64) before the loop.",
        },
        {
          mistake: "Using .view(dtype) to convert values.",
          why: "view re-reads raw bytes: a float64 1.5 viewed as int64 is 4609434218613702656, and endianness changes the answer entirely. Nothing was converted — the bytes were just counted differently.",
          fix: "Use view only for deliberate byte-level work (binary formats, bit inspection). For numeric conversion, astype is the tool.",
        },
        {
          mistake: "Expecting NumPy 1.x value-based promotion: 'a big Python int will just widen my array'.",
          why: "NEP 50 removed value peeking: int32_array + 2**40 raises OverflowError because the weak scalar cannot fit int32. The old silent widening to a 64-bit result no longer exists.",
          fix: "Widen the array on purpose when the math genuinely outgrows it: a.astype(np.int64) + 2**40. Loud beats silent when bytes are on the line.",
        },
      ],
      takeaways: [
        "astype always copies (np.shares_memory is False even for same-to-same dtype); .view never copies. Translate with astype, re-read with view.",
        "Float-to-int astype truncates toward zero — np.round(x).astype(...) is the rounding recipe, with halves going to the even neighbor.",
        "astype's default casting rule is 'unsafe': out-of-range values wrap silently (300 becomes 44 in uint8). Only creation from Python integers validates bounds; casting='safe' restores the refusal.",
        "promote_types is the array-meets-array rulebook (int16 + uint16 -> int32; int32 + float32 -> float64); result_type is the oracle that also knows weak Python scalars from strong NumPy ones.",
        "NEP 50 in one line each: Python int + array keeps the array's dtype if it fits (else OverflowError); Python float + int array becomes float64; Python float + float32 array stays float32; in-place operators keep the block's dtype or raise.",
      ],
      quiz: [
        {
          id: "b-06-q1",
          prompt: "`np.array([2.99, 3.50, -1.70]).astype(np.int64)` produces:",
          options: [
            { text: "`[ 2  3 -1]` — each fraction is dropped toward zero", correct: true, feedback: "Correct: truncation toward zero is astype's contract. 2.99 -> 2, 3.50 -> 3, -1.70 -> -1. No rounding is considered." },
            { text: "`[ 3  4 -2]` — values are rounded to the nearest integer", correct: false, feedback: "That is np.round's answer, and only after a second astype. astype itself never rounds — the fraction is dropped." },
            { text: "`[ 3  3 -2]` — halves round up and the rest truncate", correct: false, feedback: "No mixed policy exists: one rule for every element, truncation toward zero. The 'round up' instinct is what this trap feeds on." },
            { text: "TypeError — converting floats to integers requires casting='unsafe'", correct: false, feedback: "The opposite: 'unsafe' is astype's DEFAULT. It performs the truncation silently, no error anywhere." },
          ],
          explanation: "astype drops the fraction toward zero; np.round(x).astype(np.int64) is the explicit two-step when rounding is what you mean.",
        },
        {
          id: "b-06-q2",
          prompt: "Under NumPy 2, if `a` is an int32 array, `(a + 1.5).dtype` is:",
          options: [
            { text: "float64 — an int32 cannot hold the .5, and the smallest float every int32 safely promotes to is float64", correct: true, feedback: "Exactly the NEP 50 outcome: the weak Python float raises the result into floating point, and safe promotion from int32 lands at float64 — not float32." },
            { text: "int32 — the Python scalar is weak and yields to the array's dtype", correct: false, feedback: "Weak scalars yield only when the value FITS the dtype. A fraction cannot live in an integer array, so the result must float." },
            { text: "float32 — the smallest float that could hold the values", correct: false, feedback: "Close, but 'smallest that could hold these particular values' is value-based thinking — retired. The rule is type-based: not every int32 is exact in float32 (integers stop being exact at 16,777,216), so float64 it is." },
            { text: "it raises the in-place casting error", correct: false, feedback: "Nothing is in-place here: a + 1.5 builds a new array. The famous error belongs to a += 1.5, a different expression." },
          ],
          explanation: "Weak Python float + int32 array -> float64. The float32 answer would silently corrupt large int32 values; the rule guarantees every possible operand survives.",
        },
        {
          id: "b-06-q3",
          prompt: "`np.array([1, 0, 2, 0], dtype=np.int16).view(np.int32)` returns:",
          options: [
            { text: "`[1 2]` — a zero-copy view; each little-endian pair of int16 cells fuses into one int32", correct: true, feedback: "Right: the pair [1, 0] reads as int32 1 (the 1 in the low half, the 0 in the high half), and [2, 0] reads as 2. Same buffer, new glasses — shares_memory is True." },
            { text: "`[1 0 2 0]` — the values converted to int32 in a fresh block", correct: false, feedback: "That is astype(np.int32), the translate operation. view converts nothing; it re-groups the existing bytes." },
            { text: "`[256 512]` — the pairs fused the other way", correct: false, feedback: "Temptingly close: [256 512] is what the BIG-ENDIAN version of the same array produces. On this little-endian platform, the low half comes first, so 1 stays 1." },
            { text: "ValueError — four int16 cells cannot be viewed as int32", correct: false, feedback: "Four cells pair cleanly into two int32 values (8 bytes split evenly by 4). Only an ODD element count breaks the divisor requirement." },
          ],
          explanation: "view re-reads the same 8 bytes as two int32 values, pairing cells little-endian: [1 2], with zero copies made.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part B exercises (tiered: 4 beginner, 4 intermediate, 4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "b-b1",
      tier: "beginner",
      title: "Order three blank slates",
      prompt:
        "Build three arrays to order: a 5x2 block of ones as int32, a 1-D block of six zeros as float16, and a 2x2 block filled with the value 7 as int8. Print the shape and dtype of the first, then the array and dtype of the second, then the array and dtype of the third — three lines total, one array per line.",
      hint: "np.ones((5, 2), dtype=np.int32), np.zeros(6, dtype=np.float16), np.full((2, 2), 7, dtype=np.int8). The shape is a tuple for 2-D, a bare number for 1-D.",
      starter: `import numpy as np

# TODO: a = 5x2 int32 ones
# TODO: b = six float16 zeros
# TODO: c = 2x2 int8 sevens

print(a.shape, a.dtype)
print(b, b.dtype)
print(c, c.dtype)
`,
      solution: `import numpy as np

a = np.ones((5, 2), dtype=np.int32)
b = np.zeros(6, dtype=np.float16)
c = np.full((2, 2), 7, dtype=np.int8)

print(a.shape, a.dtype)
print(b, b.dtype)
print(c, c.dtype)
`,
      expectedOutput: `(5, 2) int32
[0. 0. 0. 0. 0. 0.] float16
[[7 7]
 [7 7]] int8`,
      concepts: ["np.ones", "np.zeros", "np.full", "dtype"],
    },
    {
      id: "b-b2",
      tier: "beginner",
      title: "Two roads to the same numbers",
      prompt:
        "Build np.arange(10, 35, 5, dtype=np.int64) (step-driven, stop excluded) and np.linspace(10, 30, 5) (count-driven, both endpoints included). Print each array on its own line together with its dtype. Both produce the numbers 10, 15, 20, 25, 30 — but one is integer and one is float, and only one of the two builders guarantees HOW MANY numbers you get. (The explicit dtype on arange pins the result on every machine — native installs and this course's browser playground alike.)",
      hint: "arange(10, 35, 5) stops before 35; linspace(10, 30, 5) counts out exactly 5 evenly spaced points from 10 to 30 inclusive. Print arr and arr.dtype on the same line.",
      starter: `import numpy as np

# TODO: by_step = arange from 10, step 5, stopping before 35 (int64)
# TODO: by_count = 5 evenly spaced points from 10 through 30

print(by_step, by_step.dtype)
print(by_count, by_count.dtype)
`,
      solution: `import numpy as np

by_step = np.arange(10, 35, 5, dtype=np.int64)
by_count = np.linspace(10, 30, 5)

print(by_step, by_step.dtype)
print(by_count, by_count.dtype)
`,
      expectedOutput: `[10 15 20 25 30] int64
[10. 15. 20. 25. 30.] float64`,
      concepts: ["np.arange", "np.linspace", "dtype inference"],
    },
    {
      id: "b-b3",
      tier: "beginner",
      title: "Read the label before you choose",
      prompt:
        "Read the limits of int8 and uint8 with np.iinfo, printing one line per type: 'int8 :' then min 'to' max, and 'uint8:' then min 'to' max. Then print two booleans: whether 200 fits int8, and whether 200 fits uint8 — computed with comparisons against the labels you just read, never typed from memory. Four lines total.",
      hint: "info = np.iinfo(np.int8) gives info.min and info.max. A value v fits when info.min <= v and v <= info.max — check both ends, always.",
      starter: `import numpy as np

# TODO: read np.iinfo for int8 and uint8, print their min and max

# TODO: does 200 fit int8? does 200 fit uint8? print both booleans
`,
      solution: `import numpy as np

s = np.iinfo(np.int8)
u = np.iinfo(np.uint8)
print("int8 :", s.min, "to", s.max)
print("uint8:", u.min, "to", u.max)

print("200 fits int8 :", 200 >= s.min and 200 <= s.max)
print("200 fits uint8:", 200 >= u.min and 200 <= u.max)
`,
      expectedOutput: `int8 : -128 to 127
uint8: 0 to 255
200 fits int8 : False
200 fits uint8: True`,
      concepts: ["np.iinfo", "integer limits", "pre-flight check"],
    },
    {
      id: "b-b4",
      tier: "beginner",
      title: "Truncate or round",
      prompt:
        "The array temps = np.array([0.5, 1.5, 2.5, 3.5]) is given. On line one print temps.astype(np.int64) — conversion, which truncates toward zero. On line two print np.round(temps).astype(np.int64) — the two-step rounding recipe. Compare the lines: they differ exactly at the halves, because np.round sends 0.5 and 2.5 to their even neighbors.",
      hint: "astype drops the fraction (0.5 -> 0, 1.5 -> 1). np.round rounds halves to the even integer (0.5 -> 0, 1.5 -> 2, 2.5 -> 2, 3.5 -> 4) — then you still need astype to land in integers.",
      starter: `import numpy as np

temps = np.array([0.5, 1.5, 2.5, 3.5])

# TODO: print the truncated conversion, then the rounded conversion
`,
      solution: `import numpy as np

temps = np.array([0.5, 1.5, 2.5, 3.5])
print(temps.astype(np.int64))
print(np.round(temps).astype(np.int64))
`,
      expectedOutput: `[0 1 2 3]
[0 2 2 4]`,
      concepts: ["astype", "truncation", "np.round", "banker's rounding"],
    },
    {
      id: "b-i1",
      tier: "intermediate",
      title: "Climb the ladder",
      prompt:
        "The readings np.array([-40, 0, 250, 320]) must be stored in the smallest safe signed integer dtype. Walk the ladder ('int8', 'int16', 'int32') in order with np.iinfo and stop at the first dtype whose min AND max hold both ends of the data. Print 'smallest safe dtype:' with the winner, then the readings converted to it — this is the pre-flight check from Lesson b-05, written as a loop.",
      hint: "Compute lo = readings.min() and hi = readings.max() once. In the loop: info = np.iinfo(name); if lo >= info.min and hi <= info.max you have found the rung — print, convert with astype, and break.",
      starter: `import numpy as np

readings = np.array([-40, 0, 250, 320])
lo, hi = readings.min(), readings.max()

# TODO: walk ("int8", "int16", "int32") with np.iinfo; print and break
# at the first dtype whose bounds hold BOTH lo and hi
`,
      solution: `import numpy as np

readings = np.array([-40, 0, 250, 320])
lo, hi = readings.min(), readings.max()

for name in ("int8", "int16", "int32"):
    info = np.iinfo(name)
    if lo >= info.min and hi <= info.max:
        print("smallest safe dtype:", name)
        print("stored:", readings.astype(name))
        break
`,
      expectedOutput: `smallest safe dtype: int16
stored: [-40   0 250 320]`,
      concepts: ["np.iinfo", "dtype ladder", "astype", "pre-flight check"],
    },
    {
      id: "b-i2",
      tier: "intermediate",
      title: "Prove the copy",
      prompt:
        "Start from a = np.array([1, 2, 3], dtype=np.int64). Make b = a.astype(np.int32), then write b[0] = 99. Print a, then b, then np.shares_memory(a, b) — three lines that together prove astype's first guarantee: the result is a fresh block, so a is untouched by the write and no byte is shared.",
      hint: "No trick: astype, assign, print. The point is to SEE it — a still [1 2 3], b now [99 2 3], shares_memory False.",
      starter: `import numpy as np

a = np.array([1, 2, 3], dtype=np.int64)
b = a.astype(np.int32)

# TODO: write 99 into b[0], then print a, b, and np.shares_memory(a, b)
`,
      solution: `import numpy as np

a = np.array([1, 2, 3], dtype=np.int64)
b = a.astype(np.int32)
b[0] = 99

print("a:", a)
print("b:", b)
print("shares memory:", np.shares_memory(a, b))
`,
      expectedOutput: `a: [1 2 3]
b: [99  2  3]
shares memory: False`,
      concepts: ["astype", "np.shares_memory", "copies"],
    },
    {
      id: "b-i3",
      tier: "intermediate",
      title: "Predict before you print",
      prompt:
        "Given a = np.arange(4, dtype=np.int32), print the dtype of (a + 1), of (a + 1.5), and of (a + np.int64(1)) — one per line, each labeled with the expression — then a fourth line: np.promote_types(np.int16, np.uint16). Predict all four before running: a weak Python int yields to the array, a weak Python float floats it up to float64, a NumPy scalar is strong, and signed meets unsigned one rung up.",
      hint: "Print with labels: print('(a + 1).dtype:', (a + 1).dtype) and so on. The three dtype answers are int32, float64 and int64; the promotion answer is the next signed width.",
      starter: `import numpy as np

a = np.arange(4, dtype=np.int32)

# TODO: print labeled dtypes of (a + 1), (a + 1.5), (a + np.int64(1))
# TODO: print np.promote_types(np.int16, np.uint16)
`,
      solution: `import numpy as np

a = np.arange(4, dtype=np.int32)

print("(a + 1).dtype          :", (a + 1).dtype)
print("(a + 1.5).dtype        :", (a + 1.5).dtype)
print("(a + np.int64(1)).dtype:", (a + np.int64(1)).dtype)
print("promote(int16, uint16) :", np.promote_types(np.int16, np.uint16))
`,
      expectedOutput: `(a + 1).dtype          : int32
(a + 1.5).dtype        : float64
(a + np.int64(1)).dtype: int64
promote(int16, uint16) : int32`,
      concepts: ["weak scalars", "NEP 50", "np.promote_types", "dtype prediction"],
    },
    {
      id: "b-i4",
      tier: "intermediate",
      title: "Fix the crash (read the error!)",
      prompt:
        "This calibration step crashes. Read the error slowly before touching anything: it names the operation (add), the result type NumPy computed (float64), the block it could not write into (int64), and the rule that forbade the cast (same_kind). Fix it with the smallest honest change: keep the calibration value 1.5, but let the result live in a NEW array instead of writing fractions back into an integer block. Print the calibrated array and its dtype.",
      hint: "In-place operators must keep the block's dtype — that is the wall. Out-of-place is the door: counts = counts + 1.5 builds a fresh float64 array and the original is never asked to hold a fraction.",
      starter: `import numpy as np

counts = np.array([10, 20, 30], dtype=np.int64)
counts += 1.5     # apply the half-degree calibration
print(counts)
`,
      solution: `import numpy as np

counts = np.array([10, 20, 30], dtype=np.int64)
counts = counts + 1.5   # out-of-place: a new float64 array
print(counts, counts.dtype)
`,
      expectedOutput: `[11.5 21.5 31.5] float64`,
      starterExpectError:
        "numpy._core._exceptions._UFuncOutputCastingError: Cannot cast ufunc 'add' output from dtype('float64') to dtype('int64') with casting rule 'same_kind'",
      concepts: ["in-place operators", "UFuncOutputCastingError", "out-of-place fix", "error reading"],
    },
    {
      id: "b-a1",
      tier: "advanced",
      title: "The view magician",
      prompt:
        "Build h = np.array([3, 0, 5, 0], dtype=np.int16) and w = h.view(np.int32). Print w (the fused little-endian pairs). Then write w[0] = 9 THROUGH THE VIEW, print h afterwards, and finally print np.shares_memory(h, w). Three lines: the pairing, the write-through reaching the original, and the proof that no copy was ever made.",
      hint: "The pairs [3, 0] and [5, 0] fuse into int32 values 3 and 5. Writing 9 as an int32 lands in h's first TWO cells: [9, 0]. shares_memory is True — view never copies.",
      starter: `import numpy as np

h = np.array([3, 0, 5, 0], dtype=np.int16)
w = h.view(np.int32)

# TODO: print w; write w[0] = 9; print h; print np.shares_memory(h, w)
`,
      solution: `import numpy as np

h = np.array([3, 0, 5, 0], dtype=np.int16)
w = h.view(np.int32)

print("pairs:", w)
w[0] = 9
print("h after the write:", h)
print("shares memory:", np.shares_memory(h, w))
`,
      expectedOutput: `pairs: [3 5]
h after the write: [9 0 5 0]
shares memory: True`,
      concepts: ["view", "little-endian pairing", "zero-copy", "np.shares_memory"],
    },
    {
      id: "b-a2",
      tier: "advanced",
      title: "The ten-million-row price tag",
      prompt:
        "A table will hold 10,000,000 rows. Without allocating a single array, print a price list: for each dtype in int16, int32, float32 and float64 (in that order), print the dtype name (padded to 8 characters) and the megabytes one column of that dtype would cost — ROWS * itemsize / 1024**2 — with one decimal place. Read every itemsize from np.dtype(name); the label knows the width, and the arithmetic proves the budget.",
      hint: "ROWS = 10_000_000 as a variable, then a loop over the four names: dt = np.dtype(name); print(f\"{name:8s} {ROWS * dt.itemsize / 1024**2:7.1f} MB\"). Two bytes per row is 19.1 MB — check your first line against that.",
      starter: `import numpy as np

ROWS = 10_000_000

# TODO: for each of int16, int32, float32, float64 print the name and
# the MB one 10M-row column would cost (itemsize arithmetic, no arrays)
`,
      solution: `import numpy as np

ROWS = 10_000_000
for name in ("int16", "int32", "float32", "float64"):
    dt = np.dtype(name)
    print(f"{name:8s} {ROWS * dt.itemsize / 1024**2:7.1f} MB")
`,
      expectedOutput: `int16       19.1 MB
int32       38.1 MB
float32     38.1 MB
float64     76.3 MB`,
      concepts: ["np.dtype", "itemsize", "memory budgeting", "f-strings"],
    },
    {
      id: "b-a3",
      tier: "advanced",
      title: "The promotion oracle",
      prompt:
        "Use np.result_type to predict four expressions on a = np.arange(4, dtype=np.int32): 'a + 1', 'a + 1.5', 'a + np.int64(1)' and 'a + a' — in that order. Print one line per prediction formatted exactly as 'label -> dtype' with the label padded to 18 characters. Consult the oracle with the exact operand kinds: the Python int is weak, the Python float is weak but floats, the NumPy scalar is strong, and array-meets-array is pure promote_types.",
      hint: "Build a list of (label, np.result_type(...)) pairs, then print each with print(f\"{label:18s} -> {dt}\"). The four answers: int32, float64, int64, int32.",
      starter: `import numpy as np

a = np.arange(4, dtype=np.int32)

# TODO: predict with np.result_type, print 'label -> dtype' lines for
# 'a + 1', 'a + 1.5', 'a + np.int64(1)', 'a + a'
`,
      solution: `import numpy as np

a = np.arange(4, dtype=np.int32)

for label, dt in [
    ("a + 1", np.result_type(a, 1)),
    ("a + 1.5", np.result_type(a, 1.5)),
    ("a + np.int64(1)", np.result_type(a, np.int64(1))),
    ("a + a", np.result_type(a, a)),
]:
    print(f"{label:18s} -> {dt}")
`,
      expectedOutput: `a + 1              -> int32
a + 1.5            -> float64
a + np.int64(1)    -> int64
a + a              -> int32`,
      concepts: ["np.result_type", "weak scalars", "strong scalars", "promotion"],
    },
    {
      id: "b-a4",
      tier: "advanced",
      title: "The cliff, quantified",
      prompt:
        "big = np.array([40000], dtype=np.int64) must be stored in a narrow dtype. Line 1: print 'silent wrap :' plus the value of big.astype(np.int16)[0] — the wraparound, computed by the machine. Line 2: print 'fits int16 :' plus the honest boolean from comparing the value against np.iinfo(np.int16) bounds. Line 3: print 'safe storage:' plus big.astype(np.int32)[0] and that array's dtype — the smallest signed rung that actually holds 40,000.",
      hint: "int16 wraps 40,000 to a negative number (40,000 - 65,536). The iinfo check must compare BOTH ends. int32's ceiling is 2,147,483,647 — plenty.",
      starter: `import numpy as np

big = np.array([40000], dtype=np.int64)

# TODO: print the int16 wrap value, the iinfo verdict, and the int32 safe storage
`,
      solution: `import numpy as np

big = np.array([40000], dtype=np.int64)

narrow = big.astype(np.int16)
print("silent wrap :", narrow[0])

info = np.iinfo(np.int16)
print("fits int16  :", big[0] >= info.min and big[0] <= info.max)

safe = big.astype(np.int32)
print("safe storage:", safe[0], safe.dtype)
`,
      expectedOutput: `silent wrap : -25536
fits int16  : False
safe storage: 40000 int32`,
      concepts: ["astype", "silent wraparound", "np.iinfo", "dtype ladder"],
    },
  ],

  // ------------------------------------------------------------------
  // Part B assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "b-as-1",
      prompt: "You have `template = np.zeros((480, 640), dtype=np.float32)` and need a NEW array with the same shape and dtype, every element set to 1. Which call is the honest one-liner?",
      options: [
        { text: "np.ones_like(template)", correct: true, feedback: "Shape AND dtype inherited from the living example — exactly what the _like family exists for." },
        { text: "np.ones(template.shape)", correct: false, feedback: "Right shape, wrong outfit: without dtype= the result is float64, silently doubling that array's memory budget." },
        { text: "template.fill(1)", correct: false, feedback: "That overwrites template itself — no new array exists afterward, and your zeros are gone." },
        { text: "np.full(template, 1)", correct: false, feedback: "full's first argument is a shape tuple, not an array. np.full(template.shape, 1, dtype=template.dtype) works — but ones_like already is that, shorter." },
      ],
      explanation: "The _like builders copy shape AND dtype from an existing array — the safest way to keep a pipeline's types consistent.",
    },
    {
      id: "b-as-2",
      prompt: "You need exactly 101 evenly spaced samples from 0 through 10, both endpoints included. Which call guarantees that contract?",
      options: [
        { text: "np.linspace(0, 10, 101)", correct: true, feedback: "linspace is count-driven: ask for 101 points, receive exactly 101, endpoints included by definition." },
        { text: "np.arange(0, 10, 0.1)", correct: false, feedback: "arange is step-driven and half-open — and with a float step, accumulated rounding means you cannot even guarantee whether the last value lands at 10, or how many values you get." },
        { text: "np.arange(0, 10.1, 0.1)", correct: false, feedback: "Closer, but still a float step on a half-open range: the exact count depends on rounding at the far end. When the count is the contract, use the count-driven builder." },
        { text: "np.linspace(0, 10, 100)", correct: false, feedback: "One short: 100 points from 0 to 10 step by 10/99. The classic off-by-one — the count you ask for includes BOTH endpoints." },
      ],
      explanation: "linspace owns the count; arange owns the step. When you need exactly N points, say N.",
    },
    {
      id: "b-as-3",
      prompt: "Which call builds a 4x4 array of zeros with ones on the diagonal just ABOVE the main diagonal?",
      options: [
        { text: "np.eye(4, k=1)", correct: true, feedback: "eye's k shifts the diagonal: k=1 is one step up-right (the superdiagonal), k=0 is the main diagonal." },
        { text: "np.eye(4, k=-1)", correct: false, feedback: "Negative k shifts DOWN-left — that builds the subdiagonal. The sign of k is the direction of the shift." },
        { text: "np.identity(4, offset=1)", correct: false, feedback: "identity takes no offset argument — it builds exactly the main diagonal (and Python will tell you so with a TypeError)." },
        { text: "np.diag(np.ones(4), k=1)", correct: false, feedback: "It works — too well: diag grows the matrix to 5x5 to make room for the offset diagonal. eye(4, k=1) keeps it 4x4." },
      ],
      explanation: "np.eye(n, k=offset) is the general identity builder; np.identity(n) is the plain main-diagonal one.",
    },
    {
      id: "b-as-4",
      prompt: "What is the ONE real difference between `np.array(x)` and `np.asarray(x)`?",
      options: [
        { text: "asarray hands back x itself when x is already an ndarray (no copy); np.array builds a fresh copy by default", correct: true, feedback: "asarray's promise is 'never pay for what is already an array' — the standard move inside functions that accept array-ish input." },
        { text: "asarray also accepts iterators and generators", correct: false, feedback: "Both refuse generators — that job belongs to np.fromiter, which knows how to size the result from an iterator." },
        { text: "asarray skips dtype checking, so it is always faster", correct: false, feedback: "Dtypes are honored in both calls; the only difference is the copy, and it only matters when the input is already an array." },
        { text: "asarray is the deprecated old name kept for compatibility", correct: false, feedback: "It is a purpose-built tool, not a fossil: avoiding a needless copy at a function boundary is its whole job." },
      ],
      explanation: "np.asarray is the 'do not copy an existing array' variant of np.array — the idiom for function inputs that may or may not already be arrays.",
    },
    {
      id: "b-as-5",
      prompt: "A table holds 10,000,000 rows and one column is stored as int32. Doing NumPy's own arithmetic (rows x np.dtype('int32').itemsize, with 1 MB = 1024 x 1024 bytes), roughly how much RAM does that single column take?",
      options: [
        { text: "About 38 MB (38.1 MiB)", correct: true, feedback: "10,000,000 x 4 bytes = 40,000,000; divide by 1024 twice and you get 38.1. Derived, not guessed — itemsize is one attribute lookup away." },
        { text: "About 40 MB", correct: false, feedback: "That is the decimal-megabyte answer (40,000,000 / 1,000,000). Memory is priced in powers of two: with 1024-based MB the bill is 38.1." },
        { text: "About 19 MB", correct: false, feedback: "That is the int16 price — two bytes per row. int32's itemsize is 4." },
        { text: "About 76 MB", correct: false, feedback: "That is the int64/float64 price — eight bytes per row. int32 is half that." },
      ],
      explanation: "Memory budgets are rows x itemsize, divided by 1024 twice: int32 at ten million rows costs 38.1 MiB.",
    },
    {
      id: "b-as-6",
      prompt: "In NumPy 2, `np.array([200], dtype=np.int8)` raises OverflowError — but `np.array([100], dtype=np.int8) + 100` returns [-56] with no warning. Why the difference?",
      options: [
        { text: "Creating an array from Python integers validates every value against the dtype's limits; arithmetic between NumPy values never checks — the result dtype is fixed first, and the hardware drops the carry", correct: true, feedback: "Exactly the asymmetry from Lesson b-05: the door checks, the arithmetic does not. The np.iinfo pre-flight check is the only guard in between." },
        { text: "Overflow checks apply only to arrays of one element; longer arrays wrap together", correct: false, feedback: "Backwards: creation checks at any length, and arithmetic wraps silently at any length — whole arrays wrap together, which is what makes the bug expensive in the wild." },
        { text: "The + 100 case does check — -56 is the correct mathematical sum", correct: false, feedback: "-56 is 200 modulo 256 wearing int8's sign convention: the odometer rolled over. The honest sum is 200; int8 simply has no place to put it." },
        { text: "NumPy 2 removed overflow errors entirely; the first call raises for a different reason", correct: false, feedback: "The opposite: NumPy 2 ADDED the creation-time bounds check (NumPy 1.x wrapped here too). The error you see is the new safety; the missing check is the old danger." },
      ],
      explanation: "Creation from Python ints validates bounds (new in NumPy 2); array arithmetic never does — the two-comparison iinfo check closes the gap.",
    },
    {
      id: "b-as-7",
      prompt: "Given `a = np.array([7, 8], dtype=np.int64)`, then `b = a.astype(np.int16)` and `b[0] = 99`. Which statement is TRUE?",
      options: [
        { text: "a is still [7 8] — astype ALWAYS builds a fresh array, and np.shares_memory(a, b) is False", correct: true, feedback: "Convert and copy, unconditionally: writing through b can never reach a. Same-dtype astype is even the idiom for cloning an array." },
        { text: "a[0] is now 99 too — astype returns a view of the same bytes", correct: false, feedback: "That is .view's job (Lesson b-06): view re-reads the SAME bytes as another type; astype converts values into a new block." },
        { text: "They share memory only when the two dtypes have the same width", correct: false, feedback: "No width rule exists — the copy is unconditional. Reinterpretation without copying is .view, never astype." },
        { text: "It depends on the casting rule in force", correct: false, feedback: "Casting rules govern whether a CONVERSION is allowed, never whether the result shares memory — astype's result is always a new block." },
      ],
      explanation: "astype = convert + copy, always. Zero-copy reinterpretation is .view(dtype) — same bytes, re-read, no conversion.",
    },
    {
      id: "b-as-8",
      prompt: "With `a = np.arange(5, dtype=np.int32)` under NumPy 2 (NEP 50), what are the result dtypes of `a + 1`, `a + 1.5`, and `a + np.int64(1)`?",
      options: [
        { text: "int32, float64, int64", correct: true, feedback: "The three rules in one line: a weak Python int yields to the array, a Python float lifts an integer array to float64, and a NumPy scalar is strong and fully promotes." },
        { text: "int64, float64, int64", correct: false, feedback: "The first one stays int32 — Python scalars are weak and yield to the array's dtype when the value fits. That is the headline of NEP 50." },
        { text: "int32, float32, int32", correct: false, feedback: "Two errors: an int array meeting a Python float cannot stay integer (float64 is the smallest safe float for int32), and np.int64(1) is strong — it never yields." },
        { text: "int64, int64, int64", correct: false, feedback: "Nothing here forces 64-bit: the int32 array survives weak scalars intact." },
      ],
      explanation: "Weak Python scalars yield; Python floats float integer arrays up to float64; NumPy scalars are strong. np.result_type predicts all three without doing the math.",
    },
  ],

  // ------------------------------------------------------------------
  // Part B mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Memory Budget: A dtype Planner for a Sensor Fleet",
    brief:
      "You are the data engineer for a fleet of weather stations, and tonight's landing table has 10,000,000 rows. Store every column as float64 'to be safe' and a month of fleet history stops fitting in RAM; store a counter in int8 and the first hot reading silently corrupts the dataset. Build the planning tool that sits between those two failures: read each column's observed value range, walk the dtype ladder with np.iinfo to pick the smallest safe integer type (float32 for measured values), price every candidate in megabytes with pure itemsize arithmetic — never allocating the giant arrays it prices — and prove the stakes with one demonstrated silent wraparound. The program ends with its own recommendation: the chosen plan's megabytes against the naive all-float64 plan, and the memory you saved by choosing dtypes on evidence instead of habit.",
    requirements: [
      "A COLUMNS dictionary of at least four sensor-fleet columns, each holding a small sample array standing in for the 10-million-row table: a station id, a measured float temperature, a large-integer pressure, and a small integer error code",
      "A function smallest_safe_dtype(samples) that returns 'float32' when any sample carries a fraction, and otherwise walks ('int8', 'int16', 'int32') with np.iinfo and returns the first rung whose min AND max hold the observed lo and hi",
      "A function column_mb(name, rows) that prices one column as rows * np.dtype(name).itemsize / 1024**2 — pure arithmetic on the label, never allocating the arrays it prices",
      "A report for ROWS = 10_000_000 printed one line per column: column name, observed min..max, chosen dtype, and that column's megabytes",
      "A price list for the measured temperature column comparing int16, float32 and float64 at ten million rows, printed as option name plus megabytes",
      "One proven overflow: store the pressure reading 108342 as int64, astype it to int16, and print both the wrapped value and the np.iinfo(np.int16) bounds check, which must print False",
      "A final recommendation line printed by the program: the chosen plan's total megabytes, the all-float64 plan's total, and the megabytes saved",
      "Every printed number is computed by the program — dtype limits come from np.iinfo, byte widths from np.dtype(...).itemsize; nothing is typed from memory",
    ],
    steps: [
      "Write the COLUMNS samples first and print each column's name, min and max — sanity-check the ranges before any dtype logic exists.",
      "Write smallest_safe_dtype(samples): handle the fraction case first (any sample not equal to its np.round self means a measured column, so float32), then walk the ladder with np.iinfo. Test it by printing name -> chosen dtype for every column.",
      "Write column_mb(name, rows) and prove it on a case you can check in your head: 1,048,576 rows of int32 must price at exactly 4.0 MB.",
      "Assemble the report loop at ROWS = 10_000_000: name, observed range, chosen dtype, megabytes — four columns, four lines.",
      "Add the temp_c price list (int16, float32, float64). Look at the three numbers, then write one comment naming the option that is cheap but dishonest for a measured column — and why.",
      "Add the overflow proof. Before running it, predict the wrapped value with the modulo arithmetic from Lesson b-05 (108,342 on int16's dial of 65,536 positions), then run and check yourself.",
      "Add the recommendation: sum the chosen plan's megabytes, sum the all-float64 plan's, print the savings. One sentence, computed, printed by the program — that is the deliverable.",
      "Stress-test: add 200 to the error_code samples and re-run — error_code must climb from int8 to int16, and if the report does not move, your bounds check is broken.",
    ],
    starter: `import numpy as np

ROWS = 10_000_000  # tonight's landing table: ten million rows

# Observed samples for each column. The real table has ROWS rows;
# these small arrays stand in for it when we choose dtypes.
COLUMNS = {
    "station_id": np.array([1, 40, 512, 1850], dtype=np.int64),
    "temp_c": np.array([-40.25, 21.7, 46.7]),
    "pressure_pa": np.array([87012, 99340, 108342], dtype=np.int64),
    "error_code": np.array([0, 1, 3, 7], dtype=np.int64),
}

INT_LADDER = ("int8", "int16", "int32")


def smallest_safe_dtype(samples):
    """Pick the smallest dtype that honestly holds the observed values."""
    # TODO: if any sample carries a fraction (compare against np.round),
    # return "float32" -- measured data gets the measured-float dtype
    # TODO: otherwise find lo and hi, then walk INT_LADDER with np.iinfo
    # and return the first name whose min AND max hold both ends
    return "int64"  # TODO: replace this placeholder


def column_mb(name, rows):
    """Megabytes one column of 'rows' rows costs at dtype 'name'.

    Pure arithmetic on itemsize -- never allocate the array you price.
    """
    # TODO: rows * np.dtype(name).itemsize / 1024**2
    return 0.0  # TODO: replace this placeholder


# --- the report: one line per column ---
print(f"planning the fleet table: {ROWS:,} rows")
for name, samples in COLUMNS.items():
    # TODO: print the column name, its observed min..max, the chosen
    # dtype, and the megabytes that column costs at ROWS
    pass

# --- the price list for the measured column ---
print("temp_c options at 10M rows:")
for option in ("int16", "float32", "float64"):
    # TODO: print the option name and its price -- and remember which
    # of these three is NOT safe for a measured column
    pass

# --- the proof: what int16 does to a pressure reading ---
# TODO: build np.array([108342], dtype=np.int64), astype it to int16,
# and print the wrapped value; then print the honest np.iinfo(np.int16)
# bounds check proving 108342 does not fit

# --- the recommendation ---
# TODO: total megabytes of the chosen plan and of the all-float64 plan,
# then print one recommendation line with the savings
`,
    concepts: [
      "np.iinfo",
      "dtype ladder",
      "pre-flight check",
      "np.dtype",
      "itemsize",
      "memory budgeting",
      "silent wraparound",
      "astype",
      "float32 vs float64",
    ],
    extension:
      "Add a headroom rule: when the observed max climbs above 90 percent of the chosen rung's ceiling, step up one more rung — sensors drift, and next summer is hotter than this one. Which columns move? Then price error_code as uint8 and report the extra savings, and write one comment about what going unsigned costs you the day a sensor reports -1.",
  },
};
