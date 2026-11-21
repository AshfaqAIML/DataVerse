/**
 * PART D · LESSON d-06 — "Geographic Visualization"
 *
 * Maps: the only chart family where the mark's shape is forced by the
 * world. px.choropleth(locations=, color=, scope=) and px.scatter_geo
 * are the real APIs; geojson + featureidkey joins sub-national shapes;
 * and the classic choropleth trap — shading totals where you should
 * shade rates — is taught on an illustrative support-ticket dataset
 * whose ranking flips completely under normalization.
 */
import type { DataVizLesson } from "@/lib/dataviz/types";

/* Illustrative support-desk data (framed as such in the lesson body):
   tickets and customers per country, chosen so that the total ranking
   and the per-capita ranking disagree as violently as possible. */
const countries = ["Germany", "France", "Netherlands", "Sweden"];
const tickets = [1260, 900, 500, 220];
const customers = [42000, 30000, 4000, 2000];
const ticketsPer1k = tickets.map((t, i) => Math.round((1000 * t) / customers[i]));

export const LESSON_V_D_06: DataVizLesson = {
  slug: "d-06",
  title: "Geographic Visualization",
  minutes: 25,
  summary:
    "Choropleths shade regions; scatter maps place points; both are one px call away. The craft is the join (ISO codes, or geojson + featureidkey), the projection question, and the classic trap: normalizing by population before you shade a single region.",
  tool: "plotly",
  objectives: [
    "Build px.choropleth(locations=, color=, scope=) and px.scatter_geo(lat=, lon=, size=)",
    "Join custom boundaries with geojson and featureidkey when regions are not countries",
    "Treat projection as a design decision — every flat map distorts something",
    "Spot and fix the choropleth trap: normalize by the population at risk before shading",
  ],
  why: "A map is the most persuasive chart you can ship, because its geometry is not chosen — it is the world. Readers trust a shaded map more than any bar chart, which is exactly why it is the most dangerous default in visualization. The danger has a name: the choropleth trap. Shade regions by a total and big, populous regions look hot while small, intense ones vanish — your map redraws reality in proportion to population. The fix is one division (per-capita, per-customer, per-anything-at-risk), and the discipline is asking it before the first region gets painted. Plotly makes the mechanics one call — px.choropleth with locations and color — so the entire lesson is really about what you put in color.",
  blocks: [
    {
      kind: "text",
      text: "Two idioms cover almost every honest map. A **choropleth** shades regions by a value — countries by renewables share, states by turnout — and answers *where is the measure high or low?* A **scatter map** places a point at each location, sized or colored by a value — stores, incidents, customers — and answers *where are the events?* In plotly both are express calls: `px.choropleth(df, locations=, color=)` for the first, `px.scatter_geo(df, lat=, lon=, size=)` for the second. They are not interchangeable: choropleths shade *areas* (and inherit every trap of area), scatter maps mark *places* (and let density do the talking).",
    },
    {
      kind: "code",
      title: "The one-call choropleth",
      code: `import pandas as pd
import plotly.express as px

tickets = pd.DataFrame({
    "country":   ["Germany", "France", "Netherlands", "Sweden"],
    "iso_alpha": ["DEU", "FRA", "NLD", "SWE"],
    "tickets":   [1260, 900, 500, 220],        # illustrative support-desk data
})

fig = px.choropleth(
    tickets,
    locations="iso_alpha",          # ISO-3166 alpha-3 codes join to map shapes
    color="tickets",
    hover_name="country",
    color_continuous_scale=px.colors.sequential.Blues,
    scope="europe",
    title="Support tickets by country (total)",
)
fig.show()`,
      language: "python",
      note: "locations joins your table to the built-in country shapes via ISO codes; color is the shading channel; scope='europe' crops the world to the region at hand. One call, a full map — which is precisely why the question of WHAT to shade must be settled first.",
      produces:
        "A map of Europe shaded by total ticket volume: Germany darkest, Sweden nearly white. (The course engine renders no maps — the two bar charts below show the exact numbers this map shades.)",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "What the map shades: support tickets (total)",
        categories: countries,
        series: [{ name: "tickets", values: tickets }],
        xLabel: "country",
        yLabel: "tickets",
        showValues: true,
        showLegend: false,
      },
      why: "The choropleth's data, honestly drawn as bars — the course engine renders no maps, so here is exactly what the map's blues encode: Germany 1,260 down to Sweden 220. On the map, Germany dominates the frame; the Netherlands and Sweden shrink to slivers.",
    },
    {
      kind: "heading",
      text: "The classic trap",
    },
    {
      kind: "text",
      text: "Now the question that map quietly begged: *should* Germany look worst? Germany has 42,000 customers; Sweden has 2,000. A desk serving twenty-one times the customer base and producing six times the tickets (1,260 vs 220) is not six times worse — it is substantially *better* per customer. Shading by a total conflates **size** with **intensity**; on a map, area is the mark, so big regions automatically look hot. The fix is the oldest move in statistics: normalize by the population at risk.",
    },
    {
      kind: "chart",
      chart: {
        type: "bar",
        title: "The same data, normalized: tickets per 1,000 customers",
        categories: countries,
        series: [{ name: "tickets per 1k customers", values: ticketsPer1k }],
        xLabel: "country",
        yLabel: "tickets per 1,000 customers",
        showValues: true,
        showLegend: false,
        sortDesc: true,
      },
      why: "One division, and the ranking inverts: the Netherlands (125 per 1k) and Sweden (110) top the list while Germany and France tie at 30. The regions that nearly vanished on the total map — small countries, small pixels — are the actual story. Every choropleth owes its reader this chart before its first coat of paint.",
    },
    {
      kind: "code",
      title: "The honest choropleth",
      code: `tickets["tickets_per_1k"] = 1000 * tickets["tickets"] / tickets["customers"]

fig = px.choropleth(
    tickets,
    locations="iso_alpha",
    color="tickets_per_1k",         # the rate, not the total
    hover_name="country",
    color_continuous_scale=px.colors.sequential.Blues,
    scope="europe",
    title="Support tickets per 1,000 customers",
)
fig.show()`,
      language: "python",
      note: "The only change from the trap version is what feeds color: a rate with its denominator in the title. Totals still belong in the hover — context, not shading.",
      produces:
        "The same map, honestly shaded: the Netherlands and Sweden now darkest at 110–125 tickets per 1,000 customers, Germany and France pale at 30 — the opposite verdict.",
    },
    {
      kind: "definition",
      term: "Normalization (rate vs total)",
      informal:
        "Dividing a count by the population that could have produced it — tickets per customer, cases per resident, sales per store — so regions compare intensity, not size.",
      why: "On a choropleth the region's area is already the visual weight; shading by total double-counts size. The rate is the only measure that lets a small region compete on equal ink.",
    },
    {
      kind: "heading",
      text: "Boundaries and projections",
    },
    {
      kind: "text",
      text: "Countries plotly can draw for free; precincts, boroughs and sales territories it cannot. For custom shapes you supply a **GeoJSON** file — a dictionary of geographic features, each carrying a properties bag — and tell plotly how your data's key matches a feature's identifier. That is the `featureidkey` join.",
    },
    {
      kind: "code",
      title: "Custom boundaries: geojson + featureidkey",
      code: `import json

with open("precincts.geojson") as f:
    geo = json.load(f)          # features with properties.precinct

fig = px.choropleth(
    results,
    geojson=geo,
    locations="precinct",                     # the column in YOUR data
    featureidkey="properties.precinct",       # the field in EACH feature
    color="turnout",
)
fig.update_layout(geo=dict(fitbounds="locations"))
fig.show()`,
      language: "python",
      note: "The join contract: for each row, plotly finds the feature whose featureidkey field equals the row's locations value, and shades that feature's polygon. fitbounds=\"locations\" zooms the map to exactly the shapes present.",
      produces:
        "A precinct-level choropleth of turnout with the map cropped to the region's own boundaries — no countries in sight.",
    },
    {
      kind: "text",
      text: "Finally, the **projection question**. A sphere cannot be flattened without lying about something: area, angle, shape or distance must give. Mercator preserves angles (its sailing heritage) but inflates area toward the poles — Greenland draws at Africa's size; a Mercator choropleth literally enlarges the regions at high latitude. For world choropleths the honest default is `projection_type=\"natural earth\"`, which compromises everywhere instead of catastrophically somewhere. Plotly exposes the choice on the geo object — `fig.update_layout(geo=dict(projection_type=\"natural earth\"))` — and the discipline is to make the choice, not inherit it. The same goes for scatter_geo, which also accepts projection= directly.",
    },
    {
      kind: "interpretation",
      id: "d-06-i1",
      chart: {
        type: "bar",
        title: "Support tickets per 1,000 customers",
        categories: countries,
        series: [{ name: "tickets per 1k customers", values: ticketsPer1k }],
        xLabel: "country",
        yLabel: "tickets per 1,000 customers",
        showValues: true,
        showLegend: false,
      },
      prompt:
        "The normalized chart is what the honest choropleth would shade. What does it communicate about the support desk, compared to the totals chart above it?",
      options: [
        {
          text: "The Netherlands and Sweden have the most intense load — 125 and 110 tickets per 1,000 customers — roughly four times Germany's and France's 30, despite being the two smallest markets by total tickets",
          correct: true,
          feedback:
            "Correct — 125 and 110 against 30: a four-fold difference that the totals chart (Germany 1,260 at the top) shows exactly backwards. The small markets are the stressed ones.",
        },
        {
          text: "Germany has the worst support problem, as the totals chart also showed",
          correct: false,
          feedback:
            "Germany's 1,260 tickets serve 42,000 customers — 30 per 1,000, tied with France for the calmest desk. The total said 'biggest'; the rate says 'calmest'.",
        },
        {
          text: "Normalization has erased a real difference — both charts should be shown, so the totals chart is the honest one",
          correct: false,
          feedback:
            "Show both if the question needs both — but intensity was the question ('which desk is stressed?'), and only the rate answers it.",
        },
        {
          text: "The two charts are inconsistent, so one of them must be wrong",
          correct: false,
          feedback:
            "Both are arithmetically true: 1,260/42,000 = 0.030 and 500/4,000 = 0.125. They answer different questions — size versus intensity — and only the second belongs in a choropleth's shading.",
        },
      ],
      explanation:
        "This is the choropleth trap, completed: totals and rates are both true, they rank the regions oppositely, and a map's shading channel must carry the rate if the question is about intensity. The map is the most trusted chart you can ship — which is exactly why it must be normalized.",
    },
    {
      kind: "exercise",
      id: "d-06-e1",
      exerciseKind: "concept-check",
      prompt:
        "A colleague's choropleth shades US states by total sales and carries the headline 'California is our problem market — the West is underperforming'. Before you forward it, what must you check?",
      options: [
        {
          text: "Whether sales are normalized by population or households — California leads totals largely because it has the most people; per-capita shading may move the 'problem' to a small state entirely",
          correct: true,
          feedback:
            "Correct — the totals map measures market size masquerading as market performance. Divide by the population at risk before believing the headline, let alone forwarding it.",
        },
        {
          text: "Nothing — total sales is the standard metric, so the map is fine",
          correct: false,
          feedback: "Standard does not mean safe: on a choropleth, area is already the visual weight, so totals double-count size.",
        },
        {
          text: "Only the color scale — a better palette would make the pattern clearer",
          correct: false,
          feedback: "A prettier palette paints the same trap more attractively; the flaw is in the measure, not the hues.",
        },
        {
          text: "Only the projection — switching from Mercator to Albers fixes area distortion",
          correct: false,
          feedback:
            "Albers does handle area better than Mercator, but the distortion here is in the data (totals vs rates), not the geometry.",
        },
      ],
      explanation:
        "The audit order for any choropleth: is the shaded measure a rate? Then the projection, then the palette. The measure is where the misleading happens, because the map's trustworthiness outruns the total's honesty.",
    },
  ],
  terms: [
    {
      term: "choropleth",
      definition: "A map that shades regions by a value — px.choropleth(locations=, color=, scope=). Inherits area as its mark, so it must shade rates, not totals.",
    },
    {
      term: "GeoJSON join",
      definition: "Plotly's mechanism for custom boundaries: a geojson file of features plus featureidkey, matched to your data's locations column, feature by feature.",
    },
    {
      term: "projection",
      definition: "The flattening of the sphere onto the screen — every projection lies about something. Natural earth is the honest default for world choropleths; Mercator inflates high latitudes.",
    },
  ],
  takeaways: [
    "Two map idioms: choropleths shade regions (where is the measure high?), scatter maps place points (where are the events?).",
    "The choropleth trap: shading by a total lets area masquerade as intensity — normalize by the population at risk before the first coat of paint.",
    "Custom boundaries join through geojson + featureidkey; the contract is one feature's identifier per row's locations value.",
    "Projection is a decision, not a default: every flattening distorts something — choose what yours distorts.",
  ],
  quiz: [
    {
      id: "d-06-q1",
      prompt: "The classic choropleth trap is:",
      options: [
        {
          text: "Shading regions by a total, so populous (or large) regions look hot purely because of size — normalize by the population at risk",
          correct: true,
          feedback: "Correct — area is already the visual weight; a total double-counts it. The rate is the only fair shading.",
        },
        {
          text: "Using too many colors on the map",
          correct: false,
          feedback: "A real risk (palette design matters), but the structural trap precedes the palette — it is in the measure.",
        },
        {
          text: "Choosing the wrong projection for the region",
          correct: false,
          feedback: "The projection question is real (Mercator inflates the north) but it distorts geometry, not the measure being shaded.",
        },
        {
          text: "Forgetting to set scope= to a continent",
          correct: false,
          feedback: "scope is a cropping convenience — an unscoped world map is fine; an unnormalized shading is not.",
        },
      ],
      explanation:
        "The trap is statistical, not cosmetic: totals conflate size with intensity, and the map's trustworthiness then broadcasts the conflation.",
    },
    {
      id: "d-06-q2",
      prompt: "In px.choropleth with custom precinct shapes, how does your data join to the geometry?",
      options: [
        {
          text: "geojson= supplies the features; featureidkey= names the property inside each feature that must match your locations column's values",
          correct: true,
          feedback: "Correct — row by row, plotly finds the feature whose featureidkey field equals the row's locations value and shades that polygon.",
        },
        {
          text: "The locations column must contain latitude and longitude strings",
          correct: false,
          feedback: "Lat/lon are px.scatter_geo's currency; choropleth joins identifiers (ISO codes, or featureidkey matches).",
        },
        {
          text: "Plotly guesses the region from the country name in the title",
          correct: false,
          feedback: "Nothing is inferred from titles — the join is explicit and fails loudly when the keys do not match.",
        },
        {
          text: "You must pre-merge the polygon coordinates into your DataFrame",
          correct: false,
          feedback: "The geometry lives in the geojson; your table stays tabular — the join is declarative, not merged.",
        },
      ],
      explanation:
        "The geojson join's contract: your locations column plus featureidkey, feature by feature. It is the map-world restatement of the database join you already know.",
    },
    {
      id: "d-06-q3",
      prompt: "Why does the projection choice matter for a choropleth?",
      options: [
        {
          text: "Because every flattening of the sphere distorts something — Mercator inflates high-latitude areas, enlarging exactly the regions a choropleth shades",
          correct: true,
          feedback: "Correct — projection distortion multiplies the area-encoding problem choropleths already carry; natural earth is the honest default.",
        },
        {
          text: "It does not — projections only affect the map's colors",
          correct: false,
          feedback: "Projections affect geometry (area, shape, angle); colors are yours alone.",
        },
        {
          text: "Because only one projection can render ISO codes correctly",
          correct: false,
          feedback: "Identifier joins are projection-independent — geometry placement, not data joining, is what the projection decides.",
        },
        {
          text: "Because readers find rotating globes distracting",
          correct: false,
          feedback: "A separate point about interaction — and most choropleths ship flat, which is exactly when projection distortion applies.",
        },
      ],
      explanation:
        "A choropleth encodes value as shaded area; a projection that inflates area inflates the encoding. Choose the distortion you can defend, not the one you inherited.",
    },
  ],
};
