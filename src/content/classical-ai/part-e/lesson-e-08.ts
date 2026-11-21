/**
 * Lesson e-08 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_E_08: ClassicalLesson = {

  slug: "e-08",
  title: "Planning in the Wild",
  minutes: 30,
  summary:
    "From NASA remote agents to factory schedulers: what classical planning actually runs on today, and what replaced it.",
  kind: "concept",
  objectives: [
    "Recite the deployment lineage with dates and honest scope — SHAKEY/STRIPS at SRI, Deep Space 1's Remote Agent, EO-1's CASPER, factory scheduling",
    "Explain what PDDL standardized and why comparable benchmarks mattered more than any single planner",
    "Map each clause of e-01's five-part contract to the successor field that drops it",
    "State the planning-as-reachability view and the exact sense in which model checking is its cousin",
    "Judge the LLM-vs-planner division of labor soberly — who proposes, who verifies, where each fails",
  ],
  why: "Every part of this course ends with the same quiet question: did any of it run? Planning has the best answer in classical AI — and the strangest. The lineage runs from a wheeled robot in Menlo Park (SHAKEY, the project STRIPS was written for) through the first AI planning-and-scheduling software to control a spacecraft (Deep Space 1's Remote Agent, May 1999) to an Earth-observing satellite scheduling its own imaging (EO-1's CASPER, from 2003) — and then leaves the headlines for the factory floor, where classical planning plus durations and resources became the scheduler, the extension with the deepest industrial uptake of all. Meanwhile the research community built the machine that keeps it honest: PDDL and the International Planning Competition, one yardstick since 1998. This closing lesson assembles that record, maps each broken assumption to its successor field — temporal, probabilistic, multiagent — and states, without hype, where the classical core sits today: as the verifiable component inside systems whose fluency comes from elsewhere.",
  blocks: [
    {
      kind: "text",
      text: "Part E has been a laboratory tour: e-01's operators, e-05's planning graph, e-07's method hierarchies. The closing question is the one every such tour owes an answer to — **did any of it run?** Planning has the most interesting answer in classical AI: a short, real deployment lineage; a piece of measurement infrastructure that outlived every individual planner; and a map of successor fields whose chapters are named, precisely, for the assumptions Lesson e-01 priced at the door.",
    },
    { kind: "heading", text: "The deployment lineage" },
    {
      kind: "table",
      title: "The deployment lineage — four entries, honestly dated",
      headers: ["Where", "When", "What ran", "What it established"],
      rows: [
        [
          "SHAKEY · SRI (Stanford Research Institute), Menlo Park",
          "1966–1972",
          "A mobile robot — perception, navigation, and STRIPS (Fikes & Nilsson, 1971) built as its planner",
          "That operator-based planning could drive a physical machine through rooms — this part's entire inheritance descends from one project",
        ],
        [
          "Deep Space 1 · NASA (Ames Research Center + JPL)",
          "May 1999",
          "Remote Agent — AI planning and scheduling aboard the craft, as a flight experiment",
          "The first AI planning-and-scheduling software to control a spacecraft; several days of autonomous operation during the experiment",
        ],
        [
          "EO-1 · NASA Earth-observing satellite",
          "from 2003",
          "The Autonomous Sciencecraft Experiment, with the CASPER planner",
          "Onboard science scheduling: imaging decisions made on the satellite itself, without a round-trip to the ground",
        ],
        [
          "Factory floors",
          "ongoing",
          "Production schedulers — classical planning plus durations and resources",
          "The temporal-planning era: the extension with the deepest industrial uptake of them all",
        ],
      ],
      caption:
        "Four deployments across four decades. Not a trend line — a lineage: each entry is real, none was a mass-market product, and the industrial center of gravity sits in the least cinematic row. Note the recurring shape, made explicit in the synthesis section below: every one of these planners runs INSIDE a larger system.",
    },
    {
      kind: "text",
      text: "Read the lineage entry by entry, without embellishment. **SHAKEY** — the mobile robot project at SRI (Stanford Research Institute) in Menlo Park, 1966–1972 — is the reason this part of the course exists: STRIPS (Fikes and Nilsson, 1971) was written as its planner, and e-01's operator triple is that paper's data structure. **Deep Space 1** took the idea off the planet: during the May 1999 flight experiment, Remote Agent — built by NASA Ames Research Center and JPL — became the first AI planning-and-scheduling software to control a spacecraft, with several days of autonomous operation. The honest framing of that milestone is narrow: a technology experiment on a real craft, not a permanent handover of the controls — but the handover happened, and planning did it. **EO-1** moved the planner onboard for keeps: from 2003 the Earth-observing satellite flew the Autonomous Sciencecraft Experiment, whose CASPER planner scheduled imaging on the satellite itself — deciding, in orbit, what to observe. And the **factory floor** is where the uptake actually ran deep: production scheduling is classical planning with durations and resources attached — temporal planning — and it is the branch of the family with the deepest industrial uptake. One robot, one probe, one satellite, many plants. The pattern to carry forward: deployment favored the assumption the customer could name — time — and every deployment embedded the planner inside a larger system.",
    },
    { kind: "heading", text: "PDDL and the benchmark engine" },
    {
      kind: "text",
      text: "Through the 1990s the field had plenty of planners and no yardstick: each system read its own domain dialect, so 'our planner solved X' was a claim no other lab could check. The fix was infrastructure, not theory. **PDDL** — the Planning Domain Definition Language — was introduced for the first planning competition, held with AIPS in 1998, and it standardized the spelling of exactly what this part has been writing since e-01: a **domain** is a set of operator triples; a **problem** is an initial state plus a goal. Every entrant reads the same problem files under the same rules, and results become comparable across labs for the first time. That competition grew into the **International Planning Competition**, the community's benchmark engine ever since — the circuit on which one idea gets measured against every other on everyone's problems. Blum and Furst's 1995 planning graph, Lesson e-05's structure, is the canonical example of an advance whose reach that circuit made checkable; the HTN tradition ran it too, with O-Plan (Tate, Edinburgh) and SHOP2 (Nau et al., Maryland) — Lesson e-07's method libraries in competitive form — as its workhorses. The honest summary of what PDDL bought is one word: **comparability**. It is not a product, not a new theory of action, and it made no problem easier to solve — it made claims about planners checkable, which is a different and underrated kind of progress.",
    },
    { kind: "heading", text: "Where the contract breaks" },
    {
      kind: "table",
      title: "The assumption map — e-01's contract, clause by clause",
      headers: ["Clause of the contract", "What the world does to it", "The field that drops it"],
      rows: [
        [
          "instantaneous",
          "Actions take time: durations, deadlines, machine capacity",
          "Temporal planning — plans become schedules; the deployed tip of the family",
        ],
        [
          "deterministic",
          "The same action can misfire: outcomes branch",
          "MDPs and contingent planning — plans become policies over branches",
        ],
        [
          "single-agent",
          "Other agents act on the same world, with plans of their own",
          "Multiagent planning — reasoning about reasoning the planner does not control",
        ],
        [
          "fully observable",
          "State is partly hidden",
          "Partially observable planning — sensing becomes part of the problem",
        ],
        [
          "finite",
          "Quantities go numeric: levels, budgets, temperatures",
          "Relaxed last and least — discretization carries much of the load",
        ],
      ],
      caption:
        "e-01's five clauses — deterministic, instantaneous, fully observable, single-agent, finite — reused exactly, and made a table of contents: every successor field is named for the clause it drops, and each keeps the classical core as the special case where the clause is restored. To place a real problem, ask which clause it actually stresses. In industry the answer was usually time first, and the scheduler is what that answer built.",
    },
    { kind: "heading", text: "The modern synthesis: planners as components" },
    {
      kind: "definition",
      term: "Planning as reachability",
      informal:
        "Strip the notation away and a classical planning problem is a finite transition system — states, a start state, labeled steps — with a path question attached: is some goal state reachable, and along which edges? A model checker explores the same object and asks the complementary question: is a bad state reachable, or does a property hold on every path?",
      formal:
        "s_0 ->^{a_1} s_1 \\text{ ... } s_{k-1} ->^{a_k} s_k \\text{ with } G \\subseteq s_k",
      why: "One object, two questions — which is why the two fields trade tools (SAT encodings among them) and why a planner can be hired into a pipeline as a checker: both are exhaustive reasoners over finite graphs.",
    },
    {
      kind: "text",
      text: "The deployed shape follows from that view. Planners almost never ship alone: Remote Agent's planner sat inside a flight executive that also monitored and recovered; CASPER sat inside the Autonomous Sciencecraft Experiment; a production scheduler sits inside plant systems that own orders, inventory, and people. Call the enclosing system the **orchestrator**: it owns the world — sensors, actuators, humans, failures — and delegates to the planner exactly one question: given the current state and the goals, what sequence is legal next? The answer carries a guarantee the orchestrator can rely on mechanically: every emitted action's preconditions hold at its step, with respect to the model. That is a narrow guarantee — it says nothing about the model's honesty or the world's cooperation — and its narrowness is why it composes. Read from the orchestrator's chair, the assumption map is a purchasing decision: an orchestrator that must own time buys a temporal planner; one that must own risk reaches for the MDP toolkit; and a great many problems — instrumented line, reliable machines, one owner — need no clause relaxed at all. That last case is the e-01 planner, unmodified, still on the job.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Symbolic AI's second life — stated without hype",
      text: "The newest chapter deserves one sober paragraph, because both the marketing and the obituaries get it wrong. Large language models are fluent generators of action sequences, and structurally indifferent to whether a sequence is legal: preconditions, capacities, and ordering constraints are not checked by fluency, and the characteristic LLM-agent failure is the plausible-but-illegal plan. A classical planner — or scheduler, or model checker; the reachability cousins of this section — is the opposite pole: a verifier with no ideas of its own, which is exactly the property you want in a checker. The division of labor now emerging follows: **LLMs propose, planners verify** — the model drafts candidate plans, parameters, and operator descriptions from context; the planner replays the candidates against an explicit model and rejects what violates it. Pattern matching proposes; deliberation checks. Two limits keep the claim honest: the verifier's guarantee stops at the model it is handed — authoring and maintaining that model is still the human bottleneck — and a verifier fed mostly nonsense is a slow gate, so generation quality still matters. Nothing here says symbolic AI won anything. What returned is narrower and more useful than a victory: the checkable component.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "e-08-e1",
      exerciseKind: "concept-check",
      prompt:
        "A car plant wants planning help: jobs with processing times, machines with capacity, delivery deadlines. Which clause of e-01's five-part contract breaks FIRST — and what deployed technology does its repair name?",
      options: [
        {
          text: "Deterministic — machines jam, so probabilistic planning (MDPs) comes first",
          correct: false,
          feedback:
            "Machines do jam, and an MDP is the right formalism when variability is the story. But industry's first relaxation was not probability: the daily, structural fact of production is time and capacity, and occasional failures are handled by re-planning rather than by distributions.",
        },
        {
          text: "Instantaneous — actions have durations and resources have capacity: classical planning plus time is temporal planning, whose deployed face is the scheduler, the branch with the deepest industrial uptake",
          correct: true,
          feedback:
            "Correct — deadlines and machine capacity are first-order facts of a plant, not pathologies. Classical planning plus durations and resources is temporal planning, and its deployed face — the production scheduler — is the deepest industrial uptake in the family.",
        },
        {
          text: "Fully observable — the line is only partially instrumented",
          correct: false,
          feedback:
            "Most plants are heavily instrumented; observability is usually the clause that survives longest. The bottleneck is not seeing the state — it is fitting actions into time and capacity.",
        },
        {
          text: "Finite — part counts are unbounded integers",
          correct: false,
          feedback:
            "Quantities do go numeric, and finiteness is relaxed last and least; discretization carries a lot. The fight that reshaped the deployed technology was over time, not number.",
        },
      ],
      solution:
        "Instantaneous breaks first: durations, deadlines, and machine capacity are the ordinary physics of production. Classical planning plus durations and resources is temporal planning; its deployed face is the production scheduler.",
      explanation:
        "The assumption map doubles as a requirements-analysis tool: which clause of the contract does THIS problem actually stress? For industry the answer was, overwhelmingly, time.",
      concepts: ["scheduler", "temporal planning", "classical planning assumptions"],
    },
    {
      kind: "exercise",
      id: "e-08-e2",
      exerciseKind: "concept-check",
      prompt:
        "PDDL is more than two decades old and still the planning community's common input format. What did its existence actually buy the field — and what did it NOT buy?",
      options: [
        {
          text: "A theory of action — it replaced the STRIPS operator with something more expressive",
          correct: false,
          feedback:
            "A PDDL action still IS e-01's triple — preconditions, add list, delete list — with standardized spelling (and, later, more notational surface). The language fixed the notation, not the semantics.",
        },
        {
          text: "Comparable benchmarks: one problem language and shared problem sets, so every planner runs the same tests under the same rules — results comparable across labs for the first time",
          correct: true,
          feedback:
            "Correct — introduced for the 1998 competition, PDDL turned 'my planner is better' into a checkable claim. Measurement infrastructure for science, not a product.",
        },
        {
          text: "A product feature — deployed planners ship with PDDL front-ends as their competitive edge",
          correct: false,
          feedback:
            "Flight software and factory schedulers carry their own internal modeling; PDDL's habitat is the benchmark circuit, not the sales brochure.",
        },
        {
          text: "Tractability — problems written in PDDL are easier to solve",
          correct: false,
          feedback:
            "The language is the yardstick, not the solver: notation and complexity are orthogonal, and competition problems got harder, not easier.",
        },
      ],
      solution:
        "Comparability. Before PDDL, each lab's results were local claims; after it, the competition's shared problems and rules made cross-lab claims checkable — the benchmark engine the field still runs on.",
      explanation:
        "The general lesson: a field's measurement infrastructure can outlast every individual system it measures. Ask what the competitions would have been without a common language — a list of anecdotes, not a science.",
      concepts: ["PDDL", "planning deployment", "International Planning Competition"],
    },
    {
      kind: "exercise",
      id: "e-08-e3",
      exerciseKind: "trace",
      prompt:
        "A customer-support agent must execute account changes — refunds, rebookings, shipments — whose operators carry preconditions (refundable(ticket), in-stock(item), verified(address)). Architecture decision: an LLM agent, a classical planner-verifier over an authored operator model, or both. Argue the division of labor in two or three sentences of design judgment: who proposes, who verifies, and why 'let the LLM do both' is the wrong shape.",
      solution:
        "Give the LLM the proposing and the interface: parse the messy request into goals and parameters, draft candidate action sequences, explain outcomes to the customer. Give the planner the verification: replay each candidate against the authored operator model — every precondition checked at its step — and let only sequences that replay cleanly reach execution. 'Let the LLM do both' fails on the failure mode that divides the roles: fluency generates plausible sequences, and plausible is not legal — an LLM will cheerfully emit refund-after-shipment, an ordering the model forbids, and nothing in fluency makes that check reliable. The planner has the complementary weakness — it has no ideas, cannot parse a customer's request, and cannot write prose — which is exactly what you want in a checker: mechanical, exhaustive, wrong about nothing that is in the model. Two honest limits keep the judgment sober: the guarantee is only as good as the authored model, and model authorship remains the human bottleneck; and a verifier fed garbage candidates is a slow gate, so generation quality still matters. Neither component substitutes for the other — the architecture IS the division of labor.",
      explanation:
        "Deliberation versus pattern: the planner contributes checkability, the LLM contributes coverage and interface fluency. The sober claim is about roles, not victories.",
      concepts: ["planning deployment", "verification", "LLM-agent orchestration"],
    },
  ],
  terms: [
    {
      term: "PDDL",
      definition:
        "The Planning Domain Definition Language, introduced for the 1998 AIPS planning competition: a standard notation for domains (operator triples) and problems (initial state, goal) — the community's benchmark currency ever since.",
    },
    {
      term: "temporal planning",
      definition:
        "Classical planning with the instantaneous-actions clause dropped: actions carry durations and consume resources, and plans become schedules.",
    },
    {
      term: "scheduler",
      definition:
        "The deployed face of temporal planning: a system assigning time- and resource-feasible work to machines — the classical lineage's deepest industrial uptake.",
    },
    {
      term: "planning deployment",
      definition:
        "A planning system running in production as one component of a larger orchestrator — a spacecraft executive, an onboard experiment, plant software — rather than as a standalone product.",
    },
    {
      term: "planning as reachability",
      definition:
        "The stripped-down view of classical planning: a path query over a finite transition system — the property it shares with model checking.",
    },
  ],
  mistakes: [
    {
      mistake: "Crediting — or blaming — 'the planner' for a deployed system's behavior.",
      why: "Remote Agent, EO-1's sciencecraft, a plant's scheduler: in every real deployment the planner is one component of an orchestrator that also executes, monitors, and recovers. The planner's guarantee covers model-legal sequences, full stop.",
      fix: "Attribute at the seam: ask which component owns which guarantee. The planner owns legality-with-respect-to-the-model; the orchestrator owns the world. Successes and failures both decompose along that line.",
    },
    {
      mistake: "Treating PDDL as a theory of action — or as a product.",
      why: "It changed the notation and the measurement, not the semantics (a PDDL action is still e-01's triple) and not the market (its habitat is the benchmark circuit, not sales brochures).",
      fix: "Read PDDL as a yardstick: the thing that let the competition run every planner on the same problems. When you see it, ask what claim it enables — the answer is cross-lab comparison, nothing else.",
    },
    {
      mistake: "Reading the assumption map as 'classical planning was wrong.'",
      why: "Every successor field keeps the classical core as the special case where the dropped clause is restored; the map is a table of contents for the literature, not a refutation of the subject.",
      fix: "Place a problem by asking which of the five clauses it actually stresses. Often none do: an instrumented, reliable, single-owner process is an e-01 problem wearing overalls.",
    },
    {
      mistake: "Telling the story as 'planning is dead' or 'planning runs the world.'",
      why: "Both slogans misstate a short, real record: one mobile robot (SRI, 1966–1972), one spacecraft flight experiment (May 1999), one satellite's onboard scheduling (from 2003), and genuinely deep uptake on factory floors.",
      fix: "State the record at its actual size. The honest version is more useful than either slogan, because it explains which assumption the market paid to relax — time.",
    },
  ],
  takeaways: [
    "The deployment lineage is short and real: SHAKEY's STRIPS at SRI (1966–1972), Deep Space 1's Remote Agent in May 1999 — the first AI planning-and-scheduling software to control a spacecraft — EO-1's CASPER science scheduling from 2003, and the factory floor, where the uptake is deepest.",
    "PDDL, introduced for the 1998 competition, bought the field comparability: same problems, same rules, one yardstick — measurement infrastructure, not a product.",
    "Every successor field is named for the clause of e-01's contract it drops: instantaneous → temporal planning (the industrial tip), deterministic → MDPs and contingent planning, single-agent → multiagent planning.",
    "Planning is reachability over a finite transition system — the same object a model checker explores with a different question in mind.",
    "The sober present: LLMs propose, planners verify — fluency generates candidates, deliberation checks them against an authored model, and model authorship, not search, is the hard part.",
  ],
  quiz: [
    {
      id: "e-08-q1",
      prompt: "Deep Space 1's Remote Agent (flight experiment, May 1999) holds its place in this history because:",
      options: [
        {
          text: "It was the first AI planning-and-scheduling software to control a spacecraft — several days of autonomous operation, built by NASA Ames and JPL",
          correct: true,
          feedback:
            "Correct — the milestone is autonomy at the controls: a planner-scheduler actually running a spacecraft, honestly framed as a flight experiment rather than a permanent handover.",
        },
        {
          text: "It was the mobile robot STRIPS was written for",
          correct: false,
          feedback:
            "That is SHAKEY — SRI, Menlo Park, 1966–1972: a decade of robot-and-planner co-evolution before any of it flew.",
        },
        {
          text: "It was the first factory scheduler",
          correct: false,
          feedback: "Industrial scheduling is the other lineage — less cinematic, deeper uptake.",
        },
        {
          text: "It introduced PDDL to the community",
          correct: false,
          feedback:
            "PDDL belongs to the benchmark circuit — introduced for the 1998 competition, a year before the flight experiment, and on the ground, not in orbit.",
        },
      ],
      explanation:
        "The lineage in one question: a robot at SRI (1966–1972), a spacecraft in May 1999, a satellite from 2003, the factory floor throughout — each a first, each honestly dated.",
    },
    {
      id: "e-08-q2",
      prompt: "What did PDDL's existence actually change?",
      options: [
        {
          text: "It made planning tractable — PDDL problems solve in polynomial time",
          correct: false,
          feedback:
            "Notation buys no complexity results; competition problems are as hard as ever, and the language never claimed otherwise.",
        },
        {
          text: "It standardized problem description, so every planner could run the same problems under the same rules — cross-lab results became comparable",
          correct: true,
          feedback:
            "Correct — a yardstick, not a solver: the measurement infrastructure behind the International Planning Competition since 1998.",
        },
        {
          text: "It replaced the STRIPS operator with a new theory of action",
          correct: false,
          feedback:
            "A PDDL action still is e-01's triple — preconditions, add, delete — with standardized spelling and, later, more notational surface.",
        },
        {
          text: "It was the flight language of Remote Agent",
          correct: false,
          feedback:
            "Flight software carries its own modeling; PDDL's habitat is the benchmark, not the spacecraft.",
        },
      ],
      explanation:
        "Infrastructure can outlast every system it measures: PDDL's value is that it turned 'my planner is better' into a checkable claim.",
    },
    {
      id: "e-08-q3",
      prompt: "In what exact sense are planning and model checking cousins?",
      options: [
        {
          text: "Both work over a finite transition system: the planner asks whether a goal state is reachable and returns a path; the model checker asks whether bad states are reachable, or whether a property holds on all paths",
          correct: true,
          feedback:
            "Correct — one object, two questions; the family resemblance shows up in the tools they share, SAT encodings among them.",
        },
        {
          text: "Both were developed for spacecraft autonomy",
          correct: false,
          feedback:
            "Model checking's home turf is hardware and protocol verification; the overlap is structural, not institutional.",
        },
        {
          text: "Both exist to prove LLM outputs correct",
          correct: false,
          feedback:
            "Either can CHECK a candidate path against a model — a current and sober use — but 'prove LLM outputs correct' overstates it: the guarantee stops at the model's edge.",
        },
        {
          text: "Both are heuristic searches over continuous spaces",
          correct: false,
          feedback:
            "The cousinage is precisely over FINITE transition systems — discreteness is what the two fields share.",
        },
      ],
      explanation:
        "One finite transition system, two questions — goal-reachability-with-a-path for the planner, bad-state-reachability or all-paths properties for the checker.",
    },
  ],

};
