/**
 * PART F · MODULE 1 · CHAPTER "Explanation and Engineering" · LESSON f-03
 * "Backward Chaining and Explanation"
 *
 * Runs over the SAME ten-rule triage base as f-02 (RULES and FACTS are
 * identical, in the same order). The pythonImpl's quiet pass is the
 * regression check against f-02's verified forward trace (R3, R1, R2,
 * R6, R10, R8, R5, R4, R7, R9 — ten firings, then quiescence): every
 * conclusion the forward run derived, the backward chainer proves, each
 * by the very rule that derives it.
 *
 * Every `output`/`expectedOutput` below is the REAL stdout of running
 * the code with python3 (scripts/verify-one-lesson.ts machine-verifies).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_03: ClassicalLesson = {

  slug: "f-03",
  title: "Backward Chaining and Explanation",
  minutes: 30,
  summary:
    "Goal-driven reasoning and the WHY/HOW traces that made rule systems auditable — implemented, not just described.",
  kind: "coding",
  objectives: [
    "Prove or refute a goal by hand over a rule base, drawing the goal tree it expands to",
    "Implement a backward chainer whose WHY trace reports the goal stack and whose HOW trace reports the rule chain",
    "Explain the two base cases — the fact and the unprovable leaf — and why the second must fail cleanly rather than crash",
    "Choose forward or backward chaining from the economics of facts and goals in a domain",
  ],
  why: "Forward chaining, for all its power, has an awkward economics in the clinic: it wants the facts first, then derives everything — but every fact costs something. MYCIN's facts were questions to a busy physician and laboratory tests on a sick patient; a system that needed everything before concluding anything would have been unusable. Backward chaining inverts the trade: name the decision — does this case require a public-health notification? — and collect only what that decision's goal tree requires. This lesson implements the inversion over the SAME ten-rule triage base as the previous lesson, so the two directions can be checked against each other, conclusion for conclusion. And it rebuilds the feature that made rule systems trusted in high-stakes domains: the explanation. WHY ('why do you need to know that?') is a snapshot of the goal stack; HOW ('how did you conclude that?') is the successful rule trace. A modern classifier can tell you its answer; a backward chainer can show its case, in the vocabulary the domain expert wrote — and that auditability, as much as any accuracy figure, is what carried expert systems into hospitals and factories.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Last lesson the chainer began where the data was: five facts in, ten firings, every derivable conclusion out — the right posture when the data arrives anyway. A clinician at the bedside is not in that posture. A patient with fever and a travel history does not need everything the rule base can derive; they need one decision, and every extra question costs the physician time and the patient discomfort, delay, and risk. **Backward chaining** turns the rules around to serve exactly that economy: name the goal — *does this case require a public-health notification?* — and the rules run in reverse, consulting only what that decision needs. On f-02's ten-rule base the query touches three rules and three facts; the other seven rules are never consulted. And because the reasoning is now a visible chain from goal to evidence, it can finally answer the two questions that made rule systems auditable: *why do you need to know that?* and *how did you conclude that?*",
    },
    { kind: "heading", text: "From data-driven to goal-driven" },
    {
      kind: "definition",
      term: "Backward chaining",
      informal:
        "Goal-driven reasoning: to prove a goal, take a rule that concludes it and prove each of that rule's conditions as a subgoal, recursing until every branch lands on a fact. Forward chaining asks \u201cwhat follows from what I know?\u201d; backward chaining asks \u201cwhat would establish what I want?\u201d",
      formal:
        "\\text{Prove}(g) \\iff (g \\in F) \\lor (\\exists r \\in R : \\text{then}(r) = g \\land \\forall c \\in \\text{if}(r) : \\text{Prove}(c))",
      why: "The recursion is the entire algorithm — three exits (fact, rule, failure) and no loop to manage: f-02's recognize-act cycle collapses into the call stack.",
    },
    {
      kind: "definition",
      term: "Goal tree",
      informal:
        "The AND/OR tree a backward proof expands to: the children of a goal are the conditions of the rule being tried (an AND — every child must be proved), and the choice among several rules that conclude the same goal is an OR — one success suffices, so a failed branch retreats to the next alternative.",
      formal: "g \\to c \\iff \\exists r : \\text{then}(r) = g \\land c \\in \\text{if}(r)",
      why: "Read top-down it is the system's plan of inquiry; read bottom-up, its justification — the same tree answers WHY on the way down and HOW on the way up.",
    },
    {
      kind: "inferenceChain",
      title: "The same rule base, queried from the other end",
      direction: "backward",
      facts: ["fever", "cough", "body-aches", "recent-travel", "rash"],
      rules: [
        { id: "r7", label: "R7", if: ["order-dengue-test"], then: "notify-public-health" },
        { id: "r4", label: "R4", if: ["tropical-screen"], then: "order-dengue-test" },
        { id: "r3", label: "R3", if: ["fever", "recent-travel", "rash"], then: "tropical-screen" },
      ],
      derived: ["tropical-screen", "order-dengue-test", "notify-public-health"],
      goal: "notify-public-health",
      caption:
        "Read the rule list top-down for the decomposition the chainer performs (R7 wants order-dengue-test; R4 wants tropical-screen; R3 wants three facts); read `derived` bottom-up for the order the conclusions are ESTABLISHED on the unwind — the two orders are mirror images, which is this lesson's whole point. Each conclusion in this base has exactly one producing rule, so the tree has no OR-branches; the program below still tries every producer in turn, which is what retreating through OR-branches looks like when they exist.",
    },
    { kind: "heading", text: "MYCIN's explanation contract: WHY and HOW" },
    {
      kind: "callout",
      tone: "info",
      title: "The two questions every rule system owes its user",
      text: "MYCIN — Stanford, early 1970s, a therapy advisor for bacteremia — ran backward for exactly the economic reason above: it asked the clinician only what the therapy decision needed. But its celebrated feature was what the clinician could ask BACK. At any question, \u201cwhy do you need to know that?\u201d — and the system answered with the goal stack: the rule it was trying to fire, the conclusion that rule served, and the goal above that. At any conclusion, \u201chow did you conclude that?\u201d — and the system answered with the rule trace: the rules that fired and how each of their conditions had been established. Those two interactions became the explanation contract of the field: WHY justifies the QUESTION by showing the context above it; HOW justifies the ANSWER by showing the derivation beneath it.",
    },
    {
      kind: "definition",
      term: "Explanation trace",
      informal:
        "The WHY/HOW record of a backward proof. WHY lines snapshot the goal stack as the recursion descends — each question justified by the rules and goals above it; HOW lines report the successful rules as the recursion unwinds — each conclusion justified by the evidence beneath it.",
      formal:
        "\\text{WHY}(g) = \\text{the goal stack above } g \\quad \\text{HOW}(g) = \\text{the rule trace beneath } g",
      why: "The explanation is not a second pass over the run — it is the recursion's own state: the ancestors passed down as arguments, the proof tree passed up as the return value.",
    },
    { kind: "heading", text: "The recursion, and where it stops" },
    {
      kind: "pseudocode",
      title: "BACKCHAIN — the goal-driven recursion",
      lines: [
        { text: "function PROVE(goal, context)", indent: 0, note: "context: the ⟨rule, goal⟩ chain above this question — the WHY stack" },
        { text: "WHY(goal, context)", indent: 1, note: "announce the question in its context, on the way down" },
        { text: "IF goal ∈ FACTS THEN RETURN fact", indent: 1, note: "base case 1 — the fact table answers before any rule is tried" },
        { text: "IF goal ∈ context THEN RETURN fail", indent: 1, note: "cycle guard — a goal cannot appear in its own proof" },
        { text: "FOR each rule R with THEN = goal, in rule-base order", indent: 1, note: "the OR-branches: every way there is to conclude the goal" },
        { text: "proofs ← { PROVE(c, context + ⟨R, goal⟩) : c ∈ R.if }", indent: 2, tone: "key", note: "THE RECURSION — each condition becomes a subgoal, asked in richer context" },
        { text: "IF no proof in proofs failed THEN", indent: 2, note: "an AND-node needs all of its children" },
        { text: "HOW(goal, R, proofs)", indent: 3, note: "on the way back up: the rule, and how each condition was established" },
        { text: "RETURN proof(R, proofs)", indent: 3 },
        { text: "RETURN fail", indent: 1, tone: "key", note: "base case 2 — the unprovable leaf: no fact, and no rule could conclude it" },
      ],
      note:
        "Two exits succeed (a fact, a rule) and one fails; the WHY stack goes down as an argument and the proof tree comes up as the return — the explanation is the recursion's own plumbing, not a bolt-on.",
    },
    {
      kind: "pythonImpl",
      title: "A backward chainer that explains itself",
      intent:
        "Run the recursion over the f-02 rule base for the query notify-public-health — WHY lines as it descends, HOW lines as it unwinds — then the quiet 10/10 agreement check against f-02's forward trace, then a query that must fail cleanly at an unprovable leaf.",
      code: `# backward chaining with WHY/HOW explanation over the f-02 triage rule base
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
FACTS = {"fever", "cough", "body-aches", "recent-travel", "rash"}

def producers(goal):
    """every rule that concludes goal, in rule-base order (the OR-branches)"""
    return [(rid, conds) for rid, conds, then in RULES if then == goal]

def why_line(goal, ancestors):
    """WHY = the goal stack above this question"""
    if not ancestors:
        return f"WHY {goal}? it is the query"
    needs = ", needed by ".join(f"{r} for {g}" for r, g in reversed(ancestors))
    return f"WHY {goal}? needed by {needs}"

def prove(goal, ancestors=(), verbose=True):
    """backward-chain goal; return a proof tree, or None.
    ancestors: the (rule, parent-goal) chain above us -- the WHY stack."""
    pad = "  " * len(ancestors)
    if verbose:
        print(pad + why_line(goal, ancestors))
    if goal in FACTS:
        if verbose:
            print(pad + f"-> {goal} is a fact")
        return ("fact",)
    for rid, conds in producers(goal):
        sub = ancestors + ((rid, goal),)
        proofs = [(c, prove(c, sub, verbose)) for c in conds]
        if all(p is not None for _, p in proofs):
            if verbose:
                supports = ", ".join(
                    f"{c} ({'fact' if p[0] == 'fact' else 'proved by ' + p[0]})"
                    for c, p in proofs)
                print(pad + f"HOW {goal}: {rid} <- {supports}")
            return (rid, proofs)
    if verbose:
        if producers(goal):
            print(pad + f"-> {goal}: no fact, and no rule could prove it")
        else:
            print(pad + f"-> {goal}: unprovable leaf (no fact, no rule concludes it)")
    return None

def explain(goal, proof):
    """HOW = the successful rule trace, folded into one sentence"""
    if proof[0] == "fact":
        return goal
    rid, sub = proof
    if all(p[0] == "fact" for _, p in sub):
        return f"{rid} because {' and '.join(c for c, _ in sub)} (all facts)"
    parts = [f"{c} (fact)" if p[0] == "fact"
             else f"{c}, which was {explain(c, p)}" for c, p in sub]
    return f"{rid} because {' and '.join(parts)}"

# --- 1. the main query: a four-level goal tree ---------------------------
query = "notify-public-health"
print(f"=== query: {query} ===")
proof = prove(query)
print(f"HOW {query}, in one sentence: {explain(query, proof)}")

# --- 2. agreement with f-02's forward run --------------------------------
print()
print("=== agreement with f-02: query all ten conclusions quietly ===")
proved = 0
for _, _, then in RULES:
    p = prove(then, verbose=False)
    proved += p is not None
    print(f"{then}: {'proved by ' + p[0] if p else 'NOT proved'}")
print(f"{proved}/10 proved -- the backward chainer agrees with f-02's forward trace")

# --- 3. a query that must fail cleanly ------------------------------------
print()
FACTS.discard("rash")
print("=== failure case: 'rash' removed from the facts, query measles-screen ===")
prove("measles-screen")
print("=> measles-screen NOT proved: the tree died at 'rash', an unprovable leaf")`,
      output: `=== query: notify-public-health ===
WHY notify-public-health? it is the query
  WHY order-dengue-test? needed by R7 for notify-public-health
    WHY tropical-screen? needed by R4 for order-dengue-test, needed by R7 for notify-public-health
      WHY fever? needed by R3 for tropical-screen, needed by R4 for order-dengue-test, needed by R7 for notify-public-health
      -> fever is a fact
      WHY recent-travel? needed by R3 for tropical-screen, needed by R4 for order-dengue-test, needed by R7 for notify-public-health
      -> recent-travel is a fact
      WHY rash? needed by R3 for tropical-screen, needed by R4 for order-dengue-test, needed by R7 for notify-public-health
      -> rash is a fact
    HOW tropical-screen: R3 <- fever (fact), recent-travel (fact), rash (fact)
  HOW order-dengue-test: R4 <- tropical-screen (proved by R3)
HOW notify-public-health: R7 <- order-dengue-test (proved by R4)
HOW notify-public-health, in one sentence: R7 because order-dengue-test, which was R4 because tropical-screen, which was R3 because fever and recent-travel and rash (all facts)

=== agreement with f-02: query all ten conclusions quietly ===
influenza-likely: proved by R1
influenza: proved by R2
tropical-screen: proved by R3
order-dengue-test: proved by R4
rest-and-fluids: proved by R5
measles-screen: proved by R6
notify-public-health: proved by R7
antiviral-considered: proved by R8
paracetamol-advised: proved by R9
review-vaccination-history: proved by R10
10/10 proved -- the backward chainer agrees with f-02's forward trace

=== failure case: 'rash' removed from the facts, query measles-screen ===
WHY measles-screen? it is the query
  WHY fever? needed by R6 for measles-screen
  -> fever is a fact
  WHY rash? needed by R6 for measles-screen
  -> rash: unprovable leaf (no fact, no rule concludes it)
-> measles-screen: no fact, and no rule could prove it
=> measles-screen NOT proved: the tree died at 'rash', an unprovable leaf`,
      walkthrough: [
        "`producers(goal)` gathers the OR-branches: every rule that concludes the goal, in rule-base order. In this base each conclusion has exactly one producer, so every tree is a straight chain with an AND-fan at the bottom — but the `for` loop is still the general backtracking machinery: try a rule, and if a condition dies, the next producer gets its chance.",
        "The WHY line is printed from `ancestors` — the (rule, parent-goal) pairs handed DOWN as an argument. \u201cWhy do you need to know that?\u201d is answered by the very stack the recursion is running on; nothing is reconstructed afterwards.",
        "`prove` returns a proof tree — ('fact',) or (rule, [(condition, proof), …]) — so the HOW lines print from the children's returns on the way back up: \u201ctropical-screen (proved by R3)\u201d. The justification is literally the return value.",
        "The quiet pass (`verbose=False`) is the regression test: f-02's forward run fired ten rules and derived ten conclusions; this chainer proves the same ten, each by the very rule that derives it. Two directions, one fixpoint.",
        "The failure case fails as a value, not an error: rash has no fact and no producer — an unprovable leaf — so R6 fails, measles-screen has no other producer to retreat to, and None propagates to the query. The trace shows exactly where the tree died, and the program ends normally.",
        "`explain` folds the proof tree into MYCIN's one-sentence HOW: read root-to-leaves, it is the same story the per-level HOW lines told — \u201cR7 because order-dengue-test, which was R4 because…\u201d.",
      ],
      project:
        "The Diagnostic Advisor project's backward engine: this chainer plus user-asked facts and retraction, with the WHY/HOW trace kept for every conclusion.",
    },
    { kind: "heading", text: "Forward versus backward: when each wins" },
    {
      kind: "table",
      title: "Choosing a direction",
      headers: ["Dimension", "Forward chaining — data-driven", "Backward chaining — goal-driven"],
      rows: [
        ["Runs", "from the facts toward every derivable conclusion", "from the goal down to the facts it needs"],
        ["Driving question", "\u201cwhat follows from what is known?\u201d", "\u201cwhat would establish what I want?\u201d"],
        ["Facts", "all collected up front, or streamed in as they arrive", "asked on demand — only the leaves the goal tree names"],
        ["Stops", "quiescence: nothing new is derivable", "the moment the goal is proved (or provably stuck)"],
        ["Wins when", "data arrives anyway and every conclusion matters — monitoring, alerts, XCON's order configuration at DEC", "facts are expensive, slow or risky to collect and one decision matters — MYCIN asking only what the therapy choice needs"],
        ["Paid with", "conclusions nobody asked for (and matching cost — Rete's lesson)", "OR-branch backtracking when many rules conclude one goal, plus a cycle guard for a→b→a loops"],
      ],
      caption:
        "The classic trade in one line: backward pays per goal and skips everything the goal cannot use; forward pays per fact and catches everything the facts imply. The same rule base — f-02's program and this lesson's — serves both engines; the task decides which economics you are in. Historically the pair is MYCIN and XCON: the clinic, where every question had a cost and one decision mattered, ran backward; the configuration floor at DEC, where the order data arrived anyway and every consequence had to be caught, ran forward.",
    },
    // ------------------------------------------------------------ practice
    {
      kind: "exercise",
      id: "f-03-e1",
      exerciseKind: "predict-output",
      prompt:
        "Keep the rules and the five facts exactly as they are and change only the query to antiviral-considered. Before running the program, predict its final one-line HOW sentence — the line that begins \u201cHOW antiviral-considered, in one sentence:\u201d. Type that line exactly, minding the order of R2's conditions and which of them are facts.",
      expectedOutput:
        "HOW antiviral-considered, in one sentence: R8 because influenza, which was R2 because influenza-likely, which was R1 because fever and cough (all facts) and body-aches (fact)",
      solution:
        "HOW antiviral-considered, in one sentence: R8 because influenza, which was R2 because influenza-likely, which was R1 because fever and cough (all facts) and body-aches (fact)",
      explanation:
        "The tree is three rules deep — R8 needs influenza; R2 needs influenza-likely plus body-aches; R1 needs fever and cough — and R2 is the interesting node: one condition is itself proved by a rule (rendered \u201cwhich was R1 because…\u201d), the other is a plain fact (rendered \u201c(fact)\u201d). Conditions render in rule order, influenza-likely before body-aches. If your sentence swapped them or dropped body-aches, you were drawing the tree from memory instead of reading it off the rules.",
      concepts: ["goal tree", "explanation trace"],
    },
    {
      kind: "exercise",
      id: "f-03-e2",
      exerciseKind: "write-code",
      prompt:
        "Strip the explanation machinery and keep the logic. Over the SAME rule base, write rules_used(goal) — a silent backward chainer that returns the rule ids a successful proof consults, in the order they complete (deepest first), or None when the goal is unprovable. A fact returns [] — it needs no rules. Query review-vaccination-history and print the result.",
      starter: `# the f-02/f-03 triage rule base, unchanged
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
FACTS = {"fever", "cough", "body-aches", "recent-travel", "rash"}

def rules_used(goal):
    # TODO: backward-chain goal silently.
    #  - a fact needs no rules: return []
    #  - try each rule that concludes goal; if ALL its conditions are
    #    provable, return their rules (deepest first) plus this rule's id
    #  - nothing worked: return None (unprovable)
    return []

print(rules_used("review-vaccination-history"))`,
      expectedOutput: "['R6', 'R10']",
      solution: `# the f-02/f-03 triage rule base, unchanged
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
FACTS = {"fever", "cough", "body-aches", "recent-travel", "rash"}

def rules_used(goal):
    if goal in FACTS:
        return []                      # a fact needs no rules
    for rid, conds, then in RULES:     # each way to conclude the goal
        if then != goal:
            continue
        sub = [rules_used(c) for c in conds]
        if all(s is not None for s in sub):
            return [r for s in sub for r in s] + [rid]
    return None                        # unprovable: no fact, no rule

print(rules_used("review-vaccination-history"))`,
      explanation:
        "The proof of review-vaccination-history tries R10, whose first condition measles-screen is not a fact — so it recurses: R6's fever and rash are facts (each contributing no rules), R6 completes, then R10 completes. Deepest-first order is ['R6', 'R10']: the child's rule finishes before the parent that needed it — exactly the order the HOW lines print in the lesson program. Note the two failure disciplines folded into one function: None means unprovable, [] means a fact — conflating them would make \u201cno rules needed\u201d indistinguishable from \u201ccannot be done\u201d.",
      concepts: ["backward chaining", "recursion"],
    },
    {
      kind: "exercise",
      id: "f-03-e3",
      exerciseKind: "trace",
      prompt:
        "Remove rash from the facts, as the program's failure section does. (a) Trace why the query notify-public-health now fails: name the leaf where the tree dies, and every rule it tries on the way down. (b) Exactly which of the ten conclusions become unprovable, and which survive? (c) f-02's first exercise found that the forward chainer fires five rules on these facts — reconcile the two counts.",
      solution:
        "(a) notify-public-health is not a fact; R7 is its only producer, so prove order-dengue-test — not a fact, R4 its only producer, so prove tropical-screen — not a fact, R3 its only producer, so prove fever (fact), recent-travel (fact), rash — which is neither a fact nor any rule's conclusion: the unprovable leaf. R3 fails, and because tropical-screen, order-dengue-test and notify-public-health each have no other producer, the failure propagates up unchanged through R3, R4, R7 — no OR-branch to retreat to. (b) Unprovable: tropical-screen, order-dengue-test, notify-public-health (the dead branch), measles-screen (R6 also needs rash), and review-vaccination-history (R10 needs measles-screen) — five. Surviving: influenza-likely (R1: fever + cough), influenza (R2: plus body-aches), rest-and-fluids (R5), antiviral-considered (R8), paracetamol-advised (R9). (c) The same five: forward fired exactly R1, R2, R5, R8, R9 — one firing per derivable conclusion — and backward proves exactly the conclusions those five firings derive. Five firings forward, five provable conclusions backward: the engines agree because they compute the same fixpoint from opposite ends.",
      explanation:
        "One missing fact kills the whole branch above it — data flow gates both directions identically (f-02's first exercise showed the same amputation forward). And the 5-versus-5 agreement is the regression test in miniature: two engines, one fixpoint.",
      concepts: ["unprovable leaf", "goal tree", "data flow"],
    },
  ],
  terms: [
    {
      term: "backward chaining",
      definition:
        "Goal-driven reasoning: to prove a goal, take a rule that concludes it and prove each of its conditions as a subgoal, recursing until every branch lands on a fact — the direction MYCIN ran, because it asks for only the facts the decision needs.",
    },
    {
      term: "goal tree",
      definition:
        "The AND/OR tree a backward proof expands to: a goal's children are the conditions of the rule being tried (AND — all must hold), and the alternative rules concluding the same goal are OR-branches — one success suffices.",
    },
    {
      term: "explanation trace",
      definition:
        "The WHY/HOW record of a backward proof: WHY lines snapshot the goal stack as the recursion descends (justifying each question); HOW lines report the successful rules as it unwinds (justifying each conclusion).",
    },
    {
      term: "unprovable leaf",
      definition:
        "A goal that is neither a fact nor the conclusion of any rule — where a backward proof fails cleanly, returning failure up the tree so parents can try their next alternative. Not proved is not disproved.",
    },
  ],
  mistakes: [
    {
      mistake: "Reading \u201cnot proved\u201d as \u201cdisproved\u201d.",
      why: "A proof that fails at an unprovable leaf says the rule base does not ESTABLISH the goal — with more facts it might. Treating failure as falsity silently adopts the closed-world assumption, an argument from ignorance.",
      fix: "Report failures as \u201cnot provable from the known facts\u201d and let the caller decide what that means; if absence must count as falsity, say so in the specification — it is a modeling commitment, not a default.",
    },
    {
      mistake: "Omitting the cycle guard (goal already on the stack).",
      why: "Rule bases with mutual dependencies — R1: a→b, R2: b→a — make an unguarded PROVE recurse forever: proving a needs b, which needs a, which needs b…",
      fix: "Carry the ancestor chain and fail any branch whose goal is already on it: the WHY stack does double duty as the cycle guard, because a goal cannot be part of its own proof.",
    },
    {
      mistake: "Collecting the facts before naming the goal — running the wrong direction.",
      why: "It is the forward habit: gather everything, then filter. When facts are interviews and laboratory tests, you pay for conclusions the decision never uses — the economics that made a collect-everything MYCIN unusable.",
      fix: "Start from the decision, expand the goal tree, and collect exactly the leaves it names; reserve forward chaining for when the data arrives anyway and everything derivable is wanted.",
    },
    {
      mistake: "Building the explanation as an afterthought — a second pass that re-derives the proof to narrate it.",
      why: "The narration pass duplicates the search, or worse, invents a cleaner story than the one the machine actually ran — an explanation that lies about the run is worse than none.",
      fix: "Print from the recursion's own state: WHY from the ancestors on the way down, HOW from the returns on the way up. The trace IS the run — the program above has no separate explaining code path.",
    },
  ],
  takeaways: [
    "Backward chaining is goal-driven recursion: to prove G, take a rule that concludes G and prove each of its conditions — the goal tree grows down to the facts.",
    "WHY is the goal stack on the way down; HOW is the rule trace on the way up. The explanation is the recursion's own bookkeeping, not a bolt-on.",
    "Two exits succeed (a fact, a rule) and one fails: the unprovable leaf, where no fact holds and no rule concludes — failing cleanly there is what keeps the chainer honest.",
    "Backward wins when facts are expensive and one goal matters (MYCIN's bedside questions); forward wins when data arrives anyway and everything derivable matters (monitoring, XCON's configurations).",
    "Same rule base, both directions: the ten conclusions f-02 derived by firing forward, this lesson's chainer proves by querying backward — agreement between the engines is the regression test.",
  ],
  quiz: [
    {
      id: "f-03-q1",
      prompt:
        "In MYCIN's explanation vocabulary, the user's question \u201cwhy do you need to know that?\u201d is answered by:",
      options: [
        {
          text: "The current goal stack — the rule being tried and the goals above it that made the system seek this fact",
          correct: true,
          feedback: "Exactly — WHY justifies the QUESTION by showing its context: the chain of rules and goals above it, the same ancestors our PROVE carries downward.",
        },
        {
          text: "The full rule trace that produced the final recommendation",
          correct: false,
          feedback: "That is the HOW answer — it justifies a CONCLUSION, not a question. Two different objects: a stack snapshot versus a derivation.",
        },
        {
          text: "The list of every rule in the base that mentions the fact",
          correct: false,
          feedback: "An explanation of the system's reasoning must reflect what it is DOING, not a static index lookup over the rule base.",
        },
        {
          text: "A certainty factor quantifying how much the answer matters",
          correct: false,
          feedback: "Certainty factors scored MYCIN's conclusions — the next lesson's subject — and never answered WHY questions.",
        },
      ],
      explanation:
        "WHY and HOW are the explanation contract: the question's context above it, the conclusion's derivation beneath it — one snapshot, one trace, both falling out of the recursion for free.",
    },
    {
      id: "f-03-q2",
      prompt:
        "A fraud monitor must examine every transaction as it arrives and flag everything derivable. An ICU advisor must settle ONE question — start the antiviral or not — where every lab test costs blood, time and risk. Which pairing fits?",
      options: [
        {
          text: "Fraud monitor backward, ICU advisor forward",
          correct: false,
          feedback: "Reversed: the monitor has no single goal to chain from, and the advisor would order tests the decision never uses.",
        },
        {
          text: "Fraud monitor forward, ICU advisor backward",
          correct: true,
          feedback: "Correct — data arriving anyway with every conclusion wanted is forward's home turf (monitoring, XCON's configurations); expensive facts and one decision is backward's (MYCIN's bedside economy).",
        },
        {
          text: "Both forward — direction is an implementation detail",
          correct: false,
          feedback: "Direction is semantics: it decides which facts get collected at all, and therefore which conclusions are reachable within the budget.",
        },
        {
          text: "Both backward — querying is always cheaper",
          correct: false,
          feedback: "Backward pays per goal: checking thousands of potential alerts would re-derive shared conclusions once per query, where forward derives each once and is done.",
        },
      ],
      explanation:
        "The trade is the economics of facts versus goals: who pays for data collection, and how many conclusions the task actually wants.",
    },
    {
      id: "f-03-q3",
      prompt:
        "Your backward chainer is asked to prove measles-screen on facts that lack rash. A correct chainer:",
      options: [
        {
          text: "Fails cleanly at the unprovable leaf: rash has no fact and no producer, so R6 fails and the query fails — a returned failure, not an error",
          correct: true,
          feedback: "Correct — the second base case. Failure propagates up as a value so parents can try their next OR-branch, and the query reports failure without drama.",
        },
        {
          text: "Crashes — no rule can fire",
          correct: false,
          feedback: "A goal with no producer is the NORMAL leaf case, handled by the base case; a chainer that crashes on unprovable goals cannot be trusted with real queries.",
        },
        {
          text: "Concludes NOT measles-screen — the goal is false",
          correct: false,
          feedback: "Not proved is not disproved: the base simply does not establish it. Treating failure as falsity is the closed-world assumption.",
        },
        {
          text: "Keeps asking for rash until something changes",
          correct: false,
          feedback: "A MYCIN-style system asks the user once, records the answer, and moves on; looping on an unanswerable question is a bug, not a design.",
        },
      ],
      explanation:
        "Failure is an answer: it travels up as a value, lets every ancestor try its alternatives, and leaves a trace that shows exactly where the tree died.",
    },
  ],

};
