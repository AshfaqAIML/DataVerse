/**
 * PART D — GETTING AT THE DATA: INDEXING, SLICING, VIEWS
 *
 * The part where the ndarray becomes reachable: basic indexing done
 * properly (one index per axis, views all the way down) -> slicing with
 * start:stop:step on every axis (clamping, negative steps, slice
 * assignment, strided views) -> THE memory lesson (views vs copies, base,
 * shares_memory, the classic mutating-row bug) -> boolean indexing
 * (questions become masks) -> fancy indexing (lists of places, paired
 * indexes, np.ix_, last-write-wins) -> the specialist toolkit (take, put,
 * choose, select) plus a combined data-surgery run.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 * Machine-dependent outputs use lang "bash"/"text" and are never presented
 * as verified program output.
 *
 * Authoring conventions:
 *   - code blocks use the AUTOFILL placeholder for their output field; the
 *     verifier fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 *   - every view-vs-copy claim in prose is backed by a nearby verified
 *     np.shares_memory or mutation demo.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_D: NumpyPart = {
  letter: "D",
  title: "Getting at the Data: Indexing, Slicing, Views",
  tagline: "Every way to reach into an array — and the memory model that decides what writes back",
  description:
    "Data sitting in an array is useless until you can reach exactly the pieces you need: one element, a row, every other column, 'wherever the value is too high'. This part teaches every route in — basic indexing with one index per axis, slicing with start:stop:step on every axis, boolean masks that answer questions about your data, and fancy indexing that visits places in your order — and then teaches the thing most courses skip: which of those operations hand you a view onto the original memory and which hand you a fresh copy. You will prove it with np.shares_memory, meet the classic bug where 'reading out a row' silently mutates the original, and finish with the specialist toolkit (take, put, choose, select) and a full data-surgery project.",
  lessons: [
    // ------------------------------------------------------------- d-01
    {
      slug: "d-01",
      title: "Indexing, Properly",
      minutes: 16,
      summary:
        "You met a[1, 2] in Part A; now make it systematic. One index per axis, negatives counting from the end, and the fact that changes everything downstream: every integer index removes a dimension — and hands you a view, not a copy.",
      kind: "concept",
      objectives: [
        "Select single elements with one index per axis, mixing positive and negative indexes freely",
        "Explain why indexing reduces ndim — and predict the shape of a[1] taken from a 2-D array",
        "Assign through basic indexing (a[1, 2] = 99, a[2] = [...]) and know the value must fit the selected shape",
        "Choose a[1, 2] over chained a[1][2] for reads, and explain why the difference will matter for writes",
        "Use ... and np.newaxis as indexes, with a taste of where each earns its keep",
      ],
      why: "Indexing is the single most-used operation in all of NumPy — every DataFrame lookup, every image crop, every model prediction passes through it. Doing it 'mostly right' means a lifetime of off-by-one errors and surprise mutations, because two facts hide under the familiar brackets: each integer index collapses one axis (so a[1] of a 2-D array is a 1-D array, not a row-object), and basic indexing never copies (so the row you 'extracted' is a live window onto the original). This lesson makes both facts visible and verified, so the slicing, views and boolean lessons that follow have a solid floor to stand on.",
      blocks: [
        {
          kind: "text",
          text: "Part A gave you the ten-second version: to fetch one element you give **one index per axis**, `a[row, col]`. That is the right instinct. This lesson deepens it into something you can lean on: how negative indexes really behave, what indexing does to the array's *shape*, how to **write** through an index, and the quiet superpower underneath it all — everything you get back from basic indexing is a **view** onto the original array's memory.",
        },
        {
          kind: "heading",
          text: "Recap with teeth: one index per axis, negatives from the end",
        },
        {
          kind: "text",
          text: "The brackets hold one position per axis, in axis order: first index walks down axis 0 (rows), second walks across axis 1 (columns). Each index may be **negative**, counting from that axis's end — and the two axes are independent, so `a[2, -2]` mixes a positive row with a negative column without complaint.",
        },
        {
          kind: "code",
          title: "Reading single elements, positive and negative",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[1, 2]   =", a[1, 2])      # row 1, column 2 -> one index per axis
print("a[-1, -1] =", a[-1, -1])    # last row, last column
print("a[-1, 0]  =", a[-1, 0])     # last row, first column
print("a[2, -2]  =", a[2, -2])     # positive and negative mix freely
`,
          output: `a[1, 2]   = 22
a[-1, -1] = 33
a[-1, 0]  = 30
a[2, -2]  = 32`,
          outputNote: "Same 3x4 grid as Part A's anatomy lesson, so you can check every value against the picture in your head.",
          explain: [
            "`a[1, 2]` is 22: the first index selects row 1, the second selects column 2. One bracket, one comma, one lookup.",
            "`a[-1, -1]` is 33 — minus one on each axis counts from that axis's end, independently.",
            "`a[2, -2]` is 32: last row, second-to-last column. Mixing signs per axis is completely legal.",
          ],
        },
        {
          kind: "heading",
          text: "Indexing shrinks the array: a[1] of a 2-D is a 1-D",
        },
        {
          kind: "text",
          text: "Here is the fact that reorganizes everything: **every integer index removes one axis**. Give two indexes to a 2-D array and you get a 0-dimensional scalar. Give one index and you get a **1-D array** — the whole row, as an ndarray in its own right, with its own shape and its own indexing. There is no special 'row object' in NumPy: a row of a 2-D array just *is* a 1-D array.",
        },
        {
          kind: "code",
          title: "Watch the dimensions fall",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a        ndim:", a.ndim, "shape:", a.shape)
print("a[1]     ndim:", a[1].ndim, "shape:", a[1].shape)
print("a[1, 2]  ndim:", a[1, 2].ndim, "shape:", a[1, 2].shape)
`,
          output: `a        ndim: 2 shape: (3, 4)
a[1]     ndim: 1 shape: (4,)
a[1, 2]  ndim: 0 shape: ()`,
          outputNote: "One index per axis given, one axis removed per index given: 2-D -> 1-D -> 0-D (a scalar).",
          explain: [
            "`a` is 2-D with shape (3, 4) — two axes, so two indexes available.",
            "`a[1]` used ONE index, so one axis is gone: a 1-D array of shape (4,). It is the whole second row, alive and indexable.",
            "`a[1, 2]` used both indexes, so both axes are gone: a 0-dimensional scalar with shape (). You cannot index it further.",
          ],
        },
        {
          kind: "heading",
          text: "And that row is a VIEW — verified",
        },
        {
          kind: "text",
          text: "When you 'extract' a row with an integer index, NumPy does not copy four numbers into new memory. It hands you a **view**: a new header pointing into the *same data block*. Change the row, and the parent array changes. Lesson d-03 turns this into a full theory; here is the proof, so the claim is never hearsay:",
        },
        {
          kind: "code",
          title: "A row extracted by index is a live window",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

row = a[1]                                   # "just reading out row 1"
print("row shares memory with a:", np.shares_memory(a, row))

row[0] = 99                                  # write through the row...
print("a's row 1 is now      :", a[1])       # ...and a felt it

a[1, 0] = 20                                 # put it back, through the parent
print("restored              :", a[1])
`,
          output: `row shares memory with a: True
a's row 1 is now      : [99 21 22 23]
restored              : [20 21 22 23]`,
          outputNote: "np.shares_memory says True, and the mutation demo confirms it: the row and the parent are the same bytes.",
          explain: [
            "`np.shares_memory(a, row)` returns True — no new block was allocated for the row; it is a header that walks a's memory.",
            "`row[0] = 99` therefore landed inside `a` — printing a's row 1 shows 99. Reading out a row is not taking a copy.",
            "`a[1, 0] = 20` writes through the parent and the row sees it too. One block of memory, two front doors.",
          ],
        },
        {
          kind: "visual",
          title: "One block of memory, two headers",
          ascii: `  a  (shape (3, 4), strides (32, 8))       row = a[1]
  +---------------------------+            (shape (4,), strides (8,))
  | header: shape, dtype, ... |            +---------------------------+
  +---------------------------+            | header: shape, dtype, ... |
  |                           |            +---------------------------+
  |   data block              |<--same--   |                           |
  |   10 11 12 13             |  bytes     |   (points into a's block, |
  |   20 21 22 23  <- row     |            |    32 bytes in)           |
  |   30 31 32 33             |            +---------------------------+
  +---------------------------+
  writing through either header edits the SAME numbers`,
          caption:
            "Basic indexing never touches the data block — it builds a new header aimed at the old bytes. Cheap (no copy), powerful, and the reason Lesson d-03 exists.",
        },
        {
          kind: "heading",
          text: "Writing through an index: assignment",
        },
        {
          kind: "text",
          text: "Anything you can read with basic indexing you can also **write**: put `a[indexes] = value` and the selected cells take the value. The one rule: the value you assign must fit the shape you selected — a scalar fits anywhere (it broadcasts to every selected cell), and a sequence must match the selected shape exactly. Broadcasting rules arrive in Part G; today, scalar-and-exact-shape covers you safely.",
        },
        {
          kind: "code",
          title: "Assignment through indexing (int array, int values)",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

a[1, 2] = 99                    # one element
print("after a[1, 2] = 99:")
print(a)

a[2] = [41, 42, 43, 44]         # one whole row: list fits the row's shape (4,)
print("after a[2] = [41, 42, 43, 44]:")
print(a)

a[0, -1] += 100                 # read-modify-write through an index
print("row 0 after a[0, -1] += 100:", a[0])
`,
          output: `after a[1, 2] = 99:
[[10 11 12 13]
 [20 21 99 23]
 [30 31 32 33]]
after a[2] = [41, 42, 43, 44]:
[[10 11 12 13]
 [20 21 99 23]
 [41 42 43 44]]
row 0 after a[0, -1] += 100: [ 10  11  12 113]`,
          outputNote: "All values stay integers — the dtype is never disturbed. Assignment shapes: scalar anywhere, exact-fit sequence for a row.",
          explain: [
            "`a[1, 2] = 99` replaced 22 with 99 in place. No new array is created; the write goes straight into the block.",
            "`a[2] = [41, 42, 43, 44]` rewrites a whole row because the list's length (4) matches the row's shape.",
            "`a[0, -1] += 100` is sugar for 'read a[0, -1], add 100, write it back' — 13 became 113.",
          ],
        },
        {
          kind: "heading",
          text: "Chained brackets vs the comma: a[1][2] vs a[1, 2]",
        },
        {
          kind: "text",
          text: "Two syntaxes, one value — for reads. `a[1, 2]` is a single indexing operation that NumPy resolves in one step. `a[1][2]` is two operations: first `a[1]` builds the row view, then `[2]` indexes that view. For basic indexing the results are identical; the comma form is still better — it is one lookup, it extends naturally to more axes, and it is the only form that behaves correctly when you **write** through fancier indexes (Lesson d-03 shows the exact case where chaining silently writes to a throwaway copy).",
        },
        {
          kind: "code",
          title: "Same value today; trust the comma",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[1, 2] :", a[1, 2])    # one operation: row 1, column 2
print("a[1][2] :", a[1][2])    # two operations: a[1] -> row view, then [2]
`,
          output: `a[1, 2] : 22
a[1][2] : 22`,
          outputNote: "Identical value — both are 22. The difference is cost today (two lookups vs one) and correctness tomorrow (Lesson d-03).",
          explain: [
            "`a[1, 2]` — the tuple (1, 2) is resolved by a single, optimizable indexing call. This is the idiom the whole ecosystem uses.",
            "`a[1][2]` — works, but builds an intermediate row view just to index it again. On reads, harmless; on writes, dangerous.",
            "House rule for this course: keep the whole index inside ONE pair of brackets.",
          ],
        },
        {
          kind: "heading",
          text: "Two special indexers: ... and np.newaxis",
        },
        {
          kind: "text",
          text: "Two more things legally fit inside the brackets, and both are worth a taste now. The **ellipsis** `...` means 'all remaining axes' — with a 3-D array, `cube[..., 1]` selects column 1 of every row of every table without typing `:, :, ` out. And **np.newaxis** (also spelled `None`) inside an index does the opposite of a normal index: instead of removing an axis, it *inserts* a brand-new axis of length 1 — turning a 1-D vector into a column or a row. Its main-content moment comes in Part G, where inserting length-1 axes is how broadcasting begins; you will also use it in this part's mini project.",
        },
        {
          kind: "code",
          title: "Ellipsis reads cleaner; newaxis grows the shape",
          code: `import numpy as np

cube = np.arange(24).reshape(2, 3, 4)   # 2 tables x 3 rows x 4 columns
print("cube[..., 1] shape:", cube[..., 1].shape)
print("same as [:, :, 1]  :", np.array_equal(cube[..., 1], cube[:, :, 1]))

v = np.array([10, 20, 30])
print("v shape               :", v.shape)
print("v[:, np.newaxis] shape:", v[:, np.newaxis].shape)   # a column: (3, 1)
print("v[np.newaxis, :] shape:", v[np.newaxis, :].shape)   # a row: (1, 3)
print("newaxis keeps the data:", np.shares_memory(v, v[:, np.newaxis]))
`,
          output: `cube[..., 1] shape: (2, 3)
same as [:, :, 1]  : True
v shape               : (3,)
v[:, np.newaxis] shape: (3, 1)
v[np.newaxis, :] shape: (1, 3)
newaxis keeps the data: True`,
          outputNote: "cube[..., 1] has shape (2, 3) — the ellipsis covered axes 0 and 1. newaxis added a length-1 axis and copied nothing.",
          explain: [
            "`cube[..., 1]` has shape (2, 3): one explicit index consumed the LAST axis, and ... stood for 'every position on all axes before it'.",
            "`v[:, np.newaxis]` has shape (3, 1) — a column vector; `v[np.newaxis, :]` has shape (1, 3) — a row vector. Same three numbers, different geometry.",
            "`np.shares_memory` is True: newaxis is basic indexing, so it is a view. Reshaping geometry without touching data — the Part G story in miniature.",
          ],
        },
        {
          kind: "tryIt",
          title: "Pull a row, bend it, put it back",
          task: "Run this, then: (1) predict the four corner-tour values BEFORE uncommenting the last line; (2) change row[3] to 77 through the row and confirm a feels it; (3) make a 3x3 grid of your own and fetch its center with negative indexes only.",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

row = a[1]
print("row:", row, "ndim:", row.ndim)
row[0] = 99
print("a's row 1 now:", a[1])
a[1, 0] = 20                    # put it back
print("restored     :", a[1])

# print("corner tour:", a[0, 0], a[0, -1], a[-1, 0], a[-1, -1])
`,
          hint: "The corner tour of this grid is 10, 13, 30, 33 — first and last of the first and last rows. Negative-only for a 3x3 center: a[-2, -2].",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "One index per axis; each index removes an axis; negatives count from each axis's end; and everything you get back is a live window onto the parent's memory — read or write.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where this is going",
          text: "Indexing with single integers selects one position per axis. The natural next question is 'how do I select a RANGE of positions?' — that is slicing, Lesson d-02. The question after that — 'wait, does this copy?' — you have already answered here: it does not, and Lesson d-03 turns that fact into a complete decision table.",
        },
      ],
      terms: [
        { term: "Basic indexing", definition: "Indexing with integers, slices, ellipsis or newaxis — the family that always returns a view of the original memory." },
        { term: "Negative index", definition: "An index counting from the end of its axis: -1 is the last position, -2 the one before, computed per axis independently." },
        { term: "View", definition: "An array that shares its data block with another array: writes through either one are visible in both. Basic indexing returns views." },
        { term: "Ellipsis (...)", definition: "An index placeholder meaning 'all remaining axes' — cube[..., 1] selects column 1 while covering every earlier axis." },
        { term: "np.newaxis", definition: "A special index that INSERTS a length-1 axis instead of selecting one; v[:, np.newaxis] turns a (3,) vector into a (3, 1) column. Star of Part G." },
      ],
      mistakes: [
        {
          mistake: "Expecting a[1] to hand over a safe copy of the row.",
          why: "Basic indexing returns a view — a new header over the same bytes. Mutating the 'extracted' row mutates the parent array, verified in this lesson.",
          fix: "If you need independence, ask for it explicitly: `row = a[1].copy()`. Lesson d-03 builds the complete view/copy decision table.",
        },
        {
          mistake: "Writing a[1][2] = value out of habit (chained brackets).",
          why: "With basic indexing it happens to work, but the habit transfers to fancy indexing, where a[1] returns a COPY — and your write lands in a throwaway array while the original silently stays the same.",
          fix: "Keep the whole index inside one bracket pair: `a[1, 2] = value`. Lesson d-03 demonstrates the exact failure case.",
        },
        {
          mistake: "Indexing past the end of an axis (a[3, 0] on a 3-row array).",
          why: "Single integer indexes must exist — NumPy raises IndexError: index 3 is out of bounds for axis 0 with size 3. There is no silent clamping for integer indexes (slices DO clamp; that is Lesson d-02).",
          fix: "Remember positions run 0 to len-1, and -1 is the last. When unsure, print a.shape first — the professional reflex from Part A.",
        },
      ],
      takeaways: [
        "One index per axis, in axis order: a[row, col]. Each axis accepts positive (from the start) or negative (from the end) positions.",
        "Every integer index removes one axis: a[1] of a 2-D array is a full 1-D array of shape (4,); a[1, 2] is a 0-D scalar.",
        "Basic indexing returns views — np.shares_memory(a, a[1]) is True, and writing through the row writes the parent. No copy happens.",
        "Assignment works through the same brackets: scalar values broadcast to whatever you selected; sequences must match the selected shape exactly.",
        "Prefer a[1, 2] over a[1][2] — one operation, and the only form that stays correct when you write through fancy indexes.",
      ],
      quiz: [
        {
          id: "d-01-q1",
          prompt: "From a 2-D array `a` with shape (3, 4), what exactly is `a[1]`?",
          options: [
            { text: "A 1-D array of shape (4,) that shares memory with a", correct: true, feedback: "Exactly: one index removed one axis, and basic indexing hands back a view onto a's own bytes." },
            { text: "A 2-D array of shape (1, 4) holding a copy of the row", correct: false, feedback: "Two errors: indexing with one integer does not keep the axis as length-1, and basic indexing never copies." },
            { text: "A 1-D array of shape (4,) that is a fresh copy of the row", correct: false, feedback: "The shape is right, the copy is wrong — np.shares_memory(a, a[1]) is True; it is a view." },
            { text: "A Python list of the row's four values", correct: false, feedback: "NumPy returns ndarrays from indexing, not lists — .tolist() is the explicit trip back to Python-land." },
          ],
          explanation: "a[1] is a 1-D view of the row: one integer index removed axis 0, and no memory was copied.",
        },
        {
          id: "d-01-q2",
          prompt: "Which expression reads the element in the LAST row and LAST column of a 3x4 array `a`?",
          options: [
            { text: "a[-1, -1]", correct: true, feedback: "Right — each axis counts independently from its own end: -1 is the last row, and the last column." },
            { text: "a[3, 4]", correct: false, feedback: "That is the one-based, inclusive habit — on a 3x4 grid, valid indexes run 0..2 and 0..3, so this raises IndexError." },
            { text: "a[-4, -3]", correct: false, feedback: "Count again: -4 on a 3-length axis is the FIRST row, -3 on a 4-length axis is the FIRST column. You found a[0, 0]." },
            { text: "a[-1, 0]", correct: false, feedback: "Last row, but column 0 — the first column. Halfway there; change the second index to -1." },
          ],
          explanation: "a[-1, -1] is the bottom-right corner: negatives count from each axis's end independently.",
        },
        {
          id: "d-01-q3",
          prompt: "After `row = a[1]` followed by `row[0] = 99`, what is true of the parent array `a`?",
          options: [
            { text: "a[1, 0] is now 99 — the write landed inside a's memory", correct: true, feedback: "Correct — a[1] is a view, and the verified demo in this lesson showed exactly this mutation." },
            { text: "a is unchanged, because indexing extracts a copy", correct: false, feedback: "Basic indexing never copies; np.shares_memory(a, row) is True, so a definitely felt that write." },
            { text: "It raises an error: rows are read-only once extracted", correct: false, feedback: "Views are writable by default (you can lock them with flags.writeable, but nothing is locked here)." },
            { text: "a becomes 99 everywhere in row 1's former positions and row is deleted", correct: false, feedback: "Only the single cell row[0] — that is a[1, 0] — changed; nothing gets deleted." },
          ],
          explanation: "Extracted rows are views: writes through them write the parent. Copy explicitly with .copy() if you need independence.",
        },
      ],
    },

    // ------------------------------------------------------------- d-02
    {
      slug: "d-02",
      title: "Slicing: start, stop, step",
      minutes: 18,
      summary:
        "One index per axis selects one cell per axis; a slice selects a whole run of them. The full start:stop:step syntax on every axis at once, negative steps (the reversal trick), the fact that slices clamp instead of raising, slice assignment, and why strided slices are still views.",
      kind: "concept",
      objectives: [
        "Write start:stop:step slices on every axis of an array, with any component omitted",
        "Use negative steps to reverse an axis — a[::-1] — and explain what the negative stride means",
        "Predict what out-of-range slices return (clamped, or empty — never an error) and contrast with integer indexes",
        "Assign into slices (a[1:, ::2] = 0) with scalar and exact-shape values",
        "Explain the slice() object underneath the colon syntax, and prove strided slices are views by printing their strides",
      ],
      why: "Real questions are almost never about one cell — they are about 'rows 1 through 3', 'every other column', 'the last 100 samples', 'the timeline backwards'. Slicing is NumPy's language for ranges, and it works per axis, so a 2-D slice carves a rectangle out of a grid in one expression. Two behaviors decide whether your slices do what you think: out-of-range slices silently clamp (which is either a convenience or a bug-hider, depending on whether you know it), and every slice — including reversed and strided ones — is a view with recomputed strides, not a copy. Both are verified in this lesson, along with the write side: assigning into a slice edits the original array through the window.",
      blocks: [
        {
          kind: "text",
          text: "An index picks one position; a **slice** picks a *run* of positions along an axis: `start:stop:step`. You already know the colon syntax from Python lists — NumPy keeps it, then does something lists cannot: **each axis gets its own slice**, comma-separated in one bracket pair. `g[1:3, 2:5]` means 'rows 1 to 2, columns 2 to 4' — a rectangle carved out of a grid in a single expression.",
        },
        {
          kind: "heading",
          text: "The full syntax: start:stop:step, once per axis",
        },
        {
          kind: "code",
          title: "A rectangle out of a grid, in one expression",
          code: `import numpy as np

g = np.arange(24).reshape(4, 6)
print("g =")
print(g)
print()
print("g[1:3, 2:5]  rows 1-2, columns 2-4:")
print(g[1:3, 2:5])
print()
print("g[:, 1]      every row, column 1 :", g[:, 1])
print("g[2, :]      row 2, every column :", g[2, :])
print("g[:, :]      everything, still a view:", np.shares_memory(g, g[:, :]))
`,
          output: `g =
[[ 0  1  2  3  4  5]
 [ 6  7  8  9 10 11]
 [12 13 14 15 16 17]
 [18 19 20 21 22 23]]

g[1:3, 2:5]  rows 1-2, columns 2-4:
[[ 8  9 10]
 [14 15 16]]

g[:, 1]      every row, column 1 : [ 1  7 13 19]
g[2, :]      row 2, every column : [12 13 14 15 16 17]
g[:, :]      everything, still a view: True`,
          outputNote: "stop is exclusive on every axis: 1:3 keeps rows 1 and 2; 2:5 keeps columns 2, 3 and 4 — the same fencepost rule as Python lists and range().",
          explain: [
            "`g[1:3, 2:5]` — first slice for rows, second for columns. Result shape (2, 3): the lengths of the two runs.",
            "`g[:, 1]` — an empty slice means 'everything on this axis', so this is one full column: every row, position 1.",
            "`g[:, :]` — two empty slices is the whole array, and np.shares_memory confirms it is a view, not a copy of itself.",
          ],
        },
        {
          kind: "table",
          title: "Slice components and their defaults",
          headers: ["Component", "Meaning", "When omitted"],
          rows: [
            ["start", "First position included (inclusive)", "0 for positive step; len-1 for negative step"],
            ["stop", "First position NOT included (exclusive)", "len for positive step; 'before the beginning' for negative step"],
            ["step", "Distance between picked positions", "1 — consecutive positions"],
            ["negative start/stop", "Counts from the end of the axis (-1 = last)", "Same fenceposts, counted backwards"],
            ["negative step", "Walks the axis backwards", "Reversal — see below"],
          ],
          caption:
            "Every slot of every axis's slice can be omitted independently: a[::2], a[1:], a[:3:2], a[::, -1] are all legal. Omitted never means 'nothing' — it means 'to the edge'.",
        },
        {
          kind: "code",
          title: "Defaults in action on a 1-D array",
          code: `import numpy as np

one = np.array([0, 10, 20, 30, 40, 50])

print("one[2:]    :", one[2:])       # start omitted -> from 2 to the end
print("one[:4]    :", one[:4])       # stop omitted  -> beginning through 3
print("one[::2]   :", one[::2])      # step 2        -> every other element
print("one[1:5:2] :", one[1:5:2])    # the full syntax in one slot
`,
          output: `one[2:]    : [20 30 40 50]
one[:4]    : [ 0 10 20 30]
one[::2]   : [ 0 20 40]
one[1:5:2] : [10 30]`,
          outputNote: "Same fencepost arithmetic as Python's lists and range(): stop is the first position NOT taken.",
          explain: [
            "`one[2:]` starts at position 2 and runs to the end — stop omitted means 'through the last element'.",
            "`one[:4]` runs from the beginning up to but not including 4.",
            "`one[1:5:2]` takes positions 1 and 3 — start 1, stop before 5, hopping 2 at a time.",
          ],
        },
        {
          kind: "heading",
          text: "Negative steps: the reversal trick",
        },
        {
          kind: "text",
          text: "A negative step walks the axis **backwards**: start defaults to the last position, stop to 'before the first'. The extreme case, `a[::-1]` — everything, step -1 — is the idiomatic NumPy reversal, and because slices are views, it costs no copying at all.",
        },
        {
          kind: "code",
          title: "a[::-1]: reverse an axis without copying",
          code: `import numpy as np

g = np.arange(24).reshape(4, 6)

print("g[::-1] reverses the rows:")
print(g[::-1])
print()
print("g[:, ::-1] reverses the columns (row 0 shown):", g[:, ::-1][0])
print("g[0, ::-1] same thing, read as one row       :", g[0, ::-1])
`,
          output: `g[::-1] reverses the rows:
[[18 19 20 21 22 23]
 [12 13 14 15 16 17]
 [ 6  7  8  9 10 11]
 [ 0  1  2  3  4  5]]

g[:, ::-1] reverses the columns (row 0 shown): [5 4 3 2 1 0]
g[0, ::-1] same thing, read as one row       : [5 4 3 2 1 0]`,
          outputNote: "The reversal is a view — Lesson d-03's memory model explains how a view can walk backwards (negative strides; you will print them at the end of this lesson).",
          explain: [
            "`g[::-1]` flips the row order: row 3 first, row 0 last. The columns inside each row are untouched.",
            "`g[:, ::-1]` flips each row left-to-right instead — same colon syntax, negative step on axis 1.",
            "Reversals compose per axis: g[::-1, ::-1] would flip both. One expression, zero copying.",
          ],
        },
        {
          kind: "heading",
          text: "Slices never raise: out of range just clamps",
        },
        {
          kind: "text",
          text: "Ask a list for `[2:100]` and Python quietly gives you what exists — slices describe a *range*, and a range past the edge is simply truncated. NumPy keeps that behavior exactly. A slice that starts before the beginning clamps to 0; a slice that ends past the end clamps to len; a slice whose range contains nothing is **empty** — an array of length 0, with no error. This is convenient and also a classic bug-hider, so it deserves a verified look:",
        },
        {
          kind: "code",
          title: "Slicing past the edges: clamped, not crashed",
          code: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

print("one[2:100]  :", one[2:100], "   # stop past the end: clamped to it")
print("one[-100:3] :", one[-100:3], "   # start before the beginning: clamped")
print("one[10:20]  :", one[10:20], "                # empty range: empty array, no error")
print("still a view:", np.shares_memory(one, one[2:100]))
`,
          output: `one[2:100]  : [ 9 12 15]    # stop past the end: clamped to it
one[-100:3] : [3 6 9]    # start before the beginning: clamped
one[10:20]  : []                 # empty range: empty array, no error
still a view: True`,
          outputNote: "Compare the last line with an integer index out of range — the block below crashes on purpose.",
          explain: [
            "`one[2:100]` asked for positions 2 to 99; only 2 through 4 exist, so that is what you get: [9 12 15].",
            "`one[-100:3]` — the start clamps to the beginning; the slice is positions 0, 1, 2.",
            "`one[10:20]` — the whole range is off the end, so the result is EMPTY. No exception. If your code expected data there, it will silently process nothing.",
          ],
        },
        {
          kind: "code",
          title: "The contrast: a single bad index DOES crash",
          code: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

print(one[100])   # an integer index names ONE position -- it must exist
`,
          expectError: "IndexError: index 100 is out of bounds for axis 0 with size 5",
          outputNote: "The rule in one line: slices clamp, integer indexes raise. 'Give me a range' vs 'give me exactly that one'.",
        },
        {
          kind: "heading",
          text: "Slice assignment: writing into a window",
        },
        {
          kind: "text",
          text: "Slices are views, so assignment through a slice edits the original — and like `a[1] = ...` in the last lesson, the value must fit. A scalar fills every selected cell; a sequence must match the selected shape. Both appear below on an all-integer array, so the dtype never has to convert (mixing dtypes is Part B's story, and float-into-int assignment silently truncates — worth avoiding in examples and in life).",
        },
        {
          kind: "code",
          title: "Zeroing a strided window, rewriting a row, flooding all",
          code: `import numpy as np

a = np.arange(12).reshape(3, 4)
print("before:")
print(a)

a[1:, ::2] = 0                  # rows 1-2, columns 0 and 2 -> four cells
print("after a[1:, ::2] = 0:")
print(a)

a[0] = [100, 200, 300, 400]     # a whole row: the list fits shape (4,)
print("after rewriting row 0:")
print(a)

a[:] = 7                        # every cell: a[:] is the whole array as a view
print("after a[:] = 7:")
print(a)
`,
          output: `before:
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
after a[1:, ::2] = 0:
[[ 0  1  2  3]
 [ 0  5  0  7]
 [ 0  9  0 11]]
after rewriting row 0:
[[100 200 300 400]
 [  0   5   0   7]
 [  0   9   0  11]]
after a[:] = 7:
[[7 7 7 7]
 [7 7 7 7]
 [7 7 7 7]]`,
          outputNote: "a[1:, ::2] selected a (2, 2) sub-grid — rows 1-2 times columns 0 and 2 — and the scalar 0 filled all four cells.",
          explain: [
            "`a[1:, ::2] = 0` — the slice selected rows 1, 2 and columns 0, 2: four cells in a strided pattern. One scalar filled them all.",
            "`a[0] = [100, 200, 300, 400]` — exact shape match with the row: every cell replaced.",
            "`a[:] = 7` — an empty slice on the only axis is everything; 7 went everywhere. The array object itself is unchanged (same shape, same dtype); only its values moved.",
          ],
        },
        {
          kind: "heading",
          text: "The slice() object: what the colon syntax really is",
        },
        {
          kind: "text",
          text: "The colons are sugar. Every `a[start:stop:step]` compiles down to `a[slice(start, stop, step)]` — a Python `slice` object, which you can build yourself, store in a variable, and reuse. `None` inside a slice() means 'omitted', so `a[1::2]` is literally `a[slice(1, None, 2)]`.",
        },
        {
          kind: "code",
          title: "Slicing with slice objects, including per-axis tuples",
          code: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

s = slice(1, None, 2)              # start 1, stop omitted, step 2
print("one[s]      :", one[s])
print("one[1::2]   :", one[1::2])
print("identical   :", np.array_equal(one[s], one[1::2]))

g = np.arange(24).reshape(4, 6)
cols = (slice(None), slice(2, 5))  # every row, columns 2-4
print("g[cols] == g[:, 2:5]:", np.array_equal(g[cols], g[:, 2:5]))
`,
          output: `one[s]      : [ 6 12]
one[1::2]   : [ 6 12]
identical   : True
g[cols] == g[:, 2:5]: True`,
          outputNote: "Passing a tuple of slice objects is exactly what the comma syntax builds for you. Store one, reuse it everywhere — the DRY of slicing.",
          explain: [
            "`slice(1, None, 2)` with None as the stop is the object form of `1::2`.",
            "A tuple of slices, one per axis, indexes just like the comma syntax — handy when the same window appears in many places.",
            "This is also how you slice with computed bounds: build slice(lo, hi) programmatically, then index once.",
          ],
        },
        {
          kind: "heading",
          text: "Strided slices are views — and their strides change",
        },
        {
          kind: "text",
          text: "Part A introduced strides as 'how many bytes to jump per axis'. Now watch them *move*: when you slice with a step, NumPy does not touch the data block — it simply re-derives the header's strides. Every-other-column doubles the column stride; every-other-row doubles the row stride; a reversal makes the row stride negative. All three are views, and the strides print proves it:",
        },
        {
          kind: "code",
          title: "Same block, new walking rules (strides, verified)",
          code: `import numpy as np

g = np.arange(24).reshape(4, 6)       # int64: 8 bytes per element

print("g         strides:", g.strides)          # (48, 8): 6 cols * 8, then 8
print("g[:, ::2] strides:", g[:, ::2].strides)  # (48, 16): column hop = 2 elements
print("g[::2]    strides:", g[::2].strides)     # (96, 8): row hop = 2 rows
print("g[::-1]   strides:", g[::-1].strides)    # (-48, 8): rows walked backwards

for label, view in [("g[:, ::2]", g[:, ::2]), ("g[::2]", g[::2]), ("g[::-1]", g[::-1])]:
    print(label, "shares memory with g:", np.shares_memory(g, view))
`,
          output: `g         strides: (48, 8)
g[:, ::2] strides: (48, 16)
g[::2]    strides: (96, 8)
g[::-1]   strides: (-48, 8)
g[:, ::2] shares memory with g: True
g[::2] shares memory with g: True
g[::-1] shares memory with g: True`,
          outputNote: "int64 elements are 8 bytes: a row of 6 is 48 bytes. The strided views re-derive strides over the same block — shares_memory says True for all three.",
          explain: [
            "`g` strides (48, 8): down a row jumps 6 elements (48 bytes); right a column jumps 1 element (8 bytes).",
            "`g[:, ::2]` strides (48, 16): the column hop doubled because step-2 skips an element each time. Same bytes, twice the hop.",
            "`g[::-1]` strides (-48, 8): a NEGATIVE row stride — start from the end and walk backwards. That is how a reversal can be a zero-copy view.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The slice explorer — six selections, one 4x6 grid",
          mode: "slice",
          name: "g",
          caption:
            "The grid from this lesson. Step through the selections in order and watch exactly which cells light up: one cell, a full row, a band of rows, every other column, the last two columns (negatives), and a strided 2-D sub-grid. Predict each one before you click it.",
          data: [
            [0, 1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23],
          ],
          selections: [
            {
              expr: "g[2, 4]",
              cells: [[2, 4]],
              note: "One index per axis (no colons): a single cell. Value 16.",
            },
            {
              expr: "g[1, :]",
              cells: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
              note: "An integer on axis 0 plus an empty slice on axis 1: all of row 1.",
            },
            {
              expr: "g[1:3, :]",
              cells: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5]],
              note: "A run of rows (stop exclusive) times every column: a 2x6 band.",
            },
            {
              expr: "g[:, ::2]",
              cells: [[0, 0], [0, 2], [0, 4], [1, 0], [1, 2], [1, 4], [2, 0], [2, 2], [2, 4], [3, 0], [3, 2], [3, 4]],
              note: "Every row, every other column (0, 2, 4) — the stride-2 column hop from the strides demo.",
            },
            {
              expr: "g[:, -2:]",
              cells: [[0, 4], [0, 5], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]],
              note: "Negative start: -2 counts from the end of each row, so this is the last two columns.",
            },
            {
              expr: "g[::2, 1:4]",
              cells: [[0, 1], [0, 2], [0, 3], [2, 1], [2, 2], [2, 3]],
              note: "Both axes sliced at once: every other row times columns 1-3 — a 2x3 sub-grid.",
            },
          ],
        },
        {
          kind: "tryIt",
          title: "Slice surgery on a 4x6",
          task: "Run this, then: (1) change the column slice to ::3 and predict the result before rerunning; (2) print g[::-1, 0] and explain which value you get and why; (3) assign 0 into your own slice (try g[1:3, 1:4] = 0) and watch the grid change.",
          code: `import numpy as np

g = np.arange(24).reshape(4, 6)
print("full grid:")
print(g)
print()
print("row 3                :", g[3])
print("columns 2-4 of row 1 :", g[1, 2:5])
print("every other column, row 0:", g[0, ::2])
print("reversed rows, column 0  :", g[::-1, 0])
`,
          hint: "g[::-1, 0] reverses the ROWS then takes column 0: you get 18, 12, 6, 0 — bottom of column 0 first. Assignments through slices edit g itself, because slices are views.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "A slice per axis, start:stop:step, stop exclusive, negatives from the end, negative step walks backwards. Slices clamp past the edges instead of raising, they are views with recomputed strides, and you can write through them.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The clamping trap",
          text: "Because out-of-range slices never raise, a wrong bound quietly returns fewer rows than you asked for — or an empty array. If a downstream result looks 'too short' or a mean() returns nan on nothing, print the sliced shape and compare it with what you expected. The bug is never mysterious; it is a fencepost.",
        },
      ],
      terms: [
        { term: "Slice", definition: "A start:stop:step range selecting a run of positions along one axis; every axis of an array can carry its own slice in one bracket pair." },
        { term: "Step", definition: "The distance between consecutive picked positions in a slice; step 2 takes every other element, step -1 walks the axis backwards." },
        { term: "Clamping", definition: "Slicing behavior past an axis's edges: starts before 0 clamp to 0, stops past the end clamp to len, and empty ranges return an empty array — never an error." },
        { term: "Slice assignment", definition: "Writing into a slice (a[1:, ::2] = 0): the selected view's cells are overwritten in the original array; values must fit the selected shape." },
        { term: "slice() object", definition: "The Python object underneath the colon syntax: a[1::2] is a[slice(1, None, 2)]. Build them programmatically and reuse them." },
      ],
      mistakes: [
        {
          mistake: "Expecting an out-of-range slice to raise an error.",
          why: "Slices describe ranges and clamp at the edges — a[10:20] on a length-5 array returns an empty array, silently. Only integer indexes raise IndexError.",
          fix: "Validate bounds yourself when they matter, and treat 'my result is unexpectedly short/empty' as a fencepost smell. The verified clamp demo in this lesson is the mental model.",
        },
        {
          mistake: "Assuming a[::-1] (or any strided slice) made a reversed copy.",
          why: "All basic slices are views: the reversal is a new header with a negative stride (-48, 8 in this lesson's print) walking the same block.",
          fix: "Expect views. If you truly need a detached reversed array, .copy() it — and expect that to be the rare case, not the rule.",
        },
        {
          mistake: "Forgetting that stop is exclusive, then being off by one.",
          why: "a[1:3] keeps positions 1 and 2 — the same fencepost rule as range() and list slicing, but easy to second-guess under pressure.",
          fix: "Read a slice as 'from start, up to but not including stop'. Row band 1:3 has 3 - 1 = 2 rows; column window 2:5 has 3 columns.",
        },
        {
          mistake: "Assigning a sequence that does not fit the sliced shape.",
          why: "a[0] = [1, 2, 3] on a (3, 4) array raises ValueError — the row wants 4 values. Assignment must broadcast to the selection (scalar fits anywhere).",
          fix: "Print the selection's shape first (a[0].shape), or assign a scalar when you just want a constant fill.",
        },
      ],
      takeaways: [
        "One slice per axis: g[1:3, 2:5] carves rows 1-2 times columns 2-4 out of a grid in one expression.",
        "Defaults: omitted start means the beginning, omitted stop means the end, omitted step means 1; negatives count from the end; a negative step walks backwards (a[::-1] reverses, zero-copy).",
        "Slices clamp past the edges and never raise; integer indexes must exist and do raise. Two rules, no exceptions.",
        "Slice assignment writes the original through the view: scalar fills the selection, sequences must match its shape exactly.",
        "Strided slices are views whose strides changed — g[:, ::2] strides (48, 16), g[::-1] strides (-48, 8) — same bytes, new walking rule.",
      ],
      quiz: [
        {
          id: "d-02-q1",
          prompt: "`one = np.arange(10)`. What does `print(one[3:99])` do?",
          options: [
            { text: "Prints [3 4 5 6 7 8 9] — the stop clamps to the end of the axis", correct: true, feedback: "Correct — slices describe ranges and are truncated to what exists; no error, no padding." },
            { text: "Raises IndexError: index 99 is out of bounds", correct: false, feedback: "That is the rule for a single INTEGER index (one[99]), not for a slice — slices clamp." },
            { text: "Prints [3 4 5 6 7 8 9 0 0 ...] padded with zeros to length 96", correct: false, feedback: "NumPy never pads slices; ranges are clamped to the axis's actual length." },
            { text: "Prints an empty array, because 99 is out of range", correct: false, feedback: "Empty only happens when the WHOLE range is off the end (like one[10:20]). Here position 3 exists, so you get 3 through 9." },
          ],
          explanation: "Slices clamp: one[3:99] is every position from 3 to the end — [3 4 5 6 7 8 9].",
        },
        {
          id: "d-02-q2",
          prompt: "After `rev = a[::-1]` on a 1-D array, which statement is TRUE?",
          options: [
            { text: "rev is a view of a with a negative stride — writing rev[0] changes a's last element", correct: true, feedback: "Exactly: reversal is zero-copy; the header walks backwards (-8 per step for int64). rev[0] IS a[-1]." },
            { text: "rev is a reversed copy, so a is safe from writes through rev", correct: false, feedback: "No copy happens — shares_memory(a, rev) is True. The 'safe' version would be a[::-1].copy()." },
            { text: "rev has positive strides and stores the elements in reverse order in a new block", correct: false, feedback: "That describes what a copy would need to do; the view instead just flips the sign of the stride." },
            { text: "rev shares a's header, so a itself now prints reversed too", correct: false, feedback: "a never changes — only the new view rev has the reversed walking rule." },
          ],
          explanation: "Reversal by slice is a view with a negative stride: same block, walked backwards. Writes through rev land in a.",
        },
        {
          id: "d-02-q3",
          prompt: "`a` has shape (4, 6). How many cells does `a[1:3, ::2]` select, and which?",
          options: [
            { text: "Six cells: rows 1 and 2, columns 0, 2 and 4", correct: true, feedback: "Right: 2 rows times 3 columns (0, 2, 4 of 0..5). The selection is a 2x3 view." },
            { text: "Eight cells: rows 1, 2 and 3, columns 0, 2 and 4", correct: false, feedback: "Row stop 3 is exclusive — row 3 is NOT included. Only rows 1 and 2." },
            { text: "Six cells: rows 1 and 2, columns 2 and 4", correct: false, feedback: "Close, but ::2 starts at 0: the columns are 0, 2 and 4 — three of them, not two." },
            { text: "Twelve cells: rows 1 through 3, all columns", correct: false, feedback: "That would be a[1:4, :] — you would need stop 4 (or omitted) for three rows, and ::2 halves the columns." },
          ],
          explanation: "a[1:3, ::2] = rows 1, 2 x columns 0, 2, 4 = a (2, 3) selection — six cells.",
        },
      ],
    },

    // ------------------------------------------------------------- d-03
    {
      slug: "d-03",
      title: "Views vs Copies: Who Shares Memory",
      minutes: 20,
      summary:
        "The lesson Part A promised. Some extractions hand you a window onto the original memory (views) and some hand you a fresh block (copies) — and which one you got decides whether your writes leak. The decision table, ndarray.base, np.shares_memory, the classic mutating-row bug, and .copy() as the firewall.",
      kind: "concept",
      objectives: [
        "State the view/copy decision table for the operations in this course so far, and verify each row with np.shares_memory",
        "Use ndarray.base to tell whether an array owns its memory or borrows it",
        "Diagnose the classic bug — row = a[0]; row[0] = 999 mutates a — and fix it with .copy()",
        "Explain why chained writes differ from single-bracket writes in exactly one case: chained FANCY assignment writes a copy",
        "Lock and unlock a view with flags.writeable, and read the error a blocked write produces",
      ],
      why: "Part A showed you the transpose sharing its buffer and said the full story lands here. It matters more than any syntax in this part: when a function hands you an array, is it a window or a photocopy? Get it wrong and you mutate data you thought was safe (the classic 'cleaning my local copy' bug that silently corrupts the original), or you copy gigabytes you thought were free and your pipeline crawls. The rules are few and completely mechanical — basic indexing and slicing view; fancy and boolean index copy; transpose and reshape view when strides allow — and every single rule in this lesson is proven by running code, so you never have to trust a mnemonic you can verify.",
      blocks: [
        {
          kind: "text",
          text: "Every operation that hands you an array is answering a question you cannot see: **same memory, or new memory?** A *view* is a new header aimed at the old data block — cheap, zero-copy, and every write goes into the original. A *copy* is a fresh block of bytes — yours alone, safe to mutate, and it cost time and memory to build. This lesson gives you the complete decision table for everything you know so far, then the two tools that prove any case on the spot: `ndarray.base` and `np.shares_memory`.",
        },
        {
          kind: "heading",
          text: "The decision table",
        },
        {
          kind: "table",
          title: "What you did, and what you got",
          headers: ["Operation", "Result", "Writes reach the original?"],
          rows: [
            ["a[1] or a[1, 2] (basic indexing)", "view (or scalar)", "Yes — a[1] is a window; scalars are values"],
            ["a[1:, ::2] (any slice)", "view", "Yes — slice assignment edits a through the window"],
            ["a.T (transpose)", "view", "Yes — swapped strides over the same block"],
            ["a.reshape(...) when strides allow", "view", "Yes — when the block can be walked the new way"],
            ["a[[0, 2]] (fancy indexing)", "copy", "No — Lesson d-05's deep dive"],
            ["a[a > 5] (boolean mask)", "copy", "No — Lesson d-04's topic"],
            ["a * 2 (arithmetic)", "copy", "No — new arrays are always fresh blocks"],
            ["a.copy() (explicit)", "copy", "No — the firewall you ask for by name"],
          ],
          caption:
            "Every row of this table is verified by the block below. The pattern to remember: indexing by POSITION (integers, slices) views; indexing by LIST of places or by QUESTION (masks) copies; math always copies.",
        },
        {
          kind: "code",
          title: "The table, proven row by row",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

tests = {
    "a[1]           (basic index)": a[1],
    "a[1:, ::2]     (slice)      ": a[1:, ::2],
    "a.T            (transpose)  ": a.T,
    "a.reshape(4, 3)              ": a.reshape(4, 3),
    "a[[0, 1]]      (fancy)      ": a[[0, 1]],
    "a[a > 15]      (boolean)    ": a[a > 15],
    "a * 2          (arithmetic) ": a * 2,
    "a.copy()       (explicit)   ": a.copy(),
}

for label, result in tests.items():
    print(f"{label} -> shares memory: {np.shares_memory(a, result)}")
`,
          output: `a[1]           (basic index) -> shares memory: True
a[1:, ::2]     (slice)       -> shares memory: True
a.T            (transpose)   -> shares memory: True
a.reshape(4, 3)               -> shares memory: True
a[[0, 1]]      (fancy)       -> shares memory: False
a[a > 15]      (boolean)     -> shares memory: False
a * 2          (arithmetic)  -> shares memory: False
a.copy()       (explicit)    -> shares memory: False`,
          outputNote: "Eight operations, eight verdicts — True for the first four (views), False for the last four (copies). Exactly the table above.",
          explain: [
            "The four True rows — basic index, slice, transpose, reshape — never allocated: they are headers over a's block. Writes through any of them edit `a`.",
            "The four False rows — fancy, boolean, arithmetic, explicit copy — each built a fresh block. Mutating them cannot touch `a`.",
            "reshape CAN copy when no stride pattern can walk the block the new way (Part C covered the details) — but for a plain 3x4 reshape of a row-major block, it views.",
          ],
        },
        {
          kind: "heading",
          text: "ndarray.base: who owns these bytes?",
        },
        {
          kind: "text",
          text: "Every array carries a `base` attribute: **None when the array owns its memory**, or the parent array it borrows from when it is a view. It answers 'am I standing on someone else's data?' at a glance — and it chains: the parent itself may be a view of something bigger.",
        },
        {
          kind: "code",
          title: "Reading base on owners, borrowers, and copies",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a owns its memory (a.base is None)      :", a.base is None)

row = a[1]
print("a[1] borrows (row.base is a)            :", row.base is a)
chunk = a[0:2]
print("a[0:2] borrows (chunk.base is a)        :", chunk.base is a)
transposed = a.T
print("a.T borrows (transposed.base is a)      :", transposed.base is a)

fancy = a[[0, 2]]
print("a[[0, 2]] owns (fancy.base is None)     :", fancy.base is None)
masked = a[a > 15]
print("a[a > 15] owns (masked.base is None)    :", masked.base is None)
fresh = a.copy()
print("a.copy() owns (fresh.base is None)      :", fresh.base is None)
`,
          output: `a owns its memory (a.base is None)      : True
a[1] borrows (row.base is a)            : True
a[0:2] borrows (chunk.base is a)        : True
a.T borrows (transposed.base is a)      : True
a[[0, 2]] owns (fancy.base is None)     : True
a[a > 15] owns (masked.base is None)    : True
a.copy() owns (fresh.base is None)      : True`,
          outputNote: "Views point at their parent; copies and owners point at nothing. base is a quick check; np.shares_memory (next) is the definitive one.",
          explain: [
            "`a` was built by np.array, which allocates — so a.base is None: an owner.",
            "row, chunk and transposed all report base is a: they are views standing on a's block.",
            "fancy, masked and fresh report base is None — but for a different reason than a: they are copies that OWN their (newly allocated) memory.",
            "Note the asymmetry: base tells you about THIS array's parent, not about arbitrary pairs. For 'do these two specific arrays overlap?', use np.shares_memory.",
          ],
        },
        {
          kind: "heading",
          text: "The classic bug: one line that mutates the wrong array",
        },
        {
          kind: "text",
          text: "You will write this bug. Everyone does. You 'read out' a row to clean it up, tidy it — and the original dataset changes underneath you, because the row you 'extracted' was a view. Three lines, silently corrupt:",
        },
        {
          kind: "code",
          title: "The bug, caught in the act",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

day1 = temps[1]        # "just reading out day 1"
day1[2] = 0            # "cleaning MY local copy" -- it is not a copy
print("temps day 1 is now:", temps[1])
print("day1 shares memory with temps:", np.shares_memory(temps, day1))
`,
          output: `temps day 1 is now: [30 18  0 24]
day1 shares memory with temps: True`,
          outputNote: "The 92 became 0 in the ORIGINAL. No error, no warning — this is why the view/copy table is worth memorizing.",
          explain: [
            "`temps[1]` is basic indexing: a view. `day1` and `temps` are one block of memory with two headers.",
            "`day1[2] = 0` therefore wrote into temps — the original's 92 is gone. In a real pipeline, that is silent data corruption.",
            "The fix is one word long, and it is the next block's whole topic: .copy().",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The rule of thumb that saves you",
          text: "The moment a variable name suggests ownership — 'clean', 'scratch', 'local', 'my_copy' — write .copy() at the end of the expression that created it. Intent in the name, intent in the code. If you only READ from the row, skip the copy: views are a feature, not a trap.",
        },
        {
          kind: "heading",
          text: ".copy(): the explicit firewall",
        },
        {
          kind: "text",
          text: "`.copy()` allocates a brand-new block and copies every value into it. The result has base None, ignores writes to everything else, and is exactly as independent as it looks. Both tools get full reference cards below — read them like documentation, because they are.",
        },
        {
          kind: "code",
          title: "The same three lines, firewalled",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

day1 = temps[1].copy()   # explicitly independent
day1[2] = 0
print("temps day 1 is untouched:", temps[1])
print("day1 is its own memory  :", day1)
print("shares memory           :", np.shares_memory(temps, day1))
`,
          output: `temps day 1 is untouched: [30 18 92 24]
day1 is its own memory  : [30 18  0 24]
shares memory           : False`,
          outputNote: "One word, three verified consequences: the original survives, the copy holds the edit, shares_memory reports False.",
          explain: [
            "`temps[1].copy()` — index (a view), then copy (a new block). The write to day1[2] lands in the new block only.",
            "`temps[1]` still shows 92: the original is untouched. This is what 'safe' looks like, verified.",
            "Cost check: a copy of one row is trivial; a copy of a 10 GB array is a 10 GB allocation. Copy deliberately, not by reflex.",
          ],
        },
        {
          kind: "functionDoc",
          name: "ndarray.copy",
          purpose: "Build a fully independent duplicate of an array — new memory block, same values — so nothing you do to the copy can touch the original.",
          signature: "a.copy(order='C')",
          purposeDetail:
            "Views make NumPy fast: slicing, transposing and reshaping cost nothing because they reuse the data block. The price is that writes travel — mutate a view and you mutate its parent. `.copy()` is the escape hatch: it allocates a fresh block, copies every value, and hands you an array whose base is None and whose fate is unrelated to anything else. Reach for it exactly when you intend to mutate data you do not own: cleaning a scratch copy, handing a safe snapshot to a function, or breaking a view chain before heavy writes.",
          params: [
            {
              name: "order",
              type: "\"C\", \"F\", \"A\", or \"K\"",
              required: false,
              description: "Memory layout of the new block: \"C\" row-major (default), \"F\" column-major, \"A\" like the source if possible, \"K\" keep the source's exact layout. Layout matters for Part J's file formats and performance tuning; \"C\" is right for almost everything.",
              example: "order=\"C\"",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array with the same shape, dtype and values, owning its own memory (result.base is None). Writes to it affect nothing else.",
          },
          example: `import numpy as np

a = np.array([[10, 11], [20, 21]])

safe = a.copy()          # new block, same values
safe[0, 0] = 99          # mutates ONLY the copy

print("a is untouched:", a[0, 0])
print("safe          :", safe, sep="\\n")
print("shares memory :", np.shares_memory(a, safe))
`,
          exampleOutput: `a is untouched: 10
safe          :
[[99 11]
 [20 21]]
shares memory : False`,
          commonMistakes: [
            {
              mistake: "Confusing a.copy() with np.array(a) or copy.copy(a).",
              why: "np.array(a) also copies (with default copy=True), so it works here — but it goes through conversion logic and reads as 'building from data'. copy.copy(a) is the shallow PYTHON copy: for arrays it happens to copy, but its meaning is object-level, not block-level.",
              fix: "Use the method that says what you mean: a.copy() when the intent is 'an independent array'.",
            },
            {
              mistake: "Copying reflexively 'to be safe' inside a loop or function.",
              why: "Every copy allocates and walks the whole block. Copy a 100 MB array in a 10,000-iteration loop and you have manufactured a memory-churning pipeline for no benefit.",
              fix: "Copy at boundaries where ownership changes (once), and let views do the free work inside algorithms.",
            },
            {
              mistake: "Expecting a.copy() to also copy the parent chain.",
              why: "It copies exactly the array you called it on — one level. a[1:, :2].copy() copies that (2, 2) window, not all of a.",
              fix: "That is usually exactly right. If you need the whole original duplicated, copy the whole original: a.copy().",
            },
          ],
          related: [
            { name: "np.copy", relation: "The function spelling of the same operation: np.copy(a) is a.copy() with an out-target option." },
            { name: "np.shares_memory", relation: "The verifier: proves whether two arrays overlap after the fact, no guessing." },
            { name: "ndarray.view", relation: "A DIFFERENT method (dtype reinterpretation) that also returns a view — despite the name, .view() is not the general 'make a view' tool." },
            { name: "np.asarray", relation: "Avoids a copy when the input is already a matching array — the zero-copy front door, opposite intent of .copy()." },
          ],
          applications: [
            "Firewalling scratch edits: clean = raw.copy() before zeroing spikes through a mask (this part's mini project)",
            "Snapshotting state before an in-place experiment, so a failed run can be rolled back",
            "Breaking read-only or awkward views into writable, contiguous blocks before heavy mutation",
          ],
          notes:
            ".copy() copies the VALUES, not the provenance: the result is always writable and owns its block, even if it was sliced from something read-only. For copying with a different dtype, see .astype (Part B).",
        },
        {
          kind: "functionDoc",
          name: "np.shares_memory",
          purpose: "Definitively answer 'do these two arrays overlap in memory?' — the view/copy question, settled by machine instead of by memory of the rules.",
          signature: "np.shares_memory(a, b, /, max_work=None)",
          purposeDetail:
            "The decision table tells you what an operation USUALLY returns; this function tells you what two specific arrays ACTUALLY do. It checks whether any byte of a's data block is also a byte of b's — so a tiny slice of a giant array shares memory with the giant, while two arrays built separately never do. Use it to prove assumptions before mutating, to write assertions that guard in-place code, and to debug the classic 'my local copy changed the original' bug in one line instead of an afternoon.",
          params: [
            {
              name: "a",
              type: "ndarray",
              required: true,
              description: "First array to compare.",
              example: "clean",
            },
            {
              name: "b",
              type: "ndarray",
              required: true,
              description: "Second array to compare.",
              example: "raw",
            },
            {
              name: "max_work",
              type: "int or np.MAY_SHARE_EXACT / np.MAY_SHARE_BOUNDS",
              required: false,
              description: "Effort allowed for the exact answer. The default MAY_SHARE_EXACT is precise but can be slow for wild stride patterns; MAY_SHARE_BOUNDS only checks whether the blocks' address ranges overlap (fast, may say True for arrays that merely could overlap).",
              example: "max_work=np.MAY_SHARE_BOUNDS",
            },
          ],
          returns: {
            type: "bool",
            description: "True when the two arrays share at least one byte (for the exact mode: at least one ELEMENT). False means writes to one can never reach the other.",
          },
          example: `import numpy as np

a = np.arange(12).reshape(3, 4)

row = a[1]              # basic indexing -> view
fancy = a[[0, 1]]       # fancy indexing -> copy
safe = a.copy()         # explicit copy

print(np.shares_memory(a, row))
print(np.shares_memory(a, fancy))
print(np.shares_memory(a, safe))
print(np.shares_memory(a, a.T))
`,
          exampleOutput: `True
False
False
True`,
          commonMistakes: [
            {
              mistake: "Assuming False means the arrays are unrelated in VALUE.",
              why: "It only speaks about memory. A copy has identical values and shares nothing; two different arrays can share memory ranges without you noticing.",
              fix: "Use np.array_equal for value comparison and np.shares_memory for memory questions — different tools, different questions.",
            },
            {
              mistake: "Confusing np.shares_memory with np.may_share_memory.",
              why: "may_share_memory is the cheap, conservative check (bounds only): True means 'they might overlap', not 'they do'. They can disagree on tricky strided cases.",
              fix: "Reach for the exact np.shares_memory in tests and assertions; keep may_share_memory for hot loops where a conservative answer suffices.",
            },
            {
              mistake: "Using it to compare an array with a scalar or a list.",
              why: "It is defined for two ndarrays — a Python list has no data block to share.",
              fix: "Convert first (np.asarray(your_list)) or just compare arrays you already have.",
            },
          ],
          related: [
            { name: "np.may_share_memory", relation: "The fast, conservative sibling: bounds-check only, never false-positives-free — check it when 'maybe' is enough." },
            { name: "ndarray.base", relation: "The parent-pointer check: quick 'does THIS array borrow?' — but it cannot compare arbitrary pairs." },
            { name: "ndarray.copy", relation: "The remedy when shares_memory says True and you need it to say False." },
            { name: "np.array_equal", relation: "The VALUE question (do they hold equal numbers?) — orthogonal to the memory question." },
          ],
          applications: [
            "Guard clauses before in-place mutation: assert not np.shares_memory(clean, raw) so a refactor can't silently reintroduce corruption",
            "Teaching and debugging view/copy behavior — every claim in this lesson is one call long",
            "Optimization work: proving two views alias the same block to avoid double computation (Part J's performance playbook)",
          ],
          notes:
            "The docs warn the EXACT mode can be exponentially slow for pathological stride patterns; with max_work=np.MAY_SHARE_BOUNDS it answers from address ranges only. For day-to-day slices and copies the exact mode is instant.",
        },
        {
          kind: "heading",
          text: "The one edge case: chained writes with fancy indexes",
        },
        {
          kind: "text",
          text: "Lesson d-01 said `a[1][2]` equals `a[1, 2]` for reads, and promised the write-mode difference here it is. With **basic** indexing, chained writes are still fine: `a[1][2] = 99` writes through the row view into `a`. The moment the FIRST bracket contains a *fancy* index (a list of places — Lesson d-05), the chain breaks: `a[[0, 2]]` returns a **copy**, so writing into it edits a throwaway array while `a` silently stays the same. One bracket, no bug: `a[[0, 2], 0] = 555` writes the original.",
        },
        {
          kind: "code",
          title: "The same write, chained vs single-bracket (verified)",
          code: `import numpy as np

b = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

b[[0, 2]][0, 0] = 999            # chained: first bracket COPIES, then we
print("after chained write, b[0, 0]:", b[0, 0])   # wrote into the copy

b[np.array([0, 2]), 0] = 555     # single bracket: fancy assignment writes b
print("after single-bracket write, b[:, 0]:", b[:, 0])
`,
          output: `after chained write, b[0, 0]: 10
after single-bracket write, b[:, 0]: [555  20 555]`,
          outputNote: "10 survived the chained write (it landed in a copy); 555 landed in b itself. The rule: put the whole index in ONE bracket, always.",
          explain: [
            "`b[[0, 2]]` is fancy indexing — it returns a COPY of rows 0 and 2. The second bracket then wrote 999 into that copy, which nobody kept. b never saw it.",
            "`b[np.array([0, 2]), 0] = 555` — the full index (row list + column 0) in one bracket pair is fancy ASSIGNMENT, which writes into b: rows 0 and 2, column 0 became 555.",
            "Notice the asymmetry with d-01: for basic indexing, a[1][2] = x works by accident of views; for fancy indexing it fails silently. One style, zero accidents: single bracket.",
          ],
        },
        {
          kind: "heading",
          text: "Writeable views: locking a window",
        },
        {
          kind: "text",
          text: "Views are writable by default — that is the power and the danger. You can lock one: `view.flags.writeable = False` freezes the window, and any write through it fails loudly instead of corrupting quietly. NumPy itself uses this: `np.diagonal` (Lesson d-06) hands you a *read-only* view of the diagonal, because the stride pattern behind a diagonal view has ambiguities NumPy refuses to let you trip over.",
        },
        {
          kind: "code",
          title: "Lock, blocked write, unlock",
          code: `import numpy as np

a = np.array([[1, 2],
              [3, 4]])
view = a[0]

print("view writeable by default:", view.flags.writeable)

view.flags.writeable = False        # freeze the window
try:
    view[0] = 99
except ValueError as err:
    print("blocked:", err)

view.flags.writeable = True         # thaw it again
view[0] = 99
print("after unlock, a[0, 0] is:", a[0, 0])
`,
          output: `view writeable by default: True
blocked: assignment destination is read-only
after unlock, a[0, 0] is: 99`,
          outputNote: "The blocked write raises ValueError: assignment destination is read-only — the exact error np.diagonal views produce if you try to edit them.",
          explain: [
            "`view.flags.writeable` is True out of the box: views inherit writability when the base block is writable.",
            "Setting it False makes writes through THIS view raise immediately — the parent `a` stays writable through its own header (try a[0, 0] = 5 right after and it works).",
            "Unlocking works when the underlying memory is writable — so this is a soft guard for YOUR code, not a security boundary.",
          ],
        },
        {
          kind: "tryIt",
          title: "The view/copy detective kit",
          task: "Run this, then: (1) predict each line's two booleans BEFORE looking; (2) add probes for a[1:, :2].copy() and a.reshape(2, 2, 3); (3) flip the writeable flag on one probe and try to write through it.",
          code: `import numpy as np

a = np.array([[10, 11, 12],
              [20, 21, 22]])

probes = {
    "a[0]         ": a[0],
    "a[0:2, 0:2]  ": a[0:2, 0:2],
    "a.T          ": a.T,
    "a[[1]]       ": a[[1]],
    "a[a > 15]    ": a[a > 15],
}

for label, piece in probes.items():
    print(label,
          "| base is a:", piece.base is a,
          "| shares with a:", np.shares_memory(a, piece))
`,
          hint: "a[[1]] looks like a row but is a LIST-indexed extraction — a (1, 3) COPY, not the (3,) view a[1] gives. The brackets tell you which world you are in.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Position-based indexing (integers, slices) and stride tricks (transpose, reshape) hand you WINDOWS — writes travel. List-of-places indexing, boolean masks, arithmetic and .copy() hand you PHOTOCOPIES — writes stay put. Prove any case with np.shares_memory; ask for independence with .copy().",
        },
      ],
      terms: [
        { term: "View", definition: "An array whose header walks another array's data block: zero-copy, and writes through it are visible in every other view of that block (including the parent)." },
        { term: "Copy", definition: "An array with its own freshly allocated block: identical values perhaps, but mutations never travel to the source. Fancy indexing, boolean indexing and arithmetic produce copies." },
        { term: "ndarray.base", definition: "The array this one borrows its memory from, or None when it owns its block. A quick single-array check — the parent chain can be several levels deep." },
        { term: "np.shares_memory", definition: "The definitive two-array test: do their data blocks overlap at all? True means writes to one can reach the other." },
        { term: "Writeable flag", definition: "view.flags.writeable — locks or unlocks writes through THIS header. Read-only views (like np.diagonal's) raise ValueError: assignment destination is read-only on write." },
      ],
      mistakes: [
        {
          mistake: "Extracting a row/slice to 'work on it locally', then corrupting the original.",
          why: "Basic indexing and slicing return views — day1 = temps[1]; day1[2] = 0 changed temps in this lesson's verified demo. No error is raised; the data just changes.",
          fix: "Name intent in code: end the expression with .copy() whenever the variable is meant to be independent. Verify with np.shares_memory when in doubt.",
        },
        {
          mistake: "Writing through chained brackets with a fancy first index: b[[0, 2]][0, 0] = 999.",
          why: "The first bracket (fancy indexing) returns a COPY; the second bracket's write lands in that unnamed temporary, and b is silently unchanged — verified in this lesson.",
          fix: "Always keep the full index in one bracket pair: b[np.array([0, 2]), 0] = 999 writes b itself.",
        },
        {
          mistake: "Blanket-copying everything 'to be safe'.",
          why: "Copies allocate and walk the whole block. Copying inside loops or functions that run thousands of times turns a free view operation into a memory-churning one.",
          fix: "Copy at ownership boundaries (once per pipeline stage), let views carry the free work, and prove the boundary with an assertion: assert not np.shares_memory(raw, clean).",
        },
        {
          mistake: "Reading base is None as 'this array is original/important'.",
          why: "base is None means 'owns its memory' — a copy owns its (new) memory too. Owners and copies both report None; only views report a parent.",
          fix: "Use base for 'does this one borrow?', and np.shares_memory(a, b) for 'do these two overlap?' — the question you usually actually have.",
        },
      ],
      takeaways: [
        "The table, one line: integers/slices/transpose/reshape view; fancy lists and boolean masks copy; arithmetic copies; .copy() copies on purpose.",
        "Every claim above is one np.shares_memory call away from proof — the function exists precisely so view/copy behavior never has to be folklore.",
        "The classic bug is three lines long: row = a[0]; row[0] = 999; print(a) — and its fix is one word: .copy().",
        "Chained brackets are safe for basic indexing by accident, and silently wrong for fancy indexing: keep the whole index in one bracket pair, especially when writing.",
        "Views are writable by default; flags.writeable = False turns silent corruption into a loud ValueError: assignment destination is read-only.",
      ],
      quiz: [
        {
          id: "d-03-q1",
          prompt: "Which of these operations returns a COPY of the original's values?",
          options: [
            { text: "a[[0, 1]] — indexing with a list of positions", correct: true, feedback: "Right — fancy indexing gathers values into a fresh block; shares_memory(a, a[[0, 1]]) is False." },
            { text: "a[1:3] — a plain slice", correct: false, feedback: "Slices are views: shares_memory(a, a[1:3]) is True, and writes through it edit a." },
            { text: "a.T — the transpose", correct: false, feedback: "Transpose swaps strides over the same block — a view, as Part A first showed you." },
            { text: "a[1] — indexing with a single integer", correct: false, feedback: "Basic integer indexing is a view — that is exactly the 'extracted row mutates the parent' bug from this lesson." },
          ],
          explanation: "List-of-places (fancy) indexing copies; position-based indexing — integers and slices — views.",
        },
        {
          id: "d-03-q2",
          prompt: "After `x = a.copy()`, what does `np.shares_memory(a, x)` return, and what does it mean?",
          options: [
            { text: "False — x has its own block, so writes to either never reach the other", correct: true, feedback: "Correct — that is the entire point and the entire cost of .copy(): total independence, one allocation." },
            { text: "True — copy() keeps the same buffer for speed", correct: false, feedback: "Sharing the buffer would defeat .copy()'s purpose; it always allocates a fresh block." },
            { text: "False — but only because a and x have different dtypes now", correct: false, feedback: "The dtype is unchanged: same shape, same dtype, same VALUES — only the memory is new." },
            { text: "It depends on the array's size", correct: false, feedback: "Never — .copy() allocates regardless of size (that is why big copies are expensive)." },
          ],
          explanation: ".copy() = new block + copied values: shares_memory is False, and the two arrays' futures are independent.",
        },
        {
          id: "d-03-q3",
          prompt: "`b[[0, 2]][0, 0] = 999` runs without error, but b[0, 0] is still 10 afterwards. Why?",
          options: [
            { text: "b[[0, 2]] is fancy indexing, which returns a copy — the 999 was written into that unnamed temporary", correct: true, feedback: "Exactly the chained-fancy trap from this lesson: the first bracket copied, the second bracket edited the copy, b never saw anything." },
            { text: "Assignment through fancy indexes is not allowed, so NumPy silently ignored it", correct: false, feedback: "Fancy ASSIGNMENT works fine — when the whole index is in one bracket: b[[0, 2], 0] = 999 writes b. It was the chaining that failed." },
            { text: "b is read-only, so all writes to it fail silently", correct: false, feedback: "b is a normal writable array; and NumPy never fails writeably 'silently' — read-only views raise ValueError loudly." },
            { text: "999 was written to b[2, 0] instead of b[0, 0]", correct: false, feedback: "No position confusion here — nothing was written anywhere in b at all. The write went to a copy." },
          ],
          explanation: "Chained brackets with fancy indexing write into a throwaway copy. Keep the whole index in one bracket pair, especially on the write side.",
        },
      ],
    },

    // ------------------------------------------------------------- d-04
    {
      slug: "d-04",
      title: "Boolean Indexing: Asking Questions",
      minutes: 18,
      summary:
        "Stop describing WHERE the interesting data is — describe WHAT it looks like. Comparisons produce boolean arrays; indexing with a mask gathers every match as a 1-D result; compound questions need & | ~ (never and/or); and assignment through a mask is the clip-by-hand idiom.",
      kind: "concept",
      objectives: [
        "Explain why a comparison like temps > 26 produces a boolean ARRAY of the same shape",
        "Index with a mask and predict the result: 1-D, in reading order, regardless of the source's dimensions",
        "Combine masks with & (and), | (or), ~ (not) — with parentheses — and explain why Python's and/or raise",
        "Assign through masks (a[a > 100] = 100) and count hits with np.count_nonzero",
        "Use np.where(condition, x, y) as the build-a-new-array fork, and state the performance cost masks carry",
      ],
      why: "'Which readings are above the safety limit?' is the question data work actually asks — and in NumPy you answer it by literally writing the question as an expression. Boolean indexing turns conditions into selections: the comparison builds a mask, the mask picks the matches. It is the idiom behind data cleaning (clipping spikes), filtering (extracting valid rows), flagging (counting violations), and np.where — the fork-in-the-road function that powers feature engineering. Two rules make or break it in practice: compound questions use & | ~ with mandatory parentheses (using and/or crashes with NumPy's most famous error message), and every mask ALLOCATES — same-shape bool arrays plus a copy of every selected value. This lesson makes both rules concrete and verified.",
      blocks: [
        {
          kind: "text",
          text: "Slicing says *where*; boolean indexing says *what*. You write a question — `temps > 26` — and NumPy evaluates it for every element at once, producing an array of **True/False answers with the same shape as the data**. That answer array is called a **mask**, and putting it inside the brackets selects exactly the elements that answered True. You have been using this grammar since school: 'the days where the temperature exceeded 26' is a where-clause, and NumPy lets you write where-clauses as code.",
        },
        {
          kind: "heading",
          text: "Comparisons produce boolean arrays",
        },
        {
          kind: "code",
          title: "Ask the question, get the answers",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

mask = temps > 26
print(mask)
print("dtype:", mask.dtype, "shape:", mask.shape, "same as temps:", mask.shape == temps.shape)
`,
          output: `[[False False False  True]
 [ True False  True False]
 [False  True False  True]]
dtype: bool shape: (3, 4) same as temps: True`,
          outputNote: "Every element answered the question individually: 28, 30, 92, 95 and 27 said True; the other seven said False. dtype is bool.",
          explain: [
            "`temps > 26` ran the comparison on all twelve elements at once — vectorized, like the arithmetic from Part A.",
            "The result has temps' exact shape (3, 4) and dtype bool: an array of answers, one per element, in position.",
            "Five cells read True in this data — count them in the printout; they are about to be selected.",
          ],
        },
        {
          kind: "heading",
          text: "Indexing WITH a mask: the matches, 1-D, in reading order",
        },
        {
          kind: "code",
          title: "Put the question inside the brackets",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

mask = temps > 26
sel = temps[mask]

print("values over 26:", sel)
print("shape:", sel.shape, "ndim:", sel.ndim)
print("is a copy, not a view:", not np.shares_memory(temps, sel))
`,
          output: `values over 26: [28 30 92 95 27]
shape: (5,) ndim: 1
is a copy, not a view: True`,
          outputNote: "The five matches, in reading order (row by row, left to right within each row) — as a 1-D array no matter how many dimensions temps had.",
          explain: [
            "`temps[mask]` gathered 28, 30, 92, 95, 27 — every element whose mask cell said True, visited in reading order.",
            "The result is 1-D *because* the matches have no grid structure to preserve: they are scattered. Contrast slicing (result shape follows the data) with fancy indexing, whose result shape follows the INDEX (Lesson d-05).",
            "`shares_memory` says False: boolean selection always COPIES the picked values into a fresh block (the decision table from d-03).",
          ],
        },
        {
          kind: "heading",
          text: "Compound questions: & | ~ (and never and/or)",
        },
        {
          kind: "text",
          text: "Real questions have compound conditions: 'above 20 AND below 26', 'freezing OR boiling'. NumPy's operators are **`&` (and), `|` (or), `~` (not)**, applied element-wise to masks — and the parentheses around each comparison are **mandatory**, because `&` binds more tightly than `>` and `<`. Python's own `and`/`or`/`not` cannot work here at all, and the block after next shows you the exact crash.",
        },
        {
          kind: "code",
          title: "AND, OR, NOT — element-wise, parenthesized",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

mild = (temps > 20) & (temps < 26)      # both ends, parentheses required
print("mild values:", temps[mild])

hot = temps > 26
cold = temps < 20
print("hot OR cold count:", np.count_nonzero(hot | cold))
print("NOT hot count    :", np.count_nonzero(~hot))
`,
          output: `mild values: [21 25 24 22]
hot OR cold count: 7
NOT hot count    : 7`,
          outputNote: "mild caught 21, 25, 24 and 22 — above 20 AND below 26. The OR mask counted hot and cold together; ~hot flipped every answer.",
          explain: [
            "`(temps > 20) & (temps < 26)` — each comparison built a mask first, then & kept the cells where BOTH said True.",
            "`hot | cold` kept cells where either said True; `~hot` flipped every True to False and vice versa.",
            "Strip the parentheses and `temps > 20 & temps < 26` parses as `temps > (20 & temps) < 26` — a chained comparison that tries to treat an array as a single boolean, and crashes exactly like `and` does.",
          ],
        },
        {
          kind: "code",
          title: "Why and/or crash on arrays",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

both = temps > 20 and temps < 26    # Python's 'and' needs ONE truth value
print(both)
`,
          expectError: "ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()",
          outputNote: "NumPy's most famous error. 'and' wants to know if its left side is truthy — but which truth? Twelve answers exist, so NumPy refuses to guess.",
          explain: [
            "Python's `and` evaluates `bool(left_side)` — one True or False. An array of twelve answers has no single truth value.",
            "NumPy deliberately raises instead of guessing (older array libraries guessed 'any' or 'all' — both wrong half the time).",
            "The element-wise operators are the fix: `&` when you mean 'both masks True HERE', `.any()` / `.all()` when you genuinely want to collapse an array to one boolean (their full treatment is Part H).",
          ],
        },
        {
          kind: "heading",
          text: "Assignment through a mask: the clip-by-hand idiom",
        },
        {
          kind: "text",
          text: "Masks do not just READ — `a[mask] = value` writes every selected cell at once. The single most useful instance is the **clip by hand**: cap everything above a limit AT the limit (and its mirror, floor everything below a minimum). One line, no loop, and it reads like the policy it implements. Note the workflow below: work on a `.copy()`, keep the raw data raw — Lesson d-03's firewall applied for real.",
        },
        {
          kind: "code",
          title: "Capping the spikes at 26",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

clean = temps.copy()             # Lesson d-03's firewall: raw stays raw
clean[clean > 26] = 26           # the clip-by-hand idiom

print("clean:")
print(clean)
print("spiked readings that got capped:", np.count_nonzero(temps > 26))
print("none survive above 26           :", np.count_nonzero(clean > 26))
`,
          output: `clean:
[[21 19 25 26]
 [26 18 26 24]
 [22 26 20 26]]
spiked readings that got capped: 5
none survive above 26           : 0`,
          outputNote: "Five cells were capped (28, 30, 92, 95, 27 — counted on the RAW data before editing), and afterwards zero cells exceed 26.",
          explain: [
            "`clean[clean > 26] = 26` — the mask selected five cells; the scalar 26 was written into exactly those cells, through the copy (so temps is untouched).",
            "`np.count_nonzero(temps > 26)` counted 5 hits BEFORE editing — always count on the raw side when you want the true incident total.",
            "After the clip, counting on clean gives 0: the policy held. (NumPy also ships np.clip(a, lo, hi) for exactly this — Part F gives it its card.)",
          ],
        },
        {
          kind: "heading",
          text: "Counting answers: np.count_nonzero",
        },
        {
          kind: "code",
          title: "Three ways to count, one clear favorite",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

hot = temps > 26
print("np.count_nonzero(hot):", np.count_nonzero(hot))   # counts the True cells
print("hot.sum()             :", hot.sum())              # True is 1, False is 0
print("np.count_nonzero(temps):", np.count_nonzero(temps))  # no mask: counts non-zero VALUES
`,
          output: `np.count_nonzero(hot): 5
hot.sum()             : 5
np.count_nonzero(temps): 12`,
          outputNote: "On a bool mask, count_nonzero and .sum() agree (True acts as 1). Without a mask, count_nonzero counts non-zero values — here all twelve temperatures are non-zero.",
          explain: [
            "`np.count_nonzero(mask)` reads as what it does and is the idiomatic count — for booleans, non-zero IS True.",
            "`mask.sum()` exploits the fact that bool arrays add as 1s and 0s — a trick you will see everywhere in other people's code.",
            "On the raw data (no mask), count_nonzero counts non-zero VALUES: all 12 temperatures are non-zero, so it says 12. Same function, different question.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.count_nonzero",
          purpose: "Count how many elements are non-zero — which, on a boolean mask, means how many cells answered True.",
          signature: "np.count_nonzero(a, axis=None, *, keepdims=False)",
          purposeDetail:
            "Once you start asking questions of arrays, the immediate follow-up is always 'how many?'. count_nonzero is the dedicated answer: it walks the array (or one axis of it) and counts truthy elements — and because boolean masks store True as 1, it is THE way to count mask hits. It is also faster and clearer than (a > x).sum(), and unlike len(a[a > x]) it never allocates the selected values just to count them.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array to count in. Non-boolean arrays count non-zero values; boolean arrays count True.",
              example: "mask",
            },
            {
              name: "axis",
              type: "int or tuple of int or None",
              required: false,
              description: "Count along one axis (or several) instead of the whole array: axis=0 counts per column, axis=1 per row. None (default) counts everything.",
              example: "axis=1",
            },
            {
              name: "keepdims",
              type: "bool",
              required: false,
              description: "Keep the reduced axes as length-1 dimensions so the result still broadcasts against the input (same idea as reductions, Part H).",
              example: "keepdims=True",
            },
          ],
          returns: {
            type: "int or ndarray of int",
            description: "The total count (axis=None) or an array of per-axis-slice counts with the counted axes removed.",
          },
          example: `import numpy as np

data = np.array([[0, 1, 2],
                 [0, 0, 3]])

print("non-zero values overall:", np.count_nonzero(data))
print("non-zero per row       :", np.count_nonzero(data, axis=1))
print("non-zero per column    :", np.count_nonzero(data, axis=0))

mask = np.array([True, False, True, True])
print("True cells in mask     :", np.count_nonzero(mask))
`,
          exampleOutput: `non-zero values overall: 3
non-zero per row       : [2 1]
non-zero per column    : [0 1 2]
True cells in mask     : 3`,
          commonMistakes: [
            {
              mistake: "Using len(a[mask]) to count matches.",
              why: "It gives the right number but builds the full selected COPY first — for a 100M-element array that is a real allocation just to throw it away.",
              fix: "Count the mask directly: np.count_nonzero(mask). Same number, no gather.",
            },
            {
              mistake: "Expecting count_nonzero to count only 'positive' values.",
              why: "It counts NON-ZERO — and -3 is non-zero. Negative values count too.",
              fix: "Count a specific range by counting its mask: np.count_nonzero((a > lo) & (a < hi)).",
            },
            {
              mistake: "Passing a comparison where you meant to count values, and misreading the result.",
              why: "count_nonzero(a > 5) counts the ANSWERS (True cells), while count_nonzero(a) counts non-zero VALUES. Two different questions, one function.",
              fix: "Say the question out loud: 'how many elements exceed 5' needs the mask form; 'how many elements are set' needs the plain form.",
            },
          ],
          related: [
            { name: "np.where", relation: "Not just 'how many' but 'WHERE': the one-argument form returns the indexes of the True cells (previewed below)." },
            { name: "ndarray.sum", relation: "mask.sum() gives the same count via 1s-and-0s addition — the classic trick, slightly less literal than count_nonzero." },
            { name: "np.any / np.all", relation: "Collapse a mask to a single boolean ('at least one True' / 'all True') — Part H's aggregations." },
            { name: "np.flatnonzero", relation: "The positions (indexes) of the non-zero cells as a 1-D array — Lesson d-06 previews it." },
          ],
          applications: [
            "Data quality reports: how many readings exceeded the limit, per sensor (axis=1) and overall",
            "Assertion gates: if np.count_nonzero(spikes) != expected: fail loudly before the pipeline continues",
            "Coverage checks: what fraction of a mask is True — count_nonzero(mask) / mask.size",
          ],
          notes:
            "count_nonzero predates booleans being a first-class dtype and predates .sum() tricks being obvious; it stuck because it names its intent. Prefer it when readability matters more than the last nanosecond.",
        },
        {
          kind: "heading",
          text: "np.where: the bridge from questions to arrays",
        },
        {
          kind: "text",
          text: "Masks select; **np.where builds**. Its two-argument lookup form, `np.where(condition, x, y)`, walks the condition cell by cell and answers: 'x where True, y where False'. Same clip, but producing a NEW array instead of editing one — which is often what you want (original preserved, no copy needed first). Its full treatment — including the one-argument form that returns WHERE the matches are — lands in Part E with searching; here is the card, because it is the natural next move after masks:",
        },
        {
          kind: "code",
          title: "The same clip, built instead of edited",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

capped = np.where(temps > 26, 26, temps)
print("capped:")
print(capped)

labels = np.where(temps > 26, "spike", "ok")
print("labels:", labels, sep="\\n")

# The one-argument form: WHERE are the spikes? (indexes -- Part E's full story)
print("spike locations:", np.where(temps > 26))
`,
          output: `capped:
[[21 19 25 26]
 [26 18 26 24]
 [22 26 20 26]]
labels:
[['ok' 'ok' 'ok' 'spike']
 ['spike' 'ok' 'spike' 'ok']
 ['ok' 'spike' 'ok' 'spike']]
spike locations: (array([0, 1, 1, 2, 2]), array([3, 0, 2, 1, 3]))`,
          outputNote: "np.where produced the same capped values as the mask-assignment version — without touching temps. The label line shows it forking between any two values, and the last print is a taste of the index form.",
          explain: [
            "`np.where(temps > 26, 26, temps)` — cell by cell: 26 where the mask is True, the original temperature where False. temps itself never changed.",
            "`np.where(temps > 26, \"spike\", \"ok\")` — the two branches can be any broadcastable values; here it builds a label grid. (Cross-axis types are Part B's rules.)",
            "`np.where(temps > 26)` with ONE argument returns a tuple of index arrays — the coordinates of every True cell, in reading order. Part E turns that into a searching toolkit.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.where",
          purpose: "Build a new array that forks cell by cell: x's value where the condition is True, y's value where it is False.",
          signature: "np.where(condition, [x, y], /)",
          purposeDetail:
            "`np.where` is the array version of a conditional expression — 'x if condition else y' evaluated for every element at once. It is how you repair data without loops (cap spikes), remap categories (flag every outlier), and blend two arrays by a rule (take yesterday's values only where today's are invalid). Its one-argument form answers a different question — 'at which indexes is the condition True?' — and that searching form gets its full treatment in Part E; this card covers the bridging three-argument form you need today.",
          params: [
            {
              name: "condition",
              type: "array_like of bool",
              required: true,
              description: "The fork: a boolean array (or anything that becomes one). Where True the result takes x, where False it takes y.",
              example: "temps > 26",
            },
            {
              name: "x",
              type: "array_like",
              required: false,
              description: "Values used where the condition is True. Scalars, arrays, or mixtures — they broadcast against the condition's shape.",
              example: "26",
            },
            {
              name: "y",
              type: "array_like",
              required: false,
              description: "Values used where the condition is False. Same broadcasting rules as x.",
              example: "temps",
            },
          ],
          returns: {
            type: "ndarray",
            description: "With x and y: a new array shaped like the broadcast combination of all three inputs. With only the condition: a TUPLE of index arrays locating the True cells.",
          },
          example: `import numpy as np

temps = np.array([21, 27, 25, 30, 19])

capped = np.where(temps > 25, 25, temps)
print("capped:", capped)

labels = np.where(temps > 25, "hot", "ok")
print("labels:", labels)

# One-argument form (Part E's searching story): WHERE are they?
print("positions of the hot ones:", np.where(temps > 25))
`,
          exampleOutput: `capped: [21 25 25 25 19]
labels: ['ok' 'hot' 'ok' 'hot' 'ok']
positions of the hot ones: (array([1, 3]),)`,
          commonMistakes: [
            {
              mistake: "Writing np.where(a > 5) and expecting the VALUES above 5.",
              why: "With one argument np.where returns INDEXES (a tuple of arrays), not values. The values are one step away: a[np.where(a > 5)] — or simply a[a > 5].",
              fix: "Want values? Use the mask directly: a[a > 5]. Want positions? That is exactly what the one-argument form is for.",
            },
            {
              mistake: "Expecting np.where to edit x or y in place.",
              why: "It BUILDS a new array from the two branches; its inputs are only read. (Contrast with mask assignment a[a > 5] = 0, which edits in place.)",
              fix: "Choose by intent: assign through the mask to edit the original, np.where to produce a fresh result while keeping the source intact.",
            },
            {
              mistake: "Passing the condition without parentheses when it is compound.",
              why: "np.where(temps > 20 & temps < 26, ...) mis-parses exactly like bare masks — & binds tighter than comparisons, and you get the ambiguous-truth crash.",
              fix: "Parenthesize every comparison: np.where((temps > 20) & (temps < 26), ...).",
            },
          ],
          related: [
            { name: "boolean mask assignment", relation: "The in-place sibling: a[mask] = value edits the original; np.where builds a new array and leaves it alone." },
            { name: "np.select", relation: "The multi-way fork — more than two branches, first match wins (Lesson d-06)." },
            { name: "np.nonzero", relation: "What the one-argument where returns: the indexes of the True cells. Part E expands both." },
            { name: "np.clip", relation: "The dedicated cap-both-ends function for the most common where-trick (Part F)." },
          ],
          applications: [
            "Cleaning without mutating: capped = np.where(raw > limit, limit, raw)",
            "Flagging and labeling: status = np.where(errors > 0, 'FAIL', 'PASS')",
            "Blending sources: merged = np.where(np.isnan(today), fallback, today) — NaN handling is Part J's turf",
          ],
          notes:
            "The three arrays (condition, x, y) broadcast against each other (rules in Part G), so scalars and columns mix freely. When both branches are scalars, the result's dtype comes from combining them — the same promotion rules as np.array from Part B.",
        },
        {
          kind: "heading",
          text: "What masks cost: they allocate",
        },
        {
          kind: "text",
          text: "Every comparison builds a same-shape boolean array, and every selection copies the picked values. On a 3x4 grid that is nothing; on a 100-million-element array the mask alone is a real allocation (one byte per element), and chained questions allocate one mask per comparison. Verify the per-element cost yourself:",
        },
        {
          kind: "code",
          title: "The price of a question, measured in bytes",
          code: `import numpy as np

print("one bool is", np.dtype(bool).itemsize, "byte")

big = np.zeros(1_000_000)            # a million float64 values
mask = big > 0.5                     # the question allocates...
print("mask for a million floats:", mask.nbytes, "bytes")
print("picked values (none here):", big[mask].size, "elements")
`,
          output: `one bool is 1 byte
mask for a million floats: 1000000 bytes
picked values (none here): 0 elements`,
          outputNote: "One byte per element: the mask for a million floats is exactly one million bytes — a megabyte per question, per axis, per comparison in a chain.",
          explain: [
            "`np.dtype(bool).itemsize` is 1: True/False fit in a single byte each.",
            "The mask for a 1,000,000-element array is 1,000,000 bytes — allocated fresh for EVERY question, released when the name goes away.",
            "The selection `big[mask]` then allocates AGAIN, sized to the number of matches. None matched here (all zeros), so the copy is empty — the mask was still paid for.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The mask explorer — questions as selections",
          mode: "slice",
          name: "t",
          caption:
            "The 3x4 temperature grid from this lesson. Each chip below is a question; the lit cells are the elements it selects, in reading order. Walk them in order and predict each result before clicking: over the limit, under the floor, inside a band, NOT over the limit, and divisibility by 2.",
          data: [
            [21, 19, 25, 28],
            [30, 18, 92, 24],
            [22, 95, 20, 27],
          ],
          selections: [
            {
              expr: "t[t > 26]",
              cells: [[0, 3], [1, 0], [1, 2], [2, 1], [2, 3]],
              note: "The five spikes: 28, 30, 92, 95, 27 — gathered 1-D in reading order.",
            },
            {
              expr: "t[t < 20]",
              cells: [[0, 1], [1, 1]],
              note: "Below 20: 19 and 18. A mask can select any count — here just two cells.",
            },
            {
              expr: "t[(t >= 20) & (t < 25)]",
              cells: [[0, 0], [1, 3], [2, 0], [2, 2]],
              note: "Compound question with &: both comparisons true in the same cell — 21, 24, 22, 20.",
            },
            {
              expr: "t[~(t > 26)]",
              cells: [[0, 0], [0, 1], [0, 2], [1, 1], [1, 3], [2, 0], [2, 2]],
              note: "~ flips every answer: the seven cells that are NOT over 26.",
            },
            {
              expr: "t[t % 2 == 0]",
              cells: [[0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0], [2, 2]],
              note: "Masks can come from any element-wise computation, not just >: here t % 2 == 0 picks the even values.",
            },
          ],
        },
        {
          kind: "tryIt",
          title: "Run a small cleaning policy",
          task: "Run this, then: (1) change the cap from 26 to 24 and predict the new count of capped cells before rerunning; (2) add a floor: clean[clean < 20] = 20, and print the final min and max; (3) build the same result WITHOUT editing, using np.where.",
          code: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

hot = temps > 26
print("hot readings:", temps[hot])
print("how many:", np.count_nonzero(hot))

clean = temps.copy()          # firewall: raw stays raw
clean[hot] = 26               # cap the spikes
print("after capping at 26:")
print(clean)
`,
          hint: "With a cap of 24, count the raw cells above 24 (not above 26): 28, 30, 92, 24? no, 95 and 27 — count carefully on the RAW side. For np.where: capped = np.where(temps > 26, 26, temps).",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Comparisons build same-shape boolean masks; mask-in-brackets gathers the True cells as a 1-D copy in reading order; compound questions use & | ~ with parentheses (and/or crash); mask assignment is the clip idiom; np.where builds a forked array instead of editing; and every question allocates a byte per element.",
        },
      ],
      terms: [
        { term: "Boolean mask", definition: "A bool array with the same shape as the data, holding one True/False answer per element; placed inside brackets, it selects the True cells." },
        { term: "Compound mask", definition: "A mask built by combining masks element-wise with & (and), | (or) or ~ (not) — each comparison parenthesized." },
        { term: "Reading order", definition: "Row-major visit order (left to right, top to bottom): the order mask selection gathers matches, and the order fancy indexes visit." },
        { term: "Clip-by-hand idiom", definition: "Capping values with mask assignment — a[a > limit] = limit — and its mirror a[a < floor] = floor." },
        { term: "The ambiguous-truth error", definition: "ValueError raised when Python's and/or/not (or a chained comparison) needs one truth value from an array with several: 'The truth value of an array with more than one element is ambiguous.'" },
      ],
      mistakes: [
        {
          mistake: "Combining mask conditions with and / or instead of & / |.",
          why: "Python's and evaluates bool(array) — impossible for a multi-element array, so NumPy raises its famous ValueError about ambiguous truth (verified in this lesson).",
          fix: "Use the element-wise & | ~ and parenthesize every comparison: (t > 20) & (t < 26).",
        },
        {
          mistake: "Dropping the parentheses: temps > 20 & temps < 26.",
          why: "& binds tighter than comparisons, so Python groups it as temps > (20 & temps) < 26 — a chained comparison needing one truth value, crashing with the same ambiguous-truth error.",
          fix: "Parenthesize each comparison as you write it. The brackets are not style; they change the parse.",
        },
        {
          mistake: "Expecting mask selection to return a 2-D region shaped like the data.",
          why: "The True cells can be scattered anywhere — there is no grid to preserve, so the result is always 1-D in reading order (verified: shape (5,) from a 3x4 source).",
          fix: "If you need per-row structure, count per row (np.count_nonzero(mask, axis=1)) or reach for Part E's argwhere toolset.",
        },
        {
          mistake: "Editing the original while 'just exploring', via mask assignment.",
          why: "a[a > 100] = 100 writes through the mask INTO a — powerful when intended, corruption when not. This is d-03's view lesson wearing a mask.",
          fix: "Assign into a .copy() when the raw data must survive; produce a fresh result with np.where when you never want to edit at all.",
        },
      ],
      takeaways: [
        "A comparison is a vectorized question: temps > 26 returns a same-shape bool array with one answer per element.",
        "Mask selection gathers the True cells as a 1-D COPY, in reading order — no matter the source's dimensions (shape (5,) from a 3x4 grid here).",
        "Compound questions: & | ~ element-wise, every comparison parenthesized; and/or raise 'The truth value of an array ... is ambiguous' — NumPy's most famous error.",
        "Mask assignment is policy as code: clean[clean > 26] = 26 caps five cells in one line; count on the raw side first with np.count_nonzero.",
        "np.where(condition, x, y) builds the forked array instead of editing it — and every mask allocates: one byte per element per question, plus a copy of whatever is selected.",
      ],
      quiz: [
        {
          id: "d-04-q1",
          prompt: "`t` is a 3x4 array. What is the shape of `t[t > 26]` when exactly five cells exceed 26?",
          options: [
            { text: "(5,) — the matches, 1-D, in reading order", correct: true, feedback: "Right: scattered matches have no grid shape to keep, so mask results are always 1-D regardless of the source's dimensions." },
            { text: "(3, 4) — a same-shape grid with gaps removed", correct: false, feedback: "The mask's shape is (3, 4), but the SELECTED result is not — it is the flat list of matches." },
            { text: "(1, 5) — a row of the five matches", correct: false, feedback: "Close in spirit, wrong in shape: mask selection never invents a 2-D wrapper; it returns a flat 1-D array." },
            { text: "It depends on where in the grid the five cells sit", correct: false, feedback: "Position never matters — reading order (row by row) fixes the output order; the count fixes the length." },
          ],
          explanation: "Mask results are 1-D in reading order: five matches, shape (5,).",
        },
        {
          id: "d-04-q2",
          prompt: "Why do the parentheses in `(t > 20) & (t < 26)` matter?",
          options: [
            { text: "& binds more tightly than comparisons, so without them Python mis-groups the expression into a chained comparison that crashes", correct: true, feedback: "Exactly: t > 20 & t < 26 parses as t > (20 & t) < 26, which needs one truth value from an array — the ambiguous-truth ValueError." },
            { text: "They are purely stylistic; NumPy re-parses either way", correct: false, feedback: "Nothing re-parses anything: Python's precedence rules are fixed, and & beats > in them." },
            { text: "Parentheses convert the masks to dtype bool", correct: false, feedback: "The comparisons already return bool arrays — parentheses change grouping, not types." },
            { text: "They make the masks copy instead of view", correct: false, feedback: "Comparisons always produce fresh bool arrays; views never enter this picture." },
          ],
          explanation: "Parentheses force the comparisons to complete before & combines them — without them, precedence hands you the ambiguous-truth crash.",
        },
        {
          id: "d-04-q3",
          prompt: "What does `clean[clean > 100] = 100` do to `clean`?",
          options: [
            { text: "Replaces every value above 100 with exactly 100, in place — the clip idiom", correct: true, feedback: "Correct: the mask selects the over-limit cells, the scalar 100 is written into each of them, shape and dtype unchanged." },
            { text: "Returns a new array with the cap applied, leaving clean untouched", correct: false, feedback: "That is np.where(clean > 100, 100, clean). Assignment through a mask edits in place." },
            { text: "Deletes the values above 100, shortening the array", correct: false, feedback: "Arrays never change shape by assignment — values are replaced, never removed." },
            { text: "Raises an error: you cannot assign a scalar through a boolean mask", correct: false, feedback: "You can — the scalar broadcasts to every selected cell. That is the whole point of the idiom." },
          ],
          explanation: "Mask assignment writes the selected cells in place: every value above 100 becomes 100, everything else untouched.",
        },
      ],
    },

    // ------------------------------------------------------------- d-05
    {
      slug: "d-05",
      title: "Fancy Indexing: Places in Your Order",
      minutes: 18,
      summary:
        "Slices give runs and masks give answers; fancy indexing gives you PLACES, visited in exactly the order you listed them. Duplicate places kept, order kept, always a fresh copy — and the number-one surprise in all of NumPy indexing: two index lists pair up as coordinates, not as a block.",
      kind: "concept",
      objectives: [
        "Gather elements with lists of places (a[[0, 2, 2]]) and predict the result: your order, your duplicates, your length",
        "Explain why paired index lists are COORDINATES — a[[0, 1], [2, 2]] picks two cells, not a 2x2 block — and build the block you meant with np.ix_",
        "Mix fancy lists with slices and with boolean masks, per axis, in one bracket pair",
        "Prove fancy indexing always returns a copy (np.shares_memory) and contrast with the views basic indexing hands you",
        "Assign through fancy indexes, predict value broadcasting, and state the last-write-wins rule for duplicate places",
        "Convert flat positions to [row, col] coordinates and back with np.unravel_index and np.ravel_multi_index",
      ],
      why: "Real data work constantly needs 'these five rows, in this order, and two of them twice' — a top-3 leaderboard with the winner repeated, a sample of stations chosen by name, a row shuffle that puts the worst server first. Slices cannot express order or repetition; masks cannot express positions at all (they only answer questions). Fancy indexing is the third route into an array: you hand NumPy a literal shopping list of places and it gathers them, in your order, duplicates included. Two facts trip up almost everyone — paired lists are coordinates rather than a row-set-times-column-set block, and the result is always a fresh COPY rather than a view — and both are provable in one line each, which is exactly what this lesson does before you build the habit on them.",
      blocks: [
        {
          kind: "text",
          text: "A slice says *a run of places*; a mask says *places that answer yes*. The third route is the most literal of all: **fancy indexing** — you pass a list or array of places inside the brackets, and NumPy gathers exactly those places, in exactly your order. It is called *fancy* because the index is itself an array, and it is the tool behind every 'reorder these rows', 'sample these positions', 'repeat that one' maneuver in the NumPy world.",
        },
        {
          kind: "heading",
          text: "A shopping list of places: your order, your duplicates",
        },
        {
          kind: "text",
          text: "Give a list where you normally give a single index. Every entry names a position, and the result has **exactly one element per entry** — same length as your list, same order as your list, duplicates and all. Compare all three routes on one array:",
        },
        {
          kind: "code",
          title: "One array, three routes in",
          code: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

print("one[1:4]     :", one[1:4])       # slice: a run -- 6, 9, 12
print("one[one > 8] :", one[one > 8])   # mask: the yes-sayers -- 9, 12, 15
print("one[[3, 0, 3]]:", one[[3, 0, 3]])  # fancy: your places, your order
print("one[[-1, -3]] :", one[[-1, -3]])   # negatives count from the end
`,
          output: `one[1:4]     : [ 6  9 12]
one[one > 8] : [ 9 12 15]
one[[3, 0, 3]]: [12  3 12]
one[[-1, -3]] : [15  9]`,
          outputNote: "The fancy line gathered position 3, then 0, then 3 again — three entries in, three values out, duplicates kept, order kept.",
          explain: [
            "`one[[3, 0, 3]]` read the list left to right: position 3 is 12, position 0 is 3, position 3 again is 12. The result is [12 3 12] — length 3 because your list has length 3.",
            "`one[[-1, -3]]` mixed negatives exactly like single indexes do: -1 is 15, -3 is 9.",
            "The slice and the mask gave answers *the data* dictated; the fancy index gave an answer *your list* dictated. That is the whole idea.",
          ],
        },
        {
          kind: "heading",
          text: "Fancy rows of a grid",
        },
        {
          kind: "text",
          text: "On a 2-D array, a single list indexes axis 0 (rows) — and because you said nothing about columns, each picked row comes back whole. The result shape follows **your list**, not the data: three entries means three rows, even if two of them name the same row.",
        },
        {
          kind: "code",
          title: "Rows in your order, one row twice",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[[0, 2, 2]] -- row 0, row 2, row 2 again:")
print(a[[0, 2, 2]])
print()
print("a[[-1, 0]] -- last row first, then the top row:")
print(a[[-1, 0]])
`,
          output: `a[[0, 2, 2]] -- row 0, row 2, row 2 again:
[[10 11 12 13]
 [30 31 32 33]
 [30 31 32 33]]

a[[-1, 0]] -- last row first, then the top row:
[[30 31 32 33]
 [10 11 12 13]]`,
          outputNote: "Three entries in the list, three rows out — 33's row appears twice, and the second gathering starts from the bottom because -1 came first.",
          explain: [
            "`a[[0, 2, 2]]` has shape (3, 4): your list had three entries, each naming a full (4,) row.",
            "`a[[-1, 0]]` reversed the grid's rows: row 2 (values 30-33) printed first. Fancy indexes are how you reorder rows — Lesson d-06 and this part's project both lean on it.",
            "Nothing was copied FROM the grid's memory yet — well, it was: hold that thought for the copy section below.",
          ],
        },
        {
          kind: "heading",
          text: "The number-one surprise: paired lists are COORDINATES",
        },
        {
          kind: "text",
          text: "Here it is — the fancy-indexing surprise that catches everyone exactly once. You write **one list per axis**, expecting 'these rows, times those columns' — a block. What you get instead: the lists are zipped into **coordinate pairs**. `a[[0, 1], [2, 2]]` does not mean rows {0, 1} x columns {2, 2}; it means the pair (0, 2), then the pair (1, 2). Two cells, not four.",
        },
        {
          kind: "code",
          title: "Two lists zip into pairs",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[[0, 1], [2, 2]] :", a[[0, 1], [2, 2]])
print("  -> the pairs (0, 2) and (1, 2):", a[0, 2], "and", a[1, 2])
print()
print("a[[0, 1, 2], [0, 1, 2]] :", a[[0, 1, 2], [0, 1, 2]])
print("  -> the pairs (0,0), (1,1), (2,2): the main diagonal")
`,
          output: `a[[0, 1], [2, 2]] : [12 22]
  -> the pairs (0, 2) and (1, 2): 12 and 22

a[[0, 1, 2], [0, 1, 2]] : [10 21 32]
  -> the pairs (0,0), (1,1), (2,2): the main diagonal`,
          outputNote: "[12 22] — exactly two values for exactly two pairs. And the same-length diagonal idiom gathers a[0,0], a[1,1], a[2,2] in one expression.",
          explain: [
            "`a[[0, 1], [2, 2]]` zipped the lists: first entries pair up as (0, 2) — value 12 — then second entries as (1, 2) — value 22. The result length is the lists' length, NOT their product.",
            "`a[[0, 1, 2], [0, 1, 2]]` is the classic diagonal idiom: pair k is (k, k), so it gathers 10, 21, 32.",
            "The rule in general: when several axes carry index LISTS (or boolean masks), the lists must be the same length and NumPy walks them together, entry by entry.",
          ],
        },
        {
          kind: "visual",
          title: "Zip versus cross product",
          ascii: `  a[[0, 1], [2, 2]]  -- ZIP: paired coordinates      a[np.ix_([0, 1], [2, 2])]  -- CROSS PRODUCT

        cols 0   1   2   3                              cols 0   1   2   3
            +---+---+---+---+                              +---+---+---+---+
  rows 0   |   |   | X |   |  <- (0, 2)          rows 0   |   |   | X | X |  <- (0, 2) and (0, 2)
            +---+---+---+---+                              +---+---+---+---+
  rows 1   |   |   | X |   |  <- (1, 2)          rows 1   |   |   | X | X |  <- (1, 2) and (1, 2)
            +---+---+---+---+                              +---+---+---+---+

  two pairs  ->  result [12 22]                  2 rows x 2 cols -> [[12 12]
                                                                        [22 22]]`,
          caption:
            "Two lists in one bracket pair ZIP into coordinates (left). np.ix_ builds the row-set-times-column-set CROSS PRODUCT most people expect (right) — next block.",
        },
        {
          kind: "heading",
          text: "np.ix_: the cross product you meant",
        },
        {
          kind: "text",
          text: "When you DO want 'these rows, times those columns' — a genuine block from two sets — wrap the lists in **np.ix_**. It reshapes each list into a column-shaped and a row-shaped piece so they broadcast against each other (the mechanism is Part G's broadcasting; the function exists so you never have to think about that today). One call, and the pairing becomes a product:",
        },
        {
          kind: "code",
          title: "The block, built the explicit way",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[np.ix_([0, 1], [2, 2])] -- rows {0, 1} x columns {2, 2}:")
print(a[np.ix_([0, 1], [2, 2])])
print()
print("a[np.ix_([0, 2], [1, 3])] -- the four corners-ish block:")
print(a[np.ix_([0, 2], [1, 3])])
print()
print("negatives inside ix_ too, a[np.ix_([-1, 0], [1, -1])]:")
print(a[np.ix_([-1, 0], [1, -1])])
`,
          output: `a[np.ix_([0, 1], [2, 2])] -- rows {0, 1} x columns {2, 2}:
[[12 12]
 [22 22]]

a[np.ix_([0, 2], [1, 3])] -- the four corners-ish block:
[[11 13]
 [31 33]]

negatives inside ix_ too, a[np.ix_([-1, 0], [1, -1])]:
[[31 33]
 [11 13]]`,
          outputNote: "2x2, 2x2, 2x2: with ix_, the result shape is the product of the list lengths — rows-picked times columns-picked, like a mini-grid.",
          explain: [
            "`a[np.ix_([0, 1], [2, 2])]` finally gave the four cells: (0,2), (0,2), (1,2), (1,2) — column list {2, 2} just repeats column 2, so the block is 12 and 22 twice.",
            "`a[np.ix_([0, 2], [1, 3])]` is the everyday use: rows 0 and 2, columns 1 and 3 — a genuine 2x2 patch of the grid.",
            "Negatives work inside ix_ exactly as they do everywhere: [-1, 0] picks the last row then the first.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.ix_",
          purpose: "Turn several lists of places into an open mesh — the row-set-times-column-set cross product — so a[np.ix_(rows, cols)] selects a genuine block instead of zipped coordinate pairs.",
          signature: "np.ix_(*args)",
          purposeDetail:
            "Paired fancy lists zip into coordinates, which is usually what you want for scattered picks — but for 'these rows, times those columns' you need the lists multiplied out, not zipped. np.ix_ is the one-liner for that: it converts each list into a specially shaped array (a column, a row, ...) so that when NumPy broadcasts them against each other, every row-pick meets every column-pick. It is the function to reach for whenever a two-axis selection should produce a rectangle and the zip rule is fighting you.",
          params: [
            {
              name: "*args",
              type: "1-D sequences (lists or arrays of ints)",
              required: true,
              description: "One sequence of places per axis, in axis order. Each becomes one dimension of the mesh; their lengths multiply to give the selection's shape.",
              example: "[0, 2], [1, 3]",
            },
          ],
          returns: {
            type: "tuple of ndarrays",
            description: "One array per input sequence, each reshaped so they broadcast into an open mesh: the k-th output has shape 1 in every dimension except k, where it keeps the k-th list's length.",
          },
          example: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

block = a[np.ix_([0, 2], [1, 3])]
print("rows {0, 2} x columns {1, 3}:")
print(block)

print("negatives work too:")
print(a[np.ix_([-1], [0, -1])])
`,
          exampleOutput: `rows {0, 2} x columns {1, 3}:
[[11 13]
 [31 33]]
negatives work too:
[[30 33]]`,
          commonMistakes: [
            {
              mistake: "Reaching for ix_ when you wanted scattered coordinate pairs.",
              why: "a[np.ix_([0, 1], [2, 2])] gives FOUR cells (the cross product), while a[[0, 1], [2, 2]] gives the two you paired. Wrong tool, double the cells.",
              fix: "Paired places -> bare lists. A rectangle of rows-x-columns -> np.ix_. Say the sentence out loud before typing: 'pairs' vs 'all combinations'.",
            },
            {
              mistake: "Passing 2-D index arrays to np.ix_.",
              why: "ix_ is defined for 1-D sequences per axis; a 2-D input raises because the mesh construction expects one axis of picks per argument.",
              fix: "Flatten first (idx.ravel() or np.ravel) if your places arrive as a grid — or keep them as a plain paired fancy index, which accepts any shape.",
            },
            {
              mistake: "Wrapping single integers or slices in ix_ unnecessarily.",
              why: "np.ix_([2], [1]) works but produces a (1, 1)-shaped result instead of a scalar — an extra dimension you did not order.",
              fix: "Use plain indexes for single places and slices: a[2, 1] and a[0:2, [1, 3]] need no help from ix_.",
            },
          ],
          related: [
            { name: "fancy indexing (a[[...]])", relation: "The underlying mechanism; without ix_, multiple lists ZIP into coordinates instead of crossing." },
            { name: "np.broadcast_to / broadcasting", relation: "The machinery ix_ exploits — one column-shaped list against one row-shaped list (Part G tells that story)." },
            { name: "np.unravel_index", relation: "The other direction: turns flat places into [row, col] coordinate pairs, per place." },
            { name: "np.take", relation: "Fancy indexing's fast path along ONE axis — no pairing questions at all (Lesson d-06)." },
          ],
          applications: [
            "Selecting a rectangular sub-grid: corners = img[np.ix_([0, -1], [0, -1])]",
            "Cross-tabulation-style lookups: values of chosen rows at chosen columns, as a block",
            "Building index grids that pair with meshgrid-style coordinates (Part I's plotting work)",
          ],
          notes:
            "The trailing underscore is historical — the name is ix_, not ix, because early NumPy reserved short names. Read it as 'index cross'.",
        },
        {
          kind: "heading",
          text: "Mixing fancy with everything you already know",
        },
        {
          kind: "text",
          text: "Each axis of the bracket pair is independent — a rule this part has repeated since Lesson d-01, and fancy lists do not break it. Put a list on one axis and a slice on the other; a list on one axis and a mask on the other; anything goes, as long as the axes that both carry *lists or masks* agree in length so they can pair up.",
        },
        {
          kind: "code",
          title: "List on one axis, slice or mask on the other",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("a[[1, 2], 1:3] -- fancy rows, sliced columns:")
print(a[[1, 2], 1:3])
print()
print("a[1:3, [0, 2]] -- sliced rows, fancy columns:")
print(a[1:3, [0, 2]])
print()
rows_mask = np.array([True, False, True])   # rows 0 and 2
print("a[rows_mask, [1, 3]] -- mask rows, fancy columns:", a[rows_mask, [1, 3]])
print("a[rows_mask, ::2]   -- mask rows, sliced columns:")
print(a[rows_mask, ::2])
`,
          output: `a[[1, 2], 1:3] -- fancy rows, sliced columns:
[[21 22]
 [31 32]]

a[1:3, [0, 2]] -- sliced rows, fancy columns:
[[20 22]
 [30 32]]

a[rows_mask, [1, 3]] -- mask rows, fancy columns: [11 33]
a[rows_mask, ::2]   -- mask rows, sliced columns:
[[10 12]
 [30 32]]`,
          outputNote: "A boolean mask on an axis behaves as the list of its True positions — [True, False, True] acts like [0, 2], which is why it can pair with the length-2 column list.",
          explain: [
            "`a[[1, 2], 1:3]` — the list drove axis 0 (rows 1 and 2), the slice drove axis 1 (columns 1-2). Result shape (2, 2): two list entries times the slice's two columns.",
            "`a[rows_mask, [1, 3]]` — the mask converted to its True positions [0, 2], then zipped with [1, 3] as coordinate pairs: (0, 1) and (2, 3), values 11 and 33.",
            "`a[rows_mask, ::2]` — mask rows, every other column: shape (2, 2). Mixing kinds per axis is the norm, not an exception.",
          ],
        },
        {
          kind: "table",
          title: "What each axis accepts, and what it yields",
          headers: ["Axis carries", "That axis contributes"],
          rows: [
            ["a single integer", "one position — the axis disappears from the result"],
            ["a slice start:stop:step", "a run of positions — the axis keeps the run's length"],
            ["a list/array of places", "exactly your places, in your order — the axis takes the LIST's length"],
            ["a boolean mask (matching length)", "the True positions — the mask acts as the list of them"],
            ["two or more lists/masks together", "they ZIP into coordinate pairs — one result entry per zipped pair"],
          ],
          caption:
            "Zip rule reminder: lists and masks on several axes must match in length and are walked together. Want the product instead? That is np.ix_ — the one function in this table that changes the pairing rule.",
        },
        {
          kind: "heading",
          text: "Fancy indexing always hands you a COPY",
        },
        {
          kind: "text",
          text: "Lesson d-03's decision table said it; now you can prove it yourself. Basic indexing (integers, slices) hands you views — writes travel. Fancy indexing **gathers** your places into a fresh block: the result is a copy, its `base` is None, and writing into it changes nothing but the copy. Same brackets, opposite memory behavior — the exact reason `np.shares_memory` exists:",
        },
        {
          kind: "code",
          title: "The copy proof, both directions",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

picked = a[[0, 2]]
sliced = a[0:2]                       # the same-looking selection, done with a slice

print("fancy  shares memory with a:", np.shares_memory(a, picked))
print("slice  shares memory with a:", np.shares_memory(a, sliced))

picked[0, 0] = 9999                   # write into the fancy result...
print("a[0, 0] after that write     :", a[0, 0])   # ...and a never noticed
`,
          output: `fancy  shares memory with a: False
slice  shares memory with a: True
a[0, 0] after that write     : 10`,
          outputNote: "False versus True on back-to-back lines: the fancy result is a new block, the slice is a window. The 9999 landed in the copy only.",
          explain: [
            "`picked = a[[0, 2]]` allocated a fresh (2, 4) block and copied the values in — shares_memory says False.",
            "`picked[0, 0] = 9999` therefore edited the copy; `a` still holds 10 at [0, 0]. Contrast Lesson d-01, where the same write through the row VIEW `a[1]` reached the parent.",
            "This is also why chained fancy writes fail (Lesson d-03's edge case): `a[[0, 2]][0, 0] = 999` writes the copy that the first bracket returned. The write side — next — is where the copy fact starts to matter.",
          ],
        },
        {
          kind: "heading",
          text: "Writing through fancy lists: assignment",
        },
        {
          kind: "text",
          text: "Reading gathers a copy, but **assigning** `a[places] = values` writes into the original — the same split as masks in Lesson d-04. The values must fit the selection: a scalar fills every gathered cell, a value list pairs with your place list, and a 2-D value block fits a row-selection exactly. All three, verified:",
        },
        {
          kind: "code",
          title: "Scalar, paired, and exact-fit assignments",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

c = a.copy()
c[[0, 1], [2, 2]] = 99                # one scalar fills both coordinate pairs
print("after c[[0, 1], [2, 2]] = 99:")
print(c)
print()

e = a.copy()
e[[2, 0]] = [[90, 91, 92, 93],        # row block, listed in the SAME order
             [10, 11, 12, 13]]        # as the row picks [2, 0]
print("after e[[2, 0]] = <2x4 block> -- row 2 written first, row 0 second:")
print(e)
`,
          output: `after c[[0, 1], [2, 2]] = 99:
[[10 11 99 13]
 [20 21 99 23]
 [30 31 32 33]]

after e[[2, 0]] = <2x4 block> -- row 2 written first, row 0 second:
[[10 11 12 13]
 [20 21 22 23]
 [90 91 92 93]]`,
          outputNote: "The scalar 99 landed at (0, 2) and (1, 2). The block assignment rewrote row 2 with the 90s and row 0 with the 10s — the value rows follow the PICK order.",
          explain: [
            "`c[[0, 1], [2, 2]] = 99` — the two coordinate pairs each received 99: one scalar broadcast to every gathered cell.",
            "`e[[2, 0]] = [...]` — two row picks, two value rows, paired in order: the 90s went to row 2, the 10s to row 0. Fancy assignment follows YOUR order, not sorted order.",
            "Both writes landed in `c` and `e` themselves — assignment through fancy indexes edits the original array, even though reading returns a copy.",
          ],
        },
        {
          kind: "heading",
          text: "Last write wins: duplicate places",
        },
        {
          kind: "text",
          text: "What happens when your place list names the same cell twice — `a[[0, 0]] = [10, 20]`? NumPy performs the writes in order, and the **last write wins**: cell 0 receives 10, then 20, and holds 20. No accumulation, no error, no first-write-sticks. If you need both values to land, they must land in different cells:",
        },
        {
          kind: "code",
          title: "The same cell, written twice",
          code: `import numpy as np

b = np.zeros(3, dtype=int)
b[[0, 0]] = [10, 20]
print("b after b[[0, 0]] = [10, 20]:", b)

two_d = np.array([[10, 11, 12, 13],
                  [20, 21, 22, 23],
                  [30, 31, 32, 33]])
two_d[[0, 0], [1, 1]] = [40, 50]      # the pair (0, 1) twice
print("two_d[0, 1] after [40, 50] both wrote there:", two_d[0, 1])
`,
          output: `b after b[[0, 0]] = [10, 20]: [20  0  0]
two_d[0, 1] after [40, 50] both wrote there: 50`,
          outputNote: "b[0] is 20 and two_d[0, 1] is 50 — the LAST value in each list is the one that sticks. (Lesson d-06's np.put behaves identically: same rule, flat places.)",
          explain: [
            "`b[[0, 0]] = [10, 20]` wrote 10 into cell 0, then 20 into the same cell. The array holds 20 — last write wins.",
            "`two_d[[0, 0], [1, 1]] = [40, 50]` — duplicate coordinate pairs behave the same: 50 survives.",
            "The rule is a feature: it makes operations like self-assignment and scatter-writes deterministic instead of order-random. It is also a bug source when your index list has accidental duplicates — if results look 'overwritten', dedupe the places.",
          ],
        },
        {
          kind: "heading",
          text: "Flat places and grid coordinates",
        },
        {
          kind: "text",
          text: "Under the hood, every array is a flat line of bytes (Part A); the grid is a header's fiction. Sometimes you hold a FLAT position — 'element 7 of the block' — and need its grid coordinates, or vice versa. **np.unravel_index** converts flat to (row, col); **np.ravel_multi_index** converts back. They matter the moment masks meet memory: Lesson d-04's `np.where(mask)` returns coordinates, but `np.flatnonzero(mask)` returns flat places — and the flat form is exactly what d-06's np.put writes through.",
        },
        {
          kind: "code",
          title: "Flat place to coordinates, and back",
          code: `import numpy as np

row, col = np.unravel_index(7, (3, 4))        # flat 7 of a 3x4, row-major
print("flat 7 in a (3, 4) grid -> row", row, "col", col)

places = np.unravel_index([0, 5, 11], (3, 4))  # several at once
print("flat [0, 5, 11] -> rows", places[0], "cols", places[1])

back = np.ravel_multi_index(places, (3, 4))    # ...and the round trip
print("and back to flat:", back)
`,
          output: `flat 7 in a (3, 4) grid -> row 1 col 3
flat [0, 5, 11] -> rows [0 1 2] cols [0 1 3]
and back to flat: [ 0  5 11]`,
          outputNote: "Flat 7 is row 1, col 3 — counting 0, 1, 2 in row 0, then 3, 4, 5 in row 1... The round trip returns exactly [0, 5, 11].",
          explain: [
            "`np.unravel_index(7, (3, 4))` — 7 divided by the row length: 7 // 4 = row 1, 7 % 4 = col 3. Row-major flat counting, made a function.",
            "`np.unravel_index([0, 5, 11], (3, 4))` vectorizes over a list of flat places, returning one index array per axis: rows [0, 1, 2], cols [0, 1, 3].",
            "`np.ravel_multi_index` is the inverse: coordinates in, flat places out. Together they are the official bridge between 'position in memory' and 'place in the grid'.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.unravel_index",
          purpose: "Convert flat (row-major) positions into grid coordinates — flat 7 of a (3, 4) array is the pair (1, 3), and this function does that arithmetic for any shape.",
          signature: "np.unravel_index(indices, shape, order='C')",
          purposeDetail:
            "NumPy stores arrays as one flat block; the shape is a walking rule on top. Every so often the flat world leaks into your code — np.flatnonzero returns flat places, np.put accepts flat places, Part J's files are flat blocks — and you need the grid meaning of a flat number. unravel_index is the official translator: give it a flat position (or an array of them) and the shape it belongs to, and it returns the (row, col, ...) coordinates. It is pure arithmetic — no array is touched — which makes it free to use even inside loops.",
          params: [
            {
              name: "indices",
              type: "int or array_like of int",
              required: true,
              description: "One flat position or many. Each must fit inside the shape (0 to size-1) — unlike slices, there is no clamping.",
              example: "[0, 5, 11]",
            },
            {
              name: "shape",
              type: "tuple of ints",
              required: true,
              description: "The grid the flat positions belong to, e.g. (3, 4). Its entries must multiply to the array's size.",
              example: "(3, 4)",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              required: false,
              description: "Which flat counting to use: \"C\" row-major (default — last axis fastest), \"F\" column-major (first axis fastest). Part J's Fortran-order files are the main reason you would switch.",
              example: "order=\"C\"",
            },
          ],
          returns: {
            type: "tuple of ndarrays (or of scalars for one index)",
            description: "One index array per axis of shape, in axis order: (rows, cols, ...). A single int input returns a tuple of scalars.",
          },
          example: `import numpy as np

row, col = np.unravel_index(7, (3, 4))
print("flat 7 -> row", row, "col", col)

places = np.unravel_index([0, 5, 11], (3, 4))
print("flat [0, 5, 11] -> rows", places[0], "cols", places[1])
`,
          exampleOutput: `flat 7 -> row 1 col 3
flat [0, 5, 11] -> rows [0 1 2] cols [0 1 3]`,
          commonMistakes: [
            {
              mistake: "Feeding it coordinates and expecting flat places.",
              why: "The two directions are separate functions and easy to swap under deadline pressure: unravel goes flat -> coordinates; ravel_multi_index goes coordinates -> flat.",
              fix: "UnRavel a flat index = break it apart into coordinates. Ravel it back = flatten the coordinates into one number.",
            },
            {
              mistake: "Passing a flat position equal to the array's size (or larger).",
              why: "unravel_index checks bounds and raises ValueError: index 12 is out of bounds for array with size 12 — no clamping, unlike slices.",
              fix: "Valid flat positions run 0 to size-1. When sizes come from data, compute shape product first and assert your places are under it.",
            },
            {
              mistake: "Expecting an ndarray back instead of a tuple.",
              why: "It returns one array PER AXIS — a tuple — so the unpack 'rows, cols = np.unravel_index(...)' is the idiom, not 'pos = ...'.",
              fix: "Unpack into one name per axis, exactly like the two-arrays form of np.where from Lesson d-04.",
            },
          ],
          related: [
            { name: "np.ravel_multi_index", relation: "The exact inverse: coordinates in, flat positions out." },
            { name: "np.flatnonzero", relation: "The main PRODUCER of flat places: the positions of a mask's True cells (Lesson d-06 leans on this pair)." },
            { name: "np.where (one-argument)", relation: "Returns coordinates as a tuple of arrays — the grid-native sibling of flatnonzero (full story in Part E)." },
            { name: "ndarray.ravel", relation: "Flattens the DATA into a view/copy; unravel_index only converts a position NUMBER — no array involved." },
          ],
          applications: [
            "Turning np.flatnonzero(mask) hits into (row, col) pairs a human can read in a report",
            "Bridging np.put (flat places only) to grid-shaped logic — this part's mini project does exactly this",
            "Converting between image pixel numbers and (y, x) coordinates in pipelines that store sparse pixels as flat lists",
          ],
          notes:
            "The arithmetic is plain division and modulo under the hood: for a (r, c) grid in C order, flat = row * c + col; row = flat // c; col = flat % c. Knowing the formula by heart is optional; calling the function is faster than re-deriving it.",
        },
        {
          kind: "functionDoc",
          name: "np.ravel_multi_index",
          purpose: "Convert grid coordinates into flat (row-major) positions — the inverse of np.unravel_index, and the function to call when an API wants 'positions in the flat block'.",
          signature: "np.ravel_multi_index(multi_index, dims, mode='raise', order='C')",
          purposeDetail:
            "Some tools speak coordinates and some speak flat positions; ravel_multi_index is the phrasebook from the first dialect to the second. Feed it a tuple of per-axis index arrays and the shape, and it returns the flat position of every coordinate pair at once. Its party trick is the mode parameter: by default out-of-range coordinates raise, but mode='clip' clamps each axis and mode='wrap' wraps it — handy when translating neighbor offsets in a grid (signal processing, game boards) where going off one edge should wrap to the other.",
          params: [
            {
              name: "multi_index",
              type: "tuple of array_like of int",
              required: true,
              description: "One index array per axis, in axis order — the same 'tuple of arrays' shape np.where and np.unravel_index return.",
              example: "([0, 1, 2], [2, 2, 2])",
            },
            {
              name: "dims",
              type: "tuple of ints",
              required: true,
              description: "The shape the coordinates belong to. Axis k of multi_index must respect dims[k] (or hit the mode policy).",
              example: "(3, 4)",
            },
            {
              name: "mode",
              type: "\"raise\", \"clip\", or \"wrap\"",
              required: false,
              description: "What to do with out-of-range coordinates: \"raise\" (default) errors, \"clip\" clamps to each axis's ends, \"wrap\" wraps around the axis (torus math).",
              example: "mode=\"wrap\"",
            },
            {
              name: "order",
              type: "\"C\" or \"F\"",
              required: false,
              description: "Flat counting direction: row-major (default) or column-major — must match whatever tool consumes your flat positions.",
              example: "order=\"C\"",
            },
          ],
          returns: {
            type: "ndarray of int",
            description: "One flat position per input coordinate — shape like each input index array, not a tuple: the flat world has a single axis.",
          },
          example: `import numpy as np

flat = np.ravel_multi_index(([0, 1, 2], [2, 2, 2]), (3, 4))
print("coordinates -> flat:", flat)

rows, cols = np.unravel_index([2, 6, 10], (3, 4))
back = np.ravel_multi_index((rows, cols), (3, 4))
print("round trip holds:", np.array_equal(back, [2, 6, 10]))
`,
          exampleOutput: `coordinates -> flat: [ 2  6 10]
round trip holds: True`,
          commonMistakes: [
            {
              mistake: "Passing a single flat number instead of a tuple of coordinate arrays.",
              why: "The FIRST argument is the multi-index tuple — np.ravel_multi_index(7, (3, 4)) raises, because 7 is not a per-axis sequence.",
              fix: "Always hand it a tuple with one entry per axis: np.ravel_multi_index(([1], [3]), (3, 4)) -> [7].",
            },
            {
              mistake: "Forgetting it returns an ARRAY, not a tuple.",
              why: "It is the mirror image of unravel_index: flat out is one array. Unpacking 'rows, cols = np.ravel_multi_index(...)' fails or silently splits one array.",
              fix: "flat = np.ravel_multi_index((rows, cols), shape) — single name, single array.",
            },
            {
              mistake: "Assuming out-of-range coordinates are silently clamped.",
              why: "The default mode is 'raise': ValueError: invalid entry in coordinates array — surprising if you expected slice-like clamping.",
              fix: "Choose the policy explicitly: mode='clip' for clamping, mode='wrap' for grid-wraparound, or fix the coordinates.",
            },
          ],
          related: [
            { name: "np.unravel_index", relation: "The inverse: flat positions in, coordinate tuples out." },
            { name: "np.flatnonzero", relation: "Produces flat places directly from a mask — often you never need coordinates at all." },
            { name: "np.take / np.put", relation: "Consumers of flat positions: gather and scatter by flat place (Lesson d-06)." },
            { name: "ndarray.ravel", relation: "Flattens data; ravel_multi_index flattens a coordinate NUMBER." },
          ],
          applications: [
            "Computing flat keys for hash tables or lookup arrays built from (row, col) pairs — a sparse-data classic",
            "Wrapping neighbor offsets on a grid: mode='wrap' turns 'past the right edge' into 'left edge' in one call",
            "Verifying index math in tests: assert ravel_multi_index(unravel_index(x)) round-trips to x",
          ],
          notes:
            "Clip and wrap modes operate per axis, so a coordinate can clip on axis 0 while wrapping on axis 1 if you pass a tuple of modes — one policy per axis. Rarely needed, deeply handy the day you need it.",
        },
        {
          kind: "arrayViz",
          title: "The fancy tour — places in your order",
          mode: "slice",
          name: "a",
          caption:
            "The 3x4 grid from this lesson. Each chip is a fancy selection; the lit cells are the places it visits, in visit order (top-left of the lit sequence is gathered first). Walk them in order and predict each result before clicking: rows in your order, a row twice, the coordinate zip, scattered places, and the ix_ cross product.",
          data: [
            [10, 11, 12, 13],
            [20, 21, 22, 23],
            [30, 31, 32, 33],
          ],
          selections: [
            {
              expr: "a[[2, 0]]",
              cells: [[2, 0], [2, 1], [2, 2], [2, 3], [0, 0], [0, 1], [0, 2], [0, 3]],
              note: "Rows in YOUR order: row 2 gathers first, so the result starts 30, 31, 32, 33.",
            },
            {
              expr: "a[[0, 2, 2]]",
              cells: [[0, 0], [0, 1], [0, 2], [0, 3], [2, 0], [2, 1], [2, 2], [2, 3], [2, 0], [2, 1], [2, 2], [2, 3]],
              note: "Row 2 twice: three entries in the list, three rows out — 12 cells gathered.",
            },
            {
              expr: "a[[0, 1], [2, 2]]",
              cells: [[0, 2], [1, 2]],
              note: "The zip: exactly two cells, the pairs (0, 2) and (1, 2). NOT a 2x2 block — the number-one surprise.",
            },
            {
              expr: "a[[0, 2, 1], [1, 1, 3]]",
              cells: [[0, 1], [2, 1], [1, 3]],
              note: "Scattered places, visited in your order: 11 first, then 31, then 23.",
            },
            {
              expr: "a[np.ix_([0, 2], [1, 3])]",
              cells: [[0, 1], [0, 3], [2, 1], [2, 3]],
              note: "The cross product: every row pick meets every column pick — a genuine 2x2 block.",
            },
          ],
        },
        {
          kind: "tryIt",
          title: "Predict before you print",
          task: "Run this, then: (1) before each print, say the result out loud — length, order, values; (2) add a line gathering a[[-2, -2], [0, 3]] and predict whether it has two cells or four; (3) rebuild the same result as the previous line but as a BLOCK, using np.ix_ with negative indexes.",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print("1:", a[[1, 1, 0]])            # rows 1, 1, 0
print("2:", a[[2, 0], [1, 3]])       # zipped pairs
print("3:", a[np.ix_([2, 0], [1, 3])])   # crossed block
picked = a[[0, -1]]
picked[0, 0] = -1
print("4: a[0, 0] after writing into the pick:", a[0, 0])
`,
          hint: "1 is three rows (the middle one twice). 2 is TWO cells: (2, 1) and (0, 3) — values 31 and 13. 3 is the 2x2 block [[31 33] [11 13]]. 4 stays 10: fancy picks are copies, so the write went nowhere near a.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "A list of places per axis: your order, your duplicates, your length — the result is always a fresh COPY. Two lists (or masks) ZIP into coordinate pairs, not a block; np.ix_ builds the block. Assignment through fancy lists writes the original, values broadcast to the selection, and when the same place is written twice, the last write wins.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where this is going",
          text: "You now hold every selection route: positions, runs, questions, and places. Lesson d-06 rounds out the part with the specialist tools built on today's ideas — np.take and np.put (fancy indexing's fast paths, speaking flat places), np.choose and np.select (vectorized branching) — then runs them all together in one data-surgery pass on a sensor grid, and the part's mini project hands you a whole night shift to repair.",
        },
      ],
      terms: [
        { term: "Fancy indexing", definition: "Indexing with lists or arrays of places: each axis can carry one, and the result has one element per list entry — your order, your duplicates, always a fresh copy." },
        { term: "Coordinate pairing (the zip rule)", definition: "When several axes carry lists or masks, they are walked together entry by entry: a[[0, 1], [2, 2]] is the two pairs (0, 2) and (1, 2) — never a block." },
        { term: "np.ix_", definition: "The cross-product helper: converts one list per axis into an open mesh so every row pick meets every column pick — the rectangle the zip rule refuses to give you." },
        { term: "Last-write-wins", definition: "Fancy assignment with duplicate places writes them in order and keeps the final value: b[[0, 0]] = [10, 20] leaves 20 in cell 0." },
        { term: "Flat position", definition: "An element's index in the underlying row-major line of values (0 to size-1); np.unravel_index converts it to grid coordinates, np.ravel_multi_index converts back." },
      ],
      mistakes: [
        {
          mistake: "Expecting a[[0, 1], [2, 2]] to return a 2x2 block.",
          why: "Paired index lists zip into coordinate pairs, so you get two values, not four — the number-one fancy-indexing surprise, verified in this lesson.",
          fix: "Want pairs, pass bare lists. Want the block, wrap the lists in np.ix_: a[np.ix_([0, 1], [2, 2])] gives all four cells.",
        },
        {
          mistake: "Writing into a fancy selection and expecting the original to change (or vice versa).",
          why: "READING with fancy indexes gathers a copy — picked[0, 0] = 9999 never touched a. But ASSIGNING a[places] = values writes the original. Same brackets, opposite direction, both verified above.",
          fix: "Direction decides: reads copy, writes land. If you need a writable extraction, you cannot have one — gather a copy and write it back through fancy assignment instead.",
        },
        {
          mistake: "Expecting duplicate places in an assignment to accumulate, or the first value to win.",
          why: "b[[0, 0]] = [10, 20] writes 10 then 20 into the same cell; the array holds 20. NumPy defines no accumulation for fancy assignment.",
          fix: "One cell can hold one value. If both must land, give them different places — and if you see mysteriously 'lost' values, check your index list for accidental duplicates.",
        },
        {
          mistake: "Expecting fancy indexes to clamp out-of-range places the way slices do.",
          why: "Slices clamp; lists of places raise: a[[0, 5]] on a 3-row array dies with IndexError: index 5 is out of bounds for axis 0 with size 3. A list names specific places, and a nonexistent place is an error, not an empty range.",
          fix: "Validate computed index lists before use (np.clip or a mask filter), or catch the IndexError deliberately — Lesson d-06's take/put tools offer explicit clip and wrap policies for exactly this.",
        },
      ],
      takeaways: [
        "Fancy indexing gathers places in your order, duplicates kept: the result's length is your list's length, per axis carrying a list.",
        "Two lists (or masks) in one bracket pair ZIP into coordinates — a[[0, 1], [2, 2]] is two cells. np.ix_ builds the row-x-column cross product instead.",
        "Masks act as the list of their True positions, so a boolean on one axis pairs with a list on another (same length required).",
        "Fancy reads always copy (np.shares_memory says False); fancy assignment writes the original, with values broadcasting to the gathered cells.",
        "Duplicate places in an assignment follow last-write-wins: b[[0, 0]] = [10, 20] leaves 20. And flat positions translate to grid coordinates with np.unravel_index, and back, with np.ravel_multi_index.",
      ],
      quiz: [
        {
          id: "d-05-q1",
          prompt: "`a` is 3x4. What does `a[[0, 1], [2, 2]]` return?",
          options: [
            { text: "A 1-D array of two values: the cells (0, 2) and (1, 2)", correct: true, feedback: "Right: the lists zip into coordinate pairs — one result entry per pair, never a product." },
            { text: "A 2x2 block: rows 0-1 times columns 2-2", correct: false, feedback: "That is the cross product — what np.ix_([0, 1], [2, 2]) builds. Bare lists pair up instead." },
            { text: "Column 2 as a (3,) array, like a[:, 2]", correct: false, feedback: "The column slice would need a[:, 2] — the lists you wrote name exactly two cells, not a whole column." },
            { text: "An error: the two lists contain a duplicate", correct: false, feedback: "Duplicates are perfectly legal in fancy indexes — on the read side they just gather the same cell twice." },
          ],
          explanation: "Paired lists are coordinates: (0, 2) and (1, 2) — two values. Blocks need np.ix_.",
        },
        {
          id: "d-05-q2",
          prompt: "After `picked = a[[0, 2]]` and `picked[0, 0] = 9999`, what is `a[0, 0]`?",
          options: [
            { text: "Unchanged — fancy indexing gathered a copy, so the write stayed in the copy", correct: true, feedback: "Correct: shares_memory(a, picked) is False. Contrast a[0:2], a view, where this write WOULD travel." },
            { text: "9999 — indexes write through to the parent array", correct: false, feedback: "That is true of VIEWS (basic indexing). Fancy indexing always allocates a fresh block for the gathered values." },
            { text: "An error: you cannot write into a fancy result", correct: false, feedback: "You can — the copy is a normal writable array. The write just does not reach the original." },
            { text: "9999 only if a is writeable", correct: false, feedback: "The writeable flag is not the issue: the copy is writable, and the copy is all that changed." },
          ],
          explanation: "Fancy reads copy. Writes travel only through views — and fancy assignment (a[places] = v) is the write side of the story.",
        },
        {
          id: "d-05-q3",
          prompt: "`b = np.zeros(3, dtype=int)`; then `b[[0, 0]] = [10, 20]`. What is `b[0]`?",
          options: [
            { text: "20 — the writes happen in order and the last one wins", correct: true, feedback: "Exactly: cell 0 received 10, then 20. One cell holds one value; the final write is the one that sticks." },
            { text: "10 — the first write locks the cell", correct: false, feedback: "Nothing locks: NumPy performs both writes in list order, and later writes simply overwrite earlier ones." },
            { text: "30 — the values accumulate", correct: false, feedback: "Assignment is replacement, not accumulation. b[[0]] += [30] would be the accumulate-shaped idiom (and a different expression)." },
            { text: "It raises an error: duplicate places in an assignment", correct: false, feedback: "Duplicates are legal on both sides — on writes they define a deterministic last-write-wins order, verified in this lesson." },
          ],
          explanation: "Duplicate places in fancy assignment: last write wins — b[0] is 20.",
        },
      ],
    },

    // ------------------------------------------------------------- d-06
    {
      slug: "d-06",
      title: "The Specialist Toolkit: take, put, choose, select",
      minutes: 20,
      summary:
        "Four tools the pros reach for: np.take and np.put are fancy indexing's fast paths — gather and scatter by FLAT place, with explicit clip/wrap/raise policies — while np.choose and np.select are vectorized branching, an index array picking among candidates and the if/elif/else of the array world. Then all of Part D in one pass: data surgery on a broken sensor grid.",
      kind: "concept",
      objectives: [
        "Gather with np.take (any axis, negatives allowed) and state when it is the better spelling of fancy indexing",
        "Predict all three out-of-bounds policies — raise, clip, wrap — for take and put, and read the exact IndexError the default raises",
        "Scatter values into an array in place with np.put, using flat places from np.flatnonzero, and explain last-write-wins there",
        "Build element-picked arrays with np.choose (index array over candidate arrays) and multi-branch arrays with np.select (first match wins, default for no match)",
        "Explain why np.diagonal's result refuses writes (the read-only view from Lesson d-03)",
        "Run a complete repair pass on a sensor grid: detect with masks, locate with flatnonzero and unravel_index, write with put, rebuild with fancy row assignment, label with select, reindex with take",
      ],
      why: "Everything in this lesson is a specialized spelling of something you already know — but each specialization buys something the general tool cannot give. np.take and np.put speak FLAT places, so they pair perfectly with np.flatnonzero from the mask world: 'find the bad cells, write the repairs' becomes two calls with no coordinate bookkeeping. Their mode parameter makes out-of-bounds behavior an explicit POLICY (raise, clip, or wrap) instead of a surprise. np.choose and np.select close the gap masks leave open: a mask answers yes/no, but real logic needs 'pick among three candidates' and 'if/elif/else' — and a Python if statement cannot loop over a million cells for you. The lesson ends by wiring every tool from Part D into one honest repair pass on a sensor grid that has both a spike and a dead sensor, because the point of a toolkit is using it together.",
      blocks: [
        {
          kind: "text",
          text: "Part D taught you the general routes into an array: positions, runs, questions, places. This closing lesson hands you the four specialists built on top of those routes. **np.take** and **np.put** are fancy indexing's industrial spelling — gather and scatter by flat place, with an explicit out-of-bounds policy. **np.choose** and **np.select** are the branching tools: vectorized 'pick among candidates' and vectorized 'if/elif/else'. None of them can do anything theoretically new; all of them say what they mean more directly than the general syntax, which is exactly why working code is full of them.",
        },
        {
          kind: "heading",
          text: "np.take: fancy indexing's fast path",
        },
        {
          kind: "text",
          text: "Lesson d-05 gathered places with `one[[3, 0, 3]]`. **np.take** does the same job with the places as a plain argument — `np.take(one, [3, 0, 3])` — and it exists for three practical reasons: it states 'gather along ONE axis' without any bracket-pairing questions, it accepts an `axis` argument that loops and helper functions can pass through, and it is the interface NumPy's own machinery uses for gathers. Same result, different spelling:",
        },
        {
          kind: "code",
          title: "The same gather, spelled two ways",
          code: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

print("np.take(one, [3, 0, 3]):", np.take(one, [3, 0, 3]))
print("one[[3, 0, 3]]          :", one[[3, 0, 3]])
print("identical results       :", np.array_equal(np.take(one, [3, 0, 3]), one[[3, 0, 3]]))
print("negatives allowed       :", np.take(one, [-1, -3]))

grid = np.arange(12).reshape(3, 4)
print("np.take(grid, [1, 0], axis=1) -- column 1 then column 0:")
print(np.take(grid, [1, 0], axis=1))
`,
          output: `np.take(one, [3, 0, 3]): [12  3 12]
one[[3, 0, 3]]          : [12  3 12]
identical results       : True
negatives allowed       : [15  9]
np.take(grid, [1, 0], axis=1) -- column 1 then column 0:
[[1 0]
 [5 4]
 [9 8]]`,
          outputNote: "The two spellings agree exactly. take's axis=1 pulled columns 1 and 0 (in that order) out of every row — a gather along one named axis.",
          explain: [
            "`np.take(one, [3, 0, 3])` and `one[[3, 0, 3]]` are the same operation; the first names the axis explicitly and reads as a function call.",
            "`np.take(one, [-1, -3])` — negative places work, exactly like fancy lists.",
            "`np.take(grid, [1, 0], axis=1)` gathered along axis 1 only: every row contributed its column 1 then column 0. Result shape (3, 2) — your order, per row.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.take",
          purpose: "Gather elements along one axis by a list of places — fancy indexing's function spelling, with a per-call out-of-bounds policy.",
          signature: "np.take(a, indices, axis=None, out=None, mode='raise')",
          purposeDetail:
            "take is the gather you already know from Lesson d-05, distilled: one array, one axis, one list of places. Reach for it when the axis is computed rather than typed (helper functions, loops over dimensions), when you want the out-of-bounds policy to be visible in the call (mode='clip' is a documented promise, while a raw fancy index just crashes), or when a codebase convention favors it. With axis=None (the default) it works on the FLATTENED array — which quietly makes it the natural partner of flat places from np.flatnonzero.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array to gather from. Not modified — take builds a new array (or writes into out).",
              example: "one",
            },
            {
              name: "indices",
              type: "array_like of int",
              required: true,
              description: "The places to gather, in your order — duplicates and negatives allowed, exactly like a fancy index list.",
              example: "[3, 0, 3]",
            },
            {
              name: "axis",
              type: "int or None",
              required: false,
              description: "The axis to gather along. None (default) gathers from the array as if it were flattened — the flat-places mode that pairs with np.flatnonzero.",
              example: "axis=1",
            },
            {
              name: "out",
              type: "ndarray or None",
              required: false,
              description: "An existing array to write the result into, instead of allocating a new one — Part J's performance playbook uses this to stop re-allocating in loops.",
              example: "out=buffer",
            },
            {
              name: "mode",
              type: "\"raise\", \"clip\", or \"wrap\"",
              required: false,
              description: "Policy for out-of-range places: \"raise\" (default) raises IndexError; \"clip\" clamps to the axis's ends; \"wrap\" wraps around the axis.",
              example: "mode=\"clip\"",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array shaped like the source with the gathered axis replaced by indices' shape (or the flat shape when axis is None). It is a copy — take never returns a view.",
          },
          example: `import numpy as np

one = np.array([3, 6, 9, 12, 15])
print(np.take(one, [3, 0, 3]))
print(np.take(one, [-1, -3]))

grid = np.arange(12).reshape(3, 4)
print(np.take(grid, [1, 0], axis=1))
`,
          exampleOutput: `[12  3 12]
[15  9]
[[1 0]
 [5 4]
 [9 8]]`,
          commonMistakes: [
            {
              mistake: "Forgetting axis=None flattens first.",
              why: "np.take(grid, [5]) with no axis gathers flat place 5 of the WHOLE block — a different cell than grid[5], which is row 5 and would crash on a 3-row grid.",
              fix: "Say the axis out loud when you mean a specific one: axis=0 for rows, axis=1 for columns. Omit it only when you really mean the flat line.",
            },
            {
              mistake: "Expecting take to return a view you can write through.",
              why: "take gathers into a fresh array — it is the copy side of the fancy-indexing story from Lesson d-05. Writing into the result changes nothing else.",
              fix: "To WRITE at places, use the sibling: np.put (or fancy assignment a[places] = values), which edits the original in place.",
            },
            {
              mistake: "Being surprised by the IndexError when a place is out of range.",
              why: "The default mode is 'raise': IndexError: index 99 is out of bounds for axis 0 with size 10 — deliberate, loud, and documented in the call.",
              fix: "If clamping is the behavior you want, ask for it: mode='clip'. If wraparound is, mode='wrap'. The next block demonstrates all three.",
            },
          ],
          related: [
            { name: "np.put", relation: "The write-side sibling: scatters values into the FLAT line of an array, in place." },
            { name: "fancy indexing", relation: "The general mechanism — a[[places]] — same result, different spelling (Lesson d-05)." },
            { name: "np.compress", relation: "Gathers by a boolean mask instead of by places — the question-route sibling." },
            { name: "np.take_along_axis", relation: "The 2-D-plus variant for gathering with paired index arrays — it meets Part H's argmax workflows." },
          ],
          applications: [
            "Resampling: np.take(signal, [0, 10, 20, 30]) — every tenth sample, no interpolation",
            "Reordering tables by a computed row order — this lesson's closing surgery does it with axis=0",
            "Shuffle-free sampling with explicit clamping: mode='clip' keeps computed places inside the data",
          ],
          notes:
            "Take is the spelling NumPy's own documentation uses when the indices live in a variable rather than in brackets, and the out= parameter is how inner loops avoid allocation. Performance-wise it and fancy indexing are in the same family; prefer whichever reads better at your call site.",
        },
        {
          kind: "heading",
          text: "Out of bounds: raise, clip, or wrap — you choose",
        },
        {
          kind: "text",
          text: "Fancy lists crash on out-of-range places, full stop. **take** and **put** make the policy an explicit parameter instead: `mode=\"raise\"` (the default — crash loudly), `mode=\"clip\"` (clamp to the nearest edge), or `mode=\"wrap\"` (treat the axis as a loop). Same place, three behaviors, all visible in one comparison:",
        },
        {
          kind: "code",
          title: "One out-of-range place, three policies",
          code: `import numpy as np

flat = np.arange(10)                     # valid places: 0 through 9

print("mode='clip': place 12 ->", np.take(flat, 12, mode="clip"), " (clamped to 9)")
print("mode='wrap': place 12 ->", np.take(flat, 12, mode="wrap"), " (12 mod 10 = 2)")
`,
          output: `mode='clip': place 12 -> 9  (clamped to 9)
mode='wrap': place 12 -> 2  (12 mod 10 = 2)`,
          outputNote: "clip pulled the last element; wrap pulled element 2. The default mode is 'raise' — the next block shows the exact crash it produces.",
          explain: [
            "`mode=\"clip\"` clamped place 12 to the last valid place, 9 — 'as close as exists'.",
            "`mode=\"wrap\"` treated the array as a loop: 12 wraps to 12 - 10 = 2.",
            "Choosing the policy explicitly is documentation: whoever reads the call knows out-of-range was considered, not forgotten.",
          ],
        },
        {
          kind: "code",
          title: "The default policy: raise",
          code: `import numpy as np

flat = np.arange(10)                     # valid places: 0 through 9

print(np.take(flat, [99]))
`,
          expectError: "IndexError: index 99 is out of bounds for axis 0 with size 10",
          outputNote: "The loud default. Compare Lesson d-02: slices clamp silently, integer indexes raise, fancy lists raise — take lets you CHANGE that, but only by saying so.",
        },
        {
          kind: "heading",
          text: "np.flatnonzero: a mask's flat places",
        },
        {
          kind: "text",
          text: "Lesson d-04 counted a mask's True cells with `np.count_nonzero`; **np.flatnonzero** goes one step further and returns their POSITIONS — as flat, row-major places (it is the one-argument `np.where` in flat form; Part E tells that full story). Flat places are exactly the currency take and put spend, which is why this trio closes the loop between masks and gathers:",
        },
        {
          kind: "code",
          title: "From question to places to values",
          code: `import numpy as np

g = np.array([[0, 5, 0],
              [7, 0, 0],
              [0, 0, 9]])

places = np.flatnonzero(g)               # where are the non-zeros? FLAT places
print("flat places of the non-zeros:", places)

rows, cols = np.unravel_index(places, g.shape)   # Lesson d-05: to coordinates
print("rows:", rows, "cols:", cols)

print("gathered back with take:", np.take(g, places))
`,
          output: `flat places of the non-zeros: [1 3 8]
rows: [0 1 2] cols: [1 0 2]
gathered back with take: [5 7 9]`,
          outputNote: "The three non-zeros sit at flat places 1, 3 and 8 — row-major counting — which unravel_index decodes as (0,1), (1,0), (2,2).",
          explain: [
            "`np.flatnonzero(g)` returned [1, 3, 8]: place 1 is row 0 col 1, place 3 is row 1 col 0, place 8 is row 2 col 2 — reading order, as always.",
            "`np.unravel_index` translated the flat places into coordinate arrays, ready for humans or for paired fancy indexing.",
            "`np.take(g, places)` with no axis gathered the flat places straight from the flattened block — the same values `g[rows, cols]` would give you.",
          ],
        },
        {
          kind: "heading",
          text: "np.put: write values at flat places, in place",
        },
        {
          kind: "text",
          text: "**np.put** is take's mirror: it WRITES values at flat places, directly into the original array — and returns None, because there is no new array to hand back. Places and values pair up in order, extras repeat cyclically (a quirk worth knowing), and duplicate places follow **last-write-wins**, exactly like fancy assignment in Lesson d-05:",
        },
        {
          kind: "code",
          title: "Scatter writes, and the None return",
          code: `import numpy as np

p = np.zeros(5, dtype=int)
np.put(p, [0, 3, 3], [7, 8, 9])          # place 3 written twice: 8 then 9
print("p after np.put(p, [0, 3, 3], [7, 8, 9]):", p)

print("put's return value:", np.put(p, [1], [5]), " -- it edits in place")
print("p now:", p)

q = np.zeros(5, dtype=int)
np.put(q, [0, 3, 3], [7, 8, 9], mode="clip")   # same, with the policy visible
print("q (same put, mode='clip'):", q)
`,
          output: `p after np.put(p, [0, 3, 3], [7, 8, 9]): [7 0 0 9 0]
put's return value: None  -- it edits in place
p now: [7 5 0 9 0]
q (same put, mode='clip'): [7 0 0 9 0]`,
          outputNote: "p holds 9 at place 3 — last write wins. The put call printed None, and p changed anyway: in place means the argument IS the result.",
          explain: [
            "`np.put(p, [0, 3, 3], [7, 8, 9])` wrote 7 at place 0, then 8 and 9 at place 3 — 9 survived. Same rule as `b[[0, 0]] = [10, 20]` in Lesson d-05.",
            "`np.put(...)` returns None. If you catch yourself writing `p = np.put(...)`, you have just thrown the array away — the write already happened to the original.",
            "mode works here too: 'raise' (default), 'clip', 'wrap' — same three policies as take, same parameter name.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.put",
          purpose: "Scatter values into an array at flat (row-major) places, in place — the write-side partner of np.take and the natural sink for np.flatnonzero's output.",
          signature: "np.put(a, ind, v, mode='raise')",
          purposeDetail:
            "When the places you hold are flat — from flatnonzero, from a file, from unravel_index's inverse — put writes through them without converting to coordinates first. It is strict about its contract: the target is edited in place (the return is None), places are FLAT positions in the row-major line, and values shorter than places repeat cyclically while extra values are ignored. Its mode parameter gives out-of-range places an explicit policy. Reach for it in repair-and-patch workflows: find the bad cells with a mask, translate to flat places, write the fixes with one put.",
          params: [
            {
              name: "a",
              type: "ndarray",
              required: true,
              description: "The target array, edited IN PLACE. Its flat (row-major) line is what the places address.",
              example: "repaired",
            },
            {
              name: "ind",
              type: "array_like of int",
              required: true,
              description: "The flat places to write, in order. Duplicates follow last-write-wins; out-of-range hits the mode policy.",
              example: "[0, 3, 3]",
            },
            {
              name: "v",
              type: "array_like",
              required: true,
              description: "The values to write, paired with ind in order. If shorter than ind it repeats cyclically; if longer, extras are ignored.",
              example: "[7, 8, 9]",
            },
            {
              name: "mode",
              type: "\"raise\", \"clip\", or \"wrap\"",
              required: false,
              description: "Policy for out-of-range places: \"raise\" (default) IndexError; \"clip\" clamps to the ends; \"wrap\" wraps around the flat line.",
              example: "mode=\"clip\"",
            },
          ],
          returns: {
            type: "None",
            description: "Nothing — put edits its first argument in place. Assigning its result (x = np.put(...)) would store None and lose nothing but your intent.",
          },
          example: `import numpy as np

p = np.zeros(5, dtype=int)
np.put(p, [0, 3, 3], [7, 8, 9])
print(p)

q = np.zeros(5, dtype=int)
np.put(q, [4, 99], [7, 8], mode="clip")
print(q)
`,
          exampleOutput: `[7 0 0 9 0]
[0 0 0 0 8]`,
          commonMistakes: [
            {
              mistake: "Writing result = np.put(a, places, values) and using result afterwards.",
              why: "put returns None — the edit already landed in a. Using result gives you NoneType errors, or worse, code that silently 'works' because you also read a.",
              fix: "Call it bare, like a statement: np.put(a, places, values). The array you passed IS the result.",
            },
            {
              mistake: "Passing (row, col) coordinate arrays to put.",
              why: "put speaks FLAT places only — a (rows, cols) pair would be written as two separate flat numbers, corrupting unexpected cells.",
              fix: "Convert first with np.ravel_multi_index((rows, cols), shape) — or keep coordinates and use fancy assignment a[rows, cols] = values instead.",
            },
            {
              mistake: "Assuming put built a new array and left the original untouched.",
              why: "put is in-place by design. If you scattered into raw data by accident, the original is already changed — no copy to save you.",
              fix: "Copy at the boundary first (repaired = raw.copy(), Lesson d-03's firewall), then put into the copy. The surgery run below does exactly this.",
            },
          ],
          related: [
            { name: "np.take", relation: "The read-side sibling: gathers from the flat line into a new array." },
            { name: "np.flatnonzero", relation: "The usual producer of the places: flat positions of a mask's True cells." },
            { name: "np.place", relation: "A mask-driven cousin that writes where a CONDITION holds — no places needed." },
            { name: "fancy assignment", relation: "a[rows, cols] = values — the coordinate-speaking alternative when you have grids, not flats." },
          ],
          applications: [
            "Patch pipelines: flatnonzero the bad cells, put the repaired values — the closing surgery of this lesson",
            "Sparse writes from external tools that hand you flat offsets (binary file layouts, hash-into-array tricks)",
            "Bucket scatter: compute flat places for a category and write category codes into a lookup grid",
          ],
          notes:
            "The cyclic value repetition is a real footgun: np.put(a, [0, 1, 2], [5]) writes 5 everywhere (fine), but np.put(a, [0, 1], [5, 6, 7]) silently ignores the 7. Make the pairing explicit in your head: values repeat, they never truncate the place list.",
        },
        {
          kind: "code",
          title: "The put default: raise, loudly",
          code: `import numpy as np

p = np.zeros(5, dtype=int)               # valid flat places: 0 through 4

np.put(p, [7], [1])
`,
          expectError: "IndexError: index 7 is out of bounds for axis 0 with size 5",
          outputNote: "Place 7 does not exist in a 5-element line. mode='clip' would land it at place 4 — but only if you say so.",
        },
        {
          kind: "heading",
          text: "One view that refuses writes: np.diagonal",
        },
        {
          kind: "text",
          text: "A promise kept from Lesson d-03: `np.diagonal` extracts the main diagonal as a VIEW — and that view arrives **read-only**, flagged exactly like the locked views you met there. NumPy refuses diagonal writes because writing through a diagonal view has ambiguities it will not guess around. The gather-and-write tools of this lesson give you the safe route: read the diagonal however you like, but write through places that name whole cells:",
        },
        {
          kind: "code",
          title: "Reading is fine; writing is refused",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

d = a.diagonal()
print("the diagonal:", d)
print("its writeable flag:", d.flags.writeable)
print("the fancy-index spelling:", a[[0, 1, 2], [0, 1, 2]], "-- a writable COPY")
`,
          output: `the diagonal: [10 21 32]
its writeable flag: False
the fancy-index spelling: [10 21 32] -- a writable COPY`,
          outputNote: "Both spellings read [10 21 32]. The diagonal view is flagged read-only; the fancy-index gather from Lesson d-05 is a copy you may edit (edits land in the copy, not the parent).",
          explain: [
            "`a.diagonal()` returned the same values as the paired-list idiom `a[[0, 1, 2], [0, 1, 2]]` — but as a read-only view, not a copy.",
            "This is flags.writeable = False arriving from NumPy itself — the same lock you applied by hand in Lesson d-03, set at the factory.",
            "If you try to write through the diagonal view, you get the exact ValueError from d-03's lock demo — see for yourself in the next block.",
          ],
        },
        {
          kind: "code",
          title: "The blocked diagonal write",
          code: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

d = a.diagonal()
d[0] = 99
`,
          expectError: "ValueError: assignment destination is read-only",
          outputNote: "The same error the hand-locked view raised in Lesson d-03. To set a diagonal cell, write through the parent: a[0, 0] = 99.",
        },
        {
          kind: "heading",
          text: "np.choose: an index array picks among candidates",
        },
        {
          kind: "text",
          text: "Masks fork between two outcomes (Lesson d-04's np.where). **np.choose** forks among ANY number: you give it an index array and a list of candidate arrays, and each result cell takes the candidate its index names — element by element. The index array and the candidates must be broadcastable to a common shape (Part G names that rule; today, same-shape or scalars covers you). It is the vectorized 'menu choice':",
        },
        {
          kind: "code",
          title: "A menu of three, ordered per cell",
          code: `import numpy as np

pick = np.array([[0, 2],
                 [2, 1]])
print("the picker:")
print(pick)
print("np.choose(pick, [10, 20, 30]) -- candidate 0, 2, 2, 1 per cell:")
print(np.choose(pick, [10, 20, 30]))

red   = np.array([10, 11, 12])
green = np.array([20, 21, 22])
blue  = np.array([30, 31, 32])
which = np.array([0, 2, 1])              # cell 0 wants red, 1 wants blue, 2 wants green
print("per-cell candidate arrays:", np.choose(which, [red, green, blue]))
`,
          output: `the picker:
[[0 2]
 [2 1]]
np.choose(pick, [10, 20, 30]) -- candidate 0, 2, 2, 1 per cell:
[[10 30]
 [30 20]]
per-cell candidate arrays: [10 31 22]`,
          outputNote: "Cell [0, 0] asked for candidate 0 (10); cell [1, 0] asked for 2 (30). And the 3-cell pick took red[0], blue[1], green[2] — 10, 31, 22.",
          explain: [
            "`np.choose(pick, [10, 20, 30])` — every cell of pick named a candidate: 0 means 10, 1 means 20, 2 means 30. Scalars broadcast to every cell.",
            "`np.choose(which, [red, green, blue])` — the candidates can be arrays: cell k of the result comes from the candidate which[k] names, at position k. which is [0, 2, 1], so: red[0]=10, blue[1]=31, green[2]=22.",
            "Shape rule of thumb: the picker and every candidate must agree (after broadcasting) — a (2,) picker with (3,) candidates is the classic crash, as the block below shows.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.choose",
          purpose: "Build an array where each element is picked from one of several candidate arrays, named per-cell by an index array — the vectorized menu choice.",
          signature: "np.choose(a, choices, out=None, mode='raise')",
          purposeDetail:
            "where (Lesson d-04) is a two-way fork; choose is the N-way one. The first argument is an index array; the second is a sequence of candidate arrays; the result takes, at each position, the element of the candidate that the index names there. It shines for per-cell remapping — palette lookups, per-group constants, decision tables — anywhere a lookup TABLE would be used in scalar code. The learning curve is the broadcasting requirement: index and candidates must share a shape (scalars broadcast), and indexes must name existing candidates unless mode relaxes that.",
          params: [
            {
              name: "a",
              type: "array_like of int",
              required: true,
              description: "The index array: each element names which candidate (0 to len(choices)-1) feeds that cell of the result.",
              example: "np.array([0, 2, 1])",
            },
            {
              name: "choices",
              type: "sequence of array_like",
              required: true,
              description: "The candidates, in order. Each must broadcast against a's shape — scalars and same-shape arrays are the everyday cases.",
              example: "[red, green, blue]",
            },
            {
              name: "out",
              type: "ndarray or None",
              required: false,
              description: "An existing array to write the picks into instead of allocating — the no-new-memory option for hot loops.",
              example: "out=buffer",
            },
            {
              name: "mode",
              type: "\"raise\", \"clip\", or \"wrap\"",
              required: false,
              description: "Policy for indexes outside 0..len(choices)-1: \"raise\" (default) errors; \"clip\" takes the nearest candidate; \"wrap\" takes indexes modulo the candidate count.",
              example: "mode=\"clip\"",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array shaped like the broadcast combination of a and the choices, each cell taken from its named candidate.",
          },
          example: `import numpy as np

pick = np.array([[0, 2], [2, 1]])
print(np.choose(pick, [10, 20, 30]))

red   = np.array([10, 11, 12])
green = np.array([20, 21, 22])
blue  = np.array([30, 31, 32])
print(np.choose(np.array([0, 2, 1]), [red, green, blue]))
`,
          exampleOutput: `[[10 30]
 [30 20]]
[10 31 22]`,
          commonMistakes: [
            {
              mistake: "Expecting choose to pick whole ROWS or arrays rather than per-cell elements.",
              why: "It walks cell by cell: at position k it takes candidate a[k]'s element at position k. It never returns one of the candidates whole.",
              fix: "To select whole arrays by an index, plain fancy indexing does it: stack = np.array([red, green, blue]); stack[1] is green.",
            },
            {
              mistake: "Mixing shapes: a (3,) index with (2,) candidates.",
              why: "Index and candidates must broadcast to one shape; a (3,) against (2,) raises ValueError: shape mismatch — the message names both shapes.",
              fix: "Match lengths (or use scalar candidates, which broadcast everywhere). Reshape on purpose when you need the 2-D patterns from the docs' examples.",
            },
            {
              mistake: "An index value equal to the number of candidates (or negative).",
              why: "Valid candidate numbers are 0..len(choices)-1. Asking for candidate 5 of three raises ValueError: invalid entry in choice array — the default mode is strict.",
              fix: "Fix the index, or declare a policy: mode='clip' takes the last candidate, mode='wrap' wraps the number.",
            },
          ],
          related: [
            { name: "np.select", relation: "The condition-driven sibling: instead of indexes, a list of masks picks the branches — first match wins." },
            { name: "np.where", relation: "The two-way fork (Lesson d-04's card); choose is its N-way generalization." },
            { name: "fancy indexing", relation: "When the 'candidates' are one array's rows, a[[i, j]] picks whole rows — the other meaning of 'choose'." },
            { name: "np.take", relation: "Gathers along an axis by places — choose's simpler cousin when candidates are one array." },
          ],
          applications: [
            "Palette / lookup remaps: channel = np.choose(code, [red_band, green_band, blue_band])",
            "Per-group constants: rate = np.choose(tier, [0.5, 0.8, 1.0]) applied to a tier grid",
            "Building composite grids for simulations and games where each cell's rule differs by terrain code",
          ],
          notes:
            "The docs open with 'if confused or uncertain, definitely look at the Examples' — earned honesty. For more than a handful of candidates, or string-labeled logic, np.select or plain fancy indexing on a stacked array is usually easier to read six months later.",
        },
        {
          kind: "code",
          title: "Asking for a candidate that is not on the menu",
          code: `import numpy as np

# two candidates, but the second cell asks for candidate 5
choices = [np.array([10, 11]), np.array([20, 21])]

print(np.choose(np.array([0, 5]), choices))
`,
          expectError: "ValueError: invalid entry in choice array",
          outputNote: "Valid candidate numbers here are 0 and 1. mode='clip' would serve candidate 1 to the out-of-range cell — an explicit policy, not a silent one.",
        },
        {
          kind: "heading",
          text: "np.select: the vectorized if/elif/else",
        },
        {
          kind: "text",
          text: "The last specialist replaces the if/elif/else chain. **np.select** takes a list of conditions (masks, in the order you would write the branches) and a matching list of choices, walks the cells, and gives each cell the FIRST choice whose condition says True — with `default=` for cells no condition claims. Compare it with Lesson d-04's np.where: where handles two branches; select handles any number, and the branch ORDER is part of the meaning:",
        },
        {
          kind: "code",
          title: "Three branches and a default",
          code: `import numpy as np

temps = np.array([15.0, 21.5, 26.0, 31.0])

labels = np.select(
    [temps < 18, temps < 25, temps < 30],   # the if/elif ladder, top to bottom
    ["cold", "mild", "warm"],
    default="hot",
)
print("in order:", labels)

swapped = np.select(
    [temps < 30, temps < 18, temps < 25],   # same tests, WRONG order
    ["warm", "cold", "mild"],
    default="hot",
)
print("swapped:", swapped)
`,
          output: `in order: ['cold' 'mild' 'warm' 'hot']
swapped: ['warm' 'warm' 'warm' 'hot']`,
          outputNote: "In ladder order: cold, mild, warm, hot — one branch each. Swapped: the first condition (temps < 30) catches 15.0, 21.5 and 26.0, so three cells wear 'warm' and only 31.0 falls through.",
          explain: [
            "The ladder is walked per cell, first match wins: 15.0 matched `temps < 18` first, so it is 'cold' — the later true conditions never got a say.",
            "In the swapped version, `temps < 30` is now FIRST, so it claims everything under 30 — including the 15.0 that should have been cold. Condition order is logic, not style.",
            "`default=\"hot\"` caught 31.0. Leave default out and unmatched cells get 0 — select's stated default — which is rarely what you want with labels.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.select",
          purpose: "Build an array by a ladder of conditions — the vectorized if/elif/else, first matching condition wins and default catches the rest.",
          signature: "np.select(condlist, choicelist, default=0)",
          purposeDetail:
            "Python's if/elif/else cannot run over an array: each condition is a mask with thousands of answers, and the scalar statement needs one. select is the loop the language refuses to write for you: it pairs a list of conditions with a list of results and, for every cell, applies your ladder in order — first True wins, and cells that match nothing take the default. It is the tool for bucketing (values into labels), tiered policies (pricing bands, severity levels) and any per-cell rule with more than two outcomes. If you only ever need two outcomes, np.where (Lesson d-04) is the lighter spelling.",
          params: [
            {
              name: "condlist",
              type: "list of array_like of bool",
              required: true,
              description: "The conditions, in ladder order: condlist[0] is the 'if', condlist[1] the 'elif', and so on. Each must broadcast against the others.",
              example: "[temps < 18, temps < 25, temps < 30]",
            },
            {
              name: "choicelist",
              type: "list of array_like or scalars",
              required: true,
              description: "The result for each condition, paired by position — same length as condlist. Scalars broadcast to the whole selection.",
              example: "[\"cold\", \"mild\", \"warm\"]",
            },
            {
              name: "default",
              type: "scalar or array_like",
              required: false,
              description: "What unmatched cells receive. The default is 0 — with string labels, ALWAYS pass default explicitly or the promotion rules will object.",
              example: "default=\"hot\"",
            },
          ],
          returns: {
            type: "ndarray",
            description: "One value per cell of the broadcast condition shape: the first matching choice, or the default. New memory — inputs are never edited.",
          },
          example: `import numpy as np

temps = np.array([15.0, 21.5, 26.0, 31.0])
labels = np.select([temps < 18, temps < 25, temps < 30],
                   ["cold", "mild", "warm"], default="hot")
print(labels)

vals = np.array([3, 18, 25, 42])
kept = np.select([vals < 10], [vals], default=0)
print(kept)
`,
          exampleOutput: `['cold' 'mild' 'warm' 'hot']
[3 0 0 0]`,
          commonMistakes: [
            {
              mistake: "Writing the conditions in arbitrary order and trusting the buckets.",
              why: "First match wins: a broad condition placed first claims every cell it can, starving the specific ones below it — the swapped demo in this lesson sent 15.0 to 'warm'.",
              fix: "Order conditions exactly as you would write the if/elif ladder: most specific (or strongest claim) first. Then re-read them top to bottom as English.",
            },
            {
              mistake: "Forgetting default with string choices.",
              why: "The default default is the number 0, and mixing 'a number' with 'strings' makes NumPy try to promote — an error or a surprise, not a label.",
              fix: "Pass default explicitly whenever unmatched cells are possible: default=\"unknown\", default=np.nan, or a value of your choosing.",
            },
            {
              mistake: "Expecting select to evaluate only the winning branch.",
              why: "It computes every condition and every choice array up front (they are just arrays), unlike Python's short-circuit if. Side effects in the 'branches' cannot be skipped selectively.",
              fix: "Treat choicelist as pure data. If a branch is expensive or effectful, compute it once, before select, and pass the result in.",
            },
          ],
          related: [
            { name: "np.where", relation: "The two-branch special case — lighter and clearer when exactly two outcomes exist (Lesson d-04)." },
            { name: "np.choose", relation: "Index-driven branching (a code per cell) instead of condition-driven — pick when the 'branches' are a lookup." },
            { name: "np.digitize", relation: "Bucketing by value EDGES instead of by conditions — Part H's binning tool." },
            { name: "boolean mask assignment", relation: "The in-place alternative: a[a > x] = v edits the original; select builds a new array." },
          ],
          applications: [
            "Labeling: bucket continuous values into named categories for reports — this lesson's closing surgery labels sensor loads",
            "Tiered policies: fee = np.select([amt < 100, amt < 1000], [0, 5], default=10)",
            "Feature engineering: encode a measured grid into ordinal levels a model can consume",
          ],
          notes:
            "select is sugar over stacked where calls (the docs say so) — readable and vectorized. For heavy binning workloads, np.digitize (Part H) does the same job by value edges and is the idiomatic endgame.",
        },
        {
          kind: "heading",
          text: "The combined run: data surgery on a sensor grid",
        },
        {
          kind: "text",
          text: "Time to use the whole part at once. The grid below holds five days of readings from four sensors, and it is broken two ways: sensor 1 spiked once (a 96 among 11-14s) and sensor 3 died outright (stuck reading 95-99). The repair pass uses nothing you have not already verified: a mask to find the spikes, `count_nonzero` with axis for per-sensor verdicts, `flatnonzero` + `unravel_index` to locate them, `put` to write the fixes, fancy row assignment to rebuild the dead sensor, `select` to label the result, and a fancy reindex (cross-checked with `take`) to put the problem children first. Read it top to bottom — every line is a Part D move:",
        },
        {
          kind: "code",
          title: "Surgery, part 1: detect and repair",
          code: `import numpy as np

grid = np.array([[12.0, 14.0, 13.0, 15.0, 14.0],
                 [11.0, 13.0, 96.0, 14.0, 12.0],
                 [15.0, 16.0, 14.0, 13.0, 15.0],
                 [99.0, 98.0, 97.0, 96.0, 95.0]])

print("raw sensor grid:")
print(grid)

spike = grid > 80                                   # the question (d-04)
counts = np.count_nonzero(spike, axis=1)            # per-sensor verdicts
print("spikes per sensor:", counts)

dead = counts == grid.shape[1]                      # EVERY reading spiked: dead sensor
dead_rows = np.flatnonzero(dead)                    # its row number
healthy_rows = np.flatnonzero(~dead)
print("dead sensor row(s):", dead_rows, " healthy rows:", healthy_rows)

alive_spikes = spike & ~dead[:, np.newaxis]         # column trick: one verdict per row
places = np.flatnonzero(alive_spikes)               # flat places only (d-05)
rows, cols = np.unravel_index(places, grid.shape)   # ...and their coordinates
print("isolated spike at flat", places, "-> row", rows, "col", cols)

repair = np.array([grid[s][~spike[s]].mean() for s in rows])   # each sensor's own normal
repaired = grid.copy()                              # d-03's firewall: raw stays raw
np.put(repaired, places, repair)                    # write the fix at the flat place
print("after repairing the spike:")
print(repaired)

fleet_day_mean = repaired[healthy_rows].mean(axis=0)   # fancy rows, then mean down
repaired[dead_rows] = fleet_day_mean                # rebuild the dead row wholesale
print("after rebuilding the dead sensor:")
print(repaired)
`,
          output: `raw sensor grid:
[[12. 14. 13. 15. 14.]
 [11. 13. 96. 14. 12.]
 [15. 16. 14. 13. 15.]
 [99. 98. 97. 96. 95.]]
spikes per sensor: [0 1 0 5]
dead sensor row(s): [3]  healthy rows: [0 1 2]
isolated spike at flat [7] -> row [1] col [2]
after repairing the spike:
[[12.  14.  13.  15.  14. ]
 [11.  13.  12.5 14.  12. ]
 [15.  16.  14.  13.  15. ]
 [99.  98.  97.  96.  95. ]]
after rebuilding the dead sensor:
[[12.         14.         13.         15.         14.        ]
 [11.         13.         12.5        14.         12.        ]
 [15.         16.         14.         13.         15.        ]
 [12.66666667 14.33333333 13.16666667 14.         13.66666667]]`,
          outputNote: "The 96 became 12.5 — sensor 1's own mean on its four good days — and the dead row became the healthy fleet's per-day profile: 12.67, 14.33, 13.17, 14.0, 13.67.",
          explain: [
            "`spike = grid > 80` found all six bad cells at once: one on sensor 1, five on the dead sensor 3.",
            "`dead = counts == grid.shape[1]` — a sensor whose every reading spiked is not spiking; it is stuck. `~dead[:, np.newaxis]` (the d-01 column trick) stretched the per-sensor verdicts across their days, so `alive_spikes` kept only the isolated 96.",
            "`repair` is sensor 1's mean over its good days (11, 13, 14, 12 → 12.5), and `np.put` wrote it at flat place 7 — no coordinate round trip needed.",
            "The dead row was rebuilt from the healthy fleet: `repaired[healthy_rows]` fancy-indexed the three good rows, `.mean(axis=0)` averaged down them per day, and a fancy row assignment wrote the profile into row 3.",
          ],
        },
        {
          kind: "code",
          title: "Surgery, part 2: label, rank, and report",
          code: `import numpy as np

repaired = np.array([[12.0, 14.0, 13.0, 15.0, 14.0],
                     [11.0, 13.0, 12.5, 14.0, 12.0],
                     [15.0, 16.0, 14.0, 13.0, 15.0],
                     [12.66666667, 14.33333333, 13.16666667, 14.0, 13.66666667]])
counts = np.array([0, 1, 0, 5])        # spike counts from part 1

labels = np.select([repaired < 13, repaired < 15], ["low", "normal"], default="high")
print("load labels:")
print(labels)

order = sorted(range(4), key=lambda s: -counts[s])   # worst first; Part G's argsort vectorizes this
print("problems-first row order:", order)

print("report, worst rows on top:")
print(repaired[order])
print("same reindex via np.take:", np.array_equal(repaired[order], np.take(repaired, order, axis=0)))
`,
          output: `load labels:
[['low' 'normal' 'normal' 'high' 'normal']
 ['low' 'normal' 'low' 'normal' 'low']
 ['high' 'high' 'normal' 'normal' 'high']
 ['low' 'normal' 'normal' 'normal' 'normal']]
problems-first row order: [3, 1, 0, 2]
report, worst rows on top:
[[12.66666667 14.33333333 13.16666667 14.         13.66666667]
 [11.         13.         12.5        14.         12.        ]
 [12.         14.         13.         15.         14.        ]
 [15.         16.         14.         13.         15.        ]]
same reindex via np.take: True`,
          outputNote: "Labels run low/normal with one 'high' (the 16.0 on sensor 2). The report reindexed rows [3, 1, 0, 2] — dead sensor first, then the spiky one — and take confirms the reindex byte for byte.",
          explain: [
            "`np.select` bucketed every repaired load: below 13 is 'low', below 15 'normal', and the single 16.0 fell to the default 'high'.",
            "`order` came from a plain-Python sort over four problem counts (worst first) — honest scalar code for a tiny job; Part G's argsort is the vectorized spelling.",
            "`repaired[order]` is fancy row reindexing (d-05), and `np.take(repaired, order, axis=0)` is the same gather through take's door — the array_equal check prints True, closing the loop this lesson opened.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The surgery grid, before the repair",
          mode: "explore",
          name: "grid",
          caption:
            "The raw 4x5 sensor grid from the surgery run. Click around: the spike (row 1, Wednesday, value 96.0) and the dead sensor (row 3, stuck at 95-99 every day) are the two problems the repair pass hunted. Every cell also shows its flat place — the currency flatnonzero returned and put spent.",
          data: [
            [12.0, 14.0, 13.0, 15.0, 14.0],
            [11.0, 13.0, 96.0, 14.0, 12.0],
            [15.0, 16.0, 14.0, 13.0, 15.0],
            [99.0, 98.0, 97.0, 96.0, 95.0],
          ],
          labels: {
            rows: ["sensor 0", "sensor 1 (one spike)", "sensor 2", "sensor 3 (dead)"],
            cols: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          },
          dtype: "float64",
        },
        {
          kind: "tryIt",
          title: "Widen the surgery",
          task: "Run this miniature of the surgery, then: (1) lower the spike threshold from 80 to 14 and see which EXTRA cells get flagged (and what happens to the 'dead' verdict); (2) give sensor 0 a spike of its own (set raw[0, 4] = 88.0) and re-run; (3) swap the put line for a fancy-assignment line that writes the same value through the (row, col) coordinates instead.",
          code: `import numpy as np

raw = np.array([[12.0, 14.0, 13.0, 15.0, 14.0],
                [11.0, 13.0, 96.0, 14.0, 12.0],
                [15.0, 16.0, 14.0, 13.0, 15.0],
                [99.0, 98.0, 97.0, 96.0, 95.0]])

spike = raw > 80
places = np.flatnonzero(spike & (np.count_nonzero(spike, axis=1) < raw.shape[1])[:, np.newaxis])
rows, cols = np.unravel_index(places, raw.shape)
print("isolated spikes at flat", places)

fixed = raw.copy()
np.put(fixed, places, 13.0)
print("spike cells after the fix:", fixed[rows, cols])
print("raw untouched           :", raw[1, 2])
`,
          hint: "With the threshold at 14, sensor 2's 16.0 and every 15.0 also light up — and the dead verdict no longer fires, because sensor 3's count is still 5 but sensor 1's grows too; watch which cells the mask picks before you trust any count. The fancy-assignment spelling: fixed[rows, cols] = 13.0.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "take gathers and put scatters, by FLAT place, with an explicit raise/clip/wrap policy — put edits in place and returns None. choose branches per cell by an index; select branches per cell by a ladder of conditions, first match wins, default catches the rest. flatnonzero turns masks into the flat places take and put spend, and unravel_index translates them back to coordinates.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Part D is complete",
          text: "You can now reach into an array every way there is: single positions, slices, boolean questions, lists of places — and you know which of those hand you views and which hand you copies, which is the difference between editing your data and vandalizing it. Part E turns the question around: not 'how do I select these cells' but 'which cells are the biggest, the closest, the ones I am looking for' — searching, sorting, and the where/argmax family you have seen previewed twice.",
        },
      ],
      terms: [
        { term: "np.take", definition: "Gather elements along one axis by a list of places — fancy indexing's function spelling; axis=None gathers from the flattened array, and mode sets the out-of-bounds policy." },
        { term: "np.put", definition: "Scatter values into an array at FLAT places, in place (returns None); places pair with values in order, duplicates follow last-write-wins, and mode sets the out-of-bounds policy." },
        { term: "np.flatnonzero", definition: "The flat, row-major positions of an array's non-zero (mask-True) cells — the bridge from boolean questions to flat-place tools like take and put." },
        { term: "np.choose", definition: "Vectorized menu choice: an index array names, per cell, which candidate array feeds that cell of the result; index and candidates must broadcast to one shape." },
        { term: "np.select", definition: "Vectorized if/elif/else: a ladder of conditions paired with choices, walked per cell with first-match-wins, and a default for cells no condition claims." },
      ],
      mistakes: [
        {
          mistake: "Writing result = np.put(a, places, values) and expecting result to hold the patched array.",
          why: "put returns None — it edits its first argument in place, verified in this lesson. Using the 'result' hands your code None and quietly works only if you also read the original.",
          fix: "Call put as a statement. If you need the original preserved, copy first (repaired = raw.copy()) and put into the copy — the surgery run's exact pattern.",
        },
        {
          mistake: "Handing put (or axis-less take) (row, col) coordinate arrays.",
          why: "Both speak FLAT places: a coordinate pair arrives as two unrelated flat numbers and writes (or reads) the wrong cells — a silent corruption, not an error.",
          fix: "Convert coordinates to flat with np.ravel_multi_index((rows, cols), shape), or stay in coordinate land with fancy assignment a[rows, cols] = values.",
        },
        {
          mistake: "Ordering np.select conditions casually, like a set of independent buckets.",
          why: "select is a ladder: the first True condition wins each cell. A broad condition on top starves the specific ones below — the swapped demo sent a 15.0-degree day to 'warm'.",
          fix: "Write conditions exactly as the if/elif chain you mean, most specific first, then read them aloud top to bottom as a sentence.",
        },
        {
          mistake: "Mixing shapes in np.choose — a (3,) index over (2,) candidates.",
          why: "Index and candidates must broadcast to a common shape; mismatched lengths raise ValueError: shape mismatch, and the message helpfully names both shapes.",
          fix: "Match the lengths or use scalar candidates (they broadcast against anything). For whole-array choices, stack the candidates and fancy-index the stack instead.",
        },
      ],
      takeaways: [
        "np.take(one, places) and one[[places]] are the same gather; take adds a named axis and an explicit mode policy — raise (default, loud), clip (to the edge), wrap (around the loop).",
        "np.put writes values at FLAT places, in place, returning None; np.flatnonzero(mask) produces exactly those places from a boolean question, and np.unravel_index translates them to coordinates.",
        "np.diagonal hands you a read-only view — the flags.writeable lock from Lesson d-03 arriving from the factory. Blocked writes raise ValueError: assignment destination is read-only.",
        "np.choose branches per cell by an index array over candidates; np.select branches by a condition ladder — first match wins, so order is logic, and default catches the unmatched.",
        "The full surgery pattern: mask to find, count_nonzero with axis to summarize, flatnonzero/unravel_index to locate, put to repair, fancy rows to rebuild and reindex, select to label — every step verified in this lesson on one broken sensor grid.",
      ],
      quiz: [
        {
          id: "d-06-q1",
          prompt: "`flat = np.arange(10)`. What is `np.take(flat, 12, mode=\"clip\")`?",
          options: [
            { text: "9 — the place is clamped to the last valid position", correct: true, feedback: "Right: clip pulls toward the nearest edge, and 12 is past the end, so it lands on 9." },
            { text: "2 — 12 wraps around to 12 mod 10", correct: false, feedback: "That is mode=\"wrap\". Clip clamps to the edge instead of cycling." },
            { text: "It raises IndexError: index 12 is out of bounds", correct: false, feedback: "That is the DEFAULT mode ('raise'). You explicitly asked for clip, so you get clamping." },
            { text: "An empty array, like an out-of-range slice", correct: false, feedback: "take never returns empty-on-out-of-range — slices clamp to nothing, take follows its mode policy." },
          ],
          explanation: "mode='clip' clamps out-of-range places to the nearest edge: place 12 of a length-10 array gathers element 9.",
        },
        {
          id: "d-06-q2",
          prompt: "After `np.put(p, [0, 3, 3], [7, 8, 9])` on `p = np.zeros(5, dtype=int)`, what is `p[3]`, and what did the call return?",
          options: [
            { text: "p[3] is 9, and the call returned None — put edits in place", correct: true, feedback: "Exactly: place 3 was written 8 then 9 (last write wins), and there is no new array to return." },
            { text: "p[3] is 9, and the call returned the patched array", correct: false, feedback: "The patching happened — to p, not to a result. put's return value is None, always." },
            { text: "p[3] is 8, and the call returned None — first write sticks", correct: false, feedback: "First-write-sticks is not a rule anywhere in this part: duplicate places follow last-write-wins, so 9 survives." },
            { text: "It raises an error: duplicate places in put", correct: false, feedback: "Duplicates are legal and defined: writes proceed in order, the last one standing wins." },
          ],
          explanation: "put scatters in place at flat places — duplicates last-write-wins, and the return is None.",
        },
        {
          id: "d-06-q3",
          prompt: "`temps = np.array([15.0, 21.5, 26.0, 31.0])`. What does `np.select([temps < 30, temps < 18], [\"warm\", \"cold\"], default=\"hot\")` return?",
          options: [
            { text: "['warm' 'warm' 'warm' 'hot'] — the first condition claims everything under 30", correct: true, feedback: "Correct: select is a ladder; temps < 30 is checked first and is True for 15.0, 21.5 and 26.0, so 'cold' never gets a chance." },
            { text: "['cold' 'warm' 'warm' 'hot'] — each value lands in its most specific bucket", correct: false, feedback: "That would require the specific condition FIRST. As written, the broad 30-test outranks the 18-test and eats it." },
            { text: "['cold' 'warm' 'warm' 'warm'] — the default fills 31.0 with 'warm'", correct: false, feedback: "Two problems: order (15.0 matches the first condition, so 'warm') and the default ('hot' catches 31.0)." },
            { text: "It raises an error: conditions must not overlap", correct: false, feedback: "Overlap is fine and common — that is exactly why the ladder ORDER decides who wins overlapping cells." },
          ],
          explanation: "First match wins per cell: with the broad condition first, everything under 30 wears 'warm' and only 31.0 reaches the default.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part D exercises
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "d-b1",
      tier: "beginner",
      title: "Your order, your duplicates",
      prompt:
        "Given `one = np.array([3, 6, 9, 12, 15])`, use fancy indexing to print two lines: first the values at places [3, 0, 3] (duplicates and all), then the values at places [-1, -3] (negatives count from the end). Predict both lines before running: the first has three values, the second two.",
      hint: "Lists of places go straight inside the brackets: one[[3, 0, 3]]. The result length always equals the list length.",
      starter: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

# TODO: print the values at places [3, 0, 3], then at [-1, -3]
`,
      solution: `import numpy as np

one = np.array([3, 6, 9, 12, 15])
print(one[[3, 0, 3]])
print(one[[-1, -3]])
`,
      expectedOutput: `[12  3 12]
[15  9]`,
      concepts: ["fancy indexing", "negative indexes"],
    },
    {
      id: "d-b2",
      tier: "beginner",
      title: "Count and gather the spikes",
      prompt:
        "The temperature grid `temps` (3x4, from Lesson d-04) is given. Build the mask `temps > 26`, then print two lines: how many cells answer True (use np.count_nonzero), and the values themselves (mask inside brackets). The count line should print 5 and the values gather in reading order.",
      hint: "Count the mask, not the values: np.count_nonzero(mask). Gather with temps[mask] — one line each.",
      starter: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

mask = temps > 26

# TODO: print how many cells are True, then the selected values
`,
      solution: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

mask = temps > 26
print(np.count_nonzero(mask))
print(temps[mask])
`,
      expectedOutput: `5
[28 30 92 95 27]`,
      concepts: ["boolean masks", "np.count_nonzero"],
    },
    {
      id: "d-b3",
      tier: "beginner",
      title: "Gather with take",
      prompt:
        "Given `one = np.array([3, 6, 9, 12, 15])`, use np.take (not brackets) to gather places [1, 1, -1] and print the result. Then print the same result using fancy brackets, and a final line checking the two spellings agree with np.array_equal. The repeated place 1 is on purpose — duplicates are legal in takes.",
      hint: "np.take(one, [1, 1, -1]) is the whole first line. The bracket spelling is one[[1, 1, -1]].",
      starter: `import numpy as np

one = np.array([3, 6, 9, 12, 15])

# TODO: np.take the places [1, 1, -1]; print the bracket spelling; print array_equal
`,
      solution: `import numpy as np

one = np.array([3, 6, 9, 12, 15])
print(np.take(one, [1, 1, -1]))
print(one[[1, 1, -1]])
print(np.array_equal(np.take(one, [1, 1, -1]), one[[1, 1, -1]]))
`,
      expectedOutput: `[ 6  6 15]
[ 6  6 15]
True`,
      concepts: ["np.take", "fancy indexing"],
    },
    {
      id: "d-b4",
      tier: "beginner",
      title: "Paired lists are coordinates",
      prompt:
        "From the 3x4 grid `a` (values 10-33), use ONE fancy expression with two lists to pick the cells (0, 1) and (2, 3), and print the two values. Remember the zip rule: the lists pair up entry by entry — you are NOT selecting a block.",
      hint: "Row list first, column list second: a[[0, 2], [1, 3]]. Two entries per list means two values out.",
      starter: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

# TODO: pick cells (0, 1) and (2, 3) with one paired-list expression
`,
      solution: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])
print(a[[0, 2], [1, 3]])
`,
      expectedOutput: `[11 33]`,
      concepts: ["fancy indexing", "coordinate pairing"],
    },
    {
      id: "d-i1",
      tier: "intermediate",
      title: "The view/copy detective, three probes",
      prompt:
        "Given `a` (3x4, values 10-33), print three lines: whether a[1:3] shares memory with a, whether a[[1, 2]] shares memory with a, and whether a[a > 15] shares memory with a (use np.shares_memory for each). Predict first: one True, two False — and say WHY in a comment before running.",
      hint: "Slices view; fancy lists and boolean masks copy. One np.shares_memory(a, probe) call per line.",
      starter: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

# TODO: three shares_memory probes -- slice, fancy list, boolean mask
`,
      solution: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

print(np.shares_memory(a, a[1:3]))       # slice -> view -> True
print(np.shares_memory(a, a[[1, 2]]))    # fancy -> copy -> False
print(np.shares_memory(a, a[a > 15]))    # mask  -> copy -> False
`,
      expectedOutput: `True
False
False`,
      concepts: ["views vs copies", "np.shares_memory"],
    },
    {
      id: "d-i2",
      tier: "intermediate",
      title: "Build the block with np.ix_",
      prompt:
        "From the same 3x4 grid `a`, build and print the 2x2 block of rows {0, 2} x columns {1, 3} using np.ix_ — then print its shape. Bare paired lists would zip; you want the cross product, so wrap the lists. The result is [[11 13] [31 33]].",
      hint: "a[np.ix_([0, 2], [1, 3])] — np.ix_ turns two lists into the row-set-times-column-set product.",
      starter: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

# TODO: the rows {0, 2} x columns {1, 3} block via np.ix_, then its shape
`,
      solution: `import numpy as np

a = np.array([[10, 11, 12, 13],
              [20, 21, 22, 23],
              [30, 31, 32, 33]])

block = a[np.ix_([0, 2], [1, 3])]
print(block)
print(block.shape)
`,
      expectedOutput: `[[11 13]
 [31 33]]
(2, 2)`,
      concepts: ["np.ix_", "cross product", "fancy indexing"],
    },
    {
      id: "d-i3",
      tier: "intermediate",
      title: "Run a floor-and-cap policy",
      prompt:
        "The temperature grid `temps` needs a cleanup policy applied to a COPY (raw data must survive). Make `clean = temps.copy()`, then cap every reading above 26 at exactly 26 and floor every reading below 20 at exactly 20 (two mask assignments). Print three lines: the cleaned grid, the count of cells that were capped (count on the RAW grid), and the cleaned grid's min and max on one line.",
      hint: "clean[clean > 26] = 26 and clean[clean < 20] = 20 — the clip-by-hand idiom twice. Count the capped cells on temps, not clean, or you will count zero.",
      starter: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

clean = temps.copy()

# TODO: cap > 26 at 26, floor < 20 at 20; print clean, capped count, min and max
`,
      solution: `import numpy as np

temps = np.array([[21, 19, 25, 28],
                  [30, 18, 92, 24],
                  [22, 95, 20, 27]])

clean = temps.copy()
clean[clean > 26] = 26
clean[clean < 20] = 20

print(clean)
print(np.count_nonzero(temps > 26))
print(clean.min(), clean.max())
`,
      expectedOutput: `[[21 20 25 26]
 [26 20 26 24]
 [22 26 20 26]]
5
20 26`,
      concepts: ["mask assignment", "clip idiom", "np.count_nonzero"],
    },
    {
      id: "d-i4",
      tier: "intermediate",
      title: "Fix the crash (read the policy!)",
      prompt:
        "This code crashes with an IndexError because the night crew wrote to hour 7 of a 5-slot log. Fix it WITHOUT deleting either write: keep places [1, 7] and values [4, 9], but let the out-of-range place land in the LAST slot instead of crashing. Read the error, decide the policy, and make the fix explicit in the call.",
      hint: "The error is IndexError: index 7 is out of bounds for axis 0 with size 5. np.put's mode parameter has three policies; 'clip' clamps place 7 to place 4.",
      starter: `import numpy as np

log = np.zeros(5, dtype=int)

# hour 7 is beyond the log's 5 slots -- the crew wrote past the end
np.put(log, [1, 7], [4, 9])
print("log:", log)
`,
      solution: `import numpy as np

log = np.zeros(5, dtype=int)

# keep both writes, but clamp the out-of-range place to the last slot
np.put(log, [1, 7], [4, 9], mode="clip")
print("log:", log)
`,
      expectedOutput: `log: [0 4 0 0 9]`,
      starterExpectError: "IndexError: index 7 is out of bounds for axis 0 with size 5",
      concepts: ["np.put", "out-of-bounds policies", "error reading"],
    },
    {
      id: "d-a1",
      tier: "advanced",
      title: "The flat round trip",
      prompt:
        "Given `g` (3x3 with three non-zeros), do the whole loop: (1) get the FLAT places of the non-zero cells with np.flatnonzero; (2) convert them to coordinates with np.unravel_index; (3) convert the coordinates BACK to flat with np.ravel_multi_index; (4) print the places, the rows and cols, and a boolean proving the round trip returned your original places (np.array_equal). Four prints.",
      hint: "places = np.flatnonzero(g); rows, cols = np.unravel_index(places, g.shape); back = np.ravel_multi_index((rows, cols), g.shape). The tuple for ravel_multi_index is (rows, cols) — parentheses and all.",
      starter: `import numpy as np

g = np.array([[0, 5, 0],
              [7, 0, 0],
              [0, 0, 9]])

# TODO: flat places -> coordinates -> flat again -> proof of the round trip
`,
      solution: `import numpy as np

g = np.array([[0, 5, 0],
              [7, 0, 0],
              [0, 0, 9]])

places = np.flatnonzero(g)
rows, cols = np.unravel_index(places, g.shape)
back = np.ravel_multi_index((rows, cols), g.shape)

print(places)
print(rows, cols)
print(back)
print(np.array_equal(back, places))
`,
      expectedOutput: `[1 3 8]
[0 1 2] [1 0 2]
[1 3 8]
True`,
      concepts: ["np.flatnonzero", "np.unravel_index", "np.ravel_multi_index"],
    },
    {
      id: "d-a2",
      tier: "advanced",
      title: "Last write wins, twice over",
      prompt:
        "Prove the last-write-wins rule holds identically for fancy assignment and np.put. Start from zeros(4, dtype=int) twice (arrays b and p). Give each the SAME duplicate-place write: places [1, 3, 1] with values [5, 6, 7] — once as a fancy assignment on b, once as np.put on p. Print b, print p, and print whether they ended up identical (np.array_equal). Predict both arrays before running.",
      hint: "Fancy: b[[1, 3, 1]] = [5, 6, 7]. Put: np.put(p, [1, 3, 1], [5, 6, 7]) — remember put returns None, so call it bare. Place 1 is written 5 then 7.",
      starter: `import numpy as np

b = np.zeros(4, dtype=int)
p = np.zeros(4, dtype=int)

# TODO: the same duplicate-place write, fancy on b and put on p; print b, p, equality
`,
      solution: `import numpy as np

b = np.zeros(4, dtype=int)
p = np.zeros(4, dtype=int)

b[[1, 3, 1]] = [5, 6, 7]
np.put(p, [1, 3, 1], [5, 6, 7])

print(b)
print(p)
print(np.array_equal(b, p))
`,
      expectedOutput: `[0 7 0 6]
[0 7 0 6]
True`,
      concepts: ["last-write-wins", "fancy assignment", "np.put"],
    },
    {
      id: "d-a3",
      tier: "advanced",
      title: "Grade the exam with np.select",
      prompt:
        "Scores `scores = np.array([92, 68, 45, 81])` need letter grades: A for 90 or above, B for 80 or above, C for 70 or above, D for 60 or above, and F below that. Build the labels with ONE np.select call and print them. Order the ladder correctly — a broad condition placed first would claim every cell below it. Expected grades: A, D, F, B.",
      hint: "np.select([scores >= 90, scores >= 80, scores >= 70, scores >= 60], ['A', 'B', 'C', 'D'], default='F') — descending thresholds, most specific first, default catches the rest.",
      starter: `import numpy as np

scores = np.array([92, 68, 45, 81])

# TODO: one np.select call -> letter grades, then print them
`,
      solution: `import numpy as np

scores = np.array([92, 68, 45, 81])

grades = np.select(
    [scores >= 90, scores >= 80, scores >= 70, scores >= 60],
    ["A", "B", "C", "D"],
    default="F",
)
print(grades)
`,
      expectedOutput: `['A' 'D' 'F' 'B']`,
      concepts: ["np.select", "condition ordering", "bucketing"],
    },
    {
      id: "d-a4",
      tier: "advanced",
      title: "Repair the sentinel grid",
      prompt:
        "The grid `grid` (4x3) has three missing readings marked with -1. Repair a COPY so every sentinel becomes the mean of the GOOD values in ITS OWN column — no plain Python loop over cells: use a mask for the sentinels, np.flatnonzero + np.unravel_index to locate them, per-column means computed with one list comprehension over columns, and np.put to write the repairs. Print the grid before and after.",
      hint: "good = grid != -1; places = np.flatnonzero(~good); rows, cols = np.unravel_index(places, grid.shape); col_means = np.array([grid[:, c][good[:, c]].mean() for c in range(grid.shape[1])]); then np.put into the copy at places with col_means[cols].",
      starter: `import numpy as np

grid = np.array([[4.0, -1.0, 7.0],
                 [8.0, 5.0, -1.0],
                 [-1.0, 6.0, 9.0],
                 [5.0, 4.0, 8.0]])

print("before:")
print(grid)

repaired = grid.copy()

# TODO: locate the sentinels (mask + flatnonzero + unravel_index),
#       compute per-column good means, np.put the repairs, print after
`,
      solution: `import numpy as np

grid = np.array([[4.0, -1.0, 7.0],
                 [8.0, 5.0, -1.0],
                 [-1.0, 6.0, 9.0],
                 [5.0, 4.0, 8.0]])

print("before:")
print(grid)

repaired = grid.copy()

good = grid != -1
places = np.flatnonzero(~good)
rows, cols = np.unravel_index(places, grid.shape)
col_means = np.array([grid[:, c][good[:, c]].mean() for c in range(grid.shape[1])])
np.put(repaired, places, col_means[cols])

print("after:")
print(repaired)
`,
      expectedOutput: `before:
[[ 4. -1.  7.]
 [ 8.  5. -1.]
 [-1.  6.  9.]
 [ 5.  4.  8.]]
after:
[[4.         5.         7.        ]
 [8.         5.         8.        ]
 [5.66666667 6.         9.        ]
 [5.         4.         8.        ]]`,
      concepts: ["np.flatnonzero", "np.unravel_index", "np.put", "mask logic"],
    },
  ],

  // ------------------------------------------------------------------
  // Part D assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "d-as-1",
      prompt: "In one sentence: what decides whether writing through an extraction reaches the original array?",
      options: [
        { text: "Whether the operation handed you a view (writes travel) or a copy (writes stay)", correct: true, feedback: "The whole memory model in one line — and np.shares_memory settles any specific case." },
        { text: "Whether the array is 1-D or 2-D", correct: false, feedback: "Dimensionality is irrelevant: a 1-D row view and a 2-D block view both write through." },
        { text: "Whether you used brackets or a method call", correct: false, feedback: "Syntax does not decide memory: a.copy() and a[...] are both brackets-and-methods worlds apart in behavior." },
        { text: "Whether the values are integers or floats", correct: false, feedback: "dtype plays no part in view-vs-copy; it only constrains what values assignment accepts." },
      ],
      explanation: "Views are windows onto the parent's block; copies are fresh blocks. Operations, not syntax or dtype, decide which you got.",
    },
    {
      id: "d-as-2",
      prompt: "`one = np.arange(5)`. Which statement about `one[2:100]` versus `one[100]` is TRUE?",
      options: [
        { text: "The slice clamps and returns [2 3 4]; the integer index raises IndexError", correct: true, feedback: "Exactly the two-rule world: ranges clamp to what exists, single positions must exist." },
        { text: "Both raise IndexError: index 100 is out of bounds", correct: false, feedback: "Only the integer index raises — slices describe ranges and are truncated, never crashed." },
        { text: "Both clamp: the slice gives [2 3 4], the index gives the last element", correct: false, feedback: "Integer indexes never clamp — a position that does not exist is an error, not 'the nearest one'." },
        { text: "The slice returns an empty array and the index raises", correct: false, feedback: "Empty happens only when the WHOLE range is off the end (one[10:20] on length 5); position 2 exists, so [2 3 4] is returned." },
      ],
      explanation: "Slices clamp, integer indexes raise — the fencepost rule with no exceptions (Lesson d-02).",
    },
    {
      id: "d-as-3",
      prompt: "Which of these hands you a COPY of the original's values?",
      options: [
        { text: "a[a > 5] — selection by boolean mask", correct: true, feedback: "Right: masks gather matches into a fresh block — writes to the result never reach a." },
        { text: "a[1:3] — selection by slice", correct: false, feedback: "Slices are views: shares_memory is True and slice assignment edits a through the window." },
        { text: "a.T — the transpose", correct: false, feedback: "A header trick over the same block: a view, as Part A first showed." },
        { text: "a[1] — indexing with a single integer", correct: false, feedback: "Basic indexing views — that is exactly the 'extracted row mutates the parent' bug." },
      ],
      explanation: "Masks (and fancy lists, and arithmetic) copy; positions, slices, transpose and reshape view.",
    },
    {
      id: "d-as-4",
      prompt: "Why does `(t > 20) & (t < 26)` need its parentheses?",
      options: [
        { text: "& binds more tightly than comparisons, so without them Python mis-groups the expression into a chained comparison that crashes", correct: true, feedback: "t > 20 & t < 26 parses as t > (20 & t) < 26 — one truth value needed from an array, and NumPy refuses (the ambiguous-truth error)." },
        { text: "They are required style; both forms compute the same mask", correct: false, feedback: "If only: without them the expression is not the same computation at all — it crashes." },
        { text: "Parentheses are what make & element-wise", correct: false, feedback: "& is element-wise on arrays by definition; the parentheses fix GROUPING, not the operator's meaning." },
        { text: "They convert the comparisons to boolean dtype", correct: false, feedback: "Comparisons already return bool arrays — parentheses never change types." },
      ],
      explanation: "Precedence: & beats >. Parenthesize every comparison, or Python builds a chained comparison and NumPy raises the famous ValueError.",
    },
    {
      id: "d-as-5",
      prompt: "`a` is 3x4. You expected a block, but `a[[0, 1], [2, 2]]` returned only two values. Why?",
      options: [
        { text: "Paired index lists zip into coordinate pairs — (0, 2) and (1, 2) — not a row-set-times-column-set block", correct: true, feedback: "The number-one fancy-indexing surprise. Same-length lists walk together, entry by entry." },
        { text: "The column list [2, 2] was deduplicated before pairing", correct: false, feedback: "Nothing is deduplicated — duplicates are kept on both sides. The result is two cells because two pairs were named." },
        { text: "Fancy indexing only works on 1-D arrays; the 2-D case partially failed", correct: false, feedback: "Fancy indexing works on any number of axes — it just follows the zip rule when several carry lists." },
        { text: "It returned a block, but printed as two values because the block is diagonal", correct: false, feedback: "Print never flattens a 2-D result — you got a (2,) array because two coordinate pairs were gathered." },
      ],
      explanation: "Multiple lists (or masks) in one bracket pair pair up as coordinates. For the block, wrap the lists in np.ix_.",
    },
    {
      id: "d-as-6",
      prompt: "After `b[[0, 0]] = [10, 20]` on a fresh array, what does `b[0]` hold — and what is the matching rule in np.put?",
      options: [
        { text: "20 — duplicate places follow last-write-wins, and put behaves the same way", correct: true, feedback: "One cell, one value: both writes happened in order and the last stood. put applies the identical rule at flat places." },
        { text: "10 — first write locks the cell, and put matches that", correct: false, feedback: "No locking anywhere: later writes overwrite earlier ones, in both fancy assignment and put." },
        { text: "30 — values accumulate; put also accumulates", correct: false, feedback: "Assignment is replacement. Nothing in NumPy indexing accumulates unless you explicitly write +=." },
        { text: "It raises an error in both tools: duplicate places are illegal", correct: false, feedback: "Duplicates are legal and defined — deterministic order, last write wins. That determinism is a feature." },
      ],
      explanation: "Last-write-wins is the defined behavior for duplicate places, in fancy assignment and np.put alike.",
    },
    {
      id: "d-as-7",
      prompt: "`flat = np.arange(10)`. What do `np.take(flat, 12, mode=\"clip\")` and `np.take(flat, 12, mode=\"wrap\")` return, respectively?",
      options: [
        { text: "9 and 2 — clip clamps to the last valid place, wrap cycles 12 mod 10", correct: true, feedback: "Exactly: 'as close as exists' versus 'around the loop'." },
        { text: "2 and 9 — wrap clamps, clip cycles", correct: false, feedback: "Swapped: CLIP pulls toward the edge (9); WRAP does modulo arithmetic (2)." },
        { text: "Both raise IndexError — 12 does not exist", correct: false, feedback: "That is mode='raise', the default. You explicitly declared clip and wrap, so you got policies, not crashes." },
        { text: "Both return 9 — every out-of-range policy lands at the end", correct: false, feedback: "Only clip lands at the edge; wrap computes 12 - 10 = 2." },
      ],
      explanation: "clip clamps to the axis's ends, wrap treats the axis as a cycle — and the default raise crashes loudly (Lesson d-06).",
    },
    {
      id: "d-as-8",
      prompt: "In np.select, what happens when a cell matches more than one condition in the ladder?",
      options: [
        { text: "The FIRST matching condition wins that cell — order is part of the logic", correct: true, feedback: "Right: select is a ladder walked per cell. A broad condition on top starves the specific ones below it." },
        { text: "The most specific condition wins, whatever its position", correct: false, feedback: "select has no notion of specificity — it checks conditions in list order and stops at the first True." },
        { text: "It raises an error: conditions must be mutually exclusive", correct: false, feedback: "Overlap is legal and common; that is exactly WHY the order decides who wins overlapping cells." },
        { text: "The cell takes the default", correct: false, feedback: "The default is only for cells that match NOTHING. Any match wins over the default." },
      ],
      explanation: "np.select walks the ladder per cell, first match wins, default catches the unmatched — order your conditions like the if/elif chain you mean.",
    },
  ],

  // ------------------------------------------------------------------
  // Part D mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Night Shift Repair",
    brief:
      "You are handed the night shift's server-load matrix: six servers, twelve hours, and two known problems hiding in it — one server ran dangerously hot for two hours, and one server's load sensor died and flatlined. Your job is to write a repair pipeline that finds both problems, fixes them without touching the raw data, ranks the servers worst-first, and prints a labeled report a human could act on. Every tool is Part D: boolean masks to ask the questions, fancy indexing to reindex and rebuild, flatnonzero/unravel_index to locate, put to write the repairs, take to prove the reindex, and select to label — plus the one np.newaxis column trick Lesson d-01 promised you would need.",
    requirements: [
      "Detect every spike with a per-server ceiling comparison — the column trick (ceilings[:, np.newaxis]) — with no Python loops",
      "Detect the dead sensor as the row whose readings are all identical (compare each cell to its row's first reading with loads[:, :1]), again without loops",
      "Repair the spikes with np.put at the FLAT positions from np.flatnonzero, capping each at its own server's ceiling — into a copy, so the raw matrix never changes",
      "Rebuild the dead sensor's row as the per-hour mean of the healthy repaired rows, using fancy row indexing to exclude the dead one",
      "Rank servers worst-first by problem count (each spike counts 1, a dead sensor counts 12) with a plain-Python sorted(), and produce the report grid with fancy row indexing",
      "Verify the reindex a second way: print whether np.take(repaired, order, axis=0) equals the fancy-indexed report",
      "Label the repaired grid \"low\" (below 30), \"normal\" (below 50) and \"high\" (default) with np.select, and print the labeled report in ranked order",
      "Print a before/after line for each problem server (2 and 5) so the repair is auditable",
    ],
    steps: [
      "Run the starter and read the raw grid: find the 150 and 140 on server 2, and the wall of 3s on server 5, by eye. Those are your two targets.",
      "Trace the detection section until both verdicts make sense: the spike mask compares every cell to ITS OWN server's ceiling (that is what the column trick buys), and the flatline check compares every cell to its row's first reading — a healthy row is never all-identical.",
      "Repair the spikes (TODO 1): places = np.flatnonzero(spike); rows, cols = np.unravel_index(places, loads.shape); then np.put(repaired, places, normal_max[rows]). Remember put edits in place and returns None.",
      "Rebuild the dead row (TODO 2): healthy = np.flatnonzero(~dead); fleet = repaired[healthy].mean(axis=0); repaired[dead] = fleet. The fancy row assignment writes all twelve hours at once.",
      "Rank and report (TODOs 3-5): order = sorted(range(6), key=lambda s: -problems[s]); print repaired[order]; then print np.array_equal(repaired[order], np.take(repaired, order, axis=0)).",
      "Label (TODO 6): labels = np.select([repaired < 30, repaired < 50], [\"low\", \"normal\"], default=\"high\"]); print labels[order] so the worst server's labels sit on top.",
      "Finish the audit (TODO 7): print each problem server's raw row and repaired row. Then run the whole pipeline top to bottom once and read it as a report: raw loads, problems found, repairs, ranked grid, labels, before/after.",
    ],
    starter: `import numpy as np

# --- the night shift's raw data: a deterministic formula + two known problems
hours = np.arange(12)                          # hour 0 .. hour 11 of the shift
servers = np.arange(6)                         # six machines
loads = 20 + 6 * servers[:, np.newaxis] + (hours * 7) % 13
loads[2, [4, 5]] = [150, 140]                  # server 2 ran hot for two hours
loads[5, :] = 3                                # server 5's sensor flatlined

print("raw loads (6 servers x 12 hours):")
print(loads)

# --- 1. detect the problems (no loops) ---------------------------------
normal_max = 33 + 6 * servers                  # each server's normal ceiling
spike = loads > normal_max[:, np.newaxis]      # column trick: per-server ceiling
flatline = loads == loads[:, :1]               # every cell vs its row's first reading
dead = np.count_nonzero(flatline, axis=1) == loads.shape[1]

print("spike cells per server:", np.count_nonzero(spike, axis=1))
print("dead server(s):", np.flatnonzero(dead))

# --- 2. repair, into a copy (raw stays raw) ----------------------------
repaired = loads.copy()

places = np.flatnonzero(spike)                 # flat places of the spikes
rows, cols = np.unravel_index(places, loads.shape)
print("spike coordinates -- rows:", rows, "cols:", cols)

# TODO 1: np.put the repairs -- write normal_max[rows] into repaired at places
# TODO 2: rebuild the dead server's row -- set repaired[dead] to the per-hour
#         mean of the HEALTHY rows (fancy-index them out first, then .mean(axis=0))

# --- 3. rank, label, and report ------------------------------------------
problems = np.count_nonzero(spike, axis=1) + loads.shape[1] * dead

# TODO 3: build order, the server indexes worst-problems-first (a plain
#         Python sorted() with a key is fine; Part G's argsort vectorizes it)
# TODO 4: print the report grid: repaired rows in order (fancy indexing)
# TODO 5: print whether np.take(repaired, order, axis=0) equals that report
# TODO 6: label with np.select -- "low" (< 30), "normal" (< 50), default
#         "high" -- and print the labeled report in ranked order
# TODO 7: print a before/after line for each problem server (2 and 5)
`,
    concepts: [
      "boolean masks",
      "np.count_nonzero with axis",
      "fancy indexing",
      "np.flatnonzero",
      "np.unravel_index",
      "np.put",
      "np.take",
      "np.select",
      "views vs copies",
      "np.newaxis column trick",
    ],
    extension:
      "Add a third problem type: a sensor that reads NEGATIVE loads (someone dropped a minus sign — set loads[4, 8] = -20). Detect the negative cells with a mask, clip them to 0, and make the ranking count all three problem types. Then ask yourself: does repair ORDER matter — spikes before dead rows, or the other way? Prove your answer by swapping the two repair steps and comparing the final grids with np.array_equal.",
  },
};
