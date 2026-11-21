/**
 * PART E — DATA STRUCTURES
 *
 * The heart of the course's data thread: the four core containers
 * (lists, tuples, sets, dictionaries), then indexing, slicing, iteration,
 * and nested structures. Lesson order: lists -> tuples -> sets ->
 * dictionaries -> indexing -> slicing -> iteration -> nesting.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 */
import type { Part } from "@/lib/course/types";

export const PART_E: Part = {
  letter: "E",
  title: "Data Structures",
  tagline: "Lists, tuples, sets, and dictionaries — Python's containers",
  description:
    "The four core collections, plus indexing, slicing, iteration, and nested structures — the toolkit of all data work.",
  lessons: [
    // ------------------------------------------------------------- e-01
    {
      slug: "e-01",
      title: "Lists",
      minutes: 18,
      summary:
        "The list: one name holding many values in order. Learn to build one, grow and shrink it with methods, search it, and the aliasing trap that bites every beginner exactly once.",
      kind: "concept",
      objectives: [
        "Create a list of numbers, strings, or mixed values and read it back",
        "Add, insert, remove, and pop items using list methods",
        "Measure a list with len() and search it with the in operator",
        "Explain why b = a does NOT copy a list — and copy it with a[:]",
      ],
      why: "Almost no real program works with a single value. A gradebook holds many scores, a shop holds many products, a week holds many temperature readings — and so far you would have had to invent a new variable for each one. Lists remove that ceiling: one name, many values, in order, changeable at will. This lesson is the doorway into every data task in this course — the records, tables, and datasets you will meet later all grow from the humble list you build here.",
      blocks: [
        {
          kind: "text",
          text: "You already live with lists: a shopping list on the fridge is one piece of paper holding many items, in the order you wrote them. You cross things off, you squeeze *milk* in at the top, you count what is left. Python has exactly that tool, and it is called a **list**.",
        },
        {
          kind: "heading",
          text: "What a list is",
        },
        {
          kind: "text",
          text: "A **list** is an ordered collection of values. You write it with **square brackets**, items separated by commas: `scores = [88, 92, 79, 95]`. Every item keeps its position, and the list itself can change at any time — programmers call that **mutable**. Lists can hold numbers, strings, booleans, or a mix of all of them.",
        },
        {
          kind: "code",
          title: "Three lists, three kinds of contents",
          code: `scores = [88, 92, 79, 95]
names = ["Ada", "Grace", "Linus"]
mixed = ["Ada", 36, True]

print(scores)
print(names)
print(mixed)
`,
          output: `[88, 92, 79, 95]
['Ada', 'Grace', 'Linus']
['Ada', 36, True]`,
          outputNote: "Real output, produced by running this exact code with Python 3.12.",
          explain: [
            "**Line 1** — `scores` holds four integers. Printing a list shows the brackets and every item, in order.",
            "**Line 2** — text items work exactly the same way. Python shows strings with single quotes when it prints a list.",
            "**Line 3** — a list can mix types freely: here a string, an integer, and a boolean. Python does not complain.",
            "The order you see is the order you built. A list remembers it — that is what *ordered* means.",
          ],
        },
        {
          kind: "heading",
          text: "Growing and shrinking: list methods",
        },
        {
          kind: "code",
          title: "append, insert, pop, remove — the big four",
          code: `scores = [88, 92, 79]

scores.append(95)          # add to the END
print(scores)

scores.insert(1, 100)      # squeeze 100 in at position 1
print(scores)

removed = scores.pop()     # take the LAST item off the end
print(removed)
print(scores)

scores.remove(92)          # remove the first item that EQUALS 92
print(scores)
`,
          output: `[88, 92, 79, 95]
[88, 100, 92, 79, 95]
95
[88, 100, 92, 79]
[88, 100, 79]`,
          explain: [
            "`append(95)` puts 95 at the end — the workhorse of Python. New data almost always arrives with append.",
            "`insert(1, 100)` pushes 100 into position 1; everything from the old index 1 onward slides one slot right. So 92, which was at index 1, is now at index 2.",
            "`pop()` removes the last item **and hands it back** — that is why `removed` could catch the value 95.",
            "`remove(92)` deletes by **value**, not by position: it searches for the first 92 and takes it out. If there is no 92, it raises an error instead of staying silent.",
          ],
        },
        {
          kind: "table",
          title: "The list methods you will use constantly",
          headers: ["Method", "What it does", "Returns"],
          rows: [
            ["append(item)", "Adds item to the end of the list", "None — changes the list in place"],
            ["insert(index, item)", "Squeezes item in at index, shifting the rest right", "None"],
            ["remove(value)", "Removes the FIRST item equal to value (searches by value)", "None"],
            ["pop()", "Removes the last item from the list", "The removed item"],
            ["index(value)", "Finds the position of the first item equal to value", "The position (an int)"],
            ["count(value)", "Counts how many items equal value", "The count (an int)"],
          ],
          caption:
            "Notice the Returns column: append, insert, and remove change the list and give back None; pop is the one that hands you the item. index() gets a full lesson of its own in e-05.",
        },
        {
          kind: "heading",
          text: "How many? Is it there?",
        },
        {
          kind: "code",
          title: "len() counts, in answers",
          code: `scores = [88, 92, 79]

print(len(scores))
print(92 in scores)
print(60 in scores)
print(60 not in scores)
`,
          output: `3
True
False
True`,
          explain: [
            "`len(scores)` returns the number of items — 3 here. You met len() with strings in Part B; it works on every container.",
            "`92 in scores` asks a yes/no question: *is 92 one of the items?* The answer is a boolean.",
            "`not in` flips the question. These two little words replace a whole hand-written search loop.",
          ],
        },
        {
          kind: "heading",
          text: "Aliasing: two names, one list",
        },
        {
          kind: "text",
          text: "Here is the trap that bites every beginner exactly once. After `b = a`, most people believe they now have **two lists**. They do not. Assignment does not copy the list — it gives the *same list* a second name. Programmers call this **aliasing**.",
        },
        {
          kind: "visual",
          title: "One list or two? What the machine sees",
          ascii: `  b = a        (assignment: ONE list, two names)

      name "a" ----+
                   +-->  [ 1, 2, 3 ]      one list in memory
      name "b" ----+

  b = a[:]      (slice copy: TWO lists, same values)

      name "a" ------>  [ 1, 2, 3 ]      list #1
      name "b" ------>  [ 1, 2, 3 ]      list #2 (a separate copy)
`,
          caption:
            "After b = a, a and b are two labels on the same box. After b = a[:], there are two boxes that happen to hold equal values.",
        },
        {
          kind: "code",
          title: "The aliasing demo — watch both names",
          code: `a = [1, 2, 3]
b = a               # NOT a copy: one list, two names

b.append(4)         # change it through b...

print("a:", a)      # ...and a sees the change too
print("b:", b)
`,
          output: `a: [1, 2, 3, 4]
b: [1, 2, 3, 4]`,
          explain: [
            "`b = a` made *b* another name for the same list — no new list was created.",
            "The append happened once, on that single shared list.",
            "Both names print the same list, 4 included. If you expected `a` to still be `[1, 2, 3]`, you have just met mutability's sharp edge.",
          ],
        },
        {
          kind: "code",
          title: "The fix: copy with a slice",
          code: `a = [1, 2, 3]
b = a[:]            # a COPY: a new list with the same items

b.append(4)

print("a:", a)
print("b:", b)
`,
          output: `a: [1, 2, 3]
b: [1, 2, 3, 4]`,
          explain: [
            "`a[:]` is a **slice** of the whole list — and a slice always builds a new list (slices get their own lesson in e-06).",
            "Now the append lands on the copy. `a` is untouched.",
            "`list(a)` and `a.copy()` do the same job; this course uses `a[:]` because it previews slicing.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The one-line rule to remember",
          text: "`b = a` shares. `b = a[:]` copies. If a program mysteriously changes a list you never touched, hunt for a plain assignment somewhere — that is almost always the bug.",
        },
        {
          kind: "tryIt",
          title: "Try it — your shopping list",
          task: "Before the two print lines, do three things: add 'coffee' to the end with append, insert 'butter' at position 0 with insert, and remove 'bread' with remove. Predict the list first, then run.",
          code: `shopping = ["milk", "bread", "eggs"]

# 1. Add "coffee" to the end with append
# 2. Insert "butter" at position 0 with insert
# 3. Remove "bread" with remove

print(shopping)
print("Items to buy:", len(shopping))
`,
          hint: "The three calls are shopping.append(\"coffee\"), shopping.insert(0, \"butter\"), and shopping.remove(\"bread\"). Predict the printed list BEFORE running — prediction is where the learning happens.",
        },
      ],
      terms: [
        { term: "List", definition: "An ordered, changeable collection of values, written with square brackets: [88, 92, 79]." },
        { term: "Element (item)", definition: "One value inside a container. The list [88, 92, 79] has three elements." },
        { term: "Mutable", definition: "Changeable after creation. Lists are mutable: you can add, remove, and replace items any time." },
        { term: "Method", definition: "A function attached to a value, called with a dot: scores.append(95)." },
        { term: "Aliasing", definition: "Two names pointing at the same object in memory. After b = a, both names share one list, and changes through either are seen by both." },
      ],
      mistakes: [
        {
          mistake: "Writing b = a and believing you made a copy of the list.",
          why: "Assignment copies the name, not the object — both variables now point at the same list in memory, so a change through either name is visible through both.",
          fix: "Copy explicitly with b = a[:] (or list(a), or a.copy()) whenever you need two independent lists.",
        },
        {
          mistake: "Writing print(scores.append(100)) and expecting the new list to print.",
          why: "append changes the list in place and returns None — so print shows None and nothing else.",
          fix: "Call append on its own line, then print the list separately: scores.append(100) followed by print(scores).",
        },
        {
          mistake: "Calling remove(2) expecting to delete the item at position 2.",
          why: "remove works by VALUE: it deletes the first item that equals its argument. On [10, 20, 30], remove(2) raises ValueError because no item equals 2.",
          fix: "To delete by position, use pop(2) — it removes and returns the item at index 2.",
        },
      ],
      takeaways: [
        "A list is one name holding many values in order — the shopping list of programming.",
        "append adds to the end, insert squeezes in, remove deletes by value, pop removes by position and hands the item back.",
        "len() counts the items; `in` answers is-it-there without writing a search loop.",
        "b = a gives one list two names — changes leak between them. b = a[:] makes a real copy.",
      ],
      quiz: [
        {
          id: "e-01-q1",
          prompt: "What does scores.pop() give back?",
          options: [
            { text: "None, like every list method", correct: false, feedback: "Not every method: pop is the exception that returns the removed item." },
            { text: "The last item of the list, which is also removed from it", correct: true, feedback: "Exactly — pop removes the final item AND returns it, so you can catch it in a variable." },
            { text: "The new length of the list", correct: false, feedback: "That is len()'s job — pop deals in items, not counts." },
            { text: "The first item of the list", correct: false, feedback: "pop() works from the end. To remove the first item, use pop(0)." },
          ],
          explanation: "pop is the one list-removal method that hands the item back: removed = scores.pop().",
        },
        {
          id: "e-01-q2",
          prompt: "Trace it: a = [1, 2], then b = a, then b.append(3). What does print(a) show?",
          options: [
            { text: "[1, 2]", correct: false, feedback: "That would be true if b were a copy — but plain assignment shares the list." },
            { text: "[1, 2, 3]", correct: true, feedback: "Correct — b is a second name for the SAME list, so the append is visible through a too." },
            { text: "An error, because you cannot change a list through another variable", correct: false, feedback: "No error — Python happily lets both names mutate the one shared list. That is exactly the trap." },
          ],
          explanation: "b = a aliases one list under two names. Only b = a[:] would have protected a.",
        },
        {
          id: "e-01-q3",
          prompt: "Before deleting, you want to check whether 92 is in scores at all. Which line does it?",
          options: [
            { text: "if 92 in scores:", correct: true, feedback: "Right — the in operator answers membership questions as True/False, perfect for a guard before remove." },
            { text: "if scores.includes(92):", correct: false, feedback: "includes() is JavaScript, not Python. Python spells it in." },
            { text: "if scores.find(92):", correct: false, feedback: "There is no find on lists — and even index() would crash if 92 were absent." },
          ],
          explanation: "in is the safe membership test; remove or index can then run under its protection.",
        },
      ],
    },

    // ------------------------------------------------------------- e-02
    {
      slug: "e-02",
      title: "Tuples",
      minutes: 14,
      summary:
        "The tuple: a sealed list that can never change. Learn the comma-first syntax, immutability with a real TypeError, unpacking (including the famous Python swap), and the (5,) versus (5) gotcha.",
      kind: "concept",
      objectives: [
        "Create tuples with parentheses or with plain commas",
        "Explain immutability and recognize the TypeError it raises",
        "Unpack a tuple into several variables in one line",
        "Swap two variables without a temporary variable",
        "Avoid the single-element tuple gotcha: (5,) versus (5)",
      ],
      why: "Some data must never change by accident: the seven days of a week, the (x, y) of a fixed point on a map, an RGB color like (255, 128, 0). Tuples are Python's sealed lists — same ordered shelf, but glued shut at creation. Choosing a tuple is not a style whim: sealed data cannot be mutated by a bug somewhere else in the program, and it tells every future reader of your code 'this is fixed on purpose'. Tuples also unlock unpacking, the one-line trick you will use in nearly every loop over a dictionary from e-07 onward.",
      blocks: [
        {
          kind: "text",
          text: "A shopping list is meant to be scribbled on. A birth date is not. For the scribble-on kind of data Python gives you the list; for the carved-in-stone kind it gives you the **tuple** — think of it as a list sealed in an envelope: you can look at everything inside, but you cannot add, remove, or replace a single item. Programmers call this **immutability**.",
        },
        {
          kind: "heading",
          text: "Making tuples",
        },
        {
          kind: "code",
          title: "Round brackets — or no brackets at all",
          code: `point = (3, 7)            # an (x, y) coordinate
rgb = (255, 128, 0)       # a color: red, green, blue
also_a_tuple = 3, 7       # parentheses optional: the COMMA does the work

print(point)
print(rgb)
print(also_a_tuple)
`,
          output: `(3, 7)
(255, 128, 0)
(3, 7)`,
          explain: [
            "Tuples are written with **parentheses** instead of square brackets — that is the visual difference from lists.",
            "Surprise: the parentheses are actually optional. `3, 7` without any brackets still creates a tuple. The **commas** make the tuple, not the brackets.",
            "That detail will explain a famous gotcha at the end of this lesson.",
          ],
        },
        {
          kind: "heading",
          text: "Sealed: read all you want, change nothing",
        },
        {
          kind: "code",
          title: "Reading a tuple works exactly like reading a list",
          code: `point = (3, 7)

print(point[0])
print(point[1])
print(len(point))
`,
          output: `3
7
2`,
          explain: [
            "Indexing with `[0]` and `[1]`, plus len() — everything you know about reading a list works on a tuple. (Indexing gets its full treatment in e-05.)",
            "So why bother with a second container type? The difference is what happens when you try to WRITE.",
          ],
        },
        {
          kind: "code",
          title: "Trying to change a sealed tuple",
          code: `point = (3, 7)
point[0] = 99        # tuples are immutable: this is not allowed
`,
          expectError: "TypeError: 'tuple' object does not support item assignment",
          explain: [
            "Python refuses, loudly and immediately: *'tuple' object does not support item assignment*.",
            "This crash is a feature. A tuple is a promise that this data will not change — and Python enforces the promise.",
            "Compare the list: `scores[0] = 99` would have worked silently. With tuples, mutations are impossible, not just discouraged.",
          ],
        },
        {
          kind: "heading",
          text: "Unpacking: several values, several names",
        },
        {
          kind: "code",
          title: "One tuple, split across variables",
          code: `point = (3, 7)
x, y = point         # unpack: two names, two slots

print("x =", x)
print("y =", y)

width, height = 1920, 1080
print(f"Screen: {width} x {height}")
`,
          output: `x = 3
y = 7
Screen: 1920 x 1080`,
          explain: [
            "`x, y = point` pulls the tuple apart: the first item lands in x, the second in y — one line, no indexing.",
            "The right side `1920, 1080` is itself a tuple (remember: commas, not brackets), packed and immediately unpacked.",
            "The counts must match: three items on the right need three names on the left, or Python raises a ValueError.",
          ],
        },
        {
          kind: "code",
          title: "The famous Python swap",
          code: `a = 1
b = 2
print("before:", a, b)

a, b = b, a          # swap with unpacking — no temporary variable
print("after:", a, b)
`,
          output: `before: 1 2
after: 2 1`,
          explain: [
            "The right side packs the current values (2, 1) into a tuple first, THEN the left side unpacks into a and b.",
            "Other languages need three lines and a temporary variable to do this. Python needs five words.",
            "You will see this pattern everywhere in real code — and it works for three, four, or more variables too.",
          ],
        },
        {
          kind: "heading",
          text: "The single-element gotcha",
        },
        {
          kind: "code",
          title: "(5) is not a tuple — the comma is missing",
          code: `not_a_tuple = (5)          # just parentheses: Python sees the NUMBER 5
real_tuple = (5,)          # the comma makes it a tuple

print(not_a_tuple)
print(real_tuple)
print(type(not_a_tuple))
print(type(real_tuple))
`,
          output: `5
(5,)
<class 'int'>
<class 'tuple'>`,
          explain: [
            "`(5)` is the number 5 wearing brackets — parentheses here are just grouping, the way they are in `(2 + 3) * 4`.",
            "`(5,)` is a one-item tuple. The trailing comma is not a typo; it is the only thing telling Python a tuple is intended.",
            "type() settles it: int versus tuple. When you need a one-item tuple, the comma is mandatory.",
          ],
        },
        {
          kind: "heading",
          text: "When to choose a tuple",
        },
        {
          kind: "code",
          title: "Fixed data, declared once, trusted forever",
          code: `DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

print("Days in a week:", len(DAYS))
print("First day:", DAYS[0])
print("Last day:", DAYS[-1])     # negative indexing — full story in e-05
`,
          output: `Days in a week: 7
First day: Mon
Last day: Sun`,
          explain: [
            "The week is fixed by nature — seven days, same order, forever. A tuple states that in the data itself.",
            "The uppercase name `DAYS` is a Python convention for constants: values nobody is supposed to touch.",
            "`DAYS[-1]` reaching the last item is a preview of e-05 — negative indexing works on every ordered container.",
          ],
        },
        {
          kind: "table",
          title: "List or tuple? The decision in one glance",
          headers: ["", "List", "Tuple"],
          rows: [
            ["Written as", "[88, 92, 79]", "(3, 7)"],
            ["Changeable?", "Yes — append, insert, remove, pop", "No — sealed at creation"],
            ["Signal to readers", "'This data will grow and change'", "'This data is fixed on purpose'"],
            ["Typical use", "grades arriving one by one, a shopping list, this week's readings", "the days of a week, an (x, y) point, an RGB color"],
          ],
          caption:
            "The rule of thumb: if the collection will ever gain or lose items, use a list. If it is complete and final by nature, seal it in a tuple.",
        },
        {
          kind: "tryIt",
          title: "Try it — pack and unpack a day of readings",
          task: "Run this as-is first. Then add a FOURTH reading to the tuple (say 18.0) and a fourth name on the unpacking line, and run again. Finally, try adding the fourth reading WITHOUT the fourth name and read the ValueError carefully — counts must match.",
          code: `reading = (21.5, 23.0, 19.5)

morning, noon, night = reading

print("Morning:", morning)
print("Noon:", noon)
print("Night:", night)
`,
          hint: "Four slots need four names: morning, noon, evening, night = (21.5, 23.0, 20.0, 19.5). The mismatch error you will meet is ValueError: too many values to unpack (expected 3).",
        },
      ],
      terms: [
        { term: "Tuple", definition: "An ordered, immutable collection, written (3, 7) — or just 3, 7. Readable like a list, but sealed against change." },
        { term: "Immutability", definition: "The property of values that can never change after creation. Tuples are immutable; lists are not." },
        { term: "Unpacking", definition: "Assigning the items of a container to several variables in one line: x, y = point." },
        { term: "Single-element tuple", definition: "A tuple with exactly one item, written with a mandatory trailing comma: (5,). Without the comma, (5) is just the number 5." },
      ],
      mistakes: [
        {
          mistake: "Writing (5) and expecting a one-item tuple.",
          why: "Parentheses around a single value are just grouping — Python sees the plain number 5, because commas (not brackets) are what build tuples.",
          fix: "Add the trailing comma: (5,). The type() call will confirm the difference.",
        },
        {
          mistake: "Trying to append to or assign into a tuple.",
          why: "Tuples are immutable — there is no append method and no item assignment, so Python raises TypeError immediately.",
          fix: "If the data must change, it should be a list. If you must change tuple contents, convert with list(my_tuple), change the result, and it is then a different object.",
        },
        {
          mistake: "Leaving a trailing comma after a single value, like name = \"Ada\",",
          why: "The comma silently builds a one-item tuple ('Ada',) — the variable is no longer the string you intended, and later string operations fail mysteriously.",
          fix: "Delete the trailing comma. If a one-item tuple is really what you want, make the comma explicit and obvious.",
        },
      ],
      takeaways: [
        "A tuple is a sealed list: ordered and readable, but immutable — change attempts raise TypeError.",
        "Commas make the tuple; parentheses are decoration. That is why (5) is just 5 but (5,) is a tuple.",
        "Unpacking assigns several items to several names at once: x, y = point.",
        "a, b = b, a swaps two variables with no temporary variable — the most-quoted line in Python.",
        "Rule of thumb: data that will change lives in a list; data that is fixed by nature lives in a tuple.",
      ],
      quiz: [
        {
          id: "e-02-q1",
          prompt: "point = (3, 7). What happens when Python runs point[0] = 99?",
          options: [
            { text: "point becomes (99, 7)", correct: false, feedback: "That is list behavior — tuples refuse the write." },
            { text: "TypeError: 'tuple' object does not support item assignment", correct: true, feedback: "Correct — the tuple is sealed, and Python enforces the seal with an immediate error." },
            { text: "Nothing happens; the line is silently ignored", correct: false, feedback: "Python never silently ignores a failed assignment — it fails loudly." },
          ],
          explanation: "Immutability means the mutation is impossible, not merely discouraged: Python raises TypeError the moment you try.",
        },
        {
          id: "e-02-q2",
          prompt: "Which of these creates a tuple with exactly one item?",
          options: [
            { text: "(5)", correct: false, feedback: "That is the integer 5 in grouping parentheses — no comma, no tuple." },
            { text: "(5,)", correct: true, feedback: "Right — the trailing comma is the tell. type((5,)) is tuple." },
            { text: "[5]", correct: false, feedback: "Square brackets build a one-item LIST — changeable, not sealed." },
            { text: "tuple{5}", correct: false, feedback: "Not Python syntax at all — curly braces are for sets and dicts, coming in e-03 and e-04." },
          ],
          explanation: "One-item tuples need the comma: (5,). It looks strange for about a week, then you stop noticing.",
        },
        {
          id: "e-02-q3",
          prompt: "a, b = b, a does what, exactly?",
          options: [
            { text: "Packs (b, a) into a tuple on the right, then unpacks it into a and b — swapping them", correct: true, feedback: "Exactly — right side is evaluated first, then unpacked. Both variables trade values with no temporary variable." },
            { text: "Compares a and b for equality", correct: false, feedback: "One equals sign is assignment; comparison would be ==." },
            { text: "Raises an error, because a variable cannot appear on both sides", correct: false, feedback: "Variables can absolutely appear on both sides — the right side is fully computed before any assignment happens." },
          ],
          explanation: "Pack the right, unpack into the left: the Pythonic swap, and your first taste of why tuples matter.",
        },
      ],
    },

    // ------------------------------------------------------------- e-03
    {
      slug: "e-03",
      title: "Sets",
      minutes: 15,
      summary:
        "The set: an unordered bag of unique items. Deduplicate any list in one call, do real set math with union, intersection, and difference, and learn why membership checks are its superpower.",
      kind: "concept",
      objectives: [
        "Deduplicate any list in one call with set()",
        "Add and remove items with add(), remove(), and discard()",
        "Answer overlap questions with union, intersection, and difference",
        "Explain why sets refuse indexing — and what to do instead",
        "Choose a set when membership tests need to stay fast on large data",
      ],
      why: "How many unique customers visited your shop? Which words appear in a document at all? Which buyers bought both product A and product B? These are questions about uniqueness and membership — and answering them with lists means writing search loops by hand. Sets answer them in one expression: duplicates collapse on entry, membership tests are engineered to stay fast at any size, and the classic set operations — union, intersection, difference — express exactly the questions data analysts ask every day. This single lesson makes you faster at every data task that follows in this course.",
      blocks: [
        {
          kind: "text",
          text: "A party guest list has one rule above all: nobody is written down twice. Python has a container built around exactly that rule — the **set**. Think of it as a basket with a bouncer: an item shows up, the bouncer checks *have I seen you before?*, and only newcomers get in. The result is a container of **unique** items with **no order at all** — membership is the whole point.",
        },
        {
          kind: "heading",
          text: "A container that refuses duplicates",
        },
        {
          kind: "code",
          title: "The dedup pattern: set() on a list",
          code: `votes = ["ada", "grace", "ada", "linus", "grace", "ada"]
unique_voters = set(votes)

print(votes)
print(sorted(unique_voters))     # sorted(): a predictable list for display
print("Unique voters:", len(unique_voters))
`,
          output: `['ada', 'grace', 'ada', 'linus', 'grace', 'ada']
['ada', 'grace', 'linus']
Unique voters: 3`,
          outputNote:
            "A set itself has no defined order — if you print one raw, Python may show the members in any order, even differently between runs. That is not a bug; it is what 'unordered' means. sorted() turns it into a predictable list for display.",
          explain: [
            "The list keeps every vote, duplicates included — six votes, three voters.",
            "`set(votes)` builds a set from the list: the three 'ada' entries collapse into one, the two 'grace' entries into one.",
            "Because sets are unordered, we print `sorted(unique_voters)` — a tidy, predictable list. The count works with or without sorting.",
            "So six votes become three unique voters — and `set(some_list)` is the dedup pattern you will use for the rest of your career.",
          ],
        },
        {
          kind: "heading",
          text: "Growing and shrinking",
        },
        {
          kind: "code",
          title: "add, and the two ways to remove",
          code: `guests = {"Ada", "Grace"}

guests.add("Linus")
guests.add("Ada")            # already present: silently ignored

print(sorted(guests))

guests.discard("Grace")      # remove if present
guests.discard("Nobody")     # not there: still fine, no complaint

print(sorted(guests))
`,
          output: `['Ada', 'Grace', 'Linus']
['Ada', 'Linus']`,
          explain: [
            "Sets are written with **curly braces** — but never empty ones: `{}` builds a *dictionary* (next lesson), so an empty set is spelled `set()`.",
            "`add(\"Ada\")` on a set that already has Ada changes nothing. No error, no second Ada — that is the bouncer at work.",
            "Notice the prints use `sorted(guests)`, which always returns a predictable **list** — a tidy way to display a container with no order.",
            "`discard` removes quietly whether or not the item is there. Its stricter sibling is next.",
          ],
        },
        {
          kind: "code",
          title: "remove() demands the item exists",
          code: `guests = {"Ada", "Grace"}
guests.remove("Linus")       # not in the set: KeyError
`,
          expectError: "KeyError: 'Linus'",
          explain: [
            "`remove()` deletes like discard — but if the item is missing, it raises **KeyError** instead of shrugging.",
            "Rule of thumb: use remove() when a missing item means something is wrong (you want to hear about it); use discard() when missing is fine.",
          ],
        },
        {
          kind: "heading",
          text: "Set math: union, intersection, difference",
        },
        {
          kind: "code",
          title: "Who takes which class?",
          code: `python_class = {"Ada", "Grace", "Linus"}
sql_class = {"Grace", "Linus", "Mary"}

either = python_class | sql_class     # union: in at least one
both = python_class & sql_class       # intersection: in both
only_python = python_class - sql_class  # difference: in the first only

print(sorted(either))
print(sorted(both))
print(sorted(only_python))
`,
          output: `['Ada', 'Grace', 'Linus', 'Mary']
['Grace', 'Linus']
['Ada']`,
          explain: [
            "**Union** `|` merges without duplicates: four students take at least one of the two classes.",
            "**Intersection** `&` keeps only the overlap: Grace and Linus take both — the students who might be overloaded.",
            "**Difference** `-` keeps what is in the left set but not the right: Ada takes Python only.",
            "These three symbols turn overlap questions about any data — customers, tags, products — into one-line answers.",
          ],
        },
        {
          kind: "table",
          title: "The three set operations, side by side",
          headers: ["Question", "Operator", "Method form", "Reads as"],
          rows: [
            ["In at least one set?", "|", "a.union(b)", "everything in a or b (or both)"],
            ["In both sets?", "&", "a.intersection(b)", "the overlap of a and b"],
            ["Only in the first set?", "-", "a.difference(b)", "a minus whatever b also has"],
          ],
          caption:
            "Operators and method forms are identical in behavior; the operator forms (| & -) are what most working code uses.",
        },
        {
          kind: "heading",
          text: "Why sets exist: the speed of in",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Membership checks: sets are built for them",
          text: "Under the hood, a set stores items by a computed fingerprint, so `x in my_set` jumps straight to the answer — fast whether the set holds 10 items or 10 million. `x in my_list` must scan the list item by item from the front. With a handful of items you will never notice the difference; with a million rows of data it is the difference between instant and waiting. You do not need the internals — bank the rule: big membership questions belong to sets.",
        },
        {
          kind: "heading",
          text: "Unordered means no indexing",
        },
        {
          kind: "code",
          title: "Asking a set for item number 0",
          code: `tags = {"python", "data", "beginner"}
print(tags[0])     # sets have no order: index 0 of WHAT, exactly?
`,
          expectError: "TypeError: 'set' object is not subscriptable",
          explain: [
            "Index 0 means *the first item* — but a set has no first item, because it has no order at all. Python refuses.",
            "If you need a sequence, convert: `sorted(tags)` gives an ordered list of the members.",
            "Slicing (e-06) is refused for the same reason: slicing is positions, and sets have none.",
          ],
        },
        {
          kind: "code",
          title: "The pattern sets are made for: seen it before?",
          code: `seen = {"ada", "grace"}
new_visitor = "ada"

if new_visitor in seen:
    print("Welcome back,", new_visitor)
else:
    seen.add(new_visitor)
    print("First visit:", new_visitor)
`,
          output: `Welcome back, ada`,
          explain: [
            "This is the professional idiom for 'have I seen this before?': keep a set called `seen`, test membership, add newcomers.",
            "It powers deduplication, visited-page trackers, and loop-guards — same shape every time: `if x in seen: ... else: seen.add(x)`.",
            "Notice it uses only tools you already have from Part C: an if/else around a membership test.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The sealed set: frozenset",
          text: "Python also offers `frozenset(...)`: a set sealed like a tuple — no add, no remove. You will rarely create one yourself, but now you know the full family: **list** (ordered, changeable), **tuple** (ordered, sealed), **set** (unordered, unique, changeable), **frozenset** (unordered, unique, sealed).",
        },
        {
          kind: "tryIt",
          title: "Try it — dedup a survey",
          task: "The survey collected seven answers but only three distinct tools. Add two more answers of your own (one duplicate, one brand new), then predict 'Unique answers' and the sorted list BEFORE running.",
          code: `answers = ["python", "excel", "python", "sql", "python", "excel"]

unique_answers = set(answers)
print("Unique answers:", len(unique_answers))
print(sorted(unique_answers))

print("Did anyone say r?", "r" in unique_answers)
`,
          hint: "Duplicating an existing answer changes nothing; only a brand-new tool can raise the unique count. sorted() prints the members as a tidy list, lowest to highest alphabetically.",
        },
      ],
      terms: [
        { term: "Set", definition: "An unordered collection of unique items, written with curly braces: {\"Ada\", \"Grace\"}. Duplicates are impossible by construction." },
        { term: "Union", definition: "The set operation that keeps everything in at least one of two sets: a | b." },
        { term: "Intersection", definition: "The set operation that keeps only items present in both sets: a & b." },
        { term: "Difference", definition: "The set operation that keeps items in the first set but not the second: a - b." },
        { term: "Frozenset", definition: "An immutable set — unique items, but sealed against changes, like a tuple among sets." },
      ],
      mistakes: [
        {
          mistake: "Expecting a set to keep insertion order or print in a stable order.",
          why: "Sets are unordered by design — Python stores items for fast lookup, not for sequence, so the printed order can even change between runs.",
          fix: "When you need a predictable order for display or processing, convert with sorted(my_set) — it returns an ordered list.",
        },
        {
          mistake: "Trying to read a set item by position: tags[0].",
          why: "Indexing answers 'what is at position 0?' — a question with no meaning for a container that has no positions.",
          fix: "Loop over the set, or convert to a sorted list first: sorted(tags)[0] for the alphabetically first member.",
        },
        {
          mistake: "Calling remove() for an item that might be missing.",
          why: "remove() raises KeyError when the item is absent — it treats absence as a problem worth reporting.",
          fix: "Use discard() when a missing item is acceptable, or guard first: if item in my_set: my_set.remove(item).",
        },
      ],
      takeaways: [
        "A set is a bag of unique items — duplicates collapse on entry, and set(some_list) deduplicates anything in one call.",
        "The bouncer trio: add() lets newcomers in, discard() removes quietly, remove() removes loudly.",
        "Union |, intersection &, and difference - answer overlap questions about any two groups.",
        "Membership tests (in) are what sets are engineered for — fast at any size.",
        "No order means no indexing: sorted(my_set) is the bridge back to a predictable sequence.",
      ],
      quiz: [
        {
          id: "e-03-q1",
          prompt: "votes = ['ada', 'grace', 'ada', 'linus']. What is len(set(votes))?",
          options: [
            { text: "4", correct: false, feedback: "That is the length of the LIST — set() first collapses the duplicate 'ada'." },
            { text: "3", correct: true, feedback: "Correct — ada, grace, and linus: three unique voters, duplicates gone." },
            { text: "1", correct: false, feedback: "Only if all four were identical; here three distinct names survive." },
            { text: "An error, because a list cannot go inside set()", correct: false, feedback: "set() accepts any iterable — turning a list into a set is its most common job." },
          ],
          explanation: "set(votes) deduplicates; len counts what survived: 3.",
        },
        {
          id: "e-03-q2",
          prompt: "python_class = {\"Ada\", \"Grace\", \"Linus\"} and sql_class = {\"Grace\", \"Mary\"}. Which expression gives the students in BOTH classes?",
          options: [
            { text: "python_class | sql_class", correct: false, feedback: "That is union — everyone in at least one class (Ada, Grace, Linus, Mary)." },
            { text: "python_class & sql_class", correct: true, feedback: "Exactly — intersection keeps the overlap: {\"Grace\"}." },
            { text: "python_class - sql_class", correct: false, feedback: "That is difference — Python-only students: {\"Ada\", \"Linus\"}." },
            { text: "python_class + sql_class", correct: false, feedback: "+ does not join sets — that raises TypeError. Union is spelled |." },
          ],
          explanation: "The ampersand is the overlap: who appears on both rosters at once.",
        },
        {
          id: "e-03-q3",
          prompt: "tags = {\"python\", \"data\"}. What happens when Python runs tags[0]?",
          options: [
            { text: "It returns 'data' or 'python' — whichever was stored first", correct: false, feedback: "Tempting, but sets keep no record of insertion order — there is no 'first'." },
            { text: "TypeError: 'set' object is not subscriptable", correct: true, feedback: "Correct — indexing needs positions, and unordered sets have none." },
            { text: "It returns the alphabetically first item", correct: false, feedback: "Sets do not sort either — that is what sorted(tags) is for, and it returns a list." },
          ],
          explanation: "No order means no index. Convert with sorted() when you need positions back.",
        },
      ],
    },

    // ------------------------------------------------------------- e-04
    {
      slug: "e-04",
      title: "Dictionaries",
      minutes: 18,
      summary:
        "The dictionary: values found by name instead of position. Read and write entries, survive missing keys with .get(), loop with .items(), and learn the counting pattern that powers real data analysis.",
      kind: "concept",
      objectives: [
        "Create a dictionary and read values by key",
        "Read missing keys safely with .get() and a default value",
        "Add and update entries, and check membership with in",
        "Loop over a dictionary with .items() and tuple unpacking",
        "Tally anything with the counting pattern: counts[w] = counts.get(w, 0) + 1",
      ],
      why: "Lists find values by position — item number 3. But real data is found by name: the price of a latte, the score of Ada, the capital of Portugal. Searching a list for 'latte' means checking items one by one; a dictionary jumps straight to the answer. Dictionaries are the workhorse of real-world Python — the records of e-08, the data files you will parse in later parts, and the counting patterns of data analysis are all dictionaries underneath. Master the dict now and you can already shape data the way professionals do.",
      blocks: [
        {
          kind: "text",
          text: "A paper dictionary is not a list of words in a row — it is a lookup machine: you bring a word, you get its definition. Python's **dictionary** (everyone says **dict**) works the same way. You store **pairs**: a **key** (the word you look up, like \"latte\") attached to a **value** (what you get back, like 3.8). Same curly braces as a set, but every item is a `key: value` pair.",
        },
        {
          kind: "heading",
          text: "Key-value pairs",
        },
        {
          kind: "code",
          title: "A price list you query by name",
          code: `prices = {"espresso": 2.5, "latte": 3.8, "mocha": 4.2}

print(prices)
print(prices["latte"])
`,
          output: `{'espresso': 2.5, 'latte': 3.8, 'mocha': 4.2}
3.8`,
          explain: [
            "The dict stores three pairs, separated by commas: product name to its price.",
            "`prices[\"latte\"]` reads **by key** — square brackets again, but inside them a name, not a position. The answer is 3.8.",
            "Dicts remember the order you inserted (espresso, latte, mocha) — but you never depend on it; you look things up by key.",
            "Keys are almost always strings or numbers; values can be absolutely anything — numbers, strings, lists, even other dicts (you will see that in e-08).",
          ],
        },
        {
          kind: "code",
          title: "The missing key problem",
          code: `prices = {"espresso": 2.5, "latte": 3.8}
print(prices["cappuccino"])    # no such key: dicts refuse to guess
`,
          expectError: "KeyError: 'cappuccino'",
          explain: [
            "There is no 'cappuccino' pair, so Python raises **KeyError** — the dict equivalent of 'word not found'.",
            "This crash is honest: better an error than a silently wrong price. But when missing keys are *normal* — a product not in stock, a word not yet counted — you want the polite version.",
          ],
        },
        {
          kind: "code",
          title: ".get(): the polite read",
          code: `prices = {"espresso": 2.5, "latte": 3.8}

print(prices.get("latte"))
print(prices.get("cappuccino"))         # missing: None, no crash
print(prices.get("cappuccino", 0.0))    # missing: YOUR default
`,
          output: `3.8
None
0.0`,
          explain: [
            "For a key that exists, `get` returns the value — same as square brackets.",
            "For a key that does not exist, `get` returns **None** instead of crashing. Nothing printed for None? That is Python printing the None value.",
            "Add a second argument and YOU choose the fallback: `prices.get(\"cappuccino\", 0.0)` answers 0.0 — 'not on the menu, priced zero'.",
            "Rule of thumb: square brackets when the key MUST exist (a missing key is a bug); .get() when missing is a normal situation.",
          ],
        },
        {
          kind: "heading",
          text: "Adding and updating",
        },
        {
          kind: "code",
          title: "One syntax, two behaviors",
          code: `prices = {"espresso": 2.5, "latte": 3.8}

prices["mocha"] = 4.2      # new key: ADDED
prices["latte"] = 4.0      # existing key: UPDATED
print(prices)
`,
          output: `{'espresso': 2.5, 'latte': 4.0, 'mocha': 4.2}`,
          explain: [
            "Assigning to a key that does not exist yet **creates** the pair — no append, no special method.",
            "Assigning to a key that already exists **overwrites** the value. The latte price went from 3.8 to 4.0, not into a second entry.",
            "Keys are unique — a dict can never hold two 'latte' pairs. (Sounds familiar? That is set thinking: keys behave like a set.)",
          ],
        },
        {
          kind: "table",
          title: "Dict essentials on one card",
          headers: ["Goal", "Code", "If the key is missing"],
          rows: [
            ["Read a value", "prices[\"latte\"]", "Crashes with KeyError"],
            ["Read politely", "prices.get(\"latte\")", "Returns None"],
            ["Read with your fallback", "prices.get(\"latte\", 0.0)", "Returns 0.0"],
            ["Add or update", "prices[\"mocha\"] = 4.2", "Creates the pair"],
            ["Does the key exist?", "\"latte\" in prices", "False — never crashes"],
            ["All keys / values / pairs", "prices.keys() / .values() / .items()", "—"],
          ],
          caption:
            "Square brackets demand the key exists; .get() forgives. Choose per situation — both are correct when used deliberately.",
        },
        {
          kind: "heading",
          text: "keys, values, items — and what in really checks",
        },
        {
          kind: "code",
          title: "Three views of the same dict",
          code: `prices = {"espresso": 2.5, "latte": 3.8, "mocha": 4.2}

print(prices.keys())
print(prices.values())
print(prices.items())

print("latte" in prices)
print(3.8 in prices.values())
`,
          output: `dict_keys(['espresso', 'latte', 'mocha'])
dict_values([2.5, 3.8, 4.2])
dict_items([('espresso', 2.5), ('latte', 3.8), ('mocha', 4.2)])
True
True`,
          explain: [
            "`keys()` lists every lookup word; `values()` lists every answer; `items()` lists the **pairs**, each shown as a tuple.",
            "Those tuples are why e-02 mattered: `('espresso', 2.5)` is a tuple, and you already know how to unpack tuples.",
            "`\"latte\" in prices` checks the KEYS — that is what in means on a dict. To ask about values, say so explicitly: `3.8 in prices.values()` is True.",
          ],
        },
        {
          kind: "code",
          title: "Looping a dictionary — .items() plus unpacking, the loop you will write forever",
          code: `prices = {"espresso": 2.5, "latte": 3.8, "mocha": 4.2}

for drink, price in prices.items():    # unpack each (key, value) pair
    print(f"{drink}: {price}")
`,
          output: `espresso: 2.5
latte: 3.8
mocha: 4.2`,
          explain: [
            "Each pass of the loop hands you one pair — a tuple like `('latte', 3.8)` — and the unpacking `drink, price` splits it into two loop variables.",
            "This is e-02's unpacking doing real work: no indexes, no [0] and [1], just two useful names per pass.",
            "A plain `for x in prices:` also works, but it loops over keys only — .items() is what you want almost every time.",
          ],
        },
        {
          kind: "heading",
          text: "Values can be anything — including containers",
        },
        {
          kind: "code",
          title: "A dict with a list and a dict inside it",
          code: `person = {
    "name": "Ada Lovelace",
    "skills": ["python", "math"],              # a list INSIDE a dict
    "office": {"building": "B", "room": 12},   # a dict INSIDE a dict
}

print(person["name"])
print(person["skills"][0])
print(person["office"]["room"])
`,
          output: `Ada Lovelace
python
12`,
          explain: [
            "`person[\"skills\"]` returns the list `['python', 'math']` — and then `[0]` indexes into that list. Left to right: dig, then dig again.",
            "`person[\"office\"]` returns the inner dict, and `[\"room\"]` digs one level deeper still.",
            "Chained brackets like `person[\"office\"][\"room\"]` are how you reach into any layered data — e-08 builds entire programs on this move.",
          ],
        },
        {
          kind: "heading",
          text: "The counting pattern",
        },
        {
          kind: "code",
          title: "Count words with a dict — the pattern to memorize",
          code: `words = ["spam", "egg", "spam", "bacon", "spam", "egg"]

counts = {}                                   # start with an empty counter
for word in words:
    counts[word] = counts.get(word, 0) + 1    # old count (or 0), plus one

print(counts)
`,
          output: `{'spam': 3, 'egg': 2, 'bacon': 1}`,
          explain: [
            "The line to burn into memory: `counts[word] = counts.get(word, 0) + 1`.",
            "First time Python sees 'spam': `counts.get(\"spam\", 0)` finds nothing, returns 0, adds 1, stores `counts[\"spam\"] = 1`.",
            "Second 'spam': get finds the existing 1, adds 1, stores 2. Third time: 3. The dict grows one key per distinct word.",
            "This is word frequency, vote counting, error log tallying, click counting — one identical line every time. It returns in the mini project and again in the data-science part.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — the shop stock",
          task: "Before the prints, restock the mugs: add 5 to the current count with stock[\"mug\"] = stock[\"mug\"] + 5. Then predict all three printed lines before running — especially what changes in the dict.",
          code: `stock = {"tshirt": 12, "mug": 7, "sticker": 40}

# 1. Print the mugs in stock with [] access
# 2. Ask for "hoodie" with .get() and a default of 0
# 3. Restock the mugs: add 5 to the current count

print("Mugs:", stock["mug"])
print("Hoodies:", stock.get("hoodie", 0))
print(stock)
`,
          hint: "Read the current count inside the assignment: stock[\"mug\"] = stock[\"mug\"] + 5. The right side runs first (7 + 5), then the result is stored back under the same key.",
        },
      ],
      terms: [
        { term: "Dictionary (dict)", definition: "A collection of key-value pairs for lookup by name: prices = {\"latte\": 3.8}." },
        { term: "Key", definition: "The lookup word of a pair — unique inside the dict, like set members. Usually a string or number." },
        { term: "Value", definition: "What a key maps to — anything at all: a number, text, a list, another dict." },
        { term: "KeyError", definition: "The error raised when square brackets ask for a key the dict does not have." },
        { term: "Counting pattern", definition: "Tallying with a dict: counts[item] = counts.get(item, 0) + 1 inside a loop." },
      ],
      mistakes: [
        {
          mistake: "Reading with square brackets for a key that might be absent.",
          why: "prices[\"cappuccino\"] raises KeyError the instant the key is missing — the program stops over a normal, expected gap.",
          fix: "When absence is normal, read with a default: prices.get(\"cappuccino\", 0.0). Keep square brackets for keys that must exist.",
        },
        {
          mistake: "Expecting `in` on a dict to check values.",
          why: "`x in my_dict` checks only the KEYS — that is its defined meaning, matching how you look things up.",
          fix: "To search values, be explicit: x in my_dict.values().",
        },
        {
          mistake: "Writing prices[\"latte\"] = 4.0 and expecting a second latte entry.",
          why: "Keys are unique — assigning to an existing key overwrites its value; duplicates can never accumulate.",
          fix: "That overwrite is exactly the tool you want for updates (new price, restocked count). To keep history, store a list as the value and append to it.",
        },
      ],
      takeaways: [
        "A dict maps keys to values: look up by name, not by position.",
        "d[k] crashes on missing keys; d.get(k, default) answers politely — choose deliberately.",
        "d[k] = v adds a new pair or updates an existing one; in checks keys only.",
        "for key, value in d.items() — with e-02's unpacking — is the dict loop you will write forever.",
        "counts[w] = counts.get(w, 0) + 1 is the counting pattern: one line tallies anything.",
      ],
      quiz: [
        {
          id: "e-04-q1",
          prompt: "prices = {\"espresso\": 2.5}. What does prices.get(\"mocha\", 0.0) return?",
          options: [
            { text: "KeyError", correct: false, feedback: "get() exists precisely to avoid that crash." },
            { text: "None", correct: false, feedback: "None is what get returns with NO default given — here you supplied 0.0." },
            { text: "0.0", correct: true, feedback: "Correct — the key is missing, so get() answers with YOUR default." },
            { text: "2.5", correct: false, feedback: "That would require the key 'mocha' to exist — only 'espresso' does." },
          ],
          explanation: "get(key, default) trades crashes for fallbacks: missing key means the default you chose.",
        },
        {
          id: "e-04-q2",
          prompt: "stock = {\"mug\": 7, \"sticker\": 40}. What does \"sticker\" in stock check?",
          options: [
            { text: "Whether 40 is among the values", correct: false, feedback: "That would be 40 in stock.values() — plain in never touches values." },
            { text: "Whether \"sticker\" is among the keys", correct: true, feedback: "Exactly — in on a dict is a KEY question. Here the answer is True." },
            { text: "Whether the dict has exactly those two entries", correct: false, feedback: "in answers one question only: is this single key present?" },
          ],
          explanation: "Membership on a dict means keys, because keys are how you look things up.",
        },
        {
          id: "e-04-q3",
          prompt: "d = {\"a\": 1}; then d[\"a\"] = 5; then d[\"b\"] = 2. What is d now?",
          options: [
            { text: "{\"a\": 1, \"a\": 5, \"b\": 2}", correct: false, feedback: "Impossible — dicts can never hold the same key twice." },
            { text: "{\"a\": 5, \"b\": 2}", correct: true, feedback: "Correct — \"a\" existed so its value was overwritten; \"b\" was new so it was added." },
            { text: "{\"b\": 2}", correct: false, feedback: "Assignment to an existing key REPLACES the value; it never removes the pair." },
          ],
          explanation: "Same syntax, two behaviors: existing key updates, new key creates. Keys stay unique throughout.",
        },
      ],
    },

    // ------------------------------------------------------------- e-05
    {
      slug: "e-05",
      title: "Indexing",
      minutes: 12,
      summary:
        "Reading any single item by position: zero-based indexing on lists, strings, and tuples; negative indices that count from the end; the two errors everyone meets; and picking the readable access pattern.",
      kind: "concept",
      objectives: [
        "Read any item from a list, string, or tuple by position",
        "Count positions from the end with negative indices",
        "Explain why index 4 on a four-item list raises IndexError",
        "Find positions with index() and tally with count()",
        "Choose the readable access pattern for first, last, and where-is-it",
      ],
      why: "Reading data by position is half of all data work: the first sale of the day, the latest temperature reading, the runner-up score. Python numbers positions from 0 — not 1 — and nearly every language you will ever touch works the same way, so learning it once pays off forever. This lesson makes indexing deliberate: you will read any position, count from either end, recover calmly from the two errors everyone meets (IndexError and ValueError), and pick the access pattern that reads like what it means.",
      blocks: [
        {
          kind: "text",
          text: "On most streets, the first house is number 1. On Python's street, the first house is number **0** — and this one difference causes more beginner confusion than everything else in this course combined. The good news: it is a small street, and after one honest lesson the confusion is gone for good.",
        },
        {
          kind: "heading",
          text: "Zero-based: the first item lives at index 0",
        },
        {
          kind: "code",
          title: "One syntax for every ordered container",
          code: `scores = [88, 92, 79, 95]
name = "Grace"
point = (3, 7)

print(scores[0])
print(scores[2])
print(name[0])
print(point[1])
`,
          output: `88
79
G
7`,
          explain: [
            "Square brackets after a container mean *give me the item at this position* — the **index**.",
            "`scores[0]` is 88, the FIRST item. `scores[2]` is 79 — the third item, because counting starts at 0.",
            "It is the same syntax you already met on strings in Part B (`name[0]` is 'G') and it works on tuples unchanged (`point[1]` is 7).",
            "One mental model, three containers: position in square brackets.",
          ],
        },
        {
          kind: "visual",
          title: "The index ruler: count from either end",
          ascii: `            index:    0        1        2        3      <- positives count from the front
                      +--------+--------+--------+--------+
          scores:     |   88   |   92   |   79   |   95   |
                      +--------+--------+--------+--------+
            index:   -4       -3       -2       -1        <- negatives count from the end
`,
          caption:
            "Every item has two addresses: 0 counts from the front, -1 counts from the back. Both rulers point at the same four boxes.",
        },
        {
          kind: "code",
          title: "Indexing experiments, conversation style",
          lang: "repl",
          code: `>>> scores = [88, 92, 79, 95]
>>> scores[0]
88
>>> scores[2]
79
>>> scores[-1]
95
>>> len(scores)
4
`,
          outputNote:
            "Each >>> line is what you type in the interpreter; the line under it is Python's immediate answer — no print() needed. Try these live: open a terminal, type python3, and follow along.",
        },
        {
          kind: "heading",
          text: "Negative indices: count from the end",
        },
        {
          kind: "code",
          title: "The last item, without knowing the length",
          code: `scores = [88, 92, 79, 95]

print(scores[-1])
print(scores[-2])
print("first again:", scores[-4])
`,
          output: `95
79
first again: 88`,
          explain: [
            "`scores[-1]` is the last item — the single most-used negative index in programming.",
            "`scores[-2]` is second to last. On a four-item list, -4 wraps all the way around to the first item.",
            "Why bother? `scores[len(scores) - 1]` also fetches the last item — but `scores[-1]` says what it means in four characters.",
          ],
        },
        {
          kind: "code",
          title: "Asking for a position that does not exist",
          code: `scores = [88, 92, 79, 95]
print(scores[4])      # there is no index 4 — the last one is 3
`,
          expectError: "IndexError: list index out of range",
          explain: [
            "Four items, positions 0 through 3 — so index 4 is one past the end, and Python raises **IndexError**.",
            "This is the classic off-by-one error. The fix is not memorizing: it is seeing the ruler — first item 0, last item (length minus 1).",
            "The sneakiest version is `scores[len(scores)]` — length 4, index 4, one too far. The last index is always len - 1 (or just -1).",
          ],
        },
        {
          kind: "heading",
          text: "Where is it? index() and count()",
        },
        {
          kind: "code",
          title: "Position and tally, by value",
          code: `names = ["Ada", "Grace", "Linus", "Grace"]

print(names.index("Grace"))
print(names.count("Ada"))
print(names.count("Grace"))
`,
          output: `1
1
2`,
          explain: [
            "`index(\"Grace\")` answers *at which position?* — 1, the FIRST match (the second Grace at index 3 is never reported).",
            "`count()` answers *how many times?* — Grace appears twice, Ada once.",
            "Together they are a tiny search engine: find it, count it.",
          ],
        },
        {
          kind: "code",
          title: "index() on a missing value is an error, not -1",
          code: `names = ["Ada", "Grace", "Linus"]
print(names.index("Mary"))    # Mary is not in the list
`,
          expectError: "ValueError: 'Mary' is not in list",
          explain: [
            "Some languages answer -1 for 'not found'. Python refuses to guess: **ValueError: 'Mary' is not in list**.",
            "The professional pattern is to ask `in` first, then index(): `if \"Mary\" in names: position = names.index(\"Mary\")`.",
            "You now know the pair of lookup errors by heart: wrong position raises IndexError, missing value raises ValueError.",
          ],
        },
        {
          kind: "heading",
          text: "Choosing readable access patterns",
        },
        {
          kind: "code",
          title: "Say what you mean",
          code: `sales = [120, 340, 95, 210]

print("First sale:", sales[0])
print("Latest sale:", sales[-1])

total = 0
for sale in sales:
    total += sale
print("Total:", total)
`,
          output: `First sale: 120
Latest sale: 210
Total: 765`,
          explain: [
            "`sales[0]` and `sales[-1]` read like English: first and latest. Prefer them over `sales[len(sales) - 1]`.",
            "Notice the total: NOT `sales[0] + sales[1] + sales[2] + sales[3]` — that breaks the moment a fifth sale arrives. The loop from Part D grows with the data.",
            "Rule of thumb: index when you mean a POSITION; loop when you mean EVERY item.",
          ],
        },
        {
          kind: "table",
          title: "The access patterns, one card",
          headers: ["Goal", "Expression", "On sales = [120, 340, 95, 210]"],
          rows: [
            ["The first item", "sales[0]", "120"],
            ["The last item", "sales[-1]", "210"],
            ["The second item", "sales[1]", "340"],
            ["The second to last", "sales[-2]", "95"],
            ["Where is 95?", "sales.index(95)", "2"],
            ["Is 300 in the list?", "300 in sales", "False"],
          ],
          caption:
            "Positive indexes count from the front, negative from the back, index() searches by value, in answers membership — four questions, one card.",
        },
        {
          kind: "tryIt",
          title: "Try it — predict all four lines first",
          task: "Before running, write down what each of the four prints shows. Then run and score yourself. After that, change week[3] to week[-3] and predict again — the ruler from this lesson answers both.",
          code: `week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

print(week[0])
print(week[-1])
print(week[3])
print(week.index("Sat"))
`,
          hint: "Count from 0 for positives: week[3] is the fourth day. Count from the back for negatives: -1 is Sun, so -3 is Fri. index(\"Sat\") counts positions from 0 too.",
        },
      ],
      terms: [
        { term: "Index", definition: "The position number of an item inside an ordered container, given in square brackets: scores[0]." },
        { term: "Zero-based indexing", definition: "Counting positions from 0, so the first item is at index 0 and the last is at length minus 1." },
        { term: "Negative index", definition: "An index that counts from the end: scores[-1] is the last item, scores[-2] the second to last." },
        { term: "IndexError", definition: "The error raised when a single index points past the end (or before the start) of a container." },
        { term: "ValueError", definition: "The error raised when a value is the right type but unusable — for example index() searching for an item that is not in the list." },
      ],
      mistakes: [
        {
          mistake: "Typing scores[3] expecting the third of three scores.",
          why: "Positions start at 0, so three items live at 0, 1, 2 — index 3 is one past the last item and raises IndexError.",
          fix: "Subtract one from the human count: the third item is scores[2]. First is always [0].",
        },
        {
          mistake: "Using scores[len(scores)] to fetch the last item.",
          why: "len is 4 but the last valid index is 3 — the exact off-by-one that raises IndexError.",
          fix: "Use scores[-1] for the last item, or scores[len(scores) - 1] if you enjoy typing.",
        },
        {
          mistake: "Expecting index() to return -1 for a missing item.",
          why: "Python refuses silent sentinels for searches: a missing value raises ValueError instead of pretending -1 is a position.",
          fix: "Guard the search with membership: if value in items: position = items.index(value).",
        },
      ],
      takeaways: [
        "Positions count from 0: the first item is [0], the last of n items is [n - 1].",
        "Negative indices count from the end — and scores[-1] is the most useful index in programming.",
        "One index past the end raises IndexError; index() on a missing value raises ValueError.",
        "index() finds the FIRST match by value; count() tallies matches.",
        "Index for a position, loop for every item — the loop survives data that grows.",
      ],
      quiz: [
        {
          id: "e-05-q1",
          prompt: "scores = [88, 92, 79]. What does scores[1] give?",
          options: [
            { text: "88", correct: false, feedback: "That is scores[0] — the first item. Position 1 is the second." },
            { text: "92", correct: true, feedback: "Correct — counting starts at 0, so index 1 is the second item, 92." },
            { text: "79", correct: false, feedback: "That is index 2 — the third and last item." },
            { text: "IndexError", correct: false, feedback: "No — index 1 is perfectly valid on a three-item list." },
          ],
          explanation: "Zero-based: index 0 is 88, index 1 is 92, index 2 is 79.",
        },
        {
          id: "e-05-q2",
          prompt: "You want an expression that gives the LAST item of a list whatever its length — today five items, tomorrow fifty. Which one?",
          options: [
            { text: "sales[5]", correct: false, feedback: "That only matches today's length — on a five-item list it is already one too far (indexes run 0 to 4) and raises IndexError." },
            { text: "sales[4]", correct: false, feedback: "It works today, by coincidence — but it is hard-coded to five-item lists and breaks on every other length." },
            { text: "sales[-1]", correct: true, feedback: "Correct — -1 means 'the last one' at any length. It is the pattern that never breaks." },
            { text: "sales[len]", correct: false, feedback: "Not valid syntax — and len(list) as an index is the classic off-by-one crash." },
          ],
          explanation: "[-1] means 'the last one' at any length — that is why working code is full of it.",
        },
        {
          id: "e-05-q3",
          prompt: "names = [\"Ada\", \"Grace\"]. What does names.index(\"Mary\") do?",
          options: [
            { text: "Returns -1 because Mary is missing", correct: false, feedback: "That is the convention in some other languages — Python does not play that game." },
            { text: "Returns None", correct: false, feedback: "None is not a position; Python raises instead of half-answering." },
            { text: "Raises ValueError: 'Mary' is not in list", correct: true, feedback: "Exactly — a missing value is an error for index(), so guard with in first when absence is normal." },
          ],
          explanation: "Missing position errors (IndexError) and missing value errors (ValueError) are Python's honest way of saying 'that is not there'.",
        },
      ],
    },

    // ------------------------------------------------------------- e-06
    {
      slug: "e-06",
      title: "Slicing",
      minutes: 15,
      summary:
        "Cutting any stretch of a container with [start:stop], where stop is exclusive. Defaults, negative slices, steps, [::-1] reversal, why slices never crash on overruns, and slices as the aliasing fix from e-01.",
      kind: "concept",
      objectives: [
        "Cut any stretch with [start:stop] — and explain why stop is exclusive",
        "Use the defaults: [:n], [n:], and [:] for a full copy",
        "Count from the end with negative slices",
        "Step through data with [::step] and reverse with [::-1]",
        "Explain why out-of-range slices clip quietly while single indexes crash",
      ],
      why: "You rarely want exactly one item — you want the first three days of the week, the last ten readings, every other row, or a whole dataset in reverse. Slicing is Python's knife for cutting containers by position: one expression picks any stretch, from either end, at any step. And slicing quietly solves the aliasing trap from e-01, because every slice is a new list. Learn [start:stop] once and every dataset you will ever load — in this course and in real data work — becomes cuttable with the same square brackets.",
      blocks: [
        {
          kind: "text",
          text: "Slicing a loaf of bread, you do not eat one crumb — you cut a stretch: *from the second slice to the fourth*. Python does the same with **slices**: inside the familiar square brackets, you write `[start:stop]` — where to begin and **where to stop before**. One rule causes 90% of the confusion, so say it out loud now: **stop is exclusive** — the item at the stop index is NOT included.",
        },
        {
          kind: "heading",
          text: "start:stop — stop means before",
        },
        {
          kind: "code",
          title: "A week of temperatures, two cuts",
          code: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

print(temps[0:3])     # indexes 0, 1, 2 — stops BEFORE 3
print(temps[2:5])     # indexes 2, 3, 4 — stops BEFORE 5
`,
          output: `[21.5, 23.0, 19.5]
[19.5, 20.0, 25.5]`,
          explain: [
            "`temps[0:3]` starts at index 0 and stops before 3 — three items: 0, 1, 2.",
            "`temps[2:5]` starts at 2, stops before 5 — three items again: 2, 3, 4.",
            "The arithmetic is worth noticing: `stop - start` is exactly how many items you get. [0:3] is 3 - 0 = 3 items.",
            "The result is always a NEW list — never a single item. `[2]` is one item; `[2:5]` is a stretch.",
          ],
        },
        {
          kind: "visual",
          title: "The slice ruler: start included, stop excluded",
          ascii: `  value:   21.5   23.0   19.5   20.0   25.5   27.0   22.5
  index:     0      1      2      3      4      5      6

  temps[2:5]  grabs  2, 3, 4  and stops BEFORE 5:

  value:   21.5   23.0  (19.5   20.0   25.5)  27.0   22.5
  index:     0      1    [2      3      4]    5      6
                            start          stop
                            (included)     (NOT included)
`,
          caption:
            "The slice hugs start and stops one before stop. Count the items: stop minus start, always.",
        },
        {
          kind: "code",
          title: "Defaults: [:3], [3:], and [:] the full copy",
          code: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

print(temps[:3])      # from the very start, stop before 3
print(temps[4:])      # from index 4 to the very end
print(temps[:])       # no start, no stop: EVERYTHING (a copy)
`,
          output: `[21.5, 23.0, 19.5]
[25.5, 27.0, 22.5]
[21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]`,
          explain: [
            "Leave out start and Python starts at 0: `temps[:3]` is the first three readings.",
            "Leave out stop and Python runs to the end: `temps[4:]` is the last three.",
            "`temps[:]` leaves out both — the whole list, as a **new list**. Remember `b = a[:]` from e-01? Now you know exactly what that colon was doing.",
          ],
        },
        {
          kind: "heading",
          text: "Negative slices: from the end",
        },
        {
          kind: "code",
          title: "The last three, and everything except the last two",
          code: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

print(temps[-3:])     # the last three readings
print(temps[:-2])     # everything EXCEPT the last two
`,
          output: `[25.5, 27.0, 22.5]
[21.5, 23.0, 19.5, 20.0, 25.5]`,
          explain: [
            "`temps[-3:]` — start three from the end, run to the end. The single most useful slice in daily work.",
            "`temps[:-2]` — from the start, stop before the last two. 'Drop the tail' in five characters.",
            "Negative values in slices mean exactly what they meant for single indexes: count from the back.",
          ],
        },
        {
          kind: "heading",
          text: "Step: every second item, and reversal",
        },
        {
          kind: "code",
          title: "[start:stop:step] — the third number",
          code: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

print(temps[::2])     # every second item: indexes 0, 2, 4, 6
print(temps[::-1])    # step -1: the whole list, backwards
`,
          output: `[21.5, 19.5, 25.5, 22.5]
[22.5, 27.0, 25.5, 20.0, 19.5, 23.0, 21.5]`,
          explain: [
            "A second colon adds a **step**: `temps[::2]` keeps every second reading — a quick way to thin out data.",
            "`temps[::-1]` is the famous one: step backwards from the end — the whole list reversed, in five characters.",
            "Reversing is NOT sorting: [::-1] flips positions, whatever the values. Sorting comes in e-07.",
          ],
        },
        {
          kind: "code",
          title: "Slices out of range are SAFE — they just clip",
          code: `temps = [21.5, 23.0, 19.5]

print(temps[0:100])    # clips to the end: no complaint
print(temps[10:20])    # nothing lives there: empty list, still no crash
`,
          output: `[21.5, 23.0, 19.5]
[]`,
          explain: [
            "`temps[0:100]` asked for a hundred items, got three — and clipped silently instead of crashing.",
            "`temps[10:20]` is a completely empty range: the result is `[]`, an empty list, and still no error.",
            "This is deliberate kindness: slices are for 'up to that much', single indexes are for 'exactly that one'.",
          ],
        },
        {
          kind: "code",
          title: "The contrast: a single index past the end still crashes",
          code: `temps = [21.5, 23.0, 19.5]
print(temps[100])      # single indexes are strict: this one crashes
`,
          expectError: "IndexError: list index out of range",
          explain: [
            "Same list, same 100 — but as a single index it raises IndexError where the slice clipped.",
            "The rule to bank: **one exact position must exist (or crash); a stretch just clips** to what is there.",
            "When you see IndexError from slicing-like code, look for a missing colon — `temps[100]` was probably meant to be `temps[100:]`.",
          ],
        },
        {
          kind: "code",
          title: "Every slice is a new list — the e-01 aliasing fix, explained",
          code: `a = [1, 2, 3]
b = a[:]            # slice copy: a NEW list, same items
b.append(4)
print("a:", a)

c = a               # assignment: the SAME list, second name
c.append(99)
print("a again:", a)
`,
          output: `a: [1, 2, 3]
a again: [1, 2, 3, 99]`,
          explain: [
            "`b = a[:]` built a fresh list — b's append never touched a. This is the copy trick from e-01, and now the mechanics are yours.",
            "`c = a` was a plain assignment — the aliasing trap: one list, two names, and c's append is visible through a.",
            "Diagnosis skill: when a list changes mysteriously, hunt for the plain assignment. When you want independence, cut a slice.",
          ],
        },
        {
          kind: "heading",
          text: "Slice assignment: replace a stretch in place",
        },
        {
          kind: "code",
          title: "The same brackets, on the LEFT of the equals sign",
          code: `sales = [100, 200, 300, 400, 500]

sales[1:3] = [250, 260]        # replace the stretch at 1..2
print(sales)

sales[0:0] = [50]              # empty stretch at 0: INSERT at the front
print(sales)
`,
          output: `[100, 250, 260, 400, 500]
[50, 100, 250, 260, 400, 500]`,
          explain: [
            "A slice on the LEFT of `=` replaces that stretch with a new list of items — here indexes 1 and 2 (200, 300) became 250, 260.",
            "`sales[0:0]` is an empty stretch at position 0, so assigning to it inserts without deleting anything — a front-door insert.",
            "The lengths do not have to match: `sales[1:3] = [9]` would shrink the list by one. The list reshapes to fit.",
          ],
        },
        {
          kind: "table",
          title: "Slice cheat sheet, on one week of readings",
          headers: ["Goal", "Slice", "Result on the 7 temps"],
          rows: [
            ["First three", "temps[:3]", "[21.5, 23.0, 19.5]"],
            ["Last three", "temps[-3:]", "[25.5, 27.0, 22.5]"],
            ["Items 1 through 3", "temps[1:4]", "[23.0, 19.5, 20.0]"],
            ["Without the ends", "temps[1:-1]", "[23.0, 19.5, 20.0, 25.5, 27.0]"],
            ["Every second item", "temps[::2]", "[21.5, 19.5, 25.5, 22.5]"],
            ["Reversed", "temps[::-1]", "[22.5, 27.0, 25.5, 20.0, 19.5, 23.0, 21.5]"],
            ["A full copy", "temps[:]", "all seven items, as a new list"],
          ],
          caption:
            "Every slice is start:stop:step with any part left out — and every slice result is a fresh list.",
        },
        {
          kind: "tryIt",
          title: "Try it — the week, sliced",
          task: "Predict all three prints first. Then add two more: the workdays (first five days, one slice) and every second day of the week (step 2). Predict before you run each new one.",
          code: `week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

print(week[:2])
print(week[-2:])
print(week[::-1])
`,
          hint: "week[:2] starts at the front and stops before index 2 — two days. week[-2:] is the weekend. For the workdays: five days from the front. For every second day, a second colon and a 2.",
        },
      ],
      terms: [
        { term: "Slice", definition: "A stretch of a container selected by position: temps[0:3] takes indexes 0, 1, 2 and returns a new list." },
        { term: "Stop-exclusive", definition: "The slice rule that the item at the stop index is not included — temps[0:3] stops before index 3." },
        { term: "Step", definition: "The third slice number, after a second colon: temps[::2] takes every second item; temps[::-1] reverses." },
        { term: "Slice assignment", definition: "Replacing a stretch of a list in place by putting a slice on the left of =: sales[1:3] = [250, 260]." },
      ],
      mistakes: [
        {
          mistake: "Expecting temps[1:4] to include index 4 (or to contain four items).",
          why: "Stop is exclusive: temps[1:4] takes indexes 1, 2, 3 — exactly stop minus start items, never index 4 itself.",
          fix: "Count with the formula 'stop minus start', and picture the slice hugging start, stopping one before stop.",
        },
        {
          mistake: "Guarding slices against out-of-range values, as if they crash like indexes.",
          why: "Single indexes must exist exactly and raise IndexError when they do not; slices simply clip to what is available.",
          fix: "Slice freely — temps[0:100] on a three-item list is legal and returns the whole list. Save the guards for single indexes.",
        },
        {
          mistake: "Using temps[::-1] and expecting the original list to change.",
          why: "A slice expression returns a NEW list — the original is untouched, exactly like the b = a[:] copy.",
          fix: "Store the result: reversed_temps = temps[::-1]. To change a list in place there is a .reverse() method — but the slice version is usually clearer.",
        },
      ],
      takeaways: [
        "[start:stop] cuts a stretch — and stop is exclusive: you get stop minus start items.",
        "Defaults are generous: [:3] from the front, [3:] to the end, [:] a full copy, [::-1] reversed.",
        "Negative numbers count from the back: [-3:] is the last three, [:-2] drops the last two.",
        "Slices never crash on overruns — they clip. Single indexes do crash. Missing colon = the usual suspect.",
        "Every slice is a new list — which is exactly why b = a[:] fixed the aliasing trap in e-01.",
      ],
      quiz: [
        {
          id: "e-06-q1",
          prompt: "temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]. What is temps[1:4]?",
          options: [
            { text: "[21.5, 23.0, 19.5, 20.0]", correct: false, feedback: "That is temps[:4] — and four items from index 1 would run past stop-exclusive thinking." },
            { text: "[23.0, 19.5, 20.0]", correct: true, feedback: "Correct — indexes 1, 2, 3, stopping before 4: three items, stop minus start." },
            { text: "[23.0, 19.5, 20.0, 25.5]", correct: false, feedback: "So close — that includes index 4, but stop is exclusive." },
            { text: "[19.5, 20.0]", correct: false, feedback: "That would be temps[2:4] — check where the slice hugs." },
          ],
          explanation: "Start included, stop excluded: 1, 2, 3 — three items, always stop minus start.",
        },
        {
          id: "e-06-q2",
          prompt: "temps = [21.5, 23.0, 19.5]. What does temps[10:20] do?",
          options: [
            { text: "Raises IndexError, like temps[10]", correct: false, feedback: "Tempting after e-05 — but slices and indexes follow different rules about range." },
            { text: "Returns [] — an empty list, no crash", correct: true, feedback: "Correct — nothing lives at indexes 10 to 19, so the slice is empty, and empty is a valid answer." },
            { text: "Returns the whole list, clipped to the end", correct: false, feedback: "Clipping happens when the range OVERLAPS the list (like [0:100]); [10:20] starts past the end." },
            { text: "Returns None", correct: false, feedback: "Slices always return a list — sometimes an empty one, never None." },
          ],
          explanation: "Slices clip and never crash: overlapping ranges keep what exists, fully-outside ranges return [].",
        },
        {
          id: "e-06-q3",
          prompt: "week = [\"Mon\", \"Tue\", \"Wed\"]. What does week[::-1] give?",
          options: [
            { text: "The days in alphabetical order", correct: false, feedback: "That is sorting (e-07) — reversal does not care about values at all." },
            { text: "[\"Mon\", \"Tue\", \"Wed\"] unchanged", correct: false, feedback: "The original is unchanged, but the EXPRESSION returns a reversed copy." },
            { text: "[\"Wed\", \"Tue\", \"Mon\"]", correct: true, feedback: "Exactly — step -1 walks the list backwards and hands you a new, reversed list." },
            { text: "An error, because -1 is not a valid position", correct: false, feedback: "-1 is a perfectly good index (the last item), and as a step it means 'walk backwards'." },
          ],
          explanation: "[::-1] is the reversal idiom: positions flipped, values untouched, new list returned.",
        },
      ],
    },

    // ------------------------------------------------------------- e-07
    {
      slug: "e-07",
      title: "Iteration",
      minutes: 14,
      summary:
        "One loop pattern for every container: what each type hands the loop, .items() for dictionary pairs, enumerate() for positions, sorted() and reversed() for order on demand — ending with the container-choice decision table.",
      kind: "concept",
      objectives: [
        "Loop over a list, string, tuple, or set with one for pattern",
        "Loop a dictionary with .items() and unpacked pairs",
        "Add positions to a loop with enumerate()",
        "Produce ordered output with sorted() and reversed()",
        "Choose the right container using the decision table",
      ],
      why: "Part D taught you the loop; this lesson teaches the loop's favorite partners. Real data work is mostly 'walk through a container and do something with each item' — and each container hands the loop something different: lists give items, dicts give keys unless you ask for pairs, and sometimes you need the position alongside the value (a ranking, a line number, a top-3 podium). That is enumerate(). Data also rarely arrives in the order you want, so sorted() and reversed() put any container into working order. The lesson ends with the most valuable table in this part: which container to reach for, and when.",
      blocks: [
        {
          kind: "text",
          text: "You already know the `for` loop from Part D — but until now you only pointed it at lists and strings. Here is the pleasant surprise: the *same* loop works over every container in this part, and each one hands the loop its natural contents. One pattern, four containers.",
        },
        {
          kind: "heading",
          text: "One loop, every container",
        },
        {
          kind: "code",
          title: "for over a list, a string, and a tuple",
          code: `scores = [88, 92, 79]
name = "Grace"
point = (3, 7)

for score in scores:
    print("score:", score)

for letter in name:
    print("letter:", letter)

for value in point:
    print("value:", value)
`,
          output: `score: 88
score: 92
score: 79
letter: G
letter: r
letter: a
letter: c
letter: e
value: 3
value: 7`,
          explain: [
            "The loop hands you one item per pass — no indexes, no len(), no counting. The loop variable (`score`, `letter`, `value`) is just a name you choose.",
            "A string hands the loop one character at a time; a tuple hands it one item at a time, exactly like a list.",
            "This is why programmers say Python loops are *for-each* loops: they mean 'for each item in this container', never 'count from here to there'.",
          ],
        },
        {
          kind: "code",
          title: "for over a set — with a predictability helper",
          code: `tags = {"python", "data", "beginner"}

for tag in sorted(tags):     # sorted() gives a predictable order
    print(tag)
`,
          output: `beginner
data
python`,
          explain: [
            "A set hands the loop its members — but in no defined order, so wrapping it in `sorted()` makes the output predictable (and turns it into a list first).",
            "Without sorted() the loop still works; you just cannot promise the order. When order matters, say so.",
          ],
        },
        {
          kind: "heading",
          text: "Looping a dictionary: .items() for the pairs",
        },
        {
          kind: "code",
          title: "Keys by default, pairs on request",
          code: `prices = {"espresso": 2.5, "latte": 3.8, "mocha": 4.2}

for drink in prices:                  # plain loop = KEYS only
    print(drink)

print("---")

for drink, price in prices.items():   # pairs, unpacked
    print(f"{drink}: {price}")
`,
          output: `espresso
latte
mocha
---
espresso: 2.5
latte: 3.8
mocha: 4.2`,
          explain: [
            "A plain `for drink in prices:` loops over the KEYS — the lookup words only. Useful, but usually not what you want.",
            "`for drink, price in prices.items():` hands the loop one `(key, value)` tuple per pass, and the unpacking from e-02 splits it into two named variables.",
            "This two-variable .items() loop is the single most common dict pattern in real Python code — you will write it thousands of times.",
          ],
        },
        {
          kind: "heading",
          text: "enumerate(): the position too",
        },
        {
          kind: "code",
          title: "Rankings, line numbers, top-3s",
          code: `podium = ["Ada", "Grace", "Linus"]

for place, name in enumerate(podium, start=1):   # index + value together
    print(f"{place}. {name}")
`,
          output: `1. Ada
2. Grace
3. Linus`,
          explain: [
            "Sometimes the item alone is not enough — you also want WHERE it sits: a rank, a line number, a position on the podium.",
            "`enumerate(podium)` hands the loop `(position, item)` pairs; `start=1` begins counting at 1 instead of 0 (fine for display — the underlying list still counts from 0).",
            "Before you know enumerate, you write `for i in range(len(podium)):` and index your way through. enumerate says the same thing without a single index.",
          ],
        },
        {
          kind: "heading",
          text: "sorted() and reversed(): order on demand",
        },
        {
          kind: "code",
          title: "New ordered results, originals untouched",
          code: `scores = [88, 92, 79, 95]

print(sorted(scores))               # ascending: a NEW list
print(sorted(scores, reverse=True)) # descending
print(scores)                       # proof: the original is unchanged

print(list(reversed(scores)))       # reversed view, as a list
`,
          output: `[79, 88, 92, 95]
[95, 92, 88, 79]
[88, 92, 79, 95]
[95, 79, 92, 88]`,
          explain: [
            "`sorted()` returns a brand-new list, lowest to highest — the original stays exactly as it was (line 3 proves it).",
            "`reverse=True` flips the order — the top score first. Leaderboards, bestsellers, fastest times: all `reverse=True`.",
            "`reversed()` also leaves the original alone and hands back a reversed *view*; wrapping it in `list()` makes it a plain list. (For simple reversal, `scores[::-1]` from e-06 does the same job.)",
          ],
        },
        {
          kind: "table",
          title: "The container-choice decision table — keep this one",
          headers: ["I need to…", "Use", "Write it", "Real example"],
          rows: [
            ["Keep order, change items later", "list", "[88, 92, 79]", "a gradebook that keeps growing"],
            ["Hold data that is fixed forever", "tuple", "(3, 7)", "an (x, y) point, the days of the week"],
            ["Keep only unique items; test membership fast", "set", "{\"ada\", \"grace\"}", "unique visitors, seen-it-before checks"],
            ["Look values up by name", "dict", "{\"latte\": 3.8}", "product prices, one record per student"],
          ],
          caption:
            "If two rows seem to fit, pick the one that matches what you will DO with the data: change it, seal it, deduplicate it, or look it up by name.",
        },
        {
          kind: "tryIt",
          title: "Try it — the leaderboard",
          task: "Run it, then make two changes and predict before each: (1) remove reverse=True so the lowest score ranks first, and (2) replace the scores with names — podium = ['Ada', 'Grace'] — and print 'In place {place}: {name}'.",
          code: `scores = [72, 95, 88, 61]

for rank, score in enumerate(sorted(scores, reverse=True), start=1):
    print(f"Rank {rank}: {score}")
`,
          hint: "The pipeline reads inside-out: sorted(...) orders the scores, reverse=True puts the best first, enumerate(..., start=1) numbers them, and the f-string formats each line.",
        },
      ],
      terms: [
        { term: "Iteration", definition: "Walking through a container one item at a time — what a for loop does." },
        { term: "enumerate()", definition: "A loop helper that hands you (position, item) pairs: for i, x in enumerate(items)." },
        { term: "sorted()", definition: "Built-in that returns a NEW list in order — lowest to highest by default, reverse=True for the opposite. The original is untouched." },
        { term: "reversed()", definition: "Built-in that hands back items in reverse order (as a view; wrap in list() to keep it). The original is untouched." },
      ],
      mistakes: [
        {
          mistake: "Looping a dictionary with `for x in prices:` and expecting the values.",
          why: "A plain dict loop is defined to yield the KEYS — the values never appear unless you ask for them.",
          fix: "Use for key, value in prices.items() when you need both, or for v in prices.values() when you need only values.",
        },
        {
          mistake: "Adding or removing items while looping over the same list.",
          why: "The loop walks positions while you are moving the items — items get skipped or the loop never ends, and the bug hides because small examples sometimes 'work'.",
          fix: "Build a new list instead: loop over the original and append to a fresh one. (If you must mutate, loop over a copy: for item in items[:].)",
        },
        {
          mistake: "Calling sorted(scores) and expecting the variable scores to change.",
          why: "sorted() returns a new list and never touches the original — the classic 'I sorted it but nothing happened' bug.",
          fix: "Store the result: ranked = sorted(scores, reverse=True). To reorder in place there is scores.sort() — but the function form is usually clearer.",
        },
      ],
      takeaways: [
        "One for pattern covers every container — each hands the loop its natural contents.",
        "Dicts hand the loop KEYS by default; ask for .items() to get (key, value) pairs, unpacked into two loop variables.",
        "enumerate() adds the position to a loop — rankings and line numbers without manual counting.",
        "sorted() returns a new ordered list (reverse=True flips it); reversed() flips without sorting; both leave the original untouched.",
        "The decision table: change it — list; seal it — tuple; deduplicate and test membership — set; look it up by name — dict.",
      ],
      quiz: [
        {
          id: "e-07-q1",
          prompt: "prices = {\"latte\": 3.8, \"mocha\": 4.2}. In `for x in prices:`, what is x on the first pass?",
          options: [
            { text: "3.8", correct: false, feedback: "That is a VALUE — plain dict loops never touch values." },
            { text: "The pair (\"latte\", 3.8)", correct: false, feedback: "Pairs come from .items() — the plain loop yields one thing, not tuples." },
            { text: "\"latte\"", correct: true, feedback: "Correct — plain dict iteration yields the keys, in insertion order here." },
            { text: "It depends on the dict's size", correct: false, feedback: "No — keys-first is the rule for every dict, every size." },
          ],
          explanation: "Plain for over a dict gives keys; .items() is how you ask for the pairs.",
        },
        {
          id: "e-07-q2",
          prompt: "Trace it: for place, name in enumerate([\"Ada\", \"Grace\"], start=1): print(place, name) — what prints?",
          options: [
            { text: "1 Ada, then 2 Grace", correct: true, feedback: "Exactly — enumerate with start=1 numbers 1, 2 and pairs each with the item." },
            { text: "0 Ada, then 1 Grace", correct: false, feedback: "That would be enumerate WITHOUT start=1 — you passed start=1." },
            { text: "Ada Grace, then 0 1", correct: false, feedback: "The order is (position, item) — position first, item second." },
            { text: "An error: two loop variables need two lists", correct: false, feedback: "Two loop variables are exactly how you unpack the (position, item) pairs enumerate provides." },
          ],
          explanation: "enumerate pairs each item with a counter (start=1 makes it human-friendly) and unpacking splits the pair.",
        },
        {
          id: "e-07-q3",
          prompt: "scores = [88, 79, 95]. After running sorted(scores), what is scores?",
          options: [
            { text: "[79, 88, 95]", correct: false, feedback: "That is the list sorted() RETURNS — the original variable is untouched." },
            { text: "[88, 79, 95] — unchanged", correct: true, feedback: "Correct — sorted() builds a new list; the original never moves." },
            { text: "[95, 88, 79]", correct: false, feedback: "Neither the original nor the return value is descending — reverse=True would make the RETURN descending." },
            { text: "An error: sorted() needs reverse=True", correct: false, feedback: "reverse=True is optional — ascending is the default and always valid." },
          ],
          explanation: "sorted() is a pure function of its input: new list out, original in. Store the result if you want to keep it.",
        },
      ],
    },

    // ------------------------------------------------------------- e-08
    {
      slug: "e-08",
      title: "Nested Data Structures",
      minutes: 17,
      summary:
        "Containers holding containers: grids as lists of lists, gradebooks as dicts of lists, and records as lists of dicts — the shape of real data — plus reading nested values one bracket at a time and querying a small database.",
      kind: "concept",
      objectives: [
        "Build a grid as a list of lists and read any cell with grid[row][col]",
        "Walk a grid with nested loops and accumulators",
        "Store many values under one key in a dict of lists",
        "Recognize records — a list of dicts — as the shape of real-world data",
        "Read nested values step by step, and query a small database with a loop, an if, and an accumulator",
      ],
      why: "Open any spreadsheet: rows of products, each with a name, a price, a stock count. Look at any web API's data, any database table, any survey export — they are all the same thing: containers holding containers. Nesting is where Python's data model clicks into the shape of real data. A grid is a list of lists; a gradebook is a dict of lists; a company's data is a list of dicts. Learn to read them one bracket at a time and you can already open, query, and summarize data the way analysts do — and this exact record pattern returns at full scale in the data-science part of this course.",
      blocks: [
        {
          kind: "text",
          text: "So far every container held flat values — numbers and strings. Real data is never flat. A spreadsheet is rows of cells; a gradebook is one student with many scores; a product catalog is many products, each with several fields. The fix is beautifully simple: **a container can hold anything — including other containers**. That is nesting, and it is the last idea between you and reading real data.",
        },
        {
          kind: "heading",
          text: "Lists of lists: grids",
        },
        {
          kind: "code",
          title: "A 3x3 grid — rows inside a list",
          code: `grid = [
    [1, 2, 3],       # row 0
    [4, 5, 6],       # row 1
    [7, 8, 9],       # row 2
]

print(grid)          # the whole grid
print(grid[1])       # row 1 — itself a list
print(grid[1][2])    # row 1, column 2 — a single number
`,
          output: `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]
[4, 5, 6]
6`,
          explain: [
            "The grid is a list whose three items are themselves lists — the rows.",
            "`grid[1]` returns row 1 — a whole list, exactly like indexing any other list.",
            "`grid[1][2]` reads that row and immediately indexes into it: brackets apply **left to right, one level at a time**. First the row, then the cell.",
          ],
        },
        {
          kind: "visual",
          title: "The grid, with addresses",
          ascii: `              column 0   column 1   column 2
             +----------+----------+----------+
   row 0     |    1     |    2     |    3     |
             +----------+----------+----------+
   row 1     |    4     |    5     |    6     |    grid[1]    -> [4, 5, 6]
             +----------+----------+----------+
   row 2     |    7     |    8     |    9     |    grid[1][2] -> 6
             +----------+----------+----------+
`,
          caption:
            "Every address has two parts: which row, then which column. grid[1] picks the row; the second bracket picks the cell inside it.",
        },
        {
          kind: "heading",
          text: "Walking a grid with nested loops",
        },
        {
          kind: "code",
          title: "Outer loop: rows. Inner loop: cells.",
          code: `grid = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

for row in grid:              # outer loop: one row at a time
    row_total = 0
    for number in row:        # inner loop: the numbers in that row
        row_total += number
    print("row total:", row_total)
`,
          output: `row total: 6
row total: 15
row total: 24`,
          explain: [
            "This is the nested-loop pattern from Part D, now with meaning: the outer loop walks the rows, and for each row the inner loop walks its cells.",
            "The accumulator `row_total` resets to 0 for every row — it lives INSIDE the outer loop, one fresh total per row.",
            "Same skeleton works for column sums, grid searches, spreadsheet totals — outer rows, inner cells, accumulate as you go.",
          ],
        },
        {
          kind: "heading",
          text: "Dict of lists: one name, many scores",
        },
        {
          kind: "code",
          title: "The gradebook shape",
          code: `scores_by_student = {
    "Ada": [88, 92, 79],
    "Grace": [95, 91, 89],
}

for name, scores in scores_by_student.items():
    total = 0
    for score in scores:          # the value is a list: loop it
        total += score
    print(f"{name}: {total} points")
`,
          output: `Ada: 259 points
Grace: 275 points`,
          explain: [
            "Each KEY is a student; each VALUE is that student's whole list of scores — a dict whose values are lists.",
            "The .items() loop from e-07 hands you `(name, scores)` per pass — then the inner loop from Part D walks the score list.",
            "This two-level pattern — loop the pairs, then loop inside each value — is the everyday shape of grouped data.",
          ],
        },
        {
          kind: "heading",
          text: "Lists of dicts: records — the shape of real data",
        },
        {
          kind: "code",
          title: "Three students, three records",
          code: `students = [
    {"name": "Ada", "score": 88},
    {"name": "Grace", "score": 95},
    {"name": "Linus", "score": 79},
]

for student in students:                        # each item is a dict...
    print(student["name"], student["score"])    # ...so reach inside it
`,
          output: `Ada 88
Grace 95
Linus 79`,
          explain: [
            "Each item in the list is a **record**: a dict with named fields. The list is the table; each dict is one row.",
            "The loop hands you one record at a time, and `student[\"name\"]` reads a field — e-04's dict access, applied per record.",
            "This exact shape — a list of dicts — is what JSON APIs, databases, and CSV readers hand you in real work. It returns at full scale in the data-science part.",
          ],
        },
        {
          kind: "heading",
          text: "Reading nested values, step by step",
        },
        {
          kind: "code",
          title: "One bracket at a time",
          code: `students = [
    {"name": "Ada", "score": 88},
    {"name": "Grace", "score": 95},
]

second = students[1]              # step 1: the record at index 1
print(second)                     # it is a dict

print(second["name"])             # step 2: a field inside that dict
print(students[1]["name"])        # both steps in one expression
`,
          output: `{'name': 'Grace', 'score': 95}
Grace
Grace`,
          explain: [
            "Any nested expression becomes simple when you read it in steps: `students[1]` is a dict; `second[\"name\"]` is a field inside it.",
            "Chained brackets just do both steps without the temporary variable — left to right, one bracket at a time.",
            "Debugging skill: when a nested expression confuses you, split it into steps and print each one. The type you see tells you what the next bracket should be.",
          ],
        },
        {
          kind: "heading",
          text: "A small database you can query",
        },
        {
          kind: "code",
          title: "Filter and total — that is a query",
          code: `products = [
    {"name": "tshirt", "price": 15, "stock": 40},
    {"name": "mug", "price": 8, "stock": 12},
    {"name": "sticker", "price": 1, "stock": 200},
    {"name": "hoodie", "price": 35, "stock": 5},
]

# Query 1: which products cost less than 10?
for product in products:
    if product["price"] < 10:
        print("cheap:", product["name"])

# Query 2: what is everything in stock worth?
inventory_value = 0
for product in products:
    inventory_value += product["price"] * product["stock"]

print("Inventory value:", inventory_value)
`,
          output: `cheap: mug
cheap: sticker
Inventory value: 1071`,
          explain: [
            "Query 1 is a **filter**: loop the records, keep the ones where a condition holds — a for, an if, one field.",
            "Query 2 is an **aggregation**: loop the records, accumulate one number from each — the Part D accumulator, now fed by dict fields.",
            "Strip away the vocabulary and every analyst query is one of these two shapes. You can already do both.",
          ],
        },
        {
          kind: "table",
          title: "The three nested shapes — recognize them on sight",
          headers: ["Shape", "Looks like", "Use it when", "Example"],
          rows: [
            ["List of lists", "[[1, 2, 3], [4, 5, 6]]", "every row has the same columns — a grid", "a spreadsheet, a game board, an image"],
            ["Dict of lists", "{\"Ada\": [88, 92]}", "one label, many values", "each student's scores, each day's readings"],
            ["List of dicts", "[{\"name\": \"Ada\"}]", "many records with named fields", "products, employees, students — real data"],
          ],
          caption:
            "The record pattern — a list of dicts — is the workhorse of real-world data: files, web APIs, and databases all hand you lists of records.",
        },
        {
          kind: "tryIt",
          title: "Try it — extend the employee database",
          task: "First add a third record with append: a dict with name, dept, and salary of your own. Then run — Linus should still print. Then add a second 'eng' employee and predict both lines before running again.",
          code: `employees = [
    {"name": "Ada", "dept": "data", "salary": 82000},
    {"name": "Linus", "dept": "eng", "salary": 95000},
]

# 1. Add a third employee record with append({...})
# 2. Loop and print only the "eng" department names

for employee in employees:
    if employee["dept"] == "eng":
        print(employee["name"], employee["salary"])
`,
          hint: "employees.append({\"name\": \"Mary\", \"dept\": \"eng\", \"salary\": 76000}) — then the loop's if matches both eng records and prints both.",
        },
      ],
      terms: [
        { term: "Nested structure", definition: "A container holding other containers — a list of lists, a dict of lists, a list of dicts." },
        { term: "Grid (matrix)", definition: "A list of lists where every inner list is a row of the same length: grid[row][column] reads one cell." },
        { term: "Record", definition: "One dict with named fields representing one real thing — one student, one product, one employee." },
        { term: "Query", definition: "At this scale: a loop over records with a filter (an if) or an accumulator. What databases do for you later, you can already do by hand." },
      ],
      mistakes: [
        {
          mistake: "Writing grid[1, 2] to read row 1, column 2.",
          why: "Python reads 1, 2 as a TUPLE (from e-02!) and lists refuse tuple indexes: TypeError: list indices must be integers or slices, not tuple.",
          fix: "One bracket per level, left to right: grid[1][2] — first the row, then the cell.",
        },
        {
          mistake: "Printing records[0] and expecting the first name.",
          why: "records[0] is the whole first record — a dict — because the list's items are dicts, not strings.",
          fix: "Read one level deeper: records[0][\"name\"]. When in doubt, print the intermediate step and look at what type comes back.",
        },
        {
          mistake: "Looping a dict of lists without unpacking: for pair in gradebook.items(): and then using pair as if it were the list.",
          why: ".items() hands the loop (key, value) TUPLES — pair is a tuple like (\"Ada\", [88, 92]), not the score list.",
          fix: "Unpack into two names: for name, scores in gradebook.items(): — now scores really is the list.",
        },
      ],
      takeaways: [
        "Containers can hold containers: nesting models grids, gradebooks, and catalogs with zero new syntax.",
        "Read nested data one bracket at a time, left to right: grid[1][2] is row first, cell second.",
        "Nested loops walk a grid: the outer loop takes rows, the inner loop takes cells, accumulators reset per row.",
        "A list of dicts is the record pattern — the shape that files, APIs, and databases hand you in real work.",
        "A query is just a loop plus a filter or an accumulator — you can already ask real questions of real data.",
      ],
      quiz: [
        {
          id: "e-08-q1",
          prompt: "grid = [[1, 2], [3, 4]]. What is grid[1][0]?",
          options: [
            { text: "1", correct: false, feedback: "That is grid[0][0] — the first cell of the first row." },
            { text: "3", correct: true, feedback: "Correct — grid[1] is the row [3, 4], and [0] takes its first cell." },
            { text: "2", correct: false, feedback: "That is grid[0][1] — first row, second column." },
            { text: "TypeError — you cannot stack two bracket pairs", correct: false, feedback: "You can — one bracket per nesting level is exactly the rule." },
          ],
          explanation: "Left to right, one level per bracket: row first, then column.",
        },
        {
          id: "e-08-q2",
          prompt: "students = [{\"name\": \"Ada\", \"score\": 88}]. What does students[0][\"name\"] give?",
          options: [
            { text: "The string \"Ada\"", correct: true, feedback: "Exactly — students[0] is the first record (a dict), and [\"name\"] reads its name field." },
            { text: "The whole record {'name': 'Ada', 'score': 88}", correct: false, feedback: "That would be students[0] alone — the [\"name\"] digs one level deeper." },
            { text: "88", correct: false, feedback: "That is students[0][\"score\"] — the other field." },
            { text: "KeyError, because dicts cannot live inside lists", correct: false, feedback: "Containers nest freely — dicts inside lists is the most common real-data shape there is." },
          ],
          explanation: "Record first (the list index), field second (the key) — the record pattern in two brackets.",
        },
        {
          id: "e-08-q3",
          prompt: "gradebook = {\"Ada\": [88, 92]}. In `for name, scores in gradebook.items():` — what is scores on the first pass?",
          options: [
            { text: "The string \"Ada\"", correct: false, feedback: "That is the KEY — the first of the two unpacked names." },
            { text: "The list [88, 92]", correct: true, feedback: "Correct — .items() yields (key, value) pairs, and unpacking puts the key in name, the value list in scores." },
            { text: "The tuple (\"Ada\", [88, 92])", correct: false, feedback: "That is what you get WITHOUT unpacking — with two loop variables the tuple is split." },
            { text: "The number 88", correct: false, feedback: "That would require another level: looping over the list, or scores[0]." },
          ],
          explanation: "Unpacking a (key, value) pair gives you the key and the value as separate, correctly-typed loop variables.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART E EXERCISES — 4 beginner, 4 intermediate, 4 advanced
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "e-b1",
      tier: "beginner",
      title: "The shopping-list manipulator",
      prompt:
        "Start from exactly shopping = [\"milk\", \"bread\", \"eggs\"] and perform four operations in order, printing the list after each of the first three: append \"coffee\" to the end, insert \"butter\" at index 1, and remove \"eggs\". Then pop the last item into a variable called last and print it as 'Popped: <item>'. Finish with two lines: 'Final list: <the list>' and 'Items left: <count>' using len(). The output must match the expected output exactly, line for line.",
      hint: "The four tools are shopping.append(\"coffee\"), shopping.insert(1, \"butter\"), shopping.remove(\"eggs\"), and last = shopping.pop(). Print the list after each change so you can watch it move.",
      starter: `shopping = ["milk", "bread", "eggs"]

# 1. Append "coffee" to the end, then print the list


# 2. Insert "butter" at index 1, then print the list


# 3. Remove "eggs", then print the list


# 4. Pop the last item into a variable, then print "Popped: <item>"


# 5. Print the final list and the number of items left

`,
      solution: `shopping = ["milk", "bread", "eggs"]

shopping.append("coffee")        # add to the end
print(shopping)

shopping.insert(1, "butter")     # butter becomes the second item
print(shopping)

shopping.remove("eggs")          # remove by value
print(shopping)

last = shopping.pop()            # remove the last item, keep it
print("Popped:", last)

print("Final list:", shopping)
print("Items left:", len(shopping))
`,
      expectedOutput: `['milk', 'bread', 'eggs', 'coffee']
['milk', 'butter', 'bread', 'eggs', 'coffee']
['milk', 'butter', 'bread', 'coffee']
Popped: coffee
Final list: ['milk', 'butter', 'bread']
Items left: 3`,
      concepts: ["lists", "append", "insert", "pop"],
    },
    {
      id: "e-b2",
      tier: "beginner",
      title: "The tuple swapper",
      prompt:
        "Show off tuple power in one small program. Start with x = 3 and y = 8 and print them as 'before: x = 3 y = 8'. Swap them using tuple unpacking (a, b = b, a style — no temporary variable) and print 'after:  x = 8 y = 3'. Then prove the single-element gotcha: create (5) and (5,) and print both on one line. Finally pack the point (4, 9) into a variable and unpack it into row and col, printing 'row = 4 col = 9'.",
      hint: "The swap is exactly x, y = y, x. The gotcha prints '5 (5,)' — because (5) is just the number 5. Unpack with row, col = point.",
      starter: `x = 3
y = 8

# 1. Print them (before the swap)


# 2. Swap with tuple unpacking, then print them again


# 3. Create (5) and (5,) and print both on one line


# 4. Pack (4, 9) into "point", unpack it into row and col, print both

`,
      solution: `x = 3
y = 8
print("before: x =", x, "y =", y)

x, y = y, x          # the tuple swap: pack the right, unpack into the left
print("after:  x =", x, "y =", y)

not_a_tuple = (5)    # just parentheses: this is the NUMBER 5
real_tuple = (5,)    # the comma makes it a tuple
print(not_a_tuple, real_tuple)

point = (4, 9)       # pack
row, col = point     # unpack
print("row =", row, "col =", col)
`,
      expectedOutput: `before: x = 3 y = 8
after:  x = 8 y = 3
5 (5,)
row = 4 col = 9`,
      concepts: ["tuples", "unpacking", "swap", "single-element tuple"],
    },
    {
      id: "e-b3",
      tier: "beginner",
      title: "Temperature positions",
      prompt:
        "From the six readings temps = [18.5, 21.0, 24.5, 26.0, 23.5, 19.0], print exactly six labeled lines: the first reading, the last reading, the second reading, and the second-to-last reading (use negative indices where they read better), then the index of the value 24.5 found with the .index() method (not by hand), and finally whether 30.0 appears in the list, as a boolean. Match the expected output exactly.",
      hint: "The patterns: temps[0], temps[-1], temps[1], temps[-2], temps.index(24.5), and 30.0 in temps.",
      starter: `temps = [18.5, 21.0, 24.5, 26.0, 23.5, 19.0]

# Print: first, last, second, second-to-last,
#        the index of 24.5, and whether 30.0 is in the list

`,
      solution: `temps = [18.5, 21.0, 24.5, 26.0, 23.5, 19.0]

print("First:", temps[0])
print("Last:", temps[-1])
print("Second:", temps[1])
print("Second to last:", temps[-2])
print("Where is 24.5? Index", temps.index(24.5))
print("Is 30.0 in the list?", 30.0 in temps)
`,
      expectedOutput: `First: 18.5
Last: 19.0
Second: 21.0
Second to last: 23.5
Where is 24.5? Index 2
Is 30.0 in the list? False`,
      concepts: ["indexing", "negative indices", "index()", "in"],
    },
    {
      id: "e-b4",
      tier: "beginner",
      title: "Dedup the survey",
      prompt:
        "A tools survey collected answers = [\"python\", \"excel\", \"python\", \"sql\", \"excel\", \"python\", \"r\"] — with plenty of repeats. Print how many answers were collected in total, then how many UNIQUE tools appear (build a set for that), the sorted list of unique tools, and two membership checks: whether anyone answered \"python\" and whether anyone answered \"java\". Every print must match the expected output exactly.",
      hint: "unique = set(answers) collapses the duplicates; len(unique) counts the survivors; sorted(unique) prints them tidily as a list.",
      starter: `answers = ["python", "excel", "python", "sql", "excel", "python", "r"]

# 1. Print the total number of answers
# 2. Build a set of unique tools and print its length
# 3. Print the sorted list of unique tools
# 4. Did anyone say "python"? Did anyone say "java"?

`,
      solution: `answers = ["python", "excel", "python", "sql", "excel", "python", "r"]

print("All answers:", len(answers))

unique = set(answers)          # duplicates collapse
print("Unique tools:", len(unique))
print(sorted(unique))

print("Someone uses python:", "python" in unique)
print("Someone uses java:", "java" in unique)
`,
      expectedOutput: `All answers: 7
Unique tools: 4
['excel', 'python', 'r', 'sql']
Someone uses python: True
Someone uses java: False`,
      concepts: ["sets", "deduplication", "sorted()", "membership"],
    },

    // ---- intermediate
    {
      id: "e-i1",
      tier: "intermediate",
      title: "Slice the week",
      prompt:
        "From the seven daily readings temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5], print six labeled results using slices where a stretch is asked for: the first three readings, the last three readings, the middle item (a single index — index 3 on a seven-item list), all readings except the first and the last, the readings reversed (one slice), and every second reading. Remember: stop is exclusive, and slices never crash even when you ask for too much.",
      hint: "temps[:3] and temps[-3:] for the ends; temps[3] for the middle; temps[1:-1] drops both ends; temps[::-1] reverses; temps[::2] takes every second item.",
      starter: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

# Print, each on a labeled line:
# 1. the first three readings
# 2. the last three readings
# 3. the middle item (a single index)
# 4. everything except the first and last
# 5. the readings reversed
# 6. every second reading

`,
      solution: `temps = [21.5, 23.0, 19.5, 20.0, 25.5, 27.0, 22.5]

print("First three:", temps[:3])
print("Last three:", temps[-3:])
print("Middle item:", temps[3])
print("Without the ends:", temps[1:-1])
print("Reversed:", temps[::-1])
print("Every second:", temps[::2])
`,
      expectedOutput: `First three: [21.5, 23.0, 19.5]
Last three: [25.5, 27.0, 22.5]
Middle item: 20.0
Without the ends: [23.0, 19.5, 20.0, 25.5, 27.0]
Reversed: [22.5, 27.0, 25.5, 20.0, 19.5, 23.0, 21.5]
Every second: [21.5, 19.5, 25.5, 22.5]`,
      concepts: ["slicing", "stop-exclusive", "step", "reversal"],
    },
    {
      id: "e-i2",
      tier: "intermediate",
      title: "Word frequency counter",
      prompt:
        "Count how often each word appears in words = [\"spam\", \"egg\", \"spam\", \"bacon\", \"spam\", \"egg\", \"bacon\"] using the counting pattern from e-04: counts[word] = counts.get(word, 0) + 1 inside a loop. Print the whole counts dict on one line. Then find the most common word WITHOUT sorting: loop over counts.items() and keep track of the best (word, count) pair seen so far, and finish with 'Most common: spam (3 times)' built with an f-string.",
      hint: "Start best_word = None and best_count = 0; inside the loop, if counts[word] > best_count, replace both. The f-string: print(f\"Most common: {best_word} ({best_count} times)\").",
      starter: `words = ["spam", "egg", "spam", "bacon", "spam", "egg", "bacon"]

counts = {}
# TODO: the counting pattern loop

print(counts)

# TODO: track the most common word, then print it

`,
      solution: `words = ["spam", "egg", "spam", "bacon", "spam", "egg", "bacon"]

counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1     # the counting pattern

print(counts)

best_word = None
best_count = 0
for word in counts:
    if counts[word] > best_count:              # a new champion
        best_word = word
        best_count = counts[word]

print(f"Most common: {best_word} ({best_count} times)")
`,
      expectedOutput: `{'spam': 3, 'egg': 2, 'bacon': 2}
Most common: spam (3 times)`,
      concepts: ["counting pattern", "dict.get()", "loops", "f-strings"],
    },
    {
      id: "e-i3",
      tier: "intermediate",
      title: "The shop inventory",
      prompt:
        "Run a tiny inventory system on stock = {\"tshirt\": 12, \"mug\": 7, \"sticker\": 40}. First print the mugs in stock with square brackets and the hoodies with .get() defaulting to 0. Then restock: add 5 mugs (read the old count, add, store it back) and add a brand-new product \"hoodie\" with 3 in stock. Finally loop over the stock values to compute the total items in stock, and print the sorted list of product names the shop sells.",
      hint: "Restock with stock[\"mug\"] = stock[\"mug\"] + 5. Total: loop over stock.values() with an accumulator. Product names: sorted(stock) sorts the keys.",
      starter: `stock = {"tshirt": 12, "mug": 7, "sticker": 40}

# 1. Print mugs with [] access
# 2. Print hoodies with .get() and a default of 0
# 3. Restock: +5 mugs, and a new "hoodie" product with 3
# 4. Loop over the values: total items in stock
# 5. Print the sorted product names

`,
      solution: `stock = {"tshirt": 12, "mug": 7, "sticker": 40}

print("Mugs in stock:", stock["mug"])
print("Hoodies in stock:", stock.get("hoodie", 0))

stock["mug"] = stock["mug"] + 5     # restock: read, add, store back
stock["hoodie"] = 3                 # new product: the pair is created

total = 0
for count in stock.values():
    total += count
print("Total items in stock:", total)
print("Products we sell:", sorted(stock))
`,
      expectedOutput: `Mugs in stock: 7
Hoodies in stock: 0
Total items in stock: 67
Products we sell: ['hoodie', 'mug', 'sticker', 'tshirt']`,
      concepts: ["dictionaries", "get()", "values()", "updating"],
    },
    {
      id: "e-i4",
      tier: "intermediate",
      title: "Fix the aliasing bug",
      prompt:
        "Debugging exercise. The program below should keep the original meeting agenda untouched while an edited copy gets an after-party added — but the output shows 'party' in BOTH lists. Run it first and read the wrong output. Then find the one-line bug (the comment marks it), explain to yourself why both names change, and fix it by making the edit work on a COPY instead — the fix is two characters. The final output must show the original agenda without 'party' and the edited agenda with it.",
      hint: "edited = original gives one list two names (aliasing from e-01). A slice copy — edited = original[:] — builds a second, independent list.",
      starter: `# BUG: after the meeting, 'original' should still be the untouched plan
original = ["intro", "demo", "q&a"]
edited = original                  # <-- the bug hides on this line
edited.append("party")             # the after-party is a LATER idea

print("original:", original)
print("edited:  ", edited)
`,
      solution: `# FIXED: the agenda survives the editing session
original = ["intro", "demo", "q&a"]
edited = original[:]               # a slice COPY: two independent lists
edited.append("party")             # the party lands on the copy only

print("original:", original)
print("edited:  ", edited)
`,
      expectedOutput: `original: ['intro', 'demo', 'q&a']
edited:   ['intro', 'demo', 'q&a', 'party']`,
      concepts: ["aliasing", "slice copy", "mutability", "debugging"],
    },

    // ---- advanced
    {
      id: "e-a1",
      tier: "advanced",
      title: "Matrix row and column sums",
      prompt:
        "The sales grid below holds three stores (rows) and three products (columns). Produce two reports. First, the total for each store — 'Store 1 total: 555' through 'Store 3 total:', using enumerate(sales, start=1) for the row numbers and a nested loop with an accumulator for each row total. Second, the total for each product across all stores — 'Product 0 total: 420' through 'Product 2 total:', walking DOWN the columns: loop for col in range(len(sales[0])) and add row[col] for every row.",
      hint: "Row totals: outer loop over rows, inner accumulator. Column totals: for each column index, loop over the rows again and add row[col] — the index picks the same column in every row.",
      starter: `sales = [
    [120, 340, 95],    # store 1: tshirts, mugs, stickers
    [210, 180, 300],   # store 2
    [90, 45, 500],     # store 3
]

# Report 1: total per store (enumerate with start=1)


# Report 2: total per product (loop over column indexes, then rows)

`,
      solution: `sales = [
    [120, 340, 95],    # store 1: tshirts, mugs, stickers
    [210, 180, 300],   # store 2
    [90, 45, 500],     # store 3
]

# Report 1: row totals — one store per outer pass
for store_num, row in enumerate(sales, start=1):
    row_total = 0
    for value in row:
        row_total += value
    print(f"Store {store_num} total: {row_total}")

# Report 2: column totals — same column index in every row
for col in range(len(sales[0])):
    col_total = 0
    for row in sales:
        col_total += row[col]
    print(f"Product {col} total: {col_total}")
`,
      expectedOutput: `Store 1 total: 555
Store 2 total: 690
Store 3 total: 635
Product 0 total: 420
Product 1 total: 565
Product 2 total: 895`,
      concepts: ["lists of lists", "nested loops", "accumulators", "enumerate()"],
    },
    {
      id: "e-a2",
      tier: "advanced",
      title: "Query the gradebook",
      prompt:
        "students below is a list of records, each a dict with \"name\" and \"score\". Produce three query reports. (1) 'Top of the class:' followed by one line per student scoring 90 or more, formatted '- <name> <score>'. (2) The class average, computed with an accumulator and divided by len(students). (3) How many students scored exactly 95, counted with a loop. Every report is a for loop over the records with a condition or an accumulator — the query patterns from e-08.",
      hint: "Three loops, three jobs: filter with if student[\"score\"] >= 90, accumulate total for the average, count with a counter variable. The average of 88, 95, 79, 95 is 89.25.",
      starter: `students = [
    {"name": "Ada", "score": 88},
    {"name": "Grace", "score": 95},
    {"name": "Linus", "score": 79},
    {"name": "Mary", "score": 95},
]

# Report 1: everyone scoring 90 or more

# Report 2: the class average (accumulator / len)

# Report 3: how many scored exactly 95

`,
      solution: `students = [
    {"name": "Ada", "score": 88},
    {"name": "Grace", "score": 95},
    {"name": "Linus", "score": 79},
    {"name": "Mary", "score": 95},
]

# Query 1: filter — keep the top performers
print("Top of the class:")
for student in students:
    if student["score"] >= 90:
        print("-", student["name"], student["score"])

# Query 2: aggregate — the class average
total = 0
for student in students:
    total += student["score"]
average = total / len(students)
print("Class average:", average)

# Query 3: count — exact matches
count = 0
for student in students:
    if student["score"] == 95:
        count += 1
print("Scored 95:", count, "students")
`,
      expectedOutput: `Top of the class:
- Grace 95
- Mary 95
Class average: 89.25
Scored 95: 2 students`,
      concepts: ["records", "filters", "accumulators", "lists of dicts"],
    },
    {
      id: "e-a3",
      tier: "advanced",
      title: "Customer overlap analytics",
      prompt:
        "Two sets of customer names are given: python_buyers and sql_buyers. Using set operations only (no hand-written search loops), print three reports, each sorted: the customers who bought BOTH courses (intersection), the customers who bought AT LEAST ONE (union), and the customers who bought Python only (difference) — these are your upsell targets for the SQL course. Wrap every printed set in sorted() so the output is a predictable list.",
      hint: "The three operators from e-03: & for the overlap, | for the union, - for the left-only group. sorted() turns each result into a tidy, ordered list.",
      starter: `python_buyers = {"ada", "grace", "linus", "mary"}
sql_buyers = {"grace", "linus", "ken"}

# 1. Bought BOTH (sorted)
# 2. Bought AT LEAST ONE (sorted)
# 3. Bought Python ONLY — the upsell targets (sorted)

`,
      solution: `python_buyers = {"ada", "grace", "linus", "mary"}
sql_buyers = {"grace", "linus", "ken"}

both = python_buyers & sql_buyers        # intersection: the overlap
either = python_buyers | sql_buyers      # union: at least one
only_python = python_buyers - sql_buyers # difference: Python only

print("Bought both:", sorted(both))
print("Bought at least one:", sorted(either))
print("Python only:", sorted(only_python))
`,
      expectedOutput: `Bought both: ['grace', 'linus']
Bought at least one: ['ada', 'grace', 'ken', 'linus', 'mary']
Python only: ['ada', 'mary']`,
      concepts: ["sets", "intersection", "union", "difference"],
    },
    {
      id: "e-a4",
      tier: "advanced",
      title: "The employee database",
      prompt:
        "employees below is a list of records with \"name\", \"dept\", and \"salary\". Produce three reports. (1) One line per data-department employee ('data: <name> <salary>') plus their combined payroll. (2) The top earner, found by tracking the current leader in a loop over the records (start with the first record as the leader — no sorted() allowed). (3) A count of employees per department using the counting pattern counts[dept] = counts.get(dept, 0) + 1, printed as the whole counts dict.",
      hint: "Report 2: top = employees[0], then for each employee, if employee[\"salary\"] > top[\"salary\"], replace the leader. Report 3 is the e-04 counting pattern with employee[\"dept\"] as the key.",
      starter: `employees = [
    {"name": "Ada", "dept": "data", "salary": 82000},
    {"name": "Grace", "dept": "data", "salary": 91000},
    {"name": "Linus", "dept": "eng", "salary": 95000},
    {"name": "Mary", "dept": "design", "salary": 76000},
]

# Report 1: data-department lines + combined data payroll

# Report 2: the top earner (track the leader in a loop)

# Report 3: employees per department (counting pattern)

`,
      solution: `employees = [
    {"name": "Ada", "dept": "data", "salary": 82000},
    {"name": "Grace", "dept": "data", "salary": 91000},
    {"name": "Linus", "dept": "eng", "salary": 95000},
    {"name": "Mary", "dept": "design", "salary": 76000},
]

# Report 1: filter + accumulate the data payroll
data_payroll = 0
for employee in employees:
    if employee["dept"] == "data":
        print("data:", employee["name"], employee["salary"])
        data_payroll += employee["salary"]
print("Data payroll:", data_payroll)

# Report 2: track the leader (no sorted allowed)
top = employees[0]                       # the leader so far
for employee in employees:
    if employee["salary"] > top["salary"]:
        top = employee                   # a new champion
print("Top earner:", top["name"], "at", top["salary"])

# Report 3: the counting pattern, keyed by department
dept_counts = {}
for employee in employees:
    dept_counts[employee["dept"]] = dept_counts.get(employee["dept"], 0) + 1
print(dept_counts)
`,
      expectedOutput: `data: Ada 82000
data: Grace 91000
Data payroll: 173000
Top earner: Linus at 95000
{'data': 2, 'eng': 1, 'design': 1}`,
      concepts: ["records", "counting pattern", "tracking the max", "filters"],
    },
  ],

  // =====================================================================
  // PART E ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "e-as-1",
      prompt: "You are storing the daily high temperature for each day of this week, in date order, and you will keep appending next week's readings to the same collection. Which container fits best?",
      options: [
        { text: "A tuple — temperatures are numbers, and tuples hold numbers", correct: false, feedback: "Tuples hold anything, but they are sealed: next week's readings could never be added." },
        { text: "A set — it stores many values at once", correct: false, feedback: "Sets drop duplicates and keep no order — two identical temperatures would silently become one. Dangerous for readings." },
        { text: "A list — ordered, and append() is exactly the job", correct: true, feedback: "Exactly — a growing, ordered sequence of values is the list's home turf." },
        { text: "A dict — it stores many values too", correct: false, feedback: "A dict needs a key for every value — you would have to invent labels for plain readings, which the task never asked for." },
      ],
      explanation: "Ordered and growing means list: the readings keep their order and append() is built for exactly this.",
    },
    {
      id: "e-as-2",
      prompt: "Predict the output: a = [1, 2], then b = a, then b.append(3), then print(a).",
      options: [
        { text: "[1, 2]", correct: false, feedback: "That would be true if b were a copy — plain assignment shares the list." },
        { text: "[1, 2, 3]", correct: true, feedback: "Correct — b is a second name for the SAME list, so the append is visible through a." },
        { text: "TypeError, because b is not allowed to change a's list", correct: false, feedback: "No rule was broken — both names point at one mutable list, and either may change it." },
        { text: "[1, 2, 3] on the first run, [1, 2] on the second", correct: false, feedback: "Nothing about aliasing depends on how many times the program runs — the list is shared, period." },
      ],
      explanation: "b = a aliases one list under two names; the mutation through b is seen by a. Only b = a[:] would have protected it.",
    },
    {
      id: "e-as-3",
      prompt: "Predict the output: temps = [10, 20, 30, 40, 50], then print(temps[1:4]).",
      options: [
        { text: "[10, 20, 30, 40]", correct: false, feedback: "That is temps[:4] — the slice starts at index 1 here, not at the front." },
        { text: "[20, 30, 40]", correct: true, feedback: "Exactly — start at index 1, stop BEFORE 4: indexes 1, 2, 3. Three items, stop minus start." },
        { text: "[20, 30, 40, 50]", correct: false, feedback: "Index 4 is the stop — and stop is exclusive, so 50 never makes it in." },
        { text: "[30, 40]", correct: false, feedback: "That is temps[2:4] — check where the slice hugs: it starts at 1." },
      ],
      explanation: "Slices hug start, stop one before stop: [1:4] takes indexes 1, 2, 3 — the values 20, 30, 40.",
    },
    {
      id: "e-as-4",
      prompt: "Predict the output: stock = {\"mug\": 7}, then print(stock.get(\"hoodie\", \"none\")), then print(\"mug\" in stock).",
      options: [
        { text: "none, then True", correct: true, feedback: "Correct — get() answers with your default for the missing hoodie, and in checks the keys, where 'mug' lives." },
        { text: "7, then True", correct: false, feedback: "7 is the MUG's value — but get was asked about 'hoodie', which is missing." },
        { text: "KeyError, then True", correct: false, feedback: "KeyError is square-bracket behavior — .get() never crashes." },
        { text: "none, then False", correct: false, feedback: "So close on the first half — but in on a dict checks KEYS, and 'mug' IS a key." },
      ],
      explanation: "Two dict traps in one: .get() returns your default when the key is missing, and in checks keys only.",
    },
    {
      id: "e-as-5",
      prompt: "votes = [\"ada\", \"grace\", \"ada\", \"linus\", \"ada\"]. What is len(set(votes))?",
      options: [
        { text: "5", correct: false, feedback: "That is the length of the LIST — the set first collapses the three 'ada' votes into one." },
        { text: "3", correct: true, feedback: "Correct — ada, grace, linus: three unique voters after the duplicates collapse." },
        { text: "1", correct: false, feedback: "Only if all five votes were identical — grace and linus also survive." },
        { text: "An error, because 'ada' appears three times", correct: false, feedback: "Repeated values are exactly what sets are built to absorb — no error, just fewer items." },
      ],
      explanation: "set(votes) deduplicates: 5 votes, 3 voters. The dedup pattern in one expression.",
    },
    {
      id: "e-as-6",
      prompt: "temps = [21.5, 23.0, 19.5]. Which ONE of these four expressions raises IndexError?",
      options: [
        { text: "temps[0:10]", correct: false, feedback: "Slices clip to what exists — this safely returns the whole three-item list." },
        { text: "temps[5]", correct: true, feedback: "Correct — a single index must exist exactly, and index 5 is past the end (valid indexes run 0 to 2)." },
        { text: "temps[-3:]", correct: false, feedback: "Negative slice from three-back to the end — perfectly legal, returns the whole list here." },
        { text: "temps[:]", correct: false, feedback: "The full-copy slice — always legal, always a fresh list." },
      ],
      explanation: "The rule that separates them: single indexes are strict (IndexError), slices are forgiving (they clip).",
    },
    {
      id: "e-as-7",
      prompt: "Predict the output of: for place, name in enumerate([\"Ada\", \"Grace\"], start=1): print(place, name)",
      options: [
        { text: "0 Ada — then 1 Grace", correct: false, feedback: "That is enumerate WITHOUT start=1 — the start argument shifted the counting." },
        { text: "1 Ada — then 2 Grace", correct: true, feedback: "Correct — start=1 numbers the items 1, 2, and unpacking pairs each count with its item." },
        { text: "Ada 1 — then Grace 2", correct: false, feedback: "The order is (position, item) — the number comes first." },
        { text: "An error — enumerate yields one value, not two", correct: false, feedback: "enumerate yields (position, item) PAIRS — exactly what two loop variables unpack." },
      ],
      explanation: "enumerate numbers the items (start=1 makes the counting human-friendly) and unpacking splits each pair.",
    },
    {
      id: "e-as-8",
      prompt: "Predict the output: teams = [{\"name\": \"red\", \"points\": [3, 1]}, {\"name\": \"blue\", \"points\": [0, 4]}], then print(teams[1][\"points\"][0]).",
      options: [
        { text: "3", correct: false, feedback: "That is teams[0][\"points\"][0] — the red team's first point. The index starts at 1 here." },
        { text: "0", correct: true, feedback: "Correct — teams[1] is blue, [\"points\"] is [0, 4], and [0] takes the first: 0." },
        { text: "4", correct: false, feedback: "That is teams[1][\"points\"][1] — the second point of the blue team." },
        { text: "KeyError, because points is a list, not a dict", correct: false, feedback: "Each bracket matches its own level: index the list, key the dict, index the list again. No conflict." },
      ],
      explanation: "Nested access is one bracket per level, left to right: record, then field, then list item — 0.",
    },
  ],

  // =====================================================================
  // PART E MINI PROJECT
  // =====================================================================
  project: {
    title: "The Student Gradebook Analyzer",
    brief:
      "You will build a complete grade-analysis program around a hardcoded list of student records — the same shape real data arrives in. For each student you will compute an average with an accumulator loop and a letter grade with the if/elif logic from Part C, then compute class statistics (highest average, lowest average, and the class mean), build an honor roll, rank the class best-first, and print a formatted report with aligned f-string columns. Every pattern in this project — records as a list of dicts, accumulator loops, dict operations, sorting with a key — returns at full scale in the data-science part of this course.",
    requirements: [
      "A hardcoded list of at least five student records, each a dict with a 'name' string and a 'scores' list of at least three numbers",
      "A loop that computes each student's average with an accumulator and stores it back into the record as student[\"average\"] (a dict operation)",
      "A letter grade per student using if/elif/else with exactly these thresholds: A for >= 90, B for >= 80, C for >= 70, else F — stored as student[\"grade\"]",
      "Class statistics computed with loops and accumulators: the highest average, the lowest average, and the class mean (the average of the averages)",
      "An honor roll: the names of every student with grade A, collected into a list inside a loop",
      "A best-first ranking printed with the provided sorted(students, key=..., reverse=True) pattern from the starter",
      "A formatted report: a header, one aligned line per student using f-strings (name, average rounded to 1 decimal with round(), grade), then the statistics and the honor roll",
      "No input() and no randomness — the data is hardcoded and the output is fully deterministic",
    ],
    steps: [
      "Step 1 — Type the data: build students as a list of five dicts, each with 'name' and a three-number 'scores' list. Run the file — it should print the placeholder line and nothing else.",
      "Step 2 — Compute the averages: loop over students, total each student['scores'] with an accumulator, then store student['average'] = total / len(student['scores']). Print a check line per student and verify one average by hand.",
      "Step 3 — Assign letter grades: in the same loop, use an if/elif/else chain with the exact thresholds (A >= 90, B >= 80, C >= 70, else F) and store student['grade'].",
      "Step 4 — Track the class statistics while looping: keep the highest and lowest average seen so far, and sum all the averages for the class mean (divide by len(students)).",
      "Step 5 — Build the honor roll: in a loop, append the name of every student whose grade is 'A' to an honor_roll list; print it after the loop.",
      "Step 6 — Rank the class: use the provided sorted(students, key=lambda s: s[\"average\"], reverse=True) pattern and print name, average, and grade per line, best first.",
      "Step 7 — Assemble the final report: a header line, the aligned per-student table, the three statistics, and the honor roll. Then do the review pass: recheck one average by hand and reread every output line as a reader, not a writer.",
    ],
    starter: `# ============================================
# The Student Gradebook Analyzer
# What: reads a hardcoded list of student records
#       and prints a full analysis report
# ============================================

# --- Step 1: the data (a list of dicts — records) ---
students = [
    {"name": "Ada", "scores": [92, 88, 95]},
    {"name": "Grace", "scores": [97, 91, 89]},
    {"name": "Linus", "scores": [78, 85, 74]},
    {"name": "Mary", "scores": [90, 86, 93]},
    {"name": "Ken", "scores": [65, 72, 68]},
]

# Provided pattern (you will meet \`key=\` properly in Part F — for now, read it
# as "sort these records by their 'average' field, best first"). It only works
# after Step 2 has stored an "average" in every record:
# ranked = sorted(students, key=lambda s: s["average"], reverse=True)

# --- Step 2: per-student average + letter grade ---
# TODO: loop over students; total the scores with an accumulator
# TODO: student["average"] = total / len(student["scores"])
# TODO: letter grade with if / elif / else (A >= 90, B >= 80, C >= 70, else F)
# TODO: student["grade"] = the letter

# --- Step 3: class statistics ---
# TODO: highest average, lowest average, class mean — track while looping

# --- Step 4: honor roll + ranking ---
# TODO: honor roll = names of students with grade "A", collected in a loop
# TODO: print students best-first with the sorted(...) pattern from above

# --- Step 5: the formatted report ---
# TODO: header, one aligned line per student (name, average, grade),
#       then the class statistics, then the honor roll

print("Gradebook under construction — start at Step 2")
`,
    concepts: ["lists of dicts", "accumulators", "if/elif", "dict operations", "sorted() with key", "f-strings"],
    extension:
      "Per-subject statistics: compute the average of each exam separately — exam 1 is every student's scores[0], exam 2 is scores[1], and so on. Print one line per exam ('Exam 1 average: 88.2'), then find the hardest exam (the lowest average) and print its number and average.",
  },
};
