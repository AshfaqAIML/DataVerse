/**
 * PART D — LOOPS
 *
 * The engine of scale: for loops over collections, while loops over
 * conditions, range() as the number factory, break and continue as the
 * early exits, nested loops as grids, and the classic pattern problems
 * (ending with FizzBuzz) that turn loop knowledge into loop fluency.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 */
import type { Part } from "@/lib/course/types";

export const PART_D: Part = {
  letter: "D",
  title: "Loops",
  tagline: "Doing it a thousand times without writing it a thousand times",
  description: "for loops, while loops, range(), break, continue, nested loops, and classic pattern problems that build real loop fluency.",
  lessons: [
    // ------------------------------------------------------------- d-01
    {
      slug: "d-01",
      title: "For Loops",
      minutes: 14,
      summary:
        "Meet the for loop: Python's way of saying 'do this once for every item' — over lists, over strings, one lap per item, traced lap by lap.",
      kind: "concept",
      objectives: [
        "Write a for loop over a list and over a string",
        "Name the four pieces of the for line: for, the loop variable, in, the collection",
        "Trace a loop iteration by iteration using a trace table",
        "Predict how many times a loop body will run before you run it",
      ],
      why: "Copying and pasting the same line five times is not programming — it is typing. The moment you need to greet 40 users, price 40,000 items, or check every reading from a sensor, copy-paste collapses: it is slow to write, slow to change, and one missed edit leaves your data half-processed. The for loop deletes all of that. You describe the work once, and Python repeats it once per item. Nearly every program you will ever read contains at least one for loop — this is the single most used structure in Python.",
      blocks: [
        {
          kind: "text",
          text: "Suppose three friends just joined your app and you want to welcome each one by name. With everything you know so far, there is only one way to do it — write every line by hand:",
        },
        {
          kind: "code",
          title: "The no-loop way: three copies of the same idea",
          code: `print("Hello, Ada")
print("Hello, Grace")
print("Hello, Linus")
`,
          output: `Hello, Ada
Hello, Grace
Hello, Linus`,
          explain: [
            "Three lines is fine. Now imagine 40 friends — or 40,000 readings from a sensor, which is a normal Tuesday in data work.",
            "Worse: if you decide 'Hello' should become 'Welcome back', you must edit every pasted line, and the moment you miss one, your data is half-updated. This does not scale.",
          ],
        },
        {
          kind: "heading",
          text: "The for loop: write it once, run it once per item",
        },
        {
          kind: "code",
          title: "The same greetings, as a loop",
          code: `friends = ["Ada", "Grace", "Linus"]
for friend in friends:
    print("Hello,", friend)
`,
          output: `Hello, Ada
Hello, Grace
Hello, Linus`,
          outputNote: "Identical output to the three hand-written lines — from two lines of code that scale to any list size.",
          explain: [
            "Line 1 creates a **list** — a row of values in square brackets. Lists get their full story in Part E; today you only need to read them.",
            "Line 2 says: for each item in `friends`, put it in a variable called `friend`, and run the indented body below.",
            "The body (line 3) runs three times: once with `friend` holding `\"Ada\"`, once with `\"Grace\"`, once with `\"Linus\"`. Three greetings, and if the list had 40,000 names it would still be these two lines.",
          ],
        },
        {
          kind: "visual",
          title: "A for loop is a conveyor belt",
          ascii: `   THE LIST  (a conveyor belt, one item per slot)

   +--------+   +---------+   +--------+
   | "Ada"  |   | "Grace" |   | "Linus"|
   +--------+   +---------+   +--------+
        |            |             |
        v            v             v      each item lands in 'friend'
   +------------------------------------+
   |   print("Hello,", friend)          |   <- the BODY: runs once
   |                                    |      per item, in order
   +------------------------------------+
`,
          caption:
            "Python walks the belt left to right. Each item drops into the loop variable, the body runs, then the next item arrives.",
        },
        {
          kind: "text",
          text: "The best way to read a for line is out loud: **for each friend in friends, print hello to friend**. Python's `for` is really a *for each* — you never count items yourself, you just name the collection and let Python hand them out. The variable `friend` is called the **loop variable**: it is a normal variable (you can print it, measure it, compare it), but Python re-fills it on every lap.",
        },
        {
          kind: "table",
          title: "Anatomy of the for line",
          headers: ["Piece", "In our loop", "What it is"],
          rows: [
            ["Keyword", "for", "Starts the loop. Always spelled exactly like this."],
            ["Loop variable", "friend", "A fresh name you choose — it receives the current item on each lap."],
            ["Keyword", "in", "Connects the variable to the collection. Always written in."],
            ["The collection", "friends", "The list (or string) being walked, item by item."],
            ["Colon", ":", "Opens the body — exactly like the if lines you met in Part C."],
          ],
          caption:
            "The body is the indented block under the line. Indentation still means 'this line belongs to the structure above' — the same rule as if.",
        },
        {
          kind: "heading",
          text: "Strings are collections too",
        },
        {
          kind: "code",
          title: "Looping over text",
          code: `for letter in "hey":
    print(letter)
`,
          output: `h
e
y`,
          explain: [
            "A string is a sequence of characters, and a for loop walks it exactly like a list — one character per lap, left to right.",
            "The body ran three times — once per character. With `letter` holding `\"h\"`, then `\"e\"`, then `\"y\"`.",
            "This is your first text-processing tool: to visit every character of any text (counting vowels, hunting for a symbol), loop over the string.",
          ],
        },
        {
          kind: "heading",
          text: "Watch a loop, lap by lap",
        },
        {
          kind: "text",
          text: "The skill that separates people who guess from people who know is **tracing**: predicting each lap before it happens. Here is a loop with a counter that grows as it packs a cart:",
        },
        {
          kind: "code",
          title: "A loop you can trace",
          code: `cart = ["mug", "book", "pen"]
packed = 0
for item in cart:
    packed = packed + 1
    print("packing", item, "- packed", packed)
`,
          output: `packing mug - packed 1
packing book - packed 2
packing pen - packed 3`,
          explain: [
            "`packed` starts at 0 **before** the loop. On each lap, `packed = packed + 1` takes the old value, adds 1, and stores it back — so it counts laps.",
            "This is your first taste of the **accumulator pattern**: a variable born before a loop, updated inside it, holding a total when it ends. Lesson d-03 turns it into a full tool.",
          ],
        },
        {
          kind: "table",
          title: "The trace table for the packing loop",
          headers: ["Iteration", "item", "packed after the update", "Line printed"],
          rows: [
            ["1", "mug", "1", "packing mug - packed 1"],
            ["2", "book", "2", "packing book - packed 2"],
            ["3", "pen", "3", "packing pen - packed 3"],
          ],
          caption:
            "Three items in, three laps out. If you can fill a table like this by hand, no loop will ever surprise you.",
        },
        {
          kind: "code",
          title: "What is left in the loop variable after the loop?",
          code: `for n in [10, 20, 30]:
    last = n
print("the last value the loop variable held was", last)
`,
          output: `the last value the loop variable held was 30`,
          explain: [
            "The loop ran three laps, and on the final lap `n` (copied into `last`) held 30. After the loop, that value is still sitting there — **the loop variable lives on after the loop**, which is occasionally useful and occasionally a surprise.",
            "The loop itself is long gone — but variables it filled keep their last contents.",
          ],
        },
        {
          kind: "code",
          title: "Two classic loop syntax errors",
          expectError: "SyntaxError: expected ':'",
          code: `for friend in ["Ada", "Grace"]
    print("Hello,", friend)
`,
          explain: [
            "The colon is missing, and Python refuses to run *anything*: `SyntaxError: expected ':'`, with the caret pointing at the end of the for line. From Part A you know what that means — the grammar is broken, so the program never started.",
            "The other classic is forgetting to indent the body, which fails before running too: `IndentationError: expected an indented block after 'for' statement on line 1`.",
          ],
        },
        {
          kind: "tryIt",
          title: "Make the greeting loop yours",
          task: "Add your own name inside the list (keep the quotes and the comma), then change the greeting from 'Hello,' to 'Welcome back,'. Finally, add a second line to the loop body that prints how many letters the name has: print('letters:', len(friend)).",
          code: `friends = ["Ada", "Grace", "Linus"]
for friend in friends:
    print("Hello,", friend)
`,
          hint: "The body is both indented lines now — everything indented under the for line runs once per friend. len(friend) counts the characters in the current name.",
        },
      ],
      terms: [
        { term: "Loop", definition: "A structure that repeats a block of code. The for loop repeats its body once per item in a collection." },
        { term: "Iteration", definition: "One pass through a loop's body — one 'lap'. A three-item list gives the body three iterations." },
        { term: "Loop variable", definition: "The variable in the for line that receives the current item on each iteration (friend, item, letter)." },
        { term: "Loop body", definition: "The indented lines under the loop line — the code that repeats on every iteration." },
        { term: "Collection", definition: "Anything Python can hand out item by item. So far: lists and strings." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the colon at the end of the for line.",
          why: "Python expects a block to start, and a block always opens with a colon. Without it you get SyntaxError: expected ':' and nothing runs.",
          fix: "Every line that starts a block (for, while, if, elif, else) ends with a colon.",
        },
        {
          mistake: "Forgetting to indent the loop body.",
          why: "Python uses indentation to know which lines belong to the loop. A body at the same level as the for line raises IndentationError: expected an indented block after 'for' statement.",
          fix: "Indent the body 4 spaces — the same rule you already follow for if bodies from Part C.",
        },
        {
          mistake: "Using a different variable name in the body than in the for line: for friend in friends: followed by print(name).",
          why: "The loop variable is exactly the name you wrote between for and in. A name you invented later, like name, was never created — NameError.",
          fix: "Write the loop variable once in the for line and reuse that exact spelling in the body.",
        },
      ],
      takeaways: [
        "A for loop runs its body once per item: for each item in the collection, do the body.",
        "Python's for is really 'for each' — you name the collection, Python hands out the items.",
        "Strings are collections too: a for loop visits every character, left to right.",
        "The loop variable is filled fresh on every lap, and it keeps the last item after the loop ends.",
        "Trace tables turn loops from mystery into arithmetic: one row per lap, no surprises.",
      ],
      quiz: [
        {
          id: "d-01-q1",
          prompt: "friends = [\"Ada\", \"Grace\", \"Linus\"] — how many times does the body of 'for friend in friends:' run?",
          options: [
            { text: "3", correct: true, feedback: "Correct — one lap per item, and the list has three items." },
            { text: "1", correct: false, feedback: "The body repeats — a for loop is not an if. Three items means three laps." },
            { text: "4", correct: false, feedback: "Count the items, not the lines: three names, three laps." },
          ],
          explanation: "A for loop over a collection runs its body exactly once per item — three items, three laps.",
        },
        {
          id: "d-01-q2",
          prompt: "On the second iteration of 'for letter in \"code\":', what does the loop variable letter hold?",
          options: [
            { text: "\"o\"", correct: true, feedback: "Right — characters are handed out left to right, so lap 2 gets the second character." },
            { text: "\"c\"", correct: false, feedback: "That is lap 1. Each lap moves one character to the right." },
            { text: "\"code\"", correct: false, feedback: "The whole string is the collection; the loop variable receives one character per lap." },
          ],
          explanation: "Looping over a string visits one character per iteration, in order: c, then o, then d, then e.",
        },
        {
          id: "d-01-q3",
          prompt: "You write 'for x in [1, 2]' but forget the colon. What happens?",
          options: [
            { text: "SyntaxError: expected ':' — and nothing in the file runs", correct: true, feedback: "Exactly. A missing colon is a grammar error; Python stops before executing a single line." },
            { text: "The loop runs but prints nothing", correct: false, feedback: "Nothing runs — syntax errors stop the whole program before it starts." },
            { text: "NameError, because x is not defined", correct: false, feedback: "NameError is a runtime error; you never get that far. The grammar fails first." },
          ],
          explanation: "Blocks open with a colon. Forget it and Python raises SyntaxError before running anything.",
        },
      ],
    },

    // ------------------------------------------------------------- d-02
    {
      slug: "d-02",
      title: "While Loops",
      minutes: 15,
      summary:
        "The while loop: a repeating if that keeps running its body as long as a condition stays True — the counter pattern, the gate, and the infinite-loop danger.",
      kind: "concept",
      objectives: [
        "Write a while loop using the four-part counter pattern",
        "Explain exactly when the condition is checked: before every lap",
        "Recognize an infinite loop and defuse one with break",
        "Choose between while and for with a clear rule",
      ],
      why: "A for loop needs something to loop over — a list, a string, a count you already know. But some repetition has no list attached: keep asking until the answer is valid, keep playing until the battery dies, keep withdrawing until the account is empty. The while loop repeats as long as a condition holds, which makes it the loop for open-ended work — and also the loop that can trap your program forever if you forget to change the condition. Understanding while means understanding both powers at once.",
      blocks: [
        {
          kind: "text",
          text: "You already think in while loops every day: *while the kettle is boiling, wait. While you are hungry, eat. While the light is red, stop.* Notice the shape — a condition, and an action that repeats for as long as it holds. In Part C you met `if`, which checks a condition **once**. The `while` loop is an if that checks the same condition again, and again, and again — a **repeating if**.",
        },
        {
          kind: "heading",
          text: "while: a repeating if",
        },
        {
          kind: "code",
          title: "A rocket countdown",
          code: `seconds = 3
while seconds > 0:
    print(seconds)
    seconds = seconds - 1
print("Liftoff!")
`,
          output: `3
2
1
Liftoff!`,
          explain: [
            "Line 1 sets the starting value. Line 2 is the gate: `seconds > 0` — True or False?",
            "Lap 1: True, so the body runs — print 3, then subtract 1 (seconds is now 2). Check again: True. Print 2, subtract (now 1). Check: True. Print 1, subtract (now 0).",
            "Check again: `0 > 0` is False. The loop ends, and Python jumps to the first line after it: Liftoff!",
            "The body ran exactly 3 times — but nobody wrote '3' anywhere as a count. The condition decided.",
          ],
        },
        {
          kind: "visual",
          title: "The gate, and where it stands",
          ascii: `                     +----------------+
     seconds = 3 -->|  seconds > 0 ? |  <-- THE GATE
                     +-------+--------+
                        True |    False
                    +---------+   +------------------------+
                    v                                  v
             +---------------+              (skip the loop entirely;
             |  print(sec)   |                run the lines AFTER it)
             |  sec = sec-1  |
             +-------+-------+                     |
                     |                             |
                     +-----> back to the gate ---->+
`,
          caption:
            "The gate is checked BEFORE every lap — never during, never after. If it is False from the very first check, the body runs zero times.",
        },
        {
          kind: "text",
          text: "Burn this in: **the condition is checked before every lap**. If it is False right away, the body never runs at all — not even once. That is sometimes exactly what you want ('while the file is open, read it' — no file, no reading), and sometimes a bug you will chase for an hour.",
        },
        {
          kind: "heading",
          text: "The counter pattern: four moving parts",
        },
        {
          kind: "table",
          title: "Every counted while loop has these four parts",
          headers: ["Part", "In the countdown", "What goes wrong without it"],
          rows: [
            ["1. Initialize", "seconds = 3", "NameError: the gate tries to read a variable that was never created."],
            ["2. Test (the gate)", "while seconds > 0:", "A wrong test means too many or too few laps — or zero laps."],
            ["3. Body", "print(seconds)", "The work that repeats, indented under the while line."],
            ["4. Update", "seconds = seconds - 1", "Forget this and the condition never changes... you will see what happens below."],
          ],
          caption:
            "Miss any one of the four and the loop misbehaves in a predictable way. Debugging a while loop means checking all four, in this order.",
        },
        {
          kind: "heading",
          text: "One more, traced: the pizza box",
        },
        {
          kind: "code",
          title: "A while loop that eats",
          code: `pizza_slices = 4
while pizza_slices > 0:
    print("munch -- slices left after this one:", pizza_slices - 1)
    pizza_slices = pizza_slices - 1
print("box empty")
`,
          output: `munch -- slices left after this one: 3
munch -- slices left after this one: 2
munch -- slices left after this one: 1
munch -- slices left after this one: 0
box empty`,
          explain: [
            "Four laps: the gate was True for 4, 3, 2, 1, and False for 0.",
            "The body both *uses* the counter (`pizza_slices - 1` to report what will be left) and *updates* it — reading and writing the same variable inside a loop is completely normal.",
          ],
        },
        {
          kind: "table",
          title: "Trace table for the pizza loop",
          headers: ["Gate check", "pizza_slices", "True or False?", "What happens"],
          rows: [
            ["1", "4", "True", "Body runs: prints 'slices left: 3', then pizza_slices becomes 3"],
            ["2", "3", "True", "Body runs: prints 'slices left: 2', pizza_slices becomes 2"],
            ["3", "2", "True", "Body runs: prints 'slices left: 1', pizza_slices becomes 1"],
            ["4", "1", "True", "Body runs: prints 'slices left: 0', pizza_slices becomes 0"],
            ["5", "0", "False", "Loop ends. The line after it runs: 'box empty'"],
          ],
          caption:
            "Five gate checks, four laps. The last check is the one that says 'no' — every healthy while loop has this final False moment.",
        },
        {
          kind: "heading",
          text: "The infinite-loop danger",
        },
        {
          kind: "text",
          text: "Now delete one line from the countdown — the update. `seconds` stays 3 forever, the gate `seconds > 0` stays True forever, and the loop runs forever. That is an **infinite loop**: the program appears frozen, the fan spins up, and nothing new ever prints. The most extreme version is `while True:` — a condition that can never be False. And yet programmers write `while True:` every day on purpose — because `break` (next lesson) can bail out of it. Here is the safe way to meet both ideas at once:",
        },
        {
          kind: "code",
          title: "while True, defused with break",
          code: `attempt = 1
while True:
    print("attempt", attempt)
    if attempt == 3:
        print("worked -- breaking out before this becomes an infinite loop")
        break
    attempt = attempt + 1
`,
          output: `attempt 1
attempt 2
attempt 3
worked -- breaking out before this becomes an infinite loop`,
          explain: [
            "The gate is always True, so the loop would never end on its own. The `break` line is the emergency exit: when `attempt == 3`, break fires and the loop ends immediately.",
            "`while True:` plus a break inside is a real, professional pattern — game loops, menus, 'keep asking until valid' — always with a clear exit condition inside the body.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "If you ever DO run one",
          text: "It will happen — everyone launches an infinite loop eventually. It is not dangerous: in this course's browser playground, any run is stopped automatically after 20 seconds and you just fix the code. In a terminal, press Ctrl+C (the interruption is even called KeyboardInterrupt in the traceback). The real rule: never leave one in a saved program — on someone else's machine there is no auto-stop.",
        },
        {
          kind: "table",
          title: "while or for: which loop do I reach for?",
          headers: ["You are repeating...", "Reach for", "Why"],
          rows: [
            ["over items you already have (a list, a string)", "for", "'For each item' says exactly what you mean — no counter to initialize or forget."],
            ["until a count you know (exactly 10 times)", "for + range(10)", "The count lives in the code; you cannot forget to update anything."],
            ["until a condition changes, and you cannot know how many laps", "while", "while is built for open-ended repetition: until the battery dies, until the answer is valid."],
            ["forever, with a deliberate exit inside", "while True + break", "The professional 'menu/game loop' shape — as long as the break is really there."],
          ],
          caption:
            "Rule of thumb: for when you know what you are looping over, while when you only know when to stop.",
        },
        {
          kind: "tryIt",
          title: "Bend the countdown",
          task: "Change the starting value from 3 to 5 and run it. Then make it count UP instead: print 1, 2, 3, 4, 5 and then 'Go!' — start the counter at 1, test countdown <= 5, and update with + 1.",
          code: `countdown = 3
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Go!")
`,
          hint: "Counting up needs all four parts rethought: initialize to 1, gate at countdown <= 5, update with countdown = countdown + 1. The gate still gets checked before every lap.",
        },
      ],
      terms: [
        { term: "while loop", definition: "A loop that repeats its body as long as its condition is True, checking the condition before every lap." },
        { term: "Loop condition", definition: "The True/False test in the while line — the gate that decides whether another lap happens." },
        { term: "Counter pattern", definition: "The four-part while loop: initialize a counter, test it in the gate, run the body, update the counter." },
        { term: "Infinite loop", definition: "A loop whose condition never becomes False, so it repeats forever. Defused with break (or Ctrl+C in a terminal)." },
        { term: "break", definition: "A keyword that exits the loop immediately, jumping to the first line after it. Full treatment in lesson d-04." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the update line inside the body.",
          why: "The condition never changes, so the gate never says False — the program is stuck in an infinite loop and appears frozen.",
          fix: "Check all four parts of the counter pattern: initialize, test, body, update. The update must change something the test reads.",
        },
        {
          mistake: "Expecting the condition to be checked during the lap.",
          why: "The gate is only checked between laps. If the counter crosses the limit mid-body, the current lap still finishes — one extra lap can run.",
          fix: "Trace with a table: write the gate check, then the lap, then the next gate check. Off-by-one laps become visible.",
        },
        {
          mistake: "Using while for a known count: i = 0 / while i < 3: ... i = i + 1 when a for loop would do.",
          why: "It works, but you hand-manage a counter that for + range manages for you — two extra places to make mistakes.",
          fix: "If you know what you are looping over or how many times, use for. Save while for 'until a condition changes'.",
        },
      ],
      takeaways: [
        "while is a repeating if: check the gate, run the body, check the gate again.",
        "The gate is checked BEFORE every lap — a False first check means zero laps.",
        "Every counted while loop has four parts: initialize, test, body, update. Debug in that order.",
        "Forget the update and you get an infinite loop: defuse with break, stop with Ctrl+C in a terminal.",
        "for when you know what you are looping over; while when you only know when to stop.",
      ],
      quiz: [
        {
          id: "d-02-q1",
          prompt: "seconds = 2, then 'while seconds > 0:' with body 'print(seconds)' and 'seconds = seconds - 1', then 'print(\"Go!\")' after the loop. How many times does the body run?",
          options: [
            { text: "2", correct: true, feedback: "Correct — the gate is True for 2 and 1, False for 0. Two laps." },
            { text: "3", correct: false, feedback: "Count the True gate checks only: 2 and 1 pass, 0 fails. Two laps, then Go!." },
            { text: "0", correct: false, feedback: "The very first check is 2 > 0, which is True — the body definitely runs." },
          ],
          explanation: "Trace the gate: 2 (True, lap), 1 (True, lap), 0 (False, exit). Two laps, then the line after the loop.",
        },
        {
          id: "d-02-q2",
          prompt: "When is a while condition checked?",
          options: [
            { text: "Before every lap — never in the middle of one", correct: true, feedback: "Exactly. The gate stands at the top of the loop; each lap must exit the gate before the next check." },
            { text: "After every lap, to decide whether to repeat", correct: false, feedback: "That is a do-while loop from other languages — Python does not have one. The check comes first." },
            { text: "Only once, when the loop starts", correct: false, feedback: "Once would make it an if. The whole point of while is re-checking between laps." },
          ],
          explanation: "The condition is re-evaluated before each lap — so a False at the start means the body never runs at all.",
        },
        {
          id: "d-02-q3",
          prompt: "Your program freezes and prints nothing new, forever. Which while-loop part is most likely missing?",
          options: [
            { text: "The update — the condition never changes", correct: true, feedback: "The classic infinite loop: the gate reads a variable that nothing inside the body ever changes." },
            { text: "The print — output is missing", correct: false, feedback: "A missing print just means silence, not a frozen program. The loop itself still ends." },
            { text: "The colon — a syntax error", correct: false, feedback: "A missing colon stops the program before it starts. Freezing mid-run means it started — and never stopped." },
          ],
          explanation: "A frozen program is an infinite loop: check the four parts, and the missing one is almost always the update.",
        },
      ],
    },

    // ------------------------------------------------------------- d-03
    {
      slug: "d-03",
      title: "The range() Function",
      minutes: 16,
      summary:
        "range() is the number factory: range(stop), range(start, stop), range(start, stop, step), counting down, looping by index, and the accumulator pattern for sums and averages.",
      kind: "concept",
      objectives: [
        "Write range(stop), range(start, stop), and range(start, stop, step) from memory",
        "Predict exactly which numbers a range hands out — including the off-by-one traps",
        "Choose between looping by index with range(len(...)) and looping directly",
        "Build sum, count, and average with the accumulator pattern",
      ],
      why: "A for loop needs something to loop over — but 'the numbers from 1 to 100' is not a list you want to type by hand. range() manufactures the numbers on demand, and once you have it, every counted repetition in Python opens up: process rows 0 through 99, run 1,000 simulations, walk a countdown backwards. Along the way you will meet the accumulator pattern — a variable born before the loop, grown inside it — which is how programs sum prices, count votes, and average temperatures. It reappears in every later part of this course.",
      blocks: [
        {
          kind: "text",
          text: "Loops so far needed a collection you could point at — a list of friends, a string of letters. But suppose you need the numbers 1 through 100. Typing `[1, 2, 3, ... 100]` by hand is absurd. **`range()`** is the fix: a built-in function that manufactures numbers on demand, handing them to the loop one at a time.",
        },
        {
          kind: "heading",
          text: "range(): a factory that hands out numbers",
        },
        {
          kind: "code",
          title: "Meeting range in the REPL",
          lang: "repl",
          code: `>>> range(5)
range(0, 5)
>>> list(range(5))
[0, 1, 2, 3, 4]
>>> list(range(2, 6))
[2, 3, 4, 5]
>>> list(range(0, 10, 3))
[0, 3, 6, 9]
>>> list(range(5, 0, -1))
[5, 4, 3, 2, 1]
`,
          outputNote:
            "Each >>> line is you asking; the line under it is Python's answer. Run these yourself in any REPL — change the numbers and watch.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "How to read that transcript",
          text: "range(0, 5) is a *promise*, not a pile — it does not build a list; it hands numbers to a loop one at a time, which is why loops over range(1000000) are cheap. `list(range(5))` pours the whole thing out at once so you can look at it — list() gets its full story in Part E. In real programs you almost always feed a range straight into a for loop.",
        },
        {
          kind: "heading",
          text: "range(stop): counting from zero — and the off-by-one",
        },
        {
          kind: "code",
          title: "Four laps from range(4)",
          code: `for i in range(4):
    print("lap", i)
`,
          output: `lap 0
lap 1
lap 2
lap 3`,
          explain: [
            "Four laps — but they are numbered **0, 1, 2, 3**, not 1, 2, 3, 4. With only a stop value, range always starts at 0.",
            "The stop value 4 itself is *never handed out*. range(4) means: start at 0, stop before 4. This is the single most common source of beginner loop bugs — the **off-by-one error** — so the next diagram is worth a long look.",
          ],
        },
        {
          kind: "visual",
          title: "The stop value is a fence, not a post",
          ascii: `        start                          stop
          |       |       |       |       |
          v       v       v       v       v
          1       2       3       4       5      6
        first                           last    THE FENCE
        handed out                      out     (never reached)

        range(1, 6)  hands out:  1  2  3  4  5      (five numbers)
`,
          caption:
            "Think of fence posts: range(1, 6) builds a fence from post 1 to post 6. The numbers you get are the posts you pass — the stop post is where you stop, not something you pick up.",
        },
        {
          kind: "heading",
          text: "range(start, stop) and range(start, stop, step)",
        },
        {
          kind: "code",
          title: "Starting somewhere else",
          code: `for n in range(1, 6):
    print(n, "squared is", n * n)
`,
          output: `1 squared is 1
2 squared is 4
3 squared is 9
4 squared is 16
5 squared is 25`,
          explain: [
            "Now the laps are numbered 1 through 5 — a start value of 1 and a stop of 6 (still never reached).",
            "Rule: the numbers you get are start, start+1, ..., up to but not including stop.",
          ],
        },
        {
          kind: "code",
          title: "Steps — including backwards ones",
          code: `print("Counting down...")
for n in range(10, 0, -2):
    print(n)
print("Go!")
`,
          output: `Counting down...
10
8
6
4
2
Go!`,
          explain: [
            "The third number is the **step**: how far to jump each lap. A step of -2 walks *backwards* by twos: 10, 8, 6, 4, 2 — and stops before 0.",
            "A countdown is just a range with a negative step. No while loop needed when you know the numbers in advance.",
          ],
        },
        {
          kind: "text",
          text: "Sometimes you genuinely need the *position* — '1st, 2nd, 3rd' — and the classic beginner move is `range(len(collection))`, which produces every index: 0, 1, 2, ... It works. But compare it with looping directly:",
        },
        {
          kind: "code",
          title: "Two ways to walk a list",
          code: `winners = ["Ada", "Grace", "Mary"]

# by index: works, but noisier
for i in range(len(winners)):
    print(i + 1, "-", winners[i])

print("---")

# directly: Python's for is really "for each"
for name in winners:
    print("-", name)
`,
          output: `1 - Ada
2 - Grace
3 - Mary
---
- Ada
- Grace
- Mary`,
          explain: [
            "The index version needs `i + 1` for human numbering (positions start at 0 — Part B), and `winners[i]` to fetch the item — two extra places to be off by one.",
            "The direct version asks for exactly what it wants: each name. Default to direct looping; reach for `range(len(...))` only when the position number itself matters.",
          ],
        },
        {
          kind: "heading",
          text: "The accumulator pattern",
        },
        {
          kind: "code",
          title: "Summing 100 numbers you never typed",
          code: `total = 0
for n in range(1, 101):
    total = total + n
print("1 + 2 + ... + 100 =", total)
`,
          output: `1 + 2 + ... + 100 = 5050`,
          explain: [
            "`total` is an **accumulator**: born at 0 *before* the loop, and each lap adds one more number to whatever it already holds. 100 laps later it holds 5,050 — the answer a young Gauss famously computed in seconds with a clever trick; the loop just grinds it out honestly in a blink.",
            "The single most important detail is the birthplace: **before** the loop. Born inside the loop, it would reset to 0 on every lap (you will debug that exact bug in exercise d-i3).",
          ],
        },
        {
          kind: "code",
          title: "Count and average: two accumulators at once",
          code: `total = 0
count = 0
for n in [12, 8, 15, 4]:
    total = total + n
    count = count + 1
average = total / count
print("count:", count)
print("total:", total)
print(f"average: {average:.2f}")
`,
          output: `count: 4
total: 39
average: 9.75`,
          explain: [
            "Two accumulators, grown in the same lap: `total` collects the values, `count` counts the laps. Divide one by the other *after* the loop and you have the average.",
            "`{average:.2f}` is an f-string **format spec**: 'show this number with exactly 2 decimals'. 39 / 4 is 9.75, so the .2f shows 9.75 — a value like 9.5 would print as 9.50. You will use this constantly for tidy reports.",
          ],
        },
        {
          kind: "tryIt",
          title: "The range playground",
          task: "Make the loop print 3, 4, 5, 6, 7 (one per line) with range(3, 8). Then make it count down 10 to 1 with range(10, 0, -1). Then every third number 0, 3, 6, 9 with range(0, 10, 3). Predict each run BEFORE you press the button.",
          code: `print("range(5):")
for i in range(5):
    print(i)
`,
          hint: "Three knobs only: start, stop (never included), step. Counting down needs a negative step; remember the stop number itself never prints.",
        },
      ],
      terms: [
        { term: "range()", definition: "A built-in function that manufactures a sequence of integers for a loop: range(stop), range(start, stop), range(start, stop, step)." },
        { term: "Step", definition: "The third argument of range(): how far the numbers jump each lap. Negative steps count down." },
        { term: "Off-by-one error", definition: "The classic bug of getting one number too many or too few — usually from forgetting that range's stop value is never included." },
        { term: "Accumulator", definition: "A variable born before a loop and updated on every lap to build up a result: a total, a count, a longest string." },
        { term: "Format spec", definition: "The part after the colon inside an f-string placeholder: {average:.2f} means 'two decimals', {value:>4} means 'right-align in 4 characters'." },
      ],
      mistakes: [
        {
          mistake: "Writing range(1, 5) expecting the numbers 1 through 5.",
          why: "The stop value is a fence, not a post: range(1, 5) hands out 1, 2, 3, 4 — four numbers, never 5.",
          fix: "Need 1 through 5 inclusive? Write range(1, 6): stop one *past* the last number you want.",
        },
        {
          mistake: "Writing range(5, 0) expecting a countdown from 5 to 1.",
          why: "With the default step of +1, going from 5 toward 0 means moving backwards — so the range is empty and the loop body runs zero times.",
          fix: "Counting down needs a negative step: range(5, 0, -1) hands out 5, 4, 3, 2, 1.",
        },
        {
          mistake: "Initializing the accumulator inside the loop body.",
          why: "total = 0 reborn on every lap throws away everything collected so far — the final 'total' is just the last item.",
          fix: "Accumulators are born before the loop, grown inside it, and read after it.",
        },
      ],
      takeaways: [
        "range() manufactures numbers so loops never need a hand-typed list.",
        "The stop value is never included: range(1, 6) is 1, 2, 3, 4, 5.",
        "Negative steps count down: range(10, 0, -2) is 10, 8, 6, 4, 2.",
        "Loop directly over items when you can; use range(len(...)) only when the position number itself matters.",
        "Accumulators: born before the loop, grown each lap, read after it — sum, count, average all follow this shape.",
      ],
      quiz: [
        {
          id: "d-03-q1",
          prompt: "Which numbers does range(3, 7) hand out?",
          options: [
            { text: "3, 4, 5, 6", correct: true, feedback: "Right — start at 3, stop before 7. Four numbers." },
            { text: "3, 4, 5, 6, 7", correct: false, feedback: "The stop value 7 is the fence — you stop before it, you never pick it up." },
            { text: "0, 1, 2, 3, 4, 5, 6", correct: false, feedback: "The start value 3 overrides the default 0 — the sequence begins at 3." },
          ],
          explanation: "range(3, 7) starts at 3 and stops before 7: the numbers 3, 4, 5, 6.",
        },
        {
          id: "d-03-q2",
          prompt: "How many times does the body of 'for i in range(1, 10, 2):' run?",
          options: [
            { text: "5", correct: true, feedback: "Correct: 1, 3, 5, 7, 9 — five odd numbers, stopping before 10." },
            { text: "10", correct: false, feedback: "That would be range(10) territory. The step of 2 halves the laps." },
            { text: "4", correct: false, feedback: "Close — count again: 1, 3, 5, 7, 9 is five numbers." },
          ],
          explanation: "range(1, 10, 2) hands out 1, 3, 5, 7, 9 — five laps, one per number.",
        },
        {
          id: "d-03-q3",
          prompt: "total = 0, then 'for i in range(4): total = total + i'. What is total after the loop?",
          options: [
            { text: "6", correct: true, feedback: "Correct — the laps add 0, then 1, then 2, then 3: 0+1+2+3 = 6." },
            { text: "10", correct: false, feedback: "That is 1+2+3+4 — but range(4) starts at 0 and stops before 4." },
            { text: "4", correct: false, feedback: "That is the count of laps, not the sum of the values. Trace it: 0, 1, 2, 3 get added." },
          ],
          explanation: "range(4) is 0, 1, 2, 3 — and their sum is 6, not 10. Starting at zero is the off-by-one trap in the flesh.",
        },
      ],
    },

    // ------------------------------------------------------------- d-04
    {
      slug: "d-04",
      title: "Break",
      minutes: 13,
      summary:
        "break exits a loop immediately: search patterns that stop at the first match, break inside while and for loops, and the for...else construct that runs only when no break happened.",
      kind: "concept",
      objectives: [
        "Use break to exit a for or while loop at the first match",
        "Write the find-the-first search pattern and trace it",
        "Explain what happens to the rest of the collection after a break",
        "Read a for...else loop and say when its else runs",
      ],
      why: "Searching a list of a million prices for the first one over 100 is instant — if you stop at the first match. Without break, your loop keeps working through the other 999,996 items for nothing. break is how loops say 'done here'. It powers the find-the-first search, the while True menu loop from the last lesson, and — with for...else — the cleanest way to answer the follow-up question every search raises: did we find one at all? These patterns appear in every real program you will write.",
      blocks: [
        {
          kind: "text",
          text: "You have met a search before: loop over the items, check each one with an if. But notice what a plain loop does after the match — it keeps going. It re-checks every remaining item even though the question ('is there an expensive one?') was already answered. It is like checking every apartment buzzer in the building after somebody already opened the door. **`break`** is the fix: exit the loop *now*.",
        },
        {
          kind: "heading",
          text: "break: the emergency exit",
        },
        {
          kind: "code",
          title: "Find the first expensive item — then stop",
          code: `prices = [5, 12, 9, 250, 300, 8]
for price in prices:
    if price > 100:
        print("first expensive item costs", price)
        break
print("search finished")
`,
          output: `first expensive item costs 250
search finished`,
          explain: [
            "Items 5, 12, 9 fail the test — no break, next lap. Item 250 passes: the print runs, then `break` fires and the loop ends *immediately*.",
            "Items 300 and 8 are never even looked at. The loop is over; execution jumps to the first line after the loop ('search finished').",
            "Without break, this same program would print the message twice — once for 250 and once for 300 — because the question was 'first', not 'all'.",
          ],
        },
        {
          kind: "table",
          title: "Trace table for the search",
          headers: ["Iteration", "price", "price > 100?", "What happens"],
          rows: [
            ["1", "5", "False", "if body skipped; next item"],
            ["2", "12", "False", "if body skipped; next item"],
            ["3", "9", "False", "if body skipped; next item"],
            ["4", "250", "True", "print, then break — loop ends here"],
            ["after", "300, 8", "never checked", "program continues after the loop"],
          ],
          caption:
            "A break turns six possible laps into four. On a million-item list that difference is the whole point.",
        },
        {
          kind: "visual",
          title: "break is an exit door inside the lap",
          ascii: `   item 1    item 2    item 3    item 4    item 5    item 6
     |          |          |          |          |          |
     v          v          v          v          v          v
   +----+    +----+    +----+    +----+    +---------+  +---------+
   | no |    | no |    | no |    |yes!|    |  never   |  |  never   |
   |match|   |match|   |match|   |    |    |  looked  |  |  looked  |
   +----+    +----+    +----+    +--+-+    +---------+  +---------+
                                    |
                                 break!
                                    v
                          [ first line AFTER the loop ]
`,
          caption:
            "break does not ask permission and does not clean up the remaining items — it leaves the building through the nearest door: the loop it lives in.",
        },
        {
          kind: "heading",
          text: "break works in while loops too",
        },
        {
          kind: "code",
          title: "while True, with the exit condition inside",
          code: `battery = 100
minutes = 0
while True:
    battery = battery - 35
    minutes = minutes + 1
    if battery <= 0:
        print("battery dead after", minutes, "minutes of streaming")
        break
print("player shutting down")
`,
          output: `battery dead after 3 minutes of streaming
player shutting down`,
          explain: [
            "This is the professional shape you met in d-02, now with a real exit: the loop repeats until the battery condition fires, then break ends it.",
            "Trace the accumulator: 100 - 35 = 65 (minute 1), 65 - 35 = 30 (minute 2), 30 - 35 = -5 (minute 3) — negative, so the if fires and break ends the loop.",
            "`while True:` is only safe because a break is guaranteed to exist inside. Loop shape: open-ended loop, clear exit condition, break.",
          ],
        },
        {
          kind: "heading",
          text: "for...else: did the loop finish the whole race?",
        },
        {
          kind: "text",
          text: "Every search raises a follow-up question: *did we find one?* Python has a surprising and elegant answer — an `else` you can bolt onto a **loop**. It runs only when the loop finished all its laps **without** hitting a break. Read it as: 'for each item... and if we never broke, then do this'.",
        },
        {
          kind: "code",
          title: "for...else when nothing matched",
          code: `scores = [42, 88, 95, 60]
for s in scores:
    if s > 200:
        print("found an outlier:", s)
        break
else:
    print("no outliers -- every score looks normal")
`,
          output: `no outliers -- every score looks normal`,
          explain: [
            "No score passed 200, so no break ever fired. The loop 'finished the race' — and finishing without breaking is exactly when the loop's else runs.",
            "This replaces the old alternative: creating a `found` flag variable before the loop and checking it after. The else says the same thing with less machinery.",
          ],
        },
        {
          kind: "code",
          title: "The same loop when something DID match",
          code: `scores = [42, 880, 95, 60]
for s in scores:
    if s > 200:
        print("found an outlier:", s)
        break
else:
    print("no outliers -- every score looks normal")
`,
          output: `found an outlier: 880`,
          explain: [
            "880 passed the test and break fired — the loop bailed out early, so the else is skipped entirely.",
            "Same code, different data, different branch. The else answers the question 'did we check everything without leaving early?'",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "How professionals read for...else",
          text: "Python is nearly alone in having this feature, and even experienced programmers translate it aloud as 'no break' — as in, 'run this if NO BREAK happened'. Do the same translation from day one and it can never confuse you. And note where the else goes: it lines up with the `for`, not with the `if` — it answers the loop, not the if.",
        },
        {
          kind: "tryIt",
          title: "Tune the search",
          task: "Change the threshold from 85 to 70 and run it: the search should now stop at 72. Then delete the break line and run again: both 91 and 88 print, because without break the loop never stops at the first match. Put the break back.",
          code: `scores = [55, 72, 91, 88, 12]
for s in scores:
    if s > 85:
        print("found a top score:", s)
        break
`,
          hint: "The break belongs inside the if body, indented one level deeper than the if — right after the print. Watch which scores get examined in each version.",
        },
      ],
      terms: [
        { term: "break", definition: "A keyword that exits its loop immediately, jumping to the first line after the loop." },
        { term: "Early exit", definition: "Leaving a loop before it naturally finishes — what break does." },
        { term: "Search pattern", definition: "The loop shape 'for each item: if it matches, act and break' — finds the first match and stops." },
        { term: "for...else", definition: "A loop with an else block that runs only when the loop completed all iterations without hitting a break." },
      ],
      mistakes: [
        {
          mistake: "Writing code after break inside the same body.",
          why: "break exits the loop the moment it runs — any lines below it in the same body are unreachable and never execute.",
          fix: "Everything that must happen before leaving goes above the break; everything after belongs outside the loop.",
        },
        {
          mistake: "Expecting break to stop the whole program.",
          why: "break exits exactly one loop. The program continues normally from the first line after that loop — that is why 'search finished' still printed.",
          fix: "To stop the entire program, that is a different tool (sys.exit) you will meet later; break only ever leaves a loop.",
        },
        {
          mistake: "Indenting the loop's else to line up with the if, or assuming it belongs to the if.",
          why: "The else of a for...else pairs with the for line — it is about whether the loop broke, not about any single if.",
          fix: "Line the else up with the for keyword and read it as 'if no break happened'.",
        },
      ],
      takeaways: [
        "break exits the loop immediately — the remaining items are never visited.",
        "First-match searches are 'loop, test, act, break' — stop paying for work you do not need.",
        "while True is only safe with a guaranteed break inside; that pair is the standard open-ended loop.",
        "for...else runs its else only when the loop finished with NO break — read it as 'no break'.",
        "The else lines up with the for, never with the if.",
      ],
      quiz: [
        {
          id: "d-04-q1",
          prompt: "What does break do, exactly?",
          options: [
            { text: "Exits the loop immediately, and the program continues from the first line after the loop", correct: true, feedback: "Exactly — one door, one loop, straight out. The rest of the collection is skipped." },
            { text: "Skips the rest of the current iteration and moves to the next item", correct: false, feedback: "That is continue, the next lesson. break leaves the loop entirely." },
            { text: "Stops the entire program", correct: false, feedback: "Only the loop ends. Lines after the loop still run — you saw 'search finished' print." },
          ],
          explanation: "break = exit this loop now. The program itself continues right after the loop.",
        },
        {
          id: "d-04-q2",
          prompt: "In a for...else loop, when does the else block run?",
          options: [
            { text: "Only when the loop finished all its iterations without hitting a break", correct: true, feedback: "Correct — 'no break' is the rule. Finish the race, run the else." },
            { text: "On every iteration where the if was False", correct: false, feedback: "The else has nothing to do with the if — it pairs with the loop itself." },
            { text: "Always, right after the loop ends", correct: false, feedback: "If a break fired, the else is skipped — that is its entire purpose." },
          ],
          explanation: "for...else answers 'did the loop finish without breaking?' — yes means run the else.",
        },
      ],
    },

    // ------------------------------------------------------------- d-05
    {
      slug: "d-05",
      title: "Continue",
      minutes: 12,
      summary:
        "continue skips the rest of one lap and jumps to the next item: break vs continue side by side, the filtering pattern, and when continue actually hurts readability.",
      kind: "concept",
      objectives: [
        "Use continue to skip iterations that fail a condition",
        "Explain the difference between break and continue in one sentence each",
        "Write the filtering pattern: guard, continue, then work",
        "Decide when a flipped if reads better than a continue",
      ],
      why: "Real data is messy. A list of temperatures contains sensor errors as negative numbers. A list of orders contains refunds. A file of lines contains blanks. You rarely want to stop at the first bad item — you want to skip the bad ones and keep processing the good ones. That is continue: the skip button on a playlist. It skips one song; break would stop the music. Together, break and continue cover the two ways a loop can leave a lap early, and knowing exactly which one to reach for is a big part of writing loops other people can read.",
      blocks: [
        {
          kind: "text",
          text: "You know this button: your playlist hits a song you cannot stand, and you press **skip**. The song stops, the playlist keeps going. That is `continue`: skip the rest of *this* lap, jump straight to the next item. Compare it with `break`, which would stop the whole playlist and leave the room.",
        },
        {
          kind: "heading",
          text: "continue: skip this lap, not the whole race",
        },
        {
          kind: "code",
          title: "Skip the broken readings",
          code: `temps = [12, -3, 8, -1, 20]
for t in temps:
    if t < 0:
        continue  # sensor error -- skip it
    print("processing", t)
`,
          output: `processing 12
processing 8
processing 20`,
          explain: [
            "Items 12: the guard `t < 0` is False, no skip — the print runs. Item -3: the guard is True, `continue` fires — the print is skipped and the loop jumps to the next item.",
            "Exactly 3 of the 5 items got processed. The loop itself ran all 5 laps; 2 laps were just cut short.",
          ],
        },
        {
          kind: "text",
          text: "Precisely: **continue skips the rest of the current iteration** — everything below it in the body — and hands control back to the loop for the next item. The guard goes *first* in the body, the real work goes below it. That order matters: once continue fires, nothing below it runs for that item.",
        },
        {
          kind: "heading",
          text: "break vs continue, side by side",
        },
        {
          kind: "code",
          title: "Same list, same if-shape, opposite outcomes",
          code: `numbers = [3, 9, 4, 12, 7]

print("--- with continue: skip the 4s ---")
for n in numbers:
    if n == 4:
        continue
    print(n)

print("--- with break: stop at the first 12 ---")
for n in numbers:
    if n == 12:
        break
    print(n)
`,
          output: `--- with continue: skip the 4s ---
3
9
12
7
--- with break: stop at the first 12 ---
3
9
4`,
          explain: [
            "The continue version prints four numbers: 3, 9, 12, 7. The 4 is missing — skipped — but the loop marched on to 12 and 7.",
            "The break version prints three numbers: 3, 9, 4 — and stops dead at 12. The 7 never appears.",
            "One word of difference, completely different programs. When you feel confused about which you need, ask: 'am I done (break), or just not interested in this one (continue)?'",
          ],
        },
        {
          kind: "table",
          title: "The decision table",
          headers: ["You want to...", "Reach for", "The loop..."],
          rows: [
            ["skip some items and keep going", "continue", "keeps looping through the rest"],
            ["stop at the first match", "break", "ends immediately, rest never visited"],
            ["do something only if NOTHING matched", "for...else", "else runs when no break happened"],
            ["do something to every item", "a plain loop, no keywords", "visits every item, no skips"],
          ],
          caption:
            "Four behaviors, four shapes. Every loop you will ever read is one of these, or a combination.",
        },
        {
          kind: "heading",
          text: "The filtering pattern",
        },
        {
          kind: "code",
          title: "Count what survives the filter",
          code: `words = ["loop", "if", "while", "go", "range"]
long_words = 0
for w in words:
    if len(w) < 4:
        continue  # too short for the report
    long_words = long_words + 1
print("words with 4 or more letters:", long_words)
`,
          output: `words with 4 or more letters: 3`,
          explain: [
            "This is d-03's counting accumulator plus d-05's skip: the guard filters, the accumulator counts what survives. 'loop', 'while', 'range' made it through — 3.",
            "The shape is: **guard, continue, then work**. Anyone reading the loop sees the skip conditions first, then the real work, without wading through a nesting of ifs.",
          ],
        },
        {
          kind: "heading",
          text: "When continue hurts readability",
        },
        {
          kind: "text",
          text: "continue is a tool, not a habit. Here is the same job written two ways — one with continue, one with a flipped condition — and the flipped version is easier to read:",
        },
        {
          kind: "code",
          title: "Two ways to print only the odd numbers",
          code: `print("A: with continue")
for n in [1, 2, 3, 4]:
    if n % 2 == 0:
        continue
    print(n, "is odd")

print("B: same result, no continue")
for n in [1, 2, 3, 4]:
    if n % 2 != 0:
        print(n, "is odd")
`,
          output: `A: with continue
1 is odd
3 is odd
B: same result, no continue
1 is odd
3 is odd`,
          explain: [
            "Version A says 'if even, jump ahead' — the reader must mentally rejoin the flow further down to know what actually happens.",
            "Version B says 'if odd, print' in one breath. Same output, one condition, zero jumps.",
            "Rule of thumb: use **continue when skipping is the story** ('skip errors', 'skip blanks', 'skip done items'). When the *doing* condition is just as easy to state, flip the if and skip the continue.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The readability tax",
          text: "Every continue in a long loop body is a little exit ramp a reader must track. One or two at the top of a body — guards for junk items — read beautifully. Five of them scattered through fifty lines turn the loop into a maze. Keep the guards at the top, and keep them few.",
        },
        {
          kind: "tryIt",
          title: "Flip the filter",
          task: "The loop currently skips negative orders. Flip it: skip the POSITIVE orders instead, so only the refunds (-4 and -1) are processed. Then add a refund_count accumulator and print how many refunds there were.",
          code: `orders = [12, -4, 30, -1, 8]
for o in orders:
    if o < 0:
        continue
    print("processing order:", o)
`,
          hint: "The guard becomes 'if o > 0: continue' — positive orders are the ones to skip now. Initialize refund_count = 0 before the loop and grow it inside.",
        },
      ],
      terms: [
        { term: "continue", definition: "A keyword that skips the rest of the current iteration and jumps to the next item." },
        { term: "Filtering", definition: "The pattern of processing only items that pass a condition: guard, continue, then work." },
        { term: "Guard", definition: "An if at the top of a loop body whose job is to catch and skip unwanted items before the real work starts." },
      ],
      mistakes: [
        {
          mistake: "Doing the work first and checking the skip condition after.",
          why: "Once the item has been processed, skipping it later cannot un-process it. Guard first, work second.",
          fix: "Put the guard if and its continue at the very top of the loop body, before any real work.",
        },
        {
          mistake: "Using continue when you meant break (or the reverse).",
          why: "continue keeps the loop alive and skips one item; break kills the loop entirely. Mixing them up means either stopping early or never stopping.",
          fix: "Ask the question: 'am I done (break), or just not interested in this one (continue)?'",
        },
        {
          mistake: "Reaching for continue when a flipped if is simpler.",
          why: "'if x: continue' followed by the whole job forces the reader to track a jump. 'if not x: do the job' says the same thing with no jump.",
          fix: "When the doing-condition is easy to state, flip the condition and drop the continue.",
        },
      ],
      takeaways: [
        "continue skips the rest of this lap and jumps to the next item — the playlist skip button.",
        "break leaves the loop entirely; continue just skips one item. 'Done' vs 'not interested in this one'.",
        "The filtering pattern is guard, continue, then work — junk conditions at the top, real work below.",
        "Flip the condition instead when the doing-condition is easy to state; continue is for when skipping is the story.",
      ],
      quiz: [
        {
          id: "d-05-q1",
          prompt: "What does continue do, exactly?",
          options: [
            { text: "Skips the rest of the current iteration and moves to the next item", correct: true, feedback: "Correct — one lap is cut short; the loop itself keeps going." },
            { text: "Exits the loop immediately", correct: false, feedback: "That is break. continue never ends the loop." },
            { text: "Restarts the current iteration from the top with the same item", correct: false, feedback: "Nothing repeats — continue advances to the NEXT item." },
          ],
          explanation: "continue = skip the rest of this lap, next item please. The loop lives on.",
        },
        {
          id: "d-05-q2",
          prompt: "How many lines does this print? 'for n in [1, 2, 3, 4, 5]: if n % 2 == 0: continue; print(n)'",
          options: [
            { text: "3", correct: true, feedback: "Right — the evens (2 and 4) are skipped; 1, 3, 5 print. Three lines." },
            { text: "5", correct: false, feedback: "That would be with no continue at all — the skip removes two prints." },
            { text: "2", correct: false, feedback: "Count the odd numbers in 1..5: 1, 3, 5 — three prints." },
          ],
          explanation: "The continue skips exactly the even numbers, so the odd three print: 1, 3, 5.",
        },
      ],
    },

    // ------------------------------------------------------------- d-06
    {
      slug: "d-06",
      title: "Nested Loops",
      minutes: 15,
      summary:
        "A loop inside a loop: grids and coordinates, the total-work rule (outer times inner), printing rows with end=, aligned columns with format specs, and why break only breaks one level.",
      kind: "concept",
      objectives: [
        "Write a loop inside a loop and predict the order it visits items",
        "Compute total iterations as outer count times inner count",
        "Print a grid on screen using print's end= argument",
        "Align columns with the {value:>4} format spec",
        "Explain why break inside the inner loop exits only one level",
      ],
      why: "One loop gives you a line. Two loops give you a plane. Almost everything with rows and columns — a spreadsheet, a cinema seating chart, a chess board, a multiplication table, every pixel grid on your screen right now — is a loop inside a loop. Nested loops are also where loop cost starts to matter: 100 rows times 100 columns is 10,000 body runs, and knowing that multiplication rule before you write it is the difference between a blink and a freeze. This lesson builds the grid pattern you will reuse in the part project.",
      blocks: [
        {
          kind: "text",
          text: "Think about a cinema. To describe every seat you need two ideas: *which row*, and *which seat in that row*. One loop can only move in one direction — so to visit every seat, you put a loop inside a loop: the outer one walks the rows, the inner one walks the seats within the row you are standing in.",
        },
        {
          kind: "heading",
          text: "A loop inside a loop",
        },
        {
          kind: "code",
          title: "Every row, every seat",
          code: `for row in range(1, 4):
    for seat in range(1, 5):
        print(f"row {row}, seat {seat}")
`,
          output: `row 1, seat 1
row 1, seat 2
row 1, seat 3
row 1, seat 4
row 2, seat 1
row 2, seat 2
row 2, seat 3
row 2, seat 4
row 3, seat 1
row 3, seat 2
row 3, seat 3
row 3, seat 4`,
          explain: [
            "The outer loop picks row 1 — and *while it is there*, the inner loop runs its entire life: seats 1, 2, 3, 4.",
            "Only when the inner loop finishes does the outer loop advance to row 2 — and the inner loop starts over from seat 1.",
            "Read it as a sentence: **for every row, for every seat in that row, print where you are.** 12 lines, because 3 rows times 4 seats is 12 seats.",
          ],
        },
        {
          kind: "visual",
          title: "The visit order: sweep across, drop down",
          ascii: `            col=1    col=2    col=3    col=4
           +--------+--------+--------+--------+
  row=1    | (1,1)  | (1,2)  | (1,3)  | (1,4)  |   <-- inner loop sweeps
           +--------+--------+--------+--------+       across the row
  row=2    | (2,1)  | (2,2)  | (2,3)  | (2,4)  |
           +--------+--------+--------+--------+   <-- outer loop drops
  row=3    | (3,1)  | (3,2)  | (3,3)  | (3,4)  |       down one row
           +--------+--------+--------+--------+
`,
          caption:
            "The reading order of a nested loop is exactly the reading order of a page: left to right, then down, then left to right again.",
        },
        {
          kind: "text",
          text: "The key mental rule: **the inner loop is reborn on every outer lap**. It always starts from its own beginning (seat 1 again), runs to its end, dies, and is resurrected by the next outer lap. And note the indentation levels: the inner for line is indented under the outer loop; the inner *body* is indented one more level. Three levels deep is normal here — the indentation is what tells Python (and you) what belongs to what.",
        },
        {
          kind: "heading",
          text: "Total work: outer times inner",
        },
        {
          kind: "code",
          title: "Counting the body runs",
          code: `steps = 0
for x in range(3):
    for y in range(4):
        steps = steps + 1
print("the inner body ran", steps, "times")
`,
          output: `the inner body ran 12 times`,
          explain: [
            "3 outer laps, 4 inner laps each: 3 x 4 = 12 runs of the inner body. The accumulator proves it.",
            "This multiplication rule is how you estimate cost before writing a loop: a 100 x 100 grid is 10,000 body runs; 1,000 x 1,000 is a million. Nested loops multiply, and that is where slow programs are born — worth knowing now, before your grids get big.",
          ],
        },
        {
          kind: "table",
          title: "Where the work happens",
          headers: ["Outer lap", "The inner loop does", "Body runs this lap"],
          rows: [
            ["row 1", "seats 1, 2, 3, 4", "4"],
            ["row 2", "seats 1, 2, 3, 4 (fresh start)", "4"],
            ["row 3", "seats 1, 2, 3, 4 (fresh start)", "4"],
            ["total", "3 outer laps x 4 inner laps", "12"],
          ],
          caption:
            "Multiply, never add. Two loops of 10 and 10 nested are 100 body runs, not 20.",
        },
        {
          kind: "text",
          text: "To draw a grid on screen you need all the cells of a row on *one* line. The obstacle: `print` always ends with a newline. The fix is print's quiet second argument: `end=`. Give it a different ending — a space, or an empty string — and the next print glues itself onto the same line. A bare `print()` then closes the row.",
        },
        {
          kind: "code",
          title: "A multiplication grid, three rows",
          code: `for row in range(1, 4):
    for col in range(1, 5):
        print(row * col, end=" ")
    print()
`,
          output: `1 2 3 4
2 4 6 8
3 6 9 12`,
          explain: [
            "The inner print ends with a space instead of a newline (`end=\" \"`), so the four cells of a row land on one line.",
            "The bare `print()` after the inner loop — still inside the outer body — prints just a newline, closing the row. One outer lap = one printed row.",
            "Remove the bare print() and you get one long line of 12 numbers: the classic first attempt.",
          ],
        },
        {
          kind: "heading",
          text: "Aligned columns: the {value:>4} format spec",
        },
        {
          kind: "text",
          text: "The grid above wobbles the moment products hit two digits — `10` is wider than `9`, so the columns drift. You already met `{average:.2f}` in d-03; here is the alignment sibling: `{value:>4}` means *right-align this value in a 4-character slot*. Every value gets the same width, so the columns line up like a spreadsheet.",
        },
        {
          kind: "code",
          title: "The same grid, aligned",
          code: `for row in range(1, 5):
    for col in range(1, 6):
        print(f"{row * col:>4}", end="")
    print()
`,
          output: `   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20`,
          explain: [
            "Every cell is right-aligned in a 4-character slot: 1 becomes three spaces then '1'; 10 becomes two spaces then '10'.",
            "Now `end=\"\"` — empty, no space at all — because the 4-wide slot already carries its own spacing.",
            "This exact pattern — nested loops, `:>4`, `end=\"\"`, bare print() — is Act 1 of the part project. Learn it here, reuse it there.",
          ],
        },
        {
          kind: "heading",
          text: "break only breaks ONE level",
        },
        {
          kind: "code",
          title: "The inner break, watched closely",
          code: `for table in range(1, 4):
    print("table", table)
    for n in range(1, 10):
        if n == 3:
            break  # only escapes the INNER loop
        print("  ", table, "x", n, "=", table * n)
`,
          output: `table 1
   1 x 1 = 1
   1 x 2 = 2
table 2
   2 x 1 = 2
   2 x 2 = 4
table 3
   3 x 1 = 3
   3 x 2 = 6`,
          explain: [
            "Each inner loop dies at n == 3 (break!) — but the outer loop keeps marching: table 2 and table 3 still get their turn.",
            "break exits the *innermost* loop that contains it. There is no 'break both loops' keyword.",
            "To exit both, the standard tool is a flag variable: set `done = True` before the inner break, then check it in the outer loop and break there too. You will practice that shape in Part E.",
          ],
        },
        {
          kind: "tryIt",
          title: "Resize the grid",
          task: "Widen the grid from 3x3 to 3x5 by changing the inner range to (1, 6). Predict the total cells BEFORE running (3 rows x 5 columns = ?), then prove it: add a counter accumulator inside the inner body and print 'cells visited:' plus the count after the loops.",
          code: `for row in range(1, 4):
    for col in range(1, 4):
        print(f"({row},{col})", end=" ")
    print()
`,
          hint: "The counter is born before BOTH loops (steps = 0), grows inside the inner body, and is printed after both loops end. The multiplication rule predicts 15.",
        },
      ],
      terms: [
        { term: "Nested loop", definition: "A loop placed inside another loop's body. The inner one runs to completion on every lap of the outer one." },
        { term: "Outer loop / inner loop", definition: "The outer loop advances once per full run of the inner loop. The inner loop is restarted fresh on every outer lap." },
        { term: "Total iterations", definition: "The number of times the innermost body runs: outer laps times inner laps. Nested loops multiply, they do not add." },
        { term: "end argument", definition: "print's optional end= argument replaces the default newline ending — end=\"\" keeps following prints on the same line." },
        { term: "Alignment format spec", definition: "{value:>4} — right-align the value in a 4-character slot so columns of different-width numbers still line up." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the bare print() that ends each row.",
          why: "Every inner print ends with end=\"\", so nothing ever moves to the next line — the whole grid collapses into one long line.",
          fix: "The last line of the OUTER body is a bare print(): one newline per row, once the inner loop has finished sweeping.",
        },
        {
          mistake: "Putting the row-ending print() inside the inner loop.",
          why: "A newline after every cell means one number per line — a column instead of a grid.",
          fix: "Anything that must happen once per row belongs in the outer body, after (outside) the inner loop.",
        },
        {
          mistake: "Expecting break to escape both loops.",
          why: "break exits only the innermost loop containing it. The outer loop continues as if nothing happened — table 2 still printed after the inner break.",
          fix: "To leave both loops, set a flag before the inner break, then check the flag in the outer loop and break there as well.",
        },
      ],
      takeaways: [
        "Nested loops visit in reading order: the inner sweeps across, the outer drops down a row.",
        "The inner loop is reborn on every outer lap — it always restarts from its own beginning.",
        "Total work multiplies: 3 rows x 4 columns = 12 body runs. Estimate before you nest.",
        "end=\"\" keeps prints on one line; a bare print() in the outer body closes the row.",
        "{value:>4} right-aligns in a 4-wide slot so columns line up; break only ever breaks one level.",
      ],
      quiz: [
        {
          id: "d-06-q1",
          prompt: "The outer loop runs 3 laps; the inner loop runs 5 laps per outer lap. How many times does the innermost body run?",
          options: [
            { text: "15", correct: true, feedback: "Correct — nested loops multiply: 3 x 5 = 15." },
            { text: "8", correct: false, feedback: "That is adding (3 + 5). Nesting multiplies." },
            { text: "5", correct: false, feedback: "That is one outer lap's worth. All three outer laps get their own full inner run." },
          ],
          explanation: "Outer laps times inner laps: 3 x 5 = 15 body runs.",
        },
        {
          id: "d-06-q2",
          prompt: "A break inside the inner loop fires. What happens?",
          options: [
            { text: "Only the inner loop ends; the outer loop continues with its next lap", correct: true, feedback: "Exactly — break exits the innermost loop containing it, nothing more." },
            { text: "Both loops end immediately", correct: false, feedback: "There is no 'break both' — you would need a flag checked by the outer loop." },
            { text: "The whole program stops", correct: false, feedback: "Programs only stop for errors or exit calls — a break just leaves one loop." },
          ],
          explanation: "break leaves exactly one loop: the innermost one around it. The outer loop never even noticed.",
        },
        {
          id: "d-06-q3",
          prompt: "Why does the grid-drawing loop end its outer body with a bare print()?",
          options: [
            { text: "To print the newline that closes the current row", correct: true, feedback: "Right — the cells all end with end=\"\", so somebody has to end the line: the bare print() does exactly that, once per row." },
            { text: "To print an empty string, which does nothing", correct: false, feedback: "It prints a newline — that is its whole job here." },
            { text: "To reset the inner loop so it can start over", correct: false, feedback: "The inner loop restarts on its own when the outer loop begins its next lap — print() has nothing to do with it." },
          ],
          explanation: "Bare print() = one newline. One per outer lap = one per row. That is how a grid gets its rows.",
        },
      ],
    },

    // ------------------------------------------------------------- d-07
    {
      slug: "d-07",
      title: "Pattern Problems",
      minutes: 20,
      summary:
        "The classic loop gym: right triangles, centered pyramids, number triangles, aligned multiplication tables — and the crown jewel, FizzBuzz, where the whole lesson is check order.",
      kind: "coding",
      objectives: [
        "Build the four classic patterns: right triangle, centered pyramid, number triangle, aligned times table",
        "Combine string repetition with loops to stamp shapes of any height",
        "Derive the per-row formulas (spaces, stars) that make a pyramid centered",
        "Write correct FizzBuzz from memory — and explain why the combined check must come first",
      ],
      why: "Knowing loop syntax and having loop fluency are different skills, and the gap between them is exactly the gap that pattern problems close. A pyramid of stars looks like a toy, but it trains the real move: staring at a shape, finding the formula for each row, and turning it into one loop lap. That move — shape to formula to loop — is the same move that lays out invoice reports, aligns database dumps, and renders game boards. And FizzBuzz, the most famous interview question in programming, is here for one reason: it looks trivial and still filters out people who have not learned that elif chains check in order. Build all five patterns and your loop skills stop being borrowed and start being yours.",
      blocks: [
        {
          kind: "text",
          text: "Everything in this lesson is a workout. The four patterns below use nothing but tools you already own: loops, `range()`, string repetition from Part B (`\"*\" * 3` stamps three stars), and one format spec from d-03 and d-06. The reward for building them is not the shapes — it is that row formulas stop being scary, which is the actual skill of loop fluency.",
        },
        {
          kind: "heading",
          text: "Pattern 1: the right triangle",
        },
        {
          kind: "code",
          title: "Growing stars, the string-repetition way",
          code: `height = 5
for row in range(1, height + 1):
    print("*" * row)
`,
          output: `*
**
***
****
*****`,
          explain: [
            "Row 1 needs 1 star, row 2 needs 2, row 5 needs 5 — the row number IS the star count, so `\"*\" * row` stamps exactly the right amount.",
            "`range(1, height + 1)` gives rows 1..5 (remember the fence: stop one past what you want). Change `height` to 10 and the whole shape grows — one variable controls everything, which is the whole point of parameters like this.",
          ],
        },
        {
          kind: "code",
          title: "The same triangle, built by an inner loop",
          code: `for row in range(1, 4):
    line = ""
    for star in range(row):
        line = line + "*"
    print(line)
`,
          output: `*
**
***`,
          explain: [
            "`line` is a **string accumulator**: born empty before the inner loop, one star glued on per inner lap, printed once after.",
            "Why bother, when `\"*\" * row` did it in one line? Because the inner-loop version works when the pieces *cannot* be stamped with `*` — like the number triangle below, where each lap adds a different character. Same skeleton, different cargo.",
          ],
        },
        {
          kind: "heading",
          text: "Pattern 2: the centered pyramid",
        },
        {
          kind: "code",
          title: "Spaces on the left, stars everywhere else",
          code: `height = 4
for row in range(1, height + 1):
    spaces = height - row
    stars = 2 * row - 1
    print(" " * spaces + "*" * stars)
`,
          output: `   *
  ***
 *****
*******`,
          explain: [
            "The trick is to see each row as two pieces: padding spaces, then stars. Row 1 of 4: 3 spaces, 1 star. Row 4: 0 spaces, 7 stars.",
            "The two formulas are the pattern: `spaces = height - row` (shrinks as you go down) and `stars = 2 * row - 1` (odd numbers: 1, 3, 5, 7). Derive them once, reuse them forever.",
          ],
        },
        {
          kind: "visual",
          title: "Pyramid anatomy, row by row",
          ascii: `height = 4        spaces   stars

      *            3        1        row 1
     ***           2        3        row 2
    *****          1        5        row 3
   *******         0        7        row 4

   spaces = height - row        stars = 2 * row - 1
`,
          caption:
            "Read any shape as a table of per-row formulas. Once the table exists, the loop is just the table executed top to bottom.",
        },
        {
          kind: "heading",
          text: "Pattern 3: the number triangle",
        },
        {
          kind: "code",
          title: "Counting up within each row",
          code: `for row in range(1, 5):
    line = ""
    for n in range(1, row + 1):
        line = line + str(n) + " "
    print(line)
`,
          output: `1
1 2
1 2 3
1 2 3 4`,
          explain: [
            "Row 3 needs the numbers 1, 2, 3 — so the inner loop runs `range(1, row + 1)`: one more number on each row than the last.",
            "`str(n)` is the Part A lesson in action: `+` glues text to text only, so the number must be converted before it joins the string. The trailing space after each number is harmless — nobody sees it.",
            "This is the string-accumulator skeleton from the triangle, now carrying numbers. Same bones, different cargo — exactly what makes a pattern reusable.",
          ],
        },
        {
          kind: "heading",
          text: "Pattern 4: the aligned multiplication table",
        },
        {
          kind: "code",
          title: "One column, perfectly straight",
          code: `n = 7
print(f"The {n} times table")
print("-" * 15)
for i in range(1, 11):
    print(f"{i:>2} x {n} = {i * n:>3}")
`,
          output: `The 7 times table
---------------
 1 x 7 =   7
 2 x 7 =  14
 3 x 7 =  21
 4 x 7 =  28
 5 x 7 =  35
 6 x 7 =  42
 7 x 7 =  49
 8 x 7 =  56
 9 x 7 =  63
10 x 7 =  70`,
          explain: [
            "Three format specs keep it straight: `{i:>2}` holds the multiplier in a 2-wide slot (so 10 does not shove the line sideways), and `{i * n:>3}` holds the product in a 3-wide slot — that is why every equals sign lines up.",
            "`\"-\" * 15` draws the divider — string repetition as a ruler. Change `n` to any number and the whole table rebuilds itself.",
          ],
        },
        {
          kind: "heading",
          text: "The crown jewel: FizzBuzz",
        },
        {
          kind: "text",
          text: "Here is the most famous interview question in programming. *Print the numbers 1 to 15 — but for multiples of 3 print 'Fizz' instead, for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.* It sounds like nothing. It is responsible for more rejected candidates than any other question, because it hides one trap: **the multiples of both**. Try the natural, naive order first — single checks first, combined check last — and watch it fail:",
        },
        {
          kind: "code",
          title: "The naive version — and its silent bug",
          code: `# BUGGY: checks 3 and 5 before 15 -- the numbers divisible by BOTH
for n in range(1, 16):
    if n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    elif n % 15 == 0:
        print("FizzBuzz")
    else:
        print(n)
`,
          output: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
Fizz`,
          explain: [
            "Scroll to the last line and compare with the rules: 15 is divisible by 3 AND by 5, so it should be 'FizzBuzz' — but this program printed 'Fizz'.",
            "Why? Trace n = 15 through the elif chain from Part C: `15 % 3 == 0` is **True** — the first branch catches 15, prints 'Fizz', and the chain stops right there. The `n % 15` test below it is never reached. Not once, for any number.",
            "The bug is invisible for 14 of the 15 numbers — which is exactly why testing only 'a few lines' would have missed it. The bug only exists at multiples of 15.",
          ],
        },
        {
          kind: "code",
          title: "The correct version: most specific check first",
          code: `# CORRECT: the most specific check (both 3 and 5) comes FIRST
for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`,
          output: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz`,
          explain: [
            "Only one line moved: the combined check rose to the top. Now n = 15 hits `15 % 15 == 0` first and prints 'FizzBuzz' — the single checks never get a chance to swallow it.",
            "The rule this teaches, once and for all: **in an elif chain, order is logic.** Every multiple of 15 is also a multiple of 3 and of 5 — the combined case is a *subset* of the single cases, so it must be tested before they are. Sort mail for apartment 3B before you sort mail for the whole building, or the big bucket swallows the small one.",
            "Interviewers do not ask FizzBuzz to see if you know %. They ask to see if you can find this ordering trap — and now you can, because you watched it break.",
          ],
        },
        {
          kind: "tryIt",
          title: "The pattern workshop",
          task: "Three small builds: (1) turn the right triangle upside down — rows of 4, 3, 2, 1 stars, using range(height, 0, -1). (2) Make the pyramid height 6 and check that the bottom row has 11 stars. (3) Build the diamond: pyramid up to height 4, then the same shape shrinking back down to 1 star.",
          code: `height = 4
for row in range(1, height + 1):
    print("*" * row)
`,
          hint: "Upside down: range(height, 0, -1) hands out 4, 3, 2, 1 — each row stamps that many stars. For the diamond, the shrinking half is the growing half printed in reverse row order.",
        },
      ],
      terms: [
        { term: "Pattern problem", definition: "A small shape-building exercise (triangles, pyramids, tables) that trains the skill of turning a shape into per-row formulas." },
        { term: "Row formula", definition: "The expression that computes what row N of a shape contains: spaces = height - row, stars = 2 * row - 1." },
        { term: "String accumulator", definition: "A string variable born empty before a loop and grown by gluing on pieces each lap (line = line + str(n) + ' ')." },
        { term: "Most-specific-first", definition: "The elif-chain rule that combined or narrower conditions must be tested before the broader conditions that would swallow them." },
      ],
      mistakes: [
        {
          mistake: "In FizzBuzz, checking n % 3 and n % 5 before the combined case.",
          why: "15 is divisible by 3, so the n % 3 branch catches it first and prints 'Fizz' — the combined branch is unreachable and 15 never prints 'FizzBuzz'.",
          fix: "Most specific first: the combined check (n % 15 == 0) sits above the single checks.",
        },
        {
          mistake: "Building the pyramid with stars = row instead of stars = 2 * row - 1.",
          why: "One extra star per row (1, 2, 3, 4) gives a right triangle, not a pyramid — the rows do not grow fast enough to stay centered over shrinking padding.",
          fix: "Pyramid rows grow by two: stars = 2 * row - 1 gives 1, 3, 5, 7, with spaces = height - row on the left.",
        },
        {
          mistake: "Building the number triangle with line = line + n.",
          why: "n is an int and line is a string; + refuses to glue them (TypeError: can only concatenate str (not \"int\") to str).",
          fix: "Convert first: line = line + str(n) + ' ' — exactly the Part A fix, now inside a loop.",
        },
      ],
      takeaways: [
        "Every shape is a table of per-row formulas; the loop just executes the table.",
        "String repetition stamps repeats; a string accumulator builds rows whose pieces differ each lap.",
        "range(1, height + 1) is the 'rows 1 through height' loop; the + 1 is the fence rule again.",
        "FizzBuzz's only lesson is order: most specific check first, because 15 is a subset of the multiples of 3.",
        "In an elif chain, order IS logic — moving one line changes what the program does.",
      ],
      quiz: [
        {
          id: "d-07-q1",
          prompt: "What does \"*\" * 4 produce?",
          options: [
            { text: "\"****\"", correct: true, feedback: "Right — string repetition stamps the string that many times (Part B, meeting its true calling)." },
            { text: "\"*4\"", correct: false, feedback: "That would be \"*\" + str(4) with concatenation. The * operator repeats." },
            { text: "4", correct: false, feedback: "No numbers come back — repetition always produces a longer string." },
          ],
          explanation: "\"*\" * 4 is four stars in one string: \"****\". Repetition is how patterns get stamped.",
        },
        {
          id: "d-07-q2",
          prompt: "In a centered pyramid of height 5, what does row 4 contain?",
          options: [
            { text: "1 space, then 7 stars", correct: true, feedback: "Correct — spaces = 5 - 4 = 1, stars = 2*4 - 1 = 7." },
            { text: "4 spaces, then 4 stars", correct: false, feedback: "That is the right-triangle formula. Pyramids grow by two stars per row." },
            { text: "0 spaces, then 9 stars", correct: false, feedback: "That is row 5, the base. Row 4 still has one space of padding." },
          ],
          explanation: "spaces = height - row and stars = 2 * row - 1: row 4 of 5 is 1 space and 7 stars.",
        },
        {
          id: "d-07-q3",
          prompt: "Why must the n % 15 == 0 check come FIRST in FizzBuzz?",
          options: [
            { text: "Because every multiple of 15 is also a multiple of 3 and of 5, so a % 3 check above it would catch those numbers first", correct: true, feedback: "Exactly — the combined case is a subset of the single cases, so it must be tested before them." },
            { text: "Because 15 is bigger than 3 and 5, and elif chains must check bigger numbers first", correct: false, feedback: "Order has nothing to do with size — it is about which conditions swallow which." },
            { text: "It does not matter; elif chains test all branches anyway", correct: false, feedback: "An elif chain stops at its first True branch — branches below a match never run." },
          ],
          explanation: "The chain stops at the first True. 15 % 3 == 0 is True, so a % 3 check above the combined check swallows every multiple of 15.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART D EXERCISES — 12 (4 beginner, 4 intermediate, 4 advanced)
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "d-b1",
      tier: "beginner",
      title: "The countdown",
      prompt:
        "Write a countdown program using a for loop and range() with a negative step: it must print the numbers 5, 4, 3, 2, 1 — one per line, in that order — and then print 'Liftoff!' on its own line after the loop. No while loop allowed: the whole point is practicing range(5, 0, -1) and remembering that the stop value (0) is never printed.",
      hint: "range(5, 0, -1) hands out 5, 4, 3, 2, 1 — start at 5, stop before 0, step -1. The 'Liftoff!' print goes AFTER the loop, at zero indentation.",
      starter: `# Countdown: 5 4 3 2 1, then Liftoff!
# TODO: one for loop over the right range

# TODO: print "Liftoff!" after the loop
`,
      solution: `# Countdown: 5 4 3 2 1, then Liftoff!
for n in range(5, 0, -1):
    print(n)

print("Liftoff!")
`,
      expectedOutput: `5
4
3
2
1
Liftoff!`,
      concepts: ["for loops", "range()", "negative steps"],
    },
    {
      id: "d-b2",
      tier: "beginner",
      title: "Sum and average of a hardcoded list",
      prompt:
        "The list scores = [72, 85, 91, 68, 94] is given. Using one for loop and the accumulator pattern, compute the total and the count, then print exactly three lines: 'Count  : 5', 'Total  : 410', and 'Average: 82.00'. The average must be computed as total divided by count and printed with the {value:.2f} format spec. Do not use sum() or len() for the total and count — grow two accumulators in the loop (len() would be fine, but this is accumulator practice).",
      hint: "Born before the loop: total = 0 and count = 0. Inside: total = total + score and count = count + 1. After: average = total / count, then print with f\"Average: {average:.2f}\".",
      starter: `scores = [72, 85, 91, 68, 94]

# TODO: two accumulators, born before the loop

# TODO: one for loop over scores, growing both accumulators

# TODO: print Count, Total, Average (average with :.2f)
`,
      solution: `scores = [72, 85, 91, 68, 94]

# Accumulators are born BEFORE the loop
total = 0
count = 0

for score in scores:
    total = total + score
    count = count + 1

average = total / count

print("Count  :", count)
print("Total  :", total)
print(f"Average: {average:.2f}")
`,
      expectedOutput: `Count  : 5
Total  : 410
Average: 82.00`,
      concepts: ["for loops", "accumulator pattern", "f-strings", "format specs"],
    },
    {
      id: "d-b3",
      tier: "beginner",
      title: "The 9 times table",
      prompt:
        "Print the 9 times table from 1 to 10, one product per line, in the exact format shown by the expected output — the multiplier is right-aligned in a 2-character slot so that the line for 10 lines up with the others. Use one for loop over range(1, 11) and an f-string with the {i:>2} format spec. The table number itself (9) must come from a variable called n, so changing n rebuilds the whole table.",
      hint: "The line format is f\"{n} x {i:>2} = {n * i}\" — {i:>2} right-aligns 1 as ' 1' and keeps 10 as '10', so every equals sign lines up.",
      starter: `n = 9

# TODO: one for loop, i from 1 to 10, printing the aligned line
`,
      solution: `n = 9

for i in range(1, 11):
    print(f"{n} x {i:>2} = {n * i}")
`,
      expectedOutput: `9 x  1 = 9
9 x  2 = 18
9 x  3 = 27
9 x  4 = 36
9 x  5 = 45
9 x  6 = 54
9 x  7 = 63
9 x  8 = 72
9 x  9 = 81
9 x 10 = 90`,
      concepts: ["for loops", "range()", "format specs"],
    },
    {
      id: "d-b4",
      tier: "beginner",
      title: "The vowel counter",
      prompt:
        "Count the vowels in the hardcoded text = \"loops make python powerful\". Loop over the string character by character (a for loop over text visits every letter), and inside the loop use one if with the or operator from Part C to test whether the character is a, e, i, o, or u. Grow a vowels accumulator starting at 0. After the loop, print exactly: 'vowels found: 8'. Uppercase is not a concern here — the text is all lowercase.",
      hint: "One condition: ch == \"a\" or ch == \"e\" or ch == \"i\" or ch == \"o\" or ch == \"u\". Initialize vowels = 0 before the loop, add 1 inside the if, print after the loop.",
      starter: `text = "loops make python powerful"

# TODO: a vowel accumulator, born before the loop

# TODO: loop over every character, count the vowels with or

# TODO: print the total
`,
      solution: `text = "loops make python powerful"

vowels = 0
for ch in text:
    if ch == "a" or ch == "e" or ch == "i" or ch == "o" or ch == "u":
        vowels = vowels + 1

print("vowels found:", vowels)
`,
      expectedOutput: `vowels found: 8`,
      concepts: ["for loops", "strings", "logical operators", "accumulator pattern"],
    },

    // ---- intermediate
    {
      id: "d-i1",
      tier: "intermediate",
      title: "Find the first amount over 100",
      prompt:
        "You are auditing amounts = [12, 45, 8, 120, 95, 300, 40]. Using a for loop with the find-the-first search pattern, find the FIRST amount over 100, print 'first amount over 100:' followed by the amount, print how many items you examined to find it ('checked N items to find it'), and stop searching immediately — the 300 later in the list must never be examined or printed. A checked counter that grows on every iteration tells you how far you got; break stops the search the moment the match is found.",
      hint: "checked = 0 before the loop. Each lap: checked = checked + 1 first, then the if. When amount > 100, print both lines and break — the prints belong inside the if, above the break.",
      starter: `amounts = [12, 45, 8, 120, 95, 300, 40]

checked = 0
# TODO: loop, count as you go, find the first amount over 100, break
`,
      solution: `amounts = [12, 45, 8, 120, 95, 300, 40]

checked = 0
for amount in amounts:
    checked = checked + 1
    if amount > 100:
        print("first amount over 100:", amount)
        print("checked", checked, "items to find it")
        break
`,
      expectedOutput: `first amount over 100: 120
checked 4 items to find it`,
      concepts: ["break", "search pattern", "accumulator pattern"],
    },
    {
      id: "d-i2",
      tier: "intermediate",
      title: "Skip the negatives",
      prompt:
        "The list deposits = [150, -20, 300, -45, 500, -5, 250] mixes real deposits (positive) with reversals (negative). Using one for loop with the filtering pattern — a guard if, then continue — process only the positive amounts: grow a valid counter and a total accumulator, and print exactly two lines after the loop: 'valid deposits: 4' and 'total deposited: 1200'. The negatives must be skipped by continue, not filtered by restructuring the if — the point of this exercise is the guard-and-skip shape.",
      hint: "Inside the loop: if amount < 0: continue — then the work below it only runs for positives. Both accumulators are born before the loop and printed after it.",
      starter: `deposits = [150, -20, 300, -45, 500, -5, 250]

# TODO: two accumulators born before the loop

# TODO: one for loop: guard with continue for negatives, grow both

# TODO: print the two report lines
`,
      solution: `deposits = [150, -20, 300, -45, 500, -5, 250]

valid = 0
total = 0
for amount in deposits:
    if amount < 0:
        continue  # reversals are skipped
    valid = valid + 1
    total = total + amount

print("valid deposits:", valid)
print("total deposited:", total)
`,
      expectedOutput: `valid deposits: 4
total deposited: 1200`,
      concepts: ["continue", "filtering pattern", "accumulator pattern"],
    },
    {
      id: "d-i3",
      tier: "intermediate",
      title: "Fix the broken score report",
      prompt:
        "Debugging practice. The starter below should print '=== SCORE REPORT ===', one 'score N: value' line per score, and finish with 'Average: 87.40' printed ONCE — but it contains three bugs: (1) the loop visits only 4 of the 5 scores, (2) the total accumulator is reborn as 0 on every lap, and (3) the footer is printed inside the loop. Fix all three. THEN diagnose bug 4, shown here: 'n = 5 / while n > 0: / print(n)' — this loop would run forever. Add a short comment at the end of your program explaining WHY it never ends and which one line fixes it.",
      hint: "Bug 1: the loop must visit every index — range(len(scores)) gives 0..4. Bug 2: total = 0 belongs BEFORE the loop. Bug 3: the Average print belongs AFTER the loop, at zero indentation. Bug 4: nothing inside that while body ever changes n, so the gate never goes False.",
      starter: `scores = [88, 92, 79, 93, 85]

# BUG 1: this loop visits only 4 of the 5 scores
for i in range(len(scores) - 1):
    score = scores[i]
    # BUG 2: the total is reborn as 0 on every single lap
    total = 0
    total = total + score
    print(f"score {i + 1}: {score}")

    # BUG 3: the report footer is printed inside the loop
    print(f"Average: {total / 5:.2f}")
`,
      solution: `scores = [88, 92, 79, 93, 85]

print("=== SCORE REPORT ===")

# Bug 1 fix: visit every index (0..4), not len - 1
# Bug 2 fix: the accumulator is born BEFORE the loop
total = 0
for i in range(len(scores)):
    score = scores[i]
    total = total + score
    print(f"score {i + 1}: {score}")

# Bug 3 fix: the footer prints AFTER the loop, once
print(f"Average: {total / len(scores):.2f}")

# Bug 4 diagnosis: the while loop never updates n, so the condition
# n > 0 stays True forever -- an infinite loop. Fix: add n = n - 1
# as the last line of the loop body.
`,
      expectedOutput: `=== SCORE REPORT ===
score 1: 88
score 2: 92
score 3: 79
score 4: 93
score 5: 85
Average: 87.40`,
      concepts: ["debugging", "accumulator pattern", "range(len())", "infinite loops"],
    },
    {
      id: "d-i4",
      tier: "intermediate",
      title: "The number triangle",
      prompt:
        "Build the classic number triangle with NESTED loops: five rows, where row N contains the numbers 1 through N separated by single spaces. Row 1 prints '1', row 2 prints '1 2', up to row 5 printing '1 2 3 4 5'. The outer loop runs over rows 1..5; the inner loop runs over the numbers 1..row, gluing each number (converted with str()) onto a line accumulator born empty before the inner loop. Print each finished line after the inner loop.",
      hint: "Outer: for row in range(1, 6). Before the inner loop: line = \"\". Inner: for n in range(1, row + 1): line = line + str(n) + \" \". Then print(line) after the inner loop, still inside the outer body.",
      starter: `# Row 1: 1 ... row 5: 1 2 3 4 5
# TODO: outer loop over rows

    # TODO: a line accumulator, born empty

    # TODO: inner loop over 1..row, gluing numbers on

    # TODO: print the finished line
`,
      solution: `# Row 1: 1 ... row 5: 1 2 3 4 5
for row in range(1, 6):
    line = ""
    for n in range(1, row + 1):
        line = line + str(n) + " "
    print(line)
`,
      expectedOutput: `1
1 2
1 2 3
1 2 3 4
1 2 3 4 5`,
      concepts: ["nested loops", "string accumulator", "str()"],
    },

    // ---- advanced
    {
      id: "d-a1",
      tier: "advanced",
      title: "The centered pyramid builder",
      prompt:
        "Build a centered pyramid of stars with height 5 using ONE outer loop and INNER loops (not string repetition — build the spaces and the stars with loops and string concatenation this time). Each row is (height - row) spaces followed by (2 * row - 1) stars: row 1 has 4 spaces and 1 star, row 5 has 0 spaces and 9 stars. The expected output shows the exact five lines. Use a line accumulator, an inner loop for the spaces, then an inner loop for the stars.",
      hint: "Per row: spaces = height - row, stars = 2 * row - 1. line = \"\" first, then for s in range(spaces): line = line + \" \", then for s in range(stars): line = line + \"*\", then print(line).",
      starter: `height = 5

# TODO: outer loop over rows 1..height
    # TODO: compute spaces and stars for this row
    # TODO: build the line with two inner loops (spaces, then stars)
    # TODO: print the line
`,
      solution: `height = 5

for row in range(1, height + 1):
    spaces = height - row
    stars = 2 * row - 1

    line = ""
    for s in range(spaces):
        line = line + " "
    for s in range(stars):
        line = line + "*"

    print(line)
`,
      expectedOutput: `    *
   ***
  *****
 *******
*********`,
      concepts: ["nested loops", "row formulas", "string accumulator"],
    },
    {
      id: "d-a2",
      tier: "advanced",
      title: "FuzzBizz — a FizzBuzz variant",
      prompt:
        "The FizzBuzz variant from the interview dungeon: print the numbers 1 to 24, but for multiples of 4 print 'Fuzz' instead, for multiples of 6 print 'Bizz', and for multiples of BOTH (that is, multiples of 12) print 'FuzzBizz'. Lesson d-07 taught you the trap: the combined case is a subset of the single cases, so the check order decides whether you pass. Get the order right, print one value per line for all 24 numbers.",
      hint: "Most specific first: if n % 12 == 0 (both), elif n % 4 == 0, elif n % 6 == 0, else the number. The multiples of 12 in 1..24 are 12 and 24.",
      starter: `# Fuzz (4), Bizz (6), FuzzBizz (both = 12) over 1..24
for n in range(1, 25):
    # TODO: the elif chain, most specific check first
    pass_placeholder = n  # remove this line once you write your chain
`,
      solution: `# Fuzz (4), Bizz (6), FuzzBizz (both = 12) over 1..24
for n in range(1, 25):
    if n % 12 == 0:
        print("FuzzBizz")
    elif n % 4 == 0:
        print("Fuzz")
    elif n % 6 == 0:
        print("Bizz")
    else:
        print(n)
`,
      expectedOutput: `1
2
3
Fuzz
5
Bizz
7
Fuzz
9
10
11
FuzzBizz
13
14
15
Fuzz
17
Bizz
19
Fuzz
21
22
23
FuzzBizz`,
      concepts: ["FizzBuzz", "elif chains", "check order", "modulo"],
    },
    {
      id: "d-a3",
      tier: "advanced",
      title: "The prime checker",
      prompt:
        "A prime number is divisible only by 1 and itself. Check each number in candidates = [2, 9, 15, 17, 25, 29, 97] and print one line per number: 'N is prime' or 'N is not prime (divisible by D)' where D is the smallest divisor you found (3 for 9, 5 for 25). Structure: an outer loop over the candidates; inside, an inner loop for d in range(2, n) that breaks the moment n % d == 0; use a divisor variable (0 means 'no divisor found', so the number is prime). Handle 2 correctly — range(2, 2) is empty, so the inner loop runs zero times and 2 is correctly reported prime.",
      hint: "divisor = 0 before the inner loop. Inside: if n % d == 0: divisor = d, then break. After the inner loop: divisor == 0 means prime. Remember str(divisor) + \")\" for the closing parenthesis in the not-prime line.",
      starter: `candidates = [2, 9, 15, 17, 25, 29, 97]

# TODO: outer loop over candidates
    # TODO: divisor = 0 (meaning: no divisor found yet)
    # TODO: inner loop d in range(2, n): if n % d == 0, remember d and break
    # TODO: after the inner loop, print prime or not-prime-with-divisor
`,
      solution: `candidates = [2, 9, 15, 17, 25, 29, 97]

for n in candidates:
    divisor = 0  # 0 means: no divisor found yet
    for d in range(2, n):
        if n % d == 0:
            divisor = d
            break

    if divisor == 0:
        print(n, "is prime")
    else:
        print(n, "is not prime (divisible by", str(divisor) + ")")
`,
      expectedOutput: `2 is prime
9 is not prime (divisible by 3)
15 is not prime (divisible by 3)
17 is prime
25 is not prime (divisible by 5)
29 is prime
97 is prime`,
      concepts: ["nested loops", "break", "modulo", "flags"],
    },
    {
      id: "d-a4",
      tier: "advanced",
      title: "The Collatz climb",
      prompt:
        "The famous Collatz sequence: start from any number n; while n is not 1, apply one rule — if n is even, halve it (n // 2); if n is odd, compute 3 * n + 1. Every known starting value eventually reaches 1. Start from n = 7 and print every value the sequence takes AFTER the start, one per line, in the format 'step  1: 22' (step number right-aligned in 2 characters, which you have seen as {:>2}) — and after the loop print '7 reached 1 in 16 steps'. Use a while loop with a step counter accumulator; the start value 7 must be saved in a separate variable before the loop changes it.",
      hint: "start = 7, n = 7, steps = 0. While n != 1: apply the even/odd rule, steps = steps + 1, print(f\"step {steps:>2}: {n}\"). After: print(f\"{start} reached 1 in {steps} steps\"). Even test: n % 2 == 0.",
      starter: `start = 7
n = start
steps = 0

# TODO: while n != 1: apply the rule (even: halve, odd: 3n+1), count and print
`,
      solution: `start = 7
n = start
steps = 0

while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps = steps + 1
    print(f"step {steps:>2}: {n}")

print(f"{start} reached 1 in {steps} steps")
`,
      expectedOutput: `step  1: 22
step  2: 11
step  3: 34
step  4: 17
step  5: 52
step  6: 26
step  7: 13
step  8: 40
step  9: 20
step 10: 10
step 11: 5
step 12: 16
step 13: 8
step 14: 4
step 15: 2
step 16: 1
7 reached 1 in 16 steps`,
      concepts: ["while loops", "if/else", "accumulator pattern", "format specs"],
    },
  ],

  // =====================================================================
  // PART D ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "d-as-1",
      prompt: "Predict the output: for i in range(3): print(i)",
      options: [
        { text: "0, then 1, then 2 — each on its own line", correct: true, feedback: "Correct — range(3) starts at 0 and stops before 3: three laps numbered 0, 1, 2." },
        { text: "1, then 2, then 3 — each on its own line", correct: false, feedback: "That is range(1, 4). With only a stop value, range always starts at 0." },
        { text: "0, 1, 2, 3 — each on its own line", correct: false, feedback: "Four numbers would be range(4). The stop value 3 is the fence — never handed out." },
      ],
      explanation: "range(stop) counts 0, 1, ... up to but not including stop. Three laps: 0, 1, 2.",
    },
    {
      id: "d-as-2",
      prompt: "Predict the output: n = 1 / while n < 4: print(n) / n = n + 1 (with print(n) and n = n + 1 indented as the loop body)",
      options: [
        { text: "1, then 2, then 3", correct: true, feedback: "Correct — the gate is True for 1, 2, 3; when n becomes 4 the gate 4 < 4 is False and the loop ends." },
        { text: "1, 2, 3, 4", correct: false, feedback: "When n is 4, the check 4 < 4 is False — so 4 never prints. Off-by-one, caught by tracing." },
        { text: "The loop never runs", correct: false, feedback: "The very first check is 1 < 4 — True — so the body definitely runs." },
      ],
      explanation: "Trace the gate: 1 (True), 2 (True), 3 (True), 4 (False). Three prints: 1, 2, 3.",
    },
    {
      id: "d-as-3",
      prompt: "Predict the output: for i in range(2, 10, 3): print(i)",
      options: [
        { text: "2, then 5, then 8", correct: true, feedback: "Correct — start at 2, step 3: 2, 5, 8 — and 8 + 3 = 11 is past the fence of 10." },
        { text: "2, 5, 8, 11", correct: false, feedback: "11 is past the stop value 10 — the step never walks through the fence." },
        { text: "2, 4, 6, 8", correct: false, feedback: "That is a step of 2. The third argument here is the step: 3." },
      ],
      explanation: "Start 2, step 3, stop before 10: the numbers 2, 5, 8 — the next hop (11) overshoots the fence.",
    },
    {
      id: "d-as-4",
      prompt: "Predict the output: for n in [4, 7, 9, 12, 3]: if n > 10: print(\"big:\", n) / break — with the if and break correctly indented inside the loop, and print(\"done\") after the loop",
      options: [
        { text: "big: 12, then done", correct: true, feedback: "Correct — 4, 7, 9 fail the test; 12 passes, prints, and break ends the loop; then the line after the loop runs." },
        { text: "big: 12, then the loop continues to 3, then done", correct: false, feedback: "break ends the loop immediately — 3 is never examined." },
        { text: "done only", correct: false, feedback: "12 does pass the n > 10 test, so the print inside the if runs before the break." },
      ],
      explanation: "The search runs until the first match: 12 is the first (and only) number over 10, so 'big: 12' prints, break fires, and 'done' follows.",
    },
    {
      id: "d-as-5",
      prompt: "Predict the output: count = 0 / for n in [1, 2, 3, 4, 5]: if n % 2 == 0: continue / count = count + 1 / print(count) — with the if-continue and the count update indented as the loop body",
      options: [
        { text: "3", correct: true, feedback: "Correct — the evens 2 and 4 hit continue and skip the count update; the odds 1, 3, 5 count. Three." },
        { text: "5", correct: false, feedback: "That would be true with no continue at all — the continue skips the counting for evens." },
        { text: "2", correct: false, feedback: "Two is the count of EVENS — the ones skipped. The count grows only for odds: 1, 3, 5." },
      ],
      explanation: "continue cuts the lap short for 2 and 4, so only 1, 3, 5 reach the counter: count ends at 3.",
    },
    {
      id: "d-as-6",
      prompt: "A nested loop: the outer loop runs for 3 laps, the inner loop runs for 4 laps per outer lap, and nothing breaks. How many times does the innermost body run?",
      options: [
        { text: "12", correct: true, feedback: "Correct — nested loops multiply: 3 x 4 = 12 body runs." },
        { text: "7", correct: false, feedback: "That is 3 + 4. Nesting multiplies; it never adds." },
        { text: "4", correct: false, feedback: "That is one outer lap's worth. Each of the 3 outer laps gets its own full inner run of 4." },
      ],
      explanation: "Total work = outer laps times inner laps: 3 x 4 = 12. This multiplication rule is how you estimate loop cost before writing it.",
    },
    {
      id: "d-as-7",
      prompt: "In FizzBuzz, a candidate writes: if n % 3 == 0: print('Fizz') / elif n % 5 == 0: ... / elif n % 15 == 0: print('FizzBuzz'). What goes wrong?",
      options: [
        { text: "15 prints 'Fizz' — the n % 3 branch catches it first because 15 is divisible by 3, so the combined branch is unreachable", correct: true, feedback: "Exactly the classic trap: elif chains stop at the first True, and 15 % 3 == 0 is True." },
        { text: "Nothing — the n % 15 branch still runs for 15 because it is the most specific", correct: false, feedback: "Elif chains have no idea what 'most specific' means — they simply stop at the first True branch." },
        { text: "The program crashes on 15 with a TypeError", correct: false, feedback: "No crash — 15 quietly gets the wrong label. That is what makes the bug so sneaky." },
      ],
      explanation: "Order is logic in an elif chain: the combined check must come first, or the broader checks swallow the numbers that match both.",
    },
    {
      id: "d-as-8",
      prompt: "When does the else block of a for...else loop run?",
      options: [
        { text: "Only when the loop ran to completion without hitting a break", correct: true, feedback: "Correct — read it as 'no break': the loop finished the whole race, so the else runs." },
        { text: "On every iteration where the if inside was False", correct: false, feedback: "The else pairs with the FOR line, not with any if — it runs once after the loop, or not at all." },
        { text: "Only when the loop body never ran at all", correct: false, feedback: "An empty run still counts as 'finished without break' — the else would run. But that is not the only case." },
      ],
      explanation: "for...else answers one question: did the loop finish without breaking? Yes means the else runs — 'no break' is the rule.",
    },
  ],

  // =====================================================================
  // PART D MINI PROJECT
  // =====================================================================
  project: {
    title: "The Multiplication Table Studio",
    brief:
      "You are building a small studio that prints multiplication tables and pattern art — a program with four acts that exercises every loop skill from this part. Act 1 prints the full 1-to-10 multiplication grid as an aligned table with a header row and a divider, built from nested loops. Act 2 prints one deep, chosen times table (all the way to 12 x 12) with straight columns. Act 3 is a star-pattern gallery: a right triangle and a centered pyramid, drawn from the row formulas you derived in lesson d-07. Act 4 processes a hardcoded list of sensor readings with accumulator loops and prints a formatted report: count, sum, minimum, maximum, and average. The finished program is the longest thing you have written — and every line of it is a loop you can now explain.",
    requirements: [
      "A file-header comment block at the top: what the program is, who wrote it, and the date",
      "Act 1: the full 1-10 grid, built with a NESTED loop (outer rows 1..10, inner columns 1..10), with a header row of column numbers and a divider line made of dashes",
      "Every grid cell and header number printed with an f-string format spec at least 4 characters wide (like f\"{row * col:>4}\") so all columns line up",
      "Act 2: a chosen table (variable chosen = 12) printed for multipliers 1..12 with aligned columns, a title using an f-string, and a divider drawn with string repetition",
      "Act 3: a star gallery with at least two patterns — a right triangle of height 5 and a centered pyramid of height 5 (spaces = height - row, stars = 2 * row - 1)",
      "Act 4: process the hardcoded list readings = [23, 41, 17, 55, 8, 39] with ONE for loop that grows count and total accumulators and updates smallest and largest with if checks (no min()/max()/sum() builtins — the loop is the point)",
      "Act 4 prints a five-line report (Count, Sum, Minimum, Maximum, Average) with the average formatted with :.2f",
      "Every act opens with a section comment banner, and the whole program runs top to bottom with zero errors",
    ],
    steps: [
      "Step 1 — Create the file studio.py with the header comment block only, and run it: an empty run is your working baseline.",
      "Step 2 — Act 1 header: print the corner label and the column numbers 1..10, each with :>4 and end=\"\", then close the line, then print the divider: \"----+\" followed by \"-\" * 40.",
      "Step 3 — Act 1 grid: nested loops — the outer loop over rows 1..10 prints f\"{row:>3} |\" with end=\"\", the inner loop over columns prints f\"{row * col:>4}\" with end=\"\", and the outer body ends with a bare print().",
      "Step 4 — Act 2: set chosen = 12, print a title with an f-string and a divider with \"-\" * 20, then one loop over 1..12 printing f\"{i:>2} x {chosen} = {i * chosen:>4}\".",
      "Step 5 — Act 3: the right triangle with \"*\" * row for rows 1..5, then the centered pyramid with the spaces/stars formulas from d-07. Label each pattern with a small header line.",
      "Step 6 — Act 4: seed count = 0, total = 0, smallest = readings[0], largest = readings[0] BEFORE the loop; inside one loop grow count and total and update smallest and largest with two if checks; after the loop print the five report lines with the average as f\"{average:.2f}\".",
      "Step 7 — The review pass: run the whole program, read every line of output, and fix alignment until every column is straight. Then show somebody your grid — you wrote a program that draws tables.",
    ],
    starter: `# ============================================================
# THE MULTIPLICATION TABLE STUDIO
# Author: (your name)
# Date: (today's date)
# What: prints aligned multiplication tables, a star gallery,
#       and a number report -- all built from loops
# ============================================================

# ---------- Act 1: the full 1-10 grid ----------
size = 10
# TODO 1: print the header row (corner label + column numbers 1..10,
#         each :>4 wide with end="")
# TODO 2: print the divider: "----+" + "-" * (4 * size)
# TODO 3: the nested-loop grid -- outer rows 1..size printing the row
#         label f"{row:>3} |" with end="", inner columns 1..size printing
#         f"{row * col:>4}" with end="", then a bare print() to close the row

# ---------- Act 2: one chosen table, printed deeper ----------
chosen = 12
# TODO 4: a title with an f-string, a divider with "-" * 20, and one loop
#         over 1..chosen printing f"{i:>2} x {chosen} = {i * chosen:>4}"

# ---------- Act 3: the star gallery ----------
height = 5
# TODO 5: the right triangle: "*" * row for row 1..height
# TODO 6: the centered pyramid: spaces = height - row, stars = 2 * row - 1

# ---------- Act 4: the number report ----------
readings = [23, 41, 17, 55, 8, 39]
# TODO 7: seed count, total, smallest, largest BEFORE the loop; grow and
#         update them inside ONE loop; print the five report lines after it
#         (average with :.2f)
`,
    concepts: ["nested loops", "range()", "accumulator pattern", "format specs", "string repetition", "comments"],
    extension:
      "Two stretch goals once the four acts run clean. (1) The diamond: after the pyramid, print the same shape shrinking back down — rows of 7, 5, 3, 1 stars — so the two halves form a diamond. (2) The times-table quiz generator: for a chosen table (say 7), print five questions 'Q1: What is 3 x 7?' each with its answer '(answer: 21)' on the same line, built with a loop and f-strings — and if you are feeling strong, a nested loop that generates quizzes for tables 2, 3, and 4 at once.",
  },
};
