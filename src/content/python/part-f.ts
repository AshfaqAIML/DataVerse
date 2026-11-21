/**
 * PART F — FUNCTIONS
 *
 * The great leap from scripts to reusable building blocks: defining and
 * calling functions, parameters and arguments, return values (return is not
 * print), scope, lambdas, recursion, and higher-order functions.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Code blocks that deliberately crash carry `expectError` with the exact
 * final error line instead.
 */
import type { Part } from "@/lib/course/types";

export const PART_F: Part = {
  letter: "F",
  title: "Functions",
  tagline: "Packaging logic into reusable building blocks",
  description:
    "Defining functions, parameters, arguments, return values, scope, lambdas, recursion, and higher-order functions.",
  lessons: [
    // ------------------------------------------------------------- f-01
    {
      slug: "f-01",
      title: "Defining Functions",
      minutes: 15,
      summary:
        "Turn any block of Python into a named, reusable command: the def statement, naming rules, docstrings, and the jump-and-return dance of every function call.",
      kind: "coding",
      objectives: [
        "Define a function with def, a name, parentheses, and an indented body",
        "Call a function by its name plus parentheses — as many times as you like",
        "Trace the call flow: the program jumps into the function, runs it top to bottom, and comes back",
        "Write a one-line docstring and read it back with help()",
      ],
      why: "Every program you have written so far runs top to bottom once, and every line of logic lives exactly where it happens. The moment you want the same job done twice — greet every user, format every price, convert every temperature — copy-paste starts to multiply, and every copy becomes a bug you have to fix in five places. A function lets you write the job once, give it a name, and run it by name forever after. This is the biggest single leap in the course: from scripts that do things to building blocks you compose.",
      blocks: [
        {
          kind: "text",
          text: "You have probably noticed it already: in your Part D and E programs, some chunks of code felt like the *same job* appearing twice — a banner printed before and after a report, a total formatted the same way for three different lists. You copied the lines, pasted them, maybe changed a number. It worked. It always works — until the format changes and you have to find and fix all five copies, and miss the sixth.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The recipe card on the cafe wall",
          text: "A cafe does not write a new recipe for every customer. It writes one card — *espresso: grind, tamp, extract* — pins it where the baristas can see it, and every order follows the same card. A function is your recipe card: written once, pinned to the wall with a name, executed every time someone calls that name.",
        },
        {
          kind: "heading",
          text: "Your first function",
        },
        {
          kind: "code",
          title: "Define once, call twice",
          code: `def greet():
    """Print a friendly welcome message."""
    print("Welcome to DataVerse Academy!")
    print("Let's write some Python.")


greet()
greet()
`,
          output: `Welcome to DataVerse Academy!
Let's write some Python.
Welcome to DataVerse Academy!
Let's write some Python.`,
          explain: [
            "The `def` block creates a function named `greet` — and does nothing else. Python reads it, files it away, and moves on.",
            "Each `greet()` line is a **call**: jump into the body, run it top to bottom, come back. Two calls, two identical greetings, one recipe.",
          ],
        },
        {
          kind: "visual",
          title: "Anatomy of the def statement",
          ascii: `def greet():
 |   |      |
 |   |      +-- parentheses: empty for now (inputs arrive in lesson f-02)
 |   +--------- name: how you will call it (snake_case, says what it does)
 +------------- def: "define a function and remember it under this name"
     """Print a friendly welcome message."""  <-- docstring: the manual line
     print("Welcome to DataVerse Academy!")   <-- body: indented 4 spaces,
     print("Let's write some Python.")            runs only when called
`,
          caption:
            "Same skeleton as if and for from Parts C and D: a header line ending in a colon, then an indented body. The body belongs to the function.",
        },
        {
          kind: "text",
          text: "Here is the sentence worth reading twice: **defining a function runs nothing**. Python stores the recipe and continues past it. The body executes only when a **call** arrives — the name followed by `()`. Those parentheses are the go button: `greet` is just the name of the recipe, `greet()` is *make it now*.",
        },
        {
          kind: "heading",
          text: "The call flow: jump in, run, come back",
        },
        {
          kind: "code",
          title: "Watching control jump and return",
          code: `def brew_tea():
    """Pretend to brew one cup of tea."""
    print("  [inside brew_tea] boiling the water")
    print("  [inside brew_tea] steeping the bag")
    print("  [inside brew_tea] cup is ready")


print("Program starts")
brew_tea()
print("Program continues")
brew_tea()
print("Program ends")
`,
          output: `Program starts
  [inside brew_tea] boiling the water
  [inside brew_tea] steeping the bag
  [inside brew_tea] cup is ready
Program continues
  [inside brew_tea] boiling the water
  [inside brew_tea] steeping the bag
  [inside brew_tea] cup is ready
Program ends`,
          explain: [
            "Read the output as a story of control: the program starts at the top level, *jumps* into `brew_tea` at the first call, runs its three lines, then *returns* to the exact line after the call.",
            "The second call replays the same recipe from its first line. Nothing about the function remembers the first cup — each call starts fresh (a fact that becomes a superpower in lesson f-05).",
          ],
        },
        {
          kind: "visual",
          title: "One call, one round trip",
          ascii: `Top level (your file, read top to bottom)
 |
 +-- print("Program starts")
 |
 +-- brew_tea() --- jump in ---> [brew_tea's body]
 |                                  boiling the water
 |                                  steeping the bag
 |                                  cup is ready
 |                  back out <---- return (body finished)
 +-- print("Program continues")
 |
 +-- brew_tea() --- jump in ---> [same body, from its first line]
 |                  back out <---- return
 +-- print("Program ends")
`,
          caption:
            "Jump in at the call, run the body top to bottom, come back to the line after the call. Every function call in every Python program works exactly like this.",
        },
        {
          kind: "heading",
          text: "Docstrings: a manual inside the function",
        },
        {
          kind: "text",
          text: "That triple-quoted string right under the `def` line is a **docstring** — documentation that lives inside the function itself. Python can read it back for you, with the same `help()` you met in lesson a-06:",
        },
        {
          kind: "code",
          title: "help() reads the docstring",
          code: `def greet():
    """Print a friendly welcome message to a new student."""
    print("Welcome to DataVerse Academy!")


help(greet)
`,
          output: `Help on function greet in module __main__:

greet()
    Print a friendly welcome message to a new student.`,
          explain: [
            "`help(greet)` prints the function's signature — its name and (empty) parentheses — followed by your docstring.",
            "This is the professional habit: one line saying what the function does. You will write docstrings in every function from now on, and the mini project will not accept one without.",
          ],
        },
        {
          kind: "table",
          title: "Naming functions at a glance",
          headers: ["Rule", "Good", "Avoid"],
          rows: [
            ["Lowercase words joined with underscores (snake_case)", "format_price, count_vowels", "FormatPrice, formatprice"],
            ["Say what it does — verbs for actions", "brew_tea, greet_user", "data, thing2, myfunc"],
            ["Start with a letter or underscore", "average, _hidden", "2fast (a digit cannot come first)"],
            ["Never a Python keyword", "greet_user", "def, class, if, return"],
          ],
          caption:
            "Same naming rules you learned for variables in Part A — a function name is just a name, so it follows the same discipline.",
        },
        {
          kind: "heading",
          text: "Define before you call",
        },
        {
          kind: "text",
          text: "Python reads your file top to bottom, line by line — and a call needs the name to exist *at the moment the call runs*. Put the call above the definition and Python has never heard of the name yet:",
        },
        {
          kind: "code",
          title: "Calling too early",
          expectError: "NameError: name 'cheer' is not defined",
          code: `cheer()

def cheer():
    """Print a cheering message."""
    print("Go team, go!")


cheer()
`,
          explain: [
            "The first `cheer()` crashes with a NameError: at that point in the file, `cheer` does not exist yet. The `def` line below comes too late.",
            "The fix is structural: define your functions at the top of the file, then do the calling underneath — which is exactly how every code block in this part is laid out, and how the browser playground runs your code.",
          ],
        },
        {
          kind: "tryIt",
          title: "Write your first function",
          task: "Run this as-is, then make it yours: change the motto text, change the banner width (the 26), and add a third print line inside the body. Finally add a third call underneath and run again — one recipe, three executions.",
          code: `# Define a function that prints your motto inside a banner, then call it.
def print_motto():
    """Print a personal motto inside a banner."""
    print("=" * 26)
    print("Code a little every day")
    print("=" * 26)


print_motto()
print_motto()
`,
          hint: "The body is everything indented under the def line. Changing the body once changes every call — that is the whole point.",
        },
      ],
      terms: [
        { term: "Function", definition: "A named, reusable block of code: written once with def, executed whenever its name is called." },
        { term: "Definition (def)", definition: "The statement that creates a function — name, parentheses, colon, indented body. Defining runs nothing." },
        { term: "Call", definition: "The act of running a function: its name followed by parentheses, like greet(). Control jumps in, runs the body, and returns." },
        { term: "Body", definition: "The indented lines under the def statement — the recipe itself, executed only when the function is called." },
        { term: "Docstring", definition: "A triple-quoted string on the first line of the body that documents what the function does; readable via help()." },
      ],
      mistakes: [
        {
          mistake: "Writing greet on a line by itself and expecting the greeting to print.",
          why: "Without parentheses, greet is just a reference to the function — a value sitting there doing nothing. In a file, a bare expression line runs silently.",
          fix: "Parentheses are the go button: write greet() to execute the body.",
        },
        {
          mistake: "Calling the function above its def line.",
          why: "Python executes top to bottom; at the call, the name has not been created yet, so it raises NameError.",
          fix: "Define functions at the top of the file, write the calls underneath.",
        },
        {
          mistake: "Forgetting the colon after def greet() or the 4-space indentation of the body.",
          why: "def is a compound statement like if and for: Python expects a colon, then an indented block.",
          fix: "Type the colon, press Enter, let your editor indent the body one level (4 spaces), exactly like a loop body.",
        },
      ],
      takeaways: [
        "def writes the recipe once; the name plus parentheses — greet() — cooks it, once per call.",
        "Defining a function runs nothing. The body executes only at a call, top to bottom, then control returns to the line after it.",
        "Write the body once and call it forever: three calls means three executions of one recipe, not three copies.",
        "Define before you call — Python reads your file from the top.",
        "A one-line docstring is the professional minimum; help() reads it back to anyone who asks.",
      ],
      quiz: [
        {
          id: "f-01-q1",
          prompt: "Python reads a file containing def greet(): and its body, but no call anywhere. What happens?",
          options: [
            { text: "Python stores the function under the name greet and prints nothing", correct: true, feedback: "Exactly — a definition is a filing action, not an execution. No call, no output." },
            { text: "Python runs the body once to check it works", correct: false, feedback: "Tempting, but defining never executes the body — only a call does." },
            { text: "Python raises an error, because an uncalled function is dead code", correct: false, feedback: "An uncalled function is useless, not illegal. Python files it away silently." },
          ],
          explanation: "Definitions run nothing. The body executes only when a call — greet() — arrives.",
        },
        {
          id: "f-01-q2",
          prompt: "Which line actually RUNS the body of a function named greet?",
          options: [
            { text: "def greet():", correct: false, feedback: "That line creates the function; it does not run it." },
            { text: "greet()", correct: true, feedback: "Correct — name plus empty parentheses is the call, the go button." },
            { text: "greet", correct: false, feedback: "No parentheses means no call — that is just the function's name, doing nothing." },
          ],
          explanation: "greet is the recipe card; greet() is the order. The parentheses make it happen.",
        },
        {
          id: "f-01-q3",
          prompt: "help(greet) prints…",
          options: [
            { text: "The docstring — the triple-quoted string at the top of the body — with the function's signature", correct: true, feedback: "Right: the manual entry is built from your own docstring." },
            { text: "The function's code, line by line", correct: false, feedback: "help() shows documentation, not source code." },
            { text: "Nothing — help() only works on built-in functions like len()", correct: false, feedback: "help() works on almost anything, including the functions you write." },
          ],
          explanation: "Docstring in, manual out: help(greet) prints the signature plus your one-line description.",
        },
      ],
    },
    // ------------------------------------------------------------- f-02
    {
      slug: "f-02",
      title: "Parameters",
      minutes: 14,
      summary:
        "Give your functions dials to turn: parameters as named placeholders in the definition, multiple parameters, why order matters, and the parameter-versus-argument distinction everyone trips over.",
      kind: "coding",
      objectives: [
        "Add parameters to a function definition and use them inside the body",
        "Pass arguments positionally and predict exactly where each one lands",
        "Tell a parameter from an argument without hesitating",
        "Explain why parameter names are private to the function",
      ],
      why: "A function without parameters is a button that does one exact thing. Useful — but the moment you want greet('Ada') and greet('Grace') from the same recipe, you need the function to accept input. Parameters are how a definition leaves blanks to be filled at each call, and they turn your functions from fixed actions into general-purpose machines. Getting the parameter/argument vocabulary straight now also saves you from the classic confusion later, when documentation and error messages start using both words in the same sentence.",
      blocks: [
        {
          kind: "text",
          text: "The `greet()` from f-01 has a flaw: every call prints the *same* two lines. Real greetings are aimed at someone. Real price tags carry different items. The fix is one small addition to the definition — a **parameter**, a named blank that each call fills in.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The form you photocopy",
          text: "Think of a form letter: *Dear ______, your order ______ ships on ______.* The printed blanks are fixed forever; what you write into them changes per person. A parameter is a printed blank in the recipe; the call is you filling it in.",
        },
        {
          kind: "heading",
          text: "Your first parameter",
        },
        {
          kind: "code",
          title: "One recipe, three different results",
          code: `def greet(name):
    """Greet the person whose name arrives in the call."""
    print(f"Hello, {name}! Welcome aboard.")


greet("Ada")
greet("Grace")
greet("Linus")
`,
          output: `Hello, Ada! Welcome aboard.
Hello, Grace! Welcome aboard.
Hello, Linus! Welcome aboard.`,
          explain: [
            "`name` in the parentheses is a parameter: a variable that exists only inside `greet`, empty until a call happens.",
            "At `greet(\"Ada\")`, the value `\"Ada\"` lands in `name`, then the body runs with `name` meaning `\"Ada\"`. Same recipe, different filling, every call.",
          ],
        },
        {
          kind: "heading",
          text: "Multiple parameters — order matters",
        },
        {
          kind: "text",
          text: "Functions often need more than one input. List the parameters in the definition, separated by commas, and pass the values in the **same order** at the call: first argument to first parameter, second to second. Python does not check that your order *makes sense* — only that the counts line up. Swap two arguments and you get confident nonsense instead of an error:",
        },
        {
          kind: "code",
          title: "Positional matching, and what happens when you swap it",
          code: `def introduce(name, age):
    """Print a one-line introduction."""
    print(f"{name} is {age} years old")


introduce("Ada", 36)
introduce(36, "Ada")
`,
          output: `Ada is 36 years old
36 is Ada years old`,
          explain: [
            "First call: `\"Ada\"` lands in `name`, `36` lands in `age` — exactly as intended.",
            "Second call: the values arrive in the same positions, so `36` lands in `name`. No crash, no warning — just a sentence no human would write. Wrong-order bugs are silent; checking the definition's order is your job.",
          ],
        },
        {
          kind: "table",
          title: "Parameter vs argument — the classic confusion, settled",
          headers: ["", "Parameter", "Argument"],
          rows: [
            ["Where it lives", "In the definition", "In the call"],
            ["What it is", "A named placeholder, empty until a call", "The real value that fills the placeholder"],
            ["Looks like", "def greet(name):", "greet(\"Ada\")"],
            ["Exists", "Inside the function, during a call", "Wherever you write it, at call time"],
          ],
          caption:
            "Mnemonic: the parameter is the parking spot; the argument is the car that parks in it. The spot is paved once — many different cars over time.",
        },
        {
          kind: "heading",
          text: "Parameter names live only inside the function",
        },
        {
          kind: "text",
          text: "The parameter `name` belongs to `greet`'s world. It springs into existence when a call starts and vanishes when the body ends. From outside the function, that name simply does not exist:",
        },
        {
          kind: "code",
          title: "Asking for name from the outside",
          expectError: "NameError: name 'name' is not defined",
          code: `def greet(name):
    """Greet the person whose name arrives in the call."""
    print(f"Hello, {name}!")


greet("Ada")
print(name)
`,
          explain: [
            "The call works and prints the greeting — `name` existed *inside* it. Then `print(name)` at the top level crashes: from out here, `name` was never defined.",
            "This is not a bug to work around; it is a feature, and lesson f-05 turns it into a superpower.",
          ],
        },
        {
          kind: "code",
          title: "Same parameter name, two functions, zero collisions",
          code: `def greet_guest(name):
    """Greet a guest arriving at the door."""
    print(f"Welcome, {name}! Come on in.")


def greet_patient(name, room):
    """Greet a patient and tell them their room is ready."""
    print(f"Hello {name}, room {room} is ready for you")


greet_guest("Ada")
greet_patient("Grace", 12)
`,
          output: `Welcome, Ada! Come on in.
Hello Grace, room 12 is ready for you`,
          explain: [
            "Both functions use a parameter called `name` — and they never collide, because each function's parameters live in that function's own private space.",
            "A hundred functions can all have a parameter called `name` or `price`. The name means one thing inside its function and nothing anywhere else.",
          ],
        },
        {
          kind: "text",
          text: "That privacy is exactly what makes functions safe to combine. When you call `greet_patient(\"Grace\", 12)`, the `12` lands in *its* `room` parameter — it cannot leak into any other function, no matter how many exist in the file. Each call is a sealed envelope.",
        },
        {
          kind: "tryIt",
          title: "Build a shouting machine",
          task: "Run this as-is, then experiment: try shout(\"yes\", 5). Add a third parameter punctuation (say, \".\" or \"?\") and use it instead of the \"!\". Predict each change before you run it — parameter tracing is a skill, and predictions are its practice.",
          code: `def shout(word, times):
    """Print the word in CAPITALS plus '!', \`times\` times."""
    for i in range(times):
        print(word.upper() + "!")


shout("go", 3)
`,
          hint: "The for loop comes from Part D; range(times) repeats the body that many times. With a third parameter, the call needs a third argument: shout(\"wait\", 2, \"?\").",
        },
      ],
      terms: [
        { term: "Parameter", definition: "A named placeholder in a function definition — a variable that exists only inside that function, filled at each call." },
        { term: "Argument", definition: "The actual value passed in a call. greet(\"Ada\") passes the argument \"Ada\" into the parameter name." },
        { term: "Positional matching", definition: "The default rule for calls: the first argument fills the first parameter, the second fills the second, and so on." },
        { term: "Binding", definition: "The moment a call starts and each argument value is assigned to its parameter — like a form being filled in." },
      ],
      mistakes: [
        {
          mistake: "Swapping two arguments of the same type (two strings, two numbers) and not noticing.",
          why: "Positional matching fills slots mechanically; if the types still fit, Python prints plausible nonsense instead of raising an error.",
          fix: "Check the call against the definition's order every time. For calls where order is easy to get wrong, keyword arguments (lesson f-03) let you name the slots.",
        },
        {
          mistake: "Using the words parameter and argument interchangeably, then losing the thread of documentation.",
          why: "Python's own docs and error messages use both words precisely; if they blur together, sentences like 'keyword argument follows positional argument' become unreadable.",
          fix: "Parameter = placeholder in the definition. Argument = real value in the call. Say it a few times; it sticks.",
        },
        {
          mistake: "Trying to use a parameter name outside its function, like print(name) after greet(\"Ada\").",
          why: "Parameters exist only during a call, inside the function's own space. Outside, the name was never defined — NameError.",
          fix: "If you need the value outside, have the function return it (lesson f-04) and store the result in a variable you own.",
        },
      ],
      takeaways: [
        "A parameter is a named blank in the definition; an argument is the value a call writes into it.",
        "First argument to first parameter, second to second — positional matching, every single time.",
        "Swapped arguments usually produce no error at all — just quietly wrong output. Order is on you.",
        "Parameter names are private: born at the call, gone at the return, invisible from outside.",
        "Many functions can reuse the same parameter name — privacy means zero collisions.",
      ],
      quiz: [
        {
          id: "f-02-q1",
          prompt: "In def format_price(item, price): — what are item and price?",
          options: [
            { text: "Parameters: named placeholders that exist inside the function", correct: true, feedback: "Correct — they are blanks waiting to be filled by a call." },
            { text: "Arguments: the values passed when the function is called", correct: false, feedback: "Close, but arguments live at the call site, not in the definition." },
            { text: "Global variables the function requires to exist", correct: false, feedback: "No globals involved — parameters are filled fresh at every call." },
          ],
          explanation: "In the definition they are parameters; the values that fill them arrive as arguments at each call.",
        },
        {
          id: "f-02-q2",
          prompt: "Given def introduce(name, age):, what does the call introduce(\"Ada\", 36) do?",
          options: [
            { text: "name gets \"Ada\", age gets 36 — first to first, second to second", correct: true, feedback: "Exactly — that is positional matching." },
            { text: "name gets 36, age gets \"Ada\" — Python sorts them by type", correct: false, feedback: "Python never reorders for you; slots are filled strictly by position." },
            { text: "A TypeError, because a string came first", correct: false, feedback: "No rule was broken — strings and numbers can land in any parameter; only order matters." },
          ],
          explanation: "Positional matching is mechanical: argument 1 to parameter 1, argument 2 to parameter 2.",
        },
        {
          id: "f-02-q3",
          prompt: "After running greet(\"Ada\") with def greet(name): ..., what does print(name) at the top level do?",
          options: [
            { text: "Prints Ada — the value is still around from the call", correct: false, feedback: "The parameter vanished when the call ended; nothing was left behind." },
            { text: "Raises NameError — name exists only inside greet, during a call", correct: true, feedback: "Correct — parameters are private and temporary." },
            { text: "Prints None, because name was used up", correct: false, feedback: "Values are not 'used up' — the name simply does not exist at the top level." },
          ],
          explanation: "Parameter names live inside their function and only for the duration of a call. Outside, they were never defined.",
        },
      ],
    },
    // ------------------------------------------------------------- f-03
    {
      slug: "f-03",
      title: "Arguments",
      minutes: 17,
      summary:
        "Three ways to hand values to a function — positional, keyword (name=value), and defaults — plus *args for any-number-of-values, and the classic mutable-default trap.",
      kind: "coding",
      objectives: [
        "Call functions with keyword arguments to name the slots you are filling",
        "Define parameters with default values and know exactly when each default applies",
        "Apply the mixing rule: positional arguments before keyword arguments",
        "Write a function that accepts any number of arguments with *args",
        "Recognize the mutable-default bug and write the None fix",
      ],
      why: "Positional-only calling works, but it gets fragile fast: by the time a function takes four values, every call is a memory test — was it (size, milk, shots) or (milk, size, shots)? Keyword arguments let calls say what they mean. Defaults let most calls stay short while special ones override. And *args removes the ceiling on how many values a call can carry. These three tools plus one famous gotcha are the difference between functions that are pleasant to call and functions you fear.",
      blocks: [
        {
          kind: "text",
          text: "So far every call has been **positional**: values in order, slots filled left to right. That is one of three tools Python gives you. The second is the **keyword argument** — writing `name=value` at the call so the value lands in a named slot, in any order you like. The third is the **default value** — a parameter that fills itself when the call leaves it out.",
        },
        {
          kind: "heading",
          text: "Keyword arguments: name the slot at the call",
        },
        {
          kind: "code",
          title: "Three calls, one function, growing clarity",
          code: `def introduce(name, age, city):
    """Print a one-line introduction."""
    print(f"{name}, age {age}, from {city}")


introduce("Ada", 36, "London")
introduce(city="London", name="Ada", age=36)
introduce("Grace", 45, city="New York")
`,
          output: `Ada, age 36, from London
Ada, age 36, from London
Grace, age 45, from New York`,
          explain: [
            "Call 1 is pure positional — what you already know.",
            "Call 2 is pure keyword: order no longer matters, because each value says which slot it belongs to. `36` cannot accidentally land in `name`.",
            "Call 3 mixes both styles — and that mix has one strict rule, coming in a moment.",
          ],
        },
        {
          kind: "heading",
          text: "Default values: parameters that fill themselves",
        },
        {
          kind: "text",
          text: "Some parameters almost always get the same value. A **default** in the definition lets the call skip them entirely: leave the slot empty and the default steps in; fill it and your value wins. One rule: parameters with defaults must come *after* the plain ones — Python fills positions left to right and needs to know where the required slots end.",
        },
        {
          kind: "code",
          title: "One required parameter, two optional ones",
          code: `def make_coffee(size, milk="regular", shots=1):
    """Print one line describing a coffee order."""
    print(f"{size} coffee | {milk} milk | {shots} shot(s)")


make_coffee("large")
make_coffee("small", "oat")
make_coffee("medium", shots=3)
make_coffee("espresso", "none", 2)
`,
          output: `large coffee | regular milk | 1 shot(s)
small coffee | oat milk | 1 shot(s)
medium coffee | regular milk | 3 shot(s)
espresso coffee | none milk | 2 shot(s)`,
          explain: [
            "Call 1 fills only `size`; both defaults apply. Call 2 overrides `milk` positionally. Call 3 overrides `shots` by keyword — skipping over `milk` without touching it. Call 4 fills everything.",
            "Read each line of the output against its call. This is the everyday texture of calling well-designed functions: short calls for common cases, explicit ones for special cases.",
          ],
        },
        {
          kind: "heading",
          text: "The mixing rule: positional before keyword",
        },
        {
          kind: "text",
          text: "You may mix the two styles in one call with a single, strict ordering rule: **all positional arguments first, then all keyword arguments**. Python refuses the other order at the grammar level — this is one of the few mistakes it stops before the program even starts:",
        },
        {
          kind: "code",
          title: "Keyword first — Python will not even run this",
          expectError: "SyntaxError: positional argument follows keyword argument",
          code: `def introduce(name, age, city):
    """Print a one-line introduction."""
    print(f"{name}, age {age}, from {city}")


introduce(name="Ada", 36, "London")
`,
          explain: [
            "A SyntaxError, not a runtime error: Python reads the whole file before running any of it, sees `36` arriving after the keyword argument, and refuses to start. Nothing prints at all.",
            "The fix is to reorder: `introduce(\"Ada\", 36, city=\"London\")` — positional first, keyword after.",
          ],
        },
        {
          kind: "table",
          title: "The four ways to pass a value",
          headers: ["Style", "Where it is set", "Example", "Best for"],
          rows: [
            ["Positional", "At the call, by order", "make_coffee(\"large\")", "Short, obvious calls"],
            ["Keyword", "At the call, by name", "make_coffee(\"large\", shots=3)", "Skipping slots, self-documenting calls"],
            ["Default", "In the definition", "def make_coffee(size, shots=1):", "Values that are usually the same"],
            ["*args", "In the definition", "def add_all(*numbers):", "Calls with any number of values"],
          ],
          caption:
            "You will mix all four freely within weeks. The pattern to internalize: required things positional, optional things defaulted, keyword arguments when a call needs to be explicit.",
        },
        {
          kind: "heading",
          text: "Any number of arguments: *args",
        },
        {
          kind: "code",
          title: "A function that never asks how many",
          code: `def add_all(*numbers):
    """Add up every number that arrives, however many there are."""
    total = 0
    for n in numbers:
        total = total + n
    print("Numbers received:", numbers)
    print("Sum:", total)


add_all(1, 2)
add_all(10, 20, 30, 40)
add_all()
`,
          output: `Numbers received: (1, 2)
Sum: 3
Numbers received: (10, 20, 30, 40)
Sum: 100
Numbers received: ()
Sum: 0`,
          explain: [
            "The `*` before the parameter name tells Python: *collect every positional argument of this call into `numbers`*. Two values, four values, zero values — the function does not care.",
            "Look at what `numbers` holds each time: a **tuple** — the fixed-order collection you met in lesson e-02. `*args` is packing, live. (The conventional name is `args`, but the star is what does the work — `*numbers` is the same mechanism, named honestly.)",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The classic gotcha: a mutable default",
          text: "Python creates a default value ONCE — at the moment it reads the def line. If that default is a list, every call that skips the argument shares THE SAME list, forever. This is the most famous beginner trap in all of Python; see it once now so you recognize it for life.",
        },
        {
          kind: "code",
          title: "The bug: the default list remembers",
          code: `def add_task(task, tasks=[]):
    """Add a task to the list. (BROKEN: the default list remembers!)"""
    tasks.append(task)
    print("Tasks:", tasks)


add_task("buy milk")
add_task("walk the dog")
`,
          output: `Tasks: ['buy milk']
Tasks: ['buy milk', 'walk the dog']`,
          explain: [
            "The second call printed BOTH tasks. The first task was never removed — the call after it just reused the same default list, because both calls skipped the argument and landed on the one list created at def time.",
            "A fresh call, a fresh start? Not with a mutable default. The list is attached to the function itself, not to the call.",
          ],
        },
        {
          kind: "code",
          title: "The fix: default to None, build inside",
          code: `def add_task(task, tasks=None):
    """Add a task to a FRESH list unless one is passed in."""
    if tasks is None:
        tasks = []
    tasks.append(task)
    print("Tasks:", tasks)


add_task("buy milk")
add_task("walk the dog")
add_task("call mom", ["water the plants"])
`,
          output: `Tasks: ['buy milk']
Tasks: ['walk the dog']
Tasks: ['water the plants', 'call mom']`,
          explain: [
            "`None` is immutable, so sharing it between calls is harmless. Inside, the function checks (read `tasks is None` as *is it still the default?*) and builds a fresh list exactly when needed.",
            "Third call: when a list IS passed in, the function uses yours and appends to it — that behavior is often exactly right, and now it is deliberate instead of accidental.",
          ],
        },
        {
          kind: "tryIt",
          title: "Play with defaults and keywords",
          task: "Predict all three lines before running. Then add a fourth parameter discount=0 that subtracts its percentage from the total (total = total - total * discount / 100), and make one call that uses it with a keyword argument.",
          code: `def print_receipt_line(item, price, quantity=1):
    """Print one receipt line. quantity defaults to 1."""
    total = price * quantity
    print(f"{item} x{quantity} = \${total:.2f}")


print_receipt_line("Coffee", 4.5)
print_receipt_line("Tea", 3.25, quantity=3)
print_receipt_line("Cake", 5.0, 2)
`,
          hint: "Follow the rule you just learned: quantity=1 and discount=0 must come AFTER price in the definition — plain parameters first, defaulted ones after.",
        },
      ],
      terms: [
        { term: "Keyword argument", definition: "An argument passed as name=value at the call, filling that named parameter regardless of position. Example: make_coffee(\"large\", shots=3)." },
        { term: "Default value", definition: "A fallback value written in the definition (def f(x, y=10):) that applies whenever the call leaves that parameter out." },
        { term: "Arbitrary arguments (*args)", definition: "A parameter written with a star that collects all remaining positional arguments of a call into a tuple. One definition, any number of values." },
        { term: "Mutable default", definition: "The trap of using a list or dict as a default value: it is created once at def time and shared by every call that skips the argument." },
      ],
      mistakes: [
        {
          mistake: "Writing a keyword argument before a positional one: introduce(name=\"Ada\", 36).",
          why: "It is a grammar violation, not a runtime problem — Python cannot know which positional slot 36 belongs to after names started, so it refuses to run anything.",
          fix: "Positional arguments first, keyword arguments after: introduce(\"Ada\", age=36).",
        },
        {
          mistake: "Putting a plain parameter after a defaulted one: def make(size=\"small\", milk).",
          why: "Python fills positional slots left to right; a required slot hiding behind a defaulted one can never be reached reliably, so the def line itself is a SyntaxError.",
          fix: "Order parameters as (required..., optional with defaults...). If milk is required, it comes before size.",
        },
        {
          mistake: "Using a list as a default value: def add_task(task, tasks=[]).",
          why: "The default list is built once, when Python reads the def — every default-using call appends to that same shared list, and data leaks between calls.",
          fix: "Default to None and create the list inside: if tasks is None: tasks = [].",
        },
      ],
      takeaways: [
        "Keyword arguments (name=value) fill named slots in any order — and make calls self-explaining.",
        "Defaults live in the definition; a call overrides them only where it wants to.",
        "One mixing rule: positional before keyword, always. Python enforces it with a SyntaxError.",
        "*args packs every extra positional argument into a tuple — one function, any number of values.",
        "Never use a list or dict as a default. Default to None, build inside, sleep well.",
      ],
      quiz: [
        {
          id: "f-03-q1",
          prompt: "Given def make_coffee(size, milk=\"regular\", shots=1):, which call is VALID?",
          options: [
            { text: "make_coffee(\"small\", milk=\"oat\")", correct: true, feedback: "Valid — positional first, keyword after, and milk gets \"oat\" while shots stays 1." },
            { text: "make_coffee(milk=\"oat\", \"small\")", correct: false, feedback: "Keyword before positional — a SyntaxError, no matter what the definition says." },
            { text: "make_coffee(=\"small\", milk=\"oat\")", correct: false, feedback: "Keyword arguments are written name=value, and \"small\" must simply be positional here." },
          ],
          explanation: "Positional first, keyword after — the one mixing rule, enforced by Python itself.",
        },
        {
          id: "f-03-q2",
          prompt: "Inside def add_all(*numbers):, what is numbers when you call add_all(2, 4, 6)?",
          options: [
            { text: "A tuple containing (2, 4, 6)", correct: true, feedback: "Exactly — the star collects the positional arguments into a tuple." },
            { text: "A list containing [2, 4, 6]", correct: false, feedback: "Close, but *args packs into a tuple, not a list — the fixed-order collection from e-02." },
            { text: "The number 3 — how many arguments arrived", correct: false, feedback: "The count would be len(numbers); numbers itself holds the values." },
          ],
          explanation: "*args is packing: every positional argument of the call, gathered into one tuple.",
        },
        {
          id: "f-03-q3",
          prompt: "Why did add_task(\"walk the dog\") print BOTH tasks in the broken version?",
          options: [
            { text: "Because the default list is created once at def time, and both calls shared that same list", correct: true, feedback: "Exactly — the default belongs to the function, not to each call." },
            { text: "Because lists keep old items unless you clear them with clear()", correct: false, feedback: "The list was never cleared because it was never fresh — the sharing is the bug, not missing cleanup." },
            { text: "Because print() remembers what it printed before", correct: false, feedback: "print() has no memory at all — it printed exactly what was in the list." },
          ],
          explanation: "One default value, created once, shared by every call that skips the argument. That is the mutable-default trap.",
        },
      ],
    },
    // ------------------------------------------------------------- f-04
    {
      slug: "f-04",
      title: "Return Values",
      minutes: 20,
      summary:
        "The most important lesson in this part: return is not print. Handing values back to the caller, the invisible None, early returns, and returning several values at once with tuples.",
      kind: "coding",
      objectives: [
        "Write functions that return values, and store those values in variables",
        "Explain the difference between return and print — and predict the None trap every time",
        "Use early returns to end a function the moment its answer is known",
        "Return multiple values as a tuple and unpack them into variables",
      ],
      why: "Printing a result and returning it look almost identical on screen — and that similarity fools everyone. But a printed value is gone the moment it appears: you cannot add 1 to it, format it, or pass it to another function. A returned value is yours to keep, combine, and reuse. Every real program is built from functions handing values to each other, and every beginner's hardest debugging session starts with a None that should have been a number. This is the single most important idea in Part F; slow down here and everything after it gets easier.",
      blocks: [
        {
          kind: "text",
          text: "Your functions so far have only *spoken*: they print, and the words appear on screen. But programs are not built from words appearing on screens — they are built from values flowing between pieces. You want a function that hands you `212.0` so you can double it, compare it, format it, feed it to another function. You want **return**.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The vending machine",
          text: "A function that prints is a vending machine that ANNOUNCES over the speaker: 'here is your cola!' — and never actually drops the can. A function that returns is the machine dropping the can into the tray. You can drink a can. You cannot drink an announcement.",
        },
        {
          kind: "heading",
          text: "return hands the value back",
        },
        {
          kind: "code",
          title: "A converted temperature you can actually use",
          code: `def celsius_to_fahrenheit(celsius):
    """Return the Fahrenheit equivalent of a Celsius temperature."""
    return celsius * 9 / 5 + 32


f = celsius_to_fahrenheit(100)
print(f)
print(f"Water boils at {f} degrees Fahrenheit")
print("Twice that:", f * 2)
`,
          output: `212.0
Water boils at 212.0 degrees Fahrenheit
Twice that: 424.0`,
          explain: [
            "`return` computes `celsius * 9 / 5 + 32`, ends the function, and hands the result to whoever called. The call `celsius_to_fahrenheit(100)` *becomes* the value `212.0` — stored into `f`.",
            "Now `f` is a normal variable: print it, embed it in an f-string, double it. The temperature converter you wrote as bare statements in Part B exercises is now a reusable, composable part.",
          ],
        },
        {
          kind: "code",
          title: "Accumulate inside, return once",
          code: `def count_vowels(text):
    """Return the number of vowels (a, e, i, o, u) in a piece of text."""
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count = count + 1
    return count


print(count_vowels("hello"))
print(count_vowels("DataVerse"))
print(count_vowels("rhythm"))
`,
          output: `2
4
0`,
          explain: [
            "The loop builds up `count` (a lowercase 'e' and 'o' in *hello*; 'a', 'a', 'e', 'e' in *DataVerse*; none at all in *rhythm*), and the final line hands the finished answer back.",
            "Notice: no print inside the function. It computes and returns; the caller decides what to do with the result — print it, compare it, store it.",
          ],
        },
        {
          kind: "heading",
          text: "THE big confusion: return vs print",
        },
        {
          kind: "text",
          text: "Here are two functions that look almost identical. Both *show* a 5 on screen when called. But one of them hands the caller nothing, and the other hands back a real, usable value. Watch closely — this exact difference will save you a full day of confusion:",
        },
        {
          kind: "code",
          title: "Two functions, one visible difference",
          code: `def add_print(a, b):
    """PRINT the sum: it appears on screen, but nothing comes back."""
    print(a + b)


def add_return(a, b):
    """RETURN the sum: it comes back to the caller, nothing appears."""
    return a + b


result_print = add_print(2, 3)
result_return = add_return(2, 3)

print("result_print holds:", result_print)
print("result_return holds:", result_return)
`,
          output: `5
result_print holds: None
result_return holds: 5`,
          explain: [
            "Line 1 of the output (the bare `5`) is `add_print(2, 3)` doing its printing. It also returns something — but what it returns is **None**, the nothing value.",
            "`result_return` holds `5`: `add_return` printed nothing, but its value came back and was stored.",
            "The screen output of the two functions is nearly identical. The *callers'* experience is completely different.",
          ],
        },
        {
          kind: "visual",
          title: "The same call, two completely different endings",
          ascii: `   add_print(2, 3)                     add_return(2, 3)
   |                                  |
   | body runs:                       | body runs:
   |   print(2 + 3)                   |   2 + 3  is computed
   |   -> "5" appears on screen       |   -> nothing appears
   |                                  |
   | hands back: NOTHING              | hands back: 5
   v                                  v
   result_print = None               result_return = 5

   the SCREEN saw a 5                the CALLER owns a 5:
   but the caller owns               double it, format it, pass it
   nothing at all                    to another function...
`,
          caption:
            "print writes to the screen and returns None. return hands a value to the caller — quietly, with nothing on screen unless someone decides to print it.",
        },
        {
          kind: "text",
          text: "So what is this `None`? It is Python's name for *no value here*, and it is the invisible default: **a function without a return statement returns None. Always.** Even `print()` itself returns None — printing is a side effect, not a value. This is worth seeing with your own eyes in the REPL, where every call's result is laid bare:",
        },
        {
          kind: "code",
          title: "None, caught in the act",
          lang: "repl",
          code: `>>> def show_double(n): print(n * 2)
>>> show_double(21)
42
>>> result = show_double(21)
42
>>> print(result)
None
>>> type(result)
<class 'NoneType'>`,
          outputNote:
            "Real REPL transcript. The two 42 lines come from the print INSIDE show_double — not from values coming back. The value that comes back is None.",
          explain: [
            "`show_double(21)` puts 42 on screen — but that is the `print` inside the function talking. The call's actual result is None.",
            "`result = show_double(21)` prints 42 again (same reason), and `result` captures what really came back.",
            "`print(result)` reveals it: `None`. And `type(result)` makes it official: `<class 'NoneType'>`.",
          ],
        },
        {
          kind: "heading",
          text: "return ends the function immediately",
        },
        {
          kind: "text",
          text: "The moment a `return` runs, the function is over — control snaps back to the caller, and nothing after that line executes. This is not a limitation; it is a tool. An **early return** answers the question the instant the answer is known and leaves the rest of the function for the harder cases:",
        },
        {
          kind: "code",
          title: "Return the moment you know the answer",
          code: `def first_negative(numbers):
    """Return the first negative number, or None if there is none."""
    for n in numbers:
        if n < 0:
            return n
    return None


print(first_negative([4, 7, -2, 9]))
print(first_negative([1, 2, 3]))
`,
          output: `-2
None`,
          explain: [
            "The loop walks the list; the moment it meets `-2`, `return n` fires — the remaining items are never even examined. That is the early return doing its job: stop the instant you are done.",
            "If the loop finishes with no negative found, the last line returns None — an honest *there is no such value* answer, exactly like `first_negative([1, 2, 3])` shows.",
          ],
        },
        {
          kind: "heading",
          text: "Returning multiple values",
        },
        {
          kind: "text",
          text: "A function can hand back more than one value: list them after `return`, separated by commas. What actually comes back is a **tuple** — lesson e-02 strikes again — and the caller can unpack it into separate variables in one line:",
        },
        {
          kind: "code",
          title: "Three answers, one call",
          code: `def min_max_average(numbers):
    """Return the smallest, largest, and average of a list of numbers."""
    return min(numbers), max(numbers), sum(numbers) / len(numbers)


stats = min_max_average([4, 9, 1, 7])
print(stats)

low, high, avg = min_max_average([4, 9, 1, 7])
print("low:", low, "| high:", high, "| average:", avg)
`,
          output: `(1, 9, 5.25)
low: 1 | high: 9 | average: 5.25`,
          explain: [
            "`return a, b, c` builds one tuple `(1, 9, 5.25)` and returns it — see the first print, which shows the tuple itself.",
            "`low, high, avg = ...` is unpacking from e-02: the tuple's three slots pour into three variables in one statement.",
            "`min()`, `max()` and `sum()` are the built-in list helpers from Part E — here they are just the body of a nicely packaged statistics function.",
          ],
        },
        {
          kind: "tryIt",
          title: "Fix the printing function",
          task: "This function PRINTS its answer instead of RETURNING it. Fix it: replace the print with a return, store the result of a call in a variable, then print that variable doubled. Predict every line before running — especially what print(result * 2) will show once the fix is in.",
          code: `# This function PRINTS its answer instead of RETURNING it.
# Your job: make it return, so the caller can use the result.
def area_of_rectangle(width, height):
    """Print the area of a rectangle (wrong tool: print, not return)."""
    print(width * height)


area_of_rectangle(3, 4)
`,
          hint: "The fixed version: return width * height. Then: result = area_of_rectangle(3, 4) and print(result * 2) — 12 doubled is 24.",
        },
      ],
      terms: [
        { term: "Return value", definition: "The value a function hands back to its caller via return. The call expression becomes that value, ready to store or use." },
        { term: "None", definition: "Python's nothing value. Every function returns it unless it returns something else — including functions that only print." },
        { term: "Early return", definition: "A return that fires the moment the answer is known, ending the function before the remaining code runs." },
        { term: "Unpacking", definition: "Assigning the items of a tuple (or other sequence) to several variables in one statement: low, high, avg = stats()." },
      ],
      mistakes: [
        {
          mistake: "Printing the result instead of returning it, then wondering why the caller gets None.",
          why: "print writes to the screen AND returns None; the visible output hides the fact that no value came back. result = print_only(2, 3) stores None every time.",
          fix: "Compute and return; let the caller decide whether to print. Screen output is not a handoff.",
        },
        {
          mistake: "Using a function's result in math when the function returns None: result * 2 -> TypeError.",
          why: "None is a value of type NoneType, and None * 2 is as illegal as \"a\" * \"b\" being addition — the types do not support it.",
          fix: "Check the function for a return statement. The error message will even say: unsupported operand type(s) for *: 'NoneType' and 'int'.",
        },
        {
          mistake: "Writing code after a return statement and expecting it to run.",
          why: "return means done: control leaves the function at that exact line, so everything below it in the same branch is unreachable.",
          fix: "Treat return as the exit door. Put any remaining work BEFORE it — or use early returns deliberately, one per answer.",
        },
        {
          mistake: "Trying to return two values with two separate return statements.",
          why: "The first return ends the function; the second one never runs, so half the answer is lost.",
          fix: "One return, comma-separated: return smallest, largest. The caller unpacks: low, high = stats(data).",
        },
      ],
      takeaways: [
        "print shows a value to humans; return hands a value to the program. They are not interchangeable.",
        "A function with no return statement returns None — every time, silently.",
        "Store the handoff: result = my_function(...) puts the returned value in your variable.",
        "return ends the function on the spot — early returns answer early.",
        "return a, b, c hands back a tuple; low, b_avg, high = ... unpacks it in one line.",
      ],
      quiz: [
        {
          id: "f-04-q1",
          prompt: "A function contains only print statements and no return. What does x = that_function() store in x?",
          options: [
            { text: "Whatever the function printed", correct: false, feedback: "Printed text goes to the screen, never to the caller — the two channels are separate." },
            { text: "None — functions without a return statement hand back None", correct: true, feedback: "Correct. No return statement means the call's value is None, always." },
            { text: "An empty string, because nothing came back", correct: false, feedback: "Nothing came back, but Python's nothing has a name: None, not \"\"." },
          ],
          explanation: "Every call produces a value. Without return, that value is None.",
        },
        {
          id: "f-04-q2",
          prompt: "Predict: def give_five(): print(5) — then x = give_five() and print(x). What appears on screen, in order?",
          options: [
            { text: "5, then 5", correct: false, feedback: "The second 5 would mean x stored the printed value — but printing and returning are different channels." },
            { text: "5, then None", correct: true, feedback: "Exactly: the function prints 5 (screen), returns None (to the caller), and print(x) reveals it." },
            { text: "None, then 5", correct: false, feedback: "Reversed — the print inside the function runs first, before x is ever printed." },
          ],
          explanation: "Screen first (the 5 from inside the function), then the caller's channel (None).",
        },
        {
          id: "f-04-q3",
          prompt: "def stats(n): return min(n), max(n) — what does stats([3, 1, 2]) give back, and how do you capture both parts?",
          options: [
            { text: "A tuple (1, 3); capture with low, high = stats([3, 1, 2])", correct: true, feedback: "Right — comma-separated return values form a tuple, and unpacking splits it into variables." },
            { text: "Two separate values that must be captured with two calls", correct: false, feedback: "One call returns one thing: the tuple. Unpacking splits it — no second call needed." },
            { text: "Only 3, because a function can return just one value", correct: false, feedback: "It returns one value — the tuple — which carries both numbers inside it." },
          ],
          explanation: "Multiple returns travel as one tuple; unpacking pours them into named variables.",
        },
      ],
    },
    // ------------------------------------------------------------- f-05
    {
      slug: "f-05",
      title: "Scope",
      minutes: 16,
      summary:
        "Where variables live and die: locals born at each call and destroyed at each return, globals readable but risky, the global keyword to avoid, and why parameters make functions self-contained.",
      kind: "concept",
      objectives: [
        "Explain what happens to a function's variables when the call ends",
        "Predict the NameError you get from touching a local variable outside its function",
        "Describe how a global can be read inside a function but not safely assigned",
        "Refactor a global-reaching function into a self-contained one with parameters and return",
      ],
      why: "Variables inside functions are not just private — they are temporary. A function's variables are born when the call starts and destroyed when it returns, and understanding that one fact explains three things you will otherwise meet as mysteries: why print(name) outside a function crashes, why two functions can use the same variable names without chaos, and why the UnboundLocalError exists. Scope is also where you learn the most important design rule of the whole part: a function should take what it needs as parameters and hand back what it made with return — no reaching out, no leaking in.",
      blocks: [
        {
          kind: "text",
          text: "You have seen the clue twice already: f-02's `name` and the parameters before it only existed *during a call*. Time to make that precise. The region of a program where a variable exists is called its **scope** — and functions draw a hard boundary around theirs.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The hotel room",
          text: "Every call books a hotel room. Whatever the function creates — its locals — stays in that room. When the function returns, the guest checks out and the room is cleaned out completely: every local variable is destroyed. The next call books a fresh room and starts with nothing. No luggage is left behind, ever.",
        },
        {
          kind: "heading",
          text: "Local variables: born at the call, gone at the return",
        },
        {
          kind: "code",
          title: "A variable that lives and dies inside one call",
          code: `def report():
    """Build a message locally, then print it."""
    message = "I was built inside the function"
    print(message)


report()
print("...and back at the top level again")
`,
          output: `I was built inside the function
...and back at the top level again`,
          explain: [
            "`message` is a **local variable**: created inside `report`, visible only inside `report`, destroyed the instant `report` returns.",
            "The second print runs fine — it never touches `message`. It lives at the top level and uses only top-level things.",
          ],
        },
        {
          kind: "code",
          title: "Asking for a local from outside",
          expectError: "NameError: name 'temperature' is not defined",
          code: `def brew():
    """Set a local brewing temperature."""
    temperature = 93
    print("Brewing at", temperature)


brew()
print(temperature)
`,
          explain: [
            "The call works: `temperature` exists *inside* it, and `Brewing at 93` prints.",
            "Then `print(temperature)` crashes. The call already returned; the room was cleaned; `temperature` no longer exists anywhere. Python reports it plainly: name 'temperature' is not defined.",
          ],
        },
        {
          kind: "heading",
          text: "Same names, different rooms — why nothing collides",
        },
        {
          kind: "code",
          title: "Two functions, two private totals",
          code: `def process_order():
    """Use a local total for one order."""
    total = 42
    print("order total:", total)


def process_refund():
    """Use a local total for one refund."""
    total = 0
    print("refund total:", total)


process_order()
process_refund()
`,
          output: `order total: 42
refund total: 0`,
          explain: [
            "Both functions create a local called `total` — and neither one can see the other's. Different rooms, same label on the door.",
            "This is why functions are safe to combine in one file: a hundred functions can all use `total`, `count`, or `result`, and no call ever disturbs another function's variables.",
          ],
        },
        {
          kind: "code",
          title: "Two calls, two fresh rooms",
          code: `def square(n):
    """Return n multiplied by itself."""
    result = n * n
    return result


answer = square(5)
print(answer)
`,
          output: `25`,
          explain: [
            "`n` and `result` exist only while `square(5)` runs. When it returns 25, both vanish.",
            "If you called `square(7)` next, it would get a brand-new `n` and a brand-new `result`. Nothing carries over — the trace below shows both trips.",
          ],
        },
        {
          kind: "visual",
          title: "A scope trace: two independent calls",
          ascii: `Top level                       square's room (a fresh frame per call)
-----------                     --------------------------------------
answer = square(5)  -- call -->   n      = 5     (copied from the argument)
                                  result = 25    (born INSIDE the room)
answer = 25         <- return --  return 25      (room cleaned out:
                                                   n and result destroyed)

answer = square(7)  -- call -->   n      = 7     (a BRAND NEW room)
                                  result = 49
answer = 49         <- return --  return 49      (cleaned out again)
`,
          caption:
            "Each call gets its own frame — the private room where parameters and locals live. The value crosses back out through return; the variables themselves never do.",
        },
        {
          kind: "heading",
          text: "Globals: readable from inside — and that is the trap",
        },
        {
          kind: "text",
          text: "A variable created at the top level — a **global** — can be *read* from inside a function. Python looks for a name inside the function first, and if it does not find it there, it looks outside. That sounds convenient. Watch it work, then watch it break:",
        },
        {
          kind: "code",
          title: "Reading a global works",
          code: `tax_rate = 0.20

def price_with_tax(price):
    """Read the global tax_rate while computing."""
    return price + price * tax_rate


print(price_with_tax(100))
`,
          output: `120.0`,
          explain: [
            "`tax_rate` is not a parameter and not a local — but the function still found it, by looking outward. The read succeeds.",
            "Notice what this function really is, though: no longer self-contained. Move it to another file and it silently breaks, because its ingredient lives somewhere else. Reading globals creates invisible dependencies.",
          ],
        },
        {
          kind: "code",
          title: "Assigning to one from inside — crash",
          expectError: "UnboundLocalError: cannot access local variable 'counter' where it is not associated with a value",
          code: `counter = 0

def bump():
    """Try to update the global counter (this cannot work)."""
    counter = counter + 1
    print("counter is now", counter)


bump()
`,
          explain: [
            "The trap springs: because `counter` is *assigned* somewhere inside the function, Python decides `counter` must be a LOCAL for the whole function body — and then the right-hand side tries to read that local before any value was ever put in it.",
            "Reading a global: allowed. Assigning inside a function: creates a local. Both rules at once: UnboundLocalError. This error confuses everyone exactly once.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The global keyword exists. Avoid it.",
          text: "Python does have a way to make that assignment work: writing `global counter` inside the function. It works — and it is a trap for maintainers: functions that quietly rewrite variables in other rooms are exactly the functions that become impossible to debug. The professional pattern is parameters in, return out. You will rarely see `global` in good code, and now you know why.",
        },
        {
          kind: "code",
          title: "The professional pattern: in through parameters, out through return",
          code: `def bump(counter):
    """Return the counter plus one. Nothing outside is touched."""
    return counter + 1


counter = 0
counter = bump(counter)
print("counter is now", counter)
counter = bump(counter)
print("counter is now", counter)
`,
          output: `counter is now 1
counter is now 2`,
          explain: [
            "`bump` owns nothing and touches nothing outside itself: the value comes in as a parameter, the new value goes out as the return.",
            "The top level owns `counter` and rebinds it with `counter = bump(counter)` — the same rebinding you have done since Part A, just with a computed value.",
            "This function works anywhere, on any number. It can be moved, reused, and tested with a single call. Self-contained is not just tidy — it is what makes functions composable.",
          ],
        },
        {
          kind: "tryIt",
          title: "Free the label — with return, not global",
          task: "This program crashes with a NameError, because label lives and dies inside build_label. Fix it WITHOUT moving label to the top level and WITHOUT the global keyword: make build_label RETURN the label, capture the result in a variable at the top level, and print that. Then add a second local (say, a width) and return both values as a tuple.",
          code: `# This crashes. Fix it WITHOUT moving \`label\` outside the function:
# make build_label RETURN the label, then print the call's result.
def build_label():
    label = "built inside"


build_label()
print(label)
`,
          hint: "return label ends the function and hands the string back. Then: text = build_label() and print(text). For the stretch: return label, width — and unpack: text, width = build_label().",
          expectError: true,
        },
      ],
      terms: [
        { term: "Scope", definition: "The region of a program where a variable exists. Function bodies are their own scopes; locals exist only inside them." },
        { term: "Local variable", definition: "A variable created inside a function (including parameters): born at the call, destroyed at the return, invisible outside." },
        { term: "Global variable", definition: "A variable created at the top level of the file. Readable inside functions, but assignment inside a function creates a local instead." },
        { term: "Call frame", definition: "The private workspace Python creates for one call: the parameters and locals of that single execution, cleaned out when the call returns." },
        { term: "Shadowing", definition: "When a local (or parameter) has the same name as a global: inside the function, the local wins and the global is hidden." },
      ],
      mistakes: [
        {
          mistake: "Expecting a local variable to survive after the call: calling brew(), then print(temperature) outside.",
          why: "Locals are destroyed at return — the name does not exist anymore, so Python raises NameError.",
          fix: "Have the function return the value, capture it: temperature = brew(), and use your own variable outside.",
        },
        {
          mistake: "Trying to update a global from inside a function: counter = counter + 1 inside the body.",
          why: "Assignment inside a function makes that name local for the whole body; reading it before assigning triggers UnboundLocalError.",
          fix: "Take the value as a parameter and return the new one: counter = bump(counter) at the top level.",
        },
        {
          mistake: "Reaching for the global keyword the moment sharing seems necessary.",
          why: "Functions that mutate globals create invisible, order-dependent connections — the classic cause of unmaintainable code.",
          fix: "Parameters in, return out. If two functions must share state, the top level passes it between them explicitly.",
        },
      ],
      takeaways: [
        "Locals are born at the call and destroyed at the return — every call starts with a clean room.",
        "Touching a local from outside is a NameError, every time, because the name truly does not exist there.",
        "Globals can be read inside functions, but assigning inside creates a local — both at once means UnboundLocalError.",
        "The global keyword exists; well-designed code uses parameters and return instead.",
        "A self-contained function — everything it needs as parameters, everything it makes as return — works anywhere.",
      ],
      quiz: [
        {
          id: "f-05-q1",
          prompt: "A function sets score = 90 inside its body and returns. What is score afterwards?",
          options: [
            { text: "Destroyed — the local ceased to exist when the call returned", correct: true, feedback: "Correct — checkout cleans the room; nothing survives the return." },
            { text: "Still 90, waiting for the next call to reuse it", correct: false, feedback: "No luggage is left behind: the next call starts completely fresh." },
            { text: "Promoted to a global so other functions can read it", correct: false, feedback: "Nothing crosses the boundary except through return." },
          ],
          explanation: "Locals live exactly as long as their call. After return, they are gone.",
        },
        {
          id: "f-05-q2",
          prompt: "Predict: def mix(): color = \"teal\" — then mix() runs, then print(color). What happens?",
          options: [
            { text: "Prints teal", correct: false, feedback: "The value never left the function — there is nothing to print out here." },
            { text: "Raises NameError: color is not defined", correct: true, feedback: "Exactly — color was local to mix and was destroyed at the return." },
            { text: "Prints None", correct: false, feedback: "None is what a call returns, not what a vanished local leaves behind." },
          ],
          explanation: "Outside the function, color never existed. NameError is the honest answer.",
        },
        {
          id: "f-05-q3",
          prompt: "You need a value computed inside a function, out at the top level. The course-endorsed way is…",
          options: [
            { text: "Declare the variable global inside the function and assign it there", correct: false, feedback: "It works mechanically and creates invisible coupling — the pattern professionals avoid." },
            { text: "Have the function return the value, and capture it: result = my_function()", correct: true, feedback: "Yes — parameters in, return out: self-contained, movable, testable." },
            { text: "Create the variable empty at the top level first, so the function can fill it", correct: false, feedback: "Assignment inside the function would create a LOCAL of the same name — the top-level variable stays empty." },
          ],
          explanation: "return is the only door values exit through. Use it.",
        },
      ],
    },
    // ------------------------------------------------------------- f-06
    {
      slug: "f-06",
      title: "Lambda Functions",
      minutes: 13,
      summary:
        "The one-line, nameless function: lambda syntax, where lambdas genuinely shine (as arguments), where they hurt readability, and the flagship real use — sorted() with key=.",
      kind: "coding",
      objectives: [
        "Write a lambda and call it, and explain how it differs from a def",
        "Sort a list by a computed value using sorted(key=lambda ...)",
        "Use key= with min() and max() to measure tuples by one field",
        "Decide between def and lambda by readability, not by habit",
      ],
      why: "Some functions are so small that giving them a name, two lines of def, and a docstring feels like paperwork for a sticky note: *double this*, *take the second item*, *lowercase it*. When a tiny job like that needs to be handed to another function — most often as the key for sorting — Python lets you write it inline, exactly where it is used. That is the lambda. It is not a better function; it is a smaller one, with one famous strength and one famous weakness, and knowing exactly when each applies is what this lesson is for.",
      blocks: [
        {
          kind: "text",
          text: "You know two ways to make a function now — `def`, and calling it. Here is the third piece: **lambda**, a function compressed into a single expression, with no name, defined exactly where you need it. First, see that it really is just a function:",
        },
        {
          kind: "heading",
          text: "lambda: a function in one expression",
        },
        {
          kind: "code",
          title: "Same machine, two spellings",
          code: `def double(n):
    """Double a number."""
    return n * 2


double_lambda = lambda n: n * 2

print(double(21))
print(double_lambda(21))
print(type(double_lambda))
`,
          output: `42
42
<class 'function'>`,
          explain: [
            "`lambda n: n * 2` reads: *a function of n that evaluates to n times 2*. No def, no return keyword, no name — the expression's value IS the return value.",
            "`type()` confirms it: a lambda is exactly `<class 'function'>` — same kind of object as `double`, callable with the same parentheses.",
            "We only assigned it to a name here so you could call it. Assigning a lambda to a name is actually the one thing you should NOT do in real code — next block explains why.",
          ],
        },
        {
          kind: "text",
          text: "The anatomy is `lambda parameters: expression` — a parameter list (no parentheses around it), a colon, and exactly **one expression**, whose value is returned. No statements: no loops, no assignments, no early returns. And the naming rule from the Python style guide is blunt: if a lambda needs a name, write a `def` instead — the named version above is what real code should look like. A lambda's natural habitat is *inside* another call, where it never needs a name at all.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Where lambdas hurt",
          text: "A lambda you have to read twice is a bug in style. The moment the expression grows — nested operations, an if-in-the-middle, anything that makes a reader squint — stop, write a def with a name and a docstring, and pass that instead. Lambdas trade documentation for brevity; only spend that trade on the genuinely tiny.",
        },
        {
          kind: "heading",
          text: "The flagship use: sorted(key=...)",
        },
        {
          kind: "text",
          text: "You met `sorted()` in lesson e-07: it returns a new, ordered list. But ordered *how*? By default, alphabetically for strings, smallest-first for numbers. What if you want words ordered by **length**, or people ordered by **age** when each person is a tuple? That is what the `key=` parameter is for: hand it a function, and `sorted` orders the list by whatever that function returns for each item. And the function you hand it is exactly the sticky-note-sized job lambdas exist for:",
        },
        {
          kind: "code",
          title: "Two orders, one list",
          code: `words = ["banana", "kiwi", "apple", "fig"]

print("alphabetical:", sorted(words))
print("by length   :", sorted(words, key=lambda word: len(word)))
`,
          output: `alphabetical: ['apple', 'banana', 'fig', 'kiwi']
by length   : ['fig', 'kiwi', 'apple', 'banana']`,
          explain: [
            "First call: default order — alphabetical.",
            "Second call: `key=lambda word: len(word)` tells sorted to measure each word by `len(word)` and order by those measurements: fig (3), kiwi (4), apple (5), banana (6). The list itself is unchanged — a new sorted list comes back, as always with sorted().",
          ],
        },
        {
          kind: "code",
          title: "Sorting tuples by one field",
          code: `students = [("Ada", 36), ("Grace", 45), ("Linus", 29)]

by_age = sorted(students, key=lambda student: student[1])
print(by_age)

for name, age in by_age:
    print(f"{name} is {age}")
`,
          output: `[('Linus', 29), ('Ada', 36), ('Grace', 45)]
Linus is 29
Ada is 36
Grace is 45`,
          explain: [
            "Without `key=`, sorted() compares the tuples item by item starting with the name — you would get alphabetical order by accident, silently.",
            "`key=lambda student: student[1]` measures each tuple by its second item — the age — and orders by that. Read it as: *for each student, sort by student[1]*.",
          ],
        },
        {
          kind: "heading",
          text: "key= works with min() and max() too",
        },
        {
          kind: "code",
          title: "The oldest and the youngest, by age",
          code: `students = [("Ada", 36), ("Grace", 45), ("Linus", 29)]

oldest = max(students, key=lambda student: student[1])
print("Oldest:", oldest)
youngest = min(students, key=lambda student: student[1])
print("Youngest:", youngest)
`,
          output: `Oldest: ('Grace', 45)
Youngest: ('Linus', 29)`,
          explain: [
            "`max()` with a `key=` does not compare the tuples directly — it compares their measurements (the ages) and returns the whole item that scored highest.",
            "The lambda travels into the function as a value — a preview of lesson f-08, where functions-as-arguments becomes the whole story.",
          ],
        },
        {
          kind: "table",
          title: "def or lambda? A one-line decision",
          headers: ["Situation", "Use", "Why"],
          rows: [
            ["Tiny measurement passed into sorted/min/max/map", "lambda", "One expression, used exactly once, in place"],
            ["Anything you might call from more than one place", "def", "A name makes it findable, reusable, documented"],
            ["Logic that needs a loop, several steps, or branching", "def", "Lambdas hold exactly one expression — no statements"],
            ["You feel like naming the lambda for clarity", "def", "If it deserves a name, it deserves a def (style-guide rule)"],
          ],
          caption:
            "The pattern: lambda for the anonymous one-liner you hand to another function; def for everything that outlives the line it appears on.",
        },
        {
          kind: "tryIt",
          title: "Sort the menu, both ways",
          task: "Predict the three lines before running — then verify. Then: remove reverse=True to get cheapest first, and afterwards sort the same products by NAME by changing what the lambda looks at.",
          code: `products = [("mug", 8.0), ("plate", 12.5), ("spoon", 3.25)]

by_price = sorted(products, key=lambda product: product[1], reverse=True)
for item, price in by_price:
    print(f"{item}: \${price:.2f}")
`,
          hint: "reverse=True flips the order after the key measurement — most expensive first here. By name: key=lambda product: product[0].",
        },
      ],
      terms: [
        { term: "Lambda", definition: "A nameless one-expression function written inline: lambda n: n * 2. The expression's value is the return value." },
        { term: "Anonymous function", definition: "A function without a name, created for immediate use — usually passed as an argument — rather than for repeated calls." },
        { term: "Key function", definition: "A function passed via key= to sorted(), min(), or max(): each item is measured by its result, and ordering picks by the measurement." },
      ],
      mistakes: [
        {
          mistake: "Assigning a lambda to a name and using it as the permanent function: square = lambda n: n * n.",
          why: "It works, but the name is the whole point of def — and a def gives you a docstring, parameters on their own line, and room to grow.",
          fix: "Named function: def. The style guide says it plainly: never do what the assignment above does.",
        },
        {
          mistake: "Trying to put statements inside a lambda: lambda xs: total = 0 or a loop.",
          why: "A lambda body is a single expression — assignments and loops are statements, so Python raises a SyntaxError before anything runs.",
          fix: "One line of computation? Lambda. Anything more? def, immediately.",
        },
        {
          mistake: "Sorting tuples with plain sorted(students) and assuming it ordered by the field you cared about.",
          why: "sorted() compares tuples item by item, starting at index 0 — with (name, age) tuples that means alphabetical by name, no error, just quietly the wrong order.",
          fix: "Say what you mean: sorted(students, key=lambda student: student[1]).",
        },
      ],
      takeaways: [
        "lambda parameters: expression — one line, no name, no return keyword, the expression IS the result.",
        "Lambdas shine as throwaway arguments, above all in sorted(key=...).",
        "key= means: measure each item by this function, order (or pick) by the measurement.",
        "sorted() is not the only key= user — min() and max() take one too.",
        "If it needs a name or a second line, it needs a def. That rule has no exceptions.",
      ],
      quiz: [
        {
          id: "f-06-q1",
          prompt: "What can the body of a lambda contain?",
          options: [
            { text: "Exactly one expression — its value is returned automatically", correct: true, feedback: "Right — no statements, no return keyword, just one expression whose value comes back." },
            { text: "Any number of statements, like a normal function", correct: false, feedback: "That is def's job; lambdas are single expressions only." },
            { text: "One statement, which must be a print()", correct: false, feedback: "Lambdas contain an expression, and printing is exactly what they should NOT do — they return values." },
          ],
          explanation: "lambda is one expression. The moment you need statements, you need def.",
        },
        {
          id: "f-06-q2",
          prompt: "sorted(words, key=lambda word: len(word)) orders words…",
          options: [
            { text: "From shortest to longest, by each word's length", correct: true, feedback: "Correct — each word is measured by len(word), and the list is ordered by those measurements." },
            { text: "Alphabetically, because that is sorted()'s default", correct: false, feedback: "A key= overrides the default comparison entirely." },
            { text: "From longest to shortest", correct: false, feedback: "That would need reverse=True — plain key= ordering is ascending." },
          ],
          explanation: "key= replaces the default measurement: length here, smallest measurement first.",
        },
        {
          id: "f-06-q3",
          prompt: "Which job belongs to a def, not a lambda?",
          options: [
            { text: "Take the second item of a tuple, once, inside a sorted() call", correct: false, feedback: "Textbook lambda: tiny, anonymous, used exactly where it is written." },
            { text: "A price-with-tax calculation three other places in the file will also call", correct: true, feedback: "Correct — called from several places means it needs a name, a docstring, and room to grow: a def." },
            { text: "Doubling a number inside a map() call", correct: false, feedback: "One expression, used inline — a fine lambda." },
          ],
          explanation: "Reuse, names, documentation, and multi-step logic all point to def. Inline one-liners are lambda territory.",
        },
      ],
    },
    // ------------------------------------------------------------- f-07
    {
      slug: "f-07",
      title: "Recursion",
      minutes: 19,
      summary:
        "A function calling itself: base case plus recursive case, the countdown stack traced frame by frame, factorial worked fully with a step-by-step table, and honest guidance on recursion vs loops.",
      kind: "concept",
      objectives: [
        "Explain what it means for a function to call itself — and why it is legal",
        "Identify the base case and the recursive case in any recursive function",
        "Trace a recursive call: frames pile up, the base case answers, the stack unwinds",
        "Recognize RecursionError as the missing-base-case symptom",
        "Choose between a loop and recursion deliberately, not by habit",
      ],
      why: "Every function you have written so far is called by someone else — the top level, or another function. But a function can also call itself, and some problems are almost unreadable any other way: a folder inside a folder inside a folder, a reply quoting a reply quoting a reply, a family tree. Recursion is also the deepest workout your call-flow mental model from f-01 will ever get: to trace it you must truly understand frames, calls, and returns. Even if you write loops for months after this lesson — and you should — understanding recursion changes how you see every function call.",
      blocks: [
        {
          kind: "text",
          text: "So far, every call has been a function being started by someone *outside* itself. Nothing stops a function from starting *itself*, though — a call is just a name plus parentheses, and its own name is as good as any. A function that calls itself is **recursive**, and used correctly it is one of the most elegant tools in programming.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "The nesting dolls",
          text: "Open a matryoshka doll and you find a smaller doll. Open that one — a smaller one again. Eventually you reach the tiny solid doll that does not open. That last doll is the base case: the smallest version that is answered directly. Every doll you opened is paused, waiting, until the inner ones are done — then they close back up in reverse order.",
        },
        {
          kind: "heading",
          text: "Countdown: the classic first recursion",
        },
        {
          kind: "code",
          title: "A function that calls itself",
          code: `def countdown(n):
    """Print n down to 1, then announce liftoff."""
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)


countdown(3)
`,
          output: `3
2
1
Liftoff!`,
          explain: [
            "Read the two halves: if `n == 0`, print and **return** — that is the **base case**, the solid doll. Otherwise print `n`, then call `countdown(n - 1)` — that is the **recursive case**, opening a smaller doll.",
            "The output is exactly what a loop from Part D would print — that is not a coincidence, and we will come back to it.",
          ],
        },
        {
          kind: "visual",
          title: "The countdown stack, frame by frame",
          ascii: `countdown(3)                      top level calls
|  print(3)                       "3"
|  countdown(2)                   frame 3 pauses; a new frame opens
   |
   |  print(2)                    "2"
   |  countdown(1)                frame 2 pauses; a new frame opens
      |
      |  print(1)                 "1"
      |  countdown(0)             frame 1 pauses; a new frame opens
         |
         |  print("Liftoff!")     "Liftoff!"   <-- BASE CASE: no further call
         |  return                frame 0 closes
      |  (nothing left) return    frame 1 closes
   |  (nothing left) return       frame 2 closes
|  (nothing left) return          frame 3 closes
Program continues                 back at the top level
`,
          caption:
            "Each call is a full frame from f-05, with its own private n. Calls pile up — the call stack — then the base case returns and the stack unwinds in reverse order, each paused frame resuming with nothing left to do.",
        },
        {
          kind: "heading",
          text: "The two-part rule: base case + recursive case",
        },
        {
          kind: "steps",
          title: "How to build any recursion",
          items: [
            "**Find the base case** — the input so small the answer is obvious and needs no further call. Empty list. The number 1. The string with no characters.",
            "**State the recursive case** — assume the function already works for *smaller* inputs, and express the answer for this input using that assumption. The sum of a list is: first item + sum of the rest.",
            "**Guarantee the shrink** — every recursive call must move toward the base case (`n - 1`, a shorter list, a shorter string). If nothing shrinks, nothing ever stops.",
          ],
        },
        {
          kind: "heading",
          text: "Factorial: worked fully, step by step",
        },
        {
          kind: "text",
          text: "The factorial of `n` — written `n!` — is `n x (n-1) x ... x 1`. It hides a perfect recursive structure: the factorial of 4 is 4 times *the factorial of 3*. All the way down to the base case: the factorial of 1 is just 1.",
        },
        {
          kind: "code",
          title: "factorial, in two lines of logic",
          code: `def factorial(n):
    """Return n! (n x n-1 x ... x 1), computed recursively."""
    if n == 1:
        return 1
    return n * factorial(n - 1)


print(factorial(1))
print(factorial(4))
print(factorial(6))
`,
          output: `1
24
720`,
          explain: [
            "Base case: `n == 1` answers immediately. Recursive case: `n * factorial(n - 1)` — this frame's work *pauses* at the multiplication until the inner call comes back.",
            "`factorial(6)` is 720; it opens five paused frames to get there. Now trace `factorial(4)` yourself through the table below — that trace is the whole lesson in one picture.",
          ],
        },
        {
          kind: "table",
          title: "The complete trace of factorial(4)",
          headers: ["Step", "Who is running", "What happens", "Frames paused below"],
          rows: [
            ["1", "factorial(4)", "4 is not 1 — needs 4 * factorial(3)", "f(4)"],
            ["2", "factorial(3)", "needs 3 * factorial(2)", "f(4), f(3)"],
            ["3", "factorial(2)", "needs 2 * factorial(1)", "f(4), f(3), f(2)"],
            ["4", "factorial(1)", "BASE CASE — returns 1", "f(4), f(3), f(2)"],
            ["5", "factorial(2) resumes", "2 * 1 = 2 — returns 2", "f(4), f(3)"],
            ["6", "factorial(3) resumes", "3 * 2 = 6 — returns 6", "f(4)"],
            ["7", "factorial(4) resumes", "4 * 6 = 24 — returns 24", "(none)"],
          ],
          caption:
            "Down to the base case, then back up: each frame multiplies its own n by the answer from below. The paused multiplication 4 * ? only completes at step 7.",
        },
        {
          kind: "heading",
          text: "No base case: RecursionError",
        },
        {
          kind: "code",
          title: "The countdown that never stops",
          expectError: "RecursionError: maximum recursion depth exceeded",
          code: `def countdown(n):
    """Count down... but the stopping rule was forgotten."""
    print(n)
    countdown(n - 1)


countdown(3)
`,
          explain: [
            "The numbers print — 3, 2, 1, 0, -1, -2, ... — hundreds of them, one paused frame deeper each time. Nothing ever answers, so nothing ever resumes.",
            "Python does not hang forever: after about a thousand stacked frames it raises `RecursionError: maximum recursion depth exceeded` — the interpreter's circuit breaker. The message means one thing in practice: your base case is missing, or your input never shrinks toward it.",
          ],
        },
        {
          kind: "heading",
          text: "Recursion or loop? The honest answer",
        },
        {
          kind: "text",
          text: "Here is the guidance professionals actually follow: **reach for a loop first.** Any recursion can be rewritten as a loop, loops are easier to trace, and they never hit the depth limit. Recursion earns its place when the *data itself* is nested — folders inside folders, a dict inside a dict, a tree of replies — because the shape of the problem matches the shape of the tool. Judge both versions of the same job here:",
        },
        {
          kind: "code",
          title: "The same job, both ways",
          code: `def sum_loop(numbers):
    """Add up a list with a loop: the everyday tool."""
    total = 0
    for n in numbers:
        total = total + n
    return total


def sum_recursive(numbers):
    """Add up a list by recursion: the head plus the sum of the rest."""
    if numbers == []:
        return 0
    return numbers[0] + sum_recursive(numbers[1:])


print(sum_loop([2, 4, 6]))
print(sum_recursive([2, 4, 6]))
print(sum_loop([]) == sum_recursive([]))
`,
          output: `12
12
True`,
          explain: [
            "Both are correct — same answers, including the empty list. The loop is one frame, no depth limit, and easier to read at a glance.",
            "The recursive version has elegance: *the first item plus the sum of the rest* is almost the mathematical definition of a sum. `numbers[1:]` (slicing, from e-04) is what shrinks the input toward the base case.",
            "For flat lists, prefer the loop. For nested structures — coming in later parts — the recursion will feel like the natural shape, not a stunt.",
          ],
        },
        {
          kind: "tryIt",
          title: "Reverse a string, recursively",
          task: "Before running, trace reverse(\"abc\") on paper with the frame-by-frame method from the factorial table — base case first, then the unwind. Predict both output lines, then run. Stretch: change the base case to a one-character string (len(text) == 1) and check it still works.",
          code: `def reverse(text):
    """Return the text reversed, one character at a time, recursively."""
    if text == "":
        return ""
    return reverse(text[1:]) + text[0]


print(reverse("abc"))
print(reverse("stressed"))
`,
          hint: "The base case: reversing nothing gives nothing. The recursive case: reverse the rest, then stick the first character on the END. Watch what stressed reverses into.",
        },
      ],
      terms: [
        { term: "Recursion", definition: "A function calling itself, with each call working on a smaller input until the base case answers." },
        { term: "Base case", definition: "The input so small it is answered directly, without a further recursive call. The solid inner doll." },
        { term: "Recursive case", definition: "The part of the function that calls itself on a smaller input and builds the answer from the result." },
        { term: "Call stack", definition: "The pile of paused frames created by nested calls. Recursion piles frames up; the base case lets them unwind." },
        { term: "RecursionError", definition: "Python's circuit breaker: the call stack exceeded its maximum depth — almost always a missing base case." },
      ],
      mistakes: [
        {
          mistake: "Writing the recursive call before the base-case check (or forgetting the check entirely).",
          why: "Every call goes deeper before the stopping condition is ever examined, so the base case is never reached — RecursionError after about a thousand frames.",
          fix: "Base case first, at the top of the function. Recursive call after it, always on a smaller input.",
        },
        {
          mistake: "Calling countdown(n) inside itself instead of countdown(n - 1) — nothing shrinks.",
          why: "The base case exists but the input never moves toward it, so the result is the same infinite stack as a missing base case.",
          fix: "Every recursive call must receive a strictly smaller input: n - 1, numbers[1:], text[1:].",
        },
        {
          mistake: "Using recursion for ordinary flat-list jobs where a loop is the natural tool.",
          why: "The recursive version is harder to trace, uses a frame per item, and dies with RecursionError on long inputs — all cost, no benefit.",
          fix: "Loops first. Recursion when the data itself is nested — folders, trees, structures containing structures.",
        },
      ],
      takeaways: [
        "A recursive function calls itself on a smaller input — legal, and sometimes the clearest tool there is.",
        "Two-part rule: a base case answered directly, and a recursive case that shrinks toward it.",
        "Calls stack up, the base case answers, and the paused frames unwind in reverse order.",
        "RecursionError means about a thousand frames piled up: your base case is missing or never reached.",
        "Loops first; recursion for naturally recursive shapes — nested folders, trees, structures inside structures.",
      ],
      quiz: [
        {
          id: "f-07-q1",
          prompt: "Every working recursion needs, above all else…",
          options: [
            { text: "A base case: an input small enough to answer directly, with no further call", correct: true, feedback: "Correct — without it, nothing ever stops and the stack overflows." },
            { text: "At least two parameters", correct: false, feedback: "Plenty of classic recursions take exactly one parameter." },
            { text: "A loop inside the function", correct: false, feedback: "That is the alternative to recursion, not a requirement of it." },
          ],
          explanation: "Base case plus a recursive case that shrinks toward it — the two-part rule.",
        },
        {
          id: "f-07-q2",
          prompt: "In factorial(4), when the base case returns 1, what happens to the paused frames?",
          options: [
            { text: "They are discarded — only the base case's return value survives", correct: false, feedback: "The 1 travels up, but every paused frame still has its own multiplication to finish." },
            { text: "They unwind in reverse order: each resumes, multiplies its own n, and returns", correct: true, feedback: "Exactly: 2*1=2, then 3*2=6, then 4*6=24 — the stack unwinds frame by frame." },
            { text: "They all run again from the beginning", correct: false, feedback: "No re-running: each frame resumes exactly where it paused — at its own multiplication." },
          ],
          explanation: "The stack unwinds: each paused frame picks up where it stopped, finishes its work, and returns.",
        },
        {
          id: "f-07-q3",
          prompt: "You need the sum of a flat list of 10,000 numbers. The course recommendation is…",
          options: [
            { text: "Recursion — it is the classic textbook example", correct: false, feedback: "It works on paper, but 10,000 frames will blow past the recursion limit." },
            { text: "A loop — flat data is loop territory; recursion is for nested shapes", correct: true, feedback: "Right: loops first. Recursion earns its keep on folders-inside-folders data." },
            { text: "Neither — lists cannot be summed without built-ins", correct: false, feedback: "A one-line loop does it, and you have written several already." },
          ],
          explanation: "Loops for flat data, recursion for nested data — that is the honest rule.",
        },
      ],
    },
    // ------------------------------------------------------------- f-08
    {
      slug: "f-08",
      title: "Higher-Order Functions",
      minutes: 16,
      summary:
        "Functions are values: store them, pass them, return them. Passing style functions around, map() and filter() with lambdas, a tiny apply-twice, and when a plain loop beats all of it.",
      kind: "concept",
      objectives: [
        "Explain what greet (no parentheses) means as a value, versus greet()",
        "Write a function that takes another function as a parameter and calls it",
        "Use map() and filter() with lambdas to transform and select lists",
        "Build small function combinators like apply_twice and apply_to_all",
        "Choose between a loop, map/filter, and (soon) a comprehension by clarity",
      ],
      why: "You have been passing functions as values since lesson f-06 — you just did not have the word for it: sorted(key=lambda ...) only works because functions can ride along as arguments. Making that idea explicit unlocks the most flexible corner of Python: functions that take functions (map, filter, your own apply-to-all), functions that return functions, and the whole idea of handing behavior around like data. This is also the lesson where you learn when NOT to use these tools: a plain loop is often clearer, and clarity beats cleverness in every professional code review.",
      blocks: [
        {
          kind: "text",
          text: "One quiet fact has been sitting underneath everything since f-01: to Python, a function is a **value** — a thing you can store in a variable, pass to another function, or hand back from one. A function that takes or returns functions is called a **higher-order function**, and you have already used three: `sorted()`, `min()`, and `max()` with their `key=` parameters. Time to own the idea.",
        },
        {
          kind: "heading",
          text: "Functions are values",
        },
        {
          kind: "code",
          title: "A function in a variable, called by a second name",
          code: `def greet():
    """Print a greeting."""
    print("Hello!")


say_hello = greet

print(type(say_hello))
say_hello()
`,
          output: `<class 'function'>
Hello!`,
          explain: [
            "`say_hello = greet` copies no output and calls nothing — it makes `say_hello` point at the same function object. `type()` says it plainly: `<class 'function'>`.",
            "`say_hello()` calls it — the parentheses, as ever, are the go button.",
            "The crucial distinction in this whole lesson: `greet` is the function itself; `greet()` is a call that runs it. Two names, two very different values.",
          ],
        },
        {
          kind: "text",
          text: "Read that last line again, because everything below depends on it: **no parentheses means the function itself; parentheses mean run it now.** When you pass `greet` to something, the function travels, un-run. When you pass `greet()`, the call happens first — right there, at the moment of the pass — and only the *return value* travels.",
        },
        {
          kind: "heading",
          text: "Passing functions to functions",
        },
        {
          kind: "code",
          title: "The style function travels in as an argument",
          code: `def shout(text):
    """Return the text loudly."""
    return text.upper() + "!"


def whisper(text):
    """Return the text quietly."""
    return text.lower() + "..."


def announce(message, style):
    """Print the message after running it through the style function."""
    print(style(message))


announce("Python is fun", shout)
announce("Python is fun", whisper)
`,
          output: `PYTHON IS FUN!
python is fun...`,
          explain: [
            "`announce` takes a message and a `style` parameter — and what arrives in `style` is a whole function, un-run.",
            "Inside, `style(message)` calls whatever arrived: `shout(\"Python is fun\")` the first time, `whisper(\"Python is fun\")` the second.",
            "One `announce`, two personalities — decided by the caller, at call time. This is exactly the mechanism `key=` used in f-06.",
          ],
        },
        {
          kind: "visual",
          title: "What travels into announce",
          ascii: `announce("Python is fun", shout)
        |              |
        |              |  no parentheses: the FUNCTION itself, un-run
        |              v
        |        style = <function shout>
        v
     message = "Python is fun"

inside announce:  style(message)   <-- the call happens HERE
                   = shout("Python is fun")
                   = "PYTHON IS FUN!"        (then print shows it)

  had we written  announce("...", shout())
                    shout() would run IMMEDIATELY, at the pass,
                    and only its return value would arrive in style.
`,
          caption:
            "Pass the function (no parentheses) and the receiver decides when to call it. Pass the call (parentheses) and it runs before the journey even starts.",
        },
        {
          kind: "heading",
          text: "map(): apply a function to every element",
        },
        {
          kind: "text",
          text: "The most common function-as-argument job is also the simplest: *apply this little function to every item of a list.* Python's built-in for that is `map()`. One detail matters: `map()` hands its results back lazily — a promise, not a list — so the everyday pattern wraps it in `list()` to collect them:",
        },
        {
          kind: "code",
          title: "Every price, taxed — with a lambda in place",
          code: `prices = [4.5, 12.0, 3.25, 8.75]

with_tax = list(map(lambda price: round(price * 1.2, 2), prices))
print(with_tax)
`,
          output: `[5.4, 14.4, 3.9, 10.5]`,
          explain: [
            "Read the middle inside-out: the lambda (`price` goes in, `round(price * 1.2, 2)` comes out) is passed as a value to `map`, along with the list to apply it to.",
            "`map` runs the lambda once per price — 4.5 becomes 5.4, 12.0 becomes 14.4 — and `list()` gathers the results into a real list.",
            "The `round(..., 2)` is Part A's floating-point wisdom showing up in practice: multiplying by 1.2 in binary leaves microscopic dust (remember 0.1 + 0.2), so money gets rounded before display.",
          ],
        },
        {
          kind: "heading",
          text: "filter(): keep the ones that pass",
        },
        {
          kind: "code",
          title: "A lambda that answers True or False",
          code: `scores = [88, 42, 95, 61, 73, 50]

passing = list(filter(lambda score: score >= 60, scores))
print(passing)
`,
          output: `[88, 95, 61, 73]`,
          explain: [
            "`filter()` keeps exactly the items for which the function returns True — the passing scores stay, the failing ones (42, 50) are quietly dropped.",
            "Same shape as `map()`: function first, list second, `list()` around the whole thing.",
          ],
        },
        {
          kind: "heading",
          text: "Combinators: apply_twice and friends",
        },
        {
          kind: "text",
          text: "Once functions are values, you can build small machines whose whole job is wiring functions together. Two classics: a function that **composes** two others (run this, then that), and a function that **repeats** one over and over. They look like toys; they are the seed of every plugin system and pipeline you will ever meet:",
        },
        {
          kind: "code",
          title: "Combining and repeating functions",
          code: `def add_bang(text):
    """Add one exclamation mark."""
    return text + "!"


def make_louder(text):
    """Combine two functions: upper first, then add_bang."""
    return add_bang(text.upper())


def apply_twice(func, value):
    """Run func on value, then run func on that result."""
    return func(func(value))


print(add_bang("wow"))
print(make_louder("wow"))
print(apply_twice(add_bang, "wow"))
`,
          output: `wow!
WOW!
wow!!`,
          explain: [
            "`make_louder` composes: `text.upper()` first, then the result flows into `add_bang` — a function using another function on its way to an answer.",
            "`apply_twice` repeats: `func(func(value))` is one line, but it works on ANY one-argument function — hand it `add_bang` and \"wow\" becomes \"wow!!\".",
            "Trace the third output: `add_bang(\"wow\")` gives `\"wow!\"`, then `add_bang(\"wow!\")` gives `\"wow!!\"`. The function traveled in; the wiring did the rest.",
          ],
        },
        {
          kind: "code",
          title: "Three ways to do one job — and a preview",
          code: `prices = [4.5, 12.0, 3.25]

with_tax_loop = []
for price in prices:
    with_tax_loop.append(round(price * 1.2, 2))
print("loop:", with_tax_loop)

with_tax_map = list(map(lambda price: round(price * 1.2, 2), prices))
print("map :", with_tax_map)

with_tax_comp = [round(price * 1.2, 2) for price in prices]
print("list:", with_tax_comp)
`,
          output: `loop: [5.4, 14.4, 3.9]
map : [5.4, 14.4, 3.9]
list: [5.4, 14.4, 3.9]`,
          explain: [
            "Identical results, three spellings: a loop with `.append()`, `map()` plus a lambda, and — new! — a **list comprehension**, the last line.",
            "Read the comprehension right-to-left: *for each price in prices, keep round(price * 1.2, 2)*. It is map's clarity without the lambda. That is Part G's opening topic, and the reason you will rarely need map() with a lambda again.",
          ],
        },
        {
          kind: "table",
          title: "Choosing your tool for list jobs",
          headers: ["Tool", "Reads as", "Reach for it when"],
          rows: [
            ["for loop + append", "For each item, do this", "The steps are several, or the logic is more than one line"],
            ["map(func, items)", "Apply func to every item", "An existing named function fits exactly (or an existing pipeline)"],
            ["filter(func, items)", "Keep items where func says True", "Selecting, not transforming"],
            ["List comprehension (Part G)", "Keep this, for each item, where this holds", "Transforming and/or selecting in one readable line — the Python favorite"],
          ],
          caption:
            "Note what is NOT in this table: cleverness. When two tools tie, pick the one a tired reader understands fastest — that is the professional tiebreaker.",
        },
        {
          kind: "tryIt",
          title: "Build your own map, by hand",
          task: "Run this, then extend it twice. First: define triple(n) that returns n * 3, and print apply_to_all(triple, [1, 2, 3]). Then predict on paper what apply_to_all(double, [10, 20]) prints, and check. You are passing a function as a value — say the words out loud once.",
          code: `def double(n):
    """Double a number."""
    return n * 2


def apply_to_all(func, items):
    """Return a new list: func applied to every item, by hand."""
    result = []
    for item in items:
        result.append(func(item))
    return result


print(apply_to_all(double, [1, 2, 3, 4]))
`,
          hint: "apply_to_all is a five-line map(): an empty list, a loop, func(item) per item, return the result. The prediction for [10, 20] is [20, 40].",
        },
      ],
      terms: [
        { term: "Higher-order function", definition: "A function that takes a function as a parameter, or returns one — like announce(), map(), or apply_twice()." },
        { term: "First-class function", definition: "The property that makes it all possible: functions are values in Python — storable in variables, passable as arguments, returnable from calls." },
        { term: "map()", definition: "Built-in that applies a function to every item of a list and hands back the results lazily; wrap in list() to collect them." },
        { term: "filter()", definition: "Built-in that keeps exactly the items for which the function returns True; same lazy, list()-wrapped pattern as map()." },
        { term: "Combinator", definition: "A small function whose job is wiring other functions together — compose, apply_twice, apply_to_all." },
      ],
      mistakes: [
        {
          mistake: "Passing shout() instead of shout when handing a function over.",
          why: "The parentheses call it immediately — you pass the return value (or crash on missing arguments), not the function itself.",
          fix: "The passing rule: no parentheses. The receiver (announce, map, apply_twice) calls it when the time comes.",
        },
        {
          mistake: "Printing map(...) directly and getting something like <map object at 0x...> instead of the list.",
          why: "map() returns its results lazily, one at a time on demand — printing shows the wrapper object, not the items inside it.",
          fix: "Collect first: print(list(map(lambda ..., items))).",
        },
        {
          mistake: "Writing map() + lambda for logic that has outgrown one line.",
          why: "A three-step transformation squeezed into a lambda becomes unreadable — and unreadable code is wrong code waiting to happen.",
          fix: "Graduate to a named def (or, after Part G, a comprehension). map() is a tool, not a virtue.",
        },
      ],
      takeaways: [
        "Functions are values: store them (say_hello = greet), pass them (announce(msg, shout)), build with them.",
        "The parentheses rule: greet is the function; greet() is a call that runs it now.",
        "map() applies a function to every item; filter() keeps the True ones; both need list() to collect.",
        "Small combinators — apply_twice, apply_to_all — turn one function into a whole toolbox.",
        "Loop, map, or comprehension: choose by clarity. Part G's comprehensions will become your default.",
      ],
      quiz: [
        {
          id: "f-08-q1",
          prompt: "In announce(\"Python is fun\", shout) — what arrives in the style parameter?",
          options: [
            { text: "The function shout itself, un-run — announce decides when to call it", correct: true, feedback: "Exactly — no parentheses means the function travels as a value." },
            { text: "The result of calling shout, which ran during the pass", correct: false, feedback: "That would be announce(\"Python is fun\", shout()) — a different program (and a crash: shout needs an argument)." },
            { text: "The text \"shout\", passed as a string", correct: false, feedback: "Function names are not text — they are function objects, a value type of their own." },
          ],
          explanation: "No parentheses: the function itself is the argument. The receiver calls it later, with its own arguments.",
        },
        {
          id: "f-08-q2",
          prompt: "What does list(map(lambda n: n * 2, [1, 2, 3])) produce?",
          options: [
            { text: "[2, 4, 6]", correct: true, feedback: "Right — the lambda runs once per item, and list() collects the results." },
            { text: "[1, 2, 3, 2, 4, 6]", correct: false, feedback: "map() transforms, it does not append — each item becomes its mapped value." },
            { text: "<map object at 0x...>", correct: false, feedback: "That is what you get WITHOUT the list() wrapper — the lazy wrapper, not the items." },
          ],
          explanation: "map + list(): the lambda per item, collected into a list.",
        },
        {
          id: "f-08-q3",
          prompt: "filter(lambda s: s >= 60, scores) keeps…",
          options: [
            { text: "Only the scores for which the lambda returns True", correct: true, feedback: "Correct — filter selects; the lambda is the judge, True stays, False goes." },
            { text: "Every score, each increased by 60", correct: false, feedback: "That is a transformation — map's job, not filter's." },
            { text: "The 60 highest scores", correct: false, feedback: "No counting involved — filter is a yes/no test per item." },
          ],
          explanation: "filter is the bouncer: the lambda checks each item, True walks in, False stays out.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART F EXERCISES — 4 beginner, 4 intermediate, 4 advanced
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "f-b1",
      tier: "beginner",
      title: "The greeting generator",
      prompt:
        "Write a function greet_user(name, day) that prints exactly two lines: 'Hello, <name>!' and 'Happy <day>!'. Give it a one-line docstring. Then call it three times with three different (name, day) pairs, so the program prints six lines in total. Define the function at the top, before every call.",
      hint: "The function takes two parameters and uses each in one print with an f-string. Each call passes the two arguments positionally: name first, day second.",
      starter: `# Write greet_user(name, day) below, then call it three times.
# It should print two lines per person:
#   Hello, <name>!
#   Happy <day>!

`,
      solution: `def greet_user(name, day):
    """Print a two-line personalized greeting."""
    print(f"Hello, {name}!")
    print(f"Happy {day}!")


greet_user("Ada", "Friday")
greet_user("Grace", "Monday")
greet_user("Linus", "Sunday")
`,
      expectedOutput: `Hello, Ada!
Happy Friday!
Hello, Grace!
Happy Monday!
Hello, Linus!
Happy Sunday!`,
      concepts: ["defining functions", "parameters", "f-strings"],
    },
    {
      id: "f-b2",
      tier: "beginner",
      title: "The temperature converter, packaged",
      prompt:
        "Turn the Part B temperature calculation into a reusable function: write celsius_to_fahrenheit(celsius) that RETURNS the converted value (celsius * 9 / 5 + 32) with a docstring — no printing inside the function. Then loop over the list [0, 25, 100], call the function once per value, and print one line per value in the exact format shown below.",
      hint: "for celsius in [0, 25, 100]: — inside the loop, store fahrenheit = celsius_to_fahrenheit(celsius), then print it with an f-string.",
      starter: `# Write celsius_to_fahrenheit(celsius) that RETURNS the result
# (celsius * 9 / 5 + 32). Then loop over [0, 25, 100] and print
# one line per value: "<celsius> C = <fahrenheit> F"

`,
      solution: `def celsius_to_fahrenheit(celsius):
    """Return the Fahrenheit equivalent of a Celsius temperature."""
    return celsius * 9 / 5 + 32


for celsius in [0, 25, 100]:
    fahrenheit = celsius_to_fahrenheit(celsius)
    print(f"{celsius} C = {fahrenheit} F")
`,
      expectedOutput: `0 C = 32.0 F
25 C = 77.0 F
100 C = 212.0 F`,
      concepts: ["return values", "functions", "for loops"],
    },
    {
      id: "f-b3",
      tier: "beginner",
      title: "Predict: return or print?",
      prompt:
        "Two mystery functions hide the classic trap from lesson f-04: mystery_a PRINTS n + 1, mystery_b RETURNS n + 1. Predict on paper, line by line, what this program prints — all five lines — before you uncomment anything. Then uncomment the five marked lines, run, and score yourself. Every correctly predicted line is proof that return-vs-print is sinking in.",
      hint: "a = mystery_a(10): the 11 appears on screen (the print inside), but a receives None. Then trace print(mystery_a(mystery_b(1))) inside-out: mystery_b(1) gives what? And what does mystery_a do with it — on screen, versus what it hands back to print?",
      starter: `def mystery_a(n):
    print(n + 1)


def mystery_b(n):
    return n + 1


# PREDICT on paper first, then uncomment and check yourself:
# a = mystery_a(10)
# b = mystery_b(10)
# print("a:", a)
# print("b:", b)
# print(mystery_a(mystery_b(1)))
`,
      solution: `def mystery_a(n):
    print(n + 1)


def mystery_b(n):
    return n + 1


a = mystery_a(10)
b = mystery_b(10)
print("a:", a)
print("b:", b)
print(mystery_a(mystery_b(1)))
`,
      expectedOutput: `11
a: None
b: 11
3
None`,
      concepts: ["return vs print", "None", "tracing"],
    },
    {
      id: "f-b4",
      tier: "beginner",
      title: "Fix the broken function",
      prompt:
        "Three bugs hide in this ticket-order program: (1) the call happens before the function is defined, (2) the body uses a misspelled variable name, and (3) the function prints its answer instead of returning it. Fix them one at a time — after each fix, run and read the NEXT error before touching anything else. The finished program must print exactly one line: 'Order total: 28.5'.",
      hint: "Fix in order: move the call below the def (the first crash is NameError: ticket_price), then fix the typo (NameError: prices), then swap print for return — otherwise the last line prints 'Order total: None'.",
      starter: `# Three bugs hide in this program. Fix one, run, read the NEXT problem.
order = ticket_price(9.5, 3)

def ticket_price(price, quantity):
    """Return the total cost of the tickets."""
    total = prices * quantity
    print(total)

print("Order total:", order)
`,
      starterExpectError: "NameError: name 'ticket_price' is not defined",
      solution: `def ticket_price(price, quantity):
    """Return the total cost of the tickets."""
    total = price * quantity
    return total


order = ticket_price(9.5, 3)
print("Order total:", order)
`,
      expectedOutput: `Order total: 28.5`,
      concepts: ["debugging", "define before call", "return values"],
    },

    // ---- intermediate
    {
      id: "f-i1",
      tier: "intermediate",
      title: "The three-number summary",
      prompt:
        "Write min_max_average(numbers) that RETURNS three values: the smallest number, the largest number, and the average. Build all three with a single for loop and accumulators — no min()/max()/sum() this time, the loop is the practice. Then unpack the result of ONE call into low, high, avg for the scores [72, 95, 48, 88, 61] and print exactly three lines, as shown below.",
      hint: "Start smallest = numbers[0] and largest = numbers[0], total = 0. Inside the loop, compare and accumulate all three. average = total / len(numbers). Return them comma-separated.",
      starter: `# Write min_max_average(numbers) that RETURNS three values:
# the smallest, the largest, and the average.
# Use a loop (not min/max/sum) to practice the accumulation pattern.

scores = [72, 95, 48, 88, 61]

# low, high, avg = min_max_average(scores)
# print(f"low: {low}")
# print(f"high: {high}")
# print(f"average: {avg}")
`,
      solution: `def min_max_average(numbers):
    """Return the smallest, largest, and average of a list of numbers."""
    smallest = numbers[0]
    largest = numbers[0]
    total = 0
    for n in numbers:
        if n < smallest:
            smallest = n
        if n > largest:
            largest = n
        total = total + n
    average = total / len(numbers)
    return smallest, largest, average


scores = [72, 95, 48, 88, 61]
low, high, avg = min_max_average(scores)
print(f"low: {low}")
print(f"high: {high}")
print(f"average: {avg}")
`,
      expectedOutput: `low: 48
high: 95
average: 72.8`,
      concepts: ["multiple return values", "unpacking", "accumulator pattern"],
    },
    {
      id: "f-i2",
      tier: "intermediate",
      title: "Predict: the scope shuffle",
      prompt:
        "One global value, one local that shadows it, one parameter that shadows it again. Predict all THREE output lines on paper before running — then run and check yourself. Afterward, add a function show_double(value) that prints value * 2, call it with the top-level value, and predict whether the global changes (it must not — explain why in a comment before you run the four-line version).",
      hint: "Inside show_local, the line value = 1 creates a LOCAL — the global is untouched. Parameters work the same way: value inside show_param is a fresh local that shadows the global. Nothing any function does can change the top-level variable here.",
      starter: `# PREDICT the three lines before running. Then run and check yourself.
value = 100

def show_local():
    value = 1
    print("inside show_local :", value)


def show_param(value):
    print("inside show_param :", value)


show_local()
show_param(7)
print("at the top level  :", value)

# TODO after predicting: add show_double(value) that prints value * 2,
# call it with value, and predict what the top-level value is afterwards.
`,
      solution: `value = 100

def show_local():
    value = 1
    print("inside show_local :", value)


def show_param(value):
    print("inside show_param :", value)


def show_double(value):
    # value here is a fresh LOCAL (parameters shadow globals),
    # so printing value * 2 cannot change the top-level variable.
    print("inside show_double:", value * 2)


show_local()
show_param(7)
show_double(value)
print("at the top level  :", value)
`,
      expectedOutput: `inside show_local : 1
inside show_param : 7
inside show_double: 200
at the top level  : 100`,
      concepts: ["scope", "local variables", "shadowing"],
    },
    {
      id: "f-i3",
      tier: "intermediate",
      title: "Sort by length, then by price",
      prompt:
        "Two sorting jobs, two lambda keys, no loops in sight. First, sort words from shortest to longest and print the whole list on one line. Then sort products (name, price) tuples from cheapest to most expensive and print one 'name: $price' line per product, each price with exactly two decimals. Both jobs use sorted() with a key=lambda — that is the entire point.",
      hint: "By length: key=lambda word: len(word). By price: key=lambda product: product[1]. Two decimals: f\"{name}: \${price:.2f}\" — and unpack tuples with for name, price in by_price.",
      starter: `# Sort words by length and products by price, using lambda keys.
words = ["python", "hi", "lambda", "code", "functions"]
products = [("mug", 8.0), ("spoon", 3.25), ("plate", 12.5), ("fork", 4.75)]

# by_length = sorted(words, key=...)
# print("shortest to longest:", by_length)

# by_price = sorted(products, key=...)
# for name, price in by_price:
#     print(f"{name}: \${price:.2f}")
`,
      solution: `words = ["python", "hi", "lambda", "code", "functions"]
by_length = sorted(words, key=lambda word: len(word))
print("shortest to longest:", by_length)

products = [("mug", 8.0), ("spoon", 3.25), ("plate", 12.5), ("fork", 4.75)]
by_price = sorted(products, key=lambda product: product[1])
for name, price in by_price:
    print(f"{name}: \${price:.2f}")
`,
      expectedOutput: `shortest to longest: ['hi', 'code', 'python', 'lambda', 'functions']
spoon: $3.25
fork: $4.75
mug: $8.00
plate: $12.50`,
      concepts: ["sorted()", "lambda", "key functions"],
    },
    {
      id: "f-i4",
      tier: "intermediate",
      title: "The recursive countdown",
      prompt:
        "Write countdown(n) recursively, with a one-line docstring: if n is 0, print 'Liftoff!' and return (the base case); otherwise print n, then call countdown on n - 1 (the recursive case). No loops allowed — the recursion IS the exercise. The program calls countdown(5) and then countdown(2), producing exactly nine lines.",
      hint: "Two rules only: the base case answers directly, the recursive case shrinks (n - 1). Every call gets its own frame — each paused frame simply has nothing left to do after its inner call returns.",
      starter: `# Write countdown(n): print n, n-1, ... 1, then "Liftoff!"
# Base case: n == 0 (print Liftoff! and return).
# Recursive case: print n, then call countdown(n - 1).

`,
      solution: `def countdown(n):
    """Print the numbers n down to 1, then 'Liftoff!'."""
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)


countdown(5)
countdown(2)
`,
      expectedOutput: `5
4
3
2
1
Liftoff!
2
1
Liftoff!`,
      concepts: ["recursion", "base case", "call stack"],
    },

    // ---- advanced
    {
      id: "f-a1",
      tier: "advanced",
      title: "The recursive sum — and length",
      prompt:
        "Write recursive_sum(numbers) with the two-part rule: base case — an empty list returns 0; recursive case — the first item plus recursive_sum of the rest (use slicing for 'the rest'). Then prove the pattern transfers by writing recursive_length(items) the same way: 0 for empty, otherwise 1 plus the length of the rest. The program prints four lines: three sums and one length, exactly as shown below.",
      hint: "The two bodies are nearly identical in shape: if numbers == []: return 0, then either numbers[0] + recursive_sum(numbers[1:]) or 1 + recursive_length(items[1:]). No loops — the recursion does the walking.",
      starter: `# Write recursive_sum(numbers) with:
#   base case:      empty list -> 0
#   recursive case: first item + sum of the rest (numbers[1:])
# Then write recursive_length(items) the same way: 1 + length of the rest.

# print(recursive_sum([]))
# print(recursive_sum([7]))
# print(recursive_sum([10, 20, 30, 40]))
# print(recursive_length(["a", "b", "c", "d"]))
`,
      solution: `def recursive_sum(numbers):
    """Return the sum of a list, computed recursively."""
    if numbers == []:
        return 0
    return numbers[0] + recursive_sum(numbers[1:])


def recursive_length(items):
    """Return the number of items, computed recursively."""
    if items == []:
        return 0
    return 1 + recursive_length(items[1:])


print(recursive_sum([]))
print(recursive_sum([7]))
print(recursive_sum([10, 20, 30, 40]))
print(recursive_length(["a", "b", "c", "d"]))
`,
      expectedOutput: `0
7
100
4`,
      concepts: ["recursion", "base case", "slicing"],
    },
    {
      id: "f-a2",
      tier: "advanced",
      title: "apply_to_all, by hand",
      prompt:
        "Build your own map. Write add_tax(price) that returns price * 1.2. Then write apply_to_all(func, items): create an empty result list, loop over items, append func(item) for each one, and RETURN the result list — no printing inside either function. Finally call apply_to_all(add_tax, [4.0, 10.0, 25.0]) at the top level and print what comes back. Notice that add_tax itself never prints anything — the print lives at the top level, with the caller.",
      hint: "apply_to_all is five lines: result = [], for item in items:, result.append(func(item)), return result. The function travels in through func — no parentheses on add_tax at the call.",
      starter: `# Write add_tax(price) that returns price * 1.2.
# Then write apply_to_all(func, items): build a NEW list by applying
# func to every item with a loop, and RETURN it.

prices = [4.0, 10.0, 25.0]

# with_tax = apply_to_all(add_tax, prices)
# print(with_tax)
`,
      solution: `def add_tax(price):
    """Add 20 percent tax to a price."""
    return price * 1.2


def apply_to_all(func, items):
    """Return a new list with func applied to every item."""
    result = []
    for item in items:
        result.append(func(item))
    return result


prices = [4.0, 10.0, 25.0]
with_tax = apply_to_all(add_tax, prices)
print(with_tax)
`,
      expectedOutput: `[4.8, 12.0, 30.0]`,
      concepts: ["higher-order functions", "functions as values", "loops"],
    },
    {
      id: "f-a3",
      tier: "advanced",
      title: "The conversion table, with a default step",
      prompt:
        "Write celsius_to_fahrenheit(celsius) that returns the converted value. Then write print_conversion_table(start, stop, step=10) with a default step: print the header line, then one aligned line per temperature from start up to and including stop, moving by step each time — the integer Celsius right-aligned in 4 characters, then ' -> ', then the Fahrenheit with exactly one decimal right-aligned in 6. Call it as print_conversion_table(0, 40) (default step) and print_conversion_table(-10, 10, step=5) (keyword argument), with one blank line between the two tables.",
      hint: "Header: f\"{'C':>4} -> {'F':>6}\". Rows: f\"{celsius:>4} -> {fahrenheit:>6.1f}\". Walk with a while celsius <= stop loop and celsius = celsius + step at the end.",
      starter: `# Write celsius_to_fahrenheit(celsius) that RETURNS the value.
# Then write print_conversion_table(start, stop, step=10):
# print a header, then one aligned line per temperature from start
# up to stop (inclusive), moving by step each time.

# print_conversion_table(0, 40)
# print()
# print_conversion_table(-10, 10, step=5)
`,
      solution: `def celsius_to_fahrenheit(celsius):
    """Return the Fahrenheit equivalent of a Celsius temperature."""
    return celsius * 9 / 5 + 32


def print_conversion_table(start, stop, step=10):
    """Print a C-to-F table from start up to stop, in steps of \`step\`."""
    print(f"{'C':>4} -> {'F':>6}")
    celsius = start
    while celsius <= stop:
        fahrenheit = celsius_to_fahrenheit(celsius)
        print(f"{celsius:>4} -> {fahrenheit:>6.1f}")
        celsius = celsius + step


print_conversion_table(0, 40)
print()
print_conversion_table(-10, 10, step=5)
`,
      expectedOutput: `   C ->      F
   0 ->   32.0
  10 ->   50.0
  20 ->   68.0
  30 ->   86.0
  40 ->  104.0

   C ->      F
 -10 ->   14.0
  -5 ->   23.0
   0 ->   32.0
   5 ->   41.0
  10 ->   50.0`,
      concepts: ["default parameters", "keyword arguments", "f-strings", "while loops"],
    },
    {
      id: "f-a4",
      tier: "advanced",
      title: "apply_n_times — the function repeater",
      prompt:
        "Write double(n) and add_bang(text), each a one-line body with a return and a docstring. Then write apply_n_times(func, value, times): start from value and apply func to the running result, `times` times over, in a loop — returning the final result. Predict both outputs on paper first (3 doubled four times; 'wow' banged three times), then check: the program must print exactly 48 and wow!!!.",
      hint: "result = value, then for i in range(times): result = func(result), then return result. The function travels in through func — no parentheses on double or add_bang at the call site.",
      starter: `# Write double(n) and add_bang(text), each returning a value.
# Then write apply_n_times(func, value, times): start from value and
# apply func \`times\` times over, returning the final result.

# print(apply_n_times(double, 3, 4))
# print(apply_n_times(add_bang, "wow", 3))
`,
      solution: `def double(n):
    """Double a number."""
    return n * 2


def add_bang(text):
    """Add one exclamation mark to the end."""
    return text + "!"


def apply_n_times(func, value, times):
    """Apply func to value, \`times\` times over."""
    result = value
    for i in range(times):
        result = func(result)
    return result


print(apply_n_times(double, 3, 4))
print(apply_n_times(add_bang, "wow", 3))
`,
      expectedOutput: `48
wow!!!`,
      concepts: ["higher-order functions", "loops", "functions as values"],
    },
  ],

  // =====================================================================
  // PART F ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "f-as-1",
      prompt: "A file contains def greet(): with a one-line body — but greet() is never written anywhere. What does running the file print?",
      options: [
        { text: "Nothing at all — a definition is stored, not executed", correct: true, feedback: "Correct. def files the recipe away; without a call, the body never runs." },
        { text: "The body's line once — Python checks functions by running them", correct: false, feedback: "Python never pre-runs function bodies; only a call executes them." },
        { text: "A SyntaxError — an uncalled function is illegal", correct: false, feedback: "Useless, not illegal: an uncalled function is stored silently." },
      ],
      explanation: "Definitions run nothing. The body executes only when a call — greet() — arrives.",
    },
    {
      id: "f-as-2",
      prompt: "Predict the output of this program: def add(a, b): print(a + b) — then result = add(2, 3), then print(result).",
      options: [
        { text: "5, then None", correct: true, feedback: "Exactly: the 5 goes to the screen from inside the function; what comes back to the caller is None, and print(result) shows it." },
        { text: "5, then 5", correct: false, feedback: "That assumes the printed 5 also came back — printing and returning are different channels." },
        { text: "None, then 5", correct: false, feedback: "Reversed: the print inside the function runs first, so the 5 appears first." },
        { text: "Just 5", correct: false, feedback: "Count the prints: one inside the function, one outside — two lines appear." },
      ],
      explanation: "Screen first (the 5 from inside add), then the caller's channel: None, because add has no return statement.",
    },
    {
      id: "f-as-3",
      prompt: "In def greet(name): with the call greet(\"Ada\") — which is the parameter and which is the argument?",
      options: [
        { text: "name is the parameter (a placeholder in the definition); \"Ada\" is the argument (the value at the call)", correct: true, feedback: "Exactly — the parking spot and the car that parks in it." },
        { text: "\"Ada\" is the parameter; name is the argument", correct: false, feedback: "Reversed: placeholders live in the definition, values arrive in calls." },
        { text: "Both are arguments — Python calls every input an argument", correct: false, feedback: "Python's docs use both words precisely, and so should you: parameter in the def, argument in the call." },
      ],
      explanation: "Parameter = the named blank in the definition. Argument = the real value a call writes into it.",
    },
    {
      id: "f-as-4",
      prompt: "Predict all three lines: def make_smoothie(fruit=\"banana\", size=\"medium\"): print(f\"{size} {fruit} smoothie\") — then make_smoothie(), make_smoothie(\"mango\"), make_smoothie(size=\"large\").",
      options: [
        { text: "medium banana smoothie / medium mango smoothie / large banana smoothie", correct: true, feedback: "Perfect trace: defaults, positional override, keyword override." },
        { text: "medium banana smoothie / medium mango smoothie / large mango smoothie", correct: false, feedback: "So close — but \"mango\" only lived in the second call. The third call overrides size only; fruit returns to its default." },
        { text: "An error on the third line: fruit is missing", correct: false, feedback: "Missing slots are exactly what defaults are for — no error, banana returns." },
        { text: "banana medium smoothie / mango medium smoothie / banana large smoothie", correct: false, feedback: "Watch the f-string order: {size} comes first, then {fruit}." },
      ],
      explanation: "Defaults fill only the slots a call leaves empty — and keyword arguments skip slots without disturbing the others.",
    },
    {
      id: "f-as-5",
      prompt: "Predict: def mix(): color = \"teal\" — the program calls mix(), then print(color). What happens?",
      options: [
        { text: "NameError — color lived only inside mix, only for that call", correct: true, feedback: "Correct: locals are destroyed at return; outside, the name never existed." },
        { text: "Prints teal — the value is still around after the call", correct: false, feedback: "No luggage survives checkout: the local vanished when mix returned." },
        { text: "Prints None — the local emptied itself", correct: false, feedback: "None is a return value, not what a destroyed variable leaves behind." },
      ],
      explanation: "A local variable's scope is its function, for the duration of one call. Outside: NameError.",
    },
    {
      id: "f-as-6",
      prompt: "What does sorted([\"banana\", \"fig\", \"apple\"], key=lambda word: len(word)) return?",
      options: [
        { text: "['fig', 'apple', 'banana']", correct: true, feedback: "Right — ordered by length: fig (3), apple (5), banana (6)." },
        { text: "['apple', 'banana', 'fig']", correct: false, feedback: "That is plain alphabetical sorting — the key= was ignored in your prediction." },
        { text: "['banana', 'apple', 'fig']", correct: false, feedback: "That is longest-first; key= sorts ascending by default (reverse=True would flip it)." },
        { text: "[3, 5, 6]", correct: false, feedback: "The lambda measures the items, but sorted() returns the original items in the new order — not the measurements." },
      ],
      explanation: "key= replaces the default comparison: order by len(word), shortest first, but return the words themselves.",
    },
    {
      id: "f-as-7",
      prompt: "A recursive function's base case is missing (or never reached). What does Python do?",
      options: [
        { text: "Raises RecursionError after roughly a thousand stacked calls — it does not run forever", correct: true, feedback: "Correct — the interpreter's circuit breaker: maximum recursion depth exceeded." },
        { text: "Runs forever, printing deeper and deeper output", correct: false, feedback: "It can feel forever, but the depth limit stops it after about a thousand frames." },
        { text: "Raises a SyntaxError the moment the def line is read", correct: false, feedback: "The def is perfectly legal — the disaster only happens while running, call after call." },
      ],
      explanation: "RecursionError is the runtime symptom of a missing base case: frames pile up until the limit trips.",
    },
    {
      id: "f-as-8",
      prompt: "You write announce(\"Hi\", shout) and it works. What changes if you write announce(\"Hi\", shout()) instead?",
      options: [
        { text: "shout() runs IMMEDIATELY, at the moment of the pass — and only its return value travels into the parameter", correct: true, feedback: "Exactly the parentheses rule: no parens passes the function; parens call it now and pass the result." },
        { text: "Nothing — the two spellings are interchangeable", correct: false, feedback: "They pass completely different values: a function object versus whatever that function returns." },
        { text: "shout() is a syntax error — functions cannot be called inside arguments", correct: false, feedback: "Calling inside arguments is legal; it just changes WHAT travels: the return value, not the function." },
      ],
      explanation: "greet is the function; greet() is a call. Which one you pass decides whether behavior travels or a value does.",
    },
  ],

  // =====================================================================
  // PART F MINI PROJECT
  // =====================================================================
  project: {
    title: "The Statistics Toolkit",
    brief:
      "You will build a small library of statistics functions — a recursive sum, a mean built on top of it, a median, a threshold counter with a default parameter, grade letters, and a hottest-day finder powered by sorted() with a lambda — then compose them into one report printer and run it over two hardcoded datasets: a week of daily temperatures and a set of student scores. Every math function returns its answer; only the report printer prints. This is the capstone of the functions part: define, document, compose, call — def to lambda to recursion in one program you could honestly reuse.",
    requirements: [
      "Every function has a one-line docstring — help(sum_list) must show it",
      "sum_list is recursive: an empty list returns 0; otherwise first item + sum_list of the rest — no loops inside",
      "mean, median, count_above, grade_letter, and hottest_day RETURN their answers — none of them prints",
      "count_above(numbers, threshold=60) and format_report(title, numbers, threshold=60) both use a default parameter",
      "hottest_day uses sorted() with a lambda key (and reverse=True) on (day, temperature) pairs",
      "format_report is the only function that prints: a title banner, the count of values, the mean with one decimal, the median, how many values are above the threshold, and the grade letter of the mean",
      "The main program hardcodes five (day, temperature) pairs and eight student scores, and prints both reports — plus the hottest day and the grade letter of the mean score",
      "Running the program prints both reports (each at least six lines) with zero errors, and no leftover test prints",
    ],
    steps: [
      "Step 1 — Create the file with the header comment and write sum_list (base case, recursive case, docstring). Test it immediately with print(sum_list([10, 20, 30])) — expect 30 — and keep the test line until the final pass.",
      "Step 2 — Write mean on top of your own function: sum_list(numbers) divided by len(numbers). Test mean([2, 4, 6]) — expect 4.0 — and notice that this is composition: your function calling your function.",
      "Step 3 — Write median: ordered = sorted(numbers), then return the item at index len(ordered) // 2. Test median([1, 2, 3]) — expect 2 — and write a one-line comment noting what the // 2 middle means for even-length lists.",
      "Step 4 — Write count_above(numbers, threshold=60) with a loop and a counter. Test count_above([88, 42, 95], 60) — expect 2 — and also with one argument only, to see the default work.",
      "Step 5 — Write grade_letter(score): A for 90 and up, B for 80 and up, C for 70 and up, otherwise F. Test grade_letter(77) — expect C.",
      "Step 6 — Write hottest_day(days): sorted(days, key=lambda day: day[1], reverse=True)[0]. Test it on the five hardcoded days — expect Thursday — and read the lambda aloud once: sort by the temperature, highest first.",
      "Step 7 — Write format_report(title, numbers, threshold=60): print a banner (a line of = signs, the title, the line again), then Count, Mean (formatted with :.1f), Median, Above threshold, and Grade of mean — computing all of them by calling your other functions.",
      "Step 8 — The main program: build the plain temperature list from the (day, temperature) pairs with a small loop, call format_report for the temperatures (threshold=20) and for the scores (threshold=60), then print the hottest day and the grade letter of the mean score. Final pass: delete every leftover test print, reread every docstring, run once from the top.",
    ],
    starter: `# ============================================================
# The Statistics Toolkit
# A small library of statistics functions + two reports.
# Author: (your name)
# ============================================================

# --- Step 1: the recursive sum ---------------------------------
def sum_list(numbers):
    """Return the sum of a list of numbers, computed recursively."""
    # TODO base case:      empty list -> 0
    # TODO recursive case: first item + sum_list of the rest
    return 0  # placeholder


# --- Step 2: the mean -------------------------------------------
def mean(numbers):
    """Return the average (mean) of a list of numbers."""
    # TODO: sum_list(numbers) divided by len(numbers)
    return 0  # placeholder


# --- Step 3: the median -----------------------------------------
def median(numbers):
    """Return the middle value of the sorted list."""
    # TODO: ordered = sorted(numbers); return ordered[len(ordered) // 2]
    return 0  # placeholder


# --- Step 4: counting above a threshold (default!) --------------
def count_above(numbers, threshold=60):
    """Return how many values are strictly above the threshold."""
    # TODO: loop over numbers, count the ones above threshold
    return 0  # placeholder


# --- Step 5: grade letters --------------------------------------
def grade_letter(score):
    """Return 'A' (>= 90), 'B' (>= 80), 'C' (>= 70), or 'F'."""
    # TODO: if / elif chain, returning the letter
    return "F"  # placeholder


# --- Step 6: the hottest day, sorted + lambda -------------------
def hottest_day(days):
    """Return the (day, temperature) pair with the highest temperature."""
    # TODO: sorted(days, key=lambda day: day[1], reverse=True)[0]
    return None  # placeholder


# --- Step 7: the report printer (the ONLY function that prints) -
def format_report(title, numbers, threshold=60):
    """Print a ruled, titled statistics report for a list of numbers."""
    # TODO: banner (= signs + title + = signs), then Count, Mean (:.1f),
    #       Median, Above threshold, and Grade of the mean — all by
    #       calling the functions above, never recomputing by hand
    pass


# --- Step 8: the main program -----------------------------------
temperatures = [("Mon", 21.5), ("Tue", 24.0), ("Wed", 19.5), ("Thu", 26.5), ("Fri", 23.0)]
scores = [88, 72, 95, 61, 79, 83, 47, 91]

# TODO: build temp_values, the plain list of the five temperatures
# TODO: format_report("WEEKLY TEMPERATURES", temp_values, threshold=20)
# TODO: format_report("STUDENT SCORES", scores)
# TODO: print the hottest day and the grade letter of the mean score
`,
    concepts: ["functions", "docstrings", "return values", "default parameters", "recursion", "sorted() with lambda", "composition"],
    extension:
      "A function that takes a function: write keep_if(numbers, condition) — it loops over the list, keeps every item for which condition(item) is True, and returns them as a new list. Test it with keep_if(scores, lambda s: s >= 80) (expect [88, 95, 83, 91]) and then with a lambda of your own choosing. Congratulations — you just wrote your own filter(), and you passed a function as a value with full confidence.",
  },
};
