# DESIGN_SYSTEM.md

**Product:** DataVerse Academy — the zero-prerequisite data science & AI learning platform
**Version:** 2.1.0 — **"Ink & Indigo"** (implemented system)
**Date:** 2026-11-20 (v2.1 — token completion & platform-wide style sweep: editor vocabulary, Array Cyan ramp, z-index ladder, semantic-state migration, font-loading optimization)
**Supersedes:** v1.0.0 (the "Insight Teal" Phase-2 foundations draft)
**Canonical token source:** `src/app/globals.css` — where this document and the code disagree, the code wins; file an issue and fix the doc.
**Related:** `PRODUCT_REQUIREMENTS.md`, `SYSTEM_ARCHITECTURE.md`, `CURRICULUM_ARCHITECTURE.md`, `COMPONENT_INVENTORY.md`, `SCREEN_DESIGNS.md`, `INTERACTION_SPECIFICATION.md`, `RESPONSIVE_BEHAVIOUR.md`, `STYLE-SWEEP-BLUEPRINT.md` (the v1→v2 migration spec)

---

## Table of Contents

1. [Architecture & Implementation Status](#1-architecture--implementation-status)
2. [Brand Foundation](#2-brand-foundation)
3. [Design Principles](#3-design-principles)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing & Layout Grid](#6-spacing--layout-grid)
7. [Radius, Borders & Elevation](#7-radius-borders--elevation)
8. [Iconography & Illustration](#8-iconography--illustration)
9. [Motion System](#9-motion-system)
10. [Theming Architecture (light / dark / system)](#10-theming-architecture-light--dark--system)
11. [Accessibility Standards](#11-accessibility-standards-wcag-22-aa--binding)
12. [Voice & Microcopy](#12-voice--microcopy)
13. [Component Styling Conventions](#13-component-styling-conventions)
14. [Token Reference Architecture](#14-token-reference-architecture)

---

## 1. Architecture & Implementation Status

v1 was authored pre-implementation as the canonical source. v2 is the **reverse-engineered truth of the shipped system**: the brand moved from Insight Teal to **Academy Indigo** (with **Archive Blue** accents and **Manuscript Violet** highlights), the token architecture matured into three strictly one-directional layers, and every view — ten learning schools including the Classical AI school, five course engines, the labs, the shell — now paints from one vocabulary.

| Check | Result |
|---|---|
| Stack | Next.js 16 App Router / React 19 / TypeScript strict / Tailwind CSS 4 (`@theme inline` bridge) / shadcn-ui + Radix primitives |
| Application form | Single-page shell + hash routing (`#/…`) + API routes; one design language across every view |
| Tokens | CSS custom properties in `globals.css` — `--dv-*` ramps and semantic tokens, bridged into Tailwind utilities via `@theme inline`; a theme switch is a zero-JS variable flip on `.dark` |
| Theming | `next-themes` (`class` strategy, `light / dark / system`, FOUC-safe) |
| Fonts | Self-hosted woff2 in `public/fonts/` (`scripts/vendor-fonts.py`) — no build-time font downloads, no runtime CDN |
| Accessibility | WCAG 2.2 AA pairs pre-validated in §4.6 (computed, not estimated); reduced-motion honored globally |
| Design debt | Raw palette classes, raw shadows and hardcoded hexes are **banned** in `src/components/**` (grep-enforced: `emerald\|sky\|rose\|amber\|teal\|slate\|gray\|zinc-*` → 0 hits; `cyan-*` is the sanctioned **Array Cyan** ramp, §4 — every `cyan-*` utility resolves to a `--dv-cyan-*` token via the `@theme inline` bridge) |

---

## 2. Brand Foundation

### 2.1 Name & mark

**DataVerse Academy.**

- **Wordmark:** "DataVerse" set in Fraunces Medium with "Academy" in Inter Medium Small Caps, tracked +8%. Always one line; never stacked; never "DVA" in learner-facing UI.
- **Glyph:** an open circle (the "verse") whose left half resolves into a rising scatter of 5 data points along an implied upward curve — *the learner's trajectory from scattered beginnings to coherent understanding*. 24×24 grid, 1.5 px stroke, points filled `--dv-ink` (light) / `--dv-indigo-300` (dark). Favicon = glyph on `--dv-indigo-700`.
- **Usage:** glyph alone at ≤ 32 px; wordmark+glyph lockup is the default.

### 2.2 Positioning

A **serious international education platform** — closer in spirit to a university press than a tutorial blog. Editorial typography leads; boxes and chrome recede. Data visualization is a primary medium, not decoration. Warmth without whimsy: no mascots, no confetti-per-click; motivation comes from visible, honest progress.

### 2.3 Brand personality

| Trait | Expressed as |
|---|---|
| **Intelligent** | Indigo — the scholarly accent; information density that stays quiet |
| **Elegant** | Fraunces display type, generous whitespace, hairline rules |
| **Academic** | Newsreader prose, citations visible, glossary everywhere |
| **Sophisticated** | Warm-white paper neutrals; midnight Observatory dark; never neon |
| **Innovative** | Live widgets, in-flow interactivity, the drafting-grid texture |
| **Trustworthy** | Exact numbers (`.tabular`), honest progress, calm errors |
| **Technically advanced** | JetBrains Mono data voice, real editors, verified outputs |
| **Minimal yet visually rich** | 60% neutral surface / 30% ink / 10% accent discipline (§4.9) |

---

## 3. Design Principles

1. **Typography carries hierarchy, not containers.** Headings, weight, and spacing differentiate content before borders and fills do. Cards are a tool, never the default — rows and typography win.
2. **Calm surfaces, restrained accents.** Warm neutral canvas; indigo for action and progress, blue for information, violet for distinction; gold reserved for achievement. If a screenshot looks more than ~10% indigo, the accent is overused.
3. **Every screen answers three questions in order:** *Where am I? What should I do next? How am I doing?*
4. **Data is displayed the way we teach it.** Honest axes, labeled units, tabular numerals, accessible palettes — the UI is itself a curriculum artifact.
5. **Motion with meaning.** Animation explains change or celebrates genuine milestones; nothing animates for decoration. Reduced-motion is honored globally.
6. **Intuition before formula, visual before text.** Wherever a concept has a shape, the shape ships first.
7. **Accessible by default.** Contrast, focus, targets, motion-sensitivity are design inputs, not audits.
8. **One token vocabulary.** Components never read raw hex and never use raw Tailwind palette classes — only `--dv-*` semantic tokens and their bridged utilities. Course identity colors flow through `hue-*` categorical tokens so both themes flip automatically.

---

## 4. Color System

Naming: `--dv-<role>[-<step>]`. Two themes ship: **Daylight** (light, default) and **Observatory** (dark). Ramps are 25–950. Dark redefines only what must change (brand ramps lift one step, neutrals invert, viz brightens) — the rest inherits.

### 4.1 Neutrals — "Paper & Ink" (Daylight)

Warm gray with a faint stone undertone — paper, not blue-white clinical.

| Token | Value | Role |
|---|---|---|
| `--dv-canvas` | `#FAF9F7` | Page background |
| `--dv-surface` | `#FFFFFF` | Cards, panels, dialogs |
| `--dv-surface-raised` | `#FFFFFF` | Popovers, menus, tooltips (elevation by shadow in Daylight) |
| `--dv-surface-subtle` | `#F4F3EE` | Nested surfaces, table stripes, menu hover |
| `--dv-surface-inset` | `#ECEAE2` | Wells, terminal/code panes, input fills |
| `--dv-border-subtle` | `#E8E6DE` | Hairlines, dividers |
| `--dv-border` | `#D9D6CB` | Default component borders |
| `--dv-border-strong` | `#ABA79A` | Emphasized borders, unchecked controls |
| `--dv-ink` | `#1B1D24` | Primary text (elegant charcoal) |
| `--dv-ink-2` | `#464954` | Secondary text |
| `--dv-ink-3` | `#6D7080` | Tertiary text, metadata (≥ 14 px) |
| `--dv-ink-inverse` | `#FBFAF8` | Text on filled accents |

### 4.2 Neutrals — "Observatory" (dark)

Deep midnight — a night-sky observatory, not pure black — with muted navy layering.

| Token | Value | Role |
|---|---|---|
| `--dv-canvas` | `#0B0D14` | Page background |
| `--dv-surface` | `#10131D` | Cards, panels, dialogs |
| `--dv-surface-raised` | `#161B2B` | Popovers, menus, tooltips — a step above cards for floating depth |
| `--dv-surface-subtle` | `#161A27` | Nested surfaces, menu hover |
| `--dv-surface-inset` | `#1C2130` | Wells, terminal panes |
| `--dv-border-subtle` | `#232938` | Hairlines |
| `--dv-border` | `#2D3346` | Default borders |
| `--dv-border-strong` | `#454D66` | Emphasized borders |
| `--dv-ink` | `#ECEDF4` | Primary text |
| `--dv-ink-2` | `#ADB2C4` | Secondary text |
| `--dv-ink-3` | `#7E8397` | Tertiary text |
| `--dv-ink-inverse` | `#0B0D14` | Text on filled accents |

### 4.3 Primary — "Academy Indigo"

The color of *action and progress*: primary buttons, active states, links, focus rings, progress fills. Restrained and scholarly — deliberately not default-SaaS blue.

| Step | Value | Notes |
|---|---|---|
| `indigo-25` | `#F8F8FC` | faint tint backgrounds |
| `indigo-50` | `#EEEFFA` | selected bg, quiet chips |
| `indigo-100` | `#DEE0F5` | selection highlight |
| `indigo-200` | `#C1C6EE` | hero wash tint |
| `indigo-300` | `#9DA4E5` / dark `#A6ACE9` | — |
| `indigo-400` | `#7B84DA` / dark `#8189DF` | **dark primary fill** |
| `indigo-500` | `#5B63CF` / dark `#6A72D6` | focus ring (light), charts |
| `indigo-600` | `#4A4CC2` | **light primary fill** |
| `indigo-700` | `#3D3EA7` | primary hover (light), links |
| `indigo-800` | `#32338A` | deep accents |
| `indigo-900` | `#27286C` | dark hero wash |
| `indigo-950` | `#181942` | indigo panel base |

### 4.4 Accent — "Archive Blue" · Highlight — "Manuscript Violet"

- **Archive Blue** (`--dv-blue-*`, `#EDF3FC` → `#152247`): information, secondary data, informational states. Pairs with indigo in charts and the hero wash.
- **Manuscript Violet** (`--dv-violet-*`, `#F6F3FB` → `#2B1B45`; dark lifts 300–500 one step): mathematics, AI, *distinction* — used sparingly for moments that should feel set apart (math blocks, level-up panels, the violet wash layer).

### 4.5 Categorical — Teal, Array Cyan & Laurel Gold

- **Teal** (`--dv-teal-*`, `#E9F6F4` → `#092522`): data-analysis accents and charts (no longer the brand primary). The Data Analysis school's interactive identity is the single theme-aware `viz-10` token, not the raw ramp.
- **Array Cyan** (`--dv-cyan-*`, `#E9F7F9` → `#052E3A`): the NumPy school's full ramp, anchored at `--dv-cyan-600 = #0E8FA8 = viz-5` and harmonized with the brand; steps 300–500 lift one step in the dark, matching the indigo/blue/violet ramps. Solid cyan buttons use the 700 step (5.45:1 with white text); 600 is the icon/large-element step.
- **Laurel Gold** (`--dv-gold-100`–`700`, `#F5EAD0` → `#7C5614`): reserved exclusively for **achievement** — certificates, badges, milestones, waived-prerequisite credits. Gold never marks buttons or navigation; scarcity is what makes it meaningful. Small gold text uses `gold-700` (6.2:1); `gold-600` is large-text/icons only.

### 4.6 Semantic states

Triads (`text / bg / border`), pre-computed for both themes:

| Meaning | Light | Dark |
|---|---|---|
| Success / correct | `#1B7A4E` / `#DAF3E4` / `#9BD8B7` | `#57C88F` / `#11301F` / `#1E5A3C` |
| Warning / caution | `#96601A` / `#FBEED3` / `#E5C583` | `#E0B25E` / `#33270F` / `#6B5320` |
| Danger / incorrect | `#B3362B` / `#FBE4E1` / `#EFB3AC` | `#EF8073` / `#3A1A16` / `#7A3A31` |
| Info / note | `#2751A8` / `#E3EEFA` / `#AFCEE9` | `#7FA8E6` / `#16243A` / `#2A4A66` |
| Focus ring | `indigo-500`, 2 px ring at 2 px offset | `indigo-400` |

Incorrect-answer feedback uses **danger with warm language** — never red-flashing or alarm-styled (§12).

### 4.7 Contrast validation (WCAG 2.2 AA — computed 2026-11-17, `scripts/contrast-v2.py`)

| Pair | Light | Dark | Requirement |
|---|---|---|---|
| ink on canvas | 15.99:1 | 16.62:1 | 4.5:1 ✓ |
| ink-2 on surface | 8.97:1 | 8.78:1 | 4.5:1 ✓ |
| ink-3 on canvas | 4.66:1 | 5.16:1 | 4.5:1 ✓ (never below 14 px) |
| primary text on canvas | 6.43:1 | 6.08:1 | 4.5:1 ✓ |
| link on canvas | 8.16:1 | 8.15:1 | 4.5:1 ✓ |
| ink-inverse on primary | 6.49:1 | 6.08:1 | 4.5:1 ✓ |
| success / warning / danger / info text on canvas | 5.0–7.1:1 | 7.4–9.9:1 | 4.5:1 ✓ |
| gold-700 on canvas | 6.24:1 | — | 4.5:1 ✓ (small gold text) |
| gold-300 on dark canvas | — | 10.40:1 | 4.5:1 ✓ |
| Classical AI bronze (`viz-3`) on canvas | 4.68:1 | 8.97:1 | 4.5:1 ✓ (only school color used as small text) |
| school identity colors (`viz-1…10`) on canvas | 3.3–6.4:1 | 6.1–9.7:1 | 3.0:1 ✓ (graphical use — banners, icons, dots; see §4.8) |

Charts never rely on color alone (label/position redundancy rule). Full pair matrix incl. every school identity: `scripts/contrast-v2.py` + `scripts/contrast-schools.py`.

### 4.8 Data visualization palette (first-class tokens)

Ten categorical tokens, each bound to a course or school identity; dark variants brighten automatically:

| Token | Light | Dark | Identity |
|---|---|---|---|
| `--dv-viz-1` | `#4A4CC2` | `#8189DF` | Indigo — **Python** (the flagship wears the brand) |
| `--dv-viz-2` | `#784DC5` | `#A98BDF` | Violet — **Mathematics** |
| `--dv-viz-3` | `#A16207` | `#D9A85C` | Bronze — **Classical AI** |
| `--dv-viz-4` | `#C2415B` | `#E08BA0` | Rose — **Machine Learning** |
| `--dv-viz-5` | `#0E8FA8` | `#57BDCE` | Cyan — **NumPy** |
| `--dv-viz-6` | `#5E8C2E` | `#A6C168` | Moss — **Pandas** |
| `--dv-viz-7` | `#2D62C8` | `#6FAEEA` | Blue — **SQL** |
| `--dv-viz-8` | `#9A7B54` | `#C4A578` | Clay — misc categorical |
| `--dv-viz-9` | `#0F9D70` | `#4FC492` | Emerald — **Statistics** |
| `--dv-viz-10` | `#22736A` | `#6EC0B6` | Teal — **Data Analysis** (school identity; the §4.5 data-analysis accent promoted to a categorical token) |

Bridged utilities: `hue-python`, `hue-sql`, `hue-math`, `hue-numpy`, `hue-ai`, `hue-pandas`, `hue-ml`, `hue-stats` (plus `viz-1…10` raw). Course views tint with `hue-*` at 10–30% opacity (`color-mix(in srgb, var(--dv-viz-N) 12%, transparent)` for icon chips); both themes flip without `dark:` partners for opacity-tint usages.

**School identity binding.** The ten learning schools carry their identity color as a theme-aware token reference in `CurriculumSchool.color` (`src/lib/curriculum/data/schools.ts`) — never a raw hex, so a school banner, icon chip or row dot repaints with the theme like every other surface:

| School | Token | Rationale |
|---|---|---|
| A · Programming | `viz-1` | The flagship school wears the brand (Python is its anchor) |
| B · Mathematics | `viz-2` | Matches the math course (`hue-math`) |
| C · Statistics | `viz-9` | Matches the stats course (`hue-stats`) |
| D · Data Analysis | `viz-10` | The designated data-analysis accent |
| E · Python Libraries | `viz-5` | NumPy, the foundation of the scientific stack |
| F · Machine Learning | `viz-4` | Matches the ML course (`hue-ml`) |
| G · Deep Learning & AI | `viz-7` | Deep blue for deep learning |
| H · Data Visualization & BI | `viz-6` | Moss |
| I · Career Development | `viz-8` | Clay |
| J · Classical AI | `viz-3` | Matches `hue-ai`; the only school color used as small text (homepage eyebrow) — 4.68:1 light / 8.97:1 dark |

**Chart rules:** gridlines `border-subtle`; axis text `ink-3` 11–12 px tabular; direct labeling (no legend-only encoding); min 2 px strokes; area fills via `color-mix(… N%, transparent)`; neutral ink via `currentColor` + opacity; never raw hex.

### 4.9 Editor surface — the always-dark IDE

Real editor panes (SQL Lab CodeMirror console, editor chrome, lesson code figures, lab consoles) read as editors in Daylight too. One vocabulary, six surface tokens plus a state trio:

| Token | Value | Role |
|---|---|---|
| `--dv-editor-bg` | `#0C0E13` | Editor pane background |
| `--dv-editor-chrome` | `#161926` | Titlebar strips above the pane |
| `--dv-editor-border` | `#232833` | Editor dividers |
| `--dv-editor-dot` | `#2F3542` | Traffic dots, inactive chrome |
| `--dv-editor-gutter` | `#52525B` | Gutter numerals |
| `--dv-editor-ink` | `#E4E4E7` | Code text, active chrome labels |
| `--dv-editor-ok` | `#57C88F` | State text on the IDE surface (expected output) |
| `--dv-editor-warn` | `#E0B25E` | State text on the IDE surface (warnings, actual output) |
| `--dv-editor-err` | `#EF8073` | State text on the IDE surface (errors, tracebacks) |

Constant across themes **by design**; defined once on `:root`. Secondary IDE text uses opacity steps of ink (`text-editor-ink/70`, `/60`). State feedback on *page* surfaces uses the theme-aware `--dv-success-*` / `--dv-warning-*` / `--dv-danger-*` trios (§4.6) — never the editor trio, and vice versa.

**Solid state fills.** Elements that carry **white text on a filled state color** (Run/Stop buttons, 100%-complete badges, verified dots) use `--dv-success-solid` / `--dv-danger-solid`, not the `*-text` tones: `*-text` brightens in Observatory to stay legible on dark surfaces, which drops white-on-it to ~2.1:1. The solid pair is fixed deep enough for white text in both themes (4.9–6.0:1).

### 4.10 Usage ratio

60% neutral surfaces · 30% ink/typography · 10% accents (indigo-led, violet/gold inside it). If a screenshot reads louder than that, the accent is overused.

---

## 5. Typography

### 5.1 Families — four voices, all self-hosted

| Role | Family | Weights | Notes |
|---|---|---|---|
| **Display** (hero, page titles, big numerals) | **Fraunces** (variable) | 400–700 + italic | Soft scholarly serif; `font-display` utility; fallback Georgia, serif |
| **UI & body** | **Inter** (variable) | 400–700 | Exceptional at small sizes; `font-sans` (default); fallback system-ui |
| **Reading prose & math** | **Newsreader** (variable) | 400–600 + italic | The textbook voice; `font-reading`; italic register doubles as math notation (`t-math`) |
| **Code & data** | **JetBrains Mono** | 400–600 | Ligatures off; `font-mono`; fallback SFMono/Consolas |

All self-hosted latin subsets in `public/fonts/` (`scripts/vendor-fonts.py` regenerates). `font-variant-numeric: tabular-nums` (`.tabular`) is **mandatory** on every stat, score, duration, count and table numeral.

**Loading strategy:** only the two above-the-fold-critical faces — Inter (UI workhorse) and Fraunces (hero display) — are `<link rel="preload">`d in the root layout; Newsreader and JetBrains Mono swap in lazily (`font-display: swap`) as they are met after first paint. No `next/font/google` downloads remain: the generic `font-serif` utility aliases the display register (`--font-serif: var(--font-display)`), so no view can drift onto the OS serif stack.

### 5.2 The type register (utility classes in globals.css)

| Utility | Size / Line | Voice | Usage |
|---|---|---|---|
| `.t-hero` | `clamp(2.5rem, 1.4rem+4.2vw, 4.25rem)` / 1.04 | Fraunces 500, −0.02em | Homepage hero — one per site |
| `.t-display` | `clamp(1.9rem, 1.2rem+2.4vw, 2.75rem)` / 1.1 | Fraunces 500, −0.015em | Page titles — course & hub homes |
| `.t-title` | 1.75rem / 1.15 | Fraunces 500 | In-page titles, single-focus views |
| `.t-section` | `clamp(1.375rem, 1.1rem+1.2vw, 1.75rem)` / 1.2 | Fraunces 500 | Section headings |
| `.t-sub` | 1.0625rem / 1.35 | Inter 600 | Subheadings inside body |
| `.t-item` | 0.9375rem / 1.35 | Inter 600 | Card / item headings |
| `.t-lede` | 1.0625rem / 1.7 | Inter 400, ink-2 | Section-opening paragraphs |
| `.t-body` | 0.9375rem / 1.65 | Inter 400, ink-2 | Body copy |
| `.t-caption` | 0.8125rem / 1.55 | Inter 400, ink-3 | Supporting descriptions |
| `.t-meta` | 0.75rem / 1.4 | Inter 400, ink-3 | Metadata, counts, timestamps |
| `.t-math` | 1.0625rem | Newsreader italic | Inline mathematical notation |
| `.eyebrow` | 12px/16px | Inter 600, +0.08em, UPPERCASE, ink-3 | Context label above headings |

Rules: one `.t-hero` per page; headings never jump two register steps; every number that can change wears `.tabular`; legacy raw sizes (`text-4xl font-bold`) are tolerated in unedited lines but the register is preferred on any touched line.

### 5.3 Lesson prose (reading column)

- Measure: `--dv-width-prose` = **68ch** (`.reading`).
- Links: `link-dv` utility — `--dv-link` color, underline 1px at 3px offset, 2px on hover; never color-only.
- Term references: dotted underline, tooltip on hover/focus.
- `text-wrap: pretty` on headings.

---

## 6. Spacing & Layout Grid

### 6.1 Spacing

Tailwind's 4pt-base scale (0.5/1/2/3/4/5/6/8/10/12/16/24/32). Editorial rhythm tokens:

| Token | Value | Usage |
|---|---|---|
| `--dv-space-section` | `clamp(3.5rem, 7vw, 6rem)` | `.dv-section` — vertical breath between landing sections |
| `--dv-space-group` | `1.75rem` | Between grouped blocks |

### 6.2 Containers

| Token | Value | Utility | Usage |
|---|---|---|---|
| `--dv-width-content` | 72rem (1152px) | `.dv-container` | Main column — every composed page |
| `--dv-width-prose` | 68ch | `.reading` | Lesson reading measure |
| `--dv-width-narrow` | 44rem | — | Forms, sign-in, focused moments |
| `--dv-width-sidebar` | 17.5rem | — | Catalogue / course side rail |
| `--dv-gutter-page` | 1.25rem | — | Page margin-inline, mobile-first |
| `--dv-nav-height` | 4rem | — | Global header height |

`.dv-container` gutters: `--dv-gutter-page` (1.25rem) mobile → 1.5rem ≥ 640px. Section alternation: quiet band (`.dv-band`) or hairline `border-t border-border-subtle`.

### 6.3 Breakpoints (Tailwind standard)

`xs` 360px (minimum supported — everything survives) · `sm` 640 · `md` 768 (two-pane appears) · `lg` 1024 (app shell) · `xl` 1280 (lesson reader 2-pane) · `2xl` 1536 (full 3-column reader).

### 6.4 Grid templates

- **Marketing/landing:** single centered `.dv-container`, stacked `.dv-section`s.
- **Catalogue/search:** `[280px sidebar | fluid list]`, sidebar collapses to sheet < 1024px.
- **Lesson reader:** `[280px | minmax(0,1fr) center 760px | 320px]` ≥ 1440px (`LessonShell`).
- **Dashboards:** 12-column fluid, gap 24, cards span 3/4/6/8/12.

---

## 7. Radius, Borders & Elevation

### 7.1 Radius — one scale, everywhere

| Token | Utility | Value | Usage |
|---|---|---|---|
| `--radius-sm` | `rounded-sm` | 6px | Inputs, chips, checkboxes, menu items |
| `--radius-md` | `rounded-md` | 10px | Buttons, tooltips, small controls |
| `--radius-lg` | `rounded-lg` | 14px | Cards, code panes, menus, popovers |
| `--radius-xl` | `rounded-xl` | 20px | Dialogs, hero figures, widgets |
| full | `rounded-full` | 999px | Pills, avatars, progress, switches |

Radii nest: inner = outer − border − padding. No arbitrary radii (`rounded-[7px]`) — that is the "inconsistent corners" failure mode this system exists to prevent.

### 7.2 Borders

1px default (`--dv-border`); hairlines `border-subtle`; controls and emphasis `border-strong`. Dashed = locked/unavailable; dotted = term references only.

### 7.3 Elevation — e1…e5, never raw shadows

Light (warm ink-tinted):

| Level | Value | Usage |
|---|---|---|
| `shadow-e1` | `0 1px 2px rgba(27,29,36,.05)` | Cards at rest, active tab pill |
| `shadow-e2` | `0 2px 6px rgba(27,29,36,.07)` | Card hover, tooltips, thumbs |
| `shadow-e3` | `0 8px 24px rgba(27,29,36,.09)` | Sticky headers, chart tooltips |
| `shadow-e4` | `0 16px 48px rgba(27,29,36,.13)` | Dropdowns, popovers, toasts |
| `shadow-e5` | `0 24px 80px rgba(27,29,36,.18)` | Dialogs, command palette, sheets |

Observatory: each level gains `inset 0 1px 0 rgba(255,255,255,.04–.06)` top highlight plus deeper black shadow — elevation reads as surface lightness first, shadow second. **Raw `shadow-sm/md/lg/xl` are banned** in `src/components/**` (grep-enforced).

### 7.4 Z-index scale

One ladder for the whole platform. Tailwind's own numeric utilities cover the lower rungs (`z-0`…`z-50` — content, sticky chrome, Radix portals); two tokens sit above every portal for hand-rolled full-screen moments:

| Token | Value | Utility | Usage |
|---|---|---|---|
| `--dv-z-modal` | 60 | `z-(--dv-z-modal)` | Full-screen sheets: mobile course contents, lesson tools |
| `--dv-z-top` | 70 | `z-(--dv-z-top)` | Auth dialog, command search — nothing sits above |

Never write arbitrary `z-[N]` values; step onto the ladder.

---

## 8. Iconography & Illustration

### 8.1 Icons

- **Library:** Lucide (shadcn-aligned, zero extra deps). Stroke 1.5px; sizes 16 (inline/meta) · 20 (default) · 24 (nav/empty states).
- **Color:** `currentColor`; quiet contexts `text-ink-3`; course contexts tint via `hue-*`.
- Icon + label for anything not universally understood; icon-only buttons carry `aria-label` + tooltip.

### 8.2 Illustration — "Data Lineage" style

Thin 1.5px line art, duotone (ink lines + indigo/violet fills at 12–20% opacity) on geometric scaffolds — grids, nodes, edges, béziers. No mascots, no stock people. Used sparingly: school headers, empty states. Where a concept can be a real chart or widget, the chart wins.

### 8.3 Background textures (surface treatments)

- `.dv-wash` — layered radial indigo/violet/blue tints breathing over the hero canvas (both themes).
- `.dv-grid-texture` — a scholar's drafting grid, faded at the edges (44px cells, masked).
- `.dv-band` — quiet alternating section band.
- `.dv-panel-indigo` — deep indigo panel for final-CTA moments.
These are the **only** sanctioned gradients — calm radial tints, never linear banner gradients, never glassmorphism.

---

## 9. Motion System

### 9.1 Easings & durations

| Token | Value | Usage |
|---|---|---|
| `--ease-out-dv` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances (default) |
| `--ease-spring-dv` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Check-pop, milestone pops |
| `.transition-dv` | 140ms, `cubic-bezier(0.4,0,0.2,1)` | Interactive surfaces (color/border/shadow/transform) |

Duration guidance: 80–140ms press/hover · 200ms panels · 280ms modals · 480ms reveals · 900ms celebration (capped).

### 9.2 Named keyframes (globals.css)

`dv-rise` (14px fade-rise entrance) · `dv-float` (7px idle drift, 7s) · `dv-draw` (SVG stroke draw, 2.4s) · `dv-pulse-soft` · `dv-blink` (terminal caret). Stagger utilities `.dv-delay-1…5` (80–600ms). Usage: `.dv-rise .dv-delay-2`.

### 9.3 Choreography principles

- Enter slow, exit fast; transform + opacity only (60fps rule).
- Screen transitions: fade + 8px rise; never horizontal screen slides.
- Charts draw once on first viewport entry, never re-animate on re-render.
- Loading: skeletons for structure (`.dv-pulse` shimmer); spinners only inside buttons < 400ms.
- **Reduced motion:** global `@media (prefers-reduced-motion: reduce)` collapses all durations to 0.01ms — no per-component opt-outs needed.

---

## 10. Theming Architecture

### 10.1 Mechanism (as implemented)

- Tokens live in `src/app/globals.css`: `:root` (Daylight) and `.dark` (Observatory overrides). Tailwind 4 `@theme inline` bridges every token to utilities (`bg-canvas`, `text-ink-2`, `shadow-e4`, `hue-math` …), so a theme switch repaints the whole platform with **zero JS beyond the class flip**.
- `next-themes` manages `light | dark | system` (`class` strategy, `attribute="class"`, `suppressHydrationWarning`, `disableTransitionOnChange`), persisted in `localStorage`, FOUC-safe.
- Components never read raw hex and never use raw palette classes (§3.8). Host-mount theming (IC-6) remains possible: override `--dv-*` once and the Academy adopts host tone.

### 10.2 Theme hierarchy

1. Host overrides (if mounted) → 2. User preference → 3. OS `prefers-color-scheme` → 4. Default **system**.

### 10.3 Reading preferences

Theme (Light/System/Dark) · text size · reading font (Inter / Newsreader) · motion (Full/Reduced) · underline links. Preferences apply live with a 140ms crossfade.

---

## 11. Accessibility Standards (WCAG 2.2 AA — binding)

1. **Contrast:** pairs pre-validated (§4.7, computed); new color usage adds a row before shipping.
2. **Focus:** global `:focus-visible` — 2px ring in `--dv-focus-ring` (indigo-500/400) at 2px offset (`0 0 0 2px canvas, 0 0 0 4px ring`), radius-aware; never removed; components never add ad-hoc focus rings.
3. **Targets:** ≥ 44×44px touch; quiz options are full-width rows.
4. **Keyboard:** every flow pointer-free; reader `J/K` lessons, `?` shortcuts; ⌘K search palette.
5. **Screen readers:** landmarks per screen; charts carry `role="img"` + description + "read as table"; progress meters are `role="meter"`.
6. **Forms:** label + description + error associated; errors in text with fix steps, never color-only.
7. **Motion & vestibular:** §9.3 global reduced-motion.

---

## 12. Voice & Microcopy

| Situation | Rule | Example |
|---|---|---|
| Progress | Exact, never inflated | "11 of 14 lessons · 3 checkpoints to go" |
| Success | Specific, no superlatives | "First join query written — that's the hardest one in this module." |
| Incorrect answer | Warm, diagnostic | "Not this one — you picked the mean, and this question asks for the middle value." |
| Locked content | State the unlock, kindly | "Master the Sorting checkpoint to open this — you're one lesson away." |
| Errors | Plain English cause + fix | "Python can't find `datta`: check the spelling — line 3, did you mean `data`?" |
| Loading | Honest stage language | "Starting your sandbox… usually under 10 seconds." |
| Numbers | Tabular, units included | "2h 15m invested this week" |

Banned: "Simply", "Just", "Obviously", "Easy!", exclamation stacking, emoji in UI chrome, "Oops!", "Whoops".

---

## 13. Component Styling Conventions

The shadcn/ui primitive layer (`src/components/ui/*`) is themed onto these tokens. This is the definitive component recipe book.

### 13.1 Buttons

- **Primary:** `bg-primary text-primary-foreground shadow-e1 hover:bg-primary-hover active:shadow-e2`
- **Outline:** `border border-border-strong/60 bg-surface shadow-e1 hover:border-border-strong hover:bg-accent`
- **Ghost:** `hover:bg-accent hover:text-accent-foreground`
- Heights h-8/h-9/h-10; radius `rounded-md`; transitions 150ms on color/bg/border/shadow.

### 13.2 Links

`.link-dv` — `--dv-link`, underline 1px @ 3px offset → 2px on hover. Buttons that navigate use button styling; only true inline links underline.

### 13.3 Cards

`bg-card text-card-foreground rounded-lg border shadow-e1` at rest; interactive cards add `transition-all duration-150 hover:-translate-y-0.5 hover:shadow-e2`. Cards are the exception — rows and typography first.

### 13.4 Section anatomy

`eyebrow` → `t-section` heading → `t-lede` paragraph, left-aligned, inside `.dv-container` + `.dv-section` rhythm.

### 13.5 Overlays (dialogs, sheets, drawers)

- Content: `bg-surface border rounded-xl shadow-e5` (sheets: `bg-background` page-level + `shadow-e5`)
- Scrim: `bg-black/50 dark:bg-black/70`
- Close affordance: quiet icon button `text-ink-3 hover:bg-surface-subtle hover:text-ink`

### 13.6 Floating menus (dropdown, select, popover, hover-card, command)

Content: `bg-surface rounded-lg border p-1.5 shadow-e4`; items `rounded-md` with `focus:bg-accent` highlight; icons `text-ink-3`; separators `bg-border-subtle`; shortcuts `text-ink-3`. Tooltips invert: `bg-ink text-ink-inverse rounded-md shadow-e2`.

### 13.7 Code panes — two sanctioned treatments

- **`terminal-well`** (default): theme-adaptive inset surface — lesson code figures, outputs, worked solutions. Body `text-ink`, labels `text-ink-3`, copy buttons `text-ink-3 hover:bg-surface hover:text-ink`.
- **Editor tokens** (`--dv-editor-*`): always-dark real editors (SQL Lab CodeMirror).
- **`figure-well`**: subtle framed surface for diagrams and ASCII visuals.

### 13.8 Forms

Inputs `border-input rounded-md h-9 bg-transparent dark:bg-input/30`; focus handled by the global ring; labels Inter medium inheriting ink; validation via `aria-invalid` + danger triad text. Checkboxes/radios `border-input` → `bg-primary border-primary` checked; switches inset track + `shadow-e1` thumb; sliders inset track + `border-primary bg-surface shadow-e2` thumb.

### 13.9 Tabs

List: `bg-muted rounded-lg p-[3px]` inset rail; active trigger lifts: `bg-surface text-ink shadow-e1`; inactive `text-ink-3 hover:text-ink`.

### 13.10 Tables

Header row `bg-surface-subtle/60` with `text-ink-2` heads; rows `border-border-subtle` + `hover:bg-surface-subtle/60`; numerals tabular.

### 13.11 Callouts (Alert)

Variant triads: `default` (surface) · `info` · `success` · `warning` · `destructive` — each `border-{state}-border bg-{state}-bg text-{state}-text` with icon+title in state color and body in `text-ink-2`. Identical triads are used inline across course views (verified outputs, common mistakes, deliberate-crash panes).

### 13.12 Progress & skeletons

Progress: inset rail `bg-secondary` + `bg-primary` indicator (200ms ease-out transform). Skeletons: `bg-surface-inset rounded-md animate-pulse`.

### 13.13 Toasts

`bg-surface border rounded-lg shadow-e4`; destructive variant on the danger triad; quiet close on `text-ink-3`.

### 13.14 Course & school identity accents

Every school/course wears its `hue-*` token (§4.8) for icon squares, slug chips, letter badges, active borders and chart strokes — at 10–30% opacity tints or full-stroke. School identity colors additionally flow from `CurriculumSchool.color` (a `var(--dv-viz-N)` reference, §4.8 binding table) through inline styles — top rules, icon chips, row dots — so they are theme-aware with zero `dark:` partners. Identity color never overrides semantic states (correct/incorrect stay success/danger).

---

## 14. Token Reference Architecture

Three layers, strictly one direction (raw → semantic → bridge):

```
1. PALETTE RAMPS        --dv-indigo-*, --dv-blue-*, --dv-violet-*, --dv-teal-*,
                        --dv-gold-*, neutrals — never referenced by components.
2. SEMANTIC TOKENS      --dv-canvas / surface(-subtle|-inset) / ink(-2|-3|-inverse) /
                        border(-subtle|-strong) / primary(-hover) / link / focus-ring /
                        success-* / warning-* / danger-* / info-* / viz-1…9 /
                        editor-* / e1…e5 / width-* / space-* — the ONLY tokens
                        components touch. :root = Daylight, .dark = Observatory.
3. TAILWIND BRIDGE      @theme inline in globals.css maps shadcn slots
                        (background, card, popover, primary, accent, border, ring…)
                        + custom utilities (canvas, surface, ink-1/2/3, hue-*,
                        shadow-e1…5, success-*, editor-*) onto --dv-* tokens.
```

The canonical file is **`src/app/globals.css`** (this document mirrors it). `docs/design/design-tokens.css` is the frozen v1 snapshot, kept for history — do not build against it. Verification greps (CI-able):

```bash
# zero raw palette classes in components
grep -rnE "(emerald|sky|cyan|rose|amber|teal|slate|gray|zinc|orange|lime|green|red|yellow|pink|fuchsia|purple)-[0-9]{2,3}" src/components/ | wc -l   # → 0
# zero raw shadows
grep -rnE "shadow-(sm|md|lg|xl|2xl)\b" src/components/ | grep -v shadow-e | wc -l  # → 0
# zero non-token hexes (except var(--dv-*)/color-mix)
grep -rnE "#[0-9A-Fa-f]{6}\b" src/components/ | grep -v "var(--dv" | grep -v color-mix | wc -l  # → 0
```

---

*v2 is implemented across the platform: global shell, ten learning schools (including Classical AI), five course engines (Python, SQL, Mathematics, NumPy, Statistics), the Pandas and ML course views, the labs suite, dashboards and the ⌘K palette. Component inventory → `COMPONENT_INVENTORY.md`; screens → `SCREEN_DESIGNS.md`; the v1→v2 migration rules → `STYLE-SWEEP-BLUEPRINT.md`.*
