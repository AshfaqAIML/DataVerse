/**
 * PART E — ADDITIONAL TOPICS: The Rest of the Toolbox
 *
 * Four wide survey lessons that close the course: the circle-and-wave
 * geometry behind cyclical data, the coordinate plane behind every
 * distance-based model, the discrete mathematics of counting and
 * connecting, and the numerical methods that find answers when no
 * formula exists. Plus a 6-question assessment and a root-finder
 * workshop comparing a grid scan, bisection and Newton's method.
 *
 * Authoring rules (mirrored in scripts/verify-math-outputs.ts):
 *   - Every Python output is computed, never hand-written (COMPUTE + --fix).
 *   - Every lesson walks all ten pedagogical steps.
 *   - Prerequisites: pinned chains + the part spine, nothing invented.
 */
import type { MathPart } from "@/lib/mathcourse/types";
import { rightTriangle, coordFigure, venn, flowDiagram } from "@/lib/mathcourse/svgfig";

export const partE: MathPart = {
  letter: "E",
  title: "Additional Topics: The Rest of the Toolbox",
  tagline: "Trigonometry, coordinates, discrete thinking, and computing with numbers",
  description:
    "Four ideas live at the edges of most syllabi yet sit in the middle of real data work: circles and " +
    "waves, the address grid that turns tables into maps, the mathematics of counting and connecting, and " +
    "the algorithms computers fall back on when formulas run out. Each lesson is a friendly survey of one " +
    "whole field — broad enough to be useful on day one, deep enough to derive its headline results " +
    "honestly. You will encode time as a wave, measure the distance between data points, count " +
    "configurations without counting on your fingers, and teach Python to find roots that no formula can reach.",
  outcomes: [
    "Read sine and cosine straight off a circle, and encode cyclical data like hour-of-day as wave coordinates",
    "Compute distances, midpoints and slopes between points — the geometry k-NN and clustering run on",
    "Count outfits, handshakes and hyperparameter grids with multiplication and the divide-out-the-double-count move",
    "Implement bisection and Newton's method, and know exactly when each is the right tool",
    "Compare floating-point numbers with tolerances instead of trusting equality",
  ],
  lessons: [
    // =========================================================================
    // e-01 — BASIC TRIGONOMETRY
    // =========================================================================
    {
      slug: "e-01",
      title: "Basic Trigonometry: Shadows on a Circle",
      minutes: 40,
      summary:
        "Sine and cosine as the two shadows a point on a circle throws — the master picture behind every wave, every rotation, and every cyclical feature engineers build for machine learning.",
      objectives: [
        "Name the three side-ratios of a right triangle in plain words and compute them from side lengths",
        "Read sine and cosine as shadows on the unit circle, for any angle — not just sharp triangle corners",
        "Switch between degrees and radians, and say why one full turn measures 2π",
        "Use sin²θ + cos²θ = 1, derived honestly from Pythagoras, to find a missing ratio",
        "Encode a cyclical variable like hour-of-day as a (sin, cos) pair — real feature engineering",
      ],
      prerequisites: ["b-08"],

      analogy: {
        scene:
          "You are at a seaside fairground watching your friend ride the Ferris wheel, late in the afternoon. The sun is low, and every time the wheel turns, the seat's shadow slides across the boardwalk — long, then short, then long again. There is really a pair of shadows: one stretched along the boards under the wheel, and one thrown up the wall of the ticket booth beside it. When your friend's seat hangs at the very top, the booth shadow is enormous and the boardwalk shadow has vanished; when the seat swings level with the hub, they have traded places. Same wheel, same seat, same sun — two shadows endlessly swapping who gets to be big.",
        bridge:
          "Mathematicians built exactly this machine out of a wheel of radius one, and gave the two shadows names: cosine is the shadow along the ground, sine is the shadow on the wall. Every wave you have ever seen — sound, tides, music, seasons — is one of those shadows unrolling in time.",
      },

      intuition: [
        "Lean a ladder against a wall and everything about it is a partnership: the steeper you set it, the higher its top reaches — and the further its foot slides out from the wall. A roofer who knows the ladder's length and how steeply it leans can call out exactly how high the top will land, without ever climbing. That fixed partnership between 'how steep' and 'how high' is the entire heart of today's idea. The rest is just names.",
        "Now swap the ladder for the Ferris wheel. Watch one seat through a full ride: it climbs, peaks, sinks, bottoms out, and climbs again. At every moment the seat has two locations worth tracking — how far right or left it sits from the wheel's hub, and how high it sits above the hub's level. Those two 'shadows' trade all ride long: at the top, the height shadow is at its biggest while the sideways shadow has shrunk to nothing; a quarter turn later they have swapped. And because the seat hangs on an arm of fixed length, the two shadows can never both be big at once — there is one arm's worth of position shared between them, always. After a full turn, the whole show repeats, exactly.",
        "Why should a data person care about a fairground ride? Because clocks, calendars, tides, seasons, sound and daily website traffic are all wheels in disguise — anything that loops. The clock is the honest one: eleven at night and midnight are next-door neighbours, yet any spreadsheet that stores them as the numbers 23 and 0 is telling a lie about that. The wheel offers a truthful address for anything that repeats: put the loop on a wheel, and neighbours stay neighbours across the wrap-around.",
      ],

      terminology: [
        {
          term: "Unit circle",
          symbol: "r = 1",
          plain: "the master wheel: a circle of radius exactly one, centred at the zero point.",
          formal: "The set of all points at distance exactly 1 from the origin (0, 0).",
        },
        {
          term: "Sine",
          symbol: "sin θ",
          plain: "how high the seat sits above the hub's level — the vertical shadow.",
          formal: "For an angle θ measured from the positive horizontal axis, sin θ is the vertical coordinate of the point where the angle's ray meets the unit circle.",
        },
        {
          term: "Cosine",
          symbol: "cos θ",
          plain: "how far right of the hub the seat sits — the horizontal shadow.",
          formal: "For the same point on the unit circle, cos θ is its horizontal coordinate.",
        },
        {
          term: "Tangent",
          symbol: "tan θ",
          plain: "the steepness you would climb: vertical shadow divided by horizontal shadow.",
          formal: "tan θ = sin θ / cos θ; on a right triangle, the opposite side divided by the adjacent side.",
        },
        {
          term: "Radian",
          symbol: "rad",
          plain: "angle measured by distance walked along the rim of the unit circle.",
          formal: "One radian is the angle whose arc on the unit circle has length 1; a full turn is 2π radians because the unit circle's circumference is 2π.",
        },
        {
          term: "Period",
          symbol: "2π",
          plain: "how far you must turn before the two shadows repeat themselves.",
          formal: "The smallest positive T with f(θ + T) = f(θ); for both sine and cosine, T = 2π.",
        },
      ],

      visuals: [
        {
          kind: "lab",
          lab: "unit-circle",
          title: "Drag the angle — watch both shadows move",
        },
        {
          kind: "figure",
          spec: {
            svg: rightTriangle({
              a: "opposite (the sin shadow)",
              b: "adjacent (the cos shadow)",
              c: "hypotenuse = 1",
              angleLabel: "θ",
            }),
            caption:
              "The triangle hiding inside the wheel: the two shadows are the legs, the arm is the hypotenuse. The three ratios in plain words — sine = opposite / hypotenuse, cosine = adjacent / hypotenuse, tangent = opposite / adjacent.",
            alt: "A right triangle with an angle theta at the top, the vertical leg labelled opposite, the horizontal leg labelled adjacent, and the hypotenuse labelled hypotenuse equals one.",
          },
        },
        {
          kind: "graph",
          spec: {
            xMin: 0,
            xMax: 7,
            yMin: -1.35,
            yMax: 1.35,
            curves: [
              { expr: "sin(x)", label: "sin(x)" },
              { expr: "cos(x)", label: "cos(x)" },
            ],
            vLines: [{ x: 6.2832, label: "2π", dashed: true }],
            caption:
              "Unroll the wheel and the shadows become waves: sine and cosine as functions of the angle. They are the same wave a quarter turn apart, and after 2π everything repeats — periodicity in one picture.",
          },
        },
      ],

      derivation: {
        title: "Where sin²θ + cos²θ = 1 comes from: Pythagoras on the wheel",
        intro:
          "The most famous identity in trigonometry is not a rule to memorize — it is Pythagoras (lesson a-08) wearing a wheel costume. Four honest steps, no leaps.",
        steps: [
          {
            do: "Park the seat at angle θ on a unit circle: the arm from the centre to the seat has length exactly 1.",
            math: "arm length = 1",
            why: "That is what 'unit' circle means — the radius is one, by construction.",
          },
          {
            do: "Drop a vertical line from the seat down to the horizontal axis. This cuts a right triangle inside the circle, and the arm is its hypotenuse.",
            math: "hypotenuse = 1,   legs = cos θ and sin θ",
            why: "The horizontal leg is precisely the seat's horizontal shadow (cosine); the vertical leg is its vertical shadow (sine).",
          },
          {
            do: "Apply Pythagoras to that triangle: the squares of the legs sum to the square of the hypotenuse.",
            math: "(cos θ)² + (sin θ)² = 1²",
            why: "a² + b² = c² holds for every right triangle, and this one is right by construction — the axis and the dropped line meet squarely.",
          },
          {
            do: "Write it in the classic shorthand.",
            math: "sin²θ + cos²θ = 1",
          },
        ],
        result:
          "sin²θ + cos²θ = 1 for every angle θ. The two shadows may trade length all they like, but their squared budget always sums to exactly 1 — because the arm of the wheel never changes.",
      },

      examples: [
        {
          title: "Example 1 — The ladder against the wall",
          problem:
            "A 5 m ladder leans against a wall at 60° from the ground. How high up the wall does it reach?",
          steps: [
            { do: "The ladder is the hypotenuse; the wall height is the side opposite the 60° angle.", math: "height = 5 × sin(60°)" },
            { do: "From the 30-60-90 triangle (half of an equilateral one), sin(60°) = √3/2 ≈ 0.8660.", math: "height = 5 × 0.8660 = 4.33" },
            { do: "Sanity check: the height must stay below the ladder's own length.", math: "4.33 m < 5 m ✓" },
          ],
          answer: "The ladder reaches about 4.33 m up the wall.",
          check: {
            code: "from math import sin, radians\nprint(f\"ladder top height: {5 * sin(radians(60)):.2f} m\")",
            output: "COMPUTE",
            note: "Python's math module speaks radians — math.radians(60) does the degree conversion first.",
          },
        },
        {
          title: "Example 2 — The 3-4-5 ramp",
          problem:
            "A loading ramp rises 3 m over a 4 m run (so its sloped face is 5 m). For the angle θ at the ramp's base, find all three ratios and verify the identity.",
          steps: [
            { do: "Identify the sides relative to the base angle: opposite is the 3 m rise, adjacent is the 4 m run, hypotenuse is the 5 m slope.", math: "opp = 3,  adj = 4,  hyp = 5" },
            { do: "Divide according to the plain-word definitions.", math: "sin θ = 3/5 = 0.6,  cos θ = 4/5 = 0.8,  tan θ = 3/4 = 0.75" },
            { do: "Check the identity — it must hold for this triangle too.", math: "0.6² + 0.8² = 0.36 + 0.64 = 1" },
            { do: "If you need the angle itself, hand the ratio to the arc-tangent.", math: "θ = atan(0.75) ≈ 36.87°" },
          ],
          answer: "sin θ = 0.6, cos θ = 0.8, tan θ = 0.75; the identity gives exactly 1; the base angle is about 36.87°.",
          check: {
            code: "from math import atan, degrees\nopp, adj, hyp = 3, 4, 5\nprint(\"sin:\", opp / hyp, \" cos:\", adj / hyp, \" tan:\", opp / adj)\nprint(\"identity:\", (opp / hyp) ** 2 + (adj / hyp) ** 2)\nprint(\"angle:\", round(degrees(atan(opp / adj)), 2), \"degrees\")",
            output: "COMPUTE",
          },
        },
      ],

      programming: {
        intro:
          "Trigonometry in Python lives in the math module, and the module speaks radians only — the number one practical trap in the whole subject. Here we print the five famous angles and watch the identity hold at every one of them, then do genuine feature engineering: mapping every hour of the day onto a 24-hour wheel.",
        code: "from math import sin, cos, radians, pi\n\nprint(f\"{'deg':>4} {'sin':>7} {'cos':>7} {'sin^2+cos^2':>12}\")\nfor deg in (0, 30, 45, 60, 90):\n    s, c = sin(radians(deg)), cos(radians(deg))\n    print(f\"{deg:>4} {s:>7.4f} {c:>7.4f} {s*s + c*c:>12.4f}\")\n\nprint()\nprint(\"hour of day -> (sin, cos) on a 24-hour circle\")\nfor h in (0, 6, 12, 18, 23):\n    a = 2 * pi * h / 24\n    print(f\"h={h:>2}  ({sin(a):+.4f}, {cos(a):+.4f})\")",
        output: "COMPUTE",
        explanation: [
          "math.radians() converts degrees to radians; forgetting it is the classic bug — math.sin(30) is the sine of 30 radians, about −0.988, not 0.5.",
          "The sin² + cos² column reads 1.0000 at every single angle: Pythagoras never sleeps, even on the wheel.",
          "The hour encoding maps 24 hours onto one full turn (2π): midnight (h = 0) sits at (0, 1) and noon (h = 12) at (0, −1) — exact opposites, as they should be.",
          "Hour 23 lands at (−0.2588, 0.9659), practically next door to midnight on the wheel — which is the entire point of the encoding.",
        ],
      },

      mlConnection: {
        title: "Where machine learning feels the wheel",
        body: [
          "Raw time features lie. Feed a model 'hour of day' as the integers 0…23 and you are asking it to learn that 23:00 and 00:00 are 23 units apart — when in reality they are one minute apart, neighbours across midnight. The standard fix is exactly this lesson's encoding: replace the hour h with the pair (sin(2πh/24), cos(2πh/24)). Neighbouring hours become neighbouring points on a circle, midnight wraps around to meet late evening, and even a plain linear model can use the result. The same trick serves day-of-week, month-of-year and wind direction — anywhere a value lives on a loop.",
          "Waves are also the native language of anything periodic measured through time: audio samples, electricity demand, seasonal sales. Fourier analysis — decomposing a signal into sines and cosines of different frequencies — powers audio features, trend-seasonality decomposition in forecasting, and the 'Fourier features' that let models learn smooth cycles without binning. The transformer architecture behind modern language models goes further still: it hands every token position a positional encoding built from sines and cosines of many frequencies, so the model reads word order straight off a stack of wheels.",
          "And whenever a model must turn things rather than shift them, the two shadows do the turning: rotating an image by θ for data augmentation moves each pixel (x, y) to (x·cos θ − y·sin θ, x·sin θ + y·cos θ) — a rotation matrix is nothing but this lesson's two shadows armed with a multiplication rule.",
        ],
        usedBy: [
          "cyclical time features (hour-of-day, day-of-year)",
          "transformer positional encodings",
          "Fourier features for seasonality",
          "rotation-based image augmentation",
        ],
      },

      exercises: [
        {
          id: "e-01-e1",
          tier: "beginner",
          title: "The garden stake and its shadow",
          prompt:
            "A gardener plants a 1.8 m stake vertically in the lawn. One afternoon, the stake casts a shadow exactly 1.8 m long, measured along the grass. The sun's rays travel in straight lines, so the stake, the shadow on the grass and the ray from the sun's position to the stake's tip form a right triangle. At what angle above the horizon does the sun sit? Verify your answer in Python.",
          hint: "The stake is the side opposite the sun's angle; the shadow on the grass is the adjacent side. Tangent divides the two.",
          solution: {
            approach:
              "The stake is the side opposite the sun's angle and the grass shadow is the adjacent side, so the tangent of the angle is the ratio of the two heights. The angle itself is whatever the arc-tangent of that ratio returns.",
            steps: [
              { do: "Set up the ratio from the plain-word definitions.", math: "tan θ = opposite / adjacent = 1.8 / 1.8 = 1" },
              { do: "An angle whose tangent is 1 is the diagonal of a half-square.", math: "θ = atan(1) = 45°" },
              { do: "Reality check: a shadow as long as the stake itself is the classic late-afternoon picture of 45°.", math: "tan(45°) = 1 ✓" },
            ],
            answer: "The sun sits exactly 45° above the horizon.",
            check: {
              code: "from math import atan, degrees\nprint(\"sun elevation:\", degrees(atan(1.8 / 1.8)), \"degrees\")",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "e-01-e2",
          tier: "intermediate",
          title: "One ratio, the rest for free",
          prompt:
            "A trail-running app reports that the slope angle of a hill section satisfies sin θ = 0.6, with θ between 0° and 90°. Without finding θ first, compute cos θ and tan θ, verify the identity, and only then state θ in degrees. Check every number in Python.",
          hint: "The identity sin²θ + cos²θ = 1 pins cos θ down as soon as sin θ is known; the angle itself is optional.",
          solution: {
            approach:
              "Use the Pythagorean identity to solve for the missing cosine, then divide the two ratios for the tangent; convert to degrees with arc-sine only at the very end. This is the standard move whenever one ratio is known and the others are wanted.",
            steps: [
              { do: "Start from the identity.", math: "sin²θ + cos²θ = 1" },
              { do: "Substitute the known sine.", math: "0.6² + cos²θ = 1  →  cos²θ = 1 − 0.36 = 0.64" },
              { do: "θ lies between 0° and 90°, so the cosine is the positive root.", math: "cos θ = √0.64 = 0.8" },
              { do: "Tangent divides the two shadows.", math: "tan θ = 0.6 / 0.8 = 0.75" },
              { do: "If degrees are wanted, arc-sine converts.", math: "θ = asin(0.6) ≈ 36.87°" },
            ],
            answer: "cos θ = 0.8 and tan θ = 0.75, with θ ≈ 36.87° — the 3-4-5 triangle in disguise (0.6 = 3/5, 0.8 = 4/5).",
            check: {
              code: "from math import asin, cos, tan, degrees\ntheta = asin(0.6)\nprint(f\"cos = {cos(theta):.1f}   tan = {tan(theta):.2f}\")\nprint(f\"identity: 0.6^2 + {cos(theta):.1f}^2 = {0.36 + cos(theta) ** 2:.2f}\")\nprint(f\"theta = {degrees(theta):.2f} degrees\")",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "e-01-e3",
          tier: "advanced",
          title: "Midnight and 11 p.m. are neighbours",
          prompt:
            "A delivery dataset stores each pickup hour h as a raw integer 0…23, and a teammate complains that the model treats 23:00 and 00:00 as opposites. Encode each hour h as the pair (sin(2πh/24), cos(2πh/24)); compute the straight-line distance between the encodings of hours 23 and 0, and between hours 0 and 1; then compare both with what the raw integers claim. What do you report to the teammate?",
          hint: "For two points (x₁, y₁) and (x₂, y₂) the distance is √((x₂−x₁)² + (y₂−y₁)²). On the wheel, both gaps are one twenty-fourth of a turn wide.",
          solution: {
            approach:
              "Compute the wheel encodings of the three hours, then measure straight-line distances between them with the distance formula, and finally hold those distances against the raw integer gaps of 23 and 1. The two circular distances coming out equal is the entire argument for the encoding.",
            steps: [
              { do: "Encode hour 23 on the 24-hour wheel (one hour before midnight is 15° before the top).", math: "enc(23) = (sin(2π·23/24), cos(2π·23/24)) ≈ (−0.2588, 0.9659)" },
              { do: "Encode hours 0 and 1 (midnight, and 15° after it).", math: "enc(0) = (0, 1),   enc(1) ≈ (0.2588, 0.9659)" },
              { do: "Distance from hour 23 to hour 0:", math: "√((−0.2588 − 0)² + (0.9659 − 1)²) ≈ 0.2611" },
              { do: "Distance from hour 0 to hour 1:", math: "√((0.2588 − 0)² + (0.9659 − 1)²) ≈ 0.2611" },
              { do: "Both are exactly one twenty-fourth of a turn: 2·sin(π/24) ≈ 0.2611 — while the raw integers claim 23 versus 1.", math: "0.2611 = 2·sin(π/24) ✓" },
            ],
            answer:
              "Both neighbouring-on-the-clock pairs sit 0.2611 apart on the wheel — identical gaps — while the raw integers claim 23 versus 1. Report to the teammate: replace the raw hour column with the (sin, cos) pair.",
            check: {
              code: "from math import sin, cos, pi, sqrt\n\ndef enc(h):\n    a = 2 * pi * h / 24\n    return (sin(a), cos(a))\n\ndef dist(p, q):\n    return sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)\n\nprint(f\"enc(23) vs enc(0): {dist(enc(23), enc(0)):.4f}\")\nprint(f\"enc(0)  vs enc(1): {dist(enc(0), enc(1)):.4f}\")\nprint(\"raw hours: |23 - 0| =\", abs(23 - 0), \" vs |0 - 1| =\", abs(0 - 1))",
              output: "COMPUTE",
            },
          },
        },
      ],

      quiz: [
        {
          id: "e-01-q1",
          prompt: "A right triangle has hypotenuse 10, and the side opposite the angle θ has length 5. What is sin θ?",
          options: ["5", "0.5", "2", "10"],
          correctIndex: 1,
          explanation:
            "Sine is the opposite shadow divided by the hypotenuse: 5/10 = 0.5. Answering 5 keeps the raw side length; answering 2 divides the wrong way around.",
        },
        {
          id: "e-01-q2",
          prompt: "Why is one full turn exactly 2π radians?",
          options: [
            "Because there are 360 degrees and 360 ÷ 2 = 180",
            "Because π is the area of the unit circle",
            "A full turn walks once around the unit circle's rim, and that rim has length 2π",
            "It is an arbitrary convention with no reason behind it",
          ],
          correctIndex: 2,
          explanation:
            "A radian measures an angle by the arc it walks along the unit circle's rim; a full lap covers the entire circumference, which is 2π·r = 2π when r = 1. Degrees slice the same lap into 360 equal pieces instead.",
        },
        {
          id: "e-01-q3",
          prompt: "sin(θ + 2π) equals:",
          options: ["sin θ, for every θ", "−sin θ, always", "sin θ only when θ is small", "cos θ"],
          correctIndex: 0,
          explanation:
            "Sine is a position on the wheel: add one full turn and the seat is exactly where it started. That repeatability — periodicity — is why sines model seasons, tides, sound and daily traffic.",
        },
      ],

      misconceptions: [
        {
          myth: "Python's math.sin(30) gives the sine of 30 degrees.",
          why: "The number 30 sits next to the word 'degrees' in our heads, and school always worked in degrees.",
          reality:
            "Python speaks radians: math.sin(30) is the sine of 30 radians, about −0.988. Write math.radians(30) (or math.pi/6) first if you mean 30 degrees, and you will get 0.5.",
        },
        {
          myth: "Sine and cosine only make sense inside triangles, for angles under 90°.",
          why: "The triangle picture is how school introduces them, and a triangle's corners top out below 90° each.",
          reality:
            "The wheel picture defines them for every angle — past a full turn, and into negative turns too. That extension is exactly what makes waves, seasons and rotations possible.",
        },
        {
          myth: "sin²θ + cos²θ = 1 is a coincidence that some angles happen to enjoy.",
          why: "You check it at 30° and at 45°, it works both times, and it feels like lucky arithmetic.",
          reality:
            "It is Pythagoras applied to the triangle inside the unit circle — true for every angle without exception, because the wheel's arm is always exactly 1.",
        },
      ],

      takeaways: [
        "Sine and cosine are the two shadows a point on the unit circle throws on the axes — geometry first, wave second.",
        "sin²θ + cos²θ = 1 is Pythagoras in wheel costume: the two shadows trade length inside a fixed budget of one.",
        "Radians measure an angle by arc walked along the rim; one full lap is the whole circumference, 2π.",
        "Encode anything cyclical — hour, month, direction — as a (sin, cos) pair before a model sees it, and neighbours stay neighbours.",
      ],
    },
    // =========================================================================
    // e-02 — COORDINATE GEOMETRY
    // =========================================================================
    {
      slug: "e-02",
      title: "Coordinate Geometry: Where Algebra Meets Geography",
      minutes: 40,
      summary:
        "Every point gets an address and every pair of addresses gets a distance — the Pythagorean bridge that turns maps into algebra and data rows into geometry.",
      objectives: [
        "Locate any point as an (x, y) address and read off the gaps between two addresses",
        "Compute distance with the formula — derived from Pythagoras, never confused with adding gaps",
        "Find midpoints and slopes, and build the perpendicular slope −1/m from the slope you have",
        "Recognise the circle as 'all addresses at one fixed distance from a centre'",
        "Explain k-nearest-neighbours as plain coordinate geometry running on feature columns",
      ],
      prerequisites: ["e-01", "b-08"],

      analogy: {
        scene:
          "You are visiting a friend in a city you have never seen. 'Easy to find me,' she says on the phone, 'I'm four blocks east of the main fountain and two blocks north of it.' No street names, no landmarks — the whole city centre is a grid of blocks, and her home is a pair of counts. An hour later a second friend texts: 'We're at one block east and five blocks north of the fountain.' You spread the two addresses on a napkin and wonder how far apart those two apartments are. Your delivery app answers that exact question a hundred thousand times a minute.",
        bridge:
          "That grid of blocks is the coordinate plane, and the napkin question — how far between two addresses — is answered by one formula that is secretly Pythagoras. Algebra becomes geography the moment every point gets an address.",
      },

      intuition: [
        "An address is just two counts: how far east or west (west counts as negative), then how far north or south. Two addresses immediately give you two gaps — subtract the eastings, subtract the northings — and those gaps are the legs of a walk. A taxi drives that walk: three blocks east, then four blocks north, seven blocks of driving. The crow does something better: it flies the diagonal straight across, and the diagonal is shorter every single time.",
        "The crow's path is the diagonal of a box whose sides are the two gaps — and since east–west and north–south directions cross squarely, that diagonal is the hypotenuse of a right triangle. Pythagoras (lesson a-08, back for an encore) turns the two gaps into the straight-line distance. Nothing here cares what the blocks are: they can be kilometres between depots, centimetres on a screen, or the columns of a dataset. The moment you can write two numbers next to a thing, you can measure how far apart two things are.",
        "The rest of the lesson is small vocabulary for that one picture. The midpoint is the fair meeting place — average each direction. The slope is the rise per step east, the exact 'rate' idea from lesson b-05 now measured between any two addresses. Perpendicular lines cross squarely, and their steepnesses are negative flips of each other. And a circle is born from distance itself: fence every address that sits exactly 2 km from your depot and you have drawn a circle — the distance formula frozen at one fixed value. Ask 'which known address is nearest to this new one?' and you have invented the k-nearest-neighbours classifier.",
      ],

      terminology: [
        {
          term: "Coordinates",
          symbol: "(x, y)",
          plain: "an address: how far east, then how far north, from the zero corner.",
          formal: "An ordered pair naming the point x units along the horizontal axis and y units along the vertical axis.",
        },
        {
          term: "Distance formula",
          symbol: "d = √((x₂−x₁)² + (y₂−y₁)²)",
          plain: "the crow-flies gap between two addresses.",
          formal: "The straight-line (Euclidean) distance between (x₁, y₁) and (x₂, y₂): the hypotenuse of the right triangle whose legs are the coordinate gaps.",
        },
        {
          term: "Midpoint",
          symbol: "M = ((x₁+x₂)/2, (y₁+y₂)/2)",
          plain: "the address exactly halfway: average the eastings, average the northings.",
          formal: "The point whose coordinates are the means of the endpoints' matching coordinates.",
        },
        {
          term: "Slope",
          symbol: "m = (y₂−y₁)/(x₂−x₁)",
          plain: "rise per step east — the steepness dial from lesson b-05.",
          formal: "The ratio of vertical change to horizontal change between two points on a line; constant along a straight line.",
        },
        {
          term: "Perpendicular lines",
          symbol: "m⊥ = −1/m",
          plain: "lines that cross squarely; their slopes are negative flips of each other.",
          formal: "Two lines meeting at a right angle; if one has slope m ≠ 0, any perpendicular line has slope −1/m.",
        },
        {
          term: "Circle (centre-radius form)",
          symbol: "(x−a)² + (y−b)² = r²",
          plain: "a round fence: every address sitting exactly r from the centre (a, b).",
          formal: "The set of all points at distance exactly r from the centre (a, b) — the distance formula with d frozen at r.",
        },
      ],

      visuals: [
        {
          kind: "lab",
          lab: "linear-system",
          title: "Two lines on the address grid: meet, parallel, or identical",
        },
        {
          kind: "figure",
          spec: {
            svg: coordFigure({
              xMin: -1,
              xMax: 7,
              yMin: -1,
              yMax: 9,
              segments: [{ x1: 1, y1: 2, x2: 4, y2: 6, label: "crow flies: 5 km" }],
              points: [
                { x: 1, y: 2, label: "Restaurant (1, 2)" },
                { x: 4, y: 6, label: "Customer (4, 6)" },
              ],
            }),
            caption:
              "The delivery run: gaps of 3 east and 4 north make a 3-4-5 triangle, so the crow flies 5 km. The taxi path would be 3 + 4 = 7 blocks — longer, always.",
            alt: "A coordinate grid with two points marked at (1, 2) and (4, 6), joined by a straight segment labelled crow flies 5 km; dashed lines show the 3-block and 4-block gaps.",
          },
        },
        {
          kind: "graph",
          spec: {
            xMin: -2.6,
            xMax: 2.6,
            yMin: -2.6,
            yMax: 2.6,
            curves: [
              { expr: "sqrt(4 - x**2)", label: "y = √(4 − x²)" },
              { expr: "-sqrt(4 - x**2)", label: "y = −√(4 − x²)" },
            ],
            points: [
              { x: 2, y: 0, label: "(2, 0)" },
              { x: 0, y: 2, label: "(0, 2)" },
            ],
            caption:
              "A circle drawn as two curves: the top half is y = √(4 − x²), the bottom half y = −√(4 − x²). Every point sits exactly 2 from the origin — the distance formula frozen at d = 2 and solved for y.",
          },
        },
      ],

      derivation: {
        title: "Where the distance formula comes from: Pythagoras on the grid",
        intro:
          "This is not a new formula — it is an old one (a-08's a² + b² = c²) dressed in addresses. Every step, no leaps, and the circle falls out of the same derivation for free.",
        steps: [
          {
            do: "Write the two addresses and the two gaps between them.",
            math: "east gap = x₂ − x₁,   north gap = y₂ − y₁",
            why: "Subtracting matching coordinates gives the net change in each direction; the sign only records who sits further east or north.",
          },
          {
            do: "Notice the gaps are perpendicular directions: east–west and north–south cross squarely.",
            math: "east gap ⊥ north gap",
          },
          {
            do: "The straight segment joining the two points completes a right triangle: the gaps are the legs, the segment is the hypotenuse.",
            math: "legs a = |x₂ − x₁|,  b = |y₂ − y₁|,  hypotenuse c = d",
          },
          {
            do: "Invoke Pythagoras on that triangle.",
            math: "d² = (x₂ − x₁)² + (y₂ − y₁)²",
            why: "a² + b² = c² for every right triangle; squaring erases any sign, so the absolute-value bars can safely go.",
          },
          {
            do: "Distance is a length, so keep the positive root.",
            math: "d = √((x₂ − x₁)² + (y₂ − y₁)²)",
          },
        ],
        result:
          "The distance formula d = √((x₂−x₁)² + (y₂−y₁)²) is Pythagoras with addresses. Freeze d at a fixed radius r, move the centre to (a, b), and the same equation rearranges into the circle (x−a)² + (y−b)² = r².",
      },

      examples: [
        {
          title: "Example 1 — The delivery crow",
          problem:
            "A restaurant sits at address (1, 2) and its customer at (4, 6); one grid square is 1 km. How far does the crow fly? Where is the fair halfway handover point?",
          steps: [
            { do: "Compute the two gaps.", math: "east = 4 − 1 = 3,   north = 6 − 2 = 4" },
            { do: "Crow-flies distance via the formula.", math: "d = √(3² + 4²) = √25 = 5 km" },
            { do: "Midpoint: average the eastings, average the northings.", math: "M = ((1+4)/2, (2+6)/2) = (2.5, 4)" },
            { do: "Compare with the taxi path the rider actually drives: 3 + 4 = 7 blocks.", math: "7 − 5 = 2 km saved by the diagonal" },
          ],
          answer: "The crow flies 5 km (the rider drives 7); a fair halfway handover sits at the address (2.5, 4).",
          check: {
            code: "from math import sqrt\nr, c = (1, 2), (4, 6)\nprint(\"distance:\", sqrt((c[0] - r[0]) ** 2 + (c[1] - r[1]) ** 2), \"km\")\nprint(\"midpoint:\", ((r[0] + c[0]) / 2, (r[1] + c[1]) / 2))",
            output: "COMPUTE",
          },
        },
        {
          title: "Example 2 — Two cell towers",
          problem:
            "Tower A stands at (−1, 3) and tower B at (5, −5). How far apart are they? What is the slope of the line joining them, and the slope of any line crossing that line squarely?",
          steps: [
            { do: "Gaps: east 5 − (−1) = 6, north −5 − 3 = −8 (B sits south of A).", math: "east = 6,   north = −8" },
            { do: "Distance — a 6-8-10 triangle in the wild.", math: "d = √(6² + (−8)²) = √(36 + 64) = √100 = 10 km" },
            { do: "Slope of the joining line (b-05's rate, now between two points).", math: "m = (−5 − 3) / (5 − (−1)) = −8/6 = −4/3" },
            { do: "Perpendicular slope: the negative flip.", math: "m⊥ = −1 / (−4/3) = 3/4" },
            { do: "Signature check: perpendicular slopes always multiply to −1.", math: "(−4/3) × (3/4) = −1 ✓" },
          ],
          answer: "The towers are 10 km apart; the line joining them slopes −4/3, and any line crossing it squarely slopes 3/4.",
          check: {
            code: "from math import sqrt\np, q = (-1, 3), (5, -5)\nd = sqrt((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2)\nm = (q[1] - p[1]) / (q[0] - p[0])\nprint(f\"distance: {d:.0f}   slope: {m:.4f}\")\nprint(f\"perpendicular slope: {-1 / m:.4f}\")",
            output: "COMPUTE",
          },
        },
      ],

      programming: {
        intro:
          "The distance formula is the workhorse of every location-aware dataset: depots and drop-offs, sensors and gateways, or plain rows of numbers. Here we build the full distance matrix between four sites — every pairwise crow-flies distance — and then answer the question a k-NN model asks constantly: which known site is nearest?",
        code: "from math import sqrt\n\ncities = {\n    \"Depot\":     (0, 0),\n    \"Riverside\": (3, 4),\n    \"Hilltop\":   (-1, 2),\n    \"Lakeside\":  (6, -3),\n}\n\ndef dist(p, q):\n    return sqrt((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2)\n\nnames = list(cities)\nprint(f\"{'':>10}\" + \"\".join(f\"{n:>11}\" for n in names))\nfor a in names:\n    row = \"\".join(f\"{dist(cities[a], cities[b]):>11.2f}\" for b in names)\n    print(f\"{a:>10}{row}\")\n\nhome = \"Depot\"\nothers = [n for n in names if n != home]\nbest = min(others, key=lambda n: dist(cities[home], cities[n]))\nprint(f\"nearest to {home}: {best} at {dist(cities[home], cities[best]):.2f} km\")",
        output: "COMPUTE",
        explanation: [
          "dist() is the derivation verbatim — gap, gap, square, add, root: four lines of Python for twenty-three centuries of geometry.",
          "The matrix is symmetric (d(A, B) = d(B, A)) with zeros on the diagonal — the reason pair-counting code in the next lesson only ever counts half of it.",
          "min(..., key=...) picks the smallest distance with no if-statement in sight: Python's exact spelling of 'nearest neighbour'.",
          "Hilltop wins at 2.24 km even though Riverside's coordinates look friendlier — eyeballing addresses lies; the formula does not.",
        ],
      },

      mlConnection: {
        title: "The geometry every distance-based model lives on",
        body: [
          "k-nearest-neighbours is this lesson, industrialised. Turn each row of a dataset into an address — one axis per feature — and classify a new row by asking which known rows sit nearest, then letting the k closest vote on the label. Recommendation engines do the same with users and items as points; the trained 'model' is mostly a distance-matrix lookup. Every prediction is the delivery app from our example, run at industrial scale.",
          "Clustering leans on the same ruler. k-means repeatedly assigns every point to its nearest centroid, then slides each centroid to the middle of its cluster — and 'middle' is this lesson's midpoint formula running in many dimensions at once. DBSCAN grows clusters from points that have enough neighbours within a radius; that radius draws a circle exactly like the one in our graph, only in feature space.",
          "One honest warning that belongs to geometry itself: distance bullies. A feature measured in big units (salary, in euros) dwarfs one in small units (age, in years), so 'nearest' is decided almost entirely by the wide-range column. That is why practitioners standardize features before trusting any distance-based model — the numbers must measure comparable walks before the crow can fly fairly.",
        ],
        usedBy: ["k-nearest neighbours (k-NN)", "k-means clustering", "DBSCAN", "distance-based anomaly detection"],
      },

      exercises: [
        {
          id: "e-02-e1",
          tier: "beginner",
          title: "The two sensors",
          prompt:
            "A weather network has sensors at addresses (2, −1) and (5, 3), with one grid unit equal to 1 km. Compute (a) the crow-flies distance between the sensors and (b) the address exactly halfway between them. Verify both answers in Python.",
          hint: "Gaps first (3 east, 4 north), then the distance formula; the halfway address averages each coordinate pair.",
          solution: {
            approach:
              "Find the east and north gaps, plug them into the distance formula for part (a), and average the matching coordinates for the midpoint in part (b). Finish with a symmetry check: the midpoint must sit equally far from both ends.",
            steps: [
              { do: "Gaps.", math: "east = 5 − 2 = 3,   north = 3 − (−1) = 4" },
              { do: "Distance.", math: "d = √(3² + 4²) = √25 = 5 km" },
              { do: "Midpoint: average eastings, average northings.", math: "M = ((2+5)/2, (−1+3)/2) = (3.5, 1)" },
              { do: "Symmetry check: M must be equidistant from both sensors.", math: "|M − A| = √(1.5² + 2²) = 2.5 = |M − B| ✓" },
            ],
            answer: "The sensors are 5 km apart, and the halfway address is (3.5, 1) — verified to sit 2.5 km from each end.",
            check: {
              code: "from math import sqrt\np, q = (2, -1), (5, 3)\nprint(\"distance:\", sqrt((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2))\nprint(\"midpoint:\", ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "e-02-e2",
          tier: "intermediate",
          title: "One segment, four questions",
          prompt:
            "A hiking app records a straight trail segment from checkpoint P(1, 1) to checkpoint Q(7, 9), with grid units in kilometres. Compute (a) the segment's length, (b) its midpoint, (c) its slope, and (d) the slope of any trail crossing it at right angles. Verify (a), (c) and (d) in Python.",
          hint: "Length is the distance formula; slope is north gap over east gap; the perpendicular slope is the negative flip of the slope.",
          solution: {
            approach:
              "Answer the four sub-questions in order with the lesson's four headline tools: the distance formula, the midpoint average, the slope ratio, and the −1/m flip. The two slopes must multiply to −1 at the end — that is the signature of a square crossing.",
            steps: [
              { do: "Gaps.", math: "east = 7 − 1 = 6,   north = 9 − 1 = 8" },
              { do: "(a) Length — a 6-8-10 triangle.", math: "d = √(36 + 64) = √100 = 10 km" },
              { do: "(b) Midpoint.", math: "M = ((1+7)/2, (1+9)/2) = (4, 5)" },
              { do: "(c) Slope.", math: "m = 8/6 = 4/3 ≈ 1.3333" },
              { do: "(d) Perpendicular slope — the negative flip.", math: "m⊥ = −3/4 = −0.75" },
            ],
            answer: "Length 10 km, midpoint (4, 5), slope 4/3, perpendicular slope −3/4 — and (4/3) × (−3/4) = −1 confirms the square crossing.",
            check: {
              code: "from math import sqrt\np, q = (1, 1), (7, 9)\nd = sqrt((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2)\nm = (q[1] - p[1]) / (q[0] - p[0])\nprint(f\"length: {d:.0f}  slope: {m:.4f}  perp: {-1 / m:.4f}\")",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "e-02-e3",
          tier: "advanced",
          title: "k-NN by hand (and why k matters)",
          prompt:
            "Three labelled training points sit in a two-feature plane: A(1, 2) with label 'low', B(5, 6) with label 'high', and C(6, 1) with label 'low'. A new point arrives at (4, 5). Rank the three training points by their distance to the new point, then classify it with k = 1 and with k = 3. Do the two votes agree? What does that tell you about choosing k? Verify in Python.",
          hint: "Compute all three distances first; k = 1 copies the single nearest label, while k = 3 takes a majority vote over all three points.",
          solution: {
            approach:
              "Compute the distance from the new point to each training point, sort the three, then read off the k = 1 answer (copy the closest label) and the k = 3 answer (majority vote over all three). The disagreement between the two votes is the real lesson of the exercise.",
            steps: [
              { do: "Distance to A(1, 2).", math: "√((4−1)² + (5−2)²) = √(9 + 9) = √18 ≈ 4.24" },
              { do: "Distance to B(5, 6).", math: "√((4−5)² + (5−6)²) = √(1 + 1) = √2 ≈ 1.41" },
              { do: "Distance to C(6, 1).", math: "√((4−6)² + (5−1)²) = √(4 + 16) = √20 ≈ 4.47" },
              { do: "Ranking.", math: "B (1.41) < A (4.24) < C (4.47)" },
              { do: "k = 1 copies the nearest neighbour's label.", math: "k = 1 → 'high' (B)" },
              { do: "k = 3 holds a vote: two 'low' (A and C) against one 'high' (B).", math: "k = 3 → 'low' (2 votes to 1)" },
            ],
            answer:
              "The votes disagree: k = 1 says 'high' because B is by far the nearest, while k = 3 says 'low' because the 'low' points hold the majority. Small k listens to local detail; large k listens to the crowd — choosing k is a genuine modelling decision, not a detail.",
            check: {
              code: "from math import sqrt\n\ntrain = [(\"A\", (1, 2), \"low\"), (\"B\", (5, 6), \"high\"), (\"C\", (6, 1), \"low\")]\nq = (4, 5)\n\ndef distq(p):\n    return sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)\n\nranked = sorted(train, key=lambda t: distq(t[1]))\nfor name, pos, label in ranked:\n    print(f\"{name} {label:>5}  distance {distq(pos):.4f}\")\nlabels3 = [t[2] for t in ranked[:3]]\nk1 = ranked[0][2]\nk3 = \"low\" if labels3.count(\"low\") > 1 else \"high\"\nprint(\"k=1 says:\", k1, \" k=3 says:\", k3)",
              output: "COMPUTE",
            },
          },
        },
      ],

      quiz: [
        {
          id: "e-02-q1",
          prompt: "The distance between the points (2, 3) and (7, 15) is:",
          options: ["17", "13", "169", "√17"],
          correctIndex: 1,
          explanation:
            "The gaps are 5 east and 12 north, so d = √(25 + 144) = √169 = 13. The answer 17 adds the gaps (the staircase path); 169 forgets the square root.",
        },
        {
          id: "e-02-q2",
          prompt: "The midpoint of (2, 8) and (10, 4) is:",
          options: ["(6, 6)", "(4, 2)", "(12, 12)", "(5, 6)"],
          correctIndex: 0,
          explanation:
            "Average each direction: eastings (2 + 10)/2 = 6 and northings (8 + 4)/2 = 6, giving (6, 6). Adding instead of averaging produces (12, 12) — the classic slip.",
        },
        {
          id: "e-02-q3",
          prompt: "A line has slope 3/4. Any line perpendicular to it has slope:",
          options: ["4/3", "−3/4", "−4/3", "3/4"],
          correctIndex: 2,
          explanation:
            "Perpendicular slopes are negative flips: m⊥ = −1/m = −4/3. Keeping the magnitude (−3/4) gives a mirror line, not a square crossing; perpendicular slopes always multiply to −1.",
        },
      ],

      misconceptions: [
        {
          myth: "The distance between two addresses is just the two gaps added: 3 east + 4 north = 7.",
          why: "That is exactly what the taxi drives, and every route we physically walk feels like a staircase.",
          reality:
            "The crow flies the hypotenuse: √(3² + 4²) = 5, which is always shorter than 3 + 4. Adding gaps measures a staircase, not a straight line.",
        },
        {
          myth: "The distance formula is one more thing to memorize.",
          why: "It arrives in school as a finished formula, three chapters away from the triangle it came from.",
          reality:
            "It IS the triangle chapter — Pythagoras with (x₂ − x₁) and (y₂ − y₁) as the legs. Derive it once and you can never forget which pieces get squared, because you watched them become legs.",
        },
        {
          myth: "Perpendicular means one line horizontal and the other vertical.",
          why: "The first perpendicular pair anyone draws is the axes themselves — horizontal meets vertical.",
          reality:
            "Any slope m has a perpendicular partner −1/m: slope 2 meets slope −1/2 squarely anywhere in the plane. Horizontal (slope 0) and vertical (no slope at all) are just one special case of the flip.",
        },
        {
          myth: "k-NN works fine on raw numbers, whatever their units.",
          why: "The formula accepts any two columns of numbers, so it feels unit-proof.",
          reality:
            "Distance is dominated by wide-range features: salary in euros crushes age in years, and 'nearest' secretly means 'closest in salary alone'. Standardize the columns first, or the geometry lies.",
        },
      ],

      takeaways: [
        "An address pair plus Pythagoras is the entire distance formula: gaps, squares, sum, root.",
        "Midpoints average each direction; slope divides north gap by east gap — b-05's rate, now between any two points.",
        "Perpendicular slopes are negative flips, and their product is always −1.",
        "A circle is the distance formula frozen at one radius — (x−a)² + (y−b)² = r² is a fence at fixed distance from the centre.",
        "k-NN, k-means and anomaly scores are this lesson's formula running over data columns.",
      ],
    },
    // __MORE__
  ],

  // =========================================================================
  // PART E ASSESSMENT
  // =========================================================================
  assessment: {
    questions: [
      {
        id: "e-as-1",
        prompt: "What is sin(45°)?",
        options: ["√2/2", "1/2", "√3/2", "1"],
        correctIndex: 0,
        explanation:
          "The 45° triangle is half a square, so both legs are equal and sine agrees with cosine. With legs 1 and 1 the hypotenuse is √2, giving sin 45° = 1/√2 = √2/2 ≈ 0.7071.",
      },
      {
        id: "e-as-2",
        prompt: "A radian is best described as:",
        options: [
          "exactly 1/360 of a full turn",
          "the angle whose arc on the unit circle has length 1",
          "a unit for the areas of sectors",
          "one degree divided into 60 equal parts",
        ],
        correctIndex: 1,
        explanation:
          "Radians measure an angle by how much rim it walks on the unit circle: one radian wraps an arc exactly as long as the radius. A full lap is the whole circumference, 2π radians — which is why the sine and cosine waves repeat every 2π.",
      },
      {
        id: "e-as-3",
        prompt: "The distance between the points (−1, 1) and (5, 9) is:",
        options: ["14", "100", "10", "√48"],
        correctIndex: 2,
        explanation:
          "The gaps are 6 east and 8 north, so d = √(6² + 8²) = √(36 + 64) = √100 = 10. Answering 14 added the gaps (the staircase, not the straight line); 100 stopped before the square root.",
      },
      {
        id: "e-as-4",
        prompt: "You must choose 2 of 10 features to build an interaction term; the order of the pair does not matter. How many distinct pairs are there?",
        options: ["90", "45", "100", "20"],
        correctIndex: 1,
        explanation:
          "Unordered pairs: C(10, 2) = 10 × 9 / 2 = 45. The answer 90 counts ordered pairs, announcing every pair twice (A-then-B and B-then-A) — exactly the double count the handshake division removes.",
      },
      {
        id: "e-as-5",
        prompt: "The bisection method is guaranteed to converge to a root when:",
        options: [
          "f is differentiable and f′ never vanishes",
          "f(a) = 0 at one end of the bracket already",
          "f is continuous on [a, b] and f(a)·f(b) < 0",
          "the bracket [a, b] has length at most 1",
        ],
        correctIndex: 2,
        explanation:
          "A continuous function that is negative at one end of an interval and positive at the other must cross zero somewhere inside; every halving keeps one crossing trapped, so the bracket shrinks to a root. Derivatives are Newton's demand, not bisection's.",
      },
      {
        id: "e-as-6",
        prompt: "In Python, 0.1 + 0.2 == 0.3 evaluates to False. The honest reason is:",
        options: [
          "Python performs decimal arithmetic rounded to 2 places",
          "0.1 and 0.2 have no exact binary form, so each is stored as a nearby float and the sum carries rounding dust",
          "0.3 is stored exactly, but addition always rounds up",
          "the two sides of the comparison run on different hardware",
        ],
        correctIndex: 1,
        explanation:
          "Binary place values are halves, quarters, eighths — and 1/10 is not on that grid, so 0.1 and 0.2 are each stored as their nearest representable neighbours. Their sum lands on 0.30000000000000004, so equality fails; the professional comparison is abs(0.1 + 0.2 − 0.3) < 1e-9.",
      },
    ],
  },

  // =========================================================================
  // PART E WORKSHOP
  // =========================================================================
  workshop: {
    title: "Workshop E — Three Ways to Find a Root",
    brief:
      "The equation x³ − x − 2 = 0 has exactly one real root, 1.5213797…, and no school formula will hand it over. You will hunt it three " +
      "ways — a blind grid scan, the guaranteed halving of bisection, and Newton's tangent slides — then line up their iteration counts " +
      "and see the trade the whole field of numerical optimization runs on: certainty versus speed. Everything is deterministic, " +
      "stdlib-only, and your output is checked line for line against the machine-computed truth.",
    requirements: [
      "Define f(x) = x³ − x − 2 and its derivative df(x) = 3x² − 1, and confirm the root is bracketed: f(1) = −2 and f(2) = 4",
      "Implement grid_scan(step=0.001): walk from 1 towards 2, report the midpoint of the first 0.001-wide cell where f changes sign, and count the evaluations",
      "Implement bisection(): halve [1, 2] while the bracket is wider than 1e-6, always keeping the sign-change half; return the halving count and the final bracket midpoint",
      "Implement newton(x0=2.0): apply x ← x − f(x)/df(x) until the step size |x_new − x| is below 1e-6; return the step count and the final x",
      "Print one aligned comparison table — method, iteration count, root to 6 decimals — plus a one-line verdict naming the winner and both losers' counts",
    ],
    steps: [
      "Write f and df, then print f(1) and f(2) to confirm the signs differ — no bracket, no bisection",
      "Write grid_scan first: it is the dumb-but-honest baseline every clever method must beat (the sign flip happens between 1.521 and 1.522)",
      "Write bisection with its while hi − lo > TOL loop: test the midpoint's sign against the sign at lo to choose the surviving half",
      "Write newton as a loop that computes x_next, checks |x_next − x| < TOL, and only then commits the step — count the iterations carefully",
      "Assemble the three results into the aligned table, print the verdict line, and compare against the expected output with the Check button",
    ],
    starter:
      "def f(x):\n    return x**3 - x - 2\n\ndef df(x):\n    return 3*x**2 - 1\n\nTOL = 1e-6\n\ndef grid_scan(step=0.001):\n    # TODO: start at x=1 and step towards 2; when the sign of f flips\n    # between x_prev and x_next, return (evaluations, midpoint of that cell)\n    ...\n\ndef bisection():\n    # TODO: lo=1.0, hi=2.0; while hi - lo > TOL: take the midpoint and keep\n    # the half whose ends still have opposite signs; return (halvings, midpoint)\n    ...\n\ndef newton(x0=2.0):\n    # TODO: repeat x_next = x - f(x)/df(x); stop when |x_next - x| < TOL;\n    # return (steps, x_next)\n    ...\n\nprint(f\"f(1) = {f(1)}, f(2) = {f(2)}  -> the root is bracketed\")\n# TODO: run all three and print one aligned table:\n# method | iters | root to 6 decimals, then a verdict line naming the winner\n",
    solution:
      "def f(x):\n    return x**3 - x - 2\n\ndef df(x):\n    return 3*x**2 - 1\n\nTOL = 1e-6\n\ndef grid_scan(step=0.001):\n    x_prev, f_prev, iters = 1.0, f(1.0), 0\n    while x_prev < 2.0:\n        x_next = x_prev + step\n        iters += 1\n        if f_prev * f(x_next) <= 0:\n            return iters, (x_prev + x_next) / 2\n        x_prev, f_prev = x_next, f(x_next)\n    return iters, None\n\ndef bisection():\n    lo, hi, iters = 1.0, 2.0, 0\n    while hi - lo > TOL:\n        mid = (lo + hi) / 2\n        if f(lo) * f(mid) <= 0:\n            hi = mid\n        else:\n            lo = mid\n        iters += 1\n    return iters, (lo + hi) / 2\n\ndef newton(x0=2.0):\n    x, iters = x0, 0\n    while True:\n        x_next = x - f(x) / df(x)\n        iters += 1\n        if abs(x_next - x) < TOL:\n            return iters, x_next\n        x = x_next\n\nprint(f\"f(1) = {f(1)}, f(2) = {f(2)}  -> the root is bracketed\")\nresults = [(\"grid scan\", *grid_scan()), (\"bisection\", *bisection()), (\"newton\", *newton())]\nprint(\"Three ways to find the root of f(x) = x^3 - x - 2 on [1, 2]\")\nprint(f\"{'method':<12}{'iters':>7}{'root':>12}\")\nfor name, iters, root in results:\n    print(f\"{name:<12}{iters:>7}{root:>12.6f}\")\nscan, bis, new = (r[1] for r in results)\nprint(f\"newton wins: {new} steps vs {bis} for bisection and {scan} for the scan\")\n",
    expectedOutput: "COMPUTE",
    concepts: ["root finding", "bisection", "Newton's method", "tolerance", "iteration counting"],
  },
};
