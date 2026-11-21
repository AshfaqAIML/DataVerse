/**
 * PART B — PROGRAMMING FUNDAMENTALS
 *
 * The direct continuation of Part A: the student has installed Python, run
 * programs, read errors — now we teach the vocabulary of every program:
 * data, names, and operations. Lesson order: variables -> data types ->
 * numbers -> strings -> booleans -> type conversion -> input and output ->
 * operators -> expressions -> comments.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Machine-dependent output (terminal sessions, input() dialogs) uses lang
 * "bash"/"text" and is never presented as verified program output.
 */
import type { Part } from "@/lib/course/types";

export const PART_B: Part = {
  letter: "B",
  title: "Programming Fundamentals",
  tagline: "The vocabulary of every program: data, names, and operations",
  description:
    "Variables, data types, numbers, strings, booleans, conversions, input and output, operators, expressions, and comments — the complete foundation of writing Python.",
  lessons: [
    // ------------------------------------------------------------- b-01
    {
      slug: "b-01",
      title: "Variables",
      minutes: 15,
      summary:
        "How programs remember: creating names, pointing them at values, re-pointing them, and the naming rules and snake_case conventions that keep code readable.",
      kind: "coding",
      objectives: [
        "Create variables with well-chosen names and assign them values",
        "Explain assignment as a label pointing at a value — not a box holding it",
        "Predict what any print shows after one or more reassignments",
        "Apply Python's naming rules to spot invalid names on sight",
      ],
      why: "Part A gave you a taste of `name = \"Ada\"`, but variables are the most-used tool in all of programming — every program you will ever write stores, changes, and reads values by name. If naming feels loose now, it becomes unreadable code later. This lesson makes the foundation exact: what assignment really does, how reassignment behaves, and how professional Python programmers choose names — so every later lesson (input, conditionals, loops) builds on rock instead of guesswork.",
      blocks: [
        {
          kind: "text",
          text: "In Part A you wrote `name = \"Ada\"` and `weather = \"sunny\"` and trusted they would hold their values. Now we slow down and make variables precise, because they are the memory of every program: the answer to *what does this program remember right now?* A **variable** is a name that is attached to a value. You create it by *assigning* a value to a name — and from then on, the name stands for that value everywhere below.",
        },
        {
          kind: "heading",
          text: "A label you stick on a value — not a box",
        },
        {
          kind: "text",
          text: "The most common beginner mental model is wrong, so let us fix it before it settles. A variable is **not a box** that contains a value. It is a **label, or name tag**, attached to a value that lives somewhere in Python's memory. The difference sounds philosophical — until you see it predict real behavior in a few minutes, when one name gets re-pointed and another does not.",
        },
        {
          kind: "visual",
          title: "Assignment, reassignment, and copying — as name tags",
          ascii: `  score = 0            score = 10           y = x

   score --> 0           score --> 10          x --> 5
                                               y --> 5
                        0 is dropped;
                        only the newest       x = 99 re-points ONLY x:
                        value survives          x --> 99
                                                 y --> 5   unchanged!
`,
          caption:
            "Assignment points a name at a value. Reassignment moves the label. Copying (y = x) copies the pointer, not the name — so re-pointing x later cannot affect y.",
        },
        {
          kind: "code",
          title: "Creating and reading variables",
          code: `player_name = "Ada"
score = 0
level = 1

print(player_name)
print(score)
print(level)
`,
          output: `Ada
0
1`,
          outputNote: "Real output of running this exact code with Python 3.12.",
          explain: [
            "Each of the first three lines creates a variable: a name on the left, a value on the right, joined by `=`.",
            "The three print lines read them back — `print(score)` means 'look up the value attached to score and show it'.",
            "Read `=` as **gets**: `score = 0` is 'score gets 0'. It stores; it does not compare. Comparison is `==`, which you met in lesson a-06 with `0.1 + 0.2 == 0.3`.",
          ],
        },
        {
          kind: "heading",
          text: "Reassignment: the newest value wins",
        },
        {
          kind: "code",
          title: "Updating a variable — the pattern every program uses",
          code: `score = 0
print("score starts at", score)

score = 10
print("score is now", score)

score = score + 5
print("score ends at", score)
`,
          output: `score starts at 0
score is now 10
score ends at 15`,
          explain: [
            "Line 5 re-points `score` at 10. The old 0 is dropped — after reassignment, no trace of it survives.",
            "Line 8 is the one to slow down on: `score = score + 5`. Python computes the **right side first** (10 + 5 is 15), and only then stores the result into the name on the left.",
            "So the same name appears on both sides safely: it means 'take the current value, do the math, replace the value'. You used this exact pattern in lesson a-08 (`x = x + 10`).",
          ],
        },
        {
          kind: "code",
          title: "Proof that names are labels: copy the target, not the name",
          code: `x = 5
y = x
x = 99
print("x:", x)
print("y:", y)
`,
          output: `x: 99
y: 5`,
          explain: [
            "Line 2, `y = x`, makes y point at whatever x points at *at that moment*: the value 5. y does not become 'an alias for the name x'.",
            "Line 3 re-points x at 99 — and y is untouched, still pointing at 5. If variables were boxes, y would have changed; with labels, it cannot.",
            "This is exactly what the name-tag picture promised, now proven by running code.",
          ],
        },
        {
          kind: "heading",
          text: "The rules of legal names",
        },
        {
          kind: "table",
          title: "What Python allows in a variable name",
          headers: ["Rule", "Legal example", "Broken example"],
          rows: [
            ["Letters, digits, and underscores only", `total_score, player2`, `total-score (hyphen is subtraction!)`],
            ["Cannot start with a digit", `place2, s3`, `2nd_place, 4k`],
            ["No spaces", `first_name`, `first name`],
            ["Case-sensitive: Score and score are different names", `score, Score`, `score vs Score used interchangeably`],
            ["Cannot be a reserved keyword (class, for, if, while...)", `klass, for_now`, `class, for`],
          ],
          caption:
            "Python has 35 reserved keywords that have fixed meanings and cannot be used as names. Your editor colors them differently — that coloring is a free legality check.",
        },
        {
          kind: "code",
          title: "A name starting with a digit — refused",
          expectError: "SyntaxError: invalid decimal literal",
          code: `# A name cannot start with a digit
2nd_place = "silver"
`,
          explain: [
            "Python reads `2nd_place` and trips over `2n` — digits followed by letters are not a legal name start, so it reports a syntax error before running anything.",
            "The fix is always the same: lead with a letter or underscore — `place_2 = \"silver\"` or `second_place = \"silver\"`.",
          ],
        },
        {
          kind: "code",
          title: "Case sensitivity — City is not city",
          expectError: "NameError: name 'City' is not defined. Did you mean: 'city'?",
          code: `city = "Oslo"
print(City)
`,
          explain: [
            "The variable is `city`, all lowercase. Capitalizing it as `City` asks Python for a *different, never-created* name — a NameError.",
            "Read Python's full message: it even suggests 'Did you mean: city?'. Error messages are on your side (lesson a-09 was right).",
            "The fix: pick one spelling and keep it. This is a big reason professionals stick to lowercase names — fewer case typos.",
          ],
        },
        {
          kind: "heading",
          text: "Conventions: how professionals actually name things",
        },
        {
          kind: "table",
          title: "The naming habits of readable code",
          headers: ["Convention", "Looks like", "Why"],
          rows: [
            ["snake_case for variables: lowercase words joined by underscores", "days_left, total_price", "It is the standard Python style — and underscores were already proven legal above"],
            ["Names describe the VALUE, not the type", "minutes_left, not number3", "A name is documentation: it should say what the data means, not what kind it is"],
            ["Short is bad, clear is good", "days_until_launch beats d or dal", "You read code many more times than you write it (Part A's readability theme, applied to names)"],
            ["ALL_CAPS for fixed values (preview)", "MAX_LEVELS = 10", "A signal to readers: 'this never changes' — you will use this in later parts"],
          ],
          caption:
            "None of these are laws; all of them are what your future teammates will expect. Names are the cheapest documentation you will ever write.",
        },
        {
          kind: "tryIt",
          title: "Try it — predict, then run",
          task: "Before running, write down on paper what the last three prints will show. Then run and score yourself. Then re-point temp using its own current value (like the score example) and run again.",
          code: `temp = 21
label = "warm"
temp = temp + 4

print("temp:", temp)
print("label:", label)

copy_of_temp = temp
temp = 0
print("copy survived:", copy_of_temp)
`,
          hint: "Trace in order: temp is 21, then 25. copy_of_temp copies 25 — so after temp = 0, the copy still shows 25. Names are labels: the copy kept pointing at 25.",
        },
      ],
      terms: [
        { term: "Variable", definition: "A name attached to a value. Programs remember things by binding values to names and reading them back." },
        { term: "Assignment", definition: "The act of binding a name to a value with =. The right side is computed first, then the result is bound to the name." },
        { term: "Reassignment", definition: "Binding an already-used name to a new value. The old value is dropped — only the newest value survives." },
        { term: "Identifier", definition: "The official word for a legal name: letters, digits, and underscores, never starting with a digit, and never a reserved keyword." },
        { term: "snake_case", definition: "The Python naming style: lowercase words joined by underscores, as in total_price or days_left." },
      ],
      mistakes: [
        {
          mistake: "Reading = as 'equals' like in math class.",
          why: "In math, x = 5 is a statement of fact. In Python, = is an action: 'compute the right side, attach it to this name.'",
          fix: "Say 'gets' out loud: score gets 0. For asking 'are these equal?' use ==, which you met in lesson a-06.",
        },
        {
          mistake: "Names with spaces, hyphens, or leading digits: first name, my-score, 2nd_place.",
          why: "Spaces end the name; a hyphen is the subtraction operator (my-score is my minus score); a leading digit is read as a number.",
          fix: "Use underscores: first_name, my_score, second_place. Underscores exist in names precisely for this job.",
        },
        {
          mistake: "Switching capitalization mid-program: creating city but printing City.",
          why: "Names are case-sensitive — City and city are two entirely different names, so the second one is 'not defined'.",
          fix: "Use all-lowercase snake_case for variables and read Python's NameError suggestion; it usually names the name you meant.",
        },
        {
          mistake: "Choosing names like a, x1, temp2, value to save typing.",
          why: "The program works today and is unreadable next week — including by you. Vague names hide bugs and slow down every future edit.",
          fix: "Spend the extra two seconds now: minutes_left, score_player_one, total_with_tax. Clear names are free documentation.",
        },
      ],
      takeaways: [
        "A variable is a label attached to a value — assignment points the name, reassignment re-points it.",
        "Read = as 'gets': score = 10 means score gets 10. The right side is computed first, then stored.",
        "y = x copies what x points at right now; re-pointing x later never affects y.",
        "Legal names: letters, digits, underscores; never start with a digit; case-sensitive; no keywords.",
        "Write snake_case names that describe the value — days_left beats d. Names are the cheapest documentation you will ever write.",
      ],
      quiz: [
        {
          id: "b-01-q1",
          prompt: "After laps = 3, then laps = laps + 1, what does print(laps) show?",
          options: [
            { text: "3", correct: false, feedback: "The second line replaced the value — 3 is long gone." },
            { text: "4", correct: true, feedback: "Correct: the right side computes 3 + 1 = 4, then laps gets 4." },
            { text: "An error — a variable cannot appear on both sides of =", correct: false, feedback: "It is not just legal, it is the standard updating pattern — right side first, then store." },
          ],
          explanation: "laps = laps + 1 means: take the current laps, add 1, re-point laps at the result.",
        },
        {
          id: "b-01-q2",
          prompt: "Which of these is NOT a valid Python variable name?",
          options: [
            { text: "total_score", correct: false, feedback: "Valid — lowercase words joined by an underscore is the ideal snake_case name." },
            { text: "_hidden", correct: false, feedback: "Valid — starting with an underscore is legal (it is a convention meaning 'internal')." },
            { text: "2nd_place", correct: true, feedback: "Correct — names cannot start with a digit; Python raises SyntaxError: invalid decimal literal." },
            { text: "player2", correct: false, feedback: "Valid — digits are fine anywhere except the first character." },
          ],
          explanation: "The rule: letters, digits, underscores — and the first character must be a letter or underscore.",
        },
        {
          id: "b-01-q3",
          prompt: "In x = 5 followed by y = x and then x = 99, what does print(y) show?",
          options: [
            { text: "99, because y follows x", correct: false, feedback: "y is not glued to the name x — it copied what x pointed at *at that moment*." },
            { text: "5", correct: true, feedback: "Exactly: y got 5, and re-pointing x afterward cannot touch y. Labels, not boxes." },
            { text: "An error, because x changed after y was defined", correct: false, feedback: "No error — y safely keeps its own pointer to 5." },
          ],
          explanation: "Assignment copies the pointer to the value, not a link between names. Reassigning x leaves y untouched.",
        },
      ],
    },

    // ------------------------------------------------------------- b-02
    {
      slug: "b-02",
      title: "Data Types",
      minutes: 13,
      summary:
        "Every value has a type — int, float, str, or bool — and the type decides what operations mean. Learn to check types with type() and what dynamic typing really is.",
      kind: "concept",
      objectives: [
        "Name the four core Python types and give one literal example of each",
        "Check any value's type with type() and read its output",
        "Predict how + and * change meaning depending on the types involved",
        "Explain what dynamic typing means for how you write code",
      ],
      why: "Every value your program touches — an age, a price, a name, a yes/no flag — has a type, and that type decides what operations make sense. The same + that adds 5 + 3 glues \"5\" + \"3\" into \"53\": one symbol, two meanings, chosen by the types involved. Understanding types is what lets you predict behavior instead of guessing it, read TypeError messages fluently, and understand why input() (coming in lesson b-07) always hands you text even when the user typed digits.",
      blocks: [
        {
          kind: "text",
          text: "Here is a real-world type accident. A spreadsheet of customer data stores the ZIP code **01234**. The spreadsheet sees digits and helpfully treats them as a number — which drops the leading zero and turns it into **1234**. Nothing crashed; the data is simply *wrong now*. The column was text pretending to be a number. **Types** are how a program keeps those two ideas apart.",
        },
        {
          kind: "text",
          text: "In Python, every value carries a tag saying what *kind* of thing it is — a whole number, a decimal, text, or a truth value. That tag is its **type**, and it is not decoration: the type decides what operations are legal and what they mean. The four types you will use in every single program from today on:",
        },
        {
          kind: "table",
          title: "The four core types",
          headers: ["Type", "Literal examples", "What it is for"],
          rows: [
            ["int (integer)", "42, 0, -7, 1984", "Whole numbers — counts, ages, quantities, indexes"],
            ["float (floating-point)", "3.14, -2.5, 0.0, 42.0", "Decimal numbers — prices, measurements, averages"],
            ["str (string)", '"hello", \'a\', "42"', "Text — names, messages, anything meant to be read"],
            ["bool (boolean)", "True, False", "Truth values — the yes/no answers programs decide with"],
          ],
          caption:
            "Notice \"42\" in quotes: it is a string of two characters, not the number 42. Same shape on screen, different species of data.",
        },
        {
          kind: "heading",
          text: "Asking a value what it is: type()",
        },
        {
          kind: "code",
          title: "The four types, verified live",
          code: `print(type(42))
print(type(3.14))
print(type("hello"))
print(type(True))
`,
          output: `<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>`,
          explain: [
            "`type(anything)` returns the type of that value — the single most useful inspection tool in Python.",
            "The odd-looking `<class 'int'>` reads as: 'this value belongs to the class of things called int'. The word *class* gets its full story in Part H; for now, read `<class 'T'>` as simply 'type T'.",
            "Note that `True` has no quotes around it — it is a bool, not the text \"True\".",
          ],
        },
        {
          kind: "heading",
          text: "Same operator, different meaning — why types matter",
        },
        {
          kind: "text",
          text: "The deepest reason to care about types is in this one demonstration. Watch what `*` and `+` do to numbers versus to strings — same symbols, completely different behaviors, chosen entirely by the types of the values:",
        },
        {
          kind: "code",
          title: "One operator, two personalities",
          code: `print(5 * 3)
print("5" * 3)
print(5 + 3)
print("5" + "3")
`,
          output: `15
555
8
53`,
          explain: [
            "`5 * 3` — numbers: multiplication. `5 + 3` — numbers: addition. So far, so familiar.",
            "`\"5\" * 3` — string times number: **repetition**. Three copies of the text glued together: 555.",
            "`\"5\" + \"3\"` — string plus string: **concatenation**. The two characters are joined side by side: 53.",
            "Python did not convert anything or warn you. It looked at the types and picked the matching meaning. Predict behavior by asking: *what types are on each side?*",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The dangerous case is the silent one",
          text: "Later, when data arrives from users or files, a value that *should* be 5 might arrive as the string \"5\". Then 5 + 3 becomes \"5\" + 3 (a TypeError crash) — or worse, \"5\" + \"3\" quietly produces \"53\": no error, just a wrong answer, like the ZIP code story. When a result looks wildly wrong, checking types is your first diagnostic move.",
        },
        {
          kind: "heading",
          text: "Dynamic typing: a name can change species",
        },
        {
          kind: "text",
          text: "In many languages (Java, C, Rust), you declare each variable's type up front and it is locked forever. Python does the opposite: **names have no fixed type at all — values do**. You can point the same name at a number now and text next line. That is called **dynamic typing**, and it is a real design choice with real trade-offs:",
        },
        {
          kind: "code",
          title: "One name, two types in three lines",
          code: `x = 42
print(type(x))
x = "now I am text"
print(type(x))
`,
          output: `<class 'int'>
<class 'str'>`,
          explain: [
            "The name `x` carried an int, then carried a str. Python checked nothing in advance — it just re-pointed the label (lesson b-01).",
            "The freedom: no type declarations, fast to write, perfect for exploring. The responsibility: Python will not stop you from pointing a name at a wildly different type *by accident*.",
            "Professional habit: dynamic typing makes it legal to reuse names for new types — but keep one name to one meaning. Your readers (and you) rely on it.",
          ],
        },
        {
          kind: "code",
          title: "Operations have types too — predict with type()",
          lang: "repl",
          code: `>>> type(2 + 2)
<class 'int'>
>>> type(2 + 2.0)
<class 'float'>
>>> type("2" + "2")
<class 'str'>
>>> type(2 > 1)
<class 'bool'>`,
          outputNote:
            "Each >>> line is what you type; the line under it is Python's answer. The type of a result depends on the operation and the operand types.",
          explain: [
            "int + int stays int; int + float promotes to float (you will see why in lesson b-03).",
            "string + string stays string; a comparison produces a bool.",
            "This REPL habit — `type(suspicious_value)` — is how professionals debug data that 'looks wrong'.",
          ],
        },
        {
          kind: "visual",
          title: "Reading the type() report",
          ascii: `  >>> type(42)
  <class 'int'>
   ^^^^^^ ^^^
     |     |
     |     +--- the type's name: int, short for integer
     |
     +--------- "this value belongs to the int family of values"
                 (the full word 'class' arrives in Part H)
`,
          caption: "You will see this shape constantly. Left angle bracket, class, the name, right angle bracket — read it as 'type int'.",
        },
        {
          kind: "tryIt",
          title: "Try it — predict the type before running",
          task: "On paper, write the type of each value below — then run to check. Then add two lines of your own: one value you are sure about, one you are not, and check it. Prediction first, verification second: that is the REPL spirit from lesson a-06.",
          code: `print(type(7))
print(type(7.0))
print(type("7"))
print(type(7 == 7))
print(type(True))
`,
          hint: "7 is int; 7.0 is float; \"7\" is str; 7 == 7 is a comparison, so its result is a bool; True is also bool. Two of these print the same type — which?",
        },
      ],
      terms: [
        { term: "Data type", definition: "The kind of value something is — int, float, str, bool — which decides what operations mean and which are legal." },
        { term: "Literal", definition: "A value written directly in code: 42, 3.14, \"hello\", True. Literals are typed — \"42\" and 42 are different types." },
        { term: "type()", definition: "The built-in function that returns the type of any value — your first diagnostic tool when data misbehaves." },
        { term: "Dynamic typing", definition: "Python's rule that names have no fixed type: values carry types, names just point at values." },
        { term: "Static typing", definition: "The opposite approach (Java, C, Rust): each variable declares one type up front, enforced before the program runs." },
      ],
      mistakes: [
        {
          mistake: "Treating \"5\" and 5 as the same thing because they look the same on screen.",
          why: "Printing hides the difference; operating reveals it — 5 + 3 is 8 but \"5\" + \"3\" is \"53\", and \"5\" * 3 is \"555\".",
          fix: "When output surprises you, ask what type each value really is. type() answers in one line.",
        },
        {
          mistake: "Assuming a variable keeps the type it was first given.",
          why: "Python is dynamically typed: a name is just a label, and the value it points at carries the type.",
          fix: "It is legal to re-point a name at a new type — but keep one name to one meaning, or readers (including you) get lost.",
        },
        {
          mistake: "Expecting Python to auto-convert between types to make an operation work.",
          why: "Python deliberately refuses to guess: \"5\" + 3 raises TypeError rather than silently picking addition or concatenation.",
          fix: "Convert explicitly — int(\"5\") + 3 or \"5\" + str(3) — the full toolkit is lesson b-06.",
        },
      ],
      takeaways: [
        "Every value has exactly one type: int, float, str, or bool — and the type decides what operations mean.",
        "\"42\" is not 42: text of two characters versus a number. Printing hides it; operating reveals it.",
        "Same operator, different meaning: + adds numbers, glues strings, and crashes on mixed pairs (TypeError).",
        "type(value) is your first diagnostic when data misbehaves; read <class 'int'> as 'type int'.",
        "Dynamic typing: names have no fixed type, values do — legal to re-point, wise to keep one name to one meaning.",
      ],
      quiz: [
        {
          id: "b-02-q1",
          prompt: "What is the type of the value 2.0?",
          options: [
            { text: "int — there is nothing after the decimal point", correct: false, feedback: "Tempting, but the decimal point itself declares the type: any literal with a . is a float." },
            { text: "float", correct: true, feedback: "Correct — the dot makes it a floating-point value, even with a zero after it." },
            { text: "str", correct: false, feedback: "No quotes — it is a numeric literal, not text." },
          ],
          explanation: "The period in the literal decides: 2.0 is float, 2 is int. Same value, different type.",
        },
        {
          id: "b-02-q2",
          prompt: "What does print(\"2\" + \"2\") output?",
          options: [
            { text: "4", correct: false, feedback: "That would be number addition — but these are strings, not ints." },
            { text: "22", correct: true, feedback: "Right — string concatenation glues the two characters side by side: 22." },
            { text: "A TypeError", correct: false, feedback: "Both sides are strings, so + is perfectly legal — it glues. Mixing str and int is what raises TypeError." },
          ],
          explanation: "Same symbol, meaning chosen by types: str + str is gluing, int + int is addition.",
        },
        {
          id: "b-02-q3",
          prompt: "x = 9, then x = \"nine\". What does type(x) show after both lines?",
          options: [
            { text: "<class 'int'> — the first type sticks", correct: false, feedback: "Names have no fixed type in Python — only values do, and x now points at a string." },
            { text: "<class 'str'>", correct: true, feedback: "Correct: dynamic typing re-pointed x at a string, so the value — and its type — is str." },
            { text: "An error — a name cannot change type", correct: false, feedback: "It is completely legal. Whether it is *wise* is a style question; whether it is *allowed* is not." },
          ],
          explanation: "Dynamic typing: the name is a label; the value it currently points at carries the type.",
        },
      ],
    },

    // ------------------------------------------------------------- b-03
    {
      slug: "b-03",
      title: "Numbers",
      minutes: 17,
      summary:
        "How Python handles its two number types: / vs //, remainder with %, powers, operator precedence, the honest limits of floating-point, and rounding done right.",
      kind: "coding",
      objectives: [
        "Choose between / and // and predict both the result and its type",
        "Use % to test divisibility and split quantities into groups",
        "Apply Python's precedence rules to predict a result before running it",
        "Explain the 0.1 + 0.2 surprise and use round() correctly, including its .5 rule",
      ],
      why: "Numbers are the first thing most programs compute — prices, scores, counts, temperatures — and Python has number behaviors that surprise every single newcomer: division always produces a float, // rounds in a way that changes negative results, and 0.1 + 0.2 is not 0.3 (you saw it in lesson a-06). Meeting these rules hands-on now means no real calculation will ever ambush you again — and it is exactly what lets you read rounding and type bugs in other people's code, which is most of what maintenance work is.",
      blocks: [
        {
          kind: "text",
          text: "Lesson b-02 gave you the two number types: **int** for counting and **float** for measuring. Now we make the *operations* precise — because in Python the same slash family hides four different operators (`/`, `//`, `%`, `**`), each with its own rules about result and type. This is the lesson your calculator never gave you.",
        },
        {
          kind: "heading",
          text: "int: the counting numbers, with no ceiling",
        },
        {
          kind: "code",
          title: "Integers can grow as big as your problem",
          code: `print(2 ** 100)
`,
          output: `1267650600228229401496703205376`,
          explain: [
            "`**` is the power operator: 2 to the 100th. In many languages (C, Java) this would **overflow** — silently wrap around to a wrong value — because their integers have a fixed size.",
            "Python ints grow as needed, exactly. 2 ** 100, 2 ** 1000, a bank ledger with a trillion entries: all fine, all precise. One entire category of bugs simply does not exist in Python.",
            "This also means ints are exact: `1 + 2` is always 3, never 2.9999999998. Exactness is the int's whole personality.",
          ],
        },
        {
          kind: "text",
          text: "Floats are the opposite deal: they trade tiny amounts of precision for speed and size. That trade is invisible most of the time — until it is not. The dot in the literal declares the type (`3.0` is a float even though it is a whole amount), and one operator in Python *always* speaks float, no matter what:",
        },
        {
          kind: "heading",
          text: "/ always returns a float — even when the math is clean",
        },
        {
          kind: "code",
          title: "The single slash never gives you an int",
          code: `print(7 / 2)
print(7 // 2)
print(type(7 / 2))
print(type(7 // 2))
print(10 / 2)
print(5.0 == 5)
`,
          output: `3.5
3
<class 'float'>
<class 'int'>
5.0
True`,
          explain: [
            "`7 / 2` is true division: 3.5, and always a float. `10 / 2` divides *cleanly* — and Python still answers `5.0`, a float. That trailing `.0` is the number one 'why is there a .0?!' question in beginner Python.",
            "`7 // 2` is **integer division** (double slash): it divides and keeps only the whole part — 3. With two ints, the result is an int.",
            "`5.0 == 5` is True: the *values* are equal, even though the *types* differ (lesson b-02's distinction, live).",
          ],
        },
        {
          kind: "heading",
          text: "// and %: the packaging pair",
        },
        {
          kind: "code",
          title: "Boxes and leftovers",
          code: `print(10 % 3)
print(20 % 7)
print(16 % 2)
print(2 ** 10)
print(26 // 4, "boxes and", 26 % 4, "left over")
`,
          output: `1
6
0
1024
6 boxes and 2 left over`,
          explain: [
            "`%` is the **modulus** operator: the remainder after division. 10 divided by 3 is 3 with remainder 1, so `10 % 3` is 1.",
            "`16 % 2` is 0 — no remainder, which means 16 is even. Testing with `% 2 == 0` is how programs decide even-or-odd, valid ID digits, leap years.",
            "The last line is the classic pair at work: 26 items into boxes of 4 gives `26 // 4` = 6 full boxes and `26 % 4` = 2 left over.",
          ],
        },
        {
          kind: "table",
          title: "The arithmetic operator map",
          headers: ["Operator", "Name", "Example", "Result"],
          rows: [
            ["+", "Addition", "7 + 2", "9"],
            ["-", "Subtraction", "7 - 2", "5"],
            ["*", "Multiplication", "7 * 2", "14"],
            ["/", "True division — always a float", "7 / 2", "3.5"],
            ["//", "Integer division — whole part only", "7 // 2", "3"],
            ["%", "Modulus — the remainder", "7 % 2", "1"],
            ["**", "Power", "7 ** 2", "49"],
          ],
          caption:
            "Four of these you knew; the pair // and % is the workhorse of packaging, paging, and evenness tests. Notice / is the only one that always floats.",
        },
        {
          kind: "heading",
          text: "Precedence: what computes first",
        },
        {
          kind: "code",
          title: "Predict each line before reading the output",
          code: `print(2 + 3 * 4)
print((2 + 3) * 4)
print(10 - 4 - 3)
print(100 / 10 * 2)
print(2 ** 3 ** 2)
`,
          output: `14
20
3
20.0
512`,
          explain: [
            "`2 + 3 * 4` is 14, not 20: `*` runs before `+` (PEMDAS, alive and well in Python). Parentheses are how *you* choose: `(2 + 3) * 4` is 20.",
            "`10 - 4 - 3` is 3 because equal-precedence operators run left to right: (10 - 4) - 3.",
            "`100 / 10 * 2` — also left to right: (100 / 10) is 10.0, times 2 is 20.0. Note it is a float because / spoke first.",
            "`2 ** 3 ** 2` is 512, not 64: `**` is the one operator that goes RIGHT to left — it computed 3 ** 2 = 9 first, then 2 ** 9. When in doubt, add parentheses; readers thank you.",
          ],
        },
        {
          kind: "heading",
          text: "Floating-point honesty, continued",
        },
        {
          kind: "code",
          title: "Precision, rounding, and the .5 rule",
          code: `print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
print(round(2.5))
print(round(3.5))
`,
          output: `0.30000000000000004
0.3
2
4`,
          explain: [
            "Line 1 is lesson a-06's old friend: binary floating-point cannot store 0.1 exactly, so the sum lands a hair off. Every language built on this hardware standard does the same.",
            "`round(x, 2)` rounds to two decimal places and cleans the microscopic error away for comparison: 0.3.",
            "The last two lines are the surprise you met in exercise a-b4: Python rounds .5 to the nearest **even** number. `round(2.5)` is 2, `round(3.5)` is 4 — this is banker's rounding, and it is deliberate: over thousands of roundings it cancels out the bias.",
          ],
        },
        {
          kind: "visual",
          title: "Which type comes out of the mix?",
          ascii: `  OPERANDS          OPERATOR         RESULT TYPE

  int   op int   ->  +  -  *  //  %  ->  int     (exact)
  int   op int   ->  /                ->  float  (always!)
  float op any   ->  anything         ->  float  (precision wins)

  rule of thumb: once a float enters the room, the result is a float.
`,
          caption:
            "One float anywhere in the arithmetic drags the result to float — 'precision contaminates'. Ints stay exact only among themselves (except /).",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "round() changes the value; formatting changes only the display",
          text: "`round(7.2345, 2)` produces a new number, 7.23, that your calculations can keep using. The f-string spec `f\"{price:.2f}\"` (next lesson) paints the number with two decimals for display without touching the stored value. Professionals round data at the end, format at the very last moment, and never test floats with ==.",
        },
        {
          kind: "tryIt",
          title: "Try it — predict every line, then run",
          task: "Write your predictions on paper first: all six lines, results AND types. Then run and score yourself. Any miss, re-read the explain above for that operator before moving on.",
          code: `print(17 / 5)
print(17 // 5)
print(17 % 5)
print(2 ** 3)
print(3 * 2 + 1)
print(100 / 5)
`,
          hint: "Watch the last two: 3 * 2 + 1 is 7 (multiplication first), and 100 / 5 is 20.0 — the dot is not a typo, it is / keeping its promise.",
        },
      ],
      terms: [
        { term: "Integer division (//)", definition: "Division that keeps only the whole-number part: 7 // 2 is 3. With ints the result is an int." },
        { term: "Modulus (%)", definition: "The remainder after division: 10 % 3 is 1. Used for evenness tests, packaging counts, and cycling." },
        { term: "Operator precedence", definition: "The fixed order in which operators run: parentheses, then **, then * / // %, then + and -. Equal levels run left to right (except **)." },
        { term: "Banker's rounding", definition: "Python's round() rounds .5 to the nearest even number: round(2.5) is 2, round(3.5) is 4 — chosen so rounding errors cancel out over many operations." },
        { term: "Overflow", definition: "What happens in most languages when a number exceeds its fixed storage size. Python ints never overflow — they just grow." },
      ],
      mistakes: [
        {
          mistake: "Expecting 10 / 2 to give the int 5.",
          why: "The / operator always produces a float — even when the division is exact. The result is 5.0, a different type with a different feel.",
          fix: "Want the whole number? Use // for integer division, or int() around the result. But often the honest answer IS 5.0 — let floats be floats.",
        },
        {
          mistake: "Assuming // chops off decimals the same way for negative numbers.",
          why: "// floors — it moves DOWN the number line: 7 // 2 is 3, but -7 // 2 is -4, not -3. The remainder adjusts to match.",
          fix: "Remember the phrase 'floors toward minus infinity'. When negatives are involved, sanity-check with a quick run before trusting the result.",
        },
        {
          mistake: "Assuming .5 always rounds up, because that is what school taught.",
          why: "Python uses banker's rounding: halves go to the nearest EVEN number, so round(2.5) is 2 and round(3.5) is 4.",
          fix: "For money-style display, format with f\"{x:.2f}\" instead of rounding by hand — and never build logic that depends on which way a .5 goes.",
        },
        {
          mistake: "Comparing float results with == after arithmetic.",
          why: "0.1 + 0.2 == 0.3 is False — the lesson a-06 surprise. Tiny binary errors make exact equality a lottery.",
          fix: "Compare rounded values (round(a, 10) == round(b, 10)) or check that the difference is tiny — never raw == on computed floats.",
        },
      ],
      takeaways: [
        "/ always returns a float, even for 10 / 2. The .0 is a type statement, not a typo.",
        "// and % form a pair: full boxes and leftovers — 26 // 4 = 6 boxes, 26 % 4 = 2 left over.",
        "Precedence: parentheses, then **, then * / // %, then + -. Equal levels go left to right — except **, which goes right to left.",
        "Python ints never overflow; floats trade microscopic precision for speed — never compare them with ==.",
        "round() rounds .5 to the nearest even number (banker's rounding): round(2.5) is 2, round(3.5) is 4.",
      ],
      quiz: [
        {
          id: "b-03-q1",
          prompt: "What does 17 // 5 evaluate to?",
          options: [
            { text: "3.4", correct: false, feedback: "That is 17 / 5 — true division. // keeps only the whole part." },
            { text: "3", correct: true, feedback: "Correct: 17 // 2 divides and floors — 3 whole units, remainder dropped (that is what 17 % 5 = 2 is for)." },
            { text: "3.0", correct: false, feedback: "Close on value, wrong on type: // on two ints produces an int — no decimal point." },
          ],
          explanation: "// is integer division: whole part only, int type when both operands are ints.",
        },
        {
          id: "b-03-q2",
          prompt: "A program checks 22 % 7. What is the result — and what does it mean?",
          options: [
            { text: "3, because 22 - (7 * 3) = 1... no wait", correct: false, feedback: "Check the arithmetic: 7 * 3 is 21, and 22 - 21 is 1, not 3." },
            { text: "1 — the remainder after fitting three 7s into 22", correct: true, feedback: "Exactly: 22 = 7 * 3 + 1, so the remainder is 1." },
            { text: "0, because 22 divides evenly by 7", correct: false, feedback: "22 / 7 is about 3.14 — nothing even about it." },
          ],
          explanation: "% answers 'how many are left over' — 22 holds three 7s with 1 left over.",
        },
        {
          id: "b-03-q3",
          prompt: "What does round(2.5) return?",
          options: [
            { text: "3 — halves round up, as in school", correct: false, feedback: "School rounds halves up; Python deliberately does not." },
            { text: "2 — halves round to the nearest even number", correct: true, feedback: "Right: banker's rounding. round(3.5) is 4, round(2.5) is 2 — even neighbors win." },
            { text: "2.5 — round() without a second argument does nothing", correct: false, feedback: "round(x) rounds to the nearest whole number; round(x, n) rounds to n decimals." },
          ],
          explanation: "Banker's rounding sends .5 to the nearest even value — it halves the long-run bias of always rounding up.",
        },
      ],
    },

    // ------------------------------------------------------------- b-04
    {
      slug: "b-04",
      title: "Strings",
      minutes: 17,
      summary:
        "Text in all its forms: quoting and escaping, gluing and repeating, indexing characters, the six everyday string methods, and f-string format specs that pad and align your output.",
      kind: "coding",
      objectives: [
        "Write strings with either quote style and escape special characters correctly",
        "Combine strings with + and * and measure them with len()",
        "Index any character with positive and negative positions and avoid off-by-one errors",
        "Apply the everyday methods (strip, upper, lower, replace, split, join) and explain why the original string never changes",
        "Format values inside f-strings with :.2f and alignment specs",
      ],
      why: "Almost every program eventually touches text: names, addresses, messages, and data arriving from users and files — most of it messy. Strings also have the richest everyday toolkit of any type: half of real-world data work is turning messy text into clean text. And formatted output is the difference between 7234.5 and $7,234.50 — the same value, but only one looks finished. This lesson gives you the complete string toolkit you will use in every remaining part of this course.",
      blocks: [
        {
          kind: "text",
          text: "You have been writing strings since lesson a-07 — anything between quotes is a **string**, Python's text type. Strings deserve a full lesson for two reasons: they are the most common type in real programs, and they are the type with the most *skills*. By the end of this lesson you will clean, reshape, dissect, and format text like a professional.",
        },
        {
          kind: "heading",
          text: "Two kinds of quotes — and how to escape inside them",
        },
        {
          kind: "code",
          title: "Quotes, and the characters that are hard to type",
          code: `print("She said: 'Python is fun'")
print('He said: "Same here"')
print("Line one\\nLine two")
print("A backslash: \\\\")
print("Mixing both: \\"inner\\" quotes")
`,
          output: `She said: 'Python is fun'
He said: "Same here"
Line one
Line two
A backslash: \\
Mixing both: "inner" quotes`,
          explain: [
            "Double and single quotes make identical strings — pick one as your default and switch when the text contains the other kind.",
            "When you MUST put a quote of the same kind inside itself, escape it with a backslash: `\\\"` prints a plain double quote.",
            "`\\n` is the newline escape — one string, two lines. `\\\\` prints a single backslash (backslash is the escape character, so it must escape itself). The everyday set: `\\n` newline, `\\t` tab, `\\\\` backslash, plus escaped quotes.",
          ],
        },
        {
          kind: "heading",
          text: "Gluing and repeating",
        },
        {
          kind: "code",
          title: "+ and *, string edition",
          code: `first = "Data"
second = "Verse"
full = first + second
print(full)
print("ha" * 3)
print(len(full))
`,
          output: `DataVerse
hahaha
9`,
          explain: [
            "`+` concatenates — glues strings in order (lesson a-07's rule stands: both sides must be strings).",
            "`*` repeats: \"ha\" * 3 is hahaha. This is the string personality of * you saw in lesson b-02.",
            "`len()` counts the characters — including spaces, punctuation, everything. DataVerse is 9 characters long.",
          ],
        },
        {
          kind: "heading",
          text: "Indexing: every character has a number",
        },
        {
          kind: "visual",
          title: "The two rulers of a string",
          ascii: `  the string:    P   y   t   h   o   n
                 ^   ^   ^   ^   ^   ^
  counting from  0   1   2   3   4   5   (the left ruler)
  the start...
  ...or the end: -6  -5  -4  -3  -2  -1  (the right ruler)

  "Python"[0] is 'P'      "Python"[5] is 'n'
  "Python"[-1] is 'n'     "Python"[-6] is 'P'
`,
          caption:
            "Two rulers, same string. Positive indexes count from the start at 0; negative indexes count from the end at -1. len(\"Python\") is 6 — but the last index is 5, because counting starts at 0.",
        },
        {
          kind: "code",
          title: "Reaching inside a string",
          code: `language = "Python"
print(language[0])
print(language[5])
print(language[-1])
print(language[-6])
`,
          output: `P
n
n
P`,
          explain: [
            "Square brackets after a string grab ONE character by position. Position numbers start at **0**, not 1 — a convention shared by nearly every language, and the source of half of all beginner bugs.",
            "Negative indexes count from the end: -1 is always the last character, -2 the second-to-last. `language[-1]` is the daily shortcut every Python programmer uses.",
          ],
        },
        {
          kind: "code",
          title: "The off-by-one crash, met honestly",
          expectError: "IndexError: string index out of range",
          code: `language = "Python"
print(language[10])
`,
          explain: [
            "len(\"Python\") is 6, so legal positions are 0 to 5 — and -1 down to -6 from the other side. Asking for index 10 steps past the end: IndexError.",
            "This is the classic **off-by-one** error. If a string has n characters, its last index is n - 1. When you see IndexError, check your ends: did you use len(s) where you meant len(s) - 1?",
          ],
        },
        {
          kind: "heading",
          text: "Strings never change in place",
        },
        {
          kind: "code",
          title: "Trying to edit a string directly — refused",
          expectError: "TypeError: 'str' object does not support item assignment",
          code: `language = "Python"
language[0] = "J"
`,
          explain: [
            "Strings are **immutable**: once created, a string cannot be edited character-by-character. Assignment into an index is not allowed, ever.",
            "The fix is to build a NEW string from pieces: `print(\"J\" + language[1:])` gives Jython — the `[1:]` means 'from index 1 to the end' (a preview of slicing, which gets its full treatment in Part E).",
            "Why this rule exists: it lets Python share and cache strings safely. You will see the same design idea again with tuples later in the course.",
          ],
        },
        {
          kind: "heading",
          text: "The method toolbox",
        },
        {
          kind: "code",
          title: "The six everyday string methods",
          code: `name = "  Ada Lovelace  "

clean = name.strip()
print(clean)
print(clean.upper())
print(clean.lower())
print(clean.replace("Ada", "Grace"))
print(clean.split(" "))
print("-".join(["data", "verse"]))
print(len(name), "characters before cleaning")
`,
          output: `Ada Lovelace
ADA LOVELACE
ada lovelace
Grace Lovelace
['Ada', 'Lovelace']
data-verse
16 characters before cleaning`,
          explain: [
            "A **method** is a skill attached to a value, written `value.method()` — strings come with dozens; these six do almost all of everyday work, and every one returns a NEW string.",
            "`strip()` returns a NEW string with surrounding whitespace removed — the first tool you reach for when data arrives messy.",
            "`upper()` / `lower()` return new strings in one case — the standard way to compare text without case getting in the way.",
            "`replace(old, new)` returns a copy with every occurrence swapped.",
            "`split(\" \")` cuts a string into pieces at each space and hands you a **list** of the pieces — lists get their full story in Part E. `join()` is its mirror: it glues a list of strings, inserting the separator between them.",
            "The proof of immutability is in the last line: `name` itself still has all 16 characters — including its two leading and two trailing spaces. Methods never edited it; they returned fresh strings.",
          ],
        },
        {
          kind: "heading",
          text: "f-strings, level two: the colon and format specs",
        },
        {
          kind: "code",
          title: "The format specs you will use forever",
          code: `price = 4.5
big_number = 1234567.891
name = "Ada"

print(f"Price: \${price:.2f}")
print(f"[{name:>10}]")
print(f"[{name:<10}]")
print(f"[{name:^10}]")
print(f"{big_number:,.2f}")
`,
          output: `Price: $4.50
[       Ada]
[Ada       ]
[   Ada    ]
1,234,567.89`,
          explain: [
            "In lesson a-07 you dropped values into f-strings with `{value}`. The second act: after the value, a colon and a **format spec** controls how it is painted — decimal places, alignment, padding, thousands separators (you already used these in exercise a-a1; now they are official).",
            "`.2f` — fixed decimal places: 4.5 paints as 4.50. This is how prices, averages, and percentages look finished.",
            "`>10`, `<10`, `^10` — right, left, and center alignment inside a 10-character field. The brackets in the text make the padding visible.",
            "`,.2f` — thousands separator plus two decimals: 1,234,567.89. Combine specs freely; the full formatting manual is one `help(format)` away.",
            "Remember the pairing from lesson b-03: format specs change only the *display* — the stored value keeps its full precision.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — clean the messy string",
          task: "This program cleans and reshapes a messy title. Before running, predict all four output lines. Then change the messy text to your own sentence, and add one line that prints it centered in 30 characters: print(f\"[{clean:^30}]\").",
          code: `messy = "  PyThOn Is AwEsOmE  "

clean = messy.strip().lower()
print(clean)
print(clean.replace(" ", "_"))
print(len(clean), "characters")
print(clean[0], "...", clean[-1])
`,
          hint: "strip() removes the outer spaces, lower() downcases — then: count the letters and spaces carefully for len(), and remember indexes start at 0 while -1 is the last character.",
        },
      ],
      terms: [
        { term: "Escape sequence", definition: "A backslash pair inside a string that stands for a hard-to-type character: \\n for newline, \\t for tab, \\\\ for a literal backslash." },
        { term: "Index", definition: "The position number of a character in a string, starting at 0 from the left, or -1 from the right." },
        { term: "Immutable", definition: "Unable to be changed after creation. Strings are immutable — every 'editing' method returns a new string instead." },
        { term: "Method", definition: "A skill attached to a value, called with a dot: value.method(). \"  hi  \".strip() returns a cleaned copy." },
        { term: "Format spec", definition: "The part after the colon inside an f-string placeholder — :.2f, :>10 — controlling decimals, alignment, and padding." },
      ],
      mistakes: [
        {
          mistake: "Calling a method and expecting the original to change: word.upper() then printing word.",
          why: "Strings are immutable — methods return NEW strings and the original is untouched, silently.",
          fix: "Capture the result: word = word.upper(), or use it directly: print(word.upper()).",
        },
        {
          mistake: "Using len(s) as the last index.",
          why: "If a string has 6 characters, positions run 0 to 5 — s[6] is one past the end and raises IndexError.",
          fix: "The last character is s[-1] or s[len(s) - 1]. When you see IndexError, suspect an off-by-one immediately.",
        },
        {
          mistake: "Nesting the same quote inside itself: print(\"He said: \"oops\"\").",
          why: "The second quote CLOSES the string; the rest of the line becomes broken grammar.",
          fix: "Switch outer quotes ('He said: \"oops\"') or escape: \"He said: \\\"oops\\\"\". One consistent style plus escaping covers everything.",
        },
        {
          mistake: "Calling len() on a number: len(42).",
          why: "len() counts characters or items — a number has none, so Python raises TypeError: object of type 'int' has no len().",
          fix: "If you need the number of digits, convert first: len(str(42)) is 2.",
        },
      ],
      takeaways: [
        "Strings are text between quotes — either kind; escape special characters with \\n, \\t, \\\\, and escaped quotes.",
        "+ glues strings, * repeats them, len() counts every character, and indexing starts at 0 (with -1 as a shortcut to the last).",
        "Strings are immutable: methods like strip(), upper(), replace() return NEW strings and never edit the original.",
        "The everyday six: strip, upper, lower, replace, split, join — cleaning and reshaping text is half of real data work.",
        "Format specs in f-strings paint values for display: :.2f for decimals, > < ^ for alignment, , for thousands — display only, value unchanged.",
      ],
      quiz: [
        {
          id: "b-04-q1",
          prompt: "What does \"Python\"[0] evaluate to?",
          options: [
            { text: "'y'", correct: false, feedback: "Indexing starts at 0 — index 1 would be y." },
            { text: "'P'", correct: true, feedback: "Correct — position 0 is the first character. The count starts at zero, always." },
            { text: "An IndexError", correct: false, feedback: "0 is perfectly legal — 0 through 5 all are, for a six-character string." },
          ],
          explanation: "String positions start at 0: 'Python'[0] is 'P', and 'Python'[5] is 'n'.",
        },
        {
          id: "b-04-q2",
          prompt: "word = \"hi\", then word.upper(), then print(word). What prints?",
          options: [
            { text: "HI", correct: false, feedback: "That would require capturing the result — upper() returned a new string and threw it away." },
            { text: "hi", correct: true, feedback: "Exactly — strings are immutable: the method returned 'HI', but nothing stored it, so word is untouched." },
            { text: "An error — upper() cannot be called without assigning", correct: false, feedback: "Calling it is legal; ignoring the returned copy is the (silent) waste." },
          ],
          explanation: "Methods return new strings; the original never changes. Write word = word.upper() to keep the result.",
        },
        {
          id: "b-04-q3",
          prompt: "What does f\"{9:.2f}\" evaluate to?",
          options: [
            { text: "9", correct: false, feedback: "No decimals shown — but .2f demands exactly two." },
            { text: "9.00", correct: true, feedback: "Right — .2f paints the value with exactly two decimal places: 9.00." },
            { text: "9.0", correct: false, feedback: "Close, but .2f is exact about the count: two digits after the dot, always." },
          ],
          explanation: ":.2f formats for display with two decimals — the stored value is unchanged (formatting is paint, not math).",
        },
      ],
    },

    // ------------------------------------------------------------- b-05
    {
      slug: "b-05",
      title: "Booleans",
      minutes: 14,
      summary:
        "True and False: the two values every decision is built from. Comparison operators, the bool() truth test, which values count as false, and combining answers with and, or, not.",
      kind: "concept",
      objectives: [
        "Write the six comparison operators and predict each result",
        "Explain what bool() does and use it to test any value's truthiness",
        "List the five falsy values and explain why everything else is truthy",
        "Combine booleans with and, or, and not",
      ],
      why: "Every interesting program makes decisions: is the user logged in, is the cart empty, is the temperature above freezing, did this login attempt fail? All of those answers are booleans — and in Part C, if-statements will run your code based on them. But booleans arrive with traps of their own: Python quietly treats some surprising values (like the string \"0\") as true, and beginners constantly confuse the assignment = with the comparison ==. Getting the True/False model exact now makes every conditional in the rest of this course feel obvious instead of magical.",
      blocks: [
        {
          kind: "text",
          text: "You met the fourth core type in lesson b-02 without fanfare: **bool**, the type with exactly two values, `True` and `False` (always capitalized). Booleans answer yes/no questions, and they are the raw material of every decision a program will ever make. You even saw one being born in lesson a-06: `0.1 + 0.2 == 0.3` produced `False`.",
        },
        {
          kind: "heading",
          text: "Comparisons: where booleans come from",
        },
        {
          kind: "code",
          title: "The comparison operators at work",
          code: `print(10 > 3)
print(10 < 3)
print(5 == 5)
print(5 != 4)
print("Ada" == "Ada")
print("ada" == "Ada")
`,
          output: `True
False
True
True
True
False`,
          explain: [
            "Every comparison is an **expression** that evaluates to True or False — the value 10 > 3 literally *is* True.",
            "`==` asks 'are these equal?' (two signs — lesson b-01's warning: one `=` assigns, two `==` compare). `!=` asks 'are these different?'",
            "Strings compare by exact characters: \"ada\" and \"Ada\" are different strings, because a is not A. This is why cleaning with `.lower()` before comparing is a standard habit (lesson b-04).",
          ],
        },
        {
          kind: "table",
          title: "The six comparisons",
          headers: ["Operator", "Question it asks", "Example", "Result"],
          rows: [
            ["==", "Equal to?", "5 == 5", "True"],
            ["!=", "Different from?", "5 != 4", "True"],
            [">", "Greater than?", "3 > 10", "False"],
            ["<", "Less than?", "10 < 3", "False"],
            [">=", "Greater than or equal to?", "7 >= 7", "True"],
            ["<=", "Less than or equal to?", "7 <= 7", "True"],
          ],
          caption:
            "Numbers compare by size; strings compare character by character. Note >= and <= are each ONE operator — a greater-than and an equals sharing a sign.",
        },
        {
          kind: "heading",
          text: "bool(): the truth test every value can take",
        },
        {
          kind: "text",
          text: "Here is the part that surprises people: `bool()` can test ANY value, not just comparisons — because Python has a rule for deciding whether any value 'feels empty'. A value that feels empty is **falsy**; everything else is **truthy**:",
        },
        {
          kind: "code",
          title: "Truthiness on trial",
          code: `print(bool(0))
print(bool(42))
print(bool(""))
print(bool("hello"))
print(bool("0"))
print(bool(None))
print(bool(0.0))
`,
          output: `False
True
False
True
True
False
False`,
          explain: [
            "`0` is falsy; `42` is truthy. `\"\"` (the empty string) is falsy; any text with characters is truthy.",
            "The trap is on line five: `bool(\"0\")` is **True** — it is a string with one character, and characters are content. Truthiness asks 'is there something here?', not 'is this zero?'",
            "`None` is Python's 'nothing yet' value — a placeholder for a value that does not exist. It is always falsy, and you will use it constantly in later parts.",
          ],
        },
        {
          kind: "table",
          title: "The complete falsy list — everything else is truthy",
          headers: ["Falsy value", "Why"],
          rows: [
            ["False", "The false boolean itself"],
            ["0 and 0.0", "Zero in either number type"],
            ["\"\" (empty string)", "No characters at all"],
            ["[] (empty list)", "No items (lists arrive in Part E)"],
            ["None", "The 'no value' value"],
          ],
          caption:
            "This list is short ON PURPOSE — memorize it and you can predict truthiness of anything: if it is not on the list, it is True.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Why you will care, next part",
          text: "In Part C, `if` statements run code when a condition is truthy. Truthiness is why a program can write `if cart:` and mean 'if the cart has something in it'. You are learning the vocabulary those sentences will be built from.",
        },
        {
          kind: "heading",
          text: "Combining answers: and, or, not",
        },
        {
          kind: "text",
          text: "Real conditions are rarely single questions — 'age is at least 18 AND under 65'. The three **logical operators** combine booleans: `and` is true when both sides are true, `or` is true when at least one side is, and `not` flips a boolean:",
        },
        {
          kind: "code",
          title: "The logic of eligibility",
          code: `age = 24
print(age >= 18 and age < 65)
print(age < 18 or age > 65)
print(not (age == 24))
`,
          output: `True
False
False`,
          explain: [
            "`age >= 18 and age < 65` — two comparisons, two booleans, combined: True and True is True.",
            "`age < 18 or age > 65` — False or False is False: age fails BOTH sides, and or needs at least one true.",
            "`not` flips: the comparison inside was True, so not True is False. Read it as English: 'it is not the case that age equals 24'.",
          ],
        },
        {
          kind: "visual",
          title: "The and/or table — all four cases",
          ascii: `    A       B      A and B    A or B     not A
  -----   -----   --------   -------   --------
  True    True     True       True      False
  True    False    False      True
  False   True     False      True      True
  False   False    False      False

  and: picky (both must be true)     or: generous (one is enough)
`,
          caption:
            "All of boolean logic in one picture. and needs two yeses; or needs one yes; not turns yes into no.",
        },
        {
          kind: "tryIt",
          title: "Try it — the truthiness predictor",
          task: "Predict all six lines on paper BEFORE running — write True or False for each. Score yourself: six out of six means you own the falsy list. Then add print(bool(\" \")) — a string with one space — and predict that too.",
          code: `print(bool(100))
print(bool(0))
print(bool("0"))
print(bool(""))
print(bool("False"))
print(bool(0.5))
`,
          hint: "Walk the falsy list: 0 is on it; \"0\" is NOT (it has a character); \"False\" is a string with letters, not the boolean; 0.5 is not zero.",
        },
      ],
      terms: [
        { term: "Boolean (bool)", definition: "The type with exactly two values: True and False. Every comparison produces one." },
        { term: "Comparison operator", definition: "One of == != > < >= <= — operators that ask a question and evaluate to True or False." },
        { term: "Truthiness", definition: "Every value's answer to 'would you count as true?'. bool(value) asks it directly." },
        { term: "Falsy", definition: "One of the five values that count as false: False, 0, 0.0, \"\", [], None. Everything else is truthy." },
        { term: "Logical operator", definition: "and, or, not — the three operators that combine or flip booleans." },
      ],
      mistakes: [
        {
          mistake: "Writing booleans in lowercase: true and false.",
          why: "Python is case-sensitive (lesson b-01): true is just an undefined name, so it raises NameError.",
          fix: "Capitalize both: True and False. Always. Your editor's coloring is the giveaway — real booleans get keyword colors.",
        },
        {
          mistake: "Using = to compare inside a condition: if temperature = 30.",
          why: "Single = is assignment (it stores a value); == is the comparison. Using = where a condition is expected is a syntax error in Python — a rare case of the language protecting you.",
          fix: "Read == as 'is equal to' and = as 'gets'. Every 'if x = 5' you ever write should have been 'if x == 5'.",
        },
        {
          mistake: "Assuming anything that looks like zero is falsy — especially \"0\" and \"False\".",
          why: "Truthiness asks 'does this value contain something?'. The strings \"0\" and \"False\" each contain characters, so they are truthy.",
          fix: "The falsy list has exactly five members: False, 0, 0.0, \"\", [], None. If a value is not one of those exact five, it is True.",
        },
      ],
      takeaways: [
        "Booleans are the yes/no type: True and False, always capitalized, always one of the two.",
        "Comparisons (== != > < >= <=) are expressions that evaluate to True or False.",
        "One = stores; two == compare. Mixing them up is the classic beginner slip.",
        "Five falsy values: False, 0, 0.0, \"\", [], None. Everything else — including \"0\" and \"False\" — is truthy.",
        "and needs both, or needs one, not flips: the complete logic of every condition you will ever write.",
      ],
      quiz: [
        {
          id: "b-05-q1",
          prompt: "What does \"ada\" == \"Ada\" evaluate to?",
          options: [
            { text: "True — Python forgives case differences", correct: false, feedback: "Python forgives nothing about case: a and A are different characters." },
            { text: "False", correct: true, feedback: "Correct — string comparison is character-exact, so \"ada\" and \"Ada\" differ. Use .lower() on both sides when case should not matter." },
            { text: "An error — strings cannot be compared", correct: false, feedback: "Strings compare just fine — letter by letter, position by position." },
          ],
          explanation: "Comparison is exact. Case-insensitive comparison is your job: first.lower() == second.lower().",
        },
        {
          id: "b-05-q2",
          prompt: "Which value is FALSY?",
          options: [
            { text: "\"0\"", correct: false, feedback: "Tempting! But it is a one-character string — it contains something, so it is truthy." },
            { text: "\"\"", correct: true, feedback: "Right — the empty string has zero characters: nothing in it, falsy." },
            { text: "\"False\"", correct: false, feedback: "It may spell False, but as a string it is five characters of content: truthy." },
            { text: "\" \" (one space)", correct: false, feedback: "A space is a character too — the string is not empty, so it is truthy." },
          ],
          explanation: "Only five values are falsy: False, 0, 0.0, \"\", [], None. Strings with ANY characters are truthy.",
        },
        {
          id: "b-05-q3",
          prompt: "age is 24. What does age >= 18 and age < 65 evaluate to?",
          options: [
            { text: "True", correct: true, feedback: "Correct: both comparisons are True (24 >= 18 and 24 < 65), and and wants both." },
            { text: "False", correct: false, feedback: "Trace each side: left is True, right is True — and only says no when at least one side is False." },
            { text: "An error — and cannot combine two comparisons", correct: false, feedback: "Combining comparisons is exactly what and is for. This is a completely normal Python expression." },
          ],
          explanation: "and evaluates both sides and answers True only when both are True — here, both are.",
        },
      ],
    },

    // ------------------------------------------------------------- b-06
    {
      slug: "b-06",
      title: "Type Conversion",
      minutes: 15,
      summary:
        "Turning one type into another with int(), float(), str(), and bool() — when conversions work, when they crash with ValueError, and the one conversion Python does silently.",
      kind: "coding",
      objectives: [
        "Convert values explicitly with int(), float(), str(), and bool()",
        "Explain why int(3.99) is 3 — truncation, not rounding — and choose round() when rounding is meant",
        "Recognize the ValueError crash and repair it by converting in two steps",
        "Describe Python's one implicit conversion (numbers promote) and why text never auto-converts",
      ],
      why: "Real data arrives in the wrong type constantly: forms and files hand you numbers as text, prices need to join messages, ages need to become strings for display. Conversion is the bridge — and it has rules with teeth: int(\"abc\") crashes with a ValueError you will learn to read, and int(3.99) surprises every single newcomer by chopping instead of rounding. Mastering conversion now prepares you for lesson b-07, where input() hands you EVERYTHING as text whether you like it or not.",
      blocks: [
        {
          kind: "text",
          text: "Lesson b-02 ended with a promise: Python will not guess types for you. If data arrives as text and you need a number — or a number needs to join a sentence — YOU convert it, explicitly, with one of four built-in converters. This lesson makes you fluent in all four, including exactly when and how they refuse.",
        },
        {
          kind: "heading",
          text: "The four converters",
        },
        {
          kind: "code",
          title: "int(), float(), str(), bool() in action",
          code: `print(int("42"))
print(float("3.5"))
print(str(99))
print(bool(""))
print(int(True), int(False))
`,
          output: `42
3.5
99
False
1 0`,
          explain: [
            "`int(\"42\")` — text that looks like a whole number becomes the number 42. The quotes are gone; `int(\"42\") + 8` would now be 50, not \"428\".",
            "`float(\"3.5\")` — text of a decimal becomes a real float. `str(99)` — any value at all becomes its text form.",
            "`bool(\"\")` applies lesson b-05's truthiness: empty string, so False.",
            "The last line reveals a secret: `int(True)` is 1 and `int(False)` is 0. Booleans are secretly a kind of integer — you used that in exercise a-a4 to count passes with addition.",
          ],
        },
        {
          kind: "table",
          title: "What each converter accepts",
          headers: ["Converter", "Accepts", "Result", "Example"],
          rows: [
            ["int()", "Whole-number text, floats, bools", "An integer", "int(\"42\") is 42; int(3.9) is 3"],
            ["float()", "Number text (with or without a dot), ints", "A float", "float(\"3.5\") is 3.5; float(7) is 7.0"],
            ["str()", "Absolutely anything", "Its text form", "str(99) is \"99\"; str(True) is \"True\""],
            ["bool()", "Absolutely anything", "True or False by truthiness", "bool(\"hello\") is True"],
          ],
          caption:
            "str() and bool() never fail — they have something sensible to say about anything. int() and float() have standards, and they crash when the input does not meet them. That crash is next.",
        },
        {
          kind: "heading",
          text: "int(3.99): truncation, not rounding",
        },
        {
          kind: "code",
          title: "The conversion that surprises everyone",
          code: `print(int(3.99))
print(int(-3.99))
print(round(3.99))
print(int(3.1))
`,
          output: `3
-3
4
3`,
          explain: [
            "`int(3.99)` is 3 — not 4! Converting a float to int **truncates**: it throws away the decimal part, it does not round.",
            "`int(-3.99)` is -3: truncation moves toward zero, unlike `//` which floors downward (lesson b-03 — `//` and int() disagree about negatives).",
            "`round(3.99)` is 4: when you mean rounding, say round(). When you mean 'chop the decimals off', int() is the honest tool.",
          ],
        },
        {
          kind: "heading",
          text: "When conversions refuse: ValueError",
        },
        {
          kind: "code",
          title: "Text that is not a number — refused",
          expectError: "ValueError: invalid literal for int() with base 10: 'abc'",
          code: `users = int("abc")
`,
          explain: [
            "`int()` can turn \"42\" into 42 because those characters ARE a number. \"abc\" is not a number, so there is nothing sensible to produce — Python stops with a ValueError and tells you exactly which text it choked on: 'abc'.",
            "You will meet this error the day after this lesson: it is exactly what happens when a program asks a user for their age and receives a typed word, or when a data file has a typo in a numeric column.",
          ],
        },
        {
          kind: "code",
          title: "The sneakier failure: text of a decimal",
          expectError: "ValueError: invalid literal for int() with base 10: '3.5'",
          code: `print(int("3.5"))
`,
          explain: [
            "Even though 3.5 IS a number, `int()` only accepts text shaped like a whole number — the dot makes it unreadable to int().",
            "The fix is two steps, and it always works: go through float first. `int(float(\"3.5\"))` is 3 — float() reads the decimal, then int() truncates it.",
          ],
        },
        {
          kind: "code",
          title: "The mixed-type crash, revisited with the fix",
          expectError: "TypeError: can only concatenate str (not \"int\") to str",
          code: `print("3" + 3)
`,
          explain: [
            "Lesson a-07's classic, now with the full vocabulary: text plus number is a TypeError because Python refuses to guess which of the two you meant — gluing (str) or adding (int).",
            "The fix is not to memorize a rule but to DECIDE what you meant. The next block shows both honest answers.",
          ],
        },
        {
          kind: "code",
          title: "Both fixes, depending on your intent",
          code: `print("3" + str(3))
print(int("3") + 3)
print(float("3") + 3)
`,
          output: `33
6
6.0`,
          explain: [
            "Wanted text? Convert the number: `\"3\" + str(3)` glues into \"33\". Use this when building a message.",
            "Wanted math? Convert the text: `int(\"3\") + 3` is 6. Use this when the digits are meant as numbers.",
            "`float(\"3\") + 3` is 6.0 — float promotes the addition (the implicit rule, two blocks down). Same intent, floatier result.",
            "The professional question before any conversion: *what is this value FOR?* The answer picks the converter for you.",
          ],
        },
        {
          kind: "heading",
          text: "Implicit conversion: the one Python does for you",
        },
        {
          kind: "code",
          title: "Numbers promote silently — text never does",
          code: `print(42 + 0.5)
print(type(42 + 0.5))
print(1 + True)
`,
          output: `42.5
<class 'float'>
2`,
          explain: [
            "`42 + 0.5` is 42.5: an int met a float, and Python quietly promoted the int to float — lesson b-03's rule 'once a float enters the room', now with its mechanism named. This promotion is safe: no information is lost.",
            "`1 + True` is 2: booleans are really ints (True is 1, False is 0), so they join arithmetic seamlessly.",
            "Text is never promoted. `\"3\" + 3` crashed two blocks ago because converting text to a number would GUESS your intent — and between 'glue' and 'add', guessing is how silent wrong answers are born. Python makes you say which one you mean.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The two-rule summary",
          text: "Rule 1: numbers convert among themselves automatically (int promotes to float, bools count as ints). Rule 2: everything involving text requires an explicit conversion — by you, with int(), float(), or str(), based on what the value is FOR. Those two rules explain every conversion surprise Python will ever show you.",
        },
        {
          kind: "tryIt",
          title: "Try it — conversion predictor",
          task: "Predict all five lines on paper first — the exact printed text, including whether it looks like a number or text. Then run and check. For each one you missed, name the rule that explains it.",
          code: `print(int("27") + 3)
print(str(27) + "3")
print(float("2.5") + 0.5)
print(int(9.99))
print(bool("hello"))
`,
          hint: "Line 1: int() then math = 30. Line 2: str() then gluing = \"273\". Line 4 truncates, it does not round. Line 5: truthiness of a non-empty string.",
        },
      ],
      terms: [
        { term: "Type conversion (casting)", definition: "Turning a value of one type into another: int(\"42\"), str(99), bool(\"\"). Called explicitly by you in Python whenever text is involved." },
        { term: "Truncation", definition: "Throwing away the decimal part of a float. int(3.99) is 3 — truncation moves toward zero and never rounds." },
        { term: "ValueError", definition: "The error raised when a conversion cannot make sense of its input: int(\"abc\") has nothing numeric to produce." },
        { term: "Implicit conversion", definition: "A conversion Python does by itself — numbers promoting: int + float becomes float, and True counts as 1." },
        { term: "Explicit conversion", definition: "A conversion you request with int(), float(), str(), or bool(). Required whenever text meets numbers: Python will not guess for you." },
      ],
      mistakes: [
        {
          mistake: "Expecting int() to round: writing int(3.99) and being handed 3.",
          why: "int() truncates — it discards everything after the decimal point without looking at it. It never rounds, not even .99.",
          fix: "Mean rounding? Use round(3.99) — it gives 4. Mean chopping? int() is correct. The two functions answer different questions.",
        },
        {
          mistake: "Converting decimal text straight to int: int(\"3.5\") — ValueError.",
          why: "int() only reads text shaped like a whole number; the dot disqualifies it, even though 3.5 is a perfectly good number.",
          fix: "Two steps: int(float(\"3.5\")) — float() reads the decimal, then int() truncates. This pair handles any numeric text.",
        },
        {
          mistake: "Converting to the type you did not mean: fixing print(\"3\" + 3) as print(\"3\" + str(3)) when the goal was addition.",
          why: "The crash vanishes — and the answer becomes \"33\" instead of 6. A fixed crash with a wrong result is a silent bug.",
          fix: "Ask 'what is this value for?' first: math means convert the TEXT (int(\"3\") + 3); a message means convert the NUMBER (\"3\" + str(3)).",
        },
      ],
      takeaways: [
        "Four converters: int(), float(), str(), bool() — and str()/bool() never fail; int()/float() have standards.",
        "int() truncates (3.99 becomes 3, -3.99 becomes -3); round() rounds. Different tools, different questions.",
        "int(\"abc\") and int(\"3.5\") raise ValueError — fix decimal text in two steps: int(float(\"3.5\")).",
        "Python promotes numbers automatically (int + float is float, True counts as 1) but never converts text — you must choose intent.",
        "Before any conversion ask: what is this value FOR? The answer picks the converter: math needs numbers, messages need text.",
      ],
      quiz: [
        {
          id: "b-06-q1",
          prompt: "What does int(\"42\") + 8 evaluate to?",
          options: [
            { text: "\"428\"", correct: false, feedback: "That is string gluing — but int() already removed the quotes; this is real addition." },
            { text: "50", correct: true, feedback: "Correct: int(\"42\") is the number 42, and 42 + 8 is 50." },
            { text: "A ValueError", correct: false, feedback: "\"42\" is perfectly shaped whole-number text — int() accepts it happily." },
          ],
          explanation: "Once converted, it is a genuine number and behaves like one: 42 + 8 = 50.",
        },
        {
          id: "b-06-q2",
          prompt: "What does int(7.9) evaluate to?",
          options: [
            { text: "8 — int() rounds to the nearest whole number", correct: false, feedback: "int() never rounds — .9 or .1 makes no difference to it." },
            { text: "7", correct: true, feedback: "Right: int() truncates, discarding the .9 entirely. round(7.9) would be 8 — different tool, different question." },
            { text: "7.0", correct: false, feedback: "Both the decimal part AND the float type are gone: the result is the int 7." },
          ],
          explanation: "int() chops; round() rounds. For 7.9 they disagree — and the difference is a classic source of bugs.",
        },
        {
          id: "b-06-q3",
          prompt: "Which of these conversions raises an error?",
          options: [
            { text: "int(\"12\")", correct: false, feedback: "Clean whole-number text — int() produces 12 without complaint." },
            { text: "float(\"1.5\")", correct: false, feedback: "float() is exactly the converter for decimal text: 1.5." },
            { text: "int(\"1.5\")", correct: true, feedback: "Correct — int() refuses text containing a dot: ValueError: invalid literal for int(). Fix: int(float(\"1.5\"))." },
            { text: "str(5)", correct: false, feedback: "str() never fails — every value has a text form; here it is \"5\"." },
          ],
          explanation: "int() reads only whole-number-shaped text. Decimal text must go through float() first — in two explicit steps.",
        },
      ],
    },

    // ------------------------------------------------------------- b-07
    {
      slug: "b-07",
      title: "Input and Output",
      minutes: 15,
      summary:
        "print()'s hidden options (sep and end), input() — the question function that always answers in text — and how real terminal conversations differ from the browser playground.",
      kind: "coding",
      objectives: [
        "Control print() spacing with sep= and line endings with end=",
        "Explain what input() does, what it returns, and why that return is ALWAYS a string",
        "Apply the int(input()) pattern for numeric questions and predict its failure mode",
        "Simulate input with pre-set variables so programs run everywhere, including this course's playground",
      ],
      why: "Every useful program is a conversation: it shows results (output) and reacts to users (input). You already know print(); now you will learn that it has been holding back two options — sep and end — that turn loose values into clean reports. Then you will meet input(), the function that asks the user a question. It comes with a rule that surprises everyone: the answer is ALWAYS text, even when the user types numbers. That rule, plus the int(input()) fix from lesson b-06, is the bridge between this lesson and every interactive program you will ever write.",
      blocks: [
        {
          kind: "text",
          text: "You have called `print()` hundreds of times by now, and it has quietly obeyed two hidden defaults: separate values with a space, and end the line with a newline. Both defaults are options you can change — with **keyword arguments** (name=value pairs written inside the parentheses).",
        },
        {
          kind: "heading",
          text: "print() is more configurable than you think",
        },
        {
          kind: "code",
          title: "sep and end — the two hidden options",
          code: `print("2026", "11", "14", sep="-")
print("one", "two", "three", sep=" | ")
print("Loading", end=" ")
print("done")
print("A", "B", "C", sep="")
print("start", end="")
print("finish")
`,
          output: `2026-11-14
one | two | three
Loading done
ABC
startfinish`,
          explain: [
            "`sep` sets what goes BETWEEN comma-separated values — a dash makes a date, \" | \" makes a clean menu, an empty string glues values together with nothing between.",
            "`end` sets what goes AFTER the line — the default is an invisible newline (`\"\\n\"`). The first `end=\" \"` keeps the cursor on the line, so 'done' lands right after 'Loading '.",
            "`end=\"\"` glues two separate print calls into one visible line: 'startfinish'. This is how progress bars, prompts, and tables are built.",
          ],
        },
        {
          kind: "table",
          title: "print()'s two everyday options",
          headers: ["Option", "Default", "What it controls", "Example"],
          rows: [
            ["sep", "\" (one space)", "What is printed BETWEEN comma-separated values", "print(\"a\", \"b\", sep=\"-\")  ->  a-b"],
            ["end", "\"\\n\" (newline)", "What is printed AFTER everything else", "print(\"a\", end=\"!\")  ->  a!"],
          ],
          caption:
            "Both are keyword arguments: written as name=value inside the parentheses. You will meet keyword arguments properly in Part D (functions) — for now, sep and end are the two you can simply use.",
        },
        {
          kind: "heading",
          text: "input(): asking the user a question",
        },
        {
          kind: "code",
          title: "greeting.py — the full source (runs on YOUR computer)",
          lang: "text",
          code: `# greeting.py — a program that asks a question
name = input("What is your name? ")
print("Hello,", name)
print(f"Welcome, {name}!")`,
          outputNote:
            "This is the file's source, shown as-is. input() needs a real human at a real keyboard, so this lesson displays these programs instead of running them — read on for why, and for the terminal sessions that show them working.",
          explain: [
            "`input(prompt)` prints the prompt text, then WAITS for the user to type something and press Enter.",
            "Whatever was typed comes back as the return value — here it is stored in `name`. From that line onward, the program knows what the user said.",
            "With `name = \"Ada\"` already stored, the rest is review: two prints, one with commas, one with an f-string.",
          ],
        },
        {
          kind: "code",
          title: "The same program, running in a real terminal",
          lang: "text",
          code: `$ python3 greeting.py
What is your name? Ada
Hello, Ada
Welcome, Ada!`,
          outputNote:
            "A real terminal session: the $ line is the command, 'Ada' after the prompt is what the human typed, and the last two lines are the program's output.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The browser playground cannot really listen",
          text: "In this course's browser playground, there is no human waiting at a keyboard, so input() hands back an empty string — and a program that depends on typed input gets nothing useful (calling input() there can even raise EOFError, 'no input available'). This is a sandbox limitation, not a Python difference. On your own machine, in a real terminal, everything on this page works exactly as shown. In the course playgrounds we use the simulation pattern at the end of this lesson, and every exercise here does the same.",
        },
        {
          kind: "heading",
          text: "input() ALWAYS answers in text",
        },
        {
          kind: "text",
          text: "Here is the rule that makes or breaks interactive programs: even if the user types digits, `input()` returns a **string**. Ask for a birth year, receive `\"1999\"` — text. It LOOKS like a number and prints like a number, but as lesson b-06 proved, `\"1999\" + 1` is a TypeError crash. The universal fix is the `int(input())` pattern: convert the answer on the spot.",
        },
        {
          kind: "code",
          title: "age.py — the int(input()) pattern",
          lang: "text",
          code: `# age.py — ask for a year, compute an age
birth_year = int(input("Birth year? "))
age = 2026 - birth_year
print(f"You turn {age} this year.")`,
          outputNote:
            "The pattern: int() wraps input() — the text answer is converted to a number the very moment it arrives. age.py in a real terminal:",
          explain: [
            "Read it inside-out, like math: input() asks and returns \"1999\" (text); int() converts that to 1999 (number); birth_year gets the number.",
            "The math on line 3 now works because both sides are numbers.",
          ],
        },
        {
          kind: "code",
          title: "age.py working — and the day it breaks",
          lang: "text",
          code: `$ python3 age.py
Birth year? 1999
You turn 27 this year.

$ python3 age.py
Birth year? nineteen-ninety-nine
Traceback (most recent call last):
  File "age.py", line 2, in <module>
ValueError: invalid literal for int() with base 10: 'nineteen-ninety-nine'`,
          outputNote:
            "Two real sessions. Top: the user types digits, all is well. Bottom: the user types words, and int() raises the exact ValueError from lesson b-06 — now you know where that error comes from in the wild: humans typing at keyboards.",
          explain: [
            "Lesson b-06 promised this error would appear 'the day after this lesson' — here it is. Real users type wrong things constantly; guarding against that is called error handling, and it arrives in Part G.",
            "Until then, your job is to know WHICH conversions can fail (int() and float() on messy text) and read the ValueError calmly when they do.",
          ],
        },
        {
          kind: "heading",
          text: "The simulation pattern: how input-driven code runs everywhere",
        },
        {
          kind: "text",
          text: "Interactive programs are tested by *simulating the user*: replace the `input()` call with the value a user would have typed, as a string literal. The rest of the program is unchanged — which means the logic can run in this course's browser playground, and the same program works for a million users, each typing their own answer:",
        },
        {
          kind: "code",
          title: "age.py's logic, simulated",
          code: `# Simulating input(): pretend the user typed 1999
birth_year = int("1999")
age = 2026 - birth_year
print(f"You turn {age} this year.")
`,
          output: `You turn 27 this year.`,
          outputNote: "Same output as the terminal session above — one line, because the question is answered in advance.",
          explain: [
            "`int(\"1999\")` is EXACTLY what `int(input())` produced in the real terminal — the simulation just skips the human.",
            "This is how the exercises in this part work: they hand you 'answers' as variables, you write the program logic that uses them.",
            "Professional developers do the same thing when testing: feed the program pretend inputs and check the outputs. It is a real technique, not a classroom trick.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — build a report with sep and end",
          task: "This playground block simulates a user's answers with variables (the pattern you just learned). Using only print() with sep= and end= and f-strings, make the three-item report print as ONE line that looks exactly like: bread, milk, eggs — 3 items. Nothing about the data changes; only the printing does. Run when done — the target line is printed last.",
          code: `# Simulated user answers
item1 = "bread"
item2 = "milk"
item3 = "eggs"

# TODO: print all three items separated by ", " using one print with sep=
print(item1, item2, item3, sep=", ", end=" - ")
print(f"{3} items")
`,
          hint: "The target output: 'bread, milk, eggs - 3 items'. The starter already prints it with sep=\", \" and end=\" - \" — experiment: change sep to \" + \", then make end=\"\" and see how the line breaks.",
        },
      ],
      terms: [
        { term: "Prompt", definition: "The question text input() shows the user while waiting — written inside the parentheses: input(\"Name? \")." },
        { term: "input()", definition: "The function that asks the user a question and returns whatever they typed — always as a string, even if it looks like a number." },
        { term: "Keyword argument", definition: "An option passed as name=value inside a call, like sep=\"-\" or end=\"\". Sets behavior without changing the main data." },
        { term: "Standard input (stdin)", definition: "The channel a program reads typed input from. A real terminal has it; a browser sandbox does not — which is why the playground's input() returns an empty string." },
        { term: "EOFError", definition: "The error input() raises when there is no input to read — 'end of file'. Happens in sandboxes without keyboards, never in a real terminal session with a user." },
      ],
      mistakes: [
        {
          mistake: "Doing math on input() directly: age = input(\"Age? \") then age + 1.",
          why: "input() returned the TEXT of what was typed — \"24\", not 24. Text + number is the TypeError from lesson b-06, arriving exactly as promised.",
          fix: "Convert on the spot: age = int(input(\"Age? \")). One extra function call, and the whole program is correct.",
        },
        {
          mistake: "Calling input() without capturing the answer: input(\"Name? \") on its own line.",
          why: "The user dutifully types their name — and the returned string is thrown away. Nothing was stored, so the program cannot use it.",
          fix: "Every input() call deserves a variable: name = input(\"Name? \"). If you did not need the answer, you did not need the question.",
        },
        {
          mistake: "Writing input() into a program that must run in the browser playground.",
          why: "The sandbox has no keyboard waiting: input() returns \"\" or raises EOFError, and the program stalls or crashes — even though it is perfectly correct on a real computer.",
          fix: "Use the simulation pattern in the playground: replace input() with the typed answer as a string literal, and convert exactly as the real program would.",
        },
        {
          mistake: "Forgetting the prompt and leaving the user staring at a blinking cursor.",
          why: "input() without a prompt still waits — but the user has no idea what the program wants. 'What do I type?!' is a real usability failure, not a technical one.",
          fix: "Always pass a clear prompt with a trailing space: input(\"Birth year? \"). The space keeps the typed answer from touching the question mark.",
        },
      ],
      takeaways: [
        "print() has two everyday options: sep (between values, default one space) and end (after the line, default newline).",
        "input(prompt) asks the user, waits for Enter, and returns the answer — ALWAYS a string, even pure digits.",
        "The universal numeric pattern is int(input(\"Question? \")) — convert the answer the moment it arrives.",
        "A human typing words where digits belong raises ValueError: invalid literal for int() — that is lesson b-06's error, live.",
        "In the browser playground, simulate the user: put the typed answer in as a string literal and keep the rest of the program unchanged.",
      ],
      quiz: [
        {
          id: "b-07-q1",
          prompt: "The user runs a program that asks input(\"How many? \") and types 42. What does the input() call return?",
          options: [
            { text: "The int 42", correct: false, feedback: "It LOOKS like 42 on screen, but input() never produces numbers." },
            { text: "The string \"42\"", correct: true, feedback: "Exactly — input() always returns text, even pure digits. Math on it needs int() first." },
            { text: "A float 42.0", correct: false, feedback: "Not even close: no number types come out of input(), ever." },
          ],
          explanation: "input() answers in text, always. int(input(...)) is the pattern that turns it into a number.",
        },
        {
          id: "b-07-q2",
          prompt: "What does print(\"a\", \"b\", \"c\", sep=\"-\") output?",
          options: [
            { text: "a b c", correct: false, feedback: "That is the default separator — but sep was explicitly changed." },
            { text: "a-b-c", correct: true, feedback: "Correct — sep replaces the default space between every pair of values." },
            { text: "abc", correct: false, feedback: "That would be sep=\"\" — gluing with nothing between." },
          ],
          explanation: "sep sits between values: \"-\" turns three values into a dashed chain: a-b-c.",
        },
        {
          id: "b-07-q3",
          prompt: "Why does birth_year = int(input(\"Birth year? \")) crash with ValueError when the user types 'soon'?",
          options: [
            { text: "Because input() cannot hold words", correct: false, feedback: "input() happily holds any text — it is int() that chokes on non-numeric text." },
            { text: "Because int() cannot make a number out of the text \"soon\" — ValueError: invalid literal", correct: true, feedback: "Exactly: the crash is lesson b-06's conversion rule, triggered by real human input. Guarding it is Part G's job." },
            { text: "Because programs cannot ask two things at once", correct: false, feedback: "There is only one question here — the failure is purely about conversion." },
          ],
          explanation: "int() only reads number-shaped text. Humans type whatever they like — so interactive programs must handle ValueError (later).",
        },
      ],
    },

    // ------------------------------------------------------------- b-08
    {
      slug: "b-08",
      title: "Operators",
      minutes: 15,
      summary:
        "The complete operator map in one place: the arithmetic family, comparisons, assignment shortcuts like +=, membership with in, a first look at is — and the precedence ladder that decides everything.",
      kind: "concept",
      objectives: [
        "Use every assignment shortcut (+=, -=, *=, /=, //=, %=, **=) and know what each expands to",
        "Test membership with in and not in, and explain what is does and when to use it",
        "Read the precedence ladder and predict how Python groups any expression",
        "Rewrite a tangled expression with parentheses so a human can read it",
      ],
      why: "You have now met every operator individually, scattered across five lessons — but programs use them TOGETHER, and when they combine, one question decides everything: which one runs first? That answer is the precedence ladder, and you already saw it bite (2 + 3 * 4 is 14, and ** is right-to-left). This lesson collects the whole map in one place — including the += shortcuts professionals type a hundred times a day, the in operator that powers every search, and is, whose proper job will surprise you — then gives you the ladder that orders them all.",
      blocks: [
        {
          kind: "text",
          text: "An **operator** is a symbol that does something to values: `+` adds, `==` compares, `in` searches. You have learned them scattered across lessons b-02 through b-07; now we collect the full map, add the three families you are missing (assignment shortcuts, membership, identity), and finish with the ladder that settles every 'which runs first?' dispute.",
        },
        {
          kind: "heading",
          text: "Assignment shortcuts: the += family",
        },
        {
          kind: "code",
          title: "Update in place — the professional's most-typed line",
          code: `score = 0
score += 10
print(score)
score -= 3
print(score)
score *= 2
print(score)
score //= 5
print(score)
score %= 3
print(score)
`,
          output: `10
7
14
2
2`,
          explain: [
            "`score += 10` means exactly `score = score + 10` — compute with the current value, store back. Every arithmetic operator you know has this shortcut form.",
            "Trace it like lesson a-08 taught: 0, then 10, then 7 (minus 3), then 14 (times 2), then 2 (14 // 5), then 2 (2 % 3 is 2 — the remainder when 2 cannot afford a single 3).",
            "Why the shortcut exists: updating a total is the most common line in real code, and `total += price` reads as one idea instead of a repeated name.",
          ],
        },
        {
          kind: "table",
          title: "The shortcut family — each expands to a full reassignment",
          headers: ["Shortcut", "Expands to", "In words"],
          rows: [
            ["x += 5", "x = x + 5", "increase by"],
            ["x -= 5", "x = x - 5", "decrease by"],
            ["x *= 5", "x = x * 5", "multiply by"],
            ["x /= 5", "x = x / 5", "divide by (result becomes float)"],
            ["x //= 5", "x = x // 5", "divide, keep the whole part"],
            ["x %= 5", "x = x % 5", "replace with the remainder"],
            ["x **= 2", "x = x ** 2", "replace with the power"],
          ],
          caption:
            "All seven are just reassignment with one operation. If a shortcut ever confuses you, expand it by hand — they are exactly equal.",
        },
        {
          kind: "heading",
          text: "Membership: the in operator",
        },
        {
          kind: "code",
          title: "Is it in there? A question programs ask constantly",
          code: `print("py" in "python")
print("Py" in "python")
print("z" in "python")
print("apple" in "apple pie")
vowels = ["a", "e"]
print("a" in vowels)
print("x" not in "python")
`,
          output: `True
False
False
True
True
True`,
          explain: [
            "`in` asks 'does this appear inside that?' and returns a boolean — a search you can use in any condition.",
            "It is exact, like everything in Python: \"Py\" is not in \"python\" because P and p are different characters (lesson b-05's case rule).",
            "`in` also works on lists (`\"a\" in [\"a\", \"e\"]`) — lists get their full treatment in Part E, but you can already read this use, and you saw one in lesson a-03.",
            "`not in` is the opposite question, and it reads like English: 'x is not in python' — True.",
          ],
        },
        {
          kind: "heading",
          text: "Identity: is — and why its main job is None",
        },
        {
          kind: "text",
          text: "`==` asks 'do these two values match?' — but `is` asks a stricter question: 'are these the SAME object in memory?' For values, always use `==`. The one daily job of `is` is testing for the value **None** (lesson b-05's 'nothing yet' placeholder) — because there is only one None in all of Python, 'is it None?' is genuinely a question of identity:",
        },
        {
          kind: "code",
          title: "The canonical use of is",
          code: `x = None
print(x is None)
print(x is not None)
print(x == None)
`,
          output: `True
False
True`,
          explain: [
            "`x is None` is THE standard test — you will see it in professional code constantly, and write it yourself from Part D onward.",
            "For None, `== None` happens to give the same answer — but `is None` is the community convention: it says exactly what you mean ('is this nothing?') and never misbehaves.",
            "Warning: do NOT use `is` for numbers or strings. `5 is 5` may look correct today (Python quietly reuses small-number objects) and can fail for larger values — an implementation detail you should never lean on. Values get `==`; identity gets `is`.",
          ],
        },
        {
          kind: "heading",
          text: "The precedence ladder — who runs first",
        },
        {
          kind: "text",
          text: "When operators mix in one expression, Python does not read left to right — it climbs a fixed ladder from highest priority to lowest. You have met pieces of it (b-03's PEMDAS); here is the whole thing, in order:",
        },
        {
          kind: "table",
          title: "The ladder, highest priority first",
          headers: ["Priority", "Operators", "Notes"],
          rows: [
            ["1 (highest)", "( ) parentheses", "Always wins — how YOU choose the grouping"],
            ["2", "** power", "Right to left: 2 ** 3 ** 2 is 2 ** (3 ** 2)"],
            ["3", "unary minus/plus: -x, +x", "Note: -2 ** 2 is -(2 ** 2)"],
            ["4", "*  /  //  %", "Left to right"],
            ["5", "+  -", "Left to right"],
            ["6", "comparisons: == != > < >= <=, in, is", "Comparisons run AFTER the math on both sides"],
            ["7", "not", "Flips one thing, after comparisons"],
            ["8", "and", "Combines two, after not"],
            ["9 (lowest)", "or", "Combines two, last of all"],
          ],
          caption:
            "Read a mixed expression by walking DOWN this ladder: first group parentheses, then powers, then the times family, then addition, then compare, then flip, then combine.",
        },
        {
          kind: "code",
          title: "The ladder, applied",
          code: `print(2 + 3 * 4)
print(not 3 > 5)
print(5 > 3 and 2 > 1)
print(-2 ** 2)
`,
          output: `14
True
True
-4`,
          explain: [
            "`2 + 3 * 4` is 14: the times family (step 4) runs before addition (step 5).",
            "`not 3 > 5`: the comparison runs FIRST (3 > 5 is False), then not flips it: True. If not ran first, the expression would be nonsense — the ladder saves it.",
            "`5 > 3 and 2 > 1`: both comparisons finish (True, True), and and combines them last: True.",
            "`-2 ** 2` is -4, the trap worth remembering: ** outranks unary minus, so this is -(2 ** 2). Want positive four? Say `(-2) ** 2` — parentheses, step 1, always win.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The professional habit: parenthesize for the reader",
          text: "Every expression in this lesson could be checked by running it — but professionals do not write code that needs a precedence table to read. When operators mix beyond the obvious, add parentheses to say what you mean: `price * (1 + tax_rate)` reads instantly; `price * 1 + tax_rate` is a bug wearing a legal expression's clothes.",
        },
        {
          kind: "tryIt",
          title: "Try it — the operator gauntlet",
          task: "Predict all four printed lines on paper FIRST (walk the ladder for each). Then run and score yourself. Then change n **= 2 to n **= 3 and predict the new outputs before running again.",
          code: `n = 8
n += 4
n *= 2
n //= 5
n **= 2
print(n)
print(n % 3 == 0)
print("half" in "whenever")
print(-3 ** 2)
`,
          hint: "Trace n like lesson a-08: 8, 12, 24, 4, 16. Then: is 16 % 3 equal to 0? Does 'whenever' contain the letters h-a-l-f in a row? And -3 ** 2 is -(3 ** 2) — the unary-minus trap.",
        },
      ],
      terms: [
        { term: "Operator", definition: "A symbol that combines or transforms values: +, %, ==, in, and, or. Every expression is built from operators and operands." },
        { term: "Compound assignment (+=)", definition: "The shortcut family that updates a variable in place: x += 5 expands exactly to x = x + 5." },
        { term: "Membership operator (in)", definition: "Asks whether one value appears inside another: 'py' in 'python' is True. Works on strings and lists, returns a boolean." },
        { term: "Identity operator (is)", definition: "Asks whether two names point at the SAME object. Its daily job is x is None — for comparing values, use ==." },
        { term: "Unary minus", definition: "The minus in -x — it flips a single number, and it binds looser than **: -2 ** 2 is -4." },
      ],
      mistakes: [
        {
          mistake: "Using is to compare values: if score is 10.",
          why: "is checks identity — 'same object in memory' — and Python only reuses some small-number objects as an accident of implementation. The check can work today and silently break for bigger numbers.",
          fix: "Compare values with ==. Reserve is for None: x is None (and its partner x is not None).",
        },
        {
          mistake: "Typing =+ instead of += (or =- instead of -=).",
          why: "Python reads x =+ 5 as x = +5 — an assignment of positive 5. No error, no warning, catastrophically wrong value. The most silent typo in Python.",
          fix: "The operator sign comes BEFORE the equals: +=, -=, *=. Type it as one motion, and if a shortcut's result surprises you, re-read it character by character.",
        },
        {
          mistake: "Expecting -2 ** 2 to be 4.",
          why: "The power operator outranks unary minus, so Python computes -(2 ** 2). This is step 2 beating step 3 on the ladder.",
          fix: "Parenthesize your intent: (-2) ** 2 is 4. When a sign and a power share an expression, parentheses are not optional decoration — they are the meaning.",
        },
        {
          mistake: "Writing a mixed expression and hoping the order works out: price * 1 + tax.",
          why: "Multiplication runs first, so this multiplies only price and adds tax as a whole number — almost never what a tax calculation means.",
          fix: "Parenthesize for the reader: price * (1 + tax_rate / 100). If an expression needs the ladder to explain it, it needs parentheses instead.",
        },
      ],
      takeaways: [
        "The += family (+=, -=, *=, /=, //=, %=, **=) updates a variable in place: score += 10 is score = score + 10.",
        "in asks 'is this inside that?' and returns a boolean — the search operator; not in is its opposite.",
        "is asks 'same object?', and its one daily job is None: x is None. Values compare with ==, always.",
        "The precedence ladder: parentheses, then **, then unary -, then * / // %, then + -, then comparisons, then not, and, or.",
        "When operators mix, parenthesize for the reader — clarity beats cleverness, every single time.",
      ],
      quiz: [
        {
          id: "b-08-q1",
          prompt: "score = 5, then score += 2, then score *= 3. What does print(score) show?",
          options: [
            { text: "11 — (5 + 2) + 3", correct: false, feedback: "score *= 3 MULTIPLIES, it does not add 3." },
            { text: "21", correct: true, feedback: "Correct: += gives 7, then *= 3 gives 21. Each shortcut uses the current value." },
            { text: "10 — 5 + (2 * 3)", correct: false, feedback: "The shortcuts run as separate lines, in order — not as one tangled expression." },
          ],
          explanation: "Trace it: 5, then 5 + 2 = 7, then 7 * 3 = 21. Shortcuts are reassignments, one at a time.",
        },
        {
          id: "b-08-q2",
          prompt: "What is the proper everyday job of the is operator?",
          options: [
            { text: "Checking whether two values are equal, as a synonym for ==", correct: false, feedback: "Dangerous habit — that works only by accident for some small values, and never for strings or big numbers." },
            { text: "Testing for None: x is None — asking 'is this the one-and-only None object?'", correct: true, feedback: "Exactly. There is a single None in Python, so asking 'is it None?' is a true identity question." },
            { text: "Checking whether a value is inside a string", correct: false, feedback: "That is the in operator's job — is has nothing to do with containment." },
          ],
          explanation: "is is for identity. Its daily job is the None check; everything else compares values with ==.",
        },
        {
          id: "b-08-q3",
          prompt: "What does -3 ** 2 evaluate to?",
          options: [
            { text: "9, because (-3) squared is 9", correct: false, feedback: "That would require parentheses around -3 — the power grabs the 3 first." },
            { text: "-9, because ** outranks the unary minus: -(3 ** 2)", correct: true, feedback: "Correct — the ladder strikes again. Write (-3) ** 2 when you mean 9." },
            { text: "6, because -3 * 2", correct: false, feedback: "** is a power, not multiplication: 3 ** 2 is 9, then negated." },
          ],
          explanation: "Powers bind tighter than unary minus: -3 ** 2 is -(3 ** 2) = -9. Parentheses make your intent unambiguous.",
        },
      ],
    },

    // ------------------------------------------------------------- b-09
    {
      slug: "b-09",
      title: "Expressions",
      minutes: 13,
      summary:
        "The difference between code that produces a value and code that performs an action, chained comparisons like 3 < x < 10, and the step-by-step method for building complex expressions without drowning.",
      kind: "concept",
      objectives: [
        "Distinguish an expression (produces a value) from a statement (performs an action)",
        "Use the REPL echo as a test: expressions get an answer, statements stay silent",
        "Read and write chained comparisons like 18 <= age < 65",
        "Build a complex calculation step by step by naming its intermediate results",
      ],
      why: "Every line of Python you have written so far is either an expression or a statement — and the difference explains a mystery you have already witnessed: why the REPL answers 2 + 2 with 4 but answers x = 5 with silence. Knowing the difference turns vague ideas like 'put the math inside the print' into a precise skill: expressions can nest anywhere a value is expected — inside f-strings, inside calls, inside bigger expressions. That nesting is how complex calculations are built, and building them one named step at a time (instead of one giant unreadable line) is the habit that separates professional code from clever code.",
      blocks: [
        {
          kind: "text",
          text: "Time to name a distinction you have been using all along. An **expression** is any piece of code that *produces a value*: `2 + 2`, `price * quantity`, `x > 3`, `\"py\" + \"thon\"`. A **statement** is an instruction that *does something*: `x = 5` stores, `print(...)` shows. The test is simple: could you ask this code a question and get an answer back? If yes, it is an expression.",
        },
        {
          kind: "heading",
          text: "The REPL knows the difference",
        },
        {
          kind: "code",
          title: "Expressions get an answer; statements get silence",
          lang: "repl",
          code: `>>> 2 + 2
4
>>> x = 5
>>> x + 2
7
>>> print(x)
5`,
          outputNote:
            "Read it line by line: you type each >>> line, Python answers underneath — or stays silent. The silences are as meaningful as the answers.",
          explain: [
            "`2 + 2` is an expression, so the REPL echoes its value: 4.",
            "`x = 5` is a statement — it performs the binding and produces NO value, so the REPL prints nothing. Silence is the answer 'this was an action, not a question'.",
            "`x + 2` asks a question again: 7. `print(x)` performs an action — the 5 you see is print doing its job, not an echo of a value.",
            "This is why files need print() but the REPL does not (lesson a-06): in a file, expression values simply vanish unless something uses them.",
          ],
        },
        {
          kind: "table",
          title: "Statement or expression?",
          headers: ["Code", "Kind", "What it gives back"],
          rows: [
            ["4 + 1", "Expression", "The value 5"],
            ["price * quantity", "Expression", "Whatever the variables hold, multiplied"],
            ["x = 5", "Statement", "Nothing — it stores"],
            ["x = 4 + 1", "Statement CONTAINING an expression", "The right side computes first (value 5), then x gets it"],
            ["print(x)", "Expression used for its ACTION", "The value is None; the point is the printing"],
          ],
          caption:
            "Statements are the sentences; expressions are the nouns and phrases inside them. One line can hold both: x = 4 + 1 stores the value of an expression.",
        },
        {
          kind: "heading",
          text: "Expressions nest wherever a value fits",
        },
        {
          kind: "text",
          text: "The powerful consequence: anywhere Python expects a value, you may write a whole expression. Inside an f-string's `{}`. Inside a print call. Inside a bigger expression. You have been doing it since lesson a-08 (`print(\"Years until 30:\", 30 - age)`) — now with a name:",
        },
        {
          kind: "code",
          title: "Math inside the braces",
          code: `price = 24.5
quantity = 3
print(f"Total: {price * quantity}")
print(f"Total with 10% tax: {price * quantity * 1.1}")
print(f"Total with 10% tax: {price * quantity * 1.1:.2f}")
`,
          output: `Total: 73.5
Total with 10% tax: 80.85000000000001
Total with 10% tax: 80.85`,
          explain: [
            "Inside `{}`, Python evaluates the expression first, then splices its value into the text: price * quantity becomes 73.5.",
            "The middle line is lesson a-06's honesty, resurfacing: raw float math gives 80.85000000000001. Nothing is wrong — floats are simply honest.",
            "The last line fixes it FOR DISPLAY with the `:.2f` format spec from lesson b-04: 80.85. Money gets formatted, always — the raw float underneath is nobody's business.",
          ],
        },
        {
          kind: "heading",
          text: "Chained comparisons: math notation Python allows",
        },
        {
          kind: "text",
          text: "In math class you wrote `1 < x < 10` naturally. Python accepts it too — a **chained comparison** means 'both comparisons must hold', evaluated left to right. It is shorthand for `1 < x and x < 10`, except x is checked once and it reads like the mathematics you already know:",
        },
        {
          kind: "code",
          title: "Ranges, written the human way",
          code: `x = 7
print(3 < x < 10)
print(1 < 2 < 3)
print(10 > x >= 7)
print(5 < 3 < 100)
`,
          output: `True
True
True
False`,
          explain: [
            "`3 < x < 10`: x is 7 — bigger than 3 AND smaller than 10, so True.",
            "`10 > x >= 7` mixes directions freely: 10 > 7 and 7 >= 7 — True.",
            "`5 < 3 < 100` is False, and the reason matters: the chain evaluates left to right, and the FIRST comparison (5 < 3) already fails — the second never even runs. Chains stop at the first False.",
            "Use chains for ranges — `18 <= age < 65` — they read exactly like the condition they express. For anything beyond three comparisons, and/or is clearer.",
          ],
        },
        {
          kind: "heading",
          text: "Building a complex expression, step by step",
        },
        {
          kind: "text",
          text: "Beginners meet a complex requirement — 'apply a 15% discount, then 8% tax' — and try to write it as one giant line. Professionals build it as a *ladder of named steps*, where each step is an expression small enough to verify at a glance:",
        },
        {
          kind: "steps",
          title: "The step-by-step method",
          items: [
            "**Name the inputs** — base_price, quantity, discount_percent, tax_percent as clear variables (lesson b-01).",
            "**Compute the first quantity** — subtotal = base_price * quantity. One expression, one line, one meaning.",
            "**Apply the next layer** — after_discount = subtotal * (1 - discount_percent / 100). Parentheses make the intent readable (lesson b-08).",
            "**Apply the last layer** — total = after_discount * (1 + tax_percent / 100).",
            "**Format for display** — an f-string with :.2f per value. Math first, paint last (lesson b-03).",
          ],
        },
        {
          kind: "code",
          title: "The method, as a program",
          code: `base_price = 89.99
quantity = 4
discount_percent = 15
tax_percent = 8

subtotal = base_price * quantity
after_discount = subtotal * (1 - discount_percent / 100)
total = after_discount * (1 + tax_percent / 100)

print(f"Subtotal: {subtotal:.2f}")
print(f"After {discount_percent}% discount: {after_discount:.2f}")
print(f"Total with {tax_percent}% tax: {total:.2f}")
`,
          output: `Subtotal: 359.96
After 15% discount: 305.97
Total with 8% tax: 330.44`,
          explain: [
            "Four named inputs, three named steps — you can check each line's math separately, in your head: 4 tickets at 89.99 is 359.96; minus 15% is 305.966, displayed as 305.97.",
            "The one-liner equivalent — `total = base_price * quantity * (1 - discount_percent / 100) * (1 + tax_percent / 100)` — is legal, but a single wrong parenthesis hides in it invisibly.",
            "Naming the intermediate results is the grown-up version of showing your work: subtotal and after_discount are comments that Python keeps honest, because they must be CORRECT to produce the right total.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The one-line rule of thumb",
          text: "If an expression needs more than one breath to explain, break it into named steps. You are trading one impressive line for four boring ones — and boring is exactly what correct, testable, readable code looks like. The impressive line can be rebuilt from the steps anytime; the reverse is detective work.",
        },
        {
          kind: "tryIt",
          title: "Try it — build the movie order",
          task: "The comments tell you what to compute. Fill in the TODOs with expressions, predicting each print before running. Then check your budget condition: does 39.25 really satisfy 0 < total < 40? Chain the comparison yourself and run.",
          code: `ticket_price = 12.50
tickets = 3
booking_fee = 1.75

# TODO: compute the tickets subtotal
subtotal = ticket_price * tickets
# TODO: add the booking fee to get the total
total = subtotal + booking_fee
# TODO: check the total fits the budget 0..40 with ONE chained comparison
print(0 < total < 40)
print(f"Order total: {total:.2f}")
`,
          hint: "Subtotal is 12.50 * 3 = 37.5; total is 39.25; and a chained comparison has the shape low < value < high. Predict all three prints first.",
        },
      ],
      terms: [
        { term: "Expression", definition: "Code that produces a value: 2 + 2, price * quantity, x > 3. Can nest anywhere a value is expected." },
        { term: "Statement", definition: "An instruction that performs an action and produces no value: x = 5 stores; the REPL answers it with silence." },
        { term: "Chained comparison", definition: "Comparisons linked into one condition: 18 <= age < 65 means 18 <= age and age < 65. Stops at the first False." },
        { term: "Intermediate variable", definition: "A variable that holds one step of a larger calculation (subtotal, after_discount) — showing your work with names." },
        { term: "Nesting", definition: "Placing an expression inside another, where a value is expected: f\"{price * quantity:.2f}\" nests arithmetic inside formatting." },
      ],
      mistakes: [
        {
          mistake: "Writing a mega-expression in one unreadable line: total = p * q * (1 - d / 100) * (1 + t / 100).",
          why: "One misplaced parenthesis produces a plausible-looking wrong number, and no reader — including future you — can check the pieces.",
          fix: "Name the steps: subtotal, after_discount, total. Each line is one idea you can verify independently.",
        },
        {
          mistake: "Expecting the REPL to echo x = 5 with something.",
          why: "Assignment is a statement — it acts and returns no value, so there is nothing for the REPL to show. The silence is informative.",
          fix: "To see what x got, ask an expression: type x alone, or print(x). Expressions answer; statements do not.",
        },
        {
          mistake: "Reading 5 < 3 < 100 as True 'because 3 is less than 100'.",
          why: "Chains evaluate left to right and stop at the first failure: 5 < 3 is False, so the chain is False regardless of what follows.",
          fix: "Translate the chain mentally into and: (5 < 3) and (3 < 100). One False makes the whole thing False.",
        },
      ],
      takeaways: [
        "An expression produces a value; a statement performs an action. The REPL's echo (or silence) tells you which is which.",
        "Expressions nest anywhere a value fits: inside f-string braces, inside print, inside bigger expressions.",
        "Chained comparisons read like math: 18 <= age < 65 means both, evaluated left to right, stopping at the first False.",
        "Build complex calculations as named steps: subtotal, after_discount, total — each line one checkable idea.",
        "Format money at display time with :.2f; never let raw floats like 80.85000000000001 reach the screen.",
      ],
      quiz: [
        {
          id: "b-09-q1",
          prompt: "Which of these is an EXPRESSION?",
          options: [
            { text: "x = 5", correct: false, feedback: "That is a statement — it stores and returns no value; the REPL answers it with silence." },
            { text: "2 + 2", correct: true, feedback: "Correct — it produces the value 4, so it can nest anywhere a value is expected." },
            { text: "name = \"Ada\"", correct: false, feedback: "Statement again: an action (binding), not a value." },
          ],
          explanation: "The test: does it produce a value? 2 + 2 does; assignments perform actions instead.",
        },
        {
          id: "b-09-q2",
          prompt: "What does 1 < 2 < 3 evaluate to?",
          options: [
            { text: "True — 2 is between 1 and 3", correct: true, feedback: "Correct: the chain means 1 < 2 and 2 < 3 — both hold, so True." },
            { text: "False — a comparison cannot compare to another comparison", correct: false, feedback: "It can: chaining is designed exactly for range checks like this." },
            { text: "An error — write (1 < 2) < 3 instead", correct: false, feedback: "No error, and no need: Python reads it as a range, not as nested comparisons." },
          ],
          explanation: "Chained comparisons are range checks: both comparisons must hold, left to right.",
        },
        {
          id: "b-09-q3",
          prompt: "In the REPL you type total = subtotal * 1.1 and press Enter. What appears under it?",
          options: [
            { text: "The new value of total", correct: false, feedback: "Assignment stores — it does not hand a value back for showing." },
            { text: "Nothing — statements act, they do not answer", correct: true, feedback: "Exactly: no echo, no error. To see the result, ask an expression: type total on the next line." },
            { text: "A SyntaxError", correct: false, feedback: "It is perfectly legal Python — just a silent action rather than a question." },
          ],
          explanation: "The REPL echoes expression values and answers statements with silence — a built-in expression detector.",
        },
      ],
    },

    // ------------------------------------------------------------- b-10
    {
      slug: "b-10",
      title: "Comments",
      minutes: 12,
      summary:
        "The craft of writing notes humans can read and Python ignores: the # comment, the why-not-what principle, docstrings, when NOT to comment, and the conventions professionals follow.",
      kind: "concept",
      objectives: [
        "Write single-line and inline comments and explain what Python does with them",
        "Apply the why-not-what rule to judge any comment's quality",
        "Write a docstring at the top of a file and say what it is for",
        "Recognize the three times a comment does more harm than good",
      ],
      why: "You have written comments since lesson a-07 — now make it a craft. Code tells the machine WHAT to do; comments are your only tool for telling the NEXT HUMAN — including you, three months from now, at midnight, during an emergency — WHY it does it. Teams read code a hundred times more often than they write it, and comments age badly when written carelessly: a stale comment that lies about the code is worse than no comment at all. Ten minutes here build the habits that make every file you write for the rest of this course a pleasure to revisit.",
      blocks: [
        {
          kind: "text",
          text: "A **comment** is a note for humans inside a program. Everything from a `#` to the end of the line is invisible to Python — it is skipped completely, costing nothing at runtime. Comments exist for exactly one audience: the reader. You met them in lesson a-07; this lesson makes you good at them, because badly written comments are noise and well-written comments are documentation.",
        },
        {
          kind: "heading",
          text: "The comment you already know — with a real job",
        },
        {
          kind: "code",
          title: "A comment that earns its line",
          code: `# int() truncates, so round() first: 19.99 * 100 lands just below 1999
price_dollars = 19.99
price_cents = round(price_dollars * 100)
print(price_cents)
`,
          output: `1999`,
          explain: [
            "The comment explains WHY this line uses round() and not int() — the honest float surprise: 19.99 * 100 is 1998.9999999999998 (lesson a-06), and int() would truncate it to 1998 (lesson b-06).",
            "Delete the comment and the code still runs — but a future reader would see round(), wonder why, maybe 'simplify' it to int(), and silently introduce a bug.",
            "That is the standard a good comment meets: it prevents a mistake that the code alone cannot warn about.",
          ],
        },
        {
          kind: "heading",
          text: "Comment the WHY, not the WHAT",
        },
        {
          kind: "text",
          text: "The rule you met in a-07, now with its reasoning. The code already says what it does — `total = discounted + surcharge` announces its own behavior in plain arithmetic. What the code CANNOT say is the reason behind it: which policy, which requirement, which warning. Compare:",
        },
        {
          kind: "code",
          title: "One good comment, one useless one",
          code: `discounted = 42.50
surcharge = 3.99

# Weekend shipping policy: the surcharge applies AFTER any discount
total = discounted + surcharge
print(total)

# The useless kind, for contrast:
print(total)  # print the total
`,
          output: `46.49
46.49`,
          explain: [
            "The first comment carries information the code does not: the POLICY. Someday the total looks wrong to someone; the comment tells them which rule to check.",
            "The second comment translates Python into English, badly. It adds a line of noise, will not be maintained, and slows every reader down.",
            "If a comment can be deleted without losing ANY knowledge, it should be deleted.",
          ],
        },
        {
          kind: "table",
          title: "Comments that earn their place",
          headers: ["Kind", "Example", "Why it helps"],
          rows: [
            ["The WHY", "# surcharge applies after discount, per weekend policy", "Records a decision the code cannot express"],
            ["The warning", "# do NOT use == on floats here (lesson a-06)", "Prevents a future 'simplification' that breaks things"],
            ["Section header", "# ---------- the report ----------", "Lets readers navigate long files at a glance"],
            ["The TODO", "# TODO: validate quantity against stock (Part G)", "Marks known unfinished work — honest, visible, searchable"],
            ["Source note", "# conversion factors from NIST handbook", "Says where numbers came from — data has provenance"],
          ],
          caption:
            "Every one of these answers a question the reader would otherwise have to ask a human. If your comment answers no question, it is decoration.",
        },
        {
          kind: "heading",
          text: "Docstrings: the special note at the top of a file",
        },
        {
          kind: "text",
          text: "There is one structured place comments live by convention: the very top of a file, as a triple-quoted string called a **docstring** — short for documentation string. Unlike a `#` comment, a docstring is real Python (a string expression), and tooling reads it: help() shows it, documentation generators publish it. You will write function docstrings in Part D; file docstrings you can use today:",
        },
        {
          kind: "code",
          title: "A file with its name badge",
          code: `"""Price report — converts ticket prices for the Dublin venue."""

price = 42.50
print(f"Ticket: \${price:.2f}")
`,
          output: `Ticket: $42.50`,
          outputNote: "The docstring is evaluated harmlessly and produces no output — it just sits at the top as the file's self-description.",
          explain: [
            "The docstring is the first statement in the file: a triple-quoted string (lesson b-04's escaping rules) that states what the file is.",
            "Python stores it, help(tools) read it, and it doubles as the professional 'header comment' — file purpose, in one visible line.",
            "Convention: one short sentence at minimum; what the program is, not a change log.",
          ],
        },
        {
          kind: "heading",
          text: "When NOT to comment",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Three comments that hurt more than they help",
          text: "1. Narration: x = x + 1  # add one to x — noise; the code already says it. 2. Commented-out code kept 'just in case': dead lines rot, mislead readers, and make files scary — delete them; your editor's undo and version control (you will meet Git in Part J) remember everything. 3. Stale comments: the code changed last month, the comment still describes the old behavior — a lying comment is worse than none, because readers believe it. When you fix code, fix its comments in the same breath.",
        },
        {
          kind: "heading",
          text: "Conventions worth copying",
        },
        {
          kind: "steps",
          title: "The house style, in five rules",
          items: [
            "**# followed by one space**: `# the note`, never `#the note` — the space is what the eye needs.",
            "**Comments start with a capital and read as sentences** — they are prose, not code.",
            "**A comment goes above the line it describes** — never far away, never describing three lines at once.",
            "**Inline comments are rare and short**: `total = a + b  # excludes tax` — only when one fragment needs one flag.",
            "**Section headers are visual dividers**: `# ---------- the report ----------` — for files long enough to have regions.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — fix the noisy file",
          task: "This program WORKS but its comments are embarrassing narration. Delete the noise and write at most TWO comments this file actually deserves: one docstring saying what the program is, and one explaining the conversion formula's shape (celsius * 9 / 5 + 32 — why those numbers?). Keep the output identical.",
          code: `# This program prints a temperature
# First it creates a variable
# The variable is called celsius and it equals 25
celsius = 25

# Then it converts by multiplying by 9, dividing by 5, and adding 32
fahrenheit = celsius * 9 / 5 + 32

# Then it prints
print(f"{celsius}C = {fahrenheit:.1f}F")
`,
          hint: "A good docstring: triple quotes, one sentence, at the very top. A good formula comment: something like 'C to F: scale by 9/5, then shift the freezing point to 32F'. Delete every narration comment.",
        },
      ],
      terms: [
        { term: "Comment", definition: "A note for humans from a # to the end of the line. Python skips it completely; readers depend on it." },
        { term: "Inline comment", definition: "A short comment on the same line as code: total = a + b  # excludes tax. Rare, and only when one line needs one flag." },
        { term: "Docstring", definition: "A triple-quoted string at the top of a file (or under a function) describing it. Real Python — tooling like help() reads it." },
        { term: "Section header", definition: "A visual divider comment (# ---------- report ----------) that splits a long file into navigable regions." },
        { term: "Stale comment", definition: "A comment that no longer matches the code it describes — the most dangerous kind, because readers believe it." },
      ],
      mistakes: [
        {
          mistake: "Narrating the code: x = x + 1  # add one to x.",
          why: "The code already states what it does, so the comment adds zero information — but its presence trains readers to skim past ALL comments, including the good ones.",
          fix: "Delete narration. Replace it (only if needed) with the reason: why is x incremented here, what rule or requirement does it serve?",
        },
        {
          mistake: "Commenting out old code and leaving it in the file 'just in case'.",
          why: "Dead code decays into pure confusion: readers cannot tell what is live, the lines drift out of date, and the file grows a graveyard.",
          fix: "Delete it. Version control (Part J) remembers every version you will ever need — and in the meantime, the undo button covers the last hour.",
        },
        {
          mistake: "Changing code but not its comments.",
          why: "The code now does one thing while its comment promises another — and a confident, stale comment is believed until it costs someone an afternoon.",
          fix: "Treat comments as part of the code they describe: every edit that changes behavior updates the comment in the same edit-save-run cycle.",
        },
      ],
      takeaways: [
        "Comments are for humans only — Python skips everything after # on a line.",
        "Comment the WHY (policy, warning, source, intent), never the WHAT (the code already says that).",
        "Docstrings — triple-quoted strings at the top of a file — are the file's name badge; tooling reads them.",
        "Delete narration and dead code; keep comments current, or a stale comment lies on your behalf.",
        "Style: # plus a space, above the line it describes, full sentences, section headers for long files.",
      ],
      quiz: [
        {
          id: "b-10-q1",
          prompt: "What does Python do with a comment?",
          options: [
            { text: "Reads it for hints about how to optimize the code", correct: false, feedback: "Python never even parses past the # — comments cost nothing at runtime and influence nothing." },
            { text: "Skips it completely — comments exist only for human readers", correct: true, feedback: "Exactly: from # to end of line is invisible to the interpreter, visible to every reader." },
            { text: "Stores it in a hidden variable for documentation tools", correct: false, feedback: "That describes a docstring, not a # comment — a real difference between the two." },
          ],
          explanation: "# comments vanish at runtime; docstrings are real strings that tooling can read.",
        },
        {
          id: "b-10-q2",
          prompt: "A line reads: total = price * 1.2. Which comment serves the reader best?",
          options: [
            { text: "# multiply price by 1.2", correct: false, feedback: "Pure narration — the code already said this, in equally plain language." },
            { text: "# add 20% VAT to the price", correct: true, feedback: "Right — it gives the WHY: which real-world rule this multiplication serves. Without it, 1.2 is a mystery number." },
            { text: "# this line is very important!!!", correct: false, feedback: "It says nothing a reader can use — importance is shown by tests, not exclamation marks." },
          ],
          explanation: "The best comment answers the question the code cannot: what does 1.2 mean? Policy, rate, constant — that is the why.",
        },
        {
          id: "b-10-q3",
          prompt: "What is a docstring?",
          options: [
            { text: "A # comment at the bottom of a file", correct: false, feedback: "Docstrings are not # comments — and they conventionally live at the TOP of a file." },
            { text: "A triple-quoted string at the top of a file (or under a function) that documents it — and which tools like help() can read", correct: true, feedback: "Correct: it is real Python, stored and readable by tooling, serving as the file's name badge." },
            { text: "Any comment longer than three lines", correct: false, feedback: "Length is not the difference — mechanism is: # comments vanish; docstrings are stored strings." },
          ],
          explanation: "Docstring = triple-quoted self-description. # comments disappear; docstrings stay readable to tools.",
        },
      ],
    },
  ],

  exercises: [
    // ---- beginner
    {
      id: "b-b1",
      tier: "beginner",
      title: "Name that variable",
      prompt:
        "A ticketing system tracks three facts: 312 visitors so far, a ticket price of 42.5, and that the event is NOT sold out. Store each fact in a well-named snake_case variable with exactly these names: visitor_count (int), ticket_price (float), is_sold_out (bool). Then print four labeled lines as shown in the expected output — the last line multiplies the visitor count by the ticket price to project full-attendance revenue. Names are documentation: choose them as lesson b-01 taught.",
      hint: "The three variable names are given to you — use them exactly (Python is case-sensitive). The revenue line is print(\"Revenue if all visit:\", visitor_count * ticket_price) — an expression can live inside a print call.",
      starter: `# Facts to store: 312 visitors, ticket price 42.5, not sold out
# TODO: create visitor_count, ticket_price, and is_sold_out
# TODO: print each fact with a label, then the revenue line
`,
      solution: `visitor_count = 312
ticket_price = 42.5
is_sold_out = False

print("Visitor count:", visitor_count)
print("Ticket price:", ticket_price)
print("Sold out?", is_sold_out)
print("Revenue if all visit:", visitor_count * ticket_price)
`,
      expectedOutput: `Visitor count: 312
Ticket price: 42.5
Sold out? False
Revenue if all visit: 13260.0`,
      concepts: ["variables", "snake_case", "expressions"],
    },
    {
      id: "b-b2",
      tier: "beginner",
      title: "The number lab",
      prompt:
        "Store 17 in a variable a and 5 in a variable b, then print four labeled lines showing: true division (a / b), integer division (a // b), the remainder (a % b), and b raised to the power a (b ** a). Before running, predict all four results on paper — including whether each will show a decimal point. The power line demonstrates lesson b-03's claim that Python integers never overflow.",
      hint: "All four are one-line prints: print(\"division:\", a / b) and so on. Predict first: / gives 3.4, // gives 3, % gives 2 — and 5 ** 17 is exactly 762939453125, no overflow, no scientific notation.",
      starter: `a = 17
b = 5

# TODO: print division, integer division, remainder, and b to the power a
`,
      solution: `a = 17
b = 5

print("division:", a / b)
print("integer division:", a // b)
print("remainder:", a % b)
print("power:", b ** a)
`,
      expectedOutput: `division: 3.4
integer division: 3
remainder: 2
power: 762939453125`,
      concepts: ["arithmetic operators", "/ vs //", "expressions"],
    },
    {
      id: "b-b3",
      tier: "beginner",
      title: "The username builder",
      prompt:
        "A sign-up form needs a username from a first name and a last name. Store 'ada' in first and 'lovelace' in last (already in the starter), then: glue them into one variable full, print full; print its length in characters; print it in ALL CAPS; print its first and last characters as initials with dots (like a.e. — build it from full[0], a dot, full[-1], and a final dot); and print an email line made with an f-string: full followed by @dataverse.example. Six output lines in total, exactly as shown.",
      hint: "Initials are string concatenation: full[0] + \".\" + full[-1] + \".\". The email is one f-string: print(f\"{full}@dataverse.example\"). len(full) counts every character — 11.",
      starter: `first = "ada"
last = "lovelace"

# TODO: build full, then print all six lines
`,
      solution: `first = "ada"
last = "lovelace"

full = first + last
print(full)
print(len(full), "characters")
print(full.upper())
print(full[0] + "." + full[-1] + ".")
print(f"{full}@dataverse.example")
`,
      expectedOutput: `adalovelace
11 characters
ADALOVELACE
a.e.
adalovelace@dataverse.example`,
      concepts: ["strings", "indexing", "f-strings"],
    },
    {
      id: "b-b4",
      tier: "beginner",
      title: "The truthiness predictor",
      prompt:
        "Write your predictions on paper first: True or False for each of eight tests — bool(0), bool(42), bool(\"\"), bool(\"0\"), bool(\"False\"), bool(0.5), bool(None), and bool(10 > 3 and 2 < 1). Then write a program that prints each result with its label, exactly matching the expected output. The traps are the two strings that look false ('0' and 'False') — lesson b-05's falsy list settles them.",
      hint: "The falsy list is exactly five values: False, 0, 0.0, \"\", [], None. Everything else is truthy — including strings with characters in them. For the last one, 10 > 3 is True but 2 < 1 is False, and and needs both.",
      starter: `# Predict all eight on paper FIRST, then print them
# TODO: print each bool() test with its label, like:
# print("bool(0):", bool(0))
`,
      solution: `print("bool(0):", bool(0))
print("bool(42):", bool(42))
print("bool(''):", bool(""))
print("bool('0'):", bool("0"))
print("bool('False'):", bool("False"))
print("bool(0.5):", bool(0.5))
print("bool(None):", bool(None))
print("bool(10 > 3 and 2 < 1):", bool(10 > 3 and 2 < 1))
`,
      expectedOutput: `bool(0): False
bool(42): True
bool(''): False
bool('0'): True
bool('False'): True
bool(0.5): True
bool(None): False
bool(10 > 3 and 2 < 1): False`,
      concepts: ["booleans", "truthiness", "bool()"],
    },

    // ---- intermediate
    {
      id: "b-i1",
      tier: "intermediate",
      title: "The temperature converter",
      prompt:
        "Build a three-scale temperature converter. Store 37.0 in celsius and 98.6 in fahrenheit. Compute c_to_f (multiply by 9/5, add 32), f_to_c (subtract 32, multiply by 5/9), and kelvin (celsius plus 273.15). Print exactly three lines using f-strings with format specs: the C-to-F line with one decimal place, the F-to-C line with one decimal place, and the C-to-K line with two decimal places. The formulas must be written as expressions, and the output must match exactly.",
      hint: "The formulas: c_to_f = celsius * 9 / 5 + 32 and f_to_c = (fahrenheit - 32) * 5 / 9 — parentheses matter in the second (subtraction happens first inside them). Format with :.1f and :.2f inside the f-strings.",
      starter: `celsius = 37.0
fahrenheit = 98.6

# TODO: compute c_to_f, f_to_c, and kelvin
# TODO: print the three conversion lines with :.1f / :.2f formatting
`,
      solution: `celsius = 37.0
fahrenheit = 98.6

c_to_f = celsius * 9 / 5 + 32
f_to_c = (fahrenheit - 32) * 5 / 9
kelvin = celsius + 273.15

print(f"{celsius}C = {c_to_f:.1f}F")
print(f"{fahrenheit}F = {f_to_c:.1f}C")
print(f"{celsius}C = {kelvin:.2f}K")
`,
      expectedOutput: `37.0C = 98.6F
98.6F = 37.0C
37.0C = 310.15K`,
      concepts: ["arithmetic", "f-string format specs", "expressions"],
    },
    {
      id: "b-i2",
      tier: "intermediate",
      title: "The string cleanup crew",
      prompt:
        "Real data arrives messy; your job is to clean it. Given the messy string in the starter (stray spaces, mixed case), produce: clean (stripped of outer spaces, lowercased), no_spaces (clean with every space removed), and words (clean split at spaces). Then print six lines exactly as shown: the clean text, the no-spaces version, the first word, how many pieces the split produced, the words joined with hyphens, and the character length of clean. Every step uses lesson b-04's method toolbox.",
      hint: "Chain the first step: clean = messy.strip().lower() — methods return new strings, so chain or capture each result. split(\" \") gives a list; words[0] is its first piece and len(words) counts the pieces. join glues them back with the separator between each: \"-\".join(words).",
      starter: `messy = "  DaTa-SciENCE is FUN  "

# TODO: build clean, no_spaces, and words
# TODO: print the six lines shown in the expected output
`,
      solution: `messy = "  DaTa-SciENCE is FUN  "

clean = messy.strip().lower()
no_spaces = clean.replace(" ", "")
words = clean.split(" ")

print("clean:", clean)
print("no spaces:", no_spaces)
print("first word:", words[0])
print("word count:", len(words))
print("joined:", "-".join(words))
print("length check:", len(clean))
`,
      expectedOutput: `clean: data-science is fun
no spaces: data-scienceisfun
first word: data-science
word count: 3
joined: data-science-is-fun
length check: 19`,
      concepts: ["string methods", "split and join", "immutability"],
    },
    {
      id: "b-i3",
      tier: "intermediate",
      title: "The coffee order calculator",
      prompt:
        "Build a receipt calculator with clean f-string columns. The order: 3 espressos at 3.20 each, 2 lattes at 4.80 each, and 8.5% tax on the subtotal. Compute subtotal, tax, and total as three variables (one expression each, per lesson b-09), then print the title line and five rows: each item's amount, the subtotal, the tax, and the total. Every row must use f-string alignment specs — label padded to 14 characters on the left, amount right-aligned in an 8-character field with exactly two decimals — so all the money lines up in a column, exactly as shown.",
      hint: "Row pattern: print(f\"{'espresso x3':<14}{espresso_price * espresso_count:>8.2f}\") — the label is a string literal inside the braces, padded with :<14; the amount is an expression with :>8.2f. Tax is subtotal * tax_percent / 100.",
      starter: `espresso_price = 3.20
espresso_count = 3
latte_price = 4.80
latte_count = 2
tax_percent = 8.5

# TODO: compute subtotal, tax, and total
# TODO: print the title and five aligned rows with f-string specs
`,
      solution: `espresso_price = 3.20
espresso_count = 3
latte_price = 4.80
latte_count = 2
tax_percent = 8.5

subtotal = espresso_price * espresso_count + latte_price * latte_count
tax = subtotal * tax_percent / 100
total = subtotal + tax

print("=== COFFEE ORDER ===")
print(f"{'espresso x3':<14}{espresso_price * espresso_count:>8.2f}")
print(f"{'latte x2':<14}{latte_price * latte_count:>8.2f}")
print(f"{'subtotal':<14}{subtotal:>8.2f}")
print(f"{'tax 8.5%':<14}{tax:>8.2f}")
print(f"{'total':<14}{total:>8.2f}")
`,
      expectedOutput: `=== COFFEE ORDER ===
espresso x3       9.60
latte x2          9.60
subtotal         19.20
tax 8.5%          1.63
total            20.83`,
      concepts: ["f-string format specs", "arithmetic", "receipt formatting"],
    },
    {
      id: "b-i4",
      tier: "intermediate",
      title: "The simulated interview",
      prompt:
        "Interactive programs ask questions — but in this course's playground, YOU play the user by pre-setting the answers (lesson b-07's simulation pattern). The starter holds name (already text, as input() would return it) and birth_year_text (the STRING '2001', because input() always answers in text). Write the program: convert birth_year_text to a number, compute the age in the year 2026, then print the four lines exactly as shown — a title, the name, the age, and a greeting f-string, plus a final line showing next year's age.",
      hint: "This is the int(input()) pattern with the input() part simulated: birth_year = int(birth_year_text). The greeting uses an f-string: print(f\"Hello, {name}! You are {age} years old.\"). 2026 - 2001 is 25.",
      starter: `# Simulated user answers — input() would have returned these as text
name = "Rae"
birth_year_text = "2001"

# TODO: convert the birth year text to a number
# TODO: compute the age in 2026 and print the four lines
`,
      solution: `name = "Rae"
birth_year_text = "2001"

birth_year = int(birth_year_text)
age = 2026 - birth_year

print("=== INTERVIEW ===")
print("Name:", name)
print("Age:", age)
print(f"Hello, {name}! You are {age} years old.")
print("Next year you will be", age + 1)
`,
      expectedOutput: `=== INTERVIEW ===
Name: Rae
Age: 25
Hello, Rae! You are 25 years old.
Next year you will be 26`,
      concepts: ["input simulation", "type conversion", "f-strings"],
    },

    // ---- advanced
    {
      id: "b-a1",
      tier: "advanced",
      title: "The precedence gauntlet",
      prompt:
        "Six expressions, one ladder. Predict each result on paper BEFORE writing any code — walk lesson b-08's precedence ladder for every one: (1) 2 + 3 * 4 ** 2, (2) -2 ** 2, (3) 10 % 3 + 1, (4) 8 // 3 * 3, (5) 100 - 10 - 5, (6) not 5 > 3 or 2 > 1. Then write a program that prints all six results in order, one per line, matching the expected output exactly. Any prediction you missed, re-walk the ladder and say which rung you skipped.",
      hint: "Rung by rung: ** first (so #1 is 2 + 3 * 16), unary minus AFTER ** (so #2 is -(2 ** 2)), % and // before + and - and left to right within a rung (so #3 is (10 % 3) + 1 and #4 is (8 // 3) * 3), comparisons before not, and and/or last (so #6 is (not True) or True).",
      starter: `# PREDICT ALL SIX ON PAPER FIRST
# TODO: print each expression's result, one per line

`,
      solution: `print(2 + 3 * 4 ** 2)
print(-2 ** 2)
print(10 % 3 + 1)
print(8 // 3 * 3)
print(100 - 10 - 5)
print(not 5 > 3 or 2 > 1)
`,
      expectedOutput: `50
-4
2
6
85
True`,
      concepts: ["operator precedence", "unary minus", "and or not"],
    },
    {
      id: "b-a2",
      tier: "advanced",
      title: "Fix the broken types",
      prompt:
        "This movie-card program is a type disaster: it crashes on the first broken line (a TypeError from mixing text and numbers), and the last line has a deeper type bug hiding behind it. Run the starter, read the traceback bottom-up, and fix ONE thing at a time, re-running after each fix. The goal: a rating stored as TEXT must stay text where text is needed and become a NUMBER where math is needed — you decide which conversion goes where. The fixed program must print the four lines shown.",
      hint: "Line 2 mixes str and int: convert with str(runtime_minutes). The last line divides the text '8.7' by 2 — math needs a number: make rating_number = float(rating_text) first, then divide. The TypeError line tells you which line, and lesson b-06 tells you which converter.",
      starter: `movie_title = "The Python Diaries"
runtime_minutes = 108
rating_text = "8.7"

print("Movie: " + movie_title)
print("Runtime: " + runtime_minutes + " minutes")
print("Rating: " + rating_text + "/10")
print("Half of the rating:", rating_text / 2)
`,
      starterExpectError: "TypeError: can only concatenate str (not \"int\") to str",
      solution: `movie_title = "The Python Diaries"
runtime_minutes = 108
rating_text = "8.7"

print("Movie: " + movie_title)
print("Runtime: " + str(runtime_minutes) + " minutes")
print("Rating: " + rating_text + "/10")

rating_number = float(rating_text)
print("Half of the rating:", rating_number / 2)
`,
      expectedOutput: `Movie: The Python Diaries
Runtime: 108 minutes
Rating: 8.7/10
Half of the rating: 4.35`,
      concepts: ["debugging", "type conversion", "TypeError"],
    },
    {
      id: "b-a3",
      tier: "advanced",
      title: "The rounding investigator",
      prompt:
        "Banker's rounding has a pattern — find it. On paper, predict round(0.5), round(1.5), round(2.5), round(3.5), and round(4.5). Then predict the final two lines: round(2.675, 2) and the f-string f\"{2.675:.2f}\". Write a program that prints all seven results in order and — in comments — write the rule you observed for the .5 cases and the honest reason for the 2.675 lines (hint: it is lesson a-06's binary floating-point honesty). Output must match exactly.",
      hint: "Halves round to the nearest EVEN number: 0, 2, 2, 4, 4. And 2.675 is stored microscopically BELOW 2.675 in binary (2.6749...), so both round(x, 2) and the format spec see a value that rounds DOWN to 2.67.",
      starter: `# Predict all seven results on paper FIRST
# TODO: print round() of each .5 value, then the two 2.675 lines
# TODO: write your observed rule as comments

`,
      solution: `# The rule: Python rounds .5 to the nearest EVEN number.
# 0.5 -> 0, 1.5 -> 2, 2.5 -> 2, 3.5 -> 4, 4.5 -> 4.
# 2.675 is stored just below 2.675 in binary (like 0.1 + 0.2),
# so both round() and the format spec see 2.6749... and go down.

print(round(0.5))
print(round(1.5))
print(round(2.5))
print(round(3.5))
print(round(4.5))
print(round(2.675, 2))
print(f"{2.675:.2f}")
`,
      expectedOutput: `0
2
2
4
4
2.67
2.67`,
      concepts: ["banker's rounding", "floating-point", "round()"],
    },
    {
      id: "b-a4",
      tier: "advanced",
      title: "The digital clock",
      prompt:
        "Convert 7385 seconds into hours, minutes, and seconds using only // and % (the packaging pair from lesson b-03). Compute: hours (total // 3600), minutes (the leftover after removing whole hours, then // 60), and seconds (what remains after minutes). Prove your math two ways: rebuild the total from the parts (hours * 3600 + minutes * 60 + seconds) and print whether it equals the original; and check the value is a valid time of day with ONE chained comparison (0 <= total < 86400). Print the six lines exactly as shown.",
      hint: "minutes needs the remainder after removing whole hours: (total_seconds % 3600) // 60. seconds is total_seconds % 60. The chained comparison is one expression: 0 <= total_seconds < 86400. Rebuild and compare with ==.",
      starter: `total_seconds = 7385

# TODO: compute hours, minutes, and seconds with // and %
# TODO: rebuild the total from the parts
# TODO: print the six lines exactly as shown
`,
      solution: `total_seconds = 7385

hours = total_seconds // 3600
minutes = (total_seconds % 3600) // 60
seconds = total_seconds % 60

rebuilt = hours * 3600 + minutes * 60 + seconds

print(f"{total_seconds} seconds breaks down as:")
print(f"hours:   {hours}")
print(f"minutes: {minutes}")
print(f"seconds: {seconds}")
print("valid day-time:", 0 <= total_seconds < 86400)
print("rebuild check:", rebuilt == total_seconds)
`,
      expectedOutput: `7385 seconds breaks down as:
hours:   2
minutes: 3
seconds: 5
valid day-time: True
rebuild check: True`,
      concepts: ["// and %", "chained comparisons", "f-strings"],
    },
  ],

  assessment: [
    {
      id: "b-as-1",
      prompt: "Trace it: x = 10, then y = x, then x = x + 5, then print(x, y). What is the output?",
      options: [
        { text: "15 10", correct: true, feedback: "Correct: y copied what x pointed at (10), then x was re-pointed at 15 — labels, not boxes (lesson b-01)." },
        { text: "10 10", correct: false, feedback: "The third line re-points x: x + 5 is 15, so x is 15 when printed." },
        { text: "15 15", correct: false, feedback: "y made its own copy of the target at copy time — later reassignment of x cannot touch it." },
      ],
      explanation: "y = x copies the pointer to the value 10. Reassigning x afterward leaves y at 10: the output is '15 10'.",
    },
    {
      id: "b-as-2",
      prompt: "What does print(\"3\" * 2) output?",
      options: [
        { text: "6", correct: false, feedback: "That is the number personality of * — but \"3\" is text, not a number." },
        { text: "33", correct: true, feedback: "Correct: string * number REPEATS the string — lesson b-02's one-operator-two-meanings demo." },
        { text: "A TypeError", correct: false, feedback: "String * int is perfectly legal repetition — it is string + int that raises TypeError." },
      ],
      explanation: "* with a string repeats it: \"3\" * 2 is \"33\". Same symbol, meaning chosen by types.",
    },
    {
      id: "b-as-3",
      prompt: "What does print(19 // 4, 19 % 4) output?",
      options: [
        { text: "4.75 3", correct: false, feedback: "4.75 is what / gives. // keeps only the whole part." },
        { text: "4 3", correct: true, feedback: "Exactly: 19 // 4 is 4 (four whole 4s) and 19 % 4 is 3 (the leftover). The packaging pair." },
        { text: "5 0", correct: false, feedback: "That would be rounding UP — // floors, it does not round." },
      ],
      explanation: "// gives whole units (4), % gives the leftover (3): 19 = 4 * 4 + 3.",
    },
    {
      id: "b-as-4",
      prompt: "Which of these conversions raises an error?",
      options: [
        { text: "int(\"7\")", correct: false, feedback: "Whole-number-shaped text converts cleanly to the int 7." },
        { text: "float(\"2.5\")", correct: false, feedback: "float() is exactly the converter for decimal text: 2.5." },
        { text: "int(\"2.5\")", correct: true, feedback: "Correct — int() refuses text containing a dot: ValueError. Fix it in two steps: int(float(\"2.5\"))." },
        { text: "str(9)", correct: false, feedback: "str() never fails — everything has a text form: \"9\"." },
      ],
      explanation: "int() reads only whole-number text. Decimal text must pass through float() first — the two-step pattern from lesson b-06.",
    },
    {
      id: "b-as-5",
      prompt: "word = \"Python\", then word.upper(), then print(word). What prints?",
      options: [
        { text: "PYTHON", correct: false, feedback: "upper() returned a NEW string — but nothing stored it, so word never changed." },
        { text: "Python", correct: true, feedback: "Correct — strings are immutable: the method's result was discarded, and word keeps its original value." },
        { text: "An error — a method result must be assigned", correct: false, feedback: "Calling without capturing is legal; the new string is simply thrown away." },
      ],
      explanation: "Methods return new strings and never edit the original: word = word.upper() is how you keep the change.",
    },
    {
      id: "b-as-6",
      prompt: "Which ONE of these values is truthy?",
      options: [
        { text: "0", correct: false, feedback: "Zero is first on the falsy list — the emptiest of values." },
        { text: "\"0\"", correct: true, feedback: "Correct — it is a one-character STRING with content in it. Truthiness asks 'is something here?', not 'is this zero?'" },
        { text: "\"\" (the empty string)", correct: false, feedback: "No characters at all — textbook falsy." },
        { text: "None", correct: false, feedback: "None is the 'no value' value: always falsy." },
      ],
      explanation: "The falsy list is exactly five: False, 0, 0.0, \"\", [], None. The string \"0\" is NOT on it, so it is True.",
    },
    {
      id: "b-as-7",
      prompt: "What does 2 + 3 * 4 ** 2 evaluate to?",
      options: [
        { text: "50", correct: true, feedback: "Correct: ** first (16), then * (48), then + (50) — the ladder, walked exactly." },
        { text: "196", correct: false, feedback: "That is (2 + 3 * 4) ** 2 — grouping the whole left side first. The ladder does not do that." },
        { text: "80", correct: false, feedback: "That is (2 + 3) * 4 ** 2 — addition does not get to run before multiplication." },
        { text: "26", correct: false, feedback: "Walk the ladder again: powers first, then the times family, then addition." },
      ],
      explanation: "Precedence: 4 ** 2 is 16, 3 * 16 is 48, 2 + 48 is 50. Parentheses would let YOU choose otherwise.",
    },
    {
      id: "b-as-8",
      prompt: "A program runs answer = input(\"Age? \") and the user types 30. What is type(answer)?",
      options: [
        { text: "<class 'int'> — typed digits become numbers", correct: false, feedback: "The classic beginner assumption — and exactly why answer + 1 would crash with TypeError." },
        { text: "<class 'str'> — input() ALWAYS returns text", correct: true, feedback: "Correct: \"30\" the string. Math on it needs int(input(...)) — the universal pattern from lesson b-07." },
        { text: "<class 'float'>", correct: false, feedback: "No number types ever come out of input() — text, always." },
      ],
      explanation: "input() answers in text, no matter what was typed. int(input()) is the bridge to numbers — and it raises ValueError on non-numeric answers.",
    },
  ],

  project: {
    title: "The Unit Converter",
    brief:
      "You will build a complete conversion report program — the first program in this course that produces a formatted, sectioned, professional-looking document rather than a loose list of prints. It converts a batch of hardcoded measurements across three domains: temperatures (Celsius, Fahrenheit, Kelvin), distances (kilometers, miles), and weights (kilograms, pounds), then renders everything in a report with a centered banner, section headers, and right-aligned numbers with fixed decimal places. Every value is hardcoded as a variable (the lesson b-07 simulation pattern), so the program runs identically on your machine and in the course playground — and it exercises everything Part B taught: variables, expressions, arithmetic, f-string format specs, comments, and the edit-save-run loop.",
    requirements: [
      "A docstring at the very top stating what the program is, in one sentence",
      "All data hardcoded as clearly named snake_case variables — no input() anywhere, so the program runs in the browser playground",
      "At least five conversions, each computed into its own variable with ONE expression: C to F (x * 9 / 5 + 32), C to K (x + 273.15), F to C ((x - 32) * 5 / 9), km to mi (x * 0.621371), kg to lb (x * 2.204624)",
      "A report banner: a line of = repeated 40 times, the title centered in 40 characters, then another = line",
      "Three section headers (Temperatures, Distances, Weights) with each conversion printed on its own line",
      "Every temperature line formatted with one decimal place; every distance and weight line with two decimal places — all via f-string format specs, not round()",
      "A closing summary line, built with an f-string, reporting how many conversions the report contains",
      "At least three comments that explain WHY (the shape of a formula, where a conversion factor comes from, why a format spec was chosen) — comment the why, not the what",
    ],
    steps: [
      "Step 1 — Create the file: make unit_converter.py in your pycourse folder, write the docstring first, save, and run it. A program that prints nothing but exits cleanly is a working baseline.",
      "Step 2 — Hardcode the data: add celsius (25.0), fahrenheit (98.6), kilometers (21.3), and kilograms (75.5) as variables. Print each one, run, then delete the debug prints.",
      "Step 3 — Convert one at a time: compute the C to F conversion first and print it. Verify 25.0 C gives 77.0 F by hand before continuing — one conversion, one run, per the small-steps habit.",
      "Step 4 — Finish the math: add C to K, F to C, km to mi, and kg to lb, each as ONE named expression. Run after each and sanity-check: 98.6 F should come back as 37.0 C.",
      "Step 5 — Build the banner: print(\"=\" * 40), then the title centered in 40 (use .center(40)), then the = line again. Run and check the alignment before writing the body.",
      "Step 6 — Print the sections: for each domain, a section header, then one f-string line per conversion with the required decimal places (:.1f for temperatures, :.2f for the rest).",
      "Step 7 — Add the summary line and the three WHY comments. Read the whole report top to bottom: every line should look finished.",
      "Step 8 — The review pass: reread the program as lesson a-08 taught (trace it), fix wording and alignment, run one final time, and show someone the report.",
    ],
    starter: `"""Unit converter — a formatted report of temperature, distance, and weight conversions."""

# ---------- Section 1: temperatures (C / F / K) ----------
celsius = 25.0
fahrenheit = 98.6

# TODO: compute c_to_f  (multiply by 9/5, add 32)

# TODO: compute f_to_c  (subtract 32, multiply by 5/9)

# TODO: compute c_to_k  (add 273.15)


# ---------- Section 2: distances (km / mi) ----------
kilometers = 21.3

# TODO: compute km_to_mi  (multiply by 0.621371)


# ---------- Section 3: weights (kg / lb) ----------
kilograms = 75.5

# TODO: compute kg_to_lb  (multiply by 2.204624)


# ---------- Section 4: the formatted report ----------
# TODO: banner — a line of = repeated 40, title centered in 40, another = line
# TODO: three section headers, one f-string line per conversion
#       (:.1f for temperatures, :.2f for distances and weights)
# TODO: a closing summary line that counts the conversions
`,
    concepts: ["variables", "expressions", "f-string format specs", "comments", "report formatting"],
    extension:
      "Add the reverse conversions — miles back to kilometers, pounds back to kilograms — and print whether each round trip returns to the original value. Naive == on the results teaches lesson a-06's lesson the hard way, so compare with round(converted_back, 2) == round(original, 2) instead, and add one comment explaining WHY exact == fails here. Then add a second temperature reading and print both, comparing them with one chained comparison (e.g. is 25.0 <= reading <= 30.0).",
  },
};
