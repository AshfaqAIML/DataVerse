# The DataVerse Academy Content System

**Version 1.0 — standards version 1.0 — status: operational**

This document specifies the content system that powers every course in the
academy: where lesson content lives, the exact anatomy every lesson follows,
how quality is machine-enforced, how lessons move through editorial review,
and how the system scales to thousands of lessons without becoming a
maintenance burden.

The one-sentence contract:

> **Content lives as data in `content/`, quality is enforced by code, and
> nothing is learner-visible until it is complete.**

---

## 1. Why a content system (and not just database rows)

Curriculum without a pipeline produces three classic failures:

1. **Placeholder lessons** — empty shells that look like courses in the
   catalog and teach nothing.
2. **Fake credibility** — code examples with invented outputs, statistics
   nobody computed, "demos" that never ran.
3. **Inflated counts** — a landing page that claims 300 lessons when 40
   exist, because a lesson "exists" whenever a row does.

This system makes all three structurally impossible:

| Failure | Structural prevention |
|---|---|
| Placeholder lessons | Every lesson must pass 30+ machine-checked rules; drafts can never reach `published` status; a subject appears in the learner catalog only when **every** registry lesson is authored, approved and published (rule E04, publish decisions in `lifecycle.ts`). |
| Fake outputs | The verifier **executes** every teaching python block and every exercise solution, and compares the claimed output against reality (`verify.ts`, rules V01–V07). A lesson cannot ship an output it never produced. |
| Inflated counts | Coverage is computed from actual authored content (`compile.ts` → `coverage`), and `content:stats` reports the honest funnel: 161 registry lessons defined structurally, 3 authored, **0 subjects learner-visible** until each is 100% complete. |

## 2. Architecture

```
                        CURRICULUM REGISTRY                CONTENT TREE
                (structure — src/lib/curriculum)     (narrative — content/)
                schools A–I · 77 subjects             subjects/<slug>/m01/c01/
                modules · chapters · lesson rosters        01-slug/lesson.mdx
                prerequisite DAG · roadmaps                 01-slug/lesson.yaml
                                   │                            │
                                   └────────────┬───────────────┘
                                                ▼
                                     CONTENT ENGINE (src/lib/content)
                                     compile → join → rules → verify
                                     (yaml · sectionize · schemas ·
                                      lifecycle · templates · cli)
                                                ▼
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
                 QUALITY GATE (CI + tests)                      DB PROJECTION
                 bun run content:validate                  prisma/seed-modules/
                 bun test tests/unit/content.test.ts        content-registry.ts
                 exit 1 on any error                       Course → Module → Chapter
                                                            → Lesson → Sections →
                 EDITORIAL WORKFLOW                         Exercises → Quizzes
                 draft → self-review → peer →                            │
                 technical → approved → published                          ▼
                 (lesson.yaml review records)                    the running app
```

**Two sources of truth, one join.** The curriculum registry (Task A) defines
*structure*: which subjects exist, their modules, chapters, lesson rosters,
minutes, concepts, prerequisite DAG and staged roadmaps. The content tree
defines *narrative*: what each lesson actually teaches. The compiler joins
them strictly — a content lesson must match a registry lesson by subject,
position **and** title (rule R01), or validation fails. Registry lessons with
no content yet are legitimate backlog (visible to editors, never to
learners); content with no registry lesson is an error (L07).

**Adding content never touches application code.** A new lesson is a new
directory under `content/subjects/<subject>/mNN/cNN/NN-slug/`. A new subject
is a new registry entry plus a new directory. The engine, rules, APIs and
seeds are generic over the data.

## 3. Content formats

### 3.1 Lesson directory

```
content/subjects/python/m01/c01/03-variables-and-data-types/
├── lesson.mdx     # frontmatter + the 18-part body (canonical sections)
├── lesson.yaml    # terminology, exercises, knowledge check, verification,
│                  # review records, change log
└── assets/        # figures and datasets referenced relatively
```

`lesson.mdx` is standard MDX: YAML frontmatter, then `## `-headed canonical
sections. `lesson.yaml` holds the machine-structured parts (graded
exercises, quiz items, editorial state) so the narrative stays readable and
the structured data stays typed. Assets load with relative paths; the
verifier executes code with the lesson directory as working directory, so
snippets that read `assets/iris.csv` are verified against the real file.

### 3.2 The 18-part lesson anatomy

Every lesson is the same complete teaching experience, in the same
progressive-disclosure order (intuition → concept → formalism → practice):

| # | Section (canonical heading) | Purpose | Machine minimums |
|---|---|---|---|
| 1 | What you will learn | 3–7 doable outcomes | 3–7 bullets, action verbs |
| 2 | Why this topic matters | Real-world motivation | ≥50 words |
| 3 | Prerequisites | Exactly what is assumed | links + reasons |
| 4 | Everyday-life explanation | Zero-jargon analogy | ≥80 words |
| 5 | Conceptual explanation | The underlying idea, precise | ≥150 words |
| 6 | Formal definition | Textbook definition, earned | ≥30 words |
| 7 | Important terminology | Every new term defined | ≥3 terms, surfaced |
| 8 | Step-by-step explanation | Followable numbered steps | ≥3 steps |
| 9 | Visual explanation | Diagram/table/graph | 1 fence or image |
| 10 | Worked examples | Statement → steps → answer → check | 1–2 complete |
| 11 | Code demonstration | Runnable code, real output | 2 executed pairs |
| 12 | Common mistakes | Real beginner errors + fixes | 2 numbered |
| 13 | Practical applications | Where the job uses it | ≥50 words |
| 14 | Key takeaways | 3–7 keepers | 3–7 bullets |
| 15 | Practice exercises | Hands-on set (lesson.yaml) | ≥3 with solutions |
| 16 | Knowledge check | Self-test (lesson.yaml) | ≥3, per-option feedback |
| 17 | Further reading | Real, named sources | ≥2 descriptive links |
| — | *(title lives in frontmatter)* | | |

### 3.3 Archetype profiles

Archetypes add the sections their discipline needs, inserted at the
canonical position (`sections.ts` is the single source of the ordering):

| Archetype | Additional sections | Extra depth rules |
|---|---|---|
| **math** | Mathematical notation · Step-by-step derivations | derivations: ≥3 numbered steps, each justified; worked examples contain solved numerical problems; every symbol introduced before use |
| **programming** | Syntax · Debugging exercise | debugging exercise shows Expected/Actual with a real crashing program; syntax section shows the exact grammar |
| **library** | Installation and setup (once per subject) · API reference · Comparisons with alternatives · Performance considerations | ≥3 backticked signature rows; honest comparison ≥1 alternative; measured numbers only |
| **concept** | — (the base 17 sections) | code-demonstration optional with a reviewer-challengeable reason |

Total prose floors: concept 800 · programming 1,000 · math 1,100 ·
library 1,200 words. An empty shell fails the first rule it meets.

### 3.4 Verified-output convention

````markdown
```python
import numpy as np

arr = np.array([1, 2, 3])
print(arr * 2)
```

```text
[2 4 6]
```
````

The ` ```text ` fence directly after a python fence is the **claimed
output**; the verifier runs the code and compares. Intentionally crashing
demos carry `<!-- expect-error: NameError -->` above the fence. Performance
and installation sections are exempt (timings and versions are
machine-dependent by nature); everything else in the verified sections
executes or fails validation. Exercise solutions run against every test case
exactly as the grading sandbox will — a solution that fails its own tests can
never ship (V07).

## 4. The rule catalog

Five families, all machine-checked in `rules.ts`, `verify.ts` and
`lifecycle.ts` (full list in the authoring guide):

- **S — structure**: sections present, canonical order, minimum depth per
  archetype, total word floors, subject-once sections (S01–S05).
- **Q — quality**: no placeholders (Q01), no unexplained acronyms/jargon
  (Q02), no unexplained code (Q03), no fake output (V04/V06), no repetitive
  filler (Q06), exercises carry solutions and hint ladders (Q07),
  knowledge-check integrity — exactly one correct MCQ option, feedback on
  every option (Q08), registry concepts actually taught (Q09), images
  resolve with alt text (Q11), further-reading links are real and absolute
  (Q12), verification records match imported libraries (Q14).
- **R — registry**: content↔registry 1:1 (title, position) (R01), lesson
  prerequisites resolve in the registry (R02), objectives are demonstrable
  action verbs (R03).
- **V — verification**: executed code with matched outputs, expect-error
  honesty, solutions passing their own test cases (V01–V07).
- **E — editorial**: every promotion earned by recorded approvals (E01),
  approved lessons record verification (E02), no future-dated reviews (E03),
  no `published` lessons inside incomplete subjects (E04).

Findings are `{rule, severity, path, line, message}`. Errors fail the gate
everywhere; warnings fail the gate for technical-review promotion and above
(Q01 degrades to warning only while a lesson is still in draft).

## 5. Editorial review workflow

```
draft ──▶ self-review ──▶ peer-review ──▶ technical-review ──▶ approved ──▶ published
   author     author's        a peer          domain expert    instructional    editor
   writes     checklist       reads as        checks every     designer signs   flips the
              pass            a learner       number/API       the pedagogy     switch
```

Each state's required approvals (cumulative, enforced by `lifecycle.ts`):

| State | Required approvals recorded in `lesson.yaml → reviews[]` |
|---|---|
| draft, self-review | — (author's own pass) |
| peer-review | peer-reviewer |
| technical-review | + technical-reviewer |
| approved | + instructional-designer (and a verification record) |
| published | + editor — **and** only when the subject's coverage is 100% |

Review records are signed data: role, reviewer, date, verdict
(approve/request-changes), notes. The **latest** verdict per required role
gates promotion; a request-changes blocks until resolved. Human checklists
(authoring, technical, pedagogy, style, integrity) live in
`content/review/lifecycle.yaml` and are the reviewer's gate before
recording an approval.

Mapping to platform roles: author + peer-reviewer ≈ INSTRUCTOR /
CONTENT_EDITOR · technical-reviewer ≈ INSTRUCTOR (domain lead) ·
instructional-designer + editor ≈ CONTENT_EDITOR · publisher ≈
ADMINISTRATOR.

### CI integration

```bash
bun run content:validate   # the full gate: compile → rules → verify → lifecycle (exit 1 on errors)
bun run content:stats      # honest coverage + per-subject publish decisions
bun run content:scaffold -- <subject> <module#> <chapter#> <lesson#> [archetype]
bun test tests/unit/content.test.ts   # same gate + negative fixtures, wired into `bun test`
```

Wire `content:validate` into CI on every pull request that touches
`content/**` (the unit test already fails the suite otherwise), and require
the review-board CODEOWNERS on `content/` paths.

## 6. Scaling to thousands of lessons

1. **Data, not code.** Lessons are directories; the engine is generic. New
   authors never open the source tree.
2. **Two-tier subjects.** The registry defines a subject's full roster in
   minutes (the `L()` DSL); content is authored lesson-by-lesson behind it.
   Partial subjects are invisible to learners — progress is honest at every
   stage and no coordination is needed to "launch" a subject.
3. **Flat, predictable tree.** `content/subjects/<subject>/m01/c01/03-slug/`
   is greppable, diffable and reviewable; every lesson is one directory with
   the same two files. Renumbering is a rename; nothing else references
   positions (the join re-derives them).
4. **The gate is the same at lesson 3 and lesson 3,000.** Rules run in
   milliseconds per lesson plus real python execution (bounded by the
   10-second per-block timeout). Slow content fails fast, loudly and with a
   line number.
5. **Shared vocabulary.** `content/glossary/core.yaml` defines every
   cross-subject term once; per-lesson terminology refines it. The jargon
   rule (Q02) means a term is either defined or it does not appear.
6. **Parallel authoring.** Authors scaffold from the registry
   (`content:scaffold` pulls title, minutes and concepts automatically),
   write, self-validate locally, and submit for review; reviewers work from
   the same gate output. No author conflicts with another on shared files,
   and lessons within a subject can be authored out of order.

## 7. Current state and what remains

- **Engine, rules, verifier, lifecycle, scaffolder, CLI: complete and
  tested** (112 tests green, including negative fixtures).
- **Exemplars: three lessons** proving each major archetype —
  `python/m1/c1/3` (programming), `descriptive-statistics/m1/c1/1` (math,
  with generated figure and derived properties), `numpy/m1/c1/1` (library,
  with a real benchmark and the real iris dataset). Each passes the full
  gate and carries complete editorial records.
- **Registry: School A complete (5 subjects) plus `descriptive-statistics`
  (C1) and `numpy` (E1)** — 7 subjects, 161 lessons defined structurally.
  The remaining 70 subjects (schools B, D–I and the rest of C/E) are queued
  curriculum authoring through the same DSL; the engine already supports
  them.
- **DB projection: complete** — `prisma/seed-modules/content-registry.ts`
  seeds courses (DRAFT until 100% coverage), full module/chapter/lesson
  trees, section markdown, code examples, machine-verified exercises with
  test cases, per-lesson quizzes with per-option feedback (new
  `AnswerOption.feedback` column), and the merged glossary.

### Authoring playbook for the next 1,000 lessons

1. Author the subject's registry entry (DSL helpers, ~30 lines per module).
2. `bun run content:scaffold -- <subject> <m> <c> <l> [archetype]` for each
   lesson — the skeleton arrives with the registry's own data and
   authoring guidance comments.
3. Write the lesson against the authoring guide; run
   `bun run content:validate` until clean.
4. Record reviews as they happen; promote status; the subject appears to
   learners when its coverage hits 100% published.
5. Never merge a `content/**` PR with a red gate.
