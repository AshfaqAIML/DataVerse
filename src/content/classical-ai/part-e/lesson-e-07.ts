/**
 * Lesson e-07 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_07: ClassicalLesson = {

  slug: "e-07",
  title: "HTN Planning",
  minutes: 30,
  summary:
    "Plan by refining abstract tasks with methods instead of searching over states — why real systems love it.",
  kind: "concept",
  objectives: [
    "Separate primitive tasks (e-01 operators) from abstract tasks (TO-DOs that only methods can expand)",
    "Read a method as a recipe: abstract task, subtask network, ordering constraints — plus its precondition",
    "Decompose arrange-trip to a fully primitive network and replay it against states, e-01 discipline",
    "Explain why HTN search runs over decompositions and what steers it in place of a distance-to-goal heuristic",
    "State the expressiveness price: strictly more than STRIPS, semi-decidable in general, decidable under restrictions",
  ],
  why: "STRIPS answers 'what must be true'; organizations run on 'how we do things'. A bakery does not think 'achieve bread-displayed' — it proofs, bakes, shelves, in that order, because that is the recipe that works. Hierarchical task networks put that procedural knowledge where it belongs: in the domain, written as methods — recipes that refine abstract TO-DOs into networks of smaller tasks until only executable primitives remain, each primitive a plain e-01 operator. The gain is not merely speed: the search runs over decomposition choices instead of states, a space structured by encoded expertise rather than by distance-to-goal heuristics — which is why the planners with the longest working lives in this story, O-Plan and SHOP2, are HTN systems. The bill arrives with the power: HTNs are strictly more expressive than STRIPS, and general HTN planning is only semi-decidable. This lesson builds the travel domain, decomposes it by hand, and states both the power and the price in plain words.",
  blocks: [
    {
      kind: "text",
      text: "Lesson e-01 gave an action its exact shape: an operator is (name, pre, add, del), a state is a set of ground propositions, and Next(s, a) is set arithmetic once the license holds. Hierarchical task network (HTN) planning leaves that floor untouched and builds a floor above it. Tasks come in two kinds. A **primitive task** IS an operator — buy-ticket will one day check at(home) and add ticket exactly the way move(x, y, z) checked and edited. An **abstract task** — get-to-airport, arrange-trip — is a TO-DO: it names WHAT must be accomplished, has no preconditions, no effects, and never touches a state. The only thing that can ever happen to an abstract task is expansion by a method. The planner's working object is therefore not a single state but a **task network**: a partially ordered set of tasks, some primitive, some abstract, refined step by step until nothing abstract remains — and what is left, run in any order the constraints allow, is the plan.",
    },
    {
      kind: "definition",
      term: "hierarchical task network (HTN)",
      informal:
        "The planner's evolving TO-DO list: a set of tasks — primitive and abstract together — plus ordering constraints saying which must precede which. The initial network is the top task alone; refinement replaces abstract tasks until only primitives remain.",
      formal:
        "N = \\text{primitive tasks} \\cup \\text{abstract tasks}, \\quad O \\subseteq N \\times N",
      why: "Search edits this object, not a state — the nodes of the coming search are entire networks (N, O), never proposition sets.",
    },
    {
      kind: "definition",
      term: "method",
      informal:
        "A recipe for one abstract task: a partially ordered network of smaller subtasks that accomplishes it. Real methods also carry a precondition saying when the recipe applies — the taxi recipe only when taxis run — and it is these, not any distance-to-goal, that steer the planner among competing recipes.",
      formal:
        "m = (t, N_m, O_m) \\quad t \\text{ abstract}, \\quad O_m \\subseteq N_m \\times N_m",
      why: "The triple is the domain author's whole interface: expertise enters the domain as recipes, not as per-problem heuristics.",
    },
    {
      kind: "definition",
      term: "task decomposition",
      informal:
        "The rewrite step: delete one abstract task t, insert a chosen method's subtasks N_m in its place, and splice the ordering — whatever had to precede t now precedes all of N_m, whatever followed t follows them. The compact formal line hides that re-linking; the splice is where it lives.",
      formal: "(N, O) -> ((N - t) \\cup N_m, O \\cup O_m)",
      why: "One decomposition is one refinement step; planning is a sequence of them, from top task down to a primitive-only network.",
    },
    { kind: "heading", text: "The travel domain: arrange-trip" },
    {
      kind: "table",
      title: "The travel domain, six primitive operators",
      headers: ["Operator", "Preconditions", "Add", "Delete"],
      rows: [
        ["buy-ticket", "at(home)", "ticket", "—"],
        ["call-taxi", "at(home)", "taxi-at(home)", "—"],
        ["ride-taxi", "at(home), taxi-at(home)", "at(airport)", "at(home), taxi-at(home)"],
        ["check-schedule", "at(home)", "route-known", "—"],
        ["ride-transit", "at(home), route-known", "at(airport)", "at(home)"],
        ["fly", "at(airport), ticket", "at(city)", "at(airport), ticket"],
      ],
      caption:
        "e-01's triple and nothing more: conjunctive licenses, exhaustive edits, at(x) tracking the traveler. Three conventions to notice — the ticket is single-use (fly deletes it); ride-taxi deletes taxi-at(home): the taxi leaves with you and the domain stops tracking it; route-known survives ride-transit, because a learned route stays learned. Primitives are ordinary STRIPS operators; the hierarchy above them adds no new execution machinery whatsoever.",
    },
    {
      kind: "example",
      title: "Decomposing arrange-trip, all the way to primitives",
      problem:
        "Start state s0 = {at(home), taxis-run}. The library holds three methods: m-air = (arrange-trip, {buy-ticket, get-to-airport, fly}, buy-ticket ≺ get-to-airport ≺ fly); m-taxi = (get-to-airport, {call-taxi, ride-taxi}, call-taxi ≺ ride-taxi), applicable when taxis-run holds; m-transit = (get-to-airport, {check-schedule, ride-transit}, check-schedule ≺ ride-transit), always applicable. (t1 ≺ t2 reads 't1 before t2' — the ordering pairs O, written inline.) Decompose arrange-trip completely with m-air and m-taxi, then replay the result against states.",
      steps: [
        {
          text: "The initial network is the single abstract task arrange-trip; the state s0 sits below it, untouched.",
          detail:
            "Note what is absent: a goal state. HTN planning starts from a task; 'done' will mean 'decomposed into primitives that execute', not 'some fact became true'.",
        },
        {
          text: "Apply m-air: arrange-trip is replaced by buy-ticket ≺ get-to-airport ≺ fly.",
          detail:
            "A mixed network — two primitives and one abstract. Methods may nest abstracts inside abstracts; that is what makes the hierarchy hierarchical. And m-air's precondition (like every method's) only READ s0 — methods never edit states; primitives are the only world-editors.",
        },
        {
          text: "Apply m-taxi to get-to-airport: it is replaced by call-taxi ≺ ride-taxi, spliced between buy-ticket and fly.",
          detail:
            "The license taxis-run holds in s0, so m-taxi is a candidate — and m-transit is too, since it always applies: the first genuine choice in the problem, and a kind of choice e-03's state-space searches never face. The spliced network: buy-ticket ≺ call-taxi ≺ ride-taxi ≺ fly — all primitive.",
        },
        {
          text: "Replay against states, e-01 discipline: every precondition checked at its step, every delete honored.",
          detail:
            "buy-ticket (at(home)) → {at(home), taxis-run, ticket}. call-taxi (at(home)) → adds taxi-at(home). ride-taxi (at(home), taxi-at(home)) → deletes both at(home) and taxi-at(home), adds at(airport) → {taxis-run, ticket, at(airport)}. fly (at(airport), ticket) → deletes both, adds at(city) → {taxis-run, at(city)}. No license ever failed; taxis-run rides through untouched — nothing deletes it.",
        },
      ],
      result:
        "One fully primitive network — buy-ticket ≺ call-taxi ≺ ride-taxi ≺ fly — executable from s0 without a single violated license. With m-transit instead: buy-ticket ≺ check-schedule ≺ ride-transit ≺ fly, equally legal, same final state. Two plans from one library; the method choice is the whole story.",
    },
    {
      kind: "decisionTree",
      title: "The method choices, and the two plans they yield",
      root: {
        test: "arrange-trip — which method?",
        highlight: true,
        children: [
          {
            label: "m-air (only recipe)",
            child: {
              test: "get-to-airport — which method?",
              highlight: true,
              children: [
                {
                  label: "m-taxi · needs taxis-run",
                  child: { class: "buy-ticket · call-taxi · ride-taxi · fly", note: "4 primitives, replay-verified", highlight: true },
                },
                {
                  label: "m-transit · always applies",
                  child: { class: "buy-ticket · check-schedule · ride-transit · fly", note: "4 primitives, the untraced twin" },
                },
              ],
            },
          },
        ],
      },
      trace: "m-air, then m-taxi — the decomposition worked out in the example above.",
      caption:
        "Every root-to-leaf path is one complete decomposition, and the leaves are what plan extraction returns. Choices multiply down the hierarchy — one recipe at arrange-trip, two at get-to-airport, hence two plans — and drop taxis-run from the state and the left subtree vanishes: a precondition, not a heuristic, did the pruning. A real domain's tree has thousands of leaves; the search below walks this tree method choice by method choice, never a state in sight.",
    },
    {
      kind: "pseudocode",
      title: "Plan extraction: refine until only primitives remain",
      lines: [
        { text: "network ← { arrange-trip };  constraints ← { }", indent: 0, note: "The top task only; the start state s0 rides along — consulted, never searched." },
        { text: "while network contains an abstract task:", indent: 0 },
        { text: "t ← the first abstract task, in a fixed order", indent: 1 },
        { text: "candidates ← methods for t whose preconditions hold in the current state", indent: 1, note: "Method preconditions steer: a recipe whose situation is absent is not an option." },
        { text: "if candidates is empty: backtrack to the last open choice", indent: 1, tone: "muted" },
        { text: "choose one method m from candidates", indent: 1, tone: "key", note: "THE search: every plan is a sequence of such choices, and every dead end returns here." },
        { text: "replace t in network by m's subtasks; splice m's ordering constraints", indent: 1 },
        { text: "return any linear order of the primitives consistent with the constraints", indent: 0, note: "It exists unless the constraints are cyclic — report failure then." },
      ],
      note:
        "Each pass removes one abstract task and inserts one recipe; the loop terminates only if no method can, through its subtasks, re-invoke an ancestor task. The unrestricted case is the semi-decidability caveat below.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "A different search space",
      text: "Lesson e-03's progression and regression search over STATES: nodes are proposition sets, edges are operators, heuristics estimate distance to the goal. HTN search runs over DECOMPOSITIONS: nodes are task networks, edges are method applications — and there is no goal state to be near, because 'arrange-trip done' is not a fact that could ever become true. The familiar distance-to-goal heuristic has nothing to attach to; what steers instead is method preconditions, disqualifying recipes whose situation is absent. Different space, different structure, different guidance.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The price of the power",
      text: "Stated plainly, because the power is real: HTNs are STRICTLY more expressive than STRIPS. A method library can demand 'ticket first, airport second, and transit — never taxi', a procedure; a STRIPS goal can only say at(city), leaving every way of getting there, including the forbidden ones, equally good. With that expressiveness, undecidability edges closer: general HTN planning is only SEMI-DECIDABLE — if a decomposition exists, an exhaustive search eventually finds it; if none exists, the search may run forever. Common syntactic restrictions on how methods may invoke one another (taming recursion among tasks) restore decidability, and practical domains usually satisfy them. Power, bill, and fine print — all three belong in any honest summary.",
    },
    {
      kind: "text",
      text: "None of this stayed in the laboratory, and the reason is structural: what a deployed planner needs to know — how THIS organization gets things done — is exactly the shape of a method, and methods can be written down by the people who know. **O-Plan**, from Austin Tate's line at Edinburgh (descended from Nonlin), was the planning-and-scheduling tradition's HTN workhorse, built for deployment rather than for benchmarks. **SHOP2**, from Dana Nau and colleagues at Maryland, made decomposition dependable at scale by expanding tasks in the order they will execute, so every method precondition has a definite state to be checked against — the ordered-task discipline this lesson's loop quietly assumes. The bakery knows its own recipes; HTN is the formalism that lets the bakery write them down. Where that idea went in industry — and how the classical wave met deployment — is the next lesson's subject (e-08).",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-07-e1",
      exerciseKind: "concept-check",
      prompt: "Which subtask network can a METHOD legally specify?",
      options: [
        { text: "Only primitive tasks — abstract ones must be gone before a method may apply", correct: false, feedback: "m-air's subtasks are buy-ticket (primitive), get-to-airport (abstract), fly (primitive): mixed networks are the norm, not an error." },
        { text: "Only abstract tasks — methods refine, they never bottom out", correct: false, feedback: "A recipe of nothing but abstracts defers the work forever; recipes bottom out in primitives." },
        { text: "A mix of primitive and abstract tasks, under the method's ordering constraints", correct: true, feedback: "Correct — m-air is exactly that mix, and nesting abstract subtasks inside methods is what gives hierarchies their depth." },
        { text: "Any tasks at all, unordered — sequencing is extraction's problem, not the recipe's", correct: false, feedback: "The ordering pairs are part of the recipe: without check-schedule ≺ ride-transit, 'look it up before you ride' is gone — and that knowledge is the point of the method." },
      ],
      solution: "A method's subtask network may mix primitives and abstracts; the ordering constraints are part of the recipe, not an afterthought.",
      explanation:
        "Methods carry networks, not sets: the pairs in O_m encode when, and nesting abstracts encodes how deep — together they are the recipe.",
      concepts: ["method", "task network"],
    },
    {
      kind: "exercise",
      id: "e-07-e2",
      exerciseKind: "trace",
      prompt:
        "Decompose arrange-trip with m-transit instead of m-taxi. Write the final primitive network, replay it from s0 = {at(home), taxis-run} state by state — every precondition checked at its step, every delete honored (e-01 discipline) — and name the one fact your trace contains that the taxi plan's trace never does.",
      solution:
        "Network: buy-ticket ≺ check-schedule ≺ ride-transit ≺ fly. Replay from s0 = {at(home), taxis-run}: buy-ticket (at(home) holds) → {at(home), taxis-run, ticket}; check-schedule (at(home)) → adds route-known → {at(home), taxis-run, ticket, route-known}; ride-transit (at(home), route-known) → deletes at(home), adds at(airport) → {taxis-run, ticket, at(airport)}; fly (at(airport), ticket) → deletes both, adds at(city) → {taxis-run, at(city)}. The transit-only fact: route-known — knowledge the taxi plan never acquires. taxis-run rides through untouched: no operator deletes it (frame discipline, e-01).",
      explanation:
        "Same task, different recipe, same landing state {taxis-run, at(city)}: the plans differ in the middle facts and the primitive sequence — the WAY, which is exactly what HTN domains exist to encode.",
      concepts: ["task decomposition", "replay verification"],
    },
    {
      kind: "exercise",
      id: "e-07-e3",
      exerciseKind: "predict-output",
      prompt:
        "The library gains a fourth method, for the top task: m-train = (arrange-trip, {get-to-station, ride-train}, get-to-station ≺ ride-train), with get-to-station and ride-train both primitive (operators exist for them). Counting distinct complete decompositions into linear primitive plans, how many can plan extraction now return for arrange-trip? Type the number.",
      expectedOutput: "3",
      solution: "3",
      explanation:
        "arrange-trip now has two recipes. m-air contains get-to-airport, which offers two ways (m-taxi or m-transit) → 2 plans; m-train is one fixed primitive chain → 1 plan. Alternatives at a node add; choices along a path multiply: 2 + 1 = 3 leaves on the decision tree — and each leaf is one candidate plan, which is the whole search space.",
      concepts: ["method choice", "search space"],
    },
  ],
  terms: [
    {
      term: "primitive task",
      definition:
        "A task that IS a STRIPS operator — e-01's (pre, add, del) triple; the only tasks that execute. Every hierarchy bottoms out in these.",
    },
    {
      term: "abstract (compound) task",
      definition:
        "A TO-DO with no operator: no effects, no state contact of its own. It exists only to be replaced by some method's subtask network.",
    },
    {
      term: "method",
      definition:
        "A recipe: (abstract task, subtask network, ordering constraints), plus a precondition stating when it applies — the unit in which domain expertise is stored.",
    },
    {
      term: "task decomposition",
      definition:
        "The rewrite that replaces an abstract task by a method's subtasks and splices their ordering constraints into the network — one refinement step.",
    },
    {
      term: "hierarchical task network",
      definition:
        "The partially ordered mix of primitive and abstract tasks the planner refines; it starts as the top task, and success is a primitive-only network executable in a constraint-respecting order.",
    },
  ],
  mistakes: [
    {
      mistake: "Writing abstract tasks with preconditions, add lists and delete lists.",
      why: "get-to-airport has no operator — no license to check, no world edit. If it seems to need at(home) in order to 'apply', an operator has been smuggled in and the hierarchy above it is decorative.",
      fix: "Ask of every task: does it EXECUTE or does it EXPAND? Only primitives execute; abstracts only ever get replaced — they never appear in the final plan.",
    },
    {
      mistake: "Judging HTN planners by state-space criteria — asking for their distance-to-goal heuristic, comparing node counts against e-03's searches.",
      why: "There is no goal state, hence nothing for a distance heuristic to aim at; and the two searches' nodes are different KINDS of object — networks versus states — so raw counts do not compare.",
      fix: "Re-ask the question in decomposition space: how many recipes per abstract task, where do preconditions prune, how do choices interact. Those are the quantities that matter here.",
    },
    {
      mistake: "Treating 'strictly more expressive' as a free upgrade.",
      why: "The extra power is real — procedures no goal state can state — and so is the bill: general HTN planning is only semi-decidable, so a planner promised to terminate on every input is promised something the formalism does not give.",
      fix: "Check the domain against the known syntactic restrictions before promising termination; most practical domains satisfy them, but that is a check to run, not a given.",
    },
    {
      mistake: "Remembering a method's subtask list and dropping its ordering constraints.",
      why: "{check-schedule, ride-transit} as an unordered set leaves 'look it up first' for extraction to rediscover — the very expertise the method exists to encode — and hands extraction an extra ordering problem per decomposition.",
      fix: "Author the pairs explicitly (check-schedule ≺ ride-transit) and read every method as the full triple: task, network, order.",
    },
  ],
  takeaways: [
    "Primitives are e-01's operators; abstract tasks are TO-DOs; methods — (task, subtask network, ordering constraints) — are the only bridge between the two floors.",
    "HTN search runs over decompositions: networks are the nodes, method applications the edges, and method preconditions — not distance-to-goal — do the steering.",
    "arrange-trip admits exactly two decompositions in this lesson's library — m-air then m-taxi, or m-air then m-transit; the choice among recipes IS the search.",
    "Power with a bill: HTNs are strictly more expressive than STRIPS and only semi-decidable in general — decidable under syntactic restrictions practical domains usually meet.",
    "O-Plan and SHOP2 endured because methods let domain authors write procedures down directly — expertise in the domain, not rediscovered per problem.",
  ],
  quiz: [
    {
      id: "e-07-q1",
      prompt: "The core contrast with Lesson e-03: HTN plan extraction searches over —",
      options: [
        { text: "States, with method preconditions serving as edge costs", correct: false, feedback: "States are never nodes here: they are consulted (precondition checks) and replayed (verification), but the search's nodes are task networks." },
        { text: "Decompositions — networks are the nodes, method applications the edges — and there is no goal state for a distance heuristic to aim at", correct: true, feedback: "Correct: branching is 'which method for which abstract task', and the steering comes from method preconditions, not distance-to-goal." },
        { text: "Operators, like progression, but restricted to primitive ones", correct: false, feedback: "That is the EXECUTION story: primitives are sequenced at the end; the planning search itself chooses methods." },
        { text: "Nothing — with methods given, no search remains", correct: false, feedback: "Wherever a task has more than one applicable method, choice exists: arrange-trip alone admits two plans in this lesson's library." },
      ],
      explanation: "Different space, different structure, different guidance — networks vs states, recipes vs operators, preconditions vs heuristics.",
    },
    {
      id: "e-07-q2",
      prompt: "General HTN planning is only semi-decidable. In practice that means:",
      options: [
        { text: "HTN planners cannot guarantee their plans are correct", correct: false, feedback: "Semi-decidability concerns TERMINATION, not correctness: any found decomposition replay-verifies like any STRIPS plan." },
        { text: "If a decomposition exists, an exhaustive search eventually finds it; if none exists, the search may run forever — decidability returns under syntactic restrictions on methods", correct: true, feedback: "Correct — 'yes' arrives eventually, 'no' may never arrive; the restricted classes (taming task recursion) are what practical domains usually satisfy." },
        { text: "Only toy domains can be solved by HTN planners", correct: false, feedback: "The travel domain here is ordinary and terminates instantly; the caveat is about the general formalism, not about practical sizes." },
        { text: "HTN is decidable, just PSPACE-hard like STRIPS", correct: false, feedback: "That is the STRIPS envelope; strict extra expressiveness is precisely what pushes general HTN beyond it into semi-decidability." },
      ],
      explanation: "Semi-decidable: success is eventually certified, failure may never be — the classic bill for expressive power, payable in restricted syntax where needed.",
    },
    {
      id: "e-07-q3",
      prompt: "Why do deployed planners favor HTN methods over pure goal-state search?",
      options: [
        { text: "HTN search is always faster than state-space search", correct: false, feedback: "No always: a misleading method library can waste more work than a good heuristic saves; the deployment argument is about expressing expertise, not guaranteed speed." },
        { text: "Organizations already run on procedures, and methods let those procedures be written into the domain directly — the bakery encodes its own recipes", correct: true, feedback: "Correct: procedural knowledge enters in the formalism's native shape, instead of being rediscovered per problem by search." },
        { text: "HTN domains do not need primitive operators", correct: false, feedback: "Every hierarchy bottoms out in primitives — here, exactly e-01's operators, unchanged." },
        { text: "Goal states have been abandoned by modern planning", correct: false, feedback: "Goals remain the right tool when only the end state matters; methods earn their keep when the WAY matters." },
      ],
      explanation: "The deployment case is a knowledge-engineering case: who can write the domain down, not which search is cleverer.",
    },
  ],

};
