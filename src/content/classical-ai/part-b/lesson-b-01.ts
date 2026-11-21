/**
 * Lesson b-01 "Games, Opponents and Payoffs" — the formalization lesson that
 * opens Part B: what a game IS as a mathematical object, the two axes every
 * game is classified on, and the exact reason Part A's search machinery stops
 * at the board's edge. The two-heap-nim state space is complete: nine states,
 * all eighteen legal moves, every P/N label verified by hand.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_01: ClassicalLesson = {
  slug: "b-01",
  title: "Games, Opponents and Payoffs",
  minutes: 25,
  summary:
    "Tic-tac-toe, nim and chess as formal games: players, moves, terminal payoffs — and why A* has nothing to say here.",
  kind: "concept",
  objectives: [
    "Formalize a two-player game: players, alternating moves, terminal test, utility function",
    "Classify games independently on the two axes: zero-sum vs general-sum, perfect vs imperfect information",
    "Explain precisely why single-agent path search does not transfer to adversarial problems",
    "Read the complete state space of two-heap nim and label every position a win or a loss for the player to move",
  ],
  why: "Everything you have built so far — BFS, A*, the whole Part A toolbox — assumes a world that waits politely while you decide. The moment a second agent moves inside your plan, that assumption is gone: an opponent's move is a transition you do not choose, and any search that pretends otherwise is optimizing a fantasy. This lesson installs the formal machinery that replaces it: games as mathematical objects with players, moves, terminal tests and payoffs, classified on the two axes (zero-sum, perfect information) that determine which algorithm can even be applied — chess, backgammon and poker sit in three different cells and need three different treatments. And because small games can be understood completely, you will solve one — two-heap nim, all nine states of it — down to the last stick. That solved game is a template for everything Part B does next: minimax is just this computation, automated on trees too big to hold in your head.",
  blocks: [
    {
      kind: "text",
      text: "Tic-tac-toe is a child's game, and that is exactly why it belongs in a serious course: it is small enough to understand completely. Two players alternate placing marks; the board fills; someone wins or it draws. There is no randomness, no hidden hand, no partial observability — just you, an opponent, and a tree of possibilities that grows by half-move each turn. Chess and Go are the same story with brutal exponents. This lesson is about what all such games share as *formal objects*, and about the one ingredient that breaks every algorithm you already know: the other player.",
    },
    {
      kind: "definition",
      term: "Game (the classical formalization)",
      informal:
        "A tree-shaped problem with two alternating voices: players take turns choosing moves, the sequence eventually reaches a terminal position, and a payoff number settles the outcome for each player.",
      formal:
        "G = \\langle P, S, \\text{TURN}, \\text{MOVES}, \\text{TERMINAL}, u \\rangle",
      why: "The angle brackets deliberately echo Part A's five-tuple — so that when a piece goes missing (the goal test, the path cost), you will notice exactly which one.",
    },
    { kind: "heading", text: "The formal machinery, part by part" },
    {
      kind: "text",
      text: "Read the tuple one symbol at a time. **P** is the set of players — two of them in everything this part covers. **S** is the set of game states: board positions, heap configurations, whatever the game is *about*. **TURN** says whose choice it is at each state; in the games here the players strictly alternate, which is what makes the picture a *tree* with levels owned by first one voice, then the other. **MOVES** maps a state and a player to the legal actions. **TERMINAL** picks out the states where the game is over — checkmate, a full board, an empty heap. And **u**, the utility or payoff function, scores each terminal *from one fixed player's point of view*: +1 if MAX wins, −1 if MAX loses, 0 for a draw, or whatever scale the game uses. The last point surprises people: there is one utility function, not two. The opponent's payoffs are recovered from it — which is only legal because of the next definition.",
    },
    {
      kind: "definition",
      term: "Zero-sum game",
      informal:
        "A game in which the players' interests are exactly opposed: whatever one gains, the other loses. One utility function then serves both players, with a sign flip.",
      formal:
        "forall s \\in \\text{TERMINAL}: \\ u_1(s) + u_2(s) = 0",
      why: "Zero-sum is what lets minimax alternate max and min over a single u — the opponent minimizing your payoff is automatically maximizing their own.",
    },
    {
      kind: "definition",
      term: "Perfect information",
      informal:
        "Both players see the true state of the game at all times. Chess is perfect-information; poker is not — the hidden cards make each player's view of the state a private matter.",
      formal:
        "I_t(p) = s_t \\text{ for every player } p \\text{ at every turn } t",
      why: "The formalism says each player's information set at turn t contains exactly the true state — one private case of a notion that becomes central when cards are hidden (Lesson b-08).",
    },
    {
      kind: "text",
      text: "Keep the two definitions separate in your mind, because they are *independent axes*, not one property. Chess: zero-sum, perfect information. Backgammon: zero-sum, perfect information — but stochastic, dice move you partly at random. Poker: zero-sum (roughly, in the pot) and *imperfect* information. Rock–paper–scissors: zero-sum, perfect information, and not even an alternating-turn game — the moves are simultaneous, so the tree formalism of this lesson does not apply without repair. Four classics, four different cells of the classification, and — as Part B unfolds — four different algorithms: minimax, expectimax with chance nodes, information-set reasoning, and matrix-game theory beyond this course's scope.",
    },
    { kind: "heading", text: "One objective becomes two" },
    {
      kind: "math",
      title: "The objective shift",
      displays: [
        { expr: "a^* = argmax_{a} \\ u(\\text{RESULT}(s, a))", label: "single agent (Part A)" },
        {
          expr:
            "a^* = argmax_{a} \\ \\min_{o \\in \\text{REPLIES}(s, a)} \\ u(\\text{RESULT}(s, a, o))",
          label: "against an opponent",
        },
      ],
      caption:
        "One extra symbol changes the character of the problem: the min. In Part A you asked which action leads to the best result; now you must ask which action leads to the best result *after the opponent replies as badly for you as they can*. That nested max-min is the entire subject of the next lesson.",
    },
    { kind: "heading", text: "Why A* has nothing to say here" },
    {
      kind: "text",
      text: "It is worth slowing down on the failure, because the reflex to reach for A* runs deep. Three assumptions of path search break at once. **First, the operator assumption:** A* plans a sequence of actions all chosen by you; in a game, every other transition belongs to the opponent, so no sequence of *your* actions determines an outcome — only a strategy that specifies your reply to each of their replies does. **Second, the goal test:** path search seeks a state you can steer to; games end at *terminals* reached jointly, and there is no state you alone can aim at — the win is not a place, it is an outcome of interlocked play. **Third, the path-cost bookkeeping:** f = g + h prices a path, but a game value is not accumulated along a route you control; utilities live at the leaves, and the tree computes them backwards. A heuristic cannot repair this: the heuristic's job is to estimate distance to *your* goal — and there is no goal state here to be near to.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "What Part A quietly assumed",
      text: "Go back to the five-tuple from Lesson a-01 — states, operators, initial state, goal test, path cost — and notice that it had no column for *who acts*. The answer was silently \"you, always.\" Adversarial search is what the five-tuple becomes when that column matters: operators split into yours and theirs, the goal test dissolves into terminals with payoffs, and path cost gives way to a guaranteed *value*. Nothing you learned is wasted — the tree-walking discipline, the complexity accounting, the careful state representation all carry over — but the objective is rebuilt from scratch.",
    },
    { kind: "heading", text: "A whole game under the microscope" },
    {
      kind: "text",
      text: "Nim is the fruit fly of game theory: small enough to dissect completely, deep enough to exhibit the phenomenon that matters. The two-heap version: some sticks lie in two heaps (heap A and heap B); players alternate; on your turn you take *one or more* sticks — all from a *single* heap; whoever takes the very last stick wins. Restrict each heap to at most two sticks and the entire game has nine states, every one drawn below, with every legal move as an edge. A state is written `a,b` — the heap sizes. The labels P and N are the verdicts: **N-positions** are wins for the player *to move*; **P-positions** are losses for the player to move (and therefore wins for the player who just moved).",
    },
    {
      kind: "stateSpace",
      title: "Two-heap nim, at most two sticks per heap — the complete game",
      graph: {
        nodes: [
          { id: "n22", label: "2,2", sub: "P", x: 50, y: 8, tone: "start" },
          { id: "n12", label: "1,2", sub: "N", x: 15, y: 28 },
          { id: "n21", label: "2,1", sub: "N", x: 85, y: 28 },
          { id: "n11", label: "1,1", sub: "P", x: 50, y: 46, tone: "highlight" },
          { id: "n02", label: "0,2", sub: "N", x: 15, y: 52 },
          { id: "n20", label: "2,0", sub: "N", x: 85, y: 52 },
          { id: "n01", label: "0,1", sub: "N", x: 15, y: 76 },
          { id: "n10", label: "1,0", sub: "N", x: 85, y: 76 },
          { id: "n00", label: "0,0", sub: "terminal", x: 50, y: 92, tone: "goal" },
        ],
        edges: [
          { from: "n22", to: "n12", label: "A: take 1" },
          { from: "n22", to: "n02", label: "A: take 2" },
          { from: "n22", to: "n21", label: "B: take 1" },
          { from: "n22", to: "n20", label: "B: take 2" },
          { from: "n12", to: "n02" },
          { from: "n12", to: "n11" },
          { from: "n12", to: "n10" },
          { from: "n21", to: "n20" },
          { from: "n21", to: "n11" },
          { from: "n21", to: "n01" },
          { from: "n02", to: "n01" },
          { from: "n02", to: "n00" },
          { from: "n20", to: "n10" },
          { from: "n20", to: "n00" },
          { from: "n11", to: "n01" },
          { from: "n11", to: "n10" },
          { from: "n01", to: "n00" },
          { from: "n10", to: "n00" },
        ],
        legend: [
          ["start", "the analysis start (2,2)"],
          ["highlight", "P-positions — the player to move loses"],
          ["default", "N-positions — the player to move wins"],
          ["goal", "terminal (0,0): the last stick is gone"],
        ],
        caption:
          "Every edge removes one or two sticks from a single heap — there is no move between the three P-positions, because you cannot shrink both heaps at once. The diagonal is where the mover is lost.",
      },
      solutionNote:
        "A solution is not a path but a strategy: from every N-position, move along an edge to a P-position; from a P-position, no such edge exists. Sticks strictly decrease, so play must reach (0,0) — and the player who keeps handing over P-positions takes the last stick.",
    },
    {
      kind: "text",
      text: "Verify the labels yourself — that is the point of choosing a game this small. From `0,1` or `1,0`, take the last stick and win: N. From `1,1`, either move leaves one stick for the opponent, who takes it: P. From `1,2`, the mover can reduce the 2-heap to a 1 — handing over `1,1`: N. And from `2,2`, *every* move — try all four — hands the opponent an N-position with you to move next: P. The pattern on the diagonal is not a coincidence: the P-positions are exactly the states whose heap sizes have bitwise XOR zero (`0⊕0`, `1⊕1`, `2⊕2`). Lesson b-03 proves that characterization for any number of heaps; here it is enough to have *derived every label from the rules*, which is precisely the computation minimax will automate on trees too big to hold in your head.",
    },
    {
      kind: "example",
      title: "Playing out (2,2): the mirror strategy",
      problem:
        "You must move first at (2,2) — two sticks in each heap, last stick wins. Show that you lose against perfect play, and exactly why.",
      steps: [
        {
          text: "List your four options: reduce heap A to 1 or 0, or heap B to 1 or 0.",
          detail: "The moves lead to (1,2), (0,2), (2,1), (2,0) — every one an N-position, and all four hand the move to the opponent from a winning-for-them square.",
        },
        {
          text: "Say you take one from A: (1,2). The opponent replies by taking one from B, handing you (1,1).",
          detail: "This is the mirror: whatever you take from one heap, the opponent matches on the other, restoring equal heaps — always a P-position for you.",
        },
        {
          text: "From (1,1) you must leave (0,1) or (1,0); the opponent takes the last stick and wins.",
          detail: "The game is finite — each move removes at least one stick — so the mirroring cannot go on forever; it ends with the opponent's hand on the final stick.",
        },
        {
          text: "Conclusion: (2,2) is a loss for the mover — 0 under a win/loss scoring, or −1 from your point of view.",
          detail: "Nothing about your play was wrong. Some positions are simply lost with the move, which is why game programs care about *guarantees* rather than hopes.",
        },
      ],
      result:
        "Second player wins from (2,2) by mirroring: keep the heaps equal after each of the opponent's moves. The first player's fate was decided by the position, not by effort.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-01-e1",
      exerciseKind: "concept-check",
      prompt:
        "Classify the four classics on the two axes of this lesson. Which statement is TRUE?",
      options: [
        {
          text: "Chess is zero-sum with perfect information; backgammon is too, plus chance; poker hides cards; rock–paper–scissors is simultaneous, so it falls outside this lesson's alternating-turn formalization",
          correct: true,
          feedback: "Correct — and each difference forces different machinery: minimax for chess, chance nodes for backgammon (b-08), information sets for poker, and matrix games for simultaneous moves.",
        },
        {
          text: "Chess is imperfect information, because you cannot read your opponent's intentions",
          correct: false,
          feedback: "Information in this formalism is about the STATE of the game, not about the opponent's mind. The board is fully visible to both players — that is perfect information.",
        },
        {
          text: "Backgammon is perfect information and deterministic",
          correct: false,
          feedback: "The board is fully visible (perfect information), but the dice make the game stochastic — determinism is a third property, and backgammon fails it.",
        },
        {
          text: "Poker is a perfect-information game because all cards are revealed at showdown",
          correct: false,
          feedback: "Information is judged during play, when bets are made. Hidden hole cards make each player's information set a proper set of possible states — the defining failure of perfect information.",
        },
      ],
      solution:
        "Chess: zero-sum, perfect information. Backgammon: zero-sum, perfect information, stochastic. Poker: (potentially) zero-sum, imperfect information. Rock–paper–scissors: zero-sum, simultaneous — no alternating turn function TURN, so the tree of this lesson does not directly apply.",
      explanation:
        "The two axes — whose interests (zero-sum or not) and who knows what (perfect information or not) — are independent, and the stochastic/simultaneous distinctions add two more. Classify before you choose an algorithm; nearly every wrong choice in game programming traces to a misclassification like one of these.",
      concepts: ["zero-sum game", "perfect information"],
    },
    {
      kind: "exercise",
      id: "b-01-e2",
      exerciseKind: "trace",
      prompt:
        "Two-heap nim, position (2,1) — two sticks in heap A, one in heap B — you move first, last stick wins. (a) Find a winning first move, and describe your guarantee afterwards. (b) Verify that each of your other two legal first moves loses to the correct opponent reply.",
      solution:
        "(a) Take one stick from heap A, moving to (1,1) — a P-position for the opponent. Your guarantee: whatever they do (leaving (0,1) or (1,0)), you take the last stick and win. (b) The alternative moves: take two from A → (0,1), and the opponent simply takes the last stick; take one from B → (2,0), and the opponent takes both remaining. Every non-(1,1) move hands the opponent an N-position with you to move next — exactly the (2,2) situation from the worked example.",
      explanation:
        "This is the whole theory in miniature: a winning strategy is a move to a P-position, plus the discipline to keep returning one after every opponent reply. Minimax (next lesson) finds such moves by computation; here you found it by reading the diagram.",
      concepts: ["payoff", "strategy", "P-position"],
    },
  ],
  terms: [
    {
      term: "zero-sum game",
      definition: "A game whose players' terminal payoffs sum to a constant (conventionally zero), so one utility function serves both players with a sign flip.",
    },
    {
      term: "perfect information",
      definition: "The property that every player observes the true game state at every turn; hidden cards or simultaneous moves break it.",
    },
    {
      term: "payoff",
      definition: "The utility of a terminal position for a given player — in this course always written from MAX's point of view, so the opponent's payoff is its negation in zero-sum games.",
    },
    {
      term: "P-position",
      definition: "A position where the player to move loses under perfect play (a Previous-player win); its opposite, an N-position, is a win for the player to move (a Next-player win).",
    },
  ],
  mistakes: [
    {
      mistake: "Planning both sides of the game as if you chose both (max-max search).",
      why: "It feels productive to trace your best line and assume the opponent cooperates — the 14-leaf fallacy of the next lesson, in embryo. The resulting evaluation is fiction.",
      fix: "Mark the owner of every tree level before evaluating anything. If the level is the opponent's, their choice, not yours, decides which child matters.",
    },
    {
      mistake: "Carrying the goal-test habit from path search into games.",
      why: "There is no state you can steer to that says 'won' — terminals are reached through the opponent's moves too, so a goal test over states has nothing to test.",
      fix: "Replace 'goal state' with 'terminal + payoff': the search returns a move and a guaranteed value, computed backwards from leaf utilities.",
    },
    {
      mistake: "Treating zero-sum and perfect information as one property.",
      why: "They are orthogonal axes: backgammon is perfect-information but stochastic; poker is zero-sum but imperfect-information. Confusing them selects the wrong algorithm — minimax where chance nodes are needed, or vice versa.",
      fix: "Classify every game on both axes (plus deterministic vs stochastic) before reaching for any algorithm from Part B.",
    },
  ],
  takeaways: [
    "A game is ⟨players, states, turn, moves, terminals, utility⟩ — and the utility is written from ONE player's point of view, which only zero-sum makes legal.",
    "Zero-sum and perfect information are independent axes; chess, backgammon, poker and rock–paper–scissors occupy four different cells and need different machinery.",
    "Single-agent search breaks because the opponent moves inside your operator sequence; the honest objective becomes argmax over your move of the min over their replies — minimax in one line.",
    "Two-heap nim is solvable by hand: the losing positions are exactly the equal-heap states (XOR zero), and the winning strategy is to hand your opponent a P-position after every move.",
  ],
  quiz: [
    {
      id: "b-01-q1",
      prompt:
        "Backgammon: both players see the whole board, but moves are driven by dice. Classify it precisely.",
      options: [
        {
          text: "Zero-sum and perfect-information, but stochastic — it needs chance nodes alongside min and max",
          correct: true,
          feedback: "Correct. Visibility is perfect, interests are opposed, but transition probabilities replace the opponent's (and your) certainty — expectimax with chance nodes, Lesson b-08.",
        },
        {
          text: "Imperfect information, because the dice are unknown before rolling",
          correct: false,
          feedback: "Randomness is not hiddenness. Imperfect information means some player cannot see the true state; in backgammon both can, at all times.",
        },
        {
          text: "Not zero-sum, because both players can win points",
          correct: false,
          feedback: "The doubling cube aside, backgammon payoffs are strictly opposed — the classic zero-sum setting.",
        },
        {
          text: "Equivalent to chess for search purposes, since both are two-player board games",
          correct: false,
          feedback: "The dice change the recurrence: minimax's guarantees rely on every transition being chosen by a player.",
        },
      ],
      explanation:
        "Two independent axes plus stochasticity: backgammon sits at zero-sum, perfect information, chance-driven — one axis away from chess, one from poker.",
    },
    {
      id: "b-01-q2",
      prompt:
        "Two-heap nim from (2,2), you to move, last stick wins, perfect play on both sides. What is the outcome?",
      options: [
        {
          text: "You lose: every legal move hands the opponent an N-position, and perfect mirroring carries them to the last stick",
          correct: true,
          feedback: "Correct — (2,2) is a P-position. All four moves lead to (1,2), (0,2), (2,1) or (2,0), each a win for whoever is about to move — your opponent.",
        },
        {
          text: "You win by taking an entire heap, reaching (0,2)",
          correct: false,
          feedback: "From (0,2) the opponent takes both remaining sticks and wins. Emptying one heap is precisely what the mirror strategy wants you to do.",
        },
        {
          text: "You win by levelling to (1,1)",
          correct: false,
          feedback: "There is no such move: a nim move takes sticks from ONE heap, and (2,2) → (1,1) would shrink both. Only the opponent can put you at (1,1).",
        },
        {
          text: "The outcome depends on how well each player concentrates",
          correct: false,
          feedback: "Under the perfect-play assumption of this whole part, the outcome is a property of the position, full stop — that determinism is the point of the theory.",
        },
      ],
      explanation:
        "P-positions are lost for the mover by derivation, not by psychology. The nine-state diagram is small enough that you checked every move — that check IS the minimax computation.",
    },
    {
      id: "b-01-q3",
      prompt: "Which of these is the sharpest reason A* does not apply to chess?",
      options: [
        {
          text: "The opponent's replies are transitions you do not choose, so no sequence of your own actions determines an outcome — the objective must be a guaranteed value over a strategy, not an optimal path",
          correct: true,
          feedback: "Correct — and the value-based objective is exactly what the argmax–min display formalizes, and what minimax computes.",
        },
        {
          text: "Chess boards are too large to store in a hash table",
          correct: false,
          feedback: "A practical difficulty, not a conceptual one — endgame databases and clever encodings exist. The failure of A* is about the objective, not memory.",
        },
        {
          text: "Chess has no goal test because checkmate is hard to detect",
          correct: false,
          feedback: "Checkmate is perfectly detectable. The issue is that reaching it is not a goal you steer to alone — the opponent moves inside every plan.",
        },
        {
          text: "No admissible heuristic for chess is known",
          correct: false,
          feedback: "Heuristics for chess abound; what is missing is the thing a heuristic estimates — a distance to a goal state you control. A* needs a different problem shape, not a better h.",
        },
      ],
      explanation:
        "A*'s machinery prices paths you choose end-to-end. Games interleave choices, so the plan is a strategy (a reply for every contingency) and the search returns its guaranteed value.",
    },
  ],
};
