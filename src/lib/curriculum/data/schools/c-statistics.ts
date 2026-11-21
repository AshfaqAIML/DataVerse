/**
 * SCHOOL C — STATISTICS (C1–C11)
 *
 * The complete statistics school: descriptive statistics, data and statistical
 * thinking, probability, probability distributions, sampling, confidence
 * intervals, hypothesis testing, correlation, regression, Bayesian statistics,
 * and the statistical-inference capstone — the arithmetic of evidence from
 * first summaries to honest decisions under uncertainty.
 *
 * NOTE: prerequisites reference subjects from other schools (e.g.
 * fractions-percentages and functions-graphs, School B) that are still being
 * authored. The full-registry graph validation in validate.ts activates once
 * every school file exists; the content pipeline only joins by slug, which is
 * unaffected.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolC: SubjectDef[] = [
  {
    slug: "descriptive-statistics",
    school: "C",
    code: "C1",
    title: "Descriptive Statistics",
    blurb: "Summarize a whole dataset with a handful of honest numbers — averages, spread, shape and outliers.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["algebra-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Compute and interpret the mean, median and mode of a dataset",
      "Measure spread with range, quartiles, variance and standard deviation",
      "Describe the shape of a distribution and spot skewness",
      "Identify outliers and decide defensibly what to do with them",
      "Build descriptive summaries with Python and NumPy",
    ],
    outcomes: [
      "A learner can choose and justify the right average for a given dataset",
      "A learner can compute a five-number summary and read a box plot without help",
      "A learner can explain why an average can mislead and fix the report",
    ],
    modules: [
      mod(
        "Summarizing Data with Numbers",
        "The center, the spread, and the numbers editors ask for first.",
        ["Compute mean, median and mode by hand and with code", "Quantify spread with range, quartiles and standard deviation"],
        ["calculation", "concept-check", "interpret-results", "predict-output"],
        [
          ch("The Center of the Data", "Three ways of naming a typical value — and when each one lies", [
            L("Mean, Median, and Mode", 35, ["mean", "median", "mode", "outlier"], "The three averages, built from scratch, and the pull of extreme values."),
            L("Choosing the Right Average", 30, ["skewness", "resistant statistic", "reporting"], "Income, house prices, response times — why the median wins when data is skewed."),
            L("Range and Quartiles", 30, ["range", "quartile", "percentile"], "Where the data sits: quartiles and percentiles from first principles."),
          ]),
          ch("The Spread of the Data", "How far do values wander from the center?", [
            L("Variance and Standard Deviation", 35, ["variance", "standard deviation", "deviation"], "The average squared distance from the mean — derived, not decreed."),
            L("The Five-Number Summary", 30, ["five-number summary", "box plot", "IQR"], "The five numbers that sketch any distribution in seconds."),
            L("Identifying Outliers", 30, ["outlier", "IQR rule", "data quality"], "The 1.5 IQR rule, why it exists, and what to do when it fires."),
          ]),
        ]
      ),
      mod(
        "Summarizing Data with Pictures",
        "Histograms, shapes and the charts that summarize honestly.",
        ["Build and read histograms and box plots", "Name a distribution's shape and connect it to the numbers"],
        ["concept-check", "interpret-results", "calculation", "case-analysis"],
        [
          ch("Frequency and Distributions", "Counting into shape", [
            L("Frequency Tables and Histograms", 30, ["frequency", "histogram", "bin"], "Binning choices, and what a histogram shows that a table cannot."),
            L("Shape: Skewness and Modality", 30, ["skewness", "unimodal", "bimodal"], "Left-tailed, right-tailed, two-peaked — shape drives which tools apply."),
          ]),
          ch("Box Plots and Beyond", "The one-chart summary and its blind spots", [
            L("Box Plots", 30, ["box plot", "whisker", "median"], "Reading box plots at a glance and comparing groups fairly."),
            L("Reading Misleading Charts", 30, ["truncated axis", "chart junk", "honesty"], "The classic tricks — and the fixes every analyst should demand."),
          ]),
        ]
      ),
      mod(
        "Summarizing Tables",
        "Proportions, contingency and the arithmetic of comparison.",
        ["Summarize categorical data with proportions and cross-tabs", "Standardize values to compare across scales"],
        ["calculation", "concept-check", "interpret-results", "dataset-task"],
        [
          ch("Counts into Rates", "Percentages, rates and risk", [
            L("Proportions and Percentages", 30, ["proportion", "percentage", "base rate"], "Which denominator? The question behind every honest percentage."),
            L("Contingency Tables", 35, ["contingency table", "marginal", "conditional"], "Two categorical variables, one table, three ways to slice."),
          ]),
          ch("Comparing Across Scales", "Standardization", [
            L("Rates and Risk", 30, ["rate", "risk", "incidence"], "Counts lie without denominators — the per-100k habit."),
            L("Standardizing with z-Scores", 35, ["z-score", "standardization", "normal distribution"], "How many standard deviations from typical, and what that buys."),
          ]),
        ]
      ),
      mod(
        "Descriptive Statistics in Practice",
        "From numbers to narratives, with code and case studies.",
        ["Produce descriptive summaries in Python", "Write an honest summary of a real dataset"],
        ["dataset-task", "interpret-results", "write-code", "case-analysis"],
        [
          ch("Code and Cases", "Doing it in Python", [
            L("Descriptive Statistics in Python", 35, ["numpy", "mean", "std", "summary"], "NumPy one-liners for every statistic in this subject."),
            L("Case Study: A/B Test Readout", 35, ["lift", "mean per group", "variance"], "Describe two groups so a decision meeting can trust the readout."),
          ]),
          ch("Communicating the Summary", "Honesty is a skill", [
            L("Describing Data Responsibly", 30, ["reporting", "context", "uncertainty"], "Context, denominators and the summary sentences that survive review."),
            L("Checkpoint Case Study", 40, ["exploratory summary", "five-number summary", "narrative"], "A full dataset, from raw CSV to a one-page honest summary."),
          ]),
        ]
      ),
    ],
    finalExam: exam("Descriptive Statistics Final", 45, 18),
    projects: [
      proj(
        "One-Page Data Portrait",
        "Choose a real dataset and produce a one-page portrait: the three averages, a five-number summary, one chart, and a paragraph that a non-technical reader would trust.",
        6,
        "independent",
        ["A computed summary table (mean, median, mode, quartiles, std)", "One labeled chart", "A 150-word honest narrative"],
        ["Correct arithmetic on the chosen dataset", "Justified choice of average given the shape", "Chart follows the honesty rules from the misleading-charts lesson"],
        ["Python", "NumPy", "Matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["average", "mean", "median", "mode", "spread", "histogram", "outlier", "summary statistics"],
  },
  {
    slug: "statistics-thinking",
    school: "C",
    code: "C2",
    title: "Data and Statistical Thinking",
    blurb: "Think like a statistician before you compute like one — questions, data, bias, and the workflow behind every honest number.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Distinguish categorical, ordinal, and numeric variables and choose summaries to match",
      "Frame answerable statistical questions and define what will be measured",
      "Compare populations, samples, parameters, and statistics without confusion",
      "Identify confounding, selection bias, and measurement bias in real studies",
      "Apply the question-to-decision workflow to a real problem",
    ],
    outcomes: [
      "A learner can look at a new dataset and name its cases, variables, and variable types",
      "A learner can turn a vague request into a specific, answerable statistical question",
      "A learner can read a study summary and name the plausible sources of bias and confounding",
      "A learner can walk one real question through the question, data, analysis, and decision workflow",
    ],
    modules: [
      mod(
        "What Data Is",
        "Rows, columns, and types — the anatomy of every dataset you will ever meet.",
        ["Name the cases and variables of any dataset and classify each variable's type", "Distinguish a population from a sample and a parameter from a statistic"],
        ["concept-check", "case-analysis", "multiple-choice"],
        [
          ch("Cases and Variables", "What the rows and columns of a data table actually represent", [
            L("A Dataset Is Rows and Columns", 25, ["data table", "case", "variable"], "Rows are cases, columns are variables — the grammar of every dataset."),
            L("Categorical, Ordinal, and Numeric Variables", 30, ["categorical", "ordinal", "numeric"], "Why a variable's type decides which statistics are even legal to compute."),
            L("Populations, Samples, Parameters, and Statistics", 30, ["population", "sample", "parameter", "statistic"], "The number you want versus the number you can afford to compute."),
          ]),
          ch("Data Types in the Wild", "Real tables and their trickiest columns", [
            L("Continuous vs Discrete Numbers", 25, ["continuous", "discrete", "count"], "Measurements that flow versus counts that jump — and why the difference matters."),
            L("Identifiers, Dates, and Other Tricky Columns", 30, ["identifier", "datetime", "zip code"], "Columns that look numeric but aren't — IDs, postal codes, and dates."),
          ]),
        ]
      ),
      mod(
        "Asking Questions of Data",
        "The questions that start every analysis — how to ask them so data can actually answer.",
        ["Turn a vague request into a specific, answerable statistical question", "Assess whether a measurement actually captures the concept it claims to"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch("The Statistical Workflow", "From question to decision in four deliberate moves", [
            L("Question, Data, Analysis, Decision", 30, ["workflow", "estimand", "decision"], "The four-step loop every honest analysis travels, end to end."),
            L("Good Questions and Bad Questions", 30, ["answerable question", "specificity", "scope"], "Vague, leading, and unanswerable questions — and how to fix each one."),
          ]),
          ch("Measurement", "Turning ideas into numbers you can defend", [
            L("Operationalization: From Concept to Number", 30, ["operationalization", "construct", "metric"], "How customer satisfaction becomes a number — and what gets lost on the way."),
            L("Validity and Reliability of Measurements", 30, ["validity", "reliability", "measurement error"], "Measuring the right thing, and measuring it consistently."),
          ]),
        ]
      ),
      mod(
        "Where Data Comes From",
        "Study design, confounding, and bias — how the data was collected dominates what you can conclude.",
        ["Distinguish observational studies from experiments and name what each can support", "Spot confounding, selection bias, and measurement bias in real studies"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("Study Designs", "Experiments versus observation", [
            L("Observational Studies vs Experiments", 30, ["observational study", "experiment", "randomization"], "Watching the world versus intervening in it — the causal difference."),
            L("Randomized Experiments: The Gold Standard", 30, ["random assignment", "control group", "polio vaccine trial"], "Why coin flips settle causal questions — the 1954 Salk polio vaccine trial."),
          ]),
          ch("Confounding and Bias", "The systematic errors that don't average out", [
            L("Confounding: The Hidden Third Variable", 35, ["confounding", "lurking variable", "causation"], "Ice cream sales and drownings rise together — the third variable behind the mirage."),
            L("Selection Bias and the Literary Digest Disaster", 35, ["selection bias", "sampling frame", "Literary Digest"], "The 1936 poll that asked ten million people and still lost — a bad frame beats a big sample."),
            L("Measurement Bias and Leading Questions", 30, ["measurement bias", "leading question", "social desirability"], "Questions that manufacture their own answers."),
          ]),
        ]
      ),
      mod(
        "Thinking in Practice",
        "Putting the whole framework to work on real claims, real datasets, and real decisions.",
        ["Interrogate a published statistic and name its weakest link", "Run one real question through the full workflow from scratch"],
        ["case-analysis", "interpret-results", "dataset-task"],
        [
          ch("Interrogating Claims", "Reading statistics the way an auditor does", [
            L("Eight Questions for Any Statistic", 30, ["provenance", "denominator", "comparison"], "Where did it come from, what is the denominator, compared to what?"),
            L("Case Study: A Headline Number Autopsy", 35, ["headline", "base rate", "denominator"], "One real news statistic, taken apart bolt by bolt.", "reading"),
          ]),
          ch("The Workflow in Action", "One question, end to end", [
            L("From Boardroom Question to Dataset", 35, ["scoping", "data request", "analysis plan"], "Turn a vague worry about churn into a plan a team can execute.", "worked-example"),
            L("Designing Your Own Study", 35, ["study design", "sampling plan", "protocol"], "A checklist-driven design for a question you care about.", "guided-practice"),
            L("Review: The Statistical Thinking Checklist", 20, ["checklist", "review", "workflow"], "The whole subject compressed into one page you keep.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Data and Statistical Thinking Final", 45, 18),
    projects: [
      proj(
        "Claim Autopsy Report",
        "Find one statistic in the news, trace it to its source, and write a two-page autopsy: what was measured, who was sampled, what design produced it, and the three most likely ways it could be wrong.",
        4,
        "guided",
        ["The claim, quoted exactly, with its source link", "A table of cases, variables, and variable types behind the number", "The three biggest threats to validity, ranked, each with a check that could catch it"],
        ["The provenance is traced to the original data, not the headline", "Threats reference a specific bias or confounder from the subject", "The final paragraph states what the claim can and cannot support"],
        ["Python", "Jupyter"]
      ),
      proj(
        "The Study Design Proposal",
        "Pick a question you actually care about and write a study proposal: the answerable question, the variables and their types, the design (observational or experimental), the sampling plan, and the threats to validity with your plan to blunt each one.",
        6,
        "independent",
        ["One-sentence statistical question with a defined estimand", "A variables table with names, types, and measurement plans", "A one-page protocol: design, sample, and analysis plan"],
        ["Every variable has a type and a measurement that matches the concept", "The design matches the question — no causal claims from observation", "Each named threat to validity has a concrete mitigation"],
        ["Python", "Jupyter"]
      ),
    ],
    placementEligible: true,
    keywords: ["data", "variables", "study design", "confounding", "bias", "measurement", "workflow"],
  },
  {
    slug: "probability",
    school: "C",
    code: "C3",
    title: "Probability",
    blurb: "The mathematics of uncertainty — sample spaces, the rules of chance, Bayes' rule, and expected value, from first principles.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["fractions-percentages"],
    softPrerequisites: ["statistics-thinking", "descriptive-statistics"],
    objectives: [
      "Compute probabilities of events using the complement, addition, and multiplication rules",
      "Reason about conditional probability and independence without confusing the two",
      "Apply Bayes' rule to base-rate problems such as medical screening",
      "Compute expected values and variances of discrete random variables",
      "Estimate probabilities by simulation when the math gets hard",
    ],
    outcomes: [
      "A learner can compute event probabilities from a well-defined sample space",
      "A learner can explain conditional probability in plain language and apply Bayes' rule to a screening test",
      "A learner can compute and interpret the expected value and variance of a discrete random variable",
      "A learner can write a short simulation to estimate a probability that resists pencil and paper",
    ],
    modules: [
      mod(
        "Randomness and Sample Spaces",
        "What probability means, and the sample spaces we must build before any rule applies.",
        ["Define sample spaces and events for real random processes", "Translate verbal probability questions into the language of sets"],
        ["calculation", "concept-check", "derive"],
        [
          ch("The Language of Chance", "Probability as long-run frequency", [
            L("Randomness and Long-Run Frequency", 25, ["randomness", "long-run frequency", "law of large numbers"], "Tosses settle down: what a probability of 0.5 actually promises."),
            L("Sample Spaces and Events", 30, ["sample space", "event", "outcome"], "Listing what can happen before saying how likely it is."),
            L("Equally Likely Outcomes and Counting", 30, ["equally likely", "counting principle", "multiplication rule"], "When counting outcomes carefully is the whole job.", "worked-example"),
          ]),
          ch("Events as Sets", "The geometry of events", [
            L("Unions, Intersections, and Complements", 30, ["union", "intersection", "complement"], "Or, and, not — the three set operations every rule is built on."),
            L("Drawing the Picture Before the Arithmetic", 25, ["Venn diagram", "set notation", "translation"], "Translating English into events, and events into pictures.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "Probability Rules",
        "Complement, addition, multiplication — the small rule set that carries almost all applied probability.",
        ["Apply the complement, addition, and multiplication rules to compound events", "Distinguish independence from mutual exclusivity with confidence"],
        ["calculation", "concept-check", "predict-output"],
        [
          ch("The Three Rules", "Complement, addition, multiplication", [
            L("The Complement Rule: One Minus", 25, ["complement rule", "at least one"], "At least one problems crack open with the probability of none."),
            L("The Addition Rule and Overlapping Events", 30, ["addition rule", "disjoint events", "inclusion-exclusion"], "Adding probabilities without double-counting the overlap."),
            L("The Multiplication Rule and Independent Events", 30, ["multiplication rule", "independence", "with replacement"], "And means multiply — when events do not influence each other."),
          ]),
          ch("Conditional Probability", "Updating when information arrives", [
            L("Conditional Probability: Shrinking the Sample Space", 35, ["conditional probability", "restricted sample space", "P of A given B"], "The probability of A once B is known — the sample space just shrank."),
            L("Independence Is Not Mutual Exclusivity", 30, ["independence", "mutually exclusive", "common confusion"], "The classic mix-up, undone with one concrete pair of events."),
            L("Bayes' Rule and the Base-Rate Trap", 40, ["Bayes' rule", "base rate", "false positive"], "A positive test for a rare disease — flipping the conditional the right way round.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Random Variables",
        "Attaching numbers to chance outcomes, then summarizing them with expectation and variance.",
        ["Model uncertain quantities as discrete random variables", "Compute expected values and variances and interpret both in context"],
        ["calculation", "derive", "interpret-results"],
        [
          ch("From Outcomes to Numbers", "Random variables and their distributions", [
            L("Random Variables: Discrete and Continuous", 30, ["random variable", "discrete", "continuous"], "Turning outcomes into numbers so statistics can operate on them."),
            L("Probability Distributions of Discrete Variables", 30, ["probability distribution", "probability mass function", "fair game"], "The table that assigns every value its probability."),
          ]),
          ch("Expectation", "The long-run average and its spread", [
            L("Expected Value: The Weighted Average of the Future", 35, ["expected value", "weighted average", "house edge"], "Why casinos always win and lotteries always lose.", "worked-example"),
            L("Variance and Standard Deviation of a Random Variable", 35, ["variance", "spread", "risk"], "Two games, same expected value, wildly different rides."),
            L("Adding Random Variables: Linearity of Expectation", 35, ["linearity of expectation", "sum of variables", "aggregation"], "Expected values add — and independence is not even required."),
          ]),
        ]
      ),
      mod(
        "Probability in the Wild",
        "Classic problems, classic traps, and simulation as the probability engine of last resort.",
        ["Recognize and correctly solve classic probability puzzles", "Estimate probabilities by simulation when analysis is intractable"],
        ["calculation", "case-analysis", "predict-output", "concept-check"],
        [
          ch("Two Classic Problems", "The birthday problem and Monty Hall", [
            L("The Birthday Problem: 23 Strangers, 50-50", 35, ["birthday problem", "complement", "pairwise"], "The most counterintuitive fifty percent in mathematics.", "worked-example"),
            L("The Monty Hall Problem: To Switch or Not", 35, ["Monty Hall", "conditional update", "host information"], "Why switching doubles your odds — the host is telling you something."),
          ]),
          ch("Simulation and Judgment", "When the math fights back", [
            L("Estimating Probabilities by Simulation", 35, ["simulation", "seeded random", "Monte Carlo"], "Ten thousand simulated trials beat one clever afternoon.", "code", 3),
            L("The Gambler's Fallacy and the Hot Hand", 30, ["gambler's fallacy", "streaks", "independence"], "Coins have no memory — but people see patterns anyway.", "reading"),
            L("Review: The Probability Toolkit", 20, ["review", "rules recap", "decision tree"], "Every rule in the subject, on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Probability Final", 50, 20),
    projects: [
      proj(
        "The Casino Night Simulator",
        "Build a simulation of three games of chance — a dice game, a streak game, and a lottery-style draw. Compute each game's expected value by hand first, then verify your arithmetic with a 100,000-trial simulation and compare the two.",
        6,
        "guided",
        ["Hand computations of each game's expected value and variance", "A seeded simulation whose empirical averages match the theory", "A one-paragraph verdict on each game from the player's side"],
        ["Expected values are derived correctly by hand", "Simulation results converge to the theoretical values within a stated tolerance", "The verdict names the house edge explicitly in expected loss per play"],
        ["Python", "NumPy"]
      ),
      proj(
        "The Screening Test Brief",
        "A clinic screens for a condition with 1% prevalence using a test with 90% sensitivity and 5% false-positive rate. Write a one-page brief for physicians: the probability a positive result means disease, computed three ways (a natural-frequency tree, Bayes' rule, and a 100,000-person simulation).",
        5,
        "independent",
        ["A natural-frequency tree over 100,000 patients", "The Bayes' rule computation, step by step", "A simulation that estimates the same probability", "The final paragraph in language a busy physician can use"],
        ["All three methods agree on the answer", "The brief explains why the answer is small without jargon", "The final paragraph states what the number does and does not mean"],
        ["Python", "NumPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["probability", "sample space", "conditional probability", "Bayes' rule", "expected value", "independence", "simulation"],
  },
  {
    slug: "probability-distributions",
    school: "C",
    code: "C4",
    title: "Probability Distributions",
    blurb: "The distribution zoo — Binomial, Poisson, Uniform, and the Normal — and the judgment to pick the right model for real questions.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["probability"],
    softPrerequisites: ["functions-graphs"],
    objectives: [
      "Distinguish discrete and continuous distributions and read PMFs, PDFs, and CDFs",
      "Apply the Binomial, Poisson, Uniform, and Normal distributions to real questions",
      "Standardize values and compute Normal probabilities with the 68-95-99.7 rule",
      "Explain why the Normal appears so often and when heavy tails override it",
    ],
    outcomes: [
      "A learner can choose an appropriate distribution for a scenario and defend the choice",
      "A learner can compute Binomial and Poisson probabilities for count questions",
      "A learner can standardize a value and estimate Normal probabilities without tables",
      "A learner can read a CDF fluently and use it to compute percentiles",
    ],
    modules: [
      mod(
        "Discrete Distributions",
        "PMFs, CDFs, and the two counting distributions every analyst carries.",
        ["Read PMFs and CDFs and compute probabilities and percentiles with them", "Model count data with Binomial and Poisson distributions"],
        ["calculation", "concept-check", "interpret-results"],
        [
          ch("Describing Randomness with Functions", "From tables to functions", [
            L("The PMF: A Probability for Every Value", 30, ["probability mass function", "discrete distribution", "support"], "The probability mass function — a table that became a rule."),
            L("The CDF: Probability Accumulated So Far", 35, ["cumulative distribution function", "cumulative probability", "percentile"], "One function that answers every below-threshold question at once."),
            L("Mean and Variance of a Distribution", 30, ["expected value", "variance", "parameters"], "Summarizing a distribution before any data ever arrives."),
          ]),
          ch("The Counting Workhorses", "Binomial and Poisson", [
            L("The Binomial Distribution: n Tries, p Each", 35, ["binomial", "number of trials", "success probability"], "Free throws, defectives, ad clicks — counting successes in n tries.", "worked-example"),
            L("The Poisson Distribution: Rare Events per Interval", 35, ["Poisson", "rate parameter", "rare events"], "Horse kicks, typos, server blips — counts of rare events in a fixed window."),
          ]),
        ]
      ),
      mod(
        "Continuous Distributions",
        "From bars to density: continuous random variables, where probability is area.",
        ["Interpret PDFs and CDFs for continuous variables", "Use the Uniform distribution and simulate draws from distributions"],
        ["calculation", "concept-check", "predict-output"],
        [
          ch("From Bars to Area", "The continuous upgrade", [
            L("Continuous Variables and the PDF", 30, ["probability density function", "density", "area under the curve"], "Probability becomes area — and the probability of an exact point becomes zero."),
            L("The Continuous CDF and Percentiles", 30, ["CDF", "percentile", "quantile"], "Percentiles for measurements, from delivery times to test scores."),
          ]),
          ch("The Uniform Distribution", "The simplest continuous model", [
            L("Uniform on an Interval: Flat and Fair", 25, ["uniform distribution", "interval", "equal likelihood"], "The rectangle of randomness — and where it hides in real systems."),
            L("Simulating Random Draws in Python", 35, ["random module", "simulation", "distribution sampling"], "Generating random numbers from distributions with code.", "code", 3),
          ]),
        ]
      ),
      mod(
        "The Normal Distribution",
        "The bell curve: its parameters, the 68-95-99.7 rule, standardization, and its limits.",
        ["Compute Normal probabilities using standardization and the empirical rule", "Explain when the Normal is the wrong model"],
        ["calculation", "interpret-results", "derive"],
        [
          ch("The Bell Curve", "Parameters and the empirical rule", [
            L("The Normal Distribution: mu and sigma", 30, ["normal distribution", "mean", "standard deviation"], "Two numbers place the entire bell — center and spread."),
            L("The 68-95-99.7 Rule", 30, ["empirical rule", "68-95-99.7", "bell curve"], "The three numbers that estimate most Normal probabilities in your head."),
            L("Standardization: z-Scores as a Common Currency", 35, ["standardization", "z-score", "standard normal"], "Subtract the mean, divide by the deviation — every Normal becomes one Normal.", "worked-example"),
          ]),
          ch("Why the Bell Keeps Ringing", "Where Normality comes from — and where it fails", [
            L("Why the Normal Keeps Appearing", 35, ["sum of many effects", "Central Limit Theorem preview", "measurement error"], "Many small independent contributions pile into a bell — the Central Limit Theorem, previewed."),
            L("Heavy Tails in Real Data", 30, ["heavy tails", "extreme events", "lognormal"], "Income, city sizes, and web outages — when the tail is the story."),
          ]),
        ]
      ),
      mod(
        "Distributions in Practice",
        "Choosing a distribution is a modeling act — practice it, code it, and own the zoo.",
        ["Match real questions to appropriate distributions", "Compute distribution probabilities in Python"],
        ["dataset-task", "interpret-results", "case-analysis", "calculation"],
        [
          ch("Choosing the Model", "From question to distribution", [
            L("A Field Guide to Picking Distributions", 30, ["model selection", "counts vs measurements", "assumptions"], "Binary outcome? Count per interval? Measurement? The question picks the model."),
            L("Distributions in SciPy", 35, ["scipy.stats", "pmf and cdf", "percent point function"], "The pmf, cdf, and ppf functions that replace every printed table.", "code", 3),
          ]),
          ch("Case Studies", "Two real encounters", [
            L("Case Study: Modeling Website Failures", 35, ["Poisson process", "rate estimation", "capacity planning"], "A Poisson model for outages — and what it predicts for next quarter.", "worked-example"),
            L("Review: The Distribution Zoo", 20, ["review", "distribution map", "model choice"], "Every distribution in the subject, one paragraph each.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Probability Distributions Final", 50, 20),
    projects: [
      proj(
        "The Distribution Detective",
        "You receive three anonymized real datasets: a series of event counts per hour, a set of waiting times, and a sample of physical measurements. For each, argue for a distribution, estimate its parameters from the data, and check the fit by comparing the empirical histogram to the model.",
        8,
        "independent",
        ["A one-page argument for each dataset's distribution, naming the mechanism", "Parameter estimates computed from the data, with code", "Histogram-plus-model overlays showing where the fit holds and where it breaks"],
        ["The chosen distribution matches the data-generating mechanism, not just the shape", "Parameters are estimated correctly from the sample", "The write-up names at least one place the model fails and what that implies"],
        ["Python", "NumPy", "SciPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["probability distribution", "normal distribution", "binomial", "Poisson", "uniform", "CDF", "standardization", "z-score"],
  },
  {
    slug: "sampling",
    school: "C",
    code: "C5",
    title: "Sampling",
    blurb: "How to ask a few so they speak for everyone — sampling designs, bias, sampling distributions, and the Central Limit Theorem.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["descriptive-statistics", "probability"],
    softPrerequisites: [],
    objectives: [
      "Explain why sampling works and diagnose when it fails",
      "Distinguish simple random, stratified, cluster, and systematic sampling designs",
      "Identify sampling and nonsampling errors in real studies",
      "Describe sampling distributions and compute standard errors",
      "State the Central Limit Theorem and use it to reason about sample means",
    ],
    outcomes: [
      "A learner can choose and defend a sampling design for a given population and budget",
      "A learner can compute the standard error of a sample mean and explain what it measures",
      "A learner can explain the Central Limit Theorem in plain language and say when it applies",
      "A learner can run a bootstrap to estimate uncertainty for a statistic of their choice",
    ],
    modules: [
      mod(
        "Why and How We Sample",
        "The case for asking a few instead of counting everyone — and the designs that make it honest.",
        ["Explain the trade-offs between a census and a sample", "Choose among the probability sampling designs"],
        ["concept-check", "case-analysis", "interpret-results"],
        [
          ch("The Case for Sampling", "Why a good sample beats a bad census", [
            L("Why Sample at All?", 25, ["census", "cost", "destructive testing"], "Coffee tasting, crash tests, and national counts — why less can be more."),
            L("The Sampling Frame: Who Was Available to Ask", 30, ["sampling frame", "coverage", "target population"], "The list you sample from — and the people it silently drops."),
          ]),
          ch("Probability Sampling Designs", "Four ways to pick honestly", [
            L("Simple Random Sampling", 30, ["simple random sample", "random selection", "equal chance"], "Every subset equally likely — the clean design everything else is judged against."),
            L("Stratified Sampling: Guaranteed Representation", 35, ["stratified sampling", "strata", "precision gain"], "Split, then sample — why strata shrink error for the same budget.", "worked-example"),
            L("Cluster and Systematic Sampling", 30, ["cluster sampling", "systematic sampling", "logistics"], "Two practical compromises: sample whole groups, or every k-th unit."),
          ]),
        ]
      ),
      mod(
        "Bias in Samples",
        "The errors no sample size can fix — studied in their natural habitat, the famous failed polls.",
        ["Identify selection and nonresponse bias in real polls", "Separate sampling error from nonsampling error"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("Sampling Bias", "The wrong people, systematically", [
            L("The Literary Digest Poll of 1936", 35, ["Literary Digest", "selection bias", "nonresponse"], "Ten million ballots, 2.4 million replies, one wrong landslide — anatomy of the most famous bad sample."),
            L("Nonresponse and Volunteer Bias", 30, ["nonresponse bias", "volunteer bias", "response rate"], "Who answers surveys — and why the missing replies carry the truth."),
          ]),
          ch("Nonsampling Errors", "Mistakes that survive perfect sampling", [
            L("Coverage, Measurement, and Processing Errors", 30, ["coverage error", "measurement error", "processing error"], "The three error families that no bigger sample will shrink."),
            L("Question Wording and Order Effects", 30, ["wording effects", "order effects", "framing"], "Two surveys, one issue, opposite answers — the questionnaire is the instrument."),
          ]),
        ]
      ),
      mod(
        "Sampling Distributions",
        "The statistic is random too: sampling distributions, standard errors, and the Central Limit Theorem.",
        ["Describe the behavior of sample means across repeated samples", "Compute and interpret standard errors"],
        ["calculation", "derive", "predict-output"],
        [
          ch("The Behavior of Statistics", "What repeated sampling produces", [
            L("The Sampling Distribution of the Mean", 35, ["sampling distribution", "repeated sampling", "simulation"], "Draw a thousand samples, average each one — watch a distribution emerge.", "code", 3),
            L("The Standard Error: Sigma over Root n", 35, ["standard error", "sigma over root n", "precision"], "The one formula that prices precision in units of sample size.", "worked-example"),
          ]),
          ch("The Central Limit Theorem", "The theorem that powers inference", [
            L("The Central Limit Theorem: Averages Behave", 35, ["Central Limit Theorem", "normality of means", "large samples"], "Whatever the population looks like, averages go Normal — the most load-bearing theorem in statistics."),
            L("How Large Is Large Enough?", 30, ["CLT conditions", "skewed populations", "sample size guidance"], "Skewed populations need bigger samples — calibrating the theorem's reach.", "guided-practice"),
          ]),
        ]
      ),
      mod(
        "The Bootstrap and Real-World Sampling",
        "Resampling your own sample — the bootstrap idea — plus designing real sampling plans.",
        ["Explain and run the bootstrap to estimate standard errors", "Design a defensible sampling plan for a real question"],
        ["dataset-task", "calculation", "case-analysis"],
        [
          ch("Resampling", "The bootstrap idea", [
            L("The Bootstrap: The Sample as a Stand-In Population", 35, ["bootstrap", "resampling with replacement", "standard error of anything"], "Treat your one sample as the population and resample it — uncertainty without formulas."),
            L("Bootstrap in Python", 35, ["numpy resampling", "with replacement", "percentile"], "Ten lines of NumPy that estimate the standard error of anything.", "code", 3),
          ]),
          ch("Sampling in the Real World", "From theory to plans and polls", [
            L("Designing a Sampling Plan", 35, ["sampling plan", "budget", "stratification choice"], "Population, frame, design, size — the four decisions in every real plan.", "guided-practice"),
            L("Case Study: Pre-Election Polls Under the Microscope", 35, ["polling", "weighting", "nonresponse adjustment"], "How modern polls weight their samples — and where they still go wrong.", "reading"),
            L("Review: The Sampling Checklist", 20, ["review", "bias audit", "error budget"], "Frame, design, error budget — the whole subject on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Sampling Final", 50, 20),
    projects: [
      proj(
        "The Sampling Simulator",
        "Build a simulator over a synthetic city of 50,000 residents with skewed income and clustered neighborhoods. Draw simple random, stratified, and cluster samples at several sizes, and produce a comparison table of each design's cost, error, and bias for estimating average income.",
        8,
        "independent",
        ["A seeded simulator for all three sampling designs at at least three sample sizes", "A comparison table: design, cost proxy, mean error, and bias across 500 repetitions", "A one-page recommendation of a design with the budget to match"],
        ["Each design is implemented correctly, including stratification by neighborhood", "Errors are measured against the known true population mean", "The recommendation names the trade-off it accepts and why"],
        ["Python", "NumPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["sampling", "sampling distribution", "standard error", "Central Limit Theorem", "bootstrap", "sampling bias", "stratified sampling"],
  },
  {
    slug: "confidence-intervals",
    school: "C",
    code: "C6",
    title: "Confidence Intervals",
    blurb: "From point estimates to honest ranges — the interval recipe for means and proportions, and what 95% confident really means.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["sampling"],
    softPrerequisites: [],
    objectives: [
      "Construct and interpret confidence intervals for means and proportions",
      "Explain what a confidence level does and does not mean",
      "Compute the sample size needed for a target margin of error",
      "Choose between z and t intervals and justify the choice",
    ],
    outcomes: [
      "A learner can build a 95% confidence interval for a mean or a proportion from raw data",
      "A learner can interpret a confidence interval without the classic misreadings",
      "A learner can size a study to hit a stated margin of error",
      "A learner can explain why quadrupling the sample only halves the width",
    ],
    modules: [
      mod(
        "The Logic of Interval Estimation",
        "Why one number is never enough — and the estimate-plus-margin recipe that fixes it.",
        ["Explain the move from point estimate to interval", "Apply the estimate plus margin recipe"],
        ["concept-check", "calculation", "interpret-results"],
        [
          ch("From Points to Intervals", "The honesty upgrade", [
            L("A Point Estimate Is a Coin Flip", 30, ["point estimate", "sampling variability", "uncertainty"], "The sample mean will move with the next sample — a good report says so."),
            L("Estimate plus Critical Value times Standard Error", 35, ["interval recipe", "critical value", "margin of error"], "One recipe builds every interval in this subject: center, multiplier, spread.", "worked-example"),
          ]),
          ch("Confidence Levels", "What 90, 95, and 99 buy", [
            L("Confidence Levels and the Long Run", 30, ["confidence level", "coverage", "repeated sampling"], "Ninety-five percent describes the procedure, not the interval — the long-run contract."),
            L("Trading Width for Confidence", 25, ["interval width", "critical value", "trade-off"], "Ninety-nine percent sounds better — until you see how wide it gets."),
          ]),
        ]
      ),
      mod(
        "Confidence Intervals for a Mean",
        "The z interval when sigma is known, the t interval when it is not, and the sample-size arithmetic.",
        ["Build z and t intervals for a mean and choose correctly between them", "Compute the sample size required for a target margin"],
        ["calculation", "derive", "interpret-results"],
        [
          ch("The z Interval", "Known sigma and the standard Normal", [
            L("CI for a Mean with Known Sigma", 35, ["z interval", "known sigma", "critical value 1.96"], "The textbook interval — and why sigma is almost never actually known in practice."),
            L("Sample Size and Margin of Error", 35, ["sample size formula", "margin of error", "square-root law"], "Halve the width, quadruple the sample — the square-root law of precision.", "worked-example"),
          ]),
          ch("The t Distribution", "Estimating sigma from the data", [
            L("The t Distribution: A Bell with Fat Tails", 30, ["t distribution", "degrees of freedom", "Gosset"], "Gosset's brewery problem: small samples, unknown sigma, wider intervals."),
            L("The t Interval in Practice", 35, ["t interval", "t critical value", "small sample"], "Same recipe, heavier multiplier — computing real t intervals from real samples.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Confidence Intervals for a Proportion",
        "The pollster's interval: proportions, the plus-or-minus three points, and sizing a survey.",
        ["Construct confidence intervals for proportions", "Size a survey for a target margin of error"],
        ["calculation", "interpret-results", "concept-check"],
        [
          ch("One Proportion", "From sample fraction to interval", [
            L("CI for a Proportion", 35, ["proportion interval", "p times one minus p", "Wald interval"], "The square-root formula behind every plus-or-minus figure in the news.", "worked-example"),
            L("Reading Poll Margins of Error", 30, ["margin of error", "polling", "horse race"], "Candidate A at 48, Candidate B at 45, margin plus-or-minus three — who is actually ahead?"),
          ]),
          ch("Sizing a Survey", "How many people to ask", [
            L("How Big a Poll Do You Need?", 30, ["sample size", "worst case", "survey cost"], "The p equals 0.5 worst case, and the n it implies."),
            L("When p Is Small: Rare Events", 30, ["rare events", "coverage check", "small proportions"], "Why tiny proportions need special care — and usually bigger samples."),
          ]),
        ]
      ),
      mod(
        "Interpreting CIs Correctly",
        "The interval is the most misread object in statistics — learn to read it the way statisticians do.",
        ["Interpret confidence intervals without the standard misreadings", "Report intervals honestly to non-technical audiences"],
        ["interpret-results", "case-analysis", "concept-check"],
        [
          ch("What 95 Percent Really Means", "Coverage, not probability", [
            L("The Correct Interpretation: Procedure Coverage", 30, ["coverage", "procedure", "long run"], "Ninety-five percent of the intervals, not ninety-five percent probability for this one — stated precisely."),
            L("The Classic Misreadings", 35, ["misinterpretation", "fixed parameter", "95 percent chance"], "The chance the mean is in this interval, and friends — why each reading is wrong."),
            L("Bootstrap Confidence Intervals", 35, ["bootstrap", "percentile interval", "no formulas"], "Resampling builds intervals for statistics that have no formula at all.", "code", 3),
          ]),
          ch("Communicating Intervals", "Reporting without spin", [
            L("Reporting Intervals to Decision-Makers", 30, ["reporting", "interval width", "decision context"], "The sentence template that survives an executive review.", "reading"),
            L("Case Study: A Published Interval, Interrogated", 35, ["published study", "interval width", "practical significance"], "One real reported interval — what it supports and what it cannot."),
            L("Review: The Interval Checklist", 20, ["review", "recipe", "interpretation"], "Recipe, z or t, honest sentence — the whole subject on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Confidence Intervals Final", 50, 20),
    projects: [
      proj(
        "The Margin-of-Error Calculator",
        "Build a command-line tool that takes either a raw sample of measurements or a proportion with its sample size, chooses the correct z or t interval, prints the interval with its margin of error, and tells the user what sample size would halve the width. Document three test cases computed by hand.",
        6,
        "independent",
        ["A working CLI handling both means and proportions", "Three hand-computed test cases matching the tool's output", "A help section explaining the z-versus-t choice in plain language"],
        ["The t interval is used whenever sigma is estimated from the sample", "Hand computations match the tool's output exactly", "The halve-the-width advice correctly uses the square-root law"],
        ["Python", "NumPy", "SciPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["confidence interval", "margin of error", "t distribution", "proportion", "sample size", "coverage", "bootstrap interval"],
  },
  {
    slug: "hypothesis-testing",
    school: "C",
    code: "C7",
    title: "Hypothesis Testing",
    blurb: "The statistics of proof by contradiction — hypotheses, p-values, t-tests, power, and the discipline to run an honest test.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["confidence-intervals"],
    softPrerequisites: [],
    objectives: [
      "State null and alternative hypotheses and run the five-step test procedure",
      "Compute and interpret p-values without the standard misreadings",
      "Perform one-sample, two-sample, and paired t-tests",
      "Quantify effect sizes and distinguish statistical from practical significance",
      "Control error rates when running many tests",
    ],
    outcomes: [
      "A learner can run a complete t-test from hypotheses to an honest conclusion",
      "A learner can interpret a p-value correctly and name the two classic misreadings",
      "A learner can compute an effect size and argue about practical significance",
      "A learner can explain Type I and Type II errors and what drives power",
      "A learner can correct for multiple comparisons and explain why they must",
    ],
    modules: [
      mod(
        "The Logic of Tests",
        "Hypotheses, test statistics, and p-values — proof by contradiction, statistically.",
        ["Translate research questions into null and alternative hypotheses", "Explain what a test statistic and a p-value actually measure"],
        ["concept-check", "calculation", "interpret-results"],
        [
          ch("Null and Alternative", "The two-claim courtroom", [
            L("Null and Alternative Hypotheses", 30, ["null hypothesis", "alternative hypothesis", "burden of proof"], "Presume nothing — the courtroom structure behind every test."),
            L("Test Statistics: Signal over Noise", 35, ["test statistic", "signal", "noise"], "How far the data leans, measured in standard errors of leaning."),
          ]),
          ch("p-values", "The most misused number in science", [
            L("What a p-value Is — and Is Not", 35, ["p-value", "evidence strength", "misuse"], "The probability of data at least this extreme if the null were true — nothing more."),
            L("The Five-Step Test Procedure", 30, ["test procedure", "significance level", "decision rule"], "Hypotheses, statistic, p-value, decision, conclusion — the loop every test runs.", "guided-practice"),
            L("Statistical Significance and Alpha", 25, ["significance level", "alpha", "rejection region"], "Choosing the bar before you see the data — and why 0.05 is a convention, not a law."),
          ]),
        ]
      ),
      mod(
        "t-tests",
        "The workhorse tests of practice: one sample, two samples, and pairs.",
        ["Run one-sample, two-sample, and paired t-tests and pick the right one", "Report test results in the standard sentence format"],
        ["calculation", "interpret-results", "dataset-task"],
        [
          ch("One-Sample t", "Comparing a sample to a standard", [
            L("The One-Sample t-Test", 35, ["one-sample t", "t statistic", "degrees of freedom"], "Does this batch average what the label claims? A complete worked test.", "worked-example"),
            L("Two-Sided vs One-Sided Tests", 25, ["two-sided test", "one-sided test", "sneaky switching"], "Which alternative, chosen before the data — and why switching after is cheating."),
          ]),
          ch("Comparing Groups", "Two samples and pairs", [
            L("The Two-Sample t-Test", 35, ["two-sample t", "pooled variance", "Welch's test"], "Two groups, one question: are the means really different?"),
            L("The Paired t-Test", 35, ["paired design", "differences", "before and after"], "Same units measured twice — pairing kills background noise.", "worked-example"),
            L("Running t-Tests in SciPy", 30, ["scipy.stats", "ttest functions", "output reading"], "One function call per test — reading the output like a professional.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Errors and Power",
        "The two ways a test can be wrong, the probability of being right, and the size of what you found.",
        ["Explain Type I and Type II errors and what drives power", "Compute effect sizes and argue practical significance"],
        ["concept-check", "calculation", "interpret-results"],
        [
          ch("Type I and Type II", "The error budget", [
            L("Type I and Type II Errors", 30, ["Type I error", "Type II error", "trade-off"], "False alarms and missed discoveries — you can only spend on one."),
            L("Power: The Probability of Detecting", 35, ["power", "effect size", "sample size"], "What power means, and the three dials that move it."),
          ]),
          ch("Effect Size", "How big is the difference", [
            L("Cohen's d and Effect Sizes", 30, ["effect size", "Cohen's d", "standardized difference"], "The p-value tells you it is there; d tells you whether it matters."),
            L("Statistical vs Practical Significance", 35, ["practical significance", "huge samples", "tiny effects"], "With a million users, everything is significant — significance is not importance.", "concept"),
          ]),
        ]
      ),
      mod(
        "Testing in Practice",
        "Many tests, many traps: multiple comparisons, p-hacking, and running an honest A/B test.",
        ["Correct for multiple comparisons", "Run an A/B test end to end with pre-registered choices"],
        ["case-analysis", "interpret-results", "dataset-task"],
        [
          ch("Multiple Testing", "The more you look, the more you find", [
            L("The Multiple Testing Problem", 35, ["multiple comparisons", "false positives", "family-wise error"], "Run twenty independent tests at 0.05 on pure noise and expect one discovery — the arithmetic of noise."),
            L("Bonferroni and False-Discovery Correction", 30, ["Bonferroni", "false discovery rate", "correction"], "Divide alpha, or control the discovery rate — two classical fixes."),
          ]),
          ch("Honest Testing", "The A/B test, done right", [
            L("p-hacking and the Garden of Forking Paths", 35, ["p-hacking", "researcher degrees of freedom", "pre-registration"], "Slice, peek, and retest your way to any p you like — and why it is fraud-adjacent.", "reading"),
            L("Run an Honest A/B Test End to End", 40, ["A/B test", "random assignment", "preregistration"], "One metric, one alpha, one sample size — the full honest workflow on real checkout data.", "guided-practice", 3),
            L("Review: The Testing Checklist", 20, ["review", "assumptions", "reporting"], "Hypotheses, alpha, test, effect size, honest sentence — one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Hypothesis Testing Final", 55, 22),
    projects: [
      proj(
        "The Honest A/B Test Report",
        "You are handed checkout data from a two-week experiment: one control variant and one treatment variant, randomly assigned. Pre-register your metric, alpha, and analysis before looking at the outcome, run the test, compute the effect size and a confidence interval, and write a one-page recommendation a product team could act on — including what you would do with a non-significant result.",
        8,
        "independent",
        ["A pre-registration block written before the outcome is inspected", "The complete test: statistic, p-value, effect size, and confidence interval", "A one-page recommendation with an explicit decision and its risks"],
        ["The pre-registration names one primary metric and one alpha, set in advance", "The report distinguishes statistical from practical significance", "The recommendation states what would change the decision, not just what was found"],
        ["Python", "NumPy", "SciPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["hypothesis test", "p-value", "t-test", "Type I error", "power", "effect size", "multiple testing", "A/B test"],
  },
  {
    slug: "correlation",
    school: "C",
    code: "C8",
    title: "Correlation",
    blurb: "Measuring co-movement honestly — scatterplots, Pearson and Spearman, the things that break r, and why correlation is never causation.",
    difficulty: "beginner",
    track: "core",
    prerequisites: ["descriptive-statistics", "functions-graphs"],
    softPrerequisites: [],
    objectives: [
      "Build and read scatterplots for pairs of quantitative variables",
      "Compute and interpret Pearson and Spearman correlation coefficients",
      "Diagnose what breaks r: outliers, restricted range, and nonlinearity",
      "Explain why correlation never establishes causation, with real confounders",
      "Recognize Simpson's paradox in grouped data",
    ],
    outcomes: [
      "A learner can compute Pearson and Spearman correlations by hand and with code, and interpret both in context",
      "A learner can look at a scatterplot and predict the effect of outliers or restricted range on r",
      "A learner can identify a plausible confounder for a claimed causal link and design the check",
      "A learner can detect Simpson's paradox by disaggregating a table",
    ],
    modules: [
      mod(
        "Two Quantitative Variables",
        "Scatterplots first, then covariance — why co-movement needs a scale-free measure.",
        ["Read scatterplots for form, direction, and strength", "Compute covariance and explain why it needs standardizing"],
        ["calculation", "concept-check", "interpret-results"],
        [
          ch("Scatterplots", "The plot before the number", [
            L("Scatterplots: The First Look", 30, ["scatterplot", "x-y pair", "trend"], "Plot first, compute second — the discipline that saves analyses."),
            L("Form, Direction, Strength — and Stragglers", 30, ["direction", "strength", "clusters"], "The four questions to ask any scatterplot before touching a formula."),
          ]),
          ch("Quantifying Co-movement", "From covariance to correlation", [
            L("Covariance and Its Scale Problem", 30, ["covariance", "units", "scale dependence"], "Covariance measures co-movement — in units that change with your ruler."),
            L("The Pearson Correlation Coefficient", 35, ["Pearson r", "standardization", "negative one to one"], "Covariance divided by the rulers — the scale-free co-movement score.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Understanding r",
        "What r says, what r squared means, and the three things that quietly break the number.",
        ["Interpret r and r squared in context", "Diagnose outliers, restricted range, and nonlinearity in correlations"],
        ["interpret-results", "calculation", "case-analysis"],
        [
          ch("What r Says", "Interpretation and the rank alternative", [
            L("Interpreting r: From Negative One to One", 30, ["interpretation", "sign", "magnitude"], "What 0.9, 0.5, and 0.1 actually look like on a scatterplot."),
            L("r Squared: The Shared-Variance Story", 30, ["r squared", "variance explained", "scatter around a line"], "Squaring r turns co-movement into a fraction of variance explained."),
            L("Spearman's Rank Correlation", 30, ["Spearman", "rank transform", "monotonic"], "Rank first, correlate second — the robust sibling of Pearson's r."),
          ]),
          ch("What Breaks r", "Three classic corrupters", [
            L("Outliers' Pull on r", 30, ["outlier", "leverage", "robustness"], "One point can manufacture — or destroy — a correlation.", "guided-practice"),
            L("Restricted Range", 30, ["restricted range", "selection effect", "attenuation"], "Why the height-points correlation among pro basketball players misleads about people."),
            L("Nonlinear Relationships", 30, ["nonlinearity", "U-shape", "zero correlation"], "A perfect U-curve with r of zero — no linear correlation, total dependence."),
          ]),
        ]
      ),
      mod(
        "Correlation Is Not Causation",
        "Third variables, spurious correlations, and Simpson's paradox — the causal traps behind every r.",
        ["Explain why correlation cannot establish causation, with mechanisms", "Identify confounders and spurious correlations in real claims"],
        ["case-analysis", "concept-check", "interpret-results"],
        [
          ch("Third Variables", "The confounder problem", [
            L("Correlation vs Causation: The Mechanism", 30, ["causation", "mechanism", "temporal order"], "Three conditions for cause — and why r checks none of them."),
            L("Confounders and Spurious Correlations", 35, ["confounder", "spurious correlation", "shoe size and reading"], "Shoe size predicts reading skill in children — age is the ghost in the machine."),
            L("Correlation at the Group Level", 30, ["ecological correlation", "aggregate data", "ecological fallacy"], "Countries correlate; individuals do not — the ecological fallacy."),
          ]),
          ch("Simpson's Paradox", "When groups reverse the story", [
            L("Simpson's Paradox: The Reversal", 35, ["Simpson's paradox", "aggregation", "reversal"], "The 1973 UC Berkeley graduate admissions case — department by department, the trend flips.", "worked-example"),
            L("Causal Stories Behind the Paradox", 30, ["lurking variable", "aggregation choice", "which rate to report"], "Which number is right depends on the causal question — aggregating is a decision, not a default."),
          ]),
        ]
      ),
      mod(
        "Correlation in Practice",
        "Computing correlations with code, reading correlation matrices, and the analyst's checklist.",
        ["Compute and visualize correlations in Python", "Audit a correlation analysis before believing it"],
        ["dataset-task", "interpret-results", "case-analysis"],
        [
          ch("Doing It", "Correlation in Python", [
            L("Correlation in Python", 35, ["np.corrcoef", "corr method", "heatmap"], "Two lines of code and one heatmap — and the judgment that surrounds them.", "code", 3),
            L("Correlation Matrices and Their Dangers", 30, ["correlation matrix", "multicollinearity preview", "pairs plot"], "Every variable against every other — a map, and a minefield."),
          ]),
          ch("Case Studies", "Two classics and a checklist", [
            L("Case Study: Anscombe's Quartet", 30, ["Anscombe's quartet", "same statistics", "plot first"], "Four datasets, identical statistics, wildly different stories.", "reading"),
            L("Review: The Correlation Checklist", 20, ["review", "plot first", "confounder audit"], "Plot, r, robustness, confounders — the whole subject on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Correlation Final", 45, 18),
    projects: [
      proj(
        "The Correlation Audit",
        "Take a public dataset with at least five numeric variables, produce a correlation matrix and heatmap, then audit the three strongest correlations: check for outliers, restricted range, and nonlinearity, name a plausible confounder for each, and write up which correlations survive the audit.",
        6,
        "independent",
        ["A correlation matrix and heatmap for the chosen dataset", "Three audit sections, one per strongest correlation, with plots as evidence", "A final verdict table: survived, weakened, or debunked, with reasons"],
        ["Each audit cites the specific diagnostic that moved the verdict", "Confounders are plausible and tied to the data's context", "The final verdict distinguishes association from causation"],
        ["Python", "NumPy", "Matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["correlation", "Pearson", "Spearman", "scatterplot", "confounding", "spurious correlation", "Simpson's paradox"],
  },
  {
    slug: "regression",
    school: "C",
    code: "C9",
    title: "Regression",
    blurb: "The line and beyond — least squares from scratch, honest interpretation, diagnostics, and the dangers of multiple regression.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["correlation"],
    softPrerequisites: [],
    objectives: [
      "Fit and interpret simple linear regression models with least squares",
      "Assess fit with R squared and residual plots",
      "Check regression assumptions and diagnose failures",
      "Understand multiple regression, partial slopes, and collinearity dangers",
      "Distinguish prediction goals from explanation goals",
    ],
    outcomes: [
      "A learner can fit a least-squares line by hand and with code, and interpret slope and intercept in context",
      "A learner can read a residual plot and name the assumption it violates",
      "A learner can explain what a partial slope means and what collinearity does to them",
      "A learner can judge when a regression prediction is extrapolation and therefore unsafe",
    ],
    modules: [
      mod(
        "The Line of Best Fit",
        "Prediction with a line: least squares from scratch, and what the coefficients mean.",
        ["Derive and compute least-squares coefficients", "Interpret slope and intercept in real units"],
        ["derive", "calculation", "interpret-results"],
        [
          ch("Predicting with Lines", "From correlation to a line", [
            L("Regression: Predicting y from x", 30, ["regression", "response variable", "predictor"], "Correlation says they move together; regression says by how much."),
            L("Least Squares From Scratch", 40, ["least squares", "residual", "minimize squared error"], "Choose the line that minimizes squared misses — the arithmetic of best fit.", "worked-example"),
          ]),
          ch("Interpreting the Model", "Coefficients in context", [
            L("Slope and Intercept in Real Units", 30, ["slope", "intercept", "units"], "Two thousand three hundred more per bedroom — coefficients as sentences."),
            L("Prediction and Its Limits", 30, ["prediction", "range of data", "extrapolation risk"], "The line predicts inside the data's range — beyond it, you are guessing."),
          ]),
        ]
      ),
      mod(
        "How Well Does the Line Fit?",
        "R squared, residuals, and the diagnostic plots that catch a lying line.",
        ["Interpret R squared as variance explained", "Diagnose assumption failures from residual plots"],
        ["interpret-results", "calculation", "dataset-task"],
        [
          ch("R Squared and Residuals", "The fit numbers", [
            L("R Squared: The Fraction of Variance Explained", 30, ["R squared", "sum of squares", "variance explained"], "How much of the scatter the line removes — from 0 to 1, in context."),
            L("The Residual Plot: The Model's Confession", 35, ["residual plot", "fitted values", "pattern"], "Residuals should be boring — any pattern is the model confessing.", "guided-practice"),
          ]),
          ch("Assumptions and Diagnostics", "When the line lies", [
            L("The Four Assumptions of Linear Regression", 35, ["linearity", "constant variance", "normality", "independence"], "Linearity, independence, constant variance, normality — the four pillars under every honest p-value."),
            L("When the Line Lies", 30, ["curvature", "heteroscedasticity", "fan shape"], "Curved residuals and fan shapes — the two classic diagnostic tells.", "concept"),
          ]),
        ]
      ),
      mod(
        "Regression Pitfalls",
        "Influential points, outliers, and extrapolation — the ways good regressions go bad.",
        ["Identify influential observations and assess their impact", "Avoid extrapolation and restricted-range traps"],
        ["case-analysis", "interpret-results", "dataset-task"],
        [
          ch("Influence", "Points that steer the line", [
            L("Leverage and Influential Points", 35, ["leverage", "influence", "Cook's distance"], "Far in x and off the line — the points that quietly steer least squares."),
            L("The Robustness Move: Fit, Remove, Compare", 30, ["sensitivity analysis", "refit and compare", "influence check"], "Fit with, fit without, compare — the sensitivity habit that keeps regressions honest.", "guided-practice"),
          ]),
          ch("Range and Reality", "Predicting where you should not", [
            L("Extrapolation: Past the Edge of the Data", 30, ["extrapolation", "trend projection", "failure modes"], "The line that fits a decade of sales and lies about the next one."),
            L("Restricted Range in Regression", 30, ["restricted range", "attenuated slope", "selection effects"], "Sample only the top performers and the slope flattens — or flips."),
          ]),
        ]
      ),
      mod(
        "Multiple Regression",
        "More predictors, partial slopes, collinearity — and why prediction and explanation want different things.",
        ["Interpret partial slopes in multiple regression", "Explain collinearity and its dangers"],
        ["interpret-results", "concept-check", "case-analysis"],
        [
          ch("More Predictors", "The multivariate step", [
            L("Multiple Regression: The Model", 30, ["multiple regression", "partial slope", "control variable"], "One response, many predictors — and slopes that hold the others fixed."),
            L("Interpreting Partial Slopes: Holding Others Fixed", 35, ["partial slope", "ceteris paribus", "control"], "Controlling for experience — what that sentence really promises."),
            L("Collinearity: When Predictors Tell the Same Story", 35, ["collinearity", "unstable coefficients", "variance inflation"], "Two predictors, one story — coefficients that swing wildly between samples."),
          ]),
          ch("Prediction vs Explanation", "Two goals, two disciplines", [
            L("Prediction vs Explanation Goals", 30, ["prediction", "explanation", "causal reading"], "A great predictor can be a terrible explanation — and the reverse."),
            L("Regression in Python", 35, ["statsmodels", "OLS summary", "coefficient table"], "Reading an OLS summary table like a professional.", "code", 3),
            L("Review: The Regression Checklist", 20, ["review", "diagnostics", "interpretation"], "Fit, R squared, residual plot, influence, goal — one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Regression Final", 55, 22),
    projects: [
      proj(
        "The Home Price Modeler",
        "Fit and diagnose a regression of home prices on at least three predictors: read the residual plots, test the influence of the most extreme observations, quantify collinearity among predictors, and write a one-page model card that separates what the model can predict from what it can explain.",
        10,
        "independent",
        ["A fitted model with a coefficient table in real units", "Diagnostic plots with one-paragraph readings", "A sensitivity section: refit without the most influential point", "A one-page model card separating prediction from explanation"],
        ["Coefficients are interpreted with correct units and direction", "Diagnostics name the specific assumption at risk", "The influence section quantifies the change in slope", "The model card resists causal language for an observational fit"],
        ["Python", "NumPy", "statsmodels"]
      ),
    ],
    placementEligible: true,
    keywords: ["regression", "least squares", "R squared", "residuals", "collinearity", "prediction", "partial slope"],
  },
  {
    slug: "bayesian-statistics",
    school: "C",
    code: "C10",
    title: "Bayesian Statistics",
    blurb: "Belief, updated by evidence — priors, likelihoods, posteriors, credible intervals, and the workflow that makes it honest.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["probability", "probability-distributions"],
    softPrerequisites: [],
    objectives: [
      "Express and update beliefs with the prior-likelihood-posterior recipe",
      "Contrast credible intervals with confidence intervals precisely",
      "Explain conjugate families at an intuition level and when they help",
      "Run the Bayesian workflow on real problems with code",
      "Identify settings where a Bayesian analysis changes the conclusion",
    ],
    outcomes: [
      "A learner can compute a discrete posterior by hand from a prior and a likelihood",
      "A learner can update a posterior sequentially as data arrives",
      "A learner can state the probability interpretation of a credible interval and contrast it with a confidence interval",
      "A learner can implement grid approximation for a one-parameter model in Python",
      "A learner can name two real situations where the prior changed the decision",
    ],
    modules: [
      mod(
        "The Bayesian Mindset",
        "Probability as belief: priors, likelihoods, posteriors, and why the interpretation matters.",
        ["Apply Bayes' rule as a belief-updating machine", "Contrast frequentist and Bayesian meanings of probability"],
        ["concept-check", "calculation", "derive"],
        [
          ch("Beliefs as Probabilities", "The three-part recipe", [
            L("Prior, Likelihood, Posterior", 35, ["prior", "likelihood", "posterior"], "What you believed, what the data says, what you now believe — one multiplication."),
            L("Bayes' Rule as Belief Updating", 35, ["Bayes' rule", "updating", "normalization"], "The same theorem from Probability, now read as a rule for learning.", "worked-example"),
          ]),
          ch("Two Philosophies", "What probability means", [
            L("Frequentist vs Bayesian Probability", 30, ["frequentist", "Bayesian", "interpretation"], "Long-run frequency versus degree of belief — and why the fight exists."),
            L("The Base-Rate Problem, Done Properly", 35, ["base rate", "screening test", "posterior probability"], "The rare-disease test, now with priors you can actually defend.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Working with the Posterior",
        "Sequential updating, grid approximation, and the conjugate shortcut — computing what you believe.",
        ["Update posteriors sequentially as evidence arrives", "Compute posteriors by grid approximation in code"],
        ["calculation", "dataset-task", "predict-output"],
        [
          ch("Discrete Updating", "Yesterday's posterior, today's prior", [
            L("Sequential Updating: Data in Chunks", 35, ["sequential updating", "chained Bayes", "order invariance"], "Update one observation at a time — the order never matters, the result always does."),
            L("Grid Approximation in Python", 35, ["grid approximation", "posterior grid", "normalization"], "Sweep every hypothesis, weight each by its likelihood — a posterior without calculus.", "code", 3),
          ]),
          ch("Continuous Posteriors", "From grids to families", [
            L("The Beta-Binomial Conjugate Intuition", 35, ["Beta prior", "Binomial likelihood", "conjugate family"], "Pseudo-counts: a Beta prior is just successes and failures you already believed in."),
            L("Summarizing a Posterior", 30, ["posterior mean", "posterior spread", "credible interval"], "Mean, mode, spread — the three-number summary of a belief."),
          ]),
        ]
      ),
      mod(
        "Credible Intervals and Decisions",
        "Intervals you can finally read the way everyone wanted to — and decisions built on explicit loss.",
        ["Construct and interpret credible intervals", "Make decisions from posteriors with explicit loss"],
        ["interpret-results", "calculation", "concept-check"],
        [
          ch("Intervals", "The interpretation you always wanted", [
            L("Credible vs Confidence Intervals", 35, ["credible interval", "confidence interval", "interpretation contrast"], "The ninety-five percent statement people want to make — and why only the credible interval may make it."),
            L("Posterior Predictive Checks", 30, ["posterior predictive", "model checking", "simulation"], "Simulate data from your posterior — does it look like the data you actually got?", "code"),
          ]),
          ch("Decisions", "From belief to action", [
            L("Decisions, Loss, and the Bayes Action", 35, ["loss function", "Bayes action", "expected loss"], "Choose the action that minimizes expected loss — prices, thresholds, regret."),
            L("Bayesian A/B Testing", 35, ["Bayesian A/B test", "posterior odds", "expected loss"], "No p-values: compute the probability that B beats A, and the expected cost of choosing wrong.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Bayes in the Wild",
        "The full workflow on real problems, honest priors, and the cases where Bayes flips the story.",
        ["Run the Bayesian workflow end to end", "Argue honestly about prior sensitivity and its effect on decisions"],
        ["case-analysis", "dataset-task", "interpret-results"],
        [
          ch("The Workflow", "Prior, model, check, decide", [
            L("The Bayesian Workflow", 35, ["workflow", "prior elicitation", "sensitivity analysis"], "Choose a prior, compute, check, perturb the prior, decide — the professional loop."),
            L("When Priors Are Controversial", 30, ["weakly informative prior", "prior sensitivity", "robustness"], "Strong priors move answers — and how professionals disclose and test exactly that."),
          ]),
          ch("Practice and Review", "Doing it, and keeping it honest", [
            L("Bayesian Updating in Python: Full Example", 40, ["NumPy posterior", "conversion rate", "credible interval"], "One conversion-rate problem, computed three ways with ten lines each.", "code", 3),
            L("Case Study: Spam Filtering with Naive Bayes", 35, ["naive Bayes", "classification", "word likelihoods"], "The words free and meeting shift a spam posterior — the idea inside real filters.", "reading"),
            L("Review: The Bayesian Checklist", 20, ["review", "prior justification", "workflow recap"], "Prior, likelihood, posterior, check, decide — the whole subject on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Bayesian Statistics Final", 55, 20),
    projects: [
      proj(
        "The Conversion Rate Bayesian",
        "Implement a Bayesian analysis of two email variants' conversion rates: choose and defend a prior, compute both posteriors by grid approximation, report the probability that each variant wins and the credible interval of the difference, then show how a skeptical prior changes — or does not change — the conclusion.",
        10,
        "capstone",
        ["A defended prior with a one-paragraph justification", "Grid-approximation posteriors for both variants, with code", "The probability each variant wins and the credible interval of the difference", "A sensitivity section rerunning the analysis under a skeptical prior"],
        ["The posterior computation is correct at every step", "The win-probability and credible interval are computed from the posterior, not from p-values", "The sensitivity section quantifies how much the prior moves the decision"],
        ["Python", "NumPy", "Matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["Bayesian", "prior", "posterior", "credible interval", "conjugate", "belief updating", "Bayes factor"],
  },
  {
    slug: "statistical-inference",
    school: "C",
    code: "C11",
    title: "Statistical Inference",
    blurb: "The capstone of inference — likelihood as the unifying idea, resampling-based tests, the fallacy parade, and honest communication of uncertainty.",
    difficulty: "advanced",
    track: "core",
    prerequisites: ["confidence-intervals", "hypothesis-testing"],
    softPrerequisites: [],
    objectives: [
      "Explain likelihood as the unifying idea behind estimation and testing",
      "Compare frequentist, Bayesian, and likelihoodist approaches to the same question",
      "Build bootstrap and permutation procedures for statistics without formulas",
      "Recognize p-hacking, base-rate neglect, and regression to the mean in the wild",
      "Communicate uncertainty honestly to technical and lay audiences",
    ],
    outcomes: [
      "A learner can derive a maximum likelihood estimate for a one-parameter model",
      "A learner can implement a permutation test and a bootstrap interval for any statistic",
      "A learner can audit a published analysis for the classic fallacies and name the fix",
      "A learner can write an inference report that states uncertainty without weasel words",
    ],
    modules: [
      mod(
        "Likelihood: The Unifying Idea",
        "One curve under estimation and testing — likelihood, maximum likelihood estimation, and the estimator zoo.",
        ["Derive maximum likelihood estimates for simple models", "Compare estimation paradigms and their guarantees"],
        ["derive", "calculation", "concept-check"],
        [
          ch("The Likelihood Function", "What the data prefers", [
            L("Likelihood: The Curve That Ranks Hypotheses", 35, ["likelihood", "likelihood function", "parameter"], "Probability of data given a hypothesis — flipped, and the flip changes everything."),
            L("Maximum Likelihood Estimation", 40, ["MLE", "optimization", "likelihood curve"], "Climb the likelihood curve: the estimate the data likes most.", "worked-example"),
            L("Likelihood Ratios: How Much Better Is Better?", 35, ["likelihood ratio", "evidence", "comparison"], "Comparing hypotheses by the ratio of their support — evidence as a ratio.", "worked-example"),
          ]),
          ch("Estimation Paradigms", "Three answers to one question", [
            L("Frequentist, Bayesian, and Likelihoodist Estimation", 35, ["frequentist", "Bayesian", "likelihood principle"], "Same data, three philosophies — and where they agree and part ways."),
            L("Bias, Variance, and the Trade-off", 35, ["bias", "variance", "mean squared error"], "Why the best estimator is rarely the obvious one — accuracy against stability."),
            L("Decision Rules and Risk", 30, ["decision rule", "risk", "error rates"], "Tests as decisions: rules, errors, and the risk you agree to carry."),
          ]),
        ]
      ),
      mod(
        "Resampling-Based Inference",
        "Inference without formulas: the bootstrap and permutation tests, for any statistic you can compute.",
        ["Construct bootstrap intervals for arbitrary statistics", "Run permutation tests and justify the shuffle"],
        ["dataset-task", "calculation", "interpret-results"],
        [
          ch("The Bootstrap, Fully Armed", "Uncertainty for anything", [
            L("Bootstrap Intervals, Properly", 35, ["percentile bootstrap", "bias correction", "resampling"], "The percentile method, its biases, and when the bootstrap quietly fails."),
            L("Bootstrapping Complex Statistics", 35, ["median", "correlation", "no closed form"], "The median, the correlation, the ratio — no formula, no problem.", "code", 3),
          ]),
          ch("Permutation Tests", "Shuffling the null into existence", [
            L("Permutation Tests: Shuffle and Compare", 40, ["permutation test", "exchangeability", "null distribution"], "Shuffle group labels a thousand times — the null distribution you built yourself.", "worked-example"),
            L("Choosing Between Tests", 30, ["t-test or permutation", "assumptions", "robustness"], "When the t-test's assumptions hold, and when the shuffle wins.", "concept"),
          ]),
        ]
      ),
      mod(
        "The Fallacy Parade and Honest Practice",
        "The classic ways inference lies — and the reporting habits that keep you honest.",
        ["Identify p-hacking, base-rate errors, and regression to the mean in real analyses", "Report uncertainty in language that survives scrutiny"],
        ["case-analysis", "interpret-results", "concept-check"],
        [
          ch("The Classics", "The fallacy parade", [
            L("p-hacking and False-Discovery Machines", 35, ["p-hacking", "garden of forking paths", "replication crisis"], "How flexible analysis manufactured a replication crisis — and the fixes: pre-registration, holdouts, correction."),
            L("Base Rates and the Winner's Curse", 35, ["base rate neglect", "winner's curse", "selected extremes"], "The discovered effect shrinks on replication — selected maxima lie."),
            L("Regression to the Mean: The Sophomore Slump", 35, ["regression to the mean", "sophomore slump", "extreme scores"], "Rookies of the year slump, extremes drift back — and treatments claim the credit.", "reading"),
          ]),
          ch("Honest Communication", "Reporting as an ethical act", [
            L("Communicating Uncertainty Without Weasel Words", 30, ["uncertainty reporting", "interval language", "no spin"], "Likely, suggests, up to — the vocabulary of honest uncertainty.", "reading"),
            L("Inference in Modern Data Practice", 35, ["holdout sets", "repeated testing", "adaptive data"], "Dashboards test hypotheses daily — inference in the age of the A/B assembly line."),
            L("Capstone Review: The Inference Checklist", 25, ["review", "full workflow", "ethics"], "From likelihood to honest sentence — the whole subject on one page.", "review"),
          ]),
        ]
      ),
    ],
    finalExam: exam("Statistical Inference Final", 60, 24),
    projects: [
      proj(
        "The Any-Statistic Toolbox",
        "Implement a small library that computes bootstrap intervals and permutation p-values for any user-supplied statistic function. Validate it against known t-test results on Normal data, then document three examples where no textbook formula exists (a median, a correlation, and a ratio).",
        10,
        "independent",
        ["A library with bootstrap-interval and permutation-test functions", "A validation suite matching textbook t-test results on simulated data", "Three worked examples on statistics without closed-form intervals"],
        ["The permutation logic shuffles the correct labels for each test", "Bootstrap intervals are validated against known results", "Documentation states when each procedure is invalid"],
        ["Python", "NumPy"]
      ),
      proj(
        "The Inference Autopsy",
        "Take one published analysis — a paper or a detailed technical blog post with reported statistics — and reconstruct its inferential machinery: the estimates, intervals, tests, and corrections. Write a three-page autopsy: what the evidence actually supports, which classic fallacies appear (p-hacking, base-rate neglect, regression to the mean, multiple testing), and how you would report the same results honestly.",
        8,
        "capstone",
        ["A reconstruction table of every inferential claim in the source", "A fallacy audit naming each classic failure with line-level evidence", "A rewritten results section in honest uncertainty language"],
        ["The reconstruction correctly identifies each test and interval used", "Every fallacy claim cites specific evidence from the source", "The rewrite states uncertainty without overclaiming in either direction"],
        ["Python", "NumPy", "SciPy"]
      ),
    ],
    placementEligible: true,
    keywords: ["inference", "likelihood", "bootstrap", "permutation test", "p-hacking", "regression to the mean", "uncertainty"],
  },
];
