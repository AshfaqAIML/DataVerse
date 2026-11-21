/**
 * Lesson b-04 "Implementing Minimax" — two verified implementations: the toy
 * tree from b-02 (13 nodes, confirming that lesson's counting exercise) and a
 * tic-tac-toe endgame solver whose per-move values (+1 / 0 / −1) reproduce
 * b-03's hand trace exactly. Full-board numbers measured by the same program:
 * 549,946 calls, 255,168 terminals scored, value 0; 5,478 distinct reachable
 * positions (counted by a variant run) explain the ~100x revisitation.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_04: ClassicalLesson = {
  slug: "b-04",
  title: "Implementing Minimax",
  minutes: 35,
  summary:
    "A clean recursive minimax in Python, first on a toy game, then tic-tac-toe endgames, with a node counter.",
  kind: "coding",
  objectives: [
    "Implement the minimax recurrence as a recursive Python function over game trees",
    "Count nodes honestly: every call, leaves included, and read what the counter says about the algorithm's cost",
    "Build a solver for a real game: board representation, utility function, terminal test, move generation with generate-and-undo backtracking",
    "Explain the O(b^m) time / O(m) space asymmetry and why memoization attacks the first but not the second kind of waste",
  ],
  why: "Tracing by hand builds judgment; implementing builds belief. When you write the recurrence yourself — fifteen lines, no library, no magic — three things click that reading never achieves. First, the code IS the mathematics: the max/min alternation you learned as a derivation becomes two branches of an if-statement, and you stop fearing it. Second, a node counter turns abstract complexity into a number you produced: you will watch the same fifteen lines make thirteen calls on a toy tree and half a million on tic-tac-toe, and the exponent stops being notation. Third, the habits of real game programming — mutate-and-undo, a utility function written from one player's point of view, a terminal test checked before anything else — are exactly the habits every later engine in this course assumes. By the end, the program will re-derive Lesson b-03's hand trace, value for value, and you will know both were right.",
  blocks: [
    {
      kind: "text",
      text: "The plan is two programs of increasing realism. The first solves the toy tree from Lesson b-02 — three MAX moves, three MIN replies each — and its output will settle that lesson's counting exercise with a number. The second solves an actual board game: the tic-tac-toe endgame you traced by hand in b-03, where the tree is not given to you as data but must be *generated* from the rules. Both carry a node counter, because a minimax implementation you cannot measure is a minimax implementation you cannot trust — or improve, which is exactly what Lesson b-05 will do to these same programs.",
    },
    { kind: "heading", text: "Program 1 — the toy tree, machine-traced" },
    {
      kind: "pythonImpl",
      title: "Recursive minimax with a node counter",
      intent:
        "Evaluate the b-02 game tree by machine, printing each move's value, the root's value, the chosen move, and the total number of nodes visited.",
      code: `def leaf(v):
    return {"kind": "leaf", "value": v}


def max_node(*children):
    return {"kind": "max", "children": list(children)}


def min_node(*children):
    return {"kind": "min", "children": list(children)}


TREE = max_node(
    min_node(leaf(3), leaf(12), leaf(8)),
    min_node(leaf(2), leaf(4), leaf(6)),
    min_node(leaf(14), leaf(5), leaf(2)),
)

calls = 0


def minimax_with_children(node):
    """Value of node plus each child's value, in one traversal."""
    global calls
    calls += 1
    if node["kind"] == "leaf":
        return node["value"], []
    child_values = [minimax_with_children(c)[0] for c in node["children"]]
    value = max(child_values) if node["kind"] == "max" else min(child_values)
    return value, child_values


value, child_values = minimax_with_children(TREE)
best = child_values.index(value)
print("child values:", child_values)
print("root value:", value)
print("best move: a" + str(best + 1))
print("nodes visited:", calls)`,
      output: `child values: [3, 2, 2]
root value: 3
best move: a1
nodes visited: 13`,
      walkthrough: [
        "Nodes are plain dictionaries: a `kind` tag plus either a `value` (leaves) or `children` (max/min nodes) — the whole game-tree data model in three constructor functions.",
        "`calls` increments on EVERY call, leaves included — the same convention Lesson b-02's exercise used to predict 13, and the machine agrees: 1 root + 3 MIN + 9 leaves.",
        "The recursion is the recurrence: leaves return their utility; interior nodes map the function over children, then reduce with `max` or `min` according to whose level it is.",
        "`minimax_with_children` returns a pair — the value AND each child's value — so one traversal both prices the root and identifies the best move, without re-searching.",
        "The output names move a1 at value 3: exactly the conclusion the hand trace reached in b-02, including the ignored 14 (the middle leaf of a3 — never a minimum, never load-bearing).",
      ],
    },
    {
      kind: "text",
      text: "Thirteen calls for thirteen nodes: plain minimax visits every node exactly once — it has no mechanism to skip anything. Hold that thought as a *baseline*; the entire point of Lesson b-05 is that some of those calls are provably unnecessary, and the counter is how you will measure the savings.",
    },
    { kind: "heading", text: "Program 2 — a real game: tic-tac-toe endgame" },
    {
      kind: "text",
      text: "The toy tree handed us the search tree as data. A real game gives you *rules* and expects you to grow the tree yourself. The design has four moving parts, and each maps to a piece of the formalization from b-01: the **board** (a list of three rows, `'X'`, `'O'` or `'.'`) is the state; `winner` plus a full-board check is the **terminal test**; `utility` is the **payoff function**, written from X's point of view (+1 / 0 / −1) exactly as the zero-sum convention prescribes; and move generation is the **operator** — try each empty cell, recurse, then *undo* the move so the next trial starts from the same position. This mutate-and-undo discipline (backtracking) means the program carries ONE board, not a copy per branch.",
    },
    {
      kind: "pythonImpl",
      title: "A tic-tac-toe endgame solver",
      intent:
        "Solve the b-03 endgame — X to move on `X·X / ·OO / O·X` — printing the position's value, each move's value, the best move, and node counts.",
      code: `LINES = [
    ((0, 0), (0, 1), (0, 2)), ((1, 0), (1, 1), (1, 2)), ((2, 0), (2, 1), (2, 2)),
    ((0, 0), (1, 0), (2, 0)), ((0, 1), (1, 1), (2, 1)), ((0, 2), (1, 2), (2, 2)),
    ((0, 0), (1, 1), (2, 2)), ((0, 2), (1, 1), (2, 0)),
]

calls = 0


def winner(board):
    for a, b, c in LINES:
        if board[a[0]][a[1]] != "." and board[a[0]][a[1]] == board[b[0]][b[1]] == board[c[0]][c[1]]:
            return board[a[0]][a[1]]
    return None


def utility(board):
    """+1 X wins, -1 O wins, 0 draw, None if the game is not over."""
    w = winner(board)
    if w == "X":
        return 1
    if w == "O":
        return -1
    if all("." not in row for row in board):
        return 0
    return None


def minimax_board(board, x_to_move):
    """Value of the position for X; mutates and restores the board."""
    global calls
    calls += 1
    u = utility(board)
    if u is not None:
        return u
    scores = []
    for r in range(3):
        for c in range(3):
            if board[r][c] == ".":
                board[r][c] = "X" if x_to_move else "O"
                scores.append(minimax_board(board, not x_to_move))
                board[r][c] = "."
    return max(scores) if x_to_move else min(scores)


BOARD = [["X", ".", "X"], [".", "O", "O"], ["O", ".", "X"]]

value = minimax_board(BOARD, True)
print("value for X:", value, "(" + str(calls) + " nodes)")

results = []
for r in range(3):
    for c in range(3):
        if BOARD[r][c] == ".":
            BOARD[r][c] = "X"
            results.append(((r, c), minimax_board(BOARD, False)))
            BOARD[r][c] = "."
for (r, c), v in results:
    print("move (" + str(r) + ", " + str(c) + ") -> value", v)
best_rc, best_v = max(results, key=lambda t: t[1])
print("best move: (" + str(best_rc[0]) + ", " + str(best_rc[1]) + ")")
print("total nodes:", calls)`,
      output: `value for X: 1 (11 nodes)
move (0, 1) -> value 1
move (1, 0) -> value 0
move (2, 1) -> value -1
best move: (0, 1)
total nodes: 21`,
      walkthrough: [
        "`utility` is checked FIRST, before any move generation: terminals return immediately, which is why the winning move's subtree is a single call — the game is over, there is nothing to search.",
        "Move generation loops row-major over empty cells: place `'X'` or `'O'`, recurse with the turn flipped, then restore `'.'` — one shared board, every trial starting from the identical parent position.",
        "The recurrence closes over the board: MAX's levels take `max(scores)`, MIN's take `min(scores)`, and `x_to_move` — not the tree's shape — decides whose voice the node is.",
        "Read the output against Lesson b-03: moves (0,1), (1,0), (2,1) are worth +1, 0, −1 — the hand trace, reproduced by machine, every value agreeing.",
        "The counts: the root traversal visits 11 nodes (fewer than the toy tree's 13 because three of its branches end at terminals early); the second pass — pricing each move separately for the printout — adds 10 more, 21 in total. Measure, don't guess: the earlier prediction of 'about 12' for this traversal was itself wrong until run.",
      ],
      project: "The Part B project instruments exactly this solver shape with node counters — your benchmark harness will grow from these fifteen lines.",
    },
    {
      kind: "complexity",
      title: "What the recurrence costs",
      rows: [
        {
          algorithm: "Minimax (full tree)",
          best: "O(b^m)",
          average: "O(b^m)",
          worst: "O(b^m)",
          space: "O(m)",
          note: "b = branching factor, m = maximum depth. Every leaf is visited — there is no early exit but a terminal.",
          highlight: true,
        },
        {
          algorithm: "Minimax + transposition table",
          best: "O(|S|)",
          average: "O(|S|)",
          worst: "O(|S|·b)",
          space: "O(|S|)",
          note: "|S| = distinct reachable positions. Tic-tac-toe has 5,478 of them; the plain tree walks 549,946 nodes — roughly a hundredfold revisitation that memoization erases.",
        },
        {
          algorithm: "Alpha-beta (next lesson)",
          best: "O(b^(m/2))",
          average: "O(b^(3m/4))",
          worst: "O(b^m)",
          space: "O(m)",
          note: "Same value, same move — provably — with whole subtiles skipped when the ordering cooperates.",
        },
      ],
      reading:
        "Time is exponential in depth no matter what; space is only linear — the recursion holds one path, mutating and restoring a single board. Memoization and pruning attack different waste: revisited states and irrelevant states. They compose.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The empty board, actually measured",
      text: "Run the same solver from an empty board and it proves tic-tac-toe is a draw (value 0) after **549,946 calls, scoring 255,168 terminal positions** — every complete game the rules allow, counted by a program you can read. A variant run that collects distinct boards instead of counting calls finds **5,478 reachable positions**: the half-million-node tree revisits each about a hundred times, which is the transposition table's whole sales pitch. Numbers this size are why b = 3, m = 9 exhausts nothing while b = 35, m = 80 (chess) is beyond every computer ever built — the exponent is the story.",
    },
    { kind: "heading", text: "Take the wheel" },
    {
      kind: "tryIt",
      title: "Solve a different endgame",
      task: `Run the program below on the board \`XO· / XO· / ··X\` — X to move. Predict the value and the best move FIRST (look for what X threatens in column 0, and what O threatens in column 1), then run and check yourself against the four move-values. When you are satisfied, edit the board to any legal position of your own — as many X as O, X to move — and solve it.`,
      code: `LINES = [
    ((0, 0), (0, 1), (0, 2)), ((1, 0), (1, 1), (1, 2)), ((2, 0), (2, 1), (2, 2)),
    ((0, 0), (1, 0), (2, 0)), ((0, 1), (1, 1), (2, 1)), ((0, 2), (1, 2), (2, 2)),
    ((0, 0), (1, 1), (2, 2)), ((0, 2), (1, 1), (2, 0)),
]

calls = 0


def winner(board):
    for a, b, c in LINES:
        if board[a[0]][a[1]] != "." and board[a[0]][a[1]] == board[b[0]][b[1]] == board[c[0]][c[1]]:
            return board[a[0]][a[1]]
    return None


def utility(board):
    w = winner(board)
    if w == "X":
        return 1
    if w == "O":
        return -1
    if all("." not in row for row in board):
        return 0
    return None


def minimax_board(board, x_to_move):
    global calls
    calls += 1
    u = utility(board)
    if u is not None:
        return u
    scores = []
    for r in range(3):
        for c in range(3):
            if board[r][c] == ".":
                board[r][c] = "X" if x_to_move else "O"
                scores.append(minimax_board(board, not x_to_move))
                board[r][c] = "."
    return max(scores) if x_to_move else min(scores)


BOARD = [["X", "O", "."], ["X", "O", "."], [".", ".", "X"]]

value = minimax_board(BOARD, True)
print("value for X:", value, "(" + str(calls) + " nodes)")

results = []
for r in range(3):
    for c in range(3):
        if BOARD[r][c] == ".":
            BOARD[r][c] = "X"
            results.append(((r, c), minimax_board(BOARD, False)))
            BOARD[r][c] = "."
for (r, c), v in results:
    print("move (" + str(r) + ", " + str(c) + ") -> value", v)
best_rc, best_v = max(results, key=lambda t: t[1])
print("best move: (" + str(best_rc[0]) + ", " + str(best_rc[1]) + ")")
print("total nodes:", calls)`,
      hint: "X threatens (2,0) to complete column 0; O threatens (2,1) to complete column 1 — and it is X's move. The solver needs 36 nodes for the root traversal, 71 in total, and one move wins immediately.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-04-e1",
      exerciseKind: "predict-output",
      prompt: `Run this lesson's \`minimax_with_children\` (unchanged, counter included) on a new tree, built with the same constructors:

\`\`\`
TREE = max_node(
    min_node(leaf(5), leaf(7), max_node(leaf(2), leaf(9))),
    min_node(leaf(6), leaf(1)),
)
\`\`\`

Predict the exact four lines the program prints. Watch the nesting: this tree has a MAX node INSIDE a MIN node, and the counter counts every call.`,
      expectedOutput: `child values: [5, 1]
root value: 5
best move: a1
nodes visited: 10`,
      solution: `Branch a1: the inner MAX takes max(2, 9) = 9, then the MIN above it takes min(5, 7, 9) = 5. Branch a2: min(6, 1) = 1. Root: max(5, 1) = 5, move a1. Node count: 1 root + 2 MIN nodes + 5 leaves + 1 inner MAX = 10 calls.`,
      explanation:
        "Alternation is structural, not lexical: the inner MAX sits BELOW a MIN, so it computes first (max(2,9)=9) and then has no vote — 9 is offered to a MIN, which declines it in favour of 5. And the counter is position-blind: ten nodes exist, ten calls happen, whatever their kinds.",
      concepts: ["recursion", "backed-up values", "node counting"],
    },
    {
      kind: "exercise",
      id: "b-04-e2",
      exerciseKind: "write-code",
      prompt: `Using the same helpers (\`leaf\`, \`max_node\`, \`min_node\`, and a fresh \`calls = 0\`), build this tree:

\`\`\`
TREE = max_node(
    min_node(leaf(4), leaf(9)),
    min_node(leaf(3), leaf(6), leaf(2)),
)
\`\`\`

Write the three-line driver that prints the root's value, the best move (\`a1\`/\`a2\`), and the number of nodes visited — one traversal, no re-searching (the pattern is \`minimax_with_children\` from Program 1). Your program must print exactly three lines, in this order: the value, the move, the count.`,
      starter: `def leaf(v):
    return {"kind": "leaf", "value": v}


def max_node(*children):
    return {"kind": "max", "children": list(children)}


def min_node(*children):
    return {"kind": "min", "children": list(children)}


TREE = max_node(
    min_node(leaf(4), leaf(9)),
    min_node(leaf(3), leaf(6), leaf(2)),
)

calls = 0

# TODO: define the traversal (value + child values in ONE pass), then print
# exactly three lines: root value, best move, nodes visited.`,
      expectedOutput: `root value: 4
best move: a1
nodes visited: 8`,
      solution: `def leaf(v):
    return {"kind": "leaf", "value": v}


def max_node(*children):
    return {"kind": "max", "children": list(children)}


def min_node(*children):
    return {"kind": "min", "children": list(children)}


TREE = max_node(
    min_node(leaf(4), leaf(9)),
    min_node(leaf(3), leaf(6), leaf(2)),
)

calls = 0


def minimax_with_children(node):
    global calls
    calls += 1
    if node["kind"] == "leaf":
        return node["value"], []
    child_values = [minimax_with_children(c)[0] for c in node["children"]]
    value = max(child_values) if node["kind"] == "max" else min(child_values)
    return value, child_values


value, child_values = minimax_with_children(TREE)
best = child_values.index(value)
print("root value:", value)
print("best move: a" + str(best + 1))
print("nodes visited:", calls)`,
      explanation:
        "min(4,9)=4 and min(3,6,2)=2, so the root takes max(4,2)=4 via a1. Eight nodes: 1 root + 2 MIN + 5 leaves — and because the traversal returns child values alongside the root's, the move falls out of ONE pass instead of re-searching every branch.",
      concepts: ["recursion", "node counting"],
    },
    {
      kind: "exercise",
      id: "b-04-e3",
      exerciseKind: "concept-check",
      prompt:
        "Inside `minimax_board`, right after the recursive call, the program executes `board[r][c] = '.'`. Why is that line load-bearing?",
      options: [
        {
          text: "It restores the shared board so the NEXT candidate move is tried from the same position — without it, earlier moves would still be on the board when later branches are explored",
          correct: true,
          feedback: "Correct. The function owns ONE board and simulates whole subtrees by mutation; undoing each move on the way out is what keeps every sibling branch's starting position correct.",
        },
        {
          text: "It frees memory — Python deletes board cells when they are reset to '.'",
          correct: false,
          feedback: "Resetting a cell changes a value; it frees nothing. The memory story is the opposite of the point: one shared board is the memory SAVING.",
        },
        {
          text: "It is required for the utility function to see the current player",
          correct: false,
          feedback: "The player on move is carried by the `x_to_move` parameter, not by the board contents.",
        },
        {
          text: "It prevents the terminal test from ever returning a draw",
          correct: false,
          feedback: "Draws are detected by the full-board check inside `utility`, which runs on boards where undone moves have left real marks — exactly as intended.",
        },
      ],
      solution:
        "Mutate-and-undo backtracking: each candidate move is placed, explored, and removed, so all siblings of a node are generated from the identical parent position on one shared board.",
      explanation:
        "This discipline scales to every search in the course — CSP backtracking (Part C) and planning (Part E) live by the same place/recur/undo rhythm. Internalize it here, where the board is small enough to watch.",
      concepts: ["backtracking", "state representation"],
    },
  ],
  terms: [
    {
      term: "recursion",
      definition: "A function defined in terms of itself on smaller inputs; minimax is the game-tree recurrence turned directly into a recursive function.",
    },
    {
      term: "utility function",
      definition: "The payoff oracle mapping terminal positions to numbers from one fixed player's point of view (+1 / 0 / −1 in our tic-tac-toe).",
    },
    {
      term: "terminal test",
      definition: "The check — run before any move generation — deciding whether a position ends the game, so utilities can be returned without searching further.",
    },
    {
      term: "mutate-and-undo (backtracking)",
      definition: "Exploring by placing a tentative change, recursing, then removing it, so many branches share one state object without copying it.",
    },
  ],
  mistakes: [
    {
      mistake: "Generating moves without undoing them — later branches inherit earlier trial moves.",
      why: "The first sibling's marks stay on the board; the second sibling's subtree is explored from a corrupted position, and values become plausible-looking nonsense.",
      fix: "Pair every mutation with its undo in the same loop body, immediately after the recursive call returns. The place/recur/undo triple should be reflexive.",
    },
    {
      mistake: "Testing for wins AFTER generating children, or only checking a full board.",
      why: "The terminal test must run on entry — a won position's value is its utility, and generating its children both wastes work and can mis-score (a full board check alone misses wins that happen before the board fills).",
      fix: "First line of the recursion: check the terminal test, return the utility if it fires. Move generation begins only for non-terminal positions.",
    },
    {
      mistake: "Writing two utilities (one per player) and mixing them up in the recursion.",
      why: "Two sign conventions in one tree is one too many — a MIN node backed from the wrong function silently optimizes for the opponent's opponent.",
      fix: "One utility, from MAX's point of view, everywhere. The min/max of the recurrence handles the perspective flip; the data never does.",
    },
  ],
  takeaways: [
    "The recurrence compiles to about fifteen lines: leaves return utilities, interior nodes reduce children with max or min by whose turn it is.",
    "A node counter is not decoration — it is the instrument that turned b=3, m=9 into a measured 549,946 calls and 255,168 scored terminals (value 0: tic-tac-toe is a draw, proved).",
    "Mutate-and-undo lets one board carry the whole search: place, recurse, restore — the same discipline CSP and planning search will use.",
    "Time O(b^m) is the exponent's tyranny; space O(m) is the recursion's mercy. Memoization erases revisits (5,478 distinct positions), pruning erases irrelevant branches — the next lesson.",
  ],
  quiz: [
    {
      id: "b-04-q1",
      prompt:
        "The root traversal of the endgame solver visited 11 nodes while the toy-tree program visited 13 — yet the endgame has more game content. What explains the difference?",
      options: [
        {
          text: "The board game's branches end at terminals: won positions return a utility immediately, so subtrees that the toy tree must fully expand collapse to a single call",
          correct: true,
          feedback: "Correct — the terminal test prunes by game logic, not by algorithm: three of the endgame's branches end early (one immediate win, two short defenses), so eleven calls suffice.",
        },
        {
          text: "Tic-tac-toe boards are cheaper to copy than dictionary nodes",
          correct: false,
          feedback: "Nothing is copied — both programs share one structure via mutation. And cost per node has nothing to do with the count.",
        },
        {
          text: "The endgame program is memoizing results without telling us",
          correct: false,
          feedback: "No table anywhere — the count would be far lower than 11 if it were. Every call corresponds to exactly one node of the explored tree.",
        },
        {
          text: "The toy tree's counter includes the root while the solver's does not",
          correct: false,
          feedback: "Both counters increment on every call, root included. Compare the conventions in the two programs — they are deliberately identical.",
        },
      ],
      explanation:
        "Node counts measure TREES, not games: whoever's tree has more early terminals makes fewer calls. It is the first hint of the next lesson — skipping work legitimately.",
    },
    {
      id: "b-04-q2",
      prompt:
        "Minimax's space complexity is O(m) — linear in maximum depth — rather than proportional to the tree. Why?",
      options: [
        {
          text: "The recursion holds one root-to-current path at a time: siblings' subtrees are explored sequentially, and mutate-and-undo means the board itself is shared, not copied",
          correct: true,
          feedback: "Correct — depth-first exploration keeps exactly one path live (m frames, one board), while breadth-first alternatives would hold the whole frontier.",
        },
        {
          text: "Because Python's recursion limit caps the tree size",
          correct: false,
          feedback: "The interpreter limit is an accident of implementation, not a property of the algorithm — and it caps DEPTH, exactly the thing the O(m) already counts.",
        },
        {
          text: "Because utilities are small numbers that compress well",
          correct: false,
          feedback: "Value storage is not the cost driver; the frames and the board are. A game scored in floats has the same space profile.",
        },
        {
          text: "It isn't — with memoization the space is O(|S|), so O(m) is wrong",
          correct: false,
          feedback: "Plain minimax is O(m); the transposition table trades space for time (O(|S|)) as the complexity block showed. Both statements are true, for different programs.",
        },
      ],
      explanation:
        "One live path plus one shared board: the memory profile is why game programs could run minimax on 1960s hardware — time was the wall, never space.",
    },
    {
      id: "b-04-q3",
      prompt:
        "Your solver prints `move (2, 1) -> value -1` for the endgame. A friend insists the program has a bug because 'minimax never loses on purpose.' What is actually true?",
      options: [
        {
          text: "No bug: (2,1) is a legal move whose BEST play value is −1 — the number prices the position after the move, and the root correctly declines it in favour of (0,1) at +1",
          correct: true,
          feedback: "Correct. A move's value says what the position is WORTH once played (with both sides playing on optimally); pricing a losing move at −1 is exactly what lets the root recognize and reject it.",
        },
        {
          text: "The friend is right — the recursion should never propagate a negative utility",
          correct: false,
          feedback: "Negative values are the point of the exercise: they mark moves that hand the game to O. Suppressing them would hide the information the root chooses by.",
        },
        {
          text: "The bug is in `utility`: draws should also score −1 for consistency",
          correct: false,
          feedback: "The +1/0/−1 convention is complete and consistent — X's win, nobody's, X's loss. Changing it would flip the meaning of every comparison.",
        },
        {
          text: "The MIN node is mislabeled and should be MAX, since X made the move",
          correct: false,
          feedback: "After X's move it is O's turn — the level below the move is a MIN level, and its min(0, −1) = −1 is O choosing the win.",
        },
      ],
      explanation:
        "Minimax prices ALL options, including the bad ones — that is how it chooses. The −1 is not the program losing; it is the program *seeing*.",
    },
  ],
};
