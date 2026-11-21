/**
 * PART F · MODULE 1 · CHAPTER "Production Systems" · LESSON f-01 — "Rules as Knowledge"
 *
 * The opening lesson of the Expert Systems & Uncertainty part: the
 * production-system architecture (working memory + rule base + interpreter),
 * the recognize-act cycle, rules as declarative/inspectable/modular
 * knowledge, and a hand-verified forward pass over CAMPUS-NET — a campus
 * network troubleshooter. Raises the conflict-resolution question and
 * defers it to f-02, which owns the strategies (specificity, recency,
 * priority) and the Rete idea. f-03 owns backward chaining; f-04 owns the
 * MYCIN/XCON history in depth.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_01: ClassicalLesson = {
  slug: "f-01",
  title: "Rules as Knowledge",
  minutes: 30,
  summary:
    "IF-THEN as a knowledge format: the production-system architecture and the conflict-resolution question.",
  kind: "concept",
  objectives: [
    "Name the three parts of a production system, say what each contributes, and locate where control flow lives",
    "Hand-trace the recognize-act cycle over a rule base, licensing every firing as a subset check and stopping at quiescence",
    "Read a rule base as knowledge — declarative, inspectable, modular — and contrast it with the same logic as ordinary code",
    "Add or delete a rule and predict exactly which traces change and which do not",
    "Recognize the conflict-resolution question when several rules match, and say why the architecture alone cannot answer it",
  ],
  why: "Every help desk, triage desk and configuration team runs on the same implicit object: a body of \u201cif you see this, conclude that\u201d expertise, held in the heads of people who eventually leave. The production system made that object a literal artifact — a rule base you can print, read line by line, argue over, and hand to a loop that applies it consistently at 3 a.m. when the expert is asleep. That is the property that carried AI out of the laboratory and into industry: the knowledge became inspectable by the very people whose judgment it encoded, and the machine's discipline became an audit trail. This lesson makes you fluent in that architecture. You will take apart the three parts (working memory, rules, interpreter), hand-trace a real troubleshooting rule base firing by firing, verify each step as a subset check, feel quiescence as a stop condition, and end on the one question the architecture refuses to answer — when two rules match, who fires? Without that fluency the rest of Part F has nothing to stand on; with it, explanation traces, certainty factors and Bayesian networks become legible as successive attempts to fix exactly what plain rules cannot express.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "The first artificial intelligence that industry actually paid for was not a learner — it was a list of rules and a loop. At Stanford in the early 1970s, MYCIN reasoned about infection therapy as a consultant to clinicians; from 1980, XCON configured computer orders at Digital Equipment Corporation and became part of the business itself. Neither held a statistical model or a neural network: their knowledge was a collection of IF-THEN statements, readable one line at a time by the very experts whose judgment they encoded. The architecture underneath — the **production system** — is almost embarrassingly simple: a working memory of facts, a base of rules, and an interpreter that loops. This lesson takes that architecture apart, runs a small but real troubleshooting rule base by hand, and closes on the one question the architecture itself will not answer.",
    },

    // ------------------------------------------------------------ the architecture
    { kind: "heading", text: "Three parts and a loop" },
    {
      kind: "definition",
      term: "Production rule",
      informal:
        "A single IF-THEN statement of expertise: when every condition in the IF-part holds, the THEN-part's conclusion may be asserted. Each rule is one piece of knowledge — independently written, independently read, independently deleted.",
      formal:
        "r = \\langle \\text{IF } C_r, \\text{ THEN } a_r \\rangle, \\quad \\text{fireable}(r) \\iff C_r \\subseteq WM",
      why: "The subset test is the entire notion of being licensed: a rule may not fire on partial evidence, and it may not refuse once all of its evidence is in.",
    },
    {
      kind: "definition",
      term: "Working memory",
      informal:
        "The system's single mutable store: the facts currently held — the observations gathered so far plus every conclusion rules have derived. Everything else in the system is static.",
      formal: "WM_{t+1} = WM_t \\cup \\{a_r\\}",
      why: "One shared, changing store is what lets rules interact — one rule's conclusion becomes another rule's evidence — without any rule ever naming another rule.",
    },
    {
      kind: "algorithm",
      name: "The production-system interpreter",
      family: "Production systems",
      problem:
        "Decide what a base of rules implies about the facts at hand — which conclusions hold, and in what order they become available.",
      idea:
        "One heartbeat, repeated: recognize (match every rule's IF-part against working memory), resolve (choose one of the matched rules), act (fire it, adding its conclusion to memory). The new fact may complete another rule's conditions, so the loop runs again — until nothing new can be derived.",
      strategy: [
        "Seed working memory with the observations",
        "RECOGNIZE: collect every rule whose whole IF-part is present and whose conclusion is not yet believed",
        "RESOLVE: select one of them — the step the architecture itself leaves open",
        "ACT: add the selected rule's conclusion to working memory",
        "repeat the heartbeat until the matched set is empty: quiescence",
      ],
      guarantees: [
        "Every firing is licensed: the fired rule's full IF-part was present at firing time — checkable step by step",
        "On a finite, monotone base the cycle terminates: each firing adds a fact not already believed, so working memory grows strictly",
        "Quiescence is a fixpoint: nothing the rules can derive from the current facts is missing from working memory",
      ],
      useWhen: [
        "Knowledge is rule-shaped — observations imply conclusions, as in diagnosis, triage, configuration and eligibility",
        "Facts arrive incrementally, and conclusions should follow the data as it accumulates",
        "The knowledge must be read and audited by domain experts rather than only by programmers",
      ],
      pitfalls: [
        "A wrong rule fires with perfect discipline — the architecture certifies the licensing, never the truth",
        "Once retraction enters, rules can undermine each other's support and loop; cycle detection is the standard guard",
      ],
    },
    {
      kind: "definition",
      term: "Recognize-act cycle",
      informal:
        "The interpreter's single heartbeat: recognize (match all rules against working memory), resolve (choose one of the matched), act (fire it, adding its conclusion). Repeated until quiescence.",
      formal:
        "r^* \\in \\{r : C_r \\subseteq WM_t \\land a_r \\notin WM_t\\}, \\quad WM_{t+1} = WM_t \\cup \\{a_{r^*}\\}",
      why: "Because choosing is inside the loop, WHICH matched rule fires is as much a part of the system's behavior as the rules themselves — that choice is the conflict-resolution question this lesson ends on.",
    },
    {
      kind: "pseudocode",
      title: "The interpreter loop",
      lines: [
        { text: "function INTERPRET(rules, facts)" },
        {
          text: "WM ← facts",
          indent: 1,
          note: "working memory opens as the raw observations — nothing else will ever be mutable",
        },
        { text: "loop", indent: 1 },
        {
          text: "conflict ← { r ∈ rules : r.IF ⊆ WM and r.THEN ∉ WM }",
          indent: 2,
          tone: "key",
          note: "RECOGNIZE — licensed means the whole IF-part present; a rule with nothing new to say is not in the set",
        },
        {
          text: "if conflict = ∅ then return WM",
          indent: 2,
          note: "quiescence — the only stop condition",
        },
        {
          text: "r ← RESOLVE(conflict)",
          indent: 2,
          tone: "key",
          note: "RESOLVE — which matched rule fires is the open design decision",
        },
        {
          text: "WM ← WM ∪ { r.THEN }",
          indent: 2,
          note: "ACT — one conclusion joins the facts, and matching begins again",
        },
      ],
      note: "One heartbeat adds at most one fact, and only a fully licensed one — everything debatable lives inside RESOLVE.",
    },

    // ------------------------------------------------------------ rules as knowledge
    { kind: "heading", text: "Rules as knowledge, not code" },
    {
      kind: "text",
      text: "Try encoding one diagnostic move in ordinary code: `if no_link and cable_loose: recommend(\"check the cable\")`. The sentence looks similar, but the *when* and the *how* are welded to the *what*: that line must live inside a function, called by something, in an order somebody chose — and adding a second diagnosis means editing that control flow. The production rule unwelds them. **Declarative**: each rule states what follows from what; it never says when to run, how often, or in which order — every one of those decisions belongs to the interpreter, which is the same three-part loop for every domain. **Inspectable**: the base is meant to be read line by line by the person whose expertise it encodes — a network manager who cannot write a line of Python can still read R5 below and argue with it. **Modular**: rules do not name one another; they interact only through working memory, so a rule can be added or deleted without rewriting the rest — and a whole branch can sit dormant, as you are about to see. The base is the knowledge; the interpreter is the control; that separation is the whole trick. It is why domain experts could audit the classic expert systems line by line rather than take them on faith.",
    },

    // ------------------------------------------------------------ the rule base + the trace
    {
      kind: "table",
      title: "The CAMPUS-NET rule base",
      headers: ["Rule", "Fires when all of", "Concludes", "Reads as"],
      rows: [
        [
          "R1",
          "`no-link`",
          "`physical-layer-fault`",
          "No link light: the fault is below the network layer — cable, port or interface",
        ],
        [
          "R2",
          "`no-link`, `cable-seated`, `port-tested-ok`",
          "`failing-nic`",
          "No link, cable firm, port proven good with another machine: suspect the machine's own interface",
        ],
        [
          "R3",
          "`failing-nic`",
          "`replace-nic`",
          "A failing interface is a hardware swap",
        ],
        [
          "R4",
          "`physical-layer-fault`, `cable-loose`",
          "`check-cable`",
          "Physical fault and a cable that moves in its socket: reseat or replace — the cheap fix first",
        ],
        [
          "R5",
          "`dhcp-error`, `physical-layer-fault`",
          "`dhcp-error-symptomatic`",
          "With the link down, no DHCP reply can arrive: the address failure is a symptom, not a second fault",
        ],
        [
          "R6",
          "`others-offline`, `ping-gateway-fails`",
          "`restart-router`",
          "A floor offline and the gateway unreachable: no single machine is at fault — restart the floor router",
        ],
        [
          "R7",
          "`remote-sites-unreachable`, `gateway-pings-ok`",
          "`escalate-to-isp`",
          "The gateway answers but the outside world does not: the fault is beyond campus — escalate to the ISP",
        ],
        [
          "R8",
          "`weak-signal`, `others-online`",
          "`wifi-marginal`",
          "The network is healthy; this desk is simply too far from the access point",
        ],
      ],
      caption:
        "A rule fires exactly when working memory contains every fact in its Fires-when column — never on a subset — and its conclusion then joins working memory like any observation. Diagnoses and recommended actions sit side by side: `physical-layer-fault` is something the base believes, `check-cable` something it recommends. Notice the evidential spread: R2 demands three facts before it will say anything, while R1 commits on one — a difference that matters the moment both match.",
    },
    {
      kind: "inferenceChain",
      title: "Tuesday's ticket, run forward",
      direction: "forward",
      facts: ["others-online", "weak-signal", "no-link", "cable-loose", "dhcp-error"],
      rules: [
        { id: "r1", label: "R1", if: ["no-link"], then: "physical-layer-fault" },
        {
          id: "r4",
          label: "R4",
          if: ["physical-layer-fault", "cable-loose"],
          then: "check-cable",
        },
        {
          id: "r5",
          label: "R5",
          if: ["dhcp-error", "physical-layer-fault"],
          then: "dhcp-error-symptomatic",
        },
        {
          id: "r8",
          label: "R8",
          if: ["weak-signal", "others-online"],
          then: "wifi-marginal",
        },
      ],
      derived: [
        "physical-layer-fault",
        "check-cable",
        "dhcp-error-symptomatic",
        "wifi-marginal",
      ],
      caption:
        "Tuesday, 09:14, room 214: everyone else in the building is online, the Wi-Fi is weak at the desk, the wall port shows no link light, the cable's retaining clip is broken, and the laptop never obtained an address — five facts. To make the trace definite, this run's RESOLVE takes the first matched rule in base order — an arbitrary choice, examined in the callout below. Cycle 1 is already a contest (R1 and R8 both match); R4 and R5 fire only after R1 puts `physical-layer-fault` into memory, so every firing after the first is a licensed cascade. R2, R3, R6 and R7 never fire — their conditions belong to faults this ticket does not have — and the run reaches quiescence at cycle 5. Verify every arrow yourself: at each firing, the rule's whole Fires-when column is a subset of working memory at that moment.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The question this architecture leaves open",
      text: "At cycle 2 of Tuesday's run, R4, R5 and R8 were all licensed — three matched rules, one heartbeat, and the interpreter fires exactly one. Working memory, the rules and the cycle are jointly silent on the choice: nothing in the architecture says which matched rule deserves to fire. Real rule engines therefore add a declared conflict-resolution strategy on top, and the choice is semantic, not cosmetic — different strategies can license different firing orders on the same facts, and on some bases different conclusions. Which strategies exist, what each one costs, and how to keep the choosing cheap as the base grows is the subject of the next lesson. Hold the question; it is the price of admission to forward chaining.",
    },

    // ------------------------------------------------------------ shine vs decay
    {
      kind: "text",
      text: "Where does this architecture earn its keep? Where the judgment is narrow and the vocabulary is stable — diagnosis, triage, configuration, eligibility: tasks whose observations and conclusions can be named in advance, and where the map between them really is rule-shaped. Tuesday's trace shows the other half of the case: every conclusion carries its license with it — which rule, from which facts — so the run doubles as an explanation, and the knowledge sat in a table a network manager could audit without reading a line of the interpreter. That combination of auditable knowledge, explainable conclusions and one reusable loop is what made the classic expert systems commercially real.\n\nAnd where does it decay? Three ways. First, breadth: rule-shaped expertise does not stretch over common sense; as the domain widens, exceptions multiply and the base grows rules faster than understanding. Second, scale: the celebrated systems grew to rule bases that became maintenance burdens in their own right — thousands of rules interacting through shared facts is a program again, just written in a harder language (a story the knowledge-engineering lesson tells properly). Third — the limit this part of the course is built around — rules are all-or-nothing: `no-link` either is a fact or is not, and nothing in the format says how sure the observation was. Real evidence comes with doubt attached; a knowledge format that cannot express doubt forces false certainty. When the classic systems needed to say \u201cweakly suggest,\u201d they reached for patches; the principled answer is probability, and it arrives in Module 2.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "f-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "The knowledge engineer deletes R7 (`escalate-to-isp`) from CAMPUS-NET and re-runs Tuesday's ticket: the trace is unchanged — same four firings, same conclusions. She re-adds R7; still unchanged. Which property of the rule format does this demonstrate, and why does it hold here?",
      options: [
        {
          text: "Modularity — rules interact only through working memory, and on this ticket no fact R7 cares about is present and no rule consumes its conclusion",
          correct: true,
          feedback:
            "Correct — and both halves are load-bearing: R7 never fires (`remote-sites-unreachable` and `gateway-pings-ok` never hold on this ticket), and nothing downstream misses `escalate-to-isp` because no rule's conditions mention it. An untriggered, unconsumed rule is invisible to the run.",
        },
        {
          text: "Declarativity — R7 states what follows from what, so deleting it changes nothing procedural",
          correct: false,
          feedback:
            "Declarativity is real but it is not what the deletion test shows: it is about a rule's meaning not mentioning control flow. A declarative rule can still be load-bearing — delete R1 instead and watch the cascade die.",
        },
        {
          text: "Quiescence — the run stops when no rule matches, so removing a rule cannot change anything",
          correct: false,
          feedback:
            "Quiescence is the stopping rule, not a guarantee of irrelevance. Delete R1 and three of the four firings vanish with it: no `physical-layer-fault`, so no R4 and no R5. R7 was deletable only because this ticket never satisfied it.",
        },
        {
          text: "Conflict resolution — with R7 gone, the interpreter has fewer rules to choose from, so the choice is easier",
          correct: false,
          feedback:
            "R7 was never in a conflict set on this ticket — it never matched — so the interpreter's choices are identical with or without it. (And conflict resolution is the next lesson's subject, not the property under test.)",
        },
      ],
      solution:
        "Modularity: rules are independent pieces that interact only through working memory. R7 is invisible to this trace because its conditions never hold and no rule consumes its conclusion — deleting it cannot change the firings, and neither can re-adding it.",
      explanation:
        "The deletion test is how engineers check modularity in practice: remove a rule, re-run the cases, and expect exactly the differences you can name in advance. It cuts both ways — the same test on R1 would delete the whole cascade — which is why mapping who consumes each conclusion is worth doing before you delete anything.",
      concepts: ["modularity", "rule base"],
    },
    {
      kind: "exercise",
      id: "f-01-e2",
      exerciseKind: "trace",
      prompt:
        "Wednesday brings a different ticket: a seminar room where every machine is offline. The script reports three facts — `others-offline`, `ping-gateway-fails`, `dhcp-error`. Trace CAMPUS-NET by hand under the same interpreter (one rule per cycle, first match in base order, a rule leaves the conflict set once its conclusion is believed). (a) Which rule fires, and what is derived before quiescence? (b) `dhcp-error` is present — why does R5 not fire? (c) What would a ticket have to report for R7 to fire instead, and why can this ticket never report it honestly?",
      solution:
        "(a) Cycle 1: only R6 matches — its conditions {`others-offline`, `ping-gateway-fails`} are both present — so it fires and derives `restart-router`; every other rule is missing at least one condition (R1 lacks `no-link`, R5 lacks `physical-layer-fault`, R8 lacks `weak-signal`, and so on). Cycle 2: R6's conclusion is now believed, nothing new matches — quiescence after one firing; derived = [`restart-router`]. (b) A rule fires only when working memory contains its WHOLE condition set: `dhcp-error` is one of R5's two conditions, and the other, `physical-layer-fault`, is only derivable through R1 from `no-link` — which no machine in the room reports. Partial evidence licenses nothing. (c) R7 needs `remote-sites-unreachable` together with `gateway-pings-ok` — the gateway answers, but the outside world does not. This ticket asserts `ping-gateway-fails`, which contradicts `gateway-pings-ok`: the two cannot honestly sit in one working memory, so R7 is knowledge this fault can never wake.",
      explanation:
        "This is the licensing discipline seen from the outside: the same base serves a completely different fault through a different entry point, and the facts — not the author — decide which branch lives. Note that quiescence after a single firing is still a complete run: one fault, one fix, nothing left to derive.",
      concepts: ["recognize-act cycle", "licensed firing", "quiescence"],
    },
    {
      kind: "exercise",
      id: "f-01-e3",
      exerciseKind: "concept-check",
      prompt:
        "Back on Tuesday's ticket at cycle 2: R4, R5 and R8 all match simultaneously — three licensed rules, one heartbeat. The interpreter must fire exactly one. What does the production-system architecture itself say about which one?",
      options: [
        {
          text: "Nothing — the three parts are jointly silent on the choice; it is a separate design decision, and which strategy answers it is the next lesson's subject",
          correct: true,
          feedback:
            "Correct — the architecture determines THAT one rule fires, never WHICH. That silence is why every serious rule engine carries a declared, inspectable conflict-resolution strategy — and why changing it counts as changing the system's semantics.",
        },
        {
          text: "Fire all three — the cycle only requires that every matched rule eventually fires",
          correct: false,
          feedback:
            "The pseudocode commits to one: `WM ← WM ∪ { r.THEN }` names a single rule r. Batching all matched rules into one pass is a real variant, but it hides the question rather than answering it — the batch still needs an order.",
        },
        {
          text: "The rule listed earliest in the base fires — that is what \u201cfirst match\u201d means",
          correct: false,
          feedback:
            "First-in-base-order was this lesson's declared tie-break for making the hand trace definite — an arbitrary choice, not the architecture's verdict. Any RESOLVE you can defend is architecturally legal; which defense is best is exactly the open question.",
        },
        {
          text: "It cannot happen — rules are modular, so two rules never match at once",
          correct: false,
          feedback:
            "Modularity means rules do not call or name each other — which is precisely WHY several can independently match the same facts at the same time. Tuesday's cycle 1 (R1, R8) and cycle 2 (R4, R5, R8) are both live conflicts.",
        },
      ],
      solution:
        "The architecture is silent: which matched rule fires is not determined by working memory, the rules or the cycle — it is the conflict-resolution question, answered by a declared strategy added on top. The next lesson is that answer.",
      explanation:
        "Recognizing the silence is the point of this lesson: the three parts fix the licensing discipline — full condition set, one conclusion at a time, quiescence — and leave the ordering to design. Everything the next lesson builds (strategies, tie-breaks, the Rete speed-up) fills exactly this gap.",
      concepts: ["conflict resolution", "recognize-act cycle"],
    },
  ],
  terms: [
    {
      term: "production rule",
      definition:
        "An IF-THEN pair — a condition set and a conclusion — asserting that whenever every condition is present, the conclusion may be added to working memory. One independently readable, independently deletable piece of expertise.",
    },
    {
      term: "working memory",
      definition:
        "The production system's single mutable store: the observations gathered so far plus every conclusion rules have derived. All rule interaction happens through it, and nothing else in the system changes.",
    },
    {
      term: "recognize-act cycle",
      definition:
        "The interpreter's heartbeat: match all rules against working memory (recognize), choose one matched rule (resolve), fire it (act) — repeated until quiescence.",
    },
    {
      term: "conflict set",
      definition:
        "The rules licensed at one cycle's recognize step — every rule whose conditions all hold and whose conclusion is not yet believed. Which one fires is the conflict-resolution question.",
    },
  ],
  mistakes: [
    {
      mistake:
        "Firing a rule on partial evidence — concluding `dhcp-error-symptomatic` from `dhcp-error` alone because \u201cthe link is probably down anyway\u201d.",
      why: "The subset test is the whole licensing discipline: working memory must contain the rule's entire condition set, or the firing is unlicensed — and every conclusion downstream of it inherits the unsoundness.",
      fix: "Tick every condition explicitly before allowing the firing; in a hand trace, write the fact set beside each cycle and check containment, not plausibility. The seminar-room exercise is this failure caught in the act.",
    },
    {
      mistake:
        "Reading the rule base as a program — hunting for what \u201ccalls\u201d R4, and concluding the base is broken because no rule invokes it.",
      why: "Rules do not invoke rules. Conclusions enter working memory, and matching — not calling — decides what happens next; control lives in the interpreter, which is the same loop for every base.",
      fix: "Trace data, not calls: at each cycle ask \u201cwhich rule's conditions do the CURRENT facts complete?\u201d. Tuesday's cascade — R1's conclusion completing R4's and R5's conditions — is what rule-to-rule flow actually looks like.",
    },
    {
      mistake:
        "Treating the interpreter's tie-break as the architecture's answer — believing \u201cfirst match in base order\u201d is simply how production systems choose.",
      why: "That ordering was this lesson's declared, arbitrary choice for making the hand trace definite. The architecture itself is silent on the choice, and different choices can license different traces — the choice is semantics, not plumbing.",
      fix: "Keep the RESOLVE step explicit and declared wherever you run rules, and treat any change of strategy as a semantic change to be re-tested — the next lesson's opening move.",
    },
    {
      mistake: "Reading quiescence as \u201cthe diagnosis is finished\u201d or \u201call the rules have had their say\u201d.",
      why: "Quiescence only means nothing new is derivable from the CURRENT facts with THIS base. Four rules stayed dormant on Tuesday — knowledge for faults the ticket did not contain — and more observations would wake them.",
      fix: "Read quiescence as \u201cthis ticket is exhausted\u201d, and record which rules stayed dormant as a map of what was never tested — the cheapest checklist for what to observe next.",
    },
  ],
  takeaways: [
    "A production system is three parts — working memory (the facts), a rule base (the knowledge), an interpreter (the loop) — and the knowledge never mentions the control.",
    "The recognize-act cycle — match, resolve, act, repeat — derives only licensed conclusions: a rule fires exactly when working memory contains its whole condition set.",
    "Quiescence, not goal-reaching, is the stop: the run ends when no rule can add a fact not already believed.",
    "Rules are knowledge you can inspect — declarative, modular, readable by the domain expert — the property that let classic expert systems be audited rather than trusted.",
    "When several rules match, the architecture is silent: which one fires is the conflict-resolution question, and the next lesson's subject.",
  ],
  quiz: [
    {
      id: "f-01-q1",
      prompt:
        "In a production system, where does control flow — the answer to \u201cwhat happens next?\u201d — live?",
      options: [
        {
          text: "In the interpreter: the cycle owns when matching, choosing and firing happen; rules never invoke anything",
          correct: true,
          feedback:
            "Correct — the knowledge/control separation. The base says what follows from what; the loop decides when and how it is applied.",
        },
        {
          text: "In the rules: each rule's THEN-part triggers the next rule",
          correct: false,
          feedback:
            "That is procedural chaining — what ordinary code does. A THEN-part asserts a fact into working memory; whether that fact matters is decided by matching, never by the rule that produced it.",
        },
        {
          text: "In working memory: the newest fact decides what runs next",
          correct: false,
          feedback:
            "Working memory is a passive store — facts do not decide anything; they are matched against. The deciding is the interpreter's step.",
        },
        {
          text: "In the programmer: every legal firing order is scripted in advance",
          correct: false,
          feedback:
            "Then the rules would be decoration. The point of the architecture is that orderings emerge from matching against whatever facts arrive — the same base handles tickets nobody scripted.",
        },
      ],
      explanation:
        "This separation is why a rule base can be swapped between domains while the interpreter stays fixed — and why domain experts can audit the knowledge without reading a line of control code.",
    },
    {
      id: "f-01-q2",
      prompt:
        "A network manager who cannot read a line of Python reads R5 and rules: \u201cif the link is down, the DHCP error is a symptom, not a second fault — I agree.\u201d Which property of the rule format is she exercising?",
      options: [
        {
          text: "Inspectability — each rule is a self-contained claim in the domain's own vocabulary, readable and arguable one line at a time",
          correct: true,
          feedback:
            "Correct — and notice what made it possible: the rule's whole meaning is on its face. It states a claim about networks, not a step in a computation, so judging it takes network knowledge and nothing else.",
        },
        {
          text: "Modularity — rules can be added and deleted independently",
          correct: false,
          feedback:
            "Modularity is the maintenance property (delete R7 and Tuesday's trace survives); the manager's act is understanding and judging a single claim as written — a reading property, not a change property.",
        },
        {
          text: "Quiescence — the interpreter stops when no rule matches",
          correct: false,
          feedback:
            "A stopping condition of the interpreter, not a property of the knowledge's form — it has nothing to do with what the manager can read.",
        },
        {
          text: "Declarativity — the rules state conclusions without specifying control flow",
          correct: false,
          feedback:
            "Declarativity is what makes a rule's meaning independent of execution — the precondition. The property being exercised, a domain expert judging the claim, is inspectability: the payoff, not the mechanism.",
        },
      ],
      explanation:
        "Inspectability was the expert-system bet: if the knowledge reads like the domain's own judgment, the people accountable for that judgment can review it. The classic systems could be examined line by line by the experts whose expertise they encoded — for exactly this reason.",
    },
    {
      id: "f-01-q3",
      prompt: "Tuesday's run stopped at cycle 5. The interpreter's stop condition was:",
      options: [
        {
          text: "Quiescence — no rule could add a fact not already believed: every rule either had an unmet condition or an already-held conclusion",
          correct: true,
          feedback:
            "Correct — the fixpoint reading: working memory then contains everything the base can derive from this ticket, and nothing more is licensed.",
        },
        {
          text: "All eight rules had fired",
          correct: false,
          feedback:
            "Four fired; R2, R3, R6 and R7 never did — their conditions belong to faults this ticket does not have. A run does not need to touch every rule: dormant rules are knowledge held for other tickets.",
        },
        {
          text: "A goal state was reached",
          correct: false,
          feedback:
            "This run has no single goal — it derives whatever the facts support, which is exactly why the stop condition must be quiescence. Goal-driven reasoning exists (backward chaining, two lessons ahead) and reverses precisely this direction.",
        },
        {
          text: "Working memory was full",
          correct: false,
          feedback:
            "Nothing in the architecture caps working memory; it grows monotonically — one new fact per firing — until nothing new can be derived. The bound is derivability, not capacity.",
        },
      ],
      explanation:
        "Quiescence is the honest stop: it reports exactly what the current facts license. More facts would wake the dormant rules — the seminar-room exercise shows a one-firing run on the very same base.",
    },
  ],
};
