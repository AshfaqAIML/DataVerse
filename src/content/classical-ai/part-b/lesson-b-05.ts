/**
 * Lesson b-05 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_05: ClassicalLesson = {

  slug: "b-05",
  title: "The Alpha-Beta Window",
  minutes: 35,
  summary:
    "Carry the best guaranteed values down the tree and cut the moment a branch cannot beat them.",
  kind: "coding",
  objectives: [
    "State the alpha-beta pruning rule precisely, for both node kinds",
    "Trace alpha-beta by hand with windows annotated and cuts justified",
    "Implement alpha-beta and verify it returns minimax's move with fewer node visits",
    "Explain why cuts never change the root value — and what they do change",
  ],
  why: "Minimax's guarantee is bought with the whole tree: every leaf, even ones provably irrelevant to the decision. Alpha-beta pruning removes exactly that waste. It is not a new algorithm — it returns the same move as minimax, always — but a discipline about when a branch's outcome is already decided. The dividend is enormous: with good move ordering, the effective branching factor drops to its square root, which converts 'four plies deeper than your budget' into 'in your budget'. Deep Blue beat Kasparov in 1997 with search, evaluated by the ton — and alpha-beta is the ton-evaluator's tax refund.",
  blocks: [
    {
      kind: "text",
      text: "The trace in the last lesson hid a slack. After MIN node a1 backed up 3, you knew MAX's value is *at least* 3. When the next MIN node saw its first leaf return 2, its value could only fall further — and a value below 3 can never win at a MAX parent that already holds 3. The remaining leaves under a2 were dead weight. Alpha-beta is nothing more than this observation, mechanized: carry the best-so-far guarantees down the tree and stop the moment a branch cannot influence the decision.",
    },
    {
      kind: "definition",
      term: "The alpha-beta window",
      informal:
        "α is the best value MAX can already guarantee; β is the best value MIN can already guarantee. Between them sits the only range where the current branch's value still matters.",
      formal: "\\alpha \\le v(n) \\le \\beta \\text{ while } n \\text{ is live; cut when } \\alpha \\ge \\beta",
      why: "A cut is not a guess — it is a proof that the pruned subtree cannot change the root's move.",
    },
    { kind: "heading", text: "The rule, stated precisely" },
    {
      kind: "math",
      title: "When to stop searching a branch",
      displays: [
        { expr: "\\text{at a MIN node: cut when } v \\le \\alpha", label: "β-cut" },
        { expr: "\\text{at a MAX node: cut when } v \\ge \\beta", label: "α-cut" },
      ],
      caption:
        "v is the value backed up so far in the current node. On cut, return v immediately — it is a bound, not the exact value, but the exact value cannot matter.",
    },
    {
      kind: "pseudocode",
      title: "Alpha-beta: minimax with a window",
      lines: [
        { text: "function ALPHA-BETA(node, α, β, maximizing)", tone: "key" },
        { text: "if terminal then return UTILITY(node)", indent: 1 },
        { text: "if maximizing then", indent: 1 },
        { text: "v ← −∞", indent: 2 },
        { text: "for each child:", indent: 2 },
        { text: "v ← max(v, ALPHA-BETA(child, α, β, false))", indent: 3 },
        { text: "α ← max(α, v)", indent: 3 },
        { text: "if α ≥ β then break   // β-cut", indent: 3, tone: "key", note: "MIN already has something better elsewhere — this branch is decided" },
        { text: "return v", indent: 2 },
        { text: "else", indent: 1 },
        { text: "v ← +∞", indent: 2 },
        { text: "for each child:", indent: 2 },
        { text: "v ← min(v, ALPHA-BETA(child, α, β, true))", indent: 3 },
        { text: "β ← min(β, v)", indent: 3 },
        { text: "if β ≤ α then break   // α-cut", indent: 3, tone: "key" },
        { text: "return v", indent: 2 },
      ],
      note: "Same recurrence as minimax; two carried values and one break. Time O(b^(m/2)) with perfect ordering, O(b^m) with the worst.",
    },
    { kind: "heading", text: "The canonical trace" },
    {
      kind: "gameTree",
      title: "Alpha-beta on the b-02 tree",
      showWindows: true,
      root: {
        kind: "max",
        alpha: 3,
        children: [
          {
            edgeLabel: "a1",
            child: {
              kind: "min",
              value: 3,
              alpha: 3,
              beta: 3,
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
              alpha: 3,
              beta: 2,
              cut: true,
              children: [
                { edgeLabel: "b1", child: { kind: "leaf", value: 2 } },
                { edgeLabel: "b2", child: { kind: "leaf", value: 4, pruned: true } },
                { edgeLabel: "b3", child: { kind: "leaf", value: 6, pruned: true } },
              ],
            },
          },
          {
            edgeLabel: "a3",
            child: {
              kind: "min",
              value: 2,
              alpha: 3,
              beta: 2,
              cut: true,
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
        "Cuts: a2 searched b1 (2), then β=2 ≤ α=3 — leaves b2, b3 never touched. a3 searched b1 (14), b2 (5), then b3 (2) made β=2 ≤ α=3 — nothing left to cut there, the value simply settled at 2. Root: max(3, 2, 2) = 3 — identical to minimax, on fewer visits.",
      caption:
        "The windows tell the story: after a1, the root carries α=3. Every later MIN node that dips to 2 or below is dead the moment its β crosses α.",
    },
    {
      kind: "pythonImpl",
      title: "Minimax vs alpha-beta, node counts printed",
      intent:
        "Run both algorithms on the same tree with the same child order; count every visit; print the cuts. The move must not change — only the work.",
      code: `MID = {"A": ["B", "C", "D"]}
LEAF = {"B1": 3, "B2": 12, "B3": 8,
        "C1": 2, "C2": 4, "C3": 6,
        "D1": 14, "D2": 5, "D3": 2}
GROUPS = {"A": ["B", "C", "D"], "B": ["B1", "B2", "B3"],
          "C": ["C1", "C2", "C3"], "D": ["D1", "D2", "D3"]}

def minimax(node, maximizing):
    global mm
    mm += 1
    kids = GROUPS.get(node)
    if kids is None:
        return LEAF[node]
    vals = [minimax(k, not maximizing) for k in kids]
    return max(vals) if maximizing else min(vals)

def ab(node, alpha, beta, maximizing):
    global abn
    abn += 1
    kids = GROUPS.get(node)
    if kids is None:
        return LEAF[node]
    if maximizing:
        v = float("-inf")
        for k in kids:
            v = max(v, ab(k, alpha, beta, False))
            alpha = max(alpha, v)
            if alpha >= beta:
                cuts.append(k)
                break
        return v
    v = float("inf")
    for k in kids:
        v = min(v, ab(k, alpha, beta, True))
        beta = min(beta, v)
        if beta <= alpha:
            cuts.append(k)
            break
    return v

mm = 0
print("minimax value:", minimax("A", True), "| visits:", mm)
abn, cuts = 0, []
print("alpha-beta value:", ab("A", float("-inf"), float("inf"), True), "| visits:", abn)
print("cut after:", ", ".join(cuts))`,
      output: `minimax value: 3 | visits: 13
alpha-beta value: 3 | visits: 11
cut after: C1, D3`,
      walkthrough: [
        "Two counters, one tree, identical values: 3. Alpha-beta never changes the answer — that is the theorem, not luck.",
        "The first cut happens under C: after C1=2, β=2 ≤ α=3, so C2 and C3 are skipped. Visit count drops accordingly.",
        "D runs further: D1=14 (β=14, no cut), D2=5 (β=5, still > 3), D3=2 (β=2 ≤ 3, cut after the last leaf — nothing left to save).",
        "11 visits instead of 13 is a modest dividend — b=3 is too small to impress. At b=35 (chess), perfect ordering means searching as if b were 6: twice the depth on the same hardware.",
      ],
      project: "The Part B project benchmarks exactly this trade as a function of move ordering.",
    },
    { kind: "heading", text: "Why cuts are safe — and what they cost" },
    {
      kind: "math",
      title: "The dividend, quantified",
      displays: [
        { expr: "\\text{worst ordering: } O(b^m) \\text{ — no cuts at all}" },
        { expr: "\\text{perfect ordering: } O(b^{m/2}) \\text{ — the square root of the tree}" },
      ],
      caption:
        "b^(m/2) means searching depth 2m with the budget of depth m: the ordering heuristic IS the extra ply. Move ordering (b-06) is where real engines spend their ingenuity.",
    },
    {
      kind: "complexity",
      title: "The two algorithms, honestly",
      reading: "The rows differ only in ordering assumptions; the guarantees never differ. That is the meaning of 'alpha-beta is minimax, faster'.",
      rows: [
        { algorithm: "Minimax", best: "O(b^m)", average: "O(b^m)", worst: "O(b^m)", space: "O(m)", note: "every leaf, always" },
        { algorithm: "Alpha-beta (worst order)", best: "O(b^m)", average: "O(b^m)", worst: "O(b^m)", space: "O(m)", note: "cuts never fire — still equals minimax" },
        { algorithm: "Alpha-beta (perfect order)", best: "O(b^(m/2))", average: "—", worst: "O(b^(m/2))", space: "O(m)", highlight: true, note: "equivalent branching √b: depth 2m for the price of m" },
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "What a cut does NOT tell you",
      text: "A cut returns a bound, not the subtree's true value: after cutting C, the program knows only 'C is worth at most 2 to me' — actually at most α. The ROOT decision is unaffected, but the recorded value of the cut node is wrong, and that matters the moment you cache values (transposition tables store bounds with flags) or reuse the search's numbers for analysis. The project's node counters are safe; an engine's eval table needs care.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-05-e1",
      exerciseKind: "predict-output",
      prompt:
        "In the program above, the leaves are re-ordered so C's children appear as C2 (4), C1 (2), C3 (6) left to right. Predict the new visit count and the cut list. Type two things separated by ' | ': the alpha-beta visits, then the cuts like 'C1, D3'.",
      expectedOutput: "12 | C1, D3",
      solution: "12 | C1, D3",
      explanation:
        "Under C with order (C2, C1, C3): first leaf 4 → v=4, β=4 > α=3, no cut; second leaf 2 → v=2, β=2 ≤ α=3 → cut, recording the crossing child C1; C3 is skipped. Visits: A + 3 MIN nodes + B's 3 leaves + C's 2 leaves + D's 3 leaves = 12. The order of the first two children under C decides how many leaves you pay before the proof arrives.",
      concepts: ["alpha-beta pruning", "move ordering"],
    },
    {
      kind: "exercise",
      id: "b-05-e2",
      exerciseKind: "trace",
      prompt:
        "Prove the cut under C from first principles, in three sentences: what α=3 means, what β=2 means, and why no unexplored leaf under C can matter.",
      solution:
        "(1) α=3 is the value MAX can already guarantee through move a1 — the root will end up at least 3. (2) β=2 means MIN, playing under C, can already hold you to at most 2. (3) MIN's value under C can only DECREASE or stay as more leaves are seen, so the value of move a2 is at most 2 < 3 — MAX will never choose it regardless of what the unexplored leaves say. Their values are irrelevant to the root decision; skipping them is a proof, not a gamble.",
      explanation: "Every cut in every alpha-beta run is this three-sentence argument instantiated. When you can recite it cold, you own the algorithm.",
      concepts: ["alpha-beta pruning", "soundness of cuts"],
    },
    {
      kind: "exercise",
      id: "b-05-e3",
      exerciseKind: "write-code",
      prompt:
        "Add move ordering to the program: before recursing into a MIN node's children, sort the leaves by ascending value (a stand-in for 'search the likely-best reply first' — for MIN, the lowest leaf is the most dangerous). Print the new visit count. The check runs your code against the real output.",
      starter: `# sort each MIN node's children ascending before searching.
# MIN nodes are B, C, D (children are leaves). Count visits.

MID = {"A": ["B", "C", "D"]}
LEAF = {"B1": 3, "B2": 12, "B3": 8, "C1": 2, "C2": 4, "C3": 6,
        "D1": 14, "D2": 5, "D3": 2}
GROUPS = {"A": ["B", "C", "D"]}
for n, ls in [("B", ["B1","B2","B3"]), ("C", ["C1","C2","C3"]), ("D", ["D1","D2","D3"])]:
    GROUPS[n] = sorted(ls, key=lambda l: LEAF[l])

visits = 0
def ab(node, alpha, beta, maximizing):
    global visits
    visits += 1
    kids = GROUPS.get(node)
    if kids is None:
        return LEAF[node]
    # TODO: the alpha-beta body from the lesson
    ...

print("value:", ab("A", float("-inf"), float("inf"), True), "| visits:", visits)`,
      expectedOutput: "value: 3 | visits: 9",
      solution: `def ab(node, alpha, beta, maximizing):
    global visits
    visits += 1
    kids = GROUPS.get(node)
    if kids is None:
        return LEAF[node]
    if maximizing:
        v = float("-inf")
        for k in kids:
            v = max(v, ab(k, alpha, beta, False))
            alpha = max(alpha, v)
            if alpha >= beta:
                break
        return v
    v = float("inf")
    for k in kids:
        v = min(v, ab(k, alpha, beta, True))
        beta = min(beta, v)
        if beta <= alpha:
            break
    return v

# With each MIN node's leaves sorted ascending, the first leaf of C is 2:
# beta drops to 2 <= alpha=3 immediately and the other two leaves are cut.
# Same under D (first leaf 2). Visits: A + 3 MIN + B's 3 leaves + C's 1 + D's 1 = 9.`,
      explanation:
        "Ascending order at MIN nodes is the worst case FOR THE OPPONENT and the best case for your pruning: one leaf settles each doomed node. 9 visits — the theoretical floor for this tree.",
      concepts: ["alpha-beta pruning", "move ordering", "best-first ordering"],
    },
  ],
  terms: [
    {
      term: "alpha (α)",
      definition: "The best value MAX can already guarantee at or above the current node — the floor of the live window.",
    },
    {
      term: "beta (β)",
      definition: "The best value MIN can already guarantee at or above the current node — the ceiling of the live window.",
    },
    {
      term: "pruning dividend",
      definition: "The node savings from alpha-beta, a pure function of move ordering: worst case none, perfect case the square root of the tree.",
    },
    {
      term: "fail-hard / bound",
      definition: "What a cut node's returned value is: an inequality (at most α / at least β), not the node's true minimax value.",
    },
  ],
  mistakes: [
    {
      mistake: "Testing α ≥ β before the first child (or initializing α, β wrongly).",
      why: "An empty window inverted at the root prevents any search — or an over-wide window prunes nothing and hides the bug.",
      fix: "Root call: α = −∞, β = +∞. Update AFTER each child; test after updating. The pseudocode's order is load-bearing.",
    },
    {
      mistake: "Treating cut nodes' returned values as exact.",
      why: "Cuts return bounds; using them as exact values poisons caches, analysis output, and any second consumer of the search's numbers.",
      fix: "Propagate bound flags (≤ / ≥) whenever storing values, as transposition tables do.",
    },
    {
      mistake: "Believing alpha-beta changes the chosen move when ordering changes.",
      why: "The MOVE is invariant under ordering (the VALUE is too); only the work varies. If your implementation's move changes with ordering, you have a bug — usually a window passed by reference or a wrong cut inequality.",
      fix: "Fuzz against plain minimax: same tree, random orders, assert equal values. That is the project's core test.",
    },
  ],
  takeaways: [
    "Alpha-beta is minimax plus a window: α = MAX's guaranteed floor, β = MIN's guaranteed ceiling; cut when they cross.",
    "Cuts are proofs of irrelevance — the returned move and value equal minimax's, always.",
    "Perfect ordering searches O(b^(m/2)) nodes: the square root of the tree, i.e. double depth on the same budget.",
    "A cut node's value is a bound, not a truth — flag it when caching.",
    "Move ordering is the engine's real art: the next lesson shows measured dividends from ordering heuristics.",
  ],
  quiz: [
    {
      id: "b-05-q1",
      prompt: "At a MIN node, α = 3 and the first child returns 5. What happens?",
      options: [
        { text: "Cut: 5 ≥ α means the branch is decided", correct: false, feedback: "The MIN node's value so far is 5, but MIN can only drive it DOWN — below 5, toward α. Nothing is decided yet; the cut rule is v ≤ α." },
        { text: "No cut: MIN's value can still drop to 3 or below; continue with the next child", correct: true, feedback: "Correct — 5 is still above the floor α=3. Only when the running minimum falls to ≤ 3 does the branch become irrelevant to MAX." },
        { text: "Cut: MIN always cuts after one child", correct: false, feedback: "MIN always cuts after one child only in the degenerate case α = +∞." },
        { text: "The window widens: β becomes 5 and α becomes 3", correct: false, feedback: "β does become 5 — but windows only NARROW as they descend; α stays 3. And widening is not the question — cutting is." },
      ],
      explanation: "The cut at a MIN node fires when v ≤ α. Above α, the branch is still live competition.",
    },
    {
      id: "b-05-q2",
      prompt: "Alpha-beta with the WORST possible move ordering visits how many nodes, relative to minimax?",
      options: [
        { text: "Exactly as many — no cuts fire, and the answer is still identical", correct: true, feedback: "Correct: adversarial ordering can suppress every cut, leaving the full tree — and the same value. Ordering affects cost only, never correctness." },
        { text: "Half as many — some cuts always fire", correct: false, feedback: "Cuts are avoidable by an adversary who knows your order." },
        { text: "More — the window bookkeeping adds nodes", correct: false, feedback: "Bookkeeping adds constant work per node, not nodes to visit." },
        { text: "Fewer by a factor of √b", correct: false, feedback: "That is the PERFECT-ordering dividend, not the worst case." },
      ],
      explanation: "The guarantee 'same answer, ≤ the work' is what makes alpha-beta free to deploy: there is no downside case in correctness.",
    },
  ],

};
