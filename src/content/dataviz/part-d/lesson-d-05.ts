/**
 * PART D · LESSON d-05 — "3D Visualizations"
 *
 * The eye is a 2D instrument, so 3D starts with a burden of proof: it
 * earns its depth only when the structure is genuinely three-variate —
 * hidden in every 2D projection (the helix). px.scatter_3d, px.line_3d
 * and go.Surface are the real APIs; the chart blocks render the 2D
 * projections and the surface's contour view with the course engine —
 * which is precisely the honest question: what do the shadows show?
 */
import type { DataVizLesson } from "@/lib/dataviz/types";

/* An illustrative helix, clearly framed as such: 24 turns of x = cos t,
   y = sin t, z = t — the toy example whose structure no 2D projection
   can carry. Rounded to 2 decimals. */
const helixT = Array.from({ length: 24 }, (_, i) => Math.round(i * 0.4 * 100) / 100);
const helixX = [1.00, 0.92, 0.70, 0.36, -0.03, -0.42, -0.74, -0.94, -1.00, -0.90, -0.65, -0.31,
  0.09, 0.47, 0.78, 0.96, 0.99, 0.87, 0.61, 0.25, -0.15, -0.52, -0.81, -0.97];
const helixY = [0.00, 0.39, 0.72, 0.93, 1.00, 0.91, 0.68, 0.34, -0.06, -0.44, -0.76, -0.95,
  -1.00, -0.88, -0.63, -0.28, 0.12, 0.49, 0.79, 0.97, 0.99, 0.85, 0.59, 0.22];

/* An illustrative dome: z = 10 - x^2 - y^2 over the grid x, y in {-2..2},
   shown as a heatmap (the surface's contour view). */
const domeCols = ["x=-2", "x=-1", "x=0", "x=+1", "x=+2"];
const domeRows = ["y=+2", "y=+1", "y=0", "y=-1", "y=-2"];
const domeCells = [
  [2, 5, 6, 5, 2],
  [5, 8, 9, 8, 5],
  [6, 9, 10, 9, 6],
  [5, 8, 9, 8, 5],
  [2, 5, 6, 5, 2],
];

export const LESSON_V_D_05: DataVizLesson = {
  slug: "d-05",
  title: "3D Visualizations",
  minutes: 20,
  summary:
    "3D starts with a burden of proof: the eye is a 2D instrument, and depth earns its place only when the structure is genuinely three-variate — a helix no projection reveals, a surface's rise and fall. px.scatter_3d, px.line_3d, go.Surface — and when to say no.",
  tool: "plotly",
  objectives: [
    "Build 3D views with px.scatter_3d(x=, y=, z=), px.line_3d, and go.Surface(z=)",
    "State the condition under which 3D earns its depth: three-variate structure hidden in every 2D projection",
    "Name the perceptual costs of 3D: occlusion and perspective distortion of position and length",
    "Choose the honest 2D alternative — faceting, small multiples, a heatmap contour view — when the structure does not require depth",
  ],
  why: "3D is the most requested and least justified feature in visualization. It looks impressive precisely because depth cues are preattentive — the brain loves a scene — but the eye reads a 3D chart through a 2D retina: every length is foreshortened, every angle is approximate, and anything can hide behind anything. That is a heavy tax, and it is only worth paying when the data's structure genuinely lives in three variables at once: a helix whose 2D shadows are a circle and two waves, a surface whose height is the whole story. When the third variable is decorative — a bar chart extruded, a pie given altitude — the tax buys nothing but distortion. This lesson gives you the real plotly APIs for all three cases, and the judgment to tell them apart.",
  blocks: [
    {
      kind: "text",
      text: "Start from the perceptual fact: your reader has **two** 2D retinas, and every '3D chart' is a 2D projection of a 3D scene. Depth is therefore *inferred*, not perceived exactly — which means every positional encoding you place on the z-axis arrives distorted (foreshortened) and partial (occluded). The honest question for any 3D view is: **does the structure live in three variables jointly, such that every 2D projection hides it?** If yes, 3D earns its depth. If no — if the third variable is a category you could facet, or decoration you could delete — the projection is pure cost.",
    },
    {
      kind: "heading",
      text: "When depth earns its keep: the helix",
    },
    {
      kind: "text",
      text: "Here is the toy that makes the standard concrete (illustrative data, chosen to expose exactly this): 24 points along a helix — `x = cos t`, `y = sin t`, `z = t` for t from 0 to 9.2. The structure — a coiling ramp — exists only in the joint three-variate arrangement. Watch what the 2D projections do to it.",
    },
    {
      kind: "code",
      title: "The three axes, jointly",
      code: `import pandas as pd
import plotly.express as px

helix = pd.DataFrame({
    "x": [1.00, 0.92, 0.70, 0.36, -0.03, -0.42, -0.74, -0.94, -1.00, -0.90,
          -0.65, -0.31, 0.09, 0.47, 0.78, 0.96, 0.99, 0.87, 0.61, 0.25,
          -0.15, -0.52, -0.81, -0.97],           # cos t
    "y": [0.00, 0.39, 0.72, 0.93, 1.00, 0.91, 0.68, 0.34, -0.06, -0.44,
          -0.76, -0.95, -1.00, -0.88, -0.63, -0.28, 0.12, 0.49, 0.79, 0.97,
          0.99, 0.85, 0.59, 0.22],               # sin t
    "t": [round(i * 0.4, 2) for i in range(24)], # the climb
})

fig = px.scatter_3d(helix, x="x", y="y", z="t", color="t",
                    title="A helix: three variables, one structure")
fig.update_traces(marker=dict(size=4))
fig.show()

# The same path as a line instead of points:
# fig = px.line_3d(helix, x="x", y="y", z="t")`,
      language: "python",
      note: "px.scatter_3d takes the same tidy-DataFrame grammar as every other express function — x, y, z, color — and returns a rotatable scene. px.line_3d connects the points into the ramp itself.",
      produces:
        "A rotatable 3D scatter: drag to orbit and the coil reveals itself — a climbing ring, not a circle.",
    },
    {
      kind: "chart",
      chart: {
        type: "scatter",
        title: "The helix's shadow: x vs y",
        points: helixX.map((x, i) => ({ x, y: helixY[i], label: `t=${helixT[i]}` })),
        xLabel: "x = cos t",
        yLabel: "y = sin t",
      },
      why: "The first 2D projection: x against y is a circle. Every point of the coil lands on the ring — the climb (t) is completely invisible. This is what a projection does to three-variate structure: it deletes a dimension's worth of information.",
    },
    {
      kind: "text",
      text: "And the other shadows are no better: x against t is a wave, y against t is the same wave out of phase. Three 2D charts, three *decompositions* — and the structure (the coil) appears in none of them, because it is a property of the three variables *jointly*. This is the precise condition under which 3D earns its depth: **structure that survives in no projection.** For anything less, the honest move is the projection plus the decomposition.",
    },
    {
      kind: "chart",
      chart: {
        type: "line",
        title: "The helix's other shadows: cos t and sin t against t",
        categories: helixT.map((t) => String(t)),
        series: [
          { name: "x = cos t", values: helixX },
          { name: "y = sin t", values: helixY },
        ],
        xLabel: "t",
      },
      why: "Two clean waves — one oscillation, then another. A reader given only these projections would reasonably conclude 'an oscillator', and never suspect the ramp. The 3D view is not decoration here; it is the only witness.",
    },
    {
      kind: "heading",
      text: "Surfaces: go.Surface",
    },
    {
      kind: "text",
      text: "The second legitimate 3D structure is a **surface**: a continuous z over an x–y grid — terrain, a response curve, a probability density's height. Here plotly's express layer steps aside for `go.Surface`, which takes the grid directly. Our example (illustrative, framed as such): a dome, `z = 10 − x² − y²` over the square x, y from −2 to 2.",
    },
    {
      kind: "code",
      title: "A continuous height over a grid",
      code: `import numpy as np
import plotly.graph_objects as go

x = np.linspace(-2, 2, 5)
y = np.linspace(-2, 2, 5)
X, Y = np.meshgrid(x, y)
Z = 10 - X**2 - Y**2            # the dome: peak 10 at the centre

fig = go.Figure(data=[go.Surface(z=Z, x=x, y=y)])
fig.update_layout(
    title="A dome: z = 10 - x^2 - y^2",
    scene=dict(xaxis_title="x", yaxis_title="y", zaxis_title="z"),
)
fig.show()`,
      language: "python",
      note: "go.Surface takes the z grid (plus optional x and y coordinates) and renders a lit, rotatable surface. The scene axis titles are set through update_layout's scene dict, not update_xaxes — in 3D there are three of everything.",
      produces:
        "A rotatable dome: peak of 10 at the centre, falling to 2 at the corners, the curvature readable from any angle the reader chooses.",
    },
    {
      kind: "chart",
      chart: {
        type: "heatmap",
        title: "The dome's contour view: z as a heatmap",
        matrix: {
          rowLabels: domeRows,
          colLabels: domeCols,
          cells: domeCells,
        },
        xLabel: "x",
        yLabel: "y",
      },
      why: "The same surface as its 2D shadow — the top-down contour view. Note what the projection costs (the sense of height) and what it buys: exact lookup (the peak cell reads 10, the corners 2) and no perspective distortion. When the reader's job is reading values, the heatmap wins; when it is grasping the shape, the surface wins.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "Occlusion: the unforgivable tax",
      text: "A surface hides what is behind it; a 3D bar hides the bars behind it. Rotation is the offered cure — 'the reader can orbit!' — but it converts a glance into a task, and whatever is hidden *at the reading angle* is hidden from the argument. Never rotate a bar chart into depth: bar length is the encoded value, and perspective foreshortens exactly that. 3D bars pay the full tax for zero structure.",
    },
    {
      kind: "interpretation",
      id: "d-05-i1",
      chart: {
        type: "heatmap",
        title: "The dome's contour view: z as a heatmap",
        matrix: {
          rowLabels: domeRows,
          colLabels: domeCols,
          cells: domeCells,
        },
        xLabel: "x",
        yLabel: "y",
      },
      prompt:
        "Reading the contour view: what is the dome's shape, and where is its peak?",
      options: [
        {
          text: "A radially symmetric dome: peak of 10 at (x=0, y=0), falling to 2 at the four corners, with the 8–9 ring one step out from centre in every direction",
          correct: true,
          feedback:
            "Correct — centre cell 10, the plus-shaped 9 ring around it, 8 at the diagonal neighbours, down to 2 at the corners. The matrix's mirror symmetry in both axes IS the radial symmetry.",
        },
        {
          text: "A ridge: high along one axis and low along the other",
          correct: false,
          feedback: "Row y=0 reads 6, 9, 10, 9, 6 and column x=0 reads 6, 9, 10, 9, 6 — identical profiles. A ridge would privilege one direction; the dome privileges none.",
        },
        {
          text: "A monotonic slope from the top-left corner to the bottom-right",
          correct: false,
          feedback: "All four corners read 2 — there is no gradient across the map; the high ground is the middle, not an edge.",
        },
        {
          text: "Flat: all cells within 1 unit of each other",
          correct: false,
          feedback: "The cells span 2 to 10 — a five-fold difference that the heatmap's intensity scale is busy encoding.",
        },
      ],
      explanation:
        "The contour view trades the sense of height for exactness: symmetry, peak location (centre, 10) and corner values (2) all read off the matrix without a single rotation. That trade is the decision this whole lesson teaches you to make.",
    },
    {
      kind: "exercise",
      id: "d-05-e1",
      exerciseKind: "choose-chart",
      prompt:
        "A stakeholder sees your 2D grouped bar chart of quarterly cups by product (four products × four quarters) and asks for 'the 3D version' — bars extruded into depth, quarters receding into the distance. Choose the honest response.",
      options: [
        {
          text: "Keep the 2D grouped bars: the structure is 2-variate (product × quarter), so depth adds occlusion and foreshortening while contributing nothing — offer rotation only if a third continuous variable genuinely joins the analysis",
          correct: true,
          feedback:
            "Correct — the burden of proof: does any 2D projection hide the structure? For product × quarter, no — the grouped bar IS the full structure. 3D here buys distortion and hides rear bars behind front ones.",
        },
        {
          text: "Build the 3D version — it is more engaging, and engagement is the goal",
          correct: false,
          feedback: "Engagement that costs the reader accuracy is decoration. The 3D extrusion foreshortens the very lengths the chart encodes.",
        },
        {
          text: "Build it, but add a note that the z-axis is decorative",
          correct: false,
          feedback: "A disclaimer does not un-distort the bars: the reader's eye still reads foreshortened lengths as values.",
        },
        {
          text: "Replace it with a 3D pie chart instead, which shows shares better",
          correct: false,
          feedback: "A 3D pie compounds two failures: angle encoding (weak) plus perspective distortion of those angles. There is no honest version of this request.",
        },
      ],
      explanation:
        "The helix earned depth because its structure survived in no projection. Product × quarter survives perfectly in one flat grouped bar chart — so flat is the honest rendering, and the burden of proof returns unmet.",
    },
  ],
  terms: [
    {
      term: "occlusion",
      definition: "The 3D tax: marks or surfaces in front hide what is behind them. Whatever is occluded at the reading angle is excluded from the argument.",
    },
    {
      term: "projection (2D shadow)",
      definition: "A view of 3D data onto two of its axes. If every projection hides the structure, the structure is genuinely three-variate and 3D earns its depth.",
    },
    {
      term: "surface plot",
      definition: "A continuous z rendered over an x–y grid (go.Surface(z=...)): terrain, response surfaces, densities — the second legitimate 3D structure.",
    },
  ],
  takeaways: [
    "Every 3D chart is read through a 2D retina: depth is inferred, foreshortened and partial. That tax must be paid for with structure.",
    "3D earns its depth when the structure survives in no 2D projection — the helix; or when height over a grid is the story — the surface.",
    "For surfaces, decide what the reader needs: shape (rotate the surface) or values (read the heatmap contour view).",
    "Never extrude bars into depth: perspective foreshortens exactly the lengths the chart encodes.",
  ],
  quiz: [
    {
      id: "d-05-q1",
      prompt: "3D earns its depth when:",
      options: [
        {
          text: "The structure is genuinely three-variate — visible in no 2D projection, like a helix whose shadows are a circle and two waves",
          correct: true,
          feedback: "Correct — the burden of proof is structural, not aesthetic: projections that hide the structure justify the depth tax.",
        },
        {
          text: "The dataset has three or more columns available",
          correct: false,
          feedback: "Available is not required: a category can facet, a redundant variable can drop — count alone justifies nothing.",
        },
        {
          text: "The audience finds 3D charts more engaging",
          correct: false,
          feedback: "Engagement that costs accuracy is decoration — the preattentive appeal of depth is exactly why it misleads.",
        },
        {
          text: "The charting library renders it attractively by default",
          correct: false,
          feedback: "The renderer's preferences are not a data argument; defaults can extrude a bar chart as easily as a helix.",
        },
      ],
      explanation:
        "The judgment is the lesson: three-variate structure that no projection carries. Everything else — columns present, visual appeal, renderer defaults — is a reason to say no.",
    },
    {
      id: "d-05-q2",
      prompt: "The main perceptual costs of 3D views are:",
      options: [
        {
          text: "Occlusion (marks hide marks) and perspective distortion (lengths and positions foreshorten)",
          correct: true,
          feedback: "Correct — hidden data plus distorted encodings: the two ways a 3D projection silently edits your argument.",
        },
        {
          text: "Longer file load times and slower rendering",
          correct: false,
          feedback: "An engineering cost, not a perceptual one — the reader's retina is the constraint that matters.",
        },
        {
          text: "Color becomes unusable in three dimensions",
          correct: false,
          feedback: "Color works fine in 3D scenes; the costs are geometric — hiding and foreshortening.",
        },
        {
          text: "There are none, since interactive rotation restores all information",
          correct: false,
          feedback: "Rotation converts a glance into a task, and at any single reading angle the hidden is still hidden.",
        },
      ],
      explanation:
        "Occlusion and foreshortening are silent edits: whatever is behind is excluded, whatever is angled is shrunk. Both act on the encoding itself, not the packaging.",
    },
    {
      id: "d-05-q3",
      prompt: "go.Surface(z=Z) is the right instrument when:",
      options: [
        {
          text: "z is a continuous height over an x–y grid — terrain, a response surface, a density's elevation",
          correct: true,
          feedback: "Correct — the surface is the second legitimate 3D structure: height as the whole story over a full grid.",
        },
        {
          text: "You have scattered points in three dimensions with no grid",
          correct: false,
          feedback: "Scattered 3D points are px.scatter_3d's job; go.Surface needs a grid of heights.",
        },
        {
          text: "You want to animate a 2D chart over time",
          correct: false,
          feedback: "Animation is a frame loop over 2D figures — a different mechanism entirely.",
        },
        {
          text: "You want to show a category's share of a total in depth",
          correct: false,
          feedback: "That is a part-to-whole question — pie or stacked bar territory — and depth only distorts the shares.",
        },
      ],
      explanation:
        "go.Surface's contract is a grid: one z for every (x, y) cell. Meet the contract and the surface is honest; want points instead and the express layer's px.scatter_3d is the tool.",
    },
  ],
};
