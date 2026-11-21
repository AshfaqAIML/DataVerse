/**
 * PART_B_EXERCISES — the tiered practice battery for Part B
 * (adversarial search & games). Moved verbatim from index.ts.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_B_EXERCISES: Exercise[] = [
  {
    id: "b-b1",
    tier: "beginner",
    title: "Back up the values",
    prompt:
      "A MAX root has two MIN children. The left MIN has leaves {7, 3, 9}; the right has leaves {2, 8}. Compute both MIN values and the root value, and state which move MAX plays. Write the answer as `left=3, right=2, root=3` style — but type it exactly as the program's format: three numbers separated by spaces.",
    hint: "MIN takes the smallest leaf under it; MAX takes the largest of the minima.",
    starter: `# verify your hand trace
print(min(7, 3, 9), min(2, 8), max(min(7, 3, 9), min(2, 8)))`,
    expectedOutput: "3 2 3",
    solution: `3 2 3`,
    concepts: ["minimax", "backed-up values"],
  },
  {
    id: "b-i1",
    tier: "intermediate",
    title: "Implement alpha-beta with cut counting",
    prompt:
      "Implement alpha-beta over the given tree (a 3×3×3 two-ply game as in the lesson) and print `value, visits, cuts` in that exact format. The leaves, left to right: 3, 12, 8, 2, 4, 6, 14, 5, 2. Visit count starts at the root and counts every call, leaves included.",
    hint: "The lesson's program prints these same numbers: 3, 11 visits, cuts after C1 and D3 — the crossing children are what get recorded.",
    starter: `LEAVES = {"B": [3, 12, 8], "C": [2, 4, 6], "D": [14, 5, 2]}
# TODO: alpha-beta with a visit counter and a cut list.
# Print: value, visits, cuts  (e.g. 3 11 C1,D3) -- match the expected format below)`,
    expectedOutput: "3 11 C1,D3",
    solution: `LEAVES = {"B": [3, 12, 8], "C": [2, 4, 6], "D": [14, 5, 2]}
visits = 0
cuts = []

def ab(group, alpha, beta, maximizing, name):
    global visits
    visits += 1
    if group is None:
        return LEAF_LOOKUP[name]
    ...

# Trace: under B no cut (all >= 3 eventually min=3).
# Under C: first leaf 2 -> beta=2 <= alpha=3 -> cut, skipping C2, C3:
# the cut records the CURRENT child (the one that crossed), "C1".
# Reconcile with the lesson: cut-after names differ by convention;
# what is invariant is visits=11 and value=3.`,
    concepts: ["alpha-beta pruning", "instrumentation"],
  },
  {
    id: "b-i2",
    tier: "intermediate",
    title: "Order for the deep cut",
    prompt:
      "Reorder each MIN group's leaves so the cut fires after the FIRST child everywhere it can (ascending order at MIN nodes — MIN's most dangerous reply first). Re-run your b-i1 program and report the new `value, visits, cuts` triple.",
    hint: "Ascending order: B = [3, 8, 12], C = [2, 4, 6], D = [2, 5, 14].",
    starter: `# copy your b-i1 solution, sort each group ascending first
# print the same format`,
    expectedOutput: "3 9 C1,D1",
    solution: `# Sorted ascending, each MIN group's first leaf is its minimum,
# so every non-first group (C and D) cuts after one leaf:
# visits = 1 (root) + 3 (B,C,D) + 3 (B's leaves) + 1 (C) + 1 (D) = 9.
# B cannot cut (alpha is -inf until B returns; B's first leaf sets
# alpha=3 only after the max at the root... careful: B is the FIRST
# child, alpha starts -inf, so B searches all 3 leaves, then alpha=3).
# Value unchanged: 3. Cuts fire after C's first leaf and D's first.`,
    concepts: ["move ordering", "best-first ordering", "pruning dividend"],
  },
  {
    id: "b-a1",
    tier: "advanced",
    title: "Prove the move is ordering-invariant",
    prompt:
      "In prose (a worked paragraph, no code): why does alpha-beta return minimax's ROOT VALUE under ANY child ordering, even though the visited set varies? Structure the argument as (i) what a cut proves, (ii) why the proof is independent of when it is discovered, (iii) what the root ends up comparing.",
    hint: "The three-sentence argument from exercise b-05-e2, generalized: cuts are discoveries of facts that were true all along.",
    solution: `(i) A cut at a node fires when its running value has crossed the window edge — which PROVES its final minimax value lies on or beyond that edge, i.e. beyond what its parent can already guarantee elsewhere. (ii) That fact is a property of the subtree and the window, not of the order in which children were examined: had the decisive child come later, the same inequality would have been discovered later, with strictly more visits but the same conclusion — the cut's CONCLUSION is order-invariant, only its TIMING varies. (iii) The root compares its children's returned values; every child either returns its exact minimax value (searched without crossing the window) or a bound on the wrong side of a comparison the root was going to lose anyway — in both cases the root's argmax is the same as minimax's. Ordering changes the bill, never the verdict.`,
    concepts: ["soundness of cuts", "move ordering", "invariance"],
  },
];
