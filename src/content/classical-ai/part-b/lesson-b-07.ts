/**
 * Lesson b-07 "Evaluation Functions" — the concept lesson between the two
 * coding lessons of module 2. The linear-evaluation arithmetic in the example
 * and in exercise e2 is verified by hand (material: 9-(5+3)=+1, mobility
 * 12-15=-3, Eval=+0.7; and 11-10=+1, 14-20=-6, Eval=+0.4); the horizon
 * example's exchange arithmetic (3 - 9 = -6) likewise.
 */
import type { ClassicalLesson } from "@/lib/classicalai/types";

export const LESSON_B_07: ClassicalLesson = {
  slug: "b-07",
  title: "Evaluation Functions",
  minutes: 30,
  summary:
    "When the tree outruns the clock: evaluate non-terminal positions with weighted features — and know the risks.",
  kind: "concept",
  objectives: [
    "Define the depth cutoff and the evaluation function, and state precisely what a cutoff search guarantees (and does not)",
    "Design a linear evaluation: features, weights, and the constraints — same scale as the utility, bounded, cheap, correlated — that make one usable",
    "Compute a linear evaluation by hand over material and mobility features",
    "Recognize the horizon problem and quiescence search, and explain why cutoff values are opinions ranked by depth",
  ],
  why: "Chess has a game tree with more nodes than atoms in the observable universe; backgammon never ends its tree at all, because dice keep branching it. No budget reaches the terminals, and Lesson b-03 already showed what happens when you stop early: the values become the evaluation function's opinions, and the decisions are only as good as those opinions. The evaluation function is therefore not a footnote to game search — for any game bigger than tic-tac-toe it IS the program's understanding of the game, compressed into one number per position. This lesson is about building that number honestly: which features to read, how to weight them, the four constraints any usable evaluation must satisfy, and the two classic ways naive cutoffs go wrong (the horizon problem, and scale errors that rank opinions above facts). You met the machinery in miniature with the coin game; now you get the engineering discipline that real engines live by.",
  blocks: [
    {
      kind: "text",
      text: "Every algorithm in this part so far has had one silent luxury: the game ended within reach. Tic-tac-toe endgames, five-empties midgames, toy trees — all searchable to terminals, which is why every value was a *fact*. Real games revoke the luxury. The standard response is two decisions that define an engine: **when to stop** (the cutoff test) and **what to report when you stop** (the evaluation function). Everything else — the weights, the features, the tuning — is the craft of making that reported number correlate with the truth the unseen terminals would have told.",
    },
    {
      kind: "definition",
      term: "Cutoff test",
      informal:
        "The rule that stops the search: usually a depth limit, ideally extended through noisy positions so evaluation only happens where the position is quiet.",
      formal:
        "\\text{STOP}(s, d) = \\text{true if } d \\ge d_{max} \\text{ or } \\text{TERMINAL}(s)",
      why: "The cutoff is where minimax's guarantee is surrendered — the value returned above a cutoff node is only as good as the evaluation at its leaves.",
    },
    {
      kind: "definition",
      term: "Evaluation function",
      informal:
        "A static function pricing a non-terminal position from visible features — material, mobility, threats — designed to approximate what a full search would conclude.",
      formal:
        "Eval(s) \\approx \\text{MINIMAX-VALUE}(s) \\text{ for non-terminal } s",
      why: "The approximation sign is the honest heart of game programming: Eval is a claim about the future, checkable only against deeper search.",
    },
    { kind: "heading", text: "The linear form, and why everyone uses it" },
    {
      kind: "math",
      title: "A weighted sum of features",
      displays: [
        {
          expr:
            "Eval(s) = w_1 f_1(s) + w_2 f_2(s) + \\dots + w_k f_k(s)",
          label: "linear evaluation",
        },
        {
          expr:
            "Eval(s) = \\Delta \\text{material} + 0.1 \\cdot \\Delta \\text{mobility}",
          label: "a tiny chess example",
        },
      ],
      caption:
        "Each f_i reads one feature of the position (material difference, mobility difference, king safety, pawn structure); each w_i says how much a unit of that feature is worth in the utility's units. Deltas are us-minus-them, so Eval > 0 favours us — matching the utility's perspective convention exactly.",
    },
    {
      kind: "example",
      title: "Pricing a position by hand",
      problem:
        "We hold a queen and two pawns; the opponent holds a rook, a bishop and two pawns. We count 12 legal moves; they count 15. With the conventional piece values (queen 9, rook 5, bishop 3, pawn 1) and the weights above, compute Eval.",
      steps: [
        {
          text: "Material, us: 9 + 1 + 1 = 11. Material, them: 5 + 3 + 1 + 1 = 10.",
          detail: "Piece values are the classic feature — arbitrary-looking constants that happen to survive measurement: a queen-for-rook-and-bishop trade is the borderline case (9 vs 8) players still argue about.",
        },
        {
          text: "Δmaterial = 11 − 10 = +1; Δmobility = 12 − 15 = −3.",
          detail: "Mobility — how many legal moves each side has — is the cheapest proxy for activity that still correlates with winning chances.",
        },
        {
          text: "Eval = +1 + 0.1 × (−3) = 1 − 0.3 = +0.7.",
          detail: "One material point up, three moves of activity down: the position is slightly better for us. The number is an opinion — but a disciplined, reproducible one.",
        },
        {
          text: "Sanity-check the scale: a certain win scores +1 in this convention, a certain loss −1 — so +0.7 reads as 'clearly better, not decided'.",
          detail: "This is the scale constraint in action: had Eval been allowed to output, say, +47, comparisons against real terminal utilities would be meaningless.",
        },
      ],
      result:
        "Eval(s) = +0.7 — us favour, driven by material, tempered by mobility. Roughly a 65% score expectation in self-play calibrations of this style, though that mapping is itself a heuristic.",
    },
    { kind: "heading", text: "The four constraints" },
    {
      kind: "table",
      title: "What makes an evaluation function usable",
      headers: ["Constraint", "Why it is non-negotiable"],
      rows: [
        [
          "Same scale and units as the utility",
          "Cutoff leaves and terminal leaves must be comparable: if a certain win is +1, an evaluation of +47 would outrank a real win, and −3 would hide under a bad-but-not-lost position.",
        ],
        [
          "Bounded",
          "Search compares values across branches; an unbounded Eval lets one leaf's arithmetic dominate whole subtrees and destabilizes every cutoff decision.",
        ],
        [
          "Cheap",
          "Eval runs at EVERY cutoff leaf — for a deep engine, billions of times. A gorgeous evaluation costing milliseconds each is a weaker engine than a crude one costing microseconds.",
        ],
        [
          "Correlated with the true value",
          "The whole point: Eval(s) should predict what a full search would conclude. Measured by agreement with deep searches on test suites — the tuning loop.",
        ],
      ],
      caption:
        "The first three are engineering invariants; the fourth is the scientific claim you tune for. An Eval that violates any of them does not just play badly — it breaks the search's decision logic.",
    },
    { kind: "heading", text: "The two classic failures" },
    {
      kind: "callout",
      tone: "warning",
      title: "The horizon problem",
      text: "A depth-limited search only 'knows' what happens inside its window — and the opponent's refutation may sit one ply beyond it. Concretely: at depth 2, we capture the opponent's knight. Eval reads the resulting position: material +3, mobility fine, Eval ≈ +0.8 — excellent. But the obvious recapture, arriving at ply 3, takes our queen: the exchange is 3 − 9 = −6, a lost position. The depth-2 search cannot see this and recommends the capture proudly. The engine's score and the truth diverge precisely because the consequence lay below the horizon. Lesson b-03's coin game showed the benign version (priced +1, truly +2); this is the malign one (priced +0.8, truly −0.6-ish) — and at scale it is why engines blunder into pawn-grabs right before their clock runs low.",
    },
    {
      kind: "text",
      text: "The classical repair is **quiescence search**: when the cutoff is reached in a *noisy* position — captures pending, checks flying — do not evaluate; extend the search through the forcing moves only, until a quiet position is found, and evaluate there. Quiescence is a compromise, not a cure (the forcing lines are still cutoff-bounded, and quietness is not soundness), but it removes the most embarrassing failures: an engine with quiescence does not hand its queen to a one-move recapture. Modern engines add another layer — searching a handful of promising lines far deeper ('selective extensions') — and the frontier of the field is replacing the hand-built feature sum entirely with a learned network. The constants in our example, 1 and 0.1, were once tuned by grandmaster consultation; Deep Blue's team spent years on them; today they are fitted by playing millions of games and regressing toward the outcomes. The form survived; the weights changed hands.",
    },
    { kind: "heading", text: "The whole part, as one decision" },
    {
      kind: "decisionTree",
      title: "How a game program chooses its move",
      root: {
        test: "Is the position terminal?",
        children: [
          {
            label: "yes",
            child: {
              class: "Return the utility — a fact",
              note: "+1 / 0 / −1 from the game's own scoring; no search needed",
            },
          },
          {
            label: "no",
            child: {
              test: "Does the full tree to terminals fit the budget?",
              children: [
                {
                  label: "yes (small endgames)",
                  child: {
                    class: "Minimax / alpha-beta to terminals — exact value",
                    note: "the b-04 solver; every number a fact, guarantee intact",
                  },
                },
                {
                  label: "no (real games)",
                  child: {
                    class: "Alpha-beta with a cutoff + Eval at the leaves — a strong opinion",
                    note: "ordering (b-06) to shrink the tree; quiescence to keep Eval away from noise; the horizon risk rides along",
                  },
                },
              ],
            },
          },
        ],
      },
      trace:
        "A chess engine takes the third path on every move of a real game; an endgame solver takes the second; the b-04 program takes the second inside a game whose tree is small enough. The discipline is knowing which path you are on and quoting the right kind of number.",
      caption:
        "Read the leaves left to right: fact, fact, opinion. Program strength is the quality of that third leaf — everything else in this part is machinery for reaching it as cheaply as possible.",
    },
    { kind: "heading", text: "Practice" },
    {
      kind: "exercise",
      id: "b-07-e1",
      exerciseKind: "concept-check",
      prompt:
        "An engine's utility scores a win as +1 and a loss as −1. Its evaluation function, on a promising-but-undecided middlegame position, returns +12. Why is this a bug rather than enthusiasm?",
      options: [
        {
          text: "Scale violation: the search compares cutoff leaves with terminal leaves in one tree — an Eval of +12 outranks every real win, so the engine may decline a forced win to keep its 'better' opinion",
          correct: true,
          feedback: "Correct — and the symmetric error is just as bad: an unbounded negative Eval can hide genuinely lost-but-unresolved positions. The first constraint in the table is what keeps opinions and facts commensurable.",
        },
        {
          text: "No bug: bigger numbers simply mean more confidence",
          correct: false,
          feedback: "Search has no concept of confidence — only comparison. A number's magnitude is its rank against every other leaf in the tree, including real terminals.",
        },
        {
          text: "It is fine as long as the evaluation is consistent",
          correct: false,
          feedback: "Consistency fixes nothing when +12 competes directly against +1 in the same minimax computation — the comparison itself is what breaks.",
        },
        {
          text: "The bug is using +1/−1 utilities; wins should be scored +100",
          correct: false,
          feedback: "You can rescale utilities however you like — the constraint is that Eval lives on the SAME scale, whatever it is. The mismatch, not the choice of scale, is the error.",
        },
      ],
      solution:
        "Terminal utilities and evaluation outputs must be commensurable: the search's max/min compares them directly. +12 against a +1 win ranks an opinion above a fact, corrupting every decision that mixes the two.",
      explanation:
        "When you write an engine, pick one scale and audit both ends of it: the utility function and the Eval's bounds. This is the single most common integration bug in student game programs.",
      concepts: ["evaluation function", "cutoff test"],
    },
    {
      kind: "exercise",
      id: "b-07-e2",
      exerciseKind: "trace",
      prompt:
        "Same weights as the lesson (material weight 1 with queen 9 / rook 5 / knight 3 / bishop 3 / pawn 1; mobility weight 0.1). We hold a rook, a knight and three pawns, and count 14 legal moves; the opponent holds a queen and one pawn, and counts 20 legal moves. Compute Δmaterial, Δmobility and Eval, and read the position in words.",
      solution:
        "Our material: 5 + 3 + 1 + 1 + 1 = 11. Their material: 9 + 1 = 10. Δmaterial = +1. Δmobility = 14 − 20 = −6. Eval = 1 + 0.1 × (−6) = 1 − 0.6 = +0.4. Reading: material edge to us, but their queen gives them six more moves of activity — the position is only slightly better for us, and the mobility term is doing real work pulling the assessment down from +1 to +0.4.",
      explanation:
        "Notice what the arithmetic encodes: a rook-and-knight for a queen is the classic 'two small pieces vs the big one' trade — material says yes, activity says beware. The weights are where such judgment gets quantified, and tuning them is the craft.",
      concepts: ["feature weights", "evaluation function"],
    },
    {
      kind: "exercise",
      id: "b-07-e3",
      exerciseKind: "concept-check",
      prompt:
        "At depth 2 our engine captures a knight (material +3, Eval ≈ +0.8); the natural recapture, at ply 3, wins our queen (net exchange 3 − 9 = −6). The engine plays the capture anyway. What is the correct diagnosis and the standard mitigation?",
      options: [
        {
          text: "Horizon problem: the refutation sits below the cutoff; mitigate with quiescence search — extend through forcing moves (captures, checks) until the position is quiet, and only evaluate quiet positions",
          correct: true,
          feedback: "Correct. The engine is not 'stupid' — it is blind by construction, and it evaluated a loud position as if it were settled. Quiescence costs extra nodes but removes exactly the class of blunder where an obvious recapture reverses the assessment.",
        },
        {
          text: "The evaluation function is buggy — it should have known the knight capture is bad",
          correct: false,
          feedback: "No static function can see a specific recapture without searching it — that is what search is FOR. The bug is in what the cutoff evaluated, not in the feature arithmetic.",
        },
        {
          text: "Alpha-beta pruned the recapture branch by mistake",
          correct: false,
          feedback: "The branch was never generated — it lies beyond the depth cutoff, not inside the searched tree. Pruning removes provably irrelevant branches; the horizon problem is about unsearched ones.",
        },
        {
          text: "Increase the evaluation's mobility weight and the problem disappears",
          correct: false,
          feedback: "Retuning features cannot recover information the search never looked at. Only deeper or extended search (quiescence, extensions) can see a concrete recapture.",
        },
      ],
      solution:
        "The refutation lies one ply below the horizon. Quiescence search extends the cutoff through forcing moves until quiet, so the capture-and-recapture line is played out before Eval is called.",
      explanation:
        "Horizon blindness is structural to cutoffs, and quiescence is the structural answer: evaluate only positions where nothing dramatic is one move away. The name of the failure and the name of the fix belong together in your memory.",
      concepts: ["horizon problem", "quiescence search", "cutoff test"],
    },
  ],
  terms: [
    {
      term: "evaluation function",
      definition: "A static function pricing non-terminal positions from visible features, designed to approximate the minimax value a full search would return.",
    },
    {
      term: "cutoff test",
      definition: "The stopping rule for depth-limited search — normally a depth limit, ideally refined so that evaluation only happens in quiet positions.",
    },
    {
      term: "feature weights",
      definition: "The coefficients of a linear evaluation, expressing how many utility units one unit of each feature is worth; the tunable judgment of an engine.",
    },
    {
      term: "quiescence search",
      definition: "Extending a cutoff search through forcing moves (captures, checks) until positions are quiet, so evaluation is never applied mid-exchange.",
    },
  ],
  mistakes: [
    {
      mistake: "Evaluating on a different scale from the utility.",
      why: "Cutoff leaves and terminal leaves meet in the same max/min computation; mismatched scales rank opinions above facts or bury losses under opinions.",
      fix: "Choose one scale (say −1..+1), make the utility use it, and bound Eval to it — verify with a test position mixing real wins and evaluated leaves.",
    },
    {
      mistake: "Writing an evaluation function that is beautiful but slow.",
      why: "Eval is called at every cutoff leaf — millions to billions of times per move. Its cost multiplies the entire search's cost.",
      fix: "Budget Eval in the same units as node visits; prefer crude-and-fast, then measure whether added features earn their cost in playing strength.",
    },
    {
      mistake: "Quoting a cutoff value as if it were a proven result.",
      why: "A depth-d value is the evaluation's opinion ranked by d plies of look-ahead — b-03 measured a +1 that was truly +2, and the horizon example flips signs outright.",
      fix: "Attach the horizon to the number: 'value +0.7 at depth 6, quiet'. Only terminal-backed values deserve unqualified statements.",
    },
  ],
  takeaways: [
    "When terminals are out of reach, two decisions define the engine: the cutoff test (when to stop) and the evaluation function (what to report) — and the guarantee quietly transfers from fact to opinion.",
    "Linear evaluation — a weighted sum of material, mobility and other features — is the standard form: Eval(s) = w₁f₁(s) + … + wₖfₖ(s), hand-computable on any position.",
    "Four constraints make an Eval usable: the utility's scale, bounded, cheap, correlated with the true value — the first is the one student engines break most.",
    "The horizon problem is structural: refutations below the cutoff are invisible, and the fix is quiescence — never evaluate a position mid-exchange.",
    "The decision tree of this part: terminal → utility (fact); tree fits → minimax/α-β (fact); otherwise → α-β + cutoff + Eval (opinion, ranked by depth).",
  ],
  quiz: [
    {
      id: "b-07-q1",
      prompt:
        "Why is 'cheap' listed as a non-negotiable constraint on the evaluation function, rather than a nice-to-have?",
      options: [
        {
          text: "Eval is called at every cutoff leaf, so its cost multiplies the whole search — an Eval ten times slower buys you a search roughly ten times shallower on the same budget",
          correct: true,
          feedback: "Correct — depth is bought with leaf throughput. Engines routinely prefer a cruder Eval precisely because the extra plies it affords are worth more than the features it drops.",
        },
        {
          text: "Because expensive functions overflow the recursion limit",
          correct: false,
          feedback: "Cost has nothing to do with the recursion limit — it is pure arithmetic about how many leaves per second the engine can afford.",
        },
        {
          text: "Cheapness matters only for online play where the clock ticks",
          correct: false,
          feedback: "Every search budget is finite — analysis and offline play included. The trade is universal.",
        },
        {
          text: "It is not really non-negotiable — Deep Blue used a very slow evaluation",
          correct: false,
          feedback: "Deep Blue used a fast, hardware-parallel evaluation evaluated on hundreds of chips — precisely to buy leaves per second. The legend of the slow, wise Eval is a myth.",
        },
      ],
      explanation:
        "Search strength is leaf throughput times Eval quality — a product. The engineering question is always the marginal ply per feature, and cheapness is how you pay for it.",
    },
    {
      id: "b-07-q2",
      prompt:
        "The horizon problem is best defined as:",
      options: [
        {
          text: "Consequences lying below the search's depth cutoff are invisible, so a cutoff value can be confident and wrong at once — the refutation is one ply out of reach",
          correct: true,
          feedback: "Correct. The name is exact: the search's horizon hides what the opponent will actually do next, and no evaluation refinement can see a specific unsearched move.",
        },
        {
          text: "The evaluation function returns values that grow without bound",
          correct: false,
          feedback: "That is the boundedness constraint's violation — a scale bug, not the horizon problem, and one that better bookkeeping fixes outright.",
        },
        {
          text: "Minimax values computed at different depths disagree",
          correct: false,
          feedback: "Different-depth values disagreeing is often healthy — depth buys accuracy. The horizon problem is the specific, systematic blindness to imminent forcing replies.",
        },
        {
          text: "Alpha-beta cuts off the best move in some orderings",
          correct: false,
          feedback: "Cuts never remove the best move — that is b-05's theorem. The horizon problem is about unsearched depth, not pruned branches.",
        },
      ],
      explanation:
        "Horizon = the cutoff line, drawn blindly across both quiet and loud positions. Quiescence search redraws it through the noise.",
    },
    {
      id: "b-07-q3",
      prompt:
        "The linear form Eval(s) = w₁f₁(s) + … + wₖfₖ(s) smuggles in a structural assumption. Which?",
      options: [
        {
          text: "That a position's value decomposes additively — features contribute independently, one sub-score per feature, regardless of interactions between them",
          correct: true,
          feedback: "Correct — and chess famously violates it (a knight that is wonderful in a closed position is worth less in an open one; the SAME feature means different things in different contexts). Piece-square tables and learned, non-linear evaluators exist precisely to buy back some of what additivity throws away.",
        },
        {
          text: "That all features must be integers",
          correct: false,
          feedback: "Weights and features are routinely real numbers — our own example used 0.1 per mobility unit.",
        },
        {
          text: "That the evaluation must be computed recursively",
          correct: false,
          feedback: "Eval is static — one pass over the position's features. Recursion belongs to the search above it.",
        },
        {
          text: "That features must be binary (present or absent)",
          correct: false,
          feedback: "Material counts and mobility are continuous-valued features in the lesson's own example.",
        },
      ],
      explanation:
        "Additivity is the price of the linear form's speed and tunability. Knowing what you assumed is the first step to knowing when your engine will misjudge — and why feature interactions are where evaluation research concentrates.",
    },
  ],
};
