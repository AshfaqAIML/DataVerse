# PRODUCT_REQUIREMENTS.md

**Project:** Data Science & AI Learning Academy (branded "DataVerse Academy")
**Phase:** 1 — Product Analysis & Planning
**Status:** Approved for planning; not yet for implementation
**Owner:** Principal Architect / Product
**Version:** 1.0.0-draft
**Date:** 2026-11-13

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository & Environment Findings](#2-repository--environment-findings)
3. [Product Vision](#3-product-vision)
4. [Target Audience](#4-target-audience)
5. [User Personas](#5-user-personas)
6. [Learning Outcomes](#6-learning-outcomes)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Success Metrics](#9-success-metrics)
10. [Scope Definition](#10-scope-definition)
11. [Assumptions, Constraints & Dependencies](#11-assumptions-constraints--dependencies)
12. [Document Glossary](#12-document-glossary)

---

## 1. Executive Summary

The Data Science & AI Learning Academy is a **zero-prerequisite, career-oriented learning platform** that takes a person with no programming experience, weak mathematics, and no database exposure to a **job-ready portfolio** in data analytics, data science, or machine learning engineering.

The reference product, [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com/), is an excellent terminal-style curriculum of 542 lessons across 20 phases aimed at AI engineers. Its audience, however, already assumes engineering fluency. **Our wedge is the population the reference excludes**: the absolute beginner. Every lesson is written so that a learner who has never written a line of code and fears mathematics can still reach a career outcome.

Three commitments define the product:

| Commitment | What it means concretely |
|---|---|
| **Zero prerequisite learning** | The curriculum starts at "what is a file". No lesson assumes knowledge the platform has not itself taught. A hard prerequisite DAG (directed acyclic graph) is enforced by the progress engine. |
| **Intuition before formulas** | Every abstract concept is introduced with a plain-English analogy, a visual, and a worked example before any notation appears. Formulas are then deconstructed symbol by symbol. |
| **Theory → Example → Exercise → Assessment** | Every lesson follows one enforced pedagogical loop. No lesson ships without worked examples, at least one graded check, and at least one hands-on exercise. |

Phase 1 produces this document set (PRD, System Architecture, Curriculum Architecture, Database Design, Implementation Roadmap, Feature Specification). **No application code is written in Phase 1**, per the project brief.

---

## 2. Repository & Environment Findings

Per the brief ("inspect the actual source code rather than trusting README claims"), a full inspection of the working environment was performed **before** any planning. Findings:

| Check | Result |
|---|---|
| `/home/z/my-project/` contents | `.env`, `.gitignore`, `download/README.md` (a 1-line placeholder: "Here are all the generated files."), `skills/` (environment tooling, not product code), empty `upload/` |
| Git history | Single commit `746e383 "Initial commit"`, branch `main`, **no remote configured**, only 3 tracked files |
| Existing application code | **None.** No `package.json`, no Next.js app, no routes, no modules, no database, no CodeVerse Academy source |
| Other locations swept | `/tmp/my-project` (empty), `/workspace`, `/app`, `/srv`, `/opt` — no project code |

**Consequences for this plan:**

1. **The CodeVerse Academy safeguards are treated as integration constraints, not current state.** Nothing exists to preserve, so nothing can be broken today. However, all architecture decisions in this document set are made so that if the Academy is later mounted inside CodeVerse Academy, it lands as a **separately organized module**:
   - All routes live under one namespace: `/academy/*` — no collisions possible with host routes.
   - The database uses an isolated schema with `academy_`-prefixed tables (see `DATABASE_DESIGN.md`) — no shared-table migrations, no destructive DDL against host tables.
   - Integration into a host app happens through **exactly one navigation entry** (a single nav link + a mount point), as required.
   - No duplicate "AI From Scratch" system is created: this Academy is a distinct product domain (beginner data science & AI careers), and any pre-existing host learning modules remain untouched.
2. **Technology versions in `SYSTEM_ARCHITECTURE.md` are greenfield choices** with explicit compatibility rules ("do not blindly upgrade working dependencies" is encoded as a versioning policy for future host integration).
3. This finding must be re-verified at implementation kickoff: if CodeVerse Academy source appears in the repo before Phase 0 begins, the integration contract in `SYSTEM_ARCHITECTURE.md §3` is re-run against the real host code before scaffolding.

---

## 3. Product Vision

### 3.1 Vision Statement

> **Every motivated person can become employable in data — regardless of what they were taught in school.** The Academy replaces the missing teacher, the missing math confidence, and the missing first job portfolio with one patient, structured, interactive path.

### 3.2 Mission

Deliver a complete, self-paced, interactive curriculum that carries an absolute beginner from "I have never coded" to "I have three portfolio projects, a certificate, and interview confidence" — with an AI tutor that explains every unfamiliar term in simple English and never lets a learner stay stuck.

### 3.3 Positioning vs. the Reference Product

| Dimension | aiengineeringfromscratch.com (reference) | DataVerse Academy (this product) |
|---|---|---|
| Entry point | Assumes developer/tooling fluency | **Zero prerequisites** — starts at files & folders, arithmetic refresh |
| Math | "Math Foundations" phase, engineer-level pacing | **Math-anxiety-aware**: intuition → visual → worked example → formula, with formula deconstruction |
| Lesson loop | Read problem → derive math → write code → run tests | **Explain (plain English) → show (example) → try (scaffolded exercise) → prove (assessment)** |
| Unfamiliar terms | Glossary terms tracked (1,400+) | **Inline term tooltips on every first use** + glossary hub + term-of-lesson recaps; authoring pipeline *blocks* lessons that introduce undefined terms |
| Audience ceiling | Up to autonomous agents, serving infra | Up to entry-level job readiness (analyst / data scientist / ML engineer) |
| Career features | Interview bank (482 Qs), cert prep | **Career tracks with outcome portfolios**, job-profile explorer, resume & interview modules, shareable certificates |
| Access model | Free, no account | Free to browse lessons; free account for progress, tutor, projects (paid tier deferred, see §10.3) |

### 3.4 Product Principles (binding on all teams)

These ten principles are acceptance criteria for content and code alike.

1. **Zero prerequisite learning** — never assume untaught knowledge; the prerequisite DAG is machine-enforced.
2. **Explain every unfamiliar technical term** — first use is always defined; jargon without definition fails content review.
3. **Simple English** — target reading level: clear, short sentences; no idiom that a non-native speaker would stumble on.
4. **Build intuition before formulas** — analogy and visual precede notation; formulas are deconstructed symbol-by-symbol.
5. **Theory followed by examples** — every concept is demonstrated with concrete, real-world data before the learner is asked anything.
6. **Examples followed by exercises** — scaffolded first (guided), then independent.
7. **Exercises followed by assessments** — graded checks close every lesson; mastery gates close every module.
8. **Practical implementation throughout** — learners write and run real code from Course B onward; data work uses real, messy datasets from Course C onward.
9. **Real-world projects** — three career tracks each end in portfolio-grade capstones built on realistic scenarios.
10. **Career-oriented outcomes** — every course states which job skill it builds; the Career Center maps curriculum to roles.

### 3.5 North Star Metric

**"First Portfolio Published"** — the number of learners who complete a track capstone and publish a public portfolio page. Weekly count is the team's North Star; all supporting metrics in §9 ladder up to it.

---

## 4. Target Audience

### 4.1 Primary Segments (from the brief, refined)

| # | Segment | Starting point | Typical goal | Volume assumption |
|---|---|---|---|---|
| S1 | **No-programming students** | Never written code; may not know what a terminal or a file path is | Understand data & AI; become employable | ~30% |
| S2 | **Math-avoidant learners** | Actively anxious about math; last math class may be high school | Pass through the math needed for data roles without fear | overlaps S1/S3 (~50% of all learners self-report math anxiety) |
| S3 | **Database novices** | Never used SQL or any database | Confident with SQL, data modeling basics | ~40% |
| S4 | **Career transitioners into data analytics** | Working adults (retail, ops, marketing, admin, QA); often spreadsheet-comfortable | Data Analyst role in 6–12 months | ~30% |
| S5 | **Aspiring data scientists** | Some self-study via scattered videos; gaps everywhere | Structured path + portfolio | ~20% |
| S6 | **Aspiring ML engineers** | Can script a little; no CS foundation | ML Engineer entry path | ~15% |

### 4.2 Secondary Audiences

- **Educators** (community college / bootcamp instructors) who may adopt the platform for classroom use in a later phase (informs content licensing and classroom mode, out of v1 scope).
- **Mentors / reviewers** reviewing capstone submissions (light UI, later phase).

### 4.3 Explicit Non-Audience (v1)

- Experienced software engineers wanting advanced LLM/agent engineering → served by the reference product; we link out rather than duplicate.
- Enterprise/B2B training buyers → out of scope until v2+.

### 4.4 Learner Constraints Observed in Research on This Segment

- Study sessions: 20–45 minutes, often on **laptops, sometimes tablets/phones** → lessons must be completable in ≤ 20 min; mobile must at least support reading + quizzes.
- Low tolerance for setup friction → **no local installs required through Course C** (in-browser execution first; sandboxed cloud execution for heavy work).
- Fear of "breaking things" → every code exercise is resettable; errors are framed as data, with a dedicated error-coaching loop.
- Many are non-native English speakers → Simple English principle; glossary-first authoring.

---

## 5. User Personas

### 5.1 P1 — "Maya", 21, the Anxious Absolute Beginner

| Attribute | Detail |
|---|---|
| Background | 3rd-year psychology student; took one statistics course and "survived" it |
| Tech level | Uses apps and Google Docs; has never opened a terminal; does not know what a "file path" is |
| Math confidence | **Low.** Freezes at fractions; equations feel like a foreign language |
| Goal | A flexible, respected career; heard "data analyst" pays well |
| Fears | Looking stupid; getting stuck with no one to ask; wasting months on the wrong thing |
| Triggers to quit | An unexplained term; a wall of math; an exercise she cannot start |
| Needs from us | Definitions on hover; analogy-first math; a tutor that never says "simply"; tiny wins in the first 10 minutes |
| Success looks like | Completes the Placement Diagnostic without frustration; finishes Lesson 1 and Lesson 2 on day one; returns on day two |

### 5.2 P2 — "Raj", 32, the Career Switcher (Spreadsheet Bridge)

| Attribute | Detail |
|---|---|
| Background | Retail operations supervisor, 9 years; lives in spreadsheets (VLOOKUP, pivot tables) |
| Tech level | Formula-comfortable; no programming; no databases |
| Goal | Data Analyst job within 12 months while working full-time |
| Constraints | 30–45 min on weeknights, 2 h on weekends; studies on a 6-year-old laptop |
| Fears | Investing a year and still being "junior forever"; ageism; interviews |
| Needs from us | Placement that credits what he already knows (skips spreadsheet basics); SQL taught as "pivots on steroids"; a portfolio that reads like business impact; interview prep |
| Success looks like | Skips ahead via placement; publishes Analyst capstone; uses Career Center interview bank |

### 5.3 P3 — "Lena", 19, the Curious Explorer

| Attribute | Detail |
|---|---|
| Background | Gap year after high school; fascinated by ChatGPT; weak math |
| Tech level | Phone-first, laptop sometimes; no coding |
| Goal | Understand how AI actually works; maybe a data science degree/career |
| Fears | That it will be too hard; that she is "not a math person" |
| Needs from us | Phone-readable lessons; the "How AI Learns" intuition sims; encouragement loop (streaks, XP); a honest "you are closer to employable than you think" progress map |
| Success looks like | Finishes Stage A + B; enrolls in Data Scientist track with a 6-month plan |

### 5.4 P4 — "Tom", 28, the Adjacent Techie

| Attribute | Detail |
|---|---|
| Background | Manual QA tester; writes occasional Excel macros, dabbled in freeCodeCamp |
| Tech level | Can read simple code; gets loops; never built a model; no stats |
| Goal | ML Engineer entry role (knows it pays; likes the engineering side) |
| Fears | The math wall (calculus/linear algebra horror stories); "everyone has a Master's" |
| Needs from us | Placement that fast-tracks programming basics; math taught only where used (with "why you need this" job framing); engineering-flavored capstone (model API, not just notebooks) |
| Success looks like | Tests out of Stage B in a weekend; builds the ML service capstone; interview-ready on ML fundamentals |

### 5.5 P5 — "Priya", 26, the Scattered Self-Starter

| Attribute | Detail |
|---|---|
| Background | Marketing associate; watched 40+ hours of data YouTube; notebooks full of gaps |
| Tech level | Can copy-paste pandas snippets; cannot explain what they do |
| Goal | Data Scientist role; credibility of a real certificate + portfolio |
| Fears | "Tutorial hell"; never knowing what to learn next |
| Needs from us | Gap detection via placement diagnostic; enforced sequencing (no skipping to shiny topics without mastery); spaced repetition so past material stops evaporating |
| Success looks like | Diagnostic reveals 6 gaps; fills them in 5 weeks; passes Statistics checkpoint first attempt |

### 5.6 P6 — "Dr. Amara", 41, the Adopting Educator (secondary)

Community-college computing lecturer who wants a structured, free lab companion for her intro course. Needs: classroom-friendly licensing, readable content, printable cheat sheets, and (v2) cohort views. **v1 impact:** keep content license permissive and content exportable; no classroom features yet.

### 5.7 Internal Personas

- **"Sam", Content Author** — writes lessons in the Content Studio; needs term-registry enforcement, preview, versioning, and publishing workflow (see `FEATURE_SPECIFICATION.md` FR-15).
- **"Alex", Admin/Operator** — manages users, reviews flagged tutor transcripts, monitors sandbox health and cost dashboards.

### 5.8 Persona → Track Mapping

| Persona | Primary track | Placement outcome |
|---|---|---|
| Maya | Data Analyst | Starts at A1 (very beginning) |
| Raj | Data Analyst | Placement credit: skips A4 spreadsheet module, parts of C1 |
| Lena | Data Scientist | Starts at A1; high streak-affinity |
| Tom | ML Engineer | Fast-track: tests out of A2/B1 |
| Priya | Data Scientist | Selective credit; gap-fill plan |

---

## 6. Learning Outcomes

### 6.1 Program-Level Outcomes (PLOs)

On completing the full program, a learner can:

| ID | Outcome | Bloom level |
|---|---|---|
| PLO-1 | Explain, in plain English, what data is, how it is stored, and how it moves from raw collection to decision | Understand |
| PLO-2 | Write clean, working Python to load, clean, transform, and analyze real tabular data | Apply |
| PLO-3 | Query and join relational databases with SQL at day-one-analyst level | Apply |
| PLO-4 | Choose the correct chart for a question and build it; tell an honest, compelling story with data | Create |
| PLO-5 | Apply descriptive and inferential statistics (distributions, sampling, intervals, simple hypothesis tests) and explain the results to a non-technical stakeholder | Apply / Analyze |
| PLO-6 | Frame a business problem as a supervised or unsupervised learning task; train, evaluate, and improve baseline models | Create |
| PLO-7 | Diagnose overfitting, leakage, and metric misuse; justify model choices with evidence | Evaluate |
| PLO-8 | Explain how neural networks learn (forward pass, loss, gradient descent, backpropagation) at an intuitive level, and train a small one | Understand / Apply |
| PLO-9 | Use and critique LLM-based tools: prompt effectively, explain embedding/retrieval intuition, build a simple retrieval-assisted demo | Apply / Evaluate |
| PLO-10 | Ship a portfolio of three projects with documented process, and present them in interviews | Create |

### 6.2 Track-Level Outcomes

**Data Analyst track** → PLO-1..5 + SQL mastery + dashboard project + business case study; exit: "can do a junior analyst's Monday."
**Data Scientist track** → PLO-1..9 + experimentation (A/B) + ML capstone; exit: "can own an analysis end-to-end and defend it."
**ML Engineer track** → PLO-1..4, 6..10 + model-serving basics (wrap a model in a simple API, Docker intro); exit: "can put a trained model behind an endpoint and talk engineering."

### 6.3 Lesson-Level Outcome Discipline

Every lesson declares exactly 1–3 measurable outcomes ("Given a table of sales, you will compute month-over-month growth in pandas"), which drive its exercises and its check questions. Outcome coverage is validated in the Content Studio (no orphan exercises, no untested outcomes).

---

## 7. Functional Requirements

Priorities use MoSCoW: **M** = must have in v1, **S** = should have in v1, **C** = could have (fast-follow), **W** = won't have v1 (explicitly deferred).

Detailed acceptance criteria per requirement live in `FEATURE_SPECIFICATION.md`; this section is the authoritative catalog.

### FR-01 Onboarding & Placement
| ID | Requirement | Priority |
|---|---|---|
| FR-01-01 | Email + OAuth sign-up/sign-in; email verification; password reset | M |
| FR-01-02 | 3-step welcome: goal selection (career track), self-assessed comfort areas, time budget per week | M |
| FR-01-03 | Adaptive placement diagnostic (~15–25 min, skippable) covering logic, math, spreadsheets, programming, SQL; awards **placement credit** (skips modules with proof-of-mastery) without punishing the learner | M |
| FR-01-04 | Generated study plan (weeks to goal at chosen weekly pace), adjustable | S |
| FR-01-05 | Guest browsing of lessons (read-only) with nudge to register for progress/tutor | S |

### FR-02 Curriculum & Lesson Delivery
| ID | Requirement | Priority |
|---|---|---|
| FR-02-01 | Track → Course → Module → Lesson hierarchy with progress state on every node | M |
| FR-02-02 | Lesson reader implementing the Learning Loop anatomy (see `CURRICULUM_ARCHITECTURE.md §5`): Why → Explain → Terms → Visual → Example → Guided exercise → Independent exercise → Check → Summary → Next | M |
| FR-02-03 | Prerequisite DAG enforcement: lessons/modules unlock on mastery (not just completion); placement credit unlocks nodes | M |
| FR-02-04 | Markdown-free rich content blocks: text, callouts (tip/warning/pitfall), images, tables, math (KaTeX), code blocks with syntax highlighting, interactive widgets, collapsible "go deeper" sections | M |
| FR-02-05 | Prev/next navigation, breadcrumbs, and "resume where you left off" | M |
| FR-02-06 | Reading preferences: font size, dark mode, reduced motion | M |
| FR-02-07 | Save/close notes and bookmarks per lesson | S |
| FR-02-08 | Offline/PWA lesson caching for reading on commutes | C |
| FR-02-09 | Classroom/cohort mode | W (v2) |

### FR-03 Glossary & Term System
| ID | Requirement | Priority |
|---|---|---|
| FR-03-01 | Central term registry; every term's first use in any lesson renders as an inline tooltip (tap/hover → plain-English definition + tiny example) | M |
| FR-03-02 | Glossary hub: search, filter by course/stage, "terms I've learned" tracking | M |
| FR-03-03 | Per-lesson "Terms introduced" recap card | M |
| FR-03-04 | Content pipeline rule: a lesson cannot publish if it uses a term not defined earlier or in its term list | M |
| FR-03-05 | Learner can select any text → "Explain this" → sends context to tutor | S |

### FR-04 Interactive Visual Intuition
| ID | Requirement | Priority |
|---|---|---|
| FR-04-01 | Widget framework (React) with the 8-widget set (`CURRICULUM_ARCHITECTURE.md §8.3`): fair-share beam, distribution builder, sampling machine, train/test splitter, overfitting playground, gradient-descent slider, JOIN visualizer, meaning map — 2 ship at v1 launch, the other 6 with their courses in v1.x/v2 | M (framework + set) |
| FR-04-02 | Widgets embed in lessons and are discoverable in a "Visual Library" | S |
| FR-04-03 | Widget state presets shareable via URL params | C |

### FR-05 Exercises
| ID | Requirement | Priority |
|---|---|---|
| FR-05-01 | Exercise types v1: multiple choice, multi-select, fill-in-the-blank, ordering/sequencing, matching, data-interpretation (read a chart/table), Parsons problems (drag code blocks into order), code-with-feedback | M |
| FR-05-02 | Guided exercises: step-by-step scaffolds with progressive hints (3-level hint ladder: nudge → strategy → worked step) | M |
| FR-05-03 | Instant feedback with explanation of *why* an answer is wrong (drawn from authored distractor rationales) | M |
| FR-05-04 | Independent exercises: no hints, counted toward mastery evidence | M |
| FR-05-05 | Attempt history & "review mistakes" view | S |

### FR-06 Assessments & Mastery
| ID | Requirement | Priority |
|---|---|---|
| FR-06-01 | Lesson-end "Check your understanding" (2–5 questions, untimed, immediate feedback) | M |
| FR-06-02 | Module checkpoint: 8–15 questions, mastery gate at ≥ 80%; unlimited low-stakes retakes (new question draws) | M |
| FR-06-03 | Question bank pools tagged by outcome + difficulty; adaptive selection (targeted at weak outcomes) | M |
| FR-06-04 | Course exam (timed, one attempt/24 h) + track final exam | S |
| FR-06-05 | Open-book policy by design; questions test application, not recall trivia | M (policy) |

### FR-07 Code Execution
| ID | Requirement | Priority |
|---|---|---|
| FR-07-01 | In-browser Python (Pyodide) for light exercises (pure Python, small pandas) with zero setup | M |
| FR-07-02 | Cloud sandbox (FastAPI + Docker, isolated) for heavy exercises/projects (sklearn, matplotlib, larger data) | M (from Course C) |
| FR-07-03 | Auto-grading against authored test cases + stderr coaching ("what this error means in plain English") | M |
| FR-07-04 | Reset-to-start, keep my attempt, and diff view against reference solution | M |
| FR-07-05 | Dataset panel: browse/download lesson datasets; upload-your-own-data for projects | S |
| FR-07-06 | Execution limits (CPU s / memory MB / wall time) enforced and explained to the learner | M |

### FR-08 Progress, Mastery & Review
| ID | Requirement | Priority |
|---|---|---|
| FR-08-01 | Progress dashboard: track map, % per course/module, time invested, streak | M |
| FR-08-02 | Mastery model per outcome (evidence-weighted: exercises, checks, checkpoints) with "strong / developing / needs review" states | M |
| FR-08-03 | Spaced repetition review queue auto-built from missed items + terms (SM-2-lite scheduling) | S |
| FR-08-04 | Weekly progress email digest (opt-in) | C |

### FR-09 AI Tutor "Ada"
| ID | Requirement | Priority |
|---|---|---|
| FR-09-01 | Lesson-contextual Socratic chat: knows current lesson, learner history, and past mistakes | M |
| FR-09-02 | Answer policy: never gives direct exercise/assessment answers; guides with questions and worked analogies | M |
| FR-09-03 | Term-aware replies: automatically links registry terms in its own explanations | M |
| FR-09-04 | Error coach: paste/see a stack trace → plain-English cause → 3-step debugging plan | M |
| FR-09-05 | Hint escalation hand-off: exercise hint ladder can summon Ada with lesson context pre-loaded | M |
| FR-09-06 | Grounding: answers retrieved/augmented from curriculum content (RAG) to prevent hallucinated syntax/course content | M |
| FR-09-07 | Rate limits + graceful degradation to non-AI hints when quota exhausted | M |
| FR-09-08 | Voice input (C) / proactive check-ins (C) | C |

### FR-10 Projects & Portfolio
| ID | Requirement | Priority |
|---|---|---|
| FR-10-01 | Guided projects (scaffolded, auto-checked steps) at course ends | M |
| FR-10-02 | Track capstone (3 scenarios: analytics, data science, ML engineering), rubric-scored | M |
| FR-10-03 | Public portfolio page (shareable URL) listing projects with abstracts, tech tags, and links | M |
| FR-10-04 | Project code executed and snapshot-saved in sandbox; downloadable as files | M |
| FR-10-05 | Peer showcase gallery (opt-in) | C |
| FR-10-06 | Human/mentor review of capstones | W (v2) |

### FR-11 Career Center
| ID | Requirement | Priority |
|---|---|---|
| FR-11-01 | Job-profile explorer (roles, day-in-the-life, skills matrix mapped to curriculum, salary ranges with sources, entry paths) | S |
| FR-11-02 | Interview prep: question bank with model-answer walkthroughs (concepts + SQL + coding + behavioral) | S |
| FR-11-03 | Resume/portfolio guidance module (data-focused) | S |
| FR-11-04 | "You are job-ready when…" checklist per track tied to real mastery data | M |

### FR-12 Certificates
| ID | Requirement | Priority |
|---|---|---|
| FR-12-01 | Course certificates (PDF + verifiable public URL) on exam pass | S |
| FR-12-02 | Track certificate on capstone + track exam pass | S |
| FR-12-03 | Certificate verification page (no login) | S |

### FR-13 Gamification & Motivation
| ID | Requirement | Priority |
|---|---|---|
| FR-13-01 | XP for exercises/checks/checkpoints; level titles tied to career milestones | S |
| FR-13-02 | Streaks with "streak freeze" (1/week) to protect motivation | S |
| FR-13-03 | Badges for meaningful firsts (first query, first chart, first model, first deployed API) | S |
| FR-13-04 | Leaderboards | W (v2; anti-beginner-motivation) |

### FR-14 Search
| ID | Requirement | Priority |
|---|---|---|
| FR-14-01 | Unified search across lessons, terms, exercises, projects, career pages (typo-tolerant) | S |
| FR-14-02 | Search-within-track filters | C |

### FR-15 Admin & Content Studio
| ID | Requirement | Priority |
|---|---|---|
| FR-15-01 | Authored content stored as versioned structured records; draft → review → publish workflow | M (internal tooling) |
| FR-15-02 | Term-registry enforcement, preview mode, and lesson linting (reading level, unexplained terms, loop completeness) | M |
| FR-15-03 | Admin: user lookup, sandbox/cost dashboards, tutor transcript review & flagging, feature flags | M |
| FR-15-04 | Bulk import from MDX/JSON source files (content-as-code in git) with review UI | S |

### FR-16 Accessibility & Settings
| ID | Requirement | Priority |
|---|---|---|
| FR-16-01 | WCAG 2.2 AA: keyboard-complete flows, screen-reader-tested reader, contrast-safe palette | M |
| FR-16-02 | Reduced motion, font scaling, dyslexia-friendly font toggle | M |

---

## 8. Non-Functional Requirements

| ID | Category | Requirement | Target / Measure |
|---|---|---|---|
| NFR-01 | Performance — reading | Lesson TTFB, LCP, INP | LCP < 2.5 s p75 on 4G; INP < 200 ms |
| NFR-02 | Performance — interaction | Quiz/exercise feedback latency | < 200 ms p95 (client-graded); sandbox job start→result < 10 s p95 |
| NFR-03 | Performance — Pyodide | Cold load of in-browser runtime | < 6 s p75 on broadband, with skeleton UI + cached thereafter |
| NFR-04 | Availability | Core (reading, progress) | ≥ 99.9% monthly |
| NFR-05 | Availability — degraded modes | Sandbox or tutor down must not block reading/quizzes | Graceful degradation, explicit status messaging |
| NFR-06 | Scalability | Design headroom | 10k MAU v1, 100k MAU target; stateless app tier; sandbox scales independently |
| NFR-07 | Security — app | OWASP ASVS L2; authn via Auth.js; RBAC (learner, author, admin); rate limiting; CSP; secrets in env/vault | Pen-test before public launch |
| NFR-08 | Security — sandbox | Untrusted code isolation: container-per-job, no network egress, CPU/mem/time caps, non-root, seccomp/nsjail | Escape-resistance review + abuse monitoring |
| NFR-09 | Privacy | GDPR: consent, export, delete account + data; data minimization; no selling data; minors-safe content | DPA-ready; privacy policy at launch |
| NFR-10 | Accessibility | WCAG 2.2 AA on all learner-facing flows | Automated checks in CI + manual audit per release |
| NFR-11 | Maintainability | Module boundary `/academy` self-contained; ≥ 80% test coverage on domain logic; typed end-to-end; CI green required to merge | Enforced by CI + CODEOWNERS |
| NFR-12 | Observability | Structured logs, tracing (OpenTelemetry), error tracking (Sentry), product analytics event taxonomy (see §9) | Dashboards + alerting at launch |
| NFR-13 | Cost control | LLM tutor cost ceiling per active learner/month; sandbox CPU-minutes budget with caps | Cost dashboards; soft/hard quotas (values set at Phase 5 design) |
| NFR-14 | Internationalization | All UI strings externalized; UTF-8 everywhere; RTL-safe layout primitives | i18n-ready (English launch) |
| NFR-15 | Browser support | Evergreen Chrome/Edge/Firefox/Safari (last 2 versions); mobile: lessons + quizzes fully usable, coding "best on desktop" (honest messaging) | Tested on smallest supported viewport 360 px |
| NFR-16 | Content safety (tutor) | Tutor must not produce unsafe content; abuse filters on user input to tutor/code | Red-team suite in CI for tutor prompts |

---

## 9. Success Metrics

### 9.1 Funnel (learner lifecycle)

| Stage | Metric | v1 Target |
|---|---|---|
| Activate | Complete first lesson in first session (of registered) | ≥ 60% |
| Engage | Return within 7 days (D7 retention) | ≥ 30% |
| Learn | Lesson completion rate (started → completed) | ≥ 70% |
| Master | Checkpoint first-attempt pass (after full lessons) | 60–85% band (too high = too easy, too low = content bug signal) |
| Persist | Module completion within track | ≥ 50% |
| Outcome | Capstone started / capstone published | ≥ 30% / ≥ 20% of track starters |
| Delight | NPS (in-product quarterly survey) | ≥ 50 |

### 9.2 Product-health metrics

- **Tutor effectiveness**: % of tutor-assisted exercises subsequently solved without giving away answers (target ≥ 70%); tutor thumbs-up ratio ≥ 4.5/5.
- **Term system**: tooltip open rate; % of glossary terms with ≥ 1 learner view (content coverage signal).
- **Sandbox**: p95 execution latency, failure rate, cost per 1k executions.
- **Placement**: median diagnostic length; % awarding ≥ 1 module credit; correlation of placement score with early completion (validate the instrument).
- **Content quality**: lesson "confusing" flag rate < 1%; reading-level lint pass rate.

### 9.3 Instrumentation

Event taxonomy (anonymous-safe, consent-gated): `lesson_started/completed`, `exercise_attempted/solved {result, hints_used, tutor_used}`, `checkpoint_result`, `tutor_message`, `search`, `project_milestone`, `certificate_earned`. Defined fully in `SYSTEM_ARCHITECTURE.md §12`.

---

## 10. Scope Definition

### 10.1 v1 (MVP) — "First Win to First Portfolio"

**In:** FR-01→03, FR-04 (widget framework + the 2 Stage-A/C1 widgets; remaining 6 widgets ship with their courses in v1.x), FR-05, FR-06, FR-07, FR-08 (01–02), FR-09, FR-10 (01–04), FR-11-04, FR-15 (core), FR-16; curriculum **Stage A + B1 + C1** — "Analyst Foundations": 6 courses, ~108 lessons (per `CURRICULUM_ARCHITECTURE.md §13`); Data Analyst track first ~40% live (A1–A4, B1, C1 + guided project P1); Data Scientist and ML Engineer tracks visible in catalog only.

### 10.2 v1.x Fast-follows

FR-08-03 review queue, FR-11-01..03 Career Center, FR-12 certificates, FR-13 gamification, FR-14 search, SQL + Statistics courses (Stage C completion), Data Scientist track completion.

### 10.3 v2+

ML Engineer track completion, classroom/cohort mode, peer gallery + mentor reviews, voice tutor, i18n localization, mobile coding UX, paid tier (scholarship-backed: keep core learning free; monetize certificates/pro features only if needed — **decision deferred, not assumed**).

### 10.4 Explicitly Out of Scope (any version unless re-chartered)

- Duplicating the reference product's advanced engineering curriculum (agents, serving infra, multi-agent systems) — we link out.
- Real-money features, ads, or selling learner data.
- Native mobile apps (PWA-first).

---

## 11. Assumptions, Constraints & Dependencies

**Assumptions** (each is a risk if wrong — cross-referenced in `IMPLEMENTATION_ROADMAP.md §5`):

1. No host application (CodeVerse Academy) exists at kickoff (verified §2); if one appears, integration contract re-runs first.
2. Learners have a modern browser and ~10 Mbps; coding exercises target desktop, reading/quizzes target mobile.
3. Content can be authored to the discipline in `CURRICULUM_ARCHITECTURE.md` (this is the project's #1 risk — content volume vs. quality).
4. LLM APIs remain available at commodity pricing; tutor design must survive provider swap (abstraction layer).
5. Single region deployment initially (learner geography concentrated, low-latency needs met by CDN).

**Constraints:** free-core pricing (costs must be engineered: caching, model routing, quotas); no local-install requirement before Course D; Phase 1 budget is documentation only.

**Dependencies:** see `IMPLEMENTATION_ROADMAP.md §4` (dependency map: sandbox → coding exercises → projects; content pipeline → everything; RAG index → tutor grounding).

---

## 12. Document Glossary

(Practicing our own rule — every term used above is defined here.)

| Term | Plain-English definition |
|---|---|
| **Placement credit** | Passing a diagnostic section proves mastery, letting a learner skip content without penalty |
| **Prerequisite DAG** | A map of what must be learned before what; "acyclic" means it never loops back on itself |
| **Mastery gate** | A checkpoint you must pass (≥ 80%) before the next module unlocks |
| **Parsons problem** | A coding exercise where all the code lines exist but are shuffled; you drag them into the right order |
| **Pyodide** | A version of Python that runs entirely inside your web browser (no server needed) |
| **Sandbox** | A sealed-off computer environment where learner code can run safely without affecting anything else |
| **RAG (Retrieval-Augmented Generation)** | Making an AI answer from your own trusted documents first, so it makes fewer things up |
| **Socratic tutor** | A tutor that leads you to the answer with questions instead of handing it over |
| **Distractor rationale** | The authored explanation of *why* a wrong quiz answer is tempting and wrong |
| **SM-2-lite** | A simplified version of the classic flashcard scheduling algorithm that decides when to show review items |
| **MoSCoW** | Prioritization scheme: Must / Should / Could / Won't |
| **PWA** | Progressive Web App — a website that can install and work like an app, including partially offline |
| **WCAG 2.2 AA** | The web accessibility standard level we commit to (usable with screen readers, keyboards, etc.) |
| **ISR** | Incremental Static Regeneration — pre-building pages for speed, refreshing them in the background |

---

*Cross-references: system design → `SYSTEM_ARCHITECTURE.md`; curriculum detail → `CURRICULUM_ARCHITECTURE.md`; data model → `DATABASE_DESIGN.md`; delivery plan and risk register → `IMPLEMENTATION_ROADMAP.md`; acceptance criteria → `FEATURE_SPECIFICATION.md`.*
