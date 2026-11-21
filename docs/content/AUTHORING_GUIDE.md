# Authoring Guide — How to Write a DataVerse Lesson

**Standards version 1.0**

This is the practical handbook for the content system: what every lesson
must contain, how the archetype rules differ, the exact file formats, and
how a lesson moves from your keyboard to learners. The full architecture
lives in [CONTENT_SYSTEM.md](./CONTENT_SYSTEM.md); this guide is what you
keep open while writing.

---

## 1. The learner promise (read this first)

Assume the learner has **never met the subject**. They chose this academy
because something elsewhere made them feel stupid, and our job is the
opposite. Concretely, that means:

1. **Everyday example before technical language.** If you cannot explain
   the idea with kitchen jars or a phone bill, you do not understand it
   well enough yet.
2. **Terminology only after the idea.** A term gets introduced when it names
   something the learner already understands — never as a gateway to it.
3. **No unexplained anything.** Every acronym gets defined, every code
   block gets walked through, every output shown is real, every derivation
   step says *why*.
4. **Progressive disclosure.** Beginner explanation → deeper explanation →
   advanced details, in that order. The section order is the mechanism; do
   not fight it.

The gate `bun run content:validate` enforces the machine-checkable parts of
this promise. The parts it cannot check — the analogies, the clarity, the
honesty — are what reviewers are for, and what the checklists in
`content/review/lifecycle.yaml` encode.

## 2. Create a lesson

```bash
# scaffold from the registry (pulls title, minutes, concepts automatically)
bun run content:scaffold -- python 1 1 2 programming     # subject, module, chapter, lesson, archetype
bun run content:scaffold --next -- numpy                  # first unauthored numpy lesson
```

This creates `content/subjects/python/m01/c01/02-<slug>/` with
`lesson.mdx` (every canonical section with guidance comments and `TODO`
markers) and `lesson.yaml` (typed stubs for terminology, exercises and the
knowledge check). The scaffold is `status: draft` — placeholders are
permitted **only** in draft, as warnings. From `self-review` on, every
placeholder is an error. A scaffold can therefore never ship as a shell.

Write the MDX body, fill the YAML data, then loop:

```bash
bun run content:validate        # repeat until: 0 errors, 0 warnings
```

## 3. The lesson files

### 3.1 `lesson.mdx` — frontmatter + narrative

```yaml
---
title: "Variables and Data Types"     # MUST equal the registry lesson title
archetype: programming                 # math | programming | library | concept
status: draft                          # draft → self-review → peer-review → technical-review → approved → published
author: you@dataverse.academy
objectives:                            # 3–7, each starting with an action verb
  - Explain what a variable is using your own words
  - ...
prerequisites:                         # lesson-level refs, subject/mN/cN/N
  - ref: python/m1/c1/1
    reason: "You need to know how the interpreter executes lines."
codeDemo:
  include: true                        # include: false requires a reason reviewers can challenge
---
```

Then the body: `## `-headed sections in the canonical order of your
archetype (§4). The H2 texts are fixed — copy them from the scaffold; the
validator maps them by name and flags anything else.

**Style rules the gate checks:**
- No `TODO`, `TBD`, "coming soon", "placeholder", `...` in code fences —
  rule Q01.
- No ALL-CAPS acronym that is not defined in the lesson terminology or the
  shared glossary — rule Q02 (it even catches the ones you did not realize
  were acronyms).
- Further-reading links: at least 2, absolute `https://` URLs, descriptive
  link text — rule Q12. Official documentation first.
- Images: relative paths under the lesson's `assets/`, with descriptive alt
  text (≥5 words) — rule Q11.

### 3.2 The verified-output convention (the most important one)

Every teaching python block is followed by its **real** output:

````markdown
```python
import numpy as np

arr = np.array([18.5, 19.0, 21.2])
print(arr.mean())
```

```text
19.566666666666666
```
````

The validator **runs your code** and compares — so never type the output
from memory: copy it from an actual run, or simply run
`bun run content:validate` and let V06 tell you what python actually
printed. Blocks must be self-contained (imports included) and
deterministic (seed randomness, never print the clock).

Intentionally crashing demonstrations (common mistakes, debugging
exercises) carry the annotation:

```markdown
<!-- expect-error: NameError -->
```python
print(total_price)
```

```text
NameError: name 'total_price' is not defined
```
```

The verifier runs it and confirms it really raises a `NameError` — a
fabricated traceback cannot ship.

Performance and installation sections are exempt from output matching
(timings and versions vary by machine) — but numbers there must still be
measured, never invented: state the machine and say "your numbers will
differ".

### 3.3 `lesson.yaml` — structured practice

```yaml
terminology:
  - term: variable                      # will be surfaced in Important terminology
    definition: "A name bound to a value in memory."   # precise, ≥15 chars
    plainEnglish: "A labeled box in the computer's memory."  # the jargon-free gloss

exercises:                             # ≥3; kinds from the registry module's mix
  - id: ex-3-double-the-score           # kebab-case, unique in the lesson
    kind: write-code                    # write-code | debug | parsons | dataset-task are
    difficulty: MEDIUM                  # graded by the sandbox against test cases;
    title: "Double the score"           # concept-check | multiple-choice | fill-in |
    prompt: "..."                       # predict-output | calculation | derive |
    hints:                              # interpret-results | case-analysis | ... are
      - "..."                           # worked-solution exercises (graded by humans)
      - "..."                           # max 3 hints, each revealing more
    starterCode: |
      score = 100
      # your turn
    solutionCode: |                     # the validator RUNS this against every
      score = 100                       # test case — solutions must pass their own tests
      print(score)
      score = score * 2
      print(score)
    explanation: "Why this solution is the shape it is."
    testCases:
      - name: prints 100 then 200       # at least one visible case
        expectedOutput: |
          100
          200
      - name: hidden regression case
        expectedOutput: |
          100
          200
        hidden: true                    # hidden cases exist, learners never see them

knowledgeCheck:                         # ≥3 questions, auto-graded in the reader
  - id: kc-1
    prompt: "What does the single equals sign in 'width = 6' actually do?"
    kind: MCQ                           # MCQ | MULTI_SELECT | TRUE_FALSE
    explanation: "Why the right answer is right."        # shown after answering
    options:                           # every option carries honest feedback —
      - text: "It binds the name width to the value 6."
        correct: true
        feedback: "Right — assignment is 'name gets value'."
      - text: "It checks whether width is equal to 6."
        correct: false
        feedback: "That is ==, a different symbol with a different meaning."

verification:                           # required from approved status on (rule E02)
  python: "3.12.16"
  libraries:
    numpy: "2.1.3"                     # every library you import must be listed (Q14)
  verifiedAt: "2026-11-13"
  how: "bun run content:validate"

reviews:                               # the editorial record — see §6
  - role: technical-reviewer
    reviewer: alex@dataverse.academy
    date: 2026-11-13
    verdict: approve
    notes: "what was checked and what was found"
changes: []
```

**Exercise design rules:** a ladder of difficulty; every exercise has at
least one hint (learners read hints before solutions, and a solution read
after an attempt teaches); code exercises always carry a working solution
that passes their own test cases; prose exercises always carry worked
solution steps and a final answer.

**Knowledge-check design rules:** distractors encode real beginner
misconceptions (that is what makes a question diagnostic); every option's
feedback explains itself; exactly one correct option for MCQ and
TRUE_FALSE; at least two for MULTI_SELECT.

## 4. The canonical sections (and what "good" means)

The full skeletons with machine minimums live in `src/lib/content/sections.ts`;
the archetypes add their sections at fixed positions. The non-negotiables:

| Section | What good looks like | Machine floor |
|---|---|---|
| What you will learn | Outcomes the learner can DO ("compute", "explain"), not topics ("intro to X") | 3–7 bullets |
| Why this topic matters | One concrete scenario from data work — where this decides something real | 50 words |
| Prerequisites | Named lessons with one-line reasons; a first lesson says "None — this is where you start" | 15 words |
| Everyday-life explanation | A physical-world analogy that maps, zero jargon, zero notation | 80 words |
| Conceptual explanation | The idea precisely, still in plain language; this is the heart | 150 words |
| Syntax *(programming)* | The exact grammar in a fence, then one plain-English reading of it | fence |
| Formal definition | The textbook definition — only now that the idea exists | 30 words |
| Mathematical notation *(math)* | Every symbol with how to read it aloud | 3 symbols |
| Important terminology | Each term defined once: precise + plain-English gloss | 3 terms |
| Step-by-step explanation | Numbered steps that trace an actual example | 3 steps |
| Step-by-step derivations *(math)* | Formulas derived, never dropped; every step justified ("because/since/therefore") | 3 steps + 2 justifications |
| Visual explanation | A labeled diagram/table/ASCII sketch that carries weight prose cannot | fence or image |
| Worked examples | Statement → steps → answer → **check** (why the answer is sane) | 1–2 complete |
| Code demonstration | Runnable code, line-by-line commentary, verified output | 2 executed pairs |
| Installation and setup *(library, first lesson)* | Install + verify version + import convention | fence |
| API reference *(library)* | One row per function: signature, parameters, returns | 3 rows |
| Comparisons with alternatives *(library)* | Honest: when each tool wins | 40 words |
| Performance considerations *(library)* | Measured numbers with hardware caveat; when the tool loses too | 40 words |
| Common mistakes | The errors learners actually make, each with its fix | 2 numbered |
| Debugging exercise *(programming)* | A real broken program with Expected/Actual evidence | expect-error block |
| Practical applications | Named tools, decisions, artifacts from the job | 50 words |
| Key takeaways | 3–7 sentences that survive forgetting the lesson | 3–7 bullets |
| Practice exercises | The ladder described, with how to use hints | points at yaml |
| Knowledge check | Honest framing: distractors are real misconceptions | points at yaml |
| Further reading | Official docs first, descriptive links, no bare URLs | 2 links |

**What bad looks like (the gate catches all of these):** a "see documentation
later" instead of a real link; a code block with no output; an invented
output; a paragraph copied from another lesson; a 40-word "conceptual
explanation"; a derivation whose steps are a list of incantations; an
acronym you never defined; a "Coming soon" section; an MCQ where two
options are correct.

## 5. Archetype quick-reference

- **math** — intuition, notation, derivations, solved numerical problems,
  graphs, real applications, practice with worked solutions. If a formula
  appears, you derive it. If a number appears, you computed it.
- **programming** — concept, syntax, code with line-by-line explanation,
  expected output, common errors, a debugging exercise, coding challenges.
  Every shown output is real; every traceback really happened.
- **library** — what it is, why it exists, installation and environment,
  core concepts, functions/methods/parameters/returns, practical examples,
  comparisons with alternatives, real datasets, performance with measured
  numbers, a project that uses it.
- **concept** — the base skeleton; code only when genuinely relevant
  (with a reviewer-challengeable `codeDemo: { include: false, reason }`).

## 6. The review workflow (how your lesson ships)

1. **draft** — you write. `bun run content:validate` shows placeholders as
   warnings; fix everything before asking anyone's time.
2. **self-review** — you walk the authoring checklist
   (`content/review/lifecycle.yaml`), fix, and re-run the gate until clean.
3. **peer-review** — a fellow author reads it as a learner would. They
   record `{role: peer-reviewer, verdict, notes}` in `lesson.yaml`.
4. **technical-review** — a domain expert re-runs the gate, checks every
   number, every API claim against the documented version, every link.
5. **approved** — the instructional designer signs the pedagogy; the
   lesson now needs a `verification` record (it has one).
6. **published** — an editor flips it; the platform shows the lesson, and
   the **subject** becomes learner-visible only when all its lessons are
   here.

A `request-changes` verdict from any required role blocks promotion until a
later `approve` from the same role. To revise a published lesson, add a
`changes` entry and re-run the affected reviews — published content never
drifts silently.

## 7. Worked examples to learn from

Read these before writing; they pass every gate and show the standard:

- **programming** — `content/subjects/python/m01/c01/03-variables-and-data-types/`
- **math** (figure + derivations) — `content/subjects/descriptive-statistics/m01/c01/01-mean-median-and-mode/`
- **library** (real benchmark + real dataset) — `content/subjects/numpy/m01/c01/01-why-numpy-exists/`

## 8. YAML subset used by content files

`lesson.yaml` and frontmatter are parsed by a deliberately small YAML
subset parser (`src/lib/content/yaml.ts`): block-style maps and sequences,
plain/quoted scalars, `|` block scalars, comments. **No** flow style
(`[1, 2]`, `{a: 1}`) except empty `[]`; **no** anchors or multi-doc. Values
containing `: ` or starting with quotes must be quoted. This keeps every
content file unambiguous and the parse errors human-readable.
