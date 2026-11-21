/**
 * PART_A_V_PROJECT — the Part A capstone. Learners redesign a misleading
 * report and defend every change; the starter is a structured brief with
 * TODO markers (design exercise, not runnable code).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_A_V_PROJECT: MiniProject = {
  title: "The Makeover: One Misleading Report, Redesigned",
  brief:
    "You are handed a one-page sales report whose chart has been quietly doing the arguing: a truncated axis, an alphabetical month order, a title that states a subject instead of a finding, a rainbow palette, and a legend for a single series. Your job is the full Part A arc in one artifact — audit every flaw against the three questions (what is shown? compared to what? so that what is visible?), redesign the chart honestly, and write the defence: for every change you made, the perceptual or honesty rule that required it. The deliverable is a chart someone can read in five seconds and trust forever.",
  requirements: [
    "A written audit: every defect in the original chart named, with the perception or honesty principle it violates",
    "A redesigned chart (any tool, including this course's Chart Playground) whose every encoding decision you can justify",
    "A title that states the finding, axis labels with units, and a colour treatment that survives grayscale",
    "A side-by-side of old and new, with the exact claims a reader would draw from each — and where the old one's claims were inflated",
    "A one-paragraph defence of anything you chose to LEAVE ambiguous rather than overclaim",
  ],
  steps: [
    "Re-derive the data's actual story from the numbers alone — trend, magnitude, comparison — before touching any design choice.",
    "Audit the original chart defect by defect against the three questions; write each violation as a one-line finding.",
    "Choose the chart type from the story: which relationship does the data's claim require the encoding to surface?",
    "Fix the axes (zero-baseline or a declared position encoding), the order (calendar or value), the title (claim, not subject) and the colour (CVD-safe, meaningful).",
    "Redesign in the Playground or your tool of choice; screenshot both versions side by side.",
    "Write the claim comparison: what a reader concludes from old vs new, and quantify the inflation the old chart introduced.",
    "Swap with a peer: audit THEIR makeover the same way. The critique you can accept is the standard you now hold yourself to.",
  ],
  starter: `# THE MAKEOVER — working brief (fill every TODO)

## 1. The data's actual story (from the numbers, before any design)
- Trend: TODO (state direction, magnitude, period — in numbers)
- Comparisons that matter: TODO
- The one claim worth making: TODO

## 2. Audit of the original chart
| # | Defect | Principle violated | Fix |
|---|--------|--------------------|-----|
| 1 | TODO   | TODO               | TODO |

## 3. The redesign
- Chart type: TODO — because the question is TODO
- Axes: TODO (units, baseline, and why)
- Title (as claim): TODO
- Colour: TODO (palette, and its grayscale fate)
- Text: TODO (labels, annotations, what was removed)

## 4. Old vs new — the claims readers draw
- Old: TODO
- New: TODO
- Inflation introduced by the old design: TODO (quantified)

## 5. What I deliberately left ambiguous, and why
TODO`,
  concepts: ["chart audit", "encoding choice", "honesty rules", "titles as claims", "colour-blind safety"],
  extension:
    "Find a real chart in the wild (a news article, an annual report) that commits at least two of Part A's violations — and write the makeover memo you would send its author, in 300 words, quoting the exact perceptual rules at fault.",
};
