/**
 * Lesson e-02 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_02: ClassicalLesson = {

  slug: "e-02",
  title: "Planning Domains and Problems",
  minutes: 30,
  summary:
    "Domain versus problem: reusable operator libraries and the instance that points them at a world.",
  kind: "concept",
  objectives: [
    "State the domain/problem split: operators and predicate vocabulary in one half, objects, initial state and goal in the other",
    "Read a simplified PDDL domain and problem file as an informed consumer",
    "Ground typed operator templates over a problem's object constants, and predict the ground count",
    "Author a complete problem instance: typed objects, a closed-world initial state, a goal conjunction",
    "Verify a plan by replay: every precondition checked, every intermediate state accounted for",
  ],
  why: "Lesson e-01 built a world and its physics in one breath: the move operators were generated for the blocks A, B, C and the Table, and the Sussman start state sat beside them in a single program. That coupling is fine for a demonstration and fatal for a field. The physics of a world — which actions exist, what each requires and changes — is reusable knowledge, written once and shared by every task in that world; where things stand, and where they must end up, is data about one situation that changes with every delivery run. Classical planning cuts exactly between the two: the DOMAIN is an operator library over a typed predicate vocabulary; the PROBLEM is an instance that supplies object constants, an initial state and a goal. The cut is why benchmark domains ship as libraries with hundreds of attached problems, why PDDL exists as the exchange format between domain authors and engine builders, and why the same planner runs blocks world, logistics and factory scheduling after a file swap. This lesson makes the separation executable: domain as data, problem as data, grounding as a function, and a replay verifier that proves a four-step delivery plan step by step — then refuses a plausible plan that skips a license.",
  blocks: [
    {
      kind: "text",
      text: "Lesson e-01 built a world and its physics in one breath: the move operators were generated for the blocks A, B, C and the Table, and the Sussman start state sat beside them in a single program. That coupling is fine for a demonstration and fatal for a field. The physics of a world — which actions exist, what each requires and changes — is reusable knowledge, written once and shared by every task in that world; where things stand now, and where they must end up, is data about one situation. Classical planning cuts exactly between the two. The **domain** is the library: operator templates (each still the e-01 triple — preconditions, add list, delete list) over a predicate vocabulary. The **problem** is the instance: the objects, the initial state, the goal. Everything downstream — grounding today, the searches of e-03, the graphs of e-05 — consumes the two halves through this seam.",
    },
    {
      kind: "definition",
      term: "planning domain",
      informal:
        "The reusable half of a planning task: a vocabulary of typed predicates plus a set of operator templates — the physics of a kind of world, containing no fact about any particular situation.",
      formal:
        "\\text{domain } D = (\\text{types}, \\text{predicates}, \\text{operators})",
      why: "The domain is a library: authored once, certified once, and instantiated by every problem that shares its physics — which is why benchmark domains ship with hundreds of attached instances.",
    },
    {
      kind: "definition",
      term: "planning problem",
      informal:
        "The instance: a domain, a set of typed object constants, the initial state s0 — every fact true at step 0 — and the goal G, a conjunction of ground facts that some plan must make true.",
      formal:
        "\\text{problem } P = (D, \\text{objects}, s_0, G)",
      why: "Problems are data, not code: a planner consumes them interchangeably, and solvability is a property of the pair — neither half alone says whether a plan exists.",
    },
    {
      kind: "math",
      title: "What the problem fixes, formally",
      displays: [
        { expr: "s_0 = \\text{init}", label: "the initial state — an ordinary state, complete and closed-world" },
        { expr: "G \\subseteq s_t", label: "solved at step t — the goal test" },
      ],
      caption:
        "Both of the problem's contributions are ordinary e-01 objects. s0 is a set of ground propositions — complete, because a state is exactly the true facts; closed-world, because absence from the set IS falsity. G is a conjunction of ground facts, and the test is the same subset test that licenses actions: pre(a) ⊆ s asks 'does the state contain the action's requirements', G ⊆ s_t asks 'does it contain the plan's purpose'. A solving state may hold any number of extra facts — containment, never equality.",
    },
    {
      kind: "text",
      text: "This lesson's running example is the smallest delivery world: one truck `t`, one package `p`, two locations `depot` and `home`. Every name in it is an **object constant** with a type — t - truck, p - package, depot - location, home - location — and the type annotations look like documentation while working like a filter. The step that joins the two halves is **grounding**: instantiating the domain's operator templates over the problem's object constants. An untyped drive(x, y, z) over this four-object world ranges over 4 · 4 · 4 = 64 triples, including a depot driving itself to a package. Typed drive(t - truck, a - location, b - location) ranges over 1 · 2 · 2 = 4. The same arithmetic runs through the predicate vocabulary — `at` grounds to 4 facts typed, 16 untyped — and the operator table compounds it: 192 ground operators untyped for this tiny world, 8 typed. That is the count before any search starts, and the ground operators grounding produces are exactly what Lesson e-03's progression search consumes: states, licensed ground actions, successors — the e-01 loop, mass-produced from a library.",
    },
    {
      kind: "table",
      title: "What typing refuses: grounding with and without types",
      headers: ["Operator template", "Untyped groundings", "Typed groundings", "Nonsense filtered out"],
      rows: [
        ["drive(x, y, z)", "4 · 4 · 4 = 64", "1 · 2 · 2 = 4", "a depot driving itself to p"],
        ["load(x, y, z)", "4 · 4 · 4 = 64", "1 · 1 · 2 = 2", "loading home into depot"],
        ["unload(x, y, z)", "4 · 4 · 4 = 64", "1 · 1 · 2 = 2", "unloading depot from home"],
      ],
      caption:
        "Totals for the four-object world: 192 ground operators untyped, 8 typed — the type system refuses 184 of them before any search runs. Predicates feel the same filter: at(x, y) grounds 16 → 4, in(x, y) 16 → 1. Two of drive's four survivors (a = b) are licensed no-ops; real planners filter them out or simply never choose them.",
    },
    { kind: "heading", text: "A second domain: LOGISTICS" },
    {
      kind: "table",
      title: "LOGISTICS (road fragment), three operators",
      headers: ["Operator", "Preconditions", "Add", "Delete"],
      rows: [
        ["load(p, t, l)", "at(p,l), at(t,l)", "in(p,t)", "at(p,l)"],
        ["unload(p, t, l)", "in(p,t), at(t,l)", "at(p,l)", "in(p,t)"],
        ["drive(t, a, b)", "at(t,a)", "at(t,b)", "at(t,a)"],
      ],
      caption:
        "The same table style as e-01's move operators: conjunctive preconditions, exhaustive edits. Read the persistence discipline: drive touches only the truck's at-fact — a package riding along (in(p, t)) is untouched because its location IS the truck's; load and unload never move the truck. The full LOGISTICS benchmark adds cities, airplanes and airports; this road-only fragment is enough to deliver packages — and the PDDL sketch below writes both halves as the field does.",
    },
    {
      kind: "code",
      title: "The same two halves in PDDL — simplified illustration, not a tutorial",
      lang: "text",
      code: `;; domain file -- the reusable physics (simplified sketch)
(define (domain logistics-road)
  (:types truck package location)
  (:predicates (at ?obj - (either truck package) ?loc - location)
               (in  ?pkg - package ?truck - truck))
  (:action load
     :parameters (?pkg - package ?truck - truck ?loc - location)
     :precondition (and (at ?pkg ?loc) (at ?truck ?loc))
     :effect (and (not (at ?pkg ?loc)) (in ?pkg ?truck)))
  ;; drive and unload have the same shape -- a table of three, not a parser
  )

;; problem file -- the instance (simplified sketch)
(define (problem deliver-one)
  (:domain logistics-road)
  (:objects t - truck   p - package   depot home - location)
  (:init (at t depot) (at p home))     ; complete: closed-world
  (:goal (at p depot)))                ; a conjunction, one conjunct here`,
    },
    {
      kind: "example",
      title: "Authoring the delivery problem, end to end",
      problem:
        "One truck t stands at the depot; one package p sits at home; the goal is p delivered to the depot. Author the problem against the LOGISTICS domain and name a plan a replay verifier should accept.",
      steps: [
        { text: "Take the domain unchanged.", detail: "The scenario needs no new physics: at, in and the three operators from the table cover driving, loading and unloading. Reusing the library is the point of having one." },
        { text: "Declare the objects: t - truck, p - package, depot - location, home - location.", detail: "Four constants, three types — the only names grounding will ever substitute into the templates." },
        { text: "Write the initial state complete: s0 = {at(t, depot), at(p, home)}.", detail: "Both facts and nothing else. Closed-world makes in(p, t) false and the truck nowhere else; a 'partial' init here would be a false claim about step 0." },
        { text: "Write the goal as a conjunction: G = {at(p, depot)}.", detail: "One conjunct in this instance. Note what it does not say: nothing about the truck's final position — the test is containment, extra facts allowed." },
        { text: "Read off the plan: drive(t,depot,home), load(p,t,home), drive(t,home,depot), unload(p,t,depot).", detail: "Each step's preconditions are visible in the previous state — and the program below replays all four, checking every license and printing every state." },
      ],
      result:
        "Four lines of problem data against an untouched domain, solved by a four-step sequence of ground operators — the authoring effort went into the instance, not the physics.",
    },
    {
      kind: "pythonImpl",
      title: "Domain as data, problem as data, plan as proof",
      intent:
        "Make the separation executable: DOMAIN and PROBLEM are two dicts, grounding instantiates the templates over the typed objects, and a replay checker applies a four-step delivery plan — verifying every precondition and printing every state, then refusing a plausible plan that skips a license.",
      code: `from itertools import product

# -- DOMAIN: the reusable library. Data, not code. Atom templates are
# -- (predicate, arg, ...) where args are parameter variables.
DOMAIN = {
    "name": "logistics-road",
    "operators": [
        {"name": "load",
         "params": [("p", "package"), ("t", "truck"), ("l", "location")],
         "pre": [("at", "p", "l"), ("at", "t", "l")],
         "add": [("in", "p", "t")],
         "del": [("at", "p", "l")]},
        {"name": "unload",
         "params": [("p", "package"), ("t", "truck"), ("l", "location")],
         "pre": [("in", "p", "t"), ("at", "t", "l")],
         "add": [("at", "p", "l")],
         "del": [("in", "p", "t")]},
        {"name": "drive",
         "params": [("t", "truck"), ("a", "location"), ("b", "location")],
         "pre": [("at", "t", "a")],
         "add": [("at", "t", "b")],
         "del": [("at", "t", "a")]},
    ],
}

# -- PROBLEM: the instance. Object constants, the complete initial
# -- state, the goal conjunction. No physics lives here.
PROBLEM = {
    "name": "deliver-one",
    "objects": {"t": "truck", "p": "package",
                "depot": "location", "home": "location"},
    "init": [("at", "t", "depot"), ("at", "p", "home")],
    "goal": [("at", "p", "depot")],
}

def subst(template, binding):
    """('at','p','l') + {p:'p', l:'home'} -> 'at(p,home)'.
    Arguments not in the binding (object constants) pass through
    unchanged -- so the same function grounds templates and formats
    the problem's init/goal facts."""
    return template[0] + "(" + ",".join(binding.get(x, x) for x in template[1:]) + ")"

def ground(op, objects):
    """Instantiate one template over every type-respecting tuple of
    object constants -- the domain/problem seam, as a function."""
    domains = [[o for o, ty in objects.items() if ty == typ]
               for _, typ in op["params"]]
    for values in product(*domains):
        binding = {v: o for (v, _), o in zip(op["params"], values)}
        name = op["name"] + "(" + ",".join(values) + ")"
        pre = {subst(a, binding) for a in op["pre"]}
        add = {subst(a, binding) for a in op["add"]}
        delete = {subst(a, binding) for a in op["del"]}
        yield name, pre, add, delete

GROUND = {n: (pre, add, dele) for op in DOMAIN["operators"]
          for n, pre, add, dele in ground(op, PROBLEM["objects"])}

def fmt(facts):
    return "{" + ", ".join(sorted(facts)) + "}"

def replay(plan):
    """The verifier: apply ground actions in order, checking EVERY
    precondition (e-01's subset test) and printing each state."""
    state = {subst(f, {}) for f in PROBLEM["init"]}
    print("s0 =", fmt(state))
    for i, name in enumerate(plan, 1):
        if name not in GROUND:
            print(f"step {i}: {name} is not a ground operator of this domain")
            return
        pre, add, delete = GROUND[name]
        if not pre <= state:
            print(f"step {i}: {name} REFUSED, missing {fmt(pre - state)}")
            return
        state = (state - delete) | add      # e-01's successor function
        print(f"step {i}: {name} -> s{i} = {fmt(state)}")
    goal = {subst(g, {}) for g in PROBLEM["goal"]}
    print("final state:", fmt(state))
    print("goal", fmt(goal), "satisfied:", goal <= state)

print("domain", DOMAIN["name"], "-", len(DOMAIN["operators"]), "operator templates")
for op in DOMAIN["operators"]:
    print("   ", op["name"] + "(" + ",".join(v + ":" + t for v, t in op["params"]) + ")")
print("problem", PROBLEM["name"], "- objects:",
      ", ".join(o + ":" + ty for o, ty in PROBLEM["objects"].items()))
print("grounding over", len(PROBLEM["objects"]), "typed objects ->",
      len(GROUND), "ground operators:")
for n in sorted(GROUND):
    print("   ", n)
print()
print("replay 1: the delivery plan (drive out, load, drive back, unload)")
replay(["drive(t,depot,home)", "load(p,t,home)",
        "drive(t,home,depot)", "unload(p,t,depot)"])
print()
print("replay 2: the checklist plan (load before the truck has arrived)")
replay(["load(p,t,home)", "drive(t,depot,home)",
        "load(p,t,home)", "unload(p,t,depot)"])`,
      output: `domain logistics-road - 3 operator templates
    load(p:package,t:truck,l:location)
    unload(p:package,t:truck,l:location)
    drive(t:truck,a:location,b:location)
problem deliver-one - objects: t:truck, p:package, depot:location, home:location
grounding over 4 typed objects -> 8 ground operators:
    drive(t,depot,depot)
    drive(t,depot,home)
    drive(t,home,depot)
    drive(t,home,home)
    load(p,t,depot)
    load(p,t,home)
    unload(p,t,depot)
    unload(p,t,home)

replay 1: the delivery plan (drive out, load, drive back, unload)
s0 = {at(p,home), at(t,depot)}
step 1: drive(t,depot,home) -> s1 = {at(p,home), at(t,home)}
step 2: load(p,t,home) -> s2 = {at(t,home), in(p,t)}
step 3: drive(t,home,depot) -> s3 = {at(t,depot), in(p,t)}
step 4: unload(p,t,depot) -> s4 = {at(p,depot), at(t,depot)}
final state: {at(p,depot), at(t,depot)}
goal {at(p,depot)} satisfied: True

replay 2: the checklist plan (load before the truck has arrived)
s0 = {at(p,home), at(t,depot)}
step 1: load(p,t,home) REFUSED, missing {at(t,home)}`,
      walkthrough: [
        "DOMAIN and PROBLEM never touch: no operator template mentions depot, home, t or p; no problem field redefines physics. Swap PROBLEM for a ten-truck fleet and DOMAIN is byte-identical.",
        "subst() is grounding's one trick — replace parameter variables with object constants, pass constants through — so the same function formats init facts (no variables) and template lists (all variables).",
        "ground() takes the type-respecting Cartesian product per parameter: three templates over four typed objects give eight ground operators — the table's count, against 192 untyped.",
        "replay() is e-01's apply(), run as a court: the subset test pre(a) ⊆ s licenses or refuses (with the missing facts named), then (s − del) ∪ add advances the state. The final line is the goal test — the same subset test, one level up.",
        "Replay 2 is why verifiers exist: the checklist ordering — load before the truck has arrived — dies at step 1, naming exactly what is missing. A plan is a claim; replay is the proof.",
      ],
      project:
        "The Part E project's replay verifier is this replay() hardened, and its problem suite is a folder of PROBLEM-shaped data over one domain library.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why planners swap domains without engine rewrites",
      text: "Grounding, search, heuristics, verification — none of them reads a domain's MEANING; they read its data shape: templates, lists, objects. That layering is the industrial trick. The engine that schedules a factory floor is the engine that delivers packages after a file swap, because 'what the world can do' arrives as a table of triples, never as code wired into the search. In the program above, ground() and replay() are domain-agnostic: hand them e-01's blocks-world templates — move(x, y, z) with the Table conventions — and they verify stacking plans without a line changed. Knowledge as data, engines as consumers.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-02-e1",
      exerciseKind: "predict-output",
      prompt:
        "The program builds GROUND over the objects t, p, depot, home. Add one entry to PROBLEM's objects — a second truck t2 - truck — and change nothing else. How many ground operators does GROUND now contain? Work it from the template arities and type counts, or add the line and run it. Type the number.",
      expectedOutput: "16",
      solution:
        "16. drive: 2 trucks · 2 · 2 = 8 (was 4); load: 1 package · 2 trucks · 2 locations = 4 (was 2); unload likewise 4 (was 2). Total 8 + 4 + 4 = 16 — every truck-typed parameter doubles the count.",
      explanation:
        "Grounding is multiplicative in each parameter's type domain, so growth is linear per added object. Untyped, the same edit takes every template from 4^3 = 64 to 5^3 = 125 — polynomial in EVERYTHING, which is the explosion typing exists to cut.",
      concepts: ["grounding", "typing"],
    },
    {
      kind: "exercise",
      id: "e-02-e2",
      exerciseKind: "concept-check",
      prompt:
        "The depot now requires that a truck carry at most one package at a time. Where does that constraint live?",
      options: [
        { text: "In the problem: add a fact to init saying the truck is empty", correct: false, feedback: "init seeds one instance; the constraint must bind in every logistics task ever written against the domain — and a seed fact alone changes nothing until operators maintain it." },
        { text: "In the domain: load gains empty(t) in its preconditions and delete list, unload gains empty(t) in its add list — the problem merely seeds empty(t) in init", correct: true, feedback: "Correct — capacity is physics, and physics lives in operator lists. The invariant 'at most one in-fact per truck' is enforced by every load refusing a loaded truck; the instance's only job is the seed." },
        { text: "In the planner engine: add a capacity check to the search", correct: false, feedback: "That breaks the layering this lesson is about — the engine reads templates as data, and a domain-specific check turns a general planner into a logistics-only one." },
        { text: "Nowhere — the types already imply it, since in(p, t) takes one package", correct: false, feedback: "Typing constrains what a fact CAN MEAN, not how many facts hold: in(p1, t) and in(p2, t) are both perfectly well-typed." },
      ],
      solution:
        "Physics in the domain, seed in the problem, nothing in the engine: load(p,t,l) gets empty(t) in pre and del; unload(p,t,l) gets empty(t) in add; every problem file seeds empty(t) for each truck in init.",
      explanation:
        "The honest cost of the fix: revising a domain ripples into its problem files — an old instance without empty(t) in init now says, closed-world, that its truck is not empty, so no load is ever licensed. Domain libraries are versioned for exactly this reason.",
      concepts: ["domain authoring", "domain/problem separation"],
    },
  ],
  terms: [
    {
      term: "planning domain",
      definition:
        "The reusable half of a planning task: a vocabulary of typed predicates plus a set of operator templates — the physics of a kind of world, with no facts about any particular situation.",
    },
    {
      term: "planning problem",
      definition:
        "The instance: a domain, a set of typed object constants, the initial state and a goal conjunction — everything that changes from one task to the next in the same world.",
    },
    {
      term: "initial state",
      definition:
        "The complete set of ground facts true at step 0 (s0). Closed-world: any fact not listed is false, not unknown.",
    },
    {
      term: "object constant",
      definition:
        "A named individual of a given type (t - truck, depot - location), supplied by the problem; the values grounding substitutes into the domain's parameter variables.",
    },
    {
      term: "grounding",
      definition:
        "Instantiating operator templates over a problem's object constants, respecting types — the step that turns a domain library into the ground operators a search consumes.",
    },
  ],
  mistakes: [
    {
      mistake: "Putting physics in the problem file, or instance data in the domain.",
      why: "An operator that names depot works for exactly one problem; an initial state that encodes what actions do duplicates the operator lists and drifts out of sync the first time either is edited.",
      fix: "Apply the test: if the statement could hold in a DIFFERENT instance of the same world, it is physics and belongs in the domain; if it names particular objects or says what is true right now, it belongs in the problem.",
    },
    {
      mistake: "Writing a partial initial state.",
      why: "STRIPS states are sets of true facts, and the closed world reads every unlisted fact as false. An init that 'forgets' the truck's position does not leave it unknown — it asserts the truck is nowhere, and preconditions start failing for reasons the author never wrote down.",
      fix: "Write init as a snapshot: for every object, say where it is or what holds of it, then diff the result against the predicate vocabulary.",
    },
    {
      mistake: "Treating the goal as a picture of the final state.",
      why: "The goal test is G ⊆ s — containment, not equality. The delivery plan ends with at(t, depot) true alongside the goal fact at(p, depot); demanding an exact match makes most solvable tasks unsolvable.",
      fix: "Read the goal as a checklist of conjuncts. Extra facts in the final state are not noise; they are the world the plan actually reached.",
    },
  ],
  takeaways: [
    "A planning domain is a reusable operator library over a typed predicate vocabulary; a problem is an instance — objects, initial state, goal — that points the library at one world.",
    "Grounding instantiates templates over the problem's objects: three logistics templates over four objects give eight ground operators; typing refuses the other 184 the untyped world would generate.",
    "The initial state is complete and closed-world: unlisted facts are false, not unknown — a partial init is a false init.",
    "Goals are conjunctions tested by containment, G ⊆ s_t — the same subset test that licenses actions, one level up; extra facts are always allowed.",
    "The layering is load-bearing: engines consume ground operators as data, which is why planners swap domains without rewrites — and e-03's progression search consumes exactly the ground operators grounding produces.",
  ],
  quiz: [
    {
      id: "e-02-q1",
      prompt: "Where do the ground operators a planner actually searches over come from?",
      options: [
        { text: "The problem file lists them, one per action", correct: false, feedback: "The problem lists objects, init and goal — never actions. Per-problem action listings would defeat reuse entirely." },
        { text: "Grounding: the domain's templates instantiated over the problem's object constants, respecting types", correct: true, feedback: "Correct — templates times type-respecting object tuples: three logistics templates over four objects give the eight ground operators the program prints." },
        { text: "The planner engine hardcodes them for known domains", correct: false, feedback: "Exactly backwards: engines are domain-generic and read operators as data — the layering that lets one planner run many domains." },
        { text: "The initial state's facts, reinterpreted as actions", correct: false, feedback: "Facts and actions are different categories: at(t, depot) describes a state; drive(t, a, b) edits one. No bridge reinterprets between them." },
      ],
      explanation:
        "Grounding is the compiler step between library and search: the domain says drive takes a truck and two locations, the problem says which trucks and locations exist, and the product is the action set.",
    },
    {
      id: "e-02-q2",
      prompt:
        "PROBLEM's init lists {at(t, depot), at(p, home)} and nothing else. What does the formalism believe about in(p, t) at step 0?",
      options: [
        { text: "False — initial states are complete and closed-world: an unlisted fact is false", correct: true, feedback: "Correct — a state is the set of TRUE facts (e-01's data structure); absence from the set is falsity, not mystery. in(p, t) becomes true only when some load makes it so." },
        { text: "Unknown — three-valued until sensing resolves it", correct: false, feedback: "Three-valued initial states belong to richer formalisms; classical STRIPS states commit to a truth value for every ground fact." },
        { text: "True by default, since it is type-correct", correct: false, feedback: "Type-correctness licenses the POSSIBILITY of a fact, never its truth; truth is membership in the state set." },
        { text: "Undetermined until grounding runs", correct: false, feedback: "Grounding manufactures actions, not facts. The init's meaning is fixed the moment it is written." },
      ],
      explanation:
        "Closed-world init is what lets the replay verifier be a checker rather than a prover: at step 0, every fact's truth value is known by lookup.",
    },
    {
      id: "e-02-q3",
      prompt: "The goal of a classical problem is best stated as:",
      options: [
        { text: "A picture of the final state, which the reached state must equal", correct: false, feedback: "Far too strong: the delivery plan ends with at(t, depot) true alongside the goal — extra facts are always allowed." },
        { text: "A conjunction of ground facts; success is the subset test G ⊆ s_t — the same test that licenses actions, one level up", correct: true, feedback: "Correct — licensing asks whether the state contains the action's requirements; the goal asks whether it contains the plan's purpose. All conjuncts, no extras required, no order implied." },
        { text: "A disjunction: any one listed fact suffices", correct: false, feedback: "Classical goals are conjunctive; disjunctions belong to richer goal languages (and awkward compilations)." },
        { text: "An operator sequence whose optimality the planner must confirm", correct: false, feedback: "The goal says nothing about HOW — finding the sequence is the planner's whole job, and optimality is a separate promise (e-03, e-04)." },
      ],
      explanation:
        "G ⊆ s_t: the checklist semantics — one line of set arithmetic, reusing e-01's licensing test verbatim.",
    },
  ],

};
