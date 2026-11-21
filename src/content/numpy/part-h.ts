/**
 * PART H — LINEAR ALGEBRA: MATRICES WITH MEANING
 *
 * The mathematics running under machine learning, taught as machines you can
 * run: matrix multiplication as composition of machines (@, with * staying
 * strictly elementwise) -> dot products, norms and cosine similarity (the
 * embedding-search primitive) -> solving systems with solve/lstsq (which IS
 * linear regression) -> eigenvalues, eigenvectors and SVD (the compression
 * idea behind PCA and recommender systems).
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
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_H: NumpyPart = {
  letter: "H",
  title: "Linear Algebra: Matrices with Meaning",
  tagline:
    "matmul, dot products, norms, systems, eigenvalues and SVD — the mathematics running under machine learning",
  description:
    "Meet the mathematics running under every machine-learning model you have heard of — taught as machines you can actually run. A matrix is a machine that turns vectors into vectors: `@` and `np.matmul` compose those machines (while `*` stays strictly elementwise), and the shape rule (n, k) @ (k, m) -> (n, m) becomes second nature. Dot products, norms and cosine similarity measure agreement, length and angle — the exact primitive behind embedding search and recommendations. `np.linalg.solve` cracks systems of equations without ever forming an inverse, and `np.linalg.lstsq` fits the best line through over-determined data, which is precisely what linear regression is. Finally eigenvalues, eigenvectors and SVD reveal the directions a matrix merely stretches — the compression idea behind PCA and recommender systems. Every output shown is machine-verified real, and every ML connection in this part is the true story, not decoration.",
  lessons: [
    // ------------------------------------------------------------- h-01
    {
      slug: "h-01",
      title: "Matrices as Machines: matmul",
      minutes: 16,
      summary:
        "A matrix is a machine that turns vectors into other vectors. Learn the one operator that composes machines (@), the shape rule that governs it, the real error NumPy throws when you break it, and why np.dot and np.matmul are twins in 2-D but strangers in 3-D.",
      kind: "concept",
      objectives: [
        "Explain the difference between * (elementwise) and @ (matrix product), and pick the right one for a given computation",
        "Apply the inner-dimension rule (n, k) @ (k, m) -> (n, m) to predict whether a product is defined and what shape comes out",
        "Recognize and read the real NumPy error message produced when the inner dimensions disagree",
        "Use @ on a batch (stack) of matrices and say precisely how np.matmul and np.dot differ there",
        "Treat a matrix as a function: build a rotation matrix and apply it to four points with one product",
      ],
      why: "Every model behind the words 'machine learning' — from a tiny linear regression to a 70-billion-parameter transformer — is, at the bottom, a stack of matrix products. If you cannot read shapes fluently, you cannot build, debug, or even load these models; if you reach for * where @ was meant, NumPy will happily compute elementwise garbage and hand it back with a smile, because elementwise is a perfectly legal operation on matching shapes. This lesson makes the matrix product mechanical: one shape rule, one honest error message, one operator, and the mental picture — a matrix is a machine, and @ is how you wire machines together.",
      blocks: [
        {
          kind: "text",
          text: "You have been multiplying arrays since Part E — but always *elementwise*: same-shaped grids, cell against matching cell. That is the operation `*`. Linear algebra runs on a second, completely different multiplication: the **matrix product**, written `@` in NumPy code. The difference is not syntax trivia; it is two different ideas. `*` scales and combines grids cell-by-cell. `@` **composes machines**: it feeds the output of one matrix into another, mixing rows with columns along the way.",
        },
        {
          kind: "heading",
          text: "Two multiplications, two meanings",
        },
        {
          kind: "text",
          text: "One line of recap first, because it is the number-one newcomer trap: **`*` is elementwise, always**. `A * B` multiplies matching cells and requires (broadcast-compatible) same shapes. `A @ B` is the matrix product: each output cell is a *row-of-A times column-of-B* dot product. Watch the same two little matrices under both operators:",
        },
        {
          kind: "code",
          title: "Same inputs, two different products",
          code: `import numpy as np

M = np.array([[1, 2],
              [3, 4]])
N = np.array([[10, 20],
              [30, 40]])

print("M * N  (elementwise):")
print(M * N)
print()
print("M @ N  (matrix product):")
print(M @ N)
`,
          output: `M * N  (elementwise):
[[ 10  40]
 [ 90 160]]

M @ N  (matrix product):
[[ 70 100]
 [150 220]]`,
          outputNote:
            "M * N pairs cells: 1*10, 2*20, 3*30, 4*40. M @ N mixes rows with columns: the top-left 70 is row [1, 2] dotted with column [10, 30] = 1*10 + 2*30.",
          explain: [
            "`M * N` — cell (0, 0) is 1*10 = 10, cell (0, 1) is 2*20 = 40, and so on: no row ever meets a column.",
            "`M @ N` — cell (0, 0) is 1*10 + 2*30 = 70: the whole first row of M combined with the whole first column of N.",
            "Both are legal here because the shapes happen to allow both. That is exactly why choosing the wrong one is so dangerous: NumPy cannot read your mind, only your operator.",
          ],
        },
        {
          kind: "heading",
          text: "The shape rule you read at a glance",
        },
        {
          kind: "text",
          text: "The matrix product has exactly one law: **the inner dimensions must match**. For `A @ B`, write the shapes next to each other — `(n, k)` and `(k, m)` — and the two *middle* numbers must be equal. If they are, the *outer* numbers survive and the result is `(n, m)`. If they are not, the product does not exist. Every practitioner reads shapes this way, in one glance, before typing anything.",
        },
        {
          kind: "visual",
          title: "The inner-dimension rule",
          ascii: `      A: (n, k)    @    B: (k, m)    ->    (n, m)
          \\   _______________   /
           \\ /                 \\ /
            v                   v
     these INNER numbers must match;
     the OUTER survivors become the result

   A (2, 3) @ B (3, 2)  ->  (2, 2)       A (2, 3) @ B (2, 4)  ->  ERROR
        inner 3 == 3 : defined                inner 3 != 2 : undefined
`,
          caption:
            "Rows of A must be exactly as long as B is tall. Say it out loud a few times: outer numbers in, inner numbers matched.",
        },
        {
          kind: "code",
          title: "A shape walk in code: row into matrix, matrix into column",
          code: `import numpy as np

row = np.array([1, 2, 3])              # a 1-D vector, length 3
M32 = np.array([[1, 0],
                [0, 1],
                [1, 1]])               # shape (3, 2): 3 rows, 2 columns
M23 = np.array([[1, 0, 2],
                [0, 1, 1]])            # shape (2, 3)

print("row  @ M32 ->", row @ M32, " shape", (row @ M32).shape)
print("M23 @ row  ->", M23 @ row, " shape", (M23 @ row).shape)
`,
          output: `row  @ M32 -> [4 5]  shape (2,)
M23 @ row  -> [7 5]  shape (2,)`,
          outputNote:
            "A length-3 row on the left needs a 3-row matrix on the right: (3,) @ (3, 2) -> (2,). The same vector on the right needs a 2-column matrix on the left: (2, 3) @ (3,) -> (2,).",
          explain: [
            "`row @ M32` — NumPy treats the 1-D vector as one row: it is consumed, and a length-2 row comes out.",
            "`M23 @ row` — now the same vector plays the role of a column: each row of M23 is dotted with it, and a length-2 result (one number per row) comes out.",
            "Neither product changed the data in the matrices — they wired inputs to outputs. That is the machine picture: vectors in, vectors out.",
          ],
        },
        {
          kind: "code",
          title: "Breaking the rule on purpose (learn the real error)",
          code: `import numpy as np

A = np.arange(6).reshape(2, 3)   # shape (2, 3): 3-long rows
B = np.arange(8).reshape(2, 4)   # shape (2, 4): only 2 rows

# inner dimensions: A's 3 vs B's 2 -- they cannot match
print(A @ B)
`,
          expectError:
            "ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 2 is different from 3)",
          outputNote:
            "This is the exact error numpy 2.0.2 produces. Read it like a shape complaint: operand 1 (the right-hand side) has a core dimension of size 2 where 3 was required — its first shape entry should have matched A's second.",
          explain: [
            "A is (2, 3); B is (2, 4). The inner pair is 3 (from A) and 2 (from B) — mismatch, so no product exists.",
            "The fix is a shape fix: either reshape/transpose B so it is (3, m), or slice A. The error names *operand 1* — the second operand, B.",
            "You will meet this error constantly with real data; today it becomes an old friend instead of a wall.",
          ],
        },
        {
          kind: "heading",
          text: "The do-nothing machine: the identity matrix",
        },
        {
          kind: "text",
          text: "Every machine has a neutral gear. For the matrix product it is the **identity matrix** — the square grid of zeros with ones down the diagonal, `np.eye(n)`, which you met in Lesson b-03 as a constructor. Multiplying anything by a matching identity changes nothing: it is the 1 of matrix algebra. That property makes it the perfect thing to test an inverse against later in this part, and the perfect sanity check that your machine wiring is right.",
        },
        {
          kind: "code",
          title: "Identity: the product that changes nothing",
          code: `import numpy as np

I = np.eye(3)
T = np.array([[ 1,  2,  3],
              [ 4,  5,  6],
              [ 7,  8,  9]])

print(I)
print("I @ T == T :", np.array_equal(I @ T, T))
print("T @ I == T :", np.array_equal(T @ I, T))
`,
          output: `[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
I @ T == T : True
T @ I == T : True`,
          outputNote:
            "On the left or on the right, the identity returns its partner untouched — matrix multiplication's version of multiplying by 1.",
          explain: [
            "`np.eye(3)` builds the 3x3 identity: ones on the diagonal, zeros elsewhere.",
            "`I @ T` and `T @ I` both equal T exactly — no floating-point noise here, because multiplying by 0 and 1 is exact.",
            "The identity must match its partner's shape on the relevant side: for T of shape (3, 3), that is eye(3).",
          ],
        },
        {
          kind: "arrayViz",
          title: "A matrix whose rows and columns are both stories",
          mode: "explore",
          name: "shop",
          caption:
            "Three regions (rows) x three business levers (columns). Click around and notice: a matrix ROW is a vector — one region's full profile ('ad spend, price, support tickets'). A matrix COLUMN is also a vector — one lever's value across all regions. Matrix multiplication is exactly the art of combining rows from the left matrix with columns from the right one.",
          data: [
            [120, 39, 8],
            [95, 35, 6],
            [140, 42, 9],
          ],
          labels: {
            rows: ["North", "South", "East"],
            cols: ["ad spend", "price", "support"],
          },
          dtype: "int64",
        },
        {
          kind: "heading",
          text: "np.dot vs np.matmul: the honest comparison",
        },
        {
          kind: "text",
          text: "NumPy has two names for closely related products, and folklore says 'they are the same'. The honest version: **on 2-D arrays they are identical**; **on 1-D vectors both compute the inner product** (a plain scalar — no shape gymnastics); **on 3-D and beyond they genuinely differ**. `@` / `np.matmul` treats leading dimensions as a *batch* of matrices and multiplies pair by pair. `np.dot` instead computes a sum product over the last axis of the first operand and the second-to-last axis of the second — which is a different (and rarely wanted) thing when both operands are stacks.",
        },
        {
          kind: "code",
          title: "Where dot and matmul agree — and where they part ways",
          code: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])
A = np.array([[1, 2], [3, 4]])
B = np.array([[10, 20], [30, 40]])

# 1-D: the inner product -- one scalar, no shape change
print("np.dot(a, b)         :", np.dot(a, b), " shape", np.dot(a, b).shape)

# 2-D: dot and matmul agree exactly
print("dot == matmul on 2-D :", np.array_equal(np.dot(A, B), A @ B))

# 3-D: matmul batches over the leading axis; dot does NOT
X = np.ones((2, 3, 4))
Y = np.ones((2, 4, 5))
print("matmul:", (X @ Y).shape, "  dot:", np.dot(X, Y).shape)
`,
          output: `np.dot(a, b)         : 32.0  shape ()
dot == matmul on 2-D : True
matmul: (2, 3, 5)   dot: (2, 3, 2, 5)`,
          outputNote:
            "On 1-D both return the scalar 32.0. On 2-D they are equal. On 3-D, matmul gives (2, 3, 5) — two 3x4-by-4x5 products — while dot gives (2, 3, 2, 5), a single contraction over the last/second-to-last axes.",
          explain: [
            "`np.dot(a, b)` = 1*4 + 2*5 + 3*6 = 32.0, with shape () — a true scalar, the length-3 vector consumed.",
            "For 2-D operands, `np.dot(A, B)` and `A @ B` compute the same matrix product, element for element.",
            "For stacks, `X @ Y` multiplies X[0] with Y[0] and X[1] with Y[1] — a batch of two (3, 4) @ (4, 5) products — giving (2, 3, 5). `np.dot(X, Y)` contracts the last axis of X (4) with the *second-to-last* of Y (4) and keeps everything else: shape (2, 3, 2, 5). Same sizes going in, very different operation coming out.",
          ],
        },
        {
          kind: "text",
          text: "The two operators of this lesson each earn a full reference card. Read them like documentation — because that is what they are, and every example output on them is machine-verified against the exact NumPy build running in your playground.",
        },
        {
          kind: "functionDoc",
          name: "np.matmul",
          purpose: "Multiply two arrays as matrices — each output cell is a row-of-the-left dotted with a column-of-the-right — with @ as its operator alias.",
          signature:
            "np.matmul(x1, x2, /, out=None, *, casting='same_kind', order='K', dtype=None, subok=True[, signature, axes, axis])",
          purposeDetail:
            "`np.matmul` exists because elementwise `*` can never combine a row with a column: it only ever pairs matching cells. The matrix product is how linear machines compose — the output of one becomes the input of the next — and matmul is NumPy's dedicated engine for it. It broadcasts over leading (batch) axes, treats 1-D operands as a single row or column as needed, and maps straight onto optimized BLAS routines, which is why whole neural-network layers reduce to one `@`. In practice you will nearly always type the operator `A @ B`; `np.matmul(A, B)` is the same call spelled out.",
          params: [
            {
              name: "x1",
              type: "array_like",
              required: true,
              description: "The left operand. Its last dimension (row length) must match x2's second-to-last dimension (height).",
              example: "A of shape (2, 3)",
            },
            {
              name: "x2",
              type: "array_like",
              required: true,
              description: "The right operand. For 2-D inputs it must be exactly as tall as x1 is wide; leading dimensions broadcast like Part G.",
              example: "B of shape (3, 4)",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "Optional pre-allocated output array to write the result into (advanced; leave it out).",
              example: "out=C",
            },
            {
              name: "dtype",
              type: "dtype or None",
              description: "Force the result's dtype instead of the natural promotion of the inputs.",
              example: "dtype=np.float64",
            },
          ],
          returns: {
            type: "ndarray",
            description: "The matrix product. For pure 2-D inputs: (n, k) @ (k, m) -> (n, m). For 1-D @ 1-D: a scalar. For stacks: one product per batch element.",
          },
          example: `import numpy as np

A = np.array([[1, 2],
              [3, 4]])
B = np.array([[10, 20, 30],
              [40, 50, 60]])
print("(2, 2) @ (2, 3) ->", np.matmul(A, B).shape)
print(A @ B)

row = np.array([1, 2, 3])
M = np.array([[1, 0],
              [0, 1],
              [1, 1]])
print("row @ M ->", np.matmul(row, M))

X = np.ones((2, 3, 4))
Y = np.ones((2, 4, 5))
print("batched ->", np.matmul(X, Y).shape)
`,
          exampleOutput: `(2, 2) @ (2, 3) -> (2, 3)
[[ 90 120 150]
 [190 260 330]]
row @ M -> [4 5]
batched -> (2, 3, 5)`,
          commonMistakes: [
            {
              mistake: "Typing A * B where A @ B was meant.",
              why: "When shapes happen to match, * succeeds elementwise and returns plausible-looking garbage — the worst kind of bug, because nothing crashes.",
              fix: "Say the sentence before you type the operator: 'combine machines' means @; 'scale cells' means *. A quick (A @ B).shape check catches most slips.",
            },
            {
              mistake: "Ignoring the inner-dimension rule and being surprised by a long ValueError.",
              why: "matmul is a gufunc with signature (n?,k),(k,m?)->(n?,m?); the error text is that signature complaining that k did not line up.",
              fix: "Write the two shapes on paper before multiplying: (n, k) @ (k, m). If the middle numbers differ, reshape or transpose one side first.",
            },
            {
              mistake: "Assuming np.dot and np.matmul are interchangeable on stacked data.",
              why: "On 3-D inputs dot contracts the last axis of x1 with the second-to-last of x2 — a different operation than matmul's per-batch product, with a different output shape.",
              fix: "For batches of matrices, use @ / np.matmul. Reach for np.dot when you specifically want its documented axis behavior.",
            },
          ],
          related: [
            { name: "np.dot", relation: "The older, broader product: identical to matmul on 2-D, an inner product on 1-D, but no batch semantics on 3-D+." },
            { name: "np.linalg.solve", relation: "Solves A @ x = b for x directly — usually what you want instead of multiplying by an inverse (Lesson h-03)." },
            { name: "operator @", relation: "A @ B is np.matmul(A, B) spelled the way the whole ecosystem writes it." },
            { name: "np.linalg.matrix_power", relation: "Repeated @ of a square matrix with itself, computed smartly (Lesson h-04)." },
          ],
          applications: [
            "A neural-network layer forward pass: outputs = inputs @ W + b, one line per layer",
            "Transforming a whole stack of 2-D points (rotations, reflections, projections) in a single product",
            "Batch-scoring many samples against many weight matrices at once by letting matmul broadcast the batch axes",
          ],
          notes:
            "matmul dispatches to optimized BLAS libraries (OpenBLAS, MKL) under the hood, which is why one @ on large matrices can be thousands of times faster than a Python triple loop. 1-D operands are promoted to a row or column as needed and demoted afterwards, so (3,) @ (3,) returns a scalar, not a (1, 1) matrix.",
        },
        {
          kind: "functionDoc",
          name: "np.dot",
          purpose: "NumPy's original product: the inner product for 1-D operands, the matrix product for 2-D, and a sum-product over the last axis of a and the second-to-last of b beyond that.",
          signature: "np.dot(a, b, out=None)",
          purposeDetail:
            "`np.dot` predates the `@` operator by decades and carries three behaviors under one name. For 1-D vectors it is the inner product — multiply matching entries and add, returning one scalar. For 2-D matrices it is exactly the matrix product, identical to `@`. For anything higher-dimensional it follows a general rule — contract the last axis of a with the second-to-last axis of b — which is *not* batched matrix multiplication. Knowing all three faces is what lets you read older scientific code (where dot is everywhere) correctly, while writing your own new code with the clearer `@`.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "First operand. Its last axis is the one that gets contracted (paired and summed away) with b's second-to-last axis.",
              example: "np.array([1.0, 2.0, 3.0])",
            },
            {
              name: "b",
              type: "array_like",
              required: true,
              description: "Second operand. For 1-D a, b must have the same length; for 2-D a, b's height must equal a's width.",
              example: "np.array([[10, 20], [30, 40]])",
            },
            {
              name: "out",
              type: "ndarray or None",
              description: "Optional output buffer of exactly the expected result shape (advanced; leave it out).",
              example: "out=result",
            },
          ],
          returns: {
            type: "ndarray or scalar",
            description: "A scalar for 1-D dot 1-D; the (n, m) matrix product for 2-D dot 2-D; for higher dimensions, a shape built from a's leading axes + b's axes except its second-to-last.",
          },
          example: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])
print("1-D inner product:", np.dot(a, b))

A = np.array([[1, 2], [3, 4]])
B = np.array([[10, 20], [30, 40]])
print("2-D equals matmul:", np.array_equal(np.dot(A, B), A @ B))

X = np.ones((2, 3, 4))
Y = np.ones((2, 4, 5))
print("matmul on stacks:", (X @ Y).shape)
print("dot on stacks   :", np.dot(X, Y).shape)
`,
          exampleOutput: `1-D inner product: 32.0
2-D equals matmul: True
matmul on stacks: (2, 3, 5)
dot on stacks   : (2, 3, 2, 5)`,
          commonMistakes: [
            {
              mistake: "Expecting np.dot to batch-multiply stacks of matrices.",
              why: "dot's N-D rule contracts the last axis of a with the second-to-last of b — for (2, 3, 4) and (2, 4, 5) that yields (2, 3, 2, 5), not matmul's (2, 3, 5).",
              fix: "Use @ (or np.matmul) for batched matrix products; treat np.dot as a 1-D/2-D tool.",
            },
            {
              mistake: "Being surprised the 1-D result is a bare scalar with shape ().",
              why: "The inner product consumes both vectors completely: there are no axes left, so the result is a 0-d scalar — printing as 32.0, not [32.0].",
              fix: "Expect a scalar. If downstream code needs a 1-element array, wrap deliberately: np.atleast_1d(np.dot(a, b)).",
            },
            {
              mistake: "Writing np.dot(A, B) when the elementwise product was meant.",
              why: "np.dot never does elementwise multiplication; on square-ish shapes it silently computes a matrix product instead of erroring.",
              fix: "Elementwise is A * B. Make the operator choice a conscious sentence, not a reflex.",
            },
          ],
          related: [
            { name: "np.matmul", relation: "The modern matrix product with proper batch semantics — prefer it (via @) for anything 3-D and up." },
            { name: "np.vdot", relation: "Like dot for flat vectors, but flattens its arguments completely and conjugates the first if complex (Lesson h-02)." },
            { name: "np.inner", relation: "Contracts the last axes of both operands instead of last-with-second-to-last." },
            { name: "np.tensordot", relation: "The fully general contraction: you choose which axes to sum over." },
          ],
          applications: [
            "Weighted sums: one vector of quantities, one vector of prices, one scalar total",
            "The numerator of cosine similarity between two embedding vectors (Lesson h-02)",
            "Reading and porting decades of existing scientific Python, where np.dot is everywhere",
          ],
          notes:
            "In new code, prefer @ for matrix products: it states the intent unambiguously and extends correctly to batches. np.dot remains essential for reading older codebases and for the plain inner product.",
        },
        {
          kind: "heading",
          text: "A matrix is a function: rotate the plane",
        },
        {
          kind: "text",
          text: "Here is the picture that makes the whole part click. A 2x2 matrix is a machine that takes a 2-D point and returns a new 2-D point: `p_out = p_in @ R`. Feed the machine a *stack* of points — a (4, 2) array — and it processes all four in one product. The classic example is a **rotation matrix**: it turns every point around the origin by a fixed angle. For a 30-degree counter-clockwise turn, the machine's two rows are just `[cos(30), sin(30)]` and `[-sin(30), cos(30)]`.",
        },
        {
          kind: "code",
          title: "Four points, one matrix, one product",
          code: `import numpy as np

theta = np.deg2rad(30)                     # 30 degrees, in radians
c, s = np.cos(theta), np.sin(theta)
R = np.array([[  c, s],
              [ -s, c]])                   # rotates ROW vectors by 30 degrees

points = np.array([[ 1.0,  0.0],           # east
                   [ 0.0,  1.0],           # north
                   [-1.0,  0.0],           # west
                   [ 0.0, -1.0]])          # south

rotated = points @ R                       # four rotations in ONE product
print(np.round(rotated, 3))
`,
          output: `[[ 0.866  0.5  ]
 [-0.5    0.866]
 [-0.866 -0.5  ]
 [ 0.5   -0.866]]`,
          outputNote:
            "East [1, 0] lands on [0.866, 0.5] — exactly (cos 30, sin 30). Every point moved the same 30 degrees, and no Python loop ever ran.",
          explain: [
            "`R` is the machine; each row of `points` is an input; `points @ R` runs all four inputs through it at once — shape (4, 2) @ (2, 2) -> (4, 2).",
            "The point [1, 0] comes back as [0.866, 0.5]: cos(30) and sin(30), rounded to three decimals — trigonometry you can verify by hand.",
            "Swap in a different theta and the same code rotates by any angle; swap in a different R and the same code reflects, shears, or scales. Same wiring, different machine.",
          ],
        },
        {
          kind: "tryIt",
          title: "Wire the machines yourself",
          task:
            "Run the starter, then: (1) predict both output shapes on paper BEFORE looking at the prints; (2) change B to a (2, 3) matrix so B @ A works instead — predict its shape too; (3) try A * B and read the broadcasting error NumPy gives you — is it the same error @ gives for mismatched inner dimensions?",
          code: `import numpy as np

A = np.array([[1, 2, 0],
              [0, 1, 3]])
B = np.array([[2, 1],
              [1, 0],
              [0, 4]])

print("A is", A.shape, " B is", B.shape)
print("A @ B is", (A @ B).shape)
print(A @ B)
print("B @ A is", (B @ A).shape)
print(B @ A)
`,
          hint: "Write the shapes as (n, k) and (k, m) pairs on paper. A @ B: (2, 3) @ (3, 2). B @ A: (3, 2) @ (2, 3). The middle numbers decide everything.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "A matrix is a machine that turns vectors into vectors. * pairs cells; @ composes machines. The inner dimensions must match: (n, k) @ (k, m) -> (n, m). Identity is the do-nothing machine, and one @ can run a whole stack of inputs through the machine at once.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Where this goes next",
          text: "Every layer of a neural network is `outputs = inputs @ W` — literally the rotation-demo wiring with a bigger W. Lessons h-02 and h-03 build the vocabulary machines speak (lengths and angles), then h-04 opens up the machines themselves.",
        },
      ],
      terms: [
        { term: "Matrix product (matmul)", definition: "The composition product @: each output cell is a row of the left operand dotted with a column of the right operand." },
        { term: "Inner dimensions", definition: "The touching shape entries in (n, k) @ (k, m). They must match or the product does not exist; the outer entries become the result's shape." },
        { term: "Identity matrix", definition: "The square matrix np.eye(n) with ones on the diagonal: the neutral element of the matrix product. I @ A == A @ I == A." },
        { term: "Batched matmul", definition: "matmul's behavior on N-D operands: leading axes are treated as a batch, and matching batch elements are multiplied pairwise (broadcasting like Part G on the leading axes)." },
        { term: "Rotation matrix", definition: "A 2x2 matrix built from cos and sin of an angle that rotates every point around the origin when applied with @." },
      ],
      mistakes: [
        {
          mistake: "Using * where @ was meant (or vice versa).",
          why: "When shapes coincide, both operators succeed and return different, plausible-looking numbers — a silent-wrong-answer bug, not a crash.",
          fix: "Choose the operator with a sentence: 'compose machines / rows times columns' -> @; 'pair matching cells / scale' -> *. Glance at the result shape as a cheap tripwire.",
        },
        {
          mistake: "Reading (n, k) @ (k, m) as 'rows of the right match rows of the left'.",
          why: "The rule pairs the second entry of the left shape with the FIRST entry of the right shape — the two middle numbers. Mixing this up makes every shape prediction backwards.",
          fix: "Write both shapes down and circle the middle pair before multiplying. With practice the glance becomes instant.",
        },
        {
          mistake: "Assuming np.dot and np.matmul are the same function in disguise.",
          why: "They agree on 1-D and 2-D, but on stacks dot contracts different axes and returns a different shape — (2, 3, 2, 5) where matmul gives (2, 3, 5).",
          fix: "New code: use @. When reading old code, check the dimensionality before assuming what np.dot did.",
        },
        {
          mistake: "Believing 1-D vectors have an inherent row-or-column identity.",
          why: "NumPy promotes a 1-D operand to whatever the product needs (row on the left, column on the right), so the same vector plays both roles.",
          fix: "Think of 1-D arrays as pure sequences whose orientation is decided by position in the product — or be explicit with reshape(1, -1) / reshape(-1, 1) when orientation matters.",
        },
      ],
      takeaways: [
        "* is elementwise, always; @ is the matrix product, always. Choosing between them is choosing between pairing cells and composing machines.",
        "The one shape law: (n, k) @ (k, m) -> (n, m). Inner dimensions must match; the mismatch error names the offending operand and the size it found.",
        "The identity matrix np.eye(n) is the 1 of matrix multiplication: I @ A == A @ I == A.",
        "np.dot == np.matmul on 2-D and both give the scalar inner product on 1-D — but on 3-D+ matmul batches (leading axes pairwise) while dot contracts last-with-second-to-last.",
        "A matrix is a function: p @ R transforms a whole stack of points in one product — the exact wiring of a neural-network layer.",
      ],
      quiz: [
        {
          id: "h-01-q1",
          prompt: "A has shape (5, 3) and B has shape (3, 2). What is the shape of A @ B?",
          options: [
            { text: "(5, 2)", correct: true, feedback: "Correct: inner dimensions 3 and 3 match, so the outer survivors 5 and 2 become the result's shape." },
            { text: "(3, 3)", correct: false, feedback: "That would keep the inner numbers — but the whole point is that the matched inner pair is summed away." },
            { text: "(5, 3)", correct: false, feedback: "That is A's own shape; a product with a (3, 2) cannot return a (5, 3)." },
            { text: "The product raises an error", correct: false, feedback: "No: the inner numbers are 3 (from A) and 3 (from B) — they match, so the product is defined." },
          ],
          explanation: "(5, 3) @ (3, 2): the middle 3s cancel, leaving (5, 2). Read shapes as outer-survive, inner-must-match.",
        },
        {
          id: "h-01-q2",
          prompt: "You compute C = A * B on two (3, 3) arrays, but the math you wanted was the matrix product. What happens?",
          options: [
            { text: "NumPy raises an error because * is not defined for matrices", correct: false, feedback: "* is defined for any broadcast-compatible shapes — and two (3, 3) arrays are perfectly compatible elementwise." },
            { text: "It runs and returns the elementwise product — wrong numbers, no crash", correct: true, feedback: "Correct — and that is what makes it dangerous: plausible-looking garbage instead of an error." },
            { text: "It runs and returns the matrix product — * and @ are synonyms", correct: false, feedback: "They are not synonyms: * pairs matching cells; @ combines rows with columns. Only their inputs look similar." },
            { text: "It runs but returns a scalar", correct: false, feedback: "A scalar only happens for the 1-D inner product; elementwise (3, 3) * (3, 3) stays (3, 3)." },
          ],
          explanation: "Silent wrong answers are worse than crashes. Decide with a sentence — 'pair cells' vs 'compose machines' — before choosing the operator.",
        },
        {
          id: "h-01-q3",
          prompt: "X has shape (2, 3, 4) and Y has shape (2, 4, 5). What do (X @ Y).shape and np.dot(X, Y).shape return?",
          options: [
            { text: "Both (2, 3, 5)", correct: false, feedback: "That is matmul's answer only — dot has its own N-D rule and it is not batching." },
            { text: "matmul: (2, 3, 5); dot: (2, 3, 2, 5)", correct: true, feedback: "Correct: matmul multiplies each batch element (a (3, 4) by a (4, 5)) giving (2, 3, 5); dot contracts X's last axis with Y's second-to-last and keeps every other axis: (2, 3, 2, 5)." },
            { text: "matmul: (2, 3, 5); dot raises an error", correct: false, feedback: "dot does not error — its contraction rule happens to be satisfiable here (4 vs 4), it just computes a different thing." },
            { text: "Both raise errors — batched matmul needs matching batch shapes", correct: false, feedback: "The batch shapes (both 2) do match here; and even a lone 2-D right operand would broadcast across the batch." },
          ],
          explanation: "On stacks, @ batches and dot contracts: same inputs, two different operations, two different output shapes.",
        },
      ],
    },

    // ------------------------------------------------------------- h-02
    {
      slug: "h-02",
      title: "Dot Products, Norms and Angles",
      minutes: 14,
      summary:
        "One multiplication and one square root power all of similarity search: the dot product measures agreement, the norm measures length, and together they give cosine similarity — the exact primitive behind embedding retrieval, plus projections and distances along the way.",
      kind: "concept",
      objectives: [
        "Compute the inner product of two vectors with @ / np.dot and explain it as 'multiply matching entries, then add'",
        "Measure vector length with np.linalg.norm under its default (L2), ord=1 and ord=np.inf, the Frobenius norm on matrices, and per-row norms with axis=",
        "Build a unit vector (v / norm) and explain why direction and length are separable",
        "Compute cosine similarity between two count vectors and interpret the number, including the 0 of orthogonality",
        "Use dot products for projection and norms for distance — the two moves behind nearest-neighbor search",
      ],
      why: "Type a sentence into a search engine and embeddings turn it into a vector; the engine then finds similar texts with — quite literally — the dot product and the norm. The same two tools give recommendation engines their 'users that agree', nearest-neighbor models their distances, and machine learning its loss functions. This lesson makes those two tools concrete: you will compute the inner product three ways, tour the norm family, build unit vectors, and derive cosine similarity yourself on small word-count vectors. When a recruiter asks what powers vector search, you will have run the primitive with your own hands, not just heard its name.",
      blocks: [
        {
          kind: "text",
          text: "Lesson h-01 made matrices machines. Before we can open the machines up (h-04) or solve with them (h-03), we need their fuel: two operations on plain vectors that carry more real-world weight per line of code than anything else in this course. The **dot product** asks *how much do these two vectors agree?* The **norm** asks *how long is this one?* Together they measure angles, project shadows, and rank search results.",
        },
        {
          kind: "heading",
          text: "The dot product: multiply, then add",
        },
        {
          kind: "text",
          text: "For two vectors of the same length, the **inner product** (dot product) is the cheapest meaningful combination there is: multiply matching entries, then add everything up. On 1-D arrays, `@`, `np.dot`, and the manual sum of an elementwise product all give the same scalar — verify all three:",
        },
        {
          kind: "code",
          title: "The inner product, three equivalent ways",
          code: `import numpy as np

a = np.array([1.0, 2.0, 3.0])     # quantities: 1, 2, 3 units
b = np.array([4.0, 5.0, 6.0])     # prices:    4, 5, 6 dollars

print("a @ b        :", a @ b)
print("np.dot(a, b) :", np.dot(a, b))
print("by hand      :", (a * b).sum())
`,
          output: `a @ b        : 32.0
np.dot(a, b) : 32.0
by hand      : 32.0`,
          outputNote:
            "1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32.0 — the total cost of the order. One multiply, one add: that is the whole operation.",
          explain: [
            "`a @ b` — for 1-D operands, @ is defined as the inner product (Lesson h-01's comparison), so this is a scalar, not a matrix.",
            "`np.dot(a, b)` — the classic spelling; identical result on 1-D inputs.",
            "`(a * b).sum()` — the operation unrolled: elementwise products [4, 10, 18], then one sum. When you can see it both ways, bugs stop hiding.",
          ],
        },
        {
          kind: "text",
          text: "Why 'agreement'? Because each entry multiplies the other vector's entry in the same position. Where both vectors are big together, the product is big and positive. Where one is positive and the other negative, the contribution is negative — disagreement. A dot product near zero means the arguments cancel each other out: indifference. Keep that reading in mind and the rest of the lesson is bookkeeping.",
        },
        {
          kind: "arrayViz",
          title: "Documents as rows — every row is a vector",
          mode: "explore",
          name: "counts",
          caption:
            "A tiny document-term matrix: rows are documents, columns are words (numpy, math, art, the), cells are counts. Each ROW is a document vector — its direction is its topic. Click a row and think of it as one point in 4-D 'word space'; cosine similarity in a moment will measure the angle between two such points.",
          data: [
            [3, 2, 0, 1],
            [1, 0, 4, 1],
            [2, 3, 1, 2],
          ],
          labels: {
            rows: ["NumPy tutorial", "art essay", "math lecture"],
            cols: ["numpy", "math", "art", "the"],
          },
          dtype: "int64",
        },
        {
          kind: "heading",
          text: "Length: the norm family",
        },
        {
          kind: "text",
          text: "How long is a vector? The everyday answer is the Euclidean length — the straight-line distance from the origin — and that is `np.linalg.norm`'s default. But 'length' has useful cousins: `ord=1` (add absolute values — total variation, taxicab distance) and `ord=np.inf` (the single largest absolute entry — the bottleneck). Same function, different notion of size. On a matrix, the default is the **Frobenius norm**: treat the whole grid as one long vector and take its Euclidean length. And `axis=` gives per-row (or per-column) norms instead of one grand total — the Part E pattern, now with its proper tool.",
        },
        {
          kind: "functionDoc",
          name: "np.linalg.norm",
          purpose: "Measure the size of a vector or matrix: Euclidean length by default, other notions with ord=, per-axis with axis=.",
          signature: "np.linalg.norm(x, ord=None, axis=None, keepdims=False)",
          purposeDetail:
            "One function covers every notion of 'how big' you will meet: the default L2 length (square root of the sum of squares), the L1 sum of absolute values, the L-infinity maximum, and the Frobenius norm for whole matrices. Norms are the distance in every distance computation and the denominator in every normalization — Lesson e-02's distance matrix was built from exactly this function applied to differences, and cosine similarity (this lesson) needs it twice per pair.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The vector (or matrix) to measure. For ord-variants on vectors, any length; for matrices, ord= selects among matrix norms.",
              example: "np.array([3.0, -4.0, 0.0])",
            },
            {
              name: "ord",
              type: "int, float or inf",
              description: "Which notion of size: None (default) is Euclidean L2; 1 is the sum of absolute values; np.inf is the maximum absolute value; 2 on a matrix is its largest singular value.",
              example: "ord=1 or ord=np.inf",
            },
            {
              name: "axis",
              type: "int or tuple of ints or None",
              description: "Reduce along this axis (per-row with axis=1, per-column with axis=0) instead of measuring the whole array at once.",
              example: "axis=1",
            },
            {
              name: "keepdims",
              type: "bool",
              description: "Keep the reduced axes as size-1 dimensions so the result broadcasts cleanly back against the input.",
              example: "keepdims=True",
            },
          ],
          returns: {
            type: "float or ndarray",
            description: "A single number when axis is None; otherwise an array with one norm per slice along the given axis.",
          },
          example: `import numpy as np

v = np.array([3.0, -4.0, 0.0])
print("L2 (default):", np.linalg.norm(v))
print("L1          :", np.linalg.norm(v, ord=1))
print("L-inf       :", np.linalg.norm(v, ord=np.inf))

M = np.array([[1.0, -2.0],
              [3.0,  0.0]])
print("matrix default (Frobenius):", np.round(np.linalg.norm(M), 4))
print("per-row norms (axis=1):", np.round(np.linalg.norm(M, axis=1), 4))
print("per-column norms (axis=0):", np.round(np.linalg.norm(M, axis=0), 4))
`,
          exampleOutput: `L2 (default): 5.0
L1          : 7.0
L-inf       : 4.0
matrix default (Frobenius): 3.7417
per-row norms (axis=1): [2.2361 3.    ]
per-column norms (axis=0): [3.1623 2.    ]`,
          commonMistakes: [
            {
              mistake: "Expecting np.linalg.norm(matrix) to be the operator 2-norm (largest singular value).",
              why: "For array input, the default ord is None, which for matrices means the Frobenius norm — the sqrt of the sum of ALL squared entries — a different, usually smaller idea of size.",
              fix: "Frobenius is what you get by default; if you specifically want the spectral 2-norm, pass ord=2 (and know it equals the largest singular value, Lesson h-04).",
            },
            {
              mistake: "Forgetting axis= and collapsing a whole matrix to one number.",
              why: "Calling norm on a (1000, 384) embedding stack without axis= returns a single Frobenius total — not the 1000 per-row lengths you wanted.",
              fix: "Pass axis=1 for one norm per row (the usual embedding shape), axis=0 for one per column.",
            },
            {
              mistake: "Dividing by the norm of a zero vector.",
              why: "The zero vector's norm is 0, so v / norm(v) divides by zero and produces inf/nan entries that silently poison everything downstream.",
              fix: "Guard it: norms = np.linalg.norm(V, axis=1, keepdims=True); safe = np.where(norms == 0, 1.0, norms).",
            },
          ],
          related: [
            { name: "np.vdot", relation: "The inner product underneath: for real vectors, norm(v) is sqrt(vdot(v, v))." },
            { name: "np.linalg.svd", relation: "The matrix 2-norm (ord=2) equals the largest singular value, which svd hands you directly (Lesson h-04)." },
            { name: "np.abs", relation: "The L1 and L-inf norms are np.abs(v).sum() and np.abs(v).max() in disguise." },
          ],
          applications: [
            "The denominator of cosine similarity and of every unit-vector normalization",
            "Distance between vectors as norm(p - q) — the engine of nearest-neighbor search and the e-02 distance matrix",
            "Per-row norms of an embedding stack to normalize a whole batch at once",
          ],
          notes:
            "norm is one of the few NumPy functions living in np.linalg (the linear-algebra subpackage) rather than the main namespace — the same subpackage that hosts solve, eig and svd in the rest of this part.",
        },
        {
          kind: "code",
          title: "The norm family on one vector and one matrix",
          code: `import numpy as np

v = np.array([3.0, -4.0, 0.0])
print("L2 (default) :", np.linalg.norm(v))
print("L1           :", np.linalg.norm(v, ord=1))
print("L-inf        :", np.linalg.norm(v, ord=np.inf))

M = np.array([[1.0, -2.0],
              [3.0,  0.0]])
print("matrix default (Frobenius):", np.round(np.linalg.norm(M), 4))
print("per-row norms (axis=1):", np.round(np.linalg.norm(M, axis=1), 4))
`,
          output: `L2 (default) : 5.0
L1           : 7.0
L-inf        : 4.0
matrix default (Frobenius): 3.7417
per-row norms (axis=1): [2.2361 3.    ]`,
          outputNote:
            "The 3-4-0 vector: L2 = 5.0 (the classic 3-4-5 triangle), L1 = 3+4+0 = 7.0, L-inf = 4.0 (the largest single entry). The matrix's default is Frobenius; axis=1 hands back one length per row.",
          explain: [
            "L2 = sqrt(9 + 16 + 0) = 5.0 — straight-line distance from the origin, the default notion of length.",
            "L1 = 7.0 — total distance if you may only walk along axes (taxicab). L-inf = 4.0 — the single worst coordinate.",
            "The matrix's Frobenius norm is sqrt(1 + 4 + 9 + 0) = sqrt(14) = 3.7417: the whole grid measured as one flat vector. With axis=1 each row gets its own length instead: sqrt(5) and 3.0.",
          ],
        },
        {
          kind: "heading",
          text: "Unit vectors: direction without length",
        },
        {
          kind: "text",
          text: "Divide any nonzero vector by its own norm and you get a **unit vector**: same direction, length exactly 1. This one move separates *what a vector points at* from *how loud it shouts*. Search engines care about direction (is this document about the topic?) far more than raw length (did it just use more words?) — which is why normalizing to unit length is the standard first step in text similarity.",
        },
        {
          kind: "heading",
          text: "Cosine similarity: the angle between meanings",
        },
        {
          kind: "text",
          text: "Here is the payoff formula. The dot product grows when vectors agree, but it also grows when vectors are simply *longer*. Divide the agreement by both lengths and only the **angle** survives: **cosine similarity = (u @ v) / (norm(u) * norm(v))**. It runs from 1.0 (same direction) through 0.0 (perpendicular — **orthogonal**, nothing in common) to -1.0 (exactly opposite). Let us measure two tiny documents: word counts over the vocabulary [numpy, math, art, the].",
        },
        {
          kind: "code",
          title: "How similar is a tutorial to an essay?",
          code: `import numpy as np

tutorial = np.array([3.0, 2.0, 0.0, 1.0])   # "numpy numpy numpy math math the"
essay    = np.array([1.0, 0.0, 4.0, 1.0])   # "numpy art art art art the"

def cosine(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

print("cosine(tutorial, essay) =", round(cosine(tutorial, essay), 3))
print("cosine(tutorial, itself) =", round(cosine(tutorial, tutorial), 3))

e1, e2 = np.array([1.0, 0.0]), np.array([0.0, 1.0])
print("orthogonal pair (dot)   =", e1 @ e2)
`,
          output: `cosine(tutorial, essay) = 0.252
cosine(tutorial, itself) = 1.0
orthogonal pair (dot)   = 0.0`,
          outputNote:
            "The two documents share only the words 'numpy' and 'the', so their cosine is a cool 0.252 — some common ground, not much. A vector with itself scores exactly 1.0, and perpendicular axes dot to exactly 0.0.",
          explain: [
            "The numerator counts shared vocabulary (numpy x1, the x1); both norms divide that agreement away so document *length* stops mattering.",
            "cosine(tutorial, essay) = 4 / (sqrt(14) * sqrt(18)) = 0.252: same direction would be 1.0, so these two texts point mostly apart.",
            "The [1, 0] and [0, 1] axes have nothing in common at any position: dot exactly 0.0 — orthogonality is the formal 'zero relationship'.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The ML connection, kept honest",
          text: "This exact function — divide a dot product by two norms — is the retrieval primitive of embedding search. Modern language models embed a query and every document as vectors; 'find similar' ranks by cosine. The vectors have 384, 768, or 1536 entries instead of 4, but the arithmetic on this page is the whole idea, unchanged.",
        },
        {
          kind: "heading",
          text: "Projection: how much of b points along u",
        },
        {
          kind: "text",
          text: "The dot product with a *unit* vector has a second reading: it is the **projection** — the length of the shadow one vector casts on the other's direction. Multiply the unit vector by that shadow length and you get the shadow itself as a vector. One worked example, using the tutorial direction from before:",
        },
        {
          kind: "code",
          title: "One projection, start to finish",
          code: `import numpy as np

essay    = np.array([1.0, 0.0, 4.0, 1.0])
tutorial = np.array([3.0, 2.0, 0.0, 1.0])

u = tutorial / np.linalg.norm(tutorial)     # unit vector: direction only

shadow_length = essay @ u                   # scalar: how much essay points along u
shadow_vector = shadow_length * u           # the projection itself

print("unit vector u      :", np.round(u, 4))
print("norm of u          :", np.round(np.linalg.norm(u), 4))
print("shadow length      :", round(shadow_length, 4))
print("shadow vector      :", np.round(shadow_vector, 4))
`,
          output: `unit vector u      : [0.8018 0.5345 0.     0.2673]
norm of u          : 1.0
shadow length      : 1.069
shadow vector      : [0.8571 0.5714 0.     0.2857]`,
          outputNote:
            "The tutorial direction becomes a unit vector of length 1.0; the essay casts a shadow of length 1.069 along it — the part of the essay that is 'about' the tutorial's topic mix.",
          explain: [
            "`u = tutorial / norm(tutorial)` — same direction, length 1.0 (printed to prove it).",
            "`essay @ u` = 1.069: the essay leans slightly *toward* the tutorial direction — mostly it points elsewhere (its 'art' count).",
            "`shadow_vector` is that scalar times u: the piece of the essay explained by the tutorial's direction. Recommendation engines reconstruct ratings from exactly these shadow pieces.",
          ],
        },
        {
          kind: "heading",
          text: "Distance: the norm of a difference",
        },
        {
          kind: "text",
          text: "How far apart are two vectors? Subtract them (one vector now points from one to the other) and take the norm. That is the Euclidean distance — the same move that built the pairwise distance matrix in Lesson e-02, now stated in one line:",
        },
        {
          kind: "code",
          title: "Distance in one line",
          code: `import numpy as np

p = np.array([1.0, 2.0, 3.0])
q = np.array([4.0, 6.0, 3.0])

print("difference p - q :", p - q)
print("distance         :", np.linalg.norm(p - q))
print("same by hand     :", np.sqrt(((p - q) ** 2).sum()))
`,
          output: `difference p - q : [-3. -4.  0.]
distance         : 5.0
same by hand     : 5.0`,
          outputNote:
            "The difference is [-3, -4, 0] — a 3-4-5 triangle in disguise — so the distance is 5.0, both by norm and by the explicit sum-of-squares route.",
          explain: [
            "`p - q` is the arrow from q to p; its L2 norm is the straight-line distance between the points.",
            "The by-hand line is the definition unrolled: square, sum, square root. norm is that line, compiled, named, and extended to every ord.",
            "Nearest-neighbor search is this line applied to every candidate at once — norm(q - queries, axis=1) over a stack of candidates.",
          ],
        },
        {
          kind: "text",
          text: "One more dot-product tool belongs in your kit: `np.vdot`, the flattening twin of np.dot. It earns its card mostly for one habit to know and one trap to avoid.",
        },
        {
          kind: "functionDoc",
          name: "np.vdot",
          purpose: "Flatten both arguments completely and return one scalar product — conjugating the first argument first when it is complex.",
          signature: "np.vdot(a, b)",
          purposeDetail:
            "`np.vdot` is the 'vector dot' — the total product of two arrays viewed as flat sequences, with no matrix semantics at all. Two behaviors distinguish it from np.dot: it flattens N-D inputs first (a 2x2 grid dots with another 2x2 as four paired entries), and for complex inputs it conjugates the FIRST argument, the convention physics and quantum mechanics write as the inner product of a bra with a ket. For real 1-D vectors it is simply the inner product you already know.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "First operand; flattened completely, and complex-conjugated entry by entry before multiplying.",
              example: "np.array([1.0, 2.0, 3.0])",
            },
            {
              name: "b",
              type: "array_like",
              required: true,
              description: "Second operand; flattened the same way. Must contain the same total number of elements as a.",
              example: "np.array([4.0, 5.0, 6.0])",
            },
          ],
          returns: {
            type: "scalar",
            description: "Always a single number (Python scalar): the sum of conjugate(a) times b over all entries. There is no array result, ever.",
          },
          example: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])
print("vdot(a, b)     :", np.vdot(a, b))

M = np.array([[1, 2],
              [3, 4]])
print("vdot(M, M)     :", np.vdot(M, M))
print("Frobenius norm :", np.round(np.linalg.norm(M), 4))

z = np.array([1 + 2j, 3 - 1j])
w = np.array([2 + 0j, 1 + 1j])
print("complex, conj a:", np.vdot(z, w))
`,
          exampleOutput: `vdot(a, b)     : 32.0
vdot(M, M)     : 30
Frobenius norm : 5.4772
complex, conj a: (4+0j)`,
          commonMistakes: [
            {
              mistake: "Expecting vdot to do matrix multiplication on matrices.",
              why: "The v in vdot is for vector: it flattens both inputs to 1-D first, so a (2, 2) @ (2, 2) product never happens — you get one scalar.",
              fix: "For matrix products use @. vdot is for total (Frobenius-style) pairings of two whole arrays.",
            },
            {
              mistake: "Forgetting the conjugate when the first argument is complex.",
              why: "vdot conjugates a, not b — the mathematical convention that makes vdot(z, z) real and non-negative (a squared length).",
              fix: "Order matters for complex inputs: vdot(a, b) conjugates a. For real arrays the conjugate is invisible and order does not matter.",
            },
          ],
          related: [
            { name: "np.dot", relation: "The general product: same as vdot for real 1-D inputs, but keeps matrix semantics for 2-D and contracts differently for N-D." },
            { name: "np.linalg.norm", relation: "For any real array, norm(x) == sqrt(vdot(x, x)) — the squared-length identity." },
            { name: "np.tensordot", relation: "The fully general contraction when you need custom axis pairings instead of a flat total." },
          ],
          applications: [
            "Frobenius inner products of two matrices (sum of entrywise products) in one call",
            "Quantum-style overlaps <a|b>, where the conjugate-first convention is required",
            "A quick sum of squares: vdot(x, x), the squared Euclidean length of any array",
          ],
          notes:
            "For real-valued 1-D vectors, vdot, np.dot and @ all return the same scalar — use whichever reads best. The differences only matter for matrices (flattening) and complex numbers (conjugation).",
        },
        {
          kind: "tryIt",
          title: "Rank the documents yourself",
          task:
            "Three documents, one vocabulary. Run the starter and find the most similar pair (the biggest number wins). Then: (1) add a fourth row describing what you did today and compute its similarity to all three; (2) divide a row by its norm to make it a unit vector, and check that cosine now equals a plain dot product with that unit vector.",
          code: `import numpy as np

docs = np.array([[3, 2, 0, 1],   # NumPy tutorial
                 [1, 0, 4, 1],   # art essay
                 [2, 3, 1, 2]])  # math lecture

def cosine(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

print("sim(tutorial, essay)  =", round(cosine(docs[0], docs[1]), 3))
print("sim(tutorial, lecture) =", round(cosine(docs[0], docs[2]), 3))
print("sim(essay, lecture)   =", round(cosine(docs[1], docs[2]), 3))
`,
          hint: "Predict before running: which pair shares the most vocabulary? For part (2): u = docs[0] / np.linalg.norm(docs[0]), then u @ docs[1] should match the cosine you already computed.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "The dot product measures agreement (multiply matching entries, add). The norm measures length (default: square root of the sum of squares). Divide agreement by both lengths and you get cosine similarity — pure angle, the retrieval primitive. Divide a vector by its own norm and you get its direction as a unit vector; subtract two vectors and take the norm and you get their distance.",
        },
      ],
      terms: [
        { term: "Inner product (dot product)", definition: "The scalar sum of matching-entry products of two same-length vectors: agreement measured in one number." },
        { term: "Norm", definition: "The length of a vector: L2 (default, Euclidean), L1 (sum of absolute values), L-inf (largest absolute entry); Frobenius for whole matrices." },
        { term: "Unit vector", definition: "A vector divided by its own norm: length exactly 1.0, direction unchanged." },
        { term: "Cosine similarity", definition: "(u @ v) / (norm(u) * norm(v)): the cosine of the angle between vectors, from 1.0 (same direction) through 0.0 (orthogonal) to -1.0 (opposite)." },
        { term: "Orthogonal", definition: "At right angles: dot product exactly 0 — the formal statement that two vectors share nothing." },
        { term: "Projection", definition: "The shadow of one vector along another's direction: (b @ u) * u for a unit vector u." },
      ],
      mistakes: [
        {
          mistake: "Computing cosine similarity but dividing by only one of the two norms.",
          why: "The result is no longer scale-free: doubling one vector's length would double the 'similarity', which the true cosine forbids.",
          fix: "Both norms, every time — or normalize both vectors to unit length once, then plain dot products are already cosines.",
        },
        {
          mistake: "Expecting np.linalg.norm on a matrix to return the operator 2-norm.",
          why: "The default for array input is the Frobenius norm — the sqrt of the sum of ALL squared entries — not the largest-singular-value notion from textbooks.",
          fix: "Use norm(M) for Frobenius (total magnitude) and norm(M, ord=2) when you truly want the spectral norm.",
        },
        {
          mistake: "Reading a dot product as similarity without thinking about lengths.",
          why: "A long vector dotted with almost anything can beat two short aligned vectors: the raw dot grows with both magnitudes as well as the angle.",
          fix: "When you mean 'do they point the same way', use cosine; when you mean 'how much total overlap', use the raw dot — and know which question you are asking.",
        },
        {
          mistake: "Normalizing without guarding against zero vectors.",
          why: "Dividing by norm 0.0 produces inf and nan entries that propagate silently into every later score.",
          fix: "Check or replace zero norms before dividing — one np.where turns the landmine off.",
        },
      ],
      takeaways: [
        "The inner product is 'multiply matching entries, add' — a @ b, np.dot(a, b) and (a * b).sum() all give the same scalar on 1-D arrays.",
        "np.linalg.norm defaults to Euclidean L2; ord=1 sums absolute values, ord=np.inf takes the max; matrices default to Frobenius; axis= gives per-row or per-column lengths.",
        "v / norm(v) is a unit vector: direction separated from loudness — the standard first step in text and embedding similarity.",
        "Cosine similarity = dot / (norm * norm): pure angle, immune to vector length, 0.0 exactly when vectors are orthogonal.",
        "Projection is a dot product with a unit vector; distance is the norm of a difference — together they are nearest-neighbor search.",
      ],
      quiz: [
        {
          id: "h-02-q1",
          prompt: "v = [3, -4, 0]. What are np.linalg.norm(v), norm(v, ord=1) and norm(v, ord=np.inf), in that order?",
          options: [
            { text: "5.0, 7.0, 4.0", correct: true, feedback: "Correct: L2 = sqrt(9+16) = 5 (the 3-4-5 triangle), L1 = 3+4+0 = 7, L-inf = the largest absolute entry, 4." },
            { text: "7.0, 5.0, 4.0", correct: false, feedback: "That swaps L1 and L2: 7 is the taxicab sum, 5 is the straight-line distance." },
            { text: "5.0, 4.0, 7.0", correct: false, feedback: "4 is the single largest entry (L-inf), not the L1; 7 is the L1 sum of absolute values." },
            { text: "25.0, 7.0, 4.0", correct: false, feedback: "25 is the SQUARED length; the norm takes the square root, giving 5.0." },
          ],
          explanation: "One vector, three notions of size: straight-line (5.0), taxicab (7.0), worst-coordinate (4.0). The default is the first.",
        },
        {
          id: "h-02-q2",
          prompt: "Two word-count vectors have cosine similarity 0.0. What does that mean?",
          options: [
            { text: "The documents are identical", correct: false, feedback: "Identical vectors have cosine exactly 1.0 — the maximum, not 0." },
            { text: "Their dot product is zero: they share no vocabulary in common positions — they are orthogonal", correct: true, feedback: "Correct: cosine 0 means the numerator (the dot product) is 0 — total disagreement, formalized as orthogonality." },
            { text: "One of the vectors is a zero vector", correct: false, feedback: "A zero vector makes cosine undefined (0/0), not zero — that is the guard-from-division mistake, not this." },
            { text: "The vectors point in exactly opposite directions", correct: false, feedback: "Opposite directions give cosine -1.0, the minimum. Zero is the neutral middle: perpendicular." },
          ],
          explanation: "Cosine 0 = orthogonal = zero dot product: nothing in common. The range is 1.0 (same direction) to -1.0 (opposite), with 0.0 the 'unrelated' middle.",
        },
        {
          id: "h-02-q3",
          prompt: "Why divide by norm(u) * norm(v) at all? What breaks without it?",
          options: [
            { text: "Nothing — it is just a convention that makes the maximum come out as 1", correct: false, feedback: "It does bound the result at 1, but the bound is a side effect of the real property: length-independence." },
            { text: "Without it, the score measures total agreement AND length together, so longer vectors win even when they point elsewhere", correct: true, feedback: "Correct: the raw dot grows with both magnitudes; dividing by both lengths leaves only the angle — scale-free similarity." },
            { text: "Without it, the computation is slower for large vectors", correct: false, feedback: "Two extra norms cost a little more, not less — performance is not the reason." },
            { text: "Without it, the result can be complex-valued", correct: false, feedback: "Real inputs give real dots; complexity has nothing to do with the normalization (only vdot's conjugate touches complex numbers)." },
          ],
          explanation: "Cosine similarity removes 'loudness' so only direction is compared — the exact property that makes a short document and a long one comparable.",
        },
      ],
    },

    // ------------------------------------------------------------- h-03
    {
      slug: "h-03",
      title: "Solving Systems: solve, inv and lstsq",
      minutes: 15,
      summary:
        "Solve A x = b the professional way with np.linalg.solve, meet the inverse (and learn when it is and is not the right tool), diagnose singular systems from their real error to det and rank, and fit a best line through over-determined data with lstsq — which is exactly what linear regression is.",
      kind: "concept",
      objectives: [
        "Solve a square system A x = b with np.linalg.solve and verify the solution with A @ x",
        "Explain why solve is preferred over inv(A) @ b (cost and stability), and when using inv is nonetheless fine",
        "Diagnose a singular system three ways: the real LinAlgError, a determinant of 0, and matrix_rank",
        "Use np.linalg.pinv as the always-works cousin for rank-deficient and rectangular matrices",
        "Fit the best line through over-determined data with np.linalg.lstsq and via the normal equations, and state the precise connection to linear regression",
      ],
      why: "'Two unknowns, two equations' is not a school artifact — it is the shape of calibration, pricing, circuit analysis, and the linear layer at the heart of every model. NumPy gives you one professional reflex: np.linalg.solve for square systems, np.linalg.lstsq when there is more data than unknowns. Knowing why you reach for those instead of a hand-rolled inverse is the difference between code that is fast and stable and code that amplifies floating-point noise into wrong answers. And the over-determined case is not a corner: least squares IS linear regression, stated exactly — so this lesson quietly teaches the most-used supervised-learning algorithm in history while wearing algebra clothing.",
      blocks: [
        {
          kind: "text",
          text: "A matrix machine takes a known input to a known output. The most useful question you can ask a machine runs backwards: *I know the output — what input produced it?* Write the machine as a matrix `A`, the output as a vector `b`, and the missing input as `x`, and you have the single most-studied equation in mathematics: **A x = b**.",
        },
        {
          kind: "heading",
          text: "Read A x = b as a machine with a missing input",
        },
        {
          kind: "text",
          text: "Concretely: two recipes mix two flours; you know the recipes (rows of A), you know the totals you must hit (b), and you want the flour amounts (x). Two equations, two unknowns — solve it in one call:",
        },
        {
          kind: "code",
          title: "One call, one exact answer",
          code: `import numpy as np

# 3a + 2b = 12
#  a + 2b =  8
A = np.array([[3.0, 2.0],
              [1.0, 2.0]])
b = np.array([12.0, 8.0])

x = np.linalg.solve(A, b)
print("a, b =", x)
print("check A @ x =", A @ x)
`,
          output: `a, b = [2. 3.]
check A @ x = [12.  8.]`,
          outputNote:
            "a = 2, b = 3 — and the check is the whole proof: feeding the solution back through the machine reproduces b exactly.",
          explain: [
            "`np.linalg.solve(A, b)` returns x such that A @ x == b (up to floating point, which allclose can verify).",
            "The check `A @ x` is the habit to keep: never trust a solution you have not run back through its machine.",
            "By hand: subtract the equations and 2a = 4, so a = 2; then b = 3. solve got there faster and generalizes to 1000 unknowns.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The design matrix: every row is one equation",
          mode: "explore",
          name: "A",
          caption:
            "The same A x = b idea wearing data clothes: this 6x2 matrix is the design matrix for the line fit later in this lesson — row k is the k-th equation, column 0 is the x value, column 1 is the constant 1 multiplying the intercept. Click a row and read it aloud as 'one day's constraint on the two unknowns slope and intercept'. A matrix of data and a matrix of equations are the same object.",
          data: [
            [1, 1],
            [2, 1],
            [3, 1],
            [4, 1],
            [5, 1],
            [6, 1],
          ],
          labels: {
            rows: ["day 1", "day 2", "day 3", "day 4", "day 5", "day 6"],
            cols: ["x (day)", "1 (intercept)"],
          },
          dtype: "float64",
        },
        {
          kind: "text",
          text: "The professional reflex deserves its reference card before we touch anything else — it is the default tool for every square, non-singular system you will ever meet.",
        },
        {
          kind: "functionDoc",
          name: "np.linalg.solve",
          purpose: "Solve a x = b for x exactly (up to floating point) without ever forming the inverse.",
          signature: "np.linalg.solve(a, b)",
          purposeDetail:
            "`solve` is NumPy's dedicated equation-cracker: give it a square matrix a and a right-hand side b, and it returns the x that makes a @ x equal b, using LU factorization under the hood. It is both cheaper and numerically stabler than computing inv(a) and multiplying — the same reason you simplify 3x = 12 by dividing rather than by computing the reciprocal of 3 to fifteen digits first. It also solves several systems at once: pass b with shape (n, k) and receive x with shape (n, k), one column of solutions per column of right-hand sides.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, n)",
              required: true,
              description: "The coefficient matrix — square and non-singular. If it is singular, solve raises LinAlgError instead of guessing.",
              example: "np.array([[3.0, 2.0], [1.0, 2.0]])",
            },
            {
              name: "b",
              type: "array_like, shape (n,) or (n, k)",
              required: true,
              description: "The right-hand side: one vector of n values, or n-by-k to solve k systems sharing the same a in one call.",
              example: "np.array([12.0, 8.0])",
            },
          ],
          returns: {
            type: "ndarray, shape (n,) or (n, k)",
            description: "The solution x, mirroring b's shape: a length-n vector, or an n-by-k array whose columns solve each system.",
          },
          example: `import numpy as np

A = np.array([[3.0, 2.0],
              [1.0, 2.0]])
b = np.array([12.0, 8.0])

x = np.linalg.solve(A, b)
print("solution      :", x)
print("verified      :", np.allclose(A @ x, b))

# two right-hand sides at once: solve both systems in one call
B = np.array([[12.0, 1.0],
              [ 8.0, 2.0]])
X = np.linalg.solve(A, B)
print("two solutions :")
print(X)
print("both verified :", np.allclose(A @ X, B))
`,
          exampleOutput: `solution      : [2. 3.]
verified      : True
two solutions :
[[ 2.   -0.5 ]
 [ 3.    1.25]]
both verified : True`,
          commonMistakes: [
            {
              mistake: "Solving with inv(A) @ b by habit.",
              why: "Forming the inverse costs more and loses more precision than the LU factorization solve performs directly — the extra work buys you extra error.",
              fix: "np.linalg.solve(A, b) is the reflex. The inverse is for when you genuinely need the inverse itself (change of basis, whitening).",
            },
            {
              mistake: "Passing a non-square or over-determined system to solve.",
              why: "solve requires a square a; a tall matrix (more equations than unknowns) has no exact solution anyway, and solve raises LinAlgError rather than pretending.",
              fix: "Square and exact: solve. More data than unknowns: np.linalg.lstsq (below). Rank-deficient: np.linalg.pinv.",
            },
            {
              mistake: "Giving b the wrong length or shape.",
              why: "b's first dimension must match a's; a length mismatch is reported as a shape error before any math happens.",
              fix: "Check a.shape == (n, n) and b.shape[0] == n before calling — or just let the error tell you, now that you can read it.",
            },
          ],
          related: [
            { name: "np.linalg.inv", relation: "Computes the inverse itself — what solve conveniently avoids needing; fine for small well-conditioned matrices when you need the inverse as an object." },
            { name: "np.linalg.lstsq", relation: "The over-determined sibling: finds the best-possible x when no exact solution exists." },
            { name: "np.linalg.pinv", relation: "The always-works cousin via SVD: handles singular and rectangular systems in least-squares style." },
          ],
          applications: [
            "Calibration: recover mixing ratios from measured totals (the recipe example)",
            "Solving the normal equations A.T @ A x = A.T @ b inside regression — which is exactly what this lesson does later",
            "Electrical networks and structural analysis, where equilibrium is one big sparse linear system",
          ],
          notes:
            "For huge sparse systems (millions of unknowns), scipy.sparse.linalg solvers take over — but the API habit (pass the matrix, get x) is identical to what you learned here.",
        },
        {
          kind: "heading",
          text: "The tempting detour: the inverse",
        },
        {
          kind: "text",
          text: "Algebra class taught you to solve A x = b by computing **A-inverse** and multiplying: x = inv(A) @ b. NumPy has it — `np.linalg.inv` — and it is worth knowing both why it works and why it is *not* the default tool. Multiplying by inv(A) undoes A, so the recipe is mathematically correct. But forming the inverse explicitly does more work and accumulates more floating-point error than solve's factorization approach; on badly conditioned matrices, that error becomes visible garbage. The professional rule: **use solve to solve; use inv only when you need the inverse itself as an object.**",
        },
        {
          kind: "code",
          title: "The inverse works — for small, well-conditioned matrices",
          code: `import numpy as np

A = np.array([[3.0, 2.0],
              [1.0, 2.0]])
A_inv = np.linalg.inv(A)

print("inv(A) =")
print(A_inv)
print("A @ inv(A) ~ I :", np.allclose(A @ A_inv, np.eye(2)))

b = np.array([12.0, 8.0])
print("inv(A) @ b     :", A_inv @ b)
print("solve(A, b)    :", np.linalg.solve(A, b))
`,
          output: `inv(A) =
[[ 0.5  -0.5 ]
 [-0.25  0.75]]
A @ inv(A) ~ I : True
inv(A) @ b     : [2. 3.]
solve(A, b)    : [2. 3.]`,
          outputNote:
            "A times its inverse is the identity to floating-point precision, and both routes to x agree — on a small, well-conditioned matrix like this, the inverse is perfectly fine.",
          explain: [
            "`A @ A_inv` equals eye(2) up to tiny round-off — that is the definition of an inverse, checked with allclose rather than ==.",
            "The last two lines return the same [2, 3] — the detour and the direct road agree when the matrix is this friendly.",
            "The catch is scale: on large or nearly-singular matrices, the detour's extra arithmetic turns into real error. solve never pays that tax.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.inv",
          purpose: "Compute the multiplicative inverse of a square, non-singular matrix: the matrix A-inverse with A @ A-inverse equal to the identity.",
          signature: "np.linalg.inv(a)",
          purposeDetail:
            "`inv` returns the matrix that undoes `a` under matrix multiplication. It exists only for square matrices whose determinant is nonzero — otherwise NumPy raises LinAlgError rather than inventing an answer. Use it when you need the inverse *as an object*: changing coordinates between bases, whitening data, or inverting a hand-derived closed form. For the common task 'find x in A x = b', skip it — np.linalg.solve gets you there with less work and less error.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, n)",
              required: true,
              description: "The square matrix to invert. Singular inputs (determinant 0, deficient rank) raise LinAlgError.",
              example: "np.array([[3.0, 2.0], [1.0, 2.0]])",
            },
          ],
          returns: {
            type: "ndarray, shape (n, n)",
            description: "The inverse matrix: inv(a) @ a and a @ inv(a) both equal the identity up to floating-point precision.",
          },
          example: `import numpy as np

A = np.array([[3.0, 2.0],
              [1.0, 2.0]])
A_inv = np.linalg.inv(A)

print("inv(A) =")
print(A_inv)
print("A @ inv(A) ~ I :", np.allclose(A @ A_inv, np.eye(2)))
print("inv(A) @ A ~ I :", np.allclose(A_inv @ A, np.eye(2)))

# det tells you ahead of time whether the inverse can exist
print("det(A) =", np.round(np.linalg.det(A), 6))
`,
          exampleOutput: `inv(A) =
[[ 0.5  -0.5 ]
 [-0.25  0.75]]
A @ inv(A) ~ I : True
inv(A) @ A ~ I : True
det(A) = 4.0`,
          commonMistakes: [
            {
              mistake: "Solving systems with inv(A) @ b as the default move.",
              why: "It is the textbook picture but the worst implementation: roughly triple the cost of solve and measurably less accurate, with the gap widening as matrices grow.",
              fix: "Reflex: solve(A, b). Keep inv for when the inverse itself is the deliverable.",
            },
            {
              mistake: "Calling inv on a singular matrix and being surprised by LinAlgError.",
              why: "No matrix undoes a machine that collapses dimensions — rows 1 and 2 being proportional means information was destroyed on the way in.",
              fix: "Expect the error, or screen with matrix_rank / det first; for rank trouble, pinv gives the closest thing to an inverse that exists.",
            },
            {
              mistake: "Testing A @ inv(A) == np.eye(2) with ==.",
              why: "Floating point: the product is 0.9999999-ish, not exactly 1, so == returns False even when the inverse is perfect.",
              fix: "np.allclose(A @ A_inv, np.eye(2)) — the equality that means 'equal where floating point lives'.",
            },
          ],
          related: [
            { name: "np.linalg.solve", relation: "The preferred way to crack A x = b — same answer, less work, less error." },
            { name: "np.linalg.pinv", relation: "The pseudo-inverse: defined for singular and rectangular matrices too, via SVD." },
            { name: "np.linalg.det", relation: "The screening test: determinant 0 means the inverse cannot exist." },
          ],
          applications: [
            "Change-of-basis matrices, where the inverse itself is the object you compute with",
            "Whitening transforms in statistics (build from eigh in Lesson h-04, then invert)",
            "Understanding and teaching what 'undoing a matrix' means — the concept, checked numerically",
          ],
          notes:
            "If you catch yourself writing inv(A) @ b, stop and write np.linalg.solve(A, b). The inverse of a product reverses order, (A @ B)-inverse = B-inverse @ A-inverse — a fact you occasionally need with inv in hand.",
        },
        {
          kind: "heading",
          text: "When the machine cannot exist: singular systems",
        },
        {
          kind: "text",
          text: "Some systems have no machine that undoes them. If one equation is a multiple of another, the matrix **collapses** information: two unknowns, but really one equation wearing two hats. Such a matrix is **singular** — determinant 0, rank deficient — and NumPy refuses to invent an answer. Run it yourself and read the exact error; you will meet this error again in every numerical library you ever touch:",
        },
        {
          kind: "code",
          title: "The real error, on purpose",
          code: `import numpy as np

A = np.array([[1.0, 2.0],
              [2.0, 4.0]])   # row 2 is exactly 2 x row 1: no new information
b = np.array([1.0, 2.0])

print(np.linalg.solve(A, b))
`,
          expectError: "numpy.linalg.LinAlgError: Singular matrix",
          outputNote:
            "numpy 2.0.2's exact final error line. 'Singular matrix' is NumPy saying: this machine destroyed information, so no input can be recovered from outputs.",
          explain: [
            "Row 2 of A is 2 times row 1, and b's second entry is likewise 2 times its first — the system is consistent but has infinitely many solutions; solve wants exactly one.",
            "Change b to [1.0, 3.0] and the system becomes contradictory — zero solutions. Either way, singular: same LinAlgError.",
            "This error is a feature. Libraries that guess instead of raising hand you a confident wrong answer.",
          ],
        },
        {
          kind: "code",
          title: "Diagnosing singularity before it bites: det and rank",
          code: `import numpy as np

A = np.array([[3.0, 2.0],
              [1.0, 2.0]])   # well-conditioned
S = np.array([[1.0, 2.0],
              [2.0, 4.0]])   # singular: row 2 = 2 x row 1

print("det(A)  =", np.round(np.linalg.det(A), 6))
print("det(S)  =", np.round(np.linalg.det(S), 6))
print("rank(A) =", np.linalg.matrix_rank(A), " rank(S) =", np.linalg.matrix_rank(S))
`,
          output: `det(A)  = 4.0
det(S)  = 0.0
rank(A) = 2  rank(S) = 1`,
          outputNote:
            "The three-way diagnosis: det(A) = 4 with full rank 2 (solvable); det(S) = 0 with rank 1 (one row is a shadow of the other — unsolvable by inversion).",
          explain: [
            "`np.linalg.det` — the determinant: 0 exactly when the matrix collapses space (and the inverse cannot exist).",
            "`np.linalg.matrix_rank` — how many genuinely independent rows there are. A 2x2 with rank 1 has one row's worth of information.",
            "For exact-zero determinants like S, either test is conclusive; for NEAR-zero determinants, trust rank and solve's own judgment over eyeballing tiny numbers.",
          ],
        },
        {
          kind: "text",
          text: "When a matrix is singular or rectangular, there is a cousin that never says no: the **pseudo-inverse**, `np.linalg.pinv`. It is built from SVD (Lesson h-04) and returns the least-squares-flavored best answer for any shape. Watch what multiplying by it actually does to our singular matrix — it projects:",
        },
        {
          kind: "code",
          title: "pinv: the always-works cousin",
          code: `import numpy as np

S = np.array([[1.0, 2.0],
              [2.0, 4.0]])   # singular: no true inverse exists
P = np.linalg.pinv(S)

print("pinv(S) =")
print(np.round(P, 4))
print("S @ pinv(S) =")
print(np.round(S @ P, 4))

proj = S @ P
print("S @ pinv(S) is a projection (P @ P == P):", np.allclose(proj @ proj, proj))
`,
          output: `pinv(S) =
[[0.04 0.08]
 [0.08 0.16]]
S @ pinv(S) =
[[0.2 0.4]
 [0.4 0.8]]
S @ pinv(S) is a projection (P @ P == P): True`,
          outputNote:
            "S @ pinv(S) is NOT the identity — it is a projection onto the part of space S can still see. Applying it twice equals applying it once: the fingerprint of a projection.",
          explain: [
            "pinv(S) exists even though inv(S) cannot: it is defined through SVD, which tolerates collapsed directions by simply dropping them.",
            "`S @ P` maps every vector onto the line S's one independent row lives on — the best S can do, and exactly what least squares would choose.",
            "`proj @ proj == proj` (idempotence) proves it is a projection: once you have been projected, projecting again changes nothing.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.pinv",
          purpose: "Compute the Moore-Penrose pseudo-inverse: an inverse-like matrix that exists for EVERY array, singular and rectangular included.",
          signature: "np.linalg.pinv(a, rcond=None, hermitian=False)",
          purposeDetail:
            "`pinv` is what you reach for when `inv` raises: rank-deficient matrices, rectangular matrices, systems with redundant or contradictory equations. It is computed from the singular value decomposition, and where inv demands 'square and full rank', pinv simply zeroes out the collapsed directions and inverts the rest. Multiplying by pinv(a) does not undo a — it projects onto the space a can reach and returns the least-squares-best input for whatever output you ask about. That is precisely the behavior you want from a solver that must never crash.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, m)",
              required: true,
              description: "Any matrix — square or rectangular, full rank or not. Pinv handles all of them.",
              example: "np.array([[1.0, 2.0], [2.0, 4.0]])",
            },
            {
              name: "rcond",
              type: "float or None",
              description: "Cutoff ratio for treating tiny singular values as zero (relative to the largest). Smaller values invert more reluctantly-collapsed directions.",
              example: "rcond=1e-15",
            },
            {
              name: "hermitian",
              type: "bool",
              description: "True if a is symmetric/Hermitian: lets pinv use the cheaper eigh route internally.",
              example: "hermitian=True",
            },
          ],
          returns: {
            type: "ndarray, shape (m, n)",
            description: "The pseudo-inverse, shaped transposed to a. a @ pinv(a) is a projection (not the identity) onto a's column space.",
          },
          example: `import numpy as np

S = np.array([[1.0, 2.0],
              [2.0, 4.0]])     # singular: inv raises, pinv does not
P = np.linalg.pinv(S)
print("pinv(S) =")
print(np.round(P, 4))
print("S @ pinv(S) =")
print(np.round(S @ P, 4))

R = np.array([[1.0, 0.0],
              [0.0, 1.0],
              [0.0, 0.0]])     # rectangular: also fine
print("pinv of 3x2 shape:", np.linalg.pinv(R).shape)
`,
          exampleOutput: `pinv(S) =
[[0.04 0.08]
 [0.08 0.16]]
S @ pinv(S) =
[[0.2 0.4]
 [0.4 0.8]]
pinv of 3x2 shape: (2, 3)`,
          commonMistakes: [
            {
              mistake: "Expecting a @ pinv(a) to equal the identity.",
              why: "For singular a, information was lost on the way in; pinv can only project onto what survives. a @ pinv(a) is a projection, and pinv(a) @ a is a (different) projection.",
              fix: "Check the projection properties instead: (a @ pinv(a)) squared equals itself — idempotence is the tell.",
            },
            {
              mistake: "Treating pinv as a patched-up inv for square full-rank matrices.",
              why: "When inv works, inv is the cheaper and more direct tool; pinv pays for an SVD you do not need.",
              fix: "Full-rank square: inv or (better) solve. Rank trouble or rectangular shape: pinv, or lstsq for the solving use case.",
            },
            {
              mistake: "Ignoring rcond when the matrix is nearly (not exactly) singular.",
              why: "pinv's answer depends on which tiny singular values count as zero — rcond draws that line.",
              fix: "Defaults are sensible; revisit rcond only when you know the spectrum (Lesson h-04 makes that visible).",
            },
          ],
          related: [
            { name: "np.linalg.inv", relation: "The exact inverse — exists only for square, non-singular matrices; pinv extends the idea to everything else." },
            { name: "np.linalg.lstsq", relation: "For the 'solve with a difficult matrix' use case, lstsq is the more direct tool; pinv is its explicit-matrix cousin." },
            { name: "np.linalg.svd", relation: "The machinery underneath: pinv inverts the surviving singular values and transposes the factors (Lesson h-04)." },
          ],
          applications: [
            "Rank-deficient regression: predicting with collinear features where inv(A.T @ A) explodes",
            "Robotics and control: solving systems with redundant constraints that have no exact solution",
            "Building projection matrices onto a subspace: P = B @ pinv(B) for a basis B",
          ],
          notes:
            "pinv(a) @ b always exists and equals the least-squares solution for over-determined systems — the same answer lstsq computes, reached through an explicit matrix.",
        },
        {
          kind: "heading",
          text: "Over-determined: six equations, two unknowns",
        },
        {
          kind: "text",
          text: "Real data does not hand you n equations and n unknowns. It hands you *many more equations than unknowns* — six measurements, two parameters — and every measurement carries a little noise, so no line passes exactly through all six points. An **over-determined system** has no exact solution; the professional move is to ask for the *best* one: the x minimizing the sum of squared errors, `||A x - b||` squared. That is `np.linalg.lstsq` — least squares.",
        },
        {
          kind: "code",
          title: "Fitting the best line the professional way",
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])          # six days
y = np.array([2.1, 3.9, 6.2, 8.1, 9.8, 12.2])         # six noisy readings

A = np.column_stack([x, np.ones_like(x)])             # design matrix: [x, 1]
coef, residuals, rank, sv = np.linalg.lstsq(A, y, rcond=None)

print("slope, intercept =", coef)
print("rank =", rank, " singular values =", np.round(sv, 4))
print("sum of squared residuals =", np.round(residuals[0], 5))
`,
          output: `slope, intercept = [2.00285714 0.04      ]
rank = 2  singular values = [9.7931 1.0463]
sum of squared residuals = 0.13486`,
          outputNote:
            "The best line through the noise is y = 2.002857*x + 0.04 — slope almost exactly 2, intercept almost exactly 0, which is where the data was generated. The residuals (0.13486) quantify what the noise cost us.",
          explain: [
            "`np.column_stack([x, ones])` builds the design matrix from the arrayViz block above: each row turns one measurement into one equation, slope*x + intercept*1 = y.",
            "lstsq returns four things: the best [slope, intercept], the summed squared error, the rank, and the singular values of A.",
            "The fit lands on slope 2.002857 and intercept 0.04 because the true relationship was y = 2x plus noise — least squares recovered it to three digits.",
          ],
        },
        {
          kind: "text",
          text: "Where does that answer come from? Calculus says: the error is minimized exactly when the leftover (residual) is perpendicular to every column of A — which rearranges into the **normal equations**, `A.T @ A x = A.T @ b`. The left side is now square (2x2 for our two unknowns), so our old friend solve cracks it. Same problem, two doors:",
        },
        {
          kind: "code",
          title: "The normal equations: same answer, second door",
          code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
y = np.array([2.1, 3.9, 6.2, 8.1, 9.8, 12.2])
A = np.column_stack([x, np.ones_like(x)])

# A.T @ A x = A.T @ b  -- square now, so solve applies
coef_normal = np.linalg.solve(A.T @ A, A.T @ y)

coef_lstsq, _, _, _ = np.linalg.lstsq(A, y, rcond=None)

print("normal equations :", coef_normal)
print("lstsq            :", coef_lstsq)
print("identical?       :", np.allclose(coef_normal, coef_lstsq))
`,
          output: `normal equations : [2.00285714 0.04      ]
lstsq            : [2.00285714 0.04      ]
identical?       : True`,
          outputNote:
            "Both doors lead to the same [2.00285714, 0.04] — verified equal by allclose. lstsq takes the numerically safer door (SVD-based); the normal equations show you the algebra.",
          explain: [
            "`A.T @ A` is 2x2 (columns of A dotted with columns of A) — square, so solve accepts it.",
            "The two routes agree to floating-point precision: this equality is the theorem, checked rather than believed.",
            "Professionals still prefer lstsq, because A.T @ A squares the condition number — error-prone when columns are nearly redundant. Both facts are now yours.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.lstsq",
          purpose: "Return the x that minimizes ||a @ x - b|| when the system has no exact solution — the professional line fitter.",
          signature: "np.linalg.lstsq(a, b, rcond=None)",
          purposeDetail:
            "`lstsq` is least squares: when you have more equations than unknowns (or redundant, contradictory ones), no x satisfies them exactly, so lstsq finds the x whose predicted outputs come closest to b in total squared distance. It is implemented with the SVD, which makes it the numerically robust route — it notices and quietly handles rank deficiency that would explode the normal equations. This one call is the computational heart of linear regression: hand it a design matrix of features and a target vector, and it returns the fitted coefficients.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, k)",
              required: true,
              description: "The design matrix: n rows (one per data point / equation), k columns (one per unknown, including any constant column).",
              example: "np.column_stack([x, np.ones_like(x)])",
            },
            {
              name: "b",
              type: "array_like, shape (n,) or (n, m)",
              required: true,
              description: "The targets: one value per data point, or n-by-m to fit m targets against the same design matrix.",
              example: "np.array([2.1, 3.9, 6.2])",
            },
            {
              name: "rcond",
              type: "float or None",
              description: "Cutoff ratio for treating small singular values of a as zero. Pass rcond=None for the modern default (machine-precision-based).",
              example: "rcond=None",
            },
          ],
          returns: {
            type: "tuple of 4",
            description: "(x, residuals, rank, singular_values): the least-squares solution; the summed squared error (empty if rank < k); A's rank; and A's singular values — the spectrum you will learn to read in Lesson h-04.",
          },
          example: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
y = np.array([2.1, 3.9, 6.2, 8.1, 9.8, 12.2])
A = np.column_stack([x, np.ones_like(x)])

coef, residuals, rank, sv = np.linalg.lstsq(A, y, rcond=None)
print("slope, intercept =", coef)
print("rank =", rank, " singular values =", np.round(sv, 4))
print("sum of squared residuals =", np.round(residuals[0], 5))

predicted = A @ coef
print("first 3 predictions:", predicted[:3])
print("first 3 targets    :", y[:3])
`,
          exampleOutput: `slope, intercept = [2.00285714 0.04      ]
rank = 2  singular values = [9.7931 1.0463]
sum of squared residuals = 0.13486
first 3 predictions: [2.04285714 4.04571429 6.04857143]
first 3 targets    : [2.1 3.9 6.2]`,
          commonMistakes: [
            {
              mistake: "Forgetting the intercept column in the design matrix.",
              why: "With only the x column, lstsq fits y = slope*x through the ORIGIN — a different, usually wrong model, fitted confidently.",
              fix: "np.column_stack([x, np.ones_like(x)]) — one column per parameter, including the constant 1 that multiplies the intercept.",
            },
            {
              mistake: "Unpacking only the solution and being confused by the 4-tuple.",
              why: "lstsq returns (x, residuals, rank, singular_values); treating the whole tuple as x produces bizarre downstream shapes.",
              fix: "Unpack all four (or use coef, *_): the extras — residual sum, rank, spectrum — are diagnostics you will want.",
            },
            {
              mistake: "Being surprised that residuals is an empty array sometimes.",
              why: "When the system is exactly solvable (square, full rank) or rank-deficient, the squared-residual sum is not well-defined the way lstsq computes it, so it comes back empty.",
              fix: "Compute the error yourself when you need it always: ((b - A @ coef) ** 2).sum().",
            },
          ],
          related: [
            { name: "np.linalg.solve", relation: "For square exact systems — no error to minimize; lstsq generalizes to the over-determined case." },
            { name: "np.linalg.pinv", relation: "pinv(A) @ b gives the same least-squares solution; lstsq is the direct, better-packaged tool." },
            { name: "np.linalg.svd", relation: "The engine inside: lstsq solves via the singular value decomposition (Lesson h-04)." },
          ],
          applications: [
            "Linear regression — not 'like' linear regression: this call, with this design matrix, IS it",
            "Calibration curves: fitting sensor response lines through repeated noisy measurements",
            "Any best-fit linear model: trend lines, feature weights, trend surfaces with more columns",
          ],
          notes:
            "On NumPy versions before 2.0, calling lstsq without rcond emitted a FutureWarning about the changing default; passing rcond=None (as this course does) has always been the future-proof spelling. The normal equations (solve(A.T @ A, A.T @ b)) give the same answer in exact arithmetic, but lstsq's SVD route is stabler on ill-conditioned data.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Said precisely: lstsq IS linear regression",
          text: "Ordinary least squares regression — the workhorse of economics, the sciences, and every 'add a trendline' button in a spreadsheet — is the statement: build the design matrix A from your features plus a constant column, take the target vector b, and return argmin over x of ||A x - b|| squared. np.linalg.lstsq(A, b) computes exactly that. scikit-learn's LinearRegression wraps this same computation (with extra bookkeeping). The ML connection of this lesson is not an analogy; it is an identity.",
        },
        {
          kind: "tryIt",
          title: "An over-determined system of your own",
          task:
            "Three recipes, two flours — but the orders come from noisy measurements, so no exact mix exists. Run the starter: lstsq returns the best compromise. Then: (1) print A @ coef next to b and see where the compromise misses; (2) replace lstsq with the normal equations and check you get the same coefficients; (3) make row 3 of A a multiple of row 1 and watch what lstsq and solve each do with the redundancy.",
          code: `import numpy as np

# 4a + 2b = 20
# 1a + 3b = 13
# 5a + 1b = 19
A = np.array([[4.0, 2.0],
              [1.0, 3.0],
              [5.0, 1.0]])
b = np.array([20.0, 13.0, 19.0])

print("A is", A.shape, "-- three equations, two unknowns")
coef, residuals, rank, sv = np.linalg.lstsq(A, b, rcond=None)
print("best a, b =", coef)
print("A @ coef =", np.round(A @ coef, 3))
print("b        =", b)
`,
          hint: "For part (2): np.linalg.solve(A.T @ A, A.T @ b). For part (3): try A[2] = A[0] — lstsq shrugs and returns something reasonable; the normal equations may become singular and crash.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Square and solvable: np.linalg.solve(A, b). Singular: det 0, rank deficient, LinAlgError — pinv gives the never-crashes best answer. More data than unknowns: np.linalg.lstsq finds the least-squares best x, which is linear regression, stated exactly.",
        },
      ],
      terms: [
        { term: "Linear system", definition: "The equation A x = b: known machine A, known output b, unknown input x." },
        { term: "Singular matrix", definition: "A square matrix that collapses information (determinant 0, deficient rank): no inverse exists, and solve raises LinAlgError." },
        { term: "Determinant", definition: "np.linalg.det: a scalar that is exactly 0 precisely when the matrix collapses space and cannot be inverted." },
        { term: "Rank", definition: "np.linalg.matrix_rank: the number of genuinely independent rows (or columns) — how much information the matrix actually carries." },
        { term: "Pseudo-inverse", definition: "np.linalg.pinv: the Moore-Penrose inverse, defined for every matrix via SVD; multiplying by it projects onto the reachable space." },
        { term: "Over-determined system / least squares", definition: "More equations than unknowns: no exact solution, so we minimize the total squared error — np.linalg.lstsq returns that minimizer." },
        { term: "Normal equations", definition: "A.T @ A x = A.T @ b: the square system whose solution equals the least-squares fit — the calculus door into the same answer." },
      ],
      mistakes: [
        {
          mistake: "Solving A x = b with inv(A) @ b out of algebra-class habit.",
          why: "It works on paper but does extra work and accumulates extra floating-point error; solve's factorization route is both faster and stabler.",
          fix: "np.linalg.solve(A, b) is the reflex; the inverse is for when the inverse itself is the object you need.",
        },
        {
          mistake: "Testing singularity with a bare det(A) == 0 check on real data.",
          why: "Floating point almost never lands on exactly 0 for nearly-singular data — you get 1e-17, pass the check, then get garbage or a crash.",
          fix: "Use matrix_rank (which thresholds sensibly), or just let solve raise and handle LinAlgError — the error is information, not failure.",
        },
        {
          mistake: "Forgetting the constant column when fitting a line with lstsq.",
          why: "A design matrix of just the x column forces the line through the origin — a different model fitted without complaint.",
          fix: "np.column_stack([x, np.ones_like(x)]): one column per parameter, the intercept's column being all ones.",
        },
        {
          mistake: "Expecting a @ pinv(a) to be the identity.",
          why: "pinv cannot resurrect information the matrix destroyed; the product is a projection, and its fingerprint is idempotence (P @ P == P).",
          fix: "Verify the projection properties, not the identity; if you truly need identity, your matrix must be square and full rank — use inv.",
        },
      ],
      takeaways: [
        "np.linalg.solve(A, b) is the professional default for square systems; verify every solution with A @ x.",
        "np.linalg.inv exists and works for small well-conditioned matrices (check with allclose against eye), but solve is cheaper and stabler for solving.",
        "Singular systems announce themselves: LinAlgError from solve, determinant 0, rank below n — and pinv gives the always-works, projection-flavored answer.",
        "Over-determined data (n equations, k unknowns, n > k) has no exact solution: np.linalg.lstsq returns the least-squares best x.",
        "lstsq and the normal equations solve(A.T @ A, A.T @ b) give identical coefficients — verified — and the lstsq route IS linear regression, said precisely.",
      ],
      quiz: [
        {
          id: "h-03-q1",
          prompt: "The recommended way to solve a square, non-singular system A x = b in NumPy is:",
          options: [
            { text: "x = np.linalg.inv(A) @ b", correct: false, feedback: "It works, but it computes an entire inverse you never needed — slower and less accurate than solve's factorization." },
            { text: "x = np.linalg.solve(A, b)", correct: true, feedback: "Correct: solve is the professional default — cheaper and numerically stabler than the inv detour." },
            { text: "x = A / b", correct: false, feedback: "Division is not defined between a matrix and a vector like this; it is not how systems are solved." },
            { text: "x = np.linalg.pinv(A) @ b", correct: false, feedback: "It gives the least-squares-flavored answer and never crashes — useful for hard cases, overkill (and SVD-priced) for a clean square system." },
          ],
          explanation: "solve(A, b) computes x directly via LU factorization: the same answer as inv(A) @ b, with less work and less error.",
        },
        {
          id: "h-03-q2",
          prompt: "np.linalg.solve raises LinAlgError: Singular matrix. Which statement is TRUE about the matrix A?",
          options: [
            { text: "A is not square — solve only accepts square matrices", correct: false, feedback: "A wrong-shape input raises a different error (a shape/ValueError); 'Singular matrix' specifically means square-but-collapsing." },
            { text: "A's rows are linearly dependent: it has destroyed information, so no input can be uniquely recovered", correct: true, feedback: "Correct: singularity means rank below n (e.g. one row is a multiple of another) — determinant 0, no inverse, infinitely many or zero solutions." },
            { text: "A contains NaN values", correct: false, feedback: "NaN inputs give a different failure (or propagate silently); 'Singular matrix' is the structural collapse message." },
            { text: "A is too large for NumPy to factor", correct: false, feedback: "Size is not the issue — solve handles enormous systems; singularity is a property of the matrix's content, not its size." },
          ],
          explanation: "Singular = information-destroying: det 0, rank deficient. The fix is not a bigger machine but different data (or pinv/lstsq for the best-effort answer).",
        },
        {
          id: "h-03-q3",
          prompt: "You fit a line with lstsq on six (x, y) points using A = np.column_stack([x, ones]). The returned coefficient array coef has two entries. What are they?",
          options: [
            { text: "The two roots of the fitted quadratic", correct: false, feedback: "A quadratic needs three parameters (x-squared, x, constant) — your design matrix has only two columns, so it is a line." },
            { text: "[slope, intercept] of the best-fit line y = slope*x + intercept", correct: true, feedback: "Correct: column 0 multiplies the slope, column 1 (all ones) multiplies the intercept; coef returns one parameter per column." },
            { text: "[intercept, slope], in that order", correct: false, feedback: "The order follows the design matrix's columns: you stacked x first, then ones — so slope comes first." },
            { text: "The mean of x and the mean of y", correct: false, feedback: "Those are useful summaries but not what lstsq returns — it returns the least-squares parameters, one per column of A." },
          ],
          explanation: "lstsq returns one coefficient per column of the design matrix, in column order — [slope, intercept] for the stacking [x, ones].",
        },
      ],
    },

    // ------------------------------------------------------------- h-04
    {
      slug: "h-04",
      title: "Eigenvalues, Eigenvectors and SVD",
      minutes: 17,
      summary:
        "Open the machines: eigenvectors are the directions a matrix only stretches (eigenvalues say by how much), symmetric matrices get the guaranteed-real eigh tool, and the SVD factors any matrix into a spectrum of strengths — the low-rank compression idea behind recommenders and the honest core of PCA.",
      kind: "concept",
      objectives: [
        "State what an eigenpair is in plain words: the special directions where the machine's output points along its input, and the stretch factor for each",
        "Run np.linalg.eig on a small matrix and verify A @ v == lam * v numerically with allclose (never trusting order or signs)",
        "Choose np.linalg.eigh for symmetric matrices (covariance among them, cross-referencing Lesson f-03) and np.linalg.eigvals when only values are needed",
        "Factor any matrix with np.linalg.svd, reconstruct it exactly, and build a low-rank approximation with a measured error and energy share",
        "Outline the core of PCA honestly: center the columns, take the SVD, read the components from the rows of Vt",
      ],
      why: "Every compression trick that quietly runs the modern world — recommender systems predicting your next show, PCA squeezing 10,000 survey questions into 20 scores, image formats, noise removal — rests on one discovery: matrices have favorite directions. Eigenvectors are the directions a machine only stretches; singular values rank every direction by how much the machine cares about it. Keep the big ones, drop the small ones, and you have compressed the matrix while keeping almost all of its meaning. This lesson makes that discovery runnable: you will decompose real matrices with eig and svd, prove the definitions with allclose, and watch two numbers out of four carry 77% of a matrix's energy. The determinism notes matter here: we sort, we round, and we never trust a sign.",
      blocks: [
        {
          kind: "text",
          text: "A matrix is a machine that turns vectors into other vectors — and most arrows that go in come out pointing somewhere new. But nearly every matrix has a few **special directions** where the output points along the input: the machine only *stretches*. Those directions are the **eigenvectors**, and the stretch factors are the **eigenvalues**. Finding them is asking the machine its deepest question: *which directions do you care about, and how much?*",
        },
        {
          kind: "heading",
          text: "Which directions does the machine only stretch?",
        },
        {
          kind: "visual",
          title: "Most arrows get turned; eigenvectors get stretched",
          ascii: `   a generic matrix turns most arrows:          an eigenvector only changes length:

        y                                            y
        |   input                                        |   input v
        |     /                                          |     /
        |    /                                            |    /
        |   /  ,------.                       A          |   /   ,------.
        |  /   |  A   |     ->  output points            |  /    |  A   |   ->  output 2*v
        | /    '------'         somewhere else           | /      '------'     same line, longer
        +------------- x                             +----------------- x

   A @ v = 2*v: direction unchanged, length doubled.
   The pair (2, v) is an eigenvalue-eigenvector pair of A.
`,
          caption:
            "An eigenvector survives its machine unchanged in direction. Everything the machine does to the rest of space can be described by a short list of these direction-stretch pairs.",
        },
        {
          kind: "text",
          text: "The definition fits in one line: `A @ v = lam * v` for some scalar `lam`. NumPy's `np.linalg.eig` finds the pairs for you. One habit before the code: **do not trust eigenvalue order or eigenvector signs** across libraries or builds — the pairs are the truth, their packaging order is an implementation detail. So we print values sorted where it matters, round for display, and prove the definition with allclose (which tolerates the sign of nothing it does not check — we compare A @ v against lam * v directly).",
        },
        {
          kind: "code",
          title: "eig on a 2x2, definition verified",
          code: `import numpy as np

A = np.array([[4.0, 1.0],
              [2.0, 3.0]])
vals, vecs = np.linalg.eig(A)

print("eigenvalues      :", vals)
print("sorted           :", np.sort(vals))
print("eigenvector columns:")
print(np.round(vecs, 4))

v0 = vecs[:, 0]                    # eigenvector #0 is the FIRST COLUMN
lam0 = vals[0]
print("A @ v0 == lam0 * v0 :", np.allclose(A @ v0, lam0 * v0))
`,
          output: `eigenvalues      : [5. 2.]
sorted           : [2. 5.]
eigenvector columns:
[[ 0.7071 -0.4472]
 [ 0.7071  0.8944]]
A @ v0 == lam0 * v0 : True`,
          outputNote:
            "Eigenvalues 5.0 and 2.0 (printed both as-returned and sorted). Each COLUMN of vecs is one eigenvector, and the allclose check proves A @ v = lam * v for the first pair — the definition, verified.",
          explain: [
            "`np.linalg.eig(A)` returns a pair: the array of eigenvalues [5. 2.] and a matrix whose COLUMNS are the matching eigenvectors.",
            "`vecs[:, 0]` — column 0 pairs with vals[0]. Taking rows instead is the classic slip; the printout shows the columns rounded to 4 places.",
            "`np.allclose(A @ v0, lam0 * v0)` — feed v0 through the machine and compare with 'just stretch it by lam0': True is the definition holding.",
            "The eigenvalues came out exactly 5 and 2 here (the matrix was built that way); for messier matrices, round before printing and sort before comparing orders.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.eig",
          purpose: "Find the eigenvalues and eigenvectors of a general square matrix: the direction-stretch pairs where A @ v = lam * v.",
          signature: "np.linalg.eig(a)",
          purposeDetail:
            "`eig` answers a matrix's deepest question: which input directions come out unchanged in direction, merely scaled? Those pairs describe the machine's essence — a rotation has complex eigenvalues on the unit circle, a stretch has big real ones, and a collapsing (singular) matrix has a 0 among them. The returned eigenvalues may be complex in general (real matrices can rotate), the order is implementation-defined, and each eigenvector's sign is arbitrary (negate it and it is still an eigenvector). Trust pairs, not packaging: verify with allclose on A @ v versus lam * v.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, n)",
              required: true,
              description: "The square matrix to decompose. Rectangular input raises LinAlgError — eigenvalues are defined only for square machines (use svd for everything else).",
              example: "np.array([[4.0, 1.0], [2.0, 3.0]])",
            },
          ],
          returns: {
            type: "tuple of 2",
            description: "(eigenvalues, eigenvectors): a length-n array of eigenvalues (possibly complex) and an n-by-n matrix whose COLUMN k is the eigenvector for eigenvalue k.",
          },
          example: `import numpy as np

A = np.array([[4.0, 1.0],
              [2.0, 3.0]])
vals, vecs = np.linalg.eig(A)

print("eigenvalues :", vals)
print("sorted      :", np.sort(vals))
print("eigenvectors (columns):")
print(np.round(vecs, 4))

for k in range(len(vals)):
    v = vecs[:, k]
    print("pair", k, "holds A @ v == lam * v:", np.allclose(A @ v, vals[k] * v))
`,
          exampleOutput: `eigenvalues : [5. 2.]
sorted      : [2. 5.]
eigenvectors (columns):
[[ 0.7071 -0.4472]
 [ 0.7071  0.8944]]
pair 0 holds A @ v == lam * v: True
pair 1 holds A @ v == lam * v: True`,
          commonMistakes: [
            {
              mistake: "Reading the eigenvectors from the ROWS of the returned matrix.",
              why: "The returned array packs one eigenvector per COLUMN; vecs[0] is 'the first coordinate of every eigenvector', not the first eigenvector.",
              fix: "vecs[:, k] for eigenvector k. Print rounded columns when in doubt — the shape is square, so the slip is silent.",
            },
            {
              mistake: "Trusting eigenvalue order or eigenvector signs across runs, libraries, or NumPy versions.",
              why: "The pairs are mathematically fixed but their packaging order and each vector's sign are implementation choices; code that depends on them breaks invisibly.",
              fix: "Sort values when order matters (np.sort(vals)), never test signs, and verify relationships with allclose comparisons like A @ v versus lam * v.",
            },
            {
              mistake: "Using eig on a symmetric matrix (a covariance matrix, say) and tripping over tiny imaginary parts.",
              why: "Symmetric matrices are guaranteed real eigenvalues, but eig returns them in a complex dtype anyway, cluttering output with 0j suffixes.",
              fix: "Use np.linalg.eigh for symmetric input: real values, ascending order, orthogonal vectors — the right tool for covariance work.",
            },
          ],
          related: [
            { name: "np.linalg.eigh", relation: "The symmetric-matrix specialist: guaranteed real eigenvalues (ascending) and orthogonal eigenvectors — the covariance tool." },
            { name: "np.linalg.eigvals", relation: "Values only, skipping the eigenvector computation when you do not need the vectors." },
            { name: "np.linalg.svd", relation: "The every-matrix generalization below: works for rectangular matrices, with non-negative singular values instead." },
          ],
          applications: [
            "Stability analysis: eigenvalues with magnitude above 1 mean a system's modes blow up",
            "Vibration modes: eigenvectors of a stiffness matrix are a structure's natural shapes",
            "Matrix powers shortcut: compute A-to-the-100 via eigenvalues instead of 99 products (when A is diagonalizable)",
          ],
          notes:
            "Eigen-decomposition of a FIXED matrix is deterministic on a fixed build (this course's outputs are machine-verified), but nothing guarantees the same packaging across versions — write sign-robust, order-robust checks and your code survives every library upgrade.",
        },
        {
          kind: "heading",
          text: "Symmetric matrices get their own tool",
        },
        {
          kind: "text",
          text: "One family of matrices shows up so often it earned a dedicated function: **symmetric** matrices (`C.T == C`) — and their most famous member is the covariance matrix you met in Lesson f-03. Symmetric matrices are guaranteed real eigenvalues and orthogonal eigenvectors, and `np.linalg.eigh` exploits that: real output, ascending order, vectors that form an orthonormal basis. When your matrix is symmetric, eigh is the right tool, full stop.",
        },
        {
          kind: "code",
          title: "eigh: real, ascending, and orthonormal — verified",
          code: `import numpy as np

C = np.array([[2.0, 0.5],
              [0.5, 1.0]])          # symmetric: C.T == C
w, Q = np.linalg.eigh(C)

print("eigh eigenvalues (ascending):", np.round(w, 5))
print("eigvals shortcut (any order) :", np.round(np.linalg.eigvals(C), 5))
print("Q.T @ Q ~ I (orthonormal)    :", np.allclose(Q.T @ Q, np.eye(2)))
print("C == Q @ diag(w) @ Q.T       :", np.allclose(C, Q @ np.diag(w) @ Q.T))
`,
          output: `eigh eigenvalues (ascending): [0.79289 2.20711]
eigvals shortcut (any order) : [2.20711 0.79289]
Q.T @ Q ~ I (orthonormal)    : True
C == Q @ diag(w) @ Q.T       : True`,
          outputNote:
            "The same two eigenvalues (0.79289, 2.20711) from both functions — eigh sorts ascending, eigvals does not promise order. Q's columns are orthonormal, and reassembling Q @ diag(w) @ Q.T rebuilds C exactly: a complete recipe for the matrix.",
          explain: [
            "`np.linalg.eigh(C)` — real values in ascending order: 0.79289, then 2.20711. No imaginary clutter, no ordering surprises.",
            "`np.linalg.eigvals(C)` — the shortcut when you want values only; same numbers, no sorted-order promise (here it printed them high-first).",
            "`Q.T @ Q ~ I` — the eigenvectors are orthonormal: unit length and mutually perpendicular. That is what makes Q a rotation and the decomposition reversible.",
            "`Q @ diag(w) @ Q.T` — rotate, stretch along the axes, rotate back: C rebuilt from its eigen-stuff. allclose says True.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.eigh",
          purpose: "Eigen-decomposition specialized for symmetric (or Hermitian) matrices: guaranteed real eigenvalues in ascending order and orthonormal eigenvectors.",
          signature: "np.linalg.eigh(a, UPLO='L')",
          purposeDetail:
            "`eigh` is the tool for the most-quoted eigen-problem in data work: symmetric matrices, whose star is the covariance matrix (Lesson f-03). Symmetry buys three guarantees that general matrices lack: every eigenvalue is real, the eigenvectors can be chosen orthonormal, and the decomposition C = Q @ diag(w) @ Q.T is exact. eigh returns values sorted ascending — so the LAST eigenvector is the dominant direction, the one PCA cares about. It is also faster and more accurate than eig on this family, because it exploits the symmetry instead of handling the general case.",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, n)",
              required: true,
              description: "A symmetric (a.T == a) or Hermitian matrix. Only one triangle is read — see UPLO.",
              example: "np.array([[2.0, 0.5], [0.5, 1.0]])",
            },
            {
              name: "UPLO",
              type: "'L' or 'U'",
              description: "Which triangle to read when the matrix is symmetric on paper: 'L'ower (default) or 'U'pper. Irrelevant when both triangles are actually filled in.",
              example: "UPLO='U'",
            },
          ],
          returns: {
            type: "tuple of 2",
            description: "(eigenvalues, eigenvectors): length-n real array sorted ascending, and an n-by-n orthonormal matrix whose column k matches eigenvalue k.",
          },
          example: `import numpy as np

C = np.array([[2.0, 0.5],
              [0.5, 1.0]])
w, Q = np.linalg.eigh(C)

print("eigenvalues (ascending):", np.round(w, 5))
print("eigenvectors (columns):")
print(np.round(Q, 4))
print("dominant direction = last column:", np.round(Q[:, -1], 4))
print("C == Q @ diag(w) @ Q.T :", np.allclose(C, Q @ np.diag(w) @ Q.T))
`,
          exampleOutput: `eigenvalues (ascending): [0.79289 2.20711]
eigenvectors (columns):
[[ 0.3827 -0.9239]
 [-0.9239 -0.3827]]
dominant direction = last column: [-0.9239 -0.3827]
C == Q @ diag(w) @ Q.T : True`,
          commonMistakes: [
            {
              mistake: "Passing a non-symmetric matrix to eigh.",
              why: "eigh reads only one triangle (lower by default) and silently symmetrizes your input — so it returns a correct answer about a matrix you did not hand it.",
              fix: "Only call eigh when a.T actually equals a (covariance matrices always qualify). Otherwise use eig and accept its conventions.",
            },
            {
              mistake: "Expecting descending order like some textbooks use.",
              why: "eigh sorts ascending by design, so the most important (largest) eigenvalue is LAST — a mirror of scikit-learn's PCA ordering, and a classic source of 'my components are backwards' bugs.",
              fix: "Read components from the end: Q[:, -1] or w[::-1] when you want biggest-first. Verify order by printing.",
            },
          ],
          related: [
            { name: "np.linalg.eig", relation: "The general-square-matrix version: complex values allowed, no order promise — use it only when the matrix is not symmetric." },
            { name: "np.linalg.eigvals", relation: "eigh has no values-only shortcut; eigvals is the general-matrix one." },
            { name: "np.cov", relation: "The producer of symmetric matrices (Lesson f-03): feed its result straight to eigh for a hand-rolled PCA." },
          ],
          applications: [
            "PCA on a covariance matrix: eigenvalues are the variances each component explains",
            "Whitening: scale the eigenbasis by 1/sqrt(eigenvalue) so every direction has variance 1",
            "Graph Laplacians in spectral clustering, where the smallest eigenvectors reveal communities",
          ],
          notes:
            "For covariance PCA, be consistent about one convention: rows-as-observations with np.cov(data.T), or center the data and use SVD directly (the honest PCA route at the end of this lesson) — they compute the same components.",
        },
        {
          kind: "heading",
          text: "Powers without repeated products",
        },
        {
          kind: "text",
          text: "A quick, useful relative before the main event: `np.linalg.matrix_power(A, n)` computes A-to-the-n without typing `A @ A @ A ...` — and, for the mathematically curious, it uses the eigen-machinery internally rather than n-1 brute-force products. Equal results, verified:",
        },
        {
          kind: "code",
          title: "matrix_power vs the long way",
          code: `import numpy as np

A = np.array([[4.0, 1.0],
              [2.0, 3.0]])

print("A @ A @ A =")
print(A @ A @ A)
print("matrix_power(A, 3) equals it:", np.array_equal(np.linalg.matrix_power(A, 3), A @ A @ A))
print("matrix_power(A, 0) ~ I     :", np.allclose(np.linalg.matrix_power(A, 0), np.eye(2)))
`,
          output: `A @ A @ A =
[[86. 39.]
 [78. 47.]]
matrix_power(A, 3) equals it: True
matrix_power(A, 0) ~ I     : True`,
          outputNote:
            "Identical results — [[86, 39], [78, 47]] — from the explicit triple product and matrix_power. Power 0 is defined as the identity, completing the pattern.",
          explain: [
            "`np.linalg.matrix_power(A, 3)` — same [[86, 39], [78, 47]] as the explicit product, in one call that scales better.",
            "`matrix_power(A, 0)` is the identity: any machine to the zeroth power is the do-nothing machine.",
            "Where would you use it? Markov chains (many steps at once), graph reachability (paths of length n), and Fibonacci-style recurrences.",
          ],
        },
        {
          kind: "heading",
          text: "SVD: every matrix has a diagonal heart",
        },
        {
          kind: "text",
          text: "Eigen-decomposition has one limit: it needs square matrices. The **singular value decomposition** removes the limit — *every* matrix, square or rectangular, factors as `A = U @ diag(s) @ Vt`. Read it as three machines in a row: **Vt rotates** your input into the right basis, **diag(s) stretches** each axis by a non-negative amount, **U rotates** the result into place. The stretch factors `s` are the **singular values** — always non-negative, always sorted biggest-first — and together they are the matrix's **spectrum**: a ranked list of how much the machine cares about each direction.",
        },
        {
          kind: "code",
          title: "Factor, inspect, reconstruct",
          code: `import numpy as np

A = np.array([[3.0, 1.0, 0.0, 1.0],
              [1.0, 3.0, 1.0, 0.0],
              [0.0, 1.0, 3.0, 1.0],
              [1.0, 0.0, 1.0, 3.0]])

U, s, Vt = np.linalg.svd(A)
print("shapes -> U:", U.shape, " s:", s.shape, " Vt:", Vt.shape)
print("singular values:", s)
print("all non-negative:", bool((s >= 0).all()))
print("reconstruction A == U @ diag(s) @ Vt:", np.allclose(A, U @ np.diag(s) @ Vt))
`,
          output: `shapes -> U: (4, 4)  s: (4,)  Vt: (4, 4)
singular values: [5. 3. 3. 1.]
all non-negative: True
reconstruction A == U @ diag(s) @ Vt: True`,
          outputNote:
            "This hand-built matrix decomposes with a beautifully clean spectrum [5, 3, 3, 1]: sorted, non-negative, and reconstructing A exactly when recombined.",
          explain: [
            "`np.linalg.svd(A)` returns THREE things: U (4x4), s (a flat length-4 array — NOT a diagonal matrix), and Vt (4x4, already transposed).",
            "The spectrum [5. 3. 3. 1.] is sorted descending and non-negative — both are guarantees of SVD, unlike eig.",
            "`U @ np.diag(s) @ Vt` rebuilds A to floating-point precision: rotate, stretch, rotate — verified by allclose.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.linalg.svd",
          purpose: "Factor any matrix (square or rectangular) as U @ diag(s) @ Vt, exposing its singular-value spectrum.",
          signature: "np.linalg.svd(a, full_matrices=True, compute_uv=True, hermitian=False)",
          purposeDetail:
            "`svd` is the crown jewel of numerical linear algebra: the one decomposition that exists for EVERY matrix. Where eig demands square and eigh demands symmetry, svd factors anything into a rotation, a stretch, and a rotation — and the stretch amounts (the singular values, non-negative and sorted) rank the matrix's directions by importance. That ranking is the compression idea: keep the biggest singular values, zero the rest, and you have the best possible low-rank approximation of A for its rank — the mathematics behind recommender systems, PCA, and pinv (which is literally svd with the surviving values inverted).",
          params: [
            {
              name: "a",
              type: "array_like, shape (n, m)",
              required: true,
              description: "Any matrix — square, tall, wide, rank-deficient: svd handles every shape.",
              example: "a (4, 4) or (100, 20) data matrix",
            },
            {
              name: "full_matrices",
              type: "bool",
              description: "True (default) returns full-size U and Vt; False returns the economy version whose factors are exactly as big as the rank allows — what you want for data work.",
              example: "full_matrices=False",
            },
            {
              name: "compute_uv",
              type: "bool",
              description: "False skips U and Vt and returns only the spectrum (like eigvals, but for every matrix).",
              example: "compute_uv=False",
            },
            {
              name: "hermitian",
              type: "bool",
              description: "True when a is symmetric/Hermitian: lets svd use the cheaper eigh route internally.",
              example: "hermitian=True",
            },
          ],
          returns: {
            type: "tuple of 3 (or 1)",
            description: "(U, s, Vt): orthonormal U, the 1-D array s of singular values (sorted, non-negative), and orthonormal Vt — the transpose already applied. With compute_uv=False, just s.",
          },
          example: `import numpy as np

A = np.array([[3.0, 1.0, 0.0, 1.0],
              [1.0, 3.0, 1.0, 0.0],
              [0.0, 1.0, 3.0, 1.0],
              [1.0, 0.0, 1.0, 3.0]])

U, s, Vt = np.linalg.svd(A)
print("spectrum:", s)
print("non-negative and sorted:", bool((s >= 0).all()), bool((np.diff(s) <= 0).all()))
print("reconstruct:", np.allclose(A, U @ np.diag(s) @ Vt))

# a rectangular matrix decomposes just as happily
B = np.array([[1.0, 0.0, 2.0],
              [0.0, 3.0, 0.0]])
Ub, sb, Vtb = np.linalg.svd(B, full_matrices=False)
print("3x2 spectrum:", sb)
print("reconstruct 3x2:", np.allclose(B, Ub @ np.diag(sb) @ Vtb))
`,
          exampleOutput: `spectrum: [5. 3. 3. 1.]
non-negative and sorted: True True
reconstruct: True
3x2 spectrum: [3.         2.23606798]
reconstruct 3x2: True`,
          commonMistakes: [
            {
              mistake: "Expecting the middle return to be a diagonal matrix.",
              why: "s is a flat 1-D array of the singular values — the diagonal is implied. Math with it needs np.diag(s) to become a matrix again.",
              fix: "For reconstruction: A_approx = U @ np.diag(s) @ Vt. For energy: work with s directly (squares, sums) — the flat form is usually the convenient one.",
            },
            {
              mistake: "Forgetting Vt comes pre-transposed.",
              why: "The third return is V-transposed; treating its rows as the wrong axis mixes up directions and components.",
              fix: "Rows of Vt are the right singular vectors (the component directions in PCA); columns of V would be — but you were handed Vt.",
            },
            {
              mistake: "Calling svd on a tall data matrix without full_matrices=False and being surprised by the huge U.",
              why: "With full_matrices=True (default), a (1000, 5) matrix returns a (1000, 1000) U — 99.5% of it padding.",
              fix: "For data work pass full_matrices=False: U becomes (1000, 5), everything else stays honest, and nothing else changes.",
            },
          ],
          related: [
            { name: "np.linalg.eig", relation: "The square-matrix cousin; singular values of A are the sqrt of eigenvalues of A.T @ A." },
            { name: "np.linalg.pinv", relation: "Literally svd with the nonzero singular values inverted — the never-crashes inverse of Lesson h-03." },
            { name: "np.linalg.lstsq", relation: "Solves least squares via this decomposition under the hood." },
          ],
          applications: [
            "Recommender systems: truncate the spectrum of a ratings matrix to predict missing ratings",
            "PCA: SVD of the centered data matrix — the honest route, below",
            "Data compression and noise filtering: keep the big singular values, drop the small",
          ],
          notes:
            "The singular values of a symmetric positive matrix relate to eigenvalues simply (s = abs of eigenvalues), but in general s are the square roots of A.T @ A's eigenvalues. The spectrum's squared shares are called the energy — the quantity the low-rank block below trades in.",
        },
        {
          kind: "heading",
          text: "Low-rank approximation: keep the big numbers",
        },
        {
          kind: "text",
          text: "Here is the compression idea in one breath: **rebuild the matrix from only its largest singular values and it stays almost itself.** Set the small ones to zero, multiply the three factors back, and you get the best possible approximation of A at that rank — best in the least-squares sense, a theorem (Eckart-Young) you now have the tools to verify empirically. Let us keep 2 of our 4 singular values and measure what it cost:",
        },
        {
          kind: "code",
          title: "Keep 2 of 4: the error and the energy",
          code: `import numpy as np

A = np.array([[3.0, 1.0, 0.0, 1.0],
              [1.0, 3.0, 1.0, 0.0],
              [0.0, 1.0, 3.0, 1.0],
              [1.0, 0.0, 1.0, 3.0]])
U, s, Vt = np.linalg.svd(A)

s2 = s.copy()
s2[2:] = 0.0                          # keep the top 2, zero the rest
A_rank2 = U @ np.diag(s2) @ Vt

error = np.linalg.norm(A - A_rank2)   # Frobenius norm of what we dropped
energy = (s2 ** 2).sum() / (s ** 2).sum()

print("kept singular values   :", s2)
print("dropped singular values:", s[2:])
print("reconstruction error   :", round(error, 4))
print("energy kept            :", round(energy * 100, 1), "percent")
`,
          output: `kept singular values   : [5. 3. 0. 0.]
dropped singular values: [3. 1.]
reconstruction error   : 3.1623
energy kept            : 77.3 percent`,
          outputNote:
            "We dropped singular values 3 and 1, paid a Frobenius error of 3.1623 (exactly sqrt(9 + 1)), and still kept 77.3 percent of the matrix's energy: two numbers carry most of the picture.",
          explain: [
            "`s2[2:] = 0.0` — the whole compression step: keep the top of the spectrum, zero the tail, rebuild with the same U and Vt.",
            "The error 3.1623 is no accident: it is sqrt(3 squared + 1 squared), the Frobenius norm of the dropped part — exactly the dropped singular values combined.",
            "Energy is measured in squared singular values (like variance): 34 of 44 total, or 77.3 percent, survives in a rank-2 copy of a rank-4 matrix.",
            "This is the whole trick behind real compression: when the spectrum decays fast, the first few directions carry nearly everything.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The rank-2 reconstruction, cell by cell",
          mode: "explore",
          name: "A_rank2",
          caption:
            "The compressed matrix itself (rounded to 2 decimals). Compare it with the original [[3, 1, 0, 1], [1, 3, 1, 0], [0, 1, 3, 1], [1, 0, 1, 3]]: every cell moved a little, no cell moved a lot — and this entire grid is generated by just 2 numbers (the surviving singular values) plus shared direction vectors. Two numbers carry 77.3 percent of the picture.",
          data: [
            [1.25, 1.25, 1.25, 1.25],
            [1.25, 2.75, 1.25, -0.25],
            [1.25, 1.25, 1.25, 1.25],
            [1.25, -0.25, 1.25, 2.75],
          ],
          labels: {
            rows: ["row 0", "row 1", "row 2", "row 3"],
            cols: ["col 0", "col 1", "col 2", "col 3"],
          },
          dtype: "float64",
        },
        {
          kind: "heading",
          text: "PCA, honestly",
        },
        {
          kind: "text",
          text: "You now have every piece of **principal component analysis**, so let us assemble it and claim nothing more than what happens. PCA answers: my data cloud is stretched along some directions more than others — which directions carry the most variance? The honest core recipe: **center each column (subtract its mean), take the SVD of the centered data, and read the principal components from the rows of Vt.** Run it on ten 2-D points that mostly scatter along a diagonal:",
        },
        {
          kind: "code",
          title: "The core of PCA in six lines",
          code: `import numpy as np

data = np.array([[2.5, 2.4],
                 [0.5, 0.7],
                 [2.2, 2.9],
                 [1.9, 2.2],
                 [3.1, 3.0],
                 [2.3, 2.7],
                 [2.0, 1.6],
                 [1.0, 1.1],
                 [1.5, 1.6],
                 [1.1, 0.9]])

centered = data - data.mean(axis=0)          # step 1: center the columns
U, s, Vt = np.linalg.svd(centered, full_matrices=False)
components = Vt                               # step 2-3: rows of Vt

print("column means     :", np.round(data.mean(axis=0), 2))
print("singular values  :", np.round(s, 4))
print("first component  :", np.round(components[0], 4))
print("energy of first  :", round((s[0] ** 2) / (s ** 2).sum() * 100, 1), "percent")
print("first 3 scores   :", np.round(centered @ components[0], 3)[:3])
`,
          output: `column means     : [1.81 1.91]
singular values  : [3.3994 0.6646]
first component  : [-0.6779 -0.7352]
energy of first  : 96.3 percent
first 3 scores   : [-0.828  1.778 -0.992]`,
          outputNote:
            "After centering (means 1.81 and 1.91 drop to 0), the spectrum is [3.3994, 0.6646]: the first direction alone carries 96.3 percent of the variance. On this build the first component prints as about [-0.68, -0.74] — negate it and it is the same line through the cloud, just walked in the opposite direction.",
          explain: [
            "`data - data.mean(axis=0)` — the Part G broadcast pattern: one mean per column, subtracted from every row. Without this step, the 'first component' would just point at the data's offset from the origin.",
            "The spectrum [3.3994, 0.6646] is extremely lopsided: the cloud is essentially one-dimensional plus noise.",
            "`components[0]` (row 0 of Vt) is the principal direction — the line the cloud stretches along. Its sign is arbitrary (a direction, not an arrow); its slope is the invariant.",
            "`centered @ components[0]` projects each point onto that direction: the famous PCA scores, i.e. each point's position along the main trend.",
            "That is the honest claim: center, decompose, read components. Libraries add conventions (sign fixing, whitening, inverse transforms) — the core is what you just ran.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "What we will and will not claim",
          text: "This lesson shows the core of PCA: column centering, SVD, components as rows of Vt, and energy shares from the spectrum. It does not claim you have built a full PCA library — real implementations add sign conventions, whitening, inverse transforms, and chosen component counts. The machine learning connection is real, and it is exactly as deep as what you ran.",
        },
        {
          kind: "tryIt",
          title: "Walk the compression dial",
          task:
            "One matrix, four compression levels. Run the starter and watch the trade: as you keep fewer singular values, the error grows and the energy falls. Then: (1) predict (before running) which keep-level has error exactly 3.1623; (2) add a keep=0 row and explain its error; (3) swap in the 2-D data cloud from the PCA block (after centering) and read off its energy with keep=1.",
          code: `import numpy as np

A = np.array([[3.0, 1.0, 0.0, 1.0],
              [1.0, 3.0, 1.0, 0.0],
              [0.0, 1.0, 3.0, 1.0],
              [1.0, 0.0, 1.0, 3.0]])
U, s, Vt = np.linalg.svd(A)

for keep in (4, 3, 2, 1):
    s_k = s.copy()
    s_k[keep:] = 0.0
    A_k = U @ np.diag(s_k) @ Vt
    err = np.linalg.norm(A - A_k)
    energy = (s_k ** 2).sum() / (s ** 2).sum() * 100
    print("keep", keep, "-> error", round(err, 4), " energy", round(energy, 1), "percent")
`,
          hint: "The error is always the Frobenius norm of the dropped part: sqrt of the sum of the dropped singular values squared. For keep=1: sqrt(9 + 9 + 1).",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Eigenvectors are the directions a machine only stretches; eigenvalues are the stretch factors (verify with allclose, never trusting order or signs). Symmetric matrices get eigh: real, ascending, orthonormal. SVD factors EVERY matrix as U @ diag(s) @ Vt with a sorted, non-negative spectrum — keep the big singular values and you keep most of the matrix. Center, SVD, read Vt: that is the core of PCA.",
        },
      ],
      terms: [
        { term: "Eigenvalue / eigenvector", definition: "A direction-stretch pair of a square matrix: A @ v = lam * v. The direction survives the machine; the scalar says how it scales." },
        { term: "Spectrum", definition: "The ranked list of a matrix's strengths: its eigenvalues (for eig) or singular values (for svd)." },
        { term: "Singular value", definition: "A stretch factor in the SVD: non-negative, sorted descending, defined for every matrix — the square root of an eigenvalue of A.T @ A." },
        { term: "Singular value decomposition (SVD)", definition: "The universal factorization A = U @ diag(s) @ Vt: a rotation, a stretch, a rotation — existing for every matrix." },
        { term: "Low-rank approximation", definition: "Rebuilding a matrix from only its largest singular values: the best approximation at that rank, trading measured error for kept energy." },
        { term: "Energy", definition: "A direction's squared singular value (or eigenvalue); the share kept by an approximation is the sum of the kept squares over the total." },
        { term: "Principal component", definition: "A row of Vt from the SVD of column-centered data: a direction of the data cloud, ranked by the variance it carries." },
      ],
      mistakes: [
        {
          mistake: "Trusting eigenvalue order or eigenvector signs across runs, libraries, or versions.",
          why: "The pairs are fixed mathematics, but their packaging order and each vector's sign are implementation choices — and eigvals/eigh/svd each make different promises about ordering.",
          fix: "Sort values when order matters, never test signs, and verify relationships with allclose on A @ v versus lam * v — sign-robust and order-robust by construction.",
        },
        {
          mistake: "Reading eigenvectors from the rows of the returned matrix.",
          why: "Both eig and eigh pack one eigenvector per COLUMN; the matrix is square, so the wrong read silently produces plausible-looking nonsense.",
          fix: "vecs[:, k] for eigenvector k. Print rounded columns until the habit is automatic.",
        },
        {
          mistake: "Using eig (or skipping eigh) on symmetric and covariance matrices.",
          why: "Symmetry guarantees real eigenvalues and orthonormal vectors, but the general eig returns complex-typed values with 0j clutter and no ordering promise.",
          fix: "Symmetric input: np.linalg.eigh — real, ascending, orthonormal, faster. That is the covariance tool.",
        },
        {
          mistake: "Running 'PCA' on uncentered data.",
          why: "Without subtracting the column means, the first component dutifully points at the data's offset from the origin — an answer about location, not shape.",
          fix: "centered = data - data.mean(axis=0) before the SVD, every time. It is the one line that separates PCA from 'big SVD'.",
        },
      ],
      takeaways: [
        "An eigenvector is a direction the machine only stretches: A @ v = lam * v, verified with allclose — never trusting order or signs.",
        "Symmetric matrices (covariance among them) get eigh: real eigenvalues ascending, orthonormal eigenvectors, exact rebuild Q @ diag(w) @ Q.T.",
        "matrix_power(A, n) equals repeated @ (verified) and defines A-to-the-0 as the identity.",
        "SVD factors EVERY matrix as U @ diag(s) @ Vt; the spectrum is non-negative and sorted, and reconstruction is exact.",
        "Zero the small singular values and rebuild: measured error (3.1623 here) for kept energy (77.3 percent here) — the compression idea behind recommenders and PCA.",
        "PCA's honest core: center the columns, SVD, components = rows of Vt — no more claimed, and nothing less.",
      ],
      quiz: [
        {
          id: "h-04-q1",
          prompt: "np.linalg.eig returns (vals, vecs) for a square matrix. Where do you find the eigenvector paired with vals[0]?",
          options: [
            { text: "vecs[0] — the first row", correct: false, feedback: "Rows mix coordinates of ALL eigenvectors; vecs[0] is 'the first coordinate of each eigenvector', not one vector." },
            { text: "vecs[:, 0] — the first column", correct: true, feedback: "Correct: eig packs one eigenvector per column, so column k pairs with vals[k]." },
            { text: "vecs[-1] — the last row", correct: false, feedback: "Same trap from the other end: rows are coordinate-slices, columns are the vectors." },
            { text: "The eigenvector is the return value of vals[0]", correct: false, feedback: "vals is a flat array of scalars (the eigenvalues); the vectors live in the second return value." },
          ],
          explanation: "One eigenvector per COLUMN, matched to vals by index — vecs[:, k]. This packing convention is the single most common eig bug.",
        },
        {
          id: "h-04-q2",
          prompt: "Which statement about the singular values returned by np.linalg.svd is TRUE?",
          options: [
            { text: "They can be negative, and their order depends on the matrix's shape", correct: false, feedback: "Neither half is right: singular values are defined as non-negative, and svd returns them sorted descending for every matrix." },
            { text: "They are always non-negative and sorted largest-first, for every matrix — square or rectangular", correct: true, feedback: "Correct: both properties are guarantees of the decomposition itself, unlike eigenvalue ordering, which is implementation-defined." },
            { text: "They equal the eigenvalues of the matrix whenever it is square", correct: false, feedback: "Only for symmetric positive semi-definite matrices (up to sorting); in general they are the square roots of A.T @ A's eigenvalues." },
            { text: "They come back as a diagonal matrix matching the input's shape", correct: false, feedback: "s is a flat 1-D array; wrap it with np.diag(s) when you need the diagonal matrix for reconstruction." },
          ],
          explanation: "The spectrum's non-negativity and descending order are guaranteed — which is precisely what makes truncating it a principled compression.",
        },
        {
          id: "h-04-q3",
          prompt: "You keep 2 of 4 singular values when compressing a matrix, and the kept energy is 77.3 percent. What does that number mean?",
          options: [
            { text: "77.3 percent of the matrix's cells are reproduced exactly", correct: false, feedback: "Nothing is cell-exact: the whole reconstruction differs slightly everywhere. Energy is measured in squared singular values, not cell counts." },
            { text: "The squared singular values you kept account for 77.3 percent of the sum of all squared singular values — most of the matrix's variance survives", correct: true, feedback: "Correct: energy = sum of kept s-squared over sum of all s-squared. The dropped directions contributed only 22.7 percent." },
            { text: "The reconstruction error is 77.3 percent of the original matrix", correct: false, feedback: "The error is the norm of the dropped part (3.1623 in our example) — a different quantity from the energy share, which counts what SURVIVED." },
            { text: "77.3 is the count of floating-point operations saved", correct: false, feedback: "Energy is a mathematical share of squared spectrum, not a performance measurement." },
          ],
          explanation: "Energy counts what survives (kept squares over total squares); the Frobenius error counts what was lost. Fast-decaying spectra mean high energy in few directions — the whole basis of compression.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part H exercises (tiered: 4 beginner, 4 intermediate, 4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "h-b1",
      tier: "beginner",
      title: "Two products, one pair of matrices",
      prompt:
        "Given `M = [[2, 1], [0, 3]]` and `N = [[4, 0], [1, 2]]` (both 2x2), compute and print BOTH products: first `M * N` (elementwise) with a label, then `M @ N` (matrix product) with a label. Expected output: two labeled 2x2 integer grids — the elementwise one is [[8, 0], [0, 6]] because cells pair up, while the matmul one is [[9, 2], [3, 6]] because rows meet columns. Predict both on paper before running.",
      hint: "* pairs matching cells: 2*4, 1*0, 0*1, 3*2. @ dots rows with columns: cell (0, 0) is row [2, 1] dotted with column [4, 1] = 2*4 + 1*1 = 9.",
      starter: `import numpy as np

M = np.array([[2, 1],
              [0, 3]])
N = np.array([[4, 0],
              [1, 2]])

# TODO: print M * N with a label, then M @ N with a label
`,
      solution: `import numpy as np

M = np.array([[2, 1],
              [0, 3]])
N = np.array([[4, 0],
              [1, 2]])

print("M * N (elementwise):")
print(M * N)
print("M @ N (matrix product):")
print(M @ N)
`,
      expectedOutput: `M * N (elementwise):
[[8 0]
 [0 6]]
M @ N (matrix product):
[[9 2]
 [3 6]]`,
      concepts: ["elementwise product", "matrix product", "@ operator"],
    },
    {
      id: "h-b2",
      tier: "beginner",
      title: "The shape walk",
      prompt:
        "Build `A = np.arange(6).reshape(2, 3)` and `B = np.arange(12).reshape(3, 4)`. Print A's shape, B's shape, and the shape of `A @ B` — write the inner-dimension prediction on paper first: (n, k) @ (k, m) -> (n, m). Then print one boolean proving the identity matrix is the do-nothing machine: `np.allclose(np.eye(3) @ B, B)`. Expected output: three shape tuples, (2, 3), (3, 4) and (2, 4), followed by True.",
      hint: "Circle the middle numbers: (2, 3) @ (3, 4) — the touching 3s must match, and the outer 2 and 4 survive. eye(3) has the right height to sit on the left of B.",
      starter: `import numpy as np

A = np.arange(6).reshape(2, 3)
B = np.arange(12).reshape(3, 4)

# TODO: print A.shape, B.shape, (A @ B).shape, then allclose(eye(3) @ B, B)
`,
      solution: `import numpy as np

A = np.arange(6).reshape(2, 3)
B = np.arange(12).reshape(3, 4)

print(A.shape)
print(B.shape)
print((A @ B).shape)
print(np.allclose(np.eye(3) @ B, B))
`,
      expectedOutput: `(2, 3)
(3, 4)
(2, 4)
True`,
      concepts: ["shape rule", "matmul", "identity matrix"],
    },
    {
      id: "h-b3",
      tier: "beginner",
      title: "One receipt, two tools",
      prompt:
        "A receipt: `prices = [1.50, 3.00, 0.50]` and `quantities = [2, 1, 4]`. Compute the total cost with ONE dot product (no loop, no manual sum) and print it. On a second line, print the length (default L2 norm) of the vector `[3.0, 4.0]` with np.linalg.norm. Expected output: two numbers — the total 8.0 and the classic 5.0, the hypotenuse of a 3-4-5 triangle.",
      hint: "prices @ quantities multiplies matching entries and adds them in one call. The norm of [3, 4] is sqrt(9 + 16).",
      starter: `import numpy as np

prices = np.array([1.50, 3.00, 0.50])
quantities = np.array([2, 1, 4])

# TODO: print the dot-product total, then the norm of [3.0, 4.0]
`,
      solution: `import numpy as np

prices = np.array([1.50, 3.00, 0.50])
quantities = np.array([2, 1, 4])

print(prices @ quantities)
print(np.linalg.norm(np.array([3.0, 4.0])))
`,
      expectedOutput: `8.0
5.0`,
      concepts: ["dot product", "np.linalg.norm", "weighted sum"],
    },
    {
      id: "h-b4",
      tier: "beginner",
      title: "Solve, then prove it",
      prompt:
        "Solve the 2x2 system `2x + y = 5` and `x + 3y = 10` with np.linalg.solve (build A and b, print the solution x). Then prove the answer satisfies the system: print `np.allclose(A @ x, b)`. Expected output: the solution vector [1. 3.] and then True — one product turns the unknowns back into exactly the right-hand sides.",
      hint: "A = np.array([[2.0, 1.0], [1.0, 3.0]]), b = np.array([5.0, 10.0]). The verification line is A @ x — the machine run forward with your answer inside.",
      starter: `import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 3.0]])
b = np.array([5.0, 10.0])

# TODO: solve for x, print it, then print allclose(A @ x, b)
`,
      solution: `import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 3.0]])
b = np.array([5.0, 10.0])

x = np.linalg.solve(A, b)
print(x)
print(np.allclose(A @ x, b))
`,
      expectedOutput: `[1. 3.]
True`,
      concepts: ["np.linalg.solve", "solution verification", "square systems"],
    },
    {
      id: "h-i1",
      tier: "intermediate",
      title: "Similar documents, measured",
      prompt:
        "Two tiny documents as word-count vectors over a 5-word vocabulary: `doc = [2, 1, 0, 3, 0]` and `query = [1, 0, 0, 1, 2]`. Compute their cosine similarity — dot product divided by the product of the two norms — and print it rounded to 4 decimals. Then print the dot product of the two unit axes `[1.0, 0.0]` and `[0.0, 1.0]` to watch orthogonality produce exactly 0. Expected output: 0.5455 and then 0.0.",
      hint: "cos = (doc @ query) / (np.linalg.norm(doc) * np.linalg.norm(query)). The two axes share no word, so every product term is zero before the sum even starts.",
      starter: `import numpy as np

doc = np.array([2, 1, 0, 3, 0])
query = np.array([1, 0, 0, 1, 2])

# TODO: print cosine similarity (4 decimals), then dot of [1,0] and [0,1]
`,
      solution: `import numpy as np

doc = np.array([2, 1, 0, 3, 0])
query = np.array([1, 0, 0, 1, 2])

cos = (doc @ query) / (np.linalg.norm(doc) * np.linalg.norm(query))
print(round(cos, 4))
print(np.array([1.0, 0.0]) @ np.array([0.0, 1.0]))
`,
      expectedOutput: `0.5455
0.0`,
      concepts: ["cosine similarity", "dot product", "orthogonality"],
    },
    {
      id: "h-i2",
      tier: "intermediate",
      title: "Cast the shadow",
      prompt:
        "Project the vector `signal = [3.0, 4.0]` onto the direction `direction = [1.0, 1.0]`. First build the unit vector u (direction divided by its norm) and print it rounded to 4 decimals; then print the shadow length (signal dotted with u, rounded to 4 decimals); then the shadow vector itself (length times u, rounded to 4 decimals). Expected output: u is [0.7071 0.7071], the shadow length is 4.9497, and the shadow vector is [3.5 3.5] — the piece of the signal that points along the diagonal.",
      hint: "u = direction / np.linalg.norm(direction); shadow_length = signal @ u; shadow_vector = shadow_length * u. Round only when printing — compute with the full-precision values.",
      starter: `import numpy as np

signal = np.array([3.0, 4.0])
direction = np.array([1.0, 1.0])

# TODO: print the unit vector, the shadow length, and the shadow vector (rounded)
`,
      solution: `import numpy as np

signal = np.array([3.0, 4.0])
direction = np.array([1.0, 1.0])

u = direction / np.linalg.norm(direction)
shadow_length = signal @ u
shadow_vector = shadow_length * u

print(np.round(u, 4))
print(round(shadow_length, 4))
print(np.round(shadow_vector, 4))
`,
      expectedOutput: `[0.7071 0.7071]
4.9497
[3.5 3.5]`,
      concepts: ["projection", "unit vector", "dot product"],
    },
    {
      id: "h-i3",
      tier: "intermediate",
      title: "Fit the line through five noisy points",
      prompt:
        "Five measurements: `x = [0, 1, 2, 3, 4]` and `y = [1.0, 3.1, 4.9, 7.2, 8.8]` (the truth was y = 2x + 1, plus noise). Build the design matrix with np.column_stack([x, np.ones_like(x)]), fit the best [slope, intercept] with np.linalg.lstsq (pass rcond=None), and print the coefficients rounded to 4 decimals plus the rank. Then solve the same fit through the normal equations — np.linalg.solve(A.T @ A, A.T @ y) — and print one boolean: np.allclose of the two coefficient vectors. Expected output: [1.97 1.06], then rank 2, then True — both doors, same answer.",
      hint: "lstsq returns four things; the coefficients are the first. The normal equations A.T @ A x = A.T @ y are square now, so solve accepts them. Compare with allclose, not ==.",
      starter: `import numpy as np

x = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
y = np.array([1.0, 3.1, 4.9, 7.2, 8.8])
A = np.column_stack([x, np.ones_like(x)])

# TODO: lstsq fit (print coef rounded + rank), normal-equations fit, allclose check
`,
      solution: `import numpy as np

x = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
y = np.array([1.0, 3.1, 4.9, 7.2, 8.8])
A = np.column_stack([x, np.ones_like(x)])

coef, _, rank, _ = np.linalg.lstsq(A, y, rcond=None)
print(np.round(coef, 4))
print(rank)

coef_normal = np.linalg.solve(A.T @ A, A.T @ y)
print(np.allclose(coef, coef_normal))
`,
      expectedOutput: `[1.97 1.06]
2
True`,
      concepts: ["np.linalg.lstsq", "normal equations", "line fitting"],
    },
    {
      id: "h-i4",
      tier: "intermediate",
      title: "One stack, two operators",
      prompt:
        "Build `stack_A = np.arange(24).reshape(2, 3, 4)` and `stack_B = np.arange(40).reshape(2, 4, 5)` — two batches of matrices. Print the shape of np.matmul(stack_A, stack_B), then the shape of np.dot(stack_A, stack_B), then one boolean: np.allclose comparing element 0 of the matmul result with `stack_A[0] @ stack_B[0]`. Expected output: (2, 3, 5) — matmul broadcasts over the leading batch axis and multiplies matching stack elements — then (2, 3, 2, 5) for dot, then True.",
      hint: "matmul treats the leading axes as a batch (broadcast like Part G) and follows the (n, k) @ (k, m) rule on the last two axes. dot instead contracts the last axis of A with the second-to-last of B, producing a bigger result. Both are legal; only one is what you usually mean.",
      starter: `import numpy as np

stack_A = np.arange(24).reshape(2, 3, 4)
stack_B = np.arange(40).reshape(2, 4, 5)

# TODO: print matmul shape, dot shape, and allclose(matmul[0], stack_A[0] @ stack_B[0])
`,
      solution: `import numpy as np

stack_A = np.arange(24).reshape(2, 3, 4)
stack_B = np.arange(40).reshape(2, 4, 5)

print(np.matmul(stack_A, stack_B).shape)
print(np.dot(stack_A, stack_B).shape)
print(np.allclose(np.matmul(stack_A, stack_B)[0], stack_A[0] @ stack_B[0]))
`,
      expectedOutput: `(2, 3, 5)
(2, 3, 2, 5)
True`,
      concepts: ["batched matmul", "np.dot", "stacked arrays"],
    },
    {
      id: "h-a1",
      tier: "advanced",
      title: "Verify an eigenpair",
      prompt:
        "Symmetric matrix `A = [[2, 1], [1, 2]]`. Run np.linalg.eigh (the right tool for symmetric matrices) and print the eigenvalues rounded to 6 decimals (they come back sorted ascending). Then take the eigenvector paired with the FIRST eigenvalue — column 0 of the second return value — and print `A @ v` and `lam * v` on two lines (both rounded to 6), followed by `np.allclose(A @ v, lam * v)`. Expected output: eigenvalues [1. 3.], two matching vectors, then True — the machine only stretches its eigenvector.",
      hint: "vals, vecs = np.linalg.eigh(A). The eigenvector for vals[0] is vecs[:, 0] — a COLUMN, not a row. allclose is sign-robust, so the vector's arbitrary direction never matters.",
      starter: `import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 2.0]])

# TODO: eigh, print sorted vals; print A @ v and lam * v; print allclose proof
`,
      solution: `import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 2.0]])

vals, vecs = np.linalg.eigh(A)
print(np.round(vals, 6))

v = vecs[:, 0]
print(np.round(A @ v, 6))
print(np.round(vals[0] * v, 6))
print(np.allclose(A @ v, vals[0] * v))
`,
      expectedOutput: `[1. 3.]
[-0.707107  0.707107]
[-0.707107  0.707107]
True`,
      concepts: ["np.linalg.eigh", "eigenpair", "verification with allclose"],
    },
    {
      id: "h-a2",
      tier: "advanced",
      title: "Rebuild from the spectrum",
      prompt:
        "Rectangular matrix `A = [[2, 0, 1, 0], [0, 3, 0, 1], [1, 0, 2, 0]]` (3x4). Run np.linalg.svd with full_matrices=False, rebuild the matrix as U @ np.diag(s) @ Vt, and print three lines: the singular values rounded to 4 decimals, the boolean np.allclose(A, rebuilt), and the Frobenius norm computed two ways — np.sqrt((s ** 2).sum()) and np.linalg.norm(A) — both rounded to 4 decimals. Expected output: the spectrum [3.1623 3. 1.], then True, then 4.4721 twice — the squared spectrum IS the squared Frobenius norm.",
      hint: "full_matrices=False keeps U at (3, 3) and Vt at (3, 4) so the diagonal of s slots straight into the product. diag(s), not s itself — s arrives as a flat 1-D array.",
      starter: `import numpy as np

A = np.array([[2.0, 0.0, 1.0, 0.0],
              [0.0, 3.0, 0.0, 1.0],
              [1.0, 0.0, 2.0, 0.0]])

# TODO: svd (full_matrices=False), rebuild, print s, allclose, and the norm two ways
`,
      solution: `import numpy as np

A = np.array([[2.0, 0.0, 1.0, 0.0],
              [0.0, 3.0, 0.0, 1.0],
              [1.0, 0.0, 2.0, 0.0]])

U, s, Vt = np.linalg.svd(A, full_matrices=False)
rebuilt = U @ np.diag(s) @ Vt

print(np.round(s, 4))
print(np.allclose(A, rebuilt))
print(round(np.sqrt((s ** 2).sum()), 4), round(np.linalg.norm(A), 4))
`,
      expectedOutput: `[3.1623 3.     1.    ]
True
4.4721 4.4721`,
      concepts: ["np.linalg.svd", "reconstruction", "Frobenius norm"],
    },
    {
      id: "h-a3",
      tier: "advanced",
      title: "One number carries most of the picture",
      prompt:
        "Compress `A = [[3, 1, 1, 1], [1, 3, 1, 1], [1, 1, 3, 1], [1, 1, 1, 3]]` (3s on the diagonal, 1s elsewhere) down to rank 1. Run np.linalg.svd, keep ONLY the top singular value (zero out s[1:]), rebuild A_k = U @ np.diag(s_k) @ Vt, and print three lines: the full spectrum rounded to 4 decimals, the Frobenius reconstruction error np.linalg.norm(A - A_k) rounded to 4 decimals, and the energy share (kept squared over total squared, as a percentage rounded to 1 decimal). Expected output: spectrum [6. 2. 2. 2.], error 3.4641 — exactly sqrt(12) — and 75.0 percent.",
      hint: "Copy before you zero: s_k = s.copy(); s_k[1:] = 0.0. The dropped singular values are 2, 2, 2, so the error is sqrt(4 + 4 + 4). Energy uses SQUARES: 36 over 36 + 4 + 4 + 4.",
      starter: `import numpy as np

A = np.array([[3.0, 1.0, 1.0, 1.0],
              [1.0, 3.0, 1.0, 1.0],
              [1.0, 1.0, 3.0, 1.0],
              [1.0, 1.0, 1.0, 3.0]])

# TODO: svd, keep only s[0], rebuild, print spectrum, error, and energy percent
`,
      solution: `import numpy as np

A = np.array([[3.0, 1.0, 1.0, 1.0],
              [1.0, 3.0, 1.0, 1.0],
              [1.0, 1.0, 3.0, 1.0],
              [1.0, 1.0, 1.0, 3.0]])

U, s, Vt = np.linalg.svd(A)
s_k = s.copy()
s_k[1:] = 0.0
A_k = U @ np.diag(s_k) @ Vt

print(np.round(s, 4))
print(round(np.linalg.norm(A - A_k), 4))
print(round((s_k ** 2).sum() / (s ** 2).sum() * 100, 1))
`,
      expectedOutput: `[6. 2. 2. 2.]
3.4641
75.0`,
      concepts: ["low-rank approximation", "svd", "energy share"],
    },
    {
      id: "h-a4",
      tier: "advanced",
      title: "Fix the crash: the duplicated measurement",
      prompt:
        "The starter crashes with `numpy.linalg.LinAlgError: Singular matrix` — read the traceback before touching anything. The cause: A's second row is exactly twice its first (the second sensor's reading was recorded as a doubled copy of the first), so A has no inverse and solve refuses. Fix it with np.linalg.pinv — the always-works cousin — and print the minimum-norm solution rounded to 4 decimals, plus the boolean np.allclose(A @ x, b). Expected output: the solution [0.6 1.2] and True — b lies in A's range, so the residual vanishes even though A is singular.",
      hint: "x = np.linalg.pinv(A) @ b. pinv builds the pseudo-inverse from the SVD, quietly ignoring the redundant direction instead of crashing on it.",
      starter: `import numpy as np

# Two lab sensors, two unknowns. The second row was accidentally
# recorded as a doubled copy of the first (2x + 4y = 6 is just
# x + 2y = 3 multiplied by 2), so A is singular.
A = np.array([[1.0, 2.0],
              [2.0, 4.0]])
b = np.array([3.0, 6.0])

x = np.linalg.solve(A, b)
print(x)
`,
      solution: `import numpy as np

# The second row is a doubled copy of the first -- A stays singular,
# but pinv handles it: the minimum-norm least-squares solution.
A = np.array([[1.0, 2.0],
              [2.0, 4.0]])
b = np.array([3.0, 6.0])

x = np.linalg.pinv(A) @ b
print(np.round(x, 4))
print(np.allclose(A @ x, b))
`,
      expectedOutput: `[0.6 1.2]
True`,
      starterExpectError: "numpy.linalg.LinAlgError: Singular matrix",
      concepts: ["singular matrix", "np.linalg.pinv", "error reading"],
    },
  ],

  // ------------------------------------------------------------------
  // Part H assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "h-as-1",
      prompt: "A and B are both 2x2. Both `A * B` and `A @ B` run without error but return different numbers. What exactly is the difference?",
      options: [
        { text: "* pairs matching cells; @ dots each row of A with each column of B — two different operations that happen to be legal on the same shapes", correct: true, feedback: "Exactly: same-shaped square matrices allow both operators, which is precisely why picking the wrong one is a silent bug, not a crash." },
        { text: "* is for integer arrays and @ is for float arrays", correct: false, feedback: "Both operators accept any numeric dtype — the operator chooses the MATH, never the type." },
        { text: "@ is just a faster way to compute the same elementwise product", correct: false, feedback: "They return different values (run them side by side); if the numbers differ, they are not the same operation." },
        { text: "They give the same answer; only the printing of the result differs", correct: false, feedback: "On [[2, 1], [0, 3]] and [[4, 0], [1, 2]] the two operators return [[8, 0], [0, 6]] and [[9, 2], [3, 6]] — different grids." },
      ],
      explanation: "* is elementwise, @ is the matrix product (rows dotted with columns). When shapes allow both, only your intent can pick.",
    },
    {
      id: "h-as-2",
      prompt: "You hold a stack of two 3x4 matrices in an array A of shape (2, 3, 4) and a stack B of shape (2, 4, 5). What does `np.matmul(A, B)` return?",
      options: [
        { text: "Shape (2, 3, 5) — matmul broadcasts over the leading batch axis and multiplies matching stack elements", correct: true, feedback: "Right: the leading 2s broadcast together as a batch, and each pair multiplies (3, 4) @ (4, 5) -> (3, 5)." },
        { text: "Shape (2, 3, 2, 5) — dot semantics", correct: false, feedback: "That is what np.dot returns on these stacks — dot contracts different axes. matmul never merges the batch axis into the result." },
        { text: "An error: the inner dimensions 4 and 2 do not match", correct: false, feedback: "The batch axes are checked for broadcasting (2 == 2), not treated as inner dimensions; the true inner pair is 4 and 4, which matches." },
        { text: "Shape (6, 20) — the stacks are flattened first", correct: false, feedback: "No NumPy product flattens its operands; that behavior belongs to neither matmul nor dot." },
      ],
      explanation: "matmul on N-D inputs: leading axes are a batch (broadcasting like Part G), the last two axes follow (n, k) @ (k, m). Verified: (2, 3, 4) @ (2, 4, 5) -> (2, 3, 5), while np.dot gives (2, 3, 2, 5).",
    },
    {
      id: "h-as-3",
      prompt: "For the vector v = [3.0, 4.0], which trio gives np.linalg.norm(v) with the default ord, then ord=1, then ord=np.inf?",
      options: [
        { text: "5.0, 7.0, 4.0", correct: true, feedback: "Default L2 = sqrt(9 + 16) = 5; ord=1 sums absolute values = 7; ord=np.inf takes the largest absolute entry = 4." },
        { text: "7.0, 5.0, 4.0", correct: false, feedback: "Order matters: the DEFAULT is the Euclidean L2 norm (5.0); the sum-of-absolutes 7.0 is what ord=1 returns." },
        { text: "5.0, 7.0, 5.0", correct: false, feedback: "Close, but ord=np.inf is the LARGEST absolute entry (4.0), not the L2 norm repeated." },
        { text: "25.0, 7.0, 4.0", correct: false, feedback: "25 is the SQUARED length; norm returns the square root of the sum of squares." },
      ],
      explanation: "norm(v) = 5.0 (L2), norm(v, 1) = 7.0 (sum of |entries|), norm(v, np.inf) = 4.0 (max |entry|) — each verified in Lesson h-02.",
    },
    {
      id: "h-as-4",
      prompt: "Which expression computes the cosine similarity between the vectors p and q?",
      options: [
        { text: "(p @ q) / (np.linalg.norm(p) * np.linalg.norm(q))", correct: true, feedback: "The normalized dot product: agreement divided by both lengths, so only the ANGLE survives — scale drops out." },
        { text: "(p @ q) / np.linalg.norm(p)", correct: false, feedback: "You must divide by BOTH lengths; with only one, longer vectors score higher just for being long." },
        { text: "np.linalg.norm(p - q)", correct: false, feedback: "That is the Euclidean DISTANCE — a different measure that is sensitive to length, not just angle." },
        { text: "np.dot(p, q) / (p.size * q.size)", correct: false, feedback: "Array sizes have nothing to do with lengths; the denominators must be norms." },
      ],
      explanation: "Cosine similarity = dot / (norm * norm): 1 for parallel vectors, 0 for orthogonal ones, regardless of how long each vector is.",
    },
    {
      id: "h-as-5",
      prompt: "The professional default for solving a square, well-conditioned A x = b is np.linalg.solve(A, b). Why not np.linalg.inv(A) @ b?",
      options: [
        { text: "solve never forms the inverse: it is cheaper and more numerically stable, giving the same answer to machine precision", correct: true, feedback: "Correct on all three counts: less work, less floating-point noise, identical result. inv is for when you need the inverse ITSELF." },
        { text: "inv does not work on square matrices", correct: false, feedback: "It does — square and non-singular is exactly its case; the issue is cost and stability, not legality." },
        { text: "solve always works, even when A is singular", correct: false, feedback: "solve raises LinAlgError: Singular matrix on singular input; pinv and lstsq are the always-works cousins." },
        { text: "inv returns a copy of A rather than its inverse, so the product is wrong", correct: false, feedback: "inv genuinely inverts — the answer is right, but you paid more work and accepted more numerical noise to get it." },
      ],
      explanation: "Forming an explicit inverse does extra work and amplifies rounding error; solve factorizes and solves directly. Use inv only when the inverse itself is the deliverable, on small well-conditioned matrices.",
    },
    {
      id: "h-as-6",
      prompt: "You have 6 noisy data points and want the best straight line (2 unknowns: slope and intercept). np.linalg.lstsq(A, y) returns the coefficients that:",
      options: [
        { text: "Minimize the sum of squared residuals ||A @ coef - y|| squared — exactly what linear regression computes", correct: true, feedback: "Precisely: no line passes through all 6 noisy points, so lstsq returns the least-squares best — which IS linear regression, stated exactly." },
        { text: "Pass exactly through all 6 points", correct: false, feedback: "6 constraints, 2 unknowns, plus noise: no such line exists — that is why the problem is over-determined." },
        { text: "Minimize the single largest error instead of the total", correct: false, feedback: "That would be a min-max (Chebyshev) fit; lstsq minimizes the SUM OF SQUARES of all residuals." },
        { text: "Simply average the x's and the y's into one representative point", correct: false, feedback: "Means alone cannot produce a slope; every point's residual enters the least-squares objective." },
      ],
      explanation: "Over-determined systems have no exact solution; lstsq returns the x minimizing the total squared miss — the same coefficients linear regression fits.",
    },
    {
      id: "h-as-7",
      prompt: "v is an eigenvector of the square matrix A with eigenvalue lam. Which equation holds?",
      options: [
        { text: "A @ v == lam * v — the machine's output points along its input, stretched by lam", correct: true, feedback: "That is the whole definition: eigenvectors are the directions A does not turn, and lam is the stretch factor along them." },
        { text: "A @ v == v * A", correct: false, feedback: "v * A would try to broadcast elementwise (and generally fail or mean something else); the eigen-relation is a stretch ALONG v." },
        { text: "A @ v == lam", correct: false, feedback: "The left side is a vector and the right side a scalar; an equation needs both sides to be the same kind of object." },
        { text: "A @ v has no special relation to v — eigenpairs exist only for diagonal matrices", correct: false, feedback: "Every square matrix has eigenpairs, diagonal or not; diagonal matrices just display them on the diagonal." },
      ],
      explanation: "Eigenvector = a direction the machine only stretches; eigenvalue = the stretch. Lesson h-04 verified it numerically: allclose(A @ v, lam * v) is True.",
    },
    {
      id: "h-as-8",
      prompt: "U, s, Vt = np.linalg.svd(A) succeeded on a rectangular matrix A. Which statement is TRUE?",
      options: [
        { text: "With shapes that line up, U @ np.diag(s) @ Vt rebuilds A to machine precision, and s is non-negative and sorted largest-first", correct: true, feedback: "Both halves are guarantees of the decomposition: exact reconstruction (allclose-verified in Lesson h-04) and a non-negative, descending spectrum for every matrix." },
        { text: "svd only works on square symmetric matrices", correct: false, feedback: "SVD factors EVERY matrix, any shape — that universality is its superpower. It is np.linalg.eig that demands square input." },
        { text: "s comes back as a diagonal matrix the same shape as A", correct: false, feedback: "s is a flat 1-D array of the singular values; wrap it with np.diag yourself when rebuilding." },
        { text: "The singular values are the eigenvalues of A itself", correct: false, feedback: "They are the square roots of the eigenvalues of A.T @ A; only for symmetric positive semi-definite matrices do the two lists coincide (up to order)." },
      ],
      explanation: "Any matrix factors as U diag(s) Vt with s flat, non-negative and descending — which is exactly why zeroing the small end of the spectrum is a principled compression.",
    },
  ],

  // ------------------------------------------------------------------
  // Part H mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Recommender Core",
    brief:
      "Build the numeric core of a recommender system in about forty lines of NumPy: a tiny 5-user x 6-item ratings matrix with missing entries, mean-centered per user through a mask, a user-to-user cosine-similarity matrix, a neighborhood prediction for one missing rating, and an SVD low-rank compression with a measured error and energy share. Every number is deterministic — no randomness anywhere — and every idea (masked means, cosine similarity, low-rank reconstruction) is the real machinery inside production recommender systems, just at pocket size. When it is done, you will have used all four lessons of this part in one honest program.",
    requirements: [
      "A hand-built 5x6 ratings matrix (dtype float, ratings 1..5) plus its boolean mask (ratings > 0) — the value 0 means 'not rated' and must never be treated as a real rating",
      "A masked_means(ratings, mask) function: each user's mean over RATED items only, computed from row sums divided by mask counts",
      "A center_users(ratings, mask, means) function: each user's rated cells shifted by that user's own mean via a broadcast subtraction, with unrated cells left exactly 0.0 (np.where with the mask)",
      "A similarity_matrix(centered) function: the full 5x5 cosine-similarity matrix built from row-normalized centered ratings (normalized @ normalized.T), with 1.0 on the diagonal",
      "A predict(user, item, ...) function: the missing rating as a similarity-weighted average of the other raters' centered values, with the target user's mean added back — user 0, item 5 lands near 3.2",
      "An SVD step on the centered matrix with full_matrices=False: keep the top 2 singular values, rebuild with U @ np.diag(s2) @ Vt, and print the Frobenius error (about 1.93) and the energy share as a percentage (about 75.8 percent)",
      "All printed numbers rounded for reading, and the whole script deterministic: running it twice prints byte-identical lines",
    ],
    steps: [
      "Type in the ratings matrix and build the mask. Print the matrix and mask.sum(axis=1) to see the sparsity: every user rated exactly 3 of the 6 items.",
      "Write masked_means: sum the rows of ratings, divide by each row's count of True in the mask. Print the five means — user 0's is exactly 4.0, user 1's is 3.6667.",
      "Write center_users with one np.where(mask, ratings - means[:, None], 0.0). Print row 0 of the result: it must be [1.0, -1.0, 0.0, 0.0, 0.0, 0.0] — loved item 0, disliked item 1, silent on the rest.",
      "Write similarity_matrix: per-row norms with axis=1, divide each row by its own norm, then multiply normalized @ normalized.T. Print row 0 rounded — user 4 is user 0's strongest neighbor (0.5), user 2 the weakest (0.0).",
      "Write predict(0, 5, ...): collect the users who rated item 5 (users 2, 3, 4), weight their centered ratings by sim[0, u], average, and add means[0] back. Print the prediction rounded to 4 decimals.",
      "Add the SVD block: np.linalg.svd(centered, full_matrices=False), zero s[2:], rebuild, then print the Frobenius error np.linalg.norm(centered - rebuilt) and the energy share (kept s-squared over total s-squared) times 100.",
      "Run the finished script twice and compare the outputs by eye — a recommender that cannot reproduce its own numbers cannot be trusted, and yours can.",
    ],
    starter: `import numpy as np

# --- the dataset: 5 users x 6 items, ratings 1..5, 0 = not rated ---
ratings = np.array([
    [5, 3, 4, 0, 0, 0],
    [4, 0, 5, 0, 2, 0],
    [0, 4, 0, 5, 0, 3],
    [5, 0, 0, 4, 0, 2],
    [0, 3, 0, 0, 5, 4],
], dtype=float)
mask = ratings > 0

print("ratings matrix:")
print(ratings.astype(int))
print("rated per user :", mask.sum(axis=1))

def masked_means(ratings, mask):
    """Mean of each user's RATED items only -- the 0s never count."""
    # TODO: sum each row, divide by that row's count of True in mask
    return np.zeros(ratings.shape[0])

def center_users(ratings, mask, means):
    """Each user's rated cells shifted by their own mean; unrated stay 0."""
    # TODO: broadcast means[:, None], keep only masked cells via np.where
    return np.zeros_like(ratings)

def similarity_matrix(centered):
    """Cosine similarity between every pair of users (rows)."""
    # TODO: divide each row by its own norm (axis=1), then normalized @ normalized.T
    return np.eye(centered.shape[0])

def predict(user, item, centered, sim, means):
    """Predict one missing rating from the users who did rate the item."""
    # TODO: weighted average of centered ratings, weights = sim[user, other]
    return 0.0

# --- step 1: means and centering ---
means = masked_means(ratings, mask)
centered = center_users(ratings, mask, means)
print("user means     :", np.round(means, 4))
print("centered row 0 :", np.round(centered[0], 4))

# --- step 2: who is similar to whom? ---
sim = similarity_matrix(centered)
print("sim of user 0  :", np.round(sim[0], 4))

# --- step 3: predict user 0's missing rating for item 5 ---
prediction = predict(0, 5, centered, sim, means)
print("predicted rating (user 0, item 5):", round(prediction, 4))

# --- step 4: SVD low-rank compression ---
# TODO: np.linalg.svd(centered, full_matrices=False), keep the top 2
#       singular values, rebuild with U @ np.diag(s2) @ Vt, then print
#       the Frobenius error and the energy share (kept s-squared over
#       total s-squared) as a percentage.
`,
    concepts: [
      "masked mean-centering",
      "broadcasting",
      "cosine similarity",
      "neighborhood prediction",
      "SVD low-rank approximation",
      "energy share",
    ],
    extension:
      "Flip to item-based recommendations: transpose the ratings (items as rows), mean-center the items, build the 6x6 item-item similarity matrix, and predict user 0's item-5 rating from user 0's own ratings on the most similar items. Does the prediction move closer to the user-based 3.2232 or further away? Then rerun the SVD block keeping 3 singular values instead of 2 and report exactly how the error and energy share move.",
  },
};
