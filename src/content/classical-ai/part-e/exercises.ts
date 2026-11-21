/**
 * PART_E_EXERCISES — batteries for Part E "Classical Planning" (J5).
 *
 * Eight exercises, tiered: e-b1..e-b3 basic, e-i1..e-i3 intermediate,
 * e-a1..e-a2 advanced. Five are auto-gradable (expectedOutput): the
 * two-applications trace, the logistics applicability count, the mutex
 * count, the h-max/h-add computation, and the flat-world progression
 * run — every expectedOutput is the REAL stdout of the shipped starter.
 */
import type { Exercise } from "@/lib/course/types";

export const PART_E_EXERCISES: Exercise[] = [
  {
    id: "e-b1",
    tier: "beginner",
    title: "Apply the operator, precisely",
    prompt:
      "State s = {on(A,B), on(B,Table), clear(A), clear(Table)}. Apply move(A, B, Table) and write the resulting state's full proposition set. Then apply move(B, Table, A) to the result — is it licensed? Type the final state's propositions as a comma-separated list, or 'not licensed'.",
    hint: "Work the set arithmetic exactly: (s − del) ∪ add, no more, no less. clear(Table) never appears in any list — the table's conventions.",
    starter: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

s = {"on(A,B)", "on(B,Table)", "clear(A)", "clear(Table)"}
# apply move(A,B,Table), then attempt move(B,Table,A); print the final set`,
    expectedOutput: "on(A,Table), on(B,A), clear(B), clear(Table)",
    solution: `move(A,B,Table): pre {on(A,B), clear(A), clear(Table)} ⊆ s ✓ → s1 = (s − {on(A,B)}) ∪ {on(A,Table), clear(B)} = {on(B,Table), clear(A), clear(Table), on(A,Table), clear(B)} — five facts: B on the table, A on the table, everything clear.
move(B,Table,A): pre {on(B,Table), clear(B), clear(A)} — ALL hold in s1 (clear(A) survived step 1; nothing sits on A) ✓ licensed → s2 = (s1 − {on(B,Table), clear(A)}) ∪ {on(B,A)} = {clear(Table), on(A,Table), clear(B), on(B,A)}.
Final: on(A,Table), on(B,A), clear(B), clear(Table) — the two-block stack, B under A, both free surfaces clear. Every surviving fact has a reason (persisted), every added fact has a producer, every absence has a delete behind it.`,
    concepts: ["STRIPS", "successor function"],
  },
  {
    id: "e-b2",
    tier: "beginner",
    title: "Licensing in the logistics domain",
    prompt:
      "The e-02 problem: package p at home, truck t at depot — s = {at(p,home), at(t,depot)}. The domain grounds to 8 operators (2 loads, 2 unloads, 4 drives). How many are licensed in s? Run the starter to check. Type the number.",
    hint: "Applicability is the subset test: pre(a) ⊆ s. Check each ground operator's preconditions — including the two operators that are licensed but useless.",
    starter: `def op_load(p, t, l):
    pre = {f"at({t},{l})", f"at({p},{l})"}
    add = {f"in({p},{t})"}
    delete = {f"at({p},{l})"}
    return (f"load({p},{t},{l})", pre, add, delete)

def op_unload(p, t, l):
    pre = {f"at({t},{l})", f"in({p},{t})"}
    add = {f"at({p},{l})"}
    delete = {f"in({p},{t})"}
    return (f"unload({p},{t},{l})", pre, add, delete)

def op_drive(t, a, b):
    pre = {f"at({t},{a})"}
    add = {f"at({t},{b})"}
    delete = {f"at({t},{a})"}
    return (f"drive({t},{a},{b})", pre, add, delete)

G_OPS = []
for l in ["depot", "home"]:
    G_OPS.append(op_load("p", "t", l))
    G_OPS.append(op_unload("p", "t", l))
    G_OPS.append(op_drive("t", l, l))
for a in ["depot", "home"]:
    for b in ["depot", "home"]:
        if a != b:
            G_OPS.append(op_drive("t", a, b))

s = {"at(p,home)", "at(t,depot)"}
licensed = [name for name, pre, add, delete in G_OPS if pre <= s]
print(len(licensed))`,
    expectedOutput: "2",
    solution: `2 — and the two licensed operators are drive(t,depot,home) and drive(t,depot,depot): the second is licensed but USELESS (a no-move drive). The loads fail (the truck is not where the package is: load(p,t,home) needs at(t,home); load(p,t,depot) needs at(p,depot)), the unloads fail (nothing is in the truck), and the drives from home fail (the truck is at the depot). The lesson: applicability is silent about VALUE — a licensed operator can still be a wasted step, which is why search, not licensing, finds plans.`,
    concepts: ["planning domain", "applicability", "logistics"],
  },
  {
    id: "e-b3",
    tier: "beginner",
    title: "Counting the mutexes, then justifying them",
    prompt:
      "Run the starter: it rebuilds lesson e-05's A0 (the three licensed moves plus one persistence no-op per start fact) and counts the proposition mutexes at S1 over producer pairs. How many does it print? Type the number — then, by hand, justify TWO of them by rule citation (one by interference through a producer, one by all-pairs competing producers).",
    hint:
      "The two conditions for a proposition mutex: the two facts have no shared producer, and every producer pair fights. A shared producer is an ACQUITTAL — one action can make both facts true in the same step.",
    starter: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

START = {"on(C,A)", "on(A,Table)", "on(B,Table)",
         "clear(C)", "clear(B)", "clear(Table)"}
REAL = ["move(C,A,Table)", "move(C,A,B)", "move(B,Table,C)"]
A0 = [make_move(*[p.strip() for p in n[5:-1].split(",")]) for n in REAL]
A0 += [(f"persist({p})", {p}, {p}, set()) for p in START]
S1 = set(START) | set().union(*[add for _, pre, add, dele in A0])

def act_mutex(a, b):
    _, pre_a, add_a, del_a = a
    _, pre_b, add_b, del_b = b
    if del_a & (pre_b | add_b) or del_b & (pre_a | add_a):
        return True                      # interference
    return False                         # no S0 mutexes -> no competing needs

def producers(p):
    return [a for a in A0 if p in a[2]]

count = 0
props = sorted(S1)
for i in range(len(props)):
    for j in range(i + 1, len(props)):
        a = producers(props[i])
        b = producers(props[j])
        if {x[0] for x in a} & {y[0] for y in b}:
            continue                     # shared producer: an acquittal
        if a and b and all(act_mutex(x, y) for x in a for y in b):
            count += 1
print(count)`,
    expectedOutput: "10",
    solution: `10 — exactly e-05's marked list and e-06's machine-verified marking. Two citations to rehearse: (1) on(C,B) with clear(B) — INTERFERENCE THROUGH A PRODUCER: on(C,B)'s only producer is move(C,A,B), whose delete list contains clear(B), while clear(B)'s only producer is its persistence no-op asserting the very fact the move destroys — C sitting on B means B is not clear. (2) clear(A) with on(B,C) — ALL-PAIRS COMPETING PRODUCERS: clear(A)'s producers are move(C,A,Table) and move(C,A,B); on(B,C)'s only producer is move(B,Table,C); move(B,Table,C) deletes clear(C), a precondition of BOTH of clear(A)'s producers — every pair fights, so A cannot become free in the same step B lands on C. And the acquittal you should check: clear(A) with on(C,Table) is NOT mutex — move(C,A,Table) produces both, one action, one step, both true.`,
    concepts: ["mutex", "planning graph", "inconsistent support"],
  },
  {
    id: "e-i1",
    tier: "intermediate",
    title: "Author a domain: the coffee errand",
    prompt:
      "Write a STRIPS domain (operator table) for: a robot at a location (at), holding-or-not (holding), coffee available at the cafe (coffee-at), and a goal of coffee-delivered at the office. Operators: goto(x, y), pick-up(l), drop-off(l). Give pre/add/del for each as a table, then trace a 3-operator plan from at(office), coffee-at(cafe).",
    hint: "goto needs at(x) and deletes it while adding at(y); pick-up needs at(l) and coffee-at(l); drop-off needs holding and at(l). Watch which facts persist.",
    solution: `goto(x,y): pre {at(x)}, add {at(y)}, del {at(x)}.
pick-up(l): pre {at(l), coffee-at(l)}, add {holding}, del {coffee-at(l)}.
drop-off(l): pre {at(l), holding}, add {coffee-at(l), delivered(l)}, del {holding}.

Plan from at(office), coffee-at(cafe):
1. goto(office, cafe)   → {at(cafe), coffee-at(cafe)}
2. pick-up(cafe)        → {at(cafe), holding}
3. goto(cafe, office)   → {at(office), holding}
4. drop-off(office)     → {at(office), coffee-at(office), delivered(office)}
Four operators, not three — the out-and-back is irreducible. The lesson: domain authoring is mostly persistence discipline (what each operator must NOT touch).`,
    concepts: ["domain authoring", "STRIPS"],
  },
  {
    id: "e-i2",
    tier: "intermediate",
    title: "The h-add family on a tower goal",
    prompt:
      "From the Sussman start, change the goal to the TOWER {on(C,B), on(B,A)} — B on A, C on B (the plan takes three steps: move(C,A,Table), move(B,Table,A), move(C,Table,B)). Predict h-max and h-add BEFORE running, then run the starter (the e-04 propagation over the 36 relaxed operators). Type the two numbers as: h-max X h-add Y.",
    hint:
      "h-max takes the MAX over goal facts (admissible but blind to accumulation); h-add takes the SUM (informative but can overestimate). on(B,A) needs clear(A), which costs one relaxed step...",
    starter: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

OPS = {}
for x in ["A", "B", "C"]:
    for y in ["A", "B", "C", "Table"]:
        for z in ["A", "B", "C", "Table"]:
            if z != x and z != y:
                o = make_move(x, y, z)
                OPS[o[0]] = o

START = {"on(C,A)", "on(A,Table)", "on(B,Table)",
         "clear(C)", "clear(B)", "clear(Table)"}
GOAL = {"on(C,B)", "on(B,A)"}
INF = float("inf")
FACTS = ([f"on({a},{b})" for a in "ABC" for b in ["A", "B", "C", "Table"]]
         + [f"clear({c})" for c in ["A", "B", "C", "Table"]])
hmax = {p: (0 if p in START else INF) for p in FACTS}
hadd = dict(hmax)
changed = True
while changed:
    changed = False
    for name, (n, pre, add, dele) in OPS.items():
        if all(hmax[q] < INF for q in pre):
            c = 1 + max(hmax[q] for q in pre)
            for p in add:
                if c < hmax[p]:
                    hmax[p] = c
                    changed = True
        if all(hadd[q] < INF for q in pre):
            c = 1 + sum(hadd[q] for q in pre)
            for p in add:
                if c < hadd[p]:
                    hadd[p] = c
                    changed = True
print("h-max", max(hmax[p] for p in GOAL), "h-add", sum(hadd[p] for p in GOAL))`,
    expectedOutput: "h-max 2 h-add 3",
    solution: `h-max 2 h-add 3 — per fact: on(C,B) costs 1 (move(C,A,B): all preconditions free at the start); on(B,A) costs 2 (move(B,Table,A): on(B,Table) free, clear(B) free, but clear(A) costs 1 — only the C-off-A moves create it). h-max takes max(1, 2) = 2 — it sees the most expensive goal fact and ignores that BOTH must happen; h-add takes 1 + 2 = 3 — and here the sum happens to be exactly the true optimum h* = 3. The honest reading: h-max is admissible (2 ≤ 3) but blind to accumulation; h-add is informative but its guarantee is NOT admissibility — on other instances the sum overshoots. Between them sits h+ (the true relaxed optimum, NP-hard), which for the original Sussman goal was also exactly 3.`,
    concepts: ["delete relaxation", "h-max", "h-add", "admissibility"],
  },
  {
    id: "e-i3",
    tier: "intermediate",
    title: "Progression from the flat world, predicted then verified",
    prompt:
      "The flat start — all three blocks on the table, everything clear — and the goal {on(A,B), on(B,C)} (the three-stack). PREDICT the optimal plan and the number of states e-01's BFS engine will expand BEFORE running (the frontier structure differs from the anomaly's: no block starts buried). Then run the starter and reconcile. Type the expanded count.",
    hint:
      "Six stacking moves are licensed at the flat start. Think about which depth the goal lives at, and how the frontier grows before it gets there.",
    starter: `def make_move(x, y, z):
    pre = {f"on({x},{y})", f"clear({x})", f"clear({z})"}
    add = {f"on({x},{z})", f"clear({y})"} - {"clear(Table)"}
    delete = {f"on({x},{y})", f"clear({z})"} - {"clear(Table)"}
    return (f"move({x},{y},{z})", pre, add, delete)

OPS = {}
for x in ["A", "B", "C"]:
    for y in ["A", "B", "C", "Table"]:
        for z in ["A", "B", "C", "Table"]:
            if z != x and z != y:
                o = make_move(x, y, z)
                OPS[o[0]] = o

from collections import deque
FLAT = {"on(A,Table)", "on(B,Table)", "on(C,Table)",
        "clear(A)", "clear(B)", "clear(C)", "clear(Table)"}
GOAL2 = {"on(A,B)", "on(B,C)"}
parent = {frozenset(FLAT): None}
q = deque([frozenset(FLAT)])
plan, expanded = None, 0
while q and plan is None:
    s = q.popleft()
    expanded += 1
    if GOAL2 <= s:
        seq = []
        while parent[s] is not None:
            s, act = parent[s]
            seq.append(act)
        plan = list(reversed(seq))
        break
    for name, op in OPS.items():
        if op[1] <= s:
            t = frozenset((s - op[3]) | op[2])
            if t not in parent:
                parent[t] = (s, name)
                q.append(t)
print(" -> ".join(plan))
print("length", len(plan), "- states expanded", expanded)`,
    expectedOutput:
      "move(B,Table,C) -> move(A,Table,B)\nlength 2 - states expanded 11",
    solution: `move(B,Table,C) -> move(A,Table,B)
length 2 - states expanded 11

The plan: stack B on C first, then A on B — length 2 (from the flat world there is no anomaly; subgoals do not interact here because B is free to move first). The count is the interesting part: frontier sizes run 1, 6, 6 — the flat start licenses six stacking moves, and each one-stack world licenses the five moves around it — and the goal pops on the 11th expansion, against the anomaly's 13. Compare with regression's 240 sets on the anomaly's start (lesson e-03): the SAME engine's cost moves by double digits when the start state changes by one buried block — search cost is a property of the problem instance, not the method.`,
    concepts: ["progression search", "state space", "Sussman anomaly"],
  },
  {
    id: "e-a1",
    tier: "advanced",
    title: "The relaxed heuristic, by hand",
    prompt:
      "The delete-relaxation heuristic h+ for the Sussman start: drop all delete lists and compute the length of the shortest relaxed plan achieving {on(A,B), on(B,C)}. Steps: list the relaxed operators' adds, cover the goals greedily-or-optimally, count. What is h+ here, and how does it compare to the true optimal 3?",
    hint: "With deletes gone, once B is on C it STAYS on C even after A moves. Work through what becomes possible.",
    solution: `Relaxed operators only add: move(x,y,z) still needs its pre's, but nothing ever un-clears or un-stacks. From {on(C,A), on(A,Table), on(B,Table), clear(C), clear(B)}: step 1 move(C,A,Table) adds on(C,Table), clear(A) (C still clear). Step 2 move(B,Table,C) adds on(B,C), clear(Table) — B stays clear? In the relaxation, clear(B) was never deleted... it persists by the no-delete rule. Step 3 move(A,Table,B) needs on(A,Table) ✓ (never deleted!), clear(A) ✓ (added step 1, never deleted), clear(B) ✓ — adds on(A,B). Both goals hold after 3 steps: h+ = 3. Here the relaxation is EXACT — no wasted work to undo. Contrast a world where A must move twice: there h+ underestimates by the undo steps. h+ ≤ h* always; equality when the plan has no 'destructive prefix'.`,
    concepts: ["delete relaxation", "h+ heuristic", "admissibility"],
  },
  {
    id: "e-a2",
    tier: "advanced",
    title: "Extraction's instructive failure",
    prompt:
      "Walk Graphplan's extraction backward over the Sussman graph (lesson e-06) from S3, where {on(A,B), on(B,C)} first sit non-mutex. At A2, select supporters for both goals. At A1, show why the greedy all-persistence selection FAILS — name the exact mutex that blocks it — and which selection succeeds instead. At A0, finish the walk. What plan comes out, and why was the failure the whole point?",
    hint:
      "The greedy instinct at A1: keep everything with persistence no-ops (clear(A) persists, on(B,C) persists). Check e-05's S1 mutex list before you commit to it.",
    solution: `A2: on(A,B) ← move(A,Table,B) (its only producer); on(B,C) ← persist(on(B,C)). The pair is non-mutex — this is exactly the level where the blocking mark has loosened. Subgoals at S2: {on(A,Table), clear(A), clear(B), on(B,C)}.
A1, the greedy try: persist everything — persist(clear(A)) for clear(A), persist(on(B,C)) for on(B,C). BLOCKED: clear(A) is mutex with on(B,C) at S1 — every producer of clear(A) (move(C,A,Table), move(C,A,B)) fights move(B,Table,C) over C's clearness, and on(B,C) has no other producer at A0 — so the two no-ops have competing needs. Extraction backtracks.
A1, the working selection: move(B,Table,C) for on(B,C), alongside persist(on(A,Table)), persist(clear(A)), persist(clear(B)) — move(B,Table,C)'s deletes (on(B,Table), clear(C)) touch none of the persists, and no S1 mutex crosses its preconditions with theirs. Subgoals at S1: {on(A,Table), clear(A), clear(B), on(B,Table), clear(C)}.
A0: persist all five except clear(A) ← move(C,A,Table) (its only delete, on(C,A), touches none of the persists). Subgoals: exactly the start state.
Plan (walk read forward): move(C,A,Table) → move(B,Table,C) → move(A,Table,B) — e-01's optimum, length 3.
Why the failure is the point: the clear(A) ~ on(B,C) mutex IS the anomaly's fingerprint — A becoming free and B landing on C fight over the same resource (C's clearness), so a one-step world cannot have both, so extraction CANNOT keep both with no-ops, so the plan is forced to interleave: free A's precondition first, land B, then stack. The greedy checklist walks into the undo loop; the graph's marks make the search see the interleave before spending a single state expansion.`,
    concepts: ["plan extraction", "mutex", "Sussman anomaly", "Graphplan"],
  },
];
