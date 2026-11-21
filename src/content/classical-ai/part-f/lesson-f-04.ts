/**
 * Lesson f-04 — "Knowledge Engineering: MYCIN's Lessons"
 * (Part F · Module 1 · Chapter "Explanation and Engineering")
 *
 * A reading lesson: the documented history of MYCIN and XCON, the
 * knowledge-acquisition bottleneck, certainty factors and their three
 * structural flaws (the pivot to Module 2), and the era's honest ledger.
 *
 * No python in this lesson — the certainty-factor arithmetic is worked
 * by hand in the example block (verified with a scratch program across
 * all six firing orders: 0.828 / 0.72 / 0.54 / 0.828 / 0 / 0). History
 * stays inside the course canon: MYCIN, Stanford, early 1970s, ~450–600
 * rules; XCON/R1, McDermott, CMU + DEC, from 1980, ~10,000+ rules — no
 * invented quotes, no invented numbers.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_F_04: ClassicalLesson = {
  slug: "f-04",
  title: "Knowledge Engineering: MYCIN's Lessons",
  minutes: 30,
  summary:
    "What building MYCIN and XCON taught the field: where rules shine, where certainty factors cheated, and what broke at scale.",
  kind: "concept",
  objectives: [
    "State the documented history of MYCIN and XCON precisely — institutions, dates, scale — and say exactly what the evaluations did and did not show",
    "Explain the knowledge-acquisition bottleneck, and why it earned a job title rather than a footnote",
    "Carry out certainty-factor combination by hand, and demonstrate the order-dependence flaw on a worked scenario",
    "Name the three structural flaws of certainty factors and the era's three collapse factors — and keep the two lists distinct",
    "Argue both sides of a rule-based versus statistical build decision, then decide with reasons",
  ],
  why: "The two systems this lesson reads are the closest thing classical AI has to a controlled experiment. MYCIN, at Stanford in the early 1970s, proved that a few hundred well-chosen rules with honest explanation could advise on real clinical work — and priced that proof in expert interviews. XCON, at Digital Equipment Corporation from 1980, proved the same architecture could configure real VAX orders at industrial scale — and priced that proof in maintenance. Between them they wrote the checklist you should still run before choosing rules for anything. Where does the knowledge come from, and who can articulate it? Who audits a decision, and what will they accept as an explanation? What happens just past the edge of what the rules cover? And when you are tempted to bolt a plausible-looking number onto uncertain evidence — certainty factors were exactly that — what does the number mean? The era's collapse and its legacy are both documented; reading both columns honestly is the engineering judgment this lesson trains.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Twice in the 1970s and 1980s, the same small architecture — working memory, production rules, an interpreter — was flown to a completely different altitude, and the field learned a different lesson at each one. MYCIN, at Stanford in the early 1970s, flew narrow and high: a few hundred rules advising on therapy for bacteremia, judged competitive with the clinicians who reviewed it — on the one task it knew. XCON, deployed at Digital Equipment Corporation from 1980, flew wide: more than ten thousand rules configuring real VAX computer orders, for real revenue. And then both flights logged their costs — expert-months of interviewing per handful of rules, a maintenance effort that grew faster than the rule base, and an uncertainty calculus that behaved sensibly while meaning nothing in particular. This lesson reads the whole arc, because the arguments it settled — about explanation, extraction, scale and uncertainty — are the ones you will relitigate in every system you build.",
    },

    // ------------------------------------------------------------ the history
    { kind: "heading", text: "MYCIN and XCON: the proof and the price" },
    {
      kind: "text",
      text: "Work on MYCIN began at Stanford in the early 1970s — the course canon pins 1972 — with Edward Shortliffe building a therapy advisor for bacteremia, a bloodstream infection where treatment decisions are urgent and the microbiological knowledge is deep. The system was deliberately narrow: roughly 450 to 600 rules over its lifetime, each an IF–THEN production carrying a certainty factor, advising on therapy for that one problem. The famous evaluations deserve careful statement: clinician reviewers judged MYCIN's therapy recommendations against the actual therapy that Stanford faculty physicians had given for the same cases, and on this narrow task the program's advice was rated competitive. Not better than medicine — competitive, on bacteremia therapy advice. MYCIN itself never entered routine clinical use; its influence traveled through its architecture and its lessons. And what made clinicians take it seriously was not the rule count but the previous lesson's discovery: the WHY and HOW traces, which let a physician pick up any recommendation and ask it to show its reasoning, rule by rule.",
    },
    {
      kind: "text",
      text: "XCON began life as R1, built by John McDermott at Carnegie Mellon in collaboration with Digital Equipment Corporation, and was deployed from 1980 — the canon's other date. Its job: configure VAX computer systems to order — the complete set of components a customer's specification required, and how they fit together. Where MYCIN's knowledge grew by the interview, XCON's grew with the product line: by the late 1980s the rule base had passed ten thousand rules, and the system was doing real industrial work on real customer orders — the expert-system era's clearest commercial success. Then came the crisis the success bought. A large, dedicated maintenance staff grew up around the rule base; each change — new VAX models, new components, new rules interacting with old ones in ways no one fully held in mind — was slow to make and risky to ship, and the cost of maintaining the knowledge grew faster than the rule count itself. The bottleneck had not gone away at scale; it had compounded.",
    },
    {
      kind: "definition",
      term: "Knowledge-acquisition bottleneck",
      informal:
        "The expensive, slow, essential work of getting rules out of experts and into the machine. A knowledge engineer — the job title this bottleneck created — interviewed domain experts, watched them work cases, drafted rules, and repaired the drafts against the cases they got wrong; the interviews, not the inference engine, set the pace of every project.",
      formal: "K_{\\text{system}} \\subseteq K_{\\text{elicited}} \\subseteq K_{\\text{expert}}",
      why: "MYCIN's and XCON's engines were finished early; the knowledge arrived one interview at a time. The system can never know more than was extracted — and experts, who recognize answers faster than they can state rules, could not simply read their expertise out.",
    },
    {
      kind: "table",
      title: "The era's ledger",
      headers: ["System", "Domain", "Rules", "What it proved", "What broke"],
      rows: [
        [
          "MYCIN (Stanford, early 1970s)",
          "Bacteremia therapy advice",
          "~450–600 over its lifetime",
          "A narrow rule base with honest explanation could advise competitively on its task",
          "Narrow scope; certainty factors without semantics; never routine clinical use",
        ],
        [
          "XCON / R1 (DEC, from 1980)",
          "VAX configuration",
          "~10,000+ by the late 1980s",
          "The architecture could carry real industrial work — real revenue, at scale",
          "Maintenance grew superlinearly; a large dedicated staff; changes slow and risky",
        ],
        [
          "Business-rule engines (today)",
          "Underwriting, eligibility, compliance",
          "Curated and stable — the count is no longer the story",
          "Rules remain the right tool where decisions must be auditable and legislatable",
          "Nothing dramatic — the niche is chosen to fit the architecture",
        ],
      ],
      caption:
        "One architecture, three deployments. Both columns are true at once — and reading either column alone is exactly how the era was first oversold and then dismissed.",
    },

    // ------------------------------------------------------------ certainty factors
    { kind: "heading", text: "Certainty factors: the pragmatic patch and its price" },
    {
      kind: "definition",
      term: "Certainty factor",
      informal:
        "Shortliffe's pragmatic shorthand for uncertain evidence: a single number in [−1, 1] attached to a rule's conclusion — a measure of belief (MB) minus a measure of disbelief (MD) — combined across rules by small ad-hoc formulas that behaved sensibly on MYCIN's cases. +1 means believed, −1 means disbelieved, 0 means no evidence either way.",
      formal: "CF(H, E) = MB(H, E) - MD(H, E), \\quad MB, MD \\in [0, 1], \\quad CF \\in [-1, 1]",
      why: "Clinicians could read a CF, argue with a CF, and tune a rule's CF against real cases — which is why the patch shipped. What the number meant, no one could say precisely; the calculus underneath had no semantics.",
    },
    {
      kind: "example",
      title: "One rule base, two firing orders, two answers",
      problem:
        "Three rules in MYCIN's style, with certainty factors: R1 — IF e1 THEN h (CF 0.8); R2 — IF e2 THEN h (CF 0.6); R3 — IF h THEN c (CF 0.9). Both e1 and e2 are established facts. The combination rules, as in the classic scheme: two pieces of concurring evidence for the same hypothesis combine as CF₁ + CF₂(1 − CF₁); a rule's conclusion carries its own CF times max(0, its premise's CF), read at the moment it fires; each rule fires at most once. What CF does c end up with under the firing order R1, R2, R3 — and under R1, R3, R2?",
      steps: [
        {
          text: "Combine R1 and R2 on h.",
          detail:
            "0.8 + 0.6 × (1 − 0.8) = 0.8 + 0.12 = 0.92. Concurring evidence compounds sub-additively: the second rule adds only 0.12, because the first already carried h most of the way toward 1.",
        },
        {
          text: "Order A — R1, R2, R3: R3 fires last, reading CF(h) = 0.92.",
          detail:
            "Its contribution to c is 0.9 × max(0, 0.92) = 0.9 × 0.92 = 0.828. Final: CF(c) = 0.828.",
        },
        {
          text: "Order B — R1, R3, R2: R3 fires second, reading CF(h) = 0.80.",
          detail:
            "Its contribution to c is 0.9 × 0.80 = 0.72. Then R2 fires and raises CF(h) to 0.92 — but R3 has already fired, and rules fire at most once. Final: CF(c) = 0.72.",
        },
        {
          text: "Ask the question the calculus cannot answer: which is right?",
          detail:
            "Same rules, same evidence, both orders licensed by the system's control — 0.828 or 0.72. Nothing inside the CF scheme distinguishes the orders: the number a chained rule contributes depends on when the engine happened to ask it.",
        },
      ],
      result:
        "CF(c) = 0.828 under R1→R2→R3 but 0.72 under R1→R3→R2 — order dependence, demonstrated: the calculus produces two numbers and supplies no semantics for choosing between them.",
    },
    {
      kind: "text",
      text: "MYCIN's certainty-factor scheme shipped because it worked on MYCIN's cases — the combination rules behaved sensibly where they were tuned. The field's later audit found three structural flaws, and you should be able to state all three. **No probabilistic semantics**: the combination formulas were not derived from the probability axioms, and on some inputs they contradict them — a CF is readable and tunable, but it is not a probability, and reading 0.8 as '80% likely' imports a meaning the calculus never had. **Order-dependent combination**: as the example just showed, chained rules contribute different numbers in different firing orders, and the scheme offers no fact of the matter about which is correct. **A silent independence assumption**: the concurring-evidence formula credits each rule as if it brought fresh, independent support — when two rules trace back to the same underlying observation, the combination double-counts it and belief inflates. Notice that the third flaw is not a CF invention: sequential Bayesian updating has to make the same assumption explicitly. The difference is that probability wears the assumption on its sleeve, states when it fails, and says what to do about it. That is the pivot to Module 2 — f-05 rebuilds degrees of belief on the probability axioms, and f-06's Bayes' rule does, with semantics, the belief revision that certainty factors improvised without.",
    },

    // ------------------------------------------------------------ collapse + legacy
    { kind: "heading", text: "What broke at scale — and what survived" },
    {
      kind: "text",
      text: "Three forces ended the era, and each deserves an honest sentence rather than a sneer. **Brittleness**: a rule base knows what its rules cover, and just past that edge it either falls silent or answers anyway — there is no graceful degradation, because rules have no behavior outside the knowledge. MYCIN's edge was drawn deliberately narrow; XCON's edge moved with every product line, and the maintenance race never ended. **Maintenance cost**: changing an expert system grew more than proportionally harder as the rule count grew — not because any single rule was difficult, but because rules interact, and no one holds ten thousand of them in mind. XCON's crisis — a large dedicated staff, changes slow and risky — is what superlinear cost looks like from inside. **Overpromised expectations**: the narrow successes were extrapolated into promises of general substitutes for professional judgment within a few years; when those did not materialize, funding and faith withdrew together, in the period now called the AI winter. Soberly stated, the winter punished the promises, not the architecture — but the field had made the promises.",
    },
    {
      kind: "text",
      text: "The ledger's surviving column is just as real. **Explainability** is a lasting achievement: the WHY/HOW traces you met last lesson — every conclusion inspectable, every recommendation able to show its rules — established that the users of an advising system will question it, and that being answerable is a feature you design in, not a garnish. The demand never went away; it is the same demand you will hear around any modern deployed model. **Knowledge engineering** survives as a named discipline: eliciting, formalizing, testing and maintaining someone's expertise, with its first questions — whose knowledge, audited how, current as of when? — applying to every system that carries knowledge, however it acquired it. And **production rules never died**: today's business-rule engines — insurance underwriting policy, eligibility and claims, compliance and fraud flags — run the recognize-act cycle of this part's first two lessons, Rete's descendants inside, wherever decisions must cite an auditable rule and legislators rewrite the rule text. The architecture found the niche shaped like itself.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "f-04-e1",
      exerciseKind: "concept-check",
      prompt:
        "You are choosing between a rule-based expert system and a statistical learner for an emergency-department triage advisor. The clinical lead wants every recommendation to arrive with a justification clinicians can read and challenge; ten years of labeled triage decisions exist, collected from a department whose staffing and protocols changed twice in that period. Argue both sides — then pick the strongest deciding consideration.",
      options: [
        {
          text: "Rules win outright: only a rule base can produce the justifications, so the choice is already made",
          correct: false,
          feedback:
            "The strongest rule-side argument, but not yet a decision — it settles one requirement while ignoring the rest. The data section was telling you something too: the bottleneck has a statistical twin (biased, drifting training data), and brittleness cuts against rules at triage's edges.",
        },
        {
          text: "Statistics win outright: the labeled data removes the knowledge-acquisition bottleneck, and rules could never encode triage anyway",
          correct: false,
          feedback:
            "The bottleneck point is real — extraction is the expensive phase of any rule project — but 'never' overreaches: triage protocols are partly articulable, which is exactly what the clinical lead's requirement expresses. And the protocol changes are precisely the drift that makes a decade of history a shaky teacher.",
        },
        {
          text: "Split by requirement: rules carry the auditable triage protocol where justification is mandatory; a calibrated statistical model scores what the protocol leaves open — and the split, not the winner, is the deliverable",
          correct: true,
          feedback:
            "Correct — the judgment this lesson trains. Both sides have a real argument (explanation and legislatable change for rules; no expert-interview cost and softer edges for statistics), so you allocate by requirement: auditability here, learning where the evidence is plentiful.",
        },
        {
          text: "Build rules first because they are cheaper — no training-data pipeline needed",
          correct: false,
          feedback:
            "'Cheaper' is the mistake this lesson prices: the knowledge-acquisition bottleneck made rules the expensive option, expert-months at a time. Cheap engines, expensive knowledge — in both directions.",
        },
      ],
      solution:
        "Both sides, stated: for rules — justification is a hard requirement, protocol changes arrive as new text a rule base absorbs by editing, and no training pipeline is needed; for statistics — no expert interviews, coverage at the protocol's edges, and honest calibrated numbers where a certainty factor would have meant nothing. The decision: allocate by requirement — the auditable core in rules, the open margins in a calibrated model — and say so out loud.",
      explanation:
        "This is MYCIN's lesson applied forward: its clinicians trusted what could explain itself, and its certainty factors fell because they carried no semantics. A modern build inherits both halves.",
      concepts: ["MYCIN", "knowledge acquisition", "certainty factor"],
    },
    {
      kind: "exercise",
      id: "f-04-e2",
      exerciseKind: "trace",
      prompt:
        "Take the example's rule base — R1: e1 → h (CF 0.8); R2: e2 → h (CF 0.6); R3: h → c (CF 0.9) — with the same combination rules: concurring evidence combines as CF₁ + CF₂(1 − CF₁); a rule contributes its own CF × max(0, its premise's CF), read at the moment it fires; each rule fires at most once. Assume the engine may select any rule at any time, reading the premise's current CF — 0 if no evidence has arrived yet. (a) What CF does c end with under the firing order R2, R3, R1? (b) Among the six possible firing orders, which give c its highest and lowest values, and what are those values? (c) What would probability theory say about your answers to (a) and (b)?",
      solution:
        "(a) R2 fires: CF(h) = 0.6. R3 fires, reading 0.6: contributes 0.9 × 0.6 = 0.54 to c. R1 fires: CF(h) = 0.6 + 0.8 × (1 − 0.6) = 0.92 — but R3 has already fired, so c keeps 0.54. (b) Highest: 0.828, from the two orders in which R1 and R2 both fire before R3 (R1,R2,R3 and R2,R1,R3 — either way CF(h) is 0.92 when R3 reads it). Lowest: 0, from the two orders that fire R3 first — it reads CF(h) = 0, contributes 0.9 × 0 = 0, and never fires again. In between: 0.72 (R1,R3,R2) and 0.54 (R2,R3,R1). (c) Nothing — in the probability calculus, a fixed query on fixed evidence has one answer, and no legal order of computation changes it. Two computation orders that disagree would reveal that at least one is not exact inference; in the CF scheme both are 'correct', which is precisely the problem.",
      explanation:
        "Order dependence is not a rare corner: half of the six orders starve c of evidence that arrived after the fact, and firing R3 early costs everything. The fix is not a cleverer firing order — it is semantics, which is Module 2's opening move.",
      concepts: ["certainty factor"],
    },
    {
      kind: "exercise",
      id: "f-04-e3",
      exerciseKind: "concept-check",
      prompt:
        "A 2020s engineering team is deciding where a production-rule system remains the right choice. Four candidate projects arrive on the same day. Which is the strongest case for rules?",
      options: [
        {
          text: "Radiology image interpretation — senior radiologists can encode what they see",
          correct: false,
          feedback:
            "The bottleneck at its worst: radiologists recognize; they cannot read their expertise out as rules. And the knowledge's edges are exactly where rule bases go brittle. This is a domain where the statistical turn was decisive.",
        },
        {
          text: "Insurance underwriting policy — every decision must cite an auditable rule, regulators audit the rule text, and legislators change it",
          correct: true,
          feedback:
            "Correct — the surviving niche in one sentence: articulable knowledge, a hard auditability requirement, and change that arrives as new rule text. The ledger's third row and today's business-rule engines, exactly.",
        },
        {
          text: "Conversational translation — grammar is rule-shaped knowledge",
          correct: false,
          feedback:
            "Language was the canonical defeat of hand-built rule systems: the knowledge is not articulable at scale, and the edges are everywhere. This is the domain where the era's brittleness argument landed hardest.",
        },
        {
          text: "Stock-movement prediction — a celebrated trader will be interviewed for their intuition",
          correct: false,
          feedback:
            "Two flaws at once: intuition an expert cannot articulate IS the bottleneck, and a noisy domain gives no stable rules to maintain. XCON worked because VAX configuration had crisp, articulable structure — the opposite of this.",
        },
      ],
      solution:
        "The strongest case is underwriting policy: knowledge that is genuinely articulable, decisions that must be justified to auditors in rule form, and change that arrives as legislated text. That is the shape of today's business-rule engines — the recognize-act cycle, alive and earning.",
      explanation:
        "The era's lesson cuts both ways: rules were not a dead end, they were a tool with a shape — and the engineering judgment is matching the problem to the shape.",
      concepts: ["knowledge acquisition", "MYCIN"],
    },
  ],
  terms: [
    {
      term: "MYCIN",
      definition:
        "Stanford's bacteremia therapy advisor, developed from the early 1970s under Edward Shortliffe: roughly 450–600 production rules with certainty factors and WHY/HOW explanation, judged competitive with clinicians on its narrow task — and never in routine clinical use.",
    },
    {
      term: "certainty factor",
      definition:
        "A number in [−1, 1] expressing belief minus disbelief for a rule's conclusion, combined by ad-hoc formulas that behaved sensibly on MYCIN's cases but lacked probabilistic semantics.",
    },
    {
      term: "knowledge acquisition",
      definition:
        "The elicitation of rules from experts — interviewing, drafting, testing, repairing — the expensive, slow, essential work that gave the field both a bottleneck and a job title.",
    },
    {
      term: "knowledge engineer",
      definition:
        "The specialist who elicited, formalized and maintained an expert system's rules — the job title the knowledge-acquisition bottleneck created.",
    },
    {
      term: "brittleness",
      definition:
        "The failure mode of knowledge-based systems at the edge of their rules: beyond the encoded knowledge, the system falls silent or answers anyway, with no graceful degradation.",
    },
  ],
  mistakes: [
    {
      mistake: "Retelling the MYCIN story as 'an AI that beat doctors'.",
      why: "The published evaluations judged MYCIN's therapy recommendations against clinicians' therapy for the same cases, on one narrow task — bacteremia therapy advice — and found them competitive there; the system never entered routine clinical use. The overclaim is exactly what fed the era's expectations collapse.",
      fix: "State the scope before the score: which task, judged by whom, against what. 'Competitive on its narrow task' is the documented claim — and it is impressive enough.",
    },
    {
      mistake: "Reading a certainty factor as a probability.",
      why: "CFs came from ad-hoc combination rules with no probabilistic semantics — they can contradict the probability axioms, combine order-dependently, and silently assume independence. Reading CF 0.8 as '80% likely' imports a meaning the calculus never had.",
      fix: "Keep CF arithmetic in CF terms when reading the classical literature; when you need degrees of belief, use the probability calculus that Module 2 builds.",
    },
    {
      mistake: "Estimating an expert-system project's cost from its rule count.",
      why: "The expensive part was never the count — it was the interviews, testing and maintenance behind each rule, and maintenance cost grew faster than proportionally as the base grew. XCON's crisis arrived with success, not sloth.",
      fix: "Budget by knowledge-acquisition and maintenance effort — expert time per rule, staff time per change — never by rule count alone.",
    },
    {
      mistake: "Concluding from the era's collapse that production rules were a dead end.",
      why: "The ledger has two columns: brittleness and superlinear maintenance broke the broad ambitions, but auditability and explainability kept rules alive in business-rule engines — insurance, eligibility, compliance — where those properties are the requirement.",
      fix: "Match the tool to the requirement: rules where decisions must be inspectable and legislatable; statistical methods where evidence is plentiful and the edges are soft.",
    },
  ],
  takeaways: [
    "MYCIN proved a narrow rule base with honest explanation could advise competitively on its task — judged against clinicians' own therapy — and never entered routine clinical use; XCON proved the architecture could carry real industrial work, then billed the field for it in maintenance.",
    "The knowledge-acquisition bottleneck, not the inference engine, set the pace of every expert-system project — and gave the field a job title.",
    "Certainty factors were a pragmatic patch: readable, tunable, and structurally unsound — no probabilistic semantics, order-dependent combination, a silent independence assumption. Module 2 replaces the patch with the calculus.",
    "The era collapsed on brittleness at the edges, superlinear maintenance, and overpromised expectations — soberly stated, all three were failures of ambition, not of the architecture's core.",
    "What survived is real: explanation as a deliverable, knowledge engineering as a discipline, and production rules alive in today's business-rule engines.",
  ],
  quiz: [
    {
      id: "f-04-q1",
      prompt: "MYCIN's published evaluations established that:",
      options: [
        {
          text: "Its therapy advice, on the narrow task it was built for, was judged competitive with the clinicians' own therapy for the same cases",
          correct: true,
          feedback:
            "Correct, and stated at exactly the right strength: competitive on bacteremia therapy advice, judged against faculty therapy — not superior, not general medicine, and MYCIN never entered routine clinical use.",
        },
        {
          text: "MYCIN outperformed physicians across clinical medicine",
          correct: false,
          feedback:
            "The overclaim. The evaluations concerned one deliberately narrow task, and MYCIN stayed a research system. Extrapolations like this one fed the expectations the era then failed to meet.",
        },
        {
          text: "Certainty factors were validated as a sound uncertainty calculus",
          correct: false,
          feedback:
            "The evaluations tested the ADVICE, not the calculus. The audit of certainty factors came later and found three structural flaws — semantics, order, independence.",
        },
        {
          text: "Rule-based systems were ready for hospital-wide deployment",
          correct: false,
          feedback:
            "MYCIN never entered routine clinical use. The leap from 'competitive on one task' to 'deployable everywhere' is precisely the extrapolation this lesson teaches you to refuse.",
        },
      ],
      explanation:
        "State the scope before the score: which task, judged by whom, against what. That discipline is the difference between history and hype.",
    },
    {
      id: "f-04-q2",
      prompt: "The knowledge-acquisition bottleneck earned a job title — knowledge engineer — because:",
      options: [
        {
          text: "The inference engines were the expensive, slow part of a project",
          correct: false,
          feedback:
            "The reverse: the engines were finished early. MYCIN's and XCON's interpreters were the easy part; the knowledge was the hard part.",
        },
        {
          text: "Extracting and maintaining rules from experts was the expensive, slow, essential work — and it never automated away",
          correct: true,
          feedback:
            "Correct — the system's knowledge is bounded by what was elicited, and elicitation was skilled human labor: interviews, drafts, tests, repairs. At XCON's scale the bottleneck compounded into the maintenance crisis.",
        },
        {
          text: "Experts refused to collaborate with programmers",
          correct: false,
          feedback:
            "Collaboration happened. The difficulty was articulation — experts recognize answers far faster than they can state the rules that produce them. Refusal was never the story; tacit knowledge was.",
        },
        {
          text: "Rules had to be written in an arcane formal language",
          correct: false,
          feedback:
            "Production rules are among the most readable knowledge formalisms ever shipped — that readability is why experts could review them at all. The cost lived in the interviews and the maintenance, not the syntax.",
        },
      ],
      explanation:
        "The bottleneck is why rule counts stayed small and projects moved slowly — and why 'where does the knowledge come from?' became the field's first question about any knowledge-based system.",
    },
    {
      id: "f-04-q3",
      prompt: "The three structural flaws of certainty factors, as this lesson states them, are:",
      options: [
        {
          text: "Slow arithmetic, unreadable numbers, and rule-base bloat",
          correct: false,
          feedback:
            "None of these: CF arithmetic is fast, the numbers were readable (that was the point of the patch), and the flaws were never about the rule count.",
        },
        {
          text: "No probabilistic semantics, order-dependent combination, and a silent independence assumption",
          correct: true,
          feedback:
            "Correct — the calculus can contradict the probability axioms, chained rules give different numbers in different firing orders, and concurring evidence is combined as if independent. Module 2 answers all three.",
        },
        {
          text: "Rules could not represent uncertainty at all — only yes-or-no conclusions",
          correct: false,
          feedback:
            "The opposite: representing uncertainty is exactly what CFs did, attachment and all. The question was never whether the numbers existed — it was what they meant.",
        },
        {
          text: "Certainty factors only worked on medical domains",
          correct: false,
          feedback:
            "The scheme was domain-agnostic; its flaws were structural — semantics, order, independence — not domain-specific. Medical domains simply supplied the famous cases.",
        },
      ],
      explanation:
        "Three flaws, all structural, all waiting for one principled repair: the probability axioms (f-05) and Bayes' rule (f-06) — the pivot this lesson was built to point at.",
    },
  ],
};
