/**
 * Lesson d-07 — authored unit for Part D (see
 * agent-ctx/CLASSICAL-AUTHORING.md). Every `output` below is the REAL
 * output of running the code with python3 (scripts/verify-one-lesson.ts
 * machine-verifies it).
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_D_07: ClassicalLesson = {

  slug: "d-07",
  title: "Resolution and Skolemization",
  minutes: 35,
  summary:
    "Strip the quantifiers without changing satisfiability, then resolve: a complete proof procedure for first-order logic.",
  kind: "coding",
  objectives: [
    "Run the five-step pipeline from formula to clause set — prenex, Skolemize, drop the universals, CNF, clauses — defending each Skolem symbol's kind (function or constant) by what encloses it",
    "State exactly what Skolemization preserves (satisfiability, in both directions) and what it gives up (equivalence), and why the weaker contract is all a refutation needs",
    "Apply the lifted resolution rule by hand through a complete refutation, computing and recording the MGU at every resolution step",
    "Lift d-04's prover to first-order logic — the unifier swapped into the pair test, substitution bookkeeping around an unchanged loop — and say precisely what □, saturation, and a still-running search each certify",
  ],
  why: "Why does this lesson exist, when d-04 already proved things and d-06 already matches terms? Because between them sits a gap the size of first-order logic: resolution consumes clauses, and real knowledge arrives quantified — everyone has a mother, every dog barks, someone owns Fifi. The pipeline that closes the gap is one of automated reasoning's genuinely clever constructions: since quantifiers cannot be removed while keeping equivalence, Skolemization instead NAMES each existential's witness with a fresh function or constant, preserving satisfiability — the only property a refutation ever consults. Get the dependence right (a function under a universal, a constant otherwise) and the lifted rule with most general unifiers inherits soundness and refutation completeness; get it wrong and the prover happily certifies false theorems. The same architecture, ported wholesale, runs inside real theorem provers and Prolog compilers; and its honest limit — semi-decidability, the non-theorem that may run forever — is the boundary that motivates what d-08 does next with knowledge graphs.",
  blocks: [
    // ------------------------------------------------------------ opening
    {
      kind: "text",
      text: "Lesson d-04 ended with a promise: the prover's three pieces — clause representation, resolve loop, saturation check — lift to first-order logic with exactly one new idea plugged in, and d-06 built that idea: the unifier. What still stands between a first-order knowledge base and the clause set the rule consumes is not deduction at all — it is the quantifiers. Resolution eats finite sets of quantifier-free literals, and real knowledge arrives quantified: *everyone has a mother*, *every dog barks*, *someone owns Fifi*. This lesson removes the quantifiers without changing the one property a refutation ever consults — satisfiability — and then runs the lifted rule end to end on a real argument, unifier recorded at every step, by hand and in Python.",
    },

    // ------------------------------------------------------------ pipeline
    { kind: "heading", text: "From formula to clauses: the pipeline" },
    {
      kind: "steps",
      title: "Formula to clauses — the five steps",
      items: [
        "Prenex — pull every quantifier to the front, renaming variables as needed: a negation crosses a quantifier and flips it (¬∀x φ ≡ ∃x ¬φ, ¬∃x φ ≡ ∀x ¬φ), and the connectives slide out of the quantifiers' way.",
        "Skolemize — eliminate each ∃ by NAMING its witness: an ∃ with universals to its left becomes a fresh FUNCTION with those universals as arguments (∀y∃x P(x, y) becomes P(f(y), y) — the witness depends on y); an ∃ with nothing to its left becomes a fresh CONSTANT (∃x P(x) becomes P(c)).",
        "Drop the ∀s — after Skolemization every remaining variable is universally quantified, and clausal notation reads all variables as implicitly universal, so the binders are redundant.",
        "CNF — d-04's laws, unchanged: implications out, negations pushed onto atoms, ∨ distributed over ∧, tautologous clauses dropped.",
        "Clauses — read off the clause sets and standardize apart: rename variables so that no two clauses share a name.",
      ],
    },
    {
      kind: "definition",
      term: "Skolem normal form",
      informal:
        "A prenex formula with every existential quantifier removed by naming its witness: a fresh function of the enclosing universals when there are any, a fresh constant when there are none. What remains is universally quantified and one implication-law away from clauses.",
      formal: "\\forall y\\ \\exists x\\ P(x, y) \\quad => \\quad \\forall y\\ P(f(y), y)",
      why: "The Skolem symbol records exactly the dependence the ∃ asserted — the witness of x may vary with y — which is why dropping the quantifier costs no satisfiability.",
    },
    {
      kind: "definition",
      term: "clausal form",
      informal:
        "A set of clauses — each a set of quantifier-free literals, every variable implicitly universal — the one data shape the resolution rule consumes. First-order clausal form is d-04's propositional one plus terms: a literal is now an atom such as Mother(M(x), x) applied to variables, constants and function terms.",
      formal:
        "C_1 \\wedge C_2 \\wedge \\dots \\wedge C_m \\quad \\text{where each } C_i = L_1 \\lor \\dots \\lor L_k \\text{, variables implicitly universal}",
      why: "With quantifiers gone, d-04's machinery applies verbatim — the lifting is done in the data, not in the rule's bookkeeping.",
    },
    {
      kind: "math",
      title: "What Skolemization preserves — and what it does not",
      displays: [
        { expr: "\\exists x\\ P(x) \\quad => \\quad P(c)", label: "a free ∃ becomes a constant" },
        { expr: "KB \\wedge \\exists x\\ P(x) \\models \\bot \\iff KB \\wedge P(c) \\models \\bot", label: "satisfiability, both directions" },
        { expr: "P(c) \\rightarrow \\exists x\\ P(x)", label: "equivalence, one direction only" },
      ],
      caption:
        "The contract, stated precisely: **Skolemization preserves satisfiability, not equivalence.** A clause set is unsatisfiable together with ∃x P(x) exactly when it is unsatisfiable together with P(c) (c fresh) — if the original had a model, some element witnesses P and c can be interpreted as that element; conversely, any model of P(c) is already a model of ∃x P(x). That is everything a refutation consults. Equivalence it is not: a world where P(a) holds while c names some b that is not a satisfies ∃x P(x) and falsifies P(c). Every rewrite in d-04's conversion was an equivalence; the quantifier-stripping step cannot be, and the pipeline stays honest by promising less.",
    },

    // ------------------------------------------------------------ the lifted rule + worked example
    { kind: "heading", text: "The lifted rule, and one argument by hand" },
    {
      kind: "math",
      title: "Binary resolution, lifted",
      displays: [
        { expr: "\\frac{C_1 \\lor A \\qquad \\neg B \\lor C_2 \\qquad \\sigma = \\text{mgu}(A, B)}{(C_1 \\lor C_2)\\sigma}", label: "lifted resolution" },
        { expr: "\\frac{\\{\\neg Dog(x), Barks(x)\\} \\quad \\{Dog(rena)\\} \\quad \\sigma = \\{x/rena\\}}{\\{Barks(rena)\\}}", label: "one step of the battery's refutation" },
        { expr: "\\{\\neg P, Q\\} + \\{\\neg Q, R\\} => \\{\\neg P, R\\}", label: "d-03's preview: the same rule, σ = {}" },
      ],
      caption:
        "The rule d-03 previewed and d-04 made into a whole calculus, plus one ingredient: the two clashing atoms need no longer be IDENTICAL, only UNIFIABLE. Find the complementary pair, compute the most general unifier σ, delete the pair, apply σ to everything that remains. In the middle display the MGU {x/rena} is the workhorse — one unifier instantiates the universal for the individual in question, universal instantiation hiding inside resolution. With σ = {} throughout, the bottom display is exactly the top one: the propositional rule is the lifted rule with nothing to unify. Soundness carries over unchanged (a resolvent is entailed by its parents); refutation completeness is the lifted calculus's triumph, with a fairness condition this lesson states exactly.",
    },
    {
      kind: "example",
      title: "Everyone is loved — English to □, with every unifier",
      problem:
        "Premises: everyone has a mother; every mother loves her child. Prove: everyone is loved. Run the whole pipeline by hand — translation, negation of the goal, Skolemization, clauses — then refute, recording the unifier at every resolution step.",
      steps: [
        {
          text: "Translate the English.",
          detail:
            "Everyone has a mother: ∀x∃y Mother(y, x). Every mother loves her child: ∀x∀y (Mother(y, x) → Loves(y, x)). Goal: ∀x∃y Loves(y, x). Note the goal's ∃ sits under a ∀ — and so does premise 1's: both witness-dependencies must be handled, one on each side of the refutation.",
        },
        {
          text: "Negate the goal.",
          detail:
            "¬∀x∃y Loves(y, x) ≡ ∃x∀y ¬Loves(y, x): someone is loved by nobody. The negation crossed both quantifiers, flipping each — d-06's quantifier negation doing real work.",
        },
        {
          text: "Prenex and Skolemize — three different cases.",
          detail:
            "Premise 1: the ∃y sits under ∀x, so it becomes a Skolem FUNCTION: Mother(M(x), x), read 'M(x) is a mother of x' — the witness may differ per child. Premise 2: no existentials; the implication law gives ¬Mother(y, x) ∨ Loves(y, x). Negated goal: its ∃x has no universal to its left (the ∀y is to its RIGHT, inside its scope), so it becomes a Skolem CONSTANT: ¬Loves(y, C), read 'C is loved by nobody'.",
        },
        {
          text: "Drop the ∀s, take CNF, standardize apart.",
          detail:
            "All three are already clauses; rename premise 2's variables so no two clauses share a name. The working set: C1 {Mother(M(x), x)}, C2 {¬Mother(y, w), Loves(y, w)}, C3 {¬Loves(v, C)} — every variable implicitly universal.",
        },
        {
          text: "Resolution 1 — C1 with C2 on Mother.",
          detail:
            "Unify the atoms Mother(M(x), x) and Mother(y, w): the MGU is σ1 = {y/M(x), w/x} — the unifier carries the Skolem function into premise 2. Delete the complementary pair, apply σ1 to the residue Loves(y, w), and the resolvent is {Loves(M(x), x)}: x's mother loves x.",
        },
        {
          text: "Resolution 2 — the resolvent with C3 on Loves.",
          detail:
            "Unify Loves(M(x), x) with Loves(v, C): the MGU is σ2 = {v/M(x), x/C} — again the function is carried, this time binding x to the constant named by the negated goal. Nothing survives the clash: □.",
        },
        {
          text: "Read the refutation.",
          detail:
            "The premises plus 'C is loved by nobody' are jointly unsatisfiable, so everyone is loved. And the refutation says by whom: instantiating the final clash at x = C, the unified atom is Loves(M(C), C) — C is loved by M(C), their own mother. The Skolem function named the witness before we knew who would need it.",
        },
      ],
      result:
        "□ in two resolutions — σ1 = {y/M(x), w/x}, then σ2 = {v/M(x), x/C}, both MGUs carrying the Skolem function M — everyone is loved, and the proof names the lover.",
    },

    // ------------------------------------------------------------ the prover
    { kind: "heading", text: "The prover, lifted" },
    {
      kind: "pythonImpl",
      title: "A first-order resolution prover",
      intent:
        "d-04's engine with d-06's unifier swapped into the pair test: clauses as sets of term-tuple literals, the MGU printed at every step, honest about □, saturation, and the searches that would never end.",
      code: `# A first-order resolution prover -- d-04's architecture with d-06's
# unifier swapped into the pair test.
#
# TERM AND ATOM CONVENTION (from d-06): a LOWERCASE string is a
# variable ('x', 'w'); an UPPERCASE string is a constant or a function
# name ('Rena', 'M').  Hand notation writes rena lowercase -- machine
# tuples MUST write the constant 'Rena' (lowercase would make it a
# variable; that exact trap broke d-06-e1 once).
#
#   term    "x"  variable   |  "Rena"  constant  |  ("M", "x")  function
#   atom    ("Mother", ("M", "x"), "x")          predicate + arguments
#   literal (sign, atom), sign "+" or "-"
#   clause  frozenset of literals;  frozenset()  is the empty clause □

from itertools import combinations


# --- d-06's unifier, ported verbatim --------------------------------------

def unify(a, b, s={}):
    """Term tuples like ('P', 'x', ('f','y')). Returns MGU dict or None."""
    if a == b:
        return dict(s)
    if isinstance(a, str) and a.islower():          # variable
        return bind(a, b, s)
    if isinstance(b, str) and b.islower():
        return bind(b, a, s)
    if isinstance(a, tuple) and isinstance(b, tuple) and a[0] == b[0] and len(a) == len(b):
        for x, y in zip(a[1:], b[1:]):
            s2 = unify(x, y, s)
            if s2 is None:
                return None
            s = s2
        return dict(s)
    return None

def bind(var, term, s):
    if var in s:
        return unify(s[var], term, s)
    if occurs(var, term, s):
        return None                                # occurs check
    out = dict(s); out[var] = term
    return out

def occurs(var, term, s):
    if term == var:
        return True
    if isinstance(term, tuple):
        return any(occurs(var, t, s) for t in term[1:])
    if isinstance(term, str) and term in s:
        return occurs(var, s[term], s)
    return False


# --- substitution bookkeeping: the new plumbing ----------------------------

def subst(t, s):
    """Apply s to term t, following chains (w -> x -> a) to fixpoint."""
    if isinstance(t, str):
        return subst(s[t], s) if t in s else t
    return (t[0],) + tuple(subst(x, s) for x in t[1:])

def variables_in(clause):
    def walk(t):
        if isinstance(t, str):
            return {t} if t.islower() else set()
        out = set()
        for x in t[1:]:
            out |= walk(x)
        return out
    out = set()
    for _, atom in clause:
        out |= walk(atom)
    return out

def standardize_apart(c1, c2):
    """Rename c2's variables that also occur in c1, so unification can
    never bind same-named variables belonging to different clauses.
    (The inputs below are standardized apart on entry; the guard keeps
    the engine correct on arbitrary clause sets.)"""
    clash = variables_in(c1) & variables_in(c2)
    if not clash:
        return c2
    taken = variables_in(c1) | variables_in(c2)
    mapping = {}
    for v in sorted(clash):
        fresh = v + "'"
        while fresh in taken:
            fresh += "'"
        taken.add(fresh)
        mapping[v] = fresh
    def ren(t):
        if isinstance(t, str):
            return mapping.get(t, t)
        return (t[0],) + tuple(ren(x) for x in t[1:])
    return frozenset((s, ren(a)) for s, a in c2)


# --- clause plumbing: d-04's, with terms -----------------------------------

def term_str(t):
    if isinstance(t, str):
        return t
    return f"{t[0]}({', '.join(term_str(x) for x in t[1:])})"

def lit_str(lit):
    sign, atom = lit
    return ("¬" if sign == "-" else "") + term_str(atom)

def lit_key(lit):
    sign, atom = lit
    return (term_str(atom), sign == "-")        # P sorts before ¬P

def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(lit_str(l) for l in sorted(clause, key=lit_key)) + "}"

def clause_key(clause):
    return tuple(sorted(lit_key(l) for l in clause))

def sigma_str(sigma):
    if not sigma:
        return "{}"
    return "{" + ", ".join(f"{v}/{term_str(t)}" for v, t in sigma.items()) + "}"

def is_tautology(clause):
    pos = {atom for sign, atom in clause if sign == "+"}
    return any(sign == "-" and atom in pos for sign, atom in clause)

def canon(clause):
    """Positional variable renaming: {Loves(y, C)} and {Loves(z, C)} are
    the same clause -- dedup must not chase renamings forever."""
    mapping = {}
    def ren(t):
        if isinstance(t, str):
            if not t.islower():
                return t
            if t not in mapping:
                mapping[t] = "w%d" % (len(mapping) + 1)
            return mapping[t]
        return (t[0],) + tuple(ren(x) for x in t[1:])
    lits = sorted(clause, key=lit_key)
    return tuple((ren(a), s) for s, a in lits)


# --- the engine: d-04's loop, one seam swapped ------------------------------

def resolvents(c1, c2):
    """All resolvents of c1 and c2: for each literal pair with opposite
    signs and the same predicate, UNIFY the atoms (the negative atom
    first -- a cosmetic convention that fixes the orientation of
    variable-to-variable bindings so traces are stable), delete the
    pair, apply the MGU to the rest."""
    c2 = standardize_apart(c1, c2)
    lits1 = sorted(c1, key=lit_key)
    lits2 = sorted(c2, key=lit_key)
    out = []
    for i, (sign, a) in enumerate(lits1):
        for j, (sign2, b) in enumerate(lits2):
            if sign == sign2 or a[0] != b[0]:
                continue                 # need opposite signs, same predicate
            neg, pos = (a, b) if sign == "-" else (b, a)
            sigma = unify(neg, pos)
            if sigma is None:
                continue                 # atoms do not unify: no resolution
            residue = ([lit for k, lit in enumerate(lits1) if k != i]
                       + [lit for k, lit in enumerate(lits2) if k != j])
            r = frozenset((s, subst(atom, sigma)) for s, atom in residue)
            if is_tautology(r):
                continue                 # tautologies dropped, as in d-04
            out.append((a[0], sigma, r))
    return out

def saturate(clauses):
    """Resolve every pair in canonical order until the empty clause
    appears (proved) or a full round derives nothing new (saturated)."""
    kept, seen = [], set()
    for c in clauses:
        key = canon(c)
        if key not in seen:
            seen.add(key)
            kept.append(c)
    trace = []
    while True:
        ordered = sorted(kept, key=clause_key)
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for pred, sigma, r in resolvents(c1, c2):
                key = canon(r)
                if key in seen:
                    continue             # duplicates skipped
                seen.add(key)
                fresh.append(r)
                trace.append((c1, c2, pred, sigma, r))
                if not r:                # □ -- the refutation is complete
                    return True, kept, trace
        if not fresh:
            return False, kept, trace    # fixpoint reached: saturated
        kept.extend(fresh)

def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, kept, trace = saturate(clauses)
    for c1, c2, pred, sigma, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)} on {pred}"
              f"  [{sigma_str(sigma)}]  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(kept)} clauses, nothing new) — NOT ENTAILED")
    print()


# Case 1 -- the worked example.  Everyone has a mother (the Skolem
# FUNCTION M names each child's mother: the ∃y sits under ∀x); every
# mother loves her child; so everyone is loved.  Negated goal: someone
# (Skolem CONSTANT C: the ∃x has no enclosing ∀) is loved by nobody.
prove("1. everyone is loved   {∀x∃y Mother(y, x), ∀x∀y (Mother(y, x) → Loves(y, x))} ⊨ ∀x∃y Loves(y, x)",
      [[("+", ("Mother", ("M", "x"), "x"))],
       [("-", ("Mother", "y", "w")), ("+", ("Loves", "y", "w"))]],
      [[("-", ("Loves", "v", "C"))]])

# Case 2 -- the battery's Dog/Barks refutation (d-a1).  NOTE the
# transcription: hand notation writes rena lowercase; machine tuples
# must write the constant 'Rena' -- UPPERCASE, because d-06's unifier
# reads lowercase strings as variables.
prove("2. the Dog/Barks refutation   {∀x (Dog(x) → Barks(x)), Dog(rena)} ⊨ Barks(rena)",
      [[("-", ("Dog", "x")), ("+", ("Barks", "x"))],
       [("+", ("Dog", "Rena"))]],
      [[("-", ("Barks", "Rena"))]])

# Case 3 -- a non-theorem: affirming the consequent, first-order
# edition.  All dogs bark; Rena barks; goal: Rena is a dog.  No
# function symbols, so the clause closure is finite -- saturation
# certifies non-entailment.
prove("3. affirming the consequent   {∀x (Dog(x) → Barks(x)), Barks(rena)} ⊭ Dog(rena)",
      [[("-", ("Dog", "x")), ("+", ("Barks", "x"))],
       [("+", ("Barks", "Rena"))]],
      [[("-", ("Dog", "Rena"))]])`,
      output: `1. everyone is loved   {∀x∃y Mother(y, x), ∀x∀y (Mother(y, x) → Loves(y, x))} ⊨ ∀x∃y Loves(y, x)
  clauses: {Mother(M(x), x)}   {Loves(y, w), ¬Mother(y, w)}   {¬Loves(v, C)}
  resolve {¬Loves(v, C)} with {Loves(y, w), ¬Mother(y, w)} on Loves  [{v/y, w/C}]  ->  {¬Mother(y, C)}
  resolve {Loves(y, w), ¬Mother(y, w)} with {Mother(M(x), x)} on Mother  [{y/M(x), w/x}]  ->  {Loves(M(x), x)}
  resolve {Loves(M(x), x)} with {¬Loves(v, C)} on Loves  [{v/M(x), x/C}]  ->  □
  □ derived after 3 resolutions — ENTAILED

2. the Dog/Barks refutation   {∀x (Dog(x) → Barks(x)), Dog(rena)} ⊨ Barks(rena)
  clauses: {Barks(x), ¬Dog(x)}   {Dog(Rena)}   {¬Barks(Rena)}
  resolve {¬Barks(Rena)} with {Barks(x), ¬Dog(x)} on Barks  [{x/Rena}]  ->  {¬Dog(Rena)}
  resolve {Barks(x), ¬Dog(x)} with {Dog(Rena)} on Dog  [{x/Rena}]  ->  {Barks(Rena)}
  resolve {Barks(Rena)} with {¬Barks(Rena)} on Barks  [{}]  ->  □
  □ derived after 3 resolutions — ENTAILED

3. affirming the consequent   {∀x (Dog(x) → Barks(x)), Barks(rena)} ⊭ Dog(rena)
  clauses: {Barks(x), ¬Dog(x)}   {Barks(Rena)}   {¬Dog(Rena)}
  saturated after 0 resolutions (3 clauses, nothing new) — NOT ENTAILED`,
      walkthrough: [
        "**The unifier is d-06's, verbatim** — `unify`/`bind`/`occurs` with the occurs check on; lowercase strings are variables, uppercase strings are constants and function names. Every hand-written rena becomes the machine constant `'Rena'`: lowercase would make it a variable — the exact trap that broke d-06-e1.",
        "**The architecture is d-04's, three pieces intact** — clause representation (frozensets of `(sign, atom)` term-tuple literals), the resolve loop (canonical pair enumeration until □ or fixpoint), the saturation check (a round that derives nothing new). One seam is swapped: where d-04 tested for a complementary literal, `resolvents` asks whether the complementary atoms *unify* — and `subst`/`canon` add the substitution bookkeeping d-04's walkthrough promised.",
        "`canon` renames variables positionally for deduplication — `{Loves(y, C)}` and `{Loves(z, C)}` are the same clause, and without a canonical form the saturation loop would chase renamings forever. `standardize_apart` is the guard for clauses sharing variable names (the inputs are standardized on entry, so traces show the authored names); `resolvents` unifies the negative atom first — a cosmetic convention fixing the orientation of variable-to-variable bindings so traces are stable. Clauses print in d-04's canonical literal order: atom name first, positive before negative.",
        "Case 1's trace contains the hand example verbatim: lines 2 and 3 are the example's two resolutions with the same MGUs, and line 1 is a side derivation the blind search earned on the way — the negated goal contraposed through premise 2: 'C is loved by nobody, so nobody mothers C'.",
        "Case 2 reproduces the battery's Dog/Barks refutation: the workhorse {x/Rena} fires twice — rule with fact gives {Barks(Rena)}, then the unit clash with the negated goal gives □ — and the machine also derives the modus-tollens side clause {¬Dog(Rena)} en route, exactly as d-04's prover found its own route to modus ponens.",
        "Case 3 saturates at zero resolutions: no complementary pair exists anywhere in the three clauses — the first-order affirming the consequent, refused exactly as d-04's case 2 refused the propositional one. No function symbols, so the closure is finite and the fixpoint is a certified 'not entailed'; with a function symbol it might not have arrived at all.",
      ],
      project:
        "The unifier, clause engine and saturation loop here are the Part D project's prover core, verbatim — the project adds the parser, the set-of-support strategy and the battery.",
    },
    {
      kind: "text",
      text: "State the guarantees precisely, because the lifting changed two of them. **Soundness survives untouched** — a resolvent is entailed by its parents (unification only instantiates), so □ still certifies that premises plus negated goal are genuinely unsatisfiable. **Refutation completeness survives, with a condition**: whenever KB ⊨ φ, resolution using most general unifiers under a *fair* strategy will derive □ — fair meaning every clause is eventually used as a resolution parent. The blind round-robin above qualifies (every pair is enumerated every round); *set-of-support* — every resolution involves a descendant of the negated goal — is the standard tighter fairness device, and the one the Part D project adopts. **What does not survive is d-04's termination guarantee.** Over n propositional atoms only finitely many clauses exist, so saturation always arrived; in first-order logic the terms M(x), M(M(x)), M(M(M(x))), … make infinitely many clauses available, and a search on a non-entailed goal may saturate (case 3 did, instantly) or run forever — first-order entailment is semi-decidable, and no procedure can tell you in general which fate a running search awaits. The exact contract: **the empty clause WILL be derived when the goal is entailed — but when it is not, the procedure may run forever (semi-decidability)**. □ and an observed saturation are the only verdicts; an hour of neither is neither. That is the price of first-order power, and it is where Part D's deduction thread honestly ends: the next lesson takes the other road entirely — d-08's knowledge graphs trade deduction for scale and inspectability, storing what is explicitly known and leaving what is merely entailed unclaimed.",
    },
    {
      kind: "inferenceChain",
      title: "The same proof, run inside-out",
      direction: "backward",
      facts: ["Dog(rena)", "Cat(milo)"],
      rules: [
        { id: "r1", label: "R1", if: ["Dog(x)"], then: "Barks(x)" },
        { id: "r2", label: "R2", if: ["Cat(x)"], then: "Meows(x)" },
        { id: "r3", label: "R3", if: ["Dog(x)", "KnowsTrick(x)"], then: "GetsTreat(x)" },
      ],
      derived: ["Barks(rena)", "Dog(rena)"],
      goal: "Barks(rena)",
      caption:
        "Backward from the goal: the chain takes up Barks(rena) first — only R1 concludes Barks — so it asks for Dog(rena), and that is a fact; done, in two steps, with R2 and R3 never consulted (a forward chainer would have fired R2 on Cat(milo) uselessly on the way). The derived list is in reverse order — goal first, its support second — d-03's forward derivation read upside down. Resolution runs exactly this way: in the machine's Dog/Barks trace above, the negated goal clause {¬Barks(Rena)} appears in the first resolution and the last, so the search never leaves the goal's orbit and the proof grows from the conclusion back toward its facts. That is what 'resolution runs the proof inside-out' means — and why set-of-support, keeping every resolution in touch with the goal's descendants, is its natural fairness discipline.",
    },

    // ------------------------------------------------------------ exercises
    {
      kind: "exercise",
      id: "d-07-e1",
      exerciseKind: "write-code",
      prompt:
        "Wire one more argument into the lifted prover: {∃x Boss(x), ∀x∀y (Boss(x) → Commands(x, y))} ⊨ ∃x∀y Commands(x, y) — someone is the boss, the boss commands everyone, so someone commands everyone. The pipeline has been run for you: premise 1's free ∃ gives the Skolem CONSTANT 'B'; the NEGATED goal ∀x∃y ¬Commands(x, y) gives the Skolem FUNCTION ('W', 'x'), because its ∃y sits under ∀x. Fill in the final prove(...) call — premises first, then the negated goal's clauses — minding d-06's case convention: constants and function names are UPPERCASE ('B', 'W'), variables lowercase ('u', 'v', 'x').",
      starter: `# The first-order resolution prover from the lesson -- engine unchanged.

from itertools import combinations


def unify(a, b, s={}):
    """Term tuples like ('P', 'x', ('f','y')). Returns MGU dict or None."""
    if a == b:
        return dict(s)
    if isinstance(a, str) and a.islower():          # variable
        return bind(a, b, s)
    if isinstance(b, str) and b.islower():
        return bind(b, a, s)
    if isinstance(a, tuple) and isinstance(b, tuple) and a[0] == b[0] and len(a) == len(b):
        for x, y in zip(a[1:], b[1:]):
            s2 = unify(x, y, s)
            if s2 is None:
                return None
            s = s2
        return dict(s)
    return None

def bind(var, term, s):
    if var in s:
        return unify(s[var], term, s)
    if occurs(var, term, s):
        return None                                # occurs check
    out = dict(s); out[var] = term
    return out

def occurs(var, term, s):
    if term == var:
        return True
    if isinstance(term, tuple):
        return any(occurs(var, t, s) for t in term[1:])
    if isinstance(term, str) and term in s:
        return occurs(var, s[term], s)
    return False


def subst(t, s):
    """Apply s to term t, following chains (w -> x -> a) to fixpoint."""
    if isinstance(t, str):
        return subst(s[t], s) if t in s else t
    return (t[0],) + tuple(subst(x, s) for x in t[1:])

def variables_in(clause):
    def walk(t):
        if isinstance(t, str):
            return {t} if t.islower() else set()
        out = set()
        for x in t[1:]:
            out |= walk(x)
        return out
    out = set()
    for _, atom in clause:
        out |= walk(atom)
    return out

def standardize_apart(c1, c2):
    clash = variables_in(c1) & variables_in(c2)
    if not clash:
        return c2
    taken = variables_in(c1) | variables_in(c2)
    mapping = {}
    for v in sorted(clash):
        fresh = v + "'"
        while fresh in taken:
            fresh += "'"
        taken.add(fresh)
        mapping[v] = fresh
    def ren(t):
        if isinstance(t, str):
            return mapping.get(t, t)
        return (t[0],) + tuple(ren(x) for x in t[1:])
    return frozenset((s, ren(a)) for s, a in c2)


def term_str(t):
    if isinstance(t, str):
        return t
    return f"{t[0]}({', '.join(term_str(x) for x in t[1:])})"

def lit_str(lit):
    sign, atom = lit
    return ("¬" if sign == "-" else "") + term_str(atom)

def lit_key(lit):
    sign, atom = lit
    return (term_str(atom), sign == "-")        # P sorts before ¬P

def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(lit_str(l) for l in sorted(clause, key=lit_key)) + "}"

def clause_key(clause):
    return tuple(sorted(lit_key(l) for l in clause))

def sigma_str(sigma):
    if not sigma:
        return "{}"
    return "{" + ", ".join(f"{v}/{term_str(t)}" for v, t in sigma.items()) + "}"

def is_tautology(clause):
    pos = {atom for sign, atom in clause if sign == "+"}
    return any(sign == "-" and atom in pos for sign, atom in clause)

def canon(clause):
    mapping = {}
    def ren(t):
        if isinstance(t, str):
            if not t.islower():
                return t
            if t not in mapping:
                mapping[t] = "w%d" % (len(mapping) + 1)
            return mapping[t]
        return (t[0],) + tuple(ren(x) for x in t[1:])
    lits = sorted(clause, key=lit_key)
    return tuple((ren(a), s) for s, a in lits)


def resolvents(c1, c2):
    c2 = standardize_apart(c1, c2)
    lits1 = sorted(c1, key=lit_key)
    lits2 = sorted(c2, key=lit_key)
    out = []
    for i, (sign, a) in enumerate(lits1):
        for j, (sign2, b) in enumerate(lits2):
            if sign == sign2 or a[0] != b[0]:
                continue
            neg, pos = (a, b) if sign == "-" else (b, a)
            sigma = unify(neg, pos)
            if sigma is None:
                continue
            residue = ([lit for k, lit in enumerate(lits1) if k != i]
                       + [lit for k, lit in enumerate(lits2) if k != j])
            r = frozenset((s, subst(atom, sigma)) for s, atom in residue)
            if is_tautology(r):
                continue
            out.append((a[0], sigma, r))
    return out

def saturate(clauses):
    kept, seen = [], set()
    for c in clauses:
        key = canon(c)
        if key not in seen:
            seen.add(key)
            kept.append(c)
    trace = []
    while True:
        ordered = sorted(kept, key=clause_key)
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for pred, sigma, r in resolvents(c1, c2):
                key = canon(r)
                if key in seen:
                    continue
                seen.add(key)
                fresh.append(r)
                trace.append((c1, c2, pred, sigma, r))
                if not r:
                    return True, kept, trace
        if not fresh:
            return False, kept, trace
        kept.extend(fresh)

def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, kept, trace = saturate(clauses)
    for c1, c2, pred, sigma, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)} on {pred}"
              f"  [{sigma_str(sigma)}]  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(kept)} clauses, nothing new) — NOT ENTAILED")
    print()


# TODO: wire in the last argument -- someone commands everyone.
#   premise 1 (Skolemized for you):  {Boss(B)}                       constant B
#   premise 2:                       {¬Boss(u), Commands(u, v)}
#   negated goal (Skolemized):       {¬Commands(x, W(x))}            function W
# Use exactly:
# prove("someone commands everyone   {∃x Boss(x), ∀x∀y (Boss(x) → Commands(x, y))} ⊨ ∃x∀y Commands(x, y)",
#       [...premise clauses...], [...negated goal clauses...])`,
      solution: `# The first-order resolution prover from the lesson -- engine unchanged.

from itertools import combinations


def unify(a, b, s={}):
    """Term tuples like ('P', 'x', ('f','y')). Returns MGU dict or None."""
    if a == b:
        return dict(s)
    if isinstance(a, str) and a.islower():          # variable
        return bind(a, b, s)
    if isinstance(b, str) and b.islower():
        return bind(b, a, s)
    if isinstance(a, tuple) and isinstance(b, tuple) and a[0] == b[0] and len(a) == len(b):
        for x, y in zip(a[1:], b[1:]):
            s2 = unify(x, y, s)
            if s2 is None:
                return None
            s = s2
        return dict(s)
    return None

def bind(var, term, s):
    if var in s:
        return unify(s[var], term, s)
    if occurs(var, term, s):
        return None                                # occurs check
    out = dict(s); out[var] = term
    return out

def occurs(var, term, s):
    if term == var:
        return True
    if isinstance(term, tuple):
        return any(occurs(var, t, s) for t in term[1:])
    if isinstance(term, str) and term in s:
        return occurs(var, s[term], s)
    return False


def subst(t, s):
    """Apply s to term t, following chains (w -> x -> a) to fixpoint."""
    if isinstance(t, str):
        return subst(s[t], s) if t in s else t
    return (t[0],) + tuple(subst(x, s) for x in t[1:])

def variables_in(clause):
    def walk(t):
        if isinstance(t, str):
            return {t} if t.islower() else set()
        out = set()
        for x in t[1:]:
            out |= walk(x)
        return out
    out = set()
    for _, atom in clause:
        out |= walk(atom)
    return out

def standardize_apart(c1, c2):
    clash = variables_in(c1) & variables_in(c2)
    if not clash:
        return c2
    taken = variables_in(c1) | variables_in(c2)
    mapping = {}
    for v in sorted(clash):
        fresh = v + "'"
        while fresh in taken:
            fresh += "'"
        taken.add(fresh)
        mapping[v] = fresh
    def ren(t):
        if isinstance(t, str):
            return mapping.get(t, t)
        return (t[0],) + tuple(ren(x) for x in t[1:])
    return frozenset((s, ren(a)) for s, a in c2)


def term_str(t):
    if isinstance(t, str):
        return t
    return f"{t[0]}({', '.join(term_str(x) for x in t[1:])})"

def lit_str(lit):
    sign, atom = lit
    return ("¬" if sign == "-" else "") + term_str(atom)

def lit_key(lit):
    sign, atom = lit
    return (term_str(atom), sign == "-")        # P sorts before ¬P

def clause_str(clause):
    if not clause:
        return "□"
    return "{" + ", ".join(lit_str(l) for l in sorted(clause, key=lit_key)) + "}"

def clause_key(clause):
    return tuple(sorted(lit_key(l) for l in clause))

def sigma_str(sigma):
    if not sigma:
        return "{}"
    return "{" + ", ".join(f"{v}/{term_str(t)}" for v, t in sigma.items()) + "}"

def is_tautology(clause):
    pos = {atom for sign, atom in clause if sign == "+"}
    return any(sign == "-" and atom in pos for sign, atom in clause)

def canon(clause):
    mapping = {}
    def ren(t):
        if isinstance(t, str):
            if not t.islower():
                return t
            if t not in mapping:
                mapping[t] = "w%d" % (len(mapping) + 1)
            return mapping[t]
        return (t[0],) + tuple(ren(x) for x in t[1:])
    lits = sorted(clause, key=lit_key)
    return tuple((ren(a), s) for s, a in lits)


def resolvents(c1, c2):
    c2 = standardize_apart(c1, c2)
    lits1 = sorted(c1, key=lit_key)
    lits2 = sorted(c2, key=lit_key)
    out = []
    for i, (sign, a) in enumerate(lits1):
        for j, (sign2, b) in enumerate(lits2):
            if sign == sign2 or a[0] != b[0]:
                continue
            neg, pos = (a, b) if sign == "-" else (b, a)
            sigma = unify(neg, pos)
            if sigma is None:
                continue
            residue = ([lit for k, lit in enumerate(lits1) if k != i]
                       + [lit for k, lit in enumerate(lits2) if k != j])
            r = frozenset((s, subst(atom, sigma)) for s, atom in residue)
            if is_tautology(r):
                continue
            out.append((a[0], sigma, r))
    return out

def saturate(clauses):
    kept, seen = [], set()
    for c in clauses:
        key = canon(c)
        if key not in seen:
            seen.add(key)
            kept.append(c)
    trace = []
    while True:
        ordered = sorted(kept, key=clause_key)
        fresh = []
        for c1, c2 in combinations(ordered, 2):
            for pred, sigma, r in resolvents(c1, c2):
                key = canon(r)
                if key in seen:
                    continue
                seen.add(key)
                fresh.append(r)
                trace.append((c1, c2, pred, sigma, r))
                if not r:
                    return True, kept, trace
        if not fresh:
            return False, kept, trace
        kept.extend(fresh)

def prove(name, premise_clauses, negated_goal_clauses):
    clauses = [frozenset(c) for c in premise_clauses + negated_goal_clauses]
    print(name)
    print("  clauses: " + "   ".join(clause_str(c) for c in clauses))
    proved, kept, trace = saturate(clauses)
    for c1, c2, pred, sigma, r in trace:
        print(f"  resolve {clause_str(c1)} with {clause_str(c2)} on {pred}"
              f"  [{sigma_str(sigma)}]  ->  {clause_str(r)}")
    if proved:
        print(f"  □ derived after {len(trace)} resolutions — ENTAILED")
    else:
        print(f"  saturated after {len(trace)} resolutions "
              f"({len(kept)} clauses, nothing new) — NOT ENTAILED")
    print()


# Someone commands everyone:  Boss(B) is premise 1 (a free ∃ -> constant);
# premise 2 is already a clause;  the negated goal ∀x∃y ¬Commands(x, y)
# Skolemizes its ∃y UNDER ∀x -> the function W.
prove("someone commands everyone   {∃x Boss(x), ∀x∀y (Boss(x) → Commands(x, y))} ⊨ ∃x∀y Commands(x, y)",
      [[("+", ("Boss", "B"))],
       [("-", ("Boss", "u")), ("+", ("Commands", "u", "v"))]],
      [[("-", ("Commands", "x", ("W", "x")))]])`,
      expectedOutput: `someone commands everyone   {∃x Boss(x), ∀x∀y (Boss(x) → Commands(x, y))} ⊨ ∃x∀y Commands(x, y)
  clauses: {Boss(B)}   {¬Boss(u), Commands(u, v)}   {¬Commands(x, W(x))}
  resolve {Boss(B)} with {¬Boss(u), Commands(u, v)} on Boss  [{u/B}]  ->  {Commands(B, v)}
  resolve {¬Boss(u), Commands(u, v)} with {¬Commands(x, W(x))} on Commands  [{x/u, v/W(x)}]  ->  {¬Boss(u)}
  resolve {Boss(B)} with {¬Boss(u)} on Boss  [{u/B}]  ->  □
  □ derived after 3 resolutions — ENTAILED`,
      explanation:
        "The setup is the exercise: premise 1's free ∃ becomes the constant B (nothing encloses it); premise 2 is already a clause; the negated goal hides its ∃y under ∀x, so that witness becomes the function W — for every x, a possibly different person x fails to command. The machine then finds its own route: it detaches the boss's command {Commands(B, v)} with {u/B}, contraposes the negated goal through premise 2 into {¬Boss(u)} — the MGU {x/u, v/W(x)} carries the function — and closes on {Boss(B)} with □. Someone commands everyone, and the final clash certifies it.",
      concepts: ["clausal form", "resolution with unification", "machine notation"],
    },
    {
      kind: "exercise",
      id: "d-07-e2",
      exerciseKind: "trace",
      prompt:
        "By hand, take each formula to clauses — prenex, Skolemize (for each Skolem symbol say: constant or function, and why), drop the universals, CNF: (a) every dog has an owner: ∀x (Dog(x) → ∃y Owns(y, x)); (b) someone owns Fifi: ∃x Owns(x, Fifi); (c) the NEGATION of (a) — the negated goal its refutation would add. State the clauses each contributes, and for (c) say why its existential takes a constant even though a ∀ appears in the formula.",
      solution:
        "(a) Prenex: ∀x∃y (Dog(x) → Owns(y, x)) — the ∃y moves out of the consequent (y is not free in Dog(x)). Skolemize: the ∃y has ∀x to its LEFT, so a fresh FUNCTION o: ∀x (Dog(x) → Owns(o(x), x)) — each dog's owner may differ. Clause: {¬Dog(x), Owns(o(x), x)}. (b) Already prenex; the ∃x has nothing to its left, so a fresh CONSTANT c: {Owns(c, Fifi)}. (c) Negate: ¬∀x∃y (Dog(x) → Owns(y, x)) ≡ ∃x∀y ¬(Dog(x) → Owns(y, x)) ≡ ∃x∀y (Dog(x) ∧ ¬Owns(y, x)) — the negation crossed both quantifiers, flipping each, and ¬(A→B) ≡ A ∧ ¬B. Now the ∃x sits OUTSIDE the ∀y — nothing encloses it — so a constant again: ∀y (Dog(D) ∧ ¬Owns(y, D)), which CNF splits into the two clauses {Dog(D)} and {¬Owns(y, D)}: 'D is a dog nobody owns'. The trap in (c) is writing o(y) or W(y): the ∀y is dominated BY the ∃x, not enclosing it — the rule looks left, and left of the ∃x there is nothing.",
      explanation:
        "Three Skolem symbols, three situations: a function under a universal (the witness depends on what precedes it), a constant with no universal anywhere, and — the slip that separates clean refutations from broken ones — a constant created by negation that sits OUTSIDE a universal. Refutations negate goals, so the negated-goal case is the one you will meet most often.",
      concepts: ["Skolemization", "prenex form", "clausal form"],
    },
    {
      kind: "exercise",
      id: "d-07-e3",
      exerciseKind: "concept-check",
      prompt:
        "The prover saturates instantly on the affirming-the-consequent case — three clauses, zero resolutions, certified 'not entailed'. On a different argument, one with a function symbol, it has now run for an hour with neither □ nor saturation. What do you know?",
      options: [
        {
          text: "Nothing yet — on a non-theorem the search may saturate or run forever, and an hour of neither outcome is compatible with both fates; only □ (entailed) and an observed saturation (not entailed) are verdicts",
          correct: true,
          feedback:
            "Correct — that is semi-decidability from the inside: first-order logic is undecidable, no procedure can tell you in advance which fate a running search awaits, and honest reporting says 'still running'.",
        },
        {
          text: "Not entailed — completeness guarantees □ appears whenever the goal is entailed, so its absence after an hour settles the question",
          correct: false,
          feedback:
            "Completeness promises □ WILL appear for an entailed goal under a fair strategy — eventually, with no time bound whatsoever. An hour of silence, or a century, is not a verdict.",
        },
        {
          text: "Entailed — the prover is simply slow, and □ is on its way",
          correct: false,
          feedback:
            "It may be. Or the goal may be false and the search may never end — you cannot tell the two apart from a running search, which is exactly what semi-decidability means.",
        },
        {
          text: "The strategy must be unfair — a fair search always terminates",
          correct: false,
          feedback:
            "Fairness is about completeness (no clause postponed forever), not termination: even a perfectly fair first-order search can run forever on a non-theorem.",
        },
      ],
      solution:
        "Nothing yet — □ and an observed saturation are the only verdicts; a running search certifies neither entailment nor its absence.",
      explanation:
        "Case 3's instant saturation was a luxury of having no function symbols: the clause closure was finite, so the fixpoint could not fail to arrive. In general it can fail, and the lesson's exact contract — the empty clause WILL be derived when entailed, but when not entailed the procedure may run forever — is the boundary every honest prover documents.",
      concepts: ["semi-decidability", "saturation", "refutation completeness"],
    },
  ],
  terms: [
    {
      term: "Skolem normal form",
      definition:
        "A prenex formula with every existential quantifier eliminated by a fresh witness symbol — a function of the enclosing universals, or a constant when there are none. It preserves satisfiability, not equivalence: exactly the contract refutation needs.",
    },
    {
      term: "clausal form",
      definition:
        "A set of clauses — sets of quantifier-free literals over terms, every variable implicitly universal — the data shape resolution consumes. First-order clausal form is d-04's propositional one plus function and constant terms.",
    },
    {
      term: "resolution refutation",
      definition:
        "Proof by contradiction in first-order logic: add the negated goal's clauses, resolve complementary atoms by unification, derive the empty clause □. Sound, and refutation-complete with most general unifiers under a fair strategy.",
    },
    {
      term: "set-of-support",
      definition:
        "A fairness discipline for resolution: every resolution involves a descendant of the negated goal, keeping the search near the thing being proved while every clause is still eventually used — the completeness-preserving strategy the Part D project adopts.",
    },
    {
      term: "semi-decidability",
      definition:
        "The property that first-order entailment is provable when true but not refutable when false: a fair resolution search will find □ for an entailed goal, but on a non-theorem it may saturate or run forever — no procedure decides which.",
    },
  ],
  mistakes: [
    {
      mistake: "Skolemizing an existential under a universal as a constant (or a free existential as a function).",
      why: "The constant version silently strengthens the claim — one witness for everyone — so the clause set is unsatisfiable in worlds where the original formula was perfectly satisfiable, and the prover happily certifies things the premises never said.",
      fix: "Look LEFT of the ∃ in the prenex: every enclosing ∀ becomes one argument of a fresh function; with none to the left it is a constant. ∀y∃x P(x, y) gives P(f(y), y) — the witness depends on y.",
    },
    {
      mistake: "Expecting the Skolemized form to be equivalent to the original, and concluding the pipeline is broken when it is not.",
      why: "d-04's conversion drilled equivalence at every step, so its absence here feels like a bug; but a binder cannot be removed while keeping truth values fixed in every world.",
      fix: "Change the question you ask of the step: not 'same truth value in every world?' but 'unsatisfiable together, either way?' — satisfiability in both directions is the contract, and it is all a refutation consults.",
    },
    {
      mistake: "Letting two clauses share variable names, then resolving them without standardizing apart.",
      why: "Unification binds variables by NAME; same-named variables of different clauses get fused even though they were universally quantified independently — the prover then loses proofs or derives clauses the premises never licensed.",
      fix: "Standardize apart at the clause stage: rename so no two clauses share a variable name (the prover's standardize_apart guard does it on collision).",
    },
    {
      mistake: "Reading a timeout as a verdict — 'it ran an hour, so the goal is not entailed.'",
      why: "Propositional saturation trained that instinct: there, running out of moves was a certified 'no'. First-order searches on non-theorems may saturate or run forever, and nothing distinguishes a long search from an endless one.",
      fix: "Count exactly two outcomes as verdicts: □ (entailed) and an observed saturation (not entailed). Everything else is 'still running', and the honest report says so.",
    },
  ],
  takeaways: [
    "The pipeline is five steps — prenex, Skolemize, drop the universals, CNF, clauses — and the only step without an equivalence law behind it is Skolemization, which preserves satisfiability instead.",
    "An ∃ under universals becomes a fresh function of them (one witness per combination); a free ∃ becomes a fresh constant. Look left of the quantifier.",
    "Lifted resolution is d-04's rule plus an MGU: find complementary atoms, unify, delete the pair, apply σ to the rest — {x/rena} is universal instantiation hiding inside the rule.",
    "Sound, and refutation-complete with most general unifiers under a fair strategy — set-of-support is the standard fairness device.",
    "Semi-decidability is the price: □ will be derived when entailed; on a non-theorem the search may saturate or run forever, and only those two observations are verdicts.",
  ],
  quiz: [
    {
      id: "d-07-q1",
      prompt:
        "The worked example negated its goal to ∃x∀y ¬Loves(y, x) and Skolemized the ∃x to a constant C. Why a constant and not a function?",
      options: [
        {
          text: "The ∃x sits outside every universal — the ∀y is to its right, dominated by it rather than enclosing it — so the witness has no dependency to record",
          correct: true,
          feedback:
            "Correct — the rule looks LEFT: only universals enclosing the existential become function arguments. The ∀y lives inside the ∃x's scope, so it contributes nothing.",
        },
        {
          text: "Goals always take constants; only premises take functions",
          correct: false,
          feedback:
            "Nothing about premise-versus-goal matters — only the quantifier's position. Negated goals often END with a leading ∃ (hence constants), but exercise e1's negated goal put a function W to work all the same.",
        },
        {
          text: "Functions are only needed when the predicate has two arguments",
          correct: false,
          feedback:
            "Arities are irrelevant: a one-place predicate under a ∀ still Skolemizes to a function — ∀x∃y P(y) becomes P(m(x)), one witness per x.",
        },
        {
          text: "Constants are safer — functions risk the occurs check",
          correct: false,
          feedback:
            "The occurs check guards unification, not Skolemization, and a fresh Skolem function never occurs inside itself. The choice is dictated by dependencies, not safety.",
        },
      ],
      explanation:
        "Constant or function is decided by one question: which universals ENCLOSE the existential. The Skolem symbol records exactly those dependencies — and the negated goal's leading ∃ has none.",
    },
    {
      id: "d-07-q2",
      prompt: "Skolemization rewrote ∃x P(x) as P(c), with c fresh. Which statement is exactly right?",
      options: [
        {
          text: "Equi-satisfiable, not equivalent: any clause set is unsatisfiable with ∃x P(x) exactly when it is unsatisfiable with P(c) — but a world can satisfy ∃x P(x) while P(c) fails, since c may denote a non-P element",
          correct: true,
          feedback:
            "Correct — and the equi-satisfiability is precisely the license: a refutation only ever asks 'unsatisfiable together?', never 'same truth value everywhere?'.",
        },
        {
          text: "Equivalent — like every step of d-04's CNF conversion, the rewrite preserves truth in every world",
          correct: false,
          feedback:
            "d-04's laws were equivalences; quantifier removal cannot be. A world where P(a) holds and c names a non-P b satisfies ∃x P(x) but falsifies P(c).",
        },
        {
          text: "The rewrite is sound only for refutation because it weakens the formula — P(c) says less than ∃x P(x)",
          correct: false,
          feedback:
            "P(c) is not weaker — it implies ∃x P(x); the failure runs the other way. And the license is the two-directional equi-satisfiability, not any weakening.",
        },
        {
          text: "Neither — satisfiability is preserved only left to right, so the pipeline can miss refutations",
          correct: false,
          feedback:
            "Both directions hold: a model of the original yields one of the Skolemized (interpret c as a witness), and a model of the Skolemized is already a model of the original. No refutation is missed.",
        },
      ],
      explanation:
        "The pipeline's honesty lives here: every rewrite before Skolemization was an equivalence; Skolemization deliberately trades equivalence away for quantifier-freedom and keeps only satisfiability — the one property refutation consults.",
    },
    {
      id: "d-07-q3",
      prompt:
        "Refutation completeness for first-order resolution is always stated with a fairness condition — every clause is eventually used as a resolution parent. Why is the condition necessary?",
      options: [
        {
          text: "An unfair loop can postpone one clause forever; if every refutation needs that clause, □ never appears even though the goal is entailed — completeness is a promise about fair searches only",
          correct: true,
          feedback:
            "Correct — fairness is the scheduling half of completeness; most general unifiers are the matching half. The theorem needs both.",
        },
        {
          text: "Without fairness the rule becomes unsound — postponed clauses let false conclusions through",
          correct: false,
          feedback:
            "Soundness never depends on scheduling: each resolution is licensed on its own, whatever the loop does. Fairness protects completeness, not soundness.",
        },
        {
          text: "Fairness is what guarantees termination on non-theorems",
          correct: false,
          feedback:
            "Nothing guarantees that — that is semi-decidability. Fairness is about finding proofs that exist, not about halting when they do not.",
        },
        {
          text: "It is an efficiency convention — unfair searches prove the same theorems, just slower",
          correct: false,
          feedback:
            "An unfair search may miss a theorem entirely: postponing the wrong clause forever is not slowness, it is a lost proof.",
        },
      ],
      explanation:
        "Completeness has two components — most general unifiers (do not over-commit bindings) and fair scheduling (do not starve clauses). Set-of-support is the standard device that keeps searches fair while staying near the goal.",
    },
  ],

};
