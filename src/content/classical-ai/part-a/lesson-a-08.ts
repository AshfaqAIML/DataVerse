/**
 * PART A · MODULE 2 · "A* and Its Guarantees" — lesson a-08, "Admissibility,
 * Consistency and Optimality".
 *
 * The chapter's closing argument: the tree-search optimality proof (the
 * five-link chain g(n) ≥ g*(n) ≥ C* − h*(n) ≥ C* − h(n)), the stronger
 * per-edge promise (consistency, the triangle inequality) that licenses a
 * permanent closed list, and the four-state counterexample where a
 * merely-admissible h plus a never-reopen closed list returns cost 9 where
 * 8 was available — traced by hand and executed by program.
 *
 * Every `output` / `expectedOutput` is the REAL stdout of running the code
 * with python3 (scripts/verify-one-lesson.ts machine-verifies it).
 * Counterexample arithmetic, pinned and hand-checked: h* = (8, 4, 6, 0);
 * the failing engine pops S(5) A(5) B(8) then refuses A's f = 4 entry and
 * pops G(9); both repairs return S → B → A → G at 8. The repaired h(A) = 4
 * is forced: admissibility caps it at h*(A) = 4 and edge B → A demands
 * h(A) ≥ 6 − 2 = 4.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_08: ClassicalLesson = {
  slug: "a-08",
  title: "Admissibility, Consistency and Optimality",
  minutes: 30,
  summary:
    "When A* is merely admissible-optimal (tree search) and when graph search needs consistency — with the proof and a counterexample.",
  kind: "concept",
  objectives: [
    "Carry out the tree-search optimality argument for A* — the chain g(n) ≥ g*(n) ≥ C* − h*(n) ≥ C* − h(n) — and name the step a closed list can break",
    "State consistency as the triangle inequality h(n) ≤ c(n,n') + h(n') and derive its consequence: f is non-decreasing along every path",
    "Audit a heuristic on the right domain — admissibility per state, consistency per edge — and explain why consistency licenses a permanent closed list",
    "Trace the never-reopen failure by hand and in code on a four-state counterexample, and choose defensibly between the two repairs",
  ],
  why: "The last lesson's program looked innocent: a heap, a relaxation ledger, and one guard line — `if city in came: continue` — that read like bookkeeping. It was actually a theorem with conditions attached, and this lesson is the fine print cashed out. You will prove exactly what admissibility buys (optimality for tree search, via a five-link inequality chain), derive the one-line stronger promise that makes a closed list safe (consistency — the triangle inequality on h), and then watch a four-state graph where a merely-admissible heuristic and a never-reopen closed list conspire to return a path of cost 9 when 8 was on the table — every g, h and f checked by hand and by program. The two repairs — reopen states, or repair the heuristic — are the engineering decision you will actually face the first time you ship A*.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "The last lesson closed on a warning that deserves its own thirty minutes. A*'s optimality argument — the one that licensed stopping the instant Bucharest popped at 418 — was an argument about *tree search*, where the frontier holds one entry per path and never forgets a route. The program that ran it was a *graph search*: one expansion per state, a closed list, and a guard line that looked like bookkeeping and was in fact a theorem with conditions attached. It happened to be safe, because straight-line distance is *consistent* — a property this course has named twice (a-05's second promise, a-07's fine print) but never yet used. This lesson separates the guarantees cleanly: what admissibility alone truly buys, what consistency additionally buys, and what happens when a heuristic passes the first test and fails the second — on a graph small enough to check every number by hand.",
    },
    // ---------------------------------------------- tree-search optimality
    {
      kind: "math",
      title: "Why the first goal popped is optimal — tree search, h admissible",
      displays: [
        { expr: "f(n) = g(n) + h(n) \\ge C^* \\quad \\text{for every frontier node } n", label: "the claim" },
      ],
      derivation: {
        title: "The chain, and why a suboptimal goal can never win the pop",
        steps: [
          {
            expr: "g(n) \\ge g^*(n)",
            reason: "g(n) is the cost of one actual start-to-n route — the path this frontier entry was reached along; g*(n) is the cheapest of all such routes, so it can only be lower or equal",
          },
          {
            expr: "g^*(n) \\ge C^* - h^*(n)",
            reason: "g*(n) + h*(n) is the cost of the best solution through n, and no through-n solution undercuts the best solution anywhere, which costs C* — rearranged",
          },
          {
            expr: "C^* - h^*(n) \\ge C^* - h(n)",
            reason: "admissibility: h(n) ≤ h*(n), and subtracting the smaller h(n) leaves the larger remainder",
          },
          {
            expr: "f(n) = g(n) + h(n) \\ge (C^* - h(n)) + h(n) = C^*",
            reason: "chain steps 1–3 left to right, then add h(n) to both sides: every frontier node's f bounds the optimum from below",
          },
          {
            expr: "f(n^*) = g_P(n^*) + h(n^*) \\le g_P(n^*) + h^*(n^*) \\le C^*",
            reason: "until an optimal goal pops, the frontier also holds an entry n* lying on an optimal path, carrying that path's prefix cost g_P(n*) as its g — tree search keeps every route; admissibility bounds h(n*) by the true remaining cost h*(n*), which is at most the path's remainder, and prefix plus remainder is exactly C*",
          },
          {
            expr: "f(G) = g(G) > C^* \\ge f(n^*) \\implies G \\text{ cannot pop first}",
            reason: "a suboptimal goal — every real solution costs at least C*, a suboptimal one strictly more — is strictly beaten by n*'s bound, so it is never the frontier's minimum while n* waits; the first goal to pop therefore carries g = C*",
          },
        ],
      },
      caption:
        "Two halves of one argument. Steps 1–4: once a goal pops at C*, nothing left behind could have beaten it — every surviving frontier f is already a lower bound on C*. Steps 5–6: a suboptimal goal can never pop first, because the optimal path always keeps a cheaper-bounded representative waiting in the queue. This is the theorem the last lesson cashed at Bucharest, and every link of it is licensed by admissibility alone.",
    },
    {
      kind: "text",
      text: "So where does the argument stop working for the program you actually run? Its quietest load-bearing assumption is step 5's: that the frontier *holds an entry for the optimal path*. Tree search guarantees this structurally — paths are never merged, so a cheaper route to a state is merely one more line in the queue. Graph search deliberately gives that up: expanding each state once is the entire point of having a state space, and the closed list is the device that enforces it. The price hides in the exchange — if a cheaper route to an already-closed state surfaces later, its entry is refused, and with it dies the proof's live representative of the optimal path. Nothing in the chain above forbids this; the chain simply never asked. The property that does forbid it is stronger than admissibility, and it is one line long.",
    },
    {
      kind: "definition",
      term: "Tree search and graph search",
      informal:
        "Tree search runs on paths: the frontier holds one entry per route, a state may appear many times, and nothing is ever merged — A* is optimal here under admissibility alone. Graph search runs on states: a closed list records every expanded state, each state is expanded at most once, and only the best route found so far to each open state survives.",
      formal: "n \\in \\text{closed} \\implies n \\text{ is never expanded again}",
      why: "That one line is where optimality lives or dies: it is safe when h is consistent (the next block's f-argument makes the first pop final), and it can silently return suboptimal paths when h is merely admissible — the counterexample below.",
    },
    // -------------------------------------------------------- consistency
    { kind: "heading", text: "Consistency: the promise that makes the closed list safe" },
    {
      kind: "math",
      title: "The triangle inequality on h — and f that can only rise",
      displays: [
        { expr: "h(n) \\le c(n, n') + h(n') \\quad \\text{for every edge } (n, n')", label: "consistency (a monotone heuristic)" },
      ],
      derivation: {
        title: "f is non-decreasing along every path",
        steps: [
          {
            expr: "g(n') = g(n) + c(n, n')",
            reason: "the child's g is the parent's g plus the one edge — that is all g ever is",
          },
          {
            expr: "f(n') = g(n) + c(n, n') + h(n')",
            reason: "substitute step 1 into f(n') = g(n') + h(n')",
          },
          {
            expr: "f(n') = g(n) + [c(n, n') + h(n')] \\ge g(n) + h(n) = f(n)",
            reason: "consistency says the bracketed term is at least h(n); replacing it by h(n) can only shrink the sum",
          },
          {
            expr: "f(n_0) \\le f(n_1) \\le \\dots \\le f(n_k)",
            reason: "chain the edge inequality along any path: f never falls from parent to child",
          },
        ],
      },
      caption:
        "This is the license the closed list was waiting for. Suppose a state n is popped while a strictly cheaper route to it still exists; telescoping consistency down that route (the a-05 argument) leaves a frontier entry with f at most g*(n) + h(n) — strictly below f(n) = g(n) + h(n) — so that entry would have popped first, a contradiction. With a consistent h, the first pop of a state already carries its best g: there is nothing to reopen, and the never-again rule is harmless. With a merely-admissible h, f is free to fall along a path — and the falling entry is precisely the one a closed list will refuse.",
    },
    {
      kind: "definition",
      term: "Consistent heuristic",
      informal:
        "A heuristic that obeys the triangle inequality on every edge: the estimate never falls by more than the step cost. Estimating directly from n is never more pessimistic than paying one step to reach n' and estimating from there — a local, edge-by-edge promise, stronger than admissibility's global one (a-05's telescoping showed consistency implies admissibility; the converse is false, and the graph below is the proof).",
      formal: "h(n) \\le c(n, n') + h(n')",
      why: "Consistency is exactly the condition under which f = g + h is non-decreasing along paths — the property that makes a state's first pop final and a permanent closed list safe.",
    },
    // ------------------------------------------------------- counterexample
    { kind: "heading", text: "The counterexample: four states, one blind spot" },
    {
      kind: "stateSpace",
      title: "An admissible heuristic that breaks the triangle inequality",
      graph: {
        nodes: [
          { id: "S", label: "S", sub: "h = 5", x: 8, y: 48, tone: "start" },
          { id: "A", label: "A", sub: "h = 0", x: 46, y: 18 },
          { id: "B", label: "B", sub: "h = 6", x: 38, y: 76 },
          { id: "G", label: "G", sub: "goal · h = 0", x: 90, y: 40, tone: "goal" },
        ],
        edges: [
          { from: "S", to: "A", label: "5" },
          { from: "S", to: "B", label: "2" },
          { from: "B", to: "A", label: "2" },
          { from: "A", to: "G", label: "4" },
        ],
        legend: [
          ["start", "initial state"],
          ["goal", "goal state"],
          ["edge", "one-way road + step cost"],
        ],
        caption:
          "Four states, one-way roads, and a heuristic that is sharp at S and B but blind at A. The optimum runs S → B → A → G for 2 + 2 + 4 = 8; the direct-looking S → A → G costs 5 + 4 = 9. Every h value is globally legal — h(B) = 6 is exactly h*(B), the sharpest value admissibility permits — but crossing the cost-2 edge B → A the estimate must fall from 6 to 0, a fall of 6 against a triangle-inequality budget of 2. That single edge is the entire crack.",
      },
      solutionNote:
        "A solution is any S → G path; the optimum is S → B → A → G at cost 8, while the never-reopen engine returns S → A → G at 9.",
    },
    {
      kind: "math",
      title: "Auditing h: admissible at every state, inconsistent on one edge",
      displays: [
        {
          expr: "h(S) = 5 \\le 8, \\quad h(A) = 0 \\le 4, \\quad h(B) = 6 \\le 6, \\quad h(G) = 0 \\le 0",
          label: "admissibility — against h* = 8, 4, 6, 0",
        },
        { expr: "h(B) = 6 > c(B, A) + h(A) = 2 + 0 = 2", label: "consistency — broken on B → A" },
        { expr: "5 \\le 5 + 0, \\quad 5 \\le 2 + 6, \\quad 0 \\le 4 + 0", label: "the other three edges pass" },
      ],
      caption:
        "The two audits ask different questions on different domains — admissibility is a per-STATE test against h*, consistency a per-EDGE test against the step cost — and here they disagree: h passes the first everywhere and fails the second exactly once. That is the whole geometry of the failure: an admissible h need not be consistent, and the gap between the two tests is where a closed list goes wrong. Every number above is re-checked by machine in the program at the end of this lesson.",
    },
    {
      kind: "example",
      title: "The failure, traced by hand: A* that never reopens",
      problem:
        "Run A* graph search with a permanent closed list on the counterexample graph, from S to G. Record every pop with its g, h and f, what each expansion generates, and stop at the goal.",
      steps: [
        {
          text: "Pop S — g 0, h 5, f 5. Close S.",
          detail:
            "Expansion generates A with g = 0 + 5 = 5, f = 5 + 0 = 5, and B with g = 0 + 2 = 2, f = 2 + 6 = 8. The frontier is A (f 5) against B (f 8): A's blind h = 0 makes the expensive prefix look unbeatable — a loose bound winning the pop, exactly as the f-ordering licenses.",
        },
        {
          text: "Pop A — g 5, h 0, f 5. Close A at g = 5.",
          detail:
            "A's true best g is 4 (via B), so this close is already stale — legal so far, provided a better g can still reopen it. Expansion generates G with g = 5 + 4 = 9, f = 9 + 0 = 9. Frontier: B (f 8), G (f 9).",
        },
        {
          text: "Pop B — g 2, h 6, f 8. Close B.",
          detail:
            "Expansion generates A with g = 2 + 2 = 4 and f = 4 + 0 = 4 — strictly better than A's closed g of 5, and the smallest f the search has ever seen. But A is on the closed list, and the engine's one rule — never reopen — discards the entry. The optimal path's last frontier representative dies here; tree search pops this very entry next and repairs everything.",
        },
        {
          text: "Pop G — g 9, h 0, f 9. Goal — stop.",
          detail:
            "Nothing else is on the frontier. The parent chain reports S → A → G at cost 9 — a route whose every heuristic value passed the admissibility audit.",
        },
        {
          text: "Compare with the optimum.",
          detail:
            "S → B → A → G costs 2 + 2 + 4 = 8. The engine returned 9 — one over — with h admissible at every state and only four pops spent. The reopening engine differs by exactly one pop: it accepts the f = 4 entry, re-expands A at g = 4, and improves G's entry to 8 before G can pop.",
        },
      ],
      result:
        "Never-reopen graph search returns S → A → G at cost 9; the optimum is S → B → A → G at 8 — an admissible h, an honest-looking trace, and a wrong answer.",
    },
    {
      kind: "pythonImpl",
      title: "One engine, three closed-list disciplines — the failure, reproduced",
      intent:
        "Run both audits by machine, then run the same A* three ways on the counterexample graph — tree search, a permanent closed list, and a closed list that reopens — and watch 8, 9, 8 come out the bottom.",
      code: `from heapq import heappush, heappop

# The counterexample: four states, one-way roads.
EDGES = {
    "S": [("A", 5), ("B", 2)],
    "A": [("G", 4)],
    "B": [("A", 2)],
    "G": [],
}
# Sharp at S and B, blind at A: admissible everywhere, inconsistent on B->A.
H = {"S": 5, "A": 0, "B": 6, "G": 0}

def true_cost(start, goal="G"):
    """h*(n): the true cheapest cost from n to the goal (blind search)."""
    frontier, best = [(0, start)], {start: 0}
    while frontier:
        g, n = heappop(frontier)
        if n == goal:
            return g
        for n2, c in EDGES[n]:
            if g + c < best.get(n2, float("inf")):
                best[n2] = g + c
                heappush(frontier, (g + c, n2))
    return float("inf")

print("state audit (admissibility): h(n) <= h*(n)")
for n in ["S", "A", "B", "G"]:
    star = true_cost(n)
    ok = "ok" if H[n] <= star else "VIOLATED"
    print(f"  h({n}) = {H[n]} <= h*({n}) = {star}   {ok}")

print("edge audit (consistency): h(n) <= c(n,n') + h(n')")
for n in ["S", "A", "B"]:
    for n2, c in EDGES[n]:
        ok = "ok" if H[n] <= c + H[n2] else "VIOLATED"
        print(f"  h({n}) = {H[n]} <= {c} + h({n2}) = {c + H[n2]}   {ok}   edge {n}->{n2}")

def a_star(mode):
    """A* from S to G; one engine, three closed-list disciplines.

    "tree":   no closed list -- every path is its own frontier entry
    "closed": permanent closed list -- a closed state is never reopened
    "reopen": closed list, but a strictly cheaper g reopens the state
    """
    frontier = [(H["S"], 0, ("S",))]
    closed = {}                       # state -> the g it was closed with
    while frontier:
        f, g, path = heappop(frontier)
        n = path[-1]
        if mode != "tree" and n in closed and closed[n] <= g:
            continue                  # stale queue entry (lazy deletion)
        if n == "G":
            return " -> ".join(path), g
        if mode != "tree":
            closed[n] = g
        for n2, c in EDGES[n]:
            if mode == "closed" and n2 in closed:
                continue              # the fine print: never reopen
            g2 = g + c
            heappush(frontier, (g2 + H[n2], g2, path + (n2,)))
    return None, None

# The graph is acyclic, so even pure tree search terminates here.
for mode, label in [("tree", "tree search, no closed list"),
                    ("closed", "graph search, never reopen"),
                    ("reopen", "graph search, with reopen")]:
    path, cost = a_star(mode)
    print(f"{label:<28}: {path}   cost {cost}")`,
      output: `state audit (admissibility): h(n) <= h*(n)
  h(S) = 5 <= h*(S) = 8   ok
  h(A) = 0 <= h*(A) = 4   ok
  h(B) = 6 <= h*(B) = 6   ok
  h(G) = 0 <= h*(G) = 0   ok
edge audit (consistency): h(n) <= c(n,n') + h(n')
  h(S) = 5 <= 5 + h(A) = 5   ok   edge S->A
  h(S) = 5 <= 2 + h(B) = 8   ok   edge S->B
  h(A) = 0 <= 4 + h(G) = 4   ok   edge A->G
  h(B) = 6 <= 2 + h(A) = 2   VIOLATED   edge B->A
tree search, no closed list : S -> B -> A -> G   cost 8
graph search, never reopen  : S -> A -> G   cost 9
graph search, with reopen   : S -> B -> A -> G   cost 8`,
      walkthrough: [
        "`true_cost` is blind uniform-cost search — it computes h*(n) with h ≡ 0, so both audits compare h against the truth instead of against hand-asserted constants. The state audit passes 4 of 4; the edge audit passes 3 of 4 and flags B->A — the 6 > 2 the hand audit found.",
        "`a_star(mode)` is one engine with one dial. \"tree\" trusts no memory: each path is its own frontier entry (it terminates because the graph is acyclic). \"closed\" is the lesson's failing engine. \"reopen\" re-expands a closed state the moment a strictly cheaper g arrives.",
        "The three result lines are the lesson in miniature: 8 (tree — admissibility was enough), 9 (never reopen — the counterexample), 8 (reopen — the repair). Same graph, same h, same f-ordering; only the memory policy differs.",
        "Notice what the failing engine did NOT do: expand anything twice. The wrong answer cost exactly four pops — efficiency was never the problem, correctness was.",
        "Trace the failing line against the hand example: S (f 5), A (f 5), B (f 8), then B's f = 4 entry for A is discarded by the `mode == \"closed\"` guard, and G pops at 9 — the trace above, reproduced number for number.",
      ],
      project:
        "The Part A project's two 8-puzzle heuristics (misplaced tiles, Manhattan) are consistent by construction — every slide changes each by at most 1, the slide's cost — which is why its shared engine may ship with a permanent closed list.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The engineering choice: reopen, or repair",
      text: "Two safe designs, one silent failure. If you can *prove consistency* — one triangle-inequality check per edge, a single O(|E|) pass — the permanent closed list is licensed and your A* never expands a state twice. If your heuristic is merely admissible (or proving consistency is impractical), keep the closed list but *reopen* a state when a strictly cheaper g arrives: correctness is restored for any admissible h, and the price is measurable — re-expansions that each strictly lower a g, so there can only be finitely many. What you may not do is keep the never-reopen rule with an unproven h: that is the counterexample above, and it fails silently — cost 9 returned with a straight face. One honest footnote: scaling h down by some α < 1 does repair consistency in principle, but the α that clears a violation h(n) − h(n') > c must satisfy α ≤ c/(h(n) − h(n')) — here 2/6 = 1/3 — and a heuristic scaled toward zero is uniform-cost search in disguise.",
    },
    // ------------------------------------------------------------ practice
    {
      kind: "exercise",
      id: "a-08-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague hands you a tiny directed graph — S → X costs 3, X → G costs 3, S → G costs 10 — and a proposed heuristic h(S) = 4, h(X) = 2, h(G) = 0. The true costs to the goal are h*(S) = 6, h*(X) = 3, h*(G) = 0. Which verdict is correct?",
      options: [
        {
          text: "Admissible and consistent — every state passes h(n) ≤ h*(n) and every edge passes h(n) ≤ c(n,n') + h(n')",
          correct: true,
          feedback:
            "Correct. Admissibility: 4 ≤ 6, 2 ≤ 3, 0 ≤ 0. Consistency: S → X gives 4 ≤ 3 + 2 = 5, X → G gives 2 ≤ 3 + 0 = 3, S → G gives 4 ≤ 10 + 0 = 10. All seven checks pass — the permanent closed list is licensed.",
        },
        {
          text: "Inadmissible, because h(S) = 4 is less than the true cost h*(S) = 6",
          correct: false,
          feedback:
            "Admissibility forbids OVERestimates: h(n) ≤ h*(n). An estimate below the truth is exactly what a legal heuristic is — 4 ≤ 6 is the permitted direction, not a violation.",
        },
        {
          text: "Admissible but inconsistent — along S → X the estimate falls from 4 to 2, and a fall is never allowed",
          correct: false,
          feedback:
            "Falls ARE allowed, up to the step cost: the fall here is 2 and the edge costs 3, so the test reads 4 ≤ 3 + 2 = 5 — it passes. The triangle inequality caps the fall by the edge cost; it does not forbid falls.",
        },
        {
          text: "Consistent but inadmissible — h(X) = 2 underestimates h*(X) = 3 by 1",
          correct: false,
          feedback:
            "Underestimating never breaks admissibility, and the combination 'consistent but inadmissible' is impossible when h(goal) = 0: a-05's telescoping proof shows consistency implies admissibility.",
        },
      ],
      solution:
        "Admissible and consistent. Per-state: 4 ≤ 6, 2 ≤ 3, 0 ≤ 0. Per-edge: S → X gives 4 ≤ 3 + 2 = 5; X → G gives 2 ≤ 3 + 0 = 3; S → G gives 4 ≤ 10 + 0 = 10. All checks pass, so graph search may keep its closed list.",
      explanation:
        "Run both tests on their proper domains — states for admissibility, edges for consistency — and compute every comparison. This h is the good case (unlike the lesson's); the verdict is earned by three edge computations, not by pattern-matching to the counterexample.",
      concepts: ["admissibility", "consistency"],
    },
    {
      kind: "exercise",
      id: "a-08-e2",
      exerciseKind: "predict-output",
      prompt:
        "The lesson's failing engine, with the heuristic repaired: h(A) raised from 0 to 4 — the value the edges force, since admissibility caps h(A) at h*(A) = 4 and the violated B → A edge demands h(A) ≥ 6 − 2 = 4 — and everything else untouched, including the permanent closed list. Without running it, what exactly does this program print?",
      starter: `from heapq import heappush, heappop

EDGES = {"S": [("A", 5), ("B", 2)], "A": [("G", 4)], "B": [("A", 2)], "G": []}
# The lesson's h, with the one repair the edges force: h(A) = 4, not 0.
H = {"S": 5, "A": 4, "B": 6, "G": 0}

def a_star_closed(start="S", goal="G"):
    """A* with a permanent closed list -- the lesson's failing engine."""
    frontier = [(H[start], 0, (start,))]
    closed = set()
    while frontier:
        f, g, path = heappop(frontier)
        n = path[-1]
        if n in closed:
            continue
        if n == goal:
            return " -> ".join(path), g
        closed.add(n)
        for n2, c in EDGES[n]:
            if n2 not in closed:
                g2 = g + c
                heappush(frontier, (g2 + H[n2], g2, path + (n2,)))
    return None, None

path, cost = a_star_closed()
print(f"{path}   cost {cost}")`,
      expectedOutput: "S -> B -> A -> G   cost 8",
      solution:
        "It prints `S -> B -> A -> G   cost 8`. With h(A) = 4, the entry for A via S has f = 5 + 4 = 9, which no longer beats B's f = 2 + 6 = 8 — so B pops first. B's expansion generates A at g = 4 with f = 4 + 4 = 8 (A is not yet closed, so the entry is legal), and that entry wins the next pop against the stale f = 9 one. A closes with its optimal g the first time, G is generated at g = 8, and the closed list never has anything to refuse.",
      explanation:
        "The repair changes the pop order at exactly one point — A via S (f = 9) versus B (f = 8) — and that single swap is enough: the state now closes with its best g immediately. Same engine, same never-reopen rule, optimal answer; the f-monotonicity corollary, cashed.",
      concepts: ["consistency", "A*"],
    },
    {
      kind: "exercise",
      id: "a-08-e3",
      exerciseKind: "trace",
      prompt:
        "Trace the third engine — A* with a closed list that reopens on improvement — on the original, broken heuristic (h(A) = 0). List every pop in order with its g, h and f, mark the one pop the never-reopen engine refuses, and state the returned path and cost.",
      solution:
        "1) Pop S: g 0, h 5, f 5 — push A (g 5, f 5) and B (g 2, f 8); close S. 2) Pop A: g 5, h 0, f 5 — push G (g 9, f 9); close A at g 5. 3) Pop B: g 2, h 6, f 8 — its expansion finds A at g = 2 + 2 = 4, f = 4 + 0 = 4, strictly cheaper than the closed g = 5, so the entry is pushed and A will reopen; close B. 4) Pop A a second time: g 4, h 0, f 4 — THIS is the pop the never-reopen engine refuses. A re-closes at g 4 and its expansion improves G's entry to g = 4 + 4 = 8, f = 8. 5) Pop G: g 8, h 0, f 8 — goal. Return S → B → A → G at cost 8, the optimum, for the price of exactly one re-expansion.",
      explanation:
        "The re-expansion is the entire difference between 9 and 8: one extra pop of A at g = 4 repairs G's frontier entry from 9 to 8 before G can surface. Reopening buys back the tree-search guarantee at a bounded price — each re-expansion strictly lowers a state's g, so there can only be finitely many of them.",
      concepts: ["graph search", "reopening", "A*"],
    },
  ],
  terms: [
    {
      term: "tree search",
      definition:
        "Search over paths: the frontier holds one entry per route, a state may appear once per path that reaches it, and A* is optimal here under admissibility alone.",
    },
    {
      term: "graph search",
      definition:
        "Search over states: a closed list expands each state at most once. Optimal without reopening only when h is consistent — the license this lesson proves and the counterexample stress-tests.",
    },
    {
      term: "consistent heuristic",
      definition:
        "h satisfying h(n) ≤ c(n,n') + h(n') on every edge — the triangle inequality. It makes f non-decreasing along paths, so a state's first pop carries its best g and the closed list is safe.",
    },
    {
      term: "reopening",
      definition:
        "The graph-search repair for inconsistent h: when a strictly cheaper g arrives for a closed state, take the state off the closed list and expand it again. Restores optimality for any admissible h, at the measurable price of re-expansions.",
    },
  ],
  mistakes: [
    {
      mistake: "Assuming admissibility alone makes graph-search A* optimal.",
      why:
        "The tree-search proof needs the frontier to hold a live entry for the optimal path; a closed list can refuse exactly that entry — the moment B's f = 4 route to A was discarded, the optimum became unreachable.",
      fix:
        "Prove consistency (one check per edge) or implement reopening. Admissibility is the per-state property; the closed list needs the per-edge one.",
    },
    {
      mistake: "Auditing consistency by spot-checking states.",
      why:
        "Admissibility is a per-state obligation (h(n) ≤ h*(n)) and consistency a per-edge one (h(n) ≤ c(n,n') + h(n')); no number of state-wise samples can discharge an edge-wise inequality.",
      fix:
        "One pass over the edge list — O(|E|) — testing the triangle inequality on each edge. The lesson's program shows the audit is four lines of code.",
    },
    {
      mistake: "Repairing inconsistency with a token scale-down of h.",
      why:
        "Violations shrink only proportionally: on the lesson's B → A edge, 0.9 × 6 = 5.4 still exceeds the budget of 2. The α that clears it must satisfy α ≤ 2/6 = 1/3, and h scaled that far toward zero is uniform-cost search in disguise.",
      fix:
        "Repair the blind spot directly — raise h at the under-priced state. Here the edges force h(A) = 4 exactly: admissibility caps it at h*(A) = 4, and B → A demands at least 6 − 2.",
    },
    {
      mistake: "Treating the closed list as a harmless optimization.",
      why:
        "With an inconsistent h it changes which answers are reachable — a correctness device, not a speed device. The same engine returns 9 without reopening and 8 with it, at four pops versus five.",
      fix:
        "Decide the closed-list policy together with the heuristic's proof obligations: consistency proven → never reopen; otherwise → reopen and measure.",
    },
  ],
  takeaways: [
    "Tree-search A* is optimal under admissibility alone — the chain g(n) ≥ g*(n) ≥ C* − h*(n) ≥ C* − h(n) bounds every frontier alternative, and an optimal-path entry always out-bounds a suboptimal goal.",
    "Consistency is the triangle inequality h(n) ≤ c(n,n') + h(n') — the local, per-edge promise. It makes f non-decreasing along paths, so a state's first pop is final and the closed list is safe.",
    "Admissible does not imply consistent: four states suffice for an h that passes every state test and fails one edge test — and a never-reopen closed list turns that single edge into a cost-9 answer to a cost-8 question.",
    "The two repairs are exact complements: reopen states (correct for any admissible h, priced in re-expansions) or repair h to consistency (h(A) = 4 here — forced by the edges, not chosen).",
    "Audit on the right domain: admissibility per state against h*, consistency per edge against the step cost — both are cheap, exact, and the only honest way to license a closed list.",
  ],
  quiz: [
    {
      id: "a-08-q1",
      prompt: "In the counterexample trace, the never-reopen engine returned S → A → G at cost 9. At which exact moment did the optimum become unreachable?",
      options: [
        {
          text: "When B was expanded: the entry for A at g = 4 (f = 4, the smallest f the search ever saw) was refused because A was already closed — the optimal path's last frontier representative",
          correct: true,
          feedback:
            "Exactly. The f = 4 entry was the optimal route's final live representative; refusing it left G reachable only through A's stale g = 5, and the 9 was locked in.",
        },
        {
          text: "When A was expanded at g = 5: closing A was itself the error",
          correct: false,
          feedback:
            "Closing a state with a suboptimal g is not yet an error — the reopening engine closes A at 5 too, and still returns 8. The sin is refusing the better g when it arrives.",
        },
        {
          text: "When G was generated at g = 9: pushing the goal locked in the suboptimal cost",
          correct: false,
          feedback:
            "A frontier entry is not a commitment — the reopening engine improves G's entry to 8 a moment later. Lock-in happens at the pop, and only because A could not be re-expanded.",
        },
        {
          text: "When S chose to expand A before B",
          correct: false,
          feedback:
            "That pop was correct bookkeeping: f(A) = 5 < f(B) = 8, and tree search makes the same pop and still returns 8. The ordering was fine; the memory policy was not.",
        },
      ],
      explanation:
        "The optimum died at B's expansion — the discarded f = 4 entry was the last live representative of the optimal path. Every earlier moment was legal under the rules the engine had chosen.",
    },
    {
      id: "a-08-q2",
      prompt: "Which single change to the lesson's setup restores optimality WITHOUT touching the engine's closed-list policy?",
      options: [
        {
          text: "Raise h(A) from 0 to 4 — the value the edges force — making h consistent (the B → A test becomes 6 ≤ 2 + 4 = 6)",
          correct: true,
          feedback:
            "Correct, and the repair is forced rather than chosen: admissibility caps h(A) at h*(A) = 4 and the violated edge demands h(A) ≥ 6 − 2. With h consistent, A's first pop carries its best g and there is nothing to refuse.",
        },
        {
          text: "Make h admissible",
          correct: false,
          feedback:
            "It already is — the state audit passed 4 checks out of 4. The closed list needs the edge-wise property, not the state-wise one.",
        },
        {
          text: "Recognize the goal when it is generated rather than popped",
          correct: false,
          feedback:
            "That returns 9 even sooner: G is generated at 9 via A, and a generation-time test would stop right there — the previous lesson's bug stacked on this one.",
        },
        {
          text: "Break frontier ties in favor of larger g",
          correct: false,
          feedback:
            "No tie is involved: the f = 4 entry beats everything strictly. Tie-breaking can only rearrange entries that exist — the closed list deleted this one.",
        },
      ],
      explanation:
        "Raising h(A) to 4 repairs the one violated edge, which is exactly what the f-monotonicity corollary requires: the first pop of a state is final, and the never-reopen rule becomes harmless.",
    },
    {
      id: "a-08-q3",
      prompt:
        "A route-planning team has a heuristic they have PROVEN admissible but suspect is inconsistent; repairing it looks expensive. Their state graph has hub states reachable by hundreds of routes. What should they ship?",
      options: [
        {
          text: "A* with reopening: optimality holds for any admissible h, and the re-expansions are a measured price — bounded, since each one strictly lowers a state's g",
          correct: true,
          feedback:
            "The safe default when consistency is unproven: the guarantee matches exactly what has been proven, and hubs — states with many routes — are precisely where reopening earns its keep.",
        },
        {
          text: "The permanent closed list as-is, accepting occasional suboptimality",
          correct: false,
          feedback:
            "'Occasional' is unquantified and the failures are silent — a route planner returning 9 for an 8 is a correctness bug, not a trade-off. If suboptimality is genuinely acceptable, that is weighted A*, a deliberate algorithm choice — not an accident of an unproven h.",
        },
        {
          text: "Scale h down by 10% to smooth out the violations",
          correct: false,
          feedback:
            "Violations shrink proportionally: the lesson's B → A edge would read 0.9 × 6 = 5.4 against a budget of 2 — still broken. The α that clears it is at most 2/6 = 1/3, and h scaled that far down has discarded nearly all of its guidance.",
        },
        {
          text: "Sample a few thousand states and verify h looks safe on them",
          correct: false,
          feedback:
            "Consistency is a per-EDGE obligation; no number of state-wise spot checks can discharge it. The real audit is one O(|E|) pass over the edge list — cheap enough to do exactly, which is the only way to do it.",
        },
      ],
      explanation:
        "With admissibility proven and consistency in doubt, reopening is the safe default — and if the O(|E|) audit is affordable, running it first is even better: it may reveal the h was consistent all along.",
    },
  ],
};
