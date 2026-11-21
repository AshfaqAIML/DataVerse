/**
 * SCHOOL C — STATISTICS placement banks (C1–C11)
 *
 * One bank of ten questions per subject: 3 recall, 4 applied, 3 judgment,
 * spanning every module. Distractors encode the classic misconceptions
 * (the "95% chance the mean is in the interval", "p-value is the probability
 * the null is true", correlation-equals-causation traps) so a placement
 * score reflects real statistical judgment, not test-taking instincts.
 */
import type { PlacementBank } from "../../types";

export const schoolCPlacement: PlacementBank = {
  "descriptive-statistics": [
    {
      id: "descriptive-statistics-p1",
      prompt: "Which measure of center is most resistant to extreme values, and why?",
      options: [
        "The mean, because it uses every value in the dataset",
        "The median, because it depends only on position, not magnitude",
        "The mode, because it is the most common value",
        "The range, because it ignores the middle of the data",
      ],
      answer: 1,
      explanation:
        "The median is based on rank: moving the largest value from 100 to 1,000 leaves it unchanged, while the mean follows the outlier upward.",
    },
    {
      id: "descriptive-statistics-p2",
      prompt: "The five-number summary of a dataset consists of:",
      options: [
        "Mean, median, mode, range, standard deviation",
        "Minimum, Q1, median, Q3, maximum",
        "Minimum, mean, standard deviation, maximum, IQR",
        "Q1, Q2, Q3, variance, range",
      ],
      answer: 1,
      explanation:
        "The five-number summary is min, first quartile, median, third quartile, max — the skeleton a box plot draws.",
    },
    {
      id: "descriptive-statistics-p3",
      prompt: "The standard deviation of a dataset measures:",
      options: [
        "The difference between the largest and smallest values",
        "The typical distance of values from the mean",
        "The difference between the mean and the median",
        "The most frequently occurring value",
      ],
      answer: 1,
      explanation:
        "Standard deviation is the square root of the average squared distance from the mean — the typical spread around the center.",
    },
    {
      id: "descriptive-statistics-p4",
      prompt: "A dataset of household incomes is strongly right-skewed by a few billionaires. Which average best represents a typical household?",
      options: [
        "The mean, since it uses all the information",
        "The median, since skew and outliers drag the mean upward",
        "The mode, since most incomes repeat exactly",
        "Whichever of the three is largest",
      ],
      answer: 1,
      explanation:
        "In a right-skewed distribution the mean is pulled above the median; the median is the honest typical value for skewed data like incomes and house prices.",
    },
    {
      id: "descriptive-statistics-p5",
      prompt: "For the dataset 3, 5, 6, 8, 9, 11, 14, the interquartile range is:",
      options: [
        "11 (Q3)",
        "6 (Q3 minus Q1)",
        "8 (the median)",
        "5 (Q1)",
      ],
      answer: 1,
      explanation:
        "The lower half 3, 5, 6 gives Q1 = 5 and the upper half 9, 11, 14 gives Q3 = 11, so the IQR is 11 − 5 = 6.",
    },
    {
      id: "descriptive-statistics-p6",
      prompt: "A histogram of website response times shows a long right tail. Which statement must be true?",
      options: [
        "The mean equals the median",
        "The mean is greater than the median",
        "The median is greater than the mean",
        "The histogram must be bimodal",
      ],
      answer: 1,
      explanation:
        "Right skew drags the mean above the median — the direction of the mean-median gap is a quick skewness diagnostic.",
    },
    {
      id: "descriptive-statistics-p7",
      prompt: "A dataset has Q1 = 20 and Q3 = 40. By the 1.5 × IQR rule, which value would be flagged as a potential outlier?",
      options: [
        "75",
        "35",
        "10",
        "68",
      ],
      answer: 0,
      explanation:
        "The IQR is 20, so the fences are 20 − 30 = −10 and 40 + 30 = 70. Only 75 lies beyond the upper fence; 68 is large but inside.",
    },
    {
      id: "descriptive-statistics-p8",
      prompt: "A bar chart comparing customer satisfaction of 85% vs 87% starts its y-axis at 84% instead of zero. What is the honest read?",
      options: [
        "The truncated axis exaggerates a small 2-point difference",
        "The chart is fine because the axis is clearly labeled",
        "A 2-point difference is always practically important",
        "Bar charts are simply inappropriate for percentages",
      ],
      answer: 0,
      explanation:
        "Cutting the axis makes a modest difference fill the whole chart — a classic misleading-chart trick. Check the axis before reacting to the visual.",
    },
    {
      id: "descriptive-statistics-p9",
      prompt: "City A reported 200 burglaries last year; City B reported 90. City A has 500,000 residents and City B has 100,000. Which city has the higher burglary rate?",
      options: [
        "City A — it had more than twice the burglaries",
        "City B — 90 per 100,000 residents versus City A's 40 per 100,000",
        "They are the same, because both figures are from the same year",
        "City A — because larger cities are always safer",
      ],
      answer: 1,
      explanation:
        "Counts lie without denominators: A's rate is 200 per 500,000 = 40 per 100,000, B's is 90 per 100,000 — more than double. Rates, not raw counts, compare cities.",
    },
    {
      id: "descriptive-statistics-p10",
      prompt: "A product's star ratings show two peaks — many 1-star and many 5-star reviews, few in between. What is the honest summary of the typical rating?",
      options: [
        "The mean rating alone — it balances the two camps",
        "The median alone — it ignores the extremes",
        "A description of the shape: the ratings are bimodal, loved or hated, and both groups are real",
        "The mode — it is the most robust statistic",
      ],
      answer: 2,
      explanation:
        "A bimodal distribution is two populations disagreeing; any single number hides that. Describe the shape — 'customers love it or hate it' — instead.",
    },
  ],

  "statistics-thinking": [
    {
      id: "statistics-thinking-p1",
      prompt: "In a data table where each row is one student and the columns are age, major, and GPA, the students are called:",
      options: [
        "Variables",
        "Cases (observational units)",
        "Parameters",
        "Samples",
      ],
      answer: 1,
      explanation:
        "Rows are cases — the units observed; columns are variables — what was recorded about each case.",
    },
    {
      id: "statistics-thinking-p2",
      prompt: "A researcher surveys 500 residents to estimate the average commute time of all 780,000 residents of a city. The city-wide average commute is called a:",
      options: [
        "Statistic",
        "Parameter",
        "Sample",
        "Census",
      ],
      answer: 1,
      explanation:
        "The population value is the parameter (usually unknown); the number computed from the sample is the statistic that estimates it.",
    },
    {
      id: "statistics-thinking-p3",
      prompt: "T-shirt sizes (small, medium, large) form which type of variable?",
      options: [
        "Categorical, unordered",
        "Ordinal — categories with a meaningful order",
        "Numeric, discrete",
        "Numeric, continuous",
      ],
      answer: 1,
      explanation:
        "The categories have a meaningful order but no measurable distance between them — ordinal data, not numeric.",
    },
    {
      id: "statistics-thinking-p4",
      prompt: "Ice cream sales and drowning deaths rise together every summer. Summer heat is best described as:",
      options: [
        "A mediator that transmits the effect of swimming to ice cream",
        "A confounder — a common cause of both variables",
        "Proof that ice cream sales cause drownings",
        "A sampling error",
      ],
      answer: 1,
      explanation:
        "Heat raises both swimming exposure (and thus drownings) and ice cream sales; the third variable, not the link, produces the association.",
    },
    {
      id: "statistics-thinking-p5",
      prompt: "A fitness app wants to know how active typical adults are, so it surveys its own users. The main design flaw is:",
      options: [
        "The sample is too small to matter",
        "Selection bias — app users are already more active than average adults",
        "Self-reporting is the only problem worth noting",
        "There is no flaw, because app users are adults",
      ],
      answer: 1,
      explanation:
        "The sampling frame excludes inactive people entirely, so the estimate is systematically too high — a bias no sample size can fix.",
    },
    {
      id: "statistics-thinking-p6",
      prompt: "A school wants to know whether a new reading program causes better scores. Which design supports a causal conclusion?",
      options: [
        "Compare schools that adopted the program with schools that did not",
        "Randomly assign some classes to the program and compare them with control classes",
        "Track one class's scores before and after the program",
        "Survey teachers on whether they believe it works",
      ],
      answer: 1,
      explanation:
        "Random assignment balances both known and unknown confounders between groups — only experiments license the word 'causes'.",
    },
    {
      id: "statistics-thinking-p7",
      prompt: "'Are we losing good customers?' is a weak statistical question mainly because:",
      options: [
        "It cannot be answered with numbers at all",
        "It never defines what counts as a good customer, what losing means, or over what period",
        "Questions about customers require qualitative methods only",
        "It asks two things, and combining questions is impossible",
      ],
      answer: 1,
      explanation:
        "It needs operationalization: define good (tenure, spend), losing (churn versus a benchmark), and the time window — then it is answerable.",
    },
    {
      id: "statistics-thinking-p8",
      prompt: "The 1936 Literary Digest poll collected 2.4 million responses yet predicted the wrong presidential winner. Its deepest lesson is:",
      options: [
        "Big data always beats small samples",
        "A huge sample cannot fix a biased sampling frame and heavy nonresponse",
        "Mail surveys should never be used for elections",
        "The sample was simply too small to be reliable",
      ],
      answer: 1,
      explanation:
        "The Digest drew its frame from car registrations, phone lists, and its own subscribers — wealthier, Republican-leaning voters in the Depression — while a far smaller Gallup sample with a better frame called the election correctly.",
    },
    {
      id: "statistics-thinking-p9",
      prompt: "An observational study reports that coffee drinkers have higher incomes. What can be legitimately concluded?",
      options: [
        "Drinking coffee raises income",
        "Higher income leads to more coffee drinking",
        "Coffee and income are associated in this study — no causal direction is established",
        "Nothing at all; the study is worthless",
      ],
      answer: 2,
      explanation:
        "Observational data supports association only; confounders such as work culture and city income were never controlled.",
    },
    {
      id: "statistics-thinking-p10",
      prompt: "A team measures 'customer satisfaction' by counting clicks on a happy-face emoji, and a reviewer calls the measure invalid. Validity means:",
      options: [
        "The measure gives the same number on repeated tries",
        "The measure actually captures the concept it claims to capture",
        "The measure is cheap and fast to collect",
        "The measure correlates with revenue",
      ],
      answer: 1,
      explanation:
        "Same-score-on-repeat is reliability. Validity is measuring the right thing at all — a click count can be perfectly reliable and still not be satisfaction.",
    },
  ],

  probability: [
    {
      id: "probability-p1",
      prompt: "If P(A) = 0.3, then P(not A) equals:",
      options: [
        "0.3",
        "0.7",
        "0.5",
        "It cannot be determined without knowing the sample space",
      ],
      answer: 1,
      explanation:
        "The complement rule: P(not A) = 1 − P(A) = 1 − 0.3 = 0.7.",
    },
    {
      id: "probability-p2",
      prompt: "Two events that cannot occur at the same time are called:",
      options: [
        "Independent",
        "Mutually exclusive (disjoint)",
        "Complementary",
        "Conditional",
      ],
      answer: 1,
      explanation:
        "Mutually exclusive events share no outcome — if one occurs, the other cannot. Independent events can perfectly well occur together.",
    },
    {
      id: "probability-p3",
      prompt: "The expected value of a random variable is best described as:",
      options: [
        "The most likely single outcome",
        "The long-run average over many independent repetitions",
        "The midpoint of the possible values",
        "The variance divided by two",
      ],
      answer: 1,
      explanation:
        "Expectation is the probability-weighted average — what the mean converges to over repetitions, not a prediction for any one trial.",
    },
    {
      id: "probability-p4",
      prompt: "You roll two fair dice. The probability of rolling at least one six is:",
      options: [
        "2/6, since either die can show a six",
        "11/36, by the complement rule: 1 − (5/6)²",
        "1/36, since both dice must show a six",
        "6/36, since six outcomes contain a six",
      ],
      answer: 1,
      explanation:
        "P(at least one) = 1 − P(none) = 1 − (5/6)² = 11/36. Adding 1/6 + 1/6 double-counts the double-six.",
    },
    {
      id: "probability-p5",
      prompt: "A and B are independent events with P(A) = 0.5 and P(B) = 0.2. What is P(A and B)?",
      options: [
        "0.7",
        "0.10",
        "0.5",
        "0.3",
      ],
      answer: 1,
      explanation:
        "For independent events, and means multiply: P(A and B) = 0.5 × 0.2 = 0.10.",
    },
    {
      id: "probability-p6",
      prompt: "A disease affects 1% of a population. A test correctly detects it 90% of the time and gives false positives 5% of the time. A randomly chosen person tests positive. The probability they actually have the disease is about:",
      options: [
        "90%",
        "95%",
        "15%",
        "50%",
      ],
      answer: 2,
      explanation:
        "Bayes' rule: (0.9 × 0.01) / (0.9 × 0.01 + 0.05 × 0.99) = 0.009 / 0.0585 ≈ 15%. Most positives are false because the disease is rare — the base-rate trap.",
    },
    {
      id: "probability-p7",
      prompt: "Events A and B are mutually exclusive with P(A) = 0.4 and P(B) = 0.5. What is P(A or B)?",
      options: [
        "0.9 — there is no overlap to double-count",
        "0.20 — the probabilities multiply",
        "0.70 — the overlap is subtracted once",
        "0.45 — the average of the two",
      ],
      answer: 0,
      explanation:
        "For disjoint events the addition rule is plain addition: 0.4 + 0.5 = 0.9, since A and B can never happen together.",
    },
    {
      id: "probability-p8",
      prompt: "A fair coin has landed heads five times in a row. A bettor reasons: 'tails is due.' The correct assessment is:",
      options: [
        "The bettor is right — tails is now more likely to balance the record",
        "The next flip is still 50-50; independent trials have no memory",
        "Heads is now more likely — the coin is hot",
        "The probability depends on how hard the coin was flipped",
      ],
      answer: 1,
      explanation:
        "This is the gambler's fallacy: it treats independence as a self-correcting process. P(heads) stays 0.5 no matter the streak.",
    },
    {
      id: "probability-p9",
      prompt: "In the Monty Hall problem — three doors, one car, the host knowingly reveals a goat and offers a switch — switching wins with probability:",
      options: [
        "1/3, the original odds are unchanged",
        "2/3, because the host's forced reveal concentrates information on the unchosen door",
        "1/2, since only two doors remain",
        "It cannot be computed without knowing the host's strategy",
      ],
      answer: 1,
      explanation:
        "Your first pick wins 1/3 of the time; when it loses (2/3 of the time), the host's knowledgeable reveal leaves the car behind the other closed door. Switch.",
    },
    {
      id: "probability-p10",
      prompt: "A raffle ticket costs $1 and has an expected payoff of $0.60. If you keep buying tickets for years, you should expect to:",
      options: [
        "Break even eventually — expectation guarantees fairness in the long run",
        "Lose about 40 cents per ticket on average",
        "Win a big prize occasionally, which will exactly compensate the losses",
        "Expectation says nothing about long-run outcomes",
      ],
      answer: 1,
      explanation:
        "Expected value is the long-run average: $0.60 − $1.00 = −$0.40 per ticket. Variance shapes the ride, not the average.",
    },
  ],

  "probability-distributions": [
    {
      id: "probability-distributions-p1",
      prompt: "For a continuous random variable X, what is P(X = exactly 5)?",
      options: [
        "The height of the PDF at 5",
        "Zero — probability is area, and a single point has no width",
        "0.5, by symmetry",
        "It depends on the mean and standard deviation",
      ],
      answer: 1,
      explanation:
        "For continuous variables probability is area under the density curve; a point has zero width and hence zero probability. Intervals carry the probability.",
    },
    {
      id: "probability-distributions-p2",
      prompt: "The 68-95-99.7 rule states that for a Normal distribution, about 95% of values fall within:",
      options: [
        "1 standard deviation of the mean",
        "2 standard deviations of the mean",
        "3 standard deviations of the mean",
        "95% of the range from min to max",
      ],
      answer: 1,
      explanation:
        "Roughly 68% within 1 SD, 95% within 2 SD, and 99.7% within 3 SD of the mean — the three numbers that make Normal probabilities computable in your head.",
    },
    {
      id: "probability-distributions-p3",
      prompt: "The Binomial distribution models:",
      options: [
        "The number of rare events in a fixed interval of time",
        "The number of successes in a fixed number of independent trials with constant success probability",
        "A measurement that can take any value in an interval",
        "The waiting time between two events",
      ],
      answer: 1,
      explanation:
        "Binomial counts successes over n independent trials with the same p. Rare events in a fixed window is the Poisson's job.",
    },
    {
      id: "probability-distributions-p4",
      prompt: "Exam scores are Normally distributed with mean 100 and standard deviation 15. A score of 130 corresponds to a z-score of:",
      options: [
        "30",
        "2.0",
        "1.5",
        "0.13",
      ],
      answer: 1,
      explanation:
        "z = (130 − 100) / 15 = 2.0 — two standard deviations above the mean, around the 97.5th percentile.",
    },
    {
      id: "probability-distributions-p5",
      prompt: "A support hotline receives 4 calls per hour on average, randomly and independently. The right model for the number of calls in the next hour is:",
      options: [
        "Binomial(4, 0.5)",
        "Poisson with mean 4",
        "Uniform on 0 to 8",
        "Normal with mean 4",
      ],
      answer: 1,
      explanation:
        "Counts of independent events arriving at a constant average rate in a fixed interval are exactly the Poisson model.",
    },
    {
      id: "probability-distributions-p6",
      prompt: "A CDF takes the value 0.3 at x = 10. This means:",
      options: [
        "30% of values are exactly equal to 10",
        "30% of values fall at or below 10",
        "The PDF's height at 10 is 0.3",
        "10% of values fall at or below 0.3",
      ],
      answer: 1,
      explanation:
        "The CDF accumulates probability from the left: F(10) = 0.3 says 30% of the distribution lies at or below 10 — the 30th percentile.",
    },
    {
      id: "probability-distributions-p7",
      prompt: "A basketball player makes 75% of free throws. In 8 independent attempts, the expected number of makes is:",
      options: [
        "5",
        "6",
        "7",
        "1.5 (the variance)",
      ],
      answer: 1,
      explanation:
        "Binomial expectation is n × p = 8 × 0.75 = 6 makes on average. (The variance np(1−p) = 1.5 is a different animal.)",
    },
    {
      id: "probability-distributions-p8",
      prompt: "Website response times are strongly right-skewed with occasional very long delays. A colleague models them as Normal with the same mean and standard deviation. The main risk is:",
      options: [
        "None — everything becomes Normal eventually",
        "The Normal's thin tails will badly underestimate the probability of extreme delays",
        "The Normal distribution has no mean",
        "Response times must be modeled as Binomial",
      ],
      answer: 1,
      explanation:
        "Heavy-tailed data put far more probability in the extremes than a matched Normal; capacity planning on the Normal model underprepares for the worst days.",
    },
    {
      id: "probability-distributions-p9",
      prompt: "Why does the Normal distribution describe measurement errors so often in practice?",
      options: [
        "Because measurement errors are always small",
        "Because many small, independent sources of error add up, and sums of many small effects tend toward the Normal",
        "Because instruments are designed to produce bell curves",
        "Because the Normal is the easiest distribution to compute with",
      ],
      answer: 1,
      explanation:
        "This is the Central Limit Theorem at work: independent small contributions accumulate into a bell, whatever the shape of each contribution.",
    },
    {
      id: "probability-distributions-p10",
      prompt: "Server failures occur randomly at an average rate of 2 per week. Management demands a guarantee of zero failures next week. The statistically honest answer is:",
      options: [
        "Promise it — on average there are only two",
        "P(zero failures) = e^(−2) ≈ 13.5%, so zero cannot be guaranteed — quantify the risk instead",
        "Guarantee zero, since failures are rare events",
        "The Poisson distribution cannot describe zero events",
      ],
      answer: 1,
      explanation:
        "Poisson(2) puts e^(−2) ≈ 0.135 probability on exactly zero failures. An average rate is a betting odds statement, never a promise.",
    },
  ],

  sampling: [
    {
      id: "sampling-p1",
      prompt: "The sampling frame is:",
      options: [
        "The list of units from which the sample is actually drawn",
        "The set of conclusions the study hopes to draw",
        "The subset of people who respond to the survey",
        "The budget allocated for data collection",
      ],
      answer: 0,
      explanation:
        "The frame is the operational list — voter rolls, phone banks, user accounts. If the frame misses parts of the target population, coverage error follows.",
    },
    {
      id: "sampling-p2",
      prompt: "The standard error of the sample mean measures:",
      options: [
        "How far the sample mean typically is from its own sample's values",
        "How much sample means vary from sample to sample",
        "The bias built into the measuring instrument",
        "How large the population is",
      ],
      answer: 1,
      explanation:
        "Standard error is the standard deviation of the sampling distribution — the wiggle of the mean across repeated samples of the same size.",
    },
    {
      id: "sampling-p3",
      prompt: "A simple random sample means:",
      options: [
        "Every unit has an equal chance of selection, and every subset of that size is equally likely",
        "The first n willing volunteers are taken",
        "Every tenth unit on the list is taken",
        "The researcher hand-picks units to be representative",
      ],
      answer: 0,
      explanation:
        "Equal probability for every subset is the defining property — convenience samples, systematic samples, and judgment samples all fail it.",
    },
    {
      id: "sampling-p4",
      prompt: "A population has standard deviation σ = 20. For random samples of size 100, the standard error of the sample mean is:",
      options: [
        "20",
        "2",
        "0.2",
        "200",
      ],
      answer: 1,
      explanation:
        "SE = σ/√n = 20/10 = 2. The square-root law: a hundredfold sample buys a tenfold reduction in the mean's wiggle.",
    },
    {
      id: "sampling-p5",
      prompt: "A school district surveys students with a small budget, and every grade (9–12) must be represented in the estimates. The best design is:",
      options: [
        "Simple random sampling of all students",
        "Stratified sampling with independent draws from each grade",
        "Cluster sampling of entire homerooms",
        "A convenience sample in the cafeteria",
      ],
      answer: 1,
      explanation:
        "Strata guarantee representation of every group and usually shrink variance for the same budget; clusters are cheaper per unit but less precise for this goal.",
    },
    {
      id: "sampling-p6",
      prompt: "Interviewing every 20th patient on an alphabetical list is an example of:",
      options: [
        "Simple random sampling",
        "Systematic sampling",
        "Stratified sampling",
        "A census",
      ],
      answer: 1,
      explanation:
        "Fixed-interval selection is systematic — cheap and usually fine, but it can resonate badly with periodic patterns hidden in the list.",
    },
    {
      id: "sampling-p7",
      prompt: "The Central Limit Theorem states that for sufficiently large n:",
      options: [
        "The population itself becomes Normal",
        "Every sample mean equals the population mean",
        "The sampling distribution of the mean is approximately Normal, whatever the population's shape",
        "The standard error falls to exactly zero",
      ],
      answer: 2,
      explanation:
        "The CLT is a statement about the distribution of averages, not about the population or any single sample: means behave, even when the data does not.",
    },
    {
      id: "sampling-p8",
      prompt: "A poll's frame badly misses rural households, so the analyst doubles the sample size. The most likely result:",
      options: [
        "The bias shrinks by about half, because error falls with sample size",
        "The systematic error stays essentially unchanged — bigger samples only shrink sampling error",
        "The estimate becomes exactly correct",
        "Nonresponse disappears, removing the bias",
      ],
      answer: 1,
      explanation:
        "Sampling error shrinks with 1/√n; bias does not move at all. A bigger sample just makes the wrong number more precisely wrong.",
    },
    {
      id: "sampling-p9",
      prompt: "The bootstrap estimates uncertainty by:",
      options: [
        "Drawing fresh samples from the full population",
        "Resampling the original sample with replacement and recomputing the statistic on each resample",
        "Re-interviewing the same respondents a second time",
        "Repeatedly halving the sample",
      ],
      answer: 1,
      explanation:
        "The bootstrap treats the one sample you have as a stand-in population; resampling it with replacement builds the statistic's variability from the data alone.",
    },
    {
      id: "sampling-p10",
      prompt: "An exit poll shows Candidate A leading 48% to 45% with a ±3% margin of error. The honest headline is:",
      options: [
        "A leads in a statistical tie — the margin spans the difference",
        "A has a decisive 3-point lead",
        "A will win with 95% probability",
        "The poll is invalid because the lead is small",
      ],
      answer: 0,
      explanation:
        "A three-point lead with a ±3-point margin sits inside the margin for the difference — the honest read is 'too close to call', not 'A pulls ahead'.",
    },
  ],

  "confidence-intervals": [
    {
      id: "confidence-intervals-p1",
      prompt: "A 95% confidence interval means:",
      options: [
        "There is a 95% chance the true parameter lies in this particular computed interval",
        "95% of the data falls inside the interval",
        "The procedure that produced the interval captures the true parameter in about 95% of repeated samples",
        "95% of all sample means fall inside the interval",
      ],
      answer: 2,
      explanation:
        "Confidence describes the long-run coverage of the method, not a probability for one already-computed interval — the most misread sentence in statistics.",
    },
    {
      id: "confidence-intervals-p2",
      prompt: "Compared with the standard Normal distribution, the t distribution has:",
      options: [
        "Thinner tails, because samples are small",
        "Heavier tails, making intervals wider when sigma is estimated from the data",
        "Exactly the same shape at all sample sizes",
        "No center",
      ],
      answer: 1,
      explanation:
        "Estimating σ from the same data adds uncertainty, and the t's fat tails charge for it — converging to the Normal as n grows.",
    },
    {
      id: "confidence-intervals-p3",
      prompt: "The margin of error for a sample proportion at 95% confidence is approximately:",
      options: [
        "1.96 × √(p(1−p)/n)",
        "p(1−p)/n, without the square root",
        "1.96 × p/n",
        "√n / (p(1−p))",
      ],
      answer: 0,
      explanation:
        "Margin of error = critical value × standard error = 1.96 × √(p̂(1−p̂)/n) — the formula behind every '±3 points' in the news.",
    },
    {
      id: "confidence-intervals-p4",
      prompt: "A survey of 400 voters finds 50% support. The 95% margin of error is about:",
      options: [
        "±10%",
        "±5%",
        "±2.5%",
        "±25%",
      ],
      answer: 1,
      explanation:
        "1.96 × √(0.5 × 0.5 / 400) = 1.96 × 0.025 ≈ ±4.9% — the classic ±5 points of a 400-person poll.",
    },
    {
      id: "confidence-intervals-p5",
      prompt: "A sample mean is 100 with standard error 5. Using z = 1.96, the 95% confidence interval is approximately:",
      options: [
        "(95, 105)",
        "(90.2, 109.8)",
        "(84.3, 115.7)",
        "(99, 101)",
      ],
      answer: 1,
      explanation:
        "100 ± 1.96 × 5 = 100 ± 9.8, which gives (90.2, 109.8). The multiplier applies to the standard error, not to the raw spread.",
    },
    {
      id: "confidence-intervals-p6",
      prompt: "To cut the width of a confidence interval in half, you must:",
      options: [
        "Double the sample size",
        "Quadruple the sample size",
        "Raise the confidence level from 95% to 99%",
        "Switch from the z to the t distribution",
      ],
      answer: 1,
      explanation:
        "Width scales with 1/√n: halving the width needs roughly four times the data — the square-root law of precision.",
    },
    {
      id: "confidence-intervals-p7",
      prompt: "You have 15 measurements and do not know the population standard deviation. The correct interval for the mean uses:",
      options: [
        "z = 1.96",
        "The t distribution with 14 degrees of freedom",
        "The t distribution with 15 degrees of freedom",
        "The Normal distribution, because n is larger than 10",
      ],
      answer: 1,
      explanation:
        "Estimating σ from the sample costs one degree of freedom: t with n − 1 = 14, and a heavier critical value than 1.96.",
    },
    {
      id: "confidence-intervals-p8",
      prompt: "A study reports: 'the 95% confidence interval is (2.1, 6.0), so there is a 95% probability the true mean lies between 2.1 and 6.0.' This is:",
      options: [
        "Correct — that is the definition of a confidence interval",
        "A misreading — once computed, the interval is fixed; 95% describes the procedure's long-run coverage",
        "Correct, provided the data is Normal",
        "Wrong because the probability should be 97.5%",
      ],
      answer: 1,
      explanation:
        "Pre-data, the random interval has 95% coverage; post-data, the numbers are fixed. In the frequentist view the parameter is not random, so the '95% chance' sentence is illegal — that's the Bayesian's line.",
    },
    {
      id: "confidence-intervals-p9",
      prompt: "A 99% confidence interval for a treatment effect is (1.2, 88.7) — enormous width. The best conclusion:",
      options: [
        "The treatment works, since the whole interval is above zero",
        "The estimate is too imprecise to decide anything — a larger study is needed",
        "The treatment is proven, because 99% confidence is very high",
        "The study must have been biased",
      ],
      answer: 1,
      explanation:
        "The interval sits above zero, but its width says the effect could be trivial or enormous. 'Significant' is not 'decided' — precision is part of the finding.",
    },
    {
      id: "confidence-intervals-p10",
      prompt: "A poll finds 52% support for a measure, with a 95% confidence margin of error of ±4%. A strategist claims 'a majority supports us.' The honest reply:",
      options: [
        "Correct — 52% is above 50%",
        "Not established — the interval runs from 48% to 56%, which includes a true minority",
        "Correct, because the margin of error is small",
        "Not established, because polls are always wrong",
      ],
      answer: 1,
      explanation:
        "Below 50% lies inside the interval, so a true minority remains plausible. The claim outruns the precision of the estimate.",
    },
  ],

  "hypothesis-testing": [
    {
      id: "hypothesis-testing-p1",
      prompt: "Which statement correctly defines a p-value?",
      options: [
        "The probability that the null hypothesis is true",
        "The probability of data at least as extreme as observed, assuming the null hypothesis is true",
        "The probability that the alternative hypothesis is false",
        "The probability that the study replicates",
      ],
      answer: 1,
      explanation:
        "A p-value is a conditional about the data given the null — never a probability about hypotheses themselves.",
    },
    {
      id: "hypothesis-testing-p2",
      prompt: "A Type I error is:",
      options: [
        "Rejecting a null hypothesis that is actually true — a false alarm",
        "Failing to reject a null hypothesis that is actually false — a missed discovery",
        "Using the wrong test statistic for the data",
        "Choosing the significance level after seeing the data",
      ],
      answer: 0,
      explanation:
        "Type I is the false positive, with probability alpha. The missed discovery is Type II, with probability beta.",
    },
    {
      id: "hypothesis-testing-p3",
      prompt: "The paired t-test is appropriate when:",
      options: [
        "Two independent groups are compared",
        "The same units are measured twice, or observations are matched in pairs",
        "More than two groups are compared at once",
        "The outcome is a proportion rather than a mean",
      ],
      answer: 1,
      explanation:
        "Pairing converts two noisy measurements into one — the per-unit difference — removing unit-to-unit background variation.",
    },
    {
      id: "hypothesis-testing-p4",
      prompt: "A test at significance level alpha = 0.05 yields p = 0.03. The decision is:",
      options: [
        "Reject the null — the result is statistically significant at this level",
        "Accept the null, because 0.03 is a small number",
        "Fail to reject, because p must be below 0.01",
        "The null is proven false with certainty",
      ],
      answer: 0,
      explanation:
        "p < alpha means data this extreme would be surprising under the null, so reject at this level — noting that significance is not proof.",
    },
    {
      id: "hypothesis-testing-p5",
      prompt: "A new process is tested against a standard and the p-value is 0.20. The correct conclusion is:",
      options: [
        "The new process is proven equal to the standard",
        "There is insufficient evidence of a difference — the study may simply be underpowered",
        "The null hypothesis is 20% likely to be true",
        "The true difference is exactly zero",
      ],
      answer: 1,
      explanation:
        "Failing to reject is not proof of equality: absence of evidence may reflect a small sample or noisy measurement, not absence of effect.",
    },
    {
      id: "hypothesis-testing-p6",
      prompt: "An A/B test with a million users per variant finds conversion of 50.10% vs 50.00%, p = 0.001. The correct read:",
      options: [
        "A huge win — the p-value is tiny",
        "Statistically significant but practically negligible — a 0.1 percentage-point lift calls for a cost-benefit judgment, not a launch decision",
        "Not significant, because the difference is tiny",
        "The p-value must be wrong",
      ],
      answer: 1,
      explanation:
        "Huge samples make microscopic differences significant; significance answers detectability, not importance.",
    },
    {
      id: "hypothesis-testing-p7",
      prompt: "A team runs 20 independent tests at alpha = 0.05 on data with no real effects at all. The expected number of 'significant' findings is:",
      options: [
        "Zero — no effects means no findings",
        "About 1 (5% of 20)",
        "20 — everything looks significant",
        "About 10",
      ],
      answer: 1,
      explanation:
        "Each test has a 5% false-positive rate, so expect 20 × 0.05 = 1 'discovery' from pure noise — the arithmetic of multiple testing.",
    },
    {
      id: "hypothesis-testing-p8",
      prompt: "'p = 0.03 means there is a 3% chance the null hypothesis is true.' This statement is:",
      options: [
        "Correct — it is the definition of a p-value",
        "Wrong — the p-value is P(data this extreme | null), not P(null | data)",
        "Correct for one-sided tests only",
        "Correct whenever the sample is large",
      ],
      answer: 1,
      explanation:
        "The p-value conditions on the null being true; the reversed conditional would require a prior — Bayesian territory.",
    },
    {
      id: "hypothesis-testing-p9",
      prompt: "The power of a statistical test is:",
      options: [
        "The probability of rejecting the null when it is true",
        "The probability of detecting a real effect — rejecting the null when it is false",
        "Always equal to one minus alpha",
        "The probability that the null hypothesis is true",
      ],
      answer: 1,
      explanation:
        "Power = 1 − beta, driven by effect size, sample size, and alpha. Low-power studies miss real effects — and exaggerate the ones they catch.",
    },
    {
      id: "hypothesis-testing-p10",
      prompt: "A team checks its running A/B test daily and stops the moment p drops below 0.05. This practice:",
      options: [
        "Is efficient and valid — stopping early saves money",
        "Inflates the false-positive rate far above 5% — repeated peeking is a form of p-hacking",
        "Is fine as long as the final p-value is reported",
        "Reduces the power of the test",
      ],
      answer: 1,
      explanation:
        "Every peek is another chance to cross the threshold by luck; honest options are a pre-fixed sample size or sequential-design corrections.",
    },
  ],

  correlation: [
    {
      id: "correlation-p1",
      prompt: "The Pearson correlation coefficient r ranges over:",
      options: [
        "0 to 1",
        "−1 to +1",
        "−∞ to +∞",
        "0 to 100",
      ],
      answer: 1,
      explanation:
        "r = −1 is a perfect negative line, +1 a perfect positive line, and 0 no linear relationship.",
    },
    {
      id: "correlation-p2",
      prompt: "If X and Y have a Pearson correlation of exactly 0, it means:",
      options: [
        "X and Y are unrelated in every way",
        "There is no linear relationship — a strong nonlinear one can still exist",
        "X causes Y",
        "The data must be Normally distributed",
      ],
      answer: 1,
      explanation:
        "r measures straight-line co-movement only; a perfect U-shape scores r ≈ 0 while Y is fully determined by X.",
    },
    {
      id: "correlation-p3",
      prompt: "Spearman's rank correlation differs from Pearson's because it:",
      options: [
        "Correlates the ranks of the values, capturing monotonic relationships robustly",
        "Only works for categorical variables",
        "Ranges from 0 to 1",
        "Requires both variables to be Normal",
      ],
      answer: 0,
      explanation:
        "Rank-transforming both variables damps the pull of outliers and measures any consistent monotone association, not just linear ones.",
    },
    {
      id: "correlation-p4",
      prompt: "Heights measured in centimeters correlate with weights in kilograms at r = 0.80. If heights are converted to inches, the correlation becomes:",
      options: [
        "0.80 — r is unchanged by linear unit conversions",
        "Smaller, because inches are larger units",
        "Larger, because inches compress the spread",
        "Undefined until the conversion is applied",
      ],
      answer: 0,
      explanation:
        "r standardizes both variables as part of its construction, so linear changes of unit — cm to inches, kg to pounds — leave it untouched.",
    },
    {
      id: "correlation-p5",
      prompt: "A scatterplot shows a tight U-shaped curve. The Pearson correlation will be:",
      options: [
        "Close to +1",
        "Close to 0 — the two arms of the U cancel in the covariance",
        "Close to −1",
        "Undefined for nonlinear data",
      ],
      answer: 1,
      explanation:
        "The upward and downward arms contribute offsetting covariance, so r collapses — which is why you plot before you summarize.",
    },
    {
      id: "correlation-p6",
      prompt: "Study hours and exam scores have r = 0.8. The value r² = 0.64 means:",
      options: [
        "64% of students passed the exam",
        "64% of the variance in scores is explained by the linear relationship with study hours",
        "Studying causes 64% of the score",
        "The correlation is 64% reliable",
      ],
      answer: 1,
      explanation:
        "r² is the shared-variance fraction of the linear model — a statement about prediction, not causation.",
    },
    {
      id: "correlation-p7",
      prompt: "Thirty points show essentially no relationship (r ≈ 0.05). Adding one extreme point in the far top-right corner moves r to 0.6. The best explanation:",
      options: [
        "The new point reveals the true relationship that was always there",
        "A single high-leverage outlier can manufacture a correlation — Pearson's r is not robust",
        "The original thirty points must contain errors",
        "r always grows when you add data",
      ],
      answer: 1,
      explanation:
        "One extreme point can dominate the covariance and manufacture (or destroy) an r — always check influence before believing the number.",
    },
    {
      id: "correlation-p8",
      prompt: "Cities with more churches have more crime. The most likely explanation is:",
      options: [
        "Churches cause crime",
        "Crime causes church-building",
        "Population — a confounder that drives both church count and crime count",
        "A sampling error in the crime data",
      ],
      answer: 2,
      explanation:
        "Bigger cities have more of everything; the common cause of both counts produces a spurious correlation.",
    },
    {
      id: "correlation-p9",
      prompt: "In the 1973 UC Berkeley graduate admissions data, men were admitted at a higher rate overall, yet department by department women did as well or better. This phenomenon is:",
      options: [
        "Sampling bias in the applicant pool",
        "Simpson's paradox — the aggregate direction reverses once the hidden variable (department selectivity) is included",
        "Proof that every department discriminated",
        "A computational error in the aggregation",
      ],
      answer: 1,
      explanation:
        "Women applied disproportionately to the most competitive departments; conditioning on that third variable flips the story — Simpson's classic reversal.",
    },
    {
      id: "correlation-p10",
      prompt: "Among NBA players, height correlates only weakly with scoring. A fan concludes height doesn't matter for basketball. The flaw is:",
      options: [
        "The fan is right — the data settles it",
        "Restricted range — NBA players are already selected for height, hiding the strong relationship present in the general population",
        "Correlation cannot be computed on athletes",
        "Scoring is a categorical variable",
      ],
      answer: 1,
      explanation:
        "Slicing off one tail of a strong relationship collapses the correlation — selection effects attenuate r.",
    },
  ],

  regression: [
    {
      id: "regression-p1",
      prompt: "The least-squares regression line is chosen to minimize:",
      options: [
        "The sum of vertical distances from points to the line",
        "The sum of squared residuals — squared vertical distances from points to the line",
        "The sum of horizontal distances from points to the line",
        "The maximum distance from any single point to the line",
      ],
      answer: 1,
      explanation:
        "Squaring punishes big misses and makes the optimization solvable with clean algebra — hence 'least squares'.",
    },
    {
      id: "regression-p2",
      prompt: "R² in a regression measures:",
      options: [
        "The probability that the model is correct",
        "The fraction of variance in the response explained by the model",
        "The average size of the residuals",
        "The slope of the fitted line",
      ],
      answer: 1,
      explanation:
        "R² contrasts the model's error with the variance around the mean alone: 0 means no better than the mean, 1 a perfect fit.",
    },
    {
      id: "regression-p3",
      prompt: "In a regression of salary (dollars) on years of experience, the slope is measured in:",
      options: [
        "Years per dollar",
        "Dollars per additional year of experience",
        "Unitless correlation",
        "Dollars squared",
      ],
      answer: 1,
      explanation:
        "Slope is the change in y per one-unit change in x: dollars of salary per extra year of experience.",
    },
    {
      id: "regression-p4",
      prompt: "A regression of salary (in $1000s) on years of experience gives intercept 30 and slope 2.5. The predicted salary at 8 years of experience is:",
      options: [
        "$32,500",
        "$50,000",
        "$80,000",
        "$23,000",
      ],
      answer: 1,
      explanation:
        "ŷ = 30 + 2.5 × 8 = 50 → $50,000. The intercept is the starting salary; the slope is the raise per year.",
    },
    {
      id: "regression-p5",
      prompt: "A model was fitted on house sizes ranging from 20 to 60 square meters. A colleague uses it to predict the price at 200 square meters. This is:",
      options: [
        "Safe — the line extends naturally beyond the data",
        "Extrapolation — the relationship may change beyond the observed range, so the prediction is untrustworthy",
        "Fine as long as R² is high",
        "Only safe for log-transformed data",
      ],
      answer: 1,
      explanation:
        "A model only vouches for the range it has seen; beyond it, curvature and market regime changes wait unseen.",
    },
    {
      id: "regression-p6",
      prompt: "A residual plot shows a clear U-shaped pattern. The correct diagnosis is:",
      options: [
        "All assumptions are satisfied — the fit is fine",
        "The linearity assumption fails — the linear model misses curvature, so transform or add terms",
        "The residuals are too small to matter",
        "The data must be Normally distributed",
      ],
      answer: 1,
      explanation:
        "Residuals should be patternless noise; a curve in the residual plot is the model confessing it bent the truth straight.",
    },
    {
      id: "regression-p7",
      prompt: "In a multiple regression of salary on years of education and years of experience, the coefficient on education means:",
      options: [
        "The average salary difference per education year, ignoring experience",
        "The expected salary change per additional education year, holding experience fixed",
        "The total effect of education including its path through experience",
        "The correlation between education and salary",
      ],
      answer: 1,
      explanation:
        "Partial slopes answer 'holding the other predictors constant' — that ceteris paribus reading is the entire point of controls.",
    },
    {
      id: "regression-p8",
      prompt: "Two ad-spend predictors correlate at 0.95, and their regression coefficients swing wildly and even flip sign between samples. The diagnosis:",
      options: [
        "The response variable was measured wrong",
        "Collinearity — the predictors carry the same information, so their individual coefficients are unstable",
        "The sample is too large",
        "The residuals are non-Normal",
      ],
      answer: 1,
      explanation:
        "Near-duplicate predictors split credit arbitrarily; predictions may survive, but explanation collapses. Check collinearity before interpreting slopes.",
    },
    {
      id: "regression-p9",
      prompt: "A model has R² = 0.99, but its residual plot fans out — bigger spread at bigger predicted values. The honest assessment:",
      options: [
        "Excellent — R² is nearly perfect",
        "A high R² with a fan shape signals assumption violations; prediction uncertainty is being wrongly quantified",
        "The model needs no further checks",
        "R² is invalid for regression models",
      ],
      answer: 1,
      explanation:
        "Heteroscedasticity breaks the constant-variance assumption: point predictions may look fine while intervals and p-values mislead.",
    },
    {
      id: "regression-p10",
      prompt: "A regression of city drownings on ice cream sales fits well (R² = 0.7), and the mayor wants to ban ice cream to reduce drownings. The statistician's reply:",
      options: [
        "The model supports the ban — the fit is strong",
        "A good predictive fit is not a causal effect; summer heat drives both, so the ban would not reduce drownings",
        "Regression cannot be used to predict drownings",
        "The R² is too low to inform policy",
      ],
      answer: 1,
      explanation:
        "Regression on observational data captures association; using a coefficient for intervention requires causal justification, not just a good fit.",
    },
  ],

  "bayesian-statistics": [
    {
      id: "bayesian-statistics-p1",
      prompt: "The posterior distribution is proportional to:",
      options: [
        "The prior times the likelihood",
        "The likelihood alone",
        "The prior plus the likelihood",
        "The likelihood divided by the prior",
      ],
      answer: 0,
      explanation:
        "Posterior ∝ prior × likelihood: belief before the data, reweighted by how well each hypothesis explains the data you actually saw.",
    },
    {
      id: "bayesian-statistics-p2",
      prompt: "A 95% credible interval is correctly interpreted as:",
      options: [
        "95% of repeated intervals will cover the truth",
        "Given the data and the prior, the parameter lies in the interval with probability 95%",
        "95% of the observed data falls inside the interval",
        "The procedure is correct 95% of the time in the long run",
      ],
      answer: 1,
      explanation:
        "In the Bayesian view the parameter is what is uncertain and the data is fixed — so the direct probability statement is legal. That is exactly what a confidence interval may not say.",
    },
    {
      id: "bayesian-statistics-p3",
      prompt: "A conjugate prior is one for which:",
      options: [
        "The posterior belongs to the same family as the prior (e.g., Beta prior with Binomial data)",
        "The prior has no influence on the posterior",
        "The likelihood must be Normal",
        "The data cancels out of the update",
      ],
      answer: 0,
      explanation:
        "Conjugacy keeps the posterior in a known family: a Beta prior plus Binomial data gives a Beta posterior, updating like pseudo-counts.",
    },
    {
      id: "bayesian-statistics-p4",
      prompt: "A bag holds one fair coin and one double-headed coin. You draw one at random, flip it once, and get heads. The probability you drew the double-headed coin is:",
      options: [
        "1/2, because the draw was random",
        "2/3, by Bayes' rule",
        "1, because heads appeared",
        "1/4",
      ],
      answer: 1,
      explanation:
        "The double-headed coin explains heads twice as well: (1 × 0.5) / (1 × 0.5 + 0.5 × 0.5) = 0.5/0.75 = 2/3.",
    },
    {
      id: "bayesian-statistics-p5",
      prompt: "You place a Beta(2, 2) prior on a conversion rate, then observe 8 conversions and 2 non-conversions. The posterior is:",
      options: [
        "Beta(8, 2)",
        "Beta(10, 4)",
        "Beta(2, 2) — the prior dominates the data",
        "Beta(6, 0)",
      ],
      answer: 1,
      explanation:
        "Beta-Binomial conjugacy adds the pseudo-counts: Beta(2 + 8, 2 + 2) = Beta(10, 4).",
    },
    {
      id: "bayesian-statistics-p6",
      prompt: "You update a posterior twice: once with Monday's data, then with Tuesday's. Had you processed the two days in the opposite order, the final posterior would be:",
      options: [
        "Different — the most recent data always dominates",
        "Identical — sequential updating is order-invariant",
        "Undefined when the batch sizes differ",
        "Twice as concentrated",
      ],
      answer: 1,
      explanation:
        "Yesterday's posterior is today's prior, and multiplication commutes — the arrival order of the evidence does not change the destination.",
    },
    {
      id: "bayesian-statistics-p7",
      prompt: "With a Beta(10, 4) posterior for a conversion rate, the posterior mean is approximately:",
      options: [
        "10/14 ≈ 0.71",
        "10/4 = 2.5",
        "0.5, by symmetry",
        "4/10 = 0.40",
      ],
      answer: 0,
      explanation:
        "The Beta mean is α/(α + β) = 10/14 ≈ 0.71 — pseudo-successes over all pseudo-counts.",
    },
    {
      id: "bayesian-statistics-p8",
      prompt: "The key difference between a 95% credible interval and a 95% confidence interval is:",
      options: [
        "There is none — they mean the same thing",
        "The credible interval permits a direct probability statement about the parameter; the confidence interval only describes its procedure's long-run coverage",
        "The credible interval is always narrower",
        "The confidence interval requires a prior distribution",
      ],
      answer: 1,
      explanation:
        "Credible: P(parameter in interval | data) = 0.95. Confidence: 95% of intervals from repeated use cover the truth — no probability statement for any single interval.",
    },
    {
      id: "bayesian-statistics-p9",
      prompt: "A manager dismisses your Bayesian analysis: 'You chose the prior, so the result is subjective garbage.' The professional response is:",
      options: [
        "Agree, and switch to p-values, which are assumption-free",
        "Present a sensitivity analysis — weakly informative, skeptical, and data-based priors — and show whether the decision changes across them",
        "Move the prior choice to an appendix where nobody reads it",
        "Insist that priors are objective facts",
      ],
      answer: 1,
      explanation:
        "Prior influence is disclosed and stress-tested, not denied. If defensible priors agree on the decision, the conclusion is robust; if they disagree, that disagreement is itself the finding.",
    },
    {
      id: "bayesian-statistics-p10",
      prompt: "In a Bayesian A/B test, the posterior gives P(variant B beats variant A) = 0.93. Compared with the classic p-value framing, this statement is:",
      options: [
        "Equivalent to a p-value of 0.07",
        "A direct posterior probability about the hypotheses — the question stakeholders actually ask — which a p-value cannot provide",
        "Invalid — probabilities about hypotheses are meaningless",
        "Only valid after a multiple-testing correction",
      ],
      answer: 1,
      explanation:
        "Bayesian analysis answers in the currency of the decision: the probability that B is better given prior and data. A p-value instead answers the probability of extreme data under a null.",
    },
  ],

  "statistical-inference": [
    {
      id: "statistical-inference-p1",
      prompt: "Maximum likelihood estimation chooses the parameter value that:",
      options: [
        "Minimizes the sum of squared errors",
        "Maximizes the probability of the observed data under the model",
        "Always equals the sample mean",
        "Requires an informative prior",
      ],
      answer: 1,
      explanation:
        "MLE climbs the likelihood curve: among candidate parameter values, it picks the one that makes your actual data most probable.",
    },
    {
      id: "statistical-inference-p2",
      prompt: "A permutation test builds its null distribution by:",
      options: [
        "Assuming Normality and computing a t statistic",
        "Repeatedly shuffling group labels and recomputing the statistic on each shuffle",
        "Bootstrapping confidence intervals from the pooled sample",
        "Comparing medians across strata",
      ],
      answer: 1,
      explanation:
        "Under the null, labels are exchangeable — shuffling them simulates worlds of pure chance and shows where the observed statistic falls among them.",
    },
    {
      id: "statistical-inference-p3",
      prompt: "The winner's curse in discovery research refers to:",
      options: [
        "The first study of an effect always being fraudulent",
        "Discovered effects tending to be exaggerated — the largest of many noisy estimates shrinks upon replication",
        "Winning results being impossible to replicate in principle",
        "Replication studies always being smaller than the original",
      ],
      answer: 1,
      explanation:
        "Selecting the maximum of noisy estimates biases it upward; the follow-up regresses toward the true effect, which the original overshoots.",
    },
    {
      id: "statistical-inference-p4",
      prompt: "The maximum likelihood estimate of a success probability from 7 successes in 20 independent trials is:",
      options: [
        "0.35",
        "0.5",
        "7",
        "0.65",
      ],
      answer: 0,
      explanation:
        "For a Binomial, the likelihood peaks at p̂ = successes/trials = 7/20 = 0.35.",
    },
    {
      id: "statistical-inference-p5",
      prompt: "You need a confidence interval for the median of a skewed distribution, and no textbook formula exists. The right tool is:",
      options: [
        "The t interval — it is robust to everything",
        "A bootstrap percentile interval built from resamples of the data",
        "The z interval with n replaced by n/2",
        "A chi-square test on the median",
      ],
      answer: 1,
      explanation:
        "The bootstrap works on any statistic you can compute: resample, recompute the median each time, and read percentiles off the resampling distribution.",
    },
    {
      id: "statistical-inference-p6",
      prompt: "Mean squared error decomposes as bias² + variance. Comparing an estimator with zero bias but huge variance against one with small bias and tiny variance:",
      options: [
        "The unbiased one is always better",
        "Either can have smaller total error — accuracy and stability trade off",
        "Variance stops mattering once bias is zero",
        "Both estimators are useless",
      ],
      answer: 1,
      explanation:
        "A wildly swinging unbiased estimator can have larger MSE than a mildly biased, stable one — the bias-variance trade-off in one line.",
    },
    {
      id: "statistical-inference-p7",
      prompt: "A likelihood ratio of 12 for hypothesis A versus hypothesis B means:",
      options: [
        "A is 12 times more probable than B",
        "The observed data is 12 times more probable under A than under B",
        "B is 12 times more probable than A",
        "The p-value is 12%",
      ],
      answer: 1,
      explanation:
        "Likelihood ratios compare how well hypotheses explain the data — converting them into probabilities about hypotheses would require priors.",
    },
    {
      id: "statistical-inference-p8",
      prompt: "A growth team tests 200 feature variants per quarter at alpha = 0.05 and ships every variant with p < 0.05. Many 'wins' fail in production. The best statistical diagnosis:",
      options: [
        "The features simply degrade once shipped",
        "With 200 tests, roughly 10 false positives per quarter are expected from pure noise — multiple testing demands correction or holdout validation",
        "Alpha should be raised to 0.10 to catch more true winners",
        "The p-values must have been computed incorrectly",
      ],
      answer: 1,
      explanation:
        "At a 5% false-positive rate, 200 tests on null effects yield about 10 'significant' winners that are pure noise — pre-registration, correction, or a holdout panel is the fix.",
    },
    {
      id: "statistical-inference-p9",
      prompt: "Athletes who appear on a magazine cover seem to perform worse afterward — the 'jinx.' The statistical explanation is:",
      options: [
        "The media attention genuinely distracts athletes",
        "Regression to the mean — cover athletes are selected for exceptional seasons, which naturally drift back toward their average",
        "Journalists systematically pick declining athletes",
        "A small-sample fluke that cannot be explained",
      ],
      answer: 1,
      explanation:
        "Extreme performance is part luck; the follow-up regresses toward the athlete's average. No causal story about the magazine is needed.",
    },
    {
      id: "statistical-inference-p10",
      prompt: "A trial reports: 'Treatment works (p = 0.04, effect size d = 0.05, 95% CI [0.002, 0.09]).' The honest summary for a decision-maker is:",
      options: [
        "The treatment works — p is below 0.05",
        "The effect is statistically significant but practically tiny — the interval says the true effect is close to zero, so decide on costs and context",
        "The treatment is proven useless",
        "The p-value proves the effect is large",
      ],
      answer: 1,
      explanation:
        "With a large sample, trivial effects clear the significance bar; the effect size and interval carry the practical story. A p-value alone is never a decision.",
    },
  ],
};
