/**
 * PART_B_PROJECT — the Part B mini project. Moved verbatim from index.ts.
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_B_PROJECT: MiniProject = {
  title: "The Alpha-Beta Engine",
  brief:
    "Build a game engine on a fixed two-player game: full minimax, then alpha-beta with randomized move ordering, then alpha-beta with a hand-designed move-ordering heuristic. Instrument all three with node counters, benchmark them across at least twenty positions, and write up the pruning dividend as a function of ordering quality. The deliverable is the discipline: three engines, one answer, and numbers that explain the difference.",
  requirements: [
    "A game module: legal moves, terminal test, utility function — one fixed game of your choice among nim, tic-tac-toe endgames, or connect-four on a 4×4 board",
    "Three engines behind one interface: minimax, alpha-beta (random order, seeded), alpha-beta (heuristic order)",
    "A benchmark harness of 20+ positions with fixed seeds, recording visits per engine per position",
    "An assertion that all three engines agree on the chosen move for every benchmark position",
    "A short write-up: mean visits by engine, the dividend of heuristic vs random ordering, and one paragraph on when the dividend was largest",
  ],
  steps: [
    "Choose and implement the game module; write positions as compact strings for reproducibility.",
    "Implement minimax with a visit counter; verify by hand on two simple positions.",
    "Implement alpha-beta; fuzz it against minimax on 50 random positions (assert equal values) — this test is the project's spine.",
    "Add the random ordering (seeded shuffle) and the heuristic ordering (e.g., prefer center/captures/winning replies).",
    "Build the benchmark ladder: 20+ non-terminal positions across game phases; run all engines; tabulate.",
    "Compute the dividend ratios; identify the position types where ordering mattered most and explain why.",
    "Write the report; include the fuzz assertion's output as evidence the answer never changed.",
  ],
  starter: `import random

# -- the game: replace with your chosen game's rules -------------------
def legal_moves(state): ...
def apply(state, move): ...
def terminal(state): ...
def utility(state): ...

# -- engines ----------------------------------------------------------
def minimax(state, depth):            # returns (value, move, visits)
    ...

def alpha_beta(state, depth, alpha, beta, order):
    ...

def order_random(moves, seed): ...
def order_heuristic(moves, state): ...

if __name__ == "__main__":
    BENCHMARKS = [...]  # 20+ positions
    for s in BENCHMARKS:
        print(minimax(s, 8)[::2], alpha_beta(s, 8, order_random)[::2],
              alpha_beta(s, 8, order_heuristic)[::2])
`,
  concepts: ["minimax", "alpha-beta pruning", "move ordering", "benchmarking", "fuzz testing"],
  extension: "Add a transposition table with bound flags (≤/≥) and measure how much repetition it removes on your benchmark — then explain, in one paragraph, why storing cut values without flags would be a correctness bug.",
};
