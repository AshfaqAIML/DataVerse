/**
 * PART_E_PROJECT — capstone for Part E "Classical Planning" (J5).
 * Kept verbatim from the part's original battery (registry-exact brief).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_E_PROJECT: MiniProject = {
  title: "The Blocks-World Planner",
  brief:
    "Implement a blocks-world planner with two engines on one operator library: progression search with a delete-relaxation heuristic, and a Graphplan-style planning graph with mutex marking and backward extraction. Run both on a fixed suite of problems, verify every emitted plan by replaying its operators, and compare node counts and plan lengths. The replay verifier is the project's conscience: no plan ships on trust.",
  requirements: [
    "A blocks-world domain: the e-01 operator library (move with table conventions), exact and inspectable",
    "Progression engine: BFS or A* with h+ (delete relaxation, computed on the fly or precompiled)",
    "Planning-graph engine: level builder, mutex marking with rule citations, backward extraction",
    "A replay verifier: given a plan, apply each operator and assert every precondition held at its step",
    "A fixed problem suite (include the Sussman anomaly, the flat-to-three-stack, and two multi-block instances) with per-engine node counts and plan lengths reported",
  ],
  steps: [
    "Port the e-01 operator library and apply(); write the replay verifier FIRST — it is your test oracle.",
    "Implement progression BFS; solve Sussman; verify the plan by replay.",
    "Add h+ : compute the relaxed reachability (ignoring deletes) and use its length as A*'s heuristic; re-solve and compare node counts.",
    "Build the planning graph: proposition/action levels, persistence no-ops, growth to level-off with the two monotonicity assertions checked in code.",
    "Implement mutex marking (interference + competing needs, each marked with its citation) and the level-off test.",
    "Implement backward extraction; on failure at a level, grow one more level and retry — the Graphplan loop.",
    "Run the suite; tabulate node counts and lengths; write the comparison: where did the graph's shared structure beat per-state search, and where did it not?",
  ],
  starter: `# The blocks world -- one library, two engines, one verifier.
def make_move(x, y, z): ...     # the e-01 operator
def apply(state, op): ...

def verify(start, plan, goal): ...
    # replay; raise at the FIRST operator whose preconditions fail

def progression(start, goal, heuristic=None): ...
def build_graph(start): ...     # levels, mutexes, level-off flag
def extract(graph, goal): ...

SUITE = [
    ("sussman", {...}, {"on(A,B)", "on(B,C)"}),
    ("flat-stack", {...}, {...}),
    ("two-towers", {...}, {...}),
    ("reshuffle", {...}, {...}),
]
if __name__ == "__main__":
    for name, s, g in SUITE:
        for engine, fn in [("bfs", progression), ("astar-h+", None), ("graphplan", None)]:
            plan, nodes = fn(s, g) if fn else (None, None)
            print(name, engine, "OK" if verify(s, plan, g) else "BAD", len(plan), nodes)
`,
  concepts: ["STRIPS", "progression search", "delete relaxation", "planning graph", "mutex", "replay verification"],
  extension: "Implement h-max and h-add as graph-relaxed approximations and benchmark all three heuristics: which stays admissible, which is informative, and where do they disagree?",
};
