# INTERACTION_SPECIFICATION.md

**Product:** DataVerse Academy
**Phase:** 2 — Experience Design (interaction & motion behavior)
**Version:** 1.0.0
**Date:** 2026-11-14
**Related:** `DESIGN_SYSTEM.md` (§9 motion tokens), `COMPONENT_INVENTORY.md`, `SCREEN_DESIGNS.md`

All durations/easings reference `--dv-*` motion tokens (DS §9.1). All behaviors list their **reduced-motion alternative** (RM). Everything is keyboard-operable; §8 maps the keys.

---

## Table of Contents

1. [Global interaction grammar](#1-global-interaction-grammar)
2. [Marketing interactions](#2-marketing-interactions)
3. [Navigation & search](#3-navigation--search)
4. [Learning interactions (core loop)](#4-learning-interactions-core-loop)
5. [Assessment interactions](#5-assessment-interactions)
6. [Command palette (⌘K)](#6-command-palette-⌘k)
7. [State matrix (empty / loading / error / success)](#7-state-matrix-empty--loading--error--success)
8. [Keyboard shortcut map](#8-keyboard-shortcut-map)
9. [Touch & gesture behavior](#9-touch--gesture-behavior)
10. [Celebration & motivation moments (budgeted)](#10-celebration--motivation-moments-budgeted)

---

## 1. Global interaction grammar

| Rule | Specification |
|---|---|
| **Latency honesty** | Local state changes feel instant (≤ 100 ms perceived). Server round-trips show staged feedback (button loading ≤ 200 ms, skeleton after 200 ms, message at 5 s, retry offer at 15 s). |
| **Optimistic, reversible** | Progress ticks, bookmarks, notes, theme, preferences apply optimistically with undo toast (5 s). Graded work is **never** optimistic — it waits for truth. |
| **Hover intent** | 300 ms hover-intent before tooltips/popovers; instant on focus; 280 ms close delay. |
| **Press feedback** | `scale(0.98)` 80 ms on buttons/options; `scale(1.02)` 160 ms pickup on draggables. |
| **Nothing blocks reading** | Tutor, sandbox, or search outages degrade to banners (DS §11 Banner); prose and quizzes always remain usable (NFR-05). |
| **The exit is sacred** | Leaving in-progress work (quiz, editor, checkpoint) always raises a guard dialog naming what would be lost ("3 answers · 2 minutes"). |
| **Scroll, don't hijack** | No scroll-jacking, no snap on prose; snap allowed only on mobile roadmap/carousel rails. |

## 2. Marketing interactions

**2.1 Homepage hero (SCREENS §1).** On first viewport entry (once per visit): headline fades+rises 280 ms staggered 80 ms (RM: static); the live lesson-card demo is interactive *before* sign-up — hovering "mean" in the card opens the real TermRef tooltip; the sparkline draws once 480 ms (RM: final state). CTA "Start free" → placement intro with visible "skip anytime" from the first frame.

**2.2 School rows.** Hover: keyline widens 3→6 px + illustration saturates 140 ms (RM: color only). Rows are the click target (not a nested "Learn more" link).

**2.3 Roadmap preview.** Path segments draw 480 ms on first entry; nodes pop 160 ms staggered 40 ms, max 5 (RM: static, fully drawn).

## 3. Navigation & search

| Interaction | Choreography | RM |
|---|---|---|
| Navbar hide-on-scroll (marketing) | Translate up 200 ms after 96 px scroll-down; reappear on 8 px scroll-up or focus | Stays pinned |
| Sheet open (mobile nav/filters/rails) | Scrim fade 140 ms + panel slide 200 ms `ease-out`; content behind freezes | Fade only |
| Breadcrumb overflow | "…" reveals full path in popover on click/focus | — |
| Lesson prev/next (reader footer) | New lesson: content fade 140 ms + 8 px rise; scroll resets to top; tree current-marker moves with 200 ms check-pop | Fade only |
| Search-as-you-type (results page) | Debounce 200 ms; result groups crossfade 140 ms; match highlight in `teal-700` on `teal-50` | Same (non-animated) |
| Typo tolerance | Shows "Searched instead for: pandas" caption; one-click to original query | — |

## 4. Learning interactions (core loop)

**4.1 Term tooltip (the signature micro-interaction).**
Trigger: hover 300 ms or focus or tap. Open: 140 ms fade + 4 px rise (`r-md`, `e3`, surface). Contents render instantly (prefetched with lesson). Inside: term (heading-sm) → definition (body-sm) → micro-example (caption italic) → "Hear it from Ada →". Close: 280 ms delay on pointer-leave; immediate on Esc/outside-tap. **Never** the only place a term is explained — TermsCard always repeats it in-lesson. RM: no movement, fade only.

**4.2 Hint ladder (scaffolded, never spoiler).**

| Level | Reveal requirement | Content | Choreography |
|---|---|---|---|
| 1 · Nudge | Click "Show a nudge" | One question pointing at the right idea | Slide-open 200 ms |
| 2 · Strategy | Click "Show the strategy" (shows usage note "counts toward your practice record") | Approach in ≤ 3 steps | Slide-open 200 ms |
| 3 · Worked parallel example | Click + confirm ("This shows a solved example of a *similar* problem — ready?") | Full parallel worked example | Dialog 280 ms |
| Ada | Available after level 2 | Tutor elaborates *current* level only | §4.3 |

Each reveal is explicit (no auto-unmasking); ladder usage is logged per attempt (`hints_used`) and down-weights mastery evidence (CURR §9.5) — the UI says this kindly at level 2. RM: instant show, no slide.

**4.3 Ask Ada (tutor).**
Docked panel in reader rail: input focus expands 200 ms (one-line → three-line); send → user message appears instantly; Ada's reply streams token-by-token (SSE) with typing cursor (RM: block-reveal when complete). During checkpoints Ada's header switches to "Logistics only during checkpoints" — the input still works but content questions get an honest refusal + hint-level elaboration (FR-09-02). Quota chip counts down; at soft-limit it turns amber and Ada offers the deterministic fallbacks ("authored hints + curated links — fresh again tomorrow").

**4.4 Code run & error coaching (Lab, SCREENS §7).**
1. Press Run (⌘/Ctrl+Enter): button → spinner + "Running…" ≤ 200 ms.
2. In-browser (Pyodide): output streams line-by-line 60 ms/line (RM: appears complete). Sandbox: status line honestly stages ("queued → starting container → running", each state real, p95 < 10 s).
3. On error: **ErrorCoachCard** animates in 200 ms (cause → why → 3-step fix) — raw traceback collapsed below in a disclosure ("Show the raw error"); "Ask Ada about this" hands off full context.
4. On pass: test rows tick sequentially 120 ms apart (check-pop spring), border transitions to success 200 ms; XP chip if earned. **No confetti** (DS §9.3).
5. Timeout: friendly explanation of the limit + infinite-loop hint ("10 s limit — loops that never end feel like this").

**4.5 Checkpoint result reveal (SCREENS §9).**
Submit → 600 ms "grading" beat (per-item ticks, honest) → hero ring draws to score 480 ms (RM: instant) → outcome rows cascade 60 ms stagger → prescriptions last (primary CTA). Fail = identical calm choreography; the only difference is copy + CTA priority (Review first, Retake second). "Retakes are free" is visible in the footer of every checkpoint screen from the start (anxiety-first design).

**4.6 Progress ticks.** Lesson complete: footer card flips to NextLessonCard 200 ms + tree check pops + course ring +1 (240 ms, tabular). Module complete: roadmap gate node fills; a quiet "Checkpoint unlocked" toast with jump CTA.

**4.7 Scrollspy (reader TOC).** Throttled 120 ms; active section: `teal-700` text + 2 px left bar; smooth-scroll on TOC click (400 ms, RM: instant jump).

## 5. Assessment interactions

| Interaction | Specification |
|---|---|
| Option select | Full-row target; letter keys 1–9 map to options; selected = `teal-25` bg + border; Space toggles multi-select |
| Check answer | Button disabled until ≥ 1 selection; on submit: correct → row turns success + ✓ pop (160 ms) + rationale slides in (200 ms); incorrect-chosen → danger-tint + rationale for *your* distractor; unselected rows dim to 60% (never hidden — review value) |
| Multi-question check (inline) | One question at a time; dot progress; "Next" enabled after answer (skippable, marked "review later") |
| Skip | Allowed, marked on progress dots (amber ring), surfaced in results prescriptions |
| Exam timer | Sticky pill; warning tint < 25% remaining; polite SR announce at 10 min & 1 min; **never flashes, never red-floods**; auto-submit at 0 with confirmation banner |
| Exit guard | Dialog names the loss precisely; "Leave" is destructive-styled but not red-alarm; "Stay" is default focus |

## 6. Command palette (⌘K)

Open: ⌘K / Ctrl+K / "/" (when not in an input) → palette scales 0.98→1 + fade 180 ms (`e5`). Groups: **Jump to** (recent lessons, dashboard) · **Lessons** · **Terms** · **Exercises & projects** · **Actions** (Toggle theme, Start review, Resume lesson, Open Ada, Preferences). Type-to-filter ≤ 50 ms; ↑/↓ navigate (highlight 80 ms), Enter jumps, Esc closes; footers show key hints. Empty: "No matches — try a term like *join*, or browse the Glossary →". RM: fade only. Works identically for guests (browses published content only).

## 7. State matrix (empty / loading / error / success)

Every screen's four states are designed, not defaulted (DS §3.8). Canonical patterns:

| State | Pattern | Voice example |
|---|---|---|
| **Empty (first-use)** | Illustration (small) + one teaching sentence + single primary action | "No notes yet. Notes you take in lessons show up here — and on your review cards." |
| **Empty (no results)** | Sympathetic + 2 escape hatches | "No courses match 'advanced'. Clear filters, or start from Foundations →" |
| **Loading (structure known)** | Skeletons (block-shaped: tree, prose, code toolbar) after 200 ms | — |
| **Loading (long/unknown)** | Staged status line + honest stage names | "Preparing your sandbox… usually under 10 s" |
| **Error (recoverable)** | Inline card: cause + 3-step fix + retry; never color-only | "Connection dropped mid-run. Your code is saved — retry the run" |
| **Error (system)** | Banner + degraded-mode note; reading never blocked | "Hands-on lab is warming up. Reading and quizzes are unaffected." |
| **Success** | Contextual, specific, quiet (toast or inline); never generic | "Checkpoint passed — 87%. Two outcomes went to Strong." |

## 8. Keyboard shortcut map

**Global:** ⌘K palette · / search · ⌘\ toggle theme · ? shortcuts overlay · Esc close/cancel · Shift+? during any exercise → Ada.
**Reader:** J / → next lesson · K / ← previous lesson · [ ] prev/next block · C contents (tree) · N notes · T ask Ada · G glossary of this lesson · B bookmark.
**Assessment:** 1–9 select option · Enter check/next · S skip · ⌘Enter submit exam.
**Lab:** ⌘Enter run · ⌘S save · ⌘. stop · Alt+←/→ move splitter · ⌘D diff.
**Dashboard/A11y:** all targets reachable via Tab in DOM order; skip-to-content link first on every screen.

Every shortcut is discoverable: `?` overlay + Kbd chips in context (Run button shows ⌘⏎).

## 9. Touch & gesture behavior

| Gesture | Behavior |
|---|---|
| Tap term | Tooltip opens anchored, outside-tap closes; "Hear it from Ada" is a 44 px row |
| Swipe right (from left edge, reader) | Open course tree sheet; swipe-left closes |
| Swipe left (from right edge, reader) | Open context rail sheet (TOC/Ada/notes) |
| Drag (Parsons/ordering) | 160 ms pickup (scale 1.02 + `e2`), magnetic slots (8 px snap), drop settles 120 ms; **keyboard equivalent always present** |
| Pull-to-refresh | Never (state is server-truthful; refresh button in overflow) |
| Long-press | Context menu only in Lab (copy output, reset) |
| Momentum scroll | Native everywhere; sheets scroll internally with overscroll containment |

44 px minimum targets; hit-slop +12 px on quiz options and tree rows. Haptics: none (cross-platform honesty).

## 10. Celebration & motivation moments (budgeted)

| Moment | Choreography | Frequency cap |
|---|---|---|
| Lesson complete | Check-pop + ring +1 + "Next lesson" card flip | Every lesson (subtle by design) |
| Checkpoint pass | Ring draw 480 ms + outcome cascade | Per pass |
| Course complete | Roadmap path segment draws to next node + one gold node pulse | Per course |
| Certificate issued | Gold seal spring 900 ms + paper rise + share CTA | Per certificate |
| Capstone passed | Full-screen quiet reveal: rubric scores cascade → "Add to portfolio" | Per capstone |
| Streak milestone (7/30/100) | Gold flame + honest note ("6-day streak — one freeze left this week") | Weekly max |
| **Banned** | Confetti, sound, badge cascades, "AMAZING!!" copy, surprise animations | — |

The design stance: prestige, not sugar (DS §2.2). Achievement motion is rare, brief, and meaningful — gold is spent, never sprayed.

---

*Sizes for every behavior above at every breakpoint → `RESPONSIVE_BEHAVIOUR.md`.*
