/**
 * LESSON_C_05 — "Forward Checking" (25 min, concept).
 *
 * The lookahead after each placement: prune now-impossible values from
 * unassigned neighbors' domains. The constraintGraph frame after
 * WA=r, NT=g is hand-verified (SA={b}, Q={r,b}, NSW/V/T untouched);
 * the audit program's output is REAL stdout: plain 7/4/0 against FC
 * 7 placements / 9 prunes / 0 wipe-outs on the WA-first order — and
 * the lesson's selling point, the one-swap order where plain pays
 * 8/6/1 (c-03's e2) but FC pays 8/1/0 + 10 prunes + 1 wipe-out: the
 * dead end caught at the placement itself. The two-unassigned
 * conflict FC cannot see is c-06's setup.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_C_05: ClassicalLesson = {
  slug: "c-05",
  title: "Forward Checking",
  minutes: 25,
  summary:
    "After each assignment, delete now-impossible values from unassigned neighbors — see dead ends before reaching them.",
  kind: "concept",
  objectives: [
    "Apply the forward-checking rule by hand: after a placement, derive every neighbor's shrunken domain, value by value",
    "Distinguish FC's three counters from plain backtracking's — prunes and wipe-outs against rejections and retreats — and say what each one means",
    "Explain the one-level-earlier detection with the measured one-swap instance: plain 8 placements / 6 rejected / 1 retreat against FC's 8 / 1 / 0 plus one caught wipe-out",
    "State precisely what forward checking cannot see — a conflict between two UNASSIGNED variables — and why that gap motivates arc consistency (c-06)",
  ],
  why: "Plain backtracking, as you traced it in c-03, has a blind spot that wastes real work: it discovers a doomed placement only when the starved variable's turn arrives, sometimes many levels later — the scheduling trace paid three retreats for a mistake made at the first placement. Forward checking spends a little bookkeeping after every placement to delete now-impossible values from unassigned neighbors' domains, and in exchange the search sees dead ends coming: a domain that empties is a variable that will never be assignable, known the instant it became true. The trade is not free — pruning costs work at every node, and the audit below shows the honest bill — but on instances with any tension in them, detecting failure one level earlier orphans whole subtrees before they are entered. This lesson makes you apply the rule by hand on the part's home instance, measure plain against FC on the same orders, and — importantly — see the failure even FC still cannot catch, which is the doorway to c-06's arc consistency.",
  blocks: [
    {
      kind: "text",
      text: "The scheduling trace of c-03 ended with three retreats, and the first of them answered a mistake made two placements earlier: J3 = 1 doomed J1 from the moment it was placed, but the search only learned this when J1's three slots were rejected, one by one. Forward checking closes exactly that gap — with one rule applied after every placement. When a variable receives a value, walk its unassigned neighbors and delete from each domain every value the placement just made impossible. The deletes are cheap, mechanical, and sound: no deleted value could ever have survived the past-only check anyway. What the deletes buy is foresight: a domain that empties is a dead end announced at the moment of its cause, not at the moment of its discovery. This lesson draws that wake — the pruned frame — by hand, runs plain and FC side by side, and then names the failure even FC is blind to.",
    },
    {
      kind: "definition",
      term: "forward checking",
      informal:
        "After each placement X = v, delete from every UNASSIGNED neighbor's domain the values inconsistent with v. A domain that empties (a wipe-out) means the placement is refused immediately.",
      formal:
        "D_{next}(X_j) = \\text{the values } w \\in D(X_j) \\text{ consistent with } v",
      why: "Each deletion is sound — the deleted value would have failed the past-only check later anyway; deleting it early just moves the news forward.",
    },
    { kind: "heading", text: "The frame: one placement and its wake" },
    {
      kind: "constraintGraph",
      title: "Australia after WA = r and NT = g, under forward checking",
      variables: [
        { id: "WA", label: "WA", domain: ["r"], x: 16, y: 52, tone: "assigned" },
        { id: "NT", label: "NT", domain: ["g"], x: 42, y: 24, tone: "assigned" },
        { id: "SA", label: "SA", domain: ["b"], x: 46, y: 60 },
        { id: "Q", label: "Q", domain: ["r", "b"], x: 70, y: 32 },
        { id: "NSW", label: "NSW", domain: ["r", "g", "b"], x: 74, y: 60 },
        { id: "V", label: "V", domain: ["r", "g", "b"], x: 84, y: 80 },
        { id: "T", label: "T", domain: ["r", "g", "b"], x: 60, y: 90 },
      ],
      constraints: [
        { a: "WA", b: "NT", label: "≠" },
        { a: "WA", b: "SA", label: "≠" },
        { a: "NT", b: "SA", label: "≠" },
        { a: "NT", b: "Q", label: "≠" },
        { a: "SA", b: "Q", label: "≠" },
        { a: "SA", b: "NSW", label: "≠" },
        { a: "SA", b: "V", label: "≠" },
        { a: "Q", b: "NSW", label: "≠" },
        { a: "NSW", b: "V", label: "≠" },
      ],
      frameNote: "The state after the c-03 trace's first two placements, with forward checking's deletions applied.",
      caption:
        "WA and NT hold their values; every unassigned domain shows only what survives the wake. SA is one step from forced — only b remains.",
    },
    {
      kind: "text",
      text: "Verify the frame by hand, deletion by deletion — this is the discipline. WA = r prunes r from its neighbors: NT loses r, SA loses r. NT = g prunes g from its neighbors: SA loses g, Q loses g. Nothing else is touched — NSW, V and T have no assigned neighbors yet, so their domains stand full. The result: **SA = {b}** (lost r to WA, g to NT — the hub is one step from forced, and note it was two rejections in c-03's plain trace; here it is two deletions made at the moment of cause); **Q = {r, b}** (lost g to NT); **NSW, V, T untouched**. If some placement had emptied a domain — say WA and NT had taken r and b — SA would show `[]` and the frame itself would be the dead end, known before SA's turn ever came. That is the entire mechanism: no new constraints, no lookahead beyond immediate neighbors, just the past-only check's work done early and remembered in the domains.",
    },
    { kind: "heading", text: "The audit: plain and FC, same orders, real counters" },
    {
      kind: "code",
      title: "Plain backtracking vs forward checking on Australia",
      lang: "python",
      code: `"""Plain vs forward checking. Counters — plain: placements (incl.
undone), rejected (past-vetoed trials), retreats (loop exhaustions).
FC: placements, rejected (trials whose propagation wiped out a
neighbor), retreats, prunes (deletions performed, incl. rolled back),
wipe-outs (domains emptied)."""

NEIGHBORS = {
    "WA": ["NT", "SA"], "NT": ["WA", "SA", "Q"], "SA": ["WA", "NT", "Q", "NSW", "V"],
    "Q": ["NT", "SA", "NSW"], "NSW": ["SA", "Q", "V"], "V": ["SA", "NSW"],
}
COLORS = ["r", "g", "b"]


def plain(order):
    placements = rejected = retreats = 0
    a = {}

    def consistent(var, val):
        return all(a.get(n) != val for n in NEIGHBORS.get(var, []))

    def bt(i):
        nonlocal placements, rejected, retreats
        if i == len(order):
            return True
        for val in COLORS:
            if consistent(order[i], val):
                placements += 1
                a[order[i]] = val
                if bt(i + 1):
                    return True
                del a[order[i]]
            else:
                rejected += 1
        retreats += 1
        return False

    bt(0)
    return placements, rejected, retreats


def forward(order):
    placements = rejected = retreats = prunes = wipeouts = 0
    a = {}
    domains = {v: list(COLORS) for v in order}
    log = []

    def bt(i):
        nonlocal placements, rejected, retreats, prunes, wipeouts
        if i == len(order):
            return True
        var = order[i]
        for val in list(domains[var]):
            placements += 1
            a[var] = val
            saved = {}
            for n in NEIGHBORS.get(var, []):
                if n in a:
                    continue
                for w in list(domains[n]):
                    if w == val:
                        domains[n].remove(w)
                        saved.setdefault(n, []).append(w)
            prunes += sum(len(ws) for ws in saved.values())
            wiped = [n for n, d in domains.items() if n not in a and not d]
            if wiped:
                wipeouts += 1
                rejected += 1
                log.append(f"place {var}={val} -> WIPE-OUT on {wiped[0]}, value rejected")
                for n, ws in saved.items():
                    domains[n].extend(ws)
                del a[var]
                continue
            log.append(f"place {var}={val} -> pruned {sum(len(ws) for ws in saved.values())} value(s)")
            if bt(i + 1):
                return True
            retreats += 1
            del a[var]
            for n, ws in saved.items():
                domains[n].extend(ws)
        retreats += 1
        return False

    bt(0)
    return placements, rejected, retreats, prunes, wipeouts, log


print("== plain, order WA NT SA Q NSW V T ==")
print("placements=%d rejected=%d retreats=%d" % plain(["WA", "NT", "SA", "Q", "NSW", "V", "T"]))

print("== forward checking, same order ==")
p, r, t, pr, w, log = forward(["WA", "NT", "SA", "Q", "NSW", "V", "T"])
print(f"placements={p} rejected={r} retreats={t} prunes={pr} wipe-outs={w}")
for line in log:
    print(" ", line)

print("== forward checking, the one-swap order (WA NT SA NSW Q V T) ==")
p, r, t, pr, w, log = forward(["WA", "NT", "SA", "NSW", "Q", "V", "T"])
print(f"placements={p} rejected={r} retreats={t} prunes={pr} wipe-outs={w}")
for line in log:
    print(" ", line)`,
      output: `== plain, order WA NT SA Q NSW V T ==
placements=7 rejected=4 retreats=0
== forward checking, same order ==
placements=7 rejected=0 retreats=0 prunes=9 wipe-outs=0
  place WA=r -> pruned 2 value(s)
  place NT=g -> pruned 2 value(s)
  place SA=b -> pruned 3 value(s)
  place Q=r -> pruned 1 value(s)
  place NSW=g -> pruned 1 value(s)
  place V=r -> pruned 0 value(s)
  place T=r -> pruned 0 value(s)
== forward checking, the one-swap order (WA NT SA NSW Q V T) ==
placements=8 rejected=1 retreats=0 prunes=10 wipe-outs=1
  place WA=r -> pruned 2 value(s)
  place NT=g -> pruned 2 value(s)
  place SA=b -> pruned 3 value(s)
  place NSW=r -> WIPE-OUT on Q, value rejected
  place NSW=g -> pruned 1 value(s)
  place Q=r -> pruned 0 value(s)
  place V=r -> pruned 0 value(s)
  place T=r -> pruned 0 value(s)`,
    },
    {
      kind: "text",
      text: "Read the three blocks as one argument. On the lucky WA-first order, plain and FC both glide home — plain paying 4 rejections on the way, FC paying 9 prunes instead, and neither meeting a dead end (the rejections and prunes are the same four events plus SA's third-color exclusions, counted in different currencies). The one-swap order is where the currencies diverge in value. Plain on that order (c-03's exercise e2) paid **8 placements, 6 rejected, 1 retreat** — it placed NSW = r, descended to Q, watched all three of Q's values die, and retreated. Forward checking on the same order pays **8 placements, 1 rejected, 0 retreats, 10 prunes, 1 wipe-out** — it placed NSW = r, propagated, watched Q's domain EMPTY — r taken by NSW, g by NT, b by SA — and refused the placement on the spot. The same doomed branch, detected at its cause: one wipe-out against one retreat plus three rejections. That is the one-level-earlier promise, measured. And the honest ledger: FC does work plain never does (prunes at every placement, rolled back on every retreat), so on tension-free instances it is pure overhead — the trade the project's Sudoku ladder will price properly.",
    },
    { kind: "heading", text: "What forward checking still misses" },
    {
      kind: "text",
      text: "FC's prunes are triggered by ASSIGNMENTS — only a placed value wakes the rule. So a conflict between two still-UNASSIGNED variables is invisible until one of them is placed. Concretely: take the frame above one step further, SA = b. Propagation prunes b from Q, NSW and V — Q = {r}, NSW = {r, g}, V = {r, g} — and nothing wipes out. But look closely: Q = {r} means Q WILL be r; NSW's domain still contains r, and NSW neighbors Q. The coming collision — Q = r and NSW losing r to it — is already determined by the current domains, yet FC reports nothing: no assignment has happened since the domains took this shape, so no rule has fired. Arc consistency — c-06's subject — closes exactly this gap: it demands that EVERY value in EVERY domain has support in every neighbor's domain, checked on the whole network, not just the wake of the latest placement. FC is one step of directional consistency after each assignment; AC-3 is the fixpoint of that idea applied everywhere. The gap between them is where the scheduling trace's last retreat came from — and where the next lesson goes.",
    },
    {
      kind: "pseudocode",
      title: "FC-BACKTRACK — the c-03 engine plus the wake",
      lines: [
        { text: "PROCEDURE FC-BACKTRACK(assignment A, domains D)", indent: 0 },
        { text: "IF every variable is assigned: RETURN A", indent: 1 },
        { text: "var ← next unassigned variable", indent: 1 },
        { text: "FOR each value v remaining in D[var]:", indent: 1 },
        { text: "place var = v; record prunes P ← deletions in unassigned neighbors", indent: 2, tone: "key", note: "the wake: each neighbor loses its v-inconsistent values" },
        { text: "IF some domain in D is empty (wipe-out):", indent: 2 },
        { text: "undo var = v and roll back every prune in P; continue the loop", indent: 3, tone: "key", note: "refusal at the moment of cause — plain backtracking learns this only at the starved variable's turn" },
        { text: "result ← FC-BACKTRACK(A, D)", indent: 2 },
        { text: "IF result succeeds: RETURN result", indent: 3 },
        { text: "undo var = v; roll back every prune in P", indent: 3, note: "rollback is bookkeeping, not re-search" },
        { text: "RETURN failure", indent: 1 },
      ],
      note: "Same depth-first skeleton as c-03; the only additions are the wake after each placement and its rollback on retreat. Cost per node rises; dead ends surface no later than one level after their cause.",
    },
    {
      kind: "exercise",
      id: "c-05-e1",
      exerciseKind: "concept-check",
      prompt:
        "In the frame after WA = r, NT = g, why is NSW's domain still {r, g, b} while SA's is down to {b}?",
      options: [
        {
          text: "NSW is farther from the goal, so its domain is pruned last",
          correct: false,
          feedback: "Domains have no notion of goal distance — pruning is a purely local consequence of who is assigned.",
        },
        {
          text: "NSW's neighbors (SA, Q, V) are all still unassigned, so no placement has fired the rule on NSW yet; SA neighbors WA and NT, both assigned, and lost r to the one and g to the other",
          correct: true,
          feedback: "Exactly — the wake touches only the placed variable's neighbors. NSW's turn will come when SA, Q or V receives a value.",
        },
        {
          text: "NSW has a larger domain by definition — three colors are always available at the periphery",
          correct: false,
          feedback: "The domain sizes are consequences of the constraint graph and the assignment, not definitions. Put WA, NT on NSW's borders and its domain would shrink too.",
        },
        {
          text: "The propagation has not finished running — one more pass would prune NSW",
          correct: false,
          feedback: "Tempting, and exactly the instinct c-06 formalizes — but FC as defined fires only on placements. No new pass exists in this algorithm; that IS its blind spot.",
        },
      ],
      solution:
        "Forward checking's deletions are triggered by assignments, and only the placing variable's neighbors feel them. WA = r and NT = g pruned their neighbors — NT, SA (from WA) and SA, Q (from NT). NSW borders SA, Q and V, none assigned, so nothing has fired on NSW yet. The frame is complete as drawn: FC has no 'extra pass' — that improvement is c-06's arc consistency.",
      explanation:
        "The distractor (d) names the real limitation: FC is not incomplete because it stopped early — it is designed to fire only on placements. Arc consistency is the rule that runs everywhere.",
      concepts: ["forward checking", "domain pruning", "wake"],
    },
    {
      kind: "exercise",
      id: "c-05-e2",
      exerciseKind: "trace",
      prompt:
        "Continue the frame by hand: SA takes b. Apply forward checking's rule, report every pruned value, all remaining domains, and whether any wipe-out occurs. Then say what plain backtracking would have counted for the same two steps (WA=r, NT=g, SA=b) and compare the two ledgers.",
      solution: `SA = b prunes b from its unassigned neighbors: Q loses b (Q was
{r, b}, becomes {r}), NSW loses b (becomes {r, g}), V loses b (becomes
{r, g}). WA, NT, T untouched by this placement (T has no borders; WA,
NT are assigned). No domain is empty: Q = {r}, NSW = {r, g}, V = {r, g}
— no wipe-out, and the placement stands.

Plain backtracking on the same three placements: WA = r placed (no
check needed), NT = g placed after ONE rejection (r vetoed by WA),
SA = b placed after TWO rejections (r vetoed by WA, g vetoed by NT)
— the c-03 trace's first three placements, 3 placements / 3 rejected.
FC's ledger for the same stretch: 3 placements, 0 rejections, 7 prunes
so far (2 from WA=r, 2 from NT=g, 3 from SA=b), 0 wipe-outs.

The comparison in one sentence each: plain pays at the moment of
trial (rejections, later, at each variable's own turn); FC pays at
the moment of cause (prunes, immediately, in the neighbors' domains)
— the same information, moved earlier and remembered, so the coming
collisions (Q will be r; NSW still holds r) are visible in the
domains before anyone's turn arrives.`,
      explanation:
        "Seven prunes total across the three placements — 2 + 2 + 3 — each one a rejection plain backtracking would have logged later, at the starved variable's turn. The remaining domain Q = {r} is the loaded gun c-06's text points at.",
      concepts: ["forward checking", "prunes", "wipe-out"],
    },
  ],
  terms: [
    {
      term: "forward checking",
      definition: "The lookahead rule: after each placement, delete from unassigned neighbors' domains the values the placement made impossible — dead ends become visible at their cause.",
    },
    {
      term: "domain pruning",
      definition: "The deletion of values from a variable's domain as a consequence of constraints — sound because every deleted value would have failed the later check anyway.",
    },
    {
      term: "wipe-out",
      definition: "A domain emptied by pruning — the signal that the current partial assignment cannot be extended, detected one level (at least) before plain backtracking would find it.",
    },
    {
      term: "dead-end prediction",
      definition: "The general idea FC instances: use the domains as a scoreboard of the future, so that a doomed branch is refused at the placement that doomed it.",
    },
  ],
  mistakes: [
    {
      mistake: "Pruning from ASSIGNED neighbors' domains",
      why: "Assigned variables' domains are irrelevant — their values are fixed, and the wake's purpose is to inform the FUTURE, not to re-derive the past.",
      fix: "Apply the rule only to unassigned neighbors; an assigned neighbor's consistency was settled when its own value was placed.",
    },
    {
      mistake: "Forgetting the rollback on retreat",
      why: "When a placement is undone, its prunes must be undone too — otherwise the domains carry deletions from a branch the search has abandoned, and later branches inherit phantom constraints.",
      fix: "Record every deletion with its causing placement; undo them in exactly the same stack order. The audit engine's `saved` dictionary is that bookkeeping.",
    },
    {
      mistake: "Calling forward checking arc consistency",
      why: "FC fires only on placements and only on the placed variable's neighbors; arc consistency is a property of the WHOLE network, checked until fixpoint — the difference is exactly the Q={r}, NSW∋r collision the lesson's close exhibits.",
      fix: "Say: FC is one step of directional consistency applied after each assignment (c-06 runs the idea to its fixpoint, everywhere).",
    },
    {
      mistake: "Expecting FC to reduce placements on every instance",
      why: "On tension-free instances (the WA-first order), FC's prunes buy nothing — plain's 4 rejections and FC's 9 prunes are two currencies paying for the same uneventful walk.",
      fix: "Frame FC as insurance: overhead at every node, dividends where dead ends would have been — and measure both, as the audit and the project's ladder do.",
    },
  ],
  takeaways: [
    "After each placement, prune the placed variable's unassigned neighbors — every deletion is sound and moves a future rejection to the present.",
    "A wiped-out domain is a dead end refused at its cause: the one-swap order measured plain's 8/6/1 against FC's 8/1/0 with one caught wipe-out.",
    "Prunes and rejections are two currencies for the same information — at trial (plain) or at cause (FC); the ledgers differ exactly when dead ends loom.",
    "Rollback is part of the rule: a retreat undoes the placement AND its prunes, in stack order, or later branches inherit phantom constraints.",
    "FC's blind spot is the two-unassigned conflict — domains already encode a coming collision no rule has fired on; arc consistency (c-06) closes it.",
  ],
  quiz: [
    {
      id: "c-05-q1",
      prompt: "Forward checking places SA = b in the lesson's frame. Which deletions does the rule perform?",
      options: [
        { text: "b is removed from Q, NSW and V — SA's unassigned neighbors", correct: true, feedback: "Exactly the wake: each unassigned neighbor loses the values inconsistent with b — here just b itself (not-equal constraints)." },
        { text: "b is removed from every variable in the graph", correct: false, feedback: "The wake is local — only SA's neighbors feel a placement, and only unassigned ones. WA, NT and T are untouched." },
        { text: "Nothing — b is SA's last value, so no propagation is possible", correct: false, feedback: "Being the last value makes SA forced, not silent — the placement still prunes its neighbors (Q loses b, becoming {r})." },
        { text: "r is removed from Q because Q must now differ from NSW", correct: false, feedback: "That constraint binds Q and NSW — neither is assigned, so FC has no trigger. It is precisely the collision the lesson's close leaves for c-06." },
      ],
      explanation: "One rule, applied locally: the placed variable's unassigned neighbors each lose their placement-inconsistent values — three deletions here, one per neighbor.",
    },
    {
      id: "c-05-q2",
      prompt: "The one-swap order measured: plain 8 placements / 6 rejected / 1 retreat; FC 8 placements / 1 rejected / 0 retreats / 10 prunes / 1 wipe-out. What exactly did FC catch that plain did not?",
      options: [
        { text: "That the instance was unsolvable in that branch — plain would have run forever", correct: false, feedback: "Both searches solved the instance; plain was merely slower to learn what FC knew immediately. No divergence in outcome, only in the bill." },
        { text: "That NSW = r empties Q's domain — r (NSW), g (NT), b (SA) leaves Q nothing — so the placement is refused at the spot instead of after a descent and a retreat", correct: true, feedback: "The measured contrast in one sentence: the wipe-out on Q converted plain's 3 rejections + 1 retreat into 1 immediate refusal." },
        { text: "That NSW should have been assigned before Q", correct: false, feedback: "FC maintains domains; it does not reorder variables. Ordering is c-07's subject — and the swap that caused all this is the lesson's bridge to it." },
        { text: "That Q's domain had contained an illegal value all along", correct: false, feedback: "No value was illegal in itself — r became impossible only once NSW held it. Soundness of deletions is always relative to the current assignment." },
      ],
      explanation: "Same doomed branch, two discovery times: plain at Q's turn (3 rejections, 1 retreat), FC at NSW's placement (1 wipe-out, 1 refusal). The bill difference is the entire value proposition.",
    },
    {
      id: "c-05-q3",
      prompt: "After SA = b in the frame, Q = {r}, NSW = {r, g}, V = {r, g} — and yet forward checking reports no problem. Why is that NOT a bug?",
      options: [
        { text: "It is a bug — the domains prove the instance has no solution", correct: false, feedback: "The instance HAS a solution (c-01 exhibited one); the domains merely encode a coming collision that will surface when Q or NSW is placed." },
        { text: "FC's rule fires on assignments only — no assignment occurred since the domains took this shape, so no deletion is licensed; the collision is real but FC's contract does not cover it", correct: true, feedback: "Correct — and the gap between contract and coverage is exactly what arc consistency (c-06) is for: check every value's support in every neighbor's domain, assignments or none." },
        { text: "The collision is not real, because r could still be pruned from NSW later", correct: false, feedback: "It is real in the sense that IF Q takes r (it must — Q = {r}), NSW loses r. What is missing is only the rule that draws consequences from unassigned domains." },
        { text: "FC only checks the variable about to be assigned, and Q is not next", correct: false, feedback: "FC does not even check the next variable — it prunes neighbors of the placed one. There is no 'about to be assigned' trigger anywhere in the algorithm." },
      ],
      explanation: "Q = {r} and NSW ∋ r with Q–NSW adjacent is the canonical FC blind spot: determined doom, undischarged rule — the doorway to c-06.",
    },
  ],
};
