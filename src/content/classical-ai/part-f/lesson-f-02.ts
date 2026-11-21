/**
 * Lesson f-02 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_02: ClassicalLesson = {

  slug: "f-02",
  title: "Forward Chaining: Rete and Conflict Resolution",
  minutes: 35,
  summary:
    "Data-driven reasoning: match rules against working memory, decide what fires, repeat — with the Rete speed-up idea.",
  kind: "coding",
  objectives: [
    "Trace the recognize-act cycle over a rule base, step by step",
    "Apply conflict-resolution strategies and predict their different firing orders",
    "Implement a forward chainer with explanation of its trace",
    "Explain the Rete idea: incremental matching across cycles",
  ],
  why: "The production system is the architecture that carried AI into industry: MYCIN's therapy advice, XCON's computer configurations, and a thousand business-rule engines since — all of them one loop: match rules against working memory, resolve the conflict set, fire, repeat. The loop's two engineering questions are this lesson: WHO fires when several match (conflict resolution — a design decision with semantic consequences, not an implementation detail), and HOW to keep matching cheap as memory churns (the Rete idea — remember partial matches, re-match only what changed). Every modern rule engine, from Drools to business-process tooling, still answers both questions this lesson teaches.",
  blocks: [
    {
      kind: "text",
      text: "A production system has three parts: **working memory** (the facts, changing), the **rule base** (IF conditions THEN conclusion, static), and the **interpreter** — the loop. One pass of the loop is the recognize-act cycle:",
    },
    {
      kind: "algorithm",
      name: "The recognize-act cycle",
      family: "Production systems",
      problem: "Derive every conclusion the rules support over the current facts, one firing at a time, until quiescence or a goal state.",
      idea:
        "Match: find every rule whose conditions all hold. Resolve: pick one from the conflict set — by strategy. Act: fire it, adding its conclusion to working memory. Repeat: the new fact may license new rules.",
      strategy: [
        "MATCH: evaluate every rule's IF-parts against working memory",
        "collect the conflict set: every fireable rule-instance",
        "RESOLVE: choose by strategy (specificity, recency, priority)",
        "ACT: add the THEN-part; repeat until no rule matches",
      ],
      guarantees: [
        "Terminates when no new conclusions are derivable (quiescence)",
        "The firing ORDER depends on the resolution strategy — and so, sometimes, do the conclusions",
      ],
      useWhen: [
        "Data arrives incrementally and conclusions should follow: monitoring, triage, configuration",
        "Knowledge is naturally rule-shaped and inspected by domain experts",
      ],
      pitfalls: [
        "Rules that retract each other's support can loop — cycle detection is the standard guard",
        "Strategy is semantics: swapping recency for specificity can change what the system concludes",
      ],
    },
    {
      kind: "inferenceChain",
      title: "A forward pass over a triage rule base",
      direction: "forward",
      facts: ["fever", "cough", "body-aches", "recent-travel", "rash"],
      rules: [
        { id: "r1", label: "R1", if: ["fever", "cough"], then: "influenza-likely" },
        { id: "r2", label: "R2", if: ["influenza-likely", "body-aches"], then: "influenza" },
        { id: "r3", label: "R3", if: ["fever", "recent-travel", "rash"], then: "tropical-screen" },
        { id: "r4", label: "R4", if: ["tropical-screen"], then: "order-dengue-test" },
        { id: "r5", label: "R5", if: ["influenza-likely"], then: "rest-and-fluids" },
        { id: "r6", label: "R6", if: ["fever", "rash"], then: "measles-screen" },
        { id: "r7", label: "R7", if: ["order-dengue-test"], then: "notify-public-health" },
        { id: "r8", label: "R8", if: ["influenza"], then: "antiviral-considered" },
      ],
      derived: [
        "tropical-screen",
        "influenza-likely",
        "influenza",
        "measles-screen",
        "antiviral-considered",
        "rest-and-fluids",
        "order-dengue-test",
        "notify-public-health",
      ],
      caption:
        "Eight rules of the ten-rule base below (R9's supportive care and R10's vaccination review fire in the program too). Cycle 1's conflict set is {R1, R3, R6, R9}: SPECIFICITY picks R3 — three conditions against two, two, and one. Read the rule list under the diagram: every firing is a licensed, inspectable move.",
    },
    {
      kind: "definition",
      term: "Conflict resolution",
      informal:
        "When several rules match, the strategy that chooses: specificity (most conditions matched), recency (facts most recently added), priority (author-declared order).",
      formal: "\\text{fire} = \\max_{r \\in \\text{conflict set}} \\text{strategy}(r)",
      why: "The strategy encodes intent — and different strategies license different traces on the SAME rule base. It is the production system's semantics dial.",
    },
    { kind: "heading", text: "The strategy, measured" },
    {
      kind: "pythonImpl",
      title: "A forward chainer with specificity + recency resolution",
      intent:
        "Run the loop with a declared strategy over a ten-rule triage base, printing each cycle's conflict set and the strategy's choice — ten firings, three tiebreaks, all visible in the trace.",
      code: `# forward chaining with specificity + recency + rule-order conflict resolution
RULES = [
    ("R1",  ["fever", "cough"],                  "influenza-likely"),
    ("R2",  ["influenza-likely", "body-aches"],  "influenza"),
    ("R3",  ["fever", "recent-travel", "rash"],  "tropical-screen"),
    ("R4",  ["tropical-screen"],                 "order-dengue-test"),
    ("R5",  ["influenza-likely"],                "rest-and-fluids"),
    ("R6",  ["fever", "rash"],                   "measles-screen"),
    ("R7",  ["order-dengue-test"],               "notify-public-health"),
    ("R8",  ["influenza"],                       "antiviral-considered"),
    ("R9",  ["fever"],                           "paracetamol-advised"),
    ("R10", ["measles-screen", "recent-travel"], "review-vaccination-history"),
]
FACTS = ["fever", "cough", "body-aches", "recent-travel", "rash"]

wm = dict.fromkeys(FACTS, 0)          # fact -> arrival index (initial facts all tie at 0)
fired = set()
cycle = 0
while True:
    cycle += 1
    matches = [(rid, conds) for rid, conds, _ in RULES
               if all(c in wm for c in conds) and rid not in fired]
    if not matches:
        break
    # strategy: specificity (more conditions), then recency (newest condition),
    # then rule-base order (max() returns the first maximal element)
    rid, conds = max(matches, key=lambda m: (len(m[1]), max(wm[c] for c in m[1])))
    _, _, conclusion = next(r for r in RULES if r[0] == rid)
    conflict = ", ".join(m[0] for m in matches)
    print(f"cycle {cycle}: conflict {{{conflict}}} -> fire {rid} => {conclusion}")
    wm[conclusion] = len(wm)
    fired.add(rid)
print(f"quiescence after {len(fired)} firings")
print("final working memory:", ", ".join(wm))`,
      output: `cycle 1: conflict {R1, R3, R6, R9} -> fire R3 => tropical-screen
cycle 2: conflict {R1, R4, R6, R9} -> fire R1 => influenza-likely
cycle 3: conflict {R2, R4, R5, R6, R9} -> fire R2 => influenza
cycle 4: conflict {R4, R5, R6, R8, R9} -> fire R6 => measles-screen
cycle 5: conflict {R4, R5, R8, R9, R10} -> fire R10 => review-vaccination-history
cycle 6: conflict {R4, R5, R8, R9} -> fire R8 => antiviral-considered
cycle 7: conflict {R4, R5, R9} -> fire R5 => rest-and-fluids
cycle 8: conflict {R4, R9} -> fire R4 => order-dengue-test
cycle 9: conflict {R7, R9} -> fire R7 => notify-public-health
cycle 10: conflict {R9} -> fire R9 => paracetamol-advised
quiescence after 10 firings
final working memory: fever, cough, body-aches, recent-travel, rash, tropical-screen, influenza-likely, influenza, measles-screen, review-vaccination-history, antiviral-considered, rest-and-fluids, order-dengue-test, notify-public-health, paracetamol-advised`,
      walkthrough: [
        "Cycle 1's conflict set is {R1, R3, R6, R9}: SPECIFICITY picks R3 — three conditions against two, two, and one. The rule that says the most is the rule that knows the most about this patient.",
        "Cycle 2: R1 and R6 tie at two conditions AND at recency 0 (all initial facts arrived together) — so rule-base ORDER decides, and Python's max() returns the first maximal element: R1. A strategy's last tiebreak is a design decision too.",
        "Cycle 3: R2 and R6 both carry two conditions, and now RECENCY separates them — R2's newest condition (influenza-likely, derived at cycle 2) outranks R6's initial rash. The derived fact is one cycle old; the rash has been sitting there since cycle 1.",
        "Cycles 5–9: among one-condition rules, recency ranks by the freshness of each condition — R10 (measles-screen just derived) at cycle 5, then R8, R5, R4, and the public-health cascade R7 the moment R4 creates its condition.",
        "R9 (paracetamol for fever) is matchable from cycle 1 yet fires LAST — strategies order the matched; no strategy can promote a rule past every more-specific competitor. It still fires: fever alone licenses supportive care.",
        "Ten firings, then quiescence: every rule that can fire has — the fixpoint reached by the data, not by a stopping flag.",
      ],
      project: "The Diagnostic Advisor project's forward engine is this program grown up: retraction, negation, and the WHY/HOW trace of the next lesson.",
    },
    { kind: "heading", text: "The Rete idea: stop re-matching everything" },
    {
      kind: "text",
      text: "The naive loop re-evaluates every rule against every fact every cycle — O(rules × facts) per firing, wasteful when one firing changes one fact. **Rete** (Latin for 'net') observes that most of the match structure survives: a rule testing fever, cough AND body-aches holds a token for 'fever ∧ cough matched' even after the cycle that added body-aches fires something unrelated. The algorithm builds a network of condition nodes, routes facts through it, and remembers the partial matches — so each working-memory change propagates incrementally, touching only the rules whose patterns could care. The payoff was historic: OPS5-era systems ran thousands of rules against thousands of facts in interactive time, and every serious rule engine since implements some Rete descendant.",
    },
    {
      kind: "callout",
      tone: "analogy",
      title: "Rete in one sentence",
      text: "A truth-maintenance subscription service for rule matching: each condition node is a watcher that tells its parent when its pattern gains or loses a witness, so the full 'which rules match' answer is always current — at the cost of memory proportional to the partial matches, never recomputed from scratch. It is AC-3's queue discipline, re-invented for pattern matching: propagate the CHANGE, not the whole state.",
    },
    {
      kind: "steps",
      title: "What the Rete network keeps between cycles",
      items: [
        "Alpha memories: for each condition pattern ('fever present', 'rash present'), the set of facts currently matching it — updated on each arrival, never recomputed from scratch.",
        "Beta memories: for each rule, the partial joins — which combinations of its conditions have matches so far. With the five initial facts, R10's recent-travel condition has a witness but its measles-screen condition does not; the beta node sits half-filled until cycle 4 derives one, and the network already knows R10 cannot fire before then.",
        "The change feed: each working-memory addition or retraction propagates through only the condition nodes its pattern can touch — one fact, one small ripple through the network.",
        "The payoff: after a firing, the conflict set updates in time proportional to what changed, not to rules × facts — memory buys speed, and the trace above would cost the same whether the base held ten rules or ten thousand.",
      ],
    },
    {
      kind: "complexity",
      title: "The matching cost, two ways",
      rows: [
        { algorithm: "Naive re-match (each cycle)", best: "O(R × C)", average: "O(R × C)", worst: "O(R × C)", space: "O(F)", note: "R rules × C conditions each, re-evaluated every cycle — most of the work proves nothing new" },
        { algorithm: "Rete (incremental per change)", best: "O(1)", average: "O(affected patterns)", worst: "O(R × C)", space: "O(partial matches)", note: "one change touches only the patterns that can care; degenerates only when a change ripples through every join", highlight: true },
      ],
      reading:
        "Matching is the cycle's bottleneck, and the two rows price the same loop differently: from-scratch matching pays R × C every cycle; Rete pays memory to make each firing's cost proportional to the change. The worst-case row is honest — a heavily-joined fact can still ripple widely.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "f-02-e1",
      exerciseKind: "predict-output",
      prompt:
        "Remove 'rash' from FACTS (the patient has no rash; keep everything else). Predict the FIRST TWO rules to fire, in order — then run the modified program and check. Type the two rule ids, comma-separated.",
      expectedOutput: "R1, R2",
      solution: "R1, R2",
      explanation:
        "Without rash, R3 and R6 (both need it) never match — data flow gates what any strategy can even consider. Cycle 1's conflict set is {R1, R9}: R1 wins on SPECIFICITY (two conditions over one). Cycle 2: {R2, R5, R9} — R2's two conditions beat the single-condition rules. The rash rules' absence also starves R4, R7 and R10 downstream: the run totals five firings instead of ten, and the whole tropical-disease branch of the trace vanishes.",
      concepts: ["data flow", "specificity"],
    },
    {
      kind: "exercise",
      id: "f-02-e2",
      exerciseKind: "trace",
      prompt:
        "At cycle 3 the program fires R2 before R6 — both have two conditions. (a) Cite the exact criterion that decided, with the arrival numbers. (b) Would moving R6 ABOVE R2 in the RULES list flip cycle 3 to R6? Why or why not? (c) Which single initial fact's deletion would make R6 fire before R2 ever could?",
      solution:
        "(a) RECENCY: R2's newest condition is influenza-likely (derived at cycle 2, arrival 6); R6's conditions fever and rash are both initial (arrival 0). Key (2, 6) beats (2, 0). (b) NO — rule order is only the LAST tiebreak, consulted only when specificity AND recency both tie; recency already separates these two. (c) body-aches: it is one of R2's conditions, so deleting it makes R2 unmatchable — cycle 3's contest then has R6 as the only two-condition rule and it wins on specificity. (Deleting fever instead kills both R2 and R6 — and R1, R3, R9 too: fever is the busiest fact in the base.)",
      explanation:
        "Three lessons in one contest: the tiebreaks form a lexicographic order (specificity, then recency, then rule order); recency outranks rule order in the key; and data flow still gates everything — the cleanest way to change a firing is to change what can match at all.",
      concepts: ["recency", "tie-breaking", "data flow"],
    },
    {
      kind: "exercise",
      id: "f-02-e3",
      exerciseKind: "concept-check",
      prompt:
        "Your forward chainer will run 5,000 rules against 50,000 facts, with maybe three facts changing per cycle. The naive matcher is too slow. The Rete fix, in one sentence:",
      options: [
        { text: "Batch the rules and evaluate them with vectorized joins", correct: false, feedback: "Faster constants, same complexity class — the waste is re-matching the UNCHANGED 49,997 facts, and no batch fixes that." },
        { text: "Keep the partial matches in a persistent network and propagate only each change — touching only rules whose patterns could be affected", correct: true, feedback: "Correct — the incremental discipline: memory buys speed. Cost: the network's memory footprint and the engineering of invalidation, which is exactly what rule-engine internals are about." },
        { text: "Fire rules in parallel and merge the conclusions", correct: false, feedback: "Parallelism multiplies throughput but keeps the per-cycle full-match cost — and introduces its own conflict-resolution headaches." },
        { text: "Convert the rules to a decision tree", correct: false, feedback: "Rules interact through shared conclusions; trees cannot express the cross-products without exploding." },
      ],
      solution: "Propagate changes, not states: the Rete network's partial-match memory makes each firing cost proportional to what changed.",
      explanation: "The change-propagation idea is everywhere once you see it: AC-3's queue, Rete's network, React's render tree — same shape, different domain.",
      concepts: ["Rete", "incremental matching"],
    },
  ],
  terms: [
    {
      term: "working memory",
      definition: "The production system's fact store — the only mutable state, changed one conclusion at a time by firing rules.",
    },
    {
      term: "conflict set",
      definition: "All rule instances whose conditions hold at a cycle's match phase; the resolution strategy chooses one to fire.",
    },
    {
      term: "quiescence",
      definition: "The loop's natural end: no rule matches and nothing new is derivable — the fixpoint of the rule base over the facts.",
    },
    {
      term: "Rete network",
      definition: "A persistent index of rule conditions holding partial matches, updated incrementally per working-memory change — the production system's performance engine.",
    },
  ],
  mistakes: [
    {
      mistake: "Re-matching every rule every cycle and calling it a day.",
      why: "It works at toy scale and dies at product scale: 5,000 × 50,000 evaluations per firing, most proving nothing new.",
      fix: "Propagate changes (Rete, or its descendants): index conditions, maintain partial matches, update only what a change touches.",
    },
    {
      mistake: "Leaving the conflict-resolution strategy implicit.",
      why: "The trace — and sometimes the conclusions — depend on it; an unspecified strategy means the system's behavior is an accident of implementation order.",
      fix: "Declare the strategy beside the rule base, document the tie-breaks, and test that swapping strategies produces the differences you EXPECT (and no others).",
    },
  ],
  takeaways: [
    "The recognize-act cycle is the whole interpreter: match, resolve, act, repeat — with quiescence as the honest stopping rule.",
    "Conflict resolution is semantics, not plumbing: specificity, recency and priority license different traces on the same rules.",
    "Strategies order the MATCHED; data flow still gates what can fire at all.",
    "Rete's incremental matching is change-propagation — the same discipline as AC-3's queue, applied to pattern indexing.",
    "The firing trace is the audit trail: the feature that made expert systems trustworthy to their domains.",
  ],
  quiz: [
    {
      id: "f-02-q1",
      prompt: "In the traced run, R3 fired before R1 because:",
      options: [
        { text: "R3 is listed after R1 in the rule base", correct: false, feedback: "Rule order never entered — and had it, R1 would have won (listed first)." },
        { text: "R3 matched more conditions: specificity resolution prefers the more specific pattern", correct: true, feedback: "Correct — 3 conditions beat 2; the strategy read 'fever + travel + rash' as the more committed, more specific situation." },
        { text: "R3's conclusion was more urgent", correct: false, feedback: "Urgency is priority resolution's vocabulary; it was not the strategy in force." },
        { text: "R1's conditions were not yet satisfied", correct: false, feedback: "Both matched from cycle 1 — that is what made it a conflict set." },
      ],
      explanation: "Specificity encodes a defensible default: the rule that says more is the rule that knows more about the situation.",
    },
    {
      id: "f-02-q2",
      prompt: "The Rete network's core trade is:",
      options: [
        { text: "Speed for correctness — some matches are missed", correct: false, feedback: "Rete is exact: every match the naive loop finds, the network finds — the results are identical." },
        { text: "Memory for time: partial matches are stored so each change propagates incrementally instead of re-matching wholesale", correct: true, feedback: "Correct — the classic indexing trade, and the reason rule engines are memory-hungry at scale." },
        { text: "Rules for facts — the network converts between them", correct: false, feedback: "It indexes rules' conditions over the fact stream; nothing converts." },
        { text: "Compile time for run time — rules are compiled to machine code", correct: false, feedback: "Some engines DO compile (a different technique); Rete's innovation is the persistent match state." },
      ],
      explanation: "Memory-for-time is Rete's contract; exactness is preserved — a pure performance architecture.",
    },
  ],

};
