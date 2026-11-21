/**
 * PART_B_ASSESSMENT — the Part B checkpoint. Moved verbatim from index.ts.
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_B_ASSESSMENT: QuizQuestion[] = [
  {
    id: "b-as-1",
    prompt: "The essential difference between a game tree and a search tree from Part A is:",
    options: [
      { text: "Game trees are binary; search trees are not", correct: false, feedback: "Branching is unrelated — both can be any shape." },
      { text: "In a game tree, some moves belong to an agent minimizing your value", correct: true, feedback: "Correct — alternating MAX/MIN levels are the definition; every Part A algorithm assumes a single controlling agent." },
      { text: "Game trees have no costs on their edges", correct: false, feedback: "Utilities live at leaves, but nothing forbids costs; the structural point is adversarial control, not edge labels." },
      { text: "Game trees are always finite", correct: false, feedback: "They are usually unmanageably infinite without cutoffs — the opposite." },
    ],
    explanation: "Adversarial control is the dividing line: minimax, alpha-beta and expectimax all exist because of it.",
  },
  {
    id: "b-as-2",
    prompt: "Minimax on the traced tree (leaves 3,12,8 / 2,4,6 / 14,5,2) plays a1 with value 3. One leaf changes: the 8 becomes 80. The move and value:",
    options: [
      { text: "Still a1 with value 3", correct: true, feedback: "Correct — a1's MIN value is min(3,12,80)=3: the maximum leaf of a MIN node is invisible to the decision. This insensitivity is exactly what alpha-beta formalizes." },
      { text: "Changes to a3, value 14", correct: false, feedback: "a3's value is still min(14,5,2)=2." },
      { text: "Still a1, but value 80", correct: false, feedback: "MIN takes the minimum: 3." },
      { text: "Depends on move ordering", correct: false, feedback: "Minimax has no ordering sensitivity whatsoever." },
    ],
    explanation: "Only extrema flow through the recurrence — the 80 is as irrelevant as the 14 it replaced in spirit.",
  },
  {
    id: "b-as-3",
    prompt: "Perfect move ordering gives alpha-beta O(b^(m/2)). The practical meaning of the square root:",
    options: [
      { text: "Half the tree is searched", correct: false, feedback: "The square root of the tree's SIZE is not half of it — at b=32, it is about 1/6th of the depth's worth of nodes... in fact b^(m/2) is the node count of a tree of depth m/2, an astronomically smaller number." },
      { text: "The same budget searches twice the depth", correct: true, feedback: "Correct — a tree of depth 2m has (b^( (2m)/2 )) = b^m nodes: your depth-m budget now buys depth-2m search. That is the whole career of game programming in one identity." },
      { text: "The branching factor halves", correct: false, feedback: "The EFFECTIVE branching factor square-roots (√b per level), which is stronger than halving." },
      { text: "Evaluation functions become unnecessary", correct: false, feedback: "Trees are still exponential — cutoffs and evaluation remain indispensable (b-07)." },
    ],
    explanation: "b^(m/2) at depth 2m equals b^m at depth m: double depth, same bill. Move ordering is the closest thing game search has to magic.",
  },
  {
    id: "b-as-4",
    prompt: "A cut node returns 2 where its true minimax value is −7 (some unexplored leaf was terrible for you). Does this harm the search?",
    options: [
      { text: "No — the parent already had something ≥ the window edge; the cut value only needs to be a bound on the losing side", correct: true, feedback: "Correct — the parent discards the branch either way; the bound suffices for the decision at hand." },
      { text: "Yes — the root value is now wrong", correct: false, feedback: "The root never uses the cut node's value for anything but discarding it." },
      { text: "Yes — the program may choose a losing move", correct: false, feedback: "The move is provably identical to minimax's; that is the algorithm's theorem." },
      { text: "It depends on the evaluation function", correct: false, feedback: "No evaluation is involved in the cut's soundness — only the window arithmetic." },
    ],
    explanation: "Bounds are honest currency within the window arithmetic; they only become lies if stored as exact values without flags.",
  },
  {
    id: "b-as-5",
    prompt: "Which statement about the alpha-beta window at the ROOT is true?",
    options: [
      { text: "The root starts with α = β = 0", correct: false, feedback: "The root starts with the full window (−∞, +∞); no guarantees exist before any child is searched." },
      { text: "The root's α rises with each MAX child searched; β stays +∞ in a two-level example where the root is MAX", correct: true, feedback: "Correct — at a MAX root, only α ever moves (from below); β would move only if a deeper MIN forced a re-entry, which the window's one-pass descent never does at the root level." },
      { text: "The root's window narrows from both sides every child", correct: false, feedback: "A MAX root's β never changes during its own children's loop." },
      { text: "Windows are per-subtree and never reach the root", correct: false, feedback: "They propagate down FROM the root — that is how cuts inherit earlier knowledge." },
    ],
    explanation: "Windows descend: the root's α is inherited by every later child, which is precisely why first moves matter so much for pruning.",
  },
  {
    id: "b-as-6",
    prompt: "Expectimax replaces MIN nodes with chance nodes. What guarantee survives the change?",
    options: [
      { text: "The minimax value — chance nodes compute the same thing", correct: false, feedback: "Expectations are not minima; the values differ whenever the distribution is non-degenerate." },
      { text: "Optimality against a perfect opponent", correct: false, feedback: "Expectimax is optimal against the MODELED opponent — a known random player." },
      { text: "Optimality against the opponent you actually modeled (the distribution) — but no worst-case guarantee", correct: true, feedback: "Correct — the guarantee is always conditional on the model. Minimax prices the worst case; expectimax prices the expected case." },
      { text: "Alpha-beta pruning works unchanged", correct: false, feedback: "Pruning through chance nodes needs bounds on leaf values and becomes far weaker — the window arithmetic no longer applies cleanly." },
    ],
    explanation: "Every game algorithm's guarantee is a contract with an opponent model; changing the model changes the contract (b-08's theme).",
  },
];
