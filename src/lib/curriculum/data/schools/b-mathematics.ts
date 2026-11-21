/**
 * SCHOOL B — MATHEMATICS (B1–B11)
 *
 * The math a data career runs on, rebuilt from zero for people who missed
 * it, forgot it, or never trusted it: arithmetic and estimation through
 * fractions and percentages, algebra, equations, functions, exponents and
 * logarithms, trigonometry, vectors and matrices, linear algebra,
 * calculus, and optimization.
 *
 * Authoring rules for this school:
 * - Nothing is assumed from school math: every foundation is taught.
 * - Every formula is derived or built from a picture before it is drilled.
 * - Every idea is anchored to a question data people actually ask —
 *   percentages in reports, formulas in spreadsheets, slopes in trends,
 *   projections in regression, gradients in machine learning.
 * - Voice: honest, concrete, no fluff. Lesson titles name the idea.
 */
import { ch, exam, L, mod, proj } from "../../dsl";
import type { SubjectDef } from "../../types";

export const schoolB: SubjectDef[] = [
  {
    slug: "arithmetic-foundations",
    school: "B",
    code: "B1",
    title: "Arithmetic Foundations",
    blurb: "The number sense data work quietly assumes — operations, factors, rounding, and the estimation reflex that catches bad numbers before they ship.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: [],
    softPrerequisites: [],
    objectives: [
      "Compute fluently with whole numbers, integers, and decimals — by hand and by head",
      "Factor numbers into primes and apply divisibility, GCD, and LCM to real problems",
      "Round, estimate, and sanity-check numbers the way working analysts do",
      "Convert units and compare rates and ratios without mixing denominators",
      "Approach unfamiliar quantitative problems with a repeatable strategy",
    ],
    outcomes: [
      "A learner can evaluate multi-step expressions with the correct order of operations",
      "A learner can factor any number into primes and use GCD or LCM to solve scheduling and simplification problems",
      "A learner can convert between units and compute unit rates to compare offers or quantities fairly",
      "A learner can estimate an unfamiliar quantity in steps and defend a verdict of plausible or implausible",
    ],
    modules: [
      mod(
        "Number Sense and the Number Line",
        "What numbers are, how big they are, and how to keep your footing on the number line — the ground floor every later subject stands on.",
        ["Locate, compare, and operate on numbers including negatives", "Round and judge magnitudes without losing the story in the digits"],
        ["calculation", "concept-check", "fill-in"],
        [
          ch("Numbers and Their Sizes", "Builds the feel for magnitude that every later sanity check relies on", [
            L("The Number Line: Numbers as Positions", 20, ["number line", "magnitude", "ordering"], "See every number as a point on a line — and comparison as left and right."),
            L("Place Value and Reading Large Numbers", 25, ["place value", "powers of ten", "digit groups"], "Read millions and billions without losing count of the zeros."),
            L("Rounding and Significant Digits", 25, ["rounding", "significant digits", "precision"], "Round to the precision the data actually supports — and say why you stopped there.", "concept", 3),
          ]),
          ch("Integers: Life Below Zero", "Builds signed-number fluency — the arithmetic of debt, drops, and deficits", [
            L("Negative Numbers as Direction", 25, ["negative number", "signed number", "opposite"], "Treat the sign as a direction so 'minus' stops being a mystery."),
            L("Adding and Subtracting Signed Numbers", 30, ["signed arithmetic", "net movement", "direction"], "Add and subtract negatives with the direction rule that finally sticks.", "worked-example", 3),
            L("Multiplying Signed Numbers", 25, ["sign rules", "sign product", "double negative"], "Learn the sign rules — and the real reason two negatives make a positive."),
          ]),
        ]
      ),
      mod(
        "The Arithmetic Engine Room",
        "The four operations, the order they must run in, and the traps that wait in every long expression.",
        ["Apply the order of operations reliably in multi-step calculations", "Choose the right operation from the words of a problem"],
        ["calculation", "predict-output", "multiple-choice"],
        [
          ch("Multiplication and Division", "Builds the two operations that scale and share — with the pictures behind them", [
            L("Multiplication as Scaling and Area", 25, ["multiplication", "scaling", "area model"], "See multiplication as scaling and as area — not just memorized tables."),
            L("Division, Quotients, and Remainders", 30, ["division", "quotient", "remainder"], "Divide by hand and decide what a remainder means in a real problem.", "worked-example", 3),
          ]),
          ch("Order of Operations", "Builds the grammar that makes long expressions unambiguous", [
            L("Why Operations Have an Order", 25, ["order of operations", "precedence", "grouping symbols"], "Understand why the order exists — grouping is the idea, PEMDAS is just the rhyme."),
            L("The Classic Operation Traps", 30, ["left-to-right rule", "implicit multiplication", "minus sign squared"], "Sidestep -3^2, 6/2(1+2), and subtraction's left-to-right rule for good.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Factors, Primes, and Divisibility",
        "How numbers break apart — the hidden structure behind fractions, schedules, and modular thinking.",
        ["Factor any number into primes and explain why that matters", "Use divisibility rules, GCD, and LCM to solve practical problems"],
        ["calculation", "concept-check", "fill-in"],
        [
          ch("Factors and Primes", "Builds the atom-level view of whole numbers", [
            L("Factors, Multiples, and Divisors", 25, ["factor", "multiple", "divisor"], "Name every way a number divides — the vocabulary the rest of math reuses."),
            L("Prime Numbers and Factor Trees", 30, ["prime", "composite", "factor tree"], "Break numbers into atomic primes — the fingerprint every whole number carries.", "worked-example"),
            L("Divisibility Rules Worth Knowing", 25, ["divisibility rule", "digit sum", "last digit"], "Test divisibility by 2, 3, 5, 9, and 10 mentally — and see why each rule works."),
          ]),
          ch("GCD and LCM in Action", "Builds the two tools that make fractions and schedules click", [
            L("The Greatest Common Divisor", 30, ["gcd", "common factor", "simplifying fractions"], "Find the biggest shared factor and simplify fractions in one honest step.", "guided-practice", 3),
            L("The Least Common Multiple", 30, ["lcm", "common multiple", "scheduling"], "Line up repeating events with LCMs — the math behind schedules and common denominators.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Rates, Ratios, and Estimation in the Wild",
        "Decimals, unit conversion, and the estimation reflex that keeps every later course honest.",
        ["Convert units and compare rates without mixing denominators", "Estimate answers and catch implausible numbers before anyone else sees them"],
        ["calculation", "interpret-results", "case-analysis"],
        [
          ch("Decimals, Ratios, and Units", "Builds decimal fluency and the discipline of tracking units", [
            L("Decimal Arithmetic That Lines Up", 25, ["decimal", "place value", "decimal point"], "Add, subtract, multiply, and divide decimals with the point always in the right place.", "guided-practice", 3),
            L("Ratios and Unit Rates", 30, ["ratio", "rate", "unit rate"], "Compare prices and speeds honestly by computing per-one rates.", "worked-example", 3),
            L("Unit Conversion with Canceling Units", 30, ["unit conversion", "conversion factor", "dimensional analysis"], "Convert minutes to months and cents to thousands with units canceling visibly.", "guided-practice", 3),
          ]),
          ch("Estimation and Sanity Checks", "Builds the analyst's reflex: is this number even possible?", [
            L("Back-of-the-Envelope Estimation", 30, ["estimation", "Fermi problem", "order of magnitude"], "Estimate big quantities in checkable steps — the Fermi reflex every analyst needs.", "worked-example", 3),
            L("Catching Implausible Numbers", 25, ["sanity check", "plausible range", "error detection"], "Spot impossible results before they reach a report — with five repeatable questions.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Arithmetic Foundations Final", 40, 16),
    projects: [
      proj(
        "The Sanity-Check Gazette",
        "Collect five numeric claims from real news or reports, estimate each from first principles by hand, and write a defensible verdict — plausible or implausible — with the arithmetic to back it.",
        3,
        "guided",
        [
          "A worksheet showing the estimation steps for each of the five claims",
          "A one-paragraph verdict per claim, citing the computed order of magnitude",
          "A short summary of the most common way these numbers go wrong",
        ],
        ["Estimation steps are shown, not just conclusions", "Each verdict cites a computed range or order of magnitude", "At least one claim is correctly defended as plausible"],
        ["paper", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["arithmetic", "integers", "order of operations", "primes", "estimation", "unit conversion", "ratios"],
  },
  {
    slug: "fractions-percentages",
    school: "B",
    code: "B2",
    title: "Fractions and Percentages",
    blurb: "From what a fraction actually is to the percent traps that mislead real reports — the arithmetic of honest comparison.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["arithmetic-foundations"],
    softPrerequisites: [],
    objectives: [
      "Explain what a fraction is and operate on fractions with confidence",
      "Convert fluently among fractions, decimals, and percentages",
      "Compute percent change and spot the traps that mislead reports",
      "Solve ratio and proportion problems, including real data-work cases",
      "Audit a percentage claim by identifying its base and rebuilding it",
    ],
    outcomes: [
      "A learner can add, subtract, multiply, and divide fractions and explain each step",
      "A learner can convert any fraction to a decimal or a percentage, and back",
      "A learner can compute percent change correctly and explain the reversal trap",
      "A learner can audit a reported percentage by naming its denominator",
    ],
    modules: [
      mod(
        "What a Fraction Actually Is",
        "The two meanings of a fraction — fair share and division — built before any arithmetic touches them.",
        ["Read a fraction as a share and as a division problem", "Compare fractions fairly, without guessing"],
        ["concept-check", "calculation", "fill-in"],
        [
          ch("Two Meanings of a Fraction", "Builds the dual intuition — part of a whole, and a division waiting to happen", [
            L("Fractions as Fair Shares", 20, ["fraction", "numerator", "denominator"], "See a fraction as a fair share — what the top and bottom really count."),
            L("Fractions as Division Problems", 25, ["division interpretation", "quotient", "bar notation"], "Read 3/4 as 'three divided by four' — the meaning that unlocks decimals."),
            L("Equivalent Fractions and Simplifying", 30, ["equivalent fractions", "common factor", "simplest form"], "Rename a fraction without changing its value — the move all fraction math rests on.", "guided-practice", 3),
          ]),
          ch("Comparing Fractions", "Builds fraction number sense before any formulas arrive", [
            L("Common Denominators for Fair Comparison", 25, ["common denominator", "comparison", "unlike units"], "Compare any two fractions on one ruler — and stop guessing which is bigger."),
            L("Benchmarks: Half, Zero, and One", 25, ["benchmark fraction", "estimation", "number sense"], "Estimate fractions against 0, 1/2, and 1 — the fastest sanity check in fraction land."),
          ]),
        ]
      ),
      mod(
        "Fraction Arithmetic",
        "Adding, subtracting, multiplying, and dividing — each rule earned, not decreed.",
        ["Add and subtract fractions via common denominators", "Multiply and divide fractions and explain why the rules work"],
        ["calculation", "concept-check", "multiple-choice"],
        [
          ch("Adding and Subtracting Fractions", "Builds the why behind common denominators", [
            L("Why Adding Needs a Common Denominator", 30, ["common denominator", "unit fraction", "like units"], "Add fractions only after they speak the same unit — the reason, not the ritual."),
            L("Mixed Numbers and Improper Fractions", 30, ["mixed number", "improper fraction", "conversion"], "Convert between mixed and improper forms and compute with either confidently.", "worked-example", 3),
          ]),
          ch("Multiplying and Dividing Fractions", "Builds the operations that feel odd but make perfect sense", [
            L("Multiplying: 'Of' Means Times", 25, ["multiplication as of", "area model", "product"], "See why two-thirds of three-quarters multiplies — with a picture that proves it."),
            L("Dividing: Flip and Multiply, and Why", 30, ["reciprocal", "division as multiplication", "flip rule"], "Understand invert-and-multiply instead of just performing it.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Fractions, Decimals, and Percentages",
        "The three costumes of a number, and the percent-change arithmetic every report uses — and misuses.",
        ["Convert among fraction, decimal, and percent forms fluently", "Compute percent change and explain the base it depends on"],
        ["calculation", "predict-output", "interpret-results"],
        [
          ch("The Three Costumes of a Number", "Builds fluent conversion between fractions, decimals, and percents", [
            L("Decimals Are Fractions in Disguise", 25, ["decimal expansion", "denominator 10", "conversion"], "Convert any decimal to a fraction and back — place value does all the work."),
            L("Repeating Decimals and Their Fractions", 30, ["repeating decimal", "bar notation", "conversion"], "Turn 0.333... and 0.727272... back into exact fractions with one algebra move."),
            L("Percent: The Fraction with Denominator 100", 25, ["percent", "per hundred", "conversion"], "Move among fraction, decimal, and percent forms without hesitation."),
          ]),
          ch("Percent Change", "Builds the arithmetic of growth and discount — and its famous traps", [
            L("Percent Of, More, and Less", 30, ["percent of", "increase", "discount"], "Compute '30% off', '20% raise', and '15% of' forward, from the base."),
            L("The Reversal Trap: Up Then Down", 30, ["percent change reversal", "base effect", "asymmetry"], "Discover why a 20% raise then a 20% cut leaves you short — the base changed.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Ratios, Proportions, and Data-Work Mistakes",
        "Scaling logic and the percent errors that make real reports lie — audited, not memorized.",
        ["Solve proportion problems two ways and know when each is faster", "Audit real percentage claims for base, direction, and meaning"],
        ["calculation", "case-analysis", "interpret-results"],
        [
          ch("Ratios and Proportions", "Builds scaling logic: the same ratio at different sizes", [
            L("Ratios, Rates, and Unit Rates", 25, ["ratio", "unit rate", "scaling"], "Scale recipes, maps, and samples by finding the per-one rate first."),
            L("Solving Proportions with Cross-Multiplication", 30, ["proportion", "cross-multiplication", "scaling factor"], "Solve 'x over 12 equals 3 over 4' two ways — and know when each is faster.", "guided-practice", 3),
          ]),
          ch("The Percent Mistakes Data People Make", "Builds the error-proofing every report needs", [
            L("Percentage Points vs Percent Change", 30, ["percentage point", "percent change", "reporting"], "Distinguish 'up 3 points' from 'up 3%' — the mistake that misleads executives."),
            L("The Denominator Is the Whole Story", 30, ["base rate", "denominator", "selection"], "Ask 'percent of what?' before believing any number — the question behind honest rates."),
            L("Case Study: Auditing a News Percentage", 30, ["conversion audit", "headline math", "back-solving"], "Take one real headline percentage apart, rebuild it, and check that it closes.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Fractions and Percentages Final", 45, 18),
    projects: [
      proj(
        "The Percentage Autopsy Report",
        "Take three real percentage claims — one marketing discount, one market-share or election change, one growth statistic — and audit each: rebuild the computation, identify the base, and write the honest version.",
        4,
        "independent",
        [
          "An audit sheet reconstructing each claim's arithmetic",
          "Corrected statements for any misleading claims",
          "A one-page cheat sheet of the percent traps covered in this subject",
        ],
        ["Bases and denominators are identified explicitly", "Reconstructions match the reported numbers or document the discrepancy", "The cheat sheet names each trap with a concrete example"],
        ["paper", "calculator", "spreadsheet"]
      ),
    ],
    placementEligible: true,
    keywords: ["fractions", "percentages", "percent change", "ratios", "proportions", "denominator"],
  },

  {
    slug: "algebra-fundamentals",
    school: "B",
    code: "B3",
    title: "Algebra Foundations",
    blurb: "Variables, expressions, and the rearranging skills that make every spreadsheet formula and model equation yours instead of a stranger's.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["fractions-percentages"],
    softPrerequisites: [],
    objectives: [
      "Treat variables as placeholders and read expressions and equations as language",
      "Simplify expressions with combining, distributing, and factoring",
      "Rearrange any formula to solve for any variable — the algebra of column formulas",
      "Translate word problems into equations with defined variables",
      "Read spreadsheet formulas as algebra and audit them with test values",
    ],
    outcomes: [
      "A learner can evaluate and simplify multi-term expressions, including negatives and fractions",
      "A learner can rearrange a formula such as growth rate or a z-score for any chosen variable",
      "A learner can translate a word problem into an equation and solve it",
      "A learner can audit a spreadsheet formula by substituting test values",
    ],
    modules: [
      mod(
        "Variables and Expressions",
        "The core mental shift: letters as placeholders for numbers you don't know yet.",
        ["Read and evaluate expressions with confidence", "Distinguish expressions from equations at a glance"],
        ["concept-check", "calculation", "fill-in"],
        [
          ch("Letters That Stand for Numbers", "Builds the mental model that turns alphabet soup into meaning", [
            L("What a Variable Really Is", 25, ["variable", "placeholder", "unknown"], "See a letter as a labeled box — a number whose value we haven't pinned down yet."),
            L("Expressions vs Equations", 25, ["expression", "equation", "equality"], "Tell a recipe (expression) from a question (equation) — the distinction that organizes all algebra."),
            L("Evaluating Expressions by Substitution", 30, ["substitution", "evaluation", "order of operations"], "Plug values into formulas and compute in the right order — the daily work of every analyst.", "guided-practice", 3),
          ]),
          ch("The Language of Formulas", "Builds fluency reading and using the formulas data people meet", [
            L("Reading Formulas Like Sentences", 25, ["formula", "subscript", "summation notation"], "Decode formulas from real reports — what each symbol contributes and how to say it aloud."),
            L("Units Inside Formulas", 25, ["dimensional check", "unit consistency", "sanity"], "Check a formula's units before trusting its output — algebra's built-in lie detector."),
          ]),
        ]
      ),
      mod(
        "Simplifying: The Art of Cleaning Up",
        "Combining like terms, distributing, and factoring — the moves that make expressions manageable.",
        ["Simplify expressions by combining like terms", "Expand and factor with the distributive property"],
        ["calculation", "predict-output", "derive"],
        [
          ch("Combining and Distributing", "Builds the two moves that tame messy expressions", [
            L("Combining Like Terms", 30, ["like terms", "coefficient", "simplify"], "Collect 3x + 2x - x without fear — terms either add, or they don't."),
            L("The Distributive Property", 30, ["distributive property", "expansion", "area model"], "Expand 3(x + 4) with the area picture that makes sign errors obvious.", "worked-example", 3),
            L("Factoring: Distribution in Reverse", 30, ["factoring", "common factor", "undistributing"], "Pull out common factors to make expressions shorter and division possible."),
          ]),
          ch("Negatives and Fractions in Algebra", "Builds confidence where most algebra anxiety lives", [
            L("Subtracting Expressions: The Minus-Parentheses Trap", 30, ["negation", "sign error", "distributing minus"], "Survive a - (b - c) — the single most common algebra slip, fixed with one habit.", "guided-practice", 3),
            L("Clearing Fractions by Multiplying Through", 30, ["clearing denominators", "multiply through", "equivalent equation"], "Turn x/3 + x/4 = 7 into whole-number algebra with one multiplication.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Rearranging Formulas — The Algebra of Columns",
        "Make any quantity the subject of a formula: the power move behind reusable spreadsheets and models.",
        ["Undo operations layer by layer to isolate any letter", "Rearrange real analytical formulas on demand"],
        ["derive", "calculation", "interpret-results"],
        [
          ch("Solving for Any Letter", "Builds the mechanical skill of making any variable the subject", [
            L("Undo Operations in Reverse Order", 30, ["inverse operation", "isolate", "reverse PEMDAS"], "Peel operations off a chosen letter one layer at a time — solving, mechanically."),
            L("Rearranging Real Column Formulas", 35, ["change of subject", "rearrangement", "spreadsheet formula"], "Take growth_rate = (new - old)/old and solve for whichever cell the boss asks for.", "worked-example", 3),
          ]),
          ch("Ratios, Scales, and Proportion Formulas", "Builds the algebra of fair scaling", [
            L("Rearranging Proportions", 25, ["proportion", "cross-multiplication", "solve for x"], "Solve a/b = c/d for any of the four letters — the algebra behind every scaling problem."),
            L("The Z-Score Formula, Rearranged", 30, ["z-score", "rearrange", "plug-in"], "Take z = (x - mean)/sd and solve for x — meet your first formula from School C.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "From Words to Symbols",
        "Translation from English into algebra — the skill word problems actually test.",
        ["Translate key phrases into correct operations", "Set up and audit formulas in a spreadsheet as algebra"],
        ["case-analysis", "calculation", "multiple-choice"],
        [
          ch("Translating English into Algebra", "Builds the translation skill word problems demand", [
            L("Key Words and Their Operations", 25, ["translation", "keywords", "unknown choice"], "Map 'sum', 'less than', 'of', and 'per' to symbols — and choose your unknown deliberately."),
            L("Setting Up Equations from Stories", 30, ["word problem", "define variable", "equation setup"], "Turn a two-sentence story into one clean equation — the setup is 90% of the solve.", "guided-practice", 3),
            L("Common Translation Mix-Ups", 25, ["less than trap", "order matters", "per vs of"], "Fix 'five less than x' and 'x less than five' — the mix-ups that flip answers."),
          ]),
          ch("Algebra in the Spreadsheet", "Builds the bridge from paper algebra to working column formulas", [
            L("Cell References as Variables", 30, ["cell reference", "spreadsheet formula", "absolute reference"], "Read =B2*(1+C2) as algebra with named letters — spreadsheets are variables in production.", "code", 3),
            L("Debugging a Column Formula", 30, ["formula audit", "unit check", "test value"], "Audit a broken column formula with test values — algebra as a debugging tool.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Algebra Foundations Final", 45, 20),
    projects: [
      proj(
        "The Formula Flip Book",
        "Start from five real spreadsheet formulas — growth rate, unit price, a conversion factor, and two more from your own work — and rearrange each to solve for every variable, verifying each rearrangement with two test values.",
        3,
        "guided",
        [
          "Five formulas, each rearranged for every variable",
          "A worked verification table with test values",
          "Short notes on which rearrangements felt risky and why",
        ],
        ["Every rearrangement passes its test values", "The original and rearranged forms are algebraically identical", "Work is shown step by step, not just final forms"],
        ["paper", "spreadsheet"]
      ),
      proj(
        "From Story to Formula",
        "Write your own eight word problems spanning discounts, rates, mixtures, and work — then translate, solve, and sanity-check each, solving every problem a second time with a different variable defined to confirm the answer.",
        5,
        "independent",
        [
          "Eight authored problems with their translations",
          "Full solutions with defined variables shown",
          "A reflection on which translations you got wrong first and why",
        ],
        ["Each translation matches the story's structure", "Solutions include a sanity check against the story", "Problems span at least four different real contexts"],
        ["paper", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["algebra", "variables", "expressions", "distributive property", "factoring", "rearranging formulas", "word problems"],
  },
  {
    slug: "equations-inequalities",
    school: "B",
    code: "B4",
    title: "Equations and Inequalities",
    blurb: "Solve for the unknown — linear equations, systems, inequalities, and the word problems that hide inside them.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["algebra-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Solve linear equations in one variable, including multi-step and fraction forms",
      "Solve systems of two linear equations by substitution, elimination, and graph",
      "Solve and graph linear inequalities, applying the sign-flip rule correctly",
      "Solve absolute value equations and check both branches",
      "Translate business and everyday scenarios into solvable equations and systems",
    ],
    outcomes: [
      "A learner can solve a multi-step equation and verify the solution",
      "A learner can set up and solve a two-equation system from a word problem",
      "A learner can solve and graph an inequality without sign errors",
      "A learner can interpret no-solution and infinite-solution outcomes correctly",
    ],
    modules: [
      mod(
        "Linear Equations in One Unknown",
        "The balance-scale model and the solving routine it produces.",
        ["Solve two-step and multi-step linear equations", "Recognize equations with no solution or infinitely many"],
        ["calculation", "concept-check", "fill-in"],
        [
          ch("The Logic of Solving", "Builds the balance-scale model that every solving technique rests on", [
            L("Equations as Balanced Scales", 25, ["balance model", "equality", "inverse operation"], "See an equation as a scale — do it to both sides, and it stays true."),
            L("Two-Step Equations", 25, ["two-step equation", "isolate", "inverse operations"], "Solve 3x + 7 = 25 and its relatives by peeling operations in reverse order.", "guided-practice", 3),
            L("Variables on Both Sides", 30, ["collect terms", "move terms", "identity"], "Gather letters to one side, numbers to the other — and know what 'no solution' looks like.", "worked-example", 3),
          ]),
          ch("Fractions and Decimals in Equations", "Builds cleanup skills so no equation format can intimidate", [
            L("Clearing Fractions First", 30, ["clear fractions", "multiply through", "lcd"], "Multiply an equation by its common denominator and make fractions disappear before solving."),
            L("Decimal Equations and Precision", 25, ["decimal equation", "precision", "rounding"], "Solve with decimals — and decide honestly how many digits the answer deserves."),
          ]),
        ]
      ),
      mod(
        "Multi-Step and Literal Equations",
        "The stamina for nested operations, and the habit of solving for letters before numbers.",
        ["Solve equations that need distributing and combining", "Rearrange multi-letter formulas for any chosen variable"],
        ["calculation", "derive", "multiple-choice"],
        [
          ch("Multi-Step Equations", "Builds the routine for real formulas with nested operations", [
            L("Distribute, Combine, Then Solve", 30, ["multi-step", "distribute", "combine like terms"], "Handle 2(x - 3) + 4x = x + 12 with the three-pass routine professionals use.", "guided-practice", 3),
            L("Equations with No Solution or Infinitely Many", 30, ["no solution", "identity", "classification"], "Recognize when solving ends in 0 = 5 or 0 = 0 — and what each verdict means."),
          ]),
          ch("Literal Equations and Formulas", "Builds the habit of solving for letters before numbers", [
            L("Solving Formulas for a Chosen Variable", 30, ["literal equation", "change of subject", "symbolic solve"], "Solve for any letter in a multi-letter formula — the skill behind every reusable template."),
            L("Rearranging the Analytical Toolkit", 30, ["conversion formula", "rate formula", "rearrangement"], "Rearrange percent-change and unit-cost formulas to answer the question actually asked.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Systems of Two Equations",
        "Two constraints, one meeting point — substitution, elimination, and the stories that produce them.",
        ["Solve 2x2 systems by substitution and elimination", "Model break-even and mixture scenarios as systems"],
        ["calculation", "case-analysis", "interpret-results"],
        [
          ch("Two Unknowns, Two Equations", "Builds the meeting point: where two constraints agree", [
            L("The Meeting Point Picture", 25, ["system", "intersection", "solution"], "See a system as two lines agreeing on one point — before any algebra."),
            L("Substitution Method", 30, ["substitution", "system solving", "back-substitute"], "Solve systems by replacing one letter with an expression — the method of least machinery.", "guided-practice", 3),
          ]),
          ch("Elimination and Real Systems", "Builds the faster route for messy real coefficients", [
            L("Elimination by Adding Equations", 30, ["elimination", "combine equations", "multiplying through"], "Cancel a variable by adding scaled equations — and know which scaling to use.", "worked-example", 3),
            L("Systems in the Wild: Break-Even and Mixes", 35, ["break-even", "mixture problem", "constraint pair"], "Set up and solve break-even and mixture systems from their stories alone.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Inequalities and Absolute Value",
        "Solution ranges instead of single numbers — the answer style real constraints produce.",
        ["Solve and graph linear inequalities correctly", "Solve absolute value equations and check both branches"],
        ["calculation", "concept-check", "predict-output"],
        [
          ch("Inequalities and Their Rules", "Builds the range thinking real-world constraints demand", [
            L("Reading and Graphing Inequalities", 25, ["inequality", "solution set", "number line graph"], "Express 'at least', 'no more than', and 'between' as sets, not single numbers."),
            L("Solving Linear Inequalities", 30, ["solve inequality", "boundary", "test point"], "Solve inequalities like equations — then test the side that holds the answers.", "guided-practice", 3),
            L("The Flip Rule: Multiplying by Negatives", 30, ["flip rule", "sign reversal", "common error"], "Understand why dividing by a negative flips the sign — the most violated rule in the subject."),
          ]),
          ch("Absolute Value Equations", "Builds the two-branch thinking distance problems need", [
            L("Absolute Value as Distance", 25, ["absolute value", "distance", "symmetry"], "Read |x - 5| = 3 as 'how far from 5' — and get both answers for free."),
            L("Solving and Checking Both Branches", 30, ["two cases", "extraneous check", "verify"], "Solve both branches of an absolute value equation and verify each against the original.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Equations and Inequalities Final", 45, 20),
    projects: [
      proj(
        "Break-Even, Solved Three Ways",
        "Model a real pricing scenario — a coffee cart, an app subscription, a workshop: define cost and revenue equations from your own assumptions, solve the break-even system by substitution, elimination, and graph, then write a recommendation with a sensitivity check for one assumption moved by 10%.",
        6,
        "guided",
        [
          "Cost and revenue equations with stated assumptions",
          "The break-even solution shown three ways",
          "A one-page recommendation with a sensitivity note",
        ],
        ["Equations match the stated story exactly", "All three methods agree on the same answer", "Sensitivity analysis re-solves with a changed assumption"],
        ["paper", "graphing tool", "spreadsheet"]
      ),
    ],
    placementEligible: true,
    keywords: ["linear equations", "systems of equations", "inequalities", "absolute value", "substitution", "elimination", "word problems"],
  },

  {
    slug: "functions-graphs",
    school: "B",
    code: "B5",
    title: "Functions and Graphs",
    blurb: "The machine model of functions, the slope-as-rate habit, and the graph-reading skills that turn pictures into evidence.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["algebra-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Explain what a function is and use function notation fluently",
      "Determine domain and range and decide what inputs a model honestly accepts",
      "Work with linear functions — slope as a rate, intercepts as meanings",
      "Sketch and interpret quadratics, including vertices, roots, and transformations",
      "Read professional graphs critically and model tiered rules as piecewise functions",
    ],
    outcomes: [
      "A learner can evaluate functions and identify their domain and range",
      "A learner can build a linear model from two points and interpret its slope and intercept",
      "A learner can sketch a parabola from its equation and find its vertex and roots",
      "A learner can read values, rates, and rate changes from a graph and flag misleading axes",
      "A learner can write and evaluate a piecewise model for a tiered pricing or tax scenario",
    ],
    modules: [
      mod(
        "What a Function Is",
        "One input, exactly one output — the machine model that organizes everything from formulas to lookups.",
        ["Read and evaluate functions in standard notation", "Determine the domain and range of a function"],
        ["concept-check", "multiple-choice", "fill-in"],
        [
          ch("The Machine Model", "Builds the definition of a function before any graph appears", [
            L("Functions as Machines", 25, ["function", "input", "output"], "Feed a function an input and get one deterministic output — the machine model."),
            L("Notation You Can Read Aloud", 25, ["function notation", "f(x)", "evaluation"], "Read f(3) = 11 as 'the function sends 3 to 11' — notation as language, not code."),
            L("Domain and Range", 30, ["domain", "range", "valid input"], "Decide which inputs make sense — and which outputs can ever come out.", "concept", 3),
          ]),
          ch("Testing Functionhood", "Builds the discipline of the vertical line test and why it works", [
            L("One Input, One Output", 25, ["vertical line test", "relation", "function definition"], "Separate functions from mere relations with the one-question vertical line test."),
            L("When Data Behaves Like a Function", 25, ["deterministic", "lookup", "mapping"], "See table lookups, unit conversions, and tax brackets as functions you already use."),
          ]),
        ]
      ),
      mod(
        "Linear Functions and Slope",
        "Straight lines as constant rates — the workhorse model behind trends, pricing, and change over time.",
        ["Build a linear model from two points", "Interpret slope and intercept in real terms"],
        ["calculation", "interpret-results", "concept-check"],
        [
          ch("Straight Lines and Their Stories", "Builds the workhorse model behind every trend line you will ever read", [
            L("Slope: The Rate the Graph Reports", 30, ["slope", "rate of change", "rise over run"], "Read any straight line as a constant rate — slope is the story in one number."),
            L("Intercepts and What They Mean", 25, ["y-intercept", "x-intercept", "starting value"], "Interpret the two crossings: the starting value and the zero moment."),
            L("Building Line Equations from Two Points", 30, ["point-slope form", "two-point form", "linear model"], "Take two data points and produce the line through both — the baby version of trend fitting.", "worked-example", 3),
          ]),
          ch("Reading and Using Linear Models", "Builds the analyst habit of interrogating a line before trusting it", [
            L("Predicting Inside the Data's Range", 25, ["interpolation", "extrapolation", "prediction"], "Predict with a line — and know when you've left the territory your data defends."),
            L("Linear Models on Real Data", 30, ["trend", "fit by hand", "residual"], "Fit a line by eye to a scatter, use it, and measure what it misses.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Quadratics and Transformations",
        "Curvature arrives: parabolas, their landmarks, and the shifts and stretches that move them.",
        ["Sketch a parabola and find its vertex and roots", "Predict how shifts and stretches reshape a graph"],
        ["calculation", "predict-output", "interpret-results"],
        [
          ch("Parabolas and Their Landmarks", "Builds the curved function every regression and optimization lesson will reuse", [
            L("Squaring: The Simplest Curve", 25, ["quadratic", "parabola", "vertex"], "Graph y = x^2 and meet curvature — the parabola's vertex and symmetry."),
            L("Vertex and Roots: The Three Landmarks", 30, ["vertex form", "roots", "zeros"], "Locate the turning point and the zeros — the landmarks you navigate every parabola by."),
            L("Factoring Quadratics to Find Roots", 35, ["factoring", "zero product property", "roots"], "Solve x^2 - 5x + 6 = 0 by factoring — with the geometric picture of what you did.", "worked-example", 3),
          ]),
          ch("Transformations: Moving Graphs Around", "Builds the shifts and stretches that turn one graph into a family", [
            L("Shifts: Adding Outside and Inside", 30, ["vertical shift", "horizontal shift", "transformation"], "Predict what +3 inside vs outside does to a graph — before you plot a single point."),
            L("Stretches, Flips, and Reading the Combo", 30, ["stretch", "reflection", "parameter reading"], "Read an equation and sketch its graph from parameters alone — the graph-reading superpower.", "guided-practice", 3),
          ]),
        ]
      ),
      mod(
        "Graph Reading and Piecewise Thinking",
        "The professional skills: extracting honest claims from charts and writing models with multiple rules.",
        ["Extract values and rates from a printed curve", "Write and evaluate piecewise models with multiple rules"],
        ["interpret-results", "case-analysis", "calculation"],
        [
          ch("Professional Graph Reading", "Builds the skill of extracting exact claims from any chart's underlying curve", [
            L("Axis Scales: The First Thing to Check", 25, ["axis scale", "truncated axis", "chart honesty"], "Start every graph with its axes — where honest reading begins and misleading charts fail."),
            L("From Graph to Numbers: Reading Values", 30, ["reading values", "interpolation", "estimation from graph"], "Extract values, differences, and rates from a printed curve within tolerance.", "guided-practice", 3),
            L("Rate Changes: Flat, Rising, Bending", 30, ["increasing", "concavity", "rate of change"], "Describe where a curve rises, flattens, and bends — the vocabulary of trends."),
          ]),
          ch("Piecewise Functions and Step Thinking", "Builds the multi-rule model behind tax tables and tiered pricing", [
            L("Different Rules for Different Ranges", 30, ["piecewise", "domain intervals", "step function"], "Write tiered pricing and tax brackets as one piecewise formula."),
            L("Evaluating and Graphing Piecewise Models", 30, ["piecewise evaluation", "boundary", "seam check"], "Evaluate and sketch piecewise models — and check the seams between pieces.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Functions and Graphs Final", 50, 20),
    projects: [
      proj(
        "The Two-Point Trendline",
        "Collect a small real dataset (10 or more points) with a roughly linear relationship, fit a line by hand using two representative points, predict three unseen values, and measure the residuals against the true values.",
        4,
        "guided",
        [
          "A hand-fit line equation derived from two chosen points",
          "Three predictions with their residual errors",
          "A short write-up: when the line is trustworthy and when it isn't",
        ],
        ["Chosen points and derived slope are shown explicitly", "Residuals are computed correctly against actual values", "Extrapolation claims are flagged as such"],
        ["paper", "graphing tool", "spreadsheet"]
      ),
      proj(
        "A Family of Curves, Tamed",
        "Take y = a(x - h)^2 + k and annotate sketches for six different (a, h, k) combinations, writing down your prediction for each graph from the parameters alone before plotting it, then summarize what each parameter controls.",
        5,
        "independent",
        [
          "Six sketches with their parameter values",
          "The written prediction recorded before each plot",
          "A summary table: what a, h, and k each control",
        ],
        ["Predictions were recorded before plotting", "Each sketch matches its equation's actual shape", "The summary rules are correct and stated generally"],
        ["graphing tool", "paper"]
      ),
    ],
    placementEligible: true,
    keywords: ["functions", "domain and range", "slope", "linear functions", "parabola", "transformations", "piecewise functions", "graph reading"],
  },
  {
    slug: "exponents-logarithms",
    school: "B",
    code: "B6",
    title: "Exponents and Logarithms",
    blurb: "Powers, scientific notation, and logarithms — the mathematics of scale, growth, and the numbers too big or small to write plainly.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["algebra-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Derive and apply the exponent rules from the meaning of a power",
      "Work with zero, negative, and fractional exponents without hesitation",
      "Use scientific notation and orders of magnitude to keep big and small numbers honest",
      "Explain logarithms as inverse exponents and use log rules as their mirror",
      "Model exponential growth and decay, including doubling time and half-life",
    ],
    outcomes: [
      "A learner can simplify expressions with any exponents and justify each rule used",
      "A learner can compute in scientific notation and compare magnitudes by powers of ten",
      "A learner can solve exponential equations with logarithms",
      "A learner can estimate doubling time and half-life and convert between period and rate",
    ],
    modules: [
      mod(
        "Exponents and Their Rules",
        "Exponent fluency built from the meaning of a power — the rules derived, never decreed.",
        ["Simplify expressions using the core exponent rules", "Evaluate zero, negative, and fractional exponents correctly"],
        ["derive", "calculation", "concept-check"],
        [
          ch("Multiplication Shorthand Grows Up", "Builds exponent fluency from the meaning, not memory", [
            L("Exponents as Repeated Multiplication", 20, ["exponent", "base", "power"], "See 2^5 as five factors of 2 — the meaning every rule is derived from."),
            L("The Product, Quotient, and Power Rules", 30, ["product rule", "quotient rule", "power rule"], "Derive the three core rules by counting factors — never memorize what you can derive.", "worked-example", 3),
            L("The Same Base: Combining Rules", 25, ["exponent algebra", "simplify", "same base"], "Simplify expressions like (x^3)^2 · x^4 without breaking the rules you just derived.", "guided-practice", 3),
          ]),
          ch("Exponents Beyond Positive Integers", "Builds the strange exponents — zero, negative, fractional — from pattern logic", [
            L("Zero and Negative Exponents", 30, ["zero exponent", "negative exponent", "reciprocal"], "Discover why x^0 = 1 and x^-2 = 1/x^2 — the pattern forces it, no decree needed."),
            L("Fractional Exponents and Roots", 30, ["fractional exponent", "square root", "radical"], "Read x^(1/2) as the square root of x — the bridge between powers and roots.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Scientific Notation and Magnitude",
        "The notation for numbers too big or small for plain writing — and the log-scale thinking behind it.",
        ["Convert and compute in scientific notation", "Compare quantities by order of magnitude"],
        ["calculation", "interpret-results", "fill-in"],
        [
          ch("Big and Small Numbers, Written Honestly", "Builds the notation every computation with real-world scales depends on", [
            L("Scientific Notation: Mantissa Times a Power of Ten", 25, ["scientific notation", "mantissa", "power of ten"], "Write 4.2 billion and 0.000031 in one honest format — and know how big each is."),
            L("Computing in Scientific Notation", 30, ["multiply powers", "add exponents", "order of magnitude"], "Multiply and divide big numbers by handling mantissas and powers separately.", "guided-practice", 3),
          ]),
          ch("Log Scales and Orders of Magnitude", "Builds the log-scale thinking behind Richter, decibels, and pH", [
            L("Log Scales: When Multiplying Feels Like Adding", 30, ["log scale", "order of magnitude", "earthquake scale"], "Feel why a magnitude-7 earthquake is not 'a bit more' than a 5 — log scales turn ratios into steps."),
            L("Estimating with Orders of Magnitude", 25, ["order of magnitude", "estimation", "powers of ten"], "Compare anything — bytes, budgets, populations — by counting powers of ten.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Logarithms, Inverted",
        "The logarithm as the inverse question: what exponent produces this?",
        ["Evaluate logarithms and explain what they invert", "Apply log rules derived from exponent rules"],
        ["derive", "calculation", "concept-check"],
        [
          ch("The Logarithm as the Inverse Exponent", "Builds the question logarithms actually answer", [
            L("Logarithms: 'What Power Gives Me This?'", 30, ["logarithm", "inverse", "exponent unknown"], "Read log_10(1000) as 'ten to what power makes 1000?' — the inverse question."),
            L("Solving Exponential Equations with Logs", 30, ["exponential equation", "take the log", "unknown exponent"], "Solve 2^x = 40 exactly — the move that unlocks locked doors.", "worked-example", 3),
            L("The Log Rules Mirror the Exponent Rules", 30, ["log product rule", "log power rule", "mirror rules"], "Derive the log rules from the exponent rules — a mirror image, not a second memory load."),
          ]),
          ch("Logarithms in Computation", "Builds where logs live in data work: transformation and algorithms", [
            L("Log-Transforming Skewed Data", 30, ["log transform", "skew", "symmetry"], "Pull a long right tail back toward symmetric — the analyst's favorite transformation."),
            L("Logarithms in Algorithm Talk", 25, ["logarithmic growth", "binary search", "complexity language"], "Understand why 'log n' is the sound of halving — the vocabulary of fast algorithms."),
          ]),
        ]
      ),
      mod(
        "Exponential Growth and Decay",
        "Compounding, doubling time, and half-life — with the judgment to know when the model applies.",
        ["Model growth and decay with exponential functions", "Estimate doubling time and half-life fluently"],
        ["calculation", "interpret-results", "case-analysis"],
        [
          ch("The Exponential Pattern", "Builds the model behind interest, populations, and viral spread", [
            L("Growth at a Constant Rate, Compounded", 30, ["exponential growth", "compounding", "growth rate"], "Grow 100 by 5% per step and watch the curve take off — compounding, mechanically."),
            L("Doubling Time and the Rule of 70", 30, ["doubling time", "rule of 70", "growth rate"], "Estimate doubling time in your head — 70 divided by the percent rate, and why it works.", "worked-example", 3),
            L("Half-Life and Decay", 30, ["half-life", "decay", "exponential decrease"], "Model decay with half-lives — radioactive or reputational, the same mathematics."),
          ]),
          ch("Growth in the Real World", "Builds the judgment to apply growth models with their limits in view", [
            L("Linear vs Exponential: Which Story Is This?", 30, ["linear vs exponential", "second differences", "model choice"], "Tell additive from multiplicative growth from a table of numbers alone.", "guided-practice", 3),
            L("The Limits of Growth Models", 25, ["carrying capacity", "model validity", "forecast humility"], "Ask when exponential models stop applying — the honesty every forecast needs."),
          ]),
        ]
      ),
    ],
    finalExam: exam("Exponents and Logarithms Final", 45, 18),
    projects: [
      proj(
        "The Doubling-Time Detective",
        "Take three real growth series — a country's GDP, a platform's user count, a technology's adoption — classify each as linear or exponential with evidence, estimate doubling times with the Rule of 70, then compute exact doubling times with logarithms and compare the two methods' accuracy.",
        4,
        "independent",
        [
          "Classification of each series with the evidence cited",
          "Rule-of-70 estimates alongside exact log-based answers",
          "A short reflection on when the shortcut is good enough",
        ],
        ["Classifications cite ratios or differences from the data", "Exact doubling times are computed correctly with logarithms", "The comparison quantifies the Rule of 70's error"],
        ["spreadsheet", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["exponents", "scientific notation", "logarithms", "log rules", "exponential growth", "half-life", "log scales"],
  },

  {
    slug: "trigonometry",
    school: "B",
    code: "B7",
    title: "Basic Trigonometry",
    blurb: "Right triangles, the unit circle, and the periodic functions that let you model seasonality and think in signals.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["functions-graphs"],
    softPrerequisites: [],
    objectives: [
      "Define sine, cosine, and tangent from similar triangles and use them to solve for missing sides and angles",
      "Extend the ratios to all angles with the unit circle and radian measure",
      "Graph sine and cosine and read amplitude, period, and phase from an equation or a plot",
      "Model seasonality and other cyclical patterns with tuned sine functions",
      "Explain frequency and angle-based similarity in the language data work uses",
    ],
    outcomes: [
      "A learner can find unknown sides and angles in right triangles using trig ratios",
      "A learner can convert degrees to radians and evaluate trig functions in any quadrant",
      "A learner can tune amplitude, period, and phase to fit a cyclical pattern",
      "A learner can connect the unit circle to the identity sin^2 + cos^2 = 1",
    ],
    modules: [
      mod(
        "Right Triangles and the Ratios",
        "Where trigonometry starts: similar triangles, three ratios, and the problems they solve.",
        ["Solve right triangles for missing sides and angles", "Explain why the ratios depend only on the angle"],
        ["calculation", "concept-check", "fill-in"],
        [
          ch("The Geometry You Need", "Builds the triangle vocabulary everything else stands on", [
            L("Right Triangles: Hypotenuse and Legs", 20, ["right triangle", "hypotenuse", "legs"], "Name the sides correctly — the vocabulary every trigonometric ratio depends on."),
            L("Similar Triangles: Same Shape, Different Size", 25, ["similar triangles", "proportion", "scale"], "See why same-angle triangles keep the same side ratios — the fact that makes trig possible."),
          ]),
          ch("Sine, Cosine, Tangent", "Builds the three ratios that convert angles into numbers", [
            L("SOH-CAH-TOA, Derived Not Memorized", 30, ["sine", "cosine", "tangent"], "Define sin, cos, and tan as side ratios — and see why similar triangles make them functions of the angle alone."),
            L("Finding Missing Sides", 30, ["solve triangle", "angle given", "ratio use"], "Given one side and one angle, find every side — the classic use of trig ratios.", "guided-practice", 3),
            L("Finding Missing Angles: Inverse Trig", 30, ["inverse sine", "arcsin", "arctan"], "Reverse the ratios to recover angles — arcsin, arccos, arctan and what they return.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "The Unit Circle and Radians",
        "The circular picture that extends trig beyond right triangles — and the angle measure calculus prefers.",
        ["Read sine and cosine as unit-circle coordinates", "Convert fluently between degrees and radians"],
        ["calculation", "concept-check", "derive"],
        [
          ch("Circles as Trigonometry's Home", "Builds the circular picture that extends trig beyond right triangles", [
            L("The Unit Circle: Coordinates as Cosine and Sine", 30, ["unit circle", "cosine as x", "sine as y"], "Place any angle on a radius-1 circle and read cos and sin as coordinates."),
            L("Radians: Angles Measured by Arc", 30, ["radian", "arc length", "pi"], "Measure angles by the arc they cut — why a full turn is 2π and why radians keep the math clean."),
            L("Degrees and Radians: Fluent Conversion", 25, ["degree", "radian conversion", "special angles"], "Convert both directions and memorize only the five special angles worth knowing.", "guided-practice", 3),
          ]),
          ch("Extending Beyond 90 Degrees", "Builds sine and cosine for all angles — including the awkward quadrants", [
            L("Signs and Reference Angles in Four Quadrants", 30, ["quadrant", "reference angle", "cast rule"], "Find any angle's ratio by quadrant sign and reference angle — no giant table needed."),
            L("The Pythagorean Identity", 25, ["sine squared plus cosine squared", "identity", "unit circle proof"], "Prove sin^2(θ) + cos^2(θ) = 1 from the circle — the identity that keeps showing up.", "worked-example"),
          ]),
        ]
      ),
      mod(
        "Periodic Functions and Data",
        "Sine and cosine as working models for anything that repeats — from tides to monthly sales.",
        ["Tune a sine model with amplitude, period, and phase", "Recognize cyclic patterns in real series"],
        ["calculation", "interpret-results", "case-analysis"],
        [
          ch("Waves: Sine and Cosine as Functions", "Builds the graph shapes that model anything cyclical", [
            L("Graphing Sine and Cosine", 30, ["period", "amplitude", "wave"], "Sketch the waves from the circle — amplitude, period, and the meaning of each."),
            L("Amplitude, Period, Phase: Tuning a Wave", 30, ["amplitude", "phase shift", "frequency"], "Tune a sine model with three parameters — how high, how fast, where it starts.", "guided-practice", 3),
            L("Modeling Seasonality in Data", 35, ["seasonality", "periodic model", "detrending"], "Model monthly sales or temperature cycles with a tuned sine — the seasonal pattern hunter's tool.", "guided-practice", 3),
          ]),
          ch("Angles and Signals in Data Work", "Builds the signal-thinking payoff: cycles, frequency, and rotation", [
            L("Frequency: How Many Cycles Per Unit", 25, ["frequency", "period", "sampling"], "Convert between period and frequency — the two ways to describe how often something repeats."),
            L("Similarity by Angle: The Cosine Preview", 30, ["cosine similarity preview", "angle between vectors", "signal alignment"], "Meet the idea that angles measure alignment — a preview of cosine similarity in machine learning."),
          ]),
        ]
      ),
    ],
    finalExam: exam("Basic Trigonometry Final", 45, 16),
    projects: [
      proj(
        "The Seasonality Model",
        "Take a real monthly series with visible seasonality — city temperatures, retail sales, website traffic — fit a sine model by choosing amplitude, period, and phase from the data, and report how well the tuned curve tracks the peaks, including one peak the model misses.",
        5,
        "independent",
        [
          "A table of the raw data with its identified period",
          "A tuned sine model with all three parameters justified",
          "An error report comparing model predictions to actual values",
        ],
        ["Period is justified from the data, not assumed", "Parameters are chosen from measured peaks and troughs", "The error discussion is quantitative, not narrative"],
        ["spreadsheet", "graphing tool"]
      ),
    ],
    placementEligible: true,
    keywords: ["trigonometry", "sine", "cosine", "tangent", "unit circle", "radians", "periodic functions", "seasonality"],
  },
  {
    slug: "vectors-matrices",
    school: "B",
    code: "B8",
    title: "Vectors and Matrices",
    blurb: "Arrows, lists of numbers, and grids that move space — the concrete geometry behind similarity scores and every linear model.",
    difficulty: "beginner",
    track: "foundation",
    prerequisites: ["algebra-fundamentals"],
    softPrerequisites: [],
    objectives: [
      "Represent vectors as arrows and as lists, and compute magnitude and direction",
      "Add and scale vectors, and compute dot products with their geometric meaning",
      "Use cosine similarity to compare real data records meaningfully",
      "Interpret matrices as transformations and multiply matrix by vector and by matrix",
      "See data tables as matrices and read matrix notation in the wild",
    ],
    outcomes: [
      "A learner can compute vector magnitude and the dot product, and interpret both",
      "A learner can find the angle between two vectors and score their alignment",
      "A learner can apply a 2x2 matrix to a vector and predict where it lands",
      "A learner can frame a scoring model as a matrix-vector product",
    ],
    modules: [
      mod(
        "Vectors: Arrows and Lists",
        "The dual picture — arrow in space, list of numbers — that all linear algebra moves between.",
        ["Compute with vectors as arrows and as lists", "Interpret magnitude and direction in real terms"],
        ["calculation", "concept-check", "fill-in"],
        [
          ch("Two Ways to See a Vector", "Builds the dual picture every later lesson moves between", [
            L("The Arrow: Magnitude and Direction", 25, ["vector", "magnitude", "direction"], "Treat quantities that point — velocity, displacement, change — as arrows with size and heading."),
            L("The List: Coordinates as Instructions", 25, ["components", "coordinates", "ordered list"], "Read (3, 4) as 'three over, four up' — the list view that computers actually store."),
            L("Magnitude: Pythagoras Returns", 30, ["vector norm", "pythagorean theorem", "length"], "Compute a vector's length from its components — the Pythagorean theorem, promoted.", "worked-example"),
          ]),
          ch("Vector Arithmetic", "Builds addition and scaling — the two operations vectors were born for", [
            L("Adding Vectors: Tip to Tail", 30, ["vector addition", "tip-to-tail", "resultant"], "Add arrows by walking them in sequence — and add lists component by component.", "guided-practice", 3),
            L("Scaling Vectors: Stretch and Flip", 25, ["scalar multiplication", "stretch", "direction reversal"], "Multiply a vector by a number — stretch it, shrink it, or point it the other way."),
          ]),
        ]
      ),
      mod(
        "The Dot Product and What It Measures",
        "One number that captures how aligned two vectors are — the seed of similarity scoring.",
        ["Compute the dot product two ways", "Turn dot products into angles and similarity scores"],
        ["calculation", "interpret-results", "case-analysis"],
        [
          ch("Direction Meets Length", "Builds the one number that captures alignment between two vectors", [
            L("The Dot Product: Direction Meets Length", 30, ["dot product", "alignment", "projection"], "Compute the dot product by components and by geometry — and learn what it measures."),
            L("Angles Between Vectors", 30, ["angle between vectors", "cosine", "orthogonality"], "Turn dot products into angles — and meet perpendicularity as a zero, not a picture.", "worked-example", 3),
          ]),
          ch("Similarity: The Data Payoff", "Builds the similarity measure behind search, recommendations, and embeddings", [
            L("Cosine Similarity for Data People", 30, ["cosine similarity", "similarity score", "normalization"], "Score how alike two records are by direction alone — the trick behind recommendation systems."),
            L("Case Study: Comparing Customer Profiles", 30, ["feature vector", "similarity ranking", "nearest neighbor"], "Rank customers by profile similarity with cosine scores — your first taste of vectorized data.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Matrices as Transformations",
        "Grids of numbers as instructions for moving space — rotation, reflection, and the rest.",
        ["Read a matrix as a transformation of space", "Multiply matrices by vectors and by matrices"],
        ["calculation", "predict-output", "concept-check"],
        [
          ch("What a Matrix Is", "Builds the grid-of-numbers view and the movement it encodes", [
            L("Matrices: Grids with Meaning", 25, ["matrix", "rows", "columns"], "Read a matrix as a stack of row-vectors or a row of column-vectors — two views, one grid."),
            L("Matrices as Movement: Where Do the Axes Go?", 30, ["linear transformation", "basis images", "columns as images"], "See a 2x2 matrix as an instruction: where the x-axis and y-axis land — transformation, not table."),
            L("Rotations and Reflections in a Grid", 30, ["rotation matrix", "reflection", "transformation geometry"], "Write the matrices for common moves — rotations, flips, stretches — and test them on corners.", "worked-example", 3),
          ]),
          ch("Matrix Multiplication", "Builds the composition move that makes matrices a language", [
            L("Multiplying Matrix by Vector", 30, ["matrix-vector product", "transformation applied", "weighted combination"], "Apply a matrix to a vector — the computation every neural-network layer repeats millions of times.", "guided-practice", 3),
            L("Matrix by Matrix: Two Moves in One", 30, ["matrix multiplication", "composition", "order matters"], "Compose transformations and discover why AB is not BA — order is meaning."),
          ]),
        ]
      ),
      mod(
        "Matrices in Data Work",
        "Rows as records, columns as features — the bridge from spreadsheet thinking to matrix thinking.",
        ["Frame tidy data as a matrix", "Read matrix formulas and check shapes before multiplying"],
        ["calculation", "case-analysis", "concept-check"],
        [
          ch("Data Tables as Matrices", "Builds the bridge from spreadsheet thinking to matrix thinking", [
            L("Rows as Records, Columns as Features", 25, ["data matrix", "records", "features"], "See any tidy table as a matrix — rows are records, columns are measured features."),
            L("Weighted Sums: The Matrix-Vector Pattern", 30, ["weighted sum", "scoring model", "linear score"], "Compute scores as weighted sums — the matrix-vector product hiding inside every scoring model.", "guided-practice", 3),
            L("Transposes and Shapes", 25, ["transpose", "shape", "dimension check"], "Flip rows and columns and check shapes before multiplying — the habit that prevents silent disasters.", "code", 3),
          ]),
          ch("Matrices in Practice", "Builds the fluency to read matrix formulas in the wild without panic", [
            L("Reading Matrix Formulas in the Wild", 30, ["notation fluency", "formula reading", "dimensional reasoning"], "Decode matrix expressions from books and docs — shapes tell you what's computable."),
            L("Limits of the Grid: What Matrices Can't Do", 25, ["nonlinearity", "limitations", "model framing"], "Name what linear transformations can't express — where the linear world ends."),
          ]),
        ]
      ),
    ],
    finalExam: exam("Vectors and Matrices Final", 45, 18),
    projects: [
      proj(
        "A Similarity Engine for Real Records",
        "Represent ten real items — songs, movies, products — as feature vectors built from measurable attributes, compute the full grid of cosine similarities, and use the scores to answer: which pair is most alike, which is most opposite, and one ranking your engine produces that a human would question.",
        5,
        "independent",
        [
          "A feature table with units and justified scales",
          "The full similarity matrix, computed and shown",
          "Findings: closest pair, most opposite pair, and one questionable ranking",
        ],
        ["Feature scales are justified or normalized before scoring", "Similarity computations are correct for every pair", "The questionable-ranking critique references specific vectors"],
        ["spreadsheet", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["vectors", "dot product", "cosine similarity", "matrices", "matrix multiplication", "linear transformations", "feature vectors"],
  },

  {
    slug: "linear-algebra",
    school: "B",
    code: "B9",
    title: "Linear Algebra",
    blurb: "Systems, inverses, span, eigenvalues, and the geometry of least squares — the mathematics every model quietly runs on.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["vectors-matrices"],
    softPrerequisites: [],
    objectives: [
      "Solve linear systems with Gaussian elimination and read the shape of their solutions",
      "Compute matrix inverses and determinants, and diagnose when inversion fails",
      "Reason about span, linear independence, and subspaces geometrically",
      "Compute eigenvalues and eigenvectors of small matrices and explain their ML payoff",
      "Explain least squares as projection onto a column space",
    ],
    outcomes: [
      "A learner can solve a 3x3 system by elimination and classify systems with no or infinitely many solutions",
      "A learner can invert a 2x2 matrix by hand and say when that's impossible and why",
      "A learner can test a set of vectors for linear independence and describe its span",
      "A learner can find the eigenvalues of a 2x2 matrix and verify an eigenvector",
      "A learner can draw the least-squares solution as a projection with an orthogonal residual",
    ],
    modules: [
      mod(
        "Solving Systems with Matrices",
        "From equations to grids and back — elimination as the algorithm computers actually run.",
        ["Solve systems with matrix elimination", "Classify systems as unique, inconsistent, or underdetermined"],
        ["calculation", "concept-check", "derive"],
        [
          ch("From Equations to Grids", "Builds the leap from systems to matrix form — and back", [
            L("Writing Systems as Ax = b", 25, ["coefficient matrix", "system of equations", "matrix form"], "Pack a system of equations into three objects — A, x, b — and read it back out fluently."),
            L("Gaussian Elimination, by Hand", 35, ["gaussian elimination", "row operations", "back-substitution"], "Solve systems by systematic elimination — the algorithm under every solver you'll ever call.", "guided-practice", 3),
            L("Row Echelon Form and Reading the Answer", 30, ["echelon form", "pivots", "solution structure"], "Know when elimination ends with one answer, none, or infinitely many — and how to tell which."),
          ]),
          ch("When Systems Misbehave", "Builds the diagnosis skills for singular and underdetermined cases", [
            L("No Solution and Infinitely Many", 30, ["inconsistent system", "underdetermined", "free variable"], "Interpret the systems that break — geometrically as line configurations, algebraically as elimination outcomes."),
            L("Overdetermined Systems: Too Many Equations", 30, ["overdetermined", "inconsistent data", "need for least squares"], "Meet the system real data always gives you — too many equations, none agreeing — and why least squares must exist."),
          ]),
        ]
      ),
      mod(
        "Inverses and Determinants",
        "Undoing a transformation — when you can, when you can't, and the number that tells you.",
        ["Invert small matrices and verify the result", "Use determinants to detect singularity and scale change"],
        ["calculation", "derive", "interpret-results"],
        [
          ch("Undoing a Matrix", "Builds the inverse — what it is, when it exists, why it fails", [
            L("The Identity Matrix and What Undoing Means", 25, ["identity matrix", "inverse", "undo transformation"], "Meet I, the do-nothing matrix, and define the inverse as the move that reverses another."),
            L("Computing a 2x2 Inverse", 30, ["2x2 inverse", "ad minus bc", "verify by multiplying"], "Invert small matrices by hand and verify your result by multiplying back.", "worked-example", 3),
            L("When the Inverse Fails: Singular Matrices", 30, ["singular matrix", "zero determinant", "collapsing dimensions"], "See why some matrices can't be undone — a whole dimension collapses to nothing.", "concept", 3),
          ]),
          ch("The Determinant", "Builds the one number that measures how a transformation scales area", [
            L("Determinant as Area Scale Factor", 30, ["determinant", "area scaling", "2x2 determinant"], "Compute det(A) and read it as: this matrix multiplies areas by |det| — and flips space if it's negative."),
            L("Determinants in Practice", 25, ["singularity test", "volume scaling", "conditioning hint"], "Use determinants to test invertibility and volume change — including what 'close to zero' warns you about.", "concept", 3),
          ]),
        ]
      ),
      mod(
        "Span, Independence, and Subspaces",
        "The vocabulary that separates rich data from redundant data — taught as geometry, not ritual.",
        ["Determine what a set of vectors can reach", "Test for redundancy and project onto subspaces"],
        ["derive", "concept-check", "calculation"],
        [
          ch("Building Blocks of Space", "Builds the vocabulary that separates rich data from redundant data", [
            L("Linear Combinations and Span", 30, ["linear combination", "span", "generating"], "Ask what a set of vectors can reach — and whether your columns reach everything."),
            L("Linear Independence: No Free Riders", 30, ["linear independence", "redundant vector", "dependence"], "Detect vectors that add nothing — the redundancy test data cleaning echoes."),
            L("Basis: The Minimal Complete Team", 30, ["basis", "dimension", "coordinate system"], "Find the smallest team of vectors that still reaches everywhere — what dimension really counts.", "worked-example"),
          ]),
          ch("Projections and Subspaces", "Builds the geometry of dropping perpendiculars — the heart of least squares", [
            L("Subspaces: Lines and Planes Through the Origin", 30, ["subspace", "column space", "null space"], "Meet the spaces a matrix's vectors generate — the column space and its shadow partner."),
            L("Projection: The Closest Point in a Subspace", 35, ["projection", "orthogonal", "closest point"], "Project a point onto a line or plane — the geometry that makes regression work.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Eigenvalues and the Geometry of Least Squares",
        "The special directions a matrix doesn't turn, and the picture every regression will hang on.",
        ["Compute eigenvalues and eigenvectors of small matrices", "Explain least squares as projection and connect it to regression"],
        ["derive", "interpret-results", "case-analysis"],
        [
          ch("Eigenvalues and Eigenvectors", "Builds the special directions a transformation doesn't turn — and the ML payoff", [
            L("The Directions a Matrix Keeps", 30, ["eigenvector", "eigenvalue", "fixed direction"], "Find the vectors a matrix only stretches — the directions that define its behavior."),
            L("Computing Eigenvalues for 2x2 Matrices", 35, ["characteristic equation", "eigenvalue computation", "trace and determinant"], "Solve for eigenvalues by hand — the characteristic equation, and what trace and det already tell you.", "worked-example", 3),
            L("The Machine-Learning Payoff", 30, ["PCA idea", "covariance directions", "variance capture"], "See how PCA finds the directions of maximum spread — eigenvectors of the covariance matrix, in plain sight."),
          ]),
          ch("The Geometry of Least Squares", "Builds the picture every regression in the Academy hangs on", [
            L("The Closest Reachable Point", 30, ["least squares", "projection of data", "residual orthogonality"], "See regression as projection: the closest point your columns can reach to the data's answer."),
            L("Putting the Geometry to Work", 35, ["normal equations idea", "fit context", "residual vector"], "Connect projection geometry to the regression formula — the bridge from B9 to every model in School F.", "review", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Linear Algebra Final", 50, 22),
    projects: [
      proj(
        "A Geometry-of-Data Notebook",
        "For a small real dataset — two variables, twelve or more points — trace the full geometric story by hand: represent the fit as a projection, compute the least-squares line two independent ways, and visualize the residual vector with the geometry annotated.",
        6,
        "guided",
        [
          "An annotated sketch of the projection geometry",
          "The least-squares solution computed two independent ways",
          "The residual vector drawn and its orthogonality verified numerically",
        ],
        ["Both computations agree to rounding", "The sketch labels column space and projection correctly", "Orthogonality of residuals is verified with a dot product"],
        ["paper", "calculator", "spreadsheet"]
      ),
      proj(
        "Eigenvectors of a Real Covariance Matrix",
        "Compute the 2x2 covariance matrix of a real two-variable dataset, find its eigenvalues and eigenvectors by hand, plot the data with both eigenvector directions drawn, and report which direction captures more spread and how much.",
        6,
        "independent",
        [
          "The covariance matrix computed from the data",
          "Eigenvalues and unit eigenvectors, worked by hand",
          "A plot with the data and both eigenvector axes, plus the variance shares",
        ],
        ["Covariance entries are computed correctly from centered data", "Eigenvectors satisfy Av = λv when checked", "Variance shares are reported as proportions that sum to one"],
        ["spreadsheet", "graphing tool", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["linear algebra", "gaussian elimination", "matrix inverse", "determinant", "linear independence", "eigenvalues", "least squares", "projection"],
  },
  {
    slug: "calculus",
    school: "B",
    code: "B10",
    title: "Calculus",
    blurb: "Rates of change and accumulated change — the calculus behind gradients, optimization, probability mass, and expectation.",
    difficulty: "intermediate",
    track: "core",
    prerequisites: ["functions-graphs", "exponents-logarithms"],
    softPrerequisites: [],
    objectives: [
      "Explain limits and continuity intuitively and why calculus needs them",
      "Compute derivatives with the power, product, quotient, and chain rules",
      "Use first and second derivatives to find and classify extreme values",
      "Explain the gradient as a multivariable derivative and its role in machine learning",
      "Interpret definite integrals as accumulation — area, probability mass, and expectation",
    ],
    outcomes: [
      "A learner can evaluate a limit numerically and identify discontinuities from a graph",
      "A learner can differentiate polynomials and composite functions correctly",
      "A learner can locate and classify a function's extrema and check boundaries",
      "A learner can approximate a definite integral with Riemann sums",
      "A learner can explain why probability between two values is an area and compute simple cases",
    ],
    modules: [
      mod(
        "Limits and Continuity, Intuitively",
        "Approaching without arriving — the idea that defines everything else in calculus.",
        ["Evaluate limits numerically and graphically", "Explain why the tangent and area problems need limits"],
        ["concept-check", "calculation", "interpret-results"],
        [
          ch("Approaching Without Arriving", "Builds the limit idea that defines everything else in calculus", [
            L("Limits: What the Values Approach", 30, ["limit", "approach", "table of values"], "Watch outputs settle toward a value as inputs close in — the limit, seen before defined."),
            L("Continuity and the Functions That Lack It", 30, ["continuity", "jump", "asymptote"], "Meet the functions that break — jumps, holes, and runaway ends — and what continuity promises."),
          ]),
          ch("Why Limits Matter", "Builds the two problems limits were invented to solve", [
            L("The Slope of a Curve Problem", 30, ["tangent problem", "instantaneous rate", "secant line"], "Ask for a curve's slope at a single point — the question that forces limits to exist."),
            L("The Area Under a Curve Problem", 30, ["area problem", "accumulation", "slicing"], "Ask for a curved region's area — the second question limits must answer."),
          ]),
        ]
      ),
      mod(
        "The Derivative",
        "Instantaneous rate of change, made precise — then made fast with the rules.",
        ["Compute derivatives with the standard rules", "Interpret derivative values in real units"],
        ["derive", "calculation", "predict-output"],
        [
          ch("Rate of Change, Made Precise", "Builds the derivative as the limit of average rates", [
            L("The Derivative as Instantaneous Rate", 30, ["derivative", "difference quotient", "limit of slopes"], "Shrink the interval until the average rate becomes the instant's rate — the derivative, derived."),
            L("Derivative as Slope of the Tangent", 25, ["tangent slope", "local linearity", "zoom in"], "Zoom into a curve until it looks like a line — the local linearity every optimization method exploits."),
            L("Reading Derivatives in Units", 30, ["marginal", "rate interpretation", "units of derivative"], "Interpret a derivative in units — 'dollars per additional customer' — the reading that turns math into decisions.", "concept", 3),
          ]),
          ch("Computing Derivatives: The Rules", "Builds the toolkit that makes differentiation fast", [
            L("The Power Rule and Constant Rules", 30, ["power rule", "constant multiple", "sum rule"], "Differentiate polynomials in seconds — with the rule derived once so you trust it forever.", "worked-example", 3),
            L("Products, Quotients, and Chains", 35, ["product rule", "quotient rule", "chain rule"], "Differentiate composite expressions — the chain rule as 'rates multiply through links'.", "worked-example", 3),
          ]),
        ]
      ),
      mod(
        "Using Derivatives",
        "Finding peaks, classifying valleys, and the gradient vocabulary machine learning speaks.",
        ["Find and classify critical points", "Connect derivatives to the language of loss landscapes"],
        ["calculation", "interpret-results", "case-analysis"],
        [
          ch("Finding and Classifying Extremes", "Builds the optimization moves every training loop runs", [
            L("Where the Slope Vanishes: Critical Points", 30, ["critical point", "stationary point", "first derivative test"], "Find where a function's peaks and valleys live — where the flat spots are."),
            L("The Second Derivative and Curvature", 30, ["second derivative", "concavity", "inflection"], "Ask not just 'is it flat?' but 'which way does it bend?' — curvature as the classifier."),
            L("Optimizing with Derivatives, End to End", 35, ["optimization procedure", "boundary check", "global vs local"], "Solve real optimization problems start to finish — set up, differentiate, solve, verify boundaries.", "guided-practice", 3),
          ]),
          ch("Why Data Science Cares", "Builds the bridge from derivative mechanics to ML vocabulary", [
            L("Gradients: Derivatives in Many Dimensions", 30, ["gradient", "partial derivative", "steepest ascent"], "Meet the gradient — the vector of partial derivatives pointing uphill fastest."),
            L("The Language of Loss Landscapes", 25, ["loss landscape", "descent direction", "slope to cost"], "Read ML talk about 'descending the loss surface' as plain calculus — slopes, downhill, nothing more."),
          ]),
        ]
      ),
      mod(
        "Integrals and the Area Under Curves",
        "Accumulated change — area under curves, probability as area, and expectation as a weighted average.",
        ["Compute and approximate definite integrals", "Interpret area as probability and expectation"],
        ["derive", "calculation", "interpret-results"],
        [
          ch("Accumulation and the Integral", "Builds the integral as the answer to 'how much accumulated?'", [
            L("The Definite Integral as Signed Area", 30, ["definite integral", "signed area", "accumulation"], "Add up infinitely many thin slices — the integral as total accumulation."),
            L("The Antiderivative and the Fundamental Theorem", 30, ["antiderivative", "fundamental theorem", "area from antiderivative"], "Compute areas with antiderivatives — the theorem that ties the two halves of calculus together.", "worked-example", 3),
            L("Approximating Areas When Formulas Fail", 30, ["riemann sums", "numeric integration", "trapezoid rule"], "Estimate areas for curves with no neat antiderivative — the method computers fall back on.", "guided-practice", 3),
          ]),
          ch("Integrals in Data Reasoning", "Builds the probability-and-expectation payoff of accumulation", [
            L("Probability Mass as Area", 30, ["probability density", "area under density curve", "probability as area"], "See why probability between two values is an area — the reading that unlocks the distributions of School C."),
            L("Expectation: The Weighted Average Integral", 30, ["expected value", "weighted average", "mean of distribution"], "Compute expectation as an integral — the average the whole field of statistics centers on.", "worked-example", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Calculus Final", 55, 22),
    projects: [
      proj(
        "The Optimization Write-Up, by Hand",
        "Take a real constrained quantity to optimize — box dimensions for maximum volume under fixed material, or a pricing scenario from given demand data — set up the function, differentiate, find and classify the critical point, check the boundaries, and write the argument as a mathematical memo a manager could follow.",
        4,
        "guided",
        [
          "The objective function with its setup explained",
          "Differentiation and critical-point analysis, shown step by step",
          "A one-page memo stating the optimum and why it is truly optimal",
        ],
        ["The setup matches the stated constraint exactly", "The critical point is verified with the second-derivative test", "Boundaries are checked, not ignored"],
        ["paper", "calculator"]
      ),
      proj(
        "Areas, Sliced Two Ways",
        "Choose a region under a curve that matters to data work and has no elementary antiderivative — for example a Gaussian between two z-values — approximate it with Riemann sums at three resolutions, compare against the exact or table value, and report how accuracy scales with slice width.",
        5,
        "independent",
        [
          "Three Riemann-sum approximations at different resolutions",
          "An error table comparing each approximation to the reference value",
          "A short conclusion on the accuracy-vs-computation trade-off",
        ],
        ["Slices are set up correctly with visible width choices", "The error table quantifies improvement with finer slices", "Conclusions reference the actual error numbers"],
        ["spreadsheet", "calculator"]
      ),
    ],
    placementEligible: true,
    keywords: ["calculus", "limits", "derivatives", "tangent line", "second derivative", "integrals", "gradient"],
  },

  {
    slug: "optimization",
    school: "B",
    code: "B11",
    title: "Optimization",
    blurb: "The mathematics of finding the best — gradient descent from its calculus bones, convexity, learning rates, and honest convergence.",
    difficulty: "advanced",
    track: "specialization",
    prerequisites: ["linear-algebra", "calculus"],
    softPrerequisites: [],
    objectives: [
      "Frame any optimization problem: objective, decision variables, constraints",
      "Explain convexity, the guarantee it buys, and when you lack it",
      "Derive, implement, and diagnose gradient descent from its calculus foundations",
      "Choose learning rates with evidence and recognize convergence and divergence behavior",
      "Apply practical hygiene: scaling, conditioning, restarts, and honest stopping rules",
    ],
    outcomes: [
      "A learner can frame a real scenario as an optimization problem with named parts",
      "A learner can run gradient descent by hand for several iterations and in code",
      "A learner can select and justify a learning rate, and demonstrate divergence when it is too large",
      "A learner can recognize saddle points and plateaus and explain workarounds",
      "A learner can describe constrained optima and the intuition behind Lagrange multipliers",
    ],
    modules: [
      mod(
        "The Shape of Optimization Problems",
        "Objectives, constraints, and the landscapes where optima hide — the vocabulary before the algorithms.",
        ["Frame problems with objective, variables, and constraints", "Read contour plots and distinguish landscapes"],
        ["concept-check", "interpret-results", "multiple-choice"],
        [
          ch("What Optimization Means", "Builds the vocabulary of objectives, decision variables, and constraints", [
            L("Objective, Variables, and Constraints", 25, ["objective function", "decision variable", "constraint"], "Name the three parts of every optimization problem — the framing that makes problems solvable."),
            L("Minima, Maxima, and Where They Hide", 30, ["minimum", "maximum", "feasible region"], "Locate the best value on a graph — and see that 'best' only exists where constraints allow."),
            L("Local vs Global: The Treacherous Difference", 30, ["local minimum", "global minimum", "multimodal landscape"], "Meet landscapes with many valleys — why finding some minimum is easy and finding the best one is not."),
          ]),
          ch("Reading Loss Landscapes", "Builds the geometric intuition every algorithm in this subject relies on", [
            L("Visualizing Functions of Two Variables", 30, ["contour plot", "level curve", "surface"], "Read contour maps of functions — the landscape view where all optimization wanders.", "guided-practice", 3),
            L("Convexity: Bowls vs Saddle Country", 30, ["convex function", "bowl shape", "saddle point"], "Tell a bowl from a saddle at a glance — the shape that decides how hard your problem is."),
          ]),
        ]
      ),
      mod(
        "Convexity and Why It Matters",
        "The property that makes one minimum the only minimum — and the survival kit when it's absent.",
        ["Explain the convexity guarantee and where it comes from", "Recognize the failure modes of non-convex landscapes"],
        ["concept-check", "case-analysis", "derive"],
        [
          ch("The Geometry of Easy Problems", "Builds the property that makes one minimum the only minimum", [
            L("Convex Functions: One Valley, No False Floors", 30, ["convexity", "unique minimum", "chord property"], "Understand the convex promise — any local minimum is the global one — and why that is worth gold."),
            L("Why Machine Learning Prays for Convexity", 30, ["convex loss", "linear regression loss", "guarantee vs hope"], "See which standard losses are convex and which merely wish they were — the honesty chapter of ML.", "concept", 3),
          ]),
          ch("When Life Isn't Convex", "Builds the survival kit for non-convex landscapes", [
            L("Saddle Points and Plateaus", 30, ["saddle point", "plateau", "flat region"], "Recognize the places training gets stuck — the geometry of false progress."),
            L("Multi-Start and Other Workarounds", 25, ["random restart", "initialization", "practical tactics"], "Learn the field's honest answers to non-convexity — restarts, inits, and lowered expectations."),
          ]),
        ]
      ),
      mod(
        "Gradient Descent from Scratch",
        "The algorithm on paper and in code — every symbol traced back to the calculus it rests on.",
        ["Derive the update rule from the derivative's meaning", "Run and diagnose gradient descent with different learning rates"],
        ["derive", "calculation", "predict-output"],
        [
          ch("The Algorithm on Paper", "Builds gradient descent from its calculus bones", [
            L("Downhill in Steps: The Core Idea", 30, ["gradient descent", "iterative improvement", "downhill direction"], "Follow the negative gradient one step at a time — the algorithm in one sentence and one picture."),
            L("The Update Rule, Derived", 35, ["update rule", "learning rate", "gradient step"], "Derive w_new = w - η∇f from the derivative's meaning — every symbol accounted for.", "worked-example", 3),
            L("Gradient Descent by Hand: Three Rounds", 35, ["hand computation", "iteration table", "convergence watch"], "Run gradient descent on paper for three steps on a real function — and watch the path descend.", "guided-practice", 4),
          ]),
          ch("The Learning Rate", "Builds the parameter that decides between convergence and chaos", [
            L("Too Small, Too Large, Just Right", 30, ["learning rate", "overshoot", "divergence"], "Feel the three regimes of step size — crawl, converge, explode — with traced examples.", "guided-practice", 3),
            L("Convergence: How Do You Know You're Done?", 30, ["convergence criterion", "tolerance", "iteration cap"], "Define 'done' before you start — tolerance thresholds and honest stopping rules."),
            L("Gradient Descent in Code", 35, ["python loop", "numpy gradient", "trace the loss"], "Implement gradient descent for a quadratic in fifteen lines and plot the loss falling.", "code", 3),
          ]),
        ]
      ),
      mod(
        "Beyond Vanilla: Constraints and Hygiene",
        "Optimizing inside fences, and the professional habits that keep optimization work trustworthy.",
        ["Explain constrained optima at intuition level", "Apply the hygiene that keeps optimizers honest"],
        ["case-analysis", "interpret-results", "concept-check"],
        [
          ch("Constrained Optimization, Intuitively", "Builds the intuition for optimizing inside fences", [
            L("Boundaries: When the Best Isn't Interior", 30, ["boundary optimum", "active constraint", "projected direction"], "Find optima that sit on the fence — and know why the unconstrained answer doesn't apply."),
            L("Lagrange Multipliers at Intuition Level", 35, ["lagrangian intuition", "shadow price", "gradient alignment"], "Understand why a constrained optimum means aligned gradients — the idea, not the machinery.", "concept", 3),
          ]),
          ch("Practical Optimization Hygiene", "Builds the professional habits that keep optimization work trustworthy", [
            L("Scaling and Conditioning", 30, ["feature scaling", "ill-conditioning", "elongated valleys"], "See how badly scaled variables bend landscapes into canyons — and why scaling is the first fix."),
            L("Momentum and Smarter Steps: A Tour", 25, ["momentum", "adaptive rates", "optimizer zoo"], "Tour the famous variants — momentum, AdaGrad, Adam — as engineering fixes to real failure modes."),
            L("Testing an Optimizer Honestly", 30, ["test function", "diagnostic plot", "failure analysis"], "Stress-test optimizers on standard tricky functions — the quality-control habits of the trade.", "guided-practice", 3),
          ]),
        ]
      ),
    ],
    finalExam: exam("Optimization Final", 50, 20),
    projects: [
      proj(
        "Gradient Descent by Hand and in Code",
        "Implement gradient descent twice — once by hand on paper for three iterations on a given quadratic, once in a fifteen-line script on the same function — then reconcile the two traces step by step and demonstrate one learning rate that diverges.",
        8,
        "capstone",
        [
          "The paper trace: three hand-computed iterations with gradients shown",
          "The working script with its loss curve plotted",
          "A comparison of the paper and code paths, plus one diverging learning-rate demo",
        ],
        ["Hand computations match the script's first three steps exactly", "The diverging run is explained with the update rule's behavior", "The loss curve shows genuine convergence for the chosen learning rate"],
        ["python", "numpy", "matplotlib"]
      ),
      proj(
        "Diagnosing an Optimizer on Hostile Terrain",
        "Run your gradient descent implementation against three classic hard cases — a steep elongated valley, a saddle region, and a noisy near-flat bowl — and write a diagnostic report: where it stalls, why, and which single fix (scaling, momentum, or step schedule) helps most for each case.",
        6,
        "independent",
        [
          "Diagnostic plots for all three test functions",
          "A failure-mode table linking each stall to its geometric cause",
          "A recommendation with evidence for each terrain's best fix",
        ],
        ["Stalls are explained geometrically, not just observed", "Each recommended fix is demonstrated with a rerun", "The report distinguishes symptoms (flat loss) from causes (saddle, scaling)"],
        ["python", "numpy", "matplotlib"]
      ),
    ],
    placementEligible: true,
    keywords: ["optimization", "gradient descent", "convexity", "learning rate", "local minima", "constraints", "convergence", "lagrange multipliers"],
  },
];
