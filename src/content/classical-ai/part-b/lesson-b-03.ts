/**
 * Lesson b-03 "Minimax by Hand: Three Worked Games" — the tracing lesson.
 * Every number verified by hand: the tic-tac-toe endgame spans +1 / 0 / −1
 * across its three branches (each leaf re-checked on the board); the nim
 * example applies Bouton's XOR characterization with two full lines of play;
 * the coin game compares a depth-2 cutoff (eval = mine − theirs) against the
 * full 4-ply truth (cutoff said +1, truth is +2 — decision right, value off).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_03: ClassicalLesson = {
  slug: "b-03",
  title: "Minimax by Hand: Three Worked Games",
  minutes: 30,
  summary:
    "Full traces on tic-tac-toe endgames, nim and a cutoff-depth game — the skill every later topic builds on.",
  kind: "coding",
  objectives: [
    "Trace minimax on a complete small game with every backed-up value justified from the rules",
    "Decide nim positions by hand using the XOR-zero characterization, and argue both directions of why it works",
    "Apply a depth cutoff with a static evaluation function, and state honestly what the resulting values do and do not guarantee",
    "Distinguish terminal utilities from evaluated leaves — the difference between proof and opinion",
  ],
  why: "Minimax is not a spectator sport. You can read the recurrence in Lesson b-02 and nod along, and still mislabel your first tree the moment a branch forks against you. The cure is deliberate practice on games small enough to verify completely, which is what this lesson is: one tic-tac-toe endgame whose three moves span win, draw and loss; one nim position solved by a law you can carry to any number of heaps; and one game just deep enough that finishing the tree is a choice rather than a necessity — so you meet the depth cutoff, the trick that makes chess programs possible, on a four-coin line where you can still compute the truth it approximates. Everything later in this part — alpha-beta's cuts, move ordering, evaluation functions — is judged against these hand traces. If you can back up values correctly by hand, no algorithm in Part B will ever be mysterious; if you cannot, the algorithms will only automate your errors.",
  blocks: [
    {
      kind: "text",
      text: "This lesson runs on three games, each chosen to teach one thing the previous one could not. Tic-tac-toe shows a *complete* trace — every leaf is a real game ending, so every value is a fact. Nim shows a *law* — the P-positions have a closed-form characterization, and hand-tracing collapes into arithmetic. And the coin game shows a *cutoff* — a tree you deliberately refuse to finish, where the leaves carry an evaluation function's opinion instead of a utility. Fact, law, opinion: three kinds of number, three kinds of guarantee.",
    },
    { kind: "heading", text: "Game 1 — a tic-tac-toe endgame, read to the end" },
    {
      kind: "text",
      text: "X to move. The board: row 0 is `X · X`, row 1 is `· O O`, row 2 is `O · X`. Three cells remain open — the centre-left `(1,0)`, the top-centre `(0,1)`, and the bottom-centre `(2,1)`. Read the threats before touching the tree: X occupies `(0,0)` and `(0,2)`, so playing `(0,1)` completes the top row and wins on the spot. But O occupies `(1,1)` and `(1,2)`, so if X ever leaves `(1,0)` open on O's turn, O completes the middle row and wins. Two live threats, one move each — exactly the position where intuition needs the tree's discipline.",
    },
    {
      kind: "gameTree",
      title: "The endgame, all five endings traced",
      root: {
        kind: "max",
        value: 1,
        children: [
          {
            edgeLabel: "X: (0,1)",
            child: { kind: "leaf", value: 1 },
          },
          {
            edgeLabel: "X: (1,0)",
            child: {
              kind: "min",
              value: 0,
              children: [
                { edgeLabel: "O: (0,1)", child: { kind: "leaf", value: 0 } },
                { edgeLabel: "O: (2,1)", child: { kind: "leaf", value: 1 } },
              ],
            },
          },
          {
            edgeLabel: "X: (2,1)",
            child: {
              kind: "min",
              value: -1,
              children: [
                { edgeLabel: "O: (0,1)", child: { kind: "leaf", value: 0 } },
                { edgeLabel: "O: (1,0)", child: { kind: "leaf", value: -1 } },
              ],
            },
          },
        ],
      },
      conclusion:
        "The three X-moves are worth +1, 0 and −1 — win, draw, loss. Branch (0,1) ends the game at once: X X X on the top row. Branch (1,0) takes the cell O needs, and O's best is the block (0,1) (value 0); O's alternative (2,1) lets X win with (0,1), so the MIN node reports min(0, +1) = 0. Branch (2,1) ignores both key cells, and O punishes with (1,0) — middle row complete, value −1 — so O's blocking alternative (0,1), worth 0 to O's −1 preference, is declined. MAX takes +1 and plays (0,1).",
      caption:
        "Five leaves, eight nodes, the entire game. Utilities: +1 X wins, 0 draw, −1 O wins. Every leaf was verified by playing the board out — that is what makes these values facts rather than estimates.",
    },
    {
      kind: "example",
      title: "Reading the tree against the board",
      problem:
        "Verify each of the five leaves of the tree above by playing the corresponding line on the board, and confirm the backed-up values at every level.",
      steps: [
        {
          text: "Leaf `X:(0,1) → +1`: the top row becomes `X X X` — the game ends immediately, a terminal utility, not an estimate.",
          detail: "One ply, one ending. The most common beginner error here is to 'look deeper' — there is no deeper; terminals are where utilities live.",
        },
        {
          text: "Branch `X:(1,0)`: O may block at (0,1) or slip to (2,1). If O blocks, the last cell (2,1) goes to X and the full board has no line — draw, 0. If O plays (2,1) instead, X answers (0,1) and wins, +1.",
          detail: "O chooses, so the node takes the minimum: min(0, +1) = 0. O prefers the half point of a draw to handing X the win.",
        },
        {
          text: "Branch `X:(2,1)`: the move fills neither `(0,1)` nor `(1,0)`. O now has the choice: block X's top row with (0,1) — draw, 0 — or complete O's own middle row with (1,0) — O wins, −1.",
          detail: "O will not settle for a draw while a win is on the board: min(0, −1) = −1. This is the branch intuition misses — (2,1) 'develops' X's bottom-right diagonal, and loses on the spot.",
        },
        {
          text: "Back up: MAX over {+1, 0, −1} is +1, achieved by (0,1).",
          detail: "The move set spans the full spectrum of outcomes — the position is rich precisely so that a wrong move is punished, and the tree catches every punishment.",
        },
      ],
      result:
        "Value +1, forced win by (0,1). The trace also prices the alternatives exactly: the solid block (1,0) draws (0), the tempting (2,1) loses (−1).",
    },
    { kind: "heading", text: "Game 2 — nim and the XOR law" },
    {
      kind: "text",
      text: "Lesson b-01 left nim's two-heap diagonal as an observed pattern: the equal-heap states are the P-positions. The general law behind that pattern is one of the oldest results in game theory (Bouton, 1901), and it turns nim from a tree-tracing exercise into an arithmetic one. Write each heap size in binary and stack the columns. A position is a loss for the mover exactly when **every column holds an even number of 1s** — equivalently, when the heap sizes XOR to zero. One move changes a single heap, so it flips at least one column's parity and destroys the evenness; and from any uneven position there is always a move that restores it. Both directions of that argument are the proof.",
    },
    {
      kind: "math",
      title: "Bouton's characterization",
      derivation: {
        title: "Why XOR-zero marks the losing positions",
        steps: [
          {
            expr: "a_1 \\oplus a_2 \\oplus \\dots \\oplus a_k = 0",
            reason: "the P-positions: every binary column carries an even number of 1s (the XOR of all heaps is zero)",
          },
          {
            expr: "\\text{a nim move sends exactly one } a_i \\text{ to } a_i' < a_i",
            reason: "you take one or more sticks from a single heap, so that heap shrinks — and its binary form changes in at least one bit",
          },
          {
            expr: "a_1 \\oplus \\dots \\oplus a_i' \\oplus \\dots \\oplus a_k != 0",
            reason: "flipping bits inside one term flips the parity of every column it touches — an even-parity position cannot stay even, so every move from XOR-zero lands on XOR-nonzero",
          },
          {
            expr: "\\text{from XOR} != 0 \\text{ a restoring move exists}",
            reason: "let m be the highest odd-parity column and pick a heap with a 1 there; reduce it to the XOR of the other heaps — the target is smaller (its top bit clears), so the move is legal, and the columns all become even",
          },
        ],
      },
      caption:
        "Two directions, two strategies: from XOR-zero you cannot help leaving a winning-for-the-opponent position; from XOR-nonzero you can always hand back an XOR-zero one. Since sticks strictly decrease, the game ends, and the player who keeps restoring XOR-zero takes the last stick.",
    },
    {
      kind: "example",
      title: "Heaps (3, 4, 5): the law in action",
      problem:
        "Three nim heaps hold 3, 4 and 5 sticks; you move first; the last stick wins. Decide the position, find the winning move, and play out one full line of opposition.",
      steps: [
        {
          text: "Compute the XOR: `3 ⊕ 4 ⊕ 5` = `011 ⊕ 100 ⊕ 101` = `010` = 2 ≠ 0.",
          detail: "Column by column: the 4s-column (2²) holds 4 and 5 — even; the 2s-column holds only 3 — odd; the 1s-column holds 3 and 5 — even. One odd column, so the mover wins.",
        },
        {
          text: "Find the restoring move: the highest odd column is the 2s-column, owned by the heap of 3. Reduce it to the XOR of the others: `4 ⊕ 5 = 1`.",
          detail: "Taking 3 − 1 = 2 sticks from the first heap gives (1, 4, 5): `001 ⊕ 100 ⊕ 101` = 0. Any other move leaves an odd column for the opponent to repair.",
        },
        {
          text: "Opponent replies — say they take 3 from the heap of 4, reaching (1, 1, 5). Restore: `1 ⊕ 1 = 0`, so heap three must go to 0 — take all five.",
          detail: "The position (1, 1, 0) is handed back with XOR zero. Had they emptied heap three instead ((1, 4, 0), XOR 5), the restore is heap two to `1 ⊕ 0 = 1`: take 3, again (1, 1, 0). The law gives the reply to *every* move — that is what makes it a strategy rather than a path.",
        },
        {
          text: "From (1, 1, 0) the opponent must break the pair — (0, 1, 0) or (1, 0, 0) — and you take the final stick.",
          detail: "Both remaining moves leave a single stick; whichever heap they touch, you empty the other. The last move of the game is yours by construction.",
        },
      ],
      result:
        "(3, 4, 5) is a win for the mover: take 2 from the first heap to reach (1, 4, 5), then restore XOR-zero after every reply. Five states visited, zero nodes expanded — the law replaced the tree.",
    },
    {
      kind: "text",
      text: "Notice what just happened: a game with a twelve-state opening region was decided by four arithmetic steps. Hand tracing remains the ground truth — the law itself is *proved* by the two directions you just read — but once a pattern is proved, carrying it beats recomputing it. This is the permanent shape of the subject: compute small cases by hand, notice the structure, prove it, then let algorithms (minimax, alpha-beta) find the structure in games too rich for closed forms.",
    },
    { kind: "heading", text: "Game 3 — too deep to finish: the cutoff" },
    {
      kind: "text",
      text: "Four coins lie in a row: `[3, 4, 5, 6]`. Players alternate taking one coin from *either end*; when the row is empty, whoever holds the larger total wins (the coins sum to 18, so the game is zero-sum — your gain is exactly your opponent's loss). The full tree is four plies deep — finishable, as you will do in a moment. But suppose your search budget is **two plies**: you move, the opponent replies, and then you *stop and evaluate* with the simplest honest function: your coins' total minus theirs. What does minimax-with-a-cutoff recommend, and how wrong is it?",
    },
    {
      kind: "gameTree",
      title: "Depth-2 cutoff search on [3, 4, 5, 6]",
      root: {
        kind: "max",
        value: 1,
        children: [
          {
            edgeLabel: "take 3 (left)",
            child: {
              kind: "min",
              value: -3,
              children: [
                { edgeLabel: "O: 4", child: { kind: "leaf", value: -1 } },
                { edgeLabel: "O: 6", child: { kind: "leaf", value: -3 } },
              ],
            },
          },
          {
            edgeLabel: "take 6 (right)",
            child: {
              kind: "min",
              value: 1,
              children: [
                { edgeLabel: "O: 3", child: { kind: "leaf", value: 3 } },
                { edgeLabel: "O: 5", child: { kind: "leaf", value: 1 } },
              ],
            },
          },
        ],
      },
      conclusion:
        "Cut off after two plies and evaluate: taking the 3 leaves the row [4, 5, 6]; the opponent takes the 6 (not the 4), and the evaluation reads 3 − 6 = −3. Taking the 6 leaves [3, 4, 5]; the opponent takes the 5 (not the 3), and the evaluation reads 6 − 5 = +1. MAX prefers +1: take the 6 from the right.",
      caption:
        "These leaves are NOT terminals — the row still holds two coins. Each value is the evaluation function's opinion (my total − theirs) after two plies, which is why the inner MIN nodes' children carry the eval, not a utility. The cutoff is what makes deep games searchable — and what surrenders minimax's guarantee.",
    },
    {
      kind: "example",
      title: "Cutoff against the truth",
      problem:
        "Compute the full four-ply value of [3, 4, 5, 6] (the real game), then compare it with the depth-2 recommendation and its estimate.",
      steps: [
        {
          text: "Branch 'take 6': the row is [3, 4, 5]. Opponent options: take 3 → [4, 5], or take 5 → [3, 4].",
          detail: "If they take 3, you take 5, they take 4: totals you 11, them 7 → +4. If they take 5, you take 4, they take 3: you 10, them 8 → +2. They choose for their own good: +2.",
        },
        {
          text: "Branch 'take 3': the row is [4, 5, 6]. Opponent takes 6 → [4, 5], or 4 → [5, 6].",
          detail: "If they take 6, you take 5, they take 4: you 8, them 10 → −2. If they take 4, you take 6, they take 5: you 9, them 9 → 0. They prefer −2 for you.",
        },
        {
          text: "Full-game value: max(+2, −2) = +2 by taking the 6 — the same move the cutoff chose.",
          detail: "The DECISION survived; the estimate did not. The cutoff priced the move at +1; the truth is +2, because two plies never saw the 4 and 5 you collect later.",
        },
        {
          text: "Read the comparison honestly: cutoff minimax is heuristic.",
          detail: "It agreed here because the evaluation function (material difference) measures exactly what the game scores. Change the game — add a bonus for adjacent coins, hide a coin's value — and the same depth-2 search can prefer the wrong move outright. Lesson b-07 makes evaluation-function design its whole subject.",
        },
      ],
      result:
        "Full value +2 (take 6); cutoff value +1 (take 6). Same move, different number — and no guarantee in general. The horizon, not the arithmetic, is the risk.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The horizon problem, met early",
      text: "A cutoff search only 'sees' to its depth. On [3, 4, 5, 6] the unexamined remainder was harmless. But imagine the same game with a coin whose value depends on its neighbours: the winning sequence could sit entirely beyond the cutoff, and the evaluation function would price the position from the visible plies alone — confidently and wrongly. Programs fight this with deeper search, quiescence checks and better evaluation functions; you should hold the honest conclusion now: a cutoff value is an *opinion ranked by depth*, and only terminal utilities are facts. Keep the distinction, because Lesson b-05's alpha-beta inherits it: pruning never changes a value, but the cutoff that produced it already did.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-03-e1",
      exerciseKind: "concept-check",
      prompt:
        "In Game 1's branch X:(1,0), one of O's replies — (2,1) — leads to a leaf valued +1 for X. Why does the MIN node above it still report 0, and why is that correct?",
      options: [
        {
          text: "Because O chooses at that node, and O's other reply (0,1) leads to a draw — the node's value is the best O can secure, which is 0 for X",
          correct: true,
          feedback: "Correct — a node's value is the chooser's optimum. O will not play (2,1) and hand X the win, so the branch's value is min(0, +1) = 0. The +1 leaf documents a mistake O will not make.",
        },
        {
          text: "Because the value +1 is an evaluation, not a terminal utility, so it cannot propagate",
          correct: false,
          feedback: "In Game 1 every leaf is a real game ending — the +1 IS a terminal utility. It is not propagated past O's choice because O chooses against it, not because of its pedigree.",
        },
        {
          text: "Because MIN nodes always report 0 when their children disagree",
          correct: false,
          feedback: "MIN nodes report the minimum of their children — here min(0, +1). Compare the other MIN node: min(0, −1) = −1, not 0.",
        },
        {
          text: "Because the tree's convention scores draws before wins",
          correct: false,
          feedback: "There is no such convention; utilities are compared numerically, and O simply selects the child smallest for X.",
        },
      ],
      solution:
        "The MIN node's value is what the chooser (O) can enforce: O plays the block (0,1) for a draw (0), declining (2,1) which would give X +1. So the branch is worth 0 to X.",
      explanation:
        "Backing up is not averaging or voting — it is alternately assuming each side plays its best. One side's fantasy leaf is exactly what the other side's choice removes.",
      concepts: ["trace", "backed-up values"],
    },
    {
      kind: "exercise",
      id: "b-03-e2",
      exerciseKind: "trace",
      prompt:
        "Two-heap nim, heaps (2, 3), you move first, last stick wins. (a) Compute the XOR and classify the position. (b) Find every winning first move. (c) After your move, the opponent takes BOTH sticks of the 2-heap — give your winning reply and the guarantee it carries.",
      solution:
        "(a) `2 ⊕ 3 = 01 ⊕ 10 = 11` = 3 ≠ 0, so (2, 3) is an N-position — a win for the mover. (b) The restoring move must make the XOR zero; equal heaps do that: take 1 from the 3-heap, reaching (2, 2). Reducing the 2-heap cannot work (its target would be 3, larger than 2), so this is the ONLY winning move. (c) From (2, 2) the opponent empties a heap: (0, 2). You take both remaining sticks — (0, 0) — and win. The guarantee: whatever they do from (2, 2) breaks the XOR, and the restore is always available; sticks run out, and the last one is yours.",
      explanation:
        "This is Bouton's law used as a playing strategy: classify by XOR, move to XOR-zero, restore after every reply. The single-winning-move detail matters — from most N-positions several restores exist; from (2, 3) exactly one, so precision is forced on you.",
      concepts: ["game tree", "trace", "P-position"],
    },
    {
      kind: "exercise",
      id: "b-03-e3",
      exerciseKind: "trace",
      prompt:
        "The coin game of Game 3, row `[4, 3, 9]` (take from either end; larger total wins; the row sums to 16). (a) Run depth-2 cutoff search with eval = (my coins) − (their coins): give both of your moves, the opponent's best reply to each, and the resulting values. (b) Compute the full three-ply truth for both moves. (c) Does the cutoff choose correctly here, and does its *value* match the truth?",
      solution:
        "(a) Take 4 (left): row [3, 9]; the opponent takes 9 (not 3); eval = 4 − 9 = −5. Take 9 (right): row [4, 3]; the opponent takes 4 (not 3); eval = 9 − 4 = +5. Cutoff recommends taking 9 at +5. (b) Truth: take 9 → [4, 3]: if they take 4 you take 3 → you 12, they 4 (+8); if they take 3 you take 4 → you 13, they 3 (+10); they choose 4 → +8. Take 4 → [3, 9]: if they take 3 you take 9 → you 13, they 3 (+10); if they take 9 you take 3 → you 7, they 9 (−2); they choose 9 → −2. (c) Yes — take 9 is correct (max(+8, −2) = +8), but the cutoff's number (+5) is again below the truth (+8): the final coin you collect sits beyond the horizon. Decision right, value approximate — the standing caveat of cutoff search.",
      explanation:
        "With eval measuring exactly the game's scoring rule (material), the depth-2 decision tends to survive — but the price is systematically blind to the unsearched remainder. When you reach Lesson b-07, ask of every evaluation function: what does it see that the last two plies do not?",
      concepts: ["cutoff", "evaluation function", "zero-sum game"],
    },
  ],
  terms: [
    {
      term: "game tree",
      definition: "The tree of positions reachable by alternating legal play: nodes are positions, edges are moves, levels alternate between the players.",
    },
    {
      term: "trace",
      definition: "A written-out execution of a search algorithm on a concrete tree — every expanded node, every backed-up value, every choice justified by rule.",
    },
    {
      term: "terminal test",
      definition: "The predicate deciding whether a position ends the game; only at terminals are utilities defined, which is what makes terminal-search values facts rather than opinions.",
    },
    {
      term: "static evaluation",
      definition: "A function pricing a non-terminal position from visible features (material, mobility, threats); cutoff search replaces unseen terminals with its opinions.",
    },
  ],
  mistakes: [
    {
      mistake: "Stopping the trace before terminals or a declared cutoff, and backing up whatever number is at hand.",
      why: "Intermediate board features are not utilities; a value backed from them is an evaluation wearing a utility's clothes, and its 'guarantee' is fiction.",
      fix: "Decide the depth BEFORE tracing, and label every leaf honestly: terminal (a fact) or evaluated (an opinion). The guarantee belongs only to the first kind.",
    },
    {
      mistake: "Playing nim by greed — always taking the most sticks.",
      why: "Greed optimizes this move, but nim is about the position you hand over; (2, 3) is won by taking ONE stick, not two or three.",
      fix: "Compute the XOR and move to zero. The invariant, not the impulse, is the strategy.",
    },
    {
      mistake: "Reading a cutoff value as a guaranteed outcome.",
      why: "The depth-2 search on [3, 4, 5, 6] said +1 and the truth was +2 — and that is the benign case; a misleading evaluation can flip the move itself.",
      fix: "Attach the horizon to every cutoff number: 'value +1 at depth 2'. Only terminal-backed values deserve unqualified statements.",
    },
  ],
  takeaways: [
    "A complete hand trace turns values into facts: the tic-tac-toe endgame's three moves were worth exactly +1, 0 and −1, every leaf played out on the board.",
    "Bouton's law: nim positions are losses for the mover exactly when the heap XOR is zero — every move breaks the evenness, and from any non-zero position a restoring move exists.",
    "A depth cutoff makes deep games searchable by replacing unseen terminals with an evaluation function's opinion — the decision is then heuristic, whatever the arithmetic says.",
    "Fact, law, opinion: terminal utilities are proved, characterized values are lawful, evaluated leaves are estimates. Part B's algorithms inherit the guarantee of whichever kind feeds them.",
  ],
  quiz: [
    {
      id: "b-03-q1",
      prompt:
        "In Game 1, X's move (2,1) was valued −1 while (1,0) was valued 0. What is the single decisive difference between the two branches?",
      options: [
        {
          text: "(1,0) occupies the cell O needs for the middle row, so O's win is gone; (2,1) leaves that cell open, and O takes it",
          correct: true,
          feedback: "Correct — (1,0) is simultaneously a block; (2,1) fills neither key cell, and O's (1,0) reply ends the game in O's favour.",
        },
        {
          text: "(2,1) is closer to the board's edge, so it develops less",
          correct: false,
          feedback: "Board geometry had nothing to do with the verdict — a concrete reply (O completing the middle row) did. Values come from lines of play, not piece placement heuristics.",
        },
        {
          text: "(1,0) creates a new threat for X that (2,1) does not",
          correct: false,
          feedback: "It does not — after (1,0), X's only follow-up value is the draw via the blocked row. The branch's worth comes from denying O, not from creating threats.",
        },
        {
          text: "The values would swap if O moved first instead",
          correct: false,
          feedback: "The position is X to move by construction (equal marks). Hypotheticals aside, the values you were given are facts of THIS position's tree.",
        },
      ],
      explanation:
        "One move, two jobs: filling (1,0) claims a cell and kills O's row simultaneously. Trees price exactly such compound consequences — which is why hand traces beat board-reading intuition.",
    },
    {
      id: "b-03-q2",
      prompt: "Nim heaps (3, 3), you to move, last stick wins. What is your best play?",
      options: [
        {
          text: "There is no winning move — (3, 3) is a P-position; any move hands the opponent an equalizing strategy",
          correct: true,
          feedback: "Correct: `3 ⊕ 3 = 0`. Every move breaks the equality; the opponent mirrors you heap-for-heap and takes the last stick. Best play here means losing as slowly as possible.",
        },
        {
          text: "Take an entire heap, reaching (0, 3) — three sticks is plenty to win with",
          correct: false,
          feedback: "From (0, 3) the opponent simply takes all three. Emptying a heap from an equal position is exactly the mistake the mirror strategy feeds on.",
        },
        {
          text: "Take one stick, reaching (2, 3)",
          correct: false,
          feedback: "(2, 3) has XOR 3 ≠ 0 — you have handed the opponent an N-position, and their restore (to (2, 2)) starts the mirror against you.",
        },
        {
          text: "Take one stick from EACH heap",
          correct: false,
          feedback: "Not a legal nim move — you may take sticks from one heap only per turn.",
        },
      ],
      explanation:
        "Equal heaps are lost for the mover in any two-heap nim; Bouton's law says the same arithmetically: XOR zero. Knowing a position is lost is also knowledge — it tells you to play for the opponent's error.",
    },
    {
      id: "b-03-q3",
      prompt:
        "The depth-2 cutoff on [3, 4, 5, 6] recommended taking the 6 and priced it at +1; the full game's value for that move is +2. What may you conclude?",
      options: [
        {
          text: "The decision was right here but only by fortune of the evaluation function — cutoff values are heuristic estimates, and in other positions the move itself can be wrong",
          correct: true,
          feedback: "Correct — the cutoff agreed with the truth because material is exactly what this game scores. Nothing about depth-2 search guarantees that agreement in general; the horizon is a standing risk.",
        },
        {
          text: "Cutoff search is wrong whenever its value differs from the truth",
          correct: false,
          feedback: "The VALUE differing is expected and mostly harmless; what matters is the decision. Here the decision matched the full-game optimum.",
        },
        {
          text: "The full game is only four plies, so the cutoff could not have been wrong either way",
          correct: false,
          feedback: "Short games can still punish cutoffs — a two-ply window can miss a decisive reply just beyond it. Try the same game with a coin scoring rule the eval does not understand.",
        },
        {
          text: "Minimax with any depth returns exact values, so the +2 must be a computational error",
          correct: false,
          feedback: "Minimax is exact at TERMINALS. At a cutoff, the leaves are evaluations; the +1 is the honest depth-2 answer and the +2 is the honest depth-4 answer.",
        },
      ],
      explanation:
        "Depth buys accuracy, terminals buy certainty. Between them stands the evaluation function — the design problem Lesson b-07 takes up in full.",
    },
  ],
};
