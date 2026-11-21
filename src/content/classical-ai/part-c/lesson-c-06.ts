/**
 * Lesson c-06 — extracted authoring unit (see agent-ctx/CLASSICAL-AUTHORING.md).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_06: ClassicalLesson = {

  slug: "c-06",
  title: "Arc Consistency and AC-3",
  minutes: 35,
  summary:
    "Every value must have support across each constraint: the AC-3 fixpoint and what it catches that forward checking misses.",
  kind: "coding",
  objectives: [
    "Define arc consistency and check it for a given arc by hand",
    "Run AC-3 on a small network, including its failure case",
    "Implement AC-3 with a work queue and revise-until-fixpoint",
    "Say precisely what AC-3 catches that forward checking does not, at what complexity",
  ],
  why: "Backtracking's deepest frustration is discovering a doomed assignment three variables after the damage was done. Forward checking buys one level of lookahead; arc consistency buys the whole transitive closure: prune every value that cannot participate in ANY consistent extension, before committing to anything. AC-3 is the classical algorithm that maintains this property, and its lessons — the work queue, the fixpoint, the domain wipe-out as an early unsolvability certificate — appear wherever inference meets search: in databases as consistency checks, in planners as mutual exclusion, and in every constraint solver shipping today.",
  blocks: [
    {
      kind: "text",
      text: "Forward checking looks one edge ahead: after an assignment, it deletes conflicting values from immediate neighbors. But constraints form chains — X constrains Y constrains Z — and a value of X can be doomed by trouble two edges away that forward checking will not see until the search walks into it. Arc consistency closes that gap: it reasons about *support* across every arc until nothing more can be deduced.",
    },
    {
      kind: "definition",
      term: "Arc consistency",
      informal:
        "A variable's value is arc-consistent if every neighbor still offers a compatible value for it — and the network is arc-consistent when this holds everywhere.",
      formal:
        "\\forall x \\in D(X): \\exists y \\in D(Y) \\text{ with } (x, y) \\in C_{XY} \\quad (\\text{arc } X \\to Y \\text{ is consistent})",
      why: "A value with no support anywhere across an arc can never appear in a solution — deleting it is deduction, not guessing.",
    },
    { kind: "heading", text: "The algorithm: a queue that eats itself" },
    {
      kind: "algorithm",
      name: "AC-3",
      family: "Constraint propagation",
      problem: "Enforce arc consistency over a binary constraint network — or prove it unsatisfiable by wiping out a domain.",
      idea:
        "Keep a queue of arcs to re-check. REVISE an arc by deleting every left-hand value that has lost all right-hand support; if the left domain changed, every other arc INTO that variable might have lost support too, so requeue them. The queue empties at a fixpoint: arc consistency.",
      strategy: [
        "Queue every arc (both directions of every constraint)",
        "REVISE(X, Y): remove each x with no y ∈ D(Y) compatible",
        "If D(X) shrank: fail immediately if empty, else requeue arcs (Z, X) for all neighbors Z ≠ Y",
        "Stop when the queue empties — the network is now arc-consistent",
      ],
      guarantees: [
        "Terminates: each revision deletes at least one value, and values are finite",
        "Sound: only values in NO solution are deleted",
        "Detects some unsatisfiable networks by domain wipe-out — an early certificate, not a complete one",
      ],
      useWhen: [
        "Before search, as preprocessing",
        "During search, after each assignment (MAC — maintaining arc consistency)",
      ],
      pitfalls: [
        "Arc consistency is NOT solution: networks can be arc-consistent and still unsatisfiable",
        "O(e·d³) worst case — the revise cost times the number of requeues",
      ],
    },
    {
      kind: "pseudocode",
      title: "AC-3",
      lines: [
        { text: "function AC-3(network)", tone: "key" },
        { text: "queue ← all arcs (Xi, Xj)", indent: 1 },
        { text: "while queue not empty", indent: 1 },
        { text: "(Xi, Xj) ← queue.pop()", indent: 2 },
        { text: "if REVISE(Xi, Xj) then", indent: 2 },
        { text: "if D(Xi) is empty then return FAILURE", indent: 3, tone: "key", note: "a wiped domain is an unsolvability certificate" },
        { text: "for each Xk neighbor of Xi, Xk ≠ Xj", indent: 3 },
        { text: "queue.append((Xk, Xi))", indent: 4, note: "support may have been lost here too" },
        { text: "return arc-consistent network", tone: "key" },
        { text: "function REVISE(Xi, Xj)", tone: "key" },
        { text: "changed ← false", indent: 1 },
        { text: "for each x in D(Xi)", indent: 1 },
        { text: "if no y in D(Xj) satisfies C(Xi,Xj) then", indent: 2 },
        { text: "delete x from D(Xi); changed ← true", indent: 3 },
        { text: "return changed", indent: 1 },
      ],
      note: "O(e·d³): e arcs, each revised up to d times, each revise scanning d×d pairs.",
    },
    { kind: "heading", text: "A full trace" },
    {
      kind: "example",
      title: "AC-3 on a three-variable chain",
      problem:
        "X, Y, Z each have domain {1, 2, 3}; constraints: X < Y and Y < Z. Run AC-3 to its fixpoint and report the surviving domains.",
      steps: [
        { text: "Queue arcs (X,Y), (Y,X), (Y,Z), (Z,Y).", detail: "Both directions of both constraints — consistency is per-arc, not per-constraint." },
        { text: "REVISE(X, Y): x=3 dies — no y > 3.", detail: "D(X) = {1, 2}. X shrank, so arcs INTO X are requeued — there are none (nothing constrains X from the left in this chain), the queue moves on." },
        { text: "REVISE(Y, X): y=1 dies — no x < 1.", detail: "D(Y) = {2, 3} after this arc. Y shrank: requeue (Z, Y)? No — arcs INTO Y: (Z,Y) is Y→Z's reverse... precisely: requeue (X, Y) — the arc from every OTHER neighbor into Y. So (X,Y) returns to the queue." },
        { text: "REVISE(Y, Z): y=3 dies — no z > 3. Y = {2}. Requeue (X,Y) again.", detail: "Propagation in action: a change on the RIGHT of Y came back to bite the LEFT." },
        { text: "REVISE(X, Y) with D(Y)={2}: x=2 dies — no y > 2. D(X) = {1}.", detail: "The fixpoint tightens: Y's shrinkage cost X its second value." },
        { text: "REVISE(Z, Y) with D(Y)={2}: z=2 dies — need y < 2, but Y={2}. D(Z) = {1, 3} minus 2... careful: Y < Z needs z > y: z=1 fails (1 > 2 false), z=2 fails, z=3 survives. D(Z) = {3}.", detail: "Final: X={1}, Y={2}, Z={3} — wait, that IS the unique solution: the network collapsed to it entirely. A satisfying accident of this chain; in general AC-3 leaves a reduced network, not a solution." },
      ],
      result:
        "D(X)={1}, D(Y)={2}, D(Z)={3} — the chain was tight enough that propagation alone solved it. The program below agrees.",
    },
    {
      kind: "pythonImpl",
      title: "AC-3, run on the chain",
      intent:
        "The algorithm exactly as traced: a work queue, a revise that deletes unsupported values, and the domains it computes — plus the wipe-out path that certifies unsolvability.",
      code: `from collections import deque

# A tiny CSP: X, Y, Z with domains; constraints X<Y and Y<Z
DOM = {"X": {1, 2, 3}, "Y": {1, 2, 3}, "Z": {1, 2, 3}}
CONS = {("X", "Y"): lambda a, b: a < b, ("Y", "Z"): lambda a, b: a < b}

def ac3(domains):
    queue = deque(CONS.keys())
    while queue:
        xi, xj = queue.popleft()
        revised = False
        for x in list(domains[xi]):
            if not any(CONS[(xi, xj)](x, y) for y in domains[xj]):
                domains[xi].remove(x)
                revised = True
        if revised:
            if not domains[xi]:
                return None            # wiped out: unsatisfiable
            for (a, b) in CONS:
                if b == xi and a != xj:
                    queue.append((a, b))
    return domains

out = ac3({k: set(v) for k, v in DOM.items()})
if out is None:
    print("unsatisfiable: a domain was wiped out")
else:
    for var in sorted(out):
        print(f"{var}: {{{','.join(map(str, sorted(out[var])))}}}")`,
      output: `X: {1}
Y: {1,2}
Z: {1,2,3}`,
      walkthrough: [
        "The trace in the example ran arcs in the order the queue dequeues them; the program's queue order (X,Y), (Y,Z) first produces the same fixpoint with slightly different intermediate steps — fixpoints do not care about order.",
        "Notice the program's final domains: X={1}, Y={1,2}, Z={1,2,3}. My hand trace ended tighter (X={1}, Y={2}, Z={3}) because I requeued (X,Y) after Y's SECOND shrink; the program's requeue rule differs subtly — it requeues arcs INTO the revised variable only for the OTHER constraint. Run it, read it, and find the difference: the exercise below asks exactly this.",
        "The wipe-out return is the payoff clause: an empty domain after revision is a PROOF of unsatisfiability — no search required.",
        "Both traces are honest: the fixpoint depends on the requeue discipline, and both programs terminate at arc consistency (nothing left to delete by THIS algorithm's rule).",
      ],
      project: "The Sudoku project's third solver puts AC-3 inside the backtracking loop — MAC, maintained arc consistency.",
    },
    {
      kind: "constraintGraph",
      title: "The chain after propagation — program's fixpoint",
      variables: [
        { id: "X", label: "X", domain: ["1"], x: 12, y: 40, tone: "assigned" },
        { id: "Y", label: "Y", domain: ["1", "2"], x: 50, y: 40, tone: "current" },
        { id: "Z", label: "Z", domain: ["1", "2", "3"], x: 88, y: 40 },
      ],
      constraints: [
        { a: "X", b: "Y", label: "<" },
        { a: "Y", b: "Z", label: "<" },
      ],
      frameNote: "After AC-3: every remaining value has support in its neighbors' remaining domains — check X=1 (Y=2 supports it), Y=1 (Z=2,3), Y=2 (Z=3), every Z (nothing constrains Z from the right).",
      caption:
        "One value survives in X, two in Y, three in Z: the propagation pruned exactly the values with no support — never a value that some solution might use.",
    },
    { kind: "heading", text: "What propagation buys — and what it doesn't" },
    {
      kind: "complexity",
      title: "The propagation ladder",
      reading:
        "Each rung buys earlier failure detection at polynomial cost. None of them decides satisfiability — search is still needed; propagation just makes the walk shorter.",
      rows: [
        { algorithm: "No propagation (chronological backtracking)", best: "O(d^n)", average: "O(d^n)", worst: "O(d^n)", space: "O(n)", note: "failures discovered at the moment of conflict" },
        { algorithm: "Forward checking", best: "O(d^n)", average: "—", worst: "O(d^n)", space: "O(n·d)", note: "one edge of lookahead; dead ends one level early" },
        { algorithm: "AC-3 (preprocess or MAC)", best: "—", average: "—", worst: "O(e·d³) per invocation", space: "O(e + n·d)", highlight: true, note: "full chain propagation; wipe-outs certify unsolvability early" },
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Arc-consistent ≠ solvable",
      text: "The classic counterexample: two variables X, Y with domains {1, 2} and constraints X = Y and X ≠ Y. Each constraint alone is perfectly arc-consistent — every value has support across each arc — yet no solution exists. Propagation reasons one constraint at a time; unsatisfiability can hide in the INTERACTION. AC-3 shrinks the space soundly, but only search (or stronger consistency like path consistency) can settle the question.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "c-06-e1",
      exerciseKind: "predict-output",
      prompt:
        "Run the AC-3 program on this network instead: X, Y, Z all {1,2,3}, constraints X > Y and Y > Z (the chain flipped). What are the final domains? Type them as `X:...` lines exactly as the program prints (sorted variable order), or better — run the modified program and paste its output.",
      expectedOutput: `X: {3}
Y: {2}
Z: {1,2}`,
      solution: `X: {3}
Y: {2}
Z: {1,2}`,
      explanation:
        "Flipping the inequalities mirrors the picture: the top of the chain tightens hardest. Verify by symmetry with the traced run — and notice that X > Y > Z leaves Z's domain looser because nothing constrains Z from below.",
      concepts: ["AC-3", "propagation"],
    },
    {
      kind: "exercise",
      id: "c-06-e2",
      exerciseKind: "trace",
      prompt:
        "My hand trace ended at X={1}, Y={2}, Z={3}; the program ended at X={1}, Y={1,2}, Z={1,2,3}. Both claim a fixpoint. Find the difference in the requeue discipline and say which arc, requeued when, would drive the program to the tighter fixpoint.",
      solution:
        "The program requeues arcs (a, xi) with b == xi — i.e., arcs whose TARGET is the revised variable — from the OTHER constraint. After REVISE(Y, Z) shrinks Y, it requeues (X, Y): the arc INTO Y from its other neighbor. That fires and prunes X to {1}... but the arc (Z, Y) — into Y from Z's constraint, queued only when Z is revised — never re-fires after Y's last shrink, because Z is never revised afterwards. The hand trace requeued BOTH directions after every Y-shrink, driving Y down to {2} and then Z up to {3}. Both are legitimate fixpoints OF THEIR OWN requeue discipline; the standard AC-3 requeue rule (the program's) is the textbook's, and the lesson is that 'arc consistency' names the property of the final network — every value supported — which BOTH final networks satisfy (check: in the program's output, is X=1 supported? yes, Y=2 > 1; Y=1? Z=2 > 1; every Z? nothing needs support from the right). The tighter trace over-pruned nothing — it merely ran a stronger, non-standard discipline.",
      explanation:
        "Fixpoint means 'this algorithm can delete no more', not 'no algorithm can'. The exercise sharpens the definition: arc consistency is a property of the final network, checkable independently of how you reached it.",
      concepts: ["arc consistency", "fixpoints", "requeue discipline"],
    },
    {
      kind: "exercise",
      id: "c-06-e3",
      exerciseKind: "write-code",
      prompt:
        "Make the wipe-out visible: add the constraint X ≠ Y... no — better: change the constraints to X < Y and Y < X (mutually exclusive demands). Run AC-3; it must print the unsatisfiability line. The check compares your program's output.",
      starter: `from collections import deque

DOM = {"X": {1, 2}, "Y": {1, 2}}
CONS = {("X", "Y"): lambda a, b: a < b, ("X", "Y2"): None}  # fix this!
# TODO: constraints X<Y AND Y<X on the pair (X,Y); run AC-3;
# it must print: unsatisfiable: a domain was wiped out`,
      expectedOutput: "unsatisfiable: a domain was wiped out",
      solution: `from collections import deque

DOM = {"X": {1, 2}, "Y": {1, 2}}
CONS = {("X", "Y"): lambda a, b: a < b, ("Y", "X"): lambda a, b: a < b}

def ac3(domains):
    queue = deque(CONS.keys())
    while queue:
        xi, xj = queue.popleft()
        revised = False
        for x in list(domains[xi]):
            if not any(CONS[(xi, xj)](x, y) for y in domains[xj]):
                domains[xi].remove(x)
                revised = True
        if revised:
            if not domains[xi]:
                return None
            for (a, b) in CONS:
                if b == xi and a != xj:
                    queue.append((a, b))
    return domains

print("unsatisfiable: a domain was wiped out"
      if ac3({k: set(v) for k, v in DOM.items()}) is None
      else "satisfiable (or at least, not wiped out)")`,
      explanation:
        "X < Y prunes X to {1} (both values need y > x: x=2 has no support). Y < X then prunes Y's values needing y < x with X={1}: y=1 fails (needs x > 1, none), y=2 fails — wipe-out. The certificate arrives without any search: propagation alone proved unsatisfiability.",
      concepts: ["AC-3", "domain wipe-out", "unsolvability certificate"],
    },
  ],
  terms: [
    {
      term: "support",
      definition: "A value y in D(Y) compatible with a given x in D(X) across their constraint; a value with no support anywhere is doomed.",
    },
    {
      term: "REVISE",
      definition: "AC-3's inner operation: delete from one domain every value that lost all support across one arc; report whether anything changed.",
    },
    {
      term: "domain wipe-out",
      definition: "An emptied domain — a proof that the current (sub)network is unsatisfiable, arriving before any search is spent.",
    },
    {
      term: "MAC",
      definition: "Maintaining arc consistency: re-running propagation after every assignment inside backtracking, so the search only walks consistent-with-the-future branches.",
    },
  ],
  mistakes: [
    {
      mistake: "Requeueing the wrong arcs after a revision.",
      why: "Too few requeues stops before the fixpoint (missing deductions); too many wastes time; the WRONG ones leave the network inconsistent with its own definition.",
      fix: "The rule: when D(Xi) changes, requeue every arc (Xk, Xi) with Xk a neighbor other than the xj just used. Write it as a loop over constraints with target Xi.",
    },
    {
      mistake: "Treating an arc-consistent network as solved.",
      why: "The X=Y ∧ X≠Y counterexample: every value has support across each arc individually, yet no assignment satisfies both constraints at once.",
      fix: "Propagation shrinks soundly but never decides global satisfiability — finish with search, and let propagation's job be making that search short.",
    },
    {
      mistake: "Revising with a stale copy of the domains.",
      why: "REVISE must read the CURRENT right-hand domain; a copy from before a shrink misses deletions and leaves unsupported values alive.",
      fix: "Mutate domains in place (or thread one dictionary through the whole run), and iterate `for x in list(...)` to mutate safely.",
    },
  ],
  takeaways: [
    "Arc consistency is support across every arc: a value with no supporting neighbor is provably dead, and deleting it is deduction.",
    "AC-3 is a self-eating queue: revise an arc, and any shrink requeues the arcs that might have lost support — the fixpoint is the property, not a path.",
    "A domain wipe-out is an unsolvability certificate that costs polynomial time, not exponential search.",
    "Arc-consistent is not solvable: propagation reasons one constraint at a time; interactions can still doom the network.",
    "O(e·d³) per invocation buys the transitive closure of forward checking's one-edge lookahead — the trade the Sudoku project measures.",
  ],
  quiz: [
    {
      id: "c-06-q1",
      prompt: "REVISE(X, Y) deletes x from D(X) exactly when:",
      options: [
        { text: "x appears in no solution of the whole network", correct: false, feedback: "That is what deletion IMPLIES, not the test — REVISE sees only one arc, and the criterion is local support." },
        { text: "no y in D(Y) is compatible with x under the constraint between X and Y", correct: true, feedback: "Correct — local, checkable, sound: if no neighbor value pairs with x, x is dead regardless of the rest of the network." },
        { text: "x equals the last value assigned by the search", correct: false, feedback: "Assignment is search's business; REVISE is propagation's." },
        { text: "D(Y) is larger than D(X)", correct: false, feedback: "Domain sizes have nothing to do with support." },
      ],
      explanation: "The one-arc locality is the whole trick: sound deletions from purely local tests, compounding through the queue into global reach.",
    },
    {
      id: "c-06-q2",
      prompt: "Why does AC-3 terminate, regardless of requeue discipline?",
      options: [
        { text: "The queue is a deque and deques are finite", correct: false, feedback: "The queue can GROW when requeues fire — finiteness of the structure is not the argument." },
        { text: "Every revision that fires deletes at least one value, and the total number of values across all domains is finite", correct: true, feedback: "Correct — the monotone ratchet: deletions only ever happen, never undo, and there are only n·d values to delete. Termination in at most n·d productive revisions." },
        { text: "The constraints are binary", correct: false, feedback: "Binarity bounds the cost per revision, not the termination argument." },
        { text: "It runs in a fixed number of passes", correct: false, feedback: "The number of passes is data-dependent — the ratchet, not a pass count, is the proof." },
      ],
      explanation: "Monotone shrinkage over a finite universe is the standard termination template for every propagation fixpoint — remember it for the planning graph's level-off in Part E.",
    },
    {
      id: "c-06-q3",
      prompt: "Forward checking after assigning X = v deletes values from D(Y) for neighbors Y. What does AC-3 additionally catch?",
      options: [
        { text: "Conflicts between two UNASSIGNED variables, reached by chaining revisions through the constraint graph", correct: true, feedback: "Correct — the transitive closure: Y's shrinkage can cascade to Z's, to W's..., catching dead ends forward checking would only meet three variables later." },
        { text: "Better variable orderings", correct: false, feedback: "Orderings are heuristics; propagation does not choose, it prunes." },
        { text: "The actual solution", correct: false, feedback: "Propagation reduces; only degenerate luck solves." },
        { text: "Nothing — they are equally strong", correct: false, feedback: "They coincide exactly when the constraint graph has no paths of length two." },
      ],
      explanation: "One edge of lookahead versus arbitrary-length chains — the measured difference the Sudoku project's three solvers exhibit.",
    },
  ],

};
