/**
 * PART C — SHAPES: DIMENSIONS, RESHAPING AND RESTRUCTURING
 *
 * Moving numbers without moving them: dimension and axis fluency ->
 * the walking rule of reshape (C/F order, the -1 wildcard, views vs
 * copies, .shape assignment) -> flattening (ravel vs flatten vs
 * reshape(-1)) -> transpose and axis gymnastics (transpose, moveaxis,
 * swapaxes, expand_dims, squeeze, atleast_*) -> stacking, splitting,
 * tiling and repeating.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 *
 * Authoring conventions (inherited from Part A):
 *   - code blocks use the AUTOFILL placeholder convention; the verifier
 *     fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 *   - every view-vs-copy claim is proven in code with np.shares_memory.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_C: NumpyPart = {
  letter: "C",
  title: "Shapes: Dimensions, Reshaping and Restructuring",
  tagline: "Moving numbers without moving them — axes, reshaping, flattening, transposing, stacking and splitting",
  description:
    "The part where arrays become Play-Doh. First, dimension and axis fluency: 0-D scalars through 4-D batches, axis numbering, shape tuples, and what an RGB image's (3, H, W) really means. Then the walking rule of reshape — C order, F order, the -1 wildcard, when reshape is a free view and when it silently copies, and the legal-in-place .shape assignment. Flattening gets its own lesson: ravel (view when possible) vs flatten (always a copy) and why writing through the wrong one mutates your data. Axis gymnastics covers transpose with explicit axis orders, moveaxis, swapaxes, expand_dims, squeeze and the atleast family — plus the (3,) vs (3, 1) vs (1, 3) trinity behind half of all broadcasting bugs. Finally the join-and-cut toolkit: concatenate vs stack (the confusion pair), the v/h stack family and its 1-D surprises, splitting equal and uneven, tiling and repeating. Every claim is machine-verified, view vs copy proven with np.shares_memory.",
  lessons: [
    // ------------------------------------------------------------- c-01
    {
      slug: "c-01",
      title: "Dimensions and Axes, Mastered",
      minutes: 15,
      summary:
        "From a single number (0-D) to a batch of color images (4-D): how dimension, axis numbering and the shape tuple really work — and why (3, H, W) and (H, W, 3) are different pictures of the same pixels.",
      kind: "concept",
      objectives: [
        "Classify arrays as 0-D through 3-D from how they were built, and read any shape tuple aloud correctly",
        "Number the axes of an N-D array and say what axis 0 counts for 1-D, 2-D and 3-D data",
        "Describe real data at each dimension: a sensor reading, a signal, a grayscale image, an RGB image as (3, H, W), a video as (T, H, W)",
        "Distinguish len(a) (first axis only) from a.size (every element) and a.ndim (how many axes)",
      ],
      why: "Ask any data scientist what their last three NumPy bugs were and you will hear the same story three times: a shape was not what the code assumed. An image was (3, H, W) when the model wanted (H, W, 3); a vector was (n,) when the library wanted (n, 1); a stacked batch became a taller table by accident. Shape bugs do not crash politely — they produce confident, wrong numbers. This lesson builds the cure: reading dimensions, axes and shapes as fluently as you read words, so that (2, 3, 4) instantly paints a picture before a single computation runs.",
      blocks: [
        {
          kind: "text",
          text: "Part A left you with a promise: an array is a **flat block of numbers plus a header** that says how to walk the block as a grid. This part is about that header's most important dial — **shape** — and everything you can do with it without moving a single value. But first you need to be fluent in the vocabulary: *dimension*, *axis*, and the shape tuple itself. Fluency here is not academic. Every function in the rest of the course speaks in shapes: `reshape`, `stack`, `sum(axis=0)`, broadcasting — all of them are conversations about axes.",
        },
        {
          kind: "heading",
          text: "The dimension ladder, from a point to a cube",
        },
        {
          kind: "text",
          text: "A dimension is nothing more mysterious than a **direction you can index along**. One number per dimension, wrapped in one bracket pair. Climb the ladder:",
        },
        {
          kind: "visual",
          title: "Four dimensions of the same idea",
          ascii: `  0-D   one number, no direction        42              shape ()
        (a point: index it and there
         is nothing left to choose)

  1-D   one direction: positions      10  20  30     shape (3,)
        along a line (a vector)        a[1] -> 20

  2-D   two directions: rows and      1   2   3      shape (2, 3)
        columns (a table)             4   5   6        a[1, 0] -> 4

  3-D   three directions: panels,    [panel 0]  [panel 1]   shape (2, 3, 4)
        rows, columns (a stack        3x4 table  3x4 table    a[1, 2, 3] -> the
        of equal tables)                                        last value of the
                                                               last row, last panel
`,
          caption:
            "Each new dimension wraps the previous structure in one more bracket level: values make rows, rows make tables, tables make stacks. The shape tuple simply counts positions along each direction, outermost bracket first.",
        },
        {
          kind: "code",
          title: "Climbing the ladder in code",
          code: `import numpy as np

scalar = np.array(42)                       # 0-D: one number, zero axes
vector = np.array([10, 20, 30])             # 1-D: one axis, a vector
table  = np.array([[1, 2, 3],               # 2-D: two axes, a table
                   [4, 5, 6]])
cube   = np.arange(24).reshape(2, 3, 4)     # 3-D: three axes, a stack

for name, a in [("scalar", scalar), ("vector", vector),
                ("table", table), ("cube", cube)]:
    print(f"{name:7s} shape={a.shape}  ndim={a.ndim}  size={a.size}")
`,
          output: `scalar  shape=()  ndim=0  size=1
vector  shape=(3,)  ndim=1  size=3
table   shape=(2, 3)  ndim=2  size=6
cube    shape=(2, 3, 4)  ndim=3  size=24`,
          outputNote:
            "Notice the 0-D shape: an empty tuple (), zero dimensions, but still size 1 — it holds one number. The shape tuple has exactly one entry per axis, in axis order.",
          explain: [
            "`np.array(42)` — no brackets around the value means no axes. A 0-D array is a scalar wearing array clothing (it has a dtype, it can broadcast), but you cannot index it: there is no direction to choose along.",
            "`shape (3,)` — the comma is not a typo. A one-element tuple needs its trailing comma in Python; without it you would have written the plain number 3.",
            "The cube's shape (2, 3, 4) reads: 2 panels, each of 3 rows, each of 4 columns. Product of the tuple = total values: 2 x 3 x 4 = 24.",
            "`size` is always the product of the shape entries; `ndim` is always the length of the shape tuple. Two multiplications you will learn to do in your head.",
          ],
        },
        {
          kind: "heading",
          text: "Axes are numbered from zero, outside in",
        },
        {
          kind: "text",
          text: "Every dimension is an **axis**, numbered from 0. For a table: **axis 0 runs down the rows**, **axis 1 runs across the columns** (Part A, Lesson a-04). For a cube, axis 2 runs through the columns *within* a row — and the pattern generalizes: **axis numbers count from the outermost bracket inward, and the last axis always changes fastest** when you walk the array in its natural (row-major) order. Shape entries and axes pair up exactly: in shape (2, 3, 4), axis 0 has 2 positions, axis 1 has 3, axis 2 has 4.",
        },
        {
          kind: "code",
          title: "Peeling a cube, one axis at a time",
          code: `import numpy as np

cube = np.arange(24).reshape(2, 3, 4)   # 2 panels of 3 rows x 4 columns

print(cube[0].shape)     # one index  -> one whole 3x4 panel (a 2-D table)
print(cube[0, 1].shape)  # two        -> one row of that panel (1-D)
print(cube[0, 1, 2])     # three      -> one single value (0-D)
`,
          output: `(3, 4)
(4,)
6`,
          outputNote:
            "Each index you supply consumes one axis. Indexing is choosing a position along axes, in axis order — one number per axis, exactly as many as the array has.",
          explain: [
            "`cube[0]` selects panel 0 — axis 0 is gone from the result, which is why the shape drops to (3, 4).",
            "`cube[0, 1]` adds a choice along axis 1: row 1 of panel 0. Shape (4,) — one axis left.",
            "`cube[0, 1, 2]` chooses along all three axes and lands on one number. 4 values per row, so row 1 of panel 0 is [4, 5, 6, 7] and index 2 within it is 6.",
          ],
        },
        {
          kind: "heading",
          text: "Real data at every dimension",
        },
        {
          kind: "text",
          text: "Dimensions are not abstract — each level of the ladder is a kind of data you will actually meet. The two image conventions deserve special attention because they cause real, silent bugs: NumPy-world image code often stores color as **channels first** — shape (3, H, W), one panel per color — while most plotting and file-format code expects **channels last** — (H, W, 3). Same pixels, different axes. Lesson c-04 gives you the tools to convert between conventions.",
        },
        {
          kind: "table",
          title: "The dimension ladder in the wild",
          headers: ["Dim", "Shape example", "What it is", "Axis 0 counts"],
          rows: [
            ["0-D", "`()`", "One sensor reading, one score", "nothing — no axes"],
            ["1-D", "`(365,)`", "One sensor's daily readings; an audio waveform", "the 365 days (positions along the line)"],
            ["2-D", `(4, 6)`, "A grayscale image; a table of samples x features", "the 4 image rows"],
            ["3-D", "`(3, 4, 6)`", "One RGB image, channels first", "the 3 color channels"],
            ["3-D", "`(10, 4, 6)`", "A 10-frame grayscale video", "the 10 frames (time)"],
            ["4-D", "`(8, 3, 4, 6)`", "A batch of 8 RGB images", "the 8 images in the batch"],
          ],
          caption:
            "One habit to build now: when you meet an array, say its shape aloud as a sentence — 'eight images, three channels, four by six pixels'. If you cannot say the sentence, you do not know what the data is yet.",
        },
        {
          kind: "code",
          title: "Building the shapes of real data (zeros as placeholders)",
          code: `import numpy as np

gray  = np.zeros((4, 6))          # one grayscale image: 4 rows x 6 columns
rgb   = np.zeros((3, 4, 6))       # one color image: 3 channel panels of 4x6
video = np.zeros((10, 4, 6))      # 10 frames of grayscale: time is axis 0
batch = np.zeros((8, 3, 4, 6))    # 8 color images: the batch axis on top

for name, a in [("gray", gray), ("rgb", rgb), ("video", video), ("batch", batch)]:
    print(f"{name:6s} shape={a.shape}  size={a.size}")
`,
          output: `gray   shape=(4, 6)  size=24
rgb    shape=(3, 4, 6)  size=72
video  shape=(10, 4, 6)  size=240
batch  shape=(8, 3, 4, 6)  size=576`,
          outputNote:
            "Every array here is all zeros — we are studying geometry, not values. The sizes are worth internalizing: a video's size is frames x rows x columns, nothing more exotic.",
          explain: [
            "`rgb` is (3, 4, 6): axis 0 counts color channels — panel 0 might be red brightness at every pixel, panel 1 green, panel 2 blue.",
            "`video` is (10, 4, 6): same three axes' worth of numbers, but axis 0 now counts *time*. Shape tells you how many positions each axis has; only names and convention tell you what an axis *means*.",
            "`batch` adds a fourth axis on the outside — machine-learning frameworks feed models batches of shape (batch, channels, height, width) or (batch, height, width, channels), depending on the framework.",
          ],
        },
        {
          kind: "heading",
          text: "len() vs size vs ndim: three different questions",
        },
        {
          kind: "text",
          text: "Python's built-in `len()` works on arrays — but it answers only one question: **how long is the first axis?** It says nothing about the others. `a.size` answers the total (product of all axis lengths), `a.ndim` counts the axes, and `a.shape` says everything. For 1-D data `len(a) == a.size` and the distinction never shows; from 2-D on, it bites.",
        },
        {
          kind: "code",
          title: "Three questions, three answers",
          code: `import numpy as np

table = np.arange(12).reshape(3, 4)

print("len(table) :", len(table))    # FIRST axis only: 3 rows
print("table.size :", table.size)    # every element: 3 x 4 = 12
print("table.ndim :", table.ndim)    # how many axes: 2
print("table.shape:", table.shape)   # the full story: (3, 4)
`,
          output: `len(table) : 3
table.size : 12
table.ndim : 2
table.shape: (3, 4)`,
          outputNote:
            "len(table) is 3, not 12 — Python's len() sees the array as a sequence of rows. When you need every element, that is size; when you need the whole geometry, that is shape.",
          explain: [
            "`len()` is handy and honest for the outermost axis — `for row in table` iterates exactly len(table) rows.",
            "It also fails loudly where it has no answer: a 0-D array has no first axis at all.",
          ],
        },
        {
          kind: "code",
          title: "The one array len() refuses",
          code: `import numpy as np

scalar = np.array(42)
print(len(scalar))
`,
          expectError: "TypeError: len() of unsized object",
          outputNote:
            "Python's len() needs a first axis to measure. A 0-D array has no axes, so the call is a TypeError — the honest refusal, not a crash you need to fix. Use scalar.size (which is 1) or scalar.item() to get the value out.",
        },
        {
          kind: "arrayViz",
          title: "The reshape lab — one strip of 24 values, four shapes",
          mode: "reshape",
          name: "strip",
          caption:
            "The same 24 values (0 to 23) grouped four ways. Click (2, 3, 4): the grid becomes 2 PANELS of 3 rows x 4 columns — the panel number is the position along axis 0, and the label under each panel says so. Click (2, 2, 6): still 2 panels, now each 2x6. And in every shape, the small corner number — the element's flat index — walks 0, 1, 2, 3, ... in exactly the same order. Reshape re-groups; it never reorders.",
          data: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
            12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
          ],
          targets: [[24], [4, 6], [2, 3, 4], [2, 2, 6]],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "A dimension is an indexable direction; an axis is a dimension with a number (from 0, outside in); a shape tuple counts positions along each axis. 0-D point, 1-D line, 2-D table, 3-D stack of tables, 4-D batch of stacks — same values, more brackets.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The professional reflex, upgraded",
          text: "Part A's habit was print(a.shape, a.dtype). Upgrade it: say the shape aloud as a sentence with names — 'ten frames, four rows, six columns' — before you compute. Named axes are how you will spot that (10, 4, 6) video being reshaped as if it were a (4, 6, 10) pile of images.",
        },
        {
          kind: "tryIt",
          title: "Build and peel your own cube",
          task: "Before pressing Run, predict all four prints. Then change the reshape to (2, 2, 3) and predict again: which print changes meaning — the panel, the row, or the single element? Finally try cube[1] alone and see a whole panel printed.",
          code: `import numpy as np

cube = np.arange(12).reshape(2, 2, 3)   # 2 panels of 2 rows x 3 columns

print("shape  :", cube.shape)
print("panel 0:")
print(cube[0])
print("panel 1, row 0:", cube[1, 0])
print("one element    :", cube[1, 0, 2])
`,
          hint: "cube[1, 0] drops two axes, leaving one — a row of 3. cube[1, 0, 2] drops all three, leaving one number: panel 1's row 0 is [6, 7, 8], and index 2 within it is 8.",
        },
      ],
      terms: [
        { term: "Dimension / axis", definition: "One direction an array can be indexed along. Axes are numbered from 0, outermost bracket first; the last axis changes fastest in memory order." },
        { term: "Shape", definition: "A tuple with one entry per axis, counting positions along it — (2, 3, 4) means 2 panels of 3 rows of 4 columns. size is the product of the entries." },
        { term: "0-D array", definition: "A scalar in array clothing: shape (), ndim 0, size 1. Has a dtype but no axes, so it cannot be indexed and len() refuses it." },
        { term: "Channels-first / channels-last", definition: "The two RGB image conventions: (3, H, W) with color as axis 0 (NumPy-world default) versus (H, W, 3) with color last (plotting and file formats). Same pixels, different axes." },
        { term: "len(a) vs a.size vs a.ndim", definition: "len measures the FIRST axis only; size counts all elements (shape product); ndim counts the axes (shape length)." },
      ],
      mistakes: [
        {
          mistake: "Reading shape (2, 3, 4) as '2 rows, 3 columns, 4 deep' or swapping rows and columns.",
          why: "Shape reads axis by axis, and axes run outside in: axis 0 = panels, axis 1 = rows, axis 2 = columns. Swapping rows and columns is the single most common shape misread.",
          fix: "Say the sentence with names: '2 panels, each 3 rows by 4 columns'. Rows before columns because axis 0 comes before axis 1.",
        },
        {
          mistake: "Using len(a) on 2-D+ data and assuming it counts all elements.",
          why: "len() measures only the first axis. For a (3, 4) table len gives 3 — the rows — while the table holds 12 values.",
          fix: "len for the outermost axis (usually 'how many rows/frames'), a.size for every element, a.shape for the whole story.",
        },
        {
          mistake: "Assuming an RGB image is always (H, W, 3).",
          why: "Both conventions exist and both are common: (3, H, W) channels-first (much NumPy/scikit-image-style processing) and (H, W, 3) channels-last (matplotlib, most file formats, most deep-learning frameworks).",
          fix: "Print the shape and name the axes before touching pixels. Converting between conventions is one moveaxis call (Lesson c-04).",
        },
        {
          mistake: "Writing shape (3) when they mean the 1-D shape (3,).",
          why: "(3) is just the integer 3 in parentheses; a one-element tuple needs its trailing comma. Code expecting a tuple will behave unexpectedly when handed a bare int.",
          fix: "One axis, one comma: (3,). It looks odd for a week and then it is muscle memory.",
        },
      ],
      takeaways: [
        "A dimension is an indexable direction; axes number them from 0, outside in, and shape counts positions along each: (2, 3, 4) = 2 panels of 3 rows of 4 columns.",
        "The last axis changes fastest; each index you supply consumes one axis, left to right: cube[0] is a panel, cube[0, 1] a row, cube[0, 1, 2] a single number.",
        "Real data sits at every rung: 0-D scores, 1-D signals, 2-D tables and grayscale images, 3-D RGB images (3, H, W) and videos (T, H, W), 4-D batches.",
        "len(a) is the first axis only; a.size is the product of all; a.ndim is how many. Shape says everything — say it aloud as a sentence with names.",
      ],
      quiz: [
        {
          id: "c-01-q1",
          prompt: "What does the shape tuple of `np.arange(24).reshape(2, 3, 4)` tell you about axis 0?",
          options: [
            { text: "Axis 0 has 4 positions — the columns", correct: false, feedback: "Columns are the LAST axis, axis 2. The tuple reads outside in: (axis 0, axis 1, axis 2) = (2, 3, 4)." },
            { text: "Axis 0 has 2 positions — the panels; each panel is a 3x4 table", correct: true, feedback: "Exactly: 2 panels of 3 rows by 4 columns. The first shape entry always pairs with axis 0." },
            { text: "Axis 0 has 24 positions — every element belongs to it", correct: false, feedback: "24 is the size — the product of all axis lengths. Axis 0 alone has only 2 positions." },
            { text: "Axis 0 has 3 positions — the rows", correct: false, feedback: "Rows are axis 1 here. Axis 0 is the outermost bracket: the panels." },
          ],
          explanation: "Shape pairs with axes one-to-one, outside in: (2, 3, 4) = axis 0 has 2 panels, axis 1 has 3 rows, axis 2 has 4 columns.",
        },
        {
          id: "c-01-q2",
          prompt: "For `video = np.zeros((10, 4, 6))` — a grayscale video — which sentence is correct?",
          options: [
            { text: "10 rows, 4 columns, 6 frames", correct: false, feedback: "Swapped: the first axis is not rows when there are three axes — it is the outermost structure, here the frames." },
            { text: "10 frames, each a 4x6 grayscale image; axis 0 counts time", correct: true, feedback: "Right — and note the same numbers could mean something else in another program: names are convention, counts are shape." },
            { text: "10 color channels, 4 rows, 6 columns", correct: false, feedback: "Plausible numbers, wrong story — channels-first color would be (3, 4, 6) with exactly 3 channels; axis 0 with 10 positions here counts frames." },
            { text: "It cannot hold video because it is 3-D", correct: false, feedback: "3-D is exactly right for video: (time, height, width). 4-D would add a batch of videos." },
          ],
          explanation: "A grayscale video is naturally (T, H, W): time as axis 0, each frame a 2-D image. Shape gives the counts; your naming gives the meaning.",
        },
        {
          id: "c-01-q3",
          prompt: "For a 2-D array `t` with shape (3, 4), which statement is TRUE?",
          options: [
            { text: "len(t) is 12 because it counts all elements", correct: false, feedback: "len counts only the FIRST axis: 3. The element total is t.size, which is 12." },
            { text: "len(t) is 3, t.size is 12, and t.ndim is 2", correct: true, feedback: "All three: first axis 3 rows, total 3 x 4 = 12 elements, 2 axes." },
            { text: "len(t) is 4 because len returns the last axis", correct: false, feedback: "len never returns the last axis — it measures the first. Columns (4) live at index 1 of t.shape." },
            { text: "len(t) raises TypeError for any array with more than one axis", correct: false, feedback: "It only refuses 0-D arrays (no first axis at all). For 2-D it happily returns the row count." },
          ],
          explanation: "len = first axis only; size = product of all axes; ndim = number of axes. Three different questions, three different answers.",
        },
      ],
    },

    // ------------------------------------------------------------- c-02
    {
      slug: "c-02",
      title: "Reshaping: The Walking Rule",
      minutes: 18,
      summary:
        "Reshape re-groups the same flat block under a new shape — the walking rule. C order vs F order, the -1 wildcard, when reshape is a free view and when it silently copies, and the legal-in-place a.shape = ... assignment.",
      kind: "concept",
      objectives: [
        "Predict exactly which values land where when reshape folds a flat strip into 2-D or 3-D (the walking rule, C order)",
        "Use the -1 wildcard to let NumPy compute one axis length, and read both classic reshape errors fluently",
        "Prove with np.shares_memory when reshape returns a view and when it is forced to copy",
        "Explain order=\"C\" vs order=\"F\" and demonstrate the difference on the same flat data",
        "Use the in-place a.shape = ... assignment and know when it is legal",
      ],
      why: "Reshaping is the most-used shape operation in real code and the most misunderstood. The mystery dissolves once you internalize what Lesson a-04 showed: an array is a flat block plus a walking rule. Reshape does not move numbers — it re-labels how they are grouped, which is why it can be free (a view), why order=\"C\" versus order=\"F\" changes everything you see, and why a wildcard -1 exists for the one dimension you cannot be bothered to compute. Master the walking rule once and reshape, ravel, transpose and broadcasting all become the same idea wearing different hats.",
      blocks: [
        {
          kind: "text",
          text: "Here is the secret that makes all of Part C easy: **reshape never touches the data block**. The numbers stay byte-for-byte identical, shoulder to shoulder, in the same memory. What changes is the header's walking rule — how many steps make a row, how many rows make a panel. When you reshape, you are not moving numbers; you are drawing different grid lines over the same strip. That is why reshaping a million elements takes microseconds.",
        },
        {
          kind: "heading",
          text: "The walking rule, seen plainly",
        },
        {
          kind: "visual",
          title: "One strip, three sets of grid lines",
          ascii: `  the flat block (this NEVER moves):
  0  1  2  3  4  5  6  7  8  9 10 11

  reshape(3, 4):  walk in runs of 4; 3 runs fill the table
       0  1  2  3
       4  5  6  7
       8  9 10 11

  reshape(4, 3):  walk in runs of 3; 4 runs fill the table
       0  1  2
       3  4  5
       6  7  8
       9 10 11

  reshape(2, 2, 3): outer axis takes runs of 6; each run is a 2x3 panel
       panel 0:  0  1  2        panel 1:  6  7  8
                 3  4  5                  9 10 11
`,
          caption:
            "C order (the default) walks the strip left to right and fills the LAST axis fastest: across a row, then down, then to the next panel. Every grouping of the same 12 values is a different set of grid lines over one unchanged strip.",
        },
        {
          kind: "code",
          title: "Same twelve values, four groupings",
          code: `import numpy as np

s = np.arange(12)               # the strip: 0..11 in block order

print(s.reshape(3, 4))
print(s.reshape(4, 3))
print(s.reshape(2, 6))
print(s.reshape(2, 2, 3))
`,
          output: `[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
[[ 0  1  2]
 [ 3  4  5]
 [ 6  7  8]
 [ 9 10 11]]
[[ 0  1  2  3  4  5]
 [ 6  7  8  9 10 11]]
[[[ 0  1  2]
  [ 3  4  5]]

 [[ 6  7  8]
  [ 9 10 11]]]`,
          outputNote:
            "Read each grid against the strip above: the values always arrive 0, 1, 2, 3, ... — only the line breaks move. The (2, 2, 3) result is two panels of 2x3.",
          explain: [
            "No value was reordered, created or destroyed anywhere: 12 in, 12 out, every time. If the counts did not match, NumPy would refuse (two error blocks below).",
            "The interactive lab below lets you click through these shapes and see each element's flat index stay glued to it.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The reshape lab — twelve values, five shapes",
          mode: "reshape",
          name: "s",
          caption:
            "The same twelve values (0-11) morphing between five shapes. Watch the small corner numbers (flat indexes): (2, 6) and (6, 2) hold identical values in identical block order — only the row width changed. Then click (2, 2, 3): two panels, two rows, three columns, and the values still walk 0, 1, 2, 3 ... in reading order. That reading order IS the walking rule.",
          data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          targets: [[12], [2, 6], [6, 2], [3, 4], [2, 2, 3]],
        },
        {
          kind: "heading",
          text: "C order vs F order: two ways to read one block",
        },
        {
          kind: "text",
          text: "The default walk is **C order** (row-major): fill across the last axis first, exactly like the pictures above. The alternative is **F order** (column-major, the Fortran convention): fill down the first axis first. `reshape(..., order=\"F\")` reads the same block through the other rule — and the grids you get look startlingly different, even though not one byte of data changed:",
        },
        {
          kind: "code",
          title: "The same data, read in two directions",
          code: `import numpy as np

flat = np.arange(12)                      # the block, in block order

c_order = flat.reshape(3, 4)              # default: walk rows first
f_order = flat.reshape(3, 4, order="F")   # walk columns first

print("C order (row-major), the default:")
print(c_order)
print()
print("F order (column-major):")
print(f_order)
`,
          output: `C order (row-major), the default:
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

F order (column-major):
[[ 0  3  6  9]
 [ 1  4  7 10]
 [ 2  5  8 11]]`,
          outputNote:
            "Both grids contain exactly 0..11. In the C grid the strip runs across each row; in the F grid the strip runs down each column — value 1 sits at [1, 0], one column-step from 0.",
          explain: [
            "C order fills [0, 0], [0, 1], [0, 2], [0, 3], then row 1: the strip lies flat along rows.",
            "F order fills [0, 0], [1, 0], [2, 0], then column 1: the strip stands up along columns.",
            "F order matters mostly when your data ARRIVED column-major — certain file formats, MATLAB and Fortran interop, and some databases. Day to day you will use C; now you know what the F flag is for.",
          ],
        },
        {
          kind: "heading",
          text: "The -1 wildcard: you do the math",
        },
        {
          kind: "text",
          text: "Often you know all the axis lengths but one — 'the batch has 4 groups of 5, whatever the rest is'. Pass **-1** for that axis and NumPy derives it: the product of all entries must equal `a.size`, so the unknown is the quotient. At most **one** -1 per call — with two unknowns the equation has no unique answer, and NumPy refuses to guess.",
        },
        {
          kind: "code",
          title: "Letting NumPy do the division",
          code: `import numpy as np

a = np.arange(12)

print(a.reshape(3, -1).shape)     # 12 / 3      -> (3, 4)
print(a.reshape(-1, 6).shape)     # 12 / 6      -> (2, 6)
print(a.reshape(2, -1, 3).shape)  # 12 / (2*3)  -> (2, 2, 3)
print(a.reshape(-1))              # THE idiom: flatten to 1-D (next lesson)
`,
          output: `(3, 4)
(2, 6)
(2, 2, 3)
[ 0  1  2  3  4  5  6  7  8  9 10 11]`,
          outputNote:
            "Each -1 is replaced by the quotient that makes the product equal a.size. reshape(-1) with no other axes always gives the fully flat 1-D view of the block.",
          explain: [
            "`reshape(3, -1)` — 12 values in 3 rows means 4 per row; NumPy computes the 4.",
            "`reshape(2, -1, 3)` — the wildcard works at any depth: 12 / (2 x 3) = 2 panels.",
            "`reshape(-1)` — 'one axis, you pick its length' is always 'all of them'. This is the flatten idiom you will type thousands of times.",
          ],
        },
        {
          kind: "code",
          title: "Two wildcards: refused, loudly",
          code: `import numpy as np

a = np.arange(12)
a.reshape(2, -1, -1)
`,
          expectError: "ValueError: can only specify one unknown dimension",
          outputNote:
            "With two unknowns, infinitely many shapes fit (2 x 1 x 6? 2 x 6 x 1? 2 x 2 x 3?) — and NumPy will not choose for you. One -1 per call; it is a wildcard, not a filler.",
        },
        {
          kind: "code",
          title: "Wrong total size: also refused",
          code: `import numpy as np

np.arange(12).reshape(5, 3)
`,
          expectError: "ValueError: cannot reshape array of size 12 into shape (5,3)",
          outputNote:
            "Reshape re-groups existing values; it can never create or discard any. 12 values cannot form 15 slots, and the error names both numbers so you can check the arithmetic yourself.",
        },
        {
          kind: "heading",
          text: "View or copy? Ask the array",
        },
        {
          kind: "text",
          text: "Because reshape only rewrites the header's walking rule, it *usually* returns a **view** — the same data block, new grid lines, zero copying. But some target shapes cannot be produced by any stride rule over the existing block; then NumPy silently builds a **copy**, and you pay the memory. The docstring is honest about this ('a new view object if possible; otherwise a copy'), but you do not have to trust prose — `np.shares_memory` answers the question with a boolean:",
        },
        {
          kind: "code",
          title: "Proving views and copies with np.shares_memory",
          code: `import numpy as np

a = np.arange(12)

view = a.reshape(3, 4)                 # contiguous strip -> pure view
print(np.shares_memory(a, view))       # True: same buffer, new grid lines

t = a.reshape(3, 4).T                  # transpose: also a view, but its
print(np.shares_memory(a, t))          # walk jumps around (non-contiguous)

copy = t.reshape(12)                   # this flat walk has NO stride rule
print(np.shares_memory(t, copy))       # False: NumPy had to build a new block
`,
          output: `True
True
False`,
          outputNote:
            "True, True, False — proven, not asserted. The first two reshapes are header tricks; the third cannot be, so a copy happened and you would never have noticed from the printed values.",
          explain: [
            "`a.reshape(3, 4)` on a contiguous strip: same block, walked in runs of 4. A view — mutating through it mutates `a`.",
            "`a.reshape(3, 4).T` is also a view (transpose never copies — Part A, Lesson a-04), but its natural walk visits memory with jumps.",
            "`t.reshape(12)` wants a straight-line walk of a jumpy view; no single stride can express it, so NumPy copies. Lesson c-03 returns to exactly this boundary with ravel and flatten.",
          ],
        },
        {
          kind: "heading",
          text: "a.shape = ...: reshape in place, no new array",
        },
        {
          kind: "text",
          text: "There is a second way to reshape: **assign to the shape attribute itself**. `a.shape = (2, 6)` re-labels the *same array object* — no new array is created, `a` itself now has two axes. It is the fastest reshape there is, with one hard constraint: because no new object is created, the operation **must** be a pure view-relabeling. If the block cannot be walked that way, the assignment raises instead of copying. (The -1 wildcard works here too, exactly one of it.)",
        },
        {
          kind: "code",
          title: "Re-labeling one array in place",
          code: `import numpy as np

a = np.arange(12)
print("before:", a.shape)

a.shape = (2, 6)                # legal: the SAME object, re-labeled
print("after :", a.shape)
print(a)
`,
          output: `before: (12,)
after : (2, 6)
[[ 0  1  2  3  4  5]
 [ 6  7  8  9 10 11]]`,
          outputNote:
            "No new array was created — a itself went from (12,) to (2, 6). Every other view of a's buffer (none here) would see the same block with its own, unchanged grid lines.",
          explain: [
            "Compare carefully: `b = a.reshape(2, 6)` creates a second array object sharing the block, while `a.shape = (2, 6)` changes a's own header. Both move zero numbers.",
            "Use it when a name should keep pointing at the same object (rare but real in tight loops and library code); use .reshape() when you want to keep the original shape around.",
          ],
        },
        {
          kind: "code",
          title: "When shape assignment refuses",
          code: `import numpy as np

b = np.arange(12).reshape(3, 4).T   # a transpose view: jumpy, non-contiguous

b.shape = (2, 6)                    # no stride rule can relabel this one
`,
          expectError:
            "AttributeError: Incompatible shape for in-place modification. Use `.reshape()` to make a copy with the desired shape.",
          outputNote:
            "The error message is a perfect summary of the rule: in-place re-labeling only works when a view is possible; the .reshape() method is the one allowed to copy. This is the exact boundary from the shares_memory demo, enforced by the API.",
        },
        {
          kind: "functionDoc",
          name: "a.reshape",
          purpose: "Give the exact same values a new shape — ideally by writing a new walking rule over the same data block, without moving a single number.",
          signature: 'a.reshape(shape, *, order="C")  # or the flat form a.reshape(d0, d1, ..., dn)',
          purposeDetail:
            "Reshape is the workhorse of array handling: turning a flat strip into a table, a table into panels, a model's output into a human-readable grid. Because an array is a data block plus a header (Lesson a-04), reshape only needs to compute new strides — a view, effectively free — whenever the block can be walked that way. When it cannot (the source is non-contiguous and no stride rule produces the request), NumPy silently makes a copy. The function form np.reshape(a, (3, 4)) is identical to the method. If you need to know which happened, ask np.shares_memory; if you need to force a copy, call .copy() yourself.",
          params: [
            {
              name: "shape",
              type: "int or tuple of ints",
              required: true,
              description: "The new shape. The product of all entries must equal a.size. At most ONE entry may be -1, which NumPy computes from the rest. Both a.reshape((3, 4)) and a.reshape(3, 4) work.",
              example: "(3, 4) or (2, -1) or 3, 4",
            },
            {
              name: "order",
              type: '"C", "F", "A" or "K"',
              description: 'How the source block is READ while filling the new shape: "C" walks rows first (row-major, the default), "F" walks columns first (column-major). "A" and "K" preserve-or-adapt the source layout — rarely needed.',
              example: 'order="F"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "An array with the requested shape: a view of a's data when a stride rule can produce it, a fresh copy otherwise. The original array is never modified.",
          },
          example: `import numpy as np

s = np.arange(12)

print(s.reshape(3, 4))             # rows of four
print(s.reshape(3, -1).shape)      # -1: "you do the math" -> (3, 4)
print(s.reshape(3, 4, order="F"))  # same block, walked column-major

view = s.reshape(3, 4)
print(np.shares_memory(s, view))   # True: nothing moved
`,
          exampleOutput: `[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
(3, 4)
[[ 0  3  6  9]
 [ 1  4  7 10]
 [ 2  5  8 11]]
True`,
          commonMistakes: [
            {
              mistake: "Passing a shape whose product is not a.size.",
              why: "Reshape re-groups existing values; it cannot create or destroy any. Twelve values can form (3, 4) but never (5, 3).",
              fix: "Check a.size first, or let one -1 carry the arithmetic — a.reshape(5, -1) fails loudly if 5 does not divide a.size, which is exactly the check you wanted.",
            },
            {
              mistake: "Using two or more -1 wildcards in one call.",
              why: "With two unknowns the equation has infinitely many solutions; NumPy refuses rather than guess.",
              fix: "At most one -1 per call. It is a wildcard for one missing number, not a filler for every axis.",
            },
            {
              mistake: "Assuming reshape always returns a view (or always a copy).",
              why: "It returns whichever is possible: contiguous inputs give views, awkward non-contiguous sources (a transpose view, a strided slice) force a silent copy.",
              fix: "When it matters, ask: np.shares_memory(a, b). When you need a guaranteed copy, write .reshape(...).copy() — or use .flatten() (Lesson c-03).",
            },
          ],
          related: [
            { name: "np.reshape", relation: "The function form: np.reshape(a, (3, 4)) is exactly a.reshape((3, 4))." },
            { name: "a.ravel", relation: "reshape(-1) with a name — flattening with the same view-when-possible rules (Lesson c-03)." },
            { name: "a.shape assignment", relation: "a.shape = (2, 6) re-labels the same array in place — faster, but only legal when a view is possible." },
            { name: "np.transpose", relation: "Reorders axes without touching values; combine with reshape for any regrouping (Lesson c-04)." },
          ],
          applications: [
            "Turning a flat strip of pixel values into an (H, W) image — and back before saving or sending",
            "Reshaping a model's flat weight vector into the (rows, cols) grid a layer expects",
            "Batching: folding n samples of length m into (n, m) so vectorized operations run per sample",
          ],
          notes:
            'The order argument controls how the source block is READ while filling the new shape — it is not a promise about the output\'s memory layout. order="F" reads column-major, which is why s.reshape(3, 4, order="F") shows the transposed-looking pattern.',
        },
        {
          kind: "tryIt",
          title: "The reshape playground",
          task: "Press Run to see the defaults, then experiment: (1) change (3, -1) to (-1, 4) and predict the shape; (2) add a line printing s.reshape(2, 2, 3, order=\"F\"); (3) try two -1 wildcards on purpose and read the error — you will meet it in the wild eventually.",
          code: `import numpy as np

s = np.arange(12)

print(s.reshape(3, -1))
print(s.reshape(3, 4, order="F"))
print(s.reshape(-1).shape)
`,
          hint: "For (1): 12 / 4 = 3 rows, so (-1, 4) gives (3, 4). For (2): the F walk runs down columns — the first column will be 0, 2, 4.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Reshape draws new grid lines over the same strip of numbers. The walking rule (C order) fills the last axis fastest; -1 lets NumPy do one division; the result is a view when strides allow and a silent copy when they do not — np.shares_memory tells you which.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The silent-copy trap",
          text: "Reshape's copy-if-necessary behavior is invisible in printed values: t.reshape(12) looks identical whether it copied or not. If you later WRITE through what you believed was a view — or assume independence from what you believed was a copy — the bug is nasty. The habit: whenever reshaping anything you did not build yourself from scratch, one np.shares_memory check turns an assumption into a fact.",
        },
      ],
      terms: [
        { term: "Walking rule", definition: "How a flat data block is stepped through as a grid: C order fills the last axis fastest (rows first), F order fills the first axis fastest (columns first)." },
        { term: "C order (row-major)", definition: "The default memory and fill convention, inherited from C: the last axis changes fastest; a row is one contiguous run." },
        { term: "F order (column-major)", definition: "The Fortran/MATLAB convention: the first axis changes fastest; a column is one contiguous run. reshape(order=\"F\") reads the source this way." },
        { term: "-1 wildcard", definition: "A placeholder for one axis length you let NumPy compute: the shape product must equal size, so -1 is the quotient. At most one per call." },
        { term: "Silent copy", definition: "A reshape result that could not be a view, so NumPy built a new block without telling you. Detectable with np.shares_memory(a, result) -> False." },
        { term: "In-place shape assignment", definition: "a.shape = (2, 6): re-labels the same array object, creating no new array — legal only when the reshape can be a pure view." },
      ],
      mistakes: [
        {
          mistake: "Believing reshape physically rearranges or moves the values.",
          why: "It feels like work, so we assume work happened. In reality the block is untouched; only the header's shape and strides are re-derived. When no stride rule works, NumPy copies — the one case where data does move, silently.",
          fix: "Test it once with np.shares_memory(before, after) and build the reflex: reshape is grid lines, not data movement.",
        },
        {
          mistake: "Typing reshape(2, -1, -1) to mean 'split it however'.",
          why: "Two unknowns mean no unique answer, and NumPy raises ValueError rather than pick one for you.",
          fix: "One -1 only. If you want 'split into panels of 6', say reshape(2, 6); if you want 'rows of 6', say reshape(-1, 6).",
        },
        {
          mistake: "Expecting a.reshape(3, 4) to have changed a itself.",
          why: "The method returns a NEW array object (usually a view of the same block). a keeps its original shape until you rebind or assign.",
          fix: "Keep the result: b = a.reshape(3, 4). To genuinely change a in place, use a.shape = (3, 4) — and remember that form refuses to copy.",
        },
        {
          mistake: "Being surprised by order=\"F\" output and assuming values were shuffled.",
          why: "F order reads the source block column-major; the same values arrive in a different grid pattern. Nothing was shuffled — a different walking rule read the same strip.",
          fix: "Before using order=\"F\", ask whether your data actually arrived column-major (Fortran-produced files, some MATLAB interop). Otherwise stay with C, the ecosystem default.",
        },
      ],
      takeaways: [
        "Reshape never reorders values: the block stays byte-identical and the header gets new grid lines. C order fills the last axis fastest.",
        "order=\"C\" vs order=\"F\" are two readings of one block: rows-first vs columns-first. Same values, different-looking grids.",
        "-1 lets NumPy compute one axis length (12 / 3 -> 4); two -1s is an error, and so is any shape whose product is not a.size.",
        "Reshape returns a view when a stride rule can produce it and silently copies otherwise — np.shares_memory is the one-line truth serum.",
        "a.shape = (2, 6) re-labels the same array in place; it only works for view-possible reshapes, and the -1 wildcard is allowed there too.",
      ],
      quiz: [
        {
          id: "c-02-q1",
          prompt: "`np.arange(12).reshape(3, 4)` produces which grid, and why that one?",
          options: [
            { text: "Rows of 4: 0-3, 4-7, 8-11 — C order fills the last axis fastest", correct: true, feedback: "Correct: the strip is cut into runs of 4 and the runs are stacked downward." },
            { text: "Columns of 4 stacked side by side: first column is 0, 1, 2", correct: false, feedback: "That is the F-order (column-major) reading. The default is C order (row-major)." },
            { text: "A scrambled order determined by the strides", correct: false, feedback: "Nothing is ever scrambled: reshape never reorders values, it re-groups them in block order." },
            { text: "It depends on how arange laid out the numbers in memory", correct: false, feedback: "arange always lays out 0..11 contiguously in order — and the walking rule, not luck, decides the grid." },
          ],
          explanation: "C order (the default) walks the block and fills the last axis fastest: rows of 4, top to bottom.",
        },
        {
          id: "c-02-q2",
          prompt: "`a = np.arange(24)`. Which call is legal, and what shape results?",
          options: [
            { text: "a.reshape(4, -1, 2) -> (4, 3, 2)", correct: true, feedback: "Right: 24 / (4 x 2) = 3, so the wildcard becomes 3 and the shape is (4, 3, 2)." },
            { text: "a.reshape(-1, 2, -1) -> (6, 2, 2)", correct: false, feedback: "Two wildcards in one call are refused — ValueError. Only one -1 is allowed per reshape." },
            { text: "a.reshape(5, 5) -> (5, 5)", correct: false, feedback: "25 slots for 24 values: the product must equal a.size, so this raises 'cannot reshape array of size 24 into shape (5,5)'." },
            { text: "a.reshape(4, 6, order=\"F\") -> shape (6, 4)", correct: false, feedback: "order changes how the block is READ, not the shape: the result is still (4, 6), just filled column-major." },
          ],
          explanation: "One -1 maximum, product must equal size, and order only changes the fill reading — shape comes from the argument you pass.",
        },
        {
          id: "c-02-q3",
          prompt: "You run `v = t.reshape(12)` on a transposed view `t` (shape (4, 3), built from a (3, 4) parent). What is true of v?",
          options: [
            { text: "v shares memory with t, because reshape never copies", correct: false, feedback: "Reshape returns a view only WHEN POSSIBLE. A straight-line walk of a transposed view has no stride rule, so this one copied." },
            { text: "v is a fresh copy — np.shares_memory(t, v) is False", correct: true, feedback: "Correct — the silent-copy case. The values look right; the memory is new. Writes to v will not reach the parent." },
            { text: "The call raises, because t is non-contiguous", correct: false, feedback: "It does not raise: the .reshape() METHOD is allowed to copy when no view is possible. (The a.shape = assignment form is the one that refuses.)" },
            { text: "v shares memory only if t was built with order=\"F\"", correct: false, feedback: "order at construction time does not fix a jumpy walk later; the flat reshape of this transpose still copies." },
          ],
          explanation: "Views require a stride rule; where none exists, .reshape() copies silently — which is why np.shares_memory deserves a spot in your debugging toolbox.",
        },
      ],
    },

    // ------------------------------------------------------------- c-03
    {
      slug: "c-03",
      title: "Flattening: ravel, flatten and reshape(-1)",
      minutes: 14,
      summary:
        "One line, every value: ravel (a view when possible), flatten (always a copy) and reshape(-1) — and the mutation bug that happens when you pick the wrong one.",
      kind: "concept",
      objectives: [
        "Flatten any array to 1-D three ways and choose among them deliberately",
        "Prove with np.shares_memory which flattenings are views and which are copies",
        "Explain when writing through a flat view mutates the 2-D parent — and how to protect yourself",
        "Use order=\"F\" to flatten column-major, and say which real data that serves",
      ],
      why: "Sooner or later every workflow hands you a 2-D table, a 3-D image stack, a 4-D batch — and asks for 'just the values, in one line'. Flattening is that line. But there is a fork in the road with real consequences: ravel (a view when possible) and flatten (always a copy) look identical when printed and behave completely differently when written to. Choosing wrongly means either needless memory churn on gigabyte arrays or — far worse — silent mutation of the parent array through a view you thought was a copy. This lesson makes the difference visible, verifiable, and habitual.",
      blocks: [
        {
          kind: "text",
          text: "Flattening is reshaping's most common special case: **every dimension, collapsed into one axis**. Machine-learning libraries want flat feature vectors; file formats want long streams; histograms and statistics (Part H) want plain sequences. You already know one way from Lesson c-02 — `a.reshape(-1)` — and NumPy gives the operation two more names with two different memory contracts. All three agree on the values. They disagree on the one thing you cannot see in the printout: **whether you can write through the result into the parent**.",
        },
        {
          kind: "code",
          title: "Three flatteners, identical values, different contracts",
          code: `import numpy as np

a = np.arange(12).reshape(3, 4)

ravel_view   = a.ravel()          # "unpick" into 1-D: view when possible
flat_copy    = a.flatten()        # ALWAYS a fresh, independent copy
reshape_flat = a.reshape(-1)      # ravel's twin (reshape's view rules)

print(ravel_view)
print(flat_copy)
print(reshape_flat)

print(np.shares_memory(a, ravel_view))     # True  (a view)
print(np.shares_memory(a, flat_copy))      # False (a copy)
print(np.shares_memory(a, reshape_flat))   # True  (a view)
`,
          output: `[ 0  1  2  3  4  5  6  7  8  9 10 11]
[ 0  1  2  3  4  5  6  7  8  9 10 11]
[ 0  1  2  3  4  5  6  7  8  9 10 11]
True
False
True`,
          outputNote:
            "Three identical printouts — then the booleans tell the real story: ravel and reshape(-1) returned views of a's block; flatten allocated 12 new numbers of its own.",
          explain: [
            "`a` is contiguous (you built it directly), so walking it in one straight line is exactly its memory order: ravel and reshape(-1) are pure views, free.",
            "`flatten` copies by design — its entire reason to exist is the guarantee that the result is independent.",
            "Printed values can never distinguish these cases. The boolean can. This is Lesson c-02's view-vs-copy boundary, seen from the flattening side.",
          ],
        },
        {
          kind: "heading",
          text: "The mutation bug you will meet in the wild",
        },
        {
          kind: "text",
          text: "Here is the failure mode, demonstrated honestly. You flatten an image, scale the flat values for a quick experiment, and go on using the original image — which has now secretly changed, because your 'flat copy' was a view. Watch it happen, then watch `flatten` refuse to participate:",
        },
        {
          kind: "code",
          title: "Writing through a view, safely through a copy",
          code: `import numpy as np

img = np.arange(12).reshape(3, 4)

flat_view = img.ravel()       # a VIEW: same numbers, one axis
flat_view[0] = 99             # write through the flat view...
print(img[0, 0])              # ...and the 2-D parent sees it

flat_copy = img.flatten()     # a COPY: independent numbers
flat_copy[1] = 77             # write all you like...
print(img[0, 1])              # ...the parent never hears about it
`,
          output: `99
1`,
          outputNote:
            "99 then 1: the view's write landed in the parent's memory; the copy's write stayed in the copy. Nothing about the two flatten calls looked different when you called them.",
          explain: [
            "`flat_view[0] = 99` and `img[0, 0] = 99` are the same memory location seen through two headers. This is a *feature* — free, cache-friendly, and sometimes exactly what you want.",
            "It is a bug precisely when you did not mean it. If the flat version is scratch space, flatten (or `.copy()` any view) buys you isolation.",
            "Rule of thumb: **read, use ravel; write, use flatten** — or ravel consciously, knowing you are editing the parent.",
          ],
        },
        {
          kind: "heading",
          text: "When ravel itself must copy",
        },
        {
          kind: "text",
          text: "ravel's view is conditional. The same rule as reshape applies: if the array's block can be walked flat with a single stride, you get a view; if the array is a jumpy view (a transpose, a sliced-out patch), no stride rule works and ravel quietly copies. `flatten` has no such clause — it copies even when it did not have to:",
        },
        {
          kind: "code",
          title: "The boundary, proven on both sides",
          code: `import numpy as np

a = np.arange(12).reshape(3, 4)
t = a.T                                # a transpose view: jumpy walk

print(np.shares_memory(a, a.ravel()))     # True:  a itself is walkable flat
print(np.shares_memory(t, t.ravel()))     # False: this ravel had to copy
print(np.shares_memory(t, t.flatten()))   # False: by definition, always
`,
          output: `True
False
False`,
          outputNote:
            "True, False, False. The middle line is the one to internalize: ravel on a non-contiguous array degrades to a copy without an error, without a warning, and without any change in the printed values.",
          explain: [
            "So 'ravel is a view' is true *when possible*. If your code depends on the view (you want writes to flow through), verify with np.shares_memory rather than trusting the source array's history.",
            "The performance flip side: on a big transposed array, ravel silently allocates a full copy — the same cost as flatten, with none of the guarantees.",
          ],
        },
        {
          kind: "heading",
          text: "Flattening in F order",
        },
        {
          kind: "code",
          title: "Walking the columns down instead of the rows across",
          code: `import numpy as np

a = np.arange(12).reshape(3, 4)

print(a.ravel())               # C order (default): walk rows, left to right
print(a.ravel(order="F"))      # F order: walk columns, top to bottom
`,
          output: `[ 0  1  2  3  4  5  6  7  8  9 10 11]
[ 0  4  8  1  5  9  2  6 10  3  7 11]`,
          outputNote:
            "Row-major: 0, 1, 2, 3 then row 1. Column-major: 0, 4, 8 then column 1. Same twelve values, two readings — exactly the order=\"C\" vs order=\"F\" story from Lesson c-02.",
          explain: [
            "The F-order flatten reads the values the way a column-major program (Fortran, MATLAB, some databases) would consume them.",
            "If you are exporting to such a consumer, order=\"F\" saves you from transposing first: ravel(order=\"F\") IS the right stream.",
          ],
        },
        {
          kind: "table",
          title: "The three flatteners, side by side",
          headers: ["Call", "Returns", "Copies when", "You write through it", "Choose it when"],
          rows: [
            ["`a.ravel()`", "1-D array", "Only if no stride rule walks a flat", "You reach the parent (if it was a view)", "You only read the values — the common case"],
            ["`a.flatten()`", "1-D array", "Always, unconditionally", "Never touches the parent", "The flat data is scratch space you will modify"],
            ["`a.reshape(-1)`", "1-D array", "Same rule as ravel (they share machinery)", "Same as ravel", "You are mid-reshape-expression and want the idiom"],
          ],
          caption:
            "All three produce the same values in the same order. The memory contract is the only difference — and it only matters when someone writes.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "A note on performance",
          text: "flatten always allocates and copies the entire block. On one 12-value array that is nothing; on a 4K video frame stack it is gigabytes of churn per call, and inside a loop it is your profiler's top line. ravel is free when the array is walkable flat and a copy when it is not. Neither ever changes your values — the cost is purely in memory traffic, which is exactly why the choice should be deliberate rather than accidental.",
        },
        {
          kind: "functionDoc",
          name: "a.ravel",
          purpose: "Flatten any array into 1-D, returning a VIEW of the existing data whenever the flat walk is possible.",
          signature: 'a.ravel(order="C")',
          purposeDetail:
            "ravel is the memory-polite flattener. When the array's block can be walked front-to-back with a single stride (true for any contiguous array), ravel hands you a 1-D view: no allocation, and writes flow through to the parent. When no stride rule can produce the flat walk (a transpose view, a strided slice), ravel quietly copies — so treat 'ravel may share memory' as the rule and check with np.shares_memory when it matters. reshape(-1) follows exactly the same rules; ravel exists because the intent 'just give me the values in one line' deserves a name.",
          params: [
            {
              name: "order",
              type: '"C", "F", "A" or "K"',
              description: 'The walk order: "C" reads row-major (the default, matching the block itself), "F" reads column-major — the values arrive as if you walked the columns top to bottom.',
              example: 'order="F"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A 1-D array of a.size values: a view when the array can be walked flat, otherwise a copy. a itself is never modified.",
          },
          example: `import numpy as np

a = np.arange(12).reshape(3, 4)

flat = a.ravel()
print(flat)
print(np.shares_memory(a, flat))       # True: a view

flat[0] = 99                           # writes flow through!
print(a[0, 0])

t = a.T                                # a transpose view: not walkable flat
print(np.shares_memory(t, t.ravel()))  # False: this ravel had to copy
`,
          exampleOutput: `[ 0  1  2  3  4  5  6  7  8  9 10 11]
True
99
False`,
          commonMistakes: [
            {
              mistake: "Writing into a ravel result and being surprised the parent changed.",
              why: "A ravel view is the same memory seen through one axis — assigning through it assigns the parent's elements.",
              fix: "Need independence? Use a.flatten(), or a.ravel().copy() when you want the view rules and a copy at the end. One extra word, no surprises.",
            },
            {
              mistake: "Assuming ravel ALWAYS returns a view.",
              why: "It cannot: transposes and strided slices have no single-stride flat walk, and NumPy silently copies instead of raising.",
              fix: "When the distinction matters, ask: np.shares_memory(parent, flat) — one boolean, no guessing.",
            },
            {
              mistake: "Calling a.ravel() and expecting a itself to become flat.",
              why: "ravel RETURNS a new array object (view or copy); it never changes a's shape.",
              fix: "Keep the result — or rebind the name: a = a.ravel(). To genuinely re-label the same object, a.shape = (a.size,) also works for contiguous arrays.",
            },
          ],
          related: [
            { name: "a.flatten", relation: "Identical values, opposite contract: ALWAYS a fresh copy. The write-safely sibling." },
            { name: "a.reshape(-1)", relation: "The same machinery under an idiom — view when possible, copy otherwise." },
            { name: "np.shares_memory", relation: "The one-call oracle for 'did this flatten copy?' — used everywhere in this lesson." },
            { name: "a.flat", relation: "A flat INDEXING helper (not an array): a.flat[i] reads/writes through to the original, element by element." },
          ],
          applications: [
            "Feeding a 2-D or 3-D array to an API that only accepts 1-D vectors",
            "Iterating every value in reading order without building a copy (histograms, checksums, streaming out)",
            "Handing column-major consumers a Fortran-ordered stream with ravel(order=\"F\") instead of transposing first",
          ],
          notes:
            "The name is deliberate: to ravel is to unweave — the grid's rows and columns come undone, leaving the one long thread that was there all along in memory.",
        },
        {
          kind: "functionDoc",
          name: "a.flatten",
          purpose: "Flatten any array into 1-D with a guaranteed, independent COPY of every value.",
          signature: 'a.flatten(order="C")',
          purposeDetail:
            "flatten is ravel's safe sibling: identical output values, opposite memory contract. It ALWAYS allocates a fresh block and copies — even when a view would have been possible. That makes it slower and hungrier than ravel, but perfectly predictable: writes to the result never touch the parent, and later changes to the parent never leak into your flat copy. Reach for flatten when you intend to MODIFY the flat data, or when you must hand other code a stable snapshot; reach for ravel when you only read. The cost is real but bounded: exactly one copy, once.",
          params: [
            {
              name: "order",
              type: '"C", "F", "A" or "K"',
              description: 'The walk order used while reading values out: "C" row-major (default), "F" column-major.',
              example: 'order="F"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A fresh 1-D array of a.size values, always a copy — np.shares_memory(a, result) is always False.",
          },
          example: `import numpy as np

a = np.arange(12).reshape(3, 4)

flat = a.flatten()
print(flat)
print(np.shares_memory(a, flat))   # False: always a copy

flat[0] = 99                       # the parent is protected
print(a[0, 0])                     # still 0

print(a.flatten(order="F"))        # walk the columns instead
`,
          exampleOutput: `[ 0  1  2  3  4  5  6  7  8  9 10 11]
False
0
[ 0  4  8  1  5  9  2  6 10  3  7 11]`,
          commonMistakes: [
            {
              mistake: "Calling flatten inside a hot loop 'because it is simple'.",
              why: "Every call allocates and copies the entire block — on a large array per iteration, that is pure churn your profiler will find immediately.",
              fix: "Read-only use? a.ravel() (a view when possible). Genuinely need the copy? Flatten ONCE, outside the loop, and reuse the result.",
            },
            {
              mistake: "Expecting flatten() to transpose or reorder values beyond the order argument.",
              why: "It only walks the existing axes in the chosen order; it never changes what the values mean.",
              fix: "For axis reordering see np.transpose (Lesson c-04); for a column-major walk use order=\"F\" — that is the entire extra power here.",
            },
            {
              mistake: "Writing a.flat[...] and assuming a.flat is the same thing as a.flatten().",
              why: "a.flat is a special indexing object, not an array: it returns scalars and WRITES THROUGH to the original data — the opposite of flatten's isolation.",
              fix: "Use a.flatten() for an independent 1-D array. Touch a.flat only when you specifically want element-wise writes to flow through.",
            },
          ],
          related: [
            { name: "a.ravel", relation: "Same values, view when possible — the read-only sibling that usually costs nothing." },
            { name: "a.reshape(-1)", relation: "The idiom form; view-or-copy depending on strides (you cannot force either)." },
            { name: "ndarray.copy", relation: "The general 'I insist on independence' tool — works on any view, not just flattenings." },
            { name: "a.flat", relation: "A flat indexing helper that writes through to the original — flatten's mirror image." },
          ],
          applications: [
            "Creating scratch-space 1-D data derived from a table you must not modify",
            "Snapshotting an array's values for a background task or cache while the original keeps changing",
            "Interoperating with libraries that demand independent 1-D buffers (some C APIs, some file writers)",
          ],
          notes:
            "flatten's predictability is its product. ravel is faster when it can be and cheaper-looking in code review; flatten is the one you can explain in one word: copy.",
        },
        {
          kind: "tryIt",
          title: "See the mutation bug with your own eyes",
          task: "Run as-is and read the two prints carefully: the ravel write changed the parent, the flatten write did not. Then (1) change img.ravel() to img.ravel().copy() and confirm the parent stays at 0; (2) flatten with order=\"F\" and predict the first four values before you print.",
          code: `import numpy as np

img = np.arange(6).reshape(2, 3)

flat_view = img.ravel()
flat_view[0] = 100
print("parent after ravel write  :", img[0, 0])

flat_copy = img.flatten()
flat_copy[0] = -1
print("parent after flatten write:", img[0, 0])

print("F-order flatten:", img.flatten(order="F"))
`,
          hint: "For (2): the F walk goes down columns — with this (2, 3) array the first column is [100, 3], then [1, 4], then [2, 5].",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "ravel unpicks the weave into the original thread (a view when possible — writes flow through); flatten cuts a fresh thread the same length (always a copy — writes stay put); reshape(-1) is ravel wearing an idiom. Read, ravel. Write, flatten.",
        },
      ],
      terms: [
        { term: "Flattening", definition: "Collapsing every axis of an array into a single 1-D axis that walks the data block in order." },
        { term: "ravel", definition: "The flattener that returns a view when a single stride can walk the block flat, and silently copies otherwise." },
        { term: "flatten", definition: "The flattener that unconditionally allocates and returns an independent copy of the values in 1-D." },
        { term: "Write-through", definition: "Assigning through a view (e.g. a ravel view) and thereby changing the parent array's memory — the feature/bug at this lesson's center." },
      ],
      mistakes: [
        {
          mistake: "Using ravel for scratch data and wondering where the parent's values came to be modified.",
          why: "A ravel view is the same memory through one axis; writing flat_view[i] writes the parent's element. No error, no warning — just different numbers later.",
          fix: "If the flat version will be written, flatten (or ravel().copy()). Reserve ravel for read-only flattening.",
        },
        {
          mistake: "Assuming 'ravel returns a view' is a guarantee.",
          why: "On non-contiguous arrays (transposes, strided slices) no stride rule walks the block flat, and ravel silently degrades to a copy.",
          fix: "When the view matters, prove it: np.shares_memory(a, f). One line replaces one assumption.",
        },
        {
          mistake: "Reaching for flatten by default everywhere 'to be safe'.",
          why: "Safety copies cost memory and time on every call, and inside loops on large arrays that cost dominates — for a guarantee you usually do not need.",
          fix: "Default to ravel for reading; switch to flatten precisely when you intend to write. Deliberate beats reflexive in both directions.",
        },
      ],
      takeaways: [
        "a.ravel(), a.flatten() and a.reshape(-1) produce identical values in identical order — they differ only in memory contract.",
        "ravel: view when a stride rule can walk the block flat, silent copy otherwise. flatten: always a copy. Prove either with np.shares_memory.",
        "Writing through a ravel view writes the parent: img.ravel()[0] = 99 makes img[0, 0] become 99. Read, ravel; write, flatten.",
        "order=\"F\" flattens column-major — the right stream for Fortran/MATLAB-style consumers, with no transpose needed.",
      ],
      quiz: [
        {
          id: "c-03-q1",
          prompt: "`img = np.arange(12).reshape(3, 4)` and you run `f = img.ravel(); f[0] = 99`. What is `img[0, 0]` afterwards?",
          options: [
            { text: "99 — ravel returned a view, and the write went into the shared block", correct: true, feedback: "Correct: img is contiguous, so the flat walk is its own memory order — a view, and writes land in the parent." },
            { text: "0 — ravel always copies, so the parent is protected", correct: false, feedback: "That is flatten's contract. ravel copies only when no stride rule can walk the array flat; here one can." },
            { text: "The assignment raises, because f is 1-D and img is 2-D", correct: false, feedback: "Shapes do not lock memory together: f and img share bytes, so the flat write simply lands in img's first element." },
            { text: "99 only if you also printed img — otherwise it stays 0", correct: false, feedback: "Memory does not care about printing: the write happened in the shared block the moment you assigned." },
          ],
          explanation: "ravel on a contiguous array is a view: flat writes are parent writes. This exact pattern is the lesson's headline bug and headline feature.",
        },
        {
          id: "c-03-q2",
          prompt: "Which statement about flatten is TRUE?",
          options: [
            { text: "It copies only when the array is non-contiguous", correct: false, feedback: "That is ravel's conditional rule. flatten copies unconditionally — even when a view was possible." },
            { text: "It always returns an independent copy: np.shares_memory(a, a.flatten()) is False, always", correct: true, feedback: "Correct — that guarantee is flatten's entire product. You pay one copy; you get full isolation." },
            { text: "It modifies the array in place, dropping its axes", correct: false, feedback: "It returns a NEW 1-D array and never touches the original's shape or values." },
            { text: "It is the fastest way to flatten, because it avoids stride computation", correct: false, feedback: "The opposite: ravel skips the allocation when it can; flatten never skips anything." },
          ],
          explanation: "flatten = always a copy. Slower when a view was possible, and the only option that guarantees isolation.",
        },
        {
          id: "c-03-q3",
          prompt: "`a = np.arange(12).reshape(3, 4)`. What does `print(a.ravel(order=\"F\"))` show?",
          options: [
            { text: "0 4 8 1 5 9 2 6 10 3 7 11 — down each column in turn", correct: true, feedback: "Right: the F walk visits [0,0], [1,0], [2,0], then column 1 — the column-major reading of the same values." },
            { text: "0 1 2 3 4 5 6 7 8 9 10 11 — order never changes ravel's output", correct: false, feedback: "order changes the WALK, and the walk decides the sequence: only order=\"C\" (the default) gives the row-major line." },
            { text: "The transpose of a, printed as a 4x3 grid", correct: false, feedback: "ravel always returns 1-D — no grid remains. The F-order VALUES resemble a transposed reading, but the result is one flat line." },
            { text: "An error: order is only valid for reshape, not ravel", correct: false, feedback: "ravel takes the same order argument as reshape — \"C\" and \"F\" are both valid walks." },
          ],
          explanation: "ravel(order=\"F\") is the column-major flatten: 0 4 8, then 1 5 9, then 2 6 10, then 3 7 11.",
        },
      ],
    },

    // ------------------------------------------------------------- c-04
    {
      slug: "c-04",
      title: "Transpose and Axis Gymnastics",
      minutes: 16,
      summary:
        "Beyond the 2-D mirror: transpose with explicit axis orders, moveaxis, swapaxes, expand_dims, squeeze and the atleast family — plus the (3,) / (1, 3) / (3, 1) trinity that causes half of all broadcasting bugs.",
      kind: "concept",
      objectives: [
        "Use np.transpose with an explicit axes permutation on 3-D+ data and predict the resulting shape",
        "Choose correctly between moveaxis (relocate named axes) and swapaxes (exchange two axes)",
        "Build the shape trinity — (n,) to (n, 1) to (1, n) — with expand_dims and None-indexing, and say why broadcasting cares",
        "Strip surplus length-1 axes with squeeze (safely, by naming the axis)",
        "Use the atleast_1d/2d/3d family to guarantee a minimum dimensionality",
      ],
      why: "Half of all broadcasting bugs and a shocking share of machine-learning input errors come from one tiny confusion: the difference between shape (3,), (1, 3) and (3, 1). This lesson builds complete comfort with the operations that move axes — transpose for the 2-D case you already know, explicit axis-order transpose for N-D, moveaxis and swapaxes for surgical moves, expand_dims and squeeze for adding and removing length-1 axes, and the atleast family for guarantees. When you finish, a (3, 4, 2) result will not surprise you: you will know which axis went where, and why.",
      blocks: [
        {
          kind: "text",
          text: "You have known the 2-D transpose since Part A: `a.T` swaps rows and columns, costs nothing (it is a view), and writes through to the original. One-sentence recap done. The rest of this lesson is about everything transpose *generalizes to*: reordering the axes of N-D arrays, inserting and deleting axes of length 1, and why a vector, a row and a column are three different arrays despite holding the same numbers.",
        },
        {
          kind: "code",
          title: "The recap, then the generalization",
          code: `import numpy as np

m = np.arange(6).reshape(2, 3)
print(m)
print(m.T)                        # the 2-D mirror
print(np.shares_memory(m, m.T))   # Part A's fact, re-proven: a view

cube = np.arange(24).reshape(2, 3, 4)
print(np.transpose(cube).shape)              # no axes: reverse ALL axes
print(np.transpose(cube, (1, 0, 2)).shape)   # explicit: swap axes 0 and 1
`,
          output: `[[0 1 2]
 [3 4 5]]
[[0 3]
 [1 4]
 [2 5]]
True
(4, 3, 2)
(3, 2, 4)`,
          outputNote:
            "The 2-D mirror generalizes two ways: with no axes argument every axis reverses; with a permutation you place each OLD axis exactly where you want it in the new shape.",
          explain: [
            "`m.T` on a (2, 3) gives (3, 2) — the row/column swap you know.",
            "`np.transpose(cube)` with no axes reverses the whole shape: (2, 3, 4) becomes (4, 3, 2).",
            "`np.transpose(cube, (1, 0, 2))` reads 'the new axis 0 is the old axis 1; the new axis 1 is the old axis 0; axis 2 stays' — so (2, 3, 4) becomes (3, 2, 4). The permutation names OLD axes in NEW order.",
          ],
        },
        {
          kind: "heading",
          text: "The shape trinity: (3,) vs (1, 3) vs (3, 1)",
        },
        {
          kind: "text",
          text: "Here is the single most valuable picture in this half of the course. A vector of three numbers can live in **three different shapes**, and operations treat all three differently. Print them side by side until the brackets mean something to you:",
        },
        {
          kind: "visual",
          title: "Three shapes, same three numbers",
          ascii: `  v = np.array([10, 20, 30])    -- ONE axis; no rows, no columns

  shape (3,)    "a vector"      [10 20 30]              v[1] -> 20

  shape (1, 3)  "a row"        [[10 20 30]]             v[0, 1] -> 20
                                 one row of three

  shape (3, 1)  "a column"      [[10],                  v[1, 0] -> 20
                                  [20],                 three rows of one
                                  [30]]

  Same values. Same order. Different axes -- and operations
  (especially broadcasting, Part G) treat them as strangers.
  Half of all shape bugs are (3,) met (1, 3) when the author
  meant (3, 1), or the other way around.
`,
          caption:
            "Say their names: vector, row, column. The row has an axis-0 of length 1; the column has an axis-1 of length 1. When a library complains about shapes, translate the message into these words first.",
        },
        {
          kind: "code",
          title: "Building the trinity: expand_dims and the None idiom",
          code: `import numpy as np

v = np.array([10, 20, 30])

print(v.shape)              # (3,)  : a vector
print(v[None, :].shape)     # (1, 3): None inserts a length-1 axis FIRST
print(v[:, None].shape)     # (3, 1): None inserts a length-1 axis LAST

row = np.expand_dims(v, axis=0)   # the explicit, readable form
col = np.expand_dims(v, axis=1)   # of the same two moves
print(row.shape, col.shape)
`,
          output: `(3,)
(1, 3)
(3, 1)
(1, 3) (3, 1)`,
          outputNote:
            "v[None, :] and np.expand_dims(v, 0) are the same array; v[:, None] and np.expand_dims(v, 1) are too. None-indexing is the fast idiom, expand_dims the self-documenting version.",
          explain: [
            "`None` inside the bracket is shorthand for np.newaxis: it inserts an axis of length 1 at that position. Nothing is copied — a view, always.",
            "Why bother? **Broadcasting preview**: when two arrays meet, NumPy aligns their shapes from the RIGHT and stretches any length-1 axis to fit. A (3, 1) column meets a (1, 4) row and both stretch into a (3, 4) grid — Part G turns this into a system; today, see why the length-1 axes are the door.",
          ],
        },
        {
          kind: "code",
          title: "A taste of why the trinity matters: every pair, no loops",
          code: `import numpy as np

v = np.array([10, 20, 30])      # shape (3,)
w = np.array([1, 2, 3, 4])      # shape (4,)

table = v[:, None] + w[None, :]   # (3, 1) + (1, 4)  ->  (3, 4)
print(table)
print(table.shape)
`,
          output: `[[11 12 13 14]
 [21 22 23 24]
 [31 32 33 34]]
(3, 4)`,
          outputNote:
            "Every vi + wj combination, computed in one expression. The (3, 1) column stretched across 4 columns; the (1, 4) row stretched down 3 rows — that stretching is broadcasting.",
          explain: [
            "Without the None axes, v + w would be an error: (3,) and (4,) do not match element-wise (Part G shows the exact rules).",
            "With them, each length-1 axis becomes a stretchable slot, and the two arrays grow to a common (3, 4) shape.",
            "File this as motivation: the axis-insertion tools in this lesson are exactly how you prepare arrays for broadcasting — which is why the trinity causes so many bugs when it is mishandled.",
          ],
        },
        {
          kind: "heading",
          text: "moveaxis and swapaxes: surgical axis moves",
        },
        {
          kind: "text",
          text: "For 3-D and beyond, `np.transpose` makes you spell out the whole permutation — easy to get wrong on a 5-D tensor. Two tools do the surgical versions. **np.moveaxis** relocates the axes you name and lets the rest close ranks in order; **np.swapaxes** exchanges exactly two axes and touches nothing else. Both always return views. The classic real-world use is the channels-first/channels-last image conversion from Lesson c-01:",
        },
        {
          kind: "code",
          title: "Conventions converted in one call",
          code: `import numpy as np

cube = np.arange(24).reshape(2, 3, 4)    # axes: 0 panels, 1 rows, 2 cols

print(np.moveaxis(cube, 0, -1).shape)    # panel axis to the END: (3, 4, 2)
print(np.moveaxis(cube, -1, 0).shape)    # column axis to the FRONT: (4, 2, 3)
print(np.swapaxes(cube, 0, 2).shape)     # exchange panels and cols: (4, 3, 2)
print(np.shares_memory(cube, np.moveaxis(cube, 0, -1)))   # still a view

rgb = np.zeros((3, 96, 64))              # channels-first image
img = np.moveaxis(rgb, 0, -1)            # channels-last, the plotting world
print(rgb.shape, "->", img.shape)
`,
          output: `(3, 4, 2)
(4, 2, 3)
(4, 3, 2)
True
(3, 96, 64) -> (96, 64, 3)`,
          outputNote:
            "moveaxis(cube, 0, -1) sends the panel axis to the end and the rows/columns keep their relative order. The last two lines are the (3, H, W) to (H, W, 3) conversion every image pipeline eventually needs.",
          explain: [
            "`moveaxis(a, source, destination)`: the axis at position source is re-inserted at destination (counted among the OTHER axes); everything unnamed slides to fill the gaps, keeping its order.",
            "`swapaxes(a, i, j)` is the two-axis special case — the exact equivalent of transpose for one pair of axes.",
            "None of these move data: every result shares the original block, and writes flow through. Independence costs one .copy().",
          ],
        },
        {
          kind: "heading",
          text: "squeeze and the atleast family: subtracting and guaranteeing axes",
        },
        {
          kind: "text",
          text: "Real pipelines accumulate junk axes: an `expand_dims` you no longer need, a batch dimension of size 1 because you processed one sample, a library that returned (1, 3, 1). **np.squeeze** strips length-1 axes away — all of them by default, or exactly the one you name. The **atleast** family goes the other direction: `np.atleast_2d(x)` guarantees x has at least two axes, promoting scalars and vectors minimally, and leaving anything bigger untouched. These two are how you normalize shapes at API boundaries.",
        },
        {
          kind: "code",
          title: "Cleaning up junk axes, guaranteeing minimums",
          code: `import numpy as np

m = np.arange(6).reshape(1, 2, 1, 3)    # two useless length-1 axes

print(np.squeeze(m).shape)              # all of them at once: (2, 3)
print(np.squeeze(m, axis=0).shape)      # only axis 0: (2, 1, 3)

s = np.array([[7]])                     # a 1x1 table holding one value
print(np.squeeze(s), np.squeeze(s).shape)   # a 0-D scalar, shape ()

print(np.atleast_1d(42).shape)          # scalar  -> (1,)
print(np.atleast_2d([1, 2, 3]).shape)   # vector  -> (1, 3): one row
print(np.atleast_3d([1, 2, 3]).shape)   # +column axis -> (1, 3, 1)
`,
          output: `(2, 3)
(2, 1, 3)
7 ()
(1,)
(1, 3)
(1, 3, 1)`,
          outputNote:
            "squeeze removed the two length-1 axes and even unwrapped the 1x1 table to a 0-D scalar. atleast_2d promoted the vector to a single row; atleast_3d then wrapped a column axis around it.",
          explain: [
            "squeeze with axis= is the SAFE form: it removes exactly that axis and raises if the axis is not length 1 — turning a silent assumption into a checked one.",
            "squeeze with no axis removes every length-1 axis, including ones you may have wanted (a (1, 3) row becomes a plain (3,) vector).",
            "The atleast family is your defensive wrapper at function boundaries: `x = np.atleast_2d(x)` means 'from here on, x indexes in two dimensions', whatever the caller passed.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.transpose",
          purpose: "Reverse an array's axes (the N-D generalization of .T), or place them in any order you specify.",
          signature: "np.transpose(a, axes=None)",
          purposeDetail:
            "For 2-D arrays transpose is the familiar mirror: rows become columns. For N-D arrays the real power is the axes argument: a permutation like (1, 0, 2) says 'the OLD axis 1 becomes the NEW axis 0, the old axis 0 becomes the new axis 1, axis 2 stays'. No value ever moves in memory — NumPy only re-derives strides — so the result is always a view, and writing through it writes the original. Libraries disagree about whether an image is (3, H, W) or (H, W, 3); transpose is how you translate between conventions.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array whose axes will be reordered.",
              example: "img",
            },
            {
              name: "axes",
              type: "tuple of ints or None",
              description: "The target order: axes[i] is the ORIGINAL axis that becomes new axis i. Omit it (None) to reverse all axes completely — that is what a.T does.",
              example: "(1, 0, 2) or (2, 0, 1)",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A view of a with reordered axes: the reversed shape by default, or the permutation you asked for. np.shares_memory(a, result) is always True.",
          },
          example: `import numpy as np

m = np.arange(6).reshape(2, 3)
print(np.transpose(m))                       # the classic mirror

cube = np.arange(24).reshape(2, 3, 4)        # (panels, rows, cols)
print(np.transpose(cube).shape)              # reversed: (4, 3, 2)
print(np.transpose(cube, (1, 0, 2)).shape)   # rows first now: (3, 2, 4)
print(np.shares_memory(cube, np.transpose(cube)))  # True: a view
`,
          exampleOutput: `[[0 3]
 [1 4]
 [2 5]]
(4, 3, 2)
(3, 2, 4)
True`,
          commonMistakes: [
            {
              mistake: "Passing the SHAPE you want, e.g. np.transpose(cube, (3, 2, 4)).",
              why: "axes is an ORDER of the existing axis numbers (0..ndim-1), not a shape. A 3 in a 3-D array's permutation refers to an axis that does not exist.",
              fix: "Think positions, not sizes: 'which OLD axis goes into NEW slot 0?' — and use each axis exactly once.",
            },
            {
              mistake: "Repeating an axis in the permutation, e.g. (0, 0, 1).",
              why: "Each original axis must land in exactly one new position; a repeated axis cannot be in two places at once, so NumPy raises ValueError.",
              fix: "A valid permutation contains every number 0..ndim-1 exactly once. Count your entries.",
            },
            {
              mistake: "Forgetting the result shares memory with the original.",
              why: "Transpose never copies; writes through the transposed view change the parent, and vice versa.",
              fix: "Independence costs one word: np.transpose(a).copy(). (ascontiguousarray additionally fixes the jumpy layout — Part J.)",
            },
          ],
          related: [
            { name: "ndarray.T", relation: "The attribute shortcut for the no-axes (full reverse) case — identical to np.transpose(a)." },
            { name: "np.moveaxis", relation: "The surgical version: name the axes to move, keep the rest in order — no full permutation to write." },
            { name: "np.swapaxes", relation: "The two-axis special case: exchange exactly one pair of axes." },
            { name: "np.reshape", relation: "Re-groups values under new grid lines (Lesson c-02); transpose only reorders the existing axes." },
          ],
          applications: [
            "Converting image conventions: (3, H, W) channels-first to (H, W, 3) channels-last for plotting",
            "Making matrix products legal: A @ B needs A's last axis to match B's first — transpose aligns them (Part I)",
            "Presenting tables for humans: rows-as-records to columns-as-records and back",
          ],
          notes:
            "For 1-D arrays, transpose is the identity: a vector has one axis, and reversing one axis changes nothing — v.T IS v, shape and all. This surprises everyone once; it is why vectors need expand_dims to become rows or columns.",
        },
        {
          kind: "functionDoc",
          name: "np.moveaxis",
          purpose: "Move chosen axes to new positions while all the other axes keep their original relative order.",
          signature: "np.moveaxis(a, source, destination)",
          purposeDetail:
            "Reordering many axes with np.transpose forces you to spell out the full permutation — easy to get wrong on a 4-D or 5-D tensor. moveaxis does the surgical version: name the axis (or axes) you want moved and where each should land; everything else closes ranks in its original order. It is the natural tool for 'the channel axis should be last, not first' — the classic (3, H, W) image to (H, W, 3) conversion — and it always returns a view, like every axis-reordering operation in this lesson.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array whose axes move.",
              example: "rgb",
            },
            {
              name: "source",
              type: "int or tuple of ints",
              required: true,
              description: "The original position(s) of the axis (or axes) to move. Negatives count from the end.",
              example: "0 or (0, 1)",
            },
            {
              name: "destination",
              type: "int or tuple of ints",
              required: true,
              description: "Where each moved axis should land — positions counted among the axes that remain. Must pair with source.",
              example: "-1 (the end) or (1, 2)",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A view of a with the named axes relocated; all untouched axes keep their relative order.",
          },
          example: `import numpy as np

rgb = np.zeros((3, 96, 64))        # channels first (NumPy's world)
img = np.moveaxis(rgb, 0, -1)      # channels last  (matplotlib's world)
print(rgb.shape, "->", img.shape)

cube = np.arange(24).reshape(2, 3, 4)
print(np.moveaxis(cube, 0, -1).shape)   # panel axis to the end: (3, 4, 2)
print(np.moveaxis(cube, -1, 0).shape)   # column axis to front: (4, 2, 3)
print(np.shares_memory(rgb, img))       # still the same numbers
`,
          exampleOutput: `(3, 96, 64) -> (96, 64, 3)
(3, 4, 2)
(4, 2, 3)
True`,
          commonMistakes: [
            {
              mistake: "Expecting destination to be the final index in the result's shape.",
              why: "NumPy interprets destination among the axes that remain AFTER the moved axis is lifted out — so the same destination can land in different final positions depending on source.",
              fix: "Think 'lift it out, then insert it there'. For single-axis moves on small examples, print the resulting shape once and recalibrate.",
            },
            {
              mistake: "Passing shape sizes instead of axis positions (e.g. moveaxis(img, 96, 0)).",
              why: "source and destination are axis POSITIONS (0..ndim-1), not lengths. 96 is an axis that does not exist.",
              fix: "Count brackets, not elements: a (3, 96, 64) array has axes 0, 1, 2 and nothing else.",
            },
            {
              mistake: "Forgetting the result is a view.",
              why: "Like transpose and swapaxes, moveaxis only rewrites strides; writes through the result write the original.",
              fix: "Append .copy() when the moved version must be independent.",
            },
          ],
          related: [
            { name: "np.transpose", relation: "The full-permutation version — explicit control over every axis at once." },
            { name: "np.swapaxes", relation: "The two-axis exchange; moveaxis with one axis and one destination covers most of its uses." },
            { name: "np.expand_dims", relation: "Instead of moving an existing axis, inserts a brand-new length-1 axis." },
            { name: "np.stack", relation: "Creates a genuinely new axis holding several arrays (Lesson c-05) — not a reorder." },
          ],
          applications: [
            "Channels-first to channels-last image conversion at library boundaries (and back)",
            "Moving a batch axis to the front (or the end) before or after a model call",
            "Preparing tensors for APIs that document their expected axis order ('time must be axis 1')",
          ],
          notes:
            "moveaxis never mixes or merges axes and never changes the total number of values — it is pure reordering, always a view, and the shape permutation is the only thing that changes.",
        },
        {
          kind: "functionDoc",
          name: "np.expand_dims",
          purpose: "Insert a brand-new axis of length 1 at a chosen position — the deliberate way to turn (n,) into (1, n) or (n, 1).",
          signature: "np.expand_dims(a, axis)",
          purposeDetail:
            "A length-1 axis changes no values, no order and no memory — it only adds a position you can index and, crucially, a slot that broadcasting (Part G) can stretch. expand_dims is the explicit, readable way to add exactly that slot where you want it. The bracket idiom v[None, :] (insert at the front) and v[:, None] (insert at the end) does the same thing via np.newaxis; expand_dims spells it out and lets you insert several axes at once with a tuple. It always returns a view.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array that gains an axis.",
              example: "v",
            },
            {
              name: "axis",
              type: "int or tuple of ints",
              required: true,
              description: "Where the new length-1 axis (or axes) is inserted in the result's shape. Negatives count from the end; axis=-1 appends at the end.",
              example: "0, 1, or (0, 2)",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A view of a with ndim+1 (or more) axes: the original shape with length-1 entries inserted at the chosen positions. size is unchanged.",
          },
          example: `import numpy as np

v = np.array([5, 10, 15])

print(np.expand_dims(v, 0).shape)        # (1, 3): a row
print(np.expand_dims(v, 1).shape)        # (3, 1): a column
print(np.expand_dims(v, (0, 2)).shape)   # two at once: (1, 3, 1)

row = np.expand_dims(v, 0)
print(row)
print(np.shares_memory(v, row))          # a view: nothing moved
`,
          exampleOutput: `(1, 3)
(3, 1)
(1, 3, 1)
[[ 5 10 15]]
True`,
          commonMistakes: [
            {
              mistake: "Thinking expand_dims adds data.",
              why: "It adds an AXIS of length 1 — a new indexable position, not values. size before and after is identical.",
              fix: "Check a.size before and after: unchanged. The brackets in the printout are the only thing that grew.",
            },
            {
              mistake: "Using expand_dims when np.stack was meant.",
              why: "expand_dims decorates ONE array with a new axis; stack GLUES SEVERAL same-shaped arrays along a new axis (Lesson c-05).",
              fix: "One array needing a slot: expand_dims. Several arrays becoming panels of one array: np.stack.",
            },
            {
              mistake: "Losing track of where a negative axis lands.",
              why: "axis=-1 inserts AFTER the last existing axis (appends at the end), while axis=0 prepends before everything — the two directions are easy to swap in your head under deadline pressure.",
              fix: "Print the resulting shape once. Or avoid negatives here: expand_dims has only one interesting argument, so spell the position out positively.",
            },
          ],
          related: [
            { name: "np.newaxis", relation: "The None-in-brackets idiom — v[None, :] is expand_dims(v, 0) in fewer characters." },
            { name: "np.squeeze", relation: "The exact inverse: removes length-1 axes instead of inserting them." },
            { name: "np.stack", relation: "Creates a new axis too — but fills it with several arrays rather than length 1." },
            { name: "np.atleast_2d", relation: "A guarantee ('at least 2 axes') rather than a precise insertion; uses row-promotion rules." },
          ],
          applications: [
            "Turning a vector into a column (n, 1) for matrix multiplication or broadcasting (Part G)",
            "Giving a single sample a batch axis: model expects (batch, features), you have (features,)",
            "Preparing outer-product style expressions: v[:, None] * w[None, :]",
          ],
          notes:
            "The tuple form np.expand_dims(v, (0, 2)) inserts multiple axes in one call — handy when a library wants, say, (1, n, 1) shaped weights.",
        },
        {
          kind: "functionDoc",
          name: "np.squeeze",
          purpose: "Remove length-1 axes — the cleanup crew for shapes like (1, 3, 1) that should simply be (3,).",
          signature: "np.squeeze(a, axis=None)",
          purposeDetail:
            "Real pipelines constantly produce surplus length-1 axes: expand_dims leftovers, batch machinery that processed a single item, library outputs shaped for generality. squeeze strips them away. With no axis argument it removes EVERY length-1 axis; with axis= it removes exactly that one — and raises if that axis is not actually length 1, which turns a silent assumption into a checked one (a feature, not an inconvenience). It returns a view of the input when anything is removed, and the input itself when there is nothing to do.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array with surplus length-1 axes.",
              example: "m",
            },
            {
              name: "axis",
              type: "None, int or tuple of ints",
              description: "Remove only the named length-1 axis (or axes). None (the default) removes all of them. Named axes that are not length 1 raise ValueError.",
              example: "axis=0 or axis=(0, 2)",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A view of a with the chosen length-1 axes gone. Axes longer than 1 are never touched; a fully-squeezed 1x1 array becomes 0-D.",
          },
          example: `import numpy as np

m = np.arange(6).reshape(1, 2, 1, 3)

print(np.squeeze(m).shape)           # all length-1 axes: (2, 3)
print(np.squeeze(m, axis=0).shape)   # just axis 0: (2, 1, 3)

s = np.array([[7]])
print(np.squeeze(s), np.squeeze(s).shape)   # a 0-D scalar: 7, shape ()

print(np.shares_memory(m, np.squeeze(m)))   # a view, nothing copied
`,
          exampleOutput: `(2, 3)
(2, 1, 3)
7 ()
True`,
          commonMistakes: [
            {
              mistake: "Squeezing without axis and losing an axis you needed.",
              why: "axis=None removes ALL length-1 axes — including one you may have inserted deliberately for broadcasting.",
              fix: "Name the axis: np.squeeze(m, axis=2). The named form also fails loudly when that axis is not length 1, converting assumptions into checks.",
            },
            {
              mistake: "Expecting squeeze to shorten axes that are longer than 1.",
              why: "squeeze only deletes axes of LENGTH 1 — a (4, 3) array comes back unchanged, not (3,) or (12,).",
              fix: "To reduce actual data, use indexing/slicing (Part D) or an aggregation (Part H). squeeze is geometry, not computation.",
            },
            {
              mistake: "Being surprised that a fully-squeezed 1x1 result prints without brackets.",
              why: "np.squeeze([[7]]) is a 0-D array — one number with no axes. Its repr is just 7; brackets only appear around axes.",
              fix: "That is correct and often wanted (a scalar score out of a 1x1 result). Keep the axis if downstream code requires an array: squeeze with a specific axis.",
            },
          ],
          related: [
            { name: "np.expand_dims", relation: "The exact inverse operation — inserts length-1 axes instead of removing them." },
            { name: "np.atleast_1d", relation: "A floor, not a broom: guarantees a minimum ndim while squeezing guarantees the opposite direction." },
            { name: "ndarray.reshape", relation: "Can also drop axes implicitly via -1, but re-groups values too — squeeze only deletes trivial axes." },
            { name: "np.stack", relation: "The usual SOURCE of the length-1 axes you now want gone (batch of one, frame of one)." },
          ],
          applications: [
            "Cleaning model outputs: predictions shaped (1, 10) or (1, 1) down to (10,) and scalars",
            "Normalizing API inputs that may arrive as (5,), (1, 5) or (5, 1) from different callers",
            "Removing a batch-of-one axis after processing a single sample",
          ],
          notes:
            "Because named-axis squeeze validates that the axis has length exactly 1, it doubles as a cheap assertion in library code — it documents AND checks your shape expectations in one call.",
        },
        {
          kind: "tryIt",
          title: "The trinity playground",
          task: "Run, then read each shape aloud as a sentence ('a column of three rows of one'). Then: (1) predict and check what np.squeeze(row) gives; (2) change the outer product to SUBTRACTION and predict every cell; (3) add np.atleast_3d(v) and print its shape.",
          code: `import numpy as np

v = np.array([2, 4, 6])

print("vector  :", v.shape)
print("row     :", np.expand_dims(v, 0).shape)
print("column  :", np.expand_dims(v, 1).shape)
print("squeezed:", np.squeeze(np.array([[3, 1, 4]])).shape)

outer = v[:, None] * v[None, :]
print("column * row =")
print(outer)
`,
          hint: "For (1): a (1, 3) row squeezes to the plain (3,) vector. For (2): every cell is vi - vj, so the diagonal becomes all zeros.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "transpose reorders axes (a view, always); moveaxis moves the ones you name; swapaxes trades exactly two. expand_dims adds a length-1 slot, squeeze sweeps them away. Vector (3,), row (1, 3), column (3, 1): same numbers, three strangers — and broadcasting (Part G) treats them very differently.",
        },
      ],
      terms: [
        { term: "Axis permutation", definition: "The axes argument of np.transpose: a tuple naming which ORIGINAL axis lands in each NEW position — (1, 0, 2) swaps the first two axes." },
        { term: "Shape trinity", definition: "The three shapes of one sequence of values: (n,) a vector, (1, n) a row, (n, 1) a column. Operations — especially broadcasting — treat them as different arrays." },
        { term: "np.newaxis / None-indexing", definition: "v[None, :] and v[:, None] insert length-1 axes at that bracket position — the idiom form of expand_dims." },
        { term: "Length-1 axis", definition: "An axis holding exactly one position: free to add (expand_dims), free to remove (squeeze), and stretchable by broadcasting." },
        { term: "Channels conversion", definition: "moveaxis between image conventions: (3, H, W) channels-first and (H, W, 3) channels-last." },
      ],
      mistakes: [
        {
          mistake: "Treating v.T as a way to turn a vector into a column.",
          why: "A 1-D array has one axis; reversing one axis changes nothing. v.T IS v, shape (3,) — no brackets, no column.",
          fix: "To become a column: v[:, None] (or np.expand_dims(v, 1)). Transpose only reorders axes that exist; a vector has exactly one.",
        },
        {
          mistake: "Reading np.transpose(a, (1, 0, 2)) as 'make the shape (1, 0, 2)' or as new-axis order.",
          why: "The tuple names OLD axes in NEW order: new axis 0 is the old axis 1. Reading it as anything else produces confidently wrong shapes.",
          fix: "Translate aloud: 'new first axis: the old second one.' Then verify by printing .shape until the reading is reflexive.",
        },
        {
          mistake: "Squeeze-without-axis deleting an axis a later operation needed.",
          why: "axis=None sweeps away EVERY length-1 axis, including ones you inserted on purpose for broadcasting alignment.",
          fix: "Name the axis you want gone. The named form also errors if that axis is not length 1 — a free assertion on your shape assumptions.",
        },
        {
          mistake: "Confusing expand_dims (decorate one array) with stack (combine several).",
          why: "Both 'add an axis', but expand_dims adds an empty length-1 slot to a single array, while np.stack builds a new axis whose length equals the number of arrays you pass.",
          fix: "Ask 'am I decorating or combining?' One array, new slot: expand_dims. Many arrays, one new which-input axis: stack (next lesson).",
        },
      ],
      takeaways: [
        "np.transpose(a, (1, 0, 2)) names OLD axes in NEW order; no axes given reverses all axes. Every axis-reorder here is a view — writes flow through.",
        "moveaxis relocates named axes and lets the rest keep order; swapaxes exchanges exactly two — the surgical pair for N-D work like (3, H, W) to (H, W, 3).",
        "The shape trinity — (3,) vector, (1, 3) row, (3, 1) column — holds the same values but behaves differently in operations; v[:, None] and v[None, :] build the latter two.",
        "A taste of Part G: v[:, None] + w[None, :] computes every pairwise sum in one expression — length-1 axes are broadcasting's stretchable slots.",
        "squeeze removes length-1 axes (name the axis to keep the rest safe); atleast_1d/2d/3d guarantee minimums at API boundaries.",
      ],
      quiz: [
        {
          id: "c-04-q1",
          prompt: "`cube` has shape (2, 3, 4). What is the shape of `np.transpose(cube, (2, 0, 1))`?",
          options: [
            { text: "(2, 3, 4) — the axes tuple is just a label", correct: false, feedback: "The tuple is a real reordering instruction: it says old axis 2 goes first, old axis 0 second, old axis 1 third." },
            { text: "(4, 2, 3) — old axis 2 first, old axis 0 second, old axis 1 third", correct: true, feedback: "Correct: (2, 3, 4) re-ordered as (old 2, old 0, old 1) gives lengths (4, 2, 3)." },
            { text: "(3, 4, 2) — the tuple is rotated", correct: false, feedback: "(3, 4, 2) would be the permutation (1, 2, 0). Ours is (2, 0, 1): old-2, old-0, old-1." },
            { text: "It raises, because 2 is out of range for a 3-D array", correct: false, feedback: "Axis numbers run 0..2 here, so 2 is the last axis — perfectly legal in a permutation." },
          ],
          explanation: "The axes tuple lists OLD axes in NEW order: (2, 0, 1) brings the old last axis (length 4) to the front, then old axis 0 (length 2), then old axis 1 (length 3).",
        },
        {
          id: "c-04-q2",
          prompt: "You need the (3, 96, 64) channels-first image `rgb` as (96, 64, 3) for matplotlib. Which call is the clean surgical one?",
          options: [
            { text: "np.moveaxis(rgb, 0, -1)", correct: true, feedback: "Correct: lift the channel axis (position 0) and drop it at the end; rows and columns keep their order." },
            { text: "np.transpose(rgb)", correct: false, feedback: "This works but reverses ALL axes to (64, 96, 3) — height and width swapped. Only accidental luck makes a full reverse right." },
            { text: "np.expand_dims(rgb, -1)", correct: false, feedback: "That APPENDS a new length-1 axis: (3, 96, 64, 1) — one axis too many, and the channels are still first." },
            { text: "rgb.reshape(96, 64, 3)", correct: false, feedback: "Reshape re-groups values by walking order, not by moving axes — the result would be a scrambled picture, not a converted one." },
          ],
          explanation: "moveaxis names the axis to relocate and keeps every other axis in order — exactly what convention conversion needs.",
        },
        {
          id: "c-04-q3",
          prompt: "`v = np.array([1, 2, 3])`. Which expression gives shape (3, 1)?",
          options: [
            { text: "v.T", correct: false, feedback: "A 1-D transpose is the identity: one axis reversed is still one axis — shape stays (3,)." },
            { text: "v[None, :]", correct: false, feedback: "None FIRST inserts a length-1 axis at the front: (1, 3) — a row, not a column." },
            { text: "v[:, None]", correct: true, feedback: "Correct: None second inserts the length-1 axis at the end — three rows of one, the column." },
            { text: "np.squeeze(v)", correct: false, feedback: "v has no length-1 axes to remove — it comes back unchanged, still (3,)." },
          ],
          explanation: "The bracket position of None is the position of the new length-1 axis: v[:, None] gives (3, 1), v[None, :] gives (1, 3).",
        },
      ],
    },

    // ------------------------------------------------------------- c-05
    {
      slug: "c-05",
      title: "Stacking, Splitting, Tiling and Repeating",
      minutes: 18,
      summary:
        "The join-and-cut toolkit promised in the part header: concatenate vs stack (the confusion pair), the vstack/hstack family and its 1-D surprises, splitting equal or uneven, tile vs repeat (the other confusion pair), and the honest price of delete, insert and append.",
      kind: "concept",
      objectives: [
        "Join arrays with np.concatenate along any existing axis and predict the result's shape before running it",
        "Choose correctly between np.concatenate (walks an existing axis) and np.stack (creates a brand-new axis)",
        "Use the vstack / hstack / dstack / column_stack family, including their 1-D promotion surprises",
        "Cut arrays apart with np.split, np.array_split, hsplit and vsplit — equal chunks, explicit boundaries or uneven tolerated",
        "Distinguish np.tile (copies of the whole pattern) from np.repeat (echoes each element), and use delete/insert/append knowing they always copy",
      ],
      why: "Real data almost never arrives as one tidy array: sensors report week by week, quarters land as separate files, images come as color panels, batches accumulate sample by sample. Every pipeline sooner or later must join pieces into one array and cut one array back into pieces — and two pairs of functions cause most of the confusion: concatenate (walks an existing axis) vs stack (creates a new one), and tile (photocopies the whole pattern) vs repeat (echoes each element in place). This lesson makes all four behaviors visible with shapes you can predict, adds the splitting family for the cutting half, and ends with the honest accounting for delete, insert and append: they always copy, and there are cheaper routes.",
      blocks: [
        {
          kind: "text",
          text: "You can now reshape, flatten, transpose and reorder axes — moving numbers without moving them. This closing lesson is the other half of restructuring: data that arrives in PIECES must become one array, and arrays that grew too big must be cut back into pieces. The operations split into two mirror families. **Joining** glues several arrays into one; **cutting** slices one array into several. And within joining lives the most productive confusion in all of NumPy — `np.concatenate` vs `np.stack` — plus its echo twin in the copy family, `np.tile` vs `np.repeat`. Learn the two distinctions once and half of your future shape bugs never happen.",
        },
        {
          kind: "visual",
          title: "The join-and-cut map for this lesson",
          ascii: `  JOIN (many arrays -> one)              CUT (one array -> many)

  a = [1 2 3]      b = [4 5 6]

  concatenate: walk an axis         split: equal chunks only,
    that ALREADY exists                  or it raises
    [1 2 3 4 5 6]
                                   array_split: uneven sizes
  stack: create a NEW axis             tolerated (5 4 4)
    [[1 2 3]
     [4 5 6]]                      hsplit / vsplit: the same
      which-input axis                   cuts, axis-named
  tile:    [1 2 3 1 2 3]  the pattern
  repeat:  [1 1 2 2 3 3]  each value   delete / insert / append:
                                     editing by position --
                                     convenient, but every
                                     call copies the block
`,
          caption:
            "Every function here answers one question. Joins: 'do I lengthen an existing axis, or add a new one?' Cuts: 'do my sizes divide evenly, or do I need tolerance?' Copies: 'do I repeat the pattern, or each value?'",
        },
        {
          kind: "heading",
          text: "np.concatenate: glue along an existing axis",
        },
        {
          kind: "text",
          text: "`np.concatenate` takes a sequence of arrays and walks them into one array **along an axis that already exists in every input**. The rule is strict and easy to check: all inputs must have the same shape *except* along the chosen axis, where their lengths simply add. For 2-D tables that means axis=0 stacks rows on top of rows, and axis=1 widens the table sideways. For 1-D arrays there is only one axis — so concatenate just glues, and the axis argument has nothing to choose.",
        },
        {
          kind: "code",
          title: "Two 2-D tables, joined two ways",
          code: `import numpy as np

north = np.array([[10, 20], [30, 40]])
south = np.array([[50, 60], [70, 80]])

rows = np.concatenate((north, south), axis=0)
cols = np.concatenate((north, south), axis=1)

print("axis=0 glue rows, shape", rows.shape)
print(rows)
print("axis=1 glue columns, shape", cols.shape)
print(cols)

a = np.array([1, 2, 3])
b = np.array([4, 5])
print("1-D, axis ignored:", np.concatenate((a, b)))
`,
          output: `axis=0 glue rows, shape (4, 2)
[[10 20]
 [30 40]
 [50 60]
 [70 80]]
axis=1 glue columns, shape (2, 4)
[[10 20 50 60]
 [30 40 70 80]]
1-D, axis ignored: [1 2 3 4 5]`,
          outputNote:
            "axis=0 made a (4, 2) table — the rows of south landed under the rows of north. axis=1 made a (2, 4) table — columns were appended sideways. And the 1-D pair just became a longer 1-D array, exactly as the one-axis rule says.",
          explain: [
            "`axis=0` — the inputs (2, 2) and (2, 2) share their axis-1 length (2), so their axis-0 lengths add: 2 + 2 = 4 rows.",
            "`axis=1` — same inputs, walked the other way: shared rows, and the axis-1 lengths add to 4 columns.",
            "The 1-D case is the surprise for newcomers: no rows appear, no grid appears — a (3,) and a (2,) concatenate to a (5,). If you wanted a 2-D result from 1-D inputs, that is the next function's job.",
          ],
        },
        {
          kind: "code",
          title: "The mismatch error, read carefully",
          code: `import numpy as np

np.concatenate((np.zeros((2, 3)), np.zeros((2, 5))), axis=0)
`,
          expectError:
            "ValueError: all the input array dimensions except for the concatenation axis must match exactly, but along dimension 1, the array at index 0 has size 3 and the array at index 1 has size 5",
          outputNote:
            "Gluing along axis=0 requires the columns to match — 3 versus 5 do not. The error names the offending dimension, the array index, and both sizes: everything you need to fix it without guessing.",
        },
        {
          kind: "functionDoc",
          name: "np.concatenate",
          purpose: "Glue a sequence of arrays into one, along an axis that already exists in every input.",
          signature:
            'np.concatenate((a1, a2, ...), axis=0, out=None, dtype=None, casting="same_kind")',
          purposeDetail:
            "concatenate is the general-purpose joiner: it takes any number of arrays that share a shape everywhere EXCEPT along one axis, and returns a single array in which each input occupies a run of positions along that axis. Unlike np.stack (its constant confusion partner), it never creates a dimension — the axis it walks must already exist, which is why concatenating two 1-D arrays simply glues them into a longer 1-D array. It always copies the data into a fresh block: the result shares memory with none of the inputs.",
          params: [
            {
              name: "(a1, a2, ...)",
              type: "sequence of array_like",
              required: true,
              description:
                "The arrays to join, passed as ONE tuple or list. All must have the same shape except along the concatenation axis — that is the double parenthesis you see in every call.",
              example: "(a, b) or [m1, m2, m3]",
            },
            {
              name: "axis",
              type: "int or None",
              description:
                "The EXISTING axis along which the inputs are joined. axis=0 places them front-to-back (rows for 2-D), axis=1 side-by-side. axis=None flattens every input first — rarely what you want.",
              example: "0, 1 or -1",
            },
            {
              name: "dtype",
              type: "dtype",
              description:
                "Force the output's element type. By default the result follows NumPy's promotion of all the inputs (ints joined with floats give float64).",
              example: "dtype=np.float64",
            },
          ],
          returns: {
            type: "ndarray",
            description:
              "One fresh array: same ndim as the inputs, with the concatenation axis length equal to the sum of the pieces' lengths along it. A copy — it shares memory with no input.",
          },
          example: `import numpy as np

q1 = np.array([[10, 20], [30, 40]])
q2 = np.array([[50, 60], [70, 80]])

print(np.concatenate((q1, q2)).shape)
print(np.concatenate((q1, q2), axis=1).shape)

a = np.array([1, 2, 3])
b = np.array([4, 5])
print(np.concatenate((a, b)))
`,
          exampleOutput: `(4, 2)
(2, 4)
[1 2 3 4 5]`,
          commonMistakes: [
            {
              mistake: "Calling concatenate where stack was meant, and wondering where the new axis went.",
              why: "Two (3,) arrays concatenated give a (6,) strip — concatenate walks an axis that already exists and never adds one.",
              fix: "Ask 'am I lengthening an axis, or adding one?' Adding a which-input axis is np.stack's job (next card).",
            },
            {
              mistake: "Joining arrays whose non-axis shapes do not match.",
              why: "Every dimension except the concatenation axis must match exactly; NumPy raises a ValueError naming the mismatched dimension and both sizes.",
              fix: "Print .shape of every input before joining. If a piece is off by one row or column, reshape or slice it first — the error tells you which dimension to check.",
            },
            {
              mistake: "Forgetting the inner parentheses: np.concatenate(a, b).",
              why: "The first argument is a SEQUENCE of arrays; passing two positional arguments makes NumPy read b as the axis, producing 'TypeError: only integer scalar arrays can be converted to a scalar index'.",
              fix: "Always the double parenthesis: np.concatenate((a, b)) — or pass a list you already have.",
            },
          ],
          related: [
            { name: "np.stack", relation: "The confusion partner: creates a NEW axis (one more ndim) instead of walking an existing one." },
            { name: "np.vstack / np.hstack", relation: "Convenience spellings of concatenate with a fixed axis — with 1-D promotion magic (below)." },
            { name: "np.array_split", relation: "The inverse operation: cuts one array into a list of pieces, uneven tolerated." },
            { name: "np.append", relation: "The two-array convenience alias — but it FLATTENS by default, unlike concatenate." },
          ],
          applications: [
            "Appending each new time period to a running history array",
            "Joining per-sensor columns into one wide readings table",
            "Assembling a batch from per-sample arrays of the same feature shape",
          ],
          notes:
            "concatenate always allocates a fresh block and copies — joining n pieces is one O(total) pass. If you find yourself calling it inside a loop to grow an array one piece at a time, collect the pieces in a list and join ONCE at the end (the same rule Part A gave for np.append).",
        },
        {
          kind: "heading",
          text: "np.stack: a brand-new axis (the confusion pair)",
        },
        {
          kind: "text",
          text: "Here is the distinction worth saying out loud: **`np.concatenate` walks an axis that already exists; `np.stack` creates an axis that did not exist.** `stack` takes several arrays of exactly the same shape and returns one array with **one more dimension**, whose new axis records *which input* each slice came from. Stack two (3,) vectors and you get a (2, 3) grid — the vectors became rows of a brand-new axis 0. Concatenate the same two and you get a (6,) strip. Same inputs, completely different geometry:",
        },
        {
          kind: "code",
          title: "The confusion pair on identical inputs",
          code: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print("concatenate:", np.concatenate((a, b)), "  shape:", np.concatenate((a, b)).shape)
print("stack, axis=0 (rows):")
print(np.stack((a, b)))
print("stack, axis=1 (columns):")
print(np.stack((a, b), axis=1))
`,
          output: `concatenate: [1 2 3 4 5 6]   shape: (6,)
stack, axis=0 (rows):
[[1 2 3]
 [4 5 6]]
stack, axis=1 (columns):
[[1 4]
 [2 5]
 [3 6]]`,
          outputNote:
            "concatenate lengthened the one existing axis to (6,). stack built a (2, 3) grid — axis 0 is brand new and says which input — and with axis=1 it built the (3, 2) grid instead, pairing a's and b's values element-wise.",
          explain: [
            "`np.stack((a, b))` — the result has one more dimension than the inputs. Its new axis 0 has one position per input: row 0 is a, row 1 is b.",
            "`np.stack((a, b), axis=1)` — the same new axis, inserted at position 1 instead: [1, 4] is Monday's pair, [2, 5] Tuesday's, [3, 6] Wednesday's. The axis argument says WHERE the new axis lands, not which old axis to walk.",
            "That is the whole confusion pair in one block: concatenate answers 'make this axis longer'; stack answers 'make a new axis saying which input'.",
          ],
        },
        {
          kind: "code",
          title: "The pair proven on 2-D inputs (predict, then run)",
          code: `import numpy as np

m1 = np.zeros((2, 3), dtype=int)
m2 = np.ones((2, 3), dtype=int)

print("concatenate axis=0 :", np.concatenate((m1, m2), axis=0).shape)
print("concatenate axis=1 :", np.concatenate((m1, m2), axis=1).shape)
print("stack              :", np.stack((m1, m2)).shape)
print("stack axis=1       :", np.stack((m1, m2), axis=1).shape)
print("stack axis=2       :", np.stack((m1, m2), axis=2).shape)
`,
          output: `concatenate axis=0 : (4, 3)
concatenate axis=1 : (2, 6)
stack              : (2, 2, 3)
stack axis=1       : (2, 2, 3)
stack axis=2       : (2, 3, 2)`,
          outputNote:
            "(4, 3) and (2, 6) stay 2-D — concatenate only lengthens an existing axis. Every stack result is 3-D: (2, 2, 3), (2, 2, 3) again (new axis in the middle), and (2, 3, 2) (new axis at the end). The inputs' shape survives intact inside each result.",
          explain: [
            "Both concatenate calls keep ndim at 2 — you cannot stack panels with concatenate, only taller or wider tables.",
            "`np.stack((m1, m2))` gives (2, 2, 3): two grids, each 2x3, behind a new axis 0. The classic 'many frames become one video' move.",
            "`axis=1` and `axis=2` move where the which-input axis lands — the 2x3 grid shape stays visible in each result, at a different position.",
          ],
        },
        {
          kind: "table",
          title: "The confusion pair, one table",
          headers: ["You have", "You want", "Call", "Result shape"],
          rows: [
            ["Two (3,) vectors", "One longer line", "`np.concatenate((a, b))`", "`(6,)` — axis 0 lengthened"],
            ["Two (3,) vectors", "A 2x3 grid, one row per input", "`np.stack((a, b))`", "`(2, 3)` — new axis 0"],
            ["Two (3,) vectors", "A 3x2 grid of pairs", "`np.stack((a, b), axis=1)`", "`(3, 2)` — new axis 1"],
            ["Two (2, 3) grids", "One 4x3 table", "`np.concatenate((m, n), axis=0)`", "`(4, 3)` — still 2-D"],
            ["Two (2, 3) grids", "One 2x6 table", "`np.concatenate((m, n), axis=1)`", "`(2, 6)` — still 2-D"],
            ["Two (2, 3) grids", "A block of two grids", "`np.stack((m, n))`", "`(2, 2, 3)` — new axis 0"],
          ],
          caption:
            "One question separates them every time: 'am I lengthening an axis that exists, or adding an axis that records which input?' If you can say the sentence, you can name the function.",
        },
        {
          kind: "functionDoc",
          name: "np.stack",
          purpose: "Combine several same-shaped arrays along a brand-NEW axis whose length is the number of inputs.",
          signature: 'np.stack(arrays, axis=0, out=None, *, dtype=None, casting="same_kind")',
          purposeDetail:
            "stack is how separate same-shaped arrays become panels of one array: a list of ten (3, 4) grids becomes one (10, 3, 4) block. The crucial difference from concatenate: stack CREATES an axis (the result has ndim+1) whose length equals the number of inputs, while concatenate walks an axis that already exists and keeps ndim unchanged. The price of that new axis is strictness — every input must match in shape exactly, because there is no 'glue the long bits' tolerance when the inputs become slices. Use it for batches, frames, and any 'many same-shaped things become one thing' moment.",
          params: [
            {
              name: "arrays",
              type: "sequence of array_like",
              required: true,
              description:
                "The arrays to combine. Every one must have EXACTLY the same shape — unlike concatenate, which tolerates different lengths along the join axis.",
              example: "(a, b) or list_of_frames",
            },
            {
              name: "axis",
              type: "int",
              description:
                "Where the new axis lands in the RESULT's shape (not an axis of the inputs): axis=0 makes each input a panel of an (n, ...) result; axis=-1 makes each input a slice of the last axis.",
              example: "0, 1 or -1",
            },
            {
              name: "dtype",
              type: "dtype",
              description:
                "Force the output's element type; by default it follows promotion of all inputs.",
              example: "dtype=np.float32",
            },
          ],
          returns: {
            type: "ndarray",
            description:
              "One array with ndim+1 dimensions: the inputs' common shape with a new length-n axis inserted at position axis. A fresh copy — no memory is shared with the inputs.",
          },
          example: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(np.stack((a, b)))
print(np.stack((a, b), axis=1))

m1 = np.zeros((2, 3), dtype=int)
m2 = np.ones((2, 3), dtype=int)
print(np.stack((m1, m2)).shape)
`,
          exampleOutput: `[[1 2 3]
 [4 5 6]]
[[1 4]
 [2 5]
 [3 6]]
(2, 2, 3)`,
          commonMistakes: [
            {
              mistake: "Using stack when the goal was simply a longer array or a taller table.",
              why: "stack always adds a dimension: two (3,) vectors stack to (2, 3), and two (2, 3) grids stack to (2, 2, 3) — never (6,) or (4, 3).",
              fix: "For lengthening an existing axis, concatenate. Reserve stack for when a new which-input axis is genuinely wanted.",
            },
            {
              mistake: "Stacking arrays whose shapes differ, even by one element.",
              why: "stack's inputs become slices of one array, so they must match exactly — NumPy raises 'ValueError: all input arrays must have the same shape'.",
              fix: "Pad, trim or reshape to identical shapes first. If the pieces legitimately differ in length, they cannot be slices: concatenate along the tolerant axis instead.",
            },
            {
              mistake: "Reading stack's axis as an axis of the inputs.",
              why: "In stack, axis is the position of the NEW axis in the result. np.stack((a, b), axis=1) on (3,) vectors gives (3, 2) — it did not walk an input axis.",
              fix: "Predict with the insertion rule: take the input shape and insert a length-n entry at position axis. That tuple is the result's shape.",
            },
          ],
          related: [
            { name: "np.concatenate", relation: "The confusion partner: walks an EXISTING axis and keeps ndim unchanged." },
            { name: "np.vstack / np.column_stack", relation: "Convenience cases of stacking with 1-D promotion built in (below)." },
            { name: "np.expand_dims", relation: "Adds the same kind of new length-1 axis to ONE array — stack is its multi-array version." },
            { name: "np.array_split", relation: "Cuts the which-input axis back apart — the inverse operation." },
          ],
          applications: [
            "Building a batch dimension: n samples of shape (features,) become (n, features)",
            "Assembling per-frame images into a video array (T, H, W)",
            "Keeping model runs comparable: k runs of the same shape become (k, ...) for per-run slicing",
          ],
          notes:
            "np.stack((a, b), axis=0) is exactly 'expand_dims each input at axis 0, then concatenate along axis 0' — one new axis, n same-shaped tenants. Remember it as: stack = new axis, inputs become slices.",
        },
        {
          kind: "heading",
          text: "The convenience family: vstack, hstack, dstack, column_stack",
        },
        {
          kind: "text",
          text: "Four pre-packed spellings of the two joiners, named for directions: **vstack** glues vertically (axis 0), **hstack** glues horizontally (axis 1), **dstack** glues along a new depth axis (axis 2), and **column_stack** turns 1-D inputs into columns of a 2-D table. On 2-D inputs they behave exactly like concatenate with a fixed axis. The famous surprises are all in how they treat **1-D inputs**, which get promoted first: hstack on 1-D arrays is plain concatenation, vstack on 1-D arrays makes each one a ROW, and column_stack makes each one a COLUMN. Prove all three to yourself:",
        },
        {
          kind: "code",
          title: "The 1-D surprises, all four functions",
          code: `import numpy as np

x = np.array([1, 2, 3])
y = np.array([4, 5, 6])

print("hstack      :", np.hstack((x, y)))
print("vstack      :")
print(np.vstack((x, y)))
print("column_stack:")
print(np.column_stack((x, y)))
print("dstack shape:", np.dstack((x, y)).shape)
`,
          output: `hstack      : [1 2 3 4 5 6]
vstack      :
[[1 2 3]
 [4 5 6]]
column_stack:
[[1 4]
 [2 5]
 [3 6]]
dstack shape: (1, 3, 2)`,
          outputNote:
            "hstack glued (6,). vstack made a (2, 3) grid — each vector became a row. column_stack made the (3, 2) grid — each vector became a column. dstack quietly made a (1, 3, 2) block: a new depth axis behind a promoted row axis.",
          explain: [
            "`hstack((x, y))` is concatenate along the last axis — for 1-D inputs the last axis is the only axis, so it just glues.",
            "`vstack((x, y))` first promotes each 1-D input to a (1, 3) row (the atleast_2d rule from Lesson c-04), then glues along axis 0: a (2, 3) table.",
            "`column_stack((x, y))` is the one to memorize for tabular data: 1-D inputs become columns, so the result reads as 'rows are days, columns are sensors'.",
            "`dstack` adds its new depth axis at the END — handy for (H, W, 3)-style image work, surprising everywhere else.",
          ],
        },
        {
          kind: "code",
          title: "On 2-D inputs the family is just concatenate",
          code: `import numpy as np

m = np.arange(6).reshape(2, 3)
n = m + 10

print("vstack == concatenate axis=0:", np.array_equal(np.vstack((m, n)), np.concatenate((m, n), axis=0)))
print("hstack == concatenate axis=1:", np.array_equal(np.hstack((m, n)), np.concatenate((m, n), axis=1)))
print("shapes:", np.vstack((m, n)).shape, np.hstack((m, n)).shape)
`,
          output: `vstack == concatenate axis=0: True
hstack == concatenate axis=1: True
shapes: (4, 3) (2, 6)`,
          outputNote:
            "True, True — on 2-D inputs vstack and hstack are concatenate with a fixed axis. All the folklore about them being different functions is really folklore about their 1-D promotion rules.",
          explain: [
            "Once the inputs are 2-D there is no promotion to do, and the names reduce to axes: v = axis 0, h = axis 1.",
            "Reading code intent: vstack((m, n)) says 'more rows' out loud; np.concatenate((m, n), axis=0) says it in axis numbers. Pick the one your team reads more easily — behavior is identical.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The stack explorer — a new axis, born",
          mode: "explore",
          name: "paired",
          caption:
            "np.stack((x, y), axis=1) built this (3, 2) grid from the two 1-D arrays x = [1, 2, 3] and y = [4, 5, 6]: the NEW axis 1 records WHICH input each value came from. Click cells and watch the column index say 0 or 1 — input identity, not a position inside either source. The rows, by contrast, are positions both inputs shared.",
          data: [
            [1, 4],
            [2, 5],
            [3, 6],
          ],
          labels: {
            rows: ["Mon", "Tue", "Wed"],
            cols: ["x (input 1)", "y (input 2)"],
          },
          dtype: "int64",
        },
        {
          kind: "arrayViz",
          title: "The slice explorer — what column_stack joined, slicing cuts apart",
          mode: "slice",
          name: "grid",
          caption:
            "This (4, 3) grid is np.column_stack((sensor_a, sensor_b, sensor_c)) — each column is one original 1-D array. Step through the selections: a whole column recovers a sensor exactly as it went in, a row is one day's readings across all three sensors, and the strided selection walks every other day. Joining and cutting are inverse operations on the same axes (the slicing grammar itself is Part D).",
          data: [
            [1, 10, 100],
            [2, 20, 200],
            [3, 30, 300],
            [4, 40, 400],
          ],
          selections: [
            {
              expr: "grid[:, 0]",
              cells: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
              ],
              note: "sensor A, whole and intact — the exact 1-D array that went in",
            },
            {
              expr: "grid[2, :]",
              cells: [
                [2, 0],
                [2, 1],
                [2, 2],
              ],
              note: "one day's readings across all three sensors",
            },
            {
              expr: "grid[:2, 1:]",
              cells: [
                [0, 1],
                [0, 2],
                [1, 1],
                [1, 2],
              ],
              note: "the first two days, sensors B and C only",
            },
            {
              expr: "grid[::2, 1]",
              cells: [
                [0, 1],
                [2, 1],
              ],
              note: "every other day, sensor B — joining did not lock the layout",
            },
          ],
        },
        {
          kind: "heading",
          text: "Cutting back apart: np.split, np.array_split, hsplit, vsplit",
        },
        {
          kind: "text",
          text: "Cutting is joining run backwards. `np.split(a, n)` returns a **Python list** of n pieces of equal size along the axis you name; give it a list of indexes instead and it cuts **before** each listed position. The discipline is strict — n must divide the axis evenly, or split raises. Its forgiving sibling `np.array_split` tolerates ragged divisions, making the first few pieces one longer. `np.hsplit` and `np.vsplit` are the axis-named spellings, mirroring hstack and vstack.",
        },
        {
          kind: "code",
          title: "Equal chunks, then cuts at explicit boundaries",
          code: `import numpy as np

year = np.arange(1, 13)          # months 1..12

for i, quarter in enumerate(np.split(year, 4)):
    print(f"Q{i + 1}:", quarter)

trimesters = np.split(year, [2, 7])   # cut BEFORE index 2 and BEFORE index 7
for i, t in enumerate(trimesters):
    print(f"cut {i}:", t)
`,
          output: `Q1: [1 2 3]
Q2: [4 5 6]
Q3: [7 8 9]
Q4: [10 11 12]
cut 0: [1 2]
cut 1: [3 4 5 6 7]
cut 2: [ 8  9 10 11 12]`,
          outputNote:
            "Four equal quarters of 3. Then the explicit form: cutting before indexes 2 and 7 yields three pieces of lengths 2, 5 and 5 — the first two months, then two runs of five. Cut positions are exclusive boundaries: element at index 2 opens the second piece.",
          explain: [
            "`np.split(year, 4)` — 12 divides by 4, so four (3,) pieces, returned as a list you can unpack or loop over.",
            "`np.split(year, [2, 7])` — a boundary list cuts before each index: pieces are year[:2], year[2:7], year[7:]. k boundaries always give k+1 pieces.",
            "The pieces are views of the original (splitting is free) — writing through a piece writes the parent, exactly like the slicing it is built on (Part D).",
          ],
        },
        {
          kind: "code",
          title: "When split refuses: the equal-division error",
          code: `import numpy as np

ten = np.arange(1, 11)    # 10 months
np.split(ten, 3)          # 10 is not divisible by 3
`,
          expectError: "ValueError: array split does not result in an equal division",
          outputNote:
            "split demands pieces of identical size and refuses to choose among 4-3-3, 3-4-3 or 3-3-4. That refusal is a feature: silent unequal cuts in a reporting pipeline are worse than a loud error. The next call is the tolerant one.",
        },
        {
          kind: "code",
          title: "array_split: uneven tolerated, first pieces longer",
          code: `import numpy as np

months = np.arange(1, 11)          # 10 months, 3 reporting periods

for i, chunk in enumerate(np.array_split(months, 3)):
    print(f"chunk {i}: shape {chunk.shape}  {chunk}")
`,
          output: `chunk 0: shape (4,)  [1 2 3 4]
chunk 1: shape (3,)  [5 6 7]
chunk 2: shape (3,)  [ 8  9 10]`,
          outputNote:
            "Sizes 4, 3, 3: the first 10 % 3 = 1 pieces get 10 // 3 + 1 = 4 elements, the rest get 3. Uneven calendars, 13-week quarters, leftover batches — array_split is the tool that never raises over arithmetic.",
          explain: [
            "The rule: for length l cut into n pieces, the first l % n pieces have l // n + 1 elements, the rest l // n. Deterministic, documented, and easy to read out of the shapes.",
            "Thirteen weeks into three months is exactly this case: 5, 4, 4 — the closing project builds its months this way.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.array_split",
          purpose: "Cut one array into several pieces along an axis, tolerating counts that do not divide evenly.",
          signature: "np.array_split(ary, indices_or_sections, axis=0)",
          purposeDetail:
            "array_split is split's forgiving sibling. Given a count n, it returns n pieces whose lengths differ by at most one: the first l % n pieces get l // n + 1 elements, the rest get l // n. Given a list of indexes instead, it cuts before each listed index — the same convention as np.split. When the count divides evenly the two functions agree exactly; when it does not, np.split raises and array_split delivers 5-4-4-style calendars. The result is a plain Python list of views, so writes flow through to the parent.",
          params: [
            {
              name: "ary",
              type: "array_like",
              required: true,
              description: "The array to cut. Never modified — the pieces are views onto it.",
              example: "quarter or year",
            },
            {
              name: "indices_or_sections",
              type: "int or sequence of ints",
              required: true,
              description:
                "An int n means 'n roughly equal pieces'. A sequence of indexes means 'cut before each of these positions along the axis'. The two meanings are easy to confuse — an int counts pieces, a list names boundaries.",
              example: "3 or [2, 7]",
            },
            {
              name: "axis",
              type: "int",
              description:
                "The axis along which to cut. Default 0 (rows for 2-D); hsplit/vsplit are this argument pre-filled.",
              example: "0, 1 or -1",
            },
          ],
          returns: {
            type: "list of ndarray",
            description:
              "A Python list of n sub-arrays (for an int) or len+1 sub-arrays (for a boundary list). Each piece is a VIEW of ary — writes reach the original.",
          },
          example: `import numpy as np

months = np.arange(1, 11)              # 10 values, 3 periods

for chunk in np.array_split(months, 3):
    print(chunk.shape, chunk)

print(np.array_split(months, [3, 5]))
`,
          exampleOutput: `(4,) [1 2 3 4]
(3,) [5 6 7]
(3,) [ 8  9 10]
[array([1, 2, 3]), array([4, 5]), array([ 6,  7,  8,  9, 10])]`,
          commonMistakes: [
            {
              mistake: "Assuming the pieces come out equal.",
              why: "With uneven input, the FIRST pieces are the longer ones: 10 into 3 gives sizes 4, 3, 3 — so period 0 silently covers more time than the others.",
              fix: "Print the piece shapes right after splitting, or pass explicit boundary indexes when the cut points must be exact.",
            },
            {
              mistake: "Confusing the int meaning with the list meaning.",
              why: "array_split(a, 3) is THREE pieces; array_split(a, [3]) is TWO pieces cut before index 3. Same number, completely different instruction.",
              fix: "Say it aloud: int = HOW MANY pieces, list = WHERE to cut. If you can count your cut points, you want the list.",
            },
            {
              mistake: "Treating the pieces as independent arrays.",
              why: "The pieces are views: modifying months[0] modifies the parent's first chunk, and can surprise code that still holds the original.",
              fix: "Call .copy() on a piece when it must be independent — one word, full isolation (Lesson c-03's rule).",
            },
          ],
          related: [
            { name: "np.split", relation: "The strict version: equal chunks or a ValueError — sometimes the check you want." },
            { name: "np.hsplit / np.vsplit", relation: "Split and array_split with the axis pre-filled (columns / rows)." },
            { name: "np.concatenate", relation: "The inverse: glues a list of pieces (including a list split just gave you) back into one." },
          ],
          applications: [
            "Cutting a year of records into unequal calendar months or fiscal periods",
            "Dividing a dataset into k folds for cross-validation",
            "Chunking a long stream into windows for per-window statistics",
          ],
          notes:
            "The boundary-list form composes with np.cumsum for real calendars: np.cumsum of the piece lengths (dropping the last entry) is exactly the cut list that produces those lengths — the closing project's month cuts are built this way.",
        },
        {
          kind: "code",
          title: "hsplit and vsplit: the axis-named cuts",
          code: `import numpy as np

grid = np.arange(12).reshape(3, 4)

left, right = np.hsplit(grid, 2)
print("hsplit -> left:")
print(left)
print("hsplit -> right:")
print(right)

rows = np.vsplit(grid, 3)
print("vsplit -> three pieces, shapes:", [r.shape for r in rows])
`,
          output: `hsplit -> left:
[[0 1]
 [4 5]
 [8 9]]
hsplit -> right:
[[ 2  3]
 [ 6  7]
 [10 11]]
vsplit -> three pieces, shapes: [(1, 4), (1, 4), (1, 4)]`,
          outputNote:
            "hsplit cut the 4 columns into two (3, 2) halves; vsplit cut the 3 rows into three (1, 4) pieces. Mirrors of hstack and vstack, down to the same axis choices — and the pieces are views here too.",
          explain: [
            "`np.hsplit(grid, 2)` is array_split(grid, 2, axis=1) — the column axis. `np.vsplit(grid, 3)` is axis=0, the row axis.",
            "Unpacking (`left, right = ...`) works because these functions return a list whose length you know — handy when the count is small and named.",
          ],
        },
        {
          kind: "heading",
          text: "np.tile vs np.repeat: photocopies vs echoes",
        },
        {
          kind: "text",
          text: "The copy family has its own confusion pair. **`np.tile` lays down copies of the WHOLE pattern** — photocopies of the entire block, side by side. **`np.repeat` echoes each ELEMENT in place** — every value says itself, itself, itself. Give both the same `[1, 2, 3]` and ask for 2: tile produces `[1 2 3 1 2 3]`, repeat produces `[1 1 2 2 3 3]`. Neither is ever wrong; they answer different questions, and after this block you will never mix them up:",
        },
        {
          kind: "code",
          title: "The other confusion pair, 1-D side by side",
          code: `import numpy as np

v = np.array([1, 2, 3])

print("input  :", v)
print("tile  2:", np.tile(v, 2))     # the WHOLE pattern, again
print("repeat2:", np.repeat(v, 2))   # each element, twice in place
`,
          output: `input  : [1 2 3]
tile  2: [1 2 3 1 2 3]
repeat2: [1 1 2 2 3 3]`,
          outputNote:
            "tile re-laid the whole pattern: 1 2 3 then 1 2 3 again. repeat doubled each value where it stood: 1 1 2 2 3 3. Say the two results aloud once — 'pattern, pattern' versus 'echo, echo' — and the pair separates forever.",
          explain: [
            "tile answers 'I need this PATTERN n more times' — wallpaper, scale factors, checkerboards.",
            "repeat answers 'each VALUE counts n times' — expanding per-item counts into per-row records.",
            "Same input, same count, two different geometries: that is why this pair, like concatenate/stack, deserves a side-by-side demonstration rather than a definition.",
          ],
        },
        {
          kind: "code",
          title: "2-D inputs: tile wallpapers, repeat flattens",
          code: `import numpy as np

m = np.array([[1, 2],
              [3, 4]])

print("tile(m, 2):")
print(np.tile(m, 2))
print()
print("repeat(m, 2):       <- flattened by default!")
print(np.repeat(m, 2))
print()
print("repeat(m, 2, axis=1):")
print(np.repeat(m, 2, axis=1))
`,
          output: `tile(m, 2):
[[1 2 1 2]
 [3 4 3 4]]

repeat(m, 2):       <- flattened by default!
[1 1 2 2 3 3 4 4]

repeat(m, 2, axis=1):
[[1 1 2 2]
 [3 3 4 4]]`,
          outputNote:
            "tile tiled the whole 2x2 block twice along the columns. repeat with no axis FLATTENED the grid first and returned a flat (4,) echo line — the trap — while repeat with axis=1 kept the grid and doubled each value along the columns.",
          explain: [
            "`np.tile(m, 2)` on 2-D: the whole block is the pattern; the result is a (2, 4) wallpaper of two copies.",
            "`np.repeat(m, 2)` defaults to axis=None, which flattens the input — a classic silent shape change on 2-D data. Always name the axis when repeating grids.",
            "`np.repeat(m, 2, axis=1)`: every row keeps its identity; each value in it is doubled in place along the columns.",
          ],
        },
        {
          kind: "code",
          title: "repeat's superpower: a count per element",
          code: `import numpy as np

orders = np.array([1, 2, 3])
counts = np.array([3, 1, 2])

print(np.repeat(orders, counts))
`,
          output: `[1 1 1 2 3 3]`,
          outputNote:
            "[1 1 1 2 3 3]: item 1 appears three times, item 2 once, item 3 twice. tile cannot do this — uniform copies per axis is all it knows.",
          explain: [
            "`repeats` may be one number for everyone or an array with one count per element (broadcast to the axis shape, so the length must match).",
            "This is the workhorse for count-driven expansion: a table of item quantities becomes one row per physical item with a single call.",
          ],
        },
        {
          kind: "table",
          title: "tile vs repeat, side by side",
          headers: ["Question", "np.tile", "np.repeat"],
          rows: [
            ["What gets copied?", "The WHOLE pattern, intact", "Each ELEMENT, in place"],
            ["`x([1, 2, 3], 2)`", "`[1 2 3 1 2 3]`", "`[1 1 2 2 3 3]`"],
            ["On a 2-D grid", "Tiles rows and columns of the block", "Flattens by default — name an axis to keep the grid"],
            ["Per-element control?", "No — one copy count per axis", "Yes — repeats may be a per-element array"],
            ["Typical use", "Scale factors, checkerboards, test patterns", "Expanding per-item counts into per-row records"],
          ],
          caption:
            "One question separates them: 'do I want copies of the pattern, or echoes of the values?' tile photocopies; repeat echoes.",
        },
        {
          kind: "functionDoc",
          name: "np.tile",
          purpose: "Lay down whole copies of a pattern — the entire array repeats, intact, as many times as you ask.",
          signature: "np.tile(A, reps)",
          purposeDetail:
            "tile photocopies the ENTIRE array: np.tile([1, 2, 3], 2) is [1, 2, 3, 1, 2, 3] — the whole block again, then again. With a tuple of reps it tiles along several axes: a (2, 2) block with reps (4, 4) becomes the (8, 8) checkerboard pattern of that block. If reps has more entries than the array has dimensions, the array is promoted by PREPENDING axes (a (3,) vector with reps (2, 2) is promoted to (1, 3) first, giving a (2, 6) result); fewer entries tile the trailing axes. It always allocates the full result — for pure arithmetic, broadcasting (Part G) usually does the same job with no copies at all.",
          params: [
            {
              name: "A",
              type: "array_like",
              required: true,
              description:
                "The pattern to repeat. Its values are never interleaved or reordered — each copy is a faithful, intact duplicate.",
              example: "[0, 1] or a (2, 2) block",
            },
            {
              name: "reps",
              type: "int or tuple of ints",
              required: true,
              description:
                "How many copies to lay down along each axis. An int tiles along the trailing axis; a tuple tiles along one direction per entry — and may promote the pattern to more dimensions.",
              example: "2 or (4, 4)",
            },
          ],
          returns: {
            type: "ndarray",
            description:
              "The pattern repeated reps times per axis, with ndim equal to max(A.ndim, len(reps)). A fresh array — never a view.",
          },
          example: `import numpy as np

print(np.tile([0, 1], 3))

m = np.array([[1, 2], [3, 4]])
print(np.tile(m, 2))
print(np.tile(m, (2, 1)).shape)
`,
          exampleOutput: `[0 1 0 1 0 1]
[[1 2 1 2]
 [3 4 3 4]]
(4, 2)`,
          commonMistakes: [
            {
              mistake: "Reaching for tile when broadcasting would do.",
              why: "NumPy's own docs warn about this: multiplying a (4,) scale row against a (13, 4) table needs NO materialized tiles — broadcasting stretches the (4,) for free (Part G), while tile builds and holds the full (13, 4) copy.",
              fix: "Use tile when you need the repeated array itself (a materialized grid, an API that demands equal shapes); use broadcasting for arithmetic.",
            },
            {
              mistake: "Expecting element-by-element echoes.",
              why: "tile copies the whole pattern; np.repeat doubles each element in place. [1, 2] tiled twice is [1, 2, 1, 2]; repeated twice is [1, 1, 2, 2].",
              fix: "Ask 'photocopies of the pattern, or echoes of the values?' — then pick tile or repeat accordingly.",
            },
            {
              mistake: "Being surprised by dimension promotion.",
              why: "np.tile([1, 2, 3], (2, 2)) is (2, 6): the vector was promoted to (1, 3) first, then tiled to two rows. The result is rows of copies, not the (2, 3) stack a beginner often expects.",
              fix: "Apply the rule in order: promote the pattern to len(reps) dimensions by prepending length-1 axes, then tile each direction.",
            },
          ],
          related: [
            { name: "np.repeat", relation: "The echo twin: repeats each ELEMENT in place rather than copying the whole pattern." },
            { name: "np.broadcast_to", relation: "Repeats the pattern to a shape VIRTUALLY — zero data copied, read-only result (Part G's machinery)." },
            { name: "np.concatenate", relation: "Glues copies you already have as separate arrays; tile manufactures the copies for you." },
          ],
          applications: [
            "Building an 8x8 checkerboard or any repeating test pattern from a small block",
            "Materializing a per-column scale factor across a whole table for non-arithmetic use",
            "Creating expected grids with known periodicity for testing and demos",
          ],
          notes:
            "tile always allocates the full result. When the repetition exists only to make shapes match for arithmetic, prefer broadcasting (Part G) — same effect, no copies, less memory.",
        },
        {
          kind: "functionDoc",
          name: "np.repeat",
          purpose: "Repeat each ELEMENT of an array in place — every value echoes itself as many times as you choose.",
          signature: "np.repeat(a, repeats, axis=None)",
          purposeDetail:
            "repeat is tile's echo twin: instead of copying the whole pattern, it duplicates each individual value where it stands. np.repeat([1, 2, 3], 2) is [1, 1, 2, 2, 3, 3]. repeats can be a single count for everyone or a per-element array of counts, which makes repeat the standard tool for expanding per-item quantities into per-row records. The trap is the default axis=None: the input is flattened first, so a 2-D grid quietly comes back as a flat echo line unless you name the axis.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to repeat. Never modified — the result is a fresh array.",
              example: "[1, 2, 3]",
            },
            {
              name: "repeats",
              type: "int or array of ints",
              required: true,
              description:
                "One count for every element, or one count per element along the axis — broadcastable to the axis shape, so a 2-count list for 3 elements raises a broadcast ValueError.",
              example: "2 or [3, 1, 2]",
            },
            {
              name: "axis",
              type: "int or None",
              description:
                "The axis along which values repeat. None (the default) FLATTENS the input first and returns a flat result — the 2-D trap. Name an axis to keep the other dimensions intact.",
              example: "None, 0 or 1",
            },
          ],
          returns: {
            type: "ndarray",
            description:
              "The input with each value repeated in place: same ndim as a when an axis is given, 1-D when axis is None. Along the repeated axis, the length is the sum of the counts.",
          },
          example: `import numpy as np

print(np.repeat([1, 2, 3], 2))
print(np.repeat([[1, 2], [3, 4]], 2, axis=1))
print(np.repeat([1, 2, 3], [3, 1, 2]))
`,
          exampleOutput: `[1 1 2 2 3 3]
[[1 1 2 2]
 [3 3 4 4]]
[1 1 1 2 3 3]`,
          commonMistakes: [
            {
              mistake: "Forgetting that axis=None flattens the input.",
              why: "np.repeat(m, 2) on a (2, 2) grid returns a flat (4,) line — the rows and columns silently vanished. No error, no warning, just a different shape than expected.",
              fix: "Name the axis on any array with 2+ dimensions: np.repeat(m, 2, axis=1) doubles along the columns and keeps the grid.",
            },
            {
              mistake: "Passing a per-element repeats list of the wrong length.",
              why: "Counts must broadcast to the axis shape; two counts for three elements raise 'ValueError: operands could not be broadcast together with shape (3,) (2,)'.",
              fix: "One int for everyone, or exactly one count per position along the chosen axis — print the axis length if unsure.",
            },
            {
              mistake: "Mixing up repeat and tile.",
              why: "repeat interleaves duplicates of each value; tile re-lays the whole pattern. [1, 2] repeated is [1, 1, 2, 2]; tiled is [1, 2, 1, 2]. Same inputs, different geometry — the same confusion concatenate and stack cause.",
              fix: "Ask 'echoes or photocopies?' Values doubling in place: repeat. The pattern appearing again and again: tile.",
            },
          ],
          related: [
            { name: "np.tile", relation: "The photocopy twin: copies the whole pattern instead of echoing each value." },
            { name: "np.delete / np.insert", relation: "The other position-based editors — also always-copy (below)." },
            { name: "np.broadcast_to", relation: "For pure arithmetic, broadcasting replaces many repeat-then-operate patterns with zero copies (Part G)." },
          ],
          applications: [
            "Expanding per-group counts into per-row records — 3 orders of item A become three A rows",
            "Doubling samples in signal-smoothing and interpolation-style transforms",
            "Building weight or label vectors where each value applies to a known number of rows",
          ],
          notes:
            "repeat never reorders values: the echoes sit exactly where the original stood, in order. That guarantee is what makes it safe for count-driven expansion — row order stays aligned with the rest of the table.",
        },
        {
          kind: "heading",
          text: "delete, insert, append — and the honest price",
        },
        {
          kind: "text",
          text: "Three convenience functions edit an array by position: `np.delete` drops indexes, `np.insert` squeezes values in, `np.append` adds at the end. They are readable and fine for one-off fixes. The honest accounting: **all three always build a new array** — an array's block is fixed-size, so any size change means a full copy, O(n) every call. The original never changes (which you can prove), and the result never shares memory with it:",
        },
        {
          kind: "code",
          title: "The editors at work — and what they never do",
          code: `import numpy as np

log = np.array([10, 20, -1, 30, 40])     # -1 marks a failed sensor read

cleaned = np.delete(log, 2)              # drop the failed entry by position
print("after delete:", cleaned)

patched = np.insert(log, 1, 15)          # squeeze a value in after index 1
print("after insert:", patched)

grown = np.append(log, 50)               # one more reading at the end
print("after append:", grown)

print("original still intact:", log)
print("delete made a copy   :", not np.shares_memory(log, cleaned))
`,
          output: `after delete: [10 20 30 40]
after insert: [10 15 20 -1 30 40]
after append: [10 20 -1 30 40 50]
original still intact: [10 20 -1 30 40]
delete made a copy   : True`,
          outputNote:
            "Three new arrays, three different edits — and the original survived all of them, because every editor copied. The last line's True is np.shares_memory returning False: proof, not assertion, that delete built a fresh block.",
          explain: [
            "`np.delete(log, 2)` removed position 2 — the -1. Indexes may be a single int or a list of ints.",
            "`np.insert(log, 1, 15)` placed 15 BEFORE position 1, shifting the rest right — the same exclusive-boundary convention np.split uses for cuts.",
            "`np.append(log, 50)` looks like a list's append but is really concatenate in disguise: one new array, full copy, every call.",
          ],
        },
        {
          kind: "code",
          title: "The insert trap: no axis means flattened",
          code: `import numpy as np

m = np.array([[1, 2],
              [3, 4]])

print("insert(m, 1, 99)      :", np.insert(m, 1, 99))       # no axis: FLAT first
print("insert(m, 1, 99, axis=1):")
print(np.insert(m, 1, 99, axis=1))
`,
          output: `insert(m, 1, 99)      : [ 1 99  2  3  4]
insert(m, 1, 99, axis=1):
[[ 1 99  2]
 [ 3 99  4]]`,
          outputNote:
            "Without an axis, insert flattened the 2x2 grid into one line and inserted the 99 there — the same axis=None behavior repeat has. With axis=1 the grid survived and a 99 column went in before column 1.",
          explain: [
            "Like repeat, insert's axis=None default flattens first. On 2-D data that is almost never what you meant.",
            "With axis=1 and a scalar value, the value is inserted at that position along the axis for EVERY row — one call, a whole column of 99s.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The O(n) price tag — and the in-place route",
          text: "Because an array's data block is fixed-size, delete, insert and append each copy the ENTIRE array on every call. One call is nothing; a loop of them is quadratic churn — the exact trap Part A flagged for np.append. Two professional routes: (1) collect the pieces and join ONCE with concatenate, or (2) edit in place with boolean mask assignment from Part D — log[log < 0] = np.nan marks bad readings without copying the block. The editors are for one-off fixes; masks and single joins are for pipelines.",
        },
        {
          kind: "tryIt",
          title: "The join-and-cut playground",
          task: "Before pressing Run, write down every printed line on paper. Then: (1) change np.stack to np.stack((left, right), axis=1) and predict the new grid; (2) replace column_stack with np.vstack and explain why the result changes shape; (3) add a line that cuts your column_stack grid into two pieces with np.hsplit and print both shapes.",
          code: `import numpy as np

left = np.array([1, 2, 3])
right = np.array([4, 5, 6])

print("stack as rows:")
print(np.stack((left, right)))
print("column_stack:")
print(np.column_stack((left, right)))
print("tile  the pattern:", np.tile(left, 3))
print("repeat each value:", np.repeat(left, 3))
`,
          hint:
            "For (1): the new axis moves to position 1, so the grid becomes (3, 2) — pairs instead of rows. For (3): np.hsplit(grid, 2) needs an even number of columns — a (3, 2) grid gives two (3, 1) pieces.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "concatenate walks an axis that exists; stack creates an axis that says which input — lengthening vs adding. vstack/hstack are concatenate with fixed axes (with 1-D promotion magic); split demands equal pieces, array_split forgives; hsplit/vsplit name the axis. tile photocopies the whole pattern; repeat echoes each value in place. delete, insert and append are convenient, always-copy editors — collect-and-join once, or use Part D masks in place.",
        },
      ],
      terms: [
        { term: "Joining vs cutting", definition: "The two directions of restructuring: gluing several arrays into one (concatenate, stack, the v/h family) and slicing one array into several (split, array_split, h/vsplit)." },
        { term: "np.concatenate", definition: "Joins a sequence of arrays along an axis that ALREADY EXISTS in every input — lengths add along that axis, ndim never changes, result is always a fresh copy." },
        { term: "np.stack", definition: "Joins same-shaped arrays along a BRAND-NEW axis whose length is the number of inputs — the result has ndim+1 and the new axis records which input each slice came from." },
        { term: "column_stack", definition: "The tabular joiner: 1-D inputs each become one COLUMN of a 2-D result — rows are positions, columns are inputs." },
        { term: "array_split", definition: "The tolerant cutter: n pieces whose lengths differ by at most one (first l % n pieces get the extra element); pieces are views." },
        { term: "tile vs repeat", definition: "tile lays copies of the WHOLE pattern ([1 2 3] -> [1 2 3 1 2 3]); repeat echoes each ELEMENT in place ([1 2 3] -> [1 1 2 2 3 3])." },
      ],
      mistakes: [
        {
          mistake: "Using concatenate where stack was meant, or the reverse.",
          why: "They sound synonymous in English but are geometric opposites: concatenate lengthens an existing axis (two (3,) vectors -> (6,)), stack creates a new one (two (3,) vectors -> (2, 3)).",
          fix: "Say what you want in shapes: 'a longer axis' -> concatenate; 'a new which-input axis' -> stack. The confusion-pair table above settles every case.",
        },
        {
          mistake: "Expecting vstack and hstack on 1-D inputs to behave like their 2-D selves.",
          why: "The family promotes 1-D inputs first: hstack on two vectors is plain concatenation (6,), while vstack turns each vector into a row (2, 3) — neither is 'axis 0/1 of the vectors', because 1-D arrays have only one axis.",
          fix: "With 1-D inputs, prefer the explicit tools: np.stack((a, b)) for rows, np.column_stack for columns, np.concatenate for glue. Or print the result's shape once and recalibrate.",
        },
        {
          mistake: "Calling np.split with a count that does not divide the axis evenly, and being annoyed at the error.",
          why: "split refuses to choose among the unequal arrangements — a ValueError, not a best-effort guess. The refusal catches reporting bugs that silent ragged cuts would hide.",
          fix: "Uneven is legitimate? np.array_split. Exact boundaries known? Pass the boundary list (cut BEFORE each index) — or build it with np.cumsum of the intended piece lengths.",
        },
        {
          mistake: "Growing arrays with np.append (or delete/insert) inside a loop.",
          why: "Every call copies the entire block — n appends on an n-element array is O(n squared) churn, the same trap Part A flagged. The originals also never change, so the results must be kept.",
          fix: "Collect pieces in a Python list and join once with np.concatenate at the end; for in-place edits use boolean mask assignment from Part D (log[log < 0] = np.nan), which writes into the existing block.",
        },
      ],
      takeaways: [
        "concatenate walks an axis that already exists (lengths add, ndim unchanged); stack creates a new axis recording which input — one question separates them every time.",
        "vstack/hstack are concatenate with fixed axes; on 1-D inputs they promote (hstack glues, vstack makes rows); column_stack turns 1-D inputs into columns of a table.",
        "split demands equal pieces and raises otherwise; array_split tolerates 5-4-4 calendars; boundary lists cut BEFORE each index; hsplit/vsplit are the axis-named spellings; all pieces are views.",
        "tile photocopies the whole pattern; repeat echoes each element in place — and flattens 2-D input unless you name an axis; repeat's per-element counts make it the count-expansion tool.",
        "delete, insert and append always copy the whole block (O(n) per call): fine as one-offs, quadratic in loops — collect-and-join once, or edit in place with Part D's mask assignment.",
      ],
      quiz: [
        {
          id: "c-05-q1",
          prompt: "`a` and `b` are both 1-D arrays of length 3. What shapes do `np.concatenate((a, b))` and `np.stack((a, b))` produce?",
          options: [
            { text: "concatenate: (6,); stack: (2, 3)", correct: true, feedback: "Exactly: concatenate lengthened the one existing axis; stack created a new axis 0 with one position per input." },
            { text: "concatenate: (2, 3); stack: (6,)", correct: false, feedback: "Swapped — reread the confusion-pair block: concatenate never adds a dimension, stack always does." },
            { text: "Both (6,) — they are synonyms with different names", correct: false, feedback: "They are near-opposites: same inputs, (6,) versus (2, 3). Synonyms would make one of them redundant." },
            { text: "Both (2, 3) — any join of two vectors makes a grid", correct: false, feedback: "That is stack's geometry only. concatenate has no new axis to hold the which-input dimension." },
          ],
          explanation: "concatenate walks an existing axis (3 + 3 = 6 on one axis); stack adds a new axis of length 2 in front of the shared (3,) shape.",
        },
        {
          id: "c-05-q2",
          prompt: "`x = [1, 2, 3]` and `y = [4, 5, 6]` (1-D). What do `np.hstack((x, y))` and `np.vstack((x, y))` return?",
          options: [
            { text: "hstack: a (6,) glue; vstack: a (2, 3) grid with x and y as rows", correct: true, feedback: "Correct — the two 1-D surprises in one answer: hstack on 1-D inputs is plain concatenation; vstack promotes each vector to a row first." },
            { text: "hstack: a (1, 6) row; vstack: a (3, 2) grid of pairs", correct: false, feedback: "Close in spirit but wrong in shapes: hstack on 1-D does NOT add a row axis, and vstack does NOT pair the values — that pairing is stack(axis=1) / column_stack." },
            { text: "hstack: a (2, 3) grid; vstack: a (6,) glue", correct: false, feedback: "Exactly backwards — the names sound like they swap, but h glues 1-D horizontally into one line and v stacks them as rows." },
            { text: "Both raise, because 1-D arrays must be promoted first", correct: false, feedback: "They promote automatically — hstack treats 1-D as one line, vstack as rows. No error, just the quiet magic you now know about." },
          ],
          explanation: "On 1-D inputs hstack concatenates (6,); vstack promotes each input to a (1, 3) row and glues along axis 0, giving (2, 3).",
        },
        {
          id: "c-05-q3",
          prompt: "What do `np.tile(v, 2)` and `np.repeat(v, 2)` produce for `v = [1, 2, 3]`?",
          options: [
            { text: "tile: [1 2 3 1 2 3]; repeat: [1 1 2 2 3 3]", correct: true, feedback: "Right: tile laid the whole pattern down twice; repeat echoed each value in place. Photocopies versus echoes." },
            { text: "tile: [1 1 2 2 3 3]; repeat: [1 2 3 1 2 3]", correct: false, feedback: "Swapped — tile copies the WHOLE pattern; repeat doubles each ELEMENT where it stands." },
            { text: "Both [1 2 3 1 2 3] — repeat is tile with a friendlier name", correct: false, feedback: "They differ on every non-trivial input; if they agreed, one would not exist." },
            { text: "Both [1 1 2 2 3 3] — both double the values", correct: false, feedback: "Only repeat doubles values in place. tile is a pattern copier — wallpaper, not echoes." },
          ],
          explanation: "tile = copies of the whole block ([1 2 3 1 2 3]); repeat = each element repeated in place ([1 1 2 2 3 3]).",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part C exercises (tiered: 4 beginner, 4 intermediate, 4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "c-b1",
      tier: "beginner",
      title: "Glue the halves",
      prompt:
        "The logger wrote two arrays, first and second. Join them with np.concatenate into ONE 1-D array in the order given, then print the joined array and its shape on two lines. Expected result: five values, and a shape proving concatenate lengthened the one existing axis (it never adds a dimension).",
      hint: "The arrays go in as a sequence: np.concatenate((first, second)). Print joined.shape afterwards — (5,) for these inputs.",
      starter: `import numpy as np

first = np.array([3, 6, 9])
second = np.array([12, 15])

# TODO: join with concatenate, print the array and its shape
`,
      solution: `import numpy as np

first = np.array([3, 6, 9])
second = np.array([12, 15])

joined = np.concatenate((first, second))
print(joined)
print(joined.shape)
`,
      expectedOutput: `[ 3  6  9 12 15]
(5,)`,
      concepts: ["np.concatenate", "shape"],
    },
    {
      id: "c-b2",
      tier: "beginner",
      title: "Pick the axis",
      prompt:
        "Given top and bottom (each shape (2, 2)), produce TWO results from the same inputs: a (4, 2) array by gluing along axis 0, and a (2, 4) array by gluing along axis 1. Print each result's shape on its own line. Same two inputs, two different axes — the axis argument is the only thing that changes.",
      hint: "np.concatenate((top, bottom), axis=0) stacks the rows; axis=1 widens sideways. Same numbers in, two different geometries out.",
      starter: `import numpy as np

top = np.array([[1, 2], [3, 4]])
bottom = np.array([[5, 6], [7, 8]])

# TODO: print the (4, 2) shape, then the (2, 4) shape
`,
      solution: `import numpy as np

top = np.array([[1, 2], [3, 4]])
bottom = np.array([[5, 6], [7, 8]])

print(np.concatenate((top, bottom), axis=0).shape)
print(np.concatenate((top, bottom), axis=1).shape)
`,
      expectedOutput: `(4, 2)
(2, 4)`,
      concepts: ["np.concatenate", "axis"],
    },
    {
      id: "c-b3",
      tier: "beginner",
      title: "Stack the vectors",
      prompt:
        "For a = [1, 2, 3] and b = [4, 5, 6]: print the grid np.stack((a, b)) produces, then its shape, then the shape of np.stack((a, b), axis=1). Three lines: a (2, 3) grid, its shape, and the (3, 2) shape of the axis=1 version. Before running, say aloud what the new axis records in each case.",
      hint: "np.stack((a, b)) makes a the first row and b the second — new axis 0. With axis=1 the new axis moves to position 1 and the values pair up column-wise.",
      starter: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# TODO: print stack axis=0 (the grid), its shape, and the shape of stack axis=1
`,
      solution: `import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(np.stack((a, b)))
print(np.stack((a, b)).shape)
print(np.stack((a, b), axis=1).shape)
`,
      expectedOutput: `[[1 2 3]
 [4 5 6]]
(2, 3)
(3, 2)`,
      concepts: ["np.stack", "new axis"],
    },
    {
      id: "c-b4",
      tier: "beginner",
      title: "Tile or repeat?",
      prompt:
        "For v = [7, 8, 9], print np.tile(v, 2) and then np.repeat(v, 2) on two lines. Before running, write down which line will be [7 8 9 7 8 9] and which will be [7 7 8 8 9 9] — if your prediction is wrong, reread the photocopies-versus-echoes distinction before moving on.",
      hint: "tile copies the WHOLE pattern again; repeat echoes each value in place. Two lines, two different geometries, same input.",
      starter: `import numpy as np

v = np.array([7, 8, 9])

# TODO: print tile(v, 2), then repeat(v, 2)
`,
      solution: `import numpy as np

v = np.array([7, 8, 9])

print(np.tile(v, 2))
print(np.repeat(v, 2))
`,
      expectedOutput: `[7 8 9 7 8 9]
[7 7 8 8 9 9]`,
      concepts: ["np.tile", "np.repeat"],
    },
    {
      id: "c-i1",
      tier: "intermediate",
      title: "column_stack the sensors",
      prompt:
        "Three sensors each logged four days: temp = [21, 22, 20, 23], humid = [55, 60, 58, 57], wind = [10, 12, 8, 9]. Build ONE (4, 3) table with np.column_stack (days as rows, sensors as columns), print it, print its shape, and then recover the wind readings alone as a 1-D array with a column slice — printing them on a labeled line. Four lines total.",
      hint: "np.column_stack((temp, humid, wind)) turns each 1-D input into one column. The wind column comes back out as grid[:, 2] — the exact array that went in.",
      starter: `import numpy as np

temp = np.array([21, 22, 20, 23])
humid = np.array([55, 60, 58, 57])
wind = np.array([10, 12, 8, 9])

# TODO: build the (4, 3) table, print it and its shape, then print the wind column
`,
      solution: `import numpy as np

temp = np.array([21, 22, 20, 23])
humid = np.array([55, 60, 58, 57])
wind = np.array([10, 12, 8, 9])

grid = np.column_stack((temp, humid, wind))
print(grid)
print(grid.shape)
print("wind recovered:", grid[:, 2])
`,
      expectedOutput: `[[21 55 10]
 [22 60 12]
 [20 58  8]
 [23 57  9]]
(4, 3)
wind recovered: [10 12  8  9]`,
      concepts: ["np.column_stack", "column slicing"],
    },
    {
      id: "c-i2",
      tier: "intermediate",
      title: "Split even, split uneven",
      prompt:
        "Split the 12-value array np.arange(1, 13) into 4 equal quarters with np.split, and print the list of quarter lengths. Then split an 11-value array into 4 pieces with np.array_split and print those lengths too. Two lines of shape lists: the strict function succeeds only because 12 divides by 4; the tolerant one absorbs the leftover.",
      hint: "Lengths come from a comprehension: [q.shape[0] for q in pieces]. Expect [3, 3, 3, 3] for the year and 3, 3, 3, 2 for the eleven — array_split gives the extra elements to the FIRST pieces.",
      starter: `import numpy as np

year = np.arange(1, 13)
eleven = np.arange(1, 12)

# TODO: print the 4 quarter lengths, then the 4 uneven piece lengths
`,
      solution: `import numpy as np

year = np.arange(1, 13)
eleven = np.arange(1, 12)

quarters = np.split(year, 4)
print([q.shape[0] for q in quarters])

chunks = np.array_split(eleven, 4)
print([c.shape[0] for c in chunks])
`,
      expectedOutput: `[3, 3, 3, 3]
[3, 3, 3, 2]`,
      concepts: ["np.split", "np.array_split"],
    },
    {
      id: "c-i3",
      tier: "intermediate",
      title: "The 1-D surprises, proven",
      prompt:
        "For x = [1, 2, 3] and y = [4, 5, 6] (both 1-D), demonstrate the two famous surprises: print np.hstack((x, y)) together with its shape on one line, then np.vstack((x, y)) as a grid on its own line and its shape on the next. Four lines total — a (6,) glue and a (2, 3) grid, from the same two vectors.",
      hint: "hstack on 1-D inputs is plain concatenation — no row appears. vstack promotes each vector to a (1, 3) row first, then glues along axis 0.",
      starter: `import numpy as np

x = np.array([1, 2, 3])
y = np.array([4, 5, 6])

# TODO: print hstack with its shape, then vstack as a grid with its shape
`,
      solution: `import numpy as np

x = np.array([1, 2, 3])
y = np.array([4, 5, 6])

glued = np.hstack((x, y))
print(glued, glued.shape)
rows = np.vstack((x, y))
print(rows)
print(rows.shape)
`,
      expectedOutput: `[1 2 3 4 5 6] (6,)
[[1 2 3]
 [4 5 6]]
(2, 3)`,
      concepts: ["np.hstack", "np.vstack", "1-D promotion"],
    },
    {
      id: "c-i4",
      tier: "intermediate",
      title: "Delete the bad readings",
      prompt:
        "The array readings = [1.1, -999.0, 2.4, -999.0, 3.0] contains two sentinel failures at indexes 1 and 3. Remove BOTH in a single np.delete call, print the cleaned array, then print the original to prove it was never modified. Two lines: the clean [1.1 2.4 3.0] and the untouched original including its sentinels.",
      hint: "np.delete takes a LIST of positions: np.delete(readings, [1, 3]). The original printing unchanged afterwards is the proof that delete copies rather than edits.",
      starter: `import numpy as np

readings = np.array([1.1, -999.0, 2.4, -999.0, 3.0])

# TODO: delete indexes 1 and 3 in ONE call; print cleaned, then the original
`,
      solution: `import numpy as np

readings = np.array([1.1, -999.0, 2.4, -999.0, 3.0])

cleaned = np.delete(readings, [1, 3])
print(cleaned)
print(readings)
`,
      expectedOutput: `[1.1 2.4 3. ]
[   1.1 -999.     2.4 -999.     3. ]`,
      concepts: ["np.delete", "copies"],
    },
    {
      id: "c-a1",
      tier: "advanced",
      title: "Four shapes, one pair of grids",
      prompt:
        "Predict all four shapes ON PAPER before running. For m1 and m2 (both shape (2, 3)): print the shape of concatenating along axis 0, along axis 1, the shape of np.stack((m1, m2)), and of np.stack((m1, m2), axis=2). Four labeled lines: (4, 3), (2, 6), (2, 2, 3) and (2, 3, 2). If any prediction was wrong, identify which mental model slipped before moving on.",
      hint: "Concatenate keeps ndim at 2 and lengthens one axis. Stack goes 3-D: insert a new length-2 axis (one position per input) at the position axis names — axis=2 puts it at the end.",
      starter: `import numpy as np

m1 = np.zeros((2, 3), dtype=int)
m2 = np.ones((2, 3), dtype=int)

# TODO: print four labeled shapes: concat axis=0, concat axis=1, stack, stack axis=2
`,
      solution: `import numpy as np

m1 = np.zeros((2, 3), dtype=int)
m2 = np.ones((2, 3), dtype=int)

print("concat axis=0:", np.concatenate((m1, m2), axis=0).shape)
print("concat axis=1:", np.concatenate((m1, m2), axis=1).shape)
print("stack        :", np.stack((m1, m2)).shape)
print("stack axis=2 :", np.stack((m1, m2), axis=2).shape)
`,
      expectedOutput: `concat axis=0: (4, 3)
concat axis=1: (2, 6)
stack        : (2, 2, 3)
stack axis=2 : (2, 3, 2)`,
      concepts: ["np.concatenate", "np.stack", "shape prediction"],
    },
    {
      id: "c-a2",
      tier: "advanced",
      title: "The chessboard",
      prompt:
        "Build an 8x8 chessboard of 0s and 1s from a single 2x2 block: block = [[0, 1], [1, 0]] tiled with np.tile(block, (4, 4)). Print the board, its shape, and — as a sanity line — the 1-D pattern of one row built with np.tile([0, 1], 4). Three outputs: the 8x8 board, (8, 8), and [0 1 0 1 0 1 0 1].",
      hint: "The (4, 4) reps tuple tiles the block 4 times vertically and 4 times horizontally: 2x4 = 8 in each direction. Neighboring copies interlock because the block's edges alternate.",
      starter: `import numpy as np

block = np.array([[0, 1],
                  [1, 0]])

# TODO: tile to an 8x8 board; print it, its shape, and one row's pattern via tile([0, 1], 4)
`,
      solution: `import numpy as np

block = np.array([[0, 1],
                  [1, 0]])

board = np.tile(block, (4, 4))
print(board)
print(board.shape)
print("one row pattern:", np.tile([0, 1], 4))
`,
      expectedOutput: `[[0 1 0 1 0 1 0 1]
 [1 0 1 0 1 0 1 0]
 [0 1 0 1 0 1 0 1]
 [1 0 1 0 1 0 1 0]
 [0 1 0 1 0 1 0 1]
 [1 0 1 0 1 0 1 0]
 [0 1 0 1 0 1 0 1]
 [1 0 1 0 1 0 1 0]]
(8, 8)
one row pattern: [0 1 0 1 0 1 0 1]`,
      concepts: ["np.tile", "2-D reps"],
    },
    {
      id: "c-a3",
      tier: "advanced",
      title: "Read the error, fix the axis",
      prompt:
        "This starter crashes. Read the error message carefully — it names the dimension that mismatches — then make the MINIMAL fix so the code prints one shape. The intent: daily is one week of 4 sensors (7, 4) and extra is a fifth sensor added mid-study (7, 1); the combined table should hold all five sensors per day. Do not change the data shapes; change how they are joined.",
      hint: "The new sensor should become a fifth COLUMN — gluing along axis 0 demands matching columns, and 4 vs 1 do not match. The right axis glues the 7 shared rows and appends the column.",
      starter: `import numpy as np

daily = np.zeros((7, 4))     # one week of 4 sensors
extra = np.zeros((7, 1))     # a fifth sensor added mid-study

combined = np.concatenate((daily, extra), axis=0)
print(combined.shape)
`,
      starterExpectError:
        "ValueError: all the input array dimensions except for the concatenation axis must match exactly, but along dimension 1, the array at index 0 has size 4 and the array at index 1 has size 1",
      solution: `import numpy as np

daily = np.zeros((7, 4))     # one week of 4 sensors
extra = np.zeros((7, 1))     # a fifth sensor added mid-study

combined = np.concatenate((daily, extra), axis=1)
print(combined.shape)
`,
      expectedOutput: `(7, 5)`,
      concepts: ["np.concatenate", "error reading", "axis"],
    },
    {
      id: "c-a4",
      tier: "advanced",
      title: "A real calendar",
      prompt:
        "Cut a 365-day year into its real months. days = np.arange(1, 366) is day-of-year 1..365; month_lengths lists the twelve month sizes. Build the cut points with np.cumsum of the lengths (dropping the LAST entry — the year's end needs no cut), hand them to np.split, then print the list of month lengths you got and the first five days of March on a labeled line. The shapes should read [31, 28, 31, 30, ...].",
      hint: "np.cumsum([31, 28, 31, ...]) gives [31, 59, 90, ...] — the index where each month ends. Drop the last entry (365) so you cut before 11 boundaries, producing 12 pieces. March is months[2].",
      starter: `import numpy as np

days = np.arange(1, 366)                       # day-of-year 1..365
month_lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

# TODO: build cut points with cumsum (drop the last), split, print lengths + March's first 5 days
`,
      solution: `import numpy as np

days = np.arange(1, 366)                       # day-of-year 1..365
month_lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

cut_points = np.cumsum(month_lengths)[:-1]     # index where each month ends (exclusive)
months = np.split(days, cut_points)

print([m.shape[0] for m in months])
print("first 5 days of March:", months[2][:5])
`,
      expectedOutput: `[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
first 5 days of March: [60 61 62 63 64]`,
      concepts: ["np.split", "np.cumsum", "boundary lists"],
    },
  ],

  // ------------------------------------------------------------------
  // Part C assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "c-as-1",
      prompt: "An array has shape (5, 2, 4). Which statement is TRUE?",
      options: [
        { text: "size is 40 (5 x 2 x 4) and axis 1 has 2 positions", correct: true, feedback: "Correct: size is the product of all axis lengths, and each shape entry pairs with one axis — axis 1 is the middle entry, 2." },
        { text: "size is 11 (5 + 2 + 4), the sum of the axis lengths", correct: false, feedback: "Size is the PRODUCT of the shape entries, never the sum — 40 elements live in this array." },
        { text: "Axis 0 has 4 positions, because the last shape entry belongs to axis 0", correct: false, feedback: "Shape pairs with axes in order: axis 0 gets the FIRST entry (5). The last entry (4) belongs to the last axis." },
        { text: "The array has 4 axes, one per value in the shape plus the size", correct: false, feedback: "ndim is the LENGTH of the shape tuple: three entries, three axes." },
      ],
      explanation: "size = product of shape (40); ndim = number of entries (3); each entry pairs with its axis in order.",
    },
    {
      id: "c-as-2",
      prompt: "`a = np.arange(24)`. Which call RAISES an error?",
      options: [
        { text: "a.reshape(5, 5)", correct: true, feedback: "Right: 25 slots for 24 values. The product of the new shape must equal a.size, and 24 is not divisible into 5x5." },
        { text: "a.reshape(4, -1, 2)", correct: false, feedback: "Legal: one wildcard is fine — 24 / (4 x 2) = 3, giving (4, 3, 2)." },
        { text: "a.reshape(-1, 6)", correct: false, feedback: "Legal: 24 / 6 = 4, giving (4, 6). One -1 per call is always allowed when the arithmetic works." },
        { text: "a.reshape(2, 3, 4, order=\"F\")", correct: false, feedback: "Legal: 2 x 3 x 4 = 24, and order only changes how the block is READ while filling — the shape is still (2, 3, 4)." },
      ],
      explanation: "The reshape contract: the product of the new shape must equal size (at most one -1 wildcard). 5 x 5 = 25 != 24, so that call raises.",
    },
    {
      id: "c-as-3",
      prompt: "`t = a.reshape(3, 4).T` (a jumpy transpose view), then `v = t.reshape(12)`. What is TRUE of v?",
      options: [
        { text: "v is a fresh copy — np.shares_memory(t, v) is False", correct: true, feedback: "Correct: a straight-line walk of a transposed view has no single stride rule, so reshape silently copied — the silent-copy case from Lesson c-02." },
        { text: "v is a view of t, because reshape never copies", correct: false, feedback: "Reshape returns a view only WHEN POSSIBLE. For a contiguous strip it does; for this jumpy transpose it cannot." },
        { text: "The call raises, because t is non-contiguous", correct: false, feedback: "It does not raise: the .reshape() method is allowed to copy when no view is possible. (The a.shape = assignment form is the one that refuses.)" },
        { text: "v shares memory with a but not with t", correct: false, feedback: "t IS a's memory seen through swapped strides — there is no separate t block to share or not share." },
      ],
      explanation: "Views require a stride rule; where none exists, .reshape() copies silently. np.shares_memory turns the assumption into a checked fact.",
    },
    {
      id: "c-as-4",
      prompt: "`img = np.arange(12).reshape(3, 4)` (contiguous). You run `f = img.ravel(); f[0] = 99`. What is `img[0, 0]` afterwards?",
      options: [
        { text: "99 — ravel returned a view, and the write landed in the shared block", correct: true, feedback: "Correct: img is contiguous so the flat walk is its own memory order — a view. Writes flow through to the parent." },
        { text: "0 — ravel always copies, so the parent is protected", correct: false, feedback: "That is flatten's contract. ravel copies only when no stride rule can walk the array flat; here one can." },
        { text: "The assignment raises, because f is 1-D and img is 2-D", correct: false, feedback: "Memory does not care about shapes: f and img share bytes, so the flat write simply lands in img's first element." },
        { text: "99 only in f; img updates only when img is printed", correct: false, feedback: "Printing has nothing to do with memory — the write happened in the shared block the moment you assigned." },
      ],
      explanation: "ravel on a contiguous array is a view: flat writes are parent writes. Read, ravel; write, flatten.",
    },
    {
      id: "c-as-5",
      prompt: "`cube` has shape (2, 3, 4). What is the shape of `np.transpose(cube, (2, 0, 1))`?",
      options: [
        { text: "(4, 2, 3)", correct: true, feedback: "Correct: the tuple names OLD axes in NEW order — old axis 2 (length 4) first, then old axis 0 (length 2), then old axis 1 (length 3)." },
        { text: "(3, 4, 2)", correct: false, feedback: "That would be the permutation (1, 2, 0). Ours is (2, 0, 1): old-2, old-0, old-1." },
        { text: "(2, 3, 4) — the tuple is just documentation", correct: false, feedback: "The tuple is a real reordering instruction; only a valid permutation of 0..2 is accepted, and it decides the result shape." },
        { text: "It raises, because 2 is not a valid axis number", correct: false, feedback: "Axes run 0..2 here, so 2 is the last axis — perfectly legal inside a permutation." },
      ],
      explanation: "axes[i] = the ORIGINAL axis that lands in new position i: (2, 0, 1) turns (2, 3, 4) into (4, 2, 3).",
    },
    {
      id: "c-as-6",
      prompt: "`v = np.array([1, 2, 3])`. Which expression produces shape (3, 1) — a column?",
      options: [
        { text: "v[:, None]", correct: true, feedback: "Correct: None at the second bracket position inserts a length-1 axis at the end — three rows of one. (np.expand_dims(v, 1) is the spelled-out form.)" },
        { text: "v.T", correct: false, feedback: "A 1-D transpose is the identity: one axis reversed is still one axis, shape (3,). Vectors need an inserted axis to become rows or columns." },
        { text: "v[None, :]", correct: false, feedback: "None FIRST inserts the length-1 axis at the front: (1, 3) — a row, not a column." },
        { text: "np.squeeze(v)", correct: false, feedback: "v has no length-1 axes to remove — squeeze returns it unchanged, still (3,)." },
      ],
      explanation: "The bracket position of None is the position of the new length-1 axis: v[:, None] gives (3, 1); v[None, :] gives (1, 3).",
    },
    {
      id: "c-as-7",
      prompt: "You have two weekly grids, w1 and w2, each shape (4, 7) — 4 sensors x 7 days. You want ONE array of shape (2, 4, 7) with the weeks on axis 0. Which call is correct?",
      options: [
        { text: "np.stack((w1, w2))", correct: true, feedback: "Correct: stack creates the new which-input axis 0, so the two (4, 7) grids become panels of a (2, 4, 7) block." },
        { text: "np.concatenate((w1, w2), axis=0)", correct: false, feedback: "That walks the EXISTING axis 0: (4, 7) + (4, 7) gives (8, 7) — a taller table, still 2-D." },
        { text: "np.concatenate((w1, w2), axis=1)", correct: false, feedback: "That widens the sensor axis instead: (4, 14). Still 2-D, and the weeks are interleaved within rows." },
        { text: "np.vstack((w1, w2))", correct: false, feedback: "vstack is concatenate along axis 0 with a friendly name — (8, 7), not the (2, 4, 7) block you asked for." },
      ],
      explanation: "A new axis recording which input is stack's job: inputs become slices of a result with ndim+1. Lengthening an existing axis is concatenate's.",
    },
    {
      id: "c-as-8",
      prompt: "`m` is a 2-D grid. What does `np.repeat(m, 2)` (no axis) return?",
      options: [
        { text: "A flat 1-D array — the input was flattened first, then each value echoed in place", correct: true, feedback: "Correct: repeat's axis=None default flattens the input — the classic 2-D trap. Name an axis to keep the grid's shape." },
        { text: "A grid with each row doubled: 2x the rows, same columns", correct: false, feedback: "That would be np.repeat(m, 2, axis=0) — with an axis, the shape is kept and only that axis grows." },
        { text: "It raises, because 2-D input requires an explicit axis", correct: false, feedback: "No error: axis=None is a legal default, it just flattens first. The surprise is the shape, not a crash." },
        { text: "A grid with the whole pattern copied twice, like tile", correct: false, feedback: "That is tile's geometry. repeat echoes each element — and without an axis it does so on a flattened copy." },
      ],
      explanation: "np.repeat(m, 2) = flatten, echo each value, return 1-D. np.repeat(m, 2, axis=...) keeps ndim and grows only that axis.",
    },
  ],

  // ------------------------------------------------------------------
  // Part C mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Monthly Stack: Quarterly Reporting from Weekly Grids",
    brief:
      "You run reporting for a lab with four sensors that each log seven days a week. Thirteen weeks of data arrive as thirteen separate (4, 7) grids — one per week, built here from a deterministic formula so every run matches — and management wants one quarterly report. You will assemble the weeks into a single (13, 4, 7) stack with weeks on axis 0, cut the quarter into three reporting months even though 13 does not divide by 3, compute weekly per-sensor means by collapsing exactly the right axis, tile a per-sensor calibration factor across all thirteen weeks, and print a compact report. Every step is a Part C move: stacking, axis-wise reduction, uneven splitting, and tiling.",
    requirements: [
      "A week_grid(week) function that returns a (4, 7) array of readings built ONLY from the week number — a deterministic formula, no randomness, so every run matches",
      "The thirteen weeks are assembled into one array of shape (13, 4, 7) with weeks on axis 0, using np.stack",
      "The quarter is cut into three months with np.array_split along the week axis, producing week counts 5, 4 and 4",
      "Weekly per-sensor means come from ONE reduction over the days axis only: shape (13, 4), with no Python loops doing arithmetic",
      "The per-sensor scale factor (shape (4,)) is tiled to (13, 4) with np.tile and applied to the weekly means",
      "The report prints the quarter shape, the month week-counts, the first three weeks of raw and scaled means, and per-sensor totals for the whole quarter",
      "Every numeric result comes from array expressions — no loops over weeks or days for any arithmetic",
    ],
    steps: [
      "Write week_grid and sanity-check it: week_grid(0) must be a (4, 7) grid whose first row starts 10.0, 10.5, 11.0, ... (sensor 0's week-1 line, half a unit per day)",
      "Build weeks = [week_grid(w) for w in range(13)] and stack them; print quarter.shape and confirm (13, 4, 7) before going further",
      "Cut the quarter with np.array_split(quarter, 3, axis=0); print each month's week count and confirm 5, 4, 4 — thirteen weeks, three unequal months",
      "Collapse the days axis: quarter.mean(axis=2) gives the (13, 4) weekly means — print week 0 and hand-check it against week_grid(0).mean()",
      "Tile the scale factor: np.tile(scale, (13, 1)) is (13, 4); multiply it into the weekly means and print the first three weeks again",
      "Finish the report with per-sensor quarter totals (one reduction over two axes at once) and check sensor 0's week-0 contribution by hand",
      "Rerun the file top to bottom and read every printed line as a sentence — 'thirteen weeks, four sensors, seven days'. If you can say each shape aloud, the project is done",
    ],
    starter: `import numpy as np

def week_grid(week):
    """One week of readings: 4 sensors x 7 days, formula-built (no randomness)."""
    days = np.arange(7)                      # day 0..6
    sensors = np.arange(4).reshape(4, 1)     # sensor 0..3 as a column
    return 10 * (week + 1) + sensors + 0.5 * days

weeks = [week_grid(w) for w in range(13)]

# --- 1. Assemble the quarter: one array, weeks on axis 0. Target shape (13, 4, 7).
quarter = np.zeros((13, 4, 7))     # TODO: replace with np.stack(...) of weeks

# --- 2. Cut the quarter into three reporting months along the week axis.
months = [quarter]                 # TODO: replace with np.array_split(..., 3, axis=0)

# --- 3. Weekly mean per sensor: collapse the days axis only. Target shape (13, 4).
weekly = np.zeros((13, 4))         # TODO: replace with a mean over the right axis

# --- 4. Scale: a per-sensor factor, tiled across all 13 weeks.
scale = np.array([1.00, 1.10, 0.95, 1.05])        # shape (4,)
weekly_scaled = np.zeros((13, 4))  # TODO: apply the tiled scale to weekly

# --- 5. The report ---
print("quarter shape:", quarter.shape)
print("month week-counts:", [m.shape[0] for m in months])
print("weekly means, first 3 weeks:")
print(weekly[:3])
print("scaled, first 3 weeks:")
print(weekly_scaled[:3])
print("sensor totals for the quarter:", quarter.sum(axis=(0, 2)))
`,
    concepts: ["np.stack", "np.array_split", "axis reductions", "np.tile", "shape reasoning"],
    extension:
      "Add a per-month summary: a (3, 4) array holding each month's mean per sensor. Hint: the months have different lengths, so compute each month's mean in a short comprehension and np.stack the results — the new axis 0 becomes the month axis. Then print each month's busiest sensor with .argmax(axis=1).",
  },
};
