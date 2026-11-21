/**
 * SCHOOL A — PROGRAMMING placement banks.
 *
 * Exactly 10 questions per subject (python, sql, git-github,
 * jupyter-notebook, programming-fundamentals), keyed by subject slug.
 * The mix per bank is 3 recall / 4 applied / 3 judgment, and every question
 * tests what the corresponding course actually teaches.
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

export const schoolAPlacement: PlacementBank = {
  python: [
    q(
      "python-p1",
      "Which built-in Python sequence is immutable — its contents cannot change after creation?",
      [
        "list",
        "dict",
        "tuple",
        "set",
      ],
      2,
      "Tuples are fixed once created; lists, dicts, and sets are mutable. Immutability makes tuples the standard container for fixed records."
    ),
    q(
      "python-p2",
      "In Python, a function that produces values lazily, one at a time, using yield instead of return, is called:",
      [
        "A recursive function",
        "A generator function",
        "A lambda function",
        "A class method",
      ],
      1,
      "yield pauses the function and hands out one value per request, letting you process sequences that would never fit in memory at once."
    ),
    q(
      "python-p3",
      "As taught in the course, the purpose of a try/except block is to:",
      [
        "Make programs run faster by skipping error handling",
        "Catch expected runtime failures and handle them gracefully instead of crashing",
        "Prevent syntax errors at import time",
        "Silence all output from a program",
      ],
      1,
      "try/except handles expected exceptions — bad input, missing files — so the program fails politely and continues where it makes sense."
    ),
    q(
      "python-p4",
      "Given nums = [10, 20, 30, 40, 50], what does nums[1:4] evaluate to?",
      [
        "[10, 20, 30]",
        "[20, 30, 40]",
        "[20, 30, 40, 50]",
        "[10, 20, 30, 40]",
      ],
      1,
      "Slices are start-inclusive and stop-exclusive: indexes 1 through 3 give 20, 30, 40. The 50 at index 4 is excluded."
    ),
    q(
      "python-p5",
      "You are counting word frequencies into a plain dictionary. Which line correctly increments a count, creating the key on first sight?",
      [
        "counts[w] = counts[w] + 1, with no check that the key exists",
        "counts.get(w) += 1",
        "counts = counts + w",
        "counts[w] = counts.get(w, 0) + 1",
      ],
      3,
      ".get(w, 0) returns 0 for a missing key, so the first occurrence creates the key with a count of 1. The unchecked version raises KeyError; the others are not valid Python."
    ),
    q(
      "python-p6",
      "What does the comprehension [x * 2 for x in [1, 2, 3, 4] if x > 2] evaluate to?",
      [
        "[6, 8]",
        "[2, 4]",
        "[1, 2, 3, 4]",
        "[2, 4, 6, 8]",
      ],
      0,
      "The comprehension filters first (x > 2 keeps 3 and 4), then maps (x * 2), giving [6, 8]. Filtering and mapping in one expression is the point of a comprehension."
    ),
    q(
      "python-p7",
      "Why does the course insist on opening files with a with-block, as in with open('data.txt') as f:?",
      [
        "It makes the file read-only for safety",
        "It compresses the file automatically after writing",
        "The file is closed automatically — even if an exception is raised inside the block",
        "It is the only syntax that allows reading more than one line",
      ],
      2,
      "The context manager guarantees cleanup: close() runs on normal exit and on exceptions, so you never leak file handles."
    ),
    q(
      "python-p8",
      "You must store one million product IDs and repeatedly ask, 'is ID X in the collection?' with the fastest average answer. Which structure do you reach for?",
      [
        "A list — index checks are fast",
        "A set — membership checks average constant time, while a list scans element by element",
        "A tuple — tuples are always faster than lists",
        "A string containing comma-separated IDs",
      ],
      1,
      "Sets answer membership in constant average time via hashing; a list scans item by item, which is linear — and a million-element scan per question adds up fast."
    ),
    q(
      "python-p9",
      "In a class definition, what does the self parameter of a method actually receive?",
      [
        "The class itself, shared by all instances",
        "A copy of all arguments passed to __init__",
        "A reference to the parent class",
        "The specific instance the method was called on, so the method can read and update that object's data",
      ],
      3,
      "self is the instance: it is how a method reaches the object's own attributes and state. The class object itself is passed to classmethods, not to self."
    ),
    q(
      "python-p10",
      "Your DataAnalyzer class needs logging behavior. The course teaches two reuse routes — inheritance and composition. Which framing matches when composition is the right choice?",
      [
        "The analyzer IS a logger, so it should inherit from Logger",
        "The analyzer HAS a logger, so it should hold a Logger instance as an attribute",
        "Neither — Python forbids storing objects as attributes",
        "Both are always interchangeable, so pick whichever spells fewer characters",
      ],
      1,
      "Composition models has-a (the analyzer uses a logger); inheritance models is-a. Choosing with the has-a/is-a test keeps class hierarchies honest."
    ),
  ],

  sql: [
    q(
      "sql-p1",
      "In a query with GROUP BY, which clause filters the groups after aggregation?",
      [
        "WHERE",
        "HAVING",
        "ORDER BY",
        "LIMIT",
      ],
      1,
      "WHERE filters raw rows before grouping; HAVING filters the grouped results — for example, HAVING COUNT(*) > 5 keeps only the busy groups."
    ),
    q(
      "sql-p2",
      "Compared to an INNER JOIN, what does a LEFT JOIN guarantee?",
      [
        "Every row of the right table appears, matched or not",
        "Only rows present in both tables appear",
        "Every row of the left table appears, with NULLs where the right table had no match",
        "Both tables are sorted by the join key before matching",
      ],
      2,
      "LEFT JOIN keeps all left rows; unmatched ones survive with NULLs on the right side. Dropping those unmatched rows is precisely what INNER JOIN does."
    ),
    q(
      "sql-p3",
      "Inside a transaction, what does COMMIT do?",
      [
        "Rolls the changes back to the last savepoint",
        "Opens a new transaction inside the current one",
        "Deletes the transaction log",
        "Makes all the transaction's changes permanent and visible to others",
      ],
      3,
      "COMMIT ends the transaction by making all its changes permanent; ROLLBACK discards them. Between BEGIN and COMMIT the all-or-nothing guarantee holds."
    ),
    q(
      "sql-p4",
      "Which query shape finds customers who have never placed an order (the anti-join pattern)?",
      [
        "SELECT c.* FROM customers c INNER JOIN orders o ON c.id = o.customer_id",
        "SELECT c.* FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.customer_id IS NULL",
        "SELECT c.* FROM customers c GROUP BY c.id HAVING COUNT(*) = 0",
        "SELECT c.* FROM customers c UNION SELECT c.* FROM orders o",
      ],
      1,
      "The LEFT JOIN keeps every customer; the IS NULL check on the join key keeps exactly those with no matching order. GROUP BY cannot return groups with zero rows here, and UNION only stacks."
    ),
    q(
      "sql-p5",
      "A junior extends SELECT department, AVG(salary) FROM employees GROUP BY department to also show first_name, and the database rejects it. Why?",
      [
        "AVG cannot be combined with GROUP BY",
        "Salaries cannot be averaged in a grouped query",
        "first_name is neither in GROUP BY nor inside an aggregate, so the database cannot choose which of its many values to show for the group",
        "HAVING requires a subquery whenever columns are added",
      ],
      2,
      "Every selected column must appear in GROUP BY or inside an aggregate — a group has many first_names but only one output row. This is the classic grouping mistake the course dissects."
    ),
    q(
      "sql-p6",
      "To compute a running total of revenue over time while keeping every order row visible, the course's tool is:",
      [
        "SUM(revenue) OVER (ORDER BY order_date) — a window that accumulates while keeping every row",
        "SUM(revenue) with GROUP BY order_date — one collapsed row per date",
        "A self-join of the orders table on order_date",
        "COUNT(*) with a HAVING clause",
      ],
      0,
      "OVER turns the aggregate into a window function: each row gets the sum of all rows up to it, without collapsing. GROUP BY would throw away the individual rows."
    ),
    q(
      "sql-p7",
      "The task: 'top 3 products by revenue within each region.' Which window-function shape does the course teach for top-N per group?",
      [
        "ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC), then keep rows numbered 1 through 3",
        "RANK() OVER (ORDER BY revenue DESC) with a global LIMIT 3",
        "NTILE(3) OVER (PARTITION BY product)",
        "LAG(revenue, 3) OVER (ORDER BY region)",
      ],
      0,
      "PARTITION BY region restarts the numbering per region and ORDER BY revenue DESC puts the biggest first, so keeping numbers 1-3 yields the per-group top-N. A global LIMIT 3 would return only three rows overall."
    ),
    q(
      "sql-p8",
      "You join customers (100 rows) to orders and the result has 350 rows, so COUNT(*) now exceeds the number of customers. The course's explanation is:",
      [
        "The join silently invented new customers",
        "A one-to-many join duplicates each customer row once per matching order — aggregate orders in a subquery first, or count DISTINCT customers",
        "JOINs must always be followed by LIMIT to stay honest",
        "The customers table must contain duplicates by design",
      ],
      1,
      "Row multiplication: each customer appears once per order, so counting joined rows counts orders, not customers. Either aggregate the orders in a subquery or CTE, or count DISTINCT keys."
    ),
    q(
      "sql-p9",
      "EXPLAIN shows your filtered query doing a full scan of a ten-million-row table; the WHERE clause filters on status. The course's fix is to:",
      [
        "Add an index on the status column so the database can seek matching rows instead of scanning",
        "Rewrite the table with fewer columns",
        "Move the database to a smaller machine so scans finish faster",
        "Add a HAVING clause to filter the scan",
      ],
      0,
      "A matching index turns the scan into a seek for the rows you actually need — and EXPLAIN, read again after the change, is how you verify it helped."
    ),
    q(
      "sql-p10",
      "You must stack this month's and last month's active-customer rows into one result. Customer IDs are unique within each month's query, so duplicates across the two sets are impossible. UNION or UNION ALL?",
      [
        "UNION — deduplication is always safer",
        "UNION ALL — it skips the deduplication pass, which matters on large results, and duplicates are impossible here anyway",
        "Neither — stacked results require a JOIN",
        "UNION ALL, but only after sorting both inputs by hand",
      ],
      1,
      "UNION deduplicates, which costs an extra pass; UNION ALL simply stacks. When rows are known-unique — or duplicates are wanted — UNION ALL is the honest, cheaper choice."
    ),
  ],

  "git-github": [
    q(
      "git-github-p1",
      "In Git's three zones — working directory, staging area, and history — what does git add do?",
      [
        "Moves changes from the working directory into the staging area, preparing them for the next commit",
        "Saves a permanent snapshot into history immediately",
        "Uploads the working directory to GitHub",
        "Deletes unstaged changes to keep the tree clean",
      ],
      0,
      "git add stages: it records the current content of the named files in the staging area, which the next git commit then snapshots into history."
    ),
    q(
      "git-github-p2",
      "A merge conflict occurs when:",
      [
        "A repository exceeds its size limit",
        "Two people clone the repository in the same minute",
        "Two branches modified the same lines of the same file, so Git cannot auto-decide which version survives",
        "A commit message contains special characters",
      ],
      2,
      "Overlapping edits to the same lines leave Git unable to merge automatically; it marks the conflict in the file and asks you to choose or combine both sides."
    ),
    q(
      "git-github-p3",
      "What is the difference between clone and fork, as taught?",
      [
        "clone is for text files; fork is for images",
        "clone copies the repository to your machine; fork creates your own server-side copy on GitHub, from which you can propose changes upstream",
        "They are synonyms — Git treats them identically",
        "fork works only on your own repositories; clone works only on other people's",
      ],
      1,
      "clone is a local copy operation; fork is a hosting-level copy under your account. The open-source path is fork, clone your fork, patch, then pull request."
    ),
    q(
      "git-github-p4",
      "You committed two minutes ago, forgot one file, and have not pushed. The course's recommended repair is:",
      [
        "git reset --hard, then re-create the repository",
        "Push immediately and rewrite history afterward",
        "Create a second repository for the forgotten file",
        "Stage the file with git add, then run git commit --amend to fold it into the previous commit",
      ],
      3,
      "amend folds staged changes into the previous commit. It is safe before pushing; rewriting already-published history is exactly what you must never do."
    ),
    q(
      "git-github-p5",
      "A bad commit is already public on the team's shared branch. The public-safe undo taught in the course is:",
      [
        "git revert <commit>, which creates a new commit that undoes the change",
        "git reset --hard <previous commit> followed by a force-push",
        "Deleting the commit through the hosting platform's web interface",
        "Renaming the branch and hoping nobody pulls it",
      ],
      0,
      "revert adds a new commit canceling the old one — history stays intact, so teammates' work is never orphaned. Reset plus force-push rewrites shared history and breaks other clones."
    ),
    q(
      "git-github-p6",
      "You run git merge feature while on main, and main has had no commits since feature branched off. Git performs a fast-forward merge, which means:",
      [
        "A merge commit with two parents is always created",
        "main simply moves its pointer to the branch tip — no merge commit, because history is already linear",
        "The feature branch is deleted without merging",
        "The merge fails until both branches are rebased",
      ],
      1,
      "When the target branch has no diverging commits, Git fast-forwards the pointer: the same history, now reachable from main, with no extra merge commit."
    ),
    q(
      "git-github-p7",
      "Put the standard team collaboration flow, as taught, in order:",
      [
        "Merge, commit, push, branch, open pull request",
        "Push to main directly, then open an issue describing the push",
        "Branch, commit, push the branch, open a pull request, review, merge",
        "Commit on main, pull, request review by email",
      ],
      2,
      "Work happens on branches and enters shared history through reviewed pull requests — direct commits to main are what the workflow exists to prevent."
    ),
    q(
      "git-github-p8",
      "A teammate proposes git reset --hard to undo a commit on the shared main branch, followed by a force-push. Your course-grounded objection is:",
      [
        "reset is fine as long as the message is polite",
        "Rewriting published history orphans commits teammates already pulled — revert achieves the undo without changing what others depend on",
        "Force-pushes are harmless because servers reject them anyway",
        "Only repository admins can run reset, so it is always safe",
      ],
      1,
      "Public history is a shared contract. reset --hard plus force-push rewrites it and strands anyone who built on the old commits; revert undoes safely inside a new commit."
    ),
    q(
      "git-github-p9",
      "A file shows conflict markers: <<<<<<< HEAD, =======, >>>>>>> feature. The correct resolution process, per the course:",
      [
        "Delete the entire file and re-create it from memory",
        "Keep the version after the >>>>>>> marker, since feature branches always win",
        "Edit the file to the content you actually want — choosing or combining both sides — remove every marker, then git add the file and commit the merge",
        "Commit with the markers left in; Git cleans them up at push time",
      ],
      2,
      "The markers show both versions; you decide the true content, strip all markers, stage the resolved file, and commit the merge. Neither side wins automatically."
    ),
    q(
      "git-github-p10",
      "Which branch name and description best follows the conventions taught in the course?",
      [
        "branch1 with no description — the work speaks for itself",
        "final2-real, described as 'stuff'",
        "add-csv-export, described as 'Add CSV export to the monthly report script'",
        "x, described in a 40-line essay attached to the branch name",
      ],
      2,
      "Branches read best short, kebab-cased, and imperative — naming the change they will deliver — so teammates and future-you can tell what they contain at a glance."
    ),
  ],

  "jupyter-notebook": [
    q(
      "jupyter-notebook-p1",
      "In a Jupyter notebook, where do your variables live while you work?",
      [
        "In each code cell, destroyed when the cell finishes",
        "In the kernel's memory, shared across all cells, surviving until the kernel restarts or shuts down",
        "In the .ipynb file itself, reloaded from disk on every keystroke",
        "In the browser's local storage",
      ],
      1,
      "The kernel is the running Python process holding all state; cells are just messages to it. Restarting the kernel wipes every variable clean."
    ),
    q(
      "jupyter-notebook-p2",
      "The execution counter shown next to each code cell (In [7]) tells you:",
      [
        "The cell's position in the file from top to bottom",
        "The total memory used by the kernel",
        "The order in which cells were last run — which may differ from their position in the file",
        "How many times the notebook has been exported",
      ],
      2,
      "The counter is a run-order history: seeing In [5] above In [3] is the warning that the file's top-to-bottom order is not the state you are in."
    ),
    q(
      "jupyter-notebook-p3",
      "Before sharing a notebook, the course's reproducibility test is:",
      [
        "Restart & Run All — the notebook must reproduce its results from a clean kernel, top to bottom",
        "Saving the file twice to be sure",
        "Running only the last cell, which contains the conclusion",
        "Exporting to PDF and reading it once",
      ],
      0,
      "Restart & Run All simulates your reader: a fresh kernel executing the file in order. If it errors or produces different numbers, the notebook is not yet shareable."
    ),
    q(
      "jupyter-notebook-p4",
      "A notebook 'works' for you, but a colleague's run crashes at cell 5 — cell 12 quietly defines a variable that cell 5 uses. The course's diagnosis and fix:",
      [
        "A hidden-state dependency: restructure so the notebook runs top to bottom from a restart, verified with Restart & Run All",
        "Ask your colleague to run the cells in your secret order",
        "Add the variable's definition to cell 13 as well, just in case",
        "Convert every cell into a Python script and delete the notebook",
      ],
      0,
      "State leaks: the variable was defined later in the file but earlier in your personal run order. Run-order integrity means the file works top to bottom from a clean kernel."
    ),
    q(
      "jupyter-notebook-p5",
      "Which markdown cell content produces a second-level heading followed by a bullet item?",
      [
        "A line starting with 'h2.' followed by a line starting with '*' (wiki-style markup)",
        "Bold text on one line followed by an italic line — headings are not supported in markdown cells",
        "A line starting with '##' followed by a line starting with '-' (a level-2 heading and a bullet item)",
        "An HTML table wrapping the heading and the item",
      ],
      2,
      "Markdown cells render '##' as a level-2 heading and a leading '-' as a bullet — this is how notebooks narrate themselves between code cells."
    ),
    q(
      "jupyter-notebook-p6",
      "You re-run cell 3 after changing a filter, but the chart in cell 7 still shows the old data. The most likely cause, per the course:",
      [
        "Matplotlib caches images in the browser",
        "Cell 7 has not been re-run, so it still displays output produced with the old cell-3 state — re-run the cells downstream of your change",
        "The kernel rolled back your change automatically",
        "The chart is stored in notebook metadata and needs an export",
      ],
      1,
      "Outputs are snapshots from the moment their cell last ran. After editing anything, every downstream cell must be re-executed — or better, restart and run all."
    ),
    q(
      "jupyter-notebook-p7",
      "A stakeholder needs your analysis but has no Python environment. The course's sharing route is:",
      [
        "Email them the .ipynb file and a link to install Anaconda",
        "Print the notebook and mail it",
        "Give them SSH access to the machine running your kernel",
        "Export the notebook to HTML with nbconvert and send the single self-contained document",
      ],
      3,
      "nbconvert turns the executed notebook into a self-contained HTML document anyone can open — no installation, no kernel, no setup for your reader."
    ),
    q(
      "jupyter-notebook-p8",
      "Your teammate's notebook produces different results on their machine than on yours — same file, same data. The course's first debugging move:",
      [
        "Reinstall Jupyter on both machines before investigating",
        "Restart & Run All on both machines to eliminate hidden state — if the difference persists, compare environment versions next",
        "Trust whichever machine produced the results you needed",
        "Delete the outputs on your machine and paste in theirs",
      ],
      1,
      "Stale kernels and secret run orders explain most 'different results' mysteries. A clean top-to-bottom run either resolves it or proves the difference is environmental."
    ),
    q(
      "jupyter-notebook-p9",
      "Which notebook would the course's Best Practices Checklist score as ready to publish?",
      [
        "One whose outputs came from a run two weeks ago, named untitled42.ipynb",
        "One where all conclusions are in the filename because no markdown was used",
        "One with a clear name, markdown narration between every code cell, no leftover debug cells, that passes Restart & Run All",
        "One containing every experiment you tried that week, in the order you tried it",
      ],
      2,
      "Publishable means reproducible: clean naming, narration, pruned experiments, and a passing clean-kernel run. History belongs in version control, not in the deliverable."
    ),
    q(
      "jupyter-notebook-p10",
      "Mid-analysis, you realize you mutated a shared dataframe across twelve cells and the mutation was wrong. The course-grounded judgment:",
      [
        "Restart the kernel and re-run from the top with the corrected logic — kernels have no reliable undo for accumulated state",
        "Keep mutating — cells run fast, so it does not matter",
        "Comment out the wrong cell and hope no reader runs it",
        "Trust the kernel's infinite undo history",
      ],
      0,
      "Kernels do not reliably rewind accumulated state. The honest reset is restart and re-run — the same discipline that keeps shared notebooks trustworthy."
    ),
  ],

  "programming-fundamentals": [
    q(
      "programming-fundamentals-p1",
      "Stack versus queue: which removal discipline does each enforce?",
      [
        "Stack: first-in, first-out; Queue: last-in, first-out",
        "Stack: last-in, first-out; Queue: first-in, first-out",
        "Both remove the oldest item first",
        "Both remove a random item, which is why they differ from lists",
      ],
      1,
      "A stack pops the most recently pushed item (LIFO — undo, parsing, backtracking); a queue dequeues the oldest enqueued item (FIFO — scheduling, buffering)."
    ),
    q(
      "programming-fundamentals-p2",
      "In a recursive function, what is the base case's job?",
      [
        "To make the function faster by skipping recursion",
        "To call the function with a smaller input",
        "To stop the recursion — the condition under which the function returns without calling itself",
        "To catch exceptions raised by deep recursion",
      ],
      2,
      "Every recursive call must move toward the base case; without it the call stack grows until the program dies. The recursive case shrinks the problem; the base case ends it."
    ),
    q(
      "programming-fundamentals-p3",
      "In Big-O terms, an algorithm described as O(2n) is usually written O(n). Why?",
      [
        "Big-O only applies to tiny inputs, where constants dominate",
        "The n log n term is assumed to be small",
        "Because 2n is not a whole number of operations",
        "Big-O describes growth as input size increases, and constant factors do not change the growth curve — doubling every element still scales linearly",
      ],
      3,
      "Big-O tracks how cost grows with input size; constant multipliers do not change the shape of the growth curve, so O(2n) and O(n) are the same class."
    ),
    q(
      "programming-fundamentals-p4",
      "You run a = [1, 2], then b = a, then b.append(3). What is a now?",
      [
        "[1, 2] — a was copied when b was assigned",
        "[1, 2, 3] — a and b are two names bound to the same list object",
        "It raises an error, since a list cannot have two names",
        "[1, 2], and b raises an error on append",
      ],
      1,
      "Assignment binds names to objects, it does not copy them. a and b alias one list, so appending through either name is visible through both — the classic mutation surprise."
    ),
    q(
      "programming-fundamentals-p5",
      "Why does a hash table answer 'is this key present?' in constant average time?",
      [
        "It keeps all keys sorted and binary-searches them",
        "The hash function maps the key directly to a bucket, skipping any scan of the other entries",
        "It loads the entire table into CPU cache on every query",
        "It stores only the most recently used keys",
      ],
      1,
      "Hashing computes where the key would live instead of searching for it — one hash plus one bucket check on average. Collisions add work, which is why 'average' carries fine print."
    ),
    q(
      "programming-fundamentals-p6",
      "What precondition must hold before binary search works, as taught?",
      [
        "The input must be sorted",
        "The input must contain no duplicates",
        "The input must be a linked list",
        "The target must be near the middle",
      ],
      0,
      "Binary search halves the search space by comparing against the middle element, which only tells you which half to keep if the data is in order."
    ),
    q(
      "programming-fundamentals-p7",
      "Selection sort and insertion sort are quadratic. Which growth class does merge sort belong to?",
      [
        "O(n^2), like the simple sorts",
        "O(n log n): divide the list, sort the halves, merge them back",
        "O(1): merging requires no comparisons",
        "O(n!): it tries every ordering",
      ],
      1,
      "Merge sort splits until pieces are trivial, then merges in linear work per level across about log n levels — the divide-and-conquer breakthrough over the quadratic simple sorts."
    ),
    q(
      "programming-fundamentals-p8",
      "You are building an editor's undo feature: each action pushes a record; undo reverses the most recent action. Which structure fits, and why?",
      [
        "A queue — undo should reverse the oldest action first",
        "A hash table — actions hash to their undo functions",
        "A stack — undo must reverse the most recent action first, exactly last-in first-out",
        "A sorted array — undo is a binary-search problem",
      ],
      2,
      "Undo semantics are last-in, first-out: the newest action must be the first undone. That is a stack's defining discipline — the same reason parsing and backtracking use stacks."
    ),
    q(
      "programming-fundamentals-p9",
      "Which of these is quadratic — O(n^2) — in the average case, as taught?",
      [
        "Selection sort, scanning the remaining unsorted region for every placement across the whole list",
        "Binary search on a sorted list",
        "Hash-table lookup",
        "A single pass that finds the maximum",
      ],
      0,
      "Selection sort does roughly n passes over n elements — quadratic. Binary search is logarithmic, hash lookup constant on average, and max-finding linear."
    ),
    q(
      "programming-fundamentals-p10",
      "You find a 60-line function that loads a file, parses it, computes three statistics, and prints a report. The course's design judgment:",
      [
        "It is fine — long functions are normal in data code",
        "Make it longer — consolidating saves lines",
        "Delete the function and inline everything in a loop",
        "It violates single responsibility: split it into load, parse, compute, and report functions with clear contracts, each testable on its own",
      ],
      3,
      "One function, one job. Decomposing into single-responsibility functions yields testable units and signatures a caller can trust — the design module's core lesson."
    ),
  ],
};
