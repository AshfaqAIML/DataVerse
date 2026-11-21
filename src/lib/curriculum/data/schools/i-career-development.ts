/**
 * SCHOOL I — CAREER DEVELOPMENT (I1–I6)
 *
 * The school that turns skills into offers: portfolio projects that prove
 * competence, a GitHub presence reviewers trust, interview and resume
 * preparation, live practical assessments, and a graduation capstone.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolI: SubjectDef[] = [
  // ---------------------------------------------------------------- I1
  {
    slug: "portfolio-projects",
    school: "I",
    code: "I1",
    title: "Portfolio Projects",
    blurb: "Build the two or three projects that get you interviewed — designed around what hiring panels actually evaluate, and shipped instead of endlessly polished.",
    difficulty: "intermediate",
    track: "career",
    prerequisites: ["pandas", "matplotlib"],
    softPrerequisites: [],
    objectives: [
      "Design portfolio projects around the questions hiring panels actually ask",
      "Assemble a complete project from question to data to analysis to artifact",
      "Scope projects honestly around data you can actually obtain",
      "Write READMEs and project pages that make your work legible to strangers",
      "Ship finished projects on a schedule instead of polishing forever",
    ],
    outcomes: [
      "A learner can evaluate a project idea against the criteria a hiring panel actually applies",
      "A learner can execute an analysis, model, or dashboard project end to end with pandas and matplotlib",
      "A learner can scope a project to a dataset they can defend and a timeline they can keep",
      "A learner can write a README with structure, screenshots, and key findings that stands alone",
      "A learner can ship a first version and improve it through feedback instead of private polish",
    ],
    modules: [
      mod(
        "What Hiring Panels Actually Evaluate",
        "The rubric behind the decision — what evaluators look at, in what order, and what makes them stop reading.",
        [
          "Describe the evidence a hiring panel tries to collect from a portfolio",
          "Judge any project idea against the criteria a panel actually applies",
        ],
        ["case-analysis", "concept-check", "multiple-choice"],
        [
          ch(
            "The Panel's Vantage Point",
            "How strangers read your work when you are not in the room to explain it",
            [
              L("How Strangers Read a Portfolio", 20, ["first pass", "scan pattern", "evidence"], "Walk the path a reviewer takes through a portfolio in the first few minutes."),
              L("What a Project Must Prove", 25, ["competence", "judgment", "communication"], "See the three claims every portfolio project implicitly makes — and how to back each one.", "concept", 3),
              L("Autopsy of a Weak Portfolio", 25, ["tutorial project", "unmotivated analysis", "missing artifact"], "Diagnose the common failure: technically fine work that proves nothing to a stranger.", "reading", 2),
            ]
          ),
          ch(
            "Anatomy of a Portfolio-Worthy Project",
            "The question-to-artifact skeleton that carries every strong project",
            [
              L("Question, Data, Analysis, Artifact", 30, ["question", "data", "analysis", "artifact"], "Learn the four-part skeleton that turns an exercise into evidence.", "concept", 3),
              L("Choosing a Question Worth Answering", 25, ["stakeholder", "decision", "scope"], "Pick questions a real person would pay to have answered — and can explain why.", "guided-practice", 3),
              L("The Artifact Is the Deliverable", 25, ["deliverable", "audience", "reproducibility"], "Decide what the reader walks away holding: a report, a dashboard, a model, or a decision.", "concept", 2),
            ]
          ),
        ]
      ),
      mod(
        "Three Project Blueprints",
        "Complete blueprints for the three portfolio archetypes — an exploratory analysis with a twist, a supervised model evaluated honestly, and a standing dashboard or report.",
        [
          "Execute one of the three portfolio archetypes from a written blueprint",
          "Adapt a blueprint to a dataset and a question of your own choosing",
        ],
        ["case-analysis", "interpret-results", "concept-check"],
        [
          ch("The Exploratory Analysis with a Twist", "EDA plus one insight a wall of averages would hide", [
            L("Blueprint One Walkthrough", 35, ["exploratory analysis", "segmentation", "surprise finding"], "Walk the first blueprint end to end: question, dataset, the twist, and the write-up.", "worked-example", 3),
            L("From Averages to Segments", 30, ["cohort", "segment", "distribution"], "Push past headline averages into the segments where the real story hides.", "guided-practice", 3),
          ]),
          ch("The Supervised Model with Honest Evaluation", "A model project evaluated the way a senior reviewer would evaluate it", [
            L("Blueprint Two Walkthrough", 35, ["baseline", "validation split", "leakage"], "Walk the model blueprint: baseline first, honest splits, error analysis at the end.", "worked-example", 3),
            L("Presenting a Model Without Overselling", 30, ["metric", "baseline comparison", "limitations"], "Report performance so a reviewer trusts both the number and the caveats.", "concept", 3),
          ]),
          ch("The Dashboard or Report Project", "A standing artifact someone can use without you in the room", [
            L("Blueprint Three Walkthrough", 35, ["dashboard", "report", "refresh path"], "Walk the artifact blueprint: one audience, three questions, a maintenance story.", "worked-example", 3),
            L("Designing for a Reader Who Skims", 30, ["layout", "headline finding", "caveat placement"], "Arrange a report or dashboard for the reader who gives it ninety seconds.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Finding Data and Scoping Honestly",
        "Where real datasets come from, how to vet them, and how to cut a project down to what you can actually finish.",
        [
          "Find and vet a dataset you can legally and practically defend",
          "Write a scope you can ship in two weekends",
        ],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("Sourcing Datasets You Can Defend", "Portals, licenses, and the smell test for stale or synthetic data", [
            L("Where Real Datasets Live", 25, ["open data portal", "data marketplace", "public api"], "Tour the honest sources: government portals, research releases, and public APIs.", "reading", 2),
            L("Vetting a Dataset Before You Commit", 30, ["license", "documentation", "freshness"], "Run the five-question vetting check before building anything on top of a dataset.", "guided-practice", 3),
          ]),
          ch("Scoping: Small Enough to Ship", "The discipline of cutting ambition until the project fits your calendar", [
            L("The Two-Weekend Rule", 25, ["scope", "fixed date", "minimum viable analysis"], "Size a project so a working version exists by a date you pick today.", "concept", 3),
            L("Scope Cuts That Preserve the Story", 30, ["de-scoping", "priority", "narrowing"], "Cut breadth and features without cutting the reason the project exists.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The README and the Shipping Habit",
        "The project's public face — READMEs, screenshots, and key findings — plus the workflow that produces finished work instead of perfect drafts.",
        [
          "Write a README that stands alone without you in the room",
          "Run a ship-then-iterate workflow instead of private perfectionism",
        ],
        ["design-review", "concept-check", "multiple-choice"],
        [
          ch("The README as the Project's Face", "Structure, screenshots, and findings that survive a stranger's skim", [
            L("The README Skeleton", 30, ["structure", "installation", "usage"], "Assemble the README sections a reviewer expects, in the order they actually read them.", "guided-practice", 3),
            L("Screenshots and Key Findings Up Front", 25, ["screenshot", "key finding", "headline"], "Lead with the one chart and one sentence that earn the rest of the read.", "concept", 2),
            L("Writing the Project Page", 30, ["project page", "narrative", "next steps"], "Turn a repo into a readable page: context, method, findings, and what you would do next.", "worked-example", 3),
          ]),
          ch("Ship, Then Polish", "Deadlines as a feature: the loop that produces finished work", [
            L("Shipping Beats Polishing", 25, ["version one", "deadline", "feedback loop"], "Learn why a shipped version one teaches more than a perfect version zero.", "concept", 3),
            L("The Post-Ship Improvement Loop", 30, ["issue list", "iteration", "retrospective"], "Turn one shipped project into two releases with a simple, repeatable loop.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Portfolio Projects Final", 50, 20),
    projects: [
      proj(
        "Blueprint One, Executed",
        "Execute the exploratory-analysis-with-a-twist blueprint on a public dataset: one specific question, one twist beyond the headline average, one chart a hiring panel would remember — shipped with a README.",
        8,
        "independent",
        [
          "Public repository with README, data source citation, and requirements file",
          "Notebook or script that runs top to bottom in a fresh environment",
          "Key findings section with the headline chart and one-paragraph takeaway",
          "Short limitations and next-steps section",
        ],
        [
          "The question is specific enough for a non-technical reader to care about",
          "The twist: at least one finding a wall of averages would hide",
          "The analysis reproduces from a clean clone in under ten minutes",
        ],
        ["Python", "pandas", "matplotlib", "GitHub"]
      ),
      proj(
        "The README Makeover",
        "Take one finished project of yours (even a tutorial one) and rebuild its presentation: restructured README, a screenshot or chart above the fold, honest limitations, and a key-finding statement up front.",
        4,
        "guided",
        [
          "Rewritten README following the skeleton from this subject",
          "A headline image or chart embedded in the first screen of text",
          "A before-and-after note describing what changed and why",
        ],
        [
          "A stranger could run the project from the README alone",
          "The key finding is stated in the first screen of text",
          "Every claim in the README matches what the analysis actually shows",
        ],
        ["GitHub", "Markdown"]
      ),
    ],
    placementEligible: true,
    keywords: ["portfolio", "projects", "readme", "hiring", "artifact", "scoping"],
  },

  // ---------------------------------------------------------------- I2
  {
    slug: "github-portfolio",
    school: "I",
    code: "I2",
    title: "GitHub Portfolio",
    blurb: "Turn your GitHub from a file dump into a portfolio: a profile that lands, repositories that read well, history that holds up, and a first open source contribution.",
    difficulty: "beginner",
    track: "career",
    prerequisites: ["git-github"],
    softPrerequisites: [],
    objectives: [
      "Curate a GitHub profile that works as a portfolio landing page",
      "Maintain repositories whose history, naming, and descriptions survive a reviewer's scrutiny",
      "Publish project demos and documentation that differentiate you from equally skilled candidates",
      "Make a starter-level open source contribution without fear",
    ],
    outcomes: [
      "A learner can build a profile README and pin a coherent set of repositories",
      "A learner can name, describe, tag, and document a repository so a stranger understands it in under a minute",
      "A learner can publish a static project demo with GitHub Pages",
      "A learner can land a first open source contribution through a real issue, a small patch, and a reviewed pull request",
    ],
    modules: [
      mod(
        "Your Profile Is a Landing Page",
        "The profile screen a reviewer sees first — and the repository-level signals that make them keep reading.",
        [
          "Assemble a profile README that orients a stranger in one screen",
          "Curate pinned repositories that tell one coherent story",
        ],
        ["design-review", "concept-check", "multiple-choice"],
        [
          ch("The Profile README", "One screen that says who you are, what you build, and where to look", [
            L("What Belongs in a Profile README", 25, ["profile readme", "bio", "links"], "Decide what earns space on the one screen every profile visitor sees.", "concept", 2),
            L("Building Yours, Step by Step", 30, ["markdown", "profile repository", "pins"], "Create the special profile repository and write the README that renders on your page.", "guided-practice", 3),
          ]),
          ch("Pinned Repos, Names, and Descriptions", "The six slots and the words around them", [
            L("Choosing What Gets Pinned", 25, ["pinned repository", "curation", "first impression"], "Curate six repositories like a gallery wall, not a warehouse of everything.", "concept", 3),
            L("Repository Naming and Descriptions", 30, ["repo name", "description", "topics"], "Write repository names and one-line descriptions that pass the skim test.", "guided-practice", 3),
            L("The Ten-Second Repository Test", 25, ["skim test", "clarity", "landing behavior"], "Review any repository the way a stranger would — and fix what fails.", "review", 3),
          ]),
        ]
      ),
      mod(
        "History and Documentation as Evidence",
        "Commit history, releases, and READMEs are read as evidence of how you work — make them say the right things.",
        [
          "Keep a commit history that demonstrates real, incremental work",
          "Use releases, tags, and documentation as trust signals",
        ],
        ["concept-check", "case-analysis", "design-review"],
        [
          ch("Commit Hygiene and History", "History as evidence of process, not just a log of saves", [
            L("Reading History Like a Reviewer", 25, ["commit history", "evidence", "granularity"], "See what reviewers conclude from one-commit repositories and vague messages.", "concept", 3),
            L("Commit Messages and Granularity", 30, ["imperative mood", "atomic commit", "logical unit"], "Write small, well-labeled commits that show the work developing over time.", "guided-practice", 3),
            L("What Green Squares Do and Do Not Signal", 20, ["contribution graph", "signal", "consistency"], "Treat the contribution graph as a byproduct of real work, never as the goal.", "reading", 2),
          ]),
          ch("Releases, Tags, and READMEs", "The trust signals that surround the code", [
            L("Tags and Releases for Finished Work", 25, ["tag", "release", "changelog"], "Mark the versions a reader can actually run and note what changed.", "guided-practice", 2),
            L("The README as a Differentiator", 30, ["readme", "documentation quality", "installation"], "Use documentation quality to separate yourself from equally skilled candidates.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Beyond the Profile",
        "Live demos with GitHub Pages, a first open source contribution, and the habits that keep the portfolio honest.",
        [
          "Publish a static demo of a project with GitHub Pages",
          "Complete a starter-level open source contribution",
        ],
        ["case-analysis", "concept-check", "multiple-choice"],
        [
          ch("GitHub Pages and Live Demos", "A clickable demo beats a stack of screenshots", [
            L("Shipping a Static Demo", 30, ["github pages", "static site", "html export"], "Publish an exported report or simple site straight from a repository.", "guided-practice", 3),
            L("Linking Demos from the README", 20, ["demo link", "badge", "credibility"], "Wire the live demo into the README so nobody has to trust screenshots alone.", "concept", 2),
          ]),
          ch("First Steps in Open Source", "Contributing without fear, at starter level", [
            L("Finding a Good First Issue", 30, ["good first issue", "code of conduct", "project selection"], "Choose a project and an issue that welcome newcomers — and read the room first.", "concept", 3),
            L("The Small Contribution Workflow", 35, ["fork", "patch", "pull request etiquette"], "Follow the fork, branch, patch, pull request path with reviewer-friendly habits.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("GitHub Portfolio Final", 40, 16),
    projects: [
      proj(
        "The Portfolio Profile Makeover",
        "Rebuild your GitHub presence end to end: a profile README that introduces you, six pinned repositories with rewritten names and descriptions, a tagged release on finished work, and one live demo published through GitHub Pages.",
        4,
        "guided",
        [
          "Profile README with a clear self-introduction and links to your best work",
          "Six pinned repositories with honest names, descriptions, and topics",
          "At least one tagged release on a finished project",
          "One live demo linked from a repository README",
        ],
        [
          "A stranger can tell what you do within one screen of your profile",
          "Every pinned repository passes the ten-second repository test",
          "The demo link works without special instructions or logins",
        ],
        ["GitHub", "Markdown", "GitHub Pages"]
      ),
    ],
    placementEligible: true,
    keywords: ["github", "profile", "pinned repositories", "open source", "readme", "releases"],
  },

  // ---------------------------------------------------------------- I3
  {
    slug: "interview-preparation",
    school: "I",
    code: "I3",
    title: "Interview Preparation",
    blurb: "Walk into the data interview loop ready — SQL and coding kits, case frameworks, STAR stories, and a mock discipline that finds your gaps before the panel does.",
    difficulty: "intermediate",
    track: "career",
    prerequisites: ["portfolio-projects"],
    softPrerequisites: ["model-evaluation"],
    objectives: [
      "Map a data interview loop and prepare deliberately for each round type",
      "Solve SQL interview questions with joins, windows, and aggregation patterns",
      "Solve coding-round problems with the core data structures data roles actually use",
      "Structure ML and stats case answers with a repeatable framework",
      "Deliver behavioral answers with the STAR structure",
    ],
    outcomes: [
      "A learner can classify the rounds in a data hiring loop and what each tests",
      "A learner can answer multi-table SQL questions with joins, GROUP BY, and window functions under time pressure",
      "A learner can think through a case problem in structured, audible steps",
      "A learner can deliver a behavioral story in STAR form with a measured result",
    ],
    modules: [
      mod(
        "The Interview Landscape",
        "What the data interview loop contains, what each round tests, and how interviewers convert what they see into scores.",
        [
          "Identify the standard rounds of a data-role interview loop",
          "Explain the signals interviewers are trained to record while you talk",
        ],
        ["concept-check", "multiple-choice", "case-analysis"],
        [
          ch("Mapping the Loop", "SQL, coding, ML case, stats, and behavioral — the five standard rounds", [
            L("The Five Rounds of a Data Interview", 30, ["sql round", "coding round", "case round", "behavioral round"], "Recognize the loop's components and what each one is designed to test.", "concept", 3),
            L("How the Loop Reweights by Role", 25, ["analyst", "data scientist", "machine learning engineer"], "See how the same loop reweights for analyst, scientist, and engineer positions.", "reading", 2),
          ]),
          ch("How Interviewers Score You", "The rubric behind the notes they type while you talk", [
            L("The Signals: Problem Solving, Communication, Depth", 30, ["signal", "rubric", "written feedback"], "Learn the signals interviewers record — and how to send them deliberately.", "concept", 3),
            L("Structured Thinking Aloud", 30, ["clarify", "framework", "narration"], "Practice the narrate-as-you-go habit that carries every technical round.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The Technical Round Kits",
        "The SQL survival kit and the coding round kit — the small set of rehearsed patterns that cover most real interview questions.",
        [
          "Solve typical SQL interview questions with a small set of rehearsed patterns",
          "Solve coding rounds using the data structures data roles actually test",
        ],
        ["write-code", "mock-interview", "concept-check"],
        [
          ch("The SQL Round Survival Kit", "Joins, aggregation patterns, and windows, practiced to fluency", [
            L("The Join Patterns You Will Meet", 35, ["inner join", "left join", "row multiplication"], "Recognize the join shape of a question before writing any SQL.", "code", 3),
            L("Aggregation Patterns and GROUP BY Discipline", 35, ["group by", "having", "conditional aggregation"], "Turn word problems into grouped queries — and filter groups, not rows.", "code", 3),
            L("Window Functions Under Time Pressure", 40, ["partition by", "ranking", "lag"], "Reach for ranking and offset functions the moment a question says per or change.", "code", 3),
          ]),
          ch("The Coding Round Kit", "The data structures you actually need, drilled until recall is automatic", [
            L("The Short List: Lists, Dicts, Sets, and Heaps", 35, ["dictionary", "set", "heap idea"], "Map almost every data coding question onto four familiar structures.", "code", 3),
            L("The Pattern Library", 40, ["frequency count", "two pointers", "sliding window idea"], "Drill the recurring patterns — counting, grouping, pairing — until they are reflexes.", "code", 3),
          ]),
          ch("Round Rituals", "The habits that surround the code", [
            L("The SQL Question Checklist", 25, ["clarify", "null discipline", "edge cases"], "Run the pre-code checklist that prevents the classic SQL round mistakes.", "review", 3),
            L("The Coding Round Ritual: Clarify, Plan, Code, Test", 30, ["clarify inputs", "state approach", "test before done"], "Follow the four-step ritual interviewers expect before you touch the keyboard.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Cases, Stats, and the Behavioral Round",
        "The ML and stats case round with a repeatable framework, behavioral answers built with STAR, and take-home strategy that protects your week.",
        [
          "Structure an ML or stats case answer with a repeatable framework",
          "Deliver behavioral answers in STAR form with a measured result",
          "Scope a take-home assignment so effort and deliverables stay sane",
        ],
        ["mock-interview", "case-analysis", "concept-check"],
        [
          ch("The ML and Stats Case Round", "Structured thinking aloud about metrics, models, and data", [
            L("The Case Framework: Question, Data, Method, Validation", 35, ["framing", "metric design", "validation plan"], "Apply the four-step frame that turns any open case into a structured answer.", "worked-example", 3),
            L("Classic Case Prompts, Worked Through", 40, ["churn case", "engagement metric", "ranking metric"], "Work through the recurring case archetypes — churn, engagement, and metric moves.", "worked-example", 3),
            L("Admitting I Don't Know, Gracefully", 25, ["epistemic honesty", "follow-up questions", "judgment under uncertainty"], "Turn gaps in your knowledge into demonstrations of honest judgment.", "concept", 3),
          ]),
          ch("Behavioral Rounds with STAR", "Stories that show judgment, not just outcomes", [
            L("The STAR Structure", 25, ["situation", "task", "action", "result"], "Build answers from four labeled parts — and practice keeping them tight.", "concept", 3),
            L("Mining Your Projects for Stories", 30, ["story bank", "conflict story", "failure story"], "Extract six reusable stories from coursework, projects, and work history.", "guided-practice", 3),
          ]),
          ch("Take-Home Assignments", "Winning the open-book round without surrendering your week", [
            L("Scoping the Take-Home Before You Start", 30, ["time budget", "requirements reading", "deliverable-first"], "Decide what a take-home actually asks for — and cap the hours you will give it.", "concept", 3),
            L("The Write-Up Matters More Than the Code", 30, ["executive summary", "assumptions", "recommendations"], "Structure the take-home report for a reader who will skim it.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The Mock Loop and the Offer Conversation",
        "Mock interview discipline on a schedule, the questions you ask, and the red flags you weigh on both sides of the table.",
        [
          "Run a mock loop that surfaces weaknesses before the real panel does",
          "Ask questions that evaluate the company while reflecting well on you",
        ],
        ["mock-interview", "case-analysis", "multiple-choice"],
        [
          ch("Mock Loop Discipline", "Rehearsal with feedback, on a schedule", [
            L("Building Your Mock Loop", 30, ["mock partner", "schedule", "feedback log"], "Assemble weekly mocks across all five rounds with a tracked feedback log.", "guided-practice", 3),
            L("Scoring Yourself Honestly", 25, ["self-review", "recording", "gap tracking"], "Record, review, and grade your own performances without vanity or despair.", "review", 3),
          ]),
          ch("Your Side of the Table", "Questions to ask, and red flags to weigh", [
            L("Questions That Gather Real Information", 25, ["team questions", "stack questions", "growth questions"], "Prepare questions that collect the facts an offer decision actually needs.", "concept", 2),
            L("Red Flags on Both Sides", 30, ["unpaid take-home", "vague role", "respect signals"], "Read the loop's own behavior for warnings about the workplace behind it.", "reading", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Interview Preparation Final", 50, 22),
    projects: [
      proj(
        "The Mock Gauntlet",
        "Complete a full simulated loop in one week: one SQL round, one Python coding round, one case round, and one behavioral round — each scored against a rubric, ending in a written gap analysis.",
        5,
        "guided",
        [
          "Four completed mock rounds with prompts and your responses recorded",
          "A scorecard per round filled in honestly against the rubric",
          "A one-page gap analysis naming your two weakest areas and the drills that fix them",
        ],
        [
          "Each mock ran under realistic time limits",
          "Scorecards cite specific moments, not vague impressions",
          "The gap analysis connects each weakness to a concrete drill",
        ],
        ["SQL", "Python", "mock partner", "rubric"]
      ),
      proj(
        "The Take-Home Sprint",
        "Complete a realistic take-home assignment inside a strict six-hour budget: scoped, executed, and written up the way a hiring panel reads it — then post-mortem where the hours went.",
        6,
        "independent",
        [
          "Analysis artifacts (notebook or scripts) that run end to end",
          "One-page executive summary with assumptions and recommendations",
          "README with reproduction steps",
          "Post-mortem: where the budget went and what you cut",
        ],
        [
          "Scope held within the declared time budget",
          "Executive summary is readable by a non-technical stakeholder",
          "Assumptions are stated with their impact discussed",
        ],
        ["Python", "pandas", "GitHub"]
      ),
    ],
    placementEligible: true,
    keywords: ["interview", "sql round", "case interview", "behavioral", "star", "take-home", "mock"],
  },

  // ---------------------------------------------------------------- I4
  {
    slug: "resume-preparation",
    school: "I",
    code: "I4",
    title: "Resume Preparation",
    blurb: "Build the one-page document that survives the screen: six-second realities, bullets with honest numbers, ATS-safe formatting, and links that actually get clicked.",
    difficulty: "beginner",
    track: "career",
    prerequisites: ["portfolio-projects"],
    softPrerequisites: [],
    objectives: [
      "Write a data resume that survives the first human screen",
      "Engineer bullets that pair action, method, and measured impact",
      "Tailor a resume to a specific posting without starting over each time",
      "Format for ATS parsers without wrecking readability",
      "Write cover letters that add information instead of repeating the resume",
    ],
    outcomes: [
      "A learner can structure a one-page data resume in the order reviewers read",
      "A learner can write bullets in the action-method-metric pattern, quantified honestly",
      "A learner can tailor one master resume to a specific job posting in under an hour",
      "A learner can produce an ATS-safe document with links reviewers will actually click",
    ],
    modules: [
      mod(
        "The Six-Second Screen",
        "How resumes are actually read — the skim pattern, the structure that serves it, and the one-page rule that forces honesty.",
        [
          "Structure a resume so the strongest evidence is read first",
          "Apply the one-page rule and know when it honestly bends",
        ],
        ["concept-check", "case-analysis", "multiple-choice"],
        [
          ch("How Resumes Are Actually Read", "The skim pattern and the six-second reality", [
            L("The Six-Second Screen: How Resumes Are Actually Read", 25, ["skim", "first pass", "rejection triggers"], "Follow a reviewer's eye across a resume and see exactly where candidates lose them.", "concept", 3),
            L("What a Data Resume Is Screened For", 25, ["skills match", "evidence of impact", "recency"], "Know the three things a screener hunts: skills fit, evidence, and recency.", "concept", 3),
            L("Structure and Ordering That Serve the Skim", 30, ["section order", "above the fold", "reverse chronological"], "Order sections and entries so the skim hits your best evidence first.", "guided-practice", 3),
          ]),
          ch("The One-Page Rule and When It Bends", "Length as a signal of judgment", [
            L("Why One Page, Usually", 25, ["one page", "density", "relevance"], "Make the case for one page — and learn the rare, honest exceptions.", "concept", 2),
            L("Cutting Without Lying", 30, ["cut list", "older roles", "relevance filter"], "Cut content by relevance, not by nostalgia, in a structured slash-and-burn pass.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Bullet Engineering and the ATS",
        "Bullets built from action, method, and metric; honest quantification; tailoring per posting; and formatting that survives automated parsing.",
        [
          "Write bullets in the action-method-metric shape, quantified honestly",
          "Tailor one master resume to a posting in under an hour",
          "Format a resume so automated parsers read it correctly",
        ],
        ["concept-check", "case-analysis", "design-review"],
        [
          ch("Writing Bullets That Land", "Action, method, metric — on every line", [
            L("The Action-Method-Metric Pattern", 30, ["action verb", "method", "metric"], "Build each bullet from a verb, a technique, and a measurable result.", "concept", 3),
            L("Quantifying Impact Honestly", 30, ["proxy metric", "scale numbers", "honest framing"], "Quantify with scale, speed, and scope when revenue numbers do not exist.", "guided-practice", 3),
            L("Bullets That Interviewers Interrogate", 30, ["claim audit", "defensibility", "follow-up questions"], "Stress-test every bullet: can you defend it for two minutes if asked?", "review", 3),
          ]),
          ch("Tailoring and the ATS", "One master resume, many tailored versions", [
            L("Tailoring to a Posting Without Starting Over", 30, ["keyword alignment", "mirror language", "reordering"], "Match a posting's language and reorder your evidence per job — in minutes, not hours.", "guided-practice", 3),
            L("ATS Realities: Formatting That Survives Parsers", 30, ["applicant tracking system", "parsing-safe format", "keyword scan"], "Learn what applicant tracking systems do to your file and the formatting that survives.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Links, Pages, and Letters",
        "The clickable evidence beyond the PDF — GitHub, project pages, dashboards — and the short cover letter that adds information instead of repeating the resume.",
        [
          "Add links that reviewers will actually click and that hold up when they do",
          "Write a four-paragraph cover letter that says what the resume cannot",
        ],
        ["concept-check", "multiple-choice", "design-review"],
        [
          ch("Links That Get Clicked", "Turning the resume into a portal to your work", [
            L("Which Links Earn Their Space", 25, ["github link", "project page", "portfolio site"], "Choose the two or three links a reviewer will actually follow.", "concept", 2),
            L("Making the Landing Worth the Click", 30, ["pinned repos", "demo", "readme"], "Prepare each destination so the click confirms the resume's claims.", "guided-practice", 3),
          ]),
          ch("Cover Letters That Work", "Four short paragraphs with one job each", [
            L("The Cover Letter's Actual Job", 25, ["cover letter", "motivation", "specificity"], "Say the one thing your resume cannot: why this role, and why now.", "concept", 2),
            L("Drafting Without Groveling or Rambling", 30, ["structure", "tone", "evidence"], "Draft a four-paragraph letter that is specific, brief, and evidence-backed.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Resume Preparation Final", 40, 18),
    projects: [
      proj(
        "The Data Resume, Built and Tailored",
        "Produce a one-page, ATS-safe data resume from your real experience and projects, tailor it to one live job posting, and write the matching cover letter — with a defense sheet behind every bullet.",
        4,
        "independent",
        [
          "One-page master resume with ATS-safe formatting and action-method-metric bullets",
          "A tailored variant for one real posting with mirrored language and reordered evidence",
          "A four-paragraph cover letter for that posting",
          "A bullet-by-bullet defense sheet: two minutes of backup for every claim",
        ],
        [
          "Every bullet follows action-method-metric and survives the interrogation test",
          "The tailored version mirrors the posting's language without inventing skills",
          "Links work and their landing pages are prepared for visitors",
        ],
        ["word processor", "GitHub", "job posting"]
      ),
    ],
    placementEligible: true,
    keywords: ["resume", "bullet points", "ats", "tailoring", "cover letter", "one page"],
  },

  // ---------------------------------------------------------------- I5
  {
    slug: "practical-assessments",
    school: "I",
    code: "I5",
    title: "Practical Assessments",
    blurb: "The formats companies actually use to test data skills — timed challenges, pair analytics, whiteboard metrics, live code review — and the practice loop that makes them routine.",
    difficulty: "intermediate",
    track: "career",
    prerequisites: ["portfolio-projects"],
    softPrerequisites: [],
    objectives: [
      "Recognize the four practical assessment formats and what each measures",
      "Execute a timed dataset challenge with a plan that guarantees a deliverable",
      "Analyze out loud so partners and panels can follow your reasoning",
      "Diagnose and avoid the classic assessment failure modes",
      "Build a weekly practice regimen that compounds",
    ],
    outcomes: [
      "A learner can classify a practical assessment format and prepare for its specific demands",
      "A learner can complete a 90-minute dataset challenge with a documented deliverable",
      "A learner can narrate analysis decisions live without freezing or rambling",
      "A learner can run a personal practice regimen with scored, timed repetitions",
    ],
    modules: [
      mod(
        "The Assessment Landscape",
        "The four formats you will actually meet — timed dataset challenges, pair-analytics sessions, whiteboard metric design, and live code review — and what each measures.",
        [
          "Identify the four practical formats and the signals each extracts",
          "Match preparation to the format a company has announced",
        ],
        ["concept-check", "multiple-choice", "case-analysis"],
        [
          ch("The Four Formats", "Timed challenge, pair analytics, whiteboard metrics, live code review", [
            L("The Formats and Their Faults", 30, ["timed challenge", "pair analytics", "whiteboard", "live code review"], "Meet the four formats — what each asks of you, and where each is unfair.", "concept", 3),
            L("What Each Format Really Measures", 25, ["signal", "speed versus depth", "collaboration"], "See past the surface task to the competence each format samples.", "concept", 3),
          ]),
          ch("Reading the Invite", "Decoding what a company tells you before you arrive", [
            L("Interrogating the Assessment Brief", 25, ["brief", "evaluation criteria", "logistics"], "Extract the actual scoring criteria from the invitation before preparing anything.", "reading", 3),
            L("Preparing for the Announced Format", 30, ["drill selection", "environment setup", "dry run"], "Build a format-specific preparation plan in the days before the session.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The 90-Minute Challenge Playbook",
        "A repeatable plan for timed dataset challenges: plan fast, explore honestly, prioritize, deliver, and document — with a working deliverable guaranteed at the buzzer.",
        [
          "Execute a timed challenge through the five-step playbook",
          "Guarantee a documented deliverable even when the analysis disappoints",
        ],
        ["case-analysis", "interpret-results", "concept-check"],
        [
          ch("Plan, Explore, Prioritize", "The first half of the clock: structure before speed", [
            L("The Five-Minute Plan", 25, ["question restatement", "deliverable sketch", "time budget"], "Spend the first minutes turning the brief into a written plan with a time budget.", "concept", 3),
            L("Honest Exploration Under the Clock", 35, ["targeted eda", "nulls and types", "sanity checks"], "Explore just enough to prioritize — checks over pretty pictures.", "guided-practice", 3),
            L("Prioritizing: What Earns More Minutes", 30, ["impact ranking", "cut line", "question value"], "Rank the remaining work by what the evaluator will actually reward.", "concept", 3),
          ]),
          ch("Deliver and Document", "The last half of the clock: land the artifact", [
            L("Landing the Deliverable", 30, ["minimum deliverable", "deadline discipline", "summary first"], "Reserve the final stretch for the summary, caveats, and cleanup.", "guided-practice", 3),
            L("The Challenge Write-Up", 30, ["findings section", "assumptions", "future work"], "Write the short document that turns code into an answer.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Analyzing Out Loud",
        "Pair-analytics and whiteboard sessions are conversation tests — narrating decisions, taking hints, and thinking with a partner.",
        [
          "Narrate an analysis live with structure and without rambling",
          "Behave well in a pair session: taking hints, sharing the keyboard, disagreeing politely",
        ],
        ["mock-interview", "case-analysis", "interpret-results"],
        [
          ch("Narrating Your Analysis", "Thinking aloud as a trainable skill", [
            L("The Narration Habit", 30, ["think aloud", "decision points", "signposting"], "Convert silent analysis into a narrated stream a partner can follow.", "guided-practice", 3),
            L("Receiving Hints Without Deflating", 25, ["hint handling", "ego management", "recovery"], "Treat a hint as data about your blind spots, never as a demerit.", "concept", 3),
          ]),
          ch("Whiteboards and Pair Sessions", "Metric design and live collaboration formats", [
            L("Designing a Metric on a Whiteboard", 35, ["metric design", "segmentation", "guardrail metric"], "Structure a metric answer: definition, calculation, gaming risks, and guards.", "worked-example", 3),
            L("The Pair-Analytics Session", 30, ["pairing etiquette", "keyboard sharing", "questions while working"], "Practice the collaboration signals evaluators actually score in pair settings.", "guided-practice", 3),
            L("Live Code Review of Your Own Work", 30, ["self-review", "explaining choices", "receiving critique"], "Walk a reviewer through your own repository and absorb critique professionally.", "review", 3),
          ]),
        ]
      ),
      mod(
        "Failure Modes and the Practice Regimen",
        "The classic ways candidates blow assessments — perfectionism, rabbit holes, the missing summary, silence — and a weekly regimen that fixes them by drilling.",
        [
          "Diagnose the classic failure modes in your own practice runs",
          "Run a weekly practice regimen with timed reps and scored reviews",
        ],
        ["case-analysis", "design-review", "multiple-choice"],
        [
          ch("The Classic Failure Modes", "Perfectionism, rabbit holes, no summary, silence", [
            L("Perfectionism and the 80 Percent Rule", 25, ["perfectionism", "diminishing returns", "cutting losses"], "Stop polishing when the remaining minutes buy more elsewhere.", "concept", 3),
            L("Rabbit Holes and How You Fall In", 30, ["rabbit hole", "timeboxing", "parking lot"], "Spot the slide into a hole — and the exit: park it, note it, move on.", "review", 3),
            L("The Missing Summary and the Silent Session", 25, ["summary discipline", "narration failure", "closing statement"], "Guard against finishing the analysis but not finishing the assessment.", "concept", 3),
          ]),
          ch("Building Your Practice Regimen", "Timed reps on a schedule, scored honestly", [
            L("The Weekly Practice Block", 30, ["practice schedule", "dataset source", "timer discipline"], "Design a weekly block: one timed rep, one review, one targeted drill.", "guided-practice", 3),
            L("Scoring Your Own Reps", 30, ["rubric", "rep log", "trend tracking"], "Score every repetition against a fixed rubric and track the trend line.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Practical Assessments Final", 45, 20),
    projects: [
      proj(
        "Three Timed Challenges, Scored",
        "Run three 90-minute dataset challenges on three different public datasets under strict exam conditions; after each, score yourself against the playbook rubric and write a fifteen-minute post-mortem.",
        4,
        "guided",
        [
          "Three completed challenge notebooks or repositories with short write-ups",
          "A scorecard per challenge against the playbook rubric",
          "Three post-mortems naming the failure mode each run flirted with",
        ],
        [
          "Each run stopped at 90 minutes with a delivered summary",
          "Scorecards reference specific moments in the run, not vague impressions",
          "Each post-mortem traces one weakness to a drill for next week",
        ],
        ["Python", "pandas", "timer", "rubric"]
      ),
    ],
    placementEligible: true,
    keywords: ["practical assessment", "timed challenge", "pair analytics", "whiteboard", "practice regimen"],
  },

  // ---------------------------------------------------------------- I6
  {
    slug: "capstone-projects",
    school: "I",
    code: "I6",
    title: "Capstone Projects",
    blurb: "The Academy's finish line: choose, propose, execute, and defend a capstone that becomes the centerpiece of your portfolio — and graduate with work you can present.",
    difficulty: "advanced",
    track: "career",
    prerequisites: ["portfolio-projects", "exploratory-data-analysis", "model-evaluation"],
    softPrerequisites: [],
    objectives: [
      "Select a capstone that interviews well: scoped, evidenced, and defensible",
      "Write a capstone proposal with problem, data, success criteria, and timeline",
      "Drive a multi-week project through milestone gates without drift",
      "Document decisions and failures so the artifact tells the whole story",
      "Present a finished capstone to a panel and publish it for the field",
    ],
    outcomes: [
      "A learner can choose and defend a capstone scope that balances novelty against risk",
      "A learner can write a one-page proposal a mentor or panel would approve",
      "A learner can drive the milestone sequence from scoping through EDA, modeling, evaluation, and artifact",
      "A learner can deliver a final artifact — repo, README, report or presentation — that meets panel standards",
    ],
    modules: [
      mod(
        "Choosing a Capstone That Interviews Well",
        "The selection filter: a scope that fits your quarter, data you can actually obtain, and the novelty-versus-risk trade every capstone author must settle.",
        [
          "Apply a selection filter weighing scope, data availability, and interview value",
          "Choose a novelty level you can actually deliver",
        ],
        ["case-analysis", "design-review", "concept-check"],
        [
          ch("The Selection Filter", "Scope, data availability, and interview value", [
            L("The Three-Filter Test", 30, ["scope filter", "data availability", "interview value"], "Run every candidate idea through three filters before committing to it.", "concept", 3),
            L("Data First: Can You Actually Get It?", 30, ["data access", "license check", "fallback dataset"], "Verify the dataset exists, is usable, and has a fallback before you fall in love with the idea.", "guided-practice", 3),
          ]),
          ch("Novelty versus Risk", "Ambition you can cash", [
            L("The Novelty Dial and Its Costs", 25, ["novelty", "risk", "differentiation"], "Decide where your capstone sits between a safe classic and a risky original.", "concept", 3),
            L("Judging the Interview-Readiness of a Topic", 30, ["story potential", "decision moments", "defensibility"], "Ask whether the project will generate the stories an interview actually demands.", "review", 3),
          ]),
        ]
      ),
      mod(
        "The Capstone Proposal",
        "The one-page contract that keeps a multi-week project honest: problem, data, success criteria, and a dated timeline with buffers.",
        [
          "Write a one-page proposal with problem, data, and success criteria",
          "Build a milestone timeline with dates, buffers, and exit criteria",
        ],
        ["design-review", "concept-check", "multiple-choice"],
        [
          ch("Writing the Proposal", "Problem, data, and success criteria — on one page", [
            L("Problem and Stakeholder in Three Sentences", 25, ["problem statement", "stakeholder", "decision value"], "State the problem so a non-technical reader knows why it matters.", "concept", 3),
            L("Success Criteria You Cannot Fake", 30, ["success criterion", "measurable target", "baseline"], "Define done numerically — a baseline to beat or a question to answer.", "guided-practice", 3),
            L("The Data Section: Sources, Fields, Limitations", 30, ["data dictionary", "known limitations", "refresh reality"], "Document the data honestly before writing the first line of analysis code.", "worked-example", 3),
          ]),
          ch("Milestones and Timeline", "A dated path from proposal to artifact", [
            L("The Milestone Skeleton", 35, ["milestone", "exit criteria", "gate review"], "Lay the five standard gates — scoping, EDA, modeling, evaluation, artifact — and define what passes each.", "concept", 3),
            L("Scheduling Honestly: Dates, Buffers, and Slip Rules", 30, ["buffer", "slip rule", "re-scoping"], "Put real dates on the gates with buffers — and rules for what happens when they slip.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Milestone Discipline in Execution",
        "Running the gates week by week — and keeping a decision log that turns your failures into evidence of judgment.",
        [
          "Drive a capstone through each milestone gate with explicit exit criteria",
          "Maintain a decision log recording what you tried and why it failed",
        ],
        ["case-analysis", "design-review", "interpret-results"],
        [
          ch("Running the Gates", "Weekly execution with exit criteria, not vibes", [
            L("The Weekly Gate Review", 30, ["gate review", "exit criteria", "re-scope decision"], "Hold the weekly review: does the evidence pass the gate, or does the scope change?", "guided-practice", 3),
            L("When EDA Changes the Plan", 30, ["scope drift", "data reality", "plan amendment"], "Handle the moment the data disagrees with the proposal — by amending the plan, not drifting.", "review", 3),
          ]),
          ch("The Decision Log", "Documenting choices and failures as you go", [
            L("Recording Decisions and Their Reasons", 30, ["decision log", "alternatives", "rationale"], "Log each real decision: the options, the choice, the reason, and the date.", "concept", 3),
            L("Documenting Failures Productively", 25, ["failed approach", "negative result", "learning record"], "Write up what did not work — the section strong interviewers probe first.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "The Final Artifact and the Panel",
        "Finish to a published standard — repo, README, report — defend the work before a panel, then publish and network with the result. Graduation.",
        [
          "Deliver a final artifact that meets the published checklist",
          "Present the capstone to a panel and field hard questions",
          "Publish the result and use it to open professional conversations",
        ],
        ["mock-interview", "design-review", "case-analysis"],
        [
          ch("Final Artifact Standards", "Repo, README, and report, checked against a rubric", [
            L("The Artifact Checklist", 30, ["repo standards", "readme", "reproducibility"], "Apply the final checklist: clean repository, honest README, runnable pipeline.", "review", 3),
            L("The Report and the Slides", 35, ["report structure", "executive summary", "appendix"], "Build the written report and a short slide deck from the same outline.", "worked-example", 3),
          ]),
          ch("The Panel Presentation", "Defending the work in person", [
            L("Structuring the Fifteen-Minute Defense", 30, ["narrative arc", "time split", "demo moment"], "Structure the talk: context, question, method, result, limits, and what comes next.", "guided-practice", 3),
            L("Handling Panel Questions and Critique", 30, ["question handling", "defensible claims", "graceful uncertainty"], "Field the panel's probes with honesty about what the work does not show.", "concept", 3),
          ]),
          ch("Publishing, Networking, Graduation", "Turning the capstone into conversations", [
            L("Publishing the Result", 25, ["public release", "write-up venues", "licensing"], "Release the capstone publicly and write the short post people will actually read.", "concept", 2),
            L("Using the Capstone to Open Doors", 30, ["networking", "outreach message", "interview currency"], "Turn the finished capstone into outreach messages and interview stories.", "guided-practice", 3),
            L("Graduation and What Comes After", 20, ["graduation", "portfolio maintenance", "next milestone"], "Close the Academy loop and set the habit that keeps the portfolio alive.", "review", 2),
          ]),
        ]
      ),
    ],
    finalExam: exam("Capstone Projects Final", 60, 24),
    projects: [
      proj(
        "The Capstone Proposal",
        "Write and defend the one-page proposal for your graduation capstone: problem, data, success criteria, milestone timeline, and the risks you knowingly accept.",
        3,
        "guided",
        [
          "One-page proposal with problem, data, and success criteria",
          "Milestone timeline with dates and exit criteria per gate",
          "A risk register naming the top three risks and their fallbacks",
        ],
        [
          "A non-technical reader can state the problem after one read",
          "Success criteria are measurable and honest",
          "The timeline includes buffers and an explicit slip rule",
        ],
        ["document", "dataset", "mentor review"]
      ),
      proj(
        "The Graduation Capstone",
        "Execute the approved capstone end to end — through the five milestone gates to a published artifact — and defend it before a panel of mentors and peers.",
        10,
        "capstone",
        [
          "Public repository passing the artifact checklist (clean README, runnable pipeline)",
          "Written report or slide deck with executive summary and limitations",
          "Decision log covering the project's real turning points",
          "A recorded or live fifteen-minute panel defense with Q&A",
        ],
        [
          "The work meets its own stated success criteria — or honestly explains why not",
          "Milestone gates passed with documented exit evidence",
          "Panel defense: claims match artifacts, uncertainty handled gracefully",
        ],
        ["Python", "pandas", "scikit-learn", "GitHub"]
      ),
    ],
    placementEligible: true,
    keywords: ["capstone", "proposal", "milestones", "artifact", "panel", "graduation"],
  },
];
