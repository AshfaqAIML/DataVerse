/**
 * SCHOOL I — CAREER DEVELOPMENT placement banks.
 *
 * Exactly 10 questions per subject, keyed by subject slug. The mix per bank
 * is 3 recall / 4 applied / 3 judgment, spanning every module of the subject.
 */
import type { PlacementBank, PlacementQuestion } from "../../types";

/** Compact authoring helper for one placement question. */
const q = (
  id: string,
  prompt: string,
  options: [string, string, string, string],
  answer: number,
  explanation: string
): PlacementQuestion => ({ id, prompt, options, answer, explanation });

export const schoolIPlacement: PlacementBank = {
  "portfolio-projects": [
    q(
      "portfolio-projects-p1",
      "According to the course, the four-part skeleton of a portfolio-worthy project is:",
      [
        "Title, code, tests, and deployment",
        "Dataset, notebook, model, and dashboard",
        "Question, data, analysis, and artifact",
        "Hypothesis, p-value, chart, and table",
      ],
      2,
      "The skeleton runs from a question worth asking, through data and analysis, to an artifact the reader walks away holding — each part exists to serve the next."
    ),
    q(
      "portfolio-projects-p2",
      "The course says every portfolio project implicitly makes three claims. Which set?",
      [
        "Competence, judgment, and communication",
        "Speed, scale, and salary expectations",
        "Novelty, difficulty, and originality",
        "Volume, variety, and visual polish",
      ],
      0,
      "A project is evidence: it claims you can do the work (competence), choose sensibly under uncertainty (judgment), and explain results to others (communication)."
    ),
    q(
      "portfolio-projects-p3",
      "The Two-Weekend Rule from the scoping chapter is best described as:",
      [
        "A rule that projects must be finished in exactly two weekends",
        "A sizing discipline: scope the project so a working version exists by a fixed date",
        "A rule to review someone else's project twice before starting yours",
        "A guideline to spend one weekend on data cleaning and one on modeling",
      ],
      1,
      "The rule fixes a ship date first, then cuts scope until the project fits — the working version is the goal, not a side effect of open-ended tinkering."
    ),
    q(
      "portfolio-projects-p4",
      "Your exploratory project reports average delivery time per city and the averages all look boring. Following the exploration-with-a-twist blueprint, the strongest next move is to:",
      [
        "Add more cities so the averages are more reliable",
        "Replace the averages with a deep-learning forecast of delivery times",
        "Delete the project and start over with a trendier dataset",
        "Break the averages into segments — time of day, weather, distance band — and hunt for a segment where the headline misleads",
      ],
      3,
      "The twist is finding where the summary misleads: segmenting often reveals a subgroup that drives, or hides, the headline average — the finding a panel remembers."
    ),
    q(
      "portfolio-projects-p5",
      "In the supervised-model blueprint, what must the write-up include for the evaluation to count as honest?",
      [
        "Only the best metric, presented prominently",
        "A comparison to a baseline plus the metric, with limitations stated",
        "A leaderboard screenshot from a public competition",
        "A promise to improve the model in a future version",
      ],
      1,
      "A number without a baseline is unfalsifiable; honest evaluation reports the metric against a baseline and names the caveats a reviewer would find anyway."
    ),
    q(
      "portfolio-projects-p6",
      "According to the README lessons, the first screen of a project's README should show:",
      [
        "The complete change log and every contributor",
        "The project's question, a headline chart or screenshot, and the key finding",
        "Your full CV and a list of every course you have taken",
        "The raw data files, uncompressed, for transparency",
      ],
      1,
      "Reviewers skim: the question, one strong image, and the key finding earn the rest of the read. Everything else exists to support those three elements."
    ),
    q(
      "portfolio-projects-p7",
      "Before building on a dataset you found online, the vetting lesson says to check five things. Which of these is NOT one of them?",
      [
        "The license — whether you may use the data and publish results",
        "The documentation — what the fields mean and how data was collected",
        "The programming language the data provider prefers",
        "The freshness — when it was last updated and whether that matters for your question",
      ],
      2,
      "License, documentation, freshness, source, and a quality sample are the five checks; the provider's programming language has no bearing on whether the data can defend your project."
    ),
    q(
      "portfolio-projects-p8",
      "Your project runs long and the ship date arrives. Which cut best preserves the project's story?",
      [
        "Drop the secondary analysis extension but keep the question-to-artifact chain and README intact",
        "Ship without a README and add one later if anyone asks",
        "Remove the limitations section so the project looks more finished",
        "Delay the ship date indefinitely until the extra analysis is perfect",
      ],
      0,
      "Scope cuts should remove breadth, not the spine: question, data, analysis, artifact, README. Cutting the README or limitations destroys the evidence; delaying abandons the shipping habit."
    ),
    q(
      "portfolio-projects-p9",
      "Candidate A kept a sentiment project private for three months perfecting the model. Candidate B shipped a version one with a README and an issue list, then improved it twice in public. A hiring reviewer following this course prefers B's project primarily because:",
      [
        "Sentiment analysis only impresses when shipped early",
        "Version numbers look more professional than private repositories",
        "Private repositories cannot be evaluated for technical quality",
        "Shipped work proves delivery, invites feedback, and shows iteration — the habits panels want evidence of",
      ],
      3,
      "Shipping beats polishing: a public version one demonstrates delivery under real constraints and starts the feedback loop. Private work can be reviewed when shared, but it never shows those habits."
    ),
    q(
      "portfolio-projects-p10",
      "Which project would interview best, judged by this course's criteria?",
      [
        "A re-run of a famous tutorial, published exactly as the guide wrote it",
        "A well-scoped public repo: a specific question, a vetted dataset, honest analysis, a memorable chart, and a README that stands alone",
        "An ambitious self-driving-car simulator, unfinished, with a placeholder README",
        "A Kaggle competition entry with a high leaderboard rank but no write-up",
      ],
      1,
      "Panels reward projects they can read and believe: a defensible question, vetted data, honest analysis, and a stand-alone README. Tutorial clones and rank-only entries prove less than they appear to."
    ),
  ],

  "github-portfolio": [
    q(
      "github-portfolio-p1",
      "Your GitHub profile README renders on your profile page when you create a repository that is:",
      [
        "Named 'profile' with a README.md on the default branch",
        "Named exactly your username, containing a README.md, and set to public",
        "Named exactly your username, in any visibility, containing any file",
        "Created automatically when you sign up — no action needed",
      ],
      1,
      "GitHub renders a README from a public repository whose name matches your username. Private repositories never show one, and no other file is picked up."
    ),
    q(
      "github-portfolio-p2",
      "How many repositories can be pinned on your GitHub profile?",
      [
        "Three",
        "Twelve",
        "As many as you like",
        "Six",
      ],
      3,
      "Pinning is limited to six repositories, which is exactly why curation matters: the fixed slots force you to choose what represents you."
    ),
    q(
      "github-portfolio-p3",
      "In this course, a GitHub release is best described as:",
      [
        "A nightly automatic backup of every commit",
        "A pointer to a commit used only for rollback",
        "A marked, downloadable version of the repository that tells readers what changed",
        "A GitHub Pages deployment log",
      ],
      2,
      "Releases attach notes and files to a tag, marking a version others can actually run — a trust signal that the project reached a working state."
    ),
    q(
      "github-portfolio-p4",
      "Which commit history would read best to a technical reviewer?",
      [
        "One commit, 'finished project', pushed the night before the application",
        "Dozens of small commits with imperative messages like 'add null check to parser' and 'fix chart axis labels', spread over weeks",
        "A hundred commits in one day, all reading 'update' and 'asdf' in alternation",
        "Frequent commits, each bundling unrelated changes with generator-produced messages",
      ],
      1,
      "Small, incremental commits with imperative, specific messages show the work developing over time — history is evidence of process, not just a save log."
    ),
    q(
      "github-portfolio-p5",
      "The Ten-Second Repository Test asks whether a stranger can grasp a repository in one glance. Which repository fails the test outright?",
      [
        "A repo named 'sales-dashboard' with the description 'Interactive sales dashboard' and a README with a screenshot",
        "A repo named 'churn-analysis' whose description names the question and the dataset",
        "A repo named 'nlp-notes' whose description says it holds personal study notes",
        "A repo named 'project2-final' with no description and an empty README",
      ],
      3,
      "A vague name, a missing description, and an empty README mean a stranger learns nothing in ten seconds — the exact failure the test exists to catch."
    ),
    q(
      "github-portfolio-p6",
      "You want a clickable, live version of your analysis project so reviewers can try it. The course's recommended mechanism is:",
      [
        "Emailing a zip of the notebook with setup instructions",
        "GitHub Pages, serving an exported HTML report or static site straight from the repository",
        "Granting reviewers SSH access to your laptop",
        "Pasting the plots into commit messages so they appear on the graph",
      ],
      1,
      "GitHub Pages turns an exported report or small static site into a URL served from the same repository — the demo and the code live together."
    ),
    q(
      "github-portfolio-p7",
      "What does the course say the contribution graph ('green squares') does and does not signal?",
      [
        "It is a public work log: consistent real work tends to fill it, it says nothing about code quality, and streak-gaming commits are transparent",
        "It certifies skill level — a gray graph means a weak programmer",
        "It is the primary hiring signal at most companies",
        "It counts only commits made to repositories you own",
      ],
      0,
      "The graph is a byproduct of working in public, and reviewers treat it as weak evidence of consistency at best. Contributions to others' repositories do count, so the ownership claim is also false."
    ),
    q(
      "github-portfolio-p8",
      "You want your first open source contribution. Which plan matches the course's advice?",
      [
        "Pick a large famous framework and open a pull request rewriting its core module",
        "Read a project's contributing guide, find an issue labeled 'good first issue', discuss before coding, and submit a small patch — documentation fixes count",
        "Open five pull requests across five projects in one afternoon to maximize your chances",
        "Wait until you have mastered the entire codebase before contacting any maintainer",
      ],
      1,
      "A starter contribution is about following the project's process on a small, agreed change. Core rewrites and drive-by mass PRs signal the opposite of collaborability."
    ),
    q(
      "github-portfolio-p9",
      "You have two polished projects, three decent small utilities, and four abandoned experiments. Which pinning choice tells the best story?",
      [
        "Pin the two polished projects and the four abandoned experiments to show volume",
        "Pin only the abandoned experiments so viewers see your learning process",
        "Pin the repositories with the most stars, whatever they are",
        "Pin the two polished projects plus the best three utilities, curated around one coherent story",
      ],
      3,
      "Six slots, one story: choose repositories a stranger can understand at a glance. Volume and stars are not evidence — coherence is."
    ),
    q(
      "github-portfolio-p10",
      "A classmate proposes committing generated files and formatting churn daily to keep their contribution graph green during applications. Your course-grounded judgment:",
      [
        "Great idea — reviewers only look at the graph",
        "Skip it: the graph is a weak signal anyway, and a history padded with empty commits actively damages credibility when someone opens it",
        "It is harmless because nobody ever reads commit contents",
        "Do it, but only in private repositories where nobody can see",
      ],
      1,
      "A padded graph fails the moment a reviewer opens the commit list — which a GitHub-focused reviewer always does. Real work, shipped steadily, beats manufactured squares."
    ),
  ],

  "interview-preparation": [
    q(
      "interview-preparation-p1",
      "The course names five standard rounds in a data interview loop. Which set is correct?",
      [
        "SQL, coding, ML case, statistics, and behavioral",
        "Algebra, calculus, SQL, presentations, and negotiations",
        "Python, Excel, Tableau, project management, and system design",
        "Screening, take-home, panel, references, and offer",
      ],
      0,
      "Data loops mix technical rounds (SQL, coding) with ML case and stats rounds plus a behavioral round; screening and take-homes are logistics wrapped around those five."
    ),
    q(
      "interview-preparation-p2",
      "STAR, the structure taught for behavioral answers, stands for:",
      [
        "Story, Tone, Action, Rhetoric",
        "Situation, Task, Action, Result",
        "Summary, Timeline, Analysis, Recommendation",
        "Setting, Theme, Arc, Resolution",
      ],
      1,
      "Every behavioral story needs a labeled situation and task, the actions you personally took, and a result — ideally a measured one you can defend."
    ),
    q(
      "interview-preparation-p3",
      "The coding round ritual taught in the course runs in which order?",
      [
        "Code first, then clarify if the interviewer asks",
        "Test, code, plan, clarify",
        "Clarify, plan, code, test",
        "Plan, clarify, test, code",
      ],
      2,
      "Clarify the inputs and constraints, state your approach, then code, then test — jumping to the keyboard first is the classic round-killer."
    ),
    q(
      "interview-preparation-p4",
      "An SQL question asks: 'For each customer, show their most recent order.' The pattern the course says to reach for is:",
      [
        "GROUP BY customer, because aggregation solves every per-entity question",
        "A window function like ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC), keeping rank 1",
        "A cross join between the customers and orders tables",
        "A UNION ALL of both tables sorted by date",
      ],
      1,
      "Grouping collapses rows, so it cannot keep the order's details; a window function keeps every row while ranking within each customer's partition."
    ),
    q(
      "interview-preparation-p5",
      "Your query must exclude product categories whose average order value is under 25. The course's GROUP BY discipline says:",
      [
        "Put the condition in WHERE — it runs first and is faster",
        "Compute the average twice, once in SELECT and once in ORDER BY, and compare",
        "Use a CASE expression to delete rows after grouping",
        "Filter the groups with HAVING, because WHERE filters rows before grouping",
      ],
      3,
      "WHERE filters raw rows before grouping; conditions on aggregated values belong in HAVING. This distinction is among the most-tested SQL round fundamentals."
    ),
    q(
      "interview-preparation-p6",
      "In the ML case framework taught in the course, a structured answer moves through four steps. Which set matches?",
      [
        "Question, data, method, validation",
        "Model, hyperparameters, leaderboard, deployment",
        "Dataset, dashboard, deployment, decommission",
        "Disclaimer, apology, deflection, closure",
      ],
      0,
      "Clarify the question, define the data you would use, choose and justify a method, then explain how you would validate — that frame converts any open case into a structured answer."
    ),
    q(
      "interview-preparation-p7",
      "Which behavioral result statement is strongest under STAR as taught?",
      [
        "And then everything worked out great in the end",
        "The retry logic I added cut failed pipeline runs from 12 per week to 1, and two other pipelines adopted the same pattern",
        "The whole team loved the dashboard I built",
        "I learned a lot about teamwork from the experience",
      ],
      1,
      "A strong result is specific, measured, and attributable — numbers with scope beat vibes. The alternatives are unmeasured, unverifiable, or purely reflective."
    ),
    q(
      "interview-preparation-p8",
      "Mid-problem, the interviewer says: 'You might want to reconsider your assumption about the join key.' The course's advice for receiving hints is to:",
      [
        "Ignore it politely — hints are often traps to test confidence",
        "Pretend you were about to say the same thing and continue unchanged",
        "Treat it as data: acknowledge the hint, re-examine the assumption aloud, and adjust visibly",
        "Abandon your entire solution and start over from scratch",
      ],
      2,
      "Interviewers give hints to keep the conversation productive. Integrating a hint gracefully is a positive collaboration signal; ignoring it or over-correcting both waste it."
    ),
    q(
      "interview-preparation-p9",
      "A company sends a take-home estimated at twenty-plus hours, due in three days, unpaid, with no guarantee of a human interview. Applying the course's guidance, the sanest strategy is:",
      [
        "Cancel everything and do all twenty hours — effort is always rewarded",
        "Decide a time budget that matches the process's respect level: a few focused hours with a sharp write-up, and willingness to walk away from disrespectful loops",
        "Submit a certificate from an online course instead of the assignment",
        "Outsource the assignment to a friend with more free time",
      ],
      1,
      "The course teaches protecting your time and reading the loop's respect signals: scope honestly, cap hours, deliver a strong write-up — and treat oversized unpaid demands as a red flag."
    ),
    q(
      "interview-preparation-p10",
      "Which of the following does the course name as a red flag to weigh when evaluating a hiring process?",
      [
        "The interviewer takes notes while you answer",
        "The loop includes a live coding round",
        "The company asks for references after the final round",
        "A vague role description, an enormous unpaid take-home, and interviewers dismissing your questions",
      ],
      3,
      "Note-taking, coding rounds, and reference requests are normal process hygiene. Vagueness plus disrespect are signals about how you would be treated on the job itself."
    ),
  ],

  "resume-preparation": [
    q(
      "resume-preparation-p1",
      "The lesson 'The Six-Second Screen' claims the first human pass over a resume is:",
      [
        "A careful read of every bullet in order",
        "A skim that hits a few high-signal spots — recent title, skills, most recent relevant experience — and rejects quickly",
        "An automated full-text ranking performed by the recruiter's software",
        "A phone call to your listed references",
      ],
      1,
      "Reviewers skim for skills fit, evidence, and recency within seconds; the resume's structure exists to make that skim land on your best evidence first."
    ),
    q(
      "resume-preparation-p2",
      "The bullet pattern taught in the course is:",
      [
        "Company name, dates, and salary band",
        "Problem, apology, and promise",
        "Action verb, method or technology, measurable result",
        "Adjective, adjective, adjective",
      ],
      2,
      "Each bullet pairs what you did (action), how you did it (method), and what it produced (metric) — the three things an evaluator hunts for in one line."
    ),
    q(
      "resume-preparation-p3",
      "According to the ATS lesson, applicant tracking systems primarily:",
      [
        "Reject every resume containing tables or columns",
        "Parse resumes into structured fields and support keyword-based search and filtering",
        "Rank candidates automatically by vocabulary sophistication",
        "Replace human reviewers at every company, without exception",
      ],
      1,
      "An ATS parses your document into fields recruiters can search and filter. Simple, standard formatting survives parsing; the human still makes the decision."
    ),
    q(
      "resume-preparation-p4",
      "Which bullet best follows the action-method-metric pattern?",
      [
        "Trained a scikit-learn gradient-boosting churn model on 120k accounts; the top-decile risk list pointed the retention team's calls at the likeliest churners",
        "Responsible for various data-related tasks and duties",
        "Worked on a churn project using Python",
        "Improved company revenue dramatically through machine learning",
      ],
      0,
      "It names the action (trained), the method (scikit-learn gradient boosting, 120k accounts), and a scoped, defensible result. The alternatives are vague, methodless, or unfalsifiable."
    ),
    q(
      "resume-preparation-p5",
      "Your class project has no business revenue numbers. The honest quantification approach taught in the course is to:",
      [
        "Estimate the revenue impact and present it as fact",
        "Leave metrics out entirely — bullets work fine without them",
        "Copy impressive numbers from job postings for similar roles",
        "Use scale, speed, and scope proxies: rows processed, runtime reduction, users of the deliverable, decision impact",
      ],
      3,
      "Quantify honestly: scale, speed, and scope are real, measurable dimensions of project work. Fabricated business numbers collapse the moment an interviewer probes."
    ),
    q(
      "resume-preparation-p6",
      "A posting asks for 'cohort retention analysis with SQL.' Your master resume already describes your retention cohort work in other words. The tailoring move taught is to:",
      [
        "Rewrite the resume from scratch for every application",
        "Mirror the posting's language where it is true for you ('cohort retention analysis') and move that evidence higher on the page",
        "Submit the generic master resume — tailoring is dishonest",
        "Add every technology you have ever heard of to the skills list",
      ],
      1,
      "Tailoring is reordering and re-phrasing real evidence to match the posting's language — minutes, not hours, and never invention of skills you lack."
    ),
    q(
      "resume-preparation-p7",
      "Which set of links earns its place on a data resume, per the course?",
      [
        "Your Instagram, a private GitHub with no READMEs, and your old school's homepage",
        "Five links to different PDF versions of the resume itself",
        "No links at all — reviewers dislike clicking",
        "A GitHub with curated pinned repositories and READMEs, plus a live project page or dashboard, each landing prepared for a click",
      ],
      3,
      "Two or three links get clicked: a curated GitHub and a live demo confirm the resume's claims. The landing page must be prepared — the click is the audition."
    ),
    q(
      "resume-preparation-p8",
      "A candidate crams everything onto one page using a five-point font and half-inch margins. The one-page rule, as taught, is really about:",
      [
        "Density as a signal: cut by relevance, and let honest exceptions exist when they serve the reader",
        "Literally one page at any readability cost",
        "Using two pages for anyone over thirty",
        "Hiding older roles in white text in the footer",
      ],
      0,
      "The rule forces prioritization by relevance. A page nobody can read defeats its purpose; illegible cramming and hidden text are worse than a second page."
    ),
    q(
      "resume-preparation-p9",
      "A resume bullet claims 'Increased revenue by 40%' for a two-week class project. Following the course, the fix is to:",
      [
        "Keep it — nobody checks resume numbers",
        "Change the number to 45% — bolder claims read as confidence",
        "Reframe the bullet to what you can defend for two minutes: what you built, on what data, and the effect you actually observed",
        "Move the bullet into the cover letter where it will not be scrutinized",
      ],
      2,
      "Every bullet must survive a two-minute interrogation. Honest scale and scope figures you can defend beat inflated business metrics you cannot."
    ),
    q(
      "resume-preparation-p10",
      "What is the actual job of a cover letter, according to the course?",
      [
        "Repeating the resume in full sentences",
        "Saying the one thing the resume cannot: why this role, why you, and why now — specific and evidence-backed",
        "Proving you can write more than one page",
        "Listing every position you have ever applied to",
      ],
      1,
      "A cover letter adds information: targeted interest and motivation the resume format cannot carry. Four short paragraphs, specific and honest — never a resume in prose."
    ),
  ],

  "practical-assessments": [
    q(
      "practical-assessments-p1",
      "The four practical assessment formats taught in the course are:",
      [
        "Timed dataset challenge, pair-analytics session, whiteboard metric design, and live code review of your own work",
        "Phone screen, references, background check, and offer negotiation",
        "Multiple-choice exam, essay, group discussion, and panel dinner",
        "Kaggle competition, certification exam, algorithm drill, and system design",
      ],
      0,
      "These four are the formats companies actually run for data roles; each samples a different competence, from solo speed under a clock to live collaboration."
    ),
    q(
      "practical-assessments-p2",
      "In the 90-Minute Challenge Playbook, the first five minutes of the clock go to:",
      [
        "Importing every library you might need",
        "Restating the question, sketching the deliverable, and budgeting the remaining minutes",
        "Making the charts pretty in case time runs out",
        "Reading the full documentation of the dataset provider",
      ],
      1,
      "The five-minute plan converts the brief into a written plan: what the answer looks like and where the minutes go. Everything that follows serves that plan."
    ),
    q(
      "practical-assessments-p3",
      "Which set matches the classic failure modes the course warns about in practical assessments?",
      [
        "Confidence, clarity, speed, and structure",
        "Over-communicating, over-collaborating, over-testing, and over-documenting",
        "Too many bullet points and too few bullet points",
        "Perfectionism, rabbit holes, no summary, and silence",
      ],
      3,
      "The four classic failures: polishing what should ship, sinking into one seductive sub-problem, never writing a summary, and going silent while you work."
    ),
    q(
      "practical-assessments-p4",
      "You are twenty minutes from the buzzer in a timed challenge. Following the playbook, this window belongs to:",
      [
        "Starting a second model to hedge the first one",
        "Landing the deliverable: the summary, the caveats, cleanup, and a working notebook or script",
        "Exploring a new column you just noticed",
        "Refactoring all your code into a class hierarchy",
      ],
      1,
      "The final stretch is for landing: an evaluator would rather see a clean summary with honest caveats than a better model with no conclusion."
    ),
    q(
      "practical-assessments-p5",
      "A whiteboard prompt asks you to design 'a metric for customer health.' Per the course, a strong answer includes:",
      [
        "A single number with no definition and no failure modes",
        "Five metrics — one for every team that might be interested",
        "The claim that metric design requires the data engineering team present",
        "A definition, a calculation from named data fields, the ways the metric can be gamed, and a guardrail metric to catch that",
      ],
      3,
      "Metric design answers need a precise definition, a real calculation path, gaming risks, and a guardrail — one defended metric beats five vague ones."
    ),
    q(
      "practical-assessments-p6",
      "Forty minutes into a challenge, you notice a suspicious column and start writing a deep parser for it. The course would call this:",
      [
        "A rabbit hole — park it, note it in the write-up, and return to the plan",
        "Thoroughness — evaluators reward depth on any sub-problem",
        "A hidden deliverable — the challenge was secretly about this column",
        "A reason to restart the notebook from scratch",
      ],
      0,
      "Rabbit holes are seductive sub-problems that eat the clock. The discipline: park the issue, document it as a known limitation, and keep the main deliverable moving."
    ),
    q(
      "practical-assessments-p7",
      "In a pair-analytics session, your partner proposes a different approach than the one you started. The behavior the course says evaluators score well is:",
      [
        "Insisting on your approach — confidence is the signal",
        "Briefly weighing the tradeoff aloud, agreeing on a choice, and keeping the narration going either way",
        "Silently switching to their approach without comment",
        "Declaring both approaches wrong and working alone",
      ],
      1,
      "Pair sessions test collaboration: engage with the idea, decide together, and keep thinking aloud. Stubbornness, silent compliance, and going solo all lose points."
    ),
    q(
      "practical-assessments-p8",
      "A candidate's timed challenge ends with beautiful exploration but no written summary and no conclusions. The course names this failure and its fix:",
      [
        "Perfectionism; the fix is a better model",
        "Silence; the fix is talking continuously during the challenge",
        "Rabbit-holing; the fix is exploring more columns",
        "The missing summary; the fix is reserving the final stretch for findings and caveats — a weaker analysis with a summary outscores a stronger one without",
      ],
      3,
      "If the evaluator cannot find your answer, you did not deliver one. The last minutes belong to the summary — always."
    ),
    q(
      "practical-assessments-p9",
      "During a live code review of your own portfolio project, a reviewer points out a real flaw in your validation logic. Your best response, per the course:",
      [
        "Acknowledge the flaw, reason about its impact aloud, and state the concrete fix you would make",
        "Defend the code — admitting flaws loses the offer",
        "Explain at length why the reviewer is mistaken until they agree",
        "Remove the repository link from the call and change the subject",
      ],
      0,
      "Live reviews test how you receive critique. Engaging honestly — impact, fix, next step — is exactly the professional behavior the format exists to sample."
    ),
    q(
      "practical-assessments-p10",
      "Which practice regimen will actually improve assessment performance, according to the course?",
      [
        "Watching interview videos the night before each assessment",
        "Ten untimed challenges in a row the week of the assessment",
        "Memorizing the pandas documentation end to end",
        "One weekly timed repetition with a fixed rubric, a written scorecard, and a targeted drill on the weakest area — repeated for weeks",
      ],
      3,
      "Skill compounds from timed reps plus honest scoring plus targeted drills. Untimed volume and passive consumption do not train the clock."
    ),
  ],

  "capstone-projects": [
    q(
      "capstone-projects-p1",
      "The milestone skeleton taught for capstones runs, in order:",
      [
        "Scoping, EDA, modeling, evaluation, artifact",
        "Import, clean, plot, model, deploy",
        "Networking, negotiating, signing, celebrating",
        "Plan, panic, persevere, publish, pray",
      ],
      0,
      "Five gates in sequence: scoping, exploratory data analysis, modeling, evaluation, and the final artifact — each with explicit exit criteria."
    ),
    q(
      "capstone-projects-p2",
      "A capstone proposal, as taught, must contain:",
      [
        "A full literature review and bibliography",
        "Problem, data, success criteria, and a dated timeline",
        "The final report and slides before work begins",
        "Salary expectations and a preferred start date",
      ],
      1,
      "The one-page contract states what problem, what data, what measurable success looks like, and when each milestone lands."
    ),
    q(
      "capstone-projects-p3",
      "The three filters of the capstone selection test are:",
      [
        "Languages, libraries, and licenses",
        "Novelty, difficulty, and page count",
        "Fame, funding, and followers",
        "Scope, data availability, and interview value",
      ],
      3,
      "Before committing, every idea must pass the scope filter (can I finish it), the data filter (can I get the data), and the interview filter (will it generate stories worth telling)."
    ),
    q(
      "capstone-projects-p4",
      "Which success criterion for a churn-prediction capstone counts as one you cannot fake?",
      [
        "'The model will be interesting'",
        "'The final model will beat a class-baseline 0.75 AUC by at least 0.03 on a held-out test set, verified before the evaluation gate closes'",
        "'I will try my best and hope it works out'",
        "'The project is done when it feels done'",
      ],
      1,
      "A faked-proof criterion names a baseline, a metric, a margin, and a deadline — the proposal can then be passed or failed, not vibes-checked."
    ),
    q(
      "capstone-projects-p5",
      "Mid-project, EDA reveals your core premise is wrong: the data lacks the field your question depended on. The disciplined response, per the course, is to:",
      [
        "Quietly keep going and hope the panel does not notice",
        "Abandon the capstone and start a new one from zero",
        "Amend the plan formally at the gate review: log the finding, re-scope the question to what the data supports, and update the timeline",
        "Fabricate the missing field by imputing monthly averages and moving on",
      ],
      2,
      "Gate reviews exist exactly for this moment: the data disagrees with the plan, so you amend deliberately — decision logged, question re-scoped — instead of drifting or quitting."
    ),
    q(
      "capstone-projects-p6",
      "A proper entry in your capstone decision log records:",
      [
        "The options considered, the choice made, the reason, and the date",
        "Only the final result, so the log stays clean",
        "Every command you typed, in chronological order",
        "The names of the teammates who disagreed with you",
      ],
      0,
      "Decision logs capture real turning points — alternatives, choice, rationale, date — which is precisely the material interviewers and panelists probe."
    ),
    q(
      "capstone-projects-p7",
      "The course structures the fifteen-minute capstone defense as:",
      [
        "A line-by-line code walkthrough from imports to return",
        "Context, question, method, result, limits, and what comes next",
        "An autobiography of your Academy journey in chronological order",
        "Reading the written report aloud while the panel follows along",
      ],
      1,
      "The defense is a narrative arc, not a code tour: why the question mattered, how you attacked it, what you found, where it breaks, and what you would do next."
    ),
    q(
      "capstone-projects-p8",
      "Idea A: a novel deep-learning project on data you have not yet verified you can access. Idea B: a known analysis pattern applied to a verified public dataset with one original twist. Following the novelty-versus-risk guidance:",
      [
        "Choose A — novelty always beats delivery",
        "Flip a coin — the two risks are identical",
        "Choose A but ship it unfinished; novelty shows even in fragments",
        "Choose B — verified data plus a modest original twist is deliverable and still generates distinctive interview stories; A risks a capstone that never ships",
      ],
      3,
      "The novelty dial has real costs: unverified data and unfamiliar methods multiply failure risk. Delivered-with-a-twist beats ambitious-and-missing in a portfolio every time."
    ),
    q(
      "capstone-projects-p9",
      "At the panel defense, a reviewer asks about a limitation you did not solve: possible leakage in your validation split. The advised response:",
      [
        "Acknowledge it honestly, explain how you would test for and fix it, and note it for the next release — graceful uncertainty is a strength signal",
        "Deny that leakage is possible in any dataset",
        "Pivot immediately to praising the parts that worked",
        "Offer to rerun the entire analysis live during the Q&A",
      ],
      0,
      "Panels probe limits on purpose. Honest acknowledgment plus a concrete remediation plan demonstrates exactly the judgment the defense is testing."
    ),
    q(
      "capstone-projects-p10",
      "Which capstone would interview best, per the course's standards?",
      [
        "An enormous 'Netflix for everything' platform, five percent complete, no README",
        "A private project you describe verbally because 'the data is sensitive'",
        "A public repo on parking availability: verified data, a decision log, honest limitations, a passing artifact checklist, and a defense that tells one clear story",
        "Nine half-finished tutorial repos bundled into one repository",
      ],
      2,
      "Interview-readiness means verified data, a shipped artifact, documented decisions, and a story a panel can follow. Scale without delivery, privacy without evidence, and volume without depth all fail the filter."
    ),
  ],
};
