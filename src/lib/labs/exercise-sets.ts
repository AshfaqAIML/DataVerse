/**
 * Lab exercise sets — authored prompts, starters, hints and teaching notes.
 *
 * Every `expectedOutput` / `expected` value was captured from the real
 * engine (scripts/pyodide-node.ts / scripts/sql-lab-node.ts) — see
 * lab-data.ts for the guarantee.
 */
import type { LabExercise, SqlExercise } from "./lab-data";

/* ============================== Python ============================== */

export const PYTHON_EXERCISES: LabExercise[] = [
  {
    id: "py-receipt",
    title: "Receipt formatter",
    prompt:
      "The shop sold 2 mechanical keyboards at 89.99 each. Store the item name, unit price and quantity in variables, then print three lines: “«item» x«qty»”, “Unit price: «price to 2 decimals»” and “Total: «price × qty to 2 decimals»”.",
    concepts: ["variables", "f-strings", "number formatting"],
    starter: `item = "Mechanical keyboard"
price = 89.99
qty = 2

# print the three receipt lines using an f-string with :.2f for money
`,
    expectedOutput: "Mechanical keyboard x2\nUnit price: 89.99\nTotal: 179.98\n",
    solution: `item = "Mechanical keyboard"
price = 89.99
qty = 2

print(f"{item} x{qty}")
print(f"Unit price: {price:.2f}")
print(f"Total: {price * qty:.2f}")`,
    hint: 'f-strings format money with a format spec: f"{price:.2f}" always shows two decimals.',
    explanation:
      "The `:.2f` format spec renders a float with exactly two decimal places — the convention for money. Multiplication inside the braces is evaluated before formatting.",
    difficulty: "warmup",
  },
  {
    id: "py-celsius",
    title: "Temperature converter",
    prompt:
      "Write a function to_fahrenheit(c) that converts Celsius to Fahrenheit (c * 9 / 5 + 32). Print the conversion of 0, 37 and −40, each rounded to 1 decimal place. The three print calls are already in the starter.",
    concepts: ["functions", "return", "round"],
    starter: `def to_fahrenheit(c):
    # F = C * 9/5 + 32
    pass  # replace with the real return

print(round(to_fahrenheit(0), 1))
print(round(to_fahrenheit(37), 1))
print(round(to_fahrenheit(-40), 1))`,
    expectedOutput: "32.0\n98.6\n-40.0\n",
    solution: `def to_fahrenheit(c):
    return c * 9 / 5 + 32

print(round(to_fahrenheit(0), 1))
print(round(to_fahrenheit(37), 1))
print(round(to_fahrenheit(-40), 1))`,
    hint: "One return line does it: return c * 9 / 5 + 32",
    explanation:
      "−40 is the famous fixed point where Celsius and Fahrenheit agree — a handy sanity check for conversion code. round(x, 1) keeps the output readable without changing the math.",
    difficulty: "warmup",
  },
  {
    id: "py-fizzbuzz",
    title: "FizzBuzz, honestly",
    prompt:
      "Print the numbers 1 to 15, one per line — but multiples of 3 print Fizz, multiples of 5 print Buzz, and multiples of both print FizzBuzz. Test the multiple-of-15 case first.",
    concepts: ["loops", "modulo", "conditionals"],
    starter: `for n in range(1, 16):
    # FizzBuzz logic here — check % 15 first
    pass
`,
    expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
    solution: `for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)`,
    hint: "If you test % 3 before % 15, the number 15 prints “Fizz” and never reaches the combined case.",
    explanation:
      "Order of branches is the whole puzzle: the most specific condition (divisible by both) must come first, or earlier branches shadow it. % gives the remainder — zero means divisible.",
    difficulty: "core",
  },
  {
    id: "py-words",
    title: "Word frequency",
    prompt:
      'Write word_counts(text) returning a dict of lowercase word → count. Run it on "the cat saw the dog and the cat ran" and print each “word count” pair in alphabetical order (word, a space, then the count).',
    concepts: ["dictionaries", "string methods", "sorted"],
    starter: `def word_counts(text):
    counts = {}
    # split, lowercase, tally with counts.get(w, 0) + 1
    return counts

freq = word_counts("the cat saw the dog and the cat ran")
for word in sorted(freq):
    pass  # print word and count`,
    expectedOutput: "and 1\ncat 2\ndog 1\nran 1\nsaw 1\nthe 3\n",
    solution: `def word_counts(text):
    counts = {}
    for w in text.lower().split():
        counts[w] = counts.get(w, 0) + 1
    return counts

freq = word_counts("the cat saw the dog and the cat ran")
for word in sorted(freq):
    print(word, freq[word])`,
    hint: "counts.get(w, 0) + 1 reads “the current count, or 0 if unseen, plus one”. print(a, b) puts a single space between arguments.",
    explanation:
      "dict.get(key, default) is the idiomatic tally — no KeyError on first sight of a word. sorted(freq) iterates the words alphabetically.",
    difficulty: "core",
  },
  {
    id: "py-primes",
    title: "Primes below 50",
    prompt:
      "Write is_prime(n) by trial division (test divisors d while d·d ≤ n), build the list of primes below 50, then print the count of primes followed by the list itself.",
    concepts: ["while loops", "lists", "comprehensions"],
    starter: `def is_prime(n):
    if n < 2:
        return False
    # try divisors d while d*d <= n
    pass

primes = [n for n in range(2, 50) if is_prime(n)]
# print the count, then the list`,
    expectedOutput: "15\n[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]\n",
    solution: `def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

primes = [n for n in range(2, 50) if is_prime(n)]
print(len(primes))
print(primes)`,
    hint: "Only test divisors up to the square root: while d * d <= n. Print len(primes) first, then primes.",
    explanation:
      "If n has a factor larger than √n it must also have one smaller — so testing to √n suffices. The list comprehension filters range(2, 50) through the predicate.",
    difficulty: "stretch",
  },
];

/* ============================== NumPy ============================== */

export const NUMPY_EXERCISES: LabExercise[] = [
  {
    id: "np-anatomy",
    title: "Array anatomy",
    prompt:
      "The sales array is in the starter. Print its shape, its dtype and its size — one per line, in that order.",
    concepts: ["construction", "shape", "dtype"],
    starter: `import numpy as np

sales = np.array([[120, 140, 160], [200, 180, 220], [90, 110, 130], [150, 170, 190]])

# print shape, dtype and size`,
    expectedOutput: "(4, 3)\nint32\n12\n",
    solution: `import numpy as np

sales = np.array([[120, 140, 160], [200, 180, 220], [90, 110, 130], [150, 170, 190]])
print(sales.shape)
print(sales.dtype)
print(sales.size)`,
    hint: "shape is an attribute, not a method: sales.shape — no parentheses.",
    explanation:
      "NumPy picks the smallest dtype that fits: small ints become int32 on this platform. shape is a tuple — (rows, columns) — and size is rows × columns.",
    difficulty: "warmup",
  },
  {
    id: "np-broadcast",
    title: "Broadcast a price change",
    prompt:
      "Apply a 10% rise to every price, then subtract a flat 5. Round each result to 2 decimals with np.round. Print the new prices as a list, then their mean rounded to 3 decimals.",
    concepts: ["vectorized math", "broadcasting", "round"],
    starter: `import numpy as np

prices = np.array([19.99, 42.50, 7.25, 100.00, 63.75])

# risen = np.round(prices * 1.10 - 5, 2)
# print risen.tolist(), then round(float(risen.mean()), 3)`,
    expectedOutput: "[16.99, 41.75, 2.98, 105.0, 65.12]\n46.368\n",
    solution: `import numpy as np

prices = np.array([19.99, 42.50, 7.25, 100.00, 63.75])
risen = np.round(prices * 1.10 - 5, 2)
print(risen.tolist())
print(round(float(risen.mean()), 3))`,
    hint: "The scalars 1.10 and 5 broadcast across the whole array — no loop needed. .tolist() prints clean Python numbers.",
    explanation:
      "Broadcasting applies scalars to every element at C speed. Note 100.00·1.10−5 prints as 105.0 — round changes the value, not the display format.",
    difficulty: "warmup",
  },
  {
    id: "np-slice",
    title: "Slice the matrix",
    prompt:
      "From the 3×4 matrix m of 1..12: print row 1 as a list, the last column as a list, and the 2×2 block at rows 0–1 / columns 1–2 as a nested list.",
    concepts: ["indexing", "slices"],
    starter: `import numpy as np

m = np.arange(1, 13).reshape(3, 4)

# m[1, :]  ·  m[:, -1]  ·  m[:2, 1:3]  — each .tolist()`,
    expectedOutput: "[5, 6, 7, 8]\n[4, 8, 12]\n[[2, 3], [6, 7]]\n",
    solution: `import numpy as np

m = np.arange(1, 13).reshape(3, 4)
print(m[1, :].tolist())
print(m[:, -1].tolist())
print(m[:2, 1:3].tolist())`,
    hint: "The comma separates row and column selectors: m[rows, cols]. Slices are start-inclusive, stop-exclusive.",
    explanation:
      "m[:2, 1:3] reads “rows 0 up to (not including) 2, columns 1 up to 3” — the same rule as list slicing, applied per axis.",
    difficulty: "core",
  },
  {
    id: "np-stats",
    title: "Row statistics",
    prompt:
      "For the temperature vector: print the mean (2dp), the population standard deviation (3dp) and the 0-based index of the hottest day — three lines.",
    concepts: ["aggregations", "argmax"],
    starter: `import numpy as np

temps = np.array([18.5, 21.0, 24.5, 19.0, 25.5, 23.0])

# round(float(temps.mean()), 2) · round(float(temps.std()), 3) · int(temps.argmax())`,
    expectedOutput: "21.92\n2.637\n4\n",
    solution: `import numpy as np

temps = np.array([18.5, 21.0, 24.5, 19.0, 25.5, 23.0])
print(round(float(temps.mean()), 2))
print(round(float(temps.std()), 3))
print(int(temps.argmax()))`,
    hint: ".std() is the population standard deviation (divide by n) — the sample version needs ddof=1.",
    explanation:
      "argmax returns the index, not the value — index 4 is the 25.5 reading. float()/int() conversions keep round() tidy.",
    difficulty: "core",
  },
  {
    id: "np-normalize",
    title: "Z-score normalize",
    prompt:
      "Standardize v to zero mean and unit standard deviation: z = (v − mean) / std. Print z rounded to 4 decimals as a list, then the mean of z rounded to 6 decimals.",
    concepts: ["vectorization", "formulas without loops"],
    starter: `import numpy as np

v = np.array([3.0, 7.0, 11.0, 15.0, 19.0])

# z = (v - v.mean()) / v.std()
# print np.round(z, 4).tolist(), then round(float(z.mean()), 6)`,
    expectedOutput: "[-1.4142, -0.7071, 0.0, 0.7071, 1.4142]\n0.0\n",
    solution: `import numpy as np

v = np.array([3.0, 7.0, 11.0, 15.0, 19.0])
z = (v - v.mean()) / v.std()
print(np.round(z, 4).tolist())
print(round(float(z.mean()), 6))`,
    hint: "v − v.mean() subtracts the scalar mean from every element (broadcasting) — no loop needed.",
    explanation:
      "The result is symmetric around zero — the defining property of z-scores. The mean of z is 0 (up to float rounding) and its std exactly 1.",
    difficulty: "stretch",
  },
];

/* ============================== pandas ============================== */

export const PANDAS_EXERCISES: LabExercise[] = [
  {
    id: "pd-build",
    title: "Build your first DataFrame",
    prompt:
      "The cities DataFrame is in the starter. Print: “«rows» rows, «cols» columns”, then the sum of the revenue column, then the count of each dtype as a dict (df.dtypes.value_counts().to_dict()).",
    concepts: ["construction", "sum", "dtypes"],
    starter: `import pandas as pd

df = pd.DataFrame({
    "city": ["Paris", "Lyon", "Marseille", "Lille", "Nice"],
    "revenue": [120.0, 80.5, 95.25, 60.0, 130.75],
    "staff": [12, 8, 9, 5, 11],
})

# rows & columns (df.shape), revenue sum, dtype counts as a dict`,
    expectedOutput: "5 rows, 3 columns\n486.5\n{dtype('O'): 1, dtype('float64'): 1, dtype('int64'): 1}\n",
    solution: `import pandas as pd

df = pd.DataFrame({
    "city": ["Paris", "Lyon", "Marseille", "Lille", "Nice"],
    "revenue": [120.0, 80.5, 95.25, 60.0, 130.75],
    "staff": [12, 8, 9, 5, 11],
})
print(df.shape[0], "rows,", df.shape[1], "columns")
print(df["revenue"].sum())
print(df.dtypes.value_counts().to_dict())`,
    hint: 'df.shape is (rows, columns). Column selection uses one pair of brackets: df["revenue"].',
    explanation:
      "Each dict key became a column; equal-length lists are required. The dtype census shows one object (strings), one float64 and one int64 column.",
    difficulty: "warmup",
  },
  {
    id: "pd-filter",
    title: "Select and filter",
    prompt:
      'From the orders table: how many rows have status "shipped"? Print that count, then the sum of their totals (2dp), then the ids of orders over 100 that were not cancelled, as a list.',
    concepts: ["boolean masks", "& operator", "column selection"],
    starter: `import pandas as pd

orders = pd.DataFrame({
    "id": [101, 102, 103, 104, 105, 106],
    "customer": ["Ann", "Ben", "Ann", "Cleo", "Ben", "Dara"],
    "status": ["shipped", "pending", "shipped", "cancelled", "shipped", "pending"],
    "total": [250.00, 89.90, 320.50, 45.00, 129.99, 75.25],
})

# shipped count · their total sum (2dp) · ids of (total>100) & (not cancelled)`,
    expectedOutput: "3\n700.49\n[101, 103, 105]\n",
    solution: `import pandas as pd

orders = pd.DataFrame({
    "id": [101, 102, 103, 104, 105, 106],
    "customer": ["Ann", "Ben", "Ann", "Cleo", "Ben", "Dara"],
    "status": ["shipped", "pending", "shipped", "cancelled", "shipped", "pending"],
    "total": [250.00, 89.90, 320.50, 45.00, 129.99, 75.25],
})
shipped = orders[orders["status"] == "shipped"]
print(len(shipped))
print(round(shipped["total"].sum(), 2))
big = orders[(orders["total"] > 100) & (orders["status"] != "cancelled")]
print(big["id"].tolist())`,
    hint: "Combine conditions with & (not and), each comparison wrapped in parentheses: (a) & (b).",
    explanation:
      "A boolean mask selects the True rows. and/or raise ValueError on Series — pandas needs the element-wise & / | with parentheses, because they bind tighter than comparisons.",
    difficulty: "core",
  },
  {
    id: "pd-clean",
    title: "Clean the gaps",
    prompt:
      "The raw table has missing values. Print: the total number of NaNs across the frame, then the price column after filling its NaNs with the price median (as a list), then the total stock after filling NaN stock with 0 (as an int).",
    concepts: ["isna", "fillna", "median"],
    starter: `import pandas as pd

raw = pd.DataFrame({
    "sku": ["A1", "A2", "A3", "A4", "A5"],
    "price": [9.99, None, 14.50, None, 22.00],
    "stock": [10, 0, None, 7, 2],
})

# total NaNs · price filled with its median · stock filled with 0 (sum as int)`,
    expectedOutput: "3\n[9.99, 14.5, 14.5, 14.5, 22.0]\n19\n",
    solution: `import pandas as pd

raw = pd.DataFrame({
    "sku": ["A1", "A2", "A3", "A4", "A5"],
    "price": [9.99, None, 14.50, None, 22.00],
    "stock": [10, 0, None, 7, 2],
})
print(int(raw.isna().sum().sum()))
filled = raw.assign(price=raw["price"].fillna(raw["price"].median()), stock=raw["stock"].fillna(0))
print(filled["price"].tolist())
print(int(filled["stock"].sum()))`,
    hint: "raw.isna().sum() gives NaNs per column; .sum() again totals them. fillna accepts a computed value like the median.",
    explanation:
      "Median (14.5) is a safer gap-filler than mean when data is skewed — it resists outliers. fillna returns a new Series; assign stitches the cleaned columns back into a copy.",
    difficulty: "core",
  },
  {
    id: "pd-group",
    title: "Group and aggregate",
    prompt:
      "Group regions and sum sales & units. Print the North sales total, then the units per region as a dict ordered by units descending.",
    concepts: ["groupby", "sum", "sort_values"],
    starter: `import pandas as pd

regions = pd.DataFrame({
    "region": ["North", "South", "North", "East", "South", "East", "North"],
    "sales": [200, 150, 300, 120, 180, 90, 250],
    "units": [10, 8, 15, 6, 9, 4, 12],
})

# North sales total · units per region sorted descending as a dict`,
    expectedOutput: "750\n{'North': 37, 'South': 17, 'East': 10}\n",
    solution: `import pandas as pd

regions = pd.DataFrame({
    "region": ["North", "South", "North", "East", "South", "East", "North"],
    "sales": [200, 150, 300, 120, 180, 90, 250],
    "units": [10, 8, 15, 6, 9, 4, 12],
})
g = regions.groupby("region")[["sales", "units"]].sum()
print(g.loc["North", "sales"])
print(g["units"].sort_values(ascending=False).to_dict())`,
    hint: 'g.loc["North", "sales"] reads one cell of the grouped result; sort the units column before .to_dict().',
    explanation:
      "groupby splits rows by key, applies the aggregate per group, and stitches the results back — the split-apply-combine pattern behind most business reporting.",
    difficulty: "stretch",
  },
  {
    id: "pd-merge",
    title: "Merge orders with customers",
    prompt:
      'Left-merge orders2 with customers on customer_id (how="left"). Print the customer names in row order (as a list), then total spend per tier as a dict.',
    concepts: ["merge", "left join", "groupby after join"],
    starter: `import pandas as pd

orders2 = pd.DataFrame({
    "order_id": [1, 2, 3, 4],
    "customer_id": [10, 11, 10, 12],
    "total": [120.0, 80.0, 60.0, 200.0],
})
customers = pd.DataFrame({
    "customer_id": [10, 11, 12],
    "name": ["Ann", "Ben", "Cleo"],
    "tier": ["gold", "silver", "gold"],
})

# merge on customer_id (how="left"), print names then tier totals`,
    expectedOutput: "['Ann', 'Ben', 'Ann', 'Cleo']\n{'gold': 380.0, 'silver': 80.0}\n",
    solution: `import pandas as pd

orders2 = pd.DataFrame({
    "order_id": [1, 2, 3, 4],
    "customer_id": [10, 11, 10, 12],
    "total": [120.0, 80.0, 60.0, 200.0],
})
customers = pd.DataFrame({
    "customer_id": [10, 11, 12],
    "name": ["Ann", "Ben", "Cleo"],
    "tier": ["gold", "silver", "gold"],
})
merged = orders2.merge(customers, on="customer_id", how="left")
print(merged["name"].tolist())
print(merged.groupby("tier")["total"].sum().to_dict())`,
    hint: 'orders2.merge(customers, on="customer_id", how="left") — the LEFT table is the one you call .merge on.',
    explanation:
      "A left join keeps every order and pulls in matching customer attributes — exactly SQL's LEFT JOIN. Ann appears twice because she has two orders; fan-out is the join's contract.",
    difficulty: "stretch",
  },
];

/* ============================ Statistics ============================ */

export const STATS_EXERCISES: LabExercise[] = [
  {
    id: "st-centre",
    title: "Centre and spread",
    prompt:
      "For the data [4, 8, 15, 16, 23, 42]: print the mean, the median, the sample standard deviation (3dp) and the sample variance (2dp) — using the statistics module.",
    concepts: ["mean", "median", "stdev", "variance"],
    starter: `import statistics

data = [4, 8, 15, 16, 23, 42]

# mean · median · round(stdev, 3) · round(variance, 2)`,
    expectedOutput: "18\n15.5\n13.491\n182\n",
    solution: `import statistics

data = [4, 8, 15, 16, 23, 42]
print(statistics.mean(data))
print(statistics.median(data))
print(round(statistics.stdev(data), 3))
print(round(statistics.variance(data), 2))`,
    hint: "statistics.stdev is the SAMPLE standard deviation (n−1); statistics.pstdev is the population one.",
    explanation:
      "The mean (18) sits above the median (15.5) — the 42 outlier drags it. stdev² = variance: 13.491² ≈ 182.",
    difficulty: "warmup",
  },
  {
    id: "st-normal",
    title: "The normal curve",
    prompt:
      "Scores are N(100, 15). Using NormalDist, print: P(X ≤ 115) rounded to 4dp, the 97.5th percentile rounded to 4dp, and P(70 ≤ X ≤ 130) rounded to 4dp — computing the band from raw values.",
    concepts: ["NormalDist", "cdf", "inv_cdf"],
    starter: `from statistics import NormalDist

nd = NormalDist(mu=100, sigma=15)

# round(nd.cdf(115), 4) · round(nd.inv_cdf(0.975), 4) · round(nd.cdf(130) - nd.cdf(70), 4)`,
    expectedOutput: "0.8413\n129.3995\n0.9545\n",
    solution: `from statistics import NormalDist

nd = NormalDist(mu=100, sigma=15)
print(round(nd.cdf(115), 4))
print(round(nd.inv_cdf(0.975), 4))
print(round(nd.cdf(130) - nd.cdf(70), 4))`,
    hint: "cdf takes a RAW value (it subtracts the mean internally) — cdf(115) is the z=1 case, not z=115.",
    explanation:
      "cdf(130) − cdf(70) is the probability of landing within two standard deviations: 0.9545 — the 95% of the empirical rule. inv_cdf is its mirror: from probability back to value.",
    difficulty: "core",
  },
  {
    id: "st-ttest",
    title: "A one-sample t-test",
    prompt:
      "A machine claims a 100.0 ml mean fill; the sample is in the starter. Run stats.ttest_1samp against 100.0 and print the t statistic (4dp), the p-value (4dp), then whether the p-value is above 0.05 (True/False).",
    concepts: ["hypothesis testing", "t-test", "p-value"],
    starter: `from scipy import stats

sample = [102.5, 98.0, 101.5, 99.5, 103.0, 100.5, 97.5]

# t_stat, p_val = stats.ttest_1samp(sample, popmean=100.0)
# print rounded values, then bool(p_val > 0.05)`,
    expectedOutput: "0.4425\n0.6736\nTrue\n",
    solution: `from scipy import stats

sample = [102.5, 98.0, 101.5, 99.5, 103.0, 100.5, 97.5]
t_stat, p_val = stats.ttest_1samp(sample, popmean=100.0)
print(round(float(t_stat), 4))
print(round(float(p_val), 4))
print(bool(p_val > 0.05))`,
    hint: "ttest_1samp returns a named tuple — unpack t and p, wrap in float() before round.",
    explanation:
      "p = 0.67 is far above 0.05: the sample is consistent with the 100 ml claim — we do NOT reject the null. A small t (0.44) says the sample mean is less than half a standard error from 100.",
    difficulty: "core",
  },
  {
    id: "st-corr",
    title: "Correlation",
    prompt:
      "Study hours and scores are in the starter. Print Pearson r (4dp) and r² (4dp) — use stats.pearsonr.",
    concepts: ["pearsonr", "r-squared"],
    starter: `from scipy import stats

study = [2, 4, 6, 8, 10]
score = [55, 62, 70, 75, 90]

# r, p = stats.pearsonr(study, score)
# print round(float(r), 4), then round(float(r) ** 2, 4)`,
    expectedOutput: "0.9828\n0.9659\n",
    solution: `from scipy import stats

study = [2, 4, 6, 8, 10]
score = [55, 62, 70, 75, 90]
r, p = stats.pearsonr(study, score)
print(round(float(r), 4))
print(round(float(r) ** 2, 4))`,
    hint: "pearsonr returns (statistic, pvalue) — square the statistic for r².",
    explanation:
      "r = 0.98 is a near-perfect positive linear relationship; r² = 0.966 reads “about 97% of the score variance tracks study hours” — the coefficient of determination.",
    difficulty: "core",
  },
  {
    id: "st-ci",
    title: "A 95% confidence interval",
    prompt:
      "For the prices array: print the sample mean (3dp), then the 95% CI bounds as “low high” (both 3dp) using the t distribution (df = n − 1): mean ± t·SEM.",
    concepts: ["standard error", "t critical value", "confidence interval"],
    starter: `import numpy as np
from scipy import stats

prices = np.array([12.5, 13.2, 11.8, 12.9, 13.05, 12.4])
n = len(prices)

# sem = prices.std(ddof=1) / np.sqrt(n)
# t_crit = stats.t.ppf(0.975, df=n - 1)
# print mean (3dp), then lo hi (both 3dp, space-separated)`,
    expectedOutput: "12.642\n12.1 13.183\n",
    solution: `import numpy as np
from scipy import stats

prices = np.array([12.5, 13.2, 11.8, 12.9, 13.05, 12.4])
n = len(prices)
sem = prices.std(ddof=1) / np.sqrt(n)
t_crit = stats.t.ppf(0.975, df=n - 1)
lo = prices.mean() - t_crit * sem
hi = prices.mean() + t_crit * sem
print(round(float(prices.mean()), 3))
print(round(float(lo), 3), round(float(hi), 3))`,
    hint: "The standard error is the sample std (ddof=1!) over √n. t.ppf(0.975, df) is the two-sided 95% critical value.",
    explanation:
      "The interval [12.10, 13.18] is a plausible range for the true mean price. Small samples use t (fatter tails) instead of the normal — with n = 6 that correction is real.",
    difficulty: "stretch",
  },
];

/* ========================= Machine Learning ========================= */

export const ML_EXERCISES: LabExercise[] = [
  {
    id: "ml-line",
    title: "Fit a line",
    prompt:
      "Fit LinearRegression on the fixed X and y from the starter. Print the learned slope (3dp), intercept (3dp) and the prediction for x = 10 (3dp).",
    concepts: ["LinearRegression", "coef_", "predict"],
    starter: `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([2.1, 3.9, 6.2, 8.0, 9.8, 12.1])

# fit, then print coef_[0], intercept_ and predict([[10]]) — all 3dp`,
    expectedOutput: "1.986\n0.067\n19.924\n",
    solution: `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3], [4], [5], [6]])
y = np.array([2.1, 3.9, 6.2, 8.0, 9.8, 12.1])
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 3))
print(round(float(model.intercept_), 3))
print(round(float(model.predict(np.array([[10]]))[0]), 3))`,
    hint: "X must be 2-D (a column of rows); y is 1-D. model.coef_ is an array — take [0].",
    explanation:
      "The true relation is y ≈ 2x + noise; the estimator recovers slope 1.99 and intercept 0.07 — ordinary least squares averages the noise away.",
    difficulty: "warmup",
  },
  {
    id: "ml-kmeans",
    title: "Two clusters, no labels",
    prompt:
      "Run KMeans (k=2, n_init=10, random_state=0) on the six fixed points. Print the label list, then the cluster centers rounded to 2dp as nested lists.",
    concepts: ["KMeans", "labels_", "cluster_centers_"],
    starter: `import numpy as np
from sklearn.cluster import KMeans

pts = np.array([[0, 0], [0.5, 0], [0, 0.5], [10, 10], [10.5, 10], [10, 10.5]])

# km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(pts)
# print km.labels_.tolist(), then np.round(km.cluster_centers_, 2).tolist()`,
    expectedOutput: "[1, 1, 1, 0, 0, 0]\n[[10.17, 10.17], [0.17, 0.17]]\n",
    solution: `import numpy as np
from sklearn.cluster import KMeans

pts = np.array([[0, 0], [0.5, 0], [0, 0.5], [10, 10], [10.5, 10], [10, 10.5]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(pts)
print(km.labels_.tolist())
print(np.round(km.cluster_centers_, 2).tolist())`,
    hint: "Fix random_state=0 or the run (and the expected output) changes. Labels are arbitrary — 0/1 names carry no meaning.",
    explanation:
      "KMeans found the two obvious blobs. Label numbering is arbitrary (swap it and it is the same clustering); the centers are each blob's mean point.",
    difficulty: "core",
  },
  {
    id: "ml-split",
    title: "A fair split",
    prompt:
      "Split X and y into train/test (25% test, random_state=42). Print the test X values as a flat list, then the train size.",
    concepts: ["train_test_split", "random_state"],
    starter: `import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(20).reshape(-1, 1)
y = np.arange(20) * 2 + 1

# train_test_split(X, y, test_size=0.25, random_state=42)
# print X_te.ravel().tolist(), then len(X_tr)`,
    expectedOutput: "[0, 17, 15, 1, 8]\n15\n",
    solution: `import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(20).reshape(-1, 1)
y = np.arange(20) * 2 + 1
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)
print(X_te.ravel().tolist())
print(len(X_tr))`,
    hint: "reshape(-1, 1) makes the 20 numbers a 20×1 matrix. 25% of 20 = 5 test rows.",
    explanation:
      "The split is a random shuffle with a fixed seed — exactly 5 test indices, 15 train rows. The same random_state always yields the same split; that is what makes results reproducible.",
    difficulty: "core",
  },
  {
    id: "ml-knn",
    title: "K-Nearest Neighbors",
    prompt:
      'Train KNeighborsClassifier(n_neighbors=3) on the labelled points. Predict the class of [1.1, 1.0] and [4.1, 4.0] (print as a list), then the probability of class A for [1.1, 1.0] (3dp).',
    concepts: ["KNeighborsClassifier", "predict", "predict_proba"],
    starter: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

train_X = np.array([[1, 1], [1.2, 0.8], [0.8, 1.2], [4, 4], [4.2, 3.9], [3.9, 4.1]])
train_y = np.array(["A", "A", "A", "B", "B", "B"])

# fit, predict both query points (tolist), then predict_proba of [1.1, 1.0], column 0, 3dp`,
    expectedOutput: "['A', 'B']\n1.0\n",
    solution: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier

train_X = np.array([[1, 1], [1.2, 0.8], [0.8, 1.2], [4, 4], [4.2, 3.9], [3.9, 4.1]])
train_y = np.array(["A", "A", "A", "B", "B", "B"])
knn = KNeighborsClassifier(n_neighbors=3).fit(train_X, train_y)
print(knn.predict(np.array([[1.1, 1.0], [4.1, 4.0]])).tolist())
print(round(float(knn.predict_proba(np.array([[1.1, 1.0]]))[0][0]), 3))`,
    hint: "predict takes a 2-D array of query points. predict_proba columns follow the class order (knn.classes_).",
    explanation:
      "[1.1, 1.0] has all three A points as its nearest neighbors — probability 1.0. k = 3 with a clean gap makes the vote unanimous.",
    difficulty: "core",
  },
  {
    id: "ml-tree",
    title: "A decision tree, measured honestly",
    prompt:
      "Fit DecisionTreeClassifier(max_depth=2, random_state=0) on the fixed points, predict on the training data, and print the accuracy score followed by the prediction list. (Yes — training accuracy; name it for what it is.)",
    concepts: ["DecisionTree", "accuracy_score", "train vs test"],
    starter: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X = np.array([[2, 2], [2.5, 1.5], [1.5, 2.5], [7, 7], [7.5, 6.5], [6.5, 7.5], [2.2, 2.1], [7.2, 7.3]])
y = np.array([0, 0, 0, 1, 1, 1, 0, 1])

# fit, predict on X, print accuracy_score(y, preds), then preds.tolist()`,
    expectedOutput: "1.0\n[0, 0, 0, 1, 1, 1, 0, 1]\n",
    solution: `import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X = np.array([[2, 2], [2.5, 1.5], [1.5, 2.5], [7, 7], [7.5, 6.5], [6.5, 7.5], [2.2, 2.1], [7.2, 7.3]])
y = np.array([0, 0, 0, 1, 1, 1, 0, 1])
tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, y)
preds = tree.predict(X)
print(accuracy_score(y, preds))
print(preds.tolist())`,
    hint: "This is training accuracy — the model saw these exact points. Depth 2 carves the plane into at most 4 boxes.",
    explanation:
      "100% train accuracy on a separable set is expected, not impressive — the honest test is unseen data (that is what the split exercise is for).",
    difficulty: "stretch",
  },
];

/* ======================= Data Visualization ======================== */

export const DATAVIZ_EXERCISES: LabExercise[] = [
  {
    id: "viz-line",
    title: "Your first line chart",
    prompt:
      "Plot months vs revenue as a line with markers (figsize 6×3.5), title “Monthly revenue (thousands)”, x-label “Month”, y-label “Revenue”. Then print the best month name and the growth (last − first, 1dp). The figure renders automatically — do not call plt.show().",
    concepts: ["plot", "markers", "titles"],
    starter: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
revenue = [12.5, 14.2, 13.8, 16.0, 18.4, 19.1]

fig, ax = plt.subplots(figsize=(6, 3.5))
# line + markers, title, labels

print("max month:", months[revenue.index(max(revenue))])
print("growth:", round(revenue[-1] - revenue[0], 1))`,
    expectedOutput: "max month: Jun\ngrowth: 6.6\n",
    solution: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
revenue = [12.5, 14.2, 13.8, 16.0, 18.4, 19.1]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.plot(months, revenue, marker="o", linewidth=2)
ax.set_title("Monthly revenue (thousands)")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue")

print("max month:", months[revenue.index(max(revenue))])
print("growth:", round(revenue[-1] - revenue[0], 1))`,
    hint: 'ax.plot(x, y, marker="o") draws the line; ax.set_title / ax.set_xlabel / ax.set_ylabel label it.',
    explanation:
      "Every line chart needs three honest labels: what, x and y. The runner exports every open figure after your code finishes — so build the figure and skip plt.show().",
    difficulty: "warmup",
  },
  {
    id: "viz-bar",
    title: "Bars of category totals",
    prompt:
      'Draw a bar chart of the three categories with the given colors, title “Sales by category”, and a value label above each bar. Print the total (as “total: N”) and the top category name (as “top: name”).',
    concepts: ["bar", "value labels", "color"],
    starter: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

cats = ["Laptops", "Audio", "Wearables"]
sales = [420, 260, 180]

fig, ax = plt.subplots(figsize=(6, 3.5))
# bars with the three colors, title, value labels via ax.text

print("total:", sum(sales))
print("top:", cats[sales.index(max(sales))])`,
    expectedOutput: "total: 860\ntop: Laptops\n",
    solution: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

cats = ["Laptops", "Audio", "Wearables"]
sales = [420, 260, 180]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.bar(cats, sales, color=["#4A4CC2", "#7C5CC4", "#2D62C8"])
ax.set_title("Sales by category")
for i, v in enumerate(sales):
    ax.text(i, v + 6, str(v), ha="center", fontsize=10)

print("total:", sum(sales))
print("top:", cats[sales.index(max(sales))])`,
    hint: 'ax.text(x, y, text, ha="center") places a label; y = v + 6 lifts it just above each bar.',
    explanation:
      "Value labels remove the need for gridline squinting. Placing text at v + 6 (a nudge above the bar) is the standard trick — use ~2% of your max value on other datasets.",
    difficulty: "core",
  },
  {
    id: "viz-hist",
    title: "Histogram of a distribution",
    prompt:
      'Histogram the 18 scores into 6 bins (color #7C5CC4, white edges), title “Distribution of scores”, labels “Score” / “Count”. Print “bins chosen: 6” and the median (as “median: value”).',
    concepts: ["hist", "bins", "distribution shape"],
    starter: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

values = [62, 65, 67, 68, 70, 71, 71, 73, 74, 74, 75, 76, 78, 79, 82, 85, 88, 91]

fig, ax = plt.subplots(figsize=(6, 3.5))
# hist with bins=6, color, edgecolor="white"; title + labels

s = sorted(values)
print("bins chosen: 6")
print("median:", (s[8] + s[9]) / 2)`,
    expectedOutput: "bins chosen: 6\nmedian: 74.0\n",
    solution: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

values = [62, 65, 67, 68, 70, 71, 71, 73, 74, 74, 75, 76, 78, 79, 82, 85, 88, 91]

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.hist(values, bins=6, color="#7C5CC4", edgecolor="white")
ax.set_title("Distribution of scores")
ax.set_xlabel("Score")
ax.set_ylabel("Count")

s = sorted(values)
print("bins chosen: 6")
print("median:", (s[8] + s[9]) / 2)`,
    hint: 'ax.hist(values, bins=6, edgecolor="white") — white edges separate bars visually. For 18 values, indices 8 and 9 are the middle pair.',
    explanation:
      "The shape is the story: a gentle right skew (a couple of very high scores). Bin count is a judgement call — too few hides structure, too many shows noise.",
    difficulty: "core",
  },
  {
    id: "viz-scatter",
    title: "Scatter with a trend line",
    prompt:
      'Scatter xs/ys labelled “observed”, then draw the linear trend as a dashed line labelled “trend” (np.polyfit degree 1). Title “Miles vs fare”, add a legend. Print the slope then the intercept (3dp).',
    concepts: ["scatter", "polyfit", "legend"],
    starter: `import numpy as np
import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

xs = np.array([1, 2, 3, 4, 5, 6, 7, 8])
ys = np.array([1.9, 4.1, 5.8, 8.2, 10.1, 11.7, 14.3, 15.8])

fig, ax = plt.subplots(figsize=(6, 3.5))
# scatter + dashed trend from np.polyfit(xs, ys, 1); legend

coef = np.polyfit(xs, ys, 1)
print("slope:", round(float(coef[0]), 3))
print("intercept:", round(float(coef[1]), 3))`,
    expectedOutput: "slope: 1.999\nintercept: -0.007\n",
    solution: `import numpy as np
import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

xs = np.array([1, 2, 3, 4, 5, 6, 7, 8])
ys = np.array([1.9, 4.1, 5.8, 8.2, 10.1, 11.7, 14.3, 15.8])

fig, ax = plt.subplots(figsize=(6, 3.5))
coef = np.polyfit(xs, ys, 1)
ax.scatter(xs, ys, label="observed")
ax.plot(xs, np.polyval(coef, xs), linestyle="--", label="trend")
ax.set_title("Miles vs fare")
ax.legend()

print("slope:", round(float(coef[0]), 3))
print("intercept:", round(float(coef[1]), 3))`,
    hint: "np.polyfit(xs, ys, 1) returns [slope, intercept]; ax.legend() reads the label= arguments.",
    explanation:
      "Slope ≈ 2 with intercept ≈ 0 — a 2-per-mile rate with essentially no base fare. The dashed trend over the scatter makes the fit visible at a glance.",
    difficulty: "stretch",
  },
  {
    id: "viz-panel",
    title: "A two-panel figure",
    prompt:
      'Create a 1×2 subplot figure (figsize 8×3.5): left panel bars of yearly profits titled “Profit”; right panel a pie of [45, 30, 25] labelled A/B/C with autopct “%1.0f%%”, titled “Mix”. Print “panels: 2” and the best year (as “best year: N”).',
    concepts: ["subplots", "pie", "composition"],
    starter: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

years = [2021, 2022, 2023, 2024]
profits = [3.2, 4.1, 3.9, 5.0]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 3.5))
# ax1: bars of profits, title "Profit"
# ax2: pie([45, 30, 25], labels=["A", "B", "C"], autopct="%1.0f%%"), title "Mix"

print("panels: 2")
print("best year:", years[profits.index(max(profits))])`,
    expectedOutput: "panels: 2\nbest year: 2024\n",
    solution: `import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt

years = [2021, 2022, 2023, 2024]
profits = [3.2, 4.1, 3.9, 5.0]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 3.5))
ax1.bar(years, profits)
ax1.set_title("Profit")
ax2.pie([45, 30, 25], labels=["A", "B", "C"], autopct="%1.0f%%")
ax2.set_title("Mix")

print("panels: 2")
print("best year:", years[profits.index(max(profits))])`,
    hint: "plt.subplots(1, 2) returns a figure and a PAIR of axes — unpack with (ax1, ax2).",
    explanation:
      "Panels share a figure so they export as one image and can be compared eye-to-eye. Bars for time series, pie for composition — each panel keeps its own honest encoding.",
    difficulty: "stretch",
  },
];

/* ============================== SQL =============================== */
/* Expected tables captured through PGlite against the ecommerce dataset. */

export const SQL_CHALLENGES: SqlExercise[] = [
  {
    id: "sql-first-look",
    title: "First look at the catalog",
    prompt:
      "List every product's name and price from the products table, cheapest first. Return exactly the columns name and price, in that order.",
    concepts: ["SELECT", "ORDER BY"],
    starter: "-- Which products are on sale, and for how much?\nSELECT ",
    solution: "SELECT name, price\nFROM products\nORDER BY price ASC;",
    hint: "ORDER BY price — ASC is the default but writing it makes intent clear.",
    explanation:
      "28 products, cheapest (MoodLight Strip, 29.00) first. ORDER BY applies to the whole result — there is no “default” order without it; the engine is free to return rows in any order.",
    difficulty: "warmup",
    expected: {
      columns: ["name", "price"],
      rowCount: 28,
      rows: [
        ["MoodLight Strip 5m", "29.00"], ["SmartPlug 4-Pack", "39.00"], ["FlexStand Aluminum Dock", "49.00"],
        ["ChargeHub 100W GaN", "59.00"], ["ProPad Elite Controller", "69.00"], ["TravelPod Tripod Kit", "79.00"],
        ["TrailBack 25L Backpack", "79.00"], ["BassStation Mini Speaker", "89.00"], ["HomeEye Indoor Camera", "89.00"],
        ["PulseFit SE Tracker", "99.00"], ["WaveRider Waterproof Buds", "129.00"], ["SoundCore Lite Earbuds", "129.00"],
        ["Guardian Hub v2", "149.00"], ["StudioMic Pro USB", "179.00"], ["InkReader 7 E-ink", "189.00"],
        ["SoundCore ANC Headphones", "249.00"], ["Optiq 50mm Prime Lens", "299.00"], ["RacingWheel GT Set", "299.00"],
        ["PulseFit 5 Smartwatch", "329.00"], ["BudgetBook 11 Everyday", "399.00"], ["Altitude GPS Watch", "449.00"],
        ["GameStation 5 Console", "549.00"], ["TabSlate 11 Tablet", "649.00"], ["WorkMate 15 Business", "899.00"],
        ["AeroBook 14 Laptop", "1299.00"], ["Zenith X20 Mirrorless", "1499.00"], ["AeroBook 16 Pro Laptop", "2199.00"],
        ["StudioBook X Creator", "2499.00"],
      ],
    },
  },
  {
    id: "sql-filter-sort",
    title: "Affordable audio, alphabetically",
    prompt:
      "Show name, price and stock of products that cost strictly less than 80.00, ordered by name ascending.",
    concepts: ["WHERE", "ORDER BY"],
    starter: "-- Filter with WHERE, order with ORDER BY\nSELECT ",
    solution: "SELECT name, price, stock\nFROM products\nWHERE price < 80.00\nORDER BY name;",
    hint: "WHERE price < 80.00 comes before ORDER BY name.",
    explanation:
      "7 products under 80.00. The clause order is fixed by SQL's grammar: FROM → WHERE → ORDER BY, no matter how you write them.",
    difficulty: "warmup",
    expected: {
      columns: ["name", "price", "stock"],
      rowCount: 7,
      rows: [
        ["ChargeHub 100W GaN", "59.00", 90], ["FlexStand Aluminum Dock", "49.00", 36], ["MoodLight Strip 5m", "29.00", 75],
        ["ProPad Elite Controller", "69.00", 70], ["SmartPlug 4-Pack", "39.00", 120], ["TrailBack 25L Backpack", "79.00", 44],
        ["TravelPod Tripod Kit", "79.00", 42],
      ],
    },
  },
  {
    id: "sql-category-agg",
    title: "Products and average price by category",
    prompt:
      "Join products to categories and report each category's name (as category) with the number of products (product_count) and the average price rounded to 2 decimals (avg_price). Order by product_count descending, then category name.",
    concepts: ["JOIN", "GROUP BY", "aggregates"],
    starter: "-- JOIN, GROUP BY, aggregate\nSELECT ",
    solution:
      "SELECT c.name AS category, COUNT(*) AS product_count, ROUND(AVG(p.price), 2) AS avg_price\nFROM products p\nJOIN categories c ON c.category_id = p.category_id\nGROUP BY c.name\nORDER BY product_count DESC, category;",
    hint: "JOIN categories c ON c.category_id = p.category_id, then GROUP BY c.name.",
    explanation:
      "Audio and Laptops tie at 5 products each — the second ORDER BY key (category name) breaks the tie alphabetically. ROUND(AVG(...), 2) keeps money readable.",
    difficulty: "core",
    expected: {
      columns: ["category", "product_count", "avg_price"],
      rowCount: 8,
      rows: [
        ["Audio", 5, "155.00"], ["Laptops", 5, "1459.00"], ["Smart Home", 4, "76.50"],
        ["Accessories", 3, "62.33"], ["Gaming", 3, "305.67"], ["Photography", 3, "625.67"],
        ["Wearables", 3, "292.33"], ["Tablets", 2, "419.00"],
      ],
    },
  },
  {
    id: "sql-big-spenders",
    title: "Customers who spent the most",
    prompt:
      "From orders, find customers whose total spend across all their orders exceeds 500. Return customer_id and the sum as total_spent, highest first. Only count orders that were NOT cancelled.",
    concepts: ["GROUP BY", "HAVING", "filtering groups"],
    starter: "-- WHERE filters rows; HAVING filters groups\nSELECT ",
    solution:
      "SELECT customer_id, SUM(total) AS total_spent\nFROM orders\nWHERE status <> 'cancelled'\nGROUP BY customer_id\nHAVING SUM(total) > 500\nORDER BY total_spent DESC;",
    hint: "WHERE status <> 'cancelled' first, then GROUP BY customer_id, then HAVING SUM(total) > 500.",
    explanation:
      "13 customers clear the 500 bar; customer 11 leads with 3396.00. WHERE runs before grouping, so cancelled orders never enter the sums.",
    difficulty: "core",
    expected: {
      columns: ["customer_id", "total_spent"],
      rowCount: 13,
      rows: [
        [11, "3396.00"], [12, "2817.00"], [6, "2535.00"],
        [10, "2347.00"], [7, "2297.00"], [2, "2125.00"],
        [14, "2047.00"], [1, "1644.00"], [5, "1176.00"],
        [13, "1077.00"], [9, "967.00"], [8, "718.00"],
        [3, "667.00"],
      ],
    },
  },
  {
    id: "sql-monthly-revenue",
    title: "Revenue by month",
    prompt:
      "For every month present in orders, show the month (as month, formatted YYYY-MM) and the revenue (sum of total as revenue) from non-cancelled orders. Order chronologically.",
    concepts: ["date formatting", "GROUP BY expressions"],
    starter: "-- to_char(order_date, 'YYYY-MM') groups rows into months\nSELECT ",
    solution:
      "SELECT to_char(order_date, 'YYYY-MM') AS month, SUM(total) AS revenue\nFROM orders\nWHERE status <> 'cancelled'\nGROUP BY 1\nORDER BY 1;",
    hint: "GROUP BY to_char(order_date, 'YYYY-MM') — or GROUP BY 1 as a shorthand for the first output column.",
    explanation:
      "30 months of history, March 2024 the biggest at 2034.00. Grouping by an expression (not just a column) is the standard time-bucketing move.",
    difficulty: "stretch",
    expected: {
      columns: ["month", "revenue"],
      rowCount: 30,
      rows: [
        ["2024-03", "2034.00"], ["2024-04", "129.00"], ["2024-05", "1037.00"],
        ["2024-06", "249.00"], ["2024-07", "2217.00"], ["2024-08", "738.00"],
        ["2024-09", "1047.00"], ["2024-10", "79.00"], ["2024-11", "717.00"],
        ["2024-12", "978.00"], ["2025-01", "308.00"], ["2025-02", "2537.00"],
        ["2025-03", "129.00"], ["2025-04", "1499.00"], ["2025-05", "59.00"],
        ["2025-06", "2127.00"], ["2025-07", "99.00"], ["2025-08", "157.00"],
        ["2025-09", "179.00"], ["2025-10", "129.00"], ["2025-11", "747.00"],
        ["2026-01", "89.00"], ["2026-02", "2199.00"], ["2026-03", "49.00"],
        ["2026-05", "1798.00"], ["2026-07", "129.00"], ["2026-08", "29.00"],
        ["2026-09", "549.00"], ["2026-10", "2499.00"], ["2026-11", "288.00"],
      ],
    },
  },
  {
    id: "sql-null-phone",
    title: "Who to call (and who not to)",
    prompt:
      "Count the customers whose phone is NULL versus those with a phone, in one row: two columns, with_phone and without_phone.",
    concepts: ["COUNT vs COUNT(*)", "NULL semantics"],
    starter: "-- COUNT(column) skips NULLs; COUNT(*) does not\nSELECT ",
    solution:
      "SELECT\n  COUNT(phone) AS with_phone,\n  COUNT(*) - COUNT(phone) AS without_phone\nFROM customers;",
    hint: "COUNT(phone) counts non-null phones only — the difference with COUNT(*) is the NULL crowd.",
    explanation:
      "16 customers share a phone number, 4 opted out. NULL is not a value — COUNT(column) quietly skips it, which is exactly the behaviour this puzzle exploits.",
    difficulty: "stretch",
    expected: {
      columns: ["with_phone", "without_phone"],
      rowCount: 1,
      rows: [
[16, 4],
      ],
    },
  },
];
