/**
 * PART A · MODULE 2 · "Heuristics and Greedy Best-First" — lesson a-06,
 * "Greedy Best-First Search".
 *
 * The first algorithm that acts on a heuristic: order the frontier by the
 * estimate alone. Fast, memory-light, and not optimal — documented to the
 * kilometre (450 vs 418 on the Romania map) so that a-07 has a wound to heal.
 *
 * Every `output` is the REAL output of running the code
 * (scripts/verify-one-lesson.ts machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_A_06: ClassicalLesson = {
  slug: "a-06",
  title: "Greedy Best-First Search",
  minutes: 25,
  summary:
    "Follow the heuristic alone: fast, memory-light, and unapologetically not optimal — with a trace to prove it.",
  kind: "coding",
  objectives: [
    "State greedy best-first's evaluation function and trace it by hand on the Romania map with straight-line distances",
    "Explain precisely why greedy returns the 450 km route when the 418 km optimum exists — the g-blindness argument",
    "State greedy's guarantees honestly: when it is fast, why it is never optimal, and how it can loop forever on graphs with cycles",
    "Define frontier ordering as the design axis of the search family, and informedness as what a sharper heuristic buys",
    "Implement greedy best-first in Python with a priority frontier and verify its expansion order and route cost",
  ],
  why: "Sometimes you do not need the best route — you need a good route now, on a machine that cannot afford to expand a continent of alternatives. Greedy best-first search is the honest name for following your compass: order the frontier by the estimated distance to the goal and charge at whatever looks closest, expanding four cities where uniform-cost expands thirteen. This lesson runs that policy by hand on the Romania map and watches it fail in a fully documented way — a 450 km answer to a 418 km question, traceable to one decision, 176 versus 193, that the algorithm was never equipped to question. The precision matters because greedy is the first algorithm in this course whose failure is structural rather than accidental, and diagnosing it exactly — the estimate cannot see money already spent — is the entire motivation for A*, where heuristic search becomes reliable. You will leave able to say what following the heuristic alone buys, what it costs, and when that trade is the right one to accept.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "You have already met the route this lesson ends on. Breadth-first search walked into it in lesson a-03, blind to costs; iterative deepening certified it in a-04 as the fewest-roads optimum; both settled for Arad → Sibiu → Făgăraș → Bucharest at 450 km while uniform-cost searched the whole map for the 418 km answer. Now put a compass in the search's hand. Lesson a-05 manufactured the compass — straight-line distance to Bucharest, the relaxation *travel as the crow flies* — and this lesson builds the first algorithm that trusts it completely: at every step, expand the frontier city that *looks* closest to the goal, by estimate alone. Four expansions later the search hands you a route. It is the 450 km route again, arrived at with a compass this time — and the precision with which you can explain *why the compass was not enough* is the real deliverable of the lesson.",
    },
    {
      kind: "math",
      title: "The greedy rule",
      displays: [
        { expr: "\\text{pop } n : h(n) = \\min_{m \\in F} h(m)", label: "greedy best-first" },
      ],
      caption:
        "F is the frontier, h(n) the estimated cost still to go from n. That is the entire evaluation function — not g + h, not a weighted blend, just the estimate of the road ahead. Everything in this lesson, the four-expansion sprint and the 450 km error alike, follows from this one line.",
    },
    {
      kind: "definition",
      term: "Greedy best-first search",
      informal:
        "Best-first search that evaluates every frontier node by its heuristic alone and always expands the node that looks closest to the goal — 'greedy' because it grabs the best-looking estimate at each step with no regard for what the trip has already cost.",
      formal: "f(n) = h(n)",
      why: "The design axis of this whole family is which number the priority reads. A* — the next lesson — keeps both terms in f = g + h; greedy is that function with g dropped, and the trace below is the price of the omission.",
    },
    {
      kind: "algorithm",
      name: "Greedy Best-First Search",
      family: "Informed search",
      problem:
        "Find a path from a start state to a goal in a weighted graph, given a heuristic h(n) that estimates the remaining cost.",
      idea:
        "Expand the frontier node with the smallest h — the state that looks closest to the goal, by estimate alone. Cost already incurred plays no part in the ordering, so the search sprints down whichever road the heuristic likes best and commits to the first goal route it generates.",
      strategy: [
        "Put the start on a priority frontier keyed by h.",
        "Pop the frontier node with the smallest h; skip stale entries.",
        "If it is a goal, stop — the first route found is the answer.",
        "Push every unexpanded successor keyed by its h; never consult g.",
      ],
      guarantees: [
        "Not optimal — on this lesson's Romania trace it returns the 450 km route while the 418 km optimum exists",
        "Complete on finite graphs only with an expanded set; without one, cycles can walk it in circles forever",
        "Time O(b^m) in the worst case, but often dramatically fewer expansions — four on Romania, where uniform-cost expands thirteen",
        "Space O(b^m) in the worst case, though in practice the frontier holds only the narrow band of states the heuristic likes",
      ],
      useWhen: [
        "A good route now beats the best route eventually — real-time behavior, prototypes, first-pass estimates",
        "The heuristic is decent and the time or memory budget is tight",
        "Something else will verify or repair the answer, or you only need feasibility, not optimality",
      ],
      pitfalls: [
        "g-blindness: the priority cannot weigh cost already spent, so an expensive-but-close route always beats a cheap-but-far one",
        "The goal pops the moment it is generated — h = 0 outranks every estimate, so no comparison of routes ever happens",
      ],
    },

    // ------------------------------------------------------------ the trace
    { kind: "heading", text: "The trace, by hand" },
    {
      kind: "table",
      title: "Straight-line distance to Bucharest — the h this search runs on",
      headers: ["City", "h (km)", "City", "h (km)"],
      rows: [
        ["Arad", "366", "Lugoj", "244"],
        ["Zerind", "374", "Mehadia", "241"],
        ["Oradea", "380", "Drobeta", "242"],
        ["Sibiu", "253", "Craiova", "160"],
        ["Timișoara", "329", "R. Vâlcea", "193"],
        ["Făgăraș", "176", "Pitești", "100"],
        ["Bucharest", "0", "Giurgiu", "77"],
      ],
      caption:
        "The canonical table, one entry per city: the crow-flies kilometres to Bucharest. Lesson a-05 derived it as the relaxation *travel as the crow flies* — no road ever built is shorter than a ruler, so no entry overstates the remaining drive. It is the same table the A* lesson runs with next; the two algorithms will read it very differently.",
    },
    {
      kind: "example",
      title: "Greedy from Arad, expansion by expansion",
      problem:
        "Run greedy best-first by hand from Arad to Bucharest with the table above as h. Which cities get expanded, in what order, and what does the returned route cost?",
      steps: [
        {
          text: "Expand Arad — h 366, the farthest start on the table.",
          detail:
            "Three roads generate Zerind (h 374), Sibiu (h 253) and Timișoara (h 329). Ordered by estimate alone, the frontier already reads Sibiu, Timișoara, Zerind.",
        },
        {
          text: "Pop Sibiu — the smallest estimate, 253.",
          detail:
            "Sibiu's expansion generates Făgăraș (h 176), R. Vâlcea (h 193) and Oradea (h 380) along roads of 99, 80 and 151 km. None of those road costs is consulted — the frontier cares only that 176 < 193 < 329 < 374 < 380.",
        },
        {
          text: "The decisive comparison: 176 against 193.",
          detail:
            "Făgăraș looks 17 km closer to Bucharest than R. Vâlcea, so greedy pops Făgăraș. That is the whole decision. The costs so far — 239 km to Făgăraș against 220 km to R. Vâlcea — and the roads still ahead — 211 direct against 97 + 101 through Pitești — never enter a comparison the evaluation function cannot run.",
        },
        {
          text: "Bucharest enters the frontier — and pops immediately.",
          detail:
            "Făgăraș's other neighbour, Sibiu, is already expanded and skipped. Bucharest arrives with h = 0, and nothing on the frontier can beat 0: R. Vâlcea (193), Timișoara (329), Zerind (374) and Oradea (380) are all stranded where they sit.",
        },
      ],
      result:
        "Four expansions — Arad, Sibiu, Făgăraș, Bucharest — and the route Arad → Sibiu → Făgăraș → Bucharest at 140 + 99 + 211 = 450 km. The 418 km optimum through R. Vâlcea and Pitești is never expanded: R. Vâlcea sat on the frontier the whole time, outvoted 193 to 176.",
    },
    {
      kind: "searchTree",
      title: "Greedy from Arad: the entire search",
      legend: "g = road cost so far · h = straight line to Bucharest · edge = road cost (km)",
      root: {
        id: "arad",
        label: "Arad",
        cost: 0,
        heuristic: 366,
        status: "root",
        children: [
          { id: "zerind", label: "Zerind", cost: 75, heuristic: 374, status: "muted", edge: "75" },
          {
            id: "sibiu",
            label: "Sibiu",
            cost: 140,
            heuristic: 253,
            status: "expanded",
            edge: "140",
            children: [
              {
                id: "fagaras",
                label: "Fagaras",
                cost: 239,
                heuristic: 176,
                status: "expanded",
                edge: "99",
                children: [
                  { id: "bucharest", label: "Bucharest", cost: 450, heuristic: 0, status: "goal", edge: "211" },
                ],
              },
              { id: "rvilcea", label: "R.Vilcea", cost: 220, heuristic: 193, status: "frontier", edge: "80" },
              { id: "oradea", label: "Oradea", cost: 291, heuristic: 380, status: "muted", edge: "151" },
            ],
          },
          { id: "timisoara", label: "Timisoara", cost: 118, heuristic: 329, status: "muted", edge: "118" },
        ],
      },
      caption:
        "Every node carries both g and h — and the search only ever reads h. Each of the four expansions takes the smallest estimate on its frontier: Arad (366) is the only choice, then Sibiu (253), then Făgăraș (176), then Bucharest (0), which pops the moment it is generated. R. Vâlcea — g 220, h 193 — sits on the frontier for the entire run: it lost to Făgăraș 193 to 176 the instant both appeared, even though the road to it was 19 km cheaper and its route to Bucharest, 97 + 101 through Pitești, is the optimal one. The g column sits right there, unused.",
    },
    {
      kind: "text",
      text: "The failure has a name you will keep for the rest of the course: **g-blindness**. *h(n)* estimates the cost still to go — it is a claim about the road ahead, and (straight-line distance being admissible, a-05) an honest one. But the cost still to go is not the cost of the trip. When Făgăraș (h 176) and R. Vâlcea (h 193) met on the frontier, the comparison greedy ran was 176 < 193, and that is the entire comparison: that reaching Făgăraș had already cost 239 km while R. Vâlcea sat at 220 never entered it, because *g(n)* is not in the evaluation function. So R. Vâlcea is never expanded — not considered and rejected, simply outvoted by a number that cannot see the bill behind. Notice, too, how the ending works: the moment Bucharest entered the frontier, its h = 0 outranked every estimate left, so greedy returns the *first* goal route it happens to generate. No amount of cleverness in h fixes either defect — the next lesson heals both at once by keeping the compass and restoring the ledger, ordering the frontier by f(n) = g(n) + h(n).",
    },
    {
      kind: "pythonImpl",
      title: "Greedy best-first on the Romania map",
      intent:
        "The hand trace, machine-confirmed: watch greedy take the straight shot through Sibiu and Făgăraș, pay 450 km for it, and leave four cities unexpanded on the frontier.",
      code: `from heapq import heappush, heappop

ROMANIA = {
    "Arad":      [("Zerind", 75), ("Sibiu", 140), ("Timisoara", 118)],
    "Zerind":    [("Oradea", 71), ("Arad", 75)],
    "Oradea":    [("Sibiu", 151), ("Zerind", 71)],
    "Sibiu":     [("Fagaras", 99), ("R.Vilcea", 80), ("Arad", 140), ("Oradea", 151)],
    "Timisoara": [("Lugoj", 111), ("Arad", 118)],
    "Lugoj":     [("Mehadia", 70), ("Timisoara", 111)],
    "Mehadia":   [("Drobeta", 75), ("Lugoj", 70)],
    "Drobeta":   [("Craiova", 120), ("Mehadia", 75)],
    "Craiova":   [("R.Vilcea", 146), ("Pitesti", 138), ("Drobeta", 120)],
    "R.Vilcea":  [("Sibiu", 80), ("Craiova", 146), ("Pitesti", 97)],
    "Fagaras":   [("Bucharest", 211), ("Sibiu", 99)],
    "Pitesti":   [("R.Vilcea", 97), ("Craiova", 138), ("Bucharest", 101)],
    "Bucharest": [("Fagaras", 211), ("Pitesti", 101), ("Giurgiu", 90)],
    "Giurgiu":   [("Bucharest", 90)],
}
# straight-line distance to Bucharest -- the admissible table of a-05
SLD = {"Arad": 366, "Zerind": 374, "Oradea": 380, "Sibiu": 253, "Timisoara": 329,
       "Lugoj": 244, "Mehadia": 241, "Drobeta": 242, "Craiova": 160, "R.Vilcea": 193,
       "Fagaras": 176, "Pitesti": 100, "Bucharest": 0, "Giurgiu": 77}

def greedy(start, goal):
    frontier = [(SLD[start], 0, start)]        # (h, g, city): the key is h alone
    parent, expanded = {start: None}, []
    while frontier:
        h, g, city = heappop(frontier)
        if city in expanded:                   # stale queue entry
            continue
        expanded.append(city)
        if city == goal:
            return expanded, g, parent
        for nxt, step in ROMANIA[city]:
            if nxt not in parent:              # first discovery fixes the route
                parent[nxt] = city
                heappush(frontier, (SLD[nxt], g + step, nxt))
    return expanded, None, parent

expanded, cost, parent = greedy("Arad", "Bucharest")
path, node = [], "Bucharest"
while node is not None:
    path.append(node)
    node = parent[node]
path.reverse()

print("expansion order :", " -> ".join(expanded))
print("route           :", " -> ".join(path))
print("cost            :", cost)
print("expansions      :", len(expanded))`,
      output: `expansion order : Arad -> Sibiu -> Fagaras -> Bucharest
route           : Arad -> Sibiu -> Fagaras -> Bucharest
cost            : 450
expansions      : 4`,
      walkthrough: [
        "The frontier holds `(h, g, city)` triples — but Python's heap orders by the first field, so the key is h alone; g rides along as ballast, totted up only when the goal pops. Move g to the front of the tuple and you would recover uniform-cost search; add the two fields and you have A*.",
        "The `expanded` list is the closed set. Greedy has no native objection to revisiting — h does not shrink along a walk — so on a graph something must remember, or a cyclic map can loop the search forever (the card's honesty about completeness).",
        "`parent` records the first road that reached each city. There is no relaxation ledger like a-07's `best_g`: with an h-only key, a cheaper way to reach a city would not change its priority anyway.",
        "All fourteen h values are distinct, so no tie ever fires and the run is fully deterministic — your hand trace and this output are the same object.",
        "Four expansions, 450 km. Uniform-cost on the same map expands all thirteen cities; A* lands the optimal 418 in six. Greedy is the fastest and the wrongest of the three — by design.",
      ],
      project:
        "The frontier discipline here — pop by key, skip stale, record parents — is the one the Part A project's search harness reuses for all three engines, informed and uninformed alike.",
    },

    // ------------------------------------------------------------ what h is worth
    { kind: "heading", text: "What the heuristic is worth" },
    {
      kind: "definition",
      term: "Informedness",
      informal:
        "How much a heuristic knows. h₂ is more informed than h₁ when both are admissible and h₂'s estimate is at least as large at every state — a tighter lower bound on the truth, the way Manhattan distance dominates misplaced tiles in a-05.",
      formal: "h_1(n) \\le h_2(n) \\le h^*(n) \\quad \\forall n",
      why: "More informed heuristics let an informed search prune more. But no degree of informedness makes greedy optimal: the ladder climbs all the way to h = h*, the perfect heuristic, and the g term is still missing from the key.",
    },
    {
      kind: "text",
      text: "What informedness sells greedy is speed, and the purchase is real: straight-line distance drove the search through four cities, where uniform-cost must expand every city with g < 418 — twelve of them — before Bucharest itself pops. What no level of informedness sells is correctness. Climb a-05's dominance ladder to its top, h = h*, and greedy still fails on any map where the route that looks closer is not the route that is cheaper — the one number the ordering reads is silent about money already spent. The second exercise below hands you exactly such a map. Speed is the dial informedness turns; optimality was never in the shop, and buying it back is the next lesson's f(n) = g(n) + h(n).",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "a-06-e1",
      exerciseKind: "predict-output",
      prompt:
        "Without running it: in the program above, which city is the THIRD to be expanded? Type the city name exactly as the program spells it.",
      expectedOutput: "Fagaras",
      solution: "Fagaras",
      explanation:
        "Arad expands first (h 366), generating Zerind (374), Sibiu (253) and Timișoara (329). Sibiu's 253 is the smallest, so Sibiu expands second, generating Făgăraș (176), R. Vâlcea (193) and Oradea (380). The frontier now reads Făgăraș 176, R. Vâlcea 193, Timișoara 329, Zerind 374, Oradea 380 — so Făgăraș is the third expansion, and Bucharest (h 0) pops fourth to end the run.",
      concepts: ["greedy best-first", "frontier ordering"],
    },
    {
      kind: "exercise",
      id: "a-06-e2",
      exerciseKind: "trace",
      prompt:
        "Five towns, roads running both ways: Trailhead–A = 30, A–Goal = 2, Trailhead–B = 1, B–C = 1, C–Goal = 9. A surveyor hands you the perfect heuristic — the exact remaining road distance to Goal, h = h*: h(Trailhead) = 11, h(A) = 2, h(B) = 10, h(C) = 9, h(Goal) = 0. Run greedy best-first by hand from Trailhead and answer four things: the expansion order, the route returned and its cost, the optimal route and its cost, and whether the heuristic is at fault. Then say what uniform-cost search — with no heuristic at all — would have returned.",
      solution:
        "Greedy expands Trailhead (h 11); the frontier holds A (h 2) against B (h 10), so A pops; A's expansion generates Goal (h 0); Goal pops next. Expansion order: Trailhead, A, Goal — three expansions, route Trailhead → A → Goal at 30 + 2 = 32. The optimal route is Trailhead → B → C → Goal at 1 + 1 + 9 = 11. The heuristic is not at fault — it is exactly h*, the top of a-05's dominance ladder, admissible with zero slack. The fault is the ordering: reading h alone, greedy cannot see that A cost 30 to reach while B cost 1. Uniform-cost, blind but honest, expands Trailhead, B, C and pops Goal at 11 — the optimum, with no heuristic at all.",
      explanation:
        "This is the lesson's diagnosis at its sharpest: no heuristic can rescue an evaluation function that ignores g, because h is silent about cost already sunk. Greedy fails here with the best heuristic that could ever exist — and it fails having expanded fewer nodes than the algorithm that got the right answer. Speed and correctness are different dials; only one of them is attached to greedy.",
      concepts: ["greedy best-first", "g-blindness", "informedness"],
    },
  ],
  terms: [
    {
      term: "greedy best-first search",
      definition:
        "Best-first search that evaluates frontier nodes by h(n) alone, always expanding the one estimated closest to the goal; fast and memory-light in practice, with no optimality guarantee and no termination guarantee on cyclic graphs without an expanded set.",
    },
    {
      term: "frontier ordering",
      definition:
        "The discipline that defines a search algorithm: which frontier node to expand next. Breadth-first orders by shallowness, depth-first by recency, uniform-cost by g, greedy by h, A* by g + h — five algorithms, one design axis.",
    },
    {
      term: "g-blindness",
      definition:
        "The structural defect of an h-only ordering: the priority cannot see cost already incurred, so an expensive route that looks close always beats a cheap route that looks far. Greedy's 450-instead-of-418 in one word.",
    },
    {
      term: "informedness",
      definition:
        "How much a heuristic knows: h₂ is more informed than h₁ when both are admissible and h₂(n) ≥ h₁(n) everywhere — a-05's dominance. It buys expansion counts, never guarantees.",
    },
  ],
  mistakes: [
    {
      mistake: "Expecting greedy to return the cheapest route because the heuristic is admissible.",
      why:
        "Admissibility constrains the estimate — never overstate the road ahead — but greedy never adds the estimate to the cost so far, so the optimality guarantee has nowhere to attach. Romania's table is admissible and greedy still paid 450.",
      fix: "Admissibility pays off only in cost-aware orderings. If you need the cheapest path, that is f = g + h — the next lesson — or plain uniform-cost.",
    },
    {
      mistake: "Blaming the heuristic when greedy returns a bad route.",
      why:
        "The estimate is a distance-to-go; it is silent about the road behind you. Using it alone is an algorithm choice, not a heuristic defect — a sharper table would have made the same mistake faster.",
      fix: "Audit the evaluation function first: what exactly does the priority read? If the answer is 'h alone', suboptimality is structural, and no heuristic swap will fix it.",
    },
    {
      mistake: "Skipping the expanded set because 'greedy always moves toward the goal'.",
      why:
        "Nothing in an h-only ordering forbids cycles: a map whose closest-looking neighbour loops back can walk the search in circles forever — exactly the 'not complete on graphs with cycles' clause of the guarantees.",
      fix: "Keep an expanded set (the program's list) on any graph. Greedy needs it for termination, even though it needs nothing else.",
    },
  ],
  takeaways: [
    "Greedy best-first orders the frontier by h alone — the estimated cost still to go — grabbing the best-looking estimate at every step and never reading the bill for getting there.",
    "On Romania it reaches Bucharest in four expansions — Arad, Sibiu, Făgăraș, Bucharest — at 450 km; the 418 km optimum through R. Vâlcea and Pitești is never expanded.",
    "The failure is g-blindness: 176 beat 193 because the ordering reads only h — nothing in greedy can weigh a cheap route against a close-looking one, and the goal pops the moment it is generated.",
    "Informedness is a speed dial: sharper heuristics prune more, all the way up to h = h* — and greedy is still not optimal at the top of the ladder.",
    "The repair is one added term: f(n) = g(n) + h(n) — compass plus ledger — which is exactly the next lesson.",
  ],
  quiz: [
    {
      id: "a-06-q1",
      prompt:
        "Greedy best-first from Arad returns the 450 km route to Bucharest rather than the optimal 418 km. The precise cause is:",
      options: [
        {
          text: "The straight-line table overestimated some city's remaining distance",
          correct: false,
          feedback:
            "It never does — no road ever built is shorter than a ruler (a-05's admissibility). The heuristic's honesty is not the issue.",
        },
        {
          text: "Greedy orders the frontier by h alone, so once Făgăraș (176) and R. Vâlcea (193) were both on the frontier, the cheaper R. Vâlcea route could never win — its g never entered the comparison",
          correct: true,
          feedback:
            "Exactly — g-blindness. The evaluation function reads one number, and that number is about the road ahead, not the trip.",
        },
        {
          text: "The frontier was too small to hold both routes at once",
          correct: false,
          feedback:
            "Both cities sat on the frontier simultaneously; the ordering, not the capacity, decided between them.",
        },
        {
          text: "Greedy expanded Bucharest before Făgăraș could generate the better route",
          correct: false,
          feedback:
            "The order was Arad, Sibiu, Făgăraș, Bucharest — Făgăraș WAS expanded, and its road is exactly what produces the 450.",
        },
      ],
      explanation:
        "Suboptimality here is structural: an h-only ordering cannot weigh cost already spent, so a closer-looking route always wins, whatever the true totals.",
    },
    {
      id: "a-06-q2",
      prompt: "The moment any goal state enters greedy's frontier, what happens?",
      options: [
        {
          text: "The goal must still compete on its g against the other frontier nodes",
          correct: false,
          feedback: "Greedy's priority never reads g — not even the goal's.",
        },
        {
          text: "It pops on the next iteration: h(goal) = 0 is the smallest value on any frontier, so greedy returns the first goal route it happens to generate",
          correct: true,
          feedback:
            "Correct — and that is why no comparison of alternative routes ever happens: the first complete route to appear is the answer.",
        },
        {
          text: "The search prunes the remaining frontier and keeps looking for a cheaper goal",
          correct: false,
          feedback:
            "There is no 'cheaper goal' notion in an h-only search — and nothing continues after the goal pops.",
        },
        {
          text: "It depends on how ties are broken",
          correct: false,
          feedback:
            "Only a second h = 0 entry could tie, and there is none here; against any positive estimate the goal wins outright.",
        },
      ],
      explanation:
        "h = 0 outranks every positive estimate, so generation-time and pop-time goal tests coincide for greedy. A* must refuse exactly this shortcut — its goals wait their turn in f order.",
    },
    {
      id: "a-06-q3",
      prompt:
        "A sharper, still-admissible heuristic h₂ replaces h₁ (h₂ dominates h₁ everywhere). What does greedy gain?",
      options: [
        {
          text: "Optimality, once the heuristic is admissible everywhere",
          correct: false,
          feedback:
            "Romania's table was admissible all along — greedy still returned 450. Admissibility only pays in cost-aware orderings.",
        },
        {
          text: "Optimality once h₂ becomes perfect, h₂ = h*",
          correct: false,
          feedback:
            "The trace exercise showed greedy failing with the perfect heuristic itself — g-blindness survives at the top of the ladder.",
        },
        {
          text: "Typically fewer expansions — informedness is a speed dial — but no optimality guarantee attaches at any informedness level, and the g-blind failure mode stays",
          correct: true,
          feedback:
            "Correct. Sharper estimates aim the sprint better; they cannot make the ordering weigh money already spent.",
        },
        {
          text: "A smaller frontier by construction, since better heuristics generate fewer states",
          correct: false,
          feedback:
            "No such guarantee: the successor function still generates what it generates; only which nodes get expanded changes.",
        },
      ],
      explanation:
        "Informedness buys expansion counts, never guarantees. Correctness comes from the evaluation function's missing term — g — which is the whole idea of A*.",
    },
  ],
};
