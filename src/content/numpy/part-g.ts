/**
 * PART G — SORTING, SEARCHING AND SET LOGIC
 *
 * Ordering data, finding things fast, and asking membership questions —
 * without loops. The arc: the sort family (np.sort's copied results vs the
 * in-place method, argsort's index dance, lexsort's multi-key ties, and the
 * stability guarantees) -> buying exactly the order you need and nothing
 * more (partition / argpartition, the top-k idiom every leaderboard runs
 * on) -> the searching and set toolkit (where in both forms, the index
 * tuples of nonzero, binary search with searchsorted, unique with all four
 * of its answers, isin membership, and the intersect/union/difference
 * family).
 *
 * Every output field in this file is the REAL output produced by running
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

export const PART_G: NumpyPart = {
  letter: "G",
  title: "Sorting, Searching and Set Logic",
  tagline: "Ordering data, finding things fast, and asking membership questions — without loops",
  description:
    "Order data, find things fast, and ask membership questions — all without writing a loop. This part takes the sort family apart: np.sort's copied results versus the in-place a.sort(), argsort's index dance, lexsort's multi-key tie-breaking, and the kind= stability guarantees. Then it buys exactly the order you need and nothing more with partition and argpartition — the top-k idiom every leaderboard runs on. Finally comes the searching and set toolkit: np.where in both forms, the index tuples of nonzero, binary search with searchsorted, unique with all four of its answers, isin membership, and the intersect/union/difference family. Every output shown is machine-verified real.",
  lessons: [
    // ------------------------------------------------------------- g-01
    {
      slug: "g-01",
      title: "Sorting: sort, argsort and lexsort",
      minutes: 32,
      summary:
        "The whole sort family in one lesson: np.sort's copied results versus the in-place method, sorting along axes, descending tricks, argsort's index dance, lexsort's surprising last-key-first rule for ties, stability with kind=, and where NaNs land.",
      kind: "concept",
      objectives: [
        "Explain the difference between np.sort(a) (returns a sorted copy) and a.sort() (sorts in place, returns None), and prove which one happened with np.shares_memory",
        "Sort along any axis of a 2-D array, and produce descending order two ways (reversal and negation)",
        "Use argsort as the index dance: positions first, then gather, and explain why x[x.argsort()] equals np.sort(x)",
        "Sort by multiple keys with np.lexsort, remembering that the LAST key is primary — proven with a tie",
        "Choose kind='stable' when tied elements must keep their original order, and predict where NaNs land in a sort",
      ],
      why: "Almost every interesting question about data eventually needs order: who is first, what is the median, which readings are below the threshold, what is the rank of this player. Sorting is also the engine under two later tools — binary search (searchsorted in Lesson g-03) needs sorted data, and partition (Lesson g-02) is what you use when a full sort is more order than you want to pay for. Getting fluent in sort/argsort/lexsort now means the set-logic and leaderboard work later is assembly, not invention.",
      blocks: [
        {
          kind: "text",
          text: "You have been sorting things your whole life: books on a shelf, cards in a hand, search results by relevance. In data work, \"put this in order\" is half of all analysis — and NumPy's sort family is built for it. There is a function that sorts values (`np.sort`), a function that sorts *positions* (`np.argsort`), a function that sorts by *several keys at once* (`np.lexsort`), and a method that sorts the array *itself* (`a.sort()`). This lesson takes all four apart, proves what each one really does with runnable checks, and ends with the two quiet guarantees — stability and NaN placement — that decide whether your sorted output can be trusted.",
        },
        {
          kind: "heading",
          text: "np.sort returns a copy; a.sort() sorts in place",
        },
        {
          kind: "text",
          text: "The first surprise in the sort family is a copy question — the same question you met in Part D with views. `np.sort(a)` is a **function**: it hands you a brand-new, fully sorted array and leaves `a` untouched. `a.sort()` is a **method**: it rearranges the numbers inside `a` itself and returns `None`. One buys you safety (the original survives), the other buys you memory (no second array). Prove the difference the same way Part D proved views:",
        },
        {
          kind: "code",
          title: "The copy and the method, side by side",
          code: `import numpy as np

a = np.array([23, 5, 17, 90, 12])
s = np.sort(a)                    # FUNCTION: sorted copy, a untouched

print("np.sort(a) ->", s)
print("a itself   ->", a)
print("same memory?", np.shares_memory(a, s))

b = np.array([23, 5, 17, 90, 12])
returned = b.sort()               # METHOD: sorts b itself, returns None

print("after b.sort():", b)
print("b.sort() returns:", returned)
`,
          output: `np.sort(a) -> [ 5 12 17 23 90]
a itself   -> [23  5 17 90 12]
same memory? False
after b.sort(): [ 5 12 17 23 90]
b.sort() returns: None`,
          outputNote: "np.sort left a exactly as it was, and shares_memory is False — s is a fresh block. b.sort() reordered b in place and handed back None.",
          explain: [
            "`np.shares_memory(a, s)` is False — the sorted result lives in its own data block. That is what \"returns a copy\" means, measured rather than assumed.",
            "`b.sort()` returns None, exactly like list.sort() in plain Python. If you wrote `b = b.sort()` you would lose your array entirely — b would become None.",
            "Rule of thumb: keep the original for later? Use the function. Done with the original and memory matters? Use the method.",
          ],
        },
        {
          kind: "heading",
          text: "Sorting along axes",
        },
        {
          kind: "text",
          text: "On a 2-D array, sort needs to know which direction to order. The answer is the axis system from Part A: **axis 0 runs down the rows, axis 1 runs across the columns**, and the default `axis=-1` means *the last axis* — each row sorted left-to-right, independently. Sorting is one of those operations where saying the axis out loud first (\"sort each column\") prevents every bug:",
        },
        {
          kind: "code",
          title: "Rows sorted, then columns sorted",
          code: `import numpy as np

grid = np.array([[8, 4, 6],
                 [2, 9, 1]])

print("default (each row sorted):")
print(np.sort(grid))              # axis=-1: sort along each row

print("axis=0 (each column sorted):")
print(np.sort(grid, axis=0))      # sort down each column
`,
          output: `default (each row sorted):
[[4 6 8]
 [1 2 9]]
axis=0 (each column sorted):
[[2 4 1]
 [8 9 6]]`,
          outputNote: "The default keeps every row in its row and orders it; axis=0 keeps every value in its column and orders the column instead. Neither mixes values across the other direction.",
          explain: [
            "Default `axis=-1`: row 0 becomes [4, 6, 8], row 1 becomes [1, 2, 9]. Each row is its own little sorted array.",
            "`axis=0`: column 0 becomes [2, 8], column 1 becomes [4, 9], column 2 becomes [1, 6]. Values move only within their column.",
            "`axis=None` is the third choice: flatten everything, sort once, return a 1-D array. Useful when you want the global order of a whole table.",
          ],
        },
        {
          kind: "text",
          text: "Two small guarantees worth knowing before you go further. First, numeric order is just numeric order: **negative values come before positive ones automatically** — no absolute-value gymnastics needed. Second, NumPy sorts *ascending* only; there is no `descending=True`. Descending is a one-liner you build yourself, and there are exactly two good ways:",
        },
        {
          kind: "code",
          title: "Negatives, and descending two ways",
          code: `import numpy as np

x = np.array([3, -7, 2, -1, 5])

print("ascending (negatives first):", np.sort(x))
print("descending, by reversal    :", np.sort(x)[::-1])
print("descending, by negation    :", -np.sort(-x))

# A different question: order by MAGNITUDE (distance from zero)
m = np.array([-10, 3, -2, 7])
print("by magnitude:", np.sort(np.abs(m)))
`,
          output: `ascending (negatives first): [-7 -1  2  3  5]
descending, by reversal    : [ 5  3  2 -1 -7]
descending, by negation    : [ 5  3  2 -1 -7]
by magnitude: [ 2  3  7 10]`,
          outputNote: "Both descending tricks print the same array here. The magnitude line sorts -10, 3, -2, 7 by |value|: -2, 3, 7, -10.",
          explain: [
            "`np.sort(x)[::-1]` — sort ascending, then reverse with the Part D negative-step slice. Free, works on any dtype (strings too), but drags NaNs to the FRONT (see the NaN block below).",
            "`-np.sort(-x)` — negate, sort ascending, negate back. Numbers only, but the sign trick keeps NaNs at the end, and it composes with argsort: `(-x).argsort()` ranks biggest-first.",
            "`np.sort(np.abs(m))` — the magnitude question is a DIFFERENT question: transform the sort key (np.abs), sort the transformed values. Sorting keys, rather than the values themselves, is the door to lexsort.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.sort",
          purpose: "Return a sorted copy of an array, along any axis, with a selectable algorithm.",
          signature: "np.sort(a, axis=-1, kind=None, order=None)",
          purposeDetail:
            "`np.sort` is the function form of sorting: the input is never touched and you receive a fully ordered copy. It is the tool whenever you still need the original — comparisons, re-sorting by a different key, or simply not destroying your data. The kind= switch (stable sorts) and the axis= switch (sort each row, each column, or the flattened array) cover almost every ordering question; the in-place `a.sort()` method is the memory-saving sibling for when the original order is worthless to you.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array to sort. Any dtype: numbers, strings, even NaN (which always lands at the end).",
              example: "[23, 5, 17, 90, 12]",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Which axis to sort along. Default -1 (the last axis: each row of a 2-D array, independently). axis=0 sorts down the columns; axis=None flattens first and returns a 1-D sorted array.",
              example: "axis=0",
            },
            {
              name: "kind",
              type: "\"quicksort\", \"mergesort\", \"heapsort\", or \"stable\"",
              description: "The algorithm. Default \"quicksort\" (an introsort; fast, NOT stable). \"stable\" (and its alias \"mergesort\") guarantees tied elements keep their original relative order.",
              example: 'kind="stable"',
            },
            {
              name: "order",
              type: "str or list of str",
              description: "For arrays with named fields (structured arrays): which fields to compare, in which priority. Rare; lexsort covers most multi-key needs on plain arrays.",
              example: 'order="score"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array of the same shape and dtype (or 1-D when axis=None), fully sorted along the requested axis. The input is untouched.",
          },
          example: `import numpy as np

a = np.array([23, 5, 17, 90, 12])
print(np.sort(a))
print(np.sort(a)[::-1])              # descending: sort, then reverse

grid = np.array([[8, 4, 6],
                 [2, 9, 1]])
print(np.sort(grid, axis=0))         # sort each column
`,
          exampleOutput: `[ 5 12 17 23 90]
[90 23 17 12  5]
[[2 4 1]
 [8 9 6]]`,
          commonMistakes: [
            {
              mistake: "Expecting np.sort(a) to change a.",
              why: "The function returns a sorted COPY; the original array is untouched. Assigning nothing means the sorted result silently evaporates.",
              fix: "Capture the result: `s = np.sort(a)`. Only the method — `a.sort()` — reorders the array itself.",
            },
            {
              mistake: "Writing b = b.sort() and wondering why b became None.",
              why: "The in-place method sorts b and returns None, so the assignment throws away the array you just sorted.",
              fix: "Call `b.sort()` on its own line, or use `b = np.sort(b)` if you prefer the function form.",
            },
            {
              mistake: "Sorting axis=0 when you meant each row sorted (or the reverse).",
              why: "axis=0 orders down the columns; the default (-1, the last axis) orders along each row. Half of all sort bugs on grids are this swap.",
              fix: "Say the sentence before the call — \"sort each COLUMN\" is axis=0 — and check the result shape: sorting never changes the shape, only the order within each line.",
            },
          ],
          related: [
            { name: "a.sort()", relation: "The in-place method: same arguments, sorts the array itself, returns None — use it when the original order is disposable." },
            { name: "np.argsort", relation: "Returns the POSITIONS that would sort, so you can reorder a parallel array (names by score) — sorting values is not enough for that." },
            { name: "np.lexsort", relation: "Sorts by several keys at once with tie-breaking; np.sort only knows one key." },
            { name: "np.partition", relation: "Buys only the k-th position's correctness in O(n) instead of fully ordering in O(n log n) — Lesson g-02." },
          ],
          applications: [
            "Preparing data for binary search (np.searchsorted requires sorted input — Lesson g-03)",
            "Computing order statistics honestly: medians, percentiles, the 90th-best score",
            "Rank displays: sort once, then read off the podium and the cutoffs",
          ],
          notes:
            "The kind names are polite fictions: \"quicksort\" is an introsort, \"mergesort\" and \"stable\" both route to timsort or radix sort depending on dtype. What matters is the STABILITY contract, not the label.",
        },
        {
          kind: "heading",
          text: "argsort: the index dance",
        },
        {
          kind: "text",
          text: "Sorting *values* answers \"what is the order of these numbers?\" But the question you usually have is richer: **\"in what order do I visit these numbers — and what happens to the names attached to them?\"** That is `np.argsort`: it returns the **positions** that would sort the array. The dance has two steps — argsort gives you the order, then fancy indexing (Lesson d-05) gathers with it:",
        },
        {
          kind: "code",
          title: "Positions first, values second",
          code: `import numpy as np

scores = np.array([70, 90, 70, 85, 90, 60])
order = np.argsort(scores)

print("argsort ->", order)          # positions, smallest-value-first
print("gather  ->", scores[order])  # visit scores at those positions

# The identity at the heart of the dance:
print("equals np.sort?", np.array_equal(scores[order], np.sort(scores)))
`,
          output: `argsort -> [5 0 2 3 1 4]
gather  -> [60 70 70 85 90 90]
equals np.sort? True`,
          outputNote: "order starts with 5 — position 5 holds 60, the smallest. Gathering scores at those positions yields [60, 70, 70, 85, 90, 90], exactly np.sort(scores).",
          explain: [
            "`order` is a list of positions in visit order: position 5 first (its 60 is the smallest), then position 0 (70), then position 2 (the other 70), and so on.",
            "`scores[order]` — fancy indexing with the argsort result IS sorting. Same values, but now you can do the same gather on any parallel array: `names[order]` puts the names in score order.",
            "The array_equal check is the proof: sorting is just gathering by the argsort order. Nothing more mysterious than that.",
          ],
        },
        {
          kind: "arrayViz",
          title: "argsort visits positions, not values",
          mode: "slice",
          name: "a",
          caption:
            "Step through the selections in order. First: argsort(a) itself — watch the highlights walk the cells in sorted-VALUE order, but read the POSITION labels underneath: 1, then 3, then 2, then 0. argsort returns those positions. Second: the gather a[np.argsort(a)] — same cells, and the values come out sorted. Third: only the first two positions of the visit order — the two smallest, found without ever sorting the whole array (a preview of argpartition in the next lesson).",
          data: [40, 10, 30, 20],
          selections: [
            {
              expr: "np.argsort(a)",
              cells: [[0, 1], [0, 3], [0, 2], [0, 0]],
              note: "The visit order: position 1 (value 10) first, then position 3 (20), then 2 (30), then 0 (40). argsort returns [1, 3, 2, 0] — positions.",
            },
            {
              expr: "a[np.argsort(a)]",
              cells: [[0, 1], [0, 3], [0, 2], [0, 0]],
              note: "Gather a at those positions and the values come out [10, 20, 30, 40]. The index dance: argsort, then fancy-index.",
            },
            {
              expr: "a[np.argsort(a)[:2]]",
              cells: [[0, 1], [0, 3]],
              note: "The two smallest live at positions 1 and 3. Visit order gives you top-k for free — but the next lesson shows a cheaper tool when k is all you need.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Asking for an axis that is not there",
          text: "Sorting a 2-D grid along axis 2 sounds harmless and fails loudly: rows are axis 0, columns are axis 1, and there is no third direction. Read the error name — AxisError is NumPy telling you the geometry is wrong, not the values.",
        },
        {
          kind: "code",
          title: "Crash course: axis 2 on a 2-D array",
          code: `import numpy as np

grid = np.array([[8, 4, 6],
                 [2, 9, 1]])

# A 2-D array has axes 0 and 1 only. There is no axis 2.
print(np.sort(grid, axis=2))
`,
          expectError: "numpy.exceptions.AxisError: axis 2 is out of bounds for array of dimension 2",
          explain: [
            "The message names both numbers you need: axis 2 was requested, dimension 2 is what exists (axes 0 and 1).",
            "The same error shape greets you from any axis-aware function — sum, mean, partition — so this one crash teaches them all.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.argsort",
          purpose: "Return the positions (indices) that would sort an array — the visit order, not the values.",
          signature: "np.argsort(a, axis=-1, kind=None, order=None)",
          purposeDetail:
            "`np.argsort` is the indirect sort: instead of handing you sorted values, it hands you the order to visit the array in so the values come out sorted. That indirection is the point — with the visit order in hand you can reorder ANY parallel array the same way (names by score, rows by their total, products by price). The identity `a[np.argsort(a)] == np.sort(a)` is the whole idea; kind= matters here too, because a stable argsort keeps tied elements in original order.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array whose visit order you want.",
              example: "[70, 90, 70, 85, 90, 60]",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Axis to sort along; default -1 (last axis). axis=None flattens first and returns one visit order for the whole array.",
              example: "axis=None",
            },
            {
              name: "kind",
              type: "\"quicksort\", \"mergesort\", \"heapsort\", or \"stable\"",
              description: "Algorithm for the underlying sort. Use kind=\"stable\" when tied values must keep their original relative order in the visit order.",
              example: 'kind="stable"',
            },
            {
              name: "order",
              type: "str or list of str",
              description: "Field priority for structured arrays — the structured cousin of lexsort.",
              example: 'order="score"',
            },
          ],
          returns: {
            type: "ndarray of int",
            description: "An integer array the same shape as a: each element of a, replaced by the position it must be visited from, in sorted order. a[np.argsort(a)] is the sorted array.",
          },
          example: `import numpy as np

scores = np.array([70, 90, 70, 85, 90, 60])
order = np.argsort(scores)

print(order)                 # positions, smallest first
print(scores[order])         # the gather: sorted values
print(order[0], order[-1])   # positions of the min and the max
`,
          exampleOutput: `[5 0 2 3 1 4]
[60 70 70 85 90 90]
5 4`,
          commonMistakes: [
            {
              mistake: "Reading argsort's output as sorted values.",
              why: "argsort returns positions into the ORIGINAL array. On [70, 90, 70...] the first output is 5 — a position, not a score. Beginners print it next to scores and see numbers in a plausible range, so the bug hides.",
              fix: "Always finish the dance: gather with `scores[order]`. If the printed array still holds values from the original range, you forgot the gather.",
            },
            {
              mistake: "Expecting ties to come out in a predictable order with the default kind.",
              why: "Default quicksort is not stable: two equal values can be visited in either order, so the NAMES you gather afterwards can swap between runs or NumPy builds.",
              fix: "Pass kind=\"stable\" whenever ties exist and the tie order matters (leaderboards, dedup reports).",
            },
            {
              mistake: "Using argsort when you only needed the max or min position.",
              why: "argsort fully orders everything to answer a one-position question — O(n log n) for what argmax does in O(n).",
              fix: "One extreme? np.argmax / np.argmin. Top-k? Lesson g-02's argpartition. Full order needed anyway? Then argsort is right.",
            },
          ],
          related: [
            { name: "np.sort", relation: "The values version: sorted values directly, when you have no parallel array to reorder." },
            { name: "np.lexsort", relation: "The multi-key version: a visit order decided by several keys with tie-breaking." },
            { name: "np.argpartition", relation: "The top-k version: only the k first visits are guaranteed, at O(n) cost (Lesson g-02)." },
            { name: "np.argmax", relation: "The single-position special case: just the position of the largest." },
          ],
          applications: [
            "Reordering parallel arrays together: names by score, rows by a total column, dates by readings",
            "Ranking: (-scores).argsort() gives biggest-first ranking; argsort().argsort() gives each element's rank",
            "Gathering top-k entries cheaply before sorting just those (the leaderboard idiom of Lesson g-02)",
          ],
          notes:
            "The classic rank recipe, worth pinning: rank = scores.argsort().argsort() — apply argsort twice and each element is replaced by its 0-based rank among the sorted values.",
        },
        {
          kind: "heading",
          text: "lexsort: sorting by several keys (last key first!)",
        },
        {
          kind: "text",
          text: "Real orderings are rarely one key. A leaderboard sorts by score, but when two players tie on score you fall back to level, then to name. `np.lexsort` answers exactly this — and it has the single most surprising argument convention in NumPy: you pass the keys as a tuple, and **the LAST key is the primary one**. Read the tuple right-to-left: primary key last, tie-breakers before it. Prove it with a tie in hand:",
        },
        {
          kind: "code",
          title: "Score first, name to break the tie",
          code: `import numpy as np

names = np.array(["dee", "ben", "ana", "cy"])
scores = np.array([90, 70, 90, 70])

# LAST key is primary: scores lead, names only break ties.
by_score = np.lexsort((names, scores))
print("order  ->", by_score)
print("names  ->", names[by_score])
print("scores ->", scores[by_score])

# Swap the tuple and the priority swaps: names would lead.
by_name = np.lexsort((scores, names))
print("if names were primary ->", names[by_name])
`,
          output: `order  -> [1 3 2 0]
names  -> ['ben' 'cy' 'ana' 'dee']
scores -> [70 70 90 90]
if names were primary -> ['ana' 'ben' 'cy' 'dee']`,
          outputNote: "With scores primary, the two 70s come first — ben before cy, alphabetically — then the two 90s: ana before dee. The tie-break visibly fired twice.",
          explain: [
            "`by_score` is [1, 3, 2, 0]: ben (70), cy (70), ana (90), dee (90). The scores decided the groups; the names ordered inside each group.",
            "The tie-break is the proof of the convention: ben and cy both hold 70 and arrive alphabetically. If the FIRST key were primary (a common wrong guess), names would lead and the output would be ana, ben, cy, dee regardless of scores — which is exactly what the second call shows.",
            "Descending on a numeric key: negate the key inside the tuple, (-scores here). Strings cannot be negated — sort the negated numeric keys as primary and keep strings as later tie-breakers.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.lexsort",
          purpose: "Sort by several keys at once, with later keys breaking the ties of earlier ones.",
          signature: "np.lexsort(keys, axis=-1)",
          purposeDetail:
            "`np.lexsort` is the multi-key, indirect sort: it returns the visit order (indices) that would sort by the LAST key first, then the second-to-last for ties, and so on — think of reading the tuple right-to-left, most important key last. Because it returns indices, one lexsort can reorder every parallel array in a dataset consistently. It is the tool for leaderboards with tie-breakers, sorting rows by one column with a fallback column, and any ordering too subtle for a single key.",
          params: [
            {
              name: "keys",
              type: "tuple (or list) of array_like",
              required: true,
              description: "The keys to sort by, LAST key primary. All keys must be sortable and broadcast to a common shape; negate numeric keys for descending priority.",
              example: "(names, scores)  # scores primary, names break ties",
            },
            {
              name: "axis",
              type: "int",
              description: "Which axis of the keys to sort along; -1 (the last) is what you want for plain 1-D keys.",
              example: "axis=-1",
            },
          ],
          returns: {
            type: "ndarray of int",
            description: "The visit order: an integer index array. Gather any (or all) of the key arrays with it to see the sorted result.",
          },
          example: `import numpy as np

names = np.array(["cy", "ana", "eli", "ben"])
scores = np.array([90, 70, 90, 70])

order = np.lexsort((names, scores))   # scores primary, names break ties
print(names[order])
print(scores[order])
`,
          exampleOutput: `['ana' 'ben' 'cy' 'eli']
[70 70 90 90]`,
          commonMistakes: [
            {
              mistake: "Passing the keys in priority order — assuming the FIRST key is primary.",
              why: "It reads naturally, but lexsort sorts by the last key first. With (names, scores), names become the tie-breaker and scores decide — the exact opposite of the intent.",
              fix: "Write the tuple backwards: primary key LAST. Keep a tie in your test data so a wrong order is visible immediately.",
            },
            {
              mistake: "Forgetting that lexsort returns indices, not values.",
              why: "Same indirection as argsort — the output is a visit order. Printing it looks like sorted values when the data happens to be small integers.",
              fix: "Finish with the gather: names[order], scores[order].",
            },
            {
              mistake: "Trying to negate string keys for descending order.",
              why: "-names is a TypeError; only numbers negate. Mixed ascending/descending priorities need a different construction per key.",
              fix: "Negate numeric keys only. For a descending STRING key, sort by that key alone and reverse the resulting order — or map the strings to ranks first with np.unique's inverse.",
            },
          ],
          related: [
            { name: "np.argsort", relation: "The single-key version: one key, one visit order — lexsort with a tuple of one." },
            { name: "np.sort", relation: "Sorts values directly; no tie-breaking, no parallel arrays." },
            { name: "np.unique", relation: "Gives each distinct value a rank — handy for turning strings into negatable numeric keys (Lesson g-03)." },
          ],
          applications: [
            "Leaderboards and league tables: score desc, then level desc, then name asc",
            "Sorting table rows by a primary column with a fallback column for ties",
            "Multi-criteria ordering in reports: region, then seniority, then salary",
          ],
          notes:
            "lexsort is stable per key, so with all-equal primary keys the earlier keys alone decide the order. For a fully deterministic leaderboard with many ties, end the tuple with np.arange(n) — the original position as the final tie-breaker.",
        },
        {
          kind: "heading",
          text: "kind=: choosing (and proving) stability",
        },
        {
          kind: "text",
          text: "When an array holds **duplicates**, a sort faces a choice it never advertises: which copy of the tied value goes first? A **stable sort** keeps tied elements in their original order — element at position 0 before element at position 5, always. NumPy's default (\"quicksort\", really an introsort) makes *no promise*: ties may come out in any order. \"Stable\" and its old alias \"mergesort\" are the ones that promise. The difference is invisible on bare numbers (two 70s look identical) — but the moment you gather a parallel array with the same visit order, an unstable sort can silently swap your rows. Watch it happen:",
        },
        {
          kind: "code",
          title: "Twenty values, three groups, two algorithms",
          code: `import numpy as np

vals = np.array([2, 1, 2, 1, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 3, 1, 2, 1, 3, 2])

order_quick = vals.argsort()                 # default kind
order_stable = vals.argsort(kind="stable")

# The 2s originally live at positions 0, 2, 6, 9, 12, 16, 19 (in order).
twos_quick = order_quick[vals[order_quick] == 2]
twos_stable = order_stable[vals[order_stable] == 2]
print("2s visited, quicksort:", twos_quick)
print("2s visited, stable   :", twos_stable)
print("stable keeps original order:", np.array_equal(twos_stable, np.sort(twos_stable)))
print("quicksort did        :", np.array_equal(twos_quick, np.sort(twos_quick)))
`,
          output: `2s visited, quicksort: [ 2 12  9  6  0 16 19]
2s visited, stable   : [ 0  2  6  9 12 16 19]
stable keeps original order: True
quicksort did        : False`,
          outputNote: "The stable visit order lists the 2s exactly where they started: 0, 2, 6, 9, 12, 16, 19. The quicksort visit scrambles them — same values, different rows gathered.",
          explain: [
            "`twos_stable` is [0, 2, 6, 9, 12, 16, 19] — strictly increasing, i.e. the original order. The stability contract, verified rather than trusted.",
            "`twos_quick` is NOT increasing: the default sort visited the tied 2s in a scrambled order. On values alone you could not tell; on positions (and on any parallel array) you absolutely can.",
            "Rule: ties present AND parallel data being gathered — pass kind=\"stable\". It costs little and turns an intermittent bug into a guarantee.",
          ],
        },
        {
          kind: "text",
          text: "One more quiet guarantee: **NaNs always sort to the END** of an ascending sort. NumPy defines every comparison with NaN as false, so the sort politely parks NaNs after all real values instead of crashing (Part I meets NaN handling properly). The trap is the reversal trick: `np.sort(x)[::-1]` flips the NaNs to the FRONT. The negation trick keeps them at the end, which is usually what you want:",
        },
        {
          kind: "code",
          title: "Where NaNs land",
          code: `import numpy as np

w = np.array([3.0, np.nan, 1.0, np.nan, 2.0])

print("ascending        :", np.sort(w))
print("reversed         :", np.sort(w)[::-1])   # NaNs dragged to the front
print("negation trick   :", -np.sort(-w))       # NaNs stay at the end

print("nan to a sentinel:", np.nan_to_num(np.sort(w), nan=-1.0))
`,
          output: `ascending        : [ 1.  2.  3. nan nan]
reversed         : [nan nan  3.  2.  1.]
negation trick   : [ 3.  2.  1. nan nan]
nan to a sentinel: [ 1.  2.  3. -1. -1.]`,
          outputNote: "Ascending puts the two NaNs last. Reversal brings them to the front; negating the key keeps them at the back while the real values go descending.",
          explain: [
            "`np.sort(w)` — real values ascending first, then nan nan. No error, no warning: NaNs are just parked.",
            "`[::-1]` — descending by reversal moves the NaNs to the front, which poisons any top-k you slice off the start.",
            "`-np.sort(-w)` — the sign trick sorts descending while NaNs stay at the end. For display or file export, np.nan_to_num swaps NaN for a sentinel you choose.",
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "np.sort: function, sorted copy. a.sort(): method, sorts in place, returns None. argsort: the visit order — positions, then gather. lexsort: several keys, LAST key primary. kind=\"stable\" when ties must keep their original order. NaNs park at the end of an ascending sort — and at the FRONT if you reverse it.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Where this is going",
          text: "A full sort answers questions you may not have asked: you paid for the order of all n values to learn one number. Lesson g-02 introduces partition — the tool that guarantees only the position you actually care about, in O(n). And Lesson g-03's searchsorted requires the sorted data you now know how to make (and to keep).",
        },
        {
          kind: "tryIt",
          title: "Sort gym: four moves on one dataset",
          task: "Run this, then: (1) change 3.0 to 4.0 in the magnitude line and predict the new order BEFORE rerunning; (2) produce descending order with the negation trick instead of the slice; (3) make a copy of readings, sort IT in place with .sort(), and print both to see which one changed; (4) add a duplicate value (change 2.1 to 4.1) and compare argsort with and without kind=\"stable\".",
          code: `import numpy as np

readings = np.array([4.1, 2.7, 3.9, 1.8, 4.4, 2.1])

print("sorted ascending :", np.sort(readings))
print("sorted descending:", np.sort(readings)[::-1])
print("by distance from 3.0:", np.sort(np.abs(readings - 3.0)))
`,
          hint: "The magnitude line answers a different question: it sorts np.abs(readings - 3.0), a transformed key — closest-to-3 first. The in-place move is readings.copy().sort() — but call it on its own line, the method returns None.",
        },
      ],
      terms: [
        { term: "In-place sort", definition: "a.sort(): rearranges the array's own data block, returns None, and destroys the original order. The memory-saving sibling of np.sort." },
        { term: "Indirect sort (argsort)", definition: "A sort that returns positions (the visit order) instead of values; gathering the original array by those positions yields the sorted values." },
        { term: "Lexicographic sort (lexsort)", definition: "Sorting by several keys with a strict priority: the last key decides, earlier keys break its ties — read the keys tuple right-to-left." },
        { term: "Stable sort", definition: "A sort where tied elements keep their original relative order. kind=\"stable\" guarantees it; the default quicksort does not." },
        { term: "Sort key", definition: "The array actually being ordered — the values, or a transformation of them (np.abs(x), -x) — as distinct from the array you gather afterwards." },
      ],
      mistakes: [
        {
          mistake: "Calling np.sort(a) and expecting a to be sorted afterwards.",
          why: "np.sort returns a sorted copy; the original is untouched. The code runs fine, prints fine, and the sorted result is silently discarded.",
          fix: "Capture the return value (s = np.sort(a)), or deliberately choose the in-place method a.sort() when the original order is disposable.",
        },
        {
          mistake: "Printing argsort's output and reading it as sorted values.",
          why: "argsort returns positions into the original array. With small integers the numbers look plausible either way, so the misreading survives until a parallel array comes out scrambled.",
          fix: "Always finish the index dance with the gather — x[x.argsort()] — and keep a tie in your test data so wrong orders are visible.",
        },
        {
          mistake: "Passing lexsort keys in priority order (first key primary).",
          why: "lexsort reads the tuple right-to-left: the LAST key is primary. (names, scores) sorts by scores; (scores, names) sorts by names.",
          fix: "Write the tuple backwards from how you would say it: \"sort by score, tie-break by name\" becomes np.lexsort((names, scores)).",
        },
        {
          mistake: "Making a descending order with [::-1] on data that contains NaNs, then slicing the top rows.",
          why: "Ascending sorts park NaNs at the end; reversing drags them to the front, so your \"top\" rows are all NaN.",
          fix: "Use the negation trick for numeric data (-np.sort(-x) keeps NaNs at the end), or replace NaNs with np.nan_to_num before sorting.",
        },
      ],
      takeaways: [
        "np.sort returns a sorted COPY (shares_memory is False); a.sort() sorts in place and returns None — pick deliberately.",
        "axis=-1 sorts each row; axis=0 sorts down each column; axis=None flattens and sorts everything. Sorting never changes shape.",
        "Descending is a construction: np.sort(x)[::-1] (any dtype, NaNs to the front) or -np.sort(-x) (numbers, NaNs stay at the end).",
        "argsort returns the visit order — positions; the gather x[x.argsort()] is what produces sorted values, and it reorders parallel arrays too.",
        "lexsort's LAST key is primary; prove the tie-break with real duplicates. kind=\"stable\" keeps tied elements in original order; NaNs always land at the end of an ascending sort.",
      ],
      quiz: [
        {
          id: "g-01-q1",
          prompt: "`a = np.array([5, 1, 3])` and `s = np.sort(a)`. After these two lines, what is `a`?",
          options: [
            { text: "[1, 3, 5] — np.sort sorts the array it is given", correct: false, feedback: "That is s. np.sort returns a copy; a keeps its original order." },
            { text: "[5, 1, 3] — unchanged, because np.sort returns a sorted copy", correct: true, feedback: "Correct — and np.shares_memory(a, s) would be False: two different data blocks." },
            { text: "[1, 5, 3] — partially sorted as a side effect", correct: false, feedback: "No side effect exists: the function never writes to the input's block." },
            { text: "None — you must assign the result back to a", correct: false, feedback: "Assigning s is how you keep the result, but a itself is never destroyed or altered." },
          ],
          explanation: "np.sort is the function form: sorted copy out, original untouched. Only the method form a.sort() reorders a itself.",
        },
        {
          id: "g-01-q2",
          prompt: "`x = np.array([20, 40, 10, 30])`. What is `x[x.argsort()]`?",
          options: [
            { text: "[10, 20, 30, 40]", correct: true, feedback: "The index dance: argsort gives the visit order [2, 3, 0, 1], and gathering x at those positions yields the sorted values." },
            { text: "[2, 3, 0, 1]", correct: false, feedback: "That is argsort itself — the positions. You still need the gather to see values." },
            { text: "[20, 40, 10, 30]", correct: false, feedback: "That is x — nothing would have been gathered. x[np.arange(4)] would produce this." },
            { text: "It raises an error — you cannot index with argsort's result", correct: false, feedback: "You can: argsort's output is an integer index array, exactly what fancy indexing accepts." },
          ],
          explanation: "x[x.argsort()] is the identity of this lesson: gathering by the visit order is what sorting is.",
        },
        {
          id: "g-01-q3",
          prompt: "`np.lexsort((names, scores))` was just called. Which key decided the order?",
          options: [
            { text: "names — the first key is primary", correct: false, feedback: "The intuitive guess, and wrong: lexsort reads the tuple right-to-left." },
            { text: "scores — the LAST key is primary, earlier keys only break ties", correct: true, feedback: "Correct: scores decide, names order the players inside each tied group." },
            { text: "Both equally — ties are impossible", correct: false, feedback: "lexsort exists precisely because one key leaves ties; the keys are prioritized, not merged." },
            { text: "Whichever array is shorter", correct: false, feedback: "Shape has nothing to do with it; all keys must broadcast to a common shape anyway." },
          ],
          explanation: "The LAST key is primary — the convention to memorize. Say the sentence, then write the tuple backwards.",
        },
      ],
    },

    // ------------------------------------------------------------- g-02
    {
      slug: "g-02",
      title: "Partial Order: partition and argpartition",
      minutes: 28,
      summary:
        "Buy only the order you need: partition guarantees one position (or several) in O(n) without sorting anything else — and argpartition turns that into the top-k idiom, the O(n) median idea, and the nearest-neighbors pattern.",
      kind: "concept",
      objectives: [
        "State np.partition's exact contract: the k-th smallest value lands at position kth, everything smaller sits somewhere left, everything larger somewhere right — with NO ordering promised within the sides",
        "Use np.argpartition plus a small sort to build the top-k idiom (find k, then order just those k)",
        "Explain why finding a median (or any single order statistic) can be done in O(n) with partition instead of O(n log n) with a full sort",
        "Apply the nearest-k pattern: broadcast distances, argpartition the k nearest, gather, then order just those k",
      ],
      why: "Full sorting is a luxury. When a million players compete and you only need a podium of three, sorting all million entries — O(n log n) time and a full sorted copy in memory — pays for 999,997 answers you will never read. Partition is the algorithm family that guarantees only the position you asked about and nothing else, in roughly linear time: the k-th smallest lands exactly where it belongs, the sides are merely split around it. That one idea powers leaderboards, top-k recommendations, nearest-neighbor lookups, and even the O(n) median — and it composes with g-01's sort for the final polish on the few entries that matter.",
      blocks: [
        {
          kind: "text",
          text: "Here is a question that sounds like it needs a sort but does not: *who are the top three?* You do not need to know whether player 412 finished ahead of player 413 — you need three names. Every millisecond of work spent ordering the middle of the pack is wasted. `np.partition` is NumPy's answer from the *selection algorithm* family: instead of fully ordering the array, it guarantees **one position exactly** and merely splits the rest into \"smaller things\" and \"larger things\". This lesson learns the contract, then builds the two idioms built on it — the top-k and the nearest-k — and shows why even a median is cheaper than a sort.",
        },
        {
          kind: "heading",
          text: "np.partition: one guaranteed position, chaos around it",
        },
        {
          kind: "text",
          text: "The contract, precisely: after `p = np.partition(a, kth)`, position `kth` of `p` holds the value that would sit there if `a` were fully sorted (the (kth+1)-th smallest). Everything smaller than that value lives *somewhere* to the left; everything larger *somewhere* to the right. **Nothing else is promised — and the sides are usually NOT sorted.** Verify the promises you actually bought, never the ones you did not:",
        },
        {
          kind: "code",
          title: "The contract, checked rather than assumed",
          code: `import numpy as np

prices = np.array([42, 7, 89, 15, 63, 28, 91, 3, 56])
p = np.partition(prices, 3)

print("partitioned:", p)
print("position 3 holds:", p[3])
print("left side all <= pivot :", np.all(p[:3] <= p[3]))
print("right side all >= pivot:", np.all(p[4:] >= p[3]))
`,
          output: `partitioned: [ 3  7 15 28 42 56 63 89 91]
position 3 holds: 28
left side all <= pivot : True
right side all >= pivot: True`,
          outputNote: "Position 3 holds 28 — the fourth-smallest price, exactly where a full sort would put it. Both side checks pass: everything left of the pivot is smaller, everything right is larger.",
          explain: [
            "`p[3]` is 28: the 4th smallest of the nine prices. If you had sorted, position 3 would hold 28 too — that single position is what partition guarantees.",
            "The two np.all checks are the rest of the contract, proven: smaller-left, larger-right.",
            "On nine numbers the sides happened to come out already ordered — that is luck, not law. The next block shows the same call where the disorder is visible.",
          ],
        },
        {
          kind: "text",
          text: "One more power worth knowing immediately: `kth` can be a **sequence**. Ask for several positions at once and every one of them lands exactly right — a handy way to grab several thresholds in one pass. And this next example finally *shows* the chaos, because you can see a side that is provably not sorted:",
        },
        {
          kind: "code",
          title: "Several kth at once — and visible chaos",
          code: `import numpy as np

q = np.array([90, 61, 82, 2, 51, 19, 76, 85])
pq = np.partition(q, [2, 5])

print("partitioned:", pq)
print("position 2 (3rd smallest):", pq[2])
print("position 5 (6th smallest):", pq[5])
print("left of 2 all <= 51:", np.all(pq[:2] <= pq[2]))
print("right of 5 all >= 82:", np.all(pq[6:] >= pq[5]))
print("tail is sorted?", np.all(np.diff(pq[6:]) >= 0))
`,
          output: `partitioned: [ 2 19 51 61 76 82 90 85]
position 2 (3rd smallest): 51
position 5 (6th smallest): 82
left of 2 all <= 51: True
right of 5 all >= 82: True
tail is sorted? False`,
          outputNote: "Positions 2 and 5 hold 51 and 82 — the 3rd and 6th smallest, exactly as promised. But look at the tail: 90, 85. The right side is not sorted, and never needed to be.",
          explain: [
            "Positions 2 and 5 are exactly right: 51 and 82, matching what a full sort would place there. Two guarantees, one call.",
            "The between-pivots stretch [61, 76] is even accidentally ordered — small data is full of coincidences, which is exactly why you must never trust 'looks sorted'.",
            "The last check fails: the tail [90, 85] descends. This is the honest face of partition — the guarantee is about the pivot, never the sides.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The partitioned array, cell by cell",
          mode: "explore",
          name: "p",
          caption:
            "The partitioned array from the last block: [2, 19, 51, 61, 76, 82, 90, 85]. Click around and read the flat positions. Positions 2 and 5 (values 51 and 82) are the guarantees you paid for — exactly the 3rd and 6th smallest. Everything left of position 2 is <= 51, everything right of position 5 is >= 82, and the tail 90, 85 is the visible proof that the sides are chaos: correct by the contract, unordered by design.",
          data: [2, 19, 51, 61, 76, 82, 90, 85],
          dtype: "int64",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Sides are chaos — never call a partition sorted",
          text: "The single most common partition bug is treating the result like np.sort's output: slicing the first k and presenting them 'in order'. They are the k smallest — in NO particular order. If you need the k smallest in order, sort that slice afterwards (it has only k elements, so the sort is cheap). One line of insurance prevents a scrambled leaderboard.",
        },
        {
          kind: "functionDoc",
          name: "np.partition",
          purpose: "Guarantee that the k-th smallest value lands at position kth — with everything smaller somewhere left and larger somewhere right — without fully sorting.",
          signature: "np.partition(a, kth, axis=-1, kind='introselect', order=None)",
          purposeDetail:
            "`np.partition` is the selection-algorithm workhorse: it returns a copy where the element that belongs at position `kth` (by sorted order) is exactly there, the smaller elements are all before it, and the larger all after — in average O(n) time instead of a sort's O(n log n). The sides are deliberately left unordered; that laziness IS the speed. Use it whenever a question names one position (a maximum, a median, a percentile boundary) or a boundary between groups (top-k, cheapest-k), and reach for np.sort only when the order *within* the groups matters.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array to partition.",
              example: "[42, 7, 89, 15, 63, 28, 91, 3, 56]",
            },
            {
              name: "kth",
              type: "int or sequence of int",
              required: true,
              description: "The position (0-based) that must end up exact. Negative values count from the end (-1 = the maximum's slot). A sequence partitions several positions at once.",
              example: "3, -5, or [2, 5]",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Axis to partition along; default -1. axis=None flattens first and returns a 1-D result.",
              example: "axis=0",
            },
            {
              name: "kind",
              type: "\"introselect\"",
              description: "The selection algorithm. Currently only \"introselect\" exists — listed so the signature matches the docs.",
              example: 'kind="introselect"',
            },
            {
              name: "order",
              type: "str or list of str",
              description: "Field priority for structured arrays, as in np.sort.",
              example: 'order="score"',
            },
          ],
          returns: {
            type: "ndarray",
            description: "A partitioned COPY of a, same shape: position(s) kth exact, sides split around them but unordered within.",
          },
          example: `import numpy as np

prices = np.array([42, 7, 89, 15, 63, 28, 91, 3, 56])
p = np.partition(prices, 3)

print(p)                          # sides are unordered
print("4th smallest:", p[3])     # the one guaranteed position
print("three cheapest (ordered):", np.sort(p[:3]))
`,
          exampleOutput: `[ 3  7 15 28 42 56 63 89 91]
4th smallest: 28
three cheapest (ordered): [ 3  7 15]`,
          commonMistakes: [
            {
              mistake: "Slicing the first k of a partition and presenting them as 'the k smallest in order'.",
              why: "Partition guarantees WHICH elements are on each side, not their order. p[:3] are the three smallest — possibly scrambled.",
              fix: "Sort the slice you keep: np.sort(p[:k]). Sorting k elements costs almost nothing compared to the partition you already saved.",
            },
            {
              mistake: "Off-by-one on kth: asking for kth=4 to mean 'the 4th smallest'.",
              why: "Positions are 0-based: the 4th smallest lives at position 3. kth=4 delivers the 5th smallest — every rank off by one.",
              fix: "Say 'position', not 'rank': the 4th smallest sits at position 3. For the last slot use kth=-1 and skip the arithmetic entirely.",
            },
            {
              mistake: "Asking for a position the array does not have (kth = n, or kth = -n-1).",
              why: "There is no position n in an n-element array, and partition refuses to guess — ValueError, kth out of bounds.",
              fix: "Valid kth for n elements ranges from -n to n-1. Remember -1 is the maximum's position, the cheapest 'find the max' in NumPy.",
            },
          ],
          related: [
            { name: "np.sort", relation: "Fully orders everything at O(n log n); partition orders one position at O(n). Need the whole order? Sort. Need one rank or a boundary? Partition." },
            { name: "np.argpartition", relation: "The indices version: returns the POSITIONS of the boundary — the tool for top-k with parallel arrays (names, ids)." },
            { name: "np.median", relation: "Uses a selection algorithm under the hood for the very trick this lesson builds by hand." },
          ],
          applications: [
            "Top-k and bottom-k: leaderboards, best sellers, cheapest options — without sorting the long tail",
            "Order statistics in O(n): a median, a percentile boundary, the 90th-best score",
            "Threshold splits: separate the below-cutoff from the above-cutoff group in one pass",
          ],
          notes:
            "The introselect implementation may leave small arrays looking fully sorted — a happy accident of its final insertion-sort step, never a promise. Write the sort-the-slice line anyway; correctness by contract beats correctness by coincidence.",
        },
        {
          kind: "heading",
          text: "argpartition: the top-k idiom",
        },
        {
          kind: "text",
          text: "Just as sort has its indices twin, partition has `np.argpartition`: it returns the **positions** of a partition — so you can gather names, ids, whole rows, not just values. The classic use is the top-k: ask for the last k positions, gather, then sort only those k with the g-01 tools. Two lines, and the million-player leaderboard costs O(n) instead of O(n log n):",
        },
        {
          kind: "code",
          title: "Top-5 of ten scores, the two-line idiom",
          code: `import numpy as np

scores = np.array([72, 95, 88, 61, 79, 93, 55, 82, 98, 68])

# Step 1: the top-5 POSITIONS. -5 = the fifth slot from the end.
top5 = np.argpartition(scores, -5)[-5:]
print("top-5 positions (unordered):", top5)

# Step 2: sort JUST those five, best first (g-01's argsort).
top5 = top5[np.argsort(scores[top5])[::-1]]
print("top-5 positions (ordered)  :", top5)
print("the leaderboard            :", scores[top5])
`,
          output: `top-5 positions (unordered): [7 2 5 1 8]
top-5 positions (ordered)  : [8 1 5 2 7]
the leaderboard            : [98 95 93 88 82]`,
          outputNote: "The five positions arrive unordered — [7, 2, 5, 1, 8] — then the second line orders them: 98, 95, 93, 88, 82.",
          explain: [
            "`np.argpartition(scores, -5)` partitions the whole array so the 5 largest are split off to the end; `[-5:]` keeps their positions. Their internal order is not guaranteed (it often looks tidy on small data — do not rely on it).",
            "`np.argsort(scores[top5])[::-1]` sorts a 5-element array — trivially cheap — and reorders the positions to best-first. The gather then produces the podium.",
            "Scale intuition: with n = 10,000,000 and k = 5, this idiom touches the whole array once (O(n)) and sorts five elements. A full sort would order ten million values to throw away all but five.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.argpartition",
          purpose: "Return the positions a partition would move — the indices version of np.partition, and the heart of the top-k idiom.",
          signature: "np.argpartition(a, kth, axis=-1, kind='introselect', order=None)",
          purposeDetail:
            "`np.argpartition` performs an indirect partition: it returns indices such that gathering `a` by them puts the k-th smallest value's position at slot kth, with smaller elements' positions before it and larger after — sides unordered. Because the output is positions, it reorders parallel arrays: top-5 player names, top-k row indices, nearest neighbor ids. Paired with a tiny sort of the k kept positions, it is the standard top-k pattern from leaderboards to recommendation systems.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array whose values decide the boundary.",
              example: "[72, 95, 88, 61, 79, 93, 55, 82, 98, 68]",
            },
            {
              name: "kth",
              type: "int or sequence of int",
              required: true,
              description: "Position(s) that must be exact after the gather. For top-k, use -k: the last k slots then hold the k largest values' positions.",
              example: "-5",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Axis to partition along; default -1.",
              example: "axis=0",
            },
            {
              name: "kind",
              type: "\"introselect\"",
              description: "The selection algorithm (only \"introselect\" currently exists).",
              example: 'kind="introselect"',
            },
            {
              name: "order",
              type: "str or list of str",
              description: "Field priority for structured arrays.",
              example: 'order="score"',
            },
          ],
          returns: {
            type: "ndarray of int",
            description: "Indices the same shape as a: gathering a (or any parallel array) by them yields a partitioned array — boundary positions exact, sides split but unordered.",
          },
          example: `import numpy as np

scores = np.array([72, 95, 88, 61, 79, 93, 55, 82, 98, 68])

top5 = np.argpartition(scores, -5)[-5:]        # the top-5 positions
top5 = top5[np.argsort(scores[top5])[::-1]]    # order just those five
print(top5.tolist())
print(scores[top5].tolist())
`,
          exampleOutput: `[8, 1, 5, 2, 7]
[98, 95, 93, 88, 82]`,
          commonMistakes: [
            {
              mistake: "Forgetting the final sort and presenting top5 as 'the top 5, in order'.",
              why: "argpartition guarantees WHICH positions are in the slice, not their order. The podium can print scrambled — or accidentally sorted on small data, hiding the bug until production.",
              fix: "Always run the second line: sort the k kept positions by their values. It is O(k log k) — pocket change.",
            },
            {
              mistake: "Using kth = 5 to get the top 5.",
              why: "kth=5 fixes position 5 — a single boundary in the middle. The top 5 are the LAST 5 positions, i.e. kth=-5 then [-5:].",
              fix: "Top-k pattern: np.argpartition(a, -k)[-k:]. Bottom-k pattern: np.argpartition(a, k)[:k] — note the sign flip and the slice end.",
            },
            {
              mistake: "Gathering the wrong array with the returned positions.",
              why: "The indices refer to positions in the array you partitioned. Gathering a different-length array crashes; gathering a re-sorted copy silently scrambles the pairing.",
              fix: "Partition once, then gather every parallel array with the SAME index array before anything else reorders them.",
            },
          ],
          related: [
            { name: "np.partition", relation: "The values version — use it when you only need the values themselves, no parallel arrays to reorder." },
            { name: "np.argsort", relation: "The full-order sibling: guarantees every position, at O(n log n). Compose them — argpartition to cut, argsort to polish the cut." },
            { name: "np.take", relation: "Lesson d-06's gather tool; a[idx] and np.take(a, idx) are the same move spelled two ways." },
          ],
          applications: [
            "Leaderboards and best-seller lists: top-k entries with their names, ids or whole rows",
            "Nearest-neighbor search: argpartition the distance array, gather the closest k points (this lesson's finale)",
            "Anomaly candidates: the k largest deviations, computed without ordering all n",
          ],
          notes:
            "The idiom's cost math: O(n) to partition + O(k log k) to sort the slice. As long as k is much smaller than n, you are effectively paying linear time for the podium.",
        },
        {
          kind: "heading",
          text: "The median in O(n): partition's best trick",
        },
        {
          kind: "text",
          text: "A median looks like a sorting question — it is literally the middle of the sorted array. But look closer: the median needs **one or two positions** to be exact, and could not care less about the order on either side. That is precisely partition's contract. For an even number of values, ask for both middle positions at once and average them — exactly what `np.median` does with a selection algorithm under the hood:",
        },
        {
          kind: "code",
          title: "Median by hand, with np.median as the referee",
          code: `import numpy as np

r = np.array([3, 1, 4, 1, 5, 9, 2, 6])

# 8 values: the median is the average of the 4th and 5th smallest,
# which live at positions 3 and 4 once partitioned.
both = np.partition(r, [3, 4])
print("the two middle values:", both[3], both[4])
print("median via partition :", (both[3] + both[4]) / 2)
print("np.median for proof  :", np.median(r))
`,
          output: `the two middle values: 3 4
median via partition : 3.5
np.median for proof  : 3.5`,
          outputNote: "Positions 3 and 4 hold 3 and 4 — the 4th and 5th smallest of the eight values. Their average, 3.5, matches np.median exactly.",
          explain: [
            "`np.partition(r, [3, 4])` guarantees both middle positions in one pass — for odd-length arrays a single kth = n // 2 suffices, no averaging.",
            "The two middle values (3 and 4) needed no global order to be found — only their positions needed to be exact.",
            "np.median agrees: 3.5. Real code should call np.median; this build-by-hand is to show you WHY it is allowed to be fast.",
          ],
        },
        {
          kind: "heading",
          text: "kth out of bounds: the crash partition refuses to soften",
        },
        {
          kind: "text",
          text: "Partition checks its geometry. Nine prices have positions 0 through 8; asking for position 9 is not a request it can clamp like a slice (Lesson d-02) — it is an error, because position 9 has no meaning and no value could ever land there. This is the off-by-one from the mistakes list, caught red-handed:",
        },
        {
          kind: "code",
          title: "Crash course: asking for a position that does not exist",
          code: `import numpy as np

prices = np.array([42, 7, 89, 15, 63, 28, 91, 3, 56])

# Nine prices: valid positions are 0..8. Position 9 does not exist.
p = np.partition(prices, 9)
print(p)
`,
          expectError: "ValueError: kth(=9) out of bounds (9)",
          explain: [
            "The message is a small arithmetic lesson: kth=9 was requested, 9 is the bound. For n elements, valid kth runs from -n to n-1.",
            "Note the contrast with slicing: a[5:99] on a 9-element array clamps silently. Partition cannot clamp — a clamped kth would be a silently WRONG rank.",
          ],
        },
        {
          kind: "heading",
          text: "The nearest-k pattern: distances, argpartition, gather",
        },
        {
          kind: "text",
          text: "Everything in this part now assembles into one of the most-used patterns in data work: *find the k things closest to this one.* The recipe is three moves, each a lesson you already own: broadcast the distance from the query to every point (the Part E pattern), argpartition the k smallest distances, then gather and order just those k. Distances here use the plain Euclidean recipe — square, sum, square root — which Part H generalizes into norms:",
        },
        {
          kind: "code",
          title: "The two nearest points to a query",
          code: `import numpy as np

points = np.array([[0.0, 0.0],
                   [5.0, 0.0],
                   [0.0, 4.0],
                   [6.0, 5.0]])
query = np.array([1.0, 1.0])

# Distances from the query to every point (the Lesson e-02 pattern).
distances = np.sqrt(((points - query) ** 2).sum(axis=1))
print("distances:", distances)

# The two nearest positions, unordered, then ordered.
nearest2 = np.argpartition(distances, 2)[:2]
print("two nearest (unordered):", nearest2)
nearest2 = nearest2[np.argsort(distances[nearest2])]
print("two nearest (ordered)  :", nearest2)
print("their points           :", points[nearest2].tolist())
print("their distances        :", distances[nearest2])
`,
          output: `distances: [1.41421356 4.12310563 3.16227766 6.40312424]
two nearest (unordered): [0 2]
two nearest (ordered)  : [0 2]
their points           : [[0.0, 0.0], [0.0, 4.0]]
their distances        : [1.41421356 3.16227766]`,
          outputNote: "The distances are about 1.41, 4.12, 3.16, 6.40 — so positions 0 and 2 are the two nearest, gathered and then ordered by distance.",
          explain: [
            "`points - query` broadcasts the query against every row (Lesson e-01); squaring, summing along axis 1 and taking the root gives one distance per point.",
            "`np.argpartition(distances, 2)[:2]` — kth=2 fixes the boundary: the two smallest distances' positions land in the first two slots, unordered.",
            "The final argsort orders just those two — the same polish line as the top-k idiom, because this IS the top-k idiom with 'distance' playing the role of 'score' (smallest wins instead of largest).",
          ],
        },
        {
          kind: "table",
          title: "sort vs partition: which tool, when",
          headers: ["Question you are asking", "Reach for", "Why"],
          rows: [
            ["I need everything in order (a full ranking, a sorted report)", "np.sort / np.argsort", "Only a full sort makes every position exact — O(n log n), and you will read every position"],
            ["I need the k smallest/largest, in order (a podium, a top-10)", "np.argpartition + sort the k", "O(n) to find the group, O(k log k) to order it — a full sort would order the whole tail for nothing"],
            ["I need one rank exactly (max, median, a percentile boundary)", "np.partition / kth", "One position guaranteed in O(n); np.partition(a, -1)[ -1 ] is the cheapest maximum in NumPy"],
            ["I need a threshold split (below cutoff vs above)", "np.partition with kth", "The pivot lands between the groups; sides are unordered but correctly populated"],
          ],
          caption:
            "The pattern: the more of the order you will actually read, the more sort you need. Partition is not a faster sort — it is a smaller promise.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Partition guarantees positions, not order: kth lands exact, smaller left, larger right, sides unordered — in O(n). argpartition gives you the positions so parallel arrays can follow. Top-k = argpartition, slice, sort the slice. Even a median is one partition away.",
        },
        {
          kind: "tryIt",
          title: "Build a top-3 podium yourself",
          task: "Run this, then: (1) predict which three positions the first print will show BEFORE running; (2) change the call to np.argpartition(scores, 3)[:3] and explain why it now gives the BOTTOM three instead; (3) sort the top-3 positions ascending by score instead of descending; (4) replace the final ordering with a kind=\"stable\" argsort and see whether the output changes.",
          code: `import numpy as np

scores = np.array([62, 91, 58, 77, 95, 70, 84, 88])

top3 = np.argpartition(scores, -3)[-3:]
print("top-3 positions (unordered):", top3)
print("top-3 scores  (unordered):", scores[top3])
print("top-3 scores  (ordered)  :", np.sort(scores[top3])[::-1])
`,
          hint: "The sign of kth picks the side: -3 fixes a boundary 3 from the END (the top), 3 fixes one 3 from the START (the bottom). The slice then keeps the side you want: [-3:] or [:3].",
        },
      ],
      terms: [
        { term: "Partition", definition: "A rearrangement that fixes one (or several) positions exactly — the k-th smallest value at slot kth — splitting smaller values left and larger right, with sides unordered." },
        { term: "kth", definition: "The position (0-based, negatives allowed) that a partition guarantees. kth=-1 is the maximum's slot; a sequence like [3, 4] fixes several positions at once." },
        { term: "Top-k idiom", definition: "argpartition with kth=-k, slice the last k, then sort just those k — the O(n) way to produce an ordered podium from a huge field." },
        { term: "Selection algorithm", definition: "The algorithm family (introselect here) that finds rank statistics in average O(n) — the engine under np.partition and np.median." },
        { term: "Nearest-k pattern", definition: "Broadcast distances to a query, argpartition the k smallest, gather, sort the slice — the standard nearest-neighbor recipe on plain arrays." },
      ],
      mistakes: [
        {
          mistake: "Treating a partitioned array (or an argpartition slice) as sorted.",
          why: "The contract fixes the pivot's position and populates the sides correctly — order within the sides is never promised. The first k of a partition ARE the k smallest, but possibly scrambled.",
          fix: "Sort whatever you slice: np.sort(p[:k]) or the positions idiom top_k[top_k.argsort(...)]. Sorting k elements is free compared to the partition you saved.",
        },
        {
          mistake: "Off-by-one on kth — thinking kth=4 means 'the 4th smallest'.",
          why: "kth is a 0-based POSITION: the 4th smallest lives at position 3. Every rank comes out one too generous, and small data rarely exposes it.",
          fix: "Translate rank to position by subtracting one, or skip the arithmetic with negatives: the maximum's slot is kth=-1, the top-k boundary is kth=-k.",
        },
        {
          mistake: "Sorting the whole array to answer a top-k or a median question.",
          why: "It works — and quietly pays O(n log n) plus a full sorted copy for one or two positions you will read. On large arrays this is real time and real memory.",
          fix: "Name the question first. One position? partition. k positions? argpartition + sort the slice. Whole order? Only then sort.",
        },
      ],
      takeaways: [
        "np.partition's contract: position kth holds the (kth+1)-th smallest; smaller values left, larger right, sides unordered — average O(n).",
        "kth may be a sequence ([3, 4] for a median) or negative (-1 for the max, -k for a top-k boundary); valid range is -n .. n-1 and partition enforces it with a ValueError.",
        "Top-k idiom: np.argpartition(a, -k)[-k:] gives the positions; np.argsort on the gathered values orders just those k. Two lines, linear time.",
        "A median is one or two partition positions — that is why np.median is allowed to be O(n): it never sorts, it selects.",
        "Nearest-k = broadcast distances (Part E), argpartition the smallest k, gather, sort the slice — top-k with 'distance' as the score.",
      ],
      quiz: [
        {
          id: "g-02-q1",
          prompt: "After `p = np.partition(a, 2)`, which statement is TRUE?",
          options: [
            { text: "p is fully sorted ascending", correct: false, feedback: "No — that is np.sort's job. Partition only fixes the positions you asked about." },
            { text: "p[2] holds the 3rd smallest value; everything smaller is somewhere in p[:2] and everything larger somewhere in p[3:]", correct: true, feedback: "Exactly the contract: one guaranteed position, correctly populated sides, no order promised within them." },
            { text: "p[:2] holds the two smallest values in ascending order", correct: false, feedback: "The two smallest are in p[:2] — but in NO promised order. Sorting that slice is your job." },
            { text: "p[2] holds the 2nd smallest value", correct: false, feedback: "Positions are 0-based: p[2] is the THIRD smallest. The rank-vs-position slip this lesson keeps warning about." },
          ],
          explanation: "Partition buys one exact position and two correctly-populated-but-unordered sides. Trust exactly that, verify it with np.all checks when it matters.",
        },
        {
          id: "g-02-q2",
          prompt: "Why does the top-k idiom sort the k kept positions before printing?",
          options: [
            {
              text: "argpartition guarantees WHICH positions are in the slice, not their order — the sort orders just those k",
              correct: true,
              feedback: "Correct — and it is cheap: sorting k elements costs O(k log k), pocket change next to the O(n) partition.",
            },
            { text: "It does not — argpartition already returns the top-k in descending order", correct: false, feedback: "Tempting, because small examples often print tidily — the algorithm's final steps can accidentally sort. Never a promise." },
            { text: "The sort is needed to fix argpartition's mistakes", correct: false, feedback: "argpartition makes no mistake; it makes a SMALLER promise than you need for display. The sort completes the promise." },
            { text: "To convert positions into values", correct: false, feedback: "That is the gather (a[idx]), not the sort. Sorting reorders; gathering translates positions to values." },
          ],
          explanation: "Membership from argpartition, order from the mini-sort — the division of labor that makes top-k both fast and correct.",
        },
        {
          id: "g-02-q3",
          prompt: "Eight values, and you want the median via partition. Which kth do you ask for?",
          options: [
            { text: "kth=4 — the middle position", correct: false, feedback: "For 8 values there is no single middle; position 4 is the 5th smallest, one of the two needed." },
            { text: "kth=[3, 4] — both middle positions, then average", correct: true, feedback: "Even count: the median is the average of the 4th and 5th smallest, i.e. positions 3 and 4 — one partition fixes both." },
            { text: "kth=8 — the last position", correct: false, feedback: "kth=8 is out of bounds for 8 elements (valid: -8..7) — and the maximum is not the median." },
            { text: "kth=3.5 — halfway between the middles", correct: false, feedback: "kth must be an integer position (or a sequence of them); 3.5 is a rank, not a place." },
          ],
          explanation: "Median of an even-length array = average of positions n//2 - 1 and n//2, both guaranteed by one np.partition(a, [n//2 - 1, n//2]).",
        },
      ],
    },

    // ------------------------------------------------------------- g-03
    {
      slug: "g-03",
      title: "Searching and Set Logic",
      minutes: 35,
      summary:
        "The question-answering half of ordering: np.where in both forms, the index tuples of nonzero and argwhere, count_nonzero, binary search with searchsorted and side=, the four answers of unique, membership with isin, and the intersect/union/difference family.",
      kind: "concept",
      objectives: [
        "Use np.where in both forms: one argument to ask where a condition is true, three arguments as a vectorized if/else that REPLACES values (never filters them)",
        "Explain the shape surprise of np.nonzero (a tuple of one index array per axis) versus np.argwhere (coordinates as rows), gather values with either, and count matches with np.count_nonzero",
        "Locate insertion points in sorted data with np.searchsorted, choose side=\"left\" or side=\"right\" correctly when duplicates exist, and use the insertion-point-as-count pattern",
        "Call np.unique with all four outputs (values, first positions, inverse, counts) and use them for deduplication, value counts and category codes",
        "Test membership per element with np.isin and pick the right member of the set family (intersect1d, union1d, setdiff1d, setxor1d) for each set question",
      ],
      why: "Sorting was never the point — questions are. 'Which readings are out of range?' is np.where. 'How many players scored below the cutoff?' is one searchsorted on data Lesson g-01 already taught you to sort. 'Which categories exist, and how often?' is np.unique. 'Is this device on the block list?' is np.isin. 'Who logged in yesterday AND today?' is np.intersect1d. In plain Python every one of those is a loop; here each is a single call, and on sorted data searchsorted answers ranking questions in logarithmic time — the moment the sorting from Lesson g-01 starts paying rent. This toolkit is also the quiet half of Part H's nearest-neighbor work and of every real join you will ever run.",
      blocks: [
        {
          kind: "text",
          text: "You now own order. This lesson is about everything order lets you ASK. Data work runs on a handful of small questions, asked millions of times: *which* elements satisfy something, *how many* do, *where would this value fit*, *what are the distinct values*, *is this one in that set*, *what do these two sets share*. NumPy has one dedicated tool per question, and none of them is a loop. We will take them in the order you will reach for them: `np.where`, the finding pair `nonzero`/`argwhere`, the counter `count_nonzero`, the binary search `np.searchsorted`, the four-answer `np.unique`, the membership test `np.isin`, and finally the little set-algebra family that ends the part.",
        },
        {
          kind: "heading",
          text: "np.where: the two-branch if/else, and the mask question",
        },
        {
          kind: "text",
          text: "`np.where` wears two hats, and the argument count decides which one. With **one argument** it is the *positions* question you met in Lesson e-03: hand it a boolean mask, get back the indexes where it is True. With **three arguments** it is the vectorized if/else every data pipeline leans on: `np.where(condition, a, b)` walks the condition cell by cell and builds a NEW array — `a`'s value where True, `b`'s value where False. The key sentence to memorize: **three-argument where replaces, it never filters**. The output has exactly the same shape as the condition (after broadcasting, Lesson e-01), with every original slot still present — just possibly holding a different value. When you want the subset instead, that is the boolean-mask indexing from Lesson d-04, not where's job.",
        },
        {
          kind: "code",
          title: "Both faces of where",
          code: `import numpy as np

temps = np.array([12.5, 21.0, 28.5, 7.5, 19.0])

# ONE argument: "at which positions is this True?" (Lesson e-03's form)
print("positions above 20:", np.where(temps > 20)[0])

# THREE arguments: the vectorized if/else
labels = np.where(temps > 20, "hot", "mild")
print("labels:", labels)

# The classic repair job: clip negatives to zero, keep everything else
readings = np.array([3.2, -0.1, 4.8, -2.5, 0.7])
cleaned = np.where(readings < 0, 0.0, readings)
print("cleaned:", cleaned)
print("shape in, shape out:", readings.shape, cleaned.shape)
`,
          output: `positions above 20: [1 2]
labels: ['mild' 'hot' 'hot' 'mild' 'mild']
cleaned: [3.2 0.  4.8 0.  0.7]
shape in, shape out: (5,) (5,)`,
          outputNote: "The one-argument form points at positions 1 and 2 — the two temps above 20. The three-argument form keeps all five slots and swaps their contents: ['mild' 'hot' 'hot' 'mild' 'mild'], and the cleaned readings still have shape (5,) — replaced, not filtered.",
          explain: [
            "`np.where(temps > 20)[0]` — the one-argument form returns a TUPLE of index arrays (one per axis, exactly like np.nonzero below); `[0]` pulls out the 1-D case's only array. Positions 1 and 2 hold 21.0 and 28.5.",
            "`np.where(temps > 20, \"hot\", \"mild\")` — same condition, but now every element gets an answer: 'hot' where True, 'mild' where False. Five in, five out.",
            "The repair job shows the idiom you will type most: `np.where(readings < 0, 0.0, readings)` — negative sensor noise becomes 0.0, real values pass through untouched. The original `readings` array is never modified; `cleaned` is a new array.",
          ],
        },
        {
          kind: "code",
          title: "The two hats are secretly one function",
          code: `import numpy as np

temps = np.array([12.5, 21.0, 28.5, 7.5, 19.0])
mask = temps > 20

w = np.where(mask)
nz = np.nonzero(mask)

print("where(mask)  ->", w)
print("nonzero(mask)->", nz)
print("same answer:", np.array_equal(w[0], nz[0]))
`,
          output: `where(mask)  -> (array([1, 2]),)
nonzero(mask)-> (array([1, 2]),)
same answer: True`,
          outputNote: "Both calls print the same tuple: (array([1, 2]),). One-argument where IS nonzero with a friendlier name — the docs say so outright.",
          explain: [
            "The two calls return identical tuples: one index array per dimension, holding positions 1 and 2.",
            "This equivalence is why the next section studies np.nonzero directly — everything it says about the tuple shape applies to one-argument np.where too.",
            "Style tip: readers see `np.nonzero(mask)` and think positions; they see `np.where(mask, a, b)` and think replacement. The names document your intent.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Three-argument where, cell by cell",
          mode: "slice",
          name: "a",
          caption:
            "Step through the selections left to right. First the condition a > 10: true at exactly three of the five cells. Then np.where(a > 10, -1, a): the SAME three cells now hold -1, the other two keep their values — a replacement, five slots in and five slots out. Finally np.where(a > 10, a, 0) with the branches swapped: now the False cells (8 and 4) are the ones replaced. Nothing is ever removed; where chooses contents, masks choose membership.",
          data: [15, 8, 22, 4, 17],
          selections: [
            {
              expr: "a > 10",
              cells: [[0, 0], [0, 2], [0, 4]],
              note: "The condition is True at positions 0, 2 and 4 (values 15, 22, 17) — a boolean mask the same shape as a.",
            },
            {
              expr: "np.where(a > 10, -1, a)",
              cells: [[0, 0], [0, 2], [0, 4]],
              note: "Those True cells become -1; 8 and 4 pass through. Result: [-1, 8, -1, 4, -1]. Same shape, new contents.",
            },
            {
              expr: "np.where(a > 10, a, 0)",
              cells: [[0, 1], [0, 3]],
              note: "Swap the branches and the False cells are the ones replaced: [15, 0, 22, 0, 17]. Which branch a cell takes is the whole function.",
            },
          ],
        },
        {
          kind: "code",
          title: "Branches broadcast; three branches select",
          code: `import numpy as np

scores = np.array([95, 72, 58, 66, 88])

# The two branches may be arrays, scalars, or one of each --
# they broadcast against the condition exactly like Part E operands
print("keep the passers:", np.where(scores >= 70, scores, 0))

# More than two outcomes? np.select: FIRST matching condition wins
bands = np.select(
    [scores >= 90, scores >= 70, scores >= 60],
    ["A", "B", "C"],
    default="F",
)
print("bands:", bands)

# And when the rule is simply "keep above a floor", say it with a ufunc
x = np.array([3.2, -0.1, 4.8, -2.5, 0.7])
floored = np.where(x < 0, 0.0, x)
print("where == np.maximum:", np.array_equal(floored, np.maximum(x, 0.0)))
`,
          output: `keep the passers: [95 72  0  0 88]
bands: ['A' 'B' 'F' 'C' 'B']
where == np.maximum: True`,
          outputNote: "Passers survive and the two sub-70 scores (58, 66) become zeros. np.select grades A/B/C/F in one pass, first match winning — 58 falls through all three conditions to the default. And the floor-at-zero idiom is exactly np.maximum(x, 0.0).",
          explain: [
            "`np.where(scores >= 70, scores, 0)` mixes an array branch with a scalar branch — broadcasting fills the False slots with 0 everywhere.",
            "`np.select` is where's big sibling: a list of conditions, a same-length list of results, and a default for everything unmatched. 95 hits the first condition (A) even though it also satisfies the second — first match wins.",
            "When the two branches are 'keep it' and 'one constant', a ufunc often says it better: `np.maximum(x, 0.0)` and `np.where(x < 0, 0.0, x)` are the same array. Readability beats cleverness — pick the form your team reads fastest.",
          ],
        },
        {
          kind: "code",
          title: "Crash course: branches that cannot line up",
          code: `import numpy as np

temps = np.array([12.5, 21.0, 28.5])     # 3 elements
flags = np.array(["cold", "warm"])       # 2 elements -- cannot line up

print(np.where(temps > 20, flags, "hot"))
`,
          expectError:
            "ValueError: operands could not be broadcast together with shapes (3,) (2,) ()",
          explain: [
            "Read the three shapes in the message: the condition (3,), the first branch (2,), the second branch () — the scalar. Three-argument where broadcasts its three arguments against each other, exactly like a Part E arithmetic expression, and refuses when they cannot meet.",
            "The fix is on the branch, not the condition: make the flag array length 3, or use a scalar branch. The condition is not 'too strict' — the branches just do not line up.",
            "This is the same ValueError text you met for arithmetic shape mismatches in Lesson e-01; broadcasting rules one syntax everywhere.",
          ],
        },
        {
          kind: "heading",
          text: "nonzero, argwhere and count_nonzero: finding and counting",
        },
        {
          kind: "text",
          text: "The mask question has a dedicated answer: `np.nonzero`. On a 1-D array it feels ordinary — the positions where the mask is True. On a 2-D array comes the **shape surprise**: nonzero returns a *tuple* with one index array **per axis** — all the row indexes in `nz[0]`, all the column indexes in `nz[1]` — instead of a tidy list of (row, col) pairs. That feels backwards until you learn why: the tuple is shaped for fancy indexing (Lesson d-05). `grid[nz]` gathers every nonzero value in one call. Its twin `np.argwhere` returns the coordinate-pairs layout your eye prefers — one row per match — which is lovely to read and one step away from being indexable. Both are correct; they are shaped for different consumers.",
        },
        {
          kind: "code",
          title: "The tuple and the coordinate rows",
          code: `import numpy as np

grid = np.array([[0, 4, 0],
                 [7, 0, 0],
                 [0, 0, 9]])

nz = np.nonzero(grid)
print("nonzero returns a", type(nz).__name__, "of", len(nz), "arrays")
print("row indexes:", nz[0])
print("col indexes:", nz[1])

# The tuple is shaped for gathering: grid[nz] visits (0,1), (1,0), (2,2)
print("values there:", grid[nz])

# argwhere lays out the same cells as coordinate ROWS
aw = np.argwhere(grid)
print("argwhere:")
print(aw)
print("same cells, stacked:", np.array_equal(np.column_stack(nz), aw))
`,
          output: `nonzero returns a tuple of 2 arrays
row indexes: [0 1 2]
col indexes: [1 0 2]
values there: [4 7 9]
argwhere:
[[0 1]
 [1 0]
 [2 2]]
same cells, stacked: True`,
          outputNote: "nonzero hands back a tuple of 2 arrays (one per axis): rows [0 1 2], cols [1 0 2]. grid[nz] gathers [4 7 9]. argwhere prints the same three cells as rows [[0 1] [1 0] [2 2]] — literally column_stack of the tuple, as the final check proves.",
          explain: [
            "Walk the pair with one finger from each array: (nz[0][0], nz[1][0]) = (0, 1) is the 4; (1, 0) is the 7; (2, 2) is the 9. One match, two half-addresses.",
            "`grid[nz]` is the payoff of the tuple shape — fancy indexing with a tuple of index arrays gathers every match in one expression. A list of pairs would NOT work here.",
            "`np.column_stack(nz)` reshapes the tuple into argwhere's layout, and the array_equal check confirms the two functions agree completely. argwhere is for reading; nonzero is for indexing.",
          ],
        },
        {
          kind: "code",
          title: "count_nonzero: the question 'how many?'",
          code: `import numpy as np

responses = np.array([1, 0, 0, 1, 1, 0, 1, 0, 0, 0])
print("yes votes :", np.count_nonzero(responses))
print("mask sum  :", (responses == 1).sum())

grid = np.array([[0, 4, 0],
                 [7, 0, 0]])
print("per column:", np.count_nonzero(grid, axis=0))
print("per row   :", np.count_nonzero(grid, axis=1))
print("whole grid:", np.count_nonzero(grid))
`,
          output: `yes votes : 4
mask sum  : 4
per column: [1 1 0]
per row   : [1 1]
whole grid: 2`,
          outputNote: "Four yes votes, matched by summing the mask — two roads, same count. On the grid: one nonzero per column for columns 0 and 1, none in column 2; one per row; two in total.",
          explain: [
            "`np.count_nonzero(x)` and `(x != 0).sum()` count the same thing; the named function states its purpose and skips building the mask array — on big data that is real memory saved.",
            "Like every axis-aware function, the axis answers 'along which direction do I count?': axis=0 counts down each column, axis=1 counts across each row, and no axis counts everything.",
            "The idiom extends to any condition: `np.count_nonzero(scores > 90)` is 'how many made the dean's list' with no loop and no intermediate you have to name.",
          ],
        },
        {
          kind: "heading",
          text: "np.searchsorted: binary search on sorted data",
        },
        {
          kind: "text",
          text: "Here is where Lesson g-01's work starts paying rent. A sorted array is not just tidy — it is *searchable*: to know where a value belongs, binary search needs only a handful of steps instead of a scan of the whole array, and NumPy will run that search for as many probe values as you like in one call. `np.searchsorted(a, v)` answers: *at which index of the sorted array `a` would `v` be inserted, so that `a` stays sorted?* Note carefully what it does NOT answer: it does not tell you whether `v` is already present — an insertion point exists whether the value is there or not. Presence is a membership question (`np.isin`, later in this lesson); position is a searchsorted question.",
        },
        {
          kind: "code",
          title: "Where would this value land?",
          code: `import numpy as np

scores = np.sort(np.array([55, 90, 70, 90, 60, 82]))   # sorted, from g-01
print("sorted:", scores)

# One probe: 85 would slot in at index 4, between 82 and 90
print("85 lands at:", np.searchsorted(scores, 85))

# A whole batch of probes at once -- one answer each, same shape
print("[50, 65, 95] land at:", np.searchsorted(scores, [50, 65, 95]))
`,
          output: `sorted: [55 60 70 82 90 90]
85 lands at: 4
[50, 65, 95] land at: [0 2 6]`,
          outputNote: "85 lands at index 4 — insert it there and the array stays sorted (55, 60, 70, 82, 85, 90, 90). The batch lands at 0 (before everything), 2 (between 60 and 70) and 6 (after everything).",
          explain: [
            "Index 4 for 85: everything left of it (55, 60, 70, 82) is smaller, everything right (90, 90) is larger. That is the entire contract of an insertion point.",
            "Probes smaller than everything land at 0; probes larger than everything land at len(a) — the answer can be a position NO element currently occupies, one slot past the end.",
            "The cost is logarithmic in the length of `a`, and the batch version shares the sortedness: a million probes against a million sorted values is still a fast operation, no Python loop anywhere.",
          ],
        },
        {
          kind: "code",
          title: "side=: the difference duplicates make",
          code: `import numpy as np

a = np.array([10, 20, 20, 20, 30, 40])   # three copies of 20

# side="left": the point just BEFORE the run of equal values
print("left :", np.searchsorted(a, 20, side="left"))

# side="right": the point just AFTER the run
print("right:", np.searchsorted(a, 20, side="right"))

# right - left counts the copies -- without ever counting them
n_copies = np.searchsorted(a, 20, side="right") - np.searchsorted(a, 20, side="left")
print("copies of 20:", n_copies)
`,
          output: `left : 1
right: 4
copies of 20: 3`,
          outputNote: "left gives 1 (before the run at indexes 1-3), right gives 4 (after it). The difference, 3, is exactly how many 20s the array holds.",
          explain: [
            "Both answers keep `a` sorted if you insert there — before the run or after it are equally legal. side= chooses which legal answer you get.",
            "The rule in the docs: side=\"left\" returns i such that a[i-1] < v <= a[i]; side=\"right\" returns i such that a[i-1] <= v < a[i]. In words: left slides in before equal values, right slides in after them.",
            "The subtraction trick is a quiet workhorse: how many times does the value 20 appear? Two binary searches, no counting loop. It scales to 'how many scores are exactly 90' on a million-row leaderboard.",
          ],
        },
        {
          kind: "code",
          title: "The count-below pattern: an insertion point IS a count",
          code: `import numpy as np

scores = np.sort(np.array([55, 90, 70, 90, 60, 82, 71, 58]))
print("sorted:", scores)

# "How many scored strictly below 70?" -- the insertion point IS the count
below = np.searchsorted(scores, 70, side="left")
print("strictly below 70:", below)

# "How many scored 70 or below?" -- slide past the equal values
at_most = np.searchsorted(scores, 70, side="right")
print("70 or below      :", at_most)

# Both are just counts -- verified against the masks they replace
print("mask checks:", (scores < 70).sum(), (scores <= 70).sum())
`,
          output: `sorted: [55 58 60 70 71 82 90 90]
strictly below 70: 3
70 or below      : 4
mask checks: 3 4`,
          outputNote: "sorted reads [55 58 60 70 71 82 90 90]. Strictly below 70: 3 values (55, 58, 60) — the left insertion point. At most 70: 4 — the right insertion point. The mask sums agree: 3 and 4.",
          explain: [
            "Why it works: every value strictly below 70 sits LEFT of 70's insertion point, so the left insertion point counts them. Values equal to 70 sit between the left and right insertion points.",
            "side= is the strictness dial: side=\"left\" counts strictly below, side=\"right\" counts at-or-below. One character flips < into <=.",
            "The mask checks are the honest comparison: they build a full boolean array and sum it. searchsorted answers the same question from the sorted order alone — and once your data is already sorted (leaderboards, price ladders, timestamps), the count is nearly free.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Insertion points on a sorted row",
          mode: "slice",
          name: "a",
          caption:
            "A sorted row a = [10, 20, 30, 40, 50]. Step through the selections: each highlights the CELL AT THE INSERTION INDEX that searchsorted returns. Note that insertion points can also be 0 (before everything) or 5 (one past the last cell) — answers that point at a slot between cells or just off the end of the row. The last two selections are the duplicates lesson: for a value already present (30), side chooses before-or-after the existing copy.",
          data: [10, 20, 30, 40, 50],
          selections: [
            {
              expr: "np.searchsorted(a, 35)",
              cells: [[0, 3]],
              note: "35 would be inserted at index 3, between 30 and 40. Insert it and the row stays sorted.",
            },
            {
              expr: "np.searchsorted(a, [5, 15, 45])",
              cells: [[0, 0], [0, 1], [0, 4]],
              note: "A batch of probes, one answer each: 5 lands before everything (0), 15 between 10 and 20 (1), 45 between 40 and 50 (4).",
            },
            {
              expr: "np.searchsorted(a, 30, side='left')",
              cells: [[0, 2]],
              note: "30 already lives at index 2. side='left' points BEFORE it: insert at 2.",
            },
            {
              expr: "np.searchsorted(a, 30, side='right')",
              cells: [[0, 3]],
              note: "side='right' points AFTER the existing 30: insert at 3. Both keep the row sorted; side picks which.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "searchsorted trusts you completely — and that is the danger",
          text: "np.searchsorted never checks that `a` is sorted. Hand it an unsorted array and it does not raise, warn, or hesitate: it runs binary search anyway and returns confidently wrong indexes. The fix is discipline, not detection: sort first (np.sort, Lesson g-01), or — when you want to keep the original order untouched — pass the visit order with sorter=np.argsort(a), which tells searchsorted how to walk the array in sorted order without rearranging it.",
        },
        {
          kind: "code",
          title: "Crash course: searchsorted is a 1-D tool",
          code: `import numpy as np

# Binary search walks ONE sorted line -- not a grid
grid = np.array([[10, 20, 30],
                 [40, 50, 60]])

print(np.searchsorted(grid, 25))
`,
          expectError: "ValueError: object too deep for desired array",
          explain: [
            "The message is famously cryptic — 'object too deep' is C-speak for 'you handed me a 2-D array where a 1-D sequence is required'. Every data analyst meets it once; now you know what it means.",
            "The fix is to name the line you mean: np.searchsorted(grid[:, 0], 25) searches the first column, np.searchsorted(grid.ravel(), value) searches the flattened whole (after sorting it, per the warning above).",
            "The same principle as Lesson g-01's axis crash: state the dimension you intend, and NumPy's tools hold you to it.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.searchsorted",
          purpose: "Find where values would be inserted in a sorted array to keep it sorted — binary search, vectorized over any number of probe values.",
          signature: "np.searchsorted(a, v, side='left', sorter=None)",
          purposeDetail:
            "Sorted data is an index you can binary-search: instead of scanning n elements to learn where a value ranks, searchsorted inspects about log2(n) of them — 20 steps for a million values. The answer is an insertion point, not a membership verdict: it tells you where the value WOULD go, whether or not it is already there. That single number doubles as a count (everything left of the insertion point is smaller than your probe), which makes searchsorted the cheapest way to answer 'how many below X?' on data that is already sorted — leaderboards, price ladders, timestamped logs.",
          params: [
            {
              name: "a",
              type: "1-D array_like",
              required: true,
              description: "The sorted haystack. If sorter is None, YOU are responsible for `a` being in ascending order — it is never checked.",
              example: "np.sort(scores)",
            },
            {
              name: "v",
              type: "scalar or array_like",
              required: true,
              description: "The probe value(s) to place. A scalar returns a scalar index; an array returns an index array with the same shape as v.",
              example: "85 or [50, 65, 95]",
            },
            {
              name: "side",
              type: "\"left\" or \"right\"",
              description: "Which side of equal values the insertion point falls on. left: a[i-1] < v <= a[i]. right: a[i-1] <= v < a[i]. With duplicates, right - left is the count of values equal to v.",
              example: 'side="right"',
            },
            {
              name: "sorter",
              type: "1-D array of int or None",
              description: "Indices that sort `a` (typically np.argsort(a)) — lets you binary-search data whose stored order you must not change.",
              example: "sorter=np.argsort(raw)",
            },
          ],
          returns: {
            type: "int or ndarray of int",
            description: "Insertion index(es) with the same shape as v: the slot where each probe belongs so that a remains sorted. May be 0 (before everything) or len(a) (after everything).",
          },
          example: `import numpy as np

cutoffs = np.array([60, 70, 80, 90])          # sorted grade boundaries
print(np.searchsorted(cutoffs, [55, 65, 72, 90]))

raw = np.array([82, 55, 90, 70])              # unsorted, must stay that way
order = np.argsort(raw)
print("sorted visit order:", order)
print("where 75 lands:", np.searchsorted(raw, 75, sorter=order))
`,
          exampleOutput: `[0 1 2 3]
sorted visit order: [1 3 0 2]
where 75 lands: 2`,
          commonMistakes: [
            {
              mistake: "Calling searchsorted on an unsorted array.",
              why: "Nothing stops you: binary search runs anyway and returns plausible-looking, wrong indexes. Silent wrong answers are worse than crashes.",
              fix: "np.searchsorted(np.sort(a), v), or keep a sorted copy alongside the original, or pass sorter=np.argsort(a) when the original order must survive.",
            },
            {
              mistake: "Using the insertion point as a membership test ('the index exists, so the value is in the array').",
              why: "Every value has an insertion point — present or not. searchsorted answers WHERE, not WHETHER.",
              fix: "Membership is np.isin(a, v) (this lesson) or a == v anywhere; searchsorted is for position and counting questions on sorted data.",
            },
            {
              mistake: "Forgetting side= when the data has duplicates.",
              why: "side=\"left\" and side=\"right\" give different indexes for the same probe whenever the value is present — and the difference is exactly the number of copies.",
              fix: "Decide the strictness you mean: left counts strictly-below, right counts at-or-below. Say it in a comment when the boundary values matter.",
            },
          ],
          related: [
            { name: "np.sort", relation: "Creates the sortedness searchsorted depends on — sort once, then search as many times as you like." },
            { name: "np.isin", relation: "Answers membership (is it there?); searchsorted answers position (where would it go?)." },
            { name: "np.unique", relation: "Deduplicated, sorted values — the natural haystack when probes should never match duplicates." },
            { name: "np.digitize", relation: "Bins values into ranges between boundaries — the many-buckets generalization of one insertion point." },
          ],
          applications: [
            "Percentile-style questions on sorted data: how many finishes are below this score",
            "Bucketing values into grade bands or price tiers defined by sorted boundaries",
            "Merging: finding where each element of one array belongs in another, sorted one",
          ],
          notes:
            "Cost is O(log n) per probe. Python's standard library has the same idea in bisect.bisect_left / bisect_right — searchsorted is the vectorized, array-native version of both.",
        },
        {
          kind: "heading",
          text: "np.unique: one call, four answers",
        },
        {
          kind: "text",
          text: "Real columns are full of repeats — users clicking, voters voting, sensors firing — and the first question about any repeat-heavy column is *what are the distinct values?* `np.unique` answers that, sorted, with duplicates removed. But the four-argument form is the one worth learning by heart: flip three switches and one call also tells you **where each distinct value first appeared** (`return_index`), **how to rebuild the original from the distinct values** (`return_inverse`), and **how often each occurs** (`return_counts`). Those four answers are the backbone of the value-counts idiom from Lesson f-05 — category tables, frequency reports, and the category-to-code mapping that machine learning pipelines call label encoding.",
        },
        {
          kind: "code",
          title: "The full treatment: values, first positions, inverse, counts",
          code: `import numpy as np

votes = np.array(["ana", "bo", "ana", "cip", "bo", "ana"])

values, first_pos, inverse, counts = np.unique(
    votes,
    return_index=True,
    return_inverse=True,
    return_counts=True,
)

print("distinct, sorted:", values)
print("first seen at   :", first_pos)
print("inverse         :", inverse)
print("counts          :", counts)

# The inverse rebuilds the input: values[inverse] gives votes back
print("rebuilt         :", values[inverse])
`,
          output: `distinct, sorted: ['ana' 'bo' 'cip']
first seen at   : [0 1 3]
inverse         : [0 1 0 2 1 0]
counts          : [3 2 1]
rebuilt         : ['ana' 'bo' 'ana' 'cip' 'bo' 'ana']`,
          outputNote: "values is ['ana' 'bo' 'cip'] — sorted, so ana comes first even though that ordering came from unique, not from the data. ana first appeared at position 0, bo at 1, cip at 3. The inverse [0 1 0 2 1 0] codes each vote as 'which distinct value is this?', and counts reads [3 2 1].",
          explain: [
            "The four outputs unpack IN THIS ORDER: values, first positions, inverse, counts — matching the order of the return_ flags you set. (With one flag, you get a tuple of two; with all three, a tuple of four.)",
            "`first_pos` answers provenance: ana's earliest vote was cast at index 0. Use it when you need one representative row per category.",
            "`inverse` is the sleeper: positions in `values` for every original element. `values[inverse]` reconstructs the input exactly — the round trip is the proof. Codes for a model, or ranks (the project at the end of this part abuses it beautifully).",
            "`counts` is the frequency table: ana 3, bo 2, cip 1 — value counts without a dictionary in sight.",
          ],
        },
        {
          kind: "code",
          title: "The value-counts idiom, ranked",
          code: `import numpy as np

results = np.array([3, 1, 3, 3, 2, 1, 3, 2, 2])

values, counts = np.unique(results, return_counts=True)

# Most common first: order BY count DESCENDING. kind="stable" keeps
# equal counts in ascending-VALUE order (unique already sorted them)
order = np.argsort(-counts, kind="stable")

print("value:", values[order])
print("count:", counts[order])
`,
          output: `value: [3 2 1]
count: [4 3 2]`,
          outputNote: "value [3 2 1], count [4 3 2]: the 3s occurred four times, the 2s three times, the 1s twice. Two calls, zero loops, a finished frequency report.",
          explain: [
            "`-counts` negates the counts so ascending order becomes descending — the same descending trick from Lesson g-01, applied to a tally instead of the data.",
            "`kind=\"stable\"` matters when counts tie: equal frequencies keep the order unique already established (ascending value). Without it, a tie could print in either order.",
            "This two-liner — unique with return_counts, then argsort by negated counts — is Lesson f-05's value-counts idiom with today's ranking skills bolted on. It handles strings, floats, dates: anything sortable.",
          ],
        },
        {
          kind: "code",
          title: "unique on rows — and the inverse's flat habit",
          code: `import numpy as np

log = np.array([[1, 2],
                [3, 4],
                [1, 2],
                [3, 4]])

rows = np.unique(log, axis=0)      # deduplicate whole ROWS
print("distinct rows:")
print(rows)

values, inverse = np.unique(log, axis=0, return_inverse=True)
print("inverse:", inverse, "shape:", inverse.shape)
`,
          output: `distinct rows:
[[1 2]
 [3 4]]
inverse: [0 1 0 1] shape: (4,)`,
          outputNote: "axis=0 treats each row as one unit: [1 2] and [3 4] survive, each once, in row-sorted order. The inverse comes back [0 1 0 1] with shape (4,) — one entry per row, flattened, even though the input was 2-D.",
          explain: [
            "`axis=0` is 'distinct rows' (axis=1 would be distinct columns): the row [1, 2] appears twice in the log and once in the output.",
            "The inverse keeps one foot in the flat world: even with axis set, it returns a 1-D array with one code per row of the original (in this NumPy build). Values of 0 and 1 mean 'row 0 of the output' and 'row 1 of the output' — values[inverse] still rebuilds, row by row.",
            "Moral: the values output respects axis; the inverse output is flat per unit. Do not assume it mirrors the input's shape — print its shape when it matters.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.unique",
          purpose: "Return the sorted distinct values of an array — and optionally where each first appeared, how to rebuild the input, and how often each occurs.",
          signature: "np.unique(ar, return_index=False, return_inverse=False, return_counts=False, axis=None, *, equal_nan=True)",
          purposeDetail:
            "`np.unique` is the deduplication and category-table machine. One call collapses repeats into a sorted set of distinct values; three switches unlock the rest of the story — first-occurrence positions (pick one representative per category), an inverse that codes every original element as an index into the distinct values (rebuild the input, or feed a model codes instead of strings), and counts (an instant frequency table). It does all of this by sorting, which is why the output is always sorted regardless of the input's order — a fact that surprises everyone exactly once.",
          params: [
            {
              name: "ar",
              type: "array_like",
              required: true,
              description: "The array to deduplicate. Flattened first unless axis is given.",
              example: '["ana", "bo", "ana", "cip", "bo", "ana"]',
            },
            {
              name: "return_index",
              type: "bool",
              description: "Also return the index of the FIRST occurrence of each distinct value in the original array.",
              example: "return_index=True",
            },
            {
              name: "return_inverse",
              type: "bool",
              description: "Also return, for every original element, its position in the distinct values — the code that rebuilds the input as values[inverse].",
              example: "return_inverse=True",
            },
            {
              name: "return_counts",
              type: "bool",
              description: "Also return how many times each distinct value occurs — the frequency table.",
              example: "return_counts=True",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Which axis holds the units to deduplicate: axis=0 deduplicates ROWS of a 2-D array, axis=1 columns. Default None flattens everything first.",
              example: "axis=0",
            },
            {
              name: "equal_nan",
              type: "bool",
              description: "When True (default), all NaN values collapse into one distinct NaN; False keeps them apart (NaN != NaN).",
              example: "equal_nan=True",
            },
          ],
          returns: {
            type: "ndarray or tuple of ndarrays",
            description: "The sorted distinct values alone, or — in this order — (values, first_index, inverse, counts) for whichever return_ switches are True. With axis set, values keeps that axis's dimensionality; inverse comes back flat, one code per unit.",
          },
          example: `import numpy as np

clicks = np.array(["search", "ad", "search", "email", "ad", "search"])

values, first_at, codes, times = np.unique(
    clicks,
    return_index=True,
    return_inverse=True,
    return_counts=True,
)
print("channels :", values)
print("first at :", first_at)
print("codes    :", codes)
print("times    :", times)
print("rebuilt  :", values[codes])
`,
          exampleOutput: `channels : ['ad' 'email' 'search']
first at : [1 3 0]
codes    : [2 0 2 1 0 2]
times    : [2 1 3]
rebuilt  : ['search' 'ad' 'search' 'email' 'ad' 'search']`,
          commonMistakes: [
            {
              mistake: "Expecting unique's output in first-seen order.",
              why: "unique works by sorting, so the distinct values come back SORTED — ['ad' 'email' 'search'], no matter which appeared first.",
              fix: "If you need first-seen order, keep return_index and reorder: values[np.argsort(first_index)]. If you need one representative row per value, index the original with first_index.",
            },
            {
              mistake: "Unpacking the wrong number of outputs.",
              why: "The return shape follows WHICH switches you set: with all three it is a 4-tuple, with one it is a 2-tuple. Copy-pasting a 4-tuple unpack against a 2-tuple return raises ValueError.",
              fix: "Match the unpack to the switches, in the fixed order values, index, inverse, counts. Or always set all three and ignore what you do not need — the order never changes.",
            },
            {
              mistake: "Assuming the inverse has the input's shape when axis is set.",
              why: "In this NumPy build, the inverse comes back FLAT — one code per row (axis=0), shape (n_rows,), not the input's 2-D shape.",
              fix: "Treat inverse as per-unit codes and reshape deliberately if you need it elsewhere; print inverse.shape when in doubt.",
            },
          ],
          related: [
            { name: "np.sort", relation: "The engine underneath: unique sorts to find the boundaries between distinct runs." },
            { name: "np.isin", relation: "Membership against the distinct values; unique builds the category list, isin tests each element against it." },
            { name: "np.bincount", relation: "Counts for NON-NEGATIVE INTEGERS only, but even faster — unique + return_counts is the general-purpose version." },
            { name: "np.intersect1d", relation: "Set intersection is unique applied to the merge of two arrays, minus the values that do not appear in both." },
          ],
          applications: [
            "Frequency reports: which category dominates a column, ranked, in two lines",
            "Label encoding: map categories to integer codes with return_inverse and back again with values[codes]",
            "Deduplicating log rows (axis=0) while keeping one representative row each (return_index)",
          ],
          notes:
            "Because it sorts, unique costs O(n log n). If you only need 'has this exact value been seen', isin or a boolean comparison is cheaper. NaN handling is governed by equal_nan (default: all NaNs collapse to one).",
        },
        {
          kind: "heading",
          text: "np.isin: membership, one question per element",
        },
        {
          kind: "text",
          text: "Python's `in` operator asks one membership question at a time: `101 in allowed`. Data work asks it per ELEMENT — for every scan, every user, every row — and `np.isin(element, test_elements)` is the vectorized form: it broadcasts over `element`, tests each value against the whole (flattened) `test_elements`, and returns a boolean array the same shape as `element`. Feed the mask to boolean indexing (Lesson d-04) to keep the matches, invert it with `~` to drop them. One piece of NumPy-2 housekeeping while we are here: the old 1-D-only spelling `np.in1d` is **deprecated** — on this build (2.0.2) it still runs but emits a DeprecationWarning telling you to use `np.isin`, and it is scheduled for removal. Every line you write from today should say `np.isin`.",
        },
        {
          kind: "code",
          title: "Allowed, kept, rejected",
          code: `import numpy as np

allowed = np.array([101, 103, 105])          # the allow-list
scans = np.array([101, 102, 103, 104, 105, 106])

ok = np.isin(scans, allowed)                 # one question per scan
print("mask     :", ok)
print("kept     :", scans[ok])
print("rejected :", scans[~ok])

# The question keeps element's shape -- 2-D in, 2-D out
grid = np.array([[1, 2],
                 [3, 4]])
print("2-D shape kept:")
print(np.isin(grid, [2, 4]))
`,
          output: `mask     : [ True False  True False  True False]
kept     : [101 103 105]
rejected : [102 104 106]
2-D shape kept:
[[False  True]
 [False  True]]`,
          outputNote: "The mask flags the three allowed ids at their positions; boolean indexing keeps them, ~ flips to drop them. The grid stays 2-D: each cell answers its own membership question in place.",
          explain: [
            "Argument order is the whole function: isin(NEEDLES, HAYSTACK) — the first argument is what gets a per-element answer, the second is what it is tested against (flattened if it is an array).",
            "`scans[ok]` and `scans[~ok]` are Lesson d-04's boolean masks at work — isin supplies the mask, indexing does the filtering. Division of labor, no loops.",
            "test_elements being flattened means a 2-D allow-list works fine as the second argument; only the FIRST argument's shape survives to the output.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.isin",
          purpose: "Test every element of an array for membership in a second collection — the vectorized `in` operator.",
          signature: "np.isin(element, test_elements, assume_unique=False, invert=False, *, kind=None)",
          purposeDetail:
            "`np.isin` answers the per-element membership question that Python's `in` can only answer one value at a time. It returns a boolean array with the shape of `element`: True wherever that value appears anywhere in `test_elements`. The result composes with everything you already own — boolean indexing keeps or drops the matches, count_nonzero tallies them, where turns them into labels. Under the hood it sorts both sides and merges (like unique), which is why it scales to millions of needles and a large haystack without the quadratic cost of the naive double loop.",
          params: [
            {
              name: "element",
              type: "array_like",
              required: true,
              description: "The needles: the values that each get their own True/False answer. The output has this argument's shape.",
              example: "[101, 102, 103, 104, 105, 106]",
            },
            {
              name: "test_elements",
              type: "array_like",
              required: true,
              description: "The haystack: values to test against. Flattened if it is an array — only element's shape survives.",
              example: "[101, 103, 105]",
            },
            {
              name: "assume_unique",
              type: "bool",
              description: "True promises both inputs have no duplicates, licensing a faster algorithm. Wrong promises produce wrong answers — leave False unless you are sure.",
              example: "assume_unique=False",
            },
            {
              name: "invert",
              type: "bool",
              description: "True flips every answer — the cheap spelling of 'element NOT in test_elements'.",
              example: "invert=True",
            },
            {
              name: "kind",
              type: "None, \"sort\", or \"table\"",
              description: "Algorithm choice: \"sort\" merges two sorted copies, \"table\" builds a lookup (integers/booleans only), None picks automatically by memory. Results are identical either way.",
              example: 'kind="sort"',
            },
          ],
          returns: {
            type: "ndarray of bool",
            description: "Same shape as element: True where the value is present in test_elements (or False everywhere, if invert=True).",
          },
          example: `import numpy as np

ticket_ids = np.array([501, 502, 503, 504])
winners = np.array([502, 504, 506])

hits = np.isin(ticket_ids, winners)
print(hits)
print("winning tickets :", ticket_ids[hits])
print("non-winners     :", ticket_ids[~hits])
print("inverted answers:", np.isin(ticket_ids, winners, invert=True))
`,
          exampleOutput: `[False  True False  True]
winning tickets : [502 504]
non-winners     : [501 503]
inverted answers: [ True False  True False]`,
          commonMistakes: [
            {
              mistake: "Swapping the arguments — isin(haystack, needles).",
              why: "The first argument gets the per-element answers and the output's shape. Swap them and you get one answer per haystack value — the right values, the wrong shape and meaning.",
              fix: "Read it aloud as 'is EACH OF THESE in THAT': isin(element, test_elements). The output shape always mirrors the first argument.",
            },
            {
              mistake: "Expecting isin to return the matching values.",
              why: "It returns the MASK — a boolean array the same size as the input. The matches are one indexing step away.",
              fix: "Compose it: a[np.isin(a, b)] keeps them, np.count_nonzero(np.isin(a, b)) counts them, np.where(np.isin(a, b), 'in', 'out') labels them.",
            },
            {
              mistake: "Passing a Python set as test_elements, like isin(a, {1, 2, 3}).",
              why: "np.asarray on a set makes a 0-dimensional object array holding the SET ITSELF as one element — so membership is tested against a one-element collection of sets, and every answer comes out False.",
              fix: "Pass sequences: isin(a, [1, 2, 3]). Convert sets first with list(your_set) if that is what you have.",
            },
          ],
          related: [
            { name: "np.in1d", relation: "The deprecated 1-D-only ancestor — still callable in NumPy 2.0.2 but warns, and is scheduled for removal. Write np.isin." },
            { name: "np.unique", relation: "Builds the distinct-value list; isin tests against any collection, deduplicated or not." },
            { name: "np.intersect1d", relation: "When you want the common VALUES themselves (sorted, unique) rather than a per-element mask." },
            { name: "np.searchsorted", relation: "On sorted data, answers position and counting questions — membership included, via right minus left." },
          ],
          applications: [
            "Filtering a stream against an allow-list or block-list of ids",
            "Flagging rows for review: np.where(np.isin(status, ['error', 'timeout']), 'check', 'ok')",
            "Data validation: every category code in a column present in the official codebook?",
          ],
          notes:
            "Results never depend on kind= — it only trades speed for memory. The classic algorithm is sort-and-merge; the 'table' mode is a counting-sort lookup available for integer and boolean data.",
        },
        {
          kind: "heading",
          text: "The set family: intersect, union, difference, xor",
        },
        {
          kind: "text",
          text: "The last four functions answer questions about two collections at once — the questions a Venn diagram draws. All four live on 1-D arrays, all four return a **sorted array with duplicates removed**, and all four names end in `1d` to remind you of that contract. `np.intersect1d` keeps what is in BOTH; `np.union1d` keeps what is in EITHER; `np.setdiff1d(a, b)` keeps what is in a but NOT b; `np.setxor1d(a, b)` keeps what changed sides — in exactly one of the two. Note that xor is the other three in disguise: it equals union minus intersection, the symmetric difference of set algebra.",
        },
        {
          kind: "table",
          title: "The four set questions",
          headers: ["Function", "Set question it answers", "On yesterday / today below"],
          rows: [
            ["np.intersect1d(a, b)", "Which values are in BOTH?", "[103 104 105]"],
            ["np.union1d(a, b)", "Which are in EITHER?", "[101 102 103 104 105 106 107]"],
            ["np.setdiff1d(a, b)", "Which are in a but NOT in b?", "[101 102]"],
            ["np.setxor1d(a, b)", "Which are in exactly ONE?", "[101 102 106 107]"],
          ],
          caption:
            "yesterday = [101 102 103 104 105], today = [103 104 105 106 107] — the running example below. Every output is sorted and duplicate-free, whatever the inputs looked like.",
        },
        {
          kind: "code",
          title: "Yesterday, today: one report, four questions",
          code: `import numpy as np

yesterday = np.array([101, 102, 103, 104, 105])   # visitor ids
today = np.array([103, 104, 105, 106, 107])

print("came both days :", np.intersect1d(yesterday, today))
print("came either day:", np.union1d(yesterday, today))
print("only yesterday :", np.setdiff1d(yesterday, today))
print("changed over   :", np.setxor1d(yesterday, today))

# Duplicates in the inputs never survive: outputs are sets, sorted
print("dupes collapse :", np.intersect1d([1, 1, 2, 3, 3], [1, 3, 3, 4]))
`,
          output: `came both days : [103 104 105]
came either day: [101 102 103 104 105 106 107]
only yesterday : [101 102]
changed over   : [101 102 106 107]
dupes collapse : [1 3]`,
          outputNote: "Three returning visitors (103-105), seven distinct visitors across both days, two who vanished (101, 102), four who changed sides (101, 102 out; 106, 107 in). And even though the second call's inputs are full of duplicates, the answer comes back as the set [1 3].",
          explain: [
            "setdiff1d is directional: np.setdiff1d(yesterday, today) asks about yesterday's side. Swap the arguments and you get today's newcomers [106 107] instead.",
            "setxor1d = union minus intersection — the symmetric difference. It is the 'what changed between these two collections' answer, the one dashboards call a churn report.",
            "The duplicate demo is the contract in action: inputs may repeat, outputs never do. If you need the multiplicities back, that is np.unique's return_counts, not set logic.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.intersect1d",
          purpose: "Return the sorted, deduplicated values that appear in BOTH of two arrays — set intersection on 1-D data.",
          signature: "np.intersect1d(ar1, ar2, assume_unique=False, return_indices=False)",
          purposeDetail:
            "`np.intersect1d` answers the overlap question — who is in both tables, which ids exist in both files, which genes appear in both experiments. Like the rest of the 1d set family it returns a sorted, duplicate-free array regardless of input order or repeats, so the output is always a clean set ready to index with or report. The optional return_indices mode is the provenance upgrade: alongside the common values you get the positions where each was FIRST found in each input array — enough to jump straight back to the original rows.",
          params: [
            {
              name: "ar1",
              type: "array_like",
              required: true,
              description: "First collection. Flattened if it is not already 1-D.",
              example: "[101, 102, 103, 104, 105]",
            },
            {
              name: "ar2",
              type: "array_like",
              required: true,
              description: "Second collection. Also flattened — dimensionality is silently ignored, not an error.",
              example: "[103, 104, 105, 106, 107]",
            },
            {
              name: "assume_unique",
              type: "bool",
              description: "True promises the inputs have no duplicates, licensing a faster path. A false promise yields wrong output — leave it False when unsure.",
              example: "assume_unique=False",
            },
            {
              name: "return_indices",
              type: "bool",
              description: "Also return the index of the first occurrence of each common value in ar1 and in ar2 — two extra arrays for provenance lookups.",
              example: "return_indices=True",
            },
          ],
          returns: {
            type: "ndarray or tuple of ndarrays",
            description: "The sorted, unique common values; with return_indices, a 3-tuple (common_values, first_positions_in_ar1, first_positions_in_ar2).",
          },
          example: `import numpy as np

monday = np.array([102, 101, 105, 103, 102])
tuesday = np.array([103, 106, 102, 107])

common = np.intersect1d(monday, tuesday)
print("common ids:", common)

common, in_mon, in_tue = np.intersect1d(monday, tuesday, return_indices=True)
print("positions in monday:", in_mon)
print("positions in tuesday:", in_tue)
print("monday's rows:", monday[in_mon])
`,
          exampleOutput: `common ids: [102 103]
positions in monday: [0 3]
positions in tuesday: [2 0]
monday's rows: [102 103]`,
          commonMistakes: [
            {
              mistake: "Expecting duplicates or original order to survive.",
              why: "intersect1d returns a SET: sorted, each common value once. [102, 103] comes back even if 102 appears twice in the input and 103 came first.",
              fix: "Need counts? That is np.unique(return_counts=True) territory. Need first-seen order? Sort by the return_indices positions. The set contract is firm.",
            },
            {
              mistake: "Handing it 2-D arrays and expecting row-wise intersection.",
              why: "The whole family flattens non-1-D input silently — you get the intersection of ALL values, not of rows, and no error warns you.",
              fix: "Be explicit about the unit: intersect whole rows with np.unique-style tricks or compare row-by-row on a key column; use the 1d family only when values are the unit.",
            },
            {
              mistake: "Setting assume_unique=True as a reflexive speedup.",
              why: "It skips dedup work only if the promise holds. With duplicated inputs the output is undefined — sometimes right on small data, wrong at scale.",
              fix: "Only set it when the data model guarantees uniqueness (primary keys, np.unique output) — and comment why you believe it.",
            },
          ],
          related: [
            { name: "np.union1d", relation: "The EITHER question — values in at least one input, same sorted-unique contract." },
            { name: "np.setdiff1d", relation: "The in-a-but-not-b question; intersect's directional complement." },
            { name: "np.setxor1d", relation: "The exactly-one question — union minus intersection, the churn report." },
            { name: "np.isin", relation: "Per-element membership mask; intersect1d is what you want when the common VALUES themselves are the deliverable." },
          ],
          applications: [
            "Retention: users active in both of two periods (intersect), churned (setdiff), or changed (setxor)",
            "Reconciliation: ids present in two exports that are supposed to agree",
            "Whitelist assembly: values allowed by policy A AND policy B",
          ],
          notes:
            "All four 1d set functions sort internally, so each call costs O((n+m) log(n+m)). Doing many set questions on the same data? Sort once, then consider searchsorted for the threshold-style ones.",
        },
        {
          kind: "heading",
          text: "Which tool, when",
        },
        {
          kind: "table",
          title: "The searching and set toolkit, by question",
          headers: ["The question you are asking", "The tool", "One-line reminder"],
          rows: [
            ["Which elements satisfy a condition? (keep them)", "boolean mask a[mask] (Lesson d-04)", "Masks FILTER — the result has only the matches"],
            ["What would each element be, if the condition flips it?", "np.where(cond, a, b)", "Where REPLACES — same shape, new contents"],
            ["At which positions is the condition true?", "np.nonzero(mask) / np.argwhere(mask)", "Tuple per axis (for indexing) vs coordinate rows (for reading)"],
            ["How many satisfy it?", "np.count_nonzero(mask)", "The count without naming the mask array"],
            ["Where does this value rank in sorted data?", "np.searchsorted(sorted_a, v)", "An insertion point; side= handles duplicates"],
            ["How many are below a threshold?", "np.searchsorted on the sorted array", "side=\"left\" counts strictly below; side=\"right\" at-or-below"],
            ["What are the distinct values? How often does each occur?", "np.unique(..., return_counts=True)", "Sorted output; inverse rebuilds and encodes"],
            ["Is each element in that other collection?", "np.isin(element, test_elements)", "Mask shaped like the FIRST argument"],
            ["What do these two collections share? differ by?", "np.intersect1d / union1d / setdiff1d / setxor1d", "All return sorted sets; duplicates never survive"],
          ],
          caption:
            "Find the question in the left column and the tool is the middle one. Half of debugging set-logic code is discovering you asked a filter question with a replacement tool, or vice versa.",
        },
        {
          kind: "tryIt",
          title: "One afternoon of weather data",
          task: "Run this, then: (1) predict the warm-hours line before running — which clock times survive `temps > 20`?; (2) change the where threshold from 20 to 25 and watch three labels flip; (3) make the searchsorted lines answer 'below 12' and '12 or below' instead; (4) add a line printing np.isin(30, temps) and predict it before running.",
          code: `import numpy as np

# Hourly temperature readings, 06:00 through 21:00
minutes = np.arange(6, 22)
temps = np.array([12, 14, 17, 21, 24, 26, 27, 25, 23, 20, 17, 15, 13, 12, 11, 10])

print("warm hours (clock):", minutes[temps > 20])
print("labels:", np.where(temps > 20, "warm", "cool"))

sorted_t = np.sort(temps)
print("below 15   :", np.searchsorted(sorted_t, 15))
print("15 or below:", np.searchsorted(sorted_t, 15, side="right"))

vals, cnts = np.unique(temps, return_counts=True)
print("temp  count")
print(np.column_stack((vals, cnts)))

print("was 24 ever read?", np.isin(24, temps))
`,
          hint: "The warm hours are the minutes where the mask is True — positions 3 through 8, which are clock times 9 through 14. And 15 is present in the data, so the two searchsorted answers differ by exactly one.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "where replaces (three arguments) or locates (one argument); nonzero returns a tuple of index arrays built for fancy indexing while argwhere lays out coordinate rows built for reading; count_nonzero tallies; searchsorted binary-searches sorted data — an insertion point that doubles as a count, with side= as the strictness dial; unique returns four answers about a column's distinct values; isin tests membership per element; and the intersect/union/diff/xor family answers Venn questions in sorted, duplicate-free form.",
        },
      ],
      terms: [
        { term: "Insertion point", definition: "The index at which a value could be inserted into a sorted array so it stays sorted — searchsorted's answer. May be 0 or len(a), pointing just outside the current elements." },
        { term: "Binary search", definition: "Finding a value's position in sorted data by halving the remaining range each step — O(log n). The algorithm inside searchsorted and the reason sortedness pays rent." },
        { term: "Membership test", definition: "Asking whether a value belongs to a collection. Vectorized per element by np.isin(element, test_elements), which returns a mask shaped like the first argument." },
        { term: "Inverse indices", definition: "np.unique's return_inverse output: for every original element, its position among the distinct values. values[inverse] rebuilds the input; inverse doubles as category codes." },
        { term: "Set logic", definition: "The Venn-diagram operations on 1-D arrays — intersect1d, union1d, setdiff1d, setxor1d — all returning sorted, deduplicated results regardless of input order or repeats." },
        { term: "Symmetric difference", definition: "Values in exactly one of two collections: union minus intersection. np.setxor1d, the churn report of the set family." },
      ],
      mistakes: [
        {
          mistake: "Using three-argument np.where to filter rows — expecting fewer results than inputs.",
          why: "np.where(cond, a, b) builds a new array with the SAME shape as the condition: every slot gets a or b. Nothing is ever dropped; where is a replacement engine, not a filter.",
          fix: "To keep a subset, use the boolean mask directly: a[cond] (Lesson d-04). Reach for where when every element needs an answer (labels, repairs, fallbacks), not when some elements should disappear.",
        },
        {
          mistake: "Calling np.searchsorted on data that is not sorted.",
          why: "searchsorted never validates sortedness. Binary search on unsorted data inspects the wrong ranges and returns confident, plausible, wrong indexes — the worst kind of bug: silent.",
          fix: "np.searchsorted(np.sort(a), v), keep a sorted companion array, or pass sorter=np.argsort(a) when the stored order must survive. Treat sortedness as a precondition YOU document.",
        },
        {
          mistake: "Treating np.nonzero's result as one array of positions on 2-D data.",
          why: "np.nonzero returns a TUPLE: one index array per axis. Iterating the tuple, printing it raw, or stacking it into a 1-D tools' input produces the classic (array([...]), array([...])) confusion.",
          fix: "Unpack deliberately — rows, cols = np.nonzero(mask) — index with the tuple (grid[nz]), or switch to np.argwhere when you want one coordinate row per match for reading.",
        },
        {
          mistake: "Expecting the set family to preserve duplicates or input order.",
          why: "intersect1d/union1d/setdiff1d/setxor1d all return sorted, deduplicated sets by contract. Feeding [1, 1, 2, 3, 3] through any of them loses the repeats silently — no warning, by design.",
          fix: "Want multiplicities? np.unique(..., return_counts=True) is the tool. Want per-element answers instead of a set? np.isin. The 1d family answers set questions with set answers.",
        },
      ],
      takeaways: [
        "np.where has two faces: one argument returns the tuple of True positions (identical to np.nonzero); three arguments is the vectorized if/else that REPLACES values — the output always matches the condition's broadcast shape.",
        "np.nonzero returns one index array per axis (built for fancy indexing: grid[nz] gathers every match); np.argwhere returns coordinate rows (built for reading); np.count_nonzero(mask) is the 'how many' question, with axis= for per-row/column tallies.",
        "np.searchsorted(a, v) binary-searches SORTED a and returns insertion points: side=\"left\" points before equal values, side=\"right\" after them — so right minus left counts exact matches, and the insertion point itself counts everything strictly below the probe.",
        "np.unique answers four questions at once: sorted distinct values, first-occurrence positions, an inverse that rebuilds (and encodes) the input, and a counts frequency table — the backbone of the value-counts idiom.",
        "np.isin(element, test_elements) is the vectorized `in` (np.in1d is deprecated in NumPy 2 — write isin); the intersect/union/setdiff/setxor family answers the Venn questions, every output a sorted set.",
      ],
      quiz: [
        {
          id: "g-03-q1",
          prompt: "`np.where(temps > 20, \"hot\", \"mild\")` returns:",
          options: [
            { text: "Only the temperatures above 20", correct: false, feedback: "That is the mask's job (temps[temps > 20]) — where with three arguments never drops elements." },
            { text: "A new array the same shape as temps, each slot holding \"hot\" or \"mild\"", correct: true, feedback: "Exactly: same slots, new contents. where replaces; it does not filter." },
            { text: "The positions where temps > 20 is True", correct: false, feedback: "That is the ONE-argument form, np.where(temps > 20) — the argument count changes the function's job." },
            { text: "An error unless both branches are arrays", correct: false, feedback: "Scalar branches are fine — branches broadcast against the condition, so \"mild\" fills every False slot." },
          ],
          explanation: "Three-argument where is the vectorized if/else: condition-shaped output, a-value where True, b-value where False. Filtering is boolean masking's job.",
        },
        {
          id: "g-03-q2",
          prompt: "For a 2-D grid, `nz = np.nonzero(grid)` returns:",
          options: [
            { text: "A single array of flat positions, like on 1-D data", correct: false, feedback: "The 1-D behavior does not generalize this way — a 2-D cell needs TWO indexes to be located." },
            { text: "A tuple with one index array per axis: nz[0] the rows, nz[1] the cols", correct: true, feedback: "Right — and that shape is a feature: grid[nz] gathers every match with one fancy-indexing call." },
            { text: "An array of [row, col] pairs, one row per match", correct: false, feedback: "That describes np.argwhere — the reading-friendly layout. nonzero's tuple is the indexing-friendly layout." },
            { text: "The VALUES of the nonzero cells, in row-major order", correct: false, feedback: "That is what you get by gathering with the tuple (grid[nz]) — nonzero itself returns indexes, not values." },
          ],
          explanation: "nonzero: tuple of one index array per axis (indexing-ready). argwhere: coordinate rows (reading-ready). Same cells, two layouts, two audiences.",
        },
        {
          id: "g-03-q3",
          prompt: "With `a = np.array([10, 20, 20, 20, 30, 40])`, what is `np.searchsorted(a, 20, side=\"right\")`?",
          options: [
            { text: "1 — before the run of 20s", correct: false, feedback: "That is side=\"left\": the insertion point that slides in BEFORE equal values." },
            { text: "4 — after the run of 20s", correct: true, feedback: "Correct: inserting at 4 (between the last 20 and the 30) keeps a sorted, and right minus left (4 - 1 = 3) counts the copies." },
            { text: "2 — the middle of the run", correct: false, feedback: "There is no middle-of-the-run answer: side picks the slot before the run or after it, never inside." },
            { text: "An error — 20 is already present", correct: false, feedback: "No error, and presence is irrelevant: every value has an insertion point whether or not it already exists." },
          ],
          explanation: "side=\"right\" points after equal values, side=\"left\" before them. With duplicates the two differ, and their difference is the count of that value.",
        },
        {
          id: "g-03-q4",
          prompt: "You have a column of repeated category labels and need each distinct label WITH its frequency, most frequent first. The one-liner core is:",
          options: [
            { text: "np.isin(column, column)", correct: false, feedback: "That returns an all-True mask — every element is trivially in its own column. Membership is not counting." },
            { text: "np.unique(column, return_counts=True), then order by -counts with argsort", correct: true, feedback: "Exactly the value-counts idiom: unique hands you values and counts; argsort(-counts) ranks them, most frequent first." },
            { text: "np.searchsorted(column, column)", correct: false, feedback: "searchsorted needs SORTED data, and it answers position questions — on unsorted labels it silently returns garbage." },
            { text: "np.union1d(column, column)", correct: false, feedback: "That gives the distinct labels (a set), but drops every multiplicity — counts are exactly what set logic destroys." },
          ],
          explanation: "unique(return_counts=True) is the frequency table; a negated-counts stable argsort turns it into a ranking. Set functions destroy counts; unique counts them.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part G exercises
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "g-b1",
      tier: "beginner",
      title: "Ascending, then descending",
      prompt:
        "Build x = np.array([23, 5, 17, 90, 12]). Print exactly two lines: first the values in ascending order with np.sort (x itself must stay untouched), then the same values in DESCENDING order using only np.sort and a reversal slice (the [::-1] idea from Lesson g-01 — no negation trick needed). Each line has five numbers.",
      hint: "np.sort(x) is the ascending copy; reversing it is np.sort(x)[::-1]. Print each on its own line.",
      starter: `import numpy as np

x = np.array([23, 5, 17, 90, 12])

# TODO: print ascending (x must remain [23 5 17 90 12]), then descending
`,
      solution: `import numpy as np

x = np.array([23, 5, 17, 90, 12])
print(np.sort(x))
print(np.sort(x)[::-1])
`,
      expectedOutput: `[ 5 12 17 23 90]
[90 23 17 12  5]`,
      concepts: ["np.sort", "descending order", "reversal slice"],
    },
    {
      id: "g-b2",
      tier: "beginner",
      title: "The index dance",
      prompt:
        "Four friends scored as follows: names = np.array([\"ana\", \"bo\", \"cip\", \"dee\"]) with scores = np.array([70, 90, 60, 85]). Using ONE argsort call, print two lines: the scores in ascending order, and the names in that same order. The second line is the whole point of argsort — reordering a PARALLEL array without ever sorting it.",
      hint: "order = np.argsort(scores) gives positions smallest-first; gather with scores[order] and names[order].",
      starter: `import numpy as np

names = np.array(["ana", "bo", "cip", "dee"])
scores = np.array([70, 90, 60, 85])

# TODO: print ascending scores, then the names in the same order
`,
      solution: `import numpy as np

names = np.array(["ana", "bo", "cip", "dee"])
scores = np.array([70, 90, 60, 85])

order = np.argsort(scores)
print(scores[order])
print(names[order])
`,
      expectedOutput: `[60 70 85 90]
['cip' 'ana' 'dee' 'bo']`,
      concepts: ["np.argsort", "fancy indexing", "parallel arrays"],
    },
    {
      id: "g-b3",
      tier: "beginner",
      title: "Label every server response",
      prompt:
        "Server response times are ms = np.array([120, 45, 800, 95, 250, 60]). Print two lines: first a label for EVERY response — \"slow\" where the time exceeds 100 ms, \"fast\" otherwise — built with one three-argument np.where call; then the number of slow responses counted with np.count_nonzero. The first line must have exactly six labels: where replaces, it never filters.",
      hint: "labels = np.where(ms > 100, \"slow\", \"fast\"); then np.count_nonzero(ms > 100) — or count_nonzero on a comparison of labels.",
      starter: `import numpy as np

ms = np.array([120, 45, 800, 95, 250, 60])

# TODO: label every response slow/fast, then count the slow ones
`,
      solution: `import numpy as np

ms = np.array([120, 45, 800, 95, 250, 60])

labels = np.where(ms > 100, "slow", "fast")
print(labels)
print(np.count_nonzero(ms > 100))
`,
      expectedOutput: `['slow' 'fast' 'slow' 'fast' 'slow' 'fast']
3`,
      concepts: ["np.where", "np.count_nonzero", "labels"],
    },
    {
      id: "g-b4",
      tier: "beginner",
      title: "The die, tallied",
      prompt:
        "A die was rolled nine times: draws = np.array([3, 1, 3, 3, 2, 1, 3, 2, 2]). Using ONE np.unique call with the right switch, print two lines: the distinct faces that came up (sorted — that is unique's contract), and how many times each face was rolled. Face 1 was rolled 2 times, 2 was rolled 3 times, 3 was rolled 4 times — your second line must agree.",
      hint: "values, counts = np.unique(draws, return_counts=True); print values, then counts.",
      starter: `import numpy as np

draws = np.array([3, 1, 3, 3, 2, 1, 3, 2, 2])

# TODO: print the distinct faces, then the count of each
`,
      solution: `import numpy as np

draws = np.array([3, 1, 3, 3, 2, 1, 3, 2, 2])

values, counts = np.unique(draws, return_counts=True)
print(values)
print(counts)
`,
      expectedOutput: `[1 2 3]
[2 3 4]`,
      concepts: ["np.unique", "return_counts", "frequency table"],
    },
    {
      id: "g-i1",
      tier: "intermediate",
      title: "Ties, broken twice",
      prompt:
        "Five players: names = np.array([\"bo\", \"ana\", \"cip\", \"dee\", \"eli\"]), scores = np.array([90, 90, 70, 90, 70]), levels = np.array([3, 1, 2, 2, 5]). Build the leaderboard order with ONE np.lexsort call: score DESCENDING, ties broken by level DESCENDING, remaining ties by name ASCENDING. Print three lines: the names, the scores and the levels, all in that final order. Remember the trap — the LAST key is primary, and strings sort ascending while numbers need negation to descend.",
      hint: "order = np.lexsort((names, -levels, -scores)) — -scores primary (descending), then -levels, then names. Gather all three arrays with the same order.",
      starter: `import numpy as np

names = np.array(["bo", "ana", "cip", "dee", "eli"])
scores = np.array([90, 90, 70, 90, 70])
levels = np.array([3, 1, 2, 2, 5])

# TODO: one np.lexsort call, then print names, scores, levels in order
`,
      solution: `import numpy as np

names = np.array(["bo", "ana", "cip", "dee", "eli"])
scores = np.array([90, 90, 70, 90, 70])
levels = np.array([3, 1, 2, 2, 5])

order = np.lexsort((names, -levels, -scores))
print(names[order])
print(scores[order])
print(levels[order])
`,
      expectedOutput: `['bo' 'dee' 'ana' 'eli' 'cip']
[90 90 90 70 70]
[3 2 1 5 2]`,
      concepts: ["np.lexsort", "tie-breaking", "descending keys"],
    },
    {
      id: "g-i2",
      tier: "intermediate",
      title: "The podium, without sorting the field",
      prompt:
        "Eight players: names = np.array([\"ana\", \"bo\", \"cip\", \"dee\", \"eli\", \"fyn\", \"gus\", \"hia\"]) with scores = np.array([1420, 1680, 1420, 990, 1750, 1310, 880, 1550]). Build the top-3 podium with the Lesson g-02 idiom — np.argpartition to cut the top three positions in O(n), then a mini-sort of just those three — and print two lines: the podium names and the podium scores, both in descending score order. No full sort of all eight allowed.",
      hint: "top = np.argpartition(-scores, 3)[:3] grabs the three highest-SCORE positions unordered; then order them with top[np.argsort(-scores[top])].",
      starter: `import numpy as np

names = np.array(["ana", "bo", "cip", "dee", "eli", "fyn", "gus", "hia"])
scores = np.array([1420, 1680, 1420, 990, 1750, 1310, 880, 1550])

# TODO: argpartition the top-3 positions, sort just those, print names+scores
`,
      solution: `import numpy as np

names = np.array(["ana", "bo", "cip", "dee", "eli", "fyn", "gus", "hia"])
scores = np.array([1420, 1680, 1420, 990, 1750, 1310, 880, 1550])

top = np.argpartition(-scores, 3)[:3]
top = top[np.argsort(-scores[top])]
print(names[top])
print(scores[top])
`,
      expectedOutput: `['eli' 'bo' 'hia']
[1750 1680 1550]`,
      concepts: ["np.argpartition", "top-k idiom", "mini-sort"],
    },
    {
      id: "g-i3",
      tier: "intermediate",
      title: "Below, at most, exactly",
      prompt:
        "Eight exam scores arrive unsorted: np.array([55, 90, 70, 90, 60, 82, 71, 58]). Sort them once, then print three lines: (1) np.searchsorted with side=\"left\" for the probes [60, 70, 90]; (2) the same probes with side=\"right\"; (3) the number of students who scored EXACTLY 90, computed as the difference of the two insertion points for 90. Line 1 counts at-or-equal boundaries one way, line 2 the other — and their difference is a tally nobody looped for.",
      hint: "s = np.sort(scores) first. Lines 1-2 are np.searchsorted(s, [60, 70, 90]) and the same with side=\"right\". Line 3: np.searchsorted(s, 90, side=\"right\") - np.searchsorted(s, 90, side=\"left\").",
      starter: `import numpy as np

scores = np.array([55, 90, 70, 90, 60, 82, 71, 58])

# TODO: sort once; print left insertion points for [60, 70, 90],
# then right insertion points, then the exact count of 90
`,
      solution: `import numpy as np

scores = np.array([55, 90, 70, 90, 60, 82, 71, 58])
s = np.sort(scores)

print(np.searchsorted(s, [60, 70, 90]))
print(np.searchsorted(s, [60, 70, 90], side="right"))
print(np.searchsorted(s, 90, side="right") - np.searchsorted(s, 90, side="left"))
`,
      expectedOutput: `[2 3 6]
[3 4 8]
2`,
      concepts: ["np.searchsorted", "side=", "insertion points"],
    },
    {
      id: "g-i4",
      tier: "intermediate",
      title: "Yesterday, today: the four set questions",
      prompt:
        "Two days of visitor ids: week1 = np.array([2, 3, 5, 7, 11, 3]) (note the duplicate 3) and week2 = np.array([3, 7, 13, 2]). Print exactly four lines, in this order: the ids that came BOTH weeks (np.intersect1d), the ids that came EITHER week (np.union1d), the ids from week1 that did NOT return (np.setdiff1d), and the ids that changed sides — exactly one of the two weeks (np.setxor1d). Every line must be sorted and duplicate-free; that is the family contract.",
      hint: "One function per line, week1 first in every call. The duplicate 3 in week1 must vanish from every answer.",
      starter: `import numpy as np

week1 = np.array([2, 3, 5, 7, 11, 3])
week2 = np.array([3, 7, 13, 2])

# TODO: print intersect, union, only-week1, and changed-sides ids
`,
      solution: `import numpy as np

week1 = np.array([2, 3, 5, 7, 11, 3])
week2 = np.array([3, 7, 13, 2])

print(np.intersect1d(week1, week2))
print(np.union1d(week1, week2))
print(np.setdiff1d(week1, week2))
print(np.setxor1d(week1, week2))
`,
      expectedOutput: `[2 3 7]
[ 2  3  5  7 11 13]
[ 5 11]
[ 5 11 13]`,
      concepts: ["set family", "intersect1d", "setxor1d"],
    },
    {
      id: "g-a1",
      tier: "advanced",
      title: "The two nearest points",
      prompt:
        "Five points and one query: points = np.array([[0.0, 0.0], [2.0, 0.0], [0.0, 2.0], [3.0, 3.0], [1.0, 1.0]]) and query = np.array([0.4, 0.5]) — the nearest-k pattern from Lesson g-02, now with you driving. Compute every point's distance to the query with np.hypot, find the 2 NEAREST positions with np.argpartition (no full sort of the distances), order just those two by distance, and print two lines: the coordinates of the two nearest points, then their distances rounded to 3 decimals with np.round.",
      hint: "dists = np.hypot(points[:, 0] - query[0], points[:, 1] - query[1]). The k smallest: np.argpartition(dists, 2)[:2], then order with np.argsort(dists[near]).",
      starter: `import numpy as np

points = np.array([[0.0, 0.0], [2.0, 0.0], [0.0, 2.0], [3.0, 3.0], [1.0, 1.0]])
query = np.array([0.4, 0.5])

# TODO: distances via np.hypot, argpartition the 2 nearest,
# sort just those 2, print coordinates then rounded distances
`,
      solution: `import numpy as np

points = np.array([[0.0, 0.0], [2.0, 0.0], [0.0, 2.0], [3.0, 3.0], [1.0, 1.0]])
query = np.array([0.4, 0.5])

dists = np.hypot(points[:, 0] - query[0], points[:, 1] - query[1])
near = np.argpartition(dists, 2)[:2]
near = near[np.argsort(dists[near])]

print(points[near])
print(np.round(dists[near], 3))
`,
      expectedOutput: `[[0. 0.]
 [1. 1.]]
[0.64  0.781]`,
      concepts: ["nearest-k", "np.hypot", "argpartition", "np.round"],
    },
    {
      id: "g-a2",
      tier: "advanced",
      title: "The frequency table, ranked — ties included",
      prompt:
        "Search terms: words = np.array([\"red\", \"blue\", \"red\", \"green\", \"green\", \"red\", \"blue\"]). Build the ranked frequency table with the value-counts idiom: np.unique with return_counts, then a kind=\"stable\" argsort on the NEGATED counts so the most frequent value comes first AND tied counts stay in ascending-value order. Print two lines: the values in that ranked order, then their counts. red (3) leads; blue and green tie at 2 and must appear alphabetically.",
      hint: "values, counts = np.unique(words, return_counts=True); order = np.argsort(-counts, kind=\"stable\"). The stability is what keeps the blue/green tie alphabetical.",
      starter: `import numpy as np

words = np.array(["red", "blue", "red", "green", "green", "red", "blue"])

# TODO: unique with counts, rank by negated counts (stable),
# print ranked values then counts
`,
      solution: `import numpy as np

words = np.array(["red", "blue", "red", "green", "green", "red", "blue"])

values, counts = np.unique(words, return_counts=True)
order = np.argsort(-counts, kind="stable")

print(values[order])
print(counts[order])
`,
      expectedOutput: `['red' 'blue' 'green']
[3 2 2]`,
      concepts: ["value counts", "np.unique", "stable argsort", "tie-breaking"],
    },
    {
      id: "g-a3",
      tier: "advanced",
      title: "The median, without sorting",
      prompt:
        "Lesson g-02 claimed a median costs one partition, never a sort. Prove it twice. For even = np.array([42, 7, 89, 15, 63, 28, 91, 3]) use np.partition with kth=[3, 4] and average the two guaranteed positions. For odd = np.array([42, 7, 89, 15, 63, 28, 91]) a single kth=3 suffices — the median IS that position. Print three lines: the even median, the odd median, and one line of two booleans confirming both match np.median. Every printed number must come from a partition, not a sort.",
      hint: "n = len(even); p = np.partition(even, [n // 2 - 1, n // 2]); the even median is (p[n // 2 - 1] + p[n // 2]) / 2. For the odd case q = np.partition(odd, len(odd) // 2) and the median is q[len(odd) // 2].",
      starter: `import numpy as np

even = np.array([42, 7, 89, 15, 63, 28, 91, 3])
odd = np.array([42, 7, 89, 15, 63, 28, 91])

# TODO: two medians via partition only, then the np.median agreement line
`,
      solution: `import numpy as np

even = np.array([42, 7, 89, 15, 63, 28, 91, 3])
odd = np.array([42, 7, 89, 15, 63, 28, 91])

n = len(even)
p = np.partition(even, [n // 2 - 1, n // 2])
med_even = (p[n // 2 - 1] + p[n // 2]) / 2

q = np.partition(odd, len(odd) // 2)
med_odd = q[len(odd) // 2]

print(med_even)
print(med_odd)
print(med_even == np.median(even), med_odd == np.median(odd))
`,
      expectedOutput: `35.0
42
True True`,
      concepts: ["np.partition", "median", "kth sequence"],
    },
    {
      id: "g-a4",
      tier: "advanced",
      title: "Competition ranks from unique's inverse",
      prompt:
        "Six scores: scores = np.array([90, 70, 90, 60, 85, 70]). Produce COMPETITION ranks — tied scores share the lowest tied rank (90 ranks 1, 85 ranks 2, both 70s rank 3, 60 ranks 5) — using np.unique's return_inverse as a rank engine, in three lines of real work: negate the scores so ascending-unique means descending score, take values and inverse from np.unique(-scores, return_inverse=True), and add 1 to the inverse. Print two lines: the scores, then their ranks. The inverse IS 'which distinct value am I, from the smallest' — negation plus one turns that into 'how many distinct scores beat me, plus one'.",
      hint: "values, inverse = np.unique(-scores, return_inverse=True); ranks = inverse + 1. Unique sorts ascending, so the FIRST distinct value of -scores is the LARGEST score — position 0 plus 1 is rank 1.",
      starter: `import numpy as np

scores = np.array([90, 70, 90, 60, 85, 70])

# TODO: unique on -scores with return_inverse; ranks = inverse + 1;
# print scores, then ranks
`,
      solution: `import numpy as np

scores = np.array([90, 70, 90, 60, 85, 70])

values, inverse = np.unique(-scores, return_inverse=True)
ranks = inverse + 1

print(scores)
print(ranks)
`,
      expectedOutput: `[90 70 90 60 85 70]
[1 3 1 4 2 3]`,
      concepts: ["np.unique", "return_inverse", "competition ranking"],
    },
  ],

  // ------------------------------------------------------------------
  // Part G assessment
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "g-as-1",
      prompt: "Which statement about np.sort(a) and a.sort() is TRUE?",
      options: [
        { text: "np.sort(a) sorts a in place; a.sort() returns a sorted copy", correct: false, feedback: "Exactly backwards — swap the two and the statement becomes correct." },
        { text: "np.sort(a) returns a sorted copy and leaves a untouched; a.sort() rearranges a itself and returns None", correct: true, feedback: "Correct — and np.shares_memory(a, np.sort(a)) is False proves the copy, while b = b.sort() loses your array to None." },
        { text: "Both return sorted copies; only the argument style differs", correct: false, feedback: "a.sort() returns None — sorting YOUR array, not handing you a new one. Assigning its result destroys the variable." },
        { text: "Both sort in place; np.sort is just the faster spelling", correct: false, feedback: "np.sort never touches the original — the result lives in a fresh block (Lesson g-01 proved it with shares_memory)." },
      ],
      explanation: "Function = copied result, original safe. Method = in-place, returns None. Choose by whether the original order is still worth anything.",
    },
    {
      id: "g-as-2",
      prompt: "`x[x.argsort()]` always equals:",
      options: [
        { text: "np.sort(x)", correct: true, feedback: "The identity at the heart of the index dance: argsort gives the visit order, gathering by it IS sorting." },
        { text: "x itself", correct: false, feedback: "Only in the special case where x is already sorted — in general the gather reorders everything." },
        { text: "np.argsort(x) applied twice", correct: false, feedback: "argsort(argsort(x)) is the RANK array (which position each element takes), not sorted values." },
        { text: "x reversed", correct: false, feedback: "Reversal is descending order at best; the gather gives ascending order whatever x held." },
      ],
      explanation: "argsort returns positions in sorted-value order; fancy indexing with those positions delivers the sorted values. The index dance, one line.",
    },
    {
      id: "g-as-3",
      prompt: "In `np.lexsort((names, -levels, -scores))`, which key decides first?",
      options: [
        { text: "names, because it is listed first", correct: false, feedback: "The classic trap: lexsort reads keys LAST-first. First-listed is the FINAL tie-breaker." },
        { text: "-scores, because the LAST key is primary", correct: true, feedback: "Right: -scores (descending score) leads, -levels breaks ties, names settles what is left. Read the tuple right to left." },
        { text: "All keys simultaneously, with conflicts raising an error", correct: false, feedback: "No error — that ambiguity is exactly what the fixed key priority resolves, last key first." },
        { text: "Whichever key has no negative sign", correct: false, feedback: "Negation controls ASCENDING vs DESCENDING within a key, not the priority between keys." },
      ],
      explanation: "lexsort's surprise: the last key is primary. np.lexsort((names, -levels, -scores)) sorts by score descending, then level descending, then name ascending.",
    },
    {
      id: "g-as-4",
      prompt: "After `p = np.partition(a, 2)`, which statement is TRUE?",
      options: [
        { text: "p is fully sorted ascending", correct: false, feedback: "That would be np.sort's promise — partition deliberately leaves the sides unordered to stay O(n)." },
        { text: "p[2] holds the 3rd smallest value; everything smaller lives somewhere in p[:2] and everything larger somewhere in p[3:]", correct: true, feedback: "The exact contract: one guaranteed position, two correctly-populated sides, no order promised within them." },
        { text: "p[:2] holds the two smallest values in ascending order", correct: false, feedback: "The two smallest ARE in p[:2] — but in no promised order. Sorting that slice is your job (and it is cheap)." },
        { text: "p[2] holds the 2nd smallest value", correct: false, feedback: "Positions are 0-based: p[2] is the THIRD smallest. The rank-versus-position slip, caught again." },
      ],
      explanation: "Partition guarantees position kth exactly, populates both sides correctly, and promises nothing about order inside the sides. Trust exactly that contract.",
    },
    {
      id: "g-as-5",
      prompt: "`labels = np.where(prices > 100, \"high\", \"low\")` returns:",
      options: [
        { text: "Only the prices above 100, as an array", correct: false, feedback: "That is prices[prices > 100] — the mask FILTERS. Three-argument where never drops anything." },
        { text: "A new array shaped like prices, each slot holding \"high\" or \"low\"", correct: true, feedback: "The vectorized if/else: same slots, swapped contents. Replacements, not filters." },
        { text: "The positions where prices > 100", correct: false, feedback: "That is one-argument np.where(prices > 100) — the argument count changes the question." },
        { text: "A count of the expensive items", correct: false, feedback: "Counting is np.count_nonzero(prices > 100); where answers every element, not a tally." },
      ],
      explanation: "Three-argument where is the replacement engine: condition-shaped output, a-branch where True, b-branch where False. Filtering belongs to boolean masks.",
    },
    {
      id: "g-as-6",
      prompt: "For a 2-D mask, np.nonzero and np.argwhere differ how?",
      options: [
        { text: "nonzero returns a tuple of one index array per axis; argwhere returns one coordinate row per match", correct: true, feedback: "Exactly — nz is shaped for fancy indexing (grid[nz]), argwhere for reading coordinate pairs off the page." },
        { text: "argwhere returns the values; nonzero returns the positions", correct: false, feedback: "Both return position information; the VALUES are what you get by gathering (grid[np.nonzero(grid)])." },
        { text: "nonzero only works on 1-D arrays; argwhere handles any dimension", correct: false, feedback: "Both handle any dimension — nonzero's answer just grows one index array per axis." },
        { text: "They are aliases; the difference is only speed", correct: false, feedback: "Different shapes, different consumers — the docs even note argwhere is inconvenient for indexing, which is nonzero's whole design." },
      ],
      explanation: "nonzero: tuple of per-axis index arrays, index-ready. argwhere: (ndim, n_matches) coordinate rows, read-ready. column_stack(nonzero) == argwhere.",
    },
    {
      id: "g-as-7",
      prompt: "On sorted data, `np.searchsorted(s, 90, side=\"right\") - np.searchsorted(s, 90, side=\"left\")` equals:",
      options: [
        { text: "The number of elements exactly equal to 90", correct: true, feedback: "The insertion points bracket the run of equal values: left points before it, right after it, and the gap between them is the count." },
        { text: "Always 1", correct: false, feedback: "Only when 90 appears exactly once. Duplicate runs make the gap grow — with three copies of 90 it is 3." },
        { text: "The number of elements strictly below 90", correct: false, feedback: "That is the LEFT insertion point alone — one number, no subtraction needed." },
        { text: "0, because both sides return the same index", correct: false, feedback: "They coincide only when the value is absent. Present values make left and right disagree by the size of the run." },
      ],
      explanation: "side= chooses before-or-after the run of equal values; right minus left is exactly the length of that run — the 'how many tied at this score' answer with two binary searches.",
    },
    {
      id: "g-as-8",
      prompt: "You need every id in A that is NOT in B — sorted, duplicates collapsed. The one call is:",
      options: [
        { text: "np.setdiff1d(A, B)", correct: true, feedback: "The directional difference: in A, not in B, returned as a sorted set — exactly the specification." },
        { text: "np.setxor1d(A, B)", correct: false, feedback: "XOR keeps everything that changed sides — B's newcomers included. You asked for A's side only." },
        { text: "np.intersect1d(A, B)", correct: false, feedback: "Intersection keeps what is in BOTH — the opposite of what you asked." },
        { text: "np.union1d(A, B)", correct: false, feedback: "Union keeps everything from either side; nothing is subtracted." },
      ],
      explanation: "setdiff1d(a, b) is the 'in a but not b' question — directional, sorted, duplicate-free. Swap the arguments and you get B's side instead.",
    },
  ],

  // ------------------------------------------------------------------
  // Part G mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Leaderboard Engine",
    brief:
      "Build the ranking engine a small competition actually needs, using every tool in this part once. From one hand-built dataset of twelve players (names, scores, levels, regions) you will produce: the full ranking with two levels of tie-breaking (one lexsort call), the top-3 podium per region (argpartition plus a mini-sort — never a full sort), threshold reports ('how many scored below 1400?') via searchsorted on the sorted scores, a check-in deduplication report with unique and return_counts, and a head-to-head VIP membership report with isin. Every number the engine prints comes from a verified NumPy call — the same discipline this course has kept since Part A.",
    requirements: [
      "The full ranking with ONE np.lexsort call: score DESCENDING, ties broken by level DESCENDING, remaining ties by name ASCENDING — printed as 'rank name score' for the top 5",
      "The top-3 per region for each of eu, na and apac, built with np.argpartition (never a full sort of the region), then sorted JUST those three — print region, the three names and the three scores in descending order",
      "A threshold report from np.searchsorted on the scores sorted once: how many players scored strictly below 1400, and how many scored at most 1420 (side= decides strictness)",
      "A check-in deduplication report: np.unique with return_counts over the checkins array, printed as one 'id count' line per distinct player",
      "A head-to-head report: np.isin over the player names against the VIP list, printing only the players who ARE VIPs",
      "The only loop allowed is the loop over the three region names — everything else is whole-array calls",
      "No randomness anywhere: the dataset is hand-built and every output is reproducible run for run",
    ],
    steps: [
      "Type in the dataset block (names, scores, levels, regions, checkins, vips) and run the starter — it prints the player count and the best score as a sanity check. Verify 12 players and a best score of 1750.",
      "Build the full ranking: one np.lexsort call with keys (names, -levels, -scores) — remember the LAST key is primary. Print 'rank name score' for the first five positions: Eli, Bo, Lu, Hia, Cai should lead the board.",
      "Sort the scores once into sorted_scores. Answer both threshold questions with np.searchsorted: strictly below 1400 should report 5, at most 1420 should report 8.",
      "Per region: mask with regions == region, take that region's names and scores, argpartition the top-3 positions, sort those three descending, print. Check apac carefully — Lu (1620) leads, then the 1420 tie Cai before Fyn, because levels break it 4 over 3.",
      "Dedup the check-ins: np.unique(checkins, return_counts=True), then print each id beside its count — Ana checked in 4 times, Bo and Eli 2 each, Kim and Lu once.",
      "Flag the VIPs: one np.isin call over names against vips, boolean-index the names, print the survivors — Bo, Eli and Lu.",
      "Read the whole report top to bottom and confirm every printed number traces back to one of this part's functions. That traceability is the deliverable, not the numbers.",
    ],
    starter: `import numpy as np

# --- the competition dataset (hand-built, deterministic) ------------
names = np.array(["Ana", "Bo", "Cai", "Dee", "Eli", "Fyn",
                  "Gus", "Hia", "Ivo", "Jo", "Kim", "Lu"])
scores = np.array([1420, 1680, 1420, 990, 1750, 1420,
                   880, 1550, 990, 1310, 1180, 1620])
levels = np.array([3, 5, 4, 2, 5, 3, 1, 4, 2, 3, 2, 4])
regions = np.array(["eu", "na", "apac", "eu", "na", "apac",
                    "eu", "na", "apac", "eu", "na", "apac"])

checkins = np.array(["Ana", "Bo", "Ana", "Eli", "Bo", "Ana",
                     "Lu", "Ana", "Kim", "Eli"])
vips = np.array(["Bo", "Eli", "Lu"])

print("players:", names.size, "| best score:", scores.max())

# --- 1. the full ranking --------------------------------------------
# Rule: score DESC, tie -> level DESC, tie -> name ASC.
# TODO: replace the placeholder with ONE np.lexsort call and print
#       "rank name score" for the top 5
order = np.arange(names.size)
print("top of the board:")
for rank, i in enumerate(order[:5], start=1):
    print(rank, names[i], scores[i])

# --- 2. threshold questions ----------------------------------------
sorted_scores = np.sort(scores)
print("sorted scores:", sorted_scores)
# TODO: with np.searchsorted, print how many scored strictly below 1400
#       and how many scored at most 1420 (side= decides)

# --- 3. top-3 per region --------------------------------------------
for region in ("eu", "na", "apac"):
    mask = regions == region
    r_names, r_scores = names[mask], scores[mask]
    # TODO: argpartition the top-3 positions, sort just those three,
    #       print region, names and scores in descending order
    print(region, "has", mask.sum(), "players")

# --- 4. check-in dedup ----------------------------------------------
# TODO: np.unique(checkins, return_counts=True); print 'id count'
#       for every distinct player who checked in
print("check-ins recorded:", checkins.size)

# --- 5. head-to-head membership -------------------------------------
# TODO: flag which players are VIPs with np.isin, then print only
#       the names that made the cut
print("vip list:", vips)
`,
    concepts: ["np.lexsort", "np.argpartition", "np.searchsorted", "np.unique", "np.isin", "leaderboard patterns"],
    extension:
      "Two stretch goals: (1) give every player a competition rank (tied scores share the lowest tied rank) with np.unique(-scores, return_inverse=True) — the inverse plus one IS the rank, as exercise g-a4 proved; (2) answer 'where would a brand-new score of 1500 rank on this board?' with one np.searchsorted call against the sorted scores — no player has that score, and the insertion point still answers.",
  },
};
