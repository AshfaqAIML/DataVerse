/**
 * PART_B_V_PROJECT — "The 2024 Story, Four Tiles" (Part B's project).
 *
 * One 2x2 matplotlib figure over the course's shared numbers — a
 * line tile, a grouped-bar tile, a box tile and an annotated margin
 * tile — exercising the full Part B arc: the object model, every
 * core mark, subplots under a suptitle, annotation on a budget, and
 * an export contract (a 200-dpi PNG plus an SVG twin, pixel
 * arithmetic stated, savefig before show).
 */
import type { MiniProject } from "@/lib/course/types";

export const PART_B_V_PROJECT: MiniProject = {
  title: "The 2024 Story, Four Tiles — one figure, the whole Part B arc",
  brief:
    "Build the one-figure annual review the course's shared numbers deserve: a 2×2 matplotlib figure where each tile is a different mark telling one part of 2024 — revenue 2023 vs 2024 as lines, the coffee mix shift as grouped bars, satisfaction by department as box plots, and monthly margin as annotated bars. The figure is the deliverable, but the discipline is the point: a suptitle that states the finding, per-tile titles that state each question, units on every axis, exactly one annotation held to the budget — and an export contract: a 200-dpi PNG plus an SVG twin, both written before plt.show, with the pixel arithmetic stated in a comment. Every number is real course data, so every claim the figure makes is checkable against the lessons that taught it.",
  requirements: [
    "One Figure from plt.subplots(2, 2, figsize=(12, 8), constrained_layout=True) — four tiles, four different marks: line, grouped bar, box, annotated bar",
    "Tile (0, 0): both revenue years as lines with label= on each ax.plot and one ax.legend(), the two series distinguishable by marker AND linestyle, not hue alone",
    "Tile (0, 1): Q1 vs Q4 cups as grouped bars built from np.arange slots and width offsets, with ax.set_xticks(x, products) and the deltas named in the tile title (Cold Brew +41%, Filter −14%)",
    "Tile (1, 0): satisfaction by department as ax.boxplot(..., tick_labels=...), plus a one-sentence comment on what the boxes reveal that five mean-bars hid (Design's minimum sits above Support's maximum)",
    "Tile (1, 1): monthly margin as bars with exactly ONE ax.annotate pinning December's 70 k$ and one dashed grey axhline at the annual mean margin (≈42.8 k$) — each justified against the annotation budget",
    "A suptitle stating the figure's finding (not its contents); per-tile ax.set_title; units on every y-axis; and the export contract — PNG at dpi=200 (12 × 200 = 2,400 px wide) plus an SVG twin, both with bbox_inches=\"tight\" and both BEFORE plt.show",
  ],
  steps: [
    "Type the literals from datasets.ts (REVENUE_2023, REVENUE_2024, EXPENSES_2024, COFFEE_Q1, COFFEE_Q4, the five departments' twelve scores each) and compute margin and its mean (514 / 12 ≈ 42.8 k$) before plotting anything.",
    "Build the empty 2×2 grid first and prove the indexing to yourself: axes[0, 1] is the top-right tile. Placeholder titles catch transposed coordinates early.",
    "Fill the tiles in reading order — lines, grouped bars, boxes, margin bars — running the script after each tile so errors surface at the call that caused them.",
    "Author the annotations last: list every candidate arrow and reference line, keep only the one that serves the suptitle's lead claim (December's 70 k$), and write its one-line budget justification beside the call.",
    "Title the whole figure with its finding and each tile with its question; put units on every y-axis, and make the two revenue tiles comparable (one shared ruler or a deliberate, loudly announced break).",
    "Export before plt.show: the 200-dpi PNG (12 × 200 = 2,400 px wide) and the SVG twin with bbox_inches=\"tight\" — then verify the PNG's pixel width matches the arithmetic by checking the file's properties.",
    "Cold-read the finished figure for five seconds and write down the three findings you saw (revenue accelerating with the year-gap widening from 22 to 56 k$; Cold Brew up 41% while Filter fell; margin roughly doubling from 26 to 70 k$). If an intended finding is missing from the cold read, fix the figure — not the reader.",
  ],
  starter: `import matplotlib.pyplot as plt
import numpy as np

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
rev_2023 = [102, 108, 112, 109, 117, 121, 126, 124, 129, 133, 141, 148]
rev_2024 = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]
margin = [r - e for r, e in zip(rev_2024, expenses)]   # 26 ... 70
mean_margin = sum(margin) / len(margin)                # ~42.8

products = ["Espresso", "Latte", "Filter", "Cold Brew"]
q1 = [412, 588, 301, 476]
q4 = [489, 647, 258, 671]

survey = {
    "Engineering": [7, 8, 6, 9, 8, 7, 8, 5, 8, 9, 7, 6],
    "Sales":       [6, 5, 7, 6, 8, 5, 6, 7, 5, 6, 4, 6],
    "Support":     [5, 4, 6, 5, 3, 6, 5, 4, 5, 6, 5, 4],
    "Design":      [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 9, 7],
    "Ops":         [6, 7, 5, 6, 7, 6, 5, 6, 7, 6, 6, 5],
}

fig, axes = plt.subplots(2, 2, figsize=(12, 8), constrained_layout=True)

# TODO: tile (0, 0) — both revenue years as lines: label= per series,
# marker AND linestyle so they survive grayscale, one ax.legend()
axes[0, 0].plot(months, rev_2023)   # replace with the full construction

# TODO: tile (0, 1) — grouped bars Q1 vs Q4: x = np.arange(4),
# bars at x - w/2 and x + w/2, set_xticks(x, products),
# deltas in the tile title

# TODO: tile (1, 0) — ax.boxplot(list(survey.values()),
# tick_labels=list(survey.keys()))

# TODO: tile (1, 1) — margin bars + ONE annotate (December, 70) +
# axhline(mean_margin) styled as furniture, not data

fig.suptitle("TODO: the finding, not the contents")

# TODO: exports BEFORE plt.show —
#   PNG at dpi=200 (12 x 200 = 2400 px wide), bbox_inches="tight"
#   SVG twin, same ink, resolution-free
fig.savefig("story_2024.png", dpi=200, bbox_inches="tight")
# fig.savefig("story_2024.svg", bbox_inches="tight")

plt.show()
`,
  concepts: [
    "object model",
    "marks and encodings",
    "subplots and suptitle",
    "annotation budget",
    "export arithmetic",
  ],
  extension:
    "Re-dress the same figure for two more venues — a dark-themed keynote (light ink; a styling pass, not a re-export) and a greyscale printed appendix (the photocopy test: labels and position carry identity, never hue alone) — then run b-10's style-stability audit: list every finding the figure argues and confirm each survives both dresses. Where one fails, fix the design, not the venue.",
};
