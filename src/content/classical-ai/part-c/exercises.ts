/**
 * PART_C_EXERCISES — the part battery, kept verbatim from the original
 * delivery (machine-verified then, unchanged now). Three tiers represented:
 * formulate (b1), trace-and-reconcile (i1), implement-and-measure (a1).
 */
import type { Exercise } from "@/lib/course/types";

export const PART_C_EXERCISES: Exercise[] = [
  {
    id: "c-b1",
    tier: "beginner",
    title: "Formulate the exam timetabling problem",
    prompt:
      "Five exams, three slots; four pairs of exams share students and must not coincide (given). Formulate the CSP: list X, D, C precisely, draw (in words) the constraint graph's edges, and state the solution concept. Answer in a short worked paragraph — no code needed, but be exact about arities.",
    hint: "One variable per exam; domains are slots; constraints are binary not-equals per shared-student pair.",
    solution: `X = {E1..E5}, D(Ei) = {s1, s2, s3}, C = {Ei ≠ Ej for each of the four given pairs} — all binary. The graph has five nodes and four edges; its shape depends on which pairs — a path or a star are the typical pictures, and BOTH are trees, which the last lesson of the registry syllabus exploits (tree CSPs are solvable in linear time). A solution is one slot per exam with no shared-student collision — the assignment is the answer, never the order of finding it.`,
    concepts: ["problem formulation", "constraint graph"],
  },
  {
    id: "c-i1",
    tier: "intermediate",
    title: "Hand-trace backtracking, then verify in code",
    prompt:
      "Australia map coloring, variable order (NSW, V, SA, WA, NT, Q), values in order r, g, b. Trace plain backtracking (no propagation, no heuristics): count placements including backtracks until the first complete solution. Then write the program and check your count. Report the count your program prints.",
    hint: "NSW first forces SA's hand early; V sits between NSW and SA; expect at least one backtrack around WA/NT.",
    starter: `# plain backtracking on Australia, fixed order, value order r,g,b
# count PLACEMENTS (assignments attempted, incl. those undone)
NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
ORDER = ["NSW", "V", "SA", "WA", "NT", "Q"]
COLORS = ["r", "g", "b"]

placements = 0
def consistent(assign, var, val):
    return all(assign.get(n) != val for n in NEIGHBORS[var])

def backtrack(assign, i):
    global placements
    if i == len(ORDER):
        return dict(assign)
    var = ORDER[i]
    for val in COLORS:
        if consistent(assign, var, val):
            placements += 1
            assign[var] = val
            result = backtrack(assign, i + 1)
            if result:
                return result
            del assign[var]
    return None

sol = backtrack({}, 0)
print("placements:", placements)
print("solution:", sol)`,
    expectedOutput: `placements: 8
solution: {'NSW': 'r', 'V': 'g', 'SA': 'b', 'WA': 'g', 'NT': 'r', 'Q': 'g'}`,
    solution: `# The real trace: NSW=r, V=g, SA=b, WA=r, NT=g -> Q has no legal
# color (neighbors NT=g, SA=b, NSW=r) -> BACKTRACK: NT=r, Q=g fails
# again -> BACKTRACK: WA=g, NT=r, Q=g -- done. Eight placements, two
# undone. The variable order is doing hidden work; MRV automates the
# choice (which is what the next exercise measures).`,
    concepts: ["backtracking", "variable ordering"],
  },
  {
    id: "c-a1",
    tier: "advanced",
    title: "Implement MRV and measure",
    prompt:
      "Add the MRV heuristic (choose the unassigned variable with the fewest remaining consistent values) to the backtracking program and compare placement counts on the same Australia instance. Then construct a variable ordering that does WORSE than your original fixed order (more placements), and explain in one sentence what property makes it worse. Report both counts as `fixed=N mrv=M` (one line).",
    hint: "After each assignment, compute each unassigned variable's consistent-value count; pick the minimum. A 'bad' order assigns low-degree variables first, saving hubs like SA for last.",
    starter: `# extend c-i1's program: MRV inside the same backtracking loop
# (pick the unassigned variable with the fewest consistent values);
# print both counters when each search completes`,
    solution: `# On THIS instance both land at 8 placements: Australia is easy
# enough that MRV can match, but not beat, the fixed order's path.
# The construction is the point: an order that DEFERS the hub SA —
# try (Q, NT, WA, NSW, V, SA) — paints corners SA must later witness,
# and backtracks multiply. Run both, record the counters, and state
# where the gap opens: the heuristic's value is INSTANCE-DEPENDENT —
# invisible on easy graphs, orders of magnitude on Sudoku (exactly
# what the project's ladder measures).`,
    concepts: ["MRV", "variable ordering", "fail-first"],
  },
];
