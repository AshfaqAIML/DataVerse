/**
 * PART E — BROADCASTING AND VECTORIZATION: THINKING IN ARRAYS
 *
 * The two habits that make NumPy feel like magic: the broadcasting rule
 * (shapes align from the right, equal-or-one, 1 stretches) learned once
 * and then reused in the everyday patterns you will keep for life
 * (center columns, normalize rows, outer products, bias adds, pairwise
 * distances) -> vectorization as a discipline (find the loop, find the
 * array op; where kills if-chains; & and | chain comparisons) -> ufuncs,
 * the function objects behind every operator, with their reduce / outer /
 * accumulate / at methods and the out= and where= levers.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 * Machine-dependent outputs (raw timings) never appear in verified blocks:
 * timing demonstrations print stable booleans against conservative
 * thresholds, and display-only notes use lang "text"/"bash".
 *
 * Authoring conventions:
 *   - code blocks use the AUTOFILL placeholder for their output field; the
 *     verifier fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_E: NumpyPart = {
  letter: "E",
  title: "Broadcasting and Vectorization: Thinking in Arrays",
  tagline: "The stretching rule and the loop-killer — the two ideas that make NumPy feel like magic",
  description:
    "Learn the two ideas that make NumPy feel like magic. First broadcasting: one small rule — shapes align from the right, each dimension must be equal or one, and a 1 stretches to fit — that quietly powers the everyday patterns you will reuse forever: centering columns, normalizing rows, outer products, bias adds, and pairwise distance matrices. Then vectorization: the discipline of turning Python loops into whole-array expressions, replacing if/else chains with np.where, and chaining array comparisons with & and |. Underneath it all sit ufuncs — the function objects behind every operator — with their reduce, outer, accumulate, and at methods, plus the out= and where= levers for allocation-free work. Every output shown in this part is machine-verified against the exact NumPy build the playground runs.",
  lessons: [
    // ------------------------------------------------------------- e-01
    {
      slug: "e-01",
      title: "The Broadcasting Rule, Learned Once",
      minutes: 17,
      summary:
        "One small rule — right-align the shapes, every dimension must match or be 1, and a 1 stretches to fit — plus the classic (3,) + (3, 1) trap, the real error message when shapes refuse, and the honest memory bill of every broadcast.",
      kind: "concept",
      objectives: [
        "State the broadcasting rule in one breath: right-align, equal-or-one, 1 stretches",
        "Predict the result shape of any two-operand operation — or the exact ValueError it raises",
        "Explain why (3,) + (3, 1) silently produces a (3, 3) array instead of failing",
        "Say where a broadcast result lives (a fresh temporary) and what that costs in memory",
      ],
      why: "Almost every interesting NumPy expression you will ever write — subtracting a mean from every column, adding a bias vector to a whole batch, dividing every row by its own norm — combines two arrays of DIFFERENT shapes. Broadcasting is the tiny, strict rule that decides silently whether that combination works and what shape comes out. Learn it once, here, and hundreds of later operations become predictable; skip it, and you will spend your career mystified by messages like 'operands could not be broadcast together with shapes (3,4) (3,5)'. This lesson teaches the rule in four moves, then walks you into the classic (3,) + (3, 1) trap on purpose, reads the real error message line by line, and closes with the memory honesty that keeps big broadcasts from blowing up silently.",
      blocks: [
        {
          kind: "text",
          text: "Here is a line that should feel illegal the first time you see it: `grid + row`, where `grid` has shape (3, 4) and `row` has shape (4,). The shapes do not match — and yet NumPy adds the row to *every row of the grid*, no loop, no error. The machinery behind that is **broadcasting**: a small, strict rule for combining arrays of different shapes by treating missing or length-1 dimensions as *stretchable*. It is not a niche feature. It is the quiet engine behind most one-line data transformations in the NumPy world — and this lesson teaches it once, so you never have to guess again.",
        },
        {
          kind: "heading",
          text: "The rule, in four moves",
        },
        {
          kind: "text",
          text: "You do not need a poster on the wall. Broadcasting is four moves, applied in order, every time two arrays meet inside an operation (`+`, `*`, `-`, `/`, comparisons, and every ufunc from Lesson e-04):",
        },
        {
          kind: "steps",
          title: "The four moves",
          items: [
            "**Right-align the shapes.** Write the two shape tuples so their LAST entries line up. A missing leading dimension (an array with fewer axes) counts as 1.",
            "**Equal or one.** Walk the pairs from the right. In each pair, the two sizes must either be **equal**, or **one of them must be 1** — otherwise the whole operation stops with a ValueError.",
            "**1 stretches.** Any dimension of size 1 is repeated up to the partner's size. A (3, 1) column next to a (3, 4) grid stretches its single column into 4.",
            "**Scalars go anywhere.** A plain Python number behaves like a shape of all 1s, so it stretches along every axis at once.",
          ],
        },
        {
          kind: "visual",
          title: "Reading shapes right to left",
          ascii: `  MOVE 1: right-align            MOVE 2 + 3: equal-or-one, stretch

  grid        3   4             grid        3   4
  row             4             row         1   4      (missing axis -> 1)
  -------------...             --------------------
  result      3   4             result      3   4      4=4 match, 1 stretched to 3

  col         3   1             scalar      1   1      (a python number is all 1s)
  row         1   4             grid        3   4
  -------------...             --------------------
  result      3   4             result      3   4      both axes stretched

  The rule NEVER reads left to right. Shape (3,) does not mean
  "3 rows" -- right-aligned, it is a ROW of 3 that pairs with
  the COLUMNS of a (3, 4) grid.
`,
          caption:
            "Two textbook broadcasts and the scalar case, drawn the way the rule sees them. Notice what is NOT here: no case where a non-1 size stretches. 3 never becomes 4 — only 1 (or a missing axis) stretches.",
        },
        {
          kind: "code",
          title: "The rule in action, three ways",
          code: `import numpy as np

row = np.array([100, 200, 300, 400])        # shape (4,)
grid = np.arange(12).reshape(3, 4) * 10     # shape (3, 4)

print("grid + row  (the row joins every row of the grid) ->")
print(grid + row)
print("grid + 5    (a scalar stretches everywhere) ->")
print(grid + 5)
`,
          output: `grid + row  (the row joins every row of the grid) ->
[[100 210 320 430]
 [140 250 360 470]
 [180 290 400 510]]
grid + 5    (a scalar stretches everywhere) ->
[[  5  15  25  35]
 [ 45  55  65  75]
 [ 85  95 105 115]]`,
          outputNote:
            "Real output, produced by running this exact code with NumPy 2.0.2 on Python 3.12 — the same build the playground below uses. In the first result, 100 landed on columns 0 of all three rows: the (4,) row stretched DOWN. In the second, the scalar 5 reached all 12 elements.",
          explain: [
            "`grid + row` — shapes (3, 4) and (4,). Right-aligned, the row has no axis-0 entry, which counts as 1, so it stretches down the three rows. Column counts match exactly: 4 = 4.",
            "`grid + 5` — a scalar is a shape of all 1s, so it stretches along both axes. Same machinery, zero ceremony.",
            "Neither operand changed: both results are NEW arrays. Where results live is the last section of this lesson.",
          ],
        },
        {
          kind: "text",
          text: "Say the shapes out loud until this feels like reading: *\"(3, 4) plus (4,): the 4s match, the missing axis stretches to 3 — result (3, 4).\"* That sentence is 90% of broadcasting fluency.",
        },
        {
          kind: "heading",
          text: "The classic trap: (3,) + (3, 1) succeeds",
        },
        {
          kind: "text",
          text: "Every NumPy learner hits this one, usually at 2 a.m. You have a vector of three values and a column of three values, you want them added element-wise, and you write `a + col` — expecting either three sums or an error. You get neither. You get a **3 x 3 grid**. Run it:",
        },
        {
          kind: "code",
          title: "The trap, on purpose",
          code: `import numpy as np

a = np.arange(3)            # shape (3,)   -- a flat vector
col = a.reshape(3, 1)       # shape (3, 1) -- a real column

result = a + col
print("a   shape:", a.shape, "  col shape:", col.shape)
print("a + col gives shape:", result.shape)
print(result)
`,
          output: `a   shape: (3,)   col shape: (3, 1)
a + col gives shape: (3, 3)
[[0 1 2]
 [1 2 3]
 [2 3 4]]`,
          outputNote:
            "No error, and the shape is (3, 3): the flat (3,) acted as a ROW, paired with the column, and both stretched. Every element of a met every element of col — an addition table.",
          explain: [
            "Right-align (3,) against (3, 1): the flat vector becomes the row (1, 3).",
            "Now (1, 3) meets (3, 1): the 1 in each stretches toward the other's size — 1 stretches to 3 along axis 0, and 1 stretches to 3 along axis 1.",
            "Result shape (3, 3). This every-element-against-every-element pattern is exactly the **outer product** shape from Lesson e-02 — sometimes this trap is exactly what you want.",
            "The fix when it is NOT what you want: make both sides genuinely parallel, e.g. `a + col.ravel()`, so shape (3,) meets shape (3,) and the answer is three plain sums.",
          ],
        },
        {
          kind: "code",
          title: "The outer shape, done deliberately",
          code: `import numpy as np

col = np.array([1, 2, 3]).reshape(3, 1)          # (3, 1)
row = np.array([10, 20, 30, 40]).reshape(1, 4)   # (1, 4)

s = col + row
p = col * row
print("sum shape:", s.shape)
print(s)
print("product shape:", p.shape)
print(p)
`,
          output: `sum shape: (3, 4)
[[11 21 31 41]
 [12 22 32 42]
 [13 23 33 43]]
product shape: (3, 4)
[[ 10  20  30  40]
 [ 20  40  60  80]
 [ 30  60  90 120]]`,
          outputNote:
            "This is the same trap, upgraded to a feature: a (3, 1) column and a (1, 4) row combine into a (3, 4) grid of every pair. Lesson e-02 turns this into the outer-product and pairwise-distance patterns.",
          explain: [
            "Both operands have a 1 in the dimension where the other is bigger — so BOTH stretch. That double stretch is the signature of the outer-product shape.",
            "The sum grid and product grid use identical shape logic. The rule does not care which operator is involved — it only decides shapes.",
          ],
        },
        {
          kind: "heading",
          text: "When shapes refuse: the real error",
        },
        {
          kind: "text",
          text: "When a dimension pair is neither equal nor 1, NumPy stops immediately with one of the most informative error messages in the library. Here is the genuine article, character for character, from NumPy 2.0.2:",
        },
        {
          kind: "code",
          title: "A broadcast that cannot happen",
          code: `import numpy as np

a = np.ones((3, 4))
b = np.ones((3, 5))
print(a + b)
`,
          expectError:
            "ValueError: operands could not be broadcast together with shapes (3,4) (3,5)",
          outputNote:
            "This block intentionally crashes. The final error line names both shapes — read them right to left: the leading 3 = 3 pair matches, then 4 meets 5 and neither is 1. Collision found.",
          explain: [
            "The error message prints the shapes in the exact form NumPy saw them. Your debugging move is always the same: right-align the two tuples and walk inward until a pair neither matches nor holds a 1.",
            "Here: (3, 4) vs (3, 5). Pair the trailing axes: 4 vs 5 — mismatch, neither is 1, game over.",
            "The usual fixes: fix the data (one array was sliced wrong), transpose one side, reshape a flat vector into the row or column you actually meant, or drop/repeat a dimension until the pairs align.",
          ],
        },
        {
          kind: "heading",
          text: "Broadcasting never writes back",
        },
        {
          kind: "text",
          text: "The word *stretch* is a lie worth correcting immediately: nothing is ever stretched, copied into a bigger operand, or modified. Every broadcast operation **materializes a fresh result array** — a *temporary* — sized to the broadcast shape, and the operands come out untouched. Prove it:",
        },
        {
          kind: "code",
          title: "Operands survive the broadcast unchanged",
          code: `import numpy as np

m = np.ones((2, 3))
v = np.array([10.0, 20.0, 30.0])

result = m + v
print("m after:", m.tolist())
print("v after:", v.tolist())
print("result is a new (2, 3) array of", result.dtype, "values")
print("first row of result:", result[0])
`,
          output: `m after: [[1.0, 1.0, 1.0], [1.0, 1.0, 1.0]]
v after: [10.0, 20.0, 30.0]
result is a new (2, 3) array of float64 values
first row of result: [11. 21. 31.]`,
          outputNote:
            "m is still all 1.0 and v still holds [10.0, 20.0, 30.0]: the (2, 3) + (3,) broadcast built a NEW array and touched nothing else. Assignment (Lesson d-02's a[:, 0] = ...) is the only thing that writes into an existing array.",
          explain: [
            "`m + v` reads both operands, computes 6 sums into a new block, and returns it. If you do not keep the result, the work (and the temporary) evaporates.",
            "This is why broadcasting is safe to experiment with: you cannot corrupt an operand by combining it with a weirdly-shaped partner.",
          ],
        },
        {
          kind: "code",
          title: "The memory bill, counted by hand",
          code: `import numpy as np

# A broadcast result is a full array. Count its cost BEFORE you write the line:
print("one (1000, 1000) float64 temporary:", np.zeros((1000, 1000)).nbytes / 1e6, "MB")
`,
          output: `one (1000, 1000) float64 temporary: 8.0 MB`,
          outputNote:
            "One million elements at 8 bytes each: 8 MB, allocated and walked for a single intermediate result. The arithmetic is primary school — elements times itemsize — and it is the difference between a pipeline that runs and one that swaps.",
          explain: [
            "A (1000, 1000) grid plus a (1000,) row produces a (1000, 1000) result: 8 MB of temporary. Fine.",
            "The same pattern at (10000, 10000) would be 800 MB — for ONE intermediate value that exists only until the next line runs. Lesson e-02 shows the pairwise-distance version of this warning at 2.4 GB.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Broadcasting is free in code, honest in memory",
          text: "The one-liner hides the full-size temporary. Before broadcasting anything big, multiply the RESULT's element count by its itemsize: a (2000, 2000) float64 temporary is 32 MB; a (10000, 10000) one is 800 MB. Chained one-liners stack temporaries — the fix is either smaller chunks or letting the ufunc write into a preallocated buffer (the out= lever in Lesson e-04).",
        },
        {
          kind: "arrayViz",
          title: "The broadcasting lab — four operand pairs, live",
          mode: "broadcast",
          name: "a + b",
          caption:
            "Four presets with real values. 'Identical' pairs need no stretching at all. 'Column + row' stretches BOTH operands into the outer-product shape. 'Scalar-shaped' shows a (1, 1) grid — a scalar in grid clothing — stretching along both axes. 'Incompatible' is the (3, 4) + (3, 5) refusal: the rule table highlights the colliding dimension. Then use the shape checker at the bottom to try any pair of shapes you are unsure about — including 1-D shapes like 4, which the checker right-aligns exactly like NumPy.",
          presets: [
            {
              label: "identical (3,4)+(3,4)",
              a: [
                [0, 10, 20, 30],
                [40, 50, 60, 70],
                [80, 90, 100, 110],
              ],
              b: [
                [1, 1, 1, 1],
                [2, 2, 2, 2],
                [3, 3, 3, 3],
              ],
              note: "Every dimension matches, so nothing stretches. Broadcasting only kicks in when a dimension is 1 or missing — equal shapes are just the boring, common case.",
            },
            {
              label: "column + row (3,1)+(1,4)",
              a: [[1], [2], [3]],
              b: [[10, 20, 30, 40]],
              note: "The classic double stretch: the column fills out to the right (1 to 4), the row fills down (1 to 3), and the result is the outer-product shape (3, 4).",
            },
            {
              label: "scalar-shaped (2,3)+(1,1)",
              a: [
                [1, 2, 3],
                [4, 5, 6],
              ],
              b: [[10]],
              note: "A (1, 1) operand stretches along both axes — exactly what the plain scalar 10 would have done. Try it: replace the grid with the expression grid + 10 and you get the same numbers.",
            },
            {
              label: "incompatible (3,4)+(3,5)",
              a: [
                [0, 10, 20, 30],
                [40, 50, 60, 70],
                [80, 90, 100, 110],
              ],
              b: [
                [1, 1, 1, 1, 1],
                [2, 2, 2, 2, 2],
                [3, 3, 3, 3, 3],
              ],
              note: "This is the refusal from the error block above, in the flesh: read the shapes right to left — the 3 = 3 pair matches, then 4 meets 5 and neither is 1. NumPy raises: ValueError: operands could not be broadcast together with shapes (3,4) (3,5).",
            },
          ],
        },
        {
          kind: "text",
          text: "Two tools make the rule concrete when you want to *see* the stretching instead of imagining it. `np.broadcast_to` stretches ONE array to a target shape you name; `np.broadcast_arrays` stretches SEVERAL arrays against each other into their common shape. Both return **views with zero-copy strides** — which is also the best proof you will ever get that stretching copies nothing.",
        },
        {
          kind: "functionDoc",
          name: "np.broadcast_to",
          purpose: "Stretch an array up to a bigger shape as a read-only, zero-copy view — no data is ever copied, no matter how large the target.",
          signature: "np.broadcast_to(array, shape, subok=False)",
          purposeDetail:
            "Broadcasting normally happens invisibly inside an operation: the stretched operand exists for one expression and evaporates. np.broadcast_to makes that stretched operand explicit and inspectable. It hands you a view whose strides revisit the same bytes over and over — a (5, 3) view of a 3-element row stores 3 numbers, not 15 — and marks it read-only, because one write would otherwise need to land in several places at once. Use it to preview what broadcasting will produce, to hand a fixed-shape API the grid it demands, or to build a cheap repeating background.",
          params: [
            {
              name: "array",
              type: "array_like",
              required: true,
              description: "The array to stretch. Each of its dimensions must equal the target's size there, or be 1 (or missing) so it can stretch.",
              example: "np.array([2.0, 4.0, 8.0])",
            },
            {
              name: "shape",
              type: "tuple or int",
              required: true,
              description: "The desired shape. A single integer i is read as (i,). Must be broadcast-compatible with array's shape — np.broadcast_to(np.ones(3), (4, 3)) works; (4, 4) does not.",
              example: "(5, 3)",
            },
            {
              name: "subok",
              type: "bool",
              description: "Rare: keep subclass instances instead of forcing a plain ndarray.",
              example: "subok=False",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A read-only view with the requested shape, sharing the original's data. Its .base is the original array; writing into it raises ValueError.",
          },
          example: `import numpy as np

scale = np.array([2.0, 4.0, 8.0])        # three numbers: 24 bytes of storage
batch = np.broadcast_to(scale, (5, 3))   # a 15-element view of those 3

print(batch)
print("strides:", batch.strides)
`,
          exampleOutput: `[[2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]]
strides: (0, 8)`,
          commonMistakes: [
            {
              mistake: "Trying to write into the broadcast view.",
              why: "The view is read-only by design: element [2, 0] and element [0, 0] are the SAME memory, so a single write would have to land in several places at once. NumPy refuses with ValueError: assignment destination is read-only.",
              fix: "If you need a writable stretched array, take a copy: np.broadcast_to(a, shape).copy() — that materializes the full-size block and owns it.",
            },
            {
              mistake: "Assuming a big broadcast_to allocated big memory.",
              why: "It allocated nothing. Strides of 0 mean an axis step moves zero bytes — the (5, 3) view above stores exactly 3 floats.",
              fix: "Check .strides and .nbytes on the ORIGINAL for the true cost; count the target size only when you .copy() or pass it into an operation that materializes a result.",
            },
            {
              mistake: "Requesting a shape the rule refuses, like (3,) to (4,).",
              why: "broadcast_to applies the same equal-or-one rule as every operation: a 3 cannot become a 4, only a 1 (or a missing axis) stretches.",
              fix: "Right-align first: (3,) stretches to (4, 3), (1, 3), or (n, 3) — never to (4,) or (3, 4).",
            },
          ],
          related: [
            { name: "np.broadcast_arrays", relation: "The multi-operand sibling: stretches several arrays against each other to their common shape, instead of one array to a shape you name." },
            { name: "np.broadcast_shapes", relation: "Asks the rule for the RESULT SHAPE only — no arrays, no data, just the verdict. The cheapest way to check a plan." },
            { name: "ndarray.reshape", relation: "Re-walks the SAME elements as a new grid — legal only when the element count is identical. broadcast_to may repeat elements; reshape never does." },
          ],
          applications: [
            "Previewing exactly what a small operand becomes before using it in a big expression",
            "Feeding fixed-shape APIs (plotting grids, image backgrounds) a repeating pattern without allocating it",
            "Teaching and debugging broadcasting with zero memory cost — the strides tell the true story",
          ],
          notes:
            "The read-only flag is the honest design: a writable broadcast view would make single logical writes land in multiple physical places. Copying is the explicit opt-in to paying the full memory price.",
        },
        {
          kind: "code",
          title: "Zero-copy proof: the strides tell all",
          code: `import numpy as np

scale = np.array([2.0, 4.0, 8.0])        # shape (3,), 3 stored numbers
batch = np.broadcast_to(scale, (5, 3))   # shape (5, 3), SEES 15 numbers

print(batch)
print("stored numbers :", scale.size)
print("visible numbers:", batch.size)
print("strides        :", batch.strides)
`,
          output: `[[2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]
 [2. 4. 8.]]
stored numbers : 3
visible numbers: 15
strides        : (0, 8)`,
          outputNote:
            "15 visible elements, 3 stored, and the strides say why: moving down a row (axis 0) steps 0 bytes. The 'stretched' rows are the same three floats, revisited.",
          explain: [
            "`batch.strides` is (0, 8): a row-down moves zero bytes, a column-right moves one float64. That zero is what 'stretching copies nothing' looks like in hardware terms.",
            "This is a VIEW: change scale and batch changes with it — they are the same memory.",
          ],
        },
        {
          kind: "code",
          title: "The view is read-only (crash it once, on purpose)",
          code: `import numpy as np

batch = np.broadcast_to(np.array([1.0, 2.0, 3.0]), (4, 3))
batch[0, 0] = 99.0
`,
          expectError: "ValueError: assignment destination is read-only",
          outputNote:
            "This block intentionally crashes. Writing to one cell of a broadcast view would have to write the same value into every logical copy of that cell — NumPy forbids the ambiguity.",
          explain: [
            "The error is a feature: it stops a class of bugs where 'fixing one value' silently fixes a whole row or grid of them.",
            "Need it writable? .copy() first and pay the real memory price knowingly.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.broadcast_arrays",
          purpose: "Stretch any number of arrays against each other, all at once, into their common broadcast shape — so you can see exactly what an operation is about to combine.",
          signature: "np.broadcast_arrays(*args, subok=False)",
          purposeDetail:
            "When a long expression fails with 'operands could not be broadcast together', the missing information is: what would each operand have become? np.broadcast_arrays answers that. Give it the operands; it returns them all stretched to the shape they would share. The results are views (zero-copy, like np.broadcast_to), which makes this function nearly free to call while debugging. Day to day you rarely need it — operations broadcast internally — but when shapes mystify you, this is the x-ray machine.",
          params: [
            {
              name: "*args",
              type: "array_like",
              required: true,
              description: "The arrays to broadcast against each other. Their pairwise compatibility is decided by the same right-align, equal-or-one rule as any operation — one bad pair raises ValueError.",
              example: "x, y",
            },
            {
              name: "subok",
              type: "bool",
              description: "Rare: pass subclasses through instead of forcing plain ndarrays.",
              example: "subok=False",
            },
          ],
          returns: {
            type: "list of ndarray",
            description: "One view per input, all with the same broadcast shape. The views share memory with the originals and are not safe to write into.",
          },
          example: `import numpy as np

x = np.array([[1.0], [2.0], [3.0]])   # (3, 1) column
y = np.array([10.0, 20.0, 30.0])      # (3,) flat

bx, by = np.broadcast_arrays(x, y)
print(bx)
print(by)
print("both stretched to:", bx.shape)
`,
          exampleOutput: `[[1. 1. 1.]
 [2. 2. 2.]
 [3. 3. 3.]]
[[10. 20. 30.]
 [10. 20. 30.]
 [10. 20. 30.]]
both stretched to: (3, 3)`,
          commonMistakes: [
            {
              mistake: "Writing into the returned views.",
              why: "They are zero-copy stretched views of your originals (and NumPy marks writes to them deprecated): one logical cell is many physical cells of a shared operand.",
              fix: "Treat the output as read-only inspection. To keep working with the stretched data, .copy() the view you need.",
            },
            {
              mistake: "Using it to pre-stretch operands before every operation 'for clarity'.",
              why: "Operations already broadcast internally and more efficiently — pre-stretching allocates full-size intermediates that the operation would never have needed.",
              fix: "Use broadcast_arrays to INSPECT, then let the real expression do its own (zero-copy) broadcasting.",
            },
            {
              mistake: "Passing shapes (tuples) instead of arrays.",
              why: "It stretches ARRAYS. To ask about shapes only, the cheaper tool is np.broadcast_shapes((3, 1), (3,)).",
              fix: "Shapes only: np.broadcast_shapes. Actual stretched views: np.broadcast_arrays.",
            },
          ],
          related: [
            { name: "np.broadcast_to", relation: "Stretches ONE array to a shape you name — the single-operand version of this call." },
            { name: "np.broadcast_shapes", relation: "Returns just the common shape for any set of shape tuples — no arrays needed, ideal for a quick 'will this work?'" },
            { name: "np.add", relation: "Any ufunc: broadcasts its inputs internally, so most code never needs to pre-stretch anything." },
          ],
          applications: [
            "Debugging a failed combine: see both operands stretched to the shape the rule wanted",
            "Building aligned, same-shape grids for tests, plots, or side-by-side comparison",
            "Understanding what a (3, 1) column and a (3,) vector really do when they meet (the classic trap, x-rayed)",
          ],
          notes:
            "The returned views typically have 0-strides and share memory with the originals; more than one logical element can refer to a single stored value. Read them, do not write them.",
        },
        {
          kind: "code",
          title: "Asking the rule directly",
          code: `import numpy as np

# A price column (4, 1) and a tax-rate row (3,): compatible?
prices = np.array([[100.0], [200.0], [300.0], [400.0]])   # (4, 1)
rates = np.array([1.05, 1.10, 1.25])                      # (3,)

gross = prices * rates          # every price against every rate
print("result shape:", gross.shape)
print("row 0 (100.0 times each rate):", gross[0])

# The cheapest question of all -- just the verdict, no data moved:
print("the rule says:", np.broadcast_shapes((4, 1), (3,)))
`,
          output: `result shape: (4, 3)
row 0 (100.0 times each rate): [105. 110. 125.]
the rule says: (4, 3)`,
          outputNote:
            "(4, 1) times (3,) is (4, 3): the price column stretched right from 1 to 3, the flat rates stretched down from missing-axis to 4. And np.broadcast_shapes confirms it without touching any data — handy when the arrays are huge.",
          explain: [
            "`gross[0]` is 100.0 times each of the three rates — one price met every rate, because the column's 1-column axis stretched to 3.",
            "`np.broadcast_shapes` is the question form of the rule: feed it shape tuples, get the answer (or the same ValueError the operation would raise). Quiz yourself with it.",
          ],
        },
        {
          kind: "tryIt",
          title: "Predict the shape, then run",
          task: "Before pressing Run, write down your prediction for each of the five shapes. Then run and score yourself. When you are 5 for 5, change row4 to np.arange(3) and run again — grid + row4 now refuses; read the error out loud, right to left, and say WHICH dimension collided before NumPy tells you.",
          code: `import numpy as np

a = np.arange(3)                    # (3,)
row4 = np.arange(4) * 100           # (4,)
col = a.reshape(3, 1)               # (3, 1)
grid = np.arange(12).reshape(3, 4)  # (3, 4)

print("a + a      :", (a + a).shape)
print("grid + row4:", (grid + row4).shape)
print("grid + col :", (grid + col).shape)
print("grid + 5   :", (grid + 5).shape)
print("col + row4 :", (col + row4).shape)
`,
          hint:
            "Right-align every pair. For the failing one: (3, 4) meets (3,) — the trailing pair is 4 vs 3, and neither is 1.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Shapes align from the RIGHT; every dimension must be EQUAL or 1; a 1 (or a missing axis) stretches; scalars stretch anywhere; nothing ever stretches that is not a 1; operands are never modified — a fresh result is built, sized by the broadcast shape, and you can count its bytes before you write the line.",
        },
      ],
      terms: [
        { term: "Broadcasting", definition: "NumPy's rule for combining arrays of different shapes: right-align the shapes, every dimension pair must be equal or 1, and 1-sized (or missing) dimensions stretch to the partner's size." },
        { term: "Right-alignment", definition: "Reading shape tuples against each other from the TRAILING edge inward. A (3,) array meeting a (3, 4) grid is a ROW of 3, never a column — because the rule reads from the right." },
        { term: "Stretchable dimension", definition: "A dimension of size 1 (or a missing leading axis) — the only thing broadcasting ever stretches. Size 3 never becomes size 4." },
        { term: "Temporary", definition: "The fresh, full-size result array a broadcast operation materializes. Operands are never modified; the temporary exists until you keep or drop it." },
        { term: "Zero-copy view", definition: "An array interface over memory it does not own or duplicate — like np.broadcast_to's output, whose 0-strides revisit the same bytes instead of copying them." },
      ],
      mistakes: [
        {
          mistake: "Believing a (3,) array is a column vector.",
          why: "1-D arrays have no orientation — the rule right-aligns them, so (3,) pairs with the COLUMNS of a (n, 3) grid. Adding (3,) to (3, 1) therefore builds an addition table of shape (3, 3), not three sums and not an error.",
          fix: "Say the axis out loud: 'this is a row of 3'. When you mean a column, build one with reshape(3, 1) (or [:, None]) — and when you get a surprise (3, 3), check for exactly this trap.",
        },
        {
          mistake: "Expecting broadcasting to mutate the smaller operand into the bigger shape.",
          why: "The word 'stretch' suggests the operand grows. It never does: the operation reads both operands and materializes a NEW result; the inputs are untouched (verified in this lesson's operands-survive block).",
          fix: "Always capture the result: out = m + v. If you need the stretched form to persist, np.broadcast_to(...).copy() — and pay the memory knowingly.",
        },
        {
          mistake: "Writing a big broadcast line without counting the temporary.",
          why: "A (10000, 10000) intermediate is 800 MB of float64 — allocated silently for a value that may live for one line. Chained expressions stack these temporaries.",
          fix: "Before writing the line, multiply result elements by itemsize. If the bill is rude, chunk the work, reduce earlier, or reuse a preallocated buffer with out= (Lesson e-04).",
        },
      ],
      takeaways: [
        "Broadcasting in four moves: right-align the shapes; each dimension pair must be equal or 1; a 1 (or missing axis) stretches; a scalar stretches anywhere.",
        "The (3,) + (3, 1) trap produces a (3, 3) addition table — both operands stretch — and it is the same shape logic as the outer product.",
        "When shapes refuse, the ValueError names them both: right-align the tuples in the message and walk inward until a pair is neither equal nor 1.",
        "Nothing is copied and no operand is modified: every broadcast builds a fresh result sized by the broadcast shape.",
        "Count the temporary before you write the line: elements x itemsize. A (1000, 1000) float64 result is 8 MB; a (10000, 10000) one is 800 MB.",
      ],
      quiz: [
        {
          id: "e-01-q1",
          prompt: "`np.ones((3, 4)) + np.ones((4,))` — what is the result shape?",
          options: [
            { text: "(3, 4)", correct: true, feedback: "Right-align: (4,) pairs with the 4 columns, matching exactly, and its missing axis-0 stretches to 3. The row joins every row." },
            { text: "It raises ValueError — the shapes are different", correct: false, feedback: "Different is fine when the rule is satisfied: the trailing 4 = 4 pair matches and the missing leading axis counts as 1. Only unequal, non-1 pairs fail." },
            { text: "(4, 4)", correct: false, feedback: "Nothing grows the 3 into a 4 — only a 1 (or a missing axis) stretches, and the grid's axis-0 size 3 is neither." },
            { text: "(3,)", correct: false, feedback: "The result carries the broadcast shape — every dimension of BOTH operands at its stretched size — here (3, 4)." },
          ],
          explanation: "Right-align, walk inward: 4 = 4 matches; the missing axis stretches 1 to 3. Result (3, 4).",
        },
        {
          id: "e-01-q2",
          prompt: "`a = np.arange(3)`, `col = a.reshape(3, 1)`. What is `(a + col).shape`?",
          options: [
            { text: "(3, 3)", correct: true, feedback: "The classic trap, correctly predicted: (3,) acts as the row (1, 3); (1, 3) + (3, 1) stretches BOTH 1s, giving the outer-product shape (3, 3)." },
            { text: "It raises ValueError", correct: false, feedback: "Very reasonable guess — and wrong, which is exactly why this trap is famous. Both dimension pairs contain a 1, so the rule is satisfied." },
            { text: "(3,)", correct: false, feedback: "That would require (3,) + (3,) — a genuinely parallel pair. reshape(3, 1) makes col point the OTHER way." },
            { text: "(1, 3)", correct: false, feedback: "A 1 stretches UP to the partner's size, never stays 1 when the other side is bigger. Both axes end at 3." },
          ],
          explanation: "(3,) right-aligns as (1, 3); against (3, 1) both 1s stretch — result (3, 3), an every-element-against-every-element table.",
        },
        {
          id: "e-01-q3",
          prompt: "After `result = m + v` (shapes (2, 3) and (3,)), which statement is TRUE?",
          options: [
            { text: "A new (2, 3) array was built; m and v are both unchanged", correct: true, feedback: "Correct — verified in this lesson: broadcasting materializes a fresh temporary and never writes back into an operand." },
            { text: "v was stretched in place to shape (2, 3)", correct: false, feedback: "Nothing stretches IN PLACE — v still has shape (3,) and its three values. The stretching lives only in the new result." },
            { text: "m now contains the sums", correct: false, feedback: "m is untouched; the sums went into result. Writing into an existing array needs assignment (Lesson d-02), not an operator." },
            { text: "v and result share memory", correct: false, feedback: "result owns its own full-size block; only np.broadcast_to-style views share memory, and an operation's result is not one." },
          ],
          explanation: "Operators read operands and build a new result — the operands survive every broadcast unchanged.",
        },
      ],
    },

    // ------------------------------------------------------------- e-02
    {
      slug: "e-02",
      title: "Broadcasting at Work: Patterns You'll Reuse Forever",
      minutes: 18,
      summary:
        "The pattern library: center columns, normalize rows with keepdims, build outer products, add a bias to a whole batch, compute every pairwise distance at once, and standardize everything — each one proven in verified code with the shape reasoning said out loud.",
      kind: "concept",
      objectives: [
        "Center every column of a matrix and standardize all columns at once, each in a single broadcast line",
        "Explain why keepdims=True is the broadcast-friendly switch when you divide rows by their own norms",
        "Build an outer product two ways: with [:, None] broadcasting and with np.outer",
        "Add a per-class bias vector to a whole batch of scores in one line",
        "Compute a full pairwise distance matrix with a 3-D broadcast — and state its memory cost before running it",
      ],
      why: "The broadcasting rule from Lesson e-01 is small; its consequences are your daily bread. Almost every real dataset transformation — subtract a mean from each column, scale each row to unit length, score every sample against every class, measure every point against every other point — is ONE broadcasting line once you recognize the pattern. Recognizing patterns is faster than re-deriving the rule each time, and this lesson is the field guide: six patterns, each shown the slow loop way first, then the one-line broadcast way, with the shape reasoning spoken aloud. Master these six and you will read other people's NumPy code at full speed — most one-liners you will ever meet are these patterns wearing different names. The lesson also teaches the one switch (keepdims) that makes row-wise patterns possible at all, and the memory arithmetic that keeps the big patterns honest.",
      blocks: [
        {
          kind: "text",
          text: "Lesson e-01 gave you the rule. This lesson is the payoff: six named patterns that cover a startling share of the array code you will ever write. Each one gets the same treatment — *the loop you would have written*, then *the one-line broadcast*, then the shape reasoning said out loud — so the patterns stick as reflexes, not recipes you look up.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "How to read every pattern in this lesson",
          text: "Before the line, say the shapes: 'an (n, k) matrix meets a (k,) row — the row stretches down every row of the matrix, result (n, k).' If you can say the sentence, you can write the line. If you cannot, you have found the bug before running anything.",
        },
        {
          kind: "heading",
          text: "Pattern 1 — center every column",
        },
        {
          kind: "text",
          text: "The most common preprocessing step in data work: for each column, subtract that column's mean. The loop version walks the columns one at a time. The broadcast version computes all column means at once — `X.mean(axis=0)` is a shape (k,) row — and subtracts the whole row from the whole matrix in one expression.",
        },
        {
          kind: "code",
          title: "Before and after: centering X",
          code: `import numpy as np

X = np.array([[1.0, 10.0, 100.0],
              [2.0, 10.0, 200.0],
              [3.0, 10.0, 300.0],
              [6.0, 10.0, 600.0]])

# BEFORE: the loop you would have written (one column at a time)
looped = X.copy()
for c in range(X.shape[1]):
    looped[:, c] = looped[:, c] - X[:, c].mean()

# AFTER: one broadcast line
centered = X - X.mean(axis=0)

print("both give the same array:", np.array_equal(looped, centered))
print(centered)
print("column means are now:", np.round(centered.mean(axis=0), 10))
`,
          output: `both give the same array: True
[[  -2.    0. -200.]
 [  -1.    0. -100.]
 [   0.    0.    0.]
 [   3.    0.  300.]]
column means are now: [0. 0. 0.]`,
          outputNote:
            "The loop and the broadcast line agree exactly, and every column's mean is now 0. The shapes did all the work: (4, 3) minus (3,) — the mean row stretched down all four rows.",
          explain: [
            "`X.mean(axis=0)` collapses the rows (axis 0), leaving one mean per column: shape (3,), a row.",
            "`X - that row` broadcasts the (3,) against (4, 3): the row's missing axis-0 stretches to 4. Each column loses its own mean, all at once.",
            "`np.array_equal(looped, centered)` is the habit from Lesson a-02: a rewrite is only legal if the answers are identical.",
          ],
        },
        {
          kind: "heading",
          text: "Pattern 2 — divide every row by its own norm (keepdims)",
        },
        {
          kind: "text",
          text: "Now the rows: scale each row to length 1 (turning rows into directions — the heart of similarity search). The row norms are `np.linalg.norm(M, axis=1)` — but look at the shape: (n,), a ROW. A row cannot divide down the rows of the matrix! The fix is one keyword: **`keepdims=True`** keeps the collapsed axis at size 1, so the norms come out as a (n, 1) COLUMN — pointed exactly the way broadcasting needs.",
        },
        {
          kind: "code",
          title: "keepdims: the broadcast-friendly switch",
          code: `import numpy as np

M = np.array([[3.0, 4.0],
              [1.0, 0.0],
              [0.0, 2.0]])

collapsed = np.linalg.norm(M, axis=1)                 # (3,)   -- points the wrong way
kept      = np.linalg.norm(M, axis=1, keepdims=True)  # (3, 1) -- a real column

print("collapsed:", collapsed, collapsed.shape)
print("kept     :", kept.ravel(), kept.shape)

N = M / kept
print(N)
print("every row now has norm 1:", np.round(np.linalg.norm(N, axis=1), 10))
`,
          output: `collapsed: [5. 1. 2.] (3,)
kept     : [5. 1. 2.] (3, 1)
[[0.6 0.8]
 [1.  0. ]
 [0.  1. ]]
every row now has norm 1: [1. 1. 1.]`,
          outputNote:
            "The norms are the same numbers either way (5, 1, 2) — but only the (3, 1) version can divide the (3, 2) matrix: the column stretches across both columns while the rows stay put. Every resulting row has length 1.",
          explain: [
            "axis=1 collapses each row's columns into one norm per row. Without keepdims, the result is (3,) — which right-aligns as a row and refuses to pair with rows (you will crash it yourself two blocks down).",
            "keepdims=True keeps the collapsed axis at size 1: (3, 1). Now (3, 2) / (3, 1) broadcasts cleanly — the single column stretches right to 2.",
            "This one keyword is the difference between row-wise patterns working and not working. Part F makes friends with axis and keepdims across all of NumPy's reductions; today you only need this switch.",
          ],
        },
        {
          kind: "code",
          title: "The crash when you forget keepdims",
          code: `import numpy as np

M = np.array([[3.0, 4.0],
              [1.0, 0.0],
              [0.0, 2.0]])

norms = np.linalg.norm(M, axis=1)   # shape (3,) -- a row, but we wanted a column
print(M / norms)
`,
          expectError:
            "ValueError: operands could not be broadcast together with shapes (3,2) (3,)",
          outputNote:
            "This block intentionally crashes — the real error, exactly as NumPy 2.0.2 words it. Right-align (3, 2) with (3,): the trailing pair is 2 vs 3, neither is 1. The norms pointed the wrong way.",
          explain: [
            "The fix is keepdims=True on the norm call — then the shapes are (3, 2) and (3, 1) and the division flows.",
            "Read the two shapes in the error from the right: '2 meets 3' is the whole story. Lesson e-01's debugging move, earning its keep immediately.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The sneakiest failure is the one that does NOT crash",
          text: "On a SQUARE matrix, forgetting keepdims does not raise at all: a (3, 3) matrix divided by a (3,) row happily divides every ROW element-wise by that vector — the wrong math, shape-legal, silently wrong. There is no error to read; only the numbers are wrong. Keepdims is not decoration; it is the difference between 'crashes loudly' and 'ships the wrong answer'.",
        },
        {
          kind: "heading",
          text: "Pattern 3 — the outer product, two ways",
        },
        {
          kind: "text",
          text: "Lesson e-01's trap, promoted to a tool: build the matrix of EVERY element of u times EVERY element of v. The broadcasting spelling inserts new axes explicitly — `u[:, None]` is a (3, 1) column, `v[None, :]` is a (1, 4) row — and the two stretch into the (3, 4) grid of all pairs. `np.outer` is the same product with a name that says what it means.",
        },
        {
          kind: "code",
          title: "Every element against every element",
          code: `import numpy as np

u = np.array([1, 2, 3])
v = np.array([10, 20, 30, 40])

by_broadcasting = u[:, None] * v[None, :]   # (3, 1) * (1, 4) -> (3, 4)
by_function     = np.outer(u, v)

print(by_broadcasting)
print("identical to np.outer:", np.array_equal(by_broadcasting, np.outer(u, v)))
`,
          output: `[[ 10  20  30  40]
 [ 20  40  60  80]
 [ 30  60  90 120]]
identical to np.outer: True`,
          outputNote:
            "Row i holds u[i] times every element of v. The two spellings are interchangeable here — np.outer also flattens its inputs first, so it never surprises you with orientation (Lesson e-01's trap cannot happen to it).",
          explain: [
            "`u[:, None]` uses None (an alias for np.newaxis, Lesson d-01) to insert a new axis of size 1 — the explicit, readable way to aim a vector.",
            "The double-stretch signature from Lesson e-01 (a 1 where the other side is bigger, on BOTH axes) is exactly what makes this an outer product.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.outer",
          purpose: "Compute the outer product of two vectors: every element of the first times every element of the second, arranged as a matrix.",
          signature: "np.outer(a, b, out=None)",
          purposeDetail:
            "Given vectors of lengths M and N, np.outer builds the M x N matrix of all M*N pairs — the multiplication-table shape. It is the named, self-documenting spelling of the broadcast pattern u[:, None] * v[None, :] from this lesson, with one extra courtesy: both inputs are flattened first, so you never have to think about which way a 1-D array points. Outer products power cross-features in machine learning, sensitivity tables in finance, and any 'every option A against every option B' grid.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "First vector; becomes the ROWS of the result. Flattened if it is not already 1-D.",
              example: "np.array([1, 2, 3])",
            },
            {
              name: "b",
              type: "array_like",
              required: true,
              description: "Second vector; becomes the COLUMNS of the result. Also flattened.",
              example: "np.array([10, 20, 30, 40])",
            },
            {
              name: "out",
              type: "ndarray",
              description: "Optional preallocated (M, N) output buffer — the reuse-instead-of-allocate lever (Lesson e-04).",
              example: "out=result_buf",
            },
          ],
          returns: {
            type: "ndarray",
            description: "An (M, N) array where result[i, j] = a[i] * b[j] — every pair, nothing skipped.",
          },
          example: `import numpy as np

u = np.array([1, 2, 3])
v = np.array([10, 20, 30, 40])

print(np.outer(u, v))
print("same as broadcasting:",
      np.array_equal(np.outer(u, v), u[:, None] * v[None, :]))
`,
          exampleOutput: `[[ 10  20  30  40]
 [ 20  40  60  80]
 [ 30  60  90 120]]
same as broadcasting: True`,
          commonMistakes: [
            {
              mistake: "Assuming np.outer(u, v) equals np.outer(v, u).",
              why: "The outer product is NOT symmetric: swapping arguments transposes the result (rows and columns swap). With u of length 3 and v of length 4, the swapped call even produces a different SHAPE.",
              fix: "Remember 'first argument walks the rows'. If the orientation matters, check the result shape — or build it with broadcasting, where [:, None] makes the direction visible in the code.",
            },
            {
              mistake: "Confusing np.outer with np.dot.",
              why: "They are opposites: np.dot contracts a shared dimension (sums of products, shrinking data), np.outer expands into all pairs (products, growing data).",
              fix: "Ask 'do I want to combine pairwise (dot) or enumerate every pair (outer)?' Dot for projections and scores; outer for tables and grids.",
            },
            {
              mistake: "Passing 2-D arrays expecting element-wise behavior.",
              why: "np.outer flattens both inputs first (ravel), so a (2, 3) times a (2, 3) call quietly produces a 6 x 6 outer product — not an error, and not what you meant.",
              fix: "Reserve np.outer for genuinely 1-D inputs. If your data is 2-D and you meant element-wise multiplication, use * (with broadcasting if the shapes differ).",
            },
          ],
          related: [
            { name: "np.multiply.outer", relation: "The ufunc method underneath the same idea — works for ANY ufunc: np.add.outer builds all-pair SUM tables, np.subtract.outer builds difference tables." },
            { name: "np.dot", relation: "The contraction twin: sums over a shared axis instead of enumerating all pairs. Opposite direction of data flow." },
            { name: "np.kron", relation: "The Kronecker product — the block-matrix generalization of the outer product for 2-D operands." },
          ],
          applications: [
            "Sensitivity tables: every price step against every tax rate, one grid",
            "Polynomial feature crosses: every feature value against every other (a machine-learning staple)",
            "Building mask/basis grids where one axis enumerates one family of options and the other a second family",
          ],
          notes:
            "np.outer(a, b) is defined as a.ravel()[:, None] * b.ravel()[None, :] — flattening plus the broadcast pattern from this lesson. When you want the pattern WITHOUT flattening (keeping 2-D structure), write the broadcast form yourself.",
        },
        {
          kind: "heading",
          text: "Pattern 4 — add a bias vector to a whole batch",
        },
        {
          kind: "text",
          text: "A batch of model scores — say 8 samples x 3 classes — plus one bias per class. The biases form a (3,) row; the batch is (8, 3); the row stretches down all 8 samples. One line replaces a per-class loop (or, in the deep-learning world, a per-batch loop).",
        },
        {
          kind: "code",
          title: "One bias vector, applied to every sample",
          code: `import numpy as np

scores = np.arange(24, dtype=np.float64).reshape(8, 3)   # 8 samples, 3 classes
bias = np.array([0.0, -5.0, 10.0])                       # one bias per class

adjusted = scores + bias
print("shapes:", scores.shape, "+", bias.shape, "->", adjusted.shape)
print("first three samples after the bias:")
print(adjusted[:3])
`,
          output: `shapes: (8, 3) + (3,) -> (8, 3)
first three samples after the bias:
[[ 0. -4. 12.]
 [ 3. -1. 15.]
 [ 6.  2. 18.]]`,
          outputNote:
            "(8, 3) + (3,) -> (8, 3): the bias row joined all 8 samples at once. Sample 0's scores [0, 1, 2] became [0, -4, 12] — each class's bias landed on its own column.",
          explain: [
            "The bias vector must line up with the LAST axis (the classes). If your batch is (samples, classes) the bias is (classes,) — a row. If you stored it as (3, 1) by mistake, you would get the (8, 3) + (3, 1) broadcast... which also works here — both are 1-or-equal — but points a per-SAMPLE offset instead. Shapes decide meaning; say them first.",
            "This exact pattern is the 'add a bias term' step inside neural-network layers, logistic regression scoring, and every batch classifier you will ever meet.",
          ],
        },
        {
          kind: "heading",
          text: "Pattern 5 — every point against every point (pairwise distances)",
        },
        {
          kind: "text",
          text: "The flagship 3-D broadcast: for P points, build the P x P matrix of distances between every pair. The trick is `P[:, None, :]` — shape (P, 1, 2), a column OF POINTS — against `P[None, :, :]` — shape (1, P, 2), a row of points. Their difference is (P, P, 2): EVERY pair's coordinate difference, in one temporary. Then reduce the last axis (Part F's full story) and take a square root.",
        },
        {
          kind: "code",
          title: "The pairwise distance matrix, 4 points",
          code: `import numpy as np

P = np.array([[0.0, 0.0],
              [1.0, 0.0],
              [0.0, 1.0],
              [3.0, 4.0]])              # 4 points in 2-D

diff = P[:, None, :] - P[None, :, :]    # (4, 4, 2): every point against every point
D = np.sqrt((diff ** 2).sum(axis=2))    # (4, 4): euclidean distance per pair

print("temp shape:", diff.shape, " result shape:", D.shape)
print(np.round(D, 4))
`,
          output: `temp shape: (4, 4, 2)  result shape: (4, 4)
[[0.     1.     1.     5.    ]
 [1.     0.     1.4142 4.4721]
 [1.     1.4142 0.     4.2426]
 [5.     4.4721 4.2426 0.    ]]`,
          outputNote:
            "The diagonal is 0 (every point is zero away from itself), the matrix is symmetric, and distance(0, 3) is 5 — the classic 3-4-5 triangle, machine-checked. All 16 pair distances came from one broadcast expression.",
          explain: [
            "`P[:, None, :]` reshapes (4, 2) into (4, 1, 2): four 'rows', each holding ONE point. `P[None, :, :]` is (1, 4, 2): one 'row' holding four points. Their difference broadcasts to (4, 4, 2) — for every (i, j) pair, the x-and-y differences.",
            "`.sum(axis=2)` collapses the coordinate axis, leaving a (4, 4) matrix of squared distances; sqrt finishes the job.",
            "Sanity checks you should always run on a distance matrix: zero diagonal, symmetric, all non-negative. Two of the three are visible in the output.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Count the temporary before you scale this pattern",
          text: "The (P, P, 2) temporary grows with the SQUARE of the point count. At 4 points it is 32 floats — nothing. At 10,000 points in 3 dimensions it is 10,000 x 10,000 x 3 x 8 bytes = 2.4 GB of temporary, allocated silently, gone after the line finishes. The professional options: chunk the points (distance in blocks of rows), reduce earlier, or use scipy.spatial.distance.cdist, which never materializes the cube. The pattern is beautiful; the memory bill is arithmetic.",
        },
        {
          kind: "heading",
          text: "Pattern 6 — standardize everything at once",
        },
        {
          kind: "text",
          text: "The z-score: every column minus its own mean, divided by its own standard deviation. It is Pattern 1 plus one more broadcast — and together they turn columns of wildly different scales into comparable 'how many deviations from typical' readings. This exact line lives inside nearly every machine-learning preprocessing pipeline in existence.",
        },
        {
          kind: "code",
          title: "The z-score, one line plus its receipts",
          code: `import numpy as np

X = np.array([[1.0, 200.0],
              [2.0, 300.0],
              [3.0, 400.0],
              [4.0, 500.0]])

Z = (X - X.mean(axis=0)) / X.std(axis=0)

print(np.round(Z, 4))
print("column means:", np.round(Z.mean(axis=0), 10))
print("column stds :", np.round(Z.std(axis=0), 10))
`,
          output: `[[-1.3416 -1.3416]
 [-0.4472 -0.4472]
 [ 0.4472  0.4472]
 [ 1.3416  1.3416]]
column means: [0. 0.]
column stds : [1. 1.]`,
          outputNote:
            "Two different-shaped broadcasts stacked in one expression: minus a (2,) row of means, then divided by a (2,) row of stds. The receipts: every column's mean is 0 and std is 1 — standardized, verified.",
          explain: [
            "The mean and std rows both have shape (2,) and both stretch down the four rows. Same rule, twice, in one line.",
            "Notice the pattern generalizes: ANY column statistic computed with axis=0 comes out as a (k,) row that broadcasts against the whole matrix in one step.",
            "This Z is the exact quantity the mini project's repair report thresholds — 'more than 3 deviations from typical' is just |Z| > 3.",
          ],
        },
        {
          kind: "table",
          title: "The pattern library, one line each",
          headers: ["Pattern", "The line", "Shape story"],
          rows: [
            ["Center columns", "X - X.mean(axis=0)", "(n, k) - (k,) -> (n, k): the mean row stretches down"],
            ["Normalize rows", "M / np.linalg.norm(M, axis=1, keepdims=True)", "(n, k) / (n, 1) -> (n, k): each row's norm stretches across"],
            ["Outer product", "u[:, None] * v[None, :]", "(m, 1) * (1, n) -> (m, n): both stretch, all pairs"],
            ["Bias a batch", "scores + bias", "(s, c) + (c,) -> (s, c): the bias row joins every sample"],
            ["Pairwise distances", "np.sqrt(((P[:, None, :] - P[None, :, :]) ** 2).sum(axis=2))", "(p, 1, d) - (1, p, d) -> (p, p, d), then reduce to (p, p)"],
            ["Standardize", "(X - X.mean(axis=0)) / X.std(axis=0)", "two (n, k) / (k,) broadcasts stacked in one line"],
          ],
          caption:
            "Six patterns, six lines. Say the shape story before you type the line, and check the memory bill on the two that grow quadratically (outer, pairwise).",
        },
        {
          kind: "arrayViz",
          title: "The pattern lab — statistic rows and bias rows",
          mode: "broadcast",
          name: "X + row",
          caption:
            "Two of this lesson's patterns as live presets. 'Standardize' pairs the (4, 3) data grid with the (1, 3) row of column statistics — here the column MEANS, shown being added; subtracting that same row is Pattern 1's centering line, and dividing by the std row is the full z-score. 'Bias a batch' pairs a (4, 3) score grid with a (1, 3) bias row stretching down to every sample. In both, watch the stretch annotation: the row's axis-0 size 1 stretches to 4 — everything else already matches.",
          presets: [
            {
              label: "standardize: data + column-mean row",
              a: [
                [1, 10, 100],
                [2, 10, 200],
                [3, 10, 300],
                [6, 10, 600],
              ],
              b: [[3, 10, 300]],
              note: "The (1, 3) row holds one statistic per column (here: the column means of the grid — 3, 10, 300). The identical stretch powers X - means (centering) and (X - means) / stds (the full z-score): the row reaches every row of the data in one expression.",
            },
            {
              label: "bias: batch + per-class bias row",
              a: [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [9, 10, 11],
              ],
              b: [[0, -5, 10]],
              note: "A (4, 3) batch of scores plus a (1, 3) row of per-class biases: the row stretches down to all 4 samples. Each column gets exactly its own bias — the pattern behind every 'add the bias term' step in batch scoring.",
            },
          ],
        },
        {
          kind: "tryIt",
          title: "Center each city's week",
          task: "Run it, then push further: (1) standardize each city's week with the z-score line (divide by temps.std(axis=1, keepdims=True)); (2) explain in a comment why axis=1 and keepdims=True are both required here; (3) predict what np.round prints for city 0 BEFORE the second run. Notice every city's mean is exactly 0 after centering.",
          code: `import numpy as np

# Weekly high temperatures (C): 3 cities x 4 weeks
temps = np.array([[21.0, 23.0, 19.0, 24.0],
                  [28.0, 30.0, 27.0, 29.0],
                  [15.0, 17.0, 14.0, 18.0]])

# One broadcast line: subtract each city's own mean from that city's week
centered = temps - temps.mean(axis=1, keepdims=True)

print("each city's mean now:", np.round(centered.mean(axis=1), 10))
print("city 0, centered    :", centered[0])
`,
          hint:
            "axis=1 because each city's data lives along a ROW (axis 1 collapses columns); keepdims=True so the means come out (3, 1) and divide/subtract down the rows instead of across the columns.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Column statistics come out as (k,) rows and stretch down; row statistics need keepdims=True to come out as (n, 1) columns and stretch across. Outer products and bias adds are the same stretch in different clothes; the pairwise pattern is a 3-D double-stretch whose temporary you must budget in advance.",
        },
      ],
      terms: [
        { term: "Centering", definition: "Subtracting each column's (or row's) own mean from that column — the broadcast line X - X.mean(axis=0) — so every column's mean becomes 0." },
        { term: "keepdims", definition: "The reduction switch that keeps a collapsed axis at size 1 instead of removing it. It turns an (n,) result into an (n, 1) result — the shape broadcasting needs to work along rows." },
        { term: "Outer product", definition: "The (m, n) matrix of every element of one vector times every element of another: u[:, None] * v[None, :] or np.outer(u, v)." },
        { term: "Pairwise distance matrix", definition: "The (p, p) matrix holding the distance between every pair of points, built by broadcasting a (p, 1, d) column of points against a (1, p, d) row of points." },
        { term: "Standardization (z-score)", definition: "Per column: (x - mean) / std. Broadcast twice in one line; the result has column means 0 and stds 1, measured in deviations from typical." },
      ],
      mistakes: [
        {
          mistake: "Asking for column statistics with axis=1 (or row statistics with axis=0).",
          why: "axis names the axis that COLLAPSES. X.mean(axis=0) collapses rows and leaves one value per column; axis=1 collapses columns and leaves one value per row. Half of all wrong one-liners are this swap.",
          fix: "Say it as a sentence: 'axis=0 squashes the rows, so what's left is one per column.' If the sentence sounds wrong, the axis is wrong.",
        },
        {
          mistake: "Forgetting keepdims=True on row-wise norms or sums.",
          why: "The collapsed result is (n,), which right-aligns as a ROW. On a non-square matrix the division raises ValueError (shapes (n, k) vs (n,)); on a SQUARE matrix it silently computes the wrong thing — dividing across columns instead of within rows.",
          fix: "keepdims=True whenever the statistic will be combined with the array it came from. The crash is the lucky case; the silent wrong answer is the dangerous one.",
        },
        {
          mistake: "Scaling the pairwise-distance pattern to thousands of points without the memory arithmetic.",
          why: "The (p, p, d) temporary grows with the square of the points: 10,000 points in 3-D means 2.4 GB of float64 temporary, allocated mid-expression.",
          fix: "Multiply p x p x d x 8 bytes before writing the line. Past a few hundred million bytes, chunk the computation by row blocks or use a distance routine that never materializes the cube.",
        },
      ],
      takeaways: [
        "Column statistics (axis=0) come out as (k,) rows that stretch down the whole matrix in one expression — centering and standardizing are one line each.",
        "Row statistics need keepdims=True: (n, 1) columns stretch across the row; without it you get a crash on rectangles and silent wrong math on squares.",
        "The outer product is the (m, 1) x (1, n) double stretch — spelled u[:, None] * v[None, :] or np.outer(u, v), both meaning every pair.",
        "A (s, c) batch plus a (c,) bias row adjusts every sample at once — the bias-add step inside every batch scorer.",
        "The pairwise pattern broadcasts (p, 1, d) against (1, p, d) into a (p, p, d) temporary — budget its bytes (p squared times d times 8) before scaling it.",
      ],
      quiz: [
        {
          id: "e-02-q1",
          prompt: "You want every ROW of an (n, k) matrix divided by that row's own norm. Which line is correct?",
          options: [
            { text: "M / np.linalg.norm(M, axis=1, keepdims=True)", correct: true, feedback: "Right: axis=1 gives one norm per row, and keepdims=True keeps it as an (n, 1) column that stretches across each row's k columns." },
            { text: "M / np.linalg.norm(M, axis=1)", correct: false, feedback: "The norms come out as (n,), which right-aligns as a ROW — it raises ValueError on non-square matrices and silently does column-wise division on square ones." },
            { text: "M / np.linalg.norm(M, axis=0, keepdims=True)", correct: false, feedback: "axis=0 computes one norm per COLUMN — that stretches down the rows, not across them. You would be dividing by column norms." },
            { text: "np.outer(M, np.linalg.norm(M, axis=1))", correct: false, feedback: "The outer product enumerates all pairs — nothing to do with row-wise scaling, and it flattens the 2-D M besides." },
          ],
          explanation: "Row-wise patterns = collapse along axis 1 AND keepdims=True, so the (n, 1) result pairs with the rows it came from.",
        },
        {
          id: "e-02-q2",
          prompt: "`X - X.mean(axis=0)` on a (5, 3) matrix does what?",
          options: [
            { text: "Subtracts each column's mean from that entire column", correct: true, feedback: "Exactly: axis=0 leaves one mean per column, a (3,) row, which stretches down all 5 rows. Every column comes out with mean 0." },
            { text: "Subtracts each row's mean from that row", correct: false, feedback: "That would be axis=1 WITH keepdims=True — without them, the (5,) row means refuse to pair with the (5, 3) matrix at all." },
            { text: "Subtracts the single overall mean from all 15 entries", correct: false, feedback: "The overall mean is X.mean() with no axis — a scalar. This line computed per-column means; each column got its own." },
            { text: "Raises ValueError because (5, 3) and (3,) do not match", correct: false, feedback: "They do not need to match — they need to BROADCAST: the (3,) row's missing axis stretches to 5. This is Pattern 1, the friendliest broadcast in the library." },
          ],
          explanation: "axis=0 collapses rows, leaving a per-column (k,) row that broadcasts down the matrix — centering in one line.",
        },
        {
          id: "e-02-q3",
          prompt: "`u[:, None] * v[None, :]` with u of shape (3,) and v of shape (4,) produces shape:",
          options: [
            { text: "(3, 4)", correct: true, feedback: "Correct: (3, 1) against (1, 4) — both 1s stretch, giving every element of u times every element of v: the outer-product shape." },
            { text: "(4, 3)", correct: false, feedback: "That is v[:, None] * u[None, :] — the transposed arrangement. The first vector's None on the SECOND slot makes it the rows." },
            { text: "(3,)", correct: false, feedback: "Only parallel shapes (3,) * (3,) give (3,) — the explicit None axes guarantee a 2-D result here." },
            { text: "ValueError — (3, 1) and (1, 4) cannot combine", correct: false, feedback: "They combine beautifully: every dimension pair holds a 1, which is the stretch license. This is the double-stretch signature from Lesson e-01." },
          ],
          explanation: "Inserting None aims each vector — (3, 1) columns times (1, 4) rows gives the (3, 4) all-pairs grid.",
        },
      ],
    },

    // ------------------------------------------------------------- e-03
    {
      slug: "e-03",
      title: "Vectorization: Retiring the For Loop",
      minutes: 18,
      summary:
        "The loop-killer discipline — find the loop, find the array op: arithmetic loops become expressions, if/else chains become np.where, chained conditions become & and |, index-building becomes arange plus broadcasting, running totals become cumsum — every rewrite proven identical to the loop it replaced.",
      kind: "concept",
      objectives: [
        "Replace per-element arithmetic loops with one whole-array expression, and prove the rewrite identical with np.array_equal",
        "Replace if/else chains with np.where in both forms: the two-branch chooser and the one-branch locator",
        "Chain array comparisons with & and | — and explain why 0 < a < 1 crashes on arrays",
        "Replace index-building loops with arange plus broadcasting, and running-total loops with np.cumsum",
        "Judge honestly when a loop is still the right tool — and measure the speed claim instead of trusting it",
      ],
      why:
        "Loops are not wrong — they are Python's way of saying 'do this, then this, then this'. But when a loop body does the same numeric thing to every element, that loop is doing NumPy's job at Python's price: one interpreter visit per element, one type check per element, one new object per result. Vectorization is the discipline of recognizing those loops and handing the work to the machine built for it: find the loop, find the array op. This lesson walks the five loop families you will meet constantly — arithmetic, branching, chained conditions, index-building, running totals — and rewrites each one, proving every rewrite with an equality check (a rewrite without a proof is just a bug you have not met yet). It also marks the honest boundary: tiny arrays and non-numeric glue code are fine as loops; the wins arrive with numeric data and size, and the closing benchmark shows you how to measure that claim on your own machine instead of taking anyone's word for it.",
      blocks: [
        {
          kind: "text",
          text: "You already own the ingredients of this lesson — whole-array arithmetic you have used since Part A, and broadcasting from Lesson e-01. What is new is the *reading habit*. Think of a spreadsheet: you type `=B2*1.08` once and drag it down a thousand rows. You would never write a macro that visits each cell in turn — the formula itself says what happens everywhere. **Vectorization** is dragging the formula down: express the operation once, for the whole array, and let NumPy apply it to every element in compiled code. This lesson turns five families of loops into their array spellings — and proves, every single time, that the rewrite computes exactly what the loop computed.",
        },
        {
          kind: "heading",
          text: "The discipline: find the loop, find the array op",
        },
        {
          kind: "steps",
          title: "Four questions, every time",
          items: [
            "**Spot the loop.** Any `for` whose body touches one element (or one row, one column) at a time is a candidate.",
            "**Classify the body.** What does ONE iteration do? Arithmetic on the element, a branch, a comparison chain, building an index, or carrying a running value — each family has a fixed array replacement.",
            "**Find the array op.** Operators, `np.where`, `&`/`|`, `arange` with broadcasting, `np.cumsum` — the five replacements this lesson teaches.",
            "**Prove the rewrite.** Compare loop and array results with `np.array_equal` (or `np.allclose` for floats). A rewrite is only legal if the answers are identical.",
          ],
        },
        {
          kind: "text",
          text: "Family one is the easiest: the loop body does arithmetic to each element. The array expression is the same arithmetic, written once — the operators you already know do the rest.",
        },
        {
          kind: "code",
          title: "Family 1 — arithmetic: the loop, then the expression",
          code: `import numpy as np

celsius = np.array([17.0, 19.5, 21.0, 18.5, 25.0, 16.5])

# BEFORE: the loop you would have written
looped = []
for c in celsius:
    looped.append(c * 9 / 5 + 32)

# AFTER: one array expression -- same arithmetic, no per-element Python
vectorized = celsius * 9 / 5 + 32

print("identical results:", np.array_equal(np.array(looped), vectorized))
print(vectorized)
`,
          output: `identical results: True
[62.6 67.1 69.8 65.3 77.  61.7]`,
          outputNote:
            "True, then the same six Fahrenheit values the loop produced — 17 C became 62.6 F, 25 C became 77 F. The expression `celsius * 9 / 5 + 32` is literally the formula, applied to every element at once.",
          explain: [
            "The loop reads each element, does Python-level arithmetic, and appends a new float object per result — six interpreter visits for six numbers, six million for six million.",
            "The array version hands the whole block to compiled code: one pass, fixed work per element, one result array allocated once.",
            "`np.array_equal` is the discipline's receipt. Keep writing it until you trust the pattern — then keep writing it anyway, because data changes.",
          ],
        },
        {
          kind: "heading",
          text: "The branch killer: np.where",
        },
        {
          kind: "text",
          text: "Family two is the one people think impossible: the loop body *decides something* per element — pass or fail, hot or mild, keep or replace. The replacement is **`np.where`**, and it comes in two forms. The **two-branch form** — `np.where(condition, x, y)` — is an if/else for every element at once: take `x` where the condition is True, `y` where it is False.",
        },
        {
          kind: "code",
          title: "Family 2 — branches: if/else becomes one expression",
          code: `import numpy as np

scores = np.array([88, 42, 95, 57, 73, 61])

# BEFORE: a branch per element, labels appended one at a time
looped = []
for s in scores:
    if s >= 60:
        looped.append("pass")
    else:
        looped.append("fail")

# AFTER: np.where -- the branch, applied to every element at once
labels = np.where(scores >= 60, "pass", "fail")

print("identical labels:", np.array_equal(np.array(looped), labels))
print(labels)
`,
          output: `identical labels: True
['pass' 'fail' 'pass' 'fail' 'pass' 'pass']`,
          outputNote:
            "The loop and the one-liner agree: 88, 95, 73 and 61 pass; 42 and 57 fail. No loop, no append, no branch executed six times — one boolean array decided everything.",
          explain: [
            "`scores >= 60` builds a boolean array — the condition, evaluated for all elements at once (Lesson d-04's questions, now doing work).",
            "`np.where` reads that mask and assembles the answer: the `x` value wherever True, the `y` value wherever False. Both branches are plain values here, but they can be whole arrays too.",
            "The result is a fresh array of the broadcast shape — `np.where` never modifies its inputs.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.where",
          purpose: "Choose per element between two values based on a boolean condition — or, with no values given, report where the condition is True.",
          signature: "np.where(condition, [x, y], /)",
          purposeDetail:
            "np.where is the vectorized if/else. Given a boolean array and two candidate values (scalars or arrays), it returns a new array that takes from x wherever the condition is True and from y wherever it is False — the branch decided for every element at once, in compiled code. The one-argument form, np.where(condition), answers a different question: WHERE is it true? It returns a tuple of index arrays pointing at the True positions — the same cells boolean indexing would select, but as coordinates you can reuse. Between the two forms, np.where replaces most per-element branching in data code; ladders of conditions are built by nesting it (or by np.select).",
          params: [
            {
              name: "condition",
              type: "array_like of bool",
              required: true,
              description: "The decision, element by element. Usually a comparison expression like `scores >= 60` or a compound one like `(a > 0) & (a < 1)` — parentheses required, because Python's and/or do not work on arrays.",
              example: "scores >= 60",
            },
            {
              name: "x",
              type: "array_like",
              description: "What to take where the condition is True. Scalars and arrays both work; x, y and the condition are broadcast against each other (Lesson e-01's rule).",
              example: '"pass" or 1.0',
            },
            {
              name: "y",
              type: "array_like",
              description: "What to take where the condition is False. Omit both x and y to get the locator form instead: a tuple of index arrays of the True cells.",
              example: '"fail" or 0.0',
            },
          ],
          returns: {
            type: "ndarray or tuple of ndarrays",
            description: "With x and y: a new array, broadcast shape of all three inputs, choosing x on True and y on False. With only condition: a tuple with one index array per dimension, listing the True positions.",
          },
          example: `import numpy as np

temps = np.array([18.0, 27.5, 31.0, 22.0])

# two-branch form: a value chosen per element
print(np.where(temps > 25.0, "hot", "mild"))

# the branches can be arrays too -- keep the value, or zero it out
print(np.where(temps > 25.0, temps, 0.0))
`,
          exampleOutput: `['mild' 'hot' 'hot' 'mild']
[ 0.  27.5 31.   0. ]`,
          commonMistakes: [
            {
              mistake: "Writing `and` / `or` (or a chained comparison like `0 < a < 1`) inside the condition.",
              why: "Python's and/or need a single True/False, but an array comparison produces an ARRAY of booleans, and Python refuses to call it truthy: ValueError: The truth value of an array with more than one element is ambiguous.",
              fix: "Use the elementwise operators & and |, and parenthesize every comparison: np.where((a > 0) & (a < 1), a, 0).",
            },
            {
              mistake: "Expecting np.where to modify the original array.",
              why: "It builds and returns a NEW array, exactly like every other operation; the inputs survive untouched.",
              fix: "Capture the result: labels = np.where(...). To change an array in place, assign through indexing (Lesson d-02): a[a < 0] = 0.",
            },
            {
              mistake: "Assuming the one-argument form returns the selected values.",
              why: "np.where(mask) returns a tuple of INDEX arrays — coordinates, not values. It is the question 'where?', not 'what?'.",
              fix: "To get values, index with the mask (temps[mask]) or with the returned coordinates (temps[np.where(mask)]) — same cells either way.",
            },
          ],
          related: [
            { name: "np.select", relation: "The multi-branch ladder: a list of conditions and a list of results, first match wins — cleaner than deeply nested where." },
            { name: "np.nonzero", relation: "The one-argument form's official spelling — np.where(mask) is documented as shorthand for np.asarray(mask).nonzero()." },
            { name: "np.clip", relation: "The two-sided clamp in one call — equivalent to nested wheres that floor at a minimum and cap at a maximum." },
            { name: "np.maximum", relation: "The elementwise max — the cheapest possible 'clamp at zero from below' when the false branch is the input itself." },
          ],
          applications: [
            "Threshold reports: pass/fail, hot/mild, OK/REVIEW — one line instead of a branching loop",
            "Sanitizing data: replace invalid readings with 0, a sentinel, or the column mean without touching the valid ones",
            "Locating hits: the one-branch form returns the coordinates of every True, ready for fancy indexing or plotting",
          ],
          notes:
            "Part G gives where and its searching cousins (nonzero, searchsorted, argwhere) the full treatment — including why the tuple of index arrays is shaped the way it is.",
        },
        {
          kind: "code",
          title: "The one-branch form: where is it true?",
          code: `import numpy as np

temps = np.array([21.3, 29.8, 31.2, 27.5, 33.9, 30.0, 28.4])

hot = temps > 30.0            # a boolean mask (Lesson d-04)
where_hot = np.where(hot)     # ONE-branch form: WHERE is it true?

print("mask        :", hot)
print("true at     :", where_hot[0])
print("values there:", temps[where_hot])
print("same cells as boolean indexing:", np.array_equal(temps[hot], temps[where_hot]))
`,
          output: `mask        : [False False  True False  True False False]
true at     : [2 4]
values there: [31.2 33.9]
same cells as boolean indexing: True`,
          outputNote:
            "Two days broke 30: indexes 2 and 4, values 31.2 and 33.9 — and indexing with those coordinates selects exactly the same cells the mask selects. The one-branch form answers 'where?', boolean indexing answers 'what?' — two views of one question.",
          explain: [
            "The mask says WHICH elements passed; np.where(mask) says WHERE they live — a tuple of index arrays (here just one, for the only axis).",
            "Both spellings select the same cells, so pick by what you need: values to work with (mask) or coordinates to reuse (indexes).",
          ],
        },
        {
          kind: "text",
          text: "Ladders of conditions nest: `np.where(s >= 80, \"A\", np.where(s >= 70, \"B\", ...))` reads inside-out like a chain of elifs. Two levels are fine; past three, `np.select` says the same thing as a clean condition/result table. Exercise e-i3 has you build the grade ladder both ways.",
        },
        {
          kind: "heading",
          text: "Comparisons that chain: & and |",
        },
        {
          kind: "text",
          text: "Ranges need two comparisons at once — 'at least 15 and at most 22'. In a Python loop you would write `15 <= r <= 22` or `r >= 15 and r <= 22`. On arrays, both spellings crash, for the same deep reason: Python's `and`/`or` and the chained-comparison sugar need ONE yes-or-no answer, but an array comparison produces an ARRAY of answers. Lesson d-04 taught the fix; here it is doing real work inside expressions.",
        },
        {
          kind: "code",
          title: "The chained-comparison crash, on purpose",
          code: `import numpy as np

a = np.array([0.1, 0.5, 0.9, 1.5])
print(0 < a < 1)
`,
          expectError:
            "ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()",
          outputNote:
            "This block intentionally crashes. Python evaluates 0 < a first — fine, that is a boolean array — then tries bool(that array) to decide the chain, and NumPy refuses: which element's truth should speak for all of them?",
          explain: [
            "The message names the design decision: an array of many booleans is ambiguous as a single condition, so NumPy makes you say what you mean — elementwise, or collapsed with .any() / .all().",
            "Chained comparisons are sugar for `and` — and `and` is exactly the part arrays cannot honor. The elementwise operators can.",
          ],
        },
        {
          kind: "code",
          title: "The array spelling: compare, then AND the masks",
          code: `import numpy as np

a = np.array([0.1, 0.5, 0.9, 1.5])

in_range = (0 < a) & (a < 1)     # two elementwise comparisons, AND-ed elementwise
print(in_range)
print("count in range:", np.count_nonzero(in_range))
print("count outside :", np.count_nonzero(~in_range))
print("every value in [0, 1)?", in_range.all())
`,
          output: `[ True  True  True False]
count in range: 3
count outside : 1
every value in [0, 1)? False`,
          outputNote:
            "Three of the four values fall in [0, 1); 1.5 does not. The mask is a real array you can count with, invert with ~, collapse with .all(), or hand to np.where — this one line replaces a loop with two ifs in it.",
          explain: [
            "Parentheses are not decoration: & binds tighter than comparisons, so `0 < a & a < 1` would try to AND the array with itself BEFORE comparing. Parenthesize every comparison, always.",
            "`&` and `|` compute AND/OR per element — boolean arrays in, boolean array out. `~` inverts. These are the array spellings of and/or/not.",
            "`.all()` and `.any()` are the honest bridges back to single-boolean questions when you really do want one answer.",
          ],
        },
        {
          kind: "heading",
          text: "Index-building loops: arange with broadcasting",
        },
        {
          kind: "text",
          text: "Family four: loops whose job is to BUILD an array — powers of x, coordinates, grids. The replacement is `np.arange` for the running number, plus the `[:, None]` aiming you learned in Lesson e-02. The classic example is a matrix of polynomial features: row i holds x[i] raised to every degree from 0 to 3.",
        },
        {
          kind: "code",
          title: "Family 4 — index-building: the powers grid",
          code: `import numpy as np

x = np.array([2.0, 3.0, 5.0, 7.0])

# BEFORE: a loop that builds each row of powers, one degree at a time
rows = []
for value in x:
    rows.append([value ** d for d in range(4)])

# AFTER: one broadcast expression -- (4, 1) ** (1, 4) -> (4, 4)
degrees = np.arange(4)
by_broadcast = x[:, None] ** degrees[None, :]

print("identical:", np.array_equal(np.array(rows), by_broadcast))
print(by_broadcast)
`,
          output: `identical: True
[[  1.   2.   4.   8.]
 [  1.   3.   9.  27.]
 [  1.   5.  25. 125.]
 [  1.   7.  49. 343.]]`,
          outputNote:
            "Row 2 reads [1, 5, 25, 125]: powers of 5, exactly what the nested loop built. The column vector of values met the row vector of degrees, and the (4, 1) x (1, 4) double stretch did the rest — the outer-product shape from Lesson e-02, applied to exponentiation.",
          explain: [
            "`np.arange(4)` replaces `range(4)` as the source of running numbers — it is an array, so it can broadcast.",
            "`x[:, None]` aims the values down as a (4, 1) column; `degrees[None, :]` aims the exponents across as a (1, 4) row. Every value meets every degree.",
            "This exact grid is the Vandermonde matrix behind polynomial regression — real machine learning pipelines build it with precisely this line.",
          ],
        },
        {
          kind: "heading",
          text: "Running totals: cumsum",
        },
        {
          kind: "text",
          text: "Family five: loops that CARRY something — a total so far, a position, a balance. The array replacement is the cumulative family, and the flagship is `np.cumsum`: element k of the result is the sum of the first k+1 elements. Part F teaches the whole cumulative toolbox; today you meet the one you will use weekly.",
        },
        {
          kind: "code",
          title: "Family 5 — running values: the carried total",
          code: `import numpy as np

rain = np.array([0.0, 2.1, 0.0, 5.4, 1.2, 0.0, 8.3])   # mm per day

# BEFORE: a loop carrying a running total
running = []
total = 0.0
for r in rain:
    total += r
    running.append(total)

# AFTER: one call -- the cumulative sum
print("identical:", np.array_equal(np.array(running), np.cumsum(rain)))
print(np.round(np.cumsum(rain), 2))
`,
          output: `identical: True
[ 0.   2.1  2.1  7.5  8.7  8.7 17. ]`,
          outputNote:
            "The week's running rainfall: 0, 2.1, 2.1, 7.5, 8.7, 8.7, 17.0 mm — every intermediate total preserved, exactly what the carried variable accumulated. The final total is the last element, 17.0.",
          explain: [
            "`np.cumsum` keeps EVERY intermediate sum — it is not a reduction to one number (that is `.sum()`), it is the whole trajectory.",
            "The last element of a cumsum is always the total: `np.cumsum(rain)[-1] == rain.sum()`. Part F adds the siblings: cumprod, and the ufunc-method generalization in Lesson e-04.",
          ],
        },
        {
          kind: "heading",
          text: "The reward: pipelines that read like the math",
        },
        {
          kind: "text",
          text: "Apply the discipline twice in a row and whole preprocessing pipelines collapse to single lines. Here is a sensor matrix z-scored the loop way — a mean and a standard deviation per column, then a pass over every cell — and then the one-line array version. The two-branch thinking is gone; the line IS the formula from the statistics textbook.",
        },
        {
          kind: "code",
          title: "The z-score pipeline: triple loop vs one line",
          code: `import numpy as np

# Four days x three sensors -- wildly different units, one z-score line
X = np.array([[18, 55, 1013],
              [21, 48, 1005],
              [19, 62, 1010],
              [25, 45, 998]], dtype=np.float64)

# BEFORE: the z-score as a loop -- a mean and std per column, a pass per cell
looped = np.empty_like(X)
for c in range(X.shape[1]):
    m = X[:, c].mean()
    s = X[:, c].std()
    for r in range(X.shape[0]):
        looped[r, c] = (X[r, c] - m) / s

# AFTER: one line -- the statistics rows (Pattern 6, Lesson e-02) do the looping
Z = (X - X.mean(axis=0)) / X.std(axis=0)

print("identical:", np.allclose(looped, Z))
print(np.round(Z, 2))
r, c = np.unravel_index(np.abs(Z).argmax(), Z.shape)
print("largest |deviation|: day", r, "sensor", c, "->", round(Z[r, c], 2), "stds")
`,
          output: `identical: True
[[-1.03  0.38  1.14]
 [ 0.09 -0.68 -0.26]
 [-0.65  1.44  0.62]
 [ 1.59 -1.14 -1.5 ]]
largest |deviation|: day 3 sensor 0 -> 1.59 stds`,
          outputNote:
            "np.allclose says the triple loop and the one-liner agree (float-for-float equality is too strict a demand for division — close enough is the honest standard). The largest deviation anywhere is day 3, sensor 0: Thursday's temperature ran 1.59 standard deviations above typical.",
          explain: [
            "One line replaced a loop-per-column nested inside a loop-per-cell. The shapes did the bookkeeping: a (3,) row of means and a (3,) row of stds, each stretching down the four rows.",
            "Reading a z-grid is now a skill you have: every value is 'how many deviations from typical', positive above, negative below.",
            "`np.unravel_index(np.abs(Z).argmax(), Z.shape)` is the idiom for 'where is the most extreme value?' — argmax gives the flat position, unravel_index turns it into (row, col) coordinates.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Reading a z-scored grid, cell by cell",
          mode: "explore",
          name: "Z",
          caption:
            "The exact grid the block above computed, rounded to 2 decimals: four days (rows) x three sensors (columns), every value in deviations from its own column's typical. Click cells and read them as sentences: Tuesday's humidity is 0.68 deviations BELOW typical; Wednesday's humidity is 1.44 ABOVE. The most extreme cell is day 3, temperature, +1.59. Notice what z-scoring bought: three sensors with units of degrees, percent, and hectopascals now share one scale.",
          data: [
            [-1.03, 0.38, 1.14],
            [0.09, -0.68, -0.26],
            [-0.65, 1.44, 0.62],
            [1.59, -1.14, -1.5],
          ],
          labels: {
            rows: ["mon", "tue", "wed", "thu"],
            cols: ["temp", "humidity", "pressure"],
          },
          dtype: "float64",
        },
        {
          kind: "table",
          title: "The loop-family field guide",
          headers: ["Loop body does...", "Array replacement", "Taught"],
          rows: [
            ["Arithmetic on each element", "operators: a * 9 / 5 + 32", "Part A, family 1 above"],
            ["if / else per element", "np.where(cond, x, y)", "family 2 above"],
            ["Two comparisons, one range", "(a >= lo) & (a <= hi)", "family 3 above, Lesson d-04"],
            ["Builds powers / grids / coordinates", "np.arange plus [:, None] broadcasting", "family 4 above"],
            ["Carries a running total", "np.cumsum (cumprod for products)", "family 5 above, Part F"],
            ["Counts matches", "np.count_nonzero(mask)", "family 3 above"],
            ["Clamps each element", "np.maximum / np.minimum / np.clip", "tryIt below"],
          ],
          caption:
            "Five families cover the overwhelming majority of numeric loops. When a loop does NOT fit any family — genuinely sequential logic, early exits, non-numeric work — keep the loop. The discipline is judgment, not dogma.",
        },
        {
          kind: "heading",
          text: "Is it faster? Measure, then believe",
        },
        {
          kind: "text",
          text: "Vectorized code is not magically faster in all cases: on a handful of elements, NumPy's per-call overhead can lose to a plain loop. The honest claim is that on large numeric data the array form wins by a lot — and honest claims get measured. Raw milliseconds differ machine to machine, so the verified block below prints only stable facts: the answers agree, and the loop took over three times as long (best of three runs each). The playground lets you print your own raw milliseconds.",
        },
        {
          kind: "code",
          title: "The claim, measured as stable facts",
          code: `import numpy as np
import time

n = 500_000
weights = np.linspace(1.0, 2.0, n)

def best_of(task, reps=3):
    """Keep the fastest of a few tries -- never trust one measurement."""
    times = []
    for _ in range(reps):
        start = time.perf_counter()
        task()
        times.append(time.perf_counter() - start)
    return min(times)

def loop_way():
    out = []
    for w in weights:
        out.append(w * w + 1)
    return out

def array_way():
    return weights * weights + 1

loop_s = best_of(loop_way)
array_s = best_of(array_way)

print("same answers :", np.array_equal(np.array(loop_way()), array_way()))
print("loop over 3x slower than vectorized:", loop_s > 3 * array_s)
`,
          output: `same answers : True
loop over 3x slower than vectorized: True`,
          outputNote:
            "Both facts are stable: the two methods compute identical answers, and the loop needed more than three times the vectorized time on the same machine (the honest ratio at half a million elements is usually far higher — 3x is a deliberately cautious threshold, best-of-3 on each side).",
          explain: [
            "best-of-3 is the professional habit from Part A: the first run of any code pays warm-up costs, so the minimum is the honest 'how fast can this go' number.",
            "The threshold is conservative on purpose. A claim you can only reproduce on a fast machine is not a claim — this one holds anywhere the code runs.",
            "Flip it around in the playground: at n = 10 the loop can win outright. Vectorize numeric data at scale; do not ritual-vectorize five elements.",
          ],
        },
        {
          kind: "tryIt",
          title: "Clamp a sensor, three ways",
          task: "Run it, then extend: (1) rewrite the clamp with np.maximum(readings, 0.0) and check it agrees; (2) clamp to the range [0, 10] instead — np.minimum(np.maximum(readings, 0.0), 10.0), or one np.clip call (its card is in Part F); (3) predict how many readings survive untouched (still equal to their original values) BEFORE you print a count. Then try `np.where(readings < 0, readings, readings * 10)` and explain in a comment which readings got scaled and why.",
          code: `import numpy as np

readings = np.array([12.5, -3.2, 8.0, -0.5, 4.4, -9.9])

# A clamp-at-zero, the where way
clamped = np.where(readings < 0, 0.0, readings)
print(clamped)
print("same as np.maximum(readings, 0):", np.array_equal(clamped, np.maximum(readings, 0.0)))
print("how many were negative:", np.count_nonzero(readings < 0))
`,
          hint:
            "For the [0, 10] clamp, apply maximum first (raise the floor), then minimum (cap the ceiling). For the where experiment: readings < 0 is False everywhere negative... so which branch ran for THEM? Read the condition again before answering.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Find the loop, find the array op: arithmetic becomes operators, if/else becomes np.where, range checks become (a > lo) & (a < hi) with parentheses, index-building becomes arange plus broadcasting, running totals become cumsum. Prove every rewrite with array_equal — and keep loops for the genuinely sequential work, measuring before you believe any speed claim.",
        },
      ],
      terms: [
        { term: "Vectorization", definition: "The discipline of expressing a per-element computation as one whole-array operation, letting compiled code do the iteration: find the loop, find the array op, prove the answers identical." },
        { term: "Vectorized conditional", definition: "np.where: the branch decided for every element at once. Two-branch form chooses between x and y by a boolean array; one-branch form returns the coordinates where a condition is True." },
        { term: "Elementwise logical operators", definition: "& (and), | (or), ~ (not) for boolean arrays — per-element combinations of masks. Parenthesize every comparison around them; Python's and/or/refuse arrays entirely." },
        { term: "Chained comparison trap", definition: "0 < a < 1 evaluates 0 < a into a boolean ARRAY, then tries to use it as a single condition — ValueError: The truth value of an array is ambiguous. The array spelling is (0 < a) & (a < 1)." },
        { term: "Cumulative sum", definition: "np.cumsum: element k of the result is the sum of the first k+1 inputs — the running total a loop would carry, preserved as a whole array. The last element is the total." },
      ],
      mistakes: [
        {
          mistake: "Writing 0 < a < 1, or combining array comparisons with and/or.",
          why: "Chained comparisons and and/or need one yes-or-no answer; an array comparison produces an array of them, and NumPy refuses to pick a spokesman: ValueError: The truth value of an array with more than one element is ambiguous.",
          fix: "One comparison per pair of parentheses, joined elementwise: (0 < a) & (a < 1) — and .any() / .all() when you genuinely want a single boolean.",
        },
        {
          mistake: "Expecting np.where to fix the array it reads.",
          why: "where returns a NEW array built from its inputs; like every operation in this course it never writes back into an operand (Lesson e-01 proved the same for broadcasting).",
          fix: "Capture the result: cleaned = np.where(cond, x, y). If you truly want in-place, assign through boolean indexing: a[a < 0] = 0 (Lesson d-04).",
        },
        {
          mistake: "Believing vectorized always means faster.",
          why: "NumPy pays a per-call overhead: on tiny arrays a plain loop can win, and loops remain the right tool for sequential logic, early exits, and non-numeric glue. The speed claim is about numeric data at size.",
          fix: "Measure with best-of-3 timing before and after (Part A's method), and keep the array_equal proof attached: a fast wrong answer is still wrong.",
        },
      ],
      takeaways: [
        "The discipline is four questions: spot the loop, classify the body, find the array op, prove the rewrite with array_equal.",
        "np.where(cond, x, y) is the branch killer — pass/fail labels, sanitizing, and clamps in one expression; np.where(mask) is its locator twin returning index arrays.",
        "Range checks chain with & and |, never with and/or or 0 < a < 1 — parentheses around every comparison, always.",
        "Index-building loops become arange plus [:, None] broadcasting; running totals become cumsum; the outer-product shape is the signature of the former.",
        "Vectorization pays on numeric data at size; keep loops for sequential and non-numeric work, and measure — stable booleans, best-of-3 — before quoting any speed claim.",
      ],
      quiz: [
        {
          id: "e-03-q1",
          prompt: "`s = np.array([88, 42, 95])`. What does `np.where(s >= 60, \"pass\", \"fail\")` return?",
          options: [
            { text: "array(['pass', 'fail', 'pass'])", correct: true, feedback: "Correct: 88 and 95 satisfy the condition, 42 does not — the mask decides per element and where assembles the labels." },
            { text: "array([True, False, True])", correct: false, feedback: "That is what s >= 60 alone returns — the MASK. np.where turns the mask into chosen values." },
            { text: "array([88, 0, 95])", correct: false, feedback: "That would be np.where(s >= 60, s, 0) — you kept the scores where True and zeroed the rest. The question's branches were the strings 'pass' and 'fail'." },
            { text: "It raises ValueError, because the branches are strings and s is numeric", correct: false, feedback: "No problem: the condition is boolean, and the two branches just need to be broadcastable with it — strings are values like any other." },
          ],
          explanation: "where reads the boolean mask and picks from the two branches element by element: 'pass' where True, 'fail' where False.",
        },
        {
          id: "e-03-q2",
          prompt: "You want the values of `a` that lie in [0, 1). Which line works?",
          options: [
            { text: "a[(0 < a) & (a < 1)]", correct: true, feedback: "Right: two parenthesized comparisons, AND-ed elementwise, then boolean indexing — the mask selects the values." },
            { text: "a[0 < a < 1]", correct: false, feedback: "The chained comparison crashes before indexing even starts: bool() of the intermediate array is ambiguous to NumPy." },
            { text: "a[0 < a and a < 1]", correct: false, feedback: "Python's and has the same problem as the chain — it needs one yes/no, not an array of them. Same ValueError." },
            { text: "np.where(a in [0, 1])", correct: false, feedback: "The in operator is for Python containers (and would also collapse to one boolean); the array spelling is a pair of comparisons with &." },
          ],
          explanation: "Ranges are two comparisons AND-ed elementwise with parentheses: a[(0 < a) & (a < 1)].",
        },
        {
          id: "e-03-q3",
          prompt: "`temps = np.array([21.3, 31.2, 27.5])`, `locs = np.where(temps > 30.0)`. Which is TRUE?",
          options: [
            { text: "locs[0] is an index array; temps[locs] is [31.2]", correct: true, feedback: "Correct: the one-branch form answers WHERE — coordinates — and indexing with them returns the hot values themselves." },
            { text: "locs is [31.2], the selected values", correct: false, feedback: "That is what boolean indexing returns (temps[temps > 30.0]). The one-branch where returns INDEXES, not values." },
            { text: "locs is True/False for each element", correct: false, feedback: "That is the mask temps > 30.0. np.where(mask) goes one step further and reports the positions of the True cells." },
            { text: "locs is a single integer: the position of the first hot day", correct: false, feedback: "It returns ALL the True positions as an array (here just one element, 1) — and argmax-style 'first hit only' is a different tool (Part G)." },
          ],
          explanation: "One-branch where = locator: a tuple of index arrays of the True cells; index back with them to fetch the values.",
        },
      ],
    },

    // ------------------------------------------------------------- e-04
    {
      slug: "e-04",
      title: "ufuncs: The Machines Behind the Operators",
      minutes: 19,
      summary:
        "Every operator is a function object — + is np.add, > is np.greater — and those objects carry METHODS: reduce folds an axis away, accumulate keeps every running value, outer builds every pair, at scatter-adds without losing duplicates, while out= and where= give you allocation-free and selective computation.",
      kind: "concept",
      objectives: [
        "Explain that every NumPy operator is a call to a ufunc — a function object — and call both spellings interchangeably",
        "Fold an axis away with ufunc.reduce (including its axis argument and its default-axis difference from np.sum)",
        "Build running totals with .accumulate and all-pair tables with .outer, for any operator",
        "Count hits correctly with np.add.at, and explain why fancy-index += loses duplicate writes",
        "Use out= to compute into a preallocated buffer and where= to compute selectively — including the untouched-positions pitfall, proven",
      ],
      why:
        "You have been calling ufuncs since your first `a + 1` in Part A — you just did not know the machines' names. A ufunc (universal function) is a compiled function object that maps operators over arrays elementwise, with broadcasting built in: `+` is np.add, `*` is np.multiply, `>` is np.greater. Knowing the names matters for one big reason: ufuncs are OBJECTS, and objects carry methods. np.add.reduce is np.sum spelled at a lower level; np.add.accumulate is every running total at once; np.add.outer is the every-pair table from Lesson e-02 for ANY operator; np.add.at is the duplicate-safe scatter-add that fancy indexing cannot give you; and the out= and where= arguments are the levers professional pipelines pull to reuse buffers and skip work. This lesson takes you one level under the operators you know — not to replace them, but so the whole mechanism is yours when a loop-shaped or memory-shaped problem demands it.",
      blocks: [
        {
          kind: "text",
          text: "Here is a small demystification: there is no `+` in NumPy. When you write `a + b`, Python translates the operator into a function call — `np.add(a, b)` — and that function is a **ufunc**: a *universal function*, a compiled object whose whole job is applying one operation to every element of any-shaped inputs, with broadcasting from Lesson e-01 built in. You can call the machines directly. You have been calling them by nickname all along.",
        },
        {
          kind: "code",
          title: "The operators, called by their names",
          code: `import numpy as np

print("np.add is a", type(np.add).__name__)

a = np.array([1.0, 2.0, 3.0])
b = np.array([10.0, 20.0, 30.0])

print("np.add(2, 3) =", np.add(2, 3))
print("a + b equals np.add(a, b):", np.array_equal(a + b, np.add(a, b)))
print("a > b equals np.greater(a, b):", np.array_equal(a > b, np.greater(a, b)))
`,
          output: `np.add is a ufunc
np.add(2, 3) = 5
a + b equals np.add(a, b): True
a > b equals np.greater(a, b): True`,
          outputNote:
            "np.add is literally an object of type ufunc — and it even takes plain Python scalars (2 and 3 in, 5 out). The operator and the function are the same machine; the syntax is your choice.",
          explain: [
            "`type(np.add).__name__` prints `ufunc` — these are function OBJECTS, instances of a compiled type, not ordinary Python functions.",
            "Comparisons are ufuncs too: `a > b` is `np.greater(a, b)`, which is why comparisons return boolean arrays (Lesson d-04) — a ufunc whose output dtype is bool.",
            "Calling ufuncs directly is not just ceremony: it is how you reach their methods, the real content of this lesson.",
          ],
        },
        {
          kind: "table",
          title: "The operator dictionary",
          headers: ["Operator", "ufunc", "Operator", "ufunc"],
          rows: [
            ["a + b", "np.add", "a > b", "np.greater"],
            ["a - b", "np.subtract", "a >= b", "np.greater_equal"],
            ["a * b", "np.multiply", "a < b", "np.less"],
            ["a / b", "np.divide", "a <= b", "np.less_equal"],
            ["a // b", "np.floor_divide", "a == b", "np.equal"],
            ["a % b", "np.mod", "a != b", "np.not_equal"],
            ["a ** b", "np.power", "-a", "np.negative"],
          ],
          caption:
            "Every operator in your NumPy vocabulary is a ufunc call. Part F completes the dictionary (in-place operators, divmod) and Part G adds more searching tools — the pattern never changes.",
        },
        {
          kind: "text",
          text: "Because ufuncs are objects, they carry **methods** — extra behaviors attached to the function itself. Four of them (`reduce`, `accumulate`, `outer`, `at`) generalize one operation across an axis, along a trajectory, over all pairs, or scattered onto positions. Two keyword arguments (`out=` and `where=`) control where results land and which inputs get computed at all. These six levers are what you cannot reach with operator syntax — and they are the rest of this lesson.",
        },
        {
          kind: "heading",
          text: ".reduce: fold an axis away",
        },
        {
          kind: "text",
          text: "`np.add.reduce(a)` repeatedly adds along an axis until that axis is gone: for a 1-D array it is the total; for a 2-D array with `axis=0` it is the column sums, one add at a time. This is the machine underneath `np.sum` — the docs say it plainly: *add.reduce() is equivalent to sum()*. And it works for ANY binary ufunc: `np.maximum.reduce` is a per-column max, `np.logical_and.reduce` asks 'all true along this axis?'.",
        },
        {
          kind: "code",
          title: "The sum machine, exposed — with axes",
          code: `import numpy as np

M = np.array([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]])

print("default (axis=0) :", np.add.reduce(M))
print("axis=1           :", np.add.reduce(M, axis=1))
print("equals M.sum(0)  :", np.array_equal(np.add.reduce(M), M.sum(axis=0)))
print("maximum.reduce   :", np.maximum.reduce(M, axis=0))
`,
          output: `default (axis=0) : [15 18 21 24]
axis=1           : [10 26 42]
equals M.sum(0)  : True
maximum.reduce   : [ 9 10 11 12]`,
          outputNote:
            "Default axis=0 collapses the ROWS into one row of column sums [15, 18, 21, 24]; axis=1 collapses the columns into row sums [10, 26, 42]. And maximum.reduce gives the column maxima [9, 10, 11, 12] — the same lever, a different machine.",
          explain: [
            "Watch the default: reduce's default axis is 0, while np.sum's default is None (collapse everything). Same machine, different defaults — a real trap when you switch spellings.",
            "`np.array_equal(np.add.reduce(M), M.sum(axis=0))` is the equivalence proof: sum with an axis IS add.reduce with that axis.",
            "`np.maximum.reduce(M, axis=0)` — the max-fold — is exactly what `M.max(axis=0)` calls underneath.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.add.reduce",
          purpose: "Fold an axis away by repeated addition — the machine underneath np.sum, callable for any ufunc.",
          signature: "np.add.reduce(array, axis=0, dtype=None, out=None, keepdims=False, initial=<no value>, where=True)",
          purposeDetail:
            "reduce applies the ufunc along one axis until that axis is consumed: for a 1-D array of length n it is ((((a[0] + a[1]) + a[2]) + ...) — n-1 additions, one number left. np.sum is the friendly name for np.add.reduce; reaching for the method itself buys two things. First, EVERY binary ufunc has a reduce — np.multiply.reduce is the product, np.maximum.reduce the max, np.logical_and.reduce an 'all true here?' — one idiom, a whole family of aggregations. Second, the extras (initial, where=) do things np.sum cannot, like seeding a total or reducing only selected positions. The axis semantics are the same ones Part F teaches across the whole aggregation family.",
          params: [
            {
              name: "array",
              type: "array_like",
              required: true,
              description: "The array to fold. A 1-D array reduces to a scalar; higher-dimensional arrays lose exactly the named axis.",
              example: "np.array([[1, 2], [3, 4]])",
            },
            {
              name: "axis",
              type: "int or tuple or None",
              description: "The axis (axes) to collapse. DEFAULT IS 0 — unlike np.sum, whose default is None (all axes). Pass axis=None explicitly to collapse everything.",
              example: "axis=1",
            },
            {
              name: "initial",
              type: "scalar",
              description: "A seed value placed before the first element — handy for non-empty guarantees, like starting a product at 1.",
              example: "initial=0",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep the collapsed axis at size 1 instead of removing it — the broadcast-friendly switch from Lesson e-02, available here too.",
              example: "keepdims=True",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "Reduce only the positions where this mask is True (pass an out= buffer for the untouched ones — see the where= section of this lesson).",
              example: "where=mask",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "The array with the named axis folded away by repeated application of the ufunc — for add, the sums along that axis.",
          },
          example: `import numpy as np

M = np.array([[1, 2, 3],
              [4, 5, 6]])

print(np.add.reduce(M, axis=0))
print(np.add.reduce(M, axis=1))
print("axis=None collapses everything:", np.add.reduce(M, axis=None))
`,
          exampleOutput: `[5 7 9]
[ 6 15]
axis=None collapses everything: 21`,
          commonMistakes: [
            {
              mistake: "Expecting np.add.reduce(M) to equal M.sum() on a 2-D array.",
              why: "The defaults differ: reduce folds axis 0 only (a row of column sums), while np.sum with no axis collapses everything to one number.",
              fix: "Say the axis out loud in both spellings — np.add.reduce(M, axis=None) matches M.sum(); np.add.reduce(M) matches M.sum(axis=0).",
            },
            {
              mistake: "Looking for np.reduce(...) — a function that does not exist.",
              why: "reduce is a METHOD on each ufunc object, not a module-level function: the operator is part of the name.",
              fix: "Write np.add.reduce, np.multiply.reduce, np.maximum.reduce — the ufunc first, then .reduce.",
            },
            {
              mistake: "Reducing an empty slice and hitting a confusing error.",
              why: "With no initial=, reducing an empty axis has no identity to return, so NumPy raises (np.add.reduce(np.array([])) errors; multiply.reduce on an empty axis too).",
              fix: "Pass initial= (0 for sums, 1 for products) when empty inputs are possible — it becomes the value of an empty reduction.",
            },
          ],
          related: [
            { name: "np.sum", relation: "The friendly spelling of add.reduce with a different default (axis=None) — prefer it in everyday code." },
            { name: "np.add.accumulate", relation: "The sibling that keeps every intermediate instead of collapsing to one: the running totals." },
            { name: "np.maximum.reduce", relation: "The max-fold — the same method on a different ufunc, exactly what ndarray.max(axis=...) calls." },
            { name: "np.logical_and.reduce", relation: "The 'all true along this axis?' fold — ndarray.all(axis=...) underneath." },
          ],
          applications: [
            "Row and column totals via any operator — one idiom for sums, products, maxima, all/any",
            "Per-group aggregation once positions are known (combine with where= or fancy indexing)",
            "Reading other people's code: sum, prod, max, min, any, all are ALL reduce calls underneath",
          ],
          notes:
            "Part F teaches the whole aggregation family (sum, prod, cumsum, argmax, any, all, keepdims) as first-class citizens; this card is the mechanism layer they stand on.",
        },
        {
          kind: "heading",
          text: ".accumulate: every running value, kept",
        },
        {
          kind: "text",
          text: "Where `reduce` folds to ONE answer, `.accumulate` keeps the whole trajectory: element k of the result is the ufunc applied to the first k+1 inputs. For `np.add` that is the running total — Lesson e-03's cumsum, here revealed as a method. `np.multiply.accumulate` is the running product. Ask a spreadsheet person and they will tell you these two are the fill-down columns of the array world.",
        },
        {
          kind: "code",
          title: "Running balances and running products",
          code: `import numpy as np

net = np.array([100, -30, 50, -10, 20])   # daily changes to a balance

print("running balance :", np.add.accumulate(net))
print("running products:", np.multiply.accumulate(np.array([2, 2, 2, 2])))
print("equals cumsum   :", np.array_equal(np.add.accumulate(net), np.cumsum(net)))
`,
          output: `running balance : [100  70 120 110 130]
running products: [ 2  4  8 16]
equals cumsum   : True`,
          outputNote:
            "The balance after each day: 100, 70, 120, 110, 130 — every intermediate kept. The running product of four 2s doubles each step: 2, 4, 8, 16. And the add version is literally what np.cumsum calls.",
          explain: [
            "The LAST element of an accumulate is what reduce would have returned — the trajectory ends at the total.",
            "`np.cumsum` is `np.add.accumulate`; `np.cumprod` is `np.multiply.accumulate`. The methods are the general form — every ufunc has one.",
            "The natural companion is `np.maximum.accumulate`: the record-so-far sequence (running highs), which the playground below asks you to build.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.add.accumulate",
          purpose: "Apply addition cumulatively along an axis, keeping every intermediate sum — the machine underneath np.cumsum.",
          signature: "np.add.accumulate(array, axis=0, dtype=None, out=None)",
          purposeDetail:
            "accumulate is reduce that refuses to throw anything away: result[k] is the ufunc applied to inputs 0..k, so the output has the SAME shape as the input and tells the whole story — the running total after each element, not just the final one. np.cumsum is the friendly name for the add version, and the method form generalizes to every binary ufunc: np.multiply.accumulate is the running product (np.cumprod), np.maximum.accumulate is the running maximum — the 'record so far' sequence that turns up in drawdown analysis, personal bests, and high-water marks. Like reduce, the default axis is 0.",
          params: [
            {
              name: "array",
              type: "array_like",
              required: true,
              description: "The array to walk. The result has the same shape as the input — nothing is collapsed.",
              example: "np.array([100, -30, 50])",
            },
            {
              name: "axis",
              type: "int",
              description: "The axis to accumulate along. Default 0 — the same default as reduce, and the same trap when switching spellings with cumsum (whose default is None for 1-D but flat behavior differs on 2-D: pass the axis explicitly).",
              example: "axis=1",
            },
            {
              name: "out",
              type: "ndarray",
              description: "Optional preallocated buffer with the input's shape — write the trajectory into memory you already own (see out= below).",
              example: "out=buf",
            },
          ],
          returns: {
            type: "ndarray",
            description: "Same shape as the input; result[..., k] is the ufunc applied to input[..., 0..k] — for add, the cumulative sums along the axis.",
          },
          example: `import numpy as np

net = np.array([100, -30, 50, -10, 20])
running = np.add.accumulate(net)
print(running)
print("same as np.cumsum:", np.array_equal(running, np.cumsum(net)))

daily = np.array([[10, 20, 30],
                  [40, 50, 60]])
print("per column, axis=0:")
print(np.add.accumulate(daily, axis=0))
`,
          exampleOutput: `[100  70 120 110 130]
same as np.cumsum: True
per column, axis=0:
[[10 20 30]
 [50 70 90]]`,
          commonMistakes: [
            {
              mistake: "Expecting the single total.",
              why: "accumulate never collapses anything — the total is only the LAST element of a result the same length as the input.",
              fix: "Want the trajectory? accumulate. Want the answer? reduce (or .sum()). They are one keystroke apart and mean different things.",
            },
            {
              mistake: "Forgetting the default axis (0) on a 2-D array.",
              why: "On a matrix, np.add.accumulate(M) accumulates DOWN each column (axis 0) — a surprise if you expected np.cumsum's flat, whole-array behavior.",
              fix: "Pass the axis explicitly whenever the input might be 2-D, exactly as with reduce.",
            },
            {
              mistake: "Assuming accumulate only exists for add.",
              why: "It is a method on every binary ufunc: multiply (running products), maximum (running record), minimum, logical_or (once true, stays true).",
              fix: "When you need a running ANYTHING, first ask which operator runs, then call its .accumulate.",
            },
          ],
          related: [
            { name: "np.cumsum", relation: "The friendly spelling of add.accumulate — use it in everyday code; use the method when the operator is not addition." },
            { name: "np.add.reduce", relation: "The collapsing sibling: same walk, keeps only the final value." },
            { name: "np.maximum.accumulate", relation: "The running-maximum version — record highs, high-water marks, the first half of every drawdown calculation." },
          ],
          applications: [
            "Running balances and cumulative counts (the trajectory, not just the total)",
            "Record tracking: maximum.accumulate gives the best-so-far at every step",
            "Prefix computations that later code slices at arbitrary points — every partial total is already computed",
          ],
          notes:
            "In NumPy's own docs: accumulate produces results equivalent to a loop carrying a variable and recording it after every step — the loop family Lesson e-03 called 'carried values', made into a method.",
        },
        {
          kind: "heading",
          text: ".outer: every pair, generalized",
        },
        {
          kind: "text",
          text: "Lesson e-02 built the outer product — every element of u against every element of v — with a (m, 1) x (1, n) broadcast, and `np.outer` as its named spelling. The method form is the generalization: **every binary ufunc has an `.outer`**. `np.add.outer` builds every sum, `np.subtract.outer` every difference. One particularly useful trick: for 1-D data, `np.abs(np.subtract.outer(x, x))` is the pairwise-distance pattern of Lesson e-02 — without the (p, p, d) cube, because there is no coordinate axis to carry.",
        },
        {
          kind: "code",
          title: "Every start against every duration; every gap between positions",
          code: `import numpy as np

start = np.array([9, 12, 15, 18])        # departure hours
durations = np.array([20, 35, 55])       # trip lengths in minutes

print("every start + every duration:")
print(np.add.outer(start, durations))
print()
x = np.array([2, 7, 11])
print("all-pair gaps |xi - xj|, no 3-D temporary:")
print(np.abs(np.subtract.outer(x, x)))
`,
          output: `every start + every duration:
[[29 44 64]
 [32 47 67]
 [35 50 70]
 [38 53 73]]

all-pair gaps |xi - xj|, no 3-D temporary:
[[0 5 9]
 [5 0 4]
 [9 4 0]]`,
          outputNote:
            "The (4, 3) table holds all twelve possible arrival hours — the double-stretch shape from Lesson e-02, built by a method call. Below it, every pairwise gap between three positions: 2 to 11 is 9 apart, 7 to 11 is 4 — the subtraction table's absolute value, no (3, 3, 1) temporary in sight.",
          explain: [
            "`np.add.outer(a, b)` is `a[:, None] + b[None, :]` with intent in the name — result[i, j] is the ufunc of a[i] and b[j], for every pair.",
            "The gaps table is symmetric with a zero diagonal — the fingerprints of an every-pair distance matrix (compare Lesson e-02's Pattern 5 receipts).",
            "When your vectors are genuinely 1-D, subtract.outer gives pairwise distances with less machinery; the 3-D broadcast is for points with multiple coordinates.",
          ],
        },
        {
          kind: "heading",
          text: ".at: the duplicate-safe scatter-add",
        },
        {
          kind: "text",
          text: "Lesson d-05 left a debt: fancy indexing with DUPLICATE indexes writes last-wins — the earlier writes to the same cell are simply lost. For `a[places] += 1` that is worse than lost, it is wrong: the operation is buffered, so `counts[[0, 0, 0]] += 1` adds ONE, not three. Counting needs every hit to land. That is exactly what **`np.add.at`** does: unbuffered, duplicate-aware scatter-add.",
        },
        {
          kind: "code",
          title: "Counting votes: the buffered trap vs .at",
          code: `import numpy as np

votes = np.array([0, 1, 2, 0, 1, 0, 0, 2, 2, 2, 1, 0])   # 12 voters, 3 candidates

# BEFORE (broken): fancy-index += -- duplicate indexes land only ONCE (Lesson d-05)
naive = np.zeros(3, dtype=int)
naive[votes] += 1

# AFTER: unbuffered scatter-add -- every hit counts
counted = np.zeros(3, dtype=int)
np.add.at(counted, votes, 1)

print("naive  :", naive, " total", naive.sum(), "of", votes.size)
print("add.at :", counted, " total", counted.sum(), "of", votes.size)
`,
          output: `naive  : [1 1 1]  total 3 of 12
add.at : [5 3 4]  total 12 of 12`,
          outputNote:
            "The naive counts total 3 of 12 — nine votes vanished into the buffering. add.at recovers all of them: candidate 0 got 5, candidate 1 got 3, candidate 2 got 4, totaling 12. Every hit landed.",
          explain: [
            "`naive[votes] += 1` becomes gather-all, add-1, scatter-back — and the scatter overwrites itself when indexes repeat, so each candidate gets +1 at most once.",
            "`np.add.at(counted, votes, 1)` walks the index list WITHOUT buffering: position 0 is visited five times, so it accumulates five increments.",
            "The receipt is the total: a correct count sums to the number of events. Make that check a habit — the naive version fails it loudly.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.add.at",
          purpose: "Scatter-add into an array at given positions, accumulating correctly even when positions repeat — the duplicate-safe way to count or aggregate into bins.",
          signature: "np.add.at(a, indices, b, /)",
          purposeDetail:
            "np.add.at(a, indices, b) adds b[k] into a[indices[k]] for every k, with no buffering: if the same position appears five times, all five additions land. That is the one behavior the familiar a[indices] += b cannot promise — the fancy-index form is buffered, so repeated positions overwrite each other and only the last write survives (Lesson d-05's trap). Use .at whenever events are being counted, votes tallied, or amounts accumulated into bins by group. It works in place, returns nothing, and pays for its correctness with speed: .at is slower than plain fancy assignment, so reach for it when duplicates are possible — not by reflex.",
          params: [
            {
              name: "a",
              type: "ndarray",
              required: true,
              description: "The destination array, modified IN PLACE. Its dtype must be able to hold the additions (an int destination receiving float adds raises).",
              example: "np.zeros(4, dtype=int)",
            },
            {
              name: "indices",
              type: "array_like of ints",
              required: true,
              description: "The positions to add into — duplicates are the whole point. Same indexing vocabulary as fancy indexing (Lesson d-05).",
              example: "np.array([3, 1, 1, 3])",
            },
            {
              name: "b",
              type: "array_like or scalar",
              required: true,
              description: "What to add at each position: a scalar (the same amount everywhere — 1 for counting) or one value per index (scatter-adding amounts into bins).",
              example: "1 or amounts_array",
            },
          ],
          returns: {
            type: "None",
            description: "Nothing — the operation happens in place inside a. (Writing x = np.add.at(...) would store None in x.)",
          },
          example: `import numpy as np

counted = np.zeros(3, dtype=int)
rolls = np.array([2, 0, 2, 1, 2, 0, 2])
np.add.at(counted, rolls, 1)

print(counted)
print("all rolls counted:", counted.sum() == rolls.size)
print("face 2 came up", counted[2], "times")
`,
          exampleOutput: `[2 1 4]
all rolls counted: True
face 2 came up 4 times`,
          commonMistakes: [
            {
              mistake: "Using a[indices] += 1 when indexes can repeat.",
              why: "The fancy form is buffered: gather, add, scatter — and the scatter steps on itself, so duplicate positions receive only ONE increment. Votes silently vanish (the block above lost 9 of 12).",
              fix: "np.add.at(a, indices, 1). Keep the receipt check too: counts.sum() must equal the number of events.",
            },
            {
              mistake: "Writing counts = np.add.at(counts, places, 1) and wondering why counts is None.",
              why: ".at modifies its first argument in place and returns None — it is a statement, not an expression.",
              fix: "Call it on its own line and read the array afterwards; the name you gave the destination already refers to the updated array.",
            },
            {
              mistake: "Calling it on the array instead of the ufunc: counts.add.at(...)",
              why: "at is a method of ufunc OBJECTS (np.add, np.subtract, np.maximum), not of ndarrays — the operator is part of the name.",
              fix: "np.add.at(counts, places, 1) — and remember the siblings: np.subtract.at, np.maximum.at, np.minimum.at all exist for the same scatter trick with other operators.",
            },
          ],
          related: [
            { name: "np.bincount", relation: "The specialized, faster counter for nonnegative integers — when you are ONLY counting, prefer it; .at is the general tool (any positions, any amounts)." },
            { name: "fancy indexing +=", relation: "The fast-but-buffered sibling: correct only when indexes are guaranteed unique." },
            { name: "np.subtract.at / np.maximum.at", relation: "The same scatter lever with a different operator — subtract penalties, keep running maxima at scattered positions." },
          ],
          applications: [
            "Vote and event counting: every occurrence of every value, duplicates and all",
            "Aggregating amounts into bins: np.add.at(totals, group_ids, amounts) sums each group's values in one call",
            "Histogram-style accumulation on custom positions (Part F's bincount/histogram are the named special cases)",
          ],
          notes:
            "Performance honesty: .at is unbuffered and therefore noticeably slower than a single fancy assignment — but it is correct under duplicates, and correctness you can verify (counts sum to the event total) beats fast and quietly wrong.",
        },
        {
          kind: "heading",
          text: "out=: compute into a buffer you own",
        },
        {
          kind: "text",
          text: "Every operation so far allocated a fresh result array. In a loop over many batches, that is a lot of garbage: allocate, fill, free, repeat. The `out=` keyword breaks the cycle — hand the ufunc a destination you already own, and the answer lands there. No new array, no allocation cost, full control over memory. This is the zero-allocation style behind serious pipelines.",
        },
        {
          kind: "code",
          title: "Preallocated destinations, reused",
          code: `import numpy as np

a = np.arange(3, dtype=np.float64)
b = np.array([10.0, 20.0, 30.0])

buf = np.full(3, -1.0)      # a preallocated destination, filled with a sentinel
np.add(a, b, out=buf)       # no new array is built: the answer lands IN buf
print("buf now holds the sums:", buf)

# the reuse pattern: one buffer, many batches -- zero fresh allocations
totals = np.zeros(3)
for batch in (np.array([1.0, 2.0, 3.0]), np.array([10.0, 20.0, 30.0])):
    np.add(totals, batch, out=totals)
print("totals after two batches:", totals)
`,
          output: `buf now holds the sums: [10. 21. 32.]
totals after two batches: [11. 22. 33.]`,
          outputNote:
            "The sentinel -1.0s were overwritten with the sums [10, 21, 32] — buf was the destination, not a copy. And the batch loop reused totals as BOTH input and output: two batches, zero allocations after the first line.",
          explain: [
            "`np.add(a, b, out=buf)` is exactly `a + b` with the result poured into buf instead of a fresh block — same machine, chosen destination.",
            "Reading and writing the same buffer (totals as input AND output) is safe for ufuncs: each output element depends only on the same-position inputs.",
            "The dtype must be able to hold the result — Lesson f-01's casting rules apply to out= too (an int buffer receiving float results raises rather than truncating).",
          ],
        },
        {
          kind: "heading",
          text: "where=: compute only where a mask says so",
        },
        {
          kind: "text",
          text: "The `where=` keyword skips work: the ufunc computes ONLY at positions where the mask is True. Now the pitfall that earns this section its warning tone: `where=` does not say what happens at the False positions — the OUTPUT does. With `out=` supplied, untouched positions keep the buffer's OLD contents. Without `out=`, untouched positions are UNINITIALIZED memory: garbage values that must never be read or printed. The safe pattern is always the pair: `where=mask, out=buffer`, with the buffer prefilled by you.",
        },
        {
          kind: "code",
          title: "Selective sqrt, with the pitfall on display",
          code: `import numpy as np

x = np.array([4.0, -1.0, 9.0, -4.0])
mask = x >= 0

# Compute sqrt ONLY where the mask is true -- out= decides the rest!
kept = np.full(4, -999.0)          # sentinel: "never touched"
np.sqrt(x, where=mask, out=kept)

print(kept)
print("sqrt computed for", np.count_nonzero(mask), "of", x.size, "values")
print("negatives kept the sentinel:", kept[1] == -999.0 and kept[3] == -999.0)
`,
          output: `[   2. -999.    3. -999.]
sqrt computed for 2 of 4 values
negatives kept the sentinel: True`,
          outputNote:
            "Positions 0 and 2 hold real square roots (2.0 and 3.0); positions 1 and 3 were never computed and still hold the sentinel -999.0 that WE chose — because out= was supplied. Drop the out= and those two positions would hold whatever was in freshly allocated memory: unreadable garbage.",
          explain: [
            "`mask = x >= 0` protects the sqrt from negatives — but only where the mask is True is anything computed at all.",
            "The sentinel pattern makes the pitfall useful: -999 means 'no computation happened here', a value you chose, can test for, and can replace later (np.where(kept == -999.0, 0.0, kept)).",
            "Rule to keep: never write where= without out=. An output full of uninitialized positions is a bug with a delayed fuse.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The axis lab — reductions as collapsing directions",
          mode: "axis",
          name: "M",
          caption:
            "The same M as the reduce block above. Pick sum and axis 0: the rows collapse and one row of column sums remains — exactly what np.add.reduce(M, axis=0) computed. Switch to axis 1 and the columns collapse instead, leaving each row's total. Try mean and max with both axes: the operation is your choice, the collapse direction is the axis — the whole reduce family in one toy.",
          data: [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
          ],
          ops: ["sum", "mean", "max"],
        },
        {
          kind: "tryIt",
          title: "A tiny walk analyzer",
          task: "Run it, then extend: (1) compute the running maximum with np.maximum.accumulate(position) — the farthest point reached at each step; (2) compute the drawdown at each step: running_max - position, and print its largest value with np.max; (3) use np.add.reduce on the steps to verify it equals the final position. Then change steps so the walk ends back where it started, and check that your drawdown still makes sense.",
          code: `import numpy as np

steps = np.array([3, -1, 4, -1, 2, -6, 2])

position = np.add.accumulate(steps)
print("position after each step:", position)
print("farthest reach:", np.maximum.reduce(position))
print("all-pair gaps between positions:")
print(np.abs(np.subtract.outer(position, position)))
`,
          hint:
            "Running max: np.maximum.accumulate(position). Drawdown: that minus position — every element is how far BELOW the record you are at that step; its largest value is the worst drawdown of the walk.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Every operator is a ufunc — a function object you can call by name — and every binary ufunc carries four methods and two levers: reduce folds an axis away (np.sum's machine), accumulate keeps every running value (np.cumsum's machine), outer builds every pair, at scatter-adds without losing duplicates; out= pours results into a buffer you own, and where= computes selectively — always paired with out=, because untouched positions keep whatever the output buffer held.",
        },
      ],
      terms: [
        { term: "ufunc", definition: "Universal function: a compiled function object that applies one operation elementwise over any-shaped inputs, with broadcasting built in. Every NumPy operator is a ufunc call — + is np.add, > is np.greater." },
        { term: "reduce", definition: "A ufunc method that applies the operator along an axis until the axis is gone: add.reduce is sum, multiply.reduce is prod, maximum.reduce is max. Default axis 0 — unlike np.sum's default None." },
        { term: "accumulate", definition: "A ufunc method that keeps every intermediate: result[k] is the operator applied to inputs 0..k. add.accumulate is cumsum; multiply.accumulate is cumprod; maximum.accumulate is the record-so-far." },
        { term: "outer (method)", definition: "A ufunc method building the all-pairs table: result[i, j] = ufunc(a[i], b[j]). add.outer sums every pair; abs(subtract.outer(x, x)) is the 1-D pairwise-distance matrix." },
        { term: "Scatter-add", definition: "np.add.at(a, indices, b): unbuffered in-place addition at the given positions — every hit lands, even when positions repeat. The duplicate-safe replacement for a[indices] += b." },
        { term: "Preallocated output (out=)", definition: "The ufunc lever that pours results into an array you already own instead of allocating a fresh one — the zero-allocation style, and the required companion of where=." },
      ],
      mistakes: [
        {
          mistake: "Counting with a[places] += 1 and trusting the totals.",
          why: "Fancy assignment is buffered: gather, add, scatter — and the scatter overwrites itself where indexes repeat, so each position receives at most ONE increment. Nine of twelve votes vanished in this lesson's demo.",
          fix: "np.add.at(counts, places, 1) — and always keep the receipt: counts.sum() must equal the number of events.",
        },
        {
          mistake: "Using where= without out= (or reading the untouched positions).",
          why: "where= only says WHERE to compute; the untouched positions of the output are whatever the buffer held — and with no out= supplied, that buffer is freshly allocated UNINITIALIZED memory: values that differ run to run and must never be printed or trusted.",
          fix: "Always pair where= with out=: prefill a buffer with a sentinel you chose (0, -999, NaN), then read the sentinel as 'not computed here'.",
        },
        {
          mistake: "Assuming np.add.reduce(M) on a matrix equals M.sum().",
          why: "The defaults differ: reduce's default axis is 0 (one row of column sums), sum's default is None (one number). The spellings are equivalent only when the axis is stated in both.",
          fix: "State the axis explicitly in both spellings whenever the input has more than one dimension — np.add.reduce(M, axis=None) matches M.sum().",
        },
      ],
      takeaways: [
        "Operators are ufunc calls: + is np.add, > is np.greater — same machine, callable by name, and the name carries methods.",
        "reduce folds an axis away (np.sum's machine — but its default axis is 0, not None); accumulate keeps every running value (np.cumsum's machine); both exist for every binary ufunc.",
        "outer builds the every-pairs table for any operator — add.outer for sums, abs(subtract.outer(x, x)) for 1-D pairwise gaps without the 3-D temporary.",
        "np.add.at is the duplicate-safe scatter-add: every hit lands, unlike buffered fancy assignment — and its receipt is counts.sum() == number of events.",
        "out= pours results into a buffer you own (zero-allocation reuse); where= computes selectively and MUST be paired with out=, because untouched positions keep the buffer's old contents.",
      ],
      quiz: [
        {
          id: "e-04-q1",
          prompt: "`M = np.arange(6).reshape(2, 3)`. What does `np.add.reduce(M)` (no axis) return?",
          options: [
            { text: "A 1-D array of 3 column sums — same as M.sum(axis=0)", correct: true, feedback: "Right: reduce's default axis is 0, so the ROWS fold away and one row of column sums remains: [3, 5, 7]." },
            { text: "15 — the total of everything, same as M.sum()", correct: false, feedback: "That is reduce with axis=None, or M.sum() with no axis. The bare method call folds only axis 0 — the default-axis difference is the classic trap." },
            { text: "A 1-D array of 2 row sums — same as M.sum(axis=1)", correct: false, feedback: "Row sums come from axis=1. The default collapses axis 0 — the first axis, the rows — leaving one value per column." },
            { text: "It raises an error, because no axis was given", correct: false, feedback: "No error — axis has a default (0). It is np.sum's default (None, everything) that differs, which is exactly what this question is probing." },
          ],
          explanation: "reduce defaults to axis 0: fold the rows, keep the columns. State the axis explicitly when switching between the reduce and sum spellings.",
        },
        {
          id: "e-04-q2",
          prompt: "`hits = np.array([0, 0, 0, 1])` and `counts = np.zeros(2, dtype=int)`. After `counts[hits] += 1`, what is counts[0]?",
          options: [
            { text: "1 — the buffered fancy assignment applied only one of the three increments", correct: true, feedback: "Correct, and it is the BUG: gather-all-three, add 1 to each, scatter — and the three writes to position 0 overwrite each other. One increment survives." },
            { text: "3 — every hit counted", correct: false, feedback: "That is what np.add.at(counts, hits, 1) delivers. The += form is buffered and loses duplicate writes." },
            { text: "0 — nothing was written", correct: false, feedback: "Something was written: one increment survived the overwrites. Losing 2 of 3 is not the same as losing all 3." },
            { text: "It raises ValueError because of the duplicate indexes", correct: false, feedback: "Duplicates in fancy indexing are legal (Lesson d-05) — that is the problem. The write succeeds; it is just silently incomplete." },
          ],
          explanation: "Fancy += is buffered: duplicates overwrite each other, so 0 receives one increment, not three. Scatter with np.add.at when duplicates must all land.",
        },
        {
          id: "e-04-q3",
          prompt: "`x = np.array([4.0, -1.0])`, `buf = np.zeros(2)`, then `np.sqrt(x, where=x >= 0, out=buf)`. What is in buf afterwards?",
          options: [
            { text: "[2.0, 0.0] — position 1 was never computed, so it keeps buf's old value 0.0", correct: true, feedback: "Exactly: where= skips the negative, and out= decides what the skipped position holds — the buffer's previous content, here the 0.0 you prefilled." },
            { text: "[2.0, nan] — untouched positions become NaN", correct: false, feedback: "NaN is a choice YOU can prefill, but the mechanism has no such default: untouched means untouched — whatever the buffer already held." },
            { text: "[2.0, 1.0] — sqrt computed everywhere anyway", correct: false, feedback: "Then where= would do nothing. The whole point is selective computation: the negative's sqrt is never even attempted (no warning, no error)." },
            { text: "It raises an error, because sqrt of a negative is undefined", correct: false, feedback: "The negative is never passed to sqrt — where= shields it. Without the where=, yes, you would get a warning and a NaN; with it, position 1 is simply skipped." },
          ],
          explanation: "where= chooses WHERE to compute; out= decides what the rest of the output holds. Prefill deliberately — and never read outputs from a where= call that had no out=.",
        },
      ],
    },

  ],

  // -----------------------------------------------------------------
  // Part E exercises (12: b1-b4, i1-i4, a1-a4)
  // -----------------------------------------------------------------
  exercises: [
    {
      id: "e-b1",
      tier: "beginner",
      title: "From loop to one line",
      prompt:
        "The loop below adds 8% tax to each price and rounds to 2 decimals. Replace it with ONE array expression (no loop, no list comprehension) that produces the same answers, then print the vectorized result and a boolean proving it matches the loop. Expected output: two lines — the four rounded prices, then True.",
      hint: "The expression is np.round(prices * 1.08, 2): the operator maps over the array, and np.round maps over the result. np.array_equal(np.array(looped), vectorized) writes the receipt.",
      starter: `import numpy as np

prices = np.array([19.99, 4.50, 100.00, 12.25])

# The loop, for reference (and for your equality proof):
looped = [round(p * 1.08, 2) for p in prices]

# TODO: one array expression, same answers, no loop
`,
      solution: `import numpy as np

prices = np.array([19.99, 4.50, 100.00, 12.25])

looped = [round(p * 1.08, 2) for p in prices]
vectorized = np.round(prices * 1.08, 2)

print(vectorized)
print("identical to the loop:", np.array_equal(np.array(looped), vectorized))
`,
      expectedOutput: `[ 21.59   4.86 108.    13.23]
identical to the loop: True`,
      concepts: ["vectorization", "elementwise arithmetic", "np.round"],
    },
    {
      id: "e-b2",
      tier: "beginner",
      title: "Labels without branches",
      prompt:
        "A transit log records minutes of delay for 6 trips: [2, 45, 0, 12, 90, 5]. A trip is 'late' when it is more than 15 minutes behind. Use np.where to build the label array in ONE expression (no if, no loop), print it, then print how many trips were late (use np.count_nonzero on the mask, not on the labels). Expected output: two lines — six labels, then the count 2.",
      hint: "np.where(delays > 15, \"late\", \"on time\") — the comparison is the mask, the strings are the two branches. count_nonzero(delays > 15) counts the late ones.",
      starter: `import numpy as np

delays = np.array([2, 45, 0, 12, 90, 5])   # minutes late

# TODO: one np.where expression -> labels, then count the late trips
`,
      solution: `import numpy as np

delays = np.array([2, 45, 0, 12, 90, 5])

labels = np.where(delays > 15, "late", "on time")
print(labels)
print("late trips:", np.count_nonzero(delays > 15))
`,
      expectedOutput: `['on time' 'late' 'on time' 'on time' 'late' 'on time']
late trips: 2`,
      concepts: ["np.where", "boolean masks", "count_nonzero"],
    },
    {
      id: "e-b3",
      tier: "beginner",
      title: "Center the columns",
      prompt:
        "Center the matrix X = [[2, 20], [4, 20], [6, 20]] by subtracting each column's own mean — in ONE broadcast line (the loop is forbidden; the means come from X.mean(axis=0), which collapses the rows and leaves one mean per column). Print the centered matrix, then the column means of the result rounded to 10 decimals. Expected output: the centered matrix with a zero diagonal of means, then [0. 0.].",
      hint: "centered = X - X.mean(axis=0). The (2,) row of means stretches down all three rows. np.round(centered.mean(axis=0), 10) proves each column's mean is now exactly 0.",
      starter: `import numpy as np

X = np.array([[2.0, 20.0],
              [4.0, 20.0],
              [6.0, 20.0]])

# TODO: one broadcast line to center the columns, then print it + new means
`,
      solution: `import numpy as np

X = np.array([[2.0, 20.0],
              [4.0, 20.0],
              [6.0, 20.0]])

centered = X - X.mean(axis=0)
print(centered)
print("column means now:", np.round(centered.mean(axis=0), 10))
`,
      expectedOutput: `[[-2.  0.]
 [ 0.  0.]
 [ 2.  0.]]
column means now: [0. 0.]`,
      concepts: ["broadcasting", "mean with axis", "centering"],
    },
    {
      id: "e-b4",
      tier: "beginner",
      title: "Count the range hits",
      prompt:
        "For readings = [12.5, 18.0, 22.5, 17.0, 25.0, 14.5, 21.0], count how many fall in the range 15 to 22 inclusive — with ONE & expression, not a loop and not chained comparisons (0 <= a <= 22 style would crash: array truth values are ambiguous). Print the boolean mask, the count of hits, and the selected values. Expected output: three lines — the mask, then 3, then the three in-range readings.",
      hint: "mask = (readings >= 15) & (readings <= 22) — parentheses around EVERY comparison, because & binds tighter than >=. Then np.count_nonzero(mask) and readings[mask].",
      starter: `import numpy as np

readings = np.array([12.5, 18.0, 22.5, 17.0, 25.0, 14.5, 21.0])

# TODO: one & expression -> mask; print mask, count of hits, selected values
`,
      solution: `import numpy as np

readings = np.array([12.5, 18.0, 22.5, 17.0, 25.0, 14.5, 21.0])

mask = (readings >= 15) & (readings <= 22)
print(mask)
print("count in range :", np.count_nonzero(mask))
print("values selected:", readings[mask])
`,
      expectedOutput: `[False  True False  True False False  True]
count in range : 3
values selected: [18. 17. 21.]`,
      concepts: ["elementwise logical operators", "boolean indexing", "count_nonzero"],
    },
    {
      id: "e-i1",
      tier: "intermediate",
      title: "Rows to unit length",
      prompt:
        "Scale every row of M = [[3, 4], [8, 6], [0, 2]] to length 1 by dividing each row by its own norm — the row-wise pattern that REQUIRES keepdims=True (without it the norms come out as a (3,) row and the division refuses). Print the norms you computed (raveled) and the normalized matrix rounded to 4 decimals, then a boolean proving every row now has norm 1 (np.allclose). Expected output: the norms [5, 10, 2], the normalized matrix, then True.",
      hint: "norms = np.linalg.norm(M, axis=1, keepdims=True) gives an (3, 1) column; N = M / norms stretches it across each row's columns. Prove with np.allclose(np.linalg.norm(N, axis=1), 1.0).",
      starter: `import numpy as np

M = np.array([[3.0, 4.0],
              [8.0, 6.0],
              [0.0, 2.0]])

# TODO: row norms with keepdims=True, divide, print norms + result + proof
`,
      solution: `import numpy as np

M = np.array([[3.0, 4.0],
              [8.0, 6.0],
              [0.0, 2.0]])

norms = np.linalg.norm(M, axis=1, keepdims=True)
N = M / norms
print("norms (kept as a column):", norms.ravel())
print(np.round(N, 4))
print("every row has norm 1:", np.allclose(np.linalg.norm(N, axis=1), 1.0))
`,
      expectedOutput: `norms (kept as a column): [ 5. 10.  2.]
[[0.6 0.8]
 [0.8 0.6]
 [0.  1. ]]
every row has norm 1: True`,
      concepts: ["keepdims", "linalg.norm", "row-wise broadcasting"],
    },
    {
      id: "e-i2",
      tier: "intermediate",
      title: "The multiplication table, two ways",
      prompt:
        "Build the 5x5 multiplication table (rows and columns 1..5) with np.multiply.outer on two aranges, print it, then prove it equals the explicit broadcast spelling i[:, None] * j[None, :] with a boolean. This is the outer-product double stretch wearing a ufunc method. Expected output: the table (rows [1, 2, 3, 4, 5] up to [5, 10, 15, 20, 25]), then True.",
      hint: "np.multiply.outer(i, j) IS i[:, None] * j[None, :] — same (m, 1) x (1, n) stretch, expressed as a method on the ufunc behind *.",
      starter: `import numpy as np

i = np.arange(1, 6)
j = np.arange(1, 6)

# TODO: np.multiply.outer -> table; print it + equality with the broadcast form
`,
      solution: `import numpy as np

i = np.arange(1, 6)
j = np.arange(1, 6)

table = np.multiply.outer(i, j)
print(table)
print("same as the broadcast spelling:", np.array_equal(table, i[:, None] * j[None, :]))
`,
      expectedOutput: `[[ 1  2  3  4  5]
 [ 2  4  6  8 10]
 [ 3  6  9 12 15]
 [ 4  8 12 16 20]
 [ 5 10 15 20 25]]
same as the broadcast spelling: True`,
      concepts: ["ufunc methods", "outer", "broadcasting"],
    },
    {
      id: "e-i3",
      tier: "intermediate",
      title: "The grade ladder",
      prompt:
        "scores = [91, 78, 64, 55, 88, 72] map to letter grades: A for 80 and up, B for 70-79, C for 60-69, F below 60. Build the grade array with NESTED np.where calls — no loops, no if statements, one expression — and print it. Read your expression inside-out: the innermost where is the last elif. Expected output: one line of six letters: A B C F A B.",
      hint: "np.where(scores >= 80, \"A\", np.where(scores >= 70, \"B\", np.where(scores >= 60, \"C\", \"F\"))) — the False branch of each where is the next question down the ladder.",
      starter: `import numpy as np

scores = np.array([91, 78, 64, 55, 88, 72])

# TODO: nested np.where -- A (>= 80), B (>= 70), C (>= 60), else F
`,
      solution: `import numpy as np

scores = np.array([91, 78, 64, 55, 88, 72])

grades = np.where(scores >= 80, "A",
         np.where(scores >= 70, "B",
         np.where(scores >= 60, "C", "F")))
print(grades)
`,
      expectedOutput: `['A' 'B' 'C' 'F' 'A' 'B']`,
      concepts: ["np.where", "nested conditionals", "vectorization"],
    },
    {
      id: "e-i4",
      tier: "intermediate",
      title: "Fix the crash (read the shapes!)",
      prompt:
        "This code crashes with a broadcasting ValueError. Read the two shapes in the error OUT LOUD, right to left: which pair refuses? Then fix it with ONE keyword so each row is divided by its own norm (the (4,) row of norms must become a (4, 1) column). Print the normalized matrix rounded to 4 decimals and a boolean proving every row now has norm 1.",
      hint: "Right-align the shapes from the error: (4, 3) over (1, 4) — the trailing pair is 3 vs 4, and neither is 1, so the division refuses. keepdims=True keeps each row's norm in a (4, 1) column instead of a flat (4,) row, and (4, 3) / (4, 1) broadcasts.",
      starter: `import numpy as np

M = np.array([[3.0, 4.0, 5.0],
              [6.0, 8.0, 10.0],
              [1.0, 1.0, 1.0],
              [2.0, 0.0, 2.0]])

# scale each row to length 1
norms = np.linalg.norm(M, axis=1)      # forgot something?
print(M / norms)
`,
      solution: `import numpy as np

M = np.array([[3.0, 4.0, 5.0],
              [6.0, 8.0, 10.0],
              [1.0, 1.0, 1.0],
              [2.0, 0.0, 2.0]])

norms = np.linalg.norm(M, axis=1, keepdims=True)
N = M / norms
print(np.round(N, 4))
print("every row has norm 1:", np.allclose(np.linalg.norm(N, axis=1), 1.0))
`,
      expectedOutput: `[[0.4243 0.5657 0.7071]
 [0.4243 0.5657 0.7071]
 [0.5774 0.5774 0.5774]
 [0.7071 0.     0.7071]]
every row has norm 1: True`,
      starterExpectError:
        "ValueError: operands could not be broadcast together with shapes (4,3) (4,)",
      concepts: ["keepdims", "broadcast debugging", "error reading"],
    },
    {
      id: "e-a1",
      tier: "advanced",
      title: "Every corner of the rectangle",
      prompt:
        "The four points [0,0], [3,0], [0,4], [3,4] are the corners of a 3x4 rectangle. Build the 4x4 pairwise distance matrix with the 3-D broadcast pattern (P[:, None, :] - P[None, :, :], squared, summed over axis 2, square-rooted) — no loops, no double loop. Print it rounded to 4 decimals, a boolean proving it is symmetric (D equals D.T exactly), a boolean proving the diagonal is all zeros (np.allclose on np.diag), and the corner-to-corner distance D[0, 3] — the diagonal of the rectangle.",
      hint: "diff has shape (4, 4, 2): every pair's coordinate difference in one temporary. .sum(axis=2) collapses the coordinate axis; np.sqrt finishes. The corner-to-corner distance should look familiar: it is the 5 of a 3-4-5 triangle.",
      starter: `import numpy as np

P = np.array([[0.0, 0.0],
              [3.0, 0.0],
              [0.0, 4.0],
              [3.0, 4.0]])   # corners of a 3 x 4 rectangle

# TODO: (p, 1, d) - (1, p, d) -> square -> sum axis=2 -> sqrt
# TODO: print rounded matrix, symmetry check, zero-diagonal check, D[0, 3]
`,
      solution: `import numpy as np

P = np.array([[0.0, 0.0],
              [3.0, 0.0],
              [0.0, 4.0],
              [3.0, 4.0]])

diff = P[:, None, :] - P[None, :, :]
D = np.sqrt((diff ** 2).sum(axis=2))

print(np.round(D, 4))
print("symmetric:", np.array_equal(D, D.T))
print("zero diagonal:", np.allclose(np.diag(D), 0.0))
print("corner-to-corner distance:", D[0, 3])
`,
      expectedOutput: `[[0. 3. 4. 5.]
 [3. 0. 5. 4.]
 [4. 5. 0. 3.]
 [5. 4. 3. 0.]]
symmetric: True
zero diagonal: True
corner-to-corner distance: 5.0`,
      concepts: ["pairwise broadcasting", "axis reductions", "distance matrix"],
    },
    {
      id: "e-a2",
      tier: "advanced",
      title: "Count every vote",
      prompt:
        "Twelve voters chose among 3 candidates: votes = [0, 1, 2, 0, 1, 0, 0, 2, 2, 2, 1, 0]. The starter shows the TRAP: fancy-index += is buffered, so duplicate indexes land only once and the naive counts total 3 of 12. Count correctly with np.add.at (every hit lands), print BOTH count arrays with their totals, and print the winning candidate (np.argmax of the correct counts). Expected output: naive [1 1 1] totaling 3, correct [5 3 4] totaling 12, winner 0.",
      hint: "np.add.at(counted, votes, 1) — the duplicate-safe scatter-add. The receipt to keep forever: counted.sum() must equal votes.size (12). np.argmax(counted) names the winner.",
      starter: `import numpy as np

votes = np.array([0, 1, 2, 0, 1, 0, 0, 2, 2, 2, 1, 0])   # 12 voters, 3 candidates

naive = np.zeros(3, dtype=int)
naive[votes] += 1            # the trap, run as-is: watch it lose votes

# TODO: count every vote with np.add.at, print both counts + totals + winner
`,
      solution: `import numpy as np

votes = np.array([0, 1, 2, 0, 1, 0, 0, 2, 2, 2, 1, 0])

naive = np.zeros(3, dtype=int)
naive[votes] += 1            # the trap: duplicates land once

counts = np.zeros(3, dtype=int)
np.add.at(counts, votes, 1)  # the fix: every hit counts

print("naive :", naive, "total", naive.sum())
print("add.at:", counts, "total", counts.sum())
print("winner is candidate", np.argmax(counts))
`,
      expectedOutput: `naive : [1 1 1] total 3
add.at: [5 3 4] total 12
winner is candidate 0`,
      concepts: ["np.add.at", "fancy indexing duplicates", "argmax"],
    },
    {
      id: "e-a3",
      tier: "advanced",
      title: "The pass circuit",
      prompt:
        "Six students took three tests each (the matrix is given). A student passes when their MEAN is at least 60 AND their LOWEST test is at least 40 — both conditions on per-student statistics (axis=1). Compute the means (rounded to 2 decimals for printing), the minimums, the pass mask with ONE & expression, the PASS/RETRY labels with np.where, and the count of passes. Expected output: five lines — means, lows, labels, then 'passed: 3 of 6'.",
      hint: "means = tests.mean(axis=1) and lows = tests.min(axis=1) are both (6,) — parallel vectors, so & works directly with no keepdims needed (you are comparing them, not dividing a matrix by them). Then np.where(passed, \"PASS\", \"RETRY\").",
      starter: `import numpy as np

tests = np.array([[55, 70, 65],
                  [90, 95, 88],
                  [40, 38, 45],
                  [70, 45, 62],
                  [85, 90, 91],
                  [58, 59, 60]])

# TODO: per-student means and minimums (axis=1)
# TODO: pass rule as one & expression, labels with np.where, count of passes
`,
      solution: `import numpy as np

tests = np.array([[55, 70, 65],
                  [90, 95, 88],
                  [40, 38, 45],
                  [70, 45, 62],
                  [85, 90, 91],
                  [58, 59, 60]])

means = tests.mean(axis=1)
lows  = tests.min(axis=1)
passed = (means >= 60) & (lows >= 40)

print("means :", np.round(means, 2))
print("lows  :", lows)
print(np.where(passed, "PASS", "RETRY"))
print("passed:", np.count_nonzero(passed), "of", tests.shape[0])
`,
      expectedOutput: `means : [63.33 91.   41.   59.   88.67 59.  ]
lows  : [55 88 38 45 85 58]
['PASS' 'PASS' 'RETRY' 'RETRY' 'PASS' 'RETRY']
passed: 3 of 6`,
      concepts: ["axis reductions", "compound masks", "np.where"],
    },
    {
      id: "e-a4",
      tier: "advanced",
      title: "The honest pairwise benchmark",
      prompt:
        "Time the two pairwise-gap implementations from Lesson e-04 on n = 300 points: a double Python loop filling an (n, n) matrix with abs(x[i] - x[j]), versus the one-expression np.abs(np.subtract.outer(x, x)). Print the loop time in ms, the array time in ms, the speedup ratio (1 decimal), and a boolean that both computed identical answers. Timings differ per machine — that is expected; your code must run cleanly and print the four lines. (The auto-check is disabled for this one: outputs are machine-dependent. Run it, read YOUR ratio.)",
      hint: "time.perf_counter() twice around each block, ms = seconds * 1000. Guard division with max(array_ms, 1e-6). The equality check: np.array_equal(looped, fast) — the answers must agree even when the times do not.",
      starter: `import numpy as np
import time

n = 300
x = np.linspace(0.0, 10.0, n)

# TODO: time the double loop -- every ordered pair abs(x[i] - x[j])
# TODO: time the one-expression version: np.abs(np.subtract.outer(x, x))
# TODO: print loop ms, array ms, speedup ratio, answers-agree boolean
`,
      solution: `import numpy as np
import time

n = 300
x = np.linspace(0.0, 10.0, n)

start = time.perf_counter()
looped = np.empty((n, n))
for i in range(n):
    for j in range(n):
        looped[i, j] = abs(x[i] - x[j])
loop_ms = (time.perf_counter() - start) * 1000

start = time.perf_counter()
fast = np.abs(np.subtract.outer(x, x))
array_ms = (time.perf_counter() - start) * 1000

print(f"double loop     : {loop_ms:.1f} ms")
print(f"subtract.outer  : {array_ms:.1f} ms")
print(f"same answers    : {np.array_equal(looped, fast)}")
print(f"speedup         : {loop_ms / max(array_ms, 1e-6):.1f}x")
`,
      concepts: ["benchmarking", "ufunc outer", "vectorization", "perf_counter"],
    },
  ],

  // -----------------------------------------------------------------
  // Part E assessment (8 questions, 80% to pass)
  // -----------------------------------------------------------------
  assessment: [
    {
      id: "e-as-1",
      prompt: "A batch of 8 samples x 3 classes (shape (8, 3)) plus a bias vector of shape (3,) does what?",
      options: [
        { text: "Adds each class's bias to that class's column across all 8 samples — result (8, 3)", correct: true, feedback: "Right: the (3,) row pairs with the class columns (3 = 3) and stretches down all 8 samples — the bias-add pattern from Lesson e-02." },
        { text: "Adds the bias to the first sample only — result (8, 3)", correct: false, feedback: "Nothing in broadcasting picks favorites: a (3,) row meets EVERY row of the (8, 3) batch, all 8 at once." },
        { text: "Raises ValueError, because (8, 3) and (3,) do not match", correct: false, feedback: "They do not need to match — they need to BROADCAST: right-aligned, the trailing 3 = 3 pair matches and the missing axis stretches to 8." },
        { text: "Produces shape (8, 1) by averaging the classes", correct: false, feedback: "No operation averages anything here; the result carries the broadcast shape, which is (8, 3) — every dimension at its stretched size." },
      ],
      explanation: "(8, 3) + (3,): the bias row matches the columns and stretches down the samples — one bias vector applied to a whole batch.",
    },
    {
      id: "e-as-2",
      prompt: "`np.arange(3) + np.arange(3).reshape(3, 1)` produces:",
      options: [
        { text: "A (3, 3) addition table — the flat array acted as a row, and both 1s stretched", correct: true, feedback: "Correct — the famous trap when accidental, the outer product when deliberate: (3,) right-aligns as (1, 3), meets the (3, 1) column, and every element meets every element." },
        { text: "A (3,) array of three sums", correct: false, feedback: "That would be np.arange(3) + np.arange(3) — parallel shapes. The reshape(3, 1) turns the second operand into a COLUMN, and the double stretch begins." },
        { text: "A (6,) concatenation", correct: false, feedback: "Concatenation is LIST behavior — on arrays, + is element-wise addition (with broadcasting deciding the shapes)." },
        { text: "ValueError — a 1-D and a 2-D array cannot combine", correct: false, feedback: "They combine whenever the rule is satisfied; here every dimension pair holds a 1 or a match, which is the license to stretch." },
      ],
      explanation: "(1, 3) + (3, 1): both operands stretch toward each other — the signature of the outer-product shape, result (3, 3).",
    },
    {
      id: "e-as-3",
      prompt: "Why does `M / np.linalg.norm(M, axis=1, keepdims=True)` work when the same line WITHOUT keepdims crashes?",
      options: [
        { text: "keepdims keeps each row's norm as a (n, 1) column, which stretches across the row's columns; without it the (n,) norms right-align as a row and refuse to pair with the rows", correct: true, feedback: "Exactly: (n, k) / (n, 1) broadcasts (the 1 stretches right); (n, k) / (n,) fails because the trailing pair is k vs n. Shape decides everything." },
        { text: "keepdims makes the norms smaller, so the division is faster", correct: false, feedback: "The VALUES are identical with or without keepdims — only the SHAPE changes (the collapsed axis is kept at size 1 instead of dropped)." },
        { text: "keepdims converts the norms to a matrix so NumPy allows matrix division", correct: false, feedback: "There is no special 'matrix division' gate: the same broadcasting rule judges every operation. keepdims only shapes the result to be broadcast-friendly." },
        { text: "Without keepdims the norm is computed per column instead of per row", correct: false, feedback: "axis=1 decides per-row norms in both cases. keepdims changes the RESULT SHAPE, never which axis collapses." },
      ],
      explanation: "keepdims=True keeps the collapsed axis at size 1: (n, 1) columns pair with rows; (n,) rows do not. On square matrices the missing keepdims is worse — it computes silently wrong math.",
    },
    {
      id: "e-as-4",
      prompt: "A loop builds pass/fail labels by branching on each score. The vectorized replacement is:",
      options: [
        { text: "np.where(scores >= 60, \"pass\", \"fail\")", correct: true, feedback: "Right — the branch killer: one boolean mask decides for every element, and where assembles the labels in one expression." },
        { text: "np.if(scores >= 60, \"pass\", \"fail\")", correct: false, feedback: "No such function exists — np.if is not a thing. The vectorized if/else is np.where." },
        { text: "scores >= 60", correct: false, feedback: "That is only the MASK (a boolean array) — it decides, but it does not produce the labels. where turns the decision into values." },
        { text: "A list comprehension with an if/else inside — still one line", correct: false, feedback: "It is one line of SYNTAX but still a loop in disguise: Python visits every element. The array op hands the whole decision to compiled code." },
      ],
      explanation: "np.where(condition, x, y) is the vectorized if/else — the mask chooses per element between two branches in one expression.",
    },
    {
      id: "e-as-5",
      prompt: "Which expression correctly counts the values of `a` strictly between 0 and 1?",
      options: [
        { text: "np.count_nonzero((0 < a) & (a < 1))", correct: true, feedback: "Correct: two parenthesized comparisons, AND-ed elementwise, counted — the array spelling of a range check." },
        { text: "np.count_nonzero(0 < a < 1)", correct: false, feedback: "The chained comparison crashes before count_nonzero is ever called: bool() of the intermediate boolean array is ambiguous." },
        { text: "np.count_nonzero(0 < a and a < 1)", correct: false, feedback: "Python's and needs one yes-or-no; the comparisons each return arrays. Same ValueError as the chain." },
        { text: "len(a[(a > 0) | (a < 1)])", correct: false, feedback: "Two problems: | is OR (matching almost every number), and this counts rather than... it would work mechanically for OR — but 'between 0 and 1' is an AND of two conditions." },
      ],
      explanation: "Ranges are (a > lo) & (a < hi): parentheses mandatory, & elementwise — never chained comparisons, never and/or.",
    },
    {
      id: "e-as-6",
      prompt: "Which statement about ufuncs is TRUE?",
      options: [
        { text: "Every operator is a ufunc call — + is np.add, > is np.greater — and np.add.reduce is the machine underneath np.sum", correct: true, feedback: "Right: operators are syntax sugar over ufunc function objects, and those objects carry methods — reduce being the one np.sum dispatches to." },
        { text: "ufuncs are Python functions NumPy writes in the numpy source file, one per operator", correct: false, feedback: "They are compiled function OBJECTS (type ufunc), not ordinary Python functions — which is exactly why they can carry methods like reduce and outer." },
        { text: "np.add.reduce(M) equals M.sum() for any M", correct: false, feedback: "Only with matching axes: reduce's default axis is 0 (column sums on a 2-D M), while sum's default is None (everything). State the axis in both." },
        { text: "ufunc methods like reduce exist only for add, multiply and a few core operators", correct: false, feedback: "EVERY binary ufunc has them: maximum.reduce (max), logical_and.reduce (all), subtract.outer, maximum.accumulate — one idiom across the whole operator dictionary." },
      ],
      explanation: "Operators are ufunc calls, and ufunc methods (reduce, accumulate, outer, at) generalize each operator across axes, trajectories, pairs and scattered positions.",
    },
    {
      id: "e-as-7",
      prompt: "`counts = np.zeros(3, dtype=int)`, `hits = np.array([2, 2, 0, 2])`. Which counts hits correctly?",
      options: [
        { text: "np.add.at(counts, hits, 1) — position 2 ends up at 3", correct: true, feedback: "Correct: the unbuffered scatter-add visits position 2 three times, so all three increments land — total 4 of 4, the receipt checks out." },
        { text: "counts[hits] += 1 — position 2 ends up at 3", correct: false, feedback: "The fancy form is buffered: the three writes to position 2 overwrite each other, leaving ONE increment. Position 2 ends up at 1 — and 3 of 4 hits vanish." },
        { text: "counts[hits] = counts[hits] + 3 — position 2 ends up at 3", correct: false, feedback: "Same buffering problem, now explicit: gather three 0s, add 3 to each, scatter three 3s onto the same slot — the last write wins and 2 stays at 3 only by luck of the count; change the data and it breaks." },
        { text: "np.scatter(counts, hits)", correct: false, feedback: "No such function — and the general scatter lever lives as a METHOD on ufuncs: np.add.at, np.subtract.at, np.maximum.at." },
      ],
      explanation: "np.add.at is the duplicate-safe counter: every hit lands. The receipt: counts.sum() must equal the number of events.",
    },
    {
      id: "e-as-8",
      prompt: "`buf = np.zeros(4)`, then `np.sqrt(x, where=x >= 0, out=buf)` with two negative values in x. Afterwards, buf holds:",
      options: [
        { text: "Real square roots at the nonnegative positions and buf's OLD values (0.0) at the skipped ones", correct: true, feedback: "Exactly: where= decides WHERE to compute, out= decides what the rest of the output holds — the untouched positions keep the buffer's previous contents." },
        { text: "NaN at the skipped positions", correct: false, feedback: "NaN would mean sqrt was attempted and failed. It was never attempted — the positions were skipped entirely, so they keep whatever out= held." },
        { text: "It raises an error, because sqrt of a negative is undefined", correct: false, feedback: "The negatives are shielded — where= never hands them to sqrt. Without where= you would get warnings and NaNs; with it, they are simply not computed." },
        { text: "Real square roots everywhere, with the negatives clamped to 0", correct: false, feedback: "No clamping happens — where= skips, it does not substitute. Zero-substitution would be np.where(x >= 0, np.sqrt(np.abs(x)), 0.0), a different (and explicit) expression." },
      ],
      explanation: "where= + out= are a pair: selective computation into a buffer you prefilled. Never read the output of a where= call that had no out=.",
    },
  ],

  // -----------------------------------------------------------------
  // Part E mini project
  // -----------------------------------------------------------------
  project: {
    title: "The Standardization Engine",
    brief:
      "Build a small feature-scaling toolkit that turns a raw sensor matrix into analysis-ready data in four broadcast-powered functions: z-score every column (so wildly different units share one scale), normalize every row to unit length (so days are compared by PATTERN, not magnitude), compute the whole pairwise similarity matrix in one 3-D broadcast (no loops, no double loops), and generate a repair report with np.where that flags any reading more than 3 standard deviations from typical. The raw material is a 12-day x 4-sensor matrix, formula-built with one deliberately planted spike — your engine must find it. And because this course proves its claims, the finished engine prints its own correctness receipts: deterministic booleans from np.allclose that certify every stage. This is the preprocessing pipeline at the heart of nearly every machine-learning workflow, compressed into the patterns of Part E.",
    requirements: [
      "A function zscore_columns(X) that returns (X - column means) / column stds as ONE broadcast expression — no loops",
      "A function normalize_rows(X) that divides each row by its own norm, with keepdims=True so the norms form an (n, 1) column",
      "A function similarity(N) that returns the (n, n) matrix of dot products between every pair of rows, built with ONE 3-D broadcast expression — (n, 1, k) against (1, n, k), summed over the last axis — no loops",
      "A function repair_report(Z, threshold=3.0) that labels every cell 'REVIEW' where the absolute z-score exceeds the threshold and 'OK' elsewhere, with one np.where line",
      "Correctness proofs printed as deterministic booleans: z-scored columns have mean 0 and std 1 (np.allclose against 0 and 1), and normalized rows all have norm 1",
      "Similarity sanity receipts: the diagonal of the similarity matrix is all 1 (each unit row dotted with itself), and the matrix equals its transpose",
      "The repair report flags EXACTLY one cell — the planted spike — and the program prints how many cells were flagged and their (day, sensor) coordinates",
    ],
    steps: [
      "Run the starter as-is and read what it prints: the feature matrix is (12, 4), and sensor B's healthy range is 50 to 56 while its day-8 reading is 500 — a spike planted on purpose, so your report has something real to find.",
      "Implement zscore_columns with one broadcast line (Lesson e-02's Pattern 6). Then add the two proof prints — np.allclose(Z.mean(axis=0), 0.0) and np.allclose(Z.std(axis=0), 1.0) — and run: both must print True.",
      "Implement normalize_rows with keepdims=True (Pattern 2). Prove it: np.allclose(np.linalg.norm(N, axis=1), 1.0) must print True. If you crash with 'operands could not be broadcast', you forgot the keyword — read the shapes in the error out loud.",
      "Implement similarity with the 3-D broadcast (Pattern 5's shape, a dot product instead of a distance): (N[:, None, :] * N[None, :, :]).sum(axis=2). Prove it: np.allclose(np.diag(S), 1.0) and np.array_equal(S, S.T) must both print True.",
      "Implement repair_report with one np.where line on np.abs(Z). Run the engine end to end: exactly ONE cell must be flagged, and its coordinates must be (8, 1) — day 8, sensor B, the spike. Print the flag count and the coordinates with np.argwhere(report == \"REVIEW\").",
      "Print the z-score of the spike rounded to 4 decimals, and confirm in a comment that it is the largest absolute z-score in the whole matrix (np.abs(Z).max()) — the report flagged the single most abnormal reading, as a repair report should.",
      "Break it on purpose, once: change the spike to a value that is only slightly high (say 60.0) and re-run — the report should flag NOTHING (no reading is 3 deviations out anymore), and every proof must still print True. Then restore the spike.",
    ],
    starter: `import numpy as np

# ---------------------------------------------------------------------------
# THE STANDARDIZATION ENGINE -- a feature-scaling toolkit in four functions
# ---------------------------------------------------------------------------

def zscore_columns(X):
    """Return a copy of X where every column has mean 0 and std 1.

    One broadcast line: subtract the (k,) row of column means, then divide
    by the (k,) row of column stds (Pattern 6, Lesson e-02).
    """
    # TODO: one broadcast expression
    return X.copy()

def normalize_rows(X):
    """Return a copy of X where every row has length 1.

    Row statistics need keepdims=True so the norms come out as an (n, 1)
    column that stretches across each row (Pattern 2, Lesson e-02).
    """
    # TODO: one broadcast expression
    return X.copy()

def similarity(N):
    """Return the (n, n) matrix of dot products between every pair of rows.

    Broadcast (n, 1, k) against (1, n, k) and sum the last axis -- the
    pairwise pattern (Pattern 5, Lesson e-02) with a dot product instead
    of a distance.
    """
    # TODO: one broadcast expression, no loops
    return np.zeros((N.shape[0], N.shape[0]))

def repair_report(Z, threshold=3.0):
    """Return labels: 'REVIEW' where |Z| > threshold, 'OK' everywhere else."""
    # TODO: one np.where line
    return np.full(Z.shape, "OK")

# --- raw material: 12 days x 4 sensors, formula-built + one planted spike ---
n = 12
X = np.column_stack([
    40 + 3 * np.arange(n),           # sensor A: steady drift
    50 + (np.arange(n) * 5) % 7,     # sensor B: weekly cycle
    20 + (np.arange(n) * 3) % 4,     # sensor C: fast cycle
    10 + np.arange(n) // 2,          # sensor D: staircase
])
X[8, 1] = 500.0                      # sensor B fails on day 8: a spike

print("feature matrix:", X.shape)
print("planted spike (day 8, sensor B):", X[8, 1])
print("sensor B's healthy range:", X[X[:, 1] < 100, 1].min(), "to", X[X[:, 1] < 100, 1].max())

# --- the engine, wired up (placeholders until you finish the TODOs) ---
Z = zscore_columns(X)
N = normalize_rows(Z)
S = similarity(N)
report = repair_report(Z)

print("repair flags so far:", np.count_nonzero(report == "REVIEW"),
      "(finish the TODOs, then re-run)")
`,
    concepts: ["z-score", "keepdims", "pairwise broadcasting", "np.where", "np.allclose", "deterministic proofs"],
    extension:
      "Two stretch goals: (1) Prove your broadcast similarity against the matrix product N @ N.T with np.allclose — same numbers, very different memory story at scale (the @ operator gets its full treatment in Part H). (2) Plant a SECOND spike in another column, re-run, and confirm the repair report now flags exactly two cells with the right coordinates — a report you can trust is one whose count you can predict.",
  },
};
