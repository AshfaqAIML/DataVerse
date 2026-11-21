/**
 * Sports analytics projects — SPT-01/02/03.
 */
import type { DapProject } from "@/lib/dap/types";

export const SPORTS_PROJECTS: DapProject[] = [
  /* ================================================================ SPT-01 */
  {
    id: "sports-1",
    categoryId: "sports",
    difficulty: "beginner",
    code: "SPT-01",
    title: "League Season Review",
    subtitle: "One season, three divisions: home advantage, standings and the matches that decided it.",
    summary:
      "A first sports analysis: clean a season of match results, compute home advantage and league tables, profile team strength, and write the season review the club's analysts argue about.",
    hours: 4,
    tools: ["Python", "pandas", "Matplotlib"],
    skills: ["Sports metrics", "League-table computation", "Home-advantage analysis", "Bar charts", "Narrative analysis"],

    businessBackground:
      "The County Football Association runs three divisions and publishes a season review every spring — usually written by a volunteer from memory. This season the FA's data officer has compiled full match results with attendances, and the review's new editor wants it data-backed: the standings computed from results (not copied), home advantage measured properly, the decisive matches identified, and the story of each division told with numbers.",
    problemStatement:
      "Produce the data-backed season review: compute each division's final table from match results; measure home advantage (goals and points); profile team attack/defence; identify title- and relegation-deciding matches; and quantify attendance patterns — delivered as the review's numbers section.",
    businessObjectives: [
      "Compute final league tables (points, goal difference) from raw results and verify against any published table",
      "Measure home advantage: home-win share, home-vs-away goal difference",
      "Profile each team: goals for/against, points-per-game, home/away splits",
      "Identify decisive matches (lead changes, six-pointers) in each division",
      "Analyse attendance: league-wide patterns and the attendance-to-capacity story",
    ],
    datasetDescription:
      "~400 matches across three divisions in one season (a full double round-robin): each row a fixture with home and away teams, goals (with some missing scores), attendance, stadium capacity and referee. Team names have abbreviation variants ('Ashford United' vs 'Ashford Utd'), some attendances exceed capacity (recording errors), scores are missing on a few rows, and duplicates exist. The table computation inherits every cleaning choice — a wrong label merge quietly drops points.",
    dataDictionary: [
      { column: "match_id", kind: "id", description: "Match identifier", example: "481" },
      { column: "league", kind: "categorical", description: "Division", example: "Premier Division" },
      { column: "match_date", kind: "date", description: "Match date", example: "2025-10-04" },
      { column: "home_team", kind: "text", description: "Home team (name variants exist)", example: "Ashford United" },
      { column: "away_team", kind: "text", description: "Away team", example: "Dover Rovers" },
      { column: "home_goals", kind: "integer", description: "Home goals (some missing)", example: "2" },
      { column: "away_goals", kind: "integer", description: "Away goals", example: "1" },
      { column: "attendance", kind: "integer", description: "Match attendance (values above capacity are errors)", example: "17420" },
      { column: "stadium_capacity", kind: "integer", description: "Stadium capacity", example: "20400" },
      { column: "referee", kind: "text", description: "Referee (casing variants)", example: "M. Ellison" },
    ],
    initialQuestions: [
      "What are the final tables, computed from results, and do they match the published ones?",
      "How large is home advantage — in goals and in points — and does it vary by division?",
      "Which teams over- and under-performed their goal difference (the luck lens)?",
      "Which matches decided titles and relegations (lead changes and six-pointers)?",
      "What drives attendance — division, capacity, or the visiting team?",
    ],
    dataset: {
      name: "County FA season results",
      filename: "sports-01-season-results.csv",
      description: "One season of match results across 3 divisions with attendance.",
      rows: 410,
    },

    dataQuality: [
      { issue: "Team name variants", where: "home_team — 'Ashford Utd' vs 'Ashford United'", detection: "nunique teams vs expected 36; sorted unique list", treatment: "Canonical map (this is the analysis's spine: a missed merge drops a team's points)." },
      { issue: "Missing scores", where: "home_goals or away_goals blank (~1.5%)", detection: "isna().sum()", treatment: "Exclude from table computation with a note; unplayed/void fixtures must not count as 0-0." },
      { issue: "Attendance above capacity", where: "attendance > stadium_capacity", detection: "compare columns", treatment: "Recording errors: flag; exclude from attendance analysis or cap with justification — never report 25,000 in a 20,000 stadium." },
      { issue: "Duplicate matches", where: "~14 duplicated rows", detection: "duplicated(['match_id']).sum() and team-pair duplicates", treatment: "Drop by match_id; duplicates double-count points." },
      { issue: "Referee casing", where: "referee — lower-case variants", detection: "value_counts()", treatment: "Canonicalise if analysing referees; cosmetic otherwise." },
    ],
    cleaningPlan: [
      { action: "Build the team canonical map; verify 12 teams per division", rationale: "The table is a groupby over teams — label variants split clubs." },
      { action: "Drop duplicates; exclude missing-score rows from results analysis (counted)", rationale: "Points and goals computed only on played, recorded fixtures." },
      { action: "Derive result columns: home points, away points, goal diff, total goals", rationale: "One derivation drives tables, home advantage and match profiles." },
      { action: "Flag attendance-over-capacity rows for exclusion from attendance analysis", rationale: "Honest attendance metrics need the recording errors out." },
    ],
    edaPlan: [
      { question: "League tables", method: "points and GD by team within division, sorted", expectation: "Champions with clear margins; relegation fights closer." },
      { question: "Home advantage", method: "home-win share; mean home vs away goals; by division", expectation: "~44% home wins vs ~28% away; +0.35 home goal diff; similar across divisions." },
      { question: "Points vs goal difference", method: "scatter of points vs GD by team", expectation: "Two or three teams well off the line — over/under-performers." },
      { question: "Decisive matches", method: "matches between top-two / bottom-three with swing analysis", expectation: "A handful of six-pointers that flipped the title or survival." },
      { question: "Attendance patterns", method: "attendance rate (of capacity) by division and by month", expectation: "Premier Division ~85% fill; spring matches higher; end-of-season dead rubbers dip." },
    ],
    statisticsPlan: [
      { technique: "Home advantage with uncertainty (binomial CI on home-win share)", purpose: "Is the advantage real or noise?", expectation: "CI comfortably above 33% (the three-way even split) — real advantage." },
      { technique: "Points-vs-GD regression residual analysis", purpose: "Identify over/under-performance (the luck lens)", expectation: "Residuals ±6–8 points for the outliers." },
      { technique: "Attendance fill-rate comparison across divisions", purpose: "The commercial story", expectation: "Premier fill-rates ~15–20 points above the Championship divisions." },
    ],
    visualisationPlan: [
      { chart: "Bar — final points by team, one panel per division, GD annotated", answers: "Who won and by what?", reads: "Sorted bars; the margin visible; top/bottom marked." },
      { chart: "Paired bar — home vs away goal difference by team (top division)", answers: "Who feeds on home form?", reads: "Diverging pairs; home-dependent teams visible." },
      { chart: "Scatter — points vs goal difference with the fit line", answers: "Who out-kicked their numbers?", reads: "Off-line teams labelled — the luck lens." },
      { chart: "Bar — attendance fill-rate by division", answers: "What do fans turn up for?", reads: "Division comparison with rates labelled." },
      { chart: "Line — mean goals per match by month", answers: "When do the goals flow?", reads: "Season shape; late-season defensive football visible." },
    ],
    findings: [
      "Home advantage is real and material: hosts win ~44% of matches to visitors' ~28%, with a +0.35-goal average margin — worth roughly two-thirds of a point per home match across all three divisions.",
      "Each division's champion won by a clear margin, but the relegation fights came down to the last fortnight — and in the Championship North, a single six-pointer in March flipped the drop on head-to-head.",
      "Two teams finished 6+ points above their goal-difference expectation (clinical finishing or fine margins), while one relegated side under-performed its numbers by a similar margin — the season's quiet injustice.",
      "Attendance tracks division and stakes: Premier Division grounds run ~85% full while the Championship divisions sit near 65%, and end-of-season dead rubbers dip measurably in all three.",
      "The attendance recording errors (over-capacity figures on a handful of fixtures) would have inflated the season's headline attendance by ~2% if left in — the review now reports the corrected figure.",
    ],
    recommendations: [
      { what: "Publish the corrected attendance series and add a validation rule (attendance ≤ capacity) to the results system", why: "A 2% headline inflation from recording errors is a credibility issue for a public review.", impact: "Reporting integrity", horizon: "immediate" },
      { what: "Adopt the points-vs-GD luck lens as a standing review feature", why: "It reliably surfaces the season's best stories (the clinical over-performers, the unlucky relegated).", impact: "Better reviews, free narrative", horizon: "immediate" },
      { what: "Investigate the home-advantage gap by club before next season (facilities, travel, scheduling)", why: "Advantage varies by club within divisions; the biggest gaps are the cheapest wins.", impact: "Potential points on the board", horizon: "this quarter" },
      { what: "Schedule the final-round fixtures to maximise simultaneous kickoffs in relegation groups", why: "The season's drama (and attendance) concentrated in the six-pointers; the calendar can compound it.", impact: "Competitive integrity and gate revenue", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "The data-backed review confirms the folklore and corrects the record. Home advantage is real — hosts win ~44% to visitors' ~28%, worth roughly two-thirds of a point per home match — and varies enough by club to be a competitive lever. The tables compute cleanly from results once team-name variants and fourteen duplicate rows are resolved; the luck lens (points vs goal difference) flags two clinical over-performers and one hard-luck relegated side worth their own articles. Attendance runs ~85% of capacity in the Premier Division against ~65% below, dips on dead rubbers, and was overstated by ~2% until the over-capacity recording errors were excluded. The review publishes corrected numbers with the methods appendix attached.",
      structure: [
        "1. Objective and methods (table computation, exclusions)",
        "2. Data and quality treatment",
        "3. Final tables by division",
        "4. Home advantage measured",
        "5. The luck lens: points vs goal difference",
        "6. Decisive matches and relegation drama",
        "7. Attendance patterns (corrected)",
        "8. Recommendations for next season's review and calendar",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Meet the results file",
        goal: "Load, profile, and start the team-name canonicalisation.",
        instructions: [
          "Profile; count unique teams (expect 36: 12 per division); list any near-duplicate names.",
          "Check score completeness and duplicates on match_id.",
          "Confirm the league structure: double round-robin within each division (each pair meets twice).",
        ],
        hints: [
          "Team-name variants are the classic results-file defect: sorted(team.unique()) next to the official club list exposes them fast.",
          "Points: win 3, draw 1 — derive once, reuse for tables, home advantage and match profiles.",
          "Round-robin check: each division should have 12 × 22 / 2 = 132 matches — count and compare.",
        ],
        checkpoint: "Team list canonicalised, structure verified, defects catalogued.",
        code: {
          label: "Profile the results",
          language: "python",
          source: `import pandas as pd

df = pd.read_csv("sports-01-season-results.csv", parse_dates=["match_date"])
teams = pd.concat([df["home_team"], df["away_team"]]).unique()
print(len(teams), "teams"); print(sorted(teams)[:8])
print("missing scores:", df[["home_goals", "away_goals"]].isna().any(axis=1).sum())
print("dupes:", df.duplicated("match_id").sum())
print(df.groupby("league")["match_id"].count())`,
        },
      },
      {
        phase: "quality",
        title: "Audit the fixtures",
        goal: "Name variants, missing scores, attendance errors, duplicates — each counted.",
        instructions: [
          "Build the team canonical map; verify team counts per division.",
          "Quantify missing scores, attendance-over-capacity rows, duplicates.",
          "Write the audit table with the treatment decisions.",
        ],
        hints: [
          "The map is small (a handful of variants) and load-bearing — test it by asserting 12 teams per division after mapping.",
          "Missing scores: exclude from results analysis; the FA should know which fixtures went unrecorded.",
          "Over-capacity attendance: keep the row for results, exclude from attendance metrics — two different truths from one row.",
        ],
        checkpoint: "The audit table with the canonical map verified.",
      },
      {
        phase: "cleaning",
        title: "Build the results frame",
        goal: "Clean fixtures with points derived and attendance flags.",
        instructions: [
          "Apply the map and fixes; derive home/away points, goal difference, total goals.",
          "Flag valid-attendance rows; verify each division's match count.",
          "Snapshot the played-fixtures count per division — the tables' denominators.",
        ],
        hints: [
          "Derivations: home_pts = 3/1/0 by comparison, away_pts the mirror; gd_home = home_goals − away_goals.",
          "The played count per division is the integrity check: 132 expected, fewer means excluded fixtures to disclose.",
          "One canonical results frame feeds every later analysis — build it once, audit it, reuse it.",
        ],
        checkpoint: "The results frame with derived points and audit counts.",
        code: {
          label: "Results frame",
          language: "python",
          source: `TEAM_MAP = {"Ashford Utd": "Ashford United"}  # extend from your audit
clean = df.drop_duplicates("match_id").copy()
for col in ["home_team", "away_team"]:
    clean[col] = clean[col].replace(TEAM_MAP)

played = clean.dropna(subset=["home_goals", "away_goals"]).copy()
played["home_pts"] = (played.home_goals > played.away_goals) * 3 + (played.home_goals == played.away_goals)
played["away_pts"] = (played.away_goals > played.home_goals) * 3 + (played.home_goals == played.away_goals)
played["attendance_valid"] = played["attendance"] <= played["stadium_capacity"]
print(played.groupby("league")["match_id"].count())`,
        },
      },
      {
        phase: "eda",
        title: "Tables, advantage and stories",
        goal: "Compute the tables; measure home advantage; find the luck lens.",
        instructions: [
          "Compute points and GD by team per division (long format: stack home/away contributions).",
          "Home advantage: home-win share, mean goals home/away, by division.",
          "Points vs GD scatter per division; label the outliers.",
        ],
        hints: [
          "Long-format trick: pd.concat([home-frame, away-frame]) then one groupby does the table — resist 40 lines of manual arithmetic.",
          "Home-win share needs its complement (draws) reported too: 44/28 leaves 28% draws — the full picture.",
          "The luck lens is a one-line regression (points ~ GD) with residuals — the review's best story generator.",
        ],
        checkpoint: "Tables computed, home advantage quantified, luck outliers labelled.",
        code: {
          label: "League table",
          language: "python",
          source: `home = played[["league", "home_team", "home_pts", "home_goals", "away_goals"]].rename(
    columns={"home_team": "team", "home_pts": "pts", "home_goals": "gf", "away_goals": "ga"})
away = played[["league", "away_team", "away_pts", "away_goals", "home_goals"]].rename(
    columns={"away_team": "team", "away_pts": "pts", "away_goals": "gf", "home_goals": "ga"})
long = pd.concat([home, away])
table = long.groupby(["league", "team"]).agg(
    pts=("pts", "sum"), gf=("gf", "sum"), ga=("ga", "sum"), ppg=("pts", "mean")).reset_index()
table["gd"] = table.gf - table.ga
print(table.sort_values(["league", "pts"], ascending=[True, False]).groupby("league").head(3))`,
        },
      },
      {
        phase: "statistics",
        title: "Make the claims safe",
        goal: "Home-advantage CI, luck residuals, attendance comparison.",
        instructions: [
          "Binomial CI on home-win share — is the advantage beyond noise?",
          "Fit points ~ GD per division; extract and rank residuals.",
          "Attendance fill-rate comparison across divisions with a simple test.",
        ],
        hints: [
          "The three-way null is 33.3% each — the CI test is against that, not against 50%.",
          "Residuals of ±6 points on 42 matches are season-shaping — name the teams and check their results narrative.",
          "Fill rate = attendance/capacity on valid rows only; report division means with a spread measure.",
        ],
        checkpoint: "The advantage CI, the luck table, the attendance comparison.",
      },
      {
        phase: "visualisation",
        title: "The review's exhibits",
        goal: "Five charts: tables, home/away splits, luck scatter, attendance, goals curve.",
        instructions: [
          "Points bars per division (GD annotated); home/away GD pairs; luck scatter with fit; fill-rate bars; monthly goals line.",
          "Title charts with takeaways ('Hosts win 44% — worth two-thirds of a point a match').",
          "Mark the over-performers on the scatter by name.",
        ],
        hints: [
          "Table bars: one panel per division, top and bottom three highlighted for the title/relegation stories.",
          "The luck scatter with fitted line and labelled residuals is the chart readers share.",
          "Attendance bars ordered by fill rate with the division means labelled.",
        ],
        checkpoint: "Five exhibits with the luck scatter polished.",
      },
      {
        phase: "interpretation",
        title: "Write the season story",
        goal: "Findings that become the review's prose.",
        instructions: [
          "Answer the five questions with figures; convert the luck outliers into narrative hooks.",
          "Identify the decisive matches concretely (dates, scores, swing) for the drama section.",
          "Note what the results file cannot answer (form, injuries, refereeing bias beyond counts).",
        ],
        hints: [
          "Decisive-match identification: find the last lead change date per division and the direct six-pointers among the relevant clubs.",
          "The luck lens phrasing: 'finished X points clear of what their goal difference predicts — clinical, fortunate, or both.'",
          "Sports readers want the number AND the story — give each finding a one-line hook.",
        ],
        checkpoint: "Five answered questions with narrative hooks attached.",
      },
      {
        phase: "recommendations",
        title: "The review's action list",
        goal: "Publication integrity, calendar and analysis features.",
        instructions: [
          "Recommend the corrected attendance series, the luck-lens feature, the home-advantage investigation and the calendar change.",
          "Each with its evidence and its owner (FA office, clubs, scheduler).",
          "Keep the tone editorial-friendly: these feed a publication, not a board.",
        ],
        hints: [
          "The validation rule (attendance ≤ capacity) is a one-line systems fix with a credibility payoff.",
          "The home-advantage-by-club investigation is next season's analytical hook — set it up now.",
          "Calendar recommendations should note the trade-off (drama vs travel logistics) — sports governance loves both.",
        ],
        checkpoint: "The action list with evidence and owners.",
      },
      {
        phase: "report",
        title: "The season review's numbers section",
        goal: "A publication-ready numbers section with methods transparency.",
        instructions: [
          "Structure: methods box → tables → home advantage → luck lens → drama → attendance → actions.",
          "Every table states its exclusions (unrecorded fixtures, invalid attendances).",
          "Keep the prose tight; the review's writers will build around your numbers.",
        ],
        hints: [
          "The methods box is short and non-negotiable: how tables were computed, what was excluded, why attendance was corrected.",
          "Editors quote one number per section — make sure it's the right one (home-win share, fill rate, the luck residual).",
          "Date-stamp and archive the script: next season's review starts from this one.",
        ],
        checkpoint: "The numbers section, every figure traceable to the notebook.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the FA's data analyst. Produce the season review's numbers section: tables computed from results, home advantage measured, the luck lens, decisive matches and corrected attendance. Team mapping and exclusion rules are yours — documented in the methods box.",
      deliverables: [
        "Results audit with the team canonical map",
        "Final tables computed from results (with exclusion disclosure)",
        "Home-advantage analysis with uncertainty",
        "The points-vs-GD luck analysis with named outliers",
        "Attendance analysis on validated rows with the correction quantified",
      ],
      guardrails: [
        "Team variants fully mapped (division counts asserted)",
        "Missing scores excluded, never treated as 0-0",
        "Attendance analysis excludes over-capacity recording errors",
        "Every published table states its denominator",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Table computed via long-format stacking (both home and away contributions)",
        "Points derivation correct for wins and draws",
        "Home-advantage CI tested against the three-way null",
      ],
      "code-quality": [
        "One results frame reused for all analyses",
        "Team map asserted (12 per division)",
      ],
      reasoning: [
        "Luck lens interpreted with appropriate hedging",
        "Decisive matches identified concretely with swing logic",
      ],
      visualization: [
        "Tables shown as sorted bars with GD context",
        "Luck scatter with fitted line and labelled residuals",
      ],
      interpretation: [
        "Home advantage translated into points language",
        "Attendance correction quantified and explained",
      ],
      recommendations: [
        "Systems fix (validation rule) included",
        "Editorial actions (luck lens, calendar) feasible and owned",
      ],
    },
  },

  /* ================================================================ SPT-02 */
  {
    id: "sports-2",
    categoryId: "sports",
    difficulty: "intermediate",
    code: "SPT-02",
    title: "Player Efficiency & Lineup Analysis",
    subtitle: "Eleven thousand boxscore lines: separate usage from efficiency, and find the lineups that work.",
    summary:
      "Basketball analytics: clean player-match boxscores, build efficiency metrics that respect roles, analyse usage-efficiency trade-offs and rest effects, and identify the lineup combinations that outperform.",
    hours: 10,
    tools: ["Python", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    skills: ["Per-possession metrics", "Role-aware comparison", "Usage-efficiency analysis", "Lineup analysis", "Coaching recommendations"],

    businessBackground:
      "The Aurora Falcons, a professional basketball franchise, run their rotation on coaching instinct and per-game points — and the analytics-leaning head coach suspects both are lying to him: high-minute players accumulate counting stats, bench scorers look inefficient on raw numbers, and nobody can say which five-man lineups actually outscore opponents. The team's boxscore data (every player's every match) is now assembled, and the coach wants role-aware efficiency, usage-efficiency trade-offs, and the lineup analysis done properly.",
    problemStatement:
      "Analyse player efficiency and lineups from a season of boxscores: per-minute and per-possession metrics that respect roles; the usage-efficiency relationship (who sustains production at high usage?); rest and starter effects; and the five-man lineup combinations with genuine outscoring evidence — delivered as a coaching-staff-ready analysis.",
    businessObjectives: [
      "Build per-minute and rate-based efficiency metrics (points per minute, shooting efficiency, assist-to-turnover) by player and position",
      "Analyse the usage-efficiency relationship and identify who sustains scoring at volume",
      "Quantify starter vs bench and rest-day effects",
      "Identify the most-used and best-performing lineups (with sample-size honesty)",
      "Deliver rotation and lineup recommendations the coaching staff can act on",
    ],
    datasetDescription:
      "~11,000 player-match boxscore lines across a season: each row a player's performance in one match with minutes, points, shooting, assists, turnovers, fouls, starter flag and rest days. Minutes include impossible values (over 48), points are missing on some rows, positions have typos, duplicate player-match lines exist, and rest days include impossible negatives. Rate metrics and lineup analysis inherit every choice — the cleaning is the methodology.",
    dataDictionary: [
      { column: "match_id", kind: "id", description: "Match identifier", example: "4182" },
      { column: "player_id", kind: "id", description: "Player identifier", example: "146" },
      { column: "player", kind: "text", description: "Player name", example: "Casey Silva" },
      { column: "position", kind: "categorical", description: "Position (typos exist)", example: "SG" },
      { column: "team", kind: "categorical", description: "Player's team", example: "Aurora Falcons" },
      { column: "opponent", kind: "text", description: "Opponent", example: "Cobalt Kings" },
      { column: "minutes", kind: "integer", description: "Minutes played (values >48 exist)", example: "34" },
      { column: "points", kind: "integer", description: "Points scored (some missing)", example: "21" },
      { column: "shots", kind: "integer", description: "Shot attempts", example: "15" },
      { column: "shots_on_target", kind: "integer", description: "Shots on target", example: "9" },
      { column: "assists", kind: "integer", description: "Assists", example: "5" },
      { column: "turnovers", kind: "integer", description: "Turnovers", example: "3" },
      { column: "fouls", kind: "integer", description: "Fouls", example: "2" },
      { column: "is_starter", kind: "boolean", description: "Started the match", example: "1" },
      { column: "rest_days", kind: "integer", description: "Days since last match (negatives exist)", example: "1" },
    ],
    initialQuestions: [
      "Who are the most efficient scorers per minute, and how does that differ from raw points leaders?",
      "What is the usage-efficiency relationship — who sustains efficiency at high shot volume?",
      "How do starter status and rest days affect performance?",
      "Which five-man lineups have genuine outscoring evidence, at what sample sizes?",
      "What rotation changes does the evidence support for the playoffs?",
    ],
    dataset: {
      name: "Falcons boxscores",
      filename: "sports-02-player-match-stats.csv",
      description: "A season of player-match boxscore lines for 8 teams.",
      rows: 11000,
    },

    dataQuality: [
      { issue: "Impossible minutes", where: "minutes > 48", detection: "(df['minutes'] > 48).sum()", treatment: "Exclude from rate analysis (counted) — overtime exists but 60-minute lines are data errors; check the match context if ambiguous." },
      { issue: "Missing points", where: "points — ~1.2% of lines", detection: "isna().sum()", treatment: "Exclude affected lines from scoring analysis (keep for minutes/lineup context); counted." },
      { issue: "Duplicate player-match lines", where: "~0.8% duplicated (match_id, player_id)", detection: "duplicated(['match_id','player_id']).sum()", treatment: "Drop — duplicates double-count a player's night; the analysis grain's integrity check." },
      { issue: "Position typos", where: "position — 'sg'/'SG' and stray labels", detection: "value_counts()", treatment: "Canonicalise to the five positions; unknown to 'NA' with a flag." },
      { issue: "Negative rest days", where: "rest_days < 0", detection: "(df['rest_days'] < 0).sum()", treatment: "Impossible: exclude from rest analysis (counted)." },
      { issue: "Shooting consistency", where: "shots_on_target > shots", detection: "compare columns", treatment: "Data errors: swap or exclude after inspection; efficiency metrics depend on the pair being coherent." },
    ],
    cleaningPlan: [
      { action: "Enforce the (match, player) grain; canonicalise positions", rationale: "One line per player per match, five clean positions." },
      { action: "Exclude impossible minutes and negative rest from rate analyses (counted)", rationale: "Rate metrics are ratios — one impossible value poisons them." },
      { action: "Repair or exclude incoherent shooting pairs", rationale: "Efficiency metrics need shots ≥ makes ≥ 0." },
      { action: "Derive rate metrics: points per minute, points per shot, assist-to-turnover, usage (shots per minute)", rationale: "The role-aware metric family that makes comparisons honest." },
    ],
    edaPlan: [
      { question: "Minutes and usage landscape", method: "minutes distribution; shots per minute by position", expectation: "Starters 28–36 minutes; usage differs by position (guards higher)." },
      { question: "Efficiency leaders", method: "points per minute (min minutes filter) vs raw points", expectation: "The two leaderboards differ materially — the counting-stats lie." },
      { question: "Usage-efficiency curve", method: "scatter of usage vs points-per-shot by player (min sample)", expectation: "Declining curve with exceptions — the high-usage sustainers are the stars." },
      { question: "Starter and rest effects", method: "per-minute output by starter flag; by rest-day bucket", expectation: "Bench players slightly more efficient per minute (lower usage); 3+ rest days modestly better." },
      { question: "Lineup landscape", method: "most frequent five-man units and their point differentials", expectation: "A few heavy-usage units with positive differentials; small-N tail needs honesty." },
      { question: "Match context", method: "output vs opponent strength proxy", expectation: "Efficiency dips against top teams — context for the playoff recommendation." },
    ],
    statisticsPlan: [
      { technique: "Rate-metric comparison with minimum-sample filters", purpose: "Efficiency rankings that resist small-N noise", expectation: "Leaderboards stabilise above ~300 career minutes in-window." },
      { technique: "Usage-efficiency regression (per-possession output ~ usage, quadratic)", purpose: "Estimate the trade-off curve and find over/under-performers", expectation: "Significant negative slope with a quadratic term; two players sit clearly above the curve." },
      { technique: "Rest-effect comparison (within-player, matched minutes)", purpose: "Separate rest from rotation composition", expectation: "Small positive rest effect, mostly through shooting efficiency." },
      { technique: "Lineup differential with shrinkage (simple plus-minus vs minutes-weighted baseline)", purpose: "Lineup evidence that respects sample size", expectation: "Two lineups retain genuinely positive differentials after shrinkage." },
    ],
    visualisationPlan: [
      { chart: "Scatter — usage vs points per shot, sized by minutes (the trade-off map)", answers: "Who sustains efficiency at volume?", reads: "The declining cloud with the above-curve stars labelled." },
      { chart: "Bar — per-minute scoring leaders vs raw-points leaders (paired)", answers: "How do rate and counting views differ?", reads: "Two leaderboards, different names — the counting-stats lie visible." },
      { chart: "Box plot — per-minute output by rest-day bucket", answers: "Does rest matter?", reads: "Medians rising modestly with rest; spread always wide." },
      { chart: "Scatter — lineup point differential per minute vs minutes played (with shrinkage line)", answers: "Which lineups are real?", reads: "Units above the line at high minutes = the rotation's core." },
      { chart: "Heatmap — efficiency by position × starter status", answers: "Where does the rotation hold and leak?", reads: "Cells annotate per-minute output; bench backcourt visible." },
    ],
    findings: [
      "Raw points and per-minute efficiency tell different stories: three of the top five per-minute scorers come off the bench at low usage — the rotation's hidden value that counting stats hide.",
      "The usage-efficiency curve is real and declining: points per shot falls with volume for most players, but two Falcons sustain near-elite efficiency at high usage — the roster's irreplaceable core.",
      "Rest matters modestly: three-plus days of rest lifts shooting efficiency visibly within players, mostly through better shot quality rather than volume.",
      "Two five-man lineups hold genuinely positive point differentials at meaningful minutes; several fan-favourite units look good only against weak opposition (opponent-adjusted views collapse their numbers).",
      "The starter-bench efficiency gap is concentrated in the frontcourt: bench guards outperform per minute, while bench big men struggle — the rotation's asymmetry that lineup changes should respect.",
    ],
    recommendations: [
      { what: "Increase the high-efficiency bench guards' minutes into the 24–28 range, staggering them with the stars' rest", why: "Per-minute value is real and currently capped by rotation habit; staggering preserves lineup balance.", impact: "Projected +2–4 points per 100 possessions", horizon: "immediate" },
      { what: "Anchor the playoff rotation on the two positive-differential lineups, with the opponent-adjusted view as the tiebreaker", why: "Lineup evidence survives shrinkage for exactly two units — the rotation's proven core.", impact: "Evidence-based closing lineups", horizon: "this quarter" },
      { what: "Front-load rest for the two high-usage stars before the playoff stretch (schedule permits)", why: "The rest effect is measurable and the stars' minutes are the constraint on it.", impact: "Efficiency lift when it matters most", horizon: "this quarter" },
      { what: "Target frontcourt depth in the next transfer window", why: "The rotation's asymmetry is positional: bench guards thrive, bench bigs don't — the fix is a signing, not a scheme.", impact: "Closes the rotation's structural gap", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "The rotation is leaving points on the bench. Per-minute efficiency rewrites the leaderboard: three of the five most efficient scorers are bench guards whose minutes are capped by habit rather than performance, and the frontcourt — not the backcourt — is where the bench leaks. Two lineup combinations hold genuinely positive differentials at meaningful minutes and should anchor playoff closing rotations. The usage-efficiency curve confirms the obvious (volume is expensive) and the precious: two stars sustain elite efficiency at high usage, and rest measurably lifts their shooting — schedule it before the playoffs. The counting-stats rotation dies here; the rate-based one adds a projected 2–4 points per 100 possessions.",
      structure: [
        "1. The coaching question and metric definitions",
        "2. Data and quality treatment (grain, exclusions)",
        "3. Efficiency leaders: rate vs counting views",
        "4. The usage-efficiency curve and the sustainers",
        "5. Rest and starter effects",
        "6. Lineup analysis with sample-size honesty",
        "7. Rotation and lineup recommendations",
        "8. Appendix: metric formulas, cleaning log, full tables",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Own the grain and the metric family",
        goal: "One row per player-match; rate metrics defined before computing.",
        instructions: [
          "Verify the (match, player) grain; catalogue the defects (impossible minutes, missing points, dupes).",
          "Define the metric family: points per minute, points per shot, usage (shots per minute), assist-to-turnover — write the formulas down.",
          "Note the analysis's honesty rule: rate comparisons need minimum-minutes filters.",
        ],
        hints: [
          "duplicated(['match_id','player_id']) is the grain check — resolve before anything.",
          "Rate metrics are the whole point: counting stats reward minutes; rates reveal value. But rates on 40 minutes are noise — the min-filter is not optional.",
          "Usage and efficiency are the two axes of the player map — define both early.",
        ],
        checkpoint: "Grain verified, formulas written, min-filter thresholds set.",
        code: {
          label: "Grain and metrics setup",
          language: "python",
          source: `df = pd.read_csv("sports-02-player-match-stats.csv")
print("dupes at grain:", df.duplicated(["match_id", "player_id"]).sum())
print("minutes > 48:", (df["minutes"] > 48).sum())
print("missing points:", df["points"].isna().sum())
print(df["position"].value_counts(dropna=False))`,
        },
      },
      {
        phase: "quality",
        title: "Audit the boxscores",
        goal: "Six defect families with rate-metric consequences stated.",
        instructions: [
          "Quantify each defect; note which metric each corrupts.",
          "Inspect shooting-incoherence rows (on-target > attempts) before repairing.",
          "Write the audit table.",
        ],
        hints: [
          "Shooting pairs: if on_target ≤ shots is violated, either swap (transposed entry) or exclude — inspect a few rows to decide.",
          "Impossible minutes: check whether the match went to overtime before excluding; 48+ needs context.",
          "Every exclusion here is an exclusion from RATIOS — the counts table keeps the rows honest.",
        ],
        checkpoint: "The audit table with per-defect metric consequences.",
      },
      {
        phase: "cleaning",
        title: "Build the rate frame",
        goal: "Clean player-match lines with derived rate metrics.",
        instructions: [
          "Apply treatments; derive the metric family per line; aggregate to player level with minutes filters.",
          "Verify: no negative rates; minutes filters stated per table.",
          "Build the player summary: totals, rates, games, minutes.",
        ],
        hints: [
          "Player-level aggregation: sum the components, THEN take ratios — never average per-game rates (the minutes-weighting trap).",
          "p['ppm'] = p['points'] / p['minutes'] on summed values is correct; mean of per-game ppm is not.",
          "State the min-minutes threshold (e.g., 200) beside every leaderboard.",
        ],
        checkpoint: "The player summary with correct rate aggregation.",
        code: {
          label: "Player summary",
          language: "python",
          source: `clean = df.drop_duplicates(["match_id", "player_id"]).copy()
clean = clean[(clean["minutes"] <= 48) & (clean["rest_days"] >= 0)]
clean["points"] = clean["points"].fillna(0)

p = clean.groupby(["player_id", "player", "team", "position"]).agg(
    games=("match_id", "count"), minutes=("minutes", "sum"),
    points=("points", "sum"), shots=("shots", "sum"),
    sot=("shots_on_target", "sum"), assists=("assists", "sum"),
    to=("turnovers", "sum")).reset_index()
p["ppm"] = p["points"] / p["minutes"]
p["pps"] = p["points"] / p["shots"]
p["usage"] = p["shots"] / p["minutes"] * 36  # per-36-minute usage
print(p[p["minutes"] > 200].nlargest(5, "ppm")[["player", "ppm", "minutes"]])`,
        },
      },
      {
        phase: "eda",
        title: "The efficiency landscape",
        goal: "Rate vs counting leaders, the usage-efficiency curve, rest and starter effects.",
        instructions: [
          "Two leaderboards: raw points vs ppm (min 200 minutes) — the counting-stats lie made visible.",
          "Usage vs pps scatter with the curve sketched; label the above-curve players.",
          "Per-minute output by starter flag and rest bucket (within-player for rest).",
        ],
        hints: [
          "The paired-leaderboard exhibit is the coaching staff's first surprise — build it early.",
          "The usage-efficiency scatter with a smoothed fit (or quadratic regression later) is the analysis's centrepiece.",
          "Within-player rest analysis: group by player, compare their output at 0-1 vs 3+ rest — controls for role.",
        ],
        checkpoint: "Leaderboards built, curve sketched, rest and starter effects quantified.",
      },
      {
        phase: "statistics",
        title: "Curve, rest and lineup evidence",
        goal: "Regression on the trade-off; within-player rest test; lineup shrinkage.",
        instructions: [
          "Fit pps ~ usage + usage² at player level; extract over/under-performers as residuals.",
          "Within-player rest comparison (matched minutes, two rest buckets).",
          "Lineup differentials with a shrinkage baseline (regress per-minute differential toward league mean by minutes played).",
        ],
        hints: [
          "Lineup construction: the boxscore data has players per match, not per-possession units — approximate lineups by co-appearance sets (starter-flag five-man units per match) and be explicit that it's an approximation.",
          "Shrinkage: adjusted = (diff * minutes / (minutes + k)) + league_mean * (k / (minutes + k)) with a stated k (e.g., 150 minutes) — the sample-size honesty made arithmetic.",
          "The regression residual table names the players to build around — that's the coaching deliverable.",
        ],
        checkpoint: "Curve fit, rest test, adjusted lineup table.",
        code: {
          label: "Usage curve",
          language: "python",
          source: `import statsmodels.formula.api as smf

q = p[p["minutes"] > 200].copy()
m = smf.ols("pps ~ usage + I(usage ** 2)", data=q).fit()
q["resid"] = m.resid
print(q.nlargest(5, "resid")[["player", "usage", "pps", "resid"]].round(3))
print(m.summary().tables[1])`,
        },
      },
      {
        phase: "visualisation",
        title: "The coaching exhibits",
        goal: "Five charts: trade-off map, paired leaderboards, rest boxes, lineup scatter, position heatmap.",
        instructions: [
          "Build the five; the trade-off map and lineup scatter carry the argument.",
          "Label the above-curve players and the surviving lineups by name.",
          "Annotate min-minutes and shrinkage thresholds — honesty ON the chart.",
        ],
        hints: [
          "Trade-off map: x usage, y pps, size minutes, colour position — the four-axis exhibit coaches study.",
          "Lineup scatter: x minutes, y adjusted differential, with the zero line and the k threshold marked.",
          "The paired-leaderboard chart wants equal-width panels so the name mismatches pop.",
        ],
        checkpoint: "Five exhibits, trade-off map polished.",
      },
      {
        phase: "interpretation",
        title: "Translate to the rotation",
        goal: "Findings in coaching language with roles respected.",
        instructions: [
          "Answer the five questions; every claim carries its sample size and threshold.",
          "Separate what the boxscores support from what needs tracking data (lineup causality, defensive impact).",
          "Draft the rotation paragraph: who gains minutes, which lineups close, who rests.",
        ],
        hints: [
          "Coaching language: 'points per 100 possessions' and 'per-minute' — avoid per-game framing entirely.",
          "Boxscore limits: no defensive impact, no lineup causality (who shares the court with whom is chosen) — say so before the coach's assistant does.",
          "The rotation paragraph names names and numbers: bench guards to 24–28 minutes, two lineups as closers, stars rested pre-playoffs.",
        ],
        checkpoint: "Five answered questions in coaching language with limits stated.",
      },
      {
        phase: "recommendations",
        title: "The rotation package",
        goal: "Rotation, lineups, rest plan and the transfer note.",
        instructions: [
          "Recommend the minutes reallocation, the closing lineups, the rest plan and the frontcourt-depth signing.",
          "Each with its evidence and expected effect.",
          "Include the measurement plan: which numbers decide whether the changes worked.",
        ],
        hints: [
          "Expected effects in per-100-possession language with ranges from the residuals and lineup differentials.",
          "The transfer recommendation is the long-term item — flag it for the next window, not the playoff run.",
          "Measurement: bench-guards' ppm at higher minutes (does efficiency survive volume?), lineup differentials in the new rotation.",
        ],
        checkpoint: "The package with evidence, effects and measurement plan.",
      },
      {
        phase: "report",
        title: "The rotation analysis",
        goal: "A coaching-staff-ready analysis: numbers with names, honesty on every chart.",
        instructions: [
          "Follow the outline; open with the counting-stats finding (it reframes the whole rotation).",
          "Metric-formula box in the body — the staff must know what ppm and usage mean.",
          "Close with the rotation package and the measurement plan.",
        ],
        hints: [
          "The one-liner: 'The rotation is leaving points on the bench and closing with the wrong lineups.'",
          "Coaches argue with numbers that hide their thresholds — put min-minutes and shrinkage k ON the charts.",
          "Reproducibility appendix: the staff's analyst will re-run this monthly.",
        ],
        checkpoint: "The complete analysis, reproducible from the boxscore CSV.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the Falcons' analyst. Give the head coach the role-aware efficiency picture, the usage-efficiency map, rest effects and honest lineup evidence — and the rotation changes they support. Metric definitions, thresholds and lineup-approximation method are yours, documented.",
      deliverables: [
        "Boxscore audit with grain enforcement and exclusions",
        "Rate-metric player summary (formulas stated, min-sample filters)",
        "Usage-efficiency analysis with over/under-performers named",
        "Within-player rest and starter analyses",
        "Rotation package: minutes reallocation, closing lineups, rest plan, measurement plan",
      ],
      guardrails: [
        "Ratios computed from summed components, never averaged per-game rates",
        "Lineup analysis states its co-appearance approximation and shrinkage",
        "Sample-size thresholds on every leaderboard and chart",
        "Boxscore limits (no defensive impact, no lineup causality) stated",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Rate metrics from aggregated components (minutes-weighted)",
        "Usage-efficiency model interpretable; residuals extracted for ranking",
        "Lineup shrinkage arithmetic shown with stated k",
      ],
      "code-quality": [
        "Grain checks and assertions in place",
        "Player summary built once, reused",
      ],
      reasoning: [
        "Rate vs counting distinction maintained throughout",
        "Lineup evidence bounded by its approximation",
      ],
      visualization: [
        "Trade-off map with labelled over-performers",
        "Thresholds (min minutes, k) visible on charts",
      ],
      interpretation: [
        "Frontcourt/backcourt rotation asymmetry articulated",
        "Rest effect bounded (modest, shooting-driven)",
      ],
      recommendations: [
        "Minutes changes specific with expected per-100 effects",
        "Measurement plan for whether changes worked",
      ],
    },
  },

  /* ================================================================ SPT-03 */
  {
    id: "sports-3",
    categoryId: "sports",
    difficulty: "advanced",
    code: "SPT-03",
    title: "Transfer Value & Performance Modelling",
    subtitle: "Three seasons of player metrics and fees: what does a footballer's performance actually cost?",
    summary:
      "Football analytics with money on the line: build a player-season panel, model performance (age curves, underlying metrics) and transfer value, price the age curve, and recommend which transfer targets the data supports.",
    hours: 15,
    tools: ["Python", "pandas", "NumPy", "statsmodels", "Matplotlib", "Seaborn"],
    skills: ["Player-valuation modelling", "Age-curve estimation", "Underlying-metric analysis", "Regression with panel structure", "Scouting recommendations"],

    businessBackground:
      "Kingsmere Park, a Premier Division club, has a data-minded sporting director and a transfer budget that cannot survive another mistake. The last two windows produced expensive signings whose output collapsed, and the director suspects the club systematically overpays for age and goals while ignoring underlying performance and age curves. Three seasons of player-level metrics with market values and fees are assembled; the director wants the value model: what performance costs, how age moves it, and which profiles the club should actually buy.",
    problemStatement:
      "Model player value from three seasons of metrics: performance profiles (goals vs underlying xG, involvement, durability), age curves for output and value, the relationship between market value, fees and performance, and the mispricing patterns (which profiles trade cheap for their output?) — delivered as a transfer-strategy brief with named target profiles and their evidence.",
    businessObjectives: [
      "Build a clean player-season panel with canonical positions and consistent value parsing",
      "Model the age curve of attacking output (goals + xG involvement) with uncertainty",
      "Model market value as a function of performance, age and position; find systematic mispricing",
      "Analyse fee-vs-value: which transfers over- and under-paid, and what predicted them",
      "Deliver the transfer-strategy brief: target profiles, price expectations and negotiation levers",
    ],
    datasetDescription:
      "~2,600 player-season rows across three seasons: each row a player's season with age, club, position, appearances, minutes, goals, assists, xG, xA, market value (partly formatted '€45.5M' strings), transfer fee (0 = no transfer), contract years and injury days. Appearances are missing on some rows, market values mix formats, fees of zero are legitimate (no transfer), duplicates exist, and contract years include impossible negatives. Value modelling inherits every parsing choice — the cleaning is the pricing.",
    dataDictionary: [
      { column: "player_id", kind: "id", description: "Player identifier", example: "2148" },
      { column: "player", kind: "text", description: "Player name", example: "Mateo Ferreira" },
      { column: "season", kind: "integer", description: "Season year (2023–2025)", example: "2024" },
      { column: "age", kind: "integer", description: "Age at season start (18–35)", example: "24" },
      { column: "club", kind: "text", description: "Club", example: "Borough FC" },
      { column: "league", kind: "categorical", description: "League", example: "Premier Division" },
      { column: "position", kind: "categorical", description: "Position group (casing variants)", example: "AM" },
      { column: "apps", kind: "integer", description: "Appearances (some missing)", example: "31" },
      { column: "minutes", kind: "integer", description: "Minutes played", example: "2410" },
      { column: "goals", kind: "integer", description: "Goals scored", example: "14" },
      { column: "assists", kind: "integer", description: "Assists", example: "6" },
      { column: "xg", kind: "decimal", description: "Expected goals", example: "11.8" },
      { column: "xa", kind: "decimal", description: "Expected assists", example: "4.9" },
      { column: "market_value_m", kind: "currency", description: "Market value in £m (format mix)", example: "€45.5M" },
      { column: "transfer_fee_m", kind: "currency", description: "Fee in £m (0 = no transfer)", example: "0.0" },
      { column: "contract_years_left", kind: "integer", description: "Contract years remaining (negatives exist)", example: "3" },
      { column: "injury_days", kind: "integer", description: "Days injured in the season", example: "0" },
    ],
    initialQuestions: [
      "What does the age curve of attacking output look like, and when does it peak by position?",
      "How do goals relate to xG — who over/under-performs their underlying numbers, and does it persist?",
      "What drives market value: age, output, position, contract? Which profiles are systematically mispriced?",
      "How do fees relate to market value — when do clubs overpay, and what predicts it?",
      "Which target profiles should Kingsmere pursue, at what price expectations?",
    ],
    dataset: {
      name: "League player-seasons with valuations",
      filename: "sports-03-player-values.csv",
      description: "3 seasons of player metrics with market values and transfer fees.",
      rows: 2600,
    },

    dataQuality: [
      { issue: "Formatted market values", where: "market_value_m — '€45.5M' strings (~8%)", detection: "dtype object; currency-symbol regex", treatment: "Parse to numeric £m with a documented conversion; verify zero parse losses — the value model's outcome variable." },
      { issue: "Missing appearances", where: "apps — ~4%", detection: "isna().sum()", treatment: "Derive from minutes (players with 450+ minutes count appearances from match context) or exclude from per-appearance metrics; stated." },
      { issue: "Duplicate player-seasons", where: "~0.5% duplicated (player_id, season)", detection: "duplicated(['player_id','season']).sum()", treatment: "Drop — the panel's key; duplicates double-weight players in the curve." },
      { issue: "Impossible contract years", where: "contract_years_left < 0", detection: "(df['contract_years_left'] < 0).sum()", treatment: "Exclude from contract analyses (counted); likely extension-logging errors." },
      { issue: "Fee zeros", where: "transfer_fee_m == 0 (~30%)", detection: "value_counts()", treatment: "NOT a defect: zeros are no-transfer seasons. Fee analysis filters to transfers; value analysis uses all rows." },
      { issue: "Position casing", where: "position — 'am'/'AM'", detection: "value_counts()", treatment: "Canonicalise to the position groups." },
    ],
    cleaningPlan: [
      { action: "Parse market values to numeric with verification; deduplicate the panel key", rationale: "Outcome variable and panel integrity." },
      { action: "Derive appearance proxies where missing; canonicalise positions", rationale: "Per-appearance metrics and role groupings need both." },
      { action: "Build per-90 metrics: goals90, xg90, xa90, involvement90", rationale: "Per-90 normalisation is football's lingua franca — rate stats before value stats." },
      { action: "Flag transfer seasons (fee > 0) and injury-affected seasons", rationale: "Two analysis populations: all seasons (value model) and transfers (fee model)." },
    ],
    edaPlan: [
      { question: "Output landscape", method: "per-90 output by position; minutes distribution", expectation: "Forwards highest xG90; wide involvement spread by position." },
      { question: "Age profile of the league", method: "age distribution by season; minutes by age", expectation: "Peak minutes at 24–29 — the prime window." },
      { question: "Goals vs xG", method: "scatter with over/under-performers; persistence check year-over-year", expectation: "Wide scatter, low persistence — finishing over-performance is mostly noise." },
      { question: "Value landscape", method: "market value by age and position; value vs output", expectation: "Value peaks at 23–26 — earlier than output (the age-curve discount)." },
      { question: "Fee-vs-value", method: "fee over value ratio for transfers; by age and contract", expectation: "Premiums for young and contract-long; bargains at 27+ with short contracts." },
      { question: "Injury effects", method: "value and output by injury-day bucket", expectation: "Steep discount above ~60 injury days." },
    ],
    statisticsPlan: [
      { technique: "Age-curve estimation (output ~ age spline, per position, cluster-robust by player)", purpose: "When performance peaks, with uncertainty", expectation: "Attacking output peaks 25–27; value peaks 23–25 — the discount window." },
      { technique: "Finishing over-performance persistence (year-pair correlation)", purpose: "Is finishing skill or noise?", expectation: "Weak persistence — xG is the stable signal, goals the noisy one." },
      { technique: "Value model: log(value) ~ per-90 output + age spline + position + contract + injury", purpose: "The pricing engine with interpretable drivers", expectation: "Age spline dominates; xG90 > goals90 in explanatory power — the market partially prices underlying numbers." },
      { technique: "Fee premium model (fee/value ~ age, contract, league position of buyer)", purpose: "When do clubs overpay?", expectation: "Premiums for 21–24-year-olds and long contracts; 28+ with <2 years trade below value." },
      { technique: "Residual target screening", purpose: "Find the systematically under-priced profiles", expectation: "A shortlist: high-xG90, 26–28, short contract — the value pocket." },
    ],
    visualisationPlan: [
      { chart: "Age curves — output per 90 and market value by age (two lines, one chart)", answers: "When do players peak — and when are they priced?", reads: "The value peak preceding the output peak IS the strategy." },
      { chart: "Scatter — goals vs xG per 90 with the identity line", answers: "Who finishes over their numbers?", reads: "Off-line players labelled; the persistence note attached." },
      { chart: "Coefficient/forest plot — value model drivers", answers: "What does the market price?", reads: "Age spline and xG90 dominating; goals90 secondary." },
      { chart: "Bar — fee-to-value premium by age band", answers: "When do buyers overpay?", reads: "The U-shape: premiums young, discounts at 28+." },
      { chart: "Scatter — actual vs model value with the under-priced quadrant labelled", answers: "Who is the target list?", reads: "Below-the-line high-output players = the shortlist." },
    ],
    findings: [
      "The value curve peaks two to three years before the output curve: players are most expensive at 23–25 but produce their best per-90 numbers at 25–27 — the club's opportunity is the gap between the two curves.",
      "Finishing over-performance barely persists year to year: goals-minus-xG this season says almost nothing about next season, so paying for a career year in finishing is paying for noise.",
      "The value model confirms the market is partially sophisticated: xG90 carries more pricing power than raw goals, but age still dominates everything — the market buys youth beyond what output justifies.",
      "Fee premiums are systematic: buyers overpay ~15–25% for 21–24-year-olds with long contracts and underpay for 28+ profiles with short contracts — the latter being where per-90 output holds up.",
      "The residual screen produces a concrete target profile: 26–28-year-old high-xG90 attackers on short contracts, trading 30–50% below model value — players the club can buy without betting on youth or finishing luck.",
    ],
    recommendations: [
      { what: "Focus the next window on the 26–28 high-output, short-contract profile (the residual shortlist)", why: "The value model says this profile trades well below its output price — the club's structural edge.", impact: "Best output-per-pound in the market", horizon: "this quarter" },
      { what: "Value targets on xG90 and involvement, never on goals-minus-xG career years", why: "Finishing over-performance is noise; the club's last two mistakes were exactly this bet.", impact: "Removes the systematic overpayment", horizon: "immediate" },
      { what: "Negotiate on the age curve: let other clubs pay the 21–24 premium; walk when asked to", why: "The premium is systematic and the output evidence doesn't support it for this club's budget.", impact: "Capital discipline", horizon: "this quarter" },
      { what: "Build the value model into the scouting workflow with annual recalibration and injury monitoring", why: "Prices move; a stale model is worse than none. Injury days carry a steep, trackable discount.", impact: "Compounding decision quality", horizon: "longer term" },
    ],
    finalReport: {
      executiveSummary:
        "Kingsmere's transfer problem has a shape: the club has been paying the youth premium and the finishing premium — the two bets the data says are systematically overpriced. Market value peaks at 23–25 while per-90 output peaks at 25–27; buyers pay 15–25% premiums for young long-contract profiles and discounts for 28+ short-contract profiles whose output holds. Finishing over-performance barely persists, so career-year goals are noise priced as skill; xG90, not goals, is the stable signal — and the market already knows it partially. The strategy: buy the gap between the curves — 26–28-year-old high-xG90 attackers on short contracts, trading 30–50% below model value — and institutionalise the model before the next window.",
      structure: [
        "1. The sporting director's question and scope",
        "2. Panel construction and value parsing (documented)",
        "3. The age curves: output vs value",
        "4. Finishing: goals vs xG and persistence",
        "5. The value model: what the market prices",
        "6. Fee premiums: when buyers overpay",
        "7. The target profile and shortlist method",
        "8. Appendix: model tables, parsing rules, reproduction script",
      ],
    },

    guidedSteps: [
      {
        phase: "understand",
        title: "Frame the valuation question",
        goal: "Panel structure, value parsing plan, and the two models ahead.",
        instructions: [
          "Verify the panel key (player, season); catalogue the value-format problem.",
          "Distinguish the two analysis populations: all player-seasons (value model) vs transfer seasons only (fee model).",
          "Note the strategy question that organises everything: what does output cost, and when is it mispriced?",
        ],
        hints: [
          "Value parsing is the outcome variable — currency regex with zero-loss verification, no exceptions.",
          "Fee zeros are real (no transfer): filtering to fee > 0 is the fee-model's population definition, not a cleaning step.",
          "Per-90 metrics are the comparison currency; raw totals reward health and trust.",
        ],
        checkpoint: "Panel verified, parsing plan written, populations defined.",
        code: {
          label: "Panel checks",
          language: "python",
          source: `df = pd.read_csv("sports-03-player-values.csv")
print("dupes:", df.duplicated(["player_id", "season"]).sum())
print(df["market_value_m"].astype(str).str.contains("M|€").sum(), "formatted values")
print(df["transfer_fee_m"].eq(0).mean().round(2), "no-transfer share")
print(df["position"].value_counts(dropna=False))`,
        },
      },
      {
        phase: "quality",
        title: "Audit the panel",
        goal: "Value formats, missing apps, duplicates, contract impossibles — each with its model consequence.",
        instructions: [
          "Quantify each defect and the analysis it corrupts.",
          "Decide the appearance-proxy rule for missing apps.",
          "Write the audit table.",
        ],
        hints: [
          "Missing apps with minutes present: the proxy rule (minutes ÷ 75 rounded, capped) is defensible and documented.",
          "Contract negatives: exclude from contract terms in the model, keep elsewhere.",
          "The value column's parse failure count must be zero — any failure means the regex missed a format.",
        ],
        checkpoint: "The audit table with the parsing and proxy rules.",
      },
      {
        phase: "cleaning",
        title: "Build the valuation panel",
        goal: "Numeric values, per-90 metrics, position groups, transfer flags.",
        instructions: [
          "Apply all treatments; derive per-90 output metrics and involvement.",
          "Verify: no negative values; per-90 distributions sane (xG90 < 1.5 for outfield).",
          "Build both populations (all seasons; transfer seasons).",
        ],
        hints: [
          "Value parse: strip symbols, float, document the €→£ assumption if any (or treat all as one currency, stated).",
          "involvement90 = (xg + xa)/90 — the underlying contribution metric that survives finishing noise.",
          "The per-90 sanity check catches unit errors that would poison the whole model.",
        ],
        checkpoint: "The valuation panel with derived metrics and both populations.",
        code: {
          label: "Valuation panel",
          language: "python",
          source: `import re

def parse_value(v):
    if isinstance(v, (int, float)):
        return float(v)
    return float(re.sub(r"[^0-9.]", "", str(v)))

panel = df.drop_duplicates(["player_id", "season"]).copy()
panel["value_m"] = panel["market_value_m"].map(parse_value)
panel["position"] = panel["position"].str.upper()
panel = panel[panel["minutes"] > 400].copy()
for col, out in [("goals", "g90"), ("xg", "xg90"), ("xa", "xa90")]:
    panel[out] = panel[col] / panel["minutes"] * 90
panel["inv90"] = panel["xg90"] + panel["xa90"]
panel["was_transfer"] = panel["transfer_fee_m"] > 0
print(panel[["g90", "xg90", "inv90"]].describe().round(2))`,
        },
      },
      {
        phase: "eda",
        title: "Curves, finishing and prices",
        goal: "Age curves (output and value), goals-vs-xG persistence, value landscape.",
        instructions: [
          "Per-90 output by age (mean, with bands); market value by age — the two curves on one chart.",
          "Goals vs xG scatter; year-over-year persistence of the difference.",
          "Value by position and contract; fee/value ratio for transfers.",
        ],
        hints: [
          "The two-curve chart is the brief's thesis — build it early and polish it.",
          "Persistence: merge consecutive seasons by player, correlation of (goals − xG) year t vs t+1 — expect weak.",
          "Fee/value by age band previews the premium model's U-shape.",
        ],
        checkpoint: "Curves built, persistence measured, value landscape mapped.",
        code: {
          label: "The two curves",
          language: "python",
          source: `by_age = panel.groupby("age").agg(
    inv90=("inv90", "mean"), value=("value_m", "median"), n=("player_id", "count"))
print(by_age.round(2))

panel["g_minus_xg"] = panel["g90"] - panel["xg90"]
pairs = panel.merge(panel, on="player_id", suffixes=("_t", "_t1"))
pairs = pairs[pairs.season_t1 == pairs.season_t + 1]
print("persistence corr:",
      pairs[["g_minus_xg_t", "g_minus_xg_t1"]].corr().iloc[0, 1].round(2))`,
        },
      },
      {
        phase: "statistics",
        title: "The value and fee models",
        goal: "Age spline, value regression, fee premium, residual shortlist.",
        instructions: [
          "Age curve with a spline (or binned ages) and cluster-robust errors by player.",
          "Value model: log(value) ~ inv90 + age-spline + position + contract + injury_days.",
          "Fee premium: fee/value ratio model on transfer seasons; the residual screen for under-priced profiles.",
        ],
        hints: [
          "Age spline: patsy's bs() or binned dummies — the curve shape, not the functional form, is the finding.",
          "Cluster by player_id: three seasons of one player are one career, not three data points.",
          "Residual shortlist: log(value) residuals below −0.4 with inv90 above the positional median and age 26–28 — the concrete target list method.",
        ],
        checkpoint: "Curve estimate, value model, premium model, shortlist method.",
        code: {
          label: "Value model",
          language: "python",
          source: `import statsmodels.formula.api as smf
import numpy as np

m = panel.copy()
m["log_value"] = np.log(m["value_m"])
m["age_c"] = m["age"] - 25
model = smf.ols(
    "log_value ~ inv90 + age_c + I(age_c ** 2) + I(age_c ** 3) + C(position)"
    " + contract_years_left + injury_days",
    data=m).fit(cov_type="cluster", cov_kwds={"groups": m["player_id"]})
print(model.summary().tables[1].as_text()[:800])

m["resid"] = model.resid
shortlist = m[(m["resid"] < -0.4) & (m["inv90"] > m.groupby("position")["inv90"].transform("median"))
              & m["age"].between(26, 28)]
print(shortlist[["player", "age", "position", "inv90", "value_m"]].head(10))`,
        },
      },
      {
        phase: "visualisation",
        title: "The strategy exhibits",
        goal: "Five charts: two curves, finishing persistence, value drivers, premium U, shortlist scatter.",
        instructions: [
          "Build the five; the two-curve chart is the strategy's face.",
          "Annotate the curve gap ('the buying window').",
          "The shortlist scatter labels the residual targets.",
        ],
        hints: [
          "Two curves, two y-axes (or indexed scales) with the 23–27 window shaded — one glance, whole strategy.",
          "Persistence as a paired-year scatter with correlation annotated — the 'don't buy finishing' evidence.",
          "Premium U: fee/value ratio by age band with the young premium and 28+ discount labelled.",
        ],
        checkpoint: "Five exhibits, two-curve chart polished.",
      },
      {
        phase: "interpretation",
        title: "Price the strategy honestly",
        goal: "Findings with the mispricing mechanism, bounded claims and model limits.",
        instructions: [
          "Answer the five questions; keep the association language disciplined (the model prices the league's habits, not a player's future).",
          "State the model limits: no scouting context, no physical data, three seasons only.",
          "Draft the strategy paragraph: the gap between the curves is the club's edge.",
        ],
        hints: [
          "The mechanism sentence: 'The market buys youth beyond output and discounts age beyond decline — the gap is the arbitrage.'",
          "Residual targets are candidates, not conclusions: the model screens, scouting confirms — say exactly that.",
          "The persistence finding is the most actionable: it kills the club's most expensive historical habit.",
        ],
        checkpoint: "Five answered questions, limits stated, strategy paragraph drafted.",
      },
      {
        phase: "recommendations",
        title: "The transfer-strategy brief",
        goal: "Target profiles, valuation discipline and the workflow integration.",
        instructions: [
          "Recommend the target profile, the valuation rules (xG-based, curve-aware) and the model workflow.",
          "Include negotiation levers from the fee model (what discounts are systematic).",
          "Define the recalibration cadence and the injury-monitoring threshold.",
        ],
        hints: [
          "The brief's structure mirrors the director's question: what to buy, what to pay, what to never pay.",
          "Negotiation levers: the 28+ short-contract discount is systematic — the club should be the buyer there, not the seller.",
          "Annual recalibration with the injury threshold keeps the model alive — a stale model misprices by habit.",
        ],
        checkpoint: "The brief with profiles, rules, levers and workflow.",
      },
      {
        phase: "report",
        title: "The value model report",
        goal: "A sporting-director report: strategy on page one, models in support.",
        instructions: [
          "Follow the outline; open with the two-curve finding.",
          "Methodology box: parsing rules, per-90 definitions, model specs, cluster structure.",
          "Close with the shortlist method and the workflow recommendation.",
        ],
        hints: [
          "The one-liner: 'Buy the gap between the value curve and the output curve — and never pay for a career year in finishing.'",
          "Directors quote charts, boards quote tables — serve both (two-curve chart AND the model table).",
          "Reproducibility: one script from raw CSV to the shortlist — the next window's analyst inherits it.",
        ],
        checkpoint: "The complete report, reproducible end to end.",
      },
    ],

    independentBrief: {
      scenario:
        "You are the sporting director's analyst. Build the value model: age curves, the market's pricing habits, fee premiums and the mispriced profiles — and the transfer-strategy brief the club can execute. Parsing rules, per-90 definitions and model specs are yours, documented.",
      deliverables: [
        "Panel audit with documented value parsing and proxy rules",
        "Age curves for output and value (cluster-robust, by position)",
        "Finishing persistence analysis (goals vs xG year-over-year)",
        "Value model and fee-premium model with interpretable drivers",
        "Transfer-strategy brief: target profile, shortlist method, valuation rules, negotiation levers",
      ],
      guardrails: [
        "Value parsing verified lossless",
        "Panel key unique; three seasons treated as one career (clustered)",
        "xG-based valuation, not goals-based, in the primary model",
        "Shortlist presented as screening, not conclusions",
      ],
    },

    evaluationChecks: {
      correctness: [
        "Value parsing lossless and verified",
        "Per-90 metrics derived from minutes correctly",
        "Fee analysis filtered to transfer seasons; value model on all seasons",
      ],
      "code-quality": [
        "Panel built once; populations derived from flags",
        "Model specs parameterised and documented",
      ],
      reasoning: [
        "Age curve estimated with uncertainty and by position",
        "Persistence analysis drives the xG-based valuation stance",
      ],
      visualization: [
        "Two-curve chart with the buying window annotated",
        "Shortlist scatter with residual thresholds visible",
      ],
      interpretation: [
        "Mispricing mechanism articulated with bounded claims",
        "Model limits stated (no scouting context, 3 seasons)",
      ],
      recommendations: [
        "Target profile concrete with price expectations",
        "Workflow integration (recalibration, injury monitoring) included",
      ],
    },
  },
];
