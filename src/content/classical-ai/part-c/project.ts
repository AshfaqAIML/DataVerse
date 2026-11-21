/**
 * PART_C_PROJECT — the part battery, kept verbatim from the original
 * delivery. Mirrors the registry project for subject J3 ("The Sudoku
 * Solvers", independent, 7h).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_C_PROJECT: MiniProject = {
  title: "The Sudoku Solvers",
  brief:
    "Solve Sudoku three ways on one constraint engine: plain backtracking, backtracking plus MRV and degree ordering, and backtracking plus full AC-3 propagation. Benchmark all three on a fixed ladder of puzzles from easy to hard, count assignments and consistency checks, and write up when each strategy pays for itself. The engine is one module; the strategies are policies on top of it — the project's discipline is keeping them comparable.",
  requirements: [
    "A constraint-network representation of Sudoku: 81 variables, domains 1–9, all-different over 27 units — no hard-coded solving",
    "Three solvers sharing one engine interface: plain, MRV+degree, MRV+degree+AC-3 (MAC)",
    "A benchmark ladder of nine verified-solvable puzzles: three easy, three medium, three hard (verify solvability with your own solver before shipping the ladder)",
    "Instrumentation: assignments attempted and consistency checks performed, per solver per puzzle",
    "A written analysis: where each strategy's advantage appears and why, with the numbers cited",
  ],
  steps: [
    "Build the engine: variables, domains, units, assignment/consistency queries. Test: an empty grid's initial domains are all 1–9; a given clues' domains are singletons.",
    "Implement plain backtracking over the engine (fixed variable order, values ascending); solve the easiest puzzle by hand-check.",
    "Add MRV with degree tie-breaking; verify it solves the same puzzles (answers may differ in search path, never in validity).",
    "Implement AC-3 over the engine's binary view or a native all-different propagation; wire it in as MAC.",
    "Construct and verify the nine-puzzle ladder (run your own solver; fix any unsolvable construction before shipping).",
    "Run the benchmark: 3 solvers × 9 puzzles × (assignments, checks); print the table.",
    "Write the analysis: the crossover points, the hardest puzzle's story, and one paragraph on why propagation dominated ordering (or did not) at each tier.",
  ],
  starter: `# The Sudoku constraint engine -- all three solvers share it.
GIVENS_EASY = [ ... ]      # 81-char strings, 0 for empty: build and VERIFY
GIVENS_MEDIUM = [ ... ]    # each is solvable (run your solver) before shipping
GIVENS_HARD = [ ... ]

def units(): ...           # 27 units, each a tuple of 9 cell indices
def peers(): ...           # cell -> the 20 peers across its row/col/box

class SudokuCSP: ...
    # domains: dict[int, set[int]] after loading givens

def solve_plain(csp): ...
def solve_mrv(csp): ...
def solve_mac(csp): ...

if __name__ == "__main__":
    for tier, puzzles in [("easy", GIVENS_EASY), ("medium", GIVENS_MEDIUM), ("hard", GIVENS_HARD)]:
        for p in puzzles:
            csp = SudokuCSP(p)
            for name, fn in [("plain", solve_plain), ("mrv", solve_mrv), ("mac", solve_mac)]:
                result = fn(SudokuCSP(p))
                print(tier, name, result.assignments, result.checks)
`,
  concepts: ["constraint network", "backtracking", "MRV", "arc consistency", "benchmarking"],
  extension: "Add a fourth strategy — forward checking only — and place it on the ladder between plain and MAC; then explain, with your numbers, why the industry standard for general solvers is MAC rather than FC.",
};
