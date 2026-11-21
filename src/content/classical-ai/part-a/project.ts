/**
 * PART_A_PROJECT — the Part A capstone, carried over from the original
 * delivery with one repair: the starter's benchmark list was `[...]`
 * (a literal Ellipsis) which crashed the main loop at runtime — it is
 * now an empty list with the same TODO, so the starter RUNS as given
 * and prints its harness banner (verified: `benchmark harness: 0
 * starts, 3 engines`).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_A_PROJECT: MiniProject = {
  title: "The 8-Puzzle Laboratory",
  brief:
    "Implement the eight-puzzle three ways — uniform-cost search, A* with misplaced tiles, A* with Manhattan distance — on one shared state-space engine, instrument all three with nodes-expanded counters, and explain the measured efficiency gap using effective branching factor. This is the subject's capstone exercise in the difference knowledge makes: the same space, the same optimum, three very different amounts of work.",
  requirements: [
    "A state-space module: the board as a 9-tuple, successor generation for the blank's four slides, the goal test, and path reconstruction",
    "Three search implementations sharing ONE frontier interface (a heap ordered by a key you supply per engine)",
    "A benchmark harness over at least ten start states (fixed, published in the code), recording nodes expanded and solution length per engine",
    "Every benchmarked solution verified optimal (all three engines agree on length)",
    "A short written analysis: effective branching factor per heuristic, and why Manhattan's advantage appears where it does",
  ],
  steps: [
    "Write the state-space module first: successors, goal test, and a solver-agnostic representation. Test on a hand-traced two-move instance.",
    "Implement the frontier interface and uniform-cost search on top of it; verify it solves a shuffled instance and returns the move list.",
    "Add the two heuristics as pure functions of state; prove to yourself (one comment each) why both are admissible.",
    "Implement A* twice, differing only in the heuristic handed to the key; run all three on your benchmark ladder.",
    "Instrument: wrap the frontier pop in a counter; write the benchmark table to stdout.",
    "Compute effective branching factors for the two A* runs; write the analysis connecting the numbers to dominance (h2 ≥ h1).",
    "Break it on purpose: set h := 3 × Manhattan on one instance, note the suboptimal 'solution', and explain in one paragraph what guarantee died.",
  ],
  starter: `from heapq import heappush, heappop

GOAL = (1, 2, 3, 4, 5, 6, 7, 8, 0)   # 0 is the blank

def successors(board):
    # TODO: yield every board reachable by sliding the blank
    ...

def goal_test(board):
    return board == GOAL

def solve(start, engine):
    # TODO: engines = ("ucs", h=0), ("astar-misplaced", misplaced), ("astar-manhattan", manhattan)
    # Return (moves, nodes_expanded)
    ...

def misplaced(board): ...
def manhattan(board): ...

if __name__ == "__main__":
    STARTS = []  # TODO: ten fixed start states (mix of depths 4..20)
    print(f"benchmark harness: {len(STARTS)} starts, 3 engines")
    for s in STARTS:
        for engine in ("ucs", "misplaced", "manhattan"):
            moves, expanded = solve(s, engine)
            print(engine, len(moves), expanded)`,
  concepts: ["state space", "priority frontier", "admissible heuristic", "benchmarking", "effective branching factor"],
  extension: "Solve the fifteen-puzzle (4×4) optimally for a few lightly-shuffled starts: watch Manhattan A*'s frontier cross a million nodes, then implement IDA* and feel the memory wall move.",
};
