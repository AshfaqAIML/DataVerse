/**
 * PART B · LESSON b-12 — "Saving Figures"
 *
 * The chart is not done until it is a file: savefig's arguments
 * (dpi, bbox_inches, transparent, facecolor), the format decision
 * (raster PNG vs vector SVG/PDF), the dpi arithmetic that connects
 * figsize to pixels, and the blank-file bug that has bitten every
 * matplotlib user once.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";
import { EXPENSES_2024, REVENUE_2024, months } from "../datasets";

const MARGIN_2024 = REVENUE_2024.map((r, i) => r - EXPENSES_2024[i]);

export const LESSON_V_B_12: DataVizLesson = {
  slug: "b-12",
  title: "Saving Figures",
  minutes: 20,
  summary:
    "fig.savefig with dpi, bbox_inches and transparent; the format decision — PNG for raster, SVG/PDF for vector — the figsize-to-pixels arithmetic, and the classic blank-file bug.",
  tool: "matplotlib",
  objectives: [
    "Save a figure with fig.savefig, choosing dpi by destination: screen, retina, deck, print",
    "Choose between raster (PNG) and vector (SVG, PDF) by how the file will be consumed and whether it will be edited",
    "Compute the pixel size of a saved figure from figsize × dpi, and size figures target-first",
    "Diagnose and prevent the blank-file bug: savefig must precede plt.show",
  ],
  why: "The chart that ends its life as plt.show() in your notebook dies when the kernel does. The chart that becomes a file lives in the report, the deck, the ticket and next quarter's review — and every one of those destinations makes demands: the deck wants 16:9 pixels that survive a projector, the print appendix wants 300 dpi and a CMYK-friendly palette, the web page wants an SVG that stays sharp on retina screens and often needs a transparent ground. fig.savefig is one call, but its arguments encode all those contracts, and two of them — dpi and format — are where beginners ship files that look wrong at the worst moment (blurry in the boardroom). This lesson makes the export pipeline deliberate: size for the destination first, choose the format by consumption, and save before you show.",
  blocks: [
    {
      kind: "text",
      text: "`fig.savefig(\"chart.png\")` writes the whole Figure — every Axes, margin, label and annotation — to a file. The format is read from the extension (.png, .svg, .pdf, .jpg, .webp), or forced with `format=`. Everything else about the export is three arguments: **dpi** (raster density), **bbox_inches** (how much margin ships), and **transparent** / **facecolor** (what ships behind the ink).",
    },
    {
      kind: "code",
      title: "The export call, fully spelled",
      language: "python",
      code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue  = [124, 131, 128, 142, 149, 153, 151, 158, 166, 171, 189, 204]
expenses = [98, 101, 100, 106, 109, 111, 112, 115, 118, 121, 127, 134]
margin = [r - e for r, e in zip(revenue, expenses)]

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.bar(months, margin, color="#0d9488")
ax.set(title="Monthly margin, 2024 — the year compounding",
       ylabel="margin (k$)")

fig.savefig("margin.png", dpi=300, bbox_inches="tight")   # file first
fig.savefig("margin.svg", bbox_inches="tight")            # vector twin
plt.show()                                                # screen last`,
      note: "Two exports, two formats, one figure. dpi applies to the raster only — SVG is resolution-free by construction. The order is the habit from b-01, now with the reason: see the callout below.",
      produces:
        "margin.png at 2400×1350 pixels and margin.svg (same drawing, infinitely scalable) — plus the on-screen rendering. The bars below are the same data the files contain.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "Monthly margin, 2024 — the year compounding",
        categories: months,
        series: [{ name: "margin", values: MARGIN_2024 }],
        xLabel: "month",
        yLabel: "margin (k$)",
        showLegend: false,
      },
      why: "The artifact being shipped: twelve margin bars, 26 k$ growing to 70 k$. Every export decision that follows is about carrying THIS ink to a destination without losing it.",
    },
    { kind: "heading", text: "The dpi arithmetic" },
    {
      kind: "text",
      text: "Raster pixel size is **figsize × dpi**, nothing more: an 8×4.5 inch figure at 300 dpi is 2400 × 1350 pixels; at 150 dpi it is 1200 × 675. So 'what dpi do I need' is always answerable backwards from the destination: a slide occupying half a 1920×1080 deck needs about 960 px wide — at 8 inches that is 120 dpi, and 2× retina screens want 240. Print is the fixed star: 300 dpi is the standard, and a 6-inch-wide figure at 300 dpi is a 1800-px file your layout will place at 6 inches regardless. dpi is not 'quality' in the abstract — it is pixels-per-inch, and the inches were already decided by figsize.",
    },
    {
      kind: "table",
      title: "Choosing the format and the density",
      headers: ["Destination", "Format", "dpi", "Why"],
      rows: [
        ["Web page / chat / ticket", "PNG", "150-200", "raster is universal; 2× covers retina"],
        ["Word/PDF report, print", "PDF or PNG", "300", "print standard; PDF keeps text selectable"],
        ["Slide deck, projector", "PNG", "150-200", "slides rasterize anyway; sharpness at distance is about SIZE, not dpi"],
        ["Retina-heavy web app", "SVG", "—", "vector stays sharp at every pixel density, usually smaller too"],
        ["Design handoff (edit later)", "SVG", "—", "shapes stay shapes: recolorable, restylable, rescalable"],
        ["Photographs inside a chart", "JPG", "as needed", "the only case JPG earns — chart ink alone degrades under JPG compression"],
      ],
      caption: "The default reflex is PNG at 150 dpi; the two upgrades that matter most often are PDF for print and SVG for the web. JPG for pure charts is compression art—you paid for a chart and shipped a smudge.",
    },
    {
      kind: "definition",
      term: "Raster vs vector",
      informal:
        "Raster (PNG, JPG, WebP) stores a grid of pixels — fixed resolution, universal display. Vector (SVG, PDF) stores drawing instructions — lines, text, fills — and re-renders sharp at any size.",
      why: "Charts are lines, text and fills — exactly what vector stores perfectly. Photos are the one chart-adjacent thing that belongs in raster.",
    },
    {
      kind: "code",
      title: "Margins and grounds: bbox_inches and transparency",
      language: "python",
      code: `# tight: crop the saved file to the drawn ink + a hair of padding
fig.savefig("margin_tight.png", bbox_inches="tight", pad_inches=0.1)

# transparent: no ground at all — the host page's background shows through
fig.savefig("margin.svg", transparent=True)

# explicit ground: match the destination page instead
fig.savefig("margin_report.png", dpi=300, facecolor="#f8fafc")`,
      note: "bbox_inches=\"tight\" is the fix for the default export's generous whitespace (and for suptitles that would otherwise clip). transparent=True wins on colored host pages — but test: ink designed for white can go unreadable on navy.",
      produces:
        "Three variants of the same figure: cropped tight, groundless (SVG), and on a pale slate ground — the export triad of margin, transparency and background.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "The blank-file bug",
      text: "In a script, plt.show() BLOCKS — and on close, some backends finalize and clear the figure state. A fig.savefig placed AFTER plt.show() can write an empty white rectangle: the file exists, the bytes are real, the chart is gone. Order is the whole fix: savefig first, show second — the habit b-01 installed, now with its reason. (In Jupyter the cell's implicit show does not clear, which is exactly why the bug survives notebook testing and bites in production scripts.)",
    },
    {
      kind: "text",
      text: "The workflow that prevents every export surprise is **target-first sizing**: decide the destination's physical slot (a 6-inch report column, a 13.3×7.5-inch slide), make figsize match it, and let dpi follow from the pixel math. Resizing a saved PNG afterwards is the anti-pattern — upscaling invents pixels (blur), downscaling throws away the thin lines you styled (b-11's spines, hairline grids). The figure is born at its final size, or it ships compromised.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "Cumulative margin, 2024 — the report-column version",
        categories: months,
        series: [
          {
            name: "cumulative margin",
            values: MARGIN_2024.reduce<number[]>((acc, m, i) => [...acc, (acc[i - 1] ?? 0) + m], []),
          },
        ],
        xLabel: "month",
        yLabel: "cumulative margin (k$)",
        showLegend: false,
      },
      why: "The same margin data, one question deeper — the year's compounding, 26 k$ in January to 514 k$ by December — as the figure destined for the report's 6-inch column: figsize born to its slot, saved once, sharp forever in its SVG twin. The export discipline exists so that THIS reading survives the destination.",
    },
    {
      kind: "interpretation",
      id: "b-12-i1",
      chart: {
        type: "bar",
        title: "Monthly margin, 2024 — the year compounding",
        categories: months,
        series: [{ name: "margin", values: MARGIN_2024 }],
        xLabel: "month",
        yLabel: "margin (k$)",
        showValues: true,
        showLegend: false,
      },
      prompt: "This figure (8×4.5 in) ships into a printed report column that is 6 inches wide, as a 300-dpi PNG. Which statement is exactly right?",
      options: [
        {
          text: "The file is 2400×1350 pixels and will be placed at 6 inches wide — shrinking to 1800 px of effective density, so it exceeds the 300-dpi print bar with room to spare",
          correct: true,
          feedback:
            "Correct — 8 in × 300 dpi = 2400 px across; displayed at 6 in that is 2400/6 = 400 effective dpi. Overshoot is free; undershoot is the only failure mode.",
        },
        {
          text: "The file will be 6×3.4 inches because that is the destination",
          correct: false,
          feedback: "figsize fixed the inches at creation (8×4.5); the report LAYOUT scales the placed image, the file never learns about it.",
        },
        {
          text: "300 dpi cannot be verified after export — it is metadata only",
          correct: false,
          feedback: "It is checkable arithmetic: open the PNG's pixel dimensions and divide by the placed inches. 2400 px at 6 in IS the 400-dpi claim, verified.",
        },
        {
          text: "It should have been saved as JPG to keep the file small",
          correct: false,
          feedback: "JPG's lossy compression smears hard edges — exactly what charts are made of. PNG compresses flat-color charts far better AND losslessly.",
        },
      ],
      explanation:
        "Export literacy is doing the division before the meeting: pixels ÷ placed inches = effective dpi, and everything above 300 for print (150 for screen, 2× for retina) is margin you will never regret.",
    },
    {
      kind: "exercise",
      id: "b-12-e1",
      exerciseKind: "concept-check",
      prompt:
        "Three exports, one figure (a 10×5.5-inch two-panel revenue/expenses chart): (1) the company website's light-grey content cards; (2) the quarterly review deck on a dark slide template; (3) an appendix printed in greyscale. Specify format, dpi and ground treatment for each, and flag the one export that must NOT reuse the others' styling.",
      hint: "Ground color follows the host page — and a dark slide changes the contract more than any other destination.",
      options: [
        {
          text: "Website: SVG (or 2× PNG), transparent=True so the card grey shows through — but re-check ink contrast on grey. Deck: PNG at ~200 dpi, styled FOR the dark ground (light text/lines — the one export needing its own styling pass, since transparent dark-theme ink is invisible on the site's light cards). Print: PDF at 300 dpi on white, with a greyscale-safe palette (b-10's photocopy test)",
          correct: true,
          feedback:
            "Correct — and the deep point is the deck: exporting is not just parameters, it is re-dressing for a different ground. The dark slide is a styling pass, not a dpi pass.",
        },
        {
          text: "Same PNG everywhere: one 300-dpi white-ground file is simplest and consistent",
          correct: false,
          feedback: "Consistency of file, inconsistency of experience: a white box on a dark slide looks like a postage stamp error, and 300 dpi is wasted on the web.",
        },
        {
          text: "JPG for the website (smaller), PDF for the deck, PNG for print",
          correct: false,
          feedback: "Two of three are backwards: JPG smears chart edges, decks consume PNG/SVG happily, and print's standard-bearer is PDF at 300 dpi.",
        },
        {
          text: "Vector everywhere — SVG is always the best format",
          correct: false,
          feedback: "SVG is excellent for the web, but the print pipeline wants PDF and the deck wants simple raster; 'always vector' optimizes one property while ignoring each destination's actual contract.",
        },
      ],
      explanation:
        "Three destinations, three contracts: transparency and contrast for the web, a dark-ground styling pass for the deck, density and greyscale robustness for print. The export call is the last line of a chart's design, not an afterthought.",
    },
  ],
  terms: [
    {
      term: "fig.savefig",
      definition: "The Figure's export method: writes the whole canvas (every Axes and margin) to a file. Format from the extension, density via dpi, crop via bbox_inches — and always before plt.show.",
    },
    {
      term: "dpi (dots per inch)",
      definition: "Raster density: pixel size = figsize × dpi. Chosen backwards from the destination — 150 screen, 2× retina, 300 print — never as a vague 'more is better'.",
    },
    {
      term: "bbox_inches=\"tight\"",
      definition: "Crops the export to the drawn ink plus a small pad — the fix for the default's generous whitespace and for suptitles that would otherwise clip at the Figure edge.",
    },
  ],
  takeaways: [
    "The chart is not done until it is a file: fig.savefig writes the whole Figure, format from the extension, and always before plt.show.",
    "dpi is arithmetic, not quality: pixels = figsize × dpi, chosen backwards from the destination's slot and pixel needs.",
    "Vector (SVG/PDF) stores the drawing — charts stay sharp anywhere and stay editable; raster (PNG) is the universal default, and JPG is for photographs only.",
    "Size the figure for its destination at creation (target-first), and re-dress — not just re-export — when the ground changes (light cards, dark slides, greyscale print).",
  ],
  quiz: [
    {
      id: "b-12-q1",
      prompt: "A figsize=(8, 4.5) figure saved with dpi=150 is how many pixels wide?",
      options: [
        {
          text: "1200 px (8 inches × 150 dots per inch)",
          correct: true,
          feedback: "Correct — and 675 px tall. The multiplication is the entire content of 'dpi'.",
        },
        {
          text: "150 px — dpi sets the width",
          correct: false,
          feedback: "dpi is a density (dots PER inch), not a pixel count; the width comes from multiplying by inches.",
        },
        {
          text: "8 px — the figure is 8 wide",
          correct: false,
          feedback: "8 is INCHES; pixels require the density factor.",
        },
        {
          text: "2400 px, because that is the 300-dpi standard",
          correct: false,
          feedback: "That would be dpi=300 — the question said 150. Same figure, half the density, half the pixels.",
        },
      ],
      explanation:
        "figsize × dpi = pixels. Every export decision — retina checks, print bars, slide widths — reduces to this one multiplication.",
    },
    {
      id: "b-12-q2",
      prompt: "Why is SVG usually the better export than PNG for a chart on a website?",
      options: [
        {
          text: "It stores lines, text and fills as drawing instructions, so it renders sharp at every pixel density — including retina — and often compresses smaller",
          correct: true,
          feedback: "Correct — charts are exactly the content vector represents perfectly, which is why SVG is the web-first upgrade.",
        },
        {
          text: "SVG supports animation and PNG does not",
          correct: false,
          feedback: "SVG can animate, but that is not the everyday export reason — sharpness at any density is.",
        },
        {
          text: "PNG cannot display transparent backgrounds",
          correct: false,
          feedback: "PNG has an alpha channel and handles transparency fine — that is not the differentiator.",
        },
        {
          text: "Browsers require SVG for images on modern pages",
          correct: false,
          feedback: "PNG is universally displayed; SVG wins on merit for this content, not on requirement.",
        },
      ],
      explanation:
        "Vector files match chart anatomy (lines, text, fills) to vector storage — retina-proof, crisp at any zoom, and editable downstream. PNG remains the compatibility default.",
    },
    {
      id: "b-12-q3",
      prompt: "A teammate's script ends with plt.show() and then fig.savefig(\"out.png\"). The saved file is a white rectangle. Why?",
      options: [
        {
          text: "plt.show() blocked and, on close, the backend finalized/cleared figure state — the later savefig wrote the cleared canvas. Reorder: save first, show second",
          correct: true,
          feedback: "Correct — the blank-file bug. File first, screen second; b-01's habit now has its mechanism.",
        },
        {
          text: "savefig requires dpi=300 to draw content",
          correct: false,
          feedback: "dpi changes density, not content — a low-dpi export of a live figure shows every bar.",
        },
        {
          text: "The figure needs bbox_inches=\"tight\" to be visible",
          correct: false,
          feedback: "tight crops margins; it cannot conjure ink back onto a cleared canvas.",
        },
        {
          text: "PNG exports are white until the file is opened once",
          correct: false,
          feedback: "Nothing warms up a PNG; the bytes written are the bytes shipped.",
        },
      ],
      explanation:
        "Order of operations is the whole bug and the whole fix. Note why notebooks never catch it: Jupyter's implicit show does not clear, so the bug ships silently from notebook to script.",
    },
  ],
};
