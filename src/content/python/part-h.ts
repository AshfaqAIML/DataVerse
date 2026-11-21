/**
 * PART H — OBJECT-ORIENTED PROGRAMMING
 *
 * From blueprints to real things: classes, objects, constructors,
 * attributes, methods, encapsulation, inheritance, polymorphism,
 * and abstraction.
 *
 * Lesson order: classes as blueprints -> objects as real things ->
 * constructors and self -> attributes (instance vs class, the mutable
 * gotcha) -> methods and dunder methods -> encapsulation with properties
 * -> inheritance -> polymorphism and duck typing -> abstraction with ABCs
 * and composition.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with CPython 3.12 (verified by scripts/verify-course-outputs.ts).
 */
import type { Part } from "@/lib/course/types";

export const PART_H: Part = {
  letter: "H",
  title: "Object-Oriented Programming",
  tagline: "Modeling the world with classes and objects",
  description:
    "Classes, objects, constructors, attributes, methods, encapsulation, inheritance, polymorphism, and abstraction.",

  lessons: [
    // ------------------------------------------------------------- h-01
    {
      slug: "h-01",
      title: "Classes",
      minutes: 12,
      summary:
        "What a class really is (a blueprint you write once), how to define one with the class statement, and what belongs inside it: attributes and methods.",
      kind: "concept",
      objectives: [
        "Explain what a class is using the blueprint or cookie-cutter analogy",
        "Write a class with the class statement containing an attribute and a method",
        "Read a class diagram and point out its attributes and its methods",
        "Name classes following the CapWords convention",
      ],
      why: "You have spent seven parts telling Python what to do step by step: variables, loops, functions. That works beautifully until your program needs to represent many things of the same kind — a hundred customers, a thousand songs, ten thousand bank transactions, each with its own data and its own behavior. Copy-pasting a dictionary and five helper functions for every single customer does not scale and does not read. Classes are Python's answer: one place to describe what a customer IS and what it can DO, written once, from which you can stamp out as many real customers as your program needs.",
      blocks: [
        {
          kind: "text",
          text: "Every value you have met so far — `\"hello\"`, `42`, `[1, 2, 3]`, a dictionary, even a function — is an **object**: a real thing that exists in memory while your program runs, with its own data and its own abilities. Someone else defined what those things are. Strings know how to `.upper()` themselves because somebody, years ago, wrote a description of *what a string is* and *what a string can do*. This part of the course hands you that power: **you** will define your own kinds of things — a `BankAccount`, a `Movie`, a `Library` — and create as many real ones as you like. That description is called a **class**.",
        },
        {
          kind: "heading",
          text: "The cookie cutter analogy",
        },
        {
          kind: "text",
          text: "Think of a cookie cutter. It is shaped like a star, but it is not a cookie — you cannot eat it. Its job is to *stamp out* star cookies, and every cookie it stamps has the same shape — but each cookie is its own real thing: one gets sprinkles, one gets bitten, one goes stale in the tin. Changing one cookie never changes the cutter, and changing the cutter never re-shapes the cookies already baked. A **class** is exactly that: the cookie cutter — a *description* of what a kind of thing is and can do. The real, usable things stamped out from it are called **objects**, and they are the subject of the next lesson.",
        },
        {
          kind: "visual",
          title: "One cutter, many cookies",
          ascii: `   THE COOKIE CUTTER (the class)      THE COOKIES (the objects)

   +--------------------+          +------+  +------+  +------+
   |        Dog         |  stamps  | Rex  |  |Bella |  | Bit  |
   |  one description   | -------> |      |  |      |  |      |
   |  of every dog      |          |      |  |      |  |      |
   +--------------------+          +------+  +------+  +------+
   written ONCE in your code      created as many times as
   (the blueprint)                you need (each with its own
                                  name, its own age, its own life)`,
          caption:
            "Define the class once; stamp out objects forever. The class describes; the objects exist.",
        },
        {
          kind: "heading",
          text: "The class statement",
        },
        {
          kind: "text",
          text: "Python defines a class with the `class` keyword: the word `class`, a name you choose, a colon, and an indented body — exactly the shape you already know from `def`, `if`, and `for`. Inside the body live two kinds of things: **attributes** (the data — facts the thing remembers) and **methods** (the behavior — actions the thing knows how to perform).",
        },
        {
          kind: "code",
          title: "Anatomy of a class definition",
          lang: "text",
          code: `class Dog:                          <- the class statement: keyword + name + colon
    """A simple model of a dog."""    <- a docstring: what this class is for

    species = "Canis familiaris"      <- an ATTRIBUTE: data the class remembers

    def bark(self):                   <- a METHOD: a function inside the class
        return "Woof!"                   (self is explained in lesson h-03)`,
          outputNote:
            "Display-only anatomy map. Every part is explained below, piece by piece.",
        },
        {
          kind: "text",
          text: "Read that body slowly. `species` looks like an ordinary variable assignment — because it is one; it just lives inside the class. `bark` looks like an ordinary function definition — because it is one; it just lives inside the class. The word `self` in the parentheses is how a method refers to *the object it is working on*; hold that thought for two lessons, it gets a full explanation in h-03.",
        },
        {
          kind: "code",
          title: "A first class, defined and inspected",
          code: `class Dog:
    """A simple model of a dog."""

    species = "Canis familiaris"   # an attribute: a fact stored on the class

    def bark(self):                # a method: an action dogs know how to do
        return "Woof!"

print("The blueprint says every dog is:", Dog.species)
print("Is bark something callable?", callable(Dog.bark))
`,
          output: `The blueprint says every dog is: Canis familiaris
Is bark something callable? True`,
          outputNote: "Real output, produced by running this exact code with Python 3.12.",
          explain: [
            "The `class` statement creates a new name, `Dog`, and Python now knows it — printing `Dog.species` reads the attribute straight off the class.",
            "`callable()` returns True for anything you can call with parentheses. It confirms `bark` really is a function sitting inside the class.",
            "Notice what did NOT happen: no dog was created. Defining a class builds the blueprint only — stamping out real dogs comes next lesson.",
          ],
        },
        {
          kind: "code",
          title: "The class itself is a thing",
          code: `class Dog:
    species = "Canis familiaris"

    def bark(self):
        return "Woof!"

print("What kind of thing is Dog?", type(Dog))
print("Does Dog remember its species?", Dog.species)
print("Is bark still callable?", callable(Dog.bark))
`,
          output: `What kind of thing is Dog? <class 'type'>
Does Dog remember its species? Canis familiaris
Is bark still callable? True`,
          outputNote: "Real output. The class itself has a type: classes are objects in Python.",
          explain: [
            "`type(Dog)` prints `<class 'type'>` — a surprise worth pausing on: the class you just defined is itself an object in memory, a thing you can pass around like any other value.",
            "It remembers its own attributes (`Dog.species`) and holds its methods (`callable(Dog.bark)` is True) — the class is the container for everything the class defines.",
            "Classes being objects is a deep Python idea — it is why you can assign a class to a variable, put it in a list, or hand it to a function, exactly like a number or a string.",
          ],
        },
        {
          kind: "heading",
          text: "Naming classes: CapWords",
        },
        {
          kind: "text",
          text: "Python itself does not care how you capitalize names, but Python programmers absolutely do, and the whole ecosystem agrees: **class names use CapWords** (also called PascalCase) — each word starts with a capital letter, no underscores. Everything else you have written — variables, functions, methods — keeps the lowercase `snake_case` you already use. When you see `BankAccount` you instantly know it is a class; when you see `total_price` you instantly know it is a value. That signal is worth following the convention for.",
        },
        {
          kind: "table",
          title: "The naming conventions at a glance",
          headers: ["Kind of name", "Convention", "Examples"],
          rows: [
            ["Classes", "CapWords", "Dog, BankAccount, MediaLibrary"],
            ["Variables and attributes", "snake_case", "total_price, rex.name, energy"],
            ["Functions and methods", "snake_case", "describe(), area(), speak()"],
            ["Internal-use names", "leading underscore", "_balance, _count (lesson h-06)"],
            ["Dunder (magic) methods", "double underscores", "__init__, __repr__, __eq__"],
          ],
          caption:
            "CapWords for classes, snake_case for everything else: after a week of this, the convention reads itself.",
        },
        {
          kind: "visual",
          title: "A class diagram for Dog",
          ascii: `+-----------------------------+
|            Dog              |
+-----------------------------+
| species = "Canis familiaris"|     attributes
+-----------------------------+     (the data it remembers)
| bark()                      |     methods
+-----------------------------+     (the actions it can perform)`,
          caption:
            "The classic two-box diagram: the top box names the class, the middle lists data, the bottom lists behavior. You will draw these for every class you design.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "A class is not a dog yet",
          text: "After `class Dog:` runs, zero dogs exist — exactly like writing a recipe bakes zero cookies. The class only *describes*. To get a real, pettable, barkable dog you must stamp one out with `Dog()` — and that act, called instantiation, is exactly what the next lesson teaches.",
        },
        {
          kind: "tryIt",
          title: "Try it — write your second class",
          task: "Read the Cat class below, then extend it: add a class attribute `legs = 4` and print `Cat.legs`; add a method `purr()` that returns `\"purr...\"` and print `callable(Cat.purr)` to prove it is there.",
          code: `class Cat:
    species = "Felis catus"   # a class attribute

    def meow(self):           # a method
        return "Meow!"

print("The cat blueprint says:", Cat.species)
print("Is meow callable?", callable(Cat.meow))
`,
          hint: "Attributes and methods both live indented inside the class body. A method returning a string needs the word return — printing and returning are different things.",
        },
      ],
      terms: [
        { term: "Class", definition: "A blueprint that describes what a kind of thing is: the data it remembers and the actions it can perform." },
        { term: "Attribute", definition: "A named piece of data attached to a class or an object, like species or name." },
        { term: "Method", definition: "A function defined inside a class; the behavior objects of that class can perform." },
        { term: "CapWords", definition: "The naming convention for classes: each word capitalized with no underscores, like BankAccount or MediaLibrary." },
        { term: "Class body", definition: "The indented block after the class statement, where attributes and methods are defined." },
      ],
      mistakes: [
        {
          mistake: "Naming the class in lowercase: class dog: or class bank_account:",
          why: "Python accepts it, but every Python programmer reads lowercase names as values and functions, so your code becomes actively misleading to read.",
          fix: "Use CapWords for classes: class Dog:, class BankAccount:. Keep snake_case for variables, functions, and methods.",
        },
        {
          mistake: "Forgetting the colon after the class name, or not indenting the body.",
          why: "The class statement is a block header, exactly like if, for, and def — Python expects a colon and an indented body, and raises a SyntaxError without them.",
          fix: "Type the colon, press Enter, let your editor indent the next line, and keep the whole body at that same indentation level.",
        },
        {
          mistake: "Expecting the class definition to do something visible when the program runs.",
          why: "Defining a class only creates the blueprint — no objects are stamped out, no methods run. It is a silent act, like saving a recipe without cooking it.",
          fix: "Define the class, then deliberately create objects by calling it — `rex = Dog()` — which is the whole point of the next lesson.",
        },
      ],
      takeaways: [
        "A class is a blueprint written once; objects are the real things stamped out from it, as many as you need.",
        "The class statement is a block: keyword class, a CapWords name, a colon, and an indented body.",
        "Inside the body, attributes are data and methods are functions — assignments and defs you already know, just living inside a class.",
        "Defining a class creates no objects, exactly like a recipe page bakes no cookies.",
        "CapWords for classes, snake_case for everything else — the whole Python ecosystem reads names this way.",
      ],
      quiz: [
        {
          id: "h-01-q1",
          prompt: "In one sentence, what is a class?",
          options: [
            { text: "A blueprint that describes a kind of thing: its data and its behavior", correct: true, feedback: "Exactly — the class describes; the objects (next lesson) are the real things stamped out from it." },
            { text: "A real dog that exists in memory and can bark", correct: false, feedback: "That is the object. The class is the cookie cutter, never the cookie." },
            { text: "A function that returns many values at once", correct: false, feedback: "A class is far more than a function: it bundles data and behavior into a new kind of thing." },
          ],
          explanation: "Class = the description. Objects = the things. Write the description once, stamp out objects forever.",
        },
        {
          id: "h-01-q2",
          prompt: "What two kinds of things live inside a class body?",
          options: [
            { text: "Attributes (data) and methods (functions)", correct: true, feedback: "Right — assignments become attributes, and defs become methods." },
            { text: "Prints and inputs", correct: false, feedback: "Those are statements you might run elsewhere; they are not the two building blocks of a class." },
            { text: "Keywords and operators", correct: false, feedback: "Those are language machinery, not content you put inside a class body." },
          ],
          explanation: "Every class body is built from the same two ingredients: attributes to remember, methods to act.",
        },
        {
          id: "h-01-q3",
          prompt: "Following Python convention, how should you name a class for a bank account?",
          options: [
            { text: "class bank_account:", correct: false, feedback: "snake_case signals a variable or function — it will mislead every reader." },
            { text: "class BankAccount:", correct: true, feedback: "Correct — CapWords: each word capitalized, no underscores. Instantly readable as a class." },
            { text: "class BANKACCOUNT:", correct: false, feedback: "ALL_CAPS is the convention for constants, not classes." },
          ],
          explanation: "CapWords for classes, snake_case for values and functions — one convention, instantly understood everywhere.",
        },
      ],
    },

    // ------------------------------------------------------------- h-02
    {
      slug: "h-02",
      title: "Objects",
      minutes: 12,
      summary:
        "How a class becomes real: instantiation with Dog(), why every object carries its own attribute values, what type() reveals, and why objects are the most passable things in Python.",
      kind: "concept",
      objectives: [
        "Create objects from a class by calling the class like a function",
        "Explain why two objects made from one class do not share attribute values",
        "Use type() to reveal the class of any value, including built-ins",
        "Pass objects to functions, store them in lists, and treat them as ordinary values",
      ],
      why: "A blueprint that never becomes a building is a waste of paper, and a class that never produces objects is a waste of code. Objects are where object-oriented programming earns its name: they are the real, individual things your program manipulates — THIS dog named Rex, not dogs in general. In this lesson you will stamp out multiple dogs from one class and prove, with printed evidence, that each one carries its own data. You will also meet one of Python's deepest truths: every value you have ever used was an object all along.",
      blocks: [
        {
          kind: "text",
          text: "You know what a class is: a description. Now let's make it pay rent. **Instantiation** is the act of creating a real object from a class — and its syntax could not be more Pythonic: you call the class *like a function*, with parentheses.",
        },
        {
          kind: "heading",
          text: "Instantiation: call the class like a function",
        },
        {
          kind: "code",
          title: "Two dogs from one class",
          code: `class Dog:
    def bark(self):
        return "Woof!"

rex = Dog()        # object #1: the class stamps out a real dog
bella = Dog()      # object #2: a SECOND, separate dog

rex.name = "Rex"   # this attribute belongs to rex only
bella.name = "Bella"

print(rex.name)
print(bella.name)
print(type(rex))
print(type(bella))
print("Two names, one class:", type(rex) is type(bella))
`,
          output: `Rex
Bella
<class '__main__.Dog'>
<class '__main__.Dog'>
Two names, one class: True`,
          outputNote:
            "Real output. type() prints the class of the value; __main__ just means 'defined in this running script'.",
          explain: [
            "`Dog()` — the class name plus parentheses — manufactures a brand-new object and hands it back. Two calls, two objects.",
            "`rex.name = \"Rex\"` attaches an attribute to rex alone. Bella knows nothing about it; she gets her own.",
            "`type(rex)` prints `<class '__main__.Dog'>`: the object remembers which class stamped it out. `type(rex) is type(bella)` is True — same blueprint, different cookies.",
          ],
        },
        {
          kind: "heading",
          text: "One class, many objects, each with its own data",
        },
        {
          kind: "visual",
          title: "Two objects, one class",
          ascii: `                 the class Dog
                (the blueprint)

        rex = Dog()             bella = Dog()
      +----------------+      +----------------+
      | name: "Rex"    |      | name: "Bella"  |
      | (its own data) |      | (its own data) |
      +----------------+      +----------------+
        object #1               object #2
       Rex can get a bath    Bella can fall asleep
       without Bella noticing     without Rex caring

   SAME class, SAME bark() method -- but two separate
   bundles of data, two independent real things.`,
          caption:
            "Objects made from the same class share behavior (the methods) but never share their attribute values.",
        },
        {
          kind: "text",
          text: "This is the heart of the object idea: **each object is an independent bundle of data**. Rex gaining a name does not give Bella one. If your program tracks a shelter with 200 dogs, that is one class and 200 objects — not 200 copies of anything. The class is shared; the objects are not.",
        },
        {
          kind: "text",
          text: "Assigning attributes one by one (`rex.name = \"Rex\"`) works, but it gets tiring fast — and it is easy to forget one. There is a much better way to give every object its starting data, and it is called a constructor. That is the very next lesson; first, two insights you need.",
        },
        {
          kind: "heading",
          text: "type() tells you what anything really is",
        },
        {
          kind: "text",
          text: "You just saw `type(rex)` print `<class '...Dog'>`. Now the deep part: run `type()` on the values you have used since Part A. Every single one of them has a class.",
        },
        {
          kind: "code",
          title: "Everything is an object",
          lang: "repl",
          code: `>>> type(3)
<class 'int'>
>>> type("hi")
<class 'str'>
>>> type(len)
<class 'builtin_function_or_method'>
>>> type(type)
<class 'type'>`,
          outputNote:
            "Each >>> line is what you type; the line below is the answer. Even the number 3, even the function len, even type itself — every one of them is an object with a class.",
          explain: [
            "`3` is an object of the class `int` — integers carry methods around with them, which is why `(3).bit_length()` works.",
            "`\"hi\"` is an object of the class `str`; `len` is an object too, of a callable class.",
            "Yes, even `type` itself is an object — of the class `type`. Classes are things in Python, just like everything else.",
          ],
        },
        {
          kind: "text",
          text: "This is the famous **everything is an object** insight. Strings, lists, dictionaries, functions, your `Dog` objects — all of them are objects, all created from classes, all carrying their data and their behavior together. When you write your own classes, you are not visiting a strange foreign land. You are doing exactly what `str` and `list` have always done — defining a new kind of thing.",
        },
        {
          kind: "heading",
          text: "Objects are values: pass them around",
        },
        {
          kind: "text",
          text: "Because objects are ordinary values, everything you already know about values applies: you can store them in variables, put them in lists, tuck them into dictionaries, and hand them to functions. A function that receives an object can read its attributes and call its methods.",
        },
        {
          kind: "code",
          title: "A function that takes an object",
          code: `class Dog:
    def bark(self):
        return "Woof!"

def describe(dog):              # a plain function that takes an object
    return f"{dog.name} says {dog.bark()}"

rex = Dog()
rex.name = "Rex"

bella = Dog()
bella.name = "Bella"

print(describe(rex))
print(describe(bella))
`,
          output: `Rex says Woof!
Bella says Woof!`,
          outputNote:
            "Real output. One function, two objects — each call works on a different dog.",
          explain: [
            "`describe` receives the object and uses `dog.name` and `dog.bark()` — attribute access and method call, exactly as you saw above.",
            "The function was written before the second dog existed, and it did not care. It works on anything that has a `name` and a `bark()`.",
            "This tiny idea — code that works on any object with the right shape — grows into polymorphism in lesson h-08.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "You have been doing this for seven parts",
          text: "Appending to a list (`songs.append(\"Dune\")`) calls a method on an object. Calling `\"hi\".upper()` calls a method on a string object. The only new thing in this part is that the class being instantiated is one YOU wrote.",
        },
        {
          kind: "tryIt",
          title: "Try it — stamp out your own dogs",
          task: "Run the code as-is, then extend it: create a third dog, give it a name attribute of its own, and print all three names on one line. Check that the two original dogs are untouched.",
          code: `class Dog:
    def bark(self):
        return "Woof!"

a = Dog()
b = Dog()
a.name = "Rex"
b.name = "Bella"

print(a.name, "and", b.name)
print("the class of both:", type(a).__name__)
`,
          hint: "bit = Dog() makes a third object; bit.name = \"Bit\" gives it its own data. print(a.name, b.name, bit.name) shows all three.",
        },
      ],
      terms: [
        { term: "Object", definition: "A real thing created from a class: a bundle of data plus the behavior its class defines." },
        { term: "Instance", definition: "A synonym for object — as in 'rex is an instance of Dog'. The act of creating one is instantiation." },
        { term: "Instantiation", definition: "Creating a new object from a class by calling the class like a function: Dog()." },
        { term: "Instance attribute", definition: "An attribute attached to one specific object, like rex.name; other objects do not see it." },
        { term: "type()", definition: "The built-in that reveals the class of any value — because every value has one." },
      ],
      mistakes: [
        {
          mistake: "Forgetting the parentheses: rex = Dog instead of rex = Dog()",
          why: "Without parentheses, rex is the CLASS ITSELF, not a dog. Calling rex.name later reads an attribute of the class, and calling rex.bark() fails with a complaint about a missing argument (self).",
          fix: "Instantiate with parentheses: rex = Dog(). It looks like a function call because it is one — the class is the factory.",
        },
        {
          mistake: "Believing two objects made from one class share their attribute values.",
          why: "Objects from the same class share the blueprint (the methods), but each gets its own attribute values. Setting rex.name does nothing to bella.",
          fix: "Give every object its own data. And when the same starting data should always exist, use a constructor — the next lesson removes the chore entirely.",
        },
        {
          mistake: "Expecting print(rex) to show the object's data.",
          why: "print shows what the object's __repr__ method produces, and the default is unhelpful: something like <__main__.Dog object at 0x102f4a210> — a class name and a memory address.",
          fix: "Define a __repr__ method that returns a readable string. You will write your first one in the very next lesson.",
        },
      ],
      takeaways: [
        "Call a class like a function — Dog() — and it manufactures a new object. Two calls, two objects.",
        "Objects from the same class share behavior but never share attribute values: each is an independent bundle of data.",
        "type() shows the class of any value — and it works on 3, \"hi\", and len too: in Python, everything is an object.",
        "Objects are ordinary values: store them, list them, pass them to functions that read their attributes and call their methods.",
        "Writing your own classes makes you a peer of str and list — you define new kinds of things, Python does the rest.",
      ],
      quiz: [
        {
          id: "h-02-q1",
          prompt: "What does the statement rex = Dog() do?",
          options: [
            { text: "Creates a new object of the class Dog and binds the name rex to it", correct: true, feedback: "Correct — the class called like a function is a factory: it stamps out and returns a fresh object." },
            { text: "Renames the class Dog to rex", correct: false, feedback: "The class keeps its name; the object gets a new one. Nothing about the class changes." },
            { text: "Defines the class Dog for the first time", correct: false, feedback: "The class already exists — the statement class Dog: did that. This statement instantiates." },
          ],
          explanation: "Dog() = instantiate: one call, one brand-new object, fresh data, full access to the class's methods.",
        },
        {
          id: "h-02-q2",
          prompt: "You create rex and bella from the same Dog class, then set rex.name = \"Rex\". What does bella.name evaluate to?",
          options: [
            { text: "\"Rex\" — objects share their attributes", correct: false, feedback: "Shared would mean one bundle of data for all dogs; objects are independent." },
            { text: "An AttributeError — bella never got a name attribute", correct: true, feedback: "Exactly: attribute values live on each object. bella has none until you (or a constructor) give her one." },
            { text: "\"\" — attributes default to an empty string", correct: false, feedback: "Python creates no defaults silently; a missing attribute is simply missing, and reading it errors." },
          ],
          explanation: "Same class, same methods — but each object carries its own data. What you do to rex stays with rex.",
        },
        {
          id: "h-02-q3",
          prompt: "What does type(\"hi\") print?",
          options: [
            { text: "<class 'str'>", correct: true, feedback: "Right — strings are objects of the class str. Everything in Python has a class." },
            { text: "hi", correct: false, feedback: "type() does not return its argument; it returns the argument's class." },
            { text: "A SyntaxError, because type() only works on objects", correct: false, feedback: "It DOES work on objects — and \"hi\" is one. That is the whole insight." },
          ],
          explanation: "type(\"hi\") gives <class 'str'>: even a two-character string is a full object.",
        },
      ],
    },

    // ------------------------------------------------------------- h-03
    {
      slug: "h-03",
      title: "Constructors",
      minutes: 14,
      summary:
        "The __init__ method: how every object gets its starting data, what self really is (the object being built), default values in constructors, and __repr__ for objects that print readably.",
      kind: "concept",
      objectives: [
        "Write an __init__ method that initializes attributes on the new object",
        "Explain what self is: the object currently being built, passed in automatically",
        "Recognize the TypeError from forgetting self and fix it on sight",
        "Use default parameter values so some arguments become optional",
        "Write a __repr__ method so print(obj) shows readable data",
      ],
      why: "Last lesson ended with a chore: rex.name = \"Rex\", bella.name = \"Bella\" — one line of setup per attribute per object, by hand, every single time. Forget one line and the object is half-built, and the missing attribute explodes later as an AttributeError far from the real mistake. Constructors delete the chore: __init__ is a method Python calls FOR you, automatically, at the exact moment an object is born, so every object leaves the factory complete. Along the way you finally get the full, proper explanation of self — the single most confusing word in all of object-oriented Python.",
      blocks: [
        {
          kind: "text",
          text: "Here is the chore from last lesson, in full: for every dog you create, you type one assignment per attribute. Twenty dogs with three attributes each is sixty hand-typed lines, and forgetting just one leaves you with a half-built dog that crashes later. Programs should not work like that. The fix is a method Python calls **automatically, at the exact instant an object is created** — a constructor.",
        },
        {
          kind: "heading",
          text: "__init__: the method that builds the object",
        },
        {
          kind: "text",
          text: "The constructor is a method with a fixed, special name: `__init__` (two underscores, the word init, two underscores — Pythonistas say *dunder init*, for **d**ouble **under**score). Whatever you name the parameters, whatever you put in its body, Python runs `__init__` once for every new object, immediately after the object is created.",
        },
        {
          kind: "code",
          title: "A Dog with a constructor",
          code: `class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return "Woof!"

rex = Dog("Rex", 3)
bella = Dog("Bella", 5)

print(rex.name, "is", rex.age)
print(bella.name, "is", bella.age)
`,
          output: `Rex is 3
Bella is 5`,
          outputNote: "Real output. The arguments land in __init__, which stores them on the new object.",
          explain: [
            "`Dog(\"Rex\", 3)` creates a fresh object, then Python calls `__init__` with that object and your two arguments.",
            "`self.name = name` stores the argument on the object being built. Two calls, two objects, two names, two ages — no setup lines typed by hand.",
            "The list of attributes an object carries is now defined in ONE place, the class — read `__init__` and you know exactly what a Dog consists of.",
          ],
        },
        {
          kind: "heading",
          text: "__init__ runs automatically — proof",
        },
        {
          kind: "code",
          title: "Watch the constructor fire",
          code: `class Dog:
    def __init__(self, name):
        print(f"  __init__ is building a dog named {name}")
        self.name = name

print("Before: no dogs yet")
a = Dog("Rex")
b = Dog("Bella")
print("After: two dogs exist:", a.name, "and", b.name)
`,
          output: `Before: no dogs yet
  __init__ is building a dog named Rex
  __init__ is building a dog named Bella
After: two dogs exist: Rex and Bella`,
          outputNote: "Real output. You never called __init__ yourself — Python did, once per object.",
          explain: [
            "The prints prove the order: the constructor body runs in the middle of `Dog(\"Rex\")`, before the call even returns.",
            "The object gets its `name` stored during construction, so `a.name` is ready the instant `a` exists.",
            "A print inside `__init__` is a classic debugging trick: it shows you exactly when and how many times objects get created.",
          ],
        },
        {
          kind: "heading",
          text: "self, explained properly: the object being built",
        },
        {
          kind: "text",
          text: "`self` confuses every beginner, so let's be precise. When you write `rex.bark()`, Python cannot magically know which dog to bark — so it **passes rex itself into the method as the first argument**. Every method call on an object secretly delivers the object to the method. The parameter that receives it is named `self` by unbreakable convention. Inside `__init__`, `self` is *the object currently being built*; inside `bark`, it is *the dog that was asked to bark*. `self.name = name` means: *store this name on me, the object*.",
        },
        {
          kind: "visual",
          title: "The object whispering its own name",
          ascii: `   What you write...              What Python does behind the scenes...

        rex.speak()                        Dog.speak(rex)
             |                                  ^
             |                                  |
             |                                  |
      rex gets passed              the SAME object travels
      into the method              in as the first argument,
      automatically                before your own arguments

   The method receives it as 'self'. 'self' is not magic --
   it is just the object the call came from, delivered to you.`,
          caption:
            "object.method(...) is Dog.method(object, ...) in disguise. self is the disguised first argument: the object whispering its own name.",
        },
        {
          kind: "code",
          title: "Forgetting self: the classic crash",
          expectError: "TypeError: Dog.__init__() takes 0 positional arguments but 2 were given",
          code: `class Dog:
    def __init__():        # BUG: forgot something in the parentheses
        pass

Dog("Rex")
`,
          outputNote:
            "Deliberate crash. Read the error carefully — it is counting rex AND the argument you typed.",
          explain: [
            "The error says 2 arguments were given but 0 were expected. You only typed one, `\"Rex\"` — the second is the new object itself, delivered automatically.",
            "Because `__init__` accepts no parameters, the delivery has nowhere to go, and Python refuses loudly.",
            "The fix is the same for every method you will ever write: give the first parameter slot to `self`.",
          ],
        },
        {
          kind: "code",
          title: "self is not a keyword (but never do this)",
          code: `class Cat:
    def __init__(this, name):     # 'this' instead of 'self' -- works!
        this.name = name

    def __repr__(this):
        return f"Cat(name={this.name!r})"

print(Cat("Mia"))
`,
          output: `Cat(name='Mia')`,
          outputNote: "Real output. Python happily accepts 'this' as the first parameter name.",
          explain: [
            "The code runs and prints correctly — proof that `self` is a *convention*, not a keyword: Python only requires *a* first parameter, and only its position matters.",
            "But no Python team on Earth will accept this style: `self` is one of the strongest conventions in the language, and breaking it makes your code genuinely hard to read.",
            "Treat `self` as if it were a keyword. Every method, first parameter, named self. No exceptions.",
          ],
        },
        {
          kind: "heading",
          text: "Default values in the constructor",
        },
        {
          kind: "code",
          title: "Optional constructor arguments",
          code: `class Dog:
    def __init__(self, name, age=1, breed="mixed"):
        self.name = name
        self.age = age
        self.breed = breed

    def __repr__(self):
        return f"Dog(name={self.name!r}, age={self.age}, breed={self.breed!r})"

puppy = Dog("Bit")                    # age and breed fall back to defaults
adopted = Dog("Bella", 5, "beagle")   # all values supplied

print(puppy)
print(adopted)
`,
          output: `Dog(name='Bit', age=1, breed='mixed')
Dog(name='Bella', age=5, breed='beagle')`,
          outputNote: "Real output. Supply fewer arguments and the defaults fill the gaps.",
          explain: [
            "`__init__` is a method, so it gets everything methods get — including default parameter values, exactly like the functions you wrote in Part E. A parameter with a default becomes optional at call time.",
            "`Dog(\"Bit\")` supplies only the name; `age=1` and `breed=\"mixed\"` come from the defaults, so the puppy is still fully built.",
            "Order still matters: positional arguments fill parameters left to right — you cannot skip age and give breed.",
            "Sensible defaults mean callers type less AND every object is guaranteed complete: the best of both worlds.",
          ],
        },
        {
          kind: "heading",
          text: "__repr__: objects that print readably",
        },
        {
          kind: "code",
          title: "A readable __repr__",
          code: `class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Dog(name={self.name!r}, age={self.age})"

rex = Dog("Rex", 3)
print(rex)
print("Good news:", rex, "is available for adoption")
`,
          output: `Dog(name='Rex', age=3)
Good news: Dog(name='Rex', age=3) is available for adoption`,
          outputNote: "Real output. Everywhere the object is printed, your __repr__ string appears.",
          explain: [
            "Without `__repr__`, `print(rex)` would show something like `<__main__.Dog object at 0x1026f4a10>` — a class name plus a memory address. Useless to humans. Defining `__repr__` replaces that with your string.",
            "`print(rex)` calls your `__repr__` and shows exactly the data you chose — class name and attributes.",
            "The `!r` inside the f-string makes the name print with quotes around it (`'Rex'`), which reads clearly and copies back into code.",
            "There is also a sibling dunder, `__str__`; when only one is defined, printing uses `__repr__` — so defining `__repr__` covers you everywhere, and it is the one to write.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — build a dog factory",
          task: "Run the code, then: (1) create a puppy using the DEFAULT age and print it; (2) add a `breed` parameter with default `\"mixed\"`, use it in `__repr__`, and create a dog with breed `\"beagle\"`.",
          code: `class Dog:
    def __init__(self, name, age=1):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Dog(name={self.name!r}, age={self.age})"

rex = Dog("Rex", 3)
print(rex)
`,
          hint: "A default lives in the parameter list: def __init__(self, name, age=1, breed=\"mixed\"). In __repr__, add breed={self.breed!r}.",
        },
      ],
      terms: [
        { term: "Constructor", definition: "The method Python calls automatically when an object is created; in Python it is always named __init__." },
        { term: "__init__", definition: "The dunder method that initializes a new object: it receives the object as self plus the constructor arguments." },
        { term: "self", definition: "The conventional name for the first parameter of every method: the object the call is happening to — during construction, the object being built." },
        { term: "Dunder method", definition: "A 'double underscore' method like __init__ or __repr__ that Python calls automatically at defined moments." },
        { term: "__repr__", definition: "The dunder method whose return value is displayed when the object is printed or interpolated into a string." },
      ],
      mistakes: [
        {
          mistake: "Forgetting self as the first parameter of a method.",
          why: "Python passes the object automatically as the first argument of every method call, so a method without a self slot raises TypeError the moment it is used — usually at construction time.",
          fix: "Every method's parameter list starts with self: def __init__(self, ...), def bark(self). Muscle-memory it now; it never changes.",
        },
        {
          mistake: "Writing __init__ but forgetting to store a parameter on the object.",
          why: "def __init__(self, name): without self.name = name receives the value and drops it on the floor — the object is created, but reading .name later raises AttributeError.",
          fix: "Every constructor parameter you want the object to keep needs a matching self.name = name line in the body.",
        },
        {
          mistake: "Calling __init__ manually: rex.__init__(\"Rex\", 3).",
          why: "It technically runs, but it is rebuilding an existing object instead of constructing a new one — confusing, and a sign the call site should be Dog(\"Rex\", 3).",
          fix: "Construct by calling the class: rex = Dog(\"Rex\", 3). Let Python do the __init__ calling.",
        },
        {
          mistake: "Naming __init__ with single underscores (_init_) or mixing them up (_init__).",
          why: "The special automatic behavior only attaches to the exact double-underscore spelling; a typo means your method is an ordinary method that never runs.",
          fix: "Two underscores each side: __init__. Let your editor's autocompletion type it if your fingers disagree.",
        },
      ],
      takeaways: [
        "__init__ is the constructor: Python calls it automatically, once, for every new object — you never call it yourself.",
        "self is the object the call is happening to: during construction, the object being built. A method's first parameter receives it, always.",
        "self is a convention, not a keyword — but breaking the convention costs you readability, so never do.",
        "Default parameter values make constructor arguments optional, so every object still comes out complete.",
        "Define __repr__ and print(obj) shows your data instead of a memory address.",
      ],
      quiz: [
        {
          id: "h-03-q1",
          prompt: "Inside __init__, what exactly is self?",
          options: [
            { text: "The object currently being built — the one this call of __init__ is initializing", correct: true, feedback: "Precisely. self.name = name means 'store this name on me, the new object'." },
            { text: "The class Dog itself, shared by all dogs", correct: false, feedback: "That is Dog, not self — and class attributes are lesson h-04. self is always one specific object." },
            { text: "A reserved Python keyword, like def or return", correct: false, feedback: "It is only a convention — a parameter name every Python programmer uses, but not a keyword." },
          ],
          explanation: "self = the object the call is happening to. In a constructor, that is the fresh object being built.",
        },
        {
          id: "h-03-q2",
          prompt: "When does __init__ run?",
          options: [
            { text: "Automatically, once per object, at the moment the class is called like Dog(\"Rex\", 3)", correct: true, feedback: "Exactly — the call creates the object, runs __init__ on it, then hands it back." },
            { text: "Only when you call it yourself: rex.__init__()", correct: false, feedback: "You can force it, but you never should — the whole point is that Python calls it for you at creation time." },
            { text: "Every time you access an attribute like rex.name", correct: false, feedback: "Attribute access just reads stored data; __init__ already ran when the object was born." },
          ],
          explanation: "One call to Dog(...), one automatic run of __init__, one complete object.",
        },
        {
          id: "h-03-q3",
          prompt: "Dog(\"Bit\") succeeds with __init__(self, name, age=1, breed=\"mixed\"). What are age and breed in the new object?",
          options: [
            { text: "Missing — they will raise AttributeError when read", correct: false, feedback: "Default values guarantee the parameters always arrive; the object is fully built." },
            { text: "1 and \"mixed\" — the defaults you defined", correct: true, feedback: "Correct — defaults fill the gaps, so every object leaves the constructor complete." },
            { text: "0 and \"\" — Python's automatic defaults", correct: false, feedback: "Python creates no silent defaults; the values come from YOUR default expressions or not at all." },
          ],
          explanation: "Constructor defaults make arguments optional without ever leaving attributes unset.",
        },
      ],
    },

    // ------------------------------------------------------------- h-04
    {
      slug: "h-04",
      title: "Attributes",
      minutes: 15,
      summary:
        "Class attributes versus instance attributes, the legendary mutable-class-attribute trap demonstrated with proof, attributes added after creation, and the lookup order that decides what you get.",
      kind: "concept",
      objectives: [
        "Distinguish a class attribute (one copy, shared) from an instance attribute (one per object)",
        "Demonstrate and then fix the mutable class attribute trap",
        "Add attributes to an object after creation, and predict when other objects can see them",
        "Explain the attribute lookup order: instance first, then class",
        "Choose the right home for shared data: constants and counters",
      ],
      why: "By now you can build objects with constructors, but a question is lurking: attributes seem to live in two different places. You have written species = ... directly in the class body AND self.name = ... inside __init__ — and the difference matters enormously. Get it wrong in one specific way — a mutable class attribute like a shared list — and you will create objects that mysteriously see each other's data, one of the most legendary beginner traps in all of Python. This lesson shows you the trap, springs it on purpose with printed proof, and teaches you the two-second check that keeps you out of it forever.",
      blocks: [
        {
          kind: "text",
          text: "There are two places an attribute can live, and you have already used both. An attribute written directly in the class body (`species = ...`) is a **class attribute**: there is exactly one copy, and it belongs to the class itself. An attribute attached to `self` inside a method (`self.name = ...`) is an **instance attribute**: each object carries its own. Same dot-syntax to read them — but very different storage.",
        },
        {
          kind: "heading",
          text: "Class attributes: one copy for all",
        },
        {
          kind: "code",
          title: "Shared facts versus personal facts",
          code: `class Dog:
    species = "Canis familiaris"   # CLASS attribute: one copy for all dogs

    def __init__(self, name):
        self.name = name           # INSTANCE attribute: one per dog

rex = Dog("Rex")
bella = Dog("Bella")

print("shared:", Dog.species)
print("per-dog:", rex.name, "and", bella.name)
print("rex sees the shared fact too:", rex.species)
print("same species object?", rex.species is bella.species)
`,
          output: `shared: Canis familiaris
per-dog: Rex and Bella
rex sees the shared fact too: Canis familiaris
same species object? True`,
          outputNote: "Real output. The class attribute is readable through the class or through any object.",
          explain: [
            "`Dog.species` reads the single shared copy directly off the class — no dog needed.",
            "`rex.name` and `bella.name` read two different instance attributes: one per object, set in `__init__`. The storage map: `species` lives once on the class; `name` lives once per dog, in each object's own pocket.",
            "`rex.species` works too: if an attribute is not found on the object, Python looks it up on the class — that is the lookup rule you will meet at the end of this lesson.",
            "`is` proves it is literally the same string object — not two equal copies, one shared fact.",
          ],
        },
        {
          kind: "heading",
          text: "When class attributes shine: constants and counters",
        },
        {
          kind: "code",
          title: "A counter of all instances",
          code: `class Dog:
    count = 0   # CLASS attribute: shared -- a running total of dogs

    def __init__(self, name):
        self.name = name
        Dog.count += 1   # update the CLASS's counter

print("dogs before:", Dog.count)
rex = Dog("Rex")
bella = Dog("Bella")
bit = Dog("Bit")
print("dogs after:", Dog.count)
print("each dog sees the same total:", rex.count, bella.count, bit.count)
`,
          output: `dogs before: 0
dogs after: 3
each dog sees the same total: 3 3 3`,
          outputNote: "Real output. One shared counter, updated by every constructor.",
          explain: [
            "Class attributes are perfect for two jobs: **constants** (facts genuinely true of every instance — every dog is *Canis familiaris*) and **counters** (totals shared across all objects — how many dogs exist).",
            "`Dog.count += 1` deliberately updates the CLASS attribute — spelled `Dog.count`, not `self.count` — so the total grows no matter which dog is being built.",
            "Every dog sees the same 3 through `rex.count` (instance lookup falls through to the class).",
            "This pattern — a class attribute incremented in `__init__` — is the standard way to count instances, and you will build one yourself in the exercises.",
          ],
        },
        {
          kind: "heading",
          text: "The legendary trap: mutable class attributes",
        },
        {
          kind: "text",
          text: "Now the trap — memorize this one, because it bites every Python learner exactly once. Our counter worked because integers are replaced, not mutated: `Dog.count += 1` makes a new number and re-points the class attribute. But what happens when the class attribute is **mutable** — a list that grows in place? Watch two toy boxes share one invisible pile.",
        },
        {
          kind: "code",
          title: "The trap, sprung on purpose",
          code: `class ToyBox:
    toys = []   # BUG: a MUTABLE class attribute -- ONE list shared by ALL boxes

    def add(self, toy):
        self.toys.append(toy)   # appends to that one shared list

red = ToyBox()
blue = ToyBox()

red.add("ball")
blue.add("rope")

print("red box toys:", red.toys)
print("blue box toys:", blue.toys)
print("same list object?", red.toys is blue.toys)
`,
          output: `red box toys: ['ball', 'rope']
blue box toys: ['ball', 'rope']
same list object? True`,
          outputNote: "Real output. Two boxes, printed proof of one shared list.",
          explain: [
            "You put a ball in the RED box and a rope in the BLUE box — yet both boxes print BOTH toys.",
            "The `is` check is the smoking gun: `red.toys` and `blue.toys` are literally the same list object, because `toys = []` created ONE list on the class, and `.append()` grew it in place.",
            "`self.toys.append(...)` never created anything on the instance: it found the class attribute through lookup and mutated the shared list.",
          ],
        },
        {
          kind: "code",
          title: "The fix: per-object lists in __init__",
          code: `class ToyBox:
    def __init__(self):
        self.toys = []   # INSTANCE attribute: one private list per box

    def add(self, toy):
        self.toys.append(toy)

red = ToyBox()
blue = ToyBox()

red.add("ball")
blue.add("rope")

print("red box toys:", red.toys)
print("blue box toys:", blue.toys)
print("same list object?", red.toys is blue.toys)
`,
          output: `red box toys: ['ball']
blue box toys: ['rope']
same list object? False`,
          outputNote: "Real output. Same usage code, completely different (and correct) behavior.",
          explain: [
            "Moving the list into `__init__` gives every new box its own fresh `[]` — `red.toys` and `blue.toys` are now two different lists.",
            "The usage code (`red.add(...)`, `blue.add(...)`, printing) is IDENTICAL to the broken version — the fix is entirely in where the list is created.",
            "This is the rule that saves you forever: **anything each object needs its own copy of belongs in `__init__`, attached to self** — especially lists and dictionaries.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The two-second check",
          text: "Scan your class body for mutable class attributes — `= []`, `= {}`, `= set()` written directly in the class. If each object is supposed to have its own, move it into `__init__`. Class attributes should hold shared immutables: strings, numbers, tuples, constants.",
        },
        {
          kind: "heading",
          text: "Adding attributes after creation",
        },
        {
          kind: "code",
          title: "Late attributes are per-object",
          expectError: "AttributeError: 'Dog' object has no attribute 'mood'",
          code: `class Dog:
    def __init__(self, name):
        self.name = name

rex = Dog("Rex")
rex.mood = "happy"   # brand-new attribute -- attached to rex ONLY
print(rex.name, "is", rex.mood)

bella = Dog("Bella")
print(bella.mood)    # bella never got a mood
`,
          outputNote: "Deliberate crash at the last line — after proving that rex really owns his mood.",
          explain: [
            "Python is famously flexible: you can bolt a brand-new attribute onto an object at any time, outside the class entirely. Line 7 prints happily — rex now has a `mood` that no Dog constructor ever declared.",
            "Then `bella.mood` raises AttributeError: the attribute lives on rex's object only.",
            "Late attributes are a real Python feature — handy for quick experiments — but real programs keep the attribute list in `__init__`, so the class definition is the single source of truth about what an object consists of.",
          ],
        },
        {
          kind: "heading",
          text: "Lookup order: instance first, then class",
        },
        {
          kind: "code",
          title: "Shadowing a class attribute",
          code: `class Dog:
    species = "Canis familiaris"

    def __init__(self, name):
        self.name = name

rex = Dog("Rex")
print(rex.species)         # not on the instance -> found on the class

rex.species = "very good"  # creates an INSTANCE attribute that shadows it
print(rex.species)         # instance wins the lookup
print(Dog.species)         # the class attribute is untouched

bella = Dog("Bella")
print(bella.species)       # other dogs still see the class attribute
`,
          output: `Canis familiaris
very good
Canis familiaris
Canis familiaris`,
          outputNote: "Real output. Assignment always writes to the instance; reading checks the instance first.",
          explain: [
            "Reading `rex.species`: Python checks rex's own storage first, doesn't find it, then checks the class — and uses the class copy.",
            "`rex.species = \"very good\"` (an assignment) creates an instance attribute on rex that *shadows* the class attribute for rex alone.",
            "The class attribute is untouched, and bella still reads it: one dog's shadow never darkens another dog's sky.",
            "The full rule: **assignment always writes to the instance; reads check the instance, then the class, then raise AttributeError.**",
          ],
        },
        {
          kind: "table",
          title: "Class attribute or instance attribute?",
          headers: ["Question", "Class attribute", "Instance attribute"],
          rows: [
            ["How many copies exist?", "One, shared by all objects", "One per object"],
            ["Where is it written?", "In the class body", "On self, usually in __init__"],
            ["Good for", "Constants, shared facts, counters", "Everything that describes THIS object"],
            ["Safe values", "Immutables (str, int, float, tuple)", "Anything, including lists and dicts"],
            ["Trap to remember", "Mutable values get shared and mutated", "None — this is the default choice"],
          ],
          caption:
            "Default to instance attributes in __init__. Reach for a class attribute only when one shared copy is exactly the point.",
        },
        {
          kind: "tryIt",
          title: "Try it — predict the trap, then fix it",
          task: "BEFORE running: write down on paper what the two print lines will show. Then run and check yourself. Finally, fix the class by moving `scores` into `__init__` and run again — the two players should each see only their own scores.",
          code: `class Player:
    scores = []   # a class attribute... holding a list... what happens?

    def add_score(self, points):
        self.scores.append(points)

ana = Player()
bob = Player()

ana.add_score(10)
bob.add_score(20)

print("ana:", ana.scores)
print("bob:", bob.scores)
print("same list?", ana.scores is bob.scores)
`,
          hint: "Prediction first! Then the fix: def __init__(self): with self.scores = [] inside — and add_score stays exactly the same.",
        },
      ],
      terms: [
        { term: "Class attribute", definition: "An attribute defined in the class body; one shared copy that every instance can read." },
        { term: "Instance attribute", definition: "An attribute attached to a specific object via self; each object owns its own value." },
        { term: "Mutable class attribute trap", definition: "A list or dict on the class that all objects mutate together, making them mysteriously share state." },
        { term: "Shadowing", definition: "An instance attribute with the same name as a class attribute hides it for that object, because instance lookup comes first." },
        { term: "Lookup order", definition: "The rule for reading obj.name: check the instance first, then the class, then raise AttributeError." },
      ],
      mistakes: [
        {
          mistake: "Putting a list or dict in the class body: class Team: members = []",
          why: "Every object finds and mutates the SAME list through attribute lookup — all teams mysteriously share all members. It is the single most common OOP bug beginners write.",
          fix: "Per-object data belongs in the constructor: def __init__(self): self.members = []. The class body holds only shared immutables.",
        },
        {
          mistake: "Trying to shadow a class attribute with self.count += 1 and expecting the class total to change.",
          why: "self.count += 1 reads the class value, adds one, and writes the result as an INSTANCE attribute — the class counter stays frozen at its old value.",
          fix: "Update the class deliberately, with the class name: Dog.count += 1. Spell out what you mean to change.",
        },
        {
          mistake: "Expecting an attribute added to one object to appear on its siblings.",
          why: "Late attributes attach to the single object you assigned them on; other objects of the same class never see them, and reading raises AttributeError.",
          fix: "Declare attributes in __init__ so every object gets them from birth. Reserve late attributes for throwaway experiments.",
        },
        {
          mistake: "Reading Dog.name instead of rex.name when you want one dog's name.",
          why: "name is an instance attribute — it exists per object, not on the class — so Dog.name raises AttributeError: type object 'Dog' has no attribute 'name'.",
          fix: "Instance data is read through an object: rex.name. The Dog name is only for class attributes like Dog.species.",
        },
      ],
      takeaways: [
        "Class attribute: one shared copy, written in the class body. Instance attribute: one copy per object, attached to self in __init__.",
        "Never put a mutable default (list, dict, set) in the class body — all objects will share and mutate it together. Spring the trap once on purpose; never again by accident.",
        "Counters and constants are the two great jobs for class attributes: Dog.count += 1 in __init__ counts every instance.",
        "Reading obj.name checks the instance first, then the class. Assigning obj.name always writes to the instance.",
        "Keep the attribute list in __init__: the class definition should be the single source of truth for what an object consists of.",
      ],
      quiz: [
        {
          id: "h-04-q1",
          prompt: "What is the fatal flaw in class Team: members = []?",
          options: [
            { text: "Nothing — lists in the class body are fine and per-object", correct: false, feedback: "They are fine only if sharing is intended. As per-object storage they are a bug factory." },
            { text: "Every Team object appends to the SAME shared list, so all teams see all members", correct: true, feedback: "Exactly — the list is created once on the class, and lookup lets every object mutate it." },
            { text: "The class raises a SyntaxError when the second Team is created", correct: false, feedback: "It runs cleanly — which is what makes the bug so sneaky. The wrongness only shows in the data." },
          ],
          explanation: "Mutable class attribute = one shared pile. Per-object lists belong in __init__.",
        },
        {
          id: "h-04-q2",
          prompt: "Dog has species = \"canine\" as a class attribute. You run rex.species = \"good boy\". What does Dog.species evaluate to now?",
          options: [
            { text: "\"good boy\" — the assignment changed the class", correct: false, feedback: "Assignment through an object writes to the INSTANCE, never the class." },
            { text: "\"canine\" — the class attribute is untouched; only rex now has his own shadowing copy", correct: true, feedback: "Correct — rex gets an instance attribute that shadows the class one; the class and every other dog are unaffected." },
            { text: "An AttributeError — you cannot assign to an attribute through an object", correct: false, feedback: "You absolutely can: obj.attr = value creates an instance attribute on that object." },
          ],
          explanation: "Writes go to the instance; reads prefer the instance. Shadowing affects exactly one object.",
        },
        {
          id: "h-04-q3",
          prompt: "You want to count every instance ever created of class Robot. What is the standard pattern?",
          options: [
            { text: "A class attribute count = 0, incremented as Robot.count += 1 inside __init__", correct: true, feedback: "Exactly — one shared counter, deliberately updated through the class name, grown by every constructor call." },
            { text: "An instance attribute self.count = 0 in __init__, then self.count += 1", correct: false, feedback: "Each robot would count itself as 1; the shared total never accumulates." },
            { text: "A global variable robot_count outside the class", correct: false, feedback: "It works mechanically but scatters the class's data away from the class — the class attribute IS the shared drawer for this." },
          ],
          explanation: "Shared totals live on the class: count = 0 in the body, Robot.count += 1 in the constructor.",
        },
      ],
    },

    // ------------------------------------------------------------- h-05
    {
      slug: "h-05",
      title: "Methods",
      minutes: 14,
      summary:
        "Methods up close: functions that receive the object, reading and writing attributes, methods calling other methods through self, and the dunder tour: __repr__, __len__, __eq__.",
      kind: "concept",
      objectives: [
        "Call methods with object.method() and explain what self receives",
        "Write methods that read, modify, and return attribute values",
        "Call one method from another using self.method_name()",
        "Write methods that take parameters and return values",
        "Implement the dunder methods __repr__, __len__, and __eq__ on a small class",
      ],
      why: "Attributes alone make a class a glorified dictionary. Methods are what make objects DO things: a BankAccount that cannot deposit is just a number with a name tag. In this lesson, methods stop being decoration defined in h-01 and become your main tool: you will write methods that read and modify the object's own data, methods that call other methods (with self doing the introductions), and the famous dunder methods that let your objects plug into Python itself — printing readably, working with len(), and comparing with ==. After this lesson, your classes stop being data bags and start being machines.",
      blocks: [
        {
          kind: "text",
          text: "A **method** is a function defined inside a class — and you have been calling them since Part A: `\"hi\".upper()` is a method call on a string object, `songs.append(\"Dune\")` is a method call on a list object. The only difference now is that the class is yours. Every method call delivers the object as the first argument — that is the `self` you met in h-03 — and everything in this lesson builds on that one delivery.",
        },
        {
          kind: "heading",
          text: "A method is a function whose first parameter is the object",
        },
        {
          kind: "code",
          title: "The same call, spelled two ways",
          code: `class Dog:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name}: Woof!"

rex = Dog("Rex")

print(rex.speak())        # the normal way: object.method()
print(Dog.speak(rex))     # the same call, spelled out: function + the object
print("Dog.speak is a:", type(Dog.speak).__name__)
`,
          output: `Rex: Woof!
Rex: Woof!
Dog.speak is a: function`,
          outputNote: "Real output. Two spellings, one mechanism — and Dog.speak really is a plain function.",
          explain: [
            "`rex.speak()` and `Dog.speak(rex)` do exactly the same thing — the dot-notation is just the friendly spelling.",
            "`type(Dog.speak).__name__` proves methods ARE functions: accessed through the class, `speak` is a function object.",
            "This is why `self` exists: a method is a function that always receives the object first, so it has a name to refer to the object by.",
          ],
        },
        {
          kind: "heading",
          text: "Reading and writing attributes",
        },
        {
          kind: "code",
          title: "A method that modifies and returns",
          code: `class Counter:
    def __init__(self, start=0):
        self.value = start

    def increment(self, step=1):    # a method with a parameter and a return
        self.value += step          # reads AND writes self.value
        return self.value

c = Counter()
print("start:", c.value)
print("increment:", c.increment())
print("increment by 5:", c.increment(5))
print("final:", c.value)
`,
          output: `start: 0
increment: 1
increment by 5: 6
final: 6`,
          outputNote: "Real output. Each call mutates the object AND hands back the fresh value.",
          explain: [
            "`self.value += step` reads the object's own `value`, adds `step`, and writes it back — the object remembers between calls.",
            "`step=1` makes the argument optional, exactly like any function default.",
            "Returning the new value lets callers use the result immediately — methods can both *do* and *report*.",
          ],
        },
        {
          kind: "heading",
          text: "Methods calling other methods",
        },
        {
          kind: "code",
          title: "A game loop inside one object",
          code: `class Dog:
    def __init__(self, name, energy=10):
        self.name = name
        self.energy = energy

    def bark(self):                  # a little helper method
        return "Woof!"

    def play(self):                  # a method that CALLS another method
        if self.energy < 3:
            return f"{self.name} is too tired to play"
        self.energy -= 3
        return f"{self.name} plays! ({self.bark()}) energy: {self.energy}"

rex = Dog("Rex")
print(rex.play())
print(rex.play())
print(rex.play())
print(rex.play())
`,
          output: `Rex plays! (Woof!) energy: 7
Rex plays! (Woof!) energy: 4
Rex plays! (Woof!) energy: 1
Rex is too tired to play`,
          outputNote: "Real output. The object keeps its state between calls — and play() uses bark() internally.",
          explain: [
            "`self.bark()` inside `play` calls another method *on the same object* — self does the introducing.",
            "The energy drains 3 points per play, and the object remembers it across calls: 10, 7, 4, 1, then too tired.",
            "The fourth call proves the method protects its own rules: no playing below 3 energy. State plus rules is what makes an object feel alive.",
          ],
        },
        {
          kind: "text",
          text: "Notice the shape of good method code: short methods that each do one job, with bigger behavior built by calling the small ones through `self`. `play` never re-implements barking — it delegates. You already know this instinct from Part E, where small functions called other small functions; the only new letter is the word `self`.",
        },
        {
          kind: "heading",
          text: "The dunder tour: __repr__, __len__, __eq__",
        },
        {
          kind: "text",
          text: "Dunder methods are Python's sockets: plug into one, and a built-in operation starts working on your objects. `__repr__` you know from h-03 — it controls what printing shows. `__len__` is what `len()` calls. `__eq__` is what `==` calls. Define them and your class speaks fluent Python.",
        },
        {
          kind: "code",
          title: "A Song class wearing three dunders",
          code: `class Song:
    def __init__(self, title, seconds):
        self.title = title
        self.seconds = seconds

    def __repr__(self):          # what print(song) shows
        return f"Song({self.title!r}, {self.seconds}s)"

    def __len__(self):           # what len(song) returns
        return self.seconds

    def __eq__(self, other):     # what song == other_song checks
        return self.title == other.title and self.seconds == other.seconds

a = Song("Little Star", 180)
b = Song("Little Star", 180)
c = Song("Big Star", 200)

print(a)
print("length of song a:", len(a))
print("a == b:", a == b)
print("a == c:", a == c)
`,
          output: `Song('Little Star', 180s)
length of song a: 180
a == b: True
a == c: False`,
          outputNote: "Real output. print, len, and == all route through the dunder methods you define.",
          explain: [
            "`print(a)` calls `__repr__` — the same one-liner you wrote for Dog, now earning its keep.",
            "`len(a)` calls `__len__` and returns whatever you choose: here, the song's duration in seconds.",
            "`a == b` calls `__eq__` — WITHOUT it, two separately-created-but-identical songs would compare False, because the default `==` asks 'same object?' not 'same data?'. With it, equality means what YOU say it means.",
          ],
        },
        {
          kind: "table",
          title: "The dunder methods you now know",
          headers: ["Dunder", "Triggered by", "Should return"],
          rows: [
            ["__init__", "ClassName(...) — construction", "Nothing (it fills in self)"],
            ["__repr__", "print(obj), f-strings, the REPL", "A readable string describing the object"],
            ["__len__", "len(obj)", "The object's length as an int"],
            ["__eq__", "obj == other", "True or False — your definition of 'equal'"],
          ],
          caption:
            "Python calls these for you at exact moments. You never call a dunder by name — you trigger it by using the operation.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Never call dunders by name",
          text: "Write `len(song)`, not `song.__len__()`. Write `a == b`, not `a.__eq__(b)`. The whole point of dunder methods is that ordinary Python syntax triggers them — calling them directly is like opening a door by unscrewing the hinges.",
        },
        {
          kind: "tryIt",
          title: "Try it — give a class equality",
          task: "Run the code and see that `a == b` is False — two separate objects, no `__eq__` defined. Then add an `__eq__` method that compares `title` and `seconds`, and run again: `a == b` should become True.",
          code: `class Song:
    def __init__(self, title, seconds):
        self.title = title
        self.seconds = seconds

    def __repr__(self):
        return f"Song({self.title!r}, {self.seconds}s)"

a = Song("Little Star", 180)
b = Song("Little Star", 180)

print(a)
print("a == b:", a == b)   # no __eq__ yet: two separate objects
`,
          hint: "def __eq__(self, other): with a body like return self.title == other.title and self.seconds == other.seconds. The second song arrives as the parameter other.",
        },
      ],
      terms: [
        { term: "Method", definition: "A function defined in a class; calling object.method() delivers the object as the first argument." },
        { term: "self.method_name()", definition: "How a method calls another method on the same object, using self to make the introduction." },
        { term: "__len__", definition: "The dunder method len() calls; define it and len(obj) returns what you choose." },
        { term: "__eq__", definition: "The dunder method == calls; define it and equality compares data your way, not object identity." },
      ],
      mistakes: [
        {
          mistake: "Writing a method that forgets to use self (accessing bare names like value instead of self.value).",
          why: "Inside a class body, a bare name is looked up among local variables and the class namespace — not the object's attributes. Without self, you read the wrong thing or get a NameError.",
          fix: "Every attribute of the object is written through self: self.value, self.name, self.energy. Inside a method, the object is never implicit.",
        },
        {
          mistake: "Calling self.bark instead of self.bark().",
          why: "Without parentheses you refer to the method object itself without running it — the call silently does nothing, and things like f-strings print <bound method ...> instead of the result.",
          fix: "Methods are called with parentheses, exactly like functions: self.bark(). If you want the result, run it; if you want the method itself, that is almost never what you want.",
        },
        {
          mistake: "Forgetting to return from a method and expecting its result anyway.",
          why: "A method without a return statement returns None, so print(obj.describe()) shows None where you expected the description.",
          fix: "Decide per method: mutators like deposit can return the new state (or nothing), but anything whose result you intend to use needs an explicit return.",
        },
        {
          mistake: "Expecting a == b to be True for two objects with identical data.",
          why: "The default __eq__ asks 'are these the SAME object in memory?' — and a and b are two objects, even with equal data.",
          fix: "Define __eq__ and spell out what equal means for your class: usually comparing the attributes that matter.",
        },
      ],
      takeaways: [
        "A method is a function whose first parameter receives the object: rex.speak() is Dog.speak(rex) in disguise.",
        "Methods read and write the object's own attributes through self — that is how an object keeps and updates its state between calls.",
        "Methods call other methods with self.method_name(): small jobs, delegated, composed.",
        "Dunder methods plug your class into Python: __repr__ for printing, __len__ for len(), __eq__ for ==.",
        "Trigger dunders by using the ordinary operation (len(x), x == y), never by calling them by name.",
      ],
      quiz: [
        {
          id: "h-05-q1",
          prompt: "You write play() and it needs to use the object's own bark() method. How is bark called inside play?",
          options: [
            { text: "bark()", correct: false, feedback: "A bare call looks for a local or global function named bark — the method is not one of those." },
            { text: "self.bark()", correct: true, feedback: "Correct — self introduces the object to its own method." },
            { text: "Dog.bark()", correct: false, feedback: "Close but incomplete: that calls the function without telling it WHICH dog — the self slot would be empty." },
          ],
          explanation: "Inside a method, the same object is always self — so self.bark() is the spelling that works.",
        },
        {
          id: "h-05-q2",
          prompt: "Song defines __eq__ comparing title and seconds. What does Song(\"Star\", 180) == Song(\"Star\", 180) evaluate to?",
          options: [
            { text: "False — they are two different objects", correct: false, feedback: "That is the behavior WITHOUT __eq__. Defining it replaces identity comparison with your rule." },
            { text: "True — the titles and seconds match your __eq__ rule", correct: true, feedback: "Exactly: == now asks your __eq__, and both attributes agree." },
            { text: "A TypeError — songs cannot be compared", correct: false, feedback: "Nothing stops comparison; without __eq__ it would simply compare identity." },
          ],
          explanation: "__eq__ turns == into whatever you define: here, equal data means equal songs.",
        },
        {
          id: "h-05-q3",
          prompt: "Which operation triggers __len__?",
          options: [
            { text: "song.__len__", correct: false, feedback: "That refers to the method object without calling it — and you should trigger dunders through operations anyway." },
            { text: "len(song)", correct: true, feedback: "Right: len() calls your __len__ and returns its result." },
            { text: "print(song)", correct: false, feedback: "Printing triggers __repr__ — a different socket in the same wall." },
          ],
          explanation: "Ordinary operations trigger dunders: len() -> __len__, print() -> __repr__, == -> __eq__.",
        },
      ],
    },

    // ------------------------------------------------------------- h-06
    {
      slug: "h-06",
      title: "Encapsulation",
      minutes: 15,
      summary:
        "Guarding what an object is allowed to do to itself: the underscore convention, properties for read-only and validated attributes, protecting invariants like a balance that can never go negative, and Python's consenting-adults philosophy.",
      kind: "concept",
      objectives: [
        "Explain the single-underscore convention: _name means internal, by agreement",
        "Write a read-only attribute with the @property decorator",
        "Write a property setter that validates values and raises ValueError",
        "Protect an invariant such as a non-negative balance",
        "Migrate a public attribute to a property without changing any calling code",
      ],
      why: "So far, anyone with a reference to your object can set ANY attribute to ANYTHING: my_account.balance = -9999, my_dog.name = 42. Nothing stops it, and the more realistic your classes get — bank balances, game energy, user passwords — the more expensive that freedom becomes. Real programs need objects that protect their own rules: a balance that can never go negative, a temperature that can never fall below absolute zero. This lesson teaches the two Python tools for that: the underscore convention (a polite 'do not touch' sign) and properties (a real, enforced gate between the outside world and your data). It ends with the single most useful refactoring trick in all of Python.",
      blocks: [
        {
          kind: "text",
          text: "Here is a BankAccount exactly as you could build it with what you already know — and its fatal flaw. Every attribute is wide open: any line of code can write `acc.balance = -9999` or `acc.owner = 42`, and the object just takes it. In this lesson you will close that hole in stages, ending with an account that physically refuses an impossible value.",
        },
        {
          kind: "heading",
          text: "Stage 1: the underscore convention",
        },
        {
          kind: "code",
          title: "_balance: a polite 'do not touch' sign",
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner          # public: for everyone
        self._balance = balance     # _internal: "handle with care"

    def deposit(self, amount):
        self._balance += amount

    def withdraw(self, amount):
        self._balance -= amount

    def get_balance(self):
        return self._balance

acc = BankAccount("Ada", 100)
print("owner (public):", acc.owner)
acc.deposit(50)
acc.withdraw(30)
print("balance (via method):", acc.get_balance())
print("balance (sneaky direct read):", acc._balance)  # works -- but you were warned
`,
          output: `owner (public): Ada
balance (via method): 120
balance (sneaky direct read): 120`,
          outputNote: "Real output. The underscore does not lock anything — it signals.",
          explain: [
            "A single leading underscore (`_balance`) says: *this is how the class works on the inside; use the methods instead*.",
            "The sneaky direct read still works — Python does not stop you. The underscore is a convention between grown-ups, not a wall.",
            "The public attribute `owner` stays open: owner is a plain fact anyone may read, no rule needed.",
          ],
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "Python's philosophy: consenting adults",
          text: "Many languages lock attributes with private and protected keywords enforced by the compiler. Python's answer is famously different: 'we are all consenting adults here.' The underscore is a closed door with no lock — anyone who really wants in can turn the handle, but no well-behaved code ever will, and the underscore tells you exactly who is misbehaving when it happens.",
        },
        {
          kind: "heading",
          text: "Stage 2: properties — real gates that look like plain attributes",
        },
        {
          kind: "text",
          text: "Conventions are polite, but sometimes you want a door that actually does something. Python's tool is the **property**: a method that is *called* whenever an attribute is read — but from the outside it looks exactly like a plain attribute. You write it with the `@property` decorator (decorators are labels above a function that modify how it works — you met them in Part G).",
        },
        {
          kind: "code",
          title: "A read that secretly runs a method",
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):      # runs when you READ acc.balance
        return self._balance

acc = BankAccount("Ada", 100)
print(acc.balance)          # reads like an attribute...
acc._balance += 50          # the internal value changed
print(acc.balance)          # ...but the method ran again and gave the fresh value
`,
          output: `100
150`,
          outputNote: "Real output. acc.balance looks like an attribute but is really a method call.",
          explain: [
            "The `@property` line above `def balance(self)` makes `balance` a managed attribute: reading `acc.balance` calls the method.",
            "Reading it twice gave two different answers because the method ran twice — proof that code executes, not just data sitting there.",
            "This is more than style: a property can COMPUTE a value on the fly, and — as you will see next — reject writes.",
          ],
        },
        {
          kind: "code",
          title: "A read-only property refuses assignment",
          expectError: "AttributeError: property 'balance' of 'BankAccount' object has no setter",
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

acc = BankAccount("Ada", 100)
print(acc.balance)
acc.balance = 1000000    # read-only: there is no setter
`,
          outputNote: "Deliberate crash. The property defines a reader but no writer — so writing is refused.",
          explain: [
            "A property with only a `@property` method is **read-only**: you may read `acc.balance`, but assigning to it raises AttributeError.",
            "Read the error: 'no setter' — the exact concept the next block adds.",
            "This is your first genuinely enforced rule: the object itself says NO to a bad idea.",
          ],
        },
        {
          kind: "heading",
          text: "Stage 3: the setter — validating every write",
        },
        {
          kind: "code",
          title: "A property with validation",
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):       # runs when you WRITE acc.balance = value
        if value < 0:
            raise ValueError("balance cannot go negative")
        self._balance = value

acc = BankAccount("Ada", 100)
print("start:", acc.balance)

acc.balance = 250                   # looks like an assignment...
print("after assignment:", acc.balance)
`,
          output: `start: 100
after assignment: 250`,
          outputNote: "Real output. The assignment looks innocent and works — because it passed the rule.",
          explain: [
            "The `@balance.setter` decorator registers a SECOND method under the same name: the writer.",
            "`acc.balance = 250` now calls the setter with `value = 250`. The setter checks the rule, then writes `self._balance`.",
            "Same friendly attribute syntax — but every read and every write now passes through YOUR code.",
          ],
        },
        {
          kind: "code",
          title: "The invariant holds: no negative balances, ever",
          expectError: "ValueError: balance cannot go negative",
          code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("balance cannot go negative")
        self._balance = value

acc = BankAccount("Ada", 100)
acc.balance = -50    # the setter refuses: this would break the invariant
`,
          outputNote: "Deliberate crash. The impossible value is rejected at the gate, loudly.",
          explain: [
            "The setter raises `ValueError` — the exception you know from Part G for 'this value is illegal'.",
            "An **invariant** is a rule that must always be true — here, *a balance is never negative*. With the setter, the object cannot be put into a broken state from outside.",
            "Compare with stage 1: `acc._balance = -50` would have 'worked' (underscore, no lock). The property is the difference between a rule and a suggestion.",
          ],
        },
        {
          kind: "heading",
          text: "The migration story: the trick you will use forever",
        },
        {
          kind: "text",
          text: "Now the payoff — the single most useful thing about properties. Suppose you shipped a class with a plain public attribute, and THEN realized it needs a rule. In most languages, adding validation means every `t.celsius` in every file must be rewritten as `t.get_celsius()`. In Python, the property lets you change the inside WITHOUT touching a single line outside. Watch a real migration in two steps.",
        },
        {
          kind: "code",
          title: "Version 1: a public attribute, no rules",
          code: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius     # public attribute: anyone can read AND write

t = Temperature(21)
print("comfortable:", t.celsius)

t.celsius = 500    # nothing stops this -- an impossible temperature!
print("broken:", t.celsius)
`,
          output: `comfortable: 21
broken: 500`,
          outputNote: "Real output. The broken value sails right through — there is no gate.",
          explain: [
            "`celsius` is a plain attribute — reading and writing it go straight to storage.",
            "500 degrees is physically absurd, but the class accepts it without complaint.",
            "Users of this class write `t.celsius` everywhere — hundreds of lines, maybe hundreds of files.",
          ],
        },
        {
          kind: "code",
          title: "Version 2: same interface, now with a rule",
          code: `class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):              # same NAME as before -- old code still works
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero is not a temperature")
        self._celsius = value

t = Temperature(21)
print("comfortable:", t.celsius)
t.celsius = 25                     # same syntax as before
print("updated:", t.celsius)
`,
          output: `comfortable: 21
updated: 25`,
          outputNote: "Real output. The reads and writes look IDENTICAL to version 1 — but now pass through the rule.",
          explain: [
            "Inside: storage moved to `_celsius`, and both directions now pass through property methods.",
            "Outside: `t.celsius` reads and `t.celsius = 25` writes are letter-for-letter the same as before — zero calling code changed.",
            "This is the migration story: start with plain attributes; add a property only when a rule becomes necessary. Python lets you evolve a class without breaking its users.",
          ],
        },
        {
          kind: "steps",
          title: "When to use each tool",
          items: [
            "**Plain public attribute** (self.name) — the default. No rule needed, just data.",
            "**Underscore name** (self._balance) — 'internal, use the methods'; for when you keep the direct attribute but want to signal.",
            "**Read-only property** (@property) — a value the outside world may read but never write, like a computed status.",
            "**Property with setter** (@x.setter) — a value that must obey a rule on every write, like a balance or a temperature.",
            "**The migration order** — start simple, add the property when the rule appears. Never start by wrapping everything 'just in case'.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — build a guarded wallet",
          task: "The Wallet has a read-only `amount` property. (1) Add a line `w.amount = 1000` and run — read the AttributeError carefully. (2) Comment that line back out. (3) Add a setter that raises ValueError for negative amounts, then try `w.amount = -5` (read the error) and `w.amount = 75` (watch it work).",
          code: `class Wallet:
    def __init__(self, amount=0):
        self._amount = amount

    @property
    def amount(self):
        return self._amount

w = Wallet(50)
print("money:", w.amount)
`,
          hint: "The setter mirrors the lesson's pattern: @amount.setter above def amount(self, value): — check the rule, raise ValueError if broken, otherwise store self._amount = value.",
        },
      ],
      terms: [
        { term: "Encapsulation", definition: "Bundling data with the methods that manage it, and controlling what outside code may do to it." },
        { term: "Underscore convention", definition: "A single leading underscore on a name (_balance) marking it as internal: usable by you, but off-limits by agreement." },
        { term: "Property", definition: "A method decorated with @property that is called when an attribute is read — it looks like an attribute from outside." },
        { term: "Setter", definition: "A method decorated with @name.setter that is called when the attribute is assigned, and may validate the value first." },
        { term: "Invariant", definition: "A rule that must always be true of an object, like 'a balance is never negative' — protected by validation." },
      ],
      mistakes: [
        {
          mistake: "Defining @property balance and then writing self.balance = value inside __init__.",
          why: "If the property is read-only, the assignment in the constructor raises AttributeError too — the gate does not know or care that the writer is the class itself.",
          fix: "Initialize the internal name in __init__ (self._balance = balance) and let only the property's methods touch it.",
        },
        {
          mistake: "Forgetting @property and defining def balance(self) as an ordinary method.",
          why: "Then acc.balance is a method OBJECT, not a value — print shows <bound method ...> and comparisons quietly misbehave.",
          fix: "The decorator line is the whole trick: @property above the def. With it, reading acc.balance calls the method; without it, acc.balance IS the method.",
        },
        {
          mistake: "Believing _balance is truly private because of the underscore.",
          why: "Python enforces nothing: acc._balance = -9999 runs fine. The underscore is a social contract, and colleagues reading your code will (rightly) treat direct writes as a bug.",
          fix: "Use the underscore as a signal and properties as the enforcement. If a rule MUST hold, put it in a setter — signals do not stop bugs, gates do.",
        },
        {
          mistake: "Raising ValueError with no message, or a vague one like 'bad value'.",
          why: "The error is often read at 2 a.m. by whoever called the code — 'bad value' forces them to open your file and hunt.",
          fix: "Say the rule in the message: raise ValueError(\"balance cannot go negative\") — the traceback then explains itself.",
        },
      ],
      takeaways: [
        "A single leading underscore means internal: 'use the methods, not me' — a convention Python enforces nothing about.",
        "@property turns a method into something that reads like an attribute; a read-only property has no setter and refuses assignment.",
        "The setter is the gate: validate the value, raise ValueError on a rule-break, store it only if it passes.",
        "An invariant — a rule that must always hold — lives in the setter, so the object can never be broken from outside.",
        "The migration trick: plain attribute first, property later, with the same name — calling code never notices.",
      ],
      quiz: [
        {
          id: "h-06-q1",
          prompt: "What does a single leading underscore on an attribute name (_balance) mean in Python?",
          options: [
            { text: "The attribute is locked: outside code cannot read or write it", correct: false, feedback: "Nothing is locked — acc._balance = -1 runs fine. Python does not enforce the underscore." },
            { text: "It is internal by convention: usable, but 'please go through the methods instead'", correct: true, feedback: "Exactly — consenting adults: a closed door with no lock, and everyone agrees not to turn the handle." },
            { text: "The attribute is deleted after each use", correct: false, feedback: "Underscores have no runtime behavior at all; this one is pure communication." },
          ],
          explanation: "One underscore = a polite 'do not touch'. Enforcement comes from properties, not names.",
        },
        {
          id: "h-06-q2",
          prompt: "A class defines @property def balance(self) with NO setter. What happens on acc.balance = 100?",
          options: [
            { text: "It works — properties accept assignment by default", correct: false, feedback: "Default assignment only exists for plain attributes; a property without a setter is read-only." },
            { text: "AttributeError: property 'balance' ... has no setter", correct: true, feedback: "Correct — the read path exists, the write path does not, and Python says so precisely." },
            { text: "ValueError: invalid assignment", correct: false, feedback: "ValueError is what YOUR setter raises for rule-breaks. A missing setter is an AttributeError." },
          ],
          explanation: "Read-only is the default state of a property: reader defined, writer absent, writes refused.",
        },
        {
          id: "h-06-q3",
          prompt: "Why is the property migration trick (public attribute -> property, same name) so valuable?",
          options: [
            { text: "It makes the class run faster", correct: false, feedback: "If anything it adds a method call per access — the point is compatibility, not speed." },
            { text: "A rule can be added later WITHOUT changing any code that reads or writes the attribute", correct: true, feedback: "Exactly — t.celsius keeps working letter-for-letter while a gate appears behind it." },
            { text: "It removes the need for __init__ entirely", correct: false, feedback: "The constructor still builds the object — properties only manage access to names." },
          ],
          explanation: "Same name outside, new machinery inside: classes can grow rules without breaking their users.",
        },
      ],
    },

    // ------------------------------------------------------------- h-07
    {
      slug: "h-07",
      title: "Inheritance",
      minutes: 16,
      summary:
        "Building new classes on existing ones: class Child(Parent), what gets inherited, method overriding, super().__init__(), the is-a relationship test, and multiple inheritance with the MRO.",
      kind: "concept",
      objectives: [
        "Write class Child(Parent) and predict exactly what is inherited",
        "Override an inherited method to replace its behavior in the child",
        "Call the parent constructor with super().__init__()",
        "Test the is-a relationship with isinstance()",
        "Explain, briefly, multiple inheritance and the method resolution order",
      ],
      why: "Real systems are full of things that are almost like other things: a Manager is an Employee who also leads a team; a Movie is a MediaItem that also has a director. Without inheritance you would copy the Employee class, paste it, add two lines — and now every bug fix has to be made twice, then a hundred times. Inheritance lets you say it once ('a Manager IS AN Employee') and get everything Employee knows how to do, for free, in one line: class Manager(Employee). This lesson builds that relationship for real, shows you the three tools that manage it (inherit, override, super), and teaches you the test for when inheritance is even the right idea.",
      blocks: [
        {
          kind: "text",
          text: "You now have Employee and Manager-shaped problems: two classes that share most of their code. The oldest trick in object-oriented programming solves this: instead of writing Manager from scratch, you *derive* it from Employee — and Manager instantly receives everything Employee has. **Inheritance**: the child class receives all attributes and methods of the parent, then adds or replaces what makes it different.",
        },
        {
          kind: "heading",
          text: "class Child(Parent): deriving a new class",
        },
        {
          kind: "text",
          text: "The syntax is beautifully small: put the parent in parentheses after the child's name. That one line means *Dog is an Animal — give Dog everything Animal has.*",
        },
        {
          kind: "code",
          title: "What Dog gets from Animal",
          code: `class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        return f"{self.name} eats"

    def sleep(self):
        return f"{self.name} sleeps"


class Dog(Animal):          # Dog INHERITS from Animal
    def bark(self):         # Dog adds something new
        return f"{self.name} barks"


rex = Dog("Rex")

print(rex.eat())     # inherited from Animal -- Dog got it for free
print(rex.sleep())   # inherited too
print(rex.bark())    # Dog's own method
print("rex is a Dog:", isinstance(rex, Dog))
print("rex is also an Animal:", isinstance(rex, Animal))
`,
          output: `Rex eats
Rex sleeps
Rex barks
rex is a Dog: True
rex is also an Animal: True`,
          outputNote: "Real output. One Dog class, no copied code — eat and sleep arrived by inheritance.",
          explain: [
            "`Dog` defines only `bark` — yet `rex.eat()` works, because Dog inherited `eat` and `sleep` from Animal, plus its constructor.",
            "`isinstance(rex, Animal)` is True: a dog IS an animal. That is-a relationship is the meaning of inheritance.",
            "Nothing was copied. Fix a bug in `Animal.eat` tomorrow, and every dog, cat, and bird in your program gets the fix.",
          ],
        },
        {
          kind: "visual",
          title: "The inheritance tree",
          ascii: `                Animal
               (name, eat, sleep)
                /          \\
            is-a            is-a
              /                \\
           Dog                 Cat
      (+ bark)            (+ meow)

   Both Dog and Cat receive Animal's data and behavior.
   An arrow pointing UP means "I am one of those,
   plus whatever I add myself."`,
          caption:
            "Read the tree upward: a Dog is an Animal that can also bark. The parent holds what is shared; each child adds its difference.",
        },
        {
          kind: "heading",
          text: "super().__init__(): let the parent build its parts",
        },
        {
          kind: "text",
          text: "A child with its own constructor has one duty first: run the PARENT's constructor, so the parent's attributes actually get created. The tool is `super()` — a built-in that hands you the parent class — called with the arguments the parent's `__init__` expects.",
        },
        {
          kind: "code",
          title: "Watching super() work",
          code: `class Animal:
    def __init__(self, name):
        print(f"  Animal.__init__ runs -> sets name={name}")
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        print("Dog.__init__ starts")
        super().__init__(name)      # hand the shared work to the parent
        print("Dog.__init__ continues")
        self.breed = breed
        print("Dog.__init__ finishes")

rex = Dog("Rex", "beagle")
print(rex.name, "/", rex.breed)
`,
          output: `Dog.__init__ starts
  Animal.__init__ runs -> sets name=Rex
Dog.__init__ continues
Dog.__init__ finishes
Rex / beagle`,
          outputNote: "Real output. The prints reveal the exact order of construction.",
          explain: [
            "Order matters: Dog's constructor starts, delegates to Animal's, and only then adds its own `breed`.",
            "`super().__init__(name)` is the standard line — it means 'parent, build your part of this object first.'",
            "This trace question — *what prints, in what order?* — is such a classic exam question that you will meet it again in this part's assessment.",
          ],
        },
        {
          kind: "text",
          text: "And here is what happens when you forget that duty — the parent's attributes simply never get created, and the crash arrives later, pointing at an attribute that 'does not exist'.",
        },
        {
          kind: "code",
          title: "Forgetting super().__init__()",
          expectError: "AttributeError: 'Dog' object has no attribute 'name'",
          code: `class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, breed):    # BUG: forgot to call the parent constructor
        self.breed = breed

rex = Dog("beagle")
print(rex.breed)
print(rex.name)
`,
          outputNote: "Deliberate crash at the last line — the classic symptom of a missing super().__init__() call.",
          explain: [
            "`rex.breed` prints fine — Dog's own constructor ran and set breed.",
            "`rex.name` explodes: Animal's constructor never ran, so `self.name = name` never happened.",
            "The tell-tale sign of a missing `super().__init__()`: the child's own attributes work, the parent's are missing.",
          ],
        },
        {
          kind: "heading",
          text: "The full example: Employee and Manager",
        },
        {
          kind: "code",
          title: "Inherit, extend, override — the whole toolkit",
          code: `class Employee:
    """Anyone on the payroll."""

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name} earns {self.salary} per month"

    def annual_cost(self):
        return self.salary * 12


class Manager(Employee):
    """An employee who also leads a team."""

    def __init__(self, name, salary, team):
        super().__init__(name, salary)   # Employee handles name and salary
        self.team = team                 # Manager adds its own attribute

    def describe(self):                  # OVERRIDE the inherited method
        return f"{self.name} earns {self.salary} and leads {len(self.team)} people"


ada = Employee("Ada", 5000)
grace = Manager("Grace", 8000, ["Alan", "Kurt"])

print(ada.describe())
print(grace.describe())
print("Ada's annual cost:", ada.annual_cost())
print("Grace's annual cost:", grace.annual_cost())   # inherited, untouched
`,
          output: `Ada earns 5000 per month
Grace earns 8000 and leads 2 people
Ada's annual cost: 60000
Grace's annual cost: 96000`,
          outputNote: "Real output. One Employee class, one Manager class, zero duplicated code.",
          explain: [
            "**Inherit**: Manager gets `annual_cost` without writing it — Grace's 96000 came straight from Employee.",
            "**Extend**: Manager's constructor adds `team`, after `super().__init__` builds the shared parts.",
            "**Override**: Manager *redefines* `describe` with the same name, and its version wins for managers — while Ada's plain Employee call is untouched.",
          ],
        },
        {
          kind: "heading",
          text: "The is-a test",
        },
        {
          kind: "text",
          text: "When is inheritance the right tool? Ask one question: **is the child genuinely a kind of the parent?** A Manager IS AN Employee — inheritance fits. A Library is NOT a Book, even though it works with books — that is a *has-a* relationship, and it should be modeled with composition (a Library object *containing* book objects), which you will build in the mini project. The test is linguistic and ruthless: if the sentence 'X is a Y' sounds wrong, inheritance is wrong.",
        },
        {
          kind: "table",
          title: "is-a versus has-a",
          headers: ["Relationship", "The sentence", "The tool"],
          rows: [
            ["Manager to Employee", "'A manager IS AN employee'", "Inheritance: class Manager(Employee)"],
            ["Dog to Animal", "'A dog IS AN animal'", "Inheritance: class Dog(Animal)"],
            ["Library to Book", "'A library HAS books'", "Composition: self.items = [...] (mini project)"],
            ["Car to Engine", "'A car HAS AN engine'", "Composition: self.engine = Engine() (lesson h-09)"],
          ],
          caption:
            "Inheritance is for is-a; composition (an attribute holding other objects) is for has-a. When in doubt, composition is usually the safer choice.",
        },
        {
          kind: "heading",
          text: "Multiple inheritance, briefly",
        },
        {
          kind: "text",
          text: "Python allows more than one parent: `class Duck(Swimmer, Flyer)`. It is powerful and occasionally exactly right — but when both parents define the same method, which one wins? Python's answer is the **method resolution order** (MRO): a fixed search order, roughly *the child first, then parents left to right*. You can even print it.",
        },
        {
          kind: "code",
          title: "Who wins? Ask the MRO",
          code: `class Swimmer:
    def move(self):
        return "swims"

class Flyer:
    def move(self):
        return "flies"

class Duck(Swimmer, Flyer):   # multiple parents -- Python looks left first
    pass

d = Duck()
print("a duck", d.move())
print("lookup order:", [cls.__name__ for cls in Duck.__mro__])
`,
          output: `a duck swims
lookup order: ['Duck', 'Swimmer', 'Flyer', 'object']`,
          outputNote: "Real output. Duck.__mro__ is the actual search order Python uses for every method call.",
          explain: [
            "Both parents define `move`, and the duck *swims* — Swimmer is listed first, so its method is found first.",
            "`Duck.__mro__` shows the whole chain: Duck, then Swimmer, then Flyer, then `object` (every class ultimately inherits from Python's root class).",
            "Keep multiple inheritance rare and shallow: it is a power tool, and most real hierarchies are single-parent chains.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The three-line inheritance recipe",
          text: "Almost every child class you will ever write follows the same shape: (1) `class Child(Parent):` — declare the relationship; (2) `super().__init__(...)` first thing in your constructor — let the parent build its parts; (3) define only what is DIFFERENT — new attributes, new methods, and overrides of methods whose behavior must change.",
        },
        {
          kind: "tryIt",
          title: "Try it — inherit and override",
          task: "The Manager class inherits from Employee but does NOT yet override describe(). Add a `describe` method to Manager that returns `f\"{self.name} earns {self.salary} and leads {len(self.team)} people\"` — then run and compare the two describe lines.",
          code: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name} earns {self.salary}"

class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)
        self.team = team

ada = Employee("Ada", 5000)
grace = Manager("Grace", 8000, ["Alan", "Kurt"])
print(ada.describe())
print(grace.describe())
`,
          hint: "The override goes inside class Manager, indented like any method: def describe(self): — same name as the parent's, and it wins for managers.",
        },
      ],
      terms: [
        { term: "Inheritance", definition: "Creating a class that receives all attributes and methods of an existing parent class: class Dog(Animal)." },
        { term: "Parent / child class", definition: "The class being inherited from (parent, or base) and the class that inherits (child, or subclass)." },
        { term: "Override", definition: "Defining a method in the child with the same name as an inherited method, replacing its behavior for child objects." },
        { term: "super()", definition: "The built-in that gives a child class access to its parent — used as super().__init__(...) to run the parent constructor." },
        { term: "Method resolution order (MRO)", definition: "The fixed order Python searches classes for a method: the class itself, then parents left to right, then object." },
      ],
      mistakes: [
        {
          mistake: "Defining __init__ in the child without calling super().__init__().",
          why: "The parent's constructor never runs, so the parent's attributes are never created — and reading them later raises AttributeError, far away from the real omission.",
          fix: "First line of the child's constructor: super().__init__(parent args). Then add the child's own attributes.",
        },
        {
          mistake: "Copying the parent's method body into the child instead of calling super() or inheriting.",
          why: "Two copies of the same logic now drift apart — fix one, forget the other, and hunt the resulting bug for hours.",
          fix: "Inherit what is shared, override only what differs, and use super() to reach the parent's version when the child needs it as a base.",
        },
        {
          mistake: "Using inheritance for a has-a relationship: class Car(Engine).",
          why: "A car is not an engine — it HAS one. The sentence test fails, and the design starts producing nonsense like engines with four doors.",
          fix: "Model has-a with composition: an attribute holding the other object (self.engine = Engine()), covered fully in lesson h-09.",
        },
        {
          mistake: "Overriding a method and accidentally changing its name by one letter (desribe instead of describe).",
          why: "The child now has two methods — the typo'd one (never called) and the parent's (still winning) — and the override silently does nothing.",
          fix: "Copy the parent's method name exactly. If an override seems ignored, check the spelling first.",
        },
      ],
      takeaways: [
        "class Child(Parent) gives the child every attribute and method of the parent — write the difference, inherit the rest.",
        "super().__init__(...) runs the parent's constructor first; skipping it leaves the parent's attributes missing.",
        "Override a method by redefining it in the child: same name, new behavior, parent untouched.",
        "The is-a test decides design: Manager IS AN Employee (inherit); a Library HAS books (compose).",
        "Multiple inheritance searches the MRO — child, then parents left to right — and Duck.__mro__ shows the order.",
      ],
      quiz: [
        {
          id: "h-07-q1",
          prompt: "What does super().__init__(name, salary) do inside Manager's constructor?",
          options: [
            { text: "Creates a brand-new Employee object, separate from the manager", correct: false, feedback: "It builds no separate object — it runs the parent's constructor on THE OBJECT BEING BUILT (self)." },
            { text: "Runs Employee.__init__ on the current manager object, so name and salary get set", correct: true, feedback: "Exactly — the parent's constructor does its part of the construction, on the same self." },
            { text: "Renames Manager to Employee", correct: false, feedback: "Nothing is renamed — super() is simply the parent-class handle, used to borrow its methods." },
          ],
          explanation: "super().__init__(...) = 'parent, build your part of THIS object' — the single most-used line in subclass constructors.",
        },
        {
          id: "h-07-q2",
          prompt: "Manager overrides describe(). What does mgr.describe() run, if mgr is a Manager?",
          options: [
            { text: "Manager's describe — an override replaces the inherited method for child objects", correct: true, feedback: "Right: same name in the child wins. The parent's version still exists — for plain Employees." },
            { text: "Employee's describe — the parent's version always wins", correct: false, feedback: "Backwards: lookup starts at the object's own class, so the child's version is found first." },
            { text: "Both, in MRO order", correct: false, feedback: "Only one is found and run — the child's. Reaching both requires calling super().describe() deliberately." },
          ],
          explanation: "Override = same method name in the child. Child wins; the parent's version survives for parent-only objects.",
        },
        {
          id: "h-07-q3",
          prompt: "Which relationship should be modeled with INHERITANCE?",
          options: [
            { text: "A Library and its Books", correct: false, feedback: "A library HAS books — that is composition, an attribute holding book objects." },
            { text: "A Circle and its radius", correct: false, feedback: "A circle HAS a radius — an attribute, not a parent class." },
            { text: "A Manager and an Employee", correct: true, feedback: "Correct — a manager IS AN employee: the sentence test passes, so class Manager(Employee) fits." },
          ],
          explanation: "The is-a sentence test: if 'X is a Y' sounds right, inherit; if 'X has a Y' sounds right, compose.",
        },
      ],
    },

    // ------------------------------------------------------------- h-08
    {
      slug: "h-08",
      title: "Polymorphism",
      minutes: 14,
      summary:
        "One method name, many behaviors: calling a common method on mixed objects, duck typing and its failure mode, isinstance used sparingly, and __len__ as polymorphism you have used all along.",
      kind: "concept",
      objectives: [
        "Explain polymorphism: the same method call producing different behavior per object",
        "Loop over a mixed list of objects and call their common method",
        "Explain duck typing and predict its AttributeError failure mode",
        "Decide when isinstance() checks are appropriate and when they are a design smell",
        "Recognize dunder polymorphism such as len() working across every type",
      ],
      why: "Here is a scene every program eventually needs: you have a list of things — a dog, a cat, a robot — and you want each one to make its sound. Without polymorphism you would write a branch for every type: if it is a dog, print this; if it is a cat, print that; add a robot tomorrow, update every branch in every file. With polymorphism you write ONE line — thing.speak() — and each object runs its own version. New animal types join without touching the loop. That single idea is what makes the shape tools of this part (classes, inheritance, methods) worth their weight: code that treats many kinds of things uniformly.",
      blocks: [
        {
          kind: "text",
          text: "**Polymorphism** is Greek for *many forms*, and it is the payoff of everything you have built so far. It means: the same method name — `speak()`, `area()`, `describe()` — can be called on objects of different classes, and each object runs ITS OWN version. One call, many behaviors.",
        },
        {
          kind: "heading",
          text: "Same method name, different behavior",
        },
        {
          kind: "code",
          title: "One loop, three voices",
          code: `class Dog:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says Woof!"

class Cat:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says Meow!"

class Robot:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says BEEP-BOOP"

crew = [Dog("Rex"), Cat("Mia"), Robot("Bender")]

for member in crew:
    print(member.speak())     # ONE call -- three different behaviors
`,
          output: `Rex says Woof!
Mia says Meow!
Bender says BEEP-BOOP`,
          outputNote: "Real output. The loop never asks what type anything is.",
          explain: [
            "Three unrelated classes, one shared method name — the loop calls `member.speak()` and each object answers its own way.",
            "Notice what the loop does NOT do: no `if dog`, no type inspection, no special cases.",
            "Add a Parrot class tomorrow, append one parrot to the list, and the loop still works — unchanged. That is the open door that makes polymorphism worth its setup.",
          ],
        },
        {
          kind: "text",
          text: "This works because of the method lookup you already know: `member.speak()` looks for `speak` starting at the object's own class. Dog finds Dog's, Cat finds Cat's. Polymorphism is not new machinery — it is the lookup rule you learned in h-04, doing its job across a mixed list.",
        },
        {
          kind: "heading",
          text: "Duck typing: if it quacks, it is a duck",
        },
        {
          kind: "text",
          text: "Python's philosophy of polymorphism has a famous name. 'If it walks like a duck and it quacks like a duck, then it must be a duck.' Python does not care what an object IS — only what it CAN DO. A function that needs `speak()` will happily take any object that HAS a `speak()` method. No inheritance, no declarations, no type checks. Just try the call.",
        },
        {
          kind: "code",
          title: "No type checks, no questions",
          code: `class Duck:
    def quack(self):
        return "quack"

class Person:
    def quack(self):
        return "I am imitating a duck"

def make_it_quack(thing):
    return thing.quack()      # no type check, no questions -- just call it

print(make_it_quack(Duck()))
print(make_it_quack(Person()))
`,
          output: `quack
I am imitating a duck`,
          outputNote: "Real output. The function works on anything that can quack.",
          explain: [
            "`make_it_quack` never asks what `thing` is — it just calls `thing.quack()`.",
            "A Person is NOT a Duck (no inheritance at all), but it quacks, so it qualifies.",
            "This is the standard Python style: functions state what they need by what they call, and any object that fits, works.",
          ],
        },
        {
          kind: "code",
          title: "When the duck cannot quack",
          expectError: "AttributeError: 'Tree' object has no attribute 'quack'",
          code: `class Duck:
    def quack(self):
        return "quack"

class Tree:
    pass    # trees do not quack

def make_it_quack(thing):
    return thing.quack()

print(make_it_quack(Duck()))
print(make_it_quack(Tree()))    # no quack method -> AttributeError
`,
          outputNote: "Deliberate crash at the last line — duck typing's failure mode, at the exact moment of the call.",
          explain: [
            "A Tree has no `quack`, so `thing.quack()` raises AttributeError — politely naming the class and the missing method.",
            "The error appears at RUN time, when the call is attempted — not when the function is defined. Duck typing is optimistic: it assumes it works, and complains precisely when it does not.",
            "Reading the error is usually enough: either the object is the wrong type (caller's bug) or the class is missing a method (author's bug).",
          ],
        },
        {
          kind: "heading",
          text: "Polymorphism in action: shapes and a total",
        },
        {
          kind: "code",
          title: "One loop, four shapes, one total",
          code: `import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

shapes = [Circle(1), Rectangle(3, 4), Circle(2), Rectangle(2, 5)]

total = 0
for shape in shapes:
    print(f"{type(shape).__name__} with area {shape.area():.2f}")
    total += shape.area()

print(f"total area: {total:.2f}")
`,
          output: `Circle with area 3.14
Rectangle with area 12.00
Circle with area 12.57
Rectangle with area 10.00
total area: 37.71`,
          outputNote: "Real output. Circles and rectangles compute their areas by entirely different math — the caller never knows.",
          explain: [
            "Circle's `area()` uses pi and a radius; Rectangle's multiplies width by height — completely different formulas behind the SAME method name.",
            "The loop sums them into one total as if they were the same thing — which, for the purposes of `area()`, they are.",
            "`type(shape).__name__` is the polite way to print a class's name — useful in logs, reports, and demos like this one.",
          ],
        },
        {
          kind: "heading",
          text: "__len__ is polymorphism everywhere",
        },
        {
          kind: "text",
          text: "You have actually been using polymorphism since Part A — the built-ins run on it. `len()` is one function that works on strings, lists, dictionaries, and any class that defines `__len__`. That is polymorphism: one call, each type answering its own way.",
        },
        {
          kind: "code",
          title: "One function, many lengths",
          code: `class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

print(len("hello"))                     # a str has a length
print(len([1, 2, 3]))                   # a list has a length
print(len(Playlist(["A", "B", "C"])))   # our class defines one too
`,
          output: `5
3
3`,
          outputNote: "Real output. len() does not care what it receives — it calls the object's __len__.",
          explain: [
            "Same `len()` call, three different types — each answers with its own number of things.",
            "Because Playlist defines `__len__`, it plugs into every tool that calls `len()` — your classes ride Python's built-in polymorphism for free.",
          ],
        },
        {
          kind: "heading",
          text: "isinstance: use sparingly",
        },
        {
          kind: "text",
          text: "Python does give you a type checker — `isinstance(obj, Class)` — and it has honest uses (sorting a mixed list one way for dogs, another for cats; guarding entry points). But reach for it *sparingly*: a function full of isinstance branches is a function that must be edited every time a new type appears — the exact maintenance trap polymorphism exists to delete. Prefer a common method name; fall back to isinstance only when the behavior genuinely differs by type.",
        },
        {
          kind: "code",
          title: "The isinstance version — compare it honestly",
          code: `class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

def greet(pet):
    if isinstance(pet, Dog):
        return "Hello dog: " + pet.speak()
    if isinstance(pet, Cat):
        return "Hello cat: " + pet.speak()
    return "...what IS that?"

print(greet(Dog()))
print(greet(Cat()))
`,
          output: `Hello dog: Woof!
Hello cat: Meow!`,
          outputNote: "Real output. Works today — but add a Robot tomorrow and this function needs editing.",
          explain: [
            "This works — and for two classes it even reads fine.",
            "But every new type means a new branch here, and the branches spread to every function written this way. The duck-typed version (`return pet.speak()`) needed zero edits for Robot.",
            "Use isinstance when types truly demand different treatment; when they share a method, let polymorphism do the dispatch.",
          ],
        },
        {
          kind: "table",
          title: "Duck typing versus isinstance branching",
          headers: ["", "Duck typing (thing.speak())", "isinstance branching"],
          rows: [
            ["New type joins the program", "Works with zero edits", "Every branch chain needs a new case"],
            ["Fails how, when it fails", "AttributeError at the call, naming the missing method", "Silently falls through to 'else' if you forget a case"],
            ["Reads as", "'I need anything that can speak'", "'I handle every type I know about'"],
            ["Best for", "Shared behavior across types (the common case)", "Genuinely different behavior per type"],
          ],
          caption:
            "Python culture strongly favors duck typing. Let the method name be the contract; keep isinstance for real cases of per-type logic.",
        },
        {
          kind: "tryIt",
          title: "Try it — add a type without touching the loop",
          task: "Add a `Parrot` class with a constructor taking a name and a `speak()` method returning `f\"{self.name} says Squawk!\"`. Append `Parrot(\"Coco\")` to `crew` — WITHOUT editing the for loop — and run again.",
          code: `class Dog:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says Woof!"

class Cat:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says Meow!"

crew = [Dog("Rex"), Cat("Mia")]

for member in crew:
    print(member.speak())
`,
          hint: "The new class mirrors the existing ones exactly; the loop needs no changes — that is the whole point of polymorphism.",
        },
      ],
      terms: [
        { term: "Polymorphism", definition: "The same method call running different code depending on the object's class: many forms, one interface." },
        { term: "Duck typing", definition: "Python's style of caring what an object can do (its methods) rather than what type it is: if it quacks, it is a duck." },
        { term: "isinstance()", definition: "The built-in that checks an object's type: isinstance(rex, Dog) is True. Useful, but a chain of type checks is usually a design smell." },
        { term: "Dispatch", definition: "The act of routing a method call to the right class's version of the method — done by lookup, starting at the object's own class." },
      ],
      mistakes: [
        {
          mistake: "Writing a chain of isinstance branches where a common method name would do.",
          why: "Every new type requires editing every branch chain in every function — the exact maintenance spiral polymorphism exists to prevent.",
          fix: "Give the types a shared method name and call it directly. Reserve isinstance for behavior that genuinely differs per type.",
        },
        {
          mistake: "Calling thing.speak on an object that has no speak and blaming the function.",
          why: "Duck typing fails at the moment of the call with AttributeError — the error names the class and the missing method, which points at the real problem: the object does not fit the function's needs.",
          fix: "Read the error: either pass an object with the right method, or add the method to the class. The traceback tells you which class is missing what.",
        },
        {
          mistake: "Renaming the shared method in only one class (speak() vs make_sound()).",
          why: "The classes no longer share a common interface, so the polymorphic loop crashes on the first object of the renamed class.",
          fix: "Pick one method name and use it consistently across every class in the group — the shared name IS the contract.",
        },
      ],
      takeaways: [
        "Polymorphism: one method name, many behaviors — each object runs its own class's version.",
        "A loop over mixed objects calling their common method is the everyday face of polymorphism: no type checks anywhere.",
        "Duck typing: Python cares what an object can do, not what it is — and it fails politely, at call time, naming the missing method.",
        "len() is polymorphism you have used since Part A — and __len__ lets your classes join in.",
        "isinstance has honest uses, but a wall of type-branches is the maintenance trap polymorphism deletes. Prefer the shared method name.",
      ],
      quiz: [
        {
          id: "h-08-q1",
          prompt: "A loop calls pet.speak() over a list of Dog, Cat, and Robot objects. What decides which speak() runs?",
          options: [
            { text: "The loop checks each object's type first", correct: false, feedback: "No checks — the loop just calls. Method lookup does the deciding." },
            { text: "Each object's own class: lookup starts there, so its version is found first", correct: true, feedback: "Exactly — the lookup rule from h-04 is the engine of polymorphism." },
            { text: "The most recently defined speak() in the file", correct: false, feedback: "File order is irrelevant; each object carries its own class." },
          ],
          explanation: "member.speak() finds the method starting at the object's class — one call, each class answering its own way.",
        },
        {
          id: "h-08-q2",
          prompt: "make_it_quack(Tree()) raises AttributeError. When and why?",
          options: [
            { text: "At the moment of the call: Tree has no quack method", correct: true, feedback: "Right — duck typing is optimistic and fails precisely, naming the class and the missing method." },
            { text: "When the function is defined: Python validates all calls up front", correct: false, feedback: "Python checks nothing up front — definitions are just definitions until something runs." },
            { text: "Never — Python returns None when a method is missing", correct: false, feedback: "Missing methods do not silently return None; they raise AttributeError loudly." },
          ],
          explanation: "Duck typing trusts first, verifies at call time, and its error tells you exactly what is missing.",
        },
        {
          id: "h-08-q3",
          prompt: "Why do Python programmers prefer a common method name over isinstance branching?",
          options: [
            { text: "isinstance is deprecated and will be removed", correct: false, feedback: "Nothing is deprecated — isinstance is alive, well, and simply overused." },
            { text: "A shared method means new types work with zero edits to existing code", correct: true, feedback: "Exactly — the branch chain must grow for every new type; the polymorphic call never changes." },
            { text: "Branching is slower than method calls", correct: false, feedback: "Speed is not the issue — maintenance is. It is about code that does not need editing." },
          ],
          explanation: "Polymorphism buys you code that accepts new types untouched: add the class, join the list, done.",
        },
      ],
    },

    // ------------------------------------------------------------- h-09
    {
      slug: "h-09",
      title: "Abstraction",
      minutes: 15,
      summary:
        "Hiding complexity behind simple interfaces: the car-pedal principle, abstract base classes with abc.ABC and @abstractmethod that enforce contracts on subclasses, composition as the alternative to inheritance, and honest advice about when not to use OOP.",
      kind: "concept",
      objectives: [
        "Explain abstraction: a simple interface hiding complicated machinery",
        "Write an abstract base class using abc.ABC and @abstractmethod",
        "Explain why instantiating an abstract class fails with TypeError",
        "Enforce a contract on subclasses so a missing method fails at creation",
        "Choose composition over inheritance when the relationship is has-a",
      ],
      why: "You drive a car with three pedals and a wheel — no driver ever times the spark plugs. That is abstraction: a simple interface in front of enormous hidden complexity, and it is why civilization-scale software is possible at all. In Python, abstraction gets concrete: an abstract base class is a contract that subclasses MUST fulfill, and Python enforces it at creation time — a Shape subclass without area() fails to instantiate, loudly, before it can ship a wrong number. This closing lesson also delivers the honest design talk: composition versus inheritance, and the times a class is simply the wrong tool — because the mark of knowing OOP is knowing when NOT to use it.",
      blocks: [
        {
          kind: "text",
          text: "You drive every day without thinking about fuel injection, spark timing, or the anti-lock brake pump cycling ten times a second. The car hands you an interface of stunning simplicity — gas pedal, brake, wheel — and hides a thousand engineered miracles behind it. **Abstraction** is that principle in code: a simple surface in front of complicated machinery.",
        },
        {
          kind: "visual",
          title: "Pedals, not pistons",
          ascii: `   WHAT YOU SEE (the interface)     WHAT IS HIDDEN (the machinery)

   +-----------------------+       fuel injectors, spark timing,
   | [gas]   [brake]       |  <-   gearbox logic, ABS pumps,
   | [steering wheel]      |       300 sensors, 10,000 lines of code
   +-----------------------+
        TWO pedals and a wheel vs. a factory of controlled explosions

   Good abstractions are like this: you use the surface,
   you trust the machinery, you never open the hood.`,
          caption:
            "The interface is small and stable; the implementation is large and free to change. Drivers never relearn pedals when engines improve.",
        },
        {
          kind: "heading",
          text: "Abstraction in classes: the interface is the promise",
        },
        {
          kind: "text",
          text: "Every class you have written is already an abstraction: users of BankAccount call `deposit()` without knowing how balances are stored or validated. But sometimes you want to go further and make a **contract**: a statement that *every X must provide method Y* — every Shape must be able to report its `area()`, every Notification must be able to `send()`. Python has a tool for writing contracts that are actually enforced: **abstract base classes**.",
        },
        {
          kind: "heading",
          text: "abc.ABC and @abstractmethod: contracts in code",
        },
        {
          kind: "text",
          text: "An abstract base class (ABC) is a class that cannot be instantiated directly — it exists to be inherited. Its `@abstractmethod` methods have no body worth calling: they are a list of promises. A subclass only becomes real once it has fulfilled every promise.",
        },
        {
          kind: "code",
          title: "Shape: an abstract base class",
          code: `import math
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Every shape must be able to report its area."""

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

shapes = [Circle(2), Rectangle(3, 4)]
for shape in shapes:
    print(f"{type(shape).__name__}: {shape.area():.2f}")
`,
          output: `Circle: 12.57
Rectangle: 12.00`,
          outputNote: "Real output. Shape defined no behavior — it defined a requirement.",
          explain: [
            "`class Shape(ABC)` — inheriting from Python's ABC marks the class abstract: a contract, not a blueprint you can stamp out.",
            "`@abstractmethod` above `def area(self)` registers the promise: *any real shape must implement area().* The docstring body says what it means.",
            "Circle and Rectangle each implement `area()`, so both are instantiable and usable exactly like the shapes of h-08 — the ABC adds the guarantee, not new behavior.",
          ],
        },
        {
          kind: "code",
          title: "Instantiating the abstract class fails",
          expectError: "TypeError: Can't instantiate abstract class Shape without an implementation for abstract method 'area'",
          code: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Every shape must be able to report its area."""

s = Shape()    # try to stamp out "a shape in general"
`,
          outputNote: "Deliberate crash. Python refuses at creation time.",
          explain: [
            "`Shape()` raises TypeError — and the message says exactly why: Shape still has an abstract method, unfulfilled.",
            "This is the point: 'a shape in general' cannot compute an area. Only concrete shapes can.",
            "The refusal is a feature: the error arrives at CREATION, the moment of the mistake — not months later as a silent wrong number in a report.",
          ],
        },
        {
          kind: "code",
          title: "A subclass that breaks the contract fails too",
          expectError: "TypeError: Can't instantiate abstract class Triangle without an implementation for abstract method 'area'",
          code: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Every shape must be able to report its area."""

class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    # BUG: no area() method -- the contract is not fulfilled

t = Triangle(3, 4)
`,
          outputNote: "Deliberate crash. The contract is checked per subclass, at instantiation.",
          explain: [
            "Triangle inherits from Shape but never writes `area()` — so it is still abstract, and `Triangle(3, 4)` fails.",
            "Read the error: it names Triangle and names the missing method. Fix: implement `area` (for a triangle, `0.5 * base * height`).",
            "This is abstraction enforcing itself: you cannot ship a shape that cannot compute its area. The compiler-quality guarantee, in Python.",
          ],
        },
        {
          kind: "heading",
          text: "Composition: has-a beats is-a (often)",
        },
        {
          kind: "text",
          text: "Here is the design conversation every programmer eventually has: should this class INHERIT from that one, or should it just HOLD one? A car IS NOT an engine — a car HAS AN engine. Modeling has-a is called **composition**: instead of inheriting behavior, an object stores other objects as attributes and delegates work to them. In honest practice, composition is the safer default and inheritance the deliberate exception.",
        },
        {
          kind: "code",
          title: "A Car composed of parts",
          code: `class Engine:
    def start(self):
        return "engine starts"

    def stop(self):
        return "engine stops"

class GPS:
    def route_to(self, place):
        return f"routing to {place}"

class Car:
    def __init__(self):
        self.engine = Engine()   # HAS-A engine (composition)
        self.gps = GPS()         # HAS-A gps

    def drive_to(self, place):
        start = self.engine.start()           # delegate to a part
        route = self.gps.route_to(place)
        return f"{start}, {route}"

car = Car()
print(car.drive_to("the beach"))
print(car.engine.stop())
`,
          output: `engine starts, routing to the beach
engine stops`,
          outputNote: "Real output. The car delegates to its parts — no inheritance anywhere.",
          explain: [
            "`Car` inherits from nothing. It OWNS an Engine and a GPS, stored as attributes in its constructor.",
            "`drive_to` orchestrates its parts: it asks the engine to start and the GPS to route — delegating the details downward.",
            "Compare with class Car(Engine): that would make a car a KIND of engine — nonsense the sentence test rejects. Composition matches the English.",
          ],
        },
        {
          kind: "table",
          title: "Inheritance versus composition",
          headers: ["Question", "Inheritance (is-a)", "Composition (has-a)"],
          rows: [
            ["Relationship", "Manager IS AN Employee", "Car HAS AN engine"],
            ["Mechanism", "class Manager(Employee)", "self.engine = Engine()"],
            ["Gets the parent's methods?", "Yes, all of them, automatically", "No — it delegates to the part explicitly"],
            ["Coupling", "Tight: child depends on parent's details", "Loose: parts can be swapped independently"],
            ["Overused?", "Very — beginners inherit everything", "The recommended default in modern design"],
          ],
          caption:
            "Rule of thumb: try composition first. Reach for inheritance only when a genuine is-a relationship exists and the child truly needs the parent's full interface.",
        },
        {
          kind: "heading",
          text: "When NOT to use OOP",
        },
        {
          kind: "text",
          text: "Honest talk, because this part has shown you a powerful hammer. A class earns its keep when you have DATA plus RULES that travel together — balances with validation, shapes with areas, libraries with borrowing rules. But a script that reads a file and prints three lines does not need a class; a function that transforms one number into another does not need a class; a pile of one-off data does not need a class. Wrapping everything in classes adds ceremony without adding safety, and Python itself is full of plain functions used happily at every level. The professional question is never 'how do I make this object-oriented?' — it is 'what does this problem actually need?'",
        },
        {
          kind: "steps",
          title: "The four pillars, one sentence each",
          items: [
            "**Encapsulation** (h-06): objects protect their own rules — a balance that cannot go negative.",
            "**Inheritance** (h-07): classes build on classes — a Manager is an Employee.",
            "**Polymorphism** (h-08): one call, many behaviors — speak() for every animal.",
            "**Abstraction** (this lesson): simple surface, hidden machinery — pedals, not pistons; and contracts (ABCs) that make the hidden parts trustworthy.",
            "They are tools in a box, not a religion: composition (has-a) often beats inheritance, and plain functions often beat classes.",
          ],
        },
        {
          kind: "tryIt",
          title: "Try it — write your own contract",
          task: "The Notification ABC demands a `send()` method, and EmailNotification fulfills it. (1) Add an `SMSNotification` class whose `send()` returns `f\"SMS: {message}\"`, then print both classes sending the same message. (2) Add a line `n = Notification()` and read the TypeError carefully — then delete it. (3) Bonus: create a subclass with NO send() and watch instantiation fail.",
          code: `from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, message):
        """Deliver the message somehow."""

class EmailNotification(Notification):
    def send(self, message):
        return f"Email: {message}"

n = EmailNotification()
print(n.send("Your book is due tomorrow"))
`,
          hint: "SMSNotification mirrors EmailNotification exactly: inherit from Notification, define send(self, message), return an f-string with a different prefix.",
        },
      ],
      terms: [
        { term: "Abstraction", definition: "Providing a simple interface while hiding complicated implementation details behind it." },
        { term: "Abstract base class (ABC)", definition: "A class inheriting from abc.ABC that cannot be instantiated; it exists to define a contract for subclasses." },
        { term: "@abstractmethod", definition: "The decorator that marks a method as required: any subclass must implement it before it can be instantiated." },
        { term: "Composition", definition: "Building a class by storing other objects as attributes and delegating to them — the has-a relationship." },
      ],
      mistakes: [
        {
          mistake: "Trying to instantiate an abstract class: shape = Shape().",
          why: "Shape is a contract, not a blueprint — it has abstract methods with no implementation, so Python refuses with TypeError and names the unimplemented method.",
          fix: "Instantiate concrete subclasses: Shape() never, Circle(2) always. The ABC's job is being inherited, not being stamped out.",
        },
        {
          mistake: "Writing a subclass of an ABC but forgetting one @abstractmethod.",
          why: "The subclass remains abstract until every promised method exists — instantiation fails with TypeError naming exactly the missing method.",
          fix: "Read the error (it names the method!), implement it, and let the check confirm the contract is fulfilled.",
        },
        {
          mistake: "Forgetting from abc import ABC, abstractmethod and writing class Shape: with @abstractmethod.",
          why: "Without inheriting ABC, the class is an ordinary class: @abstractmethod does nothing, Shape() succeeds, and the contract is decorative.",
          fix: "Both pieces: from abc import ABC, abstractmethod at the top, AND class Shape(ABC). The import is in the standard library — no install needed.",
        },
        {
          mistake: "Reaching for inheritance when the relationship is has-a: class Library(Book).",
          why: "A library is not a book; inheriting gives the library page counts and chapters it should not have, and copies Book's interface into nonsense territory.",
          fix: "Compose: a Library holds books in a list attribute and delegates to them — the design you will build in this part's mini project.",
        },
      ],
      takeaways: [
        "Abstraction = pedals, not pistons: a small stable interface hiding large changeable machinery.",
        "An ABC (class Shape(ABC)) with @abstractmethod methods is a contract; subclasses must fulfill every promise before they can be instantiated.",
        "The enforcement is a gift: a missing method fails at creation time with a TypeError that names it — not as a silent wrong answer later.",
        "Composition (self.engine = Engine()) models has-a and is the safer default; inheritance is for genuine is-a relationships.",
        "Classes are for data plus rules traveling together. Plain functions are not a lesser tool — 'what does this problem need?' is the professional question.",
      ],
      quiz: [
        {
          id: "h-09-q1",
          prompt: "What happens when you instantiate a subclass that forgot to implement an @abstractmethod?",
          options: [
            { text: "Nothing — the abstract method's body runs", correct: false, feedback: "There is no useful body to run — abstract methods are requirements, not implementations." },
            { text: "TypeError at instantiation, naming the missing method", correct: true, feedback: "Exactly — the contract is enforced at creation time, with the culprit named." },
            { text: "AttributeError the first time the method is called", correct: false, feedback: "That is duck typing's failure style. An ABC catches the problem earlier — at instantiation." },
          ],
          explanation: "ABCs move the failure to the moment of the mistake: instantiate without implementing, and Python refuses, naming the missing method.",
        },
        {
          id: "h-09-q2",
          prompt: "A Car needs engine behavior. Which design matches the relationship, and how is it written?",
          options: [
            { text: "Inheritance: class Car(Engine) — the car gets start() for free", correct: false, feedback: "That models 'a car IS AN engine' — the sentence test fails, and the car inherits everything engines do." },
            { text: "Composition: self.engine = Engine() — the car owns an engine and delegates", correct: true, feedback: "Right — has-a is composition: store the part as an attribute, call its methods." },
            { text: "It cannot be done — engines cannot be used inside other classes", correct: false, feedback: "It is done constantly: an attribute holding an object is one of the most common designs in Python." },
          ],
          explanation: "Cars have engines: composition. The car delegates (self.engine.start()) instead of inheriting.",
        },
        {
          id: "h-09-q3",
          prompt: "Which situation genuinely calls for a CLASS rather than plain functions?",
          options: [
            { text: "A one-off script that reads a file and prints three lines", correct: false, feedback: "Plain top-to-bottom code is the right tool — classes here are pure ceremony." },
            { text: "Data plus rules that travel together, like a balance that can never go negative", correct: true, feedback: "Exactly — state with invariants is the home turf of classes: encapsulation (h-06) exists for exactly this." },
            { text: "A function that doubles a number", correct: false, feedback: "def double(n): return n * 2 is already perfect; wrapping it in a class adds nothing." },
          ],
          explanation: "Classes earn their keep when data and its rules belong together. Otherwise, plain functions are not the lesser choice.",
        },
      ],
    },
  ],

  // =====================================================================
  // PART H EXERCISES — 12 (4 beginner, 4 intermediate, 4 advanced)
  // =====================================================================
  exercises: [
    // ---- beginner
    {
      id: "h-b1",
      tier: "beginner",
      title: "Rectangle with area and perimeter",
      prompt:
        "Write a Rectangle class with a constructor taking width and height, an __init__ that stores both on the object, an area() method returning width * height, a perimeter() method returning 2 * (width + height), and a __repr__ returning f\"Rectangle({self.width} x {self.height})\". Then create two rectangles (3 x 4 and 5 x 5) and print each one followed by its area and perimeter, so the output matches exactly.",
      hint: "Every method starts with self: def area(self): return self.width * self.height. The __repr__ uses the f-string exactly as given — the x between the numbers is the letter x with spaces around it.",
      starter: `class Rectangle:
    def __init__(self, width, height):
        # store both values on the object

    # area() -> width * height

    # perimeter() -> 2 * (width + height)

    # __repr__ -> f"Rectangle({self.width} x {self.height})"

r = Rectangle(3, 4)
print(r)
print("area:", r.area())
print("perimeter:", r.perimeter())

s = Rectangle(5, 5)
print(s)
print("area:", s.area())
print("perimeter:", s.perimeter())
`,
      solution: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def __repr__(self):
        return f"Rectangle({self.width} x {self.height})"

r = Rectangle(3, 4)
print(r)
print("area:", r.area())
print("perimeter:", r.perimeter())

s = Rectangle(5, 5)
print(s)
print("area:", s.area())
print("perimeter:", s.perimeter())
`,
      expectedOutput: `Rectangle(3 x 4)
area: 12
perimeter: 14
Rectangle(5 x 5)
area: 25
perimeter: 20`,
      concepts: ["classes", "__init__", "methods", "__repr__"],
    },
    {
      id: "h-b2",
      tier: "beginner",
      title: "The robot counter",
      prompt:
        "Build a Robot class that counts its own population. Use a CLASS attribute count = 0 (one shared counter), and in __init__ store the robot's name as an instance attribute and increment Robot.count by 1 (spelled with the class name). Add a __repr__ returning f\"Robot({self.name!r})\". Print the count before creating any robots, create exactly three robots (Bender, R2-D2, WALL-E), print the count after, then print all three robots on one line.",
      hint: "The counter update must go through the CLASS name: Robot.count += 1 inside __init__. Printing three objects with one print: print(a, b, c) — spaces are added automatically.",
      starter: `class Robot:
    count = 0   # class attribute: one shared counter

    def __init__(self, name):
        # store the name, update the shared counter

    # __repr__ -> f"Robot({self.name!r})"

print("robots at start:", Robot.count)
# create Bender, R2-D2, WALL-E, then print the count and the robots
`,
      solution: `class Robot:
    count = 0   # class attribute: ONE counter shared by all robots

    def __init__(self, name):
        self.name = name      # instance attribute: each robot has its own
        Robot.count += 1      # update the shared counter

    def __repr__(self):
        return f"Robot({self.name!r})"

print("robots at start:", Robot.count)
a = Robot("Bender")
b = Robot("R2-D2")
c = Robot("WALL-E")
print("robots built:", Robot.count)
print(a, b, c)
`,
      expectedOutput: `robots at start: 0
robots built: 3
Robot('Bender') Robot('R2-D2') Robot('WALL-E')`,
      concepts: ["class attributes", "instance attributes", "counters", "__repr__"],
    },
    {
      id: "h-b3",
      tier: "beginner",
      title: "Books that print themselves",
      prompt:
        "Write a Book class with __init__ taking title, author, and year, and a __repr__ returning f\"Book({self.title!r}, by {self.author}, {self.year})\". Build a list called shelf containing three books — Frankenstein by Mary Shelley (1818), Dune by Frank Herbert (1965), and Neuromancer by William Gibson (1984) — then loop over the shelf printing each book. The __repr__ is the whole exercise: the goal is objects that print usefully.",
      hint: "The !r inside the f-string puts quotes around the title automatically. A for loop over a list of objects with print(book) inside is all the demo needs.",
      starter: `class Book:
    def __init__(self, title, author, year):
        # store all three values

    # __repr__ -> f"Book({self.title!r}, by {self.author}, {self.year})"

shelf = [
    # three books: Frankenstein/1818, Dune/1965, Neuromancer/1984
]

for book in shelf:
    print(book)
`,
      solution: `class Book:
    def __init__(self, title, author, year):
        self.title = title
        self.author = author
        self.year = year

    def __repr__(self):
        return f"Book({self.title!r}, by {self.author}, {self.year})"

shelf = [
    Book("Frankenstein", "Mary Shelley", 1818),
    Book("Dune", "Frank Herbert", 1965),
    Book("Neuromancer", "William Gibson", 1984),
]

for book in shelf:
    print(book)
`,
      expectedOutput: `Book('Frankenstein', by Mary Shelley, 1818)
Book('Dune', by Frank Herbert, 1965)
Book('Neuromancer', by William Gibson, 1984)`,
      concepts: ["__repr__", "constructors", "lists of objects"],
    },
    {
      id: "h-b4",
      tier: "beginner",
      title: "Fix the broken class",
      prompt:
        "This Dog class has exactly TWO bugs and crashes when run. Bug hunting loop: run it, read the error, fix ONLY that one thing, run again. The first error is an AttributeError about a misspelled attribute; after fixing it you will meet a TypeError about a method's arguments. Fix both (one is a typo, one is a missing word in a method's definition) so the program prints the dog's name and his bark.",
      hint: "AttributeError first: check the spelling of the attribute against what __init__ actually stores. Then TypeError: what does every method's parameter list need before any other parameters?",
      starter: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark():                     # BUG 1: something is missing here
        return f"{self.name} says Woof!"

rex = Dog("Rex")
print(rex.nmae)                     # BUG 2: a typo
print(rex.bark())
`,
      starterExpectError: "AttributeError: 'Dog' object has no attribute 'nmae'",
      solution: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):                 # FIX 1: bark needs self
        return f"{self.name} says Woof!"

rex = Dog("Rex")
print(rex.name)                     # FIX 2: spell the attribute correctly
print(rex.bark())
`,
      expectedOutput: `Rex
Rex says Woof!`,
      concepts: ["debugging", "AttributeError", "self", "TypeError"],
    },

    // ---- intermediate
    {
      id: "h-i1",
      tier: "intermediate",
      title: "BankAccount that protects its money",
      prompt:
        "Build a BankAccount with owner and an internal _balance (default 0), plus deposit(amount) and withdraw(amount) methods that both RETURN the new balance. Rules to enforce with ValueError: deposits and withdrawals must be positive, and withdrawals larger than the balance are refused (insufficient funds). Add a __repr__ returning f\"BankAccount({self.owner!r}, balance={self._balance})\". Demo: create Ada with 100, print her, deposit 50 and print, withdraw 30 and print, then try withdrawing -10 and 1000 in a for loop with try/except that prints each rejection (Part G style) with the text 'rejected:' plus the error message.",
      hint: "Raise ValueError with clear messages: 'deposit must be positive', 'withdrawal must be positive', 'insufficient funds'. The try/except loop: for bad in [-10, 1000]: with except ValueError as err: print('rejected:', err).",
      starter: `class BankAccount:
    def __init__(self, owner, balance=0):
        # public owner, internal _balance

    # deposit(amount): positive only, returns new balance
    # withdraw(amount): positive only, enough funds, returns new balance
    # __repr__ -> f"BankAccount({self.owner!r}, balance={self._balance})"

acc = BankAccount("Ada", 100)
print(acc)
# deposit 50, print; withdraw 30, print
# then try withdrawing -10 and 1000, printing each rejection
`,
      solution: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount
        return self._balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        return self._balance

    def __repr__(self):
        return f"BankAccount({self.owner!r}, balance={self._balance})"

acc = BankAccount("Ada", 100)
print(acc)
acc.deposit(50)
print(acc)
acc.withdraw(30)
print(acc)

for bad in [-10, 1000]:
    try:
        acc.withdraw(bad)
        print("withdrew", bad)
    except ValueError as err:
        print("rejected:", err)
`,
      expectedOutput: `BankAccount('Ada', balance=100)
BankAccount('Ada', balance=150)
BankAccount('Ada', balance=120)
rejected: withdrawal must be positive
rejected: insufficient funds`,
      concepts: ["methods", "validation", "ValueError", "try/except"],
    },
    {
      id: "h-i2",
      tier: "intermediate",
      title: "Read-only properties on a Circle",
      prompt:
        "Build a Circle that stores _radius in its constructor and exposes THREE read-only properties: radius (returns _radius), diameter (returns 2 * _radius), and area (returns 3.14159 * _radius ** 2). Create circles with radius 1 and 3, and print each with one f-string line: f\"radius={c.radius}, diameter={c.diameter}, area={c.area:.2f}\". Then prove the read-only behavior: try assigning to small.area = 999 inside a try/except AttributeError, and print 'read-only: area has no setter' when it fails.",
      hint: "Three @property methods, each returning a computed value — no setters anywhere. The try/except catches the AttributeError that a missing setter raises on assignment.",
      starter: `class Circle:
    def __init__(self, radius):
        # store the radius internally

    # @property radius -> the stored radius
    # @property diameter -> twice the radius
    # @property area -> 3.14159 * radius squared

small = Circle(1)
big = Circle(3)
# print both circles with the f-string line
# then prove area cannot be assigned
`,
      solution: `class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def diameter(self):
        return 2 * self._radius

    @property
    def area(self):
        return 3.14159 * self._radius ** 2

small = Circle(1)
big = Circle(3)

for c in [small, big]:
    print(f"radius={c.radius}, diameter={c.diameter}, area={c.area:.2f}")

try:
    small.area = 999
    print("assigned!")
except AttributeError:
    print("read-only: area has no setter")
`,
      expectedOutput: `radius=1, diameter=2, area=3.14
radius=3, diameter=6, area=28.27
read-only: area has no setter`,
      concepts: ["properties", "read-only attributes", "@property"],
    },
    {
      id: "h-i3",
      tier: "intermediate",
      title: "Pet inheritance: Dog and Cat",
      prompt:
        "Build a Pet base class with __init__(name, age), a describe() method returning f\"{self.name} is {self.age} years old\", and a generic speak() returning \"...\". Then extend it: Dog adds a breed parameter (call super().__init__ first), overrides describe() to return f\"{self.name} is a {self.breed} and is {self.age} years old\", and overrides speak() to return f\"{self.name} says Woof!\". Cat only overrides speak() to return f\"{self.name} says Meow!\". Loop over a list of [Dog(\"Rex\", 3, \"beagle\"), Cat(\"Mia\", 5), Pet(\"Bit\", 1)] printing describe() then an indented speak() line (two spaces before the speak result).",
      hint: "Dog's constructor: super().__init__(name, age) first, then self.breed = breed. The base class and Cat need no constructor of their own — they inherit Pet's. Indented speak: print(\" \", pet.speak()) prints two characters of indentation because the separator space adds one more.",
      starter: `class Pet:
    def __init__(self, name, age):
        # store name and age

    # describe() -> f"{self.name} is {self.age} years old"
    # speak() -> "..."

class Dog(Pet):
    # __init__(name, age, breed): super() first, then store breed
    # override describe() and speak()

class Cat(Pet):
    # override speak() only

pets = []   # Dog Rex, Cat Mia, Pet Bit
# loop: print describe(), then an indented speak() line
`,
      solution: `class Pet:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def describe(self):
        return f"{self.name} is {self.age} years old"

    def speak(self):
        return "..."

class Dog(Pet):
    def __init__(self, name, age, breed):
        super().__init__(name, age)
        self.breed = breed

    def describe(self):
        return f"{self.name} is a {self.breed} and is {self.age} years old"

    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Pet):
    def speak(self):
        return f"{self.name} says Meow!"

pets = [
    Dog("Rex", 3, "beagle"),
    Cat("Mia", 5),
    Pet("Bit", 1),
]

for pet in pets:
    print(pet.describe())
    print(" ", pet.speak())
`,
      expectedOutput: `Rex is a beagle and is 3 years old
  Rex says Woof!
Mia is 5 years old
  Mia says Meow!
Bit is 1 years old
  ...`,
      concepts: ["inheritance", "super()", "method overriding"],
    },
    {
      id: "h-i4",
      tier: "intermediate",
      title: "Polymorphic shapes, one total",
      prompt:
        "Write three shape classes — Circle(radius) with area() = 3.14159 * radius ** 2, Square(side) with area() = side ** 2, and Rectangle(width, height) with area() = width * height — then a function total_area(shapes) that sums every shape's area() without ever checking types. Create the list [Circle(1), Square(3), Rectangle(2, 5)], print each shape as f\"{type(shape).__name__}: {shape.area():.2f}\", print the total as f\"total: {total:.2f}\", and finish with the number of shapes using len().",
      hint: "total_area is a plain function with a loop and a running total — no isinstance anywhere. type(shape).__name__ gives the class name as a string for printing.",
      starter: `class Circle:
    # __init__(radius), area()

class Square:
    # __init__(side), area()

class Rectangle:
    # __init__(width, height), area()

def total_area(shapes):
    # sum every shape's area() — no type checks

shapes = []   # Circle(1), Square(3), Rectangle(2, 5)
# print each shape's class name and area, the total, and the count
`,
      solution: `class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

def total_area(shapes):
    total = 0
    for shape in shapes:
        total += shape.area()
    return total

shapes = [Circle(1), Square(3), Rectangle(2, 5)]

for shape in shapes:
    print(f"{type(shape).__name__}: {shape.area():.2f}")

print(f"total: {total_area(shapes):.2f}")
print(f"number of shapes: {len(shapes)}")
`,
      expectedOutput: `Circle: 3.14
Square: 9.00
Rectangle: 10.00
total: 22.14
number of shapes: 3`,
      concepts: ["polymorphism", "duck typing", "type().__name__"],
    },

    // ---- advanced
    {
      id: "h-a1",
      tier: "advanced",
      title: "An abstract Shape contract with a shared report",
      prompt:
        "Use the standard library: from abc import ABC, abstractmethod. Build Shape(ABC) with __init__(name), TWO abstract methods area() and perimeter(), and a CONCRETE method report() returning f\"{self.name}: area={self.area():.2f}, perimeter={self.perimeter():.2f}\" — a shared method that calls the abstract ones. Subclass it: Square(side) and Circle(radius), each calling super().__init__(\"Square\") or super().__init__(\"Circle\") and implementing both abstract methods (Circle: 3.14159 for both formulas). Create [Square(3), Circle(2)] and print each shape's report(). The contract is real: a subclass missing one method would fail to instantiate.",
      hint: "report() lives ONCE on Shape and calls self.area() / self.perimeter() — it works for every subclass forever, because at call time each object runs its own implementations. Square perimeter: 4 * side; Circle: 2 * 3.14159 * radius.",
      starter: `from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, name):
        self.name = name

    # @abstractmethod area()
    # @abstractmethod perimeter()
    # report() -> one shared line calling BOTH abstract methods

class Square(Shape):
    # super().__init__("Square"), implement area and perimeter

class Circle(Shape):
    # super().__init__("Circle"), implement area and perimeter

shapes = []   # Square(3), Circle(2)
# print each shape's report()
`,
      solution: `from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def area(self):
        """Area in square units."""

    @abstractmethod
    def perimeter(self):
        """Boundary length in units."""

    def report(self):    # ready-made logic, shared by every subclass
        return f"{self.name}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

class Square(Shape):
    def __init__(self, side):
        super().__init__("Square")
        self.side = side

    def area(self):
        return self.side ** 2

    def perimeter(self):
        return 4 * self.side

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

    def perimeter(self):
        return 2 * 3.14159 * self.radius

shapes = [Square(3), Circle(2)]

for shape in shapes:
    print(shape.report())
`,
      expectedOutput: `Square: area=9.00, perimeter=12.00
Circle: area=12.57, perimeter=12.57`,
      concepts: ["abstract base classes", "@abstractmethod", "inheritance", "polymorphism"],
    },
    {
      id: "h-a2",
      tier: "advanced",
      title: "Diagnose and cure the shared-members bug",
      prompt:
        "The Team class below RUNS without any error — and produces wrong data: both teams claim the same members. This is the legendary mutable-class-attribute trap from lesson h-04, in the wild. Step 1: PREDICT the output on paper before running. Step 2: Run it and confirm the disease (the 'same list?' line is the diagnosis). Step 3: Cure it by moving the list into __init__ as an instance attribute AND giving Team a proper constructor that takes the name, so red = Team(\"Red\") replaces the late attribute assignments. The cured program must print the five lines shown below.",
      hint: "The bug: members = [] in the class body is ONE list every team shares. The cure: def __init__(self, name): with self.name = name AND self.members = [] — and the add() method stays exactly as it is.",
      starter: `class Team:
    members = []    # a class attribute... holding a list... what happens?

    def add(self, member):
        self.members.append(member)

    def __repr__(self):
        return f"Team({self.name!r}, {len(self.members)} members)"

red = Team()
blue = Team()

red.name = "Red"    # instance attribute, added after creation
blue.name = "Blue"

red.add("Ada")
red.add("Grace")
blue.add("Alan")

print(red)
print(blue)
print("same list?", red.members is blue.members)
`,
      solution: `class Team:
    def __init__(self, name):
        self.name = name          # instance: one per team
        self.members = []         # instance: one list per team (THE FIX)

    def add(self, member):
        self.members.append(member)

    def __repr__(self):
        return f"Team({self.name!r}, {len(self.members)} members)"

red = Team("Red")
blue = Team("Blue")

red.add("Ada")
red.add("Grace")
blue.add("Alan")

print(red)
print(blue)
print("same list?", red.members is blue.members)
print("combined roster:", red.members + blue.members)
`,
      expectedOutput: `Team('Red', 2 members)
Team('Blue', 1 members)
same list? False
combined roster: ['Ada', 'Grace', 'Alan']`,
      concepts: ["mutable class attributes", "debugging", "instance attributes", "is"],
    },
    {
      id: "h-a3",
      tier: "advanced",
      title: "Playlist with a full dunder kit",
      prompt:
        "Build a Playlist class whose constructor takes a name and a list of (title, seconds) tuples. Give it __repr__ returning f\"Playlist({self.name!r}, {len(self.songs)} songs)\", __len__ returning the number of songs, __eq__ comparing name AND songs (so two equal playlists built separately compare True), and a read-only property total_minutes that sums all the song seconds and returns round(total / 60, 1). Build road = Playlist(\"Road Trip\", [(\"Song A\", 210), (\"Song B\", 190), (\"Song C\", 200)]), an identical road_copy, and focus = Playlist(\"Focus\", [(\"Song D\", 300)]). Print road, len(road), road.total_minutes, road == road_copy, and road == focus — five lines in that order.",
      hint: "total_minutes: loop over the tuples (for _, seconds in self.songs: total += seconds), then round(total / 60, 1). __eq__ compares two things with and: self.name == other.name and self.songs == other.songs.",
      starter: `class Playlist:
    def __init__(self, name, songs):
        # store both

    # __repr__ -> f"Playlist({self.name!r}, {len(self.songs)} songs)"
    # __len__ -> number of songs
    # __eq__ -> same name AND same songs
    # @property total_minutes -> round(sum of seconds / 60, 1)

road = None    # Road Trip: 210 + 190 + 200 seconds
road_copy = None
focus = None

# print: road, len(road), total_minutes, road == road_copy, road == focus
`,
      solution: `class Playlist:
    def __init__(self, name, songs):
        self.name = name
        self.songs = songs          # a list of (title, seconds) tuples

    def __repr__(self):             # what print(playlist) shows
        return f"Playlist({self.name!r}, {len(self.songs)} songs)"

    def __len__(self):              # what len(playlist) returns
        return len(self.songs)

    def __eq__(self, other):        # what playlist == other checks
        return self.name == other.name and self.songs == other.songs

    @property
    def total_minutes(self):        # computed, read-only
        total = 0
        for _, seconds in self.songs:
            total += seconds
        return round(total / 60, 1)

road = Playlist("Road Trip", [("Song A", 210), ("Song B", 190), ("Song C", 200)])
road_copy = Playlist("Road Trip", [("Song A", 210), ("Song B", 190), ("Song C", 200)])
focus = Playlist("Focus", [("Song D", 300)])

print(road)
print("songs:", len(road))
print("total minutes:", road.total_minutes)
print("road == road_copy:", road == road_copy)
print("road == focus:", road == focus)
`,
      expectedOutput: `Playlist('Road Trip', 3 songs)
songs: 3
total minutes: 10.0
road == road_copy: True
road == focus: False`,
      concepts: ["__repr__", "__len__", "__eq__", "properties", "tuples"],
    },
    {
      id: "h-a4",
      tier: "advanced",
      title: "The inheritance debugger",
      prompt:
        "This inheritance program crashes before printing anything. Diagnose first, on paper: which attribute is missing, and which line should have created it? The crash is an AttributeError naming an attribute the PARENT's constructor normally creates — and the parent's constructor is never called. Fix it with ONE well-placed line (the lesson h-07 standard), then improve the override so the fixed program prints exactly the three lines shown: Ada's describe, Grace's describe (leads 2 people and earns 8000), and Grace's annual cost (salary * 12).",
      hint: "The fix is the first line of Manager's __init__: super().__init__(name, salary). Then extend the describe override to f\"{self.name} leads {len(self.team)} people and earns {self.salary}\".",
      starter: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name} earns {self.salary}"

class Manager(Employee):
    def __init__(self, name, salary, team):
        self.team = team      # BUG: the parent's construction work never happened

    def describe(self):
        return f"{self.name} leads {self.team}"

grace = Manager("Grace", 8000, ["Alan", "Kurt"])
print(grace.describe())
`,
      starterExpectError: "AttributeError: 'Manager' object has no attribute 'name'",
      solution: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name} earns {self.salary}"

class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)   # FIX 1: let Employee build name and salary
        self.team = team

    def describe(self):
        return f"{self.name} leads {len(self.team)} people and earns {self.salary}"

ada = Employee("Ada", 5000)
grace = Manager("Grace", 8000, ["Alan", "Kurt"])

print(ada.describe())
print(grace.describe())
print("grace's annual cost:", grace.salary * 12)
`,
      expectedOutput: `Ada earns 5000
Grace leads 2 people and earns 8000
grace's annual cost: 96000`,
      concepts: ["super()", "debugging", "inheritance", "method overriding"],
    },
  ],

  // =====================================================================
  // PART H ASSESSMENT — 8 questions
  // =====================================================================
  assessment: [
    {
      id: "h-as-1",
      prompt: "What does self refer to inside a method body?",
      options: [
        { text: "The object the method was called on — the same object, every time, for the whole call", correct: true, feedback: "Exactly: rex.speak() delivers rex as self. One call, one object, start to finish." },
        { text: "The class the method is defined in", correct: false, feedback: "The class is reached by name (Dog); self is always one specific object." },
        { text: "A new, empty object created for each call", correct: false, feedback: "A new object is only created at construction — and even then self is that new object, not a fresh one per call." },
      ],
      explanation: "self = the object the call is happening to. In a constructor, it is the object being built; in any other method, the object before the dot.",
    },
    {
      id: "h-as-2",
      prompt: "Predict the output: class A: def __init__(self): print(\"A builds\") — class B(A): def __init__(self): print(\"B starts\"); super().__init__(); print(\"B finishes\") — then B() runs. What prints, in order?",
      options: [
        { text: "B starts / A builds / B finishes", correct: true, feedback: "Correct: B's constructor starts, hands the work to A, which builds and prints, then B finishes." },
        { text: "A builds / B starts / B finishes", correct: false, feedback: "That would mean the parent runs first — but the child's body starts first and calls super() in the middle." },
        { text: "B starts / B finishes (A builds nothing)", correct: false, feedback: "Only if super().__init__() were missing — it is there, so A's constructor runs in the middle." },
      ],
      explanation: "The child starts, delegates upward with super(), then finishes: B starts, A builds, B finishes.",
    },
    {
      id: "h-as-3",
      prompt: "Predict the output: class Dog: species = \"canine\" — a = Dog(); b = Dog(); a.species = \"good boy\" — then print(b.species). What prints?",
      options: [
        { text: "good boy", correct: false, feedback: "That would require the assignment to change the class — assignments through an object write to the INSTANCE." },
        { text: "canine", correct: true, feedback: "Right: only a got a shadowing instance attribute. b still reads the untouched class attribute." },
        { text: "AttributeError: 'Dog' object has no attribute 'species'", correct: false, feedback: "b.species is found on the class through lookup — the class attribute still exists for everyone else." },
      ],
      explanation: "a.species = \"good boy\" creates an instance attribute on a alone. The class attribute is untouched, and b reads it: canine.",
    },
    {
      id: "h-as-4",
      prompt: "Predict the output: class Pet: def speak(self): return \"...\" — class Cat(Pet): def speak(self): return \"Meow\" — pets = [Pet(), Cat()] — then for p in pets: print(p.speak()). What prints?",
      options: [
        { text: "... / ...", correct: false, feedback: "That forgets the override: lookup starts at each object's own class, and the Cat object finds Cat's speak." },
        { text: "Meow / Meow", correct: false, feedback: "The plain Pet object still runs Pet's version — overrides only win for their own class's objects." },
        { text: "... / Meow", correct: true, feedback: "Exactly: the Pet runs Pet's speak, the Cat runs Cat's override. One call name, two behaviors." },
      ],
      explanation: "Each object runs its own class's version: Pet prints '...', Cat's override prints 'Meow'.",
    },
    {
      id: "h-as-5",
      prompt: "A class defines @property def balance(self) with no setter. What happens on acc.balance = 500?",
      options: [
        { text: "The balance silently becomes 500", correct: false, feedback: "Plain attributes accept assignment — properties only do if a setter exists." },
        { text: "AttributeError: property 'balance' of ... object has no setter", correct: true, feedback: "Correct — read-only means read-only, and the error names the problem exactly." },
        { text: "ValueError: balance cannot be negative", correct: false, feedback: "That is the message from the lesson's custom setter — a property with NO setter never gets that far." },
      ],
      explanation: "A property without a setter is read-only: assignment raises AttributeError and tells you no setter exists.",
    },
    {
      id: "h-as-6",
      prompt: "Shape inherits from ABC and marks area() with @abstractmethod. Why does Shape() raise TypeError?",
      options: [
        { text: "Abstract classes cannot be instantiated: an abstract method has no implementation to run", correct: true, feedback: "Exactly — Shape is a contract, and 'a shape in general' cannot compute an area. Only subclasses that implement the promise are instantiable." },
        { text: "ABC classes must be imported before use", correct: false, feedback: "The import happened — the failure is deliberate design, not a missing module." },
        { text: "Shape() is missing constructor arguments", correct: false, feedback: "The error would say so. This error names the abstract method — the contract is the problem." },
      ],
      explanation: "ABCs refuse instantiation on purpose: the unimplemented abstract method is named in the TypeError, at creation time.",
    },
    {
      id: "h-as-7",
      prompt: "make_it_quack(thing) returns thing.quack(). You call it with a Tree instance that has no quack method. What happens?",
      options: [
        { text: "AttributeError at the moment of the call, naming 'Tree' and 'quack'", correct: true, feedback: "Right — duck typing trusts first, fails precisely: the error names the class and the missing method." },
        { text: "Nothing — Python skips missing methods and returns None", correct: false, feedback: "Missing methods never return None silently; the call raises AttributeError loudly." },
        { text: "TypeError, because Tree is not a Duck subclass", correct: false, feedback: "No inheritance check ever runs — duck typing does not care about types, only about the method existing." },
      ],
      explanation: "Duck typing fails at call time with an AttributeError that tells you exactly what is missing on which class.",
    },
    {
      id: "h-as-8",
      prompt: "You need a running count of every Robot ever created, visible as Robot.count. Where does the counter live and how is it updated?",
      options: [
        { text: "An instance attribute self.count = 0 in __init__, updated with self.count += 1", correct: false, feedback: "Each robot would count itself as 1 — instance attributes are per-object and never accumulate." },
        { text: "A class attribute count = 0, updated as Robot.count += 1 inside __init__", correct: true, feedback: "Exactly — one shared counter on the class, deliberately updated through the class name by every constructor." },
        { text: "A class attribute count = 0, updated with self.count += 1", correct: false, feedback: "Close: self.count += 1 reads the class value but WRITES an instance attribute — the shared total stays 0." },
      ],
      explanation: "Shared state lives on the class: count = 0 in the class body, Robot.count += 1 (the class name!) in every constructor.",
    },
  ],

  // =====================================================================
  // PART H MINI PROJECT
  // =====================================================================
  project: {
    title: "The Personal Media Library",
    brief:
      "You will build a small but complete media library system — the first program in this course where several classes cooperate: a MediaItem base class, Movie and Book subclasses (a real inheritance chain), and a Library class that manages a list of items (composition). The system tracks titles and years, lends items out with availability checking, refuses to double-lend, searches by title, and prints a formatted catalog plus a summary report. Every class gets a readable __repr__, availability is exposed through a read-only property, and the whole design uses exactly the tools of this part: constructors, super(), overrides, properties, dunder methods, and polymorphism. When it runs, you will have a genuine little system — the shape of every music app, bookstore, and streaming catalog you have ever used.",
    requirements: [
      "At least three classes: MediaItem (base), Movie and Book (subclasses inheriting from it) — one real inheritance chain",
      "MediaItem: constructor storing title and year and an internal _borrowed flag starting False; a __repr__ returning f\"{type(self).__name__}({self.title!r}, {self.year})\"",
      "A read-only property `status` on MediaItem that returns \"borrowed\" or \"available\" from the internal flag",
      "Movie and Book each call super().__init__(title, year), add their own attributes (director and minutes / author and pages), and override describe() with their own one-line format",
      "MediaItem has borrow() and give_back() methods that flip the flag with sensible messages, and refuse double-borrowing and double-returning",
      "A Library class with a name and an items list: add(item), remove(title), search(text) returning a list of matches (case-insensitive, substring match on title), borrow(title) that delegates to the item, __len__, and a __repr__ of its own",
      "A formatted catalog print: a header line with the library name and item count, then one line per item as f\"  {item.describe()} [{item.status}]\"",
      "A demo script at the bottom that exercises everything: adds at least 2 movies and 2 books, prints the catalog, borrows one item twice (second call refused), returns it, searches for a substring, removes one item, and ends with a summary report counting items, movies, books, and available items",
    ],
    steps: [
      "Step 1 — Build MediaItem: constructor with title, year, and self._borrowed = False; then the __repr__ using type(self).__name__ so subclasses print correctly for free. Test it alone by printing one item.",
      "Step 2 — Add the status property: @property def status(self): returning \"borrowed\" or \"available\". Print item.status to confirm it reads like an attribute.",
      "Step 3 — Add borrow() and give_back(): each checks the flag first (already borrowed? was never borrowed?) and returns a message; otherwise flips the flag and confirms. Test the happy path and the refusal.",
      "Step 4 — Subclass it: Movie with director and minutes, Book with author and pages. Each calls super().__init__(title, year) first, stores its extras, and overrides describe() with its own format. Print one of each and check the __repr__ shows Movie(...) and Book(...).",
      "Step 5 — Build Library: name plus an items list in __init__; then add(item) that appends and returns a confirmation using the item's __repr__.",
      "Step 6 — Library behavior: remove(title) that finds and removes by exact title (with a not-found message), search(text) returning a case-insensitive list of matches, borrow(title) that finds the item and delegates to its borrow(), and __len__.",
      "Step 7 — Print functions: print_catalog() with the header line and one formatted line per item using describe() and status; print_summary() counting items, movies, and books (type(item) is Movie / type(item) is Book) and how many are available.",
      "Step 8 — The demo script: add your movies and books, print the catalog, borrow one item twice (watch the refusal), give it back, search a substring and print the matches, remove one item, print the catalog again, and finish with the summary report. Run it top to bottom and read every line before celebrating.",
    ],
    starter: `# ============================================
# The Personal Media Library -- Part H project
# Works in the browser playground or as a file.
# ============================================

class MediaItem:
    """The base class: title, year, and borrowing state."""

    def __init__(self, title, year):
        self.title = title
        self.year = year
        self._borrowed = False   # every item starts available

    # TODO 1: __repr__ returning
    #   f"{type(self).__name__}({self.title!r}, {self.year})"

    # TODO 2: a read-only property 'status' returning
    #   "borrowed" if self._borrowed else "available"

    # TODO 3: borrow() -- if already borrowed, return a refusal
    #   message; otherwise set the flag True and confirm

    # TODO 4: give_back() -- if NOT borrowed, say so;
    #   otherwise set the flag False and confirm


class Movie(MediaItem):
    """A film: a media item with a director and a runtime."""

    # TODO 5: __init__(self, title, year, director, minutes):
    #   super().__init__(title, year), then store both extras

    # TODO 6: describe() returning
    #   f"{self.title} ({self.year}) - film by {self.director}, {self.minutes} min"
    pass


class Book(MediaItem):
    """A book: a media item with an author and a page count."""

    # TODO 7: __init__ with author and pages, and a describe() of
    #   your own format, mentioning the author and the pages
    pass


class Library:
    """Manages a collection of media items (composition)."""

    def __init__(self, name):
        self.name = name
        self.items = []

    # TODO 8: add(item) -> append and return f"Added {item!r}"
    # TODO 9: remove(title) -> remove by exact title, or a
    #   not-found message
    # TODO 10: search(text) -> list of items whose title contains
    #   the text, case-insensitive
    # TODO 11: borrow(title) -> find the item, delegate to its
    #   borrow() (or a not-found message)
    # TODO 12: __len__ -> number of items
    # TODO 13: print_catalog() -> header with name and count, then
    #   one line per item: f"  {item.describe()} [{item.status}]"
    # TODO 14: print_summary() -> counts of items, movies, books,
    #   and available items


# --- the demo script (extend it as you build) ---

lib = Library("My Shelf")
print(lib.name, "is ready --", len(lib.items), "items so far")

# TODO 15: add at least 2 Movies and 2 Books, print the catalog,
# borrow one item twice (the second call must refuse), give it
# back, search for a substring, remove one item, print the catalog
# again, and finish with the summary report.
`,
    concepts: [
      "classes and constructors",
      "inheritance with super()",
      "method overriding",
      "read-only properties",
      "__repr__ and __len__",
      "composition (a class holding objects of other classes)",
      "polymorphism (describe() across Movie and Book)",
    ],
    extension:
      "Level up: give MediaItem a `rating` (1 to 5, validated by a property setter that raises ValueError outside the range), include the rating in describe() and in the catalog lines, and add a `sorted by year` listing using sorted(lib.items, key=lambda item: item.year) — a lambda key, exactly like the sorting you learned in Part D. Print the sorted catalog with a 'BY YEAR' header under the normal one.",
  },
};
