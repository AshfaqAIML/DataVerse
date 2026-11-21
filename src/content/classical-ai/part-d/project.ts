/**
 * PART_D_PROJECT — the part battery, kept verbatim from the original
 * delivery. Mirrors the registry project for subject J4 ("The
 * Resolution Prover", capstone, 8h).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_D_PROJECT: MiniProject = {
  title: "The Resolution Prover",
  brief:
    "Build a theorem prover for propositional and first-order logic: a parser for a formula language, conversion to clausal form (with Skolemization for the first-order case), and resolution with unification and a fair set-of-support strategy. Prove a battery of classic arguments, include at least two that fail, and document exactly which step blocks each failure. The prover is small — the discipline is making every intermediate form inspectable and every verdict honest.",
  requirements: [
    "A formula parser for a concrete syntax (propositional + first-order: predicates, terms, quantifiers, connectives)",
    "Conversion to clausal form with each stage inspectable: prenex, Skolemized, CNF, clauses",
    "A resolution engine over term tuples using the d-06 unifier (occurs check on), with set-of-support fairness",
    "A proof trace output: every resolution with its parents and unifier",
    "A battery: at least eight provable arguments and two documented non-theorems, each non-theorem reported by saturation (no new clauses), not by timeout alone",
  ],
  steps: [
    "Write the parser first (start propositional; extend to terms and quantifiers once formulas round-trip).",
    "Implement clausal conversion with a debug mode printing each stage — this is your main debugging instrument.",
    "Port the d-06 unifier verbatim; fuzz it on 20 hand-written pairs with known answers.",
    "Implement the resolution loop: resolve set-of-support clauses against all others; store resolvents; stop at □ or fixpoint.",
    "Build the battery: modus ponens, the syllogism chain, two FOL arguments with functions (the d-06 pairs become clauses), plus two non-theorems.",
    "Run the battery; save the traces; annotate the two failures with the saturation argument for why no derivation exists.",
    "Write the report: what the prover proved, what it refused to claim, and one paragraph on why fairness (every clause eventually used) is required for completeness.",
  ],
  starter: `# The resolution prover -- inspectable at every stage.
def parse(text): ...        # formula syntax: p, ~p, p & q, p | q, p => q,
                            # P(x, f(y)), forall x. phi, exists x. phi
def to_prenex(f): ...
def skolemize(f): ...
def to_cnf(f): ...
def clauses(cnf): ...       # list[list[Literal]]

def unify(a, b, s={}): ...  # the d-06 unifier, verbatim

def resolve(c1, c2): ...    # all resolvents with their unifiers

def prove(premises, goal): ...
    # negate the goal, clausify everything, set-of-support resolution
    # return ("proved", trace) | ("refuted-by-saturation", trace)

BATTERY = [...]
NON_THEOREMS = [...]
if __name__ == "__main__":
    for name, prem, goal in BATTERY + NON_THEOREMS:
        print(name, prove(prem, goal)[0])
`,
  concepts: ["clausal form", "Skolemization", "unification", "resolution", "set-of-support"],
  extension: "Add answer extraction: after proving ∃x-clause goals, return the witness substitution — the feature that turns a refutation prover into a question answerer (and, one refactor later, into a Prolog).",
};
