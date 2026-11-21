/**
 * PART I — ADVANCED PYTHON
 *
 * The professional toolbelt: type hints, dataclasses, context managers,
 * functional programming, concurrency, async, testing, debugging,
 * performance, and packaging.
 *
 * Lesson order: type hints -> dataclasses -> context managers -> functional
 * programming -> concurrency fundamentals -> async -> testing -> debugging
 * -> performance -> packaging.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 * Machine-dependent outputs (mypy reports, pytest runs, timings, pdb
 * sessions, pip installs) use lang "bash"/"text" and are never presented as
 * verified program output.
 */
import type { Part } from "@/lib/course/types";

export const PART_I: Part = {
  letter: "I",
  title: "Advanced Python",
  tagline: "Type hints, async, testing, performance, and packaging",
  description:
    "Type hints, dataclasses, context managers, functional programming, concurrency, async, testing, debugging, performance, and packaging.",

  lessons: [
    // ------------------------------------------------------------- i-01
    {
      slug: "i-01",
      title: "Type Hints",
      minutes: 14,
      summary:
        "Annotate variables and functions with types — what list[int], dict[str, float], X | None and Callable mean, why your editor gets smarter overnight, and why hints never slow your program down.",
      kind: "concept",
      objectives: [
        "Annotate variables and function signatures with type hints",
        "Read modern hints fluently: list[int], dict[str, float], int | None, Callable",
        "Explain what the interpreter does with hints at runtime (documentation, not enforcement)",
        "Describe how a static checker like mypy catches bugs before the code ever runs",
      ],
      why: "You have written eight parts of Python without a single type annotation, and everything worked. So why do most professional Python codebases annotate nearly every function now? Because code is read far more often than it is written, and the question a maintainer asks most is: what kind of value goes in here, and what comes out? Type hints answer that in one line, supercharge your editor's autocomplete, and let a static checker catch bugs like passing a string where a list is expected — before the program ever runs. They cost nothing at runtime, which you will prove yourself in this lesson.",
      blocks: [
        {
          kind: "text",
          text: "Somewhere in Part H you probably wrote a function like `def process(items):` and then had to scroll into the body to figure out what *items* was supposed to be — a list? a dict? strings? numbers? That question is where bugs are born. **Type hints** (also called *annotations*) let you answer it right in the signature, once, in a way both humans and tools can read.",
        },
        {
          kind: "heading",
          text: "Labels on containers",
        },
        {
          kind: "text",
          text: "Think of a professional kitchen: every storage container is labeled — *flour*, *sugar*, *salt*. Not because the cooks are beginners, but because after six months nobody can tell white powders apart on sight. Type hints are those labels for your code. `scores: list[int]` says 'this container holds integers' to everyone who reads it later — including future you, at 2 a.m., during an outage.",
        },
        {
          kind: "code",
          title: "Annotated variables",
          code: `name: str = "Ada"
age: int = 36
scores: list[int] = [91, 84, 77]

print(name, age, scores)
`,
          output: `Ada 36 [91, 84, 77]`,
          outputNote: "Real output — the program behaves exactly as it would without the annotations.",
          explain: [
            "The pattern is `name: type = value`. Read the colon as *'is a'*: name is a str, age is an int.",
            "`list[int]` is the modern way to write 'a list of integers' — the item type goes in square brackets, describing the contents the way the value itself does.",
            "Nothing about the program's behavior changed. Hints are a documentation layer the interpreter keeps but does not act on — and you are about to prove that, because it surprises everyone.",
          ],
        },
        {
          kind: "text",
          text: "Python does **not enforce** type hints at runtime. You can annotate `count: int` and then store a string in it, and nothing crashes:",
        },
        {
          kind: "code",
          title: "The proof: no enforcement, but also no deletion",
          code: `count: int = 10
count = "ten"        # wrong type — Python stays silent at runtime
print(count, type(count).__name__)

def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Ada"))
print(greet.__annotations__)
`,
          output: `ten str
Hello, Ada!
{'name': <class 'str'>, 'return': <class 'str'>}`,
          outputNote: "The wrong type sailed through — yet the hints survived, stored as real objects.",
          explain: [
            "Line 2 stored a string in an `int`-labeled variable. Python allowed it — annotations are not contracts at runtime.",
            "But the hints were not thrown away either: `__annotations__` shows the interpreter stored them as data — which is exactly why tools can read them.",
            "`-> str` after the parentheses annotates the *return value*. Read it as 'greet returns a str'.",
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Runtime erasure — the precise version",
          text: "You will hear that Python 'erases' type hints. The precise truth: the interpreter *stores* them once, at definition time, and never *checks* them while your code executes. So 'erasure' means **no runtime enforcement and no runtime cost** — not that the hints are deleted. That single design decision is why hints are free at runtime and why a separate tool is needed to enforce them.",
        },
        {
          kind: "heading",
          text: "The hint toolbox: containers, optional values, unions, Callable",
        },
        {
          kind: "code",
          title: "The hints you will read in real codebases",
          code: `from typing import Callable

def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)

def find_id(users: dict[str, int], name: str) -> int | None:
    return users.get(name)

def apply_twice(value: int, transform: Callable[[int], int]) -> int:
    return transform(transform(value))

def describe(value: int | str) -> str:
    return f"value is {value!r}"

print(average([91.0, 84.0, 77.0]))
print(find_id({"ada": 1, "grace": 2}, "grace"))
print(find_id({"ada": 1, "grace": 2}, "linus"))
print(apply_twice(3, lambda x: x * 2))
print(describe(7))
print(describe("seven"))
`,
          output: `84.0
2
None
12
value is 7
value is 'seven'`,
          outputNote: "Every function behaves normally — the hints describe, they do not restrict.",
          explain: [
            "`dict[str, int]` reads inside-out: a dict whose keys are strings and whose values are ints — a user directory.",
            "`int | None` means 'an int, or nothing' — the modern spelling of what older code calls `Optional[int]`. It is perfect for lookups that can miss: `find_id` returned `None` for 'linus'.",
            "`Callable[[int], int]` means 'any callable that takes one int and returns an int' — so the lambda qualifies.",
            "A parameter can accept several types: `value: int | str` says either is fine, and the body must handle both — which `describe` does.",
          ],
        },
        {
          kind: "table",
          title: "The hints you will read most",
          headers: ["Hint", "It promises", "Typical use"],
          rows: [
            ["`list[int]`", "a list whose items are ints", "scores, ids, counters"],
            ["`dict[str, float]`", "string keys, float values", "prices by product name"],
            ["`str | None`", "a string, or None", "optional lookups, 'not found' results"],
            ["`Callable[[int], int]`", "any function taking an int, returning an int", "callbacks, transforms"],
            ["`list[str] | list[int]`", "one list of strings OR one list of ints", "either/or inputs"],
          ],
          caption:
            "Notice how hints compose: list[str | None] is 'a list of optional strings'. Once you can read one hint, you can read them all.",
        },
        {
          kind: "heading",
          text: "mypy: the checker that reads your hints",
        },
        {
          kind: "text",
          text: "Since the interpreter ignores hints for enforcement, who enforces them? A **static type checker** — a program that reads your code without running it and reports contradictions. The most popular is **mypy**. Install it once with `pip install mypy`, then point it at a file:",
        },
        {
          kind: "code",
          title: "A typical mypy report (shown, not executed)",
          lang: "bash",
          code: `$ pip install mypy
$ mypy prices.py
prices.py:12: error: Argument 1 to "average" has incompatible type
    "list[str]"; expected "list[float]"  [arg-type]
Found 1 error in 1 file (checked 1 source file)`,
          outputNote:
            "Typical mypy output (displayed, not executed in this lesson): it names the file, the line, the wrong type it found, and the type it expected — a bug caught before the program ever runs.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Gradual typing: the philosophy",
          text: "Python's type system is *gradual*: hints are optional everywhere. You can annotate one function today, another next month, and skip the messy ones forever. Most teams annotate public function signatures first (parameters and return types) and let the editor infer local variables. Start small — every hint pays interest every time someone reads the code.",
        },
        {
          kind: "tryIt",
          title: "Annotate it yourself",
          task: "This function works but is unlabeled. Add a type hint to the parameter (a str) and the return value (an int) — the pattern is def word_score(word: str) -> int:. Then run: the output is identical, but any reader now knows the contract at a glance. Bonus: run print(word_score.__annotations__) to see your hints stored.",
          code: `def word_score(word):
    return len(word) * 10

print(word_score("python"))
print(word_score("ada"))
`,
          hint: "The colon goes after the parameter name, the return hint after the closing parenthesis: def word_score(word: str) -> int:",
        },
      ],
      terms: [
        { term: "Type hint", definition: "An annotation stating what type a variable, parameter, or return value is expected to be, like name: str or -> int." },
        { term: "Annotation", definition: "The general name for the name: type syntax; stored by Python in __annotations__ but never checked while the program runs." },
        { term: "Static type checker", definition: "A tool such as mypy that reads type hints and reports contradictions without executing the code." },
        { term: "Runtime erasure", definition: "The fact that hints change nothing while code executes — no checks, no speed cost; only stored metadata remains." },
        { term: "Gradual typing", definition: "Python's philosophy that hints are optional everywhere: annotate what helps, ignore the rest." },
      ],
      mistakes: [
        {
          mistake: "Expecting Python to enforce your hints at runtime.",
          why: "The interpreter stores annotations but never checks them — count: int = \"ten\" runs without complaint, and the bug surfaces far from its cause.",
          fix: "Treat hints as documentation for humans and tools, and run a static checker like mypy to actually catch violations before execution.",
        },
        {
          mistake: "Using the old typing-module spellings when modern ones exist.",
          why: "Older tutorials write from typing import List, Optional and then List[int] and Optional[int] — extra imports that predate Python 3.9 built-in generics and the 3.10 pipe syntax.",
          fix: "Use list[int], dict[str, float], and int | None directly; reserve the typing module for tools like Callable.",
        },
        {
          mistake: "Believing annotations slow the program down.",
          why: "It sounds logical — extra syntax must cost something — but there is no runtime checking, so there is nothing to pay while the code executes.",
          fix: "Annotate freely, even in hot loops; if you want certainty, measure with the tools from lesson i-09.",
        },
      ],
      takeaways: [
        "Type hints are labels: they document what kind of value belongs where, for humans and tools alike.",
        "Python stores hints but never enforces them at runtime — enforcement is mypy's job, before the code runs.",
        "Read the modern spellings fluently: list[int], dict[str, float], int | None (optional), Callable[[int], int] (a function).",
        "Gradual typing means hints are optional everywhere — annotate function signatures first, expand when it pays.",
      ],
      quiz: [
        {
          id: "i-01-q1",
          prompt: "What does Python's interpreter do with a type hint while your program runs?",
          options: [
            { text: "Enforces it — storing a wrong type raises TypeError immediately", correct: false, feedback: "No runtime enforcement exists; the wrong type sails through until a static checker or a later crash exposes it." },
            { text: "Stores the annotation but never checks it during execution", correct: true, feedback: "Exactly — stored in __annotations__, ignored by the running code. Free at runtime, enforced only by external tools." },
            { text: "Compiles the function into faster machine code using the hint", correct: false, feedback: "Hints neither speed up nor slow down execution — there is simply nothing to enforce." },
          ],
          explanation: "Storage without enforcement: that is the whole design, and it is why hints cost nothing at runtime.",
        },
        {
          id: "i-01-q2",
          prompt: "The hint dict[str, float] promises…",
          options: [
            { text: "A dict with string keys and float values", correct: true, feedback: "Correct — read the brackets as 'key type, value type', like a price table keyed by product name." },
            { text: "A dict that can hold either strings or floats as values", correct: false, feedback: "That would be dict[str, str | float] — the pipe goes on the value type when either is allowed." },
            { text: "Two values: a string and a float", correct: false, feedback: "That describes a tuple (str, float), not a dict." },
          ],
          explanation: "Container hints describe the contents: dict[str, float] maps strings to floats, period.",
        },
        {
          id: "i-01-q3",
          prompt: "Which signature correctly describes a lookup that might not find anything?",
          options: [
            { text: "def find(users: dict[str, int], name: str) -> int", correct: false, feedback: "This promises an int always comes back — but a miss has to return something, and lying in the hint is worse than no hint." },
            { text: "def find(users: dict[str, int], name: str) -> int | None", correct: true, feedback: "Right — found means an int, not found means None. The pipe belongs on the return type." },
            { text: "def find(users: dict[str, int] | None, name: str) -> int", correct: false, feedback: "That says the DICT itself may be missing — a different (also useful) claim." },
          ],
          explanation: "Optional results are the number one use of X | None: the function honestly admits it can come back empty-handed.",
        },
      ],
    },

    // ------------------------------------------------------------- i-02
    {
      slug: "i-02",
      title: "Dataclasses",
      minutes: 14,
      summary:
        "@dataclass writes your __init__, __repr__ and __eq__ for you — plus defaults, field(default_factory=list) for mutable fields, frozen=True for read-only records, and when a plain class or a dict still wins.",
      kind: "coding",
      objectives: [
        "Convert a hand-written Part H class into a @dataclass",
        "Add defaults and use field(default_factory=list) for mutable fields",
        "Create frozen (immutable) dataclasses and explain when to want them",
        "Choose correctly between a dataclass, a hand-written class, and a dict",
      ],
      why: "Part H taught you to write classes by hand, and you probably noticed the pattern: most of your classes existed to carry data — a few fields, an __init__ that just assigns them, a __repr__ you wrote only to make printing useful, an __eq__ to compare two objects. That is a lot of ceremony for 'a bag of named values'. The dataclasses module writes all of it for you from one annotated class body, so a 15-line class becomes 5 lines — and becomes more consistent, because generated code cannot have a typo in field order or a forgotten __eq__. This is the single biggest day-to-day quality-of-life upgrade in modern Python.",
      blocks: [
        {
          kind: "text",
          text: "In Part H you built classes the honest way: by hand. For classes with real *behavior* — many methods, rules to protect — that is still exactly right. But look back at your data-carrying classes and you will see the same three methods written over and over. Here is one, straight from Part H style:",
        },
        {
          kind: "heading",
          text: "The same class, the Part H way",
        },
        {
          kind: "code",
          title: "A data-carrying class, hand-written",
          code: `class Song:
    def __init__(self, title, seconds):
        self.title = title
        self.seconds = seconds

s = Song("Blue Sky", 213)
print(s.title, s.seconds)
`,
          output: `Blue Sky 213`,
          explain: [
            "Two fields, a constructor that only assigns them — the classic boilerplate pattern.",
            "Try `print(s)` on this class and you get the useless default repr shown below — because nobody wrote a `__repr__`.",
          ],
        },
        {
          kind: "code",
          title: "What print(s) shows for the hand-written class",
          lang: "text",
          code: `>>> print(s)
<__main__.Song object at 0x7f9a1c2b4e10>`,
          outputNote:
            "The default repr (shown as text — the hex address changes on every run, which is exactly why it is useless in logs and bug reports). Writing a good __repr__ by hand for every class is 5 more lines nobody enjoys.",
        },
        {
          kind: "heading",
          text: "Now the @dataclass way",
        },
        {
          kind: "text",
          text: "The `dataclasses` module generates the boilerplate from your annotated fields. You write only the *declaration* of the fields; the decorator writes the machinery:",
        },
        {
          kind: "code",
          title: "The same class, five lines shorter and three methods richer",
          code: `from dataclasses import dataclass

@dataclass
class Song:
    title: str
    seconds: int

s = Song("Blue Sky", 213)
print(s)                            # a real __repr__, generated for free
print(s == Song("Blue Sky", 213))   # a real __eq__, generated for free
print(s.seconds > 200)
`,
          output: `Song(title='Blue Sky', seconds=213)
True
True`,
          outputNote: "The generated __repr__ shows every field; the generated __eq__ compares field by field.",
          explain: [
            "`@dataclass` reads the annotated fields (`title: str`, `seconds: int`) and writes `__init__` for you — `Song(\"Blue Sky\", 213)` works without a constructor.",
            "It also writes `__repr__` — printing the object now shows exactly what it holds, ready for logs and debugging.",
            "And `__eq__` — two songs with the same fields are now equal, which the hand-written version was missing entirely.",
          ],
        },
        {
          kind: "heading",
          text: "Defaults — and the one trap",
        },
        {
          kind: "code",
          title: "field(default_factory=list): a fresh list per instance",
          code: `from dataclasses import dataclass, field

@dataclass
class Playlist:
    title: str
    songs: list[str] = field(default_factory=list)

first = Playlist("Road trip")
first.songs.append("Blue Sky")

second = Playlist("Road trip")
second.songs.append("Night Drive")

print(first)
print(second)
print(first == second)
`,
          output: `Playlist(title='Road trip', songs=['Blue Sky'])
Playlist(title='Road trip', songs=['Night Drive'])
False`,
          explain: [
            "`field(default_factory=list)` means: when a new Playlist is born, call `list()` and use the result as the default.",
            "The proof is in the output: each playlist got its OWN songs list — the two did not share anything.",
            "And because `__eq__` compares field by field, playlists with different songs are correctly unequal.",
          ],
        },
        {
          kind: "code",
          title: "Why [] as a default is refused",
          expectError: "ValueError: mutable default <class 'list'> for field songs is not allowed: use default_factory",
          code: `from dataclasses import dataclass

@dataclass
class Playlist:
    title: str
    songs: list[str] = []   # mutable default — dataclasses refuse this
`,
          explain: [
            "Python refuses this at class-definition time — not later, at bug time.",
            "The reason is the shared-mutable bug you met with default arguments: one single list object would silently become the default of EVERY instance, so appending to one playlist would 'appear' in all of them.",
            "`field(default_factory=list)` is the fix: a fresh list is built per instance, exactly like the previous block.",
          ],
        },
        {
          kind: "heading",
          text: "frozen=True: records that cannot change",
        },
        {
          kind: "code",
          title: "Immutable values, the safe way",
          code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

price = Money(19.99, "EUR")
print(price)
print(price.amount * 2)

higher = Money(price.amount + 5, price.currency)   # "modify" = build a new one
print(higher)
`,
          output: `Money(amount=19.99, currency='EUR')
39.98
Money(amount=24.99, currency='EUR')`,
          explain: [
            "`frozen=True` makes every field assignment an error — the object becomes a read-only record.",
            "'Changing' a frozen record means building a new one with the fields you want — exactly how the code above models `higher`.",
            "Read-only records are gold for values that must not drift: money, coordinates, configuration snapshots.",
          ],
        },
        {
          kind: "code",
          title: "The assignment itself is refused",
          expectError: "FrozenInstanceError: cannot assign to field 'amount'",
          code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: float
    currency: str

price = Money(19.99, "EUR")
price.amount = 21.99   # frozen — this line raises immediately
`,
          explain: [
            "The crash happens at the assignment line, immediately and loudly — not three functions later when a 'changed' price silently is not changed.",
            "That is the point of freezing: mistakes become loud and local.",
          ],
        },
        {
          kind: "heading",
          text: "When to use which",
        },
        {
          kind: "table",
          title: "Choosing your data container",
          headers: ["Reach for", "When", "Why it wins"],
          rows: [
            ["`@dataclass`", "A bundle of named fields with little or no behavior", "Free __init__/__repr__/__eq__, type hints built in, 5 lines instead of 20"],
            ["A hand-written class (Part H)", "Real behavior: many methods, invariants to protect, custom __init__ logic", "Full control — the ceremony is justified when the class does real work"],
            ["A plain dict", "Transient data, JSON-shaped input, keys not known in advance", "Zero ceremony, serializes naturally, any key allowed"],
          ],
          caption:
            "Rule of thumb: if your __init__ only does self.x = x, you wanted a dataclass. If the class has no methods at all and dies within one function, a dict was fine.",
        },
        {
          kind: "tryIt",
          title: "Add a defaulted field",
          task: "Add a third field to Book — read: bool = False (a field with a default value). Then append a line that prints a new Book showing the default, and notice the repr includes it. Run before and after: the shelf output must not change.",
          code: `from dataclasses import dataclass

@dataclass
class Book:
    title: str
    pages: int

shelf = [Book("Automate the Boring Stuff", 592), Book("Fluent Python", 792)]

for book in shelf:
    print(book)
`,
          hint: "Fields with defaults must come after fields without (same rule as function parameters). New line idea: print(Book(\"Fluent Python\", 792)).",
        },
      ],
      terms: [
        { term: "Dataclass", definition: "A class decorated with @dataclass, which generates __init__, __repr__, and __eq__ from its annotated fields." },
        { term: "default_factory", definition: "A function passed via field(default_factory=list) that builds a fresh default value for each new instance, avoiding shared mutable defaults." },
        { term: "Frozen dataclass", definition: "A dataclass created with frozen=True; assigning to its fields raises an error, making instances read-only records." },
        { term: "Boilerplate", definition: "Code required for the machinery to work but carrying no unique logic — like self.title = title for the tenth time." },
      ],
      mistakes: [
        {
          mistake: "Writing songs: list[str] = [] as a dataclass field default.",
          why: "A single shared list would silently become the default of every instance — the classic shared-mutable bug — so dataclasses refuse it at class-definition time with a ValueError.",
          fix: "Use field(default_factory=list) so each instance builds its own fresh list.",
        },
        {
          mistake: "Putting a field without a default after a field with one.",
          why: "The generated __init__ would require an argument after optional ones, which Python forbids: non-default argument follows default argument.",
          fix: "Order fields from required to optional, exactly like function parameters.",
        },
        {
          mistake: "Freezing a class and then fighting the frozen errors.",
          why: "frozen=True makes every field assignment raise FrozenInstanceError by design — there is no escape hatch, and that is the feature.",
          fix: "Model 'changes' by building a new instance with the updated values, as the Money example shows.",
        },
      ],
      takeaways: [
        "@dataclass reads your annotated fields and writes __init__, __repr__, and __eq__ for you.",
        "Mutable defaults are refused outright: field(default_factory=list) gives each instance its own.",
        "frozen=True turns the class into a read-only record — 'modify' means build a new one.",
        "Dataclasses are for data bundles; hand-written classes are for behavior; dicts are for shapeless or transient data.",
      ],
      quiz: [
        {
          id: "i-02-q1",
          prompt: "What does @dataclass generate from a class body of annotated fields?",
          options: [
            { text: "Only __init__ — the rest stays hand-written", correct: false, feedback: "It writes three: the constructor, a repr showing every field, and equality comparing field by field." },
            { text: "__init__, __repr__, and __eq__", correct: true, feedback: "All three, from the field declarations alone — the 15-line class became 5 lines." },
            { text: "Nothing — it is only a documentation marker for type checkers", correct: false, feedback: "It genuinely generates methods; you saw the repr and equality work on screen." },
          ],
          explanation: "Declare fields once, get the three methods every data class needs — that is the entire bargain.",
        },
        {
          id: "i-02-q2",
          prompt: "Why does songs: list[str] = [] fail in a dataclass?",
          options: [
            { text: "Lists cannot be type-hinted in field declarations", correct: false, feedback: "list[str] as a HINT is fine — the problem is the [] default, not the hint." },
            { text: "One shared list would silently become every instance's default — the shared-mutable bug", correct: true, feedback: "Exactly — dataclasses refuse the trap at definition time instead of letting it bite at runtime." },
            { text: "Defaults must always be strings in dataclasses", correct: false, feedback: "Any immutable default works: title: str = 'untitled' is perfectly legal." },
          ],
          explanation: "field(default_factory=list) builds a fresh list per instance — the only safe way to default a mutable field.",
        },
        {
          id: "i-02-q3",
          prompt: "Predict the output: @dataclass class Money: amount: float; currency: str — then print(Money(19.99, \"EUR\")).",
          options: [
            { text: "Money(amount=19.99, currency='EUR')", correct: true, feedback: "Correct — the generated __repr__ shows the class name and every field with its value." },
            { text: "<__main__.Money object at 0x7f...>", correct: false, feedback: "That is the hand-written class without a __repr__ — the exact problem @dataclass solves." },
            { text: "('EUR', 19.99)", correct: false, feedback: "A tuple-style print is not the generated repr — field names are included." },
          ],
          explanation: "Class(field=value, ...) — the free __repr__ is reason enough to use dataclasses for data.",
        },
      ],
    },

    // ------------------------------------------------------------- i-03
    {
      slug: "i-03",
      title: "Context Managers",
      minutes: 15,
      summary:
        "What with really does: the __enter__/__exit__ protocol, writing your own class-based and @contextmanager context managers, and why cleanup is guaranteed even when an exception explodes mid-block.",
      kind: "coding",
      objectives: [
        "Explain the two-method protocol behind every with statement",
        "Write a class-based context manager with __enter__ and __exit__",
        "Write one the short way with @contextlib.contextmanager and yield",
        "Prove to yourself that __exit__ runs even when the body raises",
      ],
      why: "You have typed with open(...) since Part G, and it served you well — but the whole idea behind with was never explained, because you did not have the tools yet. Now you do: with is a protocol, not a keyword tied to files. Any class with the right two methods can appear after with, which means YOU can define guaranteed-cleanup blocks: banners that always close, transactions that always finish, indentation that always resets. Understanding this turns 'a file trick' into a general tool you will meet in every serious library — and use in your own code from this lesson on.",
      blocks: [
        {
          kind: "text",
          text: "Every `with` statement you have written had the same shape: **acquire** something, **use** it, **give it back** — and the giving-back happened even if the block crashed. Files were just the most common example. The pattern is called a **context manager**, and the protocol behind it is only two methods.",
        },
        {
          kind: "heading",
          text: "The protocol hiding inside with",
        },
        {
          kind: "visual",
          title: "The with lifecycle",
          ascii: `      with manager as x:
              |
              v
   1. manager.__enter__()     "set up; here is x"
              |
              v
   2. the with body runs      (x = whatever __enter__ returned)
              |
              |  body ends normally   OR   body raises
              v
   3. manager.__exit__()      "clean up — ALWAYS, either way"
`,
          caption:
            "Two hooks, one guarantee: __enter__ runs before the body, __exit__ runs after it — on the success path AND on the error path. That guarantee is the entire point of the with statement.",
        },
        {
          kind: "heading",
          text: "Writing your first context manager",
        },
        {
          kind: "code",
          title: "An indent-printer, from scratch",
          code: `class IndentBlock:
    def __enter__(self):
        print("-> entered the block")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("<- left the block")
        return False

with IndentBlock():
    print("    inside the with block")
print("after the with block")
`,
          output: `-> entered the block
    inside the with block
<- left the block
after the with block`,
          explain: [
            "`__enter__` runs first: it prints the entry banner and returns the value the body will receive (here, the manager itself).",
            "The body runs, indented inside the `with`.",
            "`__exit__` runs after the body — automatically, with no call from you.",
            "Returning `False` from `__exit__` means 'I did not handle any exception — let it propagate'. That is the honest default.",
          ],
        },
        {
          kind: "heading",
          text: "The guarantee: cleanup even on the error path",
        },
        {
          kind: "text",
          text: "This is the feature that makes `with` worth existing. When the body raises an exception, `__exit__` still runs — *before* the exception continues outward. Watch it happen with a resource-tag manager whose closing line must never be skipped:",
        },
        {
          kind: "code",
          title: "An exception mid-block — and the tag still closes",
          code: `class TagBlock:
    def __init__(self, tag):
        self.tag = tag

    def __enter__(self):
        print(f"<{self.tag}>")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"</{self.tag}>")
        return False

try:
    with TagBlock("report"):
        print("line 1: everything fine")
        raise ValueError("boom")
except ValueError:
    print("caught outside — but look: the closing tag printed anyway")
`,
          output: `<report>
line 1: everything fine
</report>
caught outside — but look: the closing tag printed anyway`,
          explain: [
            "The body printed one line, then raised ValueError.",
            "`</report>` printed BEFORE the except line — `__exit__` finished its cleanup while the exception was still in flight.",
            "If you had written that closing print as ordinary code *after* the block, the exception would have skipped it forever. Inside `__exit__`, it is guaranteed.",
            "`__exit__` receives details of the exception (type, value, traceback) as its three parameters — here we ignored them and returned False to let the error continue.",
          ],
        },
        {
          kind: "heading",
          text: "The shortcut: @contextmanager",
        },
        {
          kind: "text",
          text: "A full class is overkill for small managers, so the standard library ships a shortcut: decorate a generator function with `@contextmanager`, and everything **above** the `yield` becomes `__enter__`, everything **below** it becomes `__exit__`:",
        },
        {
          kind: "code",
          title: "The same guarantee, five lines shorter",
          code: `from contextlib import contextmanager

@contextmanager
def banner(title):
    print(f"=== {title} ===")     # runs on __enter__
    yield                          # the body runs HERE
    print(f"=== end {title} ===") # runs on __exit__

with banner("Weekly Report"):
    print("revenue: up")
    print("costs: down")
`,
          output: `=== Weekly Report ===
revenue: up
costs: down
=== end Weekly Report ===`,
          explain: [
            "The `yield` is the handoff point: the with body executes while the generator is paused there.",
            "If the body raises, the exception is re-raised inside the generator at the `yield` — and everything below the yield still runs on the way out (this lesson's project uses exactly this pattern).",
            "To give the body an `as` value, yield it: `value = yield something`.",
          ],
        },
        {
          kind: "heading",
          text: "A resource manager, end to end",
        },
        {
          kind: "code",
          title: "Acquire, work, release — the full pattern",
          code: `class ResourceTag:
    def __init__(self, label):
        self.label = label

    def __enter__(self):
        print(f"[{self.label}] acquired")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"[{self.label}] released")
        return False

with ResourceTag("database") as db:
    print(f"[{db.label}] working...")
print("program continues")
`,
          output: `[database] acquired
[database] working...
[database] released
program continues`,
          explain: [
            "`__init__` stores the label; `__enter__` announces acquisition and returns the manager, so `db` is the manager itself.",
            "The body works with `db.label` — the resource is 'held' exactly as long as the block.",
            "`__exit__` releases, then the program continues. Swap the prints for real connect/close calls and this is how database libraries are actually built.",
          ],
        },
        {
          kind: "steps",
          title: "How a with statement executes",
          items: [
            "**Build the manager** — evaluate the expression after `with` (the constructor call).",
            "**Enter** — call `__enter__`; its return value becomes the `as` variable.",
            "**Run the body** — the indented block, using the acquired resource.",
            "**Exit — always** — call `__exit__`, whether the body finished or raised.",
            "**Continue** — after the block, the resource is already given back.",
          ],
        },
        {
          kind: "table",
          title: "Class-based or @contextmanager?",
          headers: ["", "Class-based", "@contextmanager"],
          rows: [
            ["Boilerplate", "A whole class, two dunder methods", "One decorated function, one yield"],
            ["Best for", "Stateful managers, reusable library objects", "Small one-off managers: banners, timers, tags"],
            ["The as value", "Whatever __enter__ returns", "Whatever you yield"],
            ["Cleanup guarantee", "In __exit__", "Below the yield"],
          ],
          caption:
            "Both honor the same guarantee. Pick the class when the manager is an object with a life of its own; pick the function when it is a five-line wrapper.",
        },
        {
          kind: "tryIt",
          title: "Nest them",
          task: "This TagBlock prints opening and closing tags. Nest two of them: an outer TagBlock(\"recipe\") block printing '1. preheat the oven', and inside it a TagBlock(\"step\") block printing 'bake at 200C'. Predict the six output lines before running — the closers must run in reverse order.",
          code: `class TagBlock:
    def __init__(self, tag):
        self.tag = tag

    def __enter__(self):
        print(f"<{self.tag}>")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"</{self.tag}>")
        return False

with TagBlock("recipe"):
    print("1. preheat the oven")
`,
          hint: "Nesting is just indentation: the inner with block goes inside the outer body. The inner closes first — like nested brackets.",
        },
      ],
      terms: [
        { term: "Context manager", definition: "Any object with __enter__ and __exit__ that can follow the with keyword, guaranteeing cleanup after its block." },
        { term: "__enter__", definition: "The setup hook: runs before the with body; its return value becomes the as variable." },
        { term: "__exit__", definition: "The cleanup hook: runs after the body, on the success path and the exception path alike." },
        { term: "@contextmanager", definition: "A decorator from contextlib that turns a generator function into a context manager: code above yield is enter, code below is exit." },
        { term: "Cleanup guarantee", definition: "The promise that exit code runs no matter how the block ends — the property ordinary after-the-block code lacks." },
      ],
      mistakes: [
        {
          mistake: "Putting cleanup code after the with block instead of inside __exit__.",
          why: "Code after the block never runs if the body raises — which is precisely the case the cleanup exists for.",
          fix: "Move it into __exit__ (or below the yield in a @contextmanager), where the guarantee lives.",
        },
        {
          mistake: "Returning True from __exit__ to 'make an error go away'.",
          why: "A truthy return means 'I handled the exception' — the program continues as if nothing happened, quietly hiding real bugs.",
          fix: "Return False (or nothing) and let the exception propagate; catching is try/except's job, further out.",
        },
        {
          mistake: "Assuming the as variable is the manager object itself.",
          why: "It is whatever __enter__ returns — often self, but a @contextmanager yields whatever you choose, and library managers often yield a connection or cursor instead.",
          fix: "Return (or yield) exactly what the body needs, and nothing more.",
        },
      ],
      takeaways: [
        "with is a protocol: __enter__ before the body, __exit__ after — always, even on exceptions.",
        "Class-based managers give full control; @contextmanager gets the same guarantee in five lines.",
        "Cleanup belongs in __exit__: code after the block only runs when nothing went wrong.",
        "Return False from __exit__ unless you truly intend to swallow an exception.",
      ],
      quiz: [
        {
          id: "i-03-q1",
          prompt: "An exception is raised inside a with body. What happens to __exit__?",
          options: [
            { text: "It runs before the exception propagates onward — cleanup is guaranteed", correct: true, feedback: "Correct — you watched the closing tag print before the except line. That ordering is the guarantee." },
            { text: "It is skipped — the exception kills the block immediately", correct: false, feedback: "Skipped cleanup is what happens to code AFTER the block; __exit__ is precisely the part that cannot be skipped." },
            { text: "It runs only if the body catches the exception itself", correct: false, feedback: "No catch is needed — __exit__ runs on the error path regardless." },
          ],
          explanation: "Enter, body, exit — on both the happy path and the error path. That is the whole contract.",
        },
        {
          id: "i-03-q2",
          prompt: "In a @contextmanager function, the code BELOW the yield statement runs…",
          options: [
            { text: "When the with body ends — normally or by exception", correct: true, feedback: "Right — code below the yield is the __exit__ half, with the same guarantee." },
            { text: "Immediately when the function is called, before the body", correct: false, feedback: "That is the code ABOVE the yield — the __enter__ half." },
            { text: "Only if the body raises an exception", correct: false, feedback: "It runs on both paths — it is cleanup, not an error handler." },
          ],
          explanation: "Above yield = enter. Below yield = exit. The yield itself is where the body executes.",
        },
        {
          id: "i-03-q3",
          prompt: "with TagBlock(\"x\") as t: — what is t?",
          options: [
            { text: "Whatever __enter__ returns", correct: true, feedback: "Correct — usually self, but only because the class chose to return it. The protocol says 'the return value of __enter__'." },
            { text: "The TagBlock class itself", correct: false, feedback: "The class is already named before the colon; as receives the enter hook's result." },
            { text: "Whatever the with body returns", correct: false, feedback: "Bodies do not return anything to the manager — information flows the other way, on entry." },
          ],
          explanation: "as = __enter__'s return value. Designers of good context managers yield or return exactly the handle the body needs.",
        },
      ],
    },

    // ------------------------------------------------------------- i-04
    {
      slug: "i-04",
      title: "Functional Programming",
      minutes: 16,
      summary:
        "Pure functions, map/filter/reduce, functools.partial, closures with printed proof of captured state, and decorators seen from the functions-are-values side — plus when this style helps and when it hurts in Python.",
      kind: "concept",
      objectives: [
        "Write pure functions and explain why they are easier to test and reuse",
        "Use map, filter, and functools.reduce instead of hand-written loops",
        "Create closures that capture their own private state",
        "Explain decorators as an application of functions returning functions",
      ],
      why: "Functional programming sounds like an ivory-tower topic, but its core claim is intensely practical: programs get simpler when data flows in one direction through functions that do not reach out and change things. You already agree more than you think — every time a bug disappeared because a function 'just returns the answer', that was functional style paying you back. In this lesson you will name the idea, meet the three classic tools built on it, and learn the closure — the mechanism underneath every decorator you met in Part G — with proof on screen of exactly what it captures and what stays private.",
      blocks: [
        {
          kind: "text",
          text: "**Functional programming** is a style, not a different language: treat functions as values you can pass, return, and combine — and prefer functions whose output depends only on their input. Python is not a pure functional language, but it borrows the best parts, and knowing them makes your loops shorter, your tests easier, and decorators finally obvious.",
        },
        {
          kind: "heading",
          text: "Pure functions: same input, same output, no surprises",
        },
        {
          kind: "code",
          title: "Two functions that look alike — only one is predictable",
          code: `total = 0

def add_impure(amount):
    global total
    total += amount
    return total

def add_pure(current, amount):
    return current + amount

print(add_impure(10))
print(add_impure(10))
print(add_pure(0, 10))
print(add_pure(0, 10))
`,
          output: `10
20
10
10`,
          explain: [
            "`add_impure` reached out and changed `total`, a variable outside itself. Call it twice with the same argument — two different answers (10, then 20). Its behavior depends on hidden history.",
            "`add_pure` takes everything it needs as input and touches nothing outside. Same arguments, same answer, forever.",
            "Purity is why pure functions are trivial to test (one call, one claim — no setup), safe to call in any order, and safe to run concurrently, which matters in the very next lessons.",
          ],
        },
        {
          kind: "heading",
          text: "The classic trio: map, filter, reduce",
        },
        {
          kind: "code",
          title: "Transform, select, collapse",
          code: `from functools import reduce

prices = [4.5, 12.0, 7.25, 3.0, 9.99]

doubled = list(map(lambda p: p * 2, prices))
cheap = list(filter(lambda p: p < 8, prices))
total = reduce(lambda a, b: a + b, prices, 0)

print(doubled)
print(cheap)
print(round(total, 2))
`,
          output: `[9.0, 24.0, 14.5, 6.0, 19.98]
[4.5, 7.25, 3.0]
36.74`,
          explain: [
            "`map(f, items)` applies f to every item — here doubling each price. It returns a lazy object, so wrap it in `list()` to see the results.",
            "`filter(f, items)` keeps the items where f returns True — here the prices under 8.",
            "`reduce(f, items, start)` collapses the list to a single value by repeatedly combining: ((0 + 4.5) + 12.0) + 7.25 ... = 36.74. The `0` is the starting value, and it also protects the empty list (reduce of nothing = start, not a crash).",
            "Anything these three do, a loop can do — the functional versions name the *shape* of the transformation: mapped, filtered, folded.",
          ],
        },
        {
          kind: "table",
          title: "The functional toolkit",
          headers: ["Tool", "The question it answers", "Returns"],
          rows: [
            ["`map(f, items)`", "What is every item, transformed?", "lazy iterator of results"],
            ["`filter(f, items)`", "Which items survive the test?", "lazy iterator of keepers"],
            ["`reduce(f, items, start)`", "What do all items collapse into?", "one single value"],
            ["`functools.partial(f, ...)`", "What if some arguments were pre-filled?", "a new, simpler callable"],
          ],
          caption:
            "All four treat functions as values: you hand behavior over as an argument. That idea — a function passed around like data — is the whole foundation.",
        },
        {
          kind: "heading",
          text: "partial: pre-filling a function",
        },
        {
          kind: "code",
          title: "Freeze the arguments you already know",
          code: `from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(9))
print(cube(3))
print(square(5), cube(5))
`,
          output: `81
27
25 125`,
          explain: [
            "`partial(power, exponent=2)` builds a NEW callable that already carries exponent=2 — you only supply what is left (base).",
            "square and cube are the original function with some arguments pinned: no lambda, no wrapper, no repetition.",
            "This shines with libraries: `print_rounded = partial(print, end=\"\\n\")`-style presets keep call sites short and consistent.",
          ],
        },
        {
          kind: "heading",
          text: "Closures: functions that remember",
        },
        {
          kind: "code",
          title: "A counter factory — with printed proof of private state",
          code: `def make_counter(label):
    count = 0

    def tick():
        nonlocal count
        count += 1
        return f"{label}: {count}"

    return tick

clicks = make_counter("clicks")
pages = make_counter("pages")

print(clicks(), clicks(), clicks())
print(pages(), pages())
print(clicks())
`,
          output: `clicks: 1 clicks: 2 clicks: 3
pages: 1 pages: 2
clicks: 4`,
          explain: [
            "`make_counter` creates a local `count` and returns `tick`, an inner function that uses it — the inner function is a **closure**: a function plus the variables it captured.",
            "The output is the proof: clicks counted 1, 2, 3, 4 while pages counted 1, 2 on its own. Each call to `make_counter` built a separate, private `count` — the counters share nothing.",
            "`nonlocal count` tells Python: 'count belongs to the enclosing function — update THAT one, do not create a new local.' Without it, the assignment would make count a fresh local of tick and the code would crash with UnboundLocalError.",
            "The factory already returned, its frame is gone — yet count lives on, held by the closure. Captured variables travel with the function.",
          ],
        },
        {
          kind: "heading",
          text: "Decorators, revisited from the function side",
        },
        {
          kind: "code",
          title: "The g-08 decorator, rebuilt from what you now know",
          code: `import functools

def announce(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"-> {func.__name__} starts")
        result = func(*args, **kwargs)
        print(f"<- {func.__name__} ends")
        return result
    return wrapper

@announce
def make_greeting(name):
    return f"Hi {name}!"

print(make_greeting("Ada"))
print(make_greeting("Grace"))
`,
          output: `-> make_greeting starts
<- make_greeting ends
Hi Ada!
-> make_greeting starts
<- make_greeting ends
Hi Grace!`,
          explain: [
            "Strip the @ away and a decorator is exactly what this lesson taught: a function (`announce`) that takes a function (`func`) and returns a new function (`wrapper`).",
            "`wrapper` is a closure over `func` — that is how it still knows which function to call long after `announce` returned.",
            "`@announce` above `def make_greeting` is pure sugar for `make_greeting = announce(make_greeting)`.",
            "`functools.wraps` copies the original name and docstring onto wrapper so the disguised function still introduces itself honestly.",
          ],
        },
        {
          kind: "heading",
          text: "When functional style helps — and when it hurts",
        },
        {
          kind: "table",
          title: "A style you steer, not a religion",
          headers: ["Reach for FP when", "Reach for plain code when"],
          rows: [
            ["The step is one clean transformation: map/filter/reduce says it in one line", "The loop needs several interlocking variables and early exits"],
            ["You can build a pipeline of small, pure, individually testable pieces", "The logic is inherently stateful (a game, a simulator)"],
            ["You need callbacks or behavior-as-data (sorting keys, event handlers)", "Teammates would need five minutes to decode a nested lambda"],
          ],
          caption:
            "Python's own style guide is explicit: readability counts. A comprehension or a loop that reads better than a functional chain WINS — the tools serve the reader.",
        },
        {
          kind: "tryIt",
          title: "Two accumulators, one factory",
          task: "Predict these four prints before running, then verify. Afterward, change make_accumulator so each add returns the RUNNING total as a float — and confirm the two labels still never share state.",
          code: `def make_accumulator(label):
    total = 0

    def add(amount):
        nonlocal total
        total += amount
        return f"{label}: {total}"

    return add

fuel = make_accumulator("fuel")
food = make_accumulator("food")

print(fuel(50))
print(food(30))
print(fuel(25))
print(food(5))
`,
          hint: "fuel captured its own total; food captured a different one. Line 3 should show fuel: 75 — the two 50 and 25 calls accumulate in the same closure.",
        },
      ],
      terms: [
        { term: "Pure function", definition: "A function whose result depends only on its arguments and that changes nothing outside itself." },
        { term: "Closure", definition: "An inner function bundled with the variables it captured from the enclosing function, which survive after that function returns." },
        { term: "nonlocal", definition: "A declaration that tells Python a name belongs to the enclosing function's scope, so assignment updates the captured variable." },
        { term: "Higher-order function", definition: "A function that takes functions as arguments or returns one — map, filter, and decorators are all higher-order." },
        { term: "reduce (fold)", definition: "Collapsing a sequence into a single value by repeatedly combining neighboring items with a two-argument function." },
      ],
      mistakes: [
        {
          mistake: "Forgetting nonlocal when the inner function assigns to a captured variable.",
          why: "An assignment makes Python treat the name as a NEW local of the inner function; reading it before assigning raises UnboundLocalError.",
          fix: "Declare nonlocal count the moment the inner function needs to assign, not just read.",
        },
        {
          mistake: "Printing a map or filter object and expecting the values.",
          why: "map and filter return lazy objects that produce items on demand — printing shows something like <map object at 0x...> instead of results.",
          fix: "Materialize when you need to look: list(map(...)), list(filter(...)).",
        },
        {
          mistake: "Calling reduce on an empty sequence with no initial value.",
          why: "With nothing to combine and no starting value, reduce has nothing to return and raises TypeError.",
          fix: "Pass the third argument: reduce(f, items, 0) returns 0 for an empty list.",
        },
      ],
      takeaways: [
        "A pure function's output depends only on its inputs — no hidden state, trivial to test, safe anywhere.",
        "map transforms, filter selects, reduce collapses to one value; partial freezes arguments you already know.",
        "A closure is a function plus its captured variables; every factory call builds a private set.",
        "A decorator is just a function that takes a function and returns a closure — the @ is sugar over exactly that.",
        "Use functional style when it reads better; a plain loop that is clearer still wins.",
      ],
      quiz: [
        {
          id: "i-04-q1",
          prompt: "What makes a function pure?",
          options: [
            { text: "Its result depends only on its inputs, and it changes nothing outside itself", correct: true, feedback: "Exactly — same input, same output, no side effects. Call it twice, get the same answer twice." },
            { text: "It contains no loops or conditionals", correct: false, feedback: "Purity is about inputs and effects, not syntax — a loop over its own arguments can be perfectly pure." },
            { text: "It is defined inside another function", correct: false, feedback: "That describes a nested function; purity and nesting are independent properties." },
          ],
          explanation: "Purity = deterministic output + no side effects. That is what makes pure functions the easy ones to test.",
        },
        {
          id: "i-04-q2",
          prompt: "Trace it: def make(): n = 0; def bump(): nonlocal n; n += 2; return n; return bump. Then a = make(); print(a(), a()); b = make(); print(b()). What prints?",
          options: [
            { text: "2 4 then 2", correct: true, feedback: "Correct — a's private n climbed 0 to 2 to 4; b is a fresh closure with its own n, so it starts again at 2." },
            { text: "2 4 then 6", correct: false, feedback: "That assumes b shares a's n — but every call to make() builds a new, independent captured variable." },
            { text: "2 2 then 2", correct: false, feedback: "The first a() returns 2, but the second a() must return 4 — n persists between calls of the same closure." },
          ],
          explanation: "Closures are per-factory-call: a and b remember separate n's, and each keeps its own count between calls.",
        },
        {
          id: "i-04-q3",
          prompt: "reduce(lambda a, b: a + b, [10, 20, 30], 0) evaluates to…",
          options: [
            { text: "60", correct: true, feedback: "Right — 0+10=10, 10+20=30, 30+30=60: the start value seeds the fold." },
            { text: "[10, 20, 30]", correct: false, feedback: "Nothing is kept — reduce collapses the sequence into one single value." },
            { text: "A TypeError unless the list is non-empty", correct: false, feedback: "Backwards: the crash risk is the EMPTY sequence WITHOUT a start value — here the 0 protects even that case." },
          ],
          explanation: "Fold with a seed: start at 0, combine each item in turn, return the final single value.",
        },
      ],
    },

    // ------------------------------------------------------------- i-05
    {
      slug: "i-05",
      title: "Concurrency Fundamentals",
      minutes: 16,
      summary:
        "Processes vs threads vs the GIL — honestly explained; threading.Thread, join, and ThreadPoolExecutor in verified code; when threads help (waiting on I/O) and when they cannot (CPU work); multiprocessing in concept.",
      kind: "concept",
      objectives: [
        "Explain the difference between processes and threads, and what the GIL permits",
        "Start threads with threading.Thread and wait for them with join()",
        "Run a function across many inputs with ThreadPoolExecutor.map",
        "Classify work as I/O-bound or CPU-bound and pick the right tool",
      ],
      why: "Almost every interesting program eventually has to do more than one thing at a time: fetch three web pages, read a file while the user types, process a hundred records. Python gives you several tools for that, and choosing the wrong one makes code slower AND more complicated. The honest catch is the GIL — a detail of CPython that beginners are told to fear and are rarely shown. This lesson explains what actually runs in parallel, what merely overlaps, and which tool to reach for. The mental model is 90% of the value, and every executed example in this lesson is exactly reproducible.",
      blocks: [
        {
          kind: "text",
          text: "Programs spend shocking amounts of time doing *nothing*: waiting for a network reply, waiting for a disk, waiting for a user to click. **Concurrency** is the craft of doing useful work during the waiting. Before the tools, you need the two words that everything else hangs on:",
        },
        {
          kind: "heading",
          text: "Processes and threads: two meanings of 'at the same time'",
        },
        {
          kind: "visual",
          title: "The map of concurrency",
          ascii: `   A PROCESS is a whole running program:        A THREAD is a worker inside a program:
   its own memory, its own Python interpreter   shares the program's memory with
                                                the other threads

   PROCESS 1              PROCESS 2            ONE PROCESS, TWO THREADS
   +-------------+        +-------------+       +---------------------------+
   | interpreter |        | interpreter |       | thread 1      thread 2    |
   | memory  A   |        | memory  B   |       |    shared memory  A       |
   +-------------+        +-------------+       +---------------------------+

   truly parallel computing                one worker at a time runs Python
   (each process has its own lock)          bytecode (the GIL) — but both
                                            can WAIT at the same time`,
          caption:
            "Processes are separate kitchens with separate fridges. Threads are cooks in one kitchen sharing one fridge — convenient, but they bump into each other.",
        },
        {
          kind: "text",
          text: "Here is the honest part most tutorials skip. CPython — the interpreter you downloaded in Part A — protects its memory management with a lock called the **Global Interpreter Lock (GIL)**. At any instant, only one thread per process is executing Python bytecode. The GIL exists because CPython's memory management is not safe to run from multiple threads at once, and the lock is the simple, correct answer. Two consequences you must know: threads are *excellent* at overlapping waiting, and threads are *useless* at speeding up pure Python computation.",
        },
        {
          kind: "table",
          title: "The three tools at a glance",
          headers: ["", "Threads (threading)", "Processes (multiprocessing)", "Async (next lesson)"],
          rows: [
            ["What it creates", "Workers inside one process", "Whole separate interpreters", "Switchable tasks in ONE thread"],
            ["Memory", "Shared — convenient, risky", "Separate — safe, heavier", "Shared, but switching is explicit"],
            ["True parallel compute?", "No (the GIL)", "Yes (one lock per process)", "No (one thread)"],
            ["Overlaps waiting (I/O)?", "Yes", "Yes (overkill for it)", "Yes — and cheapest at scale"],
          ],
          caption:
            "Remember this table and you will avoid the two classic mistakes: threads for math, processes for waiting.",
        },
        {
          kind: "heading",
          text: "threads: start, run, join",
        },
        {
          kind: "code",
          title: "Two threads, each writing its own slot",
          code: `import threading

def fetch(name, slot, results):
    # pretend this waits on a slow device, then finishes
    results[slot] = f"{name} done"

results = [None, None]
threads = [
    threading.Thread(target=fetch, args=("download-A", 0, results)),
    threading.Thread(target=fetch, args=("download-B", 1, results)),
]
for t in threads:
    t.start()          # begin — returns immediately, does not wait
for t in threads:
    t.join()           # NOW wait for each thread to finish

print(results[0])
print(results[1])
print("main thread continues after join()")
`,
          output: `download-A done
download-B done
main thread continues after join()`,
          outputNote:
            "The output is deterministic because each thread wrote only its own slot in the results list — the safe pattern for sharing data.",
          explain: [
            "`target=fetch, args=(...)` tells the thread which function to run with which arguments — the thread runs it in parallel with the main thread.",
            "`start()` launches and returns immediately; `join()` blocks the main thread until that thread is done. Without join, main could print before the threads finished.",
            "Each thread wrote to its OWN slot (`results[0]` or `results[1]`) — with separate slots there is no fighting over shared data, so the output is guaranteed.",
          ],
        },
        {
          kind: "code",
          title: "ThreadPoolExecutor: a pool you can with",
          code: `from concurrent.futures import ThreadPoolExecutor

def shrink(name):
    return f"{name} -> small"

with ThreadPoolExecutor(max_workers=2) as pool:
    outputs = list(pool.map(shrink, ["a.jpg", "b.jpg", "c.jpg"]))

for line in outputs:
    print(line)
print("pool shut down by the with block")
`,
          output: `a.jpg -> small
b.jpg -> small
c.jpg -> small
pool shut down by the with block`,
          explain: [
            "`pool.map(f, inputs)` runs f on every input across the pool's workers and returns results **in input order** — which is why the output matches the input list exactly.",
            "The `with` block is a context manager (lesson i-03): on exit it shuts the pool down, guaranteeing no worker is left running.",
            "This is the day-to-day tool for 'apply this slow-but-waiting function to a hundred items': one with-block, no manual start/join bookkeeping.",
          ],
        },
        {
          kind: "heading",
          text: "When threads help — and when the GIL says no",
        },
        {
          kind: "text",
          text: "The whole benefit of threads for I/O work is visible even with ONE worker. Watch the same two jobs run two ways — first strictly one-after-another, then with a single worker who *switches jobs at every wait point*. This simulation runs in plain Python (no threads at all), because the idea is what matters:",
        },
        {
          kind: "code",
          title: "Sequential vs interleaved — the idea, simulated",
          code: `def download(name, waits):
    """Simulate a job that spends its life waiting for a slow device."""
    log = []
    log.append(f"{name}: request sent")
    for i in range(1, waits + 1):
        log.append(f"{name}: waiting ({i}/{waits})")
    log.append(f"{name}: response received")
    return log

# Sequential: job A finishes completely, only then job B starts
for line in download("A", 2) + download("B", 1):
    print(line)
print("--- sequential: B does not even start until A is done ---")

# Interleaved: ONE worker, switching to the other job at every wait
a = download("A", 2)
b = download("B", 1)
while a or b:
    if a:
        print(a.pop(0))
    if b:
        print(b.pop(0))
print("--- interleaved: while A waits, the worker pushes B forward ---")
`,
          output: `A: request sent
A: waiting (1/2)
A: waiting (2/2)
A: response received
B: request sent
B: waiting (1/1)
B: response received
--- sequential: B does not even start until A is done ---
A: request sent
B: request sent
A: waiting (1/2)
B: waiting (1/1)
A: waiting (2/2)
B: response received
A: response received
--- interleaved: while A waits, the worker pushes B forward ---`,
          explain: [
            "Sequential: B's request is not even *sent* until A fully finishes — total time is the sum of both jobs.",
            "Interleaved: same single worker, but every time A hits a wait, the worker makes progress on B. Both requests were sent before either finished — the waits overlap, so the total is closer to the *longer* job than to the sum.",
            "That is exactly what threads do for I/O-bound work: while one thread waits, another runs. The GIL is not in the way, because waiting releases it.",
            "Now flip it: if the jobs were *computing* instead of waiting, there would be no wait points to overlap — and the GIL would force the two threads to take turns. No speedup at all.",
          ],
        },
        {
          kind: "heading",
          text: "CPU-bound? That is multiprocessing's job",
        },
        {
          kind: "code",
          title: "Real parallelism, conceptually (shown, not executed)",
          lang: "text",
          code: `# Conceptual sketch — shown as text: real processes need a real OS,
# and the browser playground cannot spawn them.
from multiprocessing import Pool

def resize(image_path):
    ...  # heavy, pure CPU work on an image

if __name__ == "__main__":           # required guard when processes spawn
    with Pool(processes=4) as pool:  # 4 interpreters, 4 GILs, 4 CPUs
        results = pool.map(resize, all_paths)`,
          outputNote:
            "The API mirrors ThreadPoolExecutor on purpose — but each worker is a whole separate process with its own interpreter and its own GIL, so four CPUs genuinely compute at once. Note the __name__ guard from lesson i-10: it is mandatory for multiprocessing.",
        },
        {
          kind: "table",
          title: "Classify the work, then choose",
          headers: ["The job spends its time…", "Called", "Reach for"],
          rows: [
            ["Waiting: network, disk, database, user", "I/O-bound", "threads — or asyncio (next lesson)"],
            ["Computing: math, parsing, image processing", "CPU-bound", "multiprocessing"],
            ["A little of both", "mixed", "Profile first (i-09), then split the job"],
          ],
          caption:
            "One honest question — where does the time go? — decides the tool. Guessing the answer is the mistake; i-09 shows how to measure.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "A playground honesty note",
          text: "The browser playground (Pyodide) has no real threads — which is why this lesson's tryIt simulates the idea with plain functions and printed order, exactly like the interleaving demo above. The two thread examples you just read were verified on a real CPython interpreter.",
        },
        {
          kind: "tryIt",
          title: "Add a third job to the interleave",
          task: "Before running, predict what changes when you add a third job c = download(\"C\", 1) to the interleaved loop (print it after b in each round). Then add it and check yourself: all three requests go out early, and the waits overlap even more.",
          code: `def download(name, waits):
    """Simulate a job that spends its life waiting for a slow device."""
    log = []
    log.append(f"{name}: request sent")
    for i in range(1, waits + 1):
        log.append(f"{name}: waiting ({i}/{waits})")
    log.append(f"{name}: response received")
    return log

a = download("A", 2)
b = download("B", 1)
while a or b:
    if a:
        print(a.pop(0))
    if b:
        print(b.pop(0))
print("--- two jobs interleaved ---")
`,
          hint: "The while loop condition becomes: while a or b or c: — and add a third if-block for c right after the one for b.",
        },
      ],
      terms: [
        { term: "Process", definition: "A whole running program with its own memory and its own Python interpreter." },
        { term: "Thread", definition: "A worker inside one process, sharing its memory with the other threads." },
        { term: "GIL (Global Interpreter Lock)", definition: "CPython's lock ensuring only one thread per process executes Python bytecode at any instant." },
        { term: "I/O-bound", definition: "Work whose time goes to waiting on input/output — network, disk, user — rather than computing." },
        { term: "CPU-bound", definition: "Work whose time goes to actual computation, where waiting is negligible." },
        { term: "join()", definition: "The call that blocks the calling thread (usually main) until a thread finishes." },
      ],
      mistakes: [
        {
          mistake: "Reaching for threads to speed up number crunching.",
          why: "The GIL lets only one thread run Python bytecode at a time, so CPU-bound threads take turns — the total time does not shrink, it usually grows slightly.",
          fix: "Use multiprocessing for CPU work (separate interpreters, separate locks), or fix the algorithm first with lesson i-09.",
        },
        {
          mistake: "Forgetting join() and reading results immediately.",
          why: "start() returns instantly — the thread may still be running, so the results it fills in are missing or half-built.",
          fix: "Join every thread before using anything it produced.",
        },
        {
          mistake: "Letting two threads mutate the same list, dict, or counter without coordination.",
          why: "Read-modify-write sequences interleave between threads: increments vanish, lists gain surprise duplicates — a race condition, and it may not show up every run.",
          fix: "Give each thread its own slot (as the verified example does), or guard shared data with a threading.Lock.",
        },
      ],
      takeaways: [
        "Threads share memory and overlap waiting; processes get separate memory and true parallelism.",
        "The GIL: one thread at a time runs Python bytecode — so threads accelerate I/O, never CPU.",
        "start() then join(): launch, wait, and only then read what the threads produced.",
        "Classify the job first: I/O-bound means threads or async; CPU-bound means multiprocessing.",
      ],
      quiz: [
        {
          id: "i-05-q1",
          prompt: "The GIL means that…",
          options: [
            { text: "Only one thread per CPython process executes Python bytecode at any instant", correct: true, feedback: "Exactly — but waiting (network, disk) releases the lock, which is why threads still help I/O work." },
            { text: "Python cannot run more than one thread at all", correct: false, feedback: "You can start a hundred threads — they just take turns executing bytecode." },
            { text: "Threads cannot share memory with each other", correct: false, feedback: "The opposite: threads share their process's memory, which is convenient and occasionally dangerous." },
          ],
          explanation: "One lock, one thread executing bytecode at a time — waiting overlaps, computing does not.",
        },
        {
          id: "i-05-q2",
          prompt: "Your program spends 95 percent of its time waiting for HTTP replies. Which tool fits best?",
          options: [
            { text: "Threads (or asyncio from the next lesson)", correct: true, feedback: "Right — I/O-bound work is exactly what threads overlap, and asyncio does it cheaper at scale." },
            { text: "multiprocessing", correct: false, feedback: "It works, but a whole separate interpreter per waiting worker is expensive overkill." },
            { text: "Nothing helps — waiting is waiting", correct: false, feedback: "Waiting on five servers CAN overlap: while one reply is in flight, request the next." },
          ],
          explanation: "I/O-bound: overlap the waits. That is the whole game, and threads (or async) play it.",
        },
        {
          id: "i-05-q3",
          prompt: "What does t.join() do?",
          options: [
            { text: "Pauses the calling thread (usually main) until t has finished", correct: true, feedback: "Correct — join is the fence: nothing after it runs until t is done." },
            { text: "Kills the thread t immediately", correct: false, feedback: "join waits; it does not stop anything. Threads stop by finishing their target function." },
            { text: "Starts the thread t", correct: false, feedback: "That is start(). join is what you call AFTER start, to wait." },
          ],
          explanation: "start launches, join waits — the two halves of every thread's life cycle in your code.",
        },
      ],
    },

    // ------------------------------------------------------------- i-06
    {
      slug: "i-06",
      title: "Async Programming",
      minutes: 15,
      summary:
        "async def, await, coroutines and the event loop; asyncio.run and gather running tasks concurrently with deterministic printed order; async vs threads; and a note on where async really shines.",
      kind: "coding",
      objectives: [
        "Define coroutines with async def and pause them with await",
        "Drive a coroutine to completion with asyncio.run()",
        "Run many tasks concurrently with asyncio.gather()",
        "Decide between async and threads for a given job",
      ],
      why: "Threads work, but they have costs: each thread is relatively heavyweight, the operating system decides when to switch, and shared memory invites race conditions. Async is the other road to 'overlap the waiting': instead of workers the OS juggles, YOUR code announces where it will pause (await), and one loop switches between tasks at exactly those points. It is the engine behind modern web servers handling tens of thousands of simultaneous connections on a single thread. This lesson builds the complete mental model — coroutine, await, event loop, gather — with tiny programs whose printed order is fully deterministic, so you can trace every switch by hand.",
      blocks: [
        {
          kind: "text",
          text: "Picture one cook with three pans on the stove. A bad cook stands watching the first pan until the sauce is done, then starts chopping. A great cook starts the sauce, and *while it simmers*, chops the onions. One person — but the waiting overlaps the working. **Async Python is that cook**: one thread, many tasks, and explicit pause points instead of idle standing.",
        },
        {
          kind: "heading",
          text: "async def and await: the two new words",
        },
        {
          kind: "text",
          text: "`async def` defines a **coroutine function**. Calling it does *not* run the body — it returns a **coroutine object**: a paused computation, waiting to be driven. `await` marks the exact points where the coroutine can pause and let other tasks run. And something has to do the driving: that is `asyncio.run()`.",
        },
        {
          kind: "code",
          title: "The smallest complete async program",
          code: `import asyncio

async def brew_coffee():
    print("brew: grinding beans")
    await asyncio.sleep(0)
    print("brew: coffee ready")

async def main():
    print("morning routine begins")
    await brew_coffee()
    print("morning routine ends")

asyncio.run(main())
`,
          output: `morning routine begins
brew: grinding beans
brew: coffee ready
morning routine ends`,
          explain: [
            "`brew_coffee` and `main` are coroutine functions — notice `await` only appears inside them.",
            "`await asyncio.sleep(0)` means 'pause me here; run anything else that is ready; then resume me'. With nothing else ready, it continues immediately — but the pause point is real, as the next example proves.",
            "`asyncio.run(main())` is the engine: it starts the event loop, drives main to completion, and closes the loop. One call at the very top, exactly like a script's entry point.",
          ],
        },
        {
          kind: "visual",
          title: "The event loop: one cook, many pans",
          ascii: `        asyncio.run(main())            starts the ONE loop
                  |
     +------------v------------+
     |       EVENT  LOOP       |     one thread, no workers
     |   "who is ready next?"  |
     +------------+------------+
          |            |
      main() runs   other tasks run
      until its     whenever the
      await...      current task awaits

   task A      await ...   await ...   done
      \\        /  \\        /  \\
       +------+    +------+    +----> result
              \\           |
   task B      \\---------> await ... done

   the loop NEVER juggles mid-line: switches happen
   only at await points, which is why output is predictable`,
          caption:
            "Concurrency, not parallelism: nothing runs simultaneously, but every pause point is a chance to run someone else. The switching happens at awaits — you can point at every single one in the source.",
        },
        {
          kind: "heading",
          text: "gather: many tasks, one await",
        },
        {
          kind: "code",
          title: "Two tasks, truly interleaved",
          code: `import asyncio

async def task(name, steps):
    for i in range(1, steps + 1):
        print(f"{name} step {i}")
        await asyncio.sleep(0)     # the pause point — hand the baton over
    return f"{name} finished"

async def main():
    results = await asyncio.gather(task("A", 2), task("B", 2))
    print(results)

asyncio.run(main())
`,
          output: `A step 1
B step 1
A step 2
B step 2
['A finished', 'B finished']`,
          explain: [
            "`gather(task(...), task(...))` schedules both coroutines as concurrent tasks and returns when ALL of them finish.",
            "Read the output as the baton passing: A step 1, then A paused at await — B step 1, B paused — A step 2 — B step 2. Two tasks, one thread, perfect alternation at the awaits.",
            "`gather` returns the results **in argument order** — A's result first because A was passed first, not because A finished first.",
            "With `asyncio.sleep(0)` there is no real delay — it is a pure 'switch here' marker, which is why this output is deterministic and instantly reproducible.",
          ],
        },
        {
          kind: "code",
          title: "Overlapping waits: three jobs, one thread",
          code: `import asyncio

async def fetch(name, hops):
    print(f"{name}: request sent")
    for hop in range(1, hops + 1):
        await asyncio.sleep(0)     # one simulated round-trip of waiting
    print(f"{name}: response received")
    return name.upper()

async def main():
    results = await asyncio.gather(fetch("api", 2), fetch("db", 1), fetch("cache", 1))
    print("all done:", results)

asyncio.run(main())
`,
          output: `api: request sent
db: request sent
cache: request sent
db: response received
cache: response received
api: response received
all done: ['API', 'DB', 'CACHE']`,
          explain: [
            "All three requests went out before ANY response arrived — the waits fully overlapped, in a single thread.",
            "`api` needed 2 hops, so it finished last — yet its result still comes FIRST in the list, because gather preserves argument order.",
            "In real code, `await asyncio.sleep(0)` is replaced by a real `await` on a network or file operation — everything else about the shape stays identical.",
          ],
        },
        {
          kind: "heading",
          text: "async or threads?",
        },
        {
          kind: "table",
          title: "Choosing between async and threads",
          headers: ["Question", "Answer: async", "Answer: threads"],
          rows: [
            ["Thousands of simultaneous waits?", "Wins — tasks are cheap (no OS worker per task)", "Loses — thousands of real threads is heavy"],
            ["Need to wrap a blocking library with no async version?", "Painful — it blocks the whole loop", "Wins — wrap the blocking calls in threads"],
            ["Care about exactly where switching happens?", "Wins — only at awaits, visible in the source", "The OS decides, anytime"],
            ["Simple one-off script doing 3 downloads?", "Fine — small learning curve", "Also fine — ThreadPoolExecutor in 4 lines"],
          ],
          caption:
            "Same rule as the last lesson applies to both: they overlap WAITING. Neither speeds up CPU work — the GIL still rules this single thread.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Where async really shines",
          text: "In this lesson, asyncio.sleep(0) stands in for 'waiting for a reply from a server', so every output is instant and exactly reproducible. In production, the awaits are real network and file operations, and a single-threaded async server can hold tens of thousands of open connections at once. Part J connects this directly to real network calls — the payoff lesson for everything here.",
        },
        {
          kind: "tryIt",
          title: "Predict, then change the steps",
          task: "Predict this output before running (trace the awaits by hand — A and B alternate). Then change the call to gather(task(\"A\", 3), task(\"B\", 1)) and predict again before running: with only one step, B finishes early and A's remaining steps run alone.",
          code: `import asyncio

async def task(name, steps):
    for i in range(1, steps + 1):
        print(f"{name} step {i}")
        await asyncio.sleep(0)
    return name

async def main():
    order = await asyncio.gather(task("A", 3), task("B", 1))
    print("order:", order)

asyncio.run(main())
`,
          hint: "Trace in pairs: A prints one step and awaits, B prints one step and awaits, repeat. When B has no steps left, only A keeps going.",
        },
      ],
      terms: [
        { term: "Coroutine", definition: "The object returned by calling an async def function: a paused computation that runs only when awaited or driven by the loop." },
        { term: "await", definition: "The keyword marking a pause point: yield control to the event loop until the awaited operation completes." },
        { term: "Event loop", definition: "The single-threaded scheduler that runs ready coroutines and switches between them at their await points." },
        { term: "asyncio.run()", definition: "The entry point that starts the event loop, drives one coroutine to completion, and closes the loop." },
        { term: "gather()", definition: "Runs multiple coroutines as concurrent tasks and returns all their results, in argument order." },
      ],
      mistakes: [
        {
          mistake: "Calling an async function and expecting it to run: brew_coffee().",
          why: "Calling a coroutine function only CREATES the coroutine — the body never executes, and Python warns 'coroutine was never awaited' at garbage collection.",
          fix: "Drive it: await brew_coffee() inside another coroutine, or asyncio.run(brew_coffee()) at the top level.",
        },
        {
          mistake: "Using time.sleep() inside a coroutine.",
          why: "time.sleep blocks the WHOLE thread — the event loop cannot switch, so every other task stalls behind the sleeper.",
          fix: "await asyncio.sleep(...) — it pauses only the calling coroutine and lets the loop run others.",
        },
        {
          mistake: "Trying to await outside an async def function.",
          why: "await is only legal inside coroutine functions; anywhere else it is a SyntaxError before the program even starts.",
          fix: "If a function needs await, make it async def — and make sure something eventually drives it with asyncio.run or gather.",
        },
      ],
      takeaways: [
        "async def defines coroutines; calling one returns a paused computation, not a result.",
        "await marks the pause points; the event loop switches tasks exactly there — never mid-line.",
        "asyncio.run drives everything from the top; gather runs many tasks and returns results in argument order.",
        "Async overlaps waiting in one cheap thread; threads win when wrapping blocking libraries. Neither accelerates CPU work.",
      ],
      quiz: [
        {
          id: "i-06-q1",
          prompt: "You call brew_coffee() — an async def function — without await or asyncio.run. What happens?",
          options: [
            { text: "A coroutine object is created, but its body never runs", correct: true, feedback: "Correct — the call builds the paused computation; driving it is a separate, deliberate step." },
            { text: "The function runs normally, just slightly later", correct: false, feedback: "Later never comes by itself — without await or asyncio.run the body stays unexecuted." },
            { text: "An immediate SyntaxError", correct: false, feedback: "The call is perfectly legal — the problem is silence, not an error. Python only warns at shutdown." },
          ],
          explanation: "Creating the coroutine and running it are two different acts — forgetting the second is the number one async beginner bug.",
        },
        {
          id: "i-06-q2",
          prompt: "await asyncio.gather(a(), b()) returns…",
          options: [
            { text: "A list of both results, in the order the coroutines were passed", correct: true, feedback: "Right — argument order, not finishing order. The api/db/cache example proved it: api finished last but was listed first." },
            { text: "Only the result of whichever task finishes first", correct: false, feedback: "gather waits for ALL of them — that is its whole job." },
            { text: "The results in the order the tasks finished", correct: false, feedback: "Tempting, but no: finishing order does not matter to gather; argument order does." },
          ],
          explanation: "gather collects everything, in the order you asked for it — deterministic results from concurrent execution.",
        },
        {
          id: "i-06-q3",
          prompt: "Inside a coroutine you need to pause 2 seconds. Which line is correct?",
          options: [
            { text: "await asyncio.sleep(2)", correct: true, feedback: "Correct — it pauses only this coroutine while the loop runs others." },
            { text: "time.sleep(2)", correct: false, feedback: "That blocks the entire thread — every other task freezes behind it. The classic async bug." },
            { text: "pause(2)", correct: false, feedback: "There is no pause builtin — the two real options are the ones above, and only one of them is polite." },
          ],
          explanation: "await asyncio.sleep pauses the coroutine; time.sleep freezes the world. In async code, the difference is everything.",
        },
      ],
    },

    // ------------------------------------------------------------- i-07
    {
      slug: "i-07",
      title: "Testing",
      minutes: 16,
      summary:
        "assert and AssertionError; hand-written test functions; unittest.TestCase with setUp, assertEqual and assertRaises; pytest style; test-first thinking; and the story of a bug a test caught before users did.",
      kind: "coding",
      objectives: [
        "Write claims with assert and read AssertionError precisely",
        "Structure tests by hand and with unittest.TestCase",
        "Use setUp, assertEqual, and assertRaises to test values and exceptions",
        "Explain what tests buy you: 'I think it works' becomes a checkable claim",
      ],
      why: "Every program you have written so far was verified the same way: run it, look at the output, nod. That works at 20 lines and collapses at 2,000 — because every change you make might break something you checked three weeks ago and will not re-check. Tests are those checks, saved as code, re-run in seconds, forever. Teams that test well change code fearlessly; teams that do not become afraid of their own programs. This lesson starts from bare assert and ends with unittest — the framework that ships inside every Python install — plus pytest, the community favorite you will meet in every real project.",
      blocks: [
        {
          kind: "text",
          text: "A **test** is a claim about your code, written as code: 'given this input, the output is exactly this'. If the claim holds, the test says nothing. If it breaks, the test tells you what, where, and what it got instead. Start from the smallest possible claim-maker:",
        },
        {
          kind: "heading",
          text: "assert: the smallest possible claim",
        },
        {
          kind: "code",
          title: "Two claims that hold — silence is success",
          code: `def average(scores):
    return sum(scores) / len(scores)

assert average([80, 90, 100]) == 90
assert average([50]) == 50
print("both claims held — no AssertionError")
`,
          output: `both claims held — no AssertionError`,
          explain: [
            "`assert condition, message` does one thing: if the condition is False, raise AssertionError with the message. If True — say nothing.",
            "Both claims held, so the only output is the print. Silence, in tests, is the sound of success.",
            "Notice what the claims pin down: the typical case AND the single-item edge case — the exact spots bugs hide.",
          ],
        },
        {
          kind: "code",
          title: "A claim that does not hold",
          expectError: "AssertionError: addition is broken",
          code: `assert 2 + 2 == 5, "addition is broken"
`,
          explain: [
            "The condition was False, so AssertionError fired with our message — the claim was checked, and checking is the entire point.",
            "In a real test run, one failed assert names the test, the line, the message, and what was actually received. That is a bug caught before any user saw it.",
          ],
        },
        {
          kind: "heading",
          text: "From one claim to test functions",
        },
        {
          kind: "text",
          text: "The convention that scales: functions named `test_...`, each making one claim about one behavior, printing nothing. Collect them, call them — a crash names the failing claim; silence means every claim held:",
        },
        {
          kind: "code",
          title: "Three hand-written tests",
          code: `def average(scores):
    return sum(scores) / len(scores)

def test_average_typical():
    result = average([80, 90, 100])
    assert result == 90, f"expected 90, got {result}"

def test_average_single_value():
    assert average([50]) == 50

def test_average_rejects_empty():
    try:
        average([])
        assert False, "empty list should have raised"
    except ZeroDivisionError:
        pass

test_average_typical()
test_average_single_value()
test_average_rejects_empty()
print("3 hand-written tests passed")
`,
          output: `3 hand-written tests passed`,
          explain: [
            "Each test is independent and could run alone. Each name says what behavior it pins down.",
            "The third test pins down the FAILURE path: an empty list must raise ZeroDivisionError. 'It should crash on bad input' is a claim like any other.",
            "This hand-rolled pattern works, and it is genuinely how tests work inside — but the bookkeeping (calling each test, reporting failures nicely) is a solved problem. Which is why the standard library ships a framework:",
          ],
        },
        {
          kind: "heading",
          text: "unittest: the framework in the box",
        },
        {
          kind: "code",
          title: "The same claims, unittest-style",
          code: `import unittest

def average(scores):
    return sum(scores) / len(scores)

class TestAverage(unittest.TestCase):
    def setUp(self):
        self.typical = [80, 90, 100]     # fresh for EVERY test

    def test_typical_values(self):
        self.assertEqual(average(self.typical), 90)

    def test_single_value(self):
        self.assertEqual(average([50]), 50)

    def test_empty_list_raises(self):
        with self.assertRaises(ZeroDivisionError):
            average([])

result = unittest.main(argv=["course"], exit=False).result
print("tests run:", result.testsRun)
print("failures:", len(result.failures))
print("errors:", len(result.errors))
`,
          output: `tests run: 3
failures: 0
errors: 0`,
          outputNote:
            "unittest prints its own summary ('Ran 3 tests ... OK') to the error stream, so this program prints its own summary lines to standard output — both are real, and knowing which stream is which is the honest way to present it.",
          explain: [
            "Subclass `unittest.TestCase`; every method starting with `test_` runs automatically — no list of calls to maintain.",
            "`setUp` runs fresh before EACH test, so tests cannot leak state into each other. Here it was barely needed — with files, connections, or big data it is essential.",
            "`assertEqual(actual, expected)` compares and reports the difference on failure — assert's error message, done for you.",
            "`with self.assertRaises(ZeroDivisionError):` pins down the failure path: the test FAILS if the exception does NOT happen. This is the professional way to test 'it must crash on bad input'.",
            "`unittest.main(argv=[\"course\"], exit=False)` runs the suite without exiting the program, and returns a result object we can read counts from — the three printed lines are ours, to standard output.",
          ],
        },
        {
          kind: "code",
          title: "pytest style (shown, not executed — pytest is not installed here)",
          lang: "bash",
          code: `$ pip install pytest
$ pytest test_math.py
=================== test session starts ====================
collected 3 items

test_math.py ...                                        [100%]

==================== 3 passed in 0.01s =====================`,
          outputNote:
            "Typical pytest run (displayed, not executed in this lesson). The same tests drop the class entirely: plain test_ functions with plain asserts — pytest finds them, runs them, and prints one dot per passing test.",
        },
        {
          kind: "table",
          title: "Bare assert vs unittest vs pytest",
          headers: ["", "Bare assert", "unittest", "pytest"],
          rows: [
            ["Boilerplate", "None", "A class per group", "Plain functions"],
            ["Finding tests", "You call them", "Automatic (test_ methods)", "Automatic (files and functions)"],
            ["Built in?", "Yes", "Yes — standard library", "No — pip install pytest"],
            ["Best for", "One-off claims in scripts", "No extra installs, formal structure", "Real projects — the community default"],
          ],
          caption:
            "All three express the same thing: claims, checked by machine. unittest ships with Python; pytest is what most teams install on top.",
        },
        {
          kind: "heading",
          text: "A bug caught before it shipped",
        },
        {
          kind: "text",
          text: "Here is the honest payoff story, in four lines. A discount function, a test claiming what 10 percent off 100 must produce — and a bug the test catches in the very first run:",
        },
        {
          kind: "code",
          title: "The test wins",
          expectError: "AssertionError: expected 90, got 99.9",
          code: `def apply_discount(price, percent):
    # BUG: divides percent by 100 instead of the PRICE by 100
    return price - percent / 100

def test_ten_percent_off():
    result = apply_discount(100, 10)
    assert result == 90, f"expected 90, got {result}"

test_ten_percent_off()
print("test passed")
`,
          explain: [
            "The function returns 99.9 — subtracting 10/100 instead of 10 percent of 100. Without the test, that bug ships and every customer quietly overpays.",
            "The failure message names everything: expected 90, got 99.9. One glance at the numbers points at a percent-vs-price slip in the formula.",
            "The fix is `return price - price * percent / 100` — and now the test guards it forever: if anyone ever reintroduces the bug, this test screams.",
          ],
        },
        {
          kind: "steps",
          title: "Test-first, in four moves",
          items: [
            "**Write the claim** — one test, one input, one expected output, before the code exists.",
            "**Watch it fail** — run it and see it fail for the right reason (not a typo — a genuinely wrong answer).",
            "**Write the smallest code that passes** — no gold-plating, just enough to satisfy the claim.",
            "**Keep the test** — it now guards that behavior for the life of the project.",
          ],
        },
        {
          kind: "tryIt",
          title: "Add the third test",
          task: "Two tests for slugify are written and called. Add a third test — test_lowercase_input — asserting that slugify(\"python\") equals \"python\" (no spaces, no changes). Call it with the others and change the final print to say 3 tests passed.",
          code: `def slugify(title):
    return title.lower().replace(" ", "-")

def test_hello_world():
    assert slugify("Hello World") == "hello-world"

def test_three_words():
    assert slugify("Data Verse Academy") == "data-verse-academy"

test_hello_world()
test_three_words()

print("2 tests passed")
`,
          hint: "Follow the pattern exactly: def test_lowercase_input(): assert slugify(\"python\") == \"python\" — then call it before the print and update the count.",
        },
      ],
      terms: [
        { term: "Assertion", definition: "A claim that a condition is true, written as assert condition, message — a False condition raises AssertionError." },
        { term: "Test case", definition: "One function pinning down one behavior: a given input, an expected output, and a check that they match." },
        { term: "setUp", definition: "A unittest method that runs fresh before EACH test, building the state every test needs without sharing it." },
        { term: "Regression", definition: "A bug that returns after once being fixed — exactly what a kept test guards against." },
        { term: "Test-first", definition: "Writing the claim before the code: watch the test fail, write the smallest code that passes, keep the test." },
      ],
      mistakes: [
        {
          mistake: "Testing only the happy path.",
          why: "Bugs live at the edges: empty lists, zero, None, duplicates — the exact inputs nobody passes accidentally.",
          fix: "Every group of tests should include at least one edge case and one 'this must raise' case with assertRaises.",
        },
        {
          mistake: "Fixing the test instead of the bug when a test fails.",
          why: "The test is the claim about intended behavior; weakening it to pass today ships the bug to users tomorrow.",
          fix: "Change a test only when the requirement genuinely changed — and make the test name say so.",
        },
        {
          mistake: "Letting tests depend on each other — test_b relies on what test_a created.",
          why: "Order-dependent tests fail randomly when run individually or in parallel, hiding real bugs behind noise.",
          fix: "Build fresh state in setUp for every test; each test must pass alone.",
        },
      ],
      takeaways: [
        "assert turns a belief into a checkable claim; a failing assert is a bug found before users find it.",
        "unittest.TestCase: setUp builds fresh state, test_ methods hold the claims, assertRaises tests the failure path.",
        "pytest needs no classes and no boilerplate — the community default for real projects.",
        "Tests are checks saved as code: re-run in seconds, forever, guarding against regressions.",
      ],
      quiz: [
        {
          id: "i-07-q1",
          prompt: "assert average([50]) == 50 passes. What appears when the test runs?",
          options: [
            { text: "Nothing — silence is what a passing assert produces", correct: true, feedback: "Right — asserts speak only when they fail. Quiet runs are green runs." },
            { text: "'OK' is printed for each passing assert", correct: false, feedback: "The dots and OK lines come from test RUNNERS like unittest or pytest, not from assert itself." },
            { text: "The value 50 is printed", correct: false, feedback: "assert is not print — it checks, it does not display." },
          ],
          explanation: "Passing asserts are silent. That is why test runners exist: to give you the visible 'all green' summary.",
        },
        {
          id: "i-07-q2",
          prompt: "What does with self.assertRaises(ZeroDivisionError): average([]) assert?",
          options: [
            { text: "The call RAISES ZeroDivisionError — the test fails if no exception happens", correct: true, feedback: "Exactly — the exception is the expected behavior; its absence would fail the claim." },
            { text: "The call is executed safely with the error caught and hidden", correct: false, feedback: "Hiding is not checking — assertRaises asserts the error occurred; no error means a failed test." },
            { text: "The call must NOT raise — any exception fails the test", correct: false, feedback: "That is the opposite claim; a plain call without assertRaises would already do that implicitly." },
          ],
          explanation: "'It must crash on bad input' is a claim like any other — assertRaises is how you write it.",
        },
        {
          id: "i-07-q3",
          prompt: "In a unittest.TestCase, setUp runs…",
          options: [
            { text: "Once before EACH test method, building fresh state every time", correct: true, feedback: "Correct — fresh setup per test is what keeps tests independent of each other." },
            { text: "Once before all the tests, sharing one setup", correct: false, feedback: "Shared setup is exactly how tests become order-dependent — setUp deliberately avoids it." },
            { text: "After each test, to clean up", correct: false, feedback: "Cleanup-after is tearDown's job; setUp is the fresh-start-before hook." },
          ],
          explanation: "setUp = fresh start per test. Independence is the property that makes test failures meaningful.",
        },
      ],
    },

    // ------------------------------------------------------------- i-08
    {
      slug: "i-08",
      title: "Debugging",
      minutes: 15,
      summary:
        "A systematic method — reproduce, isolate, fix, verify; print-debugging done right; the logging module with levels and log files; pdb and deep traceback reading; rubber ducks and minimal reproducible examples.",
      kind: "coding",
      objectives: [
        "Apply the four-step debug loop: reproduce, isolate, fix, verify",
        "Instrument code with labeled debug prints that reveal state and types",
        "Configure logging with a level and a format, and write log files",
        "Read multi-frame tracebacks bottom-up and find the frame that is yours",
      ],
      why: "You have been debugging since Part A — every crash taught the loop informally. But 'I stared until it worked' does not scale, and 'I changed random things' actively makes code worse. Professionals are not people who write fewer bugs; they are people with a METHOD that finds bugs fast. This lesson makes your method explicit, upgrades your two instruments (prints become logging; panic becomes pdb), and trains the most valuable debugging skill there is: reading a multi-frame traceback down to the exact line in YOUR code where the story went wrong.",
      blocks: [
        {
          kind: "text",
          text: "Debugging is not a talent; it is a procedure. The professionals you admire are not faster because they see bugs instantly — they are faster because they never skip the steps. Here is the whole method, and every debugging story in this lesson is just these four moves:",
        },
        {
          kind: "steps",
          title: "The method: reproduce, isolate, fix, verify",
          items: [
            "**Reproduce** — find an input that triggers the bug every single time. A bug you cannot trigger on demand cannot be confirmed fixed.",
            "**Isolate** — shrink the program until the bug survives in the smallest possible version. The line where removing things stops removing the bug is usually the bug.",
            "**Fix** — change ONE thing that explains the evidence. Not five things — one.",
            "**Verify** — re-run the reproducer (it should be fixed) AND the rest of the program (you broke nothing). Both, every time.",
          ],
        },
        {
          kind: "heading",
          text: "print-debugging, done right",
        },
        {
          kind: "text",
          text: "The most-used debugger on Earth is `print()`, and it deserves respect — used well. Four rules make it professional: **label** every line (`[debug]`), print **reprs** not just values (`{x!r}` — quotes and types become visible), print at **boundaries** (function in/out), and **remove or convert them** when the bug is dead.",
        },
        {
          kind: "code",
          title: "Labeled, repr-ified debug prints",
          code: `def order_total(prices):
    print(f"[debug] prices = {prices!r}")
    total = sum(prices)
    print(f"[debug] total = {total!r}")
    return total

print(order_total([10, 20, 5]))
`,
          output: `[debug] prices = [10, 20, 5]
[debug] total = 35
35`,
          explain: [
            "Every line is labeled, so debug output can never be confused with real output.",
            "`{prices!r}` uses the repr conversion — strings keep their quotes, so `[10, 20, 5]` versus `[10, 20, '5']` is visible at a glance. You will see exactly why in the next block.",
            "The function's real output still lands at the end — the debug lines are scaffolding around it.",
          ],
        },
        {
          kind: "code",
          title: "The bug the debug print exposes in one line",
          expectError: "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
          code: `def order_total(prices):
    print(f"[debug] prices = {prices!r}")
    total = sum(prices)
    print(f"[debug] total = {total!r}")
    return total

print(order_total([10, 20, 5]))
print(order_total([10, 20, "5"]))
`,
          explain: [
            "Run this and read the debug lines: the first call works; the second call's debug line shows `prices = [10, 20, '5']` — quotes around 5, exposed instantly by `!r`.",
            "The data arrived broken. The bug is upstream of this function — someone built a list with a string in it — and the traceback's `unsupported operand type(s) for +: 'int' and 'str'` now has a visible culprit.",
            "This is print-debugging at its best: the debug line localizes the problem to where the data is already wrong, before the crash even happens.",
          ],
        },
        {
          kind: "heading",
          text: "logging: prints that grow up",
        },
        {
          kind: "text",
          text: "Bare prints are temporary scaffolding — you delete them, and next month you need them again. The `logging` module is print's professional sibling: **levels** that say how serious a line is, a **format** applied to every line, and destinations (like log files) you can attach without touching the logging calls. One setup call configures everything:",
        },
        {
          kind: "code",
          title: "A log file, written and read back",
          code: `import logging
import os

path = "/tmp/pipeline-i08.log"
if os.path.exists(path):
    os.remove(path)                 # start clean — runs must be reproducible

logging.basicConfig(
    filename=path,
    level=logging.INFO,
    format="%(levelname)s %(message)s",
)

def sync_inventory():
    logging.info("sync started")
    logging.warning("product X-17: stock count is negative")
    logging.info("sync finished")

sync_inventory()

with open(path) as f:
    print(f.read(), end="")
print("[end of log file]")
`,
          output: `INFO sync started
WARNING product X-17: stock count is negative
INFO sync finished
[end of log file]`,
          explain: [
            "`basicConfig(...)` is the one-time setup: where lines go (`filename`), which levels pass (`level=logging.INFO` — INFO and more serious), and the line shape (`format`).",
            "Each call names its level: `logging.info(...)` for normal progress, `logging.warning(...)` for something wrong but survivable.",
            "We log to a file in /tmp and read it back, so this lesson's output is exactly reproducible — and so you see what a log file actually contains: level, then message, line after line.",
            "Tomorrow you set `level=logging.WARNING` and every INFO line disappears — no deletions, no edits to the logging calls. That off switch is what prints lack.",
          ],
        },
        {
          kind: "table",
          title: "The five levels, from chatter to disaster",
          headers: ["Level", "Meaning", "Typical use"],
          rows: [
            ["`DEBUG`", "Fine detail for chasing bugs", "variable values, loop counters"],
            ["`INFO`", "Normal progress", "'sync started', 'job 12 done'"],
            ["`WARNING`", "Something wrong, but the program continues", "retrying, defaults applied, negative stock"],
            ["`ERROR`", "An operation failed", "could not write file, request rejected"],
            ["`CRITICAL`", "The program cannot continue", "data corrupt, shutting down"],
          ],
          caption:
            "Set level=logging.WARNING and only the last three lines appear; set DEBUG and see everything. One knob, no code edits.",
        },
        {
          kind: "heading",
          text: "pdb: pausing the world",
        },
        {
          kind: "code",
          title: "An interactive pdb session (shown, not executed)",
          lang: "text",
          code: `$ python3 -m pdb cart.py
> /home/you/cart.py(1)<module>()
-> def order_total(prices):
(Pdb) break cart.py:5
(Pdb) continue
> /home/you/cart.py(5)order_total()
-> total = sum(prices)
(Pdb) p prices
[10, 20, '5']
(Pdb) q`,
          outputNote:
            "A real pdb session (displayed as text — it is interactive). python3 -m pdb file.py starts under the debugger; break sets a line breakpoint, continue runs to it, p prints any expression live, q quits. It is print-debugging frozen in time — inspect anything, change nothing.",
        },
        {
          kind: "heading",
          text: "Reading deep tracebacks (a skill from a-09, upgraded)",
        },
        {
          kind: "text",
          text: "Lesson a-09 taught you to read tracebacks bottom-up: error name first, then walk up for location. Real tracebacks have *multiple frames* — a chain of calls — and the skill is finding the deepest frame that is YOUR code:",
        },
        {
          kind: "code",
          title: "A two-frame crash",
          expectError: "KeyError: 'port'",
          code: `def read_config():
    return {}

def get_port():
    config = read_config()
    return config["port"]

print(get_port())
`,
          explain: [
            "Two functions, two frames in the traceback — read it bottom-up, exactly like a-09 taught.",
            "The last line names it: KeyError: 'port'. The key 'port' was simply not in the dict.",
            "The deepest frame (line 6, `config[\"port\"]`) is where it blew up; the outer frame (line 8) is just the call that started the story.",
          ],
        },
        {
          kind: "code",
          title: "The full traceback, annotated",
          lang: "text",
          code: `Traceback (most recent call last):
  File "<string>", line 8, in <module>      <- 8: YOUR call that started it
  File "<string>", line 6, in get_port       <- 6: the line that exploded
KeyError: 'port'                            <- WHAT: the missing key`,
          outputNote:
            "The real traceback from the block above (annotated). In a big project there may be 15 frames — read the last line first, then scan UP the frames until you reach a file you own. That frame is where your debugging starts.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The rubber duck and the minimal reproducible example",
          text: "Two zero-tool techniques with absurd success rates. The rubber duck: explain your code, line by line, out loud to any inanimate listener — wrong assumptions fall out of your mouth mid-sentence. The minimal reproducible example: keep deleting parts until the bug barely survives; the moment deleting something removes the bug, you have found a line that matters. Half of all bugs die to one of these two.",
        },
        {
          kind: "tryIt",
          title: "Debug the trimmed mean",
          task: "This function should average a list after dropping its single lowest value — but it crashes. Apply the method: read the traceback bottom-up, add a [debug] print of prices, spot the bug (list.remove returns None and mutates in place), fix it, and run until the average prints 90.0.",
          code: `# One bug: the average crashes for every list except single values.
# Find it with a [debug] print, fix it, run again.
def average(scores):
    lowest = min(scores)
    trimmed = scores.remove(lowest)     # <- the crash is downstream of this line
    return sum(trimmed) / len(trimmed)

print("average:", average([80, 90, 100]))
`,
          hint: "list.remove(x) removes x IN PLACE and returns None — so trimmed is None. Fix: trimmed = list(scores), then trimmed.remove(lowest).",
          expectError: true,
        },
      ],
      terms: [
        { term: "Reproduce", definition: "Find an input that triggers the bug every time — the precondition for confirming any fix." },
        { term: "Isolate", definition: "Shrink the failing program until the bug survives in the smallest possible version." },
        { term: "Logging level", definition: "A severity category — DEBUG, INFO, WARNING, ERROR, CRITICAL — used to filter which log lines are emitted." },
        { term: "pdb", definition: "Python's built-in interactive debugger: set breakpoints, run, pause, and inspect any expression live." },
        { term: "Minimal reproducible example", definition: "The smallest program that still shows the bug — the artifact that makes every other debugging step possible." },
      ],
      mistakes: [
        {
          mistake: "Changing five things at once to 'fix' a bug.",
          why: "If the bug disappears you learn nothing about which change mattered — and you may have masked the real bug with three new ones.",
          fix: "One change, one re-run — the a-09 loop, still undefeated at any level of experience.",
        },
        {
          mistake: "Debugging without a reliable way to reproduce the bug.",
          why: "A bug you cannot trigger on demand cannot be verified fixed — 'seems gone' is not a fix, it is a hope.",
          fix: "First build the minimal reproducer; it usually points at the cause on its own.",
        },
        {
          mistake: "Leaving bare print() calls in shipped code.",
          why: "Debug prints confuse users, pollute real output, and deleting them destroys evidence you may need again next week.",
          fix: "Use logging: levels silence debug noise with one config line, without deleting anything.",
        },
      ],
      takeaways: [
        "Method beats luck: reproduce, isolate, fix, verify — in that order, every time.",
        "Label your debug prints and use {value!r} so types and quotes are visible.",
        "logging is print with levels, a format, and an off switch — debug lines survive in log files.",
        "Read tracebacks bottom-up: the error name, then the deepest frame that is your own code.",
      ],
      quiz: [
        {
          id: "i-08-q1",
          prompt: "A bug report arrives: 'the report was wrong yesterday afternoon.' Your first move is to…",
          options: [
            { text: "Build a reproducer — an input that triggers the wrong report every single time", correct: true, feedback: "Correct — no reproducer means no isolation, no verified fix. Everything else comes after this." },
            { text: "Start rewriting the report function", correct: false, feedback: "Rewriting without a reproducer means you cannot even tell whether the new version fixes it." },
            { text: "Add try/except so the wrong report cannot happen again", correct: false, feedback: "Hiding the symptom is the opposite of fixing the cause — and you would have no way to verify anything." },
          ],
          explanation: "Reproduce first. A bug you can trigger on demand is a bug you can watch, shrink, and prove fixed.",
        },
        {
          id: "i-08-q2",
          prompt: "What do logging levels give you that print does not?",
          options: [
            { text: "A severity knob: set level=WARNING and every INFO and DEBUG line disappears without deleting any logging call", correct: true, feedback: "Exactly — one config line silences the chatter while keeping the code intact for next time." },
            { text: "Faster output — levels are buffered for speed", correct: false, feedback: "Levels are about filtering and meaning, not performance." },
            { text: "Colored terminal text automatically", correct: false, feedback: "Colors come from handlers and formatters — the level system is about severity, not styling." },
          ],
          explanation: "Levels turn 'delete the prints' into 'turn the knob' — the professional difference.",
        },
        {
          id: "i-08-q3",
          prompt: "A traceback shows 12 frames across your code and two libraries. Where does debugging usually start?",
          options: [
            { text: "The deepest frame that is in YOUR OWN files — read the last line first, then scan up", correct: true, feedback: "Right — the bug is usually in your code calling the library wrong, and your frames name the story." },
            { text: "The first line of the traceback", correct: false, feedback: "That is just the header — 'Traceback (most recent call last)' — the story starts at the bottom." },
            { text: "The middle frame, to be safe", correct: false, feedback: "The middle is usually library plumbing; your frames and the final error line carry the information." },
          ],
          explanation: "Bottom-up, then jump to your own frame: the a-09 habit, scaled to real stacks.",
        },
      ],
    },

    // ------------------------------------------------------------- i-09
    {
      slug: "i-09",
      title: "Performance",
      minutes: 16,
      summary:
        "Measure before optimizing — timeit timings shown as text, executed experiments printing deterministic operation COUNTS; big-O intuition for list, set and string operations; join beats plus; algorithmic wins; cProfile in concept.",
      kind: "concept",
      objectives: [
        "Explain why measuring precedes optimizing, and why intuition about speed fails",
        "Classify common operations by growth: append vs insert(0), in list vs in set, += vs join",
        "Run count-based experiments that make costs visible without clocks",
        "Use timeit and cProfile conceptually for real measurements on your machine",
      ],
      why: "Fast enough is a feature, and slow is a bug users can feel. But human intuition about speed is famously wrong — even professionals guess wrong about which line dominates a program's runtime, again and again. That is why the first rule of performance work is: measure, then optimize, then measure again. This lesson trains the intuition that does scale — how work GROWS as data grows — using experiments that count operations instead of timing them, so every claim on screen is exactly reproducible. The two tools you will use for real timing on your own machine, timeit and cProfile, close the lesson.",
      blocks: [
        {
          kind: "text",
          text: "There is a famous line in computer science, from Donald Knuth: *premature optimization is the root of all evil*. The practical translation: making code fast before knowing WHICH part is slow wastes your time and makes the code worse. Two rules follow, and they carry the whole lesson: **measure first**, and **think in growth, not seconds**.",
        },
        {
          kind: "heading",
          text: "Count first, measure second",
        },
        {
          kind: "text",
          text: "Wall-clock timings change with every machine and every run, so this lesson's executed experiments print **operation counts** — how many elements moved, how many comparisons happened — which are exactly reproducible. Real timing values still matter, so they appear too, clearly labeled as one run on one machine. First, the counts: watch what happens when you insert at the FRONT of a list instead of the end:",
        },
        {
          kind: "code",
          title: "insert(0, x) vs append(x), counted honestly",
          code: `def count_moves_insert_front(n):
    """insert(0, x) shifts every existing element right: count the moves."""
    data = []
    moves = 0
    for i in range(n):
        data.insert(0, i)
        moves += len(data) - 1     # elements shifted by this insert
    return moves

def count_moves_append(n):
    """Appending at the end shifts nothing."""
    data = []
    for _ in range(n):
        data.append(1)
    return 0

for n in (5, 10, 100):
    print(f"n={n:>3}: insert(0) shifts {count_moves_insert_front(n)} elements, append shifts {count_moves_append(n)} elements")
`,
          output: `n=  5: insert(0) shifts 10 elements, append shifts 0 elements
n= 10: insert(0) shifts 45 elements, append shifts 0 elements
n=100: insert(0) shifts 4950 elements, append shifts 0 elements`,
          explain: [
            "Inserting at position 0 forces every existing element one step right: item k costs k moves.",
            "The totals are the classic sum 1+2+...+(n-1): 10 moves for n=5, 45 for n=10, 4,950 for n=100 — the work grows with the SQUARE of n.",
            "Appending shifts nothing, ever — its cost stays flat as n grows.",
            "This is what the shorthand means: append is **O(1)** (constant), insert(0) is **O(n)** per call (linear) — and n O(n) operations in a loop is O(n squared) total.",
          ],
        },
        {
          kind: "table",
          title: "Growth rates you will actually meet",
          headers: ["Operation", "Grows like", "Why"],
          rows: [
            ["`list.append(x)`", "constant — O(1)", "writes at the end; nothing moves"],
            ["`list.insert(0, x)`", "linear — O(n)", "every element shifts right"],
            ["`x in list`", "linear — O(n)", "scans item by item"],
            ["`x in set`", "roughly constant — O(1)", "one hash jump to the bucket"],
            ["`s = s + part` (in a loop)", "quadratic — O(n squared) overall", "re-copies the whole string so far, every time"],
            ["`\"\".join(parts)`", "linear — O(n)", "computes the size once, copies each character once"],
          ],
          caption:
            "Big-O is not about seconds — it is about what happens when the data gets 10x bigger. Constant stays flat; linear grows 10x; quadratic grows 100x.",
        },
        {
          kind: "heading",
          text: "Membership: lists scan, sets jump",
        },
        {
          kind: "code",
          title: "The same question asked of a list and a set",
          code: `def list_comparisons(data, target):
    """Count comparisons for 'target in list' — a linear scan."""
    for i, item in enumerate(data):
        if item == target:
            return i + 1
    return len(data)

hundred = list(range(100))
million = list(range(1_000_000))

print("list, n=100,         find 99      :", list_comparisons(hundred, 99), "comparisons")
print("list, n=1,000,000,   find 999999  :", list_comparisons(million, 999_999), "comparisons")

hundred_set = set(hundred)
million_set = set(million)
print("set,  n=100,         contains 99  :", 99 in hundred_set, "(one hash lookup)")
print("set,  n=1,000,000,   contains 999999:", 999_999 in million_set, "(one hash lookup)")
`,
          output: `list, n=100,         find 99      : 100 comparisons
list, n=1,000,000,   find 999999  : 1000000 comparisons
set,  n=100,         contains 99  : True (one hash lookup)
set,  n=1,000,000,   contains 999999: True (one hash lookup)`,
          outputNote:
            "The stdout really is these four lines — the 1,000,000 on the second line is a plain 7-digit count, printed on one line. Read the million-item pair side by side: the list paid 1,000,000 comparisons; the set needed one hash jump.",
          explain: [
            "Hunting 999,999 in a million-item list cost a million comparisons — the item was last, and a list must look at every earlier item first.",
            "The set answered both questions with a single hash jump, at n=100 and at n=1,000,000 alike.",
            "That is the O(n) versus O(1) gap in one program: at small n both feel instant; grow n a thousandfold and only one of them stays instant.",
            "The conversion costs one pass (O(n)) — so the rule is: build the set ONCE, then look up many times.",
          ],
        },
        {
          kind: "heading",
          text: "Strings: join beats plus",
        },
        {
          kind: "code",
          title: "Counting the characters copied",
          code: `def build_by_plus(parts):
    """s = s + part copies the WHOLE string so far, every time."""
    copied = 0
    s = ""
    for part in parts:
        s = s + part
        copied += len(s)
    return copied

def build_by_join(parts):
    """join computes the final size once; each character is copied once."""
    return sum(len(p) for p in parts)

parts = ["ab", "cd", "ef", "gh"]
print("plus, 4 parts:", build_by_plus(parts), "characters copied")
print("join, 4 parts:", build_by_join(parts), "characters copied")

longer = [str(i) for i in range(10)]
print("plus, 10 parts:", build_by_plus(longer), "characters copied")
print("join, 10 parts:", build_by_join(longer), "characters copied")
`,
          output: `plus, 4 parts: 20 characters copied
join, 4 parts: 8 characters copied
plus, 10 parts: 55 characters copied
join, 10 parts: 10 characters copied`,
          explain: [
            "Strings never change in place — `s = s + part` builds a brand-new string, copying everything so far PLUS the new part.",
            "The counts make it concrete: for 4 two-character parts, plus copied 2+4+6+8 = 20 characters to end up with 8. The waste compounds as the string grows.",
            "join plans once (sum the lengths, allocate once) and copies each character exactly once — 8 copied for 8 final characters, 10 for 10.",
            "In a loop over hundreds of parts, this is the difference between linear and quadratic — one of the most common real-world Python slowdowns.",
          ],
        },
        {
          kind: "heading",
          text: "timeit: honest measurement",
        },
        {
          kind: "code",
          title: "Running a snippet 1000 times (counts only — timings vary)",
          code: `import timeit

code = "total = 0\\nfor i in range(100):\\n    total += i"
n = 1000
timeit.timeit(code, number=n)     # seconds vary per machine and run
print(f"ran the loop {n} times")
`,
          output: `ran the loop 1000 times`,
          outputNote:
            "The program prints only the count on purpose: timeit's return value is a duration in seconds, which differs on every machine and every run — the opposite of reproducible.",
          explain: [
            "`timeit.timeit(code, number=n)` runs the code string n times and returns the total seconds — the standard tool for micro-measurements.",
            "On this machine, one real run gave the values in the block below. Your numbers will differ — that is exactly the point of showing them as text, not as verified output.",
          ],
        },
        {
          kind: "code",
          title: "Real timings from one run on this machine (shown as text)",
          lang: "text",
          code: `append  x 1000 on a 1000-item list : 0.00002 seconds
insert(0) x 1000 on a 1000-item list : 0.00020 seconds   <- 10x slower at n=1000

100 membership tests in a 1,000,000-item list : 0.84310 seconds
100 membership tests in a 1,000,000-item set  : 0.00001 seconds   <- ~84,000x faster`,
          outputNote:
            "Measured with timeit on the machine that verified this course (best of 5 repeats). Your machine's absolute numbers will differ; the RATIOS are the finding, and they match the count experiments above.",
        },
        {
          kind: "heading",
          text: "Algorithms beat micro-optimizations",
        },
        {
          kind: "code",
          title: "The loop versus the formula",
          code: `def sum_by_loop(n):
    steps = 0
    total = 0
    for i in range(n):
        total += i
        steps += 1
    return steps

def sum_by_formula(n):
    return 3     # one multiply, one add, one divide — constant

for n in (100, 10_000, 1_000_000):
    print(f"n={n:>9,}: loop does {sum_by_loop(n):>9,} steps, formula does {sum_by_formula(n)}")
`,
          output: `n=      100: loop does       100 steps, formula does 3
n=   10,000: loop does    10,000 steps, formula does 3
n=1,000,000: loop does 1,000,000 steps, formula does 3`,
          explain: [
            "Summing 0..n with a loop costs n steps — the work grows with the data.",
            "Gauss's formula n * (n + 1) / 2 costs three operations — at ANY n. A million items, three steps.",
            "No amount of micro-tuning the loop (faster variables, clever syntax) closes a gap like that. Changing the ALGORITHM does, instantly.",
            "This is the hierarchy of performance wins: better algorithm first, better data structure second (sets, dicts), micro-optimizations last — if ever.",
          ],
        },
        {
          kind: "heading",
          text: "cProfile: where the time actually goes",
        },
        {
          kind: "code",
          title: "A typical profile (shown, not executed)",
          lang: "text",
          code: `$ python3 -m cProfile -s cumulative pipeline.py
         42012 function calls in 0.031 seconds

   Ordered by: cumulative time

   ncalls   cumtime  filename:lineno(function)
        1    0.031   pipeline.py:20(main)
      100    0.028   pipeline.py:8(process_rows)
    10000    0.019   {built-in method json.loads}
        2    0.001   pipeline.py:15(write_report)
        ...`,
          outputNote:
            "A typical cProfile report (displayed as text). -s cumulative sorts by total time including children: the top row is where the seconds actually live — usually not the function anyone guessed. Optimize that line, or go home.",
        },
        {
          kind: "steps",
          title: "The performance method, in order",
          items: [
            "**Measure** — run cProfile and find the top line. Not the line you suspect: the top line.",
            "**Check the growth** — is the hot operation O(1), O(n), or O(n squared) in the data size?",
            "**Fix the structure first** — a set instead of a list, join instead of +=, a formula instead of a loop.",
            "**Re-measure** — prove the win with timeit. If it did not improve, revert and re-measure your assumptions.",
          ],
        },
        {
          kind: "tryIt",
          title: "Predict the copies",
          task: "Predict the output of the two prints before running (count by hand: each s = s + part copies the whole string so far). Then verify, and extend: make a list of 5 parts of 3 characters each and predict plus's copy count before running again.",
          code: `def copies_for_plus(parts):
    copied = 0
    s = ""
    for part in parts:
        s = s + part
        copied += len(s)
    return copied

parts = ["x", "yy", "zzzz"]

print("parts:", parts)
print("plus copies:", copies_for_plus(parts))
`,
          hint: "Trace it: after each plus, s has length 1, then 3, then 7 — and each of those lengths is copied in full. For the extension: 3, 6, 9, 12, 15.",
        },
      ],
      terms: [
        { term: "Big-O notation", definition: "Shorthand for how work grows with data size: O(1) constant, O(n) linear, O(n squared) quadratic." },
        { term: "Micro-optimization", definition: "A tiny, local tweak (syntax, variable tricks) that rarely matters compared to algorithm or data structure choices." },
        { term: "timeit", definition: "The standard library module for timing small code snippets reliably, running them many times." },
        { term: "Profiling", definition: "Measuring where a program's time actually goes, function by function — cProfile is Python's built-in profiler." },
        { term: "Algorithmic win", definition: "A speedup from changing the approach (formula, data structure) rather than tuning lines — the biggest wins available." },
      ],
      mistakes: [
        {
          mistake: "Optimizing before measuring.",
          why: "The slow part is almost never where you guess; optimizing the wrong function wastes days and makes code uglier for nothing.",
          fix: "Profile first (cProfile), optimize the top line, then prove the win with timeit.",
        },
        {
          mistake: "Reaching for clever micro-tricks instead of better data structures.",
          why: "Replacing `x in list` with `x in set` is a thousand-fold win; shaving nanoseconds with arcane syntax is noise by comparison.",
          fix: "Ask 'what is the growth rate?' before 'how do I shave cycles?' — growth dominates everything.",
        },
        {
          mistake: "Building strings with += in a loop.",
          why: "Every += copies the entire string so far, so the total work grows with the square of the number of parts.",
          fix: "Collect parts in a list and ''.join(parts) once at the end.",
        },
      ],
      takeaways: [
        "Measure first; intuition about speed is wrong even for professionals.",
        "Growth is what matters: append O(1) vs insert(0) O(n); list scan O(n) vs set hash O(1); plus O(n squared) vs join O(n).",
        "Build the set once, look up many times; join once, never plus in a loop.",
        "The biggest speedups are algorithmic — a formula that does 3 steps beats any tuned loop.",
      ],
      quiz: [
        {
          id: "i-09-q1",
          prompt: "As the list grows, which operation's cost grows the FASTEST?",
          options: [
            { text: "data.insert(0, x)", correct: true, feedback: "Correct — every insert at the front shifts all existing elements: linear per call, quadratic in a loop." },
            { text: "data.append(x)", correct: false, feedback: "Append stays constant — it writes at the end and moves nothing, however long the list is." },
            { text: "They grow the same way", correct: false, feedback: "The count experiment separated them: 0 moves for append versus 4,950 for insert(0) at n=100." },
          ],
          explanation: "Front inserts pay the shift tax on every call — and the tax grows with the list.",
        },
        {
          id: "i-09-q2",
          prompt: "You test 'username in allowed' 10,000 times against 50,000 allowed names (currently a list). The best first move is…",
          options: [
            { text: "Build allowed_set = set(allowed) once, then test 'username in allowed_set'", correct: true, feedback: "Right — one O(n) conversion, then every lookup is a hash jump. The count experiment showed 1,000,000 comparisons versus one." },
            { text: "Sort the list first — sorted lists check membership faster", correct: false, feedback: "Sorting does not give constant-time membership; binary search on a list exists but the set is simpler and faster here." },
            { text: "Wrap the loop in a function — functions make 'in' faster", correct: false, feedback: "A function wrapper changes nothing about the scan inside; each test is still linear." },
          ],
          explanation: "Convert once, look up forever: the set's hash jump beats the list's scan by four to five orders of magnitude here.",
        },
        {
          id: "i-09-q3",
          prompt: "Why do this lesson's executed experiments print COUNTS instead of seconds?",
          options: [
            { text: "Timings vary run to run and machine to machine; counts are exactly reproducible — so only counts can be honestly verified", correct: true, feedback: "Exactly — that is the no-fake-output principle applied to performance: timing VALUES appear only in clearly-labeled text blocks." },
            { text: "Python cannot measure time at all", correct: false, feedback: "It can — timeit does exactly that, and its real outputs were shown as labeled text." },
            { text: "Counting is faster than timing", correct: false, feedback: "The reasons are honesty and reproducibility, not speed of the experiment itself." },
          ],
          explanation: "A performance claim you can re-verify beats a timing nobody can reproduce — counts make growth visible AND checkable.",
        },
      ],
    },

    // ------------------------------------------------------------- i-10
    {
      slug: "i-10",
      title: "Packaging",
      minutes: 14,
      summary:
        "Sharing code the modern way: the __name__ == '__main__' guard (executed AND import-verified), a tiny package layout, pyproject.toml, virtual environments, pip install -e ., publishing to PyPI in concept, and the complete workflow.",
      kind: "setup",
      objectives: [
        "Explain the difference between running a file as a script and importing it as a module",
        "Use the if __name__ == '__main__' guard to make a file safe as both",
        "Read a pyproject.toml and a minimal package layout",
        "Create a virtual environment and install a project in editable mode",
      ],
      why: "Everything you have written lives in one folder and runs with python3 file.py. That is fine for exercises — but the moment you want to reuse your own code across projects, hand it to a colleague, or publish it to the entire world, you need Python's packaging story: modules, packages, the __main__ guard, pyproject.toml, and pip. It has a fearsome reputation that it no longer deserves: the modern workflow is one file of metadata and three commands. This lesson walks the complete path from 'works on my machine' to 'anyone on Earth can install it' — the last skill that separates a scripter from an engineer.",
      blocks: [
        {
          kind: "text",
          text: "The journey from script to shareable package has exactly one central idea — the difference between a file you RUN and a file someone IMPORTS — and everything else is metadata and two commands. Start with the idea:",
        },
        {
          kind: "heading",
          text: "Script or module? The __name__ trick",
        },
        {
          kind: "text",
          text: "Every Python file has a built-in variable `__name__`. When you run the file directly, Python sets it to the string `\"__main__\"`. When the file is imported, Python sets it to the module's own name. One comparison against that value gives you the most famous two lines in Python:",
        },
        {
          kind: "code",
          title: "The guard, executed as a script",
          code: `def greet(name):
    return f"Hello, {name}!"

def main():
    print(greet("Ada"))
    print(greet("Grace"))

if __name__ == "__main__":
    main()
`,
          output: `Hello, Ada!
Hello, Grace!`,
          explain: [
            "Run this file directly (`python3 greeter.py`) and `__name__` is `\"__main__\"` — the guard is True, and `main()` runs.",
            "Import it (`import greeter`) and `__name__` is `\"greeter\"` — the guard is False, and the importer gets the functions without a single print.",
            "The pattern: define functions at the top, put the DOING inside `main()`, and guard the call. Your file becomes a script AND a library at once.",
          ],
        },
        {
          kind: "code",
          title: "Watching a real import (a module written to /tmp, then imported)",
          code: `from pathlib import Path
import sys

module_text = """def greet(name):
    return f"Hello, {name}!"

print("module imported, __name__ =", __name__)

if __name__ == "__main__":
    print("running as a SCRIPT - greetings below")
    print(greet("script runner"))
"""

Path("/tmp/dv_greeter_i10.py").write_text(module_text)

sys.path.insert(0, "/tmp")
import dv_greeter_i10

print(dv_greeter_i10.greet("importer"))
`,
          output: `module imported, __name__ = dv_greeter_i10
Hello, importer!`,
          explain: [
            "This is a REAL import, exactly like `import math`: the module text is written to /tmp, that folder is added to the module search path, and Python imports it.",
            "The import executed the module's top level — which is why `module imported, __name__ = dv_greeter_i10` printed. That line proves what `__name__` is on the import path.",
            "The script branch did NOT run: the guard was False. The importer got `greet` cleanly, with zero side effects — that is the entire point of the guard.",
            "The same file run DIRECTLY produces the next block's output instead.",
          ],
        },
        {
          kind: "code",
          title: "The same file, run directly (shown as text)",
          lang: "text",
          code: `$ python3 /tmp/dv_greeter_i10.py
module imported, __name__ = __main__
running as a SCRIPT - greetings below
Hello, script runner!`,
          outputNote:
            "The same module file executed as a script (real run, shown as text because it needs a real file on disk): now __name__ IS '__main__', so the guarded branch runs. Same file, two behaviors — that is the trick.",
        },
        {
          kind: "heading",
          text: "From module to package: the layout",
        },
        {
          kind: "code",
          title: "A complete tiny package",
          lang: "text",
          code: `pricekit/
├── pyproject.toml            <- the metadata (next block)
├── README.md                 <- what humans read first
└── src/
    └── pricekit/
        ├── __init__.py       <- marks this folder as a package
        ├── prices.py         # average, discount, format_price
        └── cli.py            # main(): the command-line entry point`,
          outputNote:
            "The modern 'src layout'. A package is just a folder of modules with an __init__.py; the src/ wrapper keeps your imports honest — you test the INSTALLED package, not the folder you happen to be standing in.",
        },
        {
          kind: "heading",
          text: "pyproject.toml: the ID card",
        },
        {
          kind: "code",
          title: "The whole configuration, one small file",
          lang: "text",
          code: `[build-system]
requires = ["setuptools"]
build-backend = "setuptools.build_meta"

[project]
name = "pricekit"
version = "0.1.0"
description = "Small toolkit of price helpers"
requires-python = ">=3.10"

[project.scripts]
pricekit = "pricekit.cli:main"`,
          outputNote:
            "TOML, a simple key/value format. name and version identify the project; requires-python states the minimum interpreter; and [project.scripts] turns a function into a COMMAND — after installation, typing pricekit at the terminal runs cli.py's main().",
        },
        {
          kind: "heading",
          text: "venv and pip: your clean room",
        },
        {
          kind: "code",
          title: "The four commands of daily life (shown, not executed)",
          lang: "bash",
          code: `$ python3 -m venv .venv              # create an isolated environment
$ source .venv/bin/activate          # ...on Windows: .venv\\Scripts\\activate
(.venv) $ pip install -e .           # install THIS project, editable
(.venv) $ pricekit                    # the entry point from pyproject.toml
Total: $90.00
(.venv) $ pip show pricekit
Name: pricekit
Version: 0.1.0
...`,
          outputNote:
            "A real workflow (displayed, not executed here). The (.venv) prefix shows the active environment. Why a venv: each project gets its own site-packages, so project A's library version 1 and project B's version 2 never fight over one global Python.",
        },
        {
          kind: "text",
          text: "`pip install -e .` deserves a second look: the `-e` means **editable** — instead of copying your code into site-packages, pip records a link back to your source folder. You edit prices.py, and the very next run of `pricekit` uses the new code. No reinstall, ever, while developing.",
        },
        {
          kind: "heading",
          text: "Building and publishing",
        },
        {
          kind: "code",
          title: "The road to PyPI (shown, not executed)",
          lang: "text",
          code: `$ python3 -m pip install --upgrade build
$ python3 -m build
#    -> dist/pricekit-0.1.0.tar.gz  and  dist/pricekit-0.1.0-py3-none-any.whl

$ python3 -m pip install --upgrade twine
$ python3 -m twine upload dist/*
#    -> anyone on Earth:  pip install pricekit`,
          outputNote:
            "build turns your project into the two standard distributable files; twine uploads them to the Python Package Index. Practice first on TestPyPI (test.pypi.org) — the identical workflow with a practice index, where mistakes cost nothing.",
        },
        {
          kind: "table",
          title: "The four words of sharing",
          headers: ["Word", "What it is", "Example"],
          rows: [
            ["Module", "Any .py file, importable by name", "prices.py — `import prices`"],
            ["Package", "A folder of modules with an __init__.py", "the pricekit/ folder"],
            ["Project", "The whole thing you develop: package + pyproject.toml + README", "your pricekit folder"],
            ["Distribution", "The built, installable artifact you upload", "pricekit-0.1.0.whl"],
          ],
          caption:
            "Almost all confusion about packaging dissolves once these four words stop blurring together.",
        },
        {
          kind: "steps",
          title: "The modern workflow, start to finish",
          items: [
            "**Structure** — put your code in src/yourpackage/, add __init__.py and a main() guarded by `if __name__ == \"__main__\"`.",
            "**Describe** — write pyproject.toml: name, version, description, requires-python, and the [project.scripts] entry point.",
            "**Isolate** — `python3 -m venv .venv`, activate it, and install your project with `pip install -e .`.",
            "**Verify** — run your entry-point command and your tests INSIDE the venv, against the installed package.",
            "**Publish** — `python3 -m build`, then `twine upload dist/*` (rehearse on TestPyPI first).",
          ],
        },
        {
          kind: "tryIt",
          title: "Add the guard",
          task: "This file runs main() unconditionally — even when imported, which makes it a bad library. Add the __name__ guard so main() runs only when the file is executed directly. The output in this playground (where the file IS the main module) stays the same — but an importer would now get silence.",
          code: `def shout(text):
    return text.upper() + "!"

def main():
    print(shout("ready"))
    print(shout("set"))
    print(shout("go"))

main()
`,
          hint: "Two lines at the bottom: if __name__ == \"__main__\": then, indented, main().",
        },
      ],
      terms: [
        { term: "Module", definition: "Any .py file that can be imported; its __name__ is its own module name on import." },
        { term: "Package", definition: "A folder of modules containing an __init__.py, installable and importable as one unit." },
        { term: "__main__ guard", definition: "The if __name__ == '__main__': pattern that runs entry-point code only when the file is executed directly." },
        { term: "Virtual environment (venv)", definition: "A project-local Python environment with its own installed packages, created with python3 -m venv." },
        { term: "pyproject.toml", definition: "The standard metadata file describing a project: name, version, dependencies, build system, and entry points." },
      ],
      mistakes: [
        {
          mistake: "Naming your file after a standard-library module (logging.py, random.py, unittest.py).",
          why: "Your folder is searched first, so `import logging` inside logging.py imports YOUR file — circular chaos with baffling tracebacks.",
          fix: "Give files descriptive, non-colliding names: log_setup.py, task_tests.py, price_helpers.py.",
        },
        {
          mistake: "Running side effects at import time — prints, file writes, a bare main() call — with no guard.",
          why: "Every importer executes the module's top level, so a script that DOES things on import is unusable as a library.",
          fix: "Wrap the doing in main() and guard it with `if __name__ == \"__main__\":`.",
        },
        {
          mistake: "Installing every project's dependencies into the global Python.",
          why: "Projects inevitably need different versions of the same library; one global collection cannot satisfy them all, and upgrades break other projects.",
          fix: "One venv per project: create it, activate it, install inside it — and commit a requirements.txt of what you installed.",
        },
      ],
      takeaways: [
        "__name__ is '__main__' when a file is run directly, the module name when imported — the guard makes one file safe as both.",
        "A package is a folder of modules plus pyproject.toml; pip install -e . installs it editable so edits apply instantly.",
        "One venv per project keeps dependency versions from fighting each other.",
        "python3 -m build plus twine upload is the whole road to PyPI — rehearse it on TestPyPI first.",
      ],
      quiz: [
        {
          id: "i-10-q1",
          prompt: "A file named prices.py is imported with import prices. Inside the running module, __name__ is…",
          options: [
            { text: "The string 'prices' — the module's own name", correct: true, feedback: "Correct — and that is exactly why the __main__ guard stays False on import." },
            { text: "The string '__main__'", correct: false, feedback: "That is the value only when the file is RUN directly — the import path uses the module name." },
            { text: "The file's full path on disk", correct: false, feedback: "The path matters for finding the file, but __name__ is the short module name." },
          ],
          explanation: "Run directly: __main__. Imported: the module's name. The guard simply compares against those two realities.",
        },
        {
          id: "i-10-q2",
          prompt: "Why does pip install -e . matter during development?",
          options: [
            { text: "Edits to your source apply immediately — no reinstall after every change", correct: true, feedback: "Right — editable mode links to your folder instead of copying it, so each run uses the current code." },
            { text: "It makes the installed package run faster", correct: false, feedback: "The code is identical — the difference is where it is loaded from, not how fast it runs." },
            { text: "It hides your source code from users", correct: false, feedback: "Nothing is hidden; the installer simply points at your working folder." },
          ],
          explanation: "Editable install = develop like a script, import like a library — the daily-driver command.",
        },
        {
          id: "i-10-q3",
          prompt: "What does the line pricekit = \"pricekit.cli:main\" under [project.scripts] do?",
          options: [
            { text: "Creates a pricekit terminal command that runs the main() function in pricekit/cli.py", correct: true, feedback: "Exactly — after installation, typing pricekit calls that function. Entry points are how tools become commands." },
            { text: "Runs pricekit automatically every time Python starts", correct: false, feedback: "Nothing runs at startup — the command is created and waits for you to invoke it." },
            { text: "Documents which function is the most important one", correct: false, feedback: "It does far more than document: it manufactures a real executable command." },
          ],
          explanation: "Entry points are the bridge from your function to the user's terminal — one TOML line, one command.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART I EXERCISES — 4 beginner, 4 intermediate, 4 advanced
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "i-b1",
      tier: "beginner",
      title: "Annotate the price functions",
      prompt:
        "Add type hints to both functions so a reader knows exactly what goes in and what comes out: price_with_tax takes two floats and returns a float; format_price takes a float and returns a str. The output must stay exactly the same — hints are documentation, not behavior. Run it after annotating to prove it, then print price_with_tax.__annotations__ to see your hints stored.",
      hint: "The pattern is def price_with_tax(price: float, tax_percent: float) -> float: — a colon after each parameter, an arrow before the return type.",
      starter: `# Add type hints to both functions (output must not change)
def price_with_tax(price, tax_percent):
    return price + price * tax_percent / 100

def format_price(amount):
    return f"\${amount:.2f}"

print(format_price(price_with_tax(80.0, 12.5)))
print(format_price(price_with_tax(19.99, 0)))
`,
      solution: `def price_with_tax(price: float, tax_percent: float) -> float:
    return price + price * tax_percent / 100

def format_price(amount: float) -> str:
    return f"\${amount:.2f}"

print(format_price(price_with_tax(80.0, 12.5)))
print(format_price(price_with_tax(19.99, 0)))
print(price_with_tax.__annotations__)
`,
      expectedOutput: `$90.00
$19.99
{'price': <class 'float'>, 'tax_percent': <class 'float'>, 'return': <class 'float'>}`,
      concepts: ["type hints", "function signatures", "annotations"],
    },
    {
      id: "i-b2",
      tier: "beginner",
      title: "Model a library with a dataclass",
      prompt:
        "The hand-written Song class below does exactly what @dataclass generates: __init__, __repr__, and __eq__. Replace all ten lines of the class with a five-line @dataclass version (from dataclasses import dataclass, keep the three annotated fields title, artist, seconds), and verify that the output is IDENTICAL — the repr, the longest-song line, and the equality check must all still work without you writing a single method.",
      hint: "The decorator writes all three methods from the annotated fields: @dataclass above the class, then title: str, artist: str, seconds: int — nothing else.",
      starter: `class Song:
    def __init__(self, title, artist, seconds):
        self.title = title
        self.artist = artist
        self.seconds = seconds

    def __repr__(self):
        return f"Song(title={self.title!r}, artist={self.artist!r}, seconds={self.seconds})"

    def __eq__(self, other):
        return (self.title, self.artist, self.seconds) == (other.title, other.artist, other.seconds)

# TODO: replace the whole class above with a 5-line @dataclass version
library = [
    Song("Blue Sky", "Ada", 213),
    Song("Night Drive", "Grace", 245),
]

for song in library:
    print(song)

longest = max(library, key=lambda s: s.seconds)
print("longest:", longest.title, "-", longest.seconds, "seconds")
print("same song again?", library[0] == Song("Blue Sky", "Ada", 213))
`,
      solution: `from dataclasses import dataclass

@dataclass
class Song:
    title: str
    artist: str
    seconds: int

library = [
    Song("Blue Sky", "Ada", 213),
    Song("Night Drive", "Grace", 245),
]

for song in library:
    print(song)

longest = max(library, key=lambda s: s.seconds)
print("longest:", longest.title, "-", longest.seconds, "seconds")
print("same song again?", library[0] == Song("Blue Sky", "Ada", 213))
`,
      expectedOutput: `Song(title='Blue Sky', artist='Ada', seconds=213)
Song(title='Night Drive', artist='Grace', seconds=245)
longest: Night Drive - 245 seconds
same song again? True`,
      concepts: ["dataclasses", "__repr__", "__eq__", "boilerplate"],
    },
    {
      id: "i-b3",
      tier: "beginner",
      title: "Wrap the report in tags",
      prompt:
        "The TagBlock class is a complete context manager that prints an opening tag on entry and a closing tag on exit. Use it with nested with statements: an outer TagBlock(\"report\") block that prints 'quarterly numbers look good', and inside it a TagBlock(\"summary\") block that prints 'up 12 percent'. After both blocks close, print 'done'. The tags must nest like HTML: the inner tag closes before the outer one.",
      hint: "Nesting is just indentation: the inner with block goes inside the outer body. Closers run in reverse order automatically — that is the context manager guarantee.",
      starter: `class TagBlock:
    def __init__(self, tag):
        self.tag = tag

    def __enter__(self):
        print(f"<{self.tag}>")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"</{self.tag}>")
        return False

# TODO 1: open a with-statement on TagBlock("report")
# TODO 2: inside it, print("quarterly numbers look good")
# TODO 3: nest a TagBlock("summary") block that prints "up 12 percent"
# TODO 4: after both blocks close, print("done")
`,
      solution: `class TagBlock:
    def __init__(self, tag):
        self.tag = tag

    def __enter__(self):
        print(f"<{self.tag}>")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"</{self.tag}>")
        return False

with TagBlock("report"):
    print("quarterly numbers look good")
    with TagBlock("summary"):
        print("up 12 percent")

print("done")
`,
      expectedOutput: `<report>
quarterly numbers look good
<summary>
up 12 percent
</summary>
</report>
done`,
      concepts: ["context managers", "with statement", "nesting"],
    },
    {
      id: "i-b4",
      tier: "beginner",
      title: "Map, filter, round",
      prompt:
        "Given the temperatures list, use filter with a lambda to keep only readings of 25 degrees or more, then use map with round to round each kept reading to the nearest whole number. Print the hot list and the rounded list exactly as shown in the expected output. Remember that map and filter return lazy objects — wrap each in list() to materialize the results.",
      hint: "hot = list(filter(lambda t: t >= 25, temps)) then rounded = list(map(round, hot)). round of a float like 30.0 returns the int 30.",
      starter: `temps = [21.5, 30.0, 12.8, 35.2, 8.4, 27.9]

# TODO 1: hot = ... filter with a lambda keeping t >= 25, wrapped in list()
# TODO 2: rounded = ... map with round over hot, wrapped in list()

print("hot:", hot)
print("rounded:", rounded)
`,
      solution: `temps = [21.5, 30.0, 12.8, 35.2, 8.4, 27.9]

hot = list(filter(lambda t: t >= 25, temps))
rounded = list(map(round, hot))

print("hot:", hot)
print("rounded:", rounded)
`,
      expectedOutput: `hot: [30.0, 35.2, 27.9]
rounded: [30, 35, 28]`,
      concepts: ["filter", "map", "lambdas", "lazy iterators"],
    },

    // ---- intermediate
    {
      id: "i-i1",
      tier: "intermediate",
      title: "Build a Section context manager",
      prompt:
        "Write a class-based context manager Section: __enter__ prints '=== {title} ===' and returns self; __exit__ prints '=== end {title} ===' and returns False. Store the title in __init__. Then use it exactly as the expected output shows: a 'Setup' section printing one line, a 'Report' section printing one line, and a 'Costs' section NESTED inside 'Report'. The banners must close in the correct reverse order.",
      hint: "Copy the shape of TagBlock from the lesson: title stored in __init__, the two prints in __enter__/__exit__. Nesting is indentation — the inner block finishes first.",
      starter: `class Section:
    def __init__(self, title):
        self.title = title

    def __enter__(self):
        # TODO: print f"=== {self.title} ===" and return self
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        # TODO: print f"=== end {self.title} ===" and return False
        return False

# TODO: 'Setup' section printing "loading configuration"
# TODO: 'Report' section printing "revenue: up",
#       with a nested 'Costs' section printing "costs: down"
`,
      solution: `class Section:
    def __init__(self, title):
        self.title = title

    def __enter__(self):
        print(f"=== {self.title} ===")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print(f"=== end {self.title} ===")
        return False

with Section("Setup"):
    print("loading configuration")

with Section("Report"):
    print("revenue: up")
    with Section("Costs"):
        print("costs: down")
`,
      expectedOutput: `=== Setup ===
loading configuration
=== end Setup ===
=== Report ===
revenue: up
=== Costs ===
costs: down
=== end Costs ===
=== end Report ===`,
      concepts: ["context managers", "__enter__", "__exit__", "nesting"],
    },
    {
      id: "i-i2",
      tier: "intermediate",
      title: "Counter factory with a step",
      prompt:
        "Write make_counter(label, step=1) — a factory function that creates count = 0 and returns a tick() closure which adds step to the count (with nonlocal) and returns f\"{label}: {count}\". Then build an 'evens' counter with step=2 and an 'odds' counter with the default step, and call them in this exact order: two evens calls on one print line, three odds calls on the next, then one evens call. The output must prove the two counters share nothing.",
      hint: "Inside tick(), declare nonlocal count BEFORE the assignment count += step. Each call to make_counter builds a fresh count = 0 — that is what keeps evens and odds independent.",
      starter: `def make_counter(label, step=1):
    # TODO 1: create count = 0
    # TODO 2: define tick(): nonlocal count, add step, return f"{label}: {count}"
    # TODO 3: return tick
    pass

# TODO 4: evens = make_counter("evens", 2); odds = make_counter("odds")
# TODO 5: print(evens(), evens())  then  print(odds(), odds(), odds())  then  print(evens())
`,
      solution: `def make_counter(label, step=1):
    count = 0

    def tick():
        nonlocal count
        count += step
        return f"{label}: {count}"

    return tick

evens = make_counter("evens", 2)
odds = make_counter("odds", 1)

print(evens(), evens())
print(odds(), odds(), odds())
print(evens())
`,
      expectedOutput: `evens: 2 evens: 4
odds: 1 odds: 2 odds: 3
evens: 6`,
      concepts: ["closures", "nonlocal", "default arguments", "factory functions"],
    },
    {
      id: "i-i3",
      tier: "intermediate",
      title: "Reduce the cart",
      prompt:
        "Use functools.reduce three times on the cart list [12.5, 40.0, 7.25, 20.0]: once with a lambda that adds (starting from 0.0) to compute the total; once to pick the cheapest item (a lambda of two arguments returning the smaller); and once to pick the priciest. Print all three labeled results exactly as shown. Every lambda takes (a, b) and returns one value — that is the shape reduce demands.",
      hint: "For min-like behavior: lambda a, b: a if a < b else b. The initializer 0.0 only matters for the sum — it also makes an empty cart safe.",
      starter: `from functools import reduce

cart = [12.5, 40.0, 7.25, 20.0]

# TODO 1: total = reduce(...) with an adding lambda and initializer 0.0
# TODO 2: cheapest = reduce(...) picking the smaller of each pair
# TODO 3: priciest = reduce(...) picking the larger of each pair

print("total:", total)
print("cheapest:", cheapest)
print("priciest:", priciest)
`,
      solution: `from functools import reduce

cart = [12.5, 40.0, 7.25, 20.0]

total = reduce(lambda a, b: a + b, cart, 0.0)
cheapest = reduce(lambda a, b: a if a < b else b, cart)
priciest = reduce(lambda a, b: a if a > b else b, cart)

print("total:", total)
print("cheapest:", cheapest)
print("priciest:", priciest)
`,
      expectedOutput: `total: 79.75
cheapest: 7.25
priciest: 40.0`,
      concepts: ["functools.reduce", "lambdas", "folding a sequence"],
    },
    {
      id: "i-i4",
      tier: "intermediate",
      title: "Async ping, gathered",
      prompt:
        "Write an async function ping(name, steps) that prints 'name ping i' for each step from 1 to steps, awaiting asyncio.sleep(0) after every print (the pause point that lets the other task run), and returns name. Write async main() that awaits asyncio.gather(ping(\"alpha\", 2), ping(\"beta\", 3)) and prints 'finished:' plus the gathered order joined by '-'. Drive everything with asyncio.run(main()). The interleaved print order is the point — predict it before running.",
      hint: "await asyncio.sleep(0) inside the loop, right after the print. gather returns results in argument order: join them with \"-\".join(order).",
      starter: `import asyncio

async def ping(name, steps):
    # TODO: loop i from 1 to steps (inclusive):
    #   print(f"{name} ping {i}")
    #   await asyncio.sleep(0)
    return name

async def main():
    # TODO: order = await asyncio.gather(ping("alpha", 2), ping("beta", 3))
    # TODO: print "finished:" plus order joined with "-"
    pass

# TODO: drive main with asyncio.run(...)
`,
      solution: `import asyncio

async def ping(name, steps):
    for i in range(1, steps + 1):
        print(f"{name} ping {i}")
        await asyncio.sleep(0)
    return name

async def main():
    order = await asyncio.gather(ping("alpha", 2), ping("beta", 3))
    print("finished:", "-".join(order))

asyncio.run(main())
`,
      expectedOutput: `alpha ping 1
beta ping 1
alpha ping 2
beta ping 2
beta ping 3
finished: alpha-beta`,
      concepts: ["async/await", "asyncio.gather", "event loop"],
    },

    // ---- advanced
    {
      id: "i-a1",
      tier: "advanced",
      title: "A real TestCase for discount",
      prompt:
        "The discount function below validates its percent and raises ValueError outside 0..100. Write a unittest.TestCase subclass with three tests — ten percent off 100.0 equals 90.0, zero percent changes nothing, and a negative percent raises ValueError — then run the suite with unittest.main(argv=[\"course\"], exit=False), read .result from the returned object, and print 'tests run:' and 'failures:' lines to standard output exactly as shown.",
      hint: "class TestDiscount(unittest.TestCase): with three test_ methods. Use assertEqual for values and with self.assertRaises(ValueError): for the bad input. Then result = unittest.main(argv=[\"course\"], exit=False).result; the counts live in result.testsRun, result.failures, result.errors.",
      starter: `import unittest

def discount(price: float, percent: float) -> float:
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return price - price * percent / 100

class TestDiscount(unittest.TestCase):
    # TODO 1: test_ten_percent_off_hundred — assertEqual(discount(100.0, 10), 90.0)
    # TODO 2: test_zero_percent_changes_nothing — assertEqual(discount(50.0, 0), 50.0)
    # TODO 3: test_negative_percent_raises — with self.assertRaises(ValueError):
    #         discount(100.0, -5)
    pass

result = unittest.main(argv=["course"], exit=False).result
print("tests run:", result.testsRun)
print("failures:", len(result.failures) + len(result.errors))
`,
      solution: `import unittest

def discount(price: float, percent: float) -> float:
    if percent < 0 or percent > 100:
        raise ValueError("percent must be between 0 and 100")
    return price - price * percent / 100

class TestDiscount(unittest.TestCase):
    def test_ten_percent_off_hundred(self):
        self.assertEqual(discount(100.0, 10), 90.0)

    def test_zero_percent_changes_nothing(self):
        self.assertEqual(discount(50.0, 0), 50.0)

    def test_negative_percent_raises(self):
        with self.assertRaises(ValueError):
            discount(100.0, -5)

result = unittest.main(argv=["course"], exit=False).result
print("tests run:", result.testsRun)
print("failures:", len(result.failures) + len(result.errors))
`,
      expectedOutput: `tests run: 3
failures: 0`,
      concepts: ["unittest", "assertEqual", "assertRaises", "testing exceptions"],
    },
    {
      id: "i-a2",
      tier: "advanced",
      title: "Configure logging for the fleet",
      prompt:
        "Configure the logging module to write to /tmp/fleet.log (remove any old file first so runs are reproducible) with level WARNING and format \"%(levelname)s | %(message)s\". Write check_temperature(name, celsius) that logs a WARNING ('{name} is hot: {celsius}C') when the temperature exceeds 80 and an INFO line otherwise. Call it for cpu 75, gpu 92, and disk 41, then read the whole log file back and print it, followed by '[end of log]'. Only the warning should survive the level filter.",
      hint: "logging.basicConfig(filename=path, level=logging.WARNING, format=\"%(levelname)s | %(message)s\"). Use logging.warning(...) and logging.info(...). At WARNING level, the INFO lines are filtered out — they never reach the file.",
      starter: `import logging
import os

path = "/tmp/fleet.log"
if os.path.exists(path):
    os.remove(path)

# TODO 1: logging.basicConfig(...) — filename=path, level=WARNING,
#         format="%(levelname)s | %(message)s"

def check_temperature(name, celsius):
    # TODO 2: if celsius > 80, log a WARNING f-string; otherwise log an INFO line
    pass

check_temperature("cpu", 75)
check_temperature("gpu", 92)
check_temperature("disk", 41)

# TODO 3: open the file and print its contents, then print("[end of log]")
`,
      solution: `import logging
import os

path = "/tmp/fleet.log"
if os.path.exists(path):
    os.remove(path)

logging.basicConfig(
    filename=path,
    level=logging.WARNING,
    format="%(levelname)s | %(message)s",
)

def check_temperature(name, celsius):
    if celsius > 80:
        logging.warning("%s is hot: %sC", name, celsius)
    else:
        logging.info("%s is fine: %sC", name, celsius)

check_temperature("cpu", 75)
check_temperature("gpu", 92)
check_temperature("disk", 41)

with open(path) as f:
    print(f.read(), end="")
print("[end of log]")
`,
      expectedOutput: `WARNING | gpu is hot: 92C
[end of log]`,
      concepts: ["logging", "log levels", "log files", "level filtering"],
    },
    {
      id: "i-a3",
      tier: "advanced",
      title: "Fix the broken async cafe",
      prompt:
        "This async cafe program has exactly two bugs and prints NOTHING when run. Bug 1: main() is called directly instead of being driven with asyncio.run(), so the coroutine is created but never executed. Bug 2: inside brew(), asyncio.sleep(0) is missing its await, so tasks never yield to each other and the two brews cannot interleave. Find both bugs by reading carefully (and by tracing what 'coroutine was never awaited' is telling you), fix them, and make the program print the interleaved brew plus the results list shown below.",
      hint: "Fix 1 is on the last line: asyncio.run(main()). Fix 2 is inside brew: await asyncio.sleep(0). After both fixes, 'tea' and 'coffee' interleave because each await hands the baton over.",
      starter: `import asyncio

async def brew(name, steps):
    print(f"{name}: starting")
    for i in range(1, steps + 1):
        asyncio.sleep(0)            # BUG 2: something is missing here
        print(f"{name}: step {i}")
    return f"{name} done"

async def main():
    results = await asyncio.gather(brew("tea", 1), brew("coffee", 2))
    print("results:", results)

main()                                # BUG 1: this is not how you run a coroutine
`,
      solution: `import asyncio

async def brew(name, steps):
    print(f"{name}: starting")
    for i in range(1, steps + 1):
        await asyncio.sleep(0)
        print(f"{name}: step {i}")
    return f"{name} done"

async def main():
    results = await asyncio.gather(brew("tea", 1), brew("coffee", 2))
    print("results:", results)

asyncio.run(main())
`,
      expectedOutput: `tea: starting
coffee: starting
tea: step 1
coffee: step 1
coffee: step 2
results: ['tea done', 'coffee done']`,
      concepts: ["async/await", "debugging", "event loop", "coroutines"],
    },
    {
      id: "i-a4",
      tier: "advanced",
      title: "Typed shopping cart records",
      prompt:
        "Build a small typed shopping-cart model. Item is a FROZEN dataclass with name: str, price: float, and tags: tuple[str, ...] defaulting to (). Cart is a regular dataclass with buyer: str and items: list[Item] built with field(default_factory=list), plus a total() method returning the sum of the prices. Also write names_with_tag(cart, tag) returning a list of item names carrying that tag. Fill Ada's cart with the three items shown, then print the four summary lines exactly as in the expected output.",
      hint: "Frozen Item still allows the CART's list to change — cart.items.append(...) mutates the list, not the item. total() can be sum(item.price for item in self.items); the tag check is: tag in item.tags.",
      starter: `from dataclasses import dataclass, field

# TODO 1: @dataclass(frozen=True) class Item with
#         name: str, price: float, tags: tuple[str, ...] = ()

# TODO 2: @dataclass class Cart with buyer: str,
#         items: list[Item] = field(default_factory=list),
#         and a total(self) -> float method

# TODO 3: def names_with_tag(cart, tag) -> list of item names carrying tag

cart = Cart("Ada")
cart.items.append(Item("keyboard", 79.0, ("hardware",)))
cart.items.append(Item("mouse", 29.5, ("hardware", "wireless")))
cart.items.append(Item("course", 12.0, ("digital",)))

print(f"{cart.buyer} has {len(cart.items)} items")
print("total:", cart.total())
print("hardware:", names_with_tag(cart, "hardware"))
print("wireless:", names_with_tag(cart, "wireless"))
`,
      solution: `from dataclasses import dataclass, field

@dataclass(frozen=True)
class Item:
    name: str
    price: float
    tags: tuple[str, ...] = ()

@dataclass
class Cart:
    buyer: str
    items: list[Item] = field(default_factory=list)

    def total(self) -> float:
        return sum(item.price for item in self.items)

def names_with_tag(cart: Cart, tag: str) -> list[str]:
    return [item.name for item in cart.items if tag in item.tags]

cart = Cart("Ada")
cart.items.append(Item("keyboard", 79.0, ("hardware",)))
cart.items.append(Item("mouse", 29.5, ("hardware", "wireless")))
cart.items.append(Item("course", 12.0, ("digital",)))

print(f"{cart.buyer} has {len(cart.items)} items")
print("total:", cart.total())
print("hardware:", names_with_tag(cart, "hardware"))
print("wireless:", names_with_tag(cart, "wireless"))
`,
      expectedOutput: `Ada has 3 items
total: 120.5
hardware: ['keyboard', 'mouse']
wireless: ['mouse']`,
      concepts: ["dataclasses", "frozen records", "default_factory", "type hints"],
    },
  ],

  // =====================================================================
  // PART I ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "i-as-1",
      prompt: "You annotate def send(to: str) -> None: and then call send(42). What happens when the program runs?",
      options: [
        { text: "It runs fine — standard type hints are not enforced at runtime, and 42 travels into `to` like any other value", correct: true, feedback: "Correct — hints are documentation to the interpreter and contracts for a static checker like mypy; Python itself does not stop the call." },
        { text: "TypeError: argument of type 'int' is not assignable to 'str'", correct: false, feedback: "That is what mypy reports statically — at runtime Python executes the call without a word." },
        { text: "SyntaxError — the annotation makes the call illegal", correct: false, feedback: "The annotation is completely legal, and so is the (mis)match at runtime — the checker is where mismatches are caught." },
        { text: "The hint converts 42 into the string '42'", correct: false, feedback: "Annotations never cast values — no coercion happens, the int simply passes through." },
      ],
      explanation: "Runtime erasure: Python reads the hints, stores them in __annotations__, and ignores them during execution. Enforcement belongs to static checkers (mypy and friends) — that is gradual typing.",
    },
    {
      id: "i-as-2",
      prompt: "Point is decorated with @dataclass(frozen=True) and has one field x. What does Point(3) == Point(3) evaluate to?",
      options: [
        { text: "True — @dataclass writes __eq__ that compares the fields, and (3,) == (3,)", correct: true, feedback: "Exactly — generated init, repr AND eq are the dataclass trifecta; frozen also forbids assignment after creation." },
        { text: "False — two objects are never equal unless they are the same object", correct: false, feedback: "That is the default identity rule — which @dataclass deliberately replaces with value comparison." },
        { text: "TypeError — frozen objects cannot be compared", correct: false, feedback: "frozen blocks mutation (point.x = 4 raises), never comparison." },
        { text: "True only for strings, not for numbers", correct: false, feedback: "Field comparison works for every field type the class declares — 3 == 3 is all that is asked here." },
      ],
      explanation: "A dataclass is data + behavior: __init__ builds, __repr__ prints, __eq__ compares field by field. frozen=True adds the third guarantee — the record cannot be mutated after birth.",
    },
    {
      id: "i-as-3",
      prompt: "Inside `with managed_resource() as r:` the body raises ZeroDivisionError. Which of these runs, and in what order?",
      options: [
        { text: "The manager's cleanup (__exit__) runs first, THEN the exception continues outward to any except clause", correct: true, feedback: "Exactly the guarantee: __exit__ fires on the success path and the error path alike — cleanup happens before the exception resumes its journey." },
        { text: "The exception skips __exit__ — cleanup code is jumped over", correct: false, feedback: "That is exactly the bug `with` exists to prevent; plain code after the block would be skipped, __exit__ cannot be." },
        { text: "__exit__ runs and the exception is silently swallowed", correct: false, feedback: "__exit__ returning False (the honest default) lets the error keep propagating — swallowing requires returning True, on purpose." },
        { text: "ZeroDivisionError is raised before __enter__ gets a chance to finish", correct: false, feedback: "__enter__ completed long before the body ran — the body raising is what triggers the __exit__ path." },
      ],
      explanation: "The with protocol: __enter__ runs before the body, __exit__ runs after it — ALWAYS, success or exception. Cleanup that cannot be skipped is the entire point of the statement.",
    },
    {
      id: "i-as-4",
      prompt: "Predict the output: list(filter(lambda word: len(word) > 4, [\"fig\", \"apple\", \"kiwi\"]))",
      options: [
        { text: "['apple']", correct: true, feedback: "Right — len('fig') = 3 and len('kiwi') = 4 fail the > 4 test; only 'apple' (5 letters) survives the filter." },
        { text: "['fig', 'apple', 'kiwi']", correct: false, feedback: "That is filter with a always-True condition — your lambda does have a threshold; check each length against 4." },
        { text: "[False, True, False]", correct: false, feedback: "The lambda's booleans decide membership, but filter returns the original items, not the verdicts." },
        { text: "['apple', 'kiwi']", correct: false, feedback: "So close — 4 is not greater than 4. 'kiwi' fails the strict > test; only > 4 keeps it." },
      ],
      explanation: "filter keeps every item whose lambda verdict is True and returns the items themselves. len('fig')=3, len('kiwi')=4, len('apple')=5 — only 'apple' passes len > 4.",
    },
    {
      id: "i-as-5",
      prompt: "One program must download 50 web pages (I/O-bound); another must compress 50 videos (CPU-bound). Which tool genuinely accelerates which job?",
      options: [
        { text: "Threads accelerate the downloads (waiting overlaps); for the CPU work you need processes, because the GIL lets only one thread run Python bytecode at a time", correct: true, feedback: "Exactly the honest rule: threads overlap WAITING, processes overlap COMPUTING — the GIL draws the line." },
        { text: "Threads accelerate both jobs equally", correct: false, feedback: "For the CPU job the two threads just take turns — the GIL forces bytecode to run one thread at a time, so nothing is gained." },
        { text: "Processes accelerate both, threads accelerate neither", correct: false, feedback: "Threads are the RIGHT tool for overlapping I/O waits — downloading serially is simply slower than overlapping the waits." },
        { text: "asyncio is required for the CPU work", correct: false, feedback: "async also only overlaps waiting; pure computation needs real parallelism, which means processes (or C libraries that release the GIL)." },
      ],
      explanation: "The GIL: one thread at a time executes Python bytecode. Threads shine when work is waiting on the network or disk; for pure computation, multiprocessing gives each worker its own interpreter — and its own GIL.",
    },
    {
      id: "i-as-6",
      prompt: "Inside an async def function you hold three coroutines a, b, c. Which line actually runs them concurrently?",
      options: [
        { text: "results = await asyncio.gather(a(), b(), c())", correct: true, feedback: "Correct — gather starts all three and suspends until every result is in; the waits overlap." },
        { text: "results = await a(); await b(); await c()", correct: false, feedback: "Three separate awaits run STRICTLY one after another — polite, but zero concurrency: the total time is the sum of the parts." },
        { text: "results = asyncio.run(a(), b(), c())", correct: false, feedback: "asyncio.run takes ONE coroutine to start the event loop — and it belongs at the top level, not inside async def." },
        { text: "results = a() + b() + c()", correct: false, feedback: "Calling a coroutine without await creates it but never runs it — adding them raises TypeError, not concurrency." },
      ],
      explanation: "await x suspends until x finishes; gather runs several awaitables together so their waiting overlaps. Sequential awaits are exactly as slow as the serial loop they replace.",
    },
    {
      id: "i-as-7",
      prompt: "In a test file you write: assert total_pages([]) == 0, \"empty log must be zero\". The condition is False. What happens?",
      options: [
        { text: "AssertionError is raised with the message 'empty log must be zero' — the test fails loudly, right at the claim", correct: true, feedback: "Exactly: a failing assert is a raised exception carrying your message — the failure cannot scroll by unnoticed." },
        { text: "The message is printed as a warning and the test continues", correct: false, feedback: "assert never prints-and-continues — False means raise, that is the whole contract." },
        { text: "The assert returns False for the caller to handle", correct: false, feedback: "assert is a statement, not a function: it has no return value; its output is silence or AssertionError." },
        { text: "Nothing — asserts only work under pytest", correct: false, feedback: "assert is core Python, everywhere; pytest just happens to catch AssertionErrors and report them beautifully with the values involved." },
      ],
      explanation: "assert condition, message: True — silence, the program continues. False — AssertionError with your message, right there. Tests are saved claims, and every failed claim names itself.",
    },
    {
      id: "i-as-8",
      prompt: "Why does multiprocessing require `if __name__ == \"__main__\":` around the launch code?",
      options: [
        { text: "New workers re-import the module — without the guard, each worker re-runs the launch code and tries to spawn workers of its own, forever", correct: true, feedback: "Exactly: on spawn-based systems the module is imported fresh in every child; the guard makes the import a no-op except in the one real main process." },
        { text: "It makes the program run faster by skipping imports", correct: false, feedback: "The guard does not skip imports — it skips the launch code that must run exactly once." },
        { text: "It is a style convention with no functional effect", correct: false, feedback: "Without it, spawn-based multiprocessing literally explodes into an infinite spawn chain — a functional requirement, not style." },
        { text: "It is only needed on the oldest versions of Python", correct: false, feedback: "It is needed TODAY on Windows and macOS, where the spawn start method re-imports your module in every worker." },
      ],
      explanation: "Spawn-style workers import your module to find the function to run. The __main__ guard answers 'is this the original process or a worker?' — only the original launches the pool, so the chain stops.",
    },
  ],

  // =====================================================================
  // PART I MINI PROJECT
  // =====================================================================
  project: {
    title: "The Reading Log, Production Grade",
    brief:
      "You will turn a four-book reading log into a small professional-grade program that exercises the entire Part I toolbelt: a frozen, typed @dataclass for the records; pure, type-hinted, docstringed functions for the math; max() with a lambda key for the top book; a @contextmanager that guarantees the report's footer is printed; an assert-based test block that must pass before anything is reported; and an `if __name__ == \"__main__\":` guard so importing the module runs nothing. Every idea here is the professional habit it was named in the lessons — this project is where they become one program you could honestly ship.",
    requirements: [
      "Book is a @dataclass(frozen=True) with typed fields — title: str, pages: int, rating: float",
      "total_pages, average_rating and top_book are pure functions: type hints in the signature, a one-line docstring, zero printing inside — they only return",
      "average_rating returns 0.0 for an empty list instead of crashing (the guard comes first)",
      "top_book uses max() with a lambda key — no hand-written comparison loop",
      "report(title) is a @contextmanager: everything above the yield prints a '=' sign banner with the title, everything below prints a matching footer — the with body prints the four data lines between them",
      "A test block of three asserts runs BEFORE the report and must all pass silently: total pages 1114, average rating above 4.0, top book named Dune",
      "The whole launch lives under `if __name__ == \"__main__\":` — importing the module must execute nothing",
    ],
    steps: [
      "Step 1 — Define the frozen dataclass and hardcode the four books: Dune (412 pages, 5.0), Tiny Habits (320, 4.0), The Pragmatic Programmer (352, 4.5), A Short History (30, 3.5). print(books[0]) once to see the generated __repr__ — then delete that print.",
      "Step 2 — Write total_pages with sum() or a loop; add the assert `assert total_pages(books) == 1114` and run it — 412 + 320 + 352 + 30. Keep asserts until the final pass.",
      "Step 3 — Write average_rating: guard the empty list first (return 0.0), then sum of ratings / count. Add `assert average_rating(books) > 4.0` and hand-check: (5.0 + 4.0 + 4.5 + 3.5) / 4 = 4.25.",
      "Step 4 — Write top_book as max(books, key=lambda book: book.rating). Add `assert top_book(books).title == \"Dune\"` — Dune's 5.0 is the highest rating.",
      "Step 5 — Write report(title) with @contextmanager: banner above the yield, footer below it. Test it alone — `with report(\"TEST\"): pass` — and check the banner and footer hug each other; that proves __exit__ fires even with an empty body.",
      "Step 6 — Build the report body inside `with report(\"READING LOG\"):` — four lines: the count of books, total pages, average rating rounded to 2 places, and the top book's title with its rating.",
      "Step 7 — Assemble main(): the three asserts first, then the with block. The complete output must be the banner, the four data lines, and the footer — verify each number against the hardcoded data by hand.",
      "Step 8 — Final pass: confirm the test block sits FIRST, re-read every docstring aloud, delete leftover debug prints, and run the file once from the top. Then import it from another file (or python -c) and prove that nothing runs.",
    ],
    starter: `# ============================================================
# The Reading Log, Production Grade
# A typed, tested, context-managed report generator.
# ============================================================
from contextlib import contextmanager
from dataclasses import dataclass


@dataclass(frozen=True)
class Book:
    """One finished book: title, pages, and a 1-5 rating."""
    title: str
    pages: int
    rating: float


def total_pages(books: list[Book]) -> int:
    """Return the sum of all page counts."""
    # TODO: sum the pages across books
    return 0


def average_rating(books: list[Book]) -> float:
    """Return the mean rating, or 0.0 for an empty log."""
    # TODO: guard the empty list FIRST, then sum of ratings / count
    return 0.0


def top_book(books: list[Book]) -> Book:
    """Return the highest-rated book."""
    # TODO: max(books, key=lambda book: book.rating)
    return books[0]


@contextmanager
def report(title: str):
    """Print a '=' banner with the title before the body, a footer after."""
    # TODO: banner print above the yield, footer print below it
    yield


def main() -> None:
    books = [
        Book("Dune", 412, 5.0),
        Book("Tiny Habits", 320, 4.0),
        Book("The Pragmatic Programmer", 352, 4.5),
        Book("A Short History", 30, 3.5),
    ]

    # The test block — three claims, run first, pass silently
    assert total_pages(books) == 1114
    assert average_rating(books) > 4.0
    assert top_book(books).title == "Dune"

    with report("READING LOG"):
        # TODO: four lines — count, pages, avg rating (2dp), top book
        pass


if __name__ == "__main__":
    main()
`,
    concepts: ["frozen dataclasses", "type hints", "context managers", "pure functions", "assert-based testing", "main guard"],
    extension:
      "Add a closure-based reading goal: make_goal(target_pages) returns a tick(pages) closure that keeps its own running total and prints '682 / 1000' style progress on every call — create two goals and prove they hold private, separate totals. Then upgrade report() to use try/finally around the yield and explain in a comment why even a with-body exception can no longer skip the footer.",
  },
};
