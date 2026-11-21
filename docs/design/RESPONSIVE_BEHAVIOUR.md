# RESPONSIVE_BEHAVIOUR.md

**Product:** DataVerse Academy
**Phase:** 2 — Experience Design (responsive strategy)
**Version:** 1.0.0
**Date:** 2026-11-14
**Related:** `DESIGN_SYSTEM.md` (§6 breakpoints), `SCREEN_DESIGNS.md` (per-screen anatomy), `INTERACTION_SPECIFICATION.md`

**Design floor: 360 px** (NFR-15). **Mobile = full product for reading, quizzes, glossary, career, dashboard; coding is usable-but-honest ("best on a keyboard device").** One adaptive system, four device classes, no separate mobile site.

---

## Table of Contents

1. [Breakpoint system](#1-breakpoint-system)
2. [Global adaptation rules](#2-global-adaptation-rules)
3. [Lesson Reader: the three-column adaptation ladder](#3-lesson-reader-the-three-column-adaptation-ladder)
4. [Per-screen adaptation matrix (all 20 screens)](#4-per-screen-adaptation-matrix-all-20-screens)
5. [Mobile coding policy](#5-mobile-coding-policy)
6. [Tablet specifics](#6-tablet-specifics)
7. [Testing & QA matrix](#7-testing--qa-matrix)

---

## 1. Breakpoint system

| Token | Range (viewport) | Device class | Design meaning |
|---|---|---|---|
| `xs` | 320–359 px | Small phones | Survival mode — never breaks, single column |
| `sm` | 360–639 px | Phones | **Primary mobile experience** — reading + quizzes + dashboards first-class |
| `md` | 768–1023 px | Tablets portrait | Two-pane previews, split views begin |
| `lg` | 1024–1279 px | Tablets landscape / small laptops | App shell with sheets; full marketing layout |
| `xl` | 1280–1535 px | Laptops | Reader two-column; lab full IDE |
| `2xl` | ≥ 1536 px | Large desktop | Reader full three-column; catalogue 2-col rows |

Strategy: **mobile-first CSS** (single column default), additive complexity per breakpoint. No max-width lock-outs; containers are fluid between tokens (DS §6.2). Orientation changes never lose state (reading position, quiz answers, editor buffers persist in memory + local draft).

## 2. Global adaptation rules

| Element | < lg (mobile/tablet portrait) | ≥ lg |
|---|---|---|
| MarketingNav links | Hamburger → full-height Sheet (nav groups + theme + sign-in) | Inline links |
| Search | Icon → full-screen overlay with instant focus | ⌘K palette + navbar trigger |
| AppNav breadcrumb | First + last crumb only ("… · C1.3") | Full trail |
| ThemeToggle | In sheet + in Profile (always ≤ 2 taps away) | Navbar segmented control |
| UserMenu | Avatar only (menu in sheet) | Avatar + name |
| Filter sidebars (catalogue, search, glossary, library) | "Filters" trigger chip with active-count badge → bottom sheet | Sticky 280 px sidebar |
| Dialogs/Modals | Bottom sheets (92% width ≤ 480 px), drag-to-dismiss | Centered modal ≤ 480 px |
| Toasts | Bottom-center above action bar | Bottom-right stack |
| Tables (data) | Card-stack (each row becomes a labeled block; numeric alignment preserved) | Full table |
| Charts | Full-width, min-height 220 px, direct labels (no legends — space) | As designed |
| Touch targets | All ≥ 44 px (hit-slop +12 px on quiz/tree rows) | Mouse standard, keyboard complete |
| Font scale | Prose 17 px, UI 16 px minimum; display clamps −20% | Prose 18 px; full display scale |

## 3. Lesson Reader: the three-column adaptation ladder

The reader (SCREENS §6) degrades by **column removal with sheet parity** — every column's function survives at every size; only its placement changes.

```
≥1440 (2xl)          1280–1439 (xl)        1024–1279 (lg)       <1024 (sm/md)
┌────┬──────┬────┐  ┌──┬────────┬────┐   ┌───────────────┐   ┌───────────────┐
│TREE│CENTER│RAIL│  │≡ │CENTER  │RAIL│   │     CENTER    │   │    CENTER     │
│280 │≤760  │320 │  │64│≤760    │280│   │  (full width)  │   │ (full width)  │
│    │      │    │  │  │        │→sheet│  + top tree btn  │   │ + progress    │
│    │      │    │  │  │        │access│  + rail buttons   │   │   hairline    │
└────┴──────┴────┘  └──┴────────┴────┘   └───────────────┘   │ + bottom bar  │
 3 columns            rail 280 (compact)   sheets on demand   └───────────────┘
                                                          [≡ Contents][Ada][✎]
```

| Zone | 2xl ≥1440 | xl 1280–1439 | lg 1024–1279 | sm/md <1024 |
|---|---|---|---|---|
| **Tree (left)** | 280 px sticky, full | 64 px icon rail (module dots + current lesson icon; expand on hover/focus → 280 overlay) | Header button → left sheet | Bottom-bar "Contents" → left sheet |
| **Center** | ≤760 px prose | same | wider margins, prose capped 68ch | fluid, prose 17 px, padding 20 px |
| **Rail (right)** | 320 px sticky, cards stacked (TOC / concepts / Ada / notes) | 280 px compact (TOC + Ada; notes → popover) | Header button → right sheet with tabs (Page / Concepts / Ada / Notes) | Bottom-bar "Ask Ada" / "Notes" → right sheet tabs |
| **Progress** | tree ring + AppNav hairline | same | top hairline 3 px + % in header | top hairline + bottom bar center label |
| **Next/Complete** | footer NextLessonCard | same | same | bottom-bar primary button "Complete & next ▸" |
| **Term tooltips** | hover + focus + tap | same | tap-first (no hover) | tap-anchored, outside-tap close |

**Non-negotiables at every size:** the Learning Loop order is intact; exercises/checks are fully functional (MCQ/ordering/matching mobile-native; Parsons keyboard-mode; code per §5); Ada reachable in ≤ 2 taps; notes/bookmark ≤ 2 taps; reading position and drafts survive navigation; nothing horizontally scrolls except code blocks and tables (their own scroll containers).

## 4. Per-screen adaptation matrix (all 20 screens)

| # | Screen | < sm 360 | sm <640 | md 768–1023 | lg 1024–1279 | xl / 2xl |
|---|---|---|---|---|---|---|
| 1 | Homepage | Single col; hero copy→demo card; roadmap horizontal scroll-snap | same + CTA row wraps | 2-col hero (copy/demo) | Schools rows 2-col; stats strip inline | Full editorial scale; roadmap draws |
| 2 | Catalogue | Rows stacked; filters → sheet; meta wraps to 2 lines | same | same | Sidebar filters inline (sticky) | 2-col row grid ≥1536 |
| 3 | School pages | Hero stacks (illustration 160 px); outcomes 1-col | same | illustration right | full hero | full |
| 4 | Course page | Syllabus accordions full-width; meta chips wrap 2 rows | same | same | outcome + prereq 2-col | syllabus gets sticky mini-TOC |
| 5 | Roadmap | Vertical spine + sticky stage headers; nodes = full-width rows; popovers → bottom sheets | same | same | pace lane visible | pace lane + milestone side-labels |
| 6 | **Lesson Reader** | §3 ladder — single col + bottom bar | §3 (bottom bar) | §3 (sheets) | §3 (tree+rail sheets) | §3 (3-col at 2xl) |
| 7 | Coding Lab | §5 policy: read-only brief + code + console tabs; "Open on desktop / queue" | same | Brief collapses top; editor+checks split | Full 3-pane (brief/editor/checks) | Full + resizable panes |
| 8 | Exercise workspace | Single column; Parsons = keyboard-mode hint; options full-width | same | prompt + artifact stacks | same | centered ≤880 px focus column |
| 9 | Quiz/Checkpoint | Single question full-screen; options 44 px+; timer in header bar | same | same | centered ≤760 px | same |
| 10 | Project workspace | Steps → top progress stepper (tap to expand); workbench tabs | same | Steps rail (56 px icons) | 3-pane full | 3-pane + resizable |
| 11 | Student dashboard | Continue hero → stat tiles → milestones → review (single col) | 2-col tiles | 2-col + hero full | 12-col grid (hero 8 / side 4) | full |
| 12 | Analytics | Charts full-width stacked; heatmap → horizontal-scroll + row focus | same | 2-col charts | 2×2 chart grid + tables | full + funnel large |
| 13 | AI Tutor | Full-screen chat (context chip → sheet); suggestions wrap | same | same | Centered column ≤720 + optional dock | docked panel in reader; page ≤920 |
| 14 | Library | Filter bar → sheet; cards stacked | same | list + inline filters | list 720 + sidebar 280 | same |
| 15 | Profile | Tabs → segmented scroll; panels single col | same | same | 2-col (identity sticky / panels) | same |
| 16 | Admin | Tables → card-stacks; KPI tiles 2-col | same | 2-col KPI | full tables + charts | dense multi-chart |
| 17 | Instructor Studio | Pipeline board → vertical stacks per stage; lint report bottom sheet | same | editor + lint 2-col | 3-col board + workspace | full preview pane |
| 18 | Search | Groups stacked; filters sheet | same | same | inline right filters | same |
| 19 | Glossary | Term cards 1-col | 2-col cards | 2-col + sticky index rail | 3-col + filters sidebar | same |
| 20 | Career Centre | Readiness list → accordions; roles → rows | same | roles 2-col | readiness 2-col + roles grid | full |

## 5. Mobile coding policy

Honest, not apologetic (persona-driven — many learners are phone-first):

1. **Reading code is fully mobile:** syntax-highlighted blocks, console output, test results, diffs — all touch-friendly (16 px+ mono, horizontal scroll with edge affordances).
2. **Writing code on mobile is supported, right-sized:** CodeMirror with mobile IME-safe config, keyboard toolbar above the IME (`Run` `Tab` `() {} :` `⌫`), 14 px mono minimum, no autocomplete popovers (inline suggestions only).
3. **Pyodide exercises run on-device** (better than any network round-trip) — the badge says so ("Runs in your browser — even on your phone").
4. **Sandbox-heavy work (sklearn, big data):** allowed but steered — "This exercise runs in our lab — expect ~10 s on mobile data. Queue it for desktop?" with one tap (adds to dashboard queue, sends link via account).
5. **Parsons problems are mobile-joyful** (drag or tap-to-place) — code construction without a keyboard is a designed mobile path, not a compromise.
6. Every lab screen shows its runtime truth up-front (TerminalBadge, SCREENS §7) — no surprise waits.

## 6. Tablet specifics

- **Portrait (md):** the "two-pane preview" class — reader shows center + sheeted columns; catalogue shows rows + filter sheet; dashboards go 2-col. Apple Pencil/pointer: hover states active, drag precision targets 32 px.
- **Landscape (lg):** full app shell; reader keeps sheets until 1280 (icons rail begins). Split-screen (iPad ½): layout must survive 50% width → behaves as sm/md; state preserved.
- **Virtual keyboards:** sheets and bottom bars ride above the IME (`visualViewport` API); focus jumps keep the active input visible (scroll-into-view + 120 px clearance).

## 7. Testing & QA matrix

| Layer | Scope | Tooling |
|---|---|---|
| Every PR | All ● screens at 360 / 768 / 1280 / 1536, both themes, reduced-motion | Playwright visual snapshots (token-stable) |
| Interaction QA | Reader ladder (§3) end-to-end: complete a lesson on 360 px emulator incl. tooltip, exercise, check, Ada sheet | Manual per release |
| A11y QA | Keyboard-only pass (shortcut map §INTERACTION-8) at 360 px & 1536 px; axe on all key states; VoiceOver + TalkBack reader pass | CI + manual |
| Device lab | iPhone SE (360), Pixel 7a, iPad Mini portrait/landscape, 13" laptop, 27" desktop; 200% browser zoom on reader & quiz | Manual per release |
| Orientation / split | Rotate mid-quiz, mid-exercise, mid-typing: zero state loss | Automated |
| Theme | FOUC check (dark load < 100 ms paint), contrast spot-audit on new components | CI + axe |

**Definition of responsive done:** the screen's core job completes at 360 px in both themes, keyboard-only, with reduced motion, losing no function — placement may change, capability may not.

---

*This document completes the Phase-2 design set. The tokens are implemented in `design-tokens.css`, and the flagship screens are demonstrated at full fidelity in `DataVerse_Prototype.html` (light/dark + responsive).*
