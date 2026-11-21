/**
 * Lesson b-02 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_02: ClassicalLesson = {

  slug: "b-02",
  title: "The Minimax Algorithm",
  minutes: 30,
  summary:
    "Assume the opponent plays perfectly: back values up from leaves, max at your levels, min at theirs.",
  kind: "concept",
  objectives: [
    "Read a game tree: MAX and MIN levels, terminal utilities, backed-up values",
    "State the minimax recurrence and explain what the perfect-opponent assumption buys and costs",
    "Trace minimax on a two-ply game by hand with every value justified",
    "Explain why minimax values are guarantees, not predictions",
  ],
  why: "The moment a second agent moves inside your plan, search changes character: an opponent's move is a step you do not choose, and any algorithm that pretends otherwise (greedy path search, A* with its single-agent goal) is lying to itself. Minimax is the classical answer — the value of a position under the pessimistic assumption that the opponent always plays the move that is worst for you. It is the foundation of every game program from tic-tac-toe to Deep Blue, and the recurrences you learn here are exactly the ones alpha-beta pruning will accelerate in the next lesson without changing a single answer.",
  blocks: [
    {
      kind: "text",
      text: "A game in the classical sense is a tree with two alternating voices. At MAX nodes it is your move; at MIN nodes it is your opponent's; at the leaves, the game has ended and a **utility** — a number from your point of view — settles the account. Minimax answers the only question that matters before you commit to a move: *if both of us play perfectly from here, how does this end for me?*",
    },
    {
      kind: "definition",
      term: "Minimax value",
      informal:
        "The value of a position when both players play optimally — you maximizing the utility, the opponent minimizing it.",
      formal:
        "MINIMAX(n) = u(n) \\text{ if } n \\text{ terminal}; \\ \\max_{c} \\text{MINIMAX}(c) \\text{ at MAX}; \\ \\min_{c} \\text{MINIMAX}(c) \\text{ at MIN}",
      why: "The recurrence is the algorithm: there is nothing else to minimax but this equation, evaluated depth-first.",
    },
    { kind: "heading", text: "The recurrence, read carefully" },
    {
      kind: "math",
      title: "Backing up values",
      derivation: {
        title: "Why max-then-min is the right pessimism",
        steps: [
          { expr: "V(n) = \\max_{c \\in \\text{children}(n)} V(c)", reason: "at a MAX node, you choose — take the best guaranteed" },
          { expr: "V(n) = \\min_{c \\in \\text{children}(n)} V(c)", reason: "at a MIN node, the opponent chooses — assume the worst for you" },
          { expr: "V(\\text{leaf}) = u(\\text{leaf})", reason: "the utility function settles terminal positions" },
        ],
      },
      caption:
        "Note what is being assumed: the opponent is a perfect minimizer of your utility. Real opponents err — and Lesson b-08 replaces min with expectation to model that.",
    },
    {
      kind: "algorithm",
      name: "Minimax",
      family: "Adversarial search",
      problem: "Choose the best move in a two-player, zero-sum, perfect-information game whose tree is small enough to search to terminal states.",
      idea:
        "Evaluate the tree bottom-up: leaves carry utilities, MIN nodes take the minimum of their children, MAX nodes the maximum. The root's best move is the child whose backed-up value equals the root's value.",
      strategy: [
        "Generate the game tree to terminal (or cutoff) depth",
        "Score the leaves with the utility function",
        "Back values up: min at the opponent's levels, max at yours",
        "Play the root move whose child value equals the root's value",
      ],
      guarantees: [
        "Returns the optimal move against a perfect opponent",
        "The backed-up value is a guarantee, not a prediction: no opponent can hold you below it",
      ],
      useWhen: [
        "The tree fits your compute budget (tic-tac-toe, endgames, small games)",
        "You want worst-case robustness rather than exploitation of a weak opponent",
      ],
      pitfalls: [
        "O(b^m) time — the exponent is the whole game, not your half of it",
        "The perfect-opponent model wastes traps a fallible opponent would fall for",
      ],
    },
    { kind: "heading", text: "A full trace" },
    {
      kind: "text",
      text: "Here is the canonical two-ply game: you (MAX) choose among three moves; the opponent (MIN) answers each with one of three; the leaves are utilities from your point of view. Work the bottom row first, then the middle, then decide:",
    },
    {
      kind: "gameTree",
      title: "Two-ply minimax, every value justified",
      root: {
        kind: "max",
        children: [
          {
            edgeLabel: "a1",
            child: {
              kind: "min",
              value: 3,
              children: [
                { edgeLabel: "b1", child: { kind: "leaf", value: 3 } },
                { edgeLabel: "b2", child: { kind: "leaf", value: 12 } },
                { edgeLabel: "b3", child: { kind: "leaf", value: 8 } },
              ],
            },
          },
          {
            edgeLabel: "a2",
            child: {
              kind: "min",
              value: 2,
              children: [
                { edgeLabel: "b1", child: { kind: "leaf", value: 2 } },
                { edgeLabel: "b2", child: { kind: "leaf", value: 4 } },
                { edgeLabel: "b3", child: { kind: "leaf", value: 6 } },
              ],
            },
          },
          {
            edgeLabel: "a3",
            child: {
              kind: "min",
              value: 2,
              children: [
                { edgeLabel: "b1", child: { kind: "leaf", value: 14 } },
                { edgeLabel: "b2", child: { kind: "leaf", value: 5 } },
                { edgeLabel: "b3", child: { kind: "leaf", value: 2 } },
              ],
            },
          },
        ],
      },
      conclusion:
        "The MIN layer backs up min(3,12,8)=3, min(2,4,6)=2, min(14,5,2)=2. MAX takes the largest: 3, and plays a1. The 14 is a lure — the opponent will never let you have it.",
      caption:
        "Read the tags: MAX squares choose, MIN circles choose against you, leaves are utilities. The value beside each internal node is its backed-up minimax value.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The 14 is the lesson",
      text: "Every beginner wants move a3 — look at that 14! But 14 belongs to a leaf the opponent will steer away from; the most you can extract through a3 is 2, because the opponent plays b3 and hands it to you. Minimax is an exercise in reading the tree through the opponent's eyes. When you catch yourself evaluating your own fantasies, you have found the bug.",
    },
    { kind: "heading", text: "Implementation sketch" },
    {
      kind: "pseudocode",
      title: "Recursive minimax with a node counter",
      lines: [
        { text: "function MINIMAX(node, maximizing)", tone: "key" },
        { text: "count ← count + 1", indent: 1 },
        { text: "if node is terminal then return UTILITY(node)", indent: 1 },
        { text: "if maximizing then", indent: 1 },
        { text: "return max over children of MINIMAX(child, false)", indent: 2 },
        { text: "else", indent: 1 },
        { text: "return min over children of MINIMAX(child, true)", indent: 2 },
      ],
      note: "Time O(b^m) — every leaf of the whole game tree. Space O(m): the recursion holds one path.",
    },
    {
      kind: "example",
      title: "Tic-tac-toe endgame: one move decides",
      problem:
        "X to move; the board is nearly full. Show that the minimax value of the position is a win for X (+1), and find the winning move.",
      steps: [
        { text: "Draw the remaining tree: X has two legal moves; after each, O has at most one reply.", detail: "The tree is two plies deep — terminal in every branch, utilities +1 (X wins), 0 (draw), −1 (O wins)." },
        { text: "Score the leaves by reading the boards.", detail: "Move 1 produces leaves {+1, +1}: O has no defense. Move 2 produces {+1, 0}: O can force half a point back by blocking." },
        { text: "Back up: both MIN nodes take the minimum of their leaves — min(+1,+1)=+1 and min(+1,0)=0.", detail: "O chooses; assume O takes your worst." },
        { text: "MAX takes max(+1, 0) = +1 — move 1. The value is a forced win, provable in four leaves.", detail: "This is the whole algorithm on a board small enough to verify by staring." },
      ],
      result: "Value +1; the forced win is move 1. Forty-nine leaves suffice for a full game from the empty board — 255,168 complete games exist, and minimax visits them all to prove the draw.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-02-e1",
      exerciseKind: "predict-output",
      prompt:
        "The program from the next lesson's code family runs on the tree above (children order a1, a2, a3; leaves left to right) with a node counter that increments on every call, leaves included. How many calls does plain minimax make? (Count the root, the three MIN nodes, and the nine leaves.)",
      expectedOutput: "13",
      solution: "13",
      explanation: "1 root + 3 MIN + 9 leaves = 13 calls. Every node of the tree is visited exactly once: minimax has no way to skip, which is precisely the waste alpha-beta will attack in b-05 (it visits 11 of these 13).",
      concepts: ["minimax", "node counting"],
    },
    {
      kind: "exercise",
      id: "b-02-e2",
      exerciseKind: "trace",
      prompt:
        "Change one leaf: a3's b1 becomes 14 → 1 (the other leaves unchanged). Re-derive all three MIN values, the root value, and the move minimax plays. What did the change prove about the 14?",
      solution:
        "MIN values: min(3,12,8)=3, min(2,4,6)=2, min(1,5,2)=1. Root: max(3,2,1)=3 → still move a1. The 14 was never load-bearing: because MIN takes the minimum, only a3's SMALLEST leaf matters. Lowering the best leaf of a bad branch changed nothing at the root — the same insensitivity alpha-beta exploits when it skips whole branches.",
      explanation: "Minimax's decisions depend on minima at MIN nodes and maxima at MAX nodes — never on the showy middle values. That is the structural fact that makes pruning sound.",
      concepts: ["minimax", "backed-up values"],
    },
    {
      kind: "exercise",
      id: "b-02-e3",
      exerciseKind: "concept-check",
      prompt:
        "Your opponent is known to play uniformly at random. Minimax still plays a1. Is a1 optimal against THIS opponent?",
      options: [
        { text: "Yes — minimax is always optimal", correct: false, feedback: "Minimax is optimal against the PERFECT opponent it models. Against a random one, 'optimal play' is a different calculation — expectimax — and may prefer a different move." },
        { text: "Not necessarily: against a random opponent, the move with the highest EXPECTED value may beat the minimax move, because traps the perfect player would dodge now actually fire", correct: true, feedback: "Correct — the guarantee is conditional on the model. Minimax buys worst-case robustness; against fallible opponents it leaves exploitation value on the table (Lesson b-08 quantifies this with chance nodes)." },
        { text: "No — random play makes every move equivalent", correct: false, feedback: "Randomness does not flatten the tree; expected utilities still differ by move." },
        { text: "The question is meaningless — games have no randomness", correct: false, feedback: "Opponent randomness is as real as dice randomness; both are modeled with expectations." },
      ],
      solution: "Minimax is a worst-case guarantee; optimal play against a random opponent is the expectation-maximizing move — possibly a different one.",
      explanation: "Always ask what an algorithm assumes about the other player. Minimax's answer — 'perfection' — is a modeling choice, not a law of nature.",
      concepts: ["minimax", "perfect-opponent assumption", "expectimax"],
    },
  ],
  terms: [
    {
      term: "utility",
      definition: "The number a terminal position is worth to MAX — the game's whole scoring, seen from one player's side of the board.",
    },
    {
      term: "ply",
      definition: "One half-move: one player's turn in the tree. Two plies = you and the opponent each move once.",
    },
    {
      term: "backed-up value",
      definition: "A node's minimax value, computed from its descendants rather than stored: the min (or max) of what lies beneath.",
    },
    {
      term: "zero-sum game",
      definition: "A game whose utilities sum to a constant — one player's gain is exactly the other's loss, so a single value function serves both.",
    },
  ],
  mistakes: [
    {
      mistake: "Evaluating your own best line while ignoring the opponent's replies (max-max search).",
      why: "The 14-leaf fallacy: the branch you love contains the branch the opponent will choose. Every other node you back up is then fiction.",
      fix: "Alternate strictly: if it is not your level, take the min. The tree's shape tells you whose voice each level is.",
    },
    {
      mistake: "Goal-testing at internal nodes as if it were path search.",
      why: "Games end at terminals or cutoffs decided by BOTH players' moves; there is no goal state you alone steer toward.",
      fix: "Think utilities at leaves, recurrence above them — the search returns a move and a guaranteed value, not a path to a goal.",
    },
  ],
  takeaways: [
    "Minimax backs utilities up the tree: max where you choose, min where the opponent does. The root value is a guarantee under perfect play.",
    "The recurrence is the algorithm — depth-first evaluation, O(b^m) time, O(m) space.",
    "Only extrema matter: middle leaves like the 14 never influence the decision, which is exactly the slack pruning will cut.",
    "The perfect-opponent assumption is a model: against fallible players, expectimax (b-08) is the honest alternative.",
  ],
  quiz: [
    {
      id: "b-02-q1",
      prompt: "In the traced tree, what is the minimax value of the root, and which move achieves it?",
      options: [
        { text: "3, playing a1", correct: true, feedback: "Correct: min(3,12,8)=3, min(2,4,6)=2, min(14,5,2)=2, and max(3,2,2)=3 via a1." },
        { text: "14, playing a3", correct: false, feedback: "The 14 is one leaf of three at a MIN node — the opponent plays b3 and you get 2." },
        { text: "2, playing a2", correct: false, feedback: "2 is the value OF a2 — but a1 guarantees 3, and max takes 3." },
        { text: "8, playing a1", correct: false, feedback: "8 is a leaf under a1, not a1's value: min(3,12,8) = 3." },
      ],
      explanation: "Back up level by level: every MIN node reports its smallest child; the root takes the largest of those minima.",
    },
    {
      id: "b-02-q2",
      prompt: "Minimax's returned value is best described as:",
      options: [
        { text: "A prediction of the game's actual outcome", correct: false, feedback: "Only against a perfect opponent does the actual outcome match. The value is a floor you can enforce, not a forecast." },
        { text: "A guarantee: the best you can force against best play, which no opponent can hold you below", correct: true, feedback: "Exactly — the value is enforceable from your side and unavoidable from theirs. That asymmetry is what 'optimal' means in games." },
        { text: "An estimate that improves with more plies", correct: false, feedback: "With a full tree it is exact, not estimated — and with a cutoff it is an evaluation function's opinion, a different object." },
        { text: "The average outcome over random play", correct: false, feedback: "That is expectimax's answer, not minimax's." },
      ],
      explanation: "Guarantee, not prediction: minimax prices the worst case, which is why programs that must not lose run it.",
    },
  ],

};
