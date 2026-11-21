/**
 * PART F — MATHEMATICS AND STATISTICS: THE NUMBER WORKHORSES
 *
 * The number workhorses: the complete elementwise arithmetic story
 * (operators, floor division sign rules, in-place dtype discipline) ->
 * the math function toolbox (roots, exponentials, logs, rounding,
 * clipping) -> statistics (centers, spread, weighted averages,
 * percentiles, correlation) -> aggregations along axes (sum, prod,
 * cumsum, argmin/argmax, any/all, keepdims) -> counting and binning
 * (unique, bincount, histogram, digitize).
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

export const PART_F: NumpyPart = {
  letter: "F",
  title: "Mathematics and Statistics: The Number Workhorses",
  tagline:
    "Elementwise math, the function toolbox, statistics, aggregations and counting — every function with its card",
  description:
    "Every piece of number work in NumPy flows through the tools in this part: the complete elementwise arithmetic story (all seven operators, the sign rules of floor division and modulo on negatives, and the strict dtype rules of in-place operators), the math function toolbox (roots, exponentials, logarithms, the rounding family and clipping), statistics from centers to spread (mean, median, weighted averages, standard deviation and its ddof story, percentiles and correlation), aggregations that fold arrays along axes (sum, prod, cumsum, argmin and argmax, any and all, keepdims), and the counting and binning finishers (bincount, histogram, digitize). Every function earns a full reference card, and every output shown is machine-verified against the exact NumPy build the browser playground runs.",
  lessons: [
    // ------------------------------------------------------------- f-01
    {
      slug: "f-01",
      title: "Elementwise Arithmetic, Complete",
      minutes: 14,
      summary:
        "Every arithmetic operator on arrays, with the rules nobody tells you about: true division always produces float64, floor division and mod follow the floor convention on negatives, integer powers refuse negative exponents, and in-place operators never change dtype.",
      kind: "concept",
      objectives: [
        "Predict the result and dtype of every elementwise operator (+ - * / // % **) on arrays, scalars and mixed pairs",
        "Apply the sign rules of floor division and modulo on negative operands, and prove them with the divmod identity",
        "Explain why in-place operators refuse to change dtype, and read the casting error they raise when you try",
        "Use comparisons as boolean arrays and avoid the chained-comparison trap from Lesson e-03",
        "Predict when += on a view silently mutates the base array (the Lesson d-03 recap)",
      ],
      why: "Arithmetic is the layer every later lesson stands on — statistics, aggregations, machine learning, all of it reduces to these operators running elementwise over packed memory. But the edge cases are where real bugs live: a / that quietly turns integers into float64, a // that rounds toward negative infinity instead of toward zero, an in-place += that crashes on an int array because it will not change dtype, and a += on a view that mutates an array you thought was separate. This lesson pins every one of those rules down with code you can rerun, so the behavior stops being folklore and becomes something you can predict.",
      blocks: [
        {
          kind: "text",
          text: "You already know these symbols from Python — `+ - * / // % **` — and NumPy reuses every one of them. The new part is the **elementwise rule**: when two arrays meet, pair them up value by value and apply the operator to each pair separately. A ten-thousand-element price list times a ten-thousand-element tax rate is ten thousand multiplications in one line, with no loop written by you.",
        },
        {
          kind: "code",
          title: "The seven operators at a glance",
          code: `import numpy as np

prices = np.array([4.50, 2.75, 9.99])
qty = np.array([2, 4, 1])

print(prices * qty)     # line totals: element by element
print(prices - 1.00)    # a flat 1.00 discount on every item
print(prices * 1.08)    # add 8% tax
`,
          output: `[ 9.   11.    9.99]
[3.5  1.75 8.99]
[ 4.86    2.97   10.7892]`,
          outputNote: "Arrays pair elementwise; a scalar stretches across the whole array. Both are the broadcasting you met in Part E, applied to arithmetic.",
          explain: [
            "`prices * qty` pairs `[4.50*2, 2.75*4, 9.99*1]` — the i-th price meets the i-th quantity.",
            "`prices - 1.00` and `prices * 1.08` show the scalar case: one number applied to every element.",
            "No loop, no `zip`, no index variables — the pairing is part of the operator itself.",
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Two escalators, same speed",
          text: "Think of two conveyor belts running side by side at the same speed: each operator grabs one item off each belt at every step, combines them, and drops the result on the output belt. Same length belts pair up perfectly; different lengths are a broadcasting question (Part E), not a pairing one.",
        },
        {
          kind: "heading",
          text: "True division never gives you integers",
        },
        {
          kind: "text",
          text: "Here is the first rule that surprises people with a C, Java or old-Python background: in NumPy, `/` is **true division**, and it always returns floating point — even when both operands are integer arrays and even when every result is a whole number. `//` is the one that keeps integers.",
        },
        {
          kind: "code",
          title: "Two ways to divide, two dtypes",
          code: `import numpy as np

treats = np.array([3, 10, 7])
dogs = np.array([2, 4, 2])

print(treats / dogs)
print((treats / dogs).dtype)

print(treats // dogs)
print((treats // dogs).dtype)
`,
          output: `[1.5 2.5 3.5]
float64
[1 2 3]
int64`,
          outputNote: "The same operands, two different operators: / produced float64, // kept int64.",
          explain: [
            "`3 / 2` became `1.5` — true division computes the full quotient, so it must leave integer land.",
            "`treats // dogs` floor-divides and stays `int64` because every result fits an integer.",
            "If you feed `/` int32 or int16 arrays you still get float64 — the float type is the rule, not a coincidence of int64.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The Python 2 refugee note",
          text: "In Python 2 and several older languages, `7 / 2` on integers was `3` — silent truncation, and a famous source of bugs. Python 3 and NumPy made `/` always true division precisely so that never happens again. If you see old code using `/` on integer arrays expecting truncation, it predates this fix and behaves differently today.",
        },
        {
          kind: "heading",
          text: "Floor division and mod: the sign rules",
        },
        {
          kind: "text",
          text: "`//` is called **floor division** because it rounds the quotient *down* — toward negative infinity, not toward zero. The remainder operator `%` (its function name is `np.mod`) is defined so that one identity always holds: **dividend == divisor * (dividend // divisor) + (dividend % divisor)**. That single identity predicts every case, including the negative ones people get wrong.",
        },
        {
          kind: "code",
          title: "All four sign combinations, verified",
          code: `import numpy as np

a = np.array([7, -7, 7, -7])
b = np.array([3, 3, -3, -3])

print("a // b  =", a // b)
print("a %  b  =", a % b)

# the identity that makes the rules consistent:
print("b*(a//b) + a%b == a :", b * (a // b) + (a % b) == a)
`,
          output: `a // b  = [ 2 -3 -3  2]
a %  b  = [ 1  2 -2 -1]
b*(a//b) + a%b == a : [ True  True  True  True]`,
          outputNote: "Read each column: 7 with 3, then -7 with 3, then 7 with -3, then -7 with -3.",
          explain: [
            "`-7 // 3` is `-3`, not `-2`: the true quotient is -2.33, and flooring goes *down* to -3.",
            "`-7 % 3` is `2`, not `-1`: the remainder takes the **sign of the divisor**, and 3*(-3) + 2 really is -7.",
            "`7 // -3` is `-3` and `7 % -3` is `-2` — floor toward negative infinity again, remainder negative like the divisor.",
            "The final line checks the identity for all four combinations at once: all True.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The two-line summary",
          text: "`//` floors toward negative infinity (so on negatives it can move away from zero), and `%` takes the sign of the divisor. If you need the C-style remainder that keeps the dividend's sign, that function exists too: `np.fmod(-7, 3)` gives `-1` where `np.mod(-7, 3)` gives `2`.",
        },
        {
          kind: "functionDoc",
          name: "np.floor_divide",
          purpose: "Divide two arrays and round the quotient down toward negative infinity — the function form of the // operator.",
          signature:
            "np.floor_divide(x1, x2, /, out=None, *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "When you need 'how many whole times does the divisor fit' — whole pages, full boxes, complete hours — floor division is the tool. It differs from truncating division (what C's / does for integers) exactly on negative quotients: -7 / 4 truncated is -1, but floored is -2, because -2 is further down. NumPy's // operator and np.floor_divide are the same function; call it by name when you want to pass out= or use it inside other NumPy APIs that take functions.",
          params: [
            {
              name: "x1",
              type: "array_like",
              required: true,
              description: "The dividends (numerators). Scalar or array, any numeric dtype.",
              example: "np.array([-7, -6, 6, 7])",
            },
            {
              name: "x2",
              type: "array_like",
              required: true,
              description: "The divisors (denominators). Broadcast against x1 (Part E). Dividing by zero emits a RuntimeWarning and yields 0 rather than raising.",
              example: "4",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write the quotients into, instead of allocating a fresh result.",
              example: "out=q",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "A boolean mask: only positions where it is True are computed; other positions keep whatever out holds there. Requires out.",
              example: "where=mask",
            },
          ],
          returns: {
            type: "ndarray",
            description: "The floored quotients. Integer inputs stay integer; if either input is float, the result is float (floored).",
          },
          example: `import numpy as np

# A ledger in whole pages of 4 items -- some entries are adjustments (negative)
entries = np.array([-7, -6, 6, 7])
pages = np.floor_divide(entries, 4)
leftover = np.mod(entries, 4)
print(pages)
print(leftover)
`,
          exampleOutput: `[-2 -2  1  1]
[1 2 2 3]`,
          commonMistakes: [
            {
              mistake: "Expecting floor division to truncate toward zero like C or Java integer division.",
              why: "The name is literal: it floors. -7 // 4 is -2 (floor of -1.75), while truncation would say -1. On non-negative data the two agree, which is why the bug hides until the first negative number arrives.",
              fix: "If you truly want truncation-toward-zero, use np.trunc on the true quotient: np.trunc(entries / 4). But ask whether flooring was the mathematically right answer all along — it usually is.",
            },
            {
              mistake: "Using // when the answer needs decimals, then wondering where the fractions went.",
              why: "Integer // integer stays integer by design; 7 // 2 is 3, not 3.5. The // operator is a statement that you want whole quotients.",
              fix: "Use true division / for the exact quotient — it returns float64. Convert deliberately, not by accident.",
            },
            {
              mistake: "Dividing by zero and expecting a crash.",
              why: "NumPy does not raise; it prints a RuntimeWarning (divide by zero encountered) and puts 0 in the result. The error-free exit can hide a data bug.",
              fix: "Check the divisor first (np.any(b == 0)) or let the warning surface loudly during development.",
            },
          ],
          related: [
            { name: "np.true_divide", relation: "The / operator's function name: exact quotients, always float." },
            { name: "np.mod", relation: "The remainder that pairs with floor division — together they satisfy the divmod identity." },
            { name: "np.fmod", relation: "The C-style remainder that keeps the dividend's sign: fmod(-7, 3) is -1, mod(-7, 3) is 2." },
            { name: "np.divmod", relation: "Both results in one pass — quotient and remainder together." },
          ],
          applications: [
            "Converting quantities into whole units: total minutes into hours and leftover minutes, cents into dollars and coins",
            "Pagination and bucketing: which page does item i land on is i // page_size",
            "Grid math: which cell of a flat row-major buffer does a flat index belong to (floor division by the row length)",
          ],
          notes:
            "On float inputs, floor_divide floors the quotient (np.floor(x1 / x2) computed in one pass without a rounding race); the // operator calls this exact function.",
        },
        {
          kind: "functionDoc",
          name: "np.divmod",
          purpose: "Return the floored quotient and the remainder of a division in one pass — both answers at once.",
          signature:
            "np.divmod(x1, x2, /, out=(None, None), *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "Whenever you floor-divide and immediately also want the leftover, np.divmod computes both together in a single sweep — cheaper than running // and then % separately, and impossible to get inconsistent because both come from the same division. It returns a tuple of two arrays (quotient first, remainder second), exactly matching Python's built-in divmod for scalars and NumPy's floor-division rules for arrays.",
          params: [
            {
              name: "x1",
              type: "array_like",
              required: true,
              description: "The dividends. Any shape or numeric dtype; scalars work too.",
              example: "np.array([135, 62, 45, 150])",
            },
            {
              name: "x2",
              type: "array_like",
              required: true,
              description: "The divisors, broadcast against x1.",
              example: "60",
            },
            {
              name: "out",
              type: "tuple of 2 ndarrays",
              description: "Where to write the two results: out=(quotients, remainders). Most code simply unpacks the return value instead.",
              example: "out=(q, r)",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "Boolean mask of positions to compute; requires out to be set.",
              example: "where=mask",
            },
          ],
          returns: {
            type: "tuple of 2 ndarrays",
            description: "(quotients, remainders) — the same pair // and % produce, computed together. The identity x2*q + r == x1 always holds elementwise.",
          },
          example: `import numpy as np

# Every recording length in minutes -> hours and leftover minutes
minutes = np.array([135, 62, 45, 150])
hours, leftover = np.divmod(minutes, 60)
print(hours)
print(leftover)
`,
          exampleOutput: `[2 1 0 2]
[15  2 45 30]`,
          commonMistakes: [
            {
              mistake: "Expecting truncation-toward-zero quotients for negative dividends.",
              why: "np.divmod uses floor division, matching Python's // and %: divmod(-7, 60) gives (-1, 53), not (-1, -7) or (0, -7). The remainder always has the divisor's sign.",
              fix: "Test one negative case whenever the input can go below zero — that is where every division convention disagrees.",
            },
            {
              mistake: "Treating the result as a single array and indexing it like result[0] expecting the first element's quotient.",
              why: "The result is a tuple of two arrays: element 0 is the whole quotient array, not one number. Indexing works, but you get an array, not a scalar.",
              fix: "Unpack at the call: hours, leftover = np.divmod(minutes, 60) — the intent-reading form.",
            },
            {
              mistake: "Dividing by an array containing zero and not noticing.",
              why: "Like // and %, divmod by zero warns (RuntimeWarning) and returns 0 for the quotient rather than raising.",
              fix: "Screen divisors during development: assert not np.any(b == 0) in a sanity check, or log np.count_nonzero(b == 0).",
            },
          ],
          related: [
            { name: "np.floor_divide", relation: "Just the quotient half of divmod." },
            { name: "np.mod", relation: "Just the remainder half of divmod." },
            { name: "divmod (builtin)", relation: "Python's own scalar version — same floor semantics, same operand order." },
          ],
          applications: [
            "Unit conversion with leftovers: minutes into hours+minutes, cents into dollars+cents, bytes into KB+bytes",
            "Splitting a flat index into (row, col): divmod(flat_index, row_length) — the row-major companion of unravel_index",
            "Scheduling: how many full shifts does each workload need, and what hangs over into a partial one",
          ],
        },
        {
          kind: "heading",
          text: "Powers",
        },
        {
          kind: "code",
          title: "The ** operator on integer arrays",
          code: `import numpy as np

base = np.array([2, 3, 10])
print(base ** 2)     # squares
print(base ** 0)     # anything to the zeroth power
`,
          output: `[  4   9 100]
[1 1 1]`,
          explain: [
            "`**` is elementwise: each base gets its own exponent when both sides are arrays.",
            "Integer arrays with non-negative integer exponents stay integers — 2**10 is 1024, no floats needed.",
          ],
        },
        {
          kind: "code",
          title: "What integer arrays refuse to do",
          code: `import numpy as np

# 2**-1 is 0.5 -- not an integer, and NumPy will not pretend otherwise
base = np.array([2, 3])
base ** -1
`,
          expectError:
            "ValueError: Integers to negative integer powers are not allowed.",
          outputNote: "Run this to see the exact refusal: negative powers of integers are not integers, and NumPy declines to guess your intent.",
        },
        {
          kind: "code",
          title: "The fix: become a float first",
          code: `import numpy as np

base = np.array([2, 3])
print(base.astype(np.float64) ** -1)
`,
          output: `[0.5        0.33333333]`,
          explain: [
            "Converting the base to float64 first makes negative powers perfectly well-defined: 0.5 and 0.333... are ordinary floats.",
            "This is the honest pattern: say what you want (floats) instead of hoping NumPy will convert for you — it will not, silently or otherwise.",
          ],
        },
        {
          kind: "heading",
          text: "Comparisons hand back boolean arrays",
        },
        {
          kind: "code",
          title: "Every comparison operator is elementwise too",
          code: `import numpy as np

temps = np.array([12.5, 19.0, 23.5, 21.0, 18.5])

print(temps > 20)
print((temps > 20).dtype)

# combine conditions with & (and) | (or) ~ (not) -- parentheses required
warm_and_not_hot = (temps > 20) & (temps < 23)
print(warm_and_not_hot)
`,
          output: `[False False  True  True False]
bool
[False False False  True False]`,
          outputNote: "The result of a comparison is an array of True/False with the same shape as the operand — a boolean mask you can index with (Lesson e-03).",
          explain: [
            "`temps > 20` asked five questions at once and kept all five answers.",
            "The dtype is bool — one byte per element, and the raw material for boolean indexing.",
            "Because & binds tighter than the comparisons, the parentheses in `(temps > 20) & (temps < 23)` are not optional.",
          ],
        },
        {
          kind: "code",
          title: "The chained comparison trap",
          code: `import numpy as np

temps = np.array([12.5, 19.0, 23.5])

# Works for Python scalars -- falls apart for arrays
0 < temps < 1
`,
          expectError:
            "ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()",
          outputNote:
            "Python rewrites 0 < temps < 1 as (0 < temps) and (temps < 1); the and needs one True/False, but 0 < temps is a three-element array.",
        },
        {
          kind: "text",
          text: "That error is the array version of a grammar mistake: `and`/`or`/`not` want a single truth value, and an array of three booleans is not one. Write `(0 < temps) & (temps < 1)` instead. Lesson e-03 makes boolean masks a full topic — here the takeaway is just that comparisons produce arrays, and arrays refuse to be squeezed into one yes/no.",
        },
        {
          kind: "heading",
          text: "In-place operators: same dtype or no deal",
        },
        {
          kind: "text",
          text: "The augmented assignments `+= -= *= /= //= %= **=` are **in-place**: they try to write the new values back into the same memory the array already uses. That leads to a strict rule — *the operation must be able to produce the array's own dtype*. Integers going in means integers must come out.",
        },
        {
          kind: "code",
          title: "In-place arithmetic that is legal",
          code: `import numpy as np

stock = np.array([10, 12, 15])
stock += 3          # add 3 to every count: still int64
print(stock)

stock //= 2         # floor-halve in place: still int64
print(stock)
`,
          output: `[13 15 18]
[6 7 9]`,
          explain: [
            "`stock += 3` really is `stock = stock + 3` semantically, but executed by writing into stock's buffer — no new array is allocated.",
            "Both operations keep int64, so both are allowed.",
          ],
        },
        {
          kind: "code",
          title: "In-place arithmetic that is not",
          code: `import numpy as np

stock = np.array([10, 12, 15])
stock += 1.5        # 1.5 is a float; int64 cannot hold it exactly
`,
          expectError:
            "numpy._core._exceptions._UFuncOutputCastingError: Cannot cast ufunc 'add' output from dtype('float64') to dtype('int64') with casting rule 'same_kind'",
          outputNote:
            "The exact error NumPy 2 raises: the add produces float64, and writing float64 into an int64 buffer would round — so NumPy refuses rather than corrupt your data silently.",
        },
        {
          kind: "text",
          text: "Read that error slowly once and it becomes a friend: *cannot cast ufunc output from float64 to int64 with casting rule same_kind*. The sum would be `11.5, 13.5, 16.5` — storing those in an int array would silently truncate them, and NumPy will not silently destroy data. The fix is to make the change out-of-place: `stock = stock + 1.5` builds a **new** float64 array with room for the truth. If you truly want integers back, say so in two steps: `stock = (stock + 1.5).astype(np.int64)` — an explicit truncation you chose, not one that happened to you.",
        },
        {
          kind: "heading",
          text: "+= on a view mutates the base (30-second recap)",
        },
        {
          kind: "code",
          title: "Proof that in-place means in-memory",
          code: `import numpy as np

base = np.arange(1, 7).reshape(2, 3)
view = base[0]        # first row: a VIEW into base's buffer (Lesson d-03)

view += 100           # in-place: writes through to base

print(base)
print("view shares memory with base:", np.shares_memory(view, base))
`,
          output: `[[101 102 103]
 [  4   5   6]]
view shares memory with base: True`,
          outputNote: "The row never had its own data — view += 100 edited base's first row directly.",
          explain: [
            "`base[0]` is a view (a window into base's buffer), not a copy — Lesson d-03's rule.",
            "An in-place operator writes into the buffer the view looks through, so the base array changes too.",
            "`np.shares_memory` is the forensic check when you suspect cross-contamination between arrays.",
          ],
        },
        {
          kind: "arrayViz",
          title: "A quotient grid you can explore",
          mode: "explore",
          name: "q",
          data: [
            [3, 3, 4, 4],
            [4, 5, 5, 5],
            [6, 6, 6, 7],
          ],
          dtype: "int64",
          caption:
            "q = n // 3 for n = 10, 11, ..., 21, laid out 3x4. The staircase is the story: three or four consecutive n values share each quotient, and the step happens exactly when n crosses a multiple of 3 (12, 15, 18, 21). Click cells to see the [row, col] index behind each value — flat positions 0-11 map to n = 10-21 in reading order.",
        },
        {
          kind: "tryIt",
          title: "Break each rule on purpose",
          task:
            "Run it, then: (1) change the floor division to true division and watch the dtype line; (2) switch the negatives in b and predict the // and % lines before re-running; (3) un-comment the += line to see the casting error yourself; (4) swap the * for ** and give it an array of exponents.",
          code: `import numpy as np

a = np.array([7, -7, 7, -7])
b = np.array([3, 3, -3, -3])

print("a // b =", a // b)
print("a %  b =", a % b)

ints = np.array([6, 8, 10])
print("ints / 2 =", ints / 2, (ints / 2).dtype)

stock = np.array([10, 12, 15])
# stock += 1.5   # un-comment me to meet the casting error
print("stock still:", stock)
`,
          hint: "For step 2 remember: // floors toward negative infinity, % takes the divisor's sign. For step 3, the error mentions same_kind casting — that is the same-precision rule refusing to truncate.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Operators pair elementwise; `/` always floats, `//` always floors, `%` takes the divisor's sign; integer arrays refuse negative powers; comparisons give boolean arrays you combine with `&` and `|`; in-place operators keep the dtype or raise; and in-place on a view edits the base.",
        },
      ],
      terms: [
        { term: "elementwise", definition: "Array arithmetic where the operator pairs corresponding elements and never mixes neighbors: `[1,2] * [10,20]` is `[10, 40]`, not a dot product." },
        { term: "true division", definition: "The `/` operator: exact quotients, always produced as floating point (float64 for integer inputs) so nothing is ever silently truncated." },
        { term: "floor division", definition: "The `//` operator: the quotient rounded down toward negative infinity. On negatives it can move away from zero (-7 // 4 is -2)." },
        { term: "in-place operator", definition: "An augmented assignment like `+=` that writes results back into the array's existing buffer — which forces the same-dtype rule and, on a view, mutates the base array." },
        { term: "same-kind casting", definition: "NumPy's casting policy for in-place writes: a result may only overwrite the buffer if no precision would be lost — float64 results may not be squeezed into an int64 buffer." },
      ],
      mistakes: [
        {
          mistake: "Assuming integer / integer truncates to an integer (C habit, or memories of Python 2).",
          why: "NumPy's / is true division by design: 7 / 2 is 3.5 and the whole result array becomes float64, so a downstream integer assumption breaks in a place far from the division.",
          fix: "Use // when you mean whole quotients. If a function must return integers, convert explicitly with .astype(np.int64) and comment why truncation is acceptable.",
        },
        {
          mistake: "Writing a += 1.5 on an int array and being surprised by a casting error instead of a rounded result.",
          why: "In-place operators must write back into the array's own dtype; float64 into int64 would lose the .5 silently, so NumPy raises UFuncOutputCastingError.",
          fix: "Go out-of-place (a = a + 1.5 gives a new float array) or convert explicitly in two steps you chose yourself.",
        },
        {
          mistake: "Chaining comparisons like 0 < a < 1 the way you would with Python scalars.",
          why: "Python expands it to `(0 < a) and (a < 1)`; the and demands one truth value and a boolean array has many, so NumPy raises the ambiguous-truth-value error.",
          fix: "Join elementwise conditions with & (and), | (or), ~ (not) — always in parentheses, because they bind tighter than comparisons.",
        },
        {
          mistake: "Using += inside a function on what turns out to be a view, and mutating the caller's array.",
          why: "In-place writes go to the underlying buffer. If the array is a view or shares memory with data you did not mean to touch, the edit lands there too — Lesson d-03's rule with arithmetic consequences.",
          fix: "Check np.shares_memory when in doubt, or force independence first with a copy: view = base[0].copy().",
        },
      ],
      takeaways: [
        "All seven operators pair elementwise; scalars stretch across the array via broadcasting.",
        "`/` always returns float64 — even int/int — while `//` floors toward negative infinity and keeps integers.",
        "`%` takes the divisor's sign, and the identity `b*(a//b) + a%b == a` holds for every sign combination.",
        "Integer arrays refuse negative integer powers with a ValueError; convert to float first and mean it.",
        "In-place operators keep the dtype or raise — and on a view they edit the base array's memory.",
      ],
      quiz: [
        {
          id: "f-01-q1",
          prompt: "What is the dtype of np.array([6, 8, 10]) / np.array([3, 4, 5])?",
          options: [
            { text: "int64 — every result (2, 2, 2) is a whole number", correct: false, feedback: "The values being whole does not matter: true division has a float result type by rule, not by value." },
            { text: "float64 — true division always produces floats", correct: true, feedback: "Correct. / is true division: even exact integer quotients come back as float64, so nothing is ever silently truncated." },
            { text: "It depends on the platform — int32 on Windows", correct: false, feedback: "Platform integers affect the *input* default dtype, never the output of true division, which is always float64." },
            { text: "bool — it is a comparison-like operation", correct: false, feedback: "Division is arithmetic, not comparison. Comparisons (==, <, ...) are what return boolean arrays." },
          ],
          explanation: "True division's float64 output is a hard rule of the operator, independent of the values it happens to compute.",
        },
        {
          id: "f-01-q2",
          prompt: "What are -7 // 3 and -7 % 3 in NumPy?",
          options: [
            { text: "-2 and -1 (truncate the quotient, remainder keeps the dividend's sign)", correct: false, feedback: "That is C-style behavior (what np.fmod gives for the remainder). NumPy floors instead." },
            { text: "-3 and 2 (floor toward negative infinity, remainder takes the divisor's sign)", correct: true, feedback: "Correct: the true quotient -2.33 floors to -3, and the remainder satisfies 3*(-3) + 2 == -7." },
            { text: "-3 and -1", correct: false, feedback: "The quotient is right, but -1 would break the identity: 3*(-3) + (-1) is -10, not -7." },
            { text: "An error — negative operands are not allowed", correct: false, feedback: "Negative operands are perfectly legal; they just follow the floor convention, which is exactly why they are worth testing." },
          ],
          explanation: "Floor division rounds down (away from zero for negatives), and % takes the divisor's sign so the divmod identity always holds.",
        },
        {
          id: "f-01-q3",
          prompt: "stock = np.array([10, 12, 15]); stock += 1.5 raises. Why, and what is the clean fix?",
          options: [
            { text: "1.5 is not an array — you cannot add scalars in place", correct: false, feedback: "Scalar in-place arithmetic is fine (stock += 3 works); the problem is the dtype, not the scalar." },
            { text: "The values would need rounding — NumPy silently rounds them", correct: false, feedback: "NumPy does the opposite of silently: it refuses, precisely because rounding would destroy data without telling you." },
            { text: "In-place results must fit the array's existing dtype; writing float64 into int64 would lose the .5, so NumPy raises — go out-of-place with stock = stock + 1.5", correct: true, feedback: "Correct. Same-precision rule for in-place; out-of-place builds a fresh float64 array with room for the truth." },
            { text: "+= only works on float arrays; integers need the .add() method", correct: false, feedback: "Integer arrays accept += happily for integer results (stock += 3 works fine). It is the dtype mismatch that raises." },
          ],
          explanation: "In-place operators write into the existing buffer, so the result must be castable without precision loss — otherwise NumPy raises and you choose a new array or an explicit conversion.",
        },
      ],
    },

    // ------------------------------------------------------------- f-02
    {
      slug: "f-02",
      title: "The Math Function Toolbox",
      minutes: 17,
      summary:
        "The everyday shelf — abs and sign, roots, exponentials and logarithms (including the precision pair log1p and expm1), angles, the full rounding family with its banker's ties, and clip — every tool with verified output.",
      kind: "concept",
      objectives: [
        "Pick the right toolbox function for roots, powers, distances and angle work",
        "Explain why sqrt of an integer array returns float64, and why cbrt succeeds where ** (1/3) silently produces nan",
        "Use log1p and expm1 for tiny values, and prove with printed numbers that they beat log(1 + x) and exp(x) - 1",
        "Predict NumPy's round-half-to-even behavior on exact .5 ties",
        "Choose deliberately between floor, ceil, trunc, rint and clip when cleaning data",
      ],
      why: "Once arithmetic is automatic, the next question is which ready-made function does the job. NumPy ships a drawer full of mathematical functions, and this lesson walks the shelf you will actually reach for every week: absolute value and sign, square and cube roots, exponentials and logarithms, angle conversions, the five-way rounding family, and clip. Two drawers hide genuine surprises — log1p's precision trick, where computing the obvious way loses almost every digit for small inputs, and round's banker's ties, where 2.5 rounds to 2 and 3.5 to 4. Both surprises are proven with printed output below, not asserted, because both sound like folklore until you see the numbers.",
      blocks: [
        {
          kind: "text",
          text: "Every function in this lesson is a **ufunc** — a universal function that applies one scalar operation across a whole array at compiled speed, with broadcasting and dtype rules exactly like the operators of Lesson f-01. You have been using ufuncs since your first `a + 1`; now you get the named ones. The tour order is the order you will reach for them: sizes and signs, roots, exponentials and logs, powers and distances, angles, rounding, and finally clipping.",
        },
        {
          kind: "heading",
          text: "Signs and sizes",
        },
        {
          kind: "code",
          title: "np.abs and np.sign",
          code: `import numpy as np

change = np.array([-4.2, 1.9, -0.3, 7.8])   # daily price moves
print(np.abs(change))    # how big was each move?
print(np.sign(change))   # which direction?
`,
          output: `[4.2 1.9 0.3 7.8]
[-1.  1. -1.  1.]`,
          explain: [
            "`np.abs` strips the sign — the size of each move regardless of direction.",
            "`np.sign` reduces every value to -1, 0 or +1: a ready-made direction-of-change column.",
            "Together they answer the two questions you ask about any change: how much, and which way.",
          ],
        },
        {
          kind: "heading",
          text: "Roots",
        },
        {
          kind: "code",
          title: "np.sqrt and np.cbrt",
          code: `import numpy as np

areas = np.array([4, 9, 16])       # integer input...
sides = np.sqrt(areas)
print(sides, sides.dtype)

cubes = np.array([27.0, -8.0, 64.0])
print(np.cbrt(cubes))              # cube roots handle negatives
`,
          output: `[2. 3. 4.] float64
[ 3. -2.  4.]`,
          outputNote: "Integer areas in, float64 sides out — and cube roots of negative numbers are perfectly real.",
          explain: [
            "`np.sqrt` of an integer array comes back **float64**: most square roots are irrational, so an integer result type would be a lie.",
            "`np.cbrt` computes cube roots, and unlike `x ** (1/3)` it handles negatives correctly — more on that trap in a moment.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Two silent-nan traps",
          text: "Both `np.sqrt(np.array([-4.0]))` and `np.array([-8.0]) ** (1/3)` print a RuntimeWarning and hand you `nan` — no exception, just a missing value flowing downstream. The math reason: -4 has no real square root (true), but -8 has a real cube root (-2); the fractional power just is not defined for negative bases in floating point. Use `np.cbrt` for cube roots, and for square roots clean or mask negatives first (Lesson e-03's masks, or np.sqrt(np.abs(x)) when the sign is noise).",
        },
        {
          kind: "heading",
          text: "Exponentials and logarithms",
        },
        {
          kind: "code",
          title: "The log family on friendly values",
          code: `import numpy as np

x = np.array([1.0, np.e, 10.0])
print("ln  :", np.log(x))        # natural log (base e)
print("log2:", np.log2(np.array([8.0, 1024.0])))
print("log10:", np.log10(np.array([10.0, 1000000.0])))
`,
          output: `ln  : [0.         1.         2.30258509]
log2: [ 3. 10.]
log10: [1. 6.]`,
          explain: [
            "`np.log` is natural log; `np.log2` and `np.log10` are the base-2 and base-10 versions.",
            "These three cover the practical reasons you take logs: undoing exp, bits/doublings, and orders of magnitude (decibels, Richter, pH).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.exp",
          purpose: "Raise e (Euler's number, 2.71828...) to every element of the input — continuous growth in one call.",
          signature:
            "np.exp(x, /, out=None, *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "np.exp is the engine of exponential models: compound interest quoted continuously, populations, radioactive decay (with a negative rate), and the softmax step inside machine learning are all exp applied to arrays. It is the exact inverse of np.log, so exp(log(x)) is x up to rounding. Integer input returns float64 — e to any power is essentially never an integer.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The exponents. Scalars or arrays of any numeric dtype; negative exponents shrink toward zero.",
              example: "np.array([0, 1, 2])",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write results into — useful to reuse one buffer inside a loop.",
              example: "out=growth",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "Boolean mask of positions to compute; other positions are left untouched (requires out).",
              example: "where=active_mask",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Force the calculation's dtype — for example dtype=np.float64 to stop float32 inputs from overflowing early.",
              example: "dtype=np.float64",
            },
          ],
          returns: {
            type: "ndarray",
            description: "e raised to each element. Float input of any width keeps its dtype; integer input promotes to float64.",
          },
          example: `import numpy as np

# 100 dollars growing at 5% per year, compounded continuously
years = np.array([0, 1, 2, 3])
growth = 100.0 * np.exp(years * 0.05)
print(np.round(growth, 2))
`,
          exampleOutput: `[100.   105.13 110.52 116.18]`,
          commonMistakes: [
            {
              mistake: "Calling np.exp(1000) casually and being surprised by inf.",
              why: "e^1000 is about 10^434 — beyond float64's max (about 1.8e308). NumPy overflows to inf with a RuntimeWarning rather than raising.",
              fix: "Clip or scale exponents first (subtract a max, the softmax trick), or work in log space where products become sums.",
            },
            {
              mistake: "Expecting exp of an integer array to stay integer because the input was.",
              why: "e to any real power is irrational; like sqrt, exp promotes integer input to float64 by design.",
              fix: "Nothing to fix — just predict it: the result is float64, and the input's dtype does not carry over.",
            },
            {
              mistake: "Reaching for np.exp when the growth is doubling (base 2) and being unable to read the numbers.",
              why: "exp models rate-per-period continuous growth; powers of two model doublings. The right tool for bits and generations is np.exp2.",
              fix: "Use np.exp2(x) for 2**x, or np.power(2, n) when the exponent is a whole count of doublings.",
            },
          ],
          related: [
            { name: "np.log", relation: "The inverse: exp then log (or log then exp) returns the input up to rounding." },
            { name: "np.expm1", relation: "exp(x) - 1 computed exactly for small x — the precision pair of this lesson." },
            { name: "np.exp2", relation: "Base-2 exponential: the doublings-and-bits version." },
            { name: "np.power", relation: "General base, general exponent — exp is the special case base = e." },
          ],
          applications: [
            "Continuous compounding: balance = principal * exp(rate * years)",
            "Decay and half-lives: exp(-t / tau) with tau the time constant",
            "Softmax and log-sum-exp normalization inside machine-learning code",
          ],
          notes:
            "exp overflows to inf around x = 709.8 and underflows to 0 around x = -745.1 in float64; both events are RuntimeWarnings, not exceptions.",
        },
        {
          kind: "heading",
          text: "The precision pair: log1p and expm1",
        },
        {
          kind: "text",
          text: "Here is the quiet masterpiece of the toolbox. You want `log(1 + x)` for values like 0.000000001 — a daily interest rate, say. The problem happens **before log even runs**: `1 + 1e-9` must be stored as a float64, and near 1 a float64 has only about 16 digits of room, so the 1e-9 is partially lost in the rounding of the addition. `np.log1p(x)` computes log(1+x) without ever forming 1+x, keeping every digit.",
        },
        {
          kind: "code",
          title: "The proof, printed",
          code: `import numpy as np

small = 1e-9
print("naive log(1 + x):   ", np.log(1 + small))
print("careful log1p(x):    ", np.log1p(small))

# the same story at 1e-16, where naive loses EVERYTHING
tiny = 1e-16
print("naive log(1 + 1e-16):", np.log(1.0 + tiny))
print("careful log1p(1e-16):", np.log1p(tiny))

# expm1 is the way back out, with the same care
print("expm1(log1p(tiny)):  ", np.expm1(np.log1p(tiny)))
`,
          output: `naive log(1 + x):    1.000000082240371e-09
careful log1p(x):     9.999999995e-10
naive log(1 + 1e-16): 0.0
careful log1p(1e-16): 1e-16
expm1(log1p(tiny)):   1e-16`,
          outputNote: "Read the pairs closely — the naive results are not wrong, they are damaged: at 1e-9 the error is in the 8th digit, at 1e-16 the answer is a total loss (0.0).",
          explain: [
            "The true value of ln(1 + 1e-9) is 0.999999995e-9; log1p gets essentially all of it, the naive route is off in the 8th significant digit.",
            "At 1e-16, `1 + 1e-16` rounds to exactly 1.0 in float64 (it is smaller than the spacing of floats near 1), so the naive log is exactly 0 — every digit gone.",
            "`np.expm1(x)` is exp(x) - 1 done the careful way, and `expm1(log1p(x))` returns x to machine precision: a perfect round trip.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.log1p",
          purpose: "Compute log(1 + x) accurately even when x is tiny — without ever forming 1 + x.",
          signature:
            "np.log1p(x, /, out=None, *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "The expression 1 + x is where precision dies for small x: near 1, a float64 has ~2.2e-16 of spacing, so any x smaller than that rounds away entirely in the addition, and larger-but-still-small x keep only part of their digits. np.log1p folds the +1 into the logarithm itself, so small x survive whole. Its inverse np.expm1 computes exp(x) - 1 with the same care. The pair exists wherever rates meet small numbers: log-returns of intraday prices, probability ratios near 1, numerical solvers.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The values to feed to log(1 + x). Positive x are the common case; x at or below -1 gives nan or -inf (the log is undefined there).",
              example: "np.array([1e-9, 1e-16])",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write results into instead of allocating.",
              example: "out=result",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "Boolean mask of positions to compute (requires out).",
              example: "where=mask",
            },
          ],
          returns: {
            type: "ndarray",
            description: "log(1 + x) elementwise, accurate to machine precision even for x as small as 1e-16 — where the naive log(1 + x) returns exactly 0.0.",
          },
          example: `import numpy as np

# A fund returns 1e-9 per tick. Log-return per tick:
rate = 1e-9
print(np.log(1 + rate))    # the naive way
print(np.log1p(rate))      # the careful way

# and the exact way back out:
print(np.expm1(np.log1p(rate)))
`,
          exampleOutput: `1.000000082240371e-09
9.999999995e-10
1e-09`,
          commonMistakes: [
            {
              mistake: "Writing log(1 + x) because it reads more naturally.",
              why: "For x near 1e-8 and smaller, the addition 1 + x rounds before log ever runs, so digits of the answer were lost before the computation started. At x = 1e-16 the naive answer is exactly 0.0.",
              fix: "Make log1p/expm1 a reflex whenever x is small and sits next to a 1 in your formula.",
            },
            {
              mistake: "Assuming log1p is a different logarithm (base 2 or 10).",
              why: "The 1p is 'plus one', not a base. log1p is exactly the natural log of 1 + x.",
              fix: "For other bases divide by the log of the base: log1p(x) / np.log(2) for base 2.",
            },
            {
              mistake: "Undoing it with exp(x) - 1 and re-introducing the same error.",
              why: "exp(x) - 1 for tiny x rounds away the interesting part in the subtraction — the mirror image of the addition problem.",
              fix: "The inverse pair is np.expm1(x); together they round-trip small values to machine precision.",
            },
          ],
          related: [
            { name: "np.expm1", relation: "The exact inverse — exp(x) - 1 computed without the catastrophic subtraction." },
            { name: "np.log", relation: "Use it when x is comfortably far from 0; log1p is only needed next to the 1." },
            { name: "np.logaddexp", relation: "log(exp(a) + exp(b)) done stably — the same philosophy applied to sums of exponentials." },
          ],
          applications: [
            "Log-returns on small price moves: log1p(p_t / p_t-1 - 1), or log1p(rate)",
            "Statistical formulas that add a smoothing 1 (log of counts-plus-one) without precision loss",
            "Numerical solvers and likelihood code where x - ln(1 + x) terms appear for tiny x",
          ],
        },
        {
          kind: "heading",
          text: "Powers and distances",
        },
        {
          kind: "code",
          title: "np.power and np.hypot",
          code: `import numpy as np

print(np.power(2, 10))                     # a scalar classic

# the 3-4-5 triangle and friends: hypotenuse without the middle step
legs_a = np.array([3, 5, 8])
legs_b = np.array([4, 12, 15])
print(np.hypot(legs_a, legs_b))
`,
          output: `1024
[ 5. 13. 17.]`,
          explain: [
            "`np.power(base, exp)` is the function form of `**`, happy to take arrays on either side.",
            "`np.hypot(a, b)` is sqrt(a**2 + b**2) computed in one stable step — the straight-line distance for right triangles, ready for grids of deltas.",
          ],
        },
        {
          kind: "heading",
          text: "Angles",
        },
        {
          kind: "code",
          title: "degrees, radians and the arctan2 grid",
          code: `import numpy as np

deg = np.array([0.0, 30.0, 45.0, 60.0, 90.0])
print("to radians:", np.radians(deg))
print("and back:  ", np.degrees(np.radians(deg)))

# arctan2(y, x): the angle of the point (x, y) -- all four quadrants
ys = np.array([ 1.0,  1.0, -1.0, -1.0])
xs = np.array([ 1.0, -1.0,  1.0, -1.0])
print("compass (degrees):", np.degrees(np.arctan2(ys, xs)))
`,
          output: `to radians: [0.         0.52359878 0.78539816 1.04719755 1.57079633]
and back:   [ 0. 30. 45. 60. 90.]
compass (degrees): [  45.  135.  -45. -135.]`,
          outputNote: "Python's math module and NumPy agree: trig wants radians, so convert first — 30 degrees is about 0.5236 radians.",
          explain: [
            "All NumPy trigonometry runs in radians; `np.radians` and `np.degrees` are the two conversion doors.",
            "`np.arctan2(y, x)` takes the arguments **in y-then-x order** and returns the true angle in the right quadrant: 45, 135, -45 and -135 degrees for the four corners around the origin.",
            "Plain arctan cannot tell opposite corners apart (it only sees the ratio); arctan2 sees the signs and picks the right quadrant.",
          ],
        },
        {
          kind: "heading",
          text: "The rounding family",
        },
        {
          kind: "text",
          text: "NumPy has five answers to 'round this number', and they differ only at the edges — negatives and exact ties. The famous surprise first: `np.round` does **not** round .5 up. It rounds .5 **to the nearest even number** — banker's rounding — so that half the ties go up and half go down, which on average cancels the bias.",
        },
        {
          kind: "code",
          title: "The banker's rounding surprise",
          code: `import numpy as np

print(np.round(2.5))     # not 3!
print(np.round(3.5))     # but this one is 4

ties = np.array([0.5, 1.5, 2.5, 3.5, 4.5])
print(np.round(ties))
`,
          output: `2.0
4.0
[0. 2. 2. 4. 4.]`,
          outputNote: "Every tie went to its even neighbor: 0, 2, 2, 4, 4. Half up, half down — unbiased by construction.",
          explain: [
            "`2.5` sits exactly between 2 and 3; the rule picks 2 because 2 is even.",
            "`3.5` sits between 3 and 4; the rule picks 4, again the even side.",
            "Across many ties this averages out — the reason banks and standards (IEEE 754) prefer it.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.round",
          purpose: "Round every value to the given number of decimals, with exact .5 ties going to the even neighbor.",
          signature: "np.round(a, decimals=0, out=None)",
          purposeDetail:
            "np.round is the everyday rounding tool: prices to cents, sensor readings to 2 decimals, coordinates to 4. Its one famous quirk is round-half-to-even (banker's rounding): a value exactly halfway between two options rounds to whichever neighbor is even, so 2.5 becomes 2 and 3.5 becomes 4. That choice is deliberate — over millions of ties it avoids the systematic upward drift of always-round-half-up. np.round is also a display tool at heart: it answers 'what is the nearest decimal representation', not 'how should money be stored' — for money, integer cents are the honest storage.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to round. Any numeric dtype; non-float inputs are converted for the rounding, and the result keeps a float dtype.",
              example: "np.array([4.567, 2.345, 9.876])",
            },
            {
              name: "decimals",
              type: "int",
              description: "How many digits to keep after the point. 0 (default) rounds to whole numbers; negative values round to tens, hundreds (decimals=-2 rounds 1234 to 1200).",
              example: "2",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write the rounded values into, instead of allocating a new result.",
              example: "out=rounded",
            },
          ],
          returns: {
            type: "ndarray",
            description: "Values rounded to the requested number of decimals, same shape as the input; ties resolved toward the even neighbor.",
          },
          example: `import numpy as np

prices = np.array([4.567, 2.345, 9.876, 1.234])
print(np.round(prices, 2))

ties = np.array([0.5, 1.5, 2.5, 3.5])
print(np.round(ties))
`,
          exampleOutput: `[4.57 2.35 9.88 1.23]
[0. 2. 2. 4.]`,
          commonMistakes: [
            {
              mistake: "Expecting school rounding (half away from zero) and being shocked that round(2.5) is 2.0.",
              why: "NumPy follows the IEEE 754 default: exact ties go to the even neighbor. 2.5 -> 2, 3.5 -> 4, 0.5 -> 0. Unbiased on average, but surprising the first time.",
              fix: "If you truly need half-away-from-zero, add the direction explicitly: np.sign(a) * np.floor(np.abs(a) + 0.5). But first ask whether banker's rounding is actually the fairer choice for your data.",
            },
            {
              mistake: "Being surprised that np.round(2.675, 2) gives 2.67, not 2.68.",
              why: "2.675 in binary is stored as 2.67499999999999982... — it is not a tie at all, it is already below 2.675. Rounding cannot fix an input that was never exactly what you typed.",
              fix: "This is binary-float reality, not a bug. For currency, store integer cents and convert at the edges; or use np.round only for display and keep full precision internally.",
            },
            {
              mistake: "Using round expecting it to change the dtype or the number of decimal *places stored*.",
              why: "A rounded float64 is still a float64: np.round(2.675, 2) is 2.67 stored with full binary precision (2.67000000000000015... is what that value actually is).",
              fix: "Rounding is about values, not storage. Choose a dtype (or integer cents) for storage decisions, and round for presentation.",
            },
          ],
          related: [
            { name: "np.rint", relation: "Same tie rule, but rounds to the nearest integer without a decimals argument — the ufunc form." },
            { name: "np.floor / np.ceil / np.trunc", relation: "The directional rounders: always down, always up, always toward zero — no tie logic at all." },
            { name: "np.around", relation: "The long-standing alias of np.round — same function, older name." },
            { name: "np.clip", relation: "Not rounding but bounding: keeps values inside a range instead of near a grid." },
          ],
          applications: [
            "Display tables: round to 2 decimals so columns of floats read cleanly",
            "Reducing precision noise before comparisons (round both sides, then test equality)",
            "Grid snapping: round(x / step) * step places values on the nearest grid line",
          ],
          notes:
            "The old alias np.round_ was removed in NumPy 2.0 — modern code uses np.round or the equivalent method form a.round(decimals).",
        },
        {
          kind: "code",
          title: "floor, ceil, trunc and rint side by side",
          code: `import numpy as np

v = np.array([-2.5, -1.5, -0.5, 2.7])
print("floor:", np.floor(v))   # toward negative infinity
print("ceil :", np.ceil(v))    # toward positive infinity
print("trunc:", np.trunc(v))   # toward zero
print("rint :", np.rint(v))    # nearest, ties to even
`,
          output: `floor: [-3. -2. -1.  2.]
ceil : [-2. -1. -0.  3.]
trunc: [-2. -1. -0.  2.]
rint : [-2. -2. -0.  3.]`,
          outputNote: "Watch the negative columns — that is where the four functions disagree with each other.",
          explain: [
            "`floor` sends -2.5 to -3 (down is toward negative infinity, away from zero).",
            "`trunc` sends -2.5 to -2 (toward zero — it just deletes the fraction, which is what int() does in NumPy).",
            "`ceil` is floor's mirror; `rint` is np.round's integer-only sibling, same ties-to-even rule (-1.5 -> -2, -0.5 -> -0).",
          ],
        },
        {
          kind: "table",
          title: "The rounding family on the three interesting cases",
          headers: ["Function", "-2.5", "2.5", "2.7", "Rule"],
          rows: [
            ["np.floor", "-3.0", "2.0", "2.0", "always down (toward -infinity)"],
            ["np.ceil", "-2.0", "3.0", "3.0", "always up (toward +infinity)"],
            ["np.trunc", "-2.0", "2.0", "2.0", "toward zero (drop the fraction)"],
            ["np.round / np.rint", "-2.0", "2.0", "3.0", "nearest, ties to the even neighbor"],
          ],
          caption:
            "On positive non-tie values all four agree (2.7 rounds everywhere the same way except trunc/floor keep 2) — the disagreements live at negatives and exact .5s.",
        },
        {
          kind: "heading",
          text: "clip: the data cleaner's best friend",
        },
        {
          kind: "text",
          text: "Sometimes the right answer is not 'round to a grid' but 'keep inside a fence'. `np.clip(x, lo, hi)` pushes every value below `lo` up to `lo`, every value above `hi` down to `hi`, and leaves everything else alone. You met it briefly in Lesson d-04; here it is as a full citizen of the toolbox, because no other function repairs stray sensor readings, out-of-gamut colors or runaway percentages this cheaply.",
        },
        {
          kind: "code",
          title: "A 2-D sensor sweep, cleaned",
          code: `import numpy as np

sensor = np.array([
    [-3.2,  0.5, 12.0],
    [ 7.7, 20.1,  3.3],
    [11.2, -0.4,  5.9],
    [ 8.8, 15.5,  1.1],
])
cleaned = np.clip(sensor, 0.0, 10.0)
print(cleaned)
`,
          output: `[[ 0.   0.5 10. ]
 [ 7.7 10.   3.3]
 [10.   0.   5.9]
 [ 8.8 10.   1.1]]`,
          outputNote: "The -3.2 and -0.4 were pulled up to 0.0; the 12.0, 20.1, 11.2 and 15.5 were pushed down to 10.0; everything already inside (0.5, 7.7, 3.3, 5.9, 8.8, 1.1) passed through untouched.",
          explain: [
            "Values below the floor land on the floor; values above the ceiling land on the ceiling.",
            "In-range values are returned unchanged — clip never invents data, it only fences it.",
            "The result keeps the input's shape and dtype, so it drops straight back into the pipeline.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.clip",
          purpose: "Push every value in an array inside a given range: below the floor becomes the floor, above the ceiling becomes the ceiling.",
          signature: "np.clip(a, a_min, a_max, out=None, **kwargs)",
          purposeDetail:
            "Real data arrives with stragglers: a sensor that undershoots below zero, a discount someone typed as 150 percent, a color channel past 255. np.clip is the one-line fence — it keeps values inside [a_min, a_max] and leaves everything else byte-identical. It is implemented as the composition of np.maximum (against the floor) and np.minimum (against the ceiling), and either bound may be None for a one-sided fence.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The array to bound. Any shape, any numeric dtype.",
              example: "np.array([-3.2, 0.5, 12.0, 7.7, 20.1])",
            },
            {
              name: "a_min",
              type: "scalar, array_like or None",
              required: true,
              description: "The lower fence. None means no lower bound. An array of fences is allowed (broadcast per element).",
              example: "0.0 or None",
            },
            {
              name: "a_max",
              type: "scalar, array_like or None",
              required: true,
              description: "The upper fence. None means no upper bound. At least one of a_min / a_max must not be None.",
              example: "10.0",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write into — pass the input itself as out to clip in place: np.clip(a, 0, 10, out=a).",
              example: "out=a",
            },
          ],
          returns: {
            type: "ndarray",
            description: "An array of the same shape and dtype as a, with every value bounded to [a_min, a_max]. NaN passes through untouched (comparisons with NaN are False).",
          },
          example: `import numpy as np

sensor = np.array([-3.2, 0.5, 12.0, 7.7, 20.1])
print(np.clip(sensor, 0.0, 10.0))

# one-sided fence: only a ceiling, no floor
print(np.clip(sensor, None, 10.0))
`,
          exampleOutput: `[ 0.   0.5 10.   7.7 10. ]
[-3.2  0.5 10.   7.7 10. ]`,
          commonMistakes: [
            {
              mistake: "Passing the bounds in the wrong order (a_min bigger than a_max).",
              why: "np.clip does not check. Verified behavior: np.clip([1.0, 5.0, 9.0], 10.0, 0.0) returns all 0.0 — the maximum-then-minimum composition lets the ceiling win everywhere, which is almost never what a confused argument order intended.",
              fix: "Read the call aloud: clip(x, low, high). If the names do not read like a range, stop.",
            },
            {
              mistake: "Expecting clip to remove or flag NaN values.",
              why: "Every comparison with NaN is False, so NaN never gets pushed to either bound — it passes through the fence unclipped.",
              fix: "Handle missing values separately (Lesson e-03's masks, np.isnan), then clip the survivors.",
            },
            {
              mistake: "Clipping the raw data before exploring it, and hiding the evidence of a broken sensor.",
              why: "A stream of readings at exactly the fence value is a fingerprint: the sensor saturated. Clipping first destroys that fingerprint and you lose the diagnosis.",
              fix: "Count and log the outliers first (np.count_nonzero(x > hi)), then clip for the analysis that needs bounded values.",
            },
          ],
          related: [
            { name: "np.minimum / np.maximum", relation: "The two building blocks — clip is their composition. Use them alone for one-sided work with a twist." },
            { name: "np.where", relation: "Set values by condition instead of by range — for replacing with something other than the bound." },
            { name: "np.round", relation: "Moves values onto a decimal grid; clip moves them inside a range. Different jobs, often paired." },
            { name: "np.nan_to_num", relation: "The NaN-specialist sibling: replaces nan/inf with finite stand-ins." },
          ],
          applications: [
            "Sensor and audio sanity: fence readings to the physically possible range before analysis",
            "Percentages and probabilities: clip(x, 0, 100) or clip(p, 0.0, 1.0) after arithmetic that overshot",
            "Machine learning: gradient clipping and image-value scaling to [0, 1] for display",
          ],
          notes:
            "np.clip(a, lo, hi) equals np.minimum(np.maximum(a, lo), hi) — worth knowing the composition, because it explains both the one-sided None bounds and the wrong-order behavior.",
        },
        {
          kind: "arrayViz",
          title: "Explore the cleaned grid",
          mode: "explore",
          name: "cleaned",
          data: [
            [0.0, 0.5, 10.0],
            [7.7, 10.0, 3.3],
            [10.0, 0.0, 5.9],
            [8.8, 10.0, 1.1],
          ],
          dtype: "float64",
          caption:
            "The cleaned array from the block above: np.clip(sensor, 0.0, 10.0). The fence values are the fingerprints — [0, 0] used to be -3.2, [1, 1] used to be 20.1, [2, 0] used to be 11.2. Click around and notice how many cells sit on exactly 0.0 or 10.0: every one of them was repaired, not measured.",
        },
        {
          kind: "tryIt",
          title: "Drive the whole toolbox",
          task:
            "Run it, then: (1) push every clip bound in by one and count how many cells change (np.count_nonzero); (2) swap np.exp for np.exp2 and read the doubling ladder; (3) round the exp line to 3 decimals; (4) replace np.abs(line) with line alone and watch sqrt produce nan and a RuntimeWarning — the trap from the callout, live.",
          code: `import numpy as np

line = np.linspace(-3.0, 3.0, 7)
print("x          :", np.round(line, 2))
print("exp(x)     :", np.round(np.exp(line), 4))
print("clipped    :", np.clip(np.sqrt(np.abs(line)), 0.0, 1.5))

scores = np.array([7.2, 9.8, 8.5, 6.9, 9.4])
print("rounded    :", np.round(scores))
print("on the fence:", np.clip(scores, 7.0, 9.0))
`,
          hint: "For step 4, remember the fix pattern from the callout: np.cbrt for cube roots, np.sqrt(np.abs(x)) or a mask for square roots of possibly-negative data.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "abs and sign measure moves, sqrt and cbrt undo powers (float64 out; negatives are cbrt territory), exp and log are inverses with a precision pair for small x, arctan2 finds true angles, round breaks ties toward even, and clip fences data inside a range.",
        },
      ],
      terms: [
        { term: "ufunc", definition: "Universal function: a NumPy function that applies one scalar operation across whole arrays elementwise, with broadcasting and dtype promotion — +, np.sqrt and np.clip are all ufuncs or ufunc-like." },
        { term: "banker's rounding", definition: "Rounding exact .5 ties to the even neighbor (2.5 -> 2, 3.5 -> 4) — the IEEE 754 default, chosen because half the ties round up and half down, canceling the bias." },
        { term: "truncation vs flooring", definition: "Both move toward whole numbers, but trunc heads for zero (np.trunc(-2.5) is -2) while floor heads for negative infinity (np.floor(-2.5) is -3). They only disagree on negatives." },
        { term: "log1p / expm1 precision pair", definition: "log(1 + x) and exp(x) - 1 computed without the catastrophic intermediate: the +1 or -1 is folded into the function so tiny x keep every digit." },
        { term: "clipping (clamping)", definition: "Bounding every value to [min, max] — outside values land on the fence, inside values pass through untouched, NaN passes through unclipped." },
      ],
      mistakes: [
        {
          mistake: "Computing cube roots as x ** (1/3) and quietly getting nan for negatives.",
          why: "Fractional powers of negative bases are undefined in floating point, so NumPy emits a RuntimeWarning and returns nan — but -8 does have a real cube root.",
          fix: "Use np.cbrt, which is defined for negative bases: np.cbrt(-8.0) is -2.0. The same warning applies to any fractional power of negative data.",
        },
        {
          mistake: "Assuming round-half-up and writing 2.5-based test data that silently rounds the 'wrong' way.",
          why: "NumPy resolves exact ties toward the even neighbor: 2.5 -> 2, 3.5 -> 4. Test data full of .5s will flip half your expectations.",
          fix: "Predict with the even-neighbor rule, or add a half in the direction you want (np.sign(x) * np.floor(np.abs(x) + 0.5)) when unbiased ties genuinely hurt.",
        },
        {
          mistake: "Mixing degrees and radians: calling np.sin(30) and expecting 0.5.",
          why: "NumPy trigonometry is radian-only. 30 radians is about 1719 degrees, so the answer is some unrelated value near -0.988.",
          fix: "Convert once at the boundary: np.sin(np.radians(30)) is 0.5. Keep a project-wide convention (radians internally, degrees only at the UI).",
        },
        {
          mistake: "Using log(1 + x) on tiny rates and losing most of the significant digits before the log even runs.",
          why: "Near 1, float64 spacing is about 2.2e-16, so 1 + 1e-16 is stored as exactly 1.0 — the log then returns 0.0 and the information is gone.",
          fix: "np.log1p(x) for the way in, np.expm1(x) for the way out; the pair round-trips small values to machine precision.",
        },
      ],
      takeaways: [
        "Every toolbox function is elementwise with operator-grade broadcasting — same mental model as + and *.",
        "sqrt promotes integer arrays to float64; cbrt handles negatives that x ** (1/3) turns into nan.",
        "log1p and expm1 protect tiny values from the 1 + x and x - 1 roundings — proven above at 1e-9 and 1e-16.",
        "np.round resolves exact .5 ties toward the even neighbor: 2.5 -> 2, 3.5 -> 4 — unbiased by design.",
        "floor and trunc differ only on negatives (-2.5 -> -3 vs -2); clip fences values into a range and lets NaN pass.",
      ],
      quiz: [
        {
          id: "f-02-q1",
          prompt: "What does np.round(2.5) return, and why?",
          options: [
            { text: "3.0 — .5 always rounds up, like school rounding", correct: false, feedback: "School rounding is exactly what NumPy does not implement — the tie goes the other way here." },
            { text: "2.0 — exact ties round to the even neighbor", correct: true, feedback: "Correct: 2.5 sits exactly between 2 and 3, and the even-neighbor rule picks 2. Note np.round(3.5) is 4 — the even side wins both times." },
            { text: "2.6 — 2.5 is stored slightly above 2.5 in binary, so it rounds down", correct: false, feedback: "Binary storage is a real NumPy gotcha, but 2.5 is exactly representable in binary (it is 1/4 + 1/4... actually 2 + 1/2), so it is a true tie." },
            { text: "An error — rounding a tie is ambiguous", correct: false, feedback: "Not ambiguous at all: the rule is deterministic (ties to even), just not the rule most people expect." },
          ],
          explanation: "NumPy follows IEEE 754's round-half-to-even: exact ties choose the even neighbor, so 2.5 -> 2.0 and 3.5 -> 4.0 — unbiased across many ties.",
        },
        {
          id: "f-02-q2",
          prompt: "np.sqrt(np.array([4, 9, 16])) returns an array of which dtype?",
          options: [
            { text: "int64 — every result is a whole number", correct: false, feedback: "The values happen to be whole, but the function cannot know that in advance — sqrt of 5 would not be. The result type is chosen by rule." },
            { text: "float64 — square roots of integer arrays are always computed in floating point", correct: true, feedback: "Correct. Most square roots are irrational, so sqrt promotes integer input to float64 by design — verified in the roots block above." },
            { text: "float32 — to save memory on the way out", correct: false, feedback: "NumPy does not silently narrow results; float32 in would give float32 out, but integer input gives float64." },
            { text: "It depends on the largest input value", correct: false, feedback: "The output dtype depends on the input dtype (and any dtype= argument), never on the values computed." },
          ],
          explanation: "Like / and exp, sqrt returns a type that can hold every possible answer: integer input promotes to float64.",
        },
        {
          id: "f-02-q3",
          prompt: "You must compute log(1 + x) for x around 1e-9 and smaller. Which call, and why?",
          options: [
            { text: "np.log(1 + x) — modern float64 has plenty of precision", correct: false, feedback: "Verified above: at 1e-9 the naive answer is already wrong in the 8th significant digit, and at 1e-16 it is exactly 0.0." },
            { text: "np.log1p(x) — the +1 is folded into the log so tiny x keep every digit", correct: true, feedback: "Correct. log1p never forms 1 + x as a float, dodging the rounding that destroys the small part." },
            { text: "np.log2(1 + x) / np.log(2) — converting bases fixes the precision", correct: false, feedback: "The damage happens in the addition 1 + x, before any logarithm runs. Changing bases moves the problem, not the fix." },
            { text: "np.round(np.log(1 + x), 12) — rounding cleans up the error", correct: false, feedback: "Rounding after the fact cannot resurrect digits that were never computed — and usually hides the symptom while keeping the damage." },
          ],
          explanation: "log1p (and its inverse expm1) exist precisely for small x next to a 1: they avoid forming the 1 + x that rounds the tiny part away.",
        },
      ],
    },

    // ------------------------------------------------------------- f-03
    {
      slug: "f-03",
      title: "Statistics: Centers and Spread",
      minutes: 16,
      summary:
        "The questions every dataset asks — what is typical, and how spread out is it: mean versus median under a skew, weighted averages, the ddof story behind std, percentiles and the IQR, and the 2x2 correlation matrix read aloud.",
      kind: "concept",
      objectives: [
        "Choose between mean and median for a dataset, and explain with verified numbers what an outlier does to each",
        "Compute weighted averages with np.average and prove the weighted mean always lands between the min and the max",
        "Explain ddof — why NumPy's std divides by N by default while pandas divides by N-1 — and compute both on the same data",
        "Read percentiles as order statistics, compute quartiles and the IQR with the linear-interpolation default, and get the range with np.ptp",
        "Read a 2x2 correlation matrix aloud (diagonal 1s, off-diagonal r) and connect np.corrcoef to np.cov",
      ],
      why: "Every report, dashboard and model evaluation eventually answers two questions: what is a typical value, and how spread out are the values? NumPy answers them in one call each — but the defaults hide decisions you must know you are making. The mean quietly hands a veto to every outlier; the median ignores them entirely. Standard deviation comes in two flavors (divide by N or by N-1), NumPy and pandas pick different ones, and comparing the wrong pair makes a calm dataset look noisy. Percentiles interpolate between data points, so a quartile can be a number that is not in your data at all. This lesson makes each decision visible, on small datasets with prices and temperatures, and every number claimed below is the machine-verified output of the code beside it.",
      blocks: [
        {
          kind: "text",
          text: "You have a column of numbers — salaries, prices, temperatures, latencies. Before any modeling, you owe yourself two summaries: a **center** (what is a typical value?) and a **spread** (how far do values wander from that center?). NumPy gives you several of each, and they are not interchangeable. Picking the wrong one does not crash anything — it just quietly answers a different question than the one you asked, which is worse.",
        },
        {
          kind: "heading",
          text: "Two centers, two personalities",
        },
        {
          kind: "text",
          text: "The **mean** is the balance point: add everything, divide by the count. The **median** is the middle value once the data is sorted: half the values sit below it, half above. The difference only shows up when the data is skewed — and when it shows up, it is dramatic.",
        },
        {
          kind: "code",
          title: "A salary list with one executive in it",
          code: `import numpy as np

salaries = np.array([52, 55, 58, 60, 62, 65, 290])  # thousands per year

print("mean  :", salaries.mean())      # the balance point
print("median:", np.median(salaries))  # the middle value
`,
          output: `mean  : 91.71428571428571
median: 60.0`,
          outputNote: "Six people earn 52-65k; one earns 290k. The mean says 91.7, the median says 60 — and nobody in the room earns either.",
          explain: [
            "The mean is 91.71 (thousands): the 290 pulls it nearly 32 above the next-highest salary. Every value's magnitude counts.",
            "The median is 60: sort the list, take the middle element (position 3 of 7). The 290 could have been 290,000 and the median would not move.",
            "Neither number is wrong — they answer different questions. 'What does the average person earn?' is the median. 'What is the total payroll per person?' is the mean.",
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The see-saw",
          text: "Think of a see-saw with one person sitting at every salary value. The mean is where the see-saw balances — so the one heavy person far out on the end drags the pivot toward themselves. The median just counts bodies left and right of the middle seat; it does not care how heavy anyone is. Skewed data (salaries, house prices, response times, file sizes) is see-saw data: report the median, and show the mean only when the total matters.",
        },
        {
          kind: "heading",
          text: "Weighted averages: when values matter differently",
        },
        {
          kind: "text",
          text: "The plain mean treats every value as equally important. Often they are not: a 4.0 in a 2-credit seminar should count half as much as a 4.0 in a 4-credit lecture. `np.average` takes a `weights` argument for exactly this — the weighted mean is the sum of value-times-weight divided by the sum of weights, which is just a mean where each value gets to vote more or less loudly.",
        },
        {
          kind: "code",
          title: "The weighted GPA pattern",
          code: `import numpy as np

grades = np.array([4.0, 3.7, 3.3, 4.0])   # GPA-scale grades
credits = np.array([3, 4, 3, 2])          # course credit weights

gpa = np.average(grades, weights=credits)
print("weighted GPA:", np.round(gpa, 3))
print("plain mean  :", np.round(grades.mean(), 3))

# a weighted mean is still a mean: it must land inside the data's range
print("between min and max:", grades.min() <= gpa <= grades.max())
`,
          output: `weighted GPA: 3.725
plain mean  : 3.75
between min and max: True`,
          outputNote: "The weighted GPA is 3.725 — lower than the unweighted 3.75, because the heaviest course (4 credits) happens to hold the lowest grade.",
          explain: [
            "The weighted mean is (4.0*3 + 3.7*4 + 3.3*3 + 4.0*2) / (3+4+3+2) = 44.9/12 = 3.725.",
            "The plain mean (3.75) would tell a 2-credit seminar and a 4-credit lecture 'your votes count equally'.",
            "The bounds check is a free sanity test: a weighted mean is a convex combination of the values, so it can never escape the min-max range — if it does, your weights are the wrong shape (see the card below).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.average",
          purpose: "Compute a (optionally weighted) mean of the values in an array.",
          signature:
            "np.average(a, axis=None, weights=None, returned=False, *, keepdims=False)",
          purposeDetail:
            "np.average is np.mean with one superpower and one difference. The superpower is the weights argument: when some values should count more than others (grades weighted by credits, returns weighted by position size, measurements weighted by confidence), np.average computes sum(values * weights) / sum(weights) in one call. The difference: weights are optional but never silently ignored — a weights array whose shape does not match the data raises instead of guessing. When weights is None, np.average(a) is exactly a.mean().",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to average. Any shape; use axis to average along one direction of a 2-D array.",
              example: "np.array([4.0, 3.7, 3.3, 4.0])",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Which axis to average along (Lesson f-04 owns the full axis story). None (default) averages everything.",
              example: "axis=1",
            },
            {
              name: "weights",
              type: "array_like or None",
              description: "How much each value counts. Must match a's shape along the averaging axis. Weights can be any non-negative numbers; they are normalized by their sum, so scale does not matter — only ratios do.",
              example: "weights=np.array([3, 4, 3, 2])",
            },
            {
              name: "returned",
              type: "bool",
              description: "When True, also return the sum of weights: avg, weight_sum = np.average(a, weights=w) — handy when you need to combine groups later.",
              example: "returned=True",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "The (weighted) average. With returned=True, a tuple (average, sum_of_weights). The result dtype follows the input's promotions — integer input yields float64.",
          },
          example: `import numpy as np

# Investment portfolio: returns weighted by dollars invested
returns = np.array([0.08, 0.12, -0.02])
dollars = np.array([600, 300, 100])

print(np.round(np.average(returns, weights=dollars), 4))
print(np.round(np.average(returns), 4))          # unweighted
port, total = np.average(returns, weights=dollars, returned=True)
print("portfolio return:", round(port, 4), "on", total, "dollars")
`,
          exampleOutput: `0.082
0.06
portfolio return: 0.082 on 1000.0 dollars`,
          commonMistakes: [
            {
              mistake: "Passing weights with a different length than the data and expecting silent broadcasting.",
              why: "np.average raises: Axis must be specified when shapes of a and weights differ. Weights choose how to average — NumPy will not guess a pairing for you.",
              fix: "Check the shapes first: weights.shape must equal a's shape (or differ only along non-averaged axes when axis is given).",
            },
            {
              mistake: "Forgetting that weights are relative, and carefully scaling them to percentages first.",
              why: "Only the ratios matter: weights [3, 4, 3, 2] and weights [0.23, 0.31, 0.23, 0.15] give the same average, because the sum normalizes them away.",
              fix: "Pass the natural quantities (credits, dollars, counts) directly — the cleaner story, and no rounding error from a manual normalization.",
            },
            {
              mistake: "Using negative weights to 'down-weight' values.",
              why: "A negative weight flips a value's contribution — the result can land outside the min-max range and stops being any kind of average.",
              fix: "To exclude values, filter them out (boolean masks, Lesson e-03); to down-weight, use a smaller positive weight.",
            },
          ],
          related: [
            { name: "np.mean", relation: "The unweighted special case — a.mean() with no weights argument is identical to np.average(a)." },
            { name: "np.median", relation: "The outlier-immune center; prefer it on skewed data where a weighted mean still gets dragged." },
            { name: "np.average(..., axis=...) + np.sum", relation: "Weighted sums along axes: np.sum(a * w, axis) / np.sum(w, axis) when you need out= or dtype control." },
          ],
          applications: [
            "Grade point averages weighted by credit hours; portfolio returns weighted by dollars",
            "Survey statistics weighted by demographic weights so the sample matches the population",
            "Physics and sensor fusion: averaging readings weighted by inverse variance (more confident sensors count more)",
          ],
        },
        {
          kind: "heading",
          text: "Spread: the ddof story",
        },
        {
          kind: "text",
          text: "Once you have a center, spread asks: how far do values sit from it? The standard deviation is the classic answer — the square root of the average squared distance from the mean. But there is a decision hiding in the word *average*: divide by **N** (you have the whole population) or by **N-1** (you have a sample, and one degree of freedom was spent estimating the mean)? NumPy's default is `ddof=0` — divide by N, the **population** formula. pandas' `.std()` defaults to `ddof=1` — the **sample** formula. Same data, same function name in your head, different numbers out.",
        },
        {
          kind: "code",
          title: "Both flavors, one week of temperatures",
          code: `import numpy as np

temps = np.array([11.0, 13.5, 14.0, 12.5, 9.5, 10.0, 15.5])  # nightly lows

pop_std = np.std(temps)             # ddof=0: divide by N (default)
sample_std = np.std(temps, ddof=1)  # ddof=1: divide by N-1

print("population std (ddof=0):", np.round(pop_std, 4))
print("sample std      (ddof=1):", np.round(sample_std, 4))
print("ratio (sample/pop)      :", np.round(sample_std / pop_std, 4))
`,
          output: `population std (ddof=0): 2.0504
sample std      (ddof=1): 2.2147
ratio (sample/pop)      : 1.0801`,
          outputNote: "The sample std is always the larger one: dividing 7 squared deviations by 6 instead of 7 inflates it by exactly sqrt(7/6) = 1.0801.",
          explain: [
            "ddof stands for delta degrees of freedom: the divisor is N - ddof. The default ddof=0 divides by N; ddof=1 divides by N-1.",
            "With N = 7 the two differ by a factor of sqrt(7/6) = 1.0801 — an 8 percent inflation, printed on the last line as the ratio 1.0801.",
            "The gap shrinks as N grows (sqrt(101/100) is 1.005 for a hundred points); it is huge for tiny N, which is exactly where people compare them.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why pandas differs, and which one you want",
          text: "pandas is a dataframe library: its data is almost always a sample of something, so sample statistics are the honest default — pandas.DataFrame.std() uses ddof=1. NumPy is an array library: it makes no claim about where the data came from, so it uses the plain population formula, ddof=0. Neither is wrong; comparing a NumPy std against a pandas std of the same column without aligning ddof is a classic silent bug. Rule of thumb: if the array is all the data there is, ddof=0; if it is a sample estimating a larger population, ddof=1 — and always say which in your variable names (pop_std versus sample_std, as above).",
        },
        {
          kind: "functionDoc",
          name: "np.std",
          purpose: "Compute the standard deviation — the typical distance of values from their mean.",
          signature:
            "np.std(a, axis=None, dtype=None, out=None, ddof=0, keepdims=False, *, where=True, mean=None, correction=None)",
          purposeDetail:
            "Standard deviation is the square root of variance, and variance is the mean of squared deviations from the mean. It is the workhorse spread statistic because it has the same units as the data (variance has squared units — a variance of 4 square-degrees is hard to feel, a std of 2 degrees is not). The parameter that changes the formula is ddof: the divisor is N - ddof, so the default ddof=0 divides by N (population) and ddof=1 divides by N-1 (sample). Passing mean= when you already computed the mean saves a pass over the data; correction= is the newer spelling for ddof that also accepts an absolute value.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values. Integer arrays are computed in float64; NaN values make the result NaN (use np.nanstd, Lesson e-03's companion, to skip them).",
              example: "np.array([11.0, 13.5, 14.0])",
            },
            {
              name: "axis",
              type: "int, tuple of int or None",
              description: "Reduce along this axis (or axes) only; None reduces everything to a scalar. The full axis story is Lesson f-04.",
              example: "axis=0",
            },
            {
              name: "ddof",
              type: "int",
              description: "Delta degrees of freedom: divisor is N - ddof. Default 0 (population); 1 for the sample formula (the pandas default).",
              example: "ddof=1",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "The accumulation dtype. float32 input summed in float32 drifts; pass dtype=np.float64 for exact accumulation (proven in Lesson f-04).",
              example: "dtype=np.float64",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep the reduced axes alive with size 1, so the result broadcasts back against the input (Lesson f-04).",
              example: "keepdims=True",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "The standard deviation — a scalar if axis is None, otherwise an array with the reduced axis removed (or kept, with keepdims=True). Always floating point.",
          },
          example: `import numpy as np

# Two sensors, one week each: which one is steadier?
sensor_a = np.array([9.8, 10.1, 10.0, 10.3, 9.9, 10.2, 10.1, 9.7])
sensor_b = np.array([10.0, 12.0, 10.0, 8.0, 10.0, 12.0, 8.0, 10.0])

print("sensor A std:", np.round(np.std(sensor_a), 4))
print("sensor B std:", np.round(np.std(sensor_b), 4))
print("same mean   :", sensor_a.mean() == sensor_b.mean())
`,
          exampleOutput: `sensor A std: 0.19
sensor B std: 1.4142
same mean   : False`,
          commonMistakes: [
            {
              mistake: "Comparing np.std(x) against pandas x.std() and concluding the data changed.",
              why: "They are different formulas: NumPy divides by N (ddof=0), pandas by N-1 (ddof=1). On 8 points the pandas number is sqrt(8/7) = 1.069 times larger with zero change in the data.",
              fix: "Align the parameter: np.std(x, ddof=1) matches pandas. Or compare np.var against pandas var with the same reconciliation.",
            },
            {
              mistake: "Feeding skewed data to std and reporting it as 'typical deviation'.",
              why: " Squared deviations hand outliers a veto: one wild value can dominate the whole statistic, exactly like the mean in the salary example.",
              fix: "For skewed data report the IQR (below) as the robust spread; keep std for roughly symmetric data.",
            },
            {
              mistake: "Forgetting std is the square root of variance and mixing the two in formulas.",
              why: "np.var returns squared units; np.std returns data units. Adding a variance to a std (or dividing std by var) produces a number with meaningless units that still looks plausible.",
              fix: "Name variables with units: temp_var, temp_std. Convert deliberately: std = np.sqrt(var) and var = std**2.",
            },
          ],
          related: [
            { name: "np.var", relation: "std squared — same parameters, squared units. Compute var when the formula needs it, std when a human reads it." },
            { name: "np.nanstd", relation: "The NaN-skipping sibling: spread of the non-missing values." },
            { name: "np.mean", relation: "The center std measures distance from; both share the axis/dtype/keepdims machinery." },
            { name: "np.percentile", relation: "The robust spread story: quartiles and the IQR resist the outliers that dominate std." },
          ],
          applications: [
            "Quality control: flag devices whose readings drift more than 3 std from the mean",
            "Finance: annualized volatility is std of returns times sqrt(252) — the units decision baked into a formula",
            "Normalization: z-scores are (x - mean) / std, the standard preprocessing step in machine learning",
          ],
          notes:
            "For tiny float arrays NumPy computes the mean in float64 even for float32 input, so precision surprises are rare; the dtype parameter exists for the large-float32 case, where pairwise summation (Lesson f-04) still beats naive accumulation.",
        },
        {
          kind: "heading",
          text: "Order statistics: percentiles, quartiles, IQR",
        },
        {
          kind: "text",
          text: "Min and max are the 0th and 100th percentiles — the edges of the sorted data. Between them, the **p-th percentile** is the value below which p percent of the data falls. The median is the 50th percentile in disguise. NumPy's `np.percentile` computes them by **linear interpolation**: it finds where the percentile rank falls between two sorted values and takes a proportional step — which means a percentile can be a number that exists in no row of your data. Quartiles (q25, q50, q75) chop the sorted data into four, and the **interquartile range** (IQR = q75 - q25) is the robust spread: the width of the middle half, immune to whatever lurks in the tails.",
        },
        {
          kind: "code",
          title: "Quartiles and the IQR of a price list",
          code: `import numpy as np

prices = np.array([4.50, 8.25, 5.75, 12.00, 6.50, 9.99, 7.25, 15.50, 5.25, 6.75])

q25, q50, q75 = np.percentile(prices, [25, 50, 75])

print("sorted :", np.sort(prices))
print("q25    :", q25)
print("q50    :", q50)
print("q75    :", q75)
print("IQR    :", np.round(q75 - q25, 4))
print("range  :", np.ptp(prices), " (min", prices.min(), ", max", prices.max(), ")")
`,
          output: `sorted : [ 4.5   5.25  5.75  6.5   6.75  7.25  8.25  9.99 12.   15.5 ]
q25    : 5.9375
q50    : 7.0
q75    : 9.555
IQR    : 3.6175
range  : 11.0  (min 4.5 , max 15.5 )`,
          outputNote: "q25 is 5.9375 — a value no store charges. It sits 25 percent of the way from 5.75 to 6.50 in the sorted list: 5.75 + 0.25 * (6.50 - 5.75).",
          explain: [
            "The 25th percentile rank of 10 values lands at index 2.25 of the sorted array: a quarter of the way between sorted[2] = 5.75 and sorted[3] = 6.50, hence 5.9375.",
            "q50 with an even count interpolates halfway: (6.75 + 7.25) / 2 = 7.0 — exactly the median, as promised.",
            "The IQR is 9.555 - 5.9375 = 3.6175: the middle half of prices spans about 3.62 dollars, no matter that the max is 15.50.",
            "`np.ptp` (peak to peak) is max - min in one call: 15.50 - 4.50 = 11.0 — the range, which unlike the IQR is hostage to both extremes.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.percentile",
          purpose: "Return the value below which a given percentage of the data falls, with linear interpolation between neighbors.",
          signature:
            "np.percentile(a, q, axis=None, out=None, overwrite_input=False, method='linear', keepdims=False, *, weights=None)",
          purposeDetail:
            "Percentiles turn 'how big' questions into 'where in the pack' questions: is this latency normal (p50), slow-but-expected (p90), or alarming (p99)? np.percentile finds each requested rank in the sorted data; when the rank falls between two values (the usual case), the default method='linear' takes a proportional step between them, so the result can be a number that is not in the data. The sibling np.quantile is the same function with q expressed as 0..1 fractions instead of percentages — np.percentile(a, 25) is np.quantile(a, 0.25).",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The data. NaNs propagate to the result; np.nanpercentile skips them.",
              example: "np.array([42, 88, 51, 60, 47])",
            },
            {
              name: "q",
              type: "array_like of float",
              required: true,
              description: "Percentile ranks in [0, 100]. A list asks for several at once: np.percentile(x, [25, 50, 75]).",
              example: "[25, 50, 75]",
            },
            {
              name: "axis",
              type: "int, tuple of int or None",
              description: "Reduce along this axis only; None reduces everything.",
              example: "axis=0",
            },
            {
              name: "method",
              type: "str",
              description: "How to interpolate when a rank falls between two values. 'linear' (default) steps proportionally; 'lower'/'higher' pick a neighbor; 'nearest' rounds; 'midpoint' averages them; there are 20+ methods, and they disagree exactly on small samples — the reason two statistics packages can print different quartiles.",
              example: "method='lower'",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep reduced axes alive as size-1 axes for broadcasting (Lesson f-04).",
              example: "keepdims=True",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "The percentile value(s): a scalar for one q and no axis; an array shaped like q (or like a with the axis removed) otherwise.",
          },
          example: `import numpy as np

# Service latency in milliseconds -- the classic percentile dashboard
latency = np.array([42, 88, 51, 60, 47, 210, 55, 49, 58, 52])

p50, p90, p99 = np.percentile(latency, [50, 90, 99])
print("p50 (typical):", p50)
print("p90 (slow)   :", np.round(p90, 2))
print("p99 (alarming):", np.round(p99, 2))
print("max          :", latency.max())
`,
          exampleOutput: `p50 (typical): 53.5
p90 (slow)   : 100.2
p99 (alarming): 199.02
max          : 210`,
          commonMistakes: [
            {
              mistake: "Expecting the percentile to be a value that appears in the data.",
              why: "With 10 values, the 90th percentile rank lands at index 8.1 — between 88 and 210 — so linear interpolation returns a number between them that matches no request.",
              fix: "That is the intended behavior (a smooth pack-position estimator). Want an actual data point? Use method='lower', 'higher' or 'nearest'.",
            },
            {
              mistake: "Comparing quartiles across tools (NumPy, statistics module, a textbook) and getting different IQRs.",
              why: "There is no single universal quartile definition; NumPy's linear default is one of many. On 10 points the methods genuinely disagree.",
              fix: "Fix the method in the call and name it in your write-up: np.percentile(x, 75, method='linear'). Comparisons are only fair between equal methods.",
            },
            {
              mistake: "Passing q as a fraction (0.25) instead of a percentage (25).",
              why: "np.percentile(x, 0.25) is the 0.25th percentile — essentially the minimum — not the first quartile.",
              fix: "Percentages 0-100 for np.percentile; fractions 0-1 for its twin np.quantile. Pick one per project and stay consistent.",
            },
          ],
          related: [
            { name: "np.quantile", relation: "The identical function with q as fractions 0-1; quantile(x, 0.25) is percentile(x, 25)." },
            { name: "np.median", relation: "Exactly the 50th percentile with the default method." },
            { name: "np.nanpercentile", relation: "The NaN-skipping version for data with missing values." },
            { name: "np.ptp", relation: "Not a percentile but the related order statistic: max - min, the full range." },
          ],
          applications: [
            "Latency and load-time SLOs: alert on p95/p99, not the mean (the mean hides the slow tail users actually experience)",
            "Box plots: q25, q50, q75 and the 1.5*IQR whiskers — the five-number summary in one call",
            "Outlier fences: values beyond q1 - 1.5*IQR or q3 + 1.5*IQR are the textbook outliers",
          ],
          notes:
            "The old keyword interpolation= was removed in NumPy 2.0 — use method= instead. Weights support (weights=) exists but most uses are better served by np.average.",
        },
        {
          kind: "table",
          title: "Which statistic answers which question",
          headers: ["Statistic", "The question it answers", "How it treats outliers"],
          rows: [
            ["np.mean", "Total per item — the balance point", "Full magnitude counts: one 290 drags the mean of a 52-65 list to 91.71"],
            ["np.median", "What does the middle person see?", "Immune to magnitude: 290 or 290,000, the median stays 60"],
            ["np.average(weights=)", "Mean when items count differently", "Weights can concentrate or dilute outliers, but the result stays in min-max"],
            ["np.std / np.var", "Typical distance from the mean", "Squared distances give outliers a veto — one wild value inflates it"],
            ["IQR (q75 - q25)", "Width of the middle half", "Ignores the tails entirely — the robust spread"],
            ["np.corrcoef", "Do two variables move together?", "One extreme point can manufacture or destroy a correlation"],
          ],
          caption:
            "Centers, spreads, and the one relationship statistic — the robust column is median, IQR; the everything-counts column is mean, std.",
        },
        {
          kind: "heading",
          text: "Correlation: do two variables move together?",
        },
        {
          kind: "text",
          text: "Statistics so far described one variable. `np.corrcoef` relates two: the **correlation coefficient r** measures how consistently they move together, from -1 (perfectly opposite) through 0 (no linear relationship) to +1 (perfectly together). Given two arrays, it hands back a small matrix — and reading that matrix aloud is a skill worth one deliberate practice round.",
        },
        {
          kind: "code",
          title: "Temperature versus ice cream sales",
          code: `import numpy as np

temp = np.array([68, 71, 74, 77, 79, 82, 85])     # 7 days, degrees F
sales = np.array([12, 15, 19, 24, 27, 32, 38])    # ice cream tubs sold

r = np.corrcoef(temp, sales)
print(r)
print("the correlation r:", np.round(r[0, 1], 4))
`,
          output: `[[1.         0.99545467]
 [0.99545467 1.        ]]
the correlation r: 0.9955`,
          outputNote: "A 2x2 matrix: 1.0 on the diagonal, r = 0.9955 on the off-diagonal — hotter days sold more ice cream, almost perfectly linearly.",
          explain: [
            "The diagonal is each variable correlated with itself: always exactly 1.0.",
            "The off-diagonal cells (r[0, 1] and r[1, 0]) are the answer, and they are always equal — correlating x with y is symmetric.",
            "r = 0.9955 is remarkably high; real sales data is noisier, but a clean teaching example shows the shape of the matrix without the noise.",
            "Reading it aloud: 'the correlation of temp with temp is 1, of sales with sales is 1, and of temp with sales is 0.9955.'",
          ],
        },
        {
          kind: "text",
          text: "Behind corrcoef stands **covariance** — `np.cov(x, y)` — the same relationship in raw units: a 2x2 matrix whose diagonal holds each variable's variance and whose off-diagonal holds how they co-vary. Correlation is just covariance divided by both standard deviations, which strips the units: r is a pure number you can compare across datasets. Use np.cov when the units matter (portfolio mathematics in dollars-squared), np.corrcoef when you want the -1..1 reading.",
        },
        {
          kind: "code",
          title: "The covariance view of the same days",
          code: `import numpy as np

temp = np.array([68, 71, 74, 77, 79, 82, 85])
sales = np.array([12, 15, 19, 24, 27, 32, 38])

print(np.round(np.cov(temp, sales), 2))
`,
          output: `[[36.29 55.76]
 [55.76 86.48]]`,
          outputNote: "Variances on the diagonal (36.29 for temp, 86.48 for sales — in squared units), covariance 55.76 off it. Divide 55.76 by sqrt(36.29 * 86.48) and you get r again: 0.9955.",
          explain: [
            "np.cov defaults to the sample formula (ddof=1), unlike np.std — the same ddof story, a different default in a different library.",
            "The units of the off-diagonal are degrees-times-tubs, which is why nobody quotes covariance in prose: divide out the scales and you get r.",
            "Check: 55.76 / (np.std(temp, ddof=1) * np.std(sales, ddof=1)) reproduces 0.9955 exactly.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.corrcoef",
          purpose: "Compute Pearson correlation coefficients — the -1..1 measure of linear association between variables.",
          signature: "np.corrcoef(x, y=None, rowvar=True, *, dtype=None)",
          purposeDetail:
            "np.corrcoef answers 'do these two variables move together?' with a number you can quote: +1 for a perfect line sloping up, -1 sloping down, 0 for no linear relationship. Feed it two 1-D arrays and it returns a 2x2 matrix (ones on the diagonal, r off it); feed it one 2-D array with rowvar=True and it treats every ROW as a variable, returning a full correlation matrix — the input format every statistics course uses. It is covariance with the units divided out, so r from dollars-and-tons can be compared with r from degrees-and-tubs.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "A 1-D variable, or a 2-D array of variables. With rowvar=True each row is a variable and each column an observation; rowvar=False flips that.",
              example: "np.array([68, 71, 74, 77, 79, 82, 85])",
            },
            {
              name: "y",
              type: "array_like or None",
              description: "An optional second variable; np.corrcoef(x, y) equals np.corrcoef(np.vstack([x, y])).",
              example: "sales",
            },
            {
              name: "rowvar",
              type: "bool",
              description: "True (default): rows are variables. False: columns are variables — the shape pandas users usually have.",
              example: "rowvar=False",
            },
          ],
          returns: {
            type: "ndarray",
            description: "The correlation matrix: shape (n_vars, n_vars), 1.0 on the diagonal, symmetric r values off it.",
          },
          example: `import numpy as np

hours = np.array([1, 2, 3, 4, 5, 6])
score = np.array([52, 55, 61, 68, 72, 80])
noise = np.array([52, 80, 61, 42, 72, 90])

r_study = np.corrcoef(hours, score)[0, 1]
r_noise = np.corrcoef(hours, noise)[0, 1]
print("study hours vs score :", np.round(r_study, 3))
print("study hours vs noise :", np.round(r_noise, 3))

# one matrix for three variables at once
m = np.corrcoef(np.vstack([hours, score, noise]))
print(np.round(m, 3))
`,
          exampleOutput: `study hours vs score : 0.994
study hours vs noise : 0.439
[[1.    0.994 0.439]
 [0.994 1.    0.411]
 [0.439 0.411 1.   ]]`,
          commonMistakes: [
            {
              mistake: "Quoting r without remembering it measures only LINEAR association.",
              why: "A perfect U-shaped relationship (x, x**2 over symmetric x) has r near 0 — the strongest possible relationship, invisible to Pearson.",
              fix: "Plot before you conclude (or check rank correlation with scipy.stats.spearmanr when monotonic-but-curved is possible).",
            },
            {
              mistake: "Reading r as a percentage ('r = 0.8 means 80 percent agreement').",
              why: "r is a standardized covariance in [-1, 1], not a fraction of agreement. The shared-variance reading uses r squared: 0.8 means 64 percent of the variance is shared.",
              fix: "Square r in your head when you want 'how much do they share': r**2, the coefficient of determination.",
            },
            {
              mistake: "Expecting the correlation to imply causation because it is 0.99.",
              why: "corrcoef is symmetric and observational: temp correlates with sales at 0.9955, but so does any third variable that rises all week (ice cream ads, swimsuit sales, day index).",
              fix: "Use r to decide what to investigate, never as the conclusion itself.",
            },
          ],
          related: [
            { name: "np.cov", relation: "The raw-units parent: corrcoef is cov divided by the outer product of standard deviations." },
            { name: "np.std", relation: "Supplies the denominators that turn covariance into correlation." },
            { name: "np.corrcoef(..., rowvar=False)", relation: "The columns-as-variables switch for dataframe-shaped data." },
          ],
          applications: [
            "Feature selection: drop one of two features whose mutual r is above ~0.95 (redundant information)",
            "Sanity-checking joins: r near 1 between a key count and a date index often reveals a leak or a trend artifact",
            "Exploratory reports: the correlation matrix of a handful of variables, printed once, orientation done",
          ],
          notes:
            "The old bias and ddof parameters still appear in signatures but are deprecated no-ops for corrcoef — normalization removes them. Use np.corrcoef(np.nan_to_num(...)) or masking for data with NaNs, since one NaN poisons its row and column of the matrix.",
        },
        {
          kind: "heading",
          text: "Statistics along axes (a first taste)",
        },
        {
          kind: "text",
          text: "Every statistic here — mean, median, std, percentile — also runs along an axis of a 2-D array, and statistics courses meet that need immediately: three cities' temperatures over four days wants a per-day average *and* a per-city average from the same grid. Lesson f-04 makes the axis machinery its whole topic; here is the pattern on this lesson's dataset so the idea is not new when you get there.",
        },
        {
          kind: "code",
          title: "One grid, two directions of average",
          code: `import numpy as np

temps = np.array([
    [21.5, 23.0, 22.5, 19.0],   # Coastal City, Mon-Thu
    [28.0, 31.5, 30.0, 27.5],   # Inland City, Mon-Thu
    [24.0, 25.5, 23.5, 22.0],   # Hill City,   Mon-Thu
])

print("grand mean  :", np.round(temps.mean(), 2))
print("per day     :", np.round(temps.mean(axis=0), 2))   # the 3 cities collapse
print("per city    :", np.round(temps.mean(axis=1), 2))   # the 4 days collapse
`,
          output: `grand mean  : 24.83
per day     : [24.5  26.67 25.33 22.83]
per city    : [21.5  29.25 23.75]`,
          outputNote: "axis=0 gave one value per DAY (24.5, 26.67, 25.33, 22.83); axis=1 gave one per CITY (21.5, 29.25, 23.75). Inland City runs hot; Thursday runs cool.",
          explain: [
            "axis=0 collapses the rows — the three cities fold into one average per day.",
            "axis=1 collapses the columns — the four days fold into one average per city.",
            "The grand mean (24.83) is axis=None: everything folded into one number. Notice it equals the mean of either result — averaging is associative here.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Fold the temperature grid both ways",
          mode: "axis",
          name: "temps",
          ops: ["mean", "max"],
          data: [
            [21.5, 23.0, 22.5, 19.0],
            [28.0, 31.5, 30.0, 27.5],
            [24.0, 25.5, 23.5, 22.0],
          ],
          labels: {
            rows: ["Coastal", "Inland", "Hill"],
            cols: ["Mon", "Tue", "Wed", "Thu"],
          },
          caption:
            "The lesson's 3x4 temperature grid in the axis lab. Choose axis=0 and the three cities collapse into one value per day — the per-day means are 24.5, 26.67, 25.33 and 22.83. Choose axis=1 and the four days collapse into one value per city — 21.5, 29.25 and 23.75, exactly the two lines printed above. Then switch the op to max and watch the winners move: the per-day maxima (28, 31.5, 30, 27.5) all come from Inland City, but on no day is every city's reading equal to that max.",
        },
        {
          kind: "tryIt",
          title: "A tipping dataset, top to bottom",
          task:
            "Run it, then: (1) change the 40.00 tip to 20.00 and watch which lines move (mean? median? std?); (2) drop the ddof=1 from std and see how much the noise shrinks; (3) break the hours-quiz pattern by making quiz non-monotonic (try 62, 70, 65, 74, 78, 85) and watch r fall; (4) compute q25 and q75 of tips yourself with np.percentile and check the IQR.",
          code: `import numpy as np

tips = np.array([18.00, 22.50, 15.00, 40.00, 19.50, 17.00, 28.00])

print("mean tip  :", np.round(tips.mean(), 2))
print("median tip:", np.median(tips))
print("sample std:", np.round(tips.std(ddof=1), 2))

hours = np.array([0.5, 1.0, 1.5, 2.0, 2.5, 3.0])
quiz = np.array([62, 65, 70, 74, 78, 85])
print("r (hours vs quiz):", np.round(np.corrcoef(hours, quiz)[0, 1], 3))
`,
          hint:
            "For step 1: the median of 7 values is the middle order statistic, so swapping the largest value cannot move it unless it crosses the middle. For step 3: correlation rewards consistent direction, not just any relationship.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Mean balances, median counts; weights vote, and a weighted mean stays inside min-max; std divides by N unless you say ddof=1 (pandas says it for you); percentiles are pack positions, interpolated — the IQR is the robust spread; and corrcoef hands you a matrix whose off-diagonal is the quote.",
        },
      ],
      terms: [
        { term: "mean vs median", definition: "The two centers: the mean is total/count and counts every magnitude (outliers get a veto); the median is the middle sorted value and ignores magnitudes entirely." },
        { term: "weighted mean", definition: "sum(values * weights) / sum(weights) — a mean where values vote with different sizes. Always lands between the min and max when weights are non-negative." },
        { term: "ddof (delta degrees of freedom)", definition: "The divisor adjustment for spread statistics: divisor = N - ddof. NumPy defaults to ddof=0 (population, divide by N); pandas and sample statistics use ddof=1 (divide by N-1)." },
        { term: "percentile / quantile", definition: "The value below which a given percentage of sorted data falls; percentiles use 0-100, quantiles the 0-1 fraction of the same ranks. Computed by linear interpolation between neighbors by default." },
        { term: "IQR (interquartile range)", definition: "q75 - q25: the width of the middle half of the data — a spread statistic that ignores the tails, unlike std or the range." },
        { term: "correlation coefficient (r)", definition: "Covariance with the units divided out: a -1..1 measure of LINEAR association. The corrcoef matrix carries 1s on its diagonal and the symmetric r values off it." },
      ],
      mistakes: [
        {
          mistake: "Reporting the mean of skewed data as 'the typical value'.",
          why: "The mean counts every unit of magnitude, so one 290k salary drags a 52-65k team's mean to 91.71k — a number that describes nobody. House prices, file sizes and latencies are all shaped this way.",
          fix: "Print both and let the shape decide: roughly symmetric data can quote the mean; skewed data quotes the median (and mentions the skew). np.median is one call.",
        },
        {
          mistake: "Comparing np.std(x) with pandas x.std() and diagnosing a data problem.",
          why: "The two libraries default differently: NumPy divides by N (ddof=0), pandas by N-1 (ddof=1). On 7 points the same data yields 2.0504 versus 2.2147 — an 8 percent gap with nothing wrong.",
          fix: "Align before comparing: np.std(x, ddof=1) matches pandas. Better, name the choice in the variable: pop_std versus sample_std.",
        },
        {
          mistake: "Treating a percentile as a value that must exist in the data.",
          why: "Linear interpolation lands between neighbors whenever the rank is fractional — with 10 prices, q25 is 5.9375, which no store charges. Code that asserts the result is in the array fails on even-sized data.",
          fix: "Expect a smooth estimate by default; pass method='lower'/'nearest' when you need an actual data point (for example, to report a real observed latency).",
        },
        {
          mistake: "Quoting r as proof that one variable causes the other.",
          why: "Correlation is symmetric and observational: hours vs score at r = 0.993 no more proves hours cause scores than scores cause hours, and a third variable can drive both.",
          fix: "Use r to rank what to investigate; reserve causal language for experiments or designs that can support it.",
        },
      ],
      takeaways: [
        "The mean balances, the median counts: on the skewed salary list they differ by 31.7k, and both are honest answers to different questions.",
        "np.average(weights=...) votes by weight: the 3.725 weighted GPA against the 3.75 unweighted one — and a weighted mean can never leave the min-max range.",
        "NumPy std divides by N (ddof=0); pandas divides by N-1. Align ddof before comparing, and on 7 points the difference is a factor of sqrt(7/6) = 1.0801.",
        "Percentiles interpolate: q25 of the price list is 5.9375, a value in no row — and the IQR (3.6175) is the outlier-proof spread.",
        "corrcoef returns a matrix: 1s on the diagonal, the symmetric r (0.9955 for temp vs sales) off it — covariance is the same story in raw units.",
      ],
      quiz: [
        {
          id: "f-03-q1",
          prompt: "Salaries (thousands): np.array([52, 55, 58, 60, 62, 65, 290]). The mean is 91.71 and the median is 60. What happened?",
          options: [
            { text: "The median is wrong — with 7 values the middle should also be pulled up", correct: false, feedback: "The median is the 4th of 7 sorted values, 60, regardless of how large the neighbors are. Position counting has no magnitudes to be pulled by." },
            { text: "The 290 pulls the mean up because every unit of magnitude counts; the median only counts positions, so it stays 60", correct: true, feedback: "Correct. The mean is total/count (442/7), so the outlier's full 290 weighs in; the median just finds the middle order statistic." },
            { text: "NumPy computes the mean excluding extreme values in this case", correct: false, feedback: "The plain mean excludes nothing — that is exactly why the skewed-data advice is to report the median, not to trust a filtered mean." },
            { text: "The two numbers will converge if you add more 52-65k salaries", correct: false, feedback: "They converge only if the new data dilutes the outlier's share of the total; one 290 among 7 will still dominate until N grows large." },
          ],
          explanation: "Mean is total-per-item and counts magnitude; median is the middle position and does not. Skewed data quotes the median.",
        },
        {
          id: "f-03-q2",
          prompt: "On the same array, np.std(x, ddof=1) is always larger than np.std(x). Why?",
          options: [
            { text: "ddof=1 adds a correction for outliers", correct: false, feedback: "ddof has nothing to do with outliers — it changes only the divisor. Outlier handling is what the IQR is for." },
            { text: "It does not hold in general — which is larger depends on the data", correct: false, feedback: "Dividing the same sum of squared deviations by a strictly smaller number (N-1 < N) always yields a larger result, for every dataset of N >= 2." },
            { text: "ddof=1 divides the same squared-deviation total by N-1 instead of N, so the result is inflated by exactly sqrt(N/(N-1))", correct: true, feedback: "Correct — on 7 temperatures that factor is sqrt(7/6) = 1.0801, the ratio printed in the lesson: 2.2147 / 2.0504." },
            { text: "ddof=1 is the population formula, which is always bigger than the sample one", correct: false, feedback: "Backwards: ddof=1 is the SAMPLE formula (the pandas default), and it is the larger one for N >= 2." },
          ],
          explanation: "The divisor is N - ddof; a smaller divisor with the same numerator inflates the result by sqrt(N/(N-1)) — 8 percent at N = 7, negligible at N = 100.",
        },
        {
          id: "f-03-q3",
          prompt: "r = np.corrcoef(temp, sales). Where in the matrix do you read the correlation between the two variables?",
          options: [
            { text: "r[0, 0] — the first variable's slot", correct: false, feedback: "r[0, 0] is temp correlated with itself: exactly 1.0, always, telling you nothing about sales." },
            { text: "r[0, 1] (which equals r[1, 0]) — the off-diagonal", correct: true, feedback: "Correct: the off-diagonal cells hold the pairwise r (0.9955 here), and they are equal because correlation is symmetric." },
            { text: "The average of all four cells", correct: false, feedback: "Averaging would fold in the two diagonal 1.0s and inflate the answer — the matrix is meant to be read, not averaged whole." },
            { text: "r[1, 1] — the result slot", correct: false, feedback: "r[1, 1] is sales correlated with itself — another guaranteed 1.0 on the diagonal." },
          ],
          explanation: "The corrcoef matrix: 1.0 on the diagonal, the symmetric pairwise correlations off it. Two variables means one number quoted twice: r[0, 1].",
        },
      ],
    },

    // ------------------------------------------------------------- f-04
    {
      slug: "f-04",
      title: "Aggregations: Folding Arrays Along Axes",
      minutes: 18,
      summary:
        "The full reduction story: sum, prod, cumsum and cumprod, argmin and argmax with unravel_index, any and all with axis, boolean counting as int64 sums, keepdims for broadcasting, dtype control for float32 accumulation, and the initial= seed.",
      kind: "concept",
      objectives: [
        "Predict the shape and content of a.sum(axis=0), a.sum(axis=1), a.sum() and a.sum(axis=1, keepdims=True) without running them",
        "Use cumsum and cumprod for running totals and compounding factors, and find where a running total crosses a threshold",
        "Turn argmax's flat answer into a [row, col] with np.unravel_index, and know that ties return the first occurrence",
        "Ask yes/no questions with any and all along an axis, and count with boolean sums (which accumulate as int64)",
        "Explain why float32 summation drifts and how dtype=np.float64 fixes it, and use initial= honestly",
      ],
      why: "Aggregation is where arrays earn their keep: a million readings become one number, or better, one number per sensor, one number per day. NumPy's word for this is reduction — folding an array along an axis until that axis is gone — and the axis parameter is the whole game. Get it backwards and your per-day totals are quietly per-sensor totals; nothing crashes, every number looks plausible, and the dashboard lies. This lesson owns the axis story end to end (Lesson e-02 previewed keepdims; here it becomes a tool you reach for), adds the running aggregates cumsum and cumprod, the WHERE answers argmin and argmax, the yes/no answers any and all, the counting idiom that turns boolean masks into int64 sums, and the numeric hygiene chapter: why float32 accumulation drifts and what initial= is actually for. Every number below is machine-verified on the same grid it is claimed about.",
      blocks: [
        {
          kind: "text",
          text: "A **reduction** (NumPy's own word: `np.sum` lives in `np reductions`) takes many values and returns fewer — usually one. Sum, prod, min, max, mean, std, any, all are all reductions, and every one of them takes the same three questions: fold *everything* (the default), fold *this axis*, or fold *this axis but keep it alive* (`keepdims`). Master the questions once and the entire shelf of reductions becomes interchangeable.",
        },
        {
          kind: "heading",
          text: "The axis decoder: 0 rows, 1 columns",
        },
        {
          kind: "text",
          text: "A 2-D array has two axes: axis 0 runs *down* the rows, axis 1 runs *across* the columns. When you reduce `axis=0`, the rows collapse — you get **one value per column**. When you reduce `axis=1`, the columns collapse — **one value per row**. The result keeps the axes you did not touch. That is the entire rule; the rest of this lesson is consequences.",
        },
        {
          kind: "code",
          title: "One revenue grid, three folds",
          code: `import numpy as np

revenue = np.array([
    [210, 195, 230, 260],   # North region, Q1-Q4
    [180, 205, 190, 215],   # South region, Q1-Q4
    [260, 275, 250, 290],   # East region,  Q1-Q4
])

print("total                :", revenue.sum())     # axis=None: everything folds
print("per quarter (axis=0) :", revenue.sum(axis=0))  # rows collapse -> 4 values
print("per region  (axis=1) :", revenue.sum(axis=1))  # columns collapse -> 3 values
`,
          output: `total                : 2760
per quarter (axis=0) : [650 675 670 765]
per region  (axis=1) : [ 895  790 1075]`,
          outputNote: "The grand total is 2760. axis=0 collapsed the 3 regions into one total per quarter (650, 675, 670, 765); axis=1 collapsed the 4 quarters into one total per region (895, 790, 1075).",
          explain: [
            "`revenue.sum()` is `axis=None`: all 12 values fold into one scalar, 2760.",
            "`revenue.sum(axis=0)` folds along the row direction — the three regions merge — leaving one value per quarter. Sanity check: 210 + 180 + 260 is 650, the first number printed.",
            "`revenue.sum(axis=1)` folds along the column direction — the four quarters merge — leaving one value per region: 895 for North.",
            "Function form and method form are the same function: np.sum(a, axis=0) is a.sum(axis=0). Use whichever reads better in context.",
          ],
        },
        {
          kind: "visual",
          title: "Watch the fold",
          ascii: `axis=0: rows collapse (one value per column)   axis=1: columns collapse (one value per row)

  North  [210  195  230  260] --.                [210][195][230][260] -->  895
  South  [180  205  190  215] --+--> [650 675 670 765]  [180][205][190][215] -->  790
  East   [260  275  250  290] --'                  [260][275][250][290] --> 1075

  axis=None: both collapse --> 2760 (the scalar)`,
          caption:
            "The arrows are the fold. Reducing an axis removes it from the result's shape: a (3, 4) grid reduced along axis 0 has shape (4,); reduced along axis 1, shape (3,).",
        },
        {
          kind: "table",
          title: "The axis decoder for a (3, 4) input",
          headers: ["Call", "What collapses", "Result shape"],
          rows: [
            ["a.sum()", "everything (axis=None)", "scalar"],
            ["a.sum(axis=0)", "the rows — one value per column", "(4,)"],
            ["a.sum(axis=1)", "the columns — one value per row", "(3,)"],
            ["a.sum(axis=1, keepdims=True)", "the columns, axis kept alive as 1", "(3, 1)"],
          ],
          caption:
            "Read axis as 'the direction that disappears.' keepdims keeps the folded axis as a size-1 axis so the result broadcasts back against the original.",
        },
        {
          kind: "heading",
          text: "keepdims: keeping the axis alive for broadcasting",
        },
        {
          kind: "text",
          text: "Lesson e-02 previewed this; now you own it. `keepdims=True` leaves the reduced axis in the result with size 1 instead of deleting it. That sounds cosmetic — until you need the result to broadcast against the original array, which is the single most common reason to reach for it.",
        },
        {
          kind: "code",
          title: "Each region's share of its own annual total",
          code: `import numpy as np

revenue = np.array([
    [210, 195, 230, 260],
    [180, 205, 190, 215],
    [260, 275, 250, 290],
])

# (3, 4) divided by (3, 1) -- broadcasting pairs each row with its own total
shares = revenue / revenue.sum(axis=1, keepdims=True)

print(np.round(shares * 100, 1))    # each row now sums to 100
`,
          output: `[[23.5 21.8 25.7 29.1]
 [22.8 25.9 24.1 27.2]
 [24.2 25.6 23.3 27. ]]`,
          outputNote: "North's Q1 is 23.5 percent of North's 895; East's Q4 is 27 percent of East's 1075. Every row sums to 100 — the (3, 1) denominator gave each row its own divisor.",
          explain: [
            "`revenue.sum(axis=1)` alone has shape (3,) — dividing (3, 4) by (3,) raises or mispairs, because broadcasting lines up the LAST axes.",
            "With `keepdims=True` the sum has shape (3, 1), which broadcasts down each row: Part E's rule doing exactly what you wanted.",
            "Without keepdims you would need revenue / revenue.sum(axis=1)[:, None] — the same (3, 1) shape, spelled by hand. keepdims says it out loud.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The axis lab: the centerpiece of this lesson",
          mode: "axis",
          name: "revenue",
          ops: ["sum", "mean", "max"],
          data: [
            [210, 195, 230, 260],
            [180, 205, 190, 215],
            [260, 275, 250, 290],
          ],
          labels: {
            rows: ["North", "South", "East"],
            cols: ["Q1", "Q2", "Q3", "Q4"],
          },
          caption:
            "The lesson's revenue grid in the axis lab. Switch between sum, mean and max and between axis=0 and axis=1, and predict every result before you click: axis=0 sums to [650, 675, 670, 765] and maximizes to [260, 275, 250, 290]; axis=1 sums to [895, 790, 1075] and averages to [223.75, 197.5, 268.75]. The color groups show which cells fold together — the whole lesson in one picture.",
        },
        {
          kind: "functionDoc",
          name: "np.sum",
          purpose: "Add up the values of an array — all of them, or along one axis — with full control of the accumulator.",
          signature:
            "np.sum(a, axis=None, dtype=None, out=None, keepdims=False, initial=None, where=True)",
          purposeDetail:
            "np.sum is the reduction you will call more than every other combined: totals, counts of true booleans, dot-product building blocks, per-group rollups. Beyond the plain fold it carries three controls that matter in real pipelines: dtype chooses the accumulator (float32 data summed in float32 drifts — the demo below), keepdims keeps the folded axis alive as a 1 for broadcasting, and initial seeds the fold with a starting value (so a sum of nothing can still be something). The method form a.sum(...) is identical; np.add.reduce(a) is the bare ufunc underneath.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to add. Booleans count as 0/1 — the counting idiom below. NaN anywhere makes the total NaN (np.nansum skips them).",
              example: "np.array([[210, 195], [180, 205]])",
            },
            {
              name: "axis",
              type: "int, tuple of int or None",
              description: "The axis (or axes) to fold away. None (default) folds everything into a scalar. A tuple folds several axes at once: axis=(0, 1) on a 3-D array flattens the first two.",
              example: "axis=1",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "The accumulator type. Integer inputs sum in their own (or a wider) integer type; float32 stays float32 and drifts on long arrays — pass dtype=np.float64 when the total must be exact.",
              example: "dtype=np.float64",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep the folded axes as size-1 axes, so the result broadcasts against the original (the shares pattern above).",
              example: "keepdims=True",
            },
            {
              name: "initial",
              type: "scalar or None",
              description: "A starting value for the fold: the result is initial + sum. For sums this is rarely wanted (0 is the natural identity), but it makes empty slices return initial instead of 0-by-accident, and it is the honest way to fold with a floor.",
              example: "initial=100",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "A mask of positions to include in the fold: a.sum(where=mask) adds only where the mask is True. Combine with initial to avoid a 0-from-nothing answer.",
              example: "where=mask",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "The sum: a scalar with axis=None, otherwise the input's shape with the folded axes removed (or kept as 1s with keepdims). Boolean input sums as an integer count; empty input sums to 0.",
          },
          example: `import numpy as np

revenue = np.array([
    [210, 195, 230, 260],
    [180, 205, 190, 215],
])

print(np.sum(revenue))                        # the grand total
print(np.sum(revenue, axis=0))                # per quarter
print(np.sum(revenue, axis=1, keepdims=True)) # per region, axes alive
print(np.sum(revenue, initial=1000))          # seeded fold
print(np.sum(np.array([[True, False], [True, True]])))  # counting
`,
          exampleOutput: `1685
[390 400 420 475]
[[895]
 [790]]
2685
3`,
          commonMistakes: [
            {
              mistake: "Summing a long float32 array in place and trusting every digit.",
              why: "float32 has about 7 decimal digits; summing 100,000 values of 0.1 accumulates rounding error. Verified below: the float32 total of a hundred thousand 0.1s is 10000.001, off in the 8th significant digit — while dtype=np.float64 gets 10000.000149011612, the closest float64 to the true 10000.",
              fix: "Pass dtype=np.float64 for scientific totals, or store the data as float64 from the start. float32 is for storage and throughput, not for exact accumulation.",
            },
            {
              mistake: "Expecting a.sum(axis=0) to return 'the row sums'.",
              why: "axis=0 folds ALONG the rows, so the rows disappear and you get one value per COLUMN. The mnemonic that works: axis is the direction that vanishes.",
              fix: "Say it out loud before typing: 'collapse the regions' (axis=0, per-quarter result) versus 'collapse the quarters' (axis=1, per-region result). The labels in the axis lab above are the drill.",
            },
            {
              mistake: "Writing my_sum = 0; for value in a: my_sum += value.",
              why: "It works and is a hundred times slower than a.sum() — the loop pays Python interpreter overhead per element while the reduction runs as one compiled sweep over the buffer.",
              fix: "a.sum(), or a.sum(axis=...) when the question is per-row or per-column. Loops are for logic, reductions are for arithmetic.",
            },
          ],
          related: [
            { name: "np.cumsum", relation: "The running version: every prefix total instead of one final total." },
            { name: "np.prod", relation: "The same fold with multiplication — same axis/dtype/keepdims/initial machinery." },
            { name: "np.nansum", relation: "The NaN-skipping sibling for data with missing values." },
            { name: "np.add.reduce", relation: "The bare ufunc reduction underneath; np.sum adds dtype promotion and the axis=None convenience." },
          ],
          applications: [
            "Dashboards: totals, per-group totals and shares in three calls (the revenue pattern of this lesson)",
            "Counting: (a > limit).sum() counts threshold violations as an int64 total",
            "Matrix operations: row norms, column means, trace-adjacent sums — linear algebra on a budget",
          ],
          notes:
            "np.sum on integers uses at least the platform int (int64 on 64-bit Linux/macOS), so int32 arrays cannot overflow mid-sum silently. Float sums use pairwise summation — far more accurate than naive left-to-right accumulation, but not exact for float32 inputs (see the drift demo).",
        },
        {
          kind: "heading",
          text: "Running totals: cumsum and cumprod",
        },
        {
          kind: "text",
          text: "Sometimes you do not want the total — you want every total *so far*. `np.cumsum` (cumulative sum) returns the running total: same length as the input, each position holding the sum of everything up to and including it. `np.cumprod` is the compounding version — each position the product of everything before it, which is how growth factors chain.",
        },
        {
          kind: "code",
          title: "Running revenue and compounding growth",
          code: `import numpy as np

monthly = np.array([82, 95, 88, 91, 104, 99])   # revenue by month

print("monthly      :", monthly)
print("running total:", monthly.cumsum())

# growth factors per quarter: +5%, +2%, -3%, +4%
factors = np.array([1.05, 1.02, 0.97, 1.04])
print("compounded   :", np.round(factors.cumprod(), 4))
`,
          output: `monthly      : [ 82  95  88  91 104  99]
running total: [ 82 177 265 356 460 559]
compounded   : [1.05   1.071  1.0389 1.0804]`,
          outputNote: "Month by month the total climbs 82, 177, 265, 356, 460, 559 — and the four growth factors compound to 1.0804, an 8.04 percent gain for the year.",
          explain: [
            "`cumsum` keeps the input's shape: position i holds the sum of positions 0..i. The last element is always the plain sum (559).",
            "`cumprod` chains the factors: 1.05, then 1.05*1.02 = 1.071, then *0.97 = 1.0389, then *1.04 = 1.0804. The final element is the total growth factor.",
            "Both take axis= for 2-D data (per-row or per-column running totals) and dtype= for accumulator control, just like sum.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.cumsum",
          purpose: "Return the running (cumulative) total: every prefix sum of the input, same shape as the input.",
          signature: "np.cumsum(a, axis=None, dtype=None, out=None)",
          purposeDetail:
            "Where np.sum answers 'how much in total', np.cumsum answers 'how much by now' — the question dashboards with year-to-date columns ask. The result has the input's shape: position i is the sum of positions 0 through i along the chosen axis, so the last element always equals the plain sum. The cumulative pattern pairs beautifully with comparisons and argmax: (running >= goal) is a boolean array of 'goal met yet?', and argmax of it finds the FIRST index where the running total crossed the line.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values. Booleans work (a running count of True), and NaN poisons every total from its position onward.",
              example: "np.array([40, 65, 30, 80, 55])",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Fold along this axis only. None (default) flattens first: a 2-D input returns a flat running total of the whole array in row-major order.",
              example: "axis=1",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "The accumulator type — same story as np.sum: pass dtype=np.float64 when float32 input must accumulate exactly.",
              example: "dtype=np.float64",
            },
          ],
          returns: {
            type: "ndarray",
            description: "Same shape as the input (or flattened when axis=None): the running totals. For an empty input, an empty array — there is no scalar to return, unlike sum.",
          },
          example: `import numpy as np

donations = np.array([40, 65, 30, 80, 55])
running = np.cumsum(donations)
print(running)

# when did the fundraiser cross 200?
crossed = running >= 200
print("goal met at index:", int(np.argmax(crossed)))
print("that donation was:", donations[np.argmax(crossed)])
`,
          exampleOutput: `[ 40 105 135 215 270]
goal met at index: 3
that donation was: 80`,
          commonMistakes: [
            {
              mistake: "Confusing cumsum's output length with sum's scalar.",
              why: "cumsum never reduces — it re-shapes information into prefix form, so a 5-element input gives 5 running totals, the last being the total sum.",
              fix: "Want one number? np.sum. Want the trajectory (year-to-date, progress-to-goal)? cumsum.",
            },
            {
              mistake: "Forgetting axis=None flattens a 2-D array first.",
              why: "np.cumsum(grid) runs one flat total across the row-major layout — row 1's totals include all of row 0 — which is almost never the per-row running total you meant.",
              fix: "Say which: np.cumsum(grid, axis=1) for per-row running totals, axis=0 for per-column.",
            },
            {
              mistake: "Calling np.argmax(running >= goal) when the goal is never reached.",
              why: "If the boolean array is all False, argmax returns 0 — 'goal met at index 0', a confident lie.",
              fix: "Check first: if not (running >= goal).any(): report never-crossed. any (below) is the guard for every argmax-of-a-mask pattern.",
            },
          ],
          related: [
            { name: "np.sum", relation: "The final element of cumsum — when you only want the last number, sum is cheaper and clearer." },
            { name: "np.cumprod", relation: "The multiplicative sibling: running products, the compounding tool." },
            { name: "np.diff", relation: "The exact inverse operation: diff of a cumsum returns the original deltas (first element aside)." },
          ],
          applications: [
            "Year-to-date columns and progress-toward-goal charts",
            "Finding first-crossing events: argmax of (cumsum(x) >= threshold)",
            "Running counts of conditions: np.cumsum(errors == code) tracks how often each failure has occurred so far",
          ],
        },
        {
          kind: "heading",
          text: "WHERE, not what: argmin and argmax",
        },
        {
          kind: "text",
          text: "`max` tells you the best value. `argmax` tells you *where* it lives — the index of the first occurrence. On a flat array that index is a position; on a grid, `np.argmax` without axis returns the **flat** position, and `np.unravel_index` converts that flat number into the [row, col] pair you actually wanted.",
        },
        {
          kind: "code",
          title: "From flat argmax to [row, col]",
          code: `import numpy as np

revenue = np.array([
    [210, 195, 230, 260],
    [180, 205, 190, 215],
    [260, 275, 250, 290],
])

flat_best = revenue.argmax()          # the flat (row-major) position
print("flat argmax :", flat_best)
print("as [row,col]:", np.unravel_index(flat_best, revenue.shape))
print("best value  :", revenue[np.unravel_index(flat_best, revenue.shape)])

# ties: argmax reports the FIRST occurrence only
scores = np.array([70, 95, 88, 95])
print("first winner only:", scores.argmax())
`,
          output: `flat argmax : 11
as [row,col]: (np.int64(2), np.int64(3))
best value  : 290
first winner only: 1`,
          outputNote: "The flat argmax is 11 — position 11 in row-major order is East's Q4 (row 2, col 3), the 290. And of the two 95s, argmax names index 1: first occurrence only.",
          explain: [
            "Row-major counting: positions 0-3 are North's quarters, 4-7 South's, 8-11 East's — so flat position 11 is [2, 3], value 290.",
            "`np.unravel_index(flat, shape)` is the general flat-to-multi-index converter; its partner `np.ravel_multi_index` goes the other way (Lesson d-02's flat-index rules, formalized).",
            "The tuple it returns contains NumPy integer scalars (you can see their repr in the output) — they behave exactly like plain ints for indexing, comparisons and arithmetic.",
            "Ties: two 95s, one answer — index 1. If you need every winner, ask (scores == scores.max()).",
          ],
        },
        {
          kind: "code",
          title: "argmax along axes: best per row, best per column",
          code: `import numpy as np

# rows: students (0-2); columns: tests (0-2)
exam = np.array([
    [88, 92, 79],
    [95, 61, 84],
    [70, 83, 91],
])

print("best student on each test (axis=0):", exam.argmax(axis=0))
print("best test for each student (axis=1):", exam.argmax(axis=1))
`,
          output: `best student on each test (axis=0): [1 0 2]
best test for each student (axis=1): [1 0 2]`,
          outputNote: "axis=0 collapses students: test 0's best is student 1 (the 95), test 1's is student 0 (the 92), test 2's is student 2 (the 91). axis=1 collapses tests: student 0 peaked on test 1, student 1 on test 0, student 2 on test 2. Both print [1 0 2] — a coincidence worth noticing, not a rule.",
          explain: [
            "argmax with an axis returns an INDEX array, not values — the shape follows the surviving axis, just like sum.",
            "axis=0 answers 'per column' (who won each test); axis=1 answers 'per row' (each student's best test).",
            "The two results happen to be equal here ([1, 0, 2] both ways) because the high values sit on a diagonal — verify by eye: the maxima 95, 92, 91 are at [1,0], [0,1], [2,2].",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.argmax",
          purpose: "Return the index of the (first) maximum value — WHERE the best value lives, not what it is.",
          signature: "np.argmax(a, axis=None, out=None, *, keepdims=False)",
          purposeDetail:
            "Any loop that searches for 'the day with the most sales' or 'the sensor that fired first' is an argmax you can write in one call: it scans and returns an index you can use to look up the value, the label, the timestamp. Three behaviors define it: without axis it returns the FLAT index of a multi-dimensional array (pair it with np.unravel_index); ties always resolve to the first occurrence; and an all-False boolean mask argmax still returns 0 — guard with any() when the maximum might not exist. np.argmin is the same function hunting the minimum.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to search. NaN wins max comparisons against non-NaN data — clean NaNs first (np.nanargmax skips them).",
              example: "np.array([[88, 92], [95, 61]])",
            },
            {
              name: "axis",
              type: "int or None",
              description: "Search along this axis only: one winner index per surviving position. None (default) flattens and returns a single flat index.",
              example: "axis=1",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "An array to write the indices into — for hot loops that reuse one buffer.",
              example: "out=winners",
            },
          ],
          returns: {
            type: "ndarray or scalar (integer)",
            description: "The index of the first maximum: a scalar flat index with axis=None, or an integer array shaped like a with the searched axis removed.",
          },
          example: `import numpy as np

exam = np.array([
    [88, 92, 79],
    [95, 61, 84],
    [70, 83, 91],
])

flat = exam.argmax()
print("flat index:", flat)

row, col = np.unravel_index(flat, exam.shape)
print("best score:", exam[row, col], "by student", row, "on test", col)
print("each student's best test:", exam.argmax(axis=1))
`,
          exampleOutput: `flat index: 3
best score: 95 by student 1 on test 0
each student's best test: [1 0 2]`,
          commonMistakes: [
            {
              mistake: "Using the argmax INDEX as if it were the maximum VALUE.",
              why: "exam.argmax() returns 3 (a position), not 95 (the score) — printing it as 'the best result was 3' is a classic copy-paste bug.",
              fix: "Look the value up: a[a.argmax()], or a.max() when you only wanted the value.",
            },
            {
              mistake: "Forgetting that without axis, a 2-D array's argmax is a FLAT index.",
              why: "revenue.argmax() is 11 — not (2, 3) and not row 2's index 2. Indexing revenue[11] would raise an IndexError on a 2-D array with only 3 rows.",
              fix: "np.unravel_index(flat, a.shape) converts flat to [row, col]; or pass axis= when you want one winner per row or column.",
            },
            {
              mistake: "Expecting argmax to report every tied winner.",
              why: "Of [70, 95, 88, 95] it reports 1 — the first 95 — and index 3's tie is silent.",
              fix: "All winners: np.flatnonzero(a == a.max()). Or accept first-wins and say so in your documentation.",
            },
            {
              mistake: "Calling argmax on a boolean mask that might be all False.",
              why: "np.argmax(np.array([False, False])) returns 0 — 'the first True is at 0', which is a lie. argmax of an all-False mask always points at index 0.",
              fix: "Guard with any(): if mask.any(): first = int(mask.argmax()). The same guard protects the cumsum first-crossing pattern.",
            },
          ],
          related: [
            { name: "np.argmin", relation: "The mirror image: index of the (first) minimum." },
            { name: "np.unravel_index", relation: "The flat-to-[row, col] converter that makes axis-less argmax usable on grids." },
            { name: "np.nanargmax", relation: "The NaN-skipping version — plain argmax treats NaN as bigger than everything." },
            { name: "np.where / np.flatnonzero", relation: "All positions matching a condition, when one winner is not enough." },
          ],
          applications: [
            "Peak detection: the day/hour of maximum load — argmax plus unravel_index gives the [row, col] of the spike",
            "Classification: the predicted class is the argmax of a probability row (the machine-learning idiom)",
            "First-occurrence search: argmax of a boolean mask, guarded by any()",
          ],
        },
        {
          kind: "heading",
          text: "Yes/no questions: any and all",
        },
        {
          kind: "text",
          text: "Some questions are binary: did ANY day exceed the limit? are ALL readings in range? `np.any` is True if at least one element is truthy; `np.all` is True only if every element is. Both reduce along an axis like everything else in this lesson, which is what makes them powerful — 'any per day' and 'any per sensor' are different questions about the same grid.",
        },
        {
          kind: "code",
          title: "Three sensors, five days, one limit",
          code: `import numpy as np

# daily particulate readings; the regulatory limit is 50
readings = np.array([
    [32, 45, 51, 38, 29],   # sensor A, Mon-Fri
    [55, 60, 47, 52, 44],   # sensor B, Mon-Fri
    [28, 33, 30, 27, 26],   # sensor C, Mon-Fri
])

over = readings > 50

print("any sensor over, per day   (axis=0):", over.any(axis=0))
print("each sensor ever over?     (axis=1):", over.any(axis=1))
print("sensors clean all week?    (axis=1):", (~over).all(axis=1))
print("the whole grid clean?              :", (readings <= 50).all())
`,
          output: `any sensor over, per day   (axis=0): [ True  True  True  True False]
each sensor ever over?     (axis=1): [ True  True False]
sensors clean all week?    (axis=1): [False False  True]
the whole grid clean?              : False`,
          outputNote: "Four days had at least one violation (Friday did not); sensors A and B violated at some point while C was clean all week; and the grid as a whole is not clean — sensor B's Tuesday reading of 60 alone answers that.",
          explain: [
            "`over.any(axis=0)` collapses the sensors: one yes/no per day. Friday's [29, 44, 26] never crosses 50, so it alone is False.",
            "`over.any(axis=1)` collapses the days: one yes/no per sensor. A and B each crossed at least once; C never did.",
            "`(~over).all(axis=1)` is the complementary question — 'always in range' — and C alone says True.",
            "With no axis, any/all answer for the entire array in one boolean. `(readings <= 50).all()` is the whole-grid test.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.any",
          purpose: "Return True if at least one element (along an axis) is truthy — the existence question.",
          signature: "np.any(a, axis=None, out=None, keepdims=False, *, where=True)",
          purposeDetail:
            "np.any is the boolean reduction: it folds an array of True/False down to a single 'is anything here?' — or, with axis, to one yes/no per row, column, sensor or day. It short-circuits nothing (it scans everything, compiled), but it never lies: unlike Python's or it cannot accidentally pick the first truthy VALUE instead of a boolean. np.all is its dual (everything, not something); np.any and the count idioms of this lesson cover most threshold monitoring between them.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values; nonzero numbers count as True. Usually a boolean mask from a comparison, as in readings > 50.",
              example: "readings > 50",
            },
            {
              name: "axis",
              type: "int, tuple of int or None",
              description: "Fold along this axis only — one answer per surviving position. None (default) answers for the whole array.",
              example: "axis=0",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep the folded axis alive as size 1 — the broadcasting trick, in boolean form.",
              example: "keepdims=True",
            },
          ],
          returns: {
            type: "bool or ndarray of bool",
            description: "A single boolean with axis=None, or a boolean array shaped like a with the folded axes removed. An empty array gives False — nothing exists in it.",
          },
          example: `import numpy as np

limit = 50
readings = np.array([
    [32, 45, 51, 38, 29],
    [55, 60, 47, 52, 44],
    [28, 33, 30, 27, 26],
])

over = readings > limit
print("any sensor over, per day:", over.any(axis=0))
print("each sensor ever over?  :", over.any(axis=1))
print("perfectly clean grid?   :", not over.any())
`,
          exampleOutput: `any sensor over, per day: [ True  True  True  True False]
each sensor ever over?  : [ True  True False]
perfectly clean grid?   : False`,
          commonMistakes: [
            {
              mistake: "Calling any() on the raw data instead of the comparison.",
              why: "np.any(readings) is True whenever any reading is nonzero — 28 counts as truthy just like 60. The question 'over the limit?' must be asked first: readings > limit.",
              fix: "any and all consume the MASK, not the measurements: (readings > limit).any().",
            },
            {
              mistake: "Writing if (temps > 30 and wind < 10).any():.",
              why: "Python's and wants single booleans and raises the ambiguous-truth-value error from Lesson f-01 on the array operands.",
              fix: "Combine elementwise with & and | in parentheses, then reduce: ((temps > 30) & (wind < 10)).any().",
            },
            {
              mistake: "Expecting np.any(...) to tell you HOW MANY or WHICH.",
              why: "any answers existence only: one violation and fifty violations both give True. The index of the violator needs argmax of the mask; the count needs sum.",
              fix: "Count with (mask).sum(); locate the first with mask.argmax() (guarded by mask.any()); list all with np.flatnonzero(mask).",
            },
          ],
          related: [
            { name: "np.all", relation: "The dual: True only when EVERYTHING is true — swap any/all and negate to translate between them." },
            { name: "np.count_nonzero", relation: "The counting version: not 'is there one?' but 'how many?'" },
            { name: "np.flatnonzero", relation: "The locator: indices of all True positions." },
          ],
          applications: [
            "Threshold monitoring: did any sensor/day/quadrant cross the line — per row, per column, or overall",
            "Input validation: assert np.all((x >= 0) & (x <= 1)) before code that assumes a probability vector",
            "Early-exit logic expressed declaratively: if not mask.any(): return, instead of loop-and-flag code",
          ],
        },
        {
          kind: "heading",
          text: "Counting is summing booleans",
        },
        {
          kind: "text",
          text: "Lesson f-01 showed comparisons produce boolean arrays. Here is why that is a counting superpower: **True counts as 1 and False as 0 when you sum**, so `(a > threshold).sum()` is the number of values over the threshold — and the sum accumulates as `int64`, not bool, so it cannot silently stay stuck being a flag.",
        },
        {
          kind: "code",
          title: "Counting warm days, with dtype proof",
          code: `import numpy as np

temps = np.array([12.5, 19.0, 23.5, 21.0, 18.5])

warm = temps > 20
print("warm flags   :", warm)
print("count of warm:", warm.sum())
print("the sum's dtype:", warm.sum().dtype)

print("count_nonzero:", np.count_nonzero(warm))
print("count cold   :", np.count_nonzero(~warm))
`,
          output: `warm flags   : [False False  True  True False]
count of warm: 2
the sum's dtype: int64
count_nonzero: 2
count cold   : 3`,
          outputNote: "Two days exceeded 20 (the 23.5 and the 21.0), and the sum of the boolean array is an int64 — 2, not True — ready for arithmetic.",
          explain: [
            "`warm` is `[False, False, True, True, False]`; summing counts the Trues: 2.",
            "The dtype print is the proof: bool arrays sum to int64 — you can multiply the count, average it, use it as a denominator.",
            "`np.count_nonzero` does the same count in one call and is slightly faster; `~warm` flips the question to count the cold days.",
          ],
        },
        {
          kind: "heading",
          text: "Numeric hygiene: dtype= and initial=",
        },
        {
          kind: "text",
          text: "Two last controls, both about edge conditions. First the accumulator: `dtype=` chooses the type the fold runs in, and for float32 data that choice is the difference between a correct total and a drifted one. Second the seed: `initial=` gives the fold a starting value — its honest purpose is defining what a fold over *nothing* should return.",
        },
        {
          kind: "code",
          title: "Why float32 sums drift (small verified demo)",
          code: `import numpy as np

a = np.full(100_000, 0.1, dtype=np.float32)   # a hundred thousand 0.1s

print("float32 accumulation:", a.sum())              # stays in float32
print("float64 accumulation:", a.sum(dtype=np.float64))
`,
          output: `float32 accumulation: 10000.001
float64 accumulation: 10000.000149011612`,
          outputNote: "The true answer is 10000. float32 accumulation lands on 10000.001; accumulating in float64 lands on 10000.000149011612 — the closest float64 to the truth. (Even float64 carries a little of 0.1's binary inexactness — that is Lesson f-02's storage story.)",
          explain: [
            "0.1 has no exact binary representation, so each addition rounds a little; float32's ~7 significant digits cannot absorb 100,000 of those roundings, and the total drifts to 10000.001.",
            "Re-accumulating the SAME float32 data into a float64 accumulator drifts 200 million times less: 10000.000149011612 versus the exact 10000.",
            "The fix is not 'always float64': it is matching the accumulator to the claim. Sensor logs and image buffers can stay float32; scientific totals and statistics should pass dtype=np.float64.",
          ],
        },
        {
          kind: "code",
          title: "A fold over nothing",
          code: `import numpy as np

# sum has a natural identity (0), so an empty array sums harmlessly:
print("empty sum:", np.sum(np.array([])))

# max has NO identity -- which value should 'the max of nothing' be?
np.array([]).max()
`,
          expectError:
            "ValueError: zero-size array to reduction operation maximum which has no identity",
          outputNote:
            "The error says it precisely: maximum has no identity element, so NumPy refuses to invent one. initial= is how you supply your own.",
        },
        {
          kind: "code",
          title: "initial=, used honestly",
          code: `import numpy as np

# seed an empty max with your own identity: 'no readings means 0'
print("seeded max of empty:", np.array([]).max(initial=0.0))

# it also sets a floor for non-empty folds: nothing below 100 can win
donations = np.array([25, 90, 40])
print("max with a floor of 100:", donations.max(initial=100))
print("max without the floor   :", donations.max())

# and a seed for products: compound 3 * 4 starting from a 2x unit
print("prod with seed 2        :", np.prod(np.array([3, 4]), initial=2))
`,
          output: `seeded max of empty: 0.0
max with a floor of 100: 100
max without the floor   : 90
prod with seed 2        : 24`,
          outputNote: "The seeded empty max is 0.0; the floor turns a real max of 90 into 100; and prod seeded with 2 returns 24 — the fold starts at 2 and multiplies its way through 3 and 4.",
          explain: [
            "`initial=` participates in the fold as the starting value: max(initial=100) can never return less than 100, prod(initial=2) multiplies everything by 2.",
            "The empty-max use is the honest one: it defines the answer for zero-data slices so grouped reports do not crash on an empty group.",
            "The floor use is the dangerous one: it silently changes the answer for non-empty data. If you use it that way, name it in a comment — 'a floor, not a seed'.",
          ],
        },
        {
          kind: "tryIt",
          title: "A week of step counts",
          task:
            "Run it, then: (1) change the first sum to mean and read the daily average; (2) find the FIRST day the running total passes 20000 with int(np.argmax(steps.cumsum() >= 20000)) — and check it is honest first with .any(); (3) count the days below the weekly average with a boolean sum; (4) switch argmax to argmin and find the laziest day.",
          code: `import numpy as np

steps = np.array([4200, 8100, 6300, 9900, 5100, 7400])

print("week total :", steps.sum())
print("running    :", steps.cumsum())
print("best day is", steps.argmax(), "with", steps.max())

goal = 8000
print("days at/over goal:", (steps >= goal).sum())
print("any day over?    :", (steps >= goal).any())
`,
          hint:
            "For step 2: (steps.cumsum() >= 20000) is a boolean mask, argmax of it finds the first True — but only after .any() confirms there is one. For step 3: (steps < steps.mean()).sum().",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Reductions fold along an axis and the axis disappears: axis=0 leaves one value per column, axis=1 one per row, keepdims keeps the ghost alive for broadcasting. cumsum is every total so far; argmax is WHERE not what (first tie wins, unravel the flat index); any and all are the yes/no folds; counting is summing the mask (int64); dtype= picks the accumulator, initial= seeds the fold.",
        },
      ],
      terms: [
        { term: "reduction (folding)", definition: "An operation that takes many values and returns fewer: sum, prod, min, max, mean, std, any, all. Reducing an axis removes it from the result's shape." },
        { term: "axis vs axis=None", definition: "axis=0 folds along the row direction (one value per column survives); axis=1 folds along columns (one per row survives); None folds everything into a scalar." },
        { term: "keepdims", definition: "Reduction flag that keeps each folded axis alive as a size-1 axis, so the result broadcasts against the original array — the per-row-divisor trick." },
        { term: "running (cumulative) aggregate", definition: "cumsum/cumprod: every prefix total or product instead of one final answer; same shape as the input, last element equals the plain reduction." },
        { term: "argmin / argmax", definition: "The INDEX of the first minimum/maximum — where the extreme lives. Flat without axis (unravel_index converts), per-row/column with one." },
        { term: "accumulator dtype", definition: "The type a reduction computes in. float32 data accumulated in float32 drifts over long arrays; dtype=np.float64 re-accumulates the same data exactly." },
      ],
      mistakes: [
        {
          mistake: "Reading a.sum(axis=0) as 'sum of each row'.",
          why: "axis=0 folds along the row direction, so the rows disappear and each COLUMN keeps one value. Backwards but plausible — and every number still looks reasonable, which is why it ships to production.",
          fix: "The mnemonic: axis is the direction that vanishes. Or use the labels: 'collapse the regions' (axis=0) versus 'collapse the quarters' (axis=1).",
        },
        {
          mistake: "Printing a.argmax() as if it were the maximum value.",
          why: "argmax returns a position (11 for the revenue grid), not a value (290). Reports announcing 'the peak was 11' are this bug with better formatting.",
          fix: "Look it up — a.flat[arg] or a[np.unravel_index(arg, a.shape)] — or call a.max() when only the value matters.",
        },
        {
          mistake: "Calling argmax on a mask that might be all False (no guard).",
          why: "An all-False mask argmaxes to 0 — 'found one at index 0', confidently false. It bites the cumsum first-crossing pattern whenever the threshold is never reached.",
          fix: "Guard with any(): if mask.any(): index = int(mask.argmax()). The guard costs one line and saves the lie.",
        },
        {
          mistake: "Trusting a float32 .sum() on a long array to the last digit.",
          why: "float32 carries ~7 significant digits; 100,000 additions of the same slightly-wrong 0.1 drift to 10000.001 — verified two blocks up. The error is small, silent and systematic.",
          fix: "Pass dtype=np.float64 for totals you will compare or publish, or store the data as float64 from the start.",
        },
      ],
      takeaways: [
        "Reducing an axis removes it: axis=0 on a (3, 4) grid gives shape (4,) — one value per column; axis=1 gives (3,) — one per row; None gives a scalar.",
        "keepdims=True leaves size-1 axes so results broadcast back: revenue / revenue.sum(axis=1, keepdims=True) computes each row's share in one line.",
        "cumsum gives every prefix total (the last one IS the sum); argmax gives WHERE, first tie only, and unravel_index turns its flat answer into [row, col].",
        "any and all are the yes/no reductions with axis; counting is (mask).sum() — and boolean sums accumulate as int64.",
        "float32 accumulation drifts (10000.001 for a hundred thousand 0.1s); dtype=np.float64 re-accumulates exactly; initial= seeds a fold and honestly defines max-of-nothing.",
      ],
      quiz: [
        {
          id: "f-04-q1",
          prompt: "revenue has shape (3, 4): 3 regions (rows), 4 quarters (columns). What does revenue.sum(axis=0) return?",
          options: [
            { text: "One total per region, shape (3,)", correct: false, feedback: "That is axis=1. Axis=0 folds along the row direction, so it is the regions that disappear, not the quarters." },
            { text: "One total per quarter, shape (4,) — the rows collapse", correct: true, feedback: "Correct: axis=0 folds along the rows, leaving one value per column — [650, 675, 670, 765] on this lesson's grid." },
            { text: "The grand total, a scalar", correct: false, feedback: "The grand total is axis=None (the default), which folds every axis away — here axis=0 explicitly keeps the quarter axis alive." },
            { text: "A (3, 1) column of row totals", correct: false, feedback: "That is revenue.sum(axis=1, keepdims=True) — axis=1 with the folded axis kept alive for broadcasting." },
          ],
          explanation: "The rule: the reduced axis is the one that disappears. axis=0 removes the row axis, so a (3, 4) grid becomes (4,) — one total per column.",
        },
        {
          id: "f-04-q2",
          prompt: "scores = np.array([70, 95, 88, 95]). What does scores.argmax() return, and why?",
          options: [
            { text: "95 — the maximum value", correct: false, feedback: "That is scores.max(). argmax answers WHERE, not what — an index into the array." },
            { text: "3 — the last occurrence of the maximum", correct: false, feedback: "argmax never returns the last tie; the scan stops at the first value that cannot be beaten." },
            { text: "1 — the index of the FIRST 95; ties resolve to the first occurrence", correct: true, feedback: "Correct: the first 95 at index 1 wins. For every tied winner you need np.flatnonzero(scores == scores.max()), which gives [1, 3]." },
            { text: "An error — the maximum is ambiguous with a tie", correct: false, feedback: "Not ambiguous at all: first occurrence is the deterministic rule. Silent, in fact — which is why you must know it." },
          ],
          explanation: "argmax returns the index of the first maximum; ties are resolved silently in favor of the earliest position.",
        },
        {
          id: "f-04-q3",
          prompt: "temps has 5 values, 2 of which exceed 20. Which call counts how many exceed 20, and what does the result's dtype prove?",
          options: [
            { text: "temps.sum() — the total of the readings", correct: false, feedback: "That adds the temperatures themselves (94.5 on this data), not the count of warm ones — a category error, not a counting call." },
            { text: "(temps > 20).any() — it returns True when any is over", correct: false, feedback: "any answers existence (one boolean), not quantity. Both 1 and 3 violations would print identically as True." },
            { text: "(temps > 20).sum() — the boolean mask sums as an int64 count, here 2", correct: true, feedback: "Correct: True is 1 and False is 0, the sum counts the Trues, and the accumulator is int64 — the proof printed in the counting block." },
            { text: "np.median(temps) — the middle value", correct: false, feedback: "A center statistic (Lesson f-03), unrelated to counting threshold crossings." },
          ],
          explanation: "Comparisons make boolean arrays; boolean arrays sum as int64 counts. np.count_nonzero(temps > 20) is the equivalent one-call spelling.",
        },
      ],
    },

    // ------------------------------------------------------------- f-05
    {
      slug: "f-05",
      title: "Counting and Binning",
      minutes: 15,
      summary:
        "The data-analysis finishers: value counts with unique, the integer hit-counter bincount (with weights for money per category), histogram edges and the closed last bin, digitize with its right= semantics, and a receipt analysis from raw categories to market shares.",
      kind: "concept",
      objectives: [
        "Count occurrences of every value with np.unique(return_counts=True) and np.bincount, and know when each fits",
        "Explain bincount's rules: non-negative integers only, bins 0..max, and minlength for a stable, aligned output",
        "Use bincount with weights= to total dollars, minutes or units per category, not just receipts per category",
        "Predict exactly which bin np.histogram puts any value in — including values on inner edges, the maximum, and out-of-range values",
        "Assign bin labels with np.digitize, predict what right=True changes on edge values, and chain the counting tools into a receipt analysis",
      ],
      why: "Counting is the last mile of almost every analysis: how many of each product sold, how much money landed in each bucket, how many requests were fast versus slow. NumPy has a dedicated tool for each flavor of the question, and each one has a rule that surprises first-time users: bincount refuses floats and negatives and pads zeros for values that never occurred; histogram's inner edges are half-open but its last bin is closed on both ends; digitize's right= flag silently moves every value that sits exactly on an edge. This lesson teaches the three tools on small deterministic datasets, proves each surprise with printed output, and finishes with the receipt-analysis run — category ids to bincount to weighted revenue to market-share percentages, every number verified.",
      blocks: [
        {
          kind: "text",
          text: "Lesson f-04 counted with boolean sums — `(a > limit).sum()` — which is perfect for threshold questions. This lesson is about *categorical* and *binned* counting: how many of each value, how much money per category, how many values in each range. Three functions cover the territory: `np.unique` (what values exist), `np.bincount` (how many of each small integer), and `np.histogram` / `np.digitize` (ranges and buckets).",
        },
        {
          kind: "heading",
          text: "The value-counts idiom: np.unique",
        },
        {
          kind: "code",
          title: "Which pages did visitors come from?",
          code: `import numpy as np

visits = np.array([2, 0, 2, 5, 2, 0, 7, 5, 2])

values, counts = np.unique(visits, return_counts=True)
print("values:", values)
print("counts:", counts)
print("busiest page id:", values[counts.argmax()], "with", counts.max(), "visits")
`,
          output: `values: [0 2 5 7]
counts: [2 4 2 1]
busiest page id: 2 with 4 visits`,
          outputNote: "The unique values print sorted [0, 2, 5, 7], each with its count [2, 4, 2, 1] — and the busiest page is id 2 with 4 visits, found by argmaxing the counts and looking the value up.",
          explain: [
            "`np.unique(x, return_counts=True)` returns a pair: the sorted distinct values, and how many times each occurred.",
            "Pages 1, 3, 4 and 6 got zero visits and simply do not appear — unique lists what exists, not what could have existed (bincount below fixes that).",
            "The pairing trick is the idiom: values[counts.argmax()] answers 'most common value' in one line (argmax from Lesson f-04 doing its WHERE job).",
          ],
        },
        {
          kind: "text",
          text: "`np.unique` does far more than counts — sorting, boolean-index inverses, whole-row uniqueness — and Part G gives it its full treatment. For counting, its one weakness matters: values that never occurred are invisible, which breaks any code that expects a slot for every category. That is exactly the hole `np.bincount` fills.",
        },
        {
          kind: "heading",
          text: "bincount: the hit counter for small integers",
        },
        {
          kind: "code",
          title: "Eight dice rolls, seven counters",
          code: `import numpy as np

dice = np.array([2, 5, 1, 5, 2, 6, 6, 2])

print(np.bincount(dice))               # bins for 0..6
print(np.bincount(dice, minlength=8))  # bins for 0..7 -- face 7 never rolled
`,
          output: `[0 1 3 0 0 2 2]
[0 1 3 0 0 2 2 0]`,
          outputNote: "The first call returns 7 counts (bins 0 through 6, the maximum face): face 0 never appears but has its slot. minlength=8 adds the empty slot for face 7.",
          explain: [
            "`np.bincount(x)` returns one count per integer from 0 to x.max() — including zeros for integers that never occurred. The dice output has a 0 in slot 0 and a 0 in slot 3: those faces exist, they just never came up.",
            "That is the difference from np.unique: bincount's output is *aligned* — count for value v lives at index v — so `np.bincount(dice)[5]` asks 'how many fives?' directly.",
            "`minlength` pads with zero-count bins when your category list runs past the data's maximum — the fix for the classic 'Tuesday had no sales so the array came back one short' bug.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Integers only, and none of them negative",
          text: "bincount accepts non-negative integers only. A float array raises TypeError: Cannot cast array data from dtype('float64') to dtype('int64') according to the rule 'safe', and a negative value raises ValueError: 'list' argument must have no negative elements. If your categories are strings or floats, map them to integer codes first (np.unique(cats, return_inverse=True) builds the codes), and let bincount do the counting.",
        },
        {
          kind: "text",
          text: "The signature move is `weights=`: instead of counting *receipts* per category, bincount sums a weight per occurrence — so dollars, minutes or units per category come out of the same call. Counting is just the special case where every weight is 1.",
        },
        {
          kind: "code",
          title: "From receipts to revenue in one call",
          code: `import numpy as np

cat = np.array([0, 1, 2, 1, 0, 2, 2])            # category id per receipt
dollars = np.array([12.50, 30.00, 7.25, 18.75, 9.60, 5.40, 22.10])

print("receipts per category:", np.bincount(cat))
print("dollars per category :", np.round(np.bincount(cat, weights=dollars), 2))
`,
          output: `receipts per category: [2 2 3]
dollars per category : [22.1  48.75 34.75]`,
          outputNote: "Category 0 took 2 receipts worth 22.10 dollars (12.50 + 9.60), category 1 took 2 worth 48.75, category 2 took 3 worth 34.75 (7.25 + 5.40 + 22.10).",
          explain: [
            "Without weights, bincount counts occurrences: [2, 2, 3].",
            "With weights, it sums the dollars whose category lands in each bin: the money followed its receipts.",
            "The weighted result is float64 — weights bring the money's dtype with them, and rounding to 2 decimals keeps the display honest.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.bincount",
          purpose: "Count occurrences of each non-negative integer — one aligned slot per value from 0 to max, optionally summing a weight per occurrence.",
          signature: "np.bincount(x, /, weights=None, minlength=0)",
          purposeDetail:
            "np.bincount is the fastest hit-counter in the box: one pass over the input, one count per integer value, result index i holds the count of value i. That alignment is its superpower and its constraint. Superpower: count arrays from different groups, days or runs are the same length (with minlength) and can be added, compared and divided directly. Constraint: the keys must be non-negative integers — floats and negatives raise, so string or float categories need np.unique(..., return_inverse=True) to build integer codes first. weights= turns the counter into a per-category summation: dollars per category, minutes per machine, points per player.",
          params: [
            {
              name: "x",
              type: "array_like of non-negative ints",
              required: true,
              description: "The integer values to count, or the category ids to group by. Must be safely castable to int64 with no negative elements — floats like 1.5 raise a TypeError, and -1 raises a ValueError.",
              example: "np.array([2, 5, 1, 5, 2, 6, 6, 2])",
            },
            {
              name: "weights",
              type: "array_like or None",
              description: "One weight per element of x. With weights, each occurrence adds its weight instead of 1, so the result is a per-bin SUM (float64 when the weights are floats) rather than a count.",
              example: "weights=dollars",
            },
            {
              name: "minlength",
              type: "int",
              description: "Pad the output to at least this many bins (with zeros) even when the maximum value is smaller — the fix for missing zero-count categories at the top of the range.",
              example: "minlength=8",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A 1-D int64 array of length max(x) + 1 (or minlength, whichever is larger): index i holds the count of value i, or the sum of weights where value i occurred. An empty input returns zeros of length minlength.",
          },
          example: `import numpy as np

results = np.array([3, 1, 0, 3, 3, 1, 2, 3])

print(np.bincount(results))                # bins 0..3
print(np.bincount(results, minlength=5))   # pad for a never-seen 4th slot

# weighted: minutes of machine time per operator id
op = np.array([0, 1, 1, 2, 1])
minutes = np.array([30, 45, 15, 60, 30])
print(np.bincount(op, weights=minutes))
`,
          exampleOutput: `[1 2 1 4]
[1 2 1 4 0]
[30. 90. 60.]`,
          commonMistakes: [
            {
              mistake: "Calling bincount on float data (grades, prices, ratings like 3.5).",
              why: "bincount needs integers — it uses the values as array indices, and there is no slot 3.5. NumPy raises TypeError: Cannot cast array data from dtype('float64') to dtype('int64') according to the rule 'safe' rather than guessing whether 3.5 means 3 or 4.",
              fix: "Bin the floats first (np.digitize or np.histogram, below) or map categories to codes with np.unique(cats, return_inverse=True).",
            },
            {
              mistake: "Assuming the output length is the number of distinct values.",
              why: "The length is max(x) + 1 — every integer below the maximum gets a slot, including all the zeros. np.unique gives one entry per distinct value; bincount gives one per possible value.",
              fix: "Think of the result as an array indexed by value, not a list of findings. Distinct values only? That is np.unique.",
            },
            {
              mistake: "Forgetting minlength when different groups have different maxima.",
              why: "A bincount of Monday's sales (max category 3) has length 4, and Tuesday's (max category 2) has length 3 — adding them raises a shape error, or worse, misaligns if you stitch them by hand.",
              fix: "Always pass minlength=your_category_count so every day's counts land in the same-shaped, same-aligned array.",
            },
          ],
          related: [
            { name: "np.unique(return_counts=True)", relation: "Value counts that list only what occurred, sorted, in one call — no alignment, no padding." },
            { name: "np.histogram", relation: "The range-bucket generalization: bins are arbitrary numeric ranges, not one slot per integer." },
            { name: "np.digitize", relation: "The labeler: which range-bucket each value belongs in, when you need the assignment per value rather than the totals." },
            { name: "np.add.at", relation: "Scatter-add with duplicate indices — the general tool bincount optimizes for the counting case." },
          ],
          applications: [
            "Receipt and transaction analysis: receipts per category, then dollars per category with weights, then market share (the run below)",
            "Histograms of small integers: dice, ratings, star reviews, defect codes — one call, aligned slots",
            "Dashboards across groups: per-day counts forced to the same shape with minlength, then stacked or compared",
          ],
          notes:
            "np.bincount is dramatically faster than a Python counting loop or collections.Counter for large arrays of small integers — it is a single memory pass with direct indexing rather than per-element hashing.",
        },
        {
          kind: "heading",
          text: "histogram: edges are boundaries",
        },
        {
          kind: "text",
          text: "When values are continuous (or simply huge), one slot per integer will not do: you need *ranges*. `np.histogram(a, bins=edges)` chops `[edges[0], edges[-1]]` into bins and counts the values in each. The rule to memorize: **every bin except the last is half-open** `[lo, hi)` — a value on an inner edge belongs to the bin that STARTS at that edge, because every bin owns its left edge — **and the last bin is closed** `[lo, hi]`, so the maximum value is always counted.",
        },
        {
          kind: "code",
          title: "Grade buckets, with the edge experiment",
          code: `import numpy as np

scores = np.array([23, 45, 52, 57, 61, 65, 68, 72, 78, 84, 91])

counts, edges = np.histogram(scores, bins=[0, 60, 70, 80, 90, 100])
print("edges :", edges)
print("counts:", counts)
print("the max,", scores.max(), "is in bin", int(np.digitize(scores.max(), edges)) - 1)

# the edge experiment: 90.0 versus 89.9
c90, _ = np.histogram(np.array([90.0]), bins=[0, 60, 70, 80, 90, 100])
c899, _ = np.histogram(np.array([89.9]), bins=[0, 60, 70, 80, 90, 100])
print("90.0 lands in bin:", int(np.argmax(c90)))    # 90 OWNS the left edge of [90, 100]
print("89.9 lands in bin:", int(np.argmax(c899)))   # the fourth:  [80, 90) is half-open

# out-of-range values are silently NOT counted
c_out, _ = np.histogram(np.array([105.0]), bins=[0, 60, 70, 80, 90, 100])
print("a 105 was counted?", c_out.sum() == 1)
`,
          output: `edges : [  0  60  70  80  90 100]
counts: [4 3 2 1 1]
the max, 91 is in bin 4
90.0 lands in bin: 4
89.9 lands in bin: 3
a 105 was counted? False`,
          outputNote: "Counts [4, 3, 2, 1, 1]: four scores under 60, three in the 60s, two in the 70s, one in the 80s, and the 91 in the closed last bin. A score of exactly 90 joins it; 89.9 stays in [80, 90); and 105 falls off the end, uncounted.",
          explain: [
            "The bins are [0, 60), [60, 70), [70, 80), [80, 90) and [90, 100] — four half-open ranges plus one closed bookend.",
            "The maximum 91 lands in bin 4 (the last): the closing bracket on the final bin guarantees the maximum is always counted.",
            "The 90.0-versus-89.9 experiment pins the boundary rule: every bin owns its left edge — 90.0 joins [90, 100] because that bin starts at 90 — and only the last bin is additionally closed on the right, which is why the maximum is always counted.",
            "`np.digitize` reproduces histogram's placement for in-range values: bin index = digitize(v, edges) - 1, the pairing that makes the next section click.",
            "Out-of-range values (105, or -5) are dropped from the counts entirely — histogram reports them not at all, which is why counts.sum() can come back smaller than your array size.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "counts versus density",
          text: "np.histogram has a density=True mode that returns the bin areas (count / (width * total)) instead of the counts, so the bars integrate to 1 — the right choice when comparing distributions with different sample sizes or bin widths. The trap: with unequal bin widths, density and counts tell different stories, and plotting a density result while labeling the y-axis 'count' is a classic mislabeled chart. Default False (counts) is what you want unless you specifically need a probability density.",
        },
        {
          kind: "functionDoc",
          name: "np.histogram",
          purpose: "Count how many values fall in each of a set of numeric ranges, returning the counts and the bin edges.",
          signature: "np.histogram(a, bins=10, range=None, density=None, weights=None)",
          purposeDetail:
            "np.histogram is the density of data made concrete: define edges, get counts per range. It accepts edges three ways — an int (that many equal-width bins spanning the min-max), a monotonically increasing edges array (your own cut points: grade boundaries, salary bands), or with range= a fixed span for auto bins. The two rules that surprise everyone: inner bins are half-open [lo, hi) so edge values go LEFT, while the final bin is closed [lo, hi] so the maximum is always counted; and values outside the edges are silently dropped from the counts. Paired with np.digitize (which reports each value's bin index) and matplotlib's plt.hist (which draws them), histogram is the center of distribution work.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to bin. Any numeric dtype; NaN and out-of-range values are excluded from every count.",
              example: "np.array([23, 45, 52, 57, 61])",
            },
            {
              name: "bins",
              type: "int or sequence of scalars",
              description: "An int: that many equal-width bins over [a.min(), a.max()] (or the range= span). A sequence: the exact edges, monotonically increasing, e.g. [0, 60, 70, 80, 90, 100] — n edges define n-1 bins.",
              example: "[0, 60, 70, 80, 90, 100]",
            },
            {
              name: "range",
              type: "(float, float) or None",
              description: "The span for int bins: (lo, hi) instead of the data's min-max. Values outside are not counted — the same silent-drop rule as out-of-range edges.",
              example: "range=(0, 100)",
            },
            {
              name: "weights",
              type: "array_like or None",
              description: "One weight per value of a: each occurrence adds its weight to its bin instead of 1 — dollars per latency bucket, not requests per bucket.",
              example: "weights=dollars",
            },
            {
              name: "density",
              type: "bool or None",
              description: "False/None (default): raw counts. True: the counts normalized so that the integral over the range is 1 — for comparing distribution shapes, especially with unequal bin widths.",
              example: "density=False",
            },
          ],
          returns: {
            type: "tuple of 2 ndarrays",
            description: "(counts, edges): counts has length len(bins) - 1 (or bins, when bins is an int); edges has one more element than counts. The last bin includes its right edge; every other bin is half-open on the right.",
          },
          example: `import numpy as np

latency = np.array([42, 88, 51, 60, 47, 210, 55, 49, 58, 52])  # ms

counts, edges = np.histogram(latency, bins=[0, 50, 100, 150, 200, 250])
print("counts:", counts)
print("edges :", edges)
print("total :", counts.sum(), "== latency.size:", latency.size)
`,
          exampleOutput: `counts: [3 6 0 0 1]
edges : [  0  50 100 150 200 250]
total : 10 == latency.size: 10`,
          commonMistakes: [
            {
              mistake: "Expecting a value that equals an inner edge to land in the bin to its right.",
              why: "Bins are [lo, hi) — a 70 with edges [60, 70, 80] belongs to [60, 70), not [70, 80). Only the LAST bin is closed on the right, which is why the maximum never disappears.",
              fix: "Say the brackets out loud when you design edges: half-open, half-open, ..., closed. If an edge value must belong to the right bin, shift the edges by half a step or use digitize with right=True to relabel.",
            },
            {
              mistake: "Not noticing that out-of-range values are dropped from the counts.",
              why: "A 105 with edges ending at 100 contributes to no bin — counts.sum() comes back less than a.size, and a percentage-per-bin calculation built on the wrong denominator quietly misprices every share.",
              fix: "Check first: assert counts.sum() == a.size, or clip the data into range (Lesson f-02's clip) and count the clipped values separately.",
            },
            {
              mistake: "Passing bins=10 expecting ten specific ranges.",
              why: "bins=10 means ten EQUAL-WIDTH bins spanning the data's min to max — the cut points move with the data, so two datasets get different boundaries and the histograms are not comparable.",
              fix: "Pass explicit edges when the buckets must mean something (letter grades, salary bands, SLO tiers): bins=[0, 60, 70, 80, 90, 100].",
            },
          ],
          related: [
            { name: "np.digitize", relation: "The per-value companion: which bin each value lands in, as indices — histogram then just counts those indices." },
            { name: "np.bincount", relation: "The integer special case: one aligned slot per value 0..max, faster and simpler when values are small non-negative ints." },
            { name: "np.histogram2d / histogramdd", relation: "The 2-D and N-D generalizations: cross-tabulate two or more variables' buckets." },
            { name: "plt.hist (matplotlib)", relation: "The drawing of the same computation — plt.hist calls np.histogram when given the same edges." },
          ],
          applications: [
            "Latency SLOs: count requests per response-time bucket and alert on the slow bins",
            "Salary and price bands: how many employees per pay grade, products per price tier",
            "Data exploration: the first look at any numeric column's shape — spikes, gaps, skew, outliers",
          ],
          notes:
            "With bins as an int, the edges are computed from the data, so the SAME cut on different datasets produces different boundaries — pass explicit edges whenever the buckets are meaningful. Weights make histogram a per-range revenue report in one call.",
        },
        {
          kind: "heading",
          text: "digitize: which bin does each value fall into",
        },
        {
          kind: "text",
          text: "`np.histogram` gives you the totals; `np.digitize` gives you the *assignment* — for every value, the index of the bin it belongs to. It is the tool for labeling: turn a score into a letter grade, a latency into a tier name, an age into a band. The one parameter that changes everything is `right=`: it decides where a value that sits exactly ON an edge goes.",
        },
        {
          kind: "code",
          title: "Letter grades, both edge conventions",
          code: `import numpy as np

# letter grades: F below 60, D below 70, C below 80, B below 90, A from 90
scores = np.array([42, 55, 63, 70, 74, 81, 90, 96])
edges = np.array([60, 70, 80, 90])

labels = "FDCBA"
idx_default = np.digitize(scores, edges)              # right=False (default)
idx_right = np.digitize(scores, edges, right=True)

print("right=False:", idx_default, [labels[i] for i in idx_default])
print("right=True  :", idx_right,     [labels[i] for i in idx_right])
`,
          output: `right=False: [0 0 1 2 2 3 4 4] ['F', 'F', 'D', 'C', 'C', 'B', 'A', 'A']
right=True  : [0 0 1 1 2 3 3 4] ['F', 'F', 'D', 'D', 'C', 'B', 'B', 'A']`,
          outputNote: "The two conventions disagree exactly on the edge values 70 and 90: right=False puts 70 in the 70s bin (a C) and 90 in the A bin; right=True puts 70 in the 60s bin (a D) and 90 in the B bin. The other six scores land identically.",
          explain: [
            "`np.digitize(x, edges)` returns, for each value, the number of edges it is greater than or equal to — 0 means below every edge (an F), 4 means at or above the last (an A).",
            "right=False matches histogram's inner-edge behavior (edge values go right); right=True flips edge values left — the histogram-incompatible convention, but exactly what 'below 70 means D' grading wants if 70 itself is a C... or a D: the point is you must choose deliberately.",
            "Wait — read the verified output carefully: with right=False, 70 lands in bin 2 (the C bin, [70, 80)) — edge values go to the RIGHT bin. With right=True, 70 lands in bin 1 (the D bin). Pick the one your spec means, and test one edge value whenever the choice matters.",
            "The labels list-indexing trick ([labels[i] for i in idx]) turns bin indices straight into human-readable names.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.digitize",
          purpose: "Return the index of the bin each value falls into, given a monotonic set of bin edges.",
          signature: "np.digitize(x, bins, right=False)",
          purposeDetail:
            "np.digitize is the per-value cousin of np.histogram: instead of counting the members of each bin, it labels every value with its bin index. The returned indices run from 0 (below every edge) to len(bins) (at or above the last edge) — len(bins) + 1 possible answers for len(bins) edges. The right= flag is the entire edge-semantics story: right=False (default, matching histogram's inner bins) puts a value equal to an edge into the bin on its RIGHT, right=True puts it LEFT. Wherever values can land exactly on cut points — integer thresholds especially — test one and print it.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The values to assign to bins. Any numeric dtype; out-of-range values simply get index 0 or len(bins) rather than raising.",
              example: "np.array([42, 55, 63, 70])",
            },
            {
              name: "bins",
              type: "1-D array_like",
              required: true,
              description: "The edges, which MUST be monotonically increasing (or decreasing, with a warning-free single reversal handled — but prefer increasing). Edges are boundaries, not bin centers.",
              example: "np.array([60, 70, 80, 90])",
            },
            {
              name: "right",
              type: "bool",
              description: "Edge convention. False (default): bins are [..., e), [e, ...) — a value ON an edge goes RIGHT, matching np.histogram's inner bins. True: bins are (..., e], (e, ...] — an edge value goes LEFT.",
              example: "right=True",
            },
          ],
          returns: {
            type: "ndarray of int",
            description: "An array of bin indices with x's shape: 0 for values below every edge, len(bins) for values at or above the last edge.",
          },
          example: `import numpy as np

scores = np.array([58, 63, 70, 77, 84, 90, 95])
edges = np.array([60, 70, 80, 90])

default = np.digitize(scores, edges)
to_left = np.digitize(scores, edges, right=True)
print("right=False:", default)
print("right=True  :", to_left)

# histogram agreement: with the FULL edge list, bin index = digitize(v, full) - 1
full = np.array([0, 60, 70, 80, 90, 100])
counts, _ = np.histogram(scores, bins=full)
recount = np.bincount(np.digitize(scores, full) - 1, minlength=5)
print("histogram counts:", counts)
print("digitize recount :", recount)
`,
          exampleOutput: `right=False: [0 1 2 2 3 4 4]
right=True  : [0 1 1 2 3 3 4]
histogram counts: [1 1 2 1 2]
digitize recount : [1 1 2 1 2]`,
          commonMistakes: [
            {
              mistake: "Assuming right=True is the default because it sounds like the natural reading.",
              why: "The default is right=False — edge values go to the RIGHT bin — chosen to match np.histogram's inner-bin placement. A spec that says '70 and above is a C' and code that silently puts 70 in the D bin disagree at exactly one value per edge.",
              fix: "Write the convention into the call and test one edge value: print(np.digitize(np.array([70]), np.array([60, 70, 80]))) — 2, meaning [70, 80).",
            },
            {
              mistake: "Passing unsorted or descending edges and trusting the result.",
              why: "digitize binary-searches the edges; non-monotonic edges produce indices that do not correspond to any sensible bins (or a ValueError for badly-shaped input).",
              fix: "Sort first: np.digitize(x, np.sort(edges)) — or build edges with np.linspace / np.arange, which come out sorted by construction.",
            },
            {
              mistake: "Forgetting that index 0 and index len(bins) exist.",
              why: "The indices run 0..len(bins), so a value below every edge returns 0 and one at/above the top edge returns len(bins) — using the result directly to index a list of len(bins) label strings raises IndexError for the extremes.",
              fix: "Pad the labels: 'F' + grades for the low end, or clip with np.clip(idx, 0, len(labels) - 1) once you know what the extremes should mean.",
            },
          ],
          related: [
            { name: "np.histogram", relation: "The totals view of the same assignment: counts per bin instead of a bin index per value." },
            { name: "np.searchsorted", relation: "The primitive underneath: where would each value be inserted to keep the edges sorted — digitize is its labeled front end." },
            { name: "np.bincount", relation: "Count the digitize output to reproduce histogram's counts (the recount proof in the example)." },
            { name: "np.select / np.where", relation: "Hand-rolled bucketing with boolean conditions — clearer for 2-3 overlapping rules, clumsier for many ordered ranges." },
          ],
          applications: [
            "Scoring and grading: numeric score to letter grade or tier label in one call",
            "Flagging: which latency tier each request belongs to, for per-tier reporting afterward",
            "Binning continuous features before a count-based analysis: age to age band, price to price range",
          ],
        },
        {
          kind: "heading",
          text: "The receipt analysis run",
        },
        {
          kind: "text",
          text: "Everything in this lesson chains into one analysis pattern you will reuse forever: **category ids to bincount, weights for the money, then shares**. Here is the full run on one day of receipts for a small shop with four categories — food (0), tools (1), books (2), toys (3).",
        },
        {
          kind: "code",
          title: "From raw receipts to market shares",
          code: `import numpy as np

# ten receipts: category id and dollars spent
cat = np.array([0, 1, 2, 3, 0, 1, 2, 2, 3, 0])
dollars = np.array([32.50, 45.00, 12.75, 19.99, 8.40, 67.25, 15.50, 23.00, 9.75, 41.10])

n_receipts = np.bincount(cat, minlength=4)               # receipts per category
revenue = np.bincount(cat, weights=dollars, minlength=4) # dollars per category

share = np.round(100.0 * revenue / revenue.sum(), 1)

print("receipts per category:", n_receipts)
print("revenue per category :", np.round(revenue, 2))
print("market share (%)     :", share)
print("total revenue        :", round(float(revenue.sum()), 2))
print("best category        :", int(share.argmax()), "at", share.max(), "percent")
`,
          output: `receipts per category: [3 2 3 2]
revenue per category : [ 82.   112.25  51.25  29.74]
market share (%)     : [29.8 40.8 18.6 10.8]
total revenue        : 275.24
best category        : 1 at 40.8 percent`,
          outputNote: "Food took 3 receipts for 82.00 dollars, tools 2 for 112.25, books 3 for 51.25, toys 2 for 29.74 — a 275.24-dollar day where tools earned 40.8 percent of the money on only 2 of the 10 receipts.",
          explain: [
            "One bincount counts the receipts; the same call with weights= totals the dollars — two aligned 4-slot arrays, no loop, no dictionary.",
            "The shares are revenue divided by revenue.sum() — Lesson f-04's reduction giving the denominator in one call.",
            "`share.argmax()` names the top category; note it is the top by SHARE, not by receipts (books and food tied at 3 receipts each but earned very differently).",
            "minlength=4 keeps the arrays aligned even if a category sells nothing tomorrow — the resilience rule from the bincount card.",
          ],
        },
        {
          kind: "heading",
          text: "A weekend grid, folded per category",
        },
        {
          kind: "text",
          text: "The same pattern goes 2-D the moment you track categories across days: a receipts-by-day grid folds per category with `axis=0` (Lesson f-04's axis rule, doing revenue work). Here is the weekend version — a (3 days, 4 categories) grid of dollar totals.",
        },
        {
          kind: "code",
          title: "Per-category and per-day revenue from the grid",
          code: `import numpy as np

weekend = np.array([
    [41.00, 45.00, 28.25,  0.00],   # Friday:  food, tools, books, toys
    [24.50,  0.00, 15.50,  9.75],   # Saturday
    [16.00, 67.25,  0.00, 19.99],   # Sunday
])

print("per category (axis=0):", np.round(weekend.sum(axis=0), 2))
print("per day     (axis=1):", np.round(weekend.sum(axis=1), 2))
print("weekend total        :", round(float(weekend.sum()), 2))
`,
          output: `per category (axis=0): [ 81.5  112.25  43.75  29.74]
per day     (axis=1): [114.25  49.75 103.24]
weekend total        : 267.24`,
          outputNote: "Tools earned 112.25 across the weekend (45.00 + 0.00 + 67.25), food 81.50, books 43.75, toys 29.74. Friday was the biggest day at 114.25; the weekend total is 267.24.",
          explain: [
            "`axis=0` collapses the days — one revenue figure per category, the column of the receipt run reproduced by folding.",
            "`axis=1` collapses the categories — one revenue figure per day, the daily takings.",
            "The zeros are honest empty cells (no tool receipts on Saturday, no book receipts on Sunday) — exactly the gaps np.unique would have hidden and the grid keeps visible.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Fold the weekend grid per category",
          mode: "axis",
          name: "weekend",
          ops: ["sum"],
          data: [
            [41.0, 45.0, 28.25, 0.0],
            [24.5, 0.0, 15.5, 9.75],
            [16.0, 67.25, 0.0, 19.99],
          ],
          labels: {
            rows: ["Fri", "Sat", "Sun"],
            cols: ["Food", "Tools", "Books", "Toys"],
          },
          caption:
            "The weekend receipts grid in the axis lab. Choose axis=0 and the three days fold into one total per category — 81.50 for Food, 112.25 for Tools, 43.75 for Books, 29.74 for Toys, exactly the numbers printed above. Choose axis=1 and the categories fold into one total per day. The empty cells (Sat Tools, Sun Books) are the zero-receipt days bincount's minlength keeps honest — click around and find them.",
        },
        {
          kind: "table",
          title: "The three counting tools compared",
          headers: ["Function", "Input values", "What the bins are", "What you get back"],
          rows: [
            ["np.unique(return_counts=True)", "any values", "only the values that occurred", "sorted values + counts (unaligned, unpadded)"],
            ["np.bincount", "non-negative ints", "one slot per integer 0..max (or minlength-1)", "aligned count array (or per-bin weight sums)"],
            ["np.histogram", "any numbers + edges", "your ranges, or bins= equal widths", "counts per range + the edges used"],
            ["np.digitize", "any numbers + edges", "your ranges", "the bin index of EACH value"],
          ],
          caption:
            "Counting receipts per category is bincount; totals per price range is histogram; labeling each row with its bucket is digitize; 'what values exist at all' is unique.",
        },
        {
          kind: "tryIt",
          title: "Star ratings, counted and averaged",
          task:
            "Run it, then: (1) add a 1-star rating to the array and find the new counts; (2) change minlength to 4 and watch the weighted average crash with a shape error — then explain why the weights must match the data length here; (3) recompute the average after appending a 1 to ratings (arange must cover 0..1 now); (4) relabel the band edges to [50, 60, 70] and predict the new band indexes before running.",
          code: `import numpy as np

ratings = np.array([3, 4, 5, 3, 4, 4, 5, 2, 3, 4, 5, 5, 3, 4])

print("counts per star:", np.bincount(ratings))
print("average rating :", np.round(np.average(
    np.arange(0, 6), weights=np.bincount(ratings)), 2))

scores = np.array([55, 60, 65, 70, 75, 80])
bands = np.array([60, 70, 80])
print("band index:", np.digitize(scores, bands))
`,
          hint:
            "For step 2: np.bincount(ratings) has length max(ratings) + 1 = 6, and np.average demands weights shaped like np.arange(0, 6). minlength can only pad LONGER, never shorter — with minlength=4 the weights array is length 4 against data length 6.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "unique lists what occurred; bincount gives one aligned slot per integer 0..max (minlength pads, weights carry money); histogram's inner bins are half-open but the last is closed — so the max is always counted and out-of-range values are dropped; digitize labels each value with its bin, and right= decides where edge values go.",
        },
      ],
      terms: [
        { term: "value counts", definition: "The how-many-of-each summary: np.unique(x, return_counts=True) for occurred values only, np.bincount for every integer 0..max with aligned slots." },
        { term: "aligned counts", definition: "bincount's guarantee: the count of value v lives at index v of the result, so counts arrays from different groups have the same meaning at the same positions (with minlength pinning the length)." },
        { term: "bin edges", definition: "The boundary values that define ranges. n edges define n-1 bins; np.histogram's inner bins are half-open [lo, hi) while the final bin is closed [lo, hi], so the maximum is always counted." },
        { term: "half-open interval", definition: "A range [lo, hi) that includes its left endpoint but not its right — the convention behind histogram's inner bins, Python slices, and range()." },
        { term: "right= convention (digitize)", definition: "The flag that decides where values exactly ON an edge go: right=False (default, histogram-compatible) sends them to the right bin; right=True sends them left." },
      ],
      mistakes: [
        {
          mistake: "Calling np.bincount on floats or negative integers.",
          why: "bincount uses values as array indices, so it demands non-negative integers: floats raise TypeError (cannot cast float64 to int64 safely) and negatives raise ValueError (no negative elements). It refuses to guess which slot 3.5 or -1 means.",
          fix: "Bin floats with np.digitize or np.histogram first, or build integer codes from arbitrary categories with np.unique(cats, return_inverse=True) and count those.",
        },
        {
          mistake: "Expecting a value on an inner histogram edge to land in the left-hand bin.",
          why: "Inner bins are half-open [lo, hi): the closing bracket hands the edge value to the NEXT bin — a 70 with edges [60, 70, 80] belongs to [70, 80), not [60, 70), because every bin owns its left edge. Only the LAST bin is additionally closed on the right, so the maximum is always counted. Verified above: 90.0 lands in bin 4 because bin 4 starts at 90; 89.9 stays in bin 3.",
          fix: "Read bins as bracket pairs: [lo, hi) for all but the last, [lo, hi] for the last. When an edge value must go LEFT instead, use digitize(right=True) or shift edges by half a step.",
        },
        {
          mistake: "Not checking that histogram counts sum to the array size.",
          why: "Out-of-range values are silently dropped — counts.sum() can be less than a.size, and every percentage computed from the wrong denominator inherits the error. A single 105 among hundreds of scores is invisible in the output.",
          fix: "One-line guard: assert counts.sum() == a.size, or clip outliers into range first and count the clipped ones separately (np.count_nonzero(a > hi)).",
        },
        {
          mistake: "Using digitize's default edge convention for a spec that says 'x and above'.",
          why: "right=False (the default) matches histogram, not human threshold language: np.digitize(70, [60, 70, 80]) returns 2 — the [70, 80) bin — while a spec reading 'below 70 is a D' wanted 70 in the C bin only if 70 counts as at-or-above 70... the conventions collide exactly on edge values.",
          fix: "Test one edge value and print it whenever the boundary matters: np.digitize(np.array([70]), edges) settles the convention in one run.",
        },
      ],
      takeaways: [
        "np.unique(x, return_counts=True) lists what occurred; np.bincount gives one aligned slot per integer 0..max — zeros included — and minlength keeps different groups the same shape.",
        "bincount with weights= turns counting into per-category totals: dollars, minutes or units per category in the same aligned layout.",
        "histogram bins are [lo, hi) for all but the last, which is [lo, hi]: every bin owns its left edge (inner-edge values join the bin that starts there), the maximum is always counted, and out-of-range values are silently dropped.",
        "digitize labels each value with its bin index (0..len(edges)); right=False matches histogram, right=True flips edge values left — test one edge value when the boundary matters.",
        "The receipt-analysis pattern: bincount for counts, bincount(weights=) for money, divide by the total for shares, argmax for the winner — no loops, no dictionaries, all verified above.",
      ],
      quiz: [
        {
          id: "f-05-q1",
          prompt: "np.bincount(np.array([2, 5, 1, 5, 2, 6, 6, 2])) returns an array of what length?",
          options: [
            { text: "8 — the number of rolls", correct: false, feedback: "The output is not per-observation; it is per possible value. Eight rolls of values up to 6 need only 7 slots." },
            { text: "6 — the maximum value rolled", correct: false, feedback: "Close: the slots run 0 THROUGH the maximum, which needs max + 1 = 7 slots — value 0 has a slot even though it was never rolled." },
            { text: "7 — one slot for every integer from 0 to 6 (the maximum)", correct: true, feedback: "Correct: bins 0..6 inclusive, so length 7. The counts are [0, 1, 3, 0, 0, 2, 2] — face 0 and faces 3-4 have zero-slots, which np.unique would have hidden." },
            { text: "4 — the number of distinct values (1, 2, 5, 6)", correct: false, feedback: "That is np.unique's output length. bincount pads every integer below the maximum, including the ones that never occurred." },
          ],
          explanation: "bincount's result is an array indexed by value: length max(x) + 1, zeros for integers that never occurred, alignable across groups with minlength.",
        },
        {
          id: "f-05-q2",
          prompt: "counts, edges = np.histogram(scores, bins=[0, 60, 70, 80, 90, 100]). A value of exactly 90 lands in which bin, and why?",
          options: [
            { text: "The [80, 90) bin — edge values always go left", correct: false, feedback: "Edge values do not go left: every bin owns its LEFT edge, so 90 belongs to the bin that starts at 90 — the closed last bin [90, 100]." },
            { text: "The last bin [90, 100] — only the final bin includes its right endpoint, and 90 is its left endpoint", correct: true, feedback: "Correct: bins are [0,60), [60,70), [70,80), [80,90) and [90,100]. The value 90 starts the last bin, which is closed — verified above with the 90.0-versus-89.9 experiment." },
            { text: "It is an error — a value cannot sit on two bins' boundary", correct: false, feedback: "No ambiguity and no error: the half-open-until-last rule assigns every in-range value to exactly one bin, deterministically." },
            { text: "It is not counted at all — boundary values are dropped", correct: false, feedback: "Only OUT-OF-RANGE values are dropped (the 105 in the experiment). A value of 90 is inside [0, 100] and lands in the closed last bin." },
          ],
          explanation: "All bins but the last are [lo, hi); the last is [lo, hi]. That is why the maximum value never falls out of its own histogram.",
        },
        {
          id: "f-05-q3",
          prompt: "What does np.digitize(np.array([70]), np.array([60, 70, 80])) return with the default right=False, and what would right=True change?",
          options: [
            { text: "2 by default (70 belongs to [70, 80)); right=True returns 1 (70 belongs to (60, 70])", correct: true, feedback: "Correct: right=False matches histogram's inner bins (edge values go right); right=True flips edge values into the left bin. The two conventions disagree exactly on values that sit on an edge." },
            { text: "1 by default (70 belongs to the 60s); right=True returns 2", correct: false, feedback: "Both halves are swapped: the default is right=False — edge values go to the RIGHT bin — as the lesson's grade example verified for 70." },
            { text: "It raises for a value exactly on an edge, and right=True resolves the ambiguity", correct: false, feedback: "Nothing raises: the assignment is deterministic in both conventions, which is exactly why you must know which one you are using." },
            { text: "0 in both cases — 70 is below the first edge", correct: false, feedback: "70 is not below 60; index 0 is reserved for values below every edge." },
          ],
          explanation: "digitize's right= flag decides edge-value placement: False (default) agrees with histogram; True moves edge values left. Test one edge value whenever the boundary carries meaning.",
        },
      ],
    },
  ],
  // ------------------------------------------------------------------
  // Part F exercises (12: 4 beginner, 4 intermediate, 4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "f-b1",
      tier: "beginner",
      title: "Celsius to Fahrenheit, all at once",
      prompt:
        "Convert the five Celsius readings [21.0, 18.5, 25.0, 19.5, 23.0] to Fahrenheit with ONE array expression: `celsius * 9 / 5 + 32`. Print the Celsius array, the Fahrenheit array, and the result's dtype — three lines. The conversion pairs elementwise (21.0 becomes 69.8 and 25.0 becomes 77.0, which prints as 77.), and the dtype prints float64.",
      hint: "One expression, no loop: fahrenheit = celsius * 9 / 5 + 32. The * and / hit every element; the + 32 stretches across the array as scalar broadcasting.",
      starter: `import numpy as np

celsius = np.array([21.0, 18.5, 25.0, 19.5, 23.0])

# TODO: build fahrenheit = celsius * 9 / 5 + 32 in ONE line, then print
# celsius, fahrenheit and fahrenheit.dtype (three lines)
`,
      solution: `import numpy as np

celsius = np.array([21.0, 18.5, 25.0, 19.5, 23.0])
fahrenheit = celsius * 9 / 5 + 32
print(celsius)
print(fahrenheit)
print(fahrenheit.dtype)
`,
      expectedOutput: `[21.  18.5 25.  19.5 23. ]
[69.8 65.3 77.  67.1 73.4]
float64`,
      concepts: ["elementwise arithmetic", "scalar broadcasting", "dtype promotion"],
    },
    {
      id: "f-b2",
      tier: "beginner",
      title: "Clamp the noisy sensor",
      prompt:
        "A thermistor drifted outside its valid band: readings = [21.617, 19.213, 25.888, 17.444, 22.501, 18.325]. Clean them in two steps: fence every value into the valid band [18.0, 22.0] with np.clip, then round to 1 decimal for display. Print only the cleaned array. Expected: values above 22.0 become 22.0, the value below 18.0 becomes 18.0, in-range values just round — the printed array reads [21.6 19.2 22. 18. 22. 18.3].",
      hint: "np.clip(readings, 18.0, 22.0) fences both ends at once; np.round(clipped, 1) formats for display. You can nest them or use two lines.",
      starter: `import numpy as np

readings = np.array([21.617, 19.213, 25.888, 17.444, 22.501, 18.325])

# TODO: clip into the valid band [18.0, 22.0], round to 1 decimal,
# and print the cleaned array
`,
      solution: `import numpy as np

readings = np.array([21.617, 19.213, 25.888, 17.444, 22.501, 18.325])
cleaned = np.clip(readings, 18.0, 22.0)
print(np.round(cleaned, 1))
`,
      expectedOutput: `[21.6 19.2 22.  18.  22.  18.3]`,
      concepts: ["np.clip", "np.round", "data cleaning"],
    },
    {
      id: "f-b3",
      tier: "beginner",
      title: "Mean vs median at the tip jar",
      prompt:
        "Seven tips: [12.50, 14.00, 11.75, 13.25, 96.00, 12.75, 15.50] — one table went wild. Print the mean rounded to 2 decimals, then the median. Expected: 25.11 and 13.25. The 96.00 outlier drags the mean almost 12 dollars above the median; the median, as the middle order statistic, barely notices the wild table.",
      hint: "tips.mean() (or np.mean(tips)) then np.median(tips). Round only the mean: np.round(..., 2) — the median is exact as it stands.",
      starter: `import numpy as np

tips = np.array([12.50, 14.00, 11.75, 13.25, 96.00, 12.75, 15.50])

# TODO: print the mean rounded to 2 decimals, then the median
`,
      solution: `import numpy as np

tips = np.array([12.50, 14.00, 11.75, 13.25, 96.00, 12.75, 15.50])
print(np.round(tips.mean(), 2))
print(np.median(tips))
`,
      expectedOutput: `25.11
13.25`,
      concepts: ["np.mean", "np.median", "outliers", "order statistics"],
    },
    {
      id: "f-b4",
      tier: "beginner",
      title: "Two ways to count stars",
      prompt:
        "Sixteen product reviews carry star ratings 1-5: [5, 3, 4, 4, 5, 2, 4, 5, 1, 4, 3, 5, 4, 5, 3, 4]. Count them two ways. First np.unique(ratings, return_counts=True): print the values and the counts — five distinct stars, with four stars occurring 6 times. Then np.histogram(ratings, bins=[1, 2, 3, 4, 5]): print the band counts. Expected: [1 1 3 11] — the last band [4, 5] is closed on both ends, so it swallows all six 4s AND all five 5s (eleven reviews), while 1s, 2s and 3s sit alone in their half-open bands.",
      hint: "Unpack two results: values, counts = np.unique(ratings, return_counts=True). For the bands: band_counts, edges = np.histogram(ratings, bins=[1, 2, 3, 4, 5]).",
      starter: `import numpy as np

ratings = np.array([5, 3, 4, 4, 5, 2, 4, 5, 1, 4, 3, 5, 4, 5, 3, 4])

# TODO: print unique values and their counts, then histogram the
# ratings with edges [1, 2, 3, 4, 5] and print the band counts
`,
      solution: `import numpy as np

ratings = np.array([5, 3, 4, 4, 5, 2, 4, 5, 1, 4, 3, 5, 4, 5, 3, 4])

values, counts = np.unique(ratings, return_counts=True)
print(values)
print(counts)

band_counts, edges = np.histogram(ratings, bins=[1, 2, 3, 4, 5])
print(band_counts)
`,
      expectedOutput: `[1 2 3 4 5]
[1 1 3 6 5]
[ 1  1  3 11]`,
      concepts: ["np.unique", "return_counts", "np.histogram", "bin edges"],
    },
    {
      id: "f-i1",
      tier: "intermediate",
      title: "Every sign of floor division",
      prompt:
        "Compute floor division and modulo for every sign combination: a = [-7, -7, 7, 7] and b = [3, -3, 3, -3]. Use np.divmod to get both arrays at once, and print the quotients, the remainders, and one boolean proving the divmod identity b * q + r == a. Expected: quotients [-3 2 2 -3] — floor division floors toward negative infinity, never toward zero — remainders [2 -1 1 -2], each taking its DIVISOR's sign, and True.",
      hint: "q, r = np.divmod(a, b) returns both arrays. For the proof line: np.all(b * q + r == a) collapses the four checks into one boolean.",
      starter: `import numpy as np

a = np.array([-7, -7, 7, 7])
b = np.array([3, -3, 3, -3])

# TODO: use np.divmod to print the quotient and remainder arrays,
# then prove b * q + r == a holds for every pair (print one boolean)
`,
      solution: `import numpy as np

a = np.array([-7, -7, 7, 7])
b = np.array([3, -3, 3, -3])

q, r = np.divmod(a, b)
print(q)
print(r)
print(np.all(b * q + r == a))
`,
      expectedOutput: `[-3  2  2 -3]
[ 2 -1  1 -2]
True`,
      concepts: ["np.divmod", "floor division", "np.mod", "sign rules"],
    },
    {
      id: "f-i2",
      tier: "intermediate",
      title: "log1p rescues tiny values",
      prompt:
        "Small rates break the naive logarithm. With x = [1e-9, 1e-12, 1e-15], compute the naive np.log(1 + x) and the careful np.log1p(x); print both arrays, then print the naive version's relative error (naive / careful - 1). Expected: naive prints [1.00000008e-09 1.00008890e-12 1.11022302e-15] — the 1e-15 entry has drifted to 1.11e-15 — while log1p prints essentially [1e-09 1e-12 1e-15], and the relative-error line reads [8.27403710e-08 8.89005823e-05 1.10223025e-01]: the naive path lost 11% of the tiniest value before the logarithm ever ran, because 1 + 1e-15 rounds to 1.0000000000000009 in float64.",
      hint: "Three lines of math, three prints. The relative error line is just print(naive / careful - 1) — no zeros in x, so the division is safe.",
      starter: `import numpy as np

x = np.array([1e-9, 1e-12, 1e-15])

# TODO: compute the naive np.log(1 + x) and the careful np.log1p(x),
# print both arrays, then print the naive relative error
# (naive / careful - 1)
`,
      solution: `import numpy as np

x = np.array([1e-9, 1e-12, 1e-15])

naive = np.log(1 + x)
careful = np.log1p(x)
print(naive)
print(careful)
print(naive / careful - 1)
`,
      expectedOutput: `[1.00000008e-09 1.00008890e-12 1.11022302e-15]
[9.99999999e-10 1.00000000e-12 1.00000000e-15]
[8.27403710e-08 8.89005823e-05 1.10223025e-01]`,
      concepts: ["np.log1p", "np.log", "floating-point precision"],
    },
    {
      id: "f-i3",
      tier: "intermediate",
      title: "The weighted GPA, with a ddof check",
      prompt:
        "Four courses: grades [4.0, 3.7, 3.3, 4.0] with credit weights [3, 4, 3, 2]. Print four numbers, each rounded to 3 decimals: the credit-weighted GPA from np.average(grades, weights=credits), the plain unweighted mean, and the standard deviation with ddof=0 then ddof=1. Expected: 3.725, 3.75, 0.287, 0.332 — the weighted GPA sits below the unweighted mean because the low 3.3 carries 3 credits, and the sample std (ddof=1) exceeds the population std (ddof=0) by the factor sqrt(N / (N - 1)) = sqrt(4/3), about 1.15.",
      hint: "np.average takes weights=; the plain mean is grades.mean(). For the spread: grades.std() is ddof=0 by default, grades.std(ddof=1) is the sample formula.",
      starter: `import numpy as np

grades = np.array([4.0, 3.7, 3.3, 4.0])
credits = np.array([3, 4, 3, 2])

# TODO: print the credit-weighted GPA, the unweighted mean, and std
# with ddof=0 and ddof=1 (all four rounded to 3 decimals)
`,
      solution: `import numpy as np

grades = np.array([4.0, 3.7, 3.3, 4.0])
credits = np.array([3, 4, 3, 2])

print(np.round(np.average(grades, weights=credits), 3))
print(np.round(grades.mean(), 3))
print(np.round(grades.std(), 3))
print(np.round(grades.std(ddof=1), 3))
`,
      expectedOutput: `3.725
3.75
0.287
0.332`,
      concepts: ["np.average", "weights", "np.std", "ddof"],
    },
    {
      id: "f-i4",
      tier: "intermediate",
      title: "Row shares with keepdims",
      prompt:
        "Three regions x four quarters of revenue: [[120, 135, 150, 160], [95, 105, 99, 120], [80, 88, 92, 101]]. Print three things: each region's annual total (sum over axis=1), each quarter's cross-region total (sum over axis=0), and a 3x4 grid where every entry is that quarter's share of its OWN region's total — computed in ONE line as revenue / revenue.sum(axis=1, keepdims=True), rounded to 3 decimals. Expected totals: regions [565 419 361] and quarters [295 328 341 381]; each row of the share grid sums to 1.0.",
      hint: "keepdims=True is what makes the division broadcast: the row totals come out shape (3, 1), which stretches across all four columns. Without it the shapes (3, 4) and (3,) collide.",
      starter: `import numpy as np

revenue = np.array([[120, 135, 150, 160],
                    [95, 105, 99, 120],
                    [80, 88, 92, 101]])

# TODO: print per-region totals (axis=1), per-quarter totals (axis=0),
# and each entry's share of its OWN row — one line, keepdims=True,
# rounded to 3 decimals
`,
      solution: `import numpy as np

revenue = np.array([[120, 135, 150, 160],
                    [95, 105, 99, 120],
                    [80, 88, 92, 101]])

print(revenue.sum(axis=1))
print(revenue.sum(axis=0))
print(np.round(revenue / revenue.sum(axis=1, keepdims=True), 3))
`,
      expectedOutput: `[565 419 361]
[295 328 341 381]
[[0.212 0.239 0.265 0.283]
 [0.227 0.251 0.236 0.286]
 [0.222 0.244 0.255 0.28 ]]`,
      concepts: ["np.sum", "axis", "keepdims", "broadcasting"],
    },
    {
      id: "f-a1",
      tier: "advanced",
      title: "Fix the in-place crash",
      prompt:
        "Run the starter: `counts` is an int64 array and `counts += 1.5` crashes with UFuncOutputCastingError — an in-place operator must write back into the array's own dtype, and float64 into int64 would lose the .5, so NumPy raises instead of guessing. Fix it in two moves: first apply an integer in-place bump (`counts += 1` — allowed, same dtype), then compute the +1.5 calibration OUT of place and print `counts`, the calibrated array and its dtype. Expected: [4 8 13 6], then [5.5 9.5 14.5 7.5], then float64 — the out-of-place plus promotes to float64, the in-place one never would.",
      hint: "In-place keeps the dtype or raises; out-of-place `counts + 1.5` builds a NEW float64 array. The fixed program needs both moves, in that order.",
      starter: `import numpy as np

counts = np.array([3, 7, 12, 5])

# The intent: apply the 1.5-unit calibration, staying in place.
counts += 1.5
print(counts)
`,
      solution: `import numpy as np

counts = np.array([3, 7, 12, 5])

counts += 1                # integer in-place: same dtype, allowed
calibrated = counts + 1.5  # float adjustment: out of place, promotes
print(counts)
print(calibrated)
print(calibrated.dtype)
`,
      expectedOutput: `[ 4  8 13  6]
[ 5.5  9.5 14.5  7.5]
float64`,
      starterExpectError:
        "numpy._core._exceptions._UFuncOutputCastingError: Cannot cast ufunc 'add' output from dtype('float64') to dtype('int64') with casting rule 'same_kind'",
      concepts: ["in-place operators", "dtype casting", "UFuncOutputCastingError"],
    },
    {
      id: "f-a2",
      tier: "advanced",
      title: "The grid detective",
      prompt:
        "Four sensors x six hours of readings: [[18, 22, 25, 27, 24, 20], [15, 17, 19, 21, 20, 16], [30, 35, 41, 44, 39, 33], [12, 13, 15, 14, 12, 8]]. Print six lines: the sensor and hour of the global peak on one line — build it with row, col = np.unravel_index(readings.argmax(), readings.shape) — then the peak value; each sensor's own peak (max over axis=1); whether ANY reading exceeds the alert line of 40; whether ALL readings exceed 10; and the running total of the hour totals (cumsum of the axis=0 sums). Expected: 2 3, then 44, per-sensor peaks [27 21 44 15], then True, then False (the last reading is 8), and running totals [75 162 262 368 463 540].",
      hint: "argmax returns the flat index of the first maximum — unravel_index converts it to coordinates. The last two lines chain two reductions: np.cumsum(readings.sum(axis=0)) folds the hour totals into running totals.",
      starter: `import numpy as np

readings = np.array([[18, 22, 25, 27, 24, 20],
                     [15, 17, 19, 21, 20, 16],
                     [30, 35, 41, 44, 39, 33],
                     [12, 13, 15, 14, 12, 8]])

# TODO: print the peak's sensor and hour (argmax + unravel_index) and
# the peak value; each sensor's peak (axis=1); whether ANY reading
# exceeds 40; whether ALL exceed 10; the cumsum of the hour totals
`,
      solution: `import numpy as np

readings = np.array([[18, 22, 25, 27, 24, 20],
                     [15, 17, 19, 21, 20, 16],
                     [30, 35, 41, 44, 39, 33],
                     [12, 13, 15, 14, 12, 8]])

row, col = np.unravel_index(readings.argmax(), readings.shape)
print(row, col)
print(readings[row, col])
print(readings.max(axis=1))
print(np.any(readings > 40))
print(np.all(readings > 10))
print(np.cumsum(readings.sum(axis=0)))
`,
      expectedOutput: `2 3
44
[27 21 44 15]
True
False
[ 75 162 262 368 463 540]`,
      concepts: ["np.argmax", "np.unravel_index", "np.any", "np.all", "np.cumsum"],
    },
    {
      id: "f-a3",
      tier: "advanced",
      title: "Quartiles, IQR and correlation",
      prompt:
        "Eight house sales: prices [210, 320, 145, 400, 265, 180, 330, 95] (thousands) and sizes [72, 110, 48, 135, 90, 60, 115, 33] (square meters). Print four numbers: the 25th percentile of prices via np.percentile, the 75th via np.quantile(prices, 0.75), the IQR (their difference — the outlier-proof spread), and the Pearson correlation r between price and size read from np.corrcoef(prices, sizes)[0, 1]. Round money to 2 decimals and r to 4. Expected: 171.25, 322.5, 151.25 — both quartiles are interpolated values that appear in no row — and r = 0.9993: bigger houses, bigger prices, almost perfectly linear.",
      hint: "np.percentile takes 0-100; np.quantile takes 0.0-1.0 — two spellings of the same question. corrcoef returns the 2x2 matrix; r is either off-diagonal cell.",
      starter: `import numpy as np

prices = np.array([210, 320, 145, 400, 265, 180, 330, 95])
sizes = np.array([72, 110, 48, 135, 90, 60, 115, 33])

# TODO: print the 25th and 75th percentiles of prices (rounded to 2),
# the IQR, and the correlation r between prices and sizes (rounded
# to 4 decimals)
`,
      solution: `import numpy as np

prices = np.array([210, 320, 145, 400, 265, 180, 330, 95])
sizes = np.array([72, 110, 48, 135, 90, 60, 115, 33])

q25 = np.percentile(prices, 25)
q75 = np.quantile(prices, 0.75)
print(np.round(q25, 2))
print(np.round(q75, 2))
print(np.round(q75 - q25, 2))
print(np.round(np.corrcoef(prices, sizes)[0, 1], 4))
`,
      expectedOutput: `171.25
322.5
151.25
0.9993`,
      concepts: ["np.percentile", "np.quantile", "IQR", "np.corrcoef"],
    },
    {
      id: "f-a4",
      tier: "advanced",
      title: "The receipt analysis",
      prompt:
        "Ten receipts across three categories (0 = drinks, 1 = food, 2 = gear), with amounts in dollars: category = [0, 2, 1, 0, 2, 1, 0, 2, 2, 1] and amount = [4.50, 89.00, 23.50, 6.25, 132.75, 18.00, 3.75, 45.90, 210.40, 31.25]. Print four lines: receipts per category (np.bincount(category)); dollars per category (np.bincount(category, weights=amount), rounded to 2 — money per category, not just receipts); each receipt's price tier from np.digitize(amount, [50.0, 150.0]) (0 means under 50, 1 means 50 up to 150, 2 means 150 and up); and receipts per tier with np.bincount(..., minlength=3). Expected: [3 3 4], [14.5 72.75 478.05], [0 1 0 0 1 0 0 0 2 0], [7 2 1] — gear wins the money (478.05 of the 565.30 total) with only four receipts, while seven of the ten cost under 50.",
      hint: "bincount with weights= sums weights instead of counting ones; digitize labels each value with its bin index (0..len(edges)); feed those labels back into bincount with minlength=3 for the tier totals.",
      starter: `import numpy as np

category = np.array([0, 2, 1, 0, 2, 1, 0, 2, 2, 1])
amount = np.array([4.50, 89.00, 23.50, 6.25, 132.75, 18.00, 3.75, 45.90, 210.40, 31.25])

# TODO: print receipts per category and dollars per category
# (bincount, weights, rounded to 2); print each receipt's price tier
# with np.digitize(amount, [50.0, 150.0]); print receipts per tier
# (bincount with minlength=3)
`,
      solution: `import numpy as np

category = np.array([0, 2, 1, 0, 2, 1, 0, 2, 2, 1])
amount = np.array([4.50, 89.00, 23.50, 6.25, 132.75, 18.00, 3.75, 45.90, 210.40, 31.25])

receipts = np.bincount(category)
dollars = np.bincount(category, weights=amount)
print(receipts)
print(np.round(dollars, 2))

tiers = np.digitize(amount, [50.0, 150.0])
print(tiers)
print(np.bincount(tiers, minlength=3))
`,
      expectedOutput: `[3 3 4]
[ 14.5   72.75 478.05]
[0 1 0 0 1 0 0 0 2 0]
[7 2 1]`,
      concepts: ["np.bincount", "weights", "np.digitize", "minlength"],
    },
  ],

  // ------------------------------------------------------------------
  // Part F assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "f-as-1",
      prompt: "What does np.array([-7, 7]) // np.array([3, -3]) return?",
      options: [
        { text: "[-3 -3]", correct: true, feedback: "Both quotients floor toward negative infinity: -7/3 = -2.33 floors to -3, and 7/-3 = -2.33 also floors to -3. NumPy and Python share the floor convention, not the truncate-toward-zero one." },
        { text: "[-2 -2]", correct: false, feedback: "That is truncation toward zero — a different language's rule. NumPy floors: -7 // 3 is -3, and the divmod identity b * (a // b) + a % b == a proves it." },
        { text: "[-3 -2]", correct: false, feedback: "Half floored, half truncated — no single rule produces this. The same floor-toward-negative-infinity rule applies to every sign combination." },
        { text: "[-2 -3]", correct: false, feedback: "Also a mix of two conventions. Run it: both entries come out -3, because -7/3 and 7/-3 both equal -2.33 and the floor takes them down to -3." },
      ],
      explanation: "`//` floors toward negative infinity on every sign combination; truncation toward zero is a different language's rule.",
    },
    {
      id: "f-as-2",
      prompt: "a = np.array([3, 7]) (dtype int64). What does a += 1.5 do?",
      options: [
        { text: "Raises UFuncOutputCastingError: in-place operators must write back into the array's own dtype, and float64 results cannot be cast into this int64 array", correct: true, feedback: "Right — losing the .5 would be a data-destroying guess, so NumPy refuses. In-place keeps the dtype or raises." },
        { text: "Works: a becomes [4, 8], with each sum rounded into the int64 dtype", correct: false, feedback: "NumPy never silently rounds on your behalf. The .5 would vanish without a trace, so the operation raises instead." },
        { text: "Works: a becomes [4.5, 8.5] and its dtype is promoted to float64", correct: false, feedback: "That is the behavior of the out-of-place a = a + 1.5. In-place operators never change dtype — that discipline is exactly why the crash exists." },
        { text: "Works, but only because 1.5 is a Python float; an array operand would raise", correct: false, feedback: "The operand's kind is irrelevant — a += np.array([1.5]) fails identically. What matters is the RESULT dtype (float64) versus the array's dtype (int64)." },
      ],
      explanation: "In-place operators keep the dtype or raise UFuncOutputCastingError; promotion to a wider dtype only happens out of place.",
    },
    {
      id: "f-as-3",
      prompt: "np.round(np.array([0.5, 1.5, 2.5, 3.5, 4.5])) returns:",
      options: [
        { text: "[0. 2. 2. 4. 4.] — exact .5 ties resolve to the even neighbor", correct: true, feedback: "Banker's rounding: 0.5, 2.5 and 4.5 go down to even; 1.5 and 3.5 go up to even. Unbiased across many ties — the same rule as Python's built-in round." },
        { text: "[1. 2. 3. 4. 5.] — the school rule: halves round up", correct: false, feedback: "Round-half-up is the school rule, not NumPy's. np.round sends every exact tie to its even neighbor, so 0.5 -> 0 and 4.5 -> 4." },
        { text: "[0. 1. 2. 3. 4.] — halves round down", correct: false, feedback: "Also not the rule: 1.5 and 3.5 round UP to 2 and 4, because those are their even neighbors. Only some ties go down." },
        { text: "It raises a ValueError — exact .5 values are ambiguous", correct: false, feedback: "No ambiguity and no error: round-half-to-even assigns every exact tie deterministically, which is precisely why it was chosen." },
      ],
      explanation: "np.round uses round-half-to-even (banker's rounding): every exact .5 tie goes to the even neighbor — 2.5 -> 2.0 and 3.5 -> 4.0.",
    },
    {
      id: "f-as-4",
      prompt: "Which statement about np.std and ddof is TRUE?",
      options: [
        { text: "np.std divides by N by default (ddof=0, the population formula); pandas' std defaults to N-1 — align ddof before comparing spreads", correct: true, feedback: "Exactly the trap the lesson proved on seven points: the two defaults differ by the factor sqrt(N / (N-1)), so identical data yields different stds until the ddofs agree." },
        { text: "np.std divides by N-1 by default; pandas divides by N", correct: false, feedback: "Swapped. NumPy's default ddof=0 divides by N (population); the sample formula dividing by N-1 is what pandas does by default." },
        { text: "ddof only matters on small arrays; past a few thousand points both give identical results", correct: false, feedback: "The gap SHRINKS as N grows — sqrt(N/(N-1)) approaches 1 — but on any finite array the two values differ, however slightly." },
        { text: "ddof=1 makes std smaller, because dividing by N-1 divides by less", correct: false, feedback: "Backwards: dividing by the smaller N-1 makes the variance — and therefore the std — larger. ddof=1 std is always >= ddof=0 std." },
      ],
      explanation: "NumPy defaults to the population formula (divide by N); pandas defaults to the sample formula (N-1). Align ddof before comparing spreads.",
    },
    {
      id: "f-as-5",
      prompt: "revenue has shape (3, 4): 3 regions in rows, 4 quarters in columns. What does revenue.sum(axis=0) return?",
      options: [
        { text: "Shape (4,) — one total per column: axis 0, the rows, is collapsed", correct: true, feedback: "Correct — reducing an axis removes it. Collapsing the rows leaves one value per column, and shape (3, 4) becomes (4,)." },
        { text: "Shape (3,) — one total per row", correct: false, feedback: "That is axis=1: collapsing the columns leaves one value per row. Axis 0 names the rows themselves." },
        { text: "Shape (3, 1) — the row totals kept as a column", correct: false, feedback: "That is what sum(axis=1, keepdims=True) produces. Plain axis=0 fully removes the axis it names, no size-1 stub remains." },
        { text: "A scalar — the whole-array total", correct: false, feedback: "That is sum() with axis=None, the default. Naming an axis leaves the other axes intact." },
      ],
      explanation: "sum(axis=0) collapses axis 0 (the rows): one value per column, shape (4,). Reducing an axis removes it.",
    },
    {
      id: "f-as-6",
      prompt: "The idiom np.unravel_index(a.argmax(), a.shape) exists because:",
      options: [
        { text: "argmax returns a FLAT index into the array's flattened data; unravel_index converts it into the [row, col] coordinates for that shape", correct: true, feedback: "Right: 15 means nothing until you know the shape — unravel_index turns 15 into (2, 3) for a 4x6 grid, pure index arithmetic, no pass over the data." },
        { text: "argmax returns the maximum value, and unravel_index finds where it lives", correct: false, feedback: "argmax already returns a position — the flat one. The VALUE comes from indexing with the unraveled coordinates." },
        { text: "argmax averages the positions of tied maxima, and unravel_index undoes it", correct: false, feedback: "No averaging ever happens: ties are resolved simply and documented — argmax reports the FIRST occurrence." },
        { text: "unravel_index sorts the array so argmax can run faster", correct: false, feedback: "No sorting anywhere: argmax is one pass over the data, and unravel_index is pure arithmetic on the flat index (divmod by the shape)." },
      ],
      explanation: "argmax answers WHERE with a flat index; unravel_index reshapes that answer into coordinates matching the array's shape.",
    },
    {
      id: "f-as-7",
      prompt: "np.bincount(category, weights=amount) returns:",
      options: [
        { text: "The total weight per integer value 0..max(category), aligned exactly like plain bincount's counts", correct: true, feedback: "Correct — each occurrence contributes its weight instead of 1: dollars, minutes or units per category in the same aligned 0..max layout." },
        { text: "The count of each value — the weights are just a filter", correct: false, feedback: "Without weights you get counts; WITH weights each occurrence adds its weight, so the result is a per-category SUM, not a count." },
        { text: "The average weight per category", correct: false, feedback: "Totals, not averages: divide by np.bincount(category) yourself if you want the mean per category — bincount does not." },
        { text: "An error: bincount has no weights parameter", correct: false, feedback: "It does — and it is the money-per-category trick from the receipt analysis: one call turns category ids plus amounts into revenue per category." },
      ],
      explanation: "weights= switches bincount from counting occurrences to summing a value per occurrence — totals per category, same aligned 0..max layout.",
    },
    {
      id: "f-as-8",
      prompt: "np.histogram(scores, bins=[60, 70, 80, 90, 100]). Which value is silently NOT counted?",
      options: [
        { text: "55 — below the first edge, out of range", correct: true, feedback: "Right: values outside [first edge, last edge] are dropped from every count, so counts.sum() comes back smaller than scores.size. One-line guard: counts.sum() == scores.size." },
        { text: "70 — sitting exactly on an inner edge", correct: false, feedback: "An inner-edge value IS counted: it lands in the bin it starts, [70, 80), because every bin except the last is half-open [lo, hi)." },
        { text: "100 — the very last edge", correct: false, feedback: "The last bin [90, 100] is closed on both ends, so 100 is counted — the maximum can never fall out of its own histogram." },
        { text: "85 — strictly inside a bin", correct: false, feedback: "Values inside a bin are the easy case: 85 counts in [80, 90). Only out-of-range values are dropped." },
      ],
      explanation: "histogram silently drops values outside [first edge, last edge]; everything inside — inner-edge values and the maximum included — is counted.",
    },
  ],

  // ------------------------------------------------------------------
  // Part F mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Sensor Dashboard",
    brief:
      "Build a one-screen monitoring report for a small sensor network: five sensors reporting once an hour for a day. The data is formula-built — a per-sensor baseline, a phase-shifted daily cycle, and two planted anomalies — so every number in your finished report is deterministic and checkable. You will fold the 5x24 grid with per-sensor statistics, locate the global peak with argmax plus unravel_index, standardize each sensor into z-scores to flag |z| > 2 anomalies, bucket every reading into severity tiers with digitize, and tally the tiers with bincount. The finished dashboard is exactly the pattern real operations teams run hourly — and because nothing is random, you can prove yours correct line by line.",
    requirements: [
      "Build the 5x24 grid exactly as the starter does: baseline + amplitude * sin over the day, then grid[2, 14] += 9.0 and grid[4, 3] -= 8.0 — no randomness anywhere",
      "sensor_stats(grid): a 5x4 array of per-sensor [mean, std, min, max], all computed along axis=1 and rounded to 2 decimals",
      "peak_location(grid): the (sensor, hour) tuple from np.unravel_index(grid.argmax(), grid.shape) — the report must show the peak 36.5 at sensor 2, hour 14",
      "zscores(grid): per-sensor standardization in one line, (reading - row mean) / row std, using keepdims=True so the row statistics broadcast across all 24 hours",
      "Anomaly counting: readings with np.abs(z) > 2 — exactly 2, at cells [2, 14] and [4, 3] (the two planted anomalies and nothing else)",
      "Severity mix: np.digitize(np.abs(z), [1.0, 2.0]) bucketed and tallied with np.bincount(..., minlength=3) — the report must show [67 51 2]",
      "Hour-of-day totals via grid.sum(axis=0) and the busiest hour — hour 9 with total 137.56",
      "A compact printed report matching the starter's labels: the per-sensor table, the peak line, the anomaly count and cells, the severity mix, and the busiest-hour line",
    ],
    steps: [
      "Run the starter as-is first: it builds the grid and prints a deliberately broken dashboard — all-zero stats, the peak 'at sensor 0 hour 0', zero anomalies. Read the report structure before changing anything.",
      "Implement sensor_stats: np.round(np.column_stack([...]), 2) with the four axis=1 reductions. Rerun — sensor 2's row must print 25.38 4.20 20.00 36.50 (its std is inflated by the planted spike).",
      "Implement peak_location with argmax + unravel_index. The report line must read: global peak: 36.5 at sensor 2 hour 14.",
      "Implement zscores in one line with keepdims=True on both the mean and the std. Rerun — the anomaly count must be exactly 2, with cells [[2, 14], [4, 3]]. If you forget keepdims, the (5, 24) grid meets a (5,) mean and the subtraction raises.",
      "Read the severity mix line: [67 51 2] — 67 normal readings, 51 in the 1-to-2 watch band (the sinusoids' daily crests and troughs), and exactly your 2 alarms.",
      "Verify the busiest-hour line: hour 9, total 137.56. Explain to yourself why mid-morning wins: the five phase-shifted cycles crest between hours 6 and 12, and their crests pile up around 9.",
      "Final check — every line of the report must be reproducible: rerun the program and confirm nothing changes (deterministic data, deterministic math, no randomness).",
    ],
    starter: `import numpy as np

# ------------------------------------------------------------------
# 1. Build the data: 5 sensors x 24 hours, pure formula, no randomness
# ------------------------------------------------------------------
hours = np.arange(24)                                  # 0..23
base = np.array([20.0, 22.0, 25.0, 27.0, 24.0])        # per-sensor baseline
amp = np.array([3.0, 4.0, 5.0, 6.0, 4.5])              # daily cycle amplitude
phase = np.array([0.0, 2.0, 4.0, 6.0, 3.0])            # cycle offset, hours

grid = base[:, None] + amp[:, None] * np.sin(2 * np.pi * (hours - phase[:, None]) / 24.0)
grid[2, 14] += 9.0    # planted anomaly: a hot afternoon spike
grid[4, 3] -= 8.0     # planted anomaly: a cold night dip

print("=== SENSOR DASHBOARD ===")
print("grid:", grid.shape, grid.dtype)

# ------------------------------------------------------------------
# 2. Per-sensor report card: mean, std, min, max (all along axis=1)
# ------------------------------------------------------------------
def sensor_stats(g):
    """One row per sensor: [mean, std, min, max], rounded to 2 decimals."""
    # TODO: np.column_stack the four per-row statistics and np.round them
    return np.zeros((g.shape[0], 4))

# ------------------------------------------------------------------
# 3. Global peak and per-sensor z-scores
# ------------------------------------------------------------------
def peak_location(g):
    """The (sensor, hour) tuple of the maximum reading."""
    # TODO: np.unravel_index(g.argmax(), g.shape)
    return (0, 0)

def zscores(g):
    """Per-sensor z-scores: (reading - row mean) / row std."""
    # TODO: one line, keepdims=True on both the mean and the std
    return np.zeros_like(g)

# ------------------------------------------------------------------
# 4. Severity buckets and the compact report
# ------------------------------------------------------------------
SEVERITY_EDGES = [1.0, 2.0]   # |z| < 1 normal, 1..2 watch, >= 2 alarm

print("sensor   mean    std    min    max")
stats = sensor_stats(grid)
for s in range(grid.shape[0]):
    m, sd, lo, hi = stats[s]
    print(f"{s:^6}{m:7.2f}{sd:7.2f}{lo:7.2f}{hi:7.2f}")

row, col = peak_location(grid)
print("global peak:", round(float(grid[row, col]), 2), "at sensor", row, "hour", col)

z = zscores(grid)
alarms = np.abs(z) > 2
print("anomalies (|z| > 2):", int(alarms.sum()))
print("anomaly cells:", np.argwhere(alarms).tolist())

severity = np.digitize(np.abs(z), SEVERITY_EDGES)
mix = np.bincount(severity.ravel(), minlength=3)
print("severity mix (normal/watch/alarm):", mix)

hour_totals = grid.sum(axis=0)
print("busiest hour:", int(hour_totals.argmax()),
      "with total", round(float(hour_totals.max()), 2))
`,
    concepts: [
      "axis reductions",
      "argmax",
      "np.unravel_index",
      "z-scores",
      "keepdims",
      "np.digitize",
      "np.bincount",
      "boolean counting",
    ],
    extension:
      "Add a second axis story: compute z-scores DOWN axis 0 (per hour, across sensors) with keepdims=True, report the hour with the largest single |z|, and add a 'quietest hour' line using argmin on the hour totals. Then replace the two planted anomalies with two of your own choosing and confirm the dashboard finds exactly your cells — deterministically, every run.",
  },
};
