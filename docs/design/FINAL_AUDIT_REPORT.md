# FINAL AUDIT REPORT — DataVerse Academy

**Scope:** final visual + functional audit of the redesigned platform, performed against the production build after the full redesign programme (design system → home/nav → textbook readers → visualisation library → student interfaces → motion → responsive/a11y).
**Date:** 2026-11-20/21 · **Browser:** Chromium (Playwright) · **DB:** seeded production data (15 subjects, 4 courses, 30 lessons, 10 quizzes, 7 users, 5 roles)
**Deliverable:** `download/DataVerse_Academy_Final_Audit_Report.docx` + `.pdf` (full report) · evidence in `scratch/final-audit/` · harness in `scripts/audit/`

## Outcome

| Stream | Result |
|---|---|
| `bun test` (10 files) | **213/213 pass** (run 4× across the cycle) |
| Route integrity (26 deep links) | **26/26 pass** |
| Screenshot sweep (30 routes × 4 viewports × 2 themes) | **174 screenshots — 0 blank, 0 console errors, 0 page errors, 0 failed requests, 0 horizontal overflow** |
| Vision review (9 contact sheets) | all flags resolved or disproven in the DOM |
| axe-core WCAG 2.2 AA (11 routes × 2 viewports + 2 dark deep dives) | **24 violations found → 0 after fixes** |
| Functional regression (17 areas, 32 scripted checks) | **32/32 pass** |
| `tsc --noEmit` / ESLint (repo-wide) / token grep guard | clean |

## Defects found & fixed (14)

| # | Defect | Root cause | Fix |
|---|---|---|---|
| F1 | Labs hub horizontal overflow at 390/360 px | `.dv-aurora::before` `inset:-12%` bled past the viewport | media query clamps horizontal inset to 0 below 640 px |
| F2 | No document-level overflow guard | — | `overflow-x-clip` on the app root wrapper (CSS Overflow 3: vertical scroll + sticky unaffected) |
| F3 | Pre-hydration hash change reverted to home | Next.js App Router bootstrap `history.replaceState` strips fragments changed before hydration | route hook re-asserts the intended fragment when emptied; direct links & post-hydration nav verified unaffected |
| F4 | Six viz hues 3.0–4.2:1 as small text | categorical ramp tuned for 3:1 chart marks, not 4.5:1 text | light values darkened 6–30% toward ink (viz-3 `#955C0A`, viz-4 `#B83F58`, viz-5 `#117488`, viz-6 `#50752C`, viz-8 `#7F674A`, viz-9 `#137759`); all clear 4.5:1 on white + own 12% tint; dark block untouched |
| F5 | White on success/danger fills 2.08–2.62:1 in dark | `*-text` tones (foreground colors) used as button backgrounds | new `--dv-success-solid` / `--dv-danger-solid` tokens (light `#1B7A4E`/`#B3362B`, dark `#178053`/`#C0453A`, 4.9–6.0:1 with white); 11 call sites migrated |
| F6 | Editor contrast + naming | one-dark stock `#282c34` chrome stranded coral 4.38:1 / stone 3.86:1; `.cm-content` unnamed | chrome theme raised above one-dark via `Prec.high` → surface = `--dv-editor-bg #0C0E13`, whole palette ≥5.3:1; `aria-label` on both editors |
| F7 | `kbd` shortcut chips 3.8:1 | `bg-white/20` lightened backing under white text | `bg-black/25` (3 files) + lab mode counter chip re-tooled |
| F8 | Math lines / lesson `pre` not keyboard-scrollable | WCAG 2.1.1 scrollable regions must be focusable | `tabIndex=0` + aria-labels on math lines and 4 code panes |
| F9 | SVG figures missing titles | `role="img"` without accessible name | alt text injected as `<title>` at render time |
| F10 | Empty table headers | authored blank header cells | sr-only fallback in 3 table renderers |
| F11 | Landmarks | unlabeled rails; aside-in-aside | unique `aria-label`s ("Lesson outline" / "Lesson tools"); inner aside → div |
| F12 | Lab exercise titles truncated to 1 line | single-line `truncate` | `line-clamp-2 leading-snug` |
| F13 | 11 raw Tailwind palette usages in viz components | token-bypass | migrated to viz tokens (`rose→viz-4`, `amber→viz-3`, `emerald→viz-9`); guard returns 0 |
| F14 | Unused `.dv-status` class | duplicates Tailwind `sr-only`, zero refs | removed after dependency check |

Duplicates audited: `math-display-row`, `ada-prose`, `dv-skel` multi-site definitions are complementary (base + responsive/reduced-motion contexts), not redundancy.

**Session close (2026-11-21) — repo lint brought to zero:** the 13 lint errors noted in the first pass (all `no-require-imports` in CommonJS audit tooling, none in product code) are resolved — the five `.cjs` scripts parked at the repo root were relocated under `scripts/audit/` (verified unreferenced first) and a scoped ESLint override now permits `require()` in `**/*.cjs` tooling files. Gates re-verified after the change: `tsc --noEmit` 0 · `bun run lint` 0 (repo-wide) · `bun run test` **213/213** (3,443 expectations).

## Performance (production, cold cache, headless)

TTFB **29 ms** · DCL **245 ms** · FCP **492 ms** · 9 JS files 3.7 MB (Pyodide/PGlite lazy) · CSS 45 KB · 5 self-hosted woff2 (2 preloaded) · build 33 s / 48 pages, 0 warnings.

## Remaining issues (honest list — not claimed as working)

1. **Cross-browser not exercised** — all dynamic testing was Chromium; `overflow-x: clip` and `color-mix()` are baseline-2023, expected but unverified on Firefox/Safari.
2. **Screen readers** — axe is static; a manual VoiceOver/NVDA pass over the lesson reader and assessment runner is recommended before any public AA-conformance claim.
3. **Low-end device profiling** not done (headless desktop context only).
4. **Pre-hydration hash race** mitigated, not eliminated (upstream Next behavior).
5. **Unknown hashes render home silently** (designed SPA fallback; no in-app dead links — verified).

## Recommendations

- Adopt `scripts/audit/` as a regression gate (<10 min, encodes overflow/console/failed-request/blank-page guards).
- Add the axe pass to CI on the five highest-traffic routes.
- Run the manual screen-reader pass before launching.

**Pages redesigned (cumulative programme, all verified this audit):** academy home, explore, roadmap, school + subject pages, 6 course homes + part + lesson readers (Python, SQL, Math, NumPy, Classical AI, DataViz), labs hub + 7 lab workspaces, SQL Lab, 2 playgrounds, dashboard, assessment center + runner + coding challenge, AI tutor, placement hub + tests, projects, career centre, institution pages (guide/terms/privacy).
