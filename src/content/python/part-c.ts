/**
 * PART C — DECISION MAKING
 *
 * The student arrives knowing (from Parts A and B): variables, numbers,
 * strings, booleans, type conversion, input/output, operators, expressions,
 * and comments. Part C adds the third ingredient from lesson a-01: CHOICE.
 *
 * Lesson order: if statements -> if-else -> elif chains -> nested conditions
 * -> logical operators (and/or/not, short-circuit, chained comparisons)
 * -> worked practical problems with boundary testing.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Deliberate crashes declare their exact final error line in `expectError`.
 */
import type { Part } from "@/lib/course/types";

export const PART_C: Part = {
  letter: "C",
  title: "Decision Making",
  tagline: "Teaching your program to choose",
  description: "if, if-else, elif, nested conditions, and the logical operators that power every real application's decision logic.",

  lessons: [
    // ------------------------------------------------------------- c-01
    {
      slug: "c-01",
      title: "If Statements",
      minutes: 17,
      summary:
        "The if keyword, conditions, the colon, and the one thing that makes Python Python: indentation is the structure of your program, not decoration.",
      kind: "coding",
      objectives: [
        "Write a working if statement with its condition, colon, and indented body",
        "Trace which lines run and which are skipped when a condition is False",
        "Explain why indentation is structure in Python, not a style choice",
        "Read an IndentationError and fix the code that caused it",
      ],
      why: "Every program you have written so far runs straight through, top to bottom — it never looks at its own data and chooses. Real software is mostly choosing: the bank app approves or declines the card, the thermostat fires the heater only below 20 degrees, the game shows 'game over' only when health reaches zero. The if statement is Python's choosing tool, and it arrives with the single biggest beginner wall in the language: in Python, indentation is not decoration — it defines which lines belong to the decision. Climb that wall once, properly, and every structure you meet later (loops, functions, classes) reuses the exact same rule.",
      blocks: [
        {
          kind: "text",
          text: "Think about the last time you crossed a street. Your brain ran a tiny program: **if** the light is red, stop; otherwise keep walking. You did not stop every time and then decide to unstop — the *decision controlled whether the stopping happened at all*. Programs need that same power, and in Python it comes from one keyword: `if`.",
        },
        {
          kind: "heading",
          text: "The if statement, piece by piece",
        },
        {
          kind: "table",
          title: "The four parts of an if statement",
          headers: ["Part", "Example", "What it does"],
          rows: [
            ["The `if` keyword", "if", "Announces that a decision is starting"],
            ["A condition", "temperature > 30", "A comparison that produces True or False"],
            ["A colon", ":", "Ends the header line — like the period at the end of a sentence"],
            ["An indented body", "print('It is hot outside')", "The lines that run ONLY when the condition is True"],
          ],
          caption:
            "Miss any of the four and Python refuses to run the program — with an error pointing at what is missing.",
        },
        {
          kind: "code",
          title: "Your first decision",
          code: `temperature = 31

if temperature > 30:
    print("It is hot outside")
    print("Drink plenty of water")

print("...carrying on with the rest of the program")
`,
          output: `It is hot outside
Drink plenty of water
...carrying on with the rest of the program`,
          explain: [
            "**Line 3** — `temperature > 30` is `31 > 30`, which is `True`, so the two indented lines run, top to bottom.",
            "**Line 8** — the last `print` is *not* indented, so it is outside the decision. It runs no matter what the weather is.",
            "Read the indented pair as one unit: *when it is hot, do both of these*. That unit is called the **body**.",
          ],
        },
        {
          kind: "code",
          title: "The same program, cooler weather",
          code: `temperature = 22

if temperature > 30:
    print("It is hot outside")
    print("Drink plenty of water")

print("...carrying on with the rest of the program")
`,
          output: `...carrying on with the rest of the program`,
          outputNote:
            "Nothing from the if body printed at all — the condition was False, so Python skipped the indented lines entirely.",
          explain: [
            "`22 > 30` is `False`, so the body is skipped — not run, not half-run. Skipped.",
            "The unindented print still runs: it is not part of the decision.",
            "Notice the program did not crash and did not complain. Skipping is silent — no message, no warning.",
          ],
        },
        {
          kind: "visual",
          title: "The two routes through an if",
          ascii: `            (program starts)
                   |
                   v
         +---------------------+
         | temperature > 30 ?  |         False
         +---------------------+------------------+
                   | True                        |
                   v                             |
         +------------------------+              |
         | print("It is hot       |              |
         |      outside")         |              |
         | print("Drink plenty    |              |
         |      of water")        |              |
         +------------------------+              |
                   |                             |
                   +------------+----------------+
                                |
                                v
              print("...carrying on ...")
`,
          caption:
            "One condition, two routes: the body runs on the True path and is skipped on the False path. Both routes rejoin below the decision.",
        },
        {
          kind: "code",
          title: "Conditions are just True/False expressions",
          lang: "repl",
          code: `>>> temperature = 22
>>> temperature > 30
False
>>> temperature < 30
True
>>> temperature == 22
True
`,
          outputNote:
            "You met comparison operators in Part B — the REPL reminds you why they matter here: a condition is an expression whose value is a boolean, and `if` simply asks which one it is.",
        },
        {
          kind: "heading",
          text: "Indentation is the structure — the big beginner wall",
        },
        {
          kind: "text",
          text: "In most languages, curly braces `{ }` mark where a decision's body starts and ends. Python has no braces. **The indentation IS the structure.** The lines indented under `if condition:` belong to the decision; the first unindented line ends it. This is why Python code looks so clean — and why wrong indentation is not a style problem but a program-breaking one. The convention is **4 spaces** per level, and your editor inserts them automatically when you press Enter after a colon.",
        },
        {
          kind: "code",
          title: "Error museum: the forgotten indent",
          code: `temperature = 18

if temperature > 30:
print("It is hot outside")
`,
          expectError: "IndentationError: expected an indented block after 'if' statement on line 3",
          explain: [
            "Python sees the colon on line 3 and expects the next line to be indented — it found `print` at the left margin instead.",
            "This error is **structural**: Python stops before running a single line, because it cannot even tell where the body is.",
            "The fix: indent the body. Put 4 spaces in front of the print (or select the line and press Tab in your editor).",
          ],
        },
        {
          kind: "code",
          title: "Error museum: the wobbly indent",
          code: `temperature = 35

if temperature > 30:
    print("It is hot outside")
      print("Drink plenty of water")
`,
          expectError: "IndentationError: unexpected indent",
          explain: [
            "Line 3 sets the block's level; line 4 sits *deeper* than that, and Python treats the deeper line as a brand-new block that was never announced by any colon.",
            "One body, one level: every line of a block must sit at exactly the same indentation.",
            "The fix: line `print(\"Drink plenty of water\")` up with the print above it.",
          ],
        },
        {
          kind: "code",
          title: "Error museum: the missing colon",
          code: `age = 20

if age >= 18
    print("You may enter")
`,
          expectError: "SyntaxError: expected ':'",
          explain: [
            "Every if header ends with a colon — no exceptions, ever.",
            "Python's caret points at the end of the line and the message says exactly what it wanted: `:`.",
            "The fix is the most common single-keystroke fix in Python: add the colon, re-run.",
          ],
        },
        {
          kind: "steps",
          title: "Writing an if without tripping",
          items: [
            "Write `if`, then a condition that is a real comparison (`temperature > 30`, `age >= 18`, `name == 'Ada'`).",
            "End the line with a colon. Press Enter — your editor moves the cursor in by one indent level (usually 4 spaces).",
            "Write the body: every line that belongs to the decision, all at the same indent level.",
            "To leave the body, press Backspace (or Shift+Tab) until you are back at the margin, then continue the program.",
            "Test twice: once with data that makes the condition True, once with data that makes it False.",
          ],
        },
        {
          kind: "code",
          title: "Two independent decisions in one program",
          code: `score = 91
attendance = 88

if score >= 90:
    print("Excellent work!")
    print("You mastered the material.")

if attendance < 80:
    print("Please attend more classes.")

print("Report finished.")
`,
          output: `Excellent work!
You mastered the material.
Report finished.`,
          explain: [
            "The first if runs its whole body because `91 >= 90` is `True` — bodies can hold as many lines as you like.",
            "The second if checks attendance: `88 < 80` is `False`, so its body is skipped and the apology never prints.",
            "Each `if` is its own decision. Python reads them top to bottom, one after the other — they do not interfere.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "One equals sign is not a comparison",
          text: "In a condition, `==` compares and `=` assigns. `if price = 100:` is a SyntaxError — Python refuses assignments inside decisions (it even suggests you meant `==`). And a related smell: `if True:` is legal but pointless — the condition never varies, the body always runs, and no decision is actually happening. If something should always run, delete the `if` and keep the lines.",
        },
        {
          kind: "tryIt",
          title: "Try it: predict before every run",
          task: "Right now the condition is False, so only the last line prints. Change temperature to 31, then to exactly 30, then to -5 — and predict which lines print BEFORE each run. (30 is the sneaky one: is 30 > 30 true?)",
          hint: "The body runs only when the condition is exactly True. And 30 > 30 is False — greater-than is strict, so the boundary value itself takes the False path.",
          code: `temperature = 22

if temperature > 30:
    print("It is hot outside")
    print("Drink plenty of water")

print("...carrying on with the rest of the program")
`,
        },
      ],
      terms: [
        { term: "Condition", definition: "The comparison after the if keyword; an expression that evaluates to True or False and decides whether the body runs." },
        { term: "Body", definition: "The indented lines under an if header that run only when the condition is True." },
        { term: "Block", definition: "A group of lines at the same indentation level, treated as one unit. The body of an if is a block." },
        { term: "IndentationError", definition: "The error Python raises when indentation is missing or inconsistent — a structural error, not a style complaint." },
        { term: "Branch", definition: "One possible path through a decision. A plain if creates two: run the body, or skip it." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the colon at the end of the if header.",
          why: "The colon is how Python knows the condition is finished and a body is coming. Without it, Python stops before running anything with SyntaxError: expected ':'.",
          fix: "End every if, elif, and else header with a colon. Make it muscle memory: condition, colon, Enter.",
        },
        {
          mistake: "Leaving the body unindented — or inconsistently indented.",
          why: "Without consistent indentation Python cannot see which lines belong to the decision; it raises IndentationError: expected an indented block, or unexpected indent when the levels wobble.",
          fix: "After the colon, press Enter and let the editor indent. Keep every line of the body at exactly the same level — 4 spaces is the convention.",
        },
        {
          mistake: "Writing = where == belongs in a condition.",
          why: "= assigns, == compares. Python refuses a bare assignment inside a condition with a SyntaxError that even suggests the fix: Maybe you meant '=='?",
          fix: "Read conditions out loud: 'if price equals 100' — equals is ==, two marks, always.",
        },
        {
          mistake: "Writing if True: (or any condition that never varies).",
          why: "The condition is always True, so the body always runs — the decision is an illusion and the if is dead weight that misleads readers.",
          fix: "If the body should always run, drop the if and keep the lines. If it should not, the condition needs fixing.",
        },
      ],
      takeaways: [
        "An if runs its indented body only when the condition is True; when False, the body is skipped silently and the program continues below.",
        "Four parts, all mandatory: if, condition, colon, indented body.",
        "Indentation is the structure: the body is the block under the header, and the first unindented line ends it.",
        "Test every decision twice — once with data that makes it True, once with data that makes it False.",
      ],
      quiz: [
        {
          id: "c-01-q1",
          prompt: "What must end the header line of every if statement?",
          options: [
            { text: "A colon (:)", correct: true, feedback: "Correct — the colon closes the header and announces the body, like a period ending a sentence." },
            { text: "Curly braces { } around the body", correct: false, feedback: "That is the style of C-family languages — Python uses indentation instead." },
            { text: "The word then", correct: false, feedback: "Some languages use then, but Python never does — the colon plays that role." },
            { text: "A semicolon (;)", correct: false, feedback: "Python uses semicolons rarely, and never to end an if header." },
          ],
          explanation: "if + condition + colon + indented body — four parts, no exceptions.",
        },
        {
          id: "c-01-q2",
          prompt: "Trace it: `temperature = 30`, then `if temperature > 30:` with an indented `print('hot')`, then an unindented `print('warm')`. What is the output?",
          options: [
            { text: "hot, then warm", correct: false, feedback: "30 > 30 is False — the boundary value itself fails a strictly-greater comparison." },
            { text: "warm only", correct: true, feedback: "Correct: the condition is False, the body is skipped, and the unindented line runs as always." },
            { text: "hot only", correct: false, feedback: "That would need the condition to be True — but 30 is not greater than 30." },
            { text: "An IndentationError", correct: false, feedback: "Nothing is wrong with the structure — the program is legal; the body just does not run." },
          ],
          explanation: "Greater-than is strict: the boundary itself takes the False path. Testing boundary values like 30 is exactly the habit you will build in lesson c-06.",
        },
        {
          id: "c-01-q3",
          prompt: "You delete the indentation of a perfectly valid if body. What does Python do?",
          options: [
            { text: "Runs the body anyway, then warns you", correct: false, feedback: "Python does not guess where the body is — the program stops before executing anything." },
            { text: "Raises IndentationError: expected an indented block", correct: true, feedback: "Exactly — the colon promised indented lines, so Python refuses to run the program without them." },
            { text: "Raises NameError", correct: false, feedback: "A NameError is an unknown variable name — indentation has nothing to do with names." },
            { text: "Raises TypeError", correct: false, feedback: "Type mismatches (like text plus number) raise TypeError; this is a structure problem." },
          ],
          explanation: "Indentation defines the body. Missing or inconsistent indentation is a structural error — which is why Python reports it before running a single line.",
        },
      ],
    },

    // ------------------------------------------------------------- c-02
    {
      slug: "c-02",
      title: "If-Else",
      minutes: 14,
      summary:
        "Two-way decisions with else: exactly one of two paths always runs. Plus the guard-clause shape professionals use to handle bad data first.",
      kind: "coding",
      objectives: [
        "Write a two-way decision using if and else",
        "Explain why else takes no condition of its own",
        "Choose between if-else and two separate ifs for opposite cases",
        "Use the guard shape to handle invalid data before the main logic",
      ],
      why: "A one-way if leaves an awkward question hanging: what should happen when the condition is False? If the only tool you have is if, you end up writing a second if that secretly means 'otherwise' — and two separately-written conditions can drift apart until a bug appears. The else clause closes that loop: one decision, two paths, exactly one of which runs. Login success or failure, pass or fail, even or odd — a huge share of real-world logic is exactly this shape. else also unlocks the professional habit of checking bad cases first (guard clauses), a pattern you will use in every program you ever write.",
      blocks: [
        {
          kind: "text",
          text: "A vending machine has exactly two behaviors: enough money inserted — drop the snack; otherwise — flash 'insert coin'. There is no third option and no overlap: **one decision, two paths**. Python spells the second path `else`.",
        },
        {
          kind: "heading",
          text: "Two doors, exactly one opens",
        },
        {
          kind: "code",
          title: "Pass or fail",
          code: `score = 47

if score >= 50:
    print("Pass")
else:
    print("Fail")
`,
          output: `Fail`,
          explain: [
            "`47 >= 50` is `False`, so the if body is skipped.",
            "Because the condition was False, the else body runs instead — so the program prints **Fail**.",
            "Exactly one of the two print lines ran: never both, never neither. That is the if-else contract.",
          ],
        },
        {
          kind: "visual",
          title: "The if-else fork",
          ascii: `                 score >= 50 ?
                /              \\
            True                False
             |                    |
     +---------------+   +---------------+
     | print("Pass") |   | print("Fail") |
     +---------------+   +---------------+
             |                    |
             +--------+-----------+
                      |
                      v
             (program continues)
`,
          caption:
            "The condition picks one of two roads; the other is never even considered. Both roads meet again below the decision.",
        },
        {
          kind: "text",
          text: "Notice what `else` does **not** have: a condition. That is not the language being lazy — it is logic. `else` means *everything else*: every case the condition did not catch. Since it covers the rest, there is nothing left to check, and Python refuses any attempt to give it a condition:",
        },
        {
          kind: "code",
          title: "else takes no condition",
          code: `score = 47

if score >= 50:
    print("Pass")
else score < 50:
    print("Fail")
`,
          expectError: "SyntaxError: expected ':'",
          explain: [
            "Python reads `else` and expects the colon immediately — nothing may come between the keyword and the colon.",
            "The message `expected ':'` is Python pointing at the word `score` and saying 'this should have been the colon'.",
            "If you find yourself wanting a condition after `else`, you do not actually want else — you want `elif`, the subject of the next lesson.",
          ],
        },
        {
          kind: "heading",
          text: "The classic two-way problem: even or odd",
        },
        {
          kind: "text",
          text: "A number is **even** when dividing it by 2 leaves no remainder. Part B gave you the `%` operator (remainder): `7 % 2` is `1`, and `8 % 2` is `0`. That one fact plus if-else gives you a perfect two-way decision:",
        },
        {
          kind: "code",
          title: "Remainders decide",
          code: `number = 7

if number % 2 == 0:
    print(f"{number} is even")
else:
    print(f"{number} is odd")
`,
          output: `7 is odd`,
          explain: [
            "`7 % 2` is `1`, so `7 % 2 == 0` is `False` — the else branch runs.",
            "Change `number` to `8` and the condition becomes `0 == 0`, which is `True` — the if branch runs.",
            "The f-string works on either branch; it simply inserts whatever `number` holds.",
          ],
        },
        {
          kind: "text",
          text: "Could you write even/odd without else? Sure — and beginners do, like this:",
        },
        {
          kind: "code",
          title: "The else-less version (and why it is worse)",
          code: `number = 7

# The no-else version: two separate, independent ifs
if number % 2 == 0:
    print("even")
if number % 2 == 1:
    print("odd")
`,
          output: `odd`,
          explain: [
            "This works — today. But the two conditions are written separately, so nothing ties them together as opposites.",
            "Edit one condition and forget the other (say `== 1` becomes `> 0`) and suddenly some numbers print nothing at all — or both lines.",
            "`else` makes the relationship explicit: the second branch is the first one's opposite, and Python enforces 'exactly one runs' for you.",
          ],
        },
        {
          kind: "heading",
          text: "A taste of guard clauses",
        },
        {
          kind: "text",
          text: "Professional code has a signature shape: **check the bad or impossible case first, handle it, and keep the normal logic in the else**. It is called a *guard clause* — a bouncer at the door. When the data is wrong, the guard says so and the main logic never even starts:",
        },
        {
          kind: "code",
          title: "Handle the impossible first",
          code: `age = -5

if age < 0:
    print("Invalid age — please check the record")
else:
    print("Age recorded:", age)
`,
          output: `Invalid age — please check the record`,
          explain: [
            "The guard `if age < 0:` catches impossible data before anything else runs.",
            "The else holds the happy path — the code you actually care about.",
            "The reading order is a gift: a reader sees what is forbidden first, then the main logic, without digging through it.",
            "You will meet this shape again in Part E as the early-return pattern — the same idea, inside functions.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Choosing your tool",
          text: "Need at most one action with no alternative? Plain `if`. Need exactly one of two paths? `if`/`else`. Need one of three or more paths? That is the elif chain, coming in the next lesson.",
        },
        {
          kind: "tryIt",
          title: "Try it: flip the branch",
          task: "The program prints Pass right now. Change score to exactly 50 and predict, then to 49. Then hunt for trouble: can you find any score where BOTH lines print? Where NEITHER prints?",
          hint: "50 >= 50 is True — the boundary belongs to the pass side because the condition uses >=. And no: exactly one branch always runs, whatever the value.",
          code: `score = 72

if score >= 50:
    print("Pass")
else:
    print("Fail")

print("Done checking.")
`,
        },
      ],
      terms: [
        { term: "else clause", definition: "The fallback branch of a decision; runs when the if condition is False. It takes no condition of its own." },
        { term: "Two-way decision", definition: "A fork with exactly two paths in which precisely one runs: if for the True path, else for the False path." },
        { term: "Guard clause", definition: "An if that checks for bad or invalid data first and handles it, leaving the normal logic in the else. The bouncer pattern." },
        { term: "Branch", definition: "One path through a decision. if-else gives one branch for True and one branch for False." },
      ],
      mistakes: [
        {
          mistake: "Giving else a condition, like `else score < 50:`.",
          why: "else is defined as 'everything the condition did not catch' — there is nothing left to check, so Python expects a colon right after the keyword and stops with a SyntaxError otherwise.",
          fix: "Need another condition? Use elif. Need a catch-all? else, with no condition, period.",
        },
        {
          mistake: "Indenting the else to a different level than its if.",
          why: "Python pairs an else with an if at the same indentation level; a mismatch is either an IndentationError or, worse, pairs the else with a different if than you intended.",
          fix: "if and its else must start at exactly the same column. Let the editor maintain the levels for you.",
        },
        {
          mistake: "Writing the second case as a separate if when it is really the opposite of the first.",
          why: "Two independent ifs can both run (or both skip), and editing one condition without the other opens silent holes in the logic.",
          fix: "When the second case means 'otherwise', make it the else so Python enforces exactly-one-runs.",
        },
      ],
      takeaways: [
        "if-else is a two-way fork: exactly one branch runs — never both, never neither.",
        "else has no condition because it means 'everything else'; adding one is a SyntaxError.",
        "Use else when the second case is the opposite of the first; use separate ifs only for genuinely independent checks.",
        "Guard clauses handle the bad case first: if invalid, deal with it; else, run the real logic. A shape you will use forever.",
      ],
      quiz: [
        {
          id: "c-02-q1",
          prompt: "What is wrong with `else score < 50:`?",
          options: [
            { text: "Nothing — else may take a condition", correct: false, feedback: "It may not: else is the catch-all, and Python stops with a SyntaxError the moment you try." },
            { text: "else can never have its own condition — it is the everything-else case", correct: true, feedback: "Correct — a condition after else is a SyntaxError; another condition is what elif is for." },
            { text: "The condition needs parentheses around it", correct: false, feedback: "Parentheses do not fix it — the problem is the condition existing at all." },
            { text: "else must be written on the same line as the if", correct: false, feedback: "else always starts its own line — the issue is what follows the keyword." },
          ],
          explanation: "else is everything the if did not catch; there is nothing left to test, so Python demands the colon immediately.",
        },
        {
          id: "c-02-q2",
          prompt: "How many of the two bodies in an if-else run on any single execution?",
          options: [
            { text: "Exactly one — the if body when the condition is True, the else body when it is False", correct: true, feedback: "That is the contract: one fork, one taken road, always." },
            { text: "Both, whenever the condition is True", correct: false, feedback: "The else body runs only when the condition is False — never alongside the if body." },
            { text: "Sometimes neither", correct: false, feedback: "With if-else no data can dodge both branches: False data lands in else by definition." },
            { text: "Both, whenever the condition is False", correct: false, feedback: "The if body needs True; when the condition is False only the else body runs." },
          ],
          explanation: "One decision, two paths, exactly one runs. If some data dodges both, your logic has a hole the else should close.",
        },
        {
          id: "c-02-q3",
          prompt: "Trace it: `number = 4`, then `if number % 2 == 0:` with `print('4 is even')` in the if body and `print('4 is odd')` in the else body. Output?",
          options: [
            { text: "4 is even", correct: true, feedback: "Correct: 4 % 2 is 0, the condition is True, the if body runs." },
            { text: "4 is odd", correct: false, feedback: "That needs the condition to be False — but 4 % 2 is exactly 0." },
            { text: "Both lines", correct: false, feedback: "Never both: one fork, one road." },
            { text: "Nothing — else runs too late", correct: false, feedback: "else runs immediately after a False condition, not late or never." },
          ],
          explanation: "% gives the remainder; 4 % 2 is 0, so even wins. Remainder checks plus if-else are the classic two-way test.",
        },
      ],
    },

    // ------------------------------------------------------------- c-03
    {
      slug: "c-03",
      title: "Elif",
      minutes: 16,
      summary:
        "Multi-way decisions with elif: first-match-wins, why condition order is part of the logic, why chains rarely need and, and the safety-net else.",
      kind: "coding",
      objectives: [
        "Build a multi-way decision with if, elif, and else",
        "Trace which branch of a chain runs, given the order of its conditions",
        "Explain first-match-wins and why condition order is logic",
        "Use a final else as a safety net for unhandled cases",
      ],
      why: "Two-way decisions are everywhere, but so are five-way ones: grade scales, shipping tiers, age ratings, tax brackets, support priorities. Python's elif chain maps directly onto any list of mutually exclusive cases — and the two ideas that make it work, first-match-wins and 'order is logic', are where the subtle bugs live. A misordered chain happily gives every top student a D without a single error message. Once you can read and design chains, you can read half of the business logic ever written — pricing tables, rating systems, and approval rules are all chains wearing different clothes.",
      blocks: [
        {
          kind: "text",
          text: "Grades are not pass/fail: A, B, C, D, F — five exclusive cases for one score. Python handles 'one of many' with the **elif chain**: an `if`, then any number of `elif` lines (short for *else if*), then optionally a final `else`. Python checks the conditions from top to bottom and stops at the **first** one that is True.",
        },
        {
          kind: "heading",
          text: "The grading chain",
        },
        {
          kind: "code",
          title: "A five-way grade, one chain",
          code: `score = 83

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score} earns grade {grade}")
`,
          output: `Score 83 earns grade B`,
          explain: [
            "`score >= 90` is `83 >= 90` → False. Python moves to the next line without running anything.",
            "`score >= 80` is True → that branch runs, and the rest of the chain is skipped entirely.",
            "The final `else` is the safety net: any score below 60 lands there. No score can slip through unhandled.",
            "Exactly one assignment happened, and the print below the chain reports it.",
          ],
        },
        {
          kind: "table",
          title: "Python checking score = 83",
          headers: ["Check", "Question asked", "Answer", "What Python does"],
          rows: [
            ["1", "score >= 90", "False", "Skip the body, check the next condition"],
            ["2", "score >= 80", "True", "Run this body, then skip the ENTIRE rest of the chain"],
            ["3 and 4", "never asked", "—", "Not evaluated — the chain already ended at check 2"],
          ],
          caption:
            "First match wins: once a branch runs, Python jumps past the whole chain to the first line below it.",
        },
        {
          kind: "text",
          text: "That behavior has a name: **first-match-wins**. At most one branch of the chain runs, and the conditions *below* the winner are never even evaluated. This has two consequences you will use constantly: the order of the conditions is part of the logic, and every branch silently means *'everything above me was False'*.",
        },
        {
          kind: "visual",
          title: "The chain, walked down",
          ascii: `   Python walks down the chain, asking each condition in order:

   [1] score >= 90 ?  ..... False -> go to next
   [2] score >= 80 ?  ..... True  -> run grade = "B", STOP checking
   [3] score >= 70 ?  ..... never asked
   [4] score >= 60 ?  ..... never asked
   [5] else           ..... never asked

   After the winner runs, Python jumps below the WHOLE chain.
`,
          caption:
            "A chain is a queue of checkpoints: the first True check wins, and everything below it is skipped without being evaluated.",
        },
        {
          kind: "heading",
          text: "Order matters — the broken chain",
        },
        {
          kind: "code",
          title: "Every top student just got a D",
          code: `score = 95

if score >= 60:
    print("D")
elif score >= 70:
    print("C")
elif score >= 90:
    print("A")
`,
          output: `D`,
          explain: [
            "`95 >= 60` is True on the very first check, so `D` wins and the chain ends — the A branch below is unreachable for every score of 60 or more.",
            "The program runs without any error. Wrong order is a **logic error**: silent, invisible, and only caught by testing real values.",
            "The fix: order the checks from the strictest (highest bar) down to the loosest.",
          ],
        },
        {
          kind: "text",
          text: "Here is the design rule that prevents that bug: **put the most specific or strictest conditions first**. Think of each condition as a funnel. After `score >= 90` fails for an 83, Python *knows* something — the score is below 90 — and that knowledge is what makes the simpler conditions below it safe. In a chain, order is not cosmetic; order is logic.",
        },
        {
          kind: "heading",
          text: "You rarely need and inside a chain",
        },
        {
          kind: "code",
          title: "The over-careful version",
          code: `score = 83

if score >= 90 and score <= 100:
    grade = "A"
elif score >= 80 and score < 90:
    grade = "B"
else:
    grade = "not an A or a B"

print(grade)
`,
          output: `B`,
          explain: [
            "This works — but the `and score <= 100` and `and score < 90` parts are dead weight.",
            "Think about when Python reaches `elif score >= 80`: the first check already proved the score is *not* 90 or above.",
            "Repeating known facts is worse than ugly — edit one copy and forget the other, and the chain quietly contradicts itself.",
          ],
        },
        {
          kind: "text",
          text: "First-match-wins narrows the possibilities for you. `elif score >= 80` silently means *'below 90 AND at least 80'* — you get the upper bound for free. When you see a chain where every line drags an `and` along, the author has not noticed this yet.",
        },
        {
          kind: "heading",
          text: "When nothing matches",
        },
        {
          kind: "code",
          title: "No match, no else, no crash",
          code: `score = 25

if score >= 90:
    print("A")
elif score >= 80:
    print("B")

print("Done")
`,
          output: `Done`,
          explain: [
            "25 fails both conditions, so nothing in the chain runs — no error, no warning, just silence.",
            "If silence is wrong (and for grades it is), that is exactly what the final `else` is for: it guarantees every value gets handled.",
            "The only output is `Done` — proof that the chain was checked and completely skipped.",
          ],
        },
        {
          kind: "code",
          title: "A second chain: cinema age ratings",
          code: `age = 16

if age >= 18:
    print("You may watch any film")
elif age >= 15:
    print("You may watch 15-rated films")
elif age >= 12:
    print("You may watch 12A films")
else:
    print("Children's films only")
`,
          output: `You may watch 15-rated films`,
          explain: [
            "16 fails `>= 18`, then passes `>= 15` — first match wins again.",
            "Descending order matters here too: flip the first two lines and every 15-to-17-year-old gets the 12A message.",
            "The final else is not decoration — it catches every age under 12.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it: break the chain on purpose",
          task: "The chain is correct. Predict the grade for 79, 70, 62, and 55 BEFORE running each. Then swap the first two conditions (score >= 80 first, score >= 90 second) and explain to yourself why 95 now earns a B.",
          hint: "After the swap, 95 fails the >= 80 check? No — it passes it. First-match-wins means the 80-bar grabs every score from 80 up, including the 90s.",
          code: `score = 83

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score} earns grade {grade}")
`,
        },
      ],
      terms: [
        { term: "elif", definition: "Short for 'else if' — starts the next case of a chain. Its condition is checked only when every condition above it was False." },
        { term: "Chain", definition: "A sequence of if, elif lines, and an optional else, treated as ONE decision with mutually exclusive branches." },
        { term: "First-match-wins", definition: "The rule that Python checks chain conditions top to bottom, runs the first True branch, and skips the rest without evaluating it." },
        { term: "Safety-net else", definition: "A final else that guarantees every remaining case is handled, so no value can slip through silently." },
        { term: "Logic error", definition: "A program that runs without crashing but produces a wrong result — like a misordered chain printing D for a 95." },
      ],
      mistakes: [
        {
          mistake: "Putting the loosest condition first (e.g. score >= 60 before score >= 90 in a grading chain).",
          why: "First-match-wins means the loose condition captures everything above it, making the stricter branches unreachable. The program still runs — silently wrong.",
          fix: "Order strictest/most specific first, loosest last, and let a final else catch the remainder.",
        },
        {
          mistake: "Repeating bounds with and inside every elif (elif score >= 70 and score < 80:).",
          why: "Reaching that elif already proves the earlier checks were False, so the extra bound is already known — repeating it adds noise and lets the copies drift apart.",
          fix: "Trust the chain: each condition only needs to state its own threshold.",
        },
        {
          mistake: "Writing several separate ifs for cases that are mutually exclusive.",
          why: "Separate ifs are checked independently — every True condition runs, so two 'exclusive' branches can fire for one value, and readers cannot see the exclusivity you meant.",
          fix: "If the cases are one-of-many, make them a single if/elif chain so at most one runs.",
        },
        {
          mistake: "Forgetting the final else when unexpected values should be caught.",
          why: "With no else, unmatched values fall through in silence — often only noticed later, with real data.",
          fix: "Add a safety-net else while developing (even if it only reports the unhandled value).",
        },
      ],
      takeaways: [
        "A chain is one decision: if, elifs in order, optional else — at most one branch runs.",
        "First match wins: the first True condition runs its body; the rest of the chain is skipped without being evaluated.",
        "Order is logic: put the strictest conditions first, or a loose condition swallows everything below it.",
        "Each elif inherits the knowledge that every condition above it was False — you rarely need and inside a chain.",
        "The final else is the safety net that guarantees no value slips through unhandled.",
      ],
      quiz: [
        {
          id: "c-03-q1",
          prompt: "In an if/elif chain, when does Python stop checking conditions?",
          options: [
            { text: "At the first True condition — it runs that branch and skips the entire rest of the chain", correct: true, feedback: "Exactly — that is first-match-wins: the lower conditions are not even evaluated." },
            { text: "After checking every condition, even once one has matched", correct: false, feedback: "Python is smartly lazy: once a branch runs, the rest of the chain is never looked at." },
            { text: "At the first False condition — it stops and runs nothing", correct: false, feedback: "A False condition just means 'keep walking down the chain' — no match yet." },
            { text: "Only at the else — the else always runs last", correct: false, feedback: "The else runs only when NO condition matched, and then the chain is over anyway." },
          ],
          explanation: "First-match-wins: the first True condition ends the search. Everything below it is skipped — never even evaluated.",
        },
        {
          id: "c-03-q2",
          prompt: "Why is `if score >= 60:` as the FIRST check a bug in a grading chain with A/B/C branches below it?",
          options: [
            { text: "Every score of 60 or more matches it first, so the A, B and C branches can never run — all those students get the lowest grade", correct: true, feedback: "Exactly — a 95 gets a D, silently, because the loose bar grabbed it first." },
            { text: "Because 60 is not a round number", correct: false, feedback: "Round or not, the problem is the position of the check, not the value." },
            { text: "Because >= should be <= for grading", correct: false, feedback: "The direction of the comparison is fine — its ORDER in the chain is the bug." },
            { text: "Nothing — chain order does not change behavior", correct: false, feedback: "Order is logic in a chain. Change the order and you change which values each branch catches." },
          ],
          explanation: "First-match-wins makes loose-first ordering a silent trap: strictest conditions must come first.",
        },
        {
          id: "c-03-q3",
          prompt: "What happens when no condition matches an if/elif chain that has NO final else?",
          options: [
            { text: "Nothing in the chain runs, and the program carries on normally below it", correct: true, feedback: "Correct — unmatched means silently skipped: legal, quiet, and sometimes exactly the bug." },
            { text: "The program crashes with an error", correct: false, feedback: "No match is not an error. The chain simply does nothing, and execution continues." },
            { text: "The last elif runs anyway", correct: false, feedback: "An elif body runs only when its condition is True — not by default." },
            { text: "Python runs the first if again with flipped values", correct: false, feedback: "Python never retries conditions. One pass, top to bottom, done." },
          ],
          explanation: "Without a safety-net else, unmatched values fall through in silence — that is why the final else exists.",
        },
      ],
    },

    // ------------------------------------------------------------- c-04
    {
      slug: "c-04",
      title: "Nested Conditions",
      minutes: 14,
      summary:
        "Conditions inside conditions: when nesting is the right tool, why deep nesting is a readability smell, and how to flatten it with and and elif — side by side.",
      kind: "concept",
      objectives: [
        "Write a condition inside another condition's branch",
        "Trace execution through two levels of nesting",
        "Recognize deep nesting as a readability smell",
        "Flatten nested ifs with and and elif while keeping the same outcomes",
      ],
      why: "Real requirements stack: 'let them in if they are an adult — and if so, check membership — and if they are a member, check the hour.' Beginners reach for nesting for everything, and the code drifts to the right edge of the screen until nobody — including you, next week — can trace it. Arrow-shaped code is one of the most recognized readability smells in the industry. This lesson teaches when nesting is genuinely right (when inner decisions need their own alternatives) and how to flatten the rest with and and elif, so your logic stays as wide as the screen and as clear as the problem.",
      blocks: [
        {
          kind: "text",
          text: "Airport security works in stages: first the ID check, and only if that passes, the boarding-pass check. A traveler who fails the first stage never reaches the second. That is **nesting**: a decision placed inside the branch of another decision. Python allows it naturally — you simply indent again.",
        },
        {
          kind: "code",
          title: "Two questions, asked in order",
          code: `age = 22
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Enjoy the movie")
    else:
        print("Adult, but you need a ticket")
else:
    print("This film is rated 18+")
`,
          output: `Enjoy the movie`,
          explain: [
            "The OUTER if runs first: `22 >= 18` is True, so Python enters its branch.",
            "Only now is the INNER if even considered: `has_ticket` is True, so 'Enjoy the movie' prints.",
            "An adult with no ticket would reach the inner else. A child never reaches any of the inner lines at all.",
            "Each level adds one indent — the inner body sits at 8 spaces, twice as deep as normal code.",
          ],
        },
        {
          kind: "visual",
          title: "The decision tree",
          ascii: `                    age >= 18 ?
                   /           \\
                True            False
                 |               |
          has_ticket ?     print("This film
          /          \\      is rated 18+")
       True          False
        |              |
  print("Enjoy   print("Adult, but
      the movie")  you need a ticket")
`,
          caption:
            "A nested decision is a tree. An outer False skips the entire subtree below it — the inner questions are never asked.",
        },
        {
          kind: "text",
          text: "Trace nesting as two questions in order: *does the outer condition pass?* If not, the whole inner structure — its if AND its else — is skipped as one unit. If yes, Python runs the inner decision normally. The classic reading mistake is assuming the inner lines run 'sometimes anyway'. They do not: an outer False hides the entire subtree.",
        },
        {
          kind: "heading",
          text: "The smell: code drifting to the right",
        },
        {
          kind: "text",
          text: "Nesting is legal, so beginners nest everything. Add a third requirement and a fourth, and the code starts to look like an arrowhead pointing east:",
        },
        {
          kind: "code",
          title: "Three levels deep",
          code: `age = 34
member = True
hour = 20

if age >= 18:
    if member:
        if hour >= 22:
            print("Late member show")
        else:
            print("Regular member screening")
`,
          output: `Regular member screening`,
          explain: [
            "Three conditions, three indent levels, one working path — and this is the *short* version. There is no branch at all for adults who are not members, or for under-18s.",
            "Add two more requirements and the real logic ends up living in the far right of your editor.",
            "Does it work? Yes. Will it be fun to read next week? No.",
          ],
        },
        {
          kind: "text",
          text: "The industry name is **arrow code**, and it is the most famous readability smell there is. The problem is not the space — it is that a human reading a line at the bottom must hold three open questions in mind: *am I past the age check? the member check? the hour check?* Hold enough open questions and anyone starts missing cases. There is a better way, and you already own the tools.",
        },
        {
          kind: "heading",
          text: "Flattening, side by side",
        },
        {
          kind: "text",
          text: "Flattening has two tools. **and** merges conditions that must all hold. **elif** keeps separate outcomes but removes the levels. Watch the same movie logic, flattened:",
        },
        {
          kind: "code",
          title: "The movie check, flattened",
          code: `age = 22
has_ticket = True

if age >= 18 and has_ticket:
    print("Enjoy the movie")
elif age >= 18:
    print("Adult, but you need a ticket")
else:
    print("This film is rated 18+")
`,
          output: `Enjoy the movie`,
          explain: [
            "`age >= 18 and has_ticket` — one line instead of two levels.",
            "The `elif age >= 18` branch means *adult, but the ticket check failed* — the same message as the nested inner else.",
            "Three outcomes, zero nesting, and each line reads like the rule it encodes.",
          ],
        },
        {
          kind: "code",
          title: "The club check, flattened with elif",
          code: `age = 34
member = True
hour = 20

if age >= 18 and member and hour >= 22:
    print("Late member show")
elif age >= 18 and member:
    print("Regular member screening")
elif age >= 18:
    print("Come back with a membership")
else:
    print("This club is 18+ only")
`,
          output: `Regular member screening`,
          explain: [
            "This keeps all FOUR outcomes of the nested version — late show, regular screening, adult non-member, under-18 — with not a single inner if.",
            "The top line asks everything at once with `and`; each line below drops one requirement.",
            "When outcomes multiply, an elif chain flattens better than one giant and-condition.",
          ],
        },
        {
          kind: "table",
          title: "Nested vs flattened",
          headers: ["", "Nested", "Flattened"],
          rows: [
            ["Shape", "Grows to the right (arrow code)", "Grows downward, with the screen"],
            ["Reading effort", "Every inner line carries the outer open questions with it", "Each line states its own full condition"],
            ["Best for", "Inner decisions that need their own else branches", "Requirements that stack with and, or tiers built with elif"],
            ["Main risk", "Deep levels hide logic and invite missed cases", "A dense one-line and-chain — split it when a line stops reading clearly"],
          ],
          caption:
            "Nesting is a tool, not a sin. Reach for it when the inner decision genuinely has its own alternatives; flatten when the levels are just a pile of ands.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The flat rule of thumb",
          text: "If plain decision logic indents more than two or three levels, stop and ask: can this become one condition with `and`, or an `elif` chain? Your future self — and every teammate — reads the flattened version in one pass.",
        },
        {
          kind: "tryIt",
          title: "Try it: predict the path",
          task: "has_ticket is False: predict which of the four messages prints before running. Then set age to 15 with has_ticket True, and predict again. Finally, explain to yourself why a child never triggers any ticket question at all.",
          hint: "The inner if/else lives entirely inside the True branch of age >= 18. For a child, Python never even evaluates has_ticket.",
          code: `age = 22
has_ticket = False

if age >= 18:
    if has_ticket:
        print("Enjoy the movie")
    else:
        print("Adult, but you need a ticket")
else:
    print("This film is rated 18+")
`,
        },
      ],
      terms: [
        { term: "Nested condition", definition: "A decision placed inside the branch of another decision. Python marks each nesting level with one more indent." },
        { term: "Decision tree", definition: "A diagram of a nested decision: every branch point splits into the cases below it." },
        { term: "Code smell", definition: "A surface pattern that usually signals a deeper problem — five indent levels, say. Not a guaranteed bug, but a warning." },
        { term: "Arrow code", definition: "Deeply nested code that drifts to the right edge of the screen — named after its shape." },
        { term: "Flattening", definition: "Rewriting nested decisions into one-level logic using and and elif, keeping the same outcomes." },
      ],
      mistakes: [
        {
          mistake: "Pairing an else with the wrong if.",
          why: "An else binds to the nearest if at the same indentation. One wrong indent level in nested code pairs it with the inner if instead of the outer — silently different logic.",
          fix: "Align every else directly under the if it answers, and re-read: 'which question is this the otherwise of?'",
        },
        {
          mistake: "Nesting when a simple and was enough.",
          why: "Every nested level forces the reader to track another open question, and the indentation grows faster than the meaning.",
          fix: "If the inner branch adds no sub-outcomes of its own, merge the conditions: if age >= 18 and has_ticket:",
        },
        {
          mistake: "Indenting by arbitrary amounts when nesting (3 spaces here, 5 there).",
          why: "Python requires consistency within a block; mixed levels trigger IndentationError: unexpected indent.",
          fix: "One level = one fixed step (4 spaces is the convention). Let the editor maintain it after the colon.",
        },
      ],
      takeaways: [
        "Nesting means a decision inside a branch: inner code runs only if the outer condition already passed.",
        "Arrow code — deep nesting — is the classic readability smell: every level adds an open question for the reader.",
        "Flatten with and when requirements simply stack; flatten with elif when there are several distinct outcomes.",
        "Nesting earns its keep when the inner decision needs its own else — keep it for those cases.",
      ],
      quiz: [
        {
          id: "c-04-q1",
          prompt: "When is nesting the RIGHT choice rather than flattening?",
          options: [
            { text: "When the inner decision needs its own else or several sub-outcomes that no single and-condition can express", correct: true, feedback: "Exactly — different sub-cases per branch is the honest reason to nest." },
            { text: "When you want the program to look more professional", correct: false, feedback: "Deep nesting looks less professional to experienced readers, not more — they call it arrow code." },
            { text: "When the outer condition is always True", correct: false, feedback: "If a condition never varies, delete it — nesting around it just adds noise." },
            { text: "Never — nesting is always a mistake", correct: false, feedback: "Nesting is a legitimate tool; the smell is DEEP nesting when and or elif would do." },
          ],
          explanation: "Nest when the inner decision truly has its own alternatives; otherwise flatten with and or elif.",
        },
        {
          id: "c-04-q2",
          prompt: "Trace it: `age = 15` and `has_ticket = True` run through the nested movie program (outer if age >= 18, inner if has_ticket). What prints?",
          options: [
            { text: "This film is rated 18+", correct: true, feedback: "Correct — the outer condition is False, so the entire inner if/else is skipped as one unit." },
            { text: "Enjoy the movie", correct: false, feedback: "The inner lines live inside the adult branch — a child never reaches them." },
            { text: "Adult, but you need a ticket", correct: false, feedback: "That message needs the outer check passed AND has_ticket False. Here the outer check failed." },
            { text: "Nothing at all", correct: false, feedback: "The outer else still runs: the 18+ message prints." },
          ],
          explanation: "An outer False skips the whole subtree — but the outer else still fires. Trees have two sides at every fork.",
        },
        {
          id: "c-04-q3",
          prompt: "What do developers mean by 'arrow code'?",
          options: [
            { text: "Decisions nested so deeply that the body drifts toward the right edge of the screen — hard to read and easy to break", correct: true, feedback: "Right — the name comes from the arrowhead shape the indentation makes." },
            { text: "Code that draws flow diagrams in its comments", correct: false, feedback: "Diagrams in comments are fine and often great — arrow code is about the indentation itself." },
            { text: "Code that runs unusually fast", correct: false, feedback: "Nesting does not make code fast — the shape is about readability, not performance." },
            { text: "Any program longer than 100 lines", correct: false, feedback: "Length is not the issue — a 100-line program with flat logic reads fine." },
          ],
          explanation: "Arrow code is the deep-nesting smell: the fix is flattening with and and elif.",
        },
      ],
    },

    // ------------------------------------------------------------- c-05
    {
      slug: "c-05",
      title: "Logical Operators",
      minutes: 16,
      summary:
        "and, or, and not: the connectors that combine conditions, their truth tables, the famous or-trap, short-circuit evaluation with a crash-or-not proof, and chained comparisons.",
      kind: "coding",
      objectives: [
        "Combine conditions with and, or, and not",
        "Read and build truth tables for the three connectors",
        "Explain short-circuit evaluation and order conditions so guards protect risky operations",
        "Use chained comparisons and parentheses for clear range checks",
      ],
      why: "Real conditions are rarely single comparisons. 'Weekend OR holiday', 'over 18 AND has a ticket', 'NOT banned' — the three logical operators are the glue that turns small questions into real rules. They also hide two traps that bite professionals and beginners alike: the innocent-looking or-string pattern that makes a condition always True, and evaluation order deciding whether a program crashes or survives. Understanding short-circuiting is not a trivia fact — it is the pattern that lets you check something is safe and then do it, in one condition.",
      blocks: [
        {
          kind: "text",
          text: "A bouncer at a club checks several things at once. 'Come in if you are on the list **and** over 18' — every part must be true. 'Come in if it is your birthday **or** you are a VIP' — one true part is enough. 'Come in if you are **not** visibly unwell' — flip the answer. Python has exactly these three connectors: `and`, `or`, and `not`. They glue boolean expressions into bigger ones, and they are the last missing piece of Python's decision grammar.",
        },
        {
          kind: "code",
          title: "and: every part must hold",
          code: `age = 22
has_ticket = True

if age >= 18 and has_ticket:
    print("Welcome in")
else:
    print("Not tonight")
`,
          output: `Welcome in`,
          explain: [
            "`age >= 18` is True and `has_ticket` is True — both sides hold, so the whole `and` condition is True.",
            "Change `has_ticket` to False and the whole condition collapses to False: you get 'Not tonight'.",
            "Note that `has_ticket` stands alone in the condition — a boolean IS already True or False. Writing `has_ticket == True` works but adds nothing.",
          ],
        },
        {
          kind: "code",
          title: "or: at least one part holds",
          code: `day = "saturday"

if day == "saturday" or day == "sunday":
    print("Weekend!")
else:
    print("Weekday")
`,
          output: `Weekend!`,
          explain: [
            "`day == 'saturday'` is already True, so the whole `or` is True — one true side is all it takes.",
            "On a Wednesday both sides are False, so the whole `or` is False and 'Weekday' prints.",
            "Notice the repetition of `day ==` on both sides of the or — that repetition is about to matter.",
          ],
        },
        {
          kind: "table",
          title: "The truth tables for and and or",
          headers: ["A", "B", "A and B", "A or B"],
          rows: [
            ["True", "True", "True", "True"],
            ["True", "False", "False", "True"],
            ["False", "True", "False", "True"],
            ["False", "False", "False", "False"],
          ],
          caption:
            "and demands every part; or is satisfied with one. Memorize the corners: and is True only in the first row, or is False only in the last.",
        },
        {
          kind: "code",
          title: "not: flip the answer",
          code: `is_raining = False

if not is_raining:
    print("Leave the umbrella home")
else:
    print("Take the umbrella")
`,
          output: `Leave the umbrella home`,
          explain: [
            "`is_raining` is False; `not` flips it to True, so the body runs.",
            "`not` shines for readability: `if not is_raining` reads like the rule itself.",
            "But do not overuse it: `if not temperature > 30` reads worse than its cleaner twin `if temperature <= 30`. And `not not x` is just `x` with extra steps.",
          ],
        },
        {
          kind: "text",
          text: "Now the trap that has bitten every Python programmer at least once. Trying to avoid the repetition, you might write the weekend check like this — and it looks so reasonable that it slips past even careful readers:",
        },
        {
          kind: "code",
          title: "Looks right. Always True.",
          code: `day = "tuesday"

if day == "saturday" or "sunday":
    print("Weekend!")
else:
    print("Weekday")
`,
          output: `Weekend!`,
          explain: [
            "Tuesday is not the weekend — but the body ran anyway.",
            "Python parses this as `(day == 'saturday') or ('sunday')` — two separate things joined by or.",
            "`'sunday'` on its own is a non-empty string, and Python treats non-empty strings as **truthy** — True when a condition needs a boolean. The or is therefore True on every day of the week.",
            "No crash, no message — a logic error of the worst kind: the branch always fires, quietly.",
          ],
        },
        {
          kind: "text",
          text: "The name for this behavior is **truthiness**: in a condition, Python accepts any value and effectively asks 'is this something, or nothing?' Non-empty text and non-zero numbers behave as True; empty text, 0, and False behave as False. You will explore truthiness properly in a later part. Today's fix is mechanical: **repeat the comparison** — `day == 'saturday' or day == 'sunday'` — never park a bare string next to an `or`.",
        },
        {
          kind: "heading",
          text: "Short-circuit evaluation",
        },
        {
          kind: "text",
          text: "`and` stops at the first False it finds — the result is already decided False, so why evaluate anything else? `or` stops at the first True, for the same reason. The rest of the condition is simply never evaluated. You can *prove* it with a division that would crash if it ran:",
        },
        {
          kind: "code",
          title: "The safe order",
          code: `denominator = 0

if denominator != 0 and 10 / denominator > 1:
    print("The result is greater than 1")
else:
    print("Skipped safely — no crash")
`,
          output: `Skipped safely — no crash`,
          explain: [
            "`denominator != 0` is False, so `and` short-circuits: `10 / denominator` is NEVER evaluated.",
            "If Python had evaluated the second part, `10 / 0` would have crashed the program with a ZeroDivisionError.",
            "That is the pattern: **check the guard first, do the risky thing second.**",
          ],
        },
        {
          kind: "code",
          title: "The wrong order",
          code: `denominator = 0

if 10 / denominator > 1 and denominator != 0:
    print("The result is greater than 1")
`,
          expectError: "ZeroDivisionError: division by zero",
          explain: [
            "Same two conditions, reversed order. Now `10 / denominator` is evaluated FIRST, and with denominator 0 the program dies before the guard is ever checked.",
            "Identical operators, opposite outcomes — proof that `and` really does skip its second operand when the first is False.",
            "Condition order matters even more than it looks: the safe check must come first.",
          ],
        },
        {
          kind: "text",
          text: "This pattern is everywhere in real code: *check that something is safe, and only then do it.* Python evaluates `and`/`or` left to right, so put the guard on the left and the risky operation on the right. One more connector idea before this part's practice lesson — chained comparisons, which you met briefly in Part B, doing real work inside a condition:",
        },
        {
          kind: "code",
          title: "Chained comparisons read like math",
          code: `age = 37

if 18 <= age < 65:
    print("Standard adult fare")
else:
    print("Discount fare")
`,
          output: `Standard adult fare`,
          explain: [
            "`18 <= age < 65` chains two comparisons: it means `age >= 18 and age < 65`, written as one readable range — and `age` is evaluated only once.",
            "37 passes both bounds, so the standard fare prints.",
            "Chained comparisons shine for range checks: ticket bands, working hours, healthy readings.",
          ],
        },
        {
          kind: "code",
          title: "Parentheses make the meaning explicit",
          code: `is_weekend = True
is_sunny = False
temperature = 15

print((is_weekend or is_sunny) and temperature > 20)
print(is_weekend or is_sunny and temperature > 20)
`,
          output: `False
True`,
          explain: [
            "**Line 1** groups the or first: `(True or False)` is True, then `True and False` is False.",
            "**Line 2** has no parentheses, so `and` binds tighter: `True or (False and False)` is True. Same words, different meaning!",
            "When a condition mixes `and` with `or`, precedence rules (not, then and, then or) decide the grouping — parentheses let YOU decide, and they document your intent.",
            "Golden rule: whenever you mix and with or in one condition, add parentheses, even when they are technically unnecessary.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it: the four-line truth lab",
          task: "Predict all four outputs BEFORE running — say them out loud or write them down. Then change b to True and predict again: which single line flips? Finally add a fifth line, print(a and not b), and predict that too.",
          hint: "`not b or a` evaluates as `(not b) or a` — not binds tighter than or. With b False, not b is True, so the whole or is True no matter what a is.",
          code: `a = True
b = False

print(a and b)
print(a or b)
print(not a)
print(not b or a)
`,
        },
      ],
      terms: [
        { term: "Logical operator", definition: "The three connectors — and, or, not — that combine boolean expressions into bigger ones." },
        { term: "Truth table", definition: "The complete grid of a connector's behavior: every True/False input combination and its result." },
        { term: "Short-circuit evaluation", definition: "Python's laziness: and stops at the first False, or stops at the first True — the rest of the condition is never evaluated." },
        { term: "Truthiness", definition: "How a non-boolean value behaves in a condition: non-empty strings and non-zero numbers count as True; empty strings, 0, and False count as False." },
        { term: "Chained comparison", definition: "Two comparisons joined into one range check, like 18 <= age < 65 — Python reads it exactly like math." },
      ],
      mistakes: [
        {
          mistake: "Writing day == 'saturday' or 'sunday' to avoid repetition.",
          why: "Python parses it as (day == 'saturday') or ('sunday'); a non-empty string is truthy, so the or is True for every value of day — the branch always fires.",
          fix: "Repeat the comparison on every side of or: day == 'saturday' or day == 'sunday'.",
        },
        {
          mistake: "Mixing and with or without parentheses.",
          why: "and binds tighter than or, so a or b and c means a or (b and c) — rarely what the author meant, and the true grouping is invisible in the source.",
          fix: "Add parentheses around the parts that belong together, even when precedence already agrees with you.",
        },
        {
          mistake: "Putting the risky operation before the guard, like if 10 / denominator > 1 and denominator != 0:.",
          why: "Python evaluates left to right, so the division runs before the safety check can protect it — the program crashes on zero denominators.",
          fix: "Guards go on the left of and, risky operations go on the right.",
        },
        {
          mistake: "Writing if is_raining == True: everywhere.",
          why: "It works, but it is noise: conditions already expect booleans, and with truthiness it can even mislead — value == True is False for any non-boolean truthy value.",
          fix: "Write if is_raining: and if not is_raining: — the booleans stand on their own.",
        },
      ],
      takeaways: [
        "and needs every part True; or is satisfied with one; not flips the answer.",
        "or stops at the first True and and stops at the first False — the rest of the condition is never evaluated.",
        "A bare string next to or makes a condition always True — repeat the comparison instead: day == 'x' or day == 'y'.",
        "Guards on the left, risky operations on the right: check-then-do is safe because of short-circuiting.",
        "18 <= age < 65 is Python for a range check — read it exactly like math, and parenthesize when and meets or.",
      ],
      quiz: [
        {
          id: "c-05-q1",
          prompt: "What does the condition `18 <= age < 65` mean?",
          options: [
            { text: "age is at least 18 AND under 65 — a chained comparison, checked in one readable line", correct: true, feedback: "Exactly — it behaves like age >= 18 and age < 65, with age evaluated once." },
            { text: "age is exactly 18 or exactly 65 — only the endpoints count", correct: false, feedback: "Chained comparisons cover the whole range between the bounds, not just the endpoints." },
            { text: "A SyntaxError — comparisons cannot be chained in Python", correct: false, feedback: "Chaining is legal and idiomatic Python — you met it in Part B." },
            { text: "age is greater than 18 and greater than 65", correct: false, feedback: "Read the operators: 18 <= age (at least 18) and age < 65 (under 65)." },
          ],
          explanation: "Chained comparisons are Python's range check: 18 <= age < 65 means at least 18 and under 65.",
        },
        {
          id: "c-05-q2",
          prompt: "Which condition correctly checks that `day` is a weekend day?",
          options: [
            { text: "day == 'saturday' or day == 'sunday'", correct: true, feedback: "Correct — each side is a complete comparison, and one true side is enough for or." },
            { text: "day == 'saturday' or 'sunday'", correct: false, feedback: "The classic trap: 'sunday' alone is truthy, so this condition is True on every single day." },
            { text: "day == 'saturday' and day == 'sunday'", correct: false, feedback: "Both cannot be true for the same value — this condition is always False." },
            { text: "day == ('saturday' or 'sunday')", correct: false, feedback: "The inner or picks the first truthy operand, so this reduces to day == 'saturday' — Sundays would fail." },
          ],
          explanation: "Repeat the full comparison on every side of or. Shortcuts with bare values explode into always-true conditions.",
        },
        {
          id: "c-05-q3",
          prompt: "With `denominator = 0`, what does `if denominator != 0 and 10 / denominator > 1:` do?",
          options: [
            { text: "Runs the else without crashing — and short-circuits at the first False, so the division never happens", correct: true, feedback: "Exactly: 0 != 0 is False, and stops there, the division is skipped, the program survives." },
            { text: "Crashes with a ZeroDivisionError", correct: false, feedback: "That happens only when the division is on the LEFT of the and — here the guard protects it." },
            { text: "Evaluates to True and runs the if body", correct: false, feedback: "The first operand is False, and there is no way for and to recover from a False side." },
            { text: "Raises a SyntaxError", correct: false, feedback: "The code is perfectly legal — and its safety comes from short-circuit evaluation order." },
          ],
          explanation: "Short-circuiting is the quiet hero of this pattern: guards on the left, risky operations on the right.",
        },
      ],
    },

    // ------------------------------------------------------------- c-06
    {
      slug: "c-06",
      title: "Practical Decision Problems",
      minutes: 20,
      summary:
        "Five worked problems end to end — movie pricing, login checks, shipping tiers, leap years, and a guessing-game hint system — from problem statement through condition design to tested code.",
      kind: "coding",
      objectives: [
        "Turn a written problem statement into a set of ordered conditions",
        "Decide when rules belong in one chain and when they need separate statements",
        "Implement pricing tiers, login checks, divisibility rules, and hint systems",
        "Test decision code systematically with boundary values",
      ],
      why: "There is a gap between knowing what an if statement is and being able to build the logic behind a shop checkout, a login form, or a delivery quote. This lesson closes it: five real problems, each taken from plain-English rules all the way to tested code. The habits you practice here — list the cases, order the conditions, separate independent decisions, and test the boundaries — are exactly how professional developers design and verify pricing tables and validation rules in production systems.",
      blocks: [
        {
          kind: "text",
          text: "Knowing what `if`, `elif`, and the logical operators *are* is one skill; turning a paragraph of business rules into tested code is another. This lesson closes the gap with five complete problems, each built the same way: read the rules, list the cases in plain English, decide the order, write the conditions, then test the boundaries. That recipe works on every decision problem you will ever meet.",
        },
        {
          kind: "steps",
          title: "From problem statement to tested code",
          items: [
            "Read the rules and restate every case in plain English before touching the keyboard.",
            "Decide whether it is ONE decision with many cases (a single if/elif chain) or SEVERAL independent decisions (separate statements).",
            "Pick the order: strictest or most severe condition first, with a final else as the safety net.",
            "Write the chain, keeping each condition as simple as the first-match-wins knowledge allows.",
            "Test the boundaries — the exact values where behavior should change — plus one value far from every edge.",
          ],
        },
        {
          kind: "text",
          text: "**Problem 1 — Movie ticket pricing.** A cinema charges by age: under 13 pays 7.00, ages 13 to 64 pay 12.50, and 65 and over pay 9.00. Evening screenings (18:00 or later) cost an extra 1.50 for everyone. Two rules — and crucially they are *independent*: the age picks the base price, and the showtime decides the surcharge. Independent decisions are separate statements, never one chain.",
        },
        {
          kind: "code",
          title: "Problem 1: two independent decisions",
          code: `age = 41
showtime = 19

# Decision 1: pick the age tier
if age < 13:
    price = 7.00
elif age >= 65:
    price = 9.00
else:
    price = 12.50

# Decision 2: evening surcharge (independent of age)
if showtime >= 18:
    price = price + 1.50

print(f"Ticket price: {price:.2f}")
`,
          output: `Ticket price: 14.00`,
          explain: [
            "Decision 1 is a chain — three age cases, so if/elif/else, ordered so no condition needs a compound bound.",
            "Decision 2 is a plain if — the surcharge applies to *every* tier, so it is not another case of the same decision.",
            "`price = price + 1.50` upgrades the ticket after the chain: two decisions in sequence, like an assembly line.",
            "The f-string with `:.2f` prints 14.00 — money always gets exactly two decimals.",
          ],
        },
        {
          kind: "text",
          text: "**Problem 2 — Login-style checks.** A login form has a username and a password, and accounts can be locked. The messages, in order of severity: a locked account gets 'Account locked. Contact support.'; a wrong username gets 'Unknown username.'; a wrong password gets 'Wrong password.'; otherwise, 'Welcome back, Ada!'. When checks have a natural severity order, put the most severe first — that is guard thinking applied to a chain.",
        },
        {
          kind: "code",
          title: "Problem 2: most severe check first",
          code: `username = "ada"
password = "secret123"
account_locked = False

if account_locked:
    print("Account locked. Contact support.")
elif username != "ada":
    print("Unknown username.")
elif password != "secret123":
    print("Wrong password.")
else:
    print("Welcome back, Ada!")
`,
          output: `Welcome back, Ada!`,
          explain: [
            "`account_locked` is checked first: there is no point inspecting credentials for a locked account — guard ordering inside a chain.",
            "Each elif asks 'what went wrong?' — and the final else means everything went right.",
            "Here the account is fine, the username is right, the password is right, so the else greets Ada.",
            "Flip `account_locked` to True in your head: line 1 fires no matter what the credentials say. The order protects the logic.",
          ],
        },
        {
          kind: "text",
          text: "**Problem 3 — Shipping cost tiers.** Parcels up to 1 kg ship for 4.95; up to 5 kg for 8.50; up to 10 kg for 15.25; anything heavier for 21.50. Ascending thresholds mean each elif inherits the previous failure — `elif weight <= 5` automatically means 'over 1 but not over 5', with no `and` required.",
        },
        {
          kind: "code",
          title: "Problem 3: tiers in climbing order",
          code: `weight = 7

if weight <= 1:
    shipping = 4.95
elif weight <= 5:
    shipping = 8.50
elif weight <= 10:
    shipping = 15.25
else:
    shipping = 21.50

print(f"Shipping: {shipping:.2f}")
`,
          output: `Shipping: 15.25`,
          explain: [
            "The chain climbs: each condition states only its own upper edge, because falling past it proves the earlier ones False.",
            "7 fails `<= 1` and `<= 5`, then passes `<= 10` — so 15.25.",
            "Reverse the order (10 first, then 5, then 1) and every parcel up to 10 kg would cost 15.25. Order is logic, again.",
          ],
        },
        {
          kind: "text",
          text: "**Problem 4 — Is it a leap year?** A year is a leap year when it is divisible by 4 — except century years (divisible by 100), which must ALSO be divisible by 400. So 2024 is a leap year, 2023 is not, 1900 is not (a century not divisible by 400), and 2000 is. One compound condition built from `%` and the logical operators does the entire job.",
        },
        {
          kind: "code",
          title: "Problem 4: divisibility plus parentheses",
          code: `year = 2024

if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
    print(f"{year} is a leap year")
else:
    print(f"{year} is not a leap year")
`,
          output: `2024 is a leap year`,
          explain: [
            "`year % 4 == 0` — divisible by 4. The `%` operator gives the remainder, so a remainder of 0 means 'divides evenly'.",
            "The parentheses matter: the rule reads 'divisible by 4 AND (not a century OR divisible by 400)'. Without them, `and` would grab more than its share of the condition.",
            "Walk 1900 through it: divisible by 4 — yes; not a century — no; divisible by 400 — no. The and fails: not a leap year. Correct.",
            "Walk 2000 through it: divisible by 4 — yes; not a century — no; divisible by 400 — yes! The or saves the day: leap year. Correct.",
          ],
        },
        {
          kind: "text",
          text: "**Problem 5 — A guessing-game hint system.** A secret number is fixed at 42. A guess earns 'Correct! Well guessed.' if exact, otherwise 'Too low.' or 'Too high.' — plus a warmth hint: within 5 it is boiling, within 20 it is warm, anything else is cold. Two decisions again: direction first (which also computes the distance), then the warmth tier. And this time the nesting is *earned* — the hint only exists when the guess was wrong.",
        },
        {
          kind: "code",
          title: "Problem 5: direction, then warmth",
          code: `secret = 42
guess = 57

if guess == secret:
    print("Correct! Well guessed.")
else:
    if guess < secret:
        print("Too low.")
        difference = secret - guess
    else:
        print("Too high.")
        difference = guess - secret

    if difference <= 5:
        print("So close — boiling!")
    elif difference <= 20:
        print("Warm.")
    else:
        print("Cold.")
`,
          output: `Too high.
Warm.`,
          explain: [
            "Direction and distance are computed in the same branch: the guess 57 is high, so `difference` is 57 - 42 = 15.",
            "The warmth chain lives inside the else — asking how far off a *correct* guess is would be nonsense. This is the GOOD kind of nesting from c-04: the inner logic needs its own container.",
            "15 falls in the `<= 20` tier, so 'Warm.' — check the edges: 5 away would be boiling, 6 away would already be warm.",
            "The full session prints two lines: the direction line, then the warmth line.",
          ],
        },
        {
          kind: "text",
          text: "**The habit that separates professionals from hobbyists: boundary testing.** Almost every real decision bug lives exactly at the edges — the first value that should flip the behavior and the last value that should keep it. Middle values almost never catch anything. When you write any chain, walk straight to the edges first:",
        },
        {
          kind: "table",
          title: "The boundaries worth testing for each problem",
          headers: ["Program", "Test these exact values", "Why"],
          rows: [
            ["Movie price", "12 and 13; 64 and 65; 17 and 18", "The first and last value of every tier, plus the surcharge edge"],
            ["Login checks", "locked; wrong username; wrong password; all correct", "Each branch needs one dedicated value"],
            ["Shipping tiers", "1; 5; 10; 11", "Each threshold, then one value just past the last"],
            ["Leap year", "2024; 1900; 2000; 2023", "One value per rule outcome — the two century cases are separate outcomes"],
            ["Guess hints", "42; 47; 62; 75", "Exact hit, boiling (5 away), the warm boundary (20 away), and cold"],
          ],
          caption:
            "Off-by-one errors hide at the edges: a 13-year-old paying the child price, or a 10 kg parcel billed at 15.25, are exactly the bugs boundary testing catches in seconds.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where you are — and what is next",
          text: "Part C is complete: your programs can choose. `if` for one-way, `if-else` for two-way, `elif` chains for many-way, `and`/`or`/`not` to combine, chained comparisons for ranges — plus the testing habit that makes them trustworthy. Next comes the second half of control flow: doing things *repeatedly* with loops, where everything you built today gets exercised a hundred times per run.",
        },
        {
          kind: "tryIt",
          title: "Try it: run the boundary tests",
          task: "The 41-year-old at 19:00 pays 14.00. Now you are the tester: set (age=12, showtime=14) — child price with no surcharge; predict and run. Then (13, 14), then (64, 23), then (65, 23), then (7, 19). Five predictions, five runs — any mismatch, trace the chain before moving on.",
          hint: "12 is a child (7.00, and 14:00 means no surcharge). 13 crosses into the adult tier. At 23:00, every tier gains 1.50 — the surcharge is a second, independent decision.",
          code: `age = 41
showtime = 19

if age < 13:
    price = 7.00
elif age >= 65:
    price = 9.00
else:
    price = 12.50

if showtime >= 18:
    price = price + 1.50

print(f"Ticket price: {price:.2f}")
`,
        },
      ],
      terms: [
        { term: "Boundary value", definition: "The exact value where behavior is supposed to change — like age 13, sitting between the child and adult tiers." },
        { term: "Edge case", definition: "A value at the extreme edge of valid input: age 0, weight 0, an empty name. Code that survives the middle often breaks at the edges." },
        { term: "Off-by-one error", definition: "The classic bug of being one step wrong at a boundary — like charging a 13-year-old the child price." },
        { term: "Test case", definition: "One input chosen to prove a specific branch behaves. Middle values prove little; the edges prove everything." },
      ],
      mistakes: [
        {
          mistake: "Testing only middle values (a 30-year-old for the movie price).",
          why: "Middle values exercise exactly one branch and never reveal boundary mistakes — the serious pricing bugs live at 12/13, 64/65, and the 17/18 surcharge edge.",
          fix: "Test each threshold from both sides, plus one value far from every edge.",
        },
        {
          mistake: "Cramming independent decisions into one chain (adding showtime cases to the age chain).",
          why: "The surcharge is not another age case — mixing it into the age chain would charge evening prices based on the first age check that fails, corrupting the tier logic.",
          fix: "One chain per real decision. Independent rules live in separate statements.",
        },
        {
          mistake: "Testing the leap year with only 2024.",
          why: "2024 proves the divisible-by-4 path but says nothing about century years — 1900 and 2000 are where the rule actually gets interesting.",
          fix: "Pick one test value per outcome of every rule, especially the rare branches.",
        },
      ],
      takeaways: [
        "Read, list, order, chain, boundary-test — the five-step recipe for every decision problem.",
        "Independent decisions get separate statements; one decision with many cases gets one chain.",
        "Put the strictest or most severe condition first, and finish with a safety-net else.",
        "Leap years in one line: divisible by 4 and (not a century or divisible by 400) — % plus logical operators plus parentheses.",
        "Bugs live at boundaries: test the exact values where behavior flips, from both sides.",
      ],
      quiz: [
        {
          id: "c-06-q1",
          prompt: "The movie program prices the age tier with one if/elif/else, then applies the evening surcharge with a separate if. Why not one chain for everything?",
          options: [
            { text: "Age and showtime are independent decisions — the surcharge applies to every tier, so mixing them into one chain corrupts the tier logic", correct: true, feedback: "Exactly: independent rules belong in separate statements, in sequence." },
            { text: "Because Python allows at most three branches per chain", correct: false, feedback: "Chains can be as long as the problem needs — the limit is clarity, not syntax." },
            { text: "Because two chains run faster than one", correct: false, feedback: "Performance has nothing to do with it; correctness and clarity are the reasons." },
            { text: "Because f-strings cannot appear next to elif chains", correct: false, feedback: "f-strings work anywhere — this is about how many decisions the code encodes." },
          ],
          explanation: "One decision with many cases = one chain. Two independent decisions = two statements. Recognizing which you are writing is the core design skill of this part.",
        },
        {
          id: "c-06-q2",
          prompt: "The shipping chain reads `if weight <= 1:`, then `elif weight <= 5:`. Why does the elif not need a lower bound like `weight > 1`?",
          options: [
            { text: "Reaching that elif already proves the first condition was False — so weight is over 1. First-match-wins narrows the meaning for free", correct: true, feedback: "Exactly — chain order does the bounding for you, which is why ascending tiers stay one condition per line." },
            { text: "Because <= 5 includes all smaller weights anyway, so the result is the same", correct: false, feedback: "Alone, the condition would also match a 0.5 kg parcel and charge it 8.50 — the protection comes from the chain order, not the operator." },
            { text: "Because the final else covers weights under 1", correct: false, feedback: "The else only catches weights over 10 — everything below is handled by the chain above it." },
            { text: "Because elif secretly re-checks all earlier conditions", correct: false, feedback: "elif never re-checks anything — it relies on the earlier conditions having already failed." },
          ],
          explanation: "Every elif inherits the failures above it. That is why chains stay simple AND why their order is logic.",
        },
        {
          id: "c-06-q3",
          prompt: "Which set of test values covers the leap-year rule most completely?",
          options: [
            { text: "2024, 1900, 2000, 2023 — one value per outcome: ordinary leap, century non-leap, century leap, ordinary non-leap", correct: true, feedback: "Right — every branch of the rule gets its own witness value, including both century cases." },
            { text: "2024, 2025, 2026, 2027 — four years in a row", correct: false, feedback: "Three of those are the same case (ordinary non-leap). The century branches stay completely untested." },
            { text: "2024 only — one representative value", correct: false, feedback: "2024 tests just one outcome of a rule with three distinct outcomes." },
            { text: "1900 and 2000 only — the rare cases", correct: false, feedback: "The century cases are covered, but the ordinary path (most years!) stays dark." },
          ],
          explanation: "One test value per outcome of every rule — that is the boundary-testing discipline in one sentence.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART C EXERCISES — 4 beginner, 4 intermediate, 4 advanced
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "c-b1",
      tier: "beginner",
      title: "The number classifier",
      prompt:
        "Store -7 in a variable called number, then print exactly two lines about it. Line 1: 'even' if the number is divisible by 2 (its % 2 remainder is 0), otherwise 'odd'. Line 2: 'positive' if the number is greater than zero, 'negative' if it is less than zero, and 'zero' if it is neither. Remember: 0 counts as even, and zero is neither positive nor negative. The auto-check runs your program with number = -7.",
      hint: "% gives the remainder: -7 % 2 is 1 in Python, so -7 is odd. For the sign, a if/elif/else on > 0, < 0, else zero covers all integers — including zero.",
      starter: `# Classify this number: even/odd, then its sign
number = -7

# TODO 1: if the remainder of number % 2 is 0, print "even", otherwise print "odd"

# TODO 2: print "positive" if number is above zero, "negative" if below, "zero" if exactly zero

`,
      solution: `# Classify this number: even/odd, then its sign
number = -7

# Line 1: even or odd (a number is even when the remainder of / 2 is 0)
if number % 2 == 0:
    print("even")
else:
    print("odd")

# Line 2: positive, negative, or zero (zero is neither)
if number > 0:
    print("positive")
elif number < 0:
    print("negative")
else:
    print("zero")
`,
      expectedOutput: `odd
negative`,
      concepts: ["modulo (%)", "if-else", "elif chains"],
    },
    {
      id: "c-b2",
      tier: "beginner",
      title: "Score to letter grade",
      prompt:
        "Store 87 in a variable called score and convert it into a letter grade using a single if/elif/else chain. The scale: 90 or above is A, 80-89 is B, 70-79 is C, 60-69 is D, and anything below 60 is F. Print exactly one line in the format 'Score 87: grade B' — build it with an f-string so the score and the letter are inserted dynamically, and make sure the chain works for any score (the auto-check runs with 87).",
      hint: "Order the chain from the strictest bar down: >= 90 first, then >= 80, >= 70, >= 60, and a final else for F. First-match-wins means no and-bounds are needed.",
      starter: `# Score -> letter grade
score = 87

# Scale: 90+ A, 80-89 B, 70-79 C, 60-69 D, below 60 F
# TODO: build ONE if/elif/else chain that sets grade,
# then print(f"Score {score}: grade {grade}")

`,
      solution: `# Score -> letter grade
score = 87

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score}: grade {grade}")
`,
      expectedOutput: `Score 87: grade B`,
      concepts: ["elif chains", "first-match-wins", "f-strings"],
    },
    {
      id: "c-b3",
      tier: "beginner",
      title: "Leap-year checker",
      prompt:
        "Store 1900 in a variable called year and decide whether it is a leap year. The full rule: a year is a leap year when it is divisible by 4 — except years divisible by 100, which must ALSO be divisible by 400. So 2024 is a leap year, 1900 is not, and 2000 is. Print exactly one line: either f'{year} is a leap year' or f'{year} is not a leap year'. Use % for the divisibility tests and put parentheses around the century part of the condition.",
      hint: "One condition does it: year % 4 == 0 and (year % 100 != 0 or year % 400 == 0). Walk 1900 through it by hand: divisible by 4 — yes; century — yes, so divisible by 400? No. Not a leap year.",
      starter: `# Is this year a leap year?
year = 1900

# Rule: divisible by 4, EXCEPT century years (divisible by 100)
# unless they are also divisible by 400.
# TODO: print f"{year} is a leap year" or f"{year} is not a leap year"

`,
      solution: `# Is this year a leap year?
year = 1900

if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
    print(f"{year} is a leap year")
else:
    print(f"{year} is not a leap year")
`,
      expectedOutput: `1900 is not a leap year`,
      concepts: ["modulo (%)", "logical operators", "parentheses"],
    },
    {
      id: "c-b4",
      tier: "beginner",
      title: "The umbrella advisor",
      prompt:
        "Store True in is_raining and False in forecast_cloudy, then write a one-decision umbrella advisor: if it is already raining OR rain is forecast, print 'Take the umbrella'; otherwise print 'Leave the umbrella home'. A single if/else with or is all it takes — no elif needed. The auto-check runs with the given values, but flip each variable yourself and confirm both branches still work.",
      hint: "if is_raining or forecast_cloudy: — one line, exactly the rule in words. The else carries the sunny-day message.",
      starter: `# Umbrella advisor
is_raining = True
forecast_cloudy = False

# TODO: print "Take the umbrella" if it is raining OR clouds are forecast,
# otherwise print "Leave the umbrella home"

`,
      solution: `# Umbrella advisor
is_raining = True
forecast_cloudy = False

if is_raining or forecast_cloudy:
    print("Take the umbrella")
else:
    print("Leave the umbrella home")
`,
      expectedOutput: `Take the umbrella`,
      concepts: ["or operator", "if-else", "booleans"],
    },

    // ---- intermediate
    {
      id: "c-i1",
      tier: "intermediate",
      title: "BMI category classifier",
      prompt:
        "Compute a BMI and classify it. Store weight = 68 (kilograms) and height = 1.75 (meters). Compute bmi as weight divided by height squared. Then classify with one chain: below 18.5 is 'underweight', below 25 is 'normal weight', below 30 is 'overweight', and 30 or above is 'obese'. Print exactly two lines: f'BMI: {bmi:.2f}' and f'Category: {category}' — the :.2f format shows the BMI rounded to two decimal places.",
      hint: "68 / (1.75 * 1.75) is about 22.20 — normal weight territory. The chain checks the lower edge only: bmi < 18.5, elif bmi < 25, elif bmi < 30, else obese.",
      starter: `# BMI category classifier
weight = 68      # kilograms
height = 1.75    # meters

# TODO 1: bmi = weight divided by height squared (height * height works)
# TODO 2: one chain — under 18.5 "underweight", under 25 "normal weight",
#         under 30 "overweight", else "obese" — store the word in category
# TODO 3: print(f"BMI: {bmi:.2f}") then print(f"Category: {category}")

`,
      solution: `# BMI category classifier
weight = 68      # kilograms
height = 1.75    # meters

bmi = weight / (height * height)

if bmi < 18.5:
    category = "underweight"
elif bmi < 25:
    category = "normal weight"
elif bmi < 30:
    category = "overweight"
else:
    category = "obese"

print(f"BMI: {bmi:.2f}")
print(f"Category: {category}")
`,
      expectedOutput: `BMI: 22.20
Category: normal weight`,
      concepts: ["arithmetic", "elif chains", "float formatting"],
    },
    {
      id: "c-i2",
      tier: "intermediate",
      title: "FizzBuzz-lite",
      prompt:
        "FizzBuzz, lite — no loops yet, so two hardcoded numbers. Store 15 in number_a and 9 in number_b. For each number, print one line by these rules: divisible by BOTH 3 and 5 prints 'FizzBuzz'; divisible by 3 only prints 'Fizz'; divisible by 5 only prints 'Buzz'; otherwise print the number itself. Each number gets its own if/elif/else chain — and think hard about which condition must be checked FIRST before you write it. Expected output: two lines, 'FizzBuzz' then 'Fizz'.",
      hint: "Check the both-at-once case first: number % 3 == 0 and number % 5 == 0. If you check % 3 alone first, a 15 prints 'Fizz' and the combined case is unreachable — the classic FizzBuzz ordering trap.",
      starter: `# FizzBuzz-lite: one chain per number
number_a = 15
number_b = 9

# Rules per number, in ONE chain:
#   divisible by 3 AND 5  -> "FizzBuzz"
#   divisible by 3 only   -> "Fizz"
#   divisible by 5 only   -> "Buzz"
#   otherwise             -> print the number itself
# TODO: the chain for number_a, then the same chain for number_b

`,
      solution: `# FizzBuzz-lite: one chain per number
number_a = 15
number_b = 9

# number_a: the 3-and-5 case must be checked FIRST
if number_a % 3 == 0 and number_a % 5 == 0:
    print("FizzBuzz")
elif number_a % 3 == 0:
    print("Fizz")
elif number_a % 5 == 0:
    print("Buzz")
else:
    print(number_a)

# number_b: same chain, new value
if number_b % 3 == 0 and number_b % 5 == 0:
    print("FizzBuzz")
elif number_b % 3 == 0:
    print("Fizz")
elif number_b % 5 == 0:
    print("Buzz")
else:
    print(number_b)
`,
      expectedOutput: `FizzBuzz
Fizz`,
      concepts: ["modulo (%)", "and operator", "chain order"],
    },
    {
      id: "c-i3",
      tier: "intermediate",
      title: "Shipping tiers with a guard",
      prompt:
        "A courier prices parcels by weight with inclusive upper tiers: up to and including 1 kg costs 3.99; up to 5 kg costs 7.25; up to 10 kg costs 12.40; up to 20 kg costs 18.75. Parcels over 20 kg are refused with the message 'Sorry, we cannot ship X kg — our limit is 20 kg' (the actual weight in place of X). Store 8 in weight, guard the impossible case first, then chain the tiers, and print f'Shipping cost for {weight} kg: {cost:.2f}' for accepted parcels. The auto-check runs with weight = 8.",
      hint: "Guard first: if weight > 20, print the refusal. Otherwise the tier chain runs inside the else — 8 falls between 5 and 10, so the cost is 12.40. Ascending tiers need no and-bounds.",
      starter: `# Shipping tier calculator with an over-limit guard
weight = 8

# Tiers (upper edges are inclusive):
#   up to 1 kg   -> 3.99
#   up to 5 kg   -> 7.25
#   up to 10 kg  -> 12.40
#   up to 20 kg  -> 18.75
#   over 20 kg   -> refused
# TODO: guard the refusal first, then chain the tiers,
# then print(f"Shipping cost for {weight} kg: {cost:.2f}")

`,
      solution: `# Shipping tier calculator with an over-limit guard
weight = 8

if weight > 20:
    print(f"Sorry, we cannot ship {weight} kg — our limit is 20 kg")
else:
    if weight <= 1:
        cost = 3.99
    elif weight <= 5:
        cost = 7.25
    elif weight <= 10:
        cost = 12.40
    else:
        cost = 18.75

    print(f"Shipping cost for {weight} kg: {cost:.2f}")
`,
      expectedOutput: `Shipping cost for 8 kg: 12.40`,
      concepts: ["elif chains", "guard clauses", "float formatting"],
    },
    {
      id: "c-i4",
      tier: "intermediate",
      title: "Fix the broken condition",
      prompt:
        "Debugging practice: this starter has TWO problems. First it refuses to run at all — find the syntax error on the third condition (one equals sign where two belong). Fix it, run again, and you will discover problem two: the chain is in the wrong ORDER, so a 15-year-old gets the 12A message instead of the correct one. Reorder so each band gets its own audience: 18 and over see 'All films welcome', 15-17 see '15 films and below', 12-14 see 'PG and 12A films', under 12 see 'U films only'. The fixed program must print '15 films and below' for age = 15.",
      hint: "Fix syntax first: elif age = 18 or age > 18: assigns instead of comparing (Python even suggests '==' in the error). Then reorder strictest band first — and notice the redundant 'or age > 18': a single >= 18 says it all.",
      starter: `# Cinema age ratings - the correct message for each age:
#   18 and over      -> "All films welcome"
#   15 to 17         -> "15 films and below"
#   12 to 14         -> "PG and 12A films"
#   under 12         -> "U films only"
#
# This starter has TWO problems: a syntax error on one line,
# and conditions in the wrong order.

age = 15

if age >= 12:
    print("PG and 12A films")
elif age >= 15:
    print("15 films and below")
elif age = 18 or age > 18:
    print("All films welcome")
else:
    print("U films only")
`,
      starterExpectError: "SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?",
      solution: `# Cinema age ratings, ordered from the strictest band down
age = 15

if age >= 18:
    print("All films welcome")
elif age >= 15:
    print("15 films and below")
elif age >= 12:
    print("PG and 12A films")
else:
    print("U films only")
`,
      expectedOutput: `15 films and below`,
      concepts: ["debugging", "SyntaxError", "chain order"],
    },

    // ---- advanced
    {
      id: "c-a1",
      tier: "advanced",
      title: "Rock, paper, scissors — winner logic",
      prompt:
        "Rock, paper, scissors — the winner logic, with fixed choices and no input(). Store 'rock' in player1 and 'scissors' in player2. First print the choices as f'Player 1 chose {player1}, player 2 chose {player2}'. Then decide the winner: a tie prints \"It's a tie!\"; otherwise player 1 wins exactly when their shape beats the other — rock beats scissors, paper beats rock, scissors beats paper — and any other combination means player 2 wins. Build p1_wins as ONE boolean made of three and-pairs joined by or, then a three-way decision: tie check first, then p1_wins, else player 2 wins.",
      hint: "p1_wins = (player1 == 'rock' and player2 == 'scissors') or (player1 == 'paper' and player2 == 'rock') or (player1 == 'scissors' and player2 == 'paper'). With rock vs scissors the first and-pair is True, so the or is already decided there.",
      starter: `# Rock, paper, scissors - winner logic with fixed choices
player1 = "rock"
player2 = "scissors"

# TODO 1: print(f"Player 1 chose {player1}, player 2 chose {player2}")
# TODO 2: build p1_wins - ONE boolean: (rock beats scissors) or
#         (paper beats rock) or (scissors beats paper), each an and-pair
#         comparing player1 and player2 to the right shapes
# TODO 3: three-way decision - tie first (player1 == player2),
#         then p1_wins, else player 2 wins

`,
      solution: `# Rock, paper, scissors - winner logic with fixed choices
player1 = "rock"
player2 = "scissors"

print(f"Player 1 chose {player1}, player 2 chose {player2}")

# Does player 1's shape beat player 2's? One boolean, three and-pairs.
p1_wins = (player1 == "rock" and player2 == "scissors") or (player1 == "paper" and player2 == "rock") or (player1 == "scissors" and player2 == "paper")

if player1 == player2:
    print("It's a tie!")
elif p1_wins:
    print("Player 1 wins!")
else:
    print("Player 2 wins!")
`,
      expectedOutput: `Player 1 chose rock, player 2 chose scissors
Player 1 wins!`,
      concepts: ["logical operators", "boolean variables", "multi-way decisions"],
    },
    {
      id: "c-a2",
      tier: "advanced",
      title: "The signup validator",
      prompt:
        "Build a signup form validator that reports the FIRST problem found, in mentor order. Store username = 'gracehopper', password = 'cobol1959', age = 12. The rules, most important first: the username must be 4-12 characters long (use len() inside a chained comparison); the password must be at least 8 characters; the password must not equal the username; the user must be 13 or older. Each failure prints its own 'Signup failed: ...' message, and total success prints 'Signup complete. Welcome!'. The auto-check runs with the given data and expects the age failure message.",
      hint: "4 <= len(username) <= 12 is a legal chained comparison. With gracehopper (11 chars) and cobol1959 (9 chars) the first two checks pass — so the chain must reach the age check and report 12 as too young.",
      starter: `# Signup form validator - report the FIRST problem found
username = "gracehopper"
password = "cobol1959"
age = 12

# Rules, most important first:
#   username must be 4-12 characters    (len() + a chained comparison)
#   password must be at least 8 characters
#   password must not equal the username
#   age must be 13 or older
# TODO: one if/elif chain — failures in order, success in the final else

`,
      solution: `# Signup form validator - report the FIRST problem found
username = "gracehopper"
password = "cobol1959"
age = 12

if not (4 <= len(username) <= 12):
    print("Signup failed: username must be 4-12 characters")
elif len(password) < 8:
    print("Signup failed: password must be at least 8 characters")
elif password == username:
    print("Signup failed: password cannot match username")
elif age < 13:
    print("Signup failed: you must be at least 13")
else:
    print("Signup complete. Welcome!")
`,
      expectedOutput: `Signup failed: you must be at least 13`,
      concepts: ["len()", "chained comparisons", "validation chains"],
    },
    {
      id: "c-a3",
      tier: "advanced",
      title: "Tiered electricity bill",
      prompt:
        "Tiered electricity pricing, where each tier prices only ITS OWN slice of usage: the first 100 kWh cost 0.12 each; kWh 101 through 250 cost 0.18 each; every kWh above 250 costs 0.28 each. Store 260 in kwh and compute the total bill with one if/elif/else chain — the trick is that a 260 kWh customer pays 100 * 0.12 PLUS 150 * 0.18 PLUS 10 * 0.28, not one flat rate for all 260. Print exactly two lines: f'Usage: {kwh} kWh' and f'Bill: {bill:.2f}'. Check your arithmetic: 12.00 + 27.00 + 2.80 = 41.80.",
      hint: "Three slices for 260 kWh: 100 at 0.12, then 150 at 0.18, then 10 at 0.28 — all three products added in the final branch. The middle branch adds TWO products: the first 100 kWh at tier 1 plus the excess above 100 at tier 2.",
      starter: `# Tiered electricity bill - each tier prices only its own slice
#   Tier 1: the FIRST 100 kWh at 0.12 each
#   Tier 2: kWh 101-250 at 0.18 each
#   Tier 3: every kWh above 250 at 0.28 each
kwh = 260

# TODO: if kwh <= 100 the whole bill is tier 1; if kwh <= 250 pay tier 1
# for the first 100 PLUS 0.18 for each kWh above 100; above 250, add
# tier 3 for the excess above 250. Then print:
#   print(f"Usage: {kwh} kWh")
#   print(f"Bill: {bill:.2f}")

`,
      solution: `# Tiered electricity bill - each tier prices only its own slice
# Tier 1: the first 100 kWh at 0.12 each
# Tier 2: kWh 101-250 at 0.18 each
# Tier 3: every kWh above 250 at 0.28 each
kwh = 260

if kwh <= 100:
    bill = kwh * 0.12
elif kwh <= 250:
    bill = 100 * 0.12 + (kwh - 100) * 0.18
else:
    bill = 100 * 0.12 + 150 * 0.18 + (kwh - 250) * 0.28

print(f"Usage: {kwh} kWh")
print(f"Bill: {bill:.2f}")
`,
      expectedOutput: `Usage: 260 kWh
Bill: 41.80`,
      concepts: ["tiered pricing", "arithmetic", "elif chains"],
    },
    {
      id: "c-a4",
      tier: "advanced",
      title: "The triangle classifier",
      prompt:
        "Triangle classifier with a validity guard. Store 3, 4, 5 in a, b, c. First the guard: sides form a triangle only when EVERY pair adds to more than the third (a + b > c, a + c > b, b + c > a — one boolean joined by and). If invalid, print 'These sides do not form a triangle.' and nothing else. Otherwise print 'These sides form a valid triangle.', then classify: all three sides equal is 'equilateral', exactly two equal is 'isosceles', none equal is 'scalene' — print f'Classification: {kind}'. Finally check Pythagoras with or over the three pairings: if one side squared equals the sum of the other two squares, print 'It is also a right triangle.'",
      hint: "All-equal is a chained comparison: a == b and b == c (if two pairs match, the third does too). Exactly-two-equal is a == b or b == c or a == c as the elif. Right triangle: a*a + b*b == c*c or a*a + c*c == b*b or b*b + c*c == a*a — integers compare exactly, so == is safe here.",
      starter: `# Triangle classifier with a validity guard
a = 3
b = 4
c = 5

# TODO 1: is_valid - every pair of sides adds to MORE than the third
#         (one boolean: a + b > c, a + c > b, b + c > a, joined by and)
# TODO 2: if not valid, print "These sides do not form a triangle." (nothing else)
# TODO 3: else print "These sides form a valid triangle.", classify:
#         all equal -> "equilateral", exactly two equal -> "isosceles",
#         none equal -> "scalene"; then print(f"Classification: {kind}")
# TODO 4: check Pythagoras with or over the three pairings;
#         if one holds, print "It is also a right triangle."

`,
      solution: `# Triangle classifier with a validity guard
a = 3
b = 4
c = 5

# Validity: every pair of sides must add to MORE than the third
is_valid = a + b > c and a + c > b and b + c > a

if not is_valid:
    print("These sides do not form a triangle.")
else:
    print("These sides form a valid triangle.")

    if a == b and b == c:
        kind = "equilateral"
    elif a == b or b == c or a == c:
        kind = "isosceles"
    else:
        kind = "scalene"

    print(f"Classification: {kind}")

    # Pythagoras: one side squared equals the sum of the other two
    if a * a + b * b == c * c or a * a + c * c == b * b or b * b + c * c == a * a:
        print("It is also a right triangle.")
`,
      expectedOutput: `These sides form a valid triangle.
Classification: scalene
It is also a right triangle.`,
      concepts: ["triangle inequality", "and operator", "elif chains"],
    },
  ],

  // =====================================================================
  // PART C ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "c-as-1",
      prompt: "Trace it: `age = 20`, then `if age >= 18:` with an indented `print('adult')`, then an unindented `print('done')`. What is the output?",
      options: [
        { text: "adult, then done", correct: true, feedback: "Right — the condition is True so the body runs, and the unindented line runs after it, always." },
        { text: "done only", correct: false, feedback: "That happens for a 15-year-old — but here 20 >= 18 is True, so the body runs first." },
        { text: "adult only", correct: false, feedback: "The last print is unindented — it lives outside the if and runs no matter what." },
        { text: "An IndentationError", correct: false, feedback: "Nothing structural is wrong: the unindented line simply exits the body. That is legal and intended." },
      ],
      explanation: "Bodies run on True; everything below the block runs regardless. That double behavior is the whole point of the if statement.",
    },
    {
      id: "c-as-2",
      prompt: "Trace it: `score = 45`, then `if score >= 50:` with TWO indented prints (`'pass'` and `'well done'`), then an unindented `print('bye')`. What prints?",
      options: [
        { text: "pass, well done, bye", correct: false, feedback: "45 >= 50 is False — every indented line is skipped, not just the first." },
        { text: "bye", correct: true, feedback: "Correct — the False condition skips the entire two-line body, and only the unindented line prints." },
        { text: "Nothing — the program crashes", correct: false, feedback: "Nothing is structurally wrong; a False condition is silent skipping, not an error." },
        { text: "pass, then bye", correct: false, feedback: "Bodies are all-or-nothing: when the condition is False, every indented line is skipped." },
      ],
      explanation: "Indentation groups: the False condition skips the whole body as one unit, and only the lines below the block print.",
    },
    {
      id: "c-as-3",
      prompt: "Trace it: `score = 95`, then `if score >= 60: print('D')`, then `elif score >= 90: print('A')`, then `else: print('F')`. What is the output?",
      options: [
        { text: "A", correct: false, feedback: "A 95 deserves an A — but the chain never reaches that check. First-match-wins." },
        { text: "D", correct: true, feedback: "Exactly: 95 >= 60 is True on the very first check, the D branch runs, and the rest is skipped." },
        { text: "F", correct: false, feedback: "The else runs only when NO condition matched — here the very first one matched." },
        { text: "D, then A", correct: false, feedback: "A chain runs at most one branch — execution never continues down the line." },
      ],
      explanation: "First-match-wins means order is logic: this chain labels every 60-or-over score a D — including a 95.",
    },
    {
      id: "c-as-4",
      prompt: "Which statement about `else` is TRUE?",
      options: [
        { text: "else must be given a condition, like elif", correct: false, feedback: "Backwards — a condition after else is a SyntaxError; else is the condition-free catch-all." },
        { text: "else is the catch-all that runs when no earlier condition matched — and it takes no condition", correct: true, feedback: "Exactly — 'everything else', by definition, has nothing left to check." },
        { text: "Both the if body and the else body run when the condition is True", correct: false, feedback: "Exactly one branch runs — that is the if-else contract, on every execution." },
        { text: "An if/elif chain without a final else crashes when nothing matches", correct: false, feedback: "No match is legal silence: nothing in the chain runs and the program continues normally." },
      ],
      explanation: "else = everything else. No condition, exactly-one-runs, and a missing else means silent fall-through — three facts in one clause.",
    },
    {
      id: "c-as-5",
      prompt: "A bouncer admits you when the condition is `age >= 18 and has_ticket`. Which guest gets in?",
      options: [
        { text: "age 20, has_ticket True", correct: true, feedback: "Correct — and needs every part, and this is the only guest with both." },
        { text: "age 20, has_ticket False", correct: false, feedback: "The ticket half fails, so the whole and is False — no entry." },
        { text: "age 15, has_ticket True", correct: false, feedback: "The age half fails; a ticket cannot rescue a failed and." },
        { text: "age 15, has_ticket False", correct: false, feedback: "Both halves fail — the clearest rejection of all." },
      ],
      explanation: "and demands every side True; one False anywhere makes the whole condition False.",
    },
    {
      id: "c-as-6",
      prompt: "Why does `if day == 'saturday' or 'sunday':` run its body on every single day?",
      options: [
        { text: "Because Python compares day against both strings", correct: false, feedback: "It does not — or does not distribute the comparison; each side stands alone." },
        { text: "Because 'sunday' by itself is a non-empty (truthy) string, so the or is always True", correct: true, feedback: "Exactly — the condition is (day == 'saturday') or ('sunday'), and a truthy string makes the or True every time." },
        { text: "Because or means and in Python", correct: false, feedback: "or means 'at least one' — the bug is about what a bare 'sunday' counts as, not what or means." },
        { text: "It does not — that line is a SyntaxError", correct: false, feedback: "It runs! That is what makes this trap famous: it is legal, quiet, and always True." },
      ],
      explanation: "Bare values next to or are judged truthy or falsy. Repeat the full comparison: day == 'saturday' or day == 'sunday'.",
    },
    {
      id: "c-as-7",
      prompt: "With `x = 0`, what happens when Python reaches `if x != 0 and 10 / x > 2:`?",
      options: [
        { text: "ZeroDivisionError — the division runs", correct: false, feedback: "The division never runs: and short-circuits at the first False operand." },
        { text: "The else branch runs; no crash", correct: true, feedback: "Correct — x != 0 is False, so and stops evaluating and 10 / x is never attempted." },
        { text: "The if body runs", correct: false, feedback: "The first operand is False; and cannot recover from a False side." },
        { text: "SyntaxError — dividing by a variable is illegal", correct: false, feedback: "The syntax is fine; the safety comes from short-circuit evaluation order." },
      ],
      explanation: "Short-circuiting means the guard protects the risky operation — but only when the guard comes first.",
    },
    {
      id: "c-as-8",
      prompt: "You find `if age >= 18:` containing `if member:` containing `if hour >= 22:` — three levels about one entry condition. Which rewrite keeps the meaning and reads best?",
      options: [
        { text: "if age >= 18 and member and hour >= 22:", correct: true, feedback: "One flat line, every requirement visible at once — exactly what and is for." },
        { text: "if age >= 18 or member or hour >= 22:", correct: false, feedback: "or weakens the rule — now ANY single condition is enough to enter." },
        { text: "Keep the nesting — there is no flatter form", correct: false, feedback: "Three stacked conditions with no sub-outcomes of their own is the classic and-flattening case from lesson c-04." },
        { text: "if age >= 18 and member or hour >= 22:", correct: false, feedback: "and binds tighter than or, so the hour check escapes the age requirement — a different rule entirely." },
      ],
      explanation: "When inner branches add no outcomes of their own, merge the conditions with and — flat reads best.",
    },
  ],

  // =====================================================================
  // PART C MINI PROJECT
  // =====================================================================
  project: {
    title: "The Smart Ticket Booth",
    brief:
      "You will build a complete box-office program that prices cinema tickets for a hardcoded group of customers. Each customer brings four facts — name, age, student status, and showtime — and the booth applies age tiers, a student discount, an evening surcharge, and a family discount for groups of 3 or more, then prints an itemized receipt with a grand total. Everything uses Part C tools only: elif chains, logical operators, boolean flags, and f-string money formatting. One honest warning: you will price three customers, so the pricing logic repeats three times. That is deliberate — it plants the seed for functions, which arrive in Part E to fix exactly this pain.",
    requirements: [
      "A commented data block at the top with three customers — four variables each: name, age, student status, showtime (name1, age1, student1, showtime1, and so on)",
      "A base_price variable set to 12.00, used for the standard adult tier",
      "An age-tier if/elif/else per customer: under 3 is free (0.00), ages 3-12 pay 7.00, ages 13-59 pay base_price, and 60 and over pay 8.50",
      "A student discount: when the customer's student flag is True, take 10% off their ticket (price = price * 0.9)",
      "An evening surcharge: when showtime >= 18, add 1.50 — applied AFTER the student discount, for every customer",
      "One receipt line per customer, printed with an f-string showing name, age, student status, and the final ticket price formatted with :.2f",
      "A group discount: when group_size >= 3, take 10% off the subtotal, shown as its own receipt line that explains the family deal",
      "A grand total line and a thank-you line at the end, all money formatted with :.2f, and every pricing rule explained by a short comment",
    ],
    steps: [
      "Step 1 — Create ticket_booth.py, paste the starter, and run it: you should see just the receipt header. That empty run is your baseline.",
      "Step 2 — Price customer 1: write the age-tier if/elif/else that sets price1, then temporarily print price1 alone and check all four tiers by changing age1 (try 2, 8, 39, 63).",
      "Step 3 — Add the student discount (if student1: price1 = price1 * 0.9) and the evening surcharge (if showtime1 >= 18: price1 = price1 + 1.50), re-running after each small change.",
      "Step 4 — Print customer 1's full receipt line with an f-string, then copy-adapt the whole pricing block for customers 2 and 3 (change every 1 to a 2 or a 3). Notice the repetition — Part E's functions will fix exactly this.",
      "Step 5 — Compute subtotal = price1 + price2 + price3 and print it, formatted with :.2f.",
      "Step 6 — Apply the group discount: if group_size >= 3, discount = subtotal * 0.10, otherwise discount = 0. Print a receipt line showing the discount.",
      "Step 7 — Print the grand total (subtotal - discount) and a thank-you line. Run the whole program, then verify by hand: recompute ONE customer's price on paper, then the subtotal and total, and boundary-test one tier edge (age 13, or showtime 18).",
    ],
    starter: `# ============================================================
# THE SMART TICKET BOOTH
# Prices cinema tickets for a hardcoded group of customers.
# Rules: age tiers, student discount, evening surcharge, and a
# family discount for groups of 3 or more.
# ============================================================

# --- The customers (one block of variables each) ---
name1 = "Maya"
age1 = 8
student1 = False
showtime1 = 19

name2 = "Priya"
age2 = 39
student2 = False
showtime2 = 19

name3 = "Rohan"
age3 = 17
student3 = True
showtime3 = 19

# --- Pricing rules ---
base_price = 12.00   # standard adult ticket
group_size = 3       # customers buying together

print("=== CINEMA TICKET RECEIPT ===")

# TODO 1 (customer 1): the age tier sets price1:
#   under 3        -> 0.00 (free)
#   3 through 12   -> 7.00
#   13 through 59  -> base_price
#   60 and over    -> 8.50
# TODO 2: if student1, take 10% off price1 (price1 = price1 * 0.9)
# TODO 3: if showtime1 >= 18, add 1.50
# TODO 4: print(f"{name1} (age {age1}), student: {student1} - ticket: {price1:.2f}")

# TODO 5-8: repeat the same four steps for customer 2 (price2) and
# customer 3 (price3). Yes, it repeats - functions arrive in Part E.

# TODO 9: subtotal = price1 + price2 + price3; print it with :.2f

# TODO 10: family discount - if group_size >= 3, discount = subtotal * 0.10,
# else discount = 0. Print a receipt line showing the discount.

# TODO 11: grand total = subtotal - discount; print it, then a thank-you line.
`,
    concepts: ["if/elif/else chains", "logical operators", "boolean flags", "f-string money formatting", "receipt printing"],
    extension:
      "Add a VIP loyalty tier: a vip1/vip2/vip3 boolean flag per customer. VIPs get 15% off instead of the 10% student discount — apply only the BIGGER of the two when both apply, never both — and their receipt lines end with '(VIP)'. Hint: when a customer is both a VIP and a student, compare the two discounts with an if/elif before applying one; the evening surcharge keeps running for everyone.",
  },
};
