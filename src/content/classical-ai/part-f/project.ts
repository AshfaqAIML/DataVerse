/**
 * PART_F_PROJECT — "The Diagnostic Advisor" (registry subject J6's project,
 * independent, 8h). Requirements/steps/brief/concepts/extension kept from
 * the original delivery; the starter was fixed to RUN WITHOUT ERROR as
 * given (the authoring guide's rule) — stubs return placeholder values.
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_F_PROJECT: MiniProject = {
  title: "The Diagnostic Advisor",
  brief:
    "Build a small rule-based advisor on a domain of your choosing (a triage assistant, a plant-care diagnostician, a network troubleshooter): a rule base of at least fifteen rules, forward chaining with conflict resolution, backward chaining for a chosen goal, and an explanation trace for every conclusion. Then identify one rule whose conclusion should really carry uncertainty, and write the Bayes' rule computation that would replace it. The project closes the school's arc: rules, then probabilities — with the explanation trace as the through-line.",
  requirements: [
    "A rule base of 15+ rules on a domain you can speak for — no unreachable rules, no contradictions",
    "Forward chaining with an EXPLICIT conflict-resolution strategy, printed with the trace",
    "Backward chaining to a chosen goal, with the WHY/HOW explanation trace (goal stack + rule citations)",
    "Agreement check: forward and backward agree on every derivable fact (a test, not a hope)",
    "One rule's uncertainty analysis: the certainty-factor critique, then the Bayes computation with real numbers and its verdict",
  ],
  steps: [
    "Choose the domain and enumerate symptoms/faults; write the rule base with the f-02 table format.",
    "Implement the forward chainer (the f-02 program is the seed); declare the strategy.",
    "Implement backward chaining with the WHY/HOW trace — the f-03 pattern.",
    "Write the agreement test: for every conclusion the forward engine derives, backward chaining from it as goal succeeds, and vice versa.",
    "Build a small session interface: enter facts, watch the trace, query conclusions.",
    "Pick the rule whose conclusion most deserves a probability (a symptom with a noisy cause, typically); write its CF-style version and its Bayes version side by side.",
    "Write the analysis: when the two verdicts differ, and which one you would ship.",
  ],
  starter: `# The diagnostic advisor -- rules, traces, and one honest probability.
RULES = [
    # ("R1", ["symptom-a", "symptom-b"], "diagnosis-1"),
    ...   # 15+ rules, your domain
]
STRATEGY = ("specificity", "recency", "rule-order")   # declared, printed

def forward_chaining(facts):
    # TODO: return the firing trace (rule, conflict set, choice, conclusion)
    return []

def backward_chaining(goal, facts):
    # TODO: return (derivable?, WHY/HOW trace)
    return (False, [])

def agreement_test(facts):
    # TODO: every forward conclusion: backward proves it; every backward
    # goal: forward derives it. Return True only when both directions agree.
    return True

def bayes_version(prior, likelihood, fpr):
    # TODO: the one honest probability -- numerator, denominator, divide
    return 0.0

if __name__ == "__main__":
    trace = forward_chaining({"symptom-a", "symptom-c"})
    for step in trace:
        print(step)
    print(backward_chaining("diagnosis-1", {"symptom-a", "symptom-c"}))
`,
  concepts: ["production rules", "forward chaining", "backward chaining", "explanation traces", "Bayes' rule"],
  extension: "Replace the chosen rule's conclusion with a small Bayesian network (3–4 nodes) and compute the posterior by enumeration — the advisor now speaks probability for its most uncertain claim, with the trace explaining the graph.",
};
