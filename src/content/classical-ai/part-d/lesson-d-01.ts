/**
 * Lesson d-01 — authored unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_01: ClassicalLesson = {

  slug: "d-01",
  title: "Propositions and Connectives",
  minutes: 25,
  summary:
    "NOT, AND, OR, IMPLIES, IFF: what each connective means, and the reading habits that prevent translation errors.",
  kind: "concept",
  objectives: [
    "Say what counts as a proposition — and say precisely why questions, commands and vague sentences cannot stand for facts",
    "Read and write the five connectives ¬ ∧ ∨ → ↔, including the vacuous-truth rows of implication that surprise everyone",
    "Translate between English and symbols in both directions, handling “only if”, “unless”, “neither…nor” and the inclusive or",
    "Apply the precedence convention ¬ > ∧ > ∨ > → > ↔ — and know why to parenthesize anyway when writing formulas others must audit",
    "Solve Wason-style selection tasks by naming the one row where the rule's implication fails and turning exactly the cards that could occupy it",
  ],
  why: "Every rule-based system you will ever touch — an expert system's production rules, a firewall policy, a benefits-eligibility check, the premise set of this part's resolution prover — begins life as English sentences someone insisted on. Propositional logic replaces those sentences with symbols a machine can evaluate, and the translation step is where systems quietly break: an “only if” read backwards turns a requirement into a guarantee; an “or” assumed exclusive silently drops legal worlds; an implication trusted like a causal claim promises more than its single failing row ever did. This lesson installs the two habits that prevent those bugs — naming atoms so that each is one definite, checkable fact, and reading every connective by its truth conditions rather than by the rhythms of English — and then shows, with the Wason selection task, that even fluent humans misfire on exactly the connective that carries inference. The prover you build in this part's project parses precisely the formulas this lesson teaches you to write; twenty-five minutes of translation discipline here is the cheapest bug-prevention that project will ever get.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Strip a reasoning system to its skeleton and you find claims being stood behind: *the sensor is faulty*, *the valve opened*, *if the sensor is faulty then the alarm fired*. Propositional logic is the discipline of writing those claims as symbols — P, Q, P → Q — so that a machine, or a careful colleague, can check exactly what they commit you to. The notation is trivial; the translation is not. English is happy to let “or” mean “one or the other but not both”, to say “only if” while pointing an arrow the other way, and to sound causal where logic means something bare and truth-valued. This lesson installs the five connectives — and, more importantly, the reading habits that keep English's habits out of your formulas.",
    },
    {
      kind: "table",
      title: "Proposition or not?",
      headers: ["Sentence", "Proposition?", "Why"],
      rows: [
        ["“The valve opened at 09:14.”", "Yes", "Declarative, specific, and either true or false — a fact with a timestamp."],
        ["“Close the valve.”", "No", "A command: it requests a change in the world rather than reporting one, so no truth value attaches to it."],
        ["“Is the valve open?”", "No", "A question: it asks for a truth value rather than having one."],
        ["“The load is heavy.”", "No", "Vague: nothing marks where “heavy” begins, so nothing settles true or false — pin the term (“exceeds 80 kg”) and it becomes one."],
        ["“Either 17 is prime or it is not.”", "Yes", "A definite truth value by form alone — true, in fact: your first tautology, though the name waits for d-02."],
        ["“This sentence is false.”", "No", "The liar paradox: either assignment contradicts itself, so no consistent truth value exists."],
      ],
      caption:
        "The test is two-part — a declarative sentence, and one of exactly two truth values. Note that vagueness is a property of the wording, not the world: most vague sentences become propositions once their terms are operationalized.",
    },
    {
      kind: "definition",
      term: "Proposition",
      informal:
        "A declarative sentence with a definite truth value — true or false, never both, never neither. Once a sentence qualifies, a symbol can stand for it and every connective in this lesson applies to it.",
      formal: "v : \\text{Prop} \\to \\{\\top, \\bot\\}",
      why: "One symbol, one claim, one truth value — that discipline is what makes the symbols load-bearing, and everything downstream in this part, from truth tables to resolution, is a computation over exactly these.",
    },
    // ------------------------------------------------------------ connectives
    { kind: "heading", text: "The five connectives, five truth functions" },
    {
      kind: "propositions",
      title: "The connectives, one line each",
      entries: [
        { formula: "\\neg P", name: "negation — NOT", reading: "true exactly when P is false; ¬ is a truth-function of one input, and all it does is flip." },
        { formula: "P \\wedge Q", name: "conjunction — AND", reading: "true exactly when both conjuncts are true — a single false conjunct sinks the whole. English “and”, “but” and “yet” all translate here; the contrast those words carry is not truth-functional." },
        { formula: "P \\vee Q", name: "disjunction — OR", reading: "true when at least one disjunct is true — the inclusive or: P ∨ Q is true even when both are." },
        { formula: "P \\rightarrow Q", name: "implication — IF…THEN", reading: "false in exactly one world: P true and Q false. P is the antecedent, Q the consequent." },
        { formula: "P \\leftrightarrow Q", name: "biconditional — IFF", reading: "true exactly when P and Q agree — both true or both false." },
      ],
      caption:
        "Each connective is a truth-function: its value depends on nothing but the truth values of its inputs. That austerity is the point — it is what lets d-02 settle every question about these formulas with a table.",
    },
    {
      kind: "text",
      text: "Give → its own minute: it is the connective that carries inference, and the one English reads worst. Read P → Q as a promise — *if the sensor is faulty, the alarm fires* — and ask how the promise can break. Exactly one way: the sensor is faulty and the alarm stays silent. **P → Q is false in exactly one world: P true, Q false.** One failing row is implication's entire personality; every equivalence involving → in this part traces back to that row. The rows that surprise everyone are the other two: what if the sensor is fine? The promise was about faulty sensors and says nothing about quiet ones — and rather than leave those worlds undefined, logic calls the conditional **vacuously true**: a false antecedent makes the whole formula true, whatever Q is doing. The convention is not sentiment. It is what makes P → Q behave exactly as ¬P ∨ Q — an identity d-02's first table will confirm row by row — and what lets contraposition and resolution run without special cases. This truth-values-only reading is called **material implication**: “material” because it records how truth values stand, not what causes what. English “if” often smuggles causation — *if you drop the glass, it breaks*, and the drop really does the breaking — but material implication claims no such thing. Translating causal English into → is sometimes exactly right and sometimes a modeling error; the point of this lesson is to make that choice deliberate.",
    },
    {
      kind: "propositions",
      title: "The idioms that bite — English, translated",
      entries: [
        { formula: "Q \\rightarrow P", name: "“P if Q”", reading: "plain “if” puts the condition after it: “the alarm fires if the sensor is faulty” is faulty → fires — the condition is the antecedent." },
        { formula: "P \\rightarrow Q", name: "“P only if Q”", reading: "“only if” flips the flow: the claim being restricted (P) becomes the antecedent. “You board only if you hold a pass” is board → pass — the forbidden world is boarding with no pass. Intuition wants the arrow the other way; exercise one will check yours." },
        { formula: "\\neg Q \\rightarrow P", name: "“P unless Q”", reading: "unless names the escape: outside the escape, P holds. “The build fails unless the tests pass” is ¬pass → fail; equivalently fail ∨ pass — at least one of the two must hold." },
        { formula: "\\neg P \\wedge \\neg Q", name: "“neither P nor Q”", reading: "“neither” is “not either”: two negations under one ∧. The near-miss ¬P ∨ ¬Q is “not both” — a different, weaker claim (d-02's de Morgan table draws the line)." },
        { formula: "(P \\vee Q) \\wedge \\neg(P \\wedge Q)", name: "“P or Q, but not both”", reading: "exclusive or — what everyday “or” sometimes means (“soup or salad”). Logic's bare ∨ never means this; exclusivity is always an added conjunct, never a free reading." },
        { formula: "(P \\rightarrow Q) \\wedge (Q \\rightarrow P) \\equiv (P \\leftrightarrow Q)", name: "“if and only if”", reading: "both directions, packaged: ↔ is literally the conjunction of the two implications — the part's exercise battery proves it a tautology, row by row.", tone: "law" },
      ],
      caption:
        "Six idioms, six fixed formulas. The pair to drill is the first two — the same atoms with opposite arrows, because “if” and “only if” point implication in different directions; “if and only if” is exactly the two of them at once.",
    },
    {
      kind: "table",
      title: "Precedence, tightest to loosest",
      headers: ["Binds", "Connective", "Example", "Reads as"],
      rows: [
        ["1 — tightest", "¬", "¬P ∨ Q", "(¬P) ∨ Q — the negation grabs P, not the disjunction"],
        ["2", "∧", "P ∨ Q ∧ R", "P ∨ (Q ∧ R) — and beats or"],
        ["3", "∨", "P ∨ Q → R", "(P ∨ Q) → R"],
        ["4", "→", "P → Q ↔ R", "(P → Q) ↔ R"],
        ["5 — loosest", "↔", "P ↔ Q → R", "P ↔ (Q → R) — the implication groups first, the biconditional applies last"],
      ],
      caption:
        "Precedence is a reading convention — it saves strokes when you parse someone else's formula. When you write one, parenthesize anyway: an audited knowledge base and this part's resolution prover both read formulas literally, and ¬P ∧ Q means (¬P) ∧ Q — never ¬(P ∧ Q) — no matter what the English in your head said. Explicit grouping costs two characters and prevents a class of bug no type-checker will catch.",
    },
    {
      kind: "example",
      title: "A real rule, translated — and translated back",
      problem:
        "Two directions, one rule. (a) Into symbols: “The cache is flushed whenever the configuration changes, unless the server is in maintenance mode.” (b) Back into English: read your answer from (a) literally, as a sentence, and check the round trip.",
      steps: [
        {
          text: "Name the atoms — one definite fact per symbol.",
          detail:
            "C: the configuration changes. F: the cache is flushed. M: the server is in maintenance mode. Each is declarative with a truth value at any moment; if “changes” or “maintenance mode” felt vague, pin them down before going on.",
        },
        {
          text: "Find the top-level structure before writing any symbol.",
          detail:
            "The sentence is X unless M, where X is the whole inner rule. “Unless” wraps the requirement — maintenance mode is an escape from the rule, not from flushing.",
        },
        {
          text: "Translate the inner claim.",
          detail: "“Flushed whenever the configuration changes” — “whenever” is “if”: C → F.",
        },
        {
          text: "Apply the unless-idiom: X unless M is ¬M → X.",
          detail:
            "¬M → (C → F): outside maintenance mode, a configuration change implies a flush. In maintenance mode the outer implication is vacuously true — the requirement is suspended, not the flushing forbidden.",
        },
        {
          text: "Read it back.",
          detail:
            "“If the server is not in maintenance mode, then whenever the configuration changes, the cache is flushed.” The round trip preserves the original — and d-02's implication law will flatten the answer further to M ∨ ¬C ∨ F: maintenance, or no change, or a flush.",
        },
      ],
      result:
        "¬M → (C → F) — the “unless” clause negated into the antecedent, the “whenever” clause an implication inside it; three literals once the arrows flatten.",
    },
    // ------------------------------------------------------------ Wason
    { kind: "heading", text: "The Wason selection task" },
    {
      kind: "example",
      title: "Four cards, one rule, one connective",
      problem:
        "Peter Wason's selection task, in its original abstract form. Four cards lie on the table; each has a letter on one side and a number on the other. The visible faces show A, K, 7 and 4. The rule under test: if a card has a vowel on one side, it has an even number on the other. Which cards — the minimum set — must you turn over to decide whether the rule holds?",
      steps: [
        {
          text: "State the rule as an implication.",
          detail:
            "V → E, with V: “this card has a vowel on one side” and E: “this card has an even number on the other”. An implication fails in exactly one world — antecedent true, consequent false — so only cards that could occupy that world are worth turning.",
        },
        {
          text: "Card A: turn it.",
          detail:
            "The vowel makes V true on its face, so the rule promises an even number on the back. An odd number there is the failing world — A is a live threat to the rule.",
        },
        {
          text: "Card K: leave it.",
          detail:
            "The letter side shows a consonant, so V is false for this card whatever number hides on the back — the rule is vacuously true here, and turning K can only confirm a promise that was never made.",
        },
        {
          text: "Card 7: turn it — this is the one people miss.",
          detail:
            "A vowel could hide on the back: vowel over odd number is exactly the failing world. Most people reach for 4 instead, confirming when they meant to test.",
        },
        {
          text: "Card 4: leave it.",
          detail:
            "An even number makes E true outright: a vowel on the back keeps the promise, a consonant on the back makes no promise. Either way the rule holds — 4 cannot falsify anything.",
        },
        {
          text: "How hard did humans find it? Brutally — and that is documented, not folklore.",
          detail:
            "In Wason's original studies of the abstract version, fewer than one in ten participants selected exactly A and 7 — a result widely reported ever since. Thematically framed versions of the same logical shape, such as enforcing a drinking-age rule (“if a person is drinking beer, they must be 18 or over”), lift correct performance to roughly three-quarters. The logic is identical; what changes is whether the content recruits experience you already have. The practitioner's moral: do not trust fluency — name the failing row and test for it.",
        },
      ],
      result:
        "A and 7 — the antecedent-true card and the consequent-false card: exactly the two cards that could expose the one world where V → E fails.",
    },
    // ------------------------------------------------------------ WFF + handoff
    {
      kind: "definition",
      term: "Well-formed formula",
      informal:
        "A string of proposition symbols and connectives that obeys the grammar — every connective has its operands, every parenthesis is paired, nothing dangles. ¬(P ∧ ∨ Q) is no more a formula than “3 + × 4” is arithmetic.",
      formal:
        "\\phi ::= p \\mid \\neg\\phi \\mid (\\phi \\wedge \\phi) \\mid (\\phi \\vee \\phi) \\mid (\\phi \\rightarrow \\phi) \\mid (\\phi \\leftrightarrow \\phi)",
      why: "This grammar is the input language of everything downstream: d-02's truth-table engine parses exactly these strings, the equivalence laws rewrite them, and this part's resolution prover refutes them — a string outside the grammar is not a difficult formula but a syntax error. And the next lesson is the pay-off: truth tables are the systematic referee for the claims your connectives make — every identity this lesson asserted on authority (¬P ∨ Q for →, the both-ways biconditional) gets settled there, row by row, with nothing left to intuition.",
    },
    // ------------------------------------------------------------ practice
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "d-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "A deployment pipeline's policy reads: “A deployment ships only if the integration suite passed.” With D: “a deployment ships” and S: “the integration suite passed”, which symbolization is the policy?",
      options: [
        {
          text: "D → S",
          correct: true,
          feedback:
            "Correct — “only if” points the arrow away from the restricted claim: shipping commits you to a passed suite. The forbidden world — a deployment ships while the suite failed — is exactly the world the policy exists to rule out.",
        },
        {
          text: "S → D",
          correct: false,
          feedback:
            "The converse: it turns the suite into a guarantee of shipping. A passed suite is necessary for deployment, not sufficient for it.",
        },
        {
          text: "D ↔ S",
          correct: false,
          feedback:
            "Too strong by one direction: the biconditional adds S → D, forcing a deployment whenever the suite passes. “Only if” claims one arrow, not two.",
        },
        {
          text: "D ∧ S",
          correct: false,
          feedback:
            "A conjunction reports that both happened; a policy constrains worlds without reporting one. On a day with no deployment at all, the policy can hold perfectly.",
        },
      ],
      solution:
        "D → S — the arrow points away from the restricted claim. Test with the forbidden world: a deployment ships while the suite failed. That world must falsify the policy, and only D → S is false there.",
      explanation:
        "“P if Q” is Q → P; “P only if Q” is P → Q. The pair is worth drilling until the flip is automatic — exercise two gives you more of it, and the quiz at the end of this lesson re-arms it.",
      concepts: ["translation", "implication", "only if"],
    },
    {
      kind: "exercise",
      id: "d-01-e2",
      exerciseKind: "trace",
      prompt:
        "Hand-translate, with the atom dictionary R: “it rains”, P: “the picnic moves indoors”, U: “you carry an umbrella”, W: “the forecast warns of storms”. (a) “It rains or the picnic moves indoors.” (b) “The picnic moves indoors if it rains.” (c) “The picnic moves indoors only if it rains.” (d) “It rains unless the forecast warns of storms.” (e) “Neither does the picnic move indoors nor do you carry an umbrella.” (f) Back into English: R → (P ∨ U).",
      solution:
        "(a) R ∨ P — the inclusive or: true even if both hold; nothing in the English licenses “but not both”. (b) R → P — plain “if” puts the condition after it: rain is the antecedent. (c) P → R — “only if” reverses the arrow: the restricted claim (moving indoors) becomes the antecedent. Yes, it sounds backwards — that is exactly the flip; the check is the forbidden world, “picnic moved under a dry sky”, which falsifies P → R and nothing else in the set. (d) ¬W → R — “unless” negates its escape into the antecedent: no storm warning means rain is promised. Equivalently R ∨ W. (e) ¬P ∧ ¬U — “neither…nor” is two negations under one AND; the near-miss ¬P ∨ ¬U is the weaker “not both”. (f) “If it rains, the picnic moves indoors or you carry an umbrella” — one antecedent, a choice of consequents; its single failing world is rain with no move and no umbrella.",
      explanation:
        "Every idiom from the lesson's second propositions block in one drill. Watch the (b)/(c) pair hardest — the same atoms with opposite arrows. The habit that settles all doubt: name the one world where your formula is false, and check the English forbids exactly that world.",
      concepts: ["translation", "connectives", "implication"],
    },
    {
      kind: "exercise",
      id: "d-01-e3",
      exerciseKind: "concept-check",
      prompt:
        "The same four-card format, a new rule: each card has a letter on one side and a number on the other; the visible faces show D, C, 3 and 8. The rule under test: “if a card has a D on one side, it has a 3 on the other.” Which cards must you turn to test the rule?",
      options: [
        {
          text: "D and 8",
          correct: true,
          feedback:
            "Correct — D is the antecedent-true card (its back must show a 3), and 8 is the consequent-false card: if a D hides on its other side, “D over 8” is the one failing world. C and 3 can never falsify the rule.",
        },
        {
          text: "D and 3",
          correct: false,
          feedback:
            "The matching trap — turning 3 can only confirm: if a D hides there the rule holds, and if another letter hides there the rule says nothing. Confirmation is cheap; the rule dies only in the D-and-not-3 world, which only the 8-card can expose.",
        },
        {
          text: "D only",
          correct: false,
          feedback:
            "Half a test — D checks the promise, but a D hiding behind the 8 would break the rule without D's visible help. Leaving 8 face-down leaves the failing world unexamined.",
        },
        {
          text: "All four cards",
          correct: false,
          feedback:
            "Thorough but wasteful — C makes the antecedent false (vacuously true whatever hides there) and 3 makes the consequent true. Neither can falsify the rule under any hidden face; the task asks for the minimum decisive set.",
        },
      ],
      solution:
        "D and 8 — the antecedent-true card and the consequent-false card: exactly the two cards that could expose the one world where the rule's implication fails.",
      explanation:
        "This is the Wason task transferred: name the single row where the implication fails, then turn exactly the cards that could occupy it. Fluent-sounding rules still need the test — the moral of the lesson's centerpiece, and the reason d-02 hands the checking to a machine.",
      concepts: ["implication", "Wason selection task", "falsification"],
    },
  ],
  terms: [
    {
      term: "proposition",
      definition:
        "A declarative sentence with a definite truth value — true or false, and nothing else. The atom of propositional logic; questions, commands and vague sentences cannot play the part.",
    },
    {
      term: "conjunction",
      definition:
        "The ∧ connective: P ∧ Q is true exactly when both conjuncts are true. English “and”, “but” and “yet” all translate to it — the contrast those words carry is not truth-functional.",
    },
    {
      term: "implication",
      definition:
        "The → connective (material implication): P → Q is false in exactly one world — P true, Q false — and vacuously true whenever P is false. The connective that carries inference.",
    },
    {
      term: "biconditional",
      definition:
        "The ↔ connective: P ↔ Q is true exactly when P and Q agree — the conjunction of the two implications, (P → Q) ∧ (Q → P).",
    },
    {
      term: "well-formed formula",
      definition:
        "A string of proposition symbols and connectives obeying the grammar — every connective with its operands, every parenthesis paired. The input language of every evaluator and prover downstream.",
    },
  ],
  mistakes: [
    {
      mistake: "Reading “P only if Q” as Q → P — the arrow flipped.",
      why: "English “if” puts the condition after it (“P if Q” is Q → P), and “only if” feels like a stronger “if”, so the direction gets inherited instead of reversed.",
      fix: "Point the arrow away from the claim being restricted: “you board only if you hold a pass” is board → pass. Name the forbidden world — boarding with no pass — and check the formula is false exactly there.",
    },
    {
      mistake: "Reading P → Q as a causal claim, or as the biconditional P ↔ Q.",
      why: "Everyday “if” carries causation and often implies both directions; material implication is a bare truth-function, false in one world only (P true, Q false).",
      fix: "Read → as a promise and hunt for its single breaking row; when both directions are genuinely meant, write ↔ — the conjunction of the two implications.",
    },
    {
      mistake: "Writing ¬P ∧ Q when ¬(P ∧ Q) is meant.",
      why: "¬ binds tightest — it grabs the nearest proposition, not the nearest group; the negation of a compound needs explicit parentheses.",
      fix: "Negate a compound by wrapping it first: ¬(P ∧ Q). Precedence is for reading; parentheses are for writing.",
    },
    {
      mistake: "Translating English “or” as exclusive by default.",
      why: "Everyday “or” is often exclusive (“soup or salad”), so the symbolization silently imports “but not both”.",
      fix: "Logic's ∨ is inclusive — true when both hold. Reserve (P ∨ Q) ∧ ¬(P ∧ Q) for genuine exclusivity, and write it in full.",
    },
  ],
  takeaways: [
    "A proposition is a declarative sentence with a definite truth value — questions, commands and vague predicates cannot stand for facts.",
    "P → Q is false in exactly one world, P true and Q false — one failing row is implication's entire personality; false antecedents make it vacuously true.",
    "The logic “or” is inclusive — at least one, possibly both; exclusivity is an added conjunct, (P ∨ Q) ∧ ¬(P ∧ Q), never a free reading.",
    "“P if Q” is Q → P while “P only if Q” is P → Q — and “unless” negates its escape into the antecedent: “P unless Q” is ¬Q → P.",
    "Well-formed formulas are the input language of everything downstream — d-02's truth tables referee their claims row by row.",
  ],
  quiz: [
    {
      id: "d-01-q1",
      prompt:
        "A monitoring rule reads: “if a request is authenticated, it is logged.” Yesterday's trace contains zero authenticated requests, and a colleague reports that the rule “passed” on that trace. What is the honest reading of the result?",
      options: [
        {
          text: "The rule held vacuously — the one failing world (authenticated and unlogged) never arose, so “passed” is technically true but says nothing about logging",
          correct: true,
          feedback:
            "Correct — with the antecedent false everywhere, the conditional is true in every row the trace visits. A technically honest pass that tested nothing.",
        },
        {
          text: "The rule was violated, because nothing was logged",
          correct: false,
          feedback:
            "For → to fail you need an authenticated request that went unlogged — that world never arose. Quiet requests falsify nothing.",
        },
        {
          text: "The trace shows the rule has no truth value — undefined over empty evidence",
          correct: false,
          feedback:
            "Formulas over propositions always have a truth value; with the antecedent false the conditional is simply true — vacuously, but definitely.",
        },
        {
          text: "The trace proves the logging implementation works",
          correct: false,
          feedback:
            "Vacuous truth is not evidence: the row that would exercise the implementation (an authenticated request) never appeared. A pass like this should make you suspicious of the test, not confident in the code.",
        },
      ],
      explanation:
        "This is the vacuous-truth row doing real work: implications over empty antecedents are true, and a test that never triggers the antecedent passes rules it has never exercised — a lesson that generalizes far past logic.",
    },
    {
      id: "d-01-q2",
      prompt:
        "The terminal policy reads: “The terminal unlocks only if the badge scan succeeded.” With T: “the terminal unlocks” and B: “the badge scan succeeded”, the policy is:",
      options: [
        {
          text: "T → B",
          correct: true,
          feedback:
            "Correct — “only if” makes the restricted claim (unlocking) the antecedent: unlocking commits you to a successful scan. The forbidden world is an unlock with a failed scan.",
        },
        {
          text: "B → T",
          correct: false,
          feedback:
            "The converse: it turns the scan into a guarantee of unlocking. A successful scan is necessary, not sufficient.",
        },
        {
          text: "T ↔ B",
          correct: false,
          feedback:
            "The biconditional adds B → T, forcing an unlock whenever the scan succeeds. “Only if” claims one direction only.",
        },
        {
          text: "T ∧ B",
          correct: false,
          feedback:
            "A conjunction reports both events; a policy constrains worlds. A shift with no unlock attempt and no scan can satisfy the policy perfectly.",
        },
      ],
      explanation:
        "“P if Q” is Q → P; “P only if Q” is P → Q. Say both directions only when both are meant — “if and only if”, which is ↔, the both-ways row of the idioms block.",
    },
    {
      id: "d-01-q3",
      prompt: "By the precedence convention ¬ > ∧ > ∨ > → > ↔, the formula ¬P ∨ Q → R reads as:",
      options: [
        {
          text: "(¬P ∨ Q) → R",
          correct: true,
          feedback:
            "Correct: ¬ grabs P, then ∨ groups before → — the implication applies to the whole disjunction.",
        },
        {
          text: "¬(P ∨ Q) → R",
          correct: false,
          feedback:
            "Negation binds tightest, but only to the nearest proposition: ¬(P ∨ Q) → R is a different formula, not a reading of this one — to negate the compound you must write the parentheses yourself.",
        },
        {
          text: "¬P ∨ (Q → R)",
          correct: false,
          feedback:
            "That grouping would require → to bind tighter than ∨; the convention orders them the other way — ∨ groups first.",
        },
        {
          text: "¬(P ∨ (Q → R))",
          correct: false,
          feedback:
            "No precedence reading produces this — it would take parentheses written into the string. If you find yourself wanting it, write it; never rely on intuition to insert grouping the author left out.",
        },
      ],
      explanation:
        "Precedence disambiguates what authors leave out; when a formula matters, leave nothing out — parentheses are documentation for the next auditor.",
    },
  ],

};
