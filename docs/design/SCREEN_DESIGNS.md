# SCREEN_DESIGNS.md

**Product:** DataVerse Academy
**Phase:** 2 — Experience Design (screen architecture)
**Version:** 1.0.0
**Date:** 2026-11-14
**Related:** `DESIGN_SYSTEM.md`, `COMPONENT_INVENTORY.md`, `INTERACTION_SPECIFICATION.md`, `RESPONSIVE_BEHAVIOUR.md`, Phase-1 FRs per screen

---

## Table of Contents

0. [Global Information Architecture](#0-global-information-architecture)
1. [Homepage](#1-homepage)
2. [Course Catalogue](#2-course-catalogue)
3. [Learning School Landing Pages](#3-learning-school-landing-pages)
4. [Individual Course Page](#4-individual-course-page)
5. [Learning Roadmap](#5-learning-roadmap)
6. [Lesson Reader](#6-lesson-reader) ★ centerpiece
7. [Interactive Coding Laboratory](#7-interactive-coding-laboratory)
8. [Exercise Workspace](#8-exercise-workspace)
9. [Quiz / Checkpoint Interface](#9-quiz--checkpoint-interface)
10. [Project Workspace](#10-project-workspace)
11. [Student Dashboard](#11-student-dashboard)
12. [Learning Analytics Dashboard](#12-learning-analytics-dashboard)
13. [AI Tutor Interface ("Ada")](#13-ai-tutor-interface-ada)
14. [Bookmarks & Notes](#14-bookmarks--notes)
15. [User Profile](#15-user-profile)
16. [Admin Dashboard](#16-admin-dashboard)
17. [Instructor Dashboard (Content Studio)](#17-instructor-dashboard-content-studio)
18. [Search Results](#18-search-results)
19. [Glossary Explorer](#19-glossary-explorer)
20. [Career Preparation Centre](#20-career-preparation-centre)

---

## 0. Global Information Architecture

### 0.1 Route map (IC-1: all under `/academy`)

```
/academy................................................ Home (#1)
/academy/courses......................................... Catalogue (#2)
/academy/schools/[foundations|programming|data-craft|machine-learning|career]  (#3)
/academy/courses/[slug]................................. Course page (#4)
/academy/roadmap / /academy/roadmap/[track]............. Roadmap (#5)
/academy/learn/[course]/[module]/[lesson]............... Lesson Reader (#6)
/academy/learn/...?lab=1  ·  /academy/lab/[exercise].... Coding Lab (#7)
/academy/exercise/[id].................................. Exercise workspace (#8)
/academy/checkpoint/[module]  ·  /academy/exam/[course]. Quiz/Checkpoint (#9)
/academy/projects/[slug]................................ Project workspace (#10)
/academy/dashboard...................................... Student dashboard (#11)
/academy/analytics...................................... Analytics (#12)
/academy/tutor  (panel embedded everywhere)............. Tutor (#13)
/academy/library (notes · bookmarks).................... Library (#14)
/academy/profile........................................ Profile (#15)
/academy/search?q=...................................... Search (#18)
/academy/glossary  ·  /academy/glossary/[term].......... Glossary (#19)
/academy/career......................................... Career Centre (#20)
/studio/*  ·  /admin/*.................................. #17, #16 (role-gated, host namespace if mounted)
```

### 0.2 Navigation model

- **Marketing contexts** (1–5, 18–20): MarketingNav + Footer; content-max container.
- **App contexts** (6–17): AppNav (breadcrumb-led) + contextual side structures; shell-max.
- **Persistent everywhere:** Search trigger (⌘K) → CommandPalette; ThemeToggle; UserMenu; Ada (FAB in app contexts, panel in reader).
- **The persistent triad** (DS §3.3): every learner screen exposes *Where am I* (breadcrumb/tree) · *What's next* (primary CTA) · *How am I doing* (progress element).

### 0.3 Screen status legend

● v1 MVP · ◐ v1.x · ○ v2 (mirrors `IMPLEMENTATION_ROADMAP.md`).

---

## 1. Homepage ●

**Purpose/JTBD:** In ≤ 10 seconds a visitor understands: *this is a serious, free, complete path from zero to a data career — and it starts gently.* Converts to "Start free".
**Traceability:** PRD §3 (positioning), FR-01-05 (guest browsing nudge).

```
┌────────────────────────────────────────────────────────────────┐
│ ◆ DataVerse Academy    Courses Schools Roadmaps Practice …  ⌘K ◻ ◉ Sign in │
├────────────────────────────────────────────────────────────────┤
│  THE ZERO-PREREQUISITE DATA ACADEMY          ┌───────────────┐ │
│  Data fluency,                              │ live lesson    │ │
│  built from zero.                    (Fraunces display-2xl)   │ │
│  23 courses · 360 lessons · 3 career         │  card demo:    │ │
│  tracks — every term explained, every        │  term tooltip  │ │
│  step practiced.                             │  + chart       │ │
│  [ Start free → ]  [ Explore the curriculum ]└───────────────┘ │
│  No credit card. No math required. Ever. ← trust strip         │
├────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS — Explain ▸ See ▸ Try ▸ Prove   (numbered flow)   │
├────────────────────────────────────────────────────────────────┤
│  SCHOOLS — 5 editorial rows (keyline + illustration + stats)   │
│  A Foundations · B Programming · C Data Craft · D ML & AI · E Career │
├────────────────────────────────────────────────────────────────┤
│  YOUR PATH — RoadmapTimeline preview (Analyst track, animated) │
├────────────────────────────────────────────────────────────────┤
│  MEET ADA — tutor chat mock (2 bubbles, term chips)            │
├────────────────────────────────────────────────────────────────┤
│  OUTCOMES — 3 TrackCards + single credible testimonial          │
├────────────────────────────────────────────────────────────────┤
│  FAQ (4 accordions) · Footer (sitemap · legal · a11y statement)│
└────────────────────────────────────────────────────────────────┘
```

**Design intent:** Editorial, Linear-grade restraint. Serif hero, generous 96 px section rhythm, one animated artifact (live lesson card: term tooltip + sparkline), zero stock photos. The lesson-card demo *shows* the product instead of describing it — a visitor can hover "mean" and get the actual registry tooltip before signing up.
**Key components:** MarketingNav, CourseRow (mini, in schools rows), RoadmapTimeline, TrackCard, TutorMessage (static), Figure, FAQ Accordion.
**Responsive:** stack hero at < lg (demo card after copy); schools rows collapse to 2-col then 1-col; roadmap becomes horizontal scroll-snap < md. **Interaction highlights:** see INTERACTION §2.1.
**Anti-pattern guarded:** no card grids, no gradient hero, no "10,000 happy learners" counters.

## 2. Course Catalogue ●

**Purpose/JTBD:** "Find my next (or first) course fast — and see exactly where it leads." Browsing is filtered, honest, and progress-aware.
**Traceability:** FR-02-01, FR-14-02.

```
┌ AppNav: ◆ / Courses / ▸ All courses            ⌘K ◻ ◉ ┐
├──────────────┬───────────────────────────────────────────┤
│ FILTERS      │ 22 results · sorted by ▾ [Roadmap order]  │
│ School ◉all  │ ┌───────────────────────────────────────┐ │
│  ○A ○B ○C…   │ │ A1  Starting from Zero    4m·14l·Beginner ▷ │ │
│ Track ◉all   │ ├───────────────────────────────────────┤ │
│  ○AN…        │ │ A2  Thinking Like a …    ●●●○○ 46%  Resume │ │
│ Level ◉all   │ ├───────────────────────────────────────┤ │
│ Status ◉all  │ │ A3  Math Without Fear    not started  Start │ │
│  ☐Started    │ └───────────────────────────────────────┘ │
│  ☑Available  │  (editorial rows, school keylines, hairlines)│
│ Reset        │                                           │
└──────────────┴───────────────────────────────────────────┘
```

**Design intent:** Rows, not cards (DS §10). School keyline color + course code give visual wayfinding without thumbnails; typography does the work. Enrolled courses surface progress ring + Resume first (sorted by "for you" by default).
**Key components:** CourseRow, filter Checkboxes, SegmentedControl (sort), Chips (active filters), EmptyState (no results → clear filters + Glossary link).
**Responsive:** < lg filters → "Filters" sheet trigger (count badge); rows stack meta under title; < sm school keyline thickens (thumb-reachable identity).

## 3. Learning School Landing Pages ● (×5)

**Purpose/JTBD:** "What is this stage of the journey, why does it exist, and what exactly will I be able to do?" A serious academic "department page" per school.
**Traceability:** CURR §3 stages; FR-11 job-skill framing.

```
┌ MarketingNav ┐
│ ┌───────────────────────────────────────────────┐
│ │ [Data Lineage illustration]   SCHOOL OF       │
│ │                              DATA CRAFT       │ (display-xl)
│ │ From messy spreadsheets to honest,            │
│ │ decision-ready analysis.                       │
│ │ 6 courses · 108 lessons · 2 projects          │
│ │ [ Start this school ] [ View roadmap ]         │
│ └───────────────────────────────────────────────┘
│ YOU'LL BE ABLE TO — 4 outcome checkmarks (job-flavored)
│ COURSES IN THIS SCHOOL — CourseRows (in order, prereq flow arrows)
│ THE SCHOOL IN YOUR TRACK — which tracks include it, where it sits
│ PROJECTS — brief strip (P1 Your First Analysis…)
│ FAQ (3) · Footer
└──────────────────────────────────────────────┘
```

**Design intent:** Five distinct page identities through illustration + first sentence, one shared skeleton — coherence with personality. Outcome checkmarks are written in plain job skills ("Answer business questions with SQL joins"), never abstract ("master data manipulation").
**Key components:** SchoolHeader, CourseRow, PrereqGraph (mini flow), ProjectBriefCard, Callout (if school has placement-credit modules).

## 4. Individual Course Page ●

**Purpose/JTBD:** Evaluate deeply before starting: outcomes, structure, effort, prerequisites, projects — then commit ("Start course" / "Resume · lesson 8").
**Traceability:** FR-02-01/03, FR-11-04.

```
┌ AppNav: ◆ / Schools / Data Craft / C1 ┐
│ C1 · TABLES OF DATA          [Start course] or [Resume · Lesson 8 ▸]
│ pandas Foundations            (display-lg serif)
│ Load, clean, question, and chart real tables…
│ ▮ 5 modules ▮ 24 lessons ▮ ~9 h ▮ Beginner ▮ 1 project ▮ 2 checkpoints/mo
├──────────────────────────────────────────────┤
│ YOU'LL BE ABLE TO — outcome checklist (5)     │
│ SYLLABUS — module accordions                  │
│  ▸ C1.1 First contact with a table (4 lessons · 35 min · ✓ 100%)
│  ▾ C1.3 Choosing rows and columns             │
│     · C1.3.1 Columns are names   12 min  ✓     │
│     · C1.3.2 Sorting, the honest way 14 min ●now│
│     · …  [Checkpoint: C1.3 gate · ≥80%]        │
│ PROJECT — P1 "Your First Analysis" brief card │
│ YOU'LL NEED FIRST — PrereqGraph (A4, B1) + placement credit note │
│ TOOLS & DATA — Python · pandas · 3 datasets panel │
│ WHAT LEARNERS SAY — 1 credible quote          │
└──────────────────────────────────────────────┘
```

**Design intent:** The syllabus is the hero — full module/lesson table (dur, states, checkpoint gates visible). "You'll need first" converts the prerequisite DAG into a friendly path with one-click placement ("Prove what you know — 5 min").
**Key components:** PageHeader, OutcomeRow (static mastery), Accordion syllabus, PrereqGraph, ProjectBriefCard, DatasetPanel (collapsed), CertificateCard teaser (◐).

## 5. Learning Roadmap ●

**Purpose/JTBD:** "Show me the whole journey and exactly where I am on it." The motivational centerpiece — one screen that makes progress *visible*.
**Traceability:** FR-01-04 study plan, FR-08-01, CURR §4 unlock rules.

```
┌ AppNav: ◆ / Roadmap ┐
│ Your roadmap        [Data Analyst ▾] [pace: 5 h/wk → done ~Mar '27]
│ ───────────────────────────────────────────────
│  STAGE A · FOUNDATIONS            ◼ complete
│     ● A1 ─── ● A2 ─── ● A3 ─── ◆ A4 (credited)
│  STAGE B · PROGRAMMING
│     ● B1 ─── ◉ B2 (now · 3/6) ─── ○ B2B
│  STAGE C · DATA CRAFT
│     ○ C1 ──◇ P1 project ── ○ C2 … ◇ P3 ── ★ capstone
│  STAGE E · CAREER
│     ○ E1 ── ⊕ certificate ── ○ E2
│  [ pace lane: week markers sliding under the spine ]
└──────────────────────────────────────────────┘
```

**Legend:** ● complete ◉ current ○ locked ◆ placement-credited ◇ project ★ capstone ⊕ certificate.
**Design intent:** A single vertical spine (the *path*), stage bands as chapter markers, milestones as distinct shapes — readable as a metro map. Current node has a quiet pulse; completed path segments are drawn teal. The pace lane underlays honest week markers ("at 5 h/week you reach C4 near mid-Jan") — never fake optimism.
**Key components:** RoadmapTimeline, TrackCard (switcher), MasteryMeter (in node popovers), CertificateCard (milestone popover).
**Responsive:** < md becomes vertical scroll (already is) with sticky stage headers; pace lane hides < md (available in dashboard). Node popover → bottom sheet on touch.

## 6. Lesson Reader ● ★ centerpiece

**Purpose/JTBD:** "Teach me this one thing, completely, without losing me — and keep the whole course around me."
**Traceability:** FR-02-02..07, FR-03, CURR §5 Learning Loop; the explicit three-column brief.

```
≥1440px — THREE COLUMNS
┌ AppNav: ◆ / C1 Data Craft / C1.3 / ▸ Sorting, the honest way    ⌘K ◻ ◉ ┐
├──────────┬──────────────────────────────────────┬──────────────┤
│ TREE 280 │ LESSON (center, prose ≤760px)        │ RAIL 320     │
│ C1 ·46%◯ │ C1.3 · Module 2 of 5                 │ ON THIS PAGE │
│ ▸ C1.1 ✓ │ Sorting, the honest way     (display)│ ▸ Why        │
│ ▾ C1.3   │ ▮14 min ▮3 outcomes ▮2 new terms     │ ▸ Fair-share │
│  ·3.1 ✓  │ ┌ WHY THIS MATTERS ───────────┐      │ ▸ Try it     │
│  ·3.2 ●NOW│ │ Sales asks "top 5 months…"│      │ ▸ Check       │
│  ·3.3 🔒 │ └────────────────────────────┘      │ KEY CONCEPTS │
│  ▸ C1.4  │ Prose… every term dotted & hoverable │ ¤ sort order  │
│ [Checkpoint│ Figure / WidgetFrame (fair-share beam)│ ¤ stable sort│
│  gate 🔒] │ ExampleNarrative (worked, 4 steps)   │ ASK ADA      │
│          │ ┌ EXERCISE · guided ────────┐        │ [input… ▸]   │
│          │ │ …HintLadder 1·2·3·Ada     │        │ NOTES (2)    │
│          │ └───────────────────────────┘        │ ＋Bookmark    │
│          │ CheckQuiz (2 questions inline)       │ [sticky rail]│
│          │ SummaryCard → NextLessonCard         │              │
└──────────┴──────────────────────────────────────┴──────────────┘
```

**Column contracts:**

- **LEFT — Course navigation (sticky):** course header (title + ring), module accordions, lesson rows with completion indicators (✓ teal / ● current / 🔒 locked-with-tooltip / ◆ gold "proved"), checkpoint gate markers. Auto-scrolls to keep current lesson in view; collapsible to 64 px icon rail at 1280–1439 px.
- **CENTER — The Learning Loop:** typed blocks in CURR §5 order, rendered by the block components (§INVENTORY-3); prose max 68ch; every interactive element in-flow (widget, exercise, check) — the learner never leaves the page to practice.
- **RIGHT — Context rail (sticky):** "On this page" scrollspy TOC · "Key concepts" term chips (tooltip previews) · **Ask Ada** mini panel (context pre-loaded) · Notes & bookmarks quick add + count. Collapsible; each card independently dismissible.

**Breakpoint behavior (full spec in RESPONSIVE §3):** ≥1440 three columns · 1280–1439 icon-rail + center + rail · 1024–1279 center + overlay sheets · <1024 single column + bottom action bar `[Contents] [Ask Ada] [Notes]` + top progress hairline.
**Key components:** CourseTreeNav, all §INVENTORY-3 blocks, HintLadder, CheckQuiz, TutorPanel (docked), ProgressHairline.
**Design intent:** Calm typography, invisible chrome — the lesson is the interface. The right rail makes *support* (Ada, notes, TOC) ambient rather than interruptive; the left tree makes *momentum* ambient. Small screens keep the loop complete via sheets (nothing is dropped, everything is reachable in ≤ 2 taps).

## 7. Interactive Coding Laboratory ●

**Purpose/JTBD:** "Write and run real Python on real data with zero setup — safely — and see exactly what my code did."
**Traceability:** FR-07-01..06, SYSTEM §6.

```
┌ AppNav: ◆ / Lab · Exercise C1.4.3 · Group by month        [Runs in browser ▾] ┐
├──────────────┬──────────────────────────────┬────────────────┤
│ BRIEF        │ EDITOR (CodeMirror)          │ CHECKS         │
│ Task card    │ 1 ▏import pandas as pd       │ ● visible test │
│ + Dataset    │ 2 ▏df = pd.read_csv(…)       │ ● hidden test  │
│ Panel        │ 3 ▏                           │ ● hidden test  │
│ (dictionary  │ 4 ▏                           │ [Run all ▸]    │
│ first)       │ [ ▶ Run ] [Reset] [Diff]     │ result list    │
│              ├──────────────────────────────┤                │
│ Starter note │ CONSOLE (resizable)          │                │
│ + solution   │ Output │ Tests │ Plot tabs   │                │
│ (3 tries)    │ > grouped by month ✓         │                │
│              │ timing: 0.42 s · 512 MB note │                │
└──────────────┴──────────────────────────────┴────────────────┘
```

**Design intent:** A real IDE posture (dark editor theme option), but every system affordance is *teachable*: the runtime badge ("Runs in your browser — nothing to install" / "Sandbox · 10 s · 512 MB — why?") explains itself; errors route to ErrorCoachCard *before* the raw traceback (disclosure); Reset is prominent and guilt-free; Diff appears after 3 attempts alongside the reference.
**Key components:** LabShell, CodeEditor, RunButton, ConsolePanel, ErrorCoachCard, TestResultList, DatasetPanel, TerminalBadge.
**Responsive:** < lg: Brief collapses to header sheet; Checks → segmented tab beside Console; editor min-height 240 px with honest desktop note + "queue for later" action. Splitters keyboard-operable (Alt+arrows).

## 8. Exercise Workspace ●

**Purpose/JTBD:** Non-code practice with the same rigor: attempt → feedback → mastery evidence. Hosts all 8 exercise types in a focused, low-stress stage.
**Traceability:** FR-05-01..05, CURR §8.

```
┌ AppNav: ◆ / Exercise · C1.3.2 · Guided ┐
│ Exercise 2 of 3 · Kind: Data interpretation · Scaffolding ●●○○○
│ ┌────────────────────────────────────────────┐
│ │ Prompt (body-lg) + artifact (chart/table)   │
│ │ [ MCQ options / Parsons board / ordering… ] │
│ │ Hints: [1 nudge] [2 strategy] [3 example]   │
│ │ [ Check answer ]        attempts: ∞ (kindly)│
│ └────────────────────────────────────────────┘
│ ┌ FEEDBACK (after check) ───────────────────┐
│ │ ✓ Correct — and why (1-2 sentences)        │
│ │ or ✕ Not this one — rationale + retry      │
│ └────────────────────────────────────────────┘
```

**Design intent:** One interaction at a time, generous whitespace, feedback that teaches (distractor rationale always). Scaffold dots (0–4) make difficulty visible and *fair* — struggle is expected, not shaming. Hints reveal progressively with explicit intent (INTERACTION §4.2); "Ask Ada" appears after hint 2.
**Key components:** ExerciseCard, MCQOption, ParsonsBoard, OrderingList, MatchingPairs, DataInterp, HintLadder, Feedback panel, MasteryMeter tick (post-solve).

## 9. Quiz / Checkpoint Interface ●

**Purpose/JTBD:** Low-stakes proof: module checkpoints (untimed, retake-free-anxiety) and course exams (timed). Focus mode with zero ambient noise.
**Traceability:** FR-06-01..04, CURR §9.

```
┌ AppNav (simplified): Checkpoint · C1.3 Choosing rows and columns    [Exit] ┐
│ ▰▰▱▱▱▱▱▱▱▱  item 3 of 10 · no timer (module)   ── or ── ⏱ 24:31 (exam)
│ ┌ QUESTION (one at a time) ──────────────────┐
│ │ Q3 · outcome chip: "sort a DataFrame"      │
│ │ Stem (body-lg, chart allowed)              │
│ │ (A)(B)(C)(D) option rows (keyboard 1–4)    │
│ │            [ Skip ]        [ Check ▸ ]     │
│ └────────────────────────────────────────────┘
│ footer: "Retakes are free · fresh questions each time" (checkpoints)
└ On submit → ResultBreakdown screen:
│ ◔ 87% — PASSED (ring draws) → OutcomeRows + prescriptions → [Continue ▸]
└ Fail path: 72% — calm tone, prescriptions first, [Review 2 lessons] [Retake ▸]
```

**Design intent:** Quiz as a quiet room: no sidebar, no streaks, no countdown stress (exam timer only, warning tint <25%, never flashing). Exit guard dialog protects accidental loss. Result screens are learning artifacts: outcome-level breakdown, exact prescriptions, retake framed as normal.
**Key components:** CheckpointPlayer, ExamTimer, MCQOption variants, ResultBreakdown, UnlockGate (if entering locked module), Dialog (exit guard).

## 10. Project Workspace ● (guided) / ◐ (capstone)

**Purpose/JTBD:** "Walk me through a real analysis, step by step, and check my work at each stage." Projects feel like a first job, not homework.
**Traceability:** FR-10-01..04, CURR §10.

```
┌ AppNav: ◆ / Project · P1 Your First Analysis ┐
├─────────────┬───────────────────────────┬──────────────┤
│ STEPS       │ WORKBENCH                 │ RUBRIC       │
│ ✓ Load data │ (LabShell embedded:       │ (capstone)   │
│ ✓ Clean     │  editor + console +       │ 4 criteria × │
│ ● Question 3│  dataset + plots)         │ 4 levels     │
│ ○ Chart it  │ Step brief card above:    │ self-score   │
│ ○ Write it  │ "Done means: df has 12    │ selectors    │
│ ○ Publish   │ rows, one per month"      │ + gate note  │
│ progress ◔  │ [ Check step ▸ ]          │              │
└─────────────┴───────────────────────────┴──────────────┘
Finish → ProjectSummary: artifacts list → [Add to portfolio ▸] [Download files]
```

**Design intent:** Steps on the left give the professional shape of an analysis (load → clean → question → visualize → communicate); the rubric is visible *from minute one* (capstones) so quality is not a surprise at the end. "Done means" line per step = unambiguous completion criteria (auto-checked in sandbox).
**Key components:** ProjectStepList, LabShell, ProjectBriefCard, RubricCard, ProjectSummary (PortfolioItemCard preview).

## 11. Student Dashboard ●

**Purpose/JTBD:** The daily home: "What do I do right now? How am I doing overall? What should I review?"
**Traceability:** FR-08-01, FR-13-02 (streak ◐).

```
┌ AppNav: ◆ / Dashboard                         Good evening, Maya ┐
├──────────────────────────────────────┬──────────────────────────┤
│ CONTINUE LEARNING (hero row)         │ THIS WEEK                │
│ ▶ C1.3.2 Sorting, the honest way      │ ◔ 3h 20m of 5h goal     │
│ 14 min · module 2 of 5 · 46% course  │ ▰▰▰▰▱▱▱ streak 6d ◐     │
│ [ Resume lesson ▸ ]                  │ +11% vs last week       │
├──────────────────────────────────────┤──────────────────────────┤
│ NEXT MILESTONES                      │ REVIEW QUEUE ◐           │
│ ◉ C1.3 checkpoint (2 lessons away)   │ 5 due · 3 min            │
│ ◇ P1 project · ★ Analyst capstone    │ [ Start review ▸ ]       │
├──────────────────────────────────────┤──────────────────────────┤
│ MASTERY SNAPSHOT (top 4 OutcomeRows) │ RECENT ACTIVITY          │
│ sort data ●●●● · group ●●●○ …        │ timeline (kind · time)   │
└──────────────────────────────────────┴──────────────────────────┘
```

**Design intent:** One dominant CTA (Resume), progress everywhere honest and tabular, next milestones tied to the roadmap. No vanity metrics — streak shows with freeze note, never guilt copy.
**Key components:** StatCard, ProgressRing, MasteryMeter, OutcomeRow, ReviewQueueCard, ActivityRow, RoadmapTimeline (mini embed).
**Responsive:** 2-col → stack; Continue row stays pinned first.

## 12. Learning Analytics Dashboard ◐

**Purpose/JTBD:** "Show me my learning data — time, mastery, accuracy trends — the way a good analytics tool would." The screen that *models* good analytics.
**Traceability:** FR-08-01/02, NFR-12, CURR §9.5.

```
┌ AppNav: ◆ / Analytics      [Last 30 days ▾] ┐
├────────┬────────┬────────┬──────────────────┤
│ Hours  │ Lessons│ Check  │ Exercise         │
│ 18h 40m│  12    │ 87%    │ accuracy 91% ▲   │
│ ▁▂▄▃▅▆  (each StatCard + sparkline)          │
├───────────────────────────┬──────────────────┤
│ TIME INVESTED (bar/week)  │ MASTERY HEATMAP  │
│ by course stacked         │ modules ×        │
│ viz-1..viz-5              │ outcomes (teal   │
│                           │ sequential ramp) │
├───────────────────────────┼──────────────────┤
│ OUTCOME STRENGTH (rows)   │ PROGRESS FUNNEL  │
│ sorted: needs review ▾    │ started→completed│
│ [review ▸] per row        │ →mastered        │
└───────────────────────────┴──────────────────┘
```

**Design intent:** Practice-what-we-teach: every chart honest, labeled, sourced ("data: your activity, last 30 days"). Heatmap makes gaps actionable — click a cell → outcome popover → review CTA. "Needs review" sort is the default (growth mindset framing, never "weaknesses").
**Key components:** StatCard, ChartFrame set, MasteryHeatmap, FunnelChart, TrendCard, OutcomeRow.

## 13. AI Tutor Interface ("Ada") ●

**Purpose/JTBD:** "Never stuck, never spoiled" — Socratic help grounded in the curriculum, available in three surfaces (docked rail panel / side sheet / full page).
**Traceability:** FR-09-01..07, SYSTEM §7.

```
FULL PAGE ┌ AppNav: ◆ / Ask Ada ┐
│ ┌ context ─────────────────────────────┐
│ │ ◈ About: C1.3.2 Sorting · your last  │
│ │ attempt (1 hint used)                │
│ └──────────────────────────────────────┘
│ ┌──────────────────────────────────────┐
│ │ Ada ▸ Let's look at your sort. Before│
│ │ I say more — when you sorted by      │
│ │ month, what did you ask pandas to    │
│ │ sort: the text or the dates?  [hint 2]│
│ │  ¤ DataFrame · ¤ stable sort (live    │
│ │    TermRef tooltips)                 │
│ └──────────────────────────────────────┘
│ ┌ you ▸ I sorted by the month column…  │
│ [ Suggested: "Why is my code failing?" · "Another analogy" ]
│ ┌ input ──────────────────────────────┐
│ │ Ask anything about this lesson…  [attach code] ▸ │
│ └ Socratic mode · 18 messages left today (quota chip) ┘
└ Docked panel = same anatomy at 320 px · Sheet = mobile
```

**Design intent:** Ada has a *visible personality contract*: the status chip ("Socratic mode") sets expectations; hint-level badges show she elaborates but never skips; term chips in her replies are live tooltips (the glossary promise extends into conversation). During checkpoints, the panel header honestly states its logistics-only scope.
**Key components:** TutorPanel, TutorMessage, ContextChip, TutorStatusChip, SuggestedPrompts, ErrorCoachCard handoff.

## 14. Bookmarks & Notes ◐

**Purpose/JTBD:** "Everything I saved, organized enough to find again." Notes are capture-first, retrieval-second.
**Traceability:** FR-02-07.

```
┌ AppNav: ◆ / Library            [All ▾] [Notes|Bookmarks tabs] ┐
├──────────────┬──────────────────────────────────────────────┤
│ FILTERS      │ NOTE · C1.3.2 · block 5 · 3 days ago          │
│ course ▾     │ ┌ quoted passage ┐  (surface-inset, italic)   │
│ type ▾       │ my note text…                    [Open lesson]│
│ date ▾       ├──────────────────────────────────────────────┤
│ [Export ▾]   │ BOOKMARK · D5.1 "Loss as how wrong" · week 2 │
└──────────────┴──────────────────────────────────────────────┘
```

**Design intent:** A quiet library — quote + note pairing mirrors how people actually annotate. Export (Markdown/JSON) honored (data dignity, GDPR posture). Empty state teaches the habit.
**Key components:** Tabs, filter Selects, NoteCard, Export menu, EmptyState.

## 15. User Profile ●

**Purpose/JTBD:** Identity, preferences, and data control in one calm place.
**Traceability:** FR-16, PRD §9 privacy, GDPR.

```
┌ AppNav: ◆ / Profile ┐
│ [avatar] Maya Chen · Data Analyst track · joined Nov 2026 · ◔ streak 6d
├ Tabs: Overview · Appearance & Reading · Learning · Privacy & Data ┐
│ Overview: stats summary · certificates ◐ · portfolio link ◐       │
│ Appearance & Reading: PreferencePanel (DS §10.4 — theme, text    │
│   size, reading font, motion, underline links) with live preview  │
│ Learning: weekly goal · study reminders ◐ · retake comfort        │
│ Privacy & Data: DataPrivacyPanel — Export JSON · Delete account   │
│   (two-step, 30-day grace note) · analytics consent toggle       │
└──────────────────────────────────────────────────────────────────┘
```

**Design intent:** Preferences apply live with a preview paragraph *on the panel itself* — users feel the effect before saving. Privacy controls are first-class (not footer-buried), reflecting PRD §9.

## 16. Admin Dashboard ◐

**Purpose/JTBD:** Operational truth: users, sandbox health, tutor cost, flags, feature flags.
**Traceability:** FR-15-03, NFR-12/13, SYSTEM §12.

```
┌ AdminShell: Overview · Users · Sandbox · Tutor · Content · Flags ┐
│ OVERVIEW: MAU ◔ 4,210 ▲ · activation 63% · D7 31% · sandbox p95 7.2s
│ ALERTS: tutor cost/day ▲ 118% of budget (amber) · queue depth ok
├─────────────┬──────────────┬─────────────┬────────────────────┤
│ Users table │ SandboxQueue │ Tutor cost  │ Flagged transcripts│
│ (search,    │ (depth/lat/  │ chart/day   │ (review queue,     │
│ role, quota │ fail rate)   │ per model   │ policy annotations)│
│ actions)    │              │ routed %    │                    │
└─────────────┴──────────────┴─────────────┴────────────────────┘
```

**Design intent:** Dense but disciplined (13 px tables, tabular numerals); amber-before-red alert philosophy; every metric links to its runbook. No learner PII on the overview; user lookup is an explicit, audit-logged action.

## 17. Instructor Dashboard (Content Studio) ◐

**Purpose/JTBD:** Authors ship lint-clean lessons: draft → lint → review → publish, with version safety.
**Traceability:** FR-15-01/02/04, SYSTEM §8, CURR §11.

```
┌ StudioShell: Pipeline · Author · Review · Publish · Analytics ┐
│ PIPELINE (board by stage): Draft 12 → In lint 3 → Review 2 → Ready 1
├───────────────────────────────────┬──────────────────────────┤
│ LESSON WORKSPACE                  │ LINT REPORT              │
│ block editor (typed blocks)        │ ✕ 2 blocking:            │
│ · term coverage · loop check       │   · undefined term "join"│
│ preview: ContentPreviewFrame       │   · missing independent  │
│  (real reader, learner sim)        │     exercise             │
│                                   │ △ 1 warning: reading lvl │
│ [Request review]                  │ Publish: BLOCKED ▢        │
├───────────────────────────────────┴──────────────────────────┤
│ PUBLISH: version history · changelog · rollback (1 click)     │
│ ANALYTICS: completion 71% · checkpoint band 74% · flags 0.4%  │
└──────────────────────────────────────────────────────────────┘
```

**Design intent:** The linter is the co-author — blocking rules framed as fixable items with hints, never as a wall. Preview always renders the *real* reader (authors never guess at learner experience). Per-lesson analytics close the loop.

## 18. Search Results ●

**Purpose/JTBD:** "Find that lesson/term/exercise I half-remember." Typo-tolerant, grouped, direct.
**Traceability:** FR-14-01/02.

```
┌ AppNav: ◆ / Search                                     ┐
│ [ pandas group by month                         ] (focus)
│ 23 results · typo-tolerant (searched: pandas, group…)   │
│ LESSONS (5) ────────────────────────────────────────────
│  C1.4.3 Group by month  · highlighted match · course crumb
│ TERMS (2) · EXERCISES (4) · PROJECTS (1) · CAREERS (2)  │
│ each row: icon · title w/ <mark> · context line · jump  │
│ filters right (or sheet): type · course · track ◐       │
└─────────────────────────────────────────────────────────┘
```

**Design intent:** Grouped results mirror mental model ("it was a lesson…" / "it was a word…"); every row deep-links to the exact block anchor. Empty state offers the Glossary as the discovery path. CommandPalette is the quick version of this screen (INTERACTION §6).

## 19. Glossary Explorer ●

**Purpose/JTBD:** "Every term, plain-English, findable." The registry made browsable — the product promise embodied in a screen.
**Traceability:** FR-03-02.

```
┌ AppNav: ◆ / Glossary ┐
│ [Search terms…]  [All ▾ school] [All ▾ course] [○ Met ▾]
│ A ──────────────────────────────
│ ┌ TermCard ┐ ┌ TermCard ┐ ┌ TermCard ┐  (grid 2–3 col)
│ │ mean (n.)│ │ median   │ │ merge    │
│ │ the fair-│ │ the mid- │ │ (join…)  │
│ │ share…   │ │ dle value│ │          │
│ │ ● met · C1 · 2 uses                   │
└──────────────────────────────────────────┘
Term detail (click → sheet or /glossary/[term]):
  term · part of speech · pronunciation ▸
  definition · micro-example (highlighted)
  introduced in C1.2.1 ▸ · related terms (chips) · [Ask Ada ▸]
```

**Design intent:** Dictionary-serious typography (serif term titles), "met" tracking makes learning visible, every entry teaches one thing well. The term detail is what the tooltip expands into — consistent anatomy at two scales.

## 20. Career Preparation Centre ◐

**Purpose/JTBD:** "Turn what I learned into a job": readiness, roles, interview practice, resume, portfolio.
**Traceability:** FR-11-01..04, FR-12.

```
┌ AppNav: ◆ / Career ┐
│ YOUR READINESS — Data Analyst track          ◔ 78%
│ ✓ SQL joins checkpoint (88%)  ✓ P3 passed    [View gaps ▸]
│ ◻ Capstone · ◻ C6 dashboards (2 modules left)
├──────────────────────────────────────────────┤
│ EXPLORE ROLES — JobProfileCards (3–5)        │
│  salary ranges · sourced · dated · coverage  │
├──────────────────────────────────────────────┤
│ INTERVIEW PRACTICE — kind tabs (concept/SQL/ │
│  coding/behavioral) · difficulty dots · bank │
├──────────────────────────────────────────────┤
│ RESUME & PORTFOLIO LAB — bullets from projects│
│ CERTIFICATES ◐ — earned + verifiable links   │
└──────────────────────────────────────────────┘
```

**Design intent:** Readiness is computed from real mastery data (never self-reported vibes) and states honest gaps with exact bridges ("2 modules left"). Salary data always sourced + dated — the screen models the data honesty the curriculum teaches. Resume lab converts completed projects into impact-framed bullets tied to verified skills.

---

## Cross-screen consistency checklist (QA gate)

- [ ] Persistent triad present on every learner screen (§0.2).
- [ ] Theme toggle reachable in ≤ 1 interaction on every screen.
- [ ] No screen uses raw hex — tokens only (DS §13).
- [ ] Every list screen has designed Empty + Loading + Error states.
- [ ] Every chart labeled + sourced + "read as table" disclosure.
- [ ] Gold appears only for achievement moments (DS §4.4 budget).
- [ ] Mobile pass at 360 px for all ● screens (RESPONSIVE §4).
