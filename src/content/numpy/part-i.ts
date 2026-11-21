/**
 * PART I — RANDOM NUMBERS AND MISSING DATA
 *
 * The two-track part. First, reproducible randomness: the modern Generator
 * (default_rng, seeds, private streams), the distribution toolkit with
 * law-of-large-numbers receipts, sampling/shuffling/train-test splits and
 * the bootstrap. Then the honest-analysis half: NaN and its rules, and the
 * NaN-safe statistics and cleaning pipelines that keep analysis truthful
 * when values go missing.
 *
 * Every output field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 * Every random draw in a verified block is seeded with a FIXED seed passed
 * to np.random.default_rng, so every claimed output is reproducible.
 *
 * Authoring conventions:
 *   - code blocks use the AUTOFILL placeholder for their output field; the
 *     verifier fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_I: NumpyPart = {
  letter: "I",
  title: "Random Numbers and Missing Data",
  tagline:
    "Reproducible randomness with the modern Generator — and honest analysis when values go missing",
  description:
    "Meet the modern way to be random: np.random.default_rng and its Generator — a seeded, reproducible stream with no global state — then tour the distribution toolkit (integers, uniform, normal, poisson, binomial, exponential), each verified against the law of large numbers with 100,000 draws. Learn to sample, shuffle and split like a data scientist: weighted choices, train/test splits and the bootstrap, all deterministic under a fixed seed. Then face the other half of real data: missing values. NaN is a float with strange rules — it is not even equal to itself — and this part teaches every rule, plus the NaN-safe statistics (nanmean, nan_to_num, errstate) and the cleaning pipelines that keep your numbers honest when values go missing. Every output is machine-verified and every draw is seeded, so what you read is exactly what you would run.",
  lessons: [
    // ------------------------------------------------------------- i-01
    {
      slug: "i-01",
      title: "Random Numbers, Done Right",
      minutes: 14,
      summary:
        "The two eras of randomness in NumPy — the legacy global-state API you must be able to read, and the modern seeded Generator you should write — plus the seeding discipline that turns a lucky run into a checkable experiment.",
      kind: "concept",
      objectives: [
        "Explain why np.random.seed and np.random.rand are legacy, and what 'global state' costs you",
        "Create a Generator with np.random.default_rng(seed) and draw from it",
        "Prove the core promise: same seed, same stream — and different seeds give different streams",
        "Describe how a Generator is consumed in order, and how re-creating it replays its draws",
        "Apply the seeding discipline: one fixed seed per experiment, logged alongside the results",
      ],
      why: "Randomness that cannot be reproduced is not a result — it is an anecdote. The moment your simulation, survey, or model-training script involves chance, 'it worked yesterday' stops being evidence: only a recorded seed turns a lucky run into a checkable experiment. This lesson gives you the modern Generator API (and the vocabulary to read the legacy one that still lives in millions of lines of older code), and it opens the part with its first machine-verified claim: same seed, same stream, every single time.",
      blocks: [
        {
          kind: "text",
          text: "You already know what randomness looks like: a coin flip, a shuffled playlist, the die in a board game. A computer cannot do any of that — it is a machine that follows instructions exactly. What it *can* do is arithmetic so tangled that the results pass every practical test for randomness. Those are **pseudo-random numbers**: fully determined by a starting value called the **seed**, and therefore perfectly *replayable*. That replayability is not a weakness. It is the entire point.",
        },
        {
          kind: "heading",
          text: "Two eras of NumPy randomness",
        },
        {
          kind: "text",
          text: "NumPy has shipped two random-number designs, and you will meet both in the wild. The **legacy era** is a single global machine shared by the whole process: `np.random.seed(...)` sets its state, and `np.random.rand(...)`, `np.random.randint(...)`, `np.random.choice(...)` draw from it. It works — but that shared state is the problem: any line of code, in your script or inside a library you imported, can silently advance or reset the machine. You will still *read* this API in older tutorials and older codebases, so you should know exactly what it does:",
        },
        {
          kind: "code",
          title: "The legacy API: one global machine (read it, do not write it)",
          code: `import numpy as np

np.random.seed(7)              # legacy: set THE global machine's state
first = np.random.rand(3)      # legacy: draw from that global machine
second = np.random.rand(3)
print("first :", first)
print("second:", second)

np.random.seed(7)              # resetting the global state replays the stream
print("replay :", np.random.rand(3))
`,
          output: `first : [0.07630829 0.77991879 0.43840923]
second: [0.72346518 0.97798951 0.53849587]
replay : [0.07630829 0.77991879 0.43840923]`,
          outputNote:
            "Deterministic, yes — but only because nothing else touched the global machine in between. In a real notebook, any other random call anywhere would have shifted the stream.",
          explain: [
            "`np.random.seed(7)` turns the key on ONE machine that every piece of code in the process shares.",
            "`np.random.rand(3)` draws three floats in [0, 1) from that machine — and advances it, so the next call gives different numbers.",
            "Re-seeding to 7 replays the exact same three numbers. The determinism is real; the *isolation* is not.",
          ],
        },
        {
          kind: "heading",
          text: "The modern era: your own Generator",
        },
        {
          kind: "text",
          text: "The modern design gives every piece of work **its own private machine**: `rng = np.random.default_rng(seed)` returns a **Generator** — a fresh object with its own stream of random numbers (powered underneath by a bit generator called PCG64). No global state, no sharing: nothing any other code does can advance, reset, or contaminate your stream. And the promise that opens this part is now yours to verify:",
        },
        {
          kind: "code",
          title: "The first verified claim of Part I: a seed is a promise",
          code: `import numpy as np

rng_a = np.random.default_rng(42)
rng_b = np.random.default_rng(42)

a = rng_a.integers(0, 10, 8)
b = rng_b.integers(0, 10, 8)
print("a:", a)
print("b:", b)
print("same seed, identical streams :", np.array_equal(a, b))

rng_c = np.random.default_rng(0)          # a different seed...
c = rng_c.integers(0, 10, 8)
print("seed 0 vs seed 42, identical  :", np.array_equal(a, c))
`,
          output: `a: [0 7 6 4 4 8 0 6]
b: [0 7 6 4 4 8 0 6]
same seed, identical streams : True
seed 0 vs seed 42, identical  : False`,
          outputNote:
            "Two independently created Generators, same seed: byte-identical draws. Different seed: different draws. That is the whole contract.",
          explain: [
            "`np.random.default_rng(42)` builds a Generator and fast-forwards its internal state to the position seed 42 names. Any other Generator made with 42 starts at that same position.",
            "`rng.integers(0, 10, 8)` draws eight integers from the stream — you will meet this method properly in the next lesson.",
            "`np.array_equal(a, c)` is False: a different seed names a *different* position. Equal streams come only from equal seeds.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.random.default_rng",
          purpose:
            "Create a modern random Generator with its own private stream of numbers, started from a seed you choose and can replay at any time.",
          signature: "np.random.default_rng(seed=None)",
          purposeDetail:
            "`default_rng` is the front door to NumPy's modern random-number design. It hands you a Generator object that owns its own stream of random bits (produced by the PCG64 bit generator by default) — no global state, no interference from other code, no interference *with* other code. Passing a fixed integer seed makes every draw from that Generator reproducible on any machine, which is what makes seeded randomness acceptable in verified course blocks and mandatory in reproducible science. Passing no seed pulls fresh entropy from the operating system: the right choice for production cryptography-adjacent work, the wrong choice when you want your analysis to run twice the same way.",
          params: [
            {
              name: "seed",
              type: "None, int, array_like[ints], SeedSequence, BitGenerator, or Generator",
              description:
                "What positions the stream before the first draw. An integer (or a sequence of non-negative integers) deterministically initializes the stream: the same seed always yields the same sequence of draws. None (the default) asks the operating system for unpredictable entropy instead. Advanced users can pass a SeedSequence to derive related-but-independent streams for parallel work.",
              example: "42",
            },
          ],
          returns: {
            type: "np.random.Generator",
            description:
              "A Generator object with its own stream. You never draw from np.random directly anymore — you call methods on this object: rng.integers, rng.random, rng.normal, rng.choice, rng.permutation, and the rest of the toolkit in this part.",
          },
          example: `import numpy as np

rng_a = np.random.default_rng(42)
rng_b = np.random.default_rng(42)
a = rng_a.integers(0, 10, 5)
b = rng_b.integers(0, 10, 5)
print("a:", a)
print("b:", b)
print("identical streams:", np.array_equal(a, b))

fresh = np.random.default_rng()     # no seed: OS entropy, NOT replayable
print("still a Generator:", type(fresh).__name__)
`,
          exampleOutput: `a: [0 7 6 4 4]
b: [0 7 6 4 4]
identical streams: True
still a Generator: Generator`,
          commonMistakes: [
            {
              mistake: "Calling default_rng() with no seed and expecting reproducible results.",
              why: "A missing seed means 'ask the operating system for entropy', so every run starts somewhere new. Your script works, reruns differently, and nobody can check either run.",
              fix: "In experiments and analysis, always pass a fixed integer: np.random.default_rng(42). Log that number with your results.",
            },
            {
              mistake: "Creating the Generator inside a loop that should draw many different samples.",
              why: "rng = np.random.default_rng(0) inside the loop body rebuilds the same machine every iteration — every iteration replays the SAME first draws.",
              fix: "Create the Generator ONCE, before the loop. The stream advances itself; that is its job.",
            },
            {
              mistake: "Mixing legacy calls (np.random.rand) into code that uses a Generator.",
              why: "The legacy global machine and your Generator are two unrelated machines. Mixing them makes the stream position of each impossible to reason about, and confuses anyone reading the code.",
              fix: "One analysis, one API: pick the Generator and delete every legacy np.random.* call.",
            },
          ],
          related: [
            { name: "rng.integers", relation: "The Generator's die roller — random integers over a range; the first method most experiments need (Lesson i-02)." },
            { name: "rng.choice / rng.permutation", relation: "The Generator's sampling and shuffling tools — Part I's Lesson i-03." },
            { name: "np.random.SeedSequence", relation: "The advanced way to derive many independent streams from one master seed, for parallel workers." },
            { name: "np.random.RandomState", relation: "The legacy generator object — read it in old code, do not start new code with it." },
          ],
          applications: [
            "Reproducible experiments: one fixed seed per run, logged in the report, so any reviewer can replay your numbers exactly",
            "Simulations (queues, epidemics, markets) that must be rerunnable when a stakeholder asks 'what if you got unlucky?'",
            "Seeded test fixtures: the same random-looking data every CI run, so failures are about the code and not the dice",
          ],
          notes:
            "default_rng does not touch or read any global state — creating two Generators with the same seed gives two independent, identical streams. The legacy np.random.* functions remain available for backward compatibility; NumPy 2 still ships them, but new code should not write them.",
        },
        {
          kind: "heading",
          text: "The stream is consumed in order",
        },
        {
          kind: "text",
          text: "Picture the Generator as a **cursor** sliding along an endless scroll of numbers the seed already fixed. Every draw — `integers`, `random`, `choice`, any of them — reads what is under the cursor and advances it. Two consequences follow, and both are worth feeling once:",
        },
        {
          kind: "visual",
          title: "One seed names a position on an endless scroll",
          ascii: `  seed 7
     |
     v
  ... [ 3][ 8][ 1][ 9][ 9][ 0][ 2][ 4][ 7][ 6][ 5][ 1] ...
        --------  --------                        the stream is
         draw 1    draw 2                          read in order
        rng.integers(...)  advances the cursor

  default_rng(7) again  ->  cursor back at the same position  ->  same draws
`,
          caption:
            "A Generator has no memory of what you asked for, only of where it is. Same position, same next numbers — regardless of what the calls were.",
        },
        {
          kind: "code",
          title: "Draws advance the cursor; re-creating the rng rewinds it",
          code: `import numpy as np

rng = np.random.default_rng(7)
first = rng.integers(0, 10, 5)
second = rng.integers(0, 10, 5)
print("first call :", first)
print("second call:", second)
print("same rng, same draws? ", np.array_equal(first, second), " <- the cursor moved")

replay = np.random.default_rng(7)        # re-create -> cursor back at the start
again1 = replay.integers(0, 10, 5)
again2 = replay.integers(0, 10, 5)
print("replayed 1st:", np.array_equal(again1, first))
print("replayed 2nd:", np.array_equal(again2, second))
`,
          output: `first call : [9 6 6 8 5]
second call: [7 8 2 0 3]
same rng, same draws?  False  <- the cursor moved
replayed 1st: True
replayed 2nd: True`,
          outputNote:
            "The two calls on one Generator give different draws — the stream advanced. Rebuilding default_rng(7) rewinds to the start, and both draws replay exactly.",
          explain: [
            "`first` and `second` differ because the second call reads the numbers after the first call's numbers. Same object, new position.",
            "Re-creating the Generator with the same seed rewinds the cursor to the same starting position.",
            "So the full history replays: not just the first draw, but the second, third, tenth — as long as the calls happen in the same order.",
          ],
        },
        {
          kind: "heading",
          text: "A seed is a promise",
        },
        {
          kind: "text",
          text: "Here is the whole lesson in one grid. Sixteen die rolls, drawn once, from a Generator seeded with 42 — and because that seed is written down, these exact sixteen values are what you, a colleague, or a reviewer will get, on any machine, forever:",
        },
        {
          kind: "code",
          title: "Sixteen rolls, fixed forever by one number",
          code: `import numpy as np

rng = np.random.default_rng(42)
rolls = rng.integers(1, 7, size=(4, 4))   # 4 sets of 4 die rolls
print(rolls)
`,
          output: `[[1 5 4 3]
 [3 6 1 5]
 [2 1 4 6]
 [5 5 5 5]]`,
          outputNote:
            "Run this in the playground, on a server, in five years: seed 42 gives these sixteen numbers and no others.",
          explain: [
            "`rng.integers(1, 7, ...)` draws from 1 through 6 — the half-open range is the next lesson's first topic.",
            "Look at the bottom row: four fives in a row. Nothing is wrong — a generator has no memory and no duty to look fair. Streaks happen.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The seed explorer — click the promise",
          mode: "explore",
          name: "rolls",
          caption:
            "The sixteen rolls from default_rng(42), drawn as a 4x4 grid. Click cells: the inspector shows the [row, col] index, the flat position in the data block, and the array's shape/ndim/size — the anatomy from Lesson a-04, now holding numbers that one seed fixed forever. Toggle 'Show flat indexes' to see the stream order the cursor actually read.",
          data: [
            [1, 5, 4, 3],
            [3, 6, 1, 5],
            [2, 1, 4, 6],
            [5, 5, 5, 5],
          ],
          labels: {
            rows: ["Set 1", "Set 2", "Set 3", "Set 4"],
            cols: ["Roll 1", "Roll 2", "Roll 3", "Roll 4"],
          },
          dtype: "int64",
        },
        {
          kind: "heading",
          text: "Seeding discipline: the professional habit",
        },
        {
          kind: "text",
          text: "A seed only keeps the promise if you can find it again. The discipline is small and pays for itself the first time someone asks you to reproduce a number:",
        },
        {
          kind: "steps",
          title: "Four rules of reproducible randomness",
          items: [
            "**One fixed seed per experiment**, chosen once at the top of the script: `rng = np.random.default_rng(42)`. Never re-seed mid-analysis.",
            "**Log the seed with the results** — notebook header, report, or docstring, next to the data version. A seed nobody can find is a promise to no one.",
            "**Change seeds on purpose to test stability.** If your conclusion flips between seed 0 and seed 1, your result is noise wearing a lab coat. Real findings survive neighboring seeds.",
            "**One API per analysis.** The Generator, or the legacy global machine — never both in the same script. Two machines, two stream positions, zero reproducibility.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Parallel work? Streams, not copy-pasted seeds",
          text: "If you fan out to 8 workers and give each its own default_rng(42), every worker replays the SAME stream — your 'independent' replicates are clones. The modern fix is SeedSequence spawning: seed_seq = np.random.SeedSequence(2024); children = seed_seq.spawn(8), then default_rng(child) per worker — related by design, independent in stream. Mentioned here so you know the tool exists; single-stream work needs none of it.",
        },
        {
          kind: "tryIt",
          title: "Feel the promise, break the promise",
          task:
            "Run this twice — identical output both times, because seed 42 fixes the stream. Then: (1) change 42 to 43 and watch both draws change; (2) note the loop: it rebuilds default_rng(0) every iteration, so every iteration replays the same first draw — the classic re-seeding bug from the mistakes section; (3) move the rng = np.random.default_rng(0) line ABOVE the loop and watch the draws start advancing.",
          code: `import numpy as np

rng = np.random.default_rng(42)
print("draw 1:", rng.integers(0, 100, 5))
print("draw 2:", rng.integers(0, 100, 5))

# A seeded loop? No -- a REPEATING loop. Watch closely:
for i in range(3):
    fresh = np.random.default_rng(0)
    print("iteration", i, ":", fresh.integers(0, 100, 3))
`,
          hint:
            "The loop's fix is one line: create the Generator once, before the loop, and let the cursor advance itself.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "np.random.default_rng(seed) builds your own private random machine. Same seed, same stream — verified. The stream is consumed in order; re-creating the Generator replays it. Legacy np.random.seed/rand is one shared global machine: read it, do not write it. And log your seeds: a seed is a promise you have to be able to keep.",
        },
      ],
      terms: [
        { term: "Pseudo-random numbers", definition: "Numbers produced by deterministic arithmetic that pass every practical test for randomness — replayable exactly because they are determined by the seed." },
        { term: "Seed", definition: "The starting value that positions a random stream. Same seed, same sequence of draws — the contract behind reproducible randomness." },
        { term: "Generator", definition: "The modern random-number object from np.random.default_rng: it owns a private stream of draws (integers, random, choice, permutation...) and no global state." },
        { term: "PCG64", definition: "The default bit generator underneath default_rng — the algorithm that turns the seed's starting state into the stream of random bits the Generator hands out." },
        { term: "Global state", definition: "The legacy design: one machine shared by the entire process, set by np.random.seed and readable/drawable by any code — convenient, contaminable, and why the modern API exists." },
      ],
      mistakes: [
        {
          mistake: "Writing np.random.rand(...) in new code because that is what an old tutorial showed.",
          why: "Those calls draw from the one global machine, whose state any imported library can silently change. Your 'random' stream position is really everyone's stream position.",
          fix: "New code: rng = np.random.default_rng(seed) once, then draw with rng.random(), rng.integers(...), and friends. Read legacy code fluently; write modern code only.",
        },
        {
          mistake: "Creating the Generator inside a loop that should draw different samples each iteration.",
          why: "Each iteration rebuilds the same seeded machine, so every iteration replays the identical first draws — your 'replicates' are copies of one draw.",
          fix: "Create the Generator once before the loop. The cursor advances with each call; that is how it is designed to be used.",
        },
        {
          mistake: "Re-running one cell of a notebook and expecting a cell above it to draw the same numbers as before.",
          why: "The Generator's cursor is at 'wherever the last executed draw left it'. Re-running a middle cell changes the cursor position for every later cell.",
          fix: "For a run you need to repeat exactly, re-create the Generator at the top of the block (default_rng(seed) again) rather than relying on leftover stream position.",
        },
        {
          mistake: "Choosing a seed per run 'for extra randomness' and not writing it down.",
          why: "An unrecorded seed reproduces nothing: the run becomes an anecdote nobody — including future you — can check.",
          fix: "Fix the seed in code, and echo it in the output or log it in the report header. The seed is metadata, like the data version.",
        },
      ],
      takeaways: [
        "np.random.default_rng(seed) gives you a private, reproducible stream: two Generators with seed 42 produced identical arrays, and a Generator with seed 0 produced different ones — the part's first verified claim.",
        "A Generator is a cursor over a fixed scroll: draws are consumed in order, and re-creating the Generator with the same seed replays the whole history.",
        "The legacy np.random.seed/rand API is one global machine — read it in old code, do not write it in new code.",
        "Log the seed with the experiment, create the Generator once (never inside loops), and test stability by switching seeds deliberately.",
      ],
      quiz: [
        {
          id: "i-01-q1",
          prompt: "What does np.random.default_rng(42) give you?",
          options: [
            { text: "A new Generator object with its own private stream, positioned deterministically by the seed", correct: true, feedback: "Exactly — your own machine, replayable forever, immune to whatever any other code does." },
            { text: "A handle to NumPy's single global random machine, preset to state 42", correct: false, feedback: "That describes the legacy design. default_rng builds a fresh, private Generator — there is no global state to touch." },
            { text: "An array of 42 random numbers", correct: false, feedback: "Nothing is drawn yet — you get a Generator, and numbers appear only when you call methods like rng.integers on it." },
            { text: "A Python random.Random instance connected to NumPy", correct: false, feedback: "Different library, different design. The stdlib random module and NumPy Generators share nothing." },
          ],
          explanation: "default_rng(seed) constructs a Generator with its own PCG64-backed stream; the seed fixes the starting position, which is what makes the stream replayable.",
        },
        {
          id: "i-01-q2",
          prompt: "rng = np.random.default_rng(7); a = rng.integers(0, 10, 5); b = rng.integers(0, 10, 5). Which statement is true?",
          options: [
            { text: "a and b differ, because the second call reads the stream after the first call advanced it", correct: true, feedback: "Right — the Generator is a cursor: each draw moves it, so successive calls give successive numbers. Verified two cells ago." },
            { text: "a and b are identical, because both came from the same seeded rng", correct: false, feedback: "Same seed fixes the *starting position*, not every draw. The cursor advances with each call." },
            { text: "The second call raises an error — you must re-seed between draws", correct: false, feedback: "No re-seeding needed, ever: the stream is endless, and advancing it is the Generator's normal job." },
            { text: "b replays a unless you pass a different size", correct: false, feedback: "Size changes how many numbers are read, not which position the cursor starts from." },
          ],
          explanation: "Streams are consumed in order. To replay a draw, re-create the Generator with the same seed — do not expect a live rng to rewind itself.",
        },
        {
          id: "i-01-q3",
          prompt: "Why is the legacy API (np.random.seed + np.random.rand) discouraged in new code?",
          options: [
            { text: "It uses one global machine that any imported code can silently advance or reset", correct: true, feedback: "Correct — shared mutable state makes the stream position depend on every random call in the process, including ones you never wrote." },
            { text: "It was removed in NumPy 2, so the calls crash", correct: false, feedback: "The legacy API still ships for backward compatibility — it is discouraged, not deleted. (Our legacy demo block ran it under NumPy 2.0.2.)" },
            { text: "It cannot be seeded, so it is never reproducible", correct: false, feedback: "It can be seeded — the problem is isolation, not determinism: np.random.seed(7) replays fine until something else draws." },
            { text: "Its numbers are lower quality than the Generator's", correct: false, feedback: "The legacy Mersenne Twister passes the same statistical tests most work needs. The design flaw is the shared state, not the bits." },
          ],
          explanation: "Global state is the disease; Generators are the cure. Same determinism, none of the cross-contamination.",
        },
      ],
    },

    // ------------------------------------------------------------- i-02
    {
      slug: "i-02",
      title: "The Distribution Toolkit",
      minutes: 17,
      summary:
        "One seeded draw and one 100,000-draw law-of-large-numbers receipt for each core distribution — integers, uniform, normal, poisson, binomial, exponential — and how to pick the right one by telling the story of your data.",
      kind: "concept",
      objectives: [
        "Draw from every core distribution: rng.integers, rng.random, rng.uniform, rng.normal, rng.standard_normal, rng.poisson, rng.binomial, rng.exponential",
        "State each distribution's parameters and expected value — including that normal's scale is the standard deviation, not the variance",
        "Verify the law of large numbers: 100,000-draw sample means landing close to the values theory demands",
        "Choose a distribution from the story of the data: counts, waiting times, measurement noise, bounded quantities",
      ],
      why: "Random numbers are only useful if they are random in the right way. 'Add some noise' means nothing until you can say which noise: measurement jitter is normal, counts of events in a window are poisson, gaps between events are exponential, hard-bounded quantities are uniform. This lesson tours the core distributions with two receipts each — a small seeded draw you can eyeball, and a 100,000-draw sample mean checked against the value theory demands — so you never again have to take a distribution's behavior on faith.",
      blocks: [
        {
          kind: "text",
          text: "A **distribution** is a shape of uncertainty: which values are likely, which are rare, and how the probabilities spread out. Last lesson you learned that a seed fixes a stream; this lesson is about what you *ask the stream for*. NumPy's Generator speaks about a dozen distributions fluently — these six cover the overwhelming majority of real work:",
        },
        {
          kind: "table",
          title: "The toolkit at a glance",
          headers: ["Call", "The story it tells", "Key parameters", "Expected value"],
          rows: [
            ["`rng.integers(1, 7)`", "A fair draw from a finite set: dice, cards, random rows", "`low` (in), `high` (out) — half-open", "midpoint of the range"],
            ["`rng.random()`", "A probability, a fraction, a point chosen in [0, 1)", "none", "`0.5`"],
            ["`rng.uniform(low, high)`", "Any value in a range is equally likely — bounded ignorance", "`low`, `high` (both reachable region ends)", "`(low + high) / 2`"],
            ["`rng.normal(loc, scale)`", "Measurement noise, wobbling around a true value", "`loc` = center, `scale` = **standard deviation**", "`loc`"],
            ["`rng.standard_normal()`", "Noise centered at 0 — `normal(0, 1)` without the typing", "none", "`0.0`"],
            ["`rng.poisson(lam)`", "How many events happened in a fixed window", "`lam` = average count per window", "`lam`"],
            ["`rng.binomial(n, p)`", "Successes out of n independent tries", "`n` tries, `p` success chance", "`n * p`"],
            ["`rng.exponential(scale)`", "How long until the next event", "`scale` = average wait", "`scale`"],
          ],
          caption:
            "Expected value is the long-run average — the number the law of large numbers promises your sample mean will approach. We verify that promise at the bottom of this lesson.",
        },
        {
          kind: "code",
          title: "One seeded tour: a draw from each",
          code: `import numpy as np

rng = np.random.default_rng(2024)   # one seed, one tour

print("integers(1, 7)    :", rng.integers(1, 7, 6), " <- 7 can never appear")
print("random()          :", np.round(rng.random(4), 3), "<- floats in [0, 1)")
print("uniform(2, 5)     :", np.round(rng.uniform(2.0, 5.0, 4), 3))
print("normal(170, 7)    :", np.round(rng.normal(170.0, 7.0, 4), 2), "<- scale is the STD")
print("standard_normal() :", np.round(rng.standard_normal(4), 3))
print("poisson(3)        :", rng.poisson(3.0, 6), "<- counts: integers")
print("binomial(10, 0.3) :", rng.binomial(10, 0.3, 6), "<- 0..10: integers")
print("exponential(2)    :", np.round(rng.exponential(2.0, 4), 3), "<- waiting times")
`,
          output: `integers(1, 7)    : [2 5 1 2 2 2]  <- 7 can never appear
random()          : [0.799 0.996 0.142 0.079] <- floats in [0, 1)
uniform(2, 5)     : [2.542 3.079 2.509 3.766]
normal(170, 7)    : [164.88 162.25 180.39 170.34] <- scale is the STD
standard_normal() : [ 0.812 -1.376 -0.436 -1.291]
poisson(3)        : [2 3 3 3 5 1] <- counts: integers
binomial(10, 0.3) : [5 3 2 4 2 4] <- 0..10: integers
exponential(2)    : [0.238 0.029 3.489 0.043] <- waiting times`,
          outputNote:
            "Eight different shapes of uncertainty from one Generator, in stream order. Every array is fixed by seed 2024.",
          explain: [
            "`rng.integers(1, 7, 6)` — six die rolls. Watch the range: 1 through 6, never 7 (half-open, like slicing in Part D).",
            "`rng.normal(170, 7, 4)` — heights around 170 cm. The 7 is the standard deviation, not the variance: the classic slip, one heading below.",
            "`rng.poisson` and `rng.binomial` print without decimal points — they return integer counts (int64), not floats.",
            "`rng.exponential(2, 4)` — waiting times. Notice the spread: some waits are far shorter than the average, a few are much longer. That asymmetry is the exponential signature.",
          ],
        },
        {
          kind: "heading",
          text: "Integers: the half-open habit",
        },
        {
          kind: "text",
          text: "`rng.integers(low, high)` draws from `low` up to and *including* `high - 1` — the same half-open convention as slicing (Lesson d-02) and `range()`. The fix for 'but I want the top value too' is the `endpoint=True` flag, which closes the interval: `rng.integers(1, 7, endpoint=True)` draws 1 through 7. Half-open ranges compose cleanly (a roll of a 6-sided die and a coin flip can share an index scheme), which is why NumPy keeps them as the default:",
        },
        {
          kind: "functionDoc",
          name: "rng.integers",
          purpose:
            "Draw random integers from low (inclusive) to high (exclusive) — or fully inclusive when endpoint=True.",
          signature: "rng.integers(low, high=None, size=None, dtype=np.int64, endpoint=False)",
          purposeDetail:
            "When your randomness is a draw from a finite, evenly-likely set — dice, card indices, which rows to pick, bootstrap resample positions — integers is the tool. The default interval is half-open, exactly like Python ranges and NumPy slices, so integers(0, n) yields valid indices into anything of length n with no off-by-one arithmetic. That single convention is why the bootstrap in Lesson i-03 can be written as rng.integers(0, n, n) and just work. One Generator, seeded once, gives you all of it reproducibly.",
          params: [
            {
              name: "low",
              type: "int or array_like of ints",
              required: true,
              description: "Smallest value that can be drawn (inclusive). If high is omitted, low acts as the exclusive top and 0 is the implicit bottom — integers(7) means 0 through 6.",
              example: "1",
            },
            {
              name: "high",
              type: "int or array_like of ints",
              description: "One past the largest value that can be drawn, unless endpoint=True closes the interval. Arrays for low/high give per-element bounds.",
              example: "7",
            },
            {
              name: "size",
              type: "int or tuple of ints",
              description: "How many draws, and in what shape: 6 gives six values, (4, 4) gives a grid (as in Lesson i-01).",
              example: "(4, 4)",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "The integer type of the result — int64 by default. Use int32 or smaller when generating billions of values and memory matters.",
              example: "np.int32",
            },
            {
              name: "endpoint",
              type: "bool",
              description: "False (default): high is excluded, like range(). True: high is included — integers(1, 7, endpoint=True) is a fair 7-sided die.",
              example: "True",
            },
          ],
          returns: {
            type: "ndarray of ints (or a scalar int when size is None)",
            description: "The drawn integers, in the requested shape and dtype. Every value is reachable, none outside the interval — 7 never appears in integers(1, 7) no matter how many times you run it.",
          },
          example: `import numpy as np

rng = np.random.default_rng(0)
dice = rng.integers(1, 7, 10)                 # 1..6, half-open
print("dice    :", dice)
print("max seen:", dice.max(), "(7 is impossible)")

closed = np.random.default_rng(1).integers(1, 7, 10, endpoint=True)
print("endpoint:", closed, "(7 can appear)")

indices = np.random.default_rng(2).integers(0, 5, 8)   # valid row indices
print("indices :", indices)
`,
          exampleOutput: `dice    : [6 4 4 2 2 1 1 1 2 5]
max seen: 6 (7 is impossible)
endpoint: [4 4 6 7 1 2 6 7 2 3] (7 can appear)
indices : [4 1 0 1 2 4 2 0]`,
          commonMistakes: [
            {
              mistake: "Asking for a six-sided die with integers(1, 6).",
              why: "Half-open means 6 itself is excluded: you are rolling a five-sided die (1 through 5) and silently biasing your game.",
              fix: "Top plus one: integers(1, 7) for a d6. Say it as 'one through seven, seven excluded' until it is reflex.",
            },
            {
              mistake: "Passing floats: integers(1.0, 7.0).",
              why: "The Generator raises — integers is for whole numbers, and a float bound is a sign the call should be uniform() or normal() instead.",
              fix: "Floats between bounds belong to rng.uniform(low, high); whole-number draws belong here.",
            },
            {
              mistake: "Forgetting that omitting high changes low's meaning.",
              why: "integers(6) does NOT mean one draw of 6 — it means draws from 0 through 5, because a lone argument is treated as the exclusive top.",
              fix: "Always write both bounds when starting out: integers(0, 6) is unambiguous to every reader, including you in three months.",
            },
          ],
          related: [
            { name: "rng.choice", relation: "Draws from an explicit list of values, with optional weights — use it when the set is not a plain range (Lesson i-03)." },
            { name: "rng.uniform", relation: "The continuous counterpart: any float in [low, high) rather than whole numbers." },
            { name: "rng.random", relation: "uniform(0, 1) spelled short — the raw material for probability thresholds." },
          ],
          applications: [
            "Games and simulations: dice, cards, shuffled board setups — reproducible under a logged seed",
            "Random valid indices: integers(0, n, k) picks k legal row numbers, the engine inside the bootstrap (Lesson i-03)",
            "Randomized test data: generate grids of plausible integers for fixtures that rerun identically in CI",
          ],
          notes:
            "endpoint=False keeps the legacy randint behavior; endpoint=True replaces the old random_integers. Both die examples in this part deliberately show the flag.",
        },
        {
          kind: "heading",
          text: "Normal: scale is the standard deviation",
        },
        {
          kind: "text",
          text: "`rng.normal(loc, scale)` is the bell curve: centered at `loc`, spread by `scale`. The trap is elementary and eternal: **`scale` is the standard deviation, not the variance**. Papers write 'heights are normal with mean 170 and variance 49' — and 49 is the *variance*, so the call is `rng.normal(170, 7)`, because the standard deviation is the square root: the square root of 49 is 7. Pass 49 and your simulated crowd is seven times too spread out, and nothing crashes — the numbers are simply wrong. (Cross-reference: Part H makes the std/variance relationship a full topic; here you only need 'scale = std = square root of variance'.)",
        },
        {
          kind: "functionDoc",
          name: "rng.normal",
          purpose:
            "Draw from a normal (Gaussian) distribution — the bell curve centered at loc with standard deviation scale.",
          signature: "rng.normal(loc=0.0, scale=1.0, size=None)",
          purposeDetail:
            "Measurement noise is normal in practice because lots of small independent errors add up (the central limit theorem's gift): sensor jitter, repeated weighings, exam scores around a mean. normal() is how you simulate that. loc slides the bell along the number line; scale stretches it — and scale is the STANDARD DEVIATION, the width everyone quotes, not its square. One seeded Generator plus normal() gives you reproducible noisy datasets for testing any statistic.",
          params: [
            {
              name: "loc",
              type: "float or array_like of floats",
              description: "The center of the bell — the value draws cluster around, and the mean the sample means will approach. An array of locs draws each element from its own center.",
              example: "170.0",
            },
            {
              name: "scale",
              type: "float or array_like of floats",
              description: "The standard deviation — the typical distance of a draw from loc. NOT the variance: variance 49 means scale 7. Must be non-negative.",
              example: "7.0",
            },
            {
              name: "size",
              type: "int or tuple of ints",
              description: "How many draws and in what shape; omit it for a single scalar draw.",
              example: "1000",
            },
          ],
          returns: {
            type: "ndarray of float64 (or a scalar when size is None)",
            description: "The drawn values: clustered near loc, roughly 68% within one scale of it, 95% within two — and averaging ever closer to loc as the sample grows (verified below with 100,000 draws).",
          },
          example: `import numpy as np

rng = np.random.default_rng(42)
heights = rng.normal(loc=170.0, scale=7.0, size=5)
print("five heights:", np.round(heights, 2))

big = rng.normal(loc=170.0, scale=7.0, size=100_000)
print("mean :", round(big.mean(), 3), " theory: 170")
print("std  :", round(big.std(), 3), "  theory: 7")
within_1sd = np.mean(np.abs(big - 170.0) <= 7.0)
print("share within 1 std:", round(within_1sd, 4), " theory: ~0.68")
`,
          exampleOutput: `five heights: [172.13 162.72 175.25 176.58 156.34]
mean : 169.971  theory: 170
std  : 7.026   theory: 7
share within 1 std: 0.6817  theory: ~0.68`,
          commonMistakes: [
            {
              mistake: "Passing the variance as scale.",
              why: "'N(170, 49)' in a paper means variance 49, i.e. std 7. Writing normal(170, 49) simulates a population seven times wider than intended — and it runs without any complaint.",
              fix: "Translate before typing: scale = square root of the variance. If the source gives std already, copy it straight in.",
            },
            {
              mistake: "Calling rng.normal(5) to get five numbers.",
              why: "One positional argument is loc, not size: you get one draw centered at 5. A silent, classic bug.",
              fix: "The count is the third argument — normal(0.0, 1.0, 5) — or use rng.standard_normal(5) when the center and spread are 0 and 1.",
            },
            {
              mistake: "Reaching for normal to model anything bounded, like percentages.",
              why: "The bell has infinite tails: a normal draw can be negative or above 100, which is impossible for a true percentage.",
              fix: "Bounded quantities belong to rng.uniform (any value in a range) — or a dedicated model like binomial for counts out of n.",
            },
          ],
          related: [
            { name: "rng.standard_normal", relation: "normal(0, 1) without the two defaults — the shape of pure, centered noise." },
            { name: "rng.uniform", relation: "Flat uncertainty over a bounded range, where normal is bell-shaped over an unbounded one." },
            { name: "np.nanmean", relation: "How you honestly average noisy measurements once some of them go missing (Lesson i-05)." },
          ],
          applications: [
            "Simulating measurement error: add normal(0, sensor_std) to true values to test how a pipeline survives noise",
            "Synthetic populations: heights, scores, processing times — reproducible demographic fixtures",
            "A/B test power analysis: simulate groups under a hypothesized lift before running the experiment (the Part I project does exactly this)",
          ],
          notes:
            "The 68/95 share in the example is the empirical rule — the long-run fraction of normal draws within one and two standard deviations. With 100,000 draws it lands close enough to quote.",
        },
        {
          kind: "heading",
          text: "Poisson and binomial: counts, done two ways",
        },
        {
          kind: "text",
          text: "Two distributions answer 'how many?' and beginners mix them up weekly. **Poisson** counts events in a fixed window when events arrive independently at an average rate `lam`: calls per minute at a hotline, typos per page, decays per second. There is no upper bound — a rare minute can hold ten calls even when the average is two. **Binomial** counts successes out of a *fixed* number `n` of tries, each succeeding with probability `p`: converts out of 100 visitors, heads in 10 flips, defective bulbs in a batch of 50. The result is always between 0 and n. And both return **integers** (int64) — counts, not measurements.",
        },
        {
          kind: "functionDoc",
          name: "rng.poisson",
          purpose:
            "Draw event counts per fixed window from a Poisson distribution with average rate lam.",
          signature: "rng.poisson(lam=1.0, size=None)",
          purposeDetail:
            "Poisson is the distribution of 'how many happened?' when events occur independently at a known average rate: arrivals per minute, failures per day, clicks per session. lam is that average — both the long-run mean and (for integer lam) the most common value. The variance equals the mean too, which is Poisson's signature: noisier windows when the rate is higher, and no hard cap on how big a window's count can get. Simulating a day of operations is a loop of poisson calls, one per window, all reproducible under your seed.",
          params: [
            {
              name: "lam",
              type: "float or array_like of floats",
              required: true,
              description: "The expected number of events per window — the rate you have measured or been told. An array of lams draws each element from its own rate (busy hour vs night hour).",
              example: "2.0",
            },
            {
              name: "size",
              type: "int or tuple of ints",
              description: "How many windows to simulate, and in what shape.",
              example: "60",
            },
          ],
          returns: {
            type: "ndarray of int64 (or a scalar when size is None)",
            description: "The counts, one per window: non-negative integers averaging near lam, occasionally far above it when the rate is high — 0 is common when lam is small.",
          },
          example: `import numpy as np

rng = np.random.default_rng(3)
calls = rng.poisson(lam=2.0, size=10)     # ten one-minute windows
print("calls per minute :", calls)
print("dtype            :", calls.dtype, "(counts are integers)")

long_run = np.random.default_rng(3).poisson(lam=2.0, size=100_000)
print("long-run mean    :", round(long_run.mean(), 4), " theory: 2.0")
print("busiest minute   :", long_run.max(), " (no cap -- rare windows spike)")
`,
          exampleOutput: `calls per minute : [0 2 0 2 1 2 3 2 0 2]
dtype            : int64 (counts are integers)
long-run mean    : 2.007  theory: 2.0
busiest minute   : 10  (no cap -- rare windows spike)`,
          commonMistakes: [
            {
              mistake: "Expecting floats because you passed lam=2.0.",
              why: "Counts are whole numbers; the float lam is the average rate, not the value type. The result is an int64 array.",
              fix: "If downstream math needs floats, convert deliberately (calls.astype(float)) — but leave the counts integers as long as you can, since they are counts.",
            },
            {
              mistake: "Using poisson when the situation is n fixed tries.",
              why: "Poisson has no cap; 'successes out of exactly 100 visitors' is bounded by 100 and is binomial(n=100, p).",
              fix: "Fixed number of tries -> binomial. Open-ended window of time/space -> poisson. The story decides, not habit.",
            },
            {
              mistake: "Reading a single small draw as evidence the rate is wrong.",
              why: "Ten minutes averaging 1.4 calls when lam is 2.0 is unremarkable — small samples wobble (see the law-of-large-numbers block below).",
              fix: "Judge rates with many windows, or better, with a confidence interval — the bootstrap in Lesson i-03 builds one from a single sample.",
            },
          ],
          related: [
            { name: "rng.binomial", relation: "The fixed-n sibling: successes out of n known tries, always 0..n, where poisson is uncapped." },
            { name: "rng.exponential", relation: "The same story told as a wait: how long until the next event, where poisson counts events per window." },
            { name: "rng.integers", relation: "Uniform over a finite set — the wrong tool for event counts, but the right one for fair finite draws." },
          ],
          applications: [
            "Capacity planning: simulate a day of arrivals per hour to find how often a queue overflows",
            "Quality monitoring: is today's defect count within what lam predicts, or a real anomaly?",
            "Event-driven simulations: each simulated minute rolls its own count, reproducible under the seed",
          ],
          notes:
            "lam can be an array: rng.poisson(lam=[2.0, 8.0], size=(4, 2)) simulates four time steps of a low-rate and a high-rate process side by side.",
        },
        {
          kind: "functionDoc",
          name: "rng.binomial",
          purpose:
            "Draw the number of successes in n independent tries, each succeeding with probability p.",
          signature: "rng.binomial(n, p, size=None)",
          purposeDetail:
            "Binomial is the distribution of repeated yes/no experiments: n visitors each convert or do not (p), n patients each respond or do not, n coin flips each land heads or tails. One draw answers 'out of n, how many succeeded?' with an integer from 0 to n. The long-run average is n times p — the single most useful fact about it, verified below with 100,000 draws. Binomial is also the natural model for proportions: divide the count by n and you have a simulated conversion rate with realistic jitter.",
          params: [
            {
              name: "n",
              type: "int or array_like of ints",
              required: true,
              description: "The number of independent tries per draw — the upper bound on the result. An array of ns gives a different trial count per element.",
              example: "100",
            },
            {
              name: "p",
              type: "float or array_like of floats",
              required: true,
              description: "The success probability of each try, between 0 and 1. An array of ps varies the chance per element (e.g. per variant in an A/B test).",
              example: "0.1",
            },
            {
              name: "size",
              type: "int or tuple of ints",
              description: "How many such experiments to run, and in what shape.",
              example: "8",
            },
          ],
          returns: {
            type: "ndarray of int64 (or a scalar when size is None)",
            description: "Success counts, each between 0 and n inclusive, averaging near n * p over many draws and never exceeding n — the cap that distinguishes it from poisson.",
          },
          example: `import numpy as np

rng = np.random.default_rng(7)
batches = rng.binomial(n=100, p=0.1, size=8)   # 8 batches of 100 visitors
print("successes per batch :", batches)
print("best batch          :", batches.max(), " worst:", batches.min())

long_run = np.random.default_rng(7).binomial(n=100, p=0.1, size=100_000)
print("long-run mean       :", round(long_run.mean(), 4), " theory: n*p = 10")
print("any batch over 100? :", bool((long_run > 100).any()), " (capped at n)")
`,
          exampleOutput: `successes per batch : [11 14 12  8  8 13  3 13]
best batch          : 14  worst: 3
long-run mean       : 10.0046  theory: n*p = 10
any batch over 100? : False  (capped at n)`,
          commonMistakes: [
            {
              mistake: "Reading the result as a fraction or percentage.",
              why: "binomial(100, 0.1) returns counts like 12 and 8 — out of 100 — not 0.12 and 0.08. Averaging counts and forgetting to divide by n inflates everything a hundredfold.",
              fix: "Counts are counts. Divide by n when you want the rate: (counts / 100) or (counts / n) with n stored in a variable, never a magic number.",
            },
            {
              mistake: "Swapping the arguments: binomial(0.1, 100).",
              why: "n must be a whole number of tries; a float there is a modeling error and NumPy raises rather than guess.",
              fix: "The order is (n, p): tries first, probability second. Say it as 'out of n, chance p'.",
            },
            {
              mistake: "Using binomial for open-ended event counts.",
              why: "Binomial requires a known, fixed n. 'Calls in the next minute' has no n — arrivals just happen — and that is poisson territory.",
              fix: "Fixed basket of tries -> binomial. Time window with a rate -> poisson.",
            },
          ],
          related: [
            { name: "rng.poisson", relation: "The uncapped sibling for event windows with a rate lam; binomial is the capped version for fixed tries." },
            { name: "rng.random", relation: "The single-trial shortcut: (rng.random(n) < p).sum() is a homemade binomial — fine to know, slower to run." },
            { name: "rng.choice", relation: "Weighted sampling from arbitrary value sets (Lesson i-03), where binomial only speaks 0/1 success counts." },
          ],
          applications: [
            "A/B and conversion simulation: how often does a 10% converter beat a 12% converter on 100 visitors each? (The Part I project answers with a bootstrap.)",
            "Survey and poll simulation: n respondents, p support — jitter that respects the cap",
            "Acceptance sampling: defects in a batch of n, flagged against a threshold",
          ],
          notes:
            "When n is large and p is small, binomial(n, p) is extremely close to poisson(lam = n * p) — the historic bridge between the two distributions.",
        },
        {
          kind: "heading",
          text: "The law of large numbers, checked",
        },
        {
          kind: "text",
          text: "Every 'expected value' in the table above is a promise: the mean of many draws approaches it. That is the **law of large numbers**, and it is not a fact to memorize — it is a fact to *verify*. One seeded Generator, 100,000 draws per distribution, sample mean beside theory, error beside that:",
        },
        {
          kind: "code",
          title: "Six promises, six receipts (100,000 draws each)",
          code: `import numpy as np

rng = np.random.default_rng(42)
n = 100_000

u = rng.random(n)
print("random()         mean:", round(u.mean(), 6), " expected 0.5  error:", round(abs(u.mean() - 0.5), 6))

z = rng.standard_normal(n)
print("standard_normal  mean:", round(z.mean(), 6), " expected 0.0  error:", round(abs(z.mean()), 6))
print("standard_normal  std :", round(z.std(), 6), "  expected 1.0  error:", round(abs(z.std() - 1.0), 6))

k = rng.poisson(3.0, n)
print("poisson(3)       mean:", round(k.mean(), 6), " expected 3.0  error:", round(abs(k.mean() - 3.0), 6))

b = rng.binomial(10, 0.3, n)
print("binomial(10,0.3) mean:", round(b.mean(), 6), " expected 3.0  error:", round(abs(b.mean() - 3.0), 6))

w = rng.exponential(2.0, n)
print("exponential(2)   mean:", round(w.mean(), 6), " expected 2.0  error:", round(abs(w.mean() - 2.0), 6))

v = rng.uniform(0.0, 10.0, n)
print("uniform(0,10)    mean:", round(v.mean(), 6), " expected 5.0  error:", round(abs(v.mean() - 5.0), 6))
`,
          output: `random()         mean: 0.500625  expected 0.5  error: 0.000625
standard_normal  mean: 0.002751  expected 0.0  error: 0.002751
standard_normal  std : 1.001693   expected 1.0  error: 0.001693
poisson(3)       mean: 2.9954  expected 3.0  error: 0.0046
binomial(10,0.3) mean: 3.00356  expected 3.0  error: 0.00356
exponential(2)   mean: 1.998506  expected 2.0  error: 0.001494
uniform(0,10)    mean: 5.009523  expected 5.0  error: 0.009523`,
          outputNote:
            "Deterministic under seed 42: run it anywhere, any decade, and these exact seven lines come back. Every error is far below 0.01 — none of the sample means strays even a hundredth from theory.",
          explain: [
            "Six distributions, seven checks, and not one error reaches 0.01 — with 100,000 draws each. The law of large numbers is not a slogan; it is an operating property you just audited.",
            "binomial(10, 0.3) and poisson(3) both average to 3.0 — n * p equals lam here on purpose, showing the bridge noted in the binomial card.",
            "The errors are tiny but nonzero — the sample mean wobbles around the truth by about 1 over the square root of n. Ten draws would wobble ~100 times more; see the quiz.",
          ],
        },
        {
          kind: "heading",
          text: "Choosing by story, not by habit",
        },
        {
          kind: "table",
          title: "The story decides the distribution",
          headers: ["The sentence you would say", "The distribution to reach for"],
          rows: [
            ["'How many events happened in this window?'", "`rng.poisson(lam)` — counts at a rate, no cap"],
            ["'How long until the next one happens?'", "`rng.exponential(scale)` — waiting times"],
            ["'The measurement wobbles around a true value.'", "`rng.normal(loc, scale)` — scale is the std"],
            ["'Anything in this range is equally likely.'", "`rng.uniform(low, high)` — or `rng.random()` for [0, 1)"],
            ["'A fair draw from a fixed set of options.'", "`rng.integers(low, high)` — dice, rows, cards"],
            ["'Successes out of n tries, each with chance p.'", "`rng.binomial(n, p)` — capped counts"],
          ],
          caption:
            "Say the sentence about your data out loud. The verb in it — counts, waits, wobbles, bounded, fair, succeeds — names the distribution. If you cannot say the sentence, you are not ready to simulate.",
        },
        {
          kind: "arrayViz",
          title: "The axis lab — per-site uptime scores",
          mode: "axis",
          name: "uptime",
          caption:
            "Four sites, five uptime scores each — a 4x5 grid of integers drawn once with default_rng(5). Pick 'mean' and collapse axis 1: each row becomes one number, the site's average. Collapse axis 0 instead: each column becomes one number, the per-round average. The result panel prints exactly like NumPy prints it — this is the same axis machinery as Lesson d-04's masks and Part H's statistics, now holding random data.",
          data: [
            [67, 80, 2, 80, 46],
            [51, 63, 28, 97, 5],
            [27, 38, 57, 40, 13],
            [4, 0, 4, 14, 99],
          ],
          labels: {
            rows: ["Site A", "Site B", "Site C", "Site D"],
            cols: ["Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5"],
          },
          dtype: "int64",
          ops: ["mean", "sum", "max", "min"],
        },
        {
          kind: "tryIt",
          title: "Turn the dials, watch the receipts",
          task:
            "Press Run to see one seeded tour of counts, waits, and noise. Then: (1) raise lam from 2.5 to 8.0 — do call counts get bigger AND noisier? (2) set scale to 10.0 and watch the waits stretch; (3) add a fourth line drawing binomial(50, 0.5, 10) and check its mean against n*p = 25 by printing batches.mean().",
          code: `import numpy as np

rng = np.random.default_rng(100)

lam = 2.5        # average calls per minute
scale = 3.0      # average minutes between failures

calls = rng.poisson(lam, 10)
waits = rng.exponential(scale, 10)
noise = rng.normal(0.0, 1.0, 10)

print("poisson calls    :", calls, " mean:", calls.mean())
print("exponential waits:", np.round(waits, 2), " mean:", round(waits.mean(), 2))
print("normal noise     :", np.round(noise, 2), " mean:", round(noise.mean(), 2))
`,
          hint:
            "Small samples wobble: a mean of 10 draws near lam is normal even when it misses by a lot. The 100,000-draw block above is the version that must land close.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Every distribution answers one sentence: counts at a rate (poisson), successes out of n (binomial), waits between events (exponential), noise around a truth (normal), bounded and flat (uniform), fair finite draws (integers). normal's scale is the standard deviation. And the law of large numbers is checkable: 100,000 seeded draws put every sample mean within a hundredth of theory.",
        },
      ],
      terms: [
        { term: "Distribution", definition: "The shape of uncertainty for a quantity: which values are likely, which rare. Choosing it correctly is the modeling step before any simulation." },
        { term: "Expected value", definition: "The long-run average of draws from a distribution — 0.5 for random(), lam for poisson, n*p for binomial. The law of large numbers promises sample means approach it." },
        { term: "Standard deviation vs variance", definition: "Two measures of spread: rng.normal's scale is the standard deviation; the variance is its square (variance 49 means scale 7). The classic translation step when reading papers." },
        { term: "Law of large numbers", definition: "The theorem that sample means converge to the expected value as draws multiply — verified in this lesson with 100,000 draws per distribution, every error below 0.01." },
        { term: "Half-open range", definition: "An interval including its bottom and excluding its top, like integers(1, 7) = 1..6 — the same convention as slicing and range()." },
      ],
      mistakes: [
        {
          mistake: "Passing the variance where rng.normal wants the standard deviation.",
          why: "Papers quote variance (49); the API wants std (7). Simulated data ends up far too spread out and nothing raises an alarm — every downstream number is quietly wrong.",
          fix: "Translate on sight: scale is the square root of the variance. If a source says sigma, that is already the std — copy it directly.",
        },
        {
          mistake: "Expecting poisson or binomial to return floats.",
          why: "They return counts — int64 arrays. Downstream code expecting float64 gets surprises the moment it divides or compares dtypes.",
          fix: "Counts are integers by nature. Convert deliberately with .astype(float) only at the boundary where a rate or proportion is needed.",
        },
        {
          mistake: "Judging a rate from a handful of draws.",
          why: "Ten poisson(3) draws averaging 2.1 is completely ordinary — the standard error of a mean shrinks like 1/sqrt(n), so tiny samples wobble hugely.",
          fix: "Estimate rates from many windows, or quantify the wobble with the bootstrap (next lesson) instead of trusting one sample's mean.",
        },
        {
          mistake: "Reaching for normal to model bounded quantities like percentages.",
          why: "The bell curve has infinite tails: a normal 'percentage' draw can be -13 or 140, values a real percentage can never take.",
          fix: "Bounded flat uncertainty is uniform(low, high); bounded success counts are binomial(n, p). Let the story pick the shape.",
        },
      ],
      takeaways: [
        "Six core calls cover most real randomness: integers, random/uniform, normal/standard_normal, poisson, binomial, exponential — each with parameters that ARE the story (lam the rate, n*p the successes, scale the std).",
        "normal's scale is the standard deviation, never the variance — variance 49 means scale 7.",
        "poisson and binomial return integer counts; poisson is uncapped windows, binomial is capped at n tries.",
        "The law of large numbers is auditable: with 100,000 seeded draws, every sample mean in this lesson landed within 0.01 of theory.",
        "Choose distributions by saying the sentence about your data — the verb names the tool.",
      ],
      quiz: [
        {
          id: "i-02-q1",
          prompt: "Heights are ~ N(170, 7^2) — mean 170, variance 49. Which call simulates them?",
          options: [
            { text: "rng.normal(loc=170.0, scale=7.0, size=n)", correct: true, feedback: "Correct: the paper's variance 49 translates to scale 7 (the square root) — scale is the standard deviation." },
            { text: "rng.normal(loc=170.0, scale=49.0, size=n)", correct: false, feedback: "That passes the variance where the std belongs — a crowd seven times too spread out, with no error raised." },
            { text: "rng.normal(loc=7.0, scale=170.0, size=n)", correct: false, feedback: "Arguments swapped: the center is loc. This simulates noise around 7 with a gigantic spread." },
            { text: "rng.uniform(low=163.0, high=177.0, size=n)", correct: false, feedback: "Uniform is flat over the range — heights cluster near the middle, which is exactly the bell shape normal provides." },
          ],
          explanation: "N(mean, variance) in notation becomes normal(loc=mean, scale=square root of variance) in code. The scale-is-std rule is the translation.",
        },
        {
          id: "i-02-q2",
          prompt: "A hotline averages 2.2 calls per minute. You want to simulate ONE minute's call count. The right call is:",
          options: [
            { text: "rng.poisson(lam=2.2)", correct: true, feedback: "Yes — events in a fixed window at a known rate, no cap: that is poisson's exact story." },
            { text: "rng.binomial(n=2, p=... )", correct: false, feedback: "Binomial needs a fixed number of tries n — a minute of incoming calls has no n, the arrivals just happen." },
            { text: "rng.exponential(scale=2.2)", correct: false, feedback: "Exponential answers 'how long until the next call?' — a waiting time (a float), not a count of calls." },
            { text: "rng.integers(0, 5)", correct: false, feedback: "That is a fair draw from 0..4 — every count equally likely, and capped at 4. Real call counts are lopsided toward small values and uncapped." },
          ],
          explanation: "Say the sentence: 'how many events in a window?' — the verb counts, so poisson(lam), where lam is the measured average.",
        },
        {
          id: "i-02-q3",
          prompt: "You draw 10 values from poisson(3) and the sample mean is 2.1. The 100,000-draw block in this lesson showed means within 0.01 of theory. What is going on?",
          options: [
            { text: "Nothing is wrong: sample means wobble, and the wobble shrinks only as the number of draws grows", correct: true, feedback: "Right — the standard error falls like 1/sqrt(n): ten draws wobble ~100 times more than ten thousand. Convergence is a large-n promise." },
            { text: "The generator is broken and produced a bad sample", correct: false, feedback: "The sample is perfectly ordinary for n=10. The same seeded generator produced the spot-on 100,000-draw means." },
            { text: "lam must secretly be 2.1, not 3", correct: false, feedback: "lam is a property of the distribution you asked for; a small sample cannot change it, only mis-estimate it." },
            { text: "You should always trust the small sample more than theory", correct: false, feedback: "Backwards — the small sample is the noisy measurement; the expected value is what it is estimating." },
          ],
          explanation: "The law of large numbers is about convergence with growing n. Small samples legitimately wander — which is why the bootstrap (next lesson) exists to measure the wandering.",
        },
      ],
    },

    // ------------------------------------------------------------- i-03
    {
      slug: "i-03",
      title: "Sampling, Shuffling and Permutations",
      minutes: 16,
      summary:
        "rng.choice with and without replacement and with weights, shuffle versus permutation (in place versus a copy), the train/test split idiom, and the bootstrap — a real confidence interval from twelve numbers, all under fixed seeds.",
      kind: "concept",
      objectives: [
        "Draw samples with rng.choice: with or without replacement, and with p= weights",
        "Distinguish rng.shuffle (in place, returns None) from rng.permutation (returns a shuffled copy) and prove the difference with array_equal",
        "Permute the ROWS of a dataset using rng.permutation(len(X)) as an index",
        "Build a train/test split with one permutation and two slices, and verify every row lands on exactly one side",
        "Run a bootstrap: resample with replacement, collect means, read the 2.5th and 97.5th percentiles as a confidence interval",
      ],
      why: "Sampling is where randomness earns its keep: picking a subset of rows, shuffling a dataset before splitting it, simulating a survey with unequal probabilities, or measuring how much a statistic would wobble with a different sample. These moves — choice, shuffle, permutation, and the bootstrap — are the daily bread of data work, and each is only trustworthy when it is seeded. This lesson does all four with verified outputs and ends with a genuine 95% confidence interval computed from a single twelve-number sample.",
      blocks: [
        {
          kind: "text",
          text: "Flip the previous lesson around. Distributions *generate* new worlds; **sampling** works on data you already have: pick 10 rows, shuffle a deck, split a dataset into train and test, or ask 'if I could re-run the experiment, how much would my average move?' The Generator gives you four verbs for this, and they compose: the bootstrap at the end of the lesson is nothing but `integers` from Lesson i-02 plus a mean and a percentile you already own.",
        },
        {
          kind: "heading",
          text: "rng.choice: the sampling knife",
        },
        {
          kind: "text",
          text: "`rng.choice(a, size=...)` draws `size` elements from `a` — **with replacement by default** (the same element can appear twice, like rolling a die repeatedly). The `p=` parameter weights the draw: a probability for every element, summing to 1. Here is a fair die and a loaded one, ten rolls each, from one seeded Generator:",
        },
        {
          kind: "code",
          title: "A fair die and a loaded one",
          code: `import numpy as np

rng = np.random.default_rng(42)
faces = np.arange(1, 7)

fair = rng.choice(faces, size=10)
print("fair die  :", fair)

weights = [0.1, 0.1, 0.1, 0.1, 0.1, 0.5]      # six is five times likelier
loaded = rng.choice(faces, size=10, p=weights)
print("loaded die:", loaded)
print("sixes in the loaded ten:", int((loaded == 6).sum()))
`,
          output: `fair die  : [1 5 4 3 3 6 1 5 2 1]
loaded die: [6 6 6 2 5 4 6 6 6 5]
sixes in the loaded ten: 6`,
          outputNote:
            "Seed 42 fixes both rows of rolls forever. The loaded die rolled seven sixes out of ten — luckier than its 50% weight promises, but exactly the kind of streak weighted dice produce.",
          explain: [
            "`replace=True` is the default, so `fair` can repeat values — a fair die rolled ten times SHOULD sometimes repeat.",
            "`p=weights` skews the draw: each face's weight is its share of probability. The loaded ten show it working.",
            "With `replace=False` the draw becomes 'pick a subset': every chosen element appears once — the lottery idiom, `rng.choice(np.arange(1, 50), size=6, replace=False)`.",
          ],
        },
        {
          kind: "text",
          text: "Weights are probabilities, and probabilities have to add up. Hand `p=` a list that does not sum to 1 and NumPy refuses — loudly, which is a favor. Run this one to burn the error message into memory:",
        },
        {
          kind: "code",
          title: "Weights that do not add up (the real error)",
          code: `import numpy as np

rng = np.random.default_rng(0)
faces = np.arange(1, 7)

# Six faces at 0.2 each: the weights total 1.2, not 1
rolls = rng.choice(faces, size=10, p=[0.2, 0.2, 0.2, 0.2, 0.2, 0.2])
`,
          expectError:
            "ValueError: Probabilities do not sum to 1. See Notes section of docstring for more information.",
          outputNote:
            "The full final error line. NumPy checks the sum (within floating-point tolerance) before drawing anything — a malformed probability distribution never silently runs.",
          explain: [
            "0.2 times six is 1.2 — you invented 20% of extra probability, and NumPy will not guess which face to take it from.",
            "The fix is arithmetic, not code: make the weights total 1 (here, six weights of 1/6, or normalize with `w / w.sum()`).",
          ],
        },
        {
          kind: "functionDoc",
          name: "rng.choice",
          purpose:
            "Draw samples from a set of values — with or without replacement, uniformly or weighted by p=.",
          signature: "rng.choice(a, size=None, replace=True, p=None, axis=0, shuffle=True)",
          purposeDetail:
            "choice is sampling in one call. Give it a 1-D array (or an int, meaning arange of that length) and it hands back draws: with replacement by default, without when replace=False, and skewed by any probability vector you pass as p=. It is the tool for 'simulate 10 rolls', 'pick 6 lottery numbers', and 'sample 100 rows with the same frequencies the population has'. Everything is drawn from your Generator's stream, so a logged seed makes the sample reproducible.",
          params: [
            {
              name: "a",
              type: "1-D array_like or int",
              required: true,
              description: "The population to draw from. An int n is shorthand for np.arange(n) — choice(10, 3) draws three values from 0..9.",
              example: "np.arange(1, 7)",
            },
            {
              name: "size",
              type: "int or tuple of ints",
              description: "How many draws, and in what shape. Omit it for a single scalar draw.",
              example: "10",
            },
            {
              name: "replace",
              type: "bool",
              description: "True (default): draws are independent — repeats allowed, and size may exceed len(a). False: a subset — every element drawn at most once, and size cannot exceed len(a).",
              example: "False",
            },
            {
              name: "p",
              type: "1-D array_like of floats, same length as a",
              description: "Optional probabilities, one per element, summing to 1 (within floating-point tolerance) — otherwise ValueError. Uniform draws omit p entirely.",
              example: "[0.1, 0.1, 0.1, 0.1, 0.1, 0.5]",
            },
            {
              name: "axis",
              type: "int",
              description: "For 2-D+ input a, the axis along whose elements to sample — default 0 (e.g. sample rows of a matrix).",
              example: "0",
            },
            {
              name: "shuffle",
              type: "bool",
              description: "When replace=False, whether the draw order is shuffled (True, default) or comes out in the original order — a niche performance knob.",
              example: "True",
            },
          ],
          returns: {
            type: "ndarray (or scalar when size is None)",
            description: "The sampled values in draw order. With p=None every element is equally likely; with p=, each element's chance is exactly its weight.",
          },
          example: `import numpy as np

rng = np.random.default_rng(42)
faces = np.arange(1, 7)

print("with replacement :", rng.choice(faces, size=10))
print("weighted         :", rng.choice(faces, size=10, p=[0.1, 0.1, 0.1, 0.1, 0.1, 0.5]))

lottery = np.random.default_rng(1).choice(np.arange(1, 50), size=6, replace=False)
print("lottery (no repeats):", np.sort(lottery))
`,
          exampleOutput: `with replacement : [1 5 4 3 3 6 1 5 2 1]
weighted         : [6 6 6 2 5 4 6 6 6 5]
lottery (no repeats): [ 2  8 21 24 35 45]`,
          commonMistakes: [
            {
              mistake: "Passing weights that do not sum to 1.",
              why: "p= is a probability distribution, and 1.2 or 0.85 of a probability is a contradiction. NumPy raises ValueError before drawing anything (you saw the exact line two blocks up).",
              fix: "Check the sum, or normalize: p = counts / counts.sum(). Weights proportional to frequencies are fine — normalized weights are what the API needs.",
            },
            {
              mistake: "Expecting replace=False behavior by default.",
              why: "The default is replace=True, so size=10 from a 6-element array happily repeats values — which surprises people building 'unique random picks'.",
              fix: "Subsets need replace=False. And with replace=False, size above len(a) raises — you cannot draw 10 unique values from 6 faces.",
            },
            {
              mistake: "Using choice(1) style indexing and forgetting the shape.",
              why: "choice(a, size=(3, 4)) returns a 3x4 grid of draws; choice(a) returns a scalar. Code assuming one shape gets the other silently.",
              fix: "Always pass size explicitly in shared code, and remember shapes flow through just like in the creation functions of Part B.",
            },
          ],
          related: [
            { name: "rng.permutation", relation: "The whole-population version: every element appears, in random order — choice(replace=False) without the subsetting." },
            { name: "rng.integers", relation: "Uniform draws of INDICES when the population is a plain range — the bootstrap's engine (this lesson, bottom)." },
            { name: "rng.binomial", relation: "Weighted yes/no counting when you only need 'how many of the p= events happened' (Lesson i-02)." },
          ],
          applications: [
            "Simulating surveys and games: weighted populations, loaded dice, biased coins — reproducibly",
            "Lottery and subset selection: replace=False picks unique elements in random order",
            "Resampling rows of a dataset to a target size, e.g. balancing classes before training",
          ],
          notes:
            "For sampling ROWS of a 2-D dataset, rng.choice(X, size=k, axis=0) works directly; the permutation-based idiom below is the more common split-builder because one permutation serves both sides.",
        },
        {
          kind: "heading",
          text: "shuffle vs permutation: one mutates, one returns",
        },
        {
          kind: "text",
          text: "Two names, one family, opposite manners. `rng.shuffle(x)` shuffles **in place** — it rearranges x itself and returns *nothing* (Python's None). `rng.permutation(x)` leaves x untouched and **returns a shuffled copy**. Same seed, same resulting order — the difference is only what happens to your original array. Which is exactly the kind of claim this course verifies rather than asserts:",
        },
        {
          kind: "code",
          title: "The difference, proven with array_equal",
          code: `import numpy as np

rng = np.random.default_rng(42)
a = np.array([1, 2, 3, 4, 5])
before = a.copy()

rng.shuffle(a)                        # in place: a itself is rearranged
print("before         :", before)
print("after shuffle  :", a)
print("changed in place:", not np.array_equal(before, a))

rng2 = np.random.default_rng(42)
b = np.array([1, 2, 3, 4, 5])
p = rng2.permutation(b)               # returns a shuffled COPY
print("permutation    :", p)
print("original b     :", b, "<- untouched")
print("same seed -> same order:", np.array_equal(p, a))
`,
          output: `before         : [1 2 3 4 5]
after shuffle  : [5 3 4 2 1]
changed in place: True
permutation    : [5 3 4 2 1]
original b     : [1 2 3 4 5] <- untouched
same seed -> same order: True`,
          outputNote:
            "shuffle reordered a and returned None; permutation returned [the same order] while b sits untouched. Two Generators, one seed, one shared outcome.",
          explain: [
            "`rng.shuffle(a)` — the array itself is rearranged. If you wrote `result = rng.shuffle(a)`, result is None: the classic trap.",
            "`rng2.permutation(b)` — b is untouched, the shuffle lives in the returned array. When you need the original AND a shuffled version, this is your method.",
            "Both used seed 42 and produced the same order — they draw from the stream identically; only the delivery differs.",
          ],
        },
        {
          kind: "functionDoc",
          name: "rng.permutation",
          purpose:
            "Return a shuffled copy of an array — or, given an int n, a random ordering of 0..n-1 to use as an index.",
          signature: "rng.permutation(x, axis=0)",
          purposeDetail:
            "permutation is the non-destructive shuffler: whatever you hand it comes back in a random order, and the original stays exactly as it was (the opposite delivery from rng.shuffle, which rearranges in place and returns None). Its second superpower is the int form: rng.permutation(n) returns a random ordering of the row indices 0..n-1 — and a random ordering of indices is the raw material of the two great data idioms, permuting dataset rows and building train/test splits, both built below from this one call.",
          params: [
            {
              name: "x",
              type: "int or array_like",
              required: true,
              description: "An int n: returns a random permutation of np.arange(n) — indices. An array: returns a shuffled copy of it, original untouched.",
              example: "len(data)",
            },
            {
              name: "axis",
              type: "int",
              description: "For multi-dimensional input, the axis along which to permute — axis 0 shuffles rows (the dataset idiom).",
              example: "0",
            },
          ],
          returns: {
            type: "ndarray",
            description: "For int input, an int64 array holding every index 0..n-1 exactly once, in random order. For array input, a new array with the same values shuffled along axis. The input itself is never modified.",
          },
          example: `import numpy as np

rng = np.random.default_rng(0)
a = np.array([1, 2, 3, 4, 5])
shuffled = rng.permutation(a)
print("returned :", shuffled)
print("original :", a, "<- untouched")

perm = np.random.default_rng(0).permutation(5)
print("index perm:", perm, "<- every index 0..4, once each")

X = np.arange(15).reshape(5, 3)
print("X rows in permuted order:")
print(X[perm])
`,
          exampleOutput: `returned : [3 5 4 1 2]
original : [1 2 3 4 5] <- untouched
index perm: [2 4 3 0 1] <- every index 0..4, once each
X rows in permuted order:
[[ 6  7  8]
 [12 13 14]
 [ 9 10 11]
 [ 0  1  2]
 [ 3  4  5]]`,
          commonMistakes: [
            {
              mistake: "Writing result = rng.shuffle(data) and then using result.",
              why: "shuffle rearranges data in place and returns None. 'result' is None, and the first thing you do with it crashes with a confusing error far from the real bug.",
              fix: "If you want a value to use, that is permutation: result = rng.permutation(data). shuffle is for when in-place is exactly what you want.",
            },
            {
              mistake: "Calling permutation(x) and expecting x to change.",
              why: "The shuffle is delivered in the RETURN VALUE. The original is untouched by design — that is permutation's whole personality.",
              fix: "Capture the result: p = rng.permutation(x). If you truly wanted in-place, call shuffle(x) instead.",
            },
            {
              mistake: "Permuting each column of a dataset independently to 'shuffle the data'.",
              why: "Shuffling columns separately scrambles rows across each other — sensor 0's Monday reading now pairs with sensor 2's Wednesday reading. The data is destroyed, not shuffled.",
              fix: "Shuffle the ROW ORDER: rng.permutation(len(X)) as an index, applied to the whole matrix — the idiom in the next block.",
            },
          ],
          related: [
            { name: "rng.shuffle", relation: "The in-place sibling: same stream, same orders, no copy — returns None." },
            { name: "rng.choice", relation: "Subsetting sampling (some elements, maybe repeated) where permutation reorders all of them once each." },
            { name: "rng.permuted", relation: "Permutation along an axis of a multi-dimensional array with independent orders per slice — the specialist's tool." },
          ],
          applications: [
            "The train/test split: perm = rng.permutation(n), then data[perm[:k]] and data[perm[k:]]",
            "Shuffling a dataset's rows before batching, so epochs do not see the same order twice",
            "Random assignment in experiments: permute subject ids into treatment and control groups",
          ],
          notes:
            "permutation(n) and permutation(np.arange(n)) are the same call spelled two ways. For very large arrays where you only need the ORDER, permutation(n) is cheaper — it shuffles indices, not data.",
        },
        {
          kind: "heading",
          text: "Shuffling a dataset: permute rows, not values",
        },
        {
          kind: "text",
          text: "The dataset-shuffling pattern is three lines, and the middle one is the insight: generate a random order of ROW INDICES, then index the matrix with it (fancy indexing, Lesson d-05). Every row moves as a unit — readings stay with their sensor, labels stay with their features:",
        },
        {
          kind: "code",
          title: "The shuffle-a-dataset pattern",
          code: `import numpy as np

X = np.arange(12).reshape(4, 3)     # 4 samples, 3 features each
print("X:")
print(X)

rng = np.random.default_rng(7)
perm = rng.permutation(len(X))      # a random order of 0, 1, 2, 3
print("row order:", perm)

print("X[perm]:")
print(X[perm])
`,
          output: `X:
[[ 0  1  2]
 [ 3  4  5]
 [ 6  7  8]
 [ 9 10 11]]
row order: [0 2 1 3]
X[perm]:
[[ 0  1  2]
 [ 6  7  8]
 [ 3  4  5]
 [ 9 10 11]]`,
          outputNote:
            "Rows moved as whole units: [0 1 2] stayed glued to [3 4 5] and so on. The values inside each row never mixed.",
          explain: [
            "`rng.permutation(len(X))` shuffles the indices 0..3 — cheap, no data touched.",
            "`X[perm]` is fancy indexing (Lesson d-05): row perm[0] first, then perm[1], and so on — a view-free gather into a new array.",
            "X itself is unchanged; the shuffled dataset is the expression X[perm]. Assign it if you want to keep it: Xs = X[perm].",
          ],
        },
        {
          kind: "heading",
          text: "The train/test split idiom",
        },
        {
          kind: "text",
          text: "The most-used permutation in all of data science is four lines. One permutation, two slices of IT (not of the data), and every row lands on exactly one side — because a permutation contains each index exactly once:",
        },
        {
          kind: "code",
          title: "One permutation, two slices",
          code: `import numpy as np

rng = np.random.default_rng(0)
data = np.array([[10, 0.5],
                 [20, 0.7],
                 [30, 0.4],
                 [40, 0.9],
                 [50, 0.6],
                 [60, 0.8]])

perm = rng.permutation(len(data))
train = data[perm[:4]]              # first four slots of the random order
test = data[perm[4:]]               # the rest -- nothing shared

print("perm      :", perm)
print("train rows:", train[:, 0], " shape:", train.shape)
print("test  rows:", test[:, 0], " shape:", test.shape)
`,
          output: `perm      : [3 2 5 4 0 1]
train rows: [40. 30. 60. 50.]  shape: (4, 2)
test  rows: [10. 20.]  shape: (2, 2)`,
          outputNote:
            "Rows 40, 30, 60, 50 went to train and rows 10, 20 to test — the order came from perm, and the two sides partition the data exactly.",
          explain: [
            "`perm[:4]` takes the first four entries of the random order — four random, distinct row indices.",
            "`perm[4:]` takes the rest. Since perm holds every index exactly once, train and test are disjoint and together cover all rows. No row is lost, none is doubled.",
            "Change the split point (perm[:2] versus perm[2:]) or the seed — the idiom stays four lines. Real pipelines use 80/20 or 75/25 rather than 4/2.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The split explorer — which cells land where",
          mode: "slice",
          name: "data",
          caption:
            "The same 6x2 dataset and the same permutation default_rng(0) drew: [3, 2, 5, 4, 0, 1]. Step through the selections — perm[:4] visits rows 3, 2, 5, 4 (the training set, in permuted order), perm[4:] picks up rows 0 and 1 (the test set). Watch how slicing the PERMUTATION, not the data, is what makes the split random while the two sides stay disjoint.",
          data: [
            [10, 0.5],
            [20, 0.7],
            [30, 0.4],
            [40, 0.9],
            [50, 0.6],
            [60, 0.8],
          ],
          selections: [
            {
              expr: "data[perm[:4]]  (train)",
              cells: [[3, 0], [3, 1], [2, 0], [2, 1], [5, 0], [5, 1], [4, 0], [4, 1]],
              note: "The first four slots of perm ([3, 2, 5, 4]) — four random rows, visited in permuted order.",
            },
            {
              expr: "data[perm[4:]]  (test)",
              cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
              note: "The remaining slots ([0, 1]) — rows 0 and 1. Every row is in exactly one group.",
            },
            {
              expr: "train[:, 0]  (just the ids)",
              cells: [[3, 0], [2, 0], [5, 0], [4, 0]],
              note: "Column 0 of the training rows: [40, 30, 60, 50], matching the code block's output.",
            },
          ],
        },
        {
          kind: "heading",
          text: "The bootstrap: resampling your own sample",
        },
        {
          kind: "text",
          text: "You measured twelve delivery times and want to say 'the true average is 12.7, give or take *what*?' You cannot rerun the experiment — but you can do the next best thing, the **bootstrap**: treat your sample AS the population, and draw new samples *from it* with replacement. Each resample repeats some rows and drops others (that is exactly what with-replacement drawing does), so each resample's mean wobbles a little. Collect a thousand of those wobbles and the middle 95% of them is an honest **confidence interval** for the average:",
        },
        {
          kind: "code",
          title: "A real 95% confidence interval from twelve numbers",
          code: `import numpy as np

rng = np.random.default_rng(7)
sample = np.array([12.0, 15.0, 11.5, 13.0, 9.5, 14.5,
                   10.0, 16.0, 12.5, 13.5, 11.0, 14.0])
n = len(sample)

boot_means = np.empty(1000)
for i in range(1000):
    idx = rng.integers(0, n, n)          # n row positions, WITH replacement
    boot_means[i] = sample[idx].mean()   # each resample's mean

lo, hi = np.percentile(boot_means, [2.5, 97.5])
print("sample mean      :", round(sample.mean(), 4))
print("bootstrap 95% CI : [", round(lo, 4), ",", round(hi, 4), "]")
print("CI brackets mean :", bool(lo <= sample.mean() <= hi))
`,
          output: `sample mean      : 12.7083
bootstrap 95% CI : [ 11.5833 , 13.7083 ]
CI brackets mean : True`,
          outputNote:
            "Seed 7 fixes all one thousand resamples, so this interval is a number anyone can reproduce: the mean is 12.7083 and the 95% CI runs from 11.5833 to 13.7083.",
          explain: [
            "`rng.integers(0, n, n)` — the bootstrap engine: n indices from 0..n-1, WITH replacement. Some rows repeat, others are missing — a plausible 'rerun' of the experiment.",
            "`sample[idx].mean()` — fancy indexing (Lesson d-05) plus a mean (Part H). The bootstrap is a composition of things you already own.",
            "`np.percentile(boot_means, [2.5, 97.5])` — the 2.5th and 97.5th percentiles chop off the extreme 5%, leaving the middle 95%: the confidence interval. It brackets the sample mean, as a well-behaved CI should.",
            "One thousand loop iterations is teachable; production code draws them in one shot — idx = rng.integers(0, n, size=(1000, n)) then .mean(axis=1), same seed, same answer shape.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "What the bootstrap assumes",
          text: "The bootstrap's honesty comes from your sample being representative: it can only remix the twelve values it saw. A tiny or biased sample gives a confident-looking interval around a wrong center — the interval measures sampling noise, not data quality. (And notice what made this whole analysis checkable: the seed. An unseeded bootstrap is an unrepeatable experiment.)",
        },
        {
          kind: "tryIt",
          title: "Split and bootstrap yourself",
          task:
            "Run the split, then: (1) change the split from perm[:8]/perm[8:] to perm[:2]/perm[2:] and watch the shapes trade places; (2) change the split seed from 5 to 6 — a different partition, same guarantee of no overlap; (3) raise the bootstrap to 2000 resamples and watch the CI tighten slightly.",
          code: `import numpy as np

data = np.arange(100, 112)     # 12 rows of a tiny dataset
rng = np.random.default_rng(5)

perm = rng.permutation(len(data))
train, test = data[perm[:8]], data[perm[8:]]
print("perm :", perm)
print("train:", train)
print("test :", test)
print("no overlap:", len(np.intersect1d(train, test)) == 0)

boot_rng = np.random.default_rng(5)
boot = [data[boot_rng.integers(0, len(data), len(data))].mean() for _ in range(500)]
print("bootstrap mean of means:", round(float(np.mean(boot)), 3))
`,
          hint:
            "np.intersect1d finds shared elements between two arrays — here it should always come back empty, which is why the check prints True.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "choice samples (with replacement by default; p= weights must sum to 1), shuffle mutates in place and returns None, permutation returns a shuffled copy — and permutation(n) as an index is the split idiom: data[perm[:k]] trains, data[perm[k:]] tests. The bootstrap is integers-with-replacement in a loop: a thousand resample means, and the 2.5/97.5 percentiles are a real confidence interval.",
        },
      ],
      terms: [
        { term: "Sampling with replacement", definition: "Drawing where each pick is returned to the pool: repeats possible, size unlimited. The default for rng.choice and the engine of the bootstrap." },
        { term: "Weighted sampling", definition: "Drawing where elements carry unequal probabilities via p= — the weights must sum to 1, or NumPy raises ValueError." },
        { term: "Permutation", definition: "A random ordering containing every element (or index 0..n-1) exactly once. rng.permutation returns it as a new array; rng.shuffle writes it into your array in place." },
        { term: "Train/test split", definition: "Partitioning rows into a training side and a held-out test side, built from one permutation sliced in two so every row lands on exactly one side." },
        { term: "Bootstrap", definition: "Estimating a statistic's uncertainty by resampling the sample itself with replacement many times and reading the spread of the resampled statistics." },
        { term: "Confidence interval", definition: "A range that, under the method's assumptions, covers the true value with a stated probability — built here as the 2.5th-to-97.5th percentile band of bootstrap means." },
      ],
      mistakes: [
        {
          mistake: "Writing result = rng.shuffle(data) and using result.",
          why: "shuffle rearranges data in place and returns None. The crash happens at the first use of result — far from the line that caused it.",
          fix: "Want a value back? That is permutation: result = rng.permutation(data). Reserve shuffle for genuine in-place work.",
        },
        {
          mistake: "Passing rng.choice weights that do not sum to 1.",
          why: "p= is a probability distribution; a total of 1.2 or 0.85 is a contradiction, and NumPy raises ValueError (exact line verified two blocks up) rather than draw from a broken distribution.",
          fix: "Check the sum before the call, or normalize once: p = w / w.sum().",
        },
        {
          mistake: "Splitting a dataset with data[:8] / data[8:] and calling it a random split.",
          why: "That is the first eight rows in FILE order — fine only if the file is already random. Ordered files (sorted by class, by date, by store) hand the training set one population and the test set another.",
          fix: "Slice a permutation, not the data: perm = rng.permutation(n); train, test = data[perm[:8]], data[perm[8:]].",
        },
        {
          mistake: "Shuffling each column of a dataset independently.",
          why: "Columns shuffled separately stop corresponding to each other — rows pair feature values that never co-occurred. The dataset is silently destroyed.",
          fix: "Shuffle the row order once (rng.permutation(len(X)) as an index) so each row travels as a unit.",
        },
      ],
      takeaways: [
        "rng.choice draws with replacement by default; p= weights must sum to 1 (the real ValueError otherwise), and replace=False picks unique subsets.",
        "rng.shuffle mutates in place and returns None; rng.permutation returns a shuffled copy and touches nothing — same seed, same order, different delivery (proven with array_equal).",
        "The dataset idioms both live on permutation(n): X[perm] shuffles rows; perm[:k] / perm[k:] splits train from test with every row on exactly one side.",
        "The bootstrap is a loop of integers-with-replacement plus a mean; the 2.5th and 97.5th percentiles of the resample means are a genuine 95% confidence interval — [11.5833, 13.7083] for our twelve delivery times under seed 7.",
        "Everything in this lesson is seeded, so every split, shuffle, and interval is a reproducible fact.",
      ],
      quiz: [
        {
          id: "i-03-q1",
          prompt: "After `data = np.array([5, 1, 9]); result = rng.shuffle(data)`, what is result?",
          options: [
            { text: "None — shuffle rearranges data in place and returns nothing", correct: true, feedback: "Correct. The shuffled values are in data itself; result holds None, which is why using it crashes one line later." },
            { text: "The shuffled array [for example 9, 5, 1]", correct: false, feedback: "That is permutation's delivery. shuffle returns None — the data lives on in the original variable, rearranged." },
            { text: "The original, unshuffled [5, 1, 9]", correct: false, feedback: "The original array IS the one that got rearranged; nothing returns the pre-shuffle order (that is why the lesson copied it first)." },
            { text: "A boolean confirming the shuffle happened", correct: false, feedback: "No flag, no confirmation — just None. Python functions that mutate in place conventionally return nothing." },
          ],
          explanation: "shuffle = in place + returns None. permutation = original untouched + shuffled copy returned. Choosing the wrong one is the most common sampling bug in NumPy.",
        },
        {
          id: "i-03-q2",
          prompt: "In the bootstrap, each resample is drawn how?",
          options: [
            { text: "With replacement, same size as the original sample", correct: true, feedback: "Exactly — rng.integers(0, n, n): n picks where repeats are allowed, so rows duplicate and vanish, which is what makes the resample means wobble realistically." },
            { text: "Without replacement, so each resample is just a reordering", correct: false, feedback: "Without replacement, every resample would contain the same n values — every mean identical, no wobble, no interval." },
            { text: "With replacement, but larger than the sample for stability", correct: false, feedback: "Resample size equals the sample size n — matching the experiment you are re-running. A different size estimates a different quantity's noise." },
            { text: "From a fresh normal distribution fitted to the sample", correct: false, feedback: "That is a parametric bootstrap. The ordinary bootstrap here makes no distributional assumption — it resamples the data itself." },
          ],
          explanation: "The bootstrap replays the experiment by drawing n values from the n you have, WITH replacement — repeats and gaps included. The spread across replays estimates your uncertainty.",
        },
        {
          id: "i-03-q3",
          prompt: "Why does the split idiom slice the PERMUTATION (data[perm[:8]]) instead of the data (data[:8])?",
          options: [
            { text: "perm holds every row index exactly once in random order, so perm[:8] is eight random rows and perm[8:] is the rest — disjoint by construction", correct: true, feedback: "Right — a permutation cannot repeat or skip an index, so the two slices partition the data with no row lost, doubled, or biased by file order." },
            { text: "Slicing the data would crash, because data is 2-D", correct: false, feedback: "data[:8] runs fine on a 2-D array — it just takes the first eight rows in file order, which is the bias problem, not a crash." },
            { text: "It is just a style preference; both give the same random split", correct: false, feedback: "They differ completely: data[:8] is deterministic file order (biased whenever the file is ordered); perm[:8] is seeded-random. Same syntax, opposite meanings." },
            { text: "Because perm is shorter than data, so the slices are faster", correct: false, feedback: "perm has exactly len(data) entries — and performance is irrelevant at these sizes. The point is randomness plus the partition guarantee." },
          ],
          explanation: "Slice the permutation, not the data: randomness comes from perm's order, and the no-overlap guarantee comes from perm holding each index exactly once.",
        },
      ],
    },

    // ------------------------------------------------------------- i-04
    {
      slug: "i-04",
      title: "Missing Data: NaN and Its Rules",
      minutes: 15,
      summary:
        "NaN is a float64 value with rules of its own: it poisons arithmetic, is not equal to itself, cannot live in integer arrays, sorts last, and quietly answers False to every comparison — learn every rule before it bites.",
      kind: "concept",
      objectives: [
        "Explain what np.nan is — a float64 value — and predict nan + 1 and any sum or mean containing it",
        "Use NaN's self-inequality as the reason np.isnan exists, and count missing values with isnan().sum()",
        "Show why NaN cannot be assigned into an integer array (the real error) and what happens at construction time instead",
        "Predict where NaN lands in np.sort (last) and what comparisons with NaN return (False — silently)",
        "Detect NaN, inf, and -inf with np.isnan, np.isinf, and np.isfinite, and apply the fill-before-filter discipline",
      ],
      why: "Real data has holes. Sensors drop readings, survey questions go unanswered, merges miss rows — and NumPy's answer to a hole is a single value with strange rules: NaN. The rules are not quirks to memorize; they are design decisions that keep the poison visible in some places (sums become nan) and quiet in others (comparisons answer False). Knowing exactly where NaN bites loudly and where it whispers is the difference between catching missing data and silently losing rows — and the whole second half of this part builds on the rules you verify here.",
      blocks: [
        {
          kind: "text",
          text: "Meet the most troublesome float in computing: **NaN** — *not a number*. It is NumPy's way of marking 'a value should be here, and it is not' — a sensor that failed, a question skipped, a computation that had no answer. NaN is not an error and not a placeholder you chose; it is a **genuine float64 value** that flows through arrays like any other number, and everything it touches obeys five rules. This lesson verifies each one.",
        },
        {
          kind: "heading",
          text: "Rule 1: NaN is a value (and it poisons arithmetic)",
        },
        {
          kind: "code",
          title: "One hole poisons the whole reduction",
          code: `import numpy as np

x = np.array([1.0, np.nan, 3.0])
print("x          :", x, x.dtype)
print("nan + 1    :", np.nan + 1)
print("x.sum()    :", x.sum())
print("x.mean()   :", x.mean())
print("x.max()    :", x.max())
print("np.sort(x) :", np.sort(x), " <- NaN goes LAST")
`,
          output: `x          : [ 1. nan  3.] float64
nan + 1    : nan
x.sum()    : nan
x.mean()   : nan
x.max()    : nan
np.sort(x) : [ 1.  3. nan]  <- NaN goes LAST`,
          outputNote:
            "The array is ordinary float64 — the hole is a value in it. Any reduction that must combine every element (sum, mean, max) returns nan; sort (Lesson g-01) parks NaN at the end instead of crashing.",
          explain: [
            "`np.nan + 1` is nan: NaN poisons arithmetic — 'missing plus one' is still missing, which is honest.",
            "`x.sum()` is nan, not 4.0: the sum must touch every element, and one touch of NaN is enough. Same for mean and max.",
            "`np.sort(x)` gives `[1. 3. nan]`: sorting refuses to crash on NaN and pushes it to the end — remember this when you take a 'top 5' from data with holes.",
          ],
        },
        {
          kind: "heading",
          text: "Rule 2: NaN is not equal to itself",
        },
        {
          kind: "text",
          text: "This is the rule from IEEE 754, the floating-point standard, and it feels like a bug until you see why it is a feature. `np.nan == np.nan` is **False** — every NaN is 'a value that is not a number', and two unknowns cannot be declared equal (is 'sensor failed' equal to 'question skipped'?). The door this opens is the ONLY correct way to find NaN:",
        },
        {
          kind: "code",
          title: "Equality cannot find it; isnan can",
          code: `import numpy as np

print("np.nan == np.nan :", np.nan == np.nan)
print("np.nan != np.nan :", np.nan != np.nan)

x = np.array([1.0, np.nan, 3.0, np.nan])
print("x == np.nan      :", x == np.nan, " <- never True: useless")
print("np.isnan(x)      :", np.isnan(x))
print("missing count    :", np.isnan(x).sum())
print("survivors        :", x[~np.isnan(x)])
`,
          output: `np.nan == np.nan : False
np.nan != np.nan : True
x == np.nan      : [False False False False]  <- never True: useless
np.isnan(x)      : [False  True False  True]
missing count    : 2
survivors        : [1. 3.]`,
          outputNote:
            "x == np.nan is False everywhere — even at the holes. np.isnan(x) is the working detector: True exactly at the NaN cells, and a boolean mask you can count, invert, and index with (Lesson d-04).",
          explain: [
            "`x == np.nan` — every comparison against NaN is False, including NaN == NaN. That is why this line can never find your missing values.",
            "`np.isnan(x)` — the dedicated detector, built on the one property only NaN has (self-inequality).",
            "`np.isnan(x).sum()` — the counting idiom: True sums as 1, so this is 'how many holes'. `x[~np.isnan(x)]` is its mask form: the survivors.",
          ],
        },
        {
          kind: "heading",
          text: "Rule 3: NaN cannot live in an integer array",
        },
        {
          kind: "text",
          text: "NaN is a *float* value — it is literally a particular bit pattern of a 64-bit float. An int64 has no such bit pattern: every int64 combination is a real integer, so there is no room for a hole. Assign one and NumPy raises, refusing to guess what you meant:",
        },
        {
          kind: "code",
          title: "The real error from the int64 world",
          code: `import numpy as np

counts = np.array([3, 5, 2])     # int64 -- no bit pattern means 'missing'
counts[1] = np.nan               # attempt to store a hole
`,
          expectError: "ValueError: cannot convert float NaN to integer",
          outputNote:
            "The exact final error line from NumPy 2.0.2. The assignment is refused outright — an honest crash rather than a corrupted count.",
          explain: [
            "int64 arrays hold real integers only; NaN is a float64 value, and converting it to an integer is meaningless.",
            "This crash is a favor: the alternative (silently storing some integer as 'missing') would poison counts invisibly.",
            "If you need missing integers, the standard moves are a float array (counts.astype(float), NaN-capable) or a boolean mask stored alongside the ints.",
          ],
        },
        {
          kind: "text",
          text: "At *construction* time the same meeting resolves differently — and silently. Hand `np.array` a list of ints with one NaN in it, and there is exactly one dtype that can hold them all, so NumPy promotes to it without a word:",
        },
        {
          kind: "code",
          title: "Construction-time promotion: the silent float-upcast",
          code: `import numpy as np

mixed = np.array([1, np.nan, 3])     # ints + one NaN
print("dtype :", mixed.dtype)
print("values:", mixed)
`,
          output: `dtype : float64
values: [ 1. nan  3.]`,
          outputNote:
            "No error, no warning — the ints became 1.0 and 3.0 so the array can carry the NaN. One dtype fits all, and it is float64.",
          explain: [
            "dtype promotion (Lesson b-02) picks the one type that holds every element; NaN forces that type to be float64.",
            "So: assignment into an existing int array raises (the type was already fixed); construction promotes (the type was still being chosen). Two situations, two behaviors — both honest.",
          ],
        },
        {
          kind: "heading",
          text: "The detection trio: isnan, isinf, isfinite",
        },
        {
          kind: "text",
          text: "NaN has two cousins from overflow-land: `np.inf` and `-np.inf` — values that ARE numbers in a degenerate way (they obey some arithmetic, like `inf + 1 = inf`, and even `1 / np.inf = 0.0`) but collapse when combined with each other: `np.inf - np.inf` is nan again. Three predicates cover the whole family:",
        },
        {
          kind: "code",
          title: "inf arithmetic and the three detectors",
          code: `import numpy as np

print("np.inf + 1     :", np.inf + 1)
print("1 / np.inf     :", 1 / np.inf)
print("np.inf - np.inf:", np.inf - np.inf, " <- infinity minus itself has no answer")

z = np.array([1.0, np.inf, -np.inf, np.nan])
print("z              :", z)
print("np.isinf(z)    :", np.isinf(z))
print("np.isnan(z)    :", np.isnan(z))
print("np.isfinite(z) :", np.isfinite(z), " <- True only at usable numbers")
`,
          output: `np.inf + 1     : inf
1 / np.inf     : 0.0
np.inf - np.inf: nan  <- infinity minus itself has no answer
z              : [  1.  inf -inf  nan]
np.isinf(z)    : [False  True  True False]
np.isnan(z)    : [False False False  True]
np.isfinite(z) : [ True False False False]  <- True only at usable numbers`,
          outputNote:
            "isinf finds the infinities, isnan finds the holes, and isfinite is the strict gatekeeper: True only where a value is a real, usable number.",
          explain: [
            "`np.inf - np.inf` is nan — two infinities of unknown size cannot subtract, and the IEEE answer is the same missing-value marker.",
            "`np.isfinite(z)` is True only where values are neither inf nor NaN — the 'is this number usable?' test.",
            "Where do infs come from in practice? Division by values that are exactly zero (a runtime warning, Lesson i-05 covers controlling it) and overflowing multiplication.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.isnan",
          purpose:
            "Return a boolean mask that is True exactly where the input holds NaN — the one correct way to find missing values.",
          signature: "np.isnan(x, /, out=None, *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "Because NaN is the only value in computing that is not equal to itself, equality can never find it. isnan is the purpose-built detector: it applies exactly that self-inequality test under the hood and hands back a boolean array you can count (`.sum()` for 'how many missing'), invert (`~mask` for 'the survivors'), or index with (Lesson d-04's mask machinery). Nearly every missing-data pipeline in NumPy starts with one isnan call.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The values to test. Floats and complex inputs can hold NaN; integer inputs simply return all-False (integers cannot be NaN — that is Rule 3).",
              example: "np.array([1.0, np.nan])",
            },
            {
              name: "out",
              type: "ndarray, optional",
              description: "A pre-allocated array to write the boolean result into, instead of allocating a fresh one — the standard ufunc performance knob.",
              example: "out=mask",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "A mask of where to actually apply the test; positions that are False keep whatever out holds there. Niche, but it composes with the masks of Lesson d-04.",
              example: "where=valid_rows",
            },
          ],
          returns: {
            type: "ndarray of bool (same shape as x)",
            description: "True at every NaN position, False everywhere else. On integer input it is all False — an int array cannot hold NaN in the first place.",
          },
          example: `import numpy as np

x = np.array([1.5, np.nan, 3.0, np.nan])
print(np.isnan(x))
print("missing:", np.isnan(x).sum())
print("kept    :", x[~np.isnan(x)])

int_array = np.array([3, 5, 2])
print("on ints :", np.isnan(int_array), "(always False)")
`,
          exampleOutput: `[False  True False  True]
missing: 2
kept    : [1.5 3. ]
on ints : [False False False] (always False)`,
          commonMistakes: [
            {
              mistake: "Trying to find missing values with x == np.nan.",
              why: "Every comparison with NaN is False — including NaN == NaN (Rule 2, verified above). The mask comes back all-False and the code quietly treats every hole as a normal value.",
              fix: "np.isnan(x) is the detector. There is no equality shortcut and there never will be.",
            },
            {
              mistake: "Calling isnan on an integer array expecting it to find 'missing' zeros or -1s.",
              why: "Integers cannot be NaN, so isnan is all-False — and hand-rolled sentinels like -1 are ordinary integers that isnan rightly ignores.",
              fix: "If your missing ints are encoded as -1 or 0, test for THAT (x == -1) or, better, redesign the pipeline to carry a float array with real NaN plus a mask.",
            },
            {
              mistake: "Forgetting that the result is a mask, and comparing it to numbers.",
              why: "isnan returns booleans. Code like np.isnan(x) == 1 technically works (True == 1) but signals confusion about what came back.",
              fix: "Treat the output as what it is: a boolean array to .sum(), invert with ~, or index with — the full toolkit from Lesson d-04.",
            },
          ],
          related: [
            { name: "np.isinf", relation: "The same idea for infinity: True at inf and -inf, the other family of unusable values." },
            { name: "np.isfinite", relation: "The combined gate: True only where values are neither NaN nor infinite — the 'usable number' test." },
            { name: "np.nanmean", relation: "What you reach for AFTER counting: the mean that drops the holes (Lesson i-05)." },
            { name: "np.nan_to_num", relation: "The conversion tool: turn the holes you found into numbers you choose." },
          ],
          applications: [
            "Data quality reports: np.isnan(X).sum() per column — how many holes, and where",
            "Building masks: X[~np.isnan(X).any(axis=1)] keeps only complete rows (the pipeline of Lesson i-05)",
            "Guarding statistics: check isnan().any() before calling plain mean(), which a single hole would poison",
          ],
          notes:
            "NaN's self-inequality is not a NumPy choice — it is IEEE 754, the floating-point standard, and it is why a dedicated detector has to exist at all.",
        },
        {
          kind: "functionDoc",
          name: "np.isfinite",
          purpose:
            "Return a boolean mask that is True exactly where values are usable numbers — neither NaN nor infinite.",
          signature: "np.isfinite(x, /, out=None, *, where=True, casting='same_kind', order='K', dtype=None, subok=True)",
          purposeDetail:
            "isnan finds holes; isinf finds infinities; isfinite answers the question you usually actually care about: 'is this value safe to compute with?' It is True only for real, finite numbers — False at NaN, inf, and -inf alike. When a computation can fail in several ways (a division that might hit zero, an overflow that might blow up), one isfinite mask sweeps out every bad value in a single pass.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The values to test. As with isnan, integer input is always finite (True everywhere).",
              example: "np.array([1.0, np.inf, np.nan])",
            },
            {
              name: "out",
              type: "ndarray, optional",
              description: "Pre-allocated boolean array to write the result into.",
              example: "out=mask",
            },
            {
              name: "where",
              type: "array_like of bool",
              description: "Positions to actually test; the rest keep out's existing values.",
              example: "where=checked_rows",
            },
          ],
          returns: {
            type: "ndarray of bool (same shape as x)",
            description: "True at real finite numbers; False at NaN, np.inf, and -np.inf. The complement of both other predicates combined: ~isfinite(x) equals isnan(x) | isinf(x).",
          },
          example: `import numpy as np

z = np.array([1.0, np.inf, -np.inf, np.nan, 0.0])
print("z              :", z)
print("np.isfinite(z) :", np.isfinite(z))
print("usable values  :", z[np.isfinite(z)])
print("bad positions  :", int((~np.isfinite(z)).sum()))
`,
          exampleOutput: `z              : [  1.  inf -inf  nan   0.]
np.isfinite(z) : [ True False False False  True]
usable values  : [1. 0.]
bad positions  : 3`,
          commonMistakes: [
            {
              mistake: "Assuming isfinite only excludes infinity (because of the name).",
              why: "The name undersells it: isfinite is False at NaN too. 'Finite' means a real, bounded number — NaN is not one.",
              fix: "Remember the identity: ~isfinite is NaN-or-infinity. Use isfinite when the question is 'usable?', isnan when it is specifically 'missing?'.",
            },
            {
              mistake: "Using isnan to clean up after a division that produced inf.",
              why: "Division by exact zero produces inf (with a warning), not NaN — an isnan-only sweep leaves those values in place to break downstream math.",
              fix: "Clean with isfinite, which removes both families at once — or nan_to_num with explicit posinf/neginf targets (Lesson i-05).",
            },
            {
              mistake: "Testing strings or object arrays with isfinite.",
              why: "These predicates speak float. Object arrays raise or coerce unpredictably; strings never belong in a numeric pipeline anyway.",
              fix: "Convert numbers first (astype(float)), and handle non-numeric columns outside NumPy or with the mask-plus-object pattern below.",
            },
          ],
          related: [
            { name: "np.isnan", relation: "The missing-value specialist; isfinite is the general 'usable' gate that also excludes infinity." },
            { name: "np.isinf", relation: "The infinity specialist: True at inf and -inf, False at NaN — the middle member of the trio." },
            { name: "np.nan_to_num", relation: "The repair tool: replaces the non-finite values these tests found with numbers you choose." },
          ],
          applications: [
            "One-pass data validation: x = x[np.isfinite(x)] drops holes AND blowups in a single line",
            "Guarding plots: infinities wreck axis scaling — filter with isfinite before handing data to matplotlib",
            "Sanity checks on computed ratios: isfinite((a / b)).all() proves no division blew up anywhere",
          ],
          notes:
            "The trio is three views of one test: isnan for holes, isinf for infinities, isfinite for everything-usable. NaN-in-comparisons (next block) is the fourth rule that surprises people.",
        },
        {
          kind: "heading",
          text: "None: the object-array escape hatch (and why not to drive it)",
        },
        {
          kind: "text",
          text: "Python's own missing value is `None`, and you will meet it in raw data. NumPy CAN store it — by giving up the one-dtype contract and building an **object array**: a grid of Python pointers, not packed numbers. It works, it round-trips your None, and it quietly gives back nearly everything this course has taught you:",
        },
        {
          kind: "code",
          title: "What None costs",
          code: `import numpy as np

answers = np.array(["yes", None, "no"])    # strings + None -> object dtype
print("dtype  :", answers.dtype)

scores = np.array([1, None, 3])            # ints + None -> object dtype
print("dtype  :", scores.dtype)
print("is None:", scores[1] is None)
`,
          output: `dtype  : object
dtype  : object
is None: True`,
          outputNote:
            "Both arrays came back dtype object: a bag of Python objects wearing an array's shape — no packed block, one type check per element at runtime.",
          explain: [
            "The moment None enters, the one-dtype contract is gone: object arrays store pointers, so vectorized compiled loops are off the table (Part A's speed story, forfeited).",
            "`scores[1] is None` works — you kept Python semantics. That is the entire benefit, and it is real: mixed, genuinely non-numeric data sometimes needs this.",
            "For NUMERIC data with holes, the professional pattern is a float64 array with NaN plus a boolean mask — packed, fast, and testable with isnan. Object arrays are for genuinely mixed types, not for missing numbers.",
          ],
        },
        {
          kind: "heading",
          text: "Rule 4: comparisons with NaN are quietly False",
        },
        {
          kind: "text",
          text: "The loudest rules so far poisoned results visibly. This one whispers. Every comparison with NaN — `>`, `<`, `==`, `>=`, anything — evaluates to **False**, with no error and no warning. Inside a boolean mask, False means 'not selected', so a NaN row is *silently dropped* by every filter it fails:",
        },
        {
          kind: "code",
          title: "The silent drop, and the discipline that prevents it",
          code: `import numpy as np

x = np.array([1.0, np.nan, 3.0, -2.0])
print("x > 0     :", x > 0, " <- NaN says False")
print("x < 2     :", x < 2, " <- False again: NaN is in NEITHER group")
print("x[x > 0]  :", x[x > 0], " <- the NaN value silently dropped")
print("x[x < 2]  :", x[x < 2], " <- dropped here too: comparisons cannot find it")

x[np.isnan(x)] = 0.0                    # the discipline: handle NaN FIRST
print("after fill:", x, " <- now every comparison tells the truth")
print("x == 0    :", x == 0)
`,
          output: `x > 0     : [ True False  True False]  <- NaN says False
x < 2     : [ True False False  True]  <- False again: NaN is in NEITHER group
x[x > 0]  : [1. 3.]  <- the NaN value silently dropped
x[x < 2]  : [ 1. -2.]  <- dropped here too: comparisons cannot find it
after fill: [ 1.  0.  3. -2.]  <- now every comparison tells the truth
x == 0    : [False  True False False]`,
          outputNote:
            "Look at the two filtered arrays: the NaN value is in neither. It answered False to both questions and vanished from both results — the quietest data loss in NumPy.",
          explain: [
            "`x > 0` and `x < 2` both give False at the NaN position — 'unknown' answers no ordering question, the same self-inequality logic as Rule 2.",
            "The consequence: any filter drops NaN rows without telling you. If you did not count missing before and after, you will never know.",
            "The discipline: **fill or drop NaN before filtering** — `x[np.isnan(x)] = 0.0` (or the pipeline of Lesson i-05) so comparisons see real values. After the fill, `x == 0` finds the filled cell honestly.",
          ],
        },
        {
          kind: "arrayViz",
          title: "The broken-cells explorer — a grid with three holes",
          mode: "explore",
          name: "readings",
          caption:
            "A week of sensor readings with three broken cells, rendered exactly as NumPy sees them: the NaN cells display as NaN because that IS the stored float64 value — click one and the inspector reports it like any other element. This grid is the raw material of Lesson i-05's cleaning pipeline: count the broken cells per column, drop or fill them, and verify that none survive. Notice there is no 0, no -1, no blank: a hole in a float array is NaN, honestly labeled.",
          data: [
            [21.4, 20.9, NaN],
            [22.1, 21.8, 21.5],
            [NaN, 20.2, 20.6],
            [21.0, NaN, 21.3],
          ],
          labels: {
            rows: ["Sensor A", "Sensor B", "Sensor C", "Sensor D"],
            cols: ["Mon", "Tue", "Wed"],
          },
          dtype: "float64",
        },
        {
          kind: "tryIt",
          title: "Break it, then fix it",
          task:
            "Press Run to see the honest average beside the 0-filled impostor. Then: (1) change the 0-fill to 20.0 — which way does the fake mean move? (2) predict np.sort(temps) before printing it (where does NaN land?); (3) try temps[temps > 20] and count what came back against what should have.",
          code: `import numpy as np

temps = np.array([20.1, np.nan, 19.8, np.nan, 21.0, 20.5])

print("missing count :", np.isnan(temps).sum())
print("survivors     :", temps[~np.isnan(temps)])
print("nanmean       :", np.nanmean(temps))
print("0-filled mean :", np.where(np.isnan(temps), 0.0, temps).mean())
print("sorted        :", np.sort(temps))
`,
          hint:
            "The 0-filled mean drops because zeros count as real (low) readings now. That is the trap the mistakes section warns about — fill AFTER thinking, or not at all.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "NaN is a float64 value: it poisons sums visibly (nan), refuses equality with everything including itself (isnan is the only detector), cannot enter integer arrays (ValueError on assignment, silent float-upcast at construction), sorts last, and answers False to every comparison — so fill or drop BEFORE filtering. inf and -inf join the family via isinf, and isfinite is the 'usable number' gate. None belongs to object arrays, which is a different, slower world.",
        },
      ],
      terms: [
        { term: "NaN", definition: "Not a Number: a float64 value marking a missing or unrepresentable result. Poisonous in arithmetic, unequal to itself, False in every comparison, last in every sort." },
        { term: "IEEE 754", definition: "The floating-point standard that defines NaN's rules — including self-inequality — across all of computing, not just NumPy." },
        { term: "Missing-value mask", definition: "The boolean array from np.isnan (or ~np.isnan) that marks where the holes are — countable, invertible, indexable (Lesson d-04's machinery)." },
        { term: "Infinity (inf, -inf)", definition: "Float values from overflow and division by zero; partially obedient in arithmetic (inf + 1 = inf) but inf - inf collapses to NaN." },
        { term: "Object dtype", definition: "The fallback array type that stores Python objects (None among them) instead of packed numbers — flexible, and far slower for numeric work." },
      ],
      mistakes: [
        {
          mistake: "Searching for missing values with x == np.nan.",
          why: "Every comparison against NaN is False — even NaN == NaN. The mask comes back all-False and every hole sails through undetected.",
          fix: "np.isnan(x) is the only detector. It exists precisely because equality cannot do this job.",
        },
        {
          mistake: "Filling NaN with 0 and then computing the mean.",
          why: "Zeros are data. A 0-filled mean treats every hole as a real reading of exactly zero, dragging the average toward zero — our tryIt grid's honest mean 20.35 became about 13.57 the moment zeros were poured in.",
          fix: "Average with np.nanmean (next lesson) or fill with a value you can defend — like the column's own nanmean — and say which you did.",
        },
        {
          mistake: "Expecting an error or warning from comparisons involving NaN.",
          why: "NaN comparisons quietly evaluate to False — no warning, no exception. Filters drop NaN rows invisibly, and row counts shrink without any announcement.",
          fix: "Count missing before and after any filter (np.isnan(x).sum()), and handle NaN before filtering. Silence is the danger.",
        },
        {
          mistake: "Trying to store NaN in an integer array of counts.",
          why: "int64 has no bit pattern for 'missing' — the assignment raises ValueError: cannot convert float NaN to integer (verified above).",
          fix: "Switch the array to float64 if it must carry holes, or keep integers and track missingness in a separate boolean mask.",
        },
      ],
      takeaways: [
        "NaN is a real float64 value: nan + 1 is nan, and any sum, mean, or max touching it becomes nan — visible poisoning you can catch.",
        "NaN != NaN (IEEE 754), so x == np.nan never finds anything; np.isnan is the detector, np.isnan(x).sum() the count.",
        "Integer arrays refuse NaN outright on assignment (ValueError) and promote to float64 silently at construction.",
        "np.sort sends NaN last; comparisons with NaN answer False quietly, so filters drop missing rows invisibly — fill or drop FIRST, then filter.",
        "isnan / isinf / isfinite cover the whole broken family; isfinite is the 'usable number' gate, and None belongs only in slower object arrays.",
      ],
      quiz: [
        {
          id: "i-04-q1",
          prompt: "What does `np.nan == np.nan` evaluate to?",
          options: [
            { text: "False — NaN is not equal to anything, including itself", correct: true, feedback: "Correct — the IEEE 754 rule. It is why np.isnan exists and why x == np.nan can never find missing values." },
            { text: "True — a value is always equal to itself", correct: false, feedback: "That holds for every OTHER value in computing. NaN is the one exception, by design: two unknowns cannot be declared equal." },
            { text: "It raises an error", correct: false, feedback: "No error and no warning — it evaluates, quietly, to False. The silence is exactly what makes comparisons-with-NaN dangerous." },
            { text: "nan — the comparison propagates NaN", correct: false, feedback: "Comparison operators return booleans, not NaN. Propagation is for arithmetic (+, -, *, /); comparisons answer False." },
          ],
          explanation: "NaN's self-inequality is the defining rule from IEEE 754 — the property np.isnan is built on and the reason equality can never detect missing values.",
        },
        {
          id: "i-04-q2",
          prompt: "`counts = np.array([3, 5, 2])` (int64). What happens when you run `counts[1] = np.nan`?",
          options: [
            { text: "ValueError: cannot convert float NaN to integer — the assignment is refused", correct: true, feedback: "Exactly the verified error line. int64 has no bit pattern for a hole, and NumPy refuses rather than corrupt your counts." },
            { text: "counts silently becomes a float64 array containing nan", correct: false, feedback: "That is what happens at CONSTRUCTION (np.array([3, np.nan, 2]) promotes to float64). An existing int64 array keeps its dtype and refuses the assignment." },
            { text: "The nan is stored as 0, the usual integer stand-in for missing", correct: false, feedback: "NumPy never silently invents a sentinel — 0 is a real count, and guessing one for you would be a lie." },
            { text: "The nan is stored as None", correct: false, feedback: "None is a Python object, not an int64 value — it cannot live in an int64 block any more than NaN can." },
          ],
          explanation: "Assignment into an existing int array raises (the dtype is fixed); building a new array from ints + NaN promotes to float64 (the dtype was still being chosen). Two rules, both verified in this lesson.",
        },
        {
          id: "i-04-q3",
          prompt: "`x = np.array([1.0, np.nan, 3.0])`. What does `x[x > 0]` return — and why does it matter?",
          options: [
            { text: "[1. 3.] — the NaN is silently dropped because its comparison is False", correct: true, feedback: "Right, and no warning is printed. The row count quietly shrank; only counting missing before and after would reveal it." },
            { text: "[1. nan 3.] — NaN passes every filter since it is a value", correct: false, feedback: "NaN answers False to x > 0, and False means 'not selected'. It vanishes — that is the quiet data loss." },
            { text: "An error: comparisons are undefined for NaN", correct: false, feedback: "Comparisons with NaN never raise. They evaluate to False silently — which is precisely what makes this trap dangerous." },
            { text: "[nan] — only the NaN survives, since it is special", correct: false, feedback: "Backwards: NaN fails the test and is dropped. Normal values like 1.0 and 3.0 that pass are what survive." },
          ],
          explanation: "Rule 4 in action: comparisons with NaN are quietly False, so filters drop missing rows invisibly. The discipline is to fill or drop NaN deliberately BEFORE filtering.",
        },
      ],
    },

    // ------------------------------------------------------------- i-05
    {
      slug: "i-05",
      title: "NaN-safe Statistics and Cleaning Pipelines",
      minutes: 15,
      summary:
        "The nan-prefixed family turns poisoned statistics honest, np.nan_to_num is the panic button, a five-step pipeline cleans a sensor grid with three holes, and np.errstate puts floating-point warnings under your control.",
      kind: "concept",
      objectives: [
        "Compute NaN-safe statistics with np.nanmean, np.nansum, np.nanstd, np.nanmedian and np.nanpercentile, and verify each against a manual mask computation with np.allclose",
        "Predict the all-NaN slice: nan, plus a RuntimeWarning on stderr — not an exception, and never a silent 0",
        "Apply np.nan_to_num to convert NaN and the infinities into values you choose",
        "Build a cleaning pipeline: count missing per column, drop any-NaN rows, fill with column nanmeans via broadcasting and np.where, and print a before/after report",
        "Control floating-point warnings with np.errstate, and state exactly which warnings it does not control",
      ],
      why: "A single hole turning every mean into nan (Lesson i-04) is NumPy being loud; the harder skill is deciding, number by number, what a hole MEANS. Should the row go, or should the hole be filled — and with what? Every answer changes your statistics, and the dishonest ones (fill with 0, drop quietly, average the poison) all look reasonable in code. This lesson gives you the nan-family for statistics that skip holes honestly, the panic button that converts values you cannot fix, and a five-step pipeline — count, decide, drop or fill, verify, report — that turns a broken sensor grid into a dataset you can defend. Every output is machine-verified, so what you read is what you would run.",
      blocks: [
        {
          kind: "text",
          text: "Cleaning data is deciding what stays. A sensor dropped three readings, and now every average you report depends on what you do about those three holes. Fill them with 0 and your average lies downward — you proved that in the last lesson's tryIt, where the honest mean 20.35 collapsed to about 13.57 the moment zeros poured in. Leave the holes in and every mean is nan. Delete the rows and you may throw away three quarters of your data. None of these is *the* right answer in general — each is a **decision**, and this lesson gives you the tools to make it deliberately, state it honestly, and print a report you could defend to a colleague.",
        },
        {
          kind: "heading",
          text: "The nan-family: statistics that skip the holes",
        },
        {
          kind: "text",
          text: "NumPy ships a nan-prefixed twin for every major reduction. Each one does exactly what you would do by hand — build the `isnan` mask from Lesson i-04, keep the survivors, reduce those — and this course does not ask you to take that on faith:",
        },
        {
          kind: "code",
          title: "Five statistics, each checked against the mask you already own",
          code: `import numpy as np

x = np.array([3.0, np.nan, 5.0, 7.0, np.nan, 9.0])
survivors = x[~np.isnan(x)]

print("plain mean    :", x.mean(), " <- one hole poisons it")
print("manual mask   :", survivors.mean(), " <- the honest average")
print("nanmean       :", np.nanmean(x))
print("mask == nanmean:", np.allclose(np.nanmean(x), survivors.mean()))

print("nansum    :", np.nansum(x), " manual:", survivors.sum())
print("nanmedian :", np.nanmedian(x), " manual:", np.median(survivors))
print("nanstd    :", np.nanstd(x), " manual:", survivors.std())
print("nanpctl 75:", np.nanpercentile(x, 75), " manual:", np.percentile(survivors, 75))
print("all four agree:",
      np.allclose([np.nansum(x), np.nanmedian(x), np.nanstd(x), np.nanpercentile(x, 75)],
                  [survivors.sum(), np.median(survivors), survivors.std(), np.percentile(survivors, 75)]))
`,
          output: `plain mean    : nan  <- one hole poisons it
manual mask   : 6.0  <- the honest average
nanmean       : 6.0
mask == nanmean: True
nansum    : 24.0  manual: 24.0
nanmedian : 6.0  manual: 6.0
nanstd    : 2.23606797749979  manual: 2.23606797749979
nanpctl 75: 7.5  manual: 7.5
all four agree: True`,
          outputNote:
            "Every nan- statistic equals its manual mask computation to the last bit — allclose said True, then True again for all four at once. The nan-family is not magic; it is the mask, industrialized.",
          explain: [
            "The plain mean is nan — Rule 1 from Lesson i-04, the poison in action.",
            "`survivors = x[~np.isnan(x)]` is the manual honest average, 6.0 — and np.nanmean agrees with it exactly, because it is doing precisely this work.",
            "`nansum` is 24.0, not nan: the hole contributes nothing rather than poison. nanmedian (6.0), nanstd (2.23606797749979) and nanpercentile (7.5) behave the same way — and the final allclose line proves all four against their mask computations at once.",
          ],
        },
        {
          kind: "table",
          title: "The nan-family at a glance",
          headers: ["Call", "Plain sibling", "With holes, it returns"],
          rows: [
            ["`np.nanmean(x)`", "`np.mean(x)` → nan", "the mean of the survivors (6.0 above)"],
            ["`np.nansum(x)`", "`np.sum(x)` → nan", "the sum of the survivors (24.0 above)"],
            ["`np.nanstd(x)`", "`np.std(x)` → nan", "the standard deviation of the survivors"],
            ["`np.nanmedian(x)`", "`np.median(x)` → nan", "the median of the survivors"],
            ["`np.nanpercentile(x, q)`", "`np.percentile(x, q)` → nan", "the q-th percentile of the survivors"],
            ["`np.nanmin(x)` / `np.nanmax(x)`", "`np.min` / `np.max` → nan", "the smallest / largest survivor"],
          ],
          caption:
            "One naming rule covers the whole family: prefix nan, and the reduction first drops the NaN cells, then computes on what remains. When no nan-twin exists for a function you need, the manual mask route x[~np.isnan(x)] always works — you just verified five of the twins against it.",
        },
        {
          kind: "functionDoc",
          name: "np.nanmean",
          purpose:
            "Compute the arithmetic mean while ignoring NaNs — the honest average of the values that actually exist.",
          signature: "np.nanmean(a, axis=None, dtype=None, out=None, keepdims=<no value>, *, where=<no value>)",
          purposeDetail:
            "The plain mean answers 'average of everything', and one hole turns it nan (Lesson i-04). nanmean answers the question a missing-data analysis can actually defend: 'average of what was observed' — it drops NaN cells before the sum AND before the count, which makes it exactly equivalent to x[~np.isnan(x)].mean() (verified with allclose in this lesson). The whole nan-family (nansum, nanstd, nanmedian, nanpercentile) shares this contract, and the one edge to respect is the all-NaN slice: no survivors means no answer, so nan comes back with a RuntimeWarning on stderr.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The values to average. NaN cells are dropped from both the sum and the count — they are not zeros and never enter the denominator.",
              example: "np.array([3.0, np.nan, 5.0])",
            },
            {
              name: "axis",
              type: "int or tuple of ints, optional",
              description: "Axis or axes averaged over; the default flattens first. axis=0 on a grid gives one honest mean per column — the fill source in this lesson's pipeline.",
              example: "0",
            },
            {
              name: "keepdims",
              type: "bool, optional",
              description: "Keep the reduced axes as size-one dimensions so the result broadcasts against the original: nanmean(X, axis=0, keepdims=True) has shape (1, ncols), ready to poke into every row's holes with np.where.",
              example: "True",
            },
            {
              name: "where",
              type: "array_like of bool, optional",
              description: "Average only these positions — a second mask layered on top of the automatic NaN mask.",
              example: "where=valid_rows",
            },
          ],
          returns: {
            type: "ndarray or scalar (float64 for integer input)",
            description: "The mean of the non-NaN values along the axis. For all-NaN slices: nan, plus RuntimeWarning: Mean of empty slice on stderr — a stated non-answer, not an exception.",
          },
          example: `import numpy as np

temps = np.array([20.1, np.nan, 19.8, 21.0, np.nan])
print("plain mean :", temps.mean())
print("nanmean    :", np.nanmean(temps))
print("manual mask:", temps[~np.isnan(temps)].mean())

grid = np.array([[1.0, 2.0],
                 [np.nan, 4.0]])
print("per-column :", np.nanmean(grid, axis=0))
print("missing per column:", np.isnan(grid).sum(axis=0))
`,
          exampleOutput: `plain mean : nan
nanmean    : 20.3
manual mask: 20.3
per-column : [1. 3.]
missing per column: [1 0]`,
          commonMistakes: [
            {
              mistake: "Assuming nanmean treats NaN as 0 in the average.",
              why: "Zeros enter the sum AND the denominator; nanmean removes the cell from both. nanmean of [3.0, nan, 5.0] is 4.0, not 8/3.",
              fix: "If you truly want zeros counted, fill first with nan_to_num — and be ready to defend inventing data, because that is what it is.",
            },
            {
              mistake: "Calling nanmean without checking for all-NaN columns.",
              why: "One dead sensor makes that column's entry nan — and the Mean of empty slice warning on stderr is easy to miss in a notebook full of output.",
              fix: "np.isnan(X).all(axis=0) names the dead columns up front; drop them or handle them before averaging anything.",
            },
            {
              mistake: "Using nanmean to make a data-quality problem disappear.",
              why: "It answers 'mean of the observed values'. If values are missing for a reason tied to their size — a sensor that fails only on cold days — the observed mean is biased, and no nan-prefix can know that.",
              fix: "Report the missing count (np.isnan(x).sum()) next to every nan statistic, so the reader can judge how much of the data the number stands on.",
            },
          ],
          related: [
            { name: "np.mean", relation: "The plain sibling: one NaN anywhere makes the whole reduction nan (Lesson i-04, Rule 1)." },
            { name: "np.isnan", relation: "Builds the mask nanmean applies internally — your manual route when no nan-twin exists for a function." },
            { name: "np.nan_to_num", relation: "Converts the holes instead of skipping them: 0.0 or your own targets — a decision, not a default." },
            { name: "np.nanmedian / np.nanpercentile", relation: "The same contract for the median and percentiles — robust centers when outliers ride along with the holes." },
          ],
          applications: [
            "Honest dashboards: average the readings that exist, and report how many did not",
            "Per-column fill values: nanmean(X, axis=0, keepdims=True) feeds the np.where fill in this lesson's cleaning pipeline",
            "Survey analysis: skipped questions drop out of each question's average instead of poisoning it",
          ],
          notes:
            "The NumPy docstring states the all-NaN contract in so many words: 'For all-NaN slices, NaN is returned and a RuntimeWarning is raised.' That warning comes from Python's warnings machinery, so np.errstate cannot silence it — fix the dead slice instead.",
        },
        {
          kind: "heading",
          text: "The honest edge: all-NaN slices",
        },
        {
          kind: "text",
          text: "What should the mean of *nothing* be? If every value in a slice is NaN, there are no survivors to average, and nanmean refuses to invent an answer: it returns **nan** — and says so, by writing `RuntimeWarning: Mean of empty slice` to **stderr**. Run the block and read both streams:",
        },
        {
          kind: "code",
          title: "All-NaN: nan, and a warning on stderr — not an exception",
          code: `import numpy as np

all_nan = np.array([np.nan, np.nan, np.nan])
result = np.nanmean(all_nan)
print("nanmean of all-NaN array:", result)
print("is the result NaN?      :", np.isnan(result))

grid = np.array([[1.0, np.nan],
                 [3.0, np.nan]])
print("per-column nanmean      :", np.nanmean(grid, axis=0))
`,
          output: `nanmean of all-NaN array: nan
is the result NaN?      : True
per-column nanmean      : [ 2. nan]`,
          outputNote:
            "stdout shows the two printed lines; stderr carries RuntimeWarning: Mean of empty slice twice, once per all-NaN slice averaged. No exception is raised — the computation completes, honestly, with 'no answer' as the answer.",
          explain: [
            "nanmean returned nan for the all-NaN array — and told you why on stderr: Mean of empty slice. The warning is part of the contract, not a bug.",
            "The 2-D case is where this bites in practice: column 0 has real values (mean 2.0), column 1 is entirely NaN, so its entry is nan while the rest of the result computes normally.",
            "Watch for this in pipelines: one dead sensor column turns one entry of your per-column means nan — and downstream, anything that touches that entry poisons quietly again. Rule 1, round two.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Silence is not absence",
          text: "The tempting cleanup is to blanket-silence warnings and move on. The honest sequence is the reverse: find the all-NaN slices FIRST — np.isnan(X).all(axis=0) names the dead columns in one line — decide whether to drop them or handle them explicitly, and only then quiet anything, if you truly must. A warning you silenced is a fact you chose to ignore; a warning you fixed is a bug that no longer exists.",
        },
        {
          kind: "heading",
          text: "np.nan_to_num: the panic button",
        },
        {
          kind: "text",
          text: "Sometimes you cannot drop and cannot fill thoughtfully — you need finite numbers *now*, because the next step demands them: a plot's axis, a distance computation, a file format that has no NaN. `np.nan_to_num` is the blunt instrument for exactly that moment: it returns a copy with every NaN replaced (0.0 by default) and every infinity replaced by the largest finite float64 — or by targets you choose:",
        },
        {
          kind: "code",
          title: "One call, every unusable value replaced",
          code: `import numpy as np

messy = np.array([2.5, np.nan, -1.0, np.inf, -np.inf])
print("messy          :", messy)

defaults = np.nan_to_num(messy)
print("default repair :", defaults)

custom = np.nan_to_num(messy, nan=-9.0, posinf=99.0, neginf=-99.0)
print("custom repair  :", custom)
print("original intact:", np.isnan(messy[1]))
`,
          output: `messy          : [ 2.5  nan -1.   inf -inf]
default repair : [ 2.50000000e+000  0.00000000e+000 -1.00000000e+000  1.79769313e+308
 -1.79769313e+308]
custom repair  : [  2.5  -9.   -1.   99.  -99. ]
original intact: True`,
          outputNote:
            "Defaults: nan becomes 0.0, inf becomes 1.79769313e+308 (the float64 ceiling), -inf its floor. Custom targets put your vocabulary in the call — here nan reads as 'missing', encoded as -9.0. And messy itself is untouched: nan_to_num always returns a copy.",
          explain: [
            "The default repair is for emergencies: 1.79769313e+308 is the biggest finite float64 — inf demoted to 'as large as numbers go', a fact, not a value you chose.",
            "`nan=-9.0, posinf=99.0, neginf=-999.0` style targets are YOUR semantics: -9.0 for 'no reading' reads better in a report than 0.0, because 0.0 might be a real temperature.",
            "The original stays poisoned — nan_to_num never edits in place. If you want the replacement kept, assign it: messy = np.nan_to_num(messy, nan=-9.0).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.nan_to_num",
          purpose:
            "Replace NaN and the infinities with finite numbers you choose — nan becomes 0.0 and inf becomes the largest float64, unless you pass your own targets.",
          signature: "np.nan_to_num(x, copy=True, nan=0.0, posinf=None, neginf=None)",
          purposeDetail:
            "When the next step demands finite values — a plot axis, a distance metric, a file format with no NaN — nan_to_num is the conversion of last resort. It maps every unusable float to a usable one: NaN to 0.0 by default, +inf to the float64 ceiling (about 1.797e+308), -inf to the floor — or to the nan/posinf/neginf targets you pass. It is a panic button, not a cleaning strategy: the replaced values become data, indistinguishable from real readings. The professional sequence is count the holes first, clean thoughtfully, and reach for nan_to_num only when finiteness itself is the requirement.",
          params: [
            {
              name: "x",
              type: "array_like",
              required: true,
              description: "The values to convert. NaN, +inf and -inf are replaced; every finite value passes through untouched.",
              example: "np.array([np.nan, np.inf])",
            },
            {
              name: "copy",
              type: "bool, default True",
              description: "True (default): the input is never modified — you get a new array. False: convert in place and return the same object (saves memory, discards the original).",
              example: "False",
            },
            {
              name: "nan",
              type: "float, default 0.0",
              description: "The replacement for every NaN cell. Choose a value that reads as 'missing' in your domain — -1.0 or -999.0 are common sentinels — and keep 0.0 only when 0 is genuinely plausible data.",
              example: "-1.0",
            },
            {
              name: "posinf",
              type: "float, optional",
              description: "The replacement for +inf. None (the default) uses the largest finite float64; pass your own ceiling to keep numbers in a sane range.",
              example: "999.0",
            },
            {
              name: "neginf",
              type: "float, optional",
              description: "The replacement for -inf. None uses the most negative finite float64.",
              example: "-999.0",
            },
          ],
          returns: {
            type: "ndarray",
            description: "A new array (with copy=True) in which every NaN and infinity has been replaced by a finite value you can name. The input is left untouched.",
          },
          example: `import numpy as np

messy = np.array([np.nan, 5.0, np.inf])
print("defaults:", np.nan_to_num(messy))
print("custom  :", np.nan_to_num(messy, nan=-1.0, posinf=1.0e6))

with np.errstate(divide="ignore"):
    ratios = np.array([1.0, -1.0]) / np.array([0.0, 0.0])
print("ratios  :", ratios)
print("rescued :", np.nan_to_num(ratios, posinf=999.0, neginf=-999.0))
`,
          exampleOutput: `defaults: [0.00000000e+000 5.00000000e+000 1.79769313e+308]
custom  : [-1.e+00  5.e+00  1.e+06]
ratios  : [ inf -inf]
rescued : [ 999. -999.]`,
          commonMistakes: [
            {
              mistake: "Reaching for nan_to_num before counting the holes.",
              why: "After the call, np.isnan finds nothing — the damage report is unwritable, and the holes have become 0.0-shaped data indistinguishable from the real thing.",
              fix: "Count first (np.isnan(x).sum()), decide, then convert — and print the count in the final report.",
            },
            {
              mistake: "Accepting the 0.0 default on data where 0 is a real value.",
              why: "A 0-filled temperature grid claims the sensor read 'freezing'; the honest mean 20.35 in Lesson i-04's tryIt collapsed to about 13.57 under exactly this fill.",
              fix: "Pass nan=-9.0 or another impossible-in-your-domain value, and document the encoding where the data is reported.",
            },
            {
              mistake: "Forgetting the infinities.",
              why: "nan_to_num also replaces inf and -inf — with the float64 ceiling and floor by default, which can be worse than the inf you had: the number now looks finite and sane.",
              fix: "Always set posinf= and neginf= when your data can contain overflow, and prove the result with np.isfinite(rescued).all().",
            },
          ],
          related: [
            { name: "np.isnan / np.isfinite", relation: "The detectors that find what needs converting; isfinite is also the after-conversion proof." },
            { name: "np.nanmean", relation: "Skips the holes instead of replacing them — the thinking person's alternative." },
            { name: "np.where", relation: "Surgical replacement at exactly the cells a mask names — the pipeline's column-nanmean fill." },
          ],
          applications: [
            "Preparing data for tools that require finite values: some plotters, distance metrics and file formats",
            "Encoding 'missing' as an explicit sentinel for a downstream system that cannot carry NaN",
            "Damage control after a division produced infinities, with ceilings you chose rather than the float64 maximum",
          ],
          notes:
            "nan_to_num also accepts a scalar and returns a scalar. The posinf/neginf defaults are the largest and most negative finite float64 — roughly plus or minus 1.797e+308, as the default-repair line in the block above shows.",
        },
        {
          kind: "heading",
          text: "A cleaning pipeline, start to finish",
        },
        {
          kind: "text",
          text: "Here is the sensor grid from the last lesson's broken-cells explorer — four sensors, three days, three holes, one per column. Watch the same grid move through the five steps a real pipeline takes:",
        },
        {
          kind: "steps",
          title: "The five-step cleaning discipline",
          items: [
            "**Count first.** `np.isnan(X).sum(axis=0)` — holes per column — before any decision. You cannot decide about damage you have not measured.",
            "**Decide per strategy, not per cell.** Dropping rows is honest but expensive; filling is cheap but must be labeled. Pick one rule you can defend, and apply it everywhere.",
            "**Drop with the any-mask.** `X[~np.isnan(X).any(axis=1)]` keeps only complete rows — the boolean-mask machinery from Lesson d-04 doing real work.",
            "**Fill with column statistics, broadcast.** `np.nanmean(X, axis=0, keepdims=True)` has shape (1, 3) — one honest mean per column, ready to broadcast into every row's holes with `np.where`.",
            "**Verify and report.** Count the holes that remain (it must be 0), and print the before/after numbers next to each other. A clean you cannot show is a clean you did not do.",
          ],
        },
        {
          kind: "code",
          title: "The pipeline: count, drop, fill, verify, report",
          code: `import numpy as np

X = np.array([[21.4, 20.9, np.nan],
              [22.1, 21.8, 21.5],
              [np.nan, 20.2, 20.6],
              [21.0, np.nan, 21.3]])

print("missing per column:", np.isnan(X).sum(axis=0), " total:", np.isnan(X).sum())

complete = X[~np.isnan(X).any(axis=1)]
print("complete rows:", complete.shape[0], "of", X.shape[0])
print(complete)

col_means = np.nanmean(X, axis=0, keepdims=True)
print("column nanmeans:", np.round(col_means, 3))

filled = np.where(np.isnan(X), col_means, X)
print("filled grid:")
print(np.round(filled, 3))
print("holes left:", int(np.isnan(filled).sum()))
print("column means before/after fill:")
print(np.round(np.nanmean(X, axis=0), 3), "->", np.round(filled.mean(axis=0), 3))
`,
          output: `missing per column: [1 1 1]  total: 3
complete rows: 1 of 4
[[22.1 21.8 21.5]]
column nanmeans: [[21.5   20.967 21.133]]
filled grid:
[[21.4   20.9   21.133]
 [22.1   21.8   21.5  ]
 [21.5   20.2   20.6  ]
 [21.    20.967 21.3  ]]
holes left: 0
column means before/after fill:
[21.5   20.967 21.133] -> [21.5   20.967 21.133]`,
          outputNote:
            "One hole per column, three total. Dropping keeps only 1 of 4 rows — honest but ruinous. Filling keeps all 12 cells, plugs each hole with its own column's nanmean (21.5, 20.967, 21.133), and leaves every column mean exactly where it was.",
          explain: [
            "`np.isnan(X).sum(axis=0)` gives [1 1 1]: one hole per column — damage spread evenly, so no column is dead (that is the all-NaN case, and this grid does not have it).",
            "`~np.isnan(X).any(axis=1)` is True only where a row has NO hole: just Sensor B. Complete-case dropping keeps 1 row of 4 — the price of the strict rule, printed in the report.",
            "`col_means` is computed with keepdims=True, so its shape is (1, 3) and it broadcasts across all four rows: `np.where(np.isnan(X), col_means, X)` pokes each hole with its own column's mean — the broadcasting rules from Part E doing data maintenance.",
            "The last two lines are the report's punchline: after filling, the column means are identical to the nanmeans before filling. Filling with the column mean is mean-preserving by construction — the fill changes the data, not the summary.",
          ],
        },
        {
          kind: "text",
          text: "How do you choose between the two strategies? **Drop** when holes are rare and rows are expendable — a million-row log can spare a thousand. **Fill** when rows are precious or holes are so frequent that dropping would delete the dataset, as here, where the strict rule kept 1 row of 4. Fill with a statistic you can name — the column's nanmean, its nanmedian, the last known value — and never with 0 unless 0 is genuinely the most likely reading. And whatever you choose, print it: '3 holes filled with column nanmean' is one line that makes the whole analysis auditable.",
        },
        {
          kind: "arrayViz",
          title: "The drop-or-fill explorer — one grid, two strategies",
          mode: "slice",
          name: "X",
          caption:
            "The 4x3 sensor grid from the pipeline, walked selection by selection. First np.isnan(X) marks exactly the three holes — one per column, so no sensor is dead. Then the complete-case mask keeps only Sensor B's row: dropping cost 3 of 4 rows to remove 3 cells. The third selection is what the drop threw away — nine good values lost alongside the three holes. That asymmetry is why the pipeline fills instead: np.where pokes each hole with its column's nanmean, and every cell survives.",
          data: [
            [21.4, 20.9, NaN],
            [22.1, 21.8, 21.5],
            [NaN, 20.2, 20.6],
            [21.0, NaN, 21.3],
          ],
          selections: [
            {
              expr: "np.isnan(X)",
              cells: [[0, 2], [2, 0], [3, 1]],
              note: "The three holes — one per column, so np.isnan(X).all(axis=0) finds no dead column to drop.",
            },
            {
              expr: "X[~np.isnan(X).any(axis=1)]",
              cells: [[1, 0], [1, 1], [1, 2]],
              note: "Complete-case drop: only Sensor B's row has no hole — 1 row of 4 survives.",
            },
            {
              expr: "X[np.isnan(X).any(axis=1)]",
              cells: [[0, 0], [0, 1], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [3, 2]],
              note: "The rows the drop discards: nine good values lost alongside the three holes.",
            },
          ],
        },
        {
          kind: "heading",
          text: "np.errstate: warnings under your control",
        },
        {
          kind: "text",
          text: "Lesson i-04 left a promise: division by exact zero produces inf *and* a runtime warning — where does that warning come from, and how do you control it? Floating-point hardware raises flags when math goes degenerate — division by zero, overflow, invalid operations like 0/0 — and NumPy reads those flags and reports them as RuntimeWarnings (`divide by zero encountered in divide`). `np.errstate` is the context manager that sets, for exactly the block it guards, what happens instead: `'ignore'` silences the flag, `'warn'` reports it (the default), `'raise'` turns it into a `FloatingPointError`:",
        },
        {
          kind: "code",
          title: "ignore, warn, raise — the same division three ways",
          code: `import numpy as np

a = np.array([1.0, -1.0, 0.0])
b = np.array([0.0, 0.0, 0.0])

q = a / b
print("unguarded:", q)

with np.errstate(divide="ignore", invalid="ignore"):
    q_silent = a / b
print("guarded  :", q_silent)
print("identical:", np.array_equal(q, q_silent, equal_nan=True))

try:
    with np.errstate(divide="raise"):
        a / b
except FloatingPointError as e:
    print("raised   :", e)
`,
          output: `unguarded: [ inf -inf  nan]
guarded  : [ inf -inf  nan]
identical: True
raised   : divide by zero encountered in divide`,
          outputNote:
            "Run it yourself: the unguarded line prints its result AND drops two warnings on stderr — divide by zero and invalid value — for 1/0, -1/0 and 0/0 between them. The guarded block prints identical values with stderr silent. errstate changes the reporting, never the arithmetic.",
          explain: [
            "`a / b` unguarded gives [inf -inf nan]: 1/0 is inf, -1/0 is -inf, 0/0 is nan. Those are the IEEE 754 answers; the warnings are NumPy's courtesy, not errors.",
            "Inside `np.errstate(divide='ignore', invalid='ignore')` the same division runs silently — and `np.array_equal(..., equal_nan=True)` proves the results are identical, value for value, nan included.",
            "`np.errstate(divide='raise')` promotes the first flag to a FloatingPointError carrying the message 'divide by zero encountered in divide' — the strict mode for pipelines that would rather crash at the scene than compute on garbage.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.errstate",
          purpose:
            "A context manager that decides what happens when floating-point math goes degenerate — divide by zero, overflow, underflow, invalid — inside the block it guards.",
          signature: "np.errstate(**kwargs)",
          purposeDetail:
            "Floating-point hardware raises flags when arithmetic misbehaves: divide (division by zero), over (overflow past the finite range), under (underflow toward zero), invalid (operations like 0/0 whose answer is NaN). NumPy's default response is 'warn' — the RuntimeWarnings you met in Lesson i-04. errstate sets the response for the block it guards: 'ignore' silences the flag, 'warn' reports it, 'raise' turns it into a FloatingPointError, 'call' and 'log' route it elsewhere. What it never does is change the arithmetic: 1/0 is inf and 0/0 is nan under every setting — errstate controls the reporting, not the IEEE 754 math.",
          params: [
            {
              name: "all",
              type: "str, optional",
              description: "Sets all four categories at once: with np.errstate(all='ignore') nothing warns inside the block.",
              example: "'ignore'",
            },
            {
              name: "divide",
              type: "str, optional",
              description: "Response to division by zero (and by infinity). 'raise' turns it into FloatingPointError: divide by zero encountered in divide.",
              example: "'raise'",
            },
            {
              name: "over",
              type: "str, optional",
              description: "Response to overflow — results too large for float64, which become inf under 'ignore' and 'warn'.",
              example: "'ignore'",
            },
            {
              name: "under",
              type: "str, optional",
              description: "Response to underflow — results so small they round to zero. Usually harmless, and often deliberately ignored.",
              example: "'ignore'",
            },
            {
              name: "invalid",
              type: "str, optional",
              description: "Response to invalid operations like 0/0 or inf - inf, whose IEEE answer is NaN.",
              example: "'ignore'",
            },
          ],
          returns: {
            type: "context manager (also usable as a function decorator)",
            description: "A context manager: inside the with-block the chosen responses apply; on exit, NumPy restores the previous settings exactly — the guard never leaks.",
          },
          example: `import numpy as np

a = np.array([1.0, -1.0])
b = np.array([0.0, 0.0])

with np.errstate(divide="ignore"):
    print("ignored:", a / b)

try:
    with np.errstate(divide="raise"):
        a / b
except FloatingPointError as e:
    print("raised :", e)
`,
          exampleOutput: `ignored: [ inf -inf]
raised : divide by zero encountered in divide`,
          commonMistakes: [
            {
              mistake: "Wrapping everything in errstate(all='ignore') to quiet a noisy notebook.",
              why: "The warnings were the only signal that divisions by zero were happening at all. Silenced, the infs and nans flow downstream undetected.",
              fix: "Guard only the ONE computation you have reasoned about, and consider 'raise' for pipelines that should crash early rather than compute on garbage.",
            },
            {
              mistake: "Expecting errstate to silence nanmean's Mean of empty slice warning.",
              why: "That warning comes from Python's warnings module inside nanmean. errstate only reads the four hardware floating-point flags — a different warning system entirely.",
              fix: "Fix the cause: drop or handle all-NaN columns first (np.isnan(X).all(axis=0)); touch the warnings module only with a deliberate, documented filter.",
            },
            {
              mistake: "Assuming 'ignore' changes the result.",
              why: "errstate never touches the arithmetic: 1/0 is inf under 'warn' and under 'ignore' alike — verified identical with np.array_equal(..., equal_nan=True) in this lesson.",
              fix: "Choose the response for the reporting you want; fix the values themselves with nan_to_num or masks.",
            },
          ],
          related: [
            { name: "np.seterr", relation: "Sets the same responses globally for the whole session — the blunt version; prefer the scoped context manager." },
            { name: "np.geterr", relation: "Reads the current settings — useful before restoring or logging them." },
            { name: "np.nan_to_num", relation: "Repairs the VALUES the flags alerted you to; errstate only manages the alerts." },
            { name: "np.isfinite", relation: "The gatekeeper test: which cells did degenerate math actually produce?" },
          ],
          applications: [
            "Silencing a known-safe division (denominators validated elsewhere) inside one scoped block",
            "Turning floating-point trouble into exceptions in production: errstate(divide='raise') crashes at the scene of the crime",
            "Overflow-heavy algorithms (some probability and physics code) where the warnings are noise and the infs are handled downstream",
          ],
          notes:
            "Since NumPy 2.0, errstate is fully thread- and asyncio-safe but cannot be entered more than once. The four categories map onto the IEEE 754 exception flags; 'warn' is NumPy's default for all of them.",
        },
        {
          kind: "text",
          text: "One boundary to keep straight, because it trips everyone: `errstate` governs the four **hardware floating-point flags** — divide, over, under, invalid — the warnings that come out of arithmetic. The `Mean of empty slice` warning earlier in this lesson is *not* one of them: it is raised through Python's `warnings` system inside `nanmean`. If you needed to silence that one, you would need a different tool — but now you know the better answer: find the dead column with `np.isnan(X).all(axis=0)` and fix the cause instead.",
        },
        {
          kind: "tryIt",
          title: "Clean it yourself",
          task:
            "Press Run to walk the pipeline with nanmedian as the fill statistic. Then: (1) swap np.nanmedian for np.nanmean — which filled cells change, and why do the column means stay put either way? (2) add a second hole with X[1, 1] = np.nan before the count and watch 'complete rows' drop to 0 — the cliff edge of the drop strategy; (3) replace the fill with fill = 0.0 and read how far the filled grid's column means move — Lesson i-04's zero trap, now in grid form.",
          code: `import numpy as np

X = np.array([[21.4, 20.9, np.nan],
              [22.1, 21.8, 21.5],
              [np.nan, 20.2, 20.6],
              [21.0, np.nan, 21.3]])

missing = np.isnan(X).sum(axis=0)
print("missing per column:", missing)

complete = X[~np.isnan(X).any(axis=1)]
print("complete rows:", complete.shape[0], "of", X.shape[0])

fill = np.nanmedian(X, axis=0, keepdims=True)
filled = np.where(np.isnan(X), fill, X)
print("filled with column nanmedians:")
print(np.round(filled, 2))
print("any holes left:", bool(np.isnan(filled).any()))
`,
          hint:
            "With nanmedian fill, each hole receives its column's median rather than its mean — a fill that is robust to outliers, and (unlike the mean) not guaranteed to leave the column mean unchanged.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "nanmean and its family are the isnan mask, industrialized — every one matched its manual computation exactly. All-NaN slices return nan and warn on stderr; find dead columns with np.isnan(X).all(axis=0) before they find you. np.nan_to_num is the panic button: nan to 0.0, inf to the float64 ceiling, or your own targets — and it always returns a copy. The pipeline is five steps — count, decide, drop or fill, verify, report — and the fill that preserves column means is np.where(np.isnan(X), np.nanmean(X, axis=0, keepdims=True), X). np.errstate chooses what floating-point flags do (ignore, warn, raise) but never changes the arithmetic.",
        },
      ],
      terms: [
        { term: "NaN-safe reduction", definition: "A nan-prefixed statistic (nanmean, nansum, nanstd, nanmedian, nanpercentile) that drops NaN cells before reducing — exactly equivalent to reducing x[~np.isnan(x)], verified with allclose in this lesson." },
        { term: "All-NaN slice", definition: "A row or column in which every value is NaN. The nan-family returns nan for it and emits RuntimeWarning: Mean of empty slice on stderr — a stated 'no answer', not an exception." },
        { term: "Complete-case analysis", definition: "The drop strategy: keep only rows with no missing values, via X[~np.isnan(X).any(axis=1)]. Honest and simple, but it deletes every row containing even one hole." },
        { term: "Imputation", definition: "The fill strategy: replacing holes with values you can defend — here each column's own nanmean, broadcast through np.where. It must be reported, never silent." },
        { term: "Floating-point error state", definition: "The per-thread setting, read and written by np.errstate, that decides what happens when hardware flags fire: divide, over, under and invalid can each be ignored, warned about, or raised." },
      ],
      mistakes: [
        {
          mistake: "Believing nanmean 'handles' missing data.",
          why: "nanmean answers a narrower question — the mean of the values that were observed. If values are missing for a reason tied to their size, the observed mean is biased, and no nan-prefix can know that. The all-NaN slice still returns nan.",
          fix: "Report the missing count next to every nan statistic (np.isnan(x).sum()), and ask why the holes exist before trusting any skip or fill.",
        },
        {
          mistake: "Filling holes with 0.0 — or nan_to_num's defaults — on data where 0 is a plausible real value.",
          why: "Zeros are data. Lesson i-04's tryIt showed the honest mean 20.35 collapsing toward 13.57 as zeros poured in; on a temperature grid, a 0 reads as a frozen sensor — a fabricated measurement.",
          fix: "Fill with a statistic you can name — the column nanmean via np.where(np.isnan(X), np.nanmean(X, axis=0, keepdims=True), X) — and say which statistic in the report. Reserve nan_to_num's 0.0 for pipelines that only need finite values.",
        },
        {
          mistake: "Calling nan_to_num or filling before counting the holes.",
          why: "The moment holes become numbers, np.isnan finds nothing: the evidence of the damage is destroyed, and the data-quality report you owe your reader becomes impossible to write.",
          fix: "Count first — np.isnan(X).sum() per column — then transform, then print the counts in the report. Order is the whole discipline.",
        },
        {
          mistake: "Expecting np.errstate to silence nanmean's Mean of empty slice warning.",
          why: "errstate governs the four hardware floating-point flags (divide, over, under, invalid). Mean of empty slice is a Python warnings-module warning raised inside nanmean — a different system entirely.",
          fix: "Fix the cause: find dead columns with np.isnan(X).all(axis=0) and drop or handle them explicitly. Silencing a warning you understand is a choice; silencing one you do not is a gamble.",
        },
      ],
      takeaways: [
        "The nan-family is the mask, industrialized: nanmean, nansum, nanstd, nanmedian and nanpercentile all matched their manual x[~np.isnan(x)] computations exactly — allclose True, five for five.",
        "All-NaN slices return nan with RuntimeWarning: Mean of empty slice on stderr — not an exception, and never 0. Find dead columns first with np.isnan(X).all(axis=0).",
        "np.nan_to_num is the panic button: nan becomes 0.0 and inf becomes 1.79769313e+308 by default, or your own nan/posinf/neginf targets — and it always returns a copy.",
        "The pipeline is count, decide, drop or fill, verify, report. On the 4x3 sensor grid, dropping kept only 1 of 4 rows; filling with column nanmeans kept all 12 cells and left every column mean unchanged.",
        "np.errstate chooses what floating-point flags do — ignore, warn, or raise — around one guarded block. The arithmetic never changes, and Python-level warnings like Mean of empty slice are not its business.",
      ],
      quiz: [
        {
          id: "i-05-q1",
          prompt: "np.nanmean(x) on x = np.array([3.0, np.nan, 5.0]) is exactly equivalent to:",
          options: [
            { text: "x[~np.isnan(x)].mean() — drop the holes, then average the survivors", correct: true, feedback: "Correct — nanmean removes the NaN cell from the sum AND from the count, which is precisely the mask route: (3 + 5) / 2 = 4.0." },
            { text: "np.nan_to_num(x).mean() — the hole becomes 0 and all three values count", correct: false, feedback: "That averages (3 + 0 + 5) / 3 = 2.67, not 4.0 — zeros are data, the i-04 trap wearing a nan-family costume." },
            { text: "The sum of the survivors divided by x.size, so the holes still count in the denominator", correct: false, feedback: "That would give 8 / 3. nanmean divides by the number of OBSERVED values — 8 / 2 = 4.0 — which is the whole point of the family." },
            { text: "x.mean() with the nan subtracted from the result afterward", correct: false, feedback: "x.mean() is already nan, and nan minus nan is still nan. Poison cannot be subtracted out after the fact — it must be skipped before." },
          ],
          explanation: "nanmean = mask, then mean: the hole is removed from both numerator and denominator. It is the manual computation from this lesson, verified with allclose.",
        },
        {
          id: "i-05-q2",
          prompt: "np.nanmean on a column whose values are ALL NaN:",
          options: [
            { text: "Returns nan and writes RuntimeWarning: Mean of empty slice to stderr", correct: true, feedback: "Exactly the verified behavior: no survivors means no answer, and the warning on stderr says which slice was empty." },
            { text: "Raises ValueError — averaging nothing is illegal", correct: false, feedback: "No exception is raised; the call completes and returns nan. The computation is honest, not broken — and the code keeps running either way." },
            { text: "Returns 0.0 — no values means nothing was added", correct: false, feedback: "An empty average is not zero — zero is a real value claiming the sensor read 'nothing', which is a fabrication. nan is the honest answer." },
            { text: "Returns None — no values, no object", correct: false, feedback: "NumPy reductions return arrays or scalars, never None. 'No answer' in float language is nan." },
          ],
          explanation: "The all-NaN slice is the honest edge of the nan-family: nan returned, warning raised, exception avoided. Find these slices first with np.isnan(X).all(axis=0).",
        },
        {
          id: "i-05-q3",
          prompt: "Grid X has rows = samples, columns = sensors, with NaN holes. Which line fills every hole with ITS OWN column's nanmean?",
          options: [
            { text: "np.where(np.isnan(X), np.nanmean(X, axis=0, keepdims=True), X)", correct: true, feedback: "Correct — axis=0 reduces down columns (one mean per sensor), keepdims=True keeps the (1, ncols) shape so it broadcasts into every row: the pipeline's fill step." },
            { text: "np.where(np.isnan(X), np.nanmean(X, axis=1, keepdims=True), X)", correct: false, feedback: "It runs without any error — and that is the trap: axis=1 gives each ROW's mean, so every hole gets its row's average, flattening the column structure silently." },
            { text: "X[np.isnan(X)] = np.nanmean(X)", correct: false, feedback: "This fills every hole with ONE global number — the mean of all surviving cells — so a calm sensor's hole gets a busy sensor's average." },
            { text: "np.nan_to_num(X)", correct: false, feedback: "That replaces every NaN with 0.0 — inventing readings at exactly zero, the fill this lesson warns against unless zero is genuinely plausible." },
          ],
          explanation: "The fill has three parts working together: the isnan mask names the holes, axis=0 nanmean computes one fill value per column, and keepdims=True makes it broadcast. Wrong axis, wrong scope, wrong tool — three ways to fill dishonestly.",
        },
      ],
    },
  ],

  // ------------------------------------------------------------------
  // Part I exercises (12: b1-b4 beginner, i1-i4 intermediate, a1-a4 advanced)
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "i-b1",
      tier: "beginner",
      title: "Replay the stream",
      prompt:
        "Create a Generator with seed 42 and draw two batches of five integers from 0 through 9 (rng.integers(0, 10, 5), called twice). Then re-create a SECOND Generator with the same seed 42 and draw the same two batches again. Print both batches from the first Generator, then two booleans proving the replay: whether the re-created Generator's first draw is identical to the original first, and its second to the original second (np.array_equal). All four lines are fixed by the seed — the promise from Lesson i-01, in your hands.",
      hint: "The replay needs a second, freshly created Generator: replay = np.random.default_rng(42). The original rng has already advanced its cursor; only a new same-seeded Generator rewinds the stream.",
      starter: `import numpy as np

rng = np.random.default_rng(42)
first = rng.integers(0, 10, 5)
# TODO: a second draw from the SAME rng
# TODO: a re-created Generator with seed 42, and its two draws
# TODO: two array_equal proofs of the replay
`,
      solution: `import numpy as np

rng = np.random.default_rng(42)
first = rng.integers(0, 10, 5)
second = rng.integers(0, 10, 5)

replay = np.random.default_rng(42)
again1 = replay.integers(0, 10, 5)
again2 = replay.integers(0, 10, 5)

print("first :", first)
print("second:", second)
print("replay 1st draw identical:", np.array_equal(again1, first))
print("replay 2nd draw identical:", np.array_equal(again2, second))
`,
      expectedOutput: `first : [0 7 6 4 4]
second: [8 0 6 2 0]
replay 1st draw identical: True
replay 2nd draw identical: True`,
      concepts: ["default_rng", "seed", "array_equal"],
    },
    {
      id: "i-b2",
      tier: "beginner",
      title: "Sixty die rolls, one receipt",
      prompt:
        "Roll a fair six-sided die 60 times with a Generator seeded 3 (rng.integers(1, 7, 60) — remember the half-open top). Print four lines: how many sixes were rolled, the mean roll rounded to 4 decimals printed next to the theory value 3.5, the highest and lowest faces seen, and the share of rolls above 3 rounded to 4 decimals next to its theory value 0.5. Sixty rolls wobble — that is the small-sample lesson from i-02 — but every number here is fixed by the seed.",
      hint: "Count with (rolls == 6).sum(); the share above 3 is (rolls > 3).mean(). Round both with round(..., 4) so the line reads cleanly next to theory.",
      starter: `import numpy as np

rng = np.random.default_rng(3)
rolls = rng.integers(1, 7, 60)

# TODO: count of sixes
# TODO: mean roll (4 decimals) next to theory 3.5
# TODO: highest and lowest faces
# TODO: share above 3 (4 decimals) next to theory 0.5
`,
      solution: `import numpy as np

rng = np.random.default_rng(3)
rolls = rng.integers(1, 7, 60)

print("count of sixes:", int((rolls == 6).sum()))
print("mean roll     :", round(rolls.mean(), 4), " theory: 3.5")
print("highest face  :", rolls.max(), " lowest:", rolls.min())
print("share above 3 :", round(float((rolls > 3).mean()), 4), " theory: 0.5")
`,
      expectedOutput: `count of sixes: 8
mean roll     : 3.2833  theory: 3.5
highest face  : 6  lowest: 1
share above 3 : 0.45  theory: 0.5`,
      concepts: ["integers", "law of large numbers", "boolean masks"],
    },
    {
      id: "i-b3",
      tier: "beginner",
      title: "The NaN detective",
      prompt:
        "Build x = np.array([4.5, np.nan, 3.1, np.nan, 5.0]) and investigate it: print the array itself, the boolean mask from np.isnan(x), the number of missing values, and the surviving values (x[~np.isnan(x)]). Finish with one proof line: whether x == np.nan finds ANYTHING — it must print False, because equality can never detect NaN (Lesson i-04's Rule 2). Five lines of honest detective work.",
      hint: "The count is np.isnan(x).sum(); the survivors come from indexing with the inverted mask ~np.isnan(x). The last line wants bool((x == np.nan).any()).",
      starter: `import numpy as np

x = np.array([4.5, np.nan, 3.1, np.nan, 5.0])

# TODO: print x, the isnan mask, the missing count, the survivors
# TODO: and whether x == np.nan finds anything (spoiler: False)
`,
      solution: `import numpy as np

x = np.array([4.5, np.nan, 3.1, np.nan, 5.0])

print("x          :", x)
print("isnan mask :", np.isnan(x))
print("missing    :", np.isnan(x).sum())
print("survivors  :", x[~np.isnan(x)])
print("x == np.nan finds anything? :", bool((x == np.nan).any()))
`,
      expectedOutput: `x          : [4.5 nan 3.1 nan 5. ]
isnan mask : [False  True False  True False]
missing    : 2
survivors  : [4.5 3.1 5. ]
x == np.nan finds anything? : False`,
      concepts: ["np.nan", "np.isnan", "boolean masks"],
    },
    {
      id: "i-b4",
      tier: "beginner",
      title: "nanmean against the poison",
      prompt:
        "temps = np.array([19.8, 20.4, np.nan, 20.1, 20.9, np.nan]) holds six temperature readings, two of them missing. Print four lines: the plain mean (watch it turn nan — the poison), the NaN-safe mean, the NaN-safe sum, and how many values were actually counted in, formatted as '4 of 6 values' using (~np.isnan(temps)).sum() and temps.size. The honest average stands on the readings that exist.",
      hint: "np.nanmean and np.nansum skip the holes automatically. The counted-in line: print(int((~np.isnan(temps)).sum()), 'of', temps.size, 'values').",
      starter: `import numpy as np

temps = np.array([19.8, 20.4, np.nan, 20.1, 20.9, np.nan])

# TODO: plain mean, nanmean, nansum, and 'counted in' line
`,
      solution: `import numpy as np

temps = np.array([19.8, 20.4, np.nan, 20.1, 20.9, np.nan])

print("plain mean :", temps.mean())
print("nanmean    :", np.nanmean(temps))
print("nansum     :", np.nansum(temps))
print("counted in :", int((~np.isnan(temps)).sum()), "of", temps.size, "values")
`,
      expectedOutput: `plain mean : nan
nanmean    : 20.3
nansum     : 81.2
counted in : 4 of 6 values`,
      concepts: ["np.nanmean", "np.nansum", "poisoned reductions"],
    },
    {
      id: "i-i1",
      tier: "intermediate",
      title: "The law of large numbers, your receipt",
      prompt:
        "Sessions on a website average 2.5 clicks — a rate, events per session, uncapped (the story says poisson, Lesson i-02). Simulate 100,000 sessions with rng.poisson(lam=2.5, size=100_000) from a Generator seeded 11. Print the sample mean rounded to 4 decimals beside the theory value 2.5, then the sample std beside sqrt(2.5) rounded to 4 decimals (Poisson's variance equals its mean — a bonus receipt), then the dtype of the draws, and finally the busiest and quietest sessions seen. Every line should land close to theory, exactly as the law of large numbers promises.",
      hint: "np.sqrt(2.5) computes the theoretical standard deviation. The dtype prints int64 — counts are integers, not floats.",
      starter: `import numpy as np

rng = np.random.default_rng(11)
clicks = rng.poisson(lam=2.5, size=100_000)

# TODO: sample mean beside theory 2.5
# TODO: sample std beside sqrt(2.5), both rounded to 4 decimals
# TODO: dtype, busiest session, quietest session
`,
      solution: `import numpy as np

rng = np.random.default_rng(11)
clicks = rng.poisson(lam=2.5, size=100_000)

print("sample mean     :", round(clicks.mean(), 4), " theory: 2.5")
print("sample std      :", round(clicks.std(), 4), " theory: sqrt(2.5) =", round(np.sqrt(2.5), 4))
print("dtype           :", clicks.dtype)
print("busiest session :", clicks.max())
print("quietest session:", clicks.min())
`,
      expectedOutput: `sample mean     : 2.5074  theory: 2.5
sample std      : 1.5839  theory: sqrt(2.5) = 1.5811
dtype           : int64
busiest session : 12
quietest session: 0`,
      concepts: ["rng.poisson", "expected value", "law of large numbers"],
    },
    {
      id: "i-i2",
      tier: "intermediate",
      title: "Fix the crashed weighted die",
      prompt:
        "The starter crashes before printing anything — run it and READ the ValueError: the weights for a die loaded toward six (five faces at 10% each, the six at 50%) were typoed to six entries of 0.2. Fix the weights so they sum to 1, then print, for each face 1 through 6, its count in 60 rolls (Generator seeded 5, rng.choice(faces, size=60, p=weights)) alongside its expected count rounded to 1 decimal (60 times its weight). The six should dominate with about 30 of 60 — but the exact counts belong to seed 5.",
      hint: "The error line says the probabilities do not sum to 1: six entries of 0.2 total 1.2. Five faces at 0.1 plus one at 0.5 sums to 1.0. Keep the print loop shape as given in the starter.",
      starter: `import numpy as np

rng = np.random.default_rng(5)
faces = np.arange(1, 7)

# A die loaded toward six: five faces at 10% each, the six at 50%.
# Someone typoed the weights...
weights = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2]

rolls = rng.choice(faces, size=60, p=weights)
for face in faces:
    print("face", face, "count:", int((rolls == face).sum()))
`,
      solution: `import numpy as np

rng = np.random.default_rng(5)
faces = np.arange(1, 7)
weights = [0.1, 0.1, 0.1, 0.1, 0.1, 0.5]     # five light faces + a heavy six

rolls = rng.choice(faces, size=60, p=weights)
for face in faces:
    print("face", face, "count:", int((rolls == face).sum()), " expected ~", round(60 * weights[face - 1], 1))
`,
      expectedOutput: `face 1 count: 9  expected ~ 6.0
face 2 count: 1  expected ~ 6.0
face 3 count: 8  expected ~ 6.0
face 4 count: 7  expected ~ 6.0
face 5 count: 5  expected ~ 6.0
face 6 count: 30  expected ~ 30.0`,
      starterExpectError: "ValueError: Probabilities do not sum to 1. See Notes section of docstring for more information.",
      concepts: ["rng.choice", "p weights", "error reading"],
    },
    {
      id: "i-i3",
      tier: "intermediate",
      title: "shuffle vs permutation, proven",
      prompt:
        "Prove the delivery difference from Lesson i-03 on data = np.array([10, 20, 30, 40, 50]). With one Generator seeded 9: copy the data, call rng.shuffle on the original, and print what shuffle RETURNED (a surprise for Python veterans), the shuffled array, and whether the original order changed. With a second Generator also seeded 9: run rng.permutation on a fresh, identical array and print the permutation, whether the fresh array survived untouched, and whether the two methods produced the same final order — they must, because the same seed drives the same stream.",
      hint: "Capture shuffle's return value: ret = rng.shuffle(data). The untouched-check rebuilds np.array([10, 20, 30, 40, 50]) and compares; the final check is np.array_equal(p, data).",
      starter: `import numpy as np

data = np.array([10, 20, 30, 40, 50])

rng1 = np.random.default_rng(9)
# TODO: copy, shuffle in place, print the return value + shuffled data + changed?

rng2 = np.random.default_rng(9)
# TODO: permutation on a fresh array; print it, the untouched check, the same-order check
`,
      solution: `import numpy as np

data = np.array([10, 20, 30, 40, 50])

rng1 = np.random.default_rng(9)
before = data.copy()
ret = rng1.shuffle(data)
print("shuffle returned  :", ret)
print("data after shuffle:", data)
print("original changed? :", not np.array_equal(before, data))

rng2 = np.random.default_rng(9)
fresh = np.array([10, 20, 30, 40, 50])
p = rng2.permutation(fresh)
print("permutation       :", p)
print("fresh untouched?  :", np.array_equal(fresh, np.array([10, 20, 30, 40, 50])))
print("same final order? :", np.array_equal(p, data))
`,
      expectedOutput: `shuffle returned  : None
data after shuffle: [50 40 10 30 20]
original changed? : True
permutation       : [50 40 10 30 20]
fresh untouched?  : True
same final order? : True`,
      concepts: ["rng.shuffle", "rng.permutation", "in place vs copy"],
    },
    {
      id: "i-i4",
      tier: "intermediate",
      title: "Complete rows only",
      prompt:
        "The 5x3 grid X = [[1.5, 2.0, nan], [2.5, 3.0, 3.5], [nan, 4.0, 4.5], [5.0, nan, 5.5], [6.0, 6.5, 7.0]] has three holes. Print the missing counts per column AND per row (two lines, axis=0 then axis=1), then use the complete-row mask ~np.isnan(X).any(axis=1) to print how many complete rows survive out of 5, followed by the surviving rows themselves. Finish with a single boolean: does row index 3 have a hole anywhere? That mask is the drop step of Lesson i-05's pipeline.",
      hint: "axis=0 counts down the columns; axis=1 counts across the rows. The any-mask collapses each row to one boolean — 'does this row contain any hole?' — and indexing with its inverse keeps the clean rows.",
      starter: `import numpy as np

X = np.array([[1.5, 2.0, np.nan],
              [2.5, 3.0, 3.5],
              [np.nan, 4.0, 4.5],
              [5.0, np.nan, 5.5],
              [6.0, 6.5, 7.0]])

# TODO: missing per column, missing per row
# TODO: how many complete rows of 5, and the rows
# TODO: does row 3 have a hole?
`,
      solution: `import numpy as np

X = np.array([[1.5, 2.0, np.nan],
              [2.5, 3.0, 3.5],
              [np.nan, 4.0, 4.5],
              [5.0, np.nan, 5.5],
              [6.0, 6.5, 7.0]])

print("missing per column:", np.isnan(X).sum(axis=0))
print("missing per row   :", np.isnan(X).sum(axis=1))
complete = X[~np.isnan(X).any(axis=1)]
print("complete rows     :", complete.shape[0], "of", X.shape[0])
print(complete)
print("row 3 has a hole? :", bool(np.isnan(X[3]).any()))
`,
      expectedOutput: `missing per column: [1 1 1]
missing per row   : [1 0 1 1 0]
complete rows     : 2 of 5
[[2.5 3.  3.5]
 [6.  6.5 7. ]]
row 3 has a hole? : True`,
      concepts: ["isnan().any(axis=1)", "complete-case analysis", "axis counting"],
    },
    {
      id: "i-a1",
      tier: "advanced",
      title: "The split, audited",
      prompt:
        "Build a dataset of 10 subject ids (np.arange(101, 111).reshape(10, 1)) and split it 7/3 with the Lesson i-03 idiom: perm = rng.permutation(len(ids)) from a Generator seeded 4, then train, test = ids[perm[:7]], ids[perm[7:]]. Print the permutation, the training ids (raveled) with the train shape, and the test ids with its shape. Then audit the split with two booleans: no id appears on both sides (np.intersect1d of the raveled sides is empty), and every id is kept somewhere (np.union1d covers all 10). A split you cannot audit is a split you cannot trust.",
      hint: "Ravel for printing and auditing: train.ravel(). The two audit lines compare len(np.intersect1d(...)) to 0 and len(np.union1d(...)) to len(ids).",
      starter: `import numpy as np

ids = np.arange(101, 111).reshape(10, 1)
rng = np.random.default_rng(4)

# TODO: perm, train (first 7 slots), test (the rest)
# TODO: print perm, train ids + shape, test ids + shape
# TODO: no-overlap audit and all-rows-kept audit
`,
      solution: `import numpy as np

ids = np.arange(101, 111).reshape(10, 1)
rng = np.random.default_rng(4)

perm = rng.permutation(len(ids))
train, test = ids[perm[:7]], ids[perm[7:]]

print("perm        :", perm)
print("train ids   :", train.ravel(), " shape:", train.shape)
print("test ids    :", test.ravel(), " shape:", test.shape)
print("no overlap  :", len(np.intersect1d(train.ravel(), test.ravel())) == 0)
print("all rows kept:", len(np.union1d(train.ravel(), test.ravel())) == len(ids))
`,
      expectedOutput: `perm        : [1 0 7 2 9 8 6 4 3 5]
train ids   : [102 101 108 103 110 109 107]  shape: (7, 1)
test ids    : [105 104 106]  shape: (3, 1)
no overlap  : True
all rows kept: True`,
      concepts: ["train/test split", "rng.permutation", "intersect1d"],
    },
    {
      id: "i-a2",
      tier: "advanced",
      title: "Bootstrap the median",
      prompt:
        "Lesson i-03 bootstrapped the mean; bootstrap the MEDIAN of the fifteen delivery times in the starter. With a Generator seeded 7, draw 1000 resamples — each one idx = rng.integers(0, n, n) then np.median(sample[idx]) — collect the resample medians, and report three lines: the sample median, the 95% confidence interval as the 2.5th and 97.5th percentiles of the resample medians (both rounded to 4 decimals), and a boolean confirming the CI brackets the sample median. The interval is coarser than a mean bootstrap — medians of small resamples jump between actual data values — and that coarseness is honest information.",
      hint: "Same skeleton as the lesson's mean bootstrap with np.median in place of .mean(); np.percentile(boot_medians, [2.5, 97.5]) returns both ends at once.",
      starter: `import numpy as np

sample = np.array([12.0, 15.0, 11.5, 13.0, 9.5, 14.5, 10.0, 16.0,
                   12.5, 13.5, 11.0, 14.0, 12.8, 13.2, 12.2])
n = len(sample)
rng = np.random.default_rng(7)

# TODO: 1000 resample medians, then sample median, 95% CI, brackets-check
`,
      solution: `import numpy as np

sample = np.array([12.0, 15.0, 11.5, 13.0, 9.5, 14.5, 10.0, 16.0,
                   12.5, 13.5, 11.0, 14.0, 12.8, 13.2, 12.2])
n = len(sample)
rng = np.random.default_rng(7)

boot_medians = np.empty(1000)
for i in range(1000):
    idx = rng.integers(0, n, n)
    boot_medians[i] = np.median(sample[idx])

lo, hi = np.percentile(boot_medians, [2.5, 97.5])
print("sample median      :", np.median(sample))
print("bootstrap 95% CI   : [", round(lo, 4), ",", round(hi, 4), "]")
print("CI brackets median :", bool(lo <= np.median(sample) <= hi))
`,
      expectedOutput: `sample median      : 12.8
bootstrap 95% CI   : [ 12.0 , 13.5 ]
CI brackets median : True`,
      concepts: ["bootstrap", "np.median", "percentile confidence intervals"],
    },
    {
      id: "i-a3",
      tier: "advanced",
      title: "The dead column",
      prompt:
        "The 4x3 grid X in the starter has a dead sensor: column 2 is ENTIRELY NaN, so calling np.nanmean on the whole grid would warn and return nan in that column — the all-NaN slice from Lesson i-05. Build the pipeline that survives it: print the missing counts per column, identify the dead columns with np.isnan(X).all(axis=0) (print their indexes via np.where), drop them from the grid, then fill the remaining holes with each surviving column's own nanmean via broadcasting (keepdims=True) and np.where. Print the cleaned grid rounded to 3 decimals, the number of holes left (it must be 0), and the column means after cleaning. Because you drop the dead column BEFORE averaging, no all-NaN slice is ever touched and no warning ever fires — prevention, not suppression.",
      hint: "Drop columns with X[:, ~dead_cols]. The fill is the pipeline idiom: np.where(np.isnan(X2), np.nanmean(X2, axis=0, keepdims=True), X2). np.where(dead_cols)[0] names the dead column indexes.",
      starter: `import numpy as np

X = np.array([[21.4, 20.9, np.nan],
              [22.1, 21.8, np.nan],
              [np.nan, 20.2, np.nan],
              [21.0, np.nan, np.nan]])

# TODO: missing per column; find and print the dead column indexes
# TODO: drop dead columns, fill the rest with column nanmeans
# TODO: print cleaned grid (3 decimals), holes left, column means
`,
      solution: `import numpy as np

X = np.array([[21.4, 20.9, np.nan],
              [22.1, 21.8, np.nan],
              [np.nan, 20.2, np.nan],
              [21.0, np.nan, np.nan]])

print("missing per column:", np.isnan(X).sum(axis=0))
dead_cols = np.isnan(X).all(axis=0)
print("all-NaN columns   :", np.where(dead_cols)[0])

X2 = X[:, ~dead_cols]
col_means = np.nanmean(X2, axis=0, keepdims=True)
X2 = np.where(np.isnan(X2), col_means, X2)

print("after cleaning:")
print(np.round(X2, 3))
print("holes left:", int(np.isnan(X2).sum()))
print("column means:", np.round(X2.mean(axis=0), 3))
`,
      expectedOutput: `missing per column: [1 1 4]
all-NaN columns   : [2]
after cleaning:
[[21.4   20.9  ]
 [22.1   21.8  ]
 [21.5   20.2  ]
 [21.    20.967]]
holes left: 0
column means: [21.5   20.967]`,
      concepts: ["all-NaN slice", "column nanmean", "cleaning pipeline"],
    },
    {
      id: "i-a4",
      tier: "advanced",
      title: "Rescue the ratios",
      prompt:
        "Divide a = np.array([1.0, -1.0, 0.0, 3.0]) by b = np.array([0.0, 0.0, 0.0, 2.0]) inside a with np.errstate(divide='ignore', invalid='ignore') block — the IEEE 754 answers are inf, -inf, nan and 1.5, and the guard keeps stderr quiet. Print the raw ratios and their isfinite mask (Lesson i-04's gatekeeper). Then rescue them with np.nan_to_num using the vocabulary nan=-1.0 ('no answer'), posinf=999.0, neginf=-999.0, and print the rescued array plus one final boolean: is everything finite now? Panic button, applied with intent.",
      hint: "The isfinite mask marks the three unusable cells (False at inf, -inf and nan alike). After nan_to_num with explicit targets, np.isfinite(rescued).all() must be True.",
      starter: `import numpy as np

a = np.array([1.0, -1.0, 0.0, 3.0])
b = np.array([0.0, 0.0, 0.0, 2.0])

# TODO: the guarded division, raw ratios, isfinite mask
# TODO: nan_to_num rescue with explicit targets, rescued array, all-finite check
`,
      solution: `import numpy as np

a = np.array([1.0, -1.0, 0.0, 3.0])
b = np.array([0.0, 0.0, 0.0, 2.0])

with np.errstate(divide="ignore", invalid="ignore"):
    ratios = a / b

print("raw ratios  :", ratios)
print("finite?     :", np.isfinite(ratios))

rescued = np.nan_to_num(ratios, nan=-1.0, posinf=999.0, neginf=-999.0)
print("rescued     :", rescued)
print("all finite? :", bool(np.isfinite(rescued).all()))
`,
      expectedOutput: `raw ratios  : [ inf -inf  nan  1.5]
finite?     : [False False False  True]
rescued     : [ 999.  -999.    -1.     1.5]
all finite? : True`,
      concepts: ["np.errstate", "np.nan_to_num", "np.isfinite"],
    },
  ],

  // ------------------------------------------------------------------
  // Part I assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "i-as-1",
      prompt: "A colleague must replay every random number your simulation used. What is the modern call?",
      options: [
        { text: "rng = np.random.default_rng(42) once at the top, drawing every sample from that Generator", correct: true, feedback: "Correct — a private, seeded stream. Log the 42 with the results and anyone can reproduce every draw (Lesson i-01's first verified claim)." },
        { text: "np.random.seed(42), then np.random.rand(...) wherever needed", correct: false, feedback: "That is the legacy global machine: replayable only until any other code in the process draws from it — which, in a notebook with libraries, something eventually will." },
        { text: "rng = np.random.default_rng() with no seed, for maximum randomness", correct: false, feedback: "No seed means operating-system entropy: maximally unpredictable, and never replayable — the opposite of what a reviewer needs." },
        { text: "import random; random.seed(42)", correct: false, feedback: "That seeds the Python standard library's generator — a different library entirely, sharing nothing with NumPy's streams." },
      ],
      explanation: "default_rng(seed) builds a private Generator whose entire stream the seed fixes: same seed, same draws, forever — the reproducibility contract of Part I.",
    },
    {
      id: "i-as-2",
      prompt: "Checkout times wobble around a true 250 ms; the variance of the wobble is 100. Which call simulates 1,000 times?",
      options: [
        { text: "rng.normal(250.0, 10.0, 1000) — scale is the standard deviation, and the square root of 100 is 10", correct: true, feedback: "Correct translation: variance 100 means std 10, and normal's scale parameter IS the std (Lesson i-02's classic slip, avoided)." },
        { text: "rng.normal(250.0, 100.0, 1000)", correct: false, feedback: "That passes the variance where the std belongs — a simulated crowd ten times too spread out, with no error raised to warn you." },
        { text: "rng.normal(100.0, 250.0, 1000)", correct: false, feedback: "Arguments swapped: loc is the center. This simulates noise around 100 ms with an enormous spread." },
        { text: "rng.uniform(250.0, 100.0, 1000)", correct: false, feedback: "Wrong shape (uniform is flat, not bell) AND the bounds are backwards — and bounded wobble is not what 'wobbles around a true value' means anyway." },
      ],
      explanation: "N(center, variance) in notation becomes normal(loc=center, scale=sqrt(variance)) in code. The scale-is-std rule is the translation step.",
    },
    {
      id: "i-as-3",
      prompt: "Customers arrive independently, on average one every 4 minutes. You want to simulate 'how long until the next customer arrives?' for 1,000 customers. The call is:",
      options: [
        { text: "rng.exponential(scale=4.0, size=1000)", correct: true, feedback: "Right — waiting times between independent events are exponential, and its scale is the average wait (4 minutes)." },
        { text: "rng.poisson(lam=4.0, size=1000)", correct: false, feedback: "Poisson answers 'how many events per window?' — a count, not a wait. The verb in your sentence was 'how long until', which names exponential." },
        { text: "rng.binomial(n=4, p=0.5, size=1000)", correct: false, feedback: "Binomial needs a fixed number of tries n; arrivals have no n, and it returns capped integer counts, not times." },
        { text: "rng.integers(0, 4, 1000)", correct: false, feedback: "A fair draw from 0..3: every wait equally likely and nothing above 3 — real waits are lopsided toward short values and unbounded." },
      ],
      explanation: "Say the sentence about the data: 'how long until' names exponential, 'how many per window' would name poisson. The story decides the distribution.",
    },
    {
      id: "i-as-4",
      prompt: "deck = np.arange(52); result = rng.shuffle(deck). Afterwards, result is:",
      options: [
        { text: "None — shuffle rearranged deck in place and returned nothing", correct: true, feedback: "Exactly: the shuffled values live in deck itself; result holds None, and the first use of result crashes far from the real bug (Lesson i-03)." },
        { text: "A shuffled copy of deck, with deck untouched", correct: false, feedback: "That is rng.permutation's delivery. shuffle mutates the original and returns None — the two methods' whole difference." },
        { text: "deck itself, reshuffled", correct: false, feedback: "Tempting, but no: deck DID get reshuffled, while result still holds None — the shuffle's outcome and its return value are different things." },
        { text: "A random permutation of the indexes 0..51", correct: false, feedback: "That is rng.permutation(52). shuffle never returns an index order — it writes the shuffle into your array." },
      ],
      explanation: "shuffle = in place + returns None; permutation = original untouched + shuffled copy returned. Same seed, same orders, opposite delivery.",
    },
    {
      id: "i-as-5",
      prompt: "A bootstrap of 2,000 resample means yields a 95% confidence interval. Which percentile pair bounds it?",
      options: [
        { text: "The 2.5th and the 97.5th — cutting 2.5% off each tail leaves the middle 95%", correct: true, feedback: "Correct — 2.5 + 95 + 2.5 = 100. The lesson's interval for twelve delivery times was built from exactly this pair." },
        { text: "The 5th and the 95th — that is what 95 means", correct: false, feedback: "5 + 90 + 5 = 100: that leaves the middle 90%, a narrower interval than the 95% you promised." },
        { text: "The 25th and the 75th", correct: false, feedback: "That is the middle 50% — the interquartile range, not a 95% interval." },
        { text: "The 0th and the 100th — the extremes of the resample means", correct: false, feedback: "That is the full range of your resamples: a 100% interval, far too wide to be informative and at the mercy of the single most extreme resample." },
      ],
      explanation: "A 95% interval splits the 5% error evenly across both tails: the 2.5th and 97.5th percentiles of the bootstrap statistics.",
    },
    {
      id: "i-as-6",
      prompt: "x = np.array([1.0, np.nan, 3.0]). What does x[x > 0] return?",
      options: [
        { text: "[1. 3.] — the NaN answered False to the comparison and was silently dropped", correct: true, feedback: "Right — and no warning is printed. The element count quietly shrank; only counting missing before and after would reveal it." },
        { text: "An error: comparisons are undefined for NaN", correct: false, feedback: "Comparisons with NaN never raise. They evaluate to False silently — which is exactly what makes this trap dangerous." },
        { text: "[1. nan 3.] — NaN passes every filter because it is a value", correct: false, feedback: "NaN fails the test (False means 'not selected') and vanishes from the result. That silent vanishing IS the trap." },
        { text: "[nan] — only the NaN survives, since it is the special one", correct: false, feedback: "Backwards: the NaN is the one value guaranteed to be dropped, because its comparison is False." },
      ],
      explanation: "Rule 4 from Lesson i-04: comparisons with NaN are quietly False, so filters drop missing rows invisibly — fill or drop NaN deliberately BEFORE filtering.",
    },
    {
      id: "i-as-7",
      prompt: "np.nanmean on a column whose values are ALL NaN:",
      options: [
        { text: "Returns nan and writes RuntimeWarning: Mean of empty slice to stderr", correct: true, feedback: "Exactly the verified behavior: no survivors to average, so nan comes back — and the warning on stderr tells you which slice was empty." },
        { text: "Raises ValueError — averaging nothing is illegal", correct: false, feedback: "No exception: the call completes and returns nan. It is an honest non-answer, not a crash — your pipeline keeps running either way." },
        { text: "Returns 0.0 — no values means nothing was added, so the average is zero", correct: false, feedback: "Zero is a real value claiming a measurement happened. 'No answer' in float language is nan — inventing 0 is fabrication." },
        { text: "Returns None — no values, no result object", correct: false, feedback: "NumPy reductions return arrays or scalars, never None. The float-family word for 'no answer' is nan." },
      ],
      explanation: "The all-NaN slice is the honest edge of the nan-family: nan returned, warning raised on stderr, exception avoided. Find these slices first with np.isnan(X).all(axis=0).",
    },
    {
      id: "i-as-8",
      prompt: "Grid X has rows = samples, columns = sensors, with NaN holes. Which line fills every hole with ITS OWN column's nanmean?",
      options: [
        { text: "np.where(np.isnan(X), np.nanmean(X, axis=0, keepdims=True), X)", correct: true, feedback: "Correct — axis=0 reduces down columns (one mean per sensor), keepdims=True keeps the (1, ncols) shape so it broadcasts into every row: the pipeline's fill step from Lesson i-05." },
        { text: "np.where(np.isnan(X), np.nanmean(X, axis=1, keepdims=True), X)", correct: false, feedback: "It runs without any error — that is the trap: axis=1 gives each ROW's mean, so a hole is filled with its own row's average, flattening the column structure silently." },
        { text: "X[np.isnan(X)] = np.nanmean(X)", correct: false, feedback: "This fills every hole with ONE global number — the mean of all surviving cells — so a calm sensor's hole receives a busy sensor's average." },
        { text: "np.nan_to_num(X)", correct: false, feedback: "That replaces every NaN with 0.0 — inventing readings at exactly zero, the fabrication Lesson i-05 warns about unless zero is genuinely plausible." },
      ],
      explanation: "The disciplined fill has three parts: the isnan mask names the holes, axis=0 nanmean computes one fill per column, and keepdims=True makes it broadcast. Wrong axis, wrong scope, wrong tool — three ways to fill dishonestly.",
    },
  ],

  // ------------------------------------------------------------------
  // Part I mini project
  // ------------------------------------------------------------------
  project: {
    title: "The A/B Test, Honestly",
    brief:
      "You ran an A/B test: 120 sessions saw the old checkout, 120 saw the new one, and the new flow is (secretly) 0.8 seconds faster. Build the analysis a reviewer can trust: report the observed means and their difference, bootstrap a real 95% confidence interval for the difference from 2,000 resamples, and print the verdict — does the interval exclude zero? Then the twist real data always adds: the tracker silently dropped 12 readings per group, and your pipeline must survive it nan-safely. Every draw is seeded, so your verdict is a reproducible fact. And the verdict itself is a lesson: with these sizes the observed difference looks like a win while the interval still touches zero — the honest conclusion is that the experiment, not the code, needs more sessions. The extension sends you hunting for the n that changes the verdict.",
    requirements: [
      "Two groups drawn from ONE Generator, np.random.default_rng(7), in this order: control = rng.normal(120.0, 5.0, 120) and treatment = rng.normal(119.2, 5.0, 120) — a true lift of 0.8 seconds. The seed and the creation order stay in the header as the reproducibility record.",
      "observed_diff(a, b) returns the difference of the group means NAN-SAFELY (np.nanmean), so holes can never poison the headline number.",
      "bootstrap_ci(a, b, n_boot=2000, seed=SEED): each of the 2,000 resamples draws len(a) values from a WITH replacement and len(b) values from b (its own seeded Generator, boot.integers(0, n, n)), records mean(b*) - mean(a*) nan-safely, and the function returns the 2.5th and 97.5th percentiles of the 2,000 differences.",
      "report(a, b, label) prints, for any dataset: both observed means, the observed difference, the 95% CI bounds, and the verdict line 'CI excludes zero:' followed by True or False.",
      "corrupt(x, n_holes, seed) returns a copy of x with exactly 12 DISTINCT positions set to np.nan, chosen by its own seeded Generator (seeds 11 for control, 12 for treatment) — deterministic damage, not random damage.",
      "The final run reports BOTH experiments — clean, then corrupted (12 holes per group) — with every statistic nan-safe (no nan anywhere in the output), plus a one-sentence comment interpreting whether the verdict survived the missing data.",
      "No unseeded randomness anywhere: every Generator is created from a fixed integer seed, and all the seeds appear at the top of the file.",
    ],
    steps: [
      "Create the two groups from default_rng(7) in the stated order and print their means once — sanity-check that the control sits near 120 and the treatment near 119.2 before any statistics.",
      "Write observed_diff with np.nanmean and test it on the clean groups: the result should land near -0.8, the seeded truth it cannot see.",
      "Write bootstrap_ci on the lesson's skeleton: one seeded boot Generator, a loop of 2,000 paired resamples (boot.integers(0, n, n) on each group), differences collected in an array, percentiles at the end.",
      "Write report and run it on the clean data: means, difference, CI, verdict. Read the verdict honestly — if the interval touches zero, the finding is 'not enough evidence', not 'no effect'.",
      "Write corrupt and verify it on a small array first: corrupt(np.arange(10.0), 3, seed=0) must produce exactly 3 NaNs at positions you can re-derive — count them with np.isnan(x).sum().",
      "Corrupt both groups (12 holes each, seeds 11 and 12), run report again, and confirm every number survives nan-safely — no nan anywhere in the output.",
      "Write the one-sentence interpretation comment, then rerun the whole file top to bottom: identical output twice in a row is the proof your seeds are doing their job.",
    ],
    starter: `import numpy as np

# --- the experiment, seeded at the top: the reproducibility discipline (i-01) ---
SEED = 7            # one seed, logged: any reviewer can replay this A/B test
N = 120             # sessions per group
TRUE_LIFT = 0.8     # seconds saved per checkout -- the effect we hope to detect

rng = np.random.default_rng(SEED)
control = rng.normal(120.0, 5.0, N)              # checkout times, seconds
treatment = rng.normal(120.0 - TRUE_LIFT, 5.0, N)

def observed_diff(a, b):
    """The observed treatment effect: mean of b minus mean of a, nan-safe.

    Holes must not poison the headline number (Lesson i-05).
    """
    # TODO: return np.nanmean(b) - np.nanmean(a)
    pass

def bootstrap_ci(a, b, n_boot=2000, seed=SEED):
    """95% CI for the difference in means, from n_boot paired resamples.

    Each resample draws len(a) values FROM a (with replacement) and len(b)
    values FROM b, then records mean(b*) - mean(a*). The 2.5th and 97.5th
    percentiles of those differences are the interval (Lesson i-03).
    """
    # TODO: boot = np.random.default_rng(seed); diffs = np.empty(n_boot)
    # TODO: for each i: resample BOTH groups with boot.integers(0, n, n)
    #       and record the difference of nan-means
    # TODO: return np.percentile(diffs, [2.5, 97.5])
    pass

def report(a, b, label):
    print("===", label, "===")
    print("control mean   :", round(float(np.nanmean(a)), 3))
    print("treatment mean :", round(float(np.nanmean(b)), 3))
    # TODO: print the observed difference (nan-safe): mean of b minus mean of a
    # TODO: lo, hi = bootstrap_ci(a, b)
    # TODO: print the 95% CI, then the verdict line:
    #       print("CI excludes zero:", bool(lo > 0 or hi < 0))

# --- 1. the clean experiment ---
report(control, treatment, "clean data: 120 + 120 sessions")

# --- 2. reality: the tracker drops 12 readings per group ---
def corrupt(x, n_holes, seed):
    """Return a copy of x with n_holes DISTINCT positions set to np.nan."""
    # TODO: r = np.random.default_rng(seed)
    # TODO: positions = r.choice(len(x), size=n_holes, replace=False)
    # TODO: copy x, poke the holes, return it
    pass

# TODO: control_dirty   = corrupt(control, 12, seed=11)
# TODO: treatment_dirty = corrupt(treatment, 12, seed=12)
# TODO: report(control_dirty, treatment_dirty, "corrupted: 12 holes per group")
# TODO: in a comment, one sentence: did the verdict survive the missing data?
`,
    concepts: [
      "default_rng",
      "rng.normal",
      "bootstrap",
      "percentile confidence intervals",
      "np.nanmean",
      "missing data",
      "reproducibility",
    ],
    extension:
      "Find the smallest experiment that settles the question: rerun the whole analysis with N = 150, 200, 250, ... sessions per group (seed 7 throughout) and record where the verdict 'CI excludes zero' first flips to True. Then rerun that N under seeds 8, 9 and 10 — does the verdict hold across seeds, or was your 'significant' result one lucky stream? (Lesson i-01's stability rule, doing real work.)",
  },
};
