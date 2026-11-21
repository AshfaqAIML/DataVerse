# FEATURE_SPECIFICATION.md

**Project:** Data Science & AI Learning Academy ("DataVerse Academy")
**Phase:** 1 — Product Analysis & Planning
**Version:** 1.0.0-draft
**Date:** 2026-11-13
**Related:** `PRODUCT_REQUIREMENTS.md` (FR IDs), `SYSTEM_ARCHITECTURE.md`, `CURRICULUM_ARCHITECTURE.md`, `DATABASE_DESIGN.md` (tables), `IMPLEMENTATION_ROADMAP.md` (phase IDs)

**How to read this document.** Each feature carries: a summary, user stories, acceptance criteria in Given/When/Then form, data & interface notes, dependencies, phase mapping, and open questions. Acceptance criteria are the QA contract; the FR ID ties each feature to the PRD catalog. "F#" below is the phase in `IMPLEMENTATION_ROADMAP.md §3` that delivers the feature.

---

## Table of Contents

- [F-01 Onboarding & Placement Diagnostic](#f-01-onboarding--placement-diagnostic)
- [F-02 Lesson Reader & the Learning Loop](#f-02-lesson-reader--the-learning-loop)
- [F-03 Glossary & Term Tooltips](#f-03-glossary--term-tooltips)
- [F-04 Interactive Intuition Widgets](#f-04-interactive-intuition-widgets)
- [F-05 Exercise Engine & Hint Ladder](#f-05-exercise-engine--hint-ladder)
- [F-06 In-Browser Code Exercises (Pyodide)](#f-06-in-browser-code-exercises-pyodide)
- [F-07 Sandboxed Execution & Auto-Grading](#f-07-sandboxed-execution--auto-grading)
- [F-08 Checkpoints, Adaptive Pools & Exams](#f-08-checkpoints-adaptive-pools--exams)
- [F-09 Progress Dashboard & Mastery Map](#f-09-progress-dashboard--mastery-map)
- [F-10 AI Tutor "Ada"](#f-10-ai-tutor-ada)
- [F-11 Guided Projects & Capstones](#f-11-guided-projects--capstones)
- [F-12 Portfolio Pages](#f-12-portfolio-pages)
- [F-13 Career Readiness & Career Center](#f-13-career-readiness--career-center)
- [F-14 Content Studio & Admin](#f-14-content-studio--admin)
- [F-15 Gamification (v1.x)](#f-15-gamification-v1x)
- [F-16 Search (v1.x)](#f-16-search-v1x)

---

## F-01 Onboarding & Placement Diagnostic

**FR:** 01-01..04 · **Phase:** F1 (welcome/auth), F4 (placement) · **Primary personas:** all; critical for Raj (credit) and Maya (no shame)

**Summary.** A friction-light entry: optional guest browsing → registration → 3-step welcome (goal, comfort self-check, weekly time) → adaptive placement diagnostic (~15–25 min, skippable) that awards module credit at a deliberately high bar (≥ 90% per section) and generates an honest study plan.

**User stories**

1. As a *first-time visitor*, I can browse lessons without an account so that I can see value before committing.
2. As a *new learner*, I answer three friendly questions so the platform stops being a stranger.
3. As a *career switcher*, I take the placement so I never repeat what I already know.
4. As an *anxious learner*, I can skip any placement question or the whole diagnostic so I never feel tested before taught.
5. As any learner, I get a study plan in weeks-to-goal based on my time budget so I can decide to commit.

**Acceptance criteria**

- Given I am unauthenticated, when I open a lesson, then I can read it fully, and exercising prompts a register/sign-in sheet (no dark patterns; one nudge per session, dismissible).
- Given I register with email, when I submit, then I receive a verification email within 2 minutes, and I can sign in via Google or GitHub OAuth alternatively.
- Given I complete the welcome questions, when I finish, then I see a recommended track and a placement option presented as an opportunity ("prove what you know — or skip and start from zero"), never as a test.
- Given I take a section and score ≥ 90%, when the section ends, then the covered modules are marked "credited — you proved it" and unlock their dependents; my study plan is shortened accordingly.
- Given I score below 90%, when the section ends, then nothing is credited, my study plan is unchanged, and the UI shows zero shame language (no "failed", no score displayed unless I opt in).
- Given I skip the diagnostic, when I reach a locked-lesson I placed out of in practice, then a "take the 5-minute placement for this area" inline option appears (diagnostic is re-enterable per section).
- Given I was awarded credit and later fail a dependent checkpoint twice, when I open the checkpoint result, then the prescription includes the credited module as a review option with one click (undo credit path — risk R9).

**Data & interface notes.** `placement_attempts`, `placement_results`, `module_credits`, `profiles` (DATABASE §3.3); adaptive flow state in Redis; sections per CURR §13 (MVP: logic, math, spreadsheets).

**Dependencies:** auth (F1), item pools (F-08 pools reused at ≥ 90% bar), prerequisite engine (F-02). **Open questions:** OAuth provider set (Google + GitHub proposed); study-plan cadence tuning.

---

## F-02 Lesson Reader & the Learning Loop

**FR:** 02-01..06, 16-01/02 · **Phase:** F1 · **Primary personas:** all; Maya (reading level), Lena (mobile)

**Summary.** The learning surface: typed learning blocks rendered per the 10-part Learning Loop (CURR §5), with prerequisite-aware unlocking, resume-anywhere, reading preferences, and full keyboard/screen-reader support.

**User stories**

1. As a learner, I open a lesson and always find why it matters, examples, an exercise, and a check — in that order — so the structure itself teaches me.
2. As a returning learner, I land on "continue where you left off" so re-entry costs one click.
3. As a math-anxious learner, I can enlarge text and enable the dyslexia-friendly font so reading never fights me.
4. As a curious learner, I can peek at any future lesson read-only so ambition is fed, while exercises stay locked until prerequisites are mastered.

**Acceptance criteria**

- Given a published lesson, when I open it, then blocks render in the loop order with the required block types present (publishing pipeline guarantees; linter rejects incomplete lessons — FR-15-02).
- Given lesson N-1 is unmastered (module gate open), when I navigate to lesson N, then I can read it, and its exercise/check blocks render a locked state with the exact unlock requirement stated in plain English ("Master the 'Sorting' checkpoint to unlock practice — you're 1 lesson away").
- Given I close the tab mid-lesson, when I return, then the reader offers "Resume — 4 min left" with scroll position restored.
- Given my lesson status, when the lesson's module is placement-credited, then the lesson shows "You proved this — reading only" and completion is not required for unlocks.
- Given font scale or reduced-motion preferences, when set, then they apply across all learner pages and persist to my profile (server-side, DATABASE §3.1).
- Given keyboard-only navigation, when I tab through a lesson, then every interactive block (exercises, widgets, tooltips) is operable and focus order matches visual order; axe reports zero criticals (NFR-10).
- Given a course is republished (new `course_version`), when I reopen an in-progress lesson, then my progress carries over and any changed content is noted ("This lesson was updated") without losing my completion state.

**Data & interface notes.** `lesson_progress` pins `course_version_id` (DATABASE §3.3); ISR + publish-webhook revalidation (SYSTEM §5.2).

**Dependencies:** content pipeline (F-14), progress engine (SYSTEM §5.4). **Open questions:** none blocking.

---

## F-03 Glossary & Term Tooltips

**FR:** 03-01..05 · **Phase:** F1 · **Primary personas:** Maya, Lena (every-term-defined promise)

**Summary.** The platform's signature: a single term registry; first use of any term in any lesson renders as a tappable tooltip with plain-English definition + micro-example; a glossary hub tracks "terms I've met".

**Acceptance criteria**

- Given a term's first use in lesson content, when it renders, then it is underlined (dotted) and opens a tooltip on click/tap/hover-focus containing definition, micro-example, and pronunciation when present; the tooltip itself links no unexplained jargon (registry rule T-3).
- Given a term introduced in the lesson, when I reach block 3, then a "Terms introduced" card lists them with one-line definitions.
- Given I tap "hear it from Ada" inside a tooltip, when the tutor opens, then it is pre-seeded with the term and lesson context (F-10).
- Given the glossary hub, when I search or filter by course, then I see term entries with a "met on <lesson>" marker for terms I've encountered.
- Given authoring, when a lesson uses a term not defined earlier or in its term list, then CI lint fails the build (FR-03-04) — the promise is enforced, not hoped for.
- Given I select arbitrary lesson text, when I choose "Explain this", then the tutor opens with the selection + lesson context (F-10, S-priority: may ship F2).

**Data & interface notes.** `glossary_terms`, `lesson_terms(introduces)` (DATABASE §3.2); tooltip data prefetched with lesson payload; hub ISR-cached.

**Dependencies:** term registry (content pipeline), reader (F-02). **Open questions:** tooltip on mobile = tap-to-open with outside-tap close (proposed).

---

## F-04 Interactive Intuition Widgets

**FR:** 04-01..03 · **Phase:** F2 (framework + widgets 1–2), v1.x/v2 (widgets 3–8 with their courses) · **Personas:** Lena, Maya (intuition before formulas)

**Summary.** Manipulable visuals that let learners *feel* a concept before notation: fair-share beam (mean/median/skew), distribution builder, sampling machine, train/test splitter, overfitting playground, gradient-descent slider, JOIN visualizer, meaning map (CURR §8.3).

**Acceptance criteria**

- Given a widget block in a lesson, when it loads, then it renders above the fold of its section, is keyboard-operable (arrow keys / tab + space), respects reduced-motion, and exposes an aria-live status describing the current state ("Mean = 10. The balance point sits right of the median, 9").
- Given the fair-share beam, when I drag a value, then mean, median, and the beam balance update within 100 ms, and an annotated caption explains what changed ("one big value drags the mean, not the median").
- Given any widget, when I reach a "try it" prompt, then a lightweight goal state is checkable ("make the mean exceed the median" → success toast, no grading weight).
- Given a widget state I like, when I copy the share link, then reopening the URL restores that state (state presets in URL params, FR-04-03; C-priority).
- Given a widget fails to load (old browser), when the block renders, then a static annotated image + caption appears instead (graceful degradation).

**Data & interface notes.** `widgets` registry + presets (DATABASE §3.2); React components in `packages/ui` with a shared `WidgetFrame` (status bar, reset, share, a11y live region).

**Dependencies:** design system (F0). **Open questions:** touch-drag vs slider fallback on small screens (slider fallback proposed for ≤ 480 px).

---

## F-05 Exercise Engine & Hint Ladder

**FR:** 05-01..05, 06-01 · **Phase:** F2 · **Personas:** all; Priya (independent rigor), Maya (scaffold safety)

**Summary.** Eight machine-gradable exercise types (CURR §8.1) with a universal 3-level hint ladder (nudge → strategy → worked parallel step), instant feedback with distractor rationales, and scaffold-level metadata that feeds the mastery engine.

**User stories**

1. As a beginner, I get instant, kind, specific feedback so wrong answers teach instead of sting.
2. As a stuck learner, hints nudge me toward solving it myself — never past the step I can reach.
3. As a progressing learner, guided exercises fade into independent ones so I feel myself getting stronger.

**Acceptance criteria**

- Given each of the 8 types (MCQ, multi-select, fill-blank with numeric tolerance + units, ordering, matching, data-interpretation, Parsons with indentation, code-with-feedback), when I submit, then grading is client/server per type, ≤ 200 ms p95 for non-code types, and the correct answer is never shipped to the client before first submission.
- Given I answer wrongly, when feedback renders, then it includes the authored rationale for the distractor I chose (why it was tempting, why it's wrong); no bare "incorrect".
- Given I use hint 1, then it is a nudge ("What column would tell you the order total?"); hint 2 is a strategy; hint 3 is one fully worked *parallel* example — never the answer; after hint 3, "Ask Ada" appears (F-10), and Ada elaborates hint level 3 only.
- Given an independent exercise (scaffold level ≥ 3), when I solve it without hints, then it counts full weight in mastery evidence; hint usage proportionally down-weights (weights in CURR §9.5 are computed from attempt metadata: `hints_used`, `tutor_used`).
- Given a Parsons problem, when I drag blocks, then both order and indentation are graded, distractor (extra) blocks exist, and a keyboard drag mode is available.
- Given I retry after failing, when the exercise allows multiple attempts, then each attempt is stored (`exercise_attempts`) and shown in "review mistakes" with my answer vs. expectation.
- Given I lose connectivity mid-exercise, when I reconnect, then my in-progress answer is restored (client draft autosave, server sync on reconnect).

**Data & interface notes.** `exercises`, `exercise_attempts` (DATABASE §3.4); comparators per type in `academy-core` grading engine — shared by F-08 item grading (one engine, two surfaces).

**Dependencies:** grading engine (F2), tutor handoff (F5 for "Ask Ada"). **Open questions:** free-response type ships v1.x with AI-assisted rubric sampling (PRD FR-05 note).

---

## F-06 In-Browser Code Exercises (Pyodide)

**FR:** 07-01/03/04, 07-06 (limits explained) · **Phase:** F2 · **Personas:** Maya, Lena (fear of "breaking the server")

**Summary.** Zero-install Python: a CodeMirror editor + Pyodide runtime in a Web Worker, running learner code and authored test cases entirely in the browser; errors route through the error coach.

**Acceptance criteria**

- Given my first code exercise, when the editor mounts, then a "starting Python…" skeleton shows while Pyodide loads (target < 6 s p75; NFR-03) and the runtime is cached (IndexedDB) thereafter; subsequent loads < 1 s.
- Given I click Run, when execution finishes, then I see stdout, any test-case results (pass/fail with names), and total time; the UI never freezes (worker isolation).
- Given my code raises an exception, when output renders, then I see the plain-English error coach first (cause → 3-step fix) with the raw traceback in a collapsible (deterministic table first, F-10 fallback for unmapped errors from F5).
- Given the exercise declares a time cap (e.g., 10 s), when my code exceeds it, then execution is halted with a friendly timeout explanation (likely infinite loop + how to spot it) — a *teaching* moment, not an error.
- Given I click Reset, when confirmed, then starter code is restored; my previous attempt remains in history (FR-07-04).
- Given I complete the exercise, when I view the reference solution, then it is revealed only after passing or after 3 attempts, with a side-by-side diff view and "what good looks like" annotations.
- Given a small-screen device, when I open a code exercise, then I can read it and browse its solution, with an honest "code exercises are best on a keyboard device" note and a queue-for-later action.

**Data & interface notes.** `runtime: "pyodide"` exercises; pinned Pyodide + trimmed wheel set in lesson bundles; grading client-side, results synced to `exercise_attempts` (server re-verifies for mastery evidence on checkpoint-relevant items).

**Dependencies:** F-05 engine; error coach table (F2.5). **Open questions:** wheel set per-course vs global (global proposed; trim at build).

---

## F-07 Sandboxed Execution & Auto-Grading

**FR:** 07-02/03/04/05, NFR-08 · **Phase:** F3 · **Personas:** Tom, Priya (real datasets), all capstones

**Summary.** Heavy Python (pandas/sklearn/matplotlib, real datasets) runs in an isolated cloud sandbox: container-per-job, no network egress, resource caps, artifacts (charts/CSV) to object storage, grading against authored test cases.

**User stories**

1. As a learner, I run real analysis on real data without installing anything or fearing breakage.
2. As a learner, my charts and results appear inline and are saved to my submission history.
3. As a platform, untrusted code must never touch other learners, data, or the network.

**Acceptance criteria**

- Given a sandbox exercise/project, when I submit, then a job is queued and I see live status (queued → running → done) with p95 start-to-result < 10 s (NFR-02); > 30 s shows an honest progress explanation, not a spinner lie.
- Given execution, when limits are hit (CPU s / memory MB / wall time per exercise class), then the job is killed with a plain-English explanation of which limit and how to reduce it; no job can exceed caps (enforced by cgroups + nsjail; verified by the Phase-3 escape suite).
- Given the sandbox, when code attempts any network access or filesystem escape, then it fails closed, is logged as an anomaly class, and repeated anomalies auto-pause the account pending review (R2).
- Given my code produces artifacts (PNG/CSV), when the job succeeds, then they display inline and persist to my submission (signed URLs, 12-month retention per DATABASE §7).
- Given grading, when tests run, then hidden tests are never shipped to the client; results show per-test names/failures; partial credit follows authored weights.
- Given my dataset panel, when I open a project, then I can browse the dataset's column dictionary (plain English), download it, and (projects only) upload my own CSV (≤ 5 MB, scanned, no PII requested).
- Given sandbox downtime, when I submit, then the UI degrades: reading/quizzes unaffected, a status banner explains, and my job is preserved for auto-run on recovery (SYSTEM §13).

**Data & interface notes.** `execution_jobs`, `test_cases`, artifacts in object storage (DATABASE §3.4); queue priority lanes (SYSTEM §9.2).

**Dependencies:** BullMQ workers (F3.2), object storage, external security review gate (roadmap 3.7). **Open questions:** max concurrent jobs per user at 5k MAU (proposed: 2; revisit at load test).

---

## F-08 Checkpoints, Adaptive Pools & Exams

**FR:** 06-01..04 · **Phase:** F4 · **Personas:** Priya (proof), Raj (efficiency), Maya (low stakes)

**Summary.** Mastery gates: in-lesson checks (2–5 items), module checkpoints (8–15 items, ≥ 80% gate, unlimited low-stakes retakes with fresh draws from outcome-tagged pools, adaptive weak-outcome-first selection), course exams (timed, modest limits).

**Acceptance criteria**

- Given a checkpoint start, when items are drawn, then selection is weak-outcome-first (from my lesson evidence), then coverage of remaining module outcomes, with difficulty ramping within the attempt; served-item de-duplication prevents recent repeats across retakes.
- Given I finish a checkpoint, when results render, then I see pass/fail vs. 80%, a per-outcome breakdown with plain-English outcome names, and prescriptions: exact lessons to review (U-5) + one-click "practice weak outcome" set; the result is stored with `outcome_breakdown` (DATABASE §3.3).
- Given I fail twice, when the prescription renders, then it names the 2–3 specific lessons by outcome evidence and offers a tutor check-in — never "repeat the module" (U-5).
- Given a retake, when I start one, then it draws a fresh variant set (≥ 3 variants per outcome pooled), there is no penalty counter, and the UI says so ("retakes are free — mastery is the point").
- Given a course exam, when I start, then it is timed (45–60 min), one attempt per 24 h, open-book by design (item rules I-1..I-6, CURR §9.4), and passing ≥ 75% enables the course certificate (v1.1).
- Given any item, when authored, then it maps to exactly one outcome, its distractors carry rationales, and pool lint blocks publication of orphan or untested outcomes (FR-15-02).
- Given the checkpoint screen, when I use keyboard only, then the entire flow (answer, navigate, review results) is operable; timing, if any, is displayed but not a countdown-stress pattern for module checkpoints (only exams are timed).

**Dependencies:** item pools (content Wave 1+), mastery engine (F4.2), grading engine (F2 shared). **Open questions:** checkpoint retake cool-down (proposed: none; monitor pool exhaustion telemetry).

---

## F-09 Progress Dashboard & Mastery Map

**FR:** 08-01/02 (03 review queue in v1.1) · **Phase:** F2 (v1 dashboard), F4 (mastery map) · **Personas:** Lena (encouragement), Raj (weeks-to-goal), Priya (gap visibility)

**Summary.** One page answering: where am I, what's next, what should I review, when do I reach my goal. Track map + mastery states per outcome + honest projection.

**Acceptance criteria**

- Given my dashboard, when it loads, then I see: next lesson CTA (resume), track map with per-course/module states (locked/available/in-progress/mastered/credited), time invested this week vs. my budget, and weeks-to-goal projection at my actual pace (no fake optimism; range shown).
- Given the mastery map, when I expand a module, then outcomes render with states (strong / developing / needs review) in plain language ("Developing: you've used it with hints; time to make it yours") and a "review now" action per weak outcome.
- Given placement credits, when they exist, then credited modules show distinctly ("You proved this") and count toward progress without overstating skill.
- Given mastery state, when evidence updates, then weights follow CURR §9.5 (independent 0.35 / checkpoint 0.35 / checks 0.20 / review 0.10) and state transitions are explained on hover ("why did this drop to developing?").
- Given the v1.1 review queue, when daily review is due, then a "5-minute review" card lists due items (terms/questions/exercises, SM-2-lite) with the day's streak of reviews kept.

**Dependencies:** mastery engine, event analytics. **Open questions:** projection algorithm details (linear + recent-pace blend proposed).

---

## F-10 AI Tutor "Ada"

**FR:** 09-01..07, NFR-13/16 · **Phase:** F5 · **Personas:** Maya (never stuck), Tom (error coach), Priya (gap filler)

**Summary.** A lesson-scoped Socratic tutor: grounded in curriculum content (RAG), personalized with lesson context + mastery + recent mistakes, bound never to reveal exercise/assessment answers, escalating hints only, degrading gracefully to deterministic hints on quota or outage.

**User stories**

1. As a stuck learner, I ask "I don't get it" and Ada figures out what "it" is — my current block, my last wrong answer — and guides me with questions.
2. As a learner with an error, I paste a traceback and get cause + 3-step plan in plain English, with the term tooltips inside Ada's replies.
3. As a learner during a checkpoint, Ada helps me with logistics but never content — and says so honestly.
4. As a cost-conscious platform, deterministic answers (term lookups, mapped errors) never invoke an LLM.

**Acceptance criteria**

- Given a tutor panel open from a lesson/exercise/tooltip, when I send a message, then the reply streams (SSE), cites lesson context when used ("In this lesson, a DataFrame is…"), and auto-links registry terms in its own text (hover tooltips active — FR-09-03).
- Given I ask for the answer to an active exercise/checkpoint item, when Ada responds, then it refuses kindly, explains why, and offers the next appropriate hint level (policy: SYSTEM §7.4; enforced by red-team CI suite — a violation fails the build, NFR-16).
- Given an assessment is in progress, when I open Ada, then she states the honest scope limit ("I can't help with content during checkpoints — here's how navigation works") and enforces it.
- Given an unmapped runtime error, when I share it, then Ada responds with the error-coach structure (what happened → why → 3 steps), grounded in the course's content.
- Given my context, when Ada builds a reply, then it includes: current lesson/blocks, my mastery states, my last 3 mistakes with what finally worked (SYSTEM §7.5) — and never raw long-term chat history.
- Given my daily quota is reached, when I message again, then I see quota state and a graceful fallback: authored hint ladder + curated links ("Ada will be back tomorrow — here's what usually helps right now"), never a dead end (FR-09-07).
- Given provider outage, when the tutor is circuit-broken, then the panel degrades to deterministic mode with a status chip (SYSTEM §13) — the product remains usable.
- Given flagged replies, when a learner thumbs-downs or reports, then the transcript is flagged for admin review (F-14) and sampled transcripts are reviewed weekly (R4 gate).

**Data & interface notes.** `tutor_sessions/messages`, `ai_usage_daily`, `rag_chunks` (DATABASE §3.6); model routing per SYSTEM §7.6.

**Dependencies:** RAG index (publish webhook), term registry, error-coach table, quota middleware. **Open questions:** message-per-day soft cap (proposed 30/day, tuned to cost model §8); voice input deferred (v2).

---

## F-11 Guided Projects & Capstones

**FR:** 10-01/02, 06 (L5) · **Phase:** F3 (guided machinery + P1), F6/v1.4 (capstones) · **Personas:** all; the portfolio engine

**Summary.** Guided projects = scaffolded, auto-checked steps on real datasets (P1 "Your First Analysis" in v1). Capstones = rubric-scored, portfolio-grade scenario projects per track (CURR §10).

**Acceptance criteria**

- Given a guided project, when I open it, then I see the scenario, the dataset panel, steps in order with check states, and an overall progress ring; each step states what "done" means before I start.
- Given a step with an auto-check, when I submit code/output, then the check runs in the sandbox (F-07) and failure feedback is teaching-grade (what to look at, not just "wrong").
- Given all steps complete, when the project finishes, then my notebook/code snapshot + artifacts are saved to the submission and offered to "Add to portfolio" (F-12).
- Given a capstone (v1.4+), when I start, then the 4×4 rubric (technical correctness, analytical honesty, communication, process — CURR §10.3) is shown upfront; self-assessment against the rubric precedes submission.
- Given a submitted capstone, when scoring runs, then automated checks (runs clean, reproducible, quality gates) score first; AI-assisted rubric feedback drafts (sampled, human-reviewable) follow; pass rule: average ≥ 3.0 with no criterion < 2, one free resubmission.
- Given a rubric dimension, when feedback renders, then it quotes specific evidence from my submission ("your cleaning decision log covers missing values but not the duplicate IDs — that's the honesty criterion").

**Dependencies:** F-07 sandbox, datasets, rubric content. **Open questions:** human review capacity in v2 (mentor queue design deferred — W v1).

---

## F-12 Portfolio Pages

**FR:** 10-03/04 · **Phase:** F6 · **Personas:** Raj (job hunting), Priya (credibility)

**Summary.** A public, shareable portfolio page per learner: headline, bio, verified-skill chips from live mastery data, showcased project submissions with abstracts and artifact links; exportable.

**Acceptance criteria**

- Given I opt in, when I publish my portfolio, then it is available at a stable public URL (`/academy/p/<slug>`), crawlable-shareable, and lists only items I explicitly showcase.
- Given a project item, when it renders, then it shows abstract, tech tags, artifact links (charts, notebook, repo snapshot), and the rubric-earned level if the capstone passed — no unverifiable claims ("verified skill: pandas grouping — demonstrated in C1.3").
- Given verified skill chips, when fetched, then they derive from mastery states (strong only) with "verified by DataVerse Academy" provenance.
- Given I delete my account, when the deletion grace period ends, then the portfolio and artifacts are purged (GDPR, DATABASE §7).
- Given privacy defaults, when a learner is under 18 (declared age gate at signup), then portfolios default off with guardian-aware messaging (privacy-first).

**Dependencies:** F-11, mastery engine, object storage lifecycle. **Open questions:** custom slugs (proposed: yes, one change allowed).

---

## F-13 Career Readiness & Career Center

**FR:** 11-01..04 · **Phase:** F6 (readiness checklist in v1), v1.2 (full center) · **Personas:** Raj, Tom

**Summary.** "Job-ready when…" checklists per track tied to live mastery data (v1), then the full Career Center: job-profile explorer, skill-to-course mapping, interview bank with walkthroughs, resume module.

**Acceptance criteria**

- Given my track, when I open readiness, then I see the checklist items (CURR §12) each mapped to my real evidence (e.g., "SQL joins — checkpoint C4.3: mastered 88%") with honest gaps ("not yet: dashboards").
- Given the job-profile explorer (v1.2), when I open a role, then I see day-in-the-life, sourced salary ranges (source + date shown — never invented), required skills mapped to courses with my coverage state, and realistic entry paths.
- Given the interview bank (v1.2), when I practice, then questions are track-filtered (concept/SQL/coding/behavioral), each with a model-answer walkthrough structured as "how to think, not what to recite"; spaced-repetition integration for repeated practice (v1.3).
- Given the resume module (v1.2), then guidance converts my completed projects into resume bullets with impact framing, and warns against unverifiable skill claims (ties to verified skills, F-12).

**Dependencies:** mastery data, curriculum mapping tables, sourced salary data (content task with citation standard). **Open questions:** salary data update cadence (proposed: quarterly, with visible source dates).

---

## F-14 Content Studio & Admin

**FR:** 15-01..04, plus admin sides of FR-09 (transcript review) and NFR-13 (cost dashboards) · **Phase:** F1 (pipeline + lint), F3 (cost/sandbox dashboards), F5 (transcript review) · **Personas:** Sam (author), Alex (admin)

**Summary.** Internal surface for content-as-code: import from git, preview, pedagogical lint results, versioned publish/rollback; plus admin: user lookup, flags, sandbox health, tutor transcripts, cost dashboards.

**Acceptance criteria**

- Given a content branch merged, when the import job runs, then lint results render per lesson with rule categories (schema, term coverage, reading level, loop completeness, item rules I-1..I-6) and stage gate: any blocking rule stops publish with a plain explanation and fix hint.
- Given a preview, when Sam opens it, then the lesson renders exactly as learners will see it (same components), with simulated learner state (fresh / mid-lesson / completed).
- Given a publish, when Alex approves, then it creates an immutable `course_version` (+ `content_revisions` snapshots), revalidates ISR, re-indexes RAG, and updates search — atomically; rollback = one click to a prior version.
- Given the admin console, when Alex opens a user, then he sees enrollment, progress, quota state, and can apply support actions (reset placement section, grant quota, anonymize per GDPR export/delete flows).
- Given tutor transcript review, when a flagged transcript opens, then it renders with policy annotations (which rule was triggered), actions (dismiss / add to red-team suite / escalate), and weekly sampled-review queue state.
- Given cost dashboards, when viewed, then they show per-day LLM spend, per-user distribution, sandbox CPU-minutes, and budget-burn alerts wired to alerting (R3).

**Access control.** Studio and admin routes are role-gated (`author`, `admin`) at layout *and* action level; all actions audit-logged.

**Dependencies:** content pipeline infra (SYSTEM §8). **Open questions:** none blocking.

---

## F-15 Gamification (v1.x)

**FR:** 13-01..03 · **Phase:** v1.3 · **Personas:** Lena (streaks), all (momentum)

**Summary.** Motivation systems that respect beginners: XP as a progress ledger (not competition), streaks with a weekly freeze (life happens), badges for meaningful firsts. No leaderboards (PRD §10.3).

**Acceptance criteria**

- Given XP rules, when evidence lands (exercise solved, checkpoint passed, project step), then XP awards exactly once per source (idempotency key) with visible earn moments ("+40 — first join query!").
- Given levels, when I cross one, then the title is career-flavored ("From Curious to Data-Curious: Level 3 — Apprentice Analyst"), never cutesy-shaming.
- Given a streak, when I miss a day with a freeze available, then the freeze auto-applies and the streak survives, with a kind explanation; freezes refill weekly (max 1).
- Given badges, when earned, then they mark real firsts (first query, first chart, first model, first API) with shareable cards; no engagement-bait badges (no "logged in 7 days").
- Given gamification off (preference), when I disable it, then XP/streak UI hides and nothing gates on them.

---

## F-16 Search (v1.x)

**FR:** 14-01/02 · **Phase:** v1.2 · **Personas:** Priya (find-that-thing), all

**Summary.** Typo-tolerant unified search over lessons, terms, exercises, projects, career pages; starts as Postgres FTS + trigram (ADR-008), swap-ready for Meilisearch.

**Acceptance criteria**

- Given the search box, when I type ≥ 2 characters, then grouped results (Lessons / Terms / Projects / Careers) appear ≤ 300 ms p95 with highlighted matches and direct deep links (lesson + block anchor).
- Given a typo ("pandass"), when results render, then fuzzy matching returns pandas-related results.
- Given results, when I filter by track/course, then filtering applies client-side to the returned set with counts.
- Given permission states, when a guest searches, then unpublished/draft content never appears (index built only from published versions).

---

## Traceability Matrix (feature → FR → phase → QA surface)

| Feature | FR IDs | Phase | Tested by |
|---|---|---|---|
| F-01 Onboarding & Placement | 01-01..04 | F1/F4 | e2e onboarding; placement validity study |
| F-02 Lesson Reader | 02-01..06, 16 | F1 | e2e read path; a11y audit; version-carryover test |
| F-03 Glossary & Terms | 03-01..05 | F1 | content lint; tooltip unit/e2e |
| F-04 Widgets | 04-01..03 | F2+ | a11y + interaction tests; visual snapshots |
| F-05 Exercise Engine | 05-01..05, 06-01 | F2 | comparator unit matrix; hint ladder e2e |
| F-06 Pyodide | 07-01/03/04/06 | F2 | runtime budget test; worker isolation |
| F-07 Sandbox | 07-02..05 | F3 | escape suite; latency/load; artifact lifecycle |
| F-08 Checkpoints & Exams | 06-01..04 | F4 | pool draw tests; band telemetry (60–85%) |
| F-09 Progress & Mastery | 08-01/02 | F2/F4 | engine unit (weights); dashboard e2e |
| F-10 Tutor | 09-01..07 | F5 | red-team CI; grounding eval; quota tests |
| F-11 Projects & Capstones | 10-01/02 | F3/F6 | step-check tests; rubric calibration |
| F-12 Portfolio | 10-03/04 | F6 | public page e2e; GDPR purge test |
| F-13 Career | 11-01..04 | F6/v1.2 | mapping integrity; source citation lint |
| F-14 Studio & Admin | 15-01..04 | F1..F5 | lint rule tests; RBAC tests; audit log |
| F-15 Gamification | 13-01..03 | v1.3 | idempotency tests; preference-off test |
| F-16 Search | 14-01/02 | v1.2 | index freshness; permission leakage test |

---

*This specification completes the Phase-1 document set. Implementation begins at Phase 0 only upon approval of all six documents (see `IMPLEMENTATION_ROADMAP.md §10`).*
