/**
 * PART D — CALCULUS: The Mathematics of Change
 *
 * Eleven lessons, from story lines and rates through limits, derivatives,
 * partials and gradients, integrals and optimization, to the descent that
 * trains every model. The part where "how fast?" and "how much in total?"
 * become one honest toolbox.
 *
 * Authoring rules (mirrored in scripts/verify-math-outputs.ts):
 *   - Every Python output is computed, never hand-written (COMPUTE + --fix).
 *   - Every lesson walks all ten pedagogical steps.
 *   - Prerequisites: pinned chains + the part spine, nothing invented.
 */
import type { MathPart } from "@/lib/mathcourse/types";

export const partD: MathPart = {
  letter: "D",
  title: "Calculus: The Mathematics of Change",
  tagline: "Rates, areas, and the descent that trains every model",
  description:
    "Calculus is just two honest questions asked with one set of tools: how fast is something changing right now, " +
    "and how much has piled up in total? This part starts with story lines you already know how to read, builds the " +
    "slope machine one honest limit at a time, widens it to functions of several dials, and ends where machine " +
    "learning lives: walking downhill on a loss surface by following the gradient, one learning-rate-sized step at a time.",
  outcomes: [
    "Read any curve as a story and compute honest rates of change between snapshots — and at a single instant",
    "Repair 0/0 traps with limits, and recognize the three ways a story breaks (hole, jump, blow-up)",
    "Differentiate with the power, sum, constant-multiple and chain rules — and know why each one is true",
    "Read gradients as uphill arrows, and integrals as totals accumulated from rates",
    "Explain, implement and tune gradient descent — the loop that actually trains models",
  ],
  lessons: [
    // =========================================================================
    // d-01 — FUNCTIONS AND CHANGE
    // =========================================================================
    {
      slug: "d-01",
      title: "Functions and Change: Story Lines and Rates",
      minutes: 35,
      summary:
        "Functions as story lines — temperature over a day, vans leaving a depot — and the average rate of change: the honest slope between two snapshots, and the interesting details it hides.",
      objectives: [
        "Read any function as a story: one direction for the input knob (usually time), the other for what happens",
        "Compute the average rate of change between two snapshots: change in output ÷ change in input",
        "Interpret the sign and size of a rate in real units — degrees per hour, kilometres per hour",
        "Explain why an average over a long interval can hide everything interesting that happened inside it",
      ],
      prerequisites: ["b-09"],

      analogy: {
        scene:
          "You are watching a courier's van crawl across a delivery app's map while you wait for your parcel. The little dot tells you where the van is each second; the arrival estimate at the top keeps rewriting itself. Your flatmate glances over and asks how far along the delivery is — and you realise the honest answer is a story, not a number: the van sat in a jam for ten minutes, then flew down the ring road, then waited five more outside a depot. One dot on a map, told properly, is a whole afternoon of drama.",
        bridge:
          "A function is that dot's story written down — one direction for the input (the time of day) and one for the output (where the van is, how warm the day is, how busy the server is). This lesson learns to read the story line, and to ask the first honest question about it: how fast is it changing?",
      },

      intuition: [
        "Think of a day's temperature as a story told in order: cool at dawn, climbing through the morning, peaking after lunch, easing off into the evening. Draw the story as a line — morning on the left, evening on the right, warmer higher up — and you can read the whole day at a glance without a single number. A line that rises slowly tells of gentle warming; a line that climbs steeply tells of a morning that heated up fast; a flat stretch tells of a pause; a falling stretch tells of the cool-down. The shape of the line is the story.",
        "How fast is the story moving? The honest first answer compares two moments. Take the reading at breakfast and the reading at lunch: the difference between them, spread over the hours that passed, gives a per-hour number. This particular morning warmed by about one and a third degrees an hour — a number you could also read as the steepness of the straight line you would draw between the two snapshots on the story line. Steeper line, faster story. That comparison — how much the reading changed, divided by how much time passed — is the single move this whole lesson practises.",
        "But an average over a long stretch can lie by omission. A driver who covers 240 kilometres in three hours has an average of eighty per hour — and that single number is fully consistent with a trip that included a dead stop in roadworks and a stretch of 130 on an empty motorway. The average is not wrong; it is a summary, and summaries throw away the middle. If you want the story of the jam or the ticket, you have to look at shorter and shorter stretches — which is exactly where this part of the course is heading.",
      ],

      terminology: [
        {
          term: "Function",
          symbol: "f(x)",
          plain: "A machine that takes an input and gives exactly one output — here, a story line.",
          formal: "A rule assigning to each input x exactly one output f(x).",
        },
        {
          term: "Input and output",
          plain: "The knob you turn (time of day) and the reading you get (temperature).",
          formal: "The independent variable x and the dependent variable f(x).",
        },
        {
          term: "Graph",
          plain: "The story line drawn as a picture: inputs along the horizontal, outputs up the vertical.",
          formal: "The set of points (x, f(x)) drawn in the plane.",
        },
        {
          term: "Average rate of change",
          symbol: "Δf ÷ Δx",
          plain: "How fast the output changed per unit of input, measured between two snapshots.",
          formal: "Over the interval [a, b]: (f(b) − f(a)) ÷ (b − a).",
        },
        {
          term: "Slope",
          plain: "Steepness of a straight line: rise ÷ run.",
          formal: "Between two points, the rise Δy divided by the run Δx.",
        },
      ],

      visuals: [
        {
          kind: "graph",
          spec: {
            xMin: 0,
            xMax: 4,
            yMin: 0,
            yMax: 200,
            curves: [
              { expr: "50*x", label: "Van A: steady 50 km/h", color: "#7c3aed" },
              { expr: "10*x**2", label: "Van B: gentle start, heavy foot later", color: "#0ea5e9" },
            ],
            points: [
              { x: 4, y: 200, label: "A after 4 h: 200 km" },
              { x: 4, y: 160, label: "B after 4 h: 160 km" },
            ],
            caption:
              "Two vans leave the depot together. Van A's story line is straight — same distance every hour. Van B's line bends: slow at first, faster later. The steepness at each stretch is the story.",
          },
        },
        {
          kind: "lab",
          lab: "sequence-terms",
          title: "A story sampled at regular beats: daily totals as a sequence",
        },
      ],

      derivation: {
        title: "The average rate of change, built from two snapshots",
        intro:
          "Everything in this part of the course grows out of one honest question — how fast? — asked first about two snapshots, and later about a single instant. Here is the two-snapshot version, built slowly and finished with real numbers.",
        steps: [
          {
            do: "Pick the two moments: the reading at input a, and the reading at a later input b.",
            math: "snapshots:  f(a) at input a,   f(b) at input b",
            why: "A snapshot is the story's value at one moment — nothing more mysterious than that.",
          },
          {
            do: "Measure how much the story changed between them — the rise.",
            math: "rise  =  f(b) − f(a)",
            why: "Later reading minus earlier reading: positive means the story went up.",
          },
          {
            do: "Measure how much input passed in between — the run.",
            math: "run  =  b − a",
          },
          {
            do: "Steepness is rise per unit of run — divide one by the other.",
            math: "average rate over [a, b]  =  (f(b) − f(a)) ÷ (b − a)",
            why: "Per-unit matters: 8 degrees over 6 hours is nothing like 8 degrees over 20 minutes.",
          },
          {
            do: "Walk it with a real morning: 8°C at 6 a.m., 16°C at noon.",
            math: "(16 − 8) ÷ (12 − 6)  =  8 ÷ 6  ≈  1.33 °C per hour",
          },
          {
            do: "Sanity-check the units: degrees per hour — a speed, but for warming.",
            math: "8°C ÷ 6 h  ≈  1.33 °C/h",
            why: "A rate without units is a rumour; attach °C per hour and it becomes a measurement.",
          },
        ],
        result:
          "Average rate of change over [a, b]  =  (f(b) − f(a)) ÷ (b − a): the steepness of the straight line joining the two snapshots — an honest summary that hides the middle.",
      },

      examples: [
        {
          title: "Example 1 — The morning warm-up and the afternoon fade",
          problem:
            "A city's temperature one clear day: 8°C at 6 a.m., 16°C at noon, 14°C at 6 p.m. What was the average rate of change (a) over the morning, 6 a.m. to noon, and (b) over the afternoon, noon to 6 p.m.? What does the sign of each answer tell you?",
          steps: [
            { do: "Morning snapshots: 8°C at hour 6, 16°C at hour 12.", math: "rise = 16 − 8 = 8°C;   run = 12 − 6 = 6 h" },
            { do: "Divide rise by run.", math: "8 ÷ 6 ≈ +1.33 °C per hour" },
            { do: "Afternoon snapshots: 16°C at hour 12, 14°C at hour 18.", math: "rise = 14 − 16 = −2°C;   run = 18 − 12 = 6 h" },
            { do: "Divide again — and keep the minus sign.", math: "−2 ÷ 6 ≈ −0.33 °C per hour" },
          ],
          answer:
            "Morning ≈ +1.33 °C/h (warming); afternoon ≈ −0.33 °C/h (cooling). The minus sign is the direction the story moved, not an error to be deleted.",
          check: {
            code: "snapshots = [(6, 8), (12, 16), (18, 14)]\nfor (a, fa), (b, fb) in zip(snapshots, snapshots[1:]):\n    rate = (fb - fa) / (b - a)\n    print(f'{a}:00 to {b}:00 : {rate:+.2f} degrees per hour')",
            output: "COMPUTE",
            note: "The sign carries the story: warming in the morning, cooling after noon.",
          },
        },
        {
          title: "Example 2 — Two vans, one road",
          problem:
            "Two delivery vans leave the same depot at 9 a.m. Van A holds a steady 50 km/h all morning. Van B's driver starts gently and accelerates: its distance from the depot after t hours is 10t² km. (a) Each van's average speed over the first 2 hours? (b) Over hours 2 to 4? (c) Which van is ahead at 4 hours, and when do their distance stories cross?",
          steps: [
            { do: "First window, [0, 2]: A's story is steady by definition.", math: "A: 50 km/h;   B: (10×2² − 0) ÷ 2 = 40 ÷ 2 = 20 km/h" },
            { do: "Second window, [2, 4]: A unchanged; B's window average jumps.", math: "A: 50 km/h;   B: (10×4² − 10×2²) ÷ 2 = 120 ÷ 2 = 60 km/h" },
            { do: "Position at 4 h: A's straight story wins on total distance.", math: "A: 200 km;   B: 160 km — A leads by 40 km" },
            { do: "Crossing: set the stories equal and solve.", math: "50t = 10t²  →  10t(5 − t) = 0  →  t = 5 h (both at 250 km)" },
          ],
          answer:
            "Over [0, 2]: A 50 km/h, B 20 km/h. Over [2, 4]: A still 50, B 60 — the bending story now wins on averages even though A still leads on total distance. The stories cross at t = 5 h, 250 km out.",
          check: {
            code: "A = lambda t: 50 * t\nB = lambda t: 10 * t ** 2\nfor a, b in ((0, 2), (2, 4)):\n    print(f'[{a},{b}] h: A avg {(A(b) - A(a)) / (b - a):5.1f} km/h, B avg {(B(b) - B(a)) / (b - a):5.1f} km/h')\nprint('at 4 h: A', A(4), 'km, B', B(4), 'km')\nprint('cross at t = 5 h, both at', A(5), 'km')",
            output: "COMPUTE",
          },
        },
      ],

      programming: {
        intro:
          "The average rate of change is three lines of arithmetic, which makes it a perfect first program: sample a story at regular intervals, compute each window's rate, and read the whole morning in one table. Van B's distances come straight from the example above; the pattern to notice is how the per-window averages grow.",
        code: "def distance(t):\n    return 10 * t ** 2\n\nprint('hours     km at start   km at end   average speed')\nfor a in range(5):\n    b = a + 1\n    print(f'[{a}, {b}]        {distance(a):>6}        {distance(b):>6}        {(distance(b) - distance(a)) / (b - a):>5.1f} km/h')",
        output: "COMPUTE",
        explanation: [
          "Each row is one honest window: snapshot at the start, snapshot at the end, rise over run.",
          "The averages climb 10, 30, 50, 70, 90 — for a squared story, every same-sized window adds a bigger jump than the one before.",
          "No single row tells you the speed at any one instant — that is the work of lesson d-04, and these averages are the ladder it will climb.",
        ],
      },

      mlConnection: {
        title: "Where machine learning feels this lesson",
        body: [
          "Every training run produces a story line: the loss curve, one point per epoch, falling as the model learns. Practitioners read it exactly the way you read the temperature story — by the average rate of change between checkpoints. 'The loss dropped 0.42 over the last ten epochs' is (f(b) − f(a)) ÷ (b − a) with units attached, and early stopping is the decision that a small enough average improvement no longer justifies the compute. The same reading prices features: average sign-ups per euro across two budget periods is a rate of change, and it is the first cut of every uplift analysis.",
          "Monitoring uses the identical tool on the model's health. When real-world data drifts away from the training set, dashboards alert on the average rate of drift of an error metric — two snapshots, rise over run, units per week. In every case the mathematics is the same three lines of Python you just wrote: a story, two snapshots, a division. The whole of calculus is what happens when you start demanding finer and finer snapshots.",
        ],
        usedBy: ["loss curves and early stopping", "A/B test uplift (before vs after rates)", "data-drift monitoring", "linear regression's slope estimate"],
      },

      exercises: [
        {
          id: "d-01-e1",
          tier: "beginner",
          title: "Reading a cold morning",
          prompt:
            "A hiker notes the temperature on a mountain trail: −2°C at 5 a.m., 7°C at 11 a.m., and 10°C at 2 p.m. (a) Compute the average rate of change from 5 a.m. to 11 a.m., in °C per hour. (b) Compute it from 11 a.m. to 2 p.m. (c) Which stretch of the morning warmed faster, and what would a negative answer have meant?",
          hint: "Average rate = (later reading − earlier reading) ÷ hours passed. Keep the sign; keep the units.",
          solution: {
            approach:
              "For each stretch, take the two snapshots, subtract the readings to get the rise, divide by the hours passed, and keep the units attached to the answer.",
            steps: [
              { do: "Morning stretch: readings −2 and 7, six hours apart.", math: "rise = 7 − (−2) = 9°C;   run = 11 − 5 = 6 h" },
              { do: "Divide.", math: "9 ÷ 6 = +1.5 °C per hour" },
              { do: "Midday stretch: readings 7 and 10, three hours apart.", math: "rise = 10 − 7 = 3°C;   run = 14 − 11 = 3 h" },
              { do: "Divide.", math: "3 ÷ 3 = +1.0 °C per hour" },
            ],
            answer:
              "The early morning warmed faster: +1.5 °C/h versus +1.0 °C/h. A negative answer would have meant the story was falling — cooling as the hours passed.",
            check: {
              code: "snapshots = [(5, -2), (11, 7), (14, 10)]\nfor (a, fa), (b, fb) in zip(snapshots, snapshots[1:]):\n    print(f'{a}h to {b}h: {(fb - fa) / (b - a):+.2f} C per hour')",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-01-e2",
          tier: "intermediate",
          title: "The average that hides a crisis",
          prompt:
            "A server's response time (in ms) in the hours after a deploy is modelled by f(t) = 200 + 30t − 5t² for 0 ≤ t ≤ 6, with t in hours since launch. (a) Compute the average rate of change over [0, 6]. (b) Compute it over [0, 3] and over [3, 6]. (c) The all-clear was given because the six-hour average was 0 ms per hour — explain in plain words why that summary was a mistake.",
          hint: "Compute f at t = 0, 3, 6 first: the middle snapshot tells the story the two endpoints hide.",
          solution: {
            approach:
              "Evaluate the formula at the three checkpoints, then form three rise-over-run ratios: the six-hour one, and the two three-hour halves that sit inside it. Compare what each summary claims against what the middle value shows.",
            steps: [
              { do: "Checkpoint values.", math: "f(0) = 200 ms,   f(3) = 245 ms,   f(6) = 200 ms" },
              { do: "Six-hour average: endpoints agree, so the average is zero.", math: "(200 − 200) ÷ 6 = 0 ms per hour" },
              { do: "First half: the story climbs.", math: "(245 − 200) ÷ 3 ≈ +15 ms per hour" },
              { do: "Second half: the story falls back.", math: "(200 − 245) ÷ 3 ≈ −15 ms per hour" },
              { do: "The rise and the fall cancel exactly — a 45 ms spike vanishes from the summary.", math: "+15 × 3 h then −15 × 3 h  →  net 0 over 6 h" },
            ],
            answer:
              "The six-hour average is 0 ms/h only because a 45 ms rise and a 45 ms fall cancelled. Response times were 22.5% worse mid-window; the all-clear hid the peak entirely. Averages over long windows can cancel a crisis.",
            check: {
              code: "def f(t):\n    return 200 + 30 * t - 5 * t ** 2\n\nfor a, b in ((0, 6), (0, 3), (3, 6)):\n    print(f'[{a},{b}] avg {(f(b) - f(a)) / (b - a):+6.1f} ms/h   (f({a})={f(a)}, f({b})={f(b)})')",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-01-e3",
          tier: "advanced",
          title: "Catching the steady van",
          prompt:
            "Van A holds 50 km/h; van B's distance after t hours is 10t² km; both start together at the depot. (a) Show that B's average speed over the window [2, T] works out to 10(T + 2) km/h, and find the T > 2 where it equals 50. (b) Find when the two vans are level in distance by solving 50t = 10t². (c) Show that B's average speed over [0, T] reaches 50 km/h exactly at the level-crossing time.",
          hint: "Average over [2, T] is (10T² − 40) ÷ (T − 2); factor the top as 10(T − 2)(T + 2) before dividing.",
          solution: {
            approach:
              "Write the average-speed formula over a general window, simplify by factoring the numerator so the division is honest, solve the resulting equation, then interpret the two special times in the story of the two vans.",
            steps: [
              { do: "Average over [2, T]: substitute into rise over run.", math: "(10T² − 40) ÷ (T − 2)" },
              { do: "Factor the top and cancel for T ≠ 2.", math: "10(T − 2)(T + 2) ÷ (T − 2) = 10(T + 2) km/h" },
              { do: "Set it equal to 50 and solve.", math: "10(T + 2) = 50   →   T = 3 h" },
              { do: "Level in distance: solve the stories equal.", math: "50t = 10t²  →  t(5 − t) = 0  →  t = 5 h, both at 250 km" },
              { do: "B's average over [0, T] and the crossing time.", math: "10T² ÷ T = 10T km/h, which equals 50 exactly at T = 5" },
            ],
            answer:
              "B matches A's 50 km/h over the window [2, 3] exactly. The vans sit level at t = 5 h, 250 km out — and that is precisely when B's whole-journey average first reaches 50 km/h. After that, the squared story's averages keep growing while A's never change.",
            check: {
              code: "A = lambda t: 50 * t\nB = lambda t: 10 * t ** 2\nprint('B avg over [2, 3]:', (B(3) - B(2)) / 1, 'km/h')\nprint('positions at t=5: A', A(5), 'km, B', B(5), 'km')\nprint('B avg over [0, 5]:', B(5) / 5, 'km/h')",
              output: "COMPUTE",
            },
          },
        },
      ],

      quiz: [
        {
          id: "d-01-q1",
          prompt: "Between 9 a.m. and 1 p.m. the temperature rises from 12°C to 18°C. The average rate of change is:",
          options: ["6 °C per hour", "1.5 °C per hour", "0.75 °C per hour", "−1.5 °C per hour"],
          correctIndex: 1,
          explanation:
            "Rise 18 − 12 = 6°C over run 13 − 9 = 4 hours: 6 ÷ 4 = 1.5 °C/h. Answering 6 forgets to divide by the time passed; answering 0.75 divides by 8 hours, the wrong run.",
        },
        {
          id: "d-01-q2",
          prompt: "A car covers 240 km in 3 hours. Which statement is the ONLY one the average of 80 km/h guarantees?",
          options: [
            "The car was moving at exactly 80 km/h most of the time",
            "The total distance covered was 240 km",
            "The car never stopped",
            "The car's fastest moment was 80 km/h",
          ],
          correctIndex: 1,
          explanation:
            "An average is a summary of the endpoints: total rise ÷ total run. It constrains nothing about the middle — the same 80 average is consistent with a dead stop in roadworks and a 130 km/h stretch on the motorway.",
        },
        {
          id: "d-01-q3",
          prompt: "For f(x) = x², the average rate of change over [2, 4] is:",
          options: ["4", "6", "12", "10"],
          correctIndex: 1,
          explanation:
            "(f(4) − f(2)) ÷ (4 − 2) = (16 − 4) ÷ 2 = 6. Answering 12 divides by 1 instead of by the run 2; answering 4 takes half of 8, the rise, and forgets the run entirely.",
        },
      ],

      misconceptions: [
        {
          myth: "The average rate of change describes a typical moment inside the interval.",
          why: "The word average sounds like 'typical', as in average height or average income.",
          reality:
            "It is the slope of the straight line joining the two endpoints — a summary of the ends. The middle can be wildly different, as the 0 ms/h all-clear that hid a 45 ms spike showed.",
        },
        {
          myth: "A negative rate means the quantity itself is negative.",
          why: "Minus signs read as 'below zero' through most of arithmetic.",
          reality:
            "It means the story is falling: output decreasing as input grows. The afternoon temperature was a healthy +14°C while its rate of change was −0.33 °C/h.",
        },
        {
          myth: "A steeper-looking graph always means a faster rate.",
          why: "Steepness on a page feels like a physical fact.",
          reality:
            "Steepness on paper depends on how the two directions were squashed. The honest comparison is rise ÷ run in real units, not pixels — check the scales before judging any picture.",
        },
      ],

      takeaways: [
        "A function is a story line: inputs along one direction, outputs along the other, and the shape tells the story.",
        "Average rate of change = (f(b) − f(a)) ÷ (b − a): the slope of the straight line joining two snapshots.",
        "Averages summarize the endpoints and can hide the entire middle — the traffic jam, the speeding ticket, the latency spike.",
        "Units make rates honest: degrees per hour, kilometres per hour, milliseconds per hour.",
      ],
    },

    // =========================================================================
    // d-02 — LIMITS
    // =========================================================================
    {
      slug: "d-02",
      title: "Limits: Close Enough Is a Real Answer",
      minutes: 35,
      summary:
        "Limits: the art of trusting where values are heading — the 0/0 trap, one-sided approach, and the shrinking-gap tables that turn close enough into a real answer.",
      objectives: [
        "Read a table of values approaching a point and name the number they are heading toward",
        "Recognize the 0/0 trap and repair it by factoring and cancelling",
        "Distinguish the limit at a point from the value at the point — a hole changes nothing",
        "Compute one-sided limits from the left and right, and say when they disagree",
      ],
      prerequisites: ["d-01"],

      analogy: {
        scene:
          "You are flipping through photos a friend sent from her run: a hundred metres from the café in the first, fifty in the second, ten in the third, then one boot toe from the door. No photo shows her inside — the battery died — but you know precisely where the next photo would have landed. You would bet money on the exact spot, and you would be right, without ever seeing the final frame.",
        bridge:
          "A limit is that knowledge: the number the outputs are heading toward as the inputs close in on a target — even when the formula itself dies at the exact point. The missing last photo is not a problem; the destination is not in doubt.",
      },

      intuition: [
        "Some formulas break at one awkward input. Take the one that divides 'input squared minus four' by 'input minus two': it produces a perfectly sensible number for every input except exactly 2, where the top and the bottom both land on zero — and zero divided by zero has no agreed value anywhere in arithmetic. But broken is not the same as meaningless. Feed the formula inputs near 2 — 1.9, 1.99, 1.999, then 2.001, 2.01 — and watch its outputs: 3.9, 3.99, 3.999, then 4.001, 4.01. The outputs are marching somewhere very specific. They march there from both sides, in lockstep.",
        "That marching is what a limit names. The limit is the destination the outputs converge to as the inputs close in on the target — a number you can read off to as many decimal places as you have patience for, without ever needing the formula to work at the target itself. It is the friend-at-the-door knowledge: the final photo is missing, the destination is not in doubt. And you can demand as much evidence as you like — inputs within a thousandth, a millionth — and the outputs keep confirming the same destination.",
        "Why settle for a destination instead of demanding the value? Because in this course the destination is exactly what we need. The next lessons build the steepness of a story at a single instant out of averages over shrinking gaps — and those averages are formulas that die when the gap hits zero, in the same 0-over-0 way. The whole machinery of change rests on knowing where things head as a gap shrinks, not on what happens at the impossible final step.",
      ],

      terminology: [
        {
          term: "Limit",
          symbol: "lim x→a f(x)",
          plain: "The number the outputs are heading toward as the inputs close in on a.",
          formal: "L is the limit of f(x) as x → a if outputs stay as close to L as demanded once inputs are close enough to a (without equaling a).",
        },
        {
          term: "One-sided limit",
          symbol: "lim x→a⁻, lim x→a⁺",
          plain: "The destination when approaching from one side only — below or above the target.",
          formal: "The limit taken over inputs approaching a from below (left) or from above (right).",
        },
        {
          term: "Indeterminate form",
          symbol: "0/0",
          plain: "The broken-machine flag: top and bottom both heading to zero — could hide any answer.",
          formal: "A quotient whose numerator and denominator both approach 0; the limit, if any, must be found by rewriting.",
        },
        {
          term: "Removable hole",
          plain: "A single missing point on an otherwise intact path.",
          formal: "f is undefined at a while lim x→a f(x) exists.",
        },
        {
          term: "Factoring",
          plain: "Rewriting a top as a product so a shared factor can cancel.",
          formal: "Writing an expression as a product of factors, e.g. x² − 4 = (x − 2)(x + 2).",
        },
      ],

      visuals: [
        {
          kind: "lab",
          lab: "tangent",
          title: "Shrink the gap: secant slopes settling down",
        },
        {
          kind: "graph",
          spec: {
            xMin: 1,
            xMax: 3,
            yMin: 2,
            yMax: 6,
            curves: [{ expr: "(x**2 - 4)/(x - 2)", label: "y = (x² − 4)/(x − 2)", color: "#7c3aed" }],
            points: [{ x: 2, y: 4, label: "the hole at (2, 4)" }],
            caption:
              "The path y = (x² − 4)/(x − 2) is the straight line y = x + 2 with one point missing at x = 2. From the left the values run 3.9, 3.99, 3.999…; from the right 4.1, 4.01, 4.001… — both sides head for the hole's height: 4.",
          },
        },
      ],

      derivation: {
        title: "Patching the 0/0 trap: lim x→2 (x² − 4)/(x − 2) = 4, every step",
        intro:
          "The whole skill of this lesson is repairing a broken formula honestly. Here is the classic repair, one legal move at a time, finishing with evidence from both sides of the target.",
        steps: [
          {
            do: "Try the naive move first: plug in x = 2 and see what happens.",
            math: "(2² − 4) ÷ (2 − 2)  =  0 ÷ 0  — undefined",
            why: "Zero over zero is not a number; the formula genuinely dies at the exact point.",
          },
          {
            do: "Notice the top is a difference of squares and factor it.",
            math: "x² − 4  =  (x − 2)(x + 2)",
            why: "a² − b² = (a − b)(a + b) with a = x and b = 2.",
          },
          {
            do: "For every x other than 2, the shared factor cancels.",
            math: "(x − 2)(x + 2) ÷ (x − 2)  =  x + 2    for x ≠ 2",
            why: "Cancelling divides top and bottom by the same nonzero factor — legal whenever x ≠ 2, which is exactly the territory 'approaching 2' lives in.",
          },
          {
            do: "So near 2 the path is the straight line y = x + 2, with the single point at 2 missing.",
            math: "g(x) = x + 2    for all x ≠ 2",
          },
          {
            do: "Now shrink: as x heads to 2, the value x + 2 heads to 4.",
            math: "lim x→2 g(x)  =  4",
          },
          {
            do: "Collect evidence from both sides.",
            math: "1.999 → 3.999;   1.99 → 3.99;   2.001 → 4.001;   2.01 → 4.01",
            why: "Two one-sided marches that agree are what make the destination real.",
          },
        ],
        result:
          "lim x→2 (x² − 4)/(x − 2) = 4 — the formula dies at x = 2, but the destination of nearby values exists and equals 4: close enough is a real answer.",
      },

      examples: [
        {
          title: "Example 1 — The evidence table",
          problem:
            "For g(x) = (x² − 4)/(x − 2), compute g at 1.9, 1.99 and 1.999, then at 2.001, 2.01 and 2.1. What number is g heading toward, and which side undershoots it?",
          steps: [
            { do: "Approach from the left, inputs below 2.", math: "g(1.9) = 3.9,   g(1.99) = 3.99,   g(1.999) = 3.999" },
            { do: "Approach from the right, inputs above 2.", math: "g(2.001) = 4.001,   g(2.01) = 4.01,   g(2.1) = 4.1" },
            { do: "Both marches close in on the same number, three decimals and counting.", math: "3.999 → 4 ← 4.001" },
          ],
          answer:
            "The values head for 4. The left side undershoots (3.9, 3.99, 3.999 — always just below) and the right side overshoots (4.1, 4.01, 4.001 — always just above); the gap around 4 halves with every decimal of effort.",
          check: {
            code: "def g(x):\n    return (x ** 2 - 4) / (x - 2)\n\nfor x in (1.9, 1.99, 1.999, 2.001, 2.01, 2.1):\n    print(f'x = {x:7.3f}   g(x) = {g(x):.6f}')",
            output: "COMPUTE",
            note: "Six decimals per row: the march on 4 is visible from both sides.",
          },
        },
        {
          title: "Example 2 — A famous trap you can see but not yet prove",
          problem:
            "The ratio sin(x)/x (with x in radians) is the most famous 0/0 in mathematics — at x = 0 both top and bottom are zero. Compute it at 0.5, 0.1, 0.01 and 0.001 and name the destination.",
          steps: [
            { do: "Probe with a coarse input.", math: "sin(0.5) ÷ 0.5 ≈ 0.958851" },
            { do: "Tighter.", math: "sin(0.1) ÷ 0.1 ≈ 0.998334" },
            { do: "Tighter still.", math: "sin(0.01) ÷ 0.01 ≈ 0.999983" },
            { do: "As tight as patience allows.", math: "sin(0.001) ÷ 0.001 ≈ 0.9999998" },
          ],
          answer:
            "The ratio heads for 1: lim x→0 sin(x)/x = 1. Keep this number in your pocket — it is the steepness of the sine story at the origin, and it powers the derivative rules in lesson d-05.",
          check: {
            code: "import math\n\nfor x in (0.5, 0.1, 0.01, 0.001):\n    print(f'x = {x:6.3f}   sin(x)/x = {math.sin(x) / x:.6f}')",
            output: "COMPUTE",
          },
        },
      ],

      programming: {
        intro:
          "Numerical evidence for limits is a loop and a print statement: feed the formula inputs that close in on the target from both sides, and watch the outputs settle. The second table below is the one the next lesson stands on — average steepnesses over a shrinking gap h, closing in on the steepness at one exact point.",
        code: "def g(x):\n    return (x ** 2 - 4) / (x - 2)\n\nprint('g(x) closing in on x = 2 from both sides:')\nfor x in (1.9, 1.99, 1.999, 2.001, 2.01, 2.1):\n    print(f'  x = {x:7.3f}   g(x) = {g(x):.6f}')\n\ndef f(x):\n    return x ** 2\n\nprint('steepness of x**2 at x = 3, gap h shrinking:')\nfor h in (0.1, 0.01, 0.001, 0.0001):\n    print(f'  h = {h:8.4f}   average steepness = {(f(3 + h) - f(3)) / h:.6f}')",
        output: "COMPUTE",
        explanation: [
          "The first table shows the 0/0 repair from both sides: outputs close in on 4 from below (left approach) and from above (right approach).",
          "The second table is this lesson's gift to d-04: average steepnesses 6.1, 6.01, 6.001, 6.0001 over gaps that shrink — the destination 6 is the steepness at the single point x = 3.",
          "Six decimals of agreement is how practitioners trust a destination even before any formal proof is in hand.",
        ],
      },

      mlConnection: {
        title: "Where machine learning feels this lesson",
        body: [
          "The derivative itself — the engine of all model training — is defined as a limit, so every time a network learns, this lesson's idea is doing the lifting: the steepness at a single instant is defined as the destination of steepnesses over shrinking gaps. There is no other definition to fall back on. The gap never actually reaches zero; the destination is the answer.",
          "Convergence claims in machine learning are limit statements too. 'Stochastic gradient descent converges as the learning rate schedule anneals' means: run the process longer and the iterates head somewhere — a destination claimed about a sequence of training states, read exactly like the tables in this lesson. And gradient checking, the debugging ritual of deep learning frameworks, compares an analytic steepness against a numerical one computed over a tiny gap, trusting agreement to six decimals — the practitioner's version of 3.999 → 4 ← 4.001.",
        ],
        usedBy: ["the derivative definition (all of training)", "gradient checking", "convergence analysis of SGD", "learning-rate annealing schedules"],
      },

      exercises: [
        {
          id: "d-02-e1",
          tier: "beginner",
          title: "Another trap, same repair",
          prompt:
            "Let h(x) = (x² − 9)/(x − 3). (a) Show that x = 3 makes the formula 0/0. (b) Factor the top and cancel to find the hidden straight line. (c) State lim x→3 h(x), and back it with the values of h at 2.9, 2.99 and 3.1.",
          hint: "x² − 9 is a difference of squares: (x − 3)(x + 3).",
          solution: {
            approach:
              "Run the repair ritual: confirm the 0/0 at the target, factor the top, cancel the shared factor for every input away from the target, then read off the hidden line's height at the target.",
            steps: [
              { do: "Plug in x = 3: top and bottom both die.", math: "(3² − 9) ÷ (3 − 3) = 0 ÷ 0 — undefined" },
              { do: "Factor the top as a difference of squares.", math: "x² − 9 = (x − 3)(x + 3)" },
              { do: "Cancel for every x ≠ 3.", math: "h(x) = x + 3    for x ≠ 3" },
              { do: "Read the destination.", math: "lim x→3 h(x) = 3 + 3 = 6" },
              { do: "Evidence: both sides of the target.", math: "h(2.9) = 5.9,   h(2.99) = 5.99,   h(3.1) = 6.1" },
            ],
            answer: "A hole at x = 3 hiding the line y = x + 3; the limit is 6, confirmed from below (5.9, 5.99) and above (6.1).",
            check: {
              code: "def h(x):\n    return (x ** 2 - 9) / (x - 3)\n\nfor x in (2.9, 2.99, 3.001, 3.1):\n    print(f'x = {x:7.3f}   h(x) = {h(x):.6f}')",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-02-e2",
          tier: "intermediate",
          title: "The ratio the whole course leans on",
          prompt:
            "The ratio sin(x)/x (x in radians) is the most famous 0/0 in mathematics. (a) Explain why plugging in x = 0 fails. (b) Build the evidence table at x = 0.5, 0.1, 0.01, 0.001. (c) State the limit to three decimals and name the lesson that will need it.",
          hint: "Your calculator is in radians here: sin of a small radian angle is almost equal to the angle itself.",
          solution: {
            approach:
              "Confirm the 0/0 at the target, then let the numbers speak: probe the ratio at inputs shrinking toward zero and read the destination off the table. No factoring will help here — this one is pure evidence.",
            steps: [
              { do: "At x = 0 both top and bottom are zero.", math: "sin(0) ÷ 0 = 0 ÷ 0 — undefined" },
              { do: "Probe from the positive side.", math: "0.5 → 0.958851,   0.1 → 0.998334" },
              { do: "Tighter probes.", math: "0.01 → 0.999983,   0.001 → 0.9999998" },
              { do: "Destination, to three decimals.", math: "lim x→0 sin(x)/x = 1.000" },
            ],
            answer:
              "The limit is 1: near the origin, a radian angle and its sine agree to leading order. Lesson d-05 uses exactly this fact to state that the slope of the sine story is the cosine story.",
            check: {
              code: "import math\n\nfor x in (0.5, 0.1, 0.01, 0.001):\n    print(f'x = {x:6.3f}   sin(x)/x = {math.sin(x) / x:.6f}')",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-02-e3",
          tier: "advanced",
          title: "A shrinking-gap quotient you will meet again",
          prompt:
            "Compute lim h→0 ((2 + h)³ − 8) ÷ h. (a) Explain the 0/0 trap at h = 0. (b) Expand (2 + h)³ = 8 + 12h + 6h² + h³, subtract 8, and cancel the h. (c) State the limit, then identify which function at which point this quotient measures the steepness of — and check your guess against the power rule preview 3 × 2².",
          hint: "After cancelling h, every surviving term still carrying an h dies as h → 0.",
          solution: {
            approach:
              "Expand the cube so the subtraction can be done term by term, cancel the shared factor h, then let the leftover h-carrying terms vanish. Finish by recognizing the quotient as a steepness measurement from lesson d-01's language.",
            steps: [
              { do: "At h = 0 the quotient is 0/0.", math: "((2 + 0)³ − 8) ÷ 0 = 0 ÷ 0 — undefined" },
              { do: "Expand the cube.", math: "(2 + h)³ = 8 + 12h + 6h² + h³" },
              { do: "Subtract 8 and divide by h.", math: "(12h + 6h² + h³) ÷ h = 12 + 6h + h²" },
              { do: "Let h → 0: the leftover terms die.", math: "12 + 6h + h²  →  12" },
              { do: "Recognize it: change in x³ at x = 2 over change in x.", math: "the steepness of f(x) = x³ at x = 2, and 3 × 2² = 12 ✓" },
            ],
            answer:
              "The limit is 12. The quotient measures how fast x³ changes at exactly x = 2 — the destination is 12, and the power-rule preview (three times two squared) agrees: 12. Lesson d-04 turns this ritual into a definition.",
            check: {
              code: "def q(h):\n    return ((2 + h) ** 3 - 8) / h\n\nfor h in (0.1, 0.01, 0.001, -0.001, -0.01):\n    print(f'h = {h:+7.3f}   q(h) = {q(h):.6f}')",
              output: "COMPUTE",
            },
          },
        },
      ],

      quiz: [
        {
          id: "d-02-q1",
          prompt: "lim x→3 (x² − 9)/(x − 3) is:",
          options: ["0", "6", "3", "It does not exist"],
          correctIndex: 1,
          explanation:
            "Factor: (x − 3)(x + 3)/(x − 3) = x + 3 for x ≠ 3, and 3 + 3 = 6. The 0/0 at the point itself is a hole, not a verdict — the destination exists and equals 6.",
        },
        {
          id: "d-02-q2",
          prompt: "g(x) = (x² − 4)/(x − 2). Which statement is true?",
          options: [
            "g(2) = 4, so the limit is 4",
            "g has no value at 2, yet lim x→2 g(x) = 4",
            "The limit does not exist because g(2) is undefined",
            "The limit is 0 because the top is 0 at x = 2",
          ],
          correctIndex: 1,
          explanation:
            "The value at a point and the limit near it are different questions. Here the formula dies at 2 (0/0) but nearby values head for 4 — a hole with a known height. Answer 4 confuses the destination with a value the formula never produces.",
        },
        {
          id: "d-02-q3",
          prompt:
            "A parking charge approaches €5 from the left of 2 hours and €8 from the right. The limit at 2 hours:",
          options: [
            "exists and equals 5",
            "exists and equals 8",
            "exists and equals 6.5, the average",
            "does not exist — the two sides disagree",
          ],
          correctIndex: 3,
          explanation:
            "A limit needs both one-sided marches to agree on one destination. 5 from the left and 8 from the right is a jump: no single destination, so no limit. Lesson d-03 studies exactly these breaks.",
        },
      ],

      misconceptions: [
        {
          myth: "The limit is the value at the point.",
          why: "In most early examples the formula works at the point, so the two numbers coincide.",
          reality:
            "The limit ignores the point entirely — it is about the neighbourhood. A hole at (2, 4) and a filled point at (2, 99) have the same limit at 2: the destination of nearby values.",
        },
        {
          myth: "If the formula breaks at the point, no limit exists.",
          why: "School mathematics often stops at the word undefined.",
          reality:
            "0/0 is a repairable break: factor, cancel, read the destination. Only when the sides disagree (a jump) or the values flee (a blow-up) is the limit truly gone.",
        },
        {
          myth: "Close enough is sloppy mathematics.",
          why: "It sounds like settling for less.",
          reality:
            "The destination can be pinned to any demanded precision: 3.999 and 4.001 prove the answer is within 0.001 of 4, and more decimals pin it tighter. Limits are precision made honest, not hand-waving.",
        },
      ],

      takeaways: [
        "A limit is a destination: the number outputs head toward as inputs close in on a target.",
        "0/0 is a repairable break — factor, cancel, and read the hidden line's height.",
        "The value at the point and the limit near it are different questions; a hole changes nothing about the destination.",
        "One-sided limits must agree; when they disagree (a jump), the limit does not exist.",
        "Shrinking-gap tables are the practitioner's evidence: 6.1, 6.01, 6.001… is a real answer taking shape.",
      ],
    },

    // =========================================================================
    // d-03 — CONTINUITY
    // =========================================================================
    {
      slug: "d-03",
      title: "Continuity: When You Can Draw Without Lifting",
      minutes: 30,
      summary:
        "Continuity: the no-lifting-the-pen promise — the three honest ways a story breaks (hole, jump, blow-up), friendly walls called asymptotes, and why optimization needs a floor you can stand on.",
      objectives: [
        "Say what continuity means in plain words: no surprises — small input nudges give small output nudges",
        "Recognize the three classic breaks: the hole, the jump, the blow-up",
        "Read an asymptote as a friendly wall: approachable forever, never touched",
        "Explain why a minimum you can stand on matters, and what breaks can do to one",
      ],
      prerequisites: ["d-02"],

      analogy: {
        scene:
          "A trail guide swears the ridge path runs four kilometres without a single obstacle — you can walk it start to finish without your boots ever leaving the ground. Except: at kilometre two a single rotted plank is missing from a boardwalk (you step over it); at kilometre three the trail drops a two-metre ledge you must climb down; and at kilometre three and a half the ridge splits into a gorge that widens the further you look, until the marked line on the map gives up entirely. Three very different failures of the same promise.",
        bridge:
          "Continuity is the guide's promise, kept: a story you can walk without lifting the pen. This lesson tours the three ways the promise breaks — and the one place where even a broken map still tells you something honest.",
      },

      intuition: [
        "Continuity is the absence of surprises. Nudge the input a little, and a continuous story nudges the output a little — it never teleports, never vanishes, never explodes. Walk the story line from any start to any finish and your pen stays down on the paper the whole way. It is a promise about every single point, and one broken plank anywhere breaks the promise for the whole stretch that contains it.",
        "The breaks come in exactly three honest flavours. A hole: everything intact except one missing point — step over it and nothing else changes (yesterday's 0/0 repair left exactly this behind). A jump: the story teleports — from the left it approaches one value, from the right a different one, and no single number is the destination. A blow-up: the values flee toward ever-bigger magnitudes near one input — not a missing step but a wall you can approach forever without ever touching.",
        "Why should a data person care? Because searching for the best — the cheapest, the fastest, the least wrong — means standing on the story and walking downhill to the bottom. On a story with holes, the true bottom can sit inside a gap you cannot stand on. With jumps, a tiny nudge of the input can hop the output to a completely different level, so 'improve the input a little' stops meaning 'improve the output a little'. That is why nearly every loss function used in real training is built to be continuous: a floor you can walk to the bottom of, with no cliffs you cannot feel coming.",
      ],

      terminology: [
        {
          term: "Continuity",
          plain: "The no-lifting-the-pen promise: walk the story and never fall through.",
          formal: "f is continuous at a when f(a) exists, lim x→a f(x) exists, and the two are equal.",
        },
        {
          term: "Removable discontinuity",
          symbol: "hole",
          plain: "One missing plank; patch it and the path is whole again.",
          formal: "f is undefined (or mis-set) at a while lim x→a f(x) exists.",
        },
        {
          term: "Jump discontinuity",
          plain: "The story teleports: the two sides disagree about the destination.",
          formal: "The left and right one-sided limits at a both exist but differ.",
        },
        {
          term: "Infinite discontinuity",
          symbol: "blow-up",
          plain: "Values flee toward ever-bigger magnitudes near the point.",
          formal: "f grows without bound as x approaches a from at least one side.",
        },
        {
          term: "Asymptote",
          plain: "A friendly wall: a line the story approaches ever more closely without touching.",
          formal: "A line the graph of f approaches arbitrarily closely as x → a (or as x grows without bound).",
        },
      ],

      visuals: [
        {
          kind: "graph",
          spec: {
            xMin: -4,
            xMax: 4,
            yMin: -5,
            yMax: 5,
            curves: [{ expr: "1/x", label: "y = 1/x", color: "#7c3aed" }],
            vLines: [{ x: 0, label: "vertical asymptote x = 0" }],
            caption:
              "The blow-up: near x = 0 the values flee — at x = ±0.01 the story sits at ∓100. The dashed wall is friendly: you may walk toward it forever; the formula never lets you touch it.",
          },
        },
        {
          kind: "graph",
          spec: {
            xMin: 0,
            xMax: 4,
            yMin: -0.5,
            yMax: 1.5,
            curves: [
              { expr: "0*sqrt(2 - x)", label: "left of 2: y = 0", color: "#7c3aed" },
              { expr: "1 + 0*sqrt(x - 2)", label: "right of 2: y = 1", color: "#0ea5e9" },
            ],
            vLines: [{ x: 2, label: "jump at x = 2" }],
            caption:
              "The jump: from the left the values march to 0; from the right they march to 1. Two destinations means no destination — the limit at 2 does not exist. Each branch is drawn only on its own side of 2.",
          },
        },
        {
          kind: "graph",
          spec: {
            xMin: 0,
            xMax: 2,
            yMin: 0,
            yMax: 3,
            curves: [{ expr: "(x**2 - 1)/(x - 1)", label: "y = (x² − 1)/(x − 1)", color: "#7c3aed" }],
            points: [{ x: 1, y: 2, label: "hole at (1, 2)" }],
            caption:
              "The hole: y = (x² − 1)/(x − 1) is the line y = x + 1 with the point at x = 1 missing — a 0/0 at exactly one spot. The limit (2) exists; the value does not: the gentlest break there is.",
          },
        },
      ],

      derivation: {
        title: "The three-part test for standing on a point",
        intro:
          "Mathematicians compress the no-lifting promise into a checklist you can run at any single point — three questions, all of which must pass. Walking the three breaks through the checklist shows why each fails in its own way.",
        steps: [
          {
            do: "First question: does the story actually have a value at the point?",
            math: "1.  f(a) exists",
            why: "You cannot stand on a missing plank.",
          },
          {
            do: "Second: do both one-sided marches agree on one destination?",
            math: "2.  lim x→a⁻ f(x)  =  lim x→a⁺ f(x)  =  L",
            why: "Formally, 'approaches' means outputs stay within any demanded tiny band once inputs sit inside a small enough band — the everyday march and the formal bands say the same thing.",
          },
          {
            do: "Third: does the standing height equal the destination height?",
            math: "3.  f(a) = L",
            why: "Otherwise the pen must leap between the point and the path — that leap is the lift.",
          },
          {
            do: "Run the hole through it: g(x) = (x² − 1)/(x − 1) at a = 1.",
            math: "fails 1:  g(1) = 0/0 undefined,  yet lim = 2",
            why: "A missing plank with a surviving destination — patchable by defining g(1) = 2.",
          },
          {
            do: "Run the jump through it: the story that is 0 left of 2 and 1 right of 2.",
            math: "fails 2:  0 ≠ 1 — the marches disagree",
            why: "No value at 2 can glue two disagreeing marches together.",
          },
          {
            do: "Run the blow-up through it: 1/x near 0.",
            math: "fails 2:  the one-sided limits are not finite at all",
            why: "Fleeing values agree on no destination — a wall, not a hole.",
          },
        ],
        result:
          "Continuous at a exactly when all three hold: f(a) exists, both one-sided limits exist and agree, and the value equals the limit — no hole, no jump, no blow-up.",
      },

      examples: [
        {
          title: "Example 1 — Patching the hole",
          problem:
            "Define p(x) = (x² − 1)/(x − 1). (a) Show p is discontinuous at x = 1 and name the flavour. (b) Find the value of p(1) that would make the story continuous. (c) Verify that the patched story and the original agree everywhere else.",
          steps: [
            { do: "At x = 1 the formula is 0/0.", math: "p(1) undefined — a removable hole" },
            { do: "Factor and cancel for x ≠ 1.", math: "p(x) = (x − 1)(x + 1) ÷ (x − 1) = x + 1    for x ≠ 1" },
            { do: "The destination at 1 exists.", math: "lim x→1 p(x) = 2" },
            { do: "Patch: define p(1) = 2 — standing height now equals destination height.", math: "patched p(1) = 2 = lim x→1 p(x) ✓" },
            { do: "Everywhere else the original already equalled x + 1, so the patch changed nothing.", math: "patched p(x) = x + 1 for every x" },
          ],
          answer:
            "A removable hole: setting p(1) = 2 patches the story into the full line y = x + 1, continuous everywhere. Holes are the one break you can repair by hand.",
          check: {
            code: "def p_raw(x):\n    return (x ** 2 - 1) / (x - 1)\n\ndef p_patched(x):\n    return x + 1\n\nfor x in (0.5, 0.9, 1.1, 1.5):\n    print(f'x = {x:4.1f}   raw {p_raw(x):.4f}   patched {p_patched(x):.4f}')\nprint('raw at x = 1: undefined (0/0);  patched at x = 1:', p_patched(1))",
            output: "COMPUTE",
          },
        },
        {
          title: "Example 2 — The cliff-edge threshold",
          problem:
            "A cloud bill charges €0 for a month with usage at or below 100 GB, and €40 the instant usage exceeds 100 GB: c(u) = 0 for u ≤ 100 and 40 for u > 100. (a) Compute the one-sided limits of c at u = 100. (b) Does the limit exist? (c) A team at 99.999 GB nudges usage up by 0.002 GB — what happens to the bill, and why does this make cost work around thresholds brittle?",
          steps: [
            { do: "From the left: every usage below 100 is billed 0.", math: "lim u→100⁻ c(u) = 0" },
            { do: "From the right: every usage above 100 is billed 40.", math: "lim u→100⁺ c(u) = 40" },
            { do: "Two destinations means no destination.", math: "0 ≠ 40  →  no limit — a jump" },
            { do: "The nudge crosses the cliff.", math: "99.999 → 100.001 GB:  bill €0 → €40" },
          ],
          answer:
            "Left limit 0, right limit 40, no limit — a jump. A 0.002 GB nudge (a 0.002% change) lands a €40 bill: near a jump, 'improve the input a little' can wreck the output, which is why cost models train on smoothed, continuous stand-ins for such steps.",
        },
      ],

      programming: {
        intro:
          "A probe loop is how you interrogate any suspected break from the safety of numbers: march toward the suspect input from both sides and print what the story does. The first probe below walks toward a wall; the second confirms a gentle story by showing its response to ever-smaller nudges shrinking in step.",
        code: "def wall(x):\n    return 1 / (x - 2)\n\ndef gentle(x):\n    return x ** 2\n\nprint('marching toward the wall at x = 2:')\nfor x in (1.9, 1.99, 1.999, 2.001, 2.01, 2.1):\n    print(f'  x = {x:7.3f}   f(x) = {wall(x):10.4f}')\n\nprint('gentle story near x = 1 (nudge size h shrinking):')\nfor h in (0.1, 0.01, 0.001):\n    print(f'  h = {h:6.3f}   up-nudge {abs(gentle(1 + h) - gentle(1)):.6f}   down-nudge {abs(gentle(1 - h) - gentle(1)):.6f}')",
        output: "COMPUTE",
        explanation: [
          "Toward the wall: −10, −100, −1000 from the left; then +1000, +100, +10 from the right — values fleeing with no destination in sight.",
          "The gentle story's response to a nudge of size h shrinks in step with h itself: ever smaller nudges in, ever smaller nudges out. That is continuity measured, not assumed.",
          "Probing beats eyeballing: the same loop pattern works on any formula a teammate hands you at 5 p.m. on a Friday.",
        ],
      },

      mlConnection: {
        title: "Where machine learning feels this lesson",
        body: [
          "Activation functions are continuity decisions made for you. ReLU — return the input if positive, otherwise zero — is continuous everywhere: its story has a corner at zero but no break, which is why tiny weight nudges never teleport a neuron's output. Sigmoid and tanh are smooth throughout. The corner does mean the slope machine seizes at exactly zero (lesson d-04's business), yet training survives, because a weight landing exactly on a corner is vanishing luck.",
          "Where you meet genuine jumps: decision trees. A tree predicts by sorting a row into a leaf, so growing a feature past a split boundary can flip the prediction wholesale — a tiny input nudge, a whole new answer. That is why trees feel brittle near their boundaries, and why gradient-boosted trees fit smooth corrections instead of trusting single leaves. Loss functions are deliberately continuous for the same reason: mean squared error's bowl is the poster child, and even the absolute-value loss's corner gets patched by Huber loss precisely so training has a floor without kinks.",
        ],
        usedBy: ["ReLU and sigmoid activations", "decision-tree boundary jumps", "Huber loss (patching the absolute-error corner)", "smooth surrogate losses for threshold costs"],
      },

      exercises: [
        {
          id: "d-03-e1",
          tier: "beginner",
          title: "Name the break",
          prompt:
            "For each story below, say whether it is continuous everywhere, and if not, name the flavour of the break and where it happens: (a) s(x) = x² + 3. (b) t(x) = (x² − 16)/(x − 4). (c) w(x) = 1/(x + 5). (d) A delivery fee that is €3 for orders under €20 and €7 for orders of €20 or more.",
          hint: "Ask the three questions at each suspicious point: value? matching one-sided destinations? value equals destination?",
          solution: {
            approach:
              "For each story, find the suspicious input (if any), then run the three-part test there: does the value exist, do the one-sided destinations agree, and do they match the value.",
            steps: [
              { do: "s(x) = x² + 3: a parabola — no suspicious points anywhere.", math: "continuous everywhere ✓" },
              { do: "t(x): at x = 4 the formula is 0/0.", math: "t(x) = x + 4 for x ≠ 4,  lim = 8 — a hole at (4, 8)" },
              { do: "w(x): the bottom dies at x = −5.", math: "values flee near −5 — a blow-up (wall), not a hole" },
              { do: "The fee: one-sided destinations at €20.", math: "from the left: €3;   from the right: €7 — a jump" },
            ],
            answer:
              "(a) Continuous. (b) Removable hole at x = 4 (destination 8, value missing). (c) Blow-up at x = −5 — a wall. (d) Jump at €20: two disagreeing destinations.",
            check: {
              code: "def t(x):\n    return (x ** 2 - 16) / (x - 4)\n\ndef w(x):\n    return 1 / (x + 5)\n\nprint('t near 4:', [round(t(x), 4) for x in (3.9, 3.99, 4.01, 4.1)])\nprint('w near -5:', [round(w(x), 2) for x in (-5.1, -5.01, -4.99, -4.9)])",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-03-e2",
          tier: "intermediate",
          title: "Patch it or admit it",
          prompt:
            "Let q(x) = (x² − 6x + 9)/(x − 3). (a) Factor the top and simplify for x ≠ 3. (b) What is lim x→3 q(x)? (c) What value of q(3) makes the story continuous at 3? (d) Now let r(x) = (x + 1)/(x − 3): can any value of r(3) make r continuous at 3? Explain using one-sided limits.",
          hint: "The top of q is a perfect square: (x − 3)². For r, probe both sides of 3 before deciding.",
          solution: {
            approach:
              "Repair q with the factoring ritual, then test r the same way — the difference between a hole and a wall is exactly whether the destination exists to be patched onto.",
            steps: [
              { do: "Factor the top of q.", math: "x² − 6x + 9 = (x − 3)²" },
              { do: "Cancel for x ≠ 3.", math: "q(x) = x − 3    for x ≠ 3" },
              { do: "Destination at 3.", math: "lim x→3 q(x) = 0" },
              { do: "The patch: standing height must equal destination height.", math: "q(3) = 0 makes q continuous at 3" },
              { do: "For r: probe both sides of 3.", math: "r(2.99) ≈ −399,   r(3.01) ≈ +401 — values flee" },
              { do: "No destination exists to patch onto.", math: "no value of r(3) helps — walls are not patchable, holes are" },
            ],
            answer:
              "q simplifies to x − 3 away from 3, its limit is 0, and defining q(3) = 0 makes it continuous. For r the one-sided limits are not finite at all — a blow-up — so no choice of r(3) can glue fleeing values to a single standing height.",
            check: {
              code: "def q(x):\n    return (x ** 2 - 6 * x + 9) / (x - 3)\n\ndef r(x):\n    return (x + 1) / (x - 3)\n\nprint('q near 3:')\nfor x in (2.9, 2.99, 3.01, 3.1):\n    print(f'  x = {x:5.2f}  q = {q(x):7.4f}')\nprint('r near 3:')\nfor x in (2.9, 2.99, 3.01, 3.1):\n    print(f'  x = {x:5.2f}  r = {r(x):10.4f}')",
              output: "COMPUTE",
            },
          },
        },
        {
          id: "d-03-e3",
          tier: "advanced",
          title: "Designing the floor",
          prompt:
            "A team must choose a penalty for a server's response time x in milliseconds. Option P1: a flat €0 if x < 300, a flat €50 otherwise. Option P2: the smooth penalty P2(x) = (x − 300)². (a) Classify each penalty at x = 300 using one-sided limits. (b) Compute P2 at 299.9, 300 and 300.1. (c) Explain which penalty a gradient-following optimizer can walk downhill on, and why the other hides a cliff it cannot see.",
          hint: "For P1, ask what the one-sided destinations are. For P2, watch how the output responds to tiny nudges around 300.",
          solution: {
            approach:
              "Run the three-part test on both penalties at 300, then judge each as a walking surface: a gradient-following method needs the output to respond smoothly to input nudges so that small improvements are detectable.",
            steps: [
              { do: "P1 from the left: every x below 300 costs 0.", math: "lim x→300⁻ P1 = 0" },
              { do: "P1 from the right: every x above 300 costs 50.", math: "lim x→300⁺ P1 = 50 ≠ 0 — a jump" },
              { do: "P2 from both sides: the square shrinks to zero.", math: "lim x→300⁻ P2 = lim x→300⁺ P2 = 0 = P2(300) — continuous" },
              { do: "P2's response to nudges.", math: "P2(299.9) = 0.01,   P2(300) = 0,   P2(300.1) = 0.01" },
              { do: "Walking judgement: P1 is flat on both sides of the cliff, so a slope-follower feels nothing to fix until it falls off.", math: "P1: flat at 0 and flat at 50 — no downhill signal near 300" },
            ],
            answer:
              "P1 jumps at 300 (destinations 0 and 50); P2 is continuous there, its outputs nudging by just 0.01 for 0.1 ms nudges. An optimizer can walk P2's bowl to the bottom; on P1 it feels zero slope everywhere near the cliff — the €50 step is invisible until it is landed on.",
            check: {
              code: "def P1(x):\n    return 0 if x < 300 else 50\n\ndef P2(x):\n    return (x - 300) ** 2\n\nfor x in (299.9, 299.99, 300, 300.01, 300.1):\n    print(f'x = {x:7.2f}  P1 = {P1(x):>4}  P2 = {P2(x):.4f}')",
              output: "COMPUTE",
            },
          },
        },
      ],

      quiz: [
        {
          id: "d-03-q1",
          prompt: "Which story is continuous everywhere on the real line?",
          options: ["y = 1/x", "y = (x² − 1)/(x − 1)", "y = x² + 3", "the step that is 0 below 2 and 1 above"],
          correctIndex: 2,
          explanation:
            "The parabola never breaks: every point passes the three-part test. The others fail in the three classic ways: 1/x blows up at 0, the quotient has a hole at 1, and the step jumps at 2.",
        },
        {
          id: "d-03-q2",
          prompt: "Near x = 0, the story y = 1/x:",
          options: [
            "sits calmly at 0",
            "has a hole that can be patched",
            "flees: ever-bigger magnitudes on either side of a wall",
            "approaches 1",
          ],
          correctIndex: 2,
          explanation:
            "1/x near 0 is the blow-up: at x = ±0.001 the story sits at ∓1000. The dashed asymptote is a friendly wall — approachable forever, untouchable, and no patch exists because no destination exists.",
        },
        {
          id: "d-03-q3",
          prompt: "Why does a gradient-following optimizer want a continuous loss?",
          options: [
            "Continuity guarantees the global minimum sits at zero",
            "So a small input nudge gives a small loss nudge — a walkable floor with no hidden cliffs",
            "Because discontinuous functions cannot be computed",
            "It doesn't; jumps train faster",
          ],
          correctIndex: 1,
          explanation:
            "Training walks downhill by tiny nudges. A continuous loss maps small nudges to small responses, so the walker can feel the tilt; a jump hides a cliff it cannot feel coming — the €40 bill from 0.002 GB.",
        },
      ],

      misconceptions: [
        {
          myth: "Continuous means smooth — no corners allowed.",
          why: "Everyday 'continuous' shades into 'flowing', and corners look like interruptions.",
          reality:
            "The corner story y = |x| is continuous everywhere and cornered at zero. Continuity forbids holes, jumps and blow-ups; corners are a slope-machine problem (lesson d-04), not a pen-lifting problem.",
        },
        {
          myth: "A formula undefined at one point breaks the whole story.",
          why: "The word undefined feels contagious.",
          reality:
            "A break is local: (x² − 1)/(x − 1) is broken at exactly one point and perfectly continuous on both sides of it. The checklist is run point by point, and the rest of the path stands.",
        },
        {
          myth: "Curves that shoot off the page are broken.",
          why: "A graph that leaves the viewport looks like something went wrong.",
          reality:
            "An asymptote is a well-behaved wall: the story approaches it ever more closely and never lands. No rule is broken and the pen never lifts — 1/x is continuous at every single point except exactly 0.",
        },
      ],

      takeaways: [
        "Continuity is the no-surprises promise: small input nudges give small output nudges, at every point.",
        "Three honest breaks: the hole (patchable), the jump (two disagreeing destinations), the blow-up (a wall).",
        "The three-part test at a: the value exists, both one-sided limits exist and agree, and value equals limit.",
        "Optimization needs a floor you can stand on — which is why real loss functions are built continuous, with cliffs smoothed away.",
      ],
    },

    // __MORE__
  ],

  // NOTE: pending — the interrupted Math-course authoring task continues in
  // its own follow-up. These placeholders exist only so the project keeps
  // type-checking while Part D's remaining lessons land.
  assessment: {
    questions: [],
  },

  workshop: {
    title: "Part D workshop — pending",
    brief:
      "Placeholder: the Part D workshop (gradient descent explorer) is authored together with the remaining lessons of this part in the follow-up task.",
    requirements: [],
    steps: [],
    starter: "",
    solution: "",
    expectedOutput: "",
    concepts: [],
  },
};
