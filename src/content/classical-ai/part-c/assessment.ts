/**
 * PART_C_ASSESSMENT — the part battery, kept verbatim from the original
 * delivery. Six questions in the exam register spanning both modules:
 * formalization (1–2), propagation (3–6).
 */
import type { QuizQuestion } from "@/lib/course/types";

export const PART_C_ASSESSMENT: QuizQuestion[] = [
  {
    id: "c-as-1",
    prompt: "The solution concept of a CSP is:",
    options: [
      { text: "A path from the initial assignment to the empty assignment", correct: false, feedback: "There is no path semantics — that is the formalism's entire point." },
      { text: "A complete assignment satisfying every constraint", correct: true, feedback: "Correct: complete (no variable unvalued) and consistent (no constraint violated). Order of discovery is irrelevant." },
      { text: "Any assignment violating at most one constraint", correct: false, feedback: "That is a relaxation used inside MAX-CSP — not the classical solution concept." },
      { text: "The constraint graph colored with two colors", correct: false, feedback: "Confusing the map-coloring INSTANCE with the formalism itself." },
    ],
    explanation: "Complete + consistent — two words worth anchoring; everything in the subject serves one or the other.",
  },
  {
    id: "c-as-2",
    prompt: "In Sudoku-as-CSP, the 27 all-different units are:",
    options: [
      { text: "Binary constraints, so the constraint graph is a plain graph", correct: false, feedback: "All-different binds NINE variables at once — a naive binarization explodes each unit into 36 pairwise edges." },
      { text: "n-ary constraints; binary encodings exist but cost edges, which is why solvers propagate all-different directly", correct: true, feedback: "Correct — arity is a modeling choice with measurable consequences; modern solvers implement global constraints with dedicated propagation algorithms." },
      { text: "Soft preferences", correct: false, feedback: "Every unit is hard — a single repetition voids the grid." },
      { text: "Domains", correct: false, feedback: "Domains live on variables; constraints live between them." },
    ],
    explanation: "The arity trade-off is real engineering: global constraints (all-different) are propagated natively because binarizing them multiplies edges by 36 per unit.",
  },
  {
    id: "c-as-3",
    prompt: "AC-3's queue empties. The network is now:",
    options: [
      { text: "Solved", correct: false, feedback: "Only if propagation collapsed every domain to one value — a degenerate accident, not the algorithm's contract." },
      { text: "Arc-consistent: every remaining value has support across every arc", correct: true, feedback: "Correct — the fixpoint IS the definition's check time: no REVISE can delete anything further." },
      { text: "Path-consistent", correct: false, feedback: "Stronger property, different algorithm (PC-2 and friends); AC-3 does not reach it." },
      { text: "Guaranteed unsatisfiable", correct: false, feedback: "Quite the opposite risk: arc-consistent networks are usually satisfiable-but-undecided." },
    ],
    explanation: "The fixpoint gives exactly the property the definition names — support per arc — no more, no less.",
  },
  {
    id: "c-as-4",
    prompt: "The chain X<Y, Y<Z with domains {1,2,3} collapsed under AC-3 to a unique solution. Why is that NOT what AC-3 promises in general?",
    options: [
      { text: "AC-3 only works on trees, and this is a chain", correct: false, feedback: "AC-3 works on any binary network; and the chain being a tree is precisely why propagation is so effective here." },
      { text: "Full collapse to singletons is a structural accident of tight chains; in general domains shrink partially and search still decides", correct: true, feedback: "Correct — the chain's constraints were so tight that each deletion cascaded to a singleton. Loosen any domain or add a variable and the fixpoint stops short of a solution." },
      { text: "The trace was wrong — AC-3 cannot delete values", correct: false, feedback: "Deletion is its one job." },
      { text: "AC-3 promises solutions only on satisfiable networks", correct: false, feedback: "It promises a fixpoint and sound deletions; satisfiability is search's to settle." },
    ],
    explanation: "The singleton collapse is the happiest case: tight structure + propagation = accidental solving. The honest general claim is 'soundly smaller', never 'solved'.",
  },
  {
    id: "c-as-5",
    prompt: "Which propagation failure does the X=Y ∧ X≠Y network expose?",
      options: [
      { text: "AC-3 crashes on contradictory constraints", correct: false, feedback: "It runs to a quiet fixpoint — nothing wipes out — which is exactly the subtlety." },
      { text: "Arc consistency reasons one arc at a time; pairwise support can coexist with global inconsistency", correct: true, feedback: "Correct — every value has support across each arc; only the JOINT consideration of both constraints reveals the contradiction. Stronger consistencies (path, k-consistency) exist for exactly this reason." },
      { text: "Binary constraints cannot be arc-consistent", correct: false, feedback: "Binary arcs are AC-3's home turf." },
      { text: "The domains are too small", correct: false, feedback: "Enlarge them and the network stays unsatisfiable — the flaw is structural, not cardinal." },
    ],
    explanation: "One-constraint-at-a-time reasoning has a horizon; unsatisfiability can live beyond it. Propagation shrinks soundly, search decides.",
  },
  {
    id: "c-as-6",
    prompt: "Forward checking versus MAC (maintaining arc consistency) during search: the honest statement is:",
    options: [
      { text: "MAC is always faster in wall-clock terms", correct: false, feedback: "Propagation is not free — on easy instances FC's cheaper bookkeeping wins; MAC pays off as instances harden." },
      { text: "MAC explores a subset-or-equal set of assignments, because its dead ends are detected no later than FC's — but each node costs more", correct: true, feedback: "Correct — the classic trade: nodes down, work per node up. The crossover is empirical, which is why benchmarks exist (the project's ladder)." },
      { text: "FC subsumes MAC", correct: false, feedback: "The containment runs the other way: FC is one step of directional arc consistency; MAC runs to the fixpoint." },
      { text: "They prune exactly the same values", correct: false, feedback: "MAC prunes everything FC prunes, plus everything the chains reach." },
    ],
    explanation: "Nodes versus node-cost is the recurring propagation trade — the numbers you measure in the Sudoku project are this principle made concrete.",
  },
];
