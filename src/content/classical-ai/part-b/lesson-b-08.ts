/**
 * Lesson b-08 "Games with Chance and Imperfection" — the closing concept
 * lesson of Part B. The chance-node tree is verified by hand: safe move
 * leaves 6/12/18 (EV 12), bold move leaves 0/12/30 (EV 14) under a fair die
 * read as 1-2 / 3-4 / 5-6; expectimax picks the bold move, worst-case
 * minimax the safe one. Exercise arithmetic (36/6 = 6; 14.0 12.0) verified
 * by running. History stays inside the documented canon (Deep Blue 1997;
 * Tesauro's TD-Gammon; Shannon's chess-program frame).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_08: ClassicalLesson = {
  slug: "b-08",
  title: "Games with Chance and Imperfection",
  minutes: 30,
  summary:
    "Dice and hidden cards: chance nodes, expectimax, and why minimax's guarantees dissolve when the opponent errs.",
  kind: "concept",
  objectives: [
    "Extend the game tree with chance nodes and compute their values as expectations",
    "State the expectimax recurrence and compute it by hand on a die-driven tree",
    "Explain why expectations are not guarantees — and when worst-case minimax remains the right choice anyway",
    "Describe imperfect information and information sets precisely enough to say why plain tree search breaks there",
  ],
  why: "Part B so far has engineered one assumption into every algorithm: the tree's only voices are yours and a perfectly rational opponent's, and both of you see everything. Two real game families break that. Backgammon interleaves the players with dice — a third voice that is neither maximizing nor minimizing against you, and cannot be modeled as if it were. Poker hides cards — you do not even know which node of the tree you are standing on. This lesson gives you the honest extension for the first break — chance nodes and expectimax, the recurrence that optimizes expected utility — and the honest vocabulary for the second: information sets, the object that replaces 'the state' when the state is partly hidden. Along the way it closes the account this part opened in b-02: whether minimax's move stays optimal against a fallible opponent. The answer is a clean no — and the same tree that proves it shows when the worst-case habit is still exactly what you want.",
  blocks: [
    {
      kind: "text",
      text: "Minimax's power comes from a suspension of disbelief: it pretends the opponent is perfect, and prices every position under that fiction. Add dice to the game and the fiction stops making sense — a die does not want anything, and treating its worst roll as 'the opponent's best play' is pessimism misapplied to randomness. Add hidden cards and something deeper breaks: the tree you are searching contains nodes you cannot distinguish from the inside, so 'the best move at this node' is not even a well-posed question. This lesson takes both breaks seriously, because they are the honest boundary of everything Part B built — and the map of what lies beyond it.",
    },
    { kind: "heading", text: "The third voice: chance nodes" },
    {
      kind: "definition",
      term: "Chance node",
      informal:
        "A tree node whose branches are die rolls, card draws or coin flips — each with a known probability, none chosen by anyone.",
      formal:
        "V(n) = \\sum_{i=1}^{k} p_i \\cdot V(c_i), \\quad \\sum_{i=1}^{k} p_i = 1",
      why: "A chance node's value is the probability-weighted average of its children — neither max nor min, and immune to either player's intentions.",
    },
    {
      kind: "math",
      title: "The expectimax recurrence",
      derivation: {
        title: "Minimax with one new line",
        steps: [
          { expr: "V(n) = \\max_{c} V(c)", reason: "at a MAX node — your move, your choice" },
          { expr: "V(n) = \\min_{c} V(c)", reason: "at a MIN node — the opponent's move, their choice" },
          {
            expr: "V(n) = \\sum_{i=1}^{k} p_i \\cdot V(c_i)",
            reason: "at a CHANCE node — nobody's move; weight the outcomes by their probabilities",
          },
          {
            expr: "\\text{decision: maximize expected utility}",
            reason: "with chance in the tree, 'optimal play' means the highest expected value — nothing can be forced anymore",
          },
        ],
      },
      caption:
        "Expectimax is minimax with the third line: max at yours, min at theirs, expectation at chance. The guarantee changes kind with that single line — from 'no opponent can hold you below V' to 'the average outcome is V, if the die is fair and the model is right'.",
    },
    { kind: "heading", text: "One tree, two sane answers" },
    {
      kind: "text",
      text: "Here is the situation the recurrence has to arbitrate — a backgammon-flavoured choice. You have two moves, and after either one a fair die decides the outcome. Read the die three ways — low (1–2), middling (3–4), high (5–6) — each with probability 1/3. The **safe move** pays 6, 12 or 18 points on low, middling, high. The **bold move** pays 0, 12 or 30. Compute both expectations and both worst cases before reading on; the whole lesson lives in that comparison.",
    },
    {
      kind: "gameTree",
      title: "Safe versus bold, decided by a fair die",
      root: {
        kind: "max",
        value: 14,
        children: [
          {
            edgeLabel: "safe",
            child: {
              kind: "chance",
              value: 12,
              children: [
                { edgeLabel: "1–2 (1/3)", child: { kind: "leaf", value: 6 } },
                { edgeLabel: "3–4 (1/3)", child: { kind: "leaf", value: 12 } },
                { edgeLabel: "5–6 (1/3)", child: { kind: "leaf", value: 18 } },
              ],
            },
          },
          {
            edgeLabel: "bold",
            child: {
              kind: "chance",
              value: 14,
              children: [
                { edgeLabel: "1–2 (1/3)", child: { kind: "leaf", value: 0 } },
                { edgeLabel: "3–4 (1/3)", child: { kind: "leaf", value: 12 } },
                { edgeLabel: "5–6 (1/3)", child: { kind: "leaf", value: 30 } },
              ],
            },
          },
        ],
      },
      conclusion:
        "Expectations: safe = (6 + 12 + 18)/3 = 36/3 = 12; bold = (0 + 12 + 30)/3 = 42/3 = 14. Expectimax plays bold, value 14. Worst cases: safe = 6, bold = 0 — a maximin player plays safe, guarantee 6. The tree does not decide between the readings; it prices both, and which you want depends on what you are protecting.",
      caption:
        "Diamond nodes are chance: their value is the probability-weighted average of the branches, each branch labelled with its die reading and probability. The same tree supports both algorithms — and they disagree.",
    },
    {
      kind: "example",
      title: "Reading the disagreement carefully",
      problem:
        "The same tree gives expectimax the bold move (14) and worst-case minimax the safe move (6). Explain exactly what each number promises, and name one situation for each in which its promise is the right thing to buy.",
      steps: [
        {
          text: "What 14 promises: if the die is fair, the AVERAGE payoff of the bold move is 14, versus the safe move's 12 — across many repetitions, bold accumulates more.",
          detail: "It is an expectation, not an outcome: bold sometimes pays 0, and nothing in the number warns you on the night it does.",
        },
        {
          text: "What 6 promises: no die roll — no sequence of rolls — can hold the safe move below 6, ever.",
          detail: "It is a floor, guaranteed on every single play. The cost of the floor is real: you forfeit 2 points of expectation (12 instead of 14) to buy it.",
        },
        {
          text: "Buy the expectation when plays repeat and variance averages out — a long session, a portfolio of games, a bot playing thousands of hands.",
          detail: "This is also the correct reading against a FALLIBLE opponent: traps the perfect player would dodge now actually fire, and the expected value captures them — the machinery b-02's exercise promised.",
        },
        {
          text: "Buy the floor when a single bad outcome is catastrophic — a knockout match, a safety-critical decision, a 'lose once and it's over' setting.",
          detail: "Risk aversion is not irrationality; it is a different objective. The formalism's job is to price both so the choice is deliberate.",
        },
      ],
      result:
        "Expectimax: bold, EV 14, no guarantee. Minimax: safe, floor 6, EV sacrificed. Same tree, two coherent objectives — the engineering decision is which promise you need.",
    },
    { kind: "heading", text: "When the opponent is not a machine" },
    {
      kind: "text",
      text: "The chance node also settles the question this part has carried since b-02: does minimax's move stay optimal against an imperfect opponent? No — and the reason is now mechanical. A fallible opponent is, from your side of the board, a probability distribution over their replies: a node that behaves like a chance node with biased weights. Model the bias correctly and expectimax through that model exploits the errors the minimax player solemnly declines: the 14-versus-12 gap in miniature. Model it wrongly and you are the one being exploited — you set traps for an imagination. The classical guidance follows from the structure: if you know nothing about the opponent, minimax's worst-case floor cannot be attacked (it assumes hostility beyond what any real player delivers); if you know something, expectation through the model is worth points. Tournament programs mix the two — search the principal variation deeply and exactly, model the fringes cheaply — and human players do the same thing under the name of 'playing the player'.",
    },
    { kind: "heading", text: "When you cannot see the state" },
    {
      kind: "text",
      text: "Backgammon kept the perfect information of b-01; poker revokes it. You see your two cards and the public board; you do not see theirs. The game tree still exists — every deal, every bet, every showdown is a node — but from your seat, thousands of nodes are indistinguishable: 'they raised, and their hidden card is the ace' sits beside 'they raised, and their hidden card is a bluff-inducing deuce', and you cannot tell which node you are in. The set of nodes a player cannot distinguish is an **information set**, and it is the unit of decision in imperfect-information games: a strategy must assign one action per information set, not one per node — the same bet facing the same knowledge, whatever the hidden truth happens to be. Plain minimax or expectimax over the raw tree is not merely suboptimal here; it is undefined, because 'the best move at this node' presumes you know which node you are at. The honest machinery — reasoning about distributions over information sets, and the equilibrium concepts that replace 'optimal play' — is the gateway from classical search to game theory proper, and it is where this course hands you off with a map rather than a false ending.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The legacy line, stated soberly",
      text: "Deep Blue beat Kasparov in 1997 on exactly the machinery of this part: alpha-beta search at millions of positions per second, a hand-tuned linear evaluation of the b-07 kind, opening books and endgame tables — engineering, not mystery. Chance games followed the other line: Tesauro's TD-Gammon reached world-class backgammon by learning its evaluation from self-play, showing that the b-07 weights could be earned rather than consulted. The two lines converge in modern systems — deep search and learned evaluation, division of labour between them — and the vocabulary you now own (ply, window, ordering, horizon, expectation) is the working language of both.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-08-e1",
      exerciseKind: "predict-output",
      prompt: `The lesson computed both expectations by hand. Check the arithmetic the way you always should — by making the machine repeat it:

\`\`\`
print((0 + 12 + 30) / 3, (6 + 12 + 18) / 3)
\`\`\`

Type the line it prints.`,
      expectedOutput: `14.0 12.0`,
      solution: `bold: (0 + 12 + 30)/3 = 42/3 = 14.0; safe: (6 + 12 + 18)/3 = 36/3 = 12.0. Python prints floats, so the output carries the .0 — the values are exact integers divided by 3.`,
      explanation:
        "Two habit-forming details: expectations are just weighted sums (verify them mechanically, always), and Python 3's / produces floats even on exact division — print formatting is part of the answer.",
      concepts: ["chance node", "expectimax"],
    },
    {
      kind: "exercise",
      id: "b-08-e2",
      exerciseKind: "trace",
      prompt:
        "A MAX root has two moves. Move b1 leads to a chance node rolling a full six-sided die with payoffs 0, 0, 6, 6, 12, 12 (one per face, each probability 1/6). Move b2 leads directly to a leaf worth 5. (a) Compute the expectation of b1 and the value expectimax chooses. (b) Compute the worst case of b1 and the value a maximin player chooses. (c) In one sentence each: what does each choice promise, and what does it give up?",
      solution:
        "(a) E[b1] = (0 + 0 + 6 + 6 + 12 + 12)/6 = 36/6 = 6 > 5, so expectimax plays b1 (value 6). (b) worst(b1) = 0 < 5, so the maximin player plays b2 (guaranteed floor 5). (c) Expectimax promises the higher average — 6 per play, worth one point per play over the alternative in the long run — and gives up any floor: half the die faces pay nothing. The maximin player promises 'never below 5' on any single roll, and gives up exactly 1 point of expectation to buy it. Neither is wrong; they optimize different promises.",
      explanation:
        "This is the safe-versus-bold tree compressed to its essentials: an expectation-versus-floor gap of 1 point, purchasable in either direction. Whenever a chance node appears, compute BOTH numbers before choosing a side.",
      concepts: ["expectimax", "chance node", "worst-case reasoning"],
    },
    {
      kind: "exercise",
      id: "b-08-e3",
      exerciseKind: "concept-check",
      prompt:
        "You are writing a bot for a high-stakes, single-elimination match against an unknown opponent in a game with no chance elements. Which engine do you ship, and why?",
      options: [
        {
          text: "Minimax with alpha-beta — the opponent is unknown and one loss is final, so the unexploitable worst-case floor is worth more than any expected-value edge against a possibly-weak opponent",
          correct: true,
          feedback: "Correct on both grounds: unknown opponent means you have no calibrated model to expectimate through, and single-elimination means variance cannot average out. Minimax cannot be attacked by any strength of opponent — that is exactly what its guarantee buys.",
        },
        {
          text: "Expectimax with a 'typical club player' reply model — the extra expected points compound over the match",
          correct: false,
          feedback: "The model is uncalibrated (you said unknown), and single-elimination means there is no 'long run' for the compounding — the first cold streak ends you.",
        },
        {
          text: "Expectimax treating the opponent as uniformly random — random is the safest assumption",
          correct: false,
          feedback: "Uniform-random is a strong assumption, not a safe one: it prices the opponent as incapable of the very punishment that eliminates you.",
        },
        {
          text: "It cannot be decided from the information given",
          correct: false,
          feedback: "It can: the two facts given — unknown opponent, catastrophic single loss — are precisely the conditions under which the worst-case guarantee dominates. State them and the choice follows.",
        },
      ],
      solution:
        "Minimax with alpha-beta: unknown opponent means no model to trust, and single-elimination means no averaging — the floor is the product you need. (With a known fallible opponent and repeated play, the answer flips to expectimax through the model — the b-02 trap discussion made precise.)",
      explanation:
        "Algorithm choice is a function of what you know and what a loss costs. Chance nodes and fallible opponents do not abolish worst-case reasoning — they date it: you ship minimax when its two preconditions hold.",
      concepts: ["expectimax", "risk", "perfect-opponent assumption"],
    },
  ],
  terms: [
    {
      term: "expectimax",
      definition: "The game-tree recurrence with three node kinds — max at your nodes, min at the opponent's, expectation at chance nodes — optimizing expected utility.",
    },
    {
      term: "chance node",
      definition: "A tree node whose branches carry known probabilities rather than choices; its value is the probability-weighted average of its children.",
    },
    {
      term: "imperfect information",
      definition: "The property that some player cannot observe the full game state — hidden cards, simultaneous moves — breaking the one-move-per-known-node premise of tree search.",
    },
    {
      term: "information set",
      definition: "The set of game-tree nodes a player cannot distinguish from their seat; strategies in imperfect-information games assign one action per information set.",
    },
  ],
  mistakes: [
    {
      mistake: "Averaging at a MIN node, or minimizing at a chance node.",
      why: "The recurrence's three lines look similar and do completely different jobs: minimizing a die is infinite pessimism (the worst roll becomes 'the opponent's plan'), averaging an opponent is wishful thinking about hostility.",
      fix: "Tag every node with its kind before evaluating anything, and let the tag — not the vibes — pick the operator: max, min, or weighted sum.",
    },
    {
      mistake: "Reading an expected value as a guaranteed outcome.",
      why: "EV 14 says the long-run average is 14; the bold move still pays 0 on a third of plays. Decisions priced only by EV are variance-blind.",
      fix: "Report the floor alongside the expectation (6 versus 14 in the lesson tree), and choose by which promise the setting needs — repetition favours EV, catastrophe favours the floor.",
    },
    {
      mistake: "Running plain minimax or expectimax over the raw tree of a hidden-information game.",
      why: "The tree contains nodes the player cannot distinguish; 'the best move at this node' presumes knowing which node you are at, so the question is undefined before it is unanswered.",
      fix: "Recognize the b-01 axis violation (imperfect information) and move the unit of decision to information sets — or to a model over them — before trusting any search.",
    },
  ],
  takeaways: [
    "Chance nodes value as probability-weighted averages — neither max nor min — and expectimax is minimax plus that one line.",
    "The same tree can price bold (EV 14, floor 0) against safe (EV 12, floor 6); expectimax and minimax disagree and both are coherent — they promise different things.",
    "A fallible opponent is a biased chance node: expectimax through a correct model profits from errors minimax solemnly declines; a wrong model makes you the mark.",
    "Imperfect information dissolves 'the best move at this node' — the unit of decision becomes the information set, and the subject hands off to game theory.",
    "Part B's arc, closed: formalize (b-01), recur (b-02), trace (b-03), implement (b-04), prune (b-05), order (b-06), evaluate (b-07), and finally relax the assumptions (b-08) — every later formalism in this course extends something from this part.",
  ],
  quiz: [
    {
      id: "b-08-q1",
      prompt:
        "A chance node has three branches with probabilities 1/2, 1/4, 1/4 leading to leaves worth 8, 0 and 4. What is the node's value?",
      options: [
        {
          text: "5 — the probability-weighted average: 1/2·8 + 1/4·0 + 1/4·4 = 4 + 0 + 1",
          correct: true,
          feedback: "Correct — 5. The weights sum to 1 as they must, and every leaf contributes its value times its probability.",
        },
        {
          text: "0 — chance nodes take the worst branch, like MIN",
          correct: false,
          feedback: "That is the maximin reading of randomness the lesson warned against — a die is not an adversary, and 0 here prices a 1-in-4 event as a certainty.",
        },
        {
          text: "4 — the plain average of the leaf values",
          correct: false,
          feedback: "(8+0+4)/3 = 4 is the unweighted mean — correct only when every probability is 1/3. Here the 8 is twice as likely as each other outcome and must count double.",
        },
        {
          text: "8 — expectimax takes the maximum over branches",
          correct: false,
          feedback: "Max is for YOUR choice nodes. Nobody chooses the die's branch, so nobody maximizes over it.",
        },
      ],
      explanation:
        "Chance nodes are arithmetic, not choice: weight, sum, done — and always sanity-check that the weights sum to 1.",
    },
    {
      id: "b-08-q2",
      prompt:
        "On the lesson's tree, expectimax plays bold (EV 14) and minimax plays safe (floor 6). A classmate says one of the algorithms 'must be wrong' since they disagree. What is the correct response?",
      options: [
        {
          text: "Neither is wrong — they optimize different objectives (expected utility versus worst-case floor), and the tree legitimately prices both; the disagreement is information about the trade, not a contradiction",
          correct: true,
          feedback: "Correct. Disagreement between coherent objectives is a finding: the tree is telling you the bold move buys 2 points of expectation at the price of a 6-point floor. The choice belongs to the setting, not the algorithm.",
        },
        {
          text: "Expectimax is wrong because it risks a 0 payoff",
          correct: false,
          feedback: "Risking 0 with probability 1/3 is priced INTO the expectation. Whether that risk is acceptable is the decision-maker's question, not an error in the computation.",
        },
        {
          text: "Minimax is wrong because dice are not adversaries",
          correct: false,
          feedback: "Minimax on this tree is not a claim about the die's intentions — it is the deliberate choice of a floor over an average. Misapplying it would be wrong; choosing it is a policy.",
        },
        {
          text: "Both are wrong because chance nodes make the value undefined",
          correct: false,
          feedback: "Undefined was the imperfect-information case. With visible state and known probabilities, both values are perfectly well defined — just different.",
        },
      ],
      explanation:
        "The recurrence's three lines give every tree a well-defined value under each objective; the objectives coexist. Part of mastering game algorithms is refusing to collapse 'different' into 'one right, one wrong'.",
    },
    {
      id: "b-08-q3",
      prompt: "Why does plain tree search break down in a hidden-card game?",
      options: [
        {
          text: "Because the player cannot distinguish nodes that differ in hidden state, so a strategy must be constant over each information set — 'the best move at this node' assumes knowledge the player does not have",
          correct: true,
          feedback: "Correct — the tree exists, but the DECISION UNIT is wrong: per-node moves leak hidden information and are undefined at the table. Information sets are the repair, and the full repair (equilibrium reasoning over them) is game theory.",
        },
        {
          text: "Because hidden cards make the game tree infinite",
          correct: false,
          feedback: "The tree is finite for any fixed deck — its size has nothing to do with visibility.",
        },
        {
          text: "Because chance nodes cannot be evaluated without seeing the cards",
          correct: false,
          feedback: "Chance nodes evaluate fine on known probabilities — the deal's distribution is public even when the realized cards are not. The obstacle is not the arithmetic but the indistinguishability of nodes.",
        },
        {
          text: "It doesn't — poker bots run minimax with an evaluation function",
          correct: false,
          feedback: "Modern poker agents reason over information sets and equilibrium strategies; running plain minimax per node is precisely the leak-and-undefined error the lesson names.",
        },
      ],
      explanation:
        "Perfect information was b-01's axis, and this is where it earns its keep: the moment it fails, the unit of decision changes, and the classical search of Part B hands off to the formalism built for the dark.",
    },
  ],
};
